import React, { useRef, useState, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface BaitiLogo3DProps {
  size?: number;
  isLight?: boolean;
}

const Logo3DModel: React.FC<{ isHovered: boolean; isLight: boolean }> = ({ isHovered, isLight }) => {
  const groupRef = useRef<THREE.Group>(null);

  // Materials
  const titaniumMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: isLight ? '#64748B' : '#E2E8F0',
        metalness: 0.85,
        roughness: 0.22,
        envMapIntensity: 1.5,
      }),
    [isLight]
  );

  const goldMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#D4AF37',
        metalness: 0.92,
        roughness: 0.18,
        envMapIntensity: 1.8,
      }),
    []
  );

  const cyanGlowMaterial = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: '#38BDF8',
      }),
    []
  );

  useFrame((_, delta) => {
    if (!groupRef.current) return;

    // Gentle breathing oscillation
    const baseRotationY = Math.sin(Date.now() * 0.0015) * 0.25;
    const targetY = isHovered ? baseRotationY + Math.PI * 0.75 : baseRotationY;
    const targetX = isHovered ? 0.35 : 0.18;

    groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetY, delta * 4);
    groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, targetX, delta * 4);
  });

  return (
    <group ref={groupRef} scale={1.15}>
      {/* VERTICAL PROFILE BEAM (Dormant Montant) */}
      <mesh position={[-0.45, 0, 0]} material={titaniumMaterial}>
        <boxGeometry args={[0.26, 1.4, 0.24]} />
      </mesh>

      {/* HORIZONTAL TOP PROFILE BEAM (Dormant Traverse Haute) */}
      <mesh position={[0.12, 0.57, 0]} material={titaniumMaterial}>
        <boxGeometry args={[0.9, 0.26, 0.24]} />
      </mesh>

      {/* HORIZONTAL MIDDLE PROFILE BEAM (Traverse Intermédiaire) */}
      <mesh position={[0.02, 0, 0]} material={titaniumMaterial}>
        <boxGeometry args={[0.7, 0.22, 0.22]} />
      </mesh>

      {/* HORIZONTAL BOTTOM PROFILE BEAM (Traverse Basse) */}
      <mesh position={[0.12, -0.57, 0]} material={titaniumMaterial}>
        <boxGeometry args={[0.9, 0.26, 0.24]} />
      </mesh>

      {/* RIGHT CLOSING CURVE / DIAGONAL ACCENTS forming the B loops */}
      <mesh position={[0.62, 0.28, 0]} rotation={[0, 0, -Math.PI / 4]} material={titaniumMaterial}>
        <boxGeometry args={[0.24, 0.52, 0.24]} />
      </mesh>
      <mesh position={[0.62, -0.28, 0]} rotation={[0, 0, Math.PI / 4]} material={titaniumMaterial}>
        <boxGeometry args={[0.24, 0.52, 0.24]} />
      </mesh>

      {/* GOLDEN CORNER REINFORCEMENT BRACKETS (Équerres d'assemblage en laiton) */}
      <mesh position={[-0.26, 0.4, 0.13]} material={goldMaterial}>
        <boxGeometry args={[0.12, 0.12, 0.03]} />
      </mesh>
      <mesh position={[-0.26, -0.4, 0.13]} material={goldMaterial}>
        <boxGeometry args={[0.12, 0.12, 0.03]} />
      </mesh>
      <mesh position={[-0.26, 0.12, 0.13]} material={goldMaterial}>
        <boxGeometry args={[0.08, 0.08, 0.03]} />
      </mesh>
      <mesh position={[-0.26, -0.12, 0.13]} material={goldMaterial}>
        <boxGeometry args={[0.08, 0.08, 0.03]} />
      </mesh>

      {/* PRECISION CYAN LASER HIGHLIGHT STRIP */}
      <mesh position={[-0.45, 0, 0.13]} material={cyanGlowMaterial}>
        <boxGeometry args={[0.03, 1.34, 0.01]} />
      </mesh>
    </group>
  );
};

export const BaitiLogo3D: React.FC<BaitiLogo3DProps> = ({ size = 40, isLight = false }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      style={{ width: size, height: size }}
      className="relative flex items-center justify-center cursor-pointer select-none"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      title="Baiti Atelier • Empreinte 3D"
    >
      <Canvas
        camera={{ position: [0, 0, 3.2], fov: 38 }}
        gl={{ antialias: true, alpha: true, powerPreference: 'low-power' }}
      >
        <ambientLight intensity={isLight ? 1.2 : 0.9} />
        <directionalLight position={[3, 4, 3]} intensity={1.8} color="#FFFFFF" />
        <directionalLight position={[-3, 2, -2]} intensity={1.2} color="#38BDF8" />
        <directionalLight position={[0, -2, 2]} intensity={0.7} color="#D4AF37" />

        <Logo3DModel isHovered={isHovered} isLight={isLight} />
      </Canvas>
    </div>
  );
};
