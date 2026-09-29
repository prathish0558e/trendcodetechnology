import { Link } from "react-router-dom";
import { PageHero } from "../components/Reveal.jsx";

export default function NotFound() {
  return (
    <>
      <PageHero
        eyebrow="404"
        title="Page Not Found"
        text="The page you're looking for doesn't exist or has moved."
      />
      <section className="section">
        <div className="container" style={{ textAlign: "center" }}>
          <Link to="/" className="btn btn-primary btn-lg">
            <i className="bi bi-house"></i> Back to Home
          </Link>
        </div>
      </section>
    </>
  );
}
