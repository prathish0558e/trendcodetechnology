import { Link } from "react-router-dom";
import { Reveal, SectionHead, useCountUp } from "../components/Reveal.jsx";
import QuoteForm from "../components/QuoteForm.jsx";
import ToTop from "../components/ToTop.jsx";
import {
  STATS,
  SERVICES,
  FEATURES,
  PROCESS,
  TESTIMONIALS,
} from "../data/content.js";

function Stat({ value, suffix, label }) {
  const [ref, n] = useCountUp(value);
  return (
    <div className="stat" ref={ref}>
      <span className="num">
        {n.toLocaleString("en-IN")}
        {suffix}
      </span>
      <span className="lbl">{label}</span>
    </div>
  );
}

function HeroFacts() {
  return (
    <aside className="hero-facts">
      <div className="fact-head">
        <span>TCT at a glance</span>
        <span className="live"><i className="bi bi-circle-fill"></i> Active</span>
      </div>
      <div className="fact-row">
        <span className="k"><i className="bi bi-geo-alt"></i> Headquarters</span>
        <span className="v">Coimbatore, TN</span>
      </div>
      <div className="fact-row">
        <span className="k"><i className="bi bi-calendar-check"></i> Founded</span>
        <span className="v">2019</span>
      </div>
      <div className="fact-row">
        <span className="k"><i className="bi bi-emoji-smile"></i> Happy clients</span>
        <span className="v">1,200+</span>
      </div>
      <div className="fact-row">
        <span className="k"><i className="bi bi-patch-check"></i> Projects delivered</span>
        <span className="v">1,150+</span>
      </div>
      <div className="fact-row">
        <span className="k"><i className="bi bi-headset"></i> Support</span>
        <span className="v">24 × 7</span>
      </div>
      <div className="fact-row">
        <span className="k"><i className="bi bi-envelope-open"></i> Email</span>
        <span className="v" style={{ fontSize: 12.5 }}>trendcodetechnology2026@gmail.com</span>
      </div>
    </aside>
  );
}

export default function Home() {
  return (
    <>
      {/* ---------- Hero ---------- */}
      <section className="hero">
        <div className="container">
          <div className="hero-wrap">
            <div className="hero-inner">
              <span className="eyebrow">IT Company · Coimbatore</span>
              <h1>
                Software, web and BPO services,{" "}
                <span className="grad">delivered properly.</span>
              </h1>
              <p className="lead">
                Trend Code Technology is a Coimbatore-based IT company building
                websites, applications and back-office operations for
                businesses across Tamil Nadu — with clear pricing, weekly
                demos and support that answers the phone.
              </p>
              <div className="hero-actions">
                <Link to="/contact" className="btn btn-primary btn-lg">
                  Start a Project <i className="bi bi-arrow-right"></i>
                </Link>
                <Link to="/services" className="btn btn-call btn-lg">
                  View Services
                </Link>
              </div>
              <div className="hero-points">
                <span><i className="bi bi-patch-check-fill"></i> Since 2019</span>
                <span><i className="bi bi-patch-check-fill"></i> 1,200+ clients</span>
                <span><i className="bi bi-patch-check-fill"></i> 24/7 support</span>
                <span><i className="bi bi-patch-check-fill"></i> Ganapathy, Coimbatore</span>
              </div>
            </div>
            <HeroFacts />
          </div>
        </div>
      </section>

      {/* ---------- Stats ---------- */}
      <div className="stats">
        <div className="container">
          <div className="stats-card">
            {STATS.map((s) => (
              <Stat key={s.label} {...s} />
            ))}
          </div>
        </div>
      </div>

      {/* ---------- About teaser + code visual ---------- */}
      <section className="section">
        <div className="container">
          <div className="split">
            <Reveal>
              <span className="eyebrow">About TCT</span>
              <h2 style={{ fontSize: "clamp(1.7rem, 3.4vw, 2.5rem)" }}>
                The Best IT Solution With 7 Years of Experience
              </h2>
              <p style={{ color: "var(--muted)" }}>
                Founded in 2019 by industry professionals, Trend Code
                Technology delivers cutting-edge communication and software
                solutions to the global business community — from web and
                application development to BPO and HR services, all at an
                affordable price.
              </p>
              <ul className="checklist">
                <li><i className="bi bi-check-circle-fill"></i> Award-winning delivery team</li>
                <li><i className="bi bi-check-circle-fill"></i> Quality customer service, always</li>
                <li><i className="bi bi-check-circle-fill"></i> Transparent pricing &amp; fair quotes</li>
                <li><i className="bi bi-check-circle-fill"></i> Excellent post-launch support</li>
              </ul>
              <div style={{ display: "flex", gap: 14, marginTop: 28, flexWrap: "wrap" }}>
                <Link to="/about" className="btn btn-outline">
                  More About Us <i className="bi bi-arrow-right"></i>
                </Link>
                <a href="tel:+919384847922" className="btn btn-outline">
                  <i className="bi bi-telephone"></i> Call Us
                </a>
              </div>
            </Reveal>

            <Reveal delay={120}>
              <div className="stat-panel">
                <div className="sp-head">
                  <span>TCT by the numbers</span>
                </div>
                <div className="sp-body">
                  <div className="sp-row">
                    <span className="sp-num">7+</span>
                    <span className="sp-lbl">Years of experience</span>
                  </div>
                  <div className="sp-row">
                    <span className="sp-num">1,200+</span>
                    <span className="sp-lbl">Happy clients</span>
                  </div>
                  <div className="sp-row">
                    <span className="sp-num">1,150+</span>
                    <span className="sp-lbl">Projects delivered</span>
                  </div>
                  <div className="sp-row">
                    <span className="sp-num">500+</span>
                    <span className="sp-lbl">Awards won</span>
                  </div>
                  <div className="sp-row">
                    <span className="sp-num">24×7</span>
                    <span className="sp-lbl">Support coverage</span>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ---------- Why choose us ---------- */}
      <section className="section soft">
        <div className="container">
          <SectionHead
            eyebrow="Why Choose TCT"
            title="We Are Here to Grow Your Business Exponentially"
            text="Four reasons teams across manufacturing, retail and services trust us with their technology."
          />
          <div className="grid-4">
            {FEATURES.map((f, i) => (
              <Reveal key={f.title} delay={i * 90}>
                <div className="card" style={{ height: "100%" }}>
                  <div className="icon"><i className={`bi ${f.icon}`}></i></div>
                  <h3>{f.title}</h3>
                  <p>{f.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- Services ---------- */}
      <section className="section">
        <div className="container">
          <SectionHead
            eyebrow="Our Services"
            title="Custom IT Solutions for Your Successful Business"
            text="From product engineering to back-office operations — one partner for the whole journey."
          />
          <div className="grid-3">
            {SERVICES.map((s, i) => (
              <Reveal key={s.slug} delay={(i % 3) * 90}>
                <div className="card" style={{ height: "100%" }}>
                  <div className="icon"><i className={`bi ${s.icon}`}></i></div>
                  <h3>{s.title}</h3>
                  <p>{s.blurb}</p>
                  <Link className="more" to={`/services/${s.slug}`}>
                    Learn more <i className="bi bi-arrow-right"></i>
                  </Link>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- Process (dark) ---------- */}
      <section className="section dark">
        <div className="container">
          <SectionHead
            eyebrow="How We Work"
            title="A Simple, Proven Delivery Process"
            text="Clear milestones, weekly demos and zero surprises from kickoff to launch."
          />
          <div className="steps">
            {PROCESS.map((p, i) => (
              <Reveal key={p.step} delay={i * 90}>
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

      {/* ---------- Testimonials ---------- */}
      <section className="section soft">
        <div className="container">
          <SectionHead
            eyebrow="Testimonials"
            title="What Our Clients Say About Our Digital Services"
          />
          <div className="grid-2">
            {TESTIMONIALS.map((t, i) => (
              <Reveal key={t.name} delay={i * 80}>
                <div className="tst" style={{ height: "100%" }}>
                  <div className="stars">
                    <i className="bi bi-star-fill"></i>
                    <i className="bi bi-star-fill"></i>
                    <i className="bi bi-star-fill"></i>
                    <i className="bi bi-star-fill"></i>
                    <i className="bi bi-star-fill"></i>
                  </div>
                  <blockquote>“{t.quote}”</blockquote>
                  <div className="who">
                    <div className="avatar">
                      {t.name.split(" ").map((w) => w[0]).join("")}
                    </div>
                    <div>
                      <h4>{t.name}</h4>
                      <small>{t.role}</small>
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- Local SEO band ---------- */}
      <section className="section" style={{ paddingTop: 0, paddingBottom: 40 }}>
        <div className="container">
          <Reveal>
            <div className="info-card" style={{ textAlign: "center", padding: "34px 26px" }}>
              <span className="eyebrow" style={{ justifyContent: "center" }}>
                Serving Tamil Nadu
              </span>
              <h2 style={{ fontSize: "clamp(1.3rem, 2.6vw, 1.8rem)", maxWidth: 860, margin: "0 auto 10px" }}>
                Why businesses search “IT companies in Coimbatore” and find us first
              </h2>
              <p style={{ color: "var(--muted)", maxWidth: 760, margin: "0 auto" }}>
                Trend Code Technology is a trusted IT company in Coimbatore
                (Ganapathy) serving Tiruppur, Salem, Erode and Chennai —
                delivering software development, website design, digital
                marketing, BPO and HR services with 7+ years of proven results.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ---------- Quote band ---------- */}
      <section className="section" style={{ paddingTop: 24 }}>
        <div className="container">
          <Reveal>
            <div className="quote-band">
              <div>
                <span className="eyebrow on-dark">Request A Quote</span>
                <h2>Need A Free Quote? Feel Free to Contact Us</h2>
                <p>
                  Whether you need a website, a digital marketing strategy or a
                  full IT solution, our team is ready to understand your goals
                  and send a custom, no-obligation quote — completely free.
                </p>
                <div className="contact-line">
                  <div className="ic"><i className="bi bi-telephone"></i></div>
                  <div>
                    <h5>Call to ask any question</h5>
                    <p>+91 93848 47922 (Call & WhatsApp)</p>
                  </div>
                </div>
                <div className="contact-line">
                  <div className="ic"><i className="bi bi-clock-history"></i></div>
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

      <ToTop />
    </>
  );
}
