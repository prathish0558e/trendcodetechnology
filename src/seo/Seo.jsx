import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { canonicalUrl, PUBLIC_SITE_URL } from "../config/site.js";
import { createOrganizationSchema, getSeoRoute } from "./routes.js";

function setMeta(attribute, key, content) {
  let element = document.head.querySelector(`meta[${attribute}="${key}"]`);
  if (!element) {
    element = document.createElement("meta");
    element.setAttribute(attribute, key);
    document.head.appendChild(element);
  }
  element.setAttribute("content", content);
}

function setCanonical(href) {
  let element = document.head.querySelector('link[rel="canonical"]');
  if (!element) {
    element = document.createElement("link");
    element.setAttribute("rel", "canonical");
    document.head.appendChild(element);
  }
  element.setAttribute("href", href);
}

export default function Seo() {
  const { pathname } = useLocation();

  useEffect(() => {
    const metadata = getSeoRoute(pathname);
    const canonical = canonicalUrl(
      pathname,
      import.meta.env.DEV ? window.location.origin : PUBLIC_SITE_URL
    );
    const description = metadata.description;
    const robots = import.meta.env.DEV || !metadata.indexable ? "noindex, nofollow" : "index, follow";

    document.title = metadata.title;
    setMeta("name", "description", description);
    setMeta("name", "robots", robots);
    setMeta("name", "author", "Trend Code Technology");
    setMeta("property", "og:type", "website");
    setMeta("property", "og:site_name", "Trend Code Technology");
    setMeta("property", "og:title", metadata.title);
    setMeta("property", "og:description", description);
    setMeta("property", "og:url", canonical);
    setMeta("property", "og:image", `${PUBLIC_SITE_URL}/tct-logo.png`);
    setMeta("property", "og:locale", "en_IN");
    setMeta("name", "twitter:card", "summary_large_image");
    setMeta("name", "twitter:title", metadata.title);
    setMeta("name", "twitter:description", description);
    setMeta("name", "twitter:image", `${PUBLIC_SITE_URL}/tct-logo.png`);
    setCanonical(canonical);

    let schema = document.head.querySelector("script#tct-organization-schema");
    if (metadata.organization) {
      if (!schema) {
        schema = document.createElement("script");
        schema.id = "tct-organization-schema";
        schema.type = "application/ld+json";
        document.head.appendChild(schema);
      }
      schema.textContent = JSON.stringify(createOrganizationSchema(PUBLIC_SITE_URL));
    } else {
      schema?.remove();
    }
  }, [pathname]);

  return null;
}
