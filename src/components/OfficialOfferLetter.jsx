import React, { useRef } from "react";

export function OfficialOfferLetterPaper({
  candidateName = "YOUR NAME",
  salutation = "Mr./Ms.",
  role = "YOUR DOMAIN",
  company = "TREND CODE TECHNOLOGY",
  date = "06 Oct, 2026",
  startDate = "06 Oct, 2026",
  endDate = "",
  isOngoing = true,
  field = "your domain",
  showWatermark = true,
  isSample = false,
  className = "",
  style = {},
}) {
  const paperRef = useRef(null);

  // Normalize field text so it reads naturally: e.g. "your domain tasks"
  const cleanField = String(field || "your domain")
    .replace(/\s*tasks?$/i, "")
    .trim();

  return (
    <div
      ref={paperRef}
      className={`tct-official-offer-letter ${className}`}
      style={{
        background: "#ffffff",
        color: "#1e293b",
        borderRadius: "14px",
        boxShadow: "0 20px 50px rgba(0, 0, 0, 0.12), 0 2px 6px rgba(0, 0, 0, 0.06)",
        border: "1px solid #cbd5e1",
        position: "relative",
        overflow: "hidden",
        fontFamily: "'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, sans-serif",
        width: "100%",
        maxWidth: 720,
        margin: "0 auto",
        ...style,
      }}
    >
      {/* Central TCT Logo Watermark */}
      {showWatermark && (
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            opacity: 0.045,
            pointerEvents: "none",
            zIndex: 0,
            userSelect: "none",
          }}
        >
          <img
            src="/tct-logo.png"
            alt=""
            style={{ width: 290, height: 290, objectFit: "contain", filter: "grayscale(25%)" }}
          />
        </div>
      )}

      {/* Large Prominent Center "SAMPLE" Watermark Stamp */}
      {isSample && (
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%) rotate(-28deg)",
            fontSize: "clamp(3.8rem, 11vw, 6.6rem)",
            fontWeight: 900,
            letterSpacing: "clamp(8px, 2.5vw, 18px)",
            color: "rgba(220, 38, 38, 0.18)",
            textTransform: "uppercase",
            border: "4px dashed rgba(220, 38, 38, 0.24)",
            padding: "8px 36px",
            borderRadius: "14px",
            pointerEvents: "none",
            zIndex: 3,
            userSelect: "none",
            whiteSpace: "nowrap",
            boxShadow: "0 0 30px rgba(220, 38, 38, 0.06)",
          }}
        >
          SAMPLE
        </div>
      )}

      {/* Document Content */}
      <div
        style={{
          position: "relative",
          zIndex: 1,
          padding: "clamp(20px, 4vw, 36px) clamp(18px, 4.5vw, 40px) 0 clamp(18px, 4.5vw, 40px)",
        }}
      >
        {/* Header: Company Logo & Name (Left) + Full Office Address (Right) */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: 16,
            flexWrap: "wrap",
          }}
        >
          {/* Left: TCT Brand Logo & Title */}
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <img
              src="/tct-logo.png"
              alt="Trend Code Technology"
              style={{ height: 54, width: "auto", objectFit: "contain" }}
            />
            <div>
              <h2
                style={{
                  fontSize: "clamp(1.15rem, 2.2vw, 1.32rem)",
                  fontWeight: 900,
                  letterSpacing: "0.5px",
                  color: "#1e293b",
                  margin: 0,
                  lineHeight: 1.15,
                  textTransform: "uppercase",
                }}
              >
                TREND CODE
              </h2>
              <h2
                style={{
                  fontSize: "clamp(1.15rem, 2.2vw, 1.32rem)",
                  fontWeight: 900,
                  letterSpacing: "0.5px",
                  color: "#1e293b",
                  margin: 0,
                  lineHeight: 1.15,
                  textTransform: "uppercase",
                }}
              >
                TECHNOLOGY
              </h2>
            </div>
          </div>

          {/* Right: Registered Corporate Office Details */}
          <div
            style={{
              fontSize: "11px",
              lineHeight: 1.45,
              color: "#475569",
              textAlign: "right",
              fontWeight: 500,
            }}
          >
            <div>No.215, Second Floor, Sakthi Nagar</div>
            <div>Near ICICI Bank, Ganapathy,</div>
            <div>Coimbatore - 641006</div>
            <div style={{ fontWeight: 600, color: "#1e293b" }}>Mob: 9384847922</div>
            <div>Email: trendcodetechnology@gmail.com</div>
            <div style={{ fontWeight: 600, color: "#0284c7" }}>Web: https://tctechs.in/</div>
          </div>
        </div>

        {/* Divider line below header */}
        <div
          style={{
            height: "1.5px",
            background: "#cbd5e1",
            margin: "16px 0 22px 0",
            width: "100%",
          }}
        />

        {/* Document Main Heading */}
        <h1
          style={{
            fontSize: "clamp(1.15rem, 2.5vw, 1.38rem)",
            fontWeight: 800,
            letterSpacing: "1.5px",
            color: "#334155",
            textAlign: "center",
            margin: "0 0 14px 0",
            textTransform: "uppercase",
          }}
        >
          INTERNSHIP OFFER LETTER
        </h1>

        {/* Date on right */}
        <div style={{ textAlign: "right", marginBottom: 20 }}>
          <span
            style={{
              fontSize: "13.5px",
              fontWeight: 600,
              color: "#334155",
              textDecoration: "underline",
              textUnderlineOffset: "3px",
            }}
          >
            {date}
          </span>
        </div>

        {/* Salutation */}
        <div style={{ marginBottom: 18, fontSize: "14.5px", fontWeight: 700, color: "#1e293b" }}>
          Dear {salutation} {candidateName}
        </div>

        {/* Paragraph 1 */}
        <p
          style={{
            fontSize: "clamp(13px, 1.8vw, 14.5px)",
            lineHeight: 1.8,
            color: "#334155",
            textAlign: "justify",
            textIndent: "42px",
            marginBottom: 16,
          }}
        >
          We are pleased to confirm your position as a &ldquo;
          <strong
            style={{
              textDecoration: "underline",
              textUnderlineOffset: "3px",
              color: "#0f172a",
              letterSpacing: "0.2px",
            }}
          >
            {role.toUpperCase()}
          </strong>
          &rdquo; at &ldquo;
          <strong style={{ color: "#0f172a" }}>{company}</strong>
          &rdquo;, Your internship began on{" "}
          <span style={{ textDecoration: "underline", textUnderlineOffset: "3px", fontWeight: 600 }}>
            {startDate}
          </span>
          {endDate ? ` to ${endDate}` : ""}
          {isOngoing ? " and is currently ongoing." : "."}
        </p>

        {/* Paragraph 2 */}
        <p
          style={{
            fontSize: "clamp(13px, 1.8vw, 14.5px)",
            lineHeight: 1.8,
            color: "#334155",
            textAlign: "justify",
            marginBottom: 16,
          }}
        >
          During this internship, you are expected to contribute to {cleanField} tasks, assist in coding and debugging
          activities, and support project requirements as assigned. This internship is designed to enhance your
          technical skills and provide valuable hands-on industry experience
        </p>

        {/* Paragraph 3 */}
        <p
          style={{
            fontSize: "clamp(13px, 1.8vw, 14.5px)",
            lineHeight: 1.8,
            color: "#334155",
            textAlign: "justify",
            marginBottom: 28,
          }}
        >
          We appreciate your contribution so far and look forward to your continued dedication and learning.
        </p>

        {/* Signatures & Official Stamp Row */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            marginTop: 20,
            marginBottom: 22,
            paddingRight: 8,
            gap: 16,
            flexWrap: "wrap",
          }}
        >
          {/* Left: Managing Director Signature */}
          <div style={{ textAlign: "left" }}>
            <div style={{ height: 44, display: "flex", alignItems: "flex-end", marginBottom: 4 }}>
              <svg width="150" height="42" viewBox="0 0 150 42" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Executive signature 'D. Mohamed Riyaz' */}
                <path
                  d="M10 32C16 16 26 6 34 14C40 20 28 34 22 36C16 38 24 24 38 21C52 18 64 27 76 23C88 19 98 15 112 21C122 26 132 19 142 22"
                  stroke="#0f172a"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M24 24C44 21 84 18 136 22"
                  stroke="#0f172a"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <div style={{ fontSize: "14px", fontWeight: 700, color: "#1e293b" }}>
              Managing Director
            </div>
          </div>

          {/* Right: Authentic Circular Blue Rubber Stamp + Ceo & Founder */}
          <div style={{ textAlign: "center", position: "relative" }}>
            <div
              style={{
                width: 108,
                height: 108,
                margin: "0 auto",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {/* Circular Blue Rubber Seal */}
              <svg
                width="108"
                height="108"
                viewBox="0 0 120 120"
                style={{
                  transform: "rotate(-6deg)",
                  filter: "contrast(115%)",
                }}
              >
                {/* Outer dashed ring */}
                <circle cx="60" cy="60" r="56" fill="none" stroke="#1d4ed8" strokeWidth="2.2" strokeDasharray="5,2" />
                {/* Outer solid ring */}
                <circle cx="60" cy="60" r="51" fill="none" stroke="#1d4ed8" strokeWidth="1.5" />
                {/* Inner solid ring */}
                <circle cx="60" cy="60" r="35" fill="none" stroke="#1d4ed8" strokeWidth="1.6" />

                {/* Curved top text: TREND CODE TECHNOLOGY */}
                <path id="curveTopTct" d="M 18,60 A 42,42 0 1,1 102,60" fill="none" />
                <text fill="#1d4ed8" fontSize="8.2" fontWeight="800" letterSpacing="1.1">
                  <textPath href="#curveTopTct" startOffset="50%" textAnchor="middle">
                    ★ TREND CODE TECHNOLOGY ★
                  </textPath>
                </text>

                {/* Curved bottom text: CBE - 641006 */}
                <path id="curveBottomTct" d="M 102,60 A 42,42 0 0,1 18,60" fill="none" />
                <text fill="#1d4ed8" fontSize="7.8" fontWeight="700" letterSpacing="1">
                  <textPath href="#curveBottomTct" startOffset="50%" textAnchor="middle">
                    ★ CBE - 641006 ★
                  </textPath>
                </text>

                {/* Center TCT Monogram & Seal Label */}
                <text x="60" y="58" textAnchor="middle" fill="#1d4ed8" fontSize="16" fontWeight="900" letterSpacing="1">
                  TCT
                </text>
                <text x="60" y="70" textAnchor="middle" fill="#2563eb" fontSize="6.5" fontWeight="700">
                  OFFICIAL SEAL
                </text>
              </svg>
            </div>
            <div
              style={{
                fontSize: "14px",
                fontWeight: 700,
                color: "#1e3a8a",
                marginTop: 2,
              }}
            >
              Ceo &amp; Founder
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Letterhead Ribbon: Overlapping Golden Amber & Corporate Navy Swoosh Waves */}
      <div style={{ lineHeight: 0, marginTop: "auto", position: "relative" }}>
        <svg
          viewBox="0 0 720 90"
          preserveAspectRatio="none"
          style={{
            width: "100%",
            height: "clamp(55px, 7.5vw, 75px)",
            display: "block",
            borderBottomLeftRadius: "13px",
            borderBottomRightRadius: "13px",
          }}
        >
          {/* Warm Golden Amber Swoosh */}
          <path
            d="M 0,90 L 0,48 Q 200,10 420,50 Q 580,84 720,38 L 720,90 Z"
            fill="#f59e0b"
          />
          {/* Deep Navy Corporate Base Swoosh */}
          <path
            d="M 0,90 L 0,62 Q 210,26 430,62 Q 590,95 720,52 L 720,90 Z"
            fill="#0f172a"
          />
        </svg>
      </div>
    </div>
  );
}

export function InternshipOfferLetterShowcase() {
  return (
    <section className="section certificate-showcase-section" style={{ paddingTop: 20, paddingBottom: 60 }}>
      <div className="container">
        <div className="cert-section-header">
          <span className="badge-chip">
            <i className="bi bi-file-earmark-check-fill me-1"></i> Official Offer Letter Sample
          </span>
          <h2 className="section-title">
            Official Internship Offer Letter Sample
          </h2>
          <p className="section-subtitle">
            Every shortlisted candidate accepted into our industrial program receives an authorized, official offer letter on Trend Code Technology letterhead &mdash; recognized by college departments, autonomous universities, and HR recruiters across India.
          </p>
        </div>

        <div className="cert-showcase-grid">
          {/* Left features column */}
          <div className="cert-features-col">
            <div className="cert-feature-card">
              <div className="cert-feat-icon" style={{ background: "rgba(2, 132, 199, 0.12)", color: "#0284c7" }}>
                <i className="bi bi-buildings-fill"></i>
              </div>
              <div className="cert-feat-body">
                <h4>Registered Corporate Letterhead</h4>
                <p>
                  Printed with our registered office address in Ganapathy, Coimbatore, direct contact numbers, official company email, and official web address for instant verification.
                </p>
              </div>
            </div>

            <div className="cert-feature-card">
              <div className="cert-feat-icon" style={{ background: "rgba(249, 115, 22, 0.12)", color: "#f97316" }}>
                <i className="bi bi-person-workspace"></i>
              </div>
              <div className="cert-feat-body">
                <h4>Exact Role &amp; Project Responsibilities</h4>
                <p>
                  Specifies your confirmed designation and hands-on participation in live client deliverables and production code.
                </p>
              </div>
            </div>

            <div className="cert-feature-card">
              <div className="cert-feat-icon" style={{ background: "rgba(22, 163, 74, 0.12)", color: "#16a34a" }}>
                <i className="bi bi-calendar-check"></i>
              </div>
              <div className="cert-feat-body">
                <h4>Official Joining Date &amp; Active Standing</h4>
                <p>
                  Certifies your commencement date and active ongoing standing &mdash; accepted for college OD (On-Duty) approval, semester credits, and university viva-voce.
                </p>
              </div>
            </div>

            <div className="cert-feature-card">
              <div className="cert-feat-icon" style={{ background: "rgba(190, 18, 60, 0.12)", color: "#be123c" }}>
                <i className="bi bi-patch-check"></i>
              </div>
              <div className="cert-feat-body">
                <h4>Authorized Signature &amp; Official Seal</h4>
                <p>
                  Duly endorsed with the Managing Director&apos;s signature and the official circular blue rubber seal of Trend Code Technology (Ceo &amp; Founder).
                </p>
              </div>
            </div>

            <div className="cert-feature-card">
              <div className="cert-feat-icon" style={{ background: "rgba(139, 92, 246, 0.12)", color: "#8b5cf6" }}>
                <i className="bi bi-award-fill"></i>
              </div>
              <div className="cert-feat-body">
                <h4>Pre-Placement (PPO) &amp; LOR Eligibility</h4>
                <p>
                  High-performing interns qualify for direct full-time Pre-Placement Offers (PPO) and executive Letters of Recommendation for career advancement.
                </p>
              </div>
            </div>
          </div>

          {/* Right: Realistic interactive Offer Letter Mockup matching user photo */}
          <div className="cert-preview-col" style={{ width: "100%" }}>
            <div style={{ marginBottom: 12 }}>
              <span className="badge bg-primary-subtle text-primary fw-semibold px-2.5 py-1" style={{ fontSize: "12px" }}>
                <i className="bi bi-file-earmark-text me-1"></i> Official Letterhead Sample
              </span>
            </div>

            <OfficialOfferLetterPaper
              candidateName="YOUR NAME"
              salutation="Mr./Ms."
              role="YOUR DOMAIN"
              company="TREND CODE TECHNOLOGY"
              date="06 Oct, 2026"
              startDate="06 Oct, 2026"
              isOngoing={true}
              field="your domain"
              isSample={true}
            />

            <div className="cert-preview-caption" style={{ marginTop: 14 }}>
              <i className="bi bi-shield-check text-success me-1"></i> Sample official offer letter issued on Trend Code Technology registered corporate letterhead.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
