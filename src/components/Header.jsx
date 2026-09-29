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
                <i className={`bi ${s.icon}`}></i>
              </a>
            ))}
          </div>
        </div>
      </div>

      <header className={`site-header ${scrolled ? "scrolled" : ""}`}>
        <div className="container nav-inner">
          <Link to="/" className="brand">
            <img src="/tct-logo.jpeg" alt="Trend Code Technology logo" className="brand-img" />
            <span className="brand-text">
              Trend Code Technology
              <small>Software · Digital · BPO</small>
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
              <span className="brand-mark">TC</span>
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
