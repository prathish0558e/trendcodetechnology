// Connection check for the MongoDB Atlas cluster the site users.
// Reads MONGODB_URI from the gitignored server/.env — no credentials here.
//
//   node scripts/mongo-test.mjs            # check the `tct` database
//   node scripts/mongo-test.mjs otherdb    # check another database
import dns from "dns";
import fs from "fs";
import { MongoClient } from "mongodb";

// some local resolvers refuse c-ares SRV queries — fall back to public DNS
// (local-only workaround; Vercel's resolver is fine)
dns.setServers(["8.8.8.8", "1.1.1.1"]);

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

const dbName = process.argv[2] || "tct";
const target = uri.includes(`/${dbName}?`) ? uri : uri.replace(/\/[^/?]*(\?|$)/, `/${dbName}$1`);

const client = new MongoClient(target, { serverSelectionTimeoutMS: 8000 });
try {
  const t0 = Date.now();
  await client.connect();
  await client.db().command({ ping: 1 });
  console.log(`CONNECTED in ${Date.now() - t0}ms (ping ok)`);

  // round-trip a write/read through the same "lists" collection the app uses
  const col = client.db(dbName).collection("lists");
  await col.updateOne({ _id: "__ping" }, { $set: { ok: Date.now() } }, { upsert: true });
  const doc = await col.findOne({ _id: "__ping" });
  await col.deleteOne({ _id: "__ping" });
  console.log("write+read OK:", !!doc, "| db:", dbName);

  // what the admin panel would show right now
  const keys = ["leads", "applications", "internships", "messages", "authlog", "sessions"];
  const docs = await col.find({ _id: { $in: keys } }).toArray();
  for (const key of keys) {
    const hit = docs.find((d) => d._id === key);
    console.log(`  ${key}: ${hit ? (hit.items || []).length : 0} records`);
  }
} catch (err) {
  console.error("FAILED:", err.message.slice(0, 200));
  process.exitCode = 1;
} finally {
  try {
    await client.close();
  } catch {}
}
