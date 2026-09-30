import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { PageHero } from "../components/Reveal.jsx";
import {
  clearSession,
  getApplications,
  getAuthLog,
  getInternships,
  getLeads,
  getSavedUser,
  postLogout,
} from "../api.js";

function fmtDate(iso) {
  try {
    return new Date(iso).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

function ApplicationsTable({ rows }) {
  if (!rows.length) {
    return (
      <div className="admin-empty">
        <i className="bi bi-inbox"></i> No applications yet.
      </div>
    );
  }
  return (
    <div className="admin-table-wrap">
      <table className="admin-table">
        <thead>
          <tr>
            <th>Applied</th>
            <th>Candidate</th>
            <th>Contact</th>
            <th>Position</th>
            <th>Experience</th>
            <th>GitHub</th>
            <th>Resume</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((a) => (
            <tr key={a.id}>
              <td className="admin-date">{fmtDate(a.createdAt)}</td>
              <td>
                <strong>{a.name}</strong>
                {a.coverLetter && (
                  <p className="admin-note" title={a.coverLetter}>
                    “{a.coverLetter.slice(0, 80)}
                    {a.coverLetter.length > 80 ? "…" : ""}”
                  </p>
                )}
              </td>
              <td>
                <a href={`mailto:${a.email}`}>{a.email}</a>
                <br />
                <a href={`tel:${a.phone}`}>{a.phone || "—"}</a>
              </td>
              <td>{a.position}</td>
              <td>{a.experience}</td>
              <td>
                {a.github ? (
                  <a href={a.github} target="_blank" rel="noopener noreferrer">
                    profile
                  </a>
                ) : (
                  "—"
                )}
              </td>
              <td>
                {a.resumeUrl ? (
                  <a className="btn btn-outline btn-sm" href={a.resumeUrl} download>
                    <i className="bi bi-download"></i> Resume
                  </a>
                ) : (
                  "—"
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function InternshipsTable({ rows }) {
  if (!rows.length) {
    return (
      <div className="admin-empty">
        <i className="bi bi-inbox"></i> No internship applications yet.
      </div>
    );
  }
  return (
    <div className="admin-table-wrap">
      <table className="admin-table">
        <thead>
          <tr>
            <th>Applied</th>
            <th>Candidate</th>
            <th>Contact</th>
            <th>College</th>
            <th>Domain</th>
            <th>Duration</th>
            <th>Resume</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((a) => (
            <tr key={a.id}>
              <td className="admin-date">{fmtDate(a.createdAt)}</td>
              <td>
                <strong>{a.name}</strong>
                <p className="admin-note">
                  {a.degree || "—"} · {a.year || "—"}
                  {a.message ? ` · “${a.message.slice(0, 60)}${a.message.length > 60 ? "…" : ""}”` : ""}
                </p>
              </td>
              <td>
                <a href={`mailto:${a.email}`}>{a.email}</a>
                <br />
                <a href={`tel:${a.phone}`}>{a.phone}</a>
              </td>
              <td>{a.college}</td>
              <td>{a.domain}</td>
              <td>{a.duration || "—"}</td>
              <td>
                {a.resumeUrl ? (
                  <a className="btn btn-outline btn-sm" href={a.resumeUrl} download>
                    <i className="bi bi-download"></i> Resume
                  </a>
                ) : (
                  "—"
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const EVENT_META = {
  login: { icon: "bi-box-arrow-in-right", label: "Login", cls: "ok" },
  logout: { icon: "bi-box-arrow-left", label: "Logout", cls: "muted" },
  failed: { icon: "bi-shield-exclamation", label: "Failed attempt", cls: "err" },
};

function AuthLogTable({ rows }) {
  if (!rows.length) {
    return (
      <div className="admin-empty">
        <i className="bi bi-clock-history"></i> No login activity recorded yet.
      </div>
    );
  }
  return (
    <div className="admin-table-wrap">
      <table className="admin-table">
        <thead>
          <tr>
            <th>Time</th>
            <th>Event</th>
            <th>Email used</th>
            <th>Device</th>
            <th>IP address</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((e) => {
            const meta = EVENT_META[e.type] || EVENT_META.failed;
            return (
              <tr key={e.id}>
                <td className="admin-date">{fmtDate(e.createdAt)}</td>
                <td>
                  <span className={`authpill ${meta.cls}`}>
                    <i className={`bi ${meta.icon}`}></i> {meta.label}
                  </span>
                </td>
                <td>{e.email || "—"}</td>
                <td>{e.deviceSummary}</td>
                <td className="admin-date">{e.ip || "—"}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function LeadsTable({ rows }) {
  if (!rows.length) {
    return (
      <div className="admin-empty">
        <i className="bi bi-inbox"></i> No enquiries yet.
      </div>
    );
  }
  return (
    <div className="admin-table-wrap">
      <table className="admin-table">
        <thead>
          <tr>
            <th>Received</th>
            <th>Name</th>
            <th>Contact</th>
            <th>Service</th>
            <th>Message</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((l) => (
            <tr key={l.id}>
              <td className="admin-date">{fmtDate(l.createdAt)}</td>
              <td>
                <strong>{l.name}</strong>
              </td>
              <td>
                <a href={`mailto:${l.email}`}>{l.email}</a>
                <br />
                <a href={`tel:${l.phone}`}>{l.phone || "—"}</a>
              </td>
              <td>{l.service || "—"}</td>
              <td className="admin-msg">{l.message}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function Admin() {
  // Start locked; only a successful server check unlocks the dashboard.
  // (Trusting localStorage alone let anyone with devtools open /admin.)
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);
  const [tab, setTab] = useState("applications");
  const [apps, setApps] = useState(null);
  const [leads, setLeads] = useState(null);
  const [authlog, setAuthlog] = useState(null);
  const [interns, setInterns] = useState(null);
  const [error, setError] = useState("");

  const load = () => {
    setError("");
    getApplications()
      .then(setApps)
      .catch((e) => setError(e.message));
    getLeads()
      .then(setLeads)
      .catch(() => {});
    getAuthLog()
      .then(setAuthlog)
      .catch(() => {});
    getInternships()
      .then(setInterns)
      .catch(() => {});
  };

  // Verify the saved token against the server before showing anything.
  useEffect(() => {
    let alive = true;
    const saved = getSavedUser();
    if (!saved) {
      setChecking(false);
      return;
    }
    getApplications()
      .then(() => {
        if (alive) {
          setUser(saved);
          setChecking(false);
          load();
        }
      })
      .catch(() => {
        if (alive) {
          clearSession();
          setChecking(false);
        }
      });
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const signOut = () => {
    postLogout().catch(() => {}); // record logout event server-side
    clearSession();
    setUser(null);
  };

  if (checking) {
    return (
      <div className="section admin-guard">
        <div className="container" style={{ textAlign: "center" }}>
          <div className="admin-empty">
            <i className="bi bi-hourglass-split"></i> Checking session…
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="section admin-guard">
        <div className="container" style={{ textAlign: "center" }}>
          <div className="info-card" style={{ maxWidth: 520, margin: "0 auto" }}>
            <div className="icon" style={{ margin: "0 auto 14px" }}>
              <i className="bi bi-shield-lock"></i>
            </div>
            <h2 style={{ marginBottom: 8 }}>Admin area</h2>
            <p style={{ color: "var(--muted)", marginBottom: 22 }}>
              Please sign in with the admin account to view job applications
              and enquiries.
            </p>
            <Link to="/login" className="btn btn-primary btn-lg">
              Go to Sign In <i className="bi bi-box-arrow-in-right"></i>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <PageHero
        eyebrow="TCT Admin"
        title="Applications & Enquiries"
        text="Signed in as admin — review job applicants, download resumes and read website enquiries."
        crumb="Admin"
      />

      <section className="section" style={{ paddingTop: 34 }}>
        <div className="container">
          <div className="admin-bar">
            <div className="tech-tabs" role="tablist" style={{ margin: 0 }}>
              <button
                role="tab"
                aria-selected={tab === "applications"}
                className={`tech-tab ${tab === "applications" ? "active" : ""}`}
                onClick={() => setTab("applications")}
              >
                <i className="bi bi-briefcase me-1"></i> Job Applications
                {apps && <span className="admin-count">{apps.length}</span>}
              </button>
              <button
                role="tab"
                aria-selected={tab === "leads"}
                className={`tech-tab ${tab === "leads" ? "active" : ""}`}
                onClick={() => setTab("leads")}
              >
                <i className="bi bi-envelope me-1"></i> Quote Enquiries
                {leads && <span className="admin-count">{leads.length}</span>}
              </button>
              <button
                role="tab"
                aria-selected={tab === "interns"}
                className={`tech-tab ${tab === "interns" ? "active" : ""}`}
                onClick={() => setTab("interns")}
              >
                <i className="bi bi-mortarboard me-1"></i> Internships
                {interns && <span className="admin-count">{interns.length}</span>}
              </button>
              <button
                role="tab"
                aria-selected={tab === "authlog"}
                className={`tech-tab ${tab === "authlog" ? "active" : ""}`}
                onClick={() => setTab("authlog")}
              >
                <i className="bi bi-clock-history me-1"></i> Login Activity
              </button>
            </div>
            <div className="admin-bar-actions">
              <button className="btn btn-outline btn-sm" onClick={load}>
                <i className="bi bi-arrow-clockwise"></i> Refresh
              </button>
              <button className="btn btn-outline btn-sm" onClick={signOut}>
                <i className="bi bi-box-arrow-right"></i> Sign out
              </button>
            </div>
          </div>

          {error && (
            <div className="banner err" style={{ marginBottom: 16 }}>
              <i className="bi bi-exclamation-triangle me-1"></i> {error}
            </div>
          )}

          {tab === "applications" ? (
            apps === null ? (
              <div className="admin-empty">
                <i className="bi bi-hourglass-split"></i> Loading…
              </div>
            ) : (
              <ApplicationsTable rows={apps} />
            )
          ) : tab === "leads" ? (
            leads === null ? (
              <div className="admin-empty">
                <i className="bi bi-hourglass-split"></i> Loading…
              </div>
            ) : (
              <LeadsTable rows={leads} />
            )
          ) : tab === "interns" ? (
            interns === null ? (
              <div className="admin-empty">
                <i className="bi bi-hourglass-split"></i> Loading…
              </div>
            ) : (
              <InternshipsTable rows={interns} />
            )
          ) : authlog === null ? (
            <div className="admin-empty">
              <i className="bi bi-hourglass-split"></i> Loading…
            </div>
          ) : (
            <AuthLogTable rows={authlog} />
          )}
        </div>
      </section>
    </>
  );
}
