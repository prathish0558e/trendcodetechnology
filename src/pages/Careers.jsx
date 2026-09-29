import { Link } from "react-router-dom";
import { Reveal, SectionHead, PageHero } from "../components/Reveal.jsx";
import { CAREERS } from "../data/content.js";

const tracks = [CAREERS.it, CAREERS["non-it"]];

export default function Careers() {
  return (
    <>
      <PageHero
        eyebrow="Careers"
        title="Build Your Career at Trend Code Technology"
        text="Whether you write code or run operations, you'll get paid training, real client work and a clear growth path from day one."
      />

      <section className="section">
        <div className="container">
          <SectionHead
            eyebrow="Join Our Team"
            title="Two Tracks. One Team."
          />
          <div className="grid-2">
            {tracks.map((t, i) => (
              <Reveal key={t.slug} delay={i * 100}>
                <div className="card" style={{ height: "100%" }}>
                  <div className="icon"><i className={`bi ${t.icon}`}></i></div>
                  <h3>{t.title}</h3>
                  <p>{t.blurb}</p>
                  <div className="chips" style={{ marginTop: "auto", marginBottom: 14 }}>
                    {t.roles.map((r) => (
                      <Link key={r} to={`/careers/${t.slug}`} style={{ pointerEvents: "none" }}>
                        {r}
                      </Link>
                    ))}
                  </div>
                  <Link className="more" to={`/careers/${t.slug}`}>
                    See openings <i className="bi bi-arrow-right"></i>
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
            <span className="eyebrow">Life at TCT</span>
            <h2 style={{ fontSize: "clamp(1.6rem, 3vw, 2.2rem)" }}>
              Mentorship first. Boring meetings last.
            </h2>
            <p style={{ color: "var(--muted)", maxWidth: 620, margin: "0 auto 26px" }}>
              Freshers join real projects with a senior mentor, structured
              reviews every quarter and internal training that actually moves
              your career forward.
            </p>
            <Link to="/careers/it" className="btn btn-primary btn-lg">
              Explore IT Roles <i className="bi bi-arrow-right"></i>
            </Link>
          </Reveal>
        </div>
      </section>
    </>
  );
}
