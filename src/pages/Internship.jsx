import { useMemo, useRef, useState } from "react";
import { PageHero, Reveal } from "../components/Reveal.jsx";
import { COMPANY, INTERNSHIP_JDS } from "../data/content.js";
import { apiUrl } from "../config/site.js";

/*
 * Internships page in the same style as the careers pages: every internship
 * domain gets its own detailed JD accordion card, and a dedicated apply form
 * with resume upload. "Apply" on a card pre-selects that domain in the form
 * and scrolls to it. Domain keys mirror /api/internship/domains exactly.
 */

const DURATIONS = ["1 Month", "2 Months", "3 Months", "6 Months"];
const YEARS = ["1st Year", "2nd Year", "3rd Year", "Final Year", "Graduate"];

const PERKS = [
  { icon: "bi-mortarboard-fill", title: "Real project work", text: "Interns join live client projects with a mentor — not dummy tasks." },
  { icon: "bi-award-fill", title: "Certificate + LOR", text: "Completion certificate and letter of recommendation on good performance." },
  { icon: "bi-cash-coin", title: "Stipend for top performers", text: "High-performing interns get a monthly stipend and pre-placement offers." },
  { icon: "bi-laptop-fill", title: "Modern workspace", text: "Work from our Ganapathy office with team seating and high-speed internet." },
];

const STEPS = [
  { n: "1", title: "Pick a domain & apply", text: "Open the JD that fits you and fill the form with your resume." },
  { n: "2", title: "Screening call", text: "A short HR call within 3–5 working days." },
  { n: "3", title: "Task / interview", text: "A small domain task or technical chat." },
  { n: "4", title: "Offer letter", text: "Confirmed interns get an official offer." },
];

function InternshipJdCard({ domain, jd, open, onToggle, onApply }) {
  return (
    <div className="job-card">
      <button
        type="button"
        className="job-card-head"
        onClick={onToggle}
        aria-expanded={open}
      >
        <span className="job-card-title">{domain}</span>
        <span className="job-toggle">{open ? "−" : "+"}</span>
      </button>

      {open && (
        <div className="job-card-body">
          <table className="job-table">
            <tbody>
              <tr>
                <td>Qualification</td>
                <td>{jd.qualification}</td>
              </tr>
              <tr>
                <td>Skills You'll Learn</td>
                <td>{jd.skills}</td>
              </tr>
              <tr>
                <td>Tools</td>
                <td>{jd.tools}</td>
              </tr>
              <tr>
                <td>What You'll Do</td>
                <td>
                  <ul className="job-points">
                    {jd.description.map((d) => (
                      <li key={d}>{d}</li>
                    ))}
                  </ul>
                </td>
              </tr>
              <tr>
                <td>Duration</td>
                <td>{jd.duration}</td>
              </tr>
            </tbody>
          </table>
          <div className="job-card-foot">
            Interested in this domain?{" "}
            <button type="button" className="link-btn" onClick={onApply}>
              Apply for {domain} Internship <i className="bi bi-arrow-right"></i>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Internship() {
  const domains = useMemo(() => Object.keys(INTERNSHIP_JDS), []);
  const [openDomain, setOpenDomain] = useState(domains[0]);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    college: "",
    degree: "",
    year: "",
    domain: domains[0],
    duration: "",
    message: "",
  });
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState({ state: "idle", msg: "" });
  const [busy, setBusy] = useState(false);
  const applyRef = useRef(null);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const scrollToApply = (domain) => {
    setOpenDomain(domain);
    setForm((f) => ({ ...f, domain }));
    applyRef.current?.scrollIntoView({ block: "start" });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setStatus({ state: "idle", msg: "" });
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (file) fd.append("resume", file);

      const res = await fetch(apiUrl("/api/internship"), { method: "POST", body: fd });
      const body = await res.json().catch(() => null);
      if (!res.ok) throw new Error(body?.error || `Request failed (${res.status})`);

      setStatus({ state: "ok", msg: body.message || "Application received!" });
      setForm({ name: "", email: "", phone: "", college: "", degree: "", year: "", domain: domains[0], duration: "", message: "" });
      setFile(null);
      e.target.reset();
    } catch (err) {
      setStatus({ state: "err", msg: err.message || "Something went wrong." });
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <PageHero
        eyebrow="Internships"
        title="Kickstart Your Career With a TCT Internship"
        text="Hands-on internships in development, marketing, design and BPO for students and freshers — mentored, certified and occasionally paid."
        crumb="Internships"
      />

      {/* Perks */}
      <section className="section" style={{ paddingBottom: 30 }}>
        <div className="container">
          <div className="grid-4">
            {PERKS.map((p, i) => (
              <Reveal key={p.title} delay={i * 80}>
                <div className="card" style={{ height: "100%" }}>
                  <div className="icon"><i className={`bi ${p.icon}`}></i></div>
                  <h3 style={{ fontSize: "1rem" }}>{p.title}</h3>
                  <p style={{ fontSize: 13.5 }}>{p.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Domains (JD accordion) + dedicated apply form */}
      <section className="section" style={{ paddingTop: 10 }}>
        <div className="container">
          <div className="careers-grid">
            <div>
              <h2 className="careers-col-title">
                <i className="bi bi-briefcase"></i> Internship Domains
              </h2>
              <div className="job-list">
                {domains.map((d, i) => (
                  <Reveal key={d} delay={i * 60}>
                    <InternshipJdCard
                      domain={d}
                      jd={INTERNSHIP_JDS[d]}
                      open={openDomain === d}
                      onToggle={() => setOpenDomain((cur) => (cur === d ? null : d))}
                      onApply={() => scrollToApply(d)}
                    />
                  </Reveal>
                ))}
              </div>
            </div>

            <div ref={applyRef}>
              <h2 className="careers-col-title">
                <i className="bi bi-send"></i> Apply for Internship
              </h2>
              <form className="form-card apply-form" onSubmit={onSubmit}>
                {status.state === "ok" && (
                  <div className="banner ok"><i className="bi bi-check-circle me-1"></i> {status.msg}</div>
                )}
                {status.state === "err" && (
                  <div className="banner err"><i className="bi bi-exclamation-triangle me-1"></i> {status.msg}</div>
                )}

                <div className="form-row two">
                  <div className="field">
                    <label htmlFor="in-name">Full Name *</label>
                    <input id="in-name" type="text" required value={form.name} onChange={set("name")} placeholder="Your full name" />
                  </div>
                  <div className="field">
                    <label htmlFor="in-phone">WhatsApp Number *</label>
                    <input id="in-phone" type="tel" required value={form.phone} onChange={set("phone")} placeholder="+91 ..." />
                  </div>
                </div>

                <div className="field">
                  <label htmlFor="in-email">Email *</label>
                  <input id="in-email" type="email" required value={form.email} onChange={set("email")} placeholder="you@example.com" />
                </div>

                <div className="form-row two">
                  <div className="field">
                    <label htmlFor="in-college">College / Institution *</label>
                    <input id="in-college" type="text" required value={form.college} onChange={set("college")} placeholder="e.g. PSG Tech, Coimbatore" />
                  </div>
                  <div className="field">
                    <label htmlFor="in-degree">Degree / Department</label>
                    <input id="in-degree" type="text" value={form.degree} onChange={set("degree")} placeholder="e.g. B.E. CSE" />
                  </div>
                </div>

                <div className="form-row two">
                  <div className="field">
                    <label htmlFor="in-year">Year of Study *</label>
                    <select id="in-year" required value={form.year} onChange={set("year")}>
                      <option value="">Select year</option>
                      {YEARS.map((y) => (
                        <option key={y} value={y}>{y}</option>
                      ))}
                    </select>
                  </div>
                  <div className="field">
                    <label htmlFor="in-dur">Preferred Duration *</label>
                    <select id="in-dur" required value={form.duration} onChange={set("duration")}>
                      <option value="">Select duration</option>
                      {DURATIONS.map((d) => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="field">
                  <label htmlFor="in-domain">Internship Domain *</label>
                  <select
                    id="in-domain"
                    required
                    value={form.domain}
                    onChange={(e) => {
                      set("domain")(e);
                      setOpenDomain(e.target.value);
                    }}
                  >
                    {domains.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                <div className="field">
                  <label htmlFor="in-res">Upload Resume * (PDF / DOC, max 5 MB)</label>
                  <input
                    id="in-res"
                    type="file"
                    required
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                  />
                </div>

                <div className="field">
                  <label htmlFor="in-msg">Anything we should know? (optional)</label>
                  <textarea
                    id="in-msg"
                    rows={3}
                    value={form.message}
                    onChange={set("message")}
                    placeholder="Skills, links to your work, availability…"
                  ></textarea>
                </div>

                <div className="form-buttons">
                  <button className="btn btn-primary" disabled={busy}>
                    {busy ? "Submitting…" : "Submit Application"}
                    {!busy && <i className="bi bi-arrow-right"></i>}
                  </button>
                  <button
                    type="reset"
                    className="btn btn-outline"
                    onClick={() => setStatus({ state: "idle", msg: "" })}
                  >
                    Cancel
                  </button>
                </div>

                <p className="form-note">
                  <i className="bi bi-shield-lock me-1"></i>
                  Your details stay private — HR replies within 3–5 working days. Questions?{" "}
                  <a href={`tel:${COMPANY.phoneRaw}`}>{COMPANY.phone}</a>
                </p>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* How it works + who can apply */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="internship-grid">
            <div>
              <h2 className="careers-col-title"><i className="bi bi-signpost-2"></i> How It Works</h2>
              <div className="isteps">
                {STEPS.map((s) => (
                  <div className="istep" key={s.n}>
                    <span className="istep-n">{s.n}</span>
                    <div>
                      <strong>{s.title}</strong>
                      <p>{s.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="info-card">
                <h3 style={{ fontSize: "1.05rem", marginBottom: 8 }}>
                  <i className="bi bi-people-fill"></i> Who can apply?
                </h3>
                <ul className="checklist" style={{ marginTop: 6 }}>
                  <li><i className="bi bi-check-circle-fill"></i> Students from any degree (2nd year onwards)</li>
                  <li><i className="bi bi-check-circle-fill"></i> Freshers within 1 year of graduation</li>
                  <li><i className="bi bi-check-circle-fill"></i> Basic communication and willingness to learn</li>
                </ul>
                <p style={{ margin: "14px 0 0", fontSize: 13.5, color: "var(--muted)" }}>
                  Questions? Call <a href={`tel:${COMPANY.phoneRaw}`}>{COMPANY.phone}</a> or email{" "}
                  <a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
