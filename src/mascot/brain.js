import { COMPANY, SERVICES, PROCESS, HR_SERVICES, BPO_SERVICES } from "../data/content.js";
import { SITES } from "../data/sites.js";

/*
 * TCT Assistant "brain" — a fast, local, keyword-matched responder.
 * No LLM backend: answers are composed from the site's own content data,
 * so every reply is accurate and on-brand. Anything it can't answer funnels
 * politely toward the lead flow (same /api/leads pipeline Codey used).
 *
 * Leadership names are duplicated from src/components/TeamCard.jsx (TEAM) on
 * purpose — that module also imports the CEO photo, and pulling a 1.5 MB image
 * into the assistant bundle for two strings is not worth it. Keep in sync.
 */
const LEADERSHIP = [
  { name: "Bharath T", role: "Chief Executive Officer (CEO)", short: "our CEO" },
  { name: "Ms. Mohana Priya D", role: "Managing Director (MD)", short: "our MD" },
];

const serviceLine = () => {
  const names = SERVICES.map((s) => s.title);
  const head = names.slice(0, 5).join(", ");
  const rest = names.length > 5 ? ` and ${names.length - 5} more` : "";
  return `${head}${rest}`;
};

const processLine = () => PROCESS.map((p, i) => `${i + 1}. ${p.title}`).join("  ·  ");
const hrLine = () => HR_SERVICES.map((s) => s.title).slice(0, 4).join(", ");
const bpoLine = () => BPO_SERVICES.map((s) => s.title).slice(0, 4).join(", ");
const businessLine = () =>
  SITES.map((s) => `${s.name} (${s.tagline})`).join(" · ");

const RULES = [
  {
    id: "greet",
    k: ["hi", "hello", "hey", "vanakkam", "good morning", "good evening", "good afternoon", "hai"],
    a: () =>
      "Hello! 👋 Lovely to meet you. Ask me about our services, pricing, the team behind TCT, or say \"I want a job\" and I'll take your details to HR myself.",
  },
  {
    id: "ceo",
    k: ["ceo", "chief executive", "bharath", "who runs", "boss", "owner", "founder", "head of the company"],
    a: () =>
      `${LEADERSHIP[0].name} is ${LEADERSHIP[0].role} at Trend Code Technology — he has led TCT since 2019, and product decisions still land on his desk. Our MD ${LEADERSHIP[1].name} leads delivery and people. Want me to connect you with them? The fastest route is ${COMPANY.phone} or ${COMPANY.email}. 🙂`,
  },
  {
    id: "md",
    k: ["md details", " md ", "managing director", "mohanapriya", "mohana priya", "who is the md", "md name", "md phone", "contact md"],
    a: () =>
      `${LEADERSHIP[1].name} is ${LEADERSHIP[1].role} — she oversees project delivery, HR and day-to-day operations. To reach her, ring ${COMPANY.phone} or write to ${COMPANY.email} and the team routes it straight to her desk.`,
  },
  {
    id: "leadership",
    k: ["leadership", "team behind", "who is behind", "management", "directors", "leadership team"],
    a: () =>
      `TCT is led by ${LEADERSHIP[0].name} (${LEADERSHIP[0].role}) and ${LEADERSHIP[1].name} (${LEADERSHIP[1].role}). Small leadership team, quick decisions — you can meet them on the About page, and reach them through ${COMPANY.phone}.`,
  },
  {
    id: "reach",
    k: ["how to reach", "reach them", "reach leadership", "talk to the ceo", "talk to the md", "speak to md", "speak to ceo", "meet the ceo", "contact ceo", "ceo contact", "md contact", "appointment"],
    a: () =>
      `Easy: call or WhatsApp ${COMPANY.phone} (24×7) or email ${COMPANY.email} — say it's for the CEO/MD and the team books a slot. We're at ${COMPANY.addressShort}. Prefer a form? The Contact page reaches the same inbox. 📩`,
  },
  {
    id: "businesses",
    k: ["business", "our group", "group of", "fashionhub", "fashion hub", "trader", "sister site", "other website", "other site", "tct group"],
    a: () =>
      `The TCT group runs ${SITES.length} businesses: ${businessLine()}. Trend Code Technology is this site; FashionHub and Trader are launching on their own domains soon — the cards on the home page link to them. 🚀`,
  },
  {
    id: "services",
    k: ["service", "solution", "what do you do", "what you do", "offer", "build", "develop", "website", "web site", " app ", "software", "digital marketing", "seo"],
    a: () =>
      `Trend Code Technology builds ${serviceLine()}. Every project ships with weekly demos, clear pricing and support that answers the phone. Which one should I explain?`,
  },
  {
    id: "pricing",
    k: ["price", "pricing", "cost", "quote", "budget", "rate", "how much", "charge", "estimate"],
    a: () =>
      "Pricing depends on scope, so we keep it simple: share your requirement and you get a clear, fixed quote — no hidden charges. Static sites start small, custom apps and BPO are scoped individually. Want me to take your details for a free quote? 📝",
  },
  {
    id: "process",
    k: ["process", "how we work", "how do you work", "timeline", "how long", "steps", "delivery time", "workflow"],
    a: () =>
      `Our delivery process: ${processLine()}. Weekly demos, milestone timelines, zero surprises. I'd tell you it's magic, but it's mostly good project management. 😄`,
  },
  {
    id: "about",
    k: ["about", "who are you company", "company profile", "tct", "trend code", "trust", "experience", "clients", "how old"],
    a: () =>
      "Trend Code Technology is a Coimbatore-based IT company (Ganapathy) serving clients since 2019 — 1,200+ projects, 24×7 support and a 98.4% on-time delivery score. Software, digital and back-office work, delivered properly. 😊",
  },
  {
    id: "contact",
    k: ["contact", "phone", "call", "whatsapp", "email", "mail", "reach", "number", "location", "address", "where", "office", "hours", "timing", "map"],
    a: () =>
      `You can call or WhatsApp us 24×7 at ${COMPANY.phone}, or email ${COMPANY.email}. We're at ${COMPANY.address}. The team replies fast — humans, I promise. 🙂`,
  },
  {
    id: "careers",
    k: ["career", "vacancy", "hiring", "recruit", "opening", "internship", "intern", "fresher"],
    a: () =>
      "We're usually hiring developers, designers, digital marketers and BPO associates, and our internship programme covers 12 domains. All open roles live on the Careers page. If you'd rather skip the form, just say \"I want a job\" and I'll collect your details right here. 💼",
  },
  {
    id: "hr",
    k: ["hr service", "recruitment", "payroll", "staffing", "consultancy"],
    a: () =>
      `Our HR services cover ${hrLine()} and more — end-to-end recruitment and back-office HR for growing teams. Details are on the HR Services page.`,
  },
  {
    id: "bpo",
    k: ["bpo", "back office", "data entry", "support service", "customer support", "outsourc"],
    a: () =>
      `Our BPO division runs ${bpoLine()} — trained teams, SLA-backed quality and 24×7 coverage from Coimbatore. Explore the BPO page for the full list.`,
  },
  {
    id: "tourism",
    k: ["tourism", "tour", "package", "trip", "ooty", "kodaikanal", "munnar", "bali", "dubai", "travel"],
    a: () =>
      "Yes — TCT Tourism! India packages (Ooty, Kodaikanal, Munnar, Alleppey, Wayanad) and international trips (Bali, Dubai, Singapore, Thailand, Maldives, Europe) with clear per-person rates. Tell me where you'd like to go and I'll pass it to the travel desk. ✈️",
  },
  {
    id: "identity",
    k: ["who are you", "your name", "are you a robot", "are you human", "are you ai", "are you real", "do you sleep", "you robot", "what are you"],
    a: () =>
      "I'm the TCT Assistant — a small robot living in the corner of this website. 🤖 100% robot, 0% coffee breaks. My answers come from TCT's own published details, so I'm accurate but not psychic — for anything unusual, a human at the office will help.",
  },
  {
    id: "joke",
    k: ["joke", "funny", "make me laugh", "comedy"],
    a: () =>
      "Okay: I asked the server why it was sad… it said it had too many unresolved issues. 🥲 Now — shall we get back to something that actually helps your business? I can quote a project in two minutes.",
  },
  {
    id: "thanks",
    k: ["thank", "thanks", "nandri", "romba nalla", "super", "wonderful", "helpful"],
    a: () => "Happy to help! 😄 Anything else you'd like to know — services, the team, or a job?",
  },
  {
    id: "bye",
    k: ["bye", "good night", "goodnight", "see you", "tata", "ok bye", "thank you bye"],
    a: () => "Good night! 🌙 See you soon — I'll be right here on my cloud, waiting for your next question.",
  },
];

/*
 * Keyword matching with word boundaries.
 * Short keys ("hi", "md", "app", "hai") must be whole words — otherwise
 * "which" matches "hi" and "Thailand" matches "hai". Longer keys keep prefix
 * matching so "recruit" still catches "recruitment" and "intern" catches
 * "internship".
 */
const KEY_CACHE = new Map();
function keyRegex(key) {
  if (KEY_CACHE.has(key)) return KEY_CACHE.get(key);
  const k = key.trim();
  const esc = k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const re =
    k.length <= 3
      ? new RegExp(`(^|[^a-z0-9])${esc}([^a-z0-9]|$)`, "i")
      : new RegExp(`(^|[^a-z0-9])${esc}`, "i");
  KEY_CACHE.set(key, re);
  return re;
}

const hits = (text, keys) => keys.some((key) => keyRegex(key).test(text));

export function answerFor(text) {
  const q = String(text || "").toLowerCase();
  for (const r of RULES) {
    if (hits(q, r.k)) return r.a();
  }
  return null;
}

export const FALLBACK = () => {
  const opts = "services, pricing, careers, who runs TCT, how to reach us";
  return `That one is outside my little guide — but I'm a good listener. 🤖 Ask me about ${opts}, or say "I want a job" / "start a project" and I'll take your details straight to the team.`;
};

/* ---------- Project / enquiry flow (POSTs to /api/leads) ---------- */
export const LEAD_TRIGGERS = [
  "start a project", "start project", "get a quote", "free quote", "leave an enquiry",
  "enquiry", "enquire", "hire you", "hire a team", "contact me", "call me", "project",
  "interested", "discuss", "quote pannunga",
];

export function wantsLead(text) {
  return hits(String(text || "").toLowerCase(), LEAD_TRIGGERS);
}

export const LEAD_STEPS = ["name", "contact", "message"];

export function leadPrompt(step, draft) {
  if (step === "name") return "Wonderful! Let's do it properly. May I have your name?";
  if (step === "contact") return `Nice to meet you, ${draft.name.split(" ")[0]}! What's the best phone or email to reach you?`;
  return "Perfect. Tell me briefly about your project or requirement.";
}

export function validateLead(step, text) {
  if (step === "name") return text.length >= 2 ? null : "Please enter your name (at least 2 letters).";
  if (step === "contact") {
    const isPhone = /^[+()\d\s-]{7,16}$/.test(text);
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text);
    return isPhone || isEmail ? null : "Hmm, that doesn't look right — please share a valid phone number or email.";
  }
  return text.length >= 5 ? null : "A few more words, please — describe what you need.";
}

export function buildLeadPayload(draft) {
  const emailLike = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(draft.contact || "");
  return {
    name: draft.name || "TCT Assistant visitor",
    email: emailLike ? draft.contact : "",
    phone: emailLike ? "" : draft.contact,
    service: "TCT Assistant Chat",
    message: `[3D assistant] ${draft.message || "(from chat)"}`,
  };
}

/* ---------- Job application flow (also POSTs to /api/leads) ---------- */
export const JOB_STEPS = ["name", "email", "phone", "role", "experience"];

const JOB_TRIGGERS = [
  "i want a job", "want a job", "need a job", "looking for a job", "looking for job",
  "job venum", "velai venum", "job kudunga", "give me a job", "i want to apply",
  "want to apply", "apply for job", "apply job", "job apply", "send my resume",
  "share my resume", "submit my resume", "send resume", "any vacancy", "vacancy for",
  "job opening for me", "i am a fresher", "i'm a fresher", "fresher job",
];

export function wantsJob(text) {
  return hits(String(text || "").toLowerCase(), JOB_TRIGGERS);
}

export function jobPrompt(step, draft = {}) {
  const first = String(draft.name || "").split(" ")[0];
  switch (step) {
    case "name":
      return "Love the ambition! 💼 Let's put your profile in front of our HR team. What's your full name?";
    case "email":
      return `Nice to meet you, ${first}! Which email should HR reply to?`;
    case "phone":
      return "And your phone number? (WhatsApp number works best for a quick call.)";
    case "role":
      return "Which role are you going for? Developer · Designer · Digital Marketing · Data Entry · Voice Process · Internship — any of these is fine.";
    default:
      return "Last one — your experience level? (Fresher / 1–3 years / 3–5 years / 5+ years)";
  }
}

export function validateJob(step, text) {
  const value = String(text || "").trim();
  if (step === "name") return value.length >= 2 ? null : "Please type your full name (at least 2 letters).";
  if (step === "email") {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
      ? null
      : "That doesn't look like an email — please type it like name@example.com.";
  }
  if (step === "phone") {
    return /^[+()\d\s-]{7,16}$/.test(value)
      ? null
      : "Please share a valid phone number (7–16 digits).";
  }
  if (step === "role") return value.length >= 2 ? null : "Which role should I write down?";
  return value.length >= 1 ? null : "Please tell me your experience level (Fresher, 1–3 years, 3–5, 5+).";
}

export function buildJobPayload(draft) {
  const role = String(draft.role || "General").slice(0, 60);
  return {
    name: String(draft.name || "").slice(0, 120),
    email: String(draft.email || "").slice(0, 160),
    phone: String(draft.phone || "").slice(0, 40),
    service: `Job Application — ${role}`,
    message: [
      "Job application captured by the TCT Assistant (website chat).",
      `Role wanted: ${role}`,
      `Experience:   ${draft.experience || "-"}`,
      `Email:        ${draft.email || "-"}`,
      `Phone:        ${draft.phone || "-"}`,
      "Next step: HR to call for a screening chat.",
    ].join("\n"),
  };
}

export const QUICK_CHIPS = [
  "Who is the CEO?",
  "MD details",
  "Our businesses",
  "I want a job",
  "Get a quote",
];
