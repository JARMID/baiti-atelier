import React, { useRef, useState, useEffect, useCallback, useMemo, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, ContactShadows } from '@react-three/drei';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import * as THREE from 'three';
import { useScroll } from 'framer-motion';
import { useConfigStore } from '../../store/configStore';
import { useDeviceType } from '../../hooks/useDeviceType';
import type { TradeCategory } from '../../types/trades';
import type { FinishColor } from '../../types/window';
import { Hero3DWorkpiece, type WindowModelType } from '../3d/Hero3DWorkpiece';
import {
  Compass,
  Scissors,
  Layers,
  ArrowRight,
  ArrowLeftRight,
  Rotate3d,
} from 'lucide-react';
import {
  playTactileClick,
  playSwitchSound,
  playSlideTick,
} from '../../utils/audioFeedback';

interface HeroScrollytellingStudioProps {
  activeTrade?: TradeCategory;
  onSelectTrade?: (trade: TradeCategory) => void;
}

// Smooth Camera Controller that choreographs based on scrollProgress
interface CameraRigProps {
  scrollProgress: number;
  mouseOffset: { x: number; y: number };
  is360Active: boolean;
  isMobile: boolean;
}

const CameraRig: React.FC<CameraRigProps> = ({ scrollProgress, mouseOffset, is360Active, isMobile }) => {
  useFrame(({ camera }) => {
    if (is360Active) return;

    const baseZ = isMobile ? 4.5 : 3.6;
    const stage1TargetX = isMobile ? 0 : -0.55;
    const stage1LookX = isMobile ? 0 : -0.1;

    // Stage 1 (0.00 - 0.30): Overview perspective (3D model gracefully shifted to right on desktop)
    let targetX = stage1TargetX;
    let targetY = isMobile ? 0.08 : 0.04;
    let targetZ = baseZ;
    let lookX = stage1LookX;
    let lookY = 0;

    if (scrollProgress >= 0.30 && scrollProgress < 0.68) {
      // Stage 2: Technical zoom on profile & interior assembly (Macro view)
      const t = (scrollProgress - 0.30) / 0.38;
      targetX = isMobile ? 0 : THREE.MathUtils.lerp(stage1TargetX, 0.45, t);
      targetY = THREE.MathUtils.lerp(targetY, 0.2, t);
      targetZ = THREE.MathUtils.lerp(baseZ, isMobile ? 2.8 : 2.15, t);
      lookX = isMobile ? 0 : THREE.MathUtils.lerp(stage1LookX, 0.25, t);
      lookY = THREE.MathUtils.lerp(0, 0.1, t);
    } else if (scrollProgress >= 0.68) {
      // Stage 3: Dynamic cinematic multi-angle inspection view
      const t = (scrollProgress - 0.68) / 0.32;
      targetX = isMobile ? 0 : THREE.MathUtils.lerp(0.45, 0, t);
      targetY = THREE.MathUtils.lerp(0.2, 0.1, t);
      targetZ = THREE.MathUtils.lerp(isMobile ? 2.8 : 2.15, isMobile ? 4.2 : 3.3, t);
      lookX = 0;
      lookY = 0;
    }

    const mouseX = mouseOffset.x * (isMobile ? 0.06 : 0.14);
    const mouseY = mouseOffset.y * (isMobile ? 0.05 : 0.1);

    camera.position.x = THREE.MathUtils.lerp(camera.position.x, targetX + mouseX, 0.08);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, targetY + mouseY, 0.08);
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, targetZ, 0.08);
    camera.lookAt(lookX, lookY, 0);
  });

  return null;
};

export const HeroScrollytellingStudio: React.FC<HeroScrollytellingStudioProps> = ({
  activeTrade = 'aluminum',
  onSelectTrade,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const orbitRef = useRef<OrbitControlsImpl | null>(null);

  const { language, config, setFinishColor, theme } = useConfigStore();
  const { isMobile } = useDeviceType();
  const isLight = theme === 'light';
  const isRtl = language === 'ar';

  const [selectedTrade, setSelectedTrade] = useState<TradeCategory>(activeTrade);
  const [windowModel, setWindowModel] = useState<WindowModelType>('sliding');
  const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 });
  const [is360Active, setIs360Active] = useState(false);
  const [isExploded, setIsExploded] = useState(false);
  const [isClippingActive, setIsClippingActive] = useState(false);
  const [clippingAxis, setClippingAxis] = useState<'x' | 'y'>('x');
  const [clippingPos, setClippingPos] = useState(0.5);
  const [clippingInverted, setClippingInverted] = useState(false);

  // Dynamic 3D section clipping plane
  const clippingPlane = useMemo(() => {
    if (!isClippingActive) return null;
    const sign = clippingInverted ? 1 : -1;
    if (clippingAxis === 'x') {
      const cutX = (clippingPos - 0.5) * 1.5;
      return new THREE.Plane(new THREE.Vector3(sign, 0, 0), sign * -cutX);
    } else {
      const cutY = (clippingPos - 0.5) * 1.5;
      return new THREE.Plane(new THREE.Vector3(0, sign, 0), sign * -cutY);
    }
  }, [isClippingActive, clippingAxis, clippingPos, clippingInverted]);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  const [scrollVal, setScrollVal] = useState(0);

  useEffect(() => {
    return scrollYProgress.on('change', (v) => {
      setScrollVal(v);
    });
  }, [scrollYProgress]);

  // Mouse tilt parallax
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
    setMouseOffset({ x, y });
  }, []);

  const handleMouseLeave = useCallback(() => {
    setMouseOffset({ x: 0, y: 0 });
  }, []);

  const handleTradeSwitch = (trade: TradeCategory) => {
    playSwitchSound();
    setSelectedTrade(trade);
    if (onSelectTrade) {
      onSelectTrade(trade);
    }
  };

  const handleColorSwitch = (color: FinishColor) => {
    playSlideTick();
    setFinishColor(color);
  };

  const handleToggle360 = () => {
    playTactileClick();
    setIs360Active(!is360Active);
  };

  const handleToggleExploded = () => {
    playSwitchSound();
    setIsExploded(!isExploded);
  };

  const isStage1 = scrollVal < 0.30;
  const isStage2 = scrollVal >= 0.30 && scrollVal < 0.68;
  const isStage3 = scrollVal >= 0.68;

  // Real-time architectural dynamic scale calculation matching 3D workpiece scale
  const liveScale = useMemo(() => {
    if (scrollVal < 0.30) {
      return (0.92 + (scrollVal / 0.30) * 0.08).toFixed(2);
    } else if (scrollVal < 0.68) {
      return (1.00 + ((scrollVal - 0.30) / 0.38) * 0.28).toFixed(2);
    } else {
      return (1.28 - ((scrollVal - 0.68) / 0.32) * 0.23).toFixed(2);
    }
  }, [scrollVal]);

  const colorSwatches: { id: FinishColor; label: string; hex: string }[] = [
    { id: 'ral_9016', label: 'Blanc RAL 9016', hex: '#FFFFFF' },
    { id: 'ral_7016', label: 'Gris Anthracite 7016', hex: '#374151' },
    { id: 'faux_bois', label: 'Chêne Doré', hex: '#8B5A2B' },
    { id: 'faux_bois_noyer', label: 'Noyer Foncé', hex: '#451A03' },
    { id: 'ral_9005', label: 'Noir Sablé 9005', hex: '#111827' },
    { id: 'bronze_ano', label: 'Bronze Anodisé', hex: '#6A5641' },
    { id: 'argent_ano', label: 'Argent Naturel', hex: '#94A3B8' },
  ];

  const tradePills: { id: TradeCategory; label: string; arabic: string }[] = [
    { id: 'aluminum', label: 'Aluminium 45 RPT', arabic: 'ألمنيوم RPT' },
    { id: 'woodworking', label: 'Ébénisterie Bois', arabic: 'نجارة الخشب' },
    { id: 'metalwork', label: 'Ferronnerie d’Art', arabic: 'الحدادة الفنية' },
    { id: 'tapestry', label: 'Volets Roulants', arabic: 'الستائر الدوارة' },
  ];

  const windowModelPills: { id: WindowModelType; label: string; arabic: string }[] = [
    { id: 'sliding', label: 'Coulissant 2V', arabic: 'سحاب 2 درف' },
    { id: 'tilt_and_turn', label: 'Oscillo-Battant', arabic: 'قلاب متحرك' },
    { id: 'french_casement', label: 'Battant 2V', arabic: 'مفصلي 2 درف' },
    { id: 'curtain_wall', label: 'Mur Rideau', arabic: 'واجهة زجاجية' },
  ];

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-[460vh] md:h-[520vh] select-none transition-colors duration-300 ${
        isLight ? 'bg-[#F8FAFC] text-slate-900' : 'bg-[#06080C] text-white'
      }`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      {/* STICKY FULLSCREEN 3D VIEWPORT */}
      <div className="sticky top-0 h-screen w-full overflow-hidden flex flex-col justify-between">
        {/* Ambient Radial Lighting in Background */}
        <div className="absolute inset-0 pointer-events-none">
          <div
            className={`absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full blur-[140px] ${
              isLight ? 'bg-amber-400/10' : 'bg-[#D4AF37]/6'
            }`}
          />
          <div
            className={`absolute bottom-10 right-1/4 w-[500px] h-[500px] rounded-full blur-[120px] ${
              isLight ? 'bg-sky-400/10' : 'bg-[#38BDF8]/5'
            }`}
          />
        </div>

        {/* Architectural Drafting Grid Overlay */}
        <div
          className="absolute inset-0 pointer-events-none opacity-40 z-0"
          style={{
            backgroundImage: isLight
              ? 'radial-gradient(circle, rgba(100, 116, 139, 0.14) 1px, transparent 1px), linear-gradient(to right, rgba(148, 163, 184, 0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(148, 163, 184, 0.08) 1px, transparent 1px)'
              : 'radial-gradient(circle, rgba(212, 175, 55, 0.14) 1px, transparent 1px), linear-gradient(to right, rgba(255, 255, 255, 0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, 0.04) 1px, transparent 1px)',
            backgroundSize: '40px 40px, 120px 120px, 120px 120px',
          }}
        />

        {/* Architectural Datum Registration Crosses */}
        <div className="absolute top-3 left-4 z-20 text-[10px] font-mono select-none pointer-events-none opacity-50 flex items-center gap-1.5">
          <span className="text-[#D4AF37] font-bold text-xs">+</span>
          <span>X: 0000.00 | Y: 1400.00 MM</span>
        </div>
        <div className="absolute top-3 right-4 z-20 text-[10px] font-mono select-none pointer-events-none opacity-50 hidden sm:flex items-center gap-1.5">
          <span>X: 1440.00 | Y: 1400.00 MM</span>
          <span className="text-[#D4AF37] font-bold text-xs">+</span>
        </div>
        <div className="absolute bottom-20 left-4 z-20 text-[10px] font-mono select-none pointer-events-none opacity-50 hidden sm:flex items-center gap-1.5">
          <span className="text-[#D4AF37] font-bold text-xs">+</span>
          <span>DATUM BASELINE 0.00 MM</span>
        </div>
        <div className="absolute bottom-20 right-4 z-20 text-[10px] font-mono select-none pointer-events-none opacity-50 hidden sm:flex items-center gap-1.5">
          <span>NORME DTR C3-2 ALGERIA</span>
          <span className="text-[#D4AF37] font-bold text-xs">+</span>
        </div>

        {/* TOP ARCHITECTURAL TITLE BLOCK & SCALE HUD */}
        <div className="relative z-20 pt-3 px-4 sm:px-8 flex items-start justify-between pointer-events-none text-xs font-mono">
          {/* Left Workshop & CAD Genesis Spec */}
          <div
            className={`p-2.5 sm:p-3 rounded-xl border backdrop-blur-md transition-all ${
              isLight
                ? 'bg-white/90 border-slate-200 text-slate-800 shadow-xs'
                : 'bg-black/75 border-white/15 text-zinc-300 shadow-xl'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] animate-pulse" />
              <span className="font-bold text-[10px] sm:text-[11px] tracking-wider uppercase text-[#D4AF37]">
                CAO INDUSTRIELLE · WILAYAS 01-58
              </span>
            </div>
            <div className="mt-1 text-[11px] sm:text-xs flex items-center gap-2">
              <span className="font-semibold text-slate-900 dark:text-white">
                {selectedTrade === 'aluminum'
                  ? 'Châssis RPT Haute Performance'
                  : selectedTrade === 'woodworking'
                  ? 'Menuiserie Agencement'
                  : selectedTrade === 'metalwork'
                  ? 'Ferronnerie de Précision'
                  : 'Fermetures Architecturales'}
              </span>
              <span className="opacity-40">|</span>
              <span className="text-[#D4AF37] font-bold">Tolérance ±0.1 mm</span>
            </div>
          </div>

          {/* Right Dynamic Architectural Scale Badge */}
          <div
            className={`p-2.5 sm:p-3 rounded-xl border backdrop-blur-md transition-all flex flex-col items-end ${
              isLight
                ? 'bg-white/90 border-slate-200 text-slate-800 shadow-xs'
                : 'bg-black/75 border-white/15 text-zinc-300 shadow-xl'
            }`}
          >
            <div className="flex items-center gap-2">
              <span
                className={`text-[10px] sm:text-[11px] uppercase tracking-wider ${
                  isLight ? 'text-slate-500' : 'text-zinc-400'
                }`}
              >
                ÉCHELLE CAO
              </span>
              <span className="px-2 py-0.5 rounded bg-[#D4AF37]/20 border border-[#D4AF37]/40 text-[#D4AF37] font-bold text-[11px]">
                {isStage2
                  ? `ZOOM ${liveScale}× MACRO`
                  : isStage3
                  ? `${liveScale}× ISOMÉTRIE`
                  : `${liveScale}× RÉFÉRENCE`}
              </span>
            </div>

            {/* Visual Dynamic Blueprint Scale Bar */}
            <div className="mt-1.5 flex flex-col items-end gap-0.5">
              <div className="flex items-center justify-between w-28 sm:w-36 text-[9px] text-zinc-400 font-mono">
                <span>0 mm</span>
                <span>500</span>
                <span>1 000 mm</span>
              </div>
              <div
                className="h-1.5 bg-slate-300 dark:bg-zinc-700 rounded-sm overflow-hidden flex transition-all duration-300"
                style={{ width: `${Math.round(110 * (parseFloat(liveScale) / 1.0))}px` }}
              >
                <div className="h-full w-1/4 bg-[#D4AF37]" />
                <div className="h-full w-1/4 bg-slate-400 dark:bg-zinc-600" />
                <div className="h-full w-1/4 bg-[#D4AF37]" />
                <div className="h-full w-1/4 bg-slate-400 dark:bg-zinc-600" />
              </div>
            </div>
          </div>
        </div>

        {/* 3D WEBGL CANVAS */}
        <div className="absolute inset-0 z-10">
          <Canvas
            camera={{ position: [0, 0.05, 3.6], fov: 42 }}
            gl={{
              antialias: true,
              alpha: true,
              powerPreference: 'high-performance',
              localClippingEnabled: true,
              logarithmicDepthBuffer: true,
            }}
            onCreated={({ gl }) => {
              gl.localClippingEnabled = true;
            }}
          >
            {isLight ? (
              <>
                <ambientLight intensity={1.1} color="#FFFFFF" />
                <directionalLight position={[5, 8, 5]} intensity={1.7} color="#FFFBF5" castShadow />
                <directionalLight position={[-5, 6, -2]} intensity={0.7} color="#E0F2FE" />
                <directionalLight position={[0, -2, 3]} intensity={0.5} color="#D4AF37" />
              </>
            ) : (
              <>
                <ambientLight intensity={0.6} color="#FFFFFF" />
                <directionalLight position={[4, 6, 4]} intensity={1.8} color="#FFF5EA" castShadow />
                <directionalLight position={[-4, 5, -2]} intensity={2.0} color="#38BDF8" />
                <directionalLight position={[0, -3, 2]} intensity={0.9} color="#D4AF37" />
              </>
            )}

            <Suspense fallback={null}>
              <Hero3DWorkpiece
                trade={selectedTrade}
                finishColor={config.finishColor}
                scrollProgress={scrollVal}
                isExploded={isExploded}
                isOpen={scrollVal >= 0.30}
                windowModel={windowModel}
                clippingPlane={clippingPlane}
                isLight={isLight}
              />
              <ContactShadows
                position={[0, -1.05, 0]}
                opacity={isLight ? 0.35 : 0.65}
                scale={6}
                blur={2.2}
                far={3}
                color={isLight ? '#64748B' : '#000000'}
              />
            </Suspense>

            <CameraRig
              scrollProgress={scrollVal}
              mouseOffset={mouseOffset}
              is360Active={is360Active || isStage3}
              isMobile={isMobile}
            />

            {(is360Active || isStage3) && (
              <OrbitControls
                ref={orbitRef}
                enableZoom={false}
                enablePan={false}
                rotateSpeed={0.8}
                minPolarAngle={Math.PI / 4}
                maxPolarAngle={Math.PI * 0.75}
              />
            )}
          </Canvas>
        </div>

        {/* CAD HORIZONTAL DIMENSION BRACKET (OVER WINDOW) */}
        {!isStage3 && (
          <div className="hidden lg:flex absolute top-28 left-1/2 -translate-x-1/2 z-20 items-center justify-center pointer-events-none transition-opacity duration-500">
            <div
              className={`flex items-center gap-2 px-3 py-1 rounded-md border text-[11px] font-mono shadow-md backdrop-blur-md ${
                isLight ? 'bg-white/90 border-slate-200 text-slate-800' : 'bg-black/70 border-white/10 text-zinc-200'
              }`}
            >
              <span className="text-[#D4AF37] font-bold">|←</span>
              <span className="font-semibold">1 440 mm</span>
              <span className="text-[10px] text-zinc-400">(Largeur Hors-Tout)</span>
              <span className="text-[#D4AF37] font-bold">→|</span>
            </div>
          </div>
        )}

        {/* CAD VERTICAL DIMENSION BRACKET (RIGHT FLANK) */}
        {!isStage3 && (
          <div className="hidden lg:flex absolute right-16 top-1/2 -translate-y-1/2 z-20 items-center pointer-events-none [writing-mode:vertical-rl] transition-opacity duration-500">
            <div
              className={`flex items-center gap-2 px-2.5 py-2 rounded-md border text-[11px] font-mono shadow-md backdrop-blur-md ${
                isLight ? 'bg-white/90 border-slate-200 text-slate-800' : 'bg-black/70 border-white/10 text-zinc-200'
              }`}
            >
              <span className="text-[#D4AF37] font-bold">|↑</span>
              <span className="font-semibold">1 400 mm</span>
              <span className="text-[10px] text-zinc-400">(Hauteur Hors-Tout)</span>
              <span className="text-[#D4AF37] font-bold">↓|</span>
            </div>
          </div>
        )}

        {/* STAGE 2 ARCHITECTURAL PIN CALLOUTS */}
        {isStage2 && (
          <div className="hidden md:block pointer-events-none z-20">
            {/* Pin 1: Top Left - Corner Miter */}
            <div className="absolute top-36 left-8 lg:left-20 max-w-xs transition-all duration-500">
              <div
                className={`p-3 rounded-xl border backdrop-blur-xl shadow-xl ${
                  isLight ? 'bg-white/95 border-slate-200 text-slate-800' : 'bg-black/85 border-[#D4AF37]/30 text-white'
                }`}
              >
                <div className="flex items-center gap-1.5 text-[#D4AF37] font-mono font-bold text-[11px] mb-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]" />
                  <span>ONGLET 45° SERTI HYDRAULIQUE</span>
                </div>
                <p className="text-[11px] leading-tight text-slate-600 dark:text-zinc-300">
                  Équerres en fonte d'aluminium injectée sous pression assurant un assemblage indéformable.
                </p>
              </div>
            </div>

            {/* Pin 2: Center Left - Thermal Break Polyamide */}
            <div className="absolute top-1/2 -translate-y-1/2 left-6 lg:left-14 max-w-xs transition-all duration-500">
              <div
                className={`p-3 rounded-xl border backdrop-blur-xl shadow-xl ${
                  isLight ? 'bg-white/95 border-slate-200 text-slate-800' : 'bg-black/85 border-amber-500/30 text-white'
                }`}
              >
                <div className="flex items-center gap-1.5 text-amber-500 font-mono font-bold text-[11px] mb-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  <span>RUPTURE PONT THERMIQUE 24 MM</span>
                </div>
                <p className="text-[11px] leading-tight text-slate-600 dark:text-zinc-300">
                  Barrettes PA66-GF25 armées à 25% de fibre de verre. Coefficient d'isolation Uw 1.4 W/m²K.
                </p>
              </div>
            </div>

            {/* Pin 3: Center Right - EPDM Central Seals */}
            <div className="absolute top-1/2 -translate-y-1/2 right-6 lg:right-14 max-w-xs transition-all duration-500 text-right">
              <div
                className={`p-3 rounded-xl border backdrop-blur-xl shadow-xl ${
                  isLight ? 'bg-white/95 border-slate-200 text-slate-800' : 'bg-black/85 border-cyan-500/30 text-white'
                }`}
              >
                <div className="flex items-center justify-end gap-1.5 text-cyan-400 font-mono font-bold text-[11px] mb-1">
                  <span>JOINTS EPDM MULTI-CHAMBRES</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                </div>
                <p className="text-[11px] leading-tight text-slate-600 dark:text-zinc-300">
                  Étanchéité continue à compression dynamique. Élimine l'infiltration d'air et de sable saharien.
                </p>
              </div>
            </div>

            {/* Pin 4: Bottom Right - Double Glazing */}
            <div className="absolute bottom-36 right-8 lg:right-20 max-w-xs transition-all duration-500 text-right">
              <div
                className={`p-3 rounded-xl border backdrop-blur-xl shadow-xl ${
                  isLight ? 'bg-white/95 border-slate-200 text-slate-800' : 'bg-black/85 border-sky-500/30 text-white'
                }`}
              >
                <div className="flex items-center justify-end gap-1.5 text-sky-400 font-mono font-bold text-[11px] mb-1">
                  <span>DOUBLE VITRAGE 4/16/4 LOW-E</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
                </div>
                <p className="text-[11px] leading-tight text-slate-600 dark:text-zinc-300">
                  Intercalaire thermique warm-edge avec gaz Argon 90% pour un confort d'été et d'hiver optimal.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* DYNAMIC SCROLLYTELLING OVERLAY CONTENT */}
        <div
          className={`relative z-20 flex-1 flex flex-col px-4 sm:px-12 lg:px-20 pointer-events-none transition-all duration-500 ${
            isStage1 ? 'justify-start pt-16 sm:pt-20 lg:pt-24' : 'justify-center'
          }`}
        >
          {/* STAGE 1: HERO OVERVIEW (0.0 to 0.30) */}
          <div
            className={`max-w-xl transition-all duration-700 ${
              isStage1
                ? 'opacity-100 translate-y-0 pointer-events-auto'
                : 'opacity-0 -translate-y-8 pointer-events-none hidden'
            }`}
          >
            <div
              className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-xs font-mono mb-4 backdrop-blur-md ${
                isLight
                  ? 'bg-white/90 border-slate-200 text-slate-700 shadow-xs'
                  : 'bg-white/5 border-white/10 text-[#D4AF37]'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-[#D4AF37]" />
              <span>CONCEPTION & DÉBITAGE INDUSTRIEL</span>
            </div>

            <h1
              className={`text-3xl sm:text-5xl lg:text-7xl font-serif tracking-tight leading-[1.08] sm:leading-[1.05] ${
                isLight ? 'text-slate-900' : 'text-white'
              }`}
            >
              L'ART DU DÉBIT <br />
              <span className="italic font-normal text-[#C5A880] font-serif">en</span>{' '}
              <span className="bg-gradient-to-r from-[#C5A880] via-[#D4AF37] to-[#E2C799] bg-clip-text text-transparent font-bold">
                PRÉCISION
              </span>
            </h1>

            <p
              className={`mt-4 text-xs sm:text-base font-light leading-relaxed max-w-lg ${
                isLight ? 'text-slate-600' : 'text-zinc-300'
              }`}
            >
              Châssis aluminium à rupture thermique, agencements d'ébénisterie, ferronnerie d'art et draperie architecturale pour les maîtres ateliers des 58 Wilayas.
            </p>

            <div className="mt-6 sm:mt-8 flex items-center gap-4">
              <a
                href="#cad-studio"
                onClick={() => playTactileClick()}
                className="px-5 py-3 sm:px-6 sm:py-3.5 rounded-full border border-white/20 bg-[#D4AF37] hover:bg-[#C5A880] text-slate-950 text-xs font-mono tracking-wider uppercase transition-all duration-300 shadow-xl flex items-center gap-2 group cursor-pointer hover-lift btn-press"
              >
                <span>OUVRIR LE STUDIO CAO</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </a>
            </div>
          </div>

          {/* STAGE 2: CRAFTSMANSHIP & TECHNICAL REVEAL (0.30 to 0.68) */}
          <div
            className={`max-w-2xl mx-auto text-center transition-all duration-700 ${
              isStage2
                ? 'opacity-100 translate-y-0 pointer-events-auto'
                : 'opacity-0 translate-y-8 pointer-events-none hidden'
            }`}
          >
            <div
              className={`inline-flex items-center gap-2 px-3.5 py-1 rounded-full border text-xs font-mono mb-3 backdrop-blur-md ${
                isLight
                  ? 'bg-white/90 border-slate-200 text-slate-800 shadow-xs'
                  : 'bg-[#D4AF37]/15 border-[#D4AF37]/30 text-[#D4AF37]'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-[#D4AF37]" />
              <span>CONFORMITÉ TECHNIQUE DTR C3-2 · TOLÉRANCE 0.1 MM</span>
            </div>

            <h2
              className={`text-2xl sm:text-4xl lg:text-5xl font-serif tracking-tight leading-tight ${
                isLight ? 'text-slate-900' : 'text-white'
              }`}
            >
              COUPE & STRUCTURE <br />
              <span className="bg-gradient-to-r from-[#C5A880] to-[#D4AF37] bg-clip-text text-transparent italic">
                DÉVOILÉES
              </span>
            </h2>

            <p
              className={`mt-3 text-xs sm:text-sm max-w-xl mx-auto leading-relaxed ${
                isLight ? 'text-slate-600' : 'text-zinc-300'
              }`}
            >
              Chaque profilé RPT, chaque chant ABS et chaque barreau forgé est calculé pour éliminer les chutes. L'isolation thermique Uw 1.4 W/m²K répond aux exigences des chantiers algériens.
            </p>

            {/* Technical Metric Chips */}
            <div className="mt-4 sm:mt-6 flex flex-wrap items-center justify-center gap-2 sm:gap-3">
              <div
                className={`px-3 sm:px-4 py-2 rounded-2xl border backdrop-blur-xl text-xs font-mono ${
                  isLight ? 'bg-white/90 border-slate-200 shadow-xs' : 'bg-black/60 border-white/15'
                }`}
              >
                <span className={`block text-[10px] ${isLight ? 'text-slate-500' : 'text-zinc-500'}`}>
                  ISOLATION THERMIQUE
                </span>
                <span className="text-[#D4AF37] font-bold text-sm">Uw = 1.4 W/m²K</span>
              </div>
              <div
                className={`px-3 sm:px-4 py-2 rounded-2xl border backdrop-blur-xl text-xs font-mono ${
                  isLight ? 'bg-white/90 border-slate-200 shadow-xs' : 'bg-black/60 border-white/15'
                }`}
              >
                <span className={`block text-[10px] ${isLight ? 'text-slate-500' : 'text-zinc-500'}`}>
                  RÉDUCTION DES CHUTES
                </span>
                <span className="text-emerald-500 font-bold text-sm">&lt; 3.5% Chutes</span>
              </div>
              <div
                className={`px-3 sm:px-4 py-2 rounded-2xl border backdrop-blur-xl text-xs font-mono ${
                  isLight ? 'bg-white/90 border-slate-200 shadow-xs' : 'bg-black/60 border-white/15'
                }`}
              >
                <span className={`block text-[10px] ${isLight ? 'text-slate-500' : 'text-zinc-500'}`}>
                  PRÉCISION D'USINAGE
                </span>
                <span className="text-cyan-500 font-bold text-sm">Tolérance 0.1 mm</span>
              </div>
            </div>
          </div>

          {/* STAGE 3: 360° INTERACTIVE MULTI-AXIS INSPECTION (0.68 to 1.0) */}
          <div
            className={`max-w-xl mx-auto text-center transition-all duration-700 ${
              isStage3
                ? 'opacity-100 translate-y-0 pointer-events-auto'
                : 'opacity-0 translate-y-8 pointer-events-none hidden'
            }`}
          >
            <span className="text-[11px] font-mono tracking-[0.25em] text-[#D4AF37] uppercase block mb-2 font-bold">
              INSPECTION TECHNIQUE 360°
            </span>
            <h2
              className={`text-2xl sm:text-4xl lg:text-5xl font-serif tracking-tight leading-tight ${
                isLight ? 'text-slate-900' : 'text-white'
              }`}
            >
              EXAMINEZ CHAQUE ANGLE <br />
              <span className={`italic font-serif ${isLight ? 'text-slate-600' : 'text-zinc-400'}`}>
                de l'ouvrage en atelier
              </span>
            </h2>
            <p
              className={`mt-3 text-xs sm:text-sm max-w-lg mx-auto leading-relaxed ${
                isLight ? 'text-slate-600' : 'text-zinc-300'
              }`}
            >
              Faites pivoter le châssis avec le doigt ou la souris, testez l'ouverture des vantaux et vérifiez chaque détail d'assemblage avant fabrication.
            </p>

            <div
              className={`mt-4 inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-xs font-mono backdrop-blur-xl shadow-lg ${
                isLight ? 'bg-white/90 border-slate-200 text-slate-800' : 'bg-white/10 border-white/20 text-zinc-200'
              }`}
            >
              <Compass className="w-4 h-4 text-[#D4AF37]" />
              <span>Glissez pour faire pivoter le châssis</span>
            </div>
          </div>
        </div>

        {/* BOTTOM METRIC HUD TAPE */}
        <div
          className={`absolute bottom-44 sm:bottom-24 left-0 right-0 z-20 hidden sm:flex items-center justify-between px-4 sm:px-8 text-[11px] font-mono pointer-events-none transition-colors ${
            isLight ? 'text-slate-500' : 'text-zinc-500'
          }`}
        >
          <div className="flex items-center gap-2 pointer-events-auto">
            <button
              onClick={handleToggle360}
              className={`flex items-center gap-2 px-3 py-1 rounded-full border text-[11px] font-mono transition-all cursor-pointer ${
                is360Active || isStage3
                  ? 'bg-[#D4AF37]/20 border-[#D4AF37] text-[#D4AF37] font-bold shadow-md shadow-[#D4AF37]/20'
                  : isLight
                  ? 'bg-white/80 border-slate-200 text-slate-600 hover:text-slate-900'
                  : 'bg-black/60 border-white/10 text-zinc-400 hover:text-white'
              }`}
            >
              <Rotate3d className={`w-3.5 h-3.5 ${is360Active || isStage3 ? 'text-[#D4AF37]' : ''}`} />
              <span>
                {is360Active || isStage3
                  ? 'MODE 360° ACTIF · GLISSER POUR PIVOTER'
                  : isStage1
                  ? 'VUE D’ENSEMBLE · CLIQUER POUR 360°'
                  : 'COUPE TECHNIQUE · CLIQUER POUR 360°'}
              </span>
            </button>
          </div>
          <div className="hidden sm:block">
            <span>ALGER · ORAN · CONSTANTINE · 58 WILAYAS</span>
          </div>
        </div>

        {/* FLOATING LUXURY CUSTOMIZER DOCK */}
        <div className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-30 pointer-events-auto w-full max-w-[96vw] sm:max-w-max flex justify-center">
          <div
            className={`flex items-center gap-2 sm:gap-3 px-3 sm:px-5 py-2 sm:py-2.5 rounded-full border backdrop-blur-2xl transition-colors shadow-2xl overflow-x-auto no-scrollbar max-w-full whitespace-nowrap scroll-smooth ${
              isLight
                ? 'bg-white/95 border-slate-200 text-slate-800 shadow-slate-300/50'
                : 'bg-black/80 border-white/15 text-white shadow-black/90'
            }`}
          >
            {/* SEGMENT 1: TRADE SELECTOR */}
            <div className="flex items-center gap-1 shrink-0">
              {tradePills.map((tr) => (
                <button
                  key={tr.id}
                  onClick={() => handleTradeSwitch(tr.id)}
                  className={`px-2.5 sm:px-3 py-1.5 rounded-full text-[11px] font-mono tracking-wide transition-all duration-200 cursor-pointer btn-press shrink-0 ${
                    selectedTrade === tr.id
                      ? 'bg-[#D4AF37] text-slate-950 font-bold shadow-md shadow-[#D4AF37]/30 scale-[1.03]'
                      : isLight
                      ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                      : 'text-zinc-400 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <span>{language === 'ar' ? tr.arabic : tr.label}</span>
                </button>
              ))}
            </div>

            {/* SEGMENT 1.5: WINDOW MODEL SELECTOR (WHEN ALUMINUM SELECTED) */}
            {selectedTrade === 'aluminum' && (
              <>
                <div className={`w-px h-5 shrink-0 ${isLight ? 'bg-slate-200' : 'bg-white/20'}`} />
                <div className="flex items-center gap-1 shrink-0">
                  {windowModelPills.map((wm) => (
                    <button
                      key={wm.id}
                      onClick={() => {
                        playSwitchSound();
                        setWindowModel(wm.id);
                      }}
                      className={`px-2.5 py-1.5 rounded-full text-[10px] font-mono transition-all cursor-pointer btn-press shrink-0 ${
                        windowModel === wm.id
                          ? isLight
                            ? 'bg-slate-900 text-white font-bold'
                            : 'bg-white text-slate-950 font-bold'
                          : isLight
                          ? 'text-slate-600 hover:bg-slate-100'
                          : 'text-zinc-400 hover:bg-white/10'
                      }`}
                    >
                      {language === 'ar' ? wm.arabic : wm.label}
                    </button>
                  ))}
                </div>
              </>
            )}

            {/* DIVIDER */}
            <div className={`w-px h-5 shrink-0 ${isLight ? 'bg-slate-200' : 'bg-white/20'}`} />

            {/* SEGMENT 2: FINISH PALETTE SWATCHES */}
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              <span className={`hidden lg:inline text-[10px] font-mono uppercase ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
                TEINTE :
              </span>
              <div className="flex items-center gap-1 sm:gap-1.5">
                {colorSwatches.map((sw) => (
                  <button
                    key={sw.id}
                    onClick={() => handleColorSwitch(sw.id)}
                    title={sw.label}
                    className={`w-6 h-6 sm:w-5 sm:h-5 rounded-full border transition-all cursor-pointer shrink-0 ${
                      config.finishColor === sw.id
                        ? 'ring-2 ring-[#D4AF37] scale-110 border-white shadow-xs'
                        : isLight
                        ? 'opacity-80 hover:opacity-100 border-slate-300'
                        : 'opacity-70 hover:opacity-100 border-white/30'
                    }`}
                    style={{ backgroundColor: sw.hex }}
                  />
                ))}
              </div>
            </div>

            {/* DIVIDER */}
            <div className={`w-px h-5 shrink-0 ${isLight ? 'bg-slate-200' : 'bg-white/20'}`} />

            {/* SEGMENT 3: ACTION CONTROLS */}
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={handleToggleExploded}
                title="Vue Éclatée"
                className={`w-8 h-8 sm:w-7 sm:h-7 rounded-full border flex items-center justify-center transition-all cursor-pointer shrink-0 ${
                  isExploded
                    ? 'bg-[#D4AF37] text-slate-950 border-[#D4AF37]'
                    : isLight
                    ? 'text-slate-600 hover:text-slate-900 border-slate-200 hover:bg-slate-100'
                    : 'text-zinc-400 hover:text-white border-white/15 hover:bg-white/10'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => {
                  playSwitchSound();
                  setIsClippingActive(!isClippingActive);
                }}
                title="Coupe Technique 3D"
                className={`w-8 h-8 sm:w-7 sm:h-7 rounded-full border flex items-center justify-center transition-all cursor-pointer shrink-0 ${
                  isClippingActive
                    ? 'bg-cyan-500 text-slate-950 border-cyan-400 font-bold shadow-md shadow-cyan-500/20'
                    : isLight
                    ? 'text-slate-600 hover:text-slate-900 border-slate-200 hover:bg-slate-100'
                    : 'text-zinc-400 hover:text-white border-white/15 hover:bg-white/10'
                }`}
              >
                <Scissors className="w-3.5 h-3.5" />
              </button>

              {isClippingActive && (
                <div className="flex items-center gap-1.5 pl-1.5 pr-2 py-0.5 rounded-full bg-black/40 border border-cyan-500/30 text-[10px] font-mono shrink-0">
                  <button
                    onClick={() => {
                      playSwitchSound();
                      setClippingAxis(clippingAxis === 'x' ? 'y' : 'x');
                    }}
                    className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-bold uppercase cursor-pointer"
                  >
                    {clippingAxis}
                  </button>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.02"
                    value={clippingPos}
                    onChange={(e) => setClippingPos(parseFloat(e.target.value))}
                    className="w-14 sm:w-16 accent-cyan-400 h-1 cursor-pointer"
                  />
                  <button
                    onClick={() => {
                      playTactileClick();
                      setClippingInverted(!clippingInverted);
                    }}
                    title="Inverser le sens"
                    className="p-1 rounded text-zinc-400 hover:text-white cursor-pointer"
                  >
                    <ArrowLeftRight className="w-3 h-3" />
                  </button>
                </div>
              )}

              <button
                onClick={handleToggle360}
                className={`px-3 py-1.5 rounded-full border text-[11px] font-mono tracking-wider uppercase transition-all flex items-center gap-1.5 cursor-pointer btn-press shrink-0 ${
                  is360Active
                    ? 'bg-cyan-500 text-slate-950 font-bold border-cyan-400 shadow-md shadow-cyan-500/20'
                    : isLight
                    ? 'text-slate-700 border-slate-200 hover:border-slate-400 hover:bg-slate-100'
                    : 'text-zinc-300 border-white/20 hover:border-white/40 hover:bg-white/10'
                }`}
              >
                <Rotate3d className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>360°</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

