import React, { useState } from 'react';
import { useConfigStore } from '../../store/configStore';
import {
  Layers,
  ZoomIn,
  ZoomOut,
  Download,
  Info,
  ShieldCheck,
} from 'lucide-react';
import { playTactileClick, playSwitchSound } from '../../utils/audioFeedback';

export type ProfileSeriesType = 'alu_45_rpt' | 'alu_52_rpt' | 'pvc_60_multi';
export type AssemblySectionType = 'casement' | 'sliding' | 'fixed';

interface ProfileCrossSectionViewerProps {
  initialSeries?: ProfileSeriesType;
  onClose?: () => void;
}

interface SeriesSpec {
  name: string;
  depthMm: number;
  faceWidthMm: number;
  thermalBreakMm: number;
  uFactorUf: number;
  description: string;
  materialName: string;
}

const SERIES_SPECS: Record<ProfileSeriesType, SeriesSpec> = {
  alu_45_rpt: {
    name: 'Aluminium 45 RPT Standard',
    depthMm: 45,
    faceWidthMm: 55,
    thermalBreakMm: 14.8,
    uFactorUf: 2.6,
    description: 'Série la plus répandue en Algérie (Alugraf, Profilor). Barrette polyamide PA66 GF25 de 14.8mm.',
    materialName: 'Alliage EN AW-6060 T6 thermo-laqué',
  },
  alu_52_rpt: {
    name: 'Aluminium 52 RPT Haute Isolation',
    depthMm: 52,
    faceWidthMm: 62,
    thermalBreakMm: 24.0,
    uFactorUf: 1.9,
    description: 'Conforme DTR C3-2 Zone B (Hauts Plateaux). Barrette tubulaire polyamide de 24mm et joint central EPDM.',
    materialName: 'Alliage EN AW-6060 T6 à rupture renforcée',
  },
  pvc_60_multi: {
    name: 'PVC 60 Multi-Chambres',
    depthMm: 60,
    faceWidthMm: 60,
    thermalBreakMm: 0,
    uFactorUf: 1.4,
    description: 'Profilé PVC 4 chambres isolantes avec renfort tubulaire en acier galvanisé de 1.5mm.',
    materialName: 'PVC rigide modifié antichoc résistant aux UV',
  },
};

export const ProfileCrossSectionViewer: React.FC<ProfileCrossSectionViewerProps> = ({
  initialSeries = 'alu_45_rpt',
  onClose,
}) => {
  const { theme } = useConfigStore();
  const isLight = theme === 'light';

  const [series, setSeries] = useState<ProfileSeriesType>(initialSeries);
  const [sectionType, setSectionType] = useState<AssemblySectionType>('casement');
  const [zoom, setZoom] = useState(1.0);
  const [showDimensions, setShowDimensions] = useState(true);
  const [activeCallout, setActiveCallout] = useState<string | null>(null);

  const spec = SERIES_SPECS[series];

  const handleDownloadSvg = () => {
    playTactileClick();
    const svgElem = document.getElementById('technical-cross-section-svg');
    if (!svgElem) return;
    const svgData = new XMLSerializer().serializeToString(svgElem);
    const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `coupe_technique_${series}_${sectionType}.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div
      className={`rounded-3xl border flex flex-col overflow-hidden transition-all shadow-xl ${
        isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-[#090D16] border-white/10 text-zinc-100'
      }`}
    >
      {/* HEADER CONTROL BAR */}
      <div
        className={`p-5 border-b flex flex-wrap items-center justify-between gap-4 ${
          isLight ? 'bg-slate-50 border-slate-200' : 'bg-white/5 border-white/10'
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#C5A880] to-[#D4AF37] p-0.5 flex items-center justify-center shadow-md">
            <div
              className={`w-full h-full rounded-[14px] flex items-center justify-center ${
                isLight ? 'bg-white text-slate-900' : 'bg-[#0D121F] text-[#D4AF37]'
              }`}
            >
              <Layers className="w-5 h-5 text-[#D4AF37]" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold tracking-tight">Coupe Technique CAO de Profilé (2D)</h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-sky-500/15 border border-sky-500/30 text-sky-600 dark:text-sky-400 font-semibold">
                DTR C3-2 ARCHITECTURE
              </span>
            </div>
            <p className={`text-xs mt-0.5 ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
              Détail d'assemblage dormant / ouvrant, barrettes polyamide et prise de feuillure
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              playTactileClick();
              setShowDimensions(!showDimensions);
            }}
            className={`px-3 py-1.5 rounded-xl border text-xs font-mono transition-all cursor-pointer ${
              showDimensions
                ? 'bg-[#D4AF37]/15 border-[#D4AF37] text-[#D4AF37] font-bold'
                : isLight
                ? 'bg-white border-slate-300 text-slate-700'
                : 'bg-white/5 border-white/10 text-zinc-300'
            }`}
          >
            Cotes techniques: {showDimensions ? 'ON' : 'OFF'}
          </button>

          <button
            onClick={handleDownloadSvg}
            className={`p-2 rounded-xl border transition-all cursor-pointer ${
              isLight
                ? 'bg-white hover:bg-slate-100 border-slate-300 text-slate-700'
                : 'bg-white/5 hover:bg-white/10 border-white/10 text-zinc-300'
            }`}
            title="Exporter la coupe en SVG vectoriel"
          >
            <Download className="w-4 h-4 text-emerald-500" />
          </button>

          {onClose && (
            <button
              onClick={() => {
                playTactileClick();
                onClose();
              }}
              className={`p-2 rounded-xl border transition-all cursor-pointer ${
                isLight ? 'bg-white border-slate-300 text-slate-600' : 'bg-white/5 border-white/10 text-zinc-400'
              }`}
            >
              Fermer
            </button>
          )}
        </div>
      </div>

      {/* SERIES & ASSEMBLY SELECTOR TABS */}
      <div
        className={`px-5 py-3 border-b flex flex-wrap items-center justify-between gap-3 text-xs font-mono ${
          isLight ? 'bg-slate-100/70 border-slate-200' : 'bg-black/20 border-white/5'
        }`}
      >
        <div className="flex flex-wrap items-center gap-2">
          <span className={`text-[11px] uppercase tracking-wider ${isLight ? 'text-slate-500' : 'text-zinc-500'}`}>Gamme:</span>
          {(Object.keys(SERIES_SPECS) as ProfileSeriesType[]).map((key) => {
            const isSelected = series === key;
            return (
              <button
                key={key}
                onClick={() => {
                  playSwitchSound();
                  setSeries(key);
                }}
                className={`px-3 py-1 rounded-xl transition-all cursor-pointer font-bold ${
                  isSelected
                    ? 'bg-[#D4AF37] text-slate-950 shadow-xs'
                    : isLight
                    ? 'bg-white hover:bg-slate-200 text-slate-700 border border-slate-200'
                    : 'bg-white/5 hover:bg-white/10 text-zinc-300 border border-white/10'
                }`}
              >
                {SERIES_SPECS[key].name}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          <span className={`text-[11px] uppercase tracking-wider ${isLight ? 'text-slate-500' : 'text-zinc-500'}`}>Type:</span>
          <button
            onClick={() => {
              playSwitchSound();
              setSectionType('casement');
            }}
            className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
              sectionType === 'casement'
                ? 'bg-sky-500 text-white font-bold'
                : isLight
                ? 'bg-white text-slate-700 border border-slate-200'
                : 'bg-white/5 text-zinc-400 border border-white/10'
            }`}
          >
            Frappe / Battant
          </button>
          <button
            onClick={() => {
              playSwitchSound();
              setSectionType('sliding');
            }}
            className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
              sectionType === 'sliding'
                ? 'bg-sky-500 text-white font-bold'
                : isLight
                ? 'bg-white text-slate-700 border border-slate-200'
                : 'bg-white/5 text-zinc-400 border border-white/10'
            }`}
          >
            Coulissant 2V
          </button>
        </div>
      </div>

      {/* MAIN VIEWING CANVAS */}
      <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* SVG TECHNICAL DRAWING (2 COLUMNS) */}
        <div className="lg:col-span-2 flex flex-col items-center justify-center relative min-h-[420px] rounded-2xl border overflow-hidden bg-[#0A0E17] border-white/10">
          {/* Zoom Controls */}
          <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5 bg-black/60 backdrop-blur-md p-1 rounded-xl border border-white/10">
            <button
              onClick={() => setZoom((z) => Math.max(0.7, z - 0.15))}
              className="p-1.5 rounded-lg hover:bg-white/10 text-zinc-300 cursor-pointer"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-[10px] font-mono px-1.5 text-zinc-300">{Math.round(zoom * 100)}%</span>
            <button
              onClick={() => setZoom((z) => Math.min(1.8, z + 0.15))}
              className="p-1.5 rounded-lg hover:bg-white/10 text-zinc-300 cursor-pointer"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* SVG Vector Drawing */}
          <svg
            id="technical-cross-section-svg"
            viewBox="0 0 600 460"
            className="w-full max-w-[560px] h-auto transition-transform duration-200"
            style={{ transform: `scale(${zoom})` }}
          >
            {/* Background Grid Pattern */}
            <defs>
              <pattern id="cadGrid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#1E293B" strokeWidth="0.5" strokeOpacity="0.5" />
              </pattern>
              {/* Polyamide thermal break hatch */}
              <pattern id="polyamideHatch" width="6" height="6" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
                <line x1="0" y1="0" x2="0" y2="6" stroke="#D4AF37" strokeWidth="1.2" strokeOpacity="0.7" />
              </pattern>
            </defs>

            <rect width="600" height="460" fill="#0A0E17" />
            <rect width="600" height="460" fill="url(#cadGrid)" />

            {/* TECHNICAL BLUEPRINT AXIS / CENTER LINE */}
            <line x1="30" y1="360" x2="570" y2="360" stroke="#334155" strokeDasharray="6 4" strokeWidth="1" />
            <text x="40" y="352" fill="#64748B" fontSize="9" fontFamily="monospace">Niveau Rejau Bas / Appui Maçonnerie</text>

            {/* 1. OUTER FRAME (DORMANT) */}
            <g id="dormant-group" onMouseEnter={() => setActiveCallout('dormant')}>
              {/* Outer chamber */}
              <rect x="70" y="240" width="130" height="110" fill="#1E293B" stroke="#38BDF8" strokeWidth="2" rx="3" />
              {/* Inner hollow chamber cutout */}
              <rect x="85" y="255" width="100" height="80" fill="#0F172A" stroke="#38BDF8" strokeWidth="1" />
              <text x="135" y="300" fill="#94A3B8" fontSize="10" fontFamily="monospace" textAnchor="middle" fontWeight="bold">
                Dormant {spec.depthMm}mm
              </text>
            </g>

            {/* 2. POLYAMIDE THERMAL BREAK STRIPS (PA66 GF25) */}
            {series !== 'pvc_60_multi' && (
              <g id="thermal-break-group" onMouseEnter={() => setActiveCallout('thermal_break')}>
                {/* Upper barrette */}
                <rect x="200" y="265" width={spec.thermalBreakMm * 2.2} height="12" fill="url(#polyamideHatch)" stroke="#D4AF37" strokeWidth="1.5" rx="2" />
                {/* Lower barrette */}
                <rect x="200" y="315" width={spec.thermalBreakMm * 2.2} height="12" fill="url(#polyamideHatch)" stroke="#D4AF37" strokeWidth="1.5" rx="2" />
                <text x="200 + 15" y="297" fill="#D4AF37" fontSize="8.5" fontFamily="monospace" fontWeight="bold">
                  RPT {spec.thermalBreakMm}mm
                </text>
              </g>
            )}

            {/* 3. INNER FRAME CHAMBER */}
            {series !== 'pvc_60_multi' && (
              <g id="dormant-inner">
                <rect x={200 + spec.thermalBreakMm * 2.2} y="240" width="90" height="110" fill="#1E293B" stroke="#38BDF8" strokeWidth="2" rx="3" />
                <rect x={215 + spec.thermalBreakMm * 2.2} y="255" width="60" height="80" fill="#0F172A" stroke="#38BDF8" strokeWidth="1" />
              </g>
            )}

            {/* 4. SASH PROFILE (OUVRANT) */}
            <g id="sash-group" onMouseEnter={() => setActiveCallout('ouvrant')}>
              <rect x="340" y="150" width="150" height="150" fill="#1E293B" stroke="#38BDF8" strokeWidth="2" rx="3" />
              <rect x="355" y="165" width="120" height="120" fill="#0F172A" stroke="#38BDF8" strokeWidth="1" />
              <text x="415" y="230" fill="#E2E8F0" fontSize="11" fontFamily="monospace" textAnchor="middle" fontWeight="bold">
                Ouvrant Frappe
              </text>
            </g>

            {/* 5. GLAZING BEAD (PARCLOSE) */}
            <g id="parclose-group" onMouseEnter={() => setActiveCallout('parclose')}>
              <rect x="440" y="70" width="45" height="80" fill="#334155" stroke="#94A3B8" strokeWidth="1.5" rx="2" />
              <text x="462" y="115" fill="#CBD5E1" fontSize="8" fontFamily="monospace" textAnchor="middle">
                Parclose
              </text>
            </g>

            {/* 6. DOUBLE GLAZING UNIT (24mm or 28mm) */}
            <g id="glazing-unit-group" onMouseEnter={() => setActiveCallout('glazing')}>
              {/* Outer Pane (4mm) */}
              <rect x="365" y="30" width="12" height="140" fill="#38BDF8" fillOpacity="0.4" stroke="#38BDF8" strokeWidth="1.2" />
              {/* Gas Spacer Cavity (16mm Argon) */}
              <rect x="377" y="30" width="28" height="140" fill="#0284C7" fillOpacity="0.1" />
              {/* Aluminum/Warm-edge spacer frame */}
              <rect x="377" y="145" width="28" height="20" fill="#64748B" stroke="#94A3B8" strokeWidth="1" />
              {/* Desiccant beads inside spacer */}
              <circle cx="385" cy="155" r="2" fill="#E2E8F0" />
              <circle cx="391" cy="155" r="2" fill="#E2E8F0" />
              <circle cx="397" cy="155" r="2" fill="#E2E8F0" />
              {/* Inner Pane (4mm) */}
              <rect x="405" y="30" width="12" height="140" fill="#38BDF8" fillOpacity="0.4" stroke="#38BDF8" strokeWidth="1.2" />

              {/* Glass label */}
              <text x="391" y="85" fill="#38BDF8" fontSize="9" fontFamily="monospace" textAnchor="middle" transform="rotate(-90 391 85)">
                Double Vitrage 4/16/4
              </text>
            </g>

            {/* 7. EPDM WEATHERSTRIPPING GASKETS */}
            <g id="gaskets-group" onMouseEnter={() => setActiveCallout('gaskets')}>
              {/* Outer glass gasket */}
              <rect x="357" y="140" width="8" height="25" fill="#09090B" stroke="#71717A" strokeWidth="1" rx="2" />
              {/* Inner glazing bead gasket */}
              <rect x="417" y="140" width="8" height="25" fill="#09090B" stroke="#71717A" strokeWidth="1" rx="2" />
              {/* Central acoustic barrier gasket */}
              <path d="M 330 250 Q 338 260 330 270 Z" fill="#09090B" stroke="#D4AF37" strokeWidth="1.2" />
              {/* Acoustic frame gasket */}
              <rect x="330" y="285" width="10" height="15" fill="#09090B" stroke="#71717A" strokeWidth="1" rx="2" />
            </g>

            {/* 8. DRAINAGE WEEP HOLE */}
            <g id="drainage-group" onMouseEnter={() => setActiveCallout('drainage')}>
              <path d="M 120 350 L 140 350 L 135 365 L 115 365 Z" fill="#D4AF37" fillOpacity="0.8" />
              <text x="127" y="380" fill="#D4AF37" fontSize="8" fontFamily="monospace" textAnchor="middle">
                Drainage
              </text>
            </g>

            {/* 9. DIMENSIONING LINES & CALLOUTS */}
            {showDimensions && (
              <g id="dimension-lines">
                {/* Horizontal Depth Dimension */}
                <line x1="70" y1="390" x2="320" y2="390" stroke="#38BDF8" strokeWidth="1" markerEnd="url(#arrow)" />
                <line x1="70" y1="382" x2="70" y2="398" stroke="#38BDF8" strokeWidth="1" />
                <line x1="320" y1="382" x2="320" y2="398" stroke="#38BDF8" strokeWidth="1" />
                <text x="195" y="405" fill="#38BDF8" fontSize="10" fontFamily="monospace" textAnchor="middle" fontWeight="bold">
                  Profondeur dormant: {spec.depthMm} mm
                </text>

                {/* Glazing thickness dimension */}
                <line x1="365" y1="20" x2="417" y2="20" stroke="#38BDF8" strokeWidth="1" />
                <text x="391" y="14" fill="#38BDF8" fontSize="9" fontFamily="monospace" textAnchor="middle">
                  24 mm
                </text>

                {/* Prise de feuillure dimension */}
                <line x1="510" y1="145" x2="510" y2="165" stroke="#D4AF37" strokeWidth="1" />
                <line x1="504" y1="145" x2="516" y2="145" stroke="#D4AF37" strokeWidth="1" />
                <line x1="504" y1="165" x2="516" y2="165" stroke="#D4AF37" strokeWidth="1" />
                <text x="525" y="158" fill="#D4AF37" fontSize="9" fontFamily="monospace">
                  Feuillure: 18 mm
                </text>
              </g>
            )}
          </svg>
        </div>

        {/* TECHNICAL SPECIFICATIONS & CALLOUTS PANEL (1 COLUMN) */}
        <div className="space-y-4">
          <div
            className={`p-5 rounded-2xl border ${
              isLight ? 'bg-slate-50 border-slate-200' : 'bg-white/5 border-white/10'
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <h4 className="text-sm font-bold font-mono">Performances Thermiques & Matière</h4>
            </div>

            <div className="space-y-2.5 text-xs font-mono">
              <div className="flex justify-between border-b border-white/5 pb-1">
                <span className={isLight ? 'text-slate-500' : 'text-zinc-400'}>Coefficient Uf (Profilé) :</span>
                <span className="font-bold text-[#D4AF37]">{spec.uFactorUf} W/m²K</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-1">
                <span className={isLight ? 'text-slate-500' : 'text-zinc-400'}>Profondeur bâti :</span>
                <span className="font-bold">{spec.depthMm} mm</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-1">
                <span className={isLight ? 'text-slate-500' : 'text-zinc-400'}>Barrette RPT :</span>
                <span className="font-bold text-sky-400">
                  {spec.thermalBreakMm > 0 ? `${spec.thermalBreakMm} mm (PA66 GF25)` : 'Multi-chambres PVC'}
                </span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-1">
                <span className={isLight ? 'text-slate-500' : 'text-zinc-400'}>Prise de feuillure :</span>
                <span className="font-bold">18 mm (Norme CNERIB)</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-1">
                <span className={isLight ? 'text-slate-500' : 'text-zinc-400'}>Étanchéité à l'air :</span>
                <span className="font-bold text-emerald-400">Classe A*4 (Triple joint EPDM)</span>
              </div>
            </div>

            <p className={`text-[11px] mt-3 leading-relaxed ${isLight ? 'text-slate-600' : 'text-zinc-400'}`}>
              {spec.description}
            </p>
          </div>

          {/* DYNAMIC CALLOUT DESCRIPTION */}
          <div
            className={`p-4 rounded-2xl border ${
              isLight ? 'bg-white border-slate-200' : 'bg-[#0B0F19] border-white/10'
            }`}
          >
            <div className="flex items-center gap-2 mb-1.5">
              <Info className="w-4 h-4 text-[#D4AF37]" />
              <span className="text-xs font-mono font-bold uppercase tracking-wider">
                {activeCallout ? `Composant : ${activeCallout.toUpperCase()}` : 'Inspection Interactive'}
              </span>
            </div>
            <p className={`text-xs ${isLight ? 'text-slate-600' : 'text-zinc-400'}`}>
              {activeCallout === 'thermal_break'
                ? 'Barrette polyamide sertie en usine rompant la conduction thermique entre les profilés intérieur et extérieur.'
                : activeCallout === 'glazing'
                ? 'Double vitrage isolant scellé avec espaceur aluminium warm-edge et tamis moléculaire déshydratant.'
                : activeCallout === 'gaskets'
                ? 'Joints en élastomère EPDM co-extrudés assurant l\'étanchéité à l\'air A4 et à l\'eau E9A selon DTR C3-2.'
                : activeCallout === 'drainage'
                ? 'Lumières de drainage usinées pour évacuer les condensats et eaux de ruissellement vers l\'extérieur.'
                : 'Survolez les parties de la coupe pour afficher les fonctions mécaniques et thermiques détaillées.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
export default ProfileCrossSectionViewer;
