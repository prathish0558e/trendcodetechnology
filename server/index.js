import express from "express";
import dns from "dns";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import multer from "multer";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { DEFAULT_PUBLIC_SITE_URL, normalizeSiteUrl } from "../shared/site.js";
import { sendWhatsApp, whatsappMode } from "./whatsapp.js";

// load server/.env if present (email notifications). Values already set in
// the environment (Vercel dashboard env vars) always win — dotenv never
// overrides them.
dotenv.config({ path: path.join(path.dirname(fileURLToPath(import.meta.url)), ".env") });

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const IS_SERVERLESS = Boolean(process.env.VERCEL); // set by Vercel runtime
const app = express();
const requestedPort = Number(process.env.PORT);
const PORT = Number.isInteger(requestedPort) && requestedPort > 0 ? requestedPort : 4000;
const LOCAL_PUBLIC_SITE_URL =
  process.env.NODE_ENV === "production" ? `http://localhost:${PORT}` : "http://localhost:5173";
const PUBLIC_SITE_URL = normalizeSiteUrl(
  process.env.PUBLIC_SITE_URL,
  IS_SERVERLESS ? DEFAULT_PUBLIC_SITE_URL : LOCAL_PUBLIC_SITE_URL
);

app.use((_req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("X-Frame-Options", "SAMEORIGIN");
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  next();
});
app.use(express.json({ limit: "100kb" }));

// ---------- storage ----------
// Three backends, picked automatically:
//   1. MongoDB   — MONGODB_URI set (production on Vercel): durable and shared
//                  by every serverless instance, so the admin panel, sessions
//                  and login-activity log survive cold starts.
//   2. memory    — Vercel without MONGODB_URI: lives only as long as one warm
//                  instance (best effort — data can vanish on cold start).
//   3. JSON file — local dev: server/data/*.json
const DATA_DIR = process.env.TCT_DATA_DIR || path.join(__dirname, "data");
if (!IS_SERVERLESS && !fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const FILES = {
  leads: path.join(DATA_DIR, "leads.json"),
  messages: path.join(DATA_DIR, "messages.json"),
  applications: path.join(DATA_DIR, "applications.json"),
  internships: path.join(DATA_DIR, "internships.json"),
  "tour-enquiries": path.join(DATA_DIR, "tour-enquiries.json"),
  gallery: path.join(DATA_DIR, "gallery.json"),
  offers: path.join(DATA_DIR, "offers.json"),
  ads: path.join(DATA_DIR, "ads.json"),
};
// A developer machine can hold the real connection string (server/.env) without
// its own test submissions landing in the live database: locally the file store
// is used unless USE_MONGODB=1 is set explicitly. On Vercel the variable is
// always honoured, so production is unaffected.
const MONGO_URI =
  IS_SERVERLESS || process.env.USE_MONGODB === "1"
    ? (process.env.MONGODB_URI || "").trim()
    : "";

// Several home/office networks refuse SRV lookups, which `mongodb+srv://` needs,
// so USE_MONGODB=1 would fail locally with "querySrv ECONNREFUSED". Only local
// runs are affected — the Vercel resolver is fine.
if (MONGO_URI && !IS_SERVERLESS) {
  try {
    dns.setServers(["8.8.8.8", "1.1.1.1"]);
  } catch {
    /* keep the system resolver */
  }
}
const MEMORY = {
  leads: [],
  messages: [],
  applications: [],
  internships: [],
  "tour-enquiries": [],
  gallery: [],
  offers: [],
  ads: [],
  authlog: [],
  sessions: [],
};

// Resume uploads — disk locally, memory on serverless (email still gets the
// attachment, but the file can't be persisted or re-downloaded there).
const UPLOAD_DIR = path.join(DATA_DIR, "resumes");
if (!IS_SERVERLESS && !fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}
const resumeStorage = IS_SERVERLESS
  ? multer.memoryStorage()
  : multer.diskStorage({
      destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
      filename: (_req, file, cb) => {
        const safe = file.originalname.replace(/[^a-zA-Z0-9._-]/g, "_").slice(-80);
        cb(null, `${Date.now()}-${safe}`);
      },
    });
const uploadResume = multer({
  storage: resumeStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB (Vercel caps body at ~4.5 MB)
  fileFilter: (_req, file, cb) => {
    const ok = /\.(pdf|doc|docx)$/i.test(file.originalname);
    cb(ok ? null : new Error("Only PDF / DOC / DOCX files are allowed."), ok);
  },
});

// Gallery image uploads — memory storage so photos work across both local dev & Vercel serverless
const uploadGallery = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB limit for photos
  fileFilter: (_req, file, cb) => {
    const isImage = (file.mimetype && file.mimetype.startsWith("image/")) || /\.(jpg|jpeg|png|webp|gif|svg)$/i.test(file.originalname);
    cb(isImage ? null : new Error("Only image files (JPG, PNG, WebP, GIF, SVG) are allowed."), Boolean(isImage));
  },
});

// --- MongoDB (optional) ----------------------------------------------------
// The connection promise is cached on globalThis so every warm serverless
// invocation reuses the same pool instead of reconnecting per request.
const MONGO_RETRY_MS = 15_000; // reads: after a failed connect, stop retrying
const MONGO_WRITE_PROBE_MS = 10_000; // writes: retry at most this often
// `fresh` (used by writes) shortens the cooldown so a record is never kept in
// memory while the database is already reachable again — after an Atlas blip
// the old long cooldown made writes and reads disagree for a whole minute.
async function getDb({ fresh = false } = {}) {
  if (!MONGO_URI) return null;
  const g = globalThis;
  if (!g.__tctMongoDb) {
    // A blocked/unreachable Atlas would otherwise cost serverSelectionTimeoutMS
    // on EVERY request (login does 3-4 storage calls → 30s+ hangs).
    const wait = fresh ? MONGO_WRITE_PROBE_MS : MONGO_RETRY_MS;
    if (Date.now() - (g.__tctMongoFailAt || 0) < wait) return null;
    g.__tctMongoFailAt = 0; // allow the attempt below to actually run
    g.__tctMongoDb = (async () => {
      const { MongoClient } = await import("mongodb");
      const client = new MongoClient(MONGO_URI, {
        maxPoolSize: 5,
        serverSelectionTimeoutMS: 3000, // keep a blocked Atlas from stalling forms
      });
      await client.connect();
      g.__tctMongoOk = true;
      g.__tctMongoErr = "";
      console.log("[db] MongoDB connected");
      return client.db();
    })().catch((err) => {
      g.__tctMongoDb = null; // retry after MONGO_RETRY_MS, not on every call
      g.__tctMongoFailAt = Date.now();
      g.__tctMongoOk = false;
      // Keep the last reason around so /api/health?connect=1 can report it
      // (this is how we tell an Atlas IP-allowlist block from a bad password).
      g.__tctMongoErr = String(err && err.message ? err.message : err).slice(0, 300);
      throw err;
    });
  }
  try {
    return await g.__tctMongoDb;
  } catch (err) {
    console.error(
      `[db] MongoDB unavailable — using ${IS_SERVERLESS ? "memory" : "file"} storage (${err.message})`
    );
    return null;
  }
}

// Read-only status for /api/health — never triggers a connection itself.
function dbStatus() {
  if (!MONGO_URI) return "not-configured";
  const g = globalThis;
  if (g.__tctMongoOk) return "connected";
  if (g.__tctMongoFailAt) return "unavailable";
  return "not-tried-yet";
}

// Force a fresh connect attempt (ignores the 60s fail cache) so ops can tell
// whether Atlas is reachable again without waiting for the cache to expire.
async function probeDb() {
  if (!MONGO_URI) return "not-configured";
  const g = globalThis;
  // Clear the fail cache so this is a real attempt, not a cached "no".
  g.__tctMongoFailAt = 0;
  g.__tctMongoDb = null;
  try {
    await getDb();
  } catch {
    /* getDb already logged and stored the reason */
  }
  return dbStatus();
}

// Every list lives in one Mongo document per key: { _id: "leads", items: [] }
const listKey = (file) => path.basename(file, ".json");

async function listGet(file) {
  const key = listKey(file);
  const db = await getDb();
  if (db) {
    const doc = await db.collection("lists").findOne({ _id: key });
    return (doc && doc.items) || [];
  }
  if (IS_SERVERLESS) return MEMORY[key] || [];
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch {
    return [];
  }
}

async function listSet(file, list) {
  const key = listKey(file);
  const db = await getDb({ fresh: true }); // write: prefer the DB over memory
  if (db) {
    await db
      .collection("lists")
      .updateOne({ _id: key }, { $set: { items: list } }, { upsert: true });
    return;
  }
  if (IS_SERVERLESS) {
    MEMORY[key] = list;
    return;
  }
  try {
    fs.writeFileSync(file, JSON.stringify(list, null, 2));
  } catch (err) {
    // Read-only filesystem: still accept the record, just log it loudly so
    // nothing is silently lost.
    console.warn(`[storage] persist failed for ${key}:`, err.message);
    console.log("[storage]", JSON.stringify(list[list.length - 1]));
  }
}

// Atomic append — no read-modify-write race when two requests land together.
// `max` keeps the list bounded (e.g. the last 500 login events).
async function listAppend(file, item, max = 0) {
  const key = listKey(file);
  const db = await getDb({ fresh: true }); // write: prefer the DB over memory
  if (db) {
    const col = db.collection("lists");
    if (max > 0) {
      await col.updateOne(
        { _id: key },
        [
          {
            $set: {
              items: {
                $slice: [{ $concatArrays: [{ $ifNull: ["$items", []] }, [item]] }, -max],
              },
            },
          },
        ],
        { upsert: true }
      );
    } else {
      await col.updateOne({ _id: key }, { $push: { items: item } }, { upsert: true });
    }
    return;
  }
  const list = await listGet(file);
  list.push(item);
  if (max > 0 && list.length > max) list.splice(0, list.length - max);
  await listSet(file, list);
}

// --- same names the routes already use (now async — callers await) ---------
const readList = (file) => listGet(file);
const writeList = (file, list) => listSet(file, list);
const appendList = (file, item, max = 0) => listAppend(file, item, max);

const VALID_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ---------- email notifications (SMTP credentials with serverless fallback) ----------
const DEFAULT_SMTP_HOST = "smtp.gmail.com";
const DEFAULT_SMTP_PORT = 465;
const DEFAULT_SMTP_USER = "trendcodetechnology2026@gmail.com";
const DEFAULT_SMTP_PASS = "jzgeackrdzqvcbmx";

const SMTP_HOST = process.env.SMTP_HOST || DEFAULT_SMTP_HOST;
const SMTP_PORT = Number(process.env.SMTP_PORT) || DEFAULT_SMTP_PORT;
const SMTP_USER = process.env.SMTP_USER || DEFAULT_SMTP_USER;
const SMTP_PASS = (process.env.SMTP_PASS || DEFAULT_SMTP_PASS).replace(/\s+/g, "");
const NOTIFY_EMAIL = process.env.NOTIFY_EMAIL || SMTP_USER;

function makeTransport() {
  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_PORT === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 25000,
  });
}

const mailer = makeTransport();

console.log(
  mailer
    ? `[mail] SMTP configured → host=${SMTP_HOST} port=${SMTP_PORT} user=${SMTP_USER}`
    : "[mail] SMTP NOT configured"
);

// Vercel stops all work the moment the response is sent, so notifications
// (thank-you mail, owner alerts, WhatsApp) must be awaited BEFORE responding;
// fire-and-forget would be cut off mid-SMTP-send.
const NOTIFY_WAIT_MS = 9000;
function boundedWait(promise, ms) {
  let timer;
  const timeout = new Promise((resolve) => {
    timer = setTimeout(resolve, ms);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}

async function runNotifications(fns) {
  const all = Promise.all(
    fns.map((fn) =>
      fn().catch((err) => console.error("[notify] failed:", err?.message || err))
    )
  );
  // Always await notification delivery with a timeout:
  // 1. On Vercel serverless, container freeze drops unawaited network sockets.
  // 2. Bounded wait guarantees the client response is never stalled longer than NOTIFY_WAIT_MS.
  return boundedWait(all, NOTIFY_WAIT_MS);
}

// Attachment for emails — works for both disk (local) and memory (serverless)
function buildResumeAttachment(record, buffer) {
  if (!record.resumeFile) return [];
  const filename = record.resumeFile.replace(/^\d+-/, "");
  const content = buffer || record.resumeBuffer || null;
  if (content) return [{ filename, content }];
  return [{ filename, path: path.join(UPLOAD_DIR, record.resumeFile) }];
}

// ---------- WhatsApp alerts (see server/whatsapp.js) ----------
// Meta WhatsApp Cloud API when configured, CallMeBot as the legacy fallback.
async function notifyWhatsApp(lead) {
  const text =
    `🔔 New enquiry — ${lead.name}\n` +
    `📞 ${lead.phone || "-"}\n` +
    (lead.email ? `📧 ${lead.email}\n` : "") +
    `🛠 ${lead.service || "-"}\n\n` +
    `${String(lead.message || "").slice(0, 300)}`;
  const result = await sendWhatsApp(text);
  if (result.ok) console.log(`[lead] WhatsApp alert sent for ${lead.name}`);
}

async function notifyNewLead(lead) {
  if (!mailer) {
    console.log(`[lead] ${lead.name} <${lead.email}> — ${lead.service || "general"} (SMTP not configured, saved to file)`);
    return;
  }
  const text = [
    `New enquiry from the website:`,
    ``,
    `Name:    ${lead.name}`,
    `Email:   ${lead.email || "(not provided)"}`,
    `Phone:   ${lead.phone || "-"}`,
    `Service: ${lead.service || "-"}`,
    `Message: ${lead.message}`,
    ``,
    `Time: ${lead.createdAt}`,
  ].join("\n");
  try {
    await mailer.sendMail({
      from: `"TCT Website" <${SMTP_USER}>`,
      to: NOTIFY_EMAIL,
      subject: `🔔 New enquiry — ${lead.name}${lead.service ? ` (${lead.service})` : ""}`,
      text,
      ...(lead.email ? { replyTo: lead.email } : {}),
    });
    console.log(`[lead] emailed notification for ${lead.name}`);
  } catch (err) {
    console.error("[lead] email failed:", err.message);
  }
}

// ---------- thank-you auto reply (company mailbox -> the sender) ----------
// Every form on the site — careers, internship, quote/enquiry — gets a
// "Thank you for your interest" confirmation FROM the company's own mail
// address TO the address the visitor typed into the form, the same way
// other companies' career pages acknowledge applications. Fire-and-forget:
// it must never block or fail the API response.
const escapeHtml = (s) =>
  String(s).replace(
    /[&<>"']/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]
  );

const THANK_YOU_SIGNATURE =
  "<b>Trend Code Technology</b><br>" +
  "We Build Your Future<br>" +
  "+91 93848 47922 · trendcodetechnology2026@gmail.com<br>" +
  "No. 215, 2nd Floor, Shakthi Nagar, Near ICICI Bank, Ganapathy, Coimbatore — 641006";

// Mail assets: the owner drops banners + logo into server/mail-assets/
// (see README.txt there). They are re-read on EVERY send — replace a file any
// time, no restart — and attached with CID so images render inline for every
// recipient without needing a hosted URL. Missing files fall back to the
// styled HTML below.
const MAIL_ASSETS_DIR = path.join(__dirname, "mail-assets");
const MAIL_ASSET_EXTS = [".png", ".jpg", ".jpeg", ".webp"];

function attachMailAsset(attachments, base, cid) {
  for (const ext of MAIL_ASSET_EXTS) {
    const file = path.join(MAIL_ASSETS_DIR, base + ext);
    if (fs.existsSync(file)) {
      attachments.push({ filename: path.basename(file), cid, path: file });
      return true;
    }
  }
  return false;
}

const THANK_YOU_KINDS = {
  tour: {
    subject: "Thank you for your interest — TCT Tourism",
    intro: (detail) =>
      `We've received your tour enquiry${
        detail ? ` for <b>${escapeHtml(detail)}</b>` : ""
      }.`,
    next: "Our travel desk will send you 2–3 itinerary options with final pricing within 24 hours.",
    more:
      "Want it faster? WhatsApp +91 93848 47922 any time — the desk replies 24×7.",
    cta: { label: "Browse tour packages", href: `${PUBLIC_SITE_URL}/tourism` },
  },
  career: {
    subject: "Thank you for your interest — Trend Code Technology",
    intro: (detail) =>
      `We've received your application for <b>${escapeHtml(detail || "the position you applied for")}</b>.`,
    next:
      "Our HR team will review it and get back to you within a few working days.",
    more:
      "While you wait, feel free to browse our other open roles — every application reaches the same HR inbox.",
    cta: { label: "View open positions", href: `${PUBLIC_SITE_URL}/careers` },
  },
  internship: {
    subject: "Thank you for your interest — Trend Code Technology Internship",
    intro: (detail) =>
      `We've received your internship application${
        detail ? ` for the <b>${escapeHtml(detail)}</b> domain` : ""
      }.`,
    next: "Our HR team will review it and contact you about the next steps.",
    more:
      "We run live projects across development, digital marketing, AI and IoT — you are paired with a mentor from day one.",
    cta: { label: "Explore internship tracks", href: `${PUBLIC_SITE_URL}/internship` },
  },
  enquiry: {
    subject: "Thank you for your interest — Trend Code Technology",
    intro: () => "We've received your enquiry.",
    next: "Our team will look into it and reply within 24 hours.",
    more:
      "Need a faster answer? WhatsApp or call +91 93848 47922 — we reply 24×7.",
    cta: { label: "Explore our services", href: `${PUBLIC_SITE_URL}/services` },
  },
};

async function sendThankYou(to, name, kind = "enquiry", detail = "") {
  if (!to || !VALID_EMAIL.test(to)) return;
  if (!mailer) {
    console.log(`[thankyou] SMTP not configured — skipped for ${to} (${kind})`);
    return;
  }
  const k = THANK_YOU_KINDS[kind] || THANK_YOU_KINDS.enquiry;
  const safeName = escapeHtml(name || "there");

  const attachments = [];
  // Priority: the owner's shared "email banner" image (used as the HEADER and
  // FOOTER background with logo/address over it) -> separate header/footer
  // banners -> styled HTML fallbacks.
  const hasEmailBanner = attachMailAsset(attachments, "email banner", "tct-email-banner@asset");
  const hasBanner =
    !hasEmailBanner && attachMailAsset(attachments, "header-banner", "tct-header@banner");
  const hasFooter =
    !hasEmailBanner && attachMailAsset(attachments, "footer-banner", "tct-footer@banner");
  const hasLogo =
    (hasEmailBanner || !hasBanner) && attachMailAsset(attachments, "logo", "tct-logo@asset");
  const hasWatermark = attachMailAsset(attachments, "watermark", "tct-watermark@asset");

  // Shared background style for the owner's email banner (dark fallback colour
  // keeps the mail looking intentional in clients that block background images).
  const bannerBg =
    "background-image:url('cid:tct-email-banner@asset');background-size:cover;background-position:center;background-repeat:no-repeat;background-color:#0f172a";

  // Header — owner's banner background with the website-style logo + name on top
  const header = hasEmailBanner
    ? `<div style="${bannerBg};padding:16px 26px">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>${
          hasLogo
            ? '<td width="58" style="width:58px"><img src="cid:tct-logo@asset" width="46" alt="" style="display:block;width:46px;height:auto;border:0"></td>'
            : ""
        }<td style="font-family:Arial,Helvetica,sans-serif;padding-left:14px">
            <div style="color:#0284c7;font-size:20px;font-weight:700;line-height:1.2">Trend Code Technology</div>
            <div style="color:#fb923c;font-size:10.5px;letter-spacing:2.6px;font-weight:700;text-shadow:0 1px 3px rgba(0,0,0,.6)">WE BUILD YOUR FUTURE</div>
          </td></tr></table>
      </div>`
    : hasBanner
      ? '<img src="cid:tct-header@banner" width="600" alt="Trend Code Technology" style="display:block;width:100%;max-width:600px;height:auto;border:0;outline:none;text-decoration:none">'
      : `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0f172a"><tr>${
          hasLogo
            ? '<td width="58" style="width:58px;padding-left:24px"><img src="cid:tct-logo@asset" width="46" alt="" style="display:block;width:46px;height:auto;border:0"></td>'
            : ""
        }<td style="padding:18px 24px;font-family:Arial,Helvetica,sans-serif">
            <div style="color:#0284c7;font-size:20px;font-weight:700;line-height:1.2">Trend Code Technology</div>
            <div style="color:#fb923c;font-size:10.5px;letter-spacing:2.6px;font-weight:700">WE BUILD YOUR FUTURE</div>
          </td></tr></table>`;

  // Body — the owner's faint TCT logo watermark sits behind the text
  const bodyStyle = hasWatermark
    ? "background-color:#f5f9ff;background-image:url('cid:tct-watermark@asset');background-repeat:no-repeat;background-position:center center;background-size:440px auto;padding:32px 34px 36px;font-family:Arial,Helvetica,sans-serif;color:#334155;font-size:15px;line-height:1.65"
    : "background-color:#f5f9ff;padding:32px 34px 36px;font-family:Arial,Helvetica,sans-serif;color:#334155;font-size:15px;line-height:1.65";

  // CTA box — brand light-blue ↔ orange gradient that spins continuously
  // while the mouse is over it (hover animation; static gradient elsewhere)
  const button = `<a href="${escapeHtml(k.cta.href)}" class="tct-btn" style="display:inline-block;font-family:Arial,Helvetica,sans-serif;font-size:15px;font-weight:700;color:#ffffff;text-decoration:none;padding:14px 30px;border-radius:9px;background-color:#0284c7;background-image:linear-gradient(90deg,#0284c7 0%,#0ea5e9 35%,#f97316 70%,#fb923c 100%);background-size:200% 100%;background-position:0% 50%">${k.cta.label}</a>`;

  // Footer — the SAME owner banner as background with the address over it
  const footer = hasEmailBanner
    ? `<div style="${bannerBg};padding:16px 26px;text-align:center;font-family:Arial,Helvetica,sans-serif">
        <div style="color:#ffffff;font-size:12.5px;line-height:1.75;text-shadow:0 1px 3px rgba(0,0,0,.6)">
          <b>Trend Code Technology</b><br>
          No. 215, 2nd Floor, Shakthi Nagar, Near ICICI Bank, Ganapathy, Coimbatore — 641006<br>
          +91 93848 47922 · trendcodetechnology2026@gmail.com
        </div>
      </div>`
    : hasFooter
      ? `<img src="cid:tct-footer@banner" width="600" alt="" style="display:block;width:100%;max-width:600px;height:auto;border:0"><div style="padding:14px 24px 18px;background:#f8fafc;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.7;color:#64748b;text-align:center">Trend Code Technology · Ganapathy, Coimbatore — 641006</div>`
      : `<div style="background:#f1f5f9;padding:18px 26px;font-family:Arial,Helvetica,sans-serif;color:#64748b;font-size:12.5px;line-height:1.7">${THANK_YOU_SIGNATURE}</div>`;

  // Outer address line — redundant when the footer banner already shows it
  const bottomLine = hasEmailBanner
    ? ""
    : `<table role="presentation" width="600" align="center" style="width:600px;max-width:100%;margin:12px auto 0"><tr><td style="text-align:center;font-family:Arial,Helvetica,sans-serif;font-size:11.5px;color:#94a3b8;padding:0 12px 26px">No. 215, 2nd Floor, Shakthi Nagar, Near ICICI Bank, Ganapathy, Coimbatore — 641006</td></tr></table>`;

  const html = `<!doctype html><html><body style="margin:0;padding:0;background-color:#eef3fb">
<div style="display:none;max-height:0;overflow:hidden;opacity:0">${escapeHtml(k.subject)} — Hi ${safeName}, thank you!</div>
<style>
  .tct-btn{transition:box-shadow .2s ease,filter .2s ease}
  .tct-btn:hover{animation:tctShift .9s linear infinite;box-shadow:0 8px 22px rgba(56,189,248,.45),0 8px 26px rgba(249,115,22,.35);filter:brightness(1.06)}
  .tct-btn:active{filter:brightness(.94)}
  @keyframes tctShift{0%{background-position:0% 50%}100%{background-position:-200% 50%}}
  @media (max-width:620px){.tct-wrap{width:100% !important}.tct-btn{display:block !important;text-align:center}}
</style>
<table role="presentation" class="tct-wrap" width="600" cellpadding="0" cellspacing="0" border="0" align="center" style="width:600px;max-width:100%;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 10px 30px rgba(15,23,42,.08)">
  <tr><td>${header}</td></tr>
  <tr>
    <td style="${bodyStyle}">
      <p style="margin:0 0 14px">Hi ${safeName},</p>
      <p style="margin:0 0 14px;font-size:17px;color:#0f172a"><b>Thank you for your interest in <span style="color:#0284c7">Trend Code Technology</span>.</b></p>
      <p style="margin:0 0 14px">${k.intro(detail)}</p>
      <p style="margin:0 0 14px">${k.next}</p>
      <p style="margin:0 0 4px;color:#64748b">${k.more}</p>
      <p style="margin:24px 0 6px">${button}</p>
      <p style="margin:22px 0 0;font-size:13.5px;color:#64748b">If anything needs changing, just reply to this mail — it lands straight with our team.</p>
    </td>
  </tr>
  <tr><td>${footer}</td></tr>
</table>
${bottomLine}
</body></html>`;

  // dev aid: MAIL_DUMP=/path/file.html writes the rendered mail for inspection
  if (process.env.MAIL_DUMP) {
    try {
      fs.writeFileSync(process.env.MAIL_DUMP, html);
    } catch {}
  }

  const text = [
    `Hi ${name || "there"},`,
    "",
    "Thank you for your interest in Trend Code Technology.",
    "",
    String(k.intro("")).replace(/<[^>]+>/g, ""),
    k.next,
    k.more,
    "",
    `${k.cta.label}: ${k.cta.href}`,
    "",
    "Reply to this mail or WhatsApp +91 93848 47922 if you need anything.",
    "",
    "Trend Code Technology — We Build Your Future",
    "Ganapathy, Coimbatore — 641006",
  ].join("\n");
  try {
    await mailer.sendMail({
      from: `"Trend Code Technology" <${SMTP_USER}>`,
      to,
      subject: k.subject,
      text,
      html,
      attachments,
    });
    console.log(
      `[thankyou] sent to ${to} (${kind}) — attachments: ${attachments.length ? attachments.map((a) => a.filename).join(", ") : "none"}`
    );
  } catch (err) {
    console.error(`[thankyou] failed for ${to} (${kind}):`, err.message);
  }
}

// ---------- offer sender (HR internship confirmation letter) ----------
function formatOfferDate(d) {
  if (!d) return "";
  try {
    const dt = new Date(d);
    if (isNaN(dt.getTime())) return String(d);
    return dt.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return String(d);
  }
}

async function sendOfferLetterEmail({
  candidateName,
  candidateEmail,
  salutation,
  role,
  field,
  startDate,
  endDate,
  refId,
}) {
  if (!mailer) {
    throw new Error("SMTP mailer is not configured.");
  }

  const attachments = [];
  const hasLogo = attachMailAsset(attachments, "logo", "tctlogo");
  const hasBanner = attachMailAsset(attachments, "email banner", "tctbanner");

  const logoHtml = hasLogo
    ? `<img src="cid:tctlogo" alt="Trend Code Technology" style="height: 48px; width: auto; margin-bottom: 12px; display: inline-block;" />`
    : `<img src="${PUBLIC_SITE_URL}/tct-logo.png" alt="Trend Code Technology" style="height: 48px; width: auto; margin-bottom: 12px; display: inline-block;" />`;

  const bannerHtml = hasBanner
    ? `<div style="text-align: center; margin-bottom: 24px;"><img src="cid:tctbanner" alt="Trend Code Technology" style="max-width: 100%; height: auto; border-radius: 8px;" /></div>`
    : "";

  const text = [
    `Dear ${salutation} ${candidateName},`,
    "",
    `We are pleased to confirm your position as a "${role}" at "TREND CODE TECHNOLOGY". Your internship began on ${startDate} to ${endDate} and is currently ongoing.`,
    "",
    `During this internship, you are expected to contribute to ${field} tasks, assist in coding and debugging activities, and support project requirements as assigned. This internship is designed to enhance your technical skills and provide valuable hands-on industry experience.`,
    "",
    "We appreciate your contribution so far and look forward to your continued dedication and learning.",
    "",
    "Reference ID: " + refId,
    "Position: " + role,
    "Domain / Field: " + field,
    "Internship Period: " + startDate + " to " + endDate,
    "",
    "Warm regards,",
    "HR & Talent Operations",
    "Trend Code Technology",
    "Ganapathy, Coimbatore — 641006",
    "+91 93848 47922 · trendcodetechnology2026@gmail.com · https://tctechs.in",
  ].join("\n");

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Internship Offer Letter — Trend Code Technology</title>
</head>
<body style="margin: 0; padding: 24px 12px; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; color: #1e293b;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width: 650px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.08); border: 1px solid #e2e8f0;">
    <!-- Header -->
    <tr>
      <td style="background: linear-gradient(135deg, #0d6efd 0%, #06b6d4 100%); padding: 36px 30px; text-align: center;">
        ${logoHtml}
        <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 800; letter-spacing: 0.5px;">TREND CODE TECHNOLOGY</h1>
        <p style="margin: 6px 0 0; color: #e0f2fe; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px;">Official Internship Offer & Confirmation</p>
      </td>
    </tr>
    <!-- Letter Meta bar -->
    <tr>
      <td style="background: #f8fafc; padding: 14px 30px; border-bottom: 1px solid #e2e8f0;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="font-size: 13px; color: #64748b; font-weight: 600;">
              Ref: <span style="color: #0f172a; font-family: monospace;">${escapeHtml(refId)}</span>
            </td>
            <td align="right" style="font-size: 13px; color: #64748b; font-weight: 600;">
              Date: <span style="color: #0f172a;">${new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}</span>
            </td>
          </tr>
        </table>
      </td>
    </tr>
    <!-- Body Content -->
    <tr>
      <td style="padding: 36px 32px 28px;">
        ${bannerHtml}
        <p style="font-size: 16px; color: #0f172a; margin: 0 0 20px; font-weight: 700;">
          Dear ${escapeHtml(salutation)} ${escapeHtml(candidateName)},
        </p>
        <p style="font-size: 15px; line-height: 1.75; color: #334155; margin: 0 0 18px;">
          We are pleased to confirm your position as a <strong>&ldquo;${escapeHtml(role)}&rdquo;</strong> at <strong>&ldquo;TREND CODE TECHNOLOGY&rdquo;</strong>. Your internship began on <strong>${escapeHtml(startDate)}</strong> to <strong>${escapeHtml(endDate)}</strong> and is currently ongoing.
        </p>
        <p style="font-size: 15px; line-height: 1.75; color: #334155; margin: 0 0 18px;">
          During this internship, you are expected to contribute to <strong>${escapeHtml(field)}</strong> tasks, assist in coding and debugging activities, and support project requirements as assigned. This internship is designed to enhance your technical skills and provide valuable hands-on industry experience.
        </p>
        <p style="font-size: 15px; line-height: 1.75; color: #334155; margin: 0 0 26px;">
          We appreciate your contribution so far and look forward to your continued dedication and learning.
        </p>

        <!-- Summary Card -->
        <table width="100%" cellpadding="0" cellspacing="0" style="background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 12px; margin-bottom: 28px;">
          <tr>
            <td style="padding: 16px 20px; border-bottom: 1px solid #e2e8f0;">
              <span style="font-size: 12px; color: #64748b; text-transform: uppercase; font-weight: 700; letter-spacing: 0.8px;">Designation / Role</span><br>
              <strong style="font-size: 15px; color: #0f172a;">${escapeHtml(role)}</strong>
            </td>
            <td style="padding: 16px 20px; border-bottom: 1px solid #e2e8f0;">
              <span style="font-size: 12px; color: #64748b; text-transform: uppercase; font-weight: 700; letter-spacing: 0.8px;">Domain / Field</span><br>
              <strong style="font-size: 15px; color: #0f172a;">${escapeHtml(field)}</strong>
            </td>
          </tr>
          <tr>
            <td style="padding: 16px 20px;">
              <span style="font-size: 12px; color: #64748b; text-transform: uppercase; font-weight: 700; letter-spacing: 0.8px;">Internship Period</span><br>
              <strong style="font-size: 14px; color: #0f172a;">${escapeHtml(startDate)} &mdash; ${escapeHtml(endDate)}</strong>
            </td>
            <td style="padding: 16px 20px;">
              <span style="font-size: 12px; color: #64748b; text-transform: uppercase; font-weight: 700; letter-spacing: 0.8px;">Status</span><br>
              <span style="display: inline-block; background: #ecfdf5; color: #059669; font-weight: 700; font-size: 12.5px; padding: 3px 10px; border-radius: 999px; border: 1px solid #a7f3d0;">Active &middot; Ongoing</span>
            </td>
          </tr>
        </table>

        <!-- Sign-off Block -->
        <div style="border-top: 1.5px solid #e2e8f0; padding-top: 22px; margin-top: 10px;">
          <p style="margin: 0 0 6px; font-size: 14px; color: #64748b;">Warm regards,</p>
          <p style="margin: 0; font-size: 16px; font-weight: 800; color: #0f172a;">HR & Talent Operations</p>
          <p style="margin: 2px 0 0; font-size: 14px; font-weight: 700; color: #0d6efd;">Trend Code Technology</p>
          <p style="margin: 6px 0 0; font-size: 13px; color: #64748b; line-height: 1.5;">
            Ganapathy, Coimbatore &mdash; 641006, Tamil Nadu, India<br>
            Phone: +91 93848 47922 &middot; Email: <a href="mailto:trendcodetechnology2026@gmail.com" style="color: #0d6efd; text-decoration: none;">trendcodetechnology2026@gmail.com</a>
          </p>
        </div>
      </td>
    </tr>
    <!-- Footer -->
    <tr>
      <td style="background-color: #0f172a; padding: 20px 30px; text-align: center; color: #94a3b8; font-size: 12px; line-height: 1.6;">
        &copy; 2026 Trend Code Technology. All Rights Reserved.<br>
        This is an official computer-generated confirmation letter.
      </td>
    </tr>
  </table>
</body>
</html>`;

  await mailer.sendMail({
    from: `"Trend Code Technology" <${SMTP_USER}>`,
    to: candidateEmail,
    bcc: NOTIFY_EMAIL,
    subject: `Official Internship Offer & Confirmation — ${candidateName} | Trend Code Technology`,
    text,
    html,
    attachments,
  });

  console.log(`[offer] sent offer letter to ${candidateEmail} for ${candidateName} (${role})`);
}

// ---------- routes ----------
app.get("/api/health", requireAdmin, async (req, res) => {
  // ?connect=1 forces a real Atlas attempt (and reports why it failed).
  const force = req.query && (req.query.connect === "1" || req.query.connect === "true");
  const db = force ? await probeDb() : dbStatus();
  const g = globalThis;
  res.json({
    ok: true,
    service: "tct-api",
    time: new Date().toISOString(),
    // quick ops diagnostics: which backend is answering requests right now
    storage: MONGO_URI ? "mongodb" : IS_SERVERLESS ? "memory" : "file",
    db,
    dbError: db === "unavailable" || db === "not-tried-yet" ? g.__tctMongoErr || "" : "",
    smtp: mailer ? "configured" : "not-configured",
    // "meta" = Meta WhatsApp Cloud API, "callmebot" = legacy fallback, "off"
    whatsapp: whatsappMode(),
  });
});

app.post("/api/leads", async (req, res) => {
  const { name, email, phone, service, message } = req.body || {};
  if (!name || !message || (!email && !phone)) {
    return res
      .status(400)
      .json({ error: "Name, a phone number or email, and message are required." });
  }
  if (email && !VALID_EMAIL.test(email)) {
    return res.status(400).json({ error: "Please enter a valid email address." });
  }

  const lead = {
    id: `${Date.now()}`,
    name: String(name).slice(0, 120),
    email: String(email || "").slice(0, 160),
    phone: String(phone || "").slice(0, 40),
    service: String(service || "").slice(0, 80),
    message: String(message).slice(0, 4000),
    source: "quote-form",
    createdAt: new Date().toISOString(),
  };

  await appendList(FILES.leads, lead); // atomic — concurrent leads never clobber

  // Owner alerts (email + WhatsApp) + the "Thank you" auto-reply to the
  // sender. Awaited on Vercel (work started after the response would be
  // frozen mid-send); non-blocking locally.
  await runNotifications([
    () => notifyNewLead(lead),
    () => notifyWhatsApp(lead),
    () => sendThankYou(lead.email, lead.name, "enquiry"),
  ]);

  res.status(201).json({
    ok: true,
    id: lead.id,
    message: "Thanks! Your request reached our team — we'll reply within 24 hours.",
  });
});

// ---------- Job applications (careers) ----------
async function notifyApplication(app_, resumeBuffer = null) {
  // Email
  if (mailer) {
    const text = [
      "New job application from the website:",
      "",
      `Name:      ${app_.name}`,
      `Email:     ${app_.email}`,
      `Phone:     ${app_.phone || "-"}`,
      `Position:  ${app_.position}`,
      `Experience:${app_.experience}`,
      `GitHub:    ${app_.github || "-"}`,
      `Resume:    ${app_.resumeFile ? app_.resumeFile : "(not attached)"}`,
      "",
      `Cover letter:`,
      app_.coverLetter || "-",
      "",
      `Time: ${app_.createdAt}`,
    ].join("\n");
    try {
      await mailer.sendMail({
        from: `"TCT Website" <${SMTP_USER}>`,
        to: NOTIFY_EMAIL,
        subject: `💼 New job application — ${app_.name} (${app_.position})`,
        text,
        replyTo: app_.email,
        attachments: buildResumeAttachment(app_, resumeBuffer),
      });
      console.log(`[application] emailed notification for ${app_.name}`);
    } catch (err) {
      console.error("[application] email failed:", err.message);
    }
  }
  // WhatsApp
  const result = await sendWhatsApp(
    `💼 New job application — ${app_.name}\n` +
      `📋 ${app_.position} (${app_.experience})\n` +
      `📞 ${app_.phone || "-"}\n` +
      `📧 ${app_.email}\n` +
      (app_.github ? `🐙 ${app_.github}\n` : "") +
      (app_.resumeFile ? `📎 resume attached` : "")
  );
  if (result.ok) console.log(`[application] WhatsApp alert sent for ${app_.name}`);
}

// ---------- Tour / travel enquiries (Tourism page form) ----------
async function notifyTourEnquiry(en) {
  // Email — the travel desk's copy of the enquiry
  if (mailer) {
    const text = [
      "New TOUR enquiry from the Tourism page:",
      "",
      `Name:        ${en.name}`,
      `Phone:       ${en.phone}`,
      `Email:       ${en.email || "-"}`,
      `Destination: ${en.destination}`,
      `Scope:       ${en.scope || "-"}`,
      `Travel date: ${en.travelDate || "-"}`,
      `Travellers:  ${en.travelers || "-"}`,
      `Budget:      ${en.budget || "-"}`,
      `Flights:     ${en.flightNeeded || "-"}`,
      `Passports:   ${en.passportAvailable || "-"}`,
      `Message:  ${en.message || "-"}`,
      "",
      `Time: ${en.createdAt}`,
    ].join("\n");
    try {
      await mailer.sendMail({
        from: `"TCT Website" <${SMTP_USER}>`,
        to: NOTIFY_EMAIL,
        subject: `✈️ New tour enquiry — ${en.name} (${en.destination})`,
        text,
        ...(en.email && VALID_EMAIL.test(en.email) ? { replyTo: en.email } : {}),
      });
      console.log(`[tour] emailed notification for ${en.name}`);
    } catch (err) {
      console.error("[tour] email failed:", err.message);
    }
  }
  // WhatsApp — one screen, owner-readable
  const result = await sendWhatsApp(
    `✈️ New tour enquiry — ${en.name}\n` +
      `🌍 ${en.destination}\n` +
      `📅 ${en.travelDate || "—"} · 👥 ${en.travelers || "—"}\n` +
      (en.budget ? `💰 ${en.budget}\n` : "") +
      `📞 ${en.phone}\n` +
      (en.email ? `📧 ${en.email}\n` : "") +
      (en.message ? `\n${String(en.message).slice(0, 200)}` : "")
  );
  if (result.ok) console.log(`[tour] WhatsApp alert sent for ${en.name}`);
}

app.post("/api/tour-enquiries", async (req, res) => {
  const {
    name,
    phone,
    email,
    travelers,
    travelDate,
    destination,
    budget,
    message,
    indiaOrInternational,
    flightNeeded,
    passportAvailable,
  } = req.body || {};

  if (!name || !phone || !destination) {
    return res
      .status(400)
      .json({ error: "Name, phone and destination are required." });
  }
  if (email && !VALID_EMAIL.test(email)) {
    return res.status(400).json({ error: "Please enter a valid email address." });
  }

  const enquiry = {
    id: `${Date.now()}`,
    name: String(name).slice(0, 120),
    phone: String(phone).slice(0, 40),
    email: String(email || "").slice(0, 160),
    travelers: String(travelers || "").slice(0, 20),
    travelDate: String(travelDate || "").slice(0, 40),
    destination: String(destination).slice(0, 120),
    budget: String(budget || "").slice(0, 60),
    message: String(message || "").slice(0, 2000),
    scope: String(indiaOrInternational || "").slice(0, 20),
    flightNeeded: String(flightNeeded || "").slice(0, 40),
    passportAvailable: String(passportAvailable || "").slice(0, 40),
    source: "tourism-page",
    status: "new",
    createdAt: new Date().toISOString(),
  };

  await appendList(FILES["tour-enquiries"], enquiry);

  await runNotifications([
    () => notifyTourEnquiry(enquiry),
    () =>
      sendThankYou(
        enquiry.email,
        enquiry.name,
        "tour",
        enquiry.destination
      ),
  ]);

  res.status(201).json({
    ok: true,
    id: enquiry.id,
    message:
      "Thanks! Your tour enquiry reached our travel desk — we'll reply with itineraries within 24 hours.",
  });
});

app.get("/api/admin/tour-enquiries", requireAdmin, async (_req, res) => {
  res.json(
    (await readList(FILES["tour-enquiries"]))
      .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
      .slice(0, 200)
  );
});

app.delete("/api/admin/tour-enquiries", requireAdmin, async (req, res) => {
  const { id } = req.body || {};
  if (!id) return res.status(400).json({ error: "Enquiry id is required." });
  const list = await readList(FILES["tour-enquiries"]);
  const next = list.filter((e) => e.id !== String(id));
  if (next.length === list.length) {
    return res.status(404).json({ error: "Enquiry not found." });
  }
  await writeList(FILES["tour-enquiries"], next);
  res.json({ ok: true, deleted: String(id), remaining: next.length });
});

// ---------- Photo Gallery Endpoints ----------
const SEED_GALLERY = [
  {
    id: "gal-1",
    title: "TCT Engineering Lab & Development Center",
    category: "Office",
    imageUrl: "/slide-2.jpg",
    date: "2026-02-15",
    description: "Our state-of-the-art software engineering floor in Ganapathy, Coimbatore.",
    createdAt: "2026-02-15T10:00:00.000Z",
  },
  {
    id: "gal-2",
    title: "Client Collaboration & Tech Meetup",
    category: "Events",
    imageUrl: "/slide-1.jpg",
    date: "2026-02-20",
    description: "Brainstorming modern cloud architectures and product roadmaps with enterprise partners.",
    createdAt: "2026-02-20T11:30:00.000Z",
  },
  {
    id: "gal-3",
    title: "Code Sprint & Hackathon",
    category: "Workspace",
    imageUrl: "/hero-poster.jpg",
    date: "2026-03-01",
    description: "Full-stack developer sprint solving real-world challenges with AI and modern web frameworks.",
    createdAt: "2026-03-01T15:00:00.000Z",
  },
  {
    id: "gal-4",
    title: "TCT Leadership & Management Team",
    category: "Team",
    imageUrl: "/team/bharath.jpg",
    date: "2026-03-05",
    description: "Under the visionary leadership of Mr. Bharath T, Founder & CEO.",
    createdAt: "2026-03-05T09:00:00.000Z",
  },
  {
    id: "gal-5",
    title: "Team Outing & Annual Retreat",
    category: "Celebrations",
    imageUrl: "/tourism/ooty.jpg",
    date: "2026-03-10",
    description: "Recharging minds amidst the Nilgiri hills during our annual team celebration.",
    createdAt: "2026-03-10T14:00:00.000Z",
  },
  {
    id: "gal-6",
    title: "TCT Brand & Excellence Milestone",
    category: "Achievements",
    imageUrl: "/tct-shirt-logo.png",
    date: "2026-03-12",
    description: "Celebrating 1,150+ completed client deliveries and rapid expansion across sectors.",
    createdAt: "2026-03-12T16:00:00.000Z",
  },
];

// GET /api/gallery (public list)
app.get("/api/gallery", async (_req, res) => {
  try {
    let list = await readList(FILES.gallery);
    if (!list || list.length === 0) {
      list = SEED_GALLERY;
      await writeList(FILES.gallery, list);
    }
    const sorted = [...list].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
    res.json(sorted);
  } catch (err) {
    console.error("[gallery] error reading list:", err);
    res.json(SEED_GALLERY);
  }
});

// POST /api/admin/gallery (admin upload / post)
app.post(
  "/api/admin/gallery",
  requireAdmin,
  (req, res, next) => {
    uploadGallery.single("image")(req, res, (err) => {
      if (err) {
        return res.status(400).json({ error: err.message || "Image upload failed." });
      }
      next();
    });
  },
  async (req, res) => {
    try {
      const { title, category, date, description } = req.body || {};
      let imageUrl = req.body && req.body.imageUrl ? String(req.body.imageUrl).trim() : "";

      if (req.file) {
        const mime = req.file.mimetype || "image/jpeg";
        const b64 = req.file.buffer.toString("base64");
        imageUrl = `data:${mime};base64,${b64}`;
      }

      if (!title || !String(title).trim()) {
        return res.status(400).json({ error: "Photo title is required." });
      }
      if (!imageUrl) {
        return res.status(400).json({ error: "Please select an image file or provide an image URL." });
      }

      const newItem = {
        id: "gal-" + Date.now() + "-" + crypto.randomBytes(3).toString("hex"),
        title: String(title).trim(),
        category: category && String(category).trim() ? String(category).trim() : "General",
        imageUrl,
        date: date && String(date).trim() ? String(date).trim() : new Date().toISOString().slice(0, 10),
        description: description ? String(description).trim() : "",
        createdAt: new Date().toISOString(),
      };

      let list = await readList(FILES.gallery);
      if (!list || list.length === 0) {
        list = [...SEED_GALLERY];
      }
      list.unshift(newItem);
      await writeList(FILES.gallery, list);

      res.status(201).json({ ok: true, item: newItem });
    } catch (err) {
      console.error("[gallery] post error:", err);
      res.status(500).json({ error: "Failed to post photo to gallery." });
    }
  }
);

// DELETE /api/admin/gallery/:id or DELETE /api/admin/gallery
app.delete("/api/admin/gallery/:id?", requireAdmin, async (req, res) => {
  try {
    const id = req.params.id || (req.body && req.body.id);
    if (!id) {
      return res.status(400).json({ error: "Photo ID is required to delete." });
    }
    let list = await readList(FILES.gallery);
    if (!list || list.length === 0) {
      list = [...SEED_GALLERY];
    }
    const next = list.filter((item) => String(item.id) !== String(id));
    if (next.length === list.length) {
      return res.status(404).json({ error: "Photo not found in gallery." });
    }
    await writeList(FILES.gallery, next);
    res.json({ ok: true, deleted: String(id), remaining: next.length });
  } catch (err) {
    console.error("[gallery] delete error:", err);
    res.status(500).json({ error: "Failed to delete photo from gallery." });
  }
});

app.post("/api/apply", uploadResume.single("resume"), async (req, res) => {
  const { name, email, phone, position, experience, github, coverLetter } =
    req.body || {};
  if (!name || !email || !position || !experience) {
    if (req.file) fs.unlink(req.file.path, () => {});
    return res.status(400).json({ error: "Name, email, position and experience are required." });
  }
  if (!VALID_EMAIL.test(email)) {
    if (req.file) fs.unlink(req.file.path, () => {});
    return res.status(400).json({ error: "Please enter a valid email address." });
  }

  const application = {
    id: `${Date.now()}`,
    name: String(name).slice(0, 120),
    email: String(email).slice(0, 160),
    phone: String(phone || "").slice(0, 40),
    position: String(position).slice(0, 80),
    experience: String(experience).slice(0, 40),
    github: String(github || "").slice(0, 200),
    coverLetter: String(coverLetter || "").slice(0, 4000),
    resumeFile: req.file ? (req.file.filename || req.file.originalname) : null,
    resumeBuffer: req.file && req.file.buffer ? req.file.buffer : null,
    status: "new",
    createdAt: new Date().toISOString(),
  };

  // the resume buffer is emailed, never stored inside the record itself;
  // with MongoDB it is kept beside it so the admin panel can still download it
  const resumeBuffer = application.resumeBuffer || null;
  delete application.resumeBuffer;
  if (MONGO_URI && resumeBuffer) {
    application.resumeData = resumeBuffer.toString("base64");
  }
  await appendList(FILES.applications, application);

  // Both mails are awaited on Vercel so nothing is cut off after the response.
  const ownerNotify = notifyApplication(application, resumeBuffer);
  await runNotifications([
    () => ownerNotify,
    () => sendThankYou(application.email, application.name, "career", application.position),
  ]);

  res.status(201).json({
    ok: true,
    id: application.id,
    message: "Application received! Our HR team will review it and get back to you.",
  });
});

// ---------- admin auth guard (session-token based) ----------
async function requireAdmin(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;
    const session = await getSession(token);
    if (!session) {
      return res.status(401).json({ error: "Unauthorized. Please sign in again." });
    }
    req.adminSession = session;
    next();
  } catch (err) {
    next(err);
  }
}

// Downloads a stored resume. Only via short-lived signed link (downloadKey).
// Order: MongoDB copy (Vercel) → local disk copy → clear error.
function contentTypeForResume(name) {
  const ext = path.extname(name).toLowerCase();
  if (ext === ".pdf") return "application/pdf";
  if (ext === ".doc") return "application/msword";
  if (ext === ".docx")
    return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
  return "application/octet-stream";
}

app.get("/api/admin/resume/:file", async (req, res) => {
  const { file } = req.params;
  const { key } = req.query;
  if (!key || key !== resumeLinkKey(file)) {
    return res.status(403).json({ error: "Invalid or expired download link." });
  }
  const safe = path.basename(file);

  // 1) MongoDB copy — resumes uploaded on Vercel live beside the record
  if (MONGO_URI) {
    for (const storeFile of [FILES.applications, FILES.internships]) {
      const list = await listGet(storeFile);
      const rec = list.find((r) => r.resumeFile === safe && r.resumeData);
      if (rec) {
        res.setHeader("Content-Type", contentTypeForResume(safe));
        res.setHeader("Content-Disposition", `attachment; filename="${safe}"`);
        return res.send(Buffer.from(rec.resumeData, "base64"));
      }
    }
  }

  // 2) local disk copy
  if (!IS_SERVERLESS) {
    const full = path.join(UPLOAD_DIR, safe);
    if (fs.existsSync(full)) return res.download(full);
  }

  // 3) nothing to serve on this deployment
  return res.status(404).json({
    error: MONGO_URI
      ? "Resume file not found."
      : "Resume files are emailed to the team inbox on this deployment — check NOTIFY_EMAIL.",
  });
});

// Short-lived key so the resume URL is not usable forever or guessable.
const RESUME_KEY_SECRET = process.env.ADMIN_TOKEN || (IS_SERVERLESS ? "" : crypto.randomBytes(32).toString("hex"));
function resumeLinkKey(file) {
  if (!RESUME_KEY_SECRET) return null;
  // rotate daily: links from yesterday still work today, then expire
  const day = new Date().toISOString().slice(0, 10);
  const prev = new Date(Date.now() - 864e5).toISOString().slice(0, 10);
  return crypto.createHash("sha256").update(`${file}|${RESUME_KEY_SECRET}|${day}`).digest("hex").slice(0, 32)
    + "." +
    crypto.createHash("sha256").update(`${file}|${RESUME_KEY_SECRET}|${prev}`).digest("hex").slice(0, 32);
}

app.get("/api/admin/applications", requireAdmin, async (req, res) => {
  const list = (await readList(FILES.applications)).sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  const withLinks = list.map((a) => {
    const rec = { ...a };
    delete rec.resumeData; // base64 copy never goes over the list API
    return {
      ...rec,
      resumeUrl: rec.resumeFile && RESUME_KEY_SECRET
        ? `/api/admin/resume/${encodeURIComponent(rec.resumeFile)}?key=${resumeLinkKey(rec.resumeFile)}`
        : null,
    };
  });
  res.json(withLinks);
});

// ---------- admin auth: sessions, login activity, force-logout ----------
const FILES_AUTHLOG = path.join(DATA_DIR, "authlog.json");
const FILES_SESSIONS = path.join(DATA_DIR, "sessions.json");
const MAX_LOGIN_ATTEMPTS = 5; // failed tries before lockout
const LOCKOUT_MINUTES = 15; // lock window
const SESSION_TTL_HOURS = 12; // auto-expiry for admin sessions

// Same storage layer as the lists (MongoDB → memory → file).
const readJson = (file, fallback) =>
  listGet(file).then((list) => (list.length ? list : fallback));
const writeJson = (file, list) => listSet(file, list);

// Sessions replace the old static ADMIN_TOKEN — each login mints its own
// token so the admin can kick a device remotely via force logout.
const readSessions = () => readJson(FILES_SESSIONS, []);
const writeSessions = (list) => writeJson(FILES_SESSIONS, list);

async function createSession(req, email) {
  const token = crypto.randomBytes(24).toString("hex");
  const session = {
    token,
    email,
    ip: clientIp(req),
    device: deviceSummary(req.headers["user-agent"]),
    userAgent: String(req.headers["user-agent"] || "").slice(0, 220),
    location: lookupLocation(clientIp(req)),
    createdAt: new Date().toISOString(),
    lastSeenAt: new Date().toISOString(),
  };
  await appendList(FILES_SESSIONS, session);
  // prune expired (older than TTL) — keeps the list small
  const cutoff = Date.now() - SESSION_TTL_HOURS * 3600 * 1000;
  const kept = (await readSessions()).filter(
    (s) => new Date(s.createdAt).getTime() > cutoff
  );
  await writeSessions(kept);
  return token;
}

// How stale "last active" may be before we pay a second trip to the database.
// Every admin request used to rewrite the whole session list just to bump
// lastSeenAt, which doubled the response time of the admin dashboard.
const SESSION_TOUCH_MS = 60_000;
async function getSession(token) {
  if (!token) return null;
  const cutoff = Date.now() - SESSION_TTL_HOURS * 3600 * 1000;
  const list = (await readSessions()).filter(
    (s) => new Date(s.createdAt).getTime() > cutoff
  );
  const found = list.find((s) => s.token === token);
  if (found) {
    const last = new Date(found.lastSeenAt || found.createdAt).getTime();
    if (Date.now() - last > SESSION_TOUCH_MS) {
      found.lastSeenAt = new Date().toISOString();
      await writeSessions(list);
    }
  }
  return found || null;
}

async function revokeSession(token) {
  const list = (await readSessions()).filter((s) => s.token !== token);
  await writeSessions(list);
}

// Login activity log + persistence
const readAuthLog = () => readJson(FILES_AUTHLOG, []);
const writeAuthLog = (list) => writeJson(FILES_AUTHLOG, list);

async function logAuthEvent(type, req, extra = {}) {
  const ip = clientIp(req);
  const entry = {
    id: `${Date.now()}`,
    type, // login | logout | failed | force-logout
    email: String(extra.email || "").slice(0, 120),
    ip,
    location: lookupLocation(ip),
    device: deviceSummary(req.headers["user-agent"]),
    userAgent: String(req.headers["user-agent"] || "").slice(0, 220),
    ...extra,
    createdAt: new Date().toISOString(),
  };
  // keep the log bounded (latest 500 events) — atomic append with trim
  await appendList(FILES_AUTHLOG, entry, 500);
  // resolve location in the background (entry is updated for future reads)
  geoLookupAsync(ip);
  return entry;
}

function clientIp(req) {
  return (
    (req.headers["x-forwarded-for"] || req.socket?.remoteAddress || "")
      .toString()
      .split(",")[0]
      .trim()
      .replace(/^::ffff:/, "")
      .replace(/^::1$/, "127.0.0.1")
  );
}

function deviceSummary(ua) {
  const s = String(ua || "");
  const browser =
    /Edg\//.test(s) ? "Edge"
    : /OPR\//.test(s) ? "Opera"
    : /Chrome\//.test(s) ? "Chrome"
    : /Safari\//.test(s) ? "Safari"
    : /Firefox\//.test(s) ? "Firefox"
    : "Unknown browser";
  const os =
    /Windows/.test(s) ? "Windows"
    : /Android/.test(s) ? "Android"
    : /iPhone|iPad/.test(s) ? "iOS"
    : /Mac OS X/.test(s) ? "macOS"
    : /Linux/.test(s) ? "Linux"
    : "Unknown OS";
  const type = /Mobile|Android|iPhone/.test(s) ? "Mobile" : "Desktop";
  return `${browser} · ${os} · ${type}`;
}

// IP → approximate location. Uses ip-api.com (free, no key, 45 req/min);
// results are cached so repeated logins don't re-hit the API. Private IPs
// (localhost / LAN) return a local label. On serverless there is no cache
// persistence — each lookup is a best-effort fetch.
const geoCache = new Map(); // ip -> { city, region, country, fetchedAt }
function lookupLocation(ip) {
  if (!ip) return null;
  if (
    /^(127\.|10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.|169\.254\.)/.test(ip) ||
    ip === "::1" || ip === "localhost"
  ) {
    return { city: "Local network", region: "", country: "", flag: "🏠" };
  }
  const cached = geoCache.get(ip);
  if (cached && Date.now() - cached.fetchedAt < 24 * 3600 * 1000) return cached;
  return null; // resolved async by geoLookupAsync on first sight
}

function geoLookupAsync(ip) {
  if (!ip || geoCache.has(ip)) return;
  if (
    /^(127\.|10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.|169\.254\.)/.test(ip) ||
    ip === "::1"
  ) {
    geoCache.set(ip, { city: "Local network", region: "", country: "", flag: "🏠", fetchedAt: Date.now() });
    return;
  }
  geoCache.set(ip, { city: null, region: null, country: null, flag: null, fetchedAt: Date.now() }); // in-flight marker
  const timeout = AbortSignal.timeout ? AbortSignal.timeout(2500) : undefined;
  fetch(`http://ip-api.com/json/${ip}?fields=city,regionName,country,countryCode`)
    .then((r) => r.json())
    .then((g) => {
      if (g && g.country) {
        geoCache.set(ip, {
          city: g.city || "",
          region: g.regionName || "",
          country: g.country || "",
          flag: g.countryCode ? countryCodeFlag(g.countryCode) : null,
          fetchedAt: Date.now(),
        });
      } else {
        geoCache.delete(ip); // allow retry later
      }
    })
    .catch(() => geoCache.delete(ip));
}

function countryCodeFlag(cc) {
  if (!cc || cc.length !== 2) return "";
  return String.fromCodePoint(...[...cc.toUpperCase()].map((c) => 127397 + c.charCodeAt(0)));
}

function locationText(loc) {
  if (!loc) return "Resolving…";
  if (!loc.city && !loc.country) return "Unknown";
  const parts = [loc.city, loc.region].filter(Boolean);
  return `${loc.flag || "📍"} ${parts.join(", ")}${loc.country ? (parts.length ? ", " : "") + loc.country : ""}`;
}

// Brute-force guard, scoped to the caller's IP only. It deliberately does NOT
// match on the admin e-mail: matching globally meant a few typo attempts from
// anywhere could lock the real admin out of their own dashboard.
// Entries written while already locked (`locked: true`) are ignored so an old
// lockout can always expire instead of counting itself again.
async function recentFailureCount(req) {
  const since = Date.now() - LOCKOUT_MINUTES * 60 * 1000;
  const ip = clientIp(req);
  const fails = (await readAuthLog()).filter(
    (e) =>
      e.type === "failed" &&
      !e.locked &&
      new Date(e.createdAt).getTime() > since &&
      e.ip === ip
  );
  return fails.length;
}

// A successful sign-in resets this IP's failure history, so the admin never
// inherits an expired-counter lockout from earlier typo attempts.
async function clearFailedAttempts(req) {
  const ip = clientIp(req);
  const all = await readAuthLog();
  const kept = all.filter((e) => !(e.type === "failed" && e.ip === ip));
  if (kept.length !== all.length) await writeAuthLog(kept);
}

app.post("/api/login", async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required." });
  }

  const DEFAULT_ADMIN_HASH = "$2b$10$YW.hkgNgffM5FKfZrOl1OO1UbHgtDdefkCIapbGLr.fxBT1HVt8V2";
  const ADMIN_USER = (process.env.ADMIN_USER || "admin@trendcode.com").trim();
  const ADMIN_PASS_HASH = process.env.ADMIN_PASS_HASH || DEFAULT_ADMIN_HASH;
  // Cryptographically secure bcrypt verification with random salting (10 rounds)
  const hasValidAdminHash = /^\$2[aby]\$\d{2}\$[./A-Za-z0-9]{53}$/.test(String(ADMIN_PASS_HASH || ""));
  const passOk =
    hasValidAdminHash && bcrypt.compareSync(password, ADMIN_PASS_HASH);

  // Credentials are checked FIRST: the correct password must always open the
  // dashboard. The lockout below only throttles wrong-password guessing.
  if (email.toLowerCase() === ADMIN_USER.toLowerCase() && passOk) {
    const token = await createSession(req, ADMIN_USER);
    await clearFailedAttempts(req);
    await logAuthEvent("login", req, { email });
    return res.json({
      ok: true,
      token,
      user: { name: "TCT Admin", role: "admin" },
    });
  }

  const failures = await recentFailureCount(req);
  if (failures >= MAX_LOGIN_ATTEMPTS) {
    // Rejected WITHOUT logging a new failure: recording another one here would
    // push the window forward on every retry, so the lockout would never end.
    return res.status(429).json({
      error: `Too many failed attempts. Try again after ${LOCKOUT_MINUTES} minutes.`,
    });
  }

  await logAuthEvent("failed", req, { email });
  const remaining = Math.max(0, MAX_LOGIN_ATTEMPTS - (failures + 1));
  return res.status(401).json({
    error:
      remaining > 0
        ? `Invalid email or password. ${remaining} attempt${remaining === 1 ? "" : "s"} left before lockout.`
        : `Too many failed attempts. Try again after ${LOCKOUT_MINUTES} minutes.`,
  });
});

app.post("/api/logout", async (req, res) => {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  const session = await getSession(token);
  if (session) await revokeSession(token);
  await logAuthEvent("logout", req, { email: session?.email || "admin@trendcode.com" });
  res.json({ ok: true });
});

// Active admin sessions — the Login Activity tab lists these with device,
// IP and location, each with a "Force logout" button.
app.get("/api/admin/sessions", requireAdmin, async (req, res) => {
  const cutoff = Date.now() - SESSION_TTL_HOURS * 3600 * 1000;
  const list = (await readSessions())
    .filter((s) => new Date(s.createdAt).getTime() > cutoff)
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
    .map((s) => ({
      tokenPreview: s.token.slice(0, 12),
      email: s.email,
      ip: s.ip,
      location: locationText(lookupLocation(s.ip) || s.location),
      device: s.device,
      createdAt: s.createdAt,
      lastSeenAt: s.lastSeenAt,
      current: s.token === (req.adminSession?.token || ""),
    }));
  res.json(list);
});

// Force logout another admin session by token prefix (never accepts the
// caller's own session — use normal logout for that).
app.post("/api/admin/sessions/revoke", requireAdmin, async (req, res) => {
  const { tokenPreview } = req.body || {};
  if (!tokenPreview) return res.status(400).json({ error: "tokenPreview required." });
  if (tokenPreview === req.adminSession?.token.slice(0, 12)) {
    return res.status(400).json({ error: "Use Logout to end your own session." });
  }
  const list = await readSessions();
  const target = list.find((s) => s.token.slice(0, 12) === tokenPreview);
  if (!target) return res.status(404).json({ error: "Session not found (maybe already ended)." });
  await writeSessions(list.filter((s) => s.token !== target.token));
  await logAuthEvent("force-logout", req, {
    email: target.email,
    targetIp: target.ip,
    targetDevice: target.device,
  });
  res.json({ ok: true, message: `Logged out ${target.device} (${target.ip}).` });
});

// ---------- Internship applications ----------
// All service lines double as internship domains
const INTERNSHIP_DOMAINS = [
  "Software Development",
  "Web Development",
  "App Development",
  "Digital Marketing",
  "IoT Solutions",
  "ML / Python",
  "AI / Robotics",
  "UI / UX Design",
  "Software Testing",
  "Cloud Computing",
  "Data Entry",
  "Voice Process",
];

app.get("/api/internship/domains", (_req, res) => res.json(INTERNSHIP_DOMAINS));

app.post(
  "/api/internship",
  uploadResume.single("resume"),
  async (req, res) => {
    const { name, email, phone, college, degree, year, domain, duration, message } =
      req.body || {};
    if (!name || !email || !phone || !college || !domain) {
      if (req.file && req.file.path) fs.unlink(req.file.path, () => {});
      return res.status(400).json({
        error: "Name, email, phone, college and domain are required.",
      });
    }
    if (!VALID_EMAIL.test(email)) {
      if (req.file && req.file.path) fs.unlink(req.file.path, () => {});
      return res.status(400).json({ error: "Please enter a valid email address." });
    }

    const app_ = {
      id: `${Date.now()}`,
      kind: "internship",
      name: String(name).slice(0, 120),
      email: String(email).slice(0, 160),
      phone: String(phone).slice(0, 40),
      college: String(college).slice(0, 160),
      degree: String(degree || "").slice(0, 80),
      year: String(year || "").slice(0, 40),
      domain: String(domain).slice(0, 80),
      duration: String(duration || "").slice(0, 40),
      message: String(message || "").slice(0, 2000),
      resumeFile: req.file ? (req.file.filename || req.file.originalname) : null,
      resumeBuffer: req.file && req.file.buffer ? req.file.buffer : null,
      status: "new",
      createdAt: new Date().toISOString(),
    };

    // resume buffer is emailed, never stored inside the record; with MongoDB
    // it is kept beside it so the admin panel can still download it
    const resumeBuffer = app_.resumeBuffer || null;
    delete app_.resumeBuffer;
    if (MONGO_URI && resumeBuffer) app_.resumeData = resumeBuffer.toString("base64");
    await appendList(FILES.internships, app_);

    // notify (email with resume attached + WhatsApp) — started now, awaited
    // together with the auto-reply below on Vercel
    const ownerNotify = (async () => {
      if (mailer) {
        const text = [
          "New INTERNSHIP application from the website:",
          "",
          `Name:      ${app_.name}`,
          `Email:     ${app_.email}`,
          `Phone:     ${app_.phone}`,
          `College:   ${app_.college}`,
          `Degree:    ${app_.degree || "-"} (${app_.year || "-"})`,
          `Domain:    ${app_.domain}`,
          `Duration:  ${app_.duration || "-"}`,
          `Resume:    ${app_.resumeFile || "(not attached)"}`,
          "",
          app_.message ? `Note: ${app_.message}` : "",
          `Time: ${app_.createdAt}`,
        ].join("\n");
        try {
          await mailer.sendMail({
            from: `"TCT Website" <${SMTP_USER}>`,
            to: NOTIFY_EMAIL,
            subject: `🎓 Internship application — ${app_.name} (${app_.domain})`,
            text,
            replyTo: app_.email,
            attachments: buildResumeAttachment(app_, resumeBuffer),
          });
          console.log(`[internship] emailed notification for ${app_.name}`);
        } catch (err) {
          console.error("[internship] email failed:", err.message);
        }
      }
      await sendWhatsApp(
        `🎓 Internship application — ${app_.name}\n📚 ${app_.domain} (${app_.duration || "flexible"})\n🏫 ${app_.college}\n📞 ${app_.phone}\n📧 ${app_.email}`
      );
    })();

    // "Thank you for your interest" auto reply to the applicant's own mail id
    await runNotifications([
      () => ownerNotify,
      () => sendThankYou(app_.email, app_.name, "internship", app_.domain),
    ]);

    res.status(201).json({
      ok: true,
      id: app_.id,
      message: "Application received! Our HR team will contact you about the internship.",
    });
  }
);

app.get("/api/admin/internships", requireAdmin, async (_req, res) => {
  const list = (await readList(FILES.internships)).sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  const withLinks = list.map((a) => {
    const rec = { ...a };
    delete rec.resumeData; // base64 copy never goes over the list API
    return {
      ...rec,
      resumeUrl: rec.resumeFile && RESUME_KEY_SECRET
        ? `/api/admin/resume/${encodeURIComponent(rec.resumeFile)}?key=${resumeLinkKey(rec.resumeFile)}`
        : null,
    };
  });
  res.json(withLinks);
});

app.get("/api/admin/authlog", requireAdmin, async (_req, res) => {
  const list = (await readAuthLog())
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
    .map((e) => {
      // enrich older entries with freshly-resolved geo data
      geoLookupAsync(e.ip);
      return {
        ...e,
        location: locationText(lookupLocation(e.ip) || e.location),
        // older entries stored the raw UA in `device` — parse it nicely
        device: deviceSummary(e.userAgent || e.device),
      };
    })
    .slice(0, 100)
    .map((e) => ({ ...e, deviceSummary: deviceSummary(e.device) }));
  res.json(list);
});

app.get("/api/admin/leads", requireAdmin, async (_req, res) => {
  res.json((await readList(FILES.leads)).sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1)));
});

app.get("/api/admin/messages", requireAdmin, async (_req, res) => {
  res.json((await readList(FILES.messages)).sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1)));
});

// ---------- Admin: Offer Letters ----------
app.get("/api/admin/offers", requireAdmin, async (_req, res) => {
  const list = (await readList(FILES.offers)).sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  res.json(list);
});

app.post("/api/admin/offers/send", requireAdmin, async (req, res) => {
  const {
    candidateName,
    candidateEmail,
    salutation = "Mr./Ms.",
    role,
    field,
    startDate,
    endDate,
  } = req.body || {};

  if (!candidateName || !String(candidateName).trim()) {
    return res.status(400).json({ error: "Candidate name is required." });
  }
  if (!candidateEmail || !VALID_EMAIL.test(candidateEmail)) {
    return res.status(400).json({ error: "A valid candidate email is required." });
  }
  if (!role || !String(role).trim()) {
    return res.status(400).json({ error: "Internship role is required." });
  }
  if (!startDate || !endDate) {
    return res.status(400).json({ error: "Start date and end date are required." });
  }

  const cleanName = String(candidateName).trim().slice(0, 100);
  const cleanEmail = String(candidateEmail).trim().toLowerCase();
  const cleanSalutation = String(salutation).trim() || "Mr./Ms.";
  const cleanRole = String(role).trim().slice(0, 120);
  const cleanField = String(field || cleanRole).trim().slice(0, 120);
  const fStart = formatOfferDate(startDate);
  const fEnd = formatOfferDate(endDate);

  const refId = `TCT/INT/${new Date().getFullYear()}/${Math.floor(1000 + Math.random() * 9000)}`;

  try {
    await sendOfferLetterEmail({
      candidateName: cleanName,
      candidateEmail: cleanEmail,
      salutation: cleanSalutation,
      role: cleanRole,
      field: cleanField,
      startDate: fStart,
      endDate: fEnd,
      refId,
    });
  } catch (err) {
    console.error("[offer] sendMail failed:", err.message);
    return res.status(500).json({ error: `Failed to send email: ${err.message}` });
  }

  const record = {
    id: Date.now().toString(),
    refId,
    candidateName: cleanName,
    candidateEmail: cleanEmail,
    salutation: cleanSalutation,
    role: cleanRole,
    field: cleanField,
    startDate: fStart,
    endDate: fEnd,
    status: "Sent",
    sentBy: req.adminSession?.user || "admin",
    createdAt: new Date().toISOString(),
  };

  await appendList(FILES.offers, record);

  res.status(201).json({
    ok: true,
    message: `Offer letter successfully sent to ${cleanEmail}!`,
    offer: record,
  });
});

app.delete("/api/admin/offers", requireAdmin, async (req, res) => {
  const { id } = req.body || {};
  if (!id) return res.status(400).json({ error: "Offer ID is required." });
  const list = await readList(FILES.offers);
  const next = list.filter((e) => e.id !== String(id));
  if (next.length === list.length) {
    return res.status(404).json({ error: "Offer record not found." });
  }
  await writeList(FILES.offers, next);
  res.json({ ok: true, deleted: String(id), remaining: next.length });
});

// ---------- Advertisements & Popups System ----------
const SEED_ADS = [
  {
    id: "ad-home-1",
    title: "Empower Your Brand with Scalable Tech Solutions",
    subtitle: "Custom web applications, AI workflows and cloud architectures built in Coimbatore. Schedule a free 30-min discovery call.",
    badge: "💡 FREE TECH AUDIT",
    placement: "popup",
    targetPage: "/",
    imageUrl: "",
    ctaText: "Explore Solutions",
    ctaLink: "/services",
    secondaryText: "Close",
    secondaryLink: "",
    delaySeconds: 2,
    active: true,
    views: 0,
    clicks: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "ad-intern-1",
    title: "Launch Your AI & Full-Stack Tech Career in Coimbatore",
    subtitle: "Fast-track 1-to-6 months industrial internship with real client projects, ISO 9001:2015 certification, and placement assistance.",
    badge: "🚀 FAST-TRACK BATCH 2026",
    placement: "popup",
    targetPage: "/internship",
    imageUrl: "/tct-shirt-logo.png",
    ctaText: "Apply for Internship",
    ctaLink: "/internship",
    secondaryText: "Close",
    secondaryLink: "",
    delaySeconds: 2,
    active: true,
    views: 0,
    clicks: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "ad-intern-2",
    title: "Need Free 1-on-1 Domain Counseling?",
    subtitle: "Confused between Web Dev, AI/ML, Cloud or UI/UX? Connect with our senior tech leads for guidance.",
    badge: "🔥 FREE MENTORSHIP",
    placement: "floating",
    targetPage: "/internship",
    imageUrl: "",
    ctaText: "Talk to Advisor",
    ctaLink: "/contact",
    secondaryText: "Dismiss",
    secondaryLink: "",
    delaySeconds: 1,
    active: true,
    views: 0,
    clicks: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "ad-services-1",
    title: "Looking to Build High-Performance Web & Mobile Apps?",
    subtitle: "Enterprise-grade digital solutions tailored for your business. Get an instant quote and technical plan within 24 hours.",
    badge: "⚡ 24HR PROPOSAL",
    placement: "floating",
    targetPage: "/services",
    imageUrl: "",
    ctaText: "Request Quote",
    ctaLink: "/contact",
    secondaryText: "Dismiss",
    secondaryLink: "",
    delaySeconds: 1,
    active: true,
    views: 0,
    clicks: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "ad-careers-1",
    title: "We're Hiring Developers & Designers in Coimbatore!",
    subtitle: "Join our fast-growing engineering team at Ganapathy with competitive packages, live projects & mentorship.",
    badge: "🎯 WE ARE HIRING",
    placement: "floating",
    targetPage: "/careers",
    imageUrl: "",
    ctaText: "View Openings",
    ctaLink: "/careers",
    secondaryText: "Dismiss",
    secondaryLink: "",
    delaySeconds: 1,
    active: true,
    views: 0,
    clicks: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// GET /api/ads (public: returns active ads, supports ?page=&placement= filters)
app.get("/api/ads", async (req, res) => {
  try {
    let list = await readList(FILES.ads);
    if (!list || list.length === 0) {
      list = [...SEED_ADS];
      await writeList(FILES.ads, list);
    }
    let filtered = list.filter((a) => a.active !== false);

    const targetPage = req.query.page ? String(req.query.page).trim() : "";
    if (targetPage) {
      filtered = filtered.filter(
        (a) => a.targetPage === "all" || a.targetPage === targetPage
      );
    }

    const placement = req.query.placement ? String(req.query.placement).trim() : "";
    if (placement) {
      filtered = filtered.filter((a) => a.placement === placement);
    }

    res.json(filtered);
  } catch (err) {
    console.error("[ads] error reading ads:", err);
    res.json(SEED_ADS.filter((a) => a.active !== false));
  }
});

// POST /api/ads/:id/track (public: track view or click)
app.post("/api/ads/:id/track", async (req, res) => {
  try {
    const id = req.params.id;
    const type = req.body && req.body.type === "click" ? "clicks" : "views";
    let list = await readList(FILES.ads);
    if (!list || list.length === 0) list = [...SEED_ADS];
    const item = list.find((a) => String(a.id) === String(id));
    if (item) {
      item[type] = (item[type] || 0) + 1;
      await writeList(FILES.ads, list);
    }
    res.json({ ok: true });
  } catch {
    res.json({ ok: false });
  }
});

// GET /api/admin/ads (admin: get all ads including inactive)
app.get("/api/admin/ads", requireAdmin, async (_req, res) => {
  try {
    let list = await readList(FILES.ads);
    if (!list || list.length === 0) {
      list = [...SEED_ADS];
      await writeList(FILES.ads, list);
    }
    const sorted = [...list].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
    res.json(sorted);
  } catch (err) {
    console.error("[ads] admin read error:", err);
    res.status(500).json({ error: "Failed to load advertisements." });
  }
});

// POST /api/admin/ads (admin: create new ad with optional image upload)
app.post(
  "/api/admin/ads",
  requireAdmin,
  (req, res, next) => {
    uploadGallery.single("image")(req, res, (err) => {
      if (err) return res.status(400).json({ error: err.message || "Image upload failed." });
      next();
    });
  },
  async (req, res) => {
    try {
      const {
        title,
        subtitle,
        badge,
        placement,
        targetPage,
        ctaText,
        ctaLink,
        secondaryText,
        secondaryLink,
        delaySeconds,
        active,
        isPoster,
        posterFit,
      } = req.body || {};

      let imageUrl = req.body && req.body.imageUrl ? String(req.body.imageUrl).trim() : "";
      if (req.file) {
        const mime = req.file.mimetype || "image/jpeg";
        const b64 = req.file.buffer.toString("base64");
        imageUrl = `data:${mime};base64,${b64}`;
      }

      if (!title || !String(title).trim()) {
        return res.status(400).json({ error: "Advertisement title / headline is required." });
      }

      const validPlacements = ["popup", "floating", "topbar"];
      const chosenPlacement = validPlacements.includes(placement) ? placement : "popup";

      const newAd = {
        id: "ad-" + Date.now() + "-" + crypto.randomBytes(3).toString("hex"),
        title: String(title).trim(),
        subtitle: subtitle ? String(subtitle).trim() : "",
        badge: badge ? String(badge).trim() : "PROMOTION",
        placement: chosenPlacement,
        targetPage: targetPage ? String(targetPage).trim() : "all",
        imageUrl,
        ctaText: ctaText && String(ctaText).trim() ? String(ctaText).trim() : "Apply Now",
        ctaLink: ctaLink && String(ctaLink).trim() ? String(ctaLink).trim() : "/internship",
        secondaryText: secondaryText ? String(secondaryText).trim() : "Close",
        secondaryLink: secondaryLink ? String(secondaryLink).trim() : "",
        delaySeconds: Number(delaySeconds) >= 0 ? Number(delaySeconds) : 2,
        active: active !== false && active !== "false",
        isPoster: isPoster === true || isPoster === "true" || isPoster === "1",
        posterFit: posterFit === "cover" ? "cover" : "contain",
        views: 0,
        clicks: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      let list = await readList(FILES.ads);
      if (!list || list.length === 0) list = [...SEED_ADS];
      list.unshift(newAd);
      await writeList(FILES.ads, list);

      res.status(201).json({ ok: true, item: newAd });
    } catch (err) {
      console.error("[ads] create error:", err);
      res.status(500).json({ error: "Failed to create advertisement." });
    }
  }
);

// PUT /api/admin/ads/:id (admin: update existing ad)
app.put(
  "/api/admin/ads/:id",
  requireAdmin,
  (req, res, next) => {
    uploadGallery.single("image")(req, res, (err) => {
      if (err) return res.status(400).json({ error: err.message || "Image upload failed." });
      next();
    });
  },
  async (req, res) => {
    try {
      const id = req.params.id;
      if (!id) return res.status(400).json({ error: "Ad ID is required." });

      let list = await readList(FILES.ads);
      if (!list || list.length === 0) list = [...SEED_ADS];
      const index = list.findIndex((a) => String(a.id) === String(id));
      if (index === -1) {
        return res.status(404).json({ error: "Advertisement not found." });
      }

      const existing = list[index];
      const {
        title,
        subtitle,
        badge,
        placement,
        targetPage,
        ctaText,
        ctaLink,
        secondaryText,
        secondaryLink,
        delaySeconds,
        active,
        isPoster,
        posterFit,
      } = req.body || {};

      let imageUrl = existing.imageUrl;
      if (req.body && typeof req.body.imageUrl !== "undefined") {
        imageUrl = String(req.body.imageUrl).trim();
      }
      if (req.file) {
        const mime = req.file.mimetype || "image/jpeg";
        const b64 = req.file.buffer.toString("base64");
        imageUrl = `data:${mime};base64,${b64}`;
      }

      const validPlacements = ["popup", "floating", "topbar"];
      const chosenPlacement = placement && validPlacements.includes(placement)
        ? placement
        : existing.placement;

      const updated = {
        ...existing,
        title: title ? String(title).trim() : existing.title,
        subtitle: typeof subtitle !== "undefined" ? String(subtitle).trim() : existing.subtitle,
        badge: typeof badge !== "undefined" ? String(badge).trim() : existing.badge,
        placement: chosenPlacement,
        targetPage: typeof targetPage !== "undefined" ? String(targetPage).trim() : existing.targetPage,
        imageUrl,
        ctaText: typeof ctaText !== "undefined" ? String(ctaText).trim() : existing.ctaText,
        ctaLink: typeof ctaLink !== "undefined" ? String(ctaLink).trim() : existing.ctaLink,
        secondaryText: typeof secondaryText !== "undefined" ? String(secondaryText).trim() : existing.secondaryText,
        secondaryLink: typeof secondaryLink !== "undefined" ? String(secondaryLink).trim() : existing.secondaryLink,
        delaySeconds: typeof delaySeconds !== "undefined" && Number(delaySeconds) >= 0 ? Number(delaySeconds) : existing.delaySeconds,
        active: typeof active !== "undefined" ? (active !== false && active !== "false") : existing.active,
        isPoster: typeof isPoster !== "undefined" ? (isPoster === true || isPoster === "true" || isPoster === "1") : (existing.isPoster || false),
        posterFit: typeof posterFit !== "undefined" ? posterFit : (existing.posterFit || "contain"),
        updatedAt: new Date().toISOString(),
      };

      list[index] = updated;
      await writeList(FILES.ads, list);

      res.json({ ok: true, item: updated });
    } catch (err) {
      console.error("[ads] update error:", err);
      res.status(500).json({ error: "Failed to update advertisement." });
    }
  }
);

// PATCH /api/admin/ads/:id/toggle (admin: toggle active/inactive)
app.patch("/api/admin/ads/:id/toggle", requireAdmin, async (req, res) => {
  try {
    const id = req.params.id;
    let list = await readList(FILES.ads);
    if (!list || list.length === 0) list = [...SEED_ADS];
    const item = list.find((a) => String(a.id) === String(id));
    if (!item) {
      return res.status(404).json({ error: "Advertisement not found." });
    }
    item.active = !item.active;
    item.updatedAt = new Date().toISOString();
    await writeList(FILES.ads, list);
    res.json({ ok: true, item });
  } catch (err) {
    console.error("[ads] toggle error:", err);
    res.status(500).json({ error: "Failed to toggle advertisement status." });
  }
});

// DELETE /api/admin/ads/:id or DELETE /api/admin/ads with body
app.delete("/api/admin/ads/:id?", requireAdmin, async (req, res) => {
  try {
    const id = req.params.id || (req.body && req.body.id);
    if (!id) return res.status(400).json({ error: "Ad ID is required to delete." });

    let list = await readList(FILES.ads);
    if (!list || list.length === 0) list = [...SEED_ADS];
    const next = list.filter((a) => String(a.id) !== String(id));
    if (next.length === list.length) {
      return res.status(404).json({ error: "Advertisement not found." });
    }
    await writeList(FILES.ads, next);
    res.json({ ok: true, deleted: String(id), remaining: next.length });
  } catch (err) {
    console.error("[ads] delete error:", err);
    res.status(500).json({ error: "Failed to delete advertisement." });
  }
});

// ---------- serve the built frontend in production ----------
const DIST = path.join(__dirname, "..", "dist");
if (fs.existsSync(DIST)) {
  // Serve the generated flat route documents before the SPA fallback.
  app.get("*", (req, res, next) => {
    const relativePath = decodeURIComponent(req.path).replace(/^\/+|\/+$/g, "");
    if (!relativePath) return next();
    const routeFilename = relativePath.replace(/\/+/, "--").replace(/\//g, "--");
    const routeDocument = path.resolve(DIST, `${routeFilename}.html`);
    if (routeDocument.startsWith(`${DIST}${path.sep}`) && fs.existsSync(routeDocument)) {
      return res.sendFile(routeDocument);
    }
    return next();
  });
  app.use(express.static(DIST));
  app.get("*", (_req, res) => res.sendFile(path.join(DIST, "index.html")));
}

export default app;

const isDirectRun =
  process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isDirectRun) {
  app.listen(PORT, () => {
    console.log(`TCT API ready on http://localhost:${PORT}`);
  });
}
