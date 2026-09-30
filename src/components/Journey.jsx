import { Reveal } from "./Reveal.jsx";

/*
 * Curved "journey" timeline — cards alternate above/below a dashed SVG
 * path with numbered badges, like the reference site's 6-step process.
 */

function Card({ step, title, text, delay }) {
  return (
    <Reveal delay={delay}>
      <div className="journey-card">
        <span className="journey-chip">Step {step}</span>
        <h3>{title}</h3>
        <p>{text}</p>
      </div>
    </Reveal>
  );
}

export default function Journey({ steps }) {
  const n = steps.length;
  const W = 1360;
  const H = 220;
  const gap = W / (n - 1);

  // Alternating wave through each badge position
  let d = `M 0 ${H / 2}`;
  for (let i = 1; i < n; i++) {
    const x = gap * i;
    const prevMid = gap * (i - 1) + gap / 2;
    const y = i % 2 === 0 ? 24 : H - 24;
    d += ` Q ${prevMid} ${y} ${x} ${H / 2}`;
  }

  return (
    <div className="journey">
      <svg
        className="journey-path"
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path d={d} fill="none" stroke="rgba(255,255,255,0.28)" strokeWidth="2.5" strokeDasharray="7 9" strokeLinecap="round" />
      </svg>

      <ol className="journey-grid">
        {steps.map((s, i) => (
          <li key={s.title} className={`journey-item ${i % 2 === 0 ? "up" : "down"}`}>
            <span className="journey-dot">{i + 1}</span>
            <Card step={i + 1} title={s.title} text={s.text} delay={i * 90} />
          </li>
        ))}
      </ol>
    </div>
  );
}
