let qrCode;

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
        alert("El archivo excede el límite de 5 MB.");
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
        alert("El archivo excede el límite de 5 MB.");
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
    const originalText = btn.innerHTML;

    try {
        // Get the canvas element from the QR library
        const canvas = qrElement.querySelector("canvas");

        canvas.toBlob(async (blob) => {
            const data = [new ClipboardItem({ [blob.type]: blob })];
            await navigator.clipboard.write(data);
            
            btn.innerHTML = "¡Copiado!";
            btn.classList.add("btn-primary");
            setTimeout(() => {
                btn.innerHTML = originalText;
                btn.classList.remove("btn-primary");
            }, 2000);
        });
    } catch (err) {
        console.error("Error al copiar:", err);
        alert("Tu navegador no soporta la copia directa. Intenta descargar el PNG.");
    }
});

window.onload = () => {
    updateQR();
    // Register Service Worker
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('./sw.js').catch(console.error);
    }
};

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

donateAmountBtns.forEach(btn => {
    btn.addEventListener("click", () => {
        donateAmountBtns.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        donateCustomInput.value = "";
        updatePaypalLink(btn.dataset.amount);
    });
});

donateCustomInput.addEventListener("input", () => {
    const val = donateCustomInput.value;
    if (val && parseInt(val) > 0) {
        donateAmountBtns.forEach(b => b.classList.remove("active"));
        updatePaypalLink(parseInt(val));
    }
});
