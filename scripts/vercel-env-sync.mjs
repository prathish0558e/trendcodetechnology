// Syncs the env vars the API needs into the Vercel project.
// Values come from server/.env (gitignored) — nothing is hardcoded here and
// values are never printed, only per-key status.
//
//   node scripts/vercel-env-sync.mjs                  # push missing/changed values
//   node scripts/vercel-env-sync.mjs MONGODB_URI      # only that key (safe after a rotation)
//   node scripts/vercel-env-sync.mjs --dry            # show what would change, push nothing
//
// Vercel never hands an encrypted/sensitive value back, so this script keeps a
// hash of the last value it pushed in .vercel-env-state.json (gitignored).
// "unchanged" therefore means "same as the last value we pushed".
import crypto from "crypto";
import fs from "fs";

const DRY = process.argv.includes("--dry");
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

if (!local.MONGODB_URI) {
  console.error(
    "MONGODB_URI is missing from server/.env — add the Atlas connection string there\n" +
      "(Atlas → Connect → Drivers) and run this script again."
  );
  process.exit(1);
}

// What the serverless function needs. ADMIN_PASS_HASH is deliberately NOT
// pushed: the live admin currently signs in with the built-in fallback
// password, and pushing a hash we can't tell the owner about would lock them out.
const desired = {
  MONGODB_URI: local.MONGODB_URI,
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

// optional key filter: `... MONGODB_URI` touches only that variable (used when
// rotating a credential, so untouched values can never be overwritten)
const only = process.argv.slice(2).filter((a) => !a.startsWith("--"));

const STATE_FILE = ".vercel-env-state.json";
const fingerprint = (v) => crypto.createHash("sha256").update(v).digest("hex").slice(0, 16);
let state = {};
try {
  state = JSON.parse(fs.readFileSync(STATE_FILE, "utf8"));
} catch {
  state = {};
}

const list = await api("GET", `/v9/projects/${PROJECT}/env`);
const existing = new Map((list.json.envs || []).map((e) => [e.key, e]));

for (const [key, value] of Object.entries(desired)) {
  if (only.length && !only.includes(key)) continue;
  if (value === undefined || value === "") {
    console.log(`${key}: SKIP (no value in server/.env)`);
    continue;
  }
  const cur = existing.get(key);
  const id = fingerprint(value);
  const sameAsPushed = state[key] === id;
  // missing on Vercel -> always create; otherwise only when the value changed
  const action = !cur ? "CREATE" : sameAsPushed ? "unchanged" : "UPDATE";
  if (DRY || action === "unchanged") {
    console.log(`${key}: ${action}${DRY ? " (dry run)" : ""}`);
    continue;
  }
  const r =
    action === "CREATE"
      ? await api("POST", `/v10/projects/${PROJECT}/env`, {
          key,
          value,
          type: "encrypted",
          target: TARGETS,
        })
      : await api("PATCH", `/v10/projects/${PROJECT}/env/${cur.id}`, {
          value,
          target: TARGETS,
        });
  if (r.status < 300) {
    state[key] = id;
    console.log(`${key}: ${action}D`);
  } else {
    console.log(`${key}: FAILED ${r.status} ${JSON.stringify(r.json).slice(0, 160)}`);
  }
}

if (!DRY) {
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
  console.log(`\nstate saved to ${STATE_FILE} — redeploy for new values to take effect`);
} else {
  console.log("\n(dry run — nothing was changed)");
}
