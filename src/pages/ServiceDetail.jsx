import { Link, useParams } from "react-router-dom";
import { Reveal, PageHero, SectionHead } from "../components/Reveal.jsx";
import QuoteForm from "../components/QuoteForm.jsx";
import { SERVICES, SERVICE_DETAILS, PROCESS, COMPANY } from "../data/content.js";

export default function ServiceDetail() {
  const { slug } = useParams();
  const service = SERVICES.find((s) => s.slug === slug);
  const details = SERVICE_DETAILS[slug];

  if (!service) {
    return (
      <>
        <PageHero
          eyebrow="Services"
          title="Service not found"
          text="The service you're looking for doesn't exist — explore our full list instead."
        />
        <section className="section">
          <div className="container" style={{ textAlign: "center" }}>
            <Link to="/services" className="btn btn-primary">
              View All Services
            </Link>
          </div>
        </section>
      </>
    );
  }

  const others = SERVICES.filter((s) => s.slug !== slug).slice(0, 3);

  return (
    <>
      <PageHero
        eyebrow="Our Services"
        title={service.title}
        text={service.blurb}
        crumb="Services"
      />

      {/* ---------- Quick facts strip ---------- */}
      {details && (
        <div className="svc-facts">
          <div className="container svc-facts-row">
            {details.facts.map((f) => (
              <div className="svc-fact" key={f.k}>
                <span className="ic">
                  <i className={`bi ${f.icon}`}></i>
                </span>
                <div>
                  <small>{f.k}</small>
                  <strong>{f.v}</strong>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ---------- Overview + deliverables ---------- */}
      <section className="section">
        <div className="container">
          <div className="split" style={{ alignItems: "start" }}>
            <Reveal>
              <span className="eyebrow">
                <i className={`bi ${service.icon}`}></i> Overview
              </span>
              <h2 style={{ fontSize: "clamp(1.6rem, 3vw, 2.2rem)" }}>
                {details ? details.overview.split(". ")[0] + "." : service.blurb}
              </h2>
              {details && (
                <p style={{ color: "var(--muted)" }}>
                  {details.overview
                    .split(". ")
                    .slice(1)
                    .join(". ")}
                </p>
              )}

              {details && (
                <>
                  <h3 style={{ marginTop: 26 }}>Tools &amp; Technologies</h3>
                  <div className="svc-tech-wrap">
                    {details.techs.map((t) => (
                      <span className="svc-tech" key={t}>
                        {t}
                      </span>
                    ))}
                  </div>
                </>
              )}

              <div
                style={{
                  display: "flex",
                  gap: 14,
                  marginTop: 28,
                  flexWrap: "wrap",
                }}
              >
                <Link to="/contact" className="btn btn-primary">
                  Discuss Your Project <i className="bi bi-arrow-right"></i>
                </Link>
                <a href={`tel:${COMPANY.phoneRaw}`} className="btn btn-outline">
                  <i className="bi bi-telephone"></i> {COMPANY.phone}
                </a>
              </div>
            </Reveal>

            <Reveal delay={120}>
              <div className="info-card">
                <h3>
                  <i className="bi bi-box-seam"></i> What you get
                </h3>
                <ul>
                  {(details
                    ? details.deliverables
                    : service.points
                  ).map((p) => (
                    <li key={p}>
                      <i className="bi bi-check-circle-fill"></i> {p}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="info-card" style={{ marginTop: 18 }}>
                <h3>
                  <i className="bi bi-diagram-3"></i> How we deliver
                </h3>
                <p style={{ color: "var(--muted)", marginBottom: 0 }}>
                  Every engagement runs through our proven six-step process —
                  from requirement analysis to ongoing support — with weekly
                  demos and a dedicated point of contact, so you always know
                  what's happening and what's next.
                </p>
                <Link
                  to="/about"
                  className="more"
                  style={{ display: "inline-flex", marginTop: 12 }}
                >
                  See how we work <i className="bi bi-arrow-right"></i>
                </Link>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ---------- Process mini band ---------- */}
      <section className="section soft">
        <div className="container">
          <SectionHead
            eyebrow="Delivery Process"
            title="From First Call to Final Launch"
          />
          <div className="grid-4">
            {PROCESS.slice(0, 4).map((p, i) => (
              <Reveal key={p.title} delay={i * 80}>
                <div className="card" style={{ height: "100%" }}>
                  <div className="num-badge">{i + 1}</div>
                  <h3 style={{ fontSize: "1.05rem" }}>{p.title}</h3>
                  <p style={{ fontSize: 14 }}>{p.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- FAQ ---------- */}
      {details && (
        <section className="section">
          <div className="container">
            <SectionHead
              eyebrow="FAQ"
              title={`${service.title} — Questions Clients Ask Us`}
              text="Straight answers before you commit. Anything else — call or WhatsApp us anytime."
            />
            <div className="faq-list">
              {details.faqs.map((f, i) => (
                <Reveal key={f.q} delay={i * 70}>
                  <details className="faq-item" open={i === 0}>
                    <summary>
                      {f.q}
                      <i className="bi bi-chevron-down"></i>
                    </summary>
                    <p>{f.a}</p>
                  </details>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ---------- Quote band ---------- */}
      <section className="section" style={{ paddingTop: 8 }}>
        <div className="container">
          <Reveal>
            <div className="quote-band">
              <div>
                <span className="eyebrow on-dark">Request A Quote</span>
                <h2>Get a Clear, Fixed Quote for {service.title}</h2>
                <p>
                  Tell us what you need — you'll get a no-obligation quote with
                  milestone-wise pricing within 24 hours. No hidden charges,
                  ever.
                </p>
                <div className="contact-line">
                  <div className="ic">
                    <i className="bi bi-telephone"></i>
                  </div>
                  <div>
                    <h5>Call to ask any question</h5>
                    <p>{COMPANY.phone} (Call &amp; WhatsApp)</p>
                  </div>
                </div>
                <div className="contact-line">
                  <div className="ic">
                    <i className="bi bi-clock-history"></i>
                  </div>
                  <div>
                    <h5>Fast response</h5>
                    <p>Reply within 24 hours · 24×7 telephone support</p>
                  </div>
                </div>
              </div>
              <QuoteForm />
            </div>
          </Reveal>
        </div>
      </section>

      {/* ---------- Related services ---------- */}
      <section className="section soft">
        <div className="container">
          <SectionHead eyebrow="Keep Exploring" title="Related Services" />
          <div className="grid-3">
            {others.map((s, i) => (
              <Reveal key={s.slug} delay={i * 80}>
                <div className="card" style={{ height: "100%" }}>
                  <div className="svc-icon" style={{ "--tint": s.tint }}>
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <path d={s.glyph} />
                    </svg>
                  </div>
                  <h3>{s.title}</h3>
                  <p>{s.blurb}</p>
                  <Link className="more" to={`/services/${s.slug}`}>
                    Explore <i className="bi bi-arrow-right"></i>
                  </Link>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
