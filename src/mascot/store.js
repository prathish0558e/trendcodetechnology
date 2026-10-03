import { gsap } from "gsap";

/*
 * TCT 3D mascot — shared state machine.
 *
 * The full loop (fully repeatable):
 *   sleep → waking → stretch → transform → walk → arrive → chat
 *        → goodnight → dissolve → walkback → board → settle → sleep
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
  thinking: false,
  smile: false,
  bubble: false,
  reduced: false,
  mobile: false,
  layout: null,
  eyeLeft: { x: 0, y: 0, z: 0 },
  eyeRight: { x: 0, y: 0, z: 0 },
  projectionPixel: null,
  rig: { x: 0, y: 0.9, z: 8.6 }, // camera rig — tweened, read per frame by Scene
};

const listeners = new Set();
let ui = snapshot();

function snapshot() {
  return {
    phase: state.phase,
    chatOpen: state.chatOpen,
    thinking: state.thinking,
    bubble: state.bubble,
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
  const tallMobile = mobile && h > 700;
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
  const home = toWorld(
    (whatsappLeft + whatsappSize / 2) / w,
    (whatsappTop - mascotGapPx - cloudHeightPx / 2) / h
  );
  const cloudTop = home.y + cloudR * 0.62;

  // The robot walks a little ABOVE the floor line so its feet (which hang
  // ~0.62 world units below its root) land exactly ON the floor, not inside it.
  const legLift = mobile ? 0.26 : 0.3;

  // Stage — on mobile, keep the complete character below the navbar and above
  // the chat bottom sheet, centered horizontally. On tall phones the character
  // rises from the cloud toward the visual center while keeping its face forward.
  const stage = mobile
    ? { x: toWorld(0.52, 0).x, y: toWorld(0.5, tallMobile ? 0.46 : 0.43).y }
    : { x: toWorld(0.4, 0).x, y: cloudTop - 0.1 };

  // Hologram anchor — inner-left area of the DOM chat panel.
  const beamAnchor = mobile
    ? { x: 0, y: toWorld(0.5, tallMobile ? 0.5 : 0.34).y }
    : { x: toWorld(0.64, 0).x, y: cloudTop + 1.58 };

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

// DOM hologram's impact location in viewport pixels. The Three.js projector
// converts this point to the scene camera ray so the panel and both beams meet.
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
  transform: "walk",
  walk: "arrive",
  arrive: "chat",
  goodnight: "dissolve",
  dissolve: "walkback",
  walkback: "board",
  board: "settle",
  settle: "sleep",
};

const EASE = {
  waking: "power2.inOut",
  stretch: "power2.inOut",
  transform: "power1.inOut",
  walk: "none",
  walkback: "none",
  arrive: "power1.inOut",
  goodnight: "power1.inOut",
  dissolve: "power1.in",
  board: "power2.inOut",
  settle: "power2.inOut",
};

const WALK_SPEED = 1.85; // world units / second — a trot, not a teleport

function duration(phase) {
  if (state.reduced) return 0.12; // near-instant, no cinematic sweep
  const L = state.layout;
  switch (phase) {
    case "waking": return 2.3;
    case "stretch": return 1.8;
    case "transform": return 2.4;
    case "walk":
    case "walkback": {
      if (!L) return 3;
      const d = Math.hypot(L.stage.x - L.home.x, L.stage.y - L.home.y);
      return Math.max(2.2, d / WALK_SPEED);
    }
    case "arrive": return 2.1;
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
  killTweens();
  state.phase = phase;
  state.t = phase === "sleep" || phase === "chat" ? 1 : 0;
  state.smile = phase === "goodnight";
  if (phase === "chat") state.chatOpen = true; // hologram appears as the robot settles
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
    sleep: base, waking: base, stretch: base, board: base, settle: base,
    transform: near, walk: near, walkback: near,
    arrive: near, chat: near, goodnight: near, dissolve: base,
  };
  rigTween = gsap.to(state.rig, {
    ...targets[phase],
    duration: Math.max(1.4, duration(phase) * 0.8),
    ease: "power2.inOut",
  });
}

/* ------------------------- public actions ------------------------- */

export function wake() {
  if (state.phase !== "sleep") return;
  goto("waking");
}

export function openChat() {
  state.chatOpen = true;
  emit();
}

export function closeChat() {
  if (state.phase !== "chat") return;
  state.chatOpen = false;
  state.thinking = false;
  state.bubble = true; // "Good night! 🌙 See you soon!"
  emit();
  goto("goodnight");
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
  emit();
}
