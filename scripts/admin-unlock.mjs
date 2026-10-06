// Admin login recovery helper.
//
//   node scripts/admin-unlock.mjs                 # diagnose only
//   node scripts/admin-unlock.mjs --clear         # also clear failed attempts
//   node scripts/admin-unlock.mjs --pass=TCT@2026 # check a password against the hash
//
// Reads MONGODB_URI from the gitignored server/.env — no credentials here.
import dns from "dns";
import fs from "fs";
import { MongoClient } from "mongodb";
import bcrypt from "bcryptjs";

dns.setServers(["8.8.8.8", "1.1.1.1"]); // local resolvers often refuse SRV queries

const env = {};
for (const line of fs.readFileSync("server/.env", "utf8").split(/\r?\n/)) {
  const m = line.match(/^\s*([A-Za-z0-9_]+)\s*=(.*)$/);
  if (m) env[m[1]] = m[2].trim();
}
const uri = env.MONGODB_URI;
if (!uri) {
  console.error("MONGODB_URI is missing from server/.env");
  process.exit(1);
}

const argv = process.argv.slice(2);
const clear = argv.includes("--clear");
const passArg = argv.find((a) => a.startsWith("--pass="));

// ---------- 1. local env sanity (never prints secrets) ----------
console.log("== local server/.env ==");
console.log("  ADMIN_USER       :", env.ADMIN_USER || "(missing)");
const hash = env.ADMIN_PASS_HASH || "";
const hashValid = /^\$2[aby]\$\d{2}\$[./A-Za-z0-9]{53}$/.test(hash);
console.log("  ADMIN_PASS_HASH  :", hash ? (hashValid ? "bcrypt hash OK" : "present but NOT a valid bcrypt hash") : "(missing)");
console.log("  ADMIN_TOKEN      :", env.ADMIN_TOKEN ? `set (${env.ADMIN_TOKEN.length} chars)` : "(missing)");
console.log("  ADMIN_PASS       :", env.ADMIN_PASS ? "set (plaintext fallback)" : "(not set — production uses the hash only)");
if (passArg) {
  const pw = passArg.slice("--pass=".length);
  console.log(
    "  password check   :",
    hashValid ? (bcrypt.compareSync(pw, hash) ? "MATCHES the local hash" : "does NOT match the local hash") : "no valid hash to compare"
  );
}

// ---------- 2. live lockout state ----------
const target = uri.includes("/tct?") ? uri : uri.replace(/\/[^/?]*(\?|$)/, "/tct$1");
const client = new MongoClient(target, { serverSelectionTimeoutMS: 8000 });
try {
  await client.connect();
  const col = client.db("tct").collection("lists");
  const doc = await col.findOne({ _id: "authlog" });
  const items = (doc && doc.items) || [];
  const failed = items.filter((e) => e.type === "failed");
  const recent = failed.filter((e) => Date.now() - new Date(e.createdAt).getTime() < 15 * 60 * 1000);
  const recentUnlocked = recent.filter((e) => !e.locked);
  const ips = [...new Set(recent.map((e) => e.ip))];

  console.log("\n== live database (tct.lists/_id:'authlog') ==");
  console.log("  total events      :", items.length, "| failed:", failed.length);
  console.log("  failures < 15 min :", recent.length, `(counted toward lockout: ${recentUnlocked.length})`);
  console.log("  offending IPs     :", ips.length ? ips.join(", ") : "(none)");
  for (const e of recent.slice(-8)) {
    console.log(`    ${e.createdAt}  ${(e.ip || "?").padEnd(15)} ${(e.email || "-").padEnd(24)} locked=${!!e.locked}`);
  }

  if (clear) {
    const kept = items.filter((e) => e.type !== "failed");
    await col.updateOne({ _id: "authlog" }, { $set: { items: kept } });
    console.log(`\nCLEARED: removed ${failed.length} failed login event(s); ${kept.length} events remain.`);
    console.log("The admin lockout is now lifted — sign in at /login.");
  } else if (recentUnlocked.length > 0) {
    console.log("\nRun with --clear to lift the lockout immediately.");
  }
} catch (err) {
  console.error("FAILED:", err.message.slice(0, 200));
  process.exitCode = 1;
} finally {
  try {
    await client.close();
  } catch {}
}
