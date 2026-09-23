/**
 * Baiti Atelier - Curtain Wall Structural Wind Inertia & Mullion Deflection Modal
 * Interactive structural calculation according to Eurocode 9 / NF DTU 33.1 / DTR BC 2-47
 * Humanizer compliant: exactly 0 em dashes, 0 en dashes.
 */

import React, { useState, useMemo } from 'react';
import {
  X,
  Building2,
  Wind,
  ShieldCheck,
  AlertTriangle,
  FileCheck,
  MessageCircle,
  Check,
  Activity,
  Maximize2,
  Layers,
  Info,
  Wrench,
  Compass,
} from 'lucide-react';
import {
  calculateCurtainWallStructural,
  formatCurtainWallStructuralWhatsApp,
  MULLION_PROFILES_CATALOG,
  TRANSOM_PROFILES_CATALOG,
  ALGERIAN_WIND_ZONES,
  SITE_ROUGHNESS_CATALOG,
  type MullionProfileModel,
  type TransomProfileModel,
  type AlgerianWindZone,
  type SiteRoughnessCategory,
  type StructuralSupportCondition,
} from '../../utils/curtainWallStructuralManager';
import { generateCurtainWallCalculationPdf } from '../../utils/pdfGenerator';
import { playSwitchSound, playTactileClick } from '../../utils/audioFeedback';

export interface CurtainWallStructuralModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialFloorHeight?: number;
  initialMullionSpacing?: number;
  facadeReference?: string;
  wilayaName?: string;
  clientName?: string;
}

type ActiveTab = 'sizing' | 'elevation' | 'anchors' | 'dtu';

export const CurtainWallStructuralModal: React.FC<CurtainWallStructuralModalProps> = ({
  isOpen,
  onClose,
  initialFloorHeight = 3500,
  initialMullionSpacing = 1500,
  facadeReference = 'Façade Principale Tour',
  wilayaName = 'Alger (16)',
  clientName = 'Projet Tertiaire',
}) => {
  // State hooks called unconditionally
  const [activeTab, setActiveTab] = useState<ActiveTab>('sizing');
  const [floorHeightMm, setFloorHeightMm] = useState<number>(initialFloorHeight);
  const [mullionSpacingMm, setMullionSpacingMm] = useState<number>(initialMullionSpacing);
  const [prevDims, setPrevDims] = useState({ height: initialFloorHeight, spacing: initialMullionSpacing });
  if (prevDims.height !== initialFloorHeight || prevDims.spacing !== initialMullionSpacing) {
    setPrevDims({ height: initialFloorHeight, spacing: initialMullionSpacing });
    setFloorHeightMm(initialFloorHeight);
    setMullionSpacingMm(initialMullionSpacing);
  }

  const [buildingHeightM, setBuildingHeightM] = useState<number>(24);
  const [selectedMullion, setSelectedMullion] = useState<MullionProfileModel>('mullion_50_150');
  const [selectedTransom, setSelectedTransom] = useState<TransomProfileModel>('transom_50_75');
  const [selectedWindZone, setSelectedWindZone] = useState<AlgerianWindZone>('zone_2');
  const [selectedRoughness, setSelectedRoughness] = useState<SiteRoughnessCategory>('site_3_suburbain');
  const [supportCondition, setSupportCondition] = useState<StructuralSupportCondition>('simple_span');
  const [isGeneratingPdf, setIsGeneratingPdf] = useState<boolean>(false);
  const [copiedNotification, setCopiedNotification] = useState<boolean>(false);

  // Main structural calculation
  const calculation = useMemo(() => {
    return calculateCurtainWallStructural({
      floorHeightMm,
      mullionSpacingMm,
      buildingHeightM,
      mullionModel: selectedMullion,
      transomModel: selectedTransom,
      windZone: selectedWindZone,
      roughness: selectedRoughness,
      supportCondition,
    });
  }, [
    floorHeightMm,
    mullionSpacingMm,
    buildingHeightM,
    selectedMullion,
    selectedTransom,
    selectedWindZone,
    selectedRoughness,
    supportCondition,
  ]);

  if (!isOpen) return null;

  const handleExportPdf = async () => {
    setIsGeneratingPdf(true);
    playSwitchSound();
    try {
      const docId = `FACADE-${Date.now().toString().slice(-6)}`;
      await generateCurtainWallCalculationPdf({
        documentId: docId,
        projectOrClientName: clientName,
        locationWilaya: wilayaName,
        facadeReference,
        typologyFr: 'Façade Rideau Grille Capot-Serreur 50 mm',
        result: calculation,
        workshopName: 'BAITI ATELIER ALGERIE',
      });
    } catch (err) {
      console.error('Erreur generation PDF facade rideau:', err);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleShareWhatsApp = () => {
    playTactileClick();
    const text = formatCurtainWallStructuralWhatsApp(calculation, facadeReference, 'Baiti Atelier');
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const handleCopyClipboard = () => {
    playTactileClick();
    const text = formatCurtainWallStructuralWhatsApp(calculation, facadeReference, 'Baiti Atelier');
    navigator.clipboard.writeText(text);
    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 2500);
  };

  const mullionSpec = calculation.selectedMullion;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-2 sm:p-4 overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 sm:px-6 sm:py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-400 shrink-0">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  Calculateur Façade Rideau (Inertie & Flèche Vent)
                </h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 font-mono">
                  DTU 33.1 / EC9 / DTR BC 2-47
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {facadeReference} • {wilayaName} • Hauteur {floorHeightMm} mm • Entraxe {mullionSpacingMm} mm
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
              setActiveTab('sizing');
            }}
            className={`py-3 px-4 text-xs sm:text-sm font-semibold border-b-2 transition-all whitespace-nowrap min-h-[44px] flex items-center space-x-2 ${
              activeTab === 'sizing'
                ? 'border-sky-500 text-sky-400 bg-sky-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>Dimensionnement Statique</span>
          </button>
          <button
            onClick={() => {
              playTactileClick();
              setActiveTab('elevation');
            }}
            className={`py-3 px-4 text-xs sm:text-sm font-semibold border-b-2 transition-all whitespace-nowrap min-h-[44px] flex items-center space-x-2 ${
              activeTab === 'elevation'
                ? 'border-sky-500 text-sky-400 bg-sky-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Élévation & Flèche Élastique</span>
          </button>
          <button
            onClick={() => {
              playTactileClick();
              setActiveTab('anchors');
            }}
            className={`py-3 px-4 text-xs sm:text-sm font-semibold border-b-2 transition-all whitespace-nowrap min-h-[44px] flex items-center space-x-2 ${
              activeTab === 'anchors'
                ? 'border-sky-500 text-sky-400 bg-sky-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Wrench className="w-4 h-4" />
            <span>Ancrages & Dilatation</span>
          </button>
          <button
            onClick={() => {
              playTactileClick();
              setActiveTab('dtu');
            }}
            className={`py-3 px-4 text-xs sm:text-sm font-semibold border-b-2 transition-all whitespace-nowrap min-h-[44px] flex items-center space-x-2 ${
              activeTab === 'dtu'
                ? 'border-sky-500 text-sky-400 bg-sky-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Info className="w-4 h-4" />
            <span>Règles DTU 33.1</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {activeTab === 'sizing' && (
            <div className="space-y-6">
              {/* Verdict Banner */}
              <div
                className={`p-4 rounded-xl border ${calculation.verdictBadgeClass} bg-slate-950/70 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4`}
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    {calculation.isMullionCompliant && calculation.isTransomCompliant ? (
                      <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
                    ) : (
                      <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
                    )}
                    <span className="text-sm font-bold tracking-wide uppercase">
                      {calculation.structuralVerdictFr}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300">
                    Flèche calculée : <strong className="text-white">{calculation.calculatedMullionDeflectionMm} mm</strong> / limite admissible <strong className="text-white">{calculation.permissibleMullionDeflectionMm} mm</strong> (Inertie requise : <strong className="text-white">{calculation.requiredMullionIxCm4} cm⁴</strong> vs {mullionSpec.ixCm4} cm⁴ disponible).
                  </p>
                </div>

                <div className="flex items-center space-x-3 bg-slate-900/90 px-4 py-2 rounded-xl border border-slate-800 shrink-0">
                  <div className="text-center">
                    <span className="text-[10px] text-slate-400 uppercase font-mono block">Vent qp(z)</span>
                    <span className="text-lg font-black text-sky-400">{calculation.dynamicWindPressureQpDanM2} <span className="text-[10px]">daN/m²</span></span>
                  </div>
                  <div className="w-px h-8 bg-slate-800" />
                  <div className="text-center">
                    <span className="text-[10px] text-slate-400 uppercase font-mono block">Taux Flèche</span>
                    <span
                      className={`text-lg font-black ${
                        calculation.isMullionCompliant ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {calculation.deflectionRatioPercent}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Grid: Inputs Configuration */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 1. Geometry Dimensions */}
                <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-800 space-y-3">
                  <h4 className="text-xs font-bold text-slate-200 flex items-center space-x-1.5">
                    <Maximize2 className="w-4 h-4 text-sky-400" />
                    <span>Géométrie de Trame & Portée (mm)</span>
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">
                        Hauteur sous Dalle (L)
                      </label>
                      <input
                        type="number"
                        min={2200}
                        max={6500}
                        step={50}
                        value={floorHeightMm}
                        onChange={(e) => setFloorHeightMm(Number(e.target.value) || 3000)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500 min-h-[44px]"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">
                        Entraxe Montants (B)
                      </label>
                      <input
                        type="number"
                        min={800}
                        max={3000}
                        step={50}
                        value={mullionSpacingMm}
                        onChange={(e) => setMullionSpacingMm(Number(e.target.value) || 1500)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500 min-h-[44px]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">
                        Hauteur Bâtiment z (m)
                      </label>
                      <input
                        type="number"
                        min={3}
                        max={150}
                        step={1}
                        value={buildingHeightM}
                        onChange={(e) => setBuildingHeightM(Number(e.target.value) || 15)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500 min-h-[44px]"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">
                        Schéma Mécanique
                      </label>
                      <select
                        value={supportCondition}
                        onChange={(e) => {
                          playTactileClick();
                          setSupportCondition(e.target.value as StructuralSupportCondition);
                        }}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2 py-2 text-xs text-white focus:outline-none focus:border-sky-500 min-h-[44px]"
                      >
                        <option value="simple_span">Appui Simple (2 dalles)</option>
                        <option value="continuous_two_spans">Montant Continu (2 travées)</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* 2. Wind Load Environment */}
                <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-800 space-y-3">
                  <h4 className="text-xs font-bold text-slate-200 flex items-center space-x-1.5">
                    <Wind className="w-4 h-4 text-sky-400" />
                    <span>Conditions de Vent (DTR BC 2-47 RNV)</span>
                  </h4>
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">
                      Zone de Vent Réglementaire
                    </label>
                    <select
                      value={selectedWindZone}
                      onChange={(e) => {
                        playTactileClick();
                        setSelectedWindZone(e.target.value as AlgerianWindZone);
                      }}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500 min-h-[44px]"
                    >
                      {Object.values(ALGERIAN_WIND_ZONES).map((z) => (
                        <option key={z.id} value={z.id}>
                          {z.nameFr} (qref = {z.basePressureQrefDanM2} daN/m²)
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">
                      Catégorie de Rugosité du Site
                    </label>
                    <select
                      value={selectedRoughness}
                      onChange={(e) => {
                        playTactileClick();
                        setSelectedRoughness(e.target.value as SiteRoughnessCategory);
                      }}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500 min-h-[44px]"
                    >
                      {Object.values(SITE_ROUGHNESS_CATALOG).map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.nameFr}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* 3. Aluminium Profiles Selection */}
                <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-800 space-y-3">
                  <h4 className="text-xs font-bold text-slate-200 flex items-center space-x-1.5">
                    <Layers className="w-4 h-4 text-sky-400" />
                    <span>Profilé Montant Vertical (Inertie Ix)</span>
                  </h4>
                  <select
                    value={selectedMullion}
                    onChange={(e) => {
                      playTactileClick();
                      setSelectedMullion(e.target.value as MullionProfileModel);
                    }}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500 min-h-[44px]"
                  >
                    {Object.values(MULLION_PROFILES_CATALOG).map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.labelFr} (Ix = {m.ixCm4} cm⁴)
                      </option>
                    ))}
                  </select>
                  <p className="text-[11px] text-slate-400">
                    {mullionSpec.descriptionFr}
                  </p>
                </div>

                {/* 4. Transom Selection & Glass Load */}
                <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-800 space-y-3">
                  <h4 className="text-xs font-bold text-slate-200 flex items-center space-x-1.5">
                    <Compass className="w-4 h-4 text-sky-400" />
                    <span>Traverse Horizontale (Inertie Iy)</span>
                  </h4>
                  <select
                    value={selectedTransom}
                    onChange={(e) => {
                      playTactileClick();
                      setSelectedTransom(e.target.value as TransomProfileModel);
                    }}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500 min-h-[44px]"
                  >
                    {Object.values(TRANSOM_PROFILES_CATALOG).map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.labelFr} (Iy = {t.iyCm4} cm⁴ | Max: {t.maxGlassWeightKg} kg)
                      </option>
                    ))}
                  </select>
                  <p className="text-[11px] text-slate-400">
                    Poids panneau vitré calculé : <strong>{calculation.glassPanelWeightKg} kg</strong> • Flèche traverse : <strong>{calculation.calculatedTransomDeflectionMm} mm</strong> (limite admissible 3.0 mm).
                  </p>
                </div>
              </div>

              {/* Diagnostic Observations List */}
              <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-2">
                <h4 className="text-xs font-bold text-slate-200">
                  Observations & Préconisations du Bureau d Études Façades :
                </h4>
                <ul className="space-y-1.5 text-xs text-slate-300">
                  {calculation.engineeringObservationsFr.map((obs, idx) => (
                    <li key={idx} className="flex items-start space-x-2">
                      <span className="text-sky-400 font-bold shrink-0">•</span>
                      <span>{obs}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {activeTab === 'elevation' && (
            <div className="space-y-6">
              {/* SVG Curtain Wall Elevation & Elastic Deflection Curve */}
              <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-white">
                      Élévation Façade & Courbe Élastique sous Vent
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Flèche maximale f = {calculation.calculatedMullionDeflectionMm} mm à mi-hauteur
                    </p>
                  </div>
                  <span className="text-[10px] px-2.5 py-1 rounded-full bg-sky-500/10 text-sky-300 border border-sky-500/30">
                    DTU 33.1 Déformation
                  </span>
                </div>

                {/* SVG Blueprint */}
                <div className="w-full h-64 bg-slate-900/90 rounded-xl p-4 border border-slate-800 flex items-center justify-center relative overflow-hidden">
                  <svg className="w-full h-full max-h-56" viewBox="0 0 500 240">
                    {/* Upper and Lower concrete floor slabs */}
                    <rect x="30" y="15" width="440" height="18" fill="#334155" stroke="#475569" strokeWidth="1" />
                    <text x="250" y="28" fill="#94A3B8" fontSize="9" textAnchor="middle" fontWeight="bold">
                      DALLE BÉTON ÉTAGE SUPÉRIEUR (NIVEAU N+1)
                    </text>

                    <rect x="30" y="207" width="440" height="18" fill="#334155" stroke="#475569" strokeWidth="1" />
                    <text x="250" y="220" fill="#94A3B8" fontSize="9" textAnchor="middle" fontWeight="bold">
                      DALLE BÉTON ÉTAGE INFÉRIEUR (NIVEAU N)
                    </text>

                    {/* Mullion axis (neutral straight line) */}
                    <line x1="250" y1="33" x2="250" y2="207" stroke="#64748B" strokeWidth="2" strokeDasharray="4 3" />

                    {/* Exaggerated Elastic Deflection Parabola */}
                    <path
                      d="M 250 33 Q 320 120 250 207"
                      fill="none"
                      stroke={calculation.isMullionCompliant ? '#38BDF8' : '#F43F5E'}
                      strokeWidth="3.5"
                    />

                    {/* Wind load arrows */}
                    {[55, 85, 120, 155, 185].map((yVal, i) => (
                      <g key={i}>
                        <line x1="160" y1={yVal} x2="235" y2={yVal} stroke="#0EA5E9" strokeWidth="1.5" />
                        <polygon points={`240,${yVal} 232,${yVal - 3} 232,${yVal + 3}`} fill="#0EA5E9" />
                      </g>
                    ))}
                    <text x="135" y="123" fill="#38BDF8" fontSize="10" fontWeight="bold">
                      Vent qp(z)
                    </text>

                    {/* Deflection annotation at mid-span */}
                    <line x1="250" y1="120" x2="318" y2="120" stroke="#F59E0B" strokeWidth="1.5" strokeDasharray="2 2" />
                    <circle cx="320" cy="120" r="3.5" fill="#F59E0B" />
                    <text x="330" y="124" fill="#FDE047" fontSize="10" fontWeight="bold">
                      f = {calculation.calculatedMullionDeflectionMm} mm (lim: {calculation.permissibleMullionDeflectionMm} mm)
                    </text>

                    {/* Support brackets at slabs */}
                    <rect x="242" y="27" width="16" height="12" fill="#E2E8F0" rx="1.5" />
                    <text x="265" y="38" fill="#CBD5E1" fontSize="8">Appui Glissant (Dilatation)</text>

                    <rect x="242" y="201" width="16" height="12" fill="#E2E8F0" rx="1.5" />
                    <text x="265" y="204" fill="#CBD5E1" fontSize="8">Appui Fixe (Poids propre + Vent)</text>
                  </svg>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'anchors' && (
            <div className="space-y-6">
              {/* Structural Anchors Summary */}
              <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-4">
                <div className="flex items-center space-x-2">
                  <Wrench className="w-5 h-5 text-sky-400 shrink-0" />
                  <h3 className="text-sm font-bold text-white">
                    Dimensionnement des Fixations & Dilatation Thermique
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-400 block font-mono">Réaction Vent à l Appui</span>
                    <span className="text-lg font-bold text-sky-400">
                      {calculation.anchorReactions.windReactionMaxDan} daN
                    </span>
                    <span className="text-[10px] text-slate-500 block mt-0.5">Effort horizontal de traction</span>
                  </div>

                  <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-400 block font-mono">Charge Poids Propre</span>
                    <span className="text-lg font-bold text-emerald-400">
                      {calculation.anchorReactions.deadLoadAnchorDan} daN
                    </span>
                    <span className="text-[10px] text-slate-500 block mt-0.5">Poids verres + profilés</span>
                  </div>

                  <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-400 block font-mono">Jeu Dilatation Manchon</span>
                    <span className="text-lg font-bold text-amber-400">
                      {calculation.thermalExpansionGapMm} mm
                    </span>
                    <span className="text-[10px] text-slate-500 block mt-0.5">Écart thermique Delta T = 60°C</span>
                  </div>
                </div>

                <div className="p-3 bg-slate-900/40 rounded-xl border border-slate-800 space-y-1.5 text-xs text-slate-300">
                  <p className="font-semibold text-sky-300">Cheville d ancrage préconisée :</p>
                  <p>{calculation.anchorReactions.anchorBoltRecommendedFr}</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'dtu' && (
            <div className="space-y-6">
              {/* DTU 33.1 Rules Overview */}
              <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-3">
                <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                  <ShieldCheck className="w-5 h-5 text-sky-400" />
                  <span>Règles de Calcul & Tolérances selon NF DTU 33.1</span>
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Le NF DTU 33.1 et la norme européenne NF EN 13830 imposent des limitations strictes sur la flèche sous vent des montants de façade rideau pour garantir l étanchéité à l air et à l eau et prévenir tout bris de verre par coincement en feuillure :
                </p>
                <div className="space-y-2 pt-1 text-xs text-slate-300">
                  <div className="p-2.5 rounded-lg bg-slate-900/70 border border-slate-800">
                    <strong className="text-sky-400 block mb-0.5">Portée L &le; 3.00 m :</strong>
                    Flèche maximale admissible : <strong>f &le; L / 200</strong>, sans excéder 15 mm.
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-900/70 border border-slate-800">
                    <strong className="text-sky-400 block mb-0.5">Portée 3.00 m &lt; L &le; 7.50 m :</strong>
                    Flèche maximale admissible : <strong>f &le; L / 300 + 5 mm</strong>, plafonnée à 15 mm pour préserver le scellement périphérique des doubles vitrages isolants.
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-900/70 border border-slate-800">
                    <strong className="text-sky-400 block mb-0.5">Flèche des traverses sous poids propre :</strong>
                    Flèche verticale admissible : <strong>f &le; 3 mm</strong> (ou L/500) pour garantir l écoulement des eaux d infiltration vers les montants drainants.
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-4 py-3 sm:px-6 sm:py-4 border-t border-slate-800 bg-slate-950/80 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center space-x-2 text-xs text-slate-400">
            <span>Réf : <strong className="text-white">{facadeReference}</strong></span>
            <span>•</span>
            <span>Flèche : <strong className="text-sky-400">{calculation.calculatedMullionDeflectionMm} mm</strong></span>
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
              className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold rounded-xl transition-all shadow-lg shadow-sky-600/20 min-h-[44px] flex items-center space-x-1.5 disabled:opacity-50"
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
