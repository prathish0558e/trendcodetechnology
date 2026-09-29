import { useState } from "react";
import { Link } from "react-router-dom";
import { COMPANY } from "../data/content.js";

const QUICK_LINKS = [
  { label: "Home", to: "/" },
  { label: "About Us", to: "/about" },
  { label: "Services", to: "/services" },
  { label: "HR Services", to: "/hr-services" },
  { label: "BPO", to: "/bpo" },
  { label: "Careers", to: "/careers" },
  { label: "Contact Us", to: "/contact" },
];

const POPULAR_LINKS = [
  { label: "Web Development", to: "/services/web-development" },
  { label: "Software Development", to: "/services/software-development" },
  { label: "Digital Marketing", to: "/services/digital-marketing" },
  { label: "Data Entry", to: "/bpo/data-entry" },
  { label: "Voice Process", to: "/bpo/voice-process" },
  { label: "UI / UX Design", to: "/services/ui-ux" },
];

export default function Footer() {
  const [subscribed, setSubscribed] = useState(false);

  const onSubscribe = (e) => {
    e.preventDefault();
    setSubscribed(true);
  };

  return (
    <footer className="site-footer">
      <div className="container footer-main">
        <div className="footer-about">
          <img src="/tct-logo.jpeg" alt="Trend Code Technology logo" className="brand-img" />
          <h3>Trend Code Technology</h3>
          <p className="tag">Software · Digital · BPO · Talent</p>
          <p>
            Trend Code Technology is a new media design company providing
            highly scalable conceptual and functional solutions to companies
            since {COMPANY.founded}.
          </p>
          <form className="newsletter" onSubmit={onSubscribe}>
            <input
              type="email"
              required
              placeholder="Your Email"
              aria-label="Email for newsletter"
            />
            <button type="submit">
              {subscribed ? "Done ✓" : "Sign Up"}
            </button>
          </form>
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
              <span>{COMPANY.phone}</span>
            </li>
            <li>
              <i className="bi bi-telephone"></i>
              <span>
                <a href={`tel:${COMPANY.phoneRaw}`}>{COMPANY.phone}</a>
                {" · "}
                <a
                  href={`https://wa.me/${COMPANY.whatsapp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  WhatsApp
                </a>
              </span>
            </li>
          </ul>
          <div className="footer-social">
            {COMPANY.socials.map((s) => (
              <a key={s.label} href={s.url} target="_blank" rel="noopener noreferrer" aria-label={s.label}>
                <i className={`bi ${s.icon}`}></i>
              </a>
            ))}
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
            Designed &amp; engineered by Trend Code Technology
          </span>
        </div>
      </div>
    </footer>
  );
}
