/**
 * Baiti Atelier - Structural Silicone Glazing (VEC / VEP) Joint Sizing & Stress Auditor Modal
 * Interactive engineering sizing according to NF DTU 39 P4 / EOTA ETAG 002 / ASTM C1401
 * Humanizer compliant: exactly 0 em dashes, 0 en dashes.
 */

import React, { useState, useMemo } from 'react';
import {
  X,
  Layers,
  ShieldCheck,
  AlertTriangle,
  FileCheck,
  MessageCircle,
  Check,
  Wrench,
  Maximize2,
  Sliders,
  Sparkles,
} from 'lucide-react';
import {
  calculateStructuralGlazing,
  formatStructuralGlazingWhatsApp,
  VEC_SYSTEM_TYPES,
  STRUCTURAL_SEALANTS,
  type VecGlazingSystemType,
  type StructuralSealantBrand,
} from '../../utils/structuralGlazingManager';
import { generateStructuralGlazingPdf } from '../../utils/pdfGenerator';
import { playSwitchSound, playTactileClick } from '../../utils/audioFeedback';

export interface StructuralGlazingModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialWidth?: number;
  initialHeight?: number;
  windowReference?: string;
  wilayaName?: string;
  clientName?: string;
}

type ActiveTab = 'joint_sizing' | 'cross_section_svg' | 'etag_qa';

export const StructuralGlazingModal: React.FC<StructuralGlazingModalProps> = ({
  isOpen,
  onClose,
  initialWidth = 1500,
  initialHeight = 2400,
  windowReference = 'Panneau Façade VEC Tour',
  wilayaName = 'Alger (16)',
  clientName = 'Projet Tour d Affaires',
}) => {
  // State hooks called unconditionally
  const [activeTab, setActiveTab] = useState<ActiveTab>('joint_sizing');
  const [widthMm, setWidthMm] = useState<number>(initialWidth);
  const [heightMm, setHeightMm] = useState<number>(initialHeight);
  const [windPressurePa, setWindPressurePa] = useState<number>(1200);
  const [systemType, setSystemType] = useState<VecGlazingSystemType>('vec_supported_deadload_blocks');
  const [sealantBrand, setSealantBrand] = useState<StructuralSealantBrand>('dow_silicone_993');
  const [glassThicknessMm, setGlassThicknessMm] = useState<number>(28);
  const [deltaTempK, setDeltaTempK] = useState<number>(60);
  const [isPdfGenerating, setIsPdfGenerating] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Calculation memo
  const calculationResult = useMemo(() => {
    return calculateStructuralGlazing({
      widthMm,
      heightMm,
      windPressurePa,
      systemType,
      sealantBrand,
      totalGlassThicknessMm: glassThicknessMm,
      extremeDeltaTempCelsius: deltaTempK,
      wilayaName,
      projectRef: windowReference,
    });
  }, [
    widthMm,
    heightMm,
    windPressurePa,
    systemType,
    sealantBrand,
    glassThicknessMm,
    deltaTempK,
    wilayaName,
    windowReference,
  ]);

  if (!isOpen) return null;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleDownloadPdf = async () => {
    try {
      playTactileClick();
      setIsPdfGenerating(true);
      const docId = `BA-VEC-${Date.now().toString().slice(-6)}`;
      await generateStructuralGlazingPdf({
        documentId: docId,
        clientName,
        wilayaName,
        projectRef: windowReference,
        widthMm,
        heightMm,
        result: calculationResult,
      });
      showToast('Note technique Vitrage VEC générée avec succès');
    } catch {
      showToast('Erreur lors de la génération du document PDF');
    } finally {
      setIsPdfGenerating(false);
    }
  };

  const handleSendWhatsApp = () => {
    playTactileClick();
    const text = formatStructuralGlazingWhatsApp(calculationResult, clientName, windowReference);
    const encoded = encodeURIComponent(text);
    window.open(`https://wa.me/?text=${encoded}`, '_blank');
    showToast('Bordereau technique préparé pour WhatsApp');
  };

  const isFavorable = calculationResult.overallVerdict === 'favorable';
  const isWarning = calculationResult.overallVerdict === 'warning';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-2xl bg-[#0F172A] border border-slate-700/80 shadow-2xl text-slate-100 overflow-hidden">
        {/* HEADER BAR */}
        <div className="flex items-center justify-between px-4 py-3.5 border-b border-slate-800 bg-slate-900/90 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-bold text-white tracking-wide">
                  Vitrage Extérieur Collé (VEC / VEP)
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
                  ETAG 002
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono">
                Bite structural hc & épaisseur joint e • {calculationResult.systemSpec.nameFr.split('(')[0].trim()}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSendWhatsApp}
              className="p-2 sm:px-3 sm:py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer min-h-[44px]"
              title="Envoyer sur WhatsApp"
            >
              <MessageCircle className="w-4 h-4" />
              <span className="hidden sm:inline">WhatsApp</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={isPdfGenerating}
              className="p-2 sm:px-3 sm:py-2 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-md cursor-pointer disabled:opacity-50 min-h-[44px]"
              title="Télécharger Note PDF"
            >
              <FileCheck className="w-4 h-4" />
              <span className="hidden sm:inline">{isPdfGenerating ? 'Génération...' : 'Note PDF'}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                playTactileClick();
                onClose();
              }}
              className="w-10 h-10 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* TOAST NOTIFICATION */}
        {toastMessage && (
          <div className="absolute top-16 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs shadow-lg flex items-center gap-2 animate-bounce">
            <Check className="w-4 h-4" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* NAVIGATION TABS */}
        <div className="flex items-center border-b border-slate-800 bg-slate-950/60 px-4 gap-2 shrink-0">
          <button
            type="button"
            onClick={() => {
              playSwitchSound();
              setActiveTab('joint_sizing');
            }}
            className={`py-3 px-4 text-xs font-bold font-mono border-b-2 transition-all cursor-pointer min-h-[44px] flex items-center gap-2 ${
              activeTab === 'joint_sizing'
                ? 'border-indigo-400 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>Dimensionnement Joint hc & e</span>
          </button>

          <button
            type="button"
            onClick={() => {
              playSwitchSound();
              setActiveTab('cross_section_svg');
            }}
            className={`py-3 px-4 text-xs font-bold font-mono border-b-2 transition-all cursor-pointer min-h-[44px] flex items-center gap-2 ${
              activeTab === 'cross_section_svg'
                ? 'border-indigo-400 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Maximize2 className="w-4 h-4" />
            <span>Coupe de Détail VEC</span>
          </button>

          <button
            type="button"
            onClick={() => {
              playSwitchSound();
              setActiveTab('etag_qa');
            }}
            className={`py-3 px-4 text-xs font-bold font-mono border-b-2 transition-all cursor-pointer min-h-[44px] flex items-center gap-2 ${
              activeTab === 'etag_qa'
                ? 'border-indigo-400 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Contrôle Qualité & DTU 39 P4</span>
          </button>
        </div>

        {/* MODAL CONTENT BODY */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* TAB 1: JOINT SIZING & MECHANICS */}
          {activeTab === 'joint_sizing' && (
            <div className="space-y-4">
              {/* STATUS SUMMARY BANNER */}
              <div
                className={`p-3.5 rounded-xl border flex items-start gap-3 ${
                  isFavorable
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                    : isWarning
                    ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                    : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                }`}
              >
                {isFavorable ? (
                  <ShieldCheck className="w-5 h-5 shrink-0 text-emerald-400 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-5 h-5 shrink-0 text-amber-400 mt-0.5" />
                )}
                <div className="flex-1 text-xs">
                  <div className="font-bold text-sm text-white mb-0.5">
                    {calculationResult.verdictTitleFr}
                  </div>
                  <div className="space-y-1">
                    {calculationResult.verdictDetailsFr.map((det, idx) => (
                      <div key={idx} className="opacity-90">
                        • {det}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* INPUT CONTROLS GRID */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* DIMENSIONS BOX */}
                <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
                  <div className="text-xs font-bold text-slate-200 flex items-center justify-between">
                    <span>Dimensions du Panneau Verre</span>
                    <span className="text-[11px] text-indigo-400 font-mono">
                      {widthMm} x {heightMm} mm ({calculationResult.panelAreaM2.toFixed(3)} m²)
                    </span>
                  </div>

                  {/* Width slider */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] text-slate-400">
                      <span>Largeur W</span>
                      <span className="font-mono text-slate-300">{widthMm} mm</span>
                    </div>
                    <input
                      type="range"
                      min={600}
                      max={3200}
                      step={50}
                      value={widthMm}
                      onChange={(e) => setWidthMm(Number(e.target.value))}
                      className="w-full accent-indigo-400 cursor-pointer min-h-[30px]"
                    />
                    <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                      <span>600 mm</span>
                      <span>1500 mm</span>
                      <span>2400 mm</span>
                      <span>3200 mm</span>
                    </div>
                  </div>

                  {/* Height slider */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] text-slate-400">
                      <span>Hauteur H</span>
                      <span className="font-mono text-slate-300">{heightMm} mm</span>
                    </div>
                    <input
                      type="range"
                      min={800}
                      max={3800}
                      step={50}
                      value={heightMm}
                      onChange={(e) => setHeightMm(Number(e.target.value))}
                      className="w-full accent-indigo-400 cursor-pointer min-h-[30px]"
                    />
                    <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                      <span>800 mm</span>
                      <span>1800 mm</span>
                      <span>2800 mm</span>
                      <span>3800 mm</span>
                    </div>
                  </div>
                </div>

                {/* WIND & TEMPERATURE BOX */}
                <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
                  <div className="text-xs font-bold text-slate-200 flex items-center justify-between">
                    <span>Charge de Vent & Écart Thermique</span>
                    <span className="text-[11px] text-indigo-400 font-mono">
                      {windPressurePa} Pa (RNV 2013)
                    </span>
                  </div>

                  {/* Wind slider */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] text-slate-400">
                      <span>Pression Dynamique de Vent q_w</span>
                      <span className="font-mono text-slate-300">{windPressurePa} Pa</span>
                    </div>
                    <input
                      type="range"
                      min={600}
                      max={2500}
                      step={50}
                      value={windPressurePa}
                      onChange={(e) => setWindPressurePa(Number(e.target.value))}
                      className="w-full accent-indigo-400 cursor-pointer min-h-[30px]"
                    />
                    <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                      <span>600 Pa (Zone I)</span>
                      <span>1200 Pa (Zone II/III)</span>
                      <span>1800 Pa (Zone IV)</span>
                      <span>2500 Pa (Tour)</span>
                    </div>
                  </div>

                  {/* Delta Temp Slider */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] text-slate-400">
                      <span>Écart Thermique Extrême Delta T</span>
                      <span className="font-mono text-slate-300">{deltaTempK} K (Deg C)</span>
                    </div>
                    <input
                      type="range"
                      min={40}
                      max={80}
                      step={5}
                      value={deltaTempK}
                      onChange={(e) => setDeltaTempK(Number(e.target.value))}
                      className="w-full accent-indigo-400 cursor-pointer min-h-[30px]"
                    />
                    <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                      <span>40 K</span>
                      <span>60 K (Standard Algérie)</span>
                      <span>80 K (Sahara)</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* VEC SYSTEM TYPE & SEALANT BRAND */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 1. System Type */}
                <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
                  <span className="text-xs font-bold text-slate-200 block">Système de Collage VEC / VEP</span>
                  <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                    {(Object.keys(VEC_SYSTEM_TYPES) as VecGlazingSystemType[]).map((sysId) => {
                      const isSel = systemType === sysId;
                      const spec = VEC_SYSTEM_TYPES[sysId];
                      return (
                        <button
                          key={sysId}
                          type="button"
                          onClick={() => {
                            playSwitchSound();
                            setSystemType(sysId);
                          }}
                          className={`w-full p-2.5 rounded-lg border text-left text-xs transition-all cursor-pointer min-h-[44px] ${
                            isSel
                              ? 'bg-indigo-500/20 border-indigo-400 text-indigo-300 font-bold'
                              : 'bg-slate-800/50 border-slate-700/60 text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          <span className="font-bold block">{spec.nameFr}</span>
                          <span className="text-[10px] opacity-75 font-normal block truncate">
                            {spec.loadTransferMode}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Sealant Brand & Thickness */}
                <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
                  <span className="text-xs font-bold text-slate-200 block">Mastic Silicone Structural Agréé ETAG 002</span>
                  <div className="space-y-1.5">
                    {(Object.keys(STRUCTURAL_SEALANTS) as StructuralSealantBrand[]).map((sId) => {
                      const isSel = sealantBrand === sId;
                      const spec = STRUCTURAL_SEALANTS[sId];
                      return (
                        <button
                          key={sId}
                          type="button"
                          onClick={() => {
                            playSwitchSound();
                            setSealantBrand(sId);
                          }}
                          className={`w-full p-2 rounded-lg border text-left text-xs transition-all cursor-pointer min-h-[44px] ${
                            isSel
                              ? 'bg-indigo-500/20 border-indigo-400 text-indigo-300 font-bold'
                              : 'bg-slate-800/50 border-slate-700/60 text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          <div className="flex justify-between items-center">
                            <span className="font-bold">{spec.nameFr.split('(')[0].trim()}</span>
                            <span className="text-[10px] font-mono text-indigo-400">{spec.dynamicDesignTensileStressMpa} MPa</span>
                          </div>
                          <span className="text-[10px] opacity-75 font-normal block truncate">
                            {spec.typeFr} • Polymérisation {spec.curingTimeHours}h
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Glass Thickness Selector */}
                  <div className="space-y-1 pt-1 border-t border-slate-800">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-400">Épaisseur Totale Vitrage</span>
                      <span className="font-mono text-indigo-400 font-bold">{glassThicknessMm} mm ({calculationResult.glassWeightKg} kg)</span>
                    </div>
                    <div className="grid grid-cols-4 gap-1.5">
                      {[8, 24, 28, 32].map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setGlassThicknessMm(t)}
                          className={`p-1.5 rounded-lg border text-xs font-mono font-bold transition-all cursor-pointer min-h-[36px] ${
                            glassThicknessMm === t
                              ? 'bg-indigo-500 text-white border-indigo-400'
                              : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                          }`}
                        >
                          {t} mm
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* LIVE RESULTS METRIC TILES */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {/* Tile 1 */}
                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
                  <span className="text-[11px] text-slate-400 block font-mono">Bite Structural hc</span>
                  <span
                    className={`text-lg font-bold font-mono mt-0.5 block ${
                      calculationResult.isBiteSufficient ? 'text-indigo-400' : 'text-rose-400'
                    }`}
                  >
                    {calculationResult.recommendedBiteMm} mm
                  </span>
                  <span className="text-[10px] text-slate-500">
                    Calcul: {calculationResult.calculatedBiteMm} mm (Min {calculationResult.minNormativeBiteMm})
                  </span>
                </div>

                {/* Tile 2 */}
                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
                  <span className="text-[11px] text-slate-400 block font-mono">Épaisseur Joint e</span>
                  <span className="text-lg font-bold text-teal-400 font-mono mt-0.5 block">
                    {calculationResult.recommendedGluelineThicknessMm} mm
                  </span>
                  <span className="text-[10px] text-slate-400">
                    Delta L = {calculationResult.calculatedDifferentialExpansionMm} mm
                  </span>
                </div>

                {/* Tile 3 */}
                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
                  <span className="text-[11px] text-slate-400 block font-mono">Ratio Joint hc / e</span>
                  <span
                    className={`text-lg font-bold font-mono mt-0.5 block ${
                      calculationResult.isAspectRatioFavorable ? 'text-emerald-400' : 'text-amber-400'
                    }`}
                  >
                    {calculationResult.jointAspectRatio}
                  </span>
                  <span className="text-[10px] text-slate-500">
                    Plage optimale [1.0 - 3.0]
                  </span>
                </div>

                {/* Tile 4 */}
                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
                  <span className="text-[11px] text-slate-400 block font-mono">Consommation Mastic</span>
                  <span className="text-lg font-bold text-amber-400 font-mono mt-0.5 block">
                    {calculationResult.sealantVolumeLiters} L
                  </span>
                  <span className="text-[10px] text-slate-500">
                    {calculationResult.sausage600mlPacksRequired} poches de 600 ml
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SVG CROSS-SECTION BLUEPRINT */}
          {activeTab === 'cross_section_svg' && (
            <div className="space-y-4">
              {/* SVG BLUEPRINT DIAGRAM */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 relative overflow-hidden flex flex-col items-center justify-center min-h-[340px]">
                <svg
                  viewBox="0 0 800 360"
                  className="w-full h-auto max-h-[340px] select-none"
                >
                  <defs>
                    <pattern id="vecGrid" width="20" height="20" patternUnits="userSpaceOnUse">
                      <line x1="0" y1="0" x2="20" y2="0" stroke="#1e293b" strokeWidth="0.5" />
                      <line x1="0" y1="0" x2="0" y2="20" stroke="#1e293b" strokeWidth="0.5" />
                    </pattern>
                  </defs>

                  {/* Background grid */}
                  <rect x="0" y="0" width="800" height="360" fill="url(#vecGrid)" />

                  {/* Title */}
                  <text x="400" y="24" fill="#818cf8" fontSize="11" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
                    Coupe Technique de Principe Collage VEC (Bite hc & Épaisseur e)
                  </text>

                  {/* Aluminium Carrier Frame (Profilé Cadre VEC) */}
                  <path
                    d="M 120 70 L 320 70 L 320 120 L 260 120 L 260 280 L 120 280 Z"
                    fill="#334155"
                    stroke="#64748b"
                    strokeWidth="3"
                  />
                  <text x="180" y="180" fill="#94a3b8" fontSize="10" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
                    Cadre Aluminium Anodisé
                  </text>

                  {/* Glass Pane Double Glazing Outer Pane */}
                  <rect
                    x="370"
                    y="50"
                    width="26"
                    height="270"
                    fill="rgba(56, 189, 248, 0.25)"
                    stroke="#38bdf8"
                    strokeWidth="2"
                    rx="1"
                  />
                  <text x="383" y="190" fill="#bae6fd" fontSize="10" fontWeight="bold" textAnchor="middle" fontFamily="monospace" transform="rotate(-90 383 190)">
                    Verre Extérieur Collé
                  </text>

                  {/* Glass Inner Pane & Spacer */}
                  <rect
                    x="420"
                    y="70"
                    width="22"
                    height="230"
                    fill="rgba(56, 189, 248, 0.15)"
                    stroke="#0284c7"
                    strokeWidth="1.5"
                    rx="1"
                  />
                  <rect x="396" y="90" width="24" height="20" fill="#475569" stroke="#94a3b8" strokeWidth="1" />
                  <rect x="396" y="270" width="24" height="20" fill="#475569" stroke="#94a3b8" strokeWidth="1" />

                  {/* Structural Silicone Joint (Mastic Noir) */}
                  <rect
                    x="320"
                    y="70"
                    width="50"
                    height="90"
                    fill="#18181b"
                    stroke="#6366f1"
                    strokeWidth="2.5"
                  />
                  <text x="345" y="120" fill="#a5b4fc" fontSize="9" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
                    Silicone
                  </text>

                  {/* Closed Cell Backer Tape (Fond de joint mousse PE) */}
                  <rect
                    x="320"
                    y="160"
                    width="50"
                    height="30"
                    fill="#71717a"
                    stroke="#52525b"
                    strokeWidth="1"
                  />
                  <text x="345" y="180" fill="#e4e4e7" fontSize="8" textAnchor="middle" fontFamily="monospace">
                    Mousse PE
                  </text>

                  {/* Mechanical Dead Load Setting Block (Cale d appui de sécurité) */}
                  {calculationResult.safetyClipsRequired && (
                    <g transform="translate(320, 290)">
                      <rect x="0" y="0" width="100" height="15" fill="#f59e0b" stroke="#000" strokeWidth="1" rx="2" />
                      <text x="50" y="11" fill="#000" fontSize="8" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
                        Cale d Appui DTU 39
                      </text>
                    </g>
                  )}

                  {/* Dimension Callouts for Bite hc and Thickness e */}
                  {/* Bite hc */}
                  <line x1="380" y1="70" x2="380" y2="160" stroke="#f43f5e" strokeWidth="2" />
                  <line x1="375" y1="70" x2="385" y2="70" stroke="#f43f5e" strokeWidth="2" />
                  <line x1="375" y1="160" x2="385" y2="160" stroke="#f43f5e" strokeWidth="2" />
                  <text x="495" y="118" fill="#f43f5e" fontSize="11" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
                    hc = {calculationResult.recommendedBiteMm} mm (Bite)
                  </text>

                  {/* Glueline Thickness e */}
                  <line x1="320" y1="60" x2="370" y2="60" stroke="#10b981" strokeWidth="2" />
                  <line x1="320" y1="55" x2="320" y2="65" stroke="#10b981" strokeWidth="2" />
                  <line x1="370" y1="55" x2="370" y2="65" stroke="#10b981" strokeWidth="2" />
                  <text x="345" y="48" fill="#10b981" fontSize="11" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
                    e = {calculationResult.recommendedGluelineThicknessMm} mm
                  </text>
                </svg>
              </div>

              {/* Summary KPIs Row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs space-y-1">
                  <div className="font-bold text-indigo-400">Section Transversale Joint</div>
                  <div className="text-slate-300 font-mono text-sm">
                    {calculationResult.jointCrossSectionMm2} mm²
                  </div>
                  <div className="text-[10px] text-slate-500">
                    Bite {calculationResult.recommendedBiteMm} mm × Épaisseur {calculationResult.recommendedGluelineThicknessMm} mm
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs space-y-1">
                  <div className="font-bold text-indigo-400">Pattes Anti-Chute Inox</div>
                  <div className="text-slate-300 font-mono text-sm">
                    {calculationResult.minSafetyClipsCount} pattes
                  </div>
                  <div className="text-[10px] text-slate-500">
                    Sécurité mécanique latérale DTU 39 P4
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs space-y-1">
                  <div className="font-bold text-indigo-400">Mastic Sélectionné</div>
                  <div className="text-slate-300 font-mono text-sm">
                    {calculationResult.sealantSpec.nameFr.split('(')[0].trim()}
                  </div>
                  <div className="text-[10px] text-slate-500">
                    Agrément technique européen ETAG 002
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: ETAG 002 QA & DTU 39 P4 PROTOCOLS */}
          {activeTab === 'etag_qa' && (
            <div className="space-y-4">
              {/* Prescriptions ETAG Card */}
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
                <div className="text-xs font-bold text-indigo-400 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-400" />
                  <span>Protocole d'Assurance Qualité Atelier VEC (ETAG 002 / DTU 39 P4)</span>
                </div>

                <div className="space-y-2 text-xs text-slate-300">
                  <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
                    <span>
                      <strong>Nettoyage en Deux Chiffons :</strong> Dégraissage strict des surfaces d aluminium et du verre à l alcool isopropylique pur (méthode 1 chiffon imbibé + 1 chiffon sec immédiat avant évaporation).
                    </span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
                    <span>
                      <strong>Primaire d'Adhérence :</strong> Application d un film mince de primaire d adhérence certifié par le fabricant de silicone sur les portées d aluminium anodisé ou thermolaqué.
                    </span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
                    <span>
                      <strong>Éprouvettes en H Quotidiennes :</strong> Réalisation journalière d éprouvettes en H pour contrôle de la polymérisation à cœur et test d étirement jusqu à rupture 100% cohésive.
                    </span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
                    <span>
                      <strong>Registre de Traçabilité :</strong> Enregistrement systématique du numéro de lot de mastic, du ratio de mélange A/B, de la température et de l hygrométrie de l atelier.
                    </span>
                  </div>
                </div>
              </div>

              {/* Directives Workshop Checklist */}
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
                  <Wrench className="w-4 h-4 text-indigo-400" />
                  <span>Recommandations Spécifiques au Projet</span>
                </div>
                <div className="space-y-1.5 text-xs text-slate-300">
                  {calculationResult.recommendationsFr.map((rec, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <Check className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
                      <span>{rec}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* BOTTOM ACTION BAR */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-slate-800 bg-slate-950/80 shrink-0">
          <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
            <span>Réf: {windowReference}</span>
            <span>•</span>
            <span>Wilaya: {wilayaName}</span>
          </div>

          <button
            type="button"
            onClick={() => {
              playTactileClick();
              onClose();
            }}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all cursor-pointer min-h-[44px]"
          >
            Fermer le Calcul VEC
          </button>
        </div>
      </div>
    </div>
  );
};
