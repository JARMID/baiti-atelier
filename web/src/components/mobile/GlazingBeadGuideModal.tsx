import React, { useState, useMemo } from 'react';
import {
  X,
  Scissors,
  Layers,
  MessageCircle,
  Copy,
  ShieldCheck,
  AlertTriangle,
  Sparkles,
} from 'lucide-react';
import {
  calculateGlazingBeadAssembly,
  formatGlazingBeadWhatsApp,
  PROFILE_SERIES_CATALOG,
  type GlazingCutMethod,
  type ProfileSeriesId,
} from '../../utils/glazingBeadManager';
import { playTactileClick, playClampSound } from '../../utils/audioFeedback';
import { useConfigStore } from '../../store/configStore';

export interface GlazingBeadGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialWidthMm?: number;
  initialHeightMm?: number;
  initialGlassThicknessMm?: number;
}

export const GlazingBeadGuideModal: React.FC<GlazingBeadGuideModalProps> = ({
  isOpen,
  onClose,
  initialWidthMm = 1200,
  initialHeightMm = 1400,
  initialGlassThicknessMm = 24,
}) => {
  const { theme } = useConfigStore();
  const isLight = theme === 'light';

  // Active tab: 'joints' (Assemblage & Coupes), 'cross_section' (Coupe & Clipsage), 'dtu39' (Calage DTU 39)
  const [activeTab, setActiveTab] = useState<'joints' | 'cross_section' | 'dtu39'>('joints');

  // Configuration parameters
  const [selectedSeries, setSelectedSeries] = useState<ProfileSeriesId>('gamme_45_thermal');
  const [glassThickness, setGlassThickness] = useState<number>(initialGlassThicknessMm);
  const [daylightWidth, setDaylightWidth] = useState<number>(initialWidthMm);
  const [daylightHeight, setDaylightHeight] = useState<number>(initialHeightMm);
  const [cutMethod, setCutMethod] = useState<GlazingCutMethod>('miter_45');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Calculation output
  const calculation = useMemo(() => {
    return calculateGlazingBeadAssembly({
      seriesId: selectedSeries,
      glassThicknessMm: glassThickness,
      daylightWidthMm: daylightWidth,
      daylightHeightMm: daylightHeight,
      preferredMethod: cutMethod,
    });
  }, [selectedSeries, glassThickness, daylightWidth, daylightHeight, cutMethod]);

  if (!isOpen) return null;

  const handleCopyList = () => {
    playClampSound();
    const lines = calculation.pieces.map(
      (p) => `${p.labelFr}: ${p.lengthMm} mm [${p.cutLeftAngle}°/${p.cutRightAngle}°]${p.hasNotch ? ` (${p.notchNoteFr})` : ''}`
    );
    const text = `DÉBIT PARCLOSES (${calculation.seriesName} - Vitrage ${calculation.glassThicknessMm}mm):\n` + lines.join('\n');
    navigator.clipboard.writeText(text);
    showToast('Liste de débit copiée dans le presse-papier !');
  };

  const handleShareWhatsApp = () => {
    playTactileClick();
    const msg = formatGlazingBeadWhatsApp(calculation);
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div
        className={`w-full max-w-xl max-h-[92vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl border shadow-2xl p-4 sm:p-6 space-y-4 font-mono text-xs ${
          isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-[#0E131F] border-white/10 text-white'
        }`}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-black/10 dark:border-white/10 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#D4AF37]/20 border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37]">
              <Scissors className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold flex items-center gap-1.5">
                <span>Guide Parcloses & Grugeage</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30">
                  DTU 39
                </span>
              </h2>
              <p className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
                Coupes d onglet 45°, coupes droites 90° et compatibilité feuillure
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 text-zinc-400 hover:text-white cursor-pointer transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Segmented View Tabs */}
        <div className="grid grid-cols-3 p-1 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10">
          <button
            type="button"
            onClick={() => {
              playTactileClick();
              setActiveTab('joints');
            }}
            className={`py-2 rounded-xl font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
              activeTab === 'joints'
                ? 'bg-[#D4AF37] text-slate-950 shadow-sm'
                : isLight
                ? 'text-slate-600 hover:text-slate-950'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Scissors className="w-3.5 h-3.5" />
            <span>Assemblage</span>
          </button>

          <button
            type="button"
            onClick={() => {
              playTactileClick();
              setActiveTab('cross_section');
            }}
            className={`py-2 rounded-xl font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
              activeTab === 'cross_section'
                ? 'bg-[#D4AF37] text-slate-950 shadow-sm'
                : isLight
                ? 'text-slate-600 hover:text-slate-950'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Coupe Profil</span>
          </button>

          <button
            type="button"
            onClick={() => {
              playTactileClick();
              setActiveTab('dtu39');
            }}
            className={`py-2 rounded-xl font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
              activeTab === 'dtu39'
                ? 'bg-[#D4AF37] text-slate-950 shadow-sm'
                : isLight
                ? 'text-slate-600 hover:text-slate-950'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Calage DTU 39</span>
          </button>
        </div>

        {/* Sizing Parameters Row */}
        <div
          className={`p-3 rounded-2xl border space-y-2.5 ${
            isLight ? 'bg-slate-50 border-slate-200' : 'bg-black/30 border-white/5'
          }`}
        >
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] text-zinc-400 block mb-1">Gamme Profilé</label>
              <select
                value={selectedSeries}
                onChange={(e) => setSelectedSeries(e.target.value as ProfileSeriesId)}
                className={`w-full p-2 rounded-xl border text-[11px] font-bold ${
                  isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-black/40 border-white/10 text-white'
                }`}
              >
                {Object.entries(PROFILE_SERIES_CATALOG).map(([id, info]) => (
                  <option key={id} value={id}>
                    {info.name} ({info.rebateDepthMm} mm)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[10px] text-zinc-400 block mb-1">Épaisseur Vitrage (mm)</label>
              <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
                {[4, 6, 10, 20, 24, 28, 32].map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setGlassThickness(t)}
                    className={`px-2 py-1.5 rounded-lg border text-[10px] font-bold cursor-pointer transition-all shrink-0 ${
                      glassThickness === t
                        ? 'bg-[#D4AF37] text-slate-950 border-[#D4AF37]'
                        : isLight
                        ? 'bg-white border-slate-200 text-slate-700'
                        : 'bg-white/5 border-white/10 text-zinc-400'
                    }`}
                  >
                    {t} mm
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Daylight Dimensions */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] text-zinc-400 block mb-1">Largeur Feuillure (mm)</label>
              <input
                type="number"
                value={daylightWidth}
                onChange={(e) => setDaylightWidth(Math.max(100, parseInt(e.target.value) || 0))}
                className={`w-full p-2 rounded-xl border text-xs font-bold ${
                  isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-black/40 border-white/10 text-white'
                }`}
              />
            </div>
            <div>
              <label className="text-[10px] text-zinc-400 block mb-1">Hauteur Feuillure (mm)</label>
              <input
                type="number"
                value={daylightHeight}
                onChange={(e) => setDaylightHeight(Math.max(100, parseInt(e.target.value) || 0))}
                className={`w-full p-2 rounded-xl border text-xs font-bold ${
                  isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-black/40 border-white/10 text-white'
                }`}
              />
            </div>
          </div>
        </div>

        {/* TAB 1: ASSEMBLAGE & COUPES */}
        {activeTab === 'joints' && (
          <div className="space-y-3">
            {/* Method Selector */}
            <div className="space-y-1">
              <label className="text-[10px] text-zinc-400 block">Type d Assemblage d Angle</label>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { id: 'miter_45', label: 'Coupe 45°', sub: 'Onglet 4 faces' },
                  { id: 'straight_90_horizontal_continuous', label: '90° Traverses', sub: 'Horiz. filantes' },
                  { id: 'straight_90_vertical_continuous', label: '90° Montants', sub: 'Vert. filants' },
                ].map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => {
                      playTactileClick();
                      setCutMethod(m.id as GlazingCutMethod);
                    }}
                    className={`p-2 rounded-xl border text-left cursor-pointer transition-all ${
                      calculation.cutMethod === m.id
                        ? 'bg-amber-500/15 border-amber-500/40 text-amber-300 font-bold'
                        : isLight
                        ? 'bg-slate-50 border-slate-200 text-slate-700'
                        : 'bg-black/20 border-white/5 text-zinc-400 hover:text-white'
                    }`}
                  >
                    <span className="block text-[11px] font-bold">{m.label}</span>
                    <span className="block text-[9px] opacity-75">{m.sub}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Interactive Corner SVG Assembly Diagram */}
            <div
              className={`p-4 rounded-2xl border flex flex-col items-center justify-center relative overflow-hidden ${
                isLight ? 'bg-slate-900 text-white border-slate-800' : 'bg-black/60 border-white/10'
              }`}
            >
              <div className="w-full flex items-center justify-between text-[10px] text-zinc-400 mb-2 font-mono">
                <span className="flex items-center gap-1 text-[#D4AF37] font-bold">
                  <Sparkles className="w-3 h-3" />
                  Schéma d Angle d Assemblage
                </span>
                <span>Vue Intérieure Atelier</span>
              </div>

              {/* Dynamic SVG Corner Rendering */}
              <svg viewBox="0 0 280 180" className="w-full max-w-xs h-40">
                {/* Background Frame / Sash Profile Corner */}
                <rect x="20" y="20" width="240" height="140" fill="#1E293B" stroke="#334155" strokeWidth="2" rx="4" />
                <rect x="50" y="50" width="210" height="110" fill="#0F172A" stroke="#475569" strokeWidth="1.5" />

                {/* Glass panel area in background */}
                <rect x="55" y="55" width="200" height="100" fill="#0284C7" fillOpacity="0.25" stroke="#38BDF8" strokeWidth="1" strokeDasharray="3 3" />
                <text x="140" y="115" fill="#38BDF8" fontSize="9" fontWeight="bold" textAnchor="middle">
                  Vitrage {glassThickness} mm
                </text>

                {calculation.cutMethod === 'miter_45' ? (
                  /* 45 Degree Miter Assembly */
                  <g>
                    {/* Top horizontal parclose */}
                    <polygon
                      points="50,50 250,50 250,75 75,75"
                      fill="#D4AF37"
                      fillOpacity="0.85"
                      stroke="#FDE047"
                      strokeWidth="1.5"
                    />
                    {/* Left vertical parclose */}
                    <polygon
                      points="50,50 75,75 75,160 50,160"
                      fill="#C5A880"
                      fillOpacity="0.85"
                      stroke="#FDE047"
                      strokeWidth="1.5"
                    />
                    {/* 45 Miter seam line */}
                    <line x1="50" y1="50" x2="75" y2="75" stroke="#FFFFFF" strokeWidth="2" />

                    {/* Angle annotation */}
                    <circle cx="62" cy="62" r="3" fill="#EF4444" />
                    <text x="85" y="65" fill="#FFFFFF" fontSize="9" fontWeight="bold">
                      Coupe 45°
                    </text>
                  </g>
                ) : calculation.cutMethod === 'straight_90_horizontal_continuous' ? (
                  /* 90 Degree Straight (Horizontal Continuous) */
                  <g>
                    {/* Horizontal bead runs full width */}
                    <rect x="50" y="50" width="200" height="25" fill="#D4AF37" fillOpacity="0.9" stroke="#FDE047" strokeWidth="1.5" />
                    <text x="150" y="66" fill="#0F172A" fontSize="8" fontWeight="bold" textAnchor="middle">
                      Traverse Filante (90°)
                    </text>

                    {/* Vertical bead butting under horizontal */}
                    <rect x="50" y="75" width="25" height="85" fill="#C5A880" fillOpacity="0.85" stroke="#FDE047" strokeWidth="1.5" />

                    {/* Notched clip foot callout */}
                    <line x1="50" y1="75" x2="75" y2="75" stroke="#EF4444" strokeWidth="2" />
                    <rect x="52" y="76" width="6" height="14" fill="#EF4444" fillOpacity="0.8" stroke="#F87171" strokeWidth="1" />

                    {/* Annotation arrow */}
                    <line x1="65" y1="83" x2="110" y2="95" stroke="#EF4444" strokeWidth="1.5" strokeDasharray="2 2" />
                    <circle cx="110" cy="95" r="2" fill="#EF4444" />
                    <text x="115" y="98" fill="#F87171" fontSize="8" fontWeight="bold">
                      Grugeage talon {calculation.selectedBead.defaultNotchMm} mm
                    </text>
                  </g>
                ) : (
                  /* 90 Degree Straight (Vertical Continuous) */
                  <g>
                    {/* Vertical bead runs full height */}
                    <rect x="50" y="50" width="25" height="110" fill="#C5A880" fillOpacity="0.9" stroke="#FDE047" strokeWidth="1.5" />
                    <text x="62" y="115" fill="#0F172A" fontSize="8" fontWeight="bold" textAnchor="middle" transform="rotate(-90 62 115)">
                      Montant Filant
                    </text>

                    {/* Horizontal bead butting against vertical */}
                    <rect x="75" y="50" width="175" height="25" fill="#D4AF37" fillOpacity="0.85" stroke="#FDE047" strokeWidth="1.5" />

                    {/* Notched clip foot */}
                    <line x1="75" y1="50" x2="75" y2="75" stroke="#EF4444" strokeWidth="2" />
                    <rect x="76" y="52" width="14" height="6" fill="#EF4444" fillOpacity="0.8" stroke="#F87171" strokeWidth="1" />

                    {/* Annotation */}
                    <line x1="83" y1="65" x2="115" y2="85" stroke="#EF4444" strokeWidth="1.5" strokeDasharray="2 2" />
                    <circle cx="115" cy="85" r="2" fill="#EF4444" />
                    <text x="120" y="88" fill="#F87171" fontSize="8" fontWeight="bold">
                      Grugeage talon {calculation.selectedBead.defaultNotchMm} mm
                    </text>
                  </g>
                )}

                {/* Corner origin marker */}
                <circle cx="50" cy="50" r="3" fill="#D4AF37" />
              </svg>

              <div className="mt-2 text-center text-[10px] text-zinc-300">
                {calculation.cutMethod === 'miter_45'
                  ? 'Coupe d onglet à 45° sur les 4 éléments avec jeu thermique de 1.5 mm.'
                  : calculation.cutMethod === 'straight_90_horizontal_continuous'
                  ? 'Traverses coupées droites pleine largeur. Montants raccourcis avec talon de clip entaillé.'
                  : 'Montants coupés droits pleine hauteur. Traverses raccourcies avec talon de clip entaillé.'}
              </div>
            </div>

            {/* Cut List Table */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[11px] font-bold">
                <span>Débit des 4 Parcloses</span>
                <span className="text-[#D4AF37]">
                  Total : {(calculation.totalLengthMm / 1000).toFixed(2)} m (~{calculation.estimatedWeightKg} kg)
                </span>
              </div>

              <div className="grid grid-cols-1 gap-1.5">
                {calculation.pieces.map((piece) => (
                  <div
                    key={piece.id}
                    className={`p-2.5 rounded-xl border flex items-center justify-between ${
                      isLight ? 'bg-slate-50 border-slate-200' : 'bg-black/30 border-white/5'
                    }`}
                  >
                    <div>
                      <div className="font-bold flex items-center gap-2">
                        <span>{piece.labelFr}</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-black/10 dark:bg-white/10 text-zinc-400">
                          {piece.cutLeftAngle}° / {piece.cutRightAngle}°
                        </span>
                      </div>
                      <div className="text-[10px] text-zinc-400">{piece.notchNoteFr}</div>
                    </div>

                    <div className="text-right">
                      <span className="text-sm font-bold text-[#D4AF37]">{piece.lengthMm} mm</span>
                      {piece.hasNotch && (
                        <span className="block text-[9px] text-amber-400 font-bold">Grugeage requis</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: COUPE DE PROFIL & CLIPSAGE */}
        {activeTab === 'cross_section' && (
          <div className="space-y-3">
            {/* Visual Cross-Section Diagram */}
            <div
              className={`p-4 rounded-2xl border flex flex-col items-center justify-center relative ${
                isLight ? 'bg-slate-900 text-white border-slate-800' : 'bg-black/60 border-white/10'
              }`}
            >
              <div className="w-full flex items-center justify-between text-[10px] text-zinc-400 mb-2 font-mono">
                <span className="flex items-center gap-1 text-[#D4AF37] font-bold">
                  <Layers className="w-3 h-3" />
                  Coupe Transversale Feuillure & Clipsage
                </span>
                <span>Fond de feuillure {calculation.totalRebateDepthMm} mm</span>
              </div>

              {/* Dynamic SVG Profile Section */}
              <svg viewBox="0 0 300 160" className="w-full max-w-sm h-40">
                {/* Aluminum Profile Sash Rebate */}
                <path
                  d="M 20,20 L 20,140 L 70,140 L 70,120 L 160,120 L 160,140 L 260,140 L 260,90 L 230,90 L 230,110 L 180,110 L 180,20 Z"
                  fill="#334155"
                  stroke="#64748B"
                  strokeWidth="1.5"
                />

                {/* Exterior Gasket */}
                <rect x="25" y="30" width="12" height="70" fill="#0F172A" stroke="#1E293B" strokeWidth="1" rx="2" />
                <text x="31" y="70" fill="#94A3B8" fontSize="7" fontWeight="bold" textAnchor="middle" transform="rotate(-90 31 70)">
                  Ext {calculation.exteriorGasket.thicknessMm}mm
                </text>

                {/* Glass Unit */}
                <rect x="42" y="20" width={Math.max(16, glassThickness * 2)} height="90" fill="#0284C7" fillOpacity="0.4" stroke="#38BDF8" strokeWidth="1.5" rx="1" />
                <text x={42 + Math.max(8, glassThickness)} y="68" fill="#FFFFFF" fontSize="8" fontWeight="bold" textAnchor="middle">
                  {glassThickness}mm
                </text>

                {/* Interior Wedge Gasket */}
                <rect
                  x={45 + Math.max(16, glassThickness * 2)}
                  y="30"
                  width="12"
                  height="70"
                  fill={calculation.interiorGasket.colorHex}
                  stroke="#FFFFFF"
                  strokeWidth="1"
                  rx="2"
                />
                <text
                  x={51 + Math.max(16, glassThickness * 2)}
                  y="70"
                  fill="#000000"
                  fontSize="7"
                  fontWeight="bold"
                  textAnchor="middle"
                  transform={`rotate(-90 ${51 + Math.max(16, glassThickness * 2)} 70)`}
                >
                  Coin {calculation.interiorGasket.thicknessMm}mm
                </text>

                {/* Glazing Bead (Parclose) Profile */}
                <path
                  d={`M ${60 + Math.max(16, glassThickness * 2)},30 L ${90 + Math.max(16, glassThickness * 2)},30 L ${90 + Math.max(16, glassThickness * 2)},115 L ${75 + Math.max(16, glassThickness * 2)},115 L ${75 + Math.max(16, glassThickness * 2)},105 L ${60 + Math.max(16, glassThickness * 2)},105 Z`}
                  fill="#D4AF37"
                  stroke="#FDE047"
                  strokeWidth="1.5"
                />
                <text x={75 + Math.max(16, glassThickness * 2)} y="65" fill="#0F172A" fontSize="8" fontWeight="bold" textAnchor="middle">
                  Parclose {calculation.selectedBead.depthMm}mm
                </text>

                {/* Snap-in Clip Groove Marker */}
                <circle cx={75 + Math.max(16, glassThickness * 2)} cy="115" r="3" fill="#EF4444" />
                <text x={75 + Math.max(16, glassThickness * 2)} y="132" fill="#F87171" fontSize="7" fontWeight="bold" textAnchor="middle">
                  Clip
                </text>
              </svg>
            </div>

            {/* Dimensional Stack Verification Card */}
            <div
              className={`p-3 rounded-2xl border text-xs space-y-2 ${
                isLight ? 'bg-slate-50 border-slate-200' : 'bg-black/30 border-white/5'
              }`}
            >
              <div className="font-bold flex items-center justify-between">
                <span>Équation d Empilement Feuillure</span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    calculation.isFitFeasible
                      ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                      : 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                  }`}
                >
                  {calculation.isFitFeasible ? 'Parfaitement Ajusté' : 'Ajustement Délicat'}
                </span>
              </div>

              <div className="grid grid-cols-4 gap-1 text-center font-mono text-[10px]">
                <div className="p-2 rounded-xl bg-black/10 dark:bg-white/5">
                  <span className="text-zinc-400 block">Joint Ext.</span>
                  <span className="font-bold">{calculation.exteriorGasket.thicknessMm} mm</span>
                </div>
                <div className="p-2 rounded-xl bg-black/10 dark:bg-white/5">
                  <span className="text-zinc-400 block">Vitrage</span>
                  <span className="font-bold text-sky-400">{calculation.glassThicknessMm} mm</span>
                </div>
                <div className="p-2 rounded-xl bg-black/10 dark:bg-white/5">
                  <span className="text-zinc-400 block">Joint Coin</span>
                  <span className="font-bold text-amber-400">{calculation.interiorGasket.thicknessMm} mm</span>
                </div>
                <div className="p-2 rounded-xl bg-black/10 dark:bg-white/5">
                  <span className="text-zinc-400 block">Parclose</span>
                  <span className="font-bold text-[#D4AF37]">{calculation.selectedBead.depthMm} mm</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] pt-1 border-t border-black/5 dark:border-white/5">
                <span className="text-zinc-400">Total empilement / Feuillure nominale :</span>
                <span className="font-bold">
                  {(
                    calculation.exteriorGasket.thicknessMm +
                    calculation.glassThicknessMm +
                    calculation.interiorGasket.thicknessMm +
                    calculation.selectedBead.depthMm
                  ).toFixed(1)}{' '}
                  mm / {calculation.totalRebateDepthMm} mm
                </span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: CALAGE VITRAGE DTU 39 */}
        {activeTab === 'dtu39' && (
          <div className="space-y-3">
            <div
              className={`p-3 rounded-2xl border text-xs space-y-2.5 ${
                isLight ? 'bg-slate-50 border-slate-200' : 'bg-black/30 border-white/5'
              }`}
            >
              <div className="font-bold flex items-center gap-1.5 text-emerald-400">
                <ShieldCheck className="w-4 h-4" />
                <span>Règles de Calage DTU 39 & Triangulation</span>
              </div>
              <p className="text-[11px] text-zinc-400 leading-relaxed">
                Le calage isole le vitrage du contact direct avec l aluminium et transmet le poids propre aux paumelles pour empêcher l affaissement du vantail dans le temps.
              </p>

              <div className="space-y-2 pt-1">
                {calculation.settingBlocks.map((sb, idx) => (
                  <div
                    key={idx}
                    className={`p-2.5 rounded-xl border flex items-start gap-2.5 ${
                      isLight ? 'bg-white border-slate-200' : 'bg-black/40 border-white/10'
                    }`}
                  >
                    <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                      {idx + 1}
                    </div>
                    <div className="space-y-0.5 min-w-0">
                      <div className="font-bold text-[11px]">{sb.description}</div>
                      <div className="text-[10px] text-zinc-400">Emplacement : {sb.positionFr}</div>
                      <div className="text-[10px] text-[#D4AF37]">
                        Épaisseur : {sb.recommendedThicknessMm} mm • Distance angle : $\ge$ {sb.minDistanceCornerMm} mm
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Anti-Sagging Ouvrant Diagram */}
            <div
              className={`p-3.5 rounded-2xl border space-y-2 ${
                isLight ? 'bg-amber-50/60 border-amber-200 text-slate-800' : 'bg-amber-500/10 border-amber-500/20 text-amber-200'
              }`}
            >
              <div className="font-bold flex items-center gap-1.5 text-amber-400 text-xs">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>Règle d Or Ouvrant à la Française / OB</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                Toujours caler en diagonale : <strong>Cale d assise en bas côté paumelle</strong> et <strong>Cale de flèche en haut côté poignée</strong>. Cela crée un arc-boutement rigide indéformable qui évite tout frottement sur le seuil après plusieurs années.
              </p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-between gap-2 pt-2 border-t border-black/10 dark:border-white/10">
          <button
            type="button"
            onClick={handleCopyList}
            className={`px-3 py-2.5 rounded-xl border font-bold flex items-center gap-1.5 cursor-pointer text-xs transition-all min-h-[44px] ${
              isLight
                ? 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
                : 'bg-white/5 border-white/10 text-zinc-300 hover:text-white'
            }`}
          >
            <Copy className="w-3.5 h-3.5" />
            <span>Copier Liste</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleShareWhatsApp}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center gap-1.5 cursor-pointer text-xs transition-all shadow-md min-h-[44px]"
            >
              <MessageCircle className="w-4 h-4" />
              <span>WhatsApp Débiteur</span>
            </button>
          </div>
        </div>

        {/* Toast */}
        {toastMessage && (
          <div className="p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 font-bold text-center text-xs animate-in fade-in duration-200">
            {toastMessage}
          </div>
        )}
      </div>
    </div>
  );
};
