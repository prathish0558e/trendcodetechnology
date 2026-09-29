import { COMPANY } from "../data/content.js";

export default function WhatsAppFloat() {
  const href = `https://wa.me/${COMPANY.whatsapp}?text=${encodeURIComponent(
    "Hi TCT! I have an enquiry."
  )}`;

  return (
    <a
      className="wa-float"
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
    >
      <i className="bi bi-whatsapp"></i>
    </a>
  );
}
