import { Link } from "react-router-dom";
import { Reveal, SectionHead, PageHero } from "../components/Reveal.jsx";
import TourEnquiryForm from "../components/TourEnquiryForm.jsx";
import {
  COMPANY,
  TOUR_FACTS,
  TOUR_INCLUDES,
  TOUR_INTERNATIONAL_INCLUDES,
  TOUR_LOCATIONS,
  TOUR_PACKAGES,
  TOUR_PROMISES,
} from "../data/content.js";
import TOUR_CREDITS from "../data/tourism-credits.json";

const inr = (n) => `₹${n.toLocaleString("en-IN")}`;

function waLink(pack) {
  const text = `Hi TCT, I'd like to book the "${pack.title}" package (${pack.days}D/${pack.nights}N, from ${inr(
    pack.rate
  )} per person). Please share the details.`;
  return `https://wa.me/${COMPANY.whatsapp}?text=${encodeURIComponent(text)}`;
}

function PackageCard({ p, i }) {
  return (
    <Reveal delay={(i % 3) * 80}>
      <article className="tour-card">
        <div className="tour-media">
          <img
            src={p.cover}
            alt={`${p.title} tour package`}
            width="1200"
            height="800"
            loading="lazy"
            decoding="async"
          />
          <span className="tour-nights">
            {p.days}D / {p.nights}N
          </span>
          {p.badge ? <span className="tour-badge">{p.badge}</span> : null}
        </div>

        <div className="tour-body">
          <h3>{p.title}</h3>
          <p className="tour-route">
            <i className="bi bi-signpost-split"></i> {p.route}
          </p>

          <ul className="tour-hl">
            {p.highlights.map((h) => (
              <li key={h}>
                <i className="bi bi-check2-circle"></i> {h}
              </li>
            ))}
          </ul>

          <div className="tour-foot">
            <div className="tour-rate">
              <span className="tour-rate-label">Starting from</span>
              <span className="tour-rate-now">
                {inr(p.rate)}
                <small>/ person</small>
              </span>
              {p.was ? <s className="tour-rate-was">{inr(p.was)}</s> : null}
            </div>
            <a
              className="btn btn-primary tour-book"
              href={waLink(p)}
              target="_blank"
              rel="noopener noreferrer"
            >
              Book Now <i className="bi bi-whatsapp"></i>
            </a>
          </div>
        </div>
      </article>
    </Reveal>
  );
}

function PackageGrid({ list }) {
  return (
    <div className="grid-3">
      {list.map((p, i) => (
        <PackageCard key={p.slug} p={p} i={i} />
      ))}
    </div>
  );
}

function LocationGrid({ list }) {
  return (
    <div className="grid-3 tour-grid">
      {list.map((l, i) => (
        <Reveal key={l.slug} delay={(i % 3) * 80}>
          <article className="tour-loc">
            <img
              src={l.photo}
              alt={`${l.name} (${l.full}), ${l.state}`}
              width="1200"
              height="1500"
              loading="lazy"
              decoding="async"
            />
            <div className="tour-loc-veil" aria-hidden="true"></div>
            <div className="tour-loc-body">
              <span className="tour-loc-state">{l.state}</span>
              <h3>{l.name}</h3>
              <p className="tour-loc-tag">{l.tagline}</p>
              <p className="tour-loc-text">{l.text}</p>
              <span className="tour-loc-when">
                <i className="bi bi-calendar3"></i> Best time: {l.best}
              </span>
            </div>
          </article>
        </Reveal>
      ))}
    </div>
  );
}

export default function Tourism() {
  const prefillPackage =
    typeof window !== "undefined"
      ? new URLSearchParams(window.location.search).get("package")
      : null;
  const india = TOUR_PACKAGES.filter((p) => p.region !== "international");
  const intl = TOUR_PACKAGES.filter((p) => p.region === "international");
  const indiaLocs = TOUR_LOCATIONS.filter(
    (l) => !["Bali", "Dubai", "Singapore", "Bangkok", "Phuket", "Maldives", "Halong Bay", "Sri Lanka", "Switzerland", "Santorini"].includes(l.name)
  );
  const intlLocs = TOUR_LOCATIONS.filter((l) =>
    ["Bali", "Dubai", "Singapore", "Bangkok", "Phuket", "Maldives", "Halong Bay", "Sri Lanka", "Switzerland", "Santorini"].includes(l.name)
  );

  return (
    <>
      <PageHero
        eyebrow="TCT Tourism"
        title="Holidays Crafted Around You"
        text="South India's best drives, Asia's best beaches, Europe's best rails — India and international packages with clear per-person rates, verified stays and a team that answers within 24 hours."
        crumb="Tourism"
      />

      {/* Quick facts strip — what every quote has in common */}
      <section className="section tour-facts-wrap">
        <div className="container">
          <div className="grid-4 tour-facts">
            {TOUR_FACTS.map((f, i) => (
              <Reveal key={f.k} delay={i * 60}>
                <div className="tour-fact">
                  <i className={`bi ${f.icon}`}></i>
                  <span className="k">{f.k}</span>
                  <strong>{f.v}</strong>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* India packages with rates */}
      <section className="section soft" id="packages">
        <div className="container">
          <SectionHead
            eyebrow="India Tour Packages & Rates"
            title="Pick a Package, See the Price Up Front"
            text="Rates below are starting prices per person on twin sharing, departing from Coimbatore. Every package includes the same baseline — no hidden extras."
          />
          <PackageGrid list={india} />

          <Reveal>
            <div className="tour-includes">
              <h3>
                <i className="bi bi-clipboard-check"></i> Every India package includes
              </h3>
              <ul className="checklist tour-includes-list">
                {TOUR_INCLUDES.map((inc) => (
                  <li key={inc}>
                    <i className="bi bi-check-circle-fill"></i> {inc}
                  </li>
                ))}
              </ul>
              <p className="tour-note">
                <i className="bi bi-info-circle"></i> Rates are indicative starting
                prices for the current season. Long weekends, Deepavali, Christmas
                and summer departures may be priced higher — we confirm the exact
                amount before you pay anything.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* International packages with rates */}
      <section className="section" id="international">
        <div className="container">
          <SectionHead
            eyebrow="International Packages & Rates"
            title="Fly Beyond — Bali, Dubai, Europe & More"
            text="Flight-inclusive starting rates per person on twin sharing, ex-Chennai or ex-Kochi. Visa guidance, transfers and sightseeing come standard."
          />
          <PackageGrid list={intl} />

          <Reveal>
            <div className="tour-includes tour-intl-includes">
              <h3>
                <i className="bi bi-airplane-engines"></i> Every international package includes
              </h3>
              <ul className="checklist tour-includes-list">
                {TOUR_INTERNATIONAL_INCLUDES.map((inc) => (
                  <li key={inc}>
                    <i className="bi bi-check-circle-fill"></i> {inc}
                  </li>
                ))}
              </ul>
              <p className="tour-note">
                <i className="bi bi-passport"></i> Passport with 6 months' validity
                required for all countries. Visa processing times: Thailand /
                Singapore / Sri Lanka 3–7 days, UAE 3–4 days, Schengen 15+ days —
                apply early and we track it for you.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Dedicated enquiry form — Contact-page style */}
      <section className="section soft" id="enquire">
        <div className="container">
          <div className="contact-grid">
            <Reveal>
              <div className="info-card" style={{ height: "100%" }}>
                <h3 style={{ marginBottom: 8 }}>
                  <i className="bi bi-headset"></i> Talk to Our Travel Desk
                </h3>
                <div className="contact-item">
                  <div className="ic">
                    <i className="bi bi-telephone"></i>
                  </div>
                  <div>
                    <h4>Call / WhatsApp</h4>
                    <p>
                      <a href={`tel:${COMPANY.phoneRaw}`}>{COMPANY.phone}</a>
                    </p>
                  </div>
                </div>
                <div className="contact-item">
                  <div className="ic">
                    <i className="bi bi-envelope-open"></i>
                  </div>
                  <div>
                    <h4>Email your dates</h4>
                    <p>
                      <a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a>
                    </p>
                  </div>
                </div>
                <div className="contact-item">
                  <div className="ic">
                    <i className="bi bi-geo-alt"></i>
                  </div>
                  <div>
                    <h4>Visit the desk</h4>
                    <p>{COMPANY.address}</p>
                  </div>
                </div>
                <div className="banner ok" style={{ marginTop: 16, marginBottom: 0 }}>
                  <i className="bi bi-people me-1"></i>
                  <span>
                    <strong>Group of 6+? </strong>College tours, company outings and
                    family functions get a dedicated coordinator and custom quote —
                    mention it in the form.
                  </span>
                </div>
                <div className="banner" style={{ marginTop: 14, marginBottom: 0 }}>
                  <i className="bi bi-patch-check me-1"></i>
                  <span>
                    <strong>How it works:</strong> you send dates & headcount →
                    we reply with 2–3 itinerary options and a final price →
                    30% advance confirms the booking.
                  </span>
                </div>
              </div>
            </Reveal>

            <Reveal delay={120}>
              <TourEnquiryForm
                key={prefillPackage || "blank"}
                prefillPackage={prefillPackage ? `Enquiry for the ${prefillPackage} package.` : ""}
              />
            </Reveal>
          </div>
        </div>
      </section>

      {/* Best tourism locations — India photo gallery */}
      <section className="section tour-locations" id="destinations">
        <div className="container">
          <SectionHead
            eyebrow="Best Tourism Locations — India"
            title="The Hills, Backwaters & Temples We Love"
            text="Twelve destinations we run most often — with the best season to visit and what makes each one worth the drive."
          />
          <LocationGrid list={indiaLocs} />
        </div>
      </section>

      {/* International locations */}
      <section className="section tour-locations tour-locations-intl" id="destinations-intl">
        <div className="container">
          <SectionHead
            eyebrow="Best Tourism Locations — International"
            title="Islands, Skylines & Alps Beyond India"
            text="Ten international favourites our travellers pick most, with the best month to go and what each is famous for."
          />
          <LocationGrid list={intlLocs} />
        </div>
      </section>

      {/* Photo attribution */}
      <section className="section" style={{ paddingTop: 0, paddingBottom: 40 }}>
        <div className="container">
          <details className="tour-credits">
            <summary>Photo credits & licences</summary>
            <ul>
              {Object.entries(TOUR_CREDITS).map(([slug, c]) => {
                const place =
                  TOUR_LOCATIONS.find((l) => l.slug === slug)?.name ||
                  TOUR_PACKAGES.find((p) => p.slug === slug)?.title ||
                  slug;
                return (
                  <li key={slug}>
                    <strong>{place}</strong> — {c.artist ? `${c.artist}, ` : ""}
                    <a
                      href={c.licenceUrl || c.source}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {c.licence}
                    </a>{" "}
                    via{" "}
                    <a href={c.source} target="_blank" rel="noopener noreferrer">
                      Wikimedia Commons
                    </a>
                  </li>
                );
              })}
            </ul>
          </details>
        </div>
      </section>

      {/* Why book with TCT */}
      <section className="section soft">
        <div className="container">
          <SectionHead
            eyebrow="Why TCT Tourism"
            title="A Local Team Behind Every Trip"
            text="We are a Coimbatore company organising the trips we send our own families on — that is the whole standard."
          />
          <div className="grid-4">
            {TOUR_PROMISES.map((p, i) => (
              <Reveal key={p.title} delay={i * 70}>
                <div className="card tour-promise" style={{ height: "100%" }}>
                  <div className="icon">
                    <i className={`bi ${p.icon}`}></i>
                  </div>
                  <h3>{p.title}</h3>
                  <p>{p.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section dark tour-cta">
        <div className="container" style={{ textAlign: "center" }}>
          <Reveal>
            <span className="eyebrow on-dark">Ready to travel?</span>
            <h2 style={{ fontSize: "clamp(1.7rem, 3.2vw, 2.4rem)" }}>
              Tell us your destination — we'll do the rest
            </h2>
            <div className="tour-cta-actions">
              <a
                className="btn btn-primary btn-lg"
                href={`https://wa.me/${COMPANY.whatsapp}?text=${encodeURIComponent(
                  "Hi TCT, I'd like a tour package quote. Destination: ___, Dates: ___, Guests: ___"
                )}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <i className="bi bi-whatsapp"></i> WhatsApp Us
              </a>
              <a className="btn btn-call btn-lg" href={`tel:${COMPANY.phoneRaw}`}>
                <i className="bi bi-telephone"></i> {COMPANY.phone}
              </a>
              <Link className="btn btn-ghost btn-lg" to="/contact">
                Send an Enquiry <i className="bi bi-arrow-right"></i>
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
