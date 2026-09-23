import React from 'react';
import {
  ShieldCheck,
  Flame,
  Volume2,
  Waves,
  Sun,
  Check,
  MessageCircle,
  FileCheck,
  Sparkles,
} from 'lucide-react';
import type { GlassType } from '../../types/window';
import {
  GLASS_SPECIFICATIONS,
  calculateGlazingEnergySavingsPercent,
  formatGlazingComparisonWhatsAppMessage,
} from '../../utils/glassSpecifications';
import { playSwitchSound, playTactileClick } from '../../utils/audioFeedback';

export interface GlazingPerformanceMatrixProps {
  currentGlassType: GlassType;
  onSelectGlassType: (glass: GlassType) => void;
  widthMm: number;
  heightMm: number;
  totalGlassAreaM2: number;
  wilayaName: string;
  isLight?: boolean;
  onExportDtrPdf?: () => void;
  isGeneratingPdf?: boolean;
  onOpenThermalStressModal?: () => void;
  onOpenAcousticModal?: () => void;
}

interface BenchmarkCard {
  id: GlassType;
  titleFr: string;
  subFr: string;
  formula: string;
  ug: number;
  rwDb: number;
  sw: number;
  pricePerM2: number;
  tagFr: string;
  highlightClass: string;
  tagClass: string;
}

export const GlazingPerformanceMatrix: React.FC<GlazingPerformanceMatrixProps> = ({
  currentGlassType,
  onSelectGlassType,
  widthMm,
  heightMm,
  totalGlassAreaM2,
  wilayaName,
  isLight = false,
  onExportDtrPdf,
  isGeneratingPdf = false,
  onOpenThermalStressModal,
  onOpenAcousticModal,
}) => {
  const safeAreaM2 = Math.max(0.1, Number(totalGlassAreaM2.toFixed(2)));

  const benchmarkCards: BenchmarkCard[] = [
    {
      id: 'double_clear',
      titleFr: 'Double Vitrage 4/16/4',
      subFr: 'Isolation Standard (Air)',
      formula: '4-16-4 Air Standard',
      ug: GLASS_SPECIFICATIONS.double_clear.ug,
      rwDb: GLASS_SPECIFICATIONS.double_clear.rwDb,
      sw: GLASS_SPECIFICATIONS.double_clear.sw,
      pricePerM2: GLASS_SPECIFICATIONS.double_clear.basePriceDzdPerM2,
      tagFr: 'Référence Standard',
      highlightClass: 'border-slate-300 dark:border-white/10',
      tagClass: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
    },
    {
      id: 'double_argon_warmedge',
      titleFr: '4/16/4 Argon + Warm-Edge',
      subFr: 'Haute Efficacité Thermique',
      formula: '4-16-4 Argon 90% WE',
      ug: GLASS_SPECIFICATIONS.double_argon_warmedge.ug,
      rwDb: GLASS_SPECIFICATIONS.double_argon_warmedge.rwDb,
      sw: GLASS_SPECIFICATIONS.double_argon_warmedge.sw,
      pricePerM2: GLASS_SPECIFICATIONS.double_argon_warmedge.basePriceDzdPerM2,
      tagFr: 'Économie Chauffage & Clim',
      highlightClass: 'border-emerald-500/40 bg-emerald-500/5',
      tagClass: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    },
    {
      id: 'phonique_stadip',
      titleFr: 'Stadip Silence 38 dB',
      subFr: 'Feuilleté Acoustique Lourd',
      formula: '44.2 Silence - 16 - 4',
      ug: GLASS_SPECIFICATIONS.phonique_stadip.ug,
      rwDb: GLASS_SPECIFICATIONS.phonique_stadip.rwDb,
      sw: GLASS_SPECIFICATIONS.phonique_stadip.sw,
      pricePerM2: GLASS_SPECIFICATIONS.phonique_stadip.basePriceDzdPerM2,
      tagFr: 'Silence Absolu (Rocade/Ville)',
      highlightClass: 'border-cyan-500/40 bg-cyan-500/5',
      tagClass: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',
    },
    {
      id: 'stop_sol',
      titleFr: 'Stop-Sol Réfléchissant',
      subFr: 'Protection Solaire Plein Sud',
      formula: '4-16-4 Stop-Sol Bronze/Bleu',
      ug: GLASS_SPECIFICATIONS.stop_sol.ug,
      rwDb: GLASS_SPECIFICATIONS.stop_sol.rwDb,
      sw: GLASS_SPECIFICATIONS.stop_sol.sw,
      pricePerM2: GLASS_SPECIFICATIONS.stop_sol.basePriceDzdPerM2,
      tagFr: 'Anti-Surchauffe Estivale',
      highlightClass: 'border-amber-500/40 bg-amber-500/5',
      tagClass: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    },
  ];

  const handleShareWhatsApp = () => {
    playTactileClick();
    const msg = formatGlazingComparisonWhatsAppMessage({
      widthMm,
      heightMm,
      totalGlassAreaM2: safeAreaM2,
      wilayaName,
    });
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <div className="space-y-3 font-mono text-xs">
      {/* 1. Header Banner */}
      <div
        className={`p-3 rounded-2xl border flex items-center justify-between gap-3 ${
          isLight ? 'bg-slate-50 border-slate-200' : 'bg-black/40 border-white/10'
        }`}
      >
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className={`font-bold text-xs ${isLight ? 'text-slate-900' : 'text-white'}`}>
              Matrice Comparative Thermique & Acoustique
            </h3>
            <p className="text-[10px] text-zinc-500">
              Surface : {safeAreaM2} m² • Wilaya : {wilayaName} • Règles DTR C3-2
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleShareWhatsApp}
          className="px-2.5 py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-bold text-[11px] flex items-center gap-1 cursor-pointer hover:bg-emerald-500/25 active:scale-95 transition-all shrink-0"
          title="Partager le comparatif par WhatsApp au client"
        >
          <MessageCircle className="w-3.5 h-3.5" />
          <span>Partager</span>
        </button>
      </div>

      {/* 2. Side-by-Side Comparison Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {benchmarkCards.map((card) => {
          const isSelected = currentGlassType === card.id;
          const energySavings = calculateGlazingEnergySavingsPercent(card.ug, 5.7);
          const totalGlazingCost = Math.round(safeAreaM2 * card.pricePerM2);

          // Thermal score (lower Ug gives higher score: Ug 1.3 => ~90%, Ug 5.7 => ~10%)
          const thermalScore = Math.max(10, Math.min(100, Math.round((1 - (card.ug - 1.0) / 4.7) * 100)));
          // Acoustic score (Rw 29 => ~30%, Rw 38 => ~95%)
          const acousticScore = Math.max(20, Math.min(100, Math.round(((card.rwDb - 28) / 11) * 100)));
          // Solar blocking score (Sw 0.28 => ~90%, Sw 0.82 => ~25%)
          const solarShieldScore = Math.max(15, Math.min(100, Math.round((1 - card.sw) * 100)));

          return (
            <div
              key={card.id}
              onClick={() => {
                playSwitchSound();
                onSelectGlassType(card.id);
              }}
              className={`p-3 rounded-2xl border transition-all cursor-pointer relative space-y-2.5 ${
                isSelected
                  ? 'ring-2 ring-[#D4AF37] border-transparent bg-[#D4AF37]/5 shadow-md'
                  : isLight
                  ? 'bg-white border-slate-200 hover:border-slate-300'
                  : 'bg-black/30 border-white/10 hover:border-white/20'
              }`}
            >
              {/* Card Header */}
              <div className="flex items-start justify-between gap-1.5">
                <div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className={`text-[9px] px-1.5 py-0.2 rounded-md border font-bold ${card.tagClass}`}>
                      {card.tagFr}
                    </span>
                    {isSelected && (
                      <span className="text-[9px] px-1.5 py-0.2 rounded-md bg-[#D4AF37] text-slate-950 font-bold flex items-center gap-0.5">
                        <Check className="w-2.5 h-2.5" />
                        Sélectionné
                      </span>
                    )}
                  </div>
                  <h4 className={`text-xs font-bold mt-1 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                    {card.titleFr}
                  </h4>
                  <p className="text-[10px] text-zinc-500">{card.subFr}</p>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-xs font-bold text-[#D4AF37] block">
                    {card.pricePerM2.toLocaleString('fr-DZ')} <span className="text-[9px]">DZD/m²</span>
                  </span>
                  <span className="text-[10px] text-zinc-400 block font-sans">
                    Total : {totalGlazingCost.toLocaleString('fr-DZ')} DZD
                  </span>
                </div>
              </div>

              {/* Three Performance Gauges */}
              <div className="space-y-1.5 pt-1 border-t border-black/5 dark:border-white/5 text-[10px]">
                {/* 1. Thermal Insulation (Ug) */}
                <div className="space-y-0.5">
                  <div className="flex items-center justify-between text-zinc-400">
                    <span className="flex items-center gap-1 text-emerald-400 font-bold">
                      <Flame className="w-3 h-3" />
                      <span>Thermique (Ug = {card.ug})</span>
                    </span>
                    <span className="font-bold text-emerald-400">-{energySavings}% pertes</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-black/10 dark:bg-white/10 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-300"
                      style={{ width: `${thermalScore}%` }}
                    />
                  </div>
                </div>

                {/* 2. Acoustic Reduction (Rw) */}
                <div className="space-y-0.5">
                  <div className="flex items-center justify-between text-zinc-400">
                    <span className="flex items-center gap-1 text-cyan-400 font-bold">
                      <Volume2 className="w-3 h-3" />
                      <span>Acoustique (Rw = {card.rwDb} dB)</span>
                    </span>
                    <span className="font-bold text-cyan-400">
                      {card.rwDb >= 38 ? '-85% bruit' : card.rwDb >= 33 ? '-70% bruit' : '-50% bruit'}
                    </span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-black/10 dark:bg-white/10 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-cyan-500 to-blue-400 rounded-full transition-all duration-300"
                      style={{ width: `${acousticScore}%` }}
                    />
                  </div>
                </div>

                {/* 3. Solar Radiation Shielding (Sw) */}
                <div className="space-y-0.5">
                  <div className="flex items-center justify-between text-zinc-400">
                    <span className="flex items-center gap-1 text-amber-400 font-bold">
                      <Sun className="w-3 h-3" />
                      <span>Facteur Solaire (Sw = {card.sw})</span>
                    </span>
                    <span className="font-bold text-amber-400">
                      {card.sw <= 0.35 ? 'Anti-chaleur élevé' : card.sw <= 0.6 ? 'Modéré' : 'Clair standard'}
                    </span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-black/10 dark:bg-white/10 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-amber-500 to-orange-400 rounded-full transition-all duration-300"
                      style={{ width: `${solarShieldScore}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  playSwitchSound();
                  onSelectGlassType(card.id);
                }}
                className={`w-full py-1.5 rounded-xl font-bold text-[11px] flex items-center justify-center gap-1 cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-[#D4AF37] text-slate-950 shadow-xs'
                    : isLight
                    ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    : 'bg-white/5 text-zinc-300 hover:bg-white/10'
                }`}
              >
                {isSelected ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Appliqué à cette Baie</span>
                  </>
                ) : (
                  <span>Choisir ce Vitrage</span>
                )}
              </button>
            </div>
          );
        })}
      </div>

      {/* 3. Bottom Regulatory DTR C3-2 & Thermal Stress Action Strips */}
      <div className="space-y-2">
        {onExportDtrPdf && (
          <div
            className={`p-3 rounded-2xl border flex items-center justify-between gap-2 ${
              isLight ? 'bg-slate-50 border-slate-200' : 'bg-black/30 border-white/5'
            }`}
          >
            <div className="flex items-center gap-2 min-w-0">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <div className="min-w-0">
                <span className={`font-bold block truncate ${isLight ? 'text-slate-800' : 'text-zinc-200'}`}>
                  Certificat de Conformité DTR C3-2
                </span>
                <span className="text-[10px] text-zinc-500 block truncate">
                  Fiche officielle de calcul thermique CNERIB (PDF)
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={onExportDtrPdf}
              disabled={isGeneratingPdf}
              className="px-3 py-2 rounded-xl bg-sky-500/15 border border-sky-500/30 text-sky-400 font-bold text-xs flex items-center gap-1 cursor-pointer hover:bg-sky-500/25 active:scale-95 transition-all shrink-0"
            >
              <FileCheck className="w-3.5 h-3.5" />
              <span>{isGeneratingPdf ? 'Calcul...' : 'Certificat DTR (PDF)'}</span>
            </button>
          </div>
        )}

        {onOpenThermalStressModal && (
          <div
            className={`p-3 rounded-2xl border flex items-center justify-between gap-2 ${
              isLight ? 'bg-amber-50/60 border-amber-200/80' : 'bg-amber-950/20 border-amber-500/20'
            }`}
          >
            <div className="flex items-center gap-2 min-w-0">
              <Flame className="w-4 h-4 text-amber-400 shrink-0" />
              <div className="min-w-0">
                <span className={`font-bold block truncate ${isLight ? 'text-amber-900' : 'text-amber-200'}`}>
                  Audit Choc Thermique DTU 39 P3
                </span>
                <span className="text-[10px] text-amber-600/80 dark:text-amber-400/70 block truncate">
                  Vérification du gradient thermique et risque de casse solaire
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                playTactileClick();
                onOpenThermalStressModal();
              }}
              className="px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1 cursor-pointer active:scale-95 transition-all shrink-0 shadow-xs"
            >
              <Flame className="w-3.5 h-3.5" />
              <span>Simuler Choc Thermique</span>
            </button>
          </div>
        )}

        {onOpenAcousticModal && (
          <div
            className={`p-3 rounded-2xl border flex items-center justify-between gap-2 ${
              isLight ? 'bg-cyan-50/60 border-cyan-200/80' : 'bg-cyan-950/20 border-cyan-500/20'
            }`}
          >
            <div className="flex items-center gap-2 min-w-0">
              <Waves className="w-4 h-4 text-cyan-400 shrink-0" />
              <div className="min-w-0">
                <span className={`font-bold block truncate ${isLight ? 'text-cyan-900' : 'text-cyan-200'}`}>
                  Étude Acoustique & Bruits de Voirie (DTR C3-3)
                </span>
                <span className="text-[10px] text-cyan-600/80 dark:text-cyan-400/70 block truncate">
                  Affaiblissement composite façade, spectre d octave et confort nocturne
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                playTactileClick();
                onOpenAcousticModal();
              }}
              className="px-3 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-1 cursor-pointer active:scale-95 transition-all shrink-0 shadow-xs"
            >
              <Waves className="w-3.5 h-3.5" />
              <span>Simuler Acoustique</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
