import { useEffect, useState } from "react";

const KEY = "tct-cookie-consent";

export default function CookieConsent() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem(KEY)) {
        const t = window.setTimeout(() => setOpen(true), 1200);
        return () => window.clearTimeout(t);
      }
    } catch {
      /* storage blocked — don't nag */
    }
  }, []);

  const decide = (value) => {
    try {
      localStorage.setItem(KEY, value);
    } catch {
      /* ignore */
    }
    setOpen(false);
  };

  if (!open) return null;

  return (
    <div className="cookie-banner" role="dialog" aria-label="Cookie consent">
      <div className="cookie-inner">
        <div className="cookie-ic">
          <i className="bi bi-cookie"></i>
        </div>
        <div className="cookie-text">
          <strong>We value your privacy</strong>
          <p>
            We use cookies to improve your browsing experience, analyze site
            traffic, and deliver personalized content.
          </p>
        </div>
        <div className="cookie-actions">
          <button className="btn cookie-decline" onClick={() => decide("declined")}>
            Decline
          </button>
          <button className="btn cookie-accept" onClick={() => decide("accepted")}>
            Accept All
          </button>
        </div>
      </div>
    </div>
  );
}
