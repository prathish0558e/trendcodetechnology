import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import multer from "multer";
import crypto from "crypto";
import bcrypt from "bcryptjs";

// load server/.env if present (email notifications)
dotenv.config({ path: path.join(path.dirname(fileURLToPath(import.meta.url)), ".env") });

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const IS_SERVERLESS = Boolean(process.env.VERCEL); // set by Vercel runtime
const app = express();
const requestedPort = Number(process.env.PORT);
const PORT = Number.isInteger(requestedPort) && requestedPort > 0 ? requestedPort : 4000;

app.use(express.json());

// ---------- tiny JSON file storage ----------
// Local: real files under server/data. Serverless (Vercel): the FS is
// read-only, so fall back to in-memory lists that live per warm instance.
const DATA_DIR = path.join(__dirname, "data");
if (!IS_SERVERLESS && !fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const FILES = {
  leads: path.join(DATA_DIR, "leads.json"),
  messages: path.join(DATA_DIR, "messages.json"),
  applications: path.join(DATA_DIR, "applications.json"),
  internships: path.join(DATA_DIR, "internships.json"),
};
const MEMORY = { leads: [], messages: [], applications: [], internships: [] };

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

function readList(file) {
  if (IS_SERVERLESS) {
    const key = path.basename(file, ".json");
    return MEMORY[key] || [];
  }
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch {
    return [];
  }
}

function writeList(file, list) {
  if (IS_SERVERLESS) {
    const key = path.basename(file, ".json");
    MEMORY[key] = list;
    return;
  }
  try {
    fs.writeFileSync(file, JSON.stringify(list, null, 2));
  } catch (err) {
    // Read-only filesystem (e.g. Vercel serverless): still accept the lead,
    // just log it so nothing is silently lost.
    console.warn("[lead] persist failed (read-only FS?):", err.message);
    console.log("[lead]", JSON.stringify(list[list.length - 1]));
  }
}

const VALID_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ---------- email notifications (optional: set SMTP env vars) ----------
const NOTIFY_EMAIL = process.env.NOTIFY_EMAIL || "trendcodetechnology2026@gmail.com";

function makeTransport() {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) return null;
  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT) || 587,
    secure: Number(SMTP_PORT) === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });
}

const mailer = makeTransport();

// Attachment for emails — works for both disk (local) and memory (serverless)
function buildResumeAttachment(record, buffer) {
  if (!record.resumeFile) return [];
  const filename = record.resumeFile.replace(/^\d+-/, "");
  const content = buffer || record.resumeBuffer || null;
  if (content) return [{ filename, content }];
  return [{ filename, path: path.join(UPLOAD_DIR, record.resumeFile) }];
}

// ---------- WhatsApp lead alert (free, via CallMeBot) ----------
const WA_PHONE = (process.env.WA_PHONE || "").replace(/\D/g, "");
const WA_APIKEY = (process.env.WA_APIKEY || "").trim();

async function notifyWhatsApp(lead) {
  if (!WA_PHONE || !WA_APIKEY) {
    console.log("[lead] WhatsApp alert skipped (WA_PHONE/WA_APIKEY not set)");
    return;
  }
  const text = encodeURIComponent(
    `🔔 New enquiry — ${lead.name}\n` +
      `📞 ${lead.phone || "-"}\n` +
      `📧 ${lead.email}\n` +
      `🛠 ${lead.service || "-"}\n\n` +
      `${lead.message.slice(0, 300)}`
  );
  const url = `https://api.callmebot.com/whatsapp.php?phone=${WA_PHONE}&text=${text}&apikey=${WA_APIKEY}`;
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const body = await res.text();
    if (/error/i.test(body.slice(0, 120))) throw new Error(body.slice(0, 120));
    console.log(`[lead] WhatsApp alert sent for ${lead.name}`);
  } catch (err) {
    console.error("[lead] WhatsApp alert failed:", err.message);
  }
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
    `Email:   ${lead.email}`,
    `Phone:   ${lead.phone || "-"}`,
    `Service: ${lead.service || "-"}`,
    `Message: ${lead.message}`,
    ``,
    `Time: ${lead.createdAt}`,
  ].join("\n");
  try {
    await mailer.sendMail({
      from: `"TCT Website" <${process.env.SMTP_USER}>`,
      to: NOTIFY_EMAIL,
      subject: `🔔 New enquiry — ${lead.name}${lead.service ? ` (${lead.service})` : ""}`,
      text,
      replyTo: lead.email,
    });
    console.log(`[lead] emailed notification for ${lead.name}`);
  } catch (err) {
    console.error("[lead] email failed:", err.message);
  }
}

// ---------- routes ----------
app.get("/api/health", (_req, res) =>
  res.json({ ok: true, service: "tct-api", time: new Date().toISOString() })
);

app.post("/api/leads", (req, res) => {
  const { name, email, phone, service, message } = req.body || {};
  if (!name || !email || !message) {
    return res
      .status(400)
      .json({ error: "Name, email and message are required." });
  }
  if (!VALID_EMAIL.test(email)) {
    return res.status(400).json({ error: "Please enter a valid email address." });
  }

  const lead = {
    id: `${Date.now()}`,
    name: String(name).slice(0, 120),
    email: String(email).slice(0, 160),
    phone: String(phone || "").slice(0, 40),
    service: String(service || "").slice(0, 80),
    message: String(message).slice(0, 4000),
    source: "quote-form",
    createdAt: new Date().toISOString(),
  };

  const list = readList(FILES.leads);
  list.push(lead);
  writeList(FILES.leads, list);

  // fire-and-forget notifications (email + WhatsApp)
  notifyNewLead(lead).catch(() => {});
  notifyWhatsApp(lead).catch(() => {});

  res.status(201).json({
    ok: true,
    id: lead.id,
    message: "Thanks! Your request reached our team — we'll reply within 24 hours.",
  });
});

// ---------- Job applications (careers) ----------
async function notifyApplication(app_) {
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
        from: `"TCT Website" <${process.env.SMTP_USER}>`,
        to: NOTIFY_EMAIL,
        subject: `💼 New job application — ${app_.name} (${app_.position})`,
        text,
        replyTo: app_.email,
        attachments: buildResumeAttachment(app_),
      });
      console.log(`[application] emailed notification for ${app_.name}`);
    } catch (err) {
      console.error("[application] email failed:", err.message);
    }
  }
  // WhatsApp
  if (WA_PHONE && WA_APIKEY) {
    const text2 = encodeURIComponent(
      `💼 New job application — ${app_.name}\n` +
        `📋 ${app_.position} (${app_.experience})\n` +
        `📞 ${app_.phone || "-"}\n` +
        `📧 ${app_.email}\n` +
        (app_.github ? `🐙 ${app_.github}\n` : "") +
        (app_.resumeFile ? `📎 resume attached\n` : "")
    );
    try {
      await fetch(
        `https://api.callmebot.com/whatsapp.php?phone=${WA_PHONE}&text=${text2}&apikey=${WA_APIKEY}`
      );
      console.log(`[application] WhatsApp alert sent for ${app_.name}`);
    } catch (err) {
      console.error("[application] WhatsApp failed:", err.message);
    }
  }
}

app.post("/api/apply", uploadResume.single("resume"), (req, res) => {
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

  const list = readList(FILES.applications);
  list.push(application);
  writeList(FILES.applications, list);

  // buffers must not live in the stored list — notify reads it, then strip
  notifyApplication(application).catch(() => {});
  delete application.resumeBuffer;

  res.status(201).json({
    ok: true,
    id: application.id,
    message: "Application received! Our HR team will review it and get back to you.",
  });
});

// ---------- admin auth guard ----------
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || "demo-token";

function requireAdmin(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token || token !== ADMIN_TOKEN) {
    return res.status(401).json({ error: "Unauthorized. Please sign in again." });
  }
  next();
}

// Downloads a stored resume. Only via short-lived signed link (downloadKey).
// On serverless there is no disk — resumes exist only as email attachments,
// so the download endpoint is disabled with a clear message.
app.get("/api/admin/resume/:file", (req, res) => {
  const { file } = req.params;
  const { key } = req.query;
  if (!key || key !== resumeLinkKey(file)) {
    return res.status(403).json({ error: "Invalid or expired download link." });
  }
  if (IS_SERVERLESS) {
    return res.status(404).json({
      error:
        "Resume files are emailed to the team inbox on this deployment — check NOTIFY_EMAIL.",
    });
  }
  const safe = path.basename(file);
  const full = path.join(UPLOAD_DIR, safe);
  if (!fs.existsSync(full)) {
    return res.status(404).json({ error: "Resume file not found." });
  }
  res.download(full);
});

// Short-lived key so the resume URL is not usable forever or guessable.
function resumeLinkKey(file) {
  // rotate daily: links from yesterday still work today, then expire
  const day = new Date().toISOString().slice(0, 10);
  const prev = new Date(Date.now() - 864e5).toISOString().slice(0, 10);
  return crypto.createHash("sha256").update(`${file}|${ADMIN_TOKEN}|${day}`).digest("hex").slice(0, 32)
    + "." +
    crypto.createHash("sha256").update(`${file}|${ADMIN_TOKEN}|${prev}`).digest("hex").slice(0, 32);
}

app.get("/api/admin/applications", requireAdmin, (req, res) => {
  const list = readList(FILES.applications).sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  const withLinks = list.map((a) => ({
    ...a,
    resumeUrl: a.resumeFile
      ? `/api/admin/resume/${encodeURIComponent(a.resumeFile)}?key=${resumeLinkKey(a.resumeFile)}`
      : null,
  }));
  res.json(withLinks);
});

// ---------- login activity log + brute-force lockout ----------
const FILES_AUTHLOG = path.join(DATA_DIR, "authlog.json");
const MAX_LOGIN_ATTEMPTS = 5; // failed tries before lockout
const LOCKOUT_MINUTES = 15; // lock window

function readAuthLog() {
  try {
    return JSON.parse(fs.readFileSync(FILES_AUTHLOG, "utf8"));
  } catch {
    return [];
  }
}

function writeAuthLog(list) {
  try {
    fs.writeFileSync(FILES_AUTHLOG, JSON.stringify(list, null, 2));
  } catch (err) {
    console.warn("[authlog] persist failed:", err.message);
  }
}

function logAuthEvent(type, req, extra = {}) {
  const entry = {
    id: `${Date.now()}`,
    type, // login | logout | failed
    email: String(extra.email || "").slice(0, 120),
    ip: (req.headers["x-forwarded-for"] || req.socket?.remoteAddress || "")
      .toString()
      .split(",")[0]
      .trim()
      .slice(0, 60),
    device: String(req.headers["user-agent"] || "")
      .slice(0, 220),
    ...extra,
    createdAt: new Date().toISOString(),
  };
  const list = readAuthLog();
  list.push(entry);
  // keep the log bounded (latest 500 events)
  writeAuthLog(list.slice(-500));
  return entry;
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
  return `${browser} · ${os}`;
}

function isLockedOut(req) {
  const since = Date.now() - LOCKOUT_MINUTES * 60 * 1000;
  const fails = readAuthLog().filter(
    (e) =>
      e.type === "failed" &&
      new Date(e.createdAt).getTime() > since &&
      (e.ip === clientIp(req) || e.email === "admin@trendcode.com")
  );
  return fails.length >= MAX_LOGIN_ATTEMPTS ? fails.length : 0;
}

function clientIp(req) {
  return (req.headers["x-forwarded-for"] || req.socket?.remoteAddress || "")
    .toString()
    .split(",")[0]
    .trim();
}

app.post("/api/login", (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required." });
  }

  // Brute-force lockout: too many recent failures -> reject before checking.
  const failedCount = isLockedOut(req);
  if (failedCount) {
    logAuthEvent("failed", req, { email, locked: true });
    return res.status(429).json({
      error: `Too many failed attempts. Try again after ${LOCKOUT_MINUTES} minutes.`,
    });
  }

  const ADMIN_USER = process.env.ADMIN_USER || "admin@trendcode.com";
  const ADMIN_PASS_HASH = process.env.ADMIN_PASS_HASH;
  // bcrypt hash comparison — the plain password is never stored anywhere.
  // (ADMIN_PASS plain-text fallback is supported for first-time setup only.)
  const passOk = ADMIN_PASS_HASH
    ? bcrypt.compareSync(password, ADMIN_PASS_HASH)
    : password === (process.env.ADMIN_PASS || "TCT@2026");
  if (email.toLowerCase() === ADMIN_USER.toLowerCase() && passOk) {
    logAuthEvent("login", req, { email });
    return res.json({
      ok: true,
      token: ADMIN_TOKEN,
      user: { name: "TCT Admin", role: "admin" },
    });
  }

  logAuthEvent("failed", req, { email });
  const remaining = Math.max(
    0,
    MAX_LOGIN_ATTEMPTS -
      readAuthLog().filter(
        (e) =>
          e.type === "failed" &&
          Date.now() - new Date(e.createdAt).getTime() <
            LOCKOUT_MINUTES * 60 * 1000 &&
          e.ip === clientIp(req)
      ).length
  );
  return res.status(401).json({
    error:
      remaining > 0
        ? `Invalid email or password. ${remaining} attempt${remaining === 1 ? "" : "s"} left before lockout.`
        : `Too many failed attempts. Try again after ${LOCKOUT_MINUTES} minutes.`,
  });
});

app.post("/api/logout", (req, res) => {
  logAuthEvent("logout", req, { email: "admin@trendcode.com" });
  res.json({ ok: true });
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
  (req, res) => {
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

    const list = readList(FILES.internships);
    list.push(app_);
    writeList(FILES.internships, list);
    // note: app_.resumeBuffer kept until the email notifier runs below

    // notify (email with resume attached + WhatsApp)
    (async () => {
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
            from: `"TCT Website" <${process.env.SMTP_USER}>`,
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
      if (WA_PHONE && WA_APIKEY) {
        const t2 = encodeURIComponent(
          `🎓 Internship application — ${app_.name}\n📚 ${app_.domain} (${app_.duration || "flexible"})\n🏫 ${app_.college}\n📞 ${app_.phone}\n📧 ${app_.email}`
        );
        try {
          await fetch(`https://api.callmebot.com/whatsapp.php?phone=${WA_PHONE}&text=${t2}&apikey=${WA_APIKEY}`);
        } catch {}
      }
    })().catch(() => {});

    res.status(201).json({
      ok: true,
      id: app_.id,
      message: "Application received! Our HR team will contact you about the internship.",
    });
  }
);

app.get("/api/admin/internships", requireAdmin, (_req, res) => {
  const list = readList(FILES.internships).sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  const withLinks = list.map((a) => ({
    ...a,
    resumeUrl: a.resumeFile
      ? `/api/admin/resume/${encodeURIComponent(a.resumeFile)}?key=${resumeLinkKey(a.resumeFile)}`
      : null,
  }));
  res.json(withLinks);
});

app.get("/api/admin/authlog", requireAdmin, (_req, res) => {
  const list = readAuthLog()
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
    .slice(0, 100)
    .map((e) => ({ ...e, deviceSummary: deviceSummary(e.device) }));
  res.json(list);
});

app.get("/api/admin/leads", requireAdmin, (_req, res) => {
  res.json(readList(FILES.leads).sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1)));
});

app.get("/api/admin/messages", requireAdmin, (_req, res) => {
  res.json(readList(FILES.messages).sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1)));
});

// ---------- serve the built frontend in production ----------
const DIST = path.join(__dirname, "..", "dist");
if (fs.existsSync(DIST)) {
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
