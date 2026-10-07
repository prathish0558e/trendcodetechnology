#!/usr/bin/env node
/*
 * Deploy to production through the Vercel REST API.
 *
 * Why this exists: `vercel deploy --token ...` needs GET /v2/user to resolve the
 * token owner before it will do anything. When that call 404s ("User not found")
 * the CLI bails out with "Could not retrieve Project Settings" / "Not able to load
 * user", even though the same token can read and write the project. This script
 * skips the user lookup entirely: it hashes + uploads the source files and creates
 * a production deployment, then polls until it is ready.
 *
 * Usage:
 *   node scripts/vercel-deploy.mjs            # deploy current tree
 *   node scripts/vercel-deploy.mjs --dry      # show what would be uploaded
 *
 * Auth: VERCEL_TOKEN env var, else ./.vercel-token (gitignored).
 * Project/team ids come from ./.vercel/project.json.
 */

import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { readFile, stat } from "node:fs/promises";
import { rmSync, writeFileSync } from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const API = "https://api.vercel.com";
const DRY = process.argv.includes("--dry");

async function readToken() {
  if (process.env.VERCEL_TOKEN) return process.env.VERCEL_TOKEN.trim();
  try {
    return (await readFile(path.join(ROOT, ".vercel-token"), "utf8")).trim();
  } catch {
    throw new Error("No token: set VERCEL_TOKEN or create ./.vercel-token");
  }
}

async function readProject() {
  const raw = await readFile(path.join(ROOT, ".vercel", "project.json"), "utf8");
  const { projectId, orgId } = JSON.parse(raw);
  if (!projectId || !orgId) throw new Error(".vercel/project.json is incomplete");
  return { projectId, orgId };
}

/* The CLI ships .gitignore'd paths; mirror that by using git as the source of
   truth (secrets like server/.env are ignored and stay local). New files that
   have not been committed yet must ship too — leaving them out once shipped a
   server/index.js that imported a missing server/whatsapp.js — so the list is
   "tracked + untracked but not ignored". */
function trackedFiles() {
  const out = execFileSync("git", ["ls-files", "-z", "--cached", "--others", "--exclude-standard"], {
    cwd: ROOT,
    maxBuffer: 64 * 1024 * 1024,
  });
  return out
    .toString("utf8")
    .split("\0")
    .filter(Boolean)
    .map((f) => f.replace(/\\/g, "/"));
}

async function api(pathname, { method = "GET", token, headers = {}, raw } = {}) {
  const res = await fetch(API + pathname, {
    method,
    headers: { Authorization: `Bearer ${token}`, ...headers },
    body: raw,
  });
  const text = await res.text();
  let json = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    /* non-JSON error page */
  }
  return { status: res.status, json, text };
}

/* POST a JSON body via curl. Node's fetch() sent the deployment request with an
   empty body (Vercel answered `bad_request: Unexpected end of JSON input`), so the
   create call goes through curl, which works reliably. */
function postJsonViaCurl(url, token, payload) {
  const tmp = path.join(ROOT, ".vercel-deploy-body.json");
  writeFileSync(tmp, JSON.stringify(payload));
  try {
    const out = execFileSync(
      "curl",
      [
        "-s",
        "-X",
        "POST",
        url,
        "-H",
        `Authorization: Bearer ${token}`,
        "-H",
        "Content-Type: application/json",
        "--data-binary",
        `@${tmp}`,
      ],
      { maxBuffer: 32 * 1024 * 1024 }
    ).toString("utf8");
    let json = null;
    try {
      json = JSON.parse(out);
    } catch {
      /* leave json null; caller reports the raw text */
    }
    return { status: json ? 200 : 500, json, text: out };
  } finally {
    rmSync(tmp, { force: true });
  }
}

async function uploadFile(token, teamId, file, digest, bytes) {
  const q = teamId ? `?teamId=${encodeURIComponent(teamId)}` : "";
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    const { status, json, text } = await api(`/v2/files${q}`, {
      method: "POST",
      token,
      raw: bytes,
      headers: {
        "x-vercel-digest": digest,
        "Content-Type": "application/octet-stream",
        "Content-Length": String(bytes.length),
      },
    });
    if (status === 200 || status === 409) return; // 409 = already uploaded
    const code = json?.error?.code;
    if (code === "file_already_exists") return;
    if (attempt === 3) throw new Error(`upload failed for ${file}: ${status} ${text.slice(0, 200)}`);
    await new Promise((r) => setTimeout(r, 800 * attempt));
  }
}

async function main() {
  const token = await readToken();
  const { projectId, orgId } = await readProject();
  const teamId = orgId;

  const { status: whoStatus } = await api("/v2/user", { token });
  console.log(`token sanity check: /v2/user -> ${whoStatus}${whoStatus === 200 ? "" : " (expected 404 on team tokens; continuing via REST API)"}`);

  const files = trackedFiles();
  const manifest = [];
  const payloads = new Map();
  let bytesTotal = 0;

  for (const file of files) {
    const abs = path.join(ROOT, file);
    let buf;
    try {
      buf = await readFile(abs);
    } catch {
      const st = await stat(abs).catch(() => null);
      if (st?.isFile() === false) continue; // symlink/dir edge case
      throw new Error(`cannot read tracked file: ${file}`);
    }
    const digest = createHash("sha1").update(buf).digest("hex");
    manifest.push({ file, sha: digest, size: buf.length });
    payloads.set(digest, buf);
    bytesTotal += buf.length;
  }

  console.log(
    `files: ${manifest.length} (${(bytesTotal / 1024 / 1024).toFixed(1)} MB) project=${projectId} team=${teamId}`
  );
  if (DRY) {
    for (const f of manifest.slice(0, 40)) console.log(`  ${f.file}`);
    if (manifest.length > 40) console.log(`  … ${manifest.length - 40} more`);
    console.log("dry run — nothing uploaded");
    return;
  }

  const unique = [...new Set(manifest.map((f) => f.sha))];
  console.log(`uploading ${unique.length} unique blobs…`);
  let done = 0;
  for (const sha of unique) {
    const entry = manifest.find((f) => f.sha === sha);
    await uploadFile(token, teamId, entry.file, sha, payloads.get(sha));
    done += 1;
    if (done % 10 === 0 || done === unique.length) console.log(`  ${done}/${unique.length}`);
  }

  console.log("creating production deployment…");
  const create = postJsonViaCurl(
    `${API}/v13/deployments?teamId=${encodeURIComponent(teamId)}&forceNew=1`,
    token,
    {
      name: "trendcodetechnology",
      project: projectId,
      target: "production",
      files: manifest,
      projectSettings: { framework: "vite" },
    }
  );

  if (create.status >= 300 || !create.json?.id) {
    throw new Error(`deployment create failed: ${create.status} ${create.text.slice(0, 400)}`);
  }

  const id = create.json.id;
  console.log(`deployment ${id} -> ${create.json.url}`);

  for (let i = 0; i < 90; i += 1) {
    await new Promise((r) => setTimeout(r, 5000));
    const { json } = await api(`/v13/deployments/${id}?teamId=${encodeURIComponent(teamId)}`, { token });
    const state = json?.readyState || json?.status || "UNKNOWN";
    if (state === "READY" || state === "ERROR" || state === "CANCELED") {
      console.log(`state: ${state}  url: https://${json.url || create.json.url}`);
      if (state !== "READY") {
        console.log(JSON.stringify(json?.error || json, null, 2).slice(0, 1200));
        process.exit(1);
      }
      console.log("inspector: https://vercel.com/" + teamId + "/trendcodetechnology/" + id);
      return;
    }
    if (i % 3 === 0) console.log(`  … ${state}`);
  }
  throw new Error("timed out waiting for the deployment to become READY");
}

main().catch((err) => {
  console.error(`ERROR: ${err.message}`);
  process.exit(1);
});
