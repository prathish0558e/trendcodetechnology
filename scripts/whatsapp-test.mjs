/*
 * WhatsApp alert tester — sends one real alert through the same sender the
 * server uses (server/whatsapp.js), so the Meta Cloud API setup can be proven
 * before touching a form on the site.
 *
 *   node scripts/whatsapp-test.mjs                      # show the detected mode only
 *   node scripts/whatsapp-test.mjs --send               # send a test alert
 *   node scripts/whatsapp-test.mjs --send --text="Hi"   # custom text
 *   node scripts/whatsapp-test.mjs --send --template=tct_alert_v1
 *   node scripts/whatsapp-test.mjs --status            # template approval state
 *
 * Credentials come from server/.env (gitignored) and from the shell — values
 * already in the environment always win, so a one-off run can be:
 *   WHATSAPP_TOKEN=EAAG... WHATSAPP_PHONE_NUMBER_ID=123 node scripts/whatsapp-test.mjs --send
 */
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { whatsappConfig, whatsappMode, whatsappHelp, sendWhatsApp } from "../server/whatsapp.js";

const envPath = path.join("server", ".env");
if (fs.existsSync(envPath)) dotenv.config({ path: envPath });

const argv = process.argv.slice(2);
const status = argv.includes("--status");
const flag = (name) => argv.find((a) => a.startsWith(`--${name}=`))?.split("=").slice(1).join("=");
const send = argv.includes("--send");

// allow --template=... to override just this run
const template = flag("template");
if (template !== undefined) process.env.WHATSAPP_TEMPLATE = template;
if (argv.includes("--no-template")) process.env.WHATSAPP_TEMPLATE = "";

/* --status: ask Meta what happened to the alert templates. Approval decides
   whether alerts can leave the 24-hour customer service window, so this saves a
   trip to WhatsApp Manager. Needs WHATSAPP_BUSINESS_ACCOUNT_ID (the WABA id). */
async function printTemplateStatus() {
  const waba = (process.env.WHATSAPP_BUSINESS_ACCOUNT_ID || "").trim();
  const token = (process.env.WHATSAPP_TOKEN || "").trim();
  if (!waba || !token) {
    console.log("Set WHATSAPP_BUSINESS_ACCOUNT_ID and WHATSAPP_TOKEN in server/.env first.");
    return;
  }
  const version = (process.env.WHATSAPP_API_VERSION || "v23.0").trim();
  const res = await fetch(
    `https://graph.facebook.com/${version}/${waba}/message_templates?fields=name,language,category,status,rejected_reason&limit=50`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  const json = await res.json();
  if (!res.ok) {
    console.log(`Graph error ${res.status}:`, JSON.stringify(json).slice(0, 300));
    return;
  }
  console.log("\nTemplates on this WhatsApp Business account:");
  for (const t of json.data || []) {
    const flag = t.name === (process.env.WHATSAPP_TEMPLATE || "") ? "  <- alerts use this" : "";
    console.log(
      `  ${t.name} | ${t.language} | ${t.category} | ${t.status}${t.rejected_reason && t.rejected_reason !== "NONE" ? ` | ${t.rejected_reason}` : ""}${flag}`
    );
  }
  if (!(json.data || []).length) console.log("  (none)");
}

const cfg = whatsappConfig();
const mode = whatsappMode(cfg);

console.log("WhatsApp alert configuration");
console.log("  mode          :", mode);
console.log("  target number :", cfg.to || "(not set)");
console.log("  sender number :", cfg.phoneNumberId ? `${cfg.phoneNumberId} (phone number ID)` : "(not set)");
console.log("  token         :", cfg.token ? `set (${cfg.token.length} chars)` : "(not set)");
console.log("  template      :", cfg.template ? `${cfg.template} / ${cfg.templateLang}` : "(plain text)");
console.log("  resolved      :", whatsappHelp(cfg));

if (status) {
  await printTemplateStatus();
  process.exit(0);
}

if (mode === "off") {
  console.log(
    "\nNothing to send. Add WHATSAPP_TOKEN, WHATSAPP_PHONE_NUMBER_ID and WHATSAPP_TO\n" +
      "to server/.env (see server/.env.example), or export them for this command."
  );
  process.exit(1);
}

if (!send) {
  console.log("\nDry run — re-run with --send to deliver a real test alert.");
  process.exit(0);
}

const text =
  flag("text") ||
  `✅ TCT WhatsApp alerts are working.\nTest sent ${new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })} IST`;

const result = await sendWhatsApp(text, cfg);
console.log("\nresult:", JSON.stringify(result));
process.exit(result.ok ? 0 : 1);
