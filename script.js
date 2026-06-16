let qrCode;

// ─── i18n State & Dynamic Loading ──────────────────────────
const DEFAULT_LANGUAGE = "en";
const SUPPORTED_LANGUAGES = ["es", "en", "zh", "ar", "ru", "de", "it", "pl", "pt", "fr", "ja", "ko"];
const activeTranslations = {};

const renderTrustedPrivacyNotice = (elem, value) => {
    const match = String(value).match(/^<strong>(.*?)<\/strong>\s*(.*)$/);
    elem.replaceChildren();
    if (!match) {
        elem.textContent = value;
        return;
    }
    const strong = document.createElement("strong");
    strong.textContent = match[1];
    elem.appendChild(strong);
    elem.append(` ${match[2]}`);
};

// Translation helper to get keys synchronously from loaded language
const t = (key) => {
    const currentLang = localStorage.getItem("qr_studio_lang") || DEFAULT_LANGUAGE;
    return (activeTranslations[currentLang] || {})[key]
        || (activeTranslations[DEFAULT_LANGUAGE] || {})[key]
        || "";
};

const setLanguage = async (lang) => {
    if (!SUPPORTED_LANGUAGES.includes(lang)) return;
    
    // Save language setting
    localStorage.setItem("qr_studio_lang", lang);
    
    // Update dropdown selection
    const langSelect = document.getElementById("lang-select");
    if (langSelect) langSelect.value = lang;

    // Sync semantic html lang tag and direction (RTL for Arabic)
    document.documentElement.lang = lang;
    document.documentElement.dir = (lang === "ar") ? "rtl" : "ltr";

    // Dynamically fetch translations if not loaded yet
    if (!activeTranslations[lang]) {
        try {
            const response = await fetch(`./locales/${lang}.json`);
            if (!response.ok) throw new Error(`Could not load locale: ${lang}`);
            activeTranslations[lang] = await response.json();
        } catch (err) {
            console.error("Error loading localization file:", err);
            // Fallback to English if load fails
            if (lang !== "en") {
                await setLanguage("en");
            }
            return;
        }
    }

    if (lang !== DEFAULT_LANGUAGE && !activeTranslations[DEFAULT_LANGUAGE]) {
        try {
            const fallbackResponse = await fetch(`./locales/${DEFAULT_LANGUAGE}.json`);
            if (fallbackResponse.ok) {
                activeTranslations[DEFAULT_LANGUAGE] = await fallbackResponse.json();
            }
        } catch (err) {
            console.warn("Could not load fallback locale:", err);
        }
    }

    const trans = activeTranslations[lang];
    const fallbackTrans = activeTranslations[DEFAULT_LANGUAGE] || {};
    const translate = (key) => trans[key] || fallbackTrans[key] || "";

    // Update dynamic header metadata for localized SEO
    const pageTitle = `QR Studio — ${translate("subtitle") || "QR Gratis"}`;
    document.title = pageTitle;

    const ogTitleMeta = document.querySelector('meta[property="og:title"]');
    if (ogTitleMeta) ogTitleMeta.setAttribute("content", pageTitle);

    const twitterTitleMeta = document.querySelector('meta[property="twitter:title"]');
    if (twitterTitleMeta) twitterTitleMeta.setAttribute("content", pageTitle);

    if (translate("meta-description")) {
        const descMeta = document.querySelector('meta[name="description"]');
        if (descMeta) descMeta.setAttribute("content", translate("meta-description"));

        const ogDescMeta = document.querySelector('meta[property="og:description"]');
        if (ogDescMeta) ogDescMeta.setAttribute("content", translate("meta-description"));

        const twitterDescMeta = document.querySelector('meta[property="twitter:description"]');
        if (twitterDescMeta) twitterDescMeta.setAttribute("content", translate("meta-description"));
    }

    // Update simple text elements
    document.querySelectorAll("[data-i18n]").forEach(elem => {
        const key = elem.getAttribute("data-i18n");
        const value = translate(key);
        if (value) {
            if (key === "footer-privacy" || key === "footer-privacy-notice") {
                renderTrustedPrivacyNotice(elem, value);
            } else {
                elem.textContent = value;
            }
        }
    });

    // Update placeholder elements
    document.querySelectorAll("[data-i18n-placeholder]").forEach(elem => {
        const key = elem.getAttribute("data-i18n-placeholder");
        const value = translate(key);
        if (value) {
            elem.setAttribute("placeholder", value);
        }
    });

    // Re-trigger layout or values that are multi-language and calculated (like logo-size text template)
    const logoSizeText = document.querySelector('label[for="logo-size"] span[data-i18n="label-logo-size"]');
    if (logoSizeText) {
        logoSizeText.textContent = translate("label-logo-size");
    }

    // Update toggle preset button dynamically if language is changed
    const presetsGroup = document.getElementById("presets-container-group");
    const presetsToggleBtn = document.getElementById("presets-toggle-btn");
    if (presetsGroup && presetsToggleBtn) {
        const isMinimized = presetsGroup.classList.contains("minimized-presets");
        presetsToggleBtn.textContent = translate(isMinimized ? "presets-show-more" : "presets-show-less");
    }

    // Update scan instructions / history texts
    renderHistory();
};

const detectLanguage = () => {
    // 1. URL Query Parameter (highest priority for crawler-friendly multi-language indexing)
    const urlParams = new URLSearchParams(window.location.search);
    const langParam = urlParams.get("lang");
    if (langParam && SUPPORTED_LANGUAGES.includes(langParam)) {
        localStorage.setItem("qr_studio_lang", langParam);
        return langParam;
    }

    // 2. LocalStorage
    const savedLang = localStorage.getItem("qr_studio_lang");
    if (savedLang && SUPPORTED_LANGUAGES.includes(savedLang)) return savedLang;

    // 3. Browser Languages
    const browserLangs = navigator.languages || [navigator.language];
    for (const browserLang of browserLangs) {
        const short = browserLang.split("-")[0].toLowerCase();
        if (SUPPORTED_LANGUAGES.includes(short)) return short;
    }

    // 4. Default
    return "en";
};

// Elements
const qrElement = document.getElementById("qrcode");
const urlInput = document.getElementById("url-input");

// Dot elements
const dotColorInput = document.getElementById("dot-color");
const dotColor2Input = document.getElementById("dot-color-2");
const dotGradientType = document.getElementById("dot-gradient-type");
const dotStyleInput = document.getElementById("dot-style");

// Bg elements
const bgColorInput = document.getElementById("bg-color");
const bgTransparentInput = document.getElementById("bg-transparent");
const bgImageFileInput = document.getElementById("bg-image-file");
const clearBgImageBtn = document.getElementById("clear-bg-image");

// Corner elements
const cornerSquareStyle = document.getElementById("corner-square-style");
const cornerDotStyle = document.getElementById("corner-dot-style");
const cornerColorInput = document.getElementById("corner-color");

// Logo elements
const logoFileInput = document.getElementById("logo-file");
const logoSizeInput = document.getElementById("logo-size");
const logoSizeVal = document.getElementById("logo-size-val");
const hideLogoDots = document.getElementById("hide-logo-dots");
const clearLogoBtn = document.getElementById("clear-logo");
const fileLabel = document.getElementById("file-label");

// Hex display elements
const dotColorHex = document.getElementById("dot-color-hex");
const dotColor2Hex = document.getElementById("dot-color-2-hex");
const bgColorHex = document.getElementById("bg-color-hex");

// State
let currentLogo = "";
let currentBgImage = "";
let debounceTimer;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const QR_PREVIEW_SIZE = 720;
const PRESET_SWATCH_SIZE = 120;
const MAX_HISTORY_ITEMS = 15;
const presetSwatchUrls = [];
let previewRenderId = 0;

const getQrMargin = (size) => Math.max(16, Math.round(size * 0.08));
const getPresetQrMargin = (size) => Math.max(4, Math.round(size * 0.08));

const revokePresetSwatchUrls = () => {
    while (presetSwatchUrls.length) {
        URL.revokeObjectURL(presetSwatchUrls.pop());
    }
};

// Tab Logic
const tabs = document.querySelectorAll('.tab-btn');
const sections = document.querySelectorAll('.control-section');

const activateTab = (targetTab) => {
    tabs.forEach(tab => {
        const isActive = tab === targetTab;
        tab.classList.toggle('active', isActive);
        tab.setAttribute("aria-selected", String(isActive));
    });

    sections.forEach(section => {
        const isActive = section.id === `tab-${targetTab.dataset.tab}`;
        section.classList.toggle('active', isActive);
        section.hidden = !isActive;
    });
};

tabs.forEach(tab => {
    tab.addEventListener('click', () => {
        // Stop camera if leaving Scanner tab
        if (scanActive && tab.dataset.tab !== 'scan') {
            stopCamera();
        }

        activateTab(tab);
    });
});

const getInputValue = (id) => document.getElementById(id)?.value || "";

const escapeWifiValue = (value) => String(value).replace(/([\\;,:"])/g, "\\$1");

const escapeVCardValue = (value) => String(value)
    .replace(/\\/g, "\\\\")
    .replace(/\n/g, "\\n")
    .replace(/\r/g, "")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,");

const foldVCardLine = (line) => {
    const maxLength = 75;
    if (line.length <= maxLength) return line;
    const chunks = [];
    for (let i = 0; i < line.length; i += maxLength) {
        chunks.push((i === 0 ? "" : " ") + line.slice(i, i + maxLength));
    }
    return chunks.join("\r\n");
};

const parseMailto = (data) => {
    try {
        const url = new URL(data);
        return {
            to: decodeURIComponent(url.pathname || ""),
            subject: url.searchParams.get("subject") || "",
            body: url.searchParams.get("body") || ""
        };
    } catch (err) {
        return { to: data.split("?")[0].replace("mailto:", ""), subject: "", body: "" };
    }
};

// Compiled QR Data Builder
const getCompiledQRData = () => {
    const typeSelect = document.getElementById("content-type-select");
    const type = typeSelect ? typeSelect.value : "url";

    if (type === "url") {
        return urlInput.value || " ";
    } else if (type === "wifi") {
        const ssid = getInputValue("wifi-ssid");
        const pass = getInputValue("wifi-pass");
        const sec = getInputValue("wifi-security") || "nopass";
        return `WIFI:T:${sec};S:${escapeWifiValue(ssid)};P:${escapeWifiValue(pass)};;`;
    } else if (type === "vcard") {
        const fn = getInputValue("vcard-fn");
        const ln = getInputValue("vcard-ln");
        const phone = getInputValue("vcard-phone");
        const email = getInputValue("vcard-email");
        const org = getInputValue("vcard-org");
        const url = getInputValue("vcard-url");
        const fullName = `${fn} ${ln}`.trim();
        return [
            "BEGIN:VCARD",
            "VERSION:3.0",
            `N:${escapeVCardValue(ln)};${escapeVCardValue(fn)};;;`,
            `FN:${escapeVCardValue(fullName)}`,
            `TEL;TYPE=CELL:${escapeVCardValue(phone)}`,
            `EMAIL:${escapeVCardValue(email)}`,
            `ORG:${escapeVCardValue(org)}`,
            `URL:${escapeVCardValue(url)}`,
            "END:VCARD"
        ].map(foldVCardLine).join("\r\n");
    } else if (type === "email") {
        const to = encodeURIComponent(getInputValue("email-to"));
        const subject = getInputValue("email-subject");
        const body = getInputValue("email-body");
        const params = new URLSearchParams();
        if (subject) params.set("subject", subject);
        if (body) params.set("body", body);
        const query = params.toString();
        return `mailto:${to}${query ? `?${query}` : ""}`;
    } else if (type === "sms") {
        const phone = getInputValue("sms-phone");
        const msg = getInputValue("sms-message");
        return `SMSTO:${phone}:${msg}`;
    } else if (type === "phone") {
        const num = getInputValue("phone-number");
        return `tel:${num}`;
    }
    return " ";
};

// Update hex displays
const updateHexDisplays = () => {
    if (dotColorHex) dotColorHex.textContent = dotColorInput.value;
    if (dotColor2Hex) dotColor2Hex.textContent = dotColor2Input.value;
    if (bgColorHex) bgColorHex.textContent = bgColorInput.value;
};

const getQrConfig = (size = QR_PREVIEW_SIZE, renderType = "svg", margin = getQrMargin(size)) => {
    // Toggle class based on style for crisp edges on square modules
    if (dotStyleInput.value === "square") {
        qrElement.classList.add("style-square");
    } else {
        qrElement.classList.remove("style-square");
    }

    // Dot options
    const dotsOptions = {
        type: dotStyleInput.value,
        roundSize: dotStyleInput.value !== "square",
        color: dotColorInput.value,
        gradient: dotGradientType.value !== "none" ? {
            type: dotGradientType.value,
            rotation: 0,
            colorStops: [
                { offset: 0, color: dotColorInput.value },
                { offset: 1, color: dotColor2Input.value }
            ]
        } : null
    };

    // Background options
    const backgroundOptions = {
        color: bgTransparentInput.checked ? "transparent" : bgColorInput.value
    };
    if (currentBgImage && !bgTransparentInput.checked) {
        backgroundOptions.image = currentBgImage;
    }

    return {
        width: size,
        height: size,
        type: renderType,
        margin: margin,
        data: getCompiledQRData() || " ",
        dotsOptions: dotsOptions,
        backgroundOptions: backgroundOptions,
        cornersSquareOptions: {
            type: cornerSquareStyle.value,
            color: cornerColorInput.value
        },
        cornersDotOptions: {
            type: cornerDotStyle.value,
            color: cornerColorInput.value
        },
        image: currentLogo,
        imageOptions: {
            imageSize: parseFloat(logoSizeInput.value),
            hideBackgroundDots: hideLogoDots.checked,
            margin: 5
        }
    };
};

const createQrInstance = (size = QR_PREVIEW_SIZE, renderType = "svg", margin) => {
    return new QRCodeStyling(getQrConfig(size, renderType, margin));
};

const showLocalizedAlert = (key, fallback) => {
    alert(t(key) || fallback);
};

const supportsClipboardImageWrite = () => {
    return typeof ClipboardItem !== "undefined"
        && !!navigator.clipboard
        && typeof navigator.clipboard.write === "function";
};

const supportsClipboardTextWrite = () => {
    return !!navigator.clipboard && typeof navigator.clipboard.writeText === "function";
};

const resetBackgroundImage = () => {
    currentBgImage = "";
    bgImageFileInput.value = "";
};

const ensureNonTransparentBackground = () => {
    if (!bgTransparentInput.checked) return;
    const fallback = getComputedStyle(document.body).backgroundColor || "#ffffff";
    const text = fallback === "rgba(0, 0, 0, 0)" ? "#ffffff" : fallback;
    bgColorInput.value = rgbStringToHex(text);
};

const rgbStringToHex = (rgb) => {
    const match = rgb.match(/rgba?\(([^)]+)\)/i);
    if (!match) return "#ffffff";
    const parts = match[1].split(",").map((p) => parseInt(p.trim(), 10));
    const [r, g, b] = [parts[0] || 255, parts[1] || 255, parts[2] || 255];
    const toHex = (n) => n.toString(16).padStart(2, "0");
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};

const getSvgShapeRendering = () => {
    return dotStyleInput.value === "square" ? "crispEdges" : "geometricPrecision";
};

const expandModuleRects = (svg) => {
    if (dotStyleInput.value !== "square") return;

    const rects = svg.querySelectorAll("rect");
    const overlap = 0.2;

    rects.forEach((rect) => {
        const x = parseFloat(rect.getAttribute("x") || "0");
        const y = parseFloat(rect.getAttribute("y") || "0");
        const width = parseFloat(rect.getAttribute("width") || "0");
        const height = parseFloat(rect.getAttribute("height") || "0");
        const svgWidth = parseFloat(svg.getAttribute("width") || "0");
        const svgHeight = parseFloat(svg.getAttribute("height") || "0");

        if (
            Number.isFinite(svgWidth) && Number.isFinite(svgHeight) &&
            x === 0 && y === 0 && width === svgWidth && height === svgHeight
        ) {
            return;
        }

        if (!Number.isFinite(x) || !Number.isFinite(y) || !Number.isFinite(width) || !Number.isFinite(height)) {
            return;
        }

        rect.setAttribute("x", String(x - overlap));
        rect.setAttribute("y", String(y - overlap));
        rect.setAttribute("width", String(width + overlap * 2));
        rect.setAttribute("height", String(height + overlap * 2));
    });
};

const normalizeSvgText = (svgText) => {
    if (typeof DOMParser === "undefined") return svgText;
    const parser = new DOMParser();
    const doc = parser.parseFromString(svgText, "image/svg+xml");
    const svg = doc.documentElement;
    if (!svg || svg.nodeName.toLowerCase() !== "svg") return svgText;

    if (!svg.getAttribute("xmlns")) {
        svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    }
    if (!svg.getAttribute("viewBox")) {
        const width = parseFloat(svg.getAttribute("width") || "0");
        const height = parseFloat(svg.getAttribute("height") || "0");
        if (Number.isFinite(width) && Number.isFinite(height) && width > 0 && height > 0) {
            svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
        }
    }
    if (!svg.getAttribute("preserveAspectRatio")) {
        svg.setAttribute("preserveAspectRatio", "xMidYMid meet");
    }
    svg.setAttribute("shape-rendering", getSvgShapeRendering());
    expandModuleRects(svg);

    return new XMLSerializer().serializeToString(svg);
};

const getBackgroundColorForQr = () => {
    return bgTransparentInput.checked ? "#ffffff" : bgColorInput.value;
};

const createPreviewSvg = async () => {
    ensureNonTransparentBackground();
    const exportQr = createQrInstance(QR_PREVIEW_SIZE, "svg", getQrMargin(QR_PREVIEW_SIZE));
    const raw = await exportQr.getRawData("svg");
    return normalizeSvgText(await raw.text());
};

const renderPreview = async () => {
    const renderId = ++previewRenderId;
    const svgText = await createPreviewSvg();
    if (renderId !== previewRenderId) return;
    qrElement.replaceChildren();
    const template = document.createElement("template");
    template.innerHTML = svgText.trim();
    qrElement.appendChild(template.content);
};

// Update function
const updateQR = () => {
    renderPreview().catch((err) => {
        console.error("QR preview error:", err);
        qrElement.replaceChildren();
        const error = document.createElement("p");
        error.className = "qr-error";
        error.textContent = t("qr-render-error") || "Could not render this QR code.";
        qrElement.appendChild(error);
    });

    const qrWrapper = document.querySelector('.qr-wrapper');
    if (qrWrapper) {
        if (bgTransparentInput.checked) {
            qrWrapper.style.backgroundColor = "transparent";
        } else {
            qrWrapper.style.backgroundColor = bgColorInput.value;
        }
    }

    updateHexDisplays();
    logoSizeVal.textContent = logoSizeInput.value;
};

// Debounced version for high-frequency input events (prevents memory leaks)
const debouncedUpdate = () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(updateQR, 120);
};


// File Upload Logic (Logo)
logoFileInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > MAX_FILE_SIZE) {
        showLocalizedAlert("file-size-error", "El archivo excede el límite de 5 MB.");
        e.target.value = "";
        return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
        currentLogo = event.target.result;
        fileLabel.querySelector('span').textContent = file.name;
        updateQR();
    };
    reader.readAsDataURL(file);
});

// File Upload Logic (Background)
bgImageFileInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > MAX_FILE_SIZE) {
        showLocalizedAlert("file-size-error", "El archivo excede el límite de 5 MB.");
        e.target.value = "";
        return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
        currentBgImage = event.target.result;
        bgTransparentInput.checked = false;
        updateQR();
    };
    reader.readAsDataURL(file);
});

clearBgImageBtn.addEventListener("click", () => {
    resetBackgroundImage();
    updateQR();
});

clearLogoBtn.addEventListener("click", () => {
    currentLogo = "";
    logoFileInput.value = "";
    fileLabel.querySelector('span').textContent = "Subir Logo";
    updateQR();
});

// ─── Presets ───────────────────────────────────────────
// Each preset is designed for aesthetic, scannable QR output
const presets = {
    // Corporate: Dark slate gradient, rounded modules, clean white bg
    corporate: {
        dot: "#1e293b", dot2: "#334155", grad: "linear", style: "rounded",
        bg: "#ffffff", trans: false, corner: "#1e293b", sq: "extra-rounded", dt: "dot"
    },
    // Minimal: Pure black, sharp square modules, no gradient
    minimal: {
        dot: "#111827", dot2: "#111827", grad: "none", style: "square",
        bg: "#ffffff", trans: false, corner: "#111827", sq: "square", dt: "square"
    },
    // Midnight: Inverted — white modules on deep navy
    midnight: {
        dot: "#e2e8f0", dot2: "#f8fafc", grad: "linear", style: "rounded",
        bg: "#0f172a", trans: false, corner: "#e2e8f0", sq: "extra-rounded", dt: "dot"
    },
    // Sage: Soft green botanical palette, extra-rounded
    sage: {
        dot: "#166534", dot2: "#15803d", grad: "linear", style: "extra-rounded",
        bg: "#f0fdf4", trans: false, corner: "#166534", sq: "extra-rounded", dt: "dot"
    },
    // Ocean: Deep blue gradient, refined rounded modules
    ocean: {
        dot: "#1d4ed8", dot2: "#3b82f6", grad: "linear", style: "rounded",
        bg: "#eff6ff", trans: false, corner: "#1d4ed8", sq: "extra-rounded", dt: "dot"
    },
    // Rosé: Warm rose tones, elegant classy modules
    rose: {
        dot: "#be123c", dot2: "#e11d48", grad: "linear", style: "classy",
        bg: "#fff1f2", trans: false, corner: "#be123c", sq: "extra-rounded", dt: "dot"
    },
    // Sunset: Warm amber-to-orange, dots style for a distinctive look
    sunset: {
        dot: "#c2410c", dot2: "#ea580c", grad: "linear", style: "dots",
        bg: "#fff7ed", trans: false, corner: "#c2410c", sq: "extra-rounded", dt: "dot"
    },
    // Slate: Neutral grey, extra-rounded — professional versatile
    slate: {
        dot: "#475569", dot2: "#64748b", grad: "linear", style: "extra-rounded",
        bg: "#f8fafc", trans: false, corner: "#475569", sq: "extra-rounded", dt: "dot"
    },
    // Noir: White modules on true black — high contrast editorial
    noir: {
        dot: "#fafafa", dot2: "#e5e5e5", grad: "linear", style: "classy",
        bg: "#0a0a0a", trans: false, corner: "#fafafa", sq: "extra-rounded", dt: "dot"
    }
};

const buildPresetQrConfig = (preset, size = PRESET_SWATCH_SIZE, renderType = "canvas") => ({
    width: size,
    height: size,
    type: renderType,
    margin: getPresetQrMargin(size),
    data: "https://hypstudio.cl",
    dotsOptions: {
        type: preset.style,
        roundSize: preset.style !== "square",
        color: preset.dot,
        gradient: preset.grad !== "none" ? {
            type: preset.grad,
            rotation: 0,
            colorStops: [
                { offset: 0, color: preset.dot },
                { offset: 1, color: preset.dot2 }
            ]
        } : null
    },
    backgroundOptions: {
        color: preset.trans ? "transparent" : preset.bg
    },
    cornersSquareOptions: {
        type: preset.sq,
        color: preset.corner
    },
    cornersDotOptions: {
        type: preset.dt,
        color: preset.corner
    },
    image: ""
});

const renderPresetSwatches = async () => {
    revokePresetSwatchUrls();

    document.querySelectorAll('.preset-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    for (const btn of document.querySelectorAll('.preset-btn')) {
        const preset = presets[btn.dataset.preset];
        const swatch = btn.querySelector('.preset-swatch');
        if (!preset || !swatch) continue;

        swatch.replaceChildren();
        try {
            const presetQr = new QRCodeStyling(buildPresetQrConfig(preset, PRESET_SWATCH_SIZE, "canvas"));
            const blob = await presetQr.getRawData("png");
            const url = URL.createObjectURL(blob);
            presetSwatchUrls.push(url);

            const img = document.createElement("img");
            img.src = url;
            img.alt = "";
            img.decoding = "async";
            img.loading = "lazy";
            swatch.appendChild(img);
        } catch (err) {
            console.error("Error rendering preset swatch:", err);
        }
    }
};

void renderPresetSwatches();

const resetPresetAssets = () => {
    currentLogo = "";
    logoFileInput.value = "";
    resetBackgroundImage();
    fileLabel.querySelector('span').textContent = t("btn-upload-logo") || "Subir Logo";
};


document.querySelectorAll('.preset-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        // Remove active state from all
        document.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const p = presets[btn.dataset.preset];
        if (!p) return;

        resetPresetAssets();

        dotColorInput.value = p.dot;
        dotColor2Input.value = p.dot2;
        dotGradientType.value = p.grad;
        dotStyleInput.value = p.style;
        bgColorInput.value = p.bg;
        bgTransparentInput.checked = p.trans;
        cornerColorInput.value = p.corner;
        cornerSquareStyle.value = p.sq;
        cornerDotStyle.value = p.dt;
        updateQR();
    });
});

const syncCornersWithDotStyle = () => {
    const style = dotStyleInput.value;
    if (style === "square") {
        cornerSquareStyle.value = "square";
        cornerDotStyle.value = "square";
        return;
    }
    if (style === "dots") {
        cornerSquareStyle.value = "dot";
        cornerDotStyle.value = "dot";
        return;
    }
    cornerSquareStyle.value = "extra-rounded";
    cornerDotStyle.value = "dot";
};

// Event listeners — use debounced update for high-frequency inputs
[urlInput, dotColorInput, dotColor2Input, bgColorInput, cornerColorInput, logoSizeInput].forEach(input => {
    input.addEventListener("input", debouncedUpdate);
});
// Immediate update for discrete selectors/checkboxes
[dotGradientType, bgTransparentInput, cornerSquareStyle, cornerDotStyle, hideLogoDots].forEach(input => {
    input.addEventListener("input", updateQR);
});
dotStyleInput.addEventListener("input", () => {
    syncCornersWithDotStyle();
    updateQR();
});

// Content Type Dropdown toggle logic
const contentTypeSelect = document.getElementById("content-type-select");
if (contentTypeSelect) {
    contentTypeSelect.addEventListener("change", (e) => {
        const type = e.target.value;
        document.querySelectorAll(".content-subform").forEach(subform => {
            subform.style.display = "none";
        });
        const activeSubform = document.getElementById(`form-${type}`);
        if (activeSubform) {
            activeSubform.style.display = "flex";
        }
        updateQR();
    });
}

// Bind all specialized inputs to debounced updates
const specializedInputs = [
    "wifi-ssid", "wifi-pass", "wifi-security",
    "vcard-fn", "vcard-ln", "vcard-phone", "vcard-email", "vcard-org", "vcard-url",
    "email-to", "email-subject", "email-body",
    "sms-phone", "sms-message",
    "phone-number"
];
specializedInputs.forEach(id => {
    const input = document.getElementById(id);
    if (input) {
        if (input.tagName === "SELECT") {
            input.addEventListener("change", updateQR);
        } else {
            input.addEventListener("input", debouncedUpdate);
        }
    }
});

// Download logic
const getDownloadOptions = (ext) => {
    const resSelect = document.getElementById("download-resolution");
    const res = ext === "png" && resSelect ? parseInt(resSelect.value) : 1200;

    return {
        name: "qr",
        extension: ext,
        width: res,
        height: res
    };
};

const triggerBlobDownload = (blob, filename) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
};

const downloadQr = async (ext) => {
    const options = getDownloadOptions(ext);
    ensureNonTransparentBackground();
    const exportQr = createQrInstance(options.width, "svg", getQrMargin(options.width));
    const rawSvgBlob = await exportQr.getRawData("svg");
    const svgText = normalizeSvgText(await rawSvgBlob.text());
    if (ext === "svg") {
        const blob = new Blob([svgText], { type: "image/svg+xml;charset=utf-8" });
        triggerBlobDownload(blob, `${options.name}.${options.extension}`);
    } else {
        const pngBlob = await rasterizeSvgToPng(svgText, options.width);
        triggerBlobDownload(pngBlob, `${options.name}.${options.extension}`);
    }
    saveToHistory(false);
};

const rasterizeSvgToPng = async (svgText, size) => {
    const svgBlob = new Blob([svgText], { type: "image/svg+xml;charset=utf-8" });
    const svgUrl = URL.createObjectURL(svgBlob);
    try {
        const image = await new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = () => reject(new Error("svg-rasterize-error"));
            img.src = svgUrl;
        });
        const canvas = document.createElement("canvas");
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext("2d");
        ctx.fillStyle = getBackgroundColorForQr();
        ctx.fillRect(0, 0, size, size);
        ctx.drawImage(image, 0, 0, size, size);
        return await new Promise((resolve, reject) => {
            canvas.toBlob((blob) => {
                if (blob) {
                    resolve(blob);
                } else {
                    reject(new Error("canvas-blob-error"));
                }
            }, "image/png");
        });
    } finally {
        URL.revokeObjectURL(svgUrl);
    }
};

document.getElementById("download-svg").addEventListener("click", () => {
    downloadQr("svg").catch((err) => {
        console.error("SVG export error:", err);
        showLocalizedAlert("export-svg-error", "No se pudo exportar el SVG.");
    });
});
document.getElementById("download-png").addEventListener("click", () => {
    downloadQr("png").catch((err) => {
        console.error("PNG export error:", err);
        showLocalizedAlert("export-png-error", "No se pudo exportar el PNG.");
    });
});

const getQrBlobForClipboard = async () => {
    ensureNonTransparentBackground();
    const copyQr = createQrInstance(1200, "svg", getQrMargin(1200));
    const rawSvgBlob = await copyQr.getRawData("svg");
    const svgText = normalizeSvgText(await rawSvgBlob.text());
    return await rasterizeSvgToPng(svgText, 1200);
};

// Copy to Clipboard
document.getElementById("copy-qr").addEventListener("click", async () => {
    const btn = document.getElementById("copy-qr");
    const span = btn.querySelector("span");
    const originalText = span ? span.textContent : "Copiar";

    try {
        if (!supportsClipboardImageWrite()) {
            throw new Error("clipboard-image-unsupported");
        }
        const blob = await getQrBlobForClipboard();
        const data = [new ClipboardItem({ [blob.type]: blob })];
        await navigator.clipboard.write(data);
        
        if (span) {
            span.textContent = t("copied") || "¡Copiado!";
        }
        btn.classList.add("btn-primary");
        setTimeout(() => {
            if (span) span.textContent = originalText;
            btn.classList.remove("btn-primary");
        }, 2000);
    } catch (err) {
        console.error("Error al copiar:", err);
        showLocalizedAlert("copy-error", "Tu navegador no soporta la copia directa. Intenta descargar el PNG.");
    }
});

// ─── Scanner (Camera and Image File Upload) ─────────────────
let scanStream = null;
let scanActive = false;
const scanVideo = document.getElementById("scan-video");
const scanCanvas = document.getElementById("scan-canvas");
const scanOverlay = document.getElementById("scanner-overlay");
const scanCameraBtn = document.getElementById("scan-camera-btn");
const scanFileInput = document.getElementById("scan-file-input");
const scanStatus = document.getElementById("scan-status");
const scanResultWrapper = document.getElementById("scan-result-wrapper");
const scanResult = document.getElementById("scan-result");
const scanCopyBtn = document.getElementById("scan-copy-btn");
const scanImportBtn = document.getElementById("scan-import-btn");

const toggleCamera = async () => {
    if (scanActive) {
        stopCamera();
    } else {
        await startCamera();
    }
};

const startCamera = async () => {
    try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            throw new Error("camera-not-supported");
        }

        scanStatus.textContent = t("scan-permission-request") || "El navegador solicitará permiso para usar la cámara.";
        scanStatus.style.display = "block";
        scanStatus.className = "scan-status";
        scanStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
        scanVideo.srcObject = scanStream;
        scanVideo.setAttribute("playsinline", true); 
        await scanVideo.play();
        scanActive = true;
        scanCameraBtn.textContent = t("scan-stop-camera") || "Detener Cámara";
        scanCameraBtn.classList.remove("btn-primary");
        scanCameraBtn.classList.add("btn-secondary");
        scanStatus.style.display = "none";
        scanOverlay.style.display = "block";
        requestAnimationFrame(tickScan);
    } catch (err) {
        console.error("Camera error:", err);
        if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
            scanStatus.textContent = t("scan-permission-denied") || "Permiso de cámara denegado. Actívalo en el navegador e inténtalo de nuevo.";
        } else if (err.name === "NotFoundError" || err.name === "DevicesNotFoundError") {
            scanStatus.textContent = t("scan-camera-not-found") || "No se encontró una cámara disponible en este dispositivo.";
        } else if (err.message === "camera-not-supported") {
            scanStatus.textContent = t("scan-camera-unsupported") || "Este navegador no permite usar la cámara desde esta página.";
        } else {
            scanStatus.textContent = t("scan-camera-error") || "Error al acceder a la cámara. Revisa los permisos del navegador.";
        }
        scanStatus.style.display = "block";
        scanStatus.className = "scan-status error";
    }
};

const stopCamera = () => {
    if (scanStream) {
        scanStream.getTracks().forEach(track => track.stop());
        scanStream = null;
    }
    scanVideo.srcObject = null;
    scanActive = false;
    scanCameraBtn.textContent = t("scan-start-camera") || "Iniciar Cámara";
    scanCameraBtn.classList.remove("btn-secondary");
    scanCameraBtn.classList.add("btn-primary");
    scanOverlay.style.display = "none";
};

const tickScan = () => {
    if (scanVideo.readyState === scanVideo.HAVE_ENOUGH_DATA && scanActive) {
        const ctx = scanCanvas.getContext("2d", { willReadFrequently: true });
        scanCanvas.width = scanVideo.videoWidth;
        scanCanvas.height = scanVideo.videoHeight;
        ctx.drawImage(scanVideo, 0, 0, scanCanvas.width, scanCanvas.height);
        const imageData = ctx.getImageData(0, 0, scanCanvas.width, scanCanvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: "dontInvert",
        });
        if (code) {
            handleScanResult(code.data);
            stopCamera();
            return;
        }
    }
    if (scanActive) {
        requestAnimationFrame(tickScan);
    }
};

const handleScanResult = (data) => {
    scanResult.value = data;
    scanResultWrapper.style.display = "flex";
    scanStatus.textContent = t("scan-success-msg") || "¡Código QR detectado con éxito!";
    scanStatus.style.display = "block";
    scanStatus.className = "scan-status success";
    
    // Smooth scroll to result
    scanResultWrapper.scrollIntoView({ behavior: 'smooth' });
};

const getCurrentFormValues = () => ({
    url: urlInput.value || "",
    wifi: {
        ssid: getInputValue("wifi-ssid"),
        pass: getInputValue("wifi-pass"),
        security: getInputValue("wifi-security") || "nopass"
    },
    vcard: {
        fn: getInputValue("vcard-fn"),
        ln: getInputValue("vcard-ln"),
        phone: getInputValue("vcard-phone"),
        email: getInputValue("vcard-email"),
        org: getInputValue("vcard-org"),
        url: getInputValue("vcard-url")
    },
    email: {
        to: getInputValue("email-to"),
        subject: getInputValue("email-subject"),
        body: getInputValue("email-body")
    },
    sms: {
        phone: getInputValue("sms-phone"),
        message: getInputValue("sms-message")
    },
    phone: {
        number: getInputValue("phone-number")
    }
});

const getStoredHistory = () => {
    try {
        const parsed = JSON.parse(localStorage.getItem("qr_studio_history")) || [];
        return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
        return [];
    }
};

const setStoredHistory = (history) => {
    try {
        localStorage.setItem("qr_studio_history", JSON.stringify(history.slice(0, MAX_HISTORY_ITEMS)));
        return true;
    } catch (err) {
        console.warn("Could not save QR history:", err);
        return false;
    }
};

if (scanCameraBtn) {
    scanCameraBtn.addEventListener("click", toggleCamera);
}

if (scanFileInput) {
    scanFileInput.addEventListener("change", (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                const ctx = scanCanvas.getContext("2d", { willReadFrequently: true });
                scanCanvas.width = img.width;
                scanCanvas.height = img.height;
                ctx.drawImage(img, 0, 0);
                const imageData = ctx.getImageData(0, 0, scanCanvas.width, scanCanvas.height);
                const code = jsQR(imageData.data, imageData.width, imageData.height);
                if (code) {
                    handleScanResult(code.data);
                } else {
                    scanStatus.textContent = t("scan-no-code-found") || "No se detectó ningún código QR en la imagen.";
                    scanStatus.style.display = "block";
                    scanStatus.className = "scan-status error";
                    scanResultWrapper.style.display = "none";
                }
            };
            img.src = event.target.result;
        };
        reader.readAsDataURL(file);
    });
}

if (scanCopyBtn) {
    scanCopyBtn.addEventListener("click", async () => {
        try {
            if (!supportsClipboardTextWrite()) {
                throw new Error("clipboard-text-unsupported");
            }
            await navigator.clipboard.writeText(scanResult.value);
            const span = scanCopyBtn.querySelector("span");
            const originalText = span.textContent;
            span.textContent = t("copied") || "¡Copiado!";
            scanCopyBtn.classList.add("btn-primary");
            setTimeout(() => {
                span.textContent = originalText;
                scanCopyBtn.classList.remove("btn-primary");
            }, 2000);
        } catch (err) {
            console.error(err);
            showLocalizedAlert("copy-error", "Tu navegador no soporta la copia directa. Intenta descargar el PNG.");
        }
    });
}

if (scanImportBtn) {
    scanImportBtn.addEventListener("click", () => {
        const contentTypeSelect = document.getElementById("content-type-select");
        if (contentTypeSelect) {
            contentTypeSelect.value = "url";
            document.querySelectorAll(".content-subform").forEach(subform => {
                subform.style.display = "none";
            });
            const activeSubform = document.getElementById("form-url");
            if (activeSubform) {
                activeSubform.style.display = "flex";
            }
        }
        urlInput.value = scanResult.value;
        
        const contentTab = document.querySelector('.tab-btn[data-tab="content"]');
        if (contentTab) activateTab(contentTab);
        
        updateQR();
        showLocalizedAlert("imported-to-editor", "Texto importado al editor de contenido.");
    });
}

// ─── LocalStorage Creation History ─────────────────────────
const saveToHistory = (manual = false) => {
    const typeSelect = document.getElementById("content-type-select");
    const type = typeSelect ? typeSelect.value : "url";
    const data = getCompiledQRData();
    if (!data || data.trim() === "") return;

    const config = {
        id: Date.now(),
        timestamp: new Date().toLocaleDateString(),
        type: type,
        data: data,
        dotColor: dotColorInput.value,
        dotColor2: dotColor2Input.value,
        grad: dotGradientType.value,
        style: dotStyleInput.value,
        bg: bgColorInput.value,
        trans: bgTransparentInput.checked,
        bgImage: "",
        hasBgImage: Boolean(currentBgImage),
        cornerColor: cornerColorInput.value,
        sq: cornerSquareStyle.value,
        dt: cornerDotStyle.value,
        logo: "",
        hasLogo: Boolean(currentLogo),
        logoSize: logoSizeInput.value,
        hideDots: hideLogoDots.checked,
        formValues: getCurrentFormValues()
    };

    const history = getStoredHistory();

    // Prevent duplicates in configuration details
    const duplicate = history.find(item =>
        item.data === config.data &&
        item.dotColor === config.dotColor &&
        item.dotColor2 === config.dotColor2 &&
        item.bg === config.bg &&
        item.trans === config.trans &&
        item.style === config.style
    );
    if (duplicate) return;

    history.unshift(config);
    const saved = setStoredHistory(history);
    if (saved) renderHistory();

    if (manual) {
        alert(saved
            ? (t("history-saved-toast") || "¡Guardado en el historial!")
            : (t("history-save-error") || "No se pudo guardar el historial local.")
        );
    }
};

const buildHistoryDescription = (item) => {
    const values = item.formValues || {};
    const rawData = typeof item.data === "string" ? item.data : "";
    let desc = rawData;

    if (item.type === "wifi") {
        desc = `Wi-Fi: ${values.wifi?.ssid || "Network"}`;
    } else if (item.type === "vcard") {
        const name = `${values.vcard?.fn || ""} ${values.vcard?.ln || ""}`.trim();
        desc = `Contacto: ${name || "vCard"}`;
    } else if (item.type === "email" || desc.startsWith("mailto:")) {
        desc = `Email: ${(values.email?.to || parseMailto(desc).to || "").trim()}`;
    } else if (desc.startsWith("tel:")) {
        desc = `Tel: ${desc.replace("tel:", "")}`;
    } else if (desc.length > 30) {
        desc = `${desc.substring(0, 27)}...`;
    }

    return desc;
};

const renderHistory = () => {
    const historyList = document.getElementById("history-list");
    if (!historyList) return;

    const history = getStoredHistory();

    if (history.length === 0) {
        historyList.replaceChildren();
        const empty = document.createElement("div");
        empty.className = "history-empty";
        empty.setAttribute("data-i18n", "history-empty");
        empty.textContent = t("history-empty") || "No hay códigos QR guardados";
        historyList.appendChild(empty);
        return;
    }

    historyList.replaceChildren();

    history.forEach(item => {
        const row = document.createElement("div");
        row.className = "history-item";
        row.dataset.id = String(item.id);

        const swatch = document.createElement("div");
        swatch.className = "history-swatch";
        swatch.style.background = item.trans ? "transparent" : (item.bg || "transparent");
        swatch.style.border = `1px solid ${item.dotColor || "var(--border)"}`;
        swatch.style.width = "18px";
        swatch.style.height = "18px";
        swatch.style.borderRadius = "4px";
        swatch.style.display = "inline-flex";
        swatch.style.alignItems = "center";
        swatch.style.justifyContent = "center";
        swatch.style.flexShrink = "0";

        const swatchDot = document.createElement("span");
        swatchDot.className = "history-swatch-dot";
        swatchDot.style.background = item.dotColor || "var(--accent)";
        swatchDot.style.width = "8px";
        swatchDot.style.height = "8px";
        swatchDot.style.borderRadius = "50%";
        swatch.appendChild(swatchDot);

        const info = document.createElement("div");
        info.className = "history-info";
        info.style.flex = "1";
        info.style.display = "flex";
        info.style.flexDirection = "column";
        info.style.gap = "1px";
        info.style.minWidth = "0";

        const title = document.createElement("span");
        title.className = "history-title";
        title.style.fontSize = "0.75rem";
        title.style.fontWeight = "500";
        title.style.color = "var(--text)";
        title.style.overflow = "hidden";
        title.style.textOverflow = "ellipsis";
        title.style.whiteSpace = "nowrap";
        title.textContent = buildHistoryDescription(item);

        const date = document.createElement("span");
        date.className = "history-date";
        date.style.fontSize = "0.6rem";
        date.style.color = "var(--text-muted)";
        date.textContent = item.timestamp || "";

        info.appendChild(title);
        info.appendChild(date);

        const actions = document.createElement("div");
        actions.className = "history-actions";
        actions.style.display = "flex";
        actions.style.gap = "0.35rem";
        actions.style.flexShrink = "0";

        const loadBtn = document.createElement("button");
        loadBtn.type = "button";
        loadBtn.className = "history-btn-load";
        loadBtn.title = t("history-action-load") || "Cargar";
        loadBtn.style.background = "var(--input-bg)";
        loadBtn.style.border = "1px solid var(--border)";
        loadBtn.style.borderRadius = "4px";
        loadBtn.style.width = "22px";
        loadBtn.style.height = "22px";
        loadBtn.style.cursor = "pointer";
        loadBtn.style.display = "flex";
        loadBtn.style.alignItems = "center";
        loadBtn.style.justifyContent = "center";
        loadBtn.style.color = "var(--text-secondary)";
        loadBtn.style.transition = "all var(--transition)";
        loadBtn.innerHTML = '<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M1 4v6h6m16 10v-6h-6M21.9 8a10 10 0 00-19.18-2L1 10m22 4l-1.72 4a10 10 0 01-19.18-2"/></svg>';

        const deleteBtn = document.createElement("button");
        deleteBtn.type = "button";
        deleteBtn.className = "history-btn-del";
        deleteBtn.title = t("history-action-delete") || "Eliminar";
        deleteBtn.style.background = "var(--input-bg)";
        deleteBtn.style.border = "1px solid var(--border)";
        deleteBtn.style.borderRadius = "4px";
        deleteBtn.style.width = "22px";
        deleteBtn.style.height = "22px";
        deleteBtn.style.cursor = "pointer";
        deleteBtn.style.display = "flex";
        deleteBtn.style.alignItems = "center";
        deleteBtn.style.justifyContent = "center";
        deleteBtn.style.color = "var(--text-secondary)";
        deleteBtn.style.transition = "all var(--transition)";
        deleteBtn.innerHTML = '<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M3 6h18m-2 0v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>';

        loadBtn.addEventListener("click", () => {
            loadHistoryItem(item);
        });

        deleteBtn.addEventListener("click", () => {
            deleteHistoryItem(item.id);
        });

        actions.appendChild(loadBtn);
        actions.appendChild(deleteBtn);

        row.appendChild(swatch);
        row.appendChild(info);
        row.appendChild(actions);
        historyList.appendChild(row);
    });
};

const loadHistoryItem = (item) => {
    const select = document.getElementById("content-type-select");
    if (select) {
        select.value = item.type;
        document.querySelectorAll(".content-subform").forEach(subform => {
            subform.style.display = "none";
        });
        const activeSubform = document.getElementById(`form-${item.type}`);
        if (activeSubform) {
            activeSubform.style.display = "flex";
        }
    }

    const values = item.formValues || {};

    if (item.type === "url") {
        urlInput.value = values.url ?? item.data;
    } else if (item.type === "wifi") {
        const wifi = values.wifi || {};
        document.getElementById("wifi-ssid").value = wifi.ssid || "";
        document.getElementById("wifi-pass").value = wifi.pass || "";
        document.getElementById("wifi-security").value = wifi.security || "WPA";
    } else if (item.type === "vcard") {
        const vcard = values.vcard || {};
        document.getElementById("vcard-fn").value = vcard.fn || "";
        document.getElementById("vcard-ln").value = vcard.ln || "";
        document.getElementById("vcard-phone").value = vcard.phone || "";
        document.getElementById("vcard-email").value = vcard.email || "";
        document.getElementById("vcard-org").value = vcard.org || "";
        document.getElementById("vcard-url").value = vcard.url || "";
    } else if (item.type === "email") {
        const email = values.email || parseMailto(item.data);
        document.getElementById("email-to").value = email.to || "";
        document.getElementById("email-subject").value = email.subject || "";
        document.getElementById("email-body").value = email.body || "";
    } else if (item.type === "sms") {
        const sms = values.sms || {};
        document.getElementById("sms-phone").value = sms.phone || "";
        document.getElementById("sms-message").value = sms.message || "";
    } else if (item.type === "phone") {
        const phone = values.phone || {};
        document.getElementById("phone-number").value = phone.number || item.data.replace('tel:', '');
    }

    dotColorInput.value = item.dotColor;
    dotColor2Input.value = item.dotColor2;
    dotGradientType.value = item.grad;
    dotStyleInput.value = item.style;
    bgColorInput.value = item.bg;
    bgTransparentInput.checked = item.trans;
    currentBgImage = "";
    bgImageFileInput.value = "";
    cornerColorInput.value = item.cornerColor;
    cornerSquareStyle.value = item.sq;
    cornerDotStyle.value = item.dt;
    currentLogo = "";
    logoSizeInput.value = item.logoSize || "0.4";
    hideLogoDots.checked = item.hideDots !== false;

    if (item.hasLogo || item.hasBgImage) {
        fileLabel.querySelector('span').textContent = t("history-assets-not-restored") || "Assets must be uploaded again";
    } else {
        fileLabel.querySelector('span').textContent = t("btn-upload-logo") || "Subir Logo";
    }

    updateQR();
    showLocalizedAlert("history-loaded", "Diseño del historial cargado con éxito.");
};

const deleteHistoryItem = (id) => {
    let history = getStoredHistory();
    history = history.filter(x => x.id !== id);
    setStoredHistory(history);
    renderHistory();
};

const historyClearBtn = document.getElementById("history-clear-btn");
if (historyClearBtn) {
    historyClearBtn.addEventListener("click", () => {
        if (confirm(t("history-clear-confirm") || "¿Estás seguro de que quieres limpiar todo tu historial local?")) {
            localStorage.removeItem("qr_studio_history");
            renderHistory();
        }
    });
}

// ─── Window Load & Init ────────────────────────────────────
window.onload = async () => {
    // Detect and set initial language
    const initialLang = detectLanguage();
    await setLanguage(initialLang);

    updateQR();
    renderHistory();
    
    // Register Service Worker
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('./sw.js').catch(console.error);
    }
};

// Bind language selector changes
const langSelect = document.getElementById("lang-select");
if (langSelect) {
    langSelect.addEventListener("change", async (e) => {
        await setLanguage(e.target.value);
    });
}

const openDialog = (overlay, focusTarget) => {
    if (!overlay) return;
    overlay.dataset.previousFocus = document.activeElement?.id || "";
    overlay.classList.add("active");
    overlay.setAttribute("aria-hidden", "false");
    if (focusTarget) {
        setTimeout(() => focusTarget.focus(), 0);
    }
};

const closeDialog = (overlay) => {
    if (!overlay) return;
    overlay.classList.remove("active");
    overlay.setAttribute("aria-hidden", "true");
    const previousFocusId = overlay.dataset.previousFocus;
    if (previousFocusId) {
        const previousFocus = document.getElementById(previousFocusId);
        if (previousFocus) previousFocus.focus();
    }
};

document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    if (donateOverlay?.classList.contains("active")) closeDialog(donateOverlay);
    if (contactOverlay?.classList.contains("active")) closeDialog(contactOverlay);
});

// ─── Donation Popup ───────────────────────────────────────
const donateOverlay = document.getElementById("donate-overlay");
const donateBtn = document.getElementById("donate-btn");
const donateClose = document.getElementById("donate-close");
const donateAmountBtns = document.querySelectorAll(".donate-amount");
const donateCustomInput = document.getElementById("donate-custom-input");
const donatePaypalLink = document.getElementById("donate-paypal");

let selectedAmount = 10;

const updatePaypalLink = (amount) => {
    selectedAmount = amount;
    donatePaypalLink.href = `https://paypal.me/hyperionhych/${amount}`;
};

if (donateBtn) {
    donateBtn.addEventListener("click", () => {
        openDialog(donateOverlay, donateClose);
    });
}

if (donateClose) {
    donateClose.addEventListener("click", () => {
        closeDialog(donateOverlay);
    });
}

if (donateOverlay) {
    donateOverlay.addEventListener("click", (e) => {
        if (e.target === donateOverlay) {
            closeDialog(donateOverlay);
        }
    });
}

const donateOtherBtn = document.getElementById("donate-other-btn");
const donateCustomWrap = document.getElementById("donate-custom-wrap");

donateAmountBtns.forEach(btn => {
    btn.addEventListener("click", () => {
        donateAmountBtns.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");

        if (btn === donateOtherBtn) {
            donateCustomWrap.style.display = "flex";
            donateCustomInput.value = "";
            donateCustomInput.classList.remove("has-value");
            donateCustomInput.focus();
        } else {
            donateCustomWrap.style.display = "none";
            donateCustomInput.value = "";
            donateCustomInput.classList.remove("has-value");
            updatePaypalLink(btn.dataset.amount);
        }
    });
});

if (donateCustomInput) {
    donateCustomInput.addEventListener("input", () => {
        const val = donateCustomInput.value;
        if (val && parseInt(val) > 0) {
            donateCustomInput.classList.add("has-value");
            updatePaypalLink(parseInt(val));
        } else {
            donateCustomInput.classList.remove("has-value");
        }
    });
}

// ─── Contact Form Popup ───────────────────────────────────
const contactOverlay = document.getElementById("contact-overlay");
const contactTrigger = document.getElementById("contact-trigger");
const contactClose = document.getElementById("contact-close");
const contactForm = document.getElementById("contact-form");
const contactSubmit = document.getElementById("contact-submit");
const contactEmail = document.getElementById("contact-email");
const contactMessage = document.getElementById("contact-message");
const contactStatus = document.getElementById("contact-status");

if (contactTrigger) {
    contactTrigger.addEventListener("click", () => {
        openDialog(contactOverlay, document.getElementById("contact-name"));
        if (contactStatus) {
            contactStatus.className = "form-status";
            contactStatus.style.display = "none";
        }
    });
}

if (contactClose) {
    contactClose.addEventListener("click", () => {
        closeDialog(contactOverlay);
    });
}

if (contactOverlay) {
    contactOverlay.addEventListener("click", (e) => {
        if (e.target === contactOverlay) {
            closeDialog(contactOverlay);
        }
    });
}

if (contactForm) {
    contactForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        
        // Disable submit button and show loading text
        contactSubmit.disabled = true;
        const btnTextSpan = contactSubmit.querySelector("span");
        const originalBtnText = btnTextSpan ? btnTextSpan.textContent : "Enviar";
        if (btnTextSpan) btnTextSpan.textContent = t("contact-sending") || "Enviando...";
        
        try {
            const nameVal = document.getElementById("contact-name").value;
            const emailVal = contactEmail.value;
            const messageVal = contactMessage.value;
            
            const FORMSUBMIT_RECEIVER = "Hyperion.hych@gmail.com";
            
            const response = await fetch(`https://formsubmit.co/ajax/${FORMSUBMIT_RECEIVER}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                },
                body: JSON.stringify({
                    _subject: "QR Studio — Nueva sugerencia / solicitud",
                    name: nameVal,
                    email: emailVal,
                    message: messageVal
                })
            });
            
            let data;
            try {
                data = await response.json();
            } catch (jsonErr) {
                data = {};
            }
            console.log("FormSubmit response data:", data);
            
            // FormSubmit returns data.success as "true" (string) or true (boolean)
            const isSuccess = response.ok && (data.success === true || data.success === "true" || data.success === undefined);
            
            if (isSuccess) {
                contactStatus.className = "form-status success";
                contactStatus.style.display = "block";
                contactStatus.textContent = t("contact-success") || "¡Mensaje enviado con éxito!";
                contactForm.reset();
                setTimeout(() => {
                    closeDialog(contactOverlay);
                }, 3500);
            } else {
                const errorMsg = data.message || (data.success === "false" || data.success === false ? "FormSubmit error" : `HTTP ${response.status}`);
                throw new Error(errorMsg);
            }
        } catch (err) {
            console.error("Error al enviar mensaje:", err);
            contactStatus.className = "form-status error";
            contactStatus.style.display = "block";
            const baseError = t("contact-error-send") || "Ocurrió un error al enviar.";
            contactStatus.textContent = `${baseError} (${err.message})`;
        } finally {
            contactSubmit.disabled = false;
            if (btnTextSpan) btnTextSpan.textContent = originalBtnText;
        }
    });
}

// ─── Presets Toggle Click ──────────────────────────
const presetsToggleBtn = document.getElementById("presets-toggle-btn");
if (presetsToggleBtn) {
    presetsToggleBtn.addEventListener("click", () => {
        const presetsGroup = document.getElementById("presets-container-group");
        if (presetsGroup) {
            presetsGroup.classList.toggle("minimized-presets");
            const isMinimized = presetsGroup.classList.contains("minimized-presets");
            
            presetsToggleBtn.setAttribute("data-i18n", isMinimized ? "presets-show-more" : "presets-show-less");
            presetsToggleBtn.textContent = t(isMinimized ? "presets-show-more" : "presets-show-less");
        }
    });
}
