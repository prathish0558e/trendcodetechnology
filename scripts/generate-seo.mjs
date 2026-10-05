import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { DEFAULT_PUBLIC_SITE_URL, normalizePath, normalizeSiteUrl } from "../shared/site.js";
import { PUBLIC_SEO_ROUTES, SEO_ROUTES, createOrganizationSchema } from "../src/seo/routes.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dist = path.join(root, "dist");
const baseHtmlPath = path.join(dist, "index.html");
const baseHtml = await fs.readFile(baseHtmlPath, "utf8");
const siteUrl = normalizeSiteUrl(process.env.VITE_PUBLIC_SITE_URL, DEFAULT_PUBLIC_SITE_URL);

function escapeAttribute(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  })[char]);
}

function replaceOrInsert(html, pattern, replacement) {
  if (pattern.test(html)) return html.replace(pattern, replacement);
  return html.replace("</head>", `    ${replacement}\n  </head>`);
}

function withMetadata(template, pathname, metadata) {
  const url = `${siteUrl}${normalizePath(pathname)}`;
  const description = escapeAttribute(metadata.description);
  const title = escapeAttribute(metadata.title);
  let html = template.replace(/<title\b[^>]*>[\s\S]*?<\/title>/i, `<title>${title}</title>`);

  const tags = [
    [/\<meta\b(?=[^>]*\bname=["']description["'])[^>]*>/i, `<meta name="description" content="${description}" />`],
    [/\<meta\b(?=[^>]*\bname=["']robots["'])[^>]*>/i, `<meta name="robots" content="${metadata.indexable ? "index, follow" : "noindex, nofollow"}" />`],
    [/\<link\b(?=[^>]*\brel=["']canonical["'])[^>]*>/i, `<link rel="canonical" href="${url}" />`],
    [/\<meta\b(?=[^>]*\bproperty=["']og:type["'])[^>]*>/i, `<meta property="og:type" content="website" />`],
    [/\<meta\b(?=[^>]*\bproperty=["']og:site_name["'])[^>]*>/i, `<meta property="og:site_name" content="Trend Code Technology" />`],
    [/\<meta\b(?=[^>]*\bproperty=["']og:title["'])[^>]*>/i, `<meta property="og:title" content="${title}" />`],
    [/\<meta\b(?=[^>]*\bproperty=["']og:description["'])[^>]*>/i, `<meta property="og:description" content="${description}" />`],
    [/\<meta\b(?=[^>]*\bproperty=["']og:url["'])[^>]*>/i, `<meta property="og:url" content="${url}" />`],
    [/\<meta\b(?=[^>]*\bproperty=["']og:image["'])[^>]*>/i, `<meta property="og:image" content="${siteUrl}/tct-logo.png" />`],
    [/\<meta\b(?=[^>]*\bname=["']twitter:card["'])[^>]*>/i, `<meta name="twitter:card" content="summary_large_image" />`],
    [/\<meta\b(?=[^>]*\bname=["']twitter:title["'])[^>]*>/i, `<meta name="twitter:title" content="${title}" />`],
    [/\<meta\b(?=[^>]*\bname=["']twitter:description["'])[^>]*>/i, `<meta name="twitter:description" content="${description}" />`],
    [/\<meta\b(?=[^>]*\bname=["']twitter:image["'])[^>]*>/i, `<meta name="twitter:image" content="${siteUrl}/tct-logo.png" />`],
  ];
  for (const [pattern, tag] of tags) html = replaceOrInsert(html, pattern, tag);

  const schemaPattern = /<script\b(?=[^>]*\bid=["']tct-organization-schema["'])[^>]*>[\s\S]*?<\/script>/i;
  if (metadata.organization) {
    const jsonLd = JSON.stringify(createOrganizationSchema(siteUrl)).replace(/</g, "\\u003c");
    const script = `<script id="tct-organization-schema" type="application/ld+json">${jsonLd}</script>`;
    html = schemaPattern.test(html) ? html.replace(schemaPattern, script) : html.replace("</head>", `    ${script}\n  </head>`);
  } else {
    html = html.replace(schemaPattern, "");
  }
  return html;
}

for (const [pathname, metadata] of Object.entries(SEO_ROUTES)) {
  const html = withMetadata(baseHtml, pathname, metadata);
  const output = pathname === "/"
    ? baseHtmlPath
    : path.join(dist, `${pathname.slice(1).replace(/\//g, "--")}.html`);
  await fs.mkdir(path.dirname(output), { recursive: true });
  await fs.writeFile(output, html, "utf8");
}

const sitemap = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ...PUBLIC_SEO_ROUTES.map(({ path: route }) => `  <url><loc>${siteUrl}${normalizePath(route)}</loc></url>`),
  '</urlset>',
  '',
].join("\n");
await fs.writeFile(path.join(dist, "sitemap.xml"), sitemap, "utf8");
await fs.writeFile(
  path.join(dist, "robots.txt"),
  `User-agent: *\nAllow: /\nDisallow: /api/\n\nSitemap: ${siteUrl}/sitemap.xml\n`,
  "utf8"
);

console.log(`[seo] generated metadata for ${Object.keys(SEO_ROUTES).length} routes; sitemap has ${PUBLIC_SEO_ROUTES.length} URLs (${siteUrl})`);
