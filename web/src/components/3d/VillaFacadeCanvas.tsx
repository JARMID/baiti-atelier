import React, { useRef, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';

export interface FacadeOpening {
  id: string;
  refCode: string;
  name: string;
  floor: 'RDC' | 'R+1';
  x: number; // meters from facade center
  y: number; // elevation from ground level in meters
  widthMm: number;
  heightMm: number;
  type: 'sliding_bay' | 'casement_window' | 'entrance_door' | 'tilt_turn';
  profileColor: string;
  hasShutter: boolean;
  shutterPosition: number; // 0 closed, 100 open
  hasGrille: boolean;
  hasBalcony: boolean;
  unitPriceDzd: number;
}

export type WallFinish = 'enduit_blanc' | 'pierre_saharienne' | 'crepis_anthracite';
export type LightingAtmosphere = 'day' | 'golden_hour' | 'night';

interface Opening3DProps {
  opening: FacadeOpening;
  isSelected: boolean;
  onSelect: (id: string) => void;
  atmosphere: LightingAtmosphere;
}

const SingleOpening3D: React.FC<Opening3DProps> = ({
  opening,
  isSelected,
  onSelect,
  atmosphere,
}) => {
  const w = opening.widthMm / 1000;
  const h = opening.heightMm / 1000;
  const shutterCurtainRef = useRef<THREE.Mesh>(null);

  // Smoothly lerp shutter position
  useFrame((_, delta) => {
    if (shutterCurtainRef.current && opening.hasShutter) {
      const openRatio = opening.shutterPosition / 100;
      // 0 = fully closed (covers entire window height h), 1 = fully open (height ~ 0.05m)
      const targetScaleY = Math.max(0.05, 1 - openRatio);
      shutterCurtainRef.current.scale.y = THREE.MathUtils.damp(
        shutterCurtainRef.current.scale.y,
        targetScaleY,
        8,
        delta
      );
      // Position offset when scaling from top
      const curScale = shutterCurtainRef.current.scale.y;
      shutterCurtainRef.current.position.y = (h / 2) - (h * curScale / 2);
    }
  });

  const frameColor = opening.profileColor;
  const isNight = atmosphere === 'night';
  const interiorLightIntensity = isNight ? (opening.shutterPosition > 15 ? 2.8 : 0.4) : 0.0;

  return (
    <group
      position={[opening.x, opening.y + h / 2, 0.18]}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(opening.id);
      }}
    >
      {/* Selection Halo */}
      {isSelected && (
        <mesh position={[0, 0, 0.06]}>
          <planeGeometry args={[w + 0.12, h + 0.12]} />
          <meshBasicMaterial
            color="#D4AF37"
            wireframe
            transparent
            opacity={0.85}
          />
        </mesh>
      )}

      {/* Recessed Masonry Reveal / Encadrement */}
      <mesh position={[0, 0, -0.08]} receiveShadow>
        <boxGeometry args={[w + 0.08, h + 0.08, 0.22]} />
        <meshStandardMaterial
          color="#D8D4CD"
          roughness={0.9}
        />
      </mesh>

      {/* Marble / Aluminum Sill (Appui de fenêtre) */}
      {opening.type !== 'entrance_door' && (
        <mesh position={[0, -h / 2 - 0.03, 0.06]} castShadow receiveShadow>
          <boxGeometry args={[w + 0.14, 0.06, 0.22]} />
          <meshStandardMaterial
            color="#EAE5DC"
            roughness={0.4}
            metalness={0.1}
          />
        </mesh>
      )}

      {/* Exterior Frame (Dormant) */}
      {/* Top Jamb */}
      <mesh position={[0, h / 2 - 0.025, 0.02]} castShadow>
        <boxGeometry args={[w, 0.05, 0.06]} />
        <meshStandardMaterial color={frameColor} roughness={0.35} metalness={0.7} />
      </mesh>
      {/* Bottom Jamb */}
      <mesh position={[0, -h / 2 + 0.025, 0.02]} castShadow>
        <boxGeometry args={[w, 0.05, 0.06]} />
        <meshStandardMaterial color={frameColor} roughness={0.35} metalness={0.7} />
      </mesh>
      {/* Left Stile */}
      <mesh position={[-w / 2 + 0.025, 0, 0.02]} castShadow>
        <boxGeometry args={[0.05, h, 0.06]} />
        <meshStandardMaterial color={frameColor} roughness={0.35} metalness={0.7} />
      </mesh>
      {/* Right Stile */}
      <mesh position={[w / 2 - 0.025, 0, 0.02]} castShadow>
        <boxGeometry args={[0.05, h, 0.06]} />
        <meshStandardMaterial color={frameColor} roughness={0.35} metalness={0.7} />
      </mesh>

      {/* Central Mullion / Divider for 2-Sash Windows and Sliding Bays */}
      {(opening.type === 'sliding_bay' || opening.type === 'casement_window' || w > 1.6) && (
        <mesh position={[0, 0, 0.02]} castShadow>
          <boxGeometry args={[0.05, h - 0.1, 0.055]} />
          <meshStandardMaterial color={frameColor} roughness={0.35} metalness={0.7} />
        </mesh>
      )}

      {/* Double Glazing Glass Panes */}
      {opening.type !== 'entrance_door' ? (
        <group position={[0, 0, 0.015]}>
          <mesh>
            <planeGeometry args={[w - 0.09, h - 0.09]} />
            <meshPhysicalMaterial
              color={isNight ? '#FFEBB8' : '#88CCEE'}
              roughness={0.05}
              metalness={0.1}
              transmission={isNight ? 0.3 : 0.85}
              transparent
              opacity={isNight ? 0.9 : 0.65}
              ior={1.52}
              reflectivity={0.6}
            />
          </mesh>
          {/* Back pane of double glazing */}
          <mesh position={[0, 0, -0.02]}>
            <planeGeometry args={[w - 0.09, h - 0.09]} />
            <meshPhysicalMaterial
              color={isNight ? '#FFD488' : '#66BBDD'}
              roughness={0.08}
              transparent
              opacity={0.5}
            />
          </mesh>
        </group>
      ) : (
        /* Solid Security Door Panel with Decorative Panels */
        <mesh position={[0, 0, 0.015]} castShadow>
          <boxGeometry args={[w - 0.09, h - 0.09, 0.04]} />
          <meshStandardMaterial
            color="#2A1B12"
            roughness={0.6}
            metalness={0.2}
          />
        </mesh>
      )}

      {/* Interior Warm Room Light glowing through the glass at night */}
      {isNight && (
        <pointLight
          position={[0, 0, -0.3]}
          intensity={interiorLightIntensity}
          distance={4}
          color="#FFA533"
        />
      )}

      {/* Roller Shutter Caisson Box (above window) */}
      {opening.hasShutter && (
        <group position={[0, h / 2 + 0.1, 0.05]}>
          <mesh castShadow>
            <boxGeometry args={[w + 0.04, 0.18, 0.18]} />
            <meshStandardMaterial color="#EAEFF5" roughness={0.3} metalness={0.3} />
          </mesh>
          {/* Inspection Panel Seam */}
          <mesh position={[0, -0.088, 0.091]}>
            <boxGeometry args={[w + 0.02, 0.004, 0.002]} />
            <meshBasicMaterial color="#94A3B8" />
          </mesh>
        </group>
      )}

      {/* Roller Shutter Slat Curtain */}
      {opening.hasShutter && (
        <mesh
          ref={shutterCurtainRef}
          position={[0, 0, 0.045]}
          castShadow
        >
          <boxGeometry args={[w - 0.06, h, 0.015]} />
          <meshStandardMaterial
            color="#E2E8F0"
            roughness={0.45}
            metalness={0.4}
          />
        </mesh>
      )}

      {/* Ground Floor Wrought Iron Security Grille */}
      {opening.hasGrille && (
        <group position={[0, 0, 0.09]}>
          {/* Vertical Iron Bars */}
          {Array.from({ length: Math.max(3, Math.floor(w / 0.12)) }).map((_, i, arr) => {
            const barX = -w / 2 + 0.06 + (i * (w - 0.12) / (arr.length - 1));
            return (
              <mesh key={`bar-${i}`} position={[barX, 0, 0]} castShadow>
                <cylinderGeometry args={[0.008, 0.008, h - 0.08, 8]} />
                <meshStandardMaterial color="#1E2024" roughness={0.7} metalness={0.8} />
              </mesh>
            );
          })}
          {/* Top and Bottom Horizontal Iron Tie Bars */}
          <mesh position={[0, h / 2 - 0.1, 0]} castShadow>
            <boxGeometry args={[w - 0.04, 0.02, 0.016]} />
            <meshStandardMaterial color="#1E2024" roughness={0.7} metalness={0.8} />
          </mesh>
          <mesh position={[0, -h / 2 + 0.1, 0]} castShadow>
            <boxGeometry args={[w - 0.04, 0.02, 0.016]} />
            <meshStandardMaterial color="#1E2024" roughness={0.7} metalness={0.8} />
          </mesh>
        </group>
      )}

      {/* R+1 Balcony Cantilever Slab & Railing */}
      {opening.hasBalcony && (
        <group position={[0, -h / 2, 0.5]}>
          {/* Balcony Floor Slab */}
          <mesh position={[0, -0.08, 0]} castShadow receiveShadow>
            <boxGeometry args={[w + 0.8, 0.14, 0.9]} />
            <meshStandardMaterial color="#CBD5E1" roughness={0.8} />
          </mesh>
          {/* Balcony Railing (Garde-corps) */}
          <group position={[0, 0.42, 0.42]}>
            {/* Top Handrail */}
            <mesh position={[0, 0.5, 0]} castShadow>
              <boxGeometry args={[w + 0.76, 0.04, 0.05]} />
              <meshStandardMaterial color={frameColor} roughness={0.3} metalness={0.7} />
            </mesh>
            {/* Glass Guard Infill */}
            <mesh position={[0, 0.22, 0]}>
              <boxGeometry args={[w + 0.72, 0.52, 0.012]} />
              <meshPhysicalMaterial
                color="#A0D8EF"
                transparent
                opacity={0.45}
                roughness={0.1}
                metalness={0.1}
              />
            </mesh>
            {/* Left and Right Posts */}
            <mesh position={[-(w + 0.72) / 2, 0.25, 0]} castShadow>
              <boxGeometry args={[0.04, 0.55, 0.04]} />
              <meshStandardMaterial color={frameColor} roughness={0.3} metalness={0.7} />
            </mesh>
            <mesh position={[(w + 0.72) / 2, 0.25, 0]} castShadow>
              <boxGeometry args={[0.04, 0.55, 0.04]} />
              <meshStandardMaterial color={frameColor} roughness={0.3} metalness={0.7} />
            </mesh>
          </group>
        </group>
      )}
    </group>
  );
};

interface VillaFacadeCanvasProps {
  openings: FacadeOpening[];
  selectedOpeningId: string | null;
  onSelectOpening: (id: string) => void;
  wallFinish: WallFinish;
  atmosphere: LightingAtmosphere;
}

export const VillaFacadeCanvas: React.FC<VillaFacadeCanvasProps> = ({
  openings,
  selectedOpeningId,
  onSelectOpening,
  wallFinish,
  atmosphere,
}) => {
  const controlsRef = useRef<any>(null);

  const wallColor =
    wallFinish === 'enduit_blanc'
      ? '#F4F1EA'
      : wallFinish === 'pierre_saharienne'
      ? '#DFCEAA'
      : '#4A5568';

  const wallRoughness = wallFinish === 'pierre_saharienne' ? 0.95 : 0.75;

  return (
    <div className="relative w-full h-[540px] md:h-[680px] rounded-3xl overflow-hidden glass-panel border border-white/10 shadow-2xl bg-gradient-to-b from-[#090D16] via-[#0D121F] to-[#080A10]">
      <Canvas
        camera={{ position: [0, 3.4, 9.8], fov: 44 }}
        shadows
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      >
        {/* Atmosphere Lighting */}
        {atmosphere === 'day' && (
          <>
            <ambientLight intensity={0.75} color="#FFFFFF" />
            <directionalLight
              position={[8, 14, 10]}
              intensity={1.9}
              castShadow
              shadow-mapSize-width={2048}
              shadow-mapSize-height={2048}
              shadow-bias={-0.0001}
            />
            <directionalLight position={[-8, 6, 6]} intensity={0.5} color="#B0C4DE" />
          </>
        )}

        {atmosphere === 'golden_hour' && (
          <>
            <ambientLight intensity={0.55} color="#FFD1A4" />
            <directionalLight
              position={[12, 5, 8]}
              intensity={2.3}
              color="#FF8C42"
              castShadow
              shadow-mapSize-width={2048}
              shadow-mapSize-height={2048}
              shadow-bias={-0.0001}
            />
            <directionalLight position={[-6, 4, 3]} intensity={0.4} color="#7E5265" />
          </>
        )}

        {atmosphere === 'night' && (
          <>
            <ambientLight intensity={0.2} color="#1E293B" />
            <directionalLight
              position={[-6, 12, 6]}
              intensity={0.45}
              color="#64748B"
              castShadow
            />
            {/* Street Lantern Warm Ambient Glow */}
            <pointLight position={[0, 0.8, 4]} intensity={1.2} color="#FFA533" distance={10} />
          </>
        )}

        <Suspense fallback={null}>
          <group position={[0, 0, 0]}>
            {/* Main Architectural Facade Wall */}
            <mesh position={[0, 3.5, 0]} receiveShadow castShadow>
              <boxGeometry args={[12.8, 7.2, 0.35]} />
              <meshStandardMaterial
                color={wallColor}
                roughness={wallRoughness}
                metalness={0.05}
              />
            </mesh>

            {/* Ground Level Plinth / Soubassement (Pierre ou Granit) */}
            <mesh position={[0, 0.15, 0.05]} receiveShadow>
              <boxGeometry args={[13.2, 0.3, 0.45]} />
              <meshStandardMaterial color="#64748B" roughness={0.9} />
            </mesh>

            {/* Intermediate Floor Band (Bandeau d'étage RDC / R+1) */}
            <mesh position={[0, 3.3, 0.04]} receiveShadow castShadow>
              <boxGeometry args={[13.0, 0.16, 0.42]} />
              <meshStandardMaterial color="#E2E8F0" roughness={0.5} />
            </mesh>

            {/* Roof Parapet / Acrotère moderne */}
            <mesh position={[0, 7.15, 0.05]} receiveShadow castShadow>
              <boxGeometry args={[13.2, 0.22, 0.45]} />
              <meshStandardMaterial color="#334155" roughness={0.4} />
            </mesh>

            {/* Render Each Architectural Opening */}
            {openings.map((opening) => (
              <SingleOpening3D
                key={opening.id}
                opening={opening}
                isSelected={selectedOpeningId === opening.id}
                onSelect={onSelectOpening}
                atmosphere={atmosphere}
              />
            ))}

            {/* Ground Floor Entrance Steps */}
            <group position={[-3.2, 0, 0.5]}>
              <mesh position={[0, 0.08, 0]} receiveShadow castShadow>
                <boxGeometry args={[2.0, 0.16, 0.8]} />
                <meshStandardMaterial color="#94A3B8" roughness={0.8} />
              </mesh>
              <mesh position={[0, 0.04, 0.3]} receiveShadow castShadow>
                <boxGeometry args={[2.4, 0.08, 0.6]} />
                <meshStandardMaterial color="#CBD5E1" roughness={0.8} />
              </mesh>
            </group>

            {/* Floor Plane (Terrasse / Trottoir) */}
            <mesh position={[0, 0, 3.2]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
              <planeGeometry args={[18, 10]} />
              <meshStandardMaterial color="#334155" roughness={0.9} />
            </mesh>

            {/* Soft Shadow Contact */}
            <ContactShadows
              position={[0, 0.01, 0]}
              opacity={0.65}
              scale={16}
              blur={2.5}
              far={5}
              color="#000000"
            />
          </group>
        </Suspense>

        <OrbitControls
          ref={controlsRef}
          target={[0, 3.2, 0]}
          minDistance={4}
          maxDistance={18}
          minPolarAngle={Math.PI / 6}
          maxPolarAngle={Math.PI / 2.05}
          dampingFactor={0.06}
        />
      </Canvas>

      {/* Floating Instructions */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 pointer-events-none text-[11px] font-mono text-zinc-400 bg-black/60 px-4 py-1.5 rounded-full border border-white/10 backdrop-blur-md">
        Cliquez sur un châssis pour inspecter • Clic-glisser pour orbiter • Molette pour zoomer
      </div>
    </div>
  );
};
