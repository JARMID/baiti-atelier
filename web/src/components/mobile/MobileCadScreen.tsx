import React, { useState, useMemo } from 'react';
import { useConfigStore } from '../../store/configStore';
import {
  Plus,
  Minus,
  Grid,
  Layers,
  FileText,
  Download,
  FlipHorizontal,
  MessageCircle,
  ShieldCheck,
  Scissors,
  ClipboardList,
  Check,
  X,
  FileCheck,
  LayoutTemplate,
  Sliders,
  Volume2,
  PackageCheck,
  Wrench,
  Sparkles,
  Flame,
  Wind,
  Disc,
  Waves,
  Building2,
  Activity,
  Lock,
  Box,
  Sun,
  Droplets,
  Hand,
  Anchor,
  Scale,
} from 'lucide-react';
import { playTactileClick, playSwitchSound, playClampSound } from '../../utils/audioFeedback';
import {
  generateWorkshopCutSheetPdf,
  generateDtrThermalCertificatePdf,
  generateGlazierCuttingOrderPdf,
  generateHardwarePickListPdf,
} from '../../utils/pdfGenerator';
import { computeCadCells, computeDetailedBOM } from '../../utils/cadEngine';
import type { CadStructure, CellType } from '../../types/cad';
import type { GlassType } from '../../types/window';
import { ProfileCrossSectionViewer } from '../cad/ProfileCrossSectionViewer';
import { GlazingPerformanceMatrix } from './GlazingPerformanceMatrix';
import { GlazingBeadGuideModal } from './GlazingBeadGuideModal';
import { GlazingThermalStressModal } from './GlazingThermalStressModal';
import { FastenerSafetyModal } from './FastenerSafetyModal';
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
import { RollerShutterWindModal } from './RollerShutterWindModal';
import { PerimeterSealantModal } from './PerimeterSealantModal';
import { GlassBalustradeModal } from './GlassBalustradeModal';
import { BioclimaticPergolaModal } from './BioclimaticPergolaModal';
import { SolarSunshadeModal } from './SolarSunshadeModal';
import { SlidingCarriageModal } from './SlidingCarriageModal';
import type { MobileNavTab } from './MobileBottomNavigation';
import {
  GLASS_LIST,
  getGlassSpec,
  getEffectiveUg,
  getEffectiveRw,
  formatAcousticRating,
  formatThermalRating,
  type SpacerType,
} from '../../utils/glassSpecifications';

const CELL_TYPE_CONFIG: {
  type: CellType;
  labelFr: string;
  sub: string;
  color: string;
}[] = [
  { type: 'glass_fixed', labelFr: 'Vitrage Fixe', sub: 'Châssis dormant', color: 'text-sky-400' },
  { type: 'sash_slide', labelFr: 'Coulissant', sub: 'Vantail sur rail', color: 'text-emerald-400' },
  { type: 'sash_tilt_turn', labelFr: 'Oscillo-Battant', sub: 'Double manœuvre', color: 'text-cyan-400' },
  { type: 'sash_left', labelFr: 'Ouvrant G', sub: 'Ferré à gauche', color: 'text-amber-400' },
  { type: 'sash_right', labelFr: 'Ouvrant D', sub: 'Ferré à droite', color: 'text-amber-400' },
  { type: 'panel_solid', labelFr: 'Panneau Opaque', sub: 'Sandwich alu/pvc', color: 'text-zinc-300' },
];

const HARDWARE_CAT_CONFIG: Record<
  string,
  { label: string; badgeClass: string }
> = {
  assemblage: { label: 'Assemblage', badgeClass: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
  etancheite: { label: 'Étanchéité', badgeClass: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
  fermeture: { label: 'Fermeture', badgeClass: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
  rotation: { label: 'Rotation', badgeClass: 'bg-purple-500/10 text-purple-400 border-purple-500/20' },
  drainage: { label: 'Drainage', badgeClass: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' },
  fixation: { label: 'Fixation', badgeClass: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20' },
};

interface CadTemplatePreset {
  id: string;
  name: string;
  sub: string;
  verticalDividers: (width: number) => number[];
  horizontalDividers: (height: number) => number[];
  cellTypes: (width: number, height: number) => Record<string, CellType>;
}

const CAD_TEMPLATE_PRESETS: CadTemplatePreset[] = [
  {
    id: 'slide_2v',
    name: '2V Coulissant',
    sub: 'Classique 2 vantaux',
    verticalDividers: (w) => [Math.round(w / 2)],
    horizontalDividers: () => [],
    cellTypes: () => ({
      '0-0': 'sash_slide',
      '0-1': 'sash_slide',
    }),
  },
  {
    id: 'frappe_1v',
    name: '1V Frappe OB',
    sub: 'Oscillo-battant 1 vantail',
    verticalDividers: () => [],
    horizontalDividers: () => [],
    cellTypes: () => ({
      '0-0': 'sash_tilt_turn',
    }),
  },
  {
    id: 'frappe_2v',
    name: '2V Battant (G+D)',
    sub: 'Ouvrant à la française',
    verticalDividers: (w) => [Math.round(w / 2)],
    horizontalDividers: () => [],
    cellTypes: () => ({
      '0-0': 'sash_left',
      '0-1': 'sash_right',
    }),
  },
  {
    id: 'slide_2v_imposte',
    name: '2V + Imposte Fixe',
    sub: 'Imposte vitrée 450mm',
    verticalDividers: (w) => [Math.round(w / 2)],
    horizontalDividers: (h) => [Math.max(300, h - 450)],
    cellTypes: () => ({
      '0-0': 'sash_slide',
      '0-1': 'sash_slide',
      '1-0': 'glass_fixed',
      '1-1': 'glass_fixed',
    }),
  },
  {
    id: 'slide_3v',
    name: '3V Coulissant',
    sub: 'Grande baie 3 vantaux',
    verticalDividers: (w) => [Math.round(w / 3), Math.round((2 * w) / 3)],
    horizontalDividers: () => [],
    cellTypes: () => ({
      '0-0': 'sash_slide',
      '0-1': 'sash_slide',
      '0-2': 'sash_slide',
    }),
  },
  {
    id: 'porte_soubassement',
    name: 'Porte + Allège Opaque',
    sub: 'Panneau sandwich 900mm',
    verticalDividers: (w) => [Math.round(w / 2)],
    horizontalDividers: (h) => [Math.min(Math.max(400, h - 400), 900)],
    cellTypes: () => ({
      '0-0': 'panel_solid',
      '0-1': 'panel_solid',
      '1-0': 'sash_left',
      '1-1': 'sash_right',
    }),
  },
  {
    id: 'chassis_4v_mixte',
    name: '4V (2 Fixes + 2 Coul.)',
    sub: 'Fixes latéraux + coulissants',
    verticalDividers: (w) => [Math.round(w / 4), Math.round(w / 2), Math.round((3 * w) / 4)],
    horizontalDividers: () => [],
    cellTypes: () => ({
      '0-0': 'glass_fixed',
      '0-1': 'sash_slide',
      '0-2': 'sash_slide',
      '0-3': 'glass_fixed',
    }),
  },
];

interface MobileCadScreenProps {
  onNavigateTab?: (tab: MobileNavTab) => void;
}

export const MobileCadScreen: React.FC<MobileCadScreenProps> = ({ onNavigateTab }) => {
  const { config, language, theme, selectedWilaya, setGlassType, setSpacerType } = useConfigStore();
  const isLight = theme === 'light';
  const isRtl = language === 'ar';

  const activeSpacer: SpacerType = config.spacerType || 'standard_alu';
  const currentGlassSpec = useMemo(() => getGlassSpec(config.glassType), [config.glassType]);
  const effectiveUg = useMemo(() => getEffectiveUg(config.glassType, activeSpacer), [config.glassType, activeSpacer]);
  const effectiveRw = useMemo(() => getEffectiveRw(config.glassType, activeSpacer), [config.glassType, activeSpacer]);
  const acousticRating = useMemo(() => formatAcousticRating(effectiveRw), [effectiveRw]);
  const thermalRating = useMemo(() => formatThermalRating(effectiveUg), [effectiveUg]);

  // Parametric CAD Dividers & Types
  const [gridState, setGridState] = useState<{
    verticalDividers: number[];
    horizontalDividers: number[];
    cellTypes: Record<string, CellType>;
  }>(() => ({
    verticalDividers: [Math.round(config.width / 2)],
    horizontalDividers: [],
    cellTypes: {
      '0-0': 'sash_slide',
      '0-1': 'sash_slide',
    },
  }));

  const [rawSelectedCellKey, setRawSelectedCellKey] = useState<string>('0-0');
  const [activePresetId, setActivePresetId] = useState<string>('slide_2v');
  const [isGeneratingCutSheet, setIsGeneratingCutSheet] = useState(false);
  const [isGeneratingDtrPdf, setIsGeneratingDtrPdf] = useState(false);
  const [isGeneratingGlazierPdf, setIsGeneratingGlazierPdf] = useState(false);
  const [isGeneratingHardwarePdf, setIsGeneratingHardwarePdf] = useState(false);
  const [activeBomTab, setActiveBomTab] = useState<'cuts' | 'glasses' | 'hardware'>('cuts');
  const [glassViewMode, setGlassViewMode] = useState<'matrix' | 'cuts'>('matrix');
  const [showCrossSectionModal, setShowCrossSectionModal] = useState(false);
  const [showParcloseModal, setShowParcloseModal] = useState(false);
  const [showThermalStressModal, setShowThermalStressModal] = useState(false);
  const [showFastenersModal, setShowFastenersModal] = useState(false);
  const [showWindingModal, setShowWindingModal] = useState(false);
  const [showAcousticModal, setShowAcousticModal] = useState(false);
  const [showCurtainWallModal, setShowCurtainWallModal] = useState(false);
  const [showSeismicModal, setShowSeismicModal] = useState(false);
  const [showBifoldModal, setShowBifoldModal] = useState(false);
  const [showLouverModal, setShowLouverModal] = useState(false);
  const [showSecurityModal, setShowSecurityModal] = useState(false);
  const [showStructuralGlazingModal, setShowStructuralGlazingModal] = useState(false);
  const [showIntegratedBlindModal, setShowIntegratedBlindModal] = useState(false);
  const [showDrainageModal, setShowDrainageModal] = useState(false);
  const [showCornerCrimpingModal, setShowCornerCrimpingModal] = useState(false);
  const [showHandleErgonomicsModal, setShowHandleErgonomicsModal] = useState(false);
  const [showFrictionStayModal, setShowFrictionStayModal] = useState(false);
  const [showBriseSoleilModal, setShowBriseSoleilModal] = useState(false);
  const [showSmokeVentModal, setShowSmokeVentModal] = useState(false);
  const [showShutterWindModal, setShowShutterWindModal] = useState(false);
  const [showSealantModal, setShowSealantModal] = useState(false);
  const [showBalustradeModal, setShowBalustradeModal] = useState(false);
  const [showBioclimaticPergolaModal, setShowBioclimaticPergolaModal] = useState(false);
  const [showSolarSunshadeModal, setShowSolarSunshadeModal] = useState(false);
  const [showSlidingCarriageModal, setShowSlidingCarriageModal] = useState(false);

  // Field Survey Modal State
  const [showAddToSurveyModal, setShowAddToSurveyModal] = useState(false);
  const [surveyRoomName, setSurveyRoomName] = useState('Façade - Baie Composée');
  const [surveyAllege, setSurveyAllege] = useState<number>(0);
  const [surveyQty, setSurveyQty] = useState<number>(1);
  const [surveyToastMessage, setSurveyToastMessage] = useState<string | null>(null);

  // Derived CAD Structure with current config dimensions
  const cadStructure: CadStructure = useMemo(() => ({
    width: config.width,
    height: config.height,
    verticalDividers: gridState.verticalDividers,
    horizontalDividers: gridState.horizontalDividers,
    cellTypes: gridState.cellTypes,
  }), [config.width, config.height, gridState]);

  // Derived CAD cells & Workshop Bill of Materials
  const cells = useMemo(() => computeCadCells(cadStructure), [cadStructure]);
  const bom = useMemo(() => computeDetailedBOM(cadStructure, config), [cadStructure, config]);

  // Active cell resolved safely
  const selectedCellKey = cells.some((c) => `${c.row}-${c.col}` === rawSelectedCellKey)
    ? rawSelectedCellKey
    : `${cells[0]?.row ?? 0}-${cells[0]?.col ?? 0}`;

  const activeCell = useMemo(() => {
    return cells.find((c) => `${c.row}-${c.col}` === selectedCellKey) || cells[0] || null;
  }, [cells, selectedCellKey]);

  // Vertical Mullions (+ / - Meneaux)
  const handleAddMullion = () => {
    playTactileClick();
    const currentCount = cadStructure.verticalDividers.length;
    if (currentCount >= 3) return; // Max 4 bays on mobile

    const newBayCount = currentCount + 2;
    const step = Math.round(cadStructure.width / newBayCount);
    const newDividers: number[] = [];
    for (let i = 1; i < newBayCount; i++) {
      newDividers.push(step * i);
    }

    setGridState((prev) => {
      const nextCellTypes = { ...prev.cellTypes };
      // Default new cells to sliding or fixed
      for (let r = 0; r <= prev.horizontalDividers.length; r++) {
        for (let c = 0; c < newBayCount; c++) {
          const k = `${r}-${c}`;
          if (!nextCellTypes[k]) nextCellTypes[k] = 'sash_slide';
        }
      }
      return {
        ...prev,
        verticalDividers: newDividers,
        cellTypes: nextCellTypes,
      };
    });
  };

  const handleRemoveMullion = () => {
    playTactileClick();
    const currentCount = cadStructure.verticalDividers.length;
    if (currentCount <= 0) return;

    if (currentCount === 1) {
      // Back to 1 single bay
      setGridState((prev) => ({
        ...prev,
        verticalDividers: [],
      }));
      return;
    }

    const newBayCount = currentCount;
    const step = Math.round(cadStructure.width / newBayCount);
    const newDividers: number[] = [];
    for (let i = 1; i < newBayCount; i++) {
      newDividers.push(step * i);
    }

    setGridState((prev) => ({
      ...prev,
      verticalDividers: newDividers,
    }));
  };

  // Horizontal Transom (+ / - Traverse Imposte)
  const handleToggleTransom = () => {
    playTactileClick();
    if (cadStructure.horizontalDividers.length > 0) {
      // Remove transom
      setGridState((prev) => ({
        ...prev,
        horizontalDividers: [],
      }));
    } else {
      // Add transom at 450mm from top (imposte)
      const transomY = Math.max(300, cadStructure.height - 450);
      setGridState((prev) => {
        const nextTypes = { ...prev.cellTypes };
        // Upper row defaults to fixed glass
        for (let c = 0; c <= prev.verticalDividers.length; c++) {
          nextTypes[`1-${c}`] = 'glass_fixed';
        }
        return {
          ...prev,
          horizontalDividers: [transomY],
          cellTypes: nextTypes,
        };
      });
    }
  };

  const handleApplyTemplatePreset = (preset: CadTemplatePreset) => {
    playClampSound();
    setActivePresetId(preset.id);
    const vDividers = preset.verticalDividers(config.width);
    const hDividers = preset.horizontalDividers(config.height);
    const types = preset.cellTypes(config.width, config.height);

    setGridState({
      verticalDividers: vDividers,
      horizontalDividers: hDividers,
      cellTypes: types,
    });
    setRawSelectedCellKey('0-0');
  };

  const handleAdjustTransomHeight = (deltaMm: number) => {
    playTactileClick();
    if (cadStructure.horizontalDividers.length === 0) return;
    const currentY = cadStructure.horizontalDividers[0];
    const newY = Math.min(Math.max(250, currentY + deltaMm), config.height - 250);
    setGridState((prev) => ({
      ...prev,
      horizontalDividers: [newY],
    }));
  };

  const handleSetTransomAbsoluteHeight = (targetY: number) => {
    playClampSound();
    const clampedY = Math.min(Math.max(250, targetY), config.height - 250);
    setGridState((prev) => ({
      ...prev,
      horizontalDividers: [clampedY],
    }));
  };

  // Symmetrical Inversion / Mirror Blueprint
  const handleMirrorBlueprint = () => {
    playClampSound();
    setGridState((prev) => {
      const numCols = prev.verticalDividers.length + 1;
      const numRows = prev.horizontalDividers.length + 1;
      const newCellTypes: Record<string, CellType> = {};

      for (let r = 0; r < numRows; r++) {
        for (let c = 0; c < numCols; c++) {
          const oldKey = `${r}-${c}`;
          const mirroredCol = numCols - 1 - c;
          const newKey = `${r}-${mirroredCol}`;
          let cellType = prev.cellTypes[oldKey] || 'glass_fixed';
          if (cellType === 'sash_left') cellType = 'sash_right';
          else if (cellType === 'sash_right') cellType = 'sash_left';
          newCellTypes[newKey] = cellType;
        }
      }

      const newVertDividers = prev.verticalDividers
        .map((x) => config.width - x)
        .sort((a, b) => a - b);

      return {
        ...prev,
        verticalDividers: newVertDividers,
        cellTypes: newCellTypes,
      };
    });
  };

  // Download SVG Blueprint
  const handleDownloadSvgPlan = () => {
    playTactileClick();
    const svgEl = document.getElementById('mobile-cad-blueprint-svg');
    if (!svgEl) return;
    const serializer = new XMLSerializer();
    const source = serializer.serializeToString(svgEl);
    const blob = new Blob([source], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `plan_cao_${config.width}x${config.height}mm_${new Date().toISOString().slice(0, 10)}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Share Glass Cut Sheet to Glazier via WhatsApp
  const handleShareGlassWhatsApp = () => {
    playTactileClick();
    if (!bom.glasses || bom.glasses.length === 0) return;
    const glassListText = bom.glasses
      .map(
        (g, idx) =>
          `  ${idx + 1}. ${g.label} : ${g.widthMm} × ${g.heightMm} mm (×${g.quantity}) • ${g.areaM2} m² [AA]`
      )
      .join('\n');
    const msg =
      `*COMMANDE VITRAGE & MIROITERIE*\n` +
      `Châssis CAO : ${cadStructure.width} × ${cadStructure.height} mm (${config.profileSystem})\n` +
      `Composition : ${currentGlassSpec.labelFr} (${currentGlassSpec.tradeFormula})\n` +
      `Intercalaire : ${activeSpacer === 'warm_edge' ? 'Warm-Edge Composite Hybride' : 'Aluminium Standard 16mm'}\n` +
      `Performance : Ug = ${effectiveUg} W/m²K • Rw = ${effectiveRw} dB (${acousticRating.noiseDropRatio})\n` +
      `Wilaya : ${selectedWilaya}\n` +
      `Nombre de vitrages : ${bom.glasses.length} volumes (${bom.totalGlassAreaM2.toFixed(2)} m²)\n\n` +
      `*Détail Découpe Verre (Tolérance ±1.0 mm, Arêtes Abattues) :*\n` +
      `${glassListText}\n\n` +
      `Conçu sur https://web-two-tan-31.vercel.app`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
  };

  // Download Official Glazier Procurement Order PDF
  const handleDownloadGlazierPdf = async () => {
    playTactileClick();
    if (!bom.glasses || bom.glasses.length === 0) return;
    setIsGeneratingGlazierPdf(true);
    try {
      const items = bom.glasses.map((g, idx) => ({
        id: g.id || `vit_cad_${idx + 1}`,
        label: g.label,
        widthMm: g.widthMm,
        heightMm: g.heightMm,
        glassType: `${currentGlassSpec.tradeFormula} (${activeSpacer === 'warm_edge' ? 'Warm-Edge' : 'Alu 16mm'})`,
        quantity: g.quantity,
        areaM2: g.areaM2,
        edgeFinish: 'Arêtes abattues (AA)',
      }));

      await generateGlazierCuttingOrderPdf({
        projectTitle: `Châssis CAO ${cadStructure.width}×${cadStructure.height} mm`,
        clientName: 'Client Atelier CAO',
        clientPhone: '+213 550 00 00 00',
        wilaya: selectedWilaya,
        items,
      });
    } finally {
      setIsGeneratingGlazierPdf(false);
    }
  };

  // Share Hardware Pick List to Stockroom or Supplier via WhatsApp
  const handleShareHardwareWhatsApp = () => {
    playTactileClick();
    if (!bom.hardwareSummary || bom.hardwareSummary.length === 0) return;
    const totalDzd = bom.hardwareSummary.reduce((sum, h) => sum + h.totalPriceDzd, 0);
    const hwListText = bom.hardwareSummary
      .map(
        (h, idx) =>
          `  ${idx + 1}. [${h.referenceCode}] ${h.name} : ${h.quantity} ${h.unit} (${h.stockBin || 'BAC'})`
      )
      .join('\n');
    const msg =
      `*BON DE SORTIE QUINCAILLERIE & ACCESSOIRES*\n` +
      `Châssis CAO : ${cadStructure.width} × ${cadStructure.height} mm (${config.profileSystem})\n` +
      `Finition : ${config.finishColor || 'RAL 7016'}\n` +
      `Wilaya : ${selectedWilaya}\n` +
      `Nombre d'articles : ${bom.hardwareSummary.length} références\n` +
      `Valeur estimée : ${totalDzd.toLocaleString('fr-DZ')} DZD\n\n` +
      `*Liste des Accessoires à Préparer :*\n` +
      `${hwListText}\n\n` +
      `Conçu sur https://web-two-tan-31.vercel.app`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
  };

  // Download Official Hardware Pick List PDF
  const handleDownloadHardwarePdf = async () => {
    playTactileClick();
    if (!bom.hardwareSummary || bom.hardwareSummary.length === 0) return;
    setIsGeneratingHardwarePdf(true);
    try {
      await generateHardwarePickListPdf({
        projectTitle: `Châssis CAO ${cadStructure.width}×${cadStructure.height} mm`,
        clientName: 'Atelier Menuiserie',
        clientPhone: '+213 550 00 00 00',
        wilaya: selectedWilaya,
        profileSystem: config.profileSystem,
        finishColor: config.finishColor,
        widthMm: cadStructure.width,
        heightMm: cadStructure.height,
        items: bom.hardwareSummary,
      });
    } finally {
      setIsGeneratingHardwarePdf(false);
    }
  };

  // Set cell opening type
  const handleSelectCellType = (type: CellType) => {
    if (!activeCell) return;
    playSwitchSound();
    const key = `${activeCell.row}-${activeCell.col}`;
    setGridState((prev) => ({
      ...prev,
      cellTypes: {
        ...prev.cellTypes,
        [key]: type,
      },
    }));
  };

  // SVG Scaled Viewport Metrics
  const svgW = 500;
  const svgH = 380;
  const pad = 40;
  const scale = Math.min((svgW - pad * 2) / cadStructure.width, (svgH - pad * 2) / cadStructure.height);
  const drawW = cadStructure.width * scale;
  const drawH = cadStructure.height * scale;
  const startX = (svgW - drawW) / 2;
  const startY = (svgH - drawH) / 2;

  // PDF Cut Sheet Export
  const handleExportCutSheet = () => {
    playClampSound();
    setIsGeneratingCutSheet(true);
    try {
      generateWorkshopCutSheetPdf(cadStructure, config, bom);
    } catch {
      // Handled
    } finally {
      setIsGeneratingCutSheet(false);
    }
  };

  // PDF DTR C3-2 Certificate Export
  const handleExportDtrPdf = async () => {
    playClampSound();
    setIsGeneratingDtrPdf(true);
    try {
      await generateDtrThermalCertificatePdf({
        projectTitle: `Chantier CAO ${selectedWilaya} - ${config.width}x${config.height}mm`,
        clientName: 'Client Particulier',
        wilayaName: selectedWilaya,
        widthMm: config.width,
        heightMm: config.height,
        openingType: config.openingType,
        profileSystem: config.profileSystem,
        glassType: config.glassType,
        glassAreaM2: bom.totalGlassAreaM2,
      });
    } finally {
      setIsGeneratingDtrPdf(false);
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

    // Estimate total price based on detailed BOM
    const estimatedCostDzd = Math.round(
      bom.totalProfileWeightKg * 850 + bom.totalGlassAreaM2 * 5500 + 15000
    );

    const newItem = {
      id: `op_cad_${Date.now()}`,
      roomName: surveyRoomName.trim() || 'Châssis CAO 2D',
      width: cadStructure.width,
      height: cadStructure.height,
      allegeMm: surveyAllege,
      openingType: config.openingType,
      profileSystem: config.profileSystem,
      glassType: config.glassType,
      shutterType: config.shutterType,
      quantity: Math.max(1, surveyQty),
      estimatedUnitPriceDzd: estimatedCostDzd,
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
    setSurveyToastMessage(`${surveyRoomName} (${cadStructure.width}×${cadStructure.height} mm) ajouté au carnet !`);
    setTimeout(() => setSurveyToastMessage(null), 3500);
  };

  const handleSendToCuttingOptimizer = () => {
    playClampSound();
    if (typeof window !== 'undefined') {
      try {
        const cadDemands = bom.cuts.map((c, idx) => ({
          id: `cad_cut_${idx + 1}`,
          length: c.lengthMm,
          quantity: c.quantity,
          miterLeft: c.cutLeftAngle,
          miterRight: c.cutRightAngle,
          label: `${c.label} (${c.role})`,
          profileCode: c.role.includes('dormant') ? 'DORMANT-45' : 'OUVRANT-45',
        }));
        localStorage.setItem('baiti_cad_active_demands', JSON.stringify(cadDemands));
        window.dispatchEvent(new Event('storage'));
      } catch {
        // Handled
      }
    }
    if (onNavigateTab) {
      onNavigateTab('cutting');
    }
  };

  const bayCount = cadStructure.verticalDividers.length + 1;
  const hasTransom = cadStructure.horizontalDividers.length > 0;

  return (
    <div className="pb-36 px-3 sm:px-6 pt-2 max-w-xl md:max-w-2xl mx-auto space-y-4" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* 0. ARCHITECTURAL COMPOSITION TEMPLATES */}
      <div className="space-y-1.5 font-mono">
        <div className="flex items-center justify-between text-[11px] px-1">
          <span className="flex items-center gap-1.5 font-bold text-[#D4AF37]">
            <LayoutTemplate className="w-3.5 h-3.5" />
            <span>Modèles de Châssis Fréquents</span>
          </span>
          <span className="text-[10px] text-zinc-500">1-tap pour charger</span>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 text-xs">
          {CAD_TEMPLATE_PRESETS.map((tmpl) => {
            const isSelected = activePresetId === tmpl.id;
            return (
              <button
                key={tmpl.id}
                type="button"
                onClick={() => handleApplyTemplatePreset(tmpl)}
                className={`px-3 py-2 rounded-2xl border text-left shrink-0 cursor-pointer transition-all min-h-[42px] ${
                  isSelected
                    ? 'bg-[#D4AF37] text-slate-950 font-bold border-[#D4AF37] shadow-sm'
                    : isLight
                    ? 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                    : 'bg-[#0B0F19] border-white/10 text-zinc-300 hover:bg-white/10'
                }`}
              >
                <div className="font-bold text-[11px] leading-tight">{tmpl.name}</div>
                <div className="text-[9px] opacity-75 leading-tight">{tmpl.sub}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 1. CAD CONTROLS BAR (+ MENEAUX / + TRAVERSES) */}
      <div
        className={`p-3 rounded-2xl border shadow-sm flex items-center justify-between gap-2 font-mono text-xs ${
          isLight ? 'bg-white border-slate-200' : 'bg-[#0B0F19] border-white/10'
        }`}
      >
        {/* Mullions (+/- Meneaux) */}
        <div className="flex items-center gap-1.5">
          <span className="text-zinc-400 text-[11px] hidden sm:inline">Travées :</span>
          <div className="flex items-center gap-1 bg-black/5 dark:bg-white/5 p-1 rounded-xl border border-black/10 dark:border-white/10">
            <button
              onClick={handleRemoveMullion}
              disabled={cadStructure.verticalDividers.length === 0}
              className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-black/10 dark:hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
              title="Supprimer un meneau"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="font-bold px-1 text-center min-w-[24px] text-[#D4AF37]">
              {bayCount}V
            </span>
            <button
              onClick={handleAddMullion}
              disabled={cadStructure.verticalDividers.length >= 3}
              className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-black/10 dark:hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
              title="Ajouter un meneau vertical"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Transom (+/- Traverse) */}
        <button
          onClick={handleToggleTransom}
          className={`px-3 py-1.5 rounded-xl border flex items-center gap-1.5 transition-all cursor-pointer min-h-[36px] ${
            hasTransom
              ? 'bg-[#D4AF37] text-slate-950 font-bold border-[#D4AF37]'
              : isLight
              ? 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
              : 'bg-white/5 border-white/10 text-zinc-300 hover:bg-white/10'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>{hasTransom ? 'Imposte Active' : '+ Imposte'}</span>
        </button>

        {/* Total Cells Badge */}
        <div className="flex items-center gap-1 text-[11px] text-zinc-400">
          <Grid className="w-3.5 h-3.5 text-cyan-400" />
          <span>{cells.length} case{cells.length > 1 ? 's' : ''}</span>
        </div>
      </div>

      {/* 1B. TRANSOM DIMENSION CONTROLS */}
      {hasTransom && (
        <div
          className={`p-3 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 font-mono text-xs shadow-xs transition-all ${
            isLight ? 'bg-amber-50/80 border-amber-200 text-slate-800' : 'bg-amber-500/10 border-amber-500/25 text-amber-200'
          }`}
        >
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-[#D4AF37] shrink-0" />
            <div>
              <span className="font-bold block">
                Hauteur Traverse : {cadStructure.horizontalDividers[0]} mm (Sol) • Imposte : {config.height - cadStructure.horizontalDividers[0]} mm
              </span>
              <span className={`text-[10px] block ${isLight ? 'text-slate-600 font-medium' : 'text-zinc-400'}`}>
                Ajustez le niveau de la traverse intermédiaire
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1 self-end sm:self-auto flex-wrap">
            {/* Quick preset chips */}
            {[
              { label: '350', val: config.height - 350 },
              { label: '450', val: config.height - 450 },
              { label: '600', val: config.height - 600 },
              { label: '900', val: 900 },
            ].map((p) => (
              <button
                key={p.label}
                type="button"
                onClick={() => handleSetTransomAbsoluteHeight(p.val)}
                className={`px-2 py-1 rounded-lg border text-[10px] cursor-pointer transition-all ${
                  cadStructure.horizontalDividers[0] === p.val
                    ? 'bg-[#D4AF37] text-slate-950 font-bold border-[#D4AF37]'
                    : isLight
                    ? 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100'
                    : 'bg-white/10 border-white/10 text-zinc-300 hover:bg-white/15'
                }`}
              >
                {p.label}
              </button>
            ))}

            {/* Steppers */}
            <div className="flex items-center gap-0.5 bg-black/10 dark:bg-white/10 p-0.5 rounded-lg border border-black/10 dark:border-white/10 ml-1">
              <button
                type="button"
                onClick={() => handleAdjustTransomHeight(-50)}
                className="px-1.5 py-0.5 rounded hover:bg-black/10 dark:hover:bg-white/10 font-bold text-[10px] cursor-pointer"
                title="Abaisser de 50mm"
              >
                -50
              </button>
              <button
                type="button"
                onClick={() => handleAdjustTransomHeight(-10)}
                className="px-1.5 py-0.5 rounded hover:bg-black/10 dark:hover:bg-white/10 font-bold text-[10px] cursor-pointer"
                title="Abaisser de 10mm"
              >
                -10
              </button>
              <button
                type="button"
                onClick={() => handleAdjustTransomHeight(10)}
                className="px-1.5 py-0.5 rounded hover:bg-black/10 dark:hover:bg-white/10 font-bold text-[10px] cursor-pointer"
                title="Monter de 10mm"
              >
                +10
              </button>
              <button
                type="button"
                onClick={() => handleAdjustTransomHeight(50)}
                className="px-1.5 py-0.5 rounded hover:bg-black/10 dark:hover:bg-white/10 font-bold text-[10px] cursor-pointer"
                title="Monter de 50mm"
              >
                +50
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. DYNAMIC 2D BLUEPRINT SVG VIEWER */}
      <div
        className={`p-4 rounded-3xl border shadow-md space-y-3 ${
          isLight ? 'bg-white border-slate-200' : 'bg-[#0B0F19] border-white/10'
        }`}
      >
        <div className="flex items-center justify-between font-mono text-xs">
          <div>
            <span className="font-bold text-[#D4AF37] block">Plan CAO 2D</span>
            <span className="text-[10px] text-zinc-500">{cadStructure.width} × {cadStructure.height} mm</span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => {
                playTactileClick();
                setShowParcloseModal(true);
              }}
              className="px-2 py-1 rounded-lg bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/30 hover:bg-amber-500/20 flex items-center gap-1 text-[10px] cursor-pointer transition-all active:scale-95 text-amber-400 font-semibold"
              title="Guide des coupes d'onglet 45°, coupes 90° et grugeage des parcloses"
            >
              <Scissors className="w-3 h-3" />
              <span>Parcloses</span>
            </button>

            <button
              type="button"
              onClick={() => {
                playTactileClick();
                setShowThermalStressModal(true);
              }}
              className="px-2 py-1 rounded-lg bg-rose-500/10 dark:bg-rose-500/15 border border-rose-500/30 hover:bg-rose-500/20 flex items-center gap-1 text-[10px] cursor-pointer transition-all active:scale-95 text-rose-400 font-semibold"
              title="Audit du risque de casse par choc thermique DTU 39"
            >
              <Flame className="w-3 h-3" />
              <span>Choc Thermique</span>
            </button>

            <button
              type="button"
              onClick={() => {
                playTactileClick();
                setShowAcousticModal(true);
              }}
              className="px-2 py-1 rounded-lg bg-cyan-500/10 dark:bg-cyan-500/15 border border-cyan-500/30 hover:bg-cyan-500/20 flex items-center gap-1 text-[10px] cursor-pointer transition-all active:scale-95 text-cyan-400 font-semibold"
              title="Calcul d isolement acoustique et bruits de voirie DTR C3-3"
            >
              <Waves className="w-3 h-3" />
              <span>Acoustique</span>
            </button>

            <button
              type="button"
              onClick={() => {
                playTactileClick();
                setShowFastenersModal(true);
              }}
              className="px-2 py-1 rounded-lg bg-sky-500/10 dark:bg-sky-500/15 border border-sky-500/30 hover:bg-sky-500/20 flex items-center gap-1 text-[10px] cursor-pointer transition-all active:scale-95 text-sky-400 font-semibold"
              title="Calcul des fixations maçonnerie et résistance au vent DTU 36.5"
            >
              <Wind className="w-3 h-3" />
              <span>Fixations</span>
            </button>

            <button
              type="button"
              onClick={() => {
                playTactileClick();
                setShowWindingModal(true);
              }}
              className="px-2 py-1 rounded-lg bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/30 hover:bg-amber-500/20 flex items-center gap-1 text-[10px] cursor-pointer transition-all active:scale-95 text-amber-400 font-semibold"
              title="Calcul du diamètre d'enroulement spiralé et choix du caisson de volet"
            >
              <Disc className="w-3 h-3" />
              <span>Enroulement Volet</span>
            </button>

            <button
              type="button"
              onClick={() => {
                playTactileClick();
                setShowCurtainWallModal(true);
              }}
              className="px-2 py-1 rounded-lg bg-sky-500/10 dark:bg-sky-500/15 border border-sky-500/30 hover:bg-sky-500/20 flex items-center gap-1 text-[10px] cursor-pointer transition-all active:scale-95 text-sky-300 font-semibold"
              title="Calcul statique de montant et fleche sous vent de facade rideau DTU 33.1"
            >
              <Building2 className="w-3 h-3" />
              <span>Façade Rideau</span>
            </button>

            <button
              type="button"
              onClick={() => {
                playTactileClick();
                setShowSeismicModal(true);
              }}
              className="px-2 py-1 rounded-lg bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/30 hover:bg-amber-500/20 flex items-center gap-1 text-[10px] cursor-pointer transition-all active:scale-95 text-amber-300 font-semibold"
              title="Vérification de la dérive d étage et sécurité parasismique RPA 99 v2003"
            >
              <Activity className="w-3 h-3" />
              <span>Séisme RPA</span>
            </button>

            <button
              type="button"
              onClick={() => {
                playTactileClick();
                setShowBifoldModal(true);
              }}
              className="px-2 py-1 rounded-lg bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/30 hover:bg-amber-500/20 flex items-center gap-1 text-[10px] cursor-pointer transition-all active:scale-95 text-amber-300 font-semibold"
              title="Calcul cinématique et charges de baie accordéon NF EN 1527"
            >
              <Sliders className="w-3 h-3" />
              <span>Accordéon</span>
            </button>

            <button
              type="button"
              onClick={() => {
                playTactileClick();
                setShowLouverModal(true);
              }}
              className="px-2 py-1 rounded-lg bg-teal-500/10 dark:bg-teal-500/15 border border-teal-500/30 hover:bg-teal-500/20 flex items-center gap-1 text-[10px] cursor-pointer transition-all active:scale-95 text-teal-300 font-semibold"
              title="Calcul de section libre et perte de charge de grille à ventelles NF EN 13030"
            >
              <Wind className="w-3 h-3" />
              <span>Ventelles</span>
            </button>

            <button
              type="button"
              onClick={() => {
                playTactileClick();
                setShowSecurityModal(true);
              }}
              className="px-2 py-1 rounded-lg bg-rose-500/10 dark:bg-rose-500/15 border border-rose-500/30 hover:bg-rose-500/20 flex items-center gap-1 text-[10px] cursor-pointer transition-all active:scale-95 text-rose-300 font-semibold"
              title="Audit quincaillerie anti-effraction et classes RC1 a RC4 NF EN 1627"
            >
              <Lock className="w-3 h-3" />
              <span>Sécurité RC</span>
            </button>

            <button
              type="button"
              onClick={() => {
                playTactileClick();
                setShowStructuralGlazingModal(true);
              }}
              className="px-2 py-1 rounded-lg bg-indigo-500/10 dark:bg-indigo-500/15 border border-indigo-500/30 hover:bg-indigo-500/20 flex items-center gap-1 text-[10px] cursor-pointer transition-all active:scale-95 text-indigo-300 font-semibold"
              title="Dimensionnement collage structural VEC / VEP selon NF DTU 39 P4 et ETAG 002"
            >
              <Box className="w-3 h-3" />
              <span>VEC Silicone</span>
            </button>

            <button
              type="button"
              onClick={() => {
                playTactileClick();
                setShowIntegratedBlindModal(true);
              }}
              className="px-2 py-1 rounded-lg bg-teal-500/10 dark:bg-teal-500/15 border border-teal-500/30 hover:bg-teal-500/20 flex items-center gap-1 text-[10px] cursor-pointer transition-all active:scale-95 text-teal-300 font-semibold"
              title="Store vénitien et plissé intégré dans double vitrage NF EN 1279 / CSTB 3677"
            >
              <Sun className="w-3 h-3" />
              <span>Store Intégré</span>
            </button>

            <button
              type="button"
              onClick={() => {
                playTactileClick();
                setShowDrainageModal(true);
              }}
              className="px-2 py-1 rounded-lg bg-sky-500/10 dark:bg-sky-500/15 border border-sky-500/30 hover:bg-sky-500/20 flex items-center gap-1 text-[10px] cursor-pointer transition-all active:scale-95 text-sky-300 font-semibold"
              title="Audit drainage et étanchéité à l'eau traverse basse NF DTU 36.5 / NF EN 12208"
            >
              <Droplets className="w-3 h-3" />
              <span>Drainage Eau</span>
            </button>

            <button
              type="button"
              onClick={() => {
                playTactileClick();
                setShowCornerCrimpingModal(true);
              }}
              className="px-2 py-1 rounded-lg bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/30 hover:bg-amber-500/20 flex items-center gap-1 text-[10px] cursor-pointer transition-all active:scale-95 text-amber-300 font-semibold"
              title="Audit sertissage d onglet et résistance mécanique d équerre Eurocode 9 / NF P 20-302"
            >
              <Wrench className="w-3 h-3" />
              <span>Sertissage Angle</span>
            </button>

            <button
              type="button"
              onClick={() => {
                playTactileClick();
                setShowHandleErgonomicsModal(true);
              }}
              className="px-2 py-1 rounded-lg bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/30 hover:bg-emerald-500/20 flex items-center gap-1 text-[10px] cursor-pointer transition-all active:scale-95 text-emerald-300 font-semibold"
              title="Audit ergonomie, efforts de manœuvre et accessibilité PMR NF EN 12046-1 / Décret 06-455"
            >
              <Hand className="w-3 h-3" />
              <span>Efforts Poignée (PMR)</span>
            </button>

            <button
              type="button"
              onClick={() => {
                playTactileClick();
                setShowFrictionStayModal(true);
              }}
              className="px-2 py-1 rounded-lg bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/30 hover:bg-amber-500/20 flex items-center gap-1 text-[10px] cursor-pointer transition-all active:scale-95 text-amber-300 font-semibold"
              title="Audit compas à friction, débattement et sécurité anti-décrochement NF EN 13126-5 / RNV 2013"
            >
              <Anchor className="w-3 h-3" />
              <span>Compas Friction</span>
            </button>

            <button
              type="button"
              onClick={() => {
                playTactileClick();
                setShowBriseSoleilModal(true);
              }}
              className="px-2 py-1 rounded-lg bg-orange-500/10 dark:bg-orange-500/15 border border-orange-500/30 hover:bg-orange-500/20 flex items-center gap-1 text-[10px] cursor-pointer transition-all active:scale-95 text-orange-300 font-semibold"
              title="Audit brise-soleil architectural, consoles en porte-à-faux et vent RNV 2013 / Eurocode 9"
            >
              <Sun className="w-3 h-3" />
              <span>Brise-Soleil</span>
            </button>

            <button
              type="button"
              onClick={() => {
                playTactileClick();
                setShowSmokeVentModal(true);
              }}
              className="px-2 py-1 rounded-lg bg-rose-500/10 dark:bg-rose-500/15 border border-rose-500/30 hover:bg-rose-500/20 flex items-center gap-1 text-[10px] cursor-pointer transition-all active:scale-95 text-rose-300 font-semibold"
              title="Audit désenfumage naturel DENFC, surface utile et vérins SSI NF EN 12101-2 / Arrêté Incendie"
            >
              <Flame className="w-3 h-3" />
              <span>Désenfumage (DENFC)</span>
            </button>

            <button
              type="button"
              onClick={() => {
                playTactileClick();
                setShowShutterWindModal(true);
              }}
              className="px-2 py-1 rounded-lg bg-sky-500/10 dark:bg-sky-500/15 border border-sky-500/30 hover:bg-sky-500/20 flex items-center gap-1 text-[10px] cursor-pointer transition-all active:scale-95 text-sky-300 font-semibold"
              title="Audit tenue au vent volet roulant, flèche et retenue coulisse NF EN 13659 / RNV 2013"
            >
              <Wind className="w-3 h-3" />
              <span>Vent Volet</span>
            </button>

            <button
              type="button"
              onClick={() => {
                playTactileClick();
                setShowSealantModal(true);
              }}
              className="px-2 py-1 rounded-lg bg-cyan-500/10 dark:bg-cyan-500/15 border border-cyan-500/30 hover:bg-cyan-500/20 flex items-center gap-1 text-[10px] cursor-pointer transition-all active:scale-95 text-cyan-300 font-semibold"
              title="Audit joint d'étanchéité périphérique, mastic et dilatation NF DTU 36.5 / SNJF"
            >
              <Droplets className="w-3 h-3" />
              <span>Mastic Joint</span>
            </button>

            <button
              type="button"
              onClick={() => {
                playTactileClick();
                setShowBalustradeModal(true);
              }}
              className="px-2 py-1 rounded-lg bg-teal-500/10 dark:bg-teal-500/15 border border-teal-500/30 hover:bg-teal-500/20 flex items-center gap-1 text-[10px] cursor-pointer transition-all active:scale-95 text-teal-300 font-semibold"
              title="Audit garde-corps verre autoportant, poussée de foule et sabots sol NF P 01-012 / Eurocode 1"
            >
              <ShieldCheck className="w-3 h-3" />
              <span>Garde-Corps</span>
            </button>

            <button
              type="button"
              onClick={() => {
                playTactileClick();
                setShowBioclimaticPergolaModal(true);
              }}
              className="px-2 py-1 rounded-lg bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/30 hover:bg-emerald-500/20 flex items-center gap-1 text-[10px] cursor-pointer transition-all active:scale-95 text-emerald-300 font-semibold"
              title="Audit pergola bioclimatique à lames orientables, tenue au vent et drainage Eurocode 9 / RNV 2013"
            >
              <Sun className="w-3 h-3" />
              <span>Pergola Bio</span>
            </button>

            <button
              type="button"
              onClick={() => {
                playTactileClick();
                setShowSolarSunshadeModal(true);
              }}
              className="px-2 py-1 rounded-lg bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/30 hover:bg-amber-500/20 flex items-center gap-1 text-[10px] cursor-pointer transition-all active:scale-95 text-amber-300 font-semibold"
              title="Audit brise-soleil architectural, facteur solaire g_tot et confort visuel DTR C3-2 / NF EN 13363-1"
            >
              <Sun className="w-3 h-3" />
              <span>Masque Solaire</span>
            </button>

            <button
              type="button"
              onClick={() => {
                playTactileClick();
                setShowSlidingCarriageModal(true);
              }}
              className="px-2 py-1 rounded-lg bg-blue-500/10 dark:bg-blue-500/15 border border-blue-500/30 hover:bg-blue-500/20 flex items-center gap-1 text-[10px] cursor-pointer transition-all active:scale-95 text-blue-300 font-semibold min-h-[44px]"
              title="Audit chariots coulissant lourd, capacité de charge et effort PMR (NF EN 13126-15 / Décret 06-455)"
            >
              <Scale className="w-3 h-3" />
              <span>Chariots PMR</span>
            </button>

            <button
              type="button"
              onClick={() => {
                playTactileClick();
                setShowCrossSectionModal(true);
              }}
              className="px-2 py-1 rounded-lg bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 hover:bg-black/10 dark:hover:bg-white/10 flex items-center gap-1 text-[10px] cursor-pointer transition-all active:scale-95 text-sky-400 font-semibold"
              title="Afficher la coupe technique d'extrusion 2D"
            >
              <Layers className="w-3 h-3" />
              <span>Coupe 2D</span>
            </button>

            <button
              type="button"
              onClick={handleMirrorBlueprint}
              className="px-2 py-1 rounded-lg bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 hover:bg-black/10 dark:hover:bg-white/10 flex items-center gap-1 text-[10px] cursor-pointer transition-all active:scale-95"
              title="Inverser les vantaux et divisions par symétrie axiale"
            >
              <FlipHorizontal className="w-3 h-3 text-cyan-400" />
              <span>Symétrie</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadSvgPlan}
              className="px-2 py-1 rounded-lg bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 hover:bg-black/10 dark:hover:bg-white/10 flex items-center gap-1 text-[10px] cursor-pointer transition-all active:scale-95"
              title="Télécharger le plan vectoriel SVG"
            >
              <Download className="w-3 h-3 text-[#D4AF37]" />
              <span>Plan SVG</span>
            </button>
          </div>
        </div>

        <div className="relative w-full aspect-4/3 rounded-2xl bg-[#070A10] border border-cyan-500/20 flex items-center justify-center p-3 overflow-hidden select-none">
          {/* Blueprint Grid Lines */}
          <div
            className="absolute inset-0 opacity-15"
            style={{
              backgroundImage: 'radial-gradient(circle, #38BDF8 1px, transparent 1px)',
              backgroundSize: '16px 16px',
            }}
          />

          <svg
            id="mobile-cad-blueprint-svg"
            viewBox={`0 0 ${svgW} ${svgH}`}
            className="w-full h-full max-h-[290px] select-none"
          >
            {/* Dimension Callout Labels */}
            <text
              x={startX + drawW / 2}
              y={Math.max(16, startY - 14)}
              fill="#D4AF37"
              fontSize="12"
              fontWeight="bold"
              textAnchor="middle"
              fontFamily="monospace"
            >
              L = {cadStructure.width} mm
            </text>
            <text
              x={Math.max(12, startX - 14)}
              y={startY + drawH / 2}
              fill="#D4AF37"
              fontSize="12"
              fontWeight="bold"
              textAnchor="middle"
              fontFamily="monospace"
              transform={`rotate(-90 ${Math.max(12, startX - 14)} ${startY + drawH / 2})`}
            >
              H = {cadStructure.height} mm
            </text>

            {/* Outer Frame (Dormant) */}
            <rect
              x={startX}
              y={startY}
              width={drawW}
              height={drawH}
              fill="#111827"
              stroke="#D4AF37"
              strokeWidth="5"
              rx="3"
            />

            {/* Individual Grid Cells */}
            {cells.map((cell) => {
              const xSplits = [0, ...cadStructure.verticalDividers.slice().sort((a, b) => a - b), cadStructure.width];
              const ySplits = [0, ...cadStructure.horizontalDividers.slice().sort((a, b) => a - b), cadStructure.height];

              const cellX = startX + xSplits[cell.col] * scale;
              const cellY = startY + (cadStructure.height - ySplits[cell.row + 1]) * scale;
              const cW = cell.widthMm * scale;
              const cH = cell.heightMm * scale;
              const key = `${cell.row}-${cell.col}`;
              const isSelected = selectedCellKey === key;

              return (
                <g
                  key={key}
                  onClick={() => {
                    playTactileClick();
                    setRawSelectedCellKey(key);
                  }}
                  className="cursor-pointer"
                >
                  {/* Glass / Panel Infill */}
                  <rect
                    x={cellX + 4}
                    y={cellY + 4}
                    width={cW - 8}
                    height={cH - 8}
                    fill={
                      cell.type === 'panel_solid'
                        ? '#1F2937'
                        : isSelected
                        ? 'rgba(56, 189, 248, 0.22)'
                        : 'rgba(56, 189, 248, 0.08)'
                    }
                    stroke={isSelected ? '#38BDF8' : 'rgba(255, 255, 255, 0.2)'}
                    strokeWidth={isSelected ? '3' : '1.5'}
                    rx="2"
                  />

                  {/* Kinematic Opening Lines */}
                  {cell.type === 'sash_slide' && (
                    <g opacity="0.85">
                      <line
                        x1={cellX + cW / 2 - 12}
                        y1={cellY + cH / 2}
                        x2={cellX + cW / 2 + 12}
                        y2={cellY + cH / 2}
                        stroke="#10B981"
                        strokeWidth="2"
                      />
                      <polygon
                        points={`${cellX + cW / 2 - 12},${cellY + cH / 2} ${cellX + cW / 2 - 6},${cellY + cH / 2 - 4} ${cellX + cW / 2 - 6},${cellY + cH / 2 + 4}`}
                        fill="#10B981"
                      />
                      <polygon
                        points={`${cellX + cW / 2 + 12},${cellY + cH / 2} ${cellX + cW / 2 + 6},${cellY + cH / 2 - 4} ${cellX + cW / 2 + 6},${cellY + cH / 2 + 4}`}
                        fill="#10B981"
                      />
                    </g>
                  )}

                  {cell.type === 'sash_left' && (
                    <path
                      d={`M ${cellX + 8} ${cellY + 8} L ${cellX + cW - 8} ${cellY + cH / 2} L ${cellX + 8} ${cellY + cH - 8}`}
                      fill="none"
                      stroke="#F59E0B"
                      strokeWidth="1.5"
                      strokeDasharray="4 3"
                    />
                  )}

                  {cell.type === 'sash_right' && (
                    <path
                      d={`M ${cellX + cW - 8} ${cellY + 8} L ${cellX + 8} ${cellY + cH / 2} L ${cellX + cW - 8} ${cellY + cH - 8}`}
                      fill="none"
                      stroke="#F59E0B"
                      strokeWidth="1.5"
                      strokeDasharray="4 3"
                    />
                  )}

                  {cell.type === 'sash_tilt_turn' && (
                    <path
                      d={`M ${cellX + 8} ${cellY + cH - 8} L ${cellX + cW / 2} ${cellY + 8} L ${cellX + cW - 8} ${cellY + cH - 8}`}
                      fill="none"
                      stroke="#06B6D4"
                      strokeWidth="1.5"
                      strokeDasharray="4 3"
                    />
                  )}

                  {cell.type === 'panel_solid' && (
                    <line
                      x1={cellX + 8}
                      y1={cellY + cH / 2}
                      x2={cellX + cW - 8}
                      y2={cellY + cH / 2}
                      stroke="rgba(255, 255, 255, 0.2)"
                      strokeWidth="1"
                    />
                  )}

                  {/* Cell Dimension Label */}
                  <text
                    x={cellX + cW / 2}
                    y={cellY + cH / 2 - 12}
                    fill={isSelected ? '#38BDF8' : '#94A3B8'}
                    fontSize="9"
                    fontWeight="bold"
                    textAnchor="middle"
                    fontFamily="monospace"
                  >
                    {cell.type === 'glass_fixed'
                      ? 'FIXE'
                      : cell.type === 'sash_slide'
                      ? 'COULISSANT'
                      : cell.type === 'sash_tilt_turn'
                      ? 'OSCILLO'
                      : cell.type === 'sash_left'
                      ? 'BATTANT G'
                      : cell.type === 'sash_right'
                      ? 'BATTANT D'
                      : 'PANNEAU'}
                  </text>

                  <text
                    x={cellX + cW / 2}
                    y={cellY + cH / 2 + 14}
                    fill="#E2E8F0"
                    fontSize="8.5"
                    textAnchor="middle"
                    fontFamily="monospace"
                  >
                    {cell.widthMm} × {cell.heightMm}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Active Selection Info */}
        <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400 pt-0.5">
          <span>Touchez une case pour modifier son ouvrant</span>
          {activeCell && (
            <span className="text-cyan-400 font-bold">
              Case sélectionnée: {activeCell.widthMm} × {activeCell.heightMm} mm
            </span>
          )}
        </div>
      </div>

      {/* 3. CELL OPENING TYPE SELECTOR */}
      {activeCell && (
        <div
          className={`p-3.5 rounded-3xl border shadow-sm space-y-2.5 ${
            isLight ? 'bg-white border-slate-200' : 'bg-[#0B0F19] border-white/10'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-zinc-400">Type d'ouverture de la case active</span>
            <span className="text-[10px] text-zinc-500">
              Verre: {activeCell.glassWidthMm} × {activeCell.glassHeightMm} mm
            </span>
          </div>

          <div className="grid grid-cols-3 gap-1.5">
            {CELL_TYPE_CONFIG.map((opt) => {
              const isSelected = activeCell.type === opt.type;
              return (
                <button
                  key={opt.type}
                  onClick={() => handleSelectCellType(opt.type)}
                  className={`p-2 rounded-2xl border text-center transition-all cursor-pointer min-h-[46px] flex flex-col items-center justify-center ${
                    isSelected
                      ? 'bg-[#D4AF37] text-slate-950 font-bold border-[#D4AF37] shadow-sm'
                      : isLight
                      ? 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                      : 'bg-white/5 border-white/10 text-zinc-300 hover:bg-white/10'
                  }`}
                >
                  <span className="text-xs font-semibold leading-tight">{opt.labelFr}</span>
                  <span className="text-[9px] opacity-75 leading-tight">{opt.sub}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. REAL-TIME WORKSHOP CUT SHEET TABLE */}
      <div
        className={`p-4 rounded-3xl border shadow-md space-y-3 ${
          isLight ? 'bg-white border-slate-200' : 'bg-[#0B0F19] border-white/10'
        }`}
      >
        <div className="flex items-center justify-between pb-1 border-b border-black/5 dark:border-white/10">
          <div className="flex items-center gap-1 p-0.5 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-[11px] font-mono">
            <button
              type="button"
              onClick={() => {
                playTactileClick();
                setActiveBomTab('cuts');
              }}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer font-bold ${
                activeBomTab === 'cuts'
                  ? 'bg-[#D4AF37] text-slate-950 shadow-xs'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Profilés ({bom.cuts.length})
            </button>
            <button
              type="button"
              onClick={() => {
                playTactileClick();
                setActiveBomTab('glasses');
              }}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer font-bold ${
                activeBomTab === 'glasses'
                  ? 'bg-cyan-400 text-slate-950 shadow-xs'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Vitrages ({bom.glasses?.length || 0})
            </button>
            <button
              type="button"
              onClick={() => {
                playTactileClick();
                setActiveBomTab('hardware');
              }}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer font-bold ${
                activeBomTab === 'hardware'
                  ? 'bg-amber-400 text-slate-950 shadow-xs'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Quincaillerie ({bom.hardwareSummary?.length || 0})
            </button>
          </div>

          <span className="text-[10px] font-mono text-zinc-500">
            {activeBomTab === 'cuts'
              ? `${bom.totalProfileMeters.toFixed(1)} m linéaires`
              : activeBomTab === 'glasses'
              ? `${bom.totalGlassAreaM2.toFixed(2)} m² verre`
              : `${bom.hardwareSummary?.length || 0} références`}
          </span>
        </div>

        {/* Real-time KPI summary */}
        <div className="grid grid-cols-3 gap-1.5 text-center font-mono text-[11px]">
          <div className={`p-2 rounded-xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-white/5 border-white/10'}`}>
            <span className="text-zinc-500 block text-[10px]">Profilés</span>
            <span className="font-bold text-[#D4AF37]">{bom.totalProfileMeters.toFixed(1)} m</span>
          </div>
          <div className={`p-2 rounded-xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-white/5 border-white/10'}`}>
            <span className="text-zinc-500 block text-[10px]">Vitrage</span>
            <span className="font-bold text-cyan-400">{bom.totalGlassAreaM2.toFixed(2)} m²</span>
          </div>
          <div className={`p-2 rounded-xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-white/5 border-white/10'}`}>
            <span className="text-zinc-500 block text-[10px]">Accessoires</span>
            <span className="font-bold text-amber-400">{bom.hardwareSummary?.length || 0} réf.</span>
          </div>
        </div>

        {/* TAB 1: CUT PIECES LIST */}
        {activeBomTab === 'cuts' && (
          <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
            {bom.cuts.map((p) => (
              <div
                key={p.id}
                className={`p-2.5 rounded-2xl border text-xs font-mono flex items-center justify-between ${
                  isLight ? 'bg-slate-50 border-slate-200' : 'bg-black/30 border-white/5'
                }`}
              >
                <div>
                  <div className="font-bold flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]" />
                    <span className={isLight ? 'text-slate-900 font-bold' : 'text-white font-bold'}>{p.label}</span>
                  </div>
                  <div className="text-[10px] text-zinc-500 pl-3">
                    Coupes: {p.cutLeftAngle}° / {p.cutRightAngle}° • Rôle: {p.role}
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-sm font-black text-cyan-400 font-mono">
                    {p.lengthMm} <span className="text-[10px]">mm</span>
                  </span>
                  <span className="text-[10px] text-zinc-400 block">Qté : {p.quantity}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB 2: GLASS CUT PIECES LIST & SPECIFIER */}
        {activeBomTab === 'glasses' && (
          <div className="space-y-3">
            {/* Parclose & Notching Quick Launch Banner */}
            <div
              className={`p-3 rounded-2xl border flex items-center justify-between gap-2.5 ${
                isLight ? 'bg-amber-50/80 border-amber-200 text-slate-800' : 'bg-amber-500/10 border-amber-500/25 text-amber-200'
              }`}
            >
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-7 h-7 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                  <Scissors className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0">
                  <span className="font-bold block truncate text-xs">Débit Parcloses & Grugeage (DTU 39)</span>
                  <span className="text-[10px] opacity-80 block truncate">
                    Coupes d'onglet 45°, coupes 90° et joints cales pour vitrage {currentGlassSpec?.thicknessTotalMm || 24} mm
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  playTactileClick();
                  setShowParcloseModal(true);
                }}
                className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs cursor-pointer transition-all shrink-0 shadow-xs"
              >
                Calculer
              </button>
            </div>

            {/* Sub-view selector: Matrix vs Cuts */}
            <div className="grid grid-cols-2 p-1 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 font-mono text-xs">
              <button
                type="button"
                onClick={() => {
                  playTactileClick();
                  setGlassViewMode('matrix');
                }}
                className={`py-2 rounded-xl font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                  glassViewMode === 'matrix'
                    ? 'bg-[#D4AF37] text-slate-950 shadow-xs'
                    : isLight
                    ? 'text-slate-600 hover:text-slate-950'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Matrice Performance (Ug/Rw)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  playTactileClick();
                  setGlassViewMode('cuts');
                }}
                className={`py-2 rounded-xl font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                  glassViewMode === 'cuts'
                    ? 'bg-[#D4AF37] text-slate-950 shadow-xs'
                    : isLight
                    ? 'text-slate-600 hover:text-slate-950'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Débit Miroiterie ({bom.glasses?.length || 0})</span>
              </button>
            </div>

            {glassViewMode === 'matrix' ? (
              <GlazingPerformanceMatrix
                currentGlassType={config.glassType}
                onSelectGlassType={(g) => setGlassType(g)}
                widthMm={config.width}
                heightMm={config.height}
                totalGlassAreaM2={bom.totalGlassAreaM2}
                wilayaName={selectedWilaya}
                isLight={isLight}
                onExportDtrPdf={handleExportDtrPdf}
                isGeneratingPdf={isGeneratingDtrPdf}
                onOpenThermalStressModal={() => setShowThermalStressModal(true)}
                onOpenAcousticModal={() => setShowAcousticModal(true)}
              />
            ) : (
              <div className="space-y-2.5">
                {/* Quick Glass & Spacer Specifier */}
                <div
                  className={`p-3 rounded-2xl border space-y-2.5 ${
                    isLight ? 'bg-slate-50 border-slate-200' : 'bg-black/40 border-white/10'
                  }`}
                >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
                  <span className={`text-xs font-mono font-bold ${isLight ? 'text-slate-800' : 'text-zinc-200'}`}>
                    Spécification Verre & Intercalaire
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-bold">
                    Rw {effectiveRw} dB
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                    Ug {effectiveUg}
                  </span>
                </div>
              </div>

              {/* Glass type dropdown */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div className="space-y-1">
                  <span className="text-[10px] font-mono text-zinc-400 block">Type de vitrage</span>
                  <select
                    value={config.glassType}
                    onChange={(e) => {
                      playSwitchSound();
                      setGlassType(e.target.value as GlassType);
                    }}
                    className={`w-full p-2 rounded-xl border text-xs font-mono min-h-[40px] cursor-pointer ${
                      isLight ? 'bg-white border-slate-200 text-slate-800' : 'bg-[#0B0F19] border-white/10 text-white'
                    }`}
                  >
                    {GLASS_LIST.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.labelFr} ({g.tradeFormula})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Spacer toggle */}
                <div className="space-y-1">
                  <span className="text-[10px] font-mono text-zinc-400 block">Intercalaire (Spacer)</span>
                  <div className="grid grid-cols-2 gap-1">
                    <button
                      type="button"
                      onClick={() => {
                        playSwitchSound();
                        setSpacerType('standard_alu');
                      }}
                      className={`p-2 rounded-xl border text-[11px] font-mono font-bold transition-all text-center cursor-pointer min-h-[40px] ${
                        activeSpacer === 'standard_alu'
                          ? isLight
                            ? 'bg-slate-900 text-white border-slate-900'
                            : 'bg-white text-slate-950 border-white'
                          : isLight
                          ? 'bg-white border-slate-200 text-slate-700'
                          : 'bg-white/5 border-white/10 text-zinc-400'
                      }`}
                    >
                      Alu 16mm
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        playSwitchSound();
                        setSpacerType('warm_edge');
                      }}
                      className={`p-2 rounded-xl border text-[11px] font-mono font-bold transition-all text-center cursor-pointer min-h-[40px] ${
                        activeSpacer === 'warm_edge'
                          ? isLight
                            ? 'bg-cyan-600 text-white border-cyan-600'
                            : 'bg-cyan-500 text-slate-950 border-cyan-400'
                          : isLight
                          ? 'bg-white border-slate-200 text-slate-700'
                          : 'bg-white/5 border-white/10 text-zinc-400'
                      }`}
                    >
                      Warm-Edge
                    </button>
                  </div>
                </div>
              </div>

              {/* Acoustic & Thermal helper badge */}
              <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400 pt-0.5">
                <button
                  type="button"
                  onClick={() => {
                    playTactileClick();
                    setShowAcousticModal(true);
                  }}
                  className="text-cyan-400 hover:text-cyan-300 underline underline-offset-2 flex items-center gap-1 truncate max-w-[65%] cursor-pointer"
                  title="Ouvrir le calculateur d isolement acoustique DTR C3-3"
                >
                  <Waves className="w-3 h-3 shrink-0" />
                  <span className="truncate">{acousticRating.label}</span>
                </button>
                <span className="text-emerald-400 truncate">{thermalRating.energyGrade}</span>
              </div>
            </div>

            {/* List of glass cut pieces */}
            <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
              {bom.glasses && bom.glasses.length > 0 ? (
                bom.glasses.map((g, idx) => (
                  <div
                    key={g.id || idx}
                    className={`p-2.5 rounded-2xl border text-xs font-mono flex items-center justify-between ${
                      isLight ? 'bg-slate-50 border-slate-200' : 'bg-black/30 border-white/5'
                    }`}
                  >
                    <div>
                      <div className="font-bold flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                        <span className={isLight ? 'text-slate-900 font-bold' : 'text-white font-bold'}>{g.label}</span>
                      </div>
                      <div className="text-[10px] text-zinc-500 pl-3">
                        {currentGlassSpec.tradeFormula} • {activeSpacer === 'warm_edge' ? 'Warm-Edge' : 'Alu'} • {g.areaM2} m² • AA ±1mm
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-sm font-black text-[#D4AF37] font-mono">
                        {g.widthMm} × {g.heightMm} <span className="text-[10px]">mm</span>
                      </span>
                      <span className="text-[10px] text-zinc-400 block">Qté : {g.quantity}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-xs font-mono text-zinc-500">
                  Aucun vitrage calculé pour cette configuration.
                </div>
              )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: HARDWARE & ACCESSORIES LIST */}
        {activeBomTab === 'hardware' && (
          <div className="space-y-2">
            {/* Rack & Bin Quick Banner */}
            <div
              className={`p-2.5 rounded-2xl border flex items-center justify-between text-xs font-mono ${
                isLight ? 'bg-slate-50 border-slate-200' : 'bg-black/40 border-white/10'
              }`}
            >
              <div className="flex items-center gap-1.5">
                <Wrench className="w-3.5 h-3.5 text-amber-400" />
                <span className={`font-bold ${isLight ? 'text-slate-800' : 'text-zinc-200'}`}>
                  Accessoires & Quincaillerie Atelier
                </span>
              </div>
              <span className="text-[10px] font-bold text-amber-400">
                {bom.hardwareSummary?.reduce((sum, it) => sum + it.totalPriceDzd, 0).toLocaleString('fr-DZ')} DZD
              </span>
            </div>

            {/* List of hardware items */}
            <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
              {bom.hardwareSummary && bom.hardwareSummary.length > 0 ? (
                bom.hardwareSummary.map((item) => {
                  const catConfig = HARDWARE_CAT_CONFIG[item.category] || {
                    label: item.category,
                    badgeClass: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20',
                  };
                  return (
                    <div
                      key={item.id}
                      className={`p-2.5 rounded-2xl border text-xs font-mono flex items-center justify-between gap-2 ${
                        isLight ? 'bg-slate-50 border-slate-200' : 'bg-black/30 border-white/5'
                      }`}
                    >
                      <div className="space-y-1 flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="px-1.5 py-0.5 rounded-md bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30 text-[10px] font-bold">
                            {item.referenceCode}
                          </span>
                          <span className={`px-1.5 py-0.5 rounded-md border text-[9px] font-semibold ${catConfig.badgeClass}`}>
                            {catConfig.label}
                          </span>
                          {item.stockBin && (
                            <span className="text-[9px] text-zinc-400 bg-black/20 dark:bg-white/5 px-1 rounded">
                              {item.stockBin}
                            </span>
                          )}
                        </div>
                        <div className={`font-bold text-xs truncate ${isLight ? 'text-slate-900' : 'text-white'}`}>
                          {item.name}
                        </div>
                        {item.notes && (
                          <div className="text-[10px] text-zinc-500 truncate">
                            {item.notes}
                          </div>
                        )}
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-sm font-black text-amber-400 font-mono">
                          {item.quantity} <span className="text-[10px]">{item.unit}</span>
                        </span>
                        <span className="text-[10px] text-zinc-400 block">
                          {item.unitPriceDzd.toLocaleString('fr-DZ')} DA/{item.unit}
                        </span>
                        <span className="text-[11px] font-bold text-slate-300 block">
                          {item.totalPriceDzd.toLocaleString('fr-DZ')} DA
                        </span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="p-4 text-center text-xs font-mono text-zinc-500">
                  Aucun accessoire calculé pour cette configuration.
                </div>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
          {activeBomTab === 'glasses' ? (
            <>
              <button
                type="button"
                onClick={handleShareGlassWhatsApp}
                className="py-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-mono font-bold text-xs flex items-center justify-center gap-2 cursor-pointer min-h-[48px] active:scale-98 transition-all"
                title="Partager les dimensions de vitrage au miroitier par WhatsApp"
              >
                <MessageCircle className="w-4 h-4" />
                <span>WhatsApp Miroitier</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadGlazierPdf}
                disabled={isGeneratingGlazierPdf || !bom.glasses || bom.glasses.length === 0}
                className={`py-3 rounded-2xl border font-mono font-bold text-xs flex items-center justify-center gap-2 cursor-pointer min-h-[48px] active:scale-98 transition-all ${
                  isLight
                    ? 'bg-sky-50 border-sky-300 text-sky-900 hover:bg-sky-100 shadow-xs'
                    : 'bg-sky-500/15 border-sky-500/30 text-sky-300 hover:bg-sky-500/25'
                }`}
                title="Télécharger le bon de commande découpe vitrerie officiel A4 PDF"
              >
                <FileCheck className="w-4 h-4 text-sky-400" />
                <span>{isGeneratingGlazierPdf ? 'Génération...' : 'Bon Vitrage PDF'}</span>
              </button>
            </>
          ) : activeBomTab === 'hardware' ? (
            <>
              <button
                type="button"
                onClick={handleShareHardwareWhatsApp}
                className="py-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-mono font-bold text-xs flex items-center justify-center gap-2 cursor-pointer min-h-[48px] active:scale-98 transition-all"
                title="Partager le bon de sortie quincaillerie au magasinier par WhatsApp"
              >
                <MessageCircle className="w-4 h-4" />
                <span>WhatsApp Magasin</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadHardwarePdf}
                disabled={isGeneratingHardwarePdf || !bom.hardwareSummary || bom.hardwareSummary.length === 0}
                className={`py-3 rounded-2xl border font-mono font-bold text-xs flex items-center justify-center gap-2 cursor-pointer min-h-[48px] active:scale-98 transition-all ${
                  isLight
                    ? 'bg-amber-50 border-amber-300 text-amber-900 hover:bg-amber-100 shadow-xs'
                    : 'bg-amber-500/15 border-amber-500/30 text-amber-300 hover:bg-amber-500/25'
                }`}
                title="Télécharger le bon de sortie quincaillerie officiel A4 PDF"
              >
                <PackageCheck className="w-4 h-4 text-amber-400" />
                <span>{isGeneratingHardwarePdf ? 'Génération...' : 'Bon Quincaillerie PDF'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  playTactileClick();
                  setShowFastenersModal(true);
                }}
                className={`py-3 rounded-2xl border font-mono font-bold text-xs flex items-center justify-center gap-2 cursor-pointer min-h-[48px] active:scale-98 transition-all ${
                  isLight
                    ? 'bg-sky-50 border-sky-300 text-sky-900 hover:bg-sky-100 shadow-xs'
                    : 'bg-sky-500/15 border-sky-500/30 text-sky-300 hover:bg-sky-500/25'
                }`}
                title="Calculer les fixations maçonnerie et chevilles selon DTU 36.5"
              >
                <Wind className="w-4 h-4 text-sky-400" />
                <span>Fixations DTU 36.5</span>
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={handleExportDtrPdf}
                disabled={isGeneratingDtrPdf}
                className={`py-3 rounded-2xl border font-mono font-bold text-xs flex items-center justify-center gap-2 cursor-pointer min-h-[48px] active:scale-98 transition-all ${
                  isLight
                    ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-300 shadow-xs'
                    : 'bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border-emerald-500/30'
                }`}
              >
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>{isGeneratingDtrPdf ? 'Génération...' : 'Attestation DTR C3-2 (PDF)'}</span>
              </button>

              <button
                type="button"
                onClick={handleExportCutSheet}
                disabled={isGeneratingCutSheet}
                className="w-full py-3 rounded-2xl bg-[#D4AF37] text-slate-950 font-mono font-bold text-xs flex items-center justify-center gap-2 cursor-pointer min-h-[48px] hover:brightness-110 active:scale-98 transition-all shadow-md"
              >
                <FileText className="w-4 h-4" />
                <span>{isGeneratingCutSheet ? 'Génération...' : 'Télécharger Fiche Scie PDF'}</span>
              </button>
            </>
          )}
        </div>

        {/* Deep Linking Cross-Studio Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 border-t border-black/5 dark:border-white/5">
          <button
            type="button"
            onClick={() => {
              playClampSound();
              setShowAddToSurveyModal(true);
            }}
            className={`w-full py-2.5 px-3 rounded-2xl border font-mono font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer min-h-[44px] active:scale-98 transition-all ${
              isLight
                ? 'bg-amber-50 hover:bg-amber-100 text-amber-950 border-amber-300 shadow-xs'
                : 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border-amber-500/30'
            }`}
            title="Ajouter ce châssis paramétrique au carnet de cotes chantier"
          >
            <ClipboardList className="w-4 h-4 text-[#D4AF37]" />
            <span>+ Ajouter au Carnet de Cotes</span>
          </button>

          <button
            type="button"
            onClick={handleSendToCuttingOptimizer}
            className={`w-full py-2.5 px-3 rounded-2xl border font-mono font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer min-h-[44px] active:scale-98 transition-all ${
              isLight
                ? 'bg-sky-50 hover:bg-sky-100 text-sky-950 border-sky-300 shadow-xs'
                : 'bg-sky-500/10 hover:bg-sky-500/20 text-sky-300 border-sky-500/30'
            }`}
            title="Envoyer les tronçons calculés vers l'optimiseur de débit 1D"
          >
            <Scissors className="w-4 h-4 text-sky-400" />
            <span>Optimiser Débit Scie 1D ({bom.cuts.length} débits)</span>
          </button>
        </div>
      </div>

      {/* 4. MODAL AJOUT AU CARNET DE COTES CHANTIER */}
      {showAddToSurveyModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div
            className={`w-full max-w-lg rounded-t-3xl sm:rounded-3xl border shadow-2xl p-5 space-y-4 font-mono text-xs ${
              isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-[#0E131F] border-white/10 text-white'
            }`}
          >
            <div className="flex items-center justify-between border-b border-black/10 dark:border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-[#D4AF37]" />
                <h3 className="text-sm font-bold">Ajouter au Carnet de Cotes Chantier</h3>
              </div>
              <button
                onClick={() => {
                  playTactileClick();
                  setShowAddToSurveyModal(false);
                }}
                className="p-1 rounded-lg text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Geometry Summary Card */}
            <div
              className={`p-3 rounded-2xl border flex items-center justify-between ${
                isLight ? 'bg-slate-50 border-slate-200' : 'bg-black/30 border-white/5'
              }`}
            >
              <div>
                <span className="text-[10px] text-zinc-400 block uppercase">Châssis CAO ({bayCount} Travées)</span>
                <span className="font-bold text-[#D4AF37]">
                  {cadStructure.width} × {cadStructure.height} mm
                </span>
                <span className="text-[10px] text-zinc-500 block">
                  {cells.length} case{cells.length > 1 ? 's' : ''} • {bom.totalProfileWeightKg} kg alu
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-zinc-400 block uppercase">Estimation Matière</span>
                <span className="font-bold text-emerald-400">
                  {Math.round(bom.totalProfileWeightKg * 850 + bom.totalGlassAreaM2 * 5500 + 15000).toLocaleString('fr-DZ')} DZD
                </span>
              </div>
            </div>

            {/* Form Fields */}
            <div className="space-y-3">
              <div className="space-y-1">
                <label className={`text-[11px] block ${isLight ? 'text-slate-600 font-medium' : 'text-zinc-400'}`}>
                  Désignation / Emplacement *
                </label>
                <input
                  type="text"
                  value={surveyRoomName}
                  onChange={(e) => setSurveyRoomName(e.target.value)}
                  placeholder="Ex: Façade Principale - Baie Composée"
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
                      <button type="button" onClick={() => setSurveyAllege(0)} className="text-[#D4AF37] cursor-pointer">0</button>
                      <button type="button" onClick={() => setSurveyAllege(900)} className="hover:text-[#D4AF37] cursor-pointer">900</button>
                      <button type="button" onClick={() => setSurveyAllege(1000)} className="hover:text-[#D4AF37] cursor-pointer">1000</button>
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
                  className="w-2/3 py-3 rounded-2xl bg-[#D4AF37] text-slate-950 font-bold flex items-center justify-center gap-1.5 cursor-pointer min-h-[48px] shadow-lg hover:brightness-110 active:scale-98 transition-all"
                >
                  <Check className="w-4 h-4" />
                  <span>Ajouter au Carnet</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floating Survey Toast Message */}
      {surveyToastMessage && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-2xl bg-emerald-600 text-white font-mono font-bold text-xs shadow-2xl flex items-center gap-2 border border-emerald-400/40">
          <Check className="w-4 h-4 text-emerald-200" />
          <span>{surveyToastMessage}</span>
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

      {/* GLAZING BEAD MITER & NOTCHING GUIDE MODAL */}
      {showParcloseModal && (
        <GlazingBeadGuideModal
          isOpen={showParcloseModal}
          onClose={() => setShowParcloseModal(false)}
          initialWidthMm={cadStructure.width}
          initialHeightMm={cadStructure.height}
          initialGlassThicknessMm={currentGlassSpec?.thicknessTotalMm || 24}
        />
      )}

      {/* GLAZING THERMAL STRESS & BREAKAGE RISK MODAL */}
      {showThermalStressModal && (
        <GlazingThermalStressModal
          isOpen={showThermalStressModal}
          onClose={() => setShowThermalStressModal(false)}
          defaultGlassType={config.glassType}
          widthMm={cadStructure.width}
          heightMm={cadStructure.height}
          windowReference={`Baie ${cadStructure.width}x${cadStructure.height} ${config.profileSystem}`}
          wilayaName={selectedWilaya}
          clientName="Client Chantier"
        />
      )}

      {/* FASTENER ANCHOR DEPTH & WIND LOAD PULLOUT MODAL */}
      {showFastenersModal && (
        <FastenerSafetyModal
          isOpen={showFastenersModal}
          onClose={() => setShowFastenersModal(false)}
          widthMm={cadStructure.width}
          heightMm={cadStructure.height}
          windowReference={`Baie ${cadStructure.width}x${cadStructure.height} ${config.profileSystem}`}
          wilayaName={selectedWilaya}
          clientName="Chantier Client"
          isDarkProfile={
            config.finishColor === 'ral_7016' ||
            config.finishColor === 'ral_9005' ||
            config.finishColor.includes('faux_bois')
          }
        />
      )}

      {/* ROLLER SHUTTER WINDING & BOX CLEARANCE MODAL */}
      {showWindingModal && (
        <RollerShutterWindingModal
          isOpen={showWindingModal}
          onClose={() => setShowWindingModal(false)}
          initialWidth={cadStructure.width}
          initialHeight={cadStructure.height}
          windowReference={`Baie ${cadStructure.width}x${cadStructure.height} ${config.profileSystem}`}
          wilayaName={selectedWilaya}
          clientName="Chantier Client"
        />
      )}

      {/* ACOUSTIC SOUND INSULATION & TRAFFIC NOISE MODAL */}
      {showAcousticModal && (
        <AcousticInsulationModal
          isOpen={showAcousticModal}
          onClose={() => setShowAcousticModal(false)}
          initialWidth={cadStructure.width}
          initialHeight={cadStructure.height}
          windowReference={`Baie ${cadStructure.width}x${cadStructure.height} ${config.profileSystem}`}
          wilayaName={selectedWilaya}
          clientName="Chantier Client"
        />
      )}

      {/* CURTAIN WALL STRUCTURAL & WIND DEFLECTION MODAL */}
      {showCurtainWallModal && (
        <CurtainWallStructuralModal
          isOpen={showCurtainWallModal}
          onClose={() => setShowCurtainWallModal(false)}
          initialFloorHeight={Math.max(cadStructure.height, 2800)}
          initialMullionSpacing={Math.max(Math.round(cadStructure.width / 2), 1200)}
          facadeReference={`Façade ${cadStructure.width}x${cadStructure.height} ${config.profileSystem}`}
          wilayaName={selectedWilaya}
          clientName="Chantier Client"
        />
      )}

      {/* SEISMIC JOINERY MOVEMENT & DRIFT MODAL */}
      {showSeismicModal && (
        <SeismicJoineryModal
          isOpen={showSeismicModal}
          onClose={() => setShowSeismicModal(false)}
          initialWidth={cadStructure.width}
          initialHeight={cadStructure.height}
          windowReference={`Baie ${cadStructure.width}x${cadStructure.height} ${config.profileSystem}`}
          wilayaName={selectedWilaya}
          clientName="Chantier Client"
        />
      )}

      {/* BIFOLD ACCORDION DOOR MECHANICAL & PMR THRESHOLD MODAL */}
      {showBifoldModal && (
        <BifoldDoorModal
          isOpen={showBifoldModal}
          onClose={() => setShowBifoldModal(false)}
          initialWidth={cadStructure.width}
          initialHeight={cadStructure.height}
          windowReference={`Baie ${cadStructure.width}x${cadStructure.height} ${config.profileSystem}`}
          wilayaName={selectedWilaya}
          clientName="Chantier Client"
        />
      )}

      {/* LOUVER & SUNSHADE AERODYNAMIC & PRESSURE DROP MODAL */}
      {showLouverModal && (
        <LouverAerodynamicsModal
          isOpen={showLouverModal}
          onClose={() => setShowLouverModal(false)}
          initialWidth={cadStructure.width}
          initialHeight={cadStructure.height}
          windowReference={`Grille ${cadStructure.width}x${cadStructure.height} ${config.profileSystem}`}
          wilayaName={selectedWilaya}
          clientName="Chantier Client"
        />
      )}

      {/* MULTI-POINT ESPAGNOLETTE LOCKING & BURGLARY RESISTANCE MODAL */}
      {showSecurityModal && (
        <SecurityLockingModal
          isOpen={showSecurityModal}
          onClose={() => setShowSecurityModal(false)}
          initialWidth={cadStructure.width}
          initialHeight={cadStructure.height}
          windowReference={`Châssis ${cadStructure.width}x${cadStructure.height} ${config.profileSystem}`}
          wilayaName={selectedWilaya}
          clientName="Chantier Client"
        />
      )}

      {/* STRUCTURAL SILICONE GLAZING (VEC / VEP) MODAL */}
      {showStructuralGlazingModal && (
        <StructuralGlazingModal
          isOpen={showStructuralGlazingModal}
          onClose={() => setShowStructuralGlazingModal(false)}
          initialWidth={cadStructure.width}
          initialHeight={cadStructure.height}
          windowReference={`VEC ${cadStructure.width}x${cadStructure.height} ${config.profileSystem}`}
          wilayaName={selectedWilaya}
          clientName="Chantier Client"
        />
      )}

      {/* INTEGRATED BLIND IN INSULATED GLAZING MODAL */}
      {showIntegratedBlindModal && (
        <IntegratedBlindModal
          isOpen={showIntegratedBlindModal}
          onClose={() => setShowIntegratedBlindModal(false)}
          initialWidth={cadStructure.width}
          initialHeight={cadStructure.height}
          windowReference={`Store Intégré ${cadStructure.width}x${cadStructure.height} ${config.profileSystem}`}
          wilayaName={selectedWilaya}
          clientName="Chantier Client"
        />
      )}

      {/* WINDOW DRAINAGE & WATER EVACUATION MODAL */}
      {showDrainageModal && (
        <WindowDrainageModal
          isOpen={showDrainageModal}
          onClose={() => setShowDrainageModal(false)}
          initialWidth={cadStructure.width}
          initialHeight={cadStructure.height}
          windowReference={`Drainage ${cadStructure.width}x${cadStructure.height} ${config.profileSystem}`}
          wilayaName={selectedWilaya}
          clientName="Chantier Client"
        />
      )}

      {/* CORNER JOINT CRIMPING & CLEAT RESISTANCE MODAL */}
      {showCornerCrimpingModal && (
        <CornerCrimpingModal
          isOpen={showCornerCrimpingModal}
          onClose={() => setShowCornerCrimpingModal(false)}
          initialWidth={cadStructure.width}
          initialHeight={cadStructure.height}
          windowReference={`Onglet ${cadStructure.width}x${cadStructure.height} ${config.profileSystem}`}
          wilayaName={selectedWilaya}
          clientName="Chantier Client"
        />
      )}

      {/* HANDLE ERGONOMICS & OPERATING FORCES PMR MODAL */}
      {showHandleErgonomicsModal && (
        <HandleErgonomicsModal
          isOpen={showHandleErgonomicsModal}
          onClose={() => setShowHandleErgonomicsModal(false)}
          initialWidth={cadStructure.width}
          initialHeight={cadStructure.height}
          windowReference={`Poignée ${cadStructure.width}x${cadStructure.height} ${config.profileSystem}`}
          wilayaName={selectedWilaya}
          clientName="Chantier Client"
        />
      )}

      {/* FRICTION STAY & PROJECTING WINDOW SASH SAFETY MODAL */}
      {showFrictionStayModal && (
        <FrictionStayModal
          isOpen={showFrictionStayModal}
          onClose={() => setShowFrictionStayModal(false)}
          initialWidth={cadStructure.width}
          initialHeight={cadStructure.height}
          windowReference={`Compas ${cadStructure.width}x${cadStructure.height} ${config.profileSystem}`}
          wilayaName={selectedWilaya}
          clientName="Chantier Client"
        />
      )}

      {/* ARCHITECTURAL BRISE-SOLEIL & CANTILEVER BRACKET STRUCTURAL MODAL */}
      {showBriseSoleilModal && (
        <BriseSoleilModal
          isOpen={showBriseSoleilModal}
          onClose={() => setShowBriseSoleilModal(false)}
          initialWidth={cadStructure.width}
          projectReference={`Brise-Soleil ${cadStructure.width}x${cadStructure.height} ${config.profileSystem}`}
          wilayaName={selectedWilaya}
          clientName="Chantier Client"
        />
      )}

      {/* NATURAL SMOKE & HEAT EXHAUST VENTILATOR (DENFC) MODAL */}
      {showSmokeVentModal && (
        <SmokeVentilationModal
          isOpen={showSmokeVentModal}
          onClose={() => setShowSmokeVentModal(false)}
          initialWidth={cadStructure.width}
          initialHeight={cadStructure.height}
          projectReference={`DENFC ${cadStructure.width}x${cadStructure.height} ${config.profileSystem}`}
          wilayaName={selectedWilaya}
          clientName="Chantier Client"
        />
      )}

      {/* ROLLER SHUTTER STORM WIND SLAT DEFLECTION & GUIDE RAIL RETENTION MODAL */}
      {showShutterWindModal && (
        <RollerShutterWindModal
          isOpen={showShutterWindModal}
          onClose={() => setShowShutterWindModal(false)}
          initialWidth={cadStructure.width}
          initialHeight={cadStructure.height}
          projectReference={`Volet Roulant ${cadStructure.width}x${cadStructure.height} ${config.profileSystem}`}
          wilayaName={selectedWilaya}
          clientName="Chantier Client"
        />
      )}

      {/* PERIMETER SEALANT JOINT WIDTH & THERMAL MOVEMENT MODAL */}
      {showSealantModal && (
        <PerimeterSealantModal
          isOpen={showSealantModal}
          onClose={() => setShowSealantModal(false)}
          initialWidth={cadStructure.width}
          initialHeight={cadStructure.height}
          projectReference={`Calfeutrement ${cadStructure.width}x${cadStructure.height} ${config.profileSystem}`}
          wilayaName={selectedWilaya}
          clientName="Chantier Client"
        />
      )}

      {/* STRUCTURAL GLASS BALUSTRADE & CANTILEVER LOAD MODAL */}
      {showBalustradeModal && (
        <GlassBalustradeModal
          isOpen={showBalustradeModal}
          onClose={() => setShowBalustradeModal(false)}
          initialWidth={cadStructure.width}
          initialHeight={cadStructure.height}
          projectReference={`Garde-Corps ${cadStructure.width}x${cadStructure.height} ${config.profileSystem}`}
          wilayaName={selectedWilaya}
          clientName="Chantier Client"
        />
      )}

      {/* BIOCLIMATIC LOUVRE PERGOLA STRUCTURAL & HYDRAULIC MODAL */}
      {showBioclimaticPergolaModal && (
        <BioclimaticPergolaModal
          isOpen={showBioclimaticPergolaModal}
          onClose={() => setShowBioclimaticPergolaModal(false)}
          initialWidth={cadStructure.width}
          initialLength={cadStructure.height}
          projectReference={`Pergola ${cadStructure.width}x${cadStructure.height} ${config.profileSystem}`}
          wilayaName={selectedWilaya}
          clientName="Chantier Client"
        />
      )}

      {/* SOLAR SUNSHADE & ARCHITECTURAL LOUVER MODAL */}
      {showSolarSunshadeModal && (
        <SolarSunshadeModal
          isOpen={showSolarSunshadeModal}
          onClose={() => setShowSolarSunshadeModal(false)}
          initialWidth={cadStructure.width}
          initialHeight={cadStructure.height}
          projectReference={`Brise-Soleil ${cadStructure.width}x${cadStructure.height} ${config.profileSystem}`}
          wilayaName={selectedWilaya}
          clientName="Chantier Client"
        />
      )}

      {/* HEAVY SLIDING CARRIAGE & PMR FORCE AUDITOR MODAL */}
      {showSlidingCarriageModal && (
        <SlidingCarriageModal
          isOpen={showSlidingCarriageModal}
          onClose={() => setShowSlidingCarriageModal(false)}
          initialWidth={cadStructure.width}
          initialHeight={cadStructure.height}
          projectReference={`Coulissant ${cadStructure.width}x${cadStructure.height} ${config.profileSystem}`}
          wilayaName={selectedWilaya}
          clientName="Chantier Client"
        />
      )}
    </div>
  );
};

export default MobileCadScreen;
