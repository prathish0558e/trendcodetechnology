import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { COMPANY, NAV } from "../data/content.js";

function isActive(pathname, item) {
  if (item.to === "/") return pathname === "/";
  if (item.children) {
    return (
      pathname === item.to ||
      item.children.some((c) => pathname.startsWith(c.to))
    );
  }
  return pathname.startsWith(item.to);
}

function DropCaret() {
  return <i className="bi bi-chevron-down" style={{ fontSize: 10 }}></i>;
}

function SocialMark({ label, fallback }) {
  const brand = label.toLowerCase();
  const svgProps = {
    className: "topbar-social-mark",
    viewBox: "0 0 24 24",
    "aria-hidden": true,
    focusable: "false",
  };

  if (brand.includes("instagram")) {
    return (
      <svg {...svgProps} fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4.2" />
        <circle cx="17.5" cy="6.7" r="1" fill="currentColor" stroke="none" />
      </svg>
    );
  }
  if (brand.startsWith("x ") || brand === "x" || brand.includes("twitter")) {
    return (
      <svg {...svgProps} viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.901 1.153h3.68l-8.04 9.19 9.46 12.504h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.153h7.594l5.243 6.932 6.064-6.932Zm-1.291 19.49h2.039L6.482 3.24H4.294l13.316 17.403Z" />
      </svg>
    );
  }
  if (brand.includes("youtube")) {
    return (
      <svg {...svgProps} fill="currentColor">
        <path d="M23.5 6.2a3 3 0 0 0-2.12-2.14C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.38.56A3 3 0 0 0 .5 6.2C0 8.07 0 12 0 12s0 3.93.5 5.8a3 3 0 0 0 2.12 2.14C4.5 20.5 12 20.5 12 20.5s7.5 0 9.38-.56a3 3 0 0 0 2.12-2.14C24 15.93 24 12 24 12s0-3.93-.5-5.8ZM9.55 15.67V8.33L15.82 12l-6.27 3.67Z" />
      </svg>
    );
  }
  if (brand.includes("facebook")) {
    return (
      <svg {...svgProps} fill="currentColor">
        <path d="M13.55 23v-9.93h3.33l.5-3.87h-3.83V6.73c0-1.12.31-1.88 1.92-1.88h2.05V1.39C17.17 1.15 16.1 1 14.84 1c-3.45 0-5.81 2.1-5.81 5.96V9.2H5.5v3.87h3.53V23h4.52Z" />
      </svg>
    );
  }
  if (brand.includes("whatsapp")) {
    return (
      <svg {...svgProps} fill="currentColor">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.173-1.289.173-1.413-.074-.124-.272-.198-.57-.347M12.05 21.785h-.005a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884M12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413A11.815 11.815 0 0 0 12.05 0Z" />
      </svg>
    );
  }
  return <i className={`bi ${fallback}`} aria-hidden="true" />;
}

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [openKey, setOpenKey] = useState(null);
  const { pathname } = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close drawer whenever the route changes
  useEffect(() => {
    setMenuOpen(false);
    setOpenKey(null);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  // Close the drawer with the Escape key
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e) => e.key === "Escape" && setMenuOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  return (
    <>
      {/* Topbar — same info and dark strip as the original site */}
      <div className="topbar">
        <div className="container topbar-inner">
          <div className="topbar-info">
            <span>
              <i className="bi bi-geo-alt"></i> {COMPANY.addressShort}
            </span>
            <a href={`tel:${COMPANY.phoneRaw}`}>
              <i className="bi bi-telephone"></i> {COMPANY.phone}
            </a>
            <a href={`mailto:${COMPANY.email}`}>
              <i className="bi bi-envelope-open"></i> {COMPANY.email}
            </a>
          </div>
          <div className="topbar-social">
            {COMPANY.socials.map((s) => (
              <a key={s.label} href={s.url} target="_blank" rel="noopener noreferrer" aria-label={s.label}>
                <SocialMark label={s.label} fallback={s.icon} />
              </a>
            ))}
          </div>
        </div>
      </div>

      <header className={`site-header ${scrolled ? "scrolled" : ""}`}>
        <div className="container nav-inner">
          <Link to="/" className="brand">
            <span className="logo-art">
              <img src="/tct-logo.png" alt="Trend Code Technology logo" className="brand-img" />
            </span>
            <span className="brand-text">
              Trend Code Technology
              <small>We Build Your Future</small>
            </span>
          </Link>

          <nav aria-label="Primary">
            <ul className="nav-links">
              {NAV.map((item) =>
                item.children ? (
                  <li
                    key={item.label}
                    className={`nav-item ${isActive(pathname, item) ? "active" : ""}`}
                  >
                    <Link to={item.to} className="nav-drop-btn">
                      {item.label} <DropCaret />
                    </Link>
                    <div className="nav-drop">
                      {item.children.map((c) => (
                        <NavLink key={c.to} to={c.to}>
                          {c.label}
                        </NavLink>
                      ))}
                    </div>
                  </li>
                ) : (
                  <li
                    key={item.label}
                    className={`nav-item ${isActive(pathname, item) ? "active" : ""}`}
                  >
                    <NavLink to={item.to}>{item.label}</NavLink>
                  </li>
                )
              )}
            </ul>
          </nav>

          <div className="nav-cta">
            <Link to="/login" className="login-link">
              <i className="bi bi-box-arrow-in-right"></i> Login
            </Link>
            <Link to="/contact" className="btn btn-primary">
              Get a Quote
            </Link>
          </div>

          <button
            className="hamburger"
            aria-label="Open menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(true)}
          >
            <i className="bi bi-list"></i>
          </button>
        </div>
      </header>

      {/* Mobile drawer */}
      <div className={`mobile-menu ${menuOpen ? "open" : ""}`}>
        <div className="scrim" onClick={() => setMenuOpen(false)}></div>
        <div className="mobile-panel">
          <div className="mobile-panel-head">
            <span className="brand">
              <span className="logo-art">
                <img
                  src="/tct-logo.png"
                  alt="Trend Code Technology logo"
                  className="brand-img"
                />
              </span>
              <span className="brand-text">Trend Code Technology</span>
            </span>
            <button
              className="mobile-close"
              aria-label="Close menu"
              onClick={() => setMenuOpen(false)}
            >
              <i className="bi bi-x-lg"></i>
            </button>
          </div>

          <ul className="mobile-nav">
            {NAV.map((item) =>
              item.children ? (
                <li key={item.label}>
                  <button
                    onClick={() =>
                      setOpenKey(openKey === item.label ? null : item.label)
                    }
                  >
                    {item.label}
                    <i
                      className={`bi ${
                        openKey === item.label
                          ? "bi-chevron-up"
                          : "bi-chevron-down"
                      }`}
                    ></i>
                  </button>
                  {openKey === item.label && (
                    <ul className="mobile-sub">
                      <li>
                        <Link to={item.to}>All {item.label}</Link>
                      </li>
                      {item.children.map((c) => (
                        <li key={c.to}>
                          <Link to={c.to}>{c.label}</Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ) : (
                <li key={item.label}>
                  <NavLink to={item.to}>{item.label}</NavLink>
                </li>
              )
            )}
          </ul>

          <Link to="/login" className="btn btn-outline btn-block">
            <i className="bi bi-box-arrow-in-right"></i> Login
          </Link>
          <Link to="/contact" className="btn btn-primary btn-block">
            Get a Free Quote
          </Link>
        </div>
      </div>
    </>
  );
}
