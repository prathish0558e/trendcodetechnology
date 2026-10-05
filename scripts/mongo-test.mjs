// One-off: tries candidate Atlas passwords for prathish0558e_db_user and
// prints which one connects (no secrets are printed).
import dns from "dns";
import { MongoClient } from "mongodb";

// this machine's default resolver refuses c-ares SRV queries — use public DNS
// (local-only workaround; Vercel's resolver is fine)
dns.setServers(["8.8.8.8", "1.1.1.1"]);

const USER = "prathish0558e_db_user";
const HOST = "cluster0.mitpcdz.mongodb.net";
const candidates = [
  "ZUx4GGgzfds2KWSZ", // password without the visual space
  "ZUx4GGgz fds2KWSZ", // password exactly as shown
];

const dbName = process.argv[2] || "tct";

for (const pass of candidates) {
  const uri = `mongodb+srv://${USER}:${encodeURIComponent(pass)}@${HOST}/${dbName}?retryWrites=true&w=majority&appName=Cluster0`;
  const client = new MongoClient(uri, { serverSelectionTimeoutMS: 8000 });
  try {
    await client.connect();
    await client.db().command({ ping: 1 });
    console.log("CONNECTED with candidate:", JSON.stringify(pass));
    // round-trip a write/read through the same "lists" collection the app uses
    const col = client.db(dbName).collection("lists");
    await col.updateOne({ _id: "__ping" }, { $set: { ok: Date.now() } }, { upsert: true });
    const doc = await col.findOne({ _id: "__ping" });
    await col.deleteOne({ _id: "__ping" });
    console.log("write+read OK:", !!doc, "| db:", dbName);
    await client.close();
    process.exit(0);
  } catch (err) {
    console.log("failed:", JSON.stringify(pass), "->", err.message.slice(0, 160));
    try { await client.close(); } catch {}
  }
}
console.log("NO CANDIDATE WORKED");
process.exit(1);
