import { Link } from "react-router-dom";
import { Reveal, SectionHead, PageHero } from "../components/Reveal.jsx";
import { BPO_SERVICES } from "../data/content.js";

export default function Bpo() {
  return (
    <>
      <PageHero
        eyebrow="BPO Services"
        title="Back-Office Operations, Run Reliably"
        text="Accurate data operations and professional voice teams — measured daily on accuracy, turnaround time and customer satisfaction."
      />

      <section className="section">
        <div className="container">
          <SectionHead
            eyebrow="Our BPO Units"
            title="Two Focused Practices, One Quality Bar"
          />
          <div className="grid-2">
            {BPO_SERVICES.map((b, i) => (
              <Reveal key={b.slug} delay={i * 90}>
                <div className="card" style={{ height: "100%" }}>
                  <div className="icon"><i className={`bi ${b.icon}`}></i></div>
                  <h3>{b.title}</h3>
                  <p>{b.blurb}</p>
                  <ul className="checklist" style={{ marginTop: 4, marginBottom: 18 }}>
                    {b.points.slice(0, 3).map((p) => (
                      <li key={p}>
                        <i className="bi bi-check-circle-fill"></i> {p}
                      </li>
                    ))}
                  </ul>
                  <Link className="more" to={`/bpo/${b.slug}`}>
                    Learn more <i className="bi bi-arrow-right"></i>
                  </Link>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section dark">
        <div className="container">
          <SectionHead
            eyebrow="Operating Standards"
            title="What Every Engagement Gets"
          />
          <div className="grid-4">
            {[
              { icon: "bi-shield-check", title: "Confidentiality", text: "NDAs, restricted access and secure handling of every record." },
              { icon: "bi-speedometer2", title: "Daily Reporting", text: "Accuracy %, TAT and volume dashboards shared with your team." },
              { icon: "bi-people", title: "Trained Teams", text: "Operators and agents coached continuously on process and tone." },
              { icon: "bi-arrow-repeat", title: "Scalable Seats", text: "Scale up or down with demand — seats ready within days." },
            ].map((c, i) => (
              <Reveal key={c.title} delay={i * 80}>
                <div className="card on-dark" style={{ height: "100%" }}>
                  <div className="icon"><i className={`bi ${c.icon}`}></i></div>
                  <h3>{c.title}</h3>
                  <p>{c.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
