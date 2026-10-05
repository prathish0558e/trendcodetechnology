// One-off: prints which files Vercel's Node File Trace would bundle for the
// serverless API entry (api/index.js) — used to verify mail assets ship.
import { nodeFileTrace } from "@vercel/nft";

const { fileList } = await nodeFileTrace(["api/index.js"], {
  base: process.cwd(),
});
const files = [...fileList].sort();
console.log("total files traced:", files.length);
const interesting = files.filter(
  (f) => f.includes("mail-assets") || f.includes(".env") || f.includes("server/")
);
console.log(interesting.join("\n") || "(no server/ files traced)");
