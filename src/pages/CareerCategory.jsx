import { useMemo, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Reveal, SectionHead, PageHero } from "../components/Reveal.jsx";
import JobListings from "../components/JobListings.jsx";
import { CAREERS, COMPANY, JOB_LISTINGS, ROLE_JDS } from "../data/content.js";

const ROLE_META = {
  "Web Designing": { icon: "bi-vector-pen", text: "Craft clean, responsive interfaces and design systems in Figma and code." },
  "Web Development": { icon: "bi-globe2", text: "Build fast, full-stack web apps with React and Node on real client projects." },
  "Digital Marketing": { icon: "bi-megaphone", text: "Run SEO, ads and social campaigns — and prove impact with analytics." },
  "Software Development": { icon: "bi-code-slash", text: "Engineer custom applications end to end, from APIs to deployment." },
  "Machine Learning": { icon: "bi-graph-up-arrow", text: "Train, evaluate and ship ML models that solve real business problems." },
  "Data Entry": { icon: "bi-keyboard", text: "Keep client records accurate and fast with multi-level quality checks." },
  "Voice Process": { icon: "bi-headset", text: "Own customer conversations on support, retention and sales calls." },
};

const EXPERIENCE_OPTIONS = ["Fresher", "1-2 Years", "2-5 Years", "5+ Years"];

/* Expandable role card with full JD + per-role dedicated apply form */
function RoleCard({ role, onApply, defaultOpen }) {
  const meta = ROLE_META[role] || { icon: "bi-briefcase", text: "Join our growing team." };
  const jd = ROLE_JDS[role];
  const [open, setOpen] = useState(!!defaultOpen);

  return (
    <Reveal>
      <div className="job-card">
        <button
          type="button"
          className="job-card-head"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
        >
          <span className="job-card-title">
            <i className={`bi ${meta.icon} role-ic`}></i> {role}
          </span>
          <span className="job-toggle">{open ? "−" : "+"}</span>
        </button>

        <p className="role-blurb">{meta.text}</p>

        {open && jd && (
          <div className="job-card-body">
            <table className="job-table">
              <tbody>
                <tr>
                  <td>Qualification</td>
                  <td>{jd.qualification}</td>
                </tr>
                <tr>
                  <td>Skills Required</td>
                  <td>{jd.skills}</td>
                </tr>
                <tr>
                  <td>Tools</td>
                  <td>{jd.tools}</td>
                </tr>
                <tr>
                  <td>Job Description</td>
                  <td>
                    <ul className="job-points">
                      {jd.description.map((d) => (
                        <li key={d}>{d}</li>
                      ))}
                    </ul>
                  </td>
                </tr>
                <tr>
                  <td>Experience</td>
                  <td>{jd.experience}</td>
                </tr>
              </tbody>
            </table>
            <div className="job-card-foot">
              Excited about this role?{" "}
              <button type="button" className="link-btn" onClick={() => onApply(role)}>
                Apply for {role} <i className="bi bi-arrow-right"></i>
              </button>
            </div>
          </div>
        )}

        {open && !jd && (
          <div className="job-card-body">
            <div className="job-card-foot">
              This role doesn't have a detailed JD yet —{" "}
              <Link className="link-btn" to={`/contact?role=${encodeURIComponent(role)}`}>
                apply via the contact form
              </Link>
              .
            </div>
          </div>
        )}
      </div>
    </Reveal>
  );
}

/* Dedicated apply form with resume upload for the non-listed tracks */
function TrackApplyForm({ roles }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    position: roles[0] || "",
    experience: "",
    github: "",
    coverLetter: "",
  });
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState({ state: "idle", msg: "" });
  const [busy, setBusy] = useState(false);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setStatus({ state: "idle", msg: "" });
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (file) fd.append("resume", file);

      const res = await fetch("/api/apply", { method: "POST", body: fd });
      const body = await res.json().catch(() => null);
      if (!res.ok) throw new Error(body?.error || `Request failed (${res.status})`);

      setStatus({ state: "ok", msg: body.message || "Application received!" });
      setForm({
        name: "",
        email: "",
        phone: "",
        position: roles[0] || "",
        experience: "",
        github: "",
        coverLetter: "",
      });
      setFile(null);
      e.target.reset();
    } catch (err) {
      setStatus({ state: "err", msg: err.message || "Something went wrong." });
    } finally {
      setBusy(false);
    }
  };

  return (
    <form className="form-card apply-form" onSubmit={onSubmit}>
      <h3 style={{ marginBottom: 16 }}>Apply Now</h3>

      {status.state === "ok" && (
        <div className="banner ok">
          <i className="bi bi-check-circle me-1"></i> {status.msg}
        </div>
      )}
      {status.state === "err" && (
        <div className="banner err">
          <i className="bi bi-exclamation-triangle me-1"></i> {status.msg}
        </div>
      )}

      <div className="field">
        <label htmlFor="tr-name">Full Name *</label>
        <input id="tr-name" type="text" required value={form.name} onChange={set("name")} placeholder="Enter your full name" />
      </div>

      <div className="field">
        <label htmlFor="tr-phone">Contact Number *</label>
        <input id="tr-phone" type="tel" required value={form.phone} onChange={set("phone")} placeholder="Enter your mobile number" />
      </div>

      <div className="field">
        <label htmlFor="tr-email">Email Address *</label>
        <input id="tr-email" type="email" required value={form.email} onChange={set("email")} placeholder="Enter your email" />
      </div>

      <div className="form-row two">
        <div className="field">
          <label htmlFor="tr-pos">Position Applying For *</label>
          <select id="tr-pos" required value={form.position} onChange={set("position")}>
            {roles.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="tr-exp">Years of Experience *</label>
          <select id="tr-exp" required value={form.experience} onChange={set("experience")}>
            <option value="">Select experience</option>
            {EXPERIENCE_OPTIONS.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="field">
        <label htmlFor="tr-res">Upload Resume * (PDF / DOC, max 5 MB)</label>
        <input
          id="tr-res"
          type="file"
          required
          accept=".pdf,.doc,.docx"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
        />
      </div>

      <div className="field">
        <label htmlFor="tr-gh">GitHub / Portfolio Link</label>
        <input
          id="tr-gh"
          type="url"
          value={form.github}
          onChange={set("github")}
          placeholder="https://github.com/yourname or your portfolio"
        />
      </div>

      <div className="field">
        <label htmlFor="tr-cl">About Yourself (optional)</label>
        <textarea
          id="tr-cl"
          rows={4}
          value={form.coverLetter}
          onChange={set("coverLetter")}
          placeholder="Tell us a bit about yourself and your goals…"
        ></textarea>
      </div>

      <div className="form-buttons">
        <button className="btn btn-primary" disabled={busy}>
          {busy ? "Submitting…" : "Submit Application"}
          {!busy && <i className="bi bi-arrow-right"></i>}
        </button>
        <button type="reset" className="btn btn-outline" onClick={() => setStatus({ state: "idle", msg: "" })}>
          Cancel
        </button>
      </div>

      <p className="form-note">
        <i className="bi bi-shield-lock me-1"></i>
        Your details stay private — HR replies within a few working days. Questions?{" "}
        <a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a>
      </p>
    </form>
  );
}

export default function CareerCategory() {
  const { track } = useParams();
  const cat = CAREERS[track];
  const applyRef = useRef(null);
  const roles = cat?.roles || [];

  const curated = JOB_LISTINGS[track]?.jobs.map((j) => j.title) || [];
  const extraRoles = roles.filter(
    (r) => !curated.includes(r) && ROLE_JDS[r]
  );

  const setFormRef = useMemo(() => ({ current: null }), []);

  const scrollToApply = (role) => {
    // pre-select the role in the track apply form, then scroll to it
    applyRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    const select = applyRef.current?.querySelector("select");
    if (select) {
      const setter = setFormRef.current;
      if (setter) setter(role);
      select.value = role;
      select.dispatchEvent(new Event("change", { bubbles: true }));
    }
  };

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

      {/* Tracks with curated multi-role listings (web dev / non-it) keep the
          dedicated JobListings layout — plus any extra roles that only have
          per-role JDs (the remaining IT roles). */}
      {JOB_LISTINGS[track] ? (
        <>
          <JobListings
            trackTitle={track === "it" ? "IT" : cat.title}
            intro={JOB_LISTINGS[track].intro}
            jobs={JOB_LISTINGS[track].jobs}
            showGithubField={track === "it"}
          />
          {extraRoles.length > 0 && (
            <section className="section" style={{ paddingTop: 0 }}>
              <div className="container">
                <SectionHead
                  eyebrow="More IT Roles"
                  title="Other Openings on the IT Team"
                  text="Click a role to see the full job description, then apply below with your resume."
                />
                <div className="job-list" style={{ maxWidth: 860, margin: "0 auto" }}>
                  {extraRoles.map((r, i) => (
                    <RoleCard key={r} role={r} onApply={scrollToApply} defaultOpen={i === 0} />
                  ))}
                </div>
              </div>
            </section>
          )}
          {extraRoles.length > 0 && (
            <section className="section" style={{ paddingTop: 10 }}>
              <div className="container" ref={applyRef} style={{ maxWidth: 860 }}>
                <TrackApplyForm roles={extraRoles} />
              </div>
            </section>
          )}
        </>
      ) : (
        <>
          <section className="section" style={{ paddingBottom: 30 }}>
            <div className="container">
              <SectionHead
                eyebrow="Open Roles"
                title="Pick a Role, Start a Conversation"
                text="Click a role to see the full job description, then apply below with your resume."
              />
              <div className="job-list" style={{ maxWidth: 860, margin: "0 auto" }}>
                {roles.map((r, i) => (
                  <RoleCard key={r} role={r} onApply={scrollToApply} defaultOpen={i === 0} />
                ))}
              </div>
            </div>
          </section>

          <section className="section" style={{ paddingTop: 10 }}>
            <div className="container" ref={applyRef} style={{ maxWidth: 860 }}>
              <TrackApplyForm roles={roles} />
            </div>
          </section>
        </>
      )}
    </>
  );
}
