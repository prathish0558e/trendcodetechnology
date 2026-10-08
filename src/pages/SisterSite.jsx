import { Link } from "react-router-dom";
import { PageHero, Reveal } from "../components/Reveal.jsx";
import SiteShowcase from "../components/SiteShowcase.jsx";
import { COMPANY } from "../data/content.js";
import { getSite, isExternalSite, siteHref } from "../data/sites.js";

/*
 * Launch page for a TCT sister site (TCT FashionHub / TCT Trader).
 *
 * It exists so the hero links never hit a 404 while the real site is being
 * built. When the domain is live, set `url` in src/data/sites.js and this page
 * keeps working as the internal landing spot until you decide to redirect it.
 */
export default function SisterSite({ siteKey }) {
  const site = getSite(siteKey);
  const external = isExternalSite(site);
  const href = siteHref(site);

  return (
    <>
      <PageHero eyebrow={site.eyebrow} title={site.name} text={site.tagline} crumb={site.name} />

      <section className="section">
        <div className="container">
          <Reveal>
            <div className="site-launch">
              <span className="launch-pill">
                <i className="bi bi-rocket-takeoff"></i> {site.status}
              </span>
              <h2>{site.headline}</h2>
              <p>{site.body}</p>

              <div className="grid-2 launch-grid">
                {site.highlights.map((item) => (
                  <div
                    className="launch-item"
                    key={item.title}
                    style={{ "--sc": site.accent, "--sc2": site.accent2 }}
                  >
                    <div className="li-icon">
                      <i className={`bi ${item.icon}`}></i>
                    </div>
                    <div>
                      <h3>{item.title}</h3>
                      <p>{item.text}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="launch-actions">
                {external ? (
                  <a
                    className="btn btn-primary btn-lg"
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Visit {site.name} <i className="bi bi-box-arrow-up-right"></i>
                  </a>
                ) : (
                  <Link className="btn btn-primary btn-lg" to="/contact">
                    Talk to our team <i className="bi bi-arrow-right"></i>
                  </Link>
                )}
                <a className="btn btn-outline btn-lg" href={`tel:${COMPANY.phoneRaw}`}>
                  <i className="bi bi-telephone"></i> {COMPANY.phone}
                </a>
              </div>

              <p className="launch-note">
                <i className="bi bi-info-circle"></i> {site.note}
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="section soft">
        <div className="container">
          <SiteShowcase variant="page" />
        </div>
      </section>
    </>
  );
}
