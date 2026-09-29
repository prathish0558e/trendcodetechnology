import { Link, useParams } from "react-router-dom";
import { Reveal, PageHero } from "../components/Reveal.jsx";
import QuoteForm from "../components/QuoteForm.jsx";
import { BPO_SERVICES } from "../data/content.js";

export default function BpoDetail() {
  const { slug } = useParams();
  const item = BPO_SERVICES.find((b) => b.slug === slug);

  if (!item) {
    return (
      <>
        <PageHero
          eyebrow="BPO"
          title="Service not found"
          text="Explore our BPO services instead."
        />
        <section className="section">
          <div className="container" style={{ textAlign: "center" }}>
            <Link to="/bpo" className="btn btn-primary">
              View BPO Services
            </Link>
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      <PageHero
        eyebrow="BPO Services"
        title={item.title}
        text={item.blurb}
        crumb="BPO"
      />

      <section className="section">
        <div className="container">
          <div className="split" style={{ alignItems: "start" }}>
            <Reveal>
              <div className="info-card" style={{ marginBottom: 22 }}>
                <h3>
                  <i className={`bi ${item.icon}`}></i> What we handle
                </h3>
                <ul>
                  {item.points.map((p) => (
                    <li key={p}>
                      <i className="bi bi-check-circle-fill"></i> {p}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="info-card">
                <h3>
                  <i className="bi bi-graph-up"></i> Quality you can measure
                </h3>
                <p style={{ color: "var(--muted)", marginBottom: 0 }}>
                  Every project runs on agreed SLAs — accuracy targets,
                  turnaround times and CSAT scores reviewed with you weekly, so
                  quality never drifts.
                </p>
              </div>
            </Reveal>
            <Reveal delay={120}>
              <QuoteForm />
            </Reveal>
          </div>
        </div>
      </section>
    </>
  );
}
