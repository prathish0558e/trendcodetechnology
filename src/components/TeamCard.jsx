import { useState } from "react";
import { COMPANY } from "../data/content.js";

export const TEAM = [
  {
    name: "Bharath T",
    role: "Chief Executive Officer (CEO)",
    photo: "/team/bharath.jpg",
    initials: "BT",
  },
  {
    name: "Mohanapriya K",
    role: "Managing Director (MD)",
    photo: "/team/mohanapriya.jpg",
    initials: "MP",
  },
];

/* Profile photo uses /team/<file>.jpg when present. Until the real photos
   are dropped into public/team/, a branded initials avatar shows instead —
   adding the photo later needs no code change. Shared by About + Home. */
export default function TeamCard({ member }) {
  const [photoOk, setPhotoOk] = useState(true);
  return (
    <article className="team-card">
      <div className="team-photo">
        {photoOk ? (
          <img
            src={member.photo}
            alt={`${member.name} — ${member.role}`}
            loading="lazy"
            onError={() => setPhotoOk(false)}
          />
        ) : (
          <>
            <span className="team-ring" aria-hidden="true"></span>
            <span className="team-initials">{member.initials}</span>
          </>
        )}
      </div>
      <div className="team-body">
        <h3>{member.name}</h3>
        <span className="team-role">{member.role}</span>
        <div className="team-social">
          <a href={`mailto:${COMPANY.email}`} aria-label={`Email ${member.name}`}>
            <i className="bi bi-envelope"></i>
          </a>
          <a href={`tel:${COMPANY.phoneRaw}`} aria-label={`Call ${member.name}`}>
            <i className="bi bi-telephone"></i>
          </a>
          <a
            href={`https://wa.me/${COMPANY.whatsapp}`}
            target="_blank"
            rel="noreferrer"
            aria-label={`WhatsApp ${member.name}`}
          >
            <i className="bi bi-whatsapp"></i>
          </a>
        </div>
      </div>
    </article>
  );
}
