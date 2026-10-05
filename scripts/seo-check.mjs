import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { DEFAULT_PUBLIC_SITE_URL, normalizePath, normalizeSiteUrl } from "../shared/site.js";
import { PUBLIC_SEO_ROUTES, SEO_ROUTES, createOrganizationSchema } from "../src/seo/routes.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dist = path.join(root, "dist");
const siteUrl = normalizeSiteUrl(process.env.VITE_PUBLIC_SITE_URL, DEFAULT_PUBLIC_SITE_URL);
const errors = [];
const check = (condition, message) => { if (!condition) errors.push(message); };
const read = (file) => fs.readFile(file, "utf8");
const fileFor = (route) => route === "/"
  ? path.join(dist, "index.html")
  : path.join(dist, `${route.slice(1).replace(/\//g, "--")}.html`);
const decodeHtml = (value) => value
  .replace(/&amp;/g, "&")
  .replace(/&lt;/g, "<")
  .replace(/&gt;/g, ">")
  .replace(/&quot;/g, '"')
  .replace(/&#39;/g, "'");
const attr = (html, attribute, value) => {
  const pattern = new RegExp(`<[^>]+\\b${attribute}=["']${value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}['"][^>]*>`, "i");
  return html.match(pattern)?.[0] || "";
};
const contentOf = (html, attribute, value) => {
  const tag = attr(html, attribute, value);
  return decodeHtml(tag.match(/\bcontent=["']([^"']*)["']/i)?.[1] || "");
};

try {
  await fs.access(path.join(dist, "index.html"));
} catch {
  console.error("[seo:check] dist/index.html is missing. Run npm run build first.");
  process.exit(1);
}

const sitemap = await read(path.join(dist, "sitemap.xml")).catch(() => "");
const robots = await read(path.join(dist, "robots.txt")).catch(() => "");
const sitemapUrls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
const expectedUrls = PUBLIC_SEO_ROUTES.map(({ path: route }) => `${siteUrl}${normalizePath(route)}`);
function resolveRewriteDestination(source, destination, route) {
  if (source === route) return destination;
  const names = [];
  const pattern = new RegExp(`^${source
    .replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
    .replace(/:([A-Za-z][A-Za-z0-9_]*)/g, (_token, name) => {
      names.push(name);
      return "([^/]+)";
    })}$`);
  const match = route.match(pattern);
  if (!match) return null;
  return names.reduce((resolved, name, index) => resolved.replaceAll(`:${name}`, match[index + 1]), destination);
}
check(sitemap.includes("<urlset"), "sitemap.xml is missing or malformed");
check(JSON.stringify(sitemapUrls) === JSON.stringify(expectedUrls), "sitemap.xml does not exactly match the public route list");
check(!/trendcodetechnology\.com|localhost|127\.0\.0\.1/i.test(sitemap), "sitemap contains an old or local hostname");
check(!sitemapUrls.some((url) => /\/(admin|login)(?:\/|$)/.test(new URL(url).pathname)), "sitemap includes a private route");
check(robots.includes(`Sitemap: ${siteUrl}/sitemap.xml`), "robots.txt does not point to the production sitemap");
check(/Disallow:\s*\/api\//i.test(robots), "robots.txt should keep API endpoints out of crawler queues");

const vercel = JSON.parse(await read(path.join(root, "vercel.json")));
const rewriteSources = (vercel.rewrites || []).map((rewrite) => rewrite.source);
for (const route of Object.keys(SEO_ROUTES)) {
  if (route === "/") continue;
  const matchingRewrite = (vercel.rewrites || []).find((rewrite) =>
    resolveRewriteDestination(rewrite.source, rewrite.destination, route)
  );
  check(Boolean(matchingRewrite), `Vercel has no static metadata rewrite for ${route}`);
  if (matchingRewrite) {
    const resolved = resolveRewriteDestination(matchingRewrite.source, matchingRewrite.destination, route);
    const expected = `/${route.slice(1).replace(/\//g, "--")}.html`;
    check(resolved === expected, `Vercel routes ${route} to ${resolved}, expected ${expected}`);
  }
}

for (const [route, metadata] of Object.entries(SEO_ROUTES)) {
  const file = fileFor(route);
  const html = await read(file).catch(() => "");
  check(Boolean(html), `missing generated page file for ${route}`);
  if (!html) continue;
  const canonical = `${siteUrl}${normalizePath(route)}`;
  const title = decodeHtml(html.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i)?.[1] || "");
  check(title === metadata.title, `${route} title is missing or incorrect`);
  if (metadata.indexable) {
    check(title.length >= 20 && title.length <= 70, `${route} title should be distinct and concise (20–70 characters)`);
    check(metadata.description.length >= 80 && metadata.description.length <= 170, `${route} description should be a useful search snippet (80–170 characters)`);
  }
  check(contentOf(html, "name", "description") === metadata.description, `${route} meta description is missing or incorrect`);
  check(attr(html, "rel", "canonical").includes(`href="${canonical}"`), `${route} canonical URL is missing or incorrect`);
  check(contentOf(html, "property", "og:url") === canonical, `${route} Open Graph URL is missing or incorrect`);
  check(contentOf(html, "property", "og:title") === metadata.title, `${route} Open Graph title is missing or incorrect`);
  check(contentOf(html, "property", "og:description") === metadata.description, `${route} Open Graph description is missing or incorrect`);
  check(contentOf(html, "name", "robots") === (metadata.indexable ? "index, follow" : "noindex, nofollow"), `${route} robots directive is incorrect`);
  check(/trendcodetechnology\.com|localhost|127\.0\.0\.1/i.test(html) === false, `${route} HTML contains a stale/local hostname`);
  if (metadata.organization) {
    const script = html.match(/<script id="tct-organization-schema" type="application\/ld\+json">([\s\S]*?)<\/script>/i)?.[1];
    try {
      const schema = JSON.parse(script || "null");
      const expected = createOrganizationSchema(siteUrl);
      check(JSON.stringify(schema) === JSON.stringify(expected), `${route} organization schema does not match verified company details`);
      check(!("openingHours" in schema) && !("priceRange" in schema), `${route} schema contains unverified hours or pricing`);
    } catch {
      check(false, `${route} organization schema is missing or invalid JSON`);
    }
  }
}

check((await fs.stat(path.join(dist, "tct-logo.png")).catch(() => null))?.isFile(), "public/tct-logo.png is missing from the production output");
const requiredHeaders = ["X-Content-Type-Options", "Referrer-Policy", "X-Frame-Options", "Permissions-Policy"];
const headers = vercel.headers?.flatMap((item) => item.headers || []).map((item) => item.key) || [];
for (const header of requiredHeaders) check(headers.includes(header), `Vercel security header ${header} is missing`);

if (errors.length) {
  console.error(`[seo:check] ${errors.length} issue(s):\n- ${errors.join("\n- ")}`);
  process.exit(1);
}

console.log(`[seo:check] OK — ${Object.keys(SEO_ROUTES).length} route documents, ${PUBLIC_SEO_ROUTES.length} sitemap URLs, canonicals, schema, robots and Vercel routing verified.`);
