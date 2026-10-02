import { useEffect, useRef, useState } from "react";
import { Reveal } from "./Reveal.jsx";
/*
 * Curved "journey" timeline 2.0 — cards alternate above/below a dashed SVG
 * path with numbered badges + per-step glyph icons, and an animated pulse
 * travels along the path to feel like work flowing through the pipeline.
 */

const GLYPHS = [
  // search / requirement
  "M10.5 3a7.5 7.5 0 1 0 0 15 7.5 7.5 0 0 0 0-15zm5.6 13.1L21 21",
  // pen ruler / design
  "M4 20l4-1L20.5 6.5a2.1 2.1 0 0 0-3-3L5 16l-1 4zM14 6l4 4",
  // code brackets / agile dev
  "M8 6 2 12l6 6m8-12 6 6-6 6",
  // shield check / QA
  "M12 2 4 5.5V11c0 5 3.4 9.3 8 11 4.6-1.7 8-6 8-11V5.5L12 2zm-3.5 9.5L11 14l4.5-4.5",
  // rocket / deploy
  "M12 15c-2-5 1-10.5 6.5-12.5C20 8 17.5 13.5 12 15zm0 0c-1.5-1.5-3-2-5.5-2 0 2.5 1 4.5 3.5 6.5M9 19.5c-1 1-3 1.5-5 1.5.3-2 .8-3.7 2-4.5",
  // headset / support
  "M4 13a8 8 0 0 1 16 0m-16 0v3a2 2 0 0 0 2 2h1v-6H4zm16 0h-3v6h1a2 2 0 0 0 2-2v-3z",
];

function Card({ step, title, text, glyph, delay }) {
  return (
    <Reveal delay={delay}>
      <div className="journey-card">
        <span className="journey-chip">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d={glyph} />
          </svg>
          Step {step}
        </span>
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

  /* Hover "map" effect: one lit path is drawn on top of the dashed one —
     visible length = (hovered step / n) × real path length (measured after
     mount via getTotalLength so the fill is exact). */
  const [hovered, setHovered] = useState(0);
  const [totalLen, setTotalLen] = useState(0);
  const basePathRef = useRef(null);
  useEffect(() => {
    try {
      setTotalLen(basePathRef.current?.getTotalLength() || 0);
    } catch {
      /* SVG not ready yet */
    }
  }, []);
  const litLen = (hovered / n) * totalLen;

  // Two glowing pulses loop along the dashed path forever.
  const [pathSet, setPathSet] = useState(false);
  useEffect(() => setPathSet(true), []);

  return (
    <div className="journey">
      <svg
        className="journey-path"
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="journey-pulse" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#22d3ee" />
            <stop offset="100%" stopColor="#4f7cff" />
          </linearGradient>
          <linearGradient id="journey-lit" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#22d3ee" />
            <stop offset="60%" stopColor="#4f7cff" />
            <stop offset="100%" stopColor="#7c3aed" />
          </linearGradient>
        </defs>
        <path
          ref={basePathRef}
          d={d}
          fill="none"
          stroke="rgba(255,255,255,0.28)"
          strokeWidth="2.5"
          strokeDasharray="7 9"
          strokeLinecap="round"
        />
        {/* lit progress trail — fills up to the hovered step like a route map */}
        <path
          d={d}
          fill="none"
          stroke="url(#journey-lit)"
          strokeWidth="4"
          strokeLinecap="round"
          className="journey-lit-path"
          style={
            totalLen
              ? { strokeDasharray: `${litLen} ${totalLen}` }
              : { opacity: 0 }
          }
        />
        {/* travelling pulses — visible only on wide screens */}
        {pathSet && (
          <g className="journey-pulses">
            <circle r="5" fill="url(#journey-pulse)">
              <animateMotion dur="9s" repeatCount="indefinite" path={d} />
            </circle>
            <circle r="3.5" fill="url(#journey-pulse)" opacity="0.7">
              <animateMotion dur="9s" begin="4.5s" repeatCount="indefinite" path={d} />
            </circle>
          </g>
        )}
      </svg>

      <ol className="journey-grid">
        {steps.map((s, i) => (
          <li
            key={s.title}
            className={`journey-item ${i % 2 === 0 ? "up" : "down"} ${hovered === i + 1 ? "hovered" : ""}`}
            onMouseEnter={() => setHovered(i + 1)}
            onMouseLeave={() => setHovered(0)}
          >
            <span className="journey-dot">{i + 1}</span>
            <Card
              step={i + 1}
              title={s.title}
              text={s.text}
              glyph={GLYPHS[i % GLYPHS.length]}
              delay={i * 90}
            />
          </li>
        ))}
      </ol>
    </div>
  );
}
