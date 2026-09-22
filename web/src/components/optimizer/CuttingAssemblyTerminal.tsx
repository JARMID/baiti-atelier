import React, { useState } from 'react';
import type { WorkshopBOM, CutPieceDetail } from '../../types/cad';
import type { WindowConfig } from '../../types/window';
import { useConfigStore } from '../../store/configStore';
import {
  ScanLine,
  CheckCircle2,
  Clock,
  Wrench,
  Layers,
  ArrowRight,
  X,
} from 'lucide-react';
import { playTactileClick, playSwitchSound, playClampSound } from '../../utils/audioFeedback';

interface CuttingAssemblyTerminalProps {
  isOpen: boolean;
  onClose: () => void;
  bom: WorkshopBOM;
  config: WindowConfig;
  jobName?: string;
}

export type PieceProgressState = 'pending' | 'cut' | 'machined' | 'assembled';

export const CuttingAssemblyTerminal: React.FC<CuttingAssemblyTerminalProps> = ({
  isOpen,
  onClose,
  bom,
  config,
  jobName = 'Chantier Villa Résidentielle',
}) => {
  const { theme, language } = useConfigStore();
  const isLight = theme === 'light';
  const isRtl = language === 'ar';
  const [scannedQuery, setScannedQuery] = useState('');
  const [selectedPieceId, setSelectedPieceId] = useState<string | null>(
    bom.cuts.length > 0 ? bom.cuts[0].id : null
  );

  // Track progress state per piece ID
  const [pieceStates, setPieceStates] = useState<Record<string, PieceProgressState>>(() => {
    const initial: Record<string, PieceProgressState> = {};
    bom.cuts.forEach((c, idx) => {
      initial[c.id] = idx === 0 ? 'cut' : 'pending';
    });
    return initial;
  });

  if (!isOpen) return null;

  const totalPieces = bom.cuts.length;
  const assembledCount = Object.values(pieceStates).filter((s) => s === 'assembled').length;
  const machinedCount = Object.values(pieceStates).filter((s) => s === 'machined').length;
  const cutCount = Object.values(pieceStates).filter((s) => s === 'cut').length;
  const completedProgress = Math.round(
    ((assembledCount * 1.0 + machinedCount * 0.7 + cutCount * 0.4) / (totalPieces || 1)) * 100
  );

  // Active selected piece
  const activePiece = bom.cuts.find((c) => c.id === selectedPieceId) || bom.cuts[0];

  // Handle barcode scanner submission (scanner acts as keyboard sending Enter)
  const handleBarcodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = scannedQuery.trim().toLowerCase();
    if (!query) return;

    // Search by index number (#1, #2...) or by cut ID or piece name
    const found = bom.cuts.find((c, i) => {
      const indexStr = (i + 1).toString();
      return (
        c.id.toLowerCase() === query ||
        `#${indexStr}` === query ||
        indexStr === query ||
        c.label.toLowerCase().includes(query)
      );
    });

    if (found) {
      playTactileClick();
      setSelectedPieceId(found.id);
      // Automatically advance status to next step on scan
      advancePieceState(found.id);
      setScannedQuery('');
    }
  };

  const advancePieceState = (pieceId: string) => {
    playClampSound();
    setPieceStates((prev) => {
      const current = prev[pieceId] || 'pending';
      let next: PieceProgressState = 'pending';
      if (current === 'pending') next = 'cut';
      else if (current === 'cut') next = 'machined';
      else if (current === 'machined') next = 'assembled';
      else next = 'assembled';
      return { ...prev, [pieceId]: next };
    });
  };

  const setExplicitState = (pieceId: string, state: PieceProgressState) => {
    playSwitchSound();
    setPieceStates((prev) => ({ ...prev, [pieceId]: state }));
  };

  // Hardware accessories required for the selected piece
  const getRequiredHardwareForPiece = (piece: CutPieceDetail) => {
    const items: Array<{ name: string; qty: string; note: string }> = [];
    if (piece.role === 'frame') {
      items.push({
        name: "Équerre d'assemblage 14mm",
        qty: '2 pièces',
        note: 'Sertissage hydraulique ou tirage vis pointeau',
      });
      items.push({
        name: "Joint d'étanchéité dormant EPDM",
        qty: `${(piece.lengthMm / 1000).toFixed(2)} m`,
        note: 'Clipsage dans la gorge extérieure',
      });
      if (piece.id.includes('bas')) {
        items.push({
          name: "Bouchons pare-tempête d'évacuation d'eau",
          qty: '2 pièces',
          note: "Usinage oblongs 30x5mm en sous-face d'appui",
        });
      }
    } else if (piece.role === 'sash') {
      items.push({
        name: 'Équerre de tirage ouvrant renforcée',
        qty: '2 pièces',
        note: 'Équerre à bouton ou vis inox DIN 7982',
      });
      items.push({
        name: 'Joint de vitrage intérieur & extérieur',
        qty: `${(piece.lengthMm / 1000).toFixed(2)} m`,
        note: 'Joint portefeuille néoprène noir',
      });
      if (config.openingType.includes('sliding') || piece.id.includes('ouvrant-b')) {
        items.push({
          name: 'Galet tandem à aiguilles inox',
          qty: '1 paire',
          note: 'Réglage hauteur vis micrométrique en traverse basse',
        });
      }
      if (piece.id.includes('d') || piece.id.includes('g')) {
        items.push({
          name: 'Crémone multipoint & gâche',
          qty: '1 kit',
          note: 'Verrouillage haut/bas avec poignée de tirage',
        });
      }
    } else if (piece.role === 'mullion' || piece.role === 'transom') {
      items.push({
        name: 'Embouts de meneau / T-connector',
        qty: '2 pièces',
        note: 'Fixation mécanique sur dormant avec cales EPDM',
      });
    }
    return items;
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/85 backdrop-blur-lg"
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      <div
        className={`border rounded-3xl w-full max-w-6xl max-h-[94vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in duration-200 font-sans transition-colors ${
          isLight
            ? 'bg-white border-slate-200 text-slate-900'
            : 'bg-[#0B0E14] border-white/15 text-white'
        }`}
      >
        {/* Header HUD Bar */}
        <div
          className={`p-4 sm:p-5 border-b flex flex-wrap items-center justify-between gap-3 transition-colors ${
            isLight ? 'bg-slate-100/90 border-slate-200' : 'bg-[#0F141F] border-white/10'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-500">
              <ScanLine className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className={`text-base sm:text-lg font-bold font-mono tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  {language === 'ar'
                    ? 'محطة ورشة التجميع والتركيب'
                    : language === 'en'
                    ? 'WORKSHOP ASSEMBLY TERMINAL'
                    : "TERMINAL ATELIER • POSTE D'ASSEMBLAGE"}
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 font-semibold">
                  {language === 'ar'
                    ? 'قارئ الرمز الشريطي نشط'
                    : language === 'en'
                    ? 'Barcode Scanner Active'
                    : 'Lecteur Code-Barres Actif'}
                </span>
              </div>
              <p className={`text-xs ${isLight ? 'text-slate-600' : 'text-zinc-400'}`}>
                {jobName} • {config.width} × {config.height} mm • {totalPieces}{' '}
                {language === 'ar' ? 'قطعة مقصوصة' : language === 'en' ? 'cut profiles' : 'profilés débités'}
              </p>
            </div>
          </div>

          {/* Progress Overview Pill */}
          <div className="flex items-center gap-4">
            <div className="hidden md:flex flex-col items-end text-xs font-mono">
              <div className="flex items-center gap-2">
                <span className={isLight ? 'text-slate-500' : 'text-zinc-400'}>
                  {language === 'ar' ? 'نسبة الإنجاز الإجمالية :' : language === 'en' ? 'Overall progress :' : 'Progression globale :'}
                </span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">{completedProgress}%</span>
              </div>
              <div className={`w-40 h-2 rounded-full overflow-hidden mt-1 ${isLight ? 'bg-slate-200' : 'bg-white/10'}`}>
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-emerald-400 transition-all duration-300"
                  style={{ width: `${completedProgress}%` }}
                />
              </div>
            </div>

            <button
              onClick={() => {
                playTactileClick();
                onClose();
              }}
              className={`p-2 rounded-xl transition-colors cursor-pointer btn-press ${
                isLight
                  ? 'bg-slate-200/70 hover:bg-slate-300 text-slate-700 border border-slate-300'
                  : 'text-zinc-400 hover:text-white bg-white/5 border border-white/10'
              }`}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Barcode Scanner Input Bar */}
        <div
          className={`p-3 sm:px-6 border-b flex flex-wrap items-center justify-between gap-3 transition-colors ${
            isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#07090E] border-white/10'
          }`}
        >
          <form onSubmit={handleBarcodeSubmit} className="flex items-center gap-2 flex-1 max-w-xl">
            <div className="relative flex-1">
              <ScanLine className={`w-4 h-4 absolute top-1/2 -translate-y-1/2 ${isRtl ? 'right-3' : 'left-3'} text-amber-500`} />
              <input
                type="text"
                value={scannedQuery}
                onChange={(e) => setScannedQuery(e.target.value)}
                placeholder={
                  language === 'ar'
                    ? 'امسح الرمز الشريطي للقطعة أو أدخل رقمها (#1, #4)...'
                    : language === 'en'
                    ? 'Scan barcode label or enter piece # (e.g. #1, #4)...'
                    : 'Scanner le code-barres étiquette ou taper le # de pièce (ex: #1, #4)...'
                }
                className={`w-full rounded-xl ${isRtl ? 'pr-9 pl-4' : 'pl-9 pr-4'} py-2 text-xs font-mono focus:outline-none transition-colors ${
                  isLight
                    ? 'bg-white border border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-amber-500'
                    : 'bg-[#121824] border border-white/15 text-white placeholder:text-zinc-500 focus:border-amber-400'
                }`}
                autoFocus
              />
            </div>
            <button
              type="submit"
              className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs font-mono transition-colors cursor-pointer btn-press hover-lift"
            >
              {language === 'ar' ? 'تحديد' : language === 'en' ? 'Locate' : 'Localiser'}
            </button>
          </form>

          {/* Quick status counters */}
          <div className="flex items-center gap-2 text-[11px] font-mono">
            <span
              className={`px-2 py-1 rounded-lg border ${
                isLight ? 'bg-slate-200 text-slate-700 border-slate-300' : 'bg-zinc-800 text-zinc-400 border-white/5'
              }`}
            >
              {language === 'ar' ? 'في الانتظار:' : language === 'en' ? 'Pending:' : 'En attente:'}{' '}
              {totalPieces - cutCount - machinedCount - assembledCount}
            </span>
            <span className="px-2 py-1 rounded-lg bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/20">
              {language === 'ar' ? 'مقطوع:' : language === 'en' ? 'Cut:' : 'Débité:'} {cutCount}
            </span>
            <span className="px-2 py-1 rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/20">
              {language === 'ar' ? 'مفرّز:' : language === 'en' ? 'Machined:' : 'Usiné:'} {machinedCount}
            </span>
            <span className="px-2 py-1 rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              {language === 'ar' ? 'مركّب:' : language === 'en' ? 'Assembled:' : 'Monté:'} {assembledCount}
            </span>
          </div>
        </div>

        {/* Main Split Layout: Left Piece List (5 cols), Right Assembly Locator (7 cols) */}
        <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-12">
          {/* Left Column: List of Cut Pieces */}
          <div
            className={`lg:col-span-5 border-r overflow-y-auto p-4 flex flex-col gap-2 max-h-[70vh] ${
              isLight ? 'border-slate-200 bg-slate-50/50' : 'border-white/10 bg-transparent'
            }`}
          >
            <span className={`text-[10px] font-mono uppercase tracking-wider block mb-2 ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
              {language === 'ar'
                ? `قطع الشاسيه (${totalPieces} عنصر) :`
                : language === 'en'
                ? `Frame Profiles (${totalPieces} items) :`
                : `Profilés du Châssis (${totalPieces} éléments) :`}
            </span>

            {bom.cuts.map((cut, idx) => {
              const isSelected = cut.id === activePiece?.id;
              const state = pieceStates[cut.id] || 'pending';

              return (
                <div
                  key={cut.id}
                  onClick={() => {
                    playTactileClick();
                    setSelectedPieceId(cut.id);
                  }}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-2 btn-press ${
                    isSelected
                      ? isLight
                        ? 'bg-amber-500/15 border-amber-500/60 shadow-sm ring-1 ring-amber-500/30'
                        : 'bg-amber-500/15 border-amber-500/50 shadow-md'
                      : isLight
                      ? 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
                      : 'bg-[#101520] border-white/5 hover:border-white/15'
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                          isLight ? 'bg-slate-200 text-slate-800' : 'bg-white/10 text-white'
                        }`}
                      >
                        #{idx + 1}
                      </span>
                      <span className={`text-xs font-bold truncate ${isLight ? 'text-slate-900' : 'text-white'}`}>
                        {cut.label}
                      </span>
                    </div>

                    <div className={`flex items-center gap-2 text-[10px] font-mono ${isLight ? 'text-slate-600' : 'text-zinc-400'}`}>
                      <span className="text-amber-600 dark:text-amber-400 font-bold">{cut.lengthMm} mm</span>
                      <span>•</span>
                      <span>
                        {language === 'ar' ? 'الزوايا:' : 'Angles:'} {cut.cutLeftAngle}° / {cut.cutRightAngle}°
                      </span>
                      <span>•</span>
                      <span className={`capitalize ${isLight ? 'text-slate-700' : 'text-zinc-300'}`}>{cut.role}</span>
                    </div>
                  </div>

                  {/* Status Indicator Chip */}
                  <div className="flex items-center gap-1.5">
                    {state === 'assembled' && (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 border border-emerald-500/30 text-[10px] font-mono font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                        {language === 'ar' ? 'مركب' : language === 'en' ? 'Mounted' : 'Monté'}
                      </span>
                    )}
                    {state === 'machined' && (
                      <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-300 border border-amber-500/30 text-[10px] font-mono font-bold flex items-center gap-1">
                        <Wrench className="w-3 h-3 text-amber-500" />
                        {language === 'ar' ? 'مفرز' : language === 'en' ? 'Machined' : 'Usiné'}
                      </span>
                    )}
                    {state === 'cut' && (
                      <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-600 dark:text-blue-300 border border-blue-500/30 text-[10px] font-mono font-bold flex items-center gap-1">
                        <Layers className="w-3 h-3 text-blue-500" />
                        {language === 'ar' ? 'مقطوع' : language === 'en' ? 'Cut' : 'Débité'}
                      </span>
                    )}
                    {state === 'pending' && (
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-mono flex items-center gap-1 border ${
                          isLight
                            ? 'bg-slate-200 text-slate-600 border-slate-300'
                            : 'bg-zinc-800 text-zinc-400 border-white/5'
                        }`}
                      >
                        <Clock className="w-3 h-3 text-zinc-500" />
                        {language === 'ar' ? 'انتظار' : language === 'en' ? 'Pending' : 'Attente'}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Column: Active Piece Assembly Locator & Instructions */}
          {activePiece && (
            <div
              className={`lg:col-span-7 p-5 overflow-y-auto flex flex-col gap-4 max-h-[70vh] ${
                isLight ? 'bg-white' : 'bg-[#07090E]'
              }`}
            >
              {/* Selected Piece Header */}
              <div
                className={`p-4 rounded-2xl border flex flex-wrap items-center justify-between gap-3 ${
                  isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#121824] border-white/10'
                }`}
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-amber-500 text-black">
                      {language === 'ar' ? 'القطعة المحددة' : language === 'en' ? 'SELECTED PIECE' : 'PIÈCE SÉLECTIONNÉE'}
                    </span>
                    <span className={`text-sm font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                      {activePiece.label}
                    </span>
                  </div>
                  <p className={`text-xs font-mono ${isLight ? 'text-slate-600' : 'text-zinc-400'}`}>
                    {language === 'ar' ? 'الطول:' : 'Longueur:'}{' '}
                    <strong className={`text-sm ${isLight ? 'text-slate-900' : 'text-white'}`}>
                      {activePiece.lengthMm} mm
                    </strong>{' '}
                    • {language === 'ar' ? 'زوايا القطع:' : 'Angles de coupe:'}{' '}
                    <strong className="text-amber-500">
                      {activePiece.cutLeftAngle}° / {activePiece.cutRightAngle}°
                    </strong>
                  </p>
                </div>

                {/* State Advance Button */}
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => advancePieceState(activePiece.id)}
                    className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs font-mono flex items-center gap-1.5 transition-all cursor-pointer shadow-md btn-press hover-lift"
                  >
                    <span>{language === 'ar' ? 'المرحلة التالية' : language === 'en' ? 'Next Stage' : 'Étape Suivante'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Status Stepper Controls */}
              <div className="grid grid-cols-4 gap-2 text-center text-xs font-mono">
                {[
                  {
                    id: 'pending',
                    label: language === 'ar' ? '1. في الانتظار' : language === 'en' ? '1. Pending' : '1. En attente',
                  },
                  {
                    id: 'cut',
                    label: language === 'ar' ? '2. مقطوع' : language === 'en' ? '2. Cut' : '2. Débité',
                  },
                  {
                    id: 'machined',
                    label: language === 'ar' ? '3. مفرز' : language === 'en' ? '3. Machined' : '3. Usiné',
                  },
                  {
                    id: 'assembled',
                    label: language === 'ar' ? '4. مركب وسرتي' : language === 'en' ? '4. Assembled' : '4. Serti & Monté',
                  },
                ].map((step) => {
                  const isActive = (pieceStates[activePiece.id] || 'pending') === step.id;
                  return (
                    <button
                      key={step.id}
                      onClick={() => setExplicitState(activePiece.id, step.id as PieceProgressState)}
                      className={`p-2 rounded-xl border transition-all cursor-pointer btn-press ${
                        isActive
                          ? isLight
                            ? 'bg-amber-500/20 border-amber-500 font-bold text-slate-900 shadow-xs'
                            : 'bg-white/10 border-amber-400 font-bold text-white shadow-sm'
                          : isLight
                          ? 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200'
                          : 'bg-white/5 border-white/5 text-zinc-400 hover:text-white'
                      }`}
                    >
                      {step.label}
                    </button>
                  );
                })}
              </div>

              {/* Visual 2D SVG Blueprint Locator */}
              <div
                className={`p-4 rounded-2xl border flex flex-col items-center justify-center relative min-h-[220px] transition-colors ${
                  isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#0B0D14] border-white/10'
                }`}
              >
                <span className={`text-[10px] font-mono absolute top-3 ${isRtl ? 'right-4' : 'left-4'} ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
                  {language === 'ar'
                    ? 'الموقع على الشاسيه (تحديد بصري) :'
                    : language === 'en'
                    ? 'Location on Frame (Visual Blueprint) :'
                    : 'Emplacement sur Châssis (Repérage Visuel) :'}
                </span>

                <svg width="340" height="180" viewBox="0 0 340 180" className="select-none mt-4">
                  {/* Outer Frame */}
                  <rect
                    x="20"
                    y="20"
                    width="300"
                    height="140"
                    fill={isLight ? '#E2E8F0' : '#151C28'}
                    stroke={activePiece.role === 'frame' ? '#D4AF37' : (isLight ? '#94A3B8' : '#334155')}
                    strokeWidth={activePiece.role === 'frame' ? '4' : '2'}
                    rx="4"
                  />

                  {/* Vertical division if 2 panels */}
                  <line
                    x1="170"
                    y1="20"
                    x2="170"
                    y2="160"
                    stroke={activePiece.role === 'mullion' ? '#D4AF37' : (isLight ? '#94A3B8' : '#334155')}
                    strokeWidth={activePiece.role === 'mullion' ? '4' : '2'}
                  />

                  {/* Highlight specific active profile side */}
                  {activePiece.id.includes('dormant-h') && (
                    <line x1="20" y1="20" x2="320" y2="20" stroke="#10B981" strokeWidth="6" strokeLinecap="round" />
                  )}
                  {activePiece.id.includes('dormant-b') && (
                    <line x1="20" y1="160" x2="320" y2="160" stroke="#10B981" strokeWidth="6" strokeLinecap="round" />
                  )}
                  {activePiece.id.includes('dormant-g') && (
                    <line x1="20" y1="20" x2="20" y2="160" stroke="#10B981" strokeWidth="6" strokeLinecap="round" />
                  )}
                  {activePiece.id.includes('dormant-d') && (
                    <line x1="320" y1="20" x2="320" y2="160" stroke="#10B981" strokeWidth="6" strokeLinecap="round" />
                  )}

                  {/* Left sash box */}
                  <rect
                    x="28"
                    y="28"
                    width="134"
                    height="124"
                    fill={isLight ? 'rgba(59, 130, 246, 0.06)' : 'rgba(59, 130, 246, 0.08)'}
                    stroke={activePiece.role === 'sash' ? '#D4AF37' : (isLight ? '#CBD5E1' : 'rgba(255, 255, 255, 0.15)')}
                    strokeWidth={activePiece.role === 'sash' ? '3' : '1'}
                    rx="2"
                  />

                  {/* Right sash box */}
                  <rect
                    x="178"
                    y="28"
                    width="134"
                    height="124"
                    fill={isLight ? 'rgba(59, 130, 246, 0.06)' : 'rgba(59, 130, 246, 0.08)'}
                    stroke={activePiece.role === 'sash' ? '#D4AF37' : (isLight ? '#CBD5E1' : 'rgba(255, 255, 255, 0.15)')}
                    strokeWidth={activePiece.role === 'sash' ? '3' : '1'}
                    rx="2"
                  />

                  {/* Active piece marker text */}
                  <text
                    x="170"
                    y="95"
                    fill="#D4AF37"
                    fontSize="11"
                    fontFamily="monospace"
                    textAnchor="middle"
                    fontWeight="bold"
                  >
                    {activePiece.label}
                  </text>
                </svg>
              </div>

              {/* Hardware & Machining Checklist */}
              <div
                className={`p-4 rounded-2xl border flex flex-col gap-2.5 ${
                  isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#121824] border-white/10'
                }`}
              >
                <span className="text-xs font-mono font-bold text-amber-500 block uppercase">
                  {language === 'ar'
                    ? 'الإكسسوارات وقطع التثبيت المخصصة لهذه القطعة :'
                    : language === 'en'
                    ? 'Hardware & Accessories Required for this Piece :'
                    : 'Quincaillerie & Accessoires à Monter sur cette Pièce :'}
                </span>

                <div className="flex flex-col gap-2 text-xs font-mono">
                  {getRequiredHardwareForPiece(activePiece).map((hw, i) => (
                    <div
                      key={`hw-${i}`}
                      className={`p-2.5 rounded-xl border flex items-center justify-between ${
                        isLight
                          ? 'bg-white border-slate-200 text-slate-800 shadow-xs'
                          : 'bg-white/5 border-white/5 text-zinc-300'
                      }`}
                    >
                      <div>
                        <span className={`font-bold block ${isLight ? 'text-slate-900' : 'text-white'}`}>
                          {hw.name}
                        </span>
                        <span className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
                          {hw.note}
                        </span>
                      </div>
                      <span className="font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-1 rounded-lg border border-amber-500/20 shrink-0">
                        {hw.qty}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
