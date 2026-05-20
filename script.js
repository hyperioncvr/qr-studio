let qrCode;

// ─── i18n Translations Dictionary ────────────────────────
const translations = {
  es: {
    "subtitle": "Generador Profesional",
    "tab-content": "Contenido",
    "tab-style": "Estilo",
    "tab-logo": "Logo",
    "label-url": "URL o Texto",
    "placeholder-url": "https://tu-sitio.com",
    "label-presets": "Estilos Predefinidos",
    "preset-corporate": "Corporativo",
    "preset-minimal": "Minimal",
    "preset-midnight": "Midnight",
    "preset-sage": "Sage",
    "preset-ocean": "Ocean",
    "preset-rose": "Rosé",
    "preset-sunset": "Sunset",
    "preset-slate": "Slate",
    "preset-noir": "Noir",
    "label-modules": "Módulos",
    "label-main-color": "Color Principal",
    "label-secondary-color": "Color Secundario",
    "label-gradient": "Gradiente",
    "grad-none": "Ninguno",
    "grad-linear": "Lineal",
    "grad-radial": "Radial",
    "label-shape": "Forma",
    "shape-square": "Cuadrado",
    "shape-dots": "Puntos",
    "shape-rounded": "Redondo",
    "shape-extra-rounded": "Suave",
    "shape-classy": "Elegante",
    "label-background": "Fondo",
    "label-transparent": "Transparente",
    "label-bg-image": "Imagen de fondo",
    "label-corners": "Esquinas",
    "label-frame": "Marco",
    "label-center": "Centro",
    "label-corner-color": "Color esquinas",
    "label-center-logo": "Logo central",
    "btn-upload-logo": "Subir Logo",
    "label-hide-dots": "Ocultar puntos detrás del logo",
    "label-logo-size": "Tamaño del logo: ",
    "btn-clear-logo": "Quitar Logo",
    "footer-privacy": "<strong>Privacidad Total:</strong> Tus datos y archivos no salen de tu navegador.",
    "btn-donate-text": "Apoyar con una donación",
    "btn-download-svg": "Descargar SVG",
    "btn-download-png": "PNG",
    "btn-copy-qr": "Copiar",
    "donate-title": "Apoya este proyecto",
    "donate-description": "Si QR Studio te ha sido útil, considera apoyar su desarrollo con una donación voluntaria.",
    "donate-other": "Otro",
    "donate-placeholder": "Escribe el monto en USD",
    "donate-btn-paypal": "Donar con PayPal",
    "donate-footer-text": "Serás redirigido a PayPal de forma segura.",
    "copied": "¡Copiado!",
    "copy-error": "Tu navegador no soporta la copia directa. Intenta descargar el PNG.",
    "file-size-error": "El archivo excede el límite de 5 MB."
  },
  en: {
    "subtitle": "Professional Generator",
    "tab-content": "Content",
    "tab-style": "Style",
    "tab-logo": "Logo",
    "label-url": "URL or Text",
    "placeholder-url": "https://your-site.com",
    "label-presets": "Preset Styles",
    "preset-corporate": "Corporate",
    "preset-minimal": "Minimal",
    "preset-midnight": "Midnight",
    "preset-sage": "Sage",
    "preset-ocean": "Ocean",
    "preset-rose": "Rosé",
    "preset-sunset": "Sunset",
    "preset-slate": "Slate",
    "preset-noir": "Noir",
    "label-modules": "Modules",
    "label-main-color": "Main Color",
    "label-secondary-color": "Secondary Color",
    "label-gradient": "Gradient",
    "grad-none": "None",
    "grad-linear": "Linear",
    "grad-radial": "Radial",
    "label-shape": "Shape",
    "shape-square": "Square",
    "shape-dots": "Dots",
    "shape-rounded": "Rounded",
    "shape-extra-rounded": "Extra Rounded",
    "shape-classy": "Classy",
    "label-background": "Background",
    "label-transparent": "Transparent",
    "label-bg-image": "Background image",
    "label-corners": "Corners",
    "label-frame": "Frame",
    "label-center": "Center",
    "label-corner-color": "Corner Color",
    "label-center-logo": "Central Logo",
    "btn-upload-logo": "Upload Logo",
    "label-hide-dots": "Hide dots behind logo",
    "label-logo-size": "Logo size: ",
    "btn-clear-logo": "Remove Logo",
    "footer-privacy": "<strong>Total Privacy:</strong> Your data and files never leave your browser.",
    "btn-donate-text": "Support with a donation",
    "btn-download-svg": "Download SVG",
    "btn-download-png": "PNG",
    "btn-copy-qr": "Copy",
    "donate-title": "Support this project",
    "donate-description": "If QR Studio has been useful to you, please consider supporting its development with a voluntary donation.",
    "donate-other": "Other",
    "donate-placeholder": "Enter amount in USD",
    "donate-btn-paypal": "Donate with PayPal",
    "donate-footer-text": "You will be redirected securely to PayPal.",
    "copied": "Copied!",
    "copy-error": "Your browser does not support direct copying. Try downloading the PNG.",
    "file-size-error": "The file exceeds the 5 MB limit."
  },
  zh: {
    "subtitle": "专业生成器",
    "tab-content": "内容",
    "tab-style": "样式",
    "tab-logo": "标志",
    "label-url": "网址或文本",
    "placeholder-url": "https://your-site.com",
    "label-presets": "预设样式",
    "preset-corporate": "商务",
    "preset-minimal": "极简",
    "preset-midnight": "午夜",
    "preset-sage": "鼠尾草",
    "preset-ocean": "海洋",
    "preset-rose": "玫瑰",
    "preset-sunset": "日落",
    "preset-slate": "板岩",
    "preset-noir": "黑白",
    "label-modules": "模块",
    "label-main-color": "主颜色",
    "label-secondary-color": "副颜色",
    "label-gradient": "渐变",
    "grad-none": "无",
    "grad-linear": "线性",
    "grad-radial": "径向",
    "label-shape": "形状",
    "shape-square": "正方形",
    "shape-dots": "圆点",
    "shape-rounded": "圆角",
    "shape-extra-rounded": "极圆",
    "shape-classy": "优雅",
    "label-background": "背景",
    "label-transparent": "透明",
    "label-bg-image": "背景图片",
    "label-corners": "角落",
    "label-frame": "边框",
    "label-center": "中心",
    "label-corner-color": "角颜色",
    "label-center-logo": "中心标志",
    "btn-upload-logo": "上传标志",
    "label-hide-dots": "隐藏标志后面的点",
    "label-logo-size": "标志大小: ",
    "btn-clear-logo": "移除标志",
    "footer-privacy": "<strong>绝对隐私:</strong> 您的数据和文件不会离开您的浏览器。",
    "btn-donate-text": "支持捐赠",
    "btn-download-svg": "下载 SVG",
    "btn-download-png": "PNG",
    "btn-copy-qr": "复制",
    "donate-title": "支持这个项目",
    "donate-description": "如果 QR Studio 对您有用，请考虑通过自愿捐赠支持其开发。",
    "donate-other": "其他",
    "donate-placeholder": "输入美元金额",
    "donate-btn-paypal": "用 PayPal 捐赠",
    "donate-footer-text": "您将被安全地重定向到 PayPal。",
    "copied": "已复制！",
    "copy-error": "您的浏览器不支持直接复制。请尝试下载 PNG。",
    "file-size-error": "文件超过 5 MB 限制。"
  },
  ru: {
    "subtitle": "Профессиональный Генератор",
    "tab-content": "Содержимое",
    "tab-style": "Стиль",
    "tab-logo": "Логотип",
    "label-url": "URL или Текст",
    "placeholder-url": "https://your-site.com",
    "label-presets": "Готовые стили",
    "preset-corporate": "Корпоративный",
    "preset-minimal": "Минимал",
    "preset-midnight": "Полночь",
    "preset-sage": "Шалфей",
    "preset-ocean": "Океан",
    "preset-rose": "Розовый",
    "preset-sunset": "Закат",
    "preset-slate": "Грифель",
    "preset-noir": "Нуар",
    "label-modules": "Модули",
    "label-main-color": "Основной Цвет",
    "label-secondary-color": "Вторичный Цвет",
    "label-gradient": "Градиент",
    "grad-none": "Нет",
    "grad-linear": "Линейный",
    "grad-radial": "Радиальный",
    "label-shape": "Форма",
    "shape-square": "Квадрат",
    "shape-dots": "Точки",
    "shape-rounded": "Круглый",
    "shape-extra-rounded": "Очень мягкий",
    "shape-classy": "Стильный",
    "label-background": "Фон",
    "label-transparent": "Прозрачный",
    "label-bg-image": "Фоновое изображение",
    "label-corners": "Углы",
    "label-frame": "Рамка",
    "label-center": "Центр",
    "label-corner-color": "Цвет углов",
    "label-center-logo": "Центральный логотип",
    "btn-upload-logo": "Загрузить логотип",
    "label-hide-dots": "Скрыть точки за логотипом",
    "label-logo-size": "Размер логотипа: ",
    "btn-clear-logo": "Удалить логотип",
    "footer-privacy": "<strong>Полная конфиденциальность:</strong> Ваши данные и файлы остаются на вашем устройстве.",
    "btn-donate-text": "Поддержать донатом",
    "btn-download-svg": "Скачать SVG",
    "btn-download-png": "PNG",
    "btn-copy-qr": "Копировать",
    "donate-title": "Поддержите этот проект",
    "donate-description": "Если QR Studio оказался полезен, вы можете поддержать его разработку добровольным донатом.",
    "donate-other": "Другой",
    "donate-placeholder": "Введите сумму в USD",
    "donate-btn-paypal": "Пожертвовать через PayPal",
    "donate-footer-text": "Вы будете безопасно перенаправлены на PayPal.",
    "copied": "Скопировано!",
    "copy-error": "Ваш браузер не поддерживает прямое копирование. Попробуйте скачать PNG.",
    "file-size-error": "Файл превышает лимит 5 МБ."
  },
  de: {
    "subtitle": "Professioneller Generator",
    "tab-content": "Inhalt",
    "tab-style": "Stil",
    "tab-logo": "Logo",
    "label-url": "URL oder Text",
    "placeholder-url": "https://ihre-website.de",
    "label-presets": "Vordefinierte Stile",
    "preset-corporate": "Unternehmen",
    "preset-minimal": "Minimal",
    "preset-midnight": "Mitternacht",
    "preset-sage": "Salbei",
    "preset-ocean": "Ozean",
    "preset-rose": "Rosé",
    "preset-sunset": "Sonnenuntergang",
    "preset-slate": "Schiefer",
    "preset-noir": "Noir",
    "label-modules": "Module",
    "label-main-color": "Hauptfarbe",
    "label-secondary-color": "Zweitfarbe",
    "label-gradient": "Verlauf",
    "grad-none": "Keiner",
    "grad-linear": "Linear",
    "grad-radial": "Radial",
    "label-shape": "Form",
    "shape-square": "Quadratisch",
    "shape-dots": "Punkte",
    "shape-rounded": "Abgerundet",
    "shape-extra-rounded": "Extra Abgerundet",
    "shape-classy": "Elegant",
    "label-background": "Hintergrund",
    "label-transparent": "Transparent",
    "label-bg-image": "Hintergrundbild",
    "label-corners": "Ecken",
    "label-frame": "Rahmen",
    "label-center": "Zentrum",
    "label-corner-color": "Eckenfarbe",
    "label-center-logo": "Mittiges Logo",
    "btn-upload-logo": "Logo Hochladen",
    "label-hide-dots": "Punkte hinter dem Logo ausblenden",
    "label-logo-size": "Logogröße: ",
    "btn-clear-logo": "Logo Entfernen",
    "footer-privacy": "<strong>Volle Privatsphäre:</strong> Ihre Daten und Dateien verlassen niemals Ihren Browser.",
    "btn-donate-text": "Mit einer Spende unterstützen",
    "btn-download-svg": "SVG Herunterladen",
    "btn-download-png": "PNG",
    "btn-copy-qr": "Kopieren",
    "donate-title": "Dieses Projekt unterstützen",
    "donate-description": "Wenn Ihnen QR Studio geholfen hat, unterstützen Sie die Entwicklung gerne mit einer freiwilligen Spende.",
    "donate-other": "Andere",
    "donate-placeholder": "Betrag in USD eingeben",
    "donate-btn-paypal": "Mit PayPal spenden",
    "donate-footer-text": "Sie werden sicher zu PayPal weitergeleitet.",
    "copied": "Kopiert!",
    "copy-error": "Ihr Browser unterstützt kein direktes Kopieren. Versuchen Sie, die PNG-Datei herunterzuladen.",
    "file-size-error": "Die Datei überschreitet das Limit von 5 MB."
  },
  it: {
    "subtitle": "Generatore Professionale",
    "tab-content": "Contenuto",
    "tab-style": "Stile",
    "tab-logo": "Logo",
    "label-url": "URL o Testo",
    "placeholder-url": "https://il-tuo-sito.it",
    "label-presets": "Stili Predefiniti",
    "preset-corporate": "Aziendale",
    "preset-minimal": "Minimale",
    "preset-midnight": "Mezzanotte",
    "preset-sage": "Salvia",
    "preset-ocean": "Oceano",
    "preset-rose": "Rosato",
    "preset-sunset": "Tramonto",
    "preset-slate": "Ardesia",
    "preset-noir": "Noir",
    "label-modules": "Moduli",
    "label-main-color": "Colore Principale",
    "label-secondary-color": "Colore Secondario",
    "label-gradient": "Gradiente",
    "grad-none": "Nessuno",
    "grad-linear": "Lineare",
    "grad-radial": "Radiale",
    "label-shape": "Forma",
    "shape-square": "Quadrato",
    "shape-dots": "Punti",
    "shape-rounded": "Arrotondato",
    "shape-extra-rounded": "Molto Arrotondato",
    "shape-classy": "Elegante",
    "label-background": "Sfondo",
    "label-transparent": "Trasparente",
    "label-bg-image": "Immagine di sfondo",
    "label-corners": "Angoli",
    "label-frame": "Cornice",
    "label-center": "Centro",
    "label-corner-color": "Colore Angoli",
    "label-center-logo": "Logo Centrale",
    "btn-upload-logo": "Carica Logo",
    "label-hide-dots": "Nascondi punti dietro il logo",
    "label-logo-size": "Dimensione del logo: ",
    "btn-clear-logo": "Rimuovi Logo",
    "footer-privacy": "<strong>Privacy Totale:</strong> I tuoi dati e file non lasciano il tuo browser.",
    "btn-donate-text": "Apoyar con una donación",
    "btn-download-svg": "Scarica SVG",
    "btn-download-png": "PNG",
    "btn-copy-qr": "Copia",
    "donate-title": "Supporta questo progetto",
    "donate-description": "Se QR Studio ti è stato utile, considera di supportare il suo sviluppo con una donazione volontaria.",
    "donate-other": "Altro",
    "donate-placeholder": "Inserisci l'importo in USD",
    "donate-btn-paypal": "Dona con PayPal",
    "donate-footer-text": "Sarai reindirizzato a PayPal in modo sicuro.",
    "copied": "Copiato!",
    "copy-error": "Il tuo browser non supporta la copia directa. Prova a scaricare il PNG.",
    "file-size-error": "Il file supera il limite di 5 MB."
  },
  pl: {
    "subtitle": "Profesjonalny Generator",
    "tab-content": "Zawartość",
    "tab-style": "Styl",
    "tab-logo": "Logo",
    "label-url": "URL lub Tekst",
    "placeholder-url": "https://twoja-strona.pl",
    "label-presets": "Predefiniowane Style",
    "preset-corporate": "Korporacyjny",
    "preset-minimal": "Minimalistyczny",
    "preset-midnight": "Północ",
    "preset-sage": "Szałwia",
    "preset-ocean": "Ocean",
    "preset-rose": "Różowy",
    "preset-sunset": "Zachód Słońca",
    "preset-slate": "Łupek",
    "preset-noir": "Noir",
    "label-modules": "Moduły",
    "label-main-color": "Główny Kolor",
    "label-secondary-color": "Kolor Pomocniczy",
    "label-gradient": "Gradient",
    "grad-none": "Brak",
    "grad-linear": "Liniowy",
    "grad-radial": "Promieniowy",
    "label-shape": "Kształt",
    "shape-square": "Kwadrat",
    "shape-dots": "Kropki",
    "shape-rounded": "Zaokrąglony",
    "shape-extra-rounded": "Super Zaokrąglony",
    "shape-classy": "Elegancki",
    "label-background": "Tło",
    "label-transparent": "Przezroczysty",
    "label-bg-image": "Obraz w tle",
    "label-corners": "Rogi",
    "label-frame": "Ramka",
    "label-center": "Środek",
    "label-corner-color": "Kolor Rogów",
    "label-center-logo": "Logo Centralne",
    "btn-upload-logo": "Prześlij Logo",
    "label-hide-dots": "Ukryj kropki za logo",
    "label-logo-size": "Rozmiar logo: ",
    "btn-clear-logo": "Usuń Logo",
    "footer-privacy": "<strong>Pełna Prywatność:</strong> Twoje dane i pliki nigdy nie opuszczają przeglądarki.",
    "btn-donate-text": "Wesprzyj darowizną",
    "btn-download-svg": "Pobierz SVG",
    "btn-download-png": "PNG",
    "btn-copy-qr": "Kopiuj",
    "donate-title": "Wesprzyj ten projekt",
    "donate-description": "Jeśli QR Studio było dla Ciebie przydatne, rozważ wsparcie jego rozwoju dobrowolną darowizną.",
    "donate-other": "Inna",
    "donate-placeholder": "Wpisz kwotę w USD",
    "donate-btn-paypal": "Przekaż darowiznę przez PayPal",
    "donate-footer-text": "Zostaniesz bezpiecznie przekierowany do PayPal.",
    "copied": "Skopiowano!",
    "copy-error": "Twoja przeglądarka nie obsługuje bezpośredniego kopiowania. Spróbuj pobrać plik PNG.",
    "file-size-error": "Plik przekracza limit 5 MB."
  },
  pt: {
    "subtitle": "Gerador Profissional",
    "tab-content": "Conteúdo",
    "tab-style": "Estilo",
    "tab-logo": "Logo",
    "label-url": "URL ou Texto",
    "placeholder-url": "https://seu-site.com",
    "label-presets": "Estilos Predefinidos",
    "preset-corporate": "Corporativo",
    "preset-minimal": "Minimal",
    "preset-midnight": "Midnight",
    "preset-sage": "Sage",
    "preset-ocean": "Ocean",
    "preset-rose": "Rosé",
    "preset-sunset": "Sunset",
    "preset-slate": "Slate",
    "preset-noir": "Noir",
    "label-modules": "Módulos",
    "label-main-color": "Cor Principal",
    "label-secondary-color": "Cor Secundária",
    "label-gradient": "Gradiente",
    "grad-none": "Nenhum",
    "grad-linear": "Linear",
    "grad-radial": "Radial",
    "label-shape": "Formato",
    "shape-square": "Quadrado",
    "shape-dots": "Pontos",
    "shape-rounded": "Arredondado",
    "shape-extra-rounded": "Suave",
    "shape-classy": "Elegante",
    "label-background": "Fundo",
    "label-transparent": "Transparente",
    "label-bg-image": "Imagem de fundo",
    "label-corners": "Cantos",
    "label-frame": "Moldura",
    "label-center": "Centro",
    "label-corner-color": "Cor dos cantos",
    "label-center-logo": "Logo central",
    "btn-upload-logo": "Enviar Logo",
    "label-hide-dots": "Ocultar pontos atrás do logo",
    "label-logo-size": "Tamanho do logo: ",
    "btn-clear-logo": "Remover Logo",
    "footer-privacy": "<strong>Privacidade Total:</strong> Seus dados e arquivos não saem do seu navegador.",
    "btn-donate-text": "Apoiar com doação",
    "btn-download-svg": "Baixar SVG",
    "btn-download-png": "PNG",
    "btn-copy-qr": "Copiar",
    "donate-title": "Apoie este projeto",
    "donate-description": "Se o QR Studio foi útil para você, considere apoiar seu desenvolvimento com uma doação voluntária.",
    "donate-other": "Outro",
    "donate-placeholder": "Digite o valor em USD",
    "donate-btn-paypal": "Doar com PayPal",
    "donate-footer-text": "Você será redirecionado ao PayPal com segurança.",
    "copied": "Copiado!",
    "copy-error": "Seu navegador não suporta a cópia direta. Tente baixar o PNG.",
    "file-size-error": "O arquivo excede o limite de 5 MB."
  },
  fr: {
    "subtitle": "Générateur Professionnel",
    "tab-content": "Contenu",
    "tab-style": "Style",
    "tab-logo": "Logo",
    "label-url": "URL ou Texte",
    "placeholder-url": "https://votre-site.com",
    "label-presets": "Styles Prédéfinis",
    "preset-corporate": "Corporate",
    "preset-minimal": "Minimal",
    "preset-midnight": "Midnight",
    "preset-sage": "Sage",
    "preset-ocean": "Ocean",
    "preset-rose": "Rosé",
    "preset-sunset": "Sunset",
    "preset-slate": "Slate",
    "preset-noir": "Noir",
    "label-modules": "Modules",
    "label-main-color": "Couleur Principale",
    "label-secondary-color": "Couleur Secondaire",
    "label-gradient": "Dégradé",
    "grad-none": "Aucun",
    "grad-linear": "Linéaire",
    "grad-radial": "Radial",
    "label-shape": "Forme",
    "shape-square": "Carré",
    "shape-dots": "Points",
    "shape-rounded": "Arrondi",
    "shape-extra-rounded": "Doux",
    "shape-classy": "Élégant",
    "label-background": "Fond",
    "label-transparent": "Transparent",
    "label-bg-image": "Image de fond",
    "label-corners": "Coins",
    "label-frame": "Cadre",
    "label-center": "Centre",
    "label-corner-color": "Couleur des coins",
    "label-center-logo": "Logo central",
    "btn-upload-logo": "Importer un Logo",
    "label-hide-dots": "Masquer les points derrière le logo",
    "label-logo-size": "Taille du logo : ",
    "btn-clear-logo": "Supprimer le Logo",
    "footer-privacy": "<strong>Confidentialité Totale :</strong> Vos données et fichiers ne quittent pas votre navigateur.",
    "btn-donate-text": "Soutenir par un don",
    "btn-download-svg": "Télécharger SVG",
    "btn-download-png": "PNG",
    "btn-copy-qr": "Copier",
    "donate-title": "Soutenir ce projet",
    "donate-description": "Si QR Studio vous a été utile, pensez à soutenir son développement par un don volontaire.",
    "donate-other": "Autre",
    "donate-placeholder": "Saisissez le montant en USD",
    "donate-btn-paypal": "Faire un don avec PayPal",
    "donate-footer-text": "Vous serez redirigé vers PayPal en toute sécurité.",
    "copied": "Copié !",
    "copy-error": "Votre navigateur ne prend pas en charge la copie directe. Essayez de télécharger le PNG.",
    "file-size-error": "Le fichier dépasse la limite de 5 Mo."
  },
  ja: {
    "subtitle": "プロフェッショナル生成器",
    "tab-content": "コンテンツ",
    "tab-style": "スタイル",
    "tab-logo": "ロゴ",
    "label-url": "URLまたはテキスト",
    "placeholder-url": "https://your-site.com",
    "label-presets": "プリセットスタイル",
    "preset-corporate": "コーポレート",
    "preset-minimal": "ミニマル",
    "preset-midnight": "ミッドナイト",
    "preset-sage": "セージ",
    "preset-ocean": "オーシャン",
    "preset-rose": "ロゼ",
    "preset-sunset": "サンセット",
    "preset-slate": "スレート",
    "preset-noir": "ノワール",
    "label-modules": "モジュール",
    "label-main-color": "メインカラー",
    "label-secondary-color": "セカンドカラー",
    "label-gradient": "グラدهーション",
    "grad-none": "なし",
    "grad-linear": "線形",
    "grad-radial": "放射状",
    "label-shape": "形状",
    "shape-square": "正方形",
    "shape-dots": "ドット",
    "shape-rounded": "丸型",
    "shape-extra-rounded": "ソフト",
    "shape-classy": "エレガント",
    "label-background": "背景",
    "label-transparent": "透明",
    "label-bg-image": "背景画像",
    "label-corners": "コーナー",
    "label-frame": "フレーム",
    "label-center": "センター",
    "label-corner-color": "コーナーの色",
    "label-center-logo": "中央ロゴ",
    "btn-upload-logo": "ロゴをアップロード",
    "label-hide-dots": "ロゴの背後のドットを非表示にする",
    "label-logo-size": "ロゴサイズ: ",
    "btn-clear-logo": "ロゴを削除",
    "footer-privacy": "<strong>完全なプライバシー:</strong> データやファイルがブラウザの外に送信されることはありません。",
    "btn-donate-text": "寄付で支援する",
    "btn-download-svg": "SVGをダウンロード",
    "btn-download-png": "PNG",
    "btn-copy-qr": "コピー",
    "donate-title": "このプロジェクトを支援する",
    "donate-description": "QR Studioがお役に立ちましたら、任意の寄付による開発支援をご検討ください。",
    "donate-other": "その他",
    "donate-placeholder": "米ドルで金額を入力",
    "donate-btn-paypal": "PayPalで寄付する",
    "donate-footer-text": "安全にPayPalにリダイレクトされます。",
    "copied": "コピーしました！",
    "copy-error": "お使いのブラウザは直接コピーに対応していません。PNGをダウンロードしてください。",
    "file-size-error": "ファイルサイズが5MBの上限を超えています。"
  },
  ko: {
    "subtitle": "전문가용 생성기",
    "tab-content": "콘텐츠",
    "tab-style": "스타일",
    "tab-logo": "로고",
    "label-url": "URL 또는 텍스트",
    "placeholder-url": "https://your-site.com",
    "label-presets": "프리셋 스타일",
    "preset-corporate": "기업형",
    "preset-minimal": "미니멀",
    "preset-midnight": "미드나잇",
    "preset-sage": "세이지",
    "preset-ocean": "오션",
    "preset-rose": "로제",
    "preset-sunset": "선셋",
    "preset-slate": "슬레이트",
    "preset-noir": "느와르",
    "label-modules": "모듈",
    "label-main-color": "메인 색상",
    "label-secondary-color": "보조 색상",
    "label-gradient": "그라디언트",
    "grad-none": "없음",
    "grad-linear": "선형",
    "grad-radial": "원형",
    "label-shape": "모양",
    "shape-square": "정사각형",
    "shape-dots": "도트",
    "shape-rounded": "둥근형",
    "shape-extra-rounded": "부드러운형",
    "shape-classy": "우아한형",
    "label-background": "배경",
    "label-transparent": "투명",
    "label-bg-image": "배경 이미지",
    "label-corners": "코너",
    "label-frame": "프레임",
    "label-center": "센터",
    "label-corner-color": "코너 색상",
    "label-center-logo": "중앙 로고",
    "btn-upload-logo": "로고 업로드",
    "label-hide-dots": "로고 뒤 도트 숨기기",
    "label-logo-size": "로고 크기: ",
    "btn-clear-logo": "로고 제거",
    "footer-privacy": "<strong>완벽한 개인정보 보호:</strong> 사용자의 데이터와 파일은 브라우저를 벗어나지 않습니다.",
    "btn-donate-text": "기부로 지원하기",
    "btn-download-svg": "SVG 다운로드",
    "btn-download-png": "PNG",
    "btn-copy-qr": "복사",
    "donate-title": "이 프로젝트 지원하기",
    "donate-description": "QR Studio가 도움이 되셨다면, 자발적인 기부로 개발을 지원해 주세요.",
    "donate-other": "기타",
    "donate-placeholder": "USD 금액 입력",
    "donate-btn-paypal": "PayPal로 기부하기",
    "donate-footer-text": "PayPal로 안전하게 이동합니다.",
    "copied": "복사 완료!",
    "copy-error": "브라우저가 직접 복사를 지원하지 않습니다. PNG 다운로드를 시도하세요.",
    "file-size-error": "파일 크기가 5MB 제한을 초과합니다."
  },
  ar: {
    "subtitle": "مولد احترافي",
    "tab-content": "المحتوى",
    "tab-style": "النمط",
    "tab-logo": "الشعار",
    "label-url": "رابط أو نص",
    "placeholder-url": "https://your-site.com",
    "label-presets": "الأنماط الجاهزة",
    "preset-corporate": "رسمي",
    "preset-minimal": "بسيط",
    "preset-midnight": "منتصف الليل",
    "preset-sage": "مريمية",
    "preset-ocean": "محيط",
    "preset-rose": "وردي",
    "preset-sunset": "غروب",
    "preset-slate": "صخري",
    "preset-noir": "أسود فاخر",
    "label-modules": "الوحدات",
    "label-main-color": "اللون الرئيسي",
    "label-secondary-color": "اللون الثانوي",
    "label-gradient": "التدرج",
    "grad-none": "بدون",
    "grad-linear": "خطي",
    "grad-radial": "دائري",
    "label-shape": "الشكل",
    "shape-square": "مربع",
    "shape-dots": "نقاط",
    "shape-rounded": "مستدير",
    "shape-extra-rounded": "ناعم",
    "shape-classy": "أنيق",
    "label-background": "الخلفية",
    "label-transparent": "شفاف",
    "label-bg-image": "صورة الخلفية",
    "label-corners": "الزوايا",
    "label-frame": "الإطار",
    "label-center": "المركز",
    "label-corner-color": "لون الزوايا",
    "label-center-logo": "الشعار المركزي",
    "btn-upload-logo": "رفع شعار",
    "label-hide-dots": "إخفاء النقاط خلف الشعار",
    "label-logo-size": "حجم الشعار: ",
    "btn-clear-logo": "إزالة الشعار",
    "footer-privacy": "<strong>خصوصية مطلقة:</strong> لا تغادر بياناتك وملفاتك متصفحك أبداً.",
    "btn-donate-text": "دعم المشروع بتبرع",
    "btn-download-svg": "تحميل SVG",
    "btn-download-png": "PNG",
    "btn-copy-qr": "نسخ",
    "donate-title": "ادعم هذا المشروع",
    "donate-description": "إذا كان QR Studio مفيداً لك، يرجى التفكير في دعم تطويره بتبرع اختياري.",
    "donate-other": "آخر",
    "donate-placeholder": "أدخل المبلغ بالدولار",
    "donate-btn-paypal": "تبرع عبر PayPal",
    "donate-footer-text": "سيتم توجيهك بأمان إلى PayPal.",
    "copied": "تم النسخ!",
    "copy-error": "متصفحك لا يدعم النسخ المباشر. يرجى تحميل صورة PNG.",
    "file-size-error": "حجم الملف يتجاوز الحد المسموح به وهو 5 ميجابايت."
  }
};

// ─── i18n Logic ──────────────────────────────────────────
const setLanguage = (lang) => {
    if (!translations[lang]) return;
    
    // Save language setting
    localStorage.setItem("qr_studio_lang", lang);
    
    // Update dropdown selection
    const langSelect = document.getElementById("lang-select");
    if (langSelect) langSelect.value = lang;

    // Update simple text elements
    document.querySelectorAll("[data-i18n]").forEach(elem => {
        const key = elem.getAttribute("data-i18n");
        if (translations[lang][key]) {
            if (key === "footer-privacy") {
                elem.innerHTML = translations[lang][key];
            } else {
                elem.textContent = translations[lang][key];
            }
        }
    });

    // Update placeholder elements
    document.querySelectorAll("[data-i18n-placeholder]").forEach(elem => {
        const key = elem.getAttribute("data-i18n-placeholder");
        if (translations[lang][key]) {
            elem.setAttribute("placeholder", translations[lang][key]);
        }
    });

    // Re-trigger layout or values that are multi-language and calculated (like logo-size text template)
    const logoSizeText = document.querySelector('label[for="logo-size"] span[data-i18n="label-logo-size"]');
    if (logoSizeText) {
        logoSizeText.textContent = translations[lang]["label-logo-size"];
    }
};

const detectLanguage = () => {
    // 1. LocalStorage
    const savedLang = localStorage.getItem("qr_studio_lang");
    if (savedLang && translations[savedLang]) return savedLang;

    // 2. Browser Languages
    const browserLangs = navigator.languages || [navigator.language];
    for (const browserLang of browserLangs) {
        const short = browserLang.split("-")[0].toLowerCase();
        if (translations[short]) return short;
    }

    // 3. Default
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
        const currentLang = document.getElementById("lang-select")?.value || detectLanguage();
        alert(translations[currentLang]["file-size-error"] || "El archivo excede el límite de 5 MB.");
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
        const currentLang = document.getElementById("lang-select")?.value || detectLanguage();
        alert(translations[currentLang]["file-size-error"] || "El archivo excede el límite de 5 MB.");
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
    const currentLang = document.getElementById("lang-select")?.value || detectLanguage();
    const originalText = span ? span.textContent : "Copiar";

    try {
        // Get the canvas element from the QR library
        const canvas = qrElement.querySelector("canvas");

        canvas.toBlob(async (blob) => {
            const data = [new ClipboardItem({ [blob.type]: blob })];
            await navigator.clipboard.write(data);
            
            if (span) {
                span.textContent = translations[currentLang]["copied"] || "¡Copiado!";
            }
            btn.classList.add("btn-primary");
            setTimeout(() => {
                if (span) span.textContent = originalText;
                btn.classList.remove("btn-primary");
            }, 2000);
        });
    } catch (err) {
        console.error("Error al copiar:", err);
        alert(translations[currentLang]["copy-error"] || "Tu navegador no soporta la copia directa. Intenta descargar el PNG.");
    }
});

window.onload = () => {
    // Detect and set initial language
    const initialLang = detectLanguage();
    setLanguage(initialLang);

    updateQR();
    
    // Register Service Worker
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('./sw.js').catch(console.error);
    }
};

// Bind language selector changes
const langSelect = document.getElementById("lang-select");
if (langSelect) {
    langSelect.addEventListener("change", (e) => {
        setLanguage(e.target.value);
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
