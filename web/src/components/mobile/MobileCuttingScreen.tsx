import React, { useState, useMemo, useEffect } from 'react';
import { useConfigStore } from '../../store/configStore';
import { optimize1DLinearStock } from '../../utils/linearCutOptimizer';
import type { CutDemand1D, LinearOptimizationResult, StockBar1D } from '../../types/optimizer';
import {
  Scissors,
  Plus,
  Trash2,
  Download,
  MessageCircle,
  FileDown,
  ScanLine,
  Recycle,
  ChevronDown,
  ChevronUp,
  ClipboardList,
  Check,
  X,
} from 'lucide-react';
import { playTactileClick, playClampSound } from '../../utils/audioFeedback';
import { CuttingAssemblyTerminal } from '../optimizer/CuttingAssemblyTerminal';
import { computeDetailedBOM } from '../../utils/cadEngine';
import { generateLinearCuttingPlanPdf } from '../../utils/pdfGenerator';
import type { MobileNavTab } from './MobileBottomNavigation';

let remnantSequence = 100;
let demandSequence = 100;
function createDemandId(): string {
  demandSequence += 1;
  return `d_${demandSequence}`;
}

interface MobileCuttingScreenProps {
  onNavigateTab?: (tab: MobileNavTab) => void;
}

export const MobileCuttingScreen: React.FC<MobileCuttingScreenProps> = () => {
  const { config, language, theme, selectedWilaya } = useConfigStore();
  const isLight = theme === 'light';
  const isRtl = language === 'ar';

  // Active survey notebook project data
  const [surveyProjectData, setSurveyProjectData] = useState<{
    info?: { clientName?: string; clientPhone?: string; projectSite?: string };
    openings: any[];
  } | null>(() => {
    if (typeof window !== 'undefined') {
      try {
        const rawOpenings = localStorage.getItem('baiti_field_measurement_project');
        const rawInfo = localStorage.getItem('baiti_field_measurement_info');
        const openings = rawOpenings ? JSON.parse(rawOpenings) : [];
        const info = rawInfo ? JSON.parse(rawInfo) : undefined;
        if (Array.isArray(openings) && openings.length > 0) {
          return { info, openings };
        }
      } catch {
        return null;
      }
    }
    return null;
  });

  // Active CAD 2D demands data
  const [cadDemandsAvailable, setCadDemandsAvailable] = useState<CutDemand1D[] | null>(() => {
    if (typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem('baiti_cad_active_demands');
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch {
        return null;
      }
    }
    return null;
  });

  useEffect(() => {
    const syncSurvey = () => {
      if (typeof window !== 'undefined') {
        try {
          const rawOpenings = localStorage.getItem('baiti_field_measurement_project');
          const rawInfo = localStorage.getItem('baiti_field_measurement_info');
          const openings = rawOpenings ? JSON.parse(rawOpenings) : [];
          const info = rawInfo ? JSON.parse(rawInfo) : undefined;
          if (Array.isArray(openings) && openings.length > 0) {
            setSurveyProjectData({ info, openings });
          } else {
            setSurveyProjectData(null);
          }

          const rawCad = localStorage.getItem('baiti_cad_active_demands');
          if (rawCad) {
            const parsed = JSON.parse(rawCad);
            if (Array.isArray(parsed) && parsed.length > 0) {
              setCadDemandsAvailable(parsed);
            }
          }
        } catch {
          setSurveyProjectData(null);
        }
      }
    };
    window.addEventListener('storage', syncSurvey);
    return () => window.removeEventListener('storage', syncSurvey);
  }, []);

  // Pre-fill initial demands from current active window or auto-imported survey
  const [demands, setDemands] = useState<CutDemand1D[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const autoImport = sessionStorage.getItem('baiti_auto_import_survey_cutting');
        if (autoImport === 'true') {
          sessionStorage.removeItem('baiti_auto_import_survey_cutting');
          const rawOpenings = localStorage.getItem('baiti_field_measurement_project');
          if (rawOpenings) {
            const openings = JSON.parse(rawOpenings);
            if (Array.isArray(openings) && openings.length > 0) {
              const projectDemands: CutDemand1D[] = [];
              openings.forEach((op: any, opIdx: number) => {
                const room = op.roomName?.trim() || `Châssis #${opIdx + 1}`;
                const qty = op.quantity || 1;
                const w = Math.round(op.width || 1200);
                const h = Math.round(op.height || 1200);

                projectDemands.push({
                  id: `d_s_${opIdx}_1`,
                  length: w,
                  quantity: 2 * qty,
                  miterLeft: 45,
                  miterRight: 45,
                  label: `[${room}] Dormant H/B`,
                  profileCode: 'DORMANT-45',
                });
                projectDemands.push({
                  id: `d_s_${opIdx}_2`,
                  length: h,
                  quantity: 2 * qty,
                  miterLeft: 45,
                  miterRight: 45,
                  label: `[${room}] Dormant Montants`,
                  profileCode: 'DORMANT-45',
                });

                if (op.openingType === 'sliding_2' || op.openingType === 'sliding_3') {
                  const panesCount = op.openingType === 'sliding_3' ? 3 : 2;
                  const sashWidth = Math.round(w / panesCount + 15);
                  const sashHeight = h - 70;
                  projectDemands.push({
                    id: `d_s_${opIdx}_3`,
                    length: sashWidth,
                    quantity: 2 * panesCount * qty,
                    miterLeft: 45,
                    miterRight: 45,
                    label: `[${room}] Ouvrant Traverses`,
                    profileCode: 'OUVRANT-45',
                  });
                  projectDemands.push({
                    id: `d_s_${opIdx}_4`,
                    length: sashHeight,
                    quantity: 2 * panesCount * qty,
                    miterLeft: 45,
                    miterRight: 45,
                    label: `[${room}] Ouvrant Montants`,
                    profileCode: 'OUVRANT-45',
                  });
                } else if (op.openingType !== 'fixed') {
                  const sashesCount = op.openingType === 'casement_2' ? 2 : 1;
                  const sashWidth = Math.round(w / sashesCount - (sashesCount === 2 ? 65 : 60));
                  const sashHeight = h - 70;
                  projectDemands.push({
                    id: `d_s_${opIdx}_3`,
                    length: sashWidth,
                    quantity: 2 * sashesCount * qty,
                    miterLeft: 45,
                    miterRight: 45,
                    label: `[${room}] Ouvrant H/B`,
                    profileCode: 'OUVRANT-45',
                  });
                  projectDemands.push({
                    id: `d_s_${opIdx}_4`,
                    length: sashHeight,
                    quantity: 2 * sashesCount * qty,
                    miterLeft: 45,
                    miterRight: 45,
                    label: `[${room}] Ouvrant Montants`,
                    profileCode: 'OUVRANT-45',
                  });
                }
              });
              if (projectDemands.length > 0) return projectDemands;
            }
          }
        }
      } catch {
        // Handled
      }
    }

    return [
      {
        id: 'd1',
        length: config.width,
        quantity: 2,
        miterLeft: 45,
        miterRight: 45,
        label: 'Dormant Haut/Bas',
        profileCode: 'DORMANT-45',
      },
      {
        id: 'd2',
        length: config.height,
        quantity: 2,
        miterLeft: 45,
        miterRight: 45,
        label: 'Dormant Montants',
        profileCode: 'DORMANT-45',
      },
      {
        id: 'd3',
        length: Math.round(config.width / 2 + 15),
        quantity: 4,
        miterLeft: 45,
        miterRight: 45,
        label: 'Ouvrant Traverses',
        profileCode: 'OUVRANT-45',
      },
      {
        id: 'd4',
        length: config.height - 70,
        quantity: 4,
        miterLeft: 45,
        miterRight: 45,
        label: 'Ouvrant Montants',
        profileCode: 'OUVRANT-45',
      },
    ];
  });

  const [newLength, setNewLength] = useState(1200);
  const [newQty, setNewQty] = useState(2);
  const [newLabel, setNewLabel] = useState('Nouvelle Pièce');
  const [kerfMm, setKerfMm] = useState<number>(3.0);
  const [isTerminalOpen, setIsTerminalOpen] = useState(false);

  // Workshop stock of remnants / chutes reutilisables
  const [remnants, setRemnants] = useState<StockBar1D[]>(() => {
    try {
      const saved = localStorage.getItem('baiti_workshop_remnants');
      if (saved) return JSON.parse(saved);
    } catch {
      // Handled
    }
    return [
      { id: 'rem-1', length: 1450, isRemnant: true, profileCode: 'DORMANT-45' },
      { id: 'rem-2', length: 2100, isRemnant: true, profileCode: 'OUVRANT-45' },
    ];
  });

  const [newRemnantLength, setNewRemnantLength] = useState(1400);
  const [isRemnantsOpen, setIsRemnantsOpen] = useState(false);

  const saveRemnants = (newRemnants: StockBar1D[]) => {
    setRemnants(newRemnants);
    try {
      localStorage.setItem('baiti_workshop_remnants', JSON.stringify(newRemnants));
    } catch {
      // Handled
    }
  };

  const handleAddRemnant = (len?: number) => {
    const l = len || newRemnantLength;
    if (l <= 0) return;
    playClampSound();
    const newRem: StockBar1D = {
      id: `rem_${++remnantSequence}`,
      length: l,
      isRemnant: true,
      profileCode: 'CHUTE-ATELIER',
    };
    saveRemnants([...remnants, newRem]);
  };

  const handleRemoveRemnant = (id: string) => {
    playTactileClick();
    saveRemnants(remnants.filter((r) => r.id !== id));
  };

  const currentBom = useMemo(() => {
    return computeDetailedBOM(
      {
        width: config.width,
        height: config.height,
        verticalDividers: [Math.round(config.width / 2)],
        horizontalDividers: [],
        cellTypes: { '0-0': 'sash_slide', '0-1': 'sash_slide' },
      },
      config
    );
  }, [config]);

  // Compute 1D optimization with workshop remnants priority
  const optimizationResult: LinearOptimizationResult = useMemo(() => {
    return optimize1DLinearStock(demands, remnants, {
      kerf: kerfMm,
      clampTrim: 25,
      minRemnantLength: 800,
      standardBarLength: 6000,
    });
  }, [demands, remnants, kerfMm]);

  // Recoverable off-cuts from optimization plan (remnants >= 600 mm)
  const recoverableRemnants = useMemo(() => {
    return optimizationResult.bars
      .filter((b) => b.wasteLength >= 600)
      .map((b) => ({
        length: b.wasteLength,
        originBar: b.barIndex,
      }));
  }, [optimizationResult.bars]);

  const [remnantToastMessage, setRemnantToastMessage] = useState<string | null>(null);

  const handleIntegrateRecoverableRemnants = () => {
    playClampSound();
    if (recoverableRemnants.length === 0) return;
    const newItems: StockBar1D[] = recoverableRemnants.map((r, idx) => ({
      id: `chute_gen_${Date.now()}_${idx}`,
      length: r.length,
      isRemnant: true,
      profileCode: 'CHUTE-REPRISE',
    }));
    const updated = [...remnants, ...newItems];
    saveRemnants(updated);
    setRemnantToastMessage(`${newItems.length} chute(s) réintégrée(s) dans le stock d'atelier !`);
    setTimeout(() => setRemnantToastMessage(null), 3500);
  };

  const handlePurgeConsumedRemnants = () => {
    playTactileClick();
    const consumedLengths = optimizationResult.bars
      .filter((b) => b.stockLength < 6000)
      .map((b) => b.stockLength);
    if (consumedLengths.length === 0) return;

    const remaining = [...remnants];
    consumedLengths.forEach((len) => {
      const idx = remaining.findIndex((r) => r.length === len);
      if (idx !== -1) {
        remaining.splice(idx, 1);
      }
    });
    saveRemnants(remaining);
    setRemnantToastMessage(`${consumedLengths.length} chute(s) consommée(s) déduite(s) du stock.`);
    setTimeout(() => setRemnantToastMessage(null), 3500);
  };

  const handleAddDemand = () => {
    if (newLength <= 0 || newQty <= 0) return;
    playClampSound();
    const newDemand: CutDemand1D = {
      id: createDemandId(),
      length: newLength,
      quantity: newQty,
      miterLeft: 45,
      miterRight: 45,
      label: newLabel || 'Profilé',
      profileCode: 'ALU-6M',
    };
    setDemands((prev) => [...prev, newDemand]);
  };

  const handleRemoveDemand = (id: string) => {
    playTactileClick();
    setDemands((prev) => prev.filter((d) => d.id !== id));
  };

  const handleShareWhatsAppCutSheet = () => {
    playTactileClick();
    let text = `*PLAN DE DÉBIT SCIE 1D - BAITI ATELIER*\n`;
    text += `Barres 6.00m requises : *${optimizationResult.totalStockBars}*\n`;
    if (optimizationResult.totalRemnantsUsed > 0) {
      text += `Chutes réutilisées : *${optimizationResult.totalRemnantsUsed}* (Économie atelier)\n`;
    }
    text += `Rendement matière : *${(optimizationResult.overallUtilizationRate * 100).toFixed(1)}%*\n`;
    text += `Trait de scie : ${kerfMm} mm\n\n`;
    optimizationResult.bars.forEach((bar, idx) => {
      const typeLabel = bar.stockLength < 6000 ? `CHUTE RÉUTILISÉE (${bar.stockLength} mm)` : `Barre Neuve 6000 mm`;
      text += `*#${idx + 1} - ${typeLabel}* :\n`;
      bar.cuts.forEach((c) => {
        text += `  • ${c.length} mm (${c.label})\n`;
      });
      if (bar.wasteLength > 0) {
        text += `  > Reste/Chute : ${bar.wasteLength} mm\n`;
      }
    });
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleDownloadCsv = () => {
    playClampSound();
    let csv = 'Type,Barre_Numero,Longueur_Stock_mm,Coupe_mm,Designation,Reste_Chute_mm\n';
    optimizationResult.bars.forEach((b, idx) => {
      const typeLabel = b.stockLength < 6000 ? 'Chute_Reutilisee' : 'Barre_6m';
      b.cuts.forEach((c) => {
        csv += `${typeLabel},${idx + 1},${b.stockLength},${c.length},"${c.label}",\n`;
      });
      csv += `${typeLabel},${idx + 1},${b.stockLength},,,${b.wasteLength}\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `debit_scie_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImportSurveyProject = () => {
    playClampSound();
    if (!surveyProjectData || !surveyProjectData.openings.length) return;
    const projectDemands: CutDemand1D[] = [];

    surveyProjectData.openings.forEach((op, opIdx) => {
      const room = op.roomName?.trim() || `Châssis #${opIdx + 1}`;
      const qty = op.quantity || 1;
      const w = Math.round(op.width || 1200);
      const h = Math.round(op.height || 1200);

      // 1. Frame Horizontals
      projectDemands.push({
        id: createDemandId(),
        length: w,
        quantity: 2 * qty,
        miterLeft: 45,
        miterRight: 45,
        label: `[${room}] Dormant H/B`,
        profileCode: 'DORMANT-45',
      });

      // 2. Frame Verticals
      projectDemands.push({
        id: createDemandId(),
        length: h,
        quantity: 2 * qty,
        miterLeft: 45,
        miterRight: 45,
        label: `[${room}] Dormant Montants`,
        profileCode: 'DORMANT-45',
      });

      // 3. Sashes
      if (op.openingType === 'sliding_2' || op.openingType === 'sliding_3') {
        const panesCount = op.openingType === 'sliding_3' ? 3 : 2;
        const sashWidth = Math.round(w / panesCount + 15);
        const sashHeight = h - 70;
        projectDemands.push({
          id: createDemandId(),
          length: sashWidth,
          quantity: 2 * panesCount * qty,
          miterLeft: 45,
          miterRight: 45,
          label: `[${room}] Ouvrant Traverses`,
          profileCode: 'OUVRANT-45',
        });
        projectDemands.push({
          id: createDemandId(),
          length: sashHeight,
          quantity: 2 * panesCount * qty,
          miterLeft: 45,
          miterRight: 45,
          label: `[${room}] Ouvrant Montants`,
          profileCode: 'OUVRANT-45',
        });
      } else if (op.openingType !== 'fixed') {
        const sashesCount = op.openingType === 'casement_2' ? 2 : 1;
        const sashWidth = Math.round(w / sashesCount - (sashesCount === 2 ? 65 : 60));
        const sashHeight = h - 70;
        projectDemands.push({
          id: createDemandId(),
          length: sashWidth,
          quantity: 2 * sashesCount * qty,
          miterLeft: 45,
          miterRight: 45,
          label: `[${room}] Ouvrant H/B`,
          profileCode: 'OUVRANT-45',
        });
        projectDemands.push({
          id: createDemandId(),
          length: sashHeight,
          quantity: 2 * sashesCount * qty,
          miterLeft: 45,
          miterRight: 45,
          label: `[${room}] Ouvrant Montants`,
          profileCode: 'OUVRANT-45',
        });
      }
    });

    setDemands(projectDemands);
  };

  const handleDownloadCutSheetPdf = () => {
    playClampSound();
    generateLinearCuttingPlanPdf({
      projectTitle: surveyProjectData?.info?.clientName ? `Chantier ${surveyProjectData.info.clientName}` : 'Débit Atelier Scie',
      clientName: surveyProjectData?.info?.clientName || 'Atelier Baiti',
      clientWilaya: selectedWilaya || 'Alger',
      kerfMm,
      totalStockBars: optimizationResult.totalStockBars,
      totalRemnantsUsed: optimizationResult.totalRemnantsUsed,
      overallYieldPercent: optimizationResult.overallUtilizationRate * 100,
      bars: optimizationResult.bars.map((b, idx) => ({
        barIndex: idx + 1,
        stockLength: b.stockLength,
        isRemnant: b.stockLength < 6000,
        cuts: b.cuts.map((c) => ({
          length: c.length,
          label: c.label,
          miterLeft: c.miterLeft,
          miterRight: c.miterRight,
        })),
        wasteLength: b.wasteLength,
      })),
    });
  };

  const handleImportCadDemands = () => {
    playClampSound();
    if (!cadDemandsAvailable || !cadDemandsAvailable.length) return;
    setDemands(cadDemandsAvailable);
  };

  const handleImportCurrentWindow = () => {
    playClampSound();
    setDemands([
      {
        id: createDemandId(),
        length: config.width,
        quantity: 2,
        miterLeft: 45,
        miterRight: 45,
        label: `Dormant (${config.width}mm)`,
        profileCode: 'DORMANT-45',
      },
      {
        id: createDemandId(),
        length: config.height,
        quantity: 2,
        miterLeft: 45,
        miterRight: 45,
        label: `Montants (${config.height}mm)`,
        profileCode: 'DORMANT-45',
      },
      {
        id: createDemandId(),
        length: Math.round(config.width / 2 + 15),
        quantity: 4,
        miterLeft: 45,
        miterRight: 45,
        label: 'Ouvrants Horiz.',
        profileCode: 'OUVRANT-45',
      },
      {
        id: createDemandId(),
        length: config.height - 70,
        quantity: 4,
        miterLeft: 45,
        miterRight: 45,
        label: 'Ouvrants Vert.',
        profileCode: 'OUVRANT-45',
      },
    ]);
  };

  return (
    <div className="pb-36 px-3 sm:px-6 pt-2 max-w-xl md:max-w-2xl mx-auto space-y-4" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* 0A. ACTIVE FIELD SURVEY BANNER */}
      {surveyProjectData && surveyProjectData.openings.length > 0 && (
        <div
          className={`p-3.5 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono shadow-xs transition-all ${
            isLight
              ? 'bg-amber-50/90 border-amber-200 text-slate-800'
              : 'bg-amber-500/10 border-amber-500/25 text-amber-200'
          }`}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-[#D4AF37]/20 border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37] shrink-0">
              <ClipboardList className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="font-bold flex items-center gap-1.5 truncate">
                <span className={isLight ? 'text-slate-900 font-bold' : 'text-white font-bold'}>
                  Chantier Relevé : {surveyProjectData.info?.clientName || 'M. Amrani'}
                </span>
              </div>
              <div className={`text-[10px] truncate ${isLight ? 'text-slate-600 font-medium' : 'text-zinc-400'}`}>
                {surveyProjectData.openings.length} châssis mesurés • {surveyProjectData.openings.reduce((sum, o) => sum + (o.quantity || 1) * 8, 0)} pièces estimées
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 self-end sm:self-auto shrink-0 flex-wrap">
            <button
              type="button"
              onClick={handleImportSurveyProject}
              className="px-3 py-2 rounded-xl bg-[#D4AF37] text-slate-950 font-bold text-[11px] cursor-pointer hover:brightness-110 active:scale-95 transition-all shadow-xs"
            >
              Importer Tout le Chantier
            </button>
            {cadDemandsAvailable && cadDemandsAvailable.length > 0 && (
              <button
                type="button"
                onClick={handleImportCadDemands}
                className="px-2.5 py-2 rounded-xl bg-sky-500/20 text-sky-400 font-bold border border-sky-500/30 text-[11px] cursor-pointer hover:bg-sky-500/30 active:scale-95 transition-all shadow-xs"
                title="Charger les débits calculés depuis le Studio CAO 2D"
              >
                Plan CAO ({cadDemandsAvailable.length})
              </button>
            )}
            <button
              type="button"
              onClick={handleImportCurrentWindow}
              className={`px-2.5 py-2 rounded-xl border text-[11px] font-medium cursor-pointer active:scale-95 transition-all ${
                isLight
                  ? 'border-slate-300 bg-white hover:bg-slate-100 text-slate-700'
                  : 'border-white/10 bg-white/5 hover:bg-white/10 text-zinc-300'
              }`}
              title="Charger uniquement le châssis 3D actif"
            >
              Châssis 3D
            </button>
          </div>
        </div>
      )}

      {/* 0B. CAD ACTIVE DEMANDS BANNER (When no survey project exists) */}
      {(!surveyProjectData || surveyProjectData.openings.length === 0) && cadDemandsAvailable && cadDemandsAvailable.length > 0 && (
        <div
          className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 text-xs font-mono shadow-xs transition-all ${
            isLight
              ? 'bg-sky-50 border-sky-200 text-slate-800'
              : 'bg-sky-500/10 border-sky-500/25 text-sky-200'
          }`}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-sky-500/20 border border-sky-500/40 flex items-center justify-center text-sky-400 shrink-0">
              <Scissors className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="font-bold flex items-center gap-1.5 truncate">
                <span className={isLight ? 'text-slate-900 font-bold' : 'text-white font-bold'}>
                  Débits CAO 2D Disponibles
                </span>
              </div>
              <div className={`text-[10px] truncate ${isLight ? 'text-slate-600 font-medium' : 'text-zinc-400'}`}>
                {cadDemandsAvailable.length} profilés calculés depuis le Studio CAO
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={handleImportCadDemands}
              className="px-3 py-2 rounded-xl bg-sky-500 text-slate-950 font-bold text-[11px] cursor-pointer hover:brightness-110 active:scale-95 transition-all shadow-xs"
            >
              Charger Plan CAO
            </button>
            <button
              type="button"
              onClick={handleImportCurrentWindow}
              className={`px-2.5 py-2 rounded-xl border text-[11px] font-medium cursor-pointer active:scale-95 transition-all ${
                isLight
                  ? 'border-slate-300 bg-white hover:bg-slate-100 text-slate-700'
                  : 'border-white/10 bg-white/5 hover:bg-white/10 text-zinc-300'
              }`}
              title="Charger le châssis 3D standard"
            >
              Châssis 3D
            </button>
          </div>
        </div>
      )}

      {/* 1. TOP STATS CARDS */}
      <div className="space-y-2 font-mono">
        <div className="grid grid-cols-3 gap-2 text-center">
          <div
            className={`p-3 rounded-2xl border ${
              isLight ? 'bg-white border-slate-200' : 'bg-[#0B0F19] border-white/10'
            }`}
          >
            <span className="text-[10px] text-zinc-400 block uppercase">Barres 6m</span>
            <span className="text-xl font-black text-[#D4AF37]">
              {optimizationResult.totalStockBars}
            </span>
          </div>

          <div
            className={`p-3 rounded-2xl border ${
              isLight ? 'bg-white border-slate-200' : 'bg-[#0B0F19] border-white/10'
            }`}
          >
            <span className="text-[10px] text-zinc-400 block uppercase">Rendement</span>
            <span className="text-xl font-black text-emerald-400">
              {(optimizationResult.overallUtilizationRate * 100).toFixed(1)}%
            </span>
          </div>

          <div
            className={`p-3 rounded-2xl border ${
              isLight ? 'bg-white border-slate-200' : 'bg-[#0B0F19] border-white/10'
            }`}
          >
            <span className="text-[10px] text-zinc-400 block uppercase">Chutes Réutilisées</span>
            <span className="text-xl font-black text-cyan-400">
              {optimizationResult.totalRemnantsUsed}
            </span>
          </div>
        </div>

        {/* Recycling & Savings Banner */}
        {optimizationResult.totalRemnantsUsed > 0 && (
          <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between text-xs text-emerald-400">
            <div className="flex items-center gap-2">
              <Recycle className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>
                {optimizationResult.totalRemnantsUsed} chute{optimizationResult.totalRemnantsUsed > 1 ? 's' : ''} réutilisée{optimizationResult.totalRemnantsUsed > 1 ? 's' : ''} en priorité
              </span>
            </div>
            <span className="font-bold">
              Éco: ~{(optimizationResult.totalRemnantsUsed * 3200).toLocaleString('fr-DZ')} DZD
            </span>
          </div>
        )}
      </div>

      {/* 2. OPTIMIZED BARS DIAGRAM */}
      <div
        className={`p-4 rounded-3xl border shadow-md space-y-3 ${
          isLight ? 'bg-white border-slate-200' : 'bg-[#0B0F19] border-white/10'
        }`}
      >
        <div className="flex items-center justify-between font-mono text-xs">
          <div className="flex items-center gap-1.5 font-bold">
            <Scissors className="w-4 h-4 text-[#D4AF37]" />
            <span>Découpe Linéaire Optimisée</span>
          </div>
          <div className="flex items-center gap-1 text-[10px]">
            <span className="text-zinc-400">Lame :</span>
            {[2.5, 3.0, 4.0].map((k) => (
              <button
                key={k}
                onClick={() => {
                  playTactileClick();
                  setKerfMm(k);
                }}
                className={`px-1.5 py-0.5 rounded cursor-pointer transition-all ${
                  kerfMm === k
                    ? 'bg-[#D4AF37] text-slate-950 font-bold shadow-xs'
                    : 'bg-white/10 text-zinc-400 hover:text-white'
                }`}
              >
                {k}mm
              </button>
            ))}
          </div>
        </div>

        {/* Visual Bar Render */}
        <div className="space-y-2.5">
          {optimizationResult.bars.map((bar, barIdx) => (
            <div
              key={barIdx}
              className={`p-3 rounded-2xl border ${
                isLight ? 'bg-slate-50 border-slate-200' : 'bg-black/30 border-white/5'
              }`}
            >
              <div className="flex items-center justify-between text-[11px] font-mono mb-1.5">
                <span className="font-bold text-[#D4AF37] flex items-center gap-1.5">
                  {bar.stockLength < 6000 ? (
                    <>
                      <span className="px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-400 text-[10px] font-bold border border-cyan-500/30">
                        Chute Atelier
                      </span>
                      <span>#{barIdx + 1} ({bar.stockLength} mm)</span>
                    </>
                  ) : (
                    <span>Barre #{barIdx + 1} (6000 mm)</span>
                  )}
                </span>
                <span className="text-zinc-400">
                  {bar.cuts.length} pièce{bar.cuts.length > 1 ? 's' : ''} • {bar.totalUsedLength} mm coupés
                </span>
              </div>

              {/* Graphical Bar Track */}
              <div className="h-7 rounded-xl bg-black/40 border border-white/10 overflow-hidden flex items-center p-0.5 gap-0.5">
                {bar.cuts.map((cut, cutIdx) => {
                  const widthPct = (cut.length / bar.stockLength) * 100;
                  return (
                    <div
                      key={cutIdx}
                      style={{ width: `${widthPct}%` }}
                      className="h-full rounded-lg bg-cyan-500/80 border border-cyan-400/50 flex items-center justify-center text-[10px] font-mono font-bold text-slate-950 truncate px-1"
                      title={`${cut.label} : ${cut.length} mm`}
                    >
                      {cut.length}
                    </div>
                  );
                })}

                {/* Waste Segment */}
                {bar.wasteLength > 0 && (
                  <div
                    style={{ width: `${(bar.wasteLength / bar.stockLength) * 100}%` }}
                    className="h-full rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-[9px] font-mono text-amber-400 truncate px-1"
                    title={`Chute : ${bar.wasteLength} mm`}
                  >
                    {bar.wasteLength >= 400 ? `${bar.wasteLength} chute` : ''}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* RECOVERABLE OFF-CUTS STRIP */}
        {recoverableRemnants.length > 0 && (
          <div
            className={`p-3 rounded-2xl border flex items-center justify-between gap-2 text-xs font-mono transition-all ${
              isLight
                ? 'bg-emerald-50 border-emerald-300 text-emerald-950 shadow-xs'
                : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200'
            }`}
          >
            <div className="flex items-center gap-2 min-w-0">
              <Recycle className="w-4 h-4 text-emerald-500 shrink-0" />
              <div className="min-w-0">
                <span className="font-bold block truncate">
                  {recoverableRemnants.length} chute{recoverableRemnants.length > 1 ? 's' : ''} valorisable{recoverableRemnants.length > 1 ? 's' : ''} (≥ 600 mm)
                </span>
                <span className={`text-[10px] block truncate ${isLight ? 'text-slate-600' : 'text-zinc-400'}`}>
                  {recoverableRemnants.map((r) => `${r.length} mm`).join(' • ')}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleIntegrateRecoverableRemnants}
              className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white font-bold text-[11px] shrink-0 cursor-pointer hover:bg-emerald-500 active:scale-95 transition-all shadow-xs"
              title="Ajouter ces chutes au stock d'atelier pour les prochains débits"
            >
              Réintégrer Stock
            </button>
          </div>
        )}

        {/* CONSUMED REMNANTS NOTIFICATION */}
        {optimizationResult.bars.some((b) => b.stockLength < 6000) && (
          <div className="flex items-center justify-between text-[11px] font-mono px-1">
            <span className={isLight ? 'text-slate-600' : 'text-zinc-400'}>
              {optimizationResult.bars.filter((b) => b.stockLength < 6000).length} chute(s) utilisée(s) du stock
            </span>
            <button
              type="button"
              onClick={handlePurgeConsumedRemnants}
              className="text-[#D4AF37] hover:underline cursor-pointer font-bold"
            >
              Déduire du stock
            </button>
          </div>
        )}

        {/* Export & Action Buttons */}
        <div className="pt-1 space-y-2">
          <button
            type="button"
            onClick={() => {
              playClampSound();
              setIsTerminalOpen(true);
            }}
            className="w-full py-2.5 rounded-2xl bg-gradient-to-r from-[#C5A880] to-[#D4AF37] text-slate-950 font-mono font-bold text-xs flex items-center justify-center gap-2 cursor-pointer min-h-[46px] hover:brightness-110 active:scale-98 transition-all shadow-md"
          >
            <ScanLine className="w-4 h-4" />
            <span>Terminal Scie & Assemblage Atelier</span>
          </button>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <button
              onClick={handleShareWhatsAppCutSheet}
              className="w-full py-2.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-mono font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer min-h-[44px] hover:bg-emerald-500/20 active:scale-98 transition-all"
            >
              <MessageCircle className="w-4 h-4" />
              <span>WhatsApp Scie</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadCutSheetPdf}
              className="w-full py-2.5 rounded-2xl bg-[#D4AF37]/15 border border-[#D4AF37]/40 text-[#D4AF37] font-mono font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer min-h-[44px] hover:bg-[#D4AF37]/25 active:scale-98 transition-all"
            >
              <FileDown className="w-4 h-4" />
              <span>Fiche Scie PDF</span>
            </button>

            <button
              onClick={handleDownloadCsv}
              className={`w-full py-2.5 rounded-2xl border font-mono font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer min-h-[44px] active:scale-98 transition-all ${
                isLight
                  ? 'bg-black/5 hover:bg-black/10 border-black/10 text-slate-800'
                  : 'bg-white/10 hover:bg-white/15 border-white/10 text-zinc-300'
              }`}
            >
              <Download className="w-4 h-4 text-zinc-400" />
              <span>Télécharger CSV</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. WORKSHOP CHUTES / REMNANTS STOCK MANAGER */}
      <div
        className={`p-4 rounded-3xl border shadow-md space-y-3 ${
          isLight ? 'bg-white border-slate-200' : 'bg-[#0B0F19] border-white/10'
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Recycle className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-mono font-bold">Chutes d'Atelier Disponibles</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 font-semibold border border-emerald-500/30">
              {remnants.length}
            </span>
          </div>

          <button
            type="button"
            onClick={() => {
              playTactileClick();
              setIsRemnantsOpen(!isRemnantsOpen);
            }}
            className="p-1.5 rounded-xl border border-black/10 dark:border-white/10 text-zinc-400 hover:text-white cursor-pointer"
            title="Gérer les chutes d'atelier"
          >
            {isRemnantsOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>

        {/* Quick presets chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5 text-xs font-mono">
          <span className="text-zinc-500 text-[10px] shrink-0">Ajout rapide :</span>
          {[950, 1450, 1850, 2200].map((len) => (
            <button
              key={len}
              type="button"
              onClick={() => handleAddRemnant(len)}
              className={`px-2 py-1 rounded-lg border text-[10px] shrink-0 cursor-pointer active:scale-95 transition-all ${
                isLight
                  ? 'bg-black/5 hover:bg-black/10 border-black/10 text-slate-800'
                  : 'bg-white/5 hover:bg-white/10 border-white/10 text-zinc-300'
              }`}
            >
              +{len} mm
            </button>
          ))}
        </div>

        {/* Expanded remnant manager */}
        {isRemnantsOpen && (
          <div className="space-y-3 pt-2 border-t border-black/5 dark:border-white/10">
            {/* Remnants list */}
            {remnants.length === 0 ? (
              <p className="text-xs text-zinc-500 font-mono italic py-2 text-center">
                Aucune chute enregistrée. Ajoutez vos restes de barres pour les réutiliser en priorité.
              </p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-40 overflow-y-auto pr-1">
                {remnants.map((r) => (
                  <div
                    key={r.id}
                    className={`p-2 rounded-xl border flex items-center justify-between text-xs font-mono ${
                      isLight ? 'bg-slate-50 border-slate-200' : 'bg-black/20 border-white/5'
                    }`}
                  >
                    <div>
                      <span className="font-bold text-emerald-400">{r.length} mm</span>
                      <span className="text-[9px] text-zinc-500 block">Chute alu</span>
                    </div>
                    <button
                      onClick={() => handleRemoveRemnant(r.id)}
                      className="p-1 text-zinc-400 hover:text-red-400 cursor-pointer"
                      title="Supprimer cette chute"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Custom length remnant input */}
            <div className="flex items-center gap-2 pt-1 font-mono text-xs">
              <input
                type="number"
                placeholder="Longueur chute (mm)"
                value={newRemnantLength}
                onChange={(e) => setNewRemnantLength(parseInt(e.target.value) || 0)}
                className={`flex-1 p-2 rounded-xl border ${
                  isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-black/40 border-white/10 text-white'
                }`}
              />
              <button
                type="button"
                onClick={() => handleAddRemnant()}
                className="px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs flex items-center gap-1 cursor-pointer hover:brightness-110 active:scale-98 transition-all shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Ajouter Chute</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 4. CUT DEMANDS LIST & ADD FORM */}
      <div
        className={`p-4 rounded-3xl border shadow-md space-y-3 ${
          isLight ? 'bg-white border-slate-200' : 'bg-[#0B0F19] border-white/10'
        }`}
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono font-bold">Pièces à Débiter</span>
          <button
            onClick={handleImportCurrentWindow}
            className="px-2.5 py-1 rounded-xl bg-[#D4AF37]/15 border border-[#D4AF37]/30 text-[#D4AF37] text-[10px] font-mono font-bold flex items-center gap-1 cursor-pointer hover:brightness-110"
          >
            <Download className="w-3 h-3" />
            <span>Depuis Châssis 3D</span>
          </button>
        </div>

        {/* Existing Demands List */}
        <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
          {demands.map((d) => (
            <div
              key={d.id}
              className={`p-2.5 rounded-2xl border flex items-center justify-between text-xs font-mono ${
                isLight ? 'bg-slate-50 border-slate-200' : 'bg-black/20 border-white/5'
              }`}
            >
              <div>
                <span className={`font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>{d.label}</span>
                <span className="text-[10px] text-zinc-500 block">
                  Coupes 45°/45° • Longueur : {d.length} mm
                </span>
              </div>

              <div className="flex items-center gap-3">
                <span className="font-bold text-cyan-400">× {d.quantity}</span>
                <button
                  onClick={() => handleRemoveDemand(d.id)}
                  className="p-1.5 rounded-lg text-zinc-400 hover:text-red-400 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Add piece form */}
        <div className="pt-2 border-t border-black/5 dark:border-white/10 grid grid-cols-12 gap-1.5 text-xs font-mono">
          <input
            type="text"
            placeholder="Désignation"
            value={newLabel}
            onChange={(e) => setNewLabel(e.target.value)}
            className={`col-span-5 p-2 rounded-xl border ${
              isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-black/40 border-white/10 text-white'
            }`}
          />
          <input
            type="number"
            placeholder="Longueur"
            value={newLength}
            onChange={(e) => setNewLength(parseInt(e.target.value) || 0)}
            className={`col-span-4 p-2 rounded-xl border ${
              isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-black/40 border-white/10 text-white'
            }`}
          />
          <input
            type="number"
            placeholder="Qté"
            value={newQty}
            onChange={(e) => setNewQty(parseInt(e.target.value) || 1)}
            className={`col-span-3 p-2 rounded-xl border ${
              isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-black/40 border-white/10 text-white'
            }`}
          />

          <button
            onClick={handleAddDemand}
            className="col-span-12 py-2.5 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer hover:brightness-110 active:scale-98 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Ajouter au Plan de Coupe</span>
          </button>
        </div>
      </div>

      {/* 4. TOUCHSCREEN ASSEMBLY TERMINAL MODAL */}
      <CuttingAssemblyTerminal
        isOpen={isTerminalOpen}
        onClose={() => setIsTerminalOpen(false)}
        bom={currentBom}
        config={config}
        jobName="Débit Scie Mobile Atelier"
      />

      {/* Floating Remnant Action Toast */}
      {remnantToastMessage && (
        <div className="fixed bottom-24 left-4 right-4 z-50 flex items-center justify-between gap-3 p-3.5 rounded-2xl bg-slate-900/95 text-white border border-emerald-500/40 shadow-xl backdrop-blur-md animate-in fade-in slide-in-from-bottom-3 duration-200">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
              <Check className="w-4 h-4" />
            </div>
            <span className="text-xs font-mono font-medium truncate">{remnantToastMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setRemnantToastMessage(null)}
            className="p-1 rounded-lg hover:bg-white/10 text-zinc-400 hover:text-white shrink-0 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};

export default MobileCuttingScreen;
