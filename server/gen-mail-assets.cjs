/* One-off generator for server/mail-assets/ placeholder images (sharp).
   The owner can replace any file here with their own — the server picks the
   files up on the next mail, no restart needed. */
const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

const OUT = path.join(__dirname, "mail-assets");
fs.mkdirSync(OUT, { recursive: true });

const GRAD =
  '<linearGradient id="g" x1="0" y1="0" x2="1" y2="0">' +
  '<stop offset="0" stop-color="#0284c7"/><stop offset="0.45" stop-color="#0ea5e9"/>' +
  '<stop offset="0.72" stop-color="#f97316"/><stop offset="1" stop-color="#fb923c"/></linearGradient>';

const headerSvg = `
<svg width="600" height="160" xmlns="http://www.w3.org/2000/svg">
  <defs>
    ${GRAD}
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#0f172a"/><stop offset="1" stop-color="#16233f"/>
    </linearGradient>
  </defs>
  <rect width="600" height="160" fill="url(#bg)"/>
  <circle cx="545" cy="18" r="86" fill="#38bdf8" opacity="0.10"/>
  <circle cx="470" cy="152" r="66" fill="#f97316" opacity="0.12"/>
  <text x="146" y="74" font-family="Arial, sans-serif" font-size="26" font-weight="700" fill="#ffffff">Trend Code Technology</text>
  <text x="147" y="104" font-family="Arial, sans-serif" font-size="12" letter-spacing="3.4" fill="#fb923c">WE BUILD YOUR FUTURE</text>
  <rect x="0" y="154" width="600" height="6" fill="url(#g)"/>
</svg>`;

const footerSvg = `
<svg width="600" height="110" xmlns="http://www.w3.org/2000/svg">
  <defs>${GRAD}</defs>
  <rect width="600" height="110" fill="#e3effd"/>
  <rect x="0" y="0" width="600" height="4" fill="url(#g)"/>
  <text x="26" y="46" font-family="Arial, sans-serif" font-size="14" font-weight="700" fill="#0f172a">+91 93848 47922  ·  trendcodetechnology2026@gmail.com</text>
  <text x="26" y="72" font-family="Arial, sans-serif" font-size="11.5" fill="#475569">No. 215, 2nd Floor, Shakthi Nagar, Near ICICI Bank, Ganapathy, Coimbatore — 641006</text>
  <text x="26" y="95" font-family="Arial, sans-serif" font-size="10.5" letter-spacing="2.2" fill="#0284c7">WE BUILD YOUR FUTURE</text>
</svg>`;

(async () => {
  const headerBase = await sharp(Buffer.from(headerSvg)).png().toBuffer();
  const logoHeader = await sharp("public/tct-logo.png").resize({ height: 84 }).png().toBuffer();
  await sharp(headerBase)
    .composite([{ input: logoHeader, left: 26, top: 38 }])
    .png()
    .toFile(path.join(OUT, "header-banner.png"));

  const footerBase = await sharp(Buffer.from(footerSvg)).png().toBuffer();
  const logoFooter = await sharp("public/tct-logo.png").resize({ height: 54 }).png().toBuffer();
  await sharp(footerBase)
    .composite([{ input: logoFooter, left: 522, top: 32 }])
    .png()
    .toFile(path.join(OUT, "footer-banner.png"));

  // faint watermark copy of the real logo (~9% opacity)
  const { data, info } = await sharp("public/tct-logo.png")
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  for (let i = 3; i < data.length; i += 4) data[i] = Math.round(data[i] * 0.09);
  await sharp(data, { raw: info }).png().toFile(path.join(OUT, "watermark.png"));

  fs.copyFileSync("public/tct-logo.png", path.join(OUT, "logo.png"));

  console.log("written:", fs.readdirSync(OUT).join(", "));
})().catch((e) => {
  console.error("FAIL:", e.message);
  process.exit(1);
});
