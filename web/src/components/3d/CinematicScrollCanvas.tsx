import React, { useRef, useMemo, useState, useEffect, Suspense, useCallback } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { ContactShadows, Float, Grid } from '@react-three/drei';
import * as THREE from 'three';
import { useScroll } from 'framer-motion';
import { useConfigStore } from '../../store/configStore';
import { getTranslation } from '../../utils/i18n';
import type { FinishColor, GlassType } from '../../types/window';
import {
  Play,
  Pause,
  RotateCcw,
  ChevronRight,
  ChevronLeft,
  Maximize2,
  ShieldCheck,
  Activity,
  Layers,
  Scissors,
} from 'lucide-react';
import { playSlideTick, playTactileClick } from '../../utils/audioFeedback';

const FINISH_PALETTES: Record<FinishColor, { color: string; roughness: number; metalness: number }> = {
  ral_9016: { color: '#F1F3F5', roughness: 0.35, metalness: 0.2 },
  ral_7016: { color: '#272B33', roughness: 0.42, metalness: 0.35 },
  ral_9005: { color: '#131418', roughness: 0.48, metalness: 0.3 },
  faux_bois: { color: '#784622', roughness: 0.6, metalness: 0.08 },
  bronze_ano: { color: '#6A5641', roughness: 0.32, metalness: 0.72 },
};

const GLASS_PALETTES: Record<GlassType, { color: string; roughness: number; transmission: number; opacity: number; ior: number }> = {
  simple_clear: { color: '#EAF5F4', roughness: 0.05, transmission: 0.92, opacity: 0.35, ior: 1.52 },
  double_clear: { color: '#DCEDEB', roughness: 0.06, transmission: 0.88, opacity: 0.45, ior: 1.52 },
  stop_sol: { color: '#253B47', roughness: 0.12, transmission: 0.52, opacity: 0.72, ior: 1.65 },
  sable: { color: '#E2E8F0', roughness: 0.78, transmission: 0.62, opacity: 0.88, ior: 1.45 },
};

// Deterministic static positions for atmospheric floating particles around the frame
const DUST_PARTICLE_COUNT = 75;
const DUST_PARTICLES_POSITIONS = (() => {
  const positions = new Float32Array(DUST_PARTICLE_COUNT * 3);
  let seed = 42;
  for (let i = 0; i < DUST_PARTICLE_COUNT * 3; i++) {
    seed = (seed * 16807) % 2147483647;
    const normalized = seed / 2147483647 - 0.5;
    const scale = i % 3 === 0 ? 6 : 4;
    positions[i] = normalized * scale;
  }
  return positions;
})();

const AmbientDustParticles: React.FC<{ isLight: boolean }> = ({ isLight }) => {
  const meshRef = useRef<THREE.Points>(null);
  const particlesPosition = DUST_PARTICLES_POSITIONS;

  useFrame((state) => {
    if (!meshRef.current) return;
    meshRef.current.rotation.y = state.clock.elapsedTime * 0.02;
    meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.015) * 0.02;
  });

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[particlesPosition, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.035}
        color={isLight ? '#38BDF8' : '#D4AF37'}
        transparent
        opacity={isLight ? 0.3 : 0.45}
        sizeAttenuation
      />
    </points>
  );
};

// Internal 3D Window Mesh with continuous scroll animation drivers & mouse tilt
interface ScrollModelProps {
  scrollProgress: number; // 0.0 to 1.0
  mouseOffset: { x: number; y: number };
}

const ScrollDrivenWindowModel: React.FC<ScrollModelProps> = ({ scrollProgress, mouseOffset }) => {
  const { config } = useConfigStore();
  const rootRef = useRef<THREE.Group>(null);
  const sashRef = useRef<THREE.Group>(null);

  const w = config.width / 1000;
  const h = config.height / 1000;

  const frameDepth = 0.07;
  const frameFace = 0.055;
  const sashDepth = 0.045;
  const sashFace = 0.065;
  const glassThick = 0.016;

  // Stages calculation:
  // 0.0 - 0.2: Stage 1 (Hero overview)
  // 0.2 - 0.45: Stage 2 (Profile zoom)
  // 0.45 - 0.70: Stage 3 (Kinematic opening)
  // 0.70 - 0.90: Stage 4 (Exploded view)
  // 0.90 - 1.0: Stage 5 (Orthogonal cut ready)
  const openProgress = Math.min(1, Math.max(0, (scrollProgress - 0.45) / 0.22));
  const explodeProgress = Math.min(1, Math.max(0, (scrollProgress - 0.7) / 0.18));

  const explodeZ = explodeProgress * 0.38;
  const explodeGlassZ = explodeProgress * 0.68;
  const explodeDilation = explodeProgress * 0.14;

  const frameMatProps = FINISH_PALETTES[config.finishColor] || FINISH_PALETTES.ral_7016;
  const glassMatProps = GLASS_PALETTES[config.glassType] || GLASS_PALETTES.double_clear;

  const frameMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: frameMatProps.color,
      roughness: frameMatProps.roughness,
      metalness: frameMatProps.metalness,
      envMapIntensity: 1.3,
    });
  }, [frameMatProps]);

  const thermalBreakMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: '#111827',
      roughness: 0.85,
      metalness: 0.05,
    });
  }, []);

  const glassMaterial = useMemo(() => {
    return new THREE.MeshPhysicalMaterial({
      color: glassMatProps.color,
      roughness: glassMatProps.roughness,
      transmission: glassMatProps.transmission,
      thickness: glassThick,
      transparent: true,
      opacity: glassMatProps.opacity,
      ior: glassMatProps.ior,
      reflectivity: 0.6,
    });
  }, [glassMatProps, glassThick]);

  const handleMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: '#CBD5E1',
      roughness: 0.25,
      metalness: 0.85,
    });
  }, []);

  useFrame((state) => {
    if (!rootRef.current) return;

    // Subtle Antigravity mouse tilt parallax
    const targetTiltX = mouseOffset.y * 0.1;
    const targetTiltY = mouseOffset.x * 0.16;

    // Stage 1 slow natural breathing rotation
    if (scrollProgress < 0.2) {
      const breathing = Math.sin(state.clock.elapsedTime * 0.6) * 0.08;
      rootRef.current.rotation.y = THREE.MathUtils.lerp(rootRef.current.rotation.y, breathing + targetTiltY, 0.06);
      rootRef.current.rotation.x = THREE.MathUtils.lerp(rootRef.current.rotation.x, targetTiltX, 0.06);
    } else {
      rootRef.current.rotation.y = THREE.MathUtils.lerp(rootRef.current.rotation.y, targetTiltY * 0.5, 0.08);
      rootRef.current.rotation.x = THREE.MathUtils.lerp(rootRef.current.rotation.x, targetTiltX * 0.5, 0.08);
    }

    // Kinematic sash opening
    if (sashRef.current) {
      if (config.openingType === 'sliding_2') {
        sashRef.current.position.x = -openProgress * (w * 0.42);
        sashRef.current.rotation.y = 0;
      } else {
        // Casement swing
        sashRef.current.position.x = 0;
        sashRef.current.rotation.y = -openProgress * (Math.PI / 3);
      }
    }
  });

  return (
    <group ref={rootRef} position={[0, 0, 0]}>
      {/* OUTER PROFILE FRAME */}
      <group position={[0, 0, 0]}>
        {/* Top Profile */}
        <mesh position={[0, h / 2 - frameFace / 2 + explodeDilation, 0]} material={frameMaterial}>
          <boxGeometry args={[w + explodeDilation * 2, frameFace, frameDepth]} />
        </mesh>
        {/* Bottom Profile */}
        <mesh position={[0, -h / 2 + frameFace / 2 - explodeDilation, 0]} material={frameMaterial}>
          <boxGeometry args={[w + explodeDilation * 2, frameFace, frameDepth]} />
        </mesh>
        {/* Left Profile */}
        <mesh position={[-w / 2 + frameFace / 2 - explodeDilation, 0, 0]} material={frameMaterial}>
          <boxGeometry args={[frameFace, h - frameFace * 2, frameDepth]} />
        </mesh>
        {/* Right Profile */}
        <mesh position={[w / 2 - frameFace / 2 + explodeDilation, 0, 0]} material={frameMaterial}>
          <boxGeometry args={[frameFace, h - frameFace * 2, frameDepth]} />
        </mesh>

        {/* Polyamide Thermal Break Strip */}
        {config.profileSystem === 'gamme_45_thermal' && (
          <group position={[0, 0, 0]}>
            <mesh position={[0, h / 2 - frameFace / 2 + explodeDilation, 0]} material={thermalBreakMaterial}>
              <boxGeometry args={[w * 0.98, frameFace * 0.28, frameDepth * 0.22]} />
            </mesh>
            <mesh position={[0, -h / 2 + frameFace / 2 - explodeDilation, 0]} material={thermalBreakMaterial}>
              <boxGeometry args={[w * 0.98, frameFace * 0.28, frameDepth * 0.22]} />
            </mesh>
          </group>
        )}
      </group>

      {/* SASH 1 (LEFT / MOVABLE OUVRANT) */}
      <group
        ref={sashRef}
        position={[
          config.openingType === 'sliding_2' ? -w / 4 : 0,
          0,
          explodeZ + (config.openingType === 'sliding_2' ? 0.015 : 0),
        ]}
      >
        {/* Sash Frame Profiles */}
        <group>
          <mesh position={[0, h / 2 - frameFace - sashFace / 2, 0]} material={frameMaterial}>
            <boxGeometry args={[w * (config.openingType === 'sliding_2' ? 0.52 : 0.88), sashFace, sashDepth]} />
          </mesh>
          <mesh position={[0, -h / 2 + frameFace + sashFace / 2, 0]} material={frameMaterial}>
            <boxGeometry args={[w * (config.openingType === 'sliding_2' ? 0.52 : 0.88), sashFace, sashDepth]} />
          </mesh>
          <mesh
            position={[-(w * (config.openingType === 'sliding_2' ? 0.52 : 0.88)) / 2 + sashFace / 2, 0, 0]}
            material={frameMaterial}
          >
            <boxGeometry args={[sashFace, h - frameFace * 2 - sashFace * 2, sashDepth]} />
          </mesh>
          <mesh
            position={[(w * (config.openingType === 'sliding_2' ? 0.52 : 0.88)) / 2 - sashFace / 2, 0, 0]}
            material={frameMaterial}
          >
            <boxGeometry args={[sashFace, h - frameFace * 2 - sashFace * 2, sashDepth]} />
          </mesh>
        </group>

        {/* Glass Unit */}
        <mesh position={[0, 0, explodeGlassZ]} material={glassMaterial}>
          <boxGeometry
            args={[
              w * (config.openingType === 'sliding_2' ? 0.52 : 0.88) - sashFace * 2 + 0.012,
              h - frameFace * 2 - sashFace * 2 + 0.012,
              glassThick,
            ]}
          />
        </mesh>

        {/* Hardware Handle */}
        <group
          position={[
            (w * (config.openingType === 'sliding_2' ? 0.52 : 0.88)) / 2 - sashFace / 2 - 0.015,
            0,
            sashDepth / 2 + 0.02,
          ]}
        >
          {/* Base */}
          <mesh material={handleMaterial}>
            <boxGeometry args={[0.025, 0.12, 0.01]} />
          </mesh>
          {/* Lever */}
          <mesh position={[0, -0.04, 0.035]} rotation={[0, 0, 0]} material={handleMaterial}>
            <boxGeometry args={[0.018, 0.11, 0.018]} />
          </mesh>
        </group>
      </group>

      {/* FIXED RIGHT SASH (for 2-sash sliding) */}
      {config.openingType === 'sliding_2' && (
        <group position={[w / 4, 0, -0.015 + explodeZ]}>
          <group>
            <mesh position={[0, h / 2 - frameFace - sashFace / 2, 0]} material={frameMaterial}>
              <boxGeometry args={[w * 0.52, sashFace, sashDepth]} />
            </mesh>
            <mesh position={[0, -h / 2 + frameFace + sashFace / 2, 0]} material={frameMaterial}>
              <boxGeometry args={[w * 0.52, sashFace, sashDepth]} />
            </mesh>
            <mesh position={[-w * 0.26 + sashFace / 2, 0, 0]} material={frameMaterial}>
              <boxGeometry args={[sashFace, h - frameFace * 2 - sashFace * 2, sashDepth]} />
            </mesh>
            <mesh position={[w * 0.26 - sashFace / 2, 0, 0]} material={frameMaterial}>
              <boxGeometry args={[sashFace, h - frameFace * 2 - sashFace * 2, sashDepth]} />
            </mesh>
          </group>
          <mesh position={[0, 0, explodeGlassZ]} material={glassMaterial}>
            <boxGeometry args={[w * 0.52 - sashFace * 2 + 0.012, h - frameFace * 2 - sashFace * 2 + 0.012, glassThick]} />
          </mesh>
        </group>
      )}

      {/* DIMENSION LINES & BADGES (ACTIVE IN STAGE 5) */}
      {scrollProgress > 0.85 && (
        <group position={[0, 0, 0.1]}>
          {/* Width line */}
          <line>
            <bufferGeometry
              attach="geometry"
              onUpdate={(self) => {
                const points = [
                  new THREE.Vector3(-w / 2, -h / 2 - 0.12, 0),
                  new THREE.Vector3(w / 2, -h / 2 - 0.12, 0),
                ];
                self.setFromPoints(points);
              }}
            />
            <lineBasicMaterial attach="material" color="#D4AF37" linewidth={2} />
          </line>
          {/* Height line */}
          <line>
            <bufferGeometry
              attach="geometry"
              onUpdate={(self) => {
                const points = [
                  new THREE.Vector3(w / 2 + 0.12, -h / 2, 0),
                  new THREE.Vector3(w / 2 + 0.12, h / 2, 0),
                ];
                self.setFromPoints(points);
              }}
            />
            <lineBasicMaterial attach="material" color="#D4AF37" linewidth={2} />
          </line>
        </group>
      )}
    </group>
  );
};

// Smooth Camera Controller linked to Scroll Progress + Mouse Parallax
const CameraScrollRig: React.FC<{ scrollProgress: number; mouseOffset: { x: number; y: number } }> = ({
  scrollProgress,
  mouseOffset,
}) => {
  useFrame(({ camera }) => {
    // Stage 1 (0.0 to 0.2): Overview
    let targetX = 0;
    let targetY = 0;
    let targetZ = 3.6;
    let lookX = 0;
    let lookY = 0;

    if (scrollProgress >= 0.2 && scrollProgress < 0.45) {
      // Stage 2: Corner profile closeup (Thermal break & miter joint)
      const t = (scrollProgress - 0.2) / 0.25;
      targetX = THREE.MathUtils.lerp(0, 0.65, t);
      targetY = THREE.MathUtils.lerp(0, 0.6, t);
      targetZ = THREE.MathUtils.lerp(3.6, 1.35, t);
      lookX = THREE.MathUtils.lerp(0, 0.55, t);
      lookY = THREE.MathUtils.lerp(0, 0.5, t);
    } else if (scrollProgress >= 0.45 && scrollProgress < 0.7) {
      // Stage 3: Kinematic opening view
      const t = (scrollProgress - 0.45) / 0.25;
      targetX = THREE.MathUtils.lerp(0.65, 0.85, t);
      targetY = THREE.MathUtils.lerp(0.6, 0.15, t);
      targetZ = THREE.MathUtils.lerp(1.35, 2.8, t);
      lookX = THREE.MathUtils.lerp(0.55, 0.1, t);
      lookY = THREE.MathUtils.lerp(0.5, 0, t);
    } else if (scrollProgress >= 0.7 && scrollProgress < 0.9) {
      // Stage 4: Exploded assembly view
      const t = (scrollProgress - 0.7) / 0.2;
      targetX = THREE.MathUtils.lerp(0.85, 0, t);
      targetY = THREE.MathUtils.lerp(0.15, 0.2, t);
      targetZ = THREE.MathUtils.lerp(2.8, 4.2, t);
      lookX = THREE.MathUtils.lerp(0.1, 0, t);
      lookY = THREE.MathUtils.lerp(0, 0, t);
    } else if (scrollProgress >= 0.9) {
      // Stage 5: Orthogonal technical view
      const t = (scrollProgress - 0.9) / 0.1;
      targetX = THREE.MathUtils.lerp(0, 0, t);
      targetY = THREE.MathUtils.lerp(0.2, 0, t);
      targetZ = THREE.MathUtils.lerp(4.2, 3.4, t);
      lookX = 0;
      lookY = 0;
    }

    // Add subtle camera parallax
    const camParallaxX = mouseOffset.x * 0.18;
    const camParallaxY = mouseOffset.y * 0.12;

    camera.position.x = THREE.MathUtils.lerp(camera.position.x, targetX + camParallaxX, 0.08);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, targetY + camParallaxY, 0.08);
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, targetZ, 0.08);
    camera.lookAt(lookX, lookY, 0);
  });

  return null;
};

// Main Export Component
export const CinematicScrollCanvas: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { config, language, theme } = useConfigStore();
  const t = getTranslation(language);
  const isLight = theme === 'light';

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  const [currentProgress, setCurrentProgress] = useState(0);
  const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 });
  const [isAutoTourRunning, setIsAutoTourRunning] = useState(false);

  useEffect(() => {
    return scrollYProgress.on('change', (v) => {
      setCurrentProgress(v);
    });
  }, [scrollYProgress]);

  // Handle mouse move for spatial tilt
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
    setMouseOffset({ x, y });
  }, []);

  const handleMouseLeave = useCallback(() => {
    setMouseOffset({ x: 0, y: 0 });
  }, []);

  // Derive active stage index (1 to 5)
  const activeStage =
    currentProgress < 0.2
      ? 1
      : currentProgress < 0.45
      ? 2
      : currentProgress < 0.7
      ? 3
      : currentProgress < 0.9
      ? 4
      : 5;

  const stageTargets = useMemo(() => [0.08, 0.32, 0.58, 0.8, 0.96], []);

  const scrollToStage = useCallback((stageIndex: number) => {
    playSlideTick();
    if (!containerRef.current) return;
    const container = containerRef.current;
    const rect = container.getBoundingClientRect();
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const containerTop = rect.top + scrollTop;
    const scrollableHeight = container.offsetHeight - window.innerHeight;
    const targetProgress = stageTargets[stageIndex - 1];
    const targetY = containerTop + targetProgress * scrollableHeight;

    window.scrollTo({
      top: targetY,
      behavior: 'smooth',
    });
  }, [stageTargets]);

  // Keyboard navigation across inspection stages (Arrow keys & 1-5 keys)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'SELECT' || tag === 'TEXTAREA') return;

      if (e.key === 'ArrowRight') {
        scrollToStage(Math.min(5, activeStage + 1));
      } else if (e.key === 'ArrowLeft') {
        scrollToStage(Math.max(1, activeStage - 1));
      } else if (['1', '2', '3', '4', '5'].includes(e.key)) {
        scrollToStage(Number(e.key));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeStage, scrollToStage]);

  // Auto Tour Timer
  useEffect(() => {
    if (!isAutoTourRunning) return;

    let currentStageIndex = activeStage;
    const interval = setInterval(() => {
      currentStageIndex = currentStageIndex >= 5 ? 1 : currentStageIndex + 1;
      scrollToStage(currentStageIndex);
    }, 4500);

    return () => clearInterval(interval);
  }, [isAutoTourRunning, activeStage, scrollToStage]);

  // Stage titles and descriptors mapped to i18n with distinct machinist icons
  const stages = [
    { num: '01', title: t.stage1Title, desc: t.stage1Desc, icon: Maximize2 },
    { num: '02', title: t.stage2Title, desc: t.stage2Desc, icon: ShieldCheck },
    { num: '03', title: t.stage3Title, desc: t.stage3Desc, icon: Activity },
    { num: '04', title: t.stage4Title, desc: t.stage4Desc, icon: Layers },
    { num: '05', title: t.stage5Title, desc: t.stage5Desc, icon: Scissors },
  ];

  const currentStageInfo = stages[activeStage - 1];

  // Real-time engineering telemetry calculations
  const widthMm = config.width;
  const heightMm = config.height;
  const surfaceM2 = ((widthMm * heightMm) / 1000000).toFixed(2);
  const estimatedUw = config.profileSystem === 'gamme_45_thermal' ? '1.4 W/m²K' : '2.8 W/m²K';
  const estimatedSashWeight = `${Math.round(Number(surfaceM2) * 22 + 6)} kg`;

  const isRtl = language === 'ar';

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative h-[330vh]"
    >
      {/* Sticky Viewport Container */}
      <div
        className={`sticky top-0 h-screen w-full flex flex-col overflow-hidden transition-colors duration-500 ${
          isLight ? 'bg-[#F4F6F9]' : 'bg-[#080A0E]'
        }`}
      >
        {/* TOP FLOATING STAGE HUD & INTERACTIVE SCRUBBER */}
        <div
          dir={isRtl ? 'rtl' : 'ltr'}
          className="absolute top-20 left-0 right-0 z-20 px-4 sm:px-8 max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pointer-events-none"
        >
          {/* Stage badge & details card with Double-Bezel Architecture */}
          <div
            className={`pointer-events-auto transition-all duration-300 double-bezel max-w-lg shadow-2xl ${
              isLight
                ? 'bg-white/95 text-slate-900 border-slate-300/80 shadow-slate-300/50'
                : 'bg-[#0F141C]/90 border-white/15 text-white shadow-black/70'
            }`}
          >
            <div className="double-bezel-inner p-4">
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#D4AF37]" />
                  <span className="text-xs font-mono text-[#D4AF37] uppercase tracking-wider font-semibold">
                    {t.stepLabel} {currentStageInfo.num} / 05
                  </span>
                </div>
                <span
                  className={`text-[10px] font-mono px-2.5 py-0.5 rounded-full border ${
                    isLight
                      ? 'bg-slate-100 border-slate-200 text-slate-700 font-medium'
                      : 'bg-white/5 border-white/10 text-zinc-300'
                  }`}
                >
                  {t.algerianStandard}
                </span>
              </div>

              <h2 className="text-lg sm:text-xl font-bold tracking-tight">
                {currentStageInfo.title}
              </h2>
              <p className={`text-xs mt-1 leading-relaxed ${isLight ? 'text-slate-600' : 'text-zinc-400'}`}>
                {currentStageInfo.desc}
              </p>

              {/* Dynamic Scroll Progress Bar */}
              <div className="mt-3 pt-2.5 border-t border-black/5 dark:border-white/5 flex items-center justify-between gap-3">
                <div className="flex-1 bg-black/10 dark:bg-white/10 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#D4AF37] via-[#C5A880] to-[#D4AF37] transition-all duration-200 rounded-full"
                    style={{ width: `${Math.max(8, Math.round(currentProgress * 100))}%` }}
                  />
                </div>
                <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-[#D4AF37]/15 text-[#D4AF37] shrink-0">
                  {Math.round(currentProgress * 100)}% {t.inspected}
                </span>
              </div>

              {/* Quick Next / Prev Stage Micro-Bar */}
              <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-black/5 dark:border-white/5 text-[11px] font-mono">
                <button
                  onClick={() => scrollToStage(Math.max(1, activeStage - 1))}
                  disabled={activeStage === 1}
                  className={`flex items-center gap-1 cursor-pointer transition-colors btn-press ${
                    activeStage === 1
                      ? 'opacity-30 cursor-not-allowed'
                      : isLight
                      ? 'text-slate-600 hover:text-[#D4AF37]'
                      : 'text-zinc-400 hover:text-[#D4AF37]'
                  }`}
                >
                  {isRtl ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
                  <span>{t.prevStage}</span>
                </button>

                <button
                  onClick={() => {
                    playTactileClick();
                    setIsAutoTourRunning(!isAutoTourRunning);
                  }}
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-[10px] font-semibold transition-all cursor-pointer btn-press hover-lift ${
                    isAutoTourRunning
                      ? 'bg-[#D4AF37] text-slate-950 shadow-md shadow-[#D4AF37]/30 font-bold'
                      : isLight
                      ? 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
                      : 'bg-white/10 text-zinc-300 hover:bg-white/15 border border-white/10'
                  }`}
                >
                  {isAutoTourRunning ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                  <span>{isAutoTourRunning ? t.pauseTour : t.autoTour}</span>
                </button>

                <button
                  onClick={() => scrollToStage(Math.min(5, activeStage + 1))}
                  disabled={activeStage === 5}
                  className={`flex items-center gap-1 cursor-pointer transition-colors btn-press ${
                    activeStage === 5
                      ? 'opacity-30 cursor-not-allowed'
                      : isLight
                      ? 'text-slate-600 hover:text-[#D4AF37]'
                      : 'text-zinc-400 hover:text-[#D4AF37]'
                  }`}
                >
                  <span>{t.nextStage}</span>
                  {isRtl ? <ChevronLeft className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>

          {/* INTERACTIVE STAGE SCRUBBER BAR */}
          <div
            className={`pointer-events-auto flex items-center gap-1.5 p-1.5 rounded-2xl border backdrop-blur-xl shadow-xl double-bezel ${
              isLight
                ? 'bg-white/95 border-slate-300/80 shadow-slate-300/40'
                : 'bg-[#0E121C]/90 border-white/15 shadow-black/70'
            }`}
          >
            {stages.map((st, idx) => {
              const stageNum = idx + 1;
              const isActive = activeStage === stageNum;
              const StageIcon = st.icon;
              return (
                <button
                  key={st.num}
                  onClick={() => scrollToStage(stageNum)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-mono font-medium transition-all duration-300 flex items-center gap-1.5 cursor-pointer btn-press hover-lift ${
                    isActive
                      ? 'bg-[#D4AF37] text-slate-950 shadow-md shadow-[#D4AF37]/35 scale-105 font-bold'
                      : isLight
                      ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                      : 'text-zinc-400 hover:text-white hover:bg-white/5'
                  }`}
                  title={st.title}
                >
                  <StageIcon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-slate-950' : 'text-[#D4AF37]'}`} />
                  <span className="font-bold">{st.num}</span>
                  <span className="hidden lg:inline text-[11px] truncate max-w-[95px]">{st.title.split(' ')[0]}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 3D WebGL Canvas */}
        <div className="flex-1 w-full h-full relative cursor-grab active:cursor-grabbing">
          <Canvas
            camera={{ position: [0, 0, 3.6], fov: 45 }}
            gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
          >
            <ambientLight intensity={isLight ? 0.9 : 0.65} />
            <directionalLight
              position={[6, 8, 5]}
              intensity={isLight ? 1.5 : 1.35}
              castShadow
            />
            <directionalLight
              position={[-6, -4, -4]}
              intensity={isLight ? 0.6 : 0.4}
              color={isLight ? '#93C5FD' : '#60A5FA'}
            />
            <spotLight position={[0, 5, 4]} intensity={isLight ? 0.9 : 0.8} penumbra={0.6} />

            <CameraScrollRig scrollProgress={currentProgress} mouseOffset={mouseOffset} />

            <Suspense fallback={null}>
              <AmbientDustParticles isLight={isLight} />

              <Float speed={currentProgress < 0.2 ? 1.4 : 0} rotationIntensity={0.18} floatIntensity={0.18}>
                <ScrollDrivenWindowModel scrollProgress={currentProgress} mouseOffset={mouseOffset} />
              </Float>

              <ContactShadows
                position={[0, -1.1, 0]}
                opacity={isLight ? 0.35 : 0.55}
                scale={6}
                blur={2.4}
                far={3}
                color={isLight ? '#64748B' : '#000000'}
              />

              <Grid
                renderOrder={-1}
                position={[0, -1.12, 0]}
                infiniteGrid
                cellSize={0.2}
                cellThickness={0.6}
                cellColor={isLight ? '#E2E8F0' : '#1F2937'}
                sectionSize={1}
                sectionThickness={1.2}
                sectionColor={isLight ? '#CBD5E1' : '#374151'}
                fadeDistance={8}
              />
            </Suspense>
          </Canvas>
        </div>

        {/* CENTER FLOATING SCROLL NUDGE */}
        {currentProgress < 0.18 && (
          <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-20 pointer-events-none text-center animate-bounce">
            <div
              className={`px-4 py-2 rounded-full border backdrop-blur-md shadow-xl text-xs font-mono flex items-center gap-2 ${
                isLight
                  ? 'bg-white/90 border-slate-300 text-slate-800 shadow-slate-200/60'
                  : 'bg-[#0E121C]/85 border-white/15 text-zinc-200 shadow-black/70'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-[#D4AF37]" />
              <span>{t.scrollHint}</span>
            </div>
          </div>
        )}

        {/* BOTTOM FLOATING REAL-TIME TELEMETRY CARD */}
        <div
          dir={isRtl ? 'rtl' : 'ltr'}
          className="absolute bottom-6 left-0 right-0 z-20 px-4 sm:px-8 max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 pointer-events-none"
        >
          {/* Live Engineering Telemetry Readouts */}
          <div
            className={`pointer-events-auto grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-2.5 sm:p-3 rounded-2xl border backdrop-blur-xl shadow-xl double-bezel ${
              isLight
                ? 'bg-white/95 border-slate-300/80 text-slate-800 shadow-slate-300/40'
                : 'bg-[#0E121C]/90 border-white/15 text-white shadow-black/60'
            }`}
          >
            {/* Metric 1: Cotes */}
            <div className="px-3 py-2 rounded-xl bg-black/5 dark:bg-white/5 hover-lift transition-transform">
              <span className={`block text-[10px] font-mono ${isLight ? 'text-slate-500 font-medium' : 'text-zinc-400'}`}>
                {t.dimensions}
              </span>
              <span className="text-xs font-mono font-bold text-[#D4AF37]">
                {widthMm} x {heightMm} mm
              </span>
            </div>

            {/* Metric 2: Surface */}
            <div className="px-3 py-2 rounded-xl bg-black/5 dark:bg-white/5 hover-lift transition-transform">
              <span className={`block text-[10px] font-mono ${isLight ? 'text-slate-500 font-medium' : 'text-zinc-400'}`}>
                {t.surface}
              </span>
              <span className="text-xs font-mono font-bold">
                {surfaceM2} m²
              </span>
            </div>

            {/* Metric 3: Uw Isolation */}
            <div className="px-3 py-2 rounded-xl bg-black/5 dark:bg-white/5 hover-lift transition-transform">
              <span className={`block text-[10px] font-mono ${isLight ? 'text-slate-500 font-medium' : 'text-zinc-400'}`}>
                {t.uwValue}
              </span>
              <span className="text-xs font-mono font-bold text-emerald-500">
                {estimatedUw}
              </span>
            </div>

            {/* Metric 4: Poids Ouvrant */}
            <div className="px-3 py-2 rounded-xl bg-black/5 dark:bg-white/5 hover-lift transition-transform">
              <span className={`block text-[10px] font-mono ${isLight ? 'text-slate-500 font-medium' : 'text-zinc-400'}`}>
                {t.sashWeight}
              </span>
              <span className="text-xs font-mono font-bold text-blue-500">
                {estimatedSashWeight}
              </span>
            </div>
          </div>

          {/* Reset View & Interactive Hint */}
          <div className="pointer-events-auto flex items-center gap-2">
            <button
              onClick={() => scrollToStage(1)}
              className={`p-2.5 rounded-xl border backdrop-blur-md transition-all cursor-pointer btn-press hover-lift ${
                isLight
                  ? 'bg-white/90 border-slate-300 text-slate-700 hover:bg-slate-100 shadow-sm'
                  : 'bg-white/5 border-white/10 text-zinc-300 hover:bg-white/10'
              }`}
              title={t.resetView}
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <div
              className={`inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl border backdrop-blur-md text-xs font-mono ${
                isLight
                  ? 'bg-white/90 border-slate-300 text-slate-700 font-medium shadow-sm'
                  : 'bg-white/5 border-white/10 text-zinc-400'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>{t.scrubberHint}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
