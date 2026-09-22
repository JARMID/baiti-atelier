import React, { useState, useMemo } from 'react';
import { useConfigStore } from '../../store/configStore';
import type {
  CadStructure,
  CellType,
  ArchType,
  ShutterBoxType,
  ShutterSlatType,
  ShutterDriveType,
} from '../../types/cad';
import { computeCadCells, computeDetailedBOM } from '../../utils/cadEngine';
import {
  generateClientDevisPdf,
  generateWorkshopCutSheetPdf,
  generateBpuDqeTenderPdf,
} from '../../utils/pdfGenerator';
import { downloadCadDxf } from '../../utils/dxfExporter';
import { downloadBomCsv } from '../../utils/csvExporter';
import {
  Grid,
  Plus,
  Trash2,
  FileDown,
  Printer,
  Box,
  ShieldCheck,
  Thermometer,
  Volume2,
  FileSpreadsheet,
  Edit2,
  Check,
  X,
  ScanLine,
  FileText,
  Compass,
} from 'lucide-react';
import { CuttingAssemblyTerminal } from '../optimizer/CuttingAssemblyTerminal';
import { getTranslation } from '../../utils/i18n';
import { playTactileClick, playClampSound, playSwitchSound } from '../../utils/audioFeedback';

export const CadStudio2D: React.FC = () => {
  const { config, cost, selectedWilaya, setWidth, setHeight, language, theme } = useConfigStore();
  const t = getTranslation(language);

  // Initial structure based on current width/height
  const [structure, setStructure] = useState<CadStructure>({
    width: config.width,
    height: config.height,
    verticalDividers: [Math.round(config.width / 2)], // Default 1 central mullion (2 panels)
    horizontalDividers: [],
    cellTypes: {
      '0-0': 'sash_left',
      '0-1': 'sash_right',
    },
  });

  const [selectedCellKey, setSelectedCellKey] = useState<string | null>(null);
  const [activeBomTab, setActiveBomTab] = useState<
    'profiles' | 'glass' | 'shutter' | 'hardware' | 'thermal' | 'bending'
  >('profiles');

  // Arched / Curved Window Geometry State (Algérie: Plein Cintre / Surbaissé)
  const [archType, setArchType] = useState<ArchType>('none');
  const [archHeightMm, setArchHeightMm] = useState<number>(300);

  // Roller Shutter (Volet Roulant Monobloc / Rénovation) State
  const [shutterEnabled, setShutterEnabled] = useState(false);
  const [shutterBoxType, setShutterBoxType] = useState<ShutterBoxType>('monobloc_pvc');
  const [shutterBoxHeightMm, setShutterBoxHeightMm] = useState<number>(180);
  const [shutterSlatType, setShutterSlatType] = useState<ShutterSlatType>('alu_39');
  const [shutterDriveType, setShutterDriveType] = useState<ShutterDriveType>('motor_radio');
  const [shutterSlatColor] = useState<string>('Blanc RAL 9016');
  const [includeMosquitoNet] = useState<boolean>(false);

  // Interactive Dimension In-Place Editing
  const [editingDim, setEditingDim] = useState<'width' | 'height' | null>(null);
  const [dimInput, setDimInput] = useState<string>('');

  // Shop floor cutting & assembly operator terminal state
  const [isAssemblyTerminalOpen, setIsAssemblyTerminalOpen] = useState(false);

  // Workshop Dimension Callout Mode: fabrication (Hors-Tout), tableau (Maçonnerie +10mm), daylight (Clair de jour)
  const [dimensionRefMode, setDimensionRefMode] = useState<'fabrication' | 'tableau' | 'daylight'>('fabrication');

  // Sync dimensions when config changes from external presets
  React.useEffect(() => {
    queueMicrotask(() => {
      setStructure((prev) => {
        if (prev.width === config.width && prev.height === config.height) return prev;
        return {
          ...prev,
          width: config.width,
          height: config.height,
          verticalDividers: prev.verticalDividers.map((x) =>
            Math.min(config.width - 100, Math.max(100, Math.round((x / prev.width) * config.width)))
          ),
        };
      });
    });
  }, [config.width, config.height]);

  const effectiveStructure: CadStructure = useMemo(
    () => ({
      ...structure,
      archType,
      archHeightMm: archType === 'full_arch' ? Math.round(structure.width / 2) : archHeightMm,
      shutterConfig: shutterEnabled
        ? {
            enabled: true,
            boxType: shutterBoxType,
            boxHeightMm: shutterBoxHeightMm,
            slatType: shutterSlatType,
            driveType: shutterDriveType,
            slatColor: shutterSlatColor,
            includeMosquitoNet,
            automaticLocks: true,
          }
        : undefined,
    }),
    [
      structure,
      archType,
      archHeightMm,
      shutterEnabled,
      shutterBoxType,
      shutterBoxHeightMm,
      shutterSlatType,
      shutterDriveType,
      shutterSlatColor,
      includeMosquitoNet,
    ]
  );

  const cells = useMemo(() => computeCadCells(effectiveStructure), [effectiveStructure]);
  const bom = useMemo(() => computeDetailedBOM(effectiveStructure, config), [effectiveStructure, config]);

  // Thermal and Acoustic Engineering Analysis based on Algerian DTR / CNERIB
  const thermalAnalysis = useMemo(() => {
    let ug = 2.8;
    let rw = 31;
    let glassLabel = 'Double vitrage 4/16/4 clair';

    if (config.glassType === 'double_clear') {
      ug = 2.7;
      rw = 32;
      glassLabel = 'Double vitrage 4/16/4 isolation';
    } else if (config.glassType === 'simple_clear') {
      ug = 5.7;
      rw = 29;
      glassLabel = 'Simple vitrage 6mm clair';
    } else if (config.glassType === 'stop_sol') {
      ug = 5.3;
      rw = 32;
      glassLabel = 'Double vitrage Stop-Sol réfléchissant';
    } else if (config.glassType === 'sable') {
      ug = 3.0;
      rw = 31;
      glassLabel = 'Vitrage sablé / dépoli translucide';
    }

    let uf = 2.4;
    let profileLabel = 'Alu Gamme 45 avec RPT';
    if (config.profileSystem === 'pvc_70_chamber') {
      uf = 1.5;
      profileLabel = 'PVC 70mm 5 chambres';
    } else if (config.profileSystem === 'gamme_40') {
      uf = 5.8;
      profileLabel = 'Alu Gamme 40 standard sans RPT';
    } else if (config.profileSystem === 'gamme_67_slide') {
      uf = 3.2;
      profileLabel = 'Alu Coulissant Lourd 67mm';
    }

    const totalAreaM2 = Math.max(0.2, (structure.width * structure.height) / 1000000);
    const glassAreaM2 = Math.min(totalAreaM2 * 0.75, bom.totalGlassAreaM2);
    const frameAreaM2 = Math.max(0.05, totalAreaM2 - glassAreaM2);
    const linearPerimeterM = (2 * (structure.width + structure.height)) / 1000;
    const psiG = 0.06; // Linear thermal bridge coefficient for spacer

    const uw = Number(
      ((glassAreaM2 * ug + frameAreaM2 * uf + psiG * linearPerimeterM) / totalAreaM2).toFixed(2)
    );
    const conformsDtr = uw <= 2.8;

    return {
      ug,
      uf,
      uw,
      rw,
      glassLabel,
      profileLabel,
      conformsDtr,
    };
  }, [config.glassType, config.profileSystem, structure.width, structure.height, bom.totalGlassAreaM2]);

  // Dimension editing triggers
  const startEditDim = (dim: 'width' | 'height') => {
    setEditingDim(dim);
    setDimInput(String(dim === 'width' ? structure.width : structure.height));
  };

  const saveDim = () => {
    const val = parseInt(dimInput, 10);
    if (!isNaN(val) && val >= 400 && val <= 4000) {
      if (editingDim === 'width') {
        setWidth(val);
        setStructure((prev) => ({
          ...prev,
          width: val,
          verticalDividers: prev.verticalDividers.map((x) =>
            Math.min(val - 100, Math.max(100, Math.round((x / prev.width) * val)))
          ),
        }));
      } else {
        setHeight(val);
        setStructure((prev) => ({
          ...prev,
          height: val,
          horizontalDividers: prev.horizontalDividers.map((y) =>
            Math.min(val - 100, Math.max(100, Math.round((y / prev.height) * val)))
          ),
        }));
      }
    }
    setEditingDim(null);
  };

  const adjustDimStep = (dim: 'width' | 'height', delta: number) => {
    if (dim === 'width') {
      const nextW = Math.max(400, Math.min(4000, structure.width + delta));
      setWidth(nextW);
      setStructure((prev) => ({
        ...prev,
        width: nextW,
        verticalDividers: prev.verticalDividers.map((x) =>
          Math.min(nextW - 100, Math.max(100, Math.round((x / prev.width) * nextW)))
        ),
      }));
    } else {
      const nextH = Math.max(400, Math.min(3200, structure.height + delta));
      setHeight(nextH);
      setStructure((prev) => ({
        ...prev,
        height: nextH,
        horizontalDividers: prev.horizontalDividers.map((y) =>
          Math.min(nextH - 100, Math.max(100, Math.round((y / prev.height) * nextH)))
        ),
      }));
    }
  };

  // Mullion & Transom Actions
  const addVerticalMullion = () => {
    if (structure.verticalDividers.length >= 4) return;
    playTactileClick();
    const newX = Math.round(structure.width / (structure.verticalDividers.length + 2));
    setStructure((prev) => ({
      ...prev,
      verticalDividers: [...prev.verticalDividers, newX].sort((a, b) => a - b),
    }));
  };

  const removeVerticalMullion = (index: number) => {
    playTactileClick();
    setStructure((prev) => ({
      ...prev,
      verticalDividers: prev.verticalDividers.filter((_, i) => i !== index),
    }));
  };

  const addHorizontalTransom = () => {
    if (structure.horizontalDividers.length >= 3) return;
    playTactileClick();
    const newY = Math.round(structure.height * 0.7); // 70% height transom by default
    setStructure((prev) => ({
      ...prev,
      horizontalDividers: [...prev.horizontalDividers, newY].sort((a, b) => a - b),
    }));
  };

  const removeHorizontalTransom = (index: number) => {
    playTactileClick();
    setStructure((prev) => ({
      ...prev,
      horizontalDividers: prev.horizontalDividers.filter((_, i) => i !== index),
    }));
  };

  const toggleCellType = (cellKey: string) => {
    playTactileClick();
    const sequence: CellType[] = [
      'glass_fixed',
      'sash_left',
      'sash_right',
      'sash_tilt_turn',
      'sash_slide',
      'panel_solid',
    ];
    const current = structure.cellTypes[cellKey] || 'glass_fixed';
    const nextIdx = (sequence.indexOf(current) + 1) % sequence.length;
    const next = sequence[nextIdx];

    setStructure((prev) => ({
      ...prev,
      cellTypes: {
        ...prev.cellTypes,
        [cellKey]: next,
      },
    }));
  };

  // SVG viewport scaling calculation
  const archRise = archType === 'full_arch'
    ? Math.round(structure.width / 2)
    : archType === 'lowered_arch'
    ? archHeightMm
    : 0;
  const shutterBoxRise = shutterEnabled ? shutterBoxHeightMm : 0;
  const totalVisualHeight = structure.height + archRise + shutterBoxRise;

  const svgWidth = 520;
  const svgHeight = 440;
  const padding = 55;
  const scale = Math.min(
    (svgWidth - padding * 2) / structure.width,
    (svgHeight - padding * 2) / totalVisualHeight
  );

  const drawW = structure.width * scale;
  const drawH = structure.height * scale;
  const drawArchRise = archRise * scale;
  const drawShutterRise = shutterBoxRise * scale;

  const startX = (svgWidth - drawW) / 2;
  const startY = (svgHeight - (drawH + drawArchRise + drawShutterRise)) / 2 + drawArchRise + drawShutterRise;

  const handleDownloadDevis = () => {
    playClampSound();
    generateClientDevisPdf(config, cost, 'Client Particulier', '05 50 12 34 56', selectedWilaya);
  };

  const handleDownloadCutSheet = () => {
    playClampSound();
    generateWorkshopCutSheetPdf(effectiveStructure, config, bom);
  };

  const handleDownloadDxf = () => {
    playClampSound();
    downloadCadDxf(
      effectiveStructure,
      `menuiserie_${Math.round(structure.width)}x${Math.round(totalVisualHeight)}.dxf`,
      `Chantier ${selectedWilaya} - ${Math.round(structure.width)}x${Math.round(totalVisualHeight)}mm`
    );
  };

  const handleDownloadCsv = () => {
    playClampSound();
    downloadBomCsv(
      bom,
      config,
      `debit_scie_${Math.round(structure.width)}x${Math.round(totalVisualHeight)}mm.csv`
    );
  };

  const handleDownloadBpuDqe = () => {
    playClampSound();
    generateBpuDqeTenderPdf(
      effectiveStructure,
      config,
      cost,
      bom,
      `Projet Châssis ${selectedWilaya} - ${Math.round(structure.width)}x${Math.round(totalVisualHeight)}mm`,
      'Maître d’Ouvrage / Promoteur',
      selectedWilaya
    );
  };

  const handleDownloadSvg = () => {
    playClampSound();
    const svgEl = document.getElementById('cad-svg-canvas');
    if (!svgEl) return;
    const serializer = new XMLSerializer();
    const svgStr = serializer.serializeToString(svgEl);
    const blob = new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `plan_cad_${Math.round(structure.width)}x${Math.round(totalVisualHeight)}mm.svg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const displayWidth =
    dimensionRefMode === 'tableau'
      ? structure.width + 10
      : dimensionRefMode === 'daylight'
      ? Math.max(100, structure.width - 180)
      : structure.width;

  const displayHeight =
    dimensionRefMode === 'tableau'
      ? Math.round(totalVisualHeight + 10)
      : dimensionRefMode === 'daylight'
      ? Math.max(100, structure.height - 190)
      : Math.round(totalVisualHeight);

  const dimensionSuffix =
    dimensionRefMode === 'tableau'
      ? 'Tableau'
      : dimensionRefMode === 'daylight'
      ? 'Clair'
      : 'Hors-Tout';

  return (
    <section
      id="cad-studio"
      className={`py-20 border-t relative transition-colors duration-300 ${
        theme === 'light'
          ? 'bg-[#F8FAFC] border-slate-200 text-slate-900'
          : 'bg-[#090C11] border-white/10 text-zinc-100'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/20 text-xs font-mono text-[#D4AF37] mb-3">
              <Grid className="w-3.5 h-3.5" />
              <span>{t.cadBadge}</span>
            </div>
            <h2 className={`text-3xl sm:text-4xl font-bold tracking-tight ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>
              {t.cadTitle}
            </h2>
            <p className={`text-sm mt-1.5 max-w-2xl ${theme === 'light' ? 'text-slate-600' : 'text-zinc-400'}`}>
              {t.cadSubtitle}
            </p>
          </div>

          {/* Direct Export Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={handleDownloadDevis}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#C5A880] to-[#D4AF37] hover:brightness-110 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-all shadow-lg shadow-[#D4AF37]/20 cursor-pointer hover-lift btn-press"
            >
              <FileDown className="w-4 h-4" />
              <span>{t.exportDevisPdf}</span>
            </button>

            <button
              onClick={handleDownloadCutSheet}
              className={`px-3.5 py-2 rounded-xl border font-medium text-xs flex items-center gap-1.5 transition-all cursor-pointer hover-lift btn-press ${
                theme === 'light'
                  ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'
                  : 'bg-white/10 hover:bg-white/15 text-zinc-200 border-white/15'
              }`}
            >
              <Printer className="w-4 h-4 text-emerald-500" />
              <span>{t.exportCutSheet}</span>
            </button>

            <button
              onClick={handleDownloadDxf}
              className={`px-3.5 py-2 rounded-xl border font-medium text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-sm hover-lift btn-press ${
                theme === 'light'
                  ? 'bg-cyan-50 hover:bg-cyan-100 text-cyan-800 border-cyan-200'
                  : 'bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
              }`}
              title="Exporter fichier vectoriel DXF pour AutoCAD et centres d'usinage CNC"
            >
              <Box className="w-4 h-4 text-cyan-500" />
              <span>{t.exportDxf}</span>
            </button>

            <button
              onClick={handleDownloadCsv}
              className={`px-3.5 py-2 rounded-xl border font-medium text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-sm hover-lift btn-press ${
                theme === 'light'
                  ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-200'
                  : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
              }`}
              title="Exporter fichier CSV pour scies double tête (Elumatec, Emmegi, FOM)"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
              <span>{t.exportCsv}</span>
            </button>

            <button
              onClick={handleDownloadSvg}
              className={`px-3.5 py-2 rounded-xl border font-medium text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-sm hover-lift btn-press ${
                theme === 'light'
                  ? 'bg-amber-50 hover:bg-amber-100 text-amber-800 border-amber-200'
                  : 'bg-[#D4AF37]/10 hover:bg-[#D4AF37]/20 text-[#D4AF37] border-[#D4AF37]/30'
              }`}
              title="Exporter le plan d'élévation 2D en dessin vectoriel SVG haute définition"
            >
              <FileDown className="w-4 h-4 text-[#D4AF37]" />
              <span>SVG Vector</span>
            </button>

            <button
              onClick={() => setIsAssemblyTerminalOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-[#D4AF37]/15 hover:bg-[#D4AF37]/25 text-[#D4AF37] border border-[#D4AF37]/35 font-medium text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-sm hover-lift btn-press"
              title="Ouvrir le terminal de poste atelier pour scannage code-barres et suivi montage"
            >
              <ScanLine className="w-4 h-4 text-[#D4AF37]" />
              <span>{t.workshopTerminal}</span>
            </button>

            <button
              onClick={handleDownloadBpuDqe}
              className={`px-3.5 py-2 rounded-xl border font-medium text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-sm hover-lift btn-press ${
                theme === 'light'
                  ? 'bg-amber-50 hover:bg-amber-100 text-amber-800 border-amber-200'
                  : 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border-amber-500/30'
              }`}
              title="Générer le Bordereau des Prix Unitaires et Devis Quantitatif Estimatif pour appels d'offres"
            >
              <FileText className="w-4 h-4 text-amber-500" />
              <span>{t.bpuTender}</span>
            </button>
          </div>
        </div>

        {/* Studio Workspace Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT: 2D CAD SVG BLUEPRINT (7 cols) */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            {/* Toolbar */}
            <div className={`flex flex-wrap items-center justify-between p-2.5 rounded-2xl border text-xs gap-2 transition-colors ${
              theme === 'light'
                ? 'bg-white border-slate-200 shadow-sm text-slate-800'
                : 'glass-panel border-white/10 text-zinc-200'
            }`}>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={addVerticalMullion}
                  className={`px-3 py-1.5 rounded-xl border flex items-center gap-1.5 transition-colors cursor-pointer ${
                    theme === 'light'
                      ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-200'
                      : 'bg-white/5 hover:bg-white/10 text-zinc-200 border-white/10'
                  }`}
                  title="Ajouter un montant intermédiaire"
                >
                  <Plus className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>{t.addMullion}</span>
                </button>

                <button
                  onClick={addHorizontalTransom}
                  className={`px-3 py-1.5 rounded-xl border flex items-center gap-1.5 transition-colors cursor-pointer ${
                    theme === 'light'
                      ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-200'
                      : 'bg-white/5 hover:bg-white/10 text-zinc-200 border-white/10'
                  }`}
                  title="Ajouter une traverse horizontale pour imposte ou allège"
                >
                  <Plus className="w-3.5 h-3.5 text-blue-400" />
                  <span>{t.addTransom}</span>
                </button>

                {/* Arch Shape Selector */}
                <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border ${
                  theme === 'light'
                    ? 'bg-slate-100 border-slate-200 text-slate-800'
                    : 'bg-black/40 border-white/10 text-white'
                }`}>
                  <Compass className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span className={`text-[11px] font-mono ${theme === 'light' ? 'text-slate-600' : 'text-zinc-400'}`}>
                    {t.archShapeLabel} :
                  </span>
                  <select
                    value={archType}
                    onChange={(e) => {
                      playSwitchSound();
                      setArchType(e.target.value as ArchType);
                    }}
                    className={`bg-transparent font-mono text-xs focus:outline-none cursor-pointer ${
                      theme === 'light' ? 'text-slate-800' : 'text-white'
                    }`}
                  >
                    <option value="none" className={theme === 'light' ? 'bg-white text-slate-800' : 'bg-[#0F141E] text-white'}>{t.archNone}</option>
                    <option value="full_arch" className={theme === 'light' ? 'bg-white text-slate-800' : 'bg-[#0F141E] text-white'}>{t.archFull}</option>
                    <option value="lowered_arch" className={theme === 'light' ? 'bg-white text-slate-800' : 'bg-[#0F141E] text-white'}>{t.archLowered}</option>
                  </select>
                  {archType === 'lowered_arch' && (
                    <div className="flex items-center gap-1 ml-1.5 pl-1.5 border-l border-white/15">
                      <span className={`text-[10px] ${theme === 'light' ? 'text-slate-500' : 'text-zinc-400'}`}>f:</span>
                      <input
                        type="number"
                        value={archHeightMm}
                        onChange={(e) =>
                          setArchHeightMm(
                            Math.max(50, Math.min(Math.round(structure.width / 2), Number(e.target.value)))
                          )
                        }
                        className={`w-12 px-1 py-0.5 rounded border text-xs font-mono text-center ${
                          theme === 'light'
                            ? 'bg-white border-slate-300 text-slate-900'
                            : 'bg-black/60 border-white/20 text-white'
                        }`}
                        step={25}
                      />
                      <span className={`text-[10px] ${theme === 'light' ? 'text-slate-500' : 'text-zinc-500'}`}>mm</span>
                    </div>
                  )}
                </div>

                {/* Roller Shutter Parametric Configuration */}
                <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border ${
                  theme === 'light'
                    ? 'bg-slate-100 border-slate-200 text-slate-800'
                    : 'bg-black/40 border-white/10 text-white'
                }`}>
                  <input
                    type="checkbox"
                    id="shutter-toggle"
                    checked={shutterEnabled}
                    onChange={(e) => {
                      playSwitchSound();
                      setShutterEnabled(e.target.checked);
                    }}
                    className="accent-[#D4AF37] w-3.5 h-3.5 cursor-pointer rounded"
                  />
                  <label htmlFor="shutter-toggle" className={`text-[11px] font-mono cursor-pointer select-none ${
                    theme === 'light' ? 'text-slate-700 font-medium' : 'text-zinc-300'
                  }`}>
                    {t.shutterToggleLabel}
                  </label>
                  {shutterEnabled && (
                    <>
                      <select
                        value={shutterBoxType}
                        onChange={(e) => setShutterBoxType(e.target.value as ShutterBoxType)}
                        className={`bg-transparent text-[#D4AF37] font-mono text-xs focus:outline-none cursor-pointer border-l ${
                          theme === 'light' ? 'border-slate-300' : 'border-white/10'
                        } pl-1.5 ml-1`}
                        title={t.shutterBoxTypeLabel}
                      >
                        <option value="monobloc_pvc" className={theme === 'light' ? 'bg-white text-slate-800' : 'bg-[#0F141E] text-white'}>Monobloc PVC</option>
                        <option value="monobloc_alu" className={theme === 'light' ? 'bg-white text-slate-800' : 'bg-[#0F141E] text-white'}>Monobloc Alu</option>
                        <option value="renovation_pan_coupe" className={theme === 'light' ? 'bg-white text-slate-800' : 'bg-[#0F141E] text-white'}>Rénov 45°</option>
                        <option value="renovation_rond" className={theme === 'light' ? 'bg-white text-slate-800' : 'bg-[#0F141E] text-white'}>Rénov Rond</option>
                      </select>
                      <select
                        value={shutterBoxHeightMm}
                        onChange={(e) => setShutterBoxHeightMm(Number(e.target.value))}
                        className={`bg-transparent font-mono text-xs focus:outline-none cursor-pointer border-l ${
                          theme === 'light' ? 'border-slate-300 text-slate-800' : 'border-white/10 text-white'
                        } pl-1.5 ml-1`}
                        title={t.shutterBoxHeightLabel}
                      >
                        <option value={137} className={theme === 'light' ? 'bg-white text-slate-800' : 'bg-[#0F141E] text-white'}>137mm</option>
                        <option value={150} className={theme === 'light' ? 'bg-white text-slate-800' : 'bg-[#0F141E] text-white'}>150mm</option>
                        <option value={165} className={theme === 'light' ? 'bg-white text-slate-800' : 'bg-[#0F141E] text-white'}>165mm</option>
                        <option value={180} className={theme === 'light' ? 'bg-white text-slate-800' : 'bg-[#0F141E] text-white'}>180mm</option>
                        <option value={205} className={theme === 'light' ? 'bg-white text-slate-800' : 'bg-[#0F141E] text-white'}>205mm</option>
                      </select>
                      <select
                        value={shutterSlatType}
                        onChange={(e) => setShutterSlatType(e.target.value as ShutterSlatType)}
                        className="bg-transparent text-cyan-300 font-mono text-xs focus:outline-none cursor-pointer border-l border-white/10 pl-1.5 ml-1"
                        title="Type de lames de tablier"
                      >
                        <option value="alu_39" className="bg-[#0F141E]">Alu 39mm</option>
                        <option value="alu_55" className="bg-[#0F141E]">Alu 55mm</option>
                        <option value="pvc_40" className="bg-[#0F141E]">PVC 40mm</option>
                        <option value="alu_extrude_securite" className="bg-[#0F141E]">Sécurité Extrudé</option>
                      </select>
                      <select
                        value={shutterDriveType}
                        onChange={(e) => setShutterDriveType(e.target.value as ShutterDriveType)}
                        className="bg-transparent text-amber-300 font-mono text-xs focus:outline-none cursor-pointer border-l border-white/10 pl-1.5 ml-1"
                        title="Système de manœuvre"
                      >
                        <option value="motor_radio" className="bg-[#0F141E]">Moteur Radio</option>
                        <option value="motor_wired" className="bg-[#0F141E]">Moteur Filaire</option>
                        <option value="manual_crank" className="bg-[#0F141E]">Treuil Manivelle</option>
                        <option value="manual_strap" className="bg-[#0F141E]">Sangle</option>
                      </select>
                    </>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2 text-zinc-400 font-mono text-[11px]">
                  <button
                    onClick={() => startEditDim('width')}
                    className="hover:text-[#D4AF37] underline underline-offset-2 flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <span>{structure.width} mm (L)</span>
                    <Edit2 className="w-2.5 h-2.5 opacity-60" />
                  </button>
                  <span>×</span>
                  <button
                    onClick={() => startEditDim('height')}
                    className="hover:text-[#D4AF37] underline underline-offset-2 flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <span>{structure.height} mm (H)</span>
                    <Edit2 className="w-2.5 h-2.5 opacity-60" />
                  </button>
                  <span>•</span>
                  <span>{cells.length} Compartiment{cells.length > 1 ? 's' : ''}</span>
                </div>

                {/* Dimension Reference Mode Selector */}
                <div className={`flex items-center gap-1 p-1 rounded-xl border text-[10.5px] font-mono ${
                  theme === 'light' ? 'bg-slate-100 border-slate-200' : 'bg-white/5 border-white/10'
                }`}>
                  <button
                    onClick={() => {
                      playTactileClick();
                      setDimensionRefMode('fabrication');
                    }}
                    className={`px-2 py-0.5 rounded-lg transition-all cursor-pointer ${
                      dimensionRefMode === 'fabrication'
                        ? 'bg-[#D4AF37] text-slate-950 font-bold shadow-sm'
                        : theme === 'light' ? 'text-slate-600 hover:text-slate-900' : 'text-zinc-400 hover:text-white'
                    }`}
                    title="Cote de fabrication hors-tout du dormant aluminium"
                  >
                    Hors-Tout
                  </button>
                  <button
                    onClick={() => {
                      playTactileClick();
                      setDimensionRefMode('tableau');
                    }}
                    className={`px-2 py-0.5 rounded-lg transition-all cursor-pointer ${
                      dimensionRefMode === 'tableau'
                        ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm'
                        : theme === 'light' ? 'text-slate-600 hover:text-slate-900' : 'text-zinc-400 hover:text-white'
                    }`}
                    title="Cote de réservation maçonnée (+10mm jeu de pose)"
                  >
                    Tableau (+10)
                  </button>
                  <button
                    onClick={() => {
                      playTactileClick();
                      setDimensionRefMode('daylight');
                    }}
                    className={`px-2 py-0.5 rounded-lg transition-all cursor-pointer ${
                      dimensionRefMode === 'daylight'
                        ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                        : theme === 'light' ? 'text-slate-600 hover:text-slate-900' : 'text-zinc-400 hover:text-white'
                    }`}
                    title="Clair de jour net de passage vitré"
                  >
                    Clair de Jour
                  </button>
                </div>
              </div>
            </div>

            {/* In-Place Dimension Quick Editor Modal/Overlay */}
            {editingDim && (
              <div className="p-3 bg-white/5 border border-[#D4AF37]/40 rounded-xl flex items-center justify-between gap-3 text-xs font-mono">
                <div className="flex items-center gap-2">
                  <span className="text-zinc-300 font-bold">
                    Modifier {editingDim === 'width' ? 'Largeur (L)' : 'Hauteur (H)'} :
                  </span>
                  <button
                    onClick={() => adjustDimStep(editingDim, -50)}
                    className="px-2 py-1 rounded bg-white/10 hover:bg-white/20 text-zinc-200 cursor-pointer"
                  >
                    -50
                  </button>
                  <input
                    type="number"
                    value={dimInput}
                    onChange={(e) => setDimInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && saveDim()}
                    className="w-20 px-2 py-1 rounded bg-black/60 border border-white/20 text-white font-mono text-xs focus:outline-none focus:border-[#D4AF37]"
                    min={400}
                    max={4000}
                    autoFocus
                  />
                  <button
                    onClick={() => adjustDimStep(editingDim, 50)}
                    className="px-2 py-1 rounded bg-white/10 hover:bg-white/20 text-zinc-200 cursor-pointer"
                  >
                    +50
                  </button>
                  <span className="text-zinc-400">mm</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={saveDim}
                    className="p-1.5 rounded-lg bg-gradient-to-r from-[#C5A880] to-[#D4AF37] hover:brightness-110 text-slate-950 font-bold cursor-pointer"
                    title="Valider"
                  >
                    <Check className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setEditingDim(null)}
                    className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-zinc-400 cursor-pointer"
                    title="Annuler"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* SVG Interactive Canvas */}
            <div className={`glass-panel-elevated p-4 rounded-2xl border relative overflow-hidden flex items-center justify-center min-h-[440px] transition-colors duration-300 ${
              theme === 'light'
                ? 'bg-slate-50 border-slate-200 shadow-inner'
                : 'bg-[#07090D] border-white/10'
            }`}>
              <svg
                id="cad-svg-canvas"
                width={svgWidth}
                height={svgHeight}
                viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                className="select-none"
              >
                {/* Blueprint Background Grid */}
                <defs>
                  <pattern id="cadGrid" width="20" height="20" patternUnits="userSpaceOnUse">
                    <path
                      d="M 20 0 L 0 0 0 20"
                      fill="none"
                      stroke={theme === 'light' ? 'rgba(0, 0, 0, 0.08)' : 'rgba(255, 255, 255, 0.04)'}
                      strokeWidth="1"
                    />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#cadGrid)" />

                {/* Dimension callout lines */}
                {/* Top Width */}
                <g onClick={() => startEditDim('width')} className="cursor-pointer group">
                  <line
                    x1={startX}
                    y1={startY - drawArchRise - drawShutterRise - 22}
                    x2={startX + drawW}
                    y2={startY - drawArchRise - drawShutterRise - 22}
                    stroke="#38BDF8"
                    strokeWidth="1.5"
                  />
                  <line
                    x1={startX}
                    y1={startY - drawArchRise - drawShutterRise - 28}
                    x2={startX}
                    y2={startY - drawArchRise - drawShutterRise - 16}
                    stroke="#38BDF8"
                    strokeWidth="1.5"
                  />
                  <line
                    x1={startX + drawW}
                    y1={startY - drawArchRise - drawShutterRise - 28}
                    x2={startX + drawW}
                    y2={startY - drawArchRise - drawShutterRise - 16}
                    stroke="#38BDF8"
                    strokeWidth="1.5"
                  />
                  <rect
                    x={startX + drawW / 2 - 58}
                    y={startY - drawArchRise - drawShutterRise - 35}
                    width="116"
                    height="18"
                    fill="#0A0E17"
                    rx="4"
                    stroke="#38BDF8"
                    strokeWidth="0.8"
                  />
                  <text
                    x={startX + drawW / 2}
                    y={startY - drawArchRise - drawShutterRise - 22}
                    fill="#38BDF8"
                    fontSize="10"
                    fontFamily="monospace"
                    textAnchor="middle"
                    fontWeight="bold"
                  >
                    {displayWidth} mm ({dimensionSuffix})
                  </text>
                </g>

                {/* Left Height */}
                <g onClick={() => startEditDim('height')} className="cursor-pointer group">
                  <line
                    x1={startX - 22}
                    y1={startY - drawArchRise - drawShutterRise}
                    x2={startX - 22}
                    y2={startY + drawH}
                    stroke="#38BDF8"
                    strokeWidth="1.5"
                  />
                  <line
                    x1={startX - 28}
                    y1={startY - drawArchRise - drawShutterRise}
                    x2={startX - 16}
                    y2={startY - drawArchRise - drawShutterRise}
                    stroke="#38BDF8"
                    strokeWidth="1.5"
                  />
                  <line
                    x1={startX - 28}
                    y1={startY + drawH}
                    x2={startX - 16}
                    y2={startY + drawH}
                    stroke="#38BDF8"
                    strokeWidth="1.5"
                  />
                  <rect
                    x={startX - 42}
                    y={startY + drawH / 2 - 30}
                    width="22"
                    height="60"
                    fill="#0A0E17"
                    rx="4"
                    stroke="#38BDF8"
                    strokeWidth="0.8"
                  />
                  <text
                    x={startX - 27}
                    y={startY + drawH / 2}
                    fill="#38BDF8"
                    fontSize="10"
                    fontFamily="monospace"
                    textAnchor="middle"
                    transform={`rotate(-90 ${startX - 27} ${startY + drawH / 2})`}
                    fontWeight="bold"
                  >
                    {displayHeight} mm ({dimensionSuffix})
                  </text>
                </g>

                {/* Roller Shutter Monobloc / Rénovation Caisson & Slat Guides */}
                {shutterEnabled && (
                  <g className="cursor-pointer group">
                    {/* Caisson Box Frame */}
                    <rect
                      x={startX}
                      y={startY - drawArchRise - drawShutterRise}
                      width={drawW}
                      height={drawShutterRise}
                      fill="#1E2430"
                      stroke="#D4AF37"
                      strokeWidth="2.5"
                      rx="2"
                    />

                    {/* Inspection Seam / Trappe de visite */}
                    <line
                      x1={startX + 4}
                      y1={startY - drawArchRise - drawShutterRise * 0.35}
                      x2={startX + drawW - 4}
                      y2={startY - drawArchRise - drawShutterRise * 0.35}
                      stroke="rgba(212, 175, 55, 0.45)"
                      strokeWidth="1"
                      strokeDasharray="4 3"
                    />

                    {/* Motorized / Mechanical Axle Symbol */}
                    <circle
                      cx={startX + 18}
                      cy={startY - drawArchRise - drawShutterRise / 2}
                      r={Math.min(8, Math.max(4, drawShutterRise / 3.5))}
                      fill="none"
                      stroke="#D4AF37"
                      strokeWidth="1.2"
                    />

                    {/* Caisson Label */}
                    <rect
                      x={startX + drawW / 2 - 65}
                      y={startY - drawArchRise - drawShutterRise / 2 - 8}
                      width="130"
                      height="16"
                      fill="#0F141E"
                      rx="3"
                      stroke="#D4AF37"
                      strokeWidth="0.8"
                    />
                    <text
                      x={startX + drawW / 2}
                      y={startY - drawArchRise - drawShutterRise / 2 + 4}
                      fill="#D4AF37"
                      fontSize="9"
                      fontFamily="monospace"
                      textAnchor="middle"
                      fontWeight="bold"
                    >
                      Coffre VR {shutterBoxHeightMm}mm ({shutterBoxType.startsWith('monobloc') ? 'Monobloc' : 'Rénov'})
                    </text>

                    {/* Left & Right Aluminum Guides running down the frame */}
                    <rect
                      x={startX}
                      y={startY}
                      width={Math.max(5, 28 * scale)}
                      height={drawH}
                      fill="rgba(212, 175, 55, 0.18)"
                      stroke="rgba(212, 175, 55, 0.5)"
                      strokeWidth="1"
                    />
                    <rect
                      x={startX + drawW - Math.max(5, 28 * scale)}
                      y={startY}
                      width={Math.max(5, 28 * scale)}
                      height={drawH}
                      fill="rgba(212, 175, 55, 0.18)"
                      stroke="rgba(212, 175, 55, 0.5)"
                      strokeWidth="1"
                    />

                    {/* Partially Lowered Slat Curtain (Lames aluminium injectées) */}
                    {Array.from({ length: 6 }).map((_, sIdx) => {
                      const slatH = Math.max(4, 39 * scale);
                      const sY = startY + sIdx * slatH;
                      if (sY + slatH > startY + drawH * 0.32) return null;
                      return (
                        <rect
                          key={`slat-preview-${sIdx}`}
                          x={startX + Math.max(5, 28 * scale)}
                          y={sY}
                          width={drawW - 2 * Math.max(5, 28 * scale)}
                          height={slatH - 1}
                          fill="#252D3D"
                          stroke="rgba(255, 255, 255, 0.15)"
                          strokeWidth="0.75"
                          rx="1"
                        />
                      );
                    })}
                  </g>
                )}

                {/* Arched Top Section (Plein Cintre ou Arc Surbaissé) */}
                {archType !== 'none' && (
                  <g className="cursor-pointer group">
                    {/* Arch glass pane */}
                    <path
                      d={`M ${startX + 3} ${startY} A ${
                        archType === 'full_arch'
                          ? drawW / 2 - 3
                          : Math.max(10, (bom.archDetails?.radiusMm || drawW) * scale - 3)
                      } ${
                        archType === 'full_arch'
                          ? drawW / 2 - 3
                          : Math.max(10, (bom.archDetails?.radiusMm || drawW) * scale - 3)
                      } 0 0 1 ${startX + drawW - 3} ${startY} Z`}
                      fill="rgba(59, 130, 246, 0.12)"
                      stroke="rgba(255, 255, 255, 0.15)"
                      strokeWidth="1.5"
                    />

                    {/* Outer arched extrusion frame */}
                    <path
                      d={`M ${startX} ${startY} A ${
                        archType === 'full_arch'
                          ? drawW / 2
                          : Math.max(10, (bom.archDetails?.radiusMm || drawW) * scale)
                      } ${
                        archType === 'full_arch'
                          ? drawW / 2
                          : Math.max(10, (bom.archDetails?.radiusMm || drawW) * scale)
                      } 0 0 1 ${startX + drawW} ${startY}`}
                      fill="none"
                      stroke="#384357"
                      strokeWidth="4"
                    />

                    {/* Transom separating rectangular body from arch */}
                    <line
                      x1={startX}
                      y1={startY}
                      x2={startX + drawW}
                      y2={startY}
                      stroke="#384357"
                      strokeWidth="3"
                    />

                    {/* Arch Center Radius Callout */}
                    <rect
                      x={startX + drawW / 2 - 58}
                      y={startY - drawArchRise / 2 - 8}
                      width="116"
                      height="16"
                      fill="#0F141E"
                      rx="4"
                      stroke="#D4AF37"
                      strokeWidth="0.8"
                    />
                    <text
                      x={startX + drawW / 2}
                      y={startY - drawArchRise / 2 + 4}
                      fill="#D4AF37"
                      fontSize="9.5"
                      fontFamily="monospace"
                      textAnchor="middle"
                      fontWeight="bold"
                    >
                      {archType === 'full_arch'
                        ? `Plein Cintre R=${Math.round(structure.width / 2)}`
                        : `Surbaissé f=${archHeightMm} R=${Math.round(bom.archDetails?.radiusMm || 0)}`}
                    </text>
                  </g>
                )}

                {/* Outer Frame Box (Dormant) */}
                <rect
                  x={startX}
                  y={startY}
                  width={drawW}
                  height={drawH}
                  fill="#181D26"
                  stroke="#384357"
                  strokeWidth="4"
                  rx="2"
                />

                {/* Internal Cells */}
                {cells.map((cell) => {
                  const xSplits = [0, ...structure.verticalDividers.slice().sort((a, b) => a - b), structure.width];
                  const ySplits = [0, ...structure.horizontalDividers.slice().sort((a, b) => a - b), structure.height];

                  const cellX = startX + xSplits[cell.col] * scale;
                  const cellY = startY + (structure.height - ySplits[cell.row + 1]) * scale;
                  const cW = cell.widthMm * scale;
                  const cH = cell.heightMm * scale;
                  const cellKey = `${cell.row}-${cell.col}`;

                  const isHovered = selectedCellKey === cellKey;

                  return (
                    <g
                      key={cellKey}
                      onClick={() => toggleCellType(cellKey)}
                      onMouseEnter={() => setSelectedCellKey(cellKey)}
                      onMouseLeave={() => setSelectedCellKey(null)}
                      className="cursor-pointer transition-opacity"
                    >
                      {/* Cell glass background */}
                      <rect
                        x={cellX + 3}
                        y={cellY + 3}
                        width={cW - 6}
                        height={cH - 6}
                        fill={
                          cell.type === 'panel_solid'
                            ? '#242C3D'
                            : isHovered
                            ? 'rgba(212, 175, 55, 0.15)'
                            : 'rgba(59, 130, 246, 0.08)'
                        }
                        stroke={isHovered ? '#D4AF37' : 'rgba(255, 255, 255, 0.15)'}
                        strokeWidth={cell.type.startsWith('sash_') ? '3' : '1.5'}
                        rx="2"
                      />

                      {/* Opening Kinematic Lines */}
                      {cell.type === 'sash_left' && (
                        <path
                          d={`M ${cellX + 8} ${cellY + 8} L ${cellX + cW - 8} ${cellY + cH / 2} L ${cellX + 8} ${
                            cellY + cH - 8
                          }`}
                          fill="none"
                          stroke="rgba(212, 175, 55, 0.7)"
                          strokeWidth="1.5"
                          strokeDasharray="4 3"
                        />
                      )}

                      {cell.type === 'sash_right' && (
                        <path
                          d={`M ${cellX + cW - 8} ${cellY + 8} L ${cellX + 8} ${cellY + cH / 2} L ${cellX + cW - 8} ${
                            cellY + cH - 8
                          }`}
                          fill="none"
                          stroke="rgba(212, 175, 55, 0.7)"
                          strokeWidth="1.5"
                          strokeDasharray="4 3"
                        />
                      )}

                      {cell.type === 'sash_tilt_turn' && (
                        <path
                          d={`M ${cellX + 8} ${cellY + cH - 8} L ${cellX + cW / 2} ${cellY + 8} L ${cellX + cW - 8} ${
                            cellY + cH - 8
                          }`}
                          fill="none"
                          stroke="rgba(59, 130, 246, 0.7)"
                          strokeWidth="1.5"
                          strokeDasharray="4 3"
                        />
                      )}

                      {cell.type === 'sash_slide' && (
                        <g>
                          <line
                            x1={cellX + cW / 2 - 14}
                            y1={cellY + cH / 2}
                            x2={cellX + cW / 2 + 14}
                            y2={cellY + cH / 2}
                            stroke="rgba(16, 185, 129, 0.8)"
                            strokeWidth="2"
                          />
                          <polygon
                            points={`${cellX + cW / 2 - 14},${cellY + cH / 2} ${cellX + cW / 2 - 8},${
                              cellY + cH / 2 - 4
                            } ${cellX + cW / 2 - 8},${cellY + cH / 2 + 4}`}
                            fill="rgba(16, 185, 129, 0.8)"
                          />
                        </g>
                      )}

                      {/* Cell text labels */}
                      <text
                        x={cellX + cW / 2}
                        y={cellY + cH / 2 - 6}
                        fill="#FFFFFF"
                        fontSize="10"
                        fontFamily="monospace"
                        textAnchor="middle"
                        fontWeight="bold"
                      >
                        {cell.type === 'glass_fixed'
                          ? 'FIXE'
                          : cell.type === 'sash_left'
                          ? 'BATTANT G'
                          : cell.type === 'sash_right'
                          ? 'BATTANT D'
                          : cell.type === 'sash_tilt_turn'
                          ? 'OSCILLO'
                          : cell.type === 'sash_slide'
                          ? 'COULISSANT'
                          : 'PANNEAU PLEIN'}
                      </text>

                      <text
                        x={cellX + cW / 2}
                        y={cellY + cH / 2 + 10}
                        fill="#94A3B8"
                        fontSize="9"
                        fontFamily="monospace"
                        textAnchor="middle"
                      >
                        {cell.widthMm} × {cell.heightMm} mm
                      </text>

                      {/* Glass cut size */}
                      <text
                        x={cellX + cW / 2}
                        y={cellY + cH / 2 + 22}
                        fill="#D4AF37"
                        fontSize="8"
                        fontFamily="monospace"
                        textAnchor="middle"
                      >
                        Verre: {cell.glassWidthMm} × {cell.glassHeightMm}
                      </text>
                    </g>
                  );
                })}
              </svg>

              {/* Instructional overlay note */}
              <div className="absolute bottom-2.5 left-4 text-[11px] font-mono text-zinc-500 bg-black/60 px-3 py-1 rounded-full border border-white/5 backdrop-blur-sm">
                Astuce : Cliquez sur un compartiment ou une cote pour la modifier
              </div>
            </div>

            {/* Divider management chips with direct centering */}
            <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
              {structure.verticalDividers.map((x, idx) => (
                <div
                  key={`v-${idx}`}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-zinc-300"
                >
                  <span>Meneau {idx + 1}: {x}mm</span>
                  <button
                    onClick={() => {
                      const centered = Math.round(structure.width / 2);
                      setStructure((prev) => ({
                        ...prev,
                        verticalDividers: prev.verticalDividers.map((v, i) => (i === idx ? centered : v)),
                      }));
                    }}
                    className="text-[10px] text-zinc-400 hover:text-white px-1 rounded bg-white/5"
                    title="Centrer à mi-largeur"
                  >
                    Centrer
                  </button>
                  <button
                    onClick={() => removeVerticalMullion(idx)}
                    className="text-zinc-500 hover:text-red-400 ml-1 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}

              {structure.horizontalDividers.map((y, idx) => (
                <div
                  key={`h-${idx}`}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-zinc-300"
                >
                  <span>Traverse {idx + 1}: {y}mm</span>
                  <button
                    onClick={() => {
                      const centered = Math.round(structure.height / 2);
                      setStructure((prev) => ({
                        ...prev,
                        horizontalDividers: prev.horizontalDividers.map((v, i) => (i === idx ? centered : v)),
                      }));
                    }}
                    className="text-[10px] text-zinc-400 hover:text-white px-1 rounded bg-white/5"
                    title="Centrer à mi-hauteur"
                  >
                    Centrer
                  </button>
                  <button
                    onClick={() => removeHorizontalTransom(idx)}
                    className="text-zinc-500 hover:text-red-400 ml-1 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT: REAL-TIME PRODUCTION BOM & CUT LIST (5 cols) */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            {/* BOM Summary Card */}
            <div className={`glass-panel-elevated p-5 rounded-2xl border flex flex-col gap-4 transition-colors ${
              theme === 'light'
                ? 'bg-white border-slate-200 shadow-md text-slate-800'
                : 'border-white/10 text-zinc-100'
            }`}>
              <div className={`flex items-center justify-between border-b pb-3 ${
                theme === 'light' ? 'border-slate-200' : 'border-white/10'
              }`}>
                <span className="text-xs uppercase font-mono font-semibold text-[#D4AF37]">
                  {t.exportCutSheet}
                </span>
                <span className={`text-xs font-mono ${theme === 'light' ? 'text-slate-500' : 'text-zinc-400'}`}>
                  Besoin : <strong className={theme === 'light' ? 'text-slate-900 font-bold' : 'text-white font-bold'}>{bom.estimatedBars6m} barres (6m)</strong>
                </span>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-2.5 text-center text-xs font-mono">
                <div className={`p-2.5 rounded-xl border ${
                  theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-white/5 border-white/5'
                }`}>
                  <span className={`text-[10px] block ${theme === 'light' ? 'text-slate-500' : 'text-zinc-500'}`}>Profilés</span>
                  <span className={`font-bold text-sm ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>{bom.totalProfileMeters} m</span>
                </div>
                <div className={`p-2.5 rounded-xl border ${
                  theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-white/5 border-white/5'
                }`}>
                  <span className={`text-[10px] block ${theme === 'light' ? 'text-slate-500' : 'text-zinc-500'}`}>Masse Alu</span>
                  <span className={`font-bold text-sm ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>{bom.totalProfileWeightKg} kg</span>
                </div>
                <div className={`p-2.5 rounded-xl border ${
                  theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-white/5 border-white/5'
                }`}>
                  <span className={`text-[10px] block ${theme === 'light' ? 'text-slate-500' : 'text-zinc-500'}`}>Vitrage Net</span>
                  <span className={`font-bold text-sm ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>{bom.totalGlassAreaM2} m²</span>
                </div>
              </div>

              {/* Tab Navigation for Detailed Breakdown */}
              <div className={`flex items-center gap-1 border-b pb-2 text-[11px] font-mono overflow-x-auto ${
                theme === 'light' ? 'border-slate-200' : 'border-white/10'
              }`}>
                <button
                  onClick={() => setActiveBomTab('profiles')}
                  className={`px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer ${
                    activeBomTab === 'profiles'
                      ? 'bg-[#D4AF37]/20 text-[#D4AF37] font-bold border border-[#D4AF37]/30'
                      : theme === 'light' ? 'text-slate-600 hover:text-slate-900' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  {t.bomTabProfiles} ({bom.cuts.length})
                </button>
                <button
                  onClick={() => setActiveBomTab('glass')}
                  className={`px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer ${
                    activeBomTab === 'glass'
                      ? 'bg-blue-500/20 text-blue-500 font-bold border border-blue-500/30'
                      : theme === 'light' ? 'text-slate-600 hover:text-slate-900' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  {t.bomTabGlass} ({bom.glasses.length})
                </button>
                <button
                  onClick={() => setActiveBomTab('hardware')}
                  className={`px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer ${
                    activeBomTab === 'hardware'
                      ? 'bg-amber-500/20 text-amber-500 font-bold border border-amber-500/30'
                      : theme === 'light' ? 'text-slate-600 hover:text-slate-900' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  {t.bomTabHardware} ({bom.hardwareSummary.length})
                </button>
                <button
                  onClick={() => setActiveBomTab('thermal')}
                  className={`px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer ${
                    activeBomTab === 'thermal'
                      ? 'bg-emerald-500/20 text-emerald-500 font-bold border border-emerald-500/30'
                      : theme === 'light' ? 'text-slate-600 hover:text-slate-900' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  {t.bomTabThermal}
                </button>
                {bom.archDetails && (
                  <button
                    onClick={() => setActiveBomTab('bending')}
                    className={`px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer ${
                      activeBomTab === 'bending'
                        ? 'bg-purple-500/20 text-purple-500 font-bold border border-purple-500/30'
                        : theme === 'light' ? 'text-slate-600 hover:text-slate-900' : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    {t.archedFrame} ({bom.archDetails.totalProfileMm}mm)
                  </button>
                )}
                {bom.shutterBom && (
                  <button
                    onClick={() => setActiveBomTab('shutter')}
                    className={`px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer ${
                      activeBomTab === 'shutter'
                        ? 'bg-[#D4AF37]/20 text-[#D4AF37] font-bold border border-[#D4AF37]/30'
                        : theme === 'light' ? 'text-slate-600 hover:text-slate-900' : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    {t.bomTabShutter} ({bom.shutterBom.slatCount} lames)
                  </button>
                )}
              </div>

              {/* Tab 1: Profile Cuts */}
              {activeBomTab === 'profiles' && (
                <div>
                  <span className="text-[11px] text-zinc-400 font-medium block mb-2 font-mono">
                    Découpes profilés avec angles de coupe :
                  </span>
                  <div className="max-h-56 overflow-y-auto flex flex-col gap-1.5 pr-1 text-xs font-mono">
                    {bom.cuts.map((cut, i) => (
                      <div
                        key={cut.id}
                        className="p-2 rounded-lg bg-white/5 border border-white/5 flex items-center justify-between text-zinc-300"
                      >
                        <div className="truncate max-w-[200px]">
                          <span className="text-zinc-500 mr-1.5">#{i + 1}</span>
                          <span>{cut.label}</span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="px-1.5 py-0.5 rounded bg-white/10 text-[10px] text-zinc-300">
                            {cut.cutLeftAngle}° / {cut.cutRightAngle}°
                          </span>
                          <span className="font-bold text-[#D4AF37]">{cut.lengthMm} mm</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tab 2: Glass Panels */}
              {activeBomTab === 'glass' && (
                <div>
                  <span className="text-[11px] text-zinc-400 font-medium block mb-2 font-mono">
                    Volumes de vitrage débités net :
                  </span>
                  <div className="flex flex-col gap-1.5 text-xs font-mono">
                    {bom.glasses.map((glass, i) => (
                      <div
                        key={glass.id}
                        className="p-2.5 rounded-lg bg-white/5 border border-white/5 flex items-center justify-between text-zinc-300"
                      >
                        <div>
                          <span className="text-white font-medium block">V#{i + 1} {glass.label}</span>
                          <span className="text-[10px] text-zinc-500">{glass.glassType}</span>
                        </div>
                        <span className="font-bold text-blue-400 text-right">
                          {glass.widthMm} × {glass.heightMm} mm
                          <span className="block text-[10px] text-zinc-400">{glass.areaM2} m²</span>
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tab 3: Hardware Nomenclature */}
              {activeBomTab === 'hardware' && (
                <div>
                  <span className="text-[11px] text-zinc-400 font-medium block mb-2 font-mono">
                    Quincaillerie, joints et accessoires de pose :
                  </span>
                  <div className="max-h-56 overflow-y-auto flex flex-col gap-1.5 pr-1 text-xs font-mono">
                    {bom.hardwareSummary.map((item, i) => (
                      <div
                        key={`hw-${i}`}
                        className="p-2 rounded-lg bg-white/5 border border-white/5 flex items-center justify-between text-zinc-300"
                      >
                        <span className="truncate pr-2">{item.name}</span>
                        <span className="font-bold text-amber-400 shrink-0">
                          {item.quantity} {item.unit}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tab 4: Thermal & Acoustic Calculation */}
              {activeBomTab === 'thermal' && (
                <div className="flex flex-col gap-3 text-xs font-mono">
                  <div className="p-3 rounded-xl bg-white/5 border border-white/5 flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-400 flex items-center gap-1.5">
                        <Thermometer className="w-3.5 h-3.5 text-orange-400" />
                        Isolation Globale Uw
                      </span>
                      <span className="font-bold text-white text-sm">
                        {thermalAnalysis.uw} W/(m²·K)
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-zinc-500">Ug Vitrage ({thermalAnalysis.glassLabel})</span>
                      <span className="text-zinc-300 font-bold">{thermalAnalysis.ug} W/(m²·K)</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-zinc-500">Uf Profilé ({thermalAnalysis.profileLabel})</span>
                      <span className="text-zinc-300 font-bold">{thermalAnalysis.uf} W/(m²·K)</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between">
                    <span className="text-zinc-400 flex items-center gap-1.5">
                      <Volume2 className="w-3.5 h-3.5 text-blue-400" />
                      Affaiblissement Acoustique Rw
                    </span>
                    <span className="font-bold text-blue-400 text-sm">
                      {thermalAnalysis.rw} dB
                    </span>
                  </div>

                  <div
                    className={`p-2.5 rounded-xl border flex items-center gap-2 text-[11px] ${
                      thermalAnalysis.conformsDtr
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                        : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                    }`}
                  >
                    <ShieldCheck className="w-4 h-4 shrink-0" />
                    <span>
                      {thermalAnalysis.conformsDtr
                        ? 'Conforme à la Règlementation Thermique Algérienne DTR C3-2'
                        : 'Isolation modérée, prévoyez un double vitrage RPT pour grands chantiers'}
                    </span>
                  </div>
                </div>
              )}

              {/* Tab 5: Bending Machine Specifications */}
              {activeBomTab === 'bending' && bom.archDetails && (
                <div className="flex flex-col gap-2.5 text-xs font-mono">
                  <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-200 flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white uppercase text-[11px]">
                        Fiche Opérateur Cintreuse 3 Galets
                      </span>
                      <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-mono text-[10px]">
                        {bom.archDetails.type === 'full_arch' ? 'Plein Cintre' : 'Arc Surbaissé'}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 pt-1 border-t border-purple-500/20 text-[11px]">
                      <div>
                        <span className="text-zinc-400 block text-[10px]">Rayon de Courbure (R) :</span>
                        <strong className="text-white text-sm">{bom.archDetails.radiusMm} mm</strong>
                      </div>
                      <div>
                        <span className="text-zinc-400 block text-[10px]">Flèche Centrale (f) :</span>
                        <strong className="text-white text-sm">{bom.archDetails.riseMm} mm</strong>
                      </div>
                      <div>
                        <span className="text-zinc-400 block text-[10px]">Arc Net Développé :</span>
                        <strong className="text-emerald-400 text-sm">{bom.archDetails.arcLengthMm} mm</strong>
                      </div>
                      <div>
                        <span className="text-zinc-400 block text-[10px]">Talons de Serrage Galets :</span>
                        <strong className="text-amber-400 text-sm">+{bom.archDetails.clampLeadMm} mm (2×100)</strong>
                      </div>
                    </div>
                    <div className="pt-1 text-[11px] text-zinc-300 border-t border-purple-500/20">
                      <span>Longueur Totale Débitée : </span>
                      <strong className="text-[#D4AF37] text-sm">{bom.archDetails.totalProfileMm} mm</strong>
                      <span className="text-zinc-400 ml-2">({bom.archDetails.angleDeg}° au centre)</span>
                    </div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-[11px] text-zinc-400 flex flex-col gap-1">
                    <p className="font-bold text-zinc-300">Consignes de roulage atelier :</p>
                    <p>• Réaliser un tracé d'épure au sol à l'échelle 1:1 pour contrôle géométrique du rayon.</p>
                    <p>• Galets en résine synthétique obligatoires pour préserver le thermolaquage.</p>
                    <p>• Tronçonner les talons droits de 100 mm après obtention de la flèche exacte.</p>
                  </div>
                </div>
              )}

              {/* Tab 6: Roller Shutter Specifications */}
              {activeBomTab === 'shutter' && bom.shutterBom && (
                <div className="flex flex-col gap-3 font-mono text-xs">
                  <div className="p-3 rounded-xl bg-black/40 border border-[#D4AF37]/30 flex flex-col gap-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-zinc-400">Tablier & Poids :</span>
                      <span className="font-bold text-white">
                        {bom.shutterBom.totalCurtainWeightKg} kg ({bom.shutterBom.totalCurtainAreaM2} m²)
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-zinc-400">Découpe Lames :</span>
                      <span className="font-bold text-[#D4AF37]">
                        {bom.shutterBom.slatCount} pcs × {bom.shutterBom.slatCutLengthMm} mm
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-zinc-400">Moteur Recommandé :</span>
                      <span className="font-bold text-emerald-400">
                        {bom.shutterBom.recommendedMotorTorqueNm} Nm (Axe Ø{bom.shutterBom.axleDiameterMm}mm)
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-zinc-400">Coulisses Guides :</span>
                      <span className="font-bold text-cyan-400">
                        2 × {bom.shutterBom.guideHeightMm} mm
                      </span>
                    </div>
                  </div>

                  <span className="text-[11px] text-zinc-400 font-medium block">
                    Nomenclature des composants du volet :
                  </span>
                  <div className="max-h-56 overflow-y-auto flex flex-col gap-1.5 pr-1">
                    {bom.shutterBom.components.map((comp, i) => (
                      <div
                        key={`vr-comp-${i}`}
                        className="p-2 rounded-lg bg-white/5 border border-white/5 flex items-center justify-between text-zinc-300"
                      >
                        <div className="truncate max-w-[210px]">
                          <span className="text-white font-medium block truncate">{comp.name}</span>
                          <span className="text-[10px] text-zinc-500 block truncate">{comp.description}</span>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="font-bold text-[#D4AF37]">
                            {comp.quantity} {comp.unit}
                          </span>
                          {comp.dimensions && (
                            <span className="text-[10px] text-zinc-400 block">{comp.dimensions}</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className={`pt-2 border-t grid grid-cols-2 gap-2 ${theme === 'light' ? 'border-slate-200' : 'border-white/10'}`}>
                <button
                  onClick={handleDownloadDevis}
                  className="py-2.5 rounded-xl bg-[#D4AF37] hover:bg-[#C5A880] text-slate-950 font-semibold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md shadow-[#D4AF37]/20 cursor-pointer hover-lift"
                >
                  <FileDown className="w-3.5 h-3.5" />
                  <span>{t.exportDevisPdf}</span>
                </button>

                <button
                  onClick={handleDownloadCutSheet}
                  className="py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs flex items-center justify-center gap-1.5 transition-all shadow-md shadow-emerald-900/30 cursor-pointer hover-lift"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>{t.exportCutSheet}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Shop Floor Cutting & Assembly Terminal */}
      <CuttingAssemblyTerminal
        isOpen={isAssemblyTerminalOpen}
        onClose={() => setIsAssemblyTerminalOpen(false)}
        bom={bom}
        config={config}
        jobName={`Chantier ${selectedWilaya} - ${Math.round(structure.width)}x${Math.round(structure.height)}mm`}
      />
    </section>
  );
};
