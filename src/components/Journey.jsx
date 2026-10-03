import { lazy, Suspense, useEffect, useRef, useState } from "react";

const JourneyTrain3D = lazy(() => import("./JourneyTrain3D.jsx"));
/*
 * Curved delivery timeline — cards alternate above/below an invisible route;
 * a three-car train pauses at each step without painting lines over the copy.
 * When the section scrolls into view the steps pop in one by one, each with
 * a blue → light-blue → orange colour flash, in step order.
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

function Card({ step, title, text, glyph, href, active }) {
  const className = `journey-card${active ? " train-active" : ""}`;
  const body = (
    <>
      <span className="journey-chip">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d={glyph} />
        </svg>
        Step {step}
      </span>
      <h3>{title}</h3>
      <p>{text}</p>
    </>
  );

  // A stop can carry a `href` — the card then forwards to it (new tab).
  if (href) {
    return (
      <a
        className={className}
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`${title} — opens tctechs.in in a new tab`}
      >
        {body}
      </a>
    );
  }
  return <div className={className}>{body}</div>;
}

export default function Journey({ steps }) {
  const journeyRef = useRef(null);
  const n = steps.length;
  const W = 1360;
  // Keep the train on a dedicated lane above the cards so it can never cover copy.
  const H = 80;
  const stationXs = steps.map((_, i) => (W * (i + 0.5)) / n);

  // The route is invisible; a straight, clear lane keeps the train away from all text.
  const d = `M ${stationXs[0]} ${H / 2} L ${stationXs[n - 1]} ${H / 2}`;

  const [trackData, setTrackData] = useState({ keyPoints: [], keyTimes: [] });
  const basePathRef = useRef(null);
  useEffect(() => {
    try {
      const path = basePathRef.current;
      if (!path) return;
      const length = path.getTotalLength();
      // Find exact distances along the curved SVG route for each card's station.
      const keyPoints = stationXs.map((stationX) => {
        let low = 0;
        let high = length;
        for (let step = 0; step < 22; step++) {
          const mid = (low + high) / 2;
          if (path.getPointAtLength(mid).x < stationX) low = mid;
          else high = mid;
        }
        return ((low + high) / 2) / length;
      });

      // Dwell at every card, then take a slow, even journey to the next one.
      const dwellSeconds = 2.4;
      const travelSeconds = 4.8;
      const duration = keyPoints.length * dwellSeconds + Math.max(0, keyPoints.length - 1) * travelSeconds;
      const motionPoints = [keyPoints[0]];
      const motionTimes = [0];
      let elapsed = 0;
      keyPoints.forEach((point, i) => {
        elapsed += dwellSeconds;
        motionPoints.push(point);
        motionTimes.push(elapsed / duration);
        if (i < keyPoints.length - 1) {
          elapsed += travelSeconds;
          motionPoints.push(keyPoints[i + 1]);
          motionTimes.push(elapsed / duration);
        }
      });

      setTrackData({ keyPoints: motionPoints, keyTimes: motionTimes, duration });
    } catch {
      /* SVG not ready yet */
    }
  }, [d]);
  // Mount the animated train after the SVG route is ready.
  const [pathSet, setPathSet] = useState(false);
  useEffect(() => setPathSet(true), []);

  // Sequential colour-pop entrance — arms once the journey scrolls into view,
  // then each step pops in order (Step 1 → 6) with a blue→orange flash.
  const [play, setPlay] = useState(false);
  const [trainStartTime, setTrainStartTime] = useState(null);
  const [reducedMotion, setReducedMotion] = useState(() =>
    typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  const [showTrain, setShowTrain] = useState(() => typeof window === "undefined" || window.innerWidth >= 640);
  useEffect(() => {
    const media = window.matchMedia("(min-width: 640px)");
    const update = () => setShowTrain(media.matches);
    update();
    media.addEventListener?.("change", update);
    return () => media.removeEventListener?.("change", update);
  }, []);
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(media.matches);
    update();
    media.addEventListener?.("change", update);
    return () => media.removeEventListener?.("change", update);
  }, []);
  useEffect(() => {
    if (!play || !pathSet || trackData.keyPoints.length !== steps.length * 2 || trainStartTime !== null) return;
    const frameId = requestAnimationFrame(() => {
      setTrainStartTime(performance.now());
    });
    return () => cancelAnimationFrame(frameId);
  }, [play, pathSet, trackData.keyPoints.length, steps.length, trainStartTime]);
  useEffect(() => {
    const el = journeyRef.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      setPlay(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setPlay(true);
          io.disconnect();
        }
      },
      { rootMargin: "0px 0px -15% 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // The stop the train is currently dwelling at (-1 = moving / no train).
  // Drives the blue ↔ orange glow around that stop's box.
  const [activeStop, setActiveStop] = useState(-1);
  useEffect(() => {
    if (!showTrain) setActiveStop(-1);
  }, [showTrain]);

  return (
    <div className={`journey${play ? " play" : ""}`} ref={journeyRef}>
      <svg
        className="journey-path"
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        {/* Visible rails and sleepers stay in the reserved lane above all card copy. */}
        <g className="journey-track-ties" aria-hidden="true">
          {Array.from({ length: 43 }, (_, i) => {
            const x = (W * i) / 42;
            return <line key={i} x1={x} y1={H / 2 + 13} x2={x} y2={H / 2 + 26} />;
          })}
        </g>
        <path className="journey-track-rail" d={`M 0 ${H / 2 + 16} H ${W}`} />
        <path className="journey-track-rail" d={`M 0 ${H / 2 + 23} H ${W}`} />
        {/* The center path is transparent and only drives the train animation. */}
        <path ref={basePathRef} d={d} fill="none" stroke="transparent" strokeWidth="1" />
      </svg>

      {play && trainStartTime !== null && showTrain && pathSet && trackData.keyPoints.length === steps.length * 2 && (
        <Suspense fallback={null}>
          <JourneyTrain3D
            pathRef={basePathRef}
            duration={trackData.duration}
            keyPoints={trackData.keyPoints}
            keyTimes={trackData.keyTimes}
            startTime={trainStartTime}
            reducedMotion={reducedMotion}
            onStationChange={setActiveStop}
          />
        </Suspense>
      )}

      <ol className="journey-grid">
        {steps.map((s, i) => (
          <li
            key={s.title}
            className={`journey-item ${i % 2 === 0 ? "up" : "down"}`}
            style={{ "--i": i }}
          >
            <span className="journey-dot">{i + 1}</span>
            <Card
              step={i + 1}
              title={s.title}
              text={s.text}
              glyph={GLYPHS[i % GLYPHS.length]}
              href={s.href}
              active={activeStop === i}
            />
          </li>
        ))}
      </ol>
    </div>
  );
}
