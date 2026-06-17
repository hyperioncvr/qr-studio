import assert from "node:assert/strict";
import {
  buildMailtoPayload,
  buildQrPayload,
  buildSmsPayload,
  buildTelPayload,
  buildVCardPayload,
  buildWifiPayload,
  foldVCardLine,
  parseMailto,
  parseSms
} from "../src/qr-payloads.js";

assert.equal(
  buildWifiPayload({ ssid: "Cafe;Net", pass: "pa:ss,word", security: "WPA" }),
  "WIFI:T:WPA;S:Cafe\\;Net;P:pa\\:ss\\,word;;"
);

assert.equal(
  buildMailtoPayload({ to: "hello@example.com", subject: "Hola mundo", body: "A+B & C" }),
  "mailto:hello@example.com?subject=Hola%20mundo&body=A%2BB%20%26%20C"
);

assert.deepEqual(
  parseMailto("mailto:hello@example.com?subject=Hola%20mundo&body=A%2BB%20%26%20C"),
  { to: "hello@example.com", subject: "Hola mundo", body: "A+B & C" }
);

assert.equal(buildTelPayload({ number: "+56 9 1234-5678" }), "tel:+56912345678");
assert.equal(buildSmsPayload({ phone: "+56 9 1234-5678", message: "Hola QR" }), "sms:+56912345678?body=Hola%20QR");
assert.deepEqual(parseSms("SMSTO:+56912345678:Hola:QR"), { phone: "+56912345678", message: "Hola:QR" });

const vcard = buildVCardPayload({
  fn: "Ana;Maria",
  ln: "Perez, Soto",
  phone: "+56 9 1234-5678",
  email: "ana@example.com",
  org: "ACME\\QR",
  url: "https://example.com"
});
assert.match(vcard, /^BEGIN:VCARD\r\nVERSION:3\.0\r\n/);
assert.match(vcard, /N:Perez\\, Soto;Ana\\;Maria;;;/);
assert.match(vcard, /TEL;TYPE=CELL:\+56912345678/);
assert.match(vcard, /ORG:ACME\\\\QR/);

const folded = foldVCardLine(`NOTE:${"á".repeat(40)}`, 75);
assert.match(folded, /\r\n /);

assert.equal(buildQrPayload("phone", { phone: { number: "+1 (555) 100-2000" } }), "tel:+15551002000");

console.log("QR payload tests passed.");
