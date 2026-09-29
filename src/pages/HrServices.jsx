import { Link } from "react-router-dom";
import { Reveal, SectionHead, PageHero } from "../components/Reveal.jsx";
import { HR_SERVICES } from "../data/content.js";

export default function HrServices() {
  return (
    <>
      <PageHero
        eyebrow="HR Services"
        title="People Solutions That Power Your Operations"
        text="Verified domestic manpower and structured training programs — recruited, trained and managed by TCT end to end."
      />

      <section className="section">
        <div className="container">
          <SectionHead
            eyebrow="What We Offer"
            title="Staffing & Skilling, Handled Professionally"
          />
          <div className="grid-2">
            {HR_SERVICES.map((h, i) => (
              <Reveal key={h.slug} delay={i * 90}>
                <div className="card" style={{ height: "100%" }}>
                  <div className="icon"><i className={`bi ${h.icon}`}></i></div>
                  <h3>{h.title}</h3>
                  <p>{h.blurb}</p>
                  <ul className="checklist" style={{ marginTop: 4, marginBottom: 18 }}>
                    {h.points.slice(0, 3).map((p) => (
                      <li key={p}>
                        <i className="bi bi-check-circle-fill"></i> {p}
                      </li>
                    ))}
                  </ul>
                  <Link className="more" to={`/hr-services/${h.slug}`}>
                    Learn more <i className="bi bi-arrow-right"></i>
                  </Link>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section soft">
        <div className="container" style={{ textAlign: "center" }}>
          <Reveal>
            <span className="eyebrow">Hiring or upskilling?</span>
            <h2 style={{ fontSize: "clamp(1.6rem, 3vw, 2.2rem)" }}>
              Tell us the roles — we'll build the bench
            </h2>
            <p style={{ color: "var(--muted)", maxWidth: 560, margin: "0 auto 26px" }}>
              Share your manpower or training requirement and our HR team will
              respond with a plan, timeline and transparent pricing.
            </p>
            <Link to="/contact" className="btn btn-primary btn-lg">
              Talk to HR Team <i className="bi bi-arrow-right"></i>
            </Link>
          </Reveal>
        </div>
      </section>
    </>
  );
}
