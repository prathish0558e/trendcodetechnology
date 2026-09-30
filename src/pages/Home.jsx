import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Reveal, SectionHead, useCountUp } from "../components/Reveal.jsx";
import QuoteForm from "../components/QuoteForm.jsx";
import ToTop from "../components/ToTop.jsx";
import CookieConsent from "../components/CookieConsent.jsx";
import Journey from "../components/Journey.jsx";
import TechStack from "../components/TechStack.jsx";
import {
  STATS,
  SERVICES,
  FEATURES,
  PROCESS,
  TESTIMONIALS,
  COMPANY,
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

/* Creative side panel for the About teaser — a live "delivery console"
   that cycles through real TCT proof points (instead of repeating the stats
   band above). */
const DELIVERY_LINES = [
  { icon: "bi-globe2", tag: "WEBSITE LAUNCHED", text: "Manufacturing portal — Coimbatore" },
  { icon: "bi-phone", tag: "APP SHIPPED", text: "Delivery tracking app — v2.4" },
  { icon: "bi-headset", tag: "BPO LIVE", text: "12 agents onboarded — Voice desk" },
  { icon: "bi-graph-up-arrow", tag: "CAMPAIGN WON", text: "3.2× leads in 90 days — Retail SEO" },
  { icon: "bi-cpu", tag: "IOT DEPLOYED", text: "Machine monitoring — Textile unit" },
  { icon: "bi-patch-check", tag: "CLIENT SIGNED", text: "Annual support retainer renewed" },
];

function LiveDeliveryPanel() {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const t = window.setInterval(
      () => setTick((v) => v + 1),
      2600
    );
    return () => window.clearInterval(t);
  }, []);

  // window of 4 lines, sliding through the list
  const visible = [0, 1, 2, 3].map(
    (i) => DELIVERY_LINES[(tick + i) % DELIVERY_LINES.length]
  );

  return (
    <div className="delivery-panel">
      <div className="dp-head">
        <span className="dp-dots">
          <i></i><i></i><i></i>
        </span>
        <span className="dp-title">tct — live delivery feed</span>
        <span className="dp-live">
          <i className="bi bi-broadcast"></i> LIVE
        </span>
      </div>
      <div className="dp-body">
        {visible.map((l, i) => (
          <div className={`dp-line ${i === 0 ? "dp-new" : ""}`} key={`${tick}-${i}`}>
            <span className="dp-ic">
              <i className={`bi ${l.icon}`}></i>
            </span>
            <span className="dp-text">
              <small>{l.tag}</small>
              {l.text}
            </span>
          </div>
        ))}
      </div>
      <div className="dp-foot">
        <i className="bi bi-activity"></i>
        Shipping since 2019 — <strong>1,150+ projects delivered</strong> across Tamil Nadu
      </div>
    </div>
  );
}

/* Premium "partner card" for the hero side — like a bank card for trust.
   Shows what TCT guarantees instead of repeating the stats band. */
function HeroFacts() {
  return (
    <aside className="hero-facts">
      <div className="tc-flip">
        {/* FRONT — card face */}
        <div className="trust-card tc-face tc-front">
        <div className="tc-top">
          <div className="tc-brand">
            <span className="tc-logo">TCT</span>
            <span className="tc-sub">DELIVERY PARTNER CARD</span>
          </div>
          <i className="bi bi-patch-check-fill tc-verified"></i>
        </div>

        <div className="tc-chip-row">
          <span className="tc-chip">
            <i className="bi bi-cpu-fill"></i>
          </span>
          <span className="tc-contactless">
            <i className="bi bi-wifi" style={{ transform: "rotate(90deg)" }}></i>
          </span>
        </div>

        <div className="tc-number">2019 · TND · 0641006</div>

        <div className="tc-meta">
          <div>
            <small>CARD HOLDER</small>
            <strong>TREND CODE TECHNOLOGY</strong>
          </div>
          <div>
            <small>VALID THRU</small>
            <strong>24/7 × 365</strong>
          </div>
        </div>

        <div className="tc-guarantees">
          <span><i className="bi bi-lightning-charge-fill"></i> Reply in 24 hrs</span>
          <span><i className="bi bi-cash-coin"></i> Transparent pricing</span>
          <span><i className="bi bi-shield-fill-check"></i> NDA on request</span>
        </div>

        <div className="tc-meter">
          <div className="tc-meter-head">
            <small>ON-TIME DELIVERY SCORE</small>
            <strong>98.4%</strong>
          </div>
          <div className="tc-meter-bar">
            <span style={{ width: "98.4%" }}></span>
          </div>
        </div>

        <div className="tc-bottom">
          <span className="tc-code">5417 · 8842 · TCT · 2019</span>
          <span className="tc-taps">
            <i className="bi bi-star-fill"></i>
            <i className="bi bi-star-fill"></i>
            <i className="bi bi-star-fill"></i>
            <i className="bi bi-star-fill"></i>
            <i className="bi bi-star-half"></i>
          </span>
        </div>
        <span className="tc-flip-hint">
          <i className="bi bi-arrow-repeat"></i> hover to flip
        </span>
      </div>

      {/* BACK — what you get when you partner with TCT */}
      <div className="trust-card tc-face tc-back">
        <div className="tc-top">
          <div className="tc-brand">
            <span className="tc-logo">TCT</span>
            <span className="tc-sub">WHY PARTNERS CHOOSE US</span>
          </div>
          <i className="bi bi-qr-code tc-verified" style={{ color: "#7da9f8", filter: "none" }}></i>
        </div>

        <ul className="tc-backlist">
          <li><i className="bi bi-rocket-takeoff-fill"></i><div><strong>Weekly demos</strong><small>See progress every sprint, not monthly</small></div></li>
          <li><i className="bi bi-people-fill"></i><div><strong>Dedicated team</strong><small>Same engineers own your project</small></div></li>
          <li><i className="bi bi-headset"></i><div><strong>24×7 support desk</strong><small>Phone answered at any hour</small></div></li>
          <li><i className="bi bi-graph-up-arrow"></i><div><strong>Growth mindset</strong><small>1,200+ clients scaled with us</small></div></li>
        </ul>

        <div className="tc-bottom tc-bottom-back">
          <Link to="/contact" className="btn btn-primary btn-sm tc-cta">
            Start a Project <i className="bi bi-arrow-right"></i>
          </Link>
          <span className="tc-code">EST. 2019</span>
        </div>
      </div>
    </div>

      <div className="trust-mini">
        <div className="tm-item">
          <i className="bi bi-geo-alt-fill"></i>
          <div>
            <strong>Ganapathy, Coimbatore</strong>
            <small>Visit our office anytime</small>
          </div>
        </div>
        <div className="tm-item">
          <i className="bi bi-telephone-fill"></i>
          <div>
            <strong>{COMPANY.phone}</strong>
            <small>Answered around the clock</small>
          </div>
        </div>
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
                <a href={`tel:${COMPANY.phoneRaw}`} className="btn btn-outline">
                  <i className="bi bi-telephone"></i> Call Us
                </a>
              </div>
            </Reveal>

            <Reveal delay={120}>
              <LiveDeliveryPanel />
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

      {/* ---------- Process (dark, curved journey timeline) ---------- */}
      <section className="section dark journey-section">
        <div className="container">
          <SectionHead
            eyebrow="How We Work"
            title="A Simple, Proven Delivery Process"
            text="Clear milestones, weekly demos and zero surprises from kickoff to launch."
          />
          <Journey steps={PROCESS} />
        </div>
      </section>

      {/* ---------- Tech stack ---------- */}
      <TechStack />

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
                    <p>{COMPANY.phone} (Call &amp; WhatsApp)</p>
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
      <CookieConsent />
    </>
  );
}
