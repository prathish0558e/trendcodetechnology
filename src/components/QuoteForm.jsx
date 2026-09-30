import { useEffect, useState } from "react";
import { postLead } from "../api.js";

const SERVICES_OPTIONS = [
  "Web Development",
  "Software Development",
  "App Development",
  "Digital Marketing",
  "UI / UX Design",
  "ML / Python",
  "IoT Solutions",
  "Cloud Computing",
  "Data Entry",
  "Voice Process",
  "Other",
];

export default function QuoteForm({ prefillMessage = "" }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    service: "",
    message: prefillMessage,
  });

  // Keep the message in sync when a prefill (e.g. job role) changes
  useEffect(() => {
    if (prefillMessage) {
      setForm((f) => ({ ...f, message: prefillMessage }));
    }
  }, [prefillMessage]);

  const [status, setStatus] = useState({ state: "idle", msg: "" });
  const [busy, setBusy] = useState(false);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setStatus({ state: "idle", msg: "" });
    try {
      const res = await postLead(form);
      setStatus({
        state: "ok",
        msg:
          res.message ||
          "Thanks! Your request reached our team — we'll reply within 24 hours.",
      });
      setForm({ name: "", email: "", phone: "", service: "", message: "" });
    } catch (err) {
      setStatus({
        state: "err",
        msg: err.message || "Something went wrong. Please try again.",
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <form className="form-card" onSubmit={onSubmit} noValidate>
      <h3 style={{ marginBottom: 18 }}>Request a Free Quote</h3>

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

      <div className="form-row two">
        <div className="field">
          <label htmlFor="qf-name">Your Name *</label>
          <input
            id="qf-name"
            type="text"
            required
            value={form.name}
            onChange={set("name")}
            placeholder="Full name"
          />
        </div>
        <div className="field">
          <label htmlFor="qf-email">Email *</label>
          <input
            id="qf-email"
            type="email"
            required
            value={form.email}
            onChange={set("email")}
            placeholder="you@company.com"
          />
        </div>
      </div>

      <div className="form-row two">
        <div className="field">
          <label htmlFor="qf-phone">Phone</label>
          <input
            id="qf-phone"
            type="tel"
            value={form.phone}
            onChange={set("phone")}
            placeholder="+91 ..."
          />
        </div>
        <div className="field">
          <label htmlFor="qf-service">Select a Service</label>
          <select id="qf-service" value={form.service} onChange={set("service")}>
            <option value="">Choose a service…</option>
            {SERVICES_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="field">
        <label htmlFor="qf-msg">Message *</label>
        <textarea
          id="qf-msg"
          required
          value={form.message}
          onChange={set("message")}
          placeholder="Tell us about your project or requirement…"
        ></textarea>
      </div>

      <button className="btn btn-primary btn-block btn-lg" disabled={busy}>
        {busy ? "Sending…" : "Request A Quote"}
        {!busy && <i className="bi bi-arrow-right"></i>}
      </button>

      <p className="form-note">
        <i className="bi bi-shield-lock me-1"></i>
        Your details stay private — reply within 24 hours, 24×7 phone support.
      </p>
    </form>
  );
}
