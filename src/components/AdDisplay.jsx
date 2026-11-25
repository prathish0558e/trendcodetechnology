import { useEffect, useState, useRef } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import { getAds, trackAd } from "../api.js";

export default function AdDisplay() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [ads, setAds] = useState([]);
  const [activePopupAd, setActivePopupAd] = useState(null);
  const [activeFloatingAd, setActiveFloatingAd] = useState(null);
  const [activeTopbarAd, setActiveTopbarAd] = useState(null);
  const [minimizedFloatingAd, setMinimizedFloatingAd] = useState(null);

  const timersRef = useRef([]);

  const clearTimers = () => {
    timersRef.current.forEach((t) => clearTimeout(t));
    timersRef.current = [];
  };

  useEffect(() => {
    let alive = true;
    clearTimers();

    // Fetch active ads
    getAds()
      .then((list) => {
        if (!alive || !Array.isArray(list)) return;
        setAds(list);

        // Separate page-specific ads and global ads:
        // Prioritizes ads specifically created for the current page so every page
        // can have its own distinct, tailored advertisement!
        const exactPageAds = list.filter(
          (a) => a.active !== false && a.targetPage === pathname
        );
        const globalAds = list.filter(
          (a) => a.active !== false && (a.targetPage === "all" || !a.targetPage)
        );

        // 1) Find Popup Ad: prefer exact page, then fallback to global
        const popup =
          exactPageAds.find((a) => a.placement === "popup") ||
          globalAds.find((a) => a.placement === "popup");

        if (popup) {
          const dismissed = sessionStorage.getItem(`tct_ad_dismissed_${popup.id}`);
          if (!dismissed) {
            const delay = (popup.delaySeconds ?? 2) * 1000;
            const t = setTimeout(() => {
              if (alive) {
                setActivePopupAd(popup);
                trackAd(popup.id, "view");
              }
            }, delay);
            timersRef.current.push(t);
          }
        } else {
          setActivePopupAd(null);
        }

        // 2) Find Floating Ad: prefer exact page, then fallback to global
        const floating =
          exactPageAds.find((a) => a.placement === "floating") ||
          globalAds.find((a) => a.placement === "floating");

        if (floating) {
          const dismissed = sessionStorage.getItem(`tct_ad_dismissed_${floating.id}`);
          if (!dismissed) {
            const delay = (floating.delaySeconds ?? 1) * 1000;
            const t = setTimeout(() => {
              if (alive) {
                setActiveFloatingAd(floating);
                trackAd(floating.id, "view");
              }
            }, delay);
            timersRef.current.push(t);
          }
        } else {
          setActiveFloatingAd(null);
        }

        // 3) Find Topbar Ad: prefer exact page, then fallback to global
        const topbar =
          exactPageAds.find((a) => a.placement === "topbar") ||
          globalAds.find((a) => a.placement === "topbar");

        if (topbar) {
          const dismissed = sessionStorage.getItem(`tct_ad_dismissed_${topbar.id}`);
          if (!dismissed) {
            setActiveTopbarAd(topbar);
            trackAd(topbar.id, "view");
          }
        } else {
          setActiveTopbarAd(null);
        }
      })
      .catch(() => {
        /* ignore network issues on public ads */
      });

    return () => {
      alive = false;
      clearTimers();
    };
  }, [pathname]);

  // Dismiss helpers
  const dismissPopup = (ad) => {
    setActivePopupAd(null);
    if (ad) {
      sessionStorage.setItem(`tct_ad_dismissed_${ad.id}`, "1");
    }
  };

  const dismissFloating = (ad) => {
    setActiveFloatingAd(null);
    setMinimizedFloatingAd(ad);
    if (ad) {
      sessionStorage.setItem(`tct_ad_dismissed_${ad.id}`, "1");
    }
  };

  const dismissTopbar = (ad) => {
    setActiveTopbarAd(null);
    if (ad) {
      sessionStorage.setItem(`tct_ad_dismissed_${ad.id}`, "1");
    }
  };

  const handleCtaClick = (ad, link) => {
    trackAd(ad.id, "click");
    if (ad.placement === "popup") dismissPopup(ad);
    if (ad.placement === "floating") dismissFloating(ad);
    if (ad.placement === "topbar") dismissTopbar(ad);

    if (link.startsWith("http://") || link.startsWith("https://")) {
      window.open(link, "_blank", "noopener,noreferrer");
    } else {
      navigate(link);
    }
  };

  return (
    <>
      {/* 1. Top Announcement Bar */}
      {activeTopbarAd && (
        <div className="site-ad-topbar">
          <div className="container site-ad-topbar-inner">
            {activeTopbarAd.badge && (
              <span className="site-ad-topbar-badge">{activeTopbarAd.badge}</span>
            )}
            <span className="site-ad-topbar-text">
              <strong>{activeTopbarAd.title}</strong>
              {activeTopbarAd.subtitle && ` — ${activeTopbarAd.subtitle}`}
            </span>
            <div className="site-ad-topbar-actions">
              <button
                type="button"
                className="btn btn-primary btn-sm site-ad-topbar-btn"
                onClick={() => handleCtaClick(activeTopbarAd, activeTopbarAd.ctaLink || "/internship")}
              >
                {activeTopbarAd.ctaText || "Learn More"} <i className="bi bi-arrow-right"></i>
              </button>
              <button
                type="button"
                className="site-ad-topbar-close"
                onClick={() => dismissTopbar(activeTopbarAd)}
                aria-label="Close Announcement"
              >
                ×
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Floating Bottom-Right Promotion Card */}
      {activeFloatingAd && (
        <div className="site-ad-floating-card animate-slide-up">
          <button
            type="button"
            className="site-ad-floating-close"
            onClick={() => dismissFloating(activeFloatingAd)}
            aria-label="Close promotion"
          >
            ×
          </button>
          <div className="site-ad-floating-header">
            {activeFloatingAd.badge && (
              <span className="badge-chip orange">{activeFloatingAd.badge}</span>
            )}
            <span className="site-ad-trust-seal">
              <i className="bi bi-patch-check-fill me-1 text-primary"></i> ISO 9001:2015
            </span>
          </div>

          <div className="site-ad-floating-body">
            {activeFloatingAd.imageUrl && (
              <img
                src={activeFloatingAd.imageUrl}
                alt={activeFloatingAd.title}
                className="site-ad-floating-thumb"
              />
            )}
            <div>
              <h4 className="site-ad-floating-title">{activeFloatingAd.title}</h4>
              {activeFloatingAd.subtitle && (
                <p className="site-ad-floating-desc">{activeFloatingAd.subtitle}</p>
              )}
            </div>
          </div>

          <div className="site-ad-floating-foot">
            <button
              type="button"
              className="btn btn-primary btn-sm"
              style={{ width: "100%", justifyContent: "center" }}
              onClick={() => handleCtaClick(activeFloatingAd, activeFloatingAd.ctaLink || "/internship")}
            >
              {activeFloatingAd.ctaText || "Check It Out"} <i className="bi bi-arrow-right"></i>
            </button>
          </div>
        </div>
      )}

      {/* Minimized Floating Re-open Icon */}
      {!activeFloatingAd && minimizedFloatingAd && (
        <button
          type="button"
          className="site-ad-floating-minimized"
          onClick={() => {
            setActiveFloatingAd(minimizedFloatingAd);
            setMinimizedFloatingAd(null);
          }}
          title={minimizedFloatingAd.title}
          aria-label="Re-open promotion"
        >
          <i className="bi bi-gift-fill"></i>
          <span className="site-ad-minimized-pulse"></span>
        </button>
      )}

      {/* 3. Center Modal Popup */}
      {activePopupAd && (
        <div className="site-ad-modal-backdrop" onClick={() => dismissPopup(activePopupAd)}>
          <div
            className="site-ad-modal-card animate-pop-in"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="ad-popup-title"
          >
            <button
              type="button"
              className="site-ad-modal-close"
              onClick={() => dismissPopup(activePopupAd)}
              aria-label="Close Advertisement"
            >
              ×
            </button>

            {activePopupAd.imageUrl ? (
              <div className="site-ad-modal-hero-img">
                <img src={activePopupAd.imageUrl} alt={activePopupAd.title} />
              </div>
            ) : (
              <div className="site-ad-modal-hero-banner">
                <img src="/tct-logo.png" alt="Trend Code Technology" className="site-ad-modal-brand-logo" />
                <span className="site-ad-modal-watermark">ISO 9001:2015 CERTIFIED</span>
              </div>
            )}

            <div className="site-ad-modal-body">
              {activePopupAd.badge && (
                <span className="badge-chip blue mb-2">
                  <i className="bi bi-fire me-1"></i> {activePopupAd.badge}
                </span>
              )}

              <h3 id="ad-popup-title" className="site-ad-modal-title">
                {activePopupAd.title}
              </h3>

              {activePopupAd.subtitle && (
                <p className="site-ad-modal-desc">{activePopupAd.subtitle}</p>
              )}

              <div className="site-ad-modal-trust-pills">
                <div className="site-ad-pill">
                  <i className="bi bi-patch-check-fill text-primary me-1"></i>
                  ISO 9001:2015
                </div>
                <div className="site-ad-pill">
                  <i className="bi bi-buildings text-warning me-1"></i>
                  #StartupIndia & MSME
                </div>
                <div className="site-ad-pill">
                  <i className="bi bi-award-fill text-success me-1"></i>
                  100% University Credit
                </div>
              </div>

              <div className="site-ad-modal-actions">
                <button
                  type="button"
                  className="btn btn-primary btn-lg site-ad-cta-btn"
                  onClick={() => handleCtaClick(activePopupAd, activePopupAd.ctaLink || "/internship")}
                >
                  {activePopupAd.ctaText || "Explore Internships"} <i className="bi bi-arrow-right"></i>
                </button>

                <button
                  type="button"
                  className="btn btn-outline site-ad-dismiss-btn"
                  onClick={() => dismissPopup(activePopupAd)}
                >
                  {activePopupAd.secondaryText || "Close"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
