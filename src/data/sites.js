/*
 * TCT group websites and Find Your Path divisions.
 */
export const PATH_DIVISIONS_TOP = [
  {
    key: "fashionhub",
    title: "TCT FASHION HUB",
    company: "TREND CODE TECHNOLOGY",
    path: "/tct-fashionhub",
    icon: "bi-bag-heart-fill",
    tagline: "Apparel, Festive & Direct-from-Mill Wholesale Collections",
    accent: "#f97316",
    badgeColor: "#f97316",
  },
  {
    key: "trader",
    title: "TCT TRADERS",
    company: "TREND CODE TECHNOLOGY",
    path: "/tct-trader",
    icon: "bi-graph-up-arrow",
    tagline: "Wholesale Trading Platform, Verified Partners & Daily Price Board",
    accent: "#0284c7",
    badgeColor: "#0284c7",
  },
  {
    key: "overseas",
    title: "TCT OVERSEAS",
    company: "TREND CODE TECHNOLOGY",
    path: "/tct-overseas-edu",
    icon: "bi-globe-americas",
    tagline: "Global University Admissions, Visa Guidance & Test Coaching",
    accent: "#0ea5e9",
    badgeColor: "#0ea5e9",
  },
];

export const PATH_DIVISIONS_BOTTOM = [
  {
    key: "education",
    title: "TCT EDUCATION",
    company: "TREND CODE TECHNOLOGY",
    path: "/internship",
    icon: "bi-mortarboard-fill",
    tagline: "Internship Programs, Tech Training, ISO & NPTEL Verified Certifications",
    accent: "#10b981",
    badgeColor: "#10b981",
  },
  {
    key: "consign",
    title: "TCT CONSIGN SOLUTION",
    company: "TREND CODE TECHNOLOGY",
    path: "/hr-services",
    icon: "bi-briefcase-fill",
    tagline: "Domestic & Overseas Recruitment, Executive Search & Manpower Solutions",
    accent: "#ca8a04",
    badgeColor: "#ca8a04",
  },
];

export const PATH_DIVISIONS = [...PATH_DIVISIONS_TOP, ...PATH_DIVISIONS_BOTTOM];

export const SITES = [
  {
    key: "tct",
    name: "Trend Code Technology",
    tagline: "IT · Software · Web · BPO",
    mark: "code",
    accent: "#0d6efd",
    accent2: "#06b6d4",
    path: "/",
    url: null,
    status: "Live now",
  },
  {
    key: "fashionhub",
    name: "TCT FashionHub",
    tagline: "Fashion & Apparel Store",
    mark: "bag",
    accent: "#f97316",
    accent2: "#fb923c",
    path: "/tct-fashionhub",
    url: null,
    status: "Store launching soon",
    eyebrow: "TCT Group · Retail",
    headline: "Trending fashion, straight from Tamil Nadu's textile hubs",
    body: "TCT FashionHub is our fashion and apparel venture — everyday wear, festive collections and kids' ranges sourced from Coimbatore, Tiruppur and Erode mills, priced for regular shoppers instead of showroom markups. The online store is being built now; until it opens, our team takes orders and enquiries directly.",
    highlights: [
      {
        icon: "bi-bag",
        title: "Trend-led collections",
        text: "Everyday, festive and kids' ranges picked for local buyers — refreshed every season.",
      },
      {
        icon: "bi-cash-coin",
        title: "Direct-from-mill pricing",
        text: "Sourced at the mill level, so the price you see is close to the real wholesale rate.",
      },
      {
        icon: "bi-truck",
        title: "Doorstep delivery",
        text: "Tamil Nadu and pan-India shipping with order tracking on every parcel.",
      },
      {
        icon: "bi-arrow-repeat",
        title: "Easy exchange",
        text: "7-day size and quality exchange handled by our own support team in Coimbatore.",
      },
    ],
    note: "The full store moves to its own web address once it is live — until then, orders and enquiries are handled by the TCT team.",
  },
  {
    key: "trader",
    name: "TCT Trader",
    tagline: "Wholesale Trading Platform",
    mark: "chart",
    accent: "#0b5ed7",
    accent2: "#f97316",
    path: "/tct-trader",
    url: null,
    status: "Platform launching soon",
    eyebrow: "TCT Group · Trade",
    headline: "A simpler way to buy and sell wholesale",
    body: "TCT Trader is our trading and marketplace platform for wholesale buyers and sellers — verified partners, transparent daily price boards and secure settlements in one place. The platform is in development; right now our trade desk helps businesses buy, sell and price their goods directly.",
    highlights: [
      {
        icon: "bi-shield-check",
        title: "Verified partners",
        text: "Buyers and sellers are checked before a listing or order goes live.",
      },
      {
        icon: "bi-graph-up-arrow",
        title: "Daily price board",
        text: "Open rates for textiles, groceries and hardware, updated every working day.",
      },
      {
        icon: "bi-wallet2",
        title: "Secure settlements",
        text: "Payments recorded on the platform with clear invoices and payment terms.",
      },
      {
        icon: "bi-headset",
        title: "Trade support desk",
        text: "Local-language help for quotes, orders, logistics and disputes.",
      },
    ],
    note: "The full platform launches at its own web address — until then, our trade desk handles requirements over phone and email.",
  },
  {
    key: "overseas",
    name: "TCT Overseas & Education",
    tagline: "Study Abroad & Global Careers",
    mark: "globe",
    accent: "#0ea5e9",
    accent2: "#6366f1",
    path: "/tct-overseas-edu",
    url: null,
    status: "Admissions open & portal launching soon",
    eyebrow: "TCT Group · Global Education & Careers",
    headline: "Your Gateway to Global Education, University Admissions & Visas",
    body: "TCT Overseas & Education guides students and ambitious professionals across Tamil Nadu to prestigious universities in the UK, USA, Canada, Australia, Germany, Ireland and more. From course selection and university shortlisting to IELTS/TOEFL coaching, financial documentation, and visa processing — our experienced counselors walk with you every step of the journey.",
    highlights: [
      {
        icon: "bi-globe2",
        title: "Top Global Universities",
        text: "Admissions guidance and direct application support for accredited universities across UK, USA, Canada, Australia & Europe.",
      },
      {
        icon: "bi-journal-check",
        title: "Test Prep & Coaching",
        text: "Targeted coaching for IELTS, TOEFL, PTE, and Duolingo with verified study materials and intensive mock tests.",
      },
      {
        icon: "bi-passport",
        title: "Visa & Financial Assistance",
        text: "Transparent guidance on SOP drafting, education loans, scholarships, and embassy visa interviews.",
      },
      {
        icon: "bi-briefcase",
        title: "Post-Study Career Support",
        text: "Post-study work permit guidance, internship placement assistance, and global career pathway planning.",
      },
    ],
    note: "The dedicated student portal launches soon at its own web address — until then, admissions counseling and visa queries are handled directly by the TCT Overseas desk in Coimbatore.",
  },
];

export const SITE_KEYS = SITES.map((site) => site.key);

export function getSite(key) {
  return SITES.find((site) => site.key === key) || SITES[0];
}

/** Internal route until a real domain is configured. */
export function siteHref(site) {
  return site.url || site.path;
}

export function isExternalSite(site) {
  return Boolean(site.url);
}
