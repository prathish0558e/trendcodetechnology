import {
  BPO_SERVICES,
  CAREERS,
  COMPANY,
  HR_SERVICES,
  SERVICES,
} from "../data/content.js";

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
    description:
      "Trend Code Technology provides software, web, mobile app, digital marketing, HR and BPO services.",
    foundingDate: String(COMPANY.founded),
    telephone: COMPANY.phone,
    email: COMPANY.email,
    address: {
      "@type": "PostalAddress",
      streetAddress: "No. 215, 2nd Floor, Shakthi Nagar, Near ICICI Bank, Ganapathy",
      addressLocality: "Coimbatore",
      addressRegion: "Tamil Nadu",
      postalCode: "641006",
      addressCountry: "IN",
    },
  };
}
