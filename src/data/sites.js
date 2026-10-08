/*
 * TCT group websites.
 *
 * These three drive the home hero showcase AND the two placeholder routes
 * (/tct-fashionhub, /tct-trader) so a sister site never lands on a 404.
 *
 * When a real domain goes live, set `url` (for example
 * `url: "https://tctfashionhub.com"`) — the hero card and the page links
 * switch to the external site automatically, no component changes needed.
 */
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
