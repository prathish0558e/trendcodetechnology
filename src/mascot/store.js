import { gsap } from "gsap";

/*
 * TCT 3D mascot — shared state machine.
 *
 * The full loop (fully repeatable):
 *   sleep → waking → stretch → transform → walk → arrive → chat
 *        → goodnight → dissolve → walkback → board → settle → sleep
 * The companion gesture branch is:
 *   sleep → pickup → pickupIdle → throw → throwLand → recover → walkback
 *        → board → settle → sleep
 *
 * `state.t` is the 0→1 progress of the current phase. It is mutated every
 * frame by a gsap tween but is NOT emitted to React (no per-frame renders).
 * Only discrete changes (phase, chatOpen, thinking, bubble) emit so the DOM
 * overlays can re-render.
 */

export const state = {
  phase: "sleep",
  t: 1,
  chatOpen: false,
  panelVisible: false,
  thinking: false,
  smile: false,
  bubble: false,
  interactionNotice: "",
  pickupFromChat: false,
  pickupBase: null,
  panelCarried: false,
  reduced: false,
  mobile: false,
  layout: null,
  eyeLeft: { x: 0, y: 0, z: 0 },
  eyeRight: { x: 0, y: 0, z: 0 },
  projectionPixel: null,
  pickupHeight: 0,
  pickupX: 0,
  pickupLookX: 0,
  pickupLookY: 0,
  returningHome: false,
  throwMotion: { x: 0, y: 0, vx: 0, vy: 0, spin: 0, angularVelocity: 0, startX: 0, startY: 0, targetX: 0, targetY: 0, flight: 0, flightDuration: 1, force: 0, landX: 0, landY: 0, impact: 0, impactSerial: 0, bounces: 0 },
  rig: { x: 0, y: 0.9, z: 8.6 }, // camera rig — tweened, read per frame by Scene
};

const listeners = new Set();
let ui = snapshot();

function snapshot() {
  return {
    phase: state.phase,
    chatOpen: state.chatOpen,
    panelVisible: state.panelVisible,
    thinking: state.thinking,
    bubble: state.bubble,
    interactionNotice: state.interactionNotice,
    panelCarried: state.panelCarried,
    reduced: state.reduced,
  };
}

function emit() {
  ui = snapshot();
  listeners.forEach((fn) => fn());
}

export function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function getUi() {
  return ui;
}

/* ------------------------------------------------------------------ */
/* Layout: world positions derived from viewport (camera maths kept   */
/* in sync with Scene.jsx defaults: fov 42, camera z 8.6, camY 0.9).  */
/* ------------------------------------------------------------------ */

export function computeLayout() {
  // Derive scene coordinates from the actual fixed scene host and the actual
  // WhatsApp launcher rectangle. This keeps the cloud/mascot pixel-aligned
  // even when a browser reserves width for its scrollbar or mobile safe areas.
  const hostRect = document.querySelector(".tct3d-wrap")?.getBoundingClientRect();
  const w = hostRect?.width || document.documentElement.clientWidth || window.innerWidth;
  const h = hostRect?.height || document.documentElement.clientHeight || window.innerHeight;
  const hostLeft = hostRect?.left || 0;
  const hostTop = hostRect?.top || 0;
  const mobile = w < 720;
  const compact = mobile && h < 600;
  const camY = 0.9;
  const camZ = 8.6;
  const halfH = Math.tan(((42 / 2) * Math.PI) / 180) * camZ; // ≈ 3.30
  const halfW = halfH * (w / h);

  const toWorld = (fx, fy) => ({
    x: (fx * 2 - 1) * halfW,
    y: camY + (1 - 2 * fy) * halfH,
  });

  // Keep the cloud directly above WhatsApp at its actual fixed CSS position.
  // Reserve a small gap so the two floating controls stay individually tappable.
  const pixelsPerWorld = h / (2 * halfH);
  const whatsappRect = document.querySelector(".wa-float")?.getBoundingClientRect();
  const whatsappSize = whatsappRect?.width || 50;
  const whatsappLeft = whatsappRect ? whatsappRect.left - hostLeft : 22;
  const whatsappTop = whatsappRect
    ? whatsappRect.top - hostTop
    : h - (w <= 639 ? 96 : 22) - whatsappSize;
  const cloudR = Math.min(0.64, Math.max(0.24, 84 / (2.54 * pixelsPerWorld)));
  const mascotScale = Math.min(0.42, 50 / (2.6 * pixelsPerWorld));
  const activeMascotScale = Math.min(0.44, mascotScale * 1.55);
  const cloudHeightPx = 1.16 * cloudR * pixelsPerWorld;
  const mascotGapPx = 12;
  // Keep the complete cloud + robot silhouette inside the left viewport edge.
  // The launcher sits very close to that edge; centering the wider cloud on it
  // clipped the robot's antenna/head on common desktop and phone widths.
  const cloudSafeMarginPx = Math.min(w * 0.42, Math.max(
    1.35 * cloudR * pixelsPerWorld,
    1.35 * activeMascotScale * pixelsPerWorld
  ));
  const homeCenterXpx = Math.max(
    cloudSafeMarginPx,
    Math.min(w - cloudSafeMarginPx, whatsappLeft + whatsappSize / 2 + cloudR * pixelsPerWorld * 0.9)
  );
  const home = toWorld(
    homeCenterXpx / w,
    (whatsappTop - mascotGapPx - cloudHeightPx / 2) / h
  );
  const cloudTop = home.y + cloudR * 0.62;

  // The robot walks a little ABOVE the floor line so its feet (which hang
  // ~0.62 world units below its root) land exactly ON the floor, not inside it.
  const legLift = mobile ? 0.26 : 0.3;

  // Keep the whole character inside a safe viewport zone while it walks away
  // from the launcher. The mobile chat is a bottom sheet, so stage the robot
  // above it; on desktop it stands just left of the centered hologram panel.
  const stageMarginPx = Math.min(w * 0.42, Math.max(18, 1.35 * activeMascotScale * pixelsPerWorld));
  const stageCenterPx = Math.max(stageMarginPx, Math.min(w - stageMarginPx, w * (mobile ? 0.5 : 0.52)));
  const requestedStageY = mobile
    ? Math.min(0.45, Math.max(0.37, 0.45 - Math.max(0, h - 400) * 0.0004))
    : 0.74;
  // The walk destination is the robot's feet. Reserve space above for its
  // antenna/head and below for the mobile chat sheet so every pose remains
  // inside the visible viewport, even on short embedded browser windows.
  const robotHeightPx = 2.9 * activeMascotScale * pixelsPerWorld;
  const safeTopPx = Math.max(88, Math.min(112, h * 0.2));
  const stageMinY = (safeTopPx + robotHeightPx) / h;
  const stageFloorPx = mobile
    ? h - h * (compact ? 0.48 : 0.5) - 22
    : h - 42;
  const stageMaxY = Math.max(stageMinY, stageFloorPx / h);
  const stageY = Math.max(stageMinY, Math.min(stageMaxY, requestedStageY));
  const stage = {
    x: toWorld(stageCenterPx / w, 0).x,
    y: toWorld(0.5, stageY).y,
  };

  // Hologram anchor — near the inner-left edge of the DOM chat panel.
  const beamAnchor = mobile
    ? { x: 0, y: toWorld(0.5, 0.52).y }
    : { x: toWorld(0.64, 0).x, y: toWorld(0.5, 0.68).y };

  state.mobile = mobile;
  state.layout = { w, h, mobile, compact, halfW, halfH, camY, camZ, home, cloudR, cloudTop, floorY: cloudTop, legLift, stage, beamAnchor, mascotScale, activeMascotScale };
  emit();
  return state.layout;
}

/* Project a world point (at z≈0) to screen px using the current rig. */
export function projectToScreen(x, y) {
  const L = state.layout;
  if (!L) return { x: 0, y: 0 };
  const dist = state.rig.z;
  const halfH = Math.tan(((42 / 2) * Math.PI) / 180) * dist;
  const halfW = halfH * (L.w / L.h);
  return {
    x: ((x - state.rig.x) / (2 * halfW) + 0.5) * L.w,
    y: ((1 - (y - state.rig.y) / halfH) / 2) * L.h,
  };
}

// DOM hologram's impact location in viewport pixels. The Three.js mouth
// projector converts this to a scene point so its beam meets the panel.
export function setProjectionPixel(point) {
  state.projectionPixel = point && Number.isFinite(point.x) && Number.isFinite(point.y)
    ? { x: point.x, y: point.y }
    : null;
}

/* ------------------------------------------------------------------ */
/* Phase runner                                                        */
/* ------------------------------------------------------------------ */

const NEXT = {
  waking: "stretch",
  stretch: "transform",
  pickup: "pickupIdle",
  throwLand: "recover",
  recover: "walkback",
  transform: "walk",
  walk: "arrive",
  arrive: "project",
  project: "chat",
  goodnight: "dissolve",
  dissolve: "walkback",
  walkback: "board",
  board: "settle",
  settle: "sleep",
};

const EASE = {
  waking: "power2.inOut",
  stretch: "power2.inOut",
  pickup: "power2.out",
  throwLand: "power2.out",
  recover: "power2.out",
  transform: "power1.inOut",
  walk: "none",
  walkback: "none",
  arrive: "power1.inOut",
  project: "power2.out",
  goodnight: "power1.inOut",
  dissolve: "power1.in",
  board: "power2.inOut",
  settle: "power2.inOut",
};

const WALK_SPEED = 1.85; // world units / second — a trot, not a teleport

function duration(phase) {
  const L = state.layout;
  if (state.reduced) {
    // Honor reduced-motion preferences without turning the walk into a jump.
    // Keep travel visibly continuous; shorten poses and the projector sweep.
    switch (phase) {
      case "waking": return 0.72;
      case "stretch": return 0.62;
      case "pickup": return 0.42;
      case "throwLand": return 0.72;
      case "recover": return 0.5;
      case "transform": return 0.62;
      case "walk":
      case "walkback": {
        if (!L) return 1.4;
        const d = state.returningHome && phase === "walkback"
          ? Math.hypot(state.throwMotion.landX - L.home.x, state.throwMotion.landY - (L.floorY + L.legLift))
          : Math.hypot(L.stage.x - L.home.x, L.stage.y - L.home.y);
        return Math.max(state.returningHome && phase === "walkback" ? 0.92 : 1.35, d / (state.returningHome && phase === "walkback" ? 4.1 : 3.1));
      }
      case "arrive": return 0.34;
      case "project": return 0.5;
      case "goodnight": return 0.9;
      case "dissolve": return 0.4;
      case "board": return 0.72;
      case "settle": return 0.82;
      default: return 0.12;
    }
  }
  switch (phase) {
    case "waking": return 1.3;
    case "stretch": return 1.0;
    case "pickup": return 0.7;
    case "throwLand": return 0.9;
    case "recover": return 0.78;
    case "transform": return 1.1;
    case "walk":
    case "walkback": {
      if (!L) return 3;
      const d = state.returningHome && phase === "walkback"
        ? Math.hypot(state.throwMotion.landX - L.home.x, state.throwMotion.landY - (L.floorY + L.legLift))
        : Math.hypot(L.stage.x - L.home.x, L.stage.y - L.home.y);
      return Math.max(state.returningHome && phase === "walkback" ? 1.15 : 1.8, d / (state.returningHome && phase === "walkback" ? 3.25 : 2.25));
    }
    case "arrive": return 0.5;
    case "project": return 0.72;
    case "goodnight": return 2.9;
    case "dissolve": return 1.6;
    case "board": return 1.7;
    case "settle": return 2.5;
    default: return 0; // sleep / chat wait for the visitor
  }
}

let currentTween = null;
let rigTween = null;

function killTweens() {
  if (currentTween) currentTween.kill();
  if (rigTween) rigTween.kill();
  currentTween = rigTween = null;
}

function goto(phase) {
  const previousPhase = state.phase;
  killTweens();
  state.phase = phase;
  state.t = phase === "sleep" || phase === "chat" ? 1 : 0;
  if (phase === "sleep") {
    state.returningHome = false;
    state.pickupFromChat = false;
    state.pickupBase = null;
    state.panelCarried = false;
    state.interactionNotice = "";
    state.chatOpen = false;
    state.panelVisible = false;
  }
  if (phase === "pickupIdle" && previousPhase === "throwLand") {
    state.pickupHeight = 0;
    state.pickupX = 0;
    state.throwMotion.x = 0;
    state.throwMotion.y = 0;
    state.throwMotion.vx = 0;
    state.throwMotion.vy = 0;
    state.throwMotion.spin = 0;
    state.throwMotion.angularVelocity = 0;
    state.throwMotion.landX = 0;
  }
  if (phase === "recover") state.interactionNotice = "";
  state.smile = phase === "goodnight";
  if (phase === "chat") {
    state.chatOpen = true;
    state.panelVisible = true;
  }
  if (phase === "dissolve") state.panelVisible = false;
  if (phase === "walkback") state.bubble = false; // goodnight bubble fades on turn-around
  emit();

  const d = duration(phase);
  if (d > 0) {
    currentTween = gsap.to(state, {
      t: 1,
      duration: d,
      ease: EASE[phase] || "none",
      onComplete: () => {
        const next = NEXT[phase];
        if (next) goto(next);
      },
    });
  }
  moveRig(phase);
}

/* Camera rig targets per phase — subtle dolly, never a shake. */
function moveRig(phase) {
  if (state.reduced) return;
  const L = state.layout;
  const base = { x: 0, y: 0.9, z: 8.6 };
  const near = L
    ? { x: Math.min(L.stage.x * 0.12, L.home.x * 0.1), y: 0.98, z: L.mobile ? 8.0 : 7.75 }
    : { x: 0.2, y: 0.98, z: 7.75 };
  const targets = {
    sleep: base, waking: base, stretch: base, pickup: base, pickupIdle: base,
    throw: base, throwLand: base, recover: base, board: base, settle: base,
    transform: near, walk: near, walkback: near,
    arrive: near, project: near, chat: near, goodnight: near, dissolve: base,
  };
  rigTween = gsap.to(state.rig, {
    ...targets[phase],
    duration: Math.max(1.4, duration(phase) * 0.8),
    ease: "power2.inOut",
  });
}

/* ------------------------- public actions ------------------------- */

export function wake() {
  if (state.phase === "sleep") {
    goto("waking");
  } else if (state.phase === "pickupIdle") {
    // Continue the already-awake mascot into the usual chat walk cycle.
    goto("stretch");
  }
}

export function beginPickup({ fromChat = false } = {}) {
  if (!["sleep", "pickupIdle", "chat", "throw", "throwLand", "recover", "walkback"].includes(state.phase)) return false;
  const L = state.layout;
  let pickupBase = null;
  if (L) {
    if (state.phase === "throw") pickupBase = { x: state.throwMotion.x, y: state.throwMotion.y };
    else if (["throwLand", "recover"].includes(state.phase)) pickupBase = { x: state.throwMotion.landX, y: state.throwMotion.landY };
    else if (state.phase === "walkback" && state.returningHome) {
      const homeY = L.floorY + 0.158 * (L.activeMascotScale || 1);
      pickupBase = {
        x: state.throwMotion.landX + (L.home.x - state.throwMotion.landX) * state.t,
        y: state.throwMotion.landY + (homeY - state.throwMotion.landY) * state.t,
      };
    } else if (fromChat) pickupBase = { x: L.stage.x, y: L.stage.y + 0.158 * (L.activeMascotScale || 1) };
  }
  state.pickupHeight = 0;
  state.pickupX = 0;
  state.pickupLookX = 0;
  state.pickupLookY = 0;
  state.returningHome = false;
  state.pickupFromChat = fromChat;
  state.pickupBase = pickupBase;
  state.panelCarried = fromChat || state.panelCarried;
  state.interactionNotice = "Hey! Don’t do that!";
  Object.assign(state.throwMotion, { x: 0, y: 0, vx: 0, vy: 0, spin: 0, angularVelocity: 0, startX: 0, startY: 0, targetX: 0, targetY: 0, flight: 0, flightDuration: 1, force: 0, impact: 0, bounces: 0 });
  goto("pickup");
  return true;
}

export function movePickup({ height, x, lookX, lookY }) {
  if (state.phase !== "pickup" && state.phase !== "pickupIdle") return;
  state.pickupHeight = Math.max(0, Math.min(1.25, Number(height) || 0));
  const edge = state.layout ? Math.max(0.1, Math.min(0.34, state.layout.cloudR * 0.5)) : 0.24;
  state.pickupX = Math.max(-edge, Math.min(edge, Number(x) || 0));
  state.pickupLookX = Math.max(-1, Math.min(1, Number(lookX) || 0));
  state.pickupLookY = Math.max(-1, Math.min(1, Number(lookY) || 0));
}

export function releasePickup({ velocityX = 0, velocityY = 0, dropX, dropY } = {}) {
  if (state.phase !== "pickup" && state.phase !== "pickupIdle") return;
  const motion = state.throwMotion;
  const L = state.layout;
  const edgeX = L ? Math.max(0.55, L.halfW * 0.94) : 2.7;
  const floorY = L ? L.floorY + 0.158 * (L.activeMascotScale || 1) : 0;
  // A release can land anywhere in the visible scene, rather than being
  // artificially clipped to the small cloud. The throw animation still uses
  // a short, safe arc and the recovery walk brings the robot back home.
  const pickupBaseX = state.pickupBase?.x ?? (L ? (state.pickupFromChat ? L.stage.x : L.home.x) : 0);
  const pickupBaseY = state.pickupBase?.y ?? (L ? (state.pickupFromChat ? L.stage.y + 0.158 * (L.activeMascotScale || 1) : L.cloudTop) : 0);
  motion.x = pickupBaseX + state.pickupX;
  motion.y = pickupBaseY + state.pickupHeight;
  motion.vx = Math.max(-3.8, Math.min(3.8, Number(velocityX) || 0));
  motion.vy = Math.max(-2.2, Math.min(2.8, Number(velocityY) || 0));
  const force = Math.hypot(motion.vx, motion.vy);
  const aimedX = Number.isFinite(dropX) ? dropX : motion.x;
  const aimedY = Number.isFinite(dropY) ? dropY : floorY;
  // The release speed materially extends the throw; cursor position only
  // supplies its direction. This avoids the old short fixed-range toss.
  motion.force = force;
  motion.targetX = Math.max(-edgeX, Math.min(edgeX, motion.x + (aimedX - motion.x) * 1.15 + motion.vx * 0.58));
  motion.targetY = Math.max(floorY, Math.min((L?.camY || 0.9) + (L?.halfH || 3.3) * 0.88, motion.y + (aimedY - motion.y) * 0.72 + motion.vy * 0.22));
  motion.startX = motion.x;
  motion.startY = motion.y;
  motion.flight = 0;
  motion.flightDuration = Math.max(0.48, Math.min(1.72, 0.52 + force * 0.13 + Math.hypot(motion.targetX - motion.x, motion.targetY - motion.y) * 0.11));
  state.returningHome = true;
  motion.spin = 0;
  motion.angularVelocity = Math.max(-2.2, Math.min(2.2, motion.vx * 1.2));
  motion.landX = motion.targetX;
  motion.landY = motion.targetY;
  motion.impact = 0;
  motion.bounces = 0;
  goto("throw");
}

/* Integrate a short, bounded toss to a visible landing point. After the impact
   the robot gets up, walks back to its cloud-bed and goes back to sleep. */
export function advanceThrow(dt) {
  if (state.phase !== "throw") return;
  const motion = state.throwMotion;
  const L = state.layout;
  if (!L) return;
  const step = Math.min(Math.max(Number(dt) || 0, 0), 0.05);
  if (!step) return;

  motion.flight += step / (state.reduced ? Math.min(0.85, motion.flightDuration) : motion.flightDuration);
  const p = Math.min(1, motion.flight);
  const travel = p * p * (3 - 2 * p);
  const arc = Math.sin(Math.PI * p) * Math.max(0.38, Math.min(1.32, 0.34 + motion.force * 0.16));
  motion.x = motion.startX + (motion.targetX - motion.startX) * travel;
  motion.y = motion.startY + (motion.targetY - motion.startY) * travel + arc;
  motion.angularVelocity *= Math.exp(-1.6 * step);
  motion.spin = Math.max(-0.48, Math.min(0.48, motion.spin + motion.angularVelocity * step));

  if (p >= 1) {
    motion.x = motion.targetX;
    motion.y = motion.targetY;
    motion.impact = Math.min(1, 0.38 + Math.hypot(motion.vx, motion.vy) / 5);
    motion.impactSerial += 1;
    motion.landX = motion.x;
    motion.landY = motion.y;
    state.pickupHeight = 0;
    state.pickupX = 0;
    goto("throwLand");
    return;
  }

  state.pickupHeight = motion.y;
  state.pickupX = motion.x;
}

export function openChat() {
  state.chatOpen = true;
  emit();
}

export function closeChat() {
  if (state.phase !== "chat") return;
  state.chatOpen = false;
  state.panelVisible = true;
  state.thinking = false;
  state.bubble = true; // "Good night! 🌙 See you soon!"
  goto("goodnight");
}

/* Fallback (2D) path: the CSS robot has no walk animation to play, so the
   conversation is opened and closed instantly instead of running the full
   cinematic loop. Keeps the same phase names so the chat UI is unchanged. */
export function openChatInstant() {
  killTweens();
  state.phase = "chat";
  state.t = 1;
  state.chatOpen = true;
  state.panelVisible = true;
  state.bubble = false;
  state.smile = false;
  emit();
}

export function closeChatInstant() {
  killTweens();
  state.phase = "sleep";
  state.t = 1;
  state.chatOpen = false;
  state.panelVisible = false;
  state.thinking = false;
  state.bubble = false;
  state.smile = false;
  emit();
}

export function finishPanelClose() {
  if (state.chatOpen || !state.panelVisible) return;
  state.panelVisible = false;
  emit();
}

export function setThinking(v) {
  if (state.thinking === v) return;
  state.thinking = v;
  emit();
}

/* On dissolve end the bubble goes away — hook it to the phase change. */
export function onPhaseReached(phase, fn) {
  if (state.phase === phase) fn();
}

/* Boot: measure layout, listen to resize, land in sleep. */
let booted = false;
export function boot(preferReduced) {
  state.reduced = !!preferReduced;
  if (booted) { computeLayout(); return; }
  booted = true;
  computeLayout();
  window.addEventListener("resize", computeLayout);
  state.phase = "sleep";
  state.t = 1;
  state.chatOpen = false;
  state.panelVisible = false;
  emit();
}
