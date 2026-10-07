import { useState } from "react";
import { COMPANY } from "../data/content.js";
import ceoPhoto from "../../ceo.png";

export const TEAM = [
  {
    name: "Bharath T",
    role: "Chief Executive Officer (CEO)",
    photo: ceoPhoto,
    initials: "BT",
    accent: "blue",
  },
  {
    name: "Ms. Mohana Priya D",
    role: "Managing Director (MD)",
    photo: "/team/mohanapriya.jpg",
    initials: "MP",
    accent: "orange",
  },
];

/* The CEO picture is the bundled ceo.png; the MD photo lives in public/team/.
   If a photo ever fails to load the card falls back to a branded monogram, so
   nothing renders broken. Shared by About + Home. */
export default function TeamCard({ member }) {
  const [photoOk, setPhotoOk] = useState(true);
  return (
    <article className={`team-card team-card-${member.accent}`}>
      <div className="team-photo">
        {photoOk ? (
          <img
            src={member.photo}
            alt={`${member.name} — ${member.role}`}
            loading="lazy"
            onError={() => setPhotoOk(false)}
          />
        ) : (
          <span className="team-fallback">{member.initials}</span>
        )}
      </div>

      <div className="team-body">
        <h3>{member.name}</h3>
        <span className="team-role">{member.role}</span>
        <span className="team-divider" aria-hidden="true"></span>
        <p className="team-place">
          <i className="bi bi-geo-alt" aria-hidden="true"></i> {COMPANY.addressShort}
        </p>
        <div className="team-actions">
          <a
            className="team-btn"
            href={`mailto:${COMPANY.email}`}
            aria-label={`Email ${COMPANY.short}`}
          >
            <i className="bi bi-envelope" aria-hidden="true"></i> Email us
          </a>
        </div>
      </div>
    </article>
  );
}
