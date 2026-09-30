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
