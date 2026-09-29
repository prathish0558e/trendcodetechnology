import { Link, useParams } from "react-router-dom";
import { Reveal, PageHero } from "../components/Reveal.jsx";
import QuoteForm from "../components/QuoteForm.jsx";
import { SERVICES } from "../data/content.js";

export default function ServiceDetail() {
  const { slug } = useParams();
  const service = SERVICES.find((s) => s.slug === slug);

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

      <section className="section">
        <div className="container">
          <div className="split" style={{ alignItems: "start" }}>
            <Reveal>
              <div className="info-card" style={{ marginBottom: 22 }}>
                <h3>
                  <i className={`bi ${service.icon}`}></i> What's included
                </h3>
                <ul>
                  {service.points.map((p) => (
                    <li key={p}>
                      <i className="bi bi-check-circle-fill"></i> {p}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="info-card">
                <h3>
                  <i className="bi bi-diagram-3"></i> How we deliver
                </h3>
                <p style={{ color: "var(--muted)", marginBottom: 0 }}>
                  Every engagement runs through our proven four-step process —
                  discover, design, develop, deliver — with weekly demos and a
                  dedicated point of contact, so you always know what's
                  happening and what's next.
                </p>
              </div>
            </Reveal>

            <Reveal delay={120}>
              <QuoteForm />
            </Reveal>
          </div>
        </div>
      </section>

      <section className="section soft">
        <div className="container">
          <SectionHeadInline />
          <div className="grid-3">
            {others.map((s, i) => (
              <Reveal key={s.slug} delay={i * 80}>
                <div className="card" style={{ height: "100%" }}>
                  <div className="icon"><i className={`bi ${s.icon}`}></i></div>
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

function SectionHeadInline() {
  return (
    <div className="section-head">
      <span className="eyebrow">Keep Exploring</span>
      <h2>Related Services</h2>
    </div>
  );
}
