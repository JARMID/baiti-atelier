/**
 * Baiti Atelier - Seismic Joinery Movement & Inter-Story Drift Safety Modal
 * Interactive structural calculation according to RPA 99 v2003 / Eurocode 8 / DTU 36.5
 * Humanizer compliant: exactly 0 em dashes, 0 en dashes.
 */

import React, { useState, useMemo } from 'react';
import {
  X,
  Activity,
  ShieldCheck,
  AlertTriangle,
  FileCheck,
  MessageCircle,
  Check,
  Info,
  Layers,
  Wrench,
  Maximize2,
  Building,
} from 'lucide-react';
import {
  calculateSeismicJoinerySafety,
  formatSeismicDispatchWhatsApp,
  SEISMIC_ZONES_RPA,
  BUILDING_USAGE_GROUPS,
  STRUCTURAL_SYSTEMS,
  type AlgerianSeismicZone,
  type BuildingUsageGroup,
  type StructuralFrameSystem,
  type GlazingSecurityType,
} from '../../utils/seismicJoineryManager';
import { generateSeismicCalculationPdf } from '../../utils/pdfGenerator';
import { playSwitchSound, playTactileClick } from '../../utils/audioFeedback';

export interface SeismicJoineryModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialWidth?: number;
  initialHeight?: number;
  windowReference?: string;
  wilayaName?: string;
  clientName?: string;
}

type ActiveTab = 'simulator' | 'distortion' | 'rpa_rules';

export const SeismicJoineryModal: React.FC<SeismicJoineryModalProps> = ({
  isOpen,
  onClose,
  initialWidth = 1400,
  initialHeight = 1500,
  windowReference = 'Baie Façade Salon',
  wilayaName = 'Alger (16)',
  clientName = 'Projet Résidentiel RPA',
}) => {
  // State hooks called unconditionally
  const [activeTab, setActiveTab] = useState<ActiveTab>('simulator');
  const [widthMm, setWidthMm] = useState<number>(initialWidth);
  const [heightMm, setHeightMm] = useState<number>(initialHeight);
  const [prevDims, setPrevDims] = useState({ width: initialWidth, height: initialHeight });
  if (prevDims.width !== initialWidth || prevDims.height !== initialHeight) {
    setPrevDims({ width: initialWidth, height: initialHeight });
    setWidthMm(initialWidth);
    setHeightMm(initialHeight);
  }

  const [storyHeightMm, setStoryHeightMm] = useState<number>(3000);
  const [selectedZone, setSelectedZone] = useState<AlgerianSeismicZone>('zone_2b');
  const [selectedUsage, setSelectedUsage] = useState<BuildingUsageGroup>('group_2');
  const [selectedStructure, setSelectedStructure] = useState<StructuralFrameSystem>('concrete_portal_ductile');
  const [glassEdgeClearanceMm, setGlassEdgeClearanceMm] = useState<number>(5);
  const [glassSecurity, setGlassSecurity] = useState<GlazingSecurityType>('laminated_pvb_33_2');
  const [isGeneratingPdf, setIsGeneratingPdf] = useState<boolean>(false);
  const [copiedNotification, setCopiedNotification] = useState<boolean>(false);

  // Main calculation
  const calculation = useMemo(() => {
    return calculateSeismicJoinerySafety({
      storyHeightMm,
      windowWidthMm: widthMm,
      windowHeightMm: heightMm,
      glassEdgeClearanceMm,
      zoneId: selectedZone,
      usageId: selectedUsage,
      structuralId: selectedStructure,
      glassSecurity,
    });
  }, [
    storyHeightMm,
    widthMm,
    heightMm,
    glassEdgeClearanceMm,
    selectedZone,
    selectedUsage,
    selectedStructure,
    glassSecurity,
  ]);

  if (!isOpen) return null;

  const handleExportPdf = async () => {
    setIsGeneratingPdf(true);
    playSwitchSound();
    try {
      const docId = `SEISME-${Date.now().toString().slice(-6)}`;
      await generateSeismicCalculationPdf({
        documentId: docId,
        projectOrClientName: clientName,
        locationWilaya: wilayaName,
        windowReference,
        glassSecurityLabelFr:
          glassSecurity === 'laminated_pvb_33_2'
            ? 'Feuilleté de sécurité Stadip 33.2'
            : glassSecurity === 'laminated_pvb_44_2'
            ? 'Feuilleté renforcé Stadip 44.2'
            : glassSecurity === 'laminated_acoustic_silence'
            ? 'Feuilleté acoustique Stadip Silence'
            : glassSecurity === 'toughened_esg'
            ? 'Verre trempé thermique ESG'
            : 'Verre float recuit standard',
        result: calculation,
        workshopName: 'BAITI ATELIER ALGERIE',
      });
    } catch (err) {
      console.error('Erreur generation PDF parasismique:', err);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleShareWhatsApp = () => {
    playTactileClick();
    const text = formatSeismicDispatchWhatsApp(calculation, windowReference, 'Baiti Atelier');
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const handleCopyClipboard = () => {
    playTactileClick();
    const text = formatSeismicDispatchWhatsApp(calculation, windowReference, 'Baiti Atelier');
    navigator.clipboard.writeText(text);
    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 2500);
  };

  const zoneSpec = calculation.selectedZone;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-2 sm:p-4 overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 sm:px-6 sm:py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  Calculateur Parasismique & Dérive d Étage
                </h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono">
                  RPA 99 v2003 / EC8
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {windowReference} • {wilayaName} • {widthMm} x {heightMm} mm • Étage {storyHeightMm} mm
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              playTactileClick();
              onClose();
            }}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800/80 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
            title="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 bg-slate-900/90 px-3 sm:px-6 space-x-2 overflow-x-auto shrink-0">
          <button
            onClick={() => {
              playTactileClick();
              setActiveTab('simulator');
            }}
            className={`py-3 px-4 text-xs sm:text-sm font-semibold border-b-2 transition-all whitespace-nowrap min-h-[44px] flex items-center space-x-2 ${
              activeTab === 'simulator'
                ? 'border-amber-500 text-amber-400 bg-amber-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>Simulateur Sismique RPA</span>
          </button>
          <button
            onClick={() => {
              playTactileClick();
              setActiveTab('distortion');
            }}
            className={`py-3 px-4 text-xs sm:text-sm font-semibold border-b-2 transition-all whitespace-nowrap min-h-[44px] flex items-center space-x-2 ${
              activeTab === 'distortion'
                ? 'border-amber-500 text-amber-400 bg-amber-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Distorsion Angulaire (SVG)</span>
          </button>
          <button
            onClick={() => {
              playTactileClick();
              setActiveTab('rpa_rules');
            }}
            className={`py-3 px-4 text-xs sm:text-sm font-semibold border-b-2 transition-all whitespace-nowrap min-h-[44px] flex items-center space-x-2 ${
              activeTab === 'rpa_rules'
                ? 'border-amber-500 text-amber-400 bg-amber-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Info className="w-4 h-4" />
            <span>Règles RPA 99 & DTU 36.5</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {activeTab === 'simulator' && (
            <div className="space-y-6">
              {/* Verdict Banner */}
              <div
                className={`p-4 rounded-xl border ${calculation.verdictBadgeClass} bg-slate-950/70 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4`}
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    {calculation.isGlassClearanceCompliant && calculation.isStoryDriftCompliant ? (
                      <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
                    ) : (
                      <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
                    )}
                    <span className="text-sm font-bold tracking-wide uppercase">
                      {calculation.structuralVerdictFr}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300">
                    Dérive de calcul dr : <strong className="text-white">{calculation.calculatedDesignDriftDrMm} mm</strong> / capacité feuillure <strong className="text-white">{calculation.glassFalloutClearanceDriftMm} mm</strong> (Facteur de sécurité : <strong className="text-white">{calculation.seismicSafetyFactor}</strong>).
                  </p>
                </div>

                <div className="flex items-center space-x-3 bg-slate-900/90 px-4 py-2 rounded-xl border border-slate-800 shrink-0">
                  <div className="text-center">
                    <span className="text-[10px] text-slate-400 uppercase font-mono block">Dérive dr</span>
                    <span className="text-lg font-black text-amber-400">{calculation.calculatedDesignDriftDrMm} <span className="text-[10px]">mm</span></span>
                  </div>
                  <div className="w-px h-8 bg-slate-800" />
                  <div className="text-center">
                    <span className="text-[10px] text-slate-400 uppercase font-mono block">Sécurité Sf</span>
                    <span
                      className={`text-lg font-black ${
                        calculation.isGlassClearanceCompliant ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {calculation.seismicSafetyFactor}
                    </span>
                  </div>
                  <div className="w-px h-8 bg-slate-800" />
                  <div className="text-center">
                    <span className="text-[10px] text-slate-400 uppercase font-mono block">Joint Requis</span>
                    <span className="text-lg font-black text-sky-400">
                      {calculation.requiredPeripheralSeismicJointMm} <span className="text-[10px]">mm</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Grid: Inputs Configuration */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 1. Seismic Zone & Acceleration */}
                <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-800 space-y-3">
                  <h4 className="text-xs font-bold text-slate-200 flex items-center space-x-1.5">
                    <Activity className="w-4 h-4 text-amber-400" />
                    <span>Zone Sismique Réglementaire (RPA 99 v2003)</span>
                  </h4>
                  <select
                    value={selectedZone}
                    onChange={(e) => {
                      playTactileClick();
                      setSelectedZone(e.target.value as AlgerianSeismicZone);
                    }}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 min-h-[44px]"
                  >
                    {Object.values(SEISMIC_ZONES_RPA).map((z) => (
                      <option key={z.id} value={z.id}>
                        {z.nameFr} (A = {z.nominalAccelerationA}g)
                      </option>
                    ))}
                  </select>
                  <p className="text-[11px] text-slate-400">
                    Wilayas concernées : {zoneSpec.representativeWilayasFr}.
                  </p>
                </div>

                {/* 2. Building Usage Group */}
                <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-800 space-y-3">
                  <h4 className="text-xs font-bold text-slate-200 flex items-center space-x-1.5">
                    <Building className="w-4 h-4 text-amber-400" />
                    <span>Groupe d Usage du Bâtiment</span>
                  </h4>
                  <select
                    value={selectedUsage}
                    onChange={(e) => {
                      playTactileClick();
                      setSelectedUsage(e.target.value as BuildingUsageGroup);
                    }}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 min-h-[44px]"
                  >
                    {Object.values(BUILDING_USAGE_GROUPS).map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.titleFr} (Coeff I = {u.importanceFactorI})
                      </option>
                    ))}
                  </select>
                  <p className="text-[11px] text-slate-400">
                    Accélération de calcul Aeff = {calculation.designAccelerationA}g ({BUILDING_USAGE_GROUPS[selectedUsage].descriptionFr}).
                  </p>
                </div>

                {/* 3. Structural System & Heights */}
                <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-800 space-y-3">
                  <h4 className="text-xs font-bold text-slate-200 flex items-center space-x-1.5">
                    <Building className="w-4 h-4 text-amber-400" />
                    <span>Système de Structure Porteuse</span>
                  </h4>
                  <select
                    value={selectedStructure}
                    onChange={(e) => {
                      playTactileClick();
                      setSelectedStructure(e.target.value as StructuralFrameSystem);
                    }}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 min-h-[44px]"
                  >
                    {Object.values(STRUCTURAL_SYSTEMS).map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.nameFr} (q = {s.behaviorFactorQ})
                      </option>
                    ))}
                  </select>

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">
                        Hauteur d Étage (h)
                      </label>
                      <input
                        type="number"
                        min={2400}
                        max={5000}
                        step={100}
                        value={storyHeightMm}
                        onChange={(e) => setStoryHeightMm(Number(e.target.value) || 3000)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 min-h-[44px]"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">
                        Jeu Fond de Feuillure (c)
                      </label>
                      <select
                        value={glassEdgeClearanceMm}
                        onChange={(e) => {
                          playTactileClick();
                          setGlassEdgeClearanceMm(Number(e.target.value));
                        }}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2 py-2 text-xs text-white focus:outline-none focus:border-amber-500 min-h-[44px]"
                      >
                        <option value={5}>5 mm (Standard DTU 39)</option>
                        <option value={8}>8 mm (Renforcé Parclose)</option>
                        <option value={10}>10 mm (Haute Sécurité Parclose)</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* 4. Glazing Safety & Shatter Class */}
                <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-800 space-y-3">
                  <h4 className="text-xs font-bold text-slate-200 flex items-center space-x-1.5">
                    <Maximize2 className="w-4 h-4 text-amber-400" />
                    <span>Sécurité du Volume Verrier</span>
                  </h4>
                  <select
                    value={glassSecurity}
                    onChange={(e) => {
                      playTactileClick();
                      setGlassSecurity(e.target.value as GlazingSecurityType);
                    }}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 min-h-[44px]"
                  >
                    <option value="laminated_pvb_33_2">Feuilleté de Sécurité 33.2 (Stadip PVB)</option>
                    <option value="laminated_pvb_44_2">Feuilleté Renforcé 44.2 (Anti-Chute)</option>
                    <option value="laminated_acoustic_silence">Feuilleté Acoustique Silence 44.2</option>
                    <option value="toughened_esg">Verre Trempé ESG (Sécurisé)</option>
                    <option value="annealed_float">Verre Float Recuit (Non Sécurisé)</option>
                  </select>

                  {calculation.requiresLaminatedSafetyGlass && (
                    <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px] flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
                      <span>Zone IIb / III : Le vitrage feuilleté de sécurité est obligatoire pour éviter la projection d éclats tranchants.</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Directives and Recommendations */}
              <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-2">
                <h4 className="text-xs font-bold text-slate-200">
                  Prescriptions Parasismiques de l Atelier :
                </h4>
                <ul className="space-y-1.5 text-xs text-slate-300">
                  {calculation.engineeringDirectivesFr.map((dir, idx) => (
                    <li key={idx} className="flex items-start space-x-2">
                      <span className="text-amber-400 font-bold shrink-0">•</span>
                      <span>{dir}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {activeTab === 'distortion' && (
            <div className="space-y-6">
              {/* SVG Parallelogram Distortion Diagram */}
              <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-white">
                      Distorsion en Parallélogramme sous Dérive d Étage
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      RPA 99 / AAMA 501.4 : rotation relative du verre dans le feuillure aluminium
                    </p>
                  </div>
                  <span className="text-[10px] px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30">
                    Déformation Racking
                  </span>
                </div>

                {/* SVG Blueprint */}
                <div className="w-full h-64 bg-slate-900/90 rounded-xl p-4 border border-slate-800 flex items-center justify-center relative overflow-hidden">
                  <svg className="w-full h-full max-h-56" viewBox="0 0 500 240">
                    {/* Floor and Ceiling reference lines */}
                    <line x1="40" y1="30" x2="460" y2="30" stroke="#475569" strokeWidth="2" strokeDasharray="4 4" />
                    <text x="50" y="24" fill="#94A3B8" fontSize="8" fontWeight="bold">PLAFOND (NIVEAU N+1)</text>

                    <line x1="40" y1="210" x2="460" y2="210" stroke="#475569" strokeWidth="2" />
                    <text x="50" y="222" fill="#94A3B8" fontSize="8" fontWeight="bold">SOL (NIVEAU N)</text>

                    {/* Initial rectangular frame (dotted grey) */}
                    <rect x="150" y="30" width="200" height="180" fill="none" stroke="#64748B" strokeWidth="1.5" strokeDasharray="3 3" />

                    {/* Deformed skewed frame (parallelogram) */}
                    {/* Shift top right by 45px */}
                    <polygon
                      points="195,30 395,30 350,210 150,210"
                      fill="none"
                      stroke={calculation.isGlassClearanceCompliant ? '#38BDF8' : '#F43F5E'}
                      strokeWidth="3"
                    />

                    {/* Rigid rotating glass pane inside the skewed frame */}
                    <polygon
                      points="200,42 388,42 344,198 156,198"
                      fill="rgba(56, 189, 248, 0.08)"
                      stroke="#0EA5E9"
                      strokeWidth="2"
                    />

                    {/* Seismic displacement arrow (dr) at top */}
                    <line x1="150" y1="22" x2="192" y2="22" stroke="#F59E0B" strokeWidth="2" />
                    <polygon points="195,22 188,19 188,25" fill="#F59E0B" />
                    <text x="172" y="15" fill="#FDE047" fontSize="9" fontWeight="bold" textAnchor="middle">
                      dr = {calculation.calculatedDesignDriftDrMm} mm
                    </text>

                    {/* Critical corner gap callout */}
                    <circle cx="195" cy="30" r="14" fill="none" stroke="#F59E0B" strokeWidth="1.5" strokeDasharray="2 2" />
                    <line x1="208" y1="22" x2="260" y2="10" stroke="#F59E0B" strokeWidth="1" />
                    <text x="265" y="14" fill="#F59E0B" fontSize="9" fontWeight="bold">
                      Jeu d angle : {calculation.glassEdgeClearanceMm} mm (Capacité : {calculation.glassFalloutClearanceDriftMm} mm)
                    </text>

                    {/* Slotted hole brackets at base */}
                    <rect x="140" y="206" width="20" height="8" rx="3" fill="#E2E8F0" />
                    <line x1="145" y1="210" x2="155" y2="210" stroke="#0F172A" strokeWidth="2" />
                    <text x="110" y="235" fill="#CBD5E1" fontSize="8">Trou oblong {calculation.recommendedSlottedHoleLengthMm} mm</text>
                  </svg>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'rpa_rules' && (
            <div className="space-y-6">
              {/* RPA 99 v2003 Article 5.10 Details */}
              <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-4">
                <div className="flex items-center space-x-2">
                  <ShieldCheck className="w-5 h-5 text-amber-400 shrink-0" />
                  <h3 className="text-sm font-bold text-white">
                    RPA 99 version 2003 : Article 5.10 (Justification de la Déformation d Étage)
                  </h3>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Le Règlement Parasismique Algérien impose que le déplacement relatif horizontal d un niveau par rapport aux niveaux adjacents ne dépasse pas 1.0% de la hauteur d étage :
                </p>
                <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 text-center font-mono text-xs text-amber-400">
                  &Delta;<sub>k</sub> = R &times; &Delta;<sub>ek</sub> &le; 0.010 &times; h<sub>étage</sub>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-900 text-slate-400 font-mono text-[11px] border-b border-slate-800">
                      <tr>
                        <th className="py-2.5 px-3">Zone RPA</th>
                        <th className="py-2.5 px-3">Sismicité</th>
                        <th className="py-2.5 px-3">Accélération A (Groupe 2)</th>
                        <th className="py-2.5 px-3">Wilayas Principales</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 text-slate-300">
                      <tr>
                        <td className="py-2 px-3 font-semibold text-emerald-400">Zone 0</td>
                        <td className="py-2 px-3">Négligeable</td>
                        <td className="py-2 px-3 font-mono">0.00g</td>
                        <td className="py-2 px-3">Grand Sud Saharien (Tamanrasset, Adrar)</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-3 font-semibold text-sky-400">Zone I</td>
                        <td className="py-2 px-3">Faible</td>
                        <td className="py-2 px-3 font-mono">0.10g</td>
                        <td className="py-2 px-3">Biskra, Djelfa, Laghouat, Tébessa</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-3 font-semibold text-amber-400">Zone IIa</td>
                        <td className="py-2 px-3">Moyenne</td>
                        <td className="py-2 px-3 font-mono">0.15g</td>
                        <td className="py-2 px-3">Sétif, Batna, Tlemcen, Tizi Ouzou</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-3 font-semibold text-orange-400">Zone IIb</td>
                        <td className="py-2 px-3">Élevée</td>
                        <td className="py-2 px-3 font-mono">0.25g</td>
                        <td className="py-2 px-3">Alger, Tipaza, Boumerdès, Oran, Blida</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-3 font-semibold text-rose-400">Zone III</td>
                        <td className="py-2 px-3">Très élevée</td>
                        <td className="py-2 px-3 font-mono">0.35g</td>
                        <td className="py-2 px-3">Chlef, Aïn Defla, Mascara nord</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* DTU 36.5 Annexe B Guidance */}
              <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-800 space-y-2">
                <h4 className="text-xs font-bold text-amber-400 flex items-center space-x-1.5">
                  <Wrench className="w-4 h-4 text-amber-400" />
                  <span>Prescriptions de Pose en Zone Sismique (DTU 36.5 Annexe B) :</span>
                </h4>
                <ul className="space-y-1.5 text-xs text-slate-300">
                  <li className="flex items-start space-x-2">
                    <span className="text-amber-400 font-bold shrink-0">•</span>
                    <span>Proscrire la fixation rigide directe par vis traversante sans jeu en zone IIb et III.</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-amber-400 font-bold shrink-0">•</span>
                    <span>Utiliser des pattes d ancrage avec trous oblongs horizontaux autorisant le glissement structural.</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-amber-400 font-bold shrink-0">•</span>
                    <span>Respecter un jeu périphérique de calfeutrement souple de 15 mm minimum avec fond de joint PE.</span>
                  </li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-4 py-3 sm:px-6 sm:py-4 border-t border-slate-800 bg-slate-950/80 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center space-x-2 text-xs text-slate-400">
            <span>Réf : <strong className="text-white">{windowReference}</strong></span>
            <span>•</span>
            <span>Dérive dr : <strong className="text-amber-400">{calculation.calculatedDesignDriftDrMm} mm</strong></span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleCopyClipboard}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl transition-colors min-h-[44px] flex items-center space-x-1.5"
            >
              {copiedNotification ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-400">Copié !</span>
                </>
              ) : (
                <span>Copier Note</span>
              )}
            </button>

            <button
              onClick={handleShareWhatsApp}
              className="px-3 py-2 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 text-xs font-semibold rounded-xl transition-colors min-h-[44px] flex items-center space-x-1.5"
            >
              <MessageCircle className="w-4 h-4" />
              <span>WhatsApp</span>
            </button>

            <button
              onClick={handleExportPdf}
              disabled={isGeneratingPdf}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-xl transition-all shadow-lg shadow-amber-500/20 min-h-[44px] flex items-center space-x-1.5 disabled:opacity-50"
            >
              <FileCheck className="w-4 h-4" />
              <span>{isGeneratingPdf ? 'Génération...' : 'Télécharger PDF A4'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
