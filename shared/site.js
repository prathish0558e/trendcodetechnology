export const DEFAULT_PUBLIC_SITE_URL = "https://tctechs.in";

export function normalizeSiteUrl(value, fallback = DEFAULT_PUBLIC_SITE_URL) {
  try {
    const parsed = new URL(String(value || fallback));
    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") return fallback;
    return parsed.origin;
  } catch {
    return fallback;
  }
}

export function normalizePath(value = "/") {
  const pathname = String(value || "/").split(/[?#]/, 1)[0] || "/";
  const leading = pathname.startsWith("/") ? pathname : `/${pathname}`;
  const clean = leading.replace(/\/{2,}/g, "/").replace(/\/$/, "");
  return clean || "/";
}
