/**
 * Baiti Atelier - Multi-Point Espagnolette Locking & Burglary Resistance Safety Modal
 * Interactive engineering auditor according to NF EN 1627-1630 / NF EN 356 / A2P
 * Humanizer compliant: exactly 0 em dashes, 0 en dashes.
 */

import React, { useState, useMemo } from 'react';
import {
  X,
  ShieldCheck,
  ShieldAlert,
  FileCheck,
  MessageCircle,
  Check,
  Wrench,
  Maximize2,
  Lock,
  Sliders,
  Key,
} from 'lucide-react';
import {
  auditSecurityLocking,
  formatSecurityDispatchWhatsApp,
  BURGLARY_RESISTANCE_CLASSES,
  LOCKING_CAM_TYPES,
  type BurglaryResistanceClass,
  type LockingCamType,
} from '../../utils/securityLockingManager';
import { generateSecurityLockingPdf } from '../../utils/pdfGenerator';
import { playSwitchSound, playTactileClick } from '../../utils/audioFeedback';

export interface SecurityLockingModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialWidth?: number;
  initialHeight?: number;
  windowReference?: string;
  wilayaName?: string;
  clientName?: string;
}

type ActiveTab = 'hardware_audit' | 'elevation_blueprint' | 'classes_guide';

export const SecurityLockingModal: React.FC<SecurityLockingModalProps> = ({
  isOpen,
  onClose,
  initialWidth = 1400,
  initialHeight = 1500,
  windowReference = 'Châssis Rez-de-Chaussée Façade',
  wilayaName = 'Alger (16)',
  clientName = 'Résidence Sécurisée',
}) => {
  // State hooks called unconditionally
  const [activeTab, setActiveTab] = useState<ActiveTab>('hardware_audit');
  const [widthMm, setWidthMm] = useState<number>(initialWidth);
  const [heightMm, setHeightMm] = useState<number>(initialHeight);
  const [targetClass, setTargetClass] = useState<BurglaryResistanceClass>('rc2');
  const [chosenCamType, setChosenCamType] = useState<LockingCamType>('mushroom_steel');
  const [lockingPointsCount, setLockingPointsCount] = useState<number>(6);
  const [hasLockingHandleKey, setHasLockingHandleKey] = useState<boolean>(true);
  const [hasAntiDrillPlate, setHasAntiDrillPlate] = useState<boolean>(true);
  const [currentGlazingType, setCurrentGlazingType] = useState<string>('Feuilleté 44.2 (P4A)');
  const [isPdfGenerating, setIsPdfGenerating] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Calculation memo
  const auditorResult = useMemo(() => {
    return auditSecurityLocking({
      widthMm,
      heightMm,
      targetClass,
      chosenCamType,
      installedLockingPointsCount: lockingPointsCount,
      hasLockingHandleKey,
      hasAntiDrillPlate,
      currentGlazingType,
      wilayaName,
      windowReference,
    });
  }, [
    widthMm,
    heightMm,
    targetClass,
    chosenCamType,
    lockingPointsCount,
    hasLockingHandleKey,
    hasAntiDrillPlate,
    currentGlazingType,
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
      const docId = `BA-SEC-${Date.now().toString().slice(-6)}`;
      await generateSecurityLockingPdf({
        documentId: docId,
        clientName,
        wilayaName,
        projectRef: windowReference,
        widthMm,
        heightMm,
        result: auditorResult,
      });
      showToast('Note technique Sécurité générée avec succès');
    } catch {
      showToast('Erreur lors de la génération du document PDF');
    } finally {
      setIsPdfGenerating(false);
    }
  };

  const handleSendWhatsApp = () => {
    playTactileClick();
    const text = formatSecurityDispatchWhatsApp(auditorResult, clientName, windowReference);
    const encoded = encodeURIComponent(text);
    window.open(`https://wa.me/?text=${encoded}`, '_blank');
    showToast('Bordereau technique préparé pour WhatsApp');
  };

  const isFavorable = auditorResult.overallVerdict === 'favorable';
  const isWarning = auditorResult.overallVerdict === 'warning';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-2xl bg-[#0F172A] border border-slate-700/80 shadow-2xl text-slate-100 overflow-hidden">
        {/* HEADER BAR */}
        <div className="flex items-center justify-between px-4 py-3.5 border-b border-slate-800 bg-slate-900/90 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-bold text-white tracking-wide">
                  Audit Sécurité Quincaillerie & Anti-Effraction
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/30">
                  NF EN 1627
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono">
                Points de condamnation, galets champignon & vitrage • Classe {auditorResult.classSpec.label}
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
              className="p-2 sm:px-3 sm:py-2 rounded-xl bg-rose-500 hover:bg-rose-400 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-md cursor-pointer disabled:opacity-50 min-h-[44px]"
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
              setActiveTab('hardware_audit');
            }}
            className={`py-3 px-4 text-xs font-bold font-mono border-b-2 transition-all cursor-pointer min-h-[44px] flex items-center gap-2 ${
              activeTab === 'hardware_audit'
                ? 'border-rose-400 text-rose-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>Audit Quincaillerie & Points</span>
          </button>

          <button
            type="button"
            onClick={() => {
              playSwitchSound();
              setActiveTab('elevation_blueprint');
            }}
            className={`py-3 px-4 text-xs font-bold font-mono border-b-2 transition-all cursor-pointer min-h-[44px] flex items-center gap-2 ${
              activeTab === 'elevation_blueprint'
                ? 'border-rose-400 text-rose-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Maximize2 className="w-4 h-4" />
            <span>Schéma Élévation & Pênes</span>
          </button>

          <button
            type="button"
            onClick={() => {
              playSwitchSound();
              setActiveTab('classes_guide');
            }}
            className={`py-3 px-4 text-xs font-bold font-mono border-b-2 transition-all cursor-pointer min-h-[44px] flex items-center gap-2 ${
              activeTab === 'classes_guide'
                ? 'border-rose-400 text-rose-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Guide des Classes RC & Vitrage</span>
          </button>
        </div>

        {/* MODAL CONTENT BODY */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* TAB 1: HARDWARE AUDIT & SIZING */}
          {activeTab === 'hardware_audit' && (
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
                  <ShieldAlert className="w-5 h-5 shrink-0 text-rose-400 mt-0.5" />
                )}
                <div className="flex-1 text-xs">
                  <div className="font-bold text-sm text-white mb-0.5">
                    {auditorResult.verdictTitleFr}
                  </div>
                  <div className="space-y-1">
                    {auditorResult.complianceDefectsFr.length > 0 ? (
                      auditorResult.complianceDefectsFr.map((def, idx) => (
                        <div key={idx} className="opacity-90">
                          • {def}
                        </div>
                      ))
                    ) : (
                      <div>
                        • Tous les critères d espacement, de force mécanique et de vitrage de sécurité sont validés.
                      </div>
                    )}
                    <div className="text-sky-300">
                      • {auditorResult.glazingMatchVerdictFr}
                    </div>
                  </div>
                </div>
              </div>

              {/* INPUT CONTROLS GRID */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* DIMENSIONS BOX */}
                <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
                  <div className="text-xs font-bold text-slate-200 flex items-center justify-between">
                    <span>Dimensions du Châssis (Hors-Tout)</span>
                    <span className="text-[11px] text-rose-400 font-mono">
                      {widthMm} x {heightMm} mm (P = {auditorResult.perimeterMm} mm)
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
                      min={400}
                      max={2600}
                      step={50}
                      value={widthMm}
                      onChange={(e) => setWidthMm(Number(e.target.value))}
                      className="w-full accent-rose-400 cursor-pointer min-h-[30px]"
                    />
                    <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                      <span>400 mm</span>
                      <span>1200 mm</span>
                      <span>1800 mm</span>
                      <span>2600 mm</span>
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
                      min={500}
                      max={2800}
                      step={50}
                      value={heightMm}
                      onChange={(e) => setHeightMm(Number(e.target.value))}
                      className="w-full accent-rose-400 cursor-pointer min-h-[30px]"
                    />
                    <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                      <span>500 mm</span>
                      <span>1400 mm</span>
                      <span>2100 mm</span>
                      <span>2800 mm</span>
                    </div>
                  </div>
                </div>

                {/* TARGET RESISTANCE CLASS BOX */}
                <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
                  <div className="text-xs font-bold text-slate-200 flex items-center justify-between">
                    <span>Classe de Résistance Visée (NF EN 1627)</span>
                    <span className="text-[11px] text-rose-400 font-mono font-bold">
                      {auditorResult.classSpec.label}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-1.5">
                    {(Object.keys(BURGLARY_RESISTANCE_CLASSES) as BurglaryResistanceClass[]).map((cId) => {
                      const isSel = targetClass === cId;
                      const spec = BURGLARY_RESISTANCE_CLASSES[cId];
                      return (
                        <button
                          key={cId}
                          type="button"
                          onClick={() => {
                            playSwitchSound();
                            setTargetClass(cId);
                          }}
                          className={`p-2 rounded-lg border text-left text-xs transition-all cursor-pointer min-h-[44px] flex flex-col justify-center ${
                            isSel
                              ? 'bg-rose-500/20 border-rose-400 text-rose-300 font-bold'
                              : 'bg-slate-800/50 border-slate-700/60 text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          <span className="font-mono">{spec.label}</span>
                          <span className="text-[10px] opacity-75 font-normal truncate">
                            {spec.resistanceTimeMinutes > 0 ? `${spec.resistanceTimeMinutes} min d attaque` : 'Force physique seule'}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* LOCKING HARDWARE DETAILS */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 1. Locking Cam Type */}
                <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
                  <span className="text-xs font-bold text-slate-200 block">Type de Galets / Pênes</span>
                  <div className="space-y-1.5">
                    {(Object.keys(LOCKING_CAM_TYPES) as LockingCamType[]).map((camId) => {
                      const isSel = chosenCamType === camId;
                      const spec = LOCKING_CAM_TYPES[camId];
                      return (
                        <button
                          key={camId}
                          type="button"
                          onClick={() => {
                            playSwitchSound();
                            setChosenCamType(camId);
                          }}
                          className={`w-full p-2.5 rounded-lg border text-left text-xs transition-all cursor-pointer min-h-[44px] ${
                            isSel
                              ? 'bg-rose-500/20 border-rose-400 text-rose-300 font-bold'
                              : 'bg-slate-800/50 border-slate-700/60 text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          <div className="flex justify-between items-center">
                            <span className="font-bold">{spec.nameFr.split('(')[0].trim()}</span>
                            <span className="text-[10px] font-mono text-rose-400">{spec.shearStrengthDaN} daN</span>
                          </div>
                          <span className="text-[10px] opacity-75 font-normal block">
                            {spec.antiPryingFeature}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Number of Points & Security Accessories */}
                <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
                  <span className="text-xs font-bold text-slate-200 block">
                    Points Installés & Accessoires de Sécurité
                  </span>

                  {/* Points slider */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] text-slate-400">
                      <span>Points de Condamnation Installés</span>
                      <span className="font-mono text-rose-300 font-bold">{lockingPointsCount} points</span>
                    </div>
                    <input
                      type="range"
                      min={2}
                      max={14}
                      step={1}
                      value={lockingPointsCount}
                      onChange={(e) => setLockingPointsCount(Number(e.target.value))}
                      className="w-full accent-rose-400 cursor-pointer min-h-[30px]"
                    />
                    <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                      <span>2 (Basique)</span>
                      <span>6 (Standard)</span>
                      <span>10 (Renforcé)</span>
                      <span>14 (Max)</span>
                    </div>
                  </div>

                  {/* Toggles */}
                  <div className="space-y-2 pt-1 border-t border-slate-800">
                    <label className="flex items-center justify-between text-xs cursor-pointer min-h-[36px]">
                      <span className="text-slate-300 flex items-center gap-1.5">
                        <Key className="w-3.5 h-3.5 text-rose-400" />
                        Poignée à Clé / Bouton Sécurité (100 Nm)
                      </span>
                      <input
                        type="checkbox"
                        checked={hasLockingHandleKey}
                        onChange={(e) => setHasLockingHandleKey(e.target.checked)}
                        className="w-4 h-4 accent-rose-400 cursor-pointer"
                      />
                    </label>

                    <label className="flex items-center justify-between text-xs cursor-pointer min-h-[36px]">
                      <span className="text-slate-300 flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-rose-400" />
                        Plaque de Blindage Anti-Perçage Boîtier
                      </span>
                      <input
                        type="checkbox"
                        checked={hasAntiDrillPlate}
                        onChange={(e) => setHasAntiDrillPlate(e.target.checked)}
                        className="w-4 h-4 accent-rose-400 cursor-pointer"
                      />
                    </label>
                  </div>

                  {/* Glazing Selection */}
                  <div className="space-y-1 pt-1 border-t border-slate-800">
                    <span className="text-[11px] text-slate-400 block">Vitrage Installé</span>
                    <select
                      value={currentGlazingType}
                      onChange={(e) => setCurrentGlazingType(e.target.value)}
                      className="w-full p-2 rounded-lg bg-slate-800 border border-slate-700 text-xs font-mono text-slate-200 focus:outline-none focus:border-rose-400 min-h-[44px]"
                    >
                      <option value="Double Vitrage Standard 4/16/4">Double Vitrage Standard 4/16/4 (Non Sécurit)</option>
                      <option value="Feuilleté 44.2 (P4A)">Feuilleté 44.2 Classe P4A (Requis RC2)</option>
                      <option value="Feuilleté Haute Sécurité 55.2 (P5A)">Feuilleté Haute Sécurité 55.2 Classe P5A (Requis RC3)</option>
                      <option value="Verre Blindé Anti-Hache (P6B / P7B)">Verre Blindé Anti-Hache Classe P6B / P7B (Requis RC4)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* LIVE RESULTS METRIC TILES */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {/* Tile 1 */}
                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
                  <span className="text-[11px] text-slate-400 block font-mono">Points Condamnation</span>
                  <span
                    className={`text-lg font-bold font-mono mt-0.5 block ${
                      lockingPointsCount >= auditorResult.recommendedMinLockingPoints
                        ? 'text-emerald-400'
                        : 'text-amber-400'
                    }`}
                  >
                    {lockingPointsCount} / {auditorResult.recommendedMinLockingPoints}
                  </span>
                  <span className="text-[10px] text-slate-500">
                    Min requis classe {auditorResult.classSpec.label}
                  </span>
                </div>

                {/* Tile 2 */}
                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
                  <span className="text-[11px] text-slate-400 block font-mono">Espacement Moyen</span>
                  <span
                    className={`text-lg font-bold font-mono mt-0.5 block ${
                      auditorResult.isSpacingCompliant ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {auditorResult.actualSpacingMm} mm
                  </span>
                  <span className="text-[10px] text-slate-400">
                    Max: {auditorResult.classSpec.maxLockingSpacingMm} mm
                  </span>
                </div>

                {/* Tile 3 */}
                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
                  <span className="text-[11px] text-slate-400 block font-mono">Résistance Statique</span>
                  <span
                    className={`text-lg font-bold font-mono mt-0.5 block ${
                      auditorResult.isStrengthSufficient ? 'text-sky-400' : 'text-rose-400'
                    }`}
                  >
                    {auditorResult.totalResistingForceDaN} daN
                  </span>
                  <span className="text-[10px] text-slate-500">
                    Exigence: {auditorResult.requiredClassForceDaN} daN
                  </span>
                </div>

                {/* Tile 4 */}
                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
                  <span className="text-[11px] text-slate-400 block font-mono">Vitrage NF EN 356</span>
                  <span
                    className={`text-lg font-bold font-mono mt-0.5 block ${
                      auditorResult.isGlazingAligned ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {auditorResult.isGlazingAligned ? 'Conforme' : 'Non Aligné'}
                  </span>
                  <span className="text-[10px] text-slate-500">
                    {auditorResult.classSpec.mandatoryGlazingEn356.split('(')[0].trim()}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SVG ELEVATION & LOCKING BLUEPRINT */}
          {activeTab === 'elevation_blueprint' && (
            <div className="space-y-4">
              {/* SVG BLUEPRINT DIAGRAM */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 relative overflow-hidden flex flex-col items-center justify-center min-h-[340px]">
                <svg
                  viewBox="0 0 800 360"
                  className="w-full h-auto max-h-[340px] select-none"
                >
                  <defs>
                    <pattern id="secGrid" width="20" height="20" patternUnits="userSpaceOnUse">
                      <line x1="0" y1="0" x2="20" y2="0" stroke="#1e293b" strokeWidth="0.5" />
                      <line x1="0" y1="0" x2="0" y2="20" stroke="#1e293b" strokeWidth="0.5" />
                    </pattern>
                  </defs>

                  {/* Background grid */}
                  <rect x="0" y="0" width="800" height="360" fill="url(#secGrid)" />

                  {/* Outer Frame (Dormant) */}
                  <rect
                    x="220"
                    y="30"
                    width="360"
                    height="300"
                    fill="#0f172a"
                    stroke="#475569"
                    strokeWidth="10"
                    rx="4"
                  />

                  {/* Dimensions Callouts */}
                  <text x="400" y="22" fill="#fb7185" fontSize="11" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
                    L = {auditorResult.input.widthMm} mm
                  </text>
                  <text
                    x="200"
                    y="180"
                    fill="#fb7185"
                    fontSize="11"
                    fontWeight="bold"
                    textAnchor="middle"
                    fontFamily="monospace"
                    transform="rotate(-90 200 180)"
                  >
                    H = {auditorResult.input.heightMm} mm
                  </text>

                  {/* Sash Frame (Ouvrant) */}
                  <rect
                    x="240"
                    y="50"
                    width="320"
                    height="260"
                    fill="#1e293b"
                    stroke="#fb7185"
                    strokeWidth="3"
                    rx="3"
                  />

                  {/* Glass Area */}
                  <rect
                    x="260"
                    y="70"
                    width="280"
                    height="220"
                    fill="rgba(56, 189, 248, 0.12)"
                    stroke="#0284c7"
                    strokeWidth="1"
                  />

                  {/* Handle with Key Icon */}
                  <g transform="translate(562, 175)">
                    <rect x="0" y="-12" width="6" height="24" fill="#fbbf24" rx="2" />
                    <circle cx="3" cy="0" r="3" fill="#000" />
                    {hasLockingHandleKey && (
                      <circle cx="3" cy="0" r="1.5" fill="#10b981" />
                    )}
                  </g>

                  {/* Distribute Mushroom Locking Cams along the 4 borders */}
                  {Array.from({ length: lockingPointsCount }).map((_, idx) => {
                    // Position locking points clockwise around sash perimeter
                    const ratio = idx / lockingPointsCount;
                    let ptX = 240;
                    let ptY = 50;

                    if (ratio < 0.25) {
                      // Top edge
                      ptX = 240 + (ratio / 0.25) * 320;
                      ptY = 50;
                    } else if (ratio < 0.5) {
                      // Right edge
                      ptX = 560;
                      ptY = 50 + ((ratio - 0.25) / 0.25) * 260;
                    } else if (ratio < 0.75) {
                      // Bottom edge
                      ptX = 560 - ((ratio - 0.5) / 0.25) * 320;
                      ptY = 310;
                    } else {
                      // Left edge
                      ptX = 240;
                      ptY = 310 - ((ratio - 0.75) / 0.25) * 260;
                    }

                    return (
                      <g key={idx} transform={`translate(${ptX}, ${ptY})`}>
                        {/* Security Keep Backplate */}
                        <circle cx="0" cy="0" r="7" fill="#f43f5e" fillOpacity="0.3" />
                        {/* Mushroom Head Cam */}
                        <circle cx="0" cy="0" r="4.5" fill="#f43f5e" stroke="#fff" strokeWidth="1" />
                        {/* Number */}
                        <text x="0" y="3" fill="#fff" fontSize="7" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
                          {idx + 1}
                        </text>
                      </g>
                    );
                  })}

                  {/* 4 Corner Drives Indicators */}
                  <g fill="#10b981" stroke="#000" strokeWidth="0.5">
                    <polygon points="244,54 254,54 244,64" />
                    <polygon points="556,54 546,54 556,64" />
                    <polygon points="556,306 546,306 556,296" />
                    <polygon points="244,306 254,306 244,296" />
                  </g>
                </svg>
              </div>

              {/* Summary KPIs Row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs space-y-1">
                  <div className="font-bold text-rose-400">Périmètre à Verrouiller</div>
                  <div className="text-slate-300 font-mono text-sm">
                    {auditorResult.perimeterMm} mm
                  </div>
                  <div className="text-[10px] text-slate-500">
                    Espacement effectif entre galets: {auditorResult.actualSpacingMm} mm
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs space-y-1">
                  <div className="font-bold text-rose-400">Type de Pênes & Gâches</div>
                  <div className="text-slate-300 font-mono text-sm">
                    {auditorResult.camSpec.nameFr.split('(')[0].trim()}
                  </div>
                  <div className="text-[10px] text-slate-500">
                    Cisaillement: {auditorResult.camSpec.shearStrengthDaN} daN par point
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs space-y-1">
                  <div className="font-bold text-rose-400">Verre Anti-Effraction</div>
                  <div className="text-slate-300 font-mono text-sm">
                    {auditorResult.classSpec.mandatoryGlazingEn356.split('(')[0].trim()}
                  </div>
                  <div className="text-[10px] text-slate-500">
                    Classification selon norme NF EN 356
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: RC CLASSES & NF EN 1627 GUIDE */}
          {activeTab === 'classes_guide' && (
            <div className="space-y-4">
              {/* Comparative Table */}
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
                <div className="text-xs font-bold text-slate-200">
                  Classification Officielle de Résistance à l'Effraction (NF EN 1627 à 1630)
                </div>

                <div className="space-y-2 text-xs">
                  {(Object.keys(BURGLARY_RESISTANCE_CLASSES) as BurglaryResistanceClass[]).map((cId) => {
                    const spec = BURGLARY_RESISTANCE_CLASSES[cId];
                    const isTarget = targetClass === cId;
                    return (
                      <div
                        key={cId}
                        className={`p-3 rounded-xl border transition-all ${
                          isTarget
                            ? 'bg-rose-500/15 border-rose-400 text-white'
                            : 'bg-slate-950 border-slate-800 text-slate-300'
                        }`}
                      >
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-bold font-mono text-rose-400">{spec.nameFr}</span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                            {spec.resistanceTimeMinutes > 0 ? `${spec.resistanceTimeMinutes} min` : '0 min'}
                          </span>
                        </div>
                        <div className="text-[11px] opacity-85 space-y-0.5">
                          <div><strong>Profil cambrioleur :</strong> {spec.targetAttacker}</div>
                          <div><strong>Outillage testé :</strong> {spec.toolSetFr}</div>
                          <div><strong>Vitrage obligatoire :</strong> {spec.mandatoryGlazingEn356}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Directives Workshop Checklist */}
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
                  <Wrench className="w-4 h-4 text-rose-400" />
                  <span>Prescriptions Atelier et Pose Anti-Effraction</span>
                </div>
                <div className="space-y-1.5 text-xs text-slate-300">
                  {auditorResult.recommendationsFr.map((rec, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <Check className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
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
            Fermer l'Audit
          </button>
        </div>
      </div>
    </div>
  );
};
