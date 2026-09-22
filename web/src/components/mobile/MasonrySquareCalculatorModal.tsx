import React, { useState, useMemo } from 'react';
import {
  X,
  Check,
  AlertTriangle,
  RotateCcw,
  MessageCircle,
  Calculator,
  Compass,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { playTactileClick, playClampSound } from '../../utils/audioFeedback';
import { useConfigStore } from '../../store/configStore';

export interface MasonrySquareResult {
  minWidthMm: number;
  minHeightMm: number;
  theoreticalDiagonalMm: number;
  deltaDiagonalMm: number;
  tiltAngleDegrees: number;
  tiltMmPerMeter: number;
  recommendedClearanceMm: number;
  netFabricationWidthMm: number;
  netFabricationHeightMm: number;
  verdict: 'conforme' | 'modere' | 'critique';
  verdictLabelFr: string;
  recommendationsFr: string[];
}

export interface MasonrySquareCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialWidth?: number;
  initialHeight?: number;
  openingLabel?: string;
  onApplyDimensions: (widthMm: number, heightMm: number, notes?: string) => void;
}

export const MasonrySquareCalculatorModal: React.FC<MasonrySquareCalculatorModalProps> = ({
  isOpen,
  onClose,
  initialWidth = 1200,
  initialHeight = 1400,
  openingLabel = 'Châssis',
  onApplyDimensions,
}) => {
  const { theme, language } = useConfigStore();
  const isLight = theme === 'light';
  const isRtl = language === 'ar';

  // 3-point width measurements (Haut, Milieu, Bas)
  const [widthTop, setWidthTop] = useState(initialWidth);
  const [widthMid, setWidthMid] = useState(initialWidth);
  const [widthBottom, setWidthBottom] = useState(initialWidth);

  // 3-point height measurements (Gauche, Centre, Droite)
  const [heightLeft, setHeightLeft] = useState(initialHeight);
  const [heightCenter, setHeightCenter] = useState(initialHeight);
  const [heightRight, setHeightRight] = useState(initialHeight);

  // Clearance and Diagonals
  const [clearanceMm, setClearanceMm] = useState<number>(10); // Standard 10mm (5mm per side)

  const defaultTheoreticalD = Math.round(
    Math.sqrt(initialWidth * initialWidth + initialHeight * initialHeight)
  );
  const [diag1, setDiag1] = useState(defaultTheoreticalD);
  const [diag2, setDiag2] = useState(defaultTheoreticalD);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Perform Calculations
  const analysis: MasonrySquareResult = useMemo(() => {
    const minW = Math.min(widthTop, widthMid, widthBottom);
    const minH = Math.min(heightLeft, heightCenter, heightRight);

    const theoD = Math.round(Math.sqrt(minW * minW + minH * minH));
    const deltaD = Math.abs(diag1 - diag2);

    // Approximate angular tilt: theta ~ arcsin( |d1^2 - d2^2| / (4 * W * H) )
    const numerator = Math.abs(diag1 * diag1 - diag2 * diag2);
    const denominator = Math.max(1, 4 * minW * minH);
    const sinTheta = Math.min(1, numerator / denominator);
    const tiltRad = Math.asin(sinTheta);
    const tiltDeg = Number(((tiltRad * 180) / Math.PI).toFixed(2));
    const tiltMmPerM = Number((Math.tan(tiltRad) * 1000).toFixed(1));

    const netW = Math.max(100, minW - clearanceMm);
    const netH = Math.max(100, minH - clearanceMm);

    let verdict: 'conforme' | 'modere' | 'critique' = 'conforme';
    let verdictLabelFr = 'Équerrage Conforme DTU 36.5 (Tolérance ≤ 5 mm)';
    const recommendationsFr: string[] = [];

    if (deltaD <= 5) {
      verdict = 'conforme';
      verdictLabelFr = 'Équerrage Conforme (Tolérance ≤ 5 mm)';
      recommendationsFr.push('Calage standard d assise et de rive en polypropylène.');
      recommendationsFr.push('Joint d étanchéité périphérique au mastic silicone de 5 mm.');
    } else if (deltaD <= 15) {
      verdict = 'modere';
      verdictLabelFr = 'Faux-Équerrage Modéré (Écart 6 à 15 mm)';
      recommendationsFr.push('Utiliser des cales biaises imputrescibles pour compenser la pente.');
      recommendationsFr.push('Élargir le fond de joint mousse et mastic extérieur à 10-12 mm.');
      recommendationsFr.push('Vérifier l aplomb au niveau laser avant serrage des chevilles.');
    } else {
      verdict = 'critique';
      verdictLabelFr = 'Faux-Équerrage Sévère (> 15 mm) • Vigilance';
      recommendationsFr.push('Prévoir une cornière d habillage alu extérieure pour masquer le faux-aplomb.');
      recommendationsFr.push('Possibilité de redresser la maçonnerie au mortier avant la pose.');
      recommendationsFr.push('Sous-dimensionner le dormant pour éviter tout blocage d onglet.');
    }

    return {
      minWidthMm: minW,
      minHeightMm: minH,
      theoreticalDiagonalMm: theoD,
      deltaDiagonalMm: deltaD,
      tiltAngleDegrees: tiltDeg,
      tiltMmPerMeter: tiltMmPerM,
      recommendedClearanceMm: clearanceMm,
      netFabricationWidthMm: netW,
      netFabricationHeightMm: netH,
      verdict,
      verdictLabelFr,
      recommendationsFr,
    };
  }, [
    widthTop,
    widthMid,
    widthBottom,
    heightLeft,
    heightCenter,
    heightRight,
    diag1,
    diag2,
    clearanceMm,
  ]);

  if (!isOpen) return null;

  const handleApplyToForm = () => {
    playClampSound();
    const notes = `Relevé maçonnerie : Lmin=${analysis.minWidthMm}, Hmin=${analysis.minHeightMm}, ΔD=${analysis.deltaDiagonalMm}mm (${analysis.verdict === 'conforme' ? 'Équerre' : 'Faux-équerrage'})`;
    onApplyDimensions(analysis.netFabricationWidthMm, analysis.netFabricationHeightMm, notes);
    setToastMessage('Cotes nettes de fabrication appliquées !');
    setTimeout(() => {
      setToastMessage(null);
      onClose();
    }, 500);
  };

  const handleResetToTheoretical = () => {
    playTactileClick();
    setDiag1(analysis.theoreticalDiagonalMm);
    setDiag2(analysis.theoreticalDiagonalMm);
  };

  const handleShareWhatsApp = () => {
    playTactileClick();
    let msg = `*FICHE RELEVÉ MAÇONNERIE & ÉQUERRAGE • BAITI ATELIER*\n`;
    msg += `Baie : *${openingLabel}*\n`;
    msg += `Dimensions brutes minimales : *${analysis.minWidthMm} × ${analysis.minHeightMm} mm*\n`;
    msg += `• Largeurs (Haut / Milieu / Bas) : ${widthTop} / ${widthMid} / ${widthBottom} mm\n`;
    msg += `• Hauteurs (Gauche / Centre / Droite) : ${heightLeft} / ${heightCenter} / ${heightRight} mm\n\n`;
    msg += `*CONTRÔLE DES DIAGONALES (FAUX-ÉQUERRAGE) :*\n`;
    msg += `• Diagonale D1 : ${diag1} mm\n`;
    msg += `• Diagonale D2 : ${diag2} mm\n`;
    msg += `• Écart de diagonale (ΔD) : *${analysis.deltaDiagonalMm} mm* (Théorique : ${analysis.theoreticalDiagonalMm} mm)\n`;
    msg += `• Déviation angulaire : *${analysis.tiltMmPerMeter} mm/m* (${analysis.tiltAngleDegrees}°)\n`;
    msg += `• Verdict : *${analysis.verdictLabelFr}*\n\n`;
    msg += `*COTES NETTES DE FABRICATION PROPOSÉES :*\n`;
    msg += `• Jeu périphérique total déduit : ${analysis.recommendedClearanceMm} mm\n`;
    msg += `• Largeur fabrication : *${analysis.netFabricationWidthMm} mm*\n`;
    msg += `• Hauteur fabrication : *${analysis.netFabricationHeightMm} mm*\n\n`;
    msg += `Baiti Atelier Algérie • Mesures & Pose selon DTU 36.5`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-xs p-0 sm:p-4"
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      <div
        className={`w-full max-w-lg rounded-t-3xl sm:rounded-3xl border shadow-2xl flex flex-col max-h-[92vh] sm:max-h-[88vh] overflow-hidden animate-in fade-in slide-in-from-bottom duration-200 ${
          isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-[#0B0F19] border-white/10 text-white'
        }`}
      >
        {/* HEADER */}
        <div className="p-4 border-b border-black/5 dark:border-white/10 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
              <Compass className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm font-bold truncate">
                Calculateur Faux-Équerrage Maçonnerie
              </h2>
              <p className="text-[11px] text-zinc-500 truncate font-mono">
                {openingLabel} • Contrôle des diagonales & jeu de pose DTU 36.5
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className={`p-2 rounded-xl border min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer transition-all ${
              isLight
                ? 'border-slate-200 text-slate-500 hover:bg-slate-100'
                : 'border-white/10 text-zinc-400 hover:bg-white/10'
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* VERDICT STRIP */}
        <div
          className={`px-4 py-2.5 border-b font-mono text-xs flex items-center justify-between gap-2 shrink-0 ${
            analysis.verdict === 'critique'
              ? isLight
                ? 'bg-rose-50 border-rose-200 text-rose-900'
                : 'bg-rose-500/15 border-rose-500/30 text-rose-300'
              : analysis.verdict === 'modere'
              ? isLight
                ? 'bg-amber-50 border-amber-200 text-amber-900'
                : 'bg-amber-500/15 border-amber-500/30 text-amber-300'
              : isLight
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
          }`}
        >
          <div className="flex items-center gap-1.5 font-bold min-w-0">
            {analysis.verdict === 'conforme' ? (
              <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 shrink-0" />
            )}
            <span className="truncate">{analysis.verdictLabelFr}</span>
          </div>

          <span className="font-bold text-xs shrink-0">ΔD : {analysis.deltaDiagonalMm} mm</span>
        </div>

        {/* SCROLLABLE BODY */}
        <div className="p-4 space-y-4 overflow-y-auto flex-1 font-mono text-xs">
          {/* SCHEMATIC OPENING WIREFRAME */}
          <div
            className={`p-4 rounded-3xl border relative flex flex-col items-center justify-center overflow-hidden ${
              isLight ? 'bg-slate-50 border-slate-200' : 'bg-black/30 border-white/5'
            }`}
          >
            {/* SVG Schematic */}
            <svg viewBox="0 0 240 160" className="w-full h-36">
              {/* Outer Masonry Opening Box */}
              <rect
                x="40"
                y="20"
                width="160"
                height="120"
                fill="none"
                stroke={isLight ? '#CBD5E1' : '#334155'}
                strokeWidth="4"
                strokeDasharray="4 2"
              />

              {/* Diagonal 1 (Bottom Left to Top Right) */}
              <line
                x1="40"
                y1="140"
                x2="200"
                y2="20"
                stroke={analysis.verdict === 'conforme' ? '#10B981' : '#F59E0B'}
                strokeWidth="1.8"
              />
              <text
                x="130"
                y="75"
                fill={analysis.verdict === 'conforme' ? '#10B981' : '#F59E0B'}
                fontSize="9"
                fontWeight="bold"
                textAnchor="middle"
              >
                D1: {diag1} mm
              </text>

              {/* Diagonal 2 (Top Left to Bottom Right) */}
              <line
                x1="40"
                y1="20"
                x2="200"
                y2="140"
                stroke={analysis.verdict === 'conforme' ? '#10B981' : '#F59E0B'}
                strokeWidth="1.8"
              />
              <text
                x="130"
                y="95"
                fill={analysis.verdict === 'conforme' ? '#10B981' : '#F59E0B'}
                fontSize="9"
                fontWeight="bold"
                textAnchor="middle"
              >
                D2: {diag2} mm
              </text>

              {/* Corner 90 deg marker */}
              <path
                d="M 40 32 L 52 32 L 52 20"
                fill="none"
                stroke={analysis.verdict === 'critique' ? '#F43F5E' : '#38BDF8'}
                strokeWidth="1.5"
              />
            </svg>

            {/* Quick Helper Button to auto-set diagonals to theoretical */}
            <button
              type="button"
              onClick={handleResetToTheoretical}
              className="mt-1 text-[10px] px-2.5 py-1 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-zinc-400 hover:text-white flex items-center gap-1 cursor-pointer transition-all"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Calculer D théorique ({analysis.theoreticalDiagonalMm} mm)</span>
            </button>
          </div>

          {/* INPUT SECTION 1: WIDTHS (L1, L2, L3) */}
          <div
            className={`p-3 rounded-2xl border space-y-2 ${
              isLight ? 'bg-slate-50 border-slate-200' : 'bg-black/30 border-white/5'
            }`}
          >
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-bold flex items-center gap-1.5 text-sky-400">
                Largeurs Relevées (mm)
              </span>
              <span className="text-zinc-500 font-bold">Lmin : {analysis.minWidthMm} mm</span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-[9px] text-zinc-500 block">L1 (Haut)</label>
                <input
                  type="number"
                  min={100}
                  step={5}
                  value={widthTop}
                  onChange={(e) => setWidthTop(Number(e.target.value) || 0)}
                  className={`w-full p-2 rounded-xl border text-xs font-bold text-center ${
                    isLight ? 'bg-white border-slate-300' : 'bg-black/40 border-white/10 text-white'
                  }`}
                />
              </div>

              <div>
                <label className="text-[9px] text-zinc-500 block">L2 (Milieu)</label>
                <input
                  type="number"
                  min={100}
                  step={5}
                  value={widthMid}
                  onChange={(e) => setWidthMid(Number(e.target.value) || 0)}
                  className={`w-full p-2 rounded-xl border text-xs font-bold text-center ${
                    isLight ? 'bg-white border-slate-300' : 'bg-black/40 border-white/10 text-white'
                  }`}
                />
              </div>

              <div>
                <label className="text-[9px] text-zinc-500 block">L3 (Bas)</label>
                <input
                  type="number"
                  min={100}
                  step={5}
                  value={widthBottom}
                  onChange={(e) => setWidthBottom(Number(e.target.value) || 0)}
                  className={`w-full p-2 rounded-xl border text-xs font-bold text-center ${
                    isLight ? 'bg-white border-slate-300' : 'bg-black/40 border-white/10 text-white'
                  }`}
                />
              </div>
            </div>
          </div>

          {/* INPUT SECTION 2: HEIGHTS (H1, H2, H3) */}
          <div
            className={`p-3 rounded-2xl border space-y-2 ${
              isLight ? 'bg-slate-50 border-slate-200' : 'bg-black/30 border-white/5'
            }`}
          >
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-bold flex items-center gap-1.5 text-cyan-400">
                Hauteurs Relevées (mm)
              </span>
              <span className="text-zinc-500 font-bold">Hmin : {analysis.minHeightMm} mm</span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-[9px] text-zinc-500 block">H1 (Gauche)</label>
                <input
                  type="number"
                  min={100}
                  step={5}
                  value={heightLeft}
                  onChange={(e) => setHeightLeft(Number(e.target.value) || 0)}
                  className={`w-full p-2 rounded-xl border text-xs font-bold text-center ${
                    isLight ? 'bg-white border-slate-300' : 'bg-black/40 border-white/10 text-white'
                  }`}
                />
              </div>

              <div>
                <label className="text-[9px] text-zinc-500 block">H2 (Centre)</label>
                <input
                  type="number"
                  min={100}
                  step={5}
                  value={heightCenter}
                  onChange={(e) => setHeightCenter(Number(e.target.value) || 0)}
                  className={`w-full p-2 rounded-xl border text-xs font-bold text-center ${
                    isLight ? 'bg-white border-slate-300' : 'bg-black/40 border-white/10 text-white'
                  }`}
                />
              </div>

              <div>
                <label className="text-[9px] text-zinc-500 block">H3 (Droite)</label>
                <input
                  type="number"
                  min={100}
                  step={5}
                  value={heightRight}
                  onChange={(e) => setHeightRight(Number(e.target.value) || 0)}
                  className={`w-full p-2 rounded-xl border text-xs font-bold text-center ${
                    isLight ? 'bg-white border-slate-300' : 'bg-black/40 border-white/10 text-white'
                  }`}
                />
              </div>
            </div>
          </div>

          {/* INPUT SECTION 3: DIAGONALS (D1 & D2) */}
          <div
            className={`p-3 rounded-2xl border space-y-2 ${
              isLight ? 'bg-slate-50 border-slate-200' : 'bg-black/30 border-white/5'
            }`}
          >
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-bold flex items-center gap-1.5 text-amber-400">
                Mesure des Diagonales Croisées
              </span>
              <span className="text-[10px] text-zinc-500">
                Écart ΔD : <span className="font-bold text-amber-400">{analysis.deltaDiagonalMm} mm</span>
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[9px] text-zinc-500 block">Diagonale D1 (mm)</label>
                <input
                  type="number"
                  min={100}
                  step={1}
                  value={diag1}
                  onChange={(e) => setDiag1(Number(e.target.value) || 0)}
                  className={`w-full p-2 rounded-xl border text-xs font-bold text-center ${
                    isLight ? 'bg-white border-slate-300' : 'bg-black/40 border-white/10 text-white'
                  }`}
                />
              </div>

              <div>
                <label className="text-[9px] text-zinc-500 block">Diagonale D2 (mm)</label>
                <input
                  type="number"
                  min={100}
                  step={1}
                  value={diag2}
                  onChange={(e) => setDiag2(Number(e.target.value) || 0)}
                  className={`w-full p-2 rounded-xl border text-xs font-bold text-center ${
                    isLight ? 'bg-white border-slate-300' : 'bg-black/40 border-white/10 text-white'
                  }`}
                />
              </div>
            </div>

            <div className="text-[10px] text-zinc-500 flex items-center justify-between pt-0.5">
              <span>Décalage angulaire estimé :</span>
              <span className="font-bold text-amber-400">
                {analysis.tiltMmPerMeter} mm/m ({analysis.tiltAngleDegrees}°)
              </span>
            </div>
          </div>

          {/* NET FABRICATION DIMENSIONS & CLEARANCE JEU DE POSE */}
          <div
            className={`p-3.5 rounded-2xl border space-y-2.5 ${
              isLight ? 'bg-emerald-50/80 border-emerald-300' : 'bg-emerald-500/10 border-emerald-500/30'
            }`}
          >
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                <Calculator className="w-4 h-4" />
                Cotes Nettes de Fabrication Atelier
              </span>
              <div className="flex items-center gap-1">
                <span className="text-[10px] text-zinc-500">Jeu déduit :</span>
                <select
                  value={clearanceMm}
                  onChange={(e) => setClearanceMm(Number(e.target.value))}
                  className="p-1 rounded-lg border text-[10px] font-bold cursor-pointer bg-black/10 dark:bg-white/10"
                >
                  <option value={5}>-5 mm</option>
                  <option value={10}>-10 mm (Standard)</option>
                  <option value={15}>-15 mm (Faux-aplomb)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-center pt-1">
              <div
                className={`p-2.5 rounded-xl border ${
                  isLight ? 'bg-white border-emerald-200' : 'bg-black/40 border-emerald-500/20'
                }`}
              >
                <span className="text-[10px] text-zinc-400 block font-sans">Largeur Dormant</span>
                <span className="text-base font-black text-emerald-400">
                  {analysis.netFabricationWidthMm} <span className="text-[10px]">mm</span>
                </span>
                <span className="text-[9px] text-zinc-500 block">({analysis.minWidthMm} - {clearanceMm})</span>
              </div>

              <div
                className={`p-2.5 rounded-xl border ${
                  isLight ? 'bg-white border-emerald-200' : 'bg-black/40 border-emerald-500/20'
                }`}
              >
                <span className="text-[10px] text-zinc-400 block font-sans">Hauteur Dormant</span>
                <span className="text-base font-black text-emerald-400">
                  {analysis.netFabricationHeightMm} <span className="text-[10px]">mm</span>
                </span>
                <span className="text-[9px] text-zinc-500 block">({analysis.minHeightMm} - {clearanceMm})</span>
              </div>
            </div>

            {/* Recommendations */}
            <div className="text-[10px] text-zinc-500 space-y-1 pt-1 border-t border-black/10 dark:border-white/10">
              {analysis.recommendationsFr.map((rec) => (
                <div key={rec} className="flex items-start gap-1">
                  <span className="text-emerald-400 font-bold">•</span>
                  <span>{rec}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* TOAST MESSAGE */}
        {toastMessage && (
          <div className="px-4 py-2 bg-emerald-500 text-slate-950 text-xs font-bold text-center flex items-center justify-center gap-1.5">
            <Check className="w-3.5 h-3.5" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* FOOTER ACTIONS */}
        <div className="p-3 border-t border-black/5 dark:border-white/10 flex items-center justify-between gap-2 bg-black/5 dark:bg-white/5 shrink-0 flex-wrap">
          <button
            type="button"
            onClick={handleShareWhatsApp}
            className="flex-1 py-2.5 px-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer min-h-[44px] hover:bg-emerald-500/25 active:scale-98 transition-all"
            title="Envoyer la synthèse de relevé par WhatsApp"
          >
            <MessageCircle className="w-4 h-4 shrink-0" />
            <span>WhatsApp</span>
          </button>

          <button
            type="button"
            onClick={handleApplyToForm}
            className="flex-1 py-2.5 px-3 rounded-2xl bg-gradient-to-r from-[#C5A880] to-[#D4AF37] text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer min-h-[44px] shadow-md hover:brightness-110 active:scale-98 transition-all"
            title="Transférer les cotes nettes au formulaire du châssis"
          >
            <ArrowRight className="w-4 h-4 shrink-0" />
            <span>Appliquer Cotes</span>
          </button>
        </div>
      </div>
    </div>
  );
};
