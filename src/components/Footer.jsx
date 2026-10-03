import { Link } from "react-router-dom";
import { COMPANY } from "../data/content.js";

const QUICK_LINKS = [
  { label: "Home", to: "/" },
  { label: "About Us", to: "/about" },
  { label: "Services", to: "/services" },
  { label: "HR Services", to: "/hr-services" },
  { label: "BPO", to: "/bpo" },
  { label: "Careers", to: "/careers" },
  { label: "Internship", to: "/internship" },
  { label: "Contact Us", to: "/contact" },
];

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-main">
        <div className="footer-about">
          <span className="logo-art">
            <img src="/tct-logo.png" alt="Trend Code Technology logo" className="brand-img" />
          </span>
          <h3>Trend Code Technology</h3>
          <p className="tag">We Build Your Future · Software · Digital · BPO</p>
          <p>
            Trend Code Technology is a new media design company providing
            highly scalable conceptual and functional solutions to companies
            since {COMPANY.founded}.
          </p>
        </div>

        <div className="footer-col">
          <h4>Quick Links</h4>
          <ul className="footer-links">
            {QUICK_LINKS.map((l) => (
              <li key={l.label}>
                <Link to={l.to}>
                  <i className="bi bi-arrow-right"></i> {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="footer-col">
          <h4>Get In Touch</h4>
          <ul className="footer-contact">
            <li>
              <i className="bi bi-geo-alt"></i>
              <span>{COMPANY.address}</span>
            </li>
            <li>
              <i className="bi bi-envelope-open"></i>
              <span>{COMPANY.email}</span>
            </li>
            <li>
              <i className="bi bi-telephone"></i>
              <span>
                <a href={`tel:${COMPANY.phoneRaw}`}>{COMPANY.phone}</a>
              </span>
            </li>
          </ul>
          <div className="footer-social">
            {COMPANY.socials.map((s) => (
              <a key={s.label} href={s.url} target="_blank" rel="noopener noreferrer" aria-label={s.label} title={s.label}>
                <i className={`bi ${s.icon}`}></i>
              </a>
            ))}
          </div>
        </div>

        <div className="footer-col footer-map-col">
          <h4>Find Us</h4>
          <div className="footer-map-frame">
            <iframe
              title="Trend Code Technology location"
              src={COMPANY.mapEmbed}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="container inner">
          <span>
            © {new Date().getFullYear()}{" "}
            <Link to="/">trendcodetechnology.com</Link>. All Rights Reserved.
          </span>
          <span>
            Designed &amp; Engineered by Trend Code Technology
          </span>
        </div>
      </div>
    </footer>
  );
}
