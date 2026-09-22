import React, { useState } from 'react';
import { useConfigStore } from '../../store/configStore';
import type { TradeCategory, WoodConfig, MetalConfig, TapestryConfig } from '../../types/trades';
import type { FinishColor } from '../../types/window';
import {
  calculateWoodCost,
  calculateMetalCost,
  calculateTapestryCost,
} from '../../utils/tradesPricingEngine';
import {
  Scissors,
  Sparkles,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';
import { playTactileClick, playSwitchSound, playSlideTick } from '../../utils/audioFeedback';

interface HeroStudioSectionProps {
  onSelectTrade?: (trade: TradeCategory) => void;
  activeTrade?: TradeCategory;
}

const finishColorMap: Record<FinishColor, string> = {
  ral_9016: '#F8FAFC',
  ral_7016: '#475569',
  ral_9005: '#0F172A',
  faux_bois: '#C59B27',
  bronze_ano: '#78350F',
};

const colorOptions: { id: FinishColor; label: string; bgHex: string }[] = [
  { id: 'ral_9016', label: 'Blanc 9016', bgHex: '#F8FAFC' },
  { id: 'ral_7016', label: 'Gris 7016', bgHex: '#475569' },
  { id: 'faux_bois', label: 'Chêne Doré', bgHex: '#C59B27' },
  { id: 'ral_9005', label: 'Noir Sablé', bgHex: '#0F172A' },
];

const tradePresets: Record<TradeCategory, { label: string; w: number; h: number }[]> = {
  aluminum: [
    { label: 'Chambre 1200×1400', w: 1200, h: 1400 },
    { label: 'Salon 1800×1400', w: 1800, h: 1400 },
    { label: 'Baie Vitrée 2400×2150', w: 2400, h: 2150 },
    { label: 'Cuisine 900×1100', w: 900, h: 1100 },
  ],
  woodworking: [
    { label: 'Caisson Bas 800×850', w: 800, h: 850 },
    { label: 'Meuble Haut 800×720', w: 800, h: 720 },
    { label: 'Dressing 3P 1800×2200', w: 1800, h: 2200 },
    { label: 'Porte Isoplane 900×2150', w: 900, h: 2150 },
  ],
  metalwork: [
    { label: 'Grille Fenêtre 1200×1400', w: 1200, h: 1400 },
    { label: 'Portail Coulissant 3200×1900', w: 3200, h: 1900 },
    { label: 'Garde-Corps Balcon 2400×1000', w: 2400, h: 1000 },
    { label: 'Porte Blindée 1000×2150', w: 1000, h: 2150 },
  ],
  tapestry: [
    { label: 'Voilage Salon 250×260', w: 2500, h: 2600 },
    { label: 'Grand Rideau 300×280', w: 3000, h: 2800 },
    { label: 'Chambre Occultant 200×270', w: 2000, h: 2700 },
    { label: 'Seddari Marocain 400×80', w: 4000, h: 800 },
  ],
};

export const HeroStudioSection: React.FC<HeroStudioSectionProps> = ({
  onSelectTrade,
  activeTrade = 'aluminum',
}) => {
  const {
    language,
    theme,
    config,
    cost,
    calibration,
    setWidth,
    setHeight,
    setFinishColor,
    setShutterType,
  } = useConfigStore();
  const isLight = theme === 'light';
  const isRtl = language === 'ar';

  const [selectedTrade, setSelectedTrade] = useState<TradeCategory>(activeTrade);

  const handleTradeChange = (trade: TradeCategory) => {
    playSwitchSound();
    setSelectedTrade(trade);
    if (onSelectTrade) {
      onSelectTrade(trade);
    }
  };

  // Real-time calculations across the 4 trades
  const aluBarsCount = Math.max(2, Math.ceil((2 * (config.width + config.height) * 1.08) / 6000));
  const aluGlassArea = (((config.width - 120) * (config.height - 120)) / 1000000).toFixed(2);
  const aluCostDzd = Math.round(cost.totalEstimatedDzd ?? 74800).toLocaleString();

  const woodConfig: WoodConfig = {
    productType: config.height > 1600 ? 'wardrobe_dressing' : 'kitchen_base',
    width: config.width,
    height: config.height,
    depth: 600,
    shelvesCount: config.height > 1400 ? 3 : 1,
    drawersCount: config.height > 1000 && config.width < 1200 ? 1 : 0,
    doorsCount: config.width > 1600 ? 4 : config.width > 1100 ? 3 : config.width > 650 ? 2 : 1,
    material: 'mdf_hydrofuge',
    finishEdge: 'pvc_2mm_choc',
    hardwareTier: 'soft_close_premium',
  };
  const woodCost = calculateWoodCost(woodConfig, calibration);
  const woodCostDzd = woodCost.totalEstimatedDzd.toLocaleString();

  const metalConfig: MetalConfig = {
    productType: config.width > 2400 ? 'sliding_gate' : 'window_grille',
    width: config.width,
    height: config.height,
    barType: 'square_14',
    barSpacingMm: 110,
    hasForgedScrolls: true,
    hasSpearHeads: true,
    finishTreatment: 'epoxy_powder_coat',
  };
  const metalCost = calculateMetalCost(metalConfig, calibration);
  const metalCostDzd = metalCost.totalEstimatedDzd.toLocaleString();
  const metalBars = Math.max(3, Math.floor(config.width / 110));

  const tapestryConfig: TapestryConfig = {
    productType: 'curtain_salon',
    railWidthCm: Math.round(config.width / 10),
    heightCm: Math.round(config.height / 10),
    pleatRatio: 2.0,
    fabricType: 'velours_antitache',
    headerType: 'wave_ruflette',
    hasThermalLining: false,
  };
  const tapestryCost = calculateTapestryCost(tapestryConfig, calibration);
  const tapestryCostDzd = tapestryCost.totalEstimatedDzd.toLocaleString();

  // Dynamic aspect-ratio bounding box for the CAD preview canvas (320x220 viewBox)
  const maxW = 230;
  const maxH = 135;
  const aspect = config.width / Math.max(1, config.height);
  let drawW = maxW;
  let drawH = maxH;
  if (aspect >= 1) {
    drawW = maxW;
    drawH = Math.max(65, Math.min(maxH, maxW / aspect));
  } else {
    drawH = maxH;
    drawW = Math.max(65, Math.min(maxW, maxH * aspect));
  }
  const startX = 42 + (maxW - drawW) / 2;
  const startY = 40 + (maxH - drawH) / 2;

  const activeColorHex = finishColorMap[config.finishColor] || '#38BDF8';

  const tradeData = {
    aluminum: {
      label: 'Alu & PVC',
      arabicLabel: 'ألمنيوم و PVC',
      title: 'Menuiserie Aluminium & Façades RPT',
      subtitle:
        'Châssis coulissants, frappes à rupture de pont thermique et volets monoblocs. Calcul millimétrique des coupes d’onglets à 45° et débits de vitrage selon les normes DTR.',
      badge: 'Gamme 40 / 45 RPT • Coulissant 67',
      primaryKpi: 'Barres 6.00m',
      kpiValue: `${aluBarsCount} barres`,
      secondaryKpi: 'Surface Vitrage',
      secondaryVal: `${aluGlassArea} m²`,
      tertiaryKpi: 'Isolation Uw',
      tertiaryVal: '1.4 W/m²K',
      costEstimate: `${aluCostDzd} DZD`,
      targetAnchor: '#cad-studio',
      ctaText: 'Ouvrir l’Atelier CAD 2D',
    },
    woodworking: {
      label: 'Bois & Ébénisterie',
      arabicLabel: 'نجارة الخشب والمطابخ',
      title: 'Agencement & Cuisines Sur Mesure',
      subtitle:
        'Caissons hauts et bas, façades laquées, dressings coulissants et portes massives. Débitage optimisé de panneaux mélaminé et MDF 18mm avec placage de chants ABS 2mm.',
      badge: 'Mélaminé 18mm • MDF Hydro • Chêne Massif',
      primaryKpi: 'Feuilles 2800×2070',
      kpiValue: `${woodCost.boardSheetsRequired} panneaux`,
      secondaryKpi: 'Chants ABS',
      secondaryVal: `${woodCost.edgeBandMeters.toFixed(1)} m`,
      tertiaryKpi: 'Quincaillerie',
      tertiaryVal: 'Charnières 110°',
      costEstimate: `${woodCostDzd} DZD`,
      targetAnchor: '#wood-studio',
      ctaText: 'Calculer le Débit Bois',
    },
    metalwork: {
      label: 'Ferronnerie & Métal',
      arabicLabel: 'الحدادة الفنية والحماية',
      title: 'Ferronnerie d’Art & Portails de Sécurité',
      subtitle:
        'Grilles de défense ouvrantes, portails coulissants tôlés et garde-corps contemporains. Calcul automatique de l’entraxe des barreaux carrés 14mm et masse totale d’acier.',
      badge: 'Tube Carré 40×40 • Barreaudage 14mm',
      primaryKpi: 'Poids Total Acier',
      kpiValue: `${metalCost.steelWeightKg.toFixed(1)} kg`,
      secondaryKpi: 'Barreaux 14mm',
      secondaryVal: `${metalBars} pièces`,
      tertiaryKpi: 'Entraxe Sécurité',
      tertiaryVal: '110 mm',
      costEstimate: `${metalCostDzd} DZD`,
      targetAnchor: '#metal-studio',
      ctaText: 'Configurer la Ferronnerie',
    },
    tapestry: {
      label: 'Tapisserie & Tissu',
      arabicLabel: 'الستائر والأثاث العصري',
      title: 'Draperie Architectural & Salons Seddari',
      subtitle:
        'Rideaux wave-fold grande hauteur, voilages sur mesure et banquettes traditionnelles. Calcul précis du métrage développé selon le coefficient de fronce (2.0x à 2.4x).',
      badge: 'Tringle Alu Renforcée • Fronce 2.2x',
      primaryKpi: 'Tissu Développé',
      kpiValue: `${tapestryCost.fabricLinearMeters.toFixed(2)} m`,
      secondaryKpi: 'Tringle Rail',
      secondaryVal: `${(config.width / 1000).toFixed(2)} m`,
      tertiaryKpi: 'Lestage Bas',
      tertiaryVal: 'Plomb continu',
      costEstimate: `${tapestryCostDzd} DZD`,
      targetAnchor: '#tapestry-studio',
      ctaText: 'Calculer le Métrage Tissu',
    },
  };

  const currentTrade = tradeData[selectedTrade];

  return (
    <section
      className={`relative pt-8 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto overflow-hidden transition-colors duration-300 ${
        isLight ? 'text-slate-900' : 'text-white'
      }`}
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      {/* Subtle Architectural Ambient Glows */}
      <div className="absolute top-0 left-1/3 w-[500px] h-[500px] bg-[#D4AF37]/8 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-[#38BDF8]/6 rounded-full blur-[100px] pointer-events-none" />

      {/* TOP: TRADE SWITCHER CHIPS */}
      <div className="flex justify-center mb-8">
        <div
          className={`inline-flex flex-wrap p-1.5 rounded-2xl border backdrop-blur-xl shadow-lg ${
            isLight
              ? 'bg-white/90 border-slate-200/90 shadow-slate-200/50'
              : 'bg-[#0E121C]/80 border-white/10 shadow-black/60'
          }`}
        >
          {(Object.keys(tradeData) as TradeCategory[]).map((trKey) => {
            const tr = tradeData[trKey];
            const isSelected = selectedTrade === trKey;
            return (
              <button
                key={trKey}
                onClick={() => handleTradeChange(trKey)}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all duration-200 flex items-center gap-2 cursor-pointer btn-press ${
                  isSelected
                    ? 'bg-[#D4AF37] text-slate-950 font-bold shadow-md shadow-[#D4AF37]/30 scale-[1.02]'
                    : isLight
                    ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    : 'text-zinc-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <span>{language === 'ar' ? tr.arabicLabel : tr.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* MAIN SPLIT GRID: LEFT VALUE PROPOSITION / RIGHT INTERACTIVE WORKPIECE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        {/* LEFT COLUMN: HERO HEADLINE & DIRECT ACTIONS (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-5">
          {/* Eyebrow badge */}
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/30 text-xs font-mono text-[#D4AF37] font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{currentTrade.badge}</span>
            </span>
            <span className={`text-[11px] font-mono hidden sm:inline ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
              58 Wilayas • Tolérance 0.1 mm
            </span>
          </div>

          {/* Main Title */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.15]">
            <span>{currentTrade.title.split('&')[0]}</span>
            {currentTrade.title.includes('&') && (
              <span className="block mt-1 bg-gradient-to-r from-[#C5A880] via-[#D4AF37] to-[#E2C799] bg-clip-text text-transparent">
                & {currentTrade.title.split('&')[1]}
              </span>
            )}
          </h1>

          {/* Subtitle */}
          <p className={`text-sm sm:text-base leading-relaxed max-w-2xl ${isLight ? 'text-slate-600' : 'text-zinc-300'}`}>
            {currentTrade.subtitle}
          </p>

          {/* Live Metric Readout Cards (Fully Dynamic) */}
          <div className="grid grid-cols-3 gap-3 pt-2">
            <div
              className={`p-3 rounded-2xl border transition-all ${
                isLight ? 'bg-white border-slate-200 shadow-xs' : 'bg-white/[0.04] border-white/10'
              }`}
            >
              <span className={`block text-[10px] font-mono uppercase ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
                {currentTrade.primaryKpi}
              </span>
              <span className="text-sm sm:text-base font-mono font-bold text-[#D4AF37] mt-0.5 block">
                {currentTrade.kpiValue}
              </span>
            </div>

            <div
              className={`p-3 rounded-2xl border transition-all ${
                isLight ? 'bg-white border-slate-200 shadow-xs' : 'bg-white/[0.04] border-white/10'
              }`}
            >
              <span className={`block text-[10px] font-mono uppercase ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
                {currentTrade.secondaryKpi}
              </span>
              <span className="text-sm sm:text-base font-mono font-bold text-emerald-400 mt-0.5 block">
                {currentTrade.secondaryVal}
              </span>
            </div>

            <div
              className={`p-3 rounded-2xl border transition-all ${
                isLight ? 'bg-white border-slate-200 shadow-xs' : 'bg-white/[0.04] border-white/10'
              }`}
            >
              <span className={`block text-[10px] font-mono uppercase ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
                Estimation DZD
              </span>
              <span className="text-sm sm:text-base font-mono font-bold mt-0.5 block">
                {currentTrade.costEstimate}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <a
              href={currentTrade.targetAnchor}
              onClick={(e) => {
                playTactileClick();
                if (onSelectTrade) {
                  onSelectTrade(selectedTrade);
                }
                const target = document.querySelector(currentTrade.targetAnchor);
                if (target) {
                  e.preventDefault();
                  target.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              className="px-5 py-3 rounded-xl bg-gradient-to-r from-[#C5A880] to-[#D4AF37] hover:brightness-110 text-slate-950 font-bold text-sm flex items-center gap-2 transition-all shadow-lg shadow-[#D4AF37]/20 cursor-pointer hover-lift btn-press"
            >
              <span>{currentTrade.ctaText}</span>
              <ArrowRight className="w-4 h-4" />
            </a>

            <a
              href="#debitage-optimizer"
              onClick={() => playTactileClick()}
              className={`px-4 py-3 rounded-xl border font-mono text-xs flex items-center gap-2 transition-all cursor-pointer hover-lift btn-press ${
                isLight
                  ? 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-800'
                  : 'bg-white/10 hover:bg-white/15 border-white/15 text-white'
              }`}
            >
              <Scissors className="w-4 h-4 text-[#D4AF37]" />
              <span>Optimiser le Débit Scie</span>
            </a>
          </div>

          {/* Trust points */}
          <div className={`flex flex-wrap items-center gap-4 text-xs font-mono pt-1 ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Calcul Déboursé Sec</span>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>G-code & Étiquettes Scie</span>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>100% Fonctionnel Hors-Ligne</span>
            </span>
          </div>
        </div>

        {/* RIGHT COLUMN: PARAMETRIC ARCHITECTURAL WORKPIECE PREVIEW (5 cols) */}
        <div className="lg:col-span-5">
          <div
            className={`p-5 rounded-3xl border relative transition-all duration-300 shadow-2xl ${
              isLight
                ? 'bg-white border-slate-200/90 shadow-slate-200/60'
                : 'bg-[#090C12] border-white/10 shadow-black/80'
            }`}
          >
            {/* Top Card Bar: Dimension Steppers & Trade Code */}
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-black/5 dark:border-white/10">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#D4AF37]" />
                <span className="text-xs font-mono font-bold tracking-wider uppercase text-[#D4AF37]">
                  Schéma Paramétrique CAD
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${isLight ? 'bg-slate-100 text-slate-800' : 'bg-white/10 text-[#D4AF37]'}`}>
                  {config.width} × {config.height} mm
                </span>
              </div>
            </div>

            {/* INTERACTIVE VECTOR WORKPIECE SVG CANVAS (Real Aspect Ratio) */}
            <div
              className={`rounded-2xl border p-3 flex items-center justify-center relative min-h-[290px] overflow-hidden ${
                isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#05070B] border-white/5'
              }`}
            >
              {/* Technical CAD Blueprint Grid Background */}
              <svg width="100%" height="100%" className="absolute inset-0 opacity-15 pointer-events-none">
                <defs>
                  <pattern id="heroGrid" width="20" height="20" patternUnits="userSpaceOnUse">
                    <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#38BDF8" strokeWidth="0.8" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#heroGrid)" />
              </svg>

              {/* TRADE 1: ALUMINUM & PVC 2-VANTAUX WINDOW SCHEMATIC */}
              {selectedTrade === 'aluminum' && (
                <svg width="100%" height="220" viewBox="0 0 320 220" className="select-none relative z-10">
                  {/* Monobloc roller shutter caisson if enabled */}
                  {config.shutterType !== 'none' && (
                    <g>
                      <rect
                        x={startX}
                        y={startY - 22}
                        width={drawW}
                        height="20"
                        fill="#151A24"
                        stroke="#D4AF37"
                        strokeWidth="1.5"
                        rx="2"
                      />
                      <text
                        x={startX + drawW / 2}
                        y={startY - 8}
                        fill="#D4AF37"
                        fontSize="8.5"
                        fontFamily="monospace"
                        textAnchor="middle"
                        fontWeight="bold"
                      >
                        CAISSON MONOBLOC 180mm
                      </text>
                    </g>
                  )}

                  {/* Outer Dormant Frame */}
                  <rect
                    x={startX}
                    y={startY}
                    width={drawW}
                    height={drawH}
                    fill="none"
                    stroke={activeColorHex}
                    strokeWidth="3"
                    rx="2"
                  />

                  {/* 45 degree Miter Ticks */}
                  <line x1={startX} y1={startY} x2={startX + 6} y2={startY + 6} stroke="#D4AF37" strokeWidth="1" />
                  <line x1={startX + drawW} y1={startY} x2={startX + drawW - 6} y2={startY + 6} stroke="#D4AF37" strokeWidth="1" />
                  <line x1={startX} y1={startY + drawH} x2={startX + 6} y2={startY + drawH - 6} stroke="#D4AF37" strokeWidth="1" />
                  <line x1={startX + drawW} y1={startY + drawH} x2={startX + drawW - 6} y2={startY + drawH - 6} stroke="#D4AF37" strokeWidth="1" />

                  {/* Left Sash */}
                  <rect
                    x={startX + 5}
                    y={startY + 5}
                    width={(drawW - 14) / 2}
                    height={drawH - 10}
                    fill="rgba(56, 189, 248, 0.08)"
                    stroke="#38BDF8"
                    strokeWidth="1.8"
                    rx="1"
                  />
                  {/* Right Sash */}
                  <rect
                    x={startX + 5 + (drawW - 14) / 2 + 4}
                    y={startY + 5}
                    width={(drawW - 14) / 2}
                    height={drawH - 10}
                    fill="rgba(56, 189, 248, 0.08)"
                    stroke="#38BDF8"
                    strokeWidth="1.8"
                    rx="1"
                  />

                  {/* Sliding arrows */}
                  <line
                    x1={startX + 15}
                    y1={startY + drawH / 2}
                    x2={startX + (drawW - 14) / 2 - 10}
                    y2={startY + drawH / 2}
                    stroke="#D4AF37"
                    strokeWidth="1.2"
                  />
                  <polyline
                    points={`${startX + (drawW - 14) / 2 - 14},${startY + drawH / 2 - 3} ${startX + (drawW - 14) / 2 - 9},${startY + drawH / 2} ${startX + (drawW - 14) / 2 - 14},${startY + drawH / 2 + 3}`}
                    fill="none"
                    stroke="#D4AF37"
                    strokeWidth="1.2"
                  />

                  {/* Horizontal dimension line */}
                  <line x1={startX} y1={startY + drawH + 12} x2={startX + drawW} y2={startY + drawH + 12} stroke="#38BDF8" strokeWidth="1" />
                  <line x1={startX} y1={startY + drawH + 8} x2={startX} y2={startY + drawH + 16} stroke="#38BDF8" strokeWidth="1" />
                  <line x1={startX + drawW} y1={startY + drawH + 8} x2={startX + drawW} y2={startY + drawH + 16} stroke="#38BDF8" strokeWidth="1" />
                  <text
                    x={startX + drawW / 2}
                    y={startY + drawH + 24}
                    fill="#38BDF8"
                    fontSize="9.5"
                    fontFamily="monospace"
                    textAnchor="middle"
                    fontWeight="bold"
                  >
                    L: {config.width} mm (45°)
                  </text>

                  {/* Vertical dimension line */}
                  <line x1={startX + drawW + 12} y1={startY} x2={startX + drawW + 12} y2={startY + drawH} stroke="#38BDF8" strokeWidth="1" />
                  <line x1={startX + drawW + 8} y1={startY} x2={startX + drawW + 16} y2={startY} stroke="#38BDF8" strokeWidth="1" />
                  <line x1={startX + drawW + 8} y1={startY + drawH} x2={startX + drawW + 16} y2={startY + drawH} stroke="#38BDF8" strokeWidth="1" />
                  <text
                    x={startX + drawW + 24}
                    y={startY + drawH / 2 + 3}
                    fill="#38BDF8"
                    fontSize="9"
                    fontFamily="monospace"
                    textAnchor="start"
                  >
                    {config.height}
                  </text>
                </svg>
              )}

              {/* TRADE 2: WOODWORKING CABINET CAISSON SCHEMATIC */}
              {selectedTrade === 'woodworking' && (
                <svg width="100%" height="220" viewBox="0 0 320 220" className="select-none relative z-10">
                  {/* Outer Carcass Panel MDF 18mm */}
                  <rect
                    x={startX}
                    y={startY}
                    width={drawW}
                    height={drawH}
                    fill="#1C1814"
                    stroke="#F59E0B"
                    strokeWidth="2.5"
                    rx="3"
                  />

                  {/* Top and bottom panel thicknesses */}
                  <rect x={startX} y={startY} width={drawW} height="8" fill="#F59E0B" fillOpacity="0.3" />
                  <rect x={startX} y={startY + drawH - 8} width={drawW} height="8" fill="#F59E0B" fillOpacity="0.3" />

                  {/* Left & Right Uprights */}
                  <rect x={startX} y={startY} width="8" height={drawH} fill="#F59E0B" fillOpacity="0.3" />
                  <rect x={startX + drawW - 8} y={startY} width="8" height={drawH} fill="#F59E0B" fillOpacity="0.3" />

                  {/* Doors depending on woodConfig.doorsCount */}
                  {Array.from({ length: woodConfig.doorsCount }).map((_, idx) => {
                    const doorW = (drawW - 16) / woodConfig.doorsCount;
                    const dx = startX + 8 + idx * doorW;
                    const handleX = idx % 2 === 0 ? dx + doorW - 8 : dx + 8;
                    return (
                      <g key={idx}>
                        <rect
                          x={dx + 1}
                          y={startY + 10}
                          width={doorW - 2}
                          height={drawH - 20}
                          fill="rgba(245, 158, 11, 0.08)"
                          stroke="#F59E0B"
                          strokeWidth="1.2"
                          rx="1"
                        />
                        <circle cx={handleX} cy={startY + drawH / 2} r="2.5" fill="#D4AF37" />
                        <text
                          x={dx + doorW / 2}
                          y={startY + drawH - 14}
                          fill="#F59E0B"
                          fontSize="7.5"
                          fontFamily="monospace"
                          textAnchor="middle"
                        >
                          P#{idx + 1}
                        </text>
                      </g>
                    );
                  })}

                  {/* Horizontal dimension line */}
                  <line x1={startX} y1={startY + drawH + 12} x2={startX + drawW} y2={startY + drawH + 12} stroke="#F59E0B" strokeWidth="1" />
                  <text
                    x={startX + drawW / 2}
                    y={startY + drawH + 24}
                    fill="#F59E0B"
                    fontSize="9.5"
                    fontFamily="monospace"
                    textAnchor="middle"
                    fontWeight="bold"
                  >
                    L: {config.width} mm ({woodConfig.doorsCount} Portes Chants ABS)
                  </text>
                </svg>
              )}

              {/* TRADE 3: METALWORK SECURITY GRILLE SCHEMATIC */}
              {selectedTrade === 'metalwork' && (
                <svg width="100%" height="220" viewBox="0 0 320 220" className="select-none relative z-10">
                  {/* Outer Steel Tube 40x40 Frame */}
                  <rect
                    x={startX}
                    y={startY}
                    width={drawW}
                    height={drawH}
                    fill="none"
                    stroke="#EF4444"
                    strokeWidth="3"
                    rx="2"
                  />
                  {/* Mid-rail reinforcement */}
                  <line
                    x1={startX}
                    y1={startY + drawH / 2}
                    x2={startX + drawW}
                    y2={startY + drawH / 2}
                    stroke="#EF4444"
                    strokeWidth="2"
                  />

                  {/* Dynamic Vertical Bars */}
                  {Array.from({ length: Math.min(16, metalBars) }).map((_, idx) => {
                    const barCount = Math.min(16, metalBars);
                    const bx = startX + 12 + ((drawW - 24) / Math.max(1, barCount - 1)) * idx;
                    return (
                      <g key={idx}>
                        <line x1={bx} y1={startY} x2={bx} y2={startY + drawH} stroke="#EF4444" strokeWidth="1.8" />
                        {/* Spearhead ornament on top */}
                        <polygon
                          points={`${bx},${startY - 8} ${bx - 3.5},${startY} ${bx + 3.5},${startY}`}
                          fill="#D4AF37"
                        />
                        {/* Center decorative ring */}
                        <circle cx={bx} cy={startY + drawH / 2} r="3" fill="none" stroke="#D4AF37" strokeWidth="1" />
                      </g>
                    );
                  })}

                  {/* Horizontal dimension line */}
                  <line x1={startX} y1={startY + drawH + 12} x2={startX + drawW} y2={startY + drawH + 12} stroke="#EF4444" strokeWidth="1" />
                  <text
                    x={startX + drawW / 2}
                    y={startY + drawH + 24}
                    fill="#EF4444"
                    fontSize="9.5"
                    fontFamily="monospace"
                    textAnchor="middle"
                    fontWeight="bold"
                  >
                    L: {config.width} mm ({metalBars} Barreaux • Entraxe 110mm)
                  </text>
                </svg>
              )}

              {/* TRADE 4: TAPESTRY WAVE DRAPERY SCHEMATIC */}
              {selectedTrade === 'tapestry' && (
                <svg width="100%" height="220" viewBox="0 0 320 220" className="select-none relative z-10">
                  {/* Top Architectural Ceiling Rail */}
                  <rect
                    x={startX - 8}
                    y={startY}
                    width={drawW + 16}
                    height="8"
                    fill="#A855F7"
                    stroke="#D4AF37"
                    strokeWidth="1"
                    rx="2"
                  />
                  <circle cx={startX} cy={startY + 4} r="2" fill="#FFFFFF" />
                  <circle cx={startX + drawW} cy={startY + 4} r="2" fill="#FFFFFF" />

                  {/* Wave folds of fabric */}
                  {Array.from({ length: Math.max(3, Math.floor(drawW / 28)) }).map((_, idx) => {
                    const waveTotal = Math.max(3, Math.floor(drawW / 28));
                    const segW = drawW / waveTotal;
                    const wx = startX + idx * segW;
                    return (
                      <g key={idx}>
                        <path
                          d={`M ${wx},${startY + 8} Q ${wx + segW / 2},${startY + 24} ${wx + segW},${startY + 8} L ${wx + segW},${startY + drawH} Q ${wx + segW / 2},${startY + drawH - 16} ${wx},${startY + drawH} Z`}
                          fill={idx % 2 === 0 ? 'rgba(168, 85, 247, 0.22)' : 'rgba(168, 85, 247, 0.12)'}
                          stroke="#A855F7"
                          strokeWidth="1.5"
                        />
                      </g>
                    );
                  })}

                  {/* Bottom lead weight tape */}
                  <line
                    x1={startX}
                    y1={startY + drawH}
                    x2={startX + drawW}
                    y2={startY + drawH}
                    stroke="#D4AF37"
                    strokeWidth="2.5"
                    strokeDasharray="4 2"
                  />

                  {/* Horizontal dimension line */}
                  <line x1={startX} y1={startY + drawH + 12} x2={startX + drawW} y2={startY + drawH + 12} stroke="#A855F7" strokeWidth="1" />
                  <text
                    x={startX + drawW / 2}
                    y={startY + drawH + 24}
                    fill="#A855F7"
                    fontSize="9.5"
                    fontFamily="monospace"
                    textAnchor="middle"
                    fontWeight="bold"
                  >
                    L: {config.width} mm (Fronce 2.0x • Tissu {tapestryCost.fabricLinearMeters.toFixed(1)}m)
                  </text>
                </svg>
              )}
            </div>

            {/* QUICK PRESETS STRIP (Tailored per Trade) */}
            <div className="mt-3 pt-3 border-t border-black/5 dark:border-white/10">
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 scrollbar-none">
                <span className={`text-[10px] font-mono shrink-0 ${isLight ? 'text-slate-500' : 'text-zinc-500'}`}>
                  Modèles :
                </span>
                {tradePresets[selectedTrade].map((p, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      playTactileClick();
                      setWidth(p.w);
                      setHeight(p.h);
                    }}
                    className={`px-2.5 py-1 rounded-lg border text-[10px] font-mono transition-all shrink-0 cursor-pointer btn-press hover-lift ${
                      config.width === p.w && config.height === p.h
                        ? 'bg-[#D4AF37] text-slate-950 font-bold border-[#D4AF37]'
                        : isLight
                        ? 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700'
                        : 'bg-white/5 hover:bg-white/10 border-white/10 text-zinc-300'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* COLOR & SHUTTER OPTIONS (Live in the Hero) */}
            <div className="flex flex-wrap items-center justify-between gap-2 mt-2 pt-2 border-t border-black/5 dark:border-white/10 text-xs font-mono">
              {/* Finish Colors */}
              <div className="flex items-center gap-1.5">
                <span className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-zinc-500'}`}>Teinte :</span>
                {colorOptions.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => {
                      playSlideTick();
                      setFinishColor(c.id);
                    }}
                    title={c.label}
                    className={`w-4.5 h-4.5 rounded-full border cursor-pointer transition-transform hover:scale-110 ${
                      config.finishColor === c.id ? 'ring-2 ring-[#D4AF37] scale-110' : 'opacity-80'
                    }`}
                    style={{ backgroundColor: c.bgHex }}
                  />
                ))}
              </div>

              {/* Shutter Toggle for Aluminum */}
              {selectedTrade === 'aluminum' && (
                <button
                  onClick={() => {
                    playTactileClick();
                    setShutterType(config.shutterType === 'none' ? 'motorized' : 'none');
                  }}
                  className={`px-2 py-0.5 rounded border text-[10px] font-mono transition-colors cursor-pointer ${
                    config.shutterType !== 'none'
                      ? 'bg-[#D4AF37]/20 border-[#D4AF37] text-[#D4AF37] font-bold'
                      : isLight
                      ? 'bg-slate-100 border-slate-200 text-slate-600'
                      : 'bg-white/5 border-white/10 text-zinc-400'
                  }`}
                >
                  {config.shutterType !== 'none' ? 'Volet Actif' : '+ Volet Roulant'}
                </button>
              )}

              {/* Millimeter Adjusters */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => {
                    playTactileClick();
                    setWidth(Math.max(600, config.width - 50));
                  }}
                  className={`px-1.5 py-0.5 rounded text-[10px] border hover:scale-105 transition-all cursor-pointer ${
                    isLight ? 'bg-slate-100 border-slate-200 text-slate-700' : 'bg-white/5 border-white/10 text-white'
                  }`}
                >
                  -50L
                </button>
                <button
                  onClick={() => {
                    playTactileClick();
                    setWidth(Math.min(3600, config.width + 50));
                  }}
                  className={`px-1.5 py-0.5 rounded text-[10px] border hover:scale-105 transition-all cursor-pointer ${
                    isLight ? 'bg-slate-100 border-slate-200 text-slate-700' : 'bg-white/5 border-white/10 text-white'
                  }`}
                >
                  +50L
                </button>
                <button
                  onClick={() => {
                    playTactileClick();
                    setHeight(Math.max(600, config.height - 50));
                  }}
                  className={`px-1.5 py-0.5 rounded text-[10px] border hover:scale-105 transition-all cursor-pointer ${
                    isLight ? 'bg-slate-100 border-slate-200 text-slate-700' : 'bg-white/5 border-white/10 text-white'
                  }`}
                >
                  -50H
                </button>
                <button
                  onClick={() => {
                    playTactileClick();
                    setHeight(Math.min(3200, config.height + 50));
                  }}
                  className={`px-1.5 py-0.5 rounded text-[10px] border hover:scale-105 transition-all cursor-pointer ${
                    isLight ? 'bg-slate-100 border-slate-200 text-slate-700' : 'bg-white/5 border-white/10 text-white'
                  }`}
                >
                  +50H
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
