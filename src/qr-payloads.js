const textEncoder = new TextEncoder();

const encodeMailtoComponent = (value) => encodeURIComponent(value).replace(/\+/g, "%2B");

const encodeMailtoAddressList = (value) => String(value)
    .split(",")
    .map((address) => address.trim())
    .filter(Boolean)
    .map((address) => encodeURI(address).replace(/[?#]/g, (char) => encodeURIComponent(char)))
    .join(",");

export const normalizePhoneForUri = (value) => String(value)
    .trim()
    .replace(/[().\s-]/g, "");

export const escapeWifiValue = (value) => String(value).replace(/([\\;,:"])/g, "\\$1");

export const escapeVCardText = (value) => String(value)
    .replace(/\\/g, "\\\\")
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/\n/g, "\\n")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,");

export const foldVCardLine = (line, maxOctets = 75) => {
    const chars = Array.from(String(line));
    let current = "";
    let currentOctets = 0;
    const folded = [];

    chars.forEach((char) => {
        const charOctets = textEncoder.encode(char).length;
        if (current && currentOctets + charOctets > maxOctets) {
            folded.push(current);
            current = ` ${char}`;
            currentOctets = 1 + charOctets;
            return;
        }
        current += char;
        currentOctets += charOctets;
    });

    if (current) folded.push(current);
    return folded.join("\r\n");
};

export const buildWifiPayload = ({ ssid = "", pass = "", security = "nopass" } = {}) =>
    `WIFI:T:${security || "nopass"};S:${escapeWifiValue(ssid)};P:${escapeWifiValue(pass)};;`;

export const buildVCardPayload = ({
    fn = "",
    ln = "",
    phone = "",
    email = "",
    org = "",
    url = ""
} = {}) => {
    const fullName = `${fn} ${ln}`.trim();
    return [
        "BEGIN:VCARD",
        "VERSION:3.0",
        `N:${escapeVCardText(ln)};${escapeVCardText(fn)};;;`,
        `FN:${escapeVCardText(fullName)}`,
        `TEL;TYPE=CELL:${escapeVCardText(normalizePhoneForUri(phone))}`,
        `EMAIL:${escapeVCardText(email.trim())}`,
        `ORG:${escapeVCardText(org)}`,
        `URL:${escapeVCardText(url.trim())}`,
        "END:VCARD"
    ].map((line) => foldVCardLine(line)).join("\r\n");
};

export const buildMailtoPayload = ({ to = "", subject = "", body = "" } = {}) => {
    const headers = [];
    if (subject) headers.push(`subject=${encodeMailtoComponent(subject)}`);
    if (body) headers.push(`body=${encodeMailtoComponent(body)}`);
    const query = headers.length ? `?${headers.join("&")}` : "";
    return `mailto:${encodeMailtoAddressList(to)}${query}`;
};

export const buildSmsPayload = ({ phone = "", message = "" } = {}) => {
    const normalizedPhone = normalizePhoneForUri(phone);
    const body = message ? `?body=${encodeMailtoComponent(message)}` : "";
    return `sms:${normalizedPhone}${body}`;
};

export const buildTelPayload = ({ number = "" } = {}) =>
    `tel:${normalizePhoneForUri(number)}`;

export const parseMailto = (data) => {
    try {
        const url = new URL(data);
        return {
            to: decodeURIComponent(url.pathname || ""),
            subject: url.searchParams.get("subject") || "",
            body: url.searchParams.get("body") || ""
        };
    } catch (err) {
        return { to: String(data).split("?")[0].replace("mailto:", ""), subject: "", body: "" };
    }
};

export const parseSms = (data) => {
    const value = String(data);
    if (value.startsWith("SMSTO:")) {
        const [phone = "", ...message] = value.replace("SMSTO:", "").split(":");
        return { phone, message: message.join(":") };
    }

    try {
        const url = new URL(value);
        return {
            phone: decodeURIComponent(url.pathname || ""),
            message: url.searchParams.get("body") || ""
        };
    } catch (err) {
        return { phone: value.replace("sms:", ""), message: "" };
    }
};

export const buildQrPayload = (type, values = {}) => {
    if (type === "url") return values.url || " ";
    if (type === "wifi") return buildWifiPayload(values.wifi);
    if (type === "vcard") return buildVCardPayload(values.vcard);
    if (type === "email") return buildMailtoPayload(values.email);
    if (type === "sms") return buildSmsPayload(values.sms);
    if (type === "phone") return buildTelPayload(values.phone);
    return " ";
};
