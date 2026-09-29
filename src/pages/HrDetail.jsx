import { Link, useParams } from "react-router-dom";
import { Reveal, PageHero } from "../components/Reveal.jsx";
import QuoteForm from "../components/QuoteForm.jsx";
import { HR_SERVICES } from "../data/content.js";

export default function HrDetail() {
  const { slug } = useParams();
  const item = HR_SERVICES.find((h) => h.slug === slug);

  if (!item) {
    return (
      <>
        <PageHero
          eyebrow="HR Services"
          title="Service not found"
          text="Explore our HR services instead."
        />
        <section className="section">
          <div className="container" style={{ textAlign: "center" }}>
            <Link to="/hr-services" className="btn btn-primary">
              View HR Services
            </Link>
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      <PageHero
        eyebrow="HR Services"
        title={item.title}
        text={item.blurb}
        crumb="HR Services"
      />

      <section className="section">
        <div className="container">
          <div className="split" style={{ alignItems: "start" }}>
            <Reveal>
              <div className="info-card" style={{ marginBottom: 22 }}>
                <h3>
                  <i className={`bi ${item.icon}`}></i> Scope of service
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
                  <i className="bi bi-people"></i> Why companies choose TCT
                </h3>
                <p style={{ color: "var(--muted)", marginBottom: 0 }}>
                  Background-verified staff, structured training modules and
                  complete payroll compliance — managed by a dedicated HR
                  coordinator so your team can stay focused on the business.
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
