import { useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, ContactShadows, RoundedBox } from "@react-three/drei";
import * as THREE from "three";
import {
  areas3dFor,
  heat3dIntensity,
  heat3dRadius,
  type HeatArea3D,
  type Vehicle3DType,
} from "./bus3d-areas";

function HeatPatch({
  area,
  count,
  max,
  active,
  onHover,
}: {
  area: HeatArea3D;
  count: number;
  max: number;
  active: boolean;
  onHover: (code: string | null) => void;
}) {
  const mesh = useRef<THREE.Mesh>(null);
  const { level, color, base } = heat3dIntensity(count, max);
  const radius = heat3dRadius(count, max);

  useFrame((state) => {
    const m = mesh.current;
    if (!m) return;
    const target = active ? 1.18 : 1;
    const s = m.scale.x + (target - m.scale.x) * 0.18;
    m.scale.set(s, s, s);
    const mat = m.material as THREE.MeshStandardMaterial;
    let e = base + (active ? 0.75 : 0);
    if (level === 3) e += Math.sin(state.clock.elapsedTime * 3.4) * 0.34;
    mat.emissiveIntensity += (e - mat.emissiveIntensity) * 0.2;
  });

  return (
    <mesh
      ref={mesh}
      position={area.pos}
      onPointerOver={(e) => {
        e.stopPropagation();
        onHover(area.code);
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={(e) => {
        e.stopPropagation();
        onHover(null);
        document.body.style.cursor = "auto";
      }}
    >
      <sphereGeometry args={[radius, 32, 32]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={base}
        transparent
        opacity={level === 0 ? 0.22 : 0.82}
        roughness={0.35}
        metalness={0}
        depthWrite={false}
      />
    </mesh>
  );
}

function Wheel({ position, radius = 0.56 }: { position: [number, number, number]; radius?: number }) {
  return (
    <group position={position} rotation={[Math.PI / 2, 0, 0]}>
      <mesh>
        <cylinderGeometry args={[radius, radius, 0.36, 32]} />
        <meshStandardMaterial color="#101014" roughness={0.8} metalness={0} />
      </mesh>
      {[0.19, -0.19].map((y, i) => (
        <mesh key={i} position={[0, y, 0]}>
          <cylinderGeometry args={[radius * 0.42, radius * 0.42, 0.04, 24]} />
          <meshStandardMaterial color="#d4d3c8" roughness={0.3} metalness={0} />
        </mesh>
      ))}
    </group>
  );
}

function BusBody() {
  return (
    <group>
      <RoundedBox args={[6.4, 2.5, 2.4]} radius={0.28} smoothness={5}>
        <meshStandardMaterial color="#f4f2ea" roughness={0.5} metalness={0} />
      </RoundedBox>
      <RoundedBox args={[5.9, 0.36, 2.18]} radius={0.16} smoothness={4} position={[0, 1.3, 0]}>
        <meshStandardMaterial color="#e7e5da" roughness={0.55} metalness={0} />
      </RoundedBox>
      {[1.205, -1.205].map((z, i) => (
        <RoundedBox key={`glass-${i}`} args={[5.1, 0.95, 0.12]} radius={0.1} smoothness={3} position={[0.25, 0.46, z]}>
          <meshStandardMaterial color="#15151c" roughness={0.12} metalness={0} />
        </RoundedBox>
      ))}
      <RoundedBox args={[0.18, 1.05, 2.0]} radius={0.09} smoothness={3} position={[3.16, 0.4, 0]}>
        <meshStandardMaterial color="#171720" roughness={0.1} metalness={0} />
      </RoundedBox>
      <RoundedBox args={[0.18, 0.88, 1.94]} radius={0.09} smoothness={3} position={[-3.16, 0.5, 0]}>
        <meshStandardMaterial color="#171720" roughness={0.12} metalness={0} />
      </RoundedBox>
      {[1.225, -1.225].map((z, i) => (
        <mesh key={`stripe-${i}`} position={[0, -0.18, z]}>
          <boxGeometry args={[6.42, 0.22, 0.04]} />
          <meshStandardMaterial color="#bce416" emissive="#bce416" emissiveIntensity={0.22} roughness={0.4} metalness={0} />
        </mesh>
      ))}
      {[3.18, -3.18].map((x, i) => (
        <RoundedBox key={`bumper-${i}`} args={[0.36, 0.52, 2.32]} radius={0.12} smoothness={3} position={[x, -0.92, 0]}>
          <meshStandardMaterial color="#26262d" roughness={0.55} metalness={0} />
        </RoundedBox>
      ))}
      {[0.78, -0.78].map((z, i) => (
        <mesh key={`hl-${i}`} position={[3.24, -0.5, z]}>
          <boxGeometry args={[0.1, 0.3, 0.52]} />
          <meshStandardMaterial color="#fff6d8" emissive="#fff0bf" emissiveIntensity={0.9} roughness={0.3} metalness={0} />
        </mesh>
      ))}
      {[0.82, -0.82].map((z, i) => (
        <mesh key={`tl-${i}`} position={[-3.24, -0.35, z]}>
          <boxGeometry args={[0.1, 0.56, 0.36]} />
          <meshStandardMaterial color="#ff3d2e" emissive="#ff3d2e" emissiveIntensity={0.75} roughness={0.3} metalness={0} />
        </mesh>
      ))}
      <Wheel position={[2.0, -1.32, 1.02]} />
      <Wheel position={[2.0, -1.32, -1.02]} />
      <Wheel position={[-2.0, -1.32, 1.02]} />
      <Wheel position={[-2.0, -1.32, -1.02]} />
    </group>
  );
}

function CarBody() {
  return (
    <group>
      {/* Lower body */}
      <RoundedBox args={[4.8, 1.0, 2.0]} radius={0.34} smoothness={5} position={[0, -0.15, 0]}>
        <meshStandardMaterial color="#f4f2ea" roughness={0.45} metalness={0} />
      </RoundedBox>
      {/* Cabin */}
      <RoundedBox args={[2.7, 0.95, 1.78]} radius={0.36} smoothness={5} position={[-0.15, 0.6, 0]}>
        <meshStandardMaterial color="#eceada" roughness={0.5} metalness={0} />
      </RoundedBox>
      {/* Side glass */}
      {[0.92, -0.92].map((z, i) => (
        <RoundedBox key={`cg-${i}`} args={[2.3, 0.62, 0.08]} radius={0.12} smoothness={3} position={[-0.15, 0.66, z]}>
          <meshStandardMaterial color="#15151c" roughness={0.12} metalness={0} />
        </RoundedBox>
      ))}
      {/* Windshield + rear glass */}
      <RoundedBox args={[0.5, 0.7, 1.66]} radius={0.12} smoothness={3} position={[1.18, 0.62, 0]} rotation={[0, 0, -0.5]}>
        <meshStandardMaterial color="#171720" roughness={0.1} metalness={0} />
      </RoundedBox>
      <RoundedBox args={[0.5, 0.68, 1.6]} radius={0.12} smoothness={3} position={[-1.42, 0.62, 0]} rotation={[0, 0, 0.55]}>
        <meshStandardMaterial color="#171720" roughness={0.12} metalness={0} />
      </RoundedBox>
      {/* Lime accent */}
      {[1.02, -1.02].map((z, i) => (
        <mesh key={`cs-${i}`} position={[0, -0.28, z]}>
          <boxGeometry args={[4.82, 0.16, 0.04]} />
          <meshStandardMaterial color="#bce416" emissive="#bce416" emissiveIntensity={0.22} roughness={0.4} metalness={0} />
        </mesh>
      ))}
      {/* Bumpers */}
      {[2.42, -2.42].map((x, i) => (
        <RoundedBox key={`cb-${i}`} args={[0.34, 0.5, 1.96]} radius={0.14} smoothness={3} position={[x, -0.34, 0]}>
          <meshStandardMaterial color="#26262d" roughness={0.55} metalness={0} />
        </RoundedBox>
      ))}
      {/* Headlights */}
      {[0.62, -0.62].map((z, i) => (
        <mesh key={`chl-${i}`} position={[2.46, -0.05, z]}>
          <boxGeometry args={[0.1, 0.24, 0.42]} />
          <meshStandardMaterial color="#fff6d8" emissive="#fff0bf" emissiveIntensity={0.9} roughness={0.3} metalness={0} />
        </mesh>
      ))}
      {[0.64, -0.64].map((z, i) => (
        <mesh key={`ctl-${i}`} position={[-2.46, 0.0, z]}>
          <boxGeometry args={[0.1, 0.26, 0.4]} />
          <meshStandardMaterial color="#ff3d2e" emissive="#ff3d2e" emissiveIntensity={0.75} roughness={0.3} metalness={0} />
        </mesh>
      ))}
      <Wheel position={[1.4, -0.78, 0.86]} radius={0.44} />
      <Wheel position={[1.4, -0.78, -0.86]} radius={0.44} />
      <Wheel position={[-1.4, -0.78, 0.86]} radius={0.44} />
      <Wheel position={[-1.4, -0.78, -0.86]} radius={0.44} />
    </group>
  );
}

function VehicleModel({
  vehicleType,
  counts,
  max,
  hovered,
  onHover,
}: {
  vehicleType: Vehicle3DType;
  counts: Record<string, number>;
  max: number;
  hovered: string | null;
  onHover: (code: string | null) => void;
}) {
  return (
    <group>
      {vehicleType === "car" ? <CarBody /> : <BusBody />}
      {areas3dFor(vehicleType).map((a) => (
        <HeatPatch
          key={a.code}
          area={a}
          count={counts[a.code] ?? 0}
          max={max}
          active={hovered === a.code}
          onHover={onHover}
        />
      ))}
    </group>
  );
}

interface Bus3DProps {
  counts: Record<string, number>;
  hovered: string | null;
  onHover: (code: string | null) => void;
  vehicleType?: Vehicle3DType;
}

export function Bus3D({ counts, hovered, onHover, vehicleType = "bus" }: Bus3DProps) {
  const [auto, setAuto] = useState(true);
  const max = Math.max(1, ...Object.values(counts));
  const isCar = vehicleType === "car";

  return (
    <Canvas
      flat
      dpr={[1, 2]}
      gl={{ alpha: true, antialias: true }}
      camera={{ position: isCar ? [7, 3.8, 7.6] : [9.5, 5, 10.5], fov: 35 }}
      onPointerMissed={() => onHover(null)}
    >
      <hemisphereLight args={["#ffffff", "#d6d4c4", 1.1]} />
      <ambientLight intensity={0.35} />
      <directionalLight position={[8, 12, 7]} intensity={2.2} />
      <directionalLight position={[-9, 5, -8]} intensity={0.55} color="#cfe0ff" />

      <VehicleModel vehicleType={vehicleType} counts={counts} max={max} hovered={hovered} onHover={onHover} />

      <ContactShadows position={[0, isCar ? -1.2 : -1.92, 0]} scale={22} far={5} blur={2.8} opacity={0.4} color="#0a0a0c" />
      <gridHelper args={[48, 48, "#d8d6c8", "#e7e5db"]} position={[0, isCar ? -1.21 : -1.93, 0]} />

      <OrbitControls
        makeDefault
        enablePan={false}
        enableDamping
        dampingFactor={0.08}
        minDistance={isCar ? 5 : 7}
        maxDistance={22}
        minPolarAngle={Math.PI * 0.1}
        maxPolarAngle={Math.PI * 0.5}
        autoRotate={auto}
        autoRotateSpeed={0.85}
        onStart={() => setAuto(false)}
      />
    </Canvas>
  );
}
