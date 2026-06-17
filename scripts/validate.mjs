import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const errors = [];

const read = (file) => fs.readFileSync(path.join(root, file), "utf8");
const exists = (file) => fs.existsSync(path.join(root, file));

const parseJson = (file) => {
  try {
    return JSON.parse(read(file));
  } catch (error) {
    errors.push(`${file}: invalid JSON (${error.message})`);
    return null;
  }
};

const walk = (dir, files = []) => {
  for (const entry of fs.readdirSync(path.join(root, dir), { withFileTypes: true })) {
    const rel = path.join(dir, entry.name).replace(/\\/g, "/");
    if (entry.name === ".git" || entry.name === "node_modules") continue;
    if (entry.isDirectory()) walk(rel, files);
    if (entry.isFile()) files.push(rel);
  }
  return files;
};

const localeFiles = fs.readdirSync(path.join(root, "locales"))
  .filter((file) => file.endsWith(".json"))
  .sort();
const locales = Object.fromEntries(localeFiles.map((file) => [file, parseJson(`locales/${file}`)]));
const allLocaleKeys = new Set(Object.values(locales).flatMap((locale) => Object.keys(locale || {})));

for (const [file, locale] of Object.entries(locales)) {
  if (!locale) continue;
  for (const key of allLocaleKeys) {
    if (!(key in locale)) errors.push(`locales/${file}: missing key "${key}"`);
  }
}

parseJson("manifest.json");

const html = read("index.html");
const script = read("script.js");
const usedI18nKeys = new Set([
  ...html.matchAll(/data-i18n(?:-placeholder)?="([^"]+)"/g),
  ...script.matchAll(/\bt\("([^"]+)"\)/g)
].map((match) => match[1]));

for (const key of usedI18nKeys) {
  if (!allLocaleKeys.has(key)) errors.push(`i18n: used key "${key}" is missing from locales`);
}

const files = new Set(walk(".").map((file) => file.replace(/^\.\//, "")));
const sw = read("sw.js");
const cachedAssets = [...sw.matchAll(/['"]\.\/([^'"]*)['"]/g)]
  .map((match) => match[1])
  .filter(Boolean);

for (const asset of cachedAssets) {
  if (!files.has(asset)) errors.push(`sw.js: cached asset "${asset}" does not exist`);
}

const htmlRefs = [
  ...html.matchAll(/\b(?:src|href)="(?:\.\/)?([^"#:?]+)"/g)
].map((match) => match[1])
  .filter((ref) => /\.(css|js|json|png)$/.test(ref));

for (const ref of htmlRefs) {
  if (!exists(ref)) errors.push(`index.html: referenced asset "${ref}" does not exist`);
}

const jsFiles = [...files].filter((file) =>
  /\.(mjs|js)$/.test(file) && !file.startsWith("vendor/")
);

for (const file of jsFiles) {
  const dir = path.posix.dirname(file);
  const source = read(file);
  const imports = [...source.matchAll(/\bfrom\s+["'](\.[^"']+)["']/g)].map((match) => match[1]);
  for (const importPath of imports) {
    const resolved = path.posix.normalize(path.posix.join(dir, importPath));
    if (!files.has(resolved)) errors.push(`${file}: import "${importPath}" does not exist`);
  }
}

const hexToRgb = (hex) => {
  const value = hex.replace("#", "");
  if (!/^[0-9a-f]{6}$/i.test(value)) return null;
  return [
    parseInt(value.slice(0, 2), 16),
    parseInt(value.slice(2, 4), 16),
    parseInt(value.slice(4, 6), 16)
  ];
};

const relativeLuminance = (hex) => {
  const rgb = hexToRgb(hex);
  if (!rgb) return null;
  const normalized = rgb.map((channel) => {
    const value = channel / 255;
    return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  });
  return normalized[0] * 0.2126 + normalized[1] * 0.7152 + normalized[2] * 0.0722;
};

const contrastRatio = (foreground, background) => {
  const fg = relativeLuminance(foreground);
  const bg = relativeLuminance(background);
  if (fg === null || bg === null) return null;
  const lighter = Math.max(fg, bg);
  const darker = Math.min(fg, bg);
  return (lighter + 0.05) / (darker + 0.05);
};

const presetBlocks = [...script.matchAll(/^\s{4}(\w+):\s*\{([^}]+)\}/gm)];
for (const [, name, block] of presetBlocks) {
  const values = Object.fromEntries([...block.matchAll(/(\w+):\s*"([^"]+)"/g)].map((match) => [match[1], match[2]]));
  if (!values.dot || !values.dot2 || !values.bg) continue;

  const dotContrast = contrastRatio(values.dot, values.bg);
  const dot2Contrast = contrastRatio(values.dot2, values.bg);
  if (dotContrast !== null && dotContrast < 4.5) {
    errors.push(`preset "${name}": main color contrast is too low (${dotContrast.toFixed(2)}:1)`);
  }
  if (dot2Contrast !== null && dot2Contrast < 4.5) {
    errors.push(`preset "${name}": secondary color contrast is too low (${dot2Contrast.toFixed(2)}:1)`);
  }
  if (relativeLuminance(values.dot) !== null && relativeLuminance(values.bg) !== null && relativeLuminance(values.dot) >= relativeLuminance(values.bg)) {
    errors.push(`preset "${name}": modules must stay darker than background`);
  }
}

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}

console.log(`Validation passed: ${localeFiles.length} locales, ${allLocaleKeys.size} i18n keys, ${cachedAssets.length} cached assets.`);
