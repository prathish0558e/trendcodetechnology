import { Component, lazy, Suspense, useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore } from "react";
import { useLocation } from "react-router-dom";
import {
  beginPickup, boot, closeChat, closeChatInstant, finishPanelClose, getUi, movePickup,
  openChatInstant, projectToScreen, releasePickup, setThinking, subscribe, wake,
  setProjectionPixel, state as mstate,
} from "./store.js";
import { handleRobotTap } from "./support.js";
import {
  JOB_STEPS, QUICK_CHIPS, buildJobPayload, buildLeadPayload, jobPrompt, leadPrompt,
  validateJob, validateLead, wantsJob, wantsLead,
} from "./brain.js";
import { sendMessage } from "./assistantService.js";
import { postLead } from "../api.js";
import { COMPANY } from "../data/content.js";
import { gsap } from "gsap";
import "./mascot.css";

/*
 * TCT Assistant — the 3D mascot layer.
 *
 * A sleeping robot on a cloud lives in the bottom-left corner. Tap it and
 * the cinematic chat loop plays; drag it upward to pick it up and wake it.
 * The chat itself is a DOM glass panel so
 * it stays readable, accessible and mobile-keyboard friendly while the robot
 * projects it from its mouth.
 *
 * The canvas never captures pointer events, so page scrolling and clicking
 * keep working everywhere.
 */

const Scene = lazy(() => import("./Scene.jsx"));

/*
 * If the 3D scene throws while mounting (WebGL2 unavailable, context refused,
 * driver quirk) React must not take the whole page down with it: the CSS
 * robot steps in instead. This is why Apple phones/tablets used to show an
 * empty corner — the error had nowhere to go.
 */
class MascotBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { failed: false };
  }

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error) {
    this.props.onFail?.(error?.message || "scene-error");
  }

  render() {
    return this.state.failed ? null : this.props.children;
  }
}

const GREETING =
  "Hi \u{1F44B}\nI'm the TCT Assistant.\nAsk me about our services, who runs TCT, or say \"I want a job\" and I'll take your details straight to HR.";

export default function TctMascot() {
  const { pathname } = useLocation();
  const ui = useSyncExternalStore(subscribe, getUi);
  const [ready, setReady] = useState(true);
  const [mode, setMode] = useState("3d");

  const fallbackTo2d = () => {
    // 2D cartoon robot is completely disabled per user requirement - always retain 3D mascot
  };

  /* ---------------- messages / lead flow ---------------- */
  const [messages, setMessages] = useState([]);
  const [leadStep, setLeadStep] = useState(null); // null | 'name' | 'contact' | 'message'
  const [jobStep, setJobStep] = useState(null);   // null | 'name' | 'email' | 'phone' | 'role' | 'experience'
  const [draft, setDraft] = useState({});
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [nudge, setNudge] = useState("");
  const bodyRef = useRef(null);
  const panelRef = useRef(null);
  const inputRef = useRef(null);
  const [hitPos, setHitPos] = useState(null);
  const [bubblePos, setBubblePos] = useState(null);
  const [panelFollow, setPanelFollow] = useState(null);
  const pickupGestureRef = useRef(null);
  const suppressPickupClickRef = useRef(false);
  const suppressPickupClickTimerRef = useRef(null);

  // Initialize WebGL 3D mascot loop
  useEffect(() => {
    const w = window;
    boot(w.matchMedia("(prefers-reduced-motion: reduce)").matches);
    // dev/test bridge — lets the console drive the mascot loop
    w.__tct3d = { state: mstate, wake, closeChat, setThinking, gsap };
    setMode("3d");
    setReady(true);
  }, []);

  // The DOM hologram stays accessible and responsive, but its visible impact
  // point is measured in layout pixels so the 3D mouth beam ends on its edge.
  useLayoutEffect(() => {
    const panel = panelRef.current;
    if (!panel) return undefined;
    const measure = () => {
      const width = panel.offsetWidth;
      const height = panel.offsetHeight;
      const mobile = window.innerWidth <= 720;
      const host = panel.offsetParent;
      const hostRect = host?.getBoundingClientRect();
      // offsetLeft/Top describe the panel's final layout box. getBoundingClientRect
      // includes the entrance scale and would make the beams chase the animation.
      const left = (hostRect?.left || 0) + panel.offsetLeft;
      const top = (hostRect?.top || 0) + panel.offsetTop;
      const localX = mobile ? width * 0.5 : 14;
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
      // Preserve the last impact point while the hologram particles dissolve.
    };
  }, []);

  // keep the hit button + bubble glued to their world anchors
  useEffect(() => {
    const update = () => {
      const L = mstate.layout;
      if (!L) return;
      // Center the full tap target over the sleeping robot + cloud. The cloud
      // is above WhatsApp; the extra world-space lift also covers the robot's
      // head so taps on the character itself wake it reliably.
      let anchor = { x: L.home.x, y: L.home.y + 0.3 };
      if (mstate.phase === "chat") anchor = { x: L.stage.x, y: L.stage.y + 0.34 };
      else if (mstate.phase === "throw") anchor = { x: mstate.throwMotion.x, y: mstate.throwMotion.y + 0.15 };
      else if (["throwLand", "recover"].includes(mstate.phase)) anchor = { x: mstate.throwMotion.landX, y: mstate.throwMotion.landY + 0.28 };
      else if (mstate.phase === "walkback" && mstate.returningHome) {
        const homeY = L.floorY + 0.158 * (L.activeMascotScale || 1);
        anchor = {
          x: mstate.throwMotion.landX + (L.home.x - mstate.throwMotion.landX) * mstate.t,
          y: mstate.throwMotion.landY + (homeY - mstate.throwMotion.landY) * mstate.t + 0.28,
        };
      } else if (["pickup", "pickupIdle"].includes(mstate.phase) && mstate.pickupBase) {
        anchor = { x: mstate.pickupBase.x + mstate.pickupX, y: mstate.pickupBase.y + mstate.pickupHeight + 0.28 };
      }
      const c = projectToScreen(anchor.x, anchor.y);
      setHitPos(c);
      const sc = L.mobile ? 0.82 : 0.95;
      if (L.mobile) {
        const stageScreen = projectToScreen(L.stage.x, L.stage.y);
        setBubblePos({
          x: Math.max(12, Math.min(L.w - 142, stageScreen.x + L.w * 0.12)),
          y: projectToScreen(L.stage.x, L.stage.y - 0.08).y,
        });
      } else {
        setBubblePos(projectToScreen(L.stage.x, L.stage.y + 1.75 * sc));
      }
    };
    update();
    window.addEventListener("resize", update);
    const iv = setInterval(update, ["throw", "walkback", "pickup", "recover"].includes(mstate.phase) ? 45 : 800);
    return () => {
      window.removeEventListener("resize", update);
      clearInterval(iv);
    };
  }, [ui.phase]);

  // A chat opened while the mascot is grabbed becomes a carried hologram:
  // it travels to the landing point, then returns with the robot to its bed.
  useEffect(() => {
    if (ui.phase === "sleep") {
      setPanelFollow(null);
      return;
    }
    if (!ui.panelCarried || !mstate.layout) return;
    if (ui.phase === "walkback") {
      const L = mstate.layout;
      const home = projectToScreen(L.home.x, L.home.y + 0.45);
      setPanelFollow({ x: home.x + 112, y: home.y - 120, duration: 1.05 });
    }
  }, [ui.phase, ui.panelCarried]);

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

  /* Job interest → collect name, email, phone, role, experience and hand the
     whole thing to /api/leads (the same pipeline that emails + WhatsApps HR). */
  const submitJob = async (finalDraft) => {
    const d = finalDraft || draft;
    await pushBot("Got it — sending your details to our HR desk\u2026 \u{1F680}", 800);
    try {
      await postLead(buildJobPayload(d));
      await pushBot("\u2705 Done! Your profile has reached our HR team.", 600);
      await pushBot(
        `They'll reach you on ${d.email || d.phone} if there's a match. Meanwhile every opening is listed on our Careers page — anything else I can help with?`,
        550
      );
    } catch {
      await pushBot(
        `Hmm, that didn't go through. Please WhatsApp your CV to ${COMPANY.phone} or email ${COMPANY.email} — HR will pick it up.`,
        600
      );
    }
    setJobStep(null);
  };

  const handleText = async (raw) => {
    const text = raw.trim();
    if (!text) return;
    setMessages((m) => [...m, { from: "user", text }]);
    setInput("");
    setNudge("");

    if (jobStep) {
      const err = validateJob(jobStep, text);
      if (err) return setNudge(err);
      const nd = { ...draft, [jobStep]: text };
      setDraft(nd);
      const idx = JOB_STEPS.indexOf(jobStep);
      if (idx < JOB_STEPS.length - 1) {
        const next = JOB_STEPS[idx + 1];
        setJobStep(next);
        await pushBot(jobPrompt(next, nd), 550);
      } else {
        await submitJob(nd);
      }
      return;
    }

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

    if (wantsJob(text)) {
      setDraft({});
      setJobStep(JOB_STEPS[0]);
      await pushBot(jobPrompt(JOB_STEPS[0], {}), 550);
      return;
    }

    if (wantsLead(text)) {
      setDraft({});
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
    // The 2D robot has no walk-back animation, so it closes in one step.
    if (mode === "2d") closeChatInstant();
    else closeChat();
  };

  const onMascotPointerDown = (event) => {
    if ((event.button !== undefined && event.button !== 0) || !["sleep", "pickupIdle", "chat"].includes(mstate.phase)) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const nx = rect.width ? (event.clientX - rect.left) / rect.width : 0.5;
    const ny = rect.height ? (event.clientY - rect.top) / rect.height : 0.5;
    // Only start a pickup from the robot itself; cloud decoration keeps the
    // existing tap-through behavior for page links underneath it.
    if (!(nx > 0.24 && nx < 0.76 && ny > 0.1 && ny < 0.78)) return;
    pickupGestureRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      lastX: event.clientX,
      lastY: event.clientY,
      lastAt: event.timeStamp || performance.now(),
      velocityX: 0,
      velocityY: 0,
      started: false,
    };
    try { event.currentTarget.setPointerCapture(event.pointerId); } catch { /* unsupported pointer capture */ }
  };

  const onMascotPointerMove = (event) => {
    const gesture = pickupGestureRef.current;
    if (!gesture || gesture.pointerId !== event.pointerId) return;
    const L = mstate.layout;
    const liftPx = gesture.startY - event.clientY;
    const dx = event.clientX - gesture.startX;
    if (!gesture.started) {
      // Any deliberate drag picks the robot up. It can then be dropped in any
      // visible direction; a simple tap still opens the chat as before.
      if (Math.hypot(dx, liftPx) < 12) return;
      const fromChat = mstate.phase === "chat";
      if (!beginPickup({ fromChat })) {
        pickupGestureRef.current = null;
        return;
      }
      if (fromChat && L) {
        const atRobot = projectToScreen(L.stage.x, L.stage.y + 0.45);
        setPanelFollow({ x: atRobot.x + 112, y: atRobot.y - 120, duration: 0.24 });
      }
      gesture.started = true;
      suppressPickupClickRef.current = true;
    }

    if (!L) return;
    const now = event.timeStamp || performance.now();
    const elapsed = Math.max(0.016, Math.min(0.12, (now - gesture.lastAt) / 1000));
    const unitsPerPixelX = (2 * L.halfW) / L.w;
    const unitsPerPixelY = (2 * L.halfH) / L.h;
    const rawVelocityX = (event.clientX - gesture.lastX) * unitsPerPixelX / elapsed;
    const rawVelocityY = (gesture.lastY - event.clientY) * unitsPerPixelY / elapsed;
    gesture.velocityX = gesture.velocityX * 0.52 + rawVelocityX * 0.48;
    gesture.velocityY = gesture.velocityY * 0.52 + rawVelocityY * 0.48;
    gesture.lastX = event.clientX;
    gesture.lastY = event.clientY;
    gesture.lastAt = now;
    movePickup({
      height: Math.max(0.25, Math.min(1.25, Math.hypot(dx, liftPx) * (2 * L.halfH / L.h) * 0.68)),
      x: Math.max(-0.46, Math.min(0.46, dx * (2 * L.halfW / L.w) * 0.55)),
      lookX: Math.max(-1, Math.min(1, dx / 90)),
      lookY: Math.max(-1, Math.min(1, liftPx / 120)),
    });
  };

  const finishMascotPointer = (event) => {
    const gesture = pickupGestureRef.current;
    if (!gesture || gesture.pointerId !== event.pointerId) return;
    pickupGestureRef.current = null;
    if (!gesture.started) return;
    const releasedAt = event.timeStamp || performance.now();
    const momentum = Math.exp(-Math.max(0, releasedAt - gesture.lastAt) / 140);
    const L = mstate.layout;
    const rig = mstate.rig;
    const dropX = L ? ((event.clientX / L.w) * 2 - 1) * L.halfW + (rig?.x || 0) : undefined;
    const dropY = L ? (rig?.y || L.camY) + (1 - (event.clientY / L.h) * 2) * L.halfH : undefined;
    releasePickup({
      velocityX: gesture.velocityX * momentum,
      velocityY: gesture.velocityY * momentum,
      dropX,
      dropY,
    });
    if (mstate.panelCarried) {
      setPanelFollow({ x: event.clientX + 112, y: event.clientY - 120, duration: mstate.throwMotion.flightDuration || 0.8 });
    }
    suppressPickupClickRef.current = true;
    clearTimeout(suppressPickupClickTimerRef.current);
    suppressPickupClickTimerRef.current = setTimeout(() => {
      suppressPickupClickRef.current = false;
    }, 350);
  };

  const onMascotActivate = (event) => {
    if (suppressPickupClickRef.current) {
      suppressPickupClickRef.current = false;
      clearTimeout(suppressPickupClickTimerRef.current);
      return;
    }
    handleRobotTap(event, wake);
  };

  const resetConversation = () => {
    if (typing) return;
    setMessages([{ from: "bot", text: GREETING }]);
    setLeadStep(null);
    setJobStep(null);
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
    : jobStep === "name" ? "Your full name\u2026"
    : jobStep === "email" ? "Your email\u2026"
    : jobStep === "phone" ? "Phone / WhatsApp\u2026"
    : jobStep === "role" ? "Role you want\u2026"
    : jobStep === "experience" ? "Fresher / 1\u20133 / 3\u20135 / 5+ years\u2026"
    : "Ask TCT Assistant...";
  const displayBubblePos = ui.interactionNotice && hitPos
    ? {
        x: Math.max(96, Math.min((mstate.layout?.w || 320) - 96, hitPos.x + 88)),
        y: Math.max(64, hitPos.y - 58),
      }
    : bubblePos;
  return (
    <div className="tct3d-wrap" aria-hidden="false">
      {ready && (
        <MascotBoundary onFail={fallbackTo2d}>
          <Suspense fallback={null}>
            <Scene onFail={fallbackTo2d} />
          </Suspense>
        </MascotBoundary>
      )}

      {/* Tap to open chat; drag upward on the robot to pick it up and wake it. */}
      {["sleep", "pickup", "pickupIdle", "throw", "throwLand", "recover", "walkback", "chat"].includes(ui.phase) && hitPos && (
        <button
          type="button"
          className="tct3d-hit"
          style={{ left: hitPos.x, top: hitPos.y }}
          onPointerDown={onMascotPointerDown}
          onPointerMove={onMascotPointerMove}
          onPointerUp={finishMascotPointer}
          onPointerCancel={finishMascotPointer}
          onClick={onMascotActivate}
          aria-label={ui.phase === "pickupIdle" ? "TCT Assistant is awake. Tap to chat or drag to pick it up." : "Tap to chat or drag TCT Assistant to pick it up."}
          title="Drag to pick up and toss the robot · tap to chat"
        >
          <span className="tct3d-halo" aria-hidden="true" />
        </button>
      )}

      {/* holographic chat panel — projected beside the robot */}
      <section
        ref={panelRef}
        className={`tct3d-panel ${panelFollow ? "tct3d-panel-carried" : ""} ${!ui.panelVisible ? "tct3d-panel-idle" : ui.phase === "goodnight" ? "tct3d-panel-out" : "tct3d-panel-in"}`}
        style={panelFollow ? { left: panelFollow.x, top: panelFollow.y, right: "auto", bottom: "auto", "--tct3d-panel-travel": `${panelFollow.duration}s` } : undefined}
        role="dialog"
        aria-label="TCT Assistant chat"
        aria-hidden={!ui.chatOpen}
        inert={!ui.chatOpen}
        onAnimationEnd={(event) => {
          if (event.target === event.currentTarget && event.animationName.startsWith("tct3d-panel-out")) finishPanelClose();
        }}
      >
          <header className="tct3d-panel-head">
            <span className="tct3d-avatar" aria-hidden="true">
              <img src="/tct-logo.png" alt="" />
            </span>
            <div className="tct3d-panel-title">
              <strong>TCT Assistant</strong>
              <small>Your intelligent TCT guide</small>
            </div>
            <span className="tct3d-status" aria-hidden="true" />
            <span className="tct3d-status-label">Online</span>
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
              <span className="tct3d-suggestion-label">QUICK ACTIONS</span>
              <div className="tct3d-chips" role="group" aria-label="Quick actions">
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
      </section>

      {/* good night bubble */}
      {(ui.bubble || ui.interactionNotice) && displayBubblePos && (
        <div className={`tct3d-bubble ${mstate.layout?.mobile ? "tct3d-bubble-mobile" : ""}`} style={{ left: displayBubblePos.x, top: displayBubblePos.y }} role="status">
          {ui.interactionNotice || <>Good night! 🌙<br />See you soon!</>}
        </div>
      )}
    </div>
  );
}
