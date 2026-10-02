import { Link } from "react-router-dom";
import { Reveal, SectionHead, PageHero } from "../components/Reveal.jsx";
import { SERVICES } from "../data/content.js";

export default function Services() {
  return (
    <>
      <PageHero
        eyebrow="Our Services"
        title="Custom IT Solutions for Your Successful Business"
        text="Twelve specialised services across engineering, design, growth and operations — pick one or combine them into a full engagement."
      />

      <section className="section">
        <div className="container">
          <SectionHead
            eyebrow="What We Do"
            title="One Partner, Complete Technology Coverage"
          />
          <div className="grid-3">
            {SERVICES.map((s, i) => (
              <Reveal key={s.slug} delay={(i % 3) * 80}>
                <div className="card" style={{ height: "100%" }}>
                  <div className="svc-icon" style={{ "--tint": s.tint }}>
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <path d={s.glyph} />
                    </svg>
                  </div>
                  <h3>{s.title}</h3>
                  <p>{s.blurb}</p>
                  <Link className="more" to={`/services/${s.slug}`}>
                    Explore service <i className="bi bi-arrow-right"></i>
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
            <span className="eyebrow">Not sure where to start?</span>
            <h2 style={{ fontSize: "clamp(1.6rem, 3vw, 2.2rem)" }}>
              Tell us your goal — we'll map the shortest path to it
            </h2>
            <p style={{ color: "var(--muted)", maxWidth: 560, margin: "0 auto 26px" }}>
              A 30-minute discovery call is enough for us to sketch a plan,
              timeline and budget range for your project.
            </p>
            <Link to="/contact" className="btn btn-primary btn-lg">
              Book a Free Consultation <i className="bi bi-arrow-right"></i>
            </Link>
          </Reveal>
        </div>
      </section>
    </>
  );
}
