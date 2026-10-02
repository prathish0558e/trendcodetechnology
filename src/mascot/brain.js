import { COMPANY, SERVICES, PROCESS, HR_SERVICES, BPO_SERVICES } from "../data/content.js";

/*
 * TCT Assistant "brain" — a fast, local, keyword-matched responder.
 * No LLM backend: answers are composed from the site's own content data,
 * so every reply is accurate and on-brand. Anything it can't answer funnels
 * politely toward the lead flow (same /api/leads pipeline Codey used).
 */

const serviceLine = () => {
  const names = SERVICES.map((s) => s.title);
  const head = names.slice(0, 5).join(", ");
  const rest = names.length > 5 ? ` and ${names.length - 5} more` : "";
  return `${head}${rest}`;
};

const processLine = () =>
  PROCESS.map((p, i) => `${i + 1}. ${p.title}`).join("  ·  ");

const hrLine = () => HR_SERVICES.map((s) => s.title).slice(0, 4).join(", ");
const bpoLine = () => BPO_SERVICES.map((s) => s.title).slice(0, 4).join(", ");

const RULES = [
  {
    id: "greet",
    k: ["hi", "hello", "hey", "vanakkam", "good morning", "good evening", "good afternoon"],
    a: () => "Hello! 👋 Lovely to meet you. I can tell you about our services, pricing, how we work — or take your enquiry straight to the team.",
  },
  {
    id: "services",
    k: ["service", "what do you do", "what you do", "offer", "build", "develop", "website", "web site", "app", "software", "digital marketing", "seo"],
    a: () => `Trend Code Technology builds ${serviceLine()}. Every project ships with weekly demos, clear pricing and support that answers the phone. Which one can I explain?`,
  },
  {
    id: "pricing",
    k: ["price", "pricing", "cost", "quote", "budget", "rate", "how much", "charge", "estimate"],
    a: () => `Pricing depends on scope, so we keep it simple: share your requirement and you get a clear, fixed quote — no hidden charges. Static sites start small, custom apps and BPO are scoped individually. Want me to take your details for a free quote? 📝`,
  },
  {
    id: "process",
    k: ["process", "how we work", "how do you work", "timeline", "how long", "steps", "delivery", "workflow"],
    a: () => `Our delivery process: ${processLine()}. You get weekly demos and milestone timelines — nothing hidden, no surprises.`,
  },
  {
    id: "about",
    k: ["about", "who are you", "company", "tct", "trend code", "trust", "experience", "clients"],
    a: () => `Trend Code Technology is a Coimbatore-based IT company (Ganapathy) serving clients since 2019 — 1,200+ projects, 24×7 support and a 98.4% on-time delivery score. Software · Digital · BPO, delivered properly. 😊`,
  },
  {
    id: "contact",
    k: ["contact", "phone", "call", "whatsapp", "email", "mail", "reach", "number", "location", "address", "where", "office", "hours"],
    a: () => `You can call or WhatsApp us 24×7 at ${COMPANY.phone}, or email ${COMPANY.email}. We're at ${COMPANY.address}. The team replies fast — humans, I promise. 🙂`,
  },
  {
    id: "careers",
    k: ["career", "job", " vacancy", "hiring", "recruit", "opening", "apply", "internship", "intern", "resume", "hr "],
    a: () => `We're often hiring developers, designers and BPO associates — see open roles on our Careers page, and our 12-domain internship programme lives under Internships. HR replies within a few hours on working days.`,
  },
  {
    id: "hr",
    k: ["hr service", "recruitment", "payroll", "staffing", "consultancy"],
    a: () => `Our HR services cover ${hrLine()} and more — end-to-end recruitment and back-office HR for growing teams. Details are on the HR Services page.`,
  },
  {
    id: "bpo",
    k: ["bpo", "back office", "data entry", "support service", "customer support", "outsourc"],
    a: () => `Our BPO division runs ${bpoLine()} — trained teams, SLA-backed quality and 24×7 coverage from Coimbatore. Explore the BPO page for the full list.`,
  },
  {
    id: "support",
    k: ["support", "maintenance", "bug", "issue", "problem", "help", "existing project"],
    a: () => `Support is 24×7 — call ${COMPANY.phone} or email ${COMPANY.email} and the team will pick it up quickly, even for existing projects.`,
  },
  {
    id: "human",
    k: ["human", "agent", "real person", "talk to someone", "manager", "sales"],
    a: () => `Of course — call ${COMPANY.phone} (24×7) or leave your enquiry with me and a human from the team will call you back within 24 hours. 📞`,
  },
  {
    id: "thanks",
    k: ["thank", "thanks", "nandri", "great", "awesome", "nice", "super", "cool"],
    a: () => "Happy to help! 😄 Anything else you'd like to know?",
  },
  {
    id: "bye",
    k: ["bye", "good night", "goodnight", "see you", "tata", "ok bye"],
    a: () => "Good night! 🌙 See you soon — I'll be right here on my cloud.",
  },
];

export function answerFor(text) {
  const q = ` ${text.toLowerCase().trim()} `;
  for (const r of RULES) {
    if (r.k.some((k) => q.includes(k))) return r.a();
  }
  return null;
}

export const FALLBACK = () =>
  `I can answer common questions from TCT's website, but this one is outside that guide. Ask me about services, pricing, our process, careers or contact details — or choose "Start a project" and I'll send your enquiry to the team.`;

export const LEAD_TRIGGERS = [
  "start a project", "start project", "get a quote", "free quote", "leave an enquiry",
  "enquiry", "enquire", "hire you", "hire", "contact me", "call me", "project",
  "interested", "discuss",
];

export function wantsLead(text) {
  const q = text.toLowerCase();
  return LEAD_TRIGGERS.some((t) => q.includes(t));
}

/* Lead capture steps — reuses the exact /api/leads pipeline Codey used. */
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
    email: emailLike ? draft.contact : `assistant+${Date.now()}@trendcodetechnology.com`,
    phone: emailLike ? "" : draft.contact,
    service: "TCT Assistant Chat",
    message: `[3D assistant] ${draft.message || "(from chat)"}`,
  };
}

export const QUICK_CHIPS = [
  "Our services",
  "Pricing",
  "How we work",
  "Careers",
  "Start a project",
];
