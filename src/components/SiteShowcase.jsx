import { Link } from "react-router-dom";
import { PATH_DIVISIONS_TOP, PATH_DIVISIONS_BOTTOM } from "../data/sites.js";

/*
 * "FIND YOUR PATH" Showcase Section
 * 5 Core TCT Group Divisions:
 * - Row 1 (Top 3 boxes): TCT Fashion Hub, TCT Traders, TCT Overseas
 * - Row 2 (Bottom 2 boxes): TCT Education, TCT Consign Solution
 */
function DivisionCard({ item }) {
  return (
    <Link
      to={item.path}
      className="fyp-card"
      style={{ "--fyp-accent": item.accent }}
      aria-label={`${item.company} - ${item.title}`}
    >
      {/* Logo on top of card */}
      <div className="fyp-card-logo-box">
        <img
          src="/tct-logo-tight.png"
          alt="TCT Logo"
          className="fyp-card-logo-img"
          loading="lazy"
        />
      </div>

      {/* Company Name */}
      <span className="fyp-card-company-name">{item.company}</span>

      {/* Gold / Accent separator line */}
      <div className="fyp-card-separator"></div>

      {/* Division icon and name */}
      <div className="fyp-card-title-row">
        <div className="fyp-card-icon-circle">
          <i className={`bi ${item.icon}`}></i>
        </div>
        <strong className="fyp-card-title-text">{item.title}</strong>
      </div>

      {/* Sub-tagline */}
      <span className="fyp-card-tagline-text">{item.tagline}</span>

      {/* Hover arrow indicator */}
      <div className="fyp-card-arrow-pill">
        <span>Explore</span>
        <i className="bi bi-arrow-right"></i>
      </div>
    </Link>
  );
}

export default function SiteShowcase({ variant = "hero" }) {
  const isHero = variant === "hero";

  return (
    <div className={`fyp-showcase ${isHero ? "fyp-hero-theme" : "fyp-page-theme"}`}>
      {/* Top Header: TCT Logo + Brand Title + ★ FIND YOUR PATH ★ */}
      <div className="fyp-header-block">
        <div className="fyp-top-logo-wrap">
          <img
            src="/tct-logo-white-text.png"
            alt="Trend Code Technology"
            className="fyp-top-logo"
            loading="lazy"
          />
        </div>
        <h2 className="fyp-brand-heading">TREND CODE TECHNOLOGY</h2>
        <div className="fyp-star-banner">
          <span className="fyp-banner-line"></span>
          <span className="fyp-banner-text">★ FIND YOUR PATH ★</span>
          <span className="fyp-banner-line"></span>
        </div>
      </div>

      {/* 5 Core Division Cards (3 on top, 2 on bottom) */}
      <div className="fyp-cards-container">
        {/* Top Row: 3 Boxes */}
        <div className="fyp-cards-row fyp-cards-row-top">
          {PATH_DIVISIONS_TOP.map((item) => (
            <DivisionCard key={item.key} item={item} />
          ))}
        </div>

        {/* Bottom Row: 2 Boxes (Centered) */}
        <div className="fyp-cards-row fyp-cards-row-bottom">
          {PATH_DIVISIONS_BOTTOM.map((item) => (
            <DivisionCard key={item.key} item={item} />
          ))}
        </div>
      </div>

      {/* Subtle core divisions pill row */}
      <div className="fyp-extra-ventures">
        <span className="fyp-extra-label">Also explore TCT core divisions:</span>
        <div className="fyp-extra-links">
          <Link to="/services" className="fyp-extra-chip">
            <i className="bi bi-laptop me-1 text-primary"></i> IT Services
          </Link>
          <Link to="/bpo" className="fyp-extra-chip">
            <i className="bi bi-headset me-1 text-success"></i> BPO Operations
          </Link>
          <Link to="/tourism" className="fyp-extra-chip">
            <i className="bi bi-compass me-1 text-info"></i> TCT Tourism
          </Link>
        </div>
      </div>
    </div>
  );
}
