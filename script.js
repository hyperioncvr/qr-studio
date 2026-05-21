let qrCode;

// ─── i18n State & Dynamic Loading ──────────────────────────
const SUPPORTED_LANGUAGES = ["es", "en", "zh", "ru", "de", "it", "pl", "pt", "fr", "ja", "ko", "ar"];
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
        tabs.forEach(t => t.classList.remove('active'));
        sections.forEach(s => s.classList.remove('active'));
        tab.classList.add('active');
        document.getElementById(`tab-${tab.dataset.tab}`).classList.add('active');
    });
});

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
        data: urlInput.value || " ",
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

// Downloads
document.getElementById("download-svg").addEventListener("click", () => qrCode.download({ name: "qr", extension: "svg" }));
document.getElementById("download-png").addEventListener("click", () => qrCode.download({ name: "qr", extension: "png" }));

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

window.onload = async () => {
    // Detect and set initial language
    const initialLang = detectLanguage();
    await setLanguage(initialLang);

    updateQR();
    
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

donateBtn.addEventListener("click", () => {
    donateOverlay.classList.add("active");
});

donateClose.addEventListener("click", () => {
    donateOverlay.classList.remove("active");
});

donateOverlay.addEventListener("click", (e) => {
    if (e.target === donateOverlay) {
        donateOverlay.classList.remove("active");
    }
});

const donateOtherBtn = document.getElementById("donate-other-btn");
const donateCustomWrap = document.getElementById("donate-custom-wrap");

donateAmountBtns.forEach(btn => {
    btn.addEventListener("click", () => {
        donateAmountBtns.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");

        if (btn === donateOtherBtn) {
            // Show custom input and focus it
            donateCustomWrap.style.display = "flex";
            donateCustomInput.value = "";
            donateCustomInput.classList.remove("has-value");
            donateCustomInput.focus();
        } else {
            // Hide custom input and update amount
            donateCustomWrap.style.display = "none";
            donateCustomInput.value = "";
            donateCustomInput.classList.remove("has-value");
            updatePaypalLink(btn.dataset.amount);
        }
    });
});

donateCustomInput.addEventListener("input", () => {
    const val = donateCustomInput.value;
    if (val && parseInt(val) > 0) {
        donateCustomInput.classList.add("has-value");
        updatePaypalLink(parseInt(val));
    } else {
        donateCustomInput.classList.remove("has-value");
    }
});

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
            const emailVal = contactEmail.value;
            const messageVal = contactMessage.value;
            
            // SUGERENCIA DE SEGURIDAD: Puedes registrarte en FormSubmit (https://formsubmit.co)
            // y obtener un token/hash aleatorio (ej. "a38c4b2f...") para ocultar tu email en el cliente.
            // Simplemente reemplaza el valor de esta constante con tu token o tu email.
            const FORMSUBMIT_RECEIVER = "Hyperion.hych@gmail.com";
            
            const response = await fetch(`https://formsubmit.co/ajax/${FORMSUBMIT_RECEIVER}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                },
                body: JSON.stringify({
                    _subject: "QR Studio — Nueva sugerencia / solicitud",
                    Email: emailVal,
                    Message: messageVal
                })
            });
            
            const data = await response.json();
            
            if (response.ok && data.success === "true") {
                // Success
                contactStatus.className = "form-status success";
                contactStatus.textContent = t("contact-success") || "¡Mensaje enviado con éxito!";
                contactForm.reset();
                setTimeout(() => {
                    contactOverlay.classList.remove("active");
                }, 2500);
            } else {
                throw new Error("Failed to send");
            }
        } catch (err) {
            console.error("Error al enviar mensaje:", err);
            contactStatus.className = "form-status error";
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
            
            // Update button text using i18n key
            presetsToggleBtn.setAttribute("data-i18n", isMinimized ? "presets-show-more" : "presets-show-less");
            presetsToggleBtn.textContent = t(isMinimized ? "presets-show-more" : "presets-show-less");
        }
    });
}
