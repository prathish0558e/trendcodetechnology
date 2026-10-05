import { lazy, Suspense, useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore } from "react";
import { useLocation } from "react-router-dom";
import {
  boot, closeChat, getUi, projectToScreen, setThinking, subscribe, wake,
  setProjectionPixel, state as mstate,
} from "./store.js";
import {
  QUICK_CHIPS, buildLeadPayload, leadPrompt,
  validateLead, wantsLead,
} from "./brain.js";
import { ASSISTANT_MODE, sendMessage } from "./assistantService.js";
import { postLead } from "../api.js";
import { COMPANY } from "../data/content.js";
import { gsap } from "gsap";
import "./mascot.css";

/*
 * TCT Assistant — the 3D mascot layer.
 *
 * A sleeping robot on a cloud lives in the bottom-left corner. Click it and
 * the full cinematic loop plays (wake → stretch → walk → hologram chat →
 * good night → walk back → sleep). The chat itself is a DOM glass panel so
 * it stays readable, accessible and mobile-keyboard friendly while the robot
 * projects it from its eyes.
 *
 * The canvas never captures pointer events, so page scrolling and clicking
 * keep working everywhere.
 */

const Scene = lazy(() => import("./Scene.jsx"));

const GREETING = "Hi \u{1F44B}\nI'm TCT Assistant.\nHow can I help you today?";

export default function TctMascot() {
  const { pathname } = useLocation();
  const ui = useSyncExternalStore(subscribe, getUi);
  const [ready, setReady] = useState(false);

  /* ---------------- messages / lead flow ---------------- */
  const [messages, setMessages] = useState([]);
  const [leadStep, setLeadStep] = useState(null); // null | 'name' | 'contact' | 'message'
  const [draft, setDraft] = useState({});
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [nudge, setNudge] = useState("");
  const bodyRef = useRef(null);
  const panelRef = useRef(null);
  const inputRef = useRef(null);
  const [hitPos, setHitPos] = useState(null);
  const [bubblePos, setBubblePos] = useState(null);

  // defer the WebGL work until the page has painted and settled
  useEffect(() => {
    const w = window;
    boot(w.matchMedia("(prefers-reduced-motion: reduce)").matches);
    // dev/test bridge — lets the console drive the mascot loop
    w.__tct3d = { state: mstate, wake, closeChat, setThinking, gsap };
    let id;
    if (typeof w.requestIdleCallback === "function") {
      id = w.requestIdleCallback(() => setReady(true), { timeout: 2500 });
    } else {
      id = setTimeout(() => setReady(true), 1800);
    }
    return () => {
      if (typeof w.cancelIdleCallback === "function") w.cancelIdleCallback(id);
      else clearTimeout(id);
    };
  }, []);

  // The DOM hologram stays accessible and responsive, but its visible impact
  // point is measured in layout pixels so the 3D eye beams end on its edge.
  useLayoutEffect(() => {
    const panel = panelRef.current;
    if (!ui.chatOpen || !panel) return undefined;
    const measure = () => {
      const width = panel.offsetWidth;
      const height = panel.offsetHeight;
      const mobile = window.innerWidth <= 720;
      const rect = panel.getBoundingClientRect();
      const left = rect.left;
      const top = rect.top;
      const localX = mobile ? Math.min(28, width * 0.08) : 14;
      const localY = mobile ? 24 : height * 0.5;
      panel.style.setProperty("--tct3d-impact-x", `${localX}px`);
      panel.style.setProperty("--tct3d-impact-y", `${localY}px`);
      setProjectionPixel({ x: left + localX, y: top + localY });
    };
    measure();
    const observer = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(measure);
    observer?.observe(panel);
    window.addEventListener("resize", measure);
    panel.addEventListener("animationend", measure);
    return () => {
      observer?.disconnect();
      window.removeEventListener("resize", measure);
      panel.removeEventListener("animationend", measure);
      // Preserve the last impact point while the projector beams dissolve.
    };
  }, [ui.chatOpen]);

  // keep the hit button + bubble glued to their world anchors
  useEffect(() => {
    const update = () => {
      const L = mstate.layout;
      if (!L) return;
      // Center the full tap target over the sleeping robot + cloud. The cloud
      // is above WhatsApp; the extra world-space lift also covers the robot's
      // head so taps on the character itself wake it reliably.
      const c = projectToScreen(L.home.x, L.home.y + 0.3);
      setHitPos(c);
      const sc = L.mobile ? 0.82 : 0.95;
      setBubblePos(projectToScreen(L.stage.x, L.stage.y + 1.75 * sc));
    };
    update();
    window.addEventListener("resize", update);
    const iv = setInterval(update, 1200); // camera drifts subtly — keep it glued
    return () => {
      window.removeEventListener("resize", update);
      clearInterval(iv);
    };
  }, []);

  useEffect(() => {
    if (ui.chatOpen) {
      const t = setTimeout(() => inputRef.current?.focus({ preventScroll: true }), 420);
      return () => clearTimeout(t);
    }
  }, [ui.chatOpen]);

  useEffect(() => {
    bodyRef.current?.scrollTo({ top: bodyRef.current.scrollHeight });
  }, [messages, typing, ui.chatOpen]);

  useEffect(() => {
    const field = inputRef.current;
    if (!field) return;
    field.style.height = "auto";
    field.style.height = `${Math.min(field.scrollHeight, 92)}px`;
  }, [input, ui.chatOpen]);

  const pushBot = (text, delay = 700) => {
    setTyping(true);
    setThinking(true);
    return new Promise((resolve) => {
      setTimeout(() => {
        setTyping(false);
        setThinking(false);
        setMessages((m) => [...m, { from: "bot", text }]);
        resolve();
      }, delay);
    });
  };

  const greet = async () => {
    if (messages.length) return;
    await pushBot(GREETING, 650);
  };

  const submitLead = async (finalDraft) => {
    const d = finalDraft || draft;
    await pushBot("One second — sending this to the team\u2026", 800);
    try {
      await postLead(buildLeadPayload(d));
      await pushBot("\u2705 Done! Your enquiry has reached our team.", 600);
      await pushBot(
        `Someone from TCT will reach out within 24 hours. You can also call 24\u00d77 — ${COMPANY.phone}. Anything else I can help with?`,
        550
      );
    } catch {
      await pushBot(
        `Sorry — something went wrong on my side. Please WhatsApp us at ${COMPANY.phone} or email ${COMPANY.email}.`,
        600
      );
    }
    setLeadStep(null);
  };

  const handleText = async (raw) => {
    const text = raw.trim();
    if (!text) return;
    setMessages((m) => [...m, { from: "user", text }]);
    setInput("");
    setNudge("");

    if (leadStep) {
      const err = validateLead(leadStep, text);
      if (err) return setNudge(err);
      const nd = { ...draft, [leadStep]: text };
      setDraft(nd);
      const idx = ["name", "contact", "message"].indexOf(leadStep);
      if (idx < 2) {
        const next = ["name", "contact", "message"][idx + 1];
        setLeadStep(next);
        await pushBot(leadPrompt(next, nd), 550);
      } else {
        await submitLead(nd);
      }
      return;
    }

    if (wantsLead(text)) {
      setLeadStep("name");
      await pushBot(leadPrompt("name", {}), 550);
      return;
    }

    setTyping(true);
    setThinking(true);
    try {
      const history = messages.map((m) => ({
        role: m.from === "user" ? "user" : "assistant",
        content: m.text,
      }));
      const result = await sendMessage(text, history);
      if (result.mode === "guided") await new Promise((resolve) => setTimeout(resolve, 450));
      setMessages((current) => [...current, { from: "bot", text: result.reply }]);
    } catch {
      setMessages((current) => [...current, {
        from: "bot",
        text: `I couldn't reach the assistant service just now. Please try again, or contact TCT at ${COMPANY.phone} / ${COMPANY.email}.`,
      }]);
    } finally {
      setTyping(false);
      setThinking(false);
    }
  };

  const onChip = (label) => {
    if (ui.phase !== "chat" || typing) return;
    handleText(label);
  };

  const close = () => {
    if (typing) return; // don't cut the assistant mid-sentence
    closeChat();
  };

  const resetConversation = () => {
    if (typing) return;
    setMessages([{ from: "bot", text: GREETING }]);
    setLeadStep(null);
    setDraft({});
    setInput("");
    setNudge("");
    setThinking(false);
  };

  useEffect(() => {
    if (!ui.chatOpen) return;
    const onKey = (e) => e.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ui.chatOpen, typing]);

  useEffect(() => {
    if (ui.phase === "chat" && ui.chatOpen) greet();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ui.phase, ui.chatOpen]);

  if (pathname === "/admin" || pathname === "/login") return null;

  const placeholder =
    leadStep === "name" ? "Type your name\u2026"
    : leadStep === "contact" ? "Phone or email\u2026"
    : leadStep === "message" ? "Describe your requirement\u2026"
    : "Ask me anything...";

  return (
    <div className="tct3d-wrap" aria-hidden="false">
      {ready && (
        <Suspense fallback={null}>
          <Scene />
        </Suspense>
      )}

      {/* the sleeping cloud — click / tap / keyboard to wake the robot */}
      {ui.phase === "sleep" && hitPos && (
        <button
          type="button"
          className="tct3d-hit"
          style={{ left: hitPos.x, top: hitPos.y }}
          onClick={wake}
          aria-label="Wake up the TCT Assistant"
          title="Psst… wake the robot"
        >
          <span className="tct3d-halo" aria-hidden="true" />
        </button>
      )}

      {/* holographic chat panel — projected beside the robot */}
      {ui.chatOpen && (
        <section ref={panelRef} className={`tct3d-panel ${ui.reduced ? "" : "tct3d-panel-in"}`} role="dialog" aria-label="TCT Assistant chat">
          <header className="tct3d-panel-head">
            <span className="tct3d-avatar" aria-hidden="true">
              <svg viewBox="0 0 48 48">
                <rect x="9" y="13" width="30" height="24" rx="9" className="tct3d-svg-head" />
                <circle cx="18" cy="24" r="2.6" className="tct3d-svg-eye" />
                <circle cx="30" cy="24" r="2.6" className="tct3d-svg-eye" />
                <path d="M18.5 30.5q5.5 3.4 11 0" className="tct3d-svg-mouth" />
              </svg>
            </span>
            <div className="tct3d-panel-title">
              <strong>TCT Assistant</strong>
              <small>{ASSISTANT_MODE === "ai" ? "AI assistant · ready to help" : "TCT guide · website answers"}</small>
            </div>
            <span className={`tct3d-status ${ASSISTANT_MODE === "guided" ? "tct3d-status-guided" : ""}`} aria-hidden="true" />
            <span className="tct3d-status-label">{ASSISTANT_MODE === "ai" ? "LIVE" : "GUIDED"}</span>
            <button type="button" className="tct3d-restart" onClick={resetConversation} disabled={typing} aria-label="Start a new conversation" title="New conversation">
              <i className="bi bi-arrow-counterclockwise" />
            </button>
            <button type="button" className="tct3d-close" onClick={close} aria-label="Close chat">
              <i className="bi bi-x-lg" />
            </button>
          </header>

          <div className="tct3d-msgs" ref={bodyRef} aria-live="polite" aria-relevant="additions text">
            {messages.map((m, i) => (
              <div key={i} className={`tct3d-msg-row ${m.from}`}>
                {m.from !== "user" && (
                  <span className="tct3d-msg-avatar" aria-hidden="true">
                    <i className="bi bi-robot" />
                  </span>
                )}
                <div className="tct3d-msg-stack">
                  <span className="tct3d-msg-meta">{m.from === "user" ? "You" : "TCT Assistant"}</span>
                  <div className={`tct3d-msg ${m.from}`}>{m.text}</div>
                </div>
              </div>
            ))}
            {typing && (
              <div className="tct3d-msg-row bot">
                <span className="tct3d-msg-avatar" aria-hidden="true"><i className="bi bi-robot" /></span>
                <div className="tct3d-msg-stack">
                  <span className="tct3d-msg-meta">TCT Assistant is thinking</span>
                  <div className="tct3d-msg bot tct3d-typing" aria-label="TCT Assistant is typing">
                    <i /><i /><i />
                  </div>
                </div>
              </div>
            )}
            {nudge && <div className="tct3d-nudge">{nudge}</div>}
          </div>

          {!messages.some((m) => m.from === "user") && (
            <div className="tct3d-suggestion-wrap">
              <span className="tct3d-suggestion-label">QUICK QUESTIONS</span>
              <div className="tct3d-chips" role="group" aria-label="Quick questions">
                {QUICK_CHIPS.map((c) => (
                  <button key={c} type="button" onClick={() => onChip(c)} disabled={typing}>
                    {c}
                  </button>
                ))}
              </div>
            </div>
          )}

          <form
            className="tct3d-input"
            onSubmit={(e) => { e.preventDefault(); if (!typing) handleText(input); }}
          >
            <textarea
              ref={inputRef}
              rows={1}
              value={input}
              placeholder={placeholder}
              aria-label={placeholder}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
                  e.preventDefault();
                  if (!typing) handleText(input);
                }
              }}
              disabled={typing}
            />
            <button type="submit" disabled={typing || !input.trim()} aria-label="Send">
              <i className="bi bi-send-fill" />
            </button>
          </form>
          <small className="tct3d-foot">
            {ASSISTANT_MODE === "ai"
              ? "TCT AI service · human team replies within 24 hrs"
              : "Guided replies use TCT website info · no live AI endpoint is configured"}
          </small>
        </section>
      )}

      {/* good night bubble */}
      {ui.bubble && bubblePos && (
        <div className="tct3d-bubble" style={{ left: bubblePos.x, top: bubblePos.y }} role="status">
          Good night! 🌙
          <br />
          See you soon!
        </div>
      )}
    </div>
  );
}
