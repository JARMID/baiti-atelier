/**
 * Baiti Atelier - Louver & Sunshade Aerodynamic Free Area & Pressure Drop Modal
 * Interactive engineering sizing according to NF EN 13030 / NF DTU 68.3 / Sonelgaz rules
 * Humanizer compliant: exactly 0 em dashes, 0 en dashes.
 */

import React, { useState, useMemo } from 'react';
import {
  X,
  Wind,
  ShieldCheck,
  AlertTriangle,
  FileCheck,
  MessageCircle,
  Check,
  Wrench,
  Maximize2,
  Droplets,
  Sliders,
  Zap,
} from 'lucide-react';
import {
  calculateLouverAerodynamics,
  formatLouverDispatchWhatsApp,
  LOUVER_PROFILE_TYPES,
  LOUVER_SCREENS,
  LOUVER_APPLICATIONS,
  type LouverBladeProfileType,
  type LouverScreenType,
} from '../../utils/louverAerodynamicsManager';
import { generateLouverAerodynamicPdf } from '../../utils/pdfGenerator';
import { playSwitchSound, playTactileClick } from '../../utils/audioFeedback';

export interface LouverAerodynamicsModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialWidth?: number;
  initialHeight?: number;
  windowReference?: string;
  wilayaName?: string;
  clientName?: string;
}

type ActiveTab = 'sizing' | 'elevation' | 'sonelgaz_rules';

export const LouverAerodynamicsModal: React.FC<LouverAerodynamicsModalProps> = ({
  isOpen,
  onClose,
  initialWidth = 1200,
  initialHeight = 1000,
  windowReference = 'Grille Ventilation Façade',
  wilayaName = 'Alger (16)',
  clientName = 'Projet Technique Sonelgaz',
}) => {
  // State hooks called unconditionally
  const [activeTab, setActiveTab] = useState<ActiveTab>('sizing');
  const [widthMm, setWidthMm] = useState<number>(initialWidth);
  const [heightMm, setHeightMm] = useState<number>(initialHeight);
  const [profileType, setProfileType] = useState<LouverBladeProfileType>('standard_45_single');
  const [screenType, setScreenType] = useState<LouverScreenType>('bird_mesh_wire');
  const [airflowM3PerHour, setAirflowM3PerHour] = useState<number>(4500);
  const [applicationId, setApplicationId] = useState<string>('technical_electric_sonelgaz');
  const [isPdfGenerating, setIsPdfGenerating] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Calculation memo
  const calculationResult = useMemo(() => {
    return calculateLouverAerodynamics({
      widthMm,
      heightMm,
      profileType,
      screenType,
      airflowM3PerHour,
      applicationId,
      wilayaName,
      projectRef: windowReference,
    });
  }, [widthMm, heightMm, profileType, screenType, airflowM3PerHour, applicationId, wilayaName, windowReference]);

  if (!isOpen) return null;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleDownloadPdf = async () => {
    try {
      playTactileClick();
      setIsPdfGenerating(true);
      const docId = `BA-LOUV-${Date.now().toString().slice(-6)}`;
      await generateLouverAerodynamicPdf({
        documentId: docId,
        clientName,
        wilayaName,
        projectRef: windowReference,
        widthMm,
        heightMm,
        result: calculationResult,
      });
      showToast('Note technique Aéraulique générée avec succès');
    } catch {
      showToast('Erreur lors de la génération du document PDF');
    } finally {
      setIsPdfGenerating(false);
    }
  };

  const handleSendWhatsApp = () => {
    playTactileClick();
    const text = formatLouverDispatchWhatsApp(calculationResult, clientName, windowReference);
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
            <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400">
              <Wind className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-bold text-white tracking-wide">
                  Grille à Ventelles & Brise-Soleil Aéraulique
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-400 border border-teal-500/30">
                  NF EN 13030
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono">
                Section libre nette, vitesse d air & perte de charge • {calculationResult.appSpec.labelFr}
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
              className="p-2 sm:px-3 sm:py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 transition-all shadow-md cursor-pointer disabled:opacity-50 min-h-[44px]"
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
              setActiveTab('sizing');
            }}
            className={`py-3 px-4 text-xs font-bold font-mono border-b-2 transition-all cursor-pointer min-h-[44px] flex items-center gap-2 ${
              activeTab === 'sizing'
                ? 'border-teal-400 text-teal-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>Aéraulique & Débit</span>
          </button>

          <button
            type="button"
            onClick={() => {
              playSwitchSound();
              setActiveTab('elevation');
            }}
            className={`py-3 px-4 text-xs font-bold font-mono border-b-2 transition-all cursor-pointer min-h-[44px] flex items-center gap-2 ${
              activeTab === 'elevation'
                ? 'border-teal-400 text-teal-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Maximize2 className="w-4 h-4" />
            <span>Élévation SVG & Écoulement</span>
          </button>

          <button
            type="button"
            onClick={() => {
              playSwitchSound();
              setActiveTab('sonelgaz_rules');
            }}
            className={`py-3 px-4 text-xs font-bold font-mono border-b-2 transition-all cursor-pointer min-h-[44px] flex items-center gap-2 ${
              activeTab === 'sonelgaz_rules'
                ? 'border-teal-400 text-teal-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Zap className="w-4 h-4" />
            <span>Prescriptions Sonelgaz & DTU</span>
          </button>
        </div>

        {/* MODAL CONTENT BODY */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* TAB 1: SIZING & AERODYNAMICS */}
          {activeTab === 'sizing' && (
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
                    {calculationResult.velocityStatusTitleFr}
                  </div>
                  <div className="space-y-1">
                    {calculationResult.verdictDetailsFr.map((det, idx) => (
                      <div key={idx} className="opacity-90">
                        • {det}
                      </div>
                    ))}
                    <div className="text-teal-300">
                      • {calculationResult.waterPenetrationVerdictFr}
                    </div>
                  </div>
                </div>
              </div>

              {/* INPUT CONTROLS GRID */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* DIMENSIONS BOX */}
                <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
                  <div className="text-xs font-bold text-slate-200 flex items-center justify-between">
                    <span>Dimensions de la Grille (Hors-Tout)</span>
                    <span className="text-[11px] text-teal-400 font-mono">
                      {widthMm} x {heightMm} mm ({calculationResult.grossAreaM2.toFixed(3)} m²)
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
                      min={400}
                      max={3000}
                      step={50}
                      value={widthMm}
                      onChange={(e) => setWidthMm(Number(e.target.value))}
                      className="w-full accent-teal-400 cursor-pointer min-h-[30px]"
                    />
                    <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                      <span>400 mm</span>
                      <span>1200 mm</span>
                      <span>2000 mm</span>
                      <span>3000 mm</span>
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
                      min={400}
                      max={3000}
                      step={50}
                      value={heightMm}
                      onChange={(e) => setHeightMm(Number(e.target.value))}
                      className="w-full accent-teal-400 cursor-pointer min-h-[30px]"
                    />
                    <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                      <span>400 mm</span>
                      <span>1000 mm</span>
                      <span>2000 mm</span>
                      <span>3000 mm</span>
                    </div>
                  </div>
                </div>

                {/* AIRFLOW & APPLICATION BOX */}
                <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
                  <div className="text-xs font-bold text-slate-200 flex items-center justify-between">
                    <span>Débit Volumique Requis (CVC)</span>
                    <span className="text-[11px] text-teal-400 font-mono">
                      {airflowM3PerHour.toLocaleString('fr-FR')} m³/h
                    </span>
                  </div>

                  {/* Airflow slider */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] text-slate-400">
                      <span>Débit d'Air Q</span>
                      <span className="font-mono text-slate-300">{airflowM3PerHour} m³/h</span>
                    </div>
                    <input
                      type="range"
                      min={500}
                      max={25000}
                      step={250}
                      value={airflowM3PerHour}
                      onChange={(e) => setAirflowM3PerHour(Number(e.target.value))}
                      className="w-full accent-teal-400 cursor-pointer min-h-[30px]"
                    />
                    <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                      <span>500 m³/h</span>
                      <span>5 000 m³/h</span>
                      <span>15 000 m³/h</span>
                      <span>25 000 m³/h</span>
                    </div>
                  </div>

                  {/* Application selection */}
                  <div className="space-y-1">
                    <span className="text-[11px] text-slate-400 block">Affectation du Local</span>
                    <select
                      value={applicationId}
                      onChange={(e) => setApplicationId(e.target.value)}
                      className="w-full p-2 rounded-lg bg-slate-800 border border-slate-700 text-xs font-mono text-slate-200 focus:outline-none focus:border-teal-400 min-h-[44px]"
                    >
                      {LOUVER_APPLICATIONS.map((app) => (
                        <option key={app.id} value={app.id}>
                          {app.labelFr} (max {app.maxAirVelocityMPerSec} m/s)
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* LOUVER PROFILE & SCREEN SELECTION */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 1. Louver Blade Profile */}
                <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
                  <span className="text-xs font-bold text-slate-200 block">Profil de Lames à Ventelles</span>
                  <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                    {(Object.keys(LOUVER_PROFILE_TYPES) as LouverBladeProfileType[]).map((pId) => {
                      const isSel = profileType === pId;
                      const spec = LOUVER_PROFILE_TYPES[pId];
                      return (
                        <button
                          key={pId}
                          type="button"
                          onClick={() => {
                            playSwitchSound();
                            setProfileType(pId);
                          }}
                          className={`w-full p-2 rounded-lg border text-left text-xs transition-all cursor-pointer min-h-[44px] ${
                            isSel
                              ? 'bg-teal-500/20 border-teal-400 text-teal-300 font-bold'
                              : 'bg-slate-800/50 border-slate-700/60 text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          <div className="flex justify-between items-center">
                            <span className="font-bold">{spec.nameFr.split('(')[0].trim()}</span>
                            <span className="text-[10px] font-mono text-teal-400">Pas {spec.bladePitchMm} mm</span>
                          </div>
                          <span className="text-[10px] opacity-75 font-normal block truncate">
                            {spec.waterRejectionClass} • Ce = {spec.dischargeCoefficientCe}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Protection Screen */}
                <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
                  <span className="text-xs font-bold text-slate-200 block">Grillage & Moustiquaire</span>
                  <div className="space-y-1.5">
                    {(Object.keys(LOUVER_SCREENS) as LouverScreenType[]).map((sId) => {
                      const isSel = screenType === sId;
                      const spec = LOUVER_SCREENS[sId];
                      return (
                        <button
                          key={sId}
                          type="button"
                          onClick={() => {
                            playSwitchSound();
                            setScreenType(sId);
                          }}
                          className={`w-full p-2.5 rounded-lg border text-left text-xs transition-all cursor-pointer min-h-[44px] ${
                            isSel
                              ? 'bg-teal-500/20 border-teal-400 text-teal-300 font-bold'
                              : 'bg-slate-800/50 border-slate-700/60 text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          <div className="flex justify-between items-center">
                            <span className="font-bold">{spec.nameFr.split('(')[0].trim()}</span>
                            <span className="text-[10px] font-mono text-teal-400">x{spec.freeAreaFactor}</span>
                          </div>
                          <span className="text-[10px] opacity-75 font-normal block">
                            {spec.descriptionFr}
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
                  <span className="text-[11px] text-slate-400 block font-mono">Section Libre Nette</span>
                  <span className="text-lg font-bold text-teal-400 font-mono mt-0.5 block">
                    {calculationResult.geometricFreeAreaPercent}%
                  </span>
                  <span className="text-[10px] text-slate-500">
                    {calculationResult.geometricFreeAreaM2.toFixed(3)} m² libre
                  </span>
                </div>

                {/* Tile 2 */}
                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
                  <span className="text-[11px] text-slate-400 block font-mono">Vitesse Frontale</span>
                  <span
                    className={`text-lg font-bold font-mono mt-0.5 block ${
                      calculationResult.isAirVelocityCompliant ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {calculationResult.faceVelocityMPerSec} m/s
                  </span>
                  <span className="text-[10px] text-slate-400">
                    Limite: {calculationResult.appSpec.maxAirVelocityMPerSec} m/s
                  </span>
                </div>

                {/* Tile 3 */}
                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
                  <span className="text-[11px] text-slate-400 block font-mono">Perte de Charge</span>
                  <span className="text-lg font-bold text-sky-400 font-mono mt-0.5 block">
                    {calculationResult.pressureDropPa} Pa
                  </span>
                  <span className="text-[10px] text-slate-500">
                    Delta P statique
                  </span>
                </div>

                {/* Tile 4 */}
                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
                  <span className="text-[11px] text-slate-400 block font-mono">Nombre de Lames</span>
                  <span className="text-lg font-bold text-amber-400 font-mono mt-0.5 block">
                    {calculationResult.bladeCount}
                  </span>
                  <span className="text-[10px] text-slate-500">
                    Longueur {calculationResult.bladeLengthMm} mm
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SVG ELEVATION & AIRFLOW STREAM */}
          {activeTab === 'elevation' && (
            <div className="space-y-4">
              {/* SVG BLUEPRINT DIAGRAM */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 relative overflow-hidden flex flex-col items-center justify-center min-h-[340px]">
                <svg
                  viewBox="0 0 800 360"
                  className="w-full h-auto max-h-[340px] select-none"
                >
                  <defs>
                    <pattern id="louverGrid" width="20" height="20" patternUnits="userSpaceOnUse">
                      <line x1="0" y1="0" x2="20" y2="0" stroke="#1e293b" strokeWidth="0.5" />
                      <line x1="0" y1="0" x2="0" y2="20" stroke="#1e293b" strokeWidth="0.5" />
                    </pattern>
                    <marker id="airArrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                      <path d="M 0 1 L 10 5 L 0 9 z" fill="#38bdf8" />
                    </marker>
                  </defs>

                  {/* Background grid */}
                  <rect x="0" y="0" width="800" height="360" fill="url(#louverGrid)" />

                  {/* Outer Frame (Dormant Grille) */}
                  <rect
                    x="200"
                    y="30"
                    width="400"
                    height="300"
                    fill="#0f172a"
                    stroke="#475569"
                    strokeWidth="12"
                    rx="4"
                  />

                  {/* Dimensions Callouts */}
                  <text x="400" y="22" fill="#2dd4bf" fontSize="11" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
                    Largeur = {calculationResult.input.widthMm} mm
                  </text>
                  <text
                    x="180"
                    y="180"
                    fill="#2dd4bf"
                    fontSize="11"
                    fontWeight="bold"
                    textAnchor="middle"
                    fontFamily="monospace"
                    transform="rotate(-90 180 180)"
                  >
                    Hauteur = {calculationResult.input.heightMm} mm
                  </text>

                  {/* Louver Blades Render (Simulating up to 14 slats for display) */}
                  {Array.from({ length: Math.min(calculationResult.bladeCount, 14) }).map((_, idx) => {
                    const count = Math.min(calculationResult.bladeCount, 14);
                    const slatY = 48 + (idx * 270) / count;
                    const isChevron = profileType === 'double_chevron_rainproof';

                    return (
                      <g key={idx}>
                        {isChevron ? (
                          // Double chevron V-shape blade
                          <polyline
                            points={`212,${slatY + 12} 390,${slatY} 588,${slatY + 12}`}
                            fill="none"
                            stroke="#0d9488"
                            strokeWidth="5"
                            strokeLinecap="round"
                          />
                        ) : (
                          // Standard 45 deg or drainable blade
                          <g>
                            <line
                              x1="212"
                              y1={slatY}
                              x2="588"
                              y2={slatY}
                              stroke="#0d9488"
                              strokeWidth="6"
                              strokeLinecap="round"
                            />
                            <line
                              x1="212"
                              y1={slatY + 5}
                              x2="588"
                              y2={slatY + 8}
                              stroke="#14b8a6"
                              strokeWidth="2"
                              strokeLinecap="round"
                            />
                          </g>
                        )}
                      </g>
                    );
                  })}

                  {/* Airflow Stream Vectors */}
                  <g opacity="0.8">
                    <line x1="70" y1="90" x2="180" y2="90" stroke="#38bdf8" strokeWidth="2.5" markerEnd="url(#airArrow)" />
                    <line x1="70" y1="180" x2="180" y2="180" stroke="#38bdf8" strokeWidth="2.5" markerEnd="url(#airArrow)" />
                    <line x1="70" y1="270" x2="180" y2="270" stroke="#38bdf8" strokeWidth="2.5" markerEnd="url(#airArrow)" />
                    <text x="110" y="78" fill="#38bdf8" fontSize="10" fontWeight="bold" fontFamily="monospace">
                      V_face = {calculationResult.faceVelocityMPerSec} m/s
                    </text>
                  </g>

                  {/* Deflected Rain Droplets */}
                  <g opacity="0.6">
                    <circle cx="170" cy="115" r="3" fill="#60a5fa" />
                    <circle cx="160" cy="140" r="3" fill="#60a5fa" />
                    <circle cx="175" cy="210" r="3" fill="#60a5fa" />
                    <text x="620" y="180" fill="#94a3b8" fontSize="10" fontFamily="monospace">
                      {calculationResult.profileSpec.waterRejectionClass}
                    </text>
                  </g>
                </svg>
              </div>

              {/* Summary KPIs Row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs space-y-1">
                  <div className="font-bold text-teal-400">Coefficient Décharge Ce</div>
                  <div className="text-slate-300 font-mono text-sm">
                    {calculationResult.profileSpec.dischargeCoefficientCe}
                  </div>
                  <div className="text-[10px] text-slate-500">
                    Surface aeraulique effective: {calculationResult.effectiveAeroAreaM2.toFixed(3)} m2
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs space-y-1">
                  <div className="font-bold text-teal-400">Vitesse Gorge des Lames</div>
                  <div className="text-slate-300 font-mono text-sm">
                    {calculationResult.freeAreaVelocityMPerSec} m/s
                  </div>
                  <div className="text-[10px] text-slate-500">
                    Vitesse reelle au passage de la section libre
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs space-y-1">
                  <div className="font-bold text-teal-400">Protection contre la Pluie</div>
                  <div className="text-slate-300 font-mono text-sm">
                    {calculationResult.profileSpec.waterRejectionClass.split('(')[0].trim()}
                  </div>
                  <div className="text-[10px] text-slate-500">
                    Norme NF EN 13030 sous vent et pluie battante
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: SONELGAZ & DTU RULES */}
          {activeTab === 'sonelgaz_rules' && (
            <div className="space-y-4">
              {/* Prescriptions Sonelgaz Card */}
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-teal-400">
                  <Zap className="w-4 h-4 text-teal-400" />
                  <span>Cahier des Prescriptions Techniques Sonelgaz (Postes MT/BT)</span>
                </div>
                <div className="space-y-2 text-xs text-slate-300">
                  <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-teal-400 shrink-0 mt-0.5" />
                    <span>
                      <strong>Ventilation Haute et Basse :</strong> Tout local transformateur doit comporter une prise d air neuf en partie basse (H = 200 mm du sol fini) et un rejet d air chaud en partie haute opposée pour favoriser le tirage thermique naturel.
                    </span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-teal-400 shrink-0 mt-0.5" />
                    <span>
                      <strong>Vitesse d Air Maximale :</strong> La vitesse frontale ne doit pas excéder 1.8 m/s afin d empêcher l aspiration de poussières de sable et la pénétration de pluie orageuse vers les têtes de câbles haute tension.
                    </span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-teal-400 shrink-0 mt-0.5" />
                    <span>
                      <strong>Mise à la Terre Équipotentielle :</strong> Le cadre aluminium doit être relié au ceinturon de terre général du poste par une tresse en cuivre étamé 25 mm² fixée par cosse à œil inox M8.
                    </span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-teal-400 shrink-0 mt-0.5" />
                    <span>
                      <strong>Grillage Anti-Rongeurs :</strong> Grillage galvanisé ou inox à mailles carrées 10x10 mm ou 12x12 mm obligatoire pour interdire l intrusion de rongeurs et oiseaux dans l enceinte sous tension.
                    </span>
                  </div>
                </div>
              </div>

              {/* Workshop Directives */}
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
                  <Wrench className="w-4 h-4 text-teal-400" />
                  <span>Directives de Fabrication et Montage en Atelier</span>
                </div>
                <div className="space-y-1.5 text-xs text-slate-300">
                  {calculationResult.recommendationsFr.map((rec, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <Droplets className="w-3.5 h-3.5 text-teal-400 shrink-0 mt-0.5" />
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
