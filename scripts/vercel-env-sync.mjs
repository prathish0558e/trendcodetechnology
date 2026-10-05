// One-off: syncs the env vars the API needs into the Vercel project.
// Reads values from server/.env locally and pushes them — values are never
// printed, only per-key status.
import fs from "fs";

const TOKEN = fs.readFileSync(".vercel-token", "utf8").trim();
const TEAM = "team_cdeib8P5CsYh6NALF9TJq9Cc";
const PROJECT = "prj_l5akjJipmln0OcTeFdR3xYmg7itL";
const API = "https://api.vercel.com";
const TARGETS = ["production", "preview"];

// --- local .env (server/.env is gitignored, never uploaded) --------------
const local = {};
for (const line of fs.readFileSync("server/.env", "utf8").split(/\r?\n/)) {
  const m = line.match(/^\s*([A-Za-z0-9_]+)\s*=(.*)$/);
  if (m) local[m[1]] = m[2].trim();
}

// MONGODB_URI is not in server/.env — the Atlas cluster this session verified
const MONGODB_URI =
  "mongodb+srv://prathish0558e_db_user:ZUx4GGgzfds2KWSZ@cluster0.mitpcdz.mongodb.net/tct?retryWrites=true&w=majority&appName=Cluster0";

// What the serverless function needs. ADMIN_PASS_HASH is deliberately NOT
// pushed: the live admin currently signs in with the built-in fallback
// password, and pushing a hash we can't tell the owner about would lock them out.
const desired = {
  MONGODB_URI,
  SMTP_HOST: local.SMTP_HOST,
  SMTP_PORT: local.SMTP_PORT,
  SMTP_USER: local.SMTP_USER,
  SMTP_PASS: local.SMTP_PASS,
  NOTIFY_EMAIL: local.NOTIFY_EMAIL,
  WA_PHONE: local.WA_PHONE,
  ADMIN_USER: local.ADMIN_USER,
  ADMIN_TOKEN: local.ADMIN_TOKEN,
};

const headers = {
  "Content-Type": "application/json",
  Authorization: `Bearer ${TOKEN}`,
};
const q = `?teamId=${TEAM}`;

async function api(method, path, body) {
  const res = await fetch(`${API}${path}${path.includes("?") ? "&" : q}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    json = { raw: text.slice(0, 200) };
  }
  return { status: res.status, json };
}

const list = await api("GET", `/v9/projects/${PROJECT}/env`);
const existing = new Map((list.json.envs || []).map((e) => [e.key, e]));

for (const [key, value] of Object.entries(desired)) {
  if (value === undefined || value === "") {
    console.log(`${key}: SKIP (no local value)`);
    continue;
  }
  const cur = existing.get(key);
  if (!cur) {
    const r = await api("POST", `/v10/projects/${PROJECT}/env`, {
      key,
      value,
      type: "encrypted",
      target: TARGETS,
    });
    console.log(`${key}: ${r.status < 300 ? "CREATED" : "FAILED " + r.status + " " + JSON.stringify(r.json).slice(0, 160)}`);
  } else if (cur.value !== value) {
    const r = await api("PATCH", `/v10/projects/${PROJECT}/env/${cur.id}`, {
      value,
      target: TARGETS,
    });
    console.log(`${key}: ${r.status < 300 ? "UPDATED" : "FAILED " + r.status + " " + JSON.stringify(r.json).slice(0, 160)}`);
  } else {
    console.log(`${key}: unchanged`);
  }
}
