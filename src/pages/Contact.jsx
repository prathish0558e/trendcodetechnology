import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Reveal, PageHero } from "../components/Reveal.jsx";
import QuoteForm from "../components/QuoteForm.jsx";
import { COMPANY } from "../data/content.js";

export default function Contact() {
  const [params] = useSearchParams();
  const role = params.get("role");

  useEffect(() => {
    if (role) {
      const note = document.getElementById("qf-msg");
      if (note) {
        note.value = `Application for the ${role} role at TCT.`;
        note.dispatchEvent(new Event("input", { bubbles: true }));
      }
    }
  }, [role]);

  return (
    <>
      <PageHero
        eyebrow="Contact Us"
        title="If You Have Any Query, Feel Free To Contact Us"
        text="Call, email or drop by — our team replies within 24 hours, and the phone is answered around the clock."
      />

      <section className="section">
        <div className="container">
          <div className="contact-grid">
            <Reveal>
              <div className="info-card" style={{ height: "100%" }}>
                <h3 style={{ marginBottom: 8 }}>
                  <i className="bi bi-chat-dots"></i> Reach Us Directly
                </h3>

                <div className="contact-item">
                  <div className="ic"><i className="bi bi-telephone"></i></div>
                  <div>
                    <h4>Call to ask any question</h4>
                    <p>
                      <a href={`tel:${COMPANY.phoneRaw}`}>{COMPANY.phone}</a>
                    </p>
                  </div>
                </div>

                <div className="contact-item">
                  <div className="ic"><i className="bi bi-envelope-open"></i></div>
                  <div>
                    <h4>Email to get free quote</h4>
                    <p>
                      <a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a>
                    </p>
                  </div>
                </div>

                <div className="contact-item">
                  <div className="ic"><i className="bi bi-geo-alt"></i></div>
                  <div>
                    <h4>Visit our office</h4>
                    <p>{COMPANY.address}</p>
                  </div>
                </div>

                {role && (
                  <div className="banner ok" style={{ marginTop: 16, marginBottom: 0 }}>
                    <i className="bi bi-briefcase me-1"></i>
                    Applying for <strong>{role}</strong> — tell us a bit about
                    yourself below.
                  </div>
                )}
              </div>
            </Reveal>

            <Reveal delay={120}>
              <QuoteForm />
            </Reveal>
          </div>

          <div className="map-frame">
            <iframe
              title="Trend Code Technology location"
              src={COMPANY.mapEmbed}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
        </div>
      </section>
    </>
  );
}
