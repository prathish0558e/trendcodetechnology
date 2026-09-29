import { Link, useParams } from "react-router-dom";
import { Reveal, SectionHead, PageHero } from "../components/Reveal.jsx";
import { CAREERS } from "../data/content.js";

const ROLE_META = {
  "Web Designing": { icon: "bi-vector-pen", text: "Craft clean, responsive interfaces and design systems in Figma and code." },
  "Web Development": { icon: "bi-globe2", text: "Build fast, full-stack web apps with React and Node on real client projects." },
  "Digital Marketing": { icon: "bi-megaphone", text: "Run SEO, ads and social campaigns — and prove impact with analytics." },
  "Software Development": { icon: "bi-code-slash", text: "Engineer custom applications end to end, from APIs to deployment." },
  "Machine Learning": { icon: "bi-graph-up-arrow", text: "Train, evaluate and ship ML models that solve real business problems." },
  "Data Entry": { icon: "bi-keyboard", text: "Keep client records accurate and fast with multi-level quality checks." },
  "Voice Process": { icon: "bi-headset", text: "Own customer conversations on support, retention and sales calls." },
};

export default function CareerCategory() {
  const { track } = useParams();
  const cat = CAREERS[track];

  if (!cat) {
    return (
      <>
        <PageHero
          eyebrow="Careers"
          title="Track not found"
          text="Explore our career tracks instead."
        />
        <section className="section">
          <div className="container" style={{ textAlign: "center" }}>
            <Link to="/careers" className="btn btn-primary">View Careers</Link>
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      <PageHero
        eyebrow="Careers"
        title={cat.title}
        text={cat.blurb}
        crumb="Careers"
      />

      <section className="section">
        <div className="container">
          <SectionHead
            eyebrow="Open Roles"
            title="Pick a Role, Start a Conversation"
            text="Don't see an exact match? Apply anyway — we hire for potential and train for skill."
          />
          <div className="grid-3">
            {cat.roles.map((r, i) => {
              const meta = ROLE_META[r] || { icon: "bi-briefcase", text: "Join our growing team." };
              return (
                <Reveal key={r} delay={(i % 3) * 80}>
                  <div className="card" style={{ height: "100%" }}>
                    <div className="icon"><i className={`bi ${meta.icon}`}></i></div>
                    <h3>{r}</h3>
                    <p>{meta.text}</p>
                    <Link
                      className="more"
                      to={`/contact?role=${encodeURIComponent(r)}`}
                    >
                      Apply now <i className="bi bi-arrow-right"></i>
                    </Link>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}
