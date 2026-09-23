/**
 * Baiti Atelier - Bifold / Accordion Door Structural & PMR Threshold Modal
 * Interactive engineering sizing for folding doors according to NF EN 1527 / DTU 36.5 / Decret PMR 06-455
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
  Droplets,
  Sliders,
  Sparkles,
} from 'lucide-react';
import {
  calculateBifoldSystem,
  formatBifoldDispatchWhatsApp,
  BIFOLD_CONFIGURATIONS,
  MOUNTING_SYSTEMS,
  BIFOLD_THRESHOLDS,
  BIFOLD_GLAZINGS,
  ROLLER_BOGIE_OPTIONS,
  type BifoldConfigId,
  type BifoldMountingSystem,
  type BifoldThresholdType,
  type BifoldGlazingOption,
} from '../../utils/bifoldDoorManager';
import { generateBifoldDoorNoticePdf } from '../../utils/pdfGenerator';
import { playSwitchSound, playTactileClick } from '../../utils/audioFeedback';

export interface BifoldDoorModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialWidth?: number;
  initialHeight?: number;
  windowReference?: string;
  wilayaName?: string;
  clientName?: string;
}

type ActiveTab = 'kinematics' | 'elevation' | 'drainage_pmr';

export const BifoldDoorModal: React.FC<BifoldDoorModalProps> = ({
  isOpen,
  onClose,
  initialWidth = 3200,
  initialHeight = 2200,
  windowReference = 'Baie Accordéon Salon',
  wilayaName = 'Alger (16)',
  clientName = 'Projet Villa Contemporaine',
}) => {
  // State hooks called unconditionally
  const [activeTab, setActiveTab] = useState<ActiveTab>('kinematics');
  const [widthMm, setWidthMm] = useState<number>(initialWidth);
  const [heightMm, setHeightMm] = useState<number>(initialHeight);
  const [configId, setConfigId] = useState<BifoldConfigId>('4_0');
  const [mountingSystem, setMountingSystem] = useState<BifoldMountingSystem>('top_hung');
  const [thresholdType, setThresholdType] = useState<BifoldThresholdType>('pmr_low_profile');
  const [glazingOption, setGlazingOption] = useState<BifoldGlazingOption>('double_4_16_4');
  const [bogieCapacityKg, setBogieCapacityKg] = useState<number>(120);
  const [openingPercent, setOpeningPercent] = useState<number>(0);
  const [isPdfGenerating, setIsPdfGenerating] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Calculation memo
  const calculationResult = useMemo(() => {
    return calculateBifoldSystem({
      totalWidthMm: widthMm,
      totalHeightMm: heightMm,
      configId,
      mountingSystem,
      thresholdType,
      glazingOption,
      selectedBogieCapacityKg: bogieCapacityKg,
      wilayaName,
    });
  }, [widthMm, heightMm, configId, mountingSystem, thresholdType, glazingOption, bogieCapacityKg, wilayaName]);

  if (!isOpen) return null;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleDownloadPdf = async () => {
    try {
      playTactileClick();
      setIsPdfGenerating(true);
      const docId = `BA-BIFOLD-${Date.now().toString().slice(-6)}`;
      await generateBifoldDoorNoticePdf({
        documentId: docId,
        clientName,
        wilayaName,
        windowReference,
        widthMm,
        heightMm,
        result: calculationResult,
      });
      showToast('Note technique Baie Accordéon générée avec succès');
    } catch {
      showToast('Erreur lors de la génération du document PDF');
    } finally {
      setIsPdfGenerating(false);
    }
  };

  const handleSendWhatsApp = () => {
    playTactileClick();
    const text = formatBifoldDispatchWhatsApp(calculationResult, clientName, windowReference);
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
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-bold text-white tracking-wide">
                  Baie Accordéon & Porte Portefeuille
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30">
                  NF EN 1527
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono">
                Charges galets, flèche linteau & seuil PMR • {calculationResult.configSpec.label}
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
              className="p-2 sm:px-3 sm:py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 transition-all shadow-md cursor-pointer disabled:opacity-50 min-h-[44px]"
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
              setActiveTab('kinematics');
            }}
            className={`py-3 px-4 text-xs font-bold font-mono border-b-2 transition-all cursor-pointer min-h-[44px] flex items-center gap-2 ${
              activeTab === 'kinematics'
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>Cinématique & Charges</span>
          </button>

          <button
            type="button"
            onClick={() => {
              playSwitchSound();
              setActiveTab('elevation');
            }}
            className={`py-3 px-4 text-xs font-bold font-mono border-b-2 transition-all cursor-pointer min-h-[44px] flex items-center gap-2 ${
              activeTab === 'elevation'
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Maximize2 className="w-4 h-4" />
            <span>Simulation Élévation</span>
          </button>

          <button
            type="button"
            onClick={() => {
              playSwitchSound();
              setActiveTab('drainage_pmr');
            }}
            className={`py-3 px-4 text-xs font-bold font-mono border-b-2 transition-all cursor-pointer min-h-[44px] flex items-center gap-2 ${
              activeTab === 'drainage_pmr'
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Droplets className="w-4 h-4" />
            <span>Seuil PMR & Drainage</span>
          </button>
        </div>

        {/* MODAL CONTENT BODY */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* TAB 1: KINEMATICS & LOAD SIZING */}
          {activeTab === 'kinematics' && (
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
                    {calculationResult.structuralLintelWarning && (
                      <div className="font-bold text-rose-300 mt-1">
                        • {calculationResult.structuralLintelWarning}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* INPUT CONTROLS GRID */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* DIMENSIONS BOX */}
                <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
                  <div className="text-xs font-bold text-slate-200 flex items-center justify-between">
                    <span>Dimensions de la Baie (Hors-Tout)</span>
                    <span className="text-[11px] text-amber-400 font-mono">
                      {widthMm} x {heightMm} mm
                    </span>
                  </div>

                  {/* Width slider */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] text-slate-400">
                      <span>Largeur Totale W</span>
                      <span className="font-mono text-slate-300">{widthMm} mm</span>
                    </div>
                    <input
                      type="range"
                      min={1600}
                      max={7200}
                      step={50}
                      value={widthMm}
                      onChange={(e) => setWidthMm(Number(e.target.value))}
                      className="w-full accent-amber-400 cursor-pointer min-h-[30px]"
                    />
                    <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                      <span>1600 mm</span>
                      <span>3200 mm</span>
                      <span>5000 mm</span>
                      <span>7200 mm</span>
                    </div>
                  </div>

                  {/* Height slider */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] text-slate-400">
                      <span>Hauteur Totale H</span>
                      <span className="font-mono text-slate-300">{heightMm} mm</span>
                    </div>
                    <input
                      type="range"
                      min={1800}
                      max={3200}
                      step={50}
                      value={heightMm}
                      onChange={(e) => setHeightMm(Number(e.target.value))}
                      className="w-full accent-amber-400 cursor-pointer min-h-[30px]"
                    />
                    <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                      <span>1800 mm</span>
                      <span>2200 mm</span>
                      <span>2600 mm</span>
                      <span>3200 mm</span>
                    </div>
                  </div>
                </div>

                {/* CONFIGURATION SELECTION BOX */}
                <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
                  <div className="text-xs font-bold text-slate-200 flex items-center justify-between">
                    <span>Schéma d'Ouverture Accordéon</span>
                    <span className="text-[11px] text-amber-400 font-mono">
                      {calculationResult.leafCount} vantaux
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-1.5 max-h-40 overflow-y-auto pr-1">
                    {BIFOLD_CONFIGURATIONS.map((cfg) => {
                      const isSel = cfg.id === configId;
                      return (
                        <button
                          key={cfg.id}
                          type="button"
                          onClick={() => {
                            playSwitchSound();
                            setConfigId(cfg.id);
                          }}
                          className={`p-2 rounded-lg border text-left text-xs transition-all cursor-pointer min-h-[44px] flex flex-col justify-center ${
                            isSel
                              ? 'bg-amber-500/20 border-amber-400 text-amber-300 font-bold'
                              : 'bg-slate-800/50 border-slate-700/60 text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          <span className="text-xs font-mono">{cfg.label}</span>
                          <span className="text-[10px] opacity-75 font-normal truncate">
                            {cfg.trafficDoor ? 'Porte battante' : 'Sans porte service'}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* MECHANICAL COMPONENTS ROW */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* 1. Mounting System */}
                <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
                  <span className="text-xs font-bold text-slate-200 block">Guidage & Suspension</span>
                  <div className="space-y-1.5">
                    {(Object.keys(MOUNTING_SYSTEMS) as BifoldMountingSystem[]).map((mId) => {
                      const isSel = mountingSystem === mId;
                      const spec = MOUNTING_SYSTEMS[mId];
                      return (
                        <button
                          key={mId}
                          type="button"
                          onClick={() => {
                            playSwitchSound();
                            setMountingSystem(mId);
                          }}
                          className={`w-full p-2 rounded-lg border text-left text-xs transition-all cursor-pointer min-h-[44px] ${
                            isSel
                              ? 'bg-amber-500/20 border-amber-400 text-amber-300 font-bold'
                              : 'bg-slate-800/50 border-slate-700/60 text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          <span className="block">{spec.nameFr}</span>
                          <span className="text-[10px] opacity-75 font-normal block">
                            {spec.recommendedUse}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Glazing Selection */}
                <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
                  <span className="text-xs font-bold text-slate-200 block">Type de Vitrage</span>
                  <div className="space-y-1.5">
                    {(Object.keys(BIFOLD_GLAZINGS) as BifoldGlazingOption[]).map((gId) => {
                      const isSel = glazingOption === gId;
                      const spec = BIFOLD_GLAZINGS[gId];
                      return (
                        <button
                          key={gId}
                          type="button"
                          onClick={() => {
                            playSwitchSound();
                            setGlazingOption(gId);
                          }}
                          className={`w-full p-2 rounded-lg border text-left text-xs transition-all cursor-pointer min-h-[44px] ${
                            isSel
                              ? 'bg-amber-500/20 border-amber-400 text-amber-300 font-bold'
                              : 'bg-slate-800/50 border-slate-700/60 text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          <div className="flex justify-between items-center">
                            <span className="font-bold">{spec.nameFr.split('(')[0].trim()}</span>
                            <span className="text-[10px] font-mono text-amber-400">{spec.glassMassKgPerM2} kg/m²</span>
                          </div>
                          <span className="text-[10px] opacity-75 font-normal block">
                            Rw {spec.acousticRwDb} dB • Ug {spec.thermalUg} W/m²K
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 3. Roller Bogie Capacity */}
                <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
                  <span className="text-xs font-bold text-slate-200 block">Capacité Chariot Porteur</span>
                  <div className="space-y-1.5">
                    {ROLLER_BOGIE_OPTIONS.map((bog) => {
                      const isSel = bogieCapacityKg === bog.capacityKg;
                      return (
                        <button
                          key={bog.capacityKg}
                          type="button"
                          onClick={() => {
                            playSwitchSound();
                            setBogieCapacityKg(bog.capacityKg);
                          }}
                          className={`w-full p-2 rounded-lg border text-left text-xs transition-all cursor-pointer min-h-[44px] ${
                            isSel
                              ? 'bg-amber-500/20 border-amber-400 text-amber-300 font-bold'
                              : 'bg-slate-800/50 border-slate-700/60 text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          <div className="flex justify-between items-center">
                            <span className="font-bold">{bog.label}</span>
                            <span className="text-[10px] font-mono text-amber-400">{bog.capacityKg} kg</span>
                          </div>
                          <span className="text-[10px] opacity-75 font-normal block">
                            {bog.bearingType}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* LIVE RESULTS METRIC TILES */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {/* Tile 1 */}
                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
                  <span className="text-[11px] text-slate-400 block font-mono">Poids par Vantail</span>
                  <span className="text-lg font-bold text-amber-400 font-mono mt-0.5 block">
                    {calculationResult.singleLeafTotalWeightKg} kg
                  </span>
                  <span className="text-[10px] text-slate-500">
                    Vitrage: {calculationResult.leafGlassWeightKg} kg
                  </span>
                </div>

                {/* Tile 2 */}
                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
                  <span className="text-[11px] text-slate-400 block font-mono">Charge Chariot</span>
                  <span
                    className={`text-lg font-bold font-mono mt-0.5 block ${
                      calculationResult.isBogieCapacitySufficient ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {calculationResult.loadPerBogieKg} kg
                  </span>
                  <span className="text-[10px] text-slate-400">
                    Taux: {calculationResult.bogieUtilizationPercent}%
                  </span>
                </div>

                {/* Tile 3 */}
                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
                  <span className="text-[11px] text-slate-400 block font-mono">Linteau Vantaux Empilés</span>
                  <span className="text-lg font-bold text-sky-400 font-mono mt-0.5 block">
                    {calculationResult.stackedConcentratedLoadKg} kg
                  </span>
                  <span className="text-[10px] text-slate-500">
                    {calculationResult.stackedLeavesCountMaxSide} vantaux au refend
                  </span>
                </div>

                {/* Tile 4 */}
                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
                  <span className="text-[11px] text-slate-400 block font-mono">Flèche Limite Linteau</span>
                  <span className="text-lg font-bold text-emerald-400 font-mono mt-0.5 block">
                    {calculationResult.lintelDeflectionLimitMm} mm
                  </span>
                  <span className="text-[10px] text-slate-500">
                    Inertie est. {calculationResult.recommendedLintelInertiaCm4} cm4
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ELEVATION & FOLDING SIMULATION */}
          {activeTab === 'elevation' && (
            <div className="space-y-4">
              {/* Interactive Opening Slider */}
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    Degré d'Ouverture Accordéon (Simulation Cinématique)
                  </span>
                  <p className="text-[11px] text-slate-400">
                    Visualisez le déplacement des galets et le paquet de vantaux empilés
                  </p>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-64">
                  <input
                    type="range"
                    min={0}
                    max={100}
                    step={1}
                    value={openingPercent}
                    onChange={(e) => setOpeningPercent(Number(e.target.value))}
                    className="w-full accent-amber-400 cursor-pointer min-h-[30px]"
                  />
                  <span className="font-mono text-xs font-bold text-amber-400 w-12 text-right">
                    {openingPercent}%
                  </span>
                </div>
              </div>

              {/* SVG BLUEPRINT DIAGRAM */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 relative overflow-hidden flex flex-col items-center justify-center min-h-[320px]">
                <svg
                  viewBox="0 0 800 360"
                  className="w-full h-auto max-h-[320px] select-none"
                >
                  <defs>
                    <linearGradient id="glassGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#0284c7" stopOpacity="0.10" />
                    </linearGradient>
                    <pattern id="gridPattern" width="20" height="20" patternUnits="userSpaceOnUse">
                      <line x1="0" y1="0" x2="20" y2="0" stroke="#1e293b" strokeWidth="0.5" />
                      <line x1="0" y1="0" x2="0" y2="20" stroke="#1e293b" strokeWidth="0.5" />
                    </pattern>
                  </defs>

                  {/* Grid background */}
                  <rect x="0" y="0" width="800" height="360" fill="url(#gridPattern)" />

                  {/* Outer Frame (Dormant) */}
                  <rect
                    x="50"
                    y="40"
                    width="700"
                    height="260"
                    fill="none"
                    stroke="#475569"
                    strokeWidth="8"
                    rx="4"
                  />

                  {/* Upper Guide Track */}
                  <rect x="50" y="40" width="700" height="14" fill="#64748b" />
                  <text x="400" y="32" fill="#94a3b8" fontSize="10" textAnchor="middle" fontFamily="monospace">
                    Rail Supérieur (Profil Guidage / Chariots Inox)
                  </text>

                  {/* Bottom Sill */}
                  <rect
                    x="50"
                    y="286"
                    width="700"
                    height="14"
                    fill={thresholdType === 'pmr_low_profile' ? '#d97706' : '#475569'}
                  />
                  <text x="400" y="316" fill="#94a3b8" fontSize="10" textAnchor="middle" fontFamily="monospace">
                    {calculationResult.thresholdSpec.nameFr} (H={calculationResult.thresholdSpec.heightMm} mm)
                  </text>

                  {/* Render Folding Leaves */}
                  {Array.from({ length: calculationResult.leafCount }).map((_, idx) => {
                    const N = calculationResult.leafCount;
                    const frameWidth = 680;
                    const baseLeafWidth = frameWidth / N;

                    // Compute position and width during accordion fold
                    // Opening compression factors
                    const foldRatio = openingPercent / 100;
                    const compressedLeafWidth = baseLeafWidth * (1 - foldRatio * 0.75);
                    const leafX = 60 + idx * compressedLeafWidth;
                    const isEven = idx % 2 === 0;

                    return (
                      <g key={idx} className="transition-all duration-150">
                        {/* Leaf Outer Profile Frame */}
                        <rect
                          x={leafX}
                          y="58"
                          width={compressedLeafWidth - 6}
                          height="224"
                          fill="#1e293b"
                          stroke={isEven ? '#38bdf8' : '#818cf8'}
                          strokeWidth="2.5"
                          rx="3"
                        />

                        {/* Glass Daylight Area */}
                        <rect
                          x={leafX + 6}
                          y="68"
                          width={Math.max(compressedLeafWidth - 18, 4)}
                          height="204"
                          fill="url(#glassGrad)"
                          stroke="#0284c7"
                          strokeWidth="1"
                        />

                        {/* Carrier Bogie Icon on Top for articulated pairs */}
                        {idx % 2 === 1 && (
                          <g transform={`translate(${leafX + compressedLeafWidth - 6}, 50)`}>
                            <circle cx="0" cy="0" r="4" fill="#fbbf24" stroke="#000" strokeWidth="1" />
                            <circle cx="6" cy="0" r="4" fill="#fbbf24" stroke="#000" strokeWidth="1" />
                          </g>
                        )}

                        {/* Leaf Number Label */}
                        <text
                          x={leafX + compressedLeafWidth / 2 - 3}
                          y="175"
                          fill="#f8fafc"
                          fontSize="11"
                          fontWeight="bold"
                          textAnchor="middle"
                          fontFamily="monospace"
                        >
                          V{idx + 1}
                        </text>
                      </g>
                    );
                  })}

                  {/* Concentrated Load Marker in Folded Mode */}
                  {openingPercent > 30 && (
                    <g transform="translate(70, 75)">
                      <circle cx="0" cy="0" r="14" fill="#ef4444" fillOpacity="0.2" />
                      <line x1="0" y1="-10" x2="0" y2="10" stroke="#ef4444" strokeWidth="2.5" />
                      <polygon points="-5,5 0,14 5,5" fill="#ef4444" />
                      <text x="22" y="4" fill="#f87171" fontSize="10" fontWeight="bold" fontFamily="monospace">
                        P = {calculationResult.stackedConcentratedLoadKg} kg
                      </text>
                    </g>
                  )}
                </svg>
              </div>

              {/* Folding Pack & Hardware Callouts */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs space-y-1">
                  <div className="font-bold text-amber-400">Épaisseur Paquet Replié</div>
                  <div className="text-slate-300 font-mono text-sm">
                    {calculationResult.stackedWidthMm} mm
                  </div>
                  <div className="text-[10px] text-slate-500">
                    {calculationResult.stackedLeavesCountMaxSide} vantaux empilés contre le refend
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs space-y-1">
                  <div className="font-bold text-amber-400">Effort Traction Paumelle</div>
                  <div className="text-slate-300 font-mono text-sm">
                    {calculationResult.hingeTensionDaN} daN
                  </div>
                  <div className="text-[10px] text-slate-500">
                    Couple de porte-à-faux sur paumelle haute
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs space-y-1">
                  <div className="font-bold text-amber-400">Fixations Dormant Latéral</div>
                  <div className="text-slate-300 font-mono text-sm">
                    {calculationResult.minAnchorFastenersPerJamb} chevilles par montant
                  </div>
                  <div className="text-[10px] text-slate-500">
                    Espacées de 400 mm avec calage incompressible
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: PMR THRESHOLD & DRAINAGE */}
          {activeTab === 'drainage_pmr' && (
            <div className="space-y-4">
              {/* THRESHOLD SELECTION CARDS */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-200 block">
                  Sélection du Seuil (Norme PMR & Étanchéité AEV)
                </span>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {(Object.keys(BIFOLD_THRESHOLDS) as BifoldThresholdType[]).map((tId) => {
                    const isSel = thresholdType === tId;
                    const spec = BIFOLD_THRESHOLDS[tId];
                    return (
                      <button
                        key={tId}
                        type="button"
                        onClick={() => {
                          playSwitchSound();
                          setThresholdType(tId);
                        }}
                        className={`p-3 rounded-xl border text-left text-xs transition-all cursor-pointer min-h-[44px] flex flex-col justify-between ${
                          isSel
                            ? 'bg-amber-500/20 border-amber-400 text-amber-300 font-bold'
                            : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <span className="font-bold text-white">{spec.nameFr.split('(')[0].trim()}</span>
                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-amber-400">
                              {spec.heightMm} mm
                            </span>
                          </div>
                          <p className="text-[11px] opacity-80 font-normal">
                            {spec.descriptionFr}
                          </p>
                        </div>

                        <div className="mt-2 pt-2 border-t border-slate-800 flex justify-between items-center text-[10px] font-mono">
                          <span className={spec.pmrCompliant ? 'text-emerald-400' : 'text-slate-500'}>
                            {spec.pmrCompliant ? 'PMR Conforme' : 'Non PMR'}
                          </span>
                          <span className="text-sky-400">{spec.waterTightnessClass}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* DRAINAGE & RAINWATER EVACUATION METRICS */}
              <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
                  <Droplets className="w-4 h-4 text-sky-400" />
                  <span>Évacuation des Eaux de Pluie & Buses de Drainage (DTU 36.5)</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Nombre de Fentes / Buses</span>
                    <span className="text-base font-bold text-amber-400 font-mono mt-0.5 block">
                      {calculationResult.weepHoleCount} buses
                    </span>
                    <span className="text-[10px] text-slate-500">Section {calculationResult.weepHoleSectionMm}</span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Débit d'Évacuation Estimé</span>
                    <span className="text-base font-bold text-sky-400 font-mono mt-0.5 block">
                      {calculationResult.drainageRateLitersPerMin} L/min
                    </span>
                    <span className="text-[10px] text-slate-500">Sous averse battante côtière</span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Clapets Anti-Retour</span>
                    <span className="text-base font-bold text-emerald-400 font-mono mt-0.5 block">
                      {calculationResult.antiReturnFlapRequired ? 'Obligatoire' : 'Recommandé'}
                    </span>
                    <span className="text-[10px] text-slate-500">Bloque le vent et refoulement</span>
                  </div>
                </div>
              </div>

              {/* WORKSHOP & SITE INSTALLATION CHECKLIST */}
              <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
                  <Wrench className="w-4 h-4 text-amber-400" />
                  <span>Prescriptions Atelier et Pose Chantier</span>
                </div>
                <div className="space-y-1.5 text-xs text-slate-300">
                  {calculationResult.recommendationsFr.map((rec, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <Check className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
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
            Fermer le Dimensionnement
          </button>
        </div>
      </div>
    </div>
  );
};
