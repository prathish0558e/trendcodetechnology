import {
  BPO_SERVICES,
  CAREERS,
  COMPANY,
  HR_SERVICES,
  SERVICES,
} from "../data/content.js";
import { SITES } from "../data/sites.js";

function conciseDescription(description) {
  const clean = String(description).replace(/\s+/g, " ").trim();
  if (clean.length <= 160) return clean;
  const shortened = clean.slice(0, 157);
  const wordBoundary = shortened.lastIndexOf(" ");
  return `${shortened.slice(0, wordBoundary > 90 ? wordBoundary : shortened.length).replace(/[\s,;:—-]+$/, "")}…`;
}

const page = (title, description, options = {}) => ({
  title,
  description: options.indexable === false ? description : conciseDescription(description),
  indexable: options.indexable !== false,
  organization: options.organization === true,
});

export const SEO_ROUTES = {
  "/": page(
    "TCT | Software, Web Development & IT Services in Coimbatore",
    "Trend Code Technology builds software, websites, mobile apps and digital solutions for businesses in Coimbatore and across India.",
    { organization: true }
  ),
  "/about": page(
    "About TCT | IT Company in Coimbatore",
    "Meet Trend Code Technology, a Coimbatore team delivering software, web, digital, HR and BPO services with a practical, collaborative approach.",
    { organization: true }
  ),
  "/services": page(
    "Software & IT Services in Coimbatore | TCT",
    "Explore TCT software development, web and app development, digital marketing, AI, IoT, cloud, testing and technology services."
  ),
  "/hr-services": page(
    "HR & Staffing Services in Coimbatore | TCT",
    "Explore TCT domestic staffing, workforce support and practical training programs for businesses in Coimbatore and nearby areas."
  ),
  "/bpo": page(
    "BPO Services in Coimbatore | Data Entry & Voice Process | TCT",
    "TCT provides data entry and voice process support with trained teams, quality checks and dependable day-to-day operations."
  ),
  "/careers": page(
    "Careers at TCT | IT and BPO Opportunities in Coimbatore",
    "Explore IT, software, digital marketing, data entry and voice process career opportunities with Trend Code Technology."
  ),
  "/internship": page(
    "Internships at TCT | Software, Web, App, AI & Digital",
    "Build practical skills through TCT internship tracks in software, web and app development, digital marketing, AI and IoT."
  ),
  "/tourism": page(
    "Tour Packages from Coimbatore | India & International | TCT Tourism",
    "TCT Tourism offers India tour packages from Coimbatore — Ooty, Kodaikanal, Munnar, Alleppey, Wayanad — and international trips to Bali, Dubai, Singapore, Thailand, Maldives and Europe with clear per-person rates."
  ),
  "/gallery": page(
    "Photo Gallery | Trend Code Technology | Life, Team & Events",
    "Explore photo highlights from Trend Code Technology — our workspace, team celebrations, training sessions, awards, and life at TCT in Coimbatore."
  ),
  "/contact": page(
    "Contact TCT | Get a Technology Project Quote",
    "Contact Trend Code Technology in Coimbatore to discuss software, web, mobile app, digital marketing, HR or BPO requirements."
  ),
  "/login": page("Admin Login | Trend Code Technology", "Sign in to the Trend Code Technology administration area.", { indexable: false }),
  "/admin": page("Admin | Trend Code Technology", "Trend Code Technology administration area.", { indexable: false }),
};

for (const service of SERVICES) {
  const path = `/services/${service.slug}`;
  SEO_ROUTES[path] = page(
    `${service.title} in Coimbatore | TCT`,
    `${service.blurb} Talk with Trend Code Technology about your ${service.title.toLowerCase()} project.`
  );
}

for (const service of HR_SERVICES) {
  const path = `/hr-services/${service.slug}`;
  SEO_ROUTES[path] = page(
    `${service.title} | HR Services in Coimbatore | TCT`,
    `${service.blurb} Contact Trend Code Technology to discuss ${service.title.toLowerCase()} support.`
  );
}

for (const service of BPO_SERVICES) {
  const path = `/bpo/${service.slug}`;
  SEO_ROUTES[path] = page(
    `${service.title} | BPO Services in Coimbatore | TCT`,
    `${service.blurb} Talk to TCT about reliable ${service.title.toLowerCase()} operations.`
  );
}

for (const [slug, career] of Object.entries(CAREERS)) {
  const path = `/careers/${slug}`;
  SEO_ROUTES[path] = page(
    `${career.title} Careers in Coimbatore | TCT`,
    `${career.blurb} View current ${career.title.toLowerCase()} roles and apply to Trend Code Technology.`
  );
}

/* Sister-site launch pages (/tct-fashionhub, /tct-trader). They are kept out
   of the index while they are placeholders — flip `indexable` once the real
   sites are live on their own domains. */
for (const site of SITES) {
  if (site.key === "tct") continue;
  SEO_ROUTES[site.path] = page(
    `${site.name} | ${site.tagline} | Trend Code Technology`,
    `${site.name} — ${site.headline}. Handled today by the Trend Code Technology team in Coimbatore.`,
    { indexable: false }
  );
}

export const PUBLIC_SEO_ROUTES = Object.entries(SEO_ROUTES)
  .filter(([, metadata]) => metadata.indexable)
  .map(([path, metadata]) => ({ path, ...metadata }));

export function getSeoRoute(pathname) {
  const path = String(pathname || "/").split(/[?#]/, 1)[0].replace(/\/$/, "") || "/";
  return SEO_ROUTES[path] || page("Page Not Found | Trend Code Technology", "The page you requested could not be found.", { indexable: false });
}

export function createOrganizationSchema(siteUrl) {
  return {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    name: COMPANY.name,
    alternateName: COMPANY.short,
    url: siteUrl,
    logo: `${siteUrl}/tct-logo.png`,
    image: `${siteUrl}/tct-logo.png`,
    description:
      "Trend Code Technology provides software, web, mobile app, digital marketing, HR and BPO services in Coimbatore.",
    foundingDate: String(COMPANY.founded),
    telephone: COMPANY.phone,
    email: COMPANY.email,
    sameAs: COMPANY.socials
      .map((s) => s.url)
      .filter((url) => !url.includes("wa.me")),
    address: {
      "@type": "PostalAddress",
      streetAddress: "No. 215, 2nd Floor, Shakthi Nagar, Near ICICI Bank, Ganapathy",
      addressLocality: "Coimbatore",
      addressRegion: "Tamil Nadu",
      postalCode: "641006",
      addressCountry: "IN",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: "11.043344",
      longitude: "76.981991",
    },
    areaServed: {
      "@type": "City",
      name: "Coimbatore",
    },
  };
}

export function createBreadcrumbSchema(siteUrl, pathname) {
  const cleanPath = String(pathname || "/").split(/[?#]/, 1)[0].replace(/\/$/, "") || "/";
  if (cleanPath === "/") return null;

  const parts = cleanPath.slice(1).split("/");
  const items = [
    {
      "@type": "ListItem",
      position: 1,
      name: "Home",
      item: siteUrl,
    },
  ];

  let currentPath = "";
  parts.forEach((part, index) => {
    currentPath += `/${part}`;
    const route = SEO_ROUTES[currentPath];
    let name = route ? route.title.split("|")[0].replace("in Coimbatore", "").trim() : part.replace(/-/g, " ");
    if (name.length > 40) name = part.replace(/-/g, " ");
    name = name.replace(/\b\w/g, (c) => c.toUpperCase());

    items.push({
      "@type": "ListItem",
      position: index + 2,
      name,
      item: `${siteUrl}${currentPath}`,
    });
  });

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items,
  };
}

export function createServiceSchema(siteUrl, pathname) {
  const cleanPath = String(pathname || "/").split(/[?#]/, 1)[0].replace(/\/$/, "") || "/";
  if (!cleanPath.startsWith("/services/") || cleanPath === "/services") return null;

  const slug = cleanPath.replace("/services/", "");
  const service = SERVICES.find((s) => s.slug === slug);
  if (!service) return null;

  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: service.title,
    serviceType: service.title,
    description: service.blurb,
    provider: {
      "@type": "ProfessionalService",
      name: COMPANY.name,
      url: siteUrl,
      telephone: COMPANY.phone,
    },
    areaServed: {
      "@type": "City",
      name: "Coimbatore",
    },
  };
}
