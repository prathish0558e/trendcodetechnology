import { useEffect, useState } from "react";
import { postTourEnquiry } from "../api.js";

/* Destination options come from TOUR_PACKAGES + the section slugs so the
   select never drifts out of sync with what the page actually sells. */
const DESTINATIONS = [
  "Ooty & Coonoor Weekend",
  "Kodaikanal Hills Getaway",
  "Munnar + Alleppey Backwaters",
  "Kanyakumari & Rameswaram Darshan",
  "Madurai & Thanjavur Heritage Trail",
  "Wayanad & Coorg Nature Trail",
  "Valparai & Aliyar Family Trip",
  "Yercaud Weekend Retreat",
  "Bali Honeymoon Special",
  "Dubai Family Explorer",
  "Singapore + Thailand Twin",
  "Maldives Overwater Escape",
  "Bangkok + Phuket Beaches",
  "Sri Lanka Tea & Coast",
  "Vietnam Halong Discovery",
  "Switzerland + Paris Grand Tour",
  "Not sure yet — suggest me one",
];

const BUDGETS = [
  "Under ₹10,000",
  "₹10,000 – ₹25,000",
  "₹25,000 – ₹50,000",
  "₹50,000 – ₹1,00,000",
  "Above ₹1,00,000",
];

export default function TourEnquiryForm({ prefillPackage = "" }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    travelers: "2",
    travelDate: "",
    destination: "",
    budget: "",
    message: prefillPackage,
    indiaOrInternational: "",
    flightNeeded: "",
    passportAvailable: "",
  });

  // Keep the message in sync when a package prefill changes
  useEffect(() => {
    if (prefillPackage) {
      setForm((f) => ({ ...f, message: prefillPackage }));
    }
  }, [prefillPackage]);

  const [status, setStatus] = useState({ state: "idle", msg: "" });
  const [busy, setBusy] = useState(false);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  // International section switches the two conditionally-shown fields on.
  const showPassport = String(form.indiaOrInternational) === "International";
  const showFlight = String(form.flightNeeded) !== "";

  const onSubmit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setStatus({ state: "idle", msg: "" });
    try {
      const res = await postTourEnquiry(form);
      setStatus({
        state: "ok",
        msg:
          res.message ||
          "Thanks! Your tour enquiry reached our travel desk — we'll reply within 24 hours.",
      });
      setForm({
        name: "",
        email: "",
        phone: "",
        travelers: "2",
        travelDate: "",
        destination: "",
        budget: "",
        message: "",
        indiaOrInternational: "",
        flightNeeded: "",
        passportAvailable: "",
      });
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
      <h3 style={{ marginBottom: 4 }}>
        <i className="bi bi-airplane-engines me-1"></i> Plan My Trip
      </h3>
      <p className="tour-enquiry-sub">
        Tell us where and when — our travel desk replies with a full itinerary
        and final price within 24 hours.
      </p>

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
          <label htmlFor="tf-name">Your Name *</label>
          <input
            id="tf-name"
            type="text"
            required
            value={form.name}
            onChange={set("name")}
            placeholder="Full name"
          />
        </div>
        <div className="field">
          <label htmlFor="tf-phone">Phone / WhatsApp *</label>
          <input
            id="tf-phone"
            type="tel"
            required
            value={form.phone}
            onChange={set("phone")}
            placeholder="+91 ..."
          />
        </div>
      </div>

      <div className="field">
        <label htmlFor="tf-email">Email</label>
        <input
          id="tf-email"
          type="email"
          value={form.email}
          onChange={set("email")}
          placeholder="you@example.com"
        />
      </div>

      <div className="form-row two">
        <div className="field">
          <label htmlFor="tf-when">Tentative travel date</label>
          <input
            id="tf-when"
            type="date"
            value={form.travelDate}
            onChange={set("travelDate")}
          />
        </div>
        <div className="field">
          <label htmlFor="tf-pax">No. of travellers *</label>
          <input
            id="tf-pax"
            type="number"
            min="1"
            max="60"
            required
            value={form.travelers}
            onChange={set("travelers")}
          />
        </div>
      </div>

      <div className="field">
        <label htmlFor="tf-dest">Destination / Package *</label>
        <select id="tf-dest" required value={form.destination} onChange={set("destination")}>
          <option value="">Choose a destination…</option>
          {DESTINATIONS.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
      </div>

      <div className="form-row two">
        <div className="field">
          <label htmlFor="tf-scope">Trip type</label>
          <select id="tf-scope" value={form.indiaOrInternational} onChange={set("indiaOrInternational")}>
            <option value="">India / International…</option>
            <option value="India">India</option>
            <option value="International">International</option>
          </select>
        </div>
        <div className="field">
          <label htmlFor="tf-budget">Budget per person</label>
          <select id="tf-budget" value={form.budget} onChange={set("budget")}>
            <option value="">Select budget…</option>
            {BUDGETS.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </div>
      </div>

      {showFlight && (
        <div className="field">
          <label htmlFor="tf-flight">Flight help needed? *</label>
          <select id="tf-flight" required value={form.flightNeeded} onChange={set("flightNeeded")}>
            <option value="">Choose…</option>
            <option value="Yes, flights needed">Yes — flights needed</option>
            <option value="No, land package only">No — land package only</option>
          </select>
        </div>
      )}

      {showPassport && (
        <div className="field">
          <label htmlFor="tf-passport">
            Do all travellers hold passports? *
          </label>
          <select
            id="tf-passport"
            required
            value={form.passportAvailable}
            onChange={set("passportAvailable")}
          >
            <option value="">Choose…</option>
            <option value="Yes, all have passports">Yes — everyone has a passport</option>
            <option value="Some / applying">Some have / applying now</option>
            <option value="No passports yet">No — passports not yet</option>
          </select>
        </div>
      )}

      <div className="field">
        <label htmlFor="tf-msg">Message</label>
        <textarea
          id="tf-msg"
          rows="4"
          value={form.message}
          onChange={set("message")}
          placeholder="Days, hotel preference, kids, veg/non-veg, anything else…"
        ></textarea>
      </div>

      <button className="btn btn-primary btn-block btn-lg" disabled={busy}>
        {busy ? "Sending…" : "Send My Tour Enquiry"}
        {!busy && <i className="bi bi-airplane-engines"></i>}
      </button>

      <p className="form-note">
        <i className="bi bi-shield-lock me-1"></i>
        Your details stay private — reply within 24 hours.
      </p>
    </form>
  );
}
