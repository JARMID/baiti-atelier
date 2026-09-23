import React, { useState, useMemo } from 'react';
import { useConfigStore } from '../../store/configStore';
import { WindowCanvas } from '../3d/WindowCanvas';
import type { OpeningType, ProfileSystem, GlassType } from '../../types/window';
import {
  MessageCircle,
  FileDown,
  ChevronDown,
  ChevronUp,
  Check,
  MapPin,
  Thermometer,
  Layers,
  BookmarkPlus,
  X,
  FileCheck,
  Scissors,
  Compass,
  Volume2,
  Sun,
  Shield,
  Palette,
  SlidersHorizontal,
  Zap,
  Disc,
  Waves,
  Building2,
  Activity,
  Wind,
  Lock,
  Box,
  Droplets,
  Wrench,
  Hand,
  Anchor,
  Flame,
} from 'lucide-react';
import type { MobileNavTab } from './MobileBottomNavigation';
import {
  playTactileClick,
  playSwitchSound,
  playClampSound,
  playSlideTick,
} from '../../utils/audioFeedback';
import {
  generateClientDevisPdf,
  generateDtrThermalCertificatePdf,
  formatOpeningTypeFr,
  formatProfileSystemFr,
  formatGlassTypeFr,
  formatShutterTypeFr,
} from '../../utils/pdfGenerator';
import { ALGERIAN_WILAYAS_58 } from '../../utils/algerianWilayas';
import { DTR_ZONE_THRESHOLDS, getDtrZoneForWilaya } from '../../utils/dtrThermal';
import { ProfileCrossSectionViewer } from '../cad/ProfileCrossSectionViewer';
import { RollerShutterMotorModal } from './RollerShutterMotorModal';
import { RollerShutterWindingModal } from './RollerShutterWindingModal';
import { AcousticInsulationModal } from './AcousticInsulationModal';
import { CurtainWallStructuralModal } from './CurtainWallStructuralModal';
import { SeismicJoineryModal } from './SeismicJoineryModal';
import { BifoldDoorModal } from './BifoldDoorModal';
import { LouverAerodynamicsModal } from './LouverAerodynamicsModal';
import { SecurityLockingModal } from './SecurityLockingModal';
import { StructuralGlazingModal } from './StructuralGlazingModal';
import { IntegratedBlindModal } from './IntegratedBlindModal';
import { WindowDrainageModal } from './WindowDrainageModal';
import { CornerCrimpingModal } from './CornerCrimpingModal';
import { HandleErgonomicsModal } from './HandleErgonomicsModal';
import { FrictionStayModal } from './FrictionStayModal';
import { BriseSoleilModal } from './BriseSoleilModal';
import { SmokeVentilationModal } from './SmokeVentilationModal';
import {
  GLASS_LIST,
  getGlassSpec,
  getEffectiveUg,
  getEffectiveRw,
  formatAcousticRating,
  formatThermalRating,
  type SpacerType,
} from '../../utils/glassSpecifications';
import {
  FINISH_LIST,
  getFinishSpec,
  formatFinishTreatmentBadge,
} from '../../utils/finishSpecifications';
import {
  SHUTTER_MECHANISMS,
  SHUTTER_SLATS,
  SHUTTER_BOXES,
  getShutterMechanismSpec,
  getShutterSlatSpec,
  getShutterBoxSpec,
  computeShutterBOM,
} from '../../utils/shutterSpecifications';

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
    name: 'Moustiquaire Enroulable',
    desc: 'Toile fibre de verre intégrée',
    priceDzd: 8500,
  },
  {
    id: 'weather_seal_pack',
    name: 'Pack Calfeutrement & Joint',
    desc: 'Compribande et mastic silicone étanchéité',
    priceDzd: 2500,
  },
];

const ALGERIAN_PRESETS: PresetItem[] = [
  { id: 'p1', name: 'Fenêtre Standard 120×120 (2V)', w: 1200, h: 1200, opening: 'sliding_2' },
  { id: 'p2', name: 'Baie Vitrée Salon 215×180', w: 1800, h: 2150, opening: 'sliding_2' },
  { id: 'p3', name: 'Grande Baie 215×240 (3 Rails)', w: 2400, h: 2150, opening: 'sliding_3' },
  { id: 'p4', name: 'Fenêtre Chambre 100×120 OB', w: 1000, h: 1200, opening: 'tilt_turn' },
  { id: 'p5', name: 'Porte-Fenêtre 215×140 Battante', w: 1400, h: 2150, opening: 'casement_2' },
  { id: 'p6', name: 'Châssis Fixe Couloir 60×120', w: 600, h: 1200, opening: 'fixed' },
];

interface MobileConfiguratorScreenProps {
  onNavigateTab?: (tab: MobileNavTab) => void;
}

export const MobileConfiguratorScreen: React.FC<MobileConfiguratorScreenProps> = ({
  onNavigateTab,
}) => {
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
    setSpacerType,
    setShutterType,
    setShutterSlatType,
    setShutterBoxType,
    setShutterPosition,
  } = useConfigStore();

  const isLight = theme === 'light';
  const isRtl = language === 'ar';
  const [isBreakdownOpen, setIsBreakdownOpen] = useState(false);
  const [isPdfGenerating, setIsPdfGenerating] = useState(false);
  const [isGeneratingDtrPdf, setIsGeneratingDtrPdf] = useState(false);
  const [selectedAccessories, setSelectedAccessories] = useState<string[]>([]);
  const [showCrossSectionModal, setShowCrossSectionModal] = useState(false);
  const [isMotorModalOpen, setIsMotorModalOpen] = useState(false);
  const [isWindingModalOpen, setIsWindingModalOpen] = useState(false);
  const [isAcousticModalOpen, setIsAcousticModalOpen] = useState(false);
  const [isCurtainWallModalOpen, setIsCurtainWallModalOpen] = useState(false);
  const [isSeismicModalOpen, setIsSeismicModalOpen] = useState(false);
  const [isBifoldModalOpen, setIsBifoldModalOpen] = useState(false);
  const [isLouverModalOpen, setIsLouverModalOpen] = useState(false);
  const [isSecurityModalOpen, setIsSecurityModalOpen] = useState(false);
  const [isStructuralGlazingModalOpen, setIsStructuralGlazingModalOpen] = useState(false);
  const [isIntegratedBlindModalOpen, setIsIntegratedBlindModalOpen] = useState(false);
  const [isDrainageModalOpen, setIsDrainageModalOpen] = useState(false);
  const [isCornerCrimpingModalOpen, setIsCornerCrimpingModalOpen] = useState(false);
  const [isHandleErgonomicsModalOpen, setIsHandleErgonomicsModalOpen] = useState(false);
  const [isFrictionStayModalOpen, setIsFrictionStayModalOpen] = useState(false);
  const [isBriseSoleilModalOpen, setIsBriseSoleilModalOpen] = useState(false);
  const [isSmokeVentModalOpen, setIsSmokeVentModalOpen] = useState(false);
  const [showAddToSurveyModal, setShowAddToSurveyModal] = useState(false);
  const [surveyRoomName, setSurveyRoomName] = useState('Salon - Baie Vitrée');
  const [surveyAllege, setSurveyAllege] = useState<number>(0);
  const [surveyQty, setSurveyQty] = useState<number>(1);
  const [surveyToastMessage, setSurveyToastMessage] = useState<string | null>(null);

  const activeSpacer: SpacerType = config.spacerType || 'standard_alu';
  const currentGlassSpec = useMemo(() => getGlassSpec(config.glassType), [config.glassType]);
  const effectiveUg = useMemo(() => getEffectiveUg(config.glassType, activeSpacer), [config.glassType, activeSpacer]);
  const effectiveRw = useMemo(() => getEffectiveRw(config.glassType, activeSpacer), [config.glassType, activeSpacer]);
  const acousticRating = useMemo(() => formatAcousticRating(effectiveRw), [effectiveRw]);
  const thermalRating = useMemo(() => formatThermalRating(effectiveUg), [effectiveUg]);
  const currentFinishSpec = useMemo(() => getFinishSpec(config.finishColor), [config.finishColor]);

  const activeSlatType = config.shutterSlatType || 'alu_foam_43';
  const activeBoxType = config.shutterBoxType || 'monobloc_165';
  const currentShutterMech = useMemo(
    () => getShutterMechanismSpec(config.shutterType),
    [config.shutterType]
  );
  const currentSlatSpec = useMemo(
    () => getShutterSlatSpec(activeSlatType),
    [activeSlatType]
  );
  const currentBoxSpec = useMemo(
    () => getShutterBoxSpec(activeBoxType),
    [activeBoxType]
  );
  const shutterBom = useMemo(
    () =>
      computeShutterBOM(
        config.width,
        config.height,
        config.shutterType,
        activeSlatType,
        activeBoxType
      ),
    [config.width, config.height, config.shutterType, activeSlatType, activeBoxType]
  );

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
    const ug = effectiveUg;

    let uf = 2.4;
    if (config.profileSystem === 'pvc_70_chamber') uf = 1.4;
    else if (config.profileSystem === 'gamme_40') uf = 5.8;
    else if (config.profileSystem === 'gamme_67_slide') uf = 3.2;

    const totalAreaM2 = Math.max(0.2, (config.width * config.height) / 1000000);
    const calculatedGlassAreaM2 = totalAreaM2 * 0.72;
    const frameAreaM2 = Math.max(0.04, totalAreaM2 - calculatedGlassAreaM2);
    const glassPerimeterM = Math.max(0.8, (2 * (config.width + config.height) * 0.85) / 1000);
    const psiG = activeSpacer === 'warm_edge' ? 0.04 : 0.08;

    const uw = Number(
      ((calculatedGlassAreaM2 * ug + frameAreaM2 * uf + glassPerimeterM * psiG) / totalAreaM2).toFixed(2)
    );

    const isCompliant = uw <= zoneThreshold.maxUw;
    return { uw, isCompliant, maxUw: zoneThreshold.maxUw };
  }, [config.width, config.height, effectiveUg, activeSpacer, config.profileSystem, zoneThreshold]);

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

  const handleConfirmAddToSurvey = () => {
    playClampSound();
    const STORAGE_KEY = 'baiti_field_measurement_project';
    let currentOpenings: any[] = [];
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) currentOpenings = JSON.parse(saved);
      } catch {
        currentOpenings = [];
      }
    }

    const newItem = {
      id: `op_cfg_${Date.now()}`,
      roomName: surveyRoomName.trim() || 'Châssis Configuré',
      width: config.width,
      height: config.height,
      allegeMm: surveyAllege,
      openingType: config.openingType,
      profileSystem: config.profileSystem,
      glassType: config.glassType,
      shutterType: config.shutterType,
      quantity: Math.max(1, surveyQty),
      estimatedUnitPriceDzd: grandTotal,
    };

    const updated = [...currentOpenings, newItem];
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        window.dispatchEvent(new Event('storage'));
      } catch {
        // Fallback
      }
    }

    setShowAddToSurveyModal(false);
    setSurveyToastMessage(`${surveyRoomName} (${config.width}×${config.height} mm) ajouté au carnet !`);
    setTimeout(() => setSurveyToastMessage(null), 3500);
  };

  const handleSendToSawCutting = () => {
    playClampSound();
    const isSliding = config.openingType.startsWith('sliding');
    const isFixed = config.openingType === 'fixed';
    const isDoubleCasement = config.openingType === 'casement_2';

    const cuts: Array<{
      id: string;
      length: number;
      quantity: number;
      miterLeft: 45 | 90;
      miterRight: 45 | 90;
      label: string;
      profileCode: string;
    }> = [];

    // Frame (Dormant)
    cuts.push({
      id: `dorm_h_${Date.now()}_1`,
      length: config.width,
      quantity: 2,
      miterLeft: 45,
      miterRight: 45,
      label: `Dormant Horiz. (${config.width} mm)`,
      profileCode: 'DORMANT-CADRE',
    });
    cuts.push({
      id: `dorm_v_${Date.now()}_2`,
      length: config.height,
      quantity: 2,
      miterLeft: 45,
      miterRight: 45,
      label: `Montants Dormant (${config.height} mm)`,
      profileCode: 'DORMANT-CADRE',
    });

    if (isFixed) {
      cuts.push({
        id: `parc_h_${Date.now()}_3`,
        length: Math.max(100, config.width - 60),
        quantity: 2,
        miterLeft: 45,
        miterRight: 45,
        label: 'Parclose Horiz.',
        profileCode: 'PARCLOSE-FIXE',
      });
      cuts.push({
        id: `parc_v_${Date.now()}_4`,
        length: Math.max(100, config.height - 60),
        quantity: 2,
        miterLeft: 45,
        miterRight: 45,
        label: 'Parclose Vert.',
        profileCode: 'PARCLOSE-FIXE',
      });
    } else if (isSliding) {
      const sashW = Math.round(config.width / (config.openingType === 'sliding_3' ? 3 : 2) + 15);
      const sashH = Math.max(200, config.height - 75);
      const qtySash = config.openingType === 'sliding_3' ? 6 : 4;
      cuts.push({
        id: `sash_h_${Date.now()}_3`,
        length: sashW,
        quantity: qtySash,
        miterLeft: 45,
        miterRight: 45,
        label: `Traverse Ouvrant (${sashW} mm)`,
        profileCode: 'OUVRANT-COULISSANT',
      });
      cuts.push({
        id: `sash_v_${Date.now()}_4`,
        length: sashH,
        quantity: qtySash,
        miterLeft: 45,
        miterRight: 45,
        label: `Montant Ouvrant (${sashH} mm)`,
        profileCode: 'OUVRANT-COULISSANT',
      });
      cuts.push({
        id: `chicane_${Date.now()}_5`,
        length: sashH,
        quantity: config.openingType === 'sliding_3' ? 4 : 2,
        miterLeft: 90,
        miterRight: 90,
        label: `Chicane Centrale (${sashH} mm)`,
        profileCode: 'CHICANE-CENTRALE',
      });
    } else {
      // Casement or Tilt & Turn
      const sashW = isDoubleCasement
        ? Math.round((config.width - 85) / 2)
        : Math.max(200, config.width - 80);
      const sashH = Math.max(200, config.height - 80);
      const sashQty = isDoubleCasement ? 4 : 2;
      cuts.push({
        id: `sash_h_${Date.now()}_3`,
        length: sashW,
        quantity: sashQty,
        miterLeft: 45,
        miterRight: 45,
        label: `Traverse Vantail (${sashW} mm)`,
        profileCode: 'OUVRANT-BATTANT',
      });
      cuts.push({
        id: `sash_v_${Date.now()}_4`,
        length: sashH,
        quantity: sashQty,
        miterLeft: 45,
        miterRight: 45,
        label: `Montant Vantail (${sashH} mm)`,
        profileCode: 'OUVRANT-BATTANT',
      });
    }

    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('baiti_cad_active_demands', JSON.stringify(cuts));
        window.dispatchEvent(new Event('storage'));
      } catch {
        // Fallback
      }
    }

    if (onNavigateTab) {
      onNavigateTab('cutting');
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

      {/* 1B. QUICK ARTISAN TOOLS DOCK */}
      {onNavigateTab && (
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          <button
            type="button"
            onClick={() => {
              playTactileClick();
              onNavigateTab('cad');
            }}
            className={`px-3 py-2 rounded-2xl border text-[11px] font-mono font-medium flex items-center gap-1.5 shrink-0 cursor-pointer min-h-[44px] transition-all ${
              isLight
                ? 'bg-white border-slate-200 text-slate-800 hover:bg-slate-50 shadow-xs'
                : 'bg-white/5 border-white/10 text-zinc-300 hover:text-white hover:bg-white/10'
            }`}
            title="Ouvrir dans le Studio CAO 2D pour configurer traverses et meneaux"
          >
            <Compass className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>Studio CAO 2D</span>
          </button>

          <button
            type="button"
            onClick={handleSendToSawCutting}
            className={`px-3 py-2 rounded-2xl border text-[11px] font-mono font-bold flex items-center gap-1.5 shrink-0 cursor-pointer min-h-[44px] transition-all ${
              isLight
                ? 'bg-sky-50 border-sky-300 text-sky-900 hover:bg-sky-100 shadow-xs'
                : 'bg-sky-500/15 border-sky-500/30 text-sky-300 hover:bg-sky-500/25'
            }`}
            title="Envoyer les débits à l'optimiseur de scie 1D"
          >
            <Scissors className="w-3.5 h-3.5 text-sky-400" />
            <span>Débiter Scie 1D</span>
          </button>

          <button
            type="button"
            onClick={() => {
              playTactileClick();
              onNavigateTab('field_quotes');
            }}
            className={`px-3 py-2 rounded-2xl border text-[11px] font-mono font-medium flex items-center gap-1.5 shrink-0 cursor-pointer min-h-[44px] transition-all ${
              isLight
                ? 'bg-white border-slate-200 text-slate-800 hover:bg-slate-50 shadow-xs'
                : 'bg-white/5 border-white/10 text-zinc-300 hover:text-white hover:bg-white/10'
            }`}
            title="Consulter le carnet de cotes relevées"
          >
            <BookmarkPlus className="w-3.5 h-3.5 text-amber-400" />
            <span>Carnet Chantier</span>
          </button>
        </div>
      )}


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

        {/* Curtain Wall Structural Sizing Action Button */}
        <button
          type="button"
          onClick={() => {
            playTactileClick();
            setIsCurtainWallModalOpen(true);
          }}
          className="w-full py-2.5 px-3 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/30 text-sky-400 text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer min-h-[44px]"
        >
          <Building2 className="w-4 h-4" />
          <span>Dimensionnement Statique Façade Rideau (DTU 33.1 / EC9)</span>
        </button>

        {/* Bifold Accordion Door Mechanics & PMR Sizing Action Button */}
        <button
          type="button"
          onClick={() => {
            playTactileClick();
            setIsBifoldModalOpen(true);
          }}
          className="w-full py-2.5 px-3 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer min-h-[44px]"
        >
          <Layers className="w-4 h-4" />
          <span>Dimensionnement Porte Accordéon & Seuil PMR (NF EN 1527)</span>
        </button>

        {/* Louver & Sunshade Aerodynamic Sizing Action Button */}
        <button
          type="button"
          onClick={() => {
            playTactileClick();
            setIsLouverModalOpen(true);
          }}
          className="w-full py-2.5 px-3 rounded-xl bg-teal-500/10 hover:bg-teal-500/20 border border-teal-500/30 text-teal-400 text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer min-h-[44px]"
        >
          <Wind className="w-4 h-4" />
          <span>Dimensionnement Grille à Ventelles & Aéraulique (NF EN 13030)</span>
        </button>

        {/* Security Locking & Burglary Resistance Action Button */}
        <button
          type="button"
          onClick={() => {
            playTactileClick();
            setIsSecurityModalOpen(true);
          }}
          className="w-full py-2.5 px-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer min-h-[44px]"
        >
          <Lock className="w-4 h-4" />
          <span>Audit Sécurité Anti-Effraction & Quincaillerie RC (NF EN 1627)</span>
        </button>

        {/* Structural Silicone Glazing VEC / VEP Joint Sizing Action Button */}
        <button
          type="button"
          onClick={() => {
            playTactileClick();
            setIsStructuralGlazingModalOpen(true);
          }}
          className="w-full py-2.5 px-3 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer min-h-[44px]"
        >
          <Box className="w-4 h-4" />
          <span>Dimensionnement Silicone VEC / VEP (NF DTU 39 P4 / ETAG 002)</span>
        </button>

        {/* Integrated Blind in Insulated Glazing Action Button */}
        <button
          type="button"
          onClick={() => {
            playTactileClick();
            setIsIntegratedBlindModalOpen(true);
          }}
          className="w-full py-2.5 px-3 rounded-xl bg-teal-500/10 hover:bg-teal-500/20 border border-teal-500/30 text-teal-400 text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer min-h-[44px]"
        >
          <Sun className="w-4 h-4" />
          <span>Store Vénitien Intégré Double Vitrage (NF EN 1279 / CSTB 3677)</span>
        </button>

        {/* Window Drainage & Water Evacuation Action Button */}
        <button
          type="button"
          onClick={() => {
            playTactileClick();
            setIsDrainageModalOpen(true);
          }}
          className="w-full py-2.5 px-3 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/30 text-sky-400 text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer min-h-[44px]"
        >
          <Droplets className="w-4 h-4" />
          <span>Drainage & Étanchéité à l'Eau (NF DTU 36.5 / NF EN 12208)</span>
        </button>

        {/* Corner Joint Crimping & Cleat Resistance Action Button */}
        <button
          type="button"
          onClick={() => {
            playTactileClick();
            setIsCornerCrimpingModalOpen(true);
          }}
          className="w-full py-2.5 px-3 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer min-h-[44px]"
        >
          <Wrench className="w-4 h-4" />
          <span>Sertissage & Équerres d'Angle (NF P 20-302 / Eurocode 9)</span>
        </button>

        {/* Handle Operating Forces & PMR Accessibility Action Button */}
        <button
          type="button"
          onClick={() => {
            playTactileClick();
            setIsHandleErgonomicsModalOpen(true);
          }}
          className="w-full py-2.5 px-3 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer min-h-[44px]"
        >
          <Hand className="w-4 h-4" />
          <span>Forces de Manœuvre & Ergonomie PMR (NF EN 12046-1 / Décret 06-455)</span>
        </button>

        {/* Friction Stay & Projecting Window Sash Safety Action Button */}
        <button
          type="button"
          onClick={() => {
            playTactileClick();
            setIsFrictionStayModalOpen(true);
          }}
          className="w-full py-2.5 px-3 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer min-h-[44px]"
        >
          <Anchor className="w-4 h-4" />
          <span>Compas à Friction & Sécurité Anti-Chute (NF EN 13126-5 / RNV 2013)</span>
        </button>

        {/* Architectural Louver Sunshade & Brise-Soleil Structural Action Button */}
        <button
          type="button"
          onClick={() => {
            playTactileClick();
            setIsBriseSoleilModalOpen(true);
          }}
          className="w-full py-2.5 px-3 rounded-xl bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/30 text-orange-400 text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer min-h-[44px]"
        >
          <Sun className="w-4 h-4" />
          <span>Brise-Soleil Architectural & Consoles (Eurocode 9 / RNV 2013)</span>
        </button>

        {/* Natural Smoke & Heat Exhaust Ventilator (DENFC) Action Button */}
        <button
          type="button"
          onClick={() => {
            playTactileClick();
            setIsSmokeVentModalOpen(true);
          }}
          className="w-full py-2.5 px-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer min-h-[44px]"
        >
          <Flame className="w-4 h-4" />
          <span>Désenfumage Naturel & Sécurité Incendie (DENFC NF EN 12101-2)</span>
        </button>
      </div>

      {/* 6. ARCHITECTURAL FINISH & SURFACE TREATMENT PALETTE */}
      <div
        className={`p-3.5 rounded-2xl border space-y-3 ${
          isLight ? 'bg-white border-slate-200 shadow-xs' : 'bg-[#0B0F19] border-white/10'
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Palette className="w-4 h-4 text-[#D4AF37]" />
            <span className={`text-xs font-mono font-bold ${isLight ? 'text-slate-800' : 'text-zinc-200'}`}>
              Teinte RAL & Traitement de Surface
            </span>
          </div>
          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/20">
            {currentFinishSpec.qualityLabelFr}
          </span>
        </div>

        {/* Finish Swatches Horizontal Scroll */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          {FINISH_LIST.map((col) => {
            const isSelected = config.finishColor === col.id;
            const priceTag =
              col.priceMultiplier === 1.0
                ? 'Standard'
                : `+${Math.round((col.priceMultiplier - 1.0) * 100)}%`;
            return (
              <button
                key={col.id}
                type="button"
                onClick={() => {
                  playTactileClick();
                  setFinishColor(col.id);
                }}
                className={`p-2.5 rounded-2xl border flex flex-col items-center gap-1.5 transition-all cursor-pointer shrink-0 min-w-[92px] ${
                  isSelected
                    ? 'border-[#D4AF37] bg-[#D4AF37]/15 shadow-sm ring-1 ring-[#D4AF37]'
                    : isLight
                    ? 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    : 'bg-white/5 border-white/10 text-zinc-300 hover:bg-white/10'
                }`}
              >
                <div className="relative">
                  <span
                    className="w-6 h-6 rounded-full border border-black/20 shadow-xs block"
                    style={{ backgroundColor: col.colorHex }}
                  />
                  {isSelected && (
                    <span className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full bg-[#D4AF37] text-slate-950 flex items-center justify-center text-[8px] font-bold">
                      ✓
                    </span>
                  )}
                </div>

                <div className="text-center font-mono">
                  <span className="text-[11px] font-bold block leading-tight truncate max-w-[85px]">
                    {col.labelFr.split(' ')[0]} {col.ralCode ? col.ralCode.replace('RAL ', '') : ''}
                  </span>
                  <span
                    className={`text-[9px] font-semibold block leading-tight ${
                      col.priceMultiplier === 1.0
                        ? 'text-zinc-400'
                        : isSelected
                        ? 'text-[#D4AF37]'
                        : 'text-amber-500'
                    }`}
                  >
                    {priceTag}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Selected Finish Technical Card */}
        <div
          className={`p-2.5 rounded-xl border text-xs font-mono space-y-1.5 ${
            isLight ? 'bg-slate-50 border-slate-200' : 'bg-black/30 border-white/5'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`font-bold text-xs ${isLight ? 'text-slate-900' : 'text-white'}`}>
              {currentFinishSpec.labelFr}
            </span>
            <span className="text-[10px] text-zinc-400">
              {currentFinishSpec.ralCode || 'Sublimation'}
            </span>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            <span
              className={`px-1.5 py-0.5 rounded text-[9px] font-semibold border ${
                formatFinishTreatmentBadge(currentFinishSpec.treatmentType).badgeClass
              }`}
            >
              {currentFinishSpec.treatmentLabelFr}
            </span>
            <span className="px-1.5 py-0.5 rounded text-[9px] bg-black/10 dark:bg-white/5 text-zinc-400 border border-black/5 dark:border-white/10">
              {currentFinishSpec.textureLabelFr}
            </span>
            <span className="px-1.5 py-0.5 rounded text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
              Garantie {currentFinishSpec.guaranteeYears} ans
            </span>
          </div>

          <p className="text-[10px] text-zinc-500 leading-relaxed pt-0.5">
            {currentFinishSpec.descriptionFr}
          </p>

          <div className="text-[10px] text-zinc-400 pt-0.5 border-t border-black/5 dark:border-white/5 flex items-center justify-between">
            <span className="text-zinc-500 truncate max-w-[70%]">
              Usage : {currentFinishSpec.recommendedUseFr}
            </span>
            <span className="text-amber-400 font-bold shrink-0">
              {currentFinishSpec.priceMultiplier === 1.0
                ? 'Base standard'
                : `+${currentFinishSpec.surchargeDzdPerKg} DA/kg`}
            </span>
          </div>
        </div>
      </div>

      {/* 7. GLASS & ACOUSTIC SPACER CONFIGURATOR */}
      <div
        className={`p-3.5 rounded-2xl border space-y-3 ${
          isLight ? 'bg-white border-slate-200 shadow-xs' : 'bg-[#0B0F19] border-white/10'
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Volume2 className="w-4 h-4 text-cyan-400" />
            <span className={`text-xs font-mono font-bold ${isLight ? 'text-slate-800' : 'text-zinc-200'}`}>
              Vitrage & Performance Acoustique
            </span>
          </div>
          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            Rw {effectiveRw} dB • Ug {effectiveUg}
          </span>
        </div>

        {/* Glass Select Dropdown */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400">
            <span>Composition Verre & Barrière</span>
            <span className="text-[#D4AF37] font-bold">{currentGlassSpec.basePriceDzdPerM2.toLocaleString('fr-DZ')} DZD/m²</span>
          </div>
          <select
            value={config.glassType}
            onChange={(e) => {
              playSwitchSound();
              setGlassType(e.target.value as GlassType);
            }}
            className={`w-full p-2.5 rounded-2xl border text-xs font-mono min-h-[44px] cursor-pointer ${
              isLight ? 'bg-slate-50 border-slate-200 text-slate-800' : 'bg-black/30 border-white/10 text-white'
            }`}
          >
            {GLASS_LIST.map((g) => (
              <option key={g.id} value={g.id}>
                {g.labelFr} ({g.tradeFormula}) • Ug {g.ug}
              </option>
            ))}
          </select>
        </div>

        {/* Live Glass Telemetry Badge Row */}
        <div className="grid grid-cols-3 gap-1.5 font-mono text-center">
          <button
            type="button"
            onClick={() => {
              playTactileClick();
              setIsAcousticModalOpen(true);
            }}
            className={`p-2 rounded-xl border transition-all cursor-pointer hover:border-cyan-500/50 active:scale-95 ${
              isLight ? 'bg-slate-50 border-slate-200' : 'bg-white/5 border-white/10 hover:bg-cyan-500/10'
            }`}
            title="Ouvrir le calculateur d isolement acoustique DTR C3-3"
          >
            <div className="flex items-center justify-center gap-1 text-[10px] text-zinc-500">
              <Waves className="w-3 h-3 text-cyan-400" />
              <span className="text-cyan-400 font-semibold">Acoustique</span>
            </div>
            <span className="text-xs font-bold text-cyan-400 block mt-0.5">{effectiveRw} dB</span>
            <span className="text-[9px] text-zinc-400 block truncate">{acousticRating.noiseDropRatio}</span>
          </button>

          <div className={`p-2 rounded-xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-white/5 border-white/10'}`}>
            <div className="flex items-center justify-center gap-1 text-[10px] text-zinc-500">
              <Thermometer className="w-3 h-3 text-emerald-400" />
              <span>Thermique Ug</span>
            </div>
            <span className="text-xs font-bold text-emerald-400 block mt-0.5">{effectiveUg} <span className="text-[9px]">W/m²K</span></span>
            <span className="text-[9px] text-zinc-400 block truncate">{thermalRating.energyGrade}</span>
          </div>

          <div className={`p-2 rounded-xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-white/5 border-white/10'}`}>
            <div className="flex items-center justify-center gap-1 text-[10px] text-zinc-500">
              <Sun className="w-3 h-3 text-[#D4AF37]" />
              <span>Solaire g</span>
            </div>
            <span className="text-xs font-bold text-[#D4AF37] block mt-0.5">g = {currentGlassSpec.sw}</span>
            <span className="text-[9px] text-zinc-400 block truncate">TL {Math.round(currentGlassSpec.tl * 100)}%</span>
          </div>
        </div>

        {/* Trade Application Note */}
        <div className={`p-2 rounded-xl border text-[10px] font-mono flex items-start gap-1.5 ${
          isLight ? 'bg-cyan-50/50 border-cyan-200 text-cyan-900' : 'bg-cyan-500/5 border-cyan-500/20 text-cyan-300'
        }`}>
          <Shield className="w-3.5 h-3.5 shrink-0 mt-0.5 text-cyan-400" />
          <span>{currentGlassSpec.applicationTradeFr}</span>
        </div>

        {/* Acoustic Simulator Quick Button */}
        <button
          type="button"
          onClick={() => {
            playTactileClick();
            setIsAcousticModalOpen(true);
          }}
          className="w-full py-2.5 px-3 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer min-h-[44px]"
        >
          <Waves className="w-4 h-4" />
          <span>Étude Acoustique & Bruits de Voirie (DTR C3-3 / ISO 717-1)</span>
        </button>

        {/* Seismic RPA 99 / Drift Safety Quick Button */}
        <button
          type="button"
          onClick={() => {
            playTactileClick();
            setIsSeismicModalOpen(true);
          }}
          className="w-full py-2.5 px-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer min-h-[44px]"
        >
          <Activity className="w-4 h-4" />
          <span>Sécurité Parasismique & Déplacement Inter-Étage (RPA 99 / EC8)</span>
        </button>

        {/* Intercalaire / Spacer Selection */}
        {currentGlassSpec.thicknessTotalMm > 8 && (
          <div className="space-y-1.5 pt-1 border-t border-white/5">
            <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400">
              <span>Intercalaire Vitrage (Spacer)</span>
              <span className="text-[10px] text-zinc-500">Rupture de pont de rive</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  playSwitchSound();
                  setSpacerType('standard_alu');
                }}
                className={`py-2 px-2.5 rounded-xl border text-xs font-mono font-bold transition-all text-left cursor-pointer min-h-[44px] ${
                  activeSpacer === 'standard_alu'
                    ? isLight
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-white text-slate-950 border-white'
                    : isLight
                    ? 'bg-slate-50 border-slate-200 text-slate-700'
                    : 'bg-white/5 border-white/10 text-zinc-400'
                }`}
              >
                <span className="block font-bold">Aluminium Standard</span>
                <span className="text-[10px] opacity-75 font-normal">Intercalaire alu 16mm</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  playSwitchSound();
                  setSpacerType('warm_edge');
                }}
                className={`py-2 px-2.5 rounded-xl border text-xs font-mono font-bold transition-all text-left cursor-pointer min-h-[44px] ${
                  activeSpacer === 'warm_edge'
                    ? isLight
                      ? 'bg-cyan-600 text-white border-cyan-600'
                      : 'bg-cyan-500 text-slate-950 border-cyan-400'
                    : isLight
                    ? 'bg-slate-50 border-slate-200 text-slate-700'
                    : 'bg-white/5 border-white/10 text-zinc-400'
                }`}
              >
                <span className="block font-bold flex items-center justify-between">
                  <span>Warm-Edge</span>
                  <span className="text-[9px] px-1 py-0.2 rounded bg-cyan-400/20 text-cyan-200">+650 DZD</span>
                </span>
                <span className="text-[10px] opacity-75 font-normal">Composite sans condensation</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 8. INTEGRATED ROLLER SHUTTER & MOTORIZATION CONFIGURATOR */}
      <div
        className={`p-3.5 rounded-2xl border space-y-3 ${
          isLight ? 'bg-white border-slate-200 shadow-xs' : 'bg-[#0B0F19] border-white/10'
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-emerald-400" />
            <span className={`text-xs font-mono font-bold ${isLight ? 'text-slate-800' : 'text-zinc-200'}`}>
              Volet Roulant Monobloc & Motorisation
            </span>
          </div>
          <span
            className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${
              config.shutterType === 'none'
                ? 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20'
                : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
            }`}
          >
            {config.shutterType === 'none'
              ? 'Sans Volet'
              : `${currentShutterMech.labelFr.split(' ')[0]} • ${shutterBom.totalPriceDzd.toLocaleString('fr-DZ')} DZD`}
          </span>
        </div>

        {/* Mechanism Selector Pills */}
        <div className="space-y-1">
          <span className="text-[10px] font-mono text-zinc-400 block">Type de manœuvre</span>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
            {SHUTTER_MECHANISMS.map((mech) => {
              const isSelected = config.shutterType === mech.id;
              const priceTag =
                mech.id === 'none'
                  ? 'Inclus'
                  : `${mech.basePriceDzd.toLocaleString('fr-DZ')} DA`;
              return (
                <button
                  key={mech.id}
                  type="button"
                  onClick={() => {
                    playTactileClick();
                    setShutterType(mech.id);
                  }}
                  className={`p-2 rounded-2xl border text-left transition-all cursor-pointer min-h-[46px] flex flex-col justify-between ${
                    isSelected
                      ? 'border-emerald-500 bg-emerald-500/15 shadow-xs font-bold'
                      : isLight
                      ? 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                      : 'bg-white/5 border-white/10 text-zinc-300 hover:bg-white/10'
                  }`}
                >
                  <span className="text-[11px] font-mono leading-tight block truncate">
                    {mech.labelFr.split('(')[0].trim()}
                  </span>
                  <span
                    className={`text-[9px] font-mono block ${
                      isSelected ? 'text-emerald-400 font-bold' : 'text-zinc-500'
                    }`}
                  >
                    {priceTag}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Active Shutter Detailed Configurations */}
        {config.shutterType !== 'none' && (
          <div className="space-y-2.5 pt-1 border-t border-black/5 dark:border-white/5">
            {/* Slats & Box Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {/* Slat Type Selector */}
              <div className="space-y-1">
                <span className="text-[10px] font-mono text-zinc-400 block">Modèle de Lame</span>
                <select
                  value={activeSlatType}
                  onChange={(e) => {
                    playSwitchSound();
                    setShutterSlatType(e.target.value as any);
                  }}
                  className={`w-full p-2 rounded-xl border text-xs font-mono min-h-[40px] cursor-pointer ${
                    isLight ? 'bg-white border-slate-200 text-slate-800' : 'bg-[#0B0F19] border-white/10 text-white'
                  }`}
                >
                  {SHUTTER_SLATS.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.labelFr} ({s.surchargePerM2Dzd >= 0 ? `+${s.surchargePerM2Dzd}` : s.surchargePerM2Dzd} DA/m²)
                    </option>
                  ))}
                </select>
              </div>

              {/* Shutter Box Selector */}
              <div className="space-y-1">
                <span className="text-[10px] font-mono text-zinc-400 block">Coffre / Caisson</span>
                <select
                  value={activeBoxType}
                  onChange={(e) => {
                    playSwitchSound();
                    setShutterBoxType(e.target.value as any);
                  }}
                  className={`w-full p-2 rounded-xl border text-xs font-mono min-h-[40px] cursor-pointer ${
                    isLight ? 'bg-white border-slate-200 text-slate-800' : 'bg-[#0B0F19] border-white/10 text-white'
                  }`}
                >
                  {SHUTTER_BOXES.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.labelFr}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Live Interactive Shutter Position Slider */}
            <div
              className={`p-2.5 rounded-xl border space-y-1.5 ${
                isLight ? 'bg-slate-50 border-slate-200' : 'bg-black/30 border-white/5'
              }`}
            >
              <div className="flex items-center justify-between text-[11px] font-mono">
                <span className="text-zinc-400">Position du tablier (Animation 3D)</span>
                <span className="font-bold text-emerald-400">
                  {Math.round(config.shutterPosition ?? 0)}%{' '}
                  {config.shutterPosition === 0
                    ? '(Relevé)'
                    : config.shutterPosition === 100
                    ? '(Fermé)'
                    : '(Partiel)'}
                </span>
              </div>

              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={config.shutterPosition ?? 0}
                onChange={(e) => {
                  playSlideTick();
                  setShutterPosition(Number(e.target.value));
                }}
                className="w-full accent-emerald-500 cursor-pointer h-1.5 bg-black/10 dark:bg-white/10 rounded-lg"
              />

              <div className="flex items-center justify-between text-[9px] font-mono text-zinc-500 pt-0.5">
                <button
                  type="button"
                  onClick={() => {
                    playTactileClick();
                    setShutterPosition(0);
                  }}
                  className="hover:text-emerald-400 cursor-pointer"
                >
                  0% (Relevé)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    playTactileClick();
                    setShutterPosition(50);
                  }}
                  className="hover:text-emerald-400 cursor-pointer"
                >
                  50% (Ajouré)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    playTactileClick();
                    setShutterPosition(100);
                  }}
                  className="hover:text-emerald-400 cursor-pointer"
                >
                  100% (Occulté)
                </button>
              </div>
            </div>

            {/* Shutter Workshop Telemetry Card */}
            <div
              className={`p-2.5 rounded-xl border text-xs font-mono space-y-1.5 ${
                isLight ? 'bg-slate-50 border-slate-200' : 'bg-black/40 border-white/5'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className={`font-bold text-[11px] ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  Fiche Technique Tablier Atelier
                </span>
                <span className="text-[10px] text-emerald-400 font-bold">
                  {shutterBom.totalPriceDzd.toLocaleString('fr-DZ')} DZD
                </span>
              </div>

              {/* 4 Mini KPI Badges */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-[10px]">
                <div className={`p-1.5 rounded-lg border ${isLight ? 'bg-white border-slate-200' : 'bg-white/5 border-white/10'}`}>
                  <span className="text-zinc-500 block text-[9px]">Lames à couper</span>
                  <span className="font-bold text-amber-400">{shutterBom.slatCount} × {shutterBom.slatCutLengthMm} mm</span>
                </div>
                <div className={`p-1.5 rounded-lg border ${isLight ? 'bg-white border-slate-200' : 'bg-white/5 border-white/10'}`}>
                  <span className="text-zinc-500 block text-[9px]">Poids tablier</span>
                  <span className="font-bold text-cyan-400">{shutterBom.curtainWeightKg} kg</span>
                </div>
                <div className={`p-1.5 rounded-lg border ${isLight ? 'bg-white border-slate-200' : 'bg-white/5 border-white/10'}`}>
                  <span className="text-zinc-500 block text-[9px]">Axe octogonal</span>
                  <span className="font-bold text-slate-300">{shutterBom.octagonalAxleLengthMm} mm</span>
                </div>
                <div className={`p-1.5 rounded-lg border ${isLight ? 'bg-white border-slate-200' : 'bg-white/5 border-white/10'}`}>
                  <span className="text-zinc-500 block text-[9px]">Couple moteur</span>
                  <span className="font-bold text-emerald-400">
                    {shutterBom.motorTorqueNm > 0 ? `${shutterBom.motorTorqueNm} Nm` : 'Manuel'}
                  </span>
                </div>
              </div>

              <div className="text-[10px] text-zinc-500 pt-0.5 flex items-center justify-between">
                <span className="truncate max-w-[50%]">{currentSlatSpec.securityLevelFr}</span>
                <span className="truncate text-zinc-400 text-right">
                  Coffre {currentBoxSpec.boxHeightMm} mm • {shutterBom.lockingStrapsCount} verrous
                </span>
              </div>
            </div>

            {/* Roller Shutter Winding Diameter & Box Clearance Sizing Button */}
            <button
              type="button"
              onClick={() => {
                playTactileClick();
                setIsWindingModalOpen(true);
              }}
              className="w-full py-2.5 px-3 rounded-2xl bg-sky-500/15 border border-sky-500/30 text-sky-400 font-bold text-xs flex items-center justify-between cursor-pointer hover:bg-sky-500/25 active:scale-98 transition-all min-h-[44px]"
              title="Calcul du diamètre d'enroulement spiralé et vérification de la garde au caisson"
            >
              <div className="flex items-center gap-2">
                <Disc className="w-4 h-4 text-sky-400 shrink-0" />
                <span>Calcul Enroulement & Garde au Caisson</span>
              </div>
              <span className="text-[10px] text-sky-400/80 font-mono">Spirale & Débit →</span>
            </button>

            {/* Roller Shutter Motor Wiring & Limit Switch Guide Button */}
            {config.shutterType === 'motorized' && (
              <button
                type="button"
                onClick={() => {
                  playTactileClick();
                  setIsMotorModalOpen(true);
                }}
                className="w-full py-2.5 px-3 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 font-bold text-xs flex items-center justify-between cursor-pointer hover:bg-amber-500/25 active:scale-98 transition-all min-h-[44px]"
                title="Guide de raccordement électrique 230V, couple Nm et réglage des fins de course"
              >
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Guide Câblage 230V & Réglage Moteur</span>
                </div>
                <span className="text-[10px] text-amber-400/80 font-mono">Schéma & Fins de course →</span>
              </button>
            )}
          </div>
        )}
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

        {/* 1-Tap DTR C3-2 Certificate Download */}
        <button
          onClick={async () => {
            playTactileClick();
            setIsGeneratingDtrPdf(true);
            try {
              await generateDtrThermalCertificatePdf({
                projectTitle: `Chantier Mobile ${selectedWilaya}`,
                clientName: 'Client Particulier',
                wilayaName: selectedWilaya,
                widthMm: config.width,
                heightMm: config.height,
                openingType: config.openingType,
                profileSystem: config.profileSystem,
                glassType: config.glassType,
                glassAreaM2: (config.width * config.height * 0.72) / 1000000,
              });
            } finally {
              setIsGeneratingDtrPdf(false);
            }
          }}
          disabled={isGeneratingDtrPdf}
          className={`w-full py-2.5 px-3 rounded-xl border text-xs font-mono font-medium flex items-center justify-center gap-2 transition-all min-h-[44px] cursor-pointer ${
            isLight
              ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-300 shadow-xs'
              : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
          }`}
        >
          <FileCheck className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>{isGeneratingDtrPdf ? 'Génération du PDF...' : 'Télécharger Attestation DTR C3-2 (PDF)'}</span>
        </button>
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
            <div className={`flex justify-between ${isLight ? 'text-slate-600' : 'text-zinc-400'}`}>
              <span>Profilés ({cost.profileLengthMeters.toFixed(1)}m • {cost.profileWeightKg.toFixed(1)}kg) :</span>
              <span className={`font-semibold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                {cost.profileCostDzd.toLocaleString('fr-DZ')} DZD
              </span>
            </div>
            <div className={`flex justify-between ${isLight ? 'text-slate-600' : 'text-zinc-400'}`}>
              <span>Vitrage ({cost.glassAreaM2.toFixed(2)} m²) :</span>
              <span className={`font-semibold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                {cost.glassCostDzd.toLocaleString('fr-DZ')} DZD
              </span>
            </div>
            <div className={`flex justify-between ${isLight ? 'text-slate-600' : 'text-zinc-400'}`}>
              <span>Quincaillerie & Joints EPDM :</span>
              <span className={`font-semibold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                {cost.hardwareCostDzd.toLocaleString('fr-DZ')} DZD
              </span>
            </div>
            {accessoriesTotal > 0 && (
              <div className={`flex justify-between ${isLight ? 'text-slate-600' : 'text-zinc-400'}`}>
                <span>Options Renforcées Sélectionnées :</span>
                <span className="font-semibold text-emerald-400">+{accessoriesTotal.toLocaleString('fr-DZ')} DZD</span>
              </div>
            )}
            <div className={`flex justify-between ${isLight ? 'text-slate-600' : 'text-zinc-400'}`}>
              <span>Main-d'œuvre Atelier & Montage :</span>
              <span className={`font-semibold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                {cost.laborCostDzd.toLocaleString('fr-DZ')} DZD
              </span>
            </div>
            {cost.shutterCostDzd > 0 && (
              <div className={`flex justify-between ${isLight ? 'text-slate-600' : 'text-zinc-400'}`}>
                <span>Volet Roulant Intégré :</span>
                <span className={`font-semibold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  {cost.shutterCostDzd.toLocaleString('fr-DZ')} DZD
                </span>
              </div>
            )}
          </div>
        )}

        {/* PRIMARY CTAS */}
        <div className="pt-2 space-y-2">
          <button
            onClick={() => {
              playTactileClick();
              setSurveyAllege(config.height > 2000 ? 0 : 900);
              setShowAddToSurveyModal(true);
            }}
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-500/20 to-amber-600/20 border border-amber-500/40 text-amber-300 font-mono font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer min-h-[48px] hover:bg-amber-500/30 active:scale-98 transition-all shadow-sm"
          >
            <BookmarkPlus className="w-4 h-4 text-[#D4AF37]" />
            <span>+ Ajouter au Carnet de Cotes Chantier</span>
          </button>

          <div className="grid grid-cols-2 gap-2">
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

          {onNavigateTab && (
            <button
              type="button"
              onClick={handleSendToSawCutting}
              className={`w-full py-2.5 rounded-2xl border font-mono font-bold text-xs flex items-center justify-center gap-2 cursor-pointer min-h-[44px] transition-all active:scale-98 ${
                isLight
                  ? 'bg-sky-50 border-sky-300 text-sky-900 hover:bg-sky-100 shadow-xs'
                  : 'bg-sky-500/15 border-sky-500/30 text-sky-300 hover:bg-sky-500/25'
              }`}
              title="Envoyer les coupes de ce châssis à l'optimiseur de scie"
            >
              <Scissors className="w-4 h-4 text-sky-400" />
              <span>Optimiser le Débit Scie 1D</span>
            </button>
          )}
        </div>
      </div>

      {/* TOAST NOTIFICATION */}
      {surveyToastMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-2xl bg-emerald-600 text-white font-mono font-bold text-xs shadow-xl flex items-center gap-3 animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 shrink-0 text-emerald-200" />
            <span>{surveyToastMessage}</span>
          </div>
          {onNavigateTab && (
            <button
              type="button"
              onClick={() => {
                playTactileClick();
                setSurveyToastMessage(null);
                onNavigateTab('field_quotes');
              }}
              className="px-2.5 py-1 rounded-xl bg-white text-slate-950 font-bold text-[10px] cursor-pointer hover:bg-slate-100 active:scale-95 transition-all shrink-0 shadow-xs"
            >
              Voir Carnet
            </button>
          )}
        </div>
      )}

      {/* ADD TO SURVEY BOTTOM SHEET / MODAL */}
      {showAddToSurveyModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div
            className={`w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl border shadow-2xl p-5 space-y-4 font-mono text-xs ${
              isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-[#0E131F] border-white/10 text-white'
            }`}
          >
            <div className="flex items-center justify-between border-b border-black/10 dark:border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <BookmarkPlus className="w-4 h-4 text-[#D4AF37]" />
                <h3 className="text-sm font-bold">Ajouter au Carnet de Cotes</h3>
              </div>
              <button
                onClick={() => setShowAddToSurveyModal(false)}
                className={`p-1.5 rounded-xl ${
                  isLight ? 'hover:bg-slate-100 text-slate-400 hover:text-slate-800' : 'hover:bg-white/10 text-zinc-400 hover:text-white'
                }`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Config Summary Card */}
            <div
              className={`p-3 rounded-2xl border space-y-1 ${
                isLight ? 'bg-slate-50 border-slate-200' : 'bg-black/20 border-white/5'
              }`}
            >
              <div className="flex items-center justify-between font-bold">
                <span className="text-cyan-400">{config.width} × {config.height} mm</span>
                <span className="text-[#D4AF37]">{grandTotal.toLocaleString('fr-DZ')} DZD /u</span>
              </div>
              <div className="text-[10px] text-zinc-500">
                {formatOpeningTypeFr(config.openingType)} • {formatProfileSystemFr(config.profileSystem)}
              </div>
              <div className="text-[10px] text-zinc-500">
                {formatGlassTypeFr(config.glassType)} • {formatShutterTypeFr(config.shutterType)}
              </div>
            </div>

            {/* Quick Room Suggestions */}
            <div className="space-y-1.5">
              <label className={`text-[11px] block ${isLight ? 'text-slate-600 font-medium' : 'text-zinc-400'}`}>
                Choix Rapide Pièce
              </label>
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
                {['Salon', 'Cuisine', 'Chambre 1', 'Chambre 2', 'Chambre Parents', 'SDB', 'Couloir', 'Balcon'].map((rm) => (
                  <button
                    key={rm}
                    type="button"
                    onClick={() => {
                      playTactileClick();
                      setSurveyRoomName(rm);
                      if (rm === 'Salon' || rm === 'Balcon') setSurveyAllege(0);
                      else if (rm === 'Cuisine' || rm === 'SDB') setSurveyAllege(1000);
                      else setSurveyAllege(900);
                    }}
                    className={`px-2.5 py-1 rounded-xl border text-[10px] whitespace-nowrap cursor-pointer transition-all ${
                      surveyRoomName === rm
                        ? 'bg-[#D4AF37] text-slate-950 font-bold border-[#D4AF37]'
                        : isLight
                        ? 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
                        : 'bg-white/5 border-white/10 text-zinc-400 hover:text-white'
                    }`}
                  >
                    {rm}
                  </button>
                ))}
              </div>
            </div>

            {/* Form Fields */}
            <div className="space-y-3">
              <div className="space-y-1">
                <label className={`text-[11px] block ${isLight ? 'text-slate-600 font-medium' : 'text-zinc-400'}`}>
                  Désignation / Pièce *
                </label>
                <input
                  type="text"
                  value={surveyRoomName}
                  onChange={(e) => setSurveyRoomName(e.target.value)}
                  placeholder="Ex: Salon Baie Vitrée"
                  className={`w-full p-2.5 rounded-xl border focus:outline-none focus:border-[#D4AF37] ${
                    isLight ? 'border-slate-300 bg-slate-50 text-slate-900' : 'border-white/10 bg-black/20 text-white'
                  }`}
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className={isLight ? 'text-slate-600 font-medium' : 'text-zinc-400'}>Allège (mm)</span>
                    <div className="flex gap-1 text-[10px]">
                      <button type="button" onClick={() => setSurveyAllege(0)} className="text-[#D4AF37]">0</button>
                      <button type="button" onClick={() => setSurveyAllege(900)} className="hover:text-white">900</button>
                      <button type="button" onClick={() => setSurveyAllege(1000)} className="hover:text-white">1000</button>
                    </div>
                  </div>
                  <input
                    type="number"
                    value={surveyAllege}
                    onChange={(e) => setSurveyAllege(parseInt(e.target.value) || 0)}
                    className={`w-full p-2.5 rounded-xl border focus:outline-none focus:border-[#D4AF37] ${
                      isLight ? 'border-slate-300 bg-slate-50 text-slate-900' : 'border-white/10 bg-black/20 text-white'
                    }`}
                  />
                </div>

                <div className="space-y-1">
                  <label className={`text-[11px] block ${isLight ? 'text-slate-600 font-medium' : 'text-zinc-400'}`}>
                    Quantité
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={surveyQty}
                    onChange={(e) => setSurveyQty(parseInt(e.target.value) || 1)}
                    className={`w-full p-2.5 rounded-xl border focus:outline-none focus:border-[#D4AF37] ${
                      isLight ? 'border-slate-300 bg-slate-50 text-slate-900' : 'border-white/10 bg-black/20 text-white'
                    }`}
                  />
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddToSurveyModal(false)}
                  className={`w-1/3 py-3 rounded-2xl border cursor-pointer min-h-[48px] ${
                    isLight
                      ? 'border-slate-300 text-slate-700 hover:bg-slate-100'
                      : 'border-white/10 text-zinc-400 hover:text-white'
                  }`}
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={handleConfirmAddToSurvey}
                  className="w-2/3 py-3 rounded-2xl bg-gradient-to-r from-[#C5A880] to-[#D4AF37] text-slate-950 font-bold flex items-center justify-center gap-1.5 cursor-pointer min-h-[48px] shadow-lg hover:brightness-110 active:scale-98 transition-all"
                >
                  <Check className="w-4 h-4" />
                  <span>Enregistrer dans le Carnet</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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

      {/* ROLLER SHUTTER MOTOR WIRING & LIMIT SWITCH MODAL */}
      {isMotorModalOpen && (
        <RollerShutterMotorModal
          isOpen={isMotorModalOpen}
          onClose={() => setIsMotorModalOpen(false)}
          initialWidth={config.width}
          initialHeight={config.height}
        />
      )}

      {/* ROLLER SHUTTER WINDING & BOX CLEARANCE MODAL */}
      {isWindingModalOpen && (
        <RollerShutterWindingModal
          isOpen={isWindingModalOpen}
          onClose={() => setIsWindingModalOpen(false)}
          initialWidth={config.width}
          initialHeight={config.height}
          windowReference={`Baie ${config.width}x${config.height} ${config.profileSystem}`}
          wilayaName={selectedWilaya}
          clientName="Client Projet"
        />
      )}

      {/* ACOUSTIC SOUND INSULATION & TRAFFIC NOISE MODAL */}
      {isAcousticModalOpen && (
        <AcousticInsulationModal
          isOpen={isAcousticModalOpen}
          onClose={() => setIsAcousticModalOpen(false)}
          initialWidth={config.width}
          initialHeight={config.height}
          windowReference={`Baie ${config.width}x${config.height} ${config.profileSystem}`}
          wilayaName={selectedWilaya}
          clientName="Client Projet"
        />
      )}

      {/* CURTAIN WALL STRUCTURAL & WIND DEFLECTION MODAL */}
      {isCurtainWallModalOpen && (
        <CurtainWallStructuralModal
          isOpen={isCurtainWallModalOpen}
          onClose={() => setIsCurtainWallModalOpen(false)}
          initialFloorHeight={Math.max(config.height, 2800)}
          initialMullionSpacing={Math.max(Math.round(config.width / 2), 1200)}
          facadeReference={`Façade ${config.width}x${config.height} ${config.profileSystem}`}
          wilayaName={selectedWilaya}
          clientName="Client Projet"
        />
      )}

      {/* SEISMIC JOINERY & INTER-STORY DRIFT SAFETY MODAL */}
      {isSeismicModalOpen && (
        <SeismicJoineryModal
          isOpen={isSeismicModalOpen}
          onClose={() => setIsSeismicModalOpen(false)}
          initialWidth={config.width}
          initialHeight={config.height}
          windowReference={`Baie ${config.width}x${config.height} ${config.profileSystem}`}
          wilayaName={selectedWilaya}
          clientName="Client Projet"
        />
      )}

      {/* BIFOLD ACCORDION DOOR MECHANICAL & PMR THRESHOLD MODAL */}
      {isBifoldModalOpen && (
        <BifoldDoorModal
          isOpen={isBifoldModalOpen}
          onClose={() => setIsBifoldModalOpen(false)}
          initialWidth={config.width}
          initialHeight={config.height}
          windowReference={`Baie ${config.width}x${config.height} ${config.profileSystem}`}
          wilayaName={selectedWilaya}
          clientName="Client Projet"
        />
      )}

      {/* LOUVER & SUNSHADE AERODYNAMIC & PRESSURE DROP MODAL */}
      {isLouverModalOpen && (
        <LouverAerodynamicsModal
          isOpen={isLouverModalOpen}
          onClose={() => setIsLouverModalOpen(false)}
          initialWidth={config.width}
          initialHeight={config.height}
          windowReference={`Grille ${config.width}x${config.height} ${config.profileSystem}`}
          wilayaName={selectedWilaya}
          clientName="Client Projet"
        />
      )}

      {/* MULTI-POINT ESPAGNOLETTE LOCKING & BURGLARY RESISTANCE MODAL */}
      {isSecurityModalOpen && (
        <SecurityLockingModal
          isOpen={isSecurityModalOpen}
          onClose={() => setIsSecurityModalOpen(false)}
          initialWidth={config.width}
          initialHeight={config.height}
          windowReference={`Châssis ${config.width}x${config.height} ${config.profileSystem}`}
          wilayaName={selectedWilaya}
          clientName="Client Projet"
        />
      )}

      {/* STRUCTURAL SILICONE GLAZING (VEC / VEP) MODAL */}
      {isStructuralGlazingModalOpen && (
        <StructuralGlazingModal
          isOpen={isStructuralGlazingModalOpen}
          onClose={() => setIsStructuralGlazingModalOpen(false)}
          initialWidth={config.width}
          initialHeight={config.height}
          windowReference={`VEC ${config.width}x${config.height} ${config.profileSystem}`}
          wilayaName={selectedWilaya}
          clientName="Client Projet"
        />
      )}

      {/* INTEGRATED BLIND IN INSULATED GLAZING MODAL */}
      {isIntegratedBlindModalOpen && (
        <IntegratedBlindModal
          isOpen={isIntegratedBlindModalOpen}
          onClose={() => setIsIntegratedBlindModalOpen(false)}
          initialWidth={config.width}
          initialHeight={config.height}
          windowReference={`Store Intégré ${config.width}x${config.height} ${config.profileSystem}`}
          wilayaName={selectedWilaya}
          clientName="Client Projet"
        />
      )}

      {/* WINDOW DRAINAGE & WATER EVACUATION MODAL */}
      {isDrainageModalOpen && (
        <WindowDrainageModal
          isOpen={isDrainageModalOpen}
          onClose={() => setIsDrainageModalOpen(false)}
          initialWidth={config.width}
          initialHeight={config.height}
          windowReference={`Drainage ${config.width}x${config.height} ${config.profileSystem}`}
          wilayaName={selectedWilaya}
          clientName="Client Projet"
        />
      )}

      {/* CORNER JOINT CRIMPING & CLEAT RESISTANCE MODAL */}
      {isCornerCrimpingModalOpen && (
        <CornerCrimpingModal
          isOpen={isCornerCrimpingModalOpen}
          onClose={() => setIsCornerCrimpingModalOpen(false)}
          initialWidth={config.width}
          initialHeight={config.height}
          windowReference={`Onglet ${config.width}x${config.height} ${config.profileSystem}`}
          wilayaName={selectedWilaya}
          clientName="Client Projet"
        />
      )}

      {/* HANDLE ERGONOMICS & OPERATING FORCES PMR MODAL */}
      {isHandleErgonomicsModalOpen && (
        <HandleErgonomicsModal
          isOpen={isHandleErgonomicsModalOpen}
          onClose={() => setIsHandleErgonomicsModalOpen(false)}
          initialWidth={config.width}
          initialHeight={config.height}
          windowReference={`Poignée ${config.width}x${config.height} ${config.profileSystem}`}
          wilayaName={selectedWilaya}
          clientName="Client Projet"
        />
      )}

      {/* FRICTION STAY & PROJECTING WINDOW SASH SAFETY MODAL */}
      {isFrictionStayModalOpen && (
        <FrictionStayModal
          isOpen={isFrictionStayModalOpen}
          onClose={() => setIsFrictionStayModalOpen(false)}
          initialWidth={config.width}
          initialHeight={config.height}
          windowReference={`Compas ${config.width}x${config.height} ${config.profileSystem}`}
          wilayaName={selectedWilaya}
          clientName="Client Projet"
        />
      )}

      {/* ARCHITECTURAL BRISE-SOLEIL & CANTILEVER BRACKET STRUCTURAL MODAL */}
      {isBriseSoleilModalOpen && (
        <BriseSoleilModal
          isOpen={isBriseSoleilModalOpen}
          onClose={() => setIsBriseSoleilModalOpen(false)}
          initialWidth={config.width}
          projectReference={`Brise-Soleil ${config.width}x${config.height} ${config.profileSystem}`}
          wilayaName={selectedWilaya}
          clientName="Client Projet"
        />
      )}

      {/* NATURAL SMOKE & HEAT EXHAUST VENTILATOR (DENFC) MODAL */}
      {isSmokeVentModalOpen && (
        <SmokeVentilationModal
          isOpen={isSmokeVentModalOpen}
          onClose={() => setIsSmokeVentModalOpen(false)}
          initialWidth={config.width}
          initialHeight={config.height}
          projectReference={`DENFC ${config.width}x${config.height} ${config.profileSystem}`}
          wilayaName={selectedWilaya}
          clientName="Client Projet"
        />
      )}
    </div>
  );
};

export default MobileConfiguratorScreen;
