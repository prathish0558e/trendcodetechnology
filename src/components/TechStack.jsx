import { useState } from "react";
import { Reveal } from "./Reveal.jsx";

/*
 * Tech-stack showcase with category tabs. Logos are inline SVGs (simple-icons
 * paths) inside hexagon frames — no external image dependencies.
 */

const P = {
  angular: "M12 2 2.5 5.4l1.5 12.3L12 22l8-4.3 1.5-12.3L12 2zm0 2.2 6.9 2.4-1.2 10.2L12 19.7l-5.7-2.9L5.1 6.6 12 4.2zm0 2.6L7.4 15h1.7l.9-2.3h3.9l.9 2.3h1.8L12 6.8zm0 3 .7 1.9h-1.4l.7-1.9z",
  react: "M12 10.2a1.8 1.8 0 1 0 0 3.6 1.8 1.8 0 0 0 0-3.6zM12 4c.6 1.6 1 3.3 1.3 5 1.5-.9 3-1.6 4.7-2.2-.8 1.6-1.7 3.1-2.7 4.5 1.5.4 3 .6 4.7.7-1.4 1-2.9 1.8-4.5 2.4.8 1.5 1.7 2.9 2.8 4.3-1.7-.4-3.3-1-4.8-1.8-.3 1.7-.7 3.4-1.5 5.1-.6-1.7-1-3.4-1.3-5.1-1.5.9-3.1 1.6-4.8 2.1.9-1.6 1.8-3 2.9-4.4-1.6-.4-3.1-.7-4.8-.8 1.4-1 2.9-1.7 4.5-2.3-.8-1.5-1.7-3-2.8-4.4 1.7.4 3.3 1.1 4.8 1.9.3-1.7.7-3.4 1.3-5z",
  vue: "M2 3h4l6 10L18 3h4L12 21 2 3zm5.7 0L12 10.4 16.3 3h-2.5L12 6.9 10.2 3H7.7z",
  js: "M3 3h18v18H3V3zm14.6 13.7c-.2-1.2-1-1.7-2.3-2.1l-1.1-.3c-.8-.2-1.1-.5-1.1-.9 0-.5.5-.9 1.3-.9.9 0 1.4.3 1.6 1.1l1.4-.4c-.2-1.2-1.2-2-2.9-2-1.6 0-2.9.9-2.9 2.3 0 1.2.8 1.9 2.3 2.3l1 .2c.8.2 1.2.4 1.2.9s-.5.9-1.4.9c-1 0-1.6-.4-1.8-1.2l-1.5.4c.2 1.3 1.3 2.1 3.3 2.1 1.9 0 3-.9 3-2.4zM9.6 9H7.7v8.6c0 1.5.9 2.4 2.3 2.4.5 0 .9-.1 1.2-.2l-.3-1.4c-.4.1-.7.1-.9.1-.4 0-.7-.3-.7-.9V9z",
  ts: "M3 3h18v18H3V3zm4.2 8.7H5.4V18h1.8v-2.6l.9.1c.5 0 .9-.1 1.2-.4.4-.3.5-.7.5-1.3v-1.4c0-.6-.2-1.1-.5-1.4-.4-.3-.9-.4-1.5-.4l-.6.1zm3.9 0v6.2c0 .4 0 .8.1 1.1h1.7l.1-.9c.3.4.6.7 1 .8.4.2.8.2 1.2.2.5 0 .9-.1 1.3-.3.3-.2.6-.5.8-.9.2-.4.2-.9.2-1.5v-1.6h-1.9v1.6c0 .4-.1.7-.2.9-.2.2-.4.3-.7.3-.3 0-.5-.1-.7-.3-.2-.2-.2-.5-.2-.9v-5.2h-2.7zm1.8-1.9c0 .5.2 1 .5 1.3.4.3.8.5 1.4.5s1.1-.2 1.4-.5c.4-.3.5-.8.5-1.3s-.2-1-.5-1.3c-.4-.3-.8-.5-1.4-.5s-1.1.2-1.4.5c-.4.3-.5.8-.5 1.3z",
  next: "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm4.5 15.2h-2.1l-4-5.4v5.4H8.4V6.8h2.1l4 5.4V6.8h2v10.4z",
  html5: "M3 2h18l-1.6 18L12 22l-7.4-2L3 2zm4.5 5h9.2l-.3 2.6H10l.2 2.7h5.7l-.7 5.4-3.2 1-3.2-1-.2-2.4h2.5l.1 1.2 1.8.5 1.8-.5.2-2.3H7.9L7.5 7z",
  jquery: "M2.5 6.5c2 2.8 5 4.5 8.6 4.5 2.6 0 4.9-.9 6.6-2.4-.4 1.7-1.3 3.2-2.6 4.3-2 1.7-4.7 2.4-7.4 1.8C4.3 13.9 2.2 10.5 2.5 6.5zm3.2-3.4c2.1 2.4 5 3.8 8.3 3.8 1.9 0 3.7-.5 5.2-1.4-.7 1.6-1.9 3-3.4 3.9-2.2 1.3-4.9 1.5-7.4.5-2.5-1-4.3-3.9-2.7-6.8z",
  bootstrap: "M6 2h12a3 3 0 0 1 3 3v14a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V5a3 3 0 0 1 3-3zm1.5 4v12h5.6c2.7 0 4.4-1.1 4.4-3.2 0-1.5-.9-2.5-2.4-2.8v-.1c1.2-.3 2-1.2 2-2.5 0-1.9-1.4-3-3.9-3H7.5zm2.5 4.6V8.5h2.4c1.3 0 2 .5 2 1.4 0 1-.7 1.6-2 1.6h-2.4zm0 5V13h2.7c1.4 0 2.2.6 2.2 1.7 0 1.1-.8 1.7-2.3 1.7h-2.6z",
  tailwind: "M12 6c-2.7 0-4.3 1.3-5 4 1-1.3 2.2-1.8 3.5-1.5.8.2 1.3.7 1.9 1.4.9 1 2 2.1 4.6 2.1 2.7 0 4.3-1.3 5-4-1 1.3-2.2 1.8-3.5 1.5-.8-.2-1.3-.7-1.9-1.4-.9-1-2-2.1-4.6-2.1zM7 12c-2.7 0-4.3 1.3-5 4 1-1.3 2.2-1.8 3.5-1.5.8.2 1.3.7 1.9 1.4.9 1 2 2.1 4.6 2.1 2.7 0 4.3-1.3 5-4-1 1.3-2.2 1.8-3.5 1.5-.8-.2-1.3-.7-1.9-1.4-.9-1-2-2.1-4.6-2.1z",
  node: "M12 2 2.7 7.3v9.4L12 22l9.3-5.3V7.3L12 2zm0 2.3 7.3 4.2v.6L12 13.3 4.7 8.5v-.6L12 4.3zm-7.3 6 6.4 4.1v4.7l-6.4-3.7v-5.1z",
  express: "M3 5h2.4l3.8 10.2L12.9 5h2.3L9.9 19H8.3L3 5zm12.4 0h2.2L22 15.5h-2.2l-.7-2.1h-3.2l.8-2h1.8L17 6.6 15.4 15.5z",
  nest: "M12 2 2 9v9l10 4 10-4V9L12 2zm0 2.2 8 3.2v9.2l-8 3.2-8-3.2V7.4l8-3.2zm-2 5.3-2.4 8.6c.8.6 1.7 1 2.7 1.2l.5-2.9 2.4 2.9c1-.2 1.9-.6 2.7-1.2L13.6 9h-1.4l.2 4.6-2.4-4.1h-1z",
  dotnet: "M3 5h18v14H3V5zm2 9.8h1.5c1.1 0 1.8-.5 1.8-1.4 0-.9-.6-1.4-1.7-1.4H5v2.8zm7.6 0h1.5v-2.8h.9c1.1 0 1.8.5 1.8 1.4 0 .9-.7 1.4-1.8 1.4h-2.4zm9-5.6-4.6 7h-1.8l4.6-7h1.8z",
  python: "M11.9 2c-2.6 0-4.4 1.1-4.4 3v2h4.6v.7H5.6C3.6 7.7 2 9.4 2 12s1.6 4.3 3.6 4.3h1.7v-2.5c0-1.9 1.7-3.5 3.7-3.5h4.4c1.6 0 2.9-1.3 2.9-2.9V5c0-1.9-1.8-3-4.4-3h-2zm-1.6 1.6a.9.9 0 1 1 0 1.8.9.9 0 0 1 0-1.8zm6.4 4.1v2.5c0 1.9-1.7 3.5-3.7 3.5H8.6c-1.6 0-2.9 1.3-2.9 2.9V19c0 1.9 1.8 3 4.4 3h2c2.6 0 4.4-1.1 4.4-3v-2h-4.6v-.7h6.5c2 0 3.6-1.7 3.6-4.3 0-2.2-1.2-3.7-2.9-4.2l-1.4-.1zm-1.4 13a.9.9 0 1 1 0-1.8.9.9 0 0 1 0 1.8z",
  mysql: "M2 8c1.5 3.5 4.2 6 8 6.7.3-1.4.9-2.7 1.9-3.6.6 1.5 1.8 2.6 3.3 3.1 2.2.8 4.5.3 6.3-1-1.7-.1-3.2-.7-4.4-1.7-.8.6-1.8.9-2.8.7.7-.7 1.2-1.6 1.4-2.6-.9.9-2 1.5-3.3 1.7C11.5 9.7 10 8.7 8.3 8.4 6.2 8 4 7.9 2 8z",
  firebase: "M4 16l2-13 3.5 5.5L12 3l2.5 5.5L18 3l2 13-8 5-8-5zm8 2.8 5.5-3.4-1.3-6.2-2 4.3L12 9.5l-2.2 4-2-4.3-1.3 6.2L12 18.8z",
  aws: "M6.5 14.5c-2 0-3.5-1.5-3.5-3.4 0-2 1.6-3.6 3.8-3.6 2.1 0 3.5 1.4 3.7 3.5-.1 2-1.8 3.5-4 3.5zm11-1.2c-1.7 0-3-.9-3.4-2.4h6.5c.2 1.5-.9 2.4-3.1 2.4zM12 2 2.5 6.5v11L12 22l9.5-4.5v-11L12 2zm4.5 9.1h-4.3c.2-1 .9-1.6 2.1-1.6 1.1 0 1.9.6 2.2 1.6z",
  docker: "M3 12h3v3H3v-3zm4 0h3v3H7v-3zm4 0h3v3h-3v-3zm-4-4h3v3H7V8zm4 0h3v3h-3V8zm5 4c0-1.7-1.1-3.1-2.7-3.6-.4 1-.3 2 .2 2.9-1.5-.3-3-.1-4.3.7H22c-.3-1.2-1.4-2-2.6-2h-.4zM4 17h16c-.7 1.9-2.3 3.4-4.4 3.9-3.4.8-6.9-.6-8.6-3.5L4 17z",
};

const CATS = [
  {
    label: "Web",
    items: [
      { name: "Angular", key: "angular", color: "#e2326b" },
      { name: "ReactJs", key: "react", color: "#38bdf8" },
      { name: "VueJs", key: "vue", color: "#34d399" },
      { name: "Javascript", key: "js", color: "#f7df1e" },
      { name: "Typescript", key: "ts", color: "#3b82f6" },
      { name: "NextJS", key: "next", color: "#f1f5f9" },
      { name: "HTML5", key: "html5", color: "#f97316" },
      { name: "jQuery", key: "jquery", color: "#60a5fa" },
      { name: "Bootstrap", key: "bootstrap", color: "#a78bfa" },
      { name: "Tailwind", key: "tailwind", color: "#22d3ee" },
      { name: "NodeJs", key: "node", color: "#4ade80" },
      { name: "ExpressJS", key: "express", color: "#e2e8f0" },
      { name: "NestJS", key: "nest", color: "#fb7185" },
      { name: ".Net Core", key: "dotnet", color: "#8b5cf6" },
    ],
  },
  {
    label: "Mobile",
    items: [
      { name: "React Native", key: "react", color: "#38bdf8" },
      { name: "Flutter", key: "firebase", color: "#38bdf8" },
      { name: "Kotlin", key: "android", color: "#a78bfa" },
      { name: "Swift", key: "swift", color: "#fb923c" },
      { name: "Ionic", key: "angular", color: "#38bdf8" },
      { name: "PWA", key: "html5", color: "#4ade80" },
    ],
  },
  {
    label: "Database",
    items: [
      { name: "MySQL", key: "mysql", color: "#38bdf8" },
      { name: "MongoDB", key: "node", color: "#4ade80" },
      { name: "Firebase", key: "firebase", color: "#fbbf24" },
      { name: "PostgreSQL", key: "mysql", color: "#60a5fa" },
      { name: "Redis", key: "node", color: "#fb7185" },
      { name: "MSSQL", key: "dotnet", color: "#8b5cf6" },
    ],
  },
  {
    label: "Cloud/DevOps",
    items: [
      { name: "AWS", key: "aws", color: "#fbbf24" },
      { name: "Docker", key: "docker", color: "#38bdf8" },
      { name: "Azure", key: "dotnet", color: "#38bdf8" },
      { name: "GCP", key: "firebase", color: "#f97316" },
      { name: "CI/CD", key: "docker", color: "#4ade80" },
      { name: "Nginx", key: "node", color: "#4ade80" },
    ],
  },
  {
    label: "AI/ML",
    items: [
      { name: "Python", key: "python", color: "#60a5fa" },
      { name: "TensorFlow", key: "react", color: "#fbbf24" },
      { name: "PyTorch", key: "react", color: "#fb7185" },
      { name: "OpenCV", key: "python", color: "#4ade80" },
      { name: "Pandas", key: "python", color: "#a78bfa" },
      { name: "LLMs", key: "next", color: "#22d3ee" },
    ],
  },
];

function Hex({ color, children }) {
  return (
    <span className="hex" style={{ "--hex": color }}>
      <span className="hex-inner">
        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d={children} />
        </svg>
      </span>
    </span>
  );
}

export default function TechStack() {
  const [active, setActive] = useState(0);
  const cat = CATS[active];

  return (
    <section className="section tech-section">
      <div className="container">
        <Reveal>
          <div className="section-head center">
            <span className="eyebrow">Technologies We Use</span>
            <h2>Powerful Tech Stack, Endless Possibilities</h2>
          </div>
        </Reveal>

        <div className="tech-tabs" role="tablist">
          {CATS.map((c, i) => (
            <button
              key={c.label}
              role="tab"
              aria-selected={i === active}
              className={`tech-tab ${i === active ? "active" : ""}`}
              onClick={() => setActive(i)}
            >
              {c.label}
            </button>
          ))}
        </div>

        <div className="tech-grid">
          {cat.items.map((it) => (
            <div className="tech-cell" key={it.name}>
              <Hex color={it.color}>{P[it.key] || P.react}</Hex>
              <span className="tech-name">{it.name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
