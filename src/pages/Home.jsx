import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Reveal, SectionHead, useCountUp } from "../components/Reveal.jsx";
import SiteShowcase from "../components/SiteShowcase.jsx";
import QuoteForm from "../components/QuoteForm.jsx";
import ToTop from "../components/ToTop.jsx";
import CookieConsent from "../components/CookieConsent.jsx";
import Journey from "../components/Journey.jsx";
import TechStack from "../components/TechStack.jsx";
import TeamCard, { TEAM } from "../components/TeamCard.jsx";
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
        <span className="dp-title">TCT — Live Delivery Feed</span>
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

/* 9 client logos — originals live in /clients, served from /public/clients.
   Drop more files in public/clients/ and add them to this list. */
const CLIENT_LOGOS = Array.from(
  { length: 9 },
  (_, i) => `/clients/vendor-${i + 1}.jpg`
);
const CLIENT_ROWS = [CLIENT_LOGOS.slice(0, 5), CLIENT_LOGOS.slice(5)];

function MarqueeRow({ logos, duration = 30, reverse = false }) {
  return (
    <div
      className={`cl-row${reverse ? " rev" : ""}`}
      style={{ "--cl-dur": `${duration}s` }}
    >
      <div className="cl-track">
        {[logos, logos].map((group, gi) => (
          <div className="cl-group" key={gi} aria-hidden={gi === 1}>
            {group.map((src, i) => (
              <div className="cl-card" key={`${gi}-${i}`}>
                <img
                  src={src}
                  alt={`Trend Code Technology client partner logo ${i + 1}`}
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

/* Bottom-of-home client showcase — two infinite logo marquee rows that
   scroll in opposite directions, pause on hover and pop into full colour. */
function ClientsShowcase() {
  return (
    <section className="section soft clients-section">
      <div className="container">
        <SectionHead
          eyebrow="Our Clients"
          title="Brands That Trust Trend Code Technology"
          text="From manufacturing floors to retail counters — a glimpse of the businesses we deliver for every day."
        />
      </div>
      <div className="cl-rows">
        <MarqueeRow logos={CLIENT_ROWS[0]} duration={32} />
        <MarqueeRow logos={CLIENT_ROWS[1]} duration={36} reverse />
      </div>
      <div className="container">
        <p className="cl-note">
          …and <strong>1,200+ more businesses</strong> across Tamil Nadu run on
          TCT.
        </p>
      </div>
    </section>
  );
}

/* ---------- Home hero — full-bleed background video ---------- */
const HERO_COPY = {
  eyebrow: "Creative & Innovative",
  text:
    "Software, websites and apps built in Coimbatore — one team, shipping since 2019.",
};

/* Phones get their own, lighter clip (≈3.6 MB instead of ≈5.2 MB) so the
   background still starts quickly on 4G. Desktops get the longer cut. */
const HERO_CLIP = {
  desktop: "/hero/hero-bg.mp4",
  mobile: "/hero/hero-bg-mobile.mp4",
};
const HERO_FRAME = {
  desktop: "/hero/hero-poster.jpg",
  mobile: "/hero/hero-poster-mobile.jpg",
};

/* Background video is a progressive enhancement: it is skipped on data-saver
   connections and whenever the visitor asks for reduced motion — the poster
   still is shown instead. Mobile is NOT skipped any more: iOS/Android only
   need `muted` + `playsInline` (both present below) to autoplay. */
function HeroMedia() {
  const videoRef = useRef(null);
  const [media, setMedia] = useState({ src: null, poster: HERO_FRAME.desktop });

  useEffect(() => {
    const reduceMq = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    const smallMq = window.matchMedia?.("(max-width: 720px)");
    const apply = () => {
      const key = smallMq?.matches ? "mobile" : "desktop";
      const saveData = navigator.connection?.saveData === true;
      const skip = Boolean(reduceMq?.matches) || saveData;
      setMedia((current) => {
        const next = { src: skip ? null : HERO_CLIP[key], poster: HERO_FRAME[key] };
        return current.src === next.src && current.poster === next.poster ? current : next;
      });
    };
    apply();
    /* Crossing the phone breakpoint (rotate, resize, desktop window) must swap
       the clip instead of leaving the visitor on the wrong one. */
    const onChange = () => apply();
    smallMq?.addEventListener?.("change", onChange);
    reduceMq?.addEventListener?.("change", onChange);
    return () => {
      smallMq?.removeEventListener?.("change", onChange);
      reduceMq?.removeEventListener?.("change", onChange);
    };
  }, []);

  /* Autoplay is best-effort: iOS low-power mode and the first-load race can
     still refuse it. Retry on the first interaction, and once more when the
     tab becomes visible again, instead of dropping the video. */
  useEffect(() => {
    const el = videoRef.current;
    if (!media.src || !el) return undefined;
    el.defaultMuted = true;
    el.muted = true;
    const retry = () => {
      if (!el.paused) return;
      const attempt = el.play?.();
      if (attempt && typeof attempt.catch === "function") attempt.catch(() => {});
    };
    const start = el.play?.();
    if (start && typeof start.catch === "function") start.catch(() => {});
    el.addEventListener("loadeddata", retry);
    el.addEventListener("canplay", retry);
    window.addEventListener("pointerdown", retry);
    window.addEventListener("keydown", retry);
    window.addEventListener("touchstart", retry);
    document.addEventListener("visibilitychange", retry);
    return () => {
      el.removeEventListener("loadeddata", retry);
      el.removeEventListener("canplay", retry);
      window.removeEventListener("pointerdown", retry);
      window.removeEventListener("keydown", retry);
      window.removeEventListener("touchstart", retry);
      document.removeEventListener("visibilitychange", retry);
    };
  }, [media.src]);

  return (
    <div className={`hero-media${media.src ? " has-video" : ""}`} aria-hidden="true">
      <img
        className="hero-poster"
        src={media.poster}
        alt=""
        width="1280"
        height="720"
      />
      {/* The poster frame above covers the wait, so the video never needs a
          fade — it simply paints over it once it has data. */}
      {media.src ? (
        <video
          ref={videoRef}
          className="hero-video"
          src={media.src}
          poster={media.poster}
          muted
          loop
          playsInline
          webkit-playsinline=""
          x5-playsinline=""
          disablePictureInPicture
          autoPlay
          preload="auto"
          tabIndex={-1}
          onError={() => setMedia((m) => ({ ...m, src: null }))}
        ></video>
      ) : null}
      <span className="hero-shade"></span>
    </div>
  );
}

/* Credibility line under the hero buttons — plain facts already stated
   elsewhere on the site, kept in one visual row. */
const HERO_TRUST = [
  { icon: "bi-patch-check-fill", label: "6+ years in business" },
  { icon: "bi-kanban-fill", label: "1,150+ projects delivered" },
  { icon: "bi-geo-alt-fill", label: "Coimbatore · serving all of India" },
];

function HeroSection() {
  return (
    <section className="hero-live" aria-label="Trend Code Technology highlights">
      <HeroMedia />
      <div className="container hero-live-inner">
        <span className="eyebrow on-dark">{HERO_COPY.eyebrow}</span>
        <h1 className="hero-live-title">
          Empowering Brands with Smart, Stunning &amp;{" "}
          <span className="hero-grad">Scalable</span> Digital Experiences
        </h1>
        <p className="hero-live-text">{HERO_COPY.text}</p>
        <div className="hero-live-actions">
          <Link to="/contact" className="btn btn-primary btn-lg">
            Get Free Quote <i className="bi bi-arrow-right"></i>
          </Link>
          <Link to="/contact" className="btn btn-lg hs-ghost">
            Contact Us
          </Link>
        </div>
        <ul className="hero-trust">
          {HERO_TRUST.map((t) => (
            <li key={t.label}>
              <i className={`bi ${t.icon}`}></i>
              {t.label}
            </li>
          ))}
        </ul>
        <SiteShowcase variant="hero" />
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <>
      {/* ---------- Hero (background video + sister-site showcase) ---------- */}
      <HeroSection />

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
                The Best IT Solution With 6 Years of Experience
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
      <section className="section soft why-choose-section">
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
                  <div className="svc-icon" style={{ "--tint": s.tint }}>
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <path d={s.glyph} />
                    </svg>
                  </div>
                  <h3>{s.title}</h3>
                  <p>{s.blurb}</p>
                  <Link className="more" to={`/services/${s.slug}`}>
                    Learn More <i className="bi bi-arrow-right"></i>
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
                Technology Services Built Around Your Business
              </h2>
              <p style={{ color: "var(--muted)", maxWidth: 760, margin: "0 auto" }}>
                Trend Code Technology provides software development, website
                design, digital marketing, BPO and HR services from Coimbatore,
                with more than 6 years of experience supporting business teams.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ---------- Leadership (CEO & MD) ---------- */}
      <section className="section">
        <div className="container">
          <SectionHead
            eyebrow="Leadership"
            title="Meet the People Leading Trend Code Technology"
            text="Hands-on leadership — every project gets direct attention from the top."
          />
          <div className="team-grid">
            {TEAM.map((m, i) => (
              <Reveal key={m.name} delay={i * 110}>
                <TeamCard member={m} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- Clients (animated logo marquee) ---------- */}
      <ClientsShowcase />

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
