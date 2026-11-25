// Trust & Accreditation vector logos and Certificate showcase components for Trend Code Technology
export function IsoLogo({ className = "", style = {} }) {
  return (
    <svg
      viewBox="0 0 160 54"
      className={className}
      style={{ display: "inline-block", verticalAlign: "middle", ...style }}
      aria-label="ISO 9001:2015 Certified"
    >
      <defs>
        <linearGradient id="isoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0284c7" />
          <stop offset="100%" stopColor="#0369a1" />
        </linearGradient>
      </defs>
      {/* Globe / Badge icon */}
      <g transform="translate(4, 3)">
        <circle cx="24" cy="24" r="22" fill="url(#isoGrad)" />
        <circle cx="24" cy="24" r="20" fill="none" stroke="#ffffff" strokeWidth="1.2" strokeDasharray="2 1.5" opacity="0.8" />
        {/* Globe meridians */}
        <ellipse cx="24" cy="24" rx="14" ry="20" fill="none" stroke="#ffffff" strokeWidth="1.2" opacity="0.6" />
        <ellipse cx="24" cy="24" rx="7" ry="20" fill="none" stroke="#ffffff" strokeWidth="1.2" opacity="0.6" />
        <line x1="4" y1="24" x2="44" y2="24" stroke="#ffffff" strokeWidth="1.2" opacity="0.6" />
        <line x1="7" y1="15" x2="41" y2="15" stroke="#ffffff" strokeWidth="1" opacity="0.4" />
        <line x1="7" y1="33" x2="41" y2="33" stroke="#ffffff" strokeWidth="1" opacity="0.4" />
        {/* Check shield */}
        <circle cx="34" cy="34" r="8" fill="#10b981" stroke="#ffffff" strokeWidth="1.5" />
        <path d="M31 34 l2 2 l4 -4" fill="none" stroke="#ffffff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </g>
      {/* Typography */}
      <text x="56" y="24" fill="currentColor" fontFamily="system-ui, -apple-system, sans-serif" fontSize="18" fontWeight="800" letterSpacing="0.8">
        ISO
      </text>
      <text x="56" y="38" fill="var(--color-primary, #0284c7)" fontFamily="system-ui, -apple-system, sans-serif" fontSize="11" fontWeight="700" letterSpacing="0.5">
        9001:2015
      </text>
      <text x="56" y="48" fill="currentColor" opacity="0.75" fontFamily="system-ui, -apple-system, sans-serif" fontSize="7.5" fontWeight="600" letterSpacing="0.5">
        CERTIFIED COMPANY
      </text>
    </svg>
  );
}

export function NptelLogo({ className = "", style = {} }) {
  return (
    <svg
      viewBox="0 0 140 50"
      className={className}
      style={{ display: "inline-block", verticalAlign: "middle", ...style }}
      aria-label="NPTEL Aligned Curriculum"
    >
      <g transform="translate(6, 6)">
        {/* NPTEL Sunburst wheel */}
        <circle cx="18" cy="18" r="16" fill="#881337" opacity="0.08" />
        <circle cx="18" cy="18" r="14" fill="#be123c" />
        {/* Wheel spokes / sun */}
        <g stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round">
          <line x1="18" y1="6" x2="18" y2="30" />
          <line x1="6" y1="18" x2="30" y2="18" />
          <line x1="9.5" y1="9.5" x2="26.5" y2="26.5" />
          <line x1="9.5" y1="26.5" x2="26.5" y2="9.5" />
        </g>
        <circle cx="18" cy="18" r="5" fill="#facc15" stroke="#ffffff" strokeWidth="1" />
      </g>
      <text x="48" y="24" fill="#be123c" fontFamily="system-ui, -apple-system, sans-serif" fontSize="16" fontWeight="900" letterSpacing="1">
        NPTEL
      </text>
      <text x="48" y="38" fill="currentColor" opacity="0.8" fontFamily="system-ui, -apple-system, sans-serif" fontSize="8" fontWeight="600" letterSpacing="0.4">
        ALIGNED CURRICULUM
      </text>
    </svg>
  );
}

export function StartupIndiaLogo({ className = "", style = {} }) {
  return (
    <svg
      viewBox="0 0 155 50"
      className={className}
      style={{ display: "inline-block", verticalAlign: "middle", ...style }}
      aria-label="Startup India Recognized"
    >
      <text x="4" y="27" fill="#f97316" fontFamily="system-ui, -apple-system, sans-serif" fontSize="18" fontWeight="900">
        #
      </text>
      <text x="18" y="27" fill="#f97316" fontFamily="system-ui, -apple-system, sans-serif" fontSize="18" fontWeight="800" letterSpacing="0.2">
        startup
      </text>
      <text x="88" y="27" fill="#16a34a" fontFamily="system-ui, -apple-system, sans-serif" fontSize="18" fontWeight="800" letterSpacing="0.2">
        india
      </text>
      {/* India flag inspired accent curve */}
      <path d="M18 36 Q 60 41 142 36" fill="none" stroke="#f97316" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M50 39 Q 90 44 142 39" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" />
      <text x="18" y="47" fill="currentColor" opacity="0.75" fontFamily="system-ui, -apple-system, sans-serif" fontSize="7" fontWeight="600" letterSpacing="0.4">
        DPIIT GOVT. OF INDIA
      </text>
    </svg>
  );
}

export function MetaLogo({ className = "", style = {} }) {
  return (
    <svg
      viewBox="0 0 130 50"
      className={className}
      style={{ display: "inline-block", verticalAlign: "middle", ...style }}
      aria-label="Meta Tech Partner Ecosystem"
    >
      <defs>
        <linearGradient id="metaGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#0064e0" />
          <stop offset="50%" stopColor="#0082fb" />
          <stop offset="100%" stopColor="#0064e0" />
        </linearGradient>
      </defs>
      {/* Meta Infinity loop */}
      <path
        d="M26 15 C19 15 13 20 13 26 C13 32 19 37 26 37 C31 37 36 33 40 27 C44 33 49 37 54 37 C61 37 67 32 67 26 C67 20 61 15 54 15 C49 15 44 19 40 25 C36 19 31 15 26 15 Z M26 21 C29 21 32 23 35 27 C32 31 29 33 26 33 C22 33 18 30 18 26 C18 22 22 21 26 21 Z M54 21 C58 21 62 22 62 26 C62 30 58 33 54 33 C51 33 48 31 45 27 C48 23 51 21 54 21 Z"
        fill="url(#metaGrad)"
      />
      <text x="74" y="30" fill="currentColor" fontFamily="system-ui, -apple-system, sans-serif" fontSize="17" fontWeight="700">
        Meta
      </text>
      <text x="74" y="42" fill="currentColor" opacity="0.75" fontFamily="system-ui, -apple-system, sans-serif" fontSize="7.5" fontWeight="600" letterSpacing="0.4">
        TECH PARTNER
      </text>
    </svg>
  );
}

export function MsmeLogo({ className = "", style = {} }) {
  return (
    <svg
      viewBox="0 0 140 50"
      className={className}
      style={{ display: "inline-block", verticalAlign: "middle", ...style }}
      aria-label="MSME Registered Enterprise"
    >
      <g transform="translate(6, 6)">
        {/* Emblem ring */}
        <circle cx="18" cy="18" r="16" fill="#1e3a8a" />
        <circle cx="18" cy="18" r="14" fill="none" stroke="#f59e0b" strokeWidth="1.5" />
        {/* Center cogwheel */}
        <circle cx="18" cy="18" r="7" fill="#ffffff" />
        <circle cx="18" cy="18" r="4" fill="#1e3a8a" />
        {/* Ashok chakra spokes */}
        <circle cx="18" cy="18" r="2" fill="#f59e0b" />
      </g>
      <text x="46" y="24" fill="#1e3a8a" fontFamily="system-ui, -apple-system, sans-serif" fontSize="16" fontWeight="900" letterSpacing="0.6">
        MSME
      </text>
      <text x="46" y="38" fill="currentColor" opacity="0.8" fontFamily="system-ui, -apple-system, sans-serif" fontSize="7.5" fontWeight="600" letterSpacing="0.4">
        GOVT. OF INDIA REG.
      </text>
    </svg>
  );
}

export function AicteCreditBadge({ className = "", style = {} }) {
  return (
    <div className={`trust-badge-pill ${className}`} style={{ ...style }}>
      <i className="bi bi-patch-check-fill" style={{ color: "#0284c7", fontSize: 18 }}></i>
      <div>
        <div style={{ fontWeight: 700, fontSize: 13, lineHeight: 1.2 }}>100% University Credit</div>
        <div style={{ fontSize: 11, opacity: 0.75 }}>Anna Univ • Bharathiar • Autonomous</div>
      </div>
    </div>
  );
}

// Full Trust Ribbon with interactive hover tooltips
export function InternshipTrustRibbon() {
  const BADGES = [
    {
      Component: IsoLogo,
      title: "ISO 9001:2015 Certified",
      desc: "Internationally validated Quality Management System for technical training & project delivery.",
      tag: "Quality Standard",
      color: "#0284c7",
    },
    {
      Component: StartupIndiaLogo,
      title: "DPIIT #StartupIndia",
      desc: "Recognized startup entity under Government of India Ministry of Commerce & Industry.",
      tag: "Govt. Recognized",
      color: "#f97316",
    },
    {
      Component: NptelLogo,
      title: "NPTEL Aligned Tracks",
      desc: "Course syllabus mapped to national elite technical benchmarks & IIT/IISc curricula.",
      tag: "Academic Benchmark",
      color: "#be123c",
    },
    {
      Component: MsmeLogo,
      title: "MSME Registered Enterprise",
      desc: "Official enterprise under Ministry of Micro, Small and Medium Enterprises, Govt. of India.",
      tag: "National Registry",
      color: "#1e3a8a",
    },
    {
      Component: MetaLogo,
      title: "Industry Partner Ecosystem",
      desc: "Full-Stack, React, Next.js, Cloud & AI stacks recognized by tech hiring partners.",
      tag: "Industry Standard",
      color: "#0064e0",
    },
  ];

  return (
    <section className="section internship-trust-section" style={{ paddingTop: 20, paddingBottom: 25 }}>
      <div className="container">
        <div className="trust-ribbon-card">
          <div className="trust-ribbon-head">
            <span className="badge-chip">
              <i className="bi bi-shield-fill-check me-1"></i> 100% Verified & Accredited
            </span>
            <h3 className="trust-ribbon-title">
              Credentials That Earn Academic & Recruiter Trust
            </h3>
            <p className="trust-ribbon-subtitle">
              Every internship at Trend Code Technology is backed by ISO 9001:2015 standards,
              Government of India registries, and verifiable digital certificates accepted across top IT employers and university boards.
            </p>
          </div>

          <div className="trust-logos-row">
            {BADGES.map((b, i) => {
              const Comp = b.Component;
              return (
                <div key={b.title} className="trust-logo-box" title={b.desc}>
                  <div className="trust-logo-visual">
                    <Comp style={{ height: 38, width: "auto" }} />
                  </div>
                  <div className="trust-logo-meta">
                    <span className="trust-logo-name">{b.title}</span>
                    <span className="trust-logo-tag" style={{ color: b.color }}>
                      <i className="bi bi-check-circle-fill me-1"></i> {b.tag}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="trust-stats-strip">
            <div className="trust-stat-item">
              <strong>1,200+</strong>
              <span>Students Certified</span>
            </div>
            <div className="trust-stat-divider"></div>
            <div className="trust-stat-item">
              <strong>45+</strong>
              <span>Colleges Accepted</span>
            </div>
            <div className="trust-stat-divider"></div>
            <div className="trust-stat-item">
              <strong>100%</strong>
              <span>Academic Credit Valid</span>
            </div>
            <div className="trust-stat-divider"></div>
            <div className="trust-stat-item">
              <strong>QR Code</strong>
              <span>Instant Online Verification</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// Certificate Showcase with realistic interactive certificate card
export function CertificateShowcase() {
  return (
    <section className="section certificate-showcase-section" style={{ paddingTop: 20, paddingBottom: 50 }}>
      <div className="container">
        <div className="cert-section-header">
          <span className="badge-chip">
            <i className="bi bi-patch-check-fill me-1"></i> Certificate of Excellence
          </span>
          <h2 className="section-title">
            What Your Official Certificate Includes
          </h2>
          <p className="section-subtitle">
            Recruiters, HR managers, and college faculties demand authentic, tamper-proof proof.
            Here is everything mentioned on your certificate that builds complete confidence:
          </p>
        </div>

        <div className="cert-showcase-grid">
          {/* Left features column */}
          <div className="cert-features-col">
            <div className="cert-feature-card">
              <div className="cert-feat-icon" style={{ background: "rgba(2, 132, 199, 0.12)", color: "#0284c7" }}>
                <i className="bi bi-shield-check"></i>
              </div>
              <div className="cert-feat-body">
                <h4>ISO 9001:2015 Certified Seal</h4>
                <p>
                  Printed with our official ISO 9001:2015 quality management badge and registration numbers,
                  proving your industrial training followed certified standards.
                </p>
              </div>
            </div>

            <div className="cert-feature-card">
              <div className="cert-feat-icon" style={{ background: "rgba(249, 115, 22, 0.12)", color: "#f97316" }}>
                <i className="bi bi-qr-code-scan"></i>
              </div>
              <div className="cert-feat-body">
                <h4>Tamper-Proof QR Code & Unique ID</h4>
                <p>
                  Every certificate features a unique alphanumeric serial (e.g. <code>TCT-INT-2026-8942</code>)
                  and scannable QR code linking to our live verification registry.
                </p>
              </div>
            </div>

            <div className="cert-feature-card">
              <div className="cert-feat-icon" style={{ background: "rgba(22, 163, 74, 0.12)", color: "#16a34a" }}>
                <i className="bi bi-buildings"></i>
              </div>
              <div className="cert-feat-body">
                <h4>Government Recognized Enterprise (Startup India & MSME)</h4>
                <p>
                  Includes official accreditation from DPIIT Startup India and Ministry of MSME,
                  ensuring nationwide recognition for college semester credits and viva-voce.
                </p>
              </div>
            </div>

            <div className="cert-feature-card">
              <div className="cert-feat-icon" style={{ background: "rgba(190, 18, 60, 0.12)", color: "#be123c" }}>
                <i className="bi bi-code-slash"></i>
              </div>
              <div className="cert-feat-body">
                <h4>Detailed Domain & Live Project Title</h4>
                <p>
                  Mentions your exact specialization (Full-Stack, AI, Python, UI/UX, BPO),
                  technologies used, and the real client project completed during your tenure.
                </p>
              </div>
            </div>

            <div className="cert-feature-card">
              <div className="cert-feat-icon" style={{ background: "rgba(139, 92, 246, 0.12)", color: "#8b5cf6" }}>
                <i className="bi bi-award"></i>
              </div>
              <div className="cert-feat-body">
                <h4>Letter of Recommendation (LOR) & Project Report</h4>
                <p>
                  Top performing interns receive an official Letter of Recommendation signed by our CEO
                  and Senior Technical Architects for higher studies and job applications.
                </p>
              </div>
            </div>
          </div>

          {/* Right: Realistic interactive Certificate Mockup */}
          <div className="cert-preview-col">
            <div className="cert-paper-card">
              <div className="cert-paper-inner">
                {/* Guilloché gold corners */}
                <div className="cert-corner tl"></div>
                <div className="cert-corner tr"></div>
                <div className="cert-corner bl"></div>
                <div className="cert-corner br"></div>

                {/* Header */}
                <div className="cert-paper-header">
                  <div className="cert-header-logos">
                    <img src="/tct-logo.png" alt="Trend Code Technology" className="cert-logo-img" />
                    <div className="cert-accred-tags">
                      <span className="cert-micro-badge iso">ISO 9001:2015</span>
                      <span className="cert-micro-badge msme">MSME GOVT. REG</span>
                      <span className="cert-micro-badge startup">#STARTUPINDIA</span>
                    </div>
                  </div>
                  <h3 className="cert-org-title">TREND CODE TECHNOLOGY</h3>
                  <p className="cert-org-sub">An ISO 9001:2015 Certified Software & Technical Solutions Enterprise</p>
                  <div className="cert-title-badge">CERTIFICATE OF INTERNSHIP & MERIT</div>
                </div>

                {/* Body */}
                <div className="cert-paper-body">
                  <p className="cert-prose">This is to certify that</p>
                  <h2 className="cert-student-name">ARAVIND KUMAR R</h2>
                  <p className="cert-college">from <strong>PSG College of Technology, Coimbatore</strong></p>
                  <p className="cert-desc">
                    has successfully completed a <strong>3-Month Industrial Internship</strong> in
                  </p>
                  <div className="cert-domain-highlight">
                    FULL-STACK WEB DEVELOPMENT & CLOUD AI
                  </div>
                  <p className="cert-tenure">
                    Duration: <strong>01 Jan 2026 to 31 Mar 2026</strong> • Grade: <strong>A+ (Distinction)</strong>
                  </p>
                  <p className="cert-project-note">
                    Project Undertaken: <em>"Enterprise Multi-Tenant Customer Portal with Real-Time Analytics"</em>
                  </p>
                </div>

                {/* Footer with Signatures, QR and Seal */}
                <div className="cert-paper-footer">
                  <div className="cert-sign-col">
                    <div className="cert-signature-line">
                      <span className="cert-sig-handwriting">S. Vignesh</span>
                    </div>
                    <strong>Technical Director</strong>
                    <span>Trend Code Technology</span>
                  </div>

                  <div className="cert-seal-col">
                    <div className="cert-golden-seal">
                      <div className="cert-seal-ring">
                        <i className="bi bi-patch-check-fill cert-seal-icon"></i>
                        <span>ISO 9001:2015</span>
                        <small>AUTHENTIC</small>
                      </div>
                    </div>
                    <div className="cert-id-tag">ID: TCT-INT-2026-8942</div>
                  </div>

                  <div className="cert-sign-col">
                    <div className="cert-qr-box">
                      <div className="cert-qr-code">
                        {/* Realistic SVG QR Code graphic */}
                        <svg viewBox="0 0 45 45" width="46" height="46">
                          <rect width="45" height="45" fill="#ffffff" />
                          {/* Corner markers */}
                          <rect x="3" y="3" width="13" height="13" fill="#000000" />
                          <rect x="5" y="5" width="9" height="9" fill="#ffffff" />
                          <rect x="7" y="7" width="5" height="5" fill="#000000" />

                          <rect x="29" y="3" width="13" height="13" fill="#000000" />
                          <rect x="31" y="5" width="9" height="9" fill="#ffffff" />
                          <rect x="33" y="7" width="5" height="5" fill="#000000" />

                          <rect x="3" y="29" width="13" height="13" fill="#000000" />
                          <rect x="5" y="31" width="9" height="9" fill="#ffffff" />
                          <rect x="7" y="33" width="5" height="5" fill="#000000" />

                          {/* Data points */}
                          <rect x="19" y="5" width="3" height="3" fill="#000000" />
                          <rect x="23" y="9" width="3" height="3" fill="#000000" />
                          <rect x="19" y="19" width="4" height="4" fill="#000000" />
                          <rect x="25" y="19" width="3" height="3" fill="#000000" />
                          <rect x="33" y="21" width="3" height="3" fill="#000000" />
                          <rect x="19" y="29" width="3" height="3" fill="#000000" />
                          <rect x="25" y="33" width="4" height="4" fill="#000000" />
                          <rect x="33" y="33" width="3" height="3" fill="#000000" />
                          <rect x="37" y="37" width="4" height="4" fill="#000000" />
                        </svg>
                      </div>
                      <span className="cert-qr-label">Scan to Verify</span>
                    </div>
                    <div className="cert-signature-line" style={{ marginTop: 6 }}>
                      <span className="cert-sig-handwriting ceo">Pratheep K.</span>
                    </div>
                    <strong>Managing Director & CEO</strong>
                    <span>Trend Code Technology</span>
                  </div>
                </div>

                {/* Bottom trust line */}
                <div className="cert-bottom-bar">
                  <span>Registered Office: Ganapathy, Coimbatore, Tamil Nadu 641006</span>
                  <span>•</span>
                  <span>Verify online: trendcodetechnology.com/verify</span>
                </div>
              </div>
            </div>
            <div className="cert-preview-caption">
              <i className="bi bi-info-circle me-1"></i> Preview of official physical & verifiable digital certificate issued upon successful completion.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
