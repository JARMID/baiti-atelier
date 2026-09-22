/**
 * Baiti Atelier - Glazing Thermal Stress & Solar Breakage Modal
 * Normative references: NF DTU 39 P3 / CSTB Cahier 3488 / DTR C3-2
 * Humanizer compliant: exactly 0 em dashes, 0 en dashes.
 */

import React, { useState, useMemo } from 'react';
import {
  Flame,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  FileCheck,
  MessageCircle,
  X,
  Compass,
  Thermometer,
  HelpCircle,
  Check,
  Info,
  ChevronRight,
} from 'lucide-react';
import type { GlassType } from '../../types/window';
import { GLASS_SPECIFICATIONS } from '../../utils/glassSpecifications';
import {
  calculateGlazingThermalStress,
  formatThermalStressWhatsApp,
  CLIMATIC_ZONES,
  ORIENTATIONS,
  EXTERIOR_SHADINGS,
  INTERIOR_OBSTRUCTIONS,
  EDGE_FINISHINGS,
  THERMAL_TREATMENTS,
  FRAME_PROFILES,
  type ThermalClimaticZone,
  type ExposureOrientation,
  type ExteriorShading,
  type InteriorObstruction,
  type EdgeFinishing,
  type ThermalTreatment,
  type FrameProfileType,
} from '../../utils/glazingThermalStressManager';
import { generateThermalStressNoticePdf } from '../../utils/pdfGenerator';
import { playSwitchSound, playTactileClick } from '../../utils/audioFeedback';

export interface GlazingThermalStressModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultGlassType?: GlassType;
  widthMm?: number;
  heightMm?: number;
  windowReference?: string;
  wilayaName?: string;
  clientName?: string;
}

type ActiveTab = 'simulator' | 'normative' | 'dispatch';

export const GlazingThermalStressModal: React.FC<GlazingThermalStressModalProps> = ({
  isOpen,
  onClose,
  defaultGlassType = 'double_clear',
  widthMm = 1200,
  heightMm = 1400,
  windowReference = 'Fenetre Salon F-01',
  wilayaName = 'Alger (16)',
  clientName = 'Client Particulier',
}) => {
  // State hooks called unconditionally
  const [activeTab, setActiveTab] = useState<ActiveTab>('simulator');
  const [selectedGlass, setSelectedGlass] = useState<GlassType>(defaultGlassType);
  const [selectedZone, setSelectedZone] = useState<ThermalClimaticZone>('zone_a');
  const [selectedOrientation, setSelectedOrientation] = useState<ExposureOrientation>('south_west');
  const [selectedShading, setSelectedShading] = useState<ExteriorShading>('partial_shutter');
  const [selectedObstruction, setSelectedObstruction] = useState<InteriorObstruction>('dark_blind_close');
  const [selectedEdge, setSelectedEdge] = useState<EdgeFinishing>('cut_raw');
  const [selectedTreatment, setSelectedTreatment] = useState<ThermalTreatment>('annealed');
  const [selectedFrame, setSelectedFrame] = useState<FrameProfileType>('thermal_break_alu');
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [showToast, setShowToast] = useState<string | null>(null);

  // Compute thermal stress analysis
  const analysis = useMemo(() => {
    return calculateGlazingThermalStress({
      glassType: selectedGlass,
      zone: selectedZone,
      orientation: selectedOrientation,
      exteriorShading: selectedShading,
      interiorObstruction: selectedObstruction,
      edgeFinishing: selectedEdge,
      thermalTreatment: selectedTreatment,
      frameProfile: selectedFrame,
      paneWidthMm: widthMm,
      paneHeightMm: heightMm,
    });
  }, [
    selectedGlass,
    selectedZone,
    selectedOrientation,
    selectedShading,
    selectedObstruction,
    selectedEdge,
    selectedTreatment,
    selectedFrame,
    widthMm,
    heightMm,
  ]);

  if (!isOpen) return null;

  const glassSpec = GLASS_SPECIFICATIONS[selectedGlass] || GLASS_SPECIFICATIONS.double_clear;

  const handleTabChange = (tab: ActiveTab) => {
    playSwitchSound();
    setActiveTab(tab);
  };

  const handleGeneratePdf = async () => {
    playTactileClick();
    setIsGeneratingPdf(true);
    try {
      const documentId = `TH-STRESS-${Date.now().toString().slice(-6)}`;
      await generateThermalStressNoticePdf({
        documentId,
        projectOrClientName: clientName,
        locationWilaya: wilayaName,
        windowReference,
        glassLabelFr: glassSpec.labelFr,
        widthMm,
        heightMm,
        result: analysis,
      });
      setShowToast('Fiche de contrôle thermique générée avec succès');
      setTimeout(() => setShowToast(null), 3500);
    } catch (err) {
      console.error(err);
      setShowToast('Erreur lors de la génération du document PDF');
      setTimeout(() => setShowToast(null), 3500);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleWhatsAppDispatch = () => {
    playTactileClick();
    const message = formatThermalStressWhatsApp(
      analysis,
      glassSpec.labelFr,
      `${windowReference} (${widthMm} x ${heightMm} mm)`,
      'Baiti Atelier'
    );
    const encoded = encodeURIComponent(message);
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl max-h-[92vh] flex flex-col rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3.5 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold tracking-tight text-white">
                  Contrôle Choc Thermique & Casse Solaire
                </h2>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                  NF DTU 39 P3
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Evaluation du gradient thermique et seuil critique selon CSTB 3488 et DTR C3-2
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              playTactileClick();
              onClose();
            }}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Segmented Tabs */}
        <div className="grid grid-cols-3 p-1.5 mx-4 mt-3 bg-slate-950/60 rounded-xl border border-slate-800/80">
          <button
            onClick={() => handleTabChange('simulator')}
            className={`flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'simulator'
                ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Thermometer className="w-3.5 h-3.5" />
            Simulateur Risque
          </button>
          <button
            onClick={() => handleTabChange('normative')}
            className={`flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'normative'
                ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            Règles DTU 39
          </button>
          <button
            onClick={() => handleTabChange('dispatch')}
            className={`flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'dispatch'
                ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileCheck className="w-3.5 h-3.5" />
            Avis & Fiche PDF
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
          {/* TAB 1: SIMULATOR */}
          {activeTab === 'simulator' && (
            <div className="space-y-4">
              {/* Dynamic Verdict Gauge Card */}
              <div
                className={`p-4 rounded-xl border ${analysis.badgeBorderClass} ${analysis.badgeBgClass} transition-all`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    {analysis.isCompliant ? (
                      <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        <ShieldCheck className="w-6 h-6" />
                      </div>
                    ) : (
                      <div className="p-2.5 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30 animate-pulse">
                        <ShieldAlert className="w-6 h-6" />
                      </div>
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-bold uppercase tracking-wider ${analysis.badgeTextClass}`}>
                          {analysis.statusBadgeFr}
                        </span>
                      </div>
                      <div className="text-xl font-black text-white mt-0.5">
                        Gradient réel : {analysis.deltaTActualK} K{' '}
                        <span className="text-xs font-normal text-slate-300">
                          / Seuil limite : {analysis.deltaTCritK} K
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end justify-between border-t sm:border-t-0 border-slate-700/50 pt-2 sm:pt-0">
                    <span className="text-xs text-slate-400">Ratio de contrainte (R)</span>
                    <span
                      className={`text-2xl font-black ${
                        analysis.safetyRatio >= 1.0
                          ? 'text-rose-400'
                          : analysis.safetyRatio >= 0.8
                          ? 'text-amber-400'
                          : 'text-emerald-400'
                      }`}
                    >
                      {analysis.safetyRatio.toFixed(2)}
                      <span className="text-xs text-slate-400 font-normal"> / 1.00</span>
                    </span>
                  </div>
                </div>

                {/* Progress Visual Bar */}
                <div className="mt-3">
                  <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden p-0.5 flex">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        analysis.safetyRatio >= 1.0
                          ? 'bg-rose-500'
                          : analysis.safetyRatio >= 0.8
                          ? 'bg-amber-400'
                          : 'bg-emerald-400'
                      }`}
                      style={{ width: `${Math.min(100, analysis.safetyRatio * 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                    <span>0.00 (Sécurisé)</span>
                    <span className="text-amber-400 font-semibold">0.80 (Vigilance)</span>
                    <span className="text-rose-400 font-bold">1.00 (Rupture DTU 39)</span>
                  </div>
                </div>

                {/* Tempering Mandatory Callout */}
                {analysis.temperingMandatory && (
                  <div className="mt-3 p-2.5 rounded-lg bg-rose-950/60 border border-rose-500/40 text-xs text-rose-200 flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-rose-300">TREMPE THERMIQUE OBLIGATOIRE : </span>
                      Sous ces conditions d ensoleillement et d ombrage, un vitrage recuit subira une casse spontanée en atelier ou sur site. Prescrire impérativement du verre trempé thermique Sécurit (ESG).
                    </div>
                  </div>
                )}
              </div>

              {/* Thermal Heatmap & Cross Section Schematic */}
              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <Thermometer className="w-3.5 h-3.5 text-amber-400" />
                    Coupe Feuillure & Répartition des Températures
                  </span>
                  <span className="text-[10px] text-slate-400">
                    Flux solaire effectif : {analysis.solarIrradianceEffective} W/m²
                  </span>
                </div>

                <div className="relative w-full h-32 rounded-lg bg-slate-900 border border-slate-800 overflow-hidden flex items-center justify-center p-2">
                  {/* SVG Cross Section Diagram */}
                  <svg viewBox="0 0 460 110" className="w-full h-full">
                    {/* Background frame outline */}
                    <rect x="10" y="10" width="70" height="90" fill="#334155" rx="4" stroke="#475569" strokeWidth="1.5" />
                    <text x="45" y="45" fill="#94a3b8" fontSize="8" fontWeight="bold" textAnchor="middle">
                      Profilé Alu
                    </text>
                    <text x="45" y="60" fill="#cbd5e1" fontSize="7" textAnchor="middle">
                      {selectedFrame === 'thermal_break_alu' ? 'RPT 24mm' : selectedFrame === 'cold_alu' ? 'Alu Froid' : 'PVC 5 Ch.'}
                    </text>

                    {/* Rebate Pocket */}
                    <rect x="75" y="25" width="20" height="60" fill="#1e293b" stroke="#3b82f6" strokeWidth="1" strokeDasharray="2 2" />
                    
                    {/* Setting Block Calage */}
                    <rect x="76" y="80" width="18" height="5" fill="#eab308" rx="1" />
                    <text x="85" y="93" fill="#eab308" fontSize="6" textAnchor="middle">Cale assise</text>

                    {/* Glass Pane running horizontally */}
                    {/* Edge inside rebate (cooler) */}
                    <rect x="80" y="32" width="40" height="46" fill="#38bdf8" fillOpacity="0.4" stroke="#38bdf8" strokeWidth="1.5" />
                    
                    {/* Gradient transition zone */}
                    <defs>
                      <linearGradient id="thermalGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.6" />
                        <stop offset="35%" stopColor="#fbbf24" stopOpacity="0.8" />
                        <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.95" />
                      </linearGradient>
                    </defs>
                    <rect x="120" y="32" width="280" height="46" fill="url(#thermalGrad)" stroke="#f43f5e" strokeWidth="1.5" />

                    {/* Overhang / Shading Line if applicable */}
                    {selectedShading !== 'none' && (
                      <g>
                        <path d="M 170 10 L 210 100" stroke="#0ea5e9" strokeWidth="1.5" strokeDasharray="3 3" />
                        <text x="215" y="22" fill="#38bdf8" fontSize="7" fontWeight="bold">Ligne d ombre ({selectedShading})</text>
                      </g>
                    )}

                    {/* Temperature Labels */}
                    {/* Edge Temperature */}
                    <circle cx="95" cy="55" r="3" fill="#0284c7" />
                    <text x="95" y="23" fill="#38bdf8" fontSize="8" fontWeight="bold" textAnchor="middle">
                      T° Bord
                    </text>
                    <text x="95" y="15" fill="#ffffff" fontSize="9" fontWeight="bold" textAnchor="middle">
                      {analysis.estimatedEdgeTempC}°C
                    </text>

                    {/* Center Solar Temperature */}
                    <circle cx="320" cy="55" r="3" fill="#e11d48" />
                    <text x="320" y="23" fill="#f87171" fontSize="8" fontWeight="bold" textAnchor="middle">
                      T° Centre (Plein Soleil)
                    </text>
                    <text x="320" y="15" fill="#ffffff" fontSize="9" fontWeight="bold" textAnchor="middle">
                      {analysis.estimatedCenterTempC}°C
                    </text>

                    {/* Thermal Crack Schematic if not compliant */}
                    {!analysis.isCompliant && (
                      <g>
                        {/* Crack starting 90 degrees from rebate edge and branching */}
                        <path d="M 120 40 L 140 40 L 155 35 M 140 40 L 160 48" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
                        <text x="145" y="70" fill="#fca5a5" fontSize="6.5" fontWeight="bold">
                          Amorce fissure 90°
                        </text>
                      </g>
                    )}
                  </svg>
                </div>
              </div>

              {/* Simulation Selectors Grid */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Paramètres de l'Ouvrage et Environnement
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {/* Vitrage Type */}
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1.5">
                    <label className="font-semibold text-slate-300 flex items-center justify-between">
                      <span>Type de Vitrage</span>
                      <span className="text-[10px] text-amber-400">
                        Abs. {Math.round(analysis.glassProperties.solarAbsorption * 100)}%
                      </span>
                    </label>
                    <select
                      value={selectedGlass}
                      onChange={(e) => {
                        playSwitchSound();
                        setSelectedGlass(e.target.value as GlassType);
                      }}
                      className="w-full px-2.5 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 text-xs focus:ring-1 focus:ring-amber-400 focus:outline-none"
                    >
                      <option value="simple_clear">Simple Vitrage Clair 6 mm</option>
                      <option value="double_clear">Double Vitrage 4/16/4 Standard</option>
                      <option value="double_argon_warmedge">4/16/4 Argon + Warm-Edge (Low-E)</option>
                      <option value="stop_sol">Stop-Sol Réfléchissant Anti-Chaleur</option>
                      <option value="sable">Vitrage Sablé Dépoli Intimité</option>
                      <option value="phonique_stadip">Feuilleté Phonique Stadip Silence</option>
                      <option value="securit_tempered">Verre Trempé Sécurit 8 mm</option>
                    </select>
                    <p className="text-[10px] text-slate-400 leading-tight">
                      {analysis.glassProperties.tradeObservationFr}
                    </p>
                  </div>

                  {/* Climatic Zone DTR */}
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1.5">
                    <label className="font-semibold text-slate-300 flex items-center justify-between">
                      <span>Zone Climatique DTR</span>
                      <span className="text-[10px] text-slate-400">
                        {analysis.climaticZoneData.maxSummerTempC}°C Max
                      </span>
                    </label>
                    <select
                      value={selectedZone}
                      onChange={(e) => {
                        playSwitchSound();
                        setSelectedZone(e.target.value as ThermalClimaticZone);
                      }}
                      className="w-full px-2.5 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 text-xs focus:ring-1 focus:ring-amber-400 focus:outline-none"
                    >
                      {Object.values(CLIMATIC_ZONES).map((z) => (
                        <option key={z.id} value={z.id}>
                          {z.nameFr} ({z.code})
                        </option>
                      ))}
                    </select>
                    <p className="text-[10px] text-slate-400 leading-tight">
                      {analysis.climaticZoneData.wilayasRepresentativeFr}
                    </p>
                  </div>

                  {/* Orientation */}
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1.5">
                    <label className="font-semibold text-slate-300 flex items-center gap-1.5">
                      <Compass className="w-3.5 h-3.5 text-amber-400" />
                      Orientation Façade
                    </label>
                    <select
                      value={selectedOrientation}
                      onChange={(e) => {
                        playSwitchSound();
                        setSelectedOrientation(e.target.value as ExposureOrientation);
                      }}
                      className="w-full px-2.5 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 text-xs focus:ring-1 focus:ring-amber-400 focus:outline-none"
                    >
                      {Object.values(ORIENTATIONS).map((o) => (
                        <option key={o.id} value={o.id}>
                          {o.labelFr}
                        </option>
                      ))}
                    </select>
                    <p className="text-[10px] text-slate-400 leading-tight">
                      {analysis.orientationData.riskFactorCommentFr}
                    </p>
                  </div>

                  {/* Exterior Shading */}
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1.5">
                    <label className="font-semibold text-slate-300 flex items-center justify-between">
                      <span>Ombrage Extérieur</span>
                      <span className="text-[10px] text-slate-400">
                        x{analysis.shadingData.gradientMultiplier}
                      </span>
                    </label>
                    <select
                      value={selectedShading}
                      onChange={(e) => {
                        playSwitchSound();
                        setSelectedShading(e.target.value as ExteriorShading);
                      }}
                      className="w-full px-2.5 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 text-xs focus:ring-1 focus:ring-amber-400 focus:outline-none"
                    >
                      {Object.values(EXTERIOR_SHADINGS).map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.labelFr}
                        </option>
                      ))}
                    </select>
                    <p className="text-[10px] text-slate-400 leading-tight">
                      {analysis.shadingData.descriptionFr}
                    </p>
                  </div>

                  {/* Interior Obstruction */}
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1.5">
                    <label className="font-semibold text-slate-300 flex items-center justify-between">
                      <span>Confinement Intérieur</span>
                      <span className="text-[10px] text-amber-400">
                        +{analysis.interiorObstructionData.deltaTAddK} K
                      </span>
                    </label>
                    <select
                      value={selectedObstruction}
                      onChange={(e) => {
                        playSwitchSound();
                        setSelectedObstruction(e.target.value as InteriorObstruction);
                      }}
                      className="w-full px-2.5 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 text-xs focus:ring-1 focus:ring-amber-400 focus:outline-none"
                    >
                      {Object.values(INTERIOR_OBSTRUCTIONS).map((obs) => (
                        <option key={obs.id} value={obs.id}>
                          {obs.labelFr}
                        </option>
                      ))}
                    </select>
                    <p className="text-[10px] text-slate-400 leading-tight">
                      {analysis.interiorObstructionData.descriptionFr}
                    </p>
                  </div>

                  {/* Edge Finishing */}
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1.5">
                    <label className="font-semibold text-slate-300 flex items-center justify-between">
                      <span>Façonnage des Chants</span>
                      <span className="text-[10px] text-emerald-400">
                        Seuil {analysis.edgeFinishingData.deltaTCritAnnealedK} K
                      </span>
                    </label>
                    <select
                      value={selectedEdge}
                      onChange={(e) => {
                        playSwitchSound();
                        setSelectedEdge(e.target.value as EdgeFinishing);
                      }}
                      className="w-full px-2.5 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 text-xs focus:ring-1 focus:ring-amber-400 focus:outline-none"
                    >
                      {Object.values(EDGE_FINISHINGS).map((ef) => (
                        <option key={ef.id} value={ef.id}>
                          {ef.labelFr}
                        </option>
                      ))}
                    </select>
                    <p className="text-[10px] text-slate-400 leading-tight">
                      {analysis.edgeFinishingData.descriptionFr}
                    </p>
                  </div>

                  {/* Thermal Treatment */}
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1.5">
                    <label className="font-semibold text-slate-300 flex items-center justify-between">
                      <span>Traitement Thermique</span>
                      <span className="text-[10px] text-cyan-400">
                        {analysis.thermalTreatmentData.deltaTCritK} K
                      </span>
                    </label>
                    <select
                      value={selectedTreatment}
                      onChange={(e) => {
                        playSwitchSound();
                        setSelectedTreatment(e.target.value as ThermalTreatment);
                      }}
                      className="w-full px-2.5 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 text-xs focus:ring-1 focus:ring-amber-400 focus:outline-none"
                    >
                      {Object.values(THERMAL_TREATMENTS).map((tt) => (
                        <option key={tt.id} value={tt.id}>
                          {tt.labelFr}
                        </option>
                      ))}
                    </select>
                    <p className="text-[10px] text-slate-400 leading-tight">
                      {analysis.thermalTreatmentData.tradeUsageFr}
                    </p>
                  </div>

                  {/* Frame Profile */}
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1.5">
                    <label className="font-semibold text-slate-300">Profil Menuiserie</label>
                    <select
                      value={selectedFrame}
                      onChange={(e) => {
                        playSwitchSound();
                        setSelectedFrame(e.target.value as FrameProfileType);
                      }}
                      className="w-full px-2.5 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 text-xs focus:ring-1 focus:ring-amber-400 focus:outline-none"
                    >
                      {Object.values(FRAME_PROFILES).map((fp) => (
                        <option key={fp.id} value={fp.id}>
                          {fp.labelFr}
                        </option>
                      ))}
                    </select>
                    <p className="text-[10px] text-slate-400 leading-tight">
                      {analysis.frameProfileData.descriptionFr}
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
                <button
                  onClick={handleGeneratePdf}
                  disabled={isGeneratingPdf}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white text-xs font-semibold shadow-sm transition-all"
                >
                  <FileCheck className="w-4 h-4 text-emerald-400" />
                  {isGeneratingPdf ? 'Génération...' : 'Exporter Fiche Technique PDF'}
                </button>
                <button
                  onClick={handleWhatsAppDispatch}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm transition-all"
                >
                  <MessageCircle className="w-4 h-4" />
                  Transmettre WhatsApp
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: NORMATIVE DTU 39 */}
          {activeTab === 'normative' && (
            <div className="space-y-4 text-xs">
              {/* Normative Reference Header */}
              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-amber-400 font-bold">
                  <Info className="w-4 h-4" />
                  Cadre Réglementaire DTU 39 P3 & CSTB Cahier 3488
                </div>
                <p className="text-slate-300 leading-relaxed">
                  Le choc thermique se produit lorsqu une différence de température excessive (gradient Delta T) s établit entre le centre d un vitrage exposé au rayonnement solaire direct et ses bords maintenus au frais dans la feuillure du profilé aluminium.
                </p>
              </div>

              {/* Critical Thresholds Table */}
              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2.5">
                <h4 className="font-bold text-white text-xs uppercase tracking-wider">
                  Seuils Critiques Admissibles (Delta T crit)
                </h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-800 text-[10px] text-slate-400 font-semibold">
                        <th className="py-1.5 px-2">Type de Verre</th>
                        <th className="py-1.5 px-2">Façonnage Chants</th>
                        <th className="py-1.5 px-2 text-right">Delta T Max</th>
                        <th className="py-1.5 px-2">Comportement</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 text-[11px] text-slate-300">
                      <tr>
                        <td className="py-2 px-2 font-medium text-white">Float Clair Recuit</td>
                        <td className="py-2 px-2 text-rose-300">Coupe brute</td>
                        <td className="py-2 px-2 text-right font-bold text-rose-400">35 K</td>
                        <td className="py-2 px-2 text-slate-400">Microfissures amorces</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-2 font-medium text-white">Float Clair Recuit</td>
                        <td className="py-2 px-2 text-sky-300">Arêtes abattues</td>
                        <td className="py-2 px-2 text-right font-bold text-sky-400">42 K</td>
                        <td className="py-2 px-2 text-slate-400">Standard soigné atelier</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-2 font-medium text-white">Float Clair Recuit</td>
                        <td className="py-2 px-2 text-emerald-300">Joint Plat Poli (JPP)</td>
                        <td className="py-2 px-2 text-right font-bold text-emerald-400">48 K</td>
                        <td className="py-2 px-2 text-slate-400">Bords meulés et polis</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-2 font-medium text-white">Stop-Sol / Teinté</td>
                        <td className="py-2 px-2 text-amber-300">Arêtes abattues</td>
                        <td className="py-2 px-2 text-right font-bold text-amber-400">38 K</td>
                        <td className="py-2 px-2 text-slate-400">Absorption 50% renforcée</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-2 font-medium text-white">Semi Trempé (TVG)</td>
                        <td className="py-2 px-2 text-cyan-300">Arêtes polies</td>
                        <td className="py-2 px-2 text-right font-bold text-cyan-400">100 K</td>
                        <td className="py-2 px-2 text-slate-400">Haute résistance thermique</td>
                      </tr>
                      <tr className="bg-emerald-500/5">
                        <td className="py-2 px-2 font-medium text-emerald-300">Trempé Sécurit (ESG)</td>
                        <td className="py-2 px-2 text-emerald-300">Chants façonnés</td>
                        <td className="py-2 px-2 text-right font-bold text-emerald-400">150 K</td>
                        <td className="py-2 px-2 text-emerald-400">Immunité thermique totale</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Crack Morphology Guide */}
              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                <h4 className="font-bold text-amber-400 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Comment Identifier une Casse Thermique sur Chantier ?
                </h4>
                <p className="text-slate-300 leading-relaxed">
                  Contrairement à un choc mécanique (qui présente un cratère d impact avec des fissures concentriques étoilées), la casse thermique présente une signature infaillible :
                </p>
                <div className="space-y-1.5 pl-2 border-l-2 border-amber-500/40 text-slate-300">
                  <p>
                    <strong className="text-white">1. Départ perpendiculaire à 90° :</strong> La fissure démarre toujours rigoureusement perpendiculaire au bord du vitrage et traverse l épaisseur du chant à angle droit sur 20 à 50 mm.
                  </p>
                  <p>
                    <strong className="text-white">2. Ramification secondaire :</strong> Ensuite seulement, sous l effet de la contrainte résiduelle, la fissure bifurque ou se divise en arbre.
                  </p>
                  <p>
                    <strong className="text-white">3. Absence totale de cratère :</strong> Aucun point d impact superficiel ni éclat d éclatements de bille.
                  </p>
                </div>
              </div>

              {/* Algerian Climate Zones Note */}
              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1.5">
                <h4 className="font-bold text-white flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5 text-cyan-400" />
                  Spécificités des Wilayas Sahariennes (Zone D CNERIB)
                </h4>
                <p className="text-slate-300 leading-relaxed">
                  À Adrar, Ouargla, In Salah ou Béchar, le flux solaire direct dépasse 1050 W/m² avec des températures sous abri de 48°C. Les vitrages à contrôle solaire (Stop-Sol ou teinté) absorbent jusqu à 50% de ce flux et atteignent 80°C au centre. Sans trempe thermique, le bris de glace est quasi certain dès la première saison estivale.
                </p>
              </div>
            </div>
          )}

          {/* TAB 3: DISPATCH & REPORT */}
          {activeTab === 'dispatch' && (
            <div className="space-y-4 text-xs">
              {/* Summary Card */}
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                  <div>
                    <h3 className="font-bold text-white text-sm">
                      Synthèse de l'Audit Choc Thermique
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      Menuiserie : {windowReference} ({widthMm} x {heightMm} mm)
                    </p>
                  </div>
                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border ${analysis.badgeBorderClass} ${analysis.badgeBgClass} ${analysis.badgeTextClass}`}
                  >
                    {analysis.isCompliant ? 'Conforme DTU 39' : 'Trempe Requise'}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                  <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-slate-400">T° Centre</span>
                    <p className="text-base font-black text-rose-400">{analysis.estimatedCenterTempC}°C</p>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-slate-400">T° Bord Feuillure</span>
                    <p className="text-base font-black text-sky-400">{analysis.estimatedEdgeTempC}°C</p>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-slate-400">Gradient Delta T</span>
                    <p className="text-base font-black text-amber-400">{analysis.deltaTActualK} K</p>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-slate-400">Ratio de Sécurité</span>
                    <p className="text-base font-black text-white">{analysis.safetyRatio}</p>
                  </div>
                </div>

                {/* Workshop Directives */}
                <div className="space-y-1.5 pt-1">
                  <h4 className="font-semibold text-slate-300 text-xs">
                    Recommandations Techniques Atelier :
                  </h4>
                  <ul className="space-y-1 text-slate-300">
                    {analysis.workshopRecommendationsFr.map((rec, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <ChevronRight className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Action Buttons Box */}
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
                <h4 className="font-bold text-white text-xs uppercase tracking-wider">
                  Diffusion & Formalisation Chantier
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <button
                    onClick={handleGeneratePdf}
                    disabled={isGeneratingPdf}
                    className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-all shadow-md active:scale-95"
                  >
                    <FileCheck className="w-4 h-4" />
                    {isGeneratingPdf ? 'Génération en cours...' : 'Générer Fiche A4 (PDF)'}
                  </button>
                  <button
                    onClick={handleWhatsAppDispatch}
                    className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition-all shadow-md active:scale-95"
                  >
                    <MessageCircle className="w-4 h-4" />
                    Envoyer Rapport WhatsApp
                  </button>
                </div>
                <p className="text-[10px] text-slate-400 text-center">
                  La fiche technique PDF constitue un document de décharge contractuelle opposable en cas de sinistre ou d expertise d assurance.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Toast Notification */}
        {showToast && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-xl bg-slate-800 text-white text-xs font-semibold shadow-2xl border border-slate-700 flex items-center gap-2 animate-bounce">
            <Check className="w-4 h-4 text-emerald-400" />
            <span>{showToast}</span>
          </div>
        )}
      </div>
    </div>
  );
};
