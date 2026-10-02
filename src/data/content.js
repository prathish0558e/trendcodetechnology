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
      { label: "Internship", to: "/internship" },
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
    tint: "#2563eb",
    glyph: "M9 4 3 12l6 8m6-16 6 8-6 8",
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
    tint: "#0891b2",
    glyph: "M2 12h20M12 2c3 3.6 3 16.4 0 20M12 2c-3 3.6-3 16.4 0 20M4 6h16M4 18h16",
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
    tint: "#7c3aed",
    glyph: "M8 2h8a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2zm2 16h4m-5-11 2-2 2 2m-4 5 2 2 2-2",
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
    tint: "#ea580c",
    glyph: "M3 11v2l12 5V6L3 11zm12-5 6-2v16l-6-2M7 13.5V19a2 2 0 0 0 4 0v-4",
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
    tint: "#0d9488",
    glyph: "M7 7h10v10H7V7zm5-5v3m0 14v3M2 12h3m14 0h3M4.9 4.9l2.2 2.2m9.8 9.8 2.2 2.2M19.1 4.9l-2.2 2.2M7.1 16.9l-2.2 2.2",
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
    tint: "#d97706",
    glyph: "M4 20V10m5 10V4m5 16v-7m5 7V8m1 12H3",
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
    tint: "#dc2626",
    glyph: "M12 2v4m-5 2h10a3 3 0 0 1 3 3v6a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3v-6a3 3 0 0 1 3-3zm2.5 5.5v1m5-1v1M9 16h6",
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
    tint: "#db2777",
    glyph: "M4 20c1-6 4-12 8-16 4 4 7 10 8 16M8.5 14h7M12 4v16",
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
    tint: "#4f46e5",
    glyph: "M12 8a4 4 0 0 1 4 4v3a4 4 0 0 1-8 0v-3a4 4 0 0 1 4-4zm-6 4H3m18 0h-3M5.6 6.6 8 9m8 2.4 2.4-2.4M5.6 17.4 8 15m8 0 2.4 2.4M12 8V5m-3 0h6",
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
    tint: "#0284c7",
    glyph: "M6 18a4 4 0 0 1 0-8 6 6 0 0 1 11.6-1.5A4.5 4.5 0 0 1 17.5 18H6zm6-11v10m0-10-3 3m3-3 3 3m-3 7-3-3m3 3 3-3",
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
    tint: "#64748b",
    glyph: "M3 7h18v10H3V7zm3 3h.01M9 10h.01M12 10h.01M15 10h.01M18 10h.01M6 13h.01M18 13h.01M9 13h6",
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
    tint: "#16a34a",
    glyph: "M4 13a8 8 0 0 1 16 0m-16 0v3a2 2 0 0 0 2 2h1v-6H4zm16 0h-3v6h1a2 2 0 0 0 2-2v-3zM12 21h3a2 2 0 0 0 2-2",
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
  {
    title: "Business Requirement Analysis",
    text: "We study your goals, run a feasibility check and map the tech stack — then hand you a clear product roadmap with milestone timelines.",
  },
  {
    title: "UI & UX Design Approval",
    text: "Our design team crafts intuitive user journeys, wireframes and high-fidelity prototypes for your review and sign-off before development begins.",
  },
  {
    title: "Agile Development",
    text: "Our engineering team builds clean, scalable applications using sprint-based agile sprints with regular code commits and transparent progress updates.",
  },
  {
    title: "Quality Testing",
    text: "Rigorous multi-layer QA across devices, performance benchmarks and security audits guarantee zero bugs and a smooth user experience.",
  },
  {
    title: "Deployment & Training",
    text: "Zero-downtime production deployment to cloud servers or app stores, followed by comprehensive team onboarding and admin walkthroughs.",
  },
  {
    title: "Ongoing Technical Support",
    text: "Dedicated SLA maintenance, proactive server monitoring, regular security updates and continuous enhancements keep your platform at peak performance.",
  },
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

/* Detailed job descriptions (from the old careers page) — keyed by career
   track slug. Tracks listed here get the full JD + dedicated apply form. */
export const JOB_LISTINGS = {
  "non-it": {
    intro: [
      "We're hiring dedicated people for our Data Entry and Voice Process teams at Trend Code Technology. If you are accurate, disciplined and love working with people or numbers, we want to hear from you!",
      "At TCT, you get paid training, comfortable AC workspace, performance incentives and a clear growth path from executive to team lead — with daily-format work and supportive supervisors.",
      "We offer competitive salaries, daily/weekly payout options for select roles, and continuous skill training at our Ganapathy, Coimbatore centre.",
    ],
    jobs: [
      {
        title: "Data Entry",
        qualification: "Any degree; typing speed 30+ WPM in English preferred",
        skills:
          "Fast & accurate typing, MS Excel / Word, data verification, attention to detail, basic English reading",
        tools: "MS Office, Google Sheets, in-house CRM / ERP software",
        description: [
          "Enter and update customer records with 99%+ accuracy",
          "Verify and digitise physical documents and forms",
          "Meet daily target volumes and turnaround times (TAT)",
          "Flag and report data discrepancies to supervisors",
          "Maintain confidentiality of client data at all times",
          "Support ad-hoc data requests from the QC team",
        ],
        experience: "Fresher to 2 years — freshers with good typing speed welcome",
      },
      {
        title: "Voice Process",
        qualification: "Any degree; fluent Tamil + basic English (Hindi a plus)",
        skills:
          "Clear communication, friendly customer handling, patience, basic computer knowledge, persuasive calling for outbound",
        tools: "CRM software, dialer systems, headset, call QA tools",
        description: [
          "Handle inbound customer support and outbound calling campaigns",
          "Resolve customer queries politely and accurately on calls",
          "Log every interaction in the CRM with correct disposition",
          "Meet CSAT, quality and daily call-count targets",
          "Escalate complex issues to the team lead with full context",
          "Participate in daily huddles and QA feedback coaching",
        ],
        experience: "Fresher to 2 years — paid voice & accent training provided",
      },
    ],
  },
  it: {
    intro: [
      "We're looking for skilled developers to join our Web Development team at Trend Code Technology. If you have expertise in building robust, scalable web applications and enjoy solving complex technical challenges, we want to hear from you!",
      "At TCT, we provide opportunities to work with cutting-edge technologies on diverse projects. Our developers collaborate with designers and product managers to create high-performance web solutions that drive business growth.",
      "We offer competitive salaries, continuous learning opportunities, and a collaborative work environment with the latest development tools and technologies.",
    ],
    jobs: [
      {
        title: "Frontend Developer",
        qualification: "Degree in Computer Science or related field",
        skills: "HTML5, CSS3, JavaScript, React/Angular/Vue, Responsive Design",
        tools: "Git, Webpack, npm/yarn, Chrome DevTools",
        description: [
          "Develop new user-facing features using modern frameworks",
          "Build reusable components and front-end libraries",
          "Optimize applications for maximum speed and scalability",
          "Collaborate with UI/UX designers to implement designs",
          "Ensure technical feasibility of UI/UX designs",
          "Stay updated with emerging frontend technologies",
        ],
        experience: "Fresher to 3 years in frontend development (GitHub profile preferred)",
      },
      {
        title: "Backend Developer",
        qualification: "Degree in Computer Science or related field",
        skills: "Node.js/Python/Java, REST APIs, Databases, Authentication",
        tools: "Git, Docker, Postman, SQL/NoSQL databases",
        description: [
          "Design and implement server-side logic",
          "Build reusable, testable, and efficient code",
          "Implement security and data protection measures",
          "Integrate data storage solutions",
          "Optimize application for maximum speed and scalability",
          "Collaborate with frontend developers and DevOps",
        ],
        experience: "Fresher to 3 years in backend development",
      },
      {
        title: "Full Stack Developer",
        qualification: "Degree in Computer Science or related field",
        skills: "JavaScript, React/Angular, Node.js/Python, Databases",
        tools: "Git, Docker, Postman, AWS/Google Cloud",
        description: [
          "Develop both client-side and server-side architecture",
          "Design and develop APIs",
          "Create database schemas that support business processes",
          "Ensure cross-platform optimization for mobile",
          "Work with DevOps for deployment and CI/CD",
          "Stay updated with emerging technologies",
        ],
        experience: "Fresher to 5 years in full stack development",
      },
    ],
  },
};

/* Per-role detailed JDs — keyed by role name. A role listed here gets its
   own JD accordion + pre-selected dedicated apply form on the track page. */
export const ROLE_JDS = {
  "Web Designing": {
    qualification: "Degree/Diploma in Web Design, Visual Communication or related field",
    skills:
      "Figma/Adobe XD, HTML5, CSS3, JavaScript basics, responsive layouts, typography & color theory",
    tools: "Figma, Photoshop, Illustrator, VS Code, Chrome DevTools",
    description: [
      "Design clean, modern website layouts and landing pages in Figma",
      "Convert approved designs into pixel-perfect responsive HTML/CSS",
      "Build reusable UI components consistent with the brand design system",
      "Optimize images and assets for fast page loads",
      "Coordinate with developers to implement designs accurately",
      "Incorporate client feedback quickly with professional polish",
    ],
    experience: "Fresher to 3 years — portfolio required",
  },
  "Digital Marketing": {
    qualification: "Any degree; digital marketing certification preferred",
    skills:
      "SEO, Google & Meta Ads, social media management, content planning, Google Analytics, copywriting",
    tools: "Google Ads, Meta Business Suite, GA4, SEMrush/Ahrefs, Canva",
    description: [
      "Plan and run SEO, Google Ads and Meta ad campaigns end to end",
      "Manage social media calendars and grow organic engagement",
      "Write crisp ad copy, captions and simple landing-page content",
      "Track conversions in GA4 and report ROI to clients monthly",
      "Do keyword research and on-page optimization for client sites",
      "A/B test creatives and scale winning campaigns",
    ],
    experience: "Fresher to 3 years — freshers with certification welcome",
  },
  "Software Development": {
    qualification: "Degree in Computer Science or related field",
    skills:
      "Python/Java/C#, OOP, REST APIs, SQL, data structures, problem solving",
    tools: "Git, VS Code, Postman, Docker, SQL Server/PostgreSQL",
    description: [
      "Build custom business applications from requirement to deployment",
      "Write clean, testable, well-documented backend code",
      "Design REST APIs and integrate third-party services",
      "Debug production issues and ship fixes fast",
      "Participate in code reviews and sprint planning",
      "Maintain and improve legacy client systems safely",
    ],
    experience: "Fresher to 4 years — strong fundamentals matter more than stack",
  },
  "Machine Learning": {
    qualification: "Degree in CS/Data Science/Math or related field",
    skills:
      "Python, pandas/scikit-learn, model training & evaluation, statistics, basic deep learning",
    tools: "Python, Jupyter, TensorFlow/PyTorch, scikit-learn, SQL, Git",
    description: [
      "Clean data and build ML pipelines for real client problems",
      "Train, evaluate and tune models (classification, forecasting, NLP)",
      "Deploy models as APIs and monitor them in production",
      "Run computer-vision experiments for quality-check automation",
      "Document experiments so results are reproducible",
      "Present findings clearly to non-technical stakeholders",
    ],
    experience: "Fresher to 3 years — project portfolio or Kaggle preferred",
  },
};

/* Per-domain detailed internship JDs — keyed by the exact domain names the
   backend serves at /api/internship/domains. Each gets its own accordion
   card + pre-selected dedicated apply form on the /internship page. */
export const INTERNSHIP_JDS = {
  "Software Development": {
    qualification: "B.E./B.Tech/MCA students (2nd year onwards) or recent graduates",
    skills: "Core programming (Python/Java/C#/JS), OOP basics, SQL fundamentals, problem solving",
    tools: "Git, VS Code, Postman, SQL databases",
    description: [
      "Build features for live client applications under a senior mentor",
      "Write clean, documented backend/frontend code",
      "Debug issues and write simple unit tests",
      "Join daily standups and sprint reviews like a real team member",
      "Ship at least one production feature by internship end",
    ],
    duration: "2–6 months — full-time or part-time (college-friendly)",
  },
  "Web Development": {
    qualification: "Any degree/diploma student with HTML/CSS/JS basics",
    skills: "HTML5, CSS3, JavaScript, React basics, responsive design, REST APIs",
    tools: "Git, VS Code, Chrome DevTools, Figma, npm",
    description: [
      "Develop responsive pages and components for client websites",
      "Convert Figma designs into pixel-perfect HTML/CSS/React",
      "Integrate APIs and fix UI bugs reported by QA",
      "Learn performance and SEO best practices on real sites",
      "Build a portfolio-grade live project you can showcase",
    ],
    duration: "1–6 months — stipend review at 3 months",
  },
  "App Development": {
    qualification: "B.E./B.Tech/BCA/MCA students with Java or JS basics",
    skills: "React Native or Flutter, JavaScript/Dart, mobile UI patterns, API consumption",
    tools: "Android Studio, Xcode simulator, Git, Firebase console",
    description: [
      "Build screens and flows for iOS/Android client apps",
      "Connect apps to REST APIs and handle offline states",
      "Test on real devices and fix layout/performance issues",
      "Assist with Play Store build and release checklists",
      "Own one complete app module end to end",
    ],
    duration: "2–6 months — mobile device provided for testing",
  },
  "Digital Marketing": {
    qualification: "Any degree — BBA/MBA/B.Com/marketing students preferred",
    skills: "SEO basics, social media handling, content writing, Google Analytics curiosity",
    tools: "Google Ads, Meta Business Suite, GA4, Canva, SEMrush",
    description: [
      "Run real SEO and social campaigns for TCT and client brands",
      "Schedule posts, write captions and short ad copy",
      "Do keyword research and on-page fixes for client sites",
      "Track campaign numbers in GA4 and prepare weekly reports",
      "Assist live ad campaigns with budget and A/B testing",
    ],
    duration: "1–3 months — certification guidance included",
  },
  "IoT Solutions": {
    qualification: "ECE/EEE/Instrumentation or CS students with electronics interest",
    skills: "Basic embedded C/Python, sensors, circuits, keen hardware curiosity",
    tools: "Arduino/ESP32, Raspberry Pi, MQTT, breadboards & sensors kit",
    description: [
      "Wire sensors and microcontrollers for client automation pilots",
      "Push device data to real-time dashboards",
      "Test and calibrate devices in our in-house IoT lab",
      "Document wiring diagrams and setup guides",
      "Demo a working prototype at internship end",
    ],
    duration: "2–6 months — hardware kit provided in office",
  },
  "ML / Python": {
    qualification: "CS/Data Science/Maths students with Python basics",
    skills: "Python, pandas/numpy, statistics basics, eagerness to learn scikit-learn",
    tools: "Python, Jupyter, scikit-learn, pandas, Git, SQL basics",
    description: [
      "Clean and explore real client datasets with pandas",
      "Train simple classification/forecasting models with a mentor",
      "Evaluate models and present results in plain English",
      "Automate one manual reporting task with a Python script",
      "Document your experiments so others can reproduce them",
    ],
    duration: "2–6 months — ideal for final-year project conversion",
  },
  "AI / Robotics": {
    qualification: "CS/ECE/Robotics students with strong fundamentals",
    skills: "Python, prompt engineering basics, OpenCV curiosity, logical thinking",
    tools: "Python, OpenCV, ChatGPT/Claude APIs, RPA tools, ESP32 kits",
    description: [
      "Build a working chatbot or automation for a real business need",
      "Experiment with computer-vision demos in our lab",
      "Script simple RPA flows that remove repetitive office work",
      "Benchmark AI tools and write short internal notes",
      "Present a live AI demo to the team at internship end",
    ],
    duration: "2–6 months — lab access during office hours",
  },
  "UI / UX Design": {
    qualification: "Any degree — design/visual communication students preferred",
    skills: "Figma basics, typography, color theory, empathy for users, attention to detail",
    tools: "Figma, Photoshop/Illustrator, pen & paper, Miro",
    description: [
      "Design app/website screens under a senior product designer",
      "Create wireframes and clickable prototypes in Figma",
      "Maintain our design system components and icon sets",
      "Join user feedback sessions and iterate on designs",
      "Build a mini design case study for your portfolio",
    ],
    duration: "1–6 months — portfolio review at interview",
  },
  "Software Testing": {
    qualification: "Any degree/diploma student — CS preferred but not mandatory",
    skills: "Attention to detail, basic SQL, clear bug reporting, manual testing mindset",
    tools: "Chrome DevTools, Postman, Jira/Trello, Selenium basics, Excel",
    description: [
      "Write and execute test cases for live web and mobile apps",
      "Find, log and retest bugs with clear reproduction steps",
      "Run API tests in Postman and record responses",
      "Learn automation basics by extending a Selenium suite",
      "Sign off releases alongside the QA lead",
    ],
    duration: "1–3 months — freshers strongly encouraged",
  },
  "Cloud Computing": {
    qualification: "CS/IT students with networking fundamentals",
    skills: "Linux basics, networking concepts, virtualization curiosity, command line comfort",
    tools: "AWS free tier, Docker, Git, VS Code, cPanel/Vercel dashboards",
    description: [
      "Deploy and monitor real projects on cloud infrastructure",
      "Set up domains, SSL and environment configurations",
      "Write simple CI/CD deploy scripts with guidance",
      "Practice Docker containers on internal services",
      "Work toward an AWS/Azure certification path",
    ],
    duration: "2–6 months — certification exam guidance included",
  },
  "Data Entry": {
    qualification: "Any degree/diploma — 12th pass with fast typing also considered",
    skills: "Typing speed 30+ WPM, MS Excel/Word, accuracy, focus on repetitive quality work",
    tools: "MS Office, Google Sheets, in-house CRM/ERP software",
    description: [
      "Enter and verify customer records in CRM with high accuracy",
      "Digitise physical forms and documents daily",
      "Meet daily target volumes within turnaround time",
      "Flag data discrepancies to your supervisor",
      "Learn real office discipline — attendance, TAT and reporting",
    ],
    duration: "1–3 months — performance-based retention offered",
  },
  "Voice Process": {
    qualification: "Any degree/diploma student — fluent Tamil + basic English",
    skills: "Clear communication, friendly phone manner, patience, listening skills",
    tools: "CRM software, dialer, headset, call QA sheets",
    description: [
      "Shadow senior agents on live inbound/outbound calls",
      "Handle customer queries politely with scripted guidance",
      "Log every call in the CRM with correct disposition",
      "Practice voice & accent sessions with the QA team",
      "Hit supervised call-quality targets before certification",
    ],
    duration: "1–3 months — paid training during internship",
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

/* ---------- Rich per-service detail data (used by /services/:slug) ----------
   overview  — the 3-sentence pitch shown under the page hero
   deliverables — what the client actually receives, line by line
   techs     — tools & technology chips
   facts     — quick facts strip (timeline / engagement / support)
   faqs      — the questions clients ask before starting
   -------------------------------------------------------------------------- */
export const SERVICE_DETAILS = {
  "software-development": {
    overview:
      "Off-the-shelf software forces your business to work around its limits. We build custom web and enterprise applications around your exact workflows — so the tool fits the team, not the other way round. From first wireframe to production launch you get weekly demos, clean documented code and a dedicated engineer who knows your business.",
    deliverables: [
      "Requirement study & product roadmap with milestone timelines",
      "UI/UX wireframes and clickable prototypes for sign-off",
      "Custom web / enterprise application on your preferred stack",
      "REST APIs & third-party integrations — payments, SMS, ERP, CRM",
      "Automated testing, security hardening & performance tuning",
      "Deployment, admin training and 30 days of free post-launch support",
    ],
    techs: ["React", "Node.js", "Python", "PostgreSQL", "MongoDB", "AWS / Azure", "Docker", "REST APIs"],
    facts: [
      { k: "Timeline", v: "6–14 weeks typical MVP", icon: "bi-clock-history" },
      { k: "Engagement", v: "Fixed price or dedicated team", icon: "bi-diagram-3" },
      { k: "Support", v: "24×7 desk + SLA maintenance", icon: "bi-headset" },
    ],
    faqs: [
      {
        q: "How much does custom software cost?",
        a: "Every build is scoped individually — after a free requirement call you get a clear, fixed quote with milestone-wise pricing. No hidden charges, ever.",
      },
      {
        q: "Who owns the source code?",
        a: "You do. Full IP transfer, a documented codebase and deployment access are part of every handover.",
      },
      {
        q: "Can you take over an existing half-built project?",
        a: "Yes — we start with a code and infrastructure audit, stabilise what works, then rebuild or extend the rest with a clear migration plan.",
      },
    ],
  },
  "web-development": {
    overview:
      "Your website is your hardest-working salesperson — it never sleeps. We design and build fast, secure, SEO-ready websites and portals that look sharp on every device and turn visitors into enquiries. Corporate sites, e-commerce stores and customer portals — all shipped with weekly demos and clear pricing.",
    deliverables: [
      "Business & competitor study with sitemap and content plan",
      "Custom UI design — mobile-first, on-brand, with revisions",
      "Responsive build: React / Node full-stack or headless CMS",
      "On-page SEO — metadata, schema, sitemap, Core Web Vitals tuning",
      "Contact forms, live chat and WhatsApp integration wired to your team",
      "Hosting, SSL, domain setup and a launch-day walkthrough",
    ],
    techs: ["React", "Vite", "Node.js", "Express", "MySQL", "Headless CMS", "Google Analytics", "Cloudflare"],
    facts: [
      { k: "Timeline", v: "2–6 weeks", icon: "bi-clock-history" },
      { k: "Engagement", v: "Fixed price per scope", icon: "bi-diagram-3" },
      { k: "Support", v: "Post-launch care plan available", icon: "bi-headset" },
    ],
    faqs: [
      {
        q: "Will my website rank on Google?",
        a: "Every build ships with technical SEO done right — speed, schema, sitemaps and mobile-first design. For competitive keywords we run ongoing SEO campaigns as a separate service.",
      },
      {
        q: "Can I update the content myself?",
        a: "Yes — we can wire a headless CMS so your team edits text, images and products without touching code, with a training session included.",
      },
      {
        q: "Do you redesign existing websites?",
        a: "Absolutely. We audit what's working, protect your SEO equity with proper redirects, and rebuild the experience on a modern, fast stack.",
      },
    ],
  },
  "app-development": {
    overview:
      "Customers live on their phones — your business should too. We build native-quality iOS and Android apps with offline-first architecture, push notifications and store-ready release support. One codebase or fully native — we recommend what fits your budget and roadmap, not what pads our bill.",
    deliverables: [
      "Product discovery: user journeys, feature map and technical plan",
      "UI/UX design for every screen with a clickable prototype",
      "React Native / Flutter build — or native Swift/Kotlin where it matters",
      "Backend, APIs, push notifications and analytics integration",
      "Testing on real devices + Play Store / App Store release handling",
      "Crash monitoring, update pipeline and version-upgrade support",
    ],
    techs: ["React Native", "Flutter", "Swift", "Kotlin", "Firebase", "Node.js", "Play Store / App Store", "Push & analytics SDKs"],
    facts: [
      { k: "Timeline", v: "8–16 weeks", icon: "bi-clock-history" },
      { k: "Engagement", v: "Milestone-based", icon: "bi-diagram-3" },
      { k: "Support", v: "Store releases & updates covered", icon: "bi-headset" },
    ],
    faqs: [
      {
        q: "One app for both Android and iOS?",
        a: "Usually yes — React Native or Flutter gives you both platforms from one codebase at roughly 60% of the cost of two native builds. We advise going native only when hardware-level performance demands it.",
      },
      {
        q: "Do you publish the app for us?",
        a: "Yes — developer account setup, store listing, screenshots, review handling and the release itself are all part of the package.",
      },
      {
        q: "What about maintenance after launch?",
        a: "We offer annual care plans covering OS updates, bug fixes, crash monitoring and feature releases — quoted upfront, no surprises.",
      },
    ],
  },
  "digital-marketing": {
    overview:
      "Marketing that can't be measured is just expense. We run full-funnel campaigns across search, social and email — backed by analytics that prove every rupee spent. From SEO foundations to ad creative to landing pages, one team owns your entire growth pipeline and reports on it monthly.",
    deliverables: [
      "Digital audit: website, competitors and keyword landscape",
      "SEO — technical fixes, on-page optimisation and content plan",
      "Google Ads & Meta ad campaigns with creative design included",
      "Social media calendar — posts, reels and community management",
      "Landing pages built and A/B tested for conversion",
      "Monthly ROI report in plain English — spend, leads, cost per lead",
    ],
    techs: ["Google Ads", "Meta Business Suite", "GA4", "Search Console", "SEMrush / Ahrefs", "Canva & Figma", "WhatsApp Business", "Mailchimp"],
    facts: [
      { k: "Timeline", v: "Results in 60–90 days", icon: "bi-clock-history" },
      { k: "Engagement", v: "Monthly retainer", icon: "bi-diagram-3" },
      { k: "Support", v: "Dedicated account manager", icon: "bi-headset" },
    ],
    faqs: [
      {
        q: "How soon will I see results?",
        a: "Paid ads bring enquiries within the first weeks once campaigns optimise; SEO compounds over 2–3 months. Either way you see the numbers — spend, clicks, leads — from month one in a clear report.",
      },
      {
        q: "Is ad spend included in the price?",
        a: "No — our management fee is separate and transparent. Your ad budget goes directly to Google/Meta from your own accounts, so you keep full ownership of the data.",
      },
      {
        q: "Can you work with our in-house team?",
        a: "Yes — many clients keep marketing in-house and use us for the specialist layers: SEO technicals, ad optimisation, landing pages and analytics.",
      },
    ],
  },
  iot: {
    overview:
      "Machines that report problems before they fail are the new baseline for manufacturing. We connect your sensors, devices and machines to real-time dashboards — so downtime, energy waste and manual data collection disappear. From a single-line pilot to a full plant, we build the hardware integration and the software together.",
    deliverables: [
      "Pilot study: which machines, sensors and data points matter",
      "Sensor & gateway selection, wiring and on-site installation",
      "Edge / cloud data pipeline with MQTT or Modbus integration",
      "Real-time dashboard — live readings, alerts and trends",
      "Predictive maintenance rules and automated reports",
      "Operator training, documentation and AMC support",
    ],
    techs: ["ESP32 / Arduino", "Raspberry Pi", "MQTT", "Modbus", "Node.js", "Timeseries DB", "Grafana-style dashboards", "AWS IoT"],
    facts: [
      { k: "Timeline", v: "4–10 weeks per phase", icon: "bi-clock-history" },
      { k: "Engagement", v: "Pilot first, then scale", icon: "bi-diagram-3" },
      { k: "Support", v: "AMC with on-site visits", icon: "bi-headset" },
    ],
    faqs: [
      {
        q: "Do we need to replace our machines?",
        a: "No — most machines give out data through existing ports, current transformers or simple bolt-on sensors. We retrofit; you keep your equipment.",
      },
      {
        q: "What does a pilot cost?",
        a: "A single-line pilot — one machine, sensors, gateway, dashboard — typically starts small and delivers proof within weeks. You get a fixed quote after a free floor walkthrough.",
      },
      {
        q: "Does the dashboard work on mobile?",
        a: "Yes — responsive dashboards plus WhatsApp / SMS alerts for thresholds, so supervisors act without sitting in front of a screen.",
      },
    ],
  },
  "ml-python": {
    overview:
      "Your business already produces the data — reports, invoices, machines, customers. Our Python and machine-learning pipelines turn that raw data into forecasts, classifications and automated decisions. Document processing that took hours finishes in minutes; demand planning runs on numbers, not gut feel.",
    deliverables: [
      "Data audit: sources, quality check and a practical use-case shortlist",
      "Data pipelines & ETL — collect, clean and centralise your data",
      "Predictive models — forecasting, classification, recommendation",
      "Computer vision / NLP for documents, images and text automation",
      "Model deployment as APIs with monitoring dashboards",
      "Handover documentation and team upskilling sessions",
    ],
    techs: ["Python", "pandas / numpy", "scikit-learn", "TensorFlow / PyTorch", "OpenCV", "FastAPI", "PostgreSQL", "Docker"],
    facts: [
      { k: "Timeline", v: "4–12 weeks per use case", icon: "bi-clock-history" },
      { k: "Engagement", v: "Proof-of-value first", icon: "bi-diagram-3" },
      { k: "Support", v: "Model monitoring included", icon: "bi-headset" },
    ],
    faqs: [
      {
        q: "We don't have 'big data' — is ML still useful?",
        a: "Often yes. Even a few thousand records — invoices, service tickets, sales history — can power forecasting or document automation. The audit tells you honestly if the data is ready or not.",
      },
      {
        q: "Where does our data stay?",
        a: "Wherever you choose — your own cloud, on-premise servers or our managed infrastructure. NDAs and data-handling agreements are standard for every engagement.",
      },
      {
        q: "What if the model accuracy isn't good enough?",
        a: "We run a fixed-scope proof-of-value first: if the agreed accuracy target isn't met on your real data, you don't pay for the full build — you keep the audit findings either way.",
      },
    ],
  },
  "ai-robotics": {
    overview:
      "Repetitive work is where teams lose their day — and where AI is at its best. We build conversational assistants, process automation (RPA) and vision-based quality checks that remove the boring work from your team's schedule. Practical, measured deployments — not sci-fi demos that never reach production.",
    deliverables: [
      "Automation audit: which tasks are worth automating first",
      "Conversational AI assistant — website, WhatsApp or internal desk",
      "RPA flows for data entry, reporting and back-office processes",
      "Vision-based quality checks with camera + model integration",
      "Robotics / hardware integration where the floor demands it",
      "Accuracy reports, guardrails and staff handover training",
    ],
    techs: ["Python", "OpenCV", "LLM APIs", "RPA tools", "ESP32", "TensorFlow", "FastAPI", "WhatsApp Business API"],
    facts: [
      { k: "Timeline", v: "3–10 weeks per workflow", icon: "bi-clock-history" },
      { k: "Engagement", v: "One workflow at a time", icon: "bi-diagram-3" },
      { k: "Support", v: "Tuning & retraining included", icon: "bi-headset" },
    ],
    faqs: [
      {
        q: "Will AI replace our staff?",
        a: "In practice it replaces tasks, not people — your team stops copy-pasting and starts on work that needs judgement. Every deployment includes staff training so the tool lands well.",
      },
      {
        q: "How accurate are vision quality checks?",
        a: "Typically 95%+ on well-lit, fixed-camera setups after tuning. We run a paid pilot on your real samples first and show measured accuracy before you commit to a full line.",
      },
      {
        q: "Can the chatbot speak Tamil?",
        a: "Yes — assistants handle Tamil and English (Tanglish included), and hand over to a human on WhatsApp when the question needs one.",
      },
    ],
  },
  "ui-ux": {
    overview:
      "Users judge your product in seconds — design decides whether they stay. We do research-driven interface design and build design systems that make products intuitive, accessible and beautiful. Wireframes to clickable prototypes to pixel-perfect handoff — with your users, not our taste, as the judge.",
    deliverables: [
      "User research: interviews, personas and journey mapping",
      "Information architecture and low-fi wireframes",
      "High-fidelity UI design with 2 structured revision rounds",
      "Clickable Figma prototype for stakeholder sign-off",
      "Design system — components, tokens, iconography, guidelines",
      "Usability testing report and developer handoff specs",
    ],
    techs: ["Figma", "FigJam", "Maze / usability kits", "Adobe CC", "Design tokens", "WCAG 2.1", "Prototyping", "Zeplin"],
    facts: [
      { k: "Timeline", v: "2–8 weeks by scope", icon: "bi-clock-history" },
      { k: "Engagement", v: "Per project or on retainer", icon: "bi-diagram-3" },
      { k: "Support", v: "Dev handoff support included", icon: "bi-headset" },
    ],
    faqs: [
      {
        q: "Can you redesign just a few screens?",
        a: "Yes — targeted redesigns are welcome. We audit the current screens, fix the friction points and deliver updated designs that slot into your existing product.",
      },
      {
        q: "Do you hand over Figma source files?",
        a: "Always — full source files, organised layers, component library and a developer handoff spec are yours at project end.",
      },
      {
        q: "Do you also build what you design?",
        a: "Yes — most clients take design + development together so nothing is lost in translation. Design-only engagements are equally fine.",
      },
    ],
  },
  "software-testing": {
    overview:
      "A bug that reaches your customer costs ten times more than one caught in testing. Our manual and automated QA catches issues before your users do — functional, API and performance testing with clear, reproducible bug reports. Ship releases with evidence, not hope.",
    deliverables: [
      "Test strategy and detailed test cases for every feature",
      "Manual functional testing across devices and browsers",
      "API testing with Postman collections and automated suites",
      "Performance / load testing with bottleneck reports",
      "Regression suite you can re-run before every release",
      "CI/CD quality gates so broken builds never ship",
    ],
    techs: ["Selenium", "Playwright", "Postman", "JMeter", "BrowserStack", "Jira / Trello", "Git & CI/CD", "Chrome DevTools"],
    facts: [
      { k: "Timeline", v: "Per release cycle", icon: "bi-clock-history" },
      { k: "Engagement", v: "Per release or monthly QA", icon: "bi-diagram-3" },
      { k: "Support", v: "Release sign-off reports", icon: "bi-headset" },
    ],
    faqs: [
      {
        q: "Can you test our existing app?",
        a: "Yes — we start with a one-cycle health check: functional, cross-device and API testing with a prioritised bug list. You keep the report even if you don't continue.",
      },
      {
        q: "Manual or automation — what do we need?",
        a: "New or fast-changing features need manual exploratory testing first; stable, repetitive flows are worth automating. We advise the mix that pays back, not the biggest invoice.",
      },
      {
        q: "How do you report bugs?",
        a: "Every bug comes with steps to reproduce, screenshots/video, severity and the environment — logged in your tracker, with a daily summary during test cycles.",
      },
    ],
  },
  cloud: {
    overview:
      "Cloud bills grow quietly and outages get expensive loudly. We architect, migrate and run your workloads on AWS, Azure and GCP — resilient, observable and cost-aware. Whether it's your first server or a messy legacy setup, we bring order: infrastructure as code, CI/CD pipelines and 24/7 monitoring.",
    deliverables: [
      "Cloud readiness assessment and architecture blueprint",
      "AWS / Azure / GCP setup — accounts, networking, security baseline",
      "Migration of apps, databases and files with zero-downtime cutover",
      "CI/CD pipelines — automated build, test and deploy",
      "Cost review with rightsizing and monthly optimisation report",
      "24/7 monitoring, alerting and incident response runbooks",
    ],
    techs: ["AWS", "Azure", "Google Cloud", "Docker", "Kubernetes", "Terraform", "GitHub Actions", "Grafana / Prometheus"],
    facts: [
      { k: "Timeline", v: "2–8 weeks per migration", icon: "bi-clock-history" },
      { k: "Engagement", v: "Project or managed monthly", icon: "bi-diagram-3" },
      { k: "Support", v: "24/7 monitoring & on-call", icon: "bi-headset" },
    ],
    faqs: [
      {
        q: "Our cloud bill keeps growing — can you help?",
        a: "That's one of our most common calls. A cost review typically finds 20–40% savings in rightsizing, storage tiers and idle resources — with a report you can action even without us.",
      },
      {
        q: "Can you migrate without downtime?",
        a: "Yes — we stage the new environment, replicate data, then cut over in a low-traffic window with a tested rollback plan. Downtime is minutes, not days.",
      },
      {
        q: "Do we stay locked in with one provider?",
        a: "No — we use open formats, infrastructure-as-code and standard tooling so you can move or run multi-cloud if you ever choose to.",
      },
    ],
  },
  "data-entry": {
    overview:
      "Data work fails on accuracy and discipline, not typing speed. Our trained operators handle high-volume, high-accuracy data operations with multi-level QC and strict confidentiality — online, offline and document digitisation. You get daily accuracy and TAT reporting, so quality is measured, not assumed.",
    deliverables: [
      "Dedicated trained operators with backup staff for every seat",
      "Online & offline data entry into CRM / ERP / spreadsheets",
      "Document digitisation — scanning, indexing and file naming",
      "Database creation, cleansing and maintenance",
      "Multi-level QC: operator → checker → supervisor",
      "Daily accuracy % and turnaround-time (TAT) reports",
    ],
    techs: ["MS Excel / Word", "Google Sheets", "CRM / ERP systems", "OCR tooling", "Custom QC scripts", "Secure FTP", "Data validation rules", "Scanning & DMS"],
    facts: [
      { k: "Timeline", v: "Team live in 1–2 weeks", icon: "bi-clock-history" },
      { k: "Engagement", v: "Per record, seat or project", icon: "bi-diagram-3" },
      { k: "Support", v: "Supervisor + daily reporting", icon: "bi-headset" },
    ],
    faqs: [
      {
        q: "How accurate is the work?",
        a: "We commit to 99%+ accuracy with multi-level QC — and prove it with daily accuracy reports rather than claims. A pilot batch lets you verify before you scale.",
      },
      {
        q: "How do you protect our data?",
        a: "NDAs, restricted-floor access, no-phone policy on the ops floor and secure transfer channels — the same discipline our BPO clients audit us on every year.",
      },
      {
        q: "Can you scale up quickly for seasonal work?",
        a: "Yes — seat-based engagement scales from a few operators to a full team within days, and scales back down when the season ends.",
      },
    ],
  },
  "voice-process": {
    overview:
      "Every call is your brand speaking — we make sure it says the right thing. Professional call-center teams handle inbound support, outbound sales and customer success in Tamil and English, coached continuously and measured on CSAT. You get call analytics and QA audits, so quality never drifts.",
    deliverables: [
      "Trained voice team with dedicated supervisor and QA auditor",
      "Inbound customer support and helpdesk handling",
      "Outbound calling — telesales, surveys, renewals and follow-ups",
      "Multilingual agents — Tamil, English, Hindi on request",
      "Call recordings, QA audits and CSAT scorecards",
      "Daily MIS reports — volumes, dispositions, quality trends",
    ],
    techs: ["Cloud telephony / dialer", "CRM software", "Call QA tools", "IVR design", "Headsets & VoIP", "MIS reporting", "WhatsApp support", "CSAT surveys"],
    facts: [
      { k: "Timeline", v: "Team live in 2–3 weeks", icon: "bi-clock-history" },
      { k: "Engagement", v: "Per seat / per minute", icon: "bi-diagram-3" },
      { k: "Support", v: "QA coaching continuous", icon: "bi-headset" },
    ],
    faqs: [
      {
        q: "Can agents handle Tamil and English?",
        a: "Yes — that's our home ground. Tamil and English are standard; Hindi and other languages can be added for specific campaigns.",
      },
      {
        q: "How fast can a team start?",
        a: "Typically 2–3 weeks: recruitment, paid voice & accent training, CRM setup and a shadow period on live calls — then the team goes full volume.",
      },
      {
        q: "How do you keep quality consistent?",
        a: "Every agent gets weekly QA scorecards from recorded call audits, plus coaching sessions. You see the same scorecards we do — monthly and on request weekly.",
      },
    ],
  },
};
