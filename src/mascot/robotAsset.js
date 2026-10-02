/*
 * Contract for an optional production TCT character.
 * Put the rigged file in public/models/tct-robot.glb and set
 * VITE_TCT_ROBOT_GLB=/models/tct-robot.glb. Without that setting (or if the
 * file is missing/incompatible), the explicitly named procedural placeholder
 * remains active. The page never swaps to a still image.
 */

export const ROBOT_GLB_URL = String(import.meta.env.VITE_TCT_ROBOT_GLB || "").trim();

export const REQUIRED_ROBOT_NODES = [
  "Torso shell", "TCT badge frame", "HeadPivot", "EyeLeft", "EyeRight",
  "EyeClosedLeft", "EyeClosedRight", "Arm_L", "Elbow_L", "Arm_R", "Elbow_R",
  "Leg_L", "Knee_L", "Foot_L", "Leg_R", "Knee_R", "Foot_R",
];

const CLIP_ALIASES = {
  sleep: ["Sleep", "Sleeping", "Idle"],
  waking: ["WakeUp", "Wake", "SitUp"],
  stretch: ["Stretch", "WakeUp", "Idle"],
  transform: ["Stand", "SitToStand", "StandUp"],
  walk: ["Walk"],
  walkback: ["Walk"],
  arrive: ["Idle", "Stand"],
  chat: ["Talk", "Idle"],
  goodnight: ["Wave", "Goodbye"],
  dissolve: ["Turn", "TurnAround", "Idle"],
  board: ["Climb", "LieDown", "Walk"],
  settle: ["LieDown", "Sleep"],
};

const normalize = (value) => String(value || "").replace(/[^a-z0-9]/gi, "").toLowerCase();

export function findRobotClip(clips, phase) {
  const names = (CLIP_ALIASES[phase] || []).map(normalize);
  return clips.find((clip) => names.includes(normalize(clip.name))) || null;
}

export function missingRobotNodes(root) {
  const names = new Set();
  root.traverse((object) => object.name && names.add(object.name));
  return REQUIRED_ROBOT_NODES.filter((name) => !names.has(name));
}

