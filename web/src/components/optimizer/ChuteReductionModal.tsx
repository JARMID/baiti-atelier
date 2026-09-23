import React, { useState, useMemo } from 'react';
import { useConfigStore } from '../../store/configStore';
import { optimize1DLinearStock } from '../../utils/linearCutOptimizer';
import { computeDetailedBOM } from '../../utils/cadEngine';
import { generateWorkshopCutSheetPdf } from '../../utils/pdfGenerator';
import { downloadLinearCutPlanCsv } from '../../utils/csvExporter';
import { getOffcutInventory, addOffcut } from '../../utils/offcutManager';
import type { CutDemand1D, StockBar1D, OptimizedBar1D } from '../../types/optimizer';
import type { CadStructure, CellType } from '../../types/cad';
import {
  Scissors,
  X,
  FileDown,
  Printer,
  TrendingDown,
  Layers,
  Sparkles,
  BookmarkPlus,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';
import { playTactileClick, playSwitchSound, playClampSound } from '../../utils/audioFeedback';

interface ChuteReductionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenFullStudio?: () => void;
}

export const ChuteReductionModal: React.FC<ChuteReductionModalProps> = ({
  isOpen,
  onClose,
  onOpenFullStudio,
}) => {
  const { config, language, theme } = useConfigStore();
  const isLight = theme === 'light';
  const isRtl = language === 'ar';

  // Batch Multiplier: 1 (Unitaire), 3 (Appartement), 8 (Villa), 20 (Chantier)
  const [batchCount, setBatchCount] = useState<number>(3);
  const [savedOffcutsNotice, setSavedOffcutsNotice] = useState<string | null>(null);

  // Derive CAD structure from current window config
  const cadStructure = useMemo<CadStructure>(() => {
    const cellTypes: Record<string, CellType> = {};
    if (config.openingType === 'sliding_2') {
      cellTypes['0-0'] = 'sash_slide';
      cellTypes['0-1'] = 'sash_slide';
    } else if (config.openingType === 'casement_2') {
      cellTypes['0-0'] = 'sash_left';
      cellTypes['0-1'] = 'sash_right';
    } else if (config.openingType === 'sliding_3') {
      cellTypes['0-0'] = 'sash_slide';
      cellTypes['0-1'] = 'sash_slide';
      cellTypes['0-2'] = 'sash_slide';
    } else if (config.openingType === 'tilt_turn') {
      cellTypes['0-0'] = 'sash_tilt_turn';
    } else if (config.openingType === 'casement_1') {
      cellTypes['0-0'] = 'sash_left';
    } else {
      cellTypes['0-0'] = 'glass_fixed';
    }

    return {
      width: config.width,
      height: config.height,
      verticalDividers:
        config.openingType === 'sliding_2' || config.openingType === 'casement_2'
          ? [Math.round(config.width / 2)]
          : config.openingType === 'sliding_3'
          ? [Math.round(config.width / 3), Math.round((config.width * 2) / 3)]
          : [],
      horizontalDividers: [],
      cellTypes,
    };
  }, [config.width, config.height, config.openingType]);

  // Compute BOM cuts for the current window
  const bom = useMemo(() => {
    return computeDetailedBOM(cadStructure, config);
  }, [cadStructure, config]);

  // Convert BOM cuts into 1D linear cut demands multiplied by the batch count
  const demands1D = useMemo<CutDemand1D[]>(() => {
    return bom.cuts.map((cut, idx) => ({
      id: `demand-${idx}-${cut.id}`,
      length: cut.lengthMm,
      quantity: cut.quantity * batchCount,
      miterLeft: cut.cutLeftAngle === 45 ? 45 : 90,
      miterRight: cut.cutRightAngle === 45 ? 45 : 90,
      label: cut.label,
      profileCode:
        cut.role === 'frame'
          ? 'DORMANT-45'
          : cut.role === 'sash'
          ? 'OUVRANT-45'
          : cut.role === 'mullion'
          ? 'MENEAU-45'
          : 'PARCLOSE-45',
    }));
  }, [bom, batchCount]);

  // Load existing workshop offcuts
  const existingRemnants = useMemo<StockBar1D[]>(() => {
    const inv = getOffcutInventory();
    return inv.map((r, idx) => ({
      id: r.id || `rem-${idx}`,
      length: r.lengthMm,
      isRemnant: true,
      profileCode: r.profileCode || 'ALU-6063-T6',
      label: `${r.label} (${r.rackLocation})`,
    }));
  }, []);

  // Run the 1D Linear Optimization
  const optimizationResult = useMemo(() => {
    return optimize1DLinearStock(demands1D, existingRemnants, {
      standardBarLength: 6000,
      kerf: 4, // 4mm saw blade kerf (disque carbure standard atelier algérien)
      clampTrim: 20, // 20mm trim on each bar end
      minRemnantLength: 800, // Scraps >= 800mm are reusable offcuts
    });
  }, [demands1D, existingRemnants]);

  // Total linear meters cut
  const totalCutsLengthM = useMemo(() => {
    return demands1D.reduce((acc, d) => acc + (d.length * d.quantity) / 1000, 0);
  }, [demands1D]);

  // Unoptimized manual estimate (~18.5% loss standard in Algerian workshops cutting by hand)
  const manualWasteRate = 0.185;
  const manualBarsCount = Math.ceil((totalCutsLengthM * (1 + manualWasteRate)) / 5.96);
  const algoBarsCount = optimizationResult.totalStockBars;
  const barsSaved = Math.max(0, manualBarsCount - algoBarsCount);

  // Financial savings in DZD (Standard price: ~780 DZD/kg, 1.25 kg/m = 975 DZD/m)
  const estimatedSavingsDzd = Math.round(
    barsSaved * 6 * 975 +
      (manualWasteRate - (1 - optimizationResult.overallUtilizationRate)) *
        totalCutsLengthM *
        975
  );

  const chuteLossPercent = Math.max(
    0.5,
    Math.round((1 - optimizationResult.overallUtilizationRate) * 1000) / 10
  );

  // Handle Export Cut Sheet PDF
  const handleExportPdf = () => {
    playTactileClick();
    generateWorkshopCutSheetPdf(cadStructure, config, bom);
  };

  // Handle Export Saw CSV
  const handleExportCsv = () => {
    playTactileClick();
    downloadLinearCutPlanCsv(
      optimizationResult,
      `debit_optimise_${config.width}x${config.height}_qte${batchCount}.csv`
    );
  };

  // Handle save reusable offcuts to workshop rack inventory
  const handleSaveOffcutsToInventory = () => {
    playClampSound();
    let savedCount = 0;
    optimizationResult.bars.forEach((bar, idx) => {
      if (bar.isReusableRemnant && bar.wasteLength >= 800) {
        addOffcut({
          profileCode: 'ALU-6063-T6',
          label: `Chute Récupérée Débit Châssis ${config.width}×${config.height}`,
          material: 'aluminium',
          finishColor: config.finishColor,
          lengthMm: bar.wasteLength,
          rackLocation: `CASIER-CHUTE-${String.fromCharCode(65 + (idx % 4))}`,
          jobOrigin: `Lot #${batchCount} Châssis ${config.width}×${config.height}`,
        });
        savedCount++;
      }
    });

    setSavedOffcutsNotice(
      language === 'ar'
        ? `تم حفظ ${savedCount} قطعة فواضل صالحة للاستعمال في مخزن الورشة بنجاح!`
        : `${savedCount} chute(s) réutilisable(s) enregistrée(s) avec succès dans le casier d'atelier!`
    );

    setTimeout(() => {
      setSavedOffcutsNotice(null);
    }, 4500);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto animate-fade-in"
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      <div
        className={`w-full max-w-5xl rounded-3xl border shadow-2xl overflow-hidden my-auto transition-all ${
          isLight
            ? 'bg-white border-slate-200 text-slate-900 shadow-slate-300/60'
            : 'bg-[#0B0F19] border-cyan-500/20 text-white shadow-2xl shadow-cyan-950/40'
        }`}
      >
        {/* MODAL HEADER */}
        <div
          className={`p-5 sm:p-6 border-b flex items-center justify-between gap-4 ${
            isLight
              ? 'bg-slate-50/80 border-slate-200'
              : 'bg-gradient-to-r from-[#0E1626] to-[#0A101C] border-white/10'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
              <Scissors className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg sm:text-xl font-bold font-serif tracking-tight">
                  {language === 'ar'
                    ? 'التحسين الآلي للتقطيع وتقليص الفواضل (Nesting 1D)'
                    : 'Optimisation Automatique de Débitage & Réduction des Chutes'}
                </h3>
                <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[11px] font-mono font-bold">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  DTR C3-2
                </span>
              </div>
              <p
                className={`text-xs mt-0.5 ${
                  isLight ? 'text-slate-600' : 'text-zinc-400'
                }`}
              >
                {language === 'ar'
                  ? `حساب فوري للأشرطة بطول 6000 ملم للشاسيه (${config.width} × ${config.height} ملم) بدون أي عمليات حسابية يدوية`
                  : `Calcul automatisé de calepinage sur barres de 6 000 mm pour le châssis (${config.width} × ${config.height} mm) sans calcul manuel`}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              playTactileClick();
              onClose();
            }}
            className={`p-2 rounded-xl border transition-colors cursor-pointer ${
              isLight
                ? 'bg-slate-200 hover:bg-slate-300 border-slate-300 text-slate-700'
                : 'bg-white/5 hover:bg-white/10 border-white/10 text-zinc-400 hover:text-white'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* BODY */}
        <div className="p-5 sm:p-7 space-y-6 max-h-[78vh] overflow-y-auto">
          {/* NOTICE BANNER */}
          {savedOffcutsNotice && (
            <div className="p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs font-mono flex items-center gap-2 animate-pulse">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{savedOffcutsNotice}</span>
            </div>
          )}

          {/* BATCH SELECTOR STRIP */}
          <div
            className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
              isLight
                ? 'bg-slate-50 border-slate-200'
                : 'bg-white/5 border-white/10'
            }`}
          >
            <div>
              <span className="text-xs font-mono font-bold uppercase text-[#D4AF37] block">
                {language === 'ar' ? 'حجم الطلبية / الورشة :' : 'VOLUME DU CHANTIER / COMMANDE :'}
              </span>
              <span
                className={`text-xs ${
                  isLight ? 'text-slate-600' : 'text-zinc-400'
                }`}
              >
                {language === 'ar'
                  ? 'يتم دمج ومضاعفة جميع مقاطع الألمنيوم تلقائياً داخل الخوارزمية'
                  : 'Toutes les barres sont imbriquées automatiquement par programmation linéaire'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {[
                { count: 1, label: language === 'ar' ? 'شاسيه 1' : '1 Châssis (Unitaire)' },
                { count: 3, label: language === 'ar' ? '3 شاسيه' : '3 Châssis (Logement)' },
                { count: 8, label: language === 'ar' ? '8 شاسيه' : '8 Châssis (Villa)' },
                { count: 20, label: language === 'ar' ? '20 شاسيه' : '20 Châssis (Immeuble)' },
              ].map((b) => (
                <button
                  key={b.count}
                  onClick={() => {
                    playSwitchSound();
                    setBatchCount(b.count);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-mono font-semibold transition-all cursor-pointer ${
                    batchCount === b.count
                      ? 'bg-[#D4AF37] text-slate-950 shadow-md shadow-[#D4AF37]/25 font-bold scale-[1.02]'
                      : isLight
                      ? 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                      : 'bg-black/40 text-zinc-300 border border-white/10 hover:bg-white/10'
                  }`}
                >
                  {b.label}
                </button>
              ))}
            </div>
          </div>

          {/* 3 TOP KPI SUMMARY CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Card 1: Chute Rate */}
            <div
              className={`p-4 rounded-2xl border relative overflow-hidden ${
                isLight
                  ? 'bg-emerald-50/60 border-emerald-200'
                  : 'bg-emerald-950/20 border-emerald-500/30'
              }`}
            >
              <div className="flex items-center justify-between text-xs font-mono text-emerald-500 mb-1">
                <span>TAUX DE CHUTE NET</span>
                <TrendingDown className="w-4 h-4" />
              </div>
              <div className="text-3xl font-extrabold font-mono text-emerald-500">
                {chuteLossPercent}%
              </div>
              <p
                className={`text-[11px] mt-1 ${
                  isLight ? 'text-slate-600' : 'text-zinc-400'
                }`}
              >
                vs <span className="line-through font-mono">18.5%</span> en coupe
                manuelle traditionnelle (-
                {(18.5 - chuteLossPercent).toFixed(1)}% de déchets éliminés)
              </p>
            </div>

            {/* Card 2: 6000mm Bars Needed */}
            <div
              className={`p-4 rounded-2xl border ${
                isLight
                  ? 'bg-sky-50/60 border-sky-200'
                  : 'bg-sky-950/20 border-sky-500/30'
              }`}
            >
              <div className="flex items-center justify-between text-xs font-mono text-sky-500 mb-1">
                <span>BARRES 6 000 MM REQUISES</span>
                <Layers className="w-4 h-4" />
              </div>
              <div className="text-3xl font-extrabold font-mono text-sky-500">
                {algoBarsCount}{' '}
                <span className="text-sm font-normal text-sky-400">barres</span>
              </div>
              <p
                className={`text-[11px] mt-1 ${
                  isLight ? 'text-slate-600' : 'text-zinc-400'
                }`}
              >
                Économie directe de{' '}
                <span className="text-emerald-500 font-bold">
                  {barsSaved} barre(s) marchande(s)
                </span>{' '}
                grâce au calepinage algorithmique
              </p>
            </div>

            {/* Card 3: Financial ROI Savings in DZD */}
            <div
              className={`p-4 rounded-2xl border ${
                isLight
                  ? 'bg-amber-50/60 border-amber-200'
                  : 'bg-[#D4AF37]/10 border-[#D4AF37]/30'
              }`}
            >
              <div className="flex items-center justify-between text-xs font-mono text-[#D4AF37] mb-1">
                <span>ÉCONOMIE ESTIMÉE ATELIER</span>
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="text-3xl font-extrabold font-mono text-[#D4AF37]">
                +{estimatedSavingsDzd.toLocaleString()}{' '}
                <span className="text-sm font-normal">DZD</span>
              </div>
              <p
                className={`text-[11px] mt-1 ${
                  isLight ? 'text-slate-600' : 'text-zinc-400'
                }`}
              >
                Matière brute aluminium préservée et valorisée sur ce lot de
                fabrication
              </p>
            </div>
          </div>

          {/* VISUAL 1D BAR NESTING CUT LAYOUT */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-bold font-mono uppercase tracking-wider flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400" />
                <span>
                  {language === 'ar'
                    ? 'مخطط التقطيع المرئي لكل بارة 6000 ملم :'
                    : 'CALEPINAGE VISUEL PAR BARRE DE 6 000 MM :'}
                </span>
              </h4>
              <div className="flex items-center gap-3 text-[11px] font-mono">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded bg-blue-500" />
                  <span>Dormants</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded bg-[#D4AF37]" />
                  <span>Ouvrants</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded bg-cyan-400" />
                  <span>Parcloses / Autres</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded bg-emerald-500" />
                  <span>Chute Réutilisable (≥800mm)</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded bg-red-500" />
                  <span>Chute Perte (&lt;800mm)</span>
                </span>
              </div>
            </div>

            <div className="space-y-3">
              {optimizationResult.bars.map((bar: OptimizedBar1D) => {
                const totalBarLength = bar.stockLength || 6000;
                return (
                  <div
                    key={bar.barIndex}
                    className={`p-3.5 rounded-2xl border transition-colors ${
                      isLight
                        ? 'bg-slate-50 border-slate-200'
                        : 'bg-black/30 border-white/10'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs font-mono mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-cyan-400">
                          BARRE #{bar.barIndex}
                        </span>
                        <span
                          className={`text-[11px] ${
                            isLight ? 'text-slate-500' : 'text-zinc-400'
                          }`}
                        >
                          (Profil Aluminium 6000 mm)
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span
                          className={`text-[11px] ${
                            isLight ? 'text-slate-600' : 'text-zinc-400'
                          }`}
                        >
                          Utilisation :{' '}
                          <strong className="text-emerald-500">
                            {(bar.utilizationRate * 100).toFixed(1)}%
                          </strong>
                        </span>
                        <span
                          className={`text-[11px] font-bold ${
                            bar.isReusableRemnant
                              ? 'text-emerald-400'
                              : 'text-amber-400'
                          }`}
                        >
                          Chute : {bar.wasteLength} mm{' '}
                          {bar.isReusableRemnant ? '(Récupérable)' : '(Perte)'}
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar Container representing 6000mm */}
                    <div className="h-9 w-full rounded-xl overflow-hidden bg-slate-800/60 p-1 flex gap-0.5 border border-white/10 shadow-inner">
                      {bar.cuts.map((cut, cIdx) => {
                        const widthPct = (cut.length / totalBarLength) * 100;
                        const isDormant = cut.label.toLowerCase().includes('dormant');
                        const isOuvrant = cut.label.toLowerCase().includes('ouvrant');
                        const bgCol = isDormant
                          ? 'bg-blue-600 hover:bg-blue-500 text-white'
                          : isOuvrant
                          ? 'bg-[#D4AF37] hover:bg-[#C5A880] text-slate-950 font-bold'
                          : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold';

                        return (
                          <div
                            key={cIdx}
                            style={{ width: `${widthPct}%` }}
                            className={`${bgCol} h-full rounded-md flex items-center justify-center text-[10px] font-mono px-1 truncate transition-all cursor-pointer relative group`}
                            title={`${cut.label}: ${cut.length}mm (Angles: ${cut.miterLeft}° / ${cut.miterRight}°)`}
                          >
                            <span className="truncate">
                              {cut.length}mm{' '}
                              <span className="opacity-75 hidden sm:inline">
                                ({cut.miterLeft}°/{cut.miterRight}°)
                              </span>
                            </span>
                          </div>
                        );
                      })}

                      {/* Waste / Chute Segment at the end of the bar */}
                      {bar.wasteLength > 0 && (
                        <div
                          style={{
                            width: `${(bar.wasteLength / totalBarLength) * 100}%`,
                          }}
                          className={`${
                            bar.isReusableRemnant
                              ? 'bg-emerald-600/80 border border-emerald-400/50 text-white'
                              : 'bg-red-500/70 border border-red-400/50 text-white'
                          } h-full rounded-md flex items-center justify-center text-[9px] font-mono px-1 truncate`}
                          title={`Chute résiduelle: ${bar.wasteLength}mm (${
                            bar.isReusableRemnant
                              ? 'Réutilisable en atelier'
                              : 'Perte'
                          })`}
                        >
                          <span className="truncate">
                            {bar.wasteLength}mm {bar.isReusableRemnant ? '✓' : '✗'}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ACTION BUTTONS BAR */}
          <div
            className={`p-4 rounded-2xl border flex flex-wrap items-center justify-between gap-3 ${
              isLight
                ? 'bg-slate-50 border-slate-200'
                : 'bg-[#0E1524] border-white/10'
            }`}
          >
            <div className="flex flex-wrap items-center gap-2.5">
              <button
                onClick={handleExportPdf}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#C5A880] to-[#D4AF37] hover:brightness-110 text-slate-950 font-bold text-xs font-mono flex items-center gap-2 transition-all shadow-lg shadow-[#D4AF37]/20 cursor-pointer hover-lift btn-press"
              >
                <Printer className="w-4 h-4" />
                <span>{language === 'ar' ? 'طباعة كشف التقطيع (PDF)' : 'Imprimer Fiche de Coupe (PDF)'}</span>
              </button>

              <button
                onClick={handleExportCsv}
                className={`px-4 py-2.5 rounded-xl border text-xs font-mono flex items-center gap-2 transition-all cursor-pointer hover-lift btn-press ${
                  isLight
                    ? 'bg-white hover:bg-slate-100 border-slate-300 text-slate-800'
                    : 'bg-white/5 hover:bg-white/10 border-white/15 text-zinc-200'
                }`}
                title="Exporter pour scie double-tête Elumatec, Emmegi, FOM Industrie"
              >
                <FileDown className="w-4 h-4 text-cyan-400" />
                <span>{language === 'ar' ? 'تصدير للآلات CNC (CSV)' : 'Exporter Scie CNC (CSV)'}</span>
              </button>

              <button
                onClick={handleSaveOffcutsToInventory}
                className={`px-4 py-2.5 rounded-xl border text-xs font-mono flex items-center gap-2 transition-all cursor-pointer hover-lift btn-press ${
                  isLight
                    ? 'bg-emerald-50 hover:bg-emerald-100 border-emerald-300 text-emerald-800'
                    : 'bg-emerald-500/10 hover:bg-emerald-500/20 border-emerald-500/30 text-emerald-300'
                }`}
                title="Enregistrer les chutes récupérables au casier d'atelier"
              >
                <BookmarkPlus className="w-4 h-4 text-emerald-400" />
                <span>{language === 'ar' ? 'حفظ الفواضل في الرفوف' : 'Sauvegarder Chutes en Stock'}</span>
              </button>
            </div>

            {onOpenFullStudio && (
              <button
                onClick={() => {
                  playTactileClick();
                  onClose();
                  onOpenFullStudio();
                }}
                className={`px-4 py-2.5 rounded-xl text-xs font-mono flex items-center gap-1.5 transition-colors cursor-pointer ${
                  isLight
                    ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                    : 'text-zinc-400 hover:text-white hover:bg-white/10'
                }`}
              >
                <span>Studio Débitage Complet</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
