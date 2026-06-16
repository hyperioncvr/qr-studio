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

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}

console.log(`Audit passed: ${localeFiles.length} locales, ${allLocaleKeys.size} i18n keys, ${cachedAssets.length} cached assets.`);
