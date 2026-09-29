export const COMPANY = {
  name: "Trend Code Technology",
  short: "TCT",
  tagline: "Software · Digital · BPO",
  phone: "+91 93848 47922",
  phoneRaw: "+919384847922",
  whatsapp: "919384847922",
  email: "trendcodetechnology2026@gmail.com",
  address: "No. 215, 2nd Floor, Shakthi Nagar, Near ICICI Bank, Ganapathy, Coimbatore — 641006",
  addressShort: "Ganapathy, Coimbatore",
  founded: 2019,
  socials: [
    { label: "Instagram", icon: "bi-instagram", url: "https://www.instagram.com/trendcodetechnology2026/" },
    { label: "X (Twitter)", icon: "bi-twitter-x", url: "https://x.com/trendcodetech" },
    { label: "YouTube", icon: "bi-youtube", url: "https://www.youtube.com/@trendcodetechnology" },
    { label: "Facebook", icon: "bi-facebook", url: "https://www.facebook.com/profile.php?id=61593813545533" },
  ],
  mapEmbed:
    "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d4576.857768227223!2d76.98199060399196!3d11.043344392004284!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ba8fca8ea954ccd%3A0x6d79791fad302083!2sTrend%20Code%20Technology!5e0!3m2!1sen!2sin!4v1790682190686!5m2!1sen!2sin",
};

export const NAV = [
  { label: "Home", to: "/" },
  { label: "About Us", to: "/about" },
  { label: "Services", to: "/services" },
  {
    label: "HR Services",
    to: "/hr-services",
    children: [
      { label: "Domestic", to: "/hr-services/domestic" },
      { label: "Training", to: "/hr-services/training" },
    ],
  },
  {
    label: "BPO",
    to: "/bpo",
    children: [
      { label: "Data Entry", to: "/bpo/data-entry" },
      { label: "Voice Process", to: "/bpo/voice-process" },
    ],
  },
  {
    label: "Careers",
    to: "/careers",
    children: [
      { label: "IT Fields", to: "/careers/it" },
      { label: "Non-IT Fields", to: "/careers/non-it" },
    ],
  },
  { label: "Contact Us", to: "/contact" },
];

export const STATS = [
  { value: 1200, suffix: "+", label: "Happy Clients", icon: "bi-emoji-smile" },
  { value: 1150, suffix: "+", label: "Projects Done", icon: "bi-patch-check" },
  { value: 500, suffix: "+", label: "Win Awards", icon: "bi-trophy" },
  { value: 7, suffix: "+", label: "Years Experience", icon: "bi-calendar-check" },
];

export const SERVICES = [
  {
    slug: "software-development",
    icon: "bi-code-slash",
    title: "Software Development",
    blurb: "Custom web and enterprise applications engineered around your workflows — from first wireframe to production launch.",
    points: [
      "Custom web & enterprise applications",
      "API design and third-party integrations",
      "Legacy system modernisation",
      "Agile delivery with weekly demos",
    ],
  },
  {
    slug: "web-development",
    icon: "bi-globe2",
    title: "Web Development",
    blurb: "Fast, secure, SEO-ready websites and portals that look sharp on every device and convert visitors into customers.",
    points: [
      "Corporate & e-commerce websites",
      "React / Node full-stack builds",
      "Headless CMS implementation",
      "Core Web Vitals optimisation",
    ],
  },
  {
    slug: "app-development",
    icon: "bi-phone",
    title: "App Development",
    blurb: "Native and cross-platform mobile apps with offline-first architecture, built for performance and store readiness.",
    points: [
      "iOS & Android applications",
      "React Native / Flutter builds",
      "Offline-first architecture",
      "Play Store & App Store release support",
    ],
  },
  {
    slug: "digital-marketing",
    icon: "bi-megaphone",
    title: "Digital Marketing",
    blurb: "Full-funnel campaigns across search, social and email — backed by analytics that prove every rupee spent.",
    points: [
      "SEO & technical audits",
      "Google & Meta ad campaigns",
      "Social media management",
      "Analytics & conversion tracking",
    ],
  },
  {
    slug: "iot",
    icon: "bi-cpu",
    title: "IoT Solutions",
    blurb: "Connected devices and real-time dashboards that automate operations, cut downtime and surface actionable data.",
    points: [
      "Sensor & device integrations",
      "Real-time dashboards",
      "Edge computing gateways",
      "Predictive maintenance systems",
    ],
  },
  {
    slug: "ml-python",
    icon: "bi-graph-up-arrow",
    title: "ML / Python",
    blurb: "Machine-learning pipelines in Python that forecast demand, classify documents and automate decisions.",
    points: [
      "Data pipelines & ETL",
      "Predictive modelling",
      "Computer vision & NLP",
      "MLOps and model monitoring",
    ],
  },
  {
    slug: "ai-robotics",
    icon: "bi-robot",
    title: "AI / Robotics",
    blurb: "Conversational AI, RPA and vision-based automation that remove repetitive work from your teams' day.",
    points: [
      "Conversational AI assistants",
      "Process automation (RPA)",
      "Vision-based quality checks",
      "Robotics integration",
    ],
  },
  {
    slug: "ui-ux",
    icon: "bi-vector-pen",
    title: "UI / UX Design",
    blurb: "Research-driven interface design and design systems that make products intuitive, accessible and beautiful.",
    points: [
      "User research & wireframes",
      "Design systems in Figma",
      "Usability testing",
      "Interactive prototypes",
    ],
  },
  {
    slug: "software-testing",
    icon: "bi-bug",
    title: "Software Testing",
    blurb: "Manual and automated QA that catches issues before your users do — functional, API and performance testing.",
    points: [
      "Manual & automated testing",
      "API and load testing",
      "Regression test suites",
      "CI/CD quality gates",
    ],
  },
  {
    slug: "cloud",
    icon: "bi-cloud-check",
    title: "Cloud Computing",
    blurb: "Cloud architecture, migration and DevOps on AWS, Azure and GCP — resilient, observable and cost-aware.",
    points: [
      "AWS / Azure / GCP setup",
      "Cloud migration & cost review",
      "DevOps CI/CD pipelines",
      "24/7 monitoring & alerts",
    ],
  },
  {
    slug: "data-entry",
    icon: "bi-keyboard",
    title: "Data Entry",
    blurb: "Accurate, fast document processing and database upkeep handled by trained operators with multi-level QC.",
    points: [
      "Online & offline data entry",
      "Document digitisation",
      "Database maintenance",
      "99.9% accuracy with QC",
    ],
  },
  {
    slug: "voice-process",
    icon: "bi-headset",
    title: "Voice Process",
    blurb: "Professional call-center teams for inbound support, outbound sales and customer success — measured on CSAT.",
    points: [
      "Inbound & outbound support",
      "Tele-sales & surveys",
      "Multilingual agents",
      "QA & call analytics",
    ],
  },
];

export const FEATURES = [
  {
    icon: "bi-lightbulb",
    title: "Innovative Solutions",
    text: "Modern stacks and product thinking that turn business problems into scalable software.",
  },
  {
    icon: "bi-sliders",
    title: "Customized Strategies",
    text: "Every engagement is tailored — scope, stack and pricing shaped around your goals.",
  },
  {
    icon: "bi-buildings",
    title: "Industry-Specific Expertise",
    text: "Deep delivery experience across manufacturing, retail, education and services.",
  },
  {
    icon: "bi-headset",
    title: "24/7 Support",
    text: "Round-the-clock monitoring and rapid response, any hour of any day.",
  },
];

export const PROCESS = [
  { step: "01", title: "Discover", text: "We map your goals, users and constraints in a focused discovery sprint." },
  { step: "02", title: "Design", text: "Wireframes, architecture and a concrete plan — approved before code begins." },
  { step: "03", title: "Develop", text: "Iterative builds with weekly demos, automated tests and code review." },
  { step: "04", title: "Deliver", text: "Launch, monitor and improve — with SLAs and support that stay on." },
];

export const TESTIMONIALS = [
  {
    name: "PRIYANKA V",
    role: "Human Resource",
    quote:
      "Their voice support team is top-notch — professional, friendly, and always on point. Our customer satisfaction scores have gone up significantly since partnering with them.",
  },
  {
    name: "PRAKASH S",
    role: "Software Developer",
    quote:
      "TCT approached the team for a complete website overhaul, and they absolutely nailed it. The design is modern, the navigation is seamless, and the site loads fast on all devices!",
  },
  {
    name: "KRISHNAN G",
    role: "Business Man",
    quote:
      "Their digital marketing strategies helped us triple our traffic in just three months. From SEO to PPC, everything was handled with precision. Our sales have never looked better!",
  },
  {
    name: "PREETHI S",
    role: "Startup Founder",
    quote:
      "The frontend team delivered a sleek, responsive interface that looks stunning. Their attention to UX and smooth animations made our web app feel incredibly polished and professional.",
  },
];

export const HR_SERVICES = [
  {
    slug: "domestic",
    icon: "bi-people",
    title: "Domestic Manpower",
    blurb:
      "Reliable, verified domestic staffing for factories, offices and facilities — recruited, trained and managed end to end.",
    points: [
      "Housekeeping & facility staff",
      "Packing and production support",
      "Loading, unloading & logistics helpers",
      "Payroll and statutory compliance handled by TCT",
    ],
  },
  {
    slug: "training",
    icon: "bi-mortarboard",
    title: "Training Programs",
    blurb:
      "Job-ready skill programs for freshers and upskilling tracks for working teams, delivered on-site or at our centre.",
    points: [
      "Communication & workplace readiness",
      "Computer basics and office tools",
      "Technical upskilling for IT roles",
      "Campus-to-corporate induction programs",
    ],
  },
];

export const BPO_SERVICES = [
  {
    slug: "data-entry",
    icon: "bi-keyboard",
    title: "Data Entry",
    blurb:
      "High-volume, high-accuracy data operations with trained operators, multi-level QC and strict confidentiality.",
    points: [
      "Online & offline data entry",
      "Document digitisation & indexing",
      "Database creation and maintenance",
      "Daily accuracy & TAT reporting",
    ],
  },
  {
    slug: "voice-process",
    icon: "bi-headset",
    title: "Voice Process",
    blurb:
      "Customer-facing voice teams for support, retention and sales — coached continuously and measured on CSAT.",
    points: [
      "Inbound customer support",
      "Outbound calling & surveys",
      "Order booking & helpdesk",
      "QA audits & call analytics",
    ],
  },
];

export const CAREERS = {
  it: {
    slug: "it",
    icon: "bi-pc-display",
    title: "IT Fields",
    blurb:
      "Build your career on modern technology stacks with mentor-led projects, structured reviews and real client work from day one.",
    roles: [
      "Web Designing",
      "Web Development",
      "Digital Marketing",
      "Software Development",
      "Machine Learning",
    ],
  },
  "non-it": {
    slug: "non-it",
    icon: "bi-headset",
    title: "Non-IT Fields",
    blurb:
      "People-first roles with clear growth paths, paid training and performance-linked incentives in our BPO and operations teams.",
    roles: ["Data Entry", "Voice Process"],
  },
};

export const VALUES = [
  {
    icon: "bi-shield-check",
    title: "Ownership",
    text: "We treat every project like our own product — timelines, quality and outcomes included.",
  },
  {
    icon: "bi-eye",
    title: "Transparency",
    text: "Clear estimates, weekly demos and honest status updates. No surprises, ever.",
  },
  {
    icon: "bi-rocket-takeoff",
    title: "Craft",
    text: "Clean code, considered design and documentation that outlives the project.",
  },
  {
    icon: "bi-heart",
    title: "People",
    text: "Clients, employees and freshers grow together — training and mentorship are built in.",
  },
];
