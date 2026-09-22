import React, { Suspense, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, ContactShadows, Grid, Float } from '@react-three/drei';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { ParametricWindow3D } from './ParametricWindow3D';
import { useConfigStore } from '../../store/configStore';
import { Rotate3d, Layers, Expand, Sparkles } from 'lucide-react';
import { playTactileClick, playSwitchSound, playClampSound } from '../../utils/audioFeedback';

export const WindowCanvas: React.FC = () => {
  const { config, language, theme, toggleExplodedView, toggleOpen } = useConfigStore();
  const isLight = theme === 'light';
  const [autoRotate, setAutoRotate] = useState(false);
  const controlsRef = useRef<OrbitControlsImpl | null>(null);

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
      className={`relative w-full h-[520px] md:h-[640px] rounded-2xl overflow-hidden glass-panel border transition-all duration-300 shadow-2xl ${
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
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            3D Studio WebGL
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
                ? 'bg-emerald-600 text-white'
                : isLight
                ? 'bg-slate-100 text-slate-800 hover:bg-slate-200'
                : 'text-zinc-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{openLabel}</span>
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
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
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
            <ParametricWindow3D config={config} />
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

      {/* Floating Instruction Hint */}
      <div
        className={`absolute bottom-3 left-1/2 -translate-x-1/2 pointer-events-none text-[11px] font-mono px-3 py-1 rounded-full border backdrop-blur-sm ${
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
