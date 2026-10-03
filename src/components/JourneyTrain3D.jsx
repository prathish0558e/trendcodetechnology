import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

const COACHES = [
  { x: -0.53, color: "#39bff1", accent: "#a4edff" },
  { x: 0, color: "#f39143", accent: "#ffd3a6" },
  { x: 0.53, color: "#39bff1", accent: "#a4edff" },
];

function StudioReflections() {
  const { gl, scene } = useThree();
  useEffect(() => {
    const generator = new THREE.PMREMGenerator(gl);
    const room = new RoomEnvironment();
    const target = generator.fromScene(room, 0.04);
    const previousEnvironment = scene.environment;
    scene.environment = target.texture;
    scene.environmentIntensity = 0.72;
    return () => {
      scene.environment = previousEnvironment;
      target.dispose();
      generator.dispose();
      room.dispose();
    };
  }, [gl, scene]);
  return null;
}

function RoundedBox({ args, radius = 0.035, smoothness = 4, ...props }) {
  const geometry = useMemo(
    () => new RoundedBoxGeometry(...args, smoothness, radius),
    [args, radius, smoothness],
  );
  return <mesh geometry={geometry} {...props} />;
}

function Coach({ coach, index, wheels }) {
  const paint = useMemo(
    () => new THREE.MeshPhysicalMaterial({
      color: "#f4f9ff",
      metalness: 0.24,
      roughness: 0.2,
      clearcoat: 0.9,
      clearcoatRoughness: 0.16,
      envMapIntensity: 1.3,
    }),
    [],
  );
  const livery = useMemo(
    () => new THREE.MeshPhysicalMaterial({
      color: coach.color,
      metalness: 0.34,
      roughness: 0.2,
      clearcoat: 0.8,
      clearcoatRoughness: 0.14,
      envMapIntensity: 1.3,
    }),
    [coach.color],
  );
  const windowMaterial = useMemo(
    () => new THREE.MeshPhysicalMaterial({
      color: "#10243b",
      metalness: 0.34,
      roughness: 0.12,
      clearcoat: 1,
      clearcoatRoughness: 0.08,
      envMapIntensity: 1.7,
    }),
    [],
  );
  const trim = useMemo(
    () => new THREE.MeshStandardMaterial({ color: "#34495d", metalness: 0.72, roughness: 0.3 }),
    [],
  );
  const doorGlass = useMemo(
    () => new THREE.MeshPhysicalMaterial({ color: "#2b5b79", metalness: 0.42, roughness: 0.16, clearcoat: 1 }),
    [],
  );
  const wheelMetal = useMemo(
    () => new THREE.MeshStandardMaterial({ color: "#a8c1d3", metalness: 0.88, roughness: 0.2 }),
    [],
  );

  const centerX = coach.x;
  const carNumber = index + 1;

  return (
    <group position={[centerX, 0, 0]}>
      {/* Sculpted white alloy shell and color-matched lower fairing. */}
      <RoundedBox args={[0.51, 0.37, 0.46]} radius={0.075} smoothness={6} position={[0, 0.018, 0]} castShadow receiveShadow material={paint} />
      <RoundedBox args={[0.48, 0.18, 0.018]} radius={0.03} smoothness={5} position={[0, -0.078, 0.232]} material={livery} />
      <RoundedBox args={[0.48, 0.18, 0.018]} radius={0.03} smoothness={5} position={[0, -0.078, -0.232]} material={livery} />
      <mesh position={[0, -0.034, 0.244]}>
        <boxGeometry args={[0.46, 0.008, 0.008]} />
        <meshStandardMaterial color={coach.accent} metalness={0.46} roughness={0.22} emissive={coach.color} emissiveIntensity={0.08} />
      </mesh>

      {/* Panoramic smoked glazing, split into real individual windows. */}
      {[-0.15, 0.035].map((offset, pane) => (
        <group key={`window-${carNumber}-${pane}`}>
          <RoundedBox args={[0.155, 0.119, 0.018]} radius={0.022} smoothness={5} position={[offset, 0.105, 0.235]} material={windowMaterial} />
          <mesh position={[offset - 0.033, 0.135, 0.246]} rotation={[0, 0, -0.26]}>
            <planeGeometry args={[0.065, 0.009]} />
            <meshBasicMaterial color="#e9faff" transparent opacity={0.47} depthWrite={false} />
          </mesh>
          <RoundedBox args={[0.155, 0.119, 0.018]} radius={0.022} smoothness={5} position={[offset, 0.105, -0.235]} material={windowMaterial} />
        </group>
      ))}

      {/* Sliding doors and narrow, reflective door glass on both sides. */}
      <group position={[0.174, -0.004, 0.238]}>
        <RoundedBox args={[0.105, 0.258, 0.018]} radius={0.012} smoothness={3} material={paint} />
        <RoundedBox args={[0.067, 0.105, 0.009]} radius={0.01} smoothness={3} position={[0, 0.063, 0.011]} material={doorGlass} />
        <mesh position={[-0.043, 0, 0.012]}>
          <boxGeometry args={[0.006, 0.235, 0.006]} />
          <meshStandardMaterial color="#7894a9" metalness={0.7} roughness={0.26} />
        </mesh>
      </group>
      <group position={[0.174, -0.004, -0.238]}>
        <RoundedBox args={[0.105, 0.258, 0.018]} radius={0.012} smoothness={3} material={paint} />
        <RoundedBox args={[0.067, 0.105, 0.009]} radius={0.01} smoothness={3} position={[0, 0.063, -0.011]} material={doorGlass} />
      </group>

      {/* Raised roof cap, AC unit and fine vents create a believable metro silhouette. */}
      <RoundedBox args={[0.37, 0.035, 0.32]} radius={0.06} smoothness={5} position={[-0.03, 0.202, 0]} material={paint} />
      <RoundedBox args={[0.18, 0.045, 0.25]} radius={0.025} smoothness={4} position={[-0.025, 0.238, 0]} material={trim} />
      {[-0.075, -0.025, 0.025, 0.075].map((x) => (
        <mesh key={`vent-${carNumber}-${x}`} position={[x, 0.262, 0]}>
          <boxGeometry args={[0.012, 0.004, 0.17]} />
          <meshStandardMaterial color="#b9cddd" metalness={0.72} roughness={0.26} />
        </mesh>
      ))}

      {/* Dark bogies and paired steel wheels sit directly on the rail line. */}
      <RoundedBox args={[0.34, 0.068, 0.32]} radius={0.024} smoothness={3} position={[0, -0.17, 0]} material={trim} />
      {[-0.155, 0.155].map((wheelX, axle) => (
        [-1, 1].map((side, sideIndex) => {
          const wheelRefIndex = index * 4 + axle * 2 + sideIndex;
          return (
            <group key={`wheel-${carNumber}-${axle}-${side}`} position={[wheelX, -0.184, side * 0.245]} ref={(node) => { if (node) wheels[wheelRefIndex] = node; }}>
              <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
                <cylinderGeometry args={[0.071, 0.071, 0.062, 28]} />
                <meshStandardMaterial color="#172333" metalness={0.55} roughness={0.34} />
              </mesh>
              <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, side * 0.033]}>
                <cylinderGeometry args={[0.038, 0.038, 0.008, 24]} />
                <primitive object={wheelMetal} attach="material" />
              </mesh>
              <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, side * 0.039]}>
                <cylinderGeometry args={[0.012, 0.012, 0.01, 16]} />
                <meshStandardMaterial color={coach.color} metalness={0.5} roughness={0.23} />
              </mesh>
            </group>
          );
        })
      ))}
      <mesh position={[0, -0.174, 0]}>
        <boxGeometry args={[0.32, 0.018, 0.014]} />
        <meshStandardMaterial color="#97b2c7" metalness={0.8} roughness={0.24} />
      </mesh>
    </group>
  );
}

function MetroTrain({ pathRef, duration, keyPoints, keyTimes, startTime, reducedMotion, onStationChange }) {
  const trainRef = useRef();
  const wheelsRef = useRef([]);
  const previousPosition = useRef(null);
  const lastStopRef = useRef(-2);
  const { size, gl } = useThree();
  const cabShell = useMemo(() => new THREE.MeshPhysicalMaterial({ color: "#eaf4ff", metalness: 0.24, roughness: 0.19, clearcoat: 0.9 }), []);
  const cabGlass = useMemo(() => new THREE.MeshPhysicalMaterial({ color: "#0c2138", metalness: 0.38, roughness: 0.13, clearcoat: 1 }), []);
  const routePanel = useMemo(() => new THREE.MeshPhysicalMaterial({ color: "#10243b", metalness: 0.3, roughness: 0.18, clearcoat: 0.8 }), []);

  useFrame(() => {
    const path = pathRef.current;
    const train = trainRef.current;
    if (!path || !train || !duration || keyPoints.length < 2) return;

    const elapsed = reducedMotion ? 0 : Math.max(0, (performance.now() - startTime) / 1000);
    const progress = (elapsed % duration) / duration;
    let segment = keyTimes.length - 2;
    for (let i = 0; i < keyTimes.length - 1; i += 1) {
      if (progress <= keyTimes[i + 1]) {
        segment = i;
        break;
      }
    }
    const span = keyTimes[segment + 1] - keyTimes[segment] || 1;

    // Dwell segments hold the same distance twice (arrival → departure), so a
    // flat pair means the train is stopped at that station. Tell the cards so
    // the matching box can light up while the train rests on it.
    if (onStationChange) {
      const dwelling = keyPoints[segment] === keyPoints[segment + 1] && !reducedMotion;
      const stop = dwelling ? Math.round(segment / 2) : -1;
      if (lastStopRef.current !== stop) {
        lastStopRef.current = stop;
        onStationChange(stop);
      }
    }

    const mix = THREE.MathUtils.clamp((progress - keyTimes[segment]) / span, 0, 1);
    const normalizedDistance = THREE.MathUtils.lerp(keyPoints[segment], keyPoints[segment + 1], mix);
    const totalLength = path.getTotalLength();
    const distance = normalizedDistance * totalLength;
    const point = path.getPointAtLength(distance);
    const before = path.getPointAtLength(Math.max(0, distance - 2));
    const after = path.getPointAtLength(Math.min(totalLength, distance + 2));
    const angle = Math.atan2(-(after.y - before.y), after.x - before.x);
    const svg = path.ownerSVGElement;
    const svgRect = svg.getBoundingClientRect();
    const canvasRect = gl.domElement.getBoundingClientRect();
    const viewBox = svg.viewBox.baseVal;
    const screenX = svgRect.left + (point.x / viewBox.width) * svgRect.width - canvasRect.left;
    const screenY = svgRect.top + (point.y / viewBox.height) * svgRect.height - canvasRect.top;
    const position = [
      (screenX - size.width / 2) / 100,
      (size.height / 2 - screenY) / 100,
    ];
    train.position.set(position[0], position[1], 0.1);
    train.rotation.z = angle;

    // Wheel rotation follows real movement, with the train fading at the loop seam.
    if (previousPosition.current) {
      const travel = Math.hypot(position[0] - previousPosition.current[0], position[1] - previousPosition.current[1]);
      wheelsRef.current.forEach((wheel) => {
        if (wheel) wheel.rotation.z -= travel / 0.071;
      });
    }
    previousPosition.current = position;
    const edgeFade = Math.min(progress / 0.012, (1 - progress) / 0.012, 1);
    const opacity = THREE.MathUtils.smoothstep(edgeFade, 0, 1);
    train.traverse((object) => {
      if (!object.isMesh || !object.material) return;
      const materials = Array.isArray(object.material) ? object.material : [object.material];
      materials.forEach((material) => {
        const needsTransparency = opacity < 1;
        if (material.transparent !== needsTransparency) {
          material.transparent = needsTransparency;
          material.needsUpdate = true;
        }
        if (material.opacity !== opacity) material.opacity = opacity;
        material.depthWrite = !needsTransparency;
        if (material.uniforms?.opacity) material.uniforms.opacity.value = opacity;
      });
    });
  });

  return (
    <group ref={trainRef}>
      {/* Feathered local contact shadow keeps the 3D train grounded above the track. */}
      <mesh position={[0, -0.235, -0.06]} scale={[0.94, 0.09, 1]} renderOrder={-1}>
        <planeGeometry args={[2, 2]} />
        <shaderMaterial
          transparent
          depthWrite={false}
          uniforms={{ color: { value: new THREE.Color("#061322") }, opacity: { value: 1 } }}
          vertexShader="varying vec2 vUv; void main(){vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}"
          fragmentShader="uniform vec3 color; uniform float opacity; varying vec2 vUv; void main(){float d=length((vUv-0.5)*2.0); float a=(1.0-smoothstep(0.0,1.0,d))*0.3*opacity; gl_FragColor=vec4(color,a);}"
        />
      </mesh>

      {COACHES.map((coach, index) => <Coach key={index} coach={coach} index={index} wheels={wheelsRef.current} />)}

      {/* Flexible sealed bellows between coaches. */}
      {[-0.265, 0.265].map((x) => (
        <group key={`bellows-${x}`} position={[x, 0.013, 0]}>
          <mesh>
            <boxGeometry args={[0.055, 0.28, 0.39]} />
            <meshStandardMaterial color="#263b50" roughness={0.54} metalness={0.42} />
          </mesh>
          {[-0.016, 0, 0.016].map((offset) => (
            <mesh key={offset} position={[offset, 0, 0.201]}>
              <boxGeometry args={[0.006, 0.26, 0.006]} />
              <meshStandardMaterial color="#8aa8c1" metalness={0.7} roughness={0.3} />
            </mesh>
          ))}
        </group>
      ))}

      {/* Cab nose, wraparound windscreen and paired headlights. */}
      <RoundedBox args={[0.22, 0.355, 0.432]} radius={0.105} smoothness={7} position={[0.755, 0.026, 0]} material={cabShell} castShadow />
      <RoundedBox args={[0.045, 0.205, 0.315]} radius={0.06} smoothness={6} position={[0.861, 0.112, 0]} material={cabGlass} />
      <mesh position={[0.888, 0.015, 0.2]}>
        <sphereGeometry args={[0.026, 20, 16]} />
        <meshStandardMaterial color="#ffffff" emissive="#bceeff" emissiveIntensity={2.4} toneMapped={false} />
      </mesh>
      <mesh position={[0.888, 0.015, -0.2]}>
        <sphereGeometry args={[0.026, 20, 16]} />
        <meshStandardMaterial color="#ffffff" emissive="#bceeff" emissiveIntensity={2.4} toneMapped={false} />
      </mesh>
      <pointLight position={[0.9, -0.005, 0.22]} color="#9fe8ff" intensity={0.65} distance={0.6} />
      <pointLight position={[0.9, -0.005, -0.22]} color="#9fe8ff" intensity={0.55} distance={0.55} />

      {/* Front TCT route display and a restrained orange marker lamp. */}
      <RoundedBox args={[0.008, 0.055, 0.17]} radius={0.012} smoothness={3} position={[0.872, 0.23, 0]} material={routePanel} />
      <mesh position={[0.88, -0.098, 0.211]}>
        <sphereGeometry args={[0.012, 16, 12]} />
        <meshStandardMaterial color="#ffad68" emissive="#ff722e" emissiveIntensity={0.8} />
      </mesh>
    </group>
  );
}

export default function JourneyTrain3D({ pathRef, duration, keyPoints, keyTimes, startTime, reducedMotion, onStationChange }) {
  const [inView, setInView] = useState(true);
  const containerRef = useRef(null);
  useEffect(() => {
    const node = containerRef.current;
    if (!node || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), {
      rootMargin: "100px 0px",
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="journey-train-canvas" ref={containerRef} aria-hidden="true">
      <Canvas
        orthographic
        dpr={[1, 1.3]}
        frameloop={reducedMotion || !inView ? "demand" : "always"}
        camera={{ position: [0, 3.1, 15], zoom: 100, near: 0.1, far: 50 }}
        gl={{ alpha: true, antialias: true, powerPreference: "low-power", toneMapping: THREE.ACESFilmicToneMapping }}
        onCreated={({ gl, camera }) => {
          gl.setClearColor(0x000000, 0);
          camera.lookAt(0, 0, 0);
          camera.updateProjectionMatrix();
        }}
      >
        <StudioReflections />
        <ambientLight intensity={1.45} color="#edf6ff" />
        <hemisphereLight args={["#e9f6ff", "#263b55", 1.15]} />
        <directionalLight position={[-4, 6, 8]} intensity={2.8} color="#fff8ef" />
        <directionalLight position={[2, 2, -5]} intensity={1.7} color="#79dcff" />
        <pointLight position={[3, 1, 4]} intensity={0.8} distance={7} color="#89dfff" />
        <MetroTrain pathRef={pathRef} duration={duration} keyPoints={keyPoints} keyTimes={keyTimes} startTime={startTime} reducedMotion={reducedMotion} onStationChange={onStationChange} />
      </Canvas>
    </div>
  );
}
