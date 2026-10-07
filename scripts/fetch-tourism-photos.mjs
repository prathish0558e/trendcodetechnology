#!/usr/bin/env node
/*
 * Downloads freely-licensed destination photos from Wikimedia Commons into
 * public/tourism/ and writes src/data/tourism-credits.json with the
 * attribution data the Tourism page renders.
 *
 * Only files whose licence allows commercial reuse (CC0 / public domain /
 * CC BY / CC BY-SA) and that are at least 1200px wide are accepted.
 *
 *   node scripts/fetch-tourism-photos.mjs             # all destinations
 *   node scripts/fetch-tourism-photos.mjs ooty munnar # only these slugs
 *   WIDTH=1200 node scripts/fetch-tourism-photos.mjs  # override thumb width
 */

import { mkdir, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT_DIR = path.join(ROOT, "public", "tourism");
const API = "https://commons.wikimedia.org/w/api.php";
const UA = "TCT-website-photo-fetcher/1.0 (https://trendcodetechnology.vercel.app)";

/* slug -> Commons search phrase. The slug becomes the file name. */
const TARGETS = [
  { slug: "ooty", query: "Ooty lake Tamil Nadu" },
  { slug: "kodaikanal", query: "Kodaikanal lake" },
  { slug: "munnar", query: "Munnar tea plantation" },
  { slug: "alleppey", query: "Alappuzha backwaters houseboat" },
  { slug: "kanyakumari", query: "Kanyakumari sunrise sea shore" },
  { slug: "rameswaram", query: "Rameswaram temple" },
  { slug: "madurai", query: "Madurai Meenakshi temple gopuram sky" },
  { slug: "thanjavur", query: "Brihadeeswarar Temple Thanjavur" },
  { slug: "wayanad", query: "Wayanad hills Kerala" },
  { slug: "valparai", query: "Valparai hills" },
  { slug: "yercaud", query: "Yercaud hills" },
  { slug: "coorg", query: "Coorg landscape Karnataka hills" },
  /* International — searched the same way, delivered to the same folder. */
  { slug: "bali", query: "Bali Ulawatu temple sea Indonesia" },
  { slug: "dubai", query: "Dubai skyline Burj Khalifa" },
  { slug: "singapore", query: "Singapore Marina Bay Sands skyline" },
  { slug: "thailand-bangkok", query: "Grand Palace Bangkok Thailand" },
  { slug: "thailand-phuket", query: "Phuket beach Thailand" },
  { slug: "maldives", query: "Maldives island aerial overwater" },
  { slug: "vietnam-halong", query: "Halong Bay Vietnam boats" },
  { slug: "sri-lanka", query: "Sri Lanka nine arch bridge Ella" },
  { slug: "switzerland", query: "Switzerland village Alps lake" },
  { slug: "santorini", query: "Santorini Oia Greece blue domes" },
];

/* Hand-picked Commons files for slugs where the top search hit is a poor
   representative shot (odd angle, mock-up, landmark detail rather than the
   place). Keep these licence-clean and landscape. */
const OVERRIDES = {
  madurai: "File:Madurai Meenakshi Amman Temple Pond.jpg",
  /* The top search result can age out on Commons — these recent favourites
     are pinned so re-runs stay stable. */
  dubai: "File:Dubai Skyline.jpg",
  "sri-lanka": "File:Nine arch bridge Ella Sri Lanka.jpg",
  singapore: "File:1 marina bay sands singapore night 2019.jpg",
  "thailand-phuket": "File:Kata Beach, Phuket, Thailand.jpg",
  bali: "File:Tanah-Lot Bali Indonesia Pura-Tanah-Lot-01.jpg",
};

const OK_LICENCE =
  /(cc0|public domain|cc[- ]?by(-sa)?[- ]?[0-9.]*$|cc[- ]?by[- ]?sa|cc[- ]?by[- ]?[0-9.]*$)/i;

function stripHtml(value = "") {
  return String(value)
    .replace(/<[^>]*>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const THUMB_WIDTH = String(Number(process.env.WIDTH) || 1600);

async function search(query) {
  const params = new URLSearchParams({
    action: "query",
    generator: "search",
    gsrsearch: `filetype:bitmap ${query}`,
    gsrnamespace: "6",
    gsrlimit: "10",
    prop: "imageinfo",
    iiprop: "url|size|extmetadata",
    iiurlwidth: THUMB_WIDTH,
    format: "json",
    origin: "*",
  });

  const res = await fetch(`${API}?${params}`, { headers: { "User-Agent": UA } });
  if (!res.ok) throw new Error(`Commons API ${res.status}`);
  const json = await res.json();
  const pages = json?.query?.pages;
  if (!pages) return [];
  return Object.values(pages).map((p) => {
    const info = p.imageinfo?.[0];
    const meta = info?.extmetadata || {};
    return {
      title: p.title,
      thumb: info?.thumburl,
      width: Number(info?.thumbwidth || info?.width || 0),
      height: Number(info?.thumbheight || info?.height || 0),
      licence: stripHtml(meta.LicenseShortName?.value || ""),
      licenceUrl: stripHtml(meta.LicenseUrl?.value || ""),
      artist: stripHtml(meta.Artist?.value || ""),
      credit: stripHtml(meta.Credit?.value || ""),
      descriptionUrl: info?.descriptionurl || "",
    };
  });
}

/* Panels on the Tourism page are 16:10 (package covers) and ~1:1 (location
   tiles), so wildly panoramic or very tall sources crop badly. Reject those
   outright and then keep the TOP-RANKED survivor — Commons relevance is a
   better guide to what a place actually looks like than any aspect score. */
const MIN_ASPECT = 0.72; // tall portrait, e.g. 3:4
const MAX_ASPECT = 2.15; // wide landscape, e.g. 15:7

function aspectOf(candidate) {
  return candidate.height ? candidate.width / candidate.height : 0;
}

/* Look a specific Commons file up directly — used by OVERRIDES so a
   hand-picked image never depends on search ranking. */
async function fetchByTitle(title) {
  const params = new URLSearchParams({
    action: "query",
    titles: title,
    prop: "imageinfo",
    iiprop: "url|size|extmetadata",
    iiurlwidth: THUMB_WIDTH,
    format: "json",
    origin: "*",
  });
  const res = await fetch(`${API}?${params}`, { headers: { "User-Agent": UA } });
  if (!res.ok) throw new Error(`Commons API ${res.status}`);
  const json = await res.json();
  const pg = Object.values(json?.query?.pages || {})[0];
  const info = pg?.imageinfo?.[0];
  if (!info) return null;
  const meta = info.extmetadata || {};
  return {
    title: pg.title,
    thumb: info.thumburl,
    width: Number(info.thumbwidth || info.width || 0),
    height: Number(info.thumbheight || info.height || 0),
    licence: stripHtml(meta.LicenseShortName?.value || ""),
    licenceUrl: stripHtml(meta.LicenseUrl?.value || ""),
    artist: stripHtml(meta.Artist?.value || ""),
    credit: stripHtml(meta.Credit?.value || ""),
    descriptionUrl: info.descriptionurl || "",
  };
}

async function pick(query, slug) {
  if (slug && OVERRIDES[slug]) {
    const pinned = await fetchByTitle(OVERRIDES[slug]);
    if (pinned?.thumb) return pinned;
  }
  const candidates = await search(query);
  const usable = candidates.filter((c) => {
    const aspect = aspectOf(c);
    return (
      c.thumb &&
      c.width >= Math.min(1200, Number(THUMB_WIDTH)) &&
      aspect >= MIN_ASPECT &&
      aspect <= MAX_ASPECT &&
      OK_LICENCE.test(c.licence) &&
      !/\.svg$/i.test(c.title)
    );
  });
  return usable[0] || null;
}

async function download(url, dest) {
  const res = await fetch(url, { headers: { "User-Agent": UA } });
  if (!res.ok) throw new Error(`download ${res.status}`);
  const buffer = Buffer.from(await res.arrayBuffer());
  await writeFile(dest, buffer);
  return buffer.length;
}

async function main() {
  const only = process.argv.slice(2).filter((a) => !a.startsWith("-"));
  const targets = only.length
    ? TARGETS.filter((t) => only.includes(t.slug))
    : TARGETS;

  await mkdir(OUT_DIR, { recursive: true });
  const credits = {};

  for (const target of targets) {
    const dest = path.join(OUT_DIR, `${target.slug}.jpg`);
    try {
      const hit = await pick(target.query, target.slug);
      if (!hit) {
        console.log(`SKIP  ${target.slug} — no licence-clean result for "${target.query}"`);
        continue;
      }
      const bytes = await download(hit.thumb, dest);
      credits[target.slug] = {
        title: hit.title,
        licence: hit.licence,
        licenceUrl: hit.licenceUrl,
        artist: hit.artist,
        source: hit.descriptionUrl,
      };
      console.log(
        `OK    ${target.slug}.jpg  ${(bytes / 1024).toFixed(0)} KB  ${hit.width}x${hit.height}  ${hit.licence}  ${hit.title}`
      );
    } catch (error) {
      console.log(`FAIL  ${target.slug} — ${error.message}`);
    }
  }

  const creditPath = path.join(ROOT, "src", "data", "tourism-credits.json");
  if (existsSync(creditPath)) {
    const { readFile } = await import("node:fs/promises");
    const previous = JSON.parse(await readFile(creditPath, "utf8"));
    Object.assign(previous, credits);
    await writeFile(creditPath, `${JSON.stringify(previous, null, 2)}\n`);
  } else {
    await writeFile(creditPath, `${JSON.stringify(credits, null, 2)}\n`);
  }

  console.log(`\nCredits written to src/data/tourism-credits.json`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
