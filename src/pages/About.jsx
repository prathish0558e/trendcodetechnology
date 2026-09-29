import { Link } from "react-router-dom";
import { Reveal, SectionHead, PageHero } from "../components/Reveal.jsx";
import { COMPANY, VALUES, PROCESS } from "../data/content.js";

export default function About() {
  return (
    <>
      <PageHero
        eyebrow="About Us"
        title="The Best IT Solution With 7 Years of Experience"
        text="A new media design company delivering highly scalable conceptual and functional solutions to companies worldwide."
      />

      <section className="section">
        <div className="container">
          <div className="split">
            <Reveal>
              <span className="eyebrow">
                <i className="bi bi-buildings"></i> Our Story
              </span>
              <h2 style={{ fontSize: "clamp(1.7rem, 3.2vw, 2.4rem)" }}>
                Formed in {COMPANY.founded} by Industry Professionals
              </h2>
              <p style={{ color: "var(--muted)" }}>
                Trend Code Technology was formed in {COMPANY.founded} by a team
                of industry professionals with in-depth experience of
                technology and organisational development, on the premise of
                providing cutting-edge communication solutions to the global
                business community.
              </p>
              <p style={{ color: "var(--muted)" }}>
                From website design to application development, our experience
                in managing technology projects — right from selecting tools
                and platforms to implementing complete IT solutions — has shown
                results. Our crystal-clear objective is to deliver quality web
                and software services while adding supreme value to enterprises
                globally at an affordable price.
              </p>
              <div style={{ display: "flex", gap: 14, marginTop: 24, flexWrap: "wrap" }}>
                <Link to="/services" className="btn btn-primary">
                  Our Services <i className="bi bi-arrow-right"></i>
                </Link>
                <Link to="/contact" className="btn btn-outline">
                  Work With Us
                </Link>
              </div>
            </Reveal>

            <Reveal delay={120}>
              <div className="split" style={{ gap: 18 }}>
                {[
                  { k: "Founded", v: COMPANY.founded, icon: "bi-calendar-check" },
                  { k: "Happy Clients", v: "1200+", icon: "bi-emoji-smile" },
                  { k: "Projects Done", v: "1150+", icon: "bi-patch-check" },
                  { k: "Awards Won", v: "500+", icon: "bi-trophy" },
                ].map((m) => (
                  <div key={m.k} className="info-card" style={{ display: "flex", alignItems: "center", gap: 16 }}>
                    <div className="icon" style={{ width: 52, height: 52, borderRadius: 10, display: "grid", placeItems: "center", fontSize: 22, color: "var(--primary)", background: "var(--primary-soft)" }}>
                      <i className={`bi ${m.icon}`}></i>
                    </div>
                    <div>
                      <h3 style={{ margin: 0, fontSize: "1.35rem" }}>{m.v}</h3>
                      <p style={{ margin: 0, color: "var(--muted)", fontSize: 13.5 }}>{m.k}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="section soft">
        <div className="container">
          <SectionHead
            eyebrow="Our Values"
            title="Principles That Shape Every Project"
          />
          <div className="grid-4">
            {VALUES.map((v, i) => (
              <Reveal key={v.title} delay={i * 80}>
                <div className="card" style={{ height: "100%" }}>
                  <div className="icon"><i className={`bi ${v.icon}`}></i></div>
                  <h3>{v.title}</h3>
                  <p>{v.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section dark">
        <div className="container">
          <SectionHead
            eyebrow="How We Work"
            title="From First Call to Final Launch"
          />
          <div className="steps">
            {PROCESS.map((p, i) => (
              <Reveal key={p.step} delay={i * 80}>
                <div className="step-card" style={{ height: "100%" }}>
                  <div className="num">{p.step}</div>
                  <h3>{p.title}</h3>
                  <p>{p.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
