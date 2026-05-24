let qrCode;

// ─── i18n State & Dynamic Loading ──────────────────────────
const SUPPORTED_LANGUAGES = ["es", "en", "zh", "ar", "ru", "de", "it", "pl", "pt", "fr", "ja", "ko"];
const activeTranslations = {};

// Translation helper to get keys synchronously from loaded language
const t = (key) => {
    const currentLang = localStorage.getItem("qr_studio_lang") || "en";
    return (activeTranslations[currentLang] || {})[key] || "";
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

    const trans = activeTranslations[lang];

    // Update dynamic header metadata for localized SEO
    const pageTitle = `QR Studio — ${trans["subtitle"] || "Generador Profesional"}`;
    document.title = pageTitle;

    const ogTitleMeta = document.querySelector('meta[property="og:title"]');
    if (ogTitleMeta) ogTitleMeta.setAttribute("content", pageTitle);

    const twitterTitleMeta = document.querySelector('meta[property="twitter:title"]');
    if (twitterTitleMeta) twitterTitleMeta.setAttribute("content", pageTitle);

    if (trans["meta-description"]) {
        const descMeta = document.querySelector('meta[name="description"]');
        if (descMeta) descMeta.setAttribute("content", trans["meta-description"]);

        const ogDescMeta = document.querySelector('meta[property="og:description"]');
        if (ogDescMeta) ogDescMeta.setAttribute("content", trans["meta-description"]);

        const twitterDescMeta = document.querySelector('meta[property="twitter:description"]');
        if (twitterDescMeta) twitterDescMeta.setAttribute("content", trans["meta-description"]);
    }

    // Update simple text elements
    document.querySelectorAll("[data-i18n]").forEach(elem => {
        const key = elem.getAttribute("data-i18n");
        if (trans[key]) {
            if (key === "footer-privacy") {
                elem.innerHTML = trans[key];
            } else {
                elem.textContent = trans[key];
            }
        }
    });

    // Update placeholder elements
    document.querySelectorAll("[data-i18n-placeholder]").forEach(elem => {
        const key = elem.getAttribute("data-i18n-placeholder");
        if (trans[key]) {
            elem.setAttribute("placeholder", trans[key]);
        }
    });

    // Re-trigger layout or values that are multi-language and calculated (like logo-size text template)
    const logoSizeText = document.querySelector('label[for="logo-size"] span[data-i18n="label-logo-size"]');
    if (logoSizeText) {
        logoSizeText.textContent = trans["label-logo-size"];
    }

    // Update toggle preset button dynamically if language is changed
    const presetsGroup = document.getElementById("presets-container-group");
    const presetsToggleBtn = document.getElementById("presets-toggle-btn");
    if (presetsGroup && presetsToggleBtn) {
        const isMinimized = presetsGroup.classList.contains("minimized-presets");
        presetsToggleBtn.textContent = trans[isMinimized ? "presets-show-more" : "presets-show-less"];
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

// Tab Logic
const tabs = document.querySelectorAll('.tab-btn');
const sections = document.querySelectorAll('.control-section');

tabs.forEach(tab => {
    tab.addEventListener('click', () => {
        // Stop camera if leaving Scanner tab
        if (scanActive && tab.dataset.tab !== 'scan') {
            stopCamera();
        }

        tabs.forEach(t => t.classList.remove('active'));
        sections.forEach(s => s.classList.remove('active'));
        tab.classList.add('active');
        document.getElementById(`tab-${tab.dataset.tab}`).classList.add('active');
    });
});

// Compiled QR Data Builder
const getCompiledQRData = () => {
    const typeSelect = document.getElementById("content-type-select");
    const type = typeSelect ? typeSelect.value : "url";

    if (type === "url") {
        return urlInput.value || " ";
    } else if (type === "wifi") {
        const ssid = document.getElementById("wifi-ssid").value || "";
        const pass = document.getElementById("wifi-pass").value || "";
        const sec = document.getElementById("wifi-security").value || "nopass";
        return `WIFI:S:${ssid};T:${sec};P:${pass};;`;
    } else if (type === "vcard") {
        const fn = document.getElementById("vcard-fn").value || "";
        const ln = document.getElementById("vcard-ln").value || "";
        const phone = document.getElementById("vcard-phone").value || "";
        const email = document.getElementById("vcard-email").value || "";
        const org = document.getElementById("vcard-org").value || "";
        const url = document.getElementById("vcard-url").value || "";
        return `BEGIN:VCARD\nVERSION:3.0\nN:${ln};${fn};;;\nFN:${fn} ${ln}\nTEL;TYPE=CELL:${phone}\nEMAIL:${email}\nORG:${org}\nURL:${url}\nEND:VCARD`;
    } else if (type === "email") {
        const to = document.getElementById("email-to").value || "";
        const subject = document.getElementById("email-subject").value || "";
        const body = document.getElementById("email-body").value || "";
        return `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    } else if (type === "sms") {
        const phone = document.getElementById("sms-phone").value || "";
        const msg = document.getElementById("sms-message").value || "";
        return `SMSTO:${phone}:${msg}`;
    } else if (type === "phone") {
        const num = document.getElementById("phone-number").value || "";
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

// Update function
const updateQR = () => {
    // Toggle class based on style for crisp edges on square modules
    if (dotStyleInput.value === "square") {
        qrElement.classList.add("style-square");
    } else {
        qrElement.classList.remove("style-square");
    }

    // Dot options
    const dotsOptions = {
        type: dotStyleInput.value,
        roundSize: false,
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
    if (currentBgImage) {
        backgroundOptions.image = currentBgImage;
    }

    // Recreate instance on every update for clean rendering
    qrElement.innerHTML = "";

    qrCode = new QRCodeStyling({
        width: 300,
        height: 300,
        type: "canvas",
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
    });

    qrCode.append(qrElement);

    // Dynamically style the wrapper to match QR background
    const qrWrapper = document.querySelector('.qr-wrapper');
    if (qrWrapper) {
        if (bgTransparentInput.checked) {
            qrWrapper.style.backgroundColor = "transparent";
            qrWrapper.style.borderColor = "var(--border)";
            qrWrapper.style.boxShadow = "none";
        } else {
            qrWrapper.style.backgroundColor = bgColorInput.value;

            // Detect brightness to adjust wrapper chrome
            const hex = bgColorInput.value.replace('#', '');
            const r = parseInt(hex.substr(0, 2), 16);
            const g = parseInt(hex.substr(2, 2), 16);
            const b = parseInt(hex.substr(4, 2), 16);
            const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

            if (luminance < 0.4) {
                // Dark background
                qrWrapper.style.borderColor = "rgba(255, 255, 255, 0.06)";
                qrWrapper.style.boxShadow = "0 4px 20px rgba(0, 0, 0, 0.3)";
            } else {
                // Light background
                qrWrapper.style.borderColor = "var(--border)";
                qrWrapper.style.boxShadow = "none";
            }
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
        alert(t("file-size-error") || "El archivo excede el límite de 5 MB.");
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
        alert(t("file-size-error") || "El archivo excede el límite de 5 MB.");
        e.target.value = "";
        return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
        currentBgImage = event.target.result;
        updateQR();
    };
    reader.readAsDataURL(file);
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


document.querySelectorAll('.preset-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        // Remove active state from all
        document.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const p = presets[btn.dataset.preset];
        if (!p) return;

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

// Event listeners — use debounced update for high-frequency inputs
[urlInput, dotColorInput, dotColor2Input, bgColorInput, cornerColorInput, logoSizeInput].forEach(input => {
    input.addEventListener("input", debouncedUpdate);
});
// Immediate update for discrete selectors/checkboxes
[dotGradientType, dotStyleInput, bgTransparentInput, cornerSquareStyle, cornerDotStyle, hideLogoDots].forEach(input => {
    input.addEventListener("input", updateQR);
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
            activeSubform.style.display = "block";
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

// Resolution & Download logic
const getDownloadOptions = (ext) => {
    const resSelect = document.getElementById("download-resolution");
    const res = resSelect ? parseInt(resSelect.value) : 600;
    
    // Auto-save current config to history
    saveToHistory(false);

    return {
        name: "qr",
        extension: ext,
        width: res,
        height: res
    };
};

document.getElementById("download-svg").addEventListener("click", () => qrCode.download(getDownloadOptions("svg")));
document.getElementById("download-png").addEventListener("click", () => qrCode.download(getDownloadOptions("png")));

// Copy to Clipboard
document.getElementById("copy-qr").addEventListener("click", async () => {
    const btn = document.getElementById("copy-qr");
    const span = btn.querySelector("span");
    const originalText = span ? span.textContent : "Copiar";

    try {
        // Get the canvas element from the QR library
        const canvas = qrElement.querySelector("canvas");

        canvas.toBlob(async (blob) => {
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
        });
    } catch (err) {
        console.error("Error al copiar:", err);
        alert(t("copy-error") || "Tu navegador no soporta la copia directa. Intenta descargar el PNG.");
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
        scanStatus.style.display = "none";
        scanStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
        scanVideo.srcObject = scanStream;
        scanVideo.setAttribute("playsinline", true); 
        scanVideo.play();
        scanActive = true;
        scanCameraBtn.textContent = t("scan-stop-camera") || "Detener Cámara";
        scanCameraBtn.classList.remove("btn-primary");
        scanCameraBtn.classList.add("btn-secondary");
        scanOverlay.style.display = "block";
        requestAnimationFrame(tickScan);
    } catch (err) {
        console.error("Camera error:", err);
        scanStatus.textContent = "Error al acceder a la cámara. Revisa los permisos.";
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
                    scanStatus.textContent = "No se detectó ningún código QR en la imagen.";
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
                activeSubform.style.display = "block";
            }
        }
        urlInput.value = scanResult.value;
        
        // Switch tab back to content
        tabs.forEach(t => t.classList.remove('active'));
        sections.forEach(s => s.classList.remove('active'));
        
        const contentTab = document.querySelector('.tab-btn[data-tab="content"]');
        if (contentTab) contentTab.classList.add('active');
        
        const contentSection = document.getElementById('tab-content');
        if (contentSection) contentSection.classList.add('active');
        
        updateQR();
        alert("Texto importado al editor de contenido.");
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
        cornerColor: cornerColorInput.value,
        sq: cornerSquareStyle.value,
        dt: cornerDotStyle.value,
        logo: currentLogo,
        logoSize: logoSizeInput.value,
        hideDots: hideLogoDots.checked
    };

    let history = [];
    try {
        history = JSON.parse(localStorage.getItem("qr_studio_history")) || [];
    } catch (e) {
        history = [];
    }

    // Prevent duplicates in configuration details
    const duplicate = history.find(item => item.data === config.data && item.dotColor === config.dotColor && item.bg === config.bg && item.logo === config.logo);
    if (duplicate) return;

    history.unshift(config);
    if (history.length > 15) history.pop();

    localStorage.setItem("qr_studio_history", JSON.stringify(history));
    renderHistory();

    if (manual) {
        alert(t("history-saved-toast") || "¡Guardado en el historial!");
    }
};

const renderHistory = () => {
    const historyList = document.getElementById("history-list");
    if (!historyList) return;

    let history = [];
    try {
        history = JSON.parse(localStorage.getItem("qr_studio_history")) || [];
    } catch (e) {
        history = [];
    }

    if (history.length === 0) {
        historyList.innerHTML = `<div class="history-empty" data-i18n="history-empty">${t("history-empty") || "No hay códigos QR guardados"}</div>`;
        return;
    }

    historyList.innerHTML = history.map(item => {
        let desc = item.data;
        if (desc.startsWith("WIFI:")) {
            const ssidMatch = desc.match(/S:([^;]+)/);
            desc = `Wi-Fi: ${ssidMatch ? ssidMatch[1] : 'Network'}`;
        } else if (desc.startsWith("BEGIN:VCARD")) {
            const fnMatch = desc.match(/FN:([^\n\r]+)/);
            desc = `Contacto: ${fnMatch ? fnMatch[1] : 'vCard'}`;
        } else if (desc.startsWith("mailto:")) {
            desc = `Email: ${desc.split('?')[0].replace('mailto:', '')}`;
        } else if (desc.startsWith("tel:")) {
            desc = `Tel: ${desc.replace('tel:', '')}`;
        } else if (desc.length > 30) {
            desc = desc.substring(0, 27) + "...";
        }

        return `
            <div class="history-item" data-id="${item.id}">
                <div class="history-swatch" style="background: ${item.trans ? 'transparent' : item.bg}; border: 1px solid ${item.dotColor}; width: 18px; height: 18px; border-radius: 4px; display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0;">
                    <span class="history-swatch-dot" style="background: ${item.dotColor}; width: 8px; height: 8px; border-radius: 50%;"></span>
                </div>
                <div class="history-info" style="flex: 1; display: flex; flex-direction: column; gap: 1px; min-width: 0;">
                    <span class="history-title" style="font-size: 0.75rem; font-weight: 500; color: var(--text); overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${desc}</span>
                    <span class="history-date" style="font-size: 0.6rem; color: var(--text-muted);">${item.timestamp}</span>
                </div>
                <div class="history-actions" style="display: flex; gap: 0.35rem; flex-shrink: 0;">
                    <button type="button" class="history-btn-load" title="Cargar" style="background: var(--input-bg); border: 1px solid var(--border); border-radius: 4px; width: 22px; height: 22px; cursor: pointer; display: flex; align-items: center; justify-content: center; color: var(--text-secondary); transition: all var(--transition);">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M1 4v6h6m16 10v-6h-6M21.9 8a10 10 0 00-19.18-2L1 10m22 4l-1.72 4a10 10 0 01-19.18-2"/></svg>
                    </button>
                    <button type="button" class="history-btn-del" title="Eliminar" style="background: var(--input-bg); border: 1px solid var(--border); border-radius: 4px; width: 22px; height: 22px; cursor: pointer; display: flex; align-items: center; justify-content: center; color: var(--text-secondary); transition: all var(--transition);">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M3 6h18m-2 0v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                    </button>
                </div>
            </div>
        `;
    }).join('');

    // Bind event actions
    historyList.querySelectorAll(".history-item").forEach(elem => {
        const id = parseInt(elem.dataset.id);
        const item = history.find(x => x.id === id);
        if (!item) return;

        elem.querySelector(".history-btn-load").addEventListener("click", () => {
            loadHistoryItem(item);
        });

        elem.querySelector(".history-btn-del").addEventListener("click", () => {
            deleteHistoryItem(id);
        });
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
            activeSubform.style.display = "block";
        }
    }

    if (item.type === "url") {
        urlInput.value = item.data;
    } else if (item.type === "wifi") {
        const ssidMatch = item.data.match(/S:([^;]+)/);
        const passMatch = item.data.match(/P:([^;]+)/);
        const secMatch = item.data.match(/T:([^;]+)/);
        document.getElementById("wifi-ssid").value = ssidMatch ? ssidMatch[1] : "";
        document.getElementById("wifi-pass").value = passMatch ? passMatch[1] : "";
        document.getElementById("wifi-security").value = secMatch ? secMatch[1] : "WPA";
    } else if (item.type === "vcard") {
        const fnMatch = item.data.match(/FN:([^\n\r]+)/);
        const nameParts = fnMatch ? fnMatch[1].split(' ') : ["", ""];
        document.getElementById("vcard-fn").value = nameParts[0] || "";
        document.getElementById("vcard-ln").value = nameParts[1] || "";
        
        const telMatch = item.data.match(/TEL;TYPE=CELL:([^\n\r]+)/);
        document.getElementById("vcard-phone").value = telMatch ? telMatch[1] : "";
        
        const emailMatch = item.data.match(/EMAIL:([^\n\r]+)/);
        document.getElementById("vcard-email").value = emailMatch ? emailMatch[1] : "";
        
        const orgMatch = item.data.match(/ORG:([^\n\r]+)/);
        document.getElementById("vcard-org").value = orgMatch ? orgMatch[1] : "";
        
        const urlMatch = item.data.match(/URL:([^\n\r]+)/);
        document.getElementById("vcard-url").value = urlMatch ? urlMatch[1] : "";
    } else if (item.type === "email") {
        const to = item.data.split('?')[0].replace('mailto:', '');
        const subjectMatch = item.data.match(/subject=([^&]+)/);
        const bodyMatch = item.data.match(/body=([^&]+)/);
        document.getElementById("email-to").value = to;
        document.getElementById("email-subject").value = subjectMatch ? decodeURIComponent(subjectMatch[1]) : "";
        document.getElementById("email-body").value = bodyMatch ? decodeURIComponent(bodyMatch[1]) : "";
    } else if (item.type === "sms") {
        const parts = item.data.replace('SMSTO:', '').split(':');
        document.getElementById("sms-phone").value = parts[0] || "";
        document.getElementById("sms-message").value = parts.slice(1).join(':') || "";
    } else if (item.type === "phone") {
        document.getElementById("phone-number").value = item.data.replace('tel:', '');
    }

    dotColorInput.value = item.dotColor;
    dotColor2Input.value = item.dotColor2;
    dotGradientType.value = item.grad;
    dotStyleInput.value = item.style;
    bgColorInput.value = item.bg;
    bgTransparentInput.checked = item.trans;
    cornerColorInput.value = item.cornerColor;
    cornerSquareStyle.value = item.sq;
    cornerDotStyle.value = item.dt;
    currentLogo = item.logo || "";
    logoSizeInput.value = item.logoSize || "0.4";
    hideLogoDots.checked = item.hideDots !== false;

    if (currentLogo) {
        fileLabel.querySelector('span').textContent = "Logo cargado";
    } else {
        fileLabel.querySelector('span').textContent = "Subir Logo";
    }

    updateQR();
    alert("Diseño del historial cargado con éxito.");
};

const deleteHistoryItem = (id) => {
    let history = [];
    try {
        history = JSON.parse(localStorage.getItem("qr_studio_history")) || [];
    } catch (e) {
        history = [];
    }
    history = history.filter(x => x.id !== id);
    localStorage.setItem("qr_studio_history", JSON.stringify(history));
    renderHistory();
};

const historyClearBtn = document.getElementById("history-clear-btn");
if (historyClearBtn) {
    historyClearBtn.addEventListener("click", () => {
        if (confirm("¿Estás seguro de que quieres limpiar todo tu historial local?")) {
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
        donateOverlay.classList.add("active");
    });
}

if (donateClose) {
    donateClose.addEventListener("click", () => {
        donateOverlay.classList.remove("active");
    });
}

if (donateOverlay) {
    donateOverlay.addEventListener("click", (e) => {
        if (e.target === donateOverlay) {
            donateOverlay.classList.remove("active");
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
        contactOverlay.classList.add("active");
        if (contactStatus) {
            contactStatus.className = "form-status";
            contactStatus.style.display = "none";
        }
    });
}

if (contactClose) {
    contactClose.addEventListener("click", () => {
        contactOverlay.classList.remove("active");
    });
}

if (contactOverlay) {
    contactOverlay.addEventListener("click", (e) => {
        if (e.target === contactOverlay) {
            contactOverlay.classList.remove("active");
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
            
            const data = await response.json();
            console.log("FormSubmit response data:", data);
            
            if (response.ok) {
                contactStatus.className = "form-status success";
                contactStatus.style.display = "block";
                contactStatus.textContent = t("contact-success") || "¡Mensaje enviado con éxito!";
                contactForm.reset();
                setTimeout(() => {
                    contactOverlay.classList.remove("active");
                }, 3500);
            } else {
                throw new Error(data.message || "Failed to send");
            }
        } catch (err) {
            console.error("Error al enviar mensaje:", err);
            contactStatus.className = "form-status error";
            contactStatus.style.display = "block";
            contactStatus.textContent = t("contact-error-send") || "Ocurrió un error al enviar.";
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
