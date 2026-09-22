import React, { Suspense, useRef, useState, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, ContactShadows, Grid, Float } from '@react-three/drei';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import * as THREE from 'three';
import { ParametricWindow3D } from './ParametricWindow3D';
import { useConfigStore } from '../../store/configStore';
import {
  Rotate3d,
  Layers,
  Expand,
  Compass,
  Scissors,
  ArrowLeftRight,
  Tag,
} from 'lucide-react';
import { playTactileClick, playSwitchSound, playClampSound } from '../../utils/audioFeedback';

export const WindowCanvas: React.FC = () => {
  const { config, language, theme, toggleExplodedView, toggleOpen, setOpenPercent } = useConfigStore();
  const isLight = theme === 'light';
  const [autoRotate, setAutoRotate] = useState(false);
  const controlsRef = useRef<OrbitControlsImpl | null>(null);

  // 3D Clipping Section State
  const [isClippingActive, setIsClippingActive] = useState(false);
  const [clippingAxis, setClippingAxis] = useState<'x' | 'y' | 'z'>('x');
  const [clippingPos, setClippingPos] = useState(0.5);
  const [clippingInverted, setClippingInverted] = useState(false);
  const [showSectionTags, setShowSectionTags] = useState(true);

  const resetCamera = () => {
    playTactileClick();
    if (controlsRef.current) {
      controlsRef.current.reset();
    }
  };

  const handleToggleAutoRotate = () => {
    playSwitchSound();
    setAutoRotate(!autoRotate);
  };

  const handleToggleExplodedView = () => {
    playSwitchSound();
    toggleExplodedView();
  };

  const handleToggleOpen = () => {
    playClampSound();
    toggleOpen();
  };

  // Dynamic 3D Clipping Plane Calculation
  const clippingPlane = useMemo(() => {
    if (!isClippingActive) return null;
    const sign = clippingInverted ? 1 : -1;
    const wM = config.width / 1000;
    const hM = config.height / 1000;

    if (clippingAxis === 'x') {
      const cutX = (clippingPos - 0.5) * wM;
      return new THREE.Plane(new THREE.Vector3(sign, 0, 0), sign * -cutX);
    } else if (clippingAxis === 'y') {
      const cutY = (clippingPos - 0.5) * hM;
      return new THREE.Plane(new THREE.Vector3(0, sign, 0), sign * -cutY);
    } else {
      const cutZ = (clippingPos - 0.5) * 0.2;
      return new THREE.Plane(new THREE.Vector3(0, 0, sign), sign * -cutZ);
    }
  }, [isClippingActive, clippingAxis, clippingPos, clippingInverted, config.width, config.height]);

  const openLabel =
    language === 'ar'
      ? config.isOpen
        ? 'إغلاق'
        : 'فتح'
      : language === 'en'
      ? config.isOpen
        ? 'Close'
        : 'Open'
      : config.isOpen
      ? 'Fermer'
      : 'Ouvrir';

  const hintText =
    language === 'ar'
      ? 'اسحب للتدوير • العجلة للتكبير • زر الفأرة الأيمن للتحريك'
      : language === 'en'
      ? 'Drag to rotate • Wheel to zoom • Right-click to pan'
      : 'Faire glisser pour pivoter • Molette pour zoomer • Clic droit pour déplacer';

  return (
    <div
      className={`relative w-full h-full min-h-[320px] rounded-2xl overflow-hidden glass-panel border transition-all duration-300 shadow-2xl ${
        isLight
          ? 'bg-gradient-to-b from-[#FFFFFF] via-[#F8FAFC] to-[#EDF2F7] border-slate-200 text-slate-800 shadow-slate-200/60'
          : 'bg-gradient-to-b from-[#13161F] via-[#0E1017] to-[#0A0C10] border-white/10 text-white'
      }`}
    >
      {/* HUD Quick Actions Header */}
      <div className="absolute top-4 left-4 right-4 z-10 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-2 pointer-events-auto">
          <span
            className={`px-3 py-1 rounded-full border text-xs font-mono flex items-center gap-1.5 backdrop-blur-md ${
              isLight
                ? 'bg-white/90 border-slate-200 text-slate-700 shadow-sm'
                : 'bg-black/50 border-white/10 text-zinc-300'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]" />
            Vue 3D Châssis
          </span>
          <span
            className={`hidden sm:inline-block px-3 py-1 rounded-full border text-xs font-mono backdrop-blur-md ${
              isLight
                ? 'bg-white/80 border-slate-200 text-slate-600 shadow-sm'
                : 'bg-black/40 border-white/10 text-zinc-400'
            }`}
          >
            {config.width} × {config.height} mm
          </span>
        </div>

        {/* 3D Action Tools */}
        <div
          className={`flex items-center gap-1.5 pointer-events-auto p-1 rounded-xl border backdrop-blur-md ${
            isLight
              ? 'bg-white/90 border-slate-200 shadow-md text-slate-700'
              : 'bg-black/60 border-white/10 text-white'
          }`}
        >
          <button
            onClick={() => {
              playSwitchSound();
              setIsClippingActive(!isClippingActive);
            }}
            title="Coupe Technique 3D (Écorché intérieur)"
            className={`p-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
              isClippingActive
                ? 'bg-cyan-500 text-black font-bold shadow-md shadow-cyan-500/30'
                : isLight
                ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Scissors className="w-4 h-4" />
          </button>

          <button
            onClick={handleToggleAutoRotate}
            title="Auto-rotation"
            className={`p-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
              autoRotate
                ? 'bg-[#D4AF37] text-black font-bold'
                : isLight
                ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Rotate3d className="w-4 h-4" />
          </button>

          <button
            onClick={handleToggleExplodedView}
            title="Vue éclatée"
            className={`p-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
              config.explodedView
                ? 'bg-[#D4AF37] text-black font-bold'
                : isLight
                ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Layers className="w-4 h-4" />
          </button>

          <button
            onClick={handleToggleOpen}
            title={openLabel}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer ${
              config.isOpen
                ? 'bg-emerald-600 text-white font-bold'
                : isLight
                ? 'bg-slate-100 text-slate-800 hover:bg-slate-200'
                : 'text-zinc-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>{openLabel}</span>
          </button>

          <button
            onClick={resetCamera}
            title="Reset camera"
            className={`p-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
              isLight
                ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Expand className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 3D Canvas */}
      <Canvas
        camera={{ position: [0, 0, 2.7], fov: 42 }}
        shadows
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance', localClippingEnabled: true }}
        onCreated={({ gl }) => {
          gl.localClippingEnabled = true;
        }}
      >
        {/* Studio Lighting Rig */}
        <ambientLight intensity={isLight ? 0.95 : 0.7} />
        <directionalLight
          position={[4, 5, 4]}
          intensity={isLight ? 1.9 : 1.8}
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
          shadow-camera-near={0.5}
          shadow-camera-far={15}
          shadow-bias={-0.0001}
        />
        <directionalLight
          position={[-4, 3, -3]}
          intensity={isLight ? 0.7 : 0.9}
          color={isLight ? '#93C5FD' : '#88AAFF'}
        />
        <directionalLight position={[0, -3, 3]} intensity={0.4} color="#FFAA88" />

        <Suspense fallback={null}>
          <Float speed={autoRotate ? 0 : 0.8} rotationIntensity={0.04} floatIntensity={0.08}>
            <ParametricWindow3D
              config={config}
              clippingPlane={clippingPlane}
              showAnnotations={showSectionTags}
            />
          </Float>

          {/* Contact Shadow & Floor Grid */}
          <ContactShadows
            position={[0, -config.height / 2000 - 0.15, 0]}
            opacity={isLight ? 0.35 : 0.65}
            scale={4}
            blur={2}
            far={3}
            color={isLight ? '#64748B' : '#000000'}
          />

          <Grid
            position={[0, -config.height / 2000 - 0.16, 0]}
            args={[6, 6]}
            cellSize={0.2}
            cellThickness={0.8}
            cellColor={isLight ? '#E2E8F0' : '#242B38'}
            sectionSize={1}
            sectionThickness={1.2}
            sectionColor={isLight ? '#94A3B8' : '#3B82F6'}
            fadeDistance={4}
            fadeStrength={1.5}
          />
        </Suspense>

        <OrbitControls
          ref={controlsRef}
          enablePan={true}
          enableZoom={true}
          minDistance={1.2}
          maxDistance={4.8}
          minPolarAngle={Math.PI / 6}
          maxPolarAngle={Math.PI / 1.8}
          autoRotate={autoRotate}
          autoRotateSpeed={1.5}
          dampingFactor={0.05}
        />
      </Canvas>

      {/* 3D CLIPPING SECTION TRAY (DISPLAYED WHEN ACTIVE) */}
      {isClippingActive && (
        <div
          className={`absolute bottom-10 sm:bottom-12 left-2 sm:left-4 right-2 sm:right-4 z-20 p-2.5 sm:p-3 rounded-2xl border backdrop-blur-xl flex flex-wrap items-center justify-between gap-2 sm:gap-3 text-xs font-mono shadow-2xl transition-all ${
            isLight
              ? 'bg-white/95 border-slate-200 text-slate-900 shadow-slate-300/50'
              : 'bg-[#090D18]/90 border-cyan-500/30 text-white shadow-cyan-950/50'
          }`}
        >
          <div className="flex items-center gap-2">
            <span className="text-cyan-400 font-bold flex items-center gap-1.5 text-[11px] sm:text-xs">
              <Scissors className="w-3.5 h-3.5" />
              <span>Coupe 3D :</span>
            </span>
            <div className="flex items-center gap-1 bg-black/20 p-1 rounded-xl border border-white/10">
              {(['x', 'y', 'z'] as const).map((axis) => (
                <button
                  key={axis}
                  onClick={() => {
                    playSwitchSound();
                    setClippingAxis(axis);
                  }}
                  className={`px-2.5 sm:px-3 py-1 rounded-lg text-[10px] sm:text-[11px] font-bold uppercase transition-all cursor-pointer min-h-[28px] flex items-center justify-center ${
                    clippingAxis === axis
                      ? 'bg-cyan-500 text-slate-950 shadow-xs'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  Axe {axis}
                </button>
              ))}
            </div>
          </div>

          {/* Slider */}
          <div className="flex-1 min-w-[140px] sm:min-w-[180px] flex items-center gap-2">
            <span className="text-[10px] text-zinc-400">Position:</span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={clippingPos}
              onChange={(e) => setClippingPos(parseFloat(e.target.value))}
              className="flex-1 accent-cyan-400 cursor-pointer h-1.5 rounded-lg bg-zinc-700"
            />
            <span className="text-[11px] font-bold text-cyan-400 w-10 text-right">
              {Math.round(clippingPos * 100)}%
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                playTactileClick();
                setClippingInverted(!clippingInverted);
              }}
              title="Inverser le sens de coupe"
              className={`p-1.5 sm:p-2 rounded-xl border flex items-center gap-1 text-[11px] cursor-pointer transition-colors ${
                clippingInverted
                  ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                  : 'bg-white/5 border-white/10 text-zinc-400 hover:text-white'
              }`}
            >
              <ArrowLeftRight className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Inverser</span>
            </button>

            <button
              onClick={() => {
                playTactileClick();
                setShowSectionTags(!showSectionTags);
              }}
              title="Afficher/masquer les étiquettes de profilé"
              className={`p-1.5 sm:p-2 rounded-xl border flex items-center gap-1 text-[11px] cursor-pointer transition-colors ${
                showSectionTags
                  ? 'bg-[#D4AF37]/20 border-[#D4AF37] text-[#D4AF37]'
                  : 'bg-white/5 border-white/10 text-zinc-400 hover:text-white'
              }`}
            >
              <Tag className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Étiquettes RPT</span>
            </button>
          </div>
        </div>
      )}

      {/* Floating Open Percentage Slider */}
      {config.isOpen && !isClippingActive && (
        <div
          className={`absolute bottom-3 left-4 right-4 z-20 p-2 sm:p-2.5 rounded-2xl border backdrop-blur-md flex items-center gap-2.5 font-mono text-xs shadow-lg max-w-sm mx-auto ${
            isLight
              ? 'bg-white/95 border-slate-200 text-slate-800'
              : 'bg-[#0B0F19]/95 border-white/10 text-white'
          }`}
        >
          <span className="text-[10px] text-zinc-400 shrink-0">Ouverture :</span>
          <input
            type="range"
            min="0"
            max="100"
            step="1"
            value={config.openPercent}
            onChange={(e) => setOpenPercent(parseInt(e.target.value, 10))}
            className="flex-1 accent-emerald-400 cursor-pointer h-1.5 rounded-lg bg-zinc-700"
          />
          <span className="text-xs font-bold text-emerald-400 font-mono w-9 text-right shrink-0">
            {config.openPercent}%
          </span>
        </div>
      )}

      {/* Floating Instruction Hint */}
      <div
        className={`hidden sm:block absolute bottom-3 left-1/2 -translate-x-1/2 pointer-events-none text-[11px] font-mono px-3 py-1 rounded-full border backdrop-blur-sm ${
          config.isOpen ? 'hidden' : ''
        } ${
          isLight
            ? 'bg-white/80 border-slate-200 text-slate-600 shadow-sm'
            : 'bg-black/40 border-white/5 text-zinc-500'
        }`}
      >
        {hintText}
      </div>
    </div>
  );
};
