import React, { useState, useMemo } from 'react';
import { useConfigStore } from '../../store/configStore';
import { WindowCanvas } from '../3d/WindowCanvas';
import type { OpeningType, ProfileSystem, FinishColor, GlassType, ShutterType } from '../../types/window';
import {
  MessageCircle,
  FileDown,
  ChevronDown,
  ChevronUp,
  Check,
  MapPin,
  Thermometer,
  Layers,
} from 'lucide-react';
import {
  playTactileClick,
  playSwitchSound,
  playClampSound,
} from '../../utils/audioFeedback';
import { generateClientDevisPdf } from '../../utils/pdfGenerator';
import { ALGERIAN_WILAYAS_58 } from '../../utils/algerianWilayas';
import { DTR_ZONE_THRESHOLDS, getDtrZoneForWilaya } from '../../utils/dtrThermal';
import { ProfileCrossSectionViewer } from '../cad/ProfileCrossSectionViewer';

interface PresetItem {
  id: string;
  name: string;
  w: number;
  h: number;
  opening: OpeningType;
}

interface AccessoryItem {
  id: string;
  name: string;
  desc: string;
  priceDzd: number;
}

const ACCESSORIES_LIST: AccessoryItem[] = [
  {
    id: 'multipoint_lock',
    name: 'Serrure 3 Points Sécurité',
    desc: 'Crémone européenne et pênes basculants',
    priceDzd: 6500,
  },
  {
    id: 'heavy_rollers',
    name: 'Galets Roulements Inox',
    desc: 'Haute charge pour glisse silencieuse',
    priceDzd: 4200,
  },
  {
    id: 'mosquito_screen',
    name: 'Moustiquaire Intégrée',
    desc: 'Toile fibre de verre enroulable',
    priceDzd: 8500,
  },
  {
    id: 'silicone_seal_pack',
    name: 'Pack Calfeutrement & Cales',
    desc: 'Silicone neutre bâtiment et calage pro',
    priceDzd: 2500,
  },
];

const ALGERIAN_PRESETS: PresetItem[] = [
  { id: 'p1', name: 'Fenêtre 120×120 Coulissante', w: 1200, h: 1200, opening: 'sliding_2' },
  { id: 'p2', name: 'Baie Vitrée 215×180 (2V)', w: 1800, h: 2150, opening: 'sliding_2' },
  { id: 'p3', name: 'Grande Baie 215×240 (3 Rails)', w: 2400, h: 2150, opening: 'sliding_3' },
  { id: 'p4', name: 'Fenêtre Chambre 100×120 OB', w: 1000, h: 1200, opening: 'tilt_turn' },
  { id: 'p5', name: 'Porte-Fenêtre 215×140 Battante', w: 1400, h: 2150, opening: 'casement_2' },
  { id: 'p6', name: 'Châssis Fixe Couloir 60×120', w: 600, h: 1200, opening: 'fixed' },
];

export const MobileConfiguratorScreen: React.FC = () => {
  const {
    config,
    cost,
    language,
    theme,
    selectedWilaya,
    setSelectedWilaya,
    setWidth,
    setHeight,
    setOpeningType,
    setProfileSystem,
    setFinishColor,
    setGlassType,
    setShutterType,
  } = useConfigStore();

  const isLight = theme === 'light';
  const isRtl = language === 'ar';
  const [isBreakdownOpen, setIsBreakdownOpen] = useState(false);
  const [isPdfGenerating, setIsPdfGenerating] = useState(false);
  const [selectedAccessories, setSelectedAccessories] = useState<string[]>([]);
  const [showCrossSectionModal, setShowCrossSectionModal] = useState(false);

  const currentWilaya = useMemo(() => {
    return (
      ALGERIAN_WILAYAS_58.find(
        (w) =>
          selectedWilaya.toLowerCase().includes(w.nameFr.toLowerCase()) ||
          selectedWilaya.startsWith(w.code)
      ) || ALGERIAN_WILAYAS_58[15]
    );
  }, [selectedWilaya]);

  const zoneKey = useMemo(() => getDtrZoneForWilaya(currentWilaya), [currentWilaya]);
  const zoneThreshold = DTR_ZONE_THRESHOLDS[zoneKey];

  const thermalQuick = useMemo(() => {
    let ug = 2.7;
    if (config.glassType === 'double_clear') ug = 2.7;
    else if (config.glassType === 'simple_clear') ug = 5.7;
    else if (config.glassType === 'stop_sol') ug = 2.4;
    else if (config.glassType === 'sable') ug = 3.0;

    let uf = 2.4;
    if (config.profileSystem === 'pvc_70_chamber') uf = 1.4;
    else if (config.profileSystem === 'gamme_40') uf = 5.8;
    else if (config.profileSystem === 'gamme_67_slide') uf = 3.2;

    const totalAreaM2 = Math.max(0.2, (config.width * config.height) / 1000000);
    const calculatedGlassAreaM2 = totalAreaM2 * 0.72;
    const frameAreaM2 = Math.max(0.04, totalAreaM2 - calculatedGlassAreaM2);
    const glassPerimeterM = Math.max(0.8, (2 * (config.width + config.height) * 0.85) / 1000);
    const psiG = 0.08;

    const uw = Number(
      ((calculatedGlassAreaM2 * ug + frameAreaM2 * uf + glassPerimeterM * psiG) / totalAreaM2).toFixed(2)
    );

    const isCompliant = uw <= zoneThreshold.maxUw;
    return { uw, isCompliant, maxUw: zoneThreshold.maxUw };
  }, [config.width, config.height, config.glassType, config.profileSystem, zoneThreshold]);

  const toggleAccessory = (id: string) => {
    playTactileClick();
    setSelectedAccessories((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const accessoriesTotal = selectedAccessories.reduce((sum, id) => {
    const item = ACCESSORIES_LIST.find((a) => a.id === id);
    return sum + (item ? item.priceDzd : 0);
  }, 0);

  const grandTotal = cost.totalEstimatedDzd + accessoriesTotal;

  const handleAdjustWidth = (delta: number) => {
    playTactileClick();
    const next = Math.max(500, Math.min(3200, config.width + delta));
    setWidth(next);
  };

  const handleAdjustHeight = (delta: number) => {
    playTactileClick();
    const next = Math.max(500, Math.min(2800, config.height + delta));
    setHeight(next);
  };

  const handleApplyPreset = (pr: PresetItem) => {
    playClampSound();
    setWidth(pr.w);
    setHeight(pr.h);
    setOpeningType(pr.opening);
  };

  const handleShareWhatsApp = () => {
    playTactileClick();
    const accList = selectedAccessories
      .map((id) => ACCESSORIES_LIST.find((a) => a.id === id)?.name)
      .filter(Boolean)
      .join(', ');
    const msg = `*DEMANDE DE DEVIS BAITI ATELIER*\nChâssis : ${config.width} × ${config.height} mm\nOuverture : ${config.openingType}\nProfilé : ${config.profileSystem}\nFinition : ${config.finishColor}\nVitrage : ${config.glassType}\nWilaya : ${selectedWilaya}${accList ? `\nOptions : ${accList}` : ''}\nMontant Estimé : ${grandTotal.toLocaleString('fr-DZ')} DZD\n\nConçu sur https://web-two-tan-31.vercel.app`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const handleDownloadPdf = async () => {
    playTactileClick();
    setIsPdfGenerating(true);
    try {
      const adjustedCost = {
        ...cost,
        hardwareCostDzd: cost.hardwareCostDzd + accessoriesTotal,
        totalEstimatedDzd: grandTotal,
      };
      await generateClientDevisPdf(
        config,
        adjustedCost,
        'Client Atelier Mobile',
        '05 50 00 00 00',
        selectedWilaya
      );
    } catch {
      // Handled
    } finally {
      setIsPdfGenerating(false);
    }
  };

  const OPENING_OPTIONS: { id: OpeningType; label: string; sub: string }[] = [
    { id: 'sliding_2', label: 'Coulissant 2V', sub: '2 Vantaux' },
    { id: 'sliding_3', label: 'Coulissant 3V', sub: '3 Rails' },
    { id: 'tilt_turn', label: 'Oscillo-Battant', sub: 'Sécurité' },
    { id: 'casement_1', label: 'Battant 1V', sub: '1 Ouvrant' },
    { id: 'casement_2', label: 'Battant 2V', sub: '2 Ouvrants' },
    { id: 'fixed', label: 'Châssis Fixe', sub: 'Vitré' },
  ];

  const PROFILE_OPTIONS: { id: ProfileSystem; name: string; tag: string }[] = [
    { id: 'gamme_40', name: 'Alugraf 40 Standard', tag: 'Éco' },
    { id: 'gamme_45_thermal', name: 'Gamme 45 RPT', tag: 'Thermique' },
    { id: 'gamme_67_slide', name: 'Coulissant 67 Lourd', tag: 'Grandes Baies' },
    { id: 'pvc_70_chamber', name: 'PVC 70 Multi-Chambres', tag: 'Haute Isolation' },
  ];

  const COLOR_OPTIONS: { id: FinishColor; label: string; hex: string }[] = [
    { id: 'ral_9016', label: 'Blanc 9016', hex: '#F8FAFC' },
    { id: 'ral_7016', label: 'Anthracite 7016', hex: '#374151' },
    { id: 'ral_9005', label: 'Noir Sablé 9005', hex: '#111827' },
    { id: 'faux_bois', label: 'Chêne Doré', hex: '#92400E' },
    { id: 'bronze_ano', label: 'Bronze Métal', hex: '#78350F' },
  ];

  const GLASS_OPTIONS: { id: GlassType; label: string; desc: string }[] = [
    { id: 'simple_clear', label: 'Simple 6mm Clair', desc: 'Économique' },
    { id: 'double_clear', label: 'Double 4/16/4', desc: 'Isolation Thermique' },
    { id: 'stop_sol', label: 'Stop-Sol Teinté', desc: 'Protection Solaire' },
    { id: 'sable', label: 'Sablé Dépoli', desc: 'Intimité Salle de Bains' },
  ];

  const SHUTTER_OPTIONS: { id: ShutterType; label: string }[] = [
    { id: 'none', label: 'Sans Volet' },
    { id: 'manual', label: 'Volet Manuel' },
    { id: 'motorized', label: 'Volet Motorisé' },
  ];

  return (
    <div className="pb-36 px-3 sm:px-6 pt-2 max-w-xl md:max-w-2xl mx-auto space-y-4" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* 1. 3D INTERACTIVE CANVAS VIEWPORT */}
      <div
        className={`relative w-full h-[320px] sm:h-[380px] md:h-[420px] rounded-3xl border overflow-hidden shadow-lg transition-all ${
          isLight ? 'bg-slate-100 border-slate-200' : 'bg-[#090D16] border-white/10'
        }`}
      >
        <WindowCanvas />
      </div>

      {/* 2. QUICK ALGERIAN PRESETS CAROUSEL */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
          <span>Gabarits Algérie Fréquents</span>
          <span className="text-[10px] text-[#D4AF37]">1-Tap</span>
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
          {ALGERIAN_PRESETS.map((pr) => {
            const isMatch =
              config.width === pr.w &&
              config.height === pr.h &&
              config.openingType === pr.opening;
            return (
              <button
                key={pr.id}
                onClick={() => handleApplyPreset(pr)}
                className={`px-3 py-2 rounded-2xl border text-xs font-mono whitespace-nowrap transition-all shrink-0 cursor-pointer min-h-[44px] ${
                  isMatch
                    ? 'bg-[#D4AF37] text-slate-950 font-bold border-[#D4AF37] shadow-sm'
                    : isLight
                    ? 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                    : 'bg-white/5 text-zinc-300 border-white/10 hover:border-white/20'
                }`}
              >
                {pr.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. TACTILE DIMENSION ADJUSTERS */}
      <div
        className={`p-4 rounded-3xl border shadow-sm space-y-4 ${
          isLight ? 'bg-white border-slate-200' : 'bg-[#0B0F19] border-white/10'
        }`}
      >
        {/* WIDTH CONTROL */}
        <div className="space-y-2">
          <div className="flex items-center justify-between font-mono text-xs">
            <span className={isLight ? 'text-slate-600' : 'text-zinc-400'}>Largeur (L)</span>
            <span className="text-base font-bold text-[#D4AF37]">{config.width} mm</span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => handleAdjustWidth(-100)}
              className="px-3 py-2 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-xs font-mono font-bold min-h-[44px] flex-1 hover:bg-black/10 dark:hover:bg-white/10 active:scale-95 transition-all"
            >
              -100
            </button>
            <button
              onClick={() => handleAdjustWidth(-50)}
              className="px-3 py-2 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-xs font-mono font-bold min-h-[44px] flex-1 hover:bg-black/10 dark:hover:bg-white/10 active:scale-95 transition-all"
            >
              -50
            </button>
            <button
              onClick={() => handleAdjustWidth(+50)}
              className="px-3 py-2 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-xs font-mono font-bold min-h-[44px] flex-1 hover:bg-black/10 dark:hover:bg-white/10 active:scale-95 transition-all text-[#D4AF37]"
            >
              +50
            </button>
            <button
              onClick={() => handleAdjustWidth(+100)}
              className="px-3 py-2 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-xs font-mono font-bold min-h-[44px] flex-1 hover:bg-black/10 dark:hover:bg-white/10 active:scale-95 transition-all text-[#D4AF37]"
            >
              +100
            </button>
          </div>
        </div>

        {/* HEIGHT CONTROL */}
        <div className="space-y-2 pt-2 border-t border-black/5 dark:border-white/10">
          <div className="flex items-center justify-between font-mono text-xs">
            <span className={isLight ? 'text-slate-600' : 'text-zinc-400'}>Hauteur (H)</span>
            <span className="text-base font-bold text-[#D4AF37]">{config.height} mm</span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => handleAdjustHeight(-100)}
              className="px-3 py-2 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-xs font-mono font-bold min-h-[44px] flex-1 hover:bg-black/10 dark:hover:bg-white/10 active:scale-95 transition-all"
            >
              -100
            </button>
            <button
              onClick={() => handleAdjustHeight(-50)}
              className="px-3 py-2 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-xs font-mono font-bold min-h-[44px] flex-1 hover:bg-black/10 dark:hover:bg-white/10 active:scale-95 transition-all"
            >
              -50
            </button>
            <button
              onClick={() => handleAdjustHeight(+50)}
              className="px-3 py-2 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-xs font-mono font-bold min-h-[44px] flex-1 hover:bg-black/10 dark:hover:bg-white/10 active:scale-95 transition-all text-[#D4AF37]"
            >
              +50
            </button>
            <button
              onClick={() => handleAdjustHeight(+100)}
              className="px-3 py-2 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-xs font-mono font-bold min-h-[44px] flex-1 hover:bg-black/10 dark:hover:bg-white/10 active:scale-95 transition-all text-[#D4AF37]"
            >
              +100
            </button>
          </div>
        </div>
      </div>

      {/* 4. OPENING TYPE PICKER */}
      <div className="space-y-2">
        <label className="text-xs font-mono font-bold text-zinc-400 block">
          Système d'Ouverture
        </label>
        <div className="grid grid-cols-3 gap-2">
          {OPENING_OPTIONS.map((op) => {
            const isSelected = config.openingType === op.id;
            return (
              <button
                key={op.id}
                onClick={() => {
                  playSwitchSound();
                  setOpeningType(op.id);
                }}
                className={`p-2.5 rounded-2xl border text-center transition-all cursor-pointer min-h-[50px] flex flex-col items-center justify-center ${
                  isSelected
                    ? 'bg-[#D4AF37] text-slate-950 font-bold border-[#D4AF37] shadow-sm'
                    : isLight
                    ? 'bg-white border-slate-200 text-slate-700'
                    : 'bg-[#0B0F19] border-white/10 text-zinc-300'
                }`}
              >
                <span className="text-xs font-semibold leading-tight">{op.label}</span>
                <span className="text-[10px] opacity-75">{op.sub}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 5. PROFILE SYSTEM CARDS */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-mono font-bold text-zinc-400 block">
            Gamme de Profilé
          </label>
          <button
            type="button"
            onClick={() => {
              playTactileClick();
              setShowCrossSectionModal(true);
            }}
            className="text-[11px] font-mono text-sky-400 hover:text-sky-300 flex items-center gap-1 cursor-pointer transition-colors"
            title="Consulter la coupe technique d'extrusion 2D"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Coupe 2D</span>
          </button>
        </div>
        <div className="space-y-1.5">
          {PROFILE_OPTIONS.map((pf) => {
            const isSelected = config.profileSystem === pf.id;
            return (
              <button
                key={pf.id}
                onClick={() => {
                  playSwitchSound();
                  setProfileSystem(pf.id);
                }}
                className={`w-full p-3 rounded-2xl border flex items-center justify-between text-left transition-all cursor-pointer min-h-[48px] ${
                  isSelected
                    ? 'border-[#D4AF37] bg-[#D4AF37]/10'
                    : isLight
                    ? 'bg-white border-slate-200 text-slate-800'
                    : 'bg-[#0B0F19] border-white/10 text-white'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div
                    className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                      isSelected ? 'border-[#D4AF37] bg-[#D4AF37]' : 'border-zinc-500'
                    }`}
                  >
                    {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-black" />}
                  </div>
                  <span className="text-xs font-bold font-mono">{pf.name}</span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-black/10 dark:bg-white/10 text-zinc-400">
                  {pf.tag}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 6. FINISH COLOR PALETTE */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
          <span>Teinte RAL & Finition</span>
          <span className="text-zinc-500">{config.finishColor}</span>
        </div>
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          {COLOR_OPTIONS.map((col) => {
            const isSelected = config.finishColor === col.id;
            return (
              <button
                key={col.id}
                onClick={() => {
                  playTactileClick();
                  setFinishColor(col.id);
                }}
                className={`p-2 rounded-2xl border flex items-center gap-2 transition-all cursor-pointer shrink-0 min-h-[44px] ${
                  isSelected
                    ? 'border-[#D4AF37] bg-[#D4AF37]/15'
                    : isLight
                    ? 'bg-white border-slate-200 text-slate-700'
                    : 'bg-[#0B0F19] border-white/10 text-zinc-300'
                }`}
              >
                <span
                  className="w-5 h-5 rounded-full border border-black/20 shadow-xs shrink-0"
                  style={{ backgroundColor: col.hex }}
                />
                <span className="text-xs font-mono pr-1">{col.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 7. GLASS & SHUTTER TABS */}
      <div className="grid grid-cols-2 gap-2">
        {/* Glass Select */}
        <div className="space-y-1.5">
          <label className="text-xs font-mono font-bold text-zinc-400 block">Vitrage</label>
          <select
            value={config.glassType}
            onChange={(e) => {
              playSwitchSound();
              setGlassType(e.target.value as GlassType);
            }}
            className={`w-full p-2.5 rounded-2xl border text-xs font-mono min-h-[44px] cursor-pointer ${
              isLight ? 'bg-white border-slate-200 text-slate-800' : 'bg-[#0B0F19] border-white/10 text-white'
            }`}
          >
            {GLASS_OPTIONS.map((g) => (
              <option key={g.id} value={g.id}>
                {g.label}
              </option>
            ))}
          </select>
        </div>

        {/* Shutter Select */}
        <div className="space-y-1.5">
          <label className="text-xs font-mono font-bold text-zinc-400 block">Volet Roulant</label>
          <select
            value={config.shutterType}
            onChange={(e) => {
              playSwitchSound();
              setShutterType(e.target.value as ShutterType);
            }}
            className={`w-full p-2.5 rounded-2xl border text-xs font-mono min-h-[44px] cursor-pointer ${
              isLight ? 'bg-white border-slate-200 text-slate-800' : 'bg-[#0B0F19] border-white/10 text-white'
            }`}
          >
            {SHUTTER_OPTIONS.map((sh) => (
              <option key={sh.id} value={sh.id}>
                {sh.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* WILAYA & CONFORMITÉ THERMIQUE DTR C3-2 */}
      <div
        className={`p-3.5 rounded-2xl border space-y-2.5 ${
          isLight ? 'bg-white border-slate-200' : 'bg-[#0B0F19] border-white/10'
        }`}
      >
        <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
          <div className="flex items-center gap-1.5 font-bold text-xs">
            <MapPin className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span className={isLight ? 'text-slate-800' : 'text-zinc-200'}>
              Wilaya & Climat DTR C3-2
            </span>
          </div>
          <span className="text-[10px] text-zinc-500 font-mono">Norme Bâtiment DZ</span>
        </div>

        {/* Wilaya Selector */}
        <select
          value={selectedWilaya}
          onChange={(e) => {
            playTactileClick();
            setSelectedWilaya(e.target.value);
          }}
          className={`w-full p-2.5 rounded-xl border text-xs font-mono min-h-[44px] cursor-pointer ${
            isLight
              ? 'bg-slate-50 border-slate-200 text-slate-800'
              : 'bg-black/30 border-white/10 text-white'
          }`}
        >
          {ALGERIAN_WILAYAS_58.map((w) => (
            <option key={w.code} value={`${w.code} - ${w.nameFr}`}>
              {w.code} - {w.nameFr} ({w.nameAr})
            </option>
          ))}
        </select>

        {/* Thermal calculation & zone info */}
        <div
          className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 text-xs font-mono ${
            thermalQuick.isCompliant
              ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-400'
              : 'bg-amber-500/10 border-amber-500/25 text-amber-400'
          }`}
        >
          <div className="flex items-center gap-2 min-w-0">
            <Thermometer className="w-4 h-4 shrink-0" />
            <div className="min-w-0">
              <div className="font-bold text-[11px] truncate">
                {zoneThreshold.label}
              </div>
              <div className="text-[10px] opacity-80">
                Uw calculé : {thermalQuick.uw} W/(m²·K) (max : {thermalQuick.maxUw})
              </div>
            </div>
          </div>

          <div
            className={`px-2 py-1 rounded-lg text-[10px] font-bold shrink-0 ${
              thermalQuick.isCompliant
                ? 'bg-emerald-500/20 text-emerald-300'
                : 'bg-amber-500/20 text-amber-300'
            }`}
          >
            {thermalQuick.isCompliant ? 'Conforme' : 'À optimiser'}
          </div>
        </div>
      </div>

      {/* 8. ACCESSORIES & HARDWARE PACK */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
          <span>Options & Quincaillerie Chantier</span>
          {accessoriesTotal > 0 && (
            <span className="text-emerald-400 font-bold">+{accessoriesTotal.toLocaleString('fr-DZ')} DZD</span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {ACCESSORIES_LIST.map((acc) => {
            const isChecked = selectedAccessories.includes(acc.id);
            return (
              <button
                key={acc.id}
                type="button"
                onClick={() => toggleAccessory(acc.id)}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer min-h-[52px] flex items-start justify-between gap-2 ${
                  isChecked
                    ? 'border-[#D4AF37] bg-[#D4AF37]/10'
                    : isLight
                    ? 'bg-white border-slate-200 text-slate-800'
                    : 'bg-[#0B0F19] border-white/10 text-white'
                }`}
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5 font-bold text-xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]" />
                    <span>{acc.name}</span>
                  </div>
                  <div className="text-[10px] text-zinc-400 pl-3 leading-tight">{acc.desc}</div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-xs font-mono font-bold text-[#D4AF37]">
                    +{acc.priceDzd.toLocaleString('fr-DZ')}
                  </span>
                  <div
                    className={`w-4 h-4 rounded-md border flex items-center justify-center mt-1 ml-auto ${
                      isChecked
                        ? 'border-[#D4AF37] bg-[#D4AF37] text-slate-950'
                        : 'border-zinc-500'
                    }`}
                  >
                    {isChecked && <Check className="w-3 h-3" />}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 9. ESTIMATION BREAKDOWN & ACTION CARD */}
      <div
        className={`p-4 rounded-3xl border shadow-xl space-y-3 ${
          isLight ? 'bg-white border-slate-200' : 'bg-[#0B0F19] border-white/10'
        }`}
      >
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider block">
              Estimation Totale Atelier
            </span>
            <div className="text-2xl font-black font-mono text-[#D4AF37]">
              {grandTotal.toLocaleString('fr-DZ')} <span className="text-xs font-normal">DZD</span>
            </div>
          </div>

          <button
            onClick={() => setIsBreakdownOpen(!isBreakdownOpen)}
            className="p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 text-xs font-mono flex items-center gap-1 cursor-pointer text-zinc-400"
          >
            <span>Détails</span>
            {isBreakdownOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>

        {isBreakdownOpen && (
          <div className="pt-3 border-t border-black/10 dark:border-white/10 space-y-1.5 text-xs font-mono">
            <div className="flex justify-between text-zinc-400">
              <span>Profilés ({cost.profileLengthMeters.toFixed(1)}m • {cost.profileWeightKg.toFixed(1)}kg) :</span>
              <span className="font-semibold text-white">{cost.profileCostDzd.toLocaleString('fr-DZ')} DZD</span>
            </div>
            <div className="flex justify-between text-zinc-400">
              <span>Vitrage ({cost.glassAreaM2.toFixed(2)} m²) :</span>
              <span className="font-semibold text-white">{cost.glassCostDzd.toLocaleString('fr-DZ')} DZD</span>
            </div>
            <div className="flex justify-between text-zinc-400">
              <span>Quincaillerie & Joints EPDM :</span>
              <span className="font-semibold text-white">{cost.hardwareCostDzd.toLocaleString('fr-DZ')} DZD</span>
            </div>
            {accessoriesTotal > 0 && (
              <div className="flex justify-between text-zinc-400">
                <span>Options Renforcées Sélectionnées :</span>
                <span className="font-semibold text-emerald-400">+{accessoriesTotal.toLocaleString('fr-DZ')} DZD</span>
              </div>
            )}
            <div className="flex justify-between text-zinc-400">
              <span>Main-d'œuvre Atelier & Montage :</span>
              <span className="font-semibold text-white">{cost.laborCostDzd.toLocaleString('fr-DZ')} DZD</span>
            </div>
            {cost.shutterCostDzd > 0 && (
              <div className="flex justify-between text-zinc-400">
                <span>Volet Roulant Intégré :</span>
                <span className="font-semibold text-white">{cost.shutterCostDzd.toLocaleString('fr-DZ')} DZD</span>
              </div>
            )}
          </div>
        )}

        {/* PRIMARY CTAS */}
        <div className="pt-2 grid grid-cols-2 gap-2">
          <button
            onClick={handleShareWhatsApp}
            className="w-full py-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-mono font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer min-h-[48px] active:scale-98 transition-all"
          >
            <MessageCircle className="w-4 h-4" />
            <span>WhatsApp</span>
          </button>

          <button
            onClick={handleDownloadPdf}
            disabled={isPdfGenerating}
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-[#C5A880] to-[#D4AF37] text-slate-950 font-mono font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer min-h-[48px] hover:brightness-110 active:scale-98 transition-all shadow-md"
          >
            <FileDown className="w-4 h-4" />
            <span>{isPdfGenerating ? 'Génération...' : 'Devis PDF'}</span>
          </button>
        </div>
      </div>

      {/* 2D ARCHITECTURAL CROSS-SECTION MODAL */}
      {showCrossSectionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
          <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl">
            <ProfileCrossSectionViewer
              initialSeries={
                config.profileSystem === 'pvc_70_chamber'
                  ? 'pvc_60_multi'
                  : config.profileSystem === 'gamme_67_slide'
                  ? 'alu_52_rpt'
                  : 'alu_45_rpt'
              }
              onClose={() => setShowCrossSectionModal(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default MobileConfiguratorScreen;
