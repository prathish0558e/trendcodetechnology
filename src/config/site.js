import { DEFAULT_PUBLIC_SITE_URL, normalizePath, normalizeSiteUrl } from "../../shared/site.js";

export const PUBLIC_SITE_URL = normalizeSiteUrl(
  import.meta.env.VITE_PUBLIC_SITE_URL,
  DEFAULT_PUBLIC_SITE_URL
);

export const API_BASE_URL = String(import.meta.env.VITE_API_BASE_URL || "").replace(/\/+$/, "");

export function canonicalUrl(pathname = "/", origin = PUBLIC_SITE_URL) {
  return `${normalizeSiteUrl(origin)}${normalizePath(pathname)}`;
}

export function apiUrl(pathname) {
  const path = String(pathname || "");
  return `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}
