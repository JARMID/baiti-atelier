import React, { useState, useMemo } from 'react';
import type { CutDemand1D, PieceSpec2D } from '../../types/optimizer';
import type { ShutterBoxType, ShutterSlatType, ShutterDriveType } from '../../types/cad';
import { optimize1DLinearStock } from '../../utils/linearCutOptimizer';
import { optimize2DGuillotine } from '../../utils/guillotineOptimizer';
import { useConfigStore } from '../../store/configStore';
import {
  Scissors,
  Grid,
  Layers,
  Sparkles,
  ZoomIn,
  ZoomOut,
  Plus,
  Trash2,
  Printer,
  ScanLine,
  ShieldCheck,
  ArrowRight,
  Sliders,
  FileSpreadsheet,
  Cpu,
  BookmarkPlus,
  PackageCheck,
} from 'lucide-react';
import { ThermalLabelsModal } from './ThermalLabelsModal';
import { CuttingAssemblyTerminal } from './CuttingAssemblyTerminal';
import { CncSawExportModal } from './CncSawExportModal';
import {
  getOffcutInventory,
  addOffcut,
  removeOffcut,
  type OffcutRecord,
} from '../../utils/offcutManager';
import { computeDetailedBOM, computeRollerShutterBOM } from '../../utils/cadEngine';
import { downloadLinearCutPlanCsv } from '../../utils/csvExporter';
import { getTranslation } from '../../utils/i18n';
import { playTactileClick, playClampSound, playSwitchSound } from '../../utils/audioFeedback';

let nextShutterId = 1;

export const CuttingStudio: React.FC = () => {
  const { config, language, theme } = useConfigStore();
  const isLight = theme === 'light';
  const isRtl = language === 'ar';
  const t = getTranslation(language);
  const [activeTab, setActiveTab] = useState<'1d' | '2d' | 'remnants' | 'shutter'>('1d');
  const [isLabelsModalOpen, setIsLabelsModalOpen] = useState(false);
  const [isTerminalOpen, setIsTerminalOpen] = useState(false);
  const [isCncExportOpen, setIsCncExportOpen] = useState(false);
  const [prioritizeStockOffcuts, setPrioritizeStockOffcuts] = useState(true);
  const [offcutInventory, setOffcutInventory] = useState<OffcutRecord[]>(() => getOffcutInventory());
  const [showAddOffcutModal, setShowAddOffcutModal] = useState(false);
  const [newOffcutLength, setNewOffcutLength] = useState(1400);
  const [newOffcutRack, setNewOffcutRack] = useState('CASIER-A-03');
  const [newOffcutProfile, setNewOffcutProfile] = useState('TPR-40');
  const [newOffcutColor, setNewOffcutColor] = useState('Blanc RAL 9016');

  // --- ROLLER SHUTTER CALCULATOR STATE ---
  const [shutterWidth, setShutterWidth] = useState(config.width);
  const [shutterHeight, setShutterHeight] = useState(config.height);
  const [shutterBoxType, setShutterBoxType] = useState<ShutterBoxType>('monobloc_pvc');
  const [shutterBoxHeightMm, setShutterBoxHeightMm] = useState<number>(180);
  const [shutterSlatType, setShutterSlatType] = useState<ShutterSlatType>('alu_39');
  const [shutterDriveType, setShutterDriveType] = useState<ShutterDriveType>('motor_radio');
  const [shutterSlatColor, setShutterSlatColor] = useState<string>('Blanc RAL 9016');

  const shutterCalculation = useMemo(() => {
    return computeRollerShutterBOM(shutterWidth, shutterHeight, {
      enabled: true,
      boxType: shutterBoxType,
      boxHeightMm: shutterBoxHeightMm,
      slatType: shutterSlatType,
      driveType: shutterDriveType,
      slatColor: shutterSlatColor,
      automaticLocks: true,
    });
  }, [
    shutterWidth,
    shutterHeight,
    shutterBoxType,
    shutterBoxHeightMm,
    shutterSlatType,
    shutterDriveType,
    shutterSlatColor,
  ]);

  const transferShutterTo1D = () => {
    playClampSound();
    const newDemands: CutDemand1D[] = [
      {
        id: `vr-lames-${++nextShutterId}`,
        length: shutterCalculation.slatCutLengthMm,
        quantity: shutterCalculation.slatCount,
        miterLeft: 90,
        miterRight: 90,
        label: `Lames Volet ${shutterSlatType === 'alu_39' ? 'Alu 39mm' : shutterSlatType === 'alu_55' ? 'Alu 55mm' : 'PVC 40mm'}`,
        profileCode: shutterSlatType === 'alu_39' ? 'VR-L39' : shutterSlatType === 'alu_55' ? 'VR-L55' : 'VR-LPVC',
      },
      {
        id: `vr-coulisses-${++nextShutterId}`,
        length: shutterCalculation.guideHeightMm,
        quantity: 2,
        miterLeft: 90,
        miterRight: 90,
        label: 'Coulisses Volet (Joint Brosse)',
        profileCode: 'VR-COUL-53',
      },
      {
        id: `vr-finale-${++nextShutterId}`,
        length: shutterCalculation.slatCutLengthMm,
        quantity: 1,
        miterLeft: 90,
        miterRight: 90,
        label: 'Lame Finale Lourde + Bavette',
        profileCode: 'VR-FINALE',
      },
      {
        id: `vr-axe-${++nextShutterId}`,
        length: shutterCalculation.axleLengthMm,
        quantity: 1,
        miterLeft: 90,
        miterRight: 90,
        label: `Axe Octogonal Galva Ø${shutterCalculation.axleDiameterMm}mm`,
        profileCode: `VR-AXE-${shutterCalculation.axleDiameterMm}`,
      },
    ];

    setDemands1D((prev) => [...prev, ...newDemands]);
    setActiveTab('1d');
  };

  // Compute BOM for the workshop assembly terminal
  const currentBom = useMemo(() => {
    return computeDetailedBOM(
      {
        width: config.width,
        height: config.height,
        verticalDividers: [Math.round(config.width / 2)],
        horizontalDividers: [],
        cellTypes: { '0-0': 'sash_left', '0-1': 'sash_right' },
      },
      config
    );
  }, [config]);

  // --- 1D LINEAR PROFILE STATE ---
  const [kerf1D, setKerf1D] = useState(3);
  const [clampTrim1D, setClampTrim1D] = useState(25);
  const [barLength1D, setBarLength1D] = useState(6000);

  // Default demands derived from window config or custom list
  const [demands1D, setDemands1D] = useState<CutDemand1D[]>([
    { id: '1', length: Math.round(config.width), quantity: 2, miterLeft: 45, miterRight: 45, label: 'Dormant Haut/Bas', profileCode: 'TPR-40' },
    { id: '2', length: Math.round(config.height), quantity: 2, miterLeft: 45, miterRight: 45, label: 'Dormant Montants', profileCode: 'TPR-40' },
    { id: '3', length: Math.round(config.width * 0.52), quantity: 4, miterLeft: 45, miterRight: 45, label: 'Ouvrant Traverses', profileCode: 'TPR-OUV' },
    { id: '4', length: Math.round(config.height - 90), quantity: 4, miterLeft: 45, miterRight: 45, label: 'Ouvrant Montants', profileCode: 'TPR-OUV' },
    { id: '5', length: 1250, quantity: 3, miterLeft: 90, miterRight: 90, label: 'Parclose Vitrage', profileCode: 'PAR-16' },
  ]);

  // Sync with main window config changes
  const importFromCurrentConfig = () => {
    setDemands1D([
      { id: 'd-1', length: Math.round(config.width), quantity: 2, miterLeft: 45, miterRight: 45, label: 'Dormant Haut/Bas', profileCode: 'TPR-40' },
      { id: 'd-2', length: Math.round(config.height), quantity: 2, miterLeft: 45, miterRight: 45, label: 'Dormant Montants', profileCode: 'TPR-40' },
      { id: 'd-3', length: Math.round(config.width * 0.52), quantity: 4, miterLeft: 45, miterRight: 45, label: 'Ouvrant Traverses', profileCode: 'TPR-OUV' },
      { id: 'd-4', length: Math.round(config.height - 90), quantity: 4, miterLeft: 45, miterRight: 45, label: 'Ouvrant Montants', profileCode: 'TPR-OUV' },
      { id: 'd-5', length: Math.round(config.width * 0.52 - 40), quantity: 4, miterLeft: 90, miterRight: 90, label: 'Parclose Vitrage', profileCode: 'PAR-16' },
    ]);
  };

  const stockRemnants = useMemo(() => {
    if (!prioritizeStockOffcuts) return [];
    return offcutInventory.map((item) => ({
      id: item.id,
      length: item.lengthMm,
      isRemnant: true,
      profileCode: item.profileCode,
      costPerBar: 0,
    }));
  }, [prioritizeStockOffcuts, offcutInventory]);

  const linearResult = useMemo(() => {
    return optimize1DLinearStock(demands1D, stockRemnants, {
      kerf: kerf1D,
      clampTrim: clampTrim1D,
      standardBarLength: barLength1D,
      minRemnantLength: 800,
    });
  }, [demands1D, stockRemnants, kerf1D, clampTrim1D, barLength1D]);

  // --- 2D SHEET CUTTING STATE ---
  const [boardWidth, setBoardWidth] = useState(2440);
  const [boardHeight, setBoardHeight] = useState(1830);
  const [kerf2D, setKerf2D] = useState(3);
  const [allowRotate2D, setAllowRotate2D] = useState(true);
  const [zoom2D, setZoom2D] = useState(1.0);

  const [specs2D, setSpecs2D] = useState<PieceSpec2D[]>([
    { id: 'V-1', width: 920, height: 1140, quantity: 2, allowRotate: true, label: 'Double Vitrage 4/16/4' },
    { id: 'V-2', width: 450, height: 620, quantity: 4, allowRotate: true, label: 'Vitrage Imposte Fixe' },
    { id: 'P-3', width: 600, height: 350, quantity: 3, allowRotate: true, label: 'Panneau Soubassement' },
    { id: 'P-4', width: 320, height: 480, quantity: 2, allowRotate: true, label: 'Vitrage Latéral' },
  ]);

  const guillotineResult = useMemo(() => {
    return optimize2DGuillotine(specs2D, {
      boardWidth,
      boardHeight,
      kerf: kerf2D,
      allowRotate: allowRotate2D,
      objective: 'balanced',
    });
  }, [specs2D, boardWidth, boardHeight, kerf2D, allowRotate2D]);

  // Preset sheet dimensions
  const applySheetPreset = (preset: 'glass_standard' | 'glass_jumbo' | 'panel_mdf') => {
    playTactileClick();
    if (preset === 'glass_standard') {
      setBoardWidth(2440);
      setBoardHeight(1830);
      setKerf2D(0); // 0mm score for glass
    } else if (preset === 'glass_jumbo') {
      setBoardWidth(3210);
      setBoardHeight(2250);
      setKerf2D(0);
    } else if (preset === 'panel_mdf') {
      setBoardWidth(2800);
      setBoardHeight(2070);
      setKerf2D(3.5); // circular blade saw
    }
  };

  return (
    <section id="debitage-optimizer" className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/20 text-xs font-mono text-[#D4AF37] mb-3 backdrop-blur-md">
          <Scissors className="w-3.5 h-3.5" />
          <span>{t.cuttingBadge}</span>
        </div>
        <h2 className={`text-3xl sm:text-4xl font-extrabold tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
          {t.cuttingTitle}
        </h2>
        <p className={`text-sm sm:text-base mt-2 ${isLight ? 'text-slate-600' : 'text-zinc-400'}`}>
          {t.cuttingSubtitle}
        </p>
      </div>

      {/* Tabs Selector */}
      <div className="flex justify-center mb-8">
        <div className={`inline-flex flex-wrap p-1.5 rounded-2xl border ${
          isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#0F141C] border-white/10'
        }`}>
          <button
            onClick={() => {
              playSwitchSound();
              setActiveTab('1d');
            }}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer hover-lift btn-press ${
              activeTab === '1d'
                ? 'bg-[#D4AF37] text-slate-950 shadow-lg shadow-[#D4AF37]/20 font-bold'
                : isLight ? 'text-slate-600 hover:text-slate-900' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Scissors className="w-4 h-4" />
            <span>{t.tabLinear1D}</span>
          </button>
          <button
            onClick={() => {
              playSwitchSound();
              setActiveTab('2d');
            }}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer hover-lift btn-press ${
              activeTab === '2d'
                ? 'bg-[#D4AF37] text-slate-950 shadow-lg shadow-[#D4AF37]/20 font-bold'
                : isLight ? 'text-slate-600 hover:text-slate-900' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Grid className="w-4 h-4" />
            <span>{t.tabSheet2D}</span>
          </button>
          <button
            onClick={() => {
              playSwitchSound();
              setActiveTab('remnants');
            }}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer hover-lift btn-press ${
              activeTab === 'remnants'
                ? 'bg-[#D4AF37] text-slate-950 shadow-lg shadow-[#D4AF37]/20 font-bold'
                : isLight ? 'text-slate-600 hover:text-slate-900' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>{t.tabRemnants} ({linearResult.newRemnantsGenerated})</span>
          </button>
          <button
            onClick={() => {
              playSwitchSound();
              setActiveTab('shutter');
            }}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer hover-lift btn-press ${
              activeTab === 'shutter'
                ? 'bg-[#D4AF37] text-slate-950 shadow-lg shadow-[#D4AF37]/20 font-bold'
                : isLight ? 'text-slate-600 hover:text-slate-900' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>{t.tabShutterCalc}</span>
          </button>
        </div>
      </div>

      {/* TAB 1: 1D LINEAR PROFILE CUTTING */}
      {activeTab === '1d' && (
        <div className="flex flex-col gap-6">
          {/* Controls Bar */}
          <div className={`p-5 rounded-3xl border grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-center transition-all ${
            theme === 'light' ? 'bg-white border-slate-200 shadow-sm' : 'glass-panel border-white/10'
          }`}>
            <div>
              <label className={`block text-xs font-mono mb-1 ${theme === 'light' ? 'text-slate-600' : 'text-zinc-400'}`}>
                {t.standardBarLength}
              </label>
              <select
                value={barLength1D}
                onChange={(e) => setBarLength1D(Number(e.target.value))}
                className={`w-full rounded-xl px-3 py-2 text-sm border focus:outline-none ${
                  theme === 'light'
                    ? 'bg-slate-50 border-slate-300 text-slate-800'
                    : 'bg-[#080A0E] border-white/10 text-zinc-200'
                }`}
              >
                <option value={6000}>{t.standardAlgeriaBar}</option>
                <option value={6500}>6 500 mm</option>
                <option value={5800}>5 800 mm</option>
              </select>
            </div>
            <div>
              <label className={`block text-xs font-mono mb-1 ${theme === 'light' ? 'text-slate-600' : 'text-zinc-400'}`}>
                {t.sawBladeKerf}
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={kerf1D}
                  onChange={(e) => setKerf1D(Number(e.target.value))}
                  className={`w-full rounded-xl px-3 py-2 text-sm border focus:outline-none ${
                    theme === 'light'
                      ? 'bg-slate-50 border-slate-300 text-slate-800'
                      : 'bg-[#080A0E] border-white/10 text-zinc-200'
                  }`}
                />
                <span className={`text-xs ${theme === 'light' ? 'text-slate-500' : 'text-zinc-400'}`}>mm</span>
              </div>
            </div>
            <div>
              <label className={`block text-xs font-mono mb-1 ${theme === 'light' ? 'text-slate-600' : 'text-zinc-400'}`}>
                {t.clampMargin}
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={clampTrim1D}
                  onChange={(e) => setClampTrim1D(Number(e.target.value))}
                  className={`w-full rounded-xl px-3 py-2 text-sm border focus:outline-none ${
                    theme === 'light'
                      ? 'bg-slate-50 border-slate-300 text-slate-800'
                      : 'bg-[#080A0E] border-white/10 text-zinc-200'
                  }`}
                />
                <span className={`text-xs ${theme === 'light' ? 'text-slate-500' : 'text-zinc-400'}`}>mm</span>
              </div>
            </div>
            <div className="flex items-end">
              <button
                onClick={() => {
                  playClampSound();
                  importFromCurrentConfig();
                }}
                className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-mono transition-all cursor-pointer hover-lift btn-press ${
                  theme === 'light'
                    ? 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-800'
                    : 'bg-white/5 hover:bg-white/10 border-white/10 text-zinc-200'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>{t.importCurrentWindow}</span>
              </button>
            </div>

            {/* Prioritize stock offcuts checkbox */}
            <div className="col-span-full pt-1 flex flex-wrap items-center justify-between gap-2">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-mono select-none">
                <input
                  type="checkbox"
                  checked={prioritizeStockOffcuts}
                  onChange={(e) => {
                    playSwitchSound();
                    setPrioritizeStockOffcuts(e.target.checked);
                  }}
                  className="rounded text-[#D4AF37] focus:ring-[#D4AF37]"
                />
                <span className={isLight ? 'text-slate-700' : 'text-zinc-300'}>
                  Prioriser les chutes du casier atelier en stock ({offcutInventory.length} chutes actives)
                </span>
              </label>

              {linearResult.totalRemnantsUsed > 0 && (
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-bold">
                  {linearResult.totalRemnantsUsed} chute(s) réutilisée(s) !
                </span>
              )}
            </div>
          </div>

          {/* Metrics Overview Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className={`p-4 rounded-2xl border transition-all hover-lift ${
              theme === 'light' ? 'bg-white border-slate-200 shadow-sm' : 'glass-panel border-white/10'
            }`}>
              <span className={`text-xs font-mono ${theme === 'light' ? 'text-slate-500' : 'text-zinc-400'}`}>{t.stockBarsRequired}</span>
              <p className={`text-2xl font-extrabold mt-1 ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>{linearResult.totalStockBars}</p>
            </div>
            <div className={`p-4 rounded-2xl border transition-all hover-lift ${
              theme === 'light' ? 'bg-white border-slate-200 shadow-sm' : 'glass-panel border-white/10'
            }`}>
              <span className={`text-xs font-mono ${theme === 'light' ? 'text-slate-500' : 'text-zinc-400'}`}>{t.materialYield}</span>
              <p className="text-2xl font-extrabold text-emerald-400 mt-1">
                {(linearResult.overallUtilizationRate * 100).toFixed(1)}%
              </p>
            </div>
            <div className={`p-4 rounded-2xl border transition-all hover-lift ${
              theme === 'light' ? 'bg-white border-slate-200 shadow-sm' : 'glass-panel border-white/10'
            }`}>
              <span className={`text-xs font-mono ${theme === 'light' ? 'text-slate-500' : 'text-zinc-400'}`}>
                {language === 'ar' ? 'الطول الإجمالي المقطوع' : language === 'en' ? 'Total Cut Length' : 'Longueur Débitée Utile'}
              </span>
              <p className={`text-2xl font-extrabold mt-1 ${theme === 'light' ? 'text-slate-900' : 'text-zinc-100'}`}>
                {(linearResult.totalMaterialLength / 1000).toFixed(2)} m
              </p>
            </div>
            <div className={`p-4 rounded-2xl border transition-all hover-lift ${
              theme === 'light' ? 'bg-white border-slate-200 shadow-sm' : 'glass-panel border-white/10'
            }`}>
              <span className={`text-xs font-mono ${theme === 'light' ? 'text-slate-500' : 'text-zinc-400'}`}>{t.reusableRemnants} (≥80cm)</span>
              <p className="text-2xl font-extrabold text-[#D4AF37] mt-1">
                {linearResult.newRemnantsGenerated} {language === 'ar' ? 'قطعة' : language === 'en' ? 'piece(s)' : 'pièce(s)'}
              </p>
            </div>
          </div>

          {/* Bar Cut Maps (Graphical Representation) */}
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className={`text-base font-bold ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>
                Plans de Découpe par Barre
              </h3>
              <div className="flex items-center gap-3">
                <span className={`text-xs font-mono ${theme === 'light' ? 'text-slate-500' : 'text-zinc-400'}`}>
                  {linearResult.bars.length} barres calculées
                </span>

                <button
                  onClick={() => {
                    playTactileClick();
                    setIsCncExportOpen(true);
                  }}
                  className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-mono transition-all cursor-pointer shadow-sm hover-lift ${
                    isLight
                      ? 'bg-sky-50 hover:bg-sky-100 border-sky-300 text-sky-800'
                      : 'bg-sky-500/10 hover:bg-sky-500/20 border-sky-500/30 text-sky-400'
                  }`}
                  title="Exporter le programme CNC (ISO G-Code, Elumatec, Emmegi, Yilmaz)"
                >
                  <Cpu className="w-3.5 h-3.5" />
                  <span>Scie CNC (G-Code)</span>
                </button>

                <button
                  onClick={() => {
                    playClampSound();
                    downloadLinearCutPlanCsv(
                      linearResult,
                      `plan_debit_${linearResult.bars.length}barres_${config.width}x${config.height}.csv`
                    );
                  }}
                  className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-mono transition-all cursor-pointer shadow-sm hover-lift ${
                    isLight
                      ? 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-800'
                      : 'bg-white/10 hover:bg-white/15 border-white/20 text-white'
                  }`}
                  title="Exporter le plan de débit optimisé en format CSV / Excel"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                  <span>CSV Débit</span>
                </button>

                <button
                  onClick={() => {
                    playTactileClick();
                    setIsLabelsModalOpen(true);
                  }}
                  className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-mono transition-all cursor-pointer shadow-sm hover-lift ${
                    isLight
                      ? 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-800'
                      : 'bg-white/10 hover:bg-white/15 border-white/20 text-white'
                  }`}
                >
                  <Printer className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>{t.printThermalLabels}</span>
                </button>

                <button
                  onClick={() => {
                    playTactileClick();
                    setIsTerminalOpen(true);
                  }}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#D4AF37]/15 hover:bg-[#D4AF37]/25 border border-[#D4AF37]/35 text-xs font-mono text-[#D4AF37] transition-all cursor-pointer shadow-sm hover-lift"
                  title="Ouvrir le terminal interactif pour l'opérateur de scie et d'assemblage"
                >
                  <ScanLine className="w-3.5 h-3.5" />
                  <span>{t.openAssemblyTerminal}</span>
                </button>
              </div>
            </div>

            {linearResult.bars.map((bar) => (
              <div
                key={bar.barIndex}
                className={`p-5 rounded-2xl border flex flex-col gap-3 transition-all ${
                  theme === 'light'
                    ? 'bg-white border-slate-200 text-slate-800 shadow-sm'
                    : 'glass-panel border-white/10 text-zinc-200'
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-lg bg-[#D4AF37]/20 text-[#D4AF37] font-mono font-bold">
                      Barre #{bar.barIndex}
                    </span>
                    <span className={`font-mono ${theme === 'light' ? 'text-slate-600' : 'text-zinc-300'}`}>
                      {bar.stockLength} mm
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={theme === 'light' ? 'text-slate-500' : 'text-zinc-400'}>
                      Utilisé : <b className={theme === 'light' ? 'text-slate-800' : 'text-zinc-200'}>{(bar.utilizationRate * 100).toFixed(1)}%</b>
                    </span>
                    <span className={theme === 'light' ? 'text-slate-500' : 'text-zinc-400'}>
                      Chute : <b className={bar.isReusableRemnant ? 'text-emerald-500' : theme === 'light' ? 'text-slate-600' : 'text-zinc-400'}>{bar.wasteLength} mm</b>
                    </span>
                    {bar.isReusableRemnant && (
                      <span className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 font-mono text-[10px]">
                        {bar.remnantId} (Réutilisable)
                      </span>
                    )}
                  </div>
                </div>

                {/* Visual Bar Strip */}
                <div className={`relative h-10 w-full rounded-xl overflow-hidden border flex p-1 gap-0.5 ${
                  theme === 'light' ? 'bg-slate-100 border-slate-300' : 'bg-zinc-900 border-white/10'
                }`}>
                  {/* Pneumatic clamp allowance */}
                  <div
                    style={{ width: `${(bar.clampTrim / bar.stockLength) * 100}%` }}
                    className={`h-full rounded-sm flex items-center justify-center text-[9px] font-mono ${
                      theme === 'light' ? 'bg-slate-200 text-slate-500' : 'bg-zinc-700/40 text-zinc-400'
                    }`}
                    title={`Serrage: ${bar.clampTrim}mm`}
                  >
                    |
                  </div>

                  {/* Cut pieces */}
                  {bar.cuts.map((cut) => {
                    const widthPct = (cut.length / bar.stockLength) * 100;
                    return (
                      <div
                        key={cut.id}
                        style={{ width: `${widthPct}%` }}
                        className="h-full bg-gradient-to-r from-blue-600/85 to-indigo-600/85 hover:from-blue-500 hover:to-indigo-500 rounded-sm border border-blue-400/30 flex items-center justify-between px-2 text-[11px] font-mono text-white transition-all overflow-hidden"
                        title={`${cut.label} : ${cut.length}mm (${cut.miterLeft}° / ${cut.miterRight}°)`}
                      >
                        <span className="truncate">{cut.label}</span>
                        <span className="shrink-0 font-bold ml-1">{cut.length}</span>
                      </div>
                    );
                  })}

                  {/* Waste / Remnant zone */}
                  <div
                    style={{ width: `${(bar.wasteLength / bar.stockLength) * 100}%` }}
                    className={`h-full rounded-sm flex items-center justify-center text-[10px] font-mono ${
                      bar.isReusableRemnant
                        ? 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-400'
                        : theme === 'light'
                        ? 'bg-slate-200 text-slate-500'
                        : 'bg-red-500/10 text-zinc-500'
                    }`}
                  >
                    {bar.isReusableRemnant ? `Chute ${bar.wasteLength}mm` : `${bar.wasteLength}mm`}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: 2D SHEET CUTTING (GLASS & PANELS) */}
      {activeTab === '2d' && (
        <div className="flex flex-col gap-6">
          {/* Controls Bar */}
          <div className={`p-5 rounded-3xl border flex flex-col gap-4 transition-all ${
            isLight ? 'bg-white border-slate-200 shadow-sm text-slate-800' : 'glass-panel border-white/10 text-zinc-200'
          }`}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className={`text-xs font-mono ${isLight ? 'text-slate-600' : 'text-zinc-300'}`}>
                Gabarit de Plaque / Feuille :
              </span>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => applySheetPreset('glass_standard')}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-mono transition-colors cursor-pointer btn-press ${
                    isLight
                      ? 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-800'
                      : 'bg-white/5 hover:bg-white/10 border-white/10 text-zinc-300'
                  }`}
                >
                  Verre Standard (2440 × 1830)
                </button>
                <button
                  onClick={() => applySheetPreset('glass_jumbo')}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-mono transition-colors cursor-pointer btn-press ${
                    isLight
                      ? 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-800'
                      : 'bg-white/5 hover:bg-white/10 border-white/10 text-zinc-300'
                  }`}
                >
                  Verre Jumbo (3210 × 2250)
                </button>
                <button
                  onClick={() => applySheetPreset('panel_mdf')}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-mono transition-colors cursor-pointer btn-press ${
                    isLight
                      ? 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-800'
                      : 'bg-white/5 hover:bg-white/10 border-white/10 text-zinc-300'
                  }`}
                >
                  Panneau Bois / MDF (2800 × 2070)
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-center">
              <div>
                <label className={`block text-xs font-mono mb-1 ${isLight ? 'text-slate-600' : 'text-zinc-400'}`}>
                  Largeur Feuille (mm)
                </label>
                <input
                  type="number"
                  value={boardWidth}
                  onChange={(e) => setBoardWidth(Number(e.target.value))}
                  className={`w-full rounded-xl px-3 py-2 text-sm border focus:outline-none ${
                    isLight
                      ? 'bg-slate-50 border-slate-300 text-slate-900'
                      : 'bg-[#080A0E] border-white/10 text-zinc-200'
                  }`}
                />
              </div>
              <div>
                <label className={`block text-xs font-mono mb-1 ${isLight ? 'text-slate-600' : 'text-zinc-400'}`}>
                  Hauteur Feuille (mm)
                </label>
                <input
                  type="number"
                  value={boardHeight}
                  onChange={(e) => setBoardHeight(Number(e.target.value))}
                  className={`w-full rounded-xl px-3 py-2 text-sm border focus:outline-none ${
                    isLight
                      ? 'bg-slate-50 border-slate-300 text-slate-900'
                      : 'bg-[#080A0E] border-white/10 text-zinc-200'
                  }`}
                />
              </div>
              <div>
                <label className={`block text-xs font-mono mb-1 ${isLight ? 'text-slate-600' : 'text-zinc-400'}`}>
                  Trait de Coupe (Kerf mm)
                </label>
                <input
                  type="number"
                  value={kerf2D}
                  onChange={(e) => setKerf2D(Number(e.target.value))}
                  className={`w-full rounded-xl px-3 py-2 text-sm border focus:outline-none ${
                    isLight
                      ? 'bg-slate-50 border-slate-300 text-slate-900'
                      : 'bg-[#080A0E] border-white/10 text-zinc-200'
                  }`}
                />
              </div>
              <div className="flex items-center gap-2 pt-5">
                <input
                  id="rotateToggle"
                  type="checkbox"
                  checked={allowRotate2D}
                  onChange={(e) => {
                    playSwitchSound();
                    setAllowRotate2D(e.target.checked);
                  }}
                  className="w-4 h-4 rounded bg-zinc-800 text-[#D4AF37] focus:ring-0 cursor-pointer"
                />
                <label htmlFor="rotateToggle" className={`text-xs cursor-pointer ${isLight ? 'text-slate-700' : 'text-zinc-300'}`}>
                  Autoriser la Rotation à 90°
                </label>
              </div>
            </div>

            {/* 2D Piece Specs Table */}
            <div className={`pt-2 border-t flex flex-col gap-2 ${isLight ? 'border-slate-200' : 'border-white/10'}`}>
              <div className="flex items-center justify-between">
                <span className={`text-xs font-mono ${isLight ? 'text-slate-600' : 'text-zinc-400'}`}>
                  Pièces à Découper ({specs2D.length})
                </span>
                <button
                  onClick={() => {
                    playTactileClick();
                    setSpecs2D((prev) => [
                      ...prev,
                      { id: `P-${prev.length + 1}`, width: 600, height: 400, quantity: 1, allowRotate: true, label: 'Nouveau Vitrage' },
                    ]);
                  }}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#D4AF37]/20 text-[#D4AF37] hover:bg-[#D4AF37]/30 text-xs font-mono cursor-pointer btn-press"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Ajouter Pièce</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                {specs2D.map((s, idx) => (
                  <div
                    key={s.id}
                    className={`p-2.5 rounded-xl border flex items-center justify-between text-xs ${
                      isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#080A0E] border-white/5'
                    }`}
                  >
                    <div>
                      <span className={`font-bold ${isLight ? 'text-slate-900' : 'text-zinc-200'}`}>{s.label}</span>
                      <p className={`text-[11px] font-mono ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
                        {s.width} × {s.height} mm (×{s.quantity})
                      </p>
                    </div>
                    {specs2D.length > 1 && (
                      <button
                        onClick={() => {
                          playTactileClick();
                          setSpecs2D((prev) => prev.filter((_, i) => i !== idx));
                        }}
                        className="text-zinc-400 hover:text-red-500 p-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className={`p-4 rounded-2xl border transition-all hover-lift ${
              isLight ? 'bg-white border-slate-200 shadow-sm' : 'glass-panel border-white/10'
            }`}>
              <span className={`text-xs font-mono ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>Plaques Utilisées</span>
              <p className={`text-2xl font-extrabold mt-1 ${isLight ? 'text-slate-900' : 'text-white'}`}>{guillotineResult.totalSheetsUsed}</p>
            </div>
            <div className={`p-4 rounded-2xl border transition-all hover-lift ${
              isLight ? 'bg-white border-slate-200 shadow-sm' : 'glass-panel border-white/10'
            }`}>
              <span className={`text-xs font-mono ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>Rendement de Surface</span>
              <p className="text-2xl font-extrabold text-emerald-500 mt-1">
                {(guillotineResult.overallUtilization * 100).toFixed(1)}%
              </p>
            </div>
            <div className={`p-4 rounded-2xl border transition-all hover-lift ${
              isLight ? 'bg-white border-slate-200 shadow-sm' : 'glass-panel border-white/10'
            }`}>
              <span className={`text-xs font-mono ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>Surface Découpée</span>
              <p className={`text-2xl font-extrabold mt-1 ${isLight ? 'text-slate-900' : 'text-zinc-100'}`}>
                {guillotineResult.totalPieceAreaM2.toFixed(2)} m²
              </p>
            </div>
            <div className={`p-4 rounded-2xl border transition-all hover-lift ${
              isLight ? 'bg-white border-slate-200 shadow-sm' : 'glass-panel border-white/10'
            }`}>
              <span className={`text-xs font-mono ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>Coupes Guillotine</span>
              <p className="text-2xl font-extrabold text-[#D4AF37] mt-1">
                {guillotineResult.cuts.length} passes
              </p>
            </div>
          </div>

          {/* SVG Visual Board Renderers */}
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <h3 className={`text-base font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>Cartographie de Découpe Guillotine</h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    playTactileClick();
                    setZoom2D((z) => Math.max(0.6, z - 0.2));
                  }}
                  className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                    isLight ? 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100' : 'bg-white/5 hover:bg-white/10 border-white/10 text-zinc-300'
                  }`}
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <span className={`text-xs font-mono px-2 ${isLight ? 'text-slate-600' : 'text-zinc-400'}`}>{Math.round(zoom2D * 100)}%</span>
                <button
                  onClick={() => {
                    playTactileClick();
                    setZoom2D((z) => Math.min(2.0, z + 0.2));
                  }}
                  className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                    isLight ? 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100' : 'bg-white/5 hover:bg-white/10 border-white/10 text-zinc-300'
                  }`}
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
              </div>
            </div>

            {guillotineResult.boards.map((board) => {
              const svgWidth = 900 * zoom2D;
              const scale = svgWidth / boardWidth;
              const svgHeight = boardHeight * scale;
              const boardCuts = guillotineResult.cuts.filter((c) => c.boardIndex === board.index);

              return (
                <div
                  key={board.index}
                  className={`p-5 rounded-3xl border flex flex-col gap-3 transition-all ${
                    isLight ? 'bg-white border-slate-200 text-slate-800 shadow-sm' : 'glass-panel border-white/10 text-zinc-200'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono text-[#D4AF37] font-bold">
                      Planche #{board.index + 1} ({boardWidth} × {boardHeight} mm)
                    </span>
                    <span className={`font-mono ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
                      {board.strips.reduce((acc, s) => acc + s.pieces.length, 0)} pièces placées • {boardCuts.length} coupes
                    </span>
                  </div>

                  <div className="overflow-x-auto pb-2">
                    <svg
                      width={svgWidth}
                      height={svgHeight}
                      className={`rounded-2xl border ${
                        isLight ? 'border-slate-300 bg-slate-900' : 'border-zinc-800 bg-[#0A0D14]'
                      }`}
                    >
                      {/* Background plate */}
                      <rect x={0} y={0} width={svgWidth} height={svgHeight} fill="#0A0D14" />

                      {/* Placed Pieces */}
                      {board.strips.map((st, sIdx) => (
                        <g key={`strip-${sIdx}`}>
                          {st.pieces.map((p) => {
                            const px = p.x * scale;
                            const py = p.y * scale;
                            const pw = p.width * scale;
                            const ph = p.height * scale;

                            return (
                              <g key={p.id}>
                                <rect
                                  x={px}
                                  y={py}
                                  width={pw}
                                  height={ph}
                                  fill="#1E293B"
                                  stroke="#38BDF8"
                                  strokeWidth={1.5}
                                  className="transition-colors hover:fill-blue-900/40"
                                />
                                <text
                                  x={px + 6}
                                  y={py + 14}
                                  fontSize={10}
                                  fill="#E2E8F0"
                                  fontFamily="monospace"
                                  fontWeight="bold"
                                >
                                  {p.label || p.id}
                                </text>
                                <text
                                  x={px + 6}
                                  y={py + 26}
                                  fontSize={8.5}
                                  fill="#94A3B8"
                                  fontFamily="monospace"
                                >
                                  {Math.round(p.width)} × {Math.round(p.height)} mm {p.rotated ? '↻' : ''}
                                </text>
                              </g>
                            );
                          })}
                        </g>
                      ))}

                      {/* Red Dashed Guillotine Cuts with Sequence Badge */}
                      {boardCuts.map((c) => {
                        const x1 = c.x1 * scale;
                        const y1 = c.y1 * scale;
                        const x2 = c.x2 * scale;
                        const y2 = c.y2 * scale;
                        const midX = (x1 + x2) / 2;
                        const midY = (y1 + y2) / 2;

                        return (
                          <g key={`cut-${c.id}`}>
                            <line
                              x1={x1}
                              y1={y1}
                              x2={x2}
                              y2={y2}
                              stroke="#EF4444"
                              strokeWidth={1.5}
                              strokeDasharray="4 4"
                            />
                            <circle cx={midX} cy={midY} r={7} fill="#EF4444" />
                            <text
                              x={midX}
                              y={midY + 3.5}
                              textAnchor="middle"
                              fill="#FFFFFF"
                              fontSize={8}
                              fontFamily="monospace"
                              fontWeight="bold"
                            >
                              {c.id}
                            </text>
                          </g>
                        );
                      })}
                    </svg>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: REMNANT ASSET INVENTORY & RACK STORAGE */}
      {activeTab === 'remnants' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Top Banner & Quick Actions */}
          <div className={`p-6 rounded-3xl border flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all ${
            isLight ? 'bg-white border-slate-200 text-slate-800 shadow-sm' : 'glass-panel border-white/10 text-zinc-200'
          }`}>
            <div>
              <div className="flex items-center gap-2">
                <h3 className={`text-lg font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  Gestionnaire de Chutes & Casier de Rangement Atelier
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/30 text-[#D4AF37] font-bold">
                  VALORISATION MATIÈRE
                </span>
              </div>
              <p className={`text-xs mt-1 max-w-2xl ${isLight ? 'text-slate-600' : 'text-zinc-400'}`}>
                Réduisez le gaspillage en réutilisant automatiquement les profilés stockés dans vos casiers avant de découper des barres neuves de 6 mètres.
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => {
                  playTactileClick();
                  setShowAddOffcutModal(!showAddOffcutModal);
                }}
                className="px-4 py-2 rounded-xl bg-[#D4AF37] hover:brightness-110 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-[#D4AF37]/20 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Ajouter une Chute au Casier</span>
              </button>
            </div>
          </div>

          {/* Quick Manual Add Offcut Form Modal/Inline */}
          {showAddOffcutModal && (
            <div className={`p-5 rounded-3xl border animate-in fade-in slide-in-from-top-2 duration-200 ${
              isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#0E1322] border-white/15'
            }`}>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-bold font-mono">Nouvelle Chute à Entrer en Stock</h4>
                <button
                  onClick={() => setShowAddOffcutModal(false)}
                  className={`p-1.5 rounded-lg border text-xs cursor-pointer ${
                    isLight ? 'border-slate-300' : 'border-white/10 text-zinc-400'
                  }`}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-[11px] font-mono text-zinc-400 mb-1">Longueur (mm)</label>
                  <input
                    type="number"
                    value={newOffcutLength}
                    onChange={(e) => setNewOffcutLength(Number(e.target.value) || 0)}
                    className={`w-full px-3 py-1.5 rounded-xl border text-xs font-mono font-bold ${
                      isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-white/5 border-white/10 text-white'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-zinc-400 mb-1">Code Profilé</label>
                  <select
                    value={newOffcutProfile}
                    onChange={(e) => setNewOffcutProfile(e.target.value)}
                    className={`w-full px-3 py-1.5 rounded-xl border text-xs font-mono ${
                      isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-[#0E1322] border-white/10 text-white'
                    }`}
                  >
                    <option value="TPR-40">TPR-40 (Dormant 40 RPT)</option>
                    <option value="TPR-OUV">TPR-OUV (Ouvrant 40 RPT)</option>
                    <option value="PAR-16">PAR-16 (Parclose 16mm)</option>
                    <option value="PVC-DORM">PVC-DORM (Dormant PVC 60)</option>
                    <option value="VR-L39">VR-L39 (Lame Volet Alu 39)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-zinc-400 mb-1">Teinte / Finition</label>
                  <select
                    value={newOffcutColor}
                    onChange={(e) => setNewOffcutColor(e.target.value)}
                    className={`w-full px-3 py-1.5 rounded-xl border text-xs font-mono ${
                      isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-[#0E1322] border-white/10 text-white'
                    }`}
                  >
                    <option value="Blanc RAL 9016">Blanc RAL 9016</option>
                    <option value="Gris Anthracite 7016">Gris Anthracite 7016</option>
                    <option value="Noir Sablé 9005">Noir Sablé 9005</option>
                    <option value="Chêne Doré">Chêne Doré</option>
                    <option value="Bronze Anodisé">Bronze Anodisé</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-zinc-400 mb-1">Casier de Rangement</label>
                  <input
                    type="text"
                    value={newOffcutRack}
                    onChange={(e) => setNewOffcutRack(e.target.value)}
                    placeholder="ex: CASIER-A-03"
                    className={`w-full px-3 py-1.5 rounded-xl border text-xs font-mono ${
                      isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-white/5 border-white/10 text-white'
                    }`}
                  />
                </div>

                <div className="flex items-end">
                  <button
                    onClick={() => {
                      if (newOffcutLength < 300) return;
                      playClampSound();
                      addOffcut({
                        profileCode: newOffcutProfile,
                        label: `${newOffcutProfile} Chute Atelier`,
                        material: newOffcutProfile.startsWith('PVC') ? 'pvc' : 'aluminium',
                        finishColor: newOffcutColor,
                        lengthMm: newOffcutLength,
                        rackLocation: newOffcutRack || 'CASIER-GENERAL',
                        jobOrigin: 'Chute Stock Manuel',
                      });
                      setOffcutInventory(getOffcutInventory());
                      setShowAddOffcutModal(false);
                    }}
                    className="w-full px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm"
                  >
                    <BookmarkPlus className="w-4 h-4" />
                    <span>Enregistrer dans le Casier</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ACTIVE WORKSHOP OFFCUT RACK INVENTORY */}
          <div className={`p-6 rounded-3xl border flex flex-col gap-4 transition-all ${
            isLight ? 'bg-white border-slate-200 text-slate-800 shadow-sm' : 'glass-panel border-white/10 text-zinc-200'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <h4 className={`text-base font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  Casiers de Rangement en Atelier ({offcutInventory.length} chutes disponibles)
                </h4>
                <p className={`text-xs mt-0.5 ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
                  Ces profilés sont automatiquement pris en compte lors de l'optimisation pour économiser des barres neuves.
                </p>
              </div>
              <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                Valeur stockée estimée : ~{(offcutInventory.reduce((acc, c) => acc + (c.lengthMm / 1000) * 850, 0)).toFixed(0)} DZD
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
              {offcutInventory.map((item) => (
                <div
                  key={item.id}
                  className={`p-4 rounded-2xl border flex flex-col gap-2 transition-all ${
                    isLight ? 'bg-slate-50 border-slate-200 shadow-xs' : 'bg-zinc-900/80 border-white/10'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-md bg-[#D4AF37]/15 text-[#D4AF37] font-mono text-xs font-bold border border-[#D4AF37]/30">
                      {item.rackLocation}
                    </span>
                    <span className={`text-[10px] font-mono ${isLight ? 'text-slate-400' : 'text-zinc-500'}`}>
                      {item.barcode}
                    </span>
                  </div>

                  <div className="flex items-baseline justify-between pt-1">
                    <span className={`text-xs ${isLight ? 'text-slate-600' : 'text-zinc-400'}`}>Longueur :</span>
                    <span className={`text-xl font-extrabold font-mono text-emerald-500`}>
                      {item.lengthMm} mm
                    </span>
                  </div>

                  <div className={`flex items-center justify-between text-[11px] pt-2 border-t ${
                    isLight ? 'border-slate-200 text-slate-500' : 'border-white/5 text-zinc-400'
                  }`}>
                    <span className="font-mono font-medium">{item.profileCode} • {item.finishColor}</span>
                    <button
                      onClick={() => {
                        playTactileClick();
                        removeOffcut(item.id);
                        setOffcutInventory(getOffcutInventory());
                      }}
                      className="text-red-400 hover:text-red-500 text-[11px] cursor-pointer"
                      title="Sortir cette chute du stock"
                    >
                      Sortir
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* NEW REMNANTS FROM CURRENT OPTIMIZATION RUN */}
          <div className={`p-6 rounded-3xl border flex flex-col gap-4 transition-all ${
            isLight ? 'bg-white border-slate-200 text-slate-800 shadow-sm' : 'glass-panel border-white/10 text-zinc-200'
          }`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h4 className={`text-base font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  Chutes Récupérées du Plan Courant ({linearResult.newRemnantsGenerated} pièces ≥ 800 mm)
                </h4>
                <p className={`text-xs mt-0.5 ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
                  Issues de la dernière découpe calculée. Vous pouvez les intégrer directement au casier d'atelier.
                </p>
              </div>

              {linearResult.bars.some((b) => b.isReusableRemnant) && (
                <button
                  onClick={() => {
                    playClampSound();
                    linearResult.bars
                      .filter((b) => b.isReusableRemnant)
                      .forEach((b, idx) => {
                        addOffcut({
                          profileCode: 'TPR-40',
                          label: `Chute Barre #${b.barIndex}`,
                          material: 'aluminium',
                          finishColor: 'Blanc RAL 9016',
                          lengthMm: Math.round(b.wasteLength),
                          rackLocation: `CASIER-A-${String(idx + 1).padStart(2, '0')}`,
                          jobOrigin: `Chantier ${config.width}x${config.height}`,
                        });
                      });
                    setOffcutInventory(getOffcutInventory());
                  }}
                  className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm cursor-pointer shrink-0"
                >
                  <PackageCheck className="w-4 h-4" />
                  <span>Tout Enregistrer dans le Casier</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
              {linearResult.bars
                .filter((b) => b.isReusableRemnant)
                .map((b) => (
                  <div
                    key={b.barIndex}
                    className={`p-4 rounded-2xl border flex flex-col gap-2 ${
                      isLight ? 'bg-slate-50 border-emerald-500/30 shadow-xs' : 'bg-zinc-900/80 border-emerald-500/20'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-mono text-xs font-bold border border-emerald-500/20">
                        {b.remnantId || `CHT-${b.barIndex}`}
                      </span>
                      <span className={`text-xs font-mono ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
                        Barre source #{b.barIndex}
                      </span>
                    </div>
                    <div className="flex items-baseline justify-between pt-1">
                      <span className={`text-xs ${isLight ? 'text-slate-600' : 'text-zinc-400'}`}>Longueur :</span>
                      <span className={`text-lg font-extrabold font-mono ${isLight ? 'text-slate-900' : 'text-white'}`}>
                        {Math.round(b.wasteLength)} mm
                      </span>
                    </div>
                    <div className={`flex items-center justify-between text-[11px] pt-1 border-t ${
                      isLight ? 'border-slate-200 text-slate-500' : 'border-white/5 text-zinc-500'
                    }`}>
                      <span>Profil : TPR Alugraf 40mm</span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Réutilisable</span>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: ROLLER SHUTTER & SLAT CURTAIN OPTIMIZER */}
      {activeTab === 'shutter' && (
        <div className="flex flex-col gap-6">
          {/* Top Quick Action Header */}
          <div className={`p-6 rounded-3xl border flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all ${
            isLight ? 'bg-white border-slate-200 shadow-sm text-slate-800' : 'glass-panel border-white/10 text-zinc-200'
          }`}>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/30 text-xs font-mono font-bold text-[#D4AF37]">
                  Norme Industrielle VMR / Rénovation
                </span>
                <span className={`text-xs font-mono ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
                  Ouverture {shutterWidth} × {shutterHeight} mm
                </span>
              </div>
              <h3 className={`text-xl font-bold mt-1 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                Calculateur Métier Volet Roulant & Tablier
              </h3>
              <p className={`text-xs mt-0.5 ${isLight ? 'text-slate-600' : 'text-zinc-400'}`}>
                Calcul automatisé des longueurs de coupe des lames, coulisses, coffre, axe octogonal et puissance moteur en Nm.
              </p>
            </div>

            <button
              onClick={transferShutterTo1D}
              className="px-5 py-3 rounded-2xl bg-[#D4AF37] hover:bg-[#C5A880] text-slate-950 font-bold text-xs flex items-center gap-2 transition-all shadow-lg shadow-[#D4AF37]/25 shrink-0 cursor-pointer btn-press hover-lift"
            >
              <span>Transférer vers Débit Scie 1D</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* LEFT: Configurator Parameters (5 cols) */}
            <div className={`lg:col-span-5 p-6 rounded-3xl border flex flex-col gap-5 transition-all ${
              isLight ? 'bg-white border-slate-200 shadow-sm text-slate-800' : 'glass-panel border-white/10 text-zinc-200'
            }`}>
              <h4 className={`text-sm font-bold flex items-center gap-2 border-b pb-3 ${
                isLight ? 'text-slate-900 border-slate-200' : 'text-white border-white/10'
              }`}>
                <Sliders className="w-4 h-4 text-[#D4AF37]" />
                <span>Paramètres de la Baie & du Caisson</span>
              </h4>

              {/* Dimensions */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={`text-xs block mb-1 font-mono ${isLight ? 'text-slate-600' : 'text-zinc-400'}`}>
                    Largeur Baie (W mm)
                  </label>
                  <input
                    type="number"
                    value={shutterWidth}
                    onChange={(e) => setShutterWidth(Math.max(400, Number(e.target.value)))}
                    className={`w-full px-3 py-2 rounded-xl font-mono text-sm border focus:outline-none focus:border-[#D4AF37] ${
                      isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-black/40 border-white/10 text-white'
                    }`}
                    step={10}
                  />
                </div>
                <div>
                  <label className={`text-xs block mb-1 font-mono ${isLight ? 'text-slate-600' : 'text-zinc-400'}`}>
                    Hauteur Baie (H mm)
                  </label>
                  <input
                    type="number"
                    value={shutterHeight}
                    onChange={(e) => setShutterHeight(Math.max(400, Number(e.target.value)))}
                    className={`w-full px-3 py-2 rounded-xl font-mono text-sm border focus:outline-none focus:border-[#D4AF37] ${
                      isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-black/40 border-white/10 text-white'
                    }`}
                    step={10}
                  />
                </div>
              </div>

              {/* Type de Coffre */}
              <div>
                <label className={`text-xs block mb-1 font-mono ${isLight ? 'text-slate-600' : 'text-zinc-400'}`}>
                  Type d'Intégration Coffre
                </label>
                <select
                  value={shutterBoxType}
                  onChange={(e) => {
                    playSwitchSound();
                    setShutterBoxType(e.target.value as ShutterBoxType);
                  }}
                  className={`w-full px-3 py-2.5 rounded-xl font-mono text-xs border focus:outline-none focus:border-[#D4AF37] cursor-pointer ${
                    isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-[#0F141C] border-white/10 text-white'
                  }`}
                >
                  <option value="monobloc_pvc" className={isLight ? 'bg-white text-slate-900' : 'bg-[#0F141C] text-white'}>Monobloc PVC (VMR monté sur dormant)</option>
                  <option value="monobloc_alu" className={isLight ? 'bg-white text-slate-900' : 'bg-[#0F141C] text-white'}>Monobloc Aluminium Thermolaqué</option>
                  <option value="renovation_pan_coupe" className={isLight ? 'bg-white text-slate-900' : 'bg-[#0F141C] text-white'}>Rénovation Pan Coupé 45° Extérieur</option>
                  <option value="renovation_rond" className={isLight ? 'bg-white text-slate-900' : 'bg-[#0F141C] text-white'}>Rénovation Quart de Rond Extérieur</option>
                  <option value="tunnel" className={isLight ? 'bg-white text-slate-900' : 'bg-[#0F141C] text-white'}>Coffre Tunnel Maçonné</option>
                </select>
              </div>

              {/* Taille du Caisson */}
              <div>
                <label className={`text-xs block mb-1 font-mono ${isLight ? 'text-slate-600' : 'text-zinc-400'}`}>
                  Dimension Caisson d'Enroulement
                </label>
                <div className="grid grid-cols-5 gap-1.5">
                  {[137, 150, 165, 180, 205].map((size) => (
                    <button
                      key={size}
                      onClick={() => {
                        playTactileClick();
                        setShutterBoxHeightMm(size);
                      }}
                      className={`py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer btn-press ${
                        shutterBoxHeightMm === size
                          ? 'bg-[#D4AF37] text-slate-950 shadow-md shadow-[#D4AF37]/20 font-bold'
                          : isLight
                          ? 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-300'
                          : 'bg-white/5 text-zinc-400 hover:text-white border border-white/5'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Type de Lame */}
              <div>
                <label className={`text-xs block mb-1 font-mono ${isLight ? 'text-slate-600' : 'text-zinc-400'}`}>
                  Profilé de Lame de Tablier
                </label>
                <div className="flex flex-col gap-2">
                  {[
                    { id: 'alu_39', label: 'Alu 39 mm injectée mousse PU', sub: 'Légère (3.2 kg/m²) • Isolation thermique' },
                    { id: 'alu_55', label: 'Alu 55 mm haute densité', sub: 'Grandes baies vitrées (4.5 kg/m²) • Anti-vent' },
                    { id: 'pvc_40', label: 'PVC 40 mm double paroi', sub: 'Économique (3.8 kg/m²) • Résistance chimique' },
                    { id: 'alu_extrude_securite', label: 'Alu Extrudé Plein Sécurité 45 mm', sub: 'Blindé (7.8 kg/m²) • Anti-effraction' },
                  ].map((slat) => (
                    <div
                      key={slat.id}
                      onClick={() => {
                        playSwitchSound();
                        setShutterSlatType(slat.id as ShutterSlatType);
                      }}
                      className={`p-2.5 rounded-xl border cursor-pointer transition-all btn-press ${
                        shutterSlatType === slat.id
                          ? isLight
                            ? 'bg-[#D4AF37]/15 border-[#D4AF37] text-slate-900 shadow-xs'
                            : 'bg-[#D4AF37]/15 border-[#D4AF37] text-white shadow-xs'
                          : isLight
                          ? 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                          : 'bg-white/5 border-white/5 text-zinc-400 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs font-medium">
                        <span>{slat.label}</span>
                        {shutterSlatType === slat.id && <span className="text-[#D4AF37] text-xs font-bold">✓</span>}
                      </div>
                      <span className={`text-[10px] block mt-0.5 ${isLight ? 'text-slate-500' : 'text-zinc-500'}`}>{slat.sub}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Manœuvre & Teinte */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className={`text-xs block mb-1 font-mono ${isLight ? 'text-slate-600' : 'text-zinc-400'}`}>
                    Manœuvre
                  </label>
                  <select
                    value={shutterDriveType}
                    onChange={(e) => {
                      playSwitchSound();
                      setShutterDriveType(e.target.value as ShutterDriveType);
                    }}
                    className={`w-full px-2.5 py-2 rounded-xl font-mono text-xs border focus:outline-none focus:border-[#D4AF37] cursor-pointer ${
                      isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-[#0F141C] border-white/10 text-white'
                    }`}
                  >
                    <option value="motor_radio" className={isLight ? 'bg-white text-slate-900' : 'bg-[#0F141C] text-white'}>Moteur Radio 433MHz</option>
                    <option value="motor_wired" className={isLight ? 'bg-white text-slate-900' : 'bg-[#0F141C] text-white'}>Moteur Filaire 230V</option>
                    <option value="manual_crank" className={isLight ? 'bg-white text-slate-900' : 'bg-[#0F141C] text-white'}>Treuil Manivelle</option>
                    <option value="manual_strap" className={isLight ? 'bg-white text-slate-900' : 'bg-[#0F141C] text-white'}>Sangle</option>
                  </select>
                </div>
                <div>
                  <label className={`text-xs block mb-1 font-mono ${isLight ? 'text-slate-600' : 'text-zinc-400'}`}>
                    Teinte Tablier
                  </label>
                  <select
                    value={shutterSlatColor}
                    onChange={(e) => {
                      playSwitchSound();
                      setShutterSlatColor(e.target.value);
                    }}
                    className={`w-full px-2.5 py-2 rounded-xl font-mono text-xs border focus:outline-none focus:border-[#D4AF37] cursor-pointer ${
                      isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-[#0F141C] border-white/10 text-white'
                    }`}
                  >
                    <option value="Blanc RAL 9016" className={isLight ? 'bg-white text-slate-900' : 'bg-[#0F141C] text-white'}>Blanc RAL 9016</option>
                    <option value="Gris Anthracite 7016" className={isLight ? 'bg-white text-slate-900' : 'bg-[#0F141C] text-white'}>Gris Anthracite 7016</option>
                    <option value="Faux Bois Chêne Doré" className={isLight ? 'bg-white text-slate-900' : 'bg-[#0F141C] text-white'}>Faux Bois Chêne</option>
                    <option value="Bronze Anodisé" className={isLight ? 'bg-white text-slate-900' : 'bg-[#0F141C] text-white'}>Bronze Anodisé</option>
                  </select>
                </div>
              </div>
            </div>

            {/* RIGHT: Production Débit Schedule & Hardware (7 cols) */}
            <div className="lg:col-span-7 flex flex-col gap-4">
              {/* Highlight Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-center">
                <div className={`p-3.5 rounded-2xl border transition-all hover-lift ${
                  isLight ? 'bg-white border-slate-200 shadow-sm text-slate-800' : 'glass-panel border-white/10 text-zinc-200'
                }`}>
                  <span className={`text-[10px] uppercase block ${isLight ? 'text-slate-500' : 'text-zinc-500'}`}>Coupe Lames</span>
                  <span className="text-lg font-extrabold text-[#D4AF37]">{shutterCalculation.slatCutLengthMm} mm</span>
                  <span className={`text-[10px] block ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>Jeu -60mm</span>
                </div>
                <div className={`p-3.5 rounded-2xl border transition-all hover-lift ${
                  isLight ? 'bg-white border-slate-200 shadow-sm text-slate-800' : 'glass-panel border-white/10 text-zinc-200'
                }`}>
                  <span className={`text-[10px] uppercase block ${isLight ? 'text-slate-500' : 'text-zinc-500'}`}>Quantité Lames</span>
                  <span className={`text-lg font-extrabold ${isLight ? 'text-slate-900' : 'text-white'}`}>{shutterCalculation.slatCount} pcs</span>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 block font-semibold">+2 sécurité caisson</span>
                </div>
                <div className={`p-3.5 rounded-2xl border transition-all hover-lift ${
                  isLight ? 'bg-white border-slate-200 shadow-sm text-slate-800' : 'glass-panel border-white/10 text-zinc-200'
                }`}>
                  <span className={`text-[10px] uppercase block ${isLight ? 'text-slate-500' : 'text-zinc-500'}`}>Masse Tablier</span>
                  <span className="text-lg font-extrabold text-cyan-600 dark:text-cyan-400">{shutterCalculation.totalCurtainWeightKg} kg</span>
                  <span className={`text-[10px] block ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>{shutterCalculation.totalCurtainAreaM2} m²</span>
                </div>
                <div className={`p-3.5 rounded-2xl border transition-all hover-lift ${
                  isLight ? 'bg-white border-slate-200 shadow-sm text-slate-800' : 'glass-panel border-white/10 text-zinc-200'
                }`}>
                  <span className={`text-[10px] uppercase block ${isLight ? 'text-slate-500' : 'text-zinc-500'}`}>Moteur Requis</span>
                  <span className="text-lg font-extrabold text-amber-600 dark:text-amber-400">{shutterCalculation.recommendedMotorTorqueNm} Nm</span>
                  <span className={`text-[10px] block ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>Axe Ø{shutterCalculation.axleDiameterMm}mm</span>
                </div>
              </div>

              {/* Primary Workshop Cuts List */}
              <div className={`p-5 rounded-3xl border flex flex-col gap-3 font-mono transition-all ${
                isLight ? 'bg-white border-slate-200 shadow-sm text-slate-800' : 'glass-panel border-white/10 text-zinc-200'
              }`}>
                <div className={`flex items-center justify-between border-b pb-2.5 ${
                  isLight ? 'border-slate-200' : 'border-white/10'
                }`}>
                  <h4 className="text-xs uppercase font-bold text-[#D4AF37]">
                    Ordre de Coupe Tronçonneuse Atelier
                  </h4>
                  <span className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
                    Trait de scie : 90° droit
                  </span>
                </div>

                <div className="flex flex-col gap-2 text-xs">
                  {/* Slat pack */}
                  <div className={`p-3 rounded-2xl border flex items-center justify-between ${
                    isLight ? 'bg-slate-50 border-slate-200' : 'bg-black/40 border-white/10'
                  }`}>
                    <div className="flex flex-col gap-0.5">
                      <div className="flex items-center gap-2">
                        <span className={`font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                          Paquet de {shutterCalculation.slatCount} Lames
                        </span>
                        <span className="px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-600 dark:text-blue-400 text-[10px] font-bold">
                          {shutterSlatType.toUpperCase()}
                        </span>
                      </div>
                      <p className={`text-[11px] ${isLight ? 'text-slate-600' : 'text-zinc-400'}`}>
                        Profilé aluminium/PVC avec embouts d'arrêt latéraux anti-décalage
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-base font-extrabold text-[#D4AF37]">{shutterCalculation.slatCutLengthMm} mm</span>
                      <span className={`text-[10px] block ${isLight ? 'text-slate-400' : 'text-zinc-500'}`}>90° / 90°</span>
                    </div>
                  </div>

                  {/* Guides */}
                  <div className={`p-3 rounded-2xl border flex items-center justify-between ${
                    isLight ? 'bg-slate-50 border-slate-200' : 'bg-black/40 border-white/10'
                  }`}>
                    <div className="flex flex-col gap-0.5">
                      <div className="flex items-center gap-2">
                        <span className={`font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                          2 Coulisses Verticales VR
                        </span>
                        <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold">
                          COULISSE-53
                        </span>
                      </div>
                      <p className={`text-[11px] ${isLight ? 'text-slate-600' : 'text-zinc-400'}`}>
                        Profils avec gorge pour double joint brosse anti-bruit et tulipes d'entrée
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-base font-extrabold text-emerald-600 dark:text-emerald-400">{shutterCalculation.guideHeightMm} mm</span>
                      <span className={`text-[10px] block ${isLight ? 'text-slate-400' : 'text-zinc-500'}`}>90° / 90°</span>
                    </div>
                  </div>

                  {/* Bottom slat */}
                  <div className={`p-3 rounded-2xl border flex items-center justify-between ${
                    isLight ? 'bg-slate-50 border-slate-200' : 'bg-black/40 border-white/10'
                  }`}>
                    <div className="flex flex-col gap-0.5">
                      <div className="flex items-center gap-2">
                        <span className={`font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                          1 Lame Finale Lourde Extrudée
                        </span>
                        <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-600 dark:text-amber-400 text-[10px] font-bold">
                          LAME-FINALE
                        </span>
                      </div>
                      <p className={`text-[11px] ${isLight ? 'text-slate-600' : 'text-zinc-400'}`}>
                        Avec joint tubulaire d'étanchéité néoprène et 2 butées coniques
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-base font-extrabold text-amber-600 dark:text-amber-400">{shutterCalculation.slatCutLengthMm} mm</span>
                      <span className={`text-[10px] block ${isLight ? 'text-slate-400' : 'text-zinc-500'}`}>90° / 90°</span>
                    </div>
                  </div>

                  {/* Steel axle */}
                  <div className={`p-3 rounded-2xl border flex items-center justify-between ${
                    isLight ? 'bg-slate-50 border-slate-200' : 'bg-black/40 border-white/10'
                  }`}>
                    <div className="flex flex-col gap-0.5">
                      <div className="flex items-center gap-2">
                        <span className={`font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                          1 Tube d'Enroulement Octogonal Acier
                        </span>
                        <span className="px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-600 dark:text-purple-400 text-[10px] font-bold">
                          Ø{shutterCalculation.axleDiameterMm} mm
                        </span>
                      </div>
                      <p className={`text-[11px] ${isLight ? 'text-slate-600' : 'text-zinc-400'}`}>
                        Tube acier galvanisé renforcé avec embout télescopique à roulement
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-base font-extrabold text-purple-600 dark:text-purple-400">{shutterCalculation.axleLengthMm} mm</span>
                      <span className={`text-[10px] block ${isLight ? 'text-slate-400' : 'text-zinc-500'}`}>90° / 90°</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Complete Accessories Nomenclature */}
              <div className={`p-5 rounded-3xl border flex flex-col gap-3 font-mono transition-all ${
                isLight ? 'bg-white border-slate-200 shadow-sm text-slate-800' : 'glass-panel border-white/10 text-zinc-200'
              }`}>
                <div className={`flex items-center justify-between border-b pb-2.5 ${
                  isLight ? 'border-slate-200' : 'border-white/10'
                }`}>
                  <h4 className={`text-xs uppercase font-bold ${isLight ? 'text-slate-800' : 'text-zinc-300'}`}>
                    Nomenclature Complète & Quincaillerie Volet
                  </h4>
                  <span className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
                    {shutterCalculation.components.length} postes
                  </span>
                </div>

                <div className="max-h-48 overflow-y-auto flex flex-col gap-1.5 pr-1 text-xs">
                  {shutterCalculation.components.map((c, i) => (
                    <div
                      key={i}
                      className={`p-2 rounded-xl border flex items-center justify-between ${
                        isLight ? 'bg-slate-50 border-slate-200 text-slate-800' : 'bg-white/5 border-white/5 text-zinc-300'
                      }`}
                    >
                      <div className="truncate max-w-[340px]">
                        <span className={`font-medium block truncate ${isLight ? 'text-slate-900' : 'text-white'}`}>{c.name}</span>
                        <span className={`text-[10px] block truncate ${isLight ? 'text-slate-500' : 'text-zinc-500'}`}>{c.description}</span>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="font-bold text-[#D4AF37]">{c.quantity} {c.unit}</span>
                        {c.dimensions && (
                          <span className={`text-[10px] block ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>{c.dimensions}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Thermal Print & CNC Modal */}
      <ThermalLabelsModal
        isOpen={isLabelsModalOpen}
        onClose={() => setIsLabelsModalOpen(false)}
        solution={linearResult}
        jobName="Chantier Découpe Profilés"
      />

      {/* Interactive Shop Floor Cutting & Assembly Terminal */}
      <CuttingAssemblyTerminal
        isOpen={isTerminalOpen}
        onClose={() => setIsTerminalOpen(false)}
        bom={currentBom}
        config={config}
        jobName="Poste Scie & Débitage Atelier"
      />

      {/* CNC Saw G-Code & Machine Exporter Modal */}
      <CncSawExportModal
        isOpen={isCncExportOpen}
        onClose={() => setIsCncExportOpen(false)}
        bars={linearResult.bars}
        jobName="Chantier Menuiserie Baiti"
        profileCode="TPR-40"
      />
    </section>
  );
};
