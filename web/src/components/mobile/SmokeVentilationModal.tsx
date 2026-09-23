import React, { useState, useMemo } from 'react';
import {
  X,
  FileText,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Sliders,
  Activity,
  Compass,
  Check,
  Flame,
  Gauge,
} from 'lucide-react';
import { playTactileClick, playSwitchSound } from '../../utils/audioFeedback';
import {
  type DenfcInstallationSite,
  type DenfcActuatorType,
  type ReliabilityClass,
  type TemperatureClass,
  ACTUATOR_CATALOG,
  computeSmokeVentilationAudit,
} from '../../utils/smokeVentilationManager';
import { generateSmokeVentilationNoticePdf } from '../../utils/pdfGenerator';

interface SmokeVentilationModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialWidth?: number;
  initialHeight?: number;
  projectReference?: string;
  wilayaName?: string;
  clientName?: string;
}

export const SmokeVentilationModal: React.FC<SmokeVentilationModalProps> = ({
  isOpen,
  onClose,
  initialWidth = 1200,
  initialHeight = 1200,
  projectReference = 'Exutoire DENFC Toiture / Façade',
  wilayaName = 'Alger',
  clientName = 'Chantier Client',
}) => {
  const [activeTab, setActiveTab] = useState<'config' | 'aeraulics_forces' | 'cad_diagram' | 'fire_standards'>('config');

  // Interactive Inputs
  const [installationSite, setInstallationSite] = useState<DenfcInstallationSite>('roof_flat_curb_skydome');
  const [actuatorType, setActuatorType] = useState<DenfcActuatorType>('electric_rack_pinion_24v');
  const [sashWidthMm, setSashWidthMm] = useState<number>(initialWidth);
  const [sashHeightMm, setSashHeightMm] = useState<number>(initialHeight);
  const [openingAngleDeg, setOpeningAngleDeg] = useState<number>(60);
  const [actuatorStrokeMm, setActuatorStrokeMm] = useState<number>(750);
  const [glazingType, setGlazingType] = useState<'polycarbonate_16mm' | 'polycarbonate_32mm' | 'insulated_double_glass' | 'insulated_opaque_panel'>('polycarbonate_16mm');
  const [roomFloorAreaM2, setRoomFloorAreaM2] = useState<number>(80);
  const [targetUsefulRatioPercent, setTargetUsefulRatioPercent] = useState<number>(1.0);
  const [reliabilityClass, setReliabilityClass] = useState<ReliabilityClass>('Re_1000_dual_comfort_smoke');
  const [temperatureClass, setTemperatureClass] = useState<TemperatureClass>('B_300_30min');
  const [hasWindDeflectors, setHasWindDeflectors] = useState<boolean>(true);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  // Compute Audit Results
  const audit = useMemo(() => {
    return computeSmokeVentilationAudit({
      installationSite,
      actuatorType,
      sashWidthMm,
      sashHeightMm,
      openingAngleDeg,
      actuatorStrokeMm,
      glazingType,
      roomFloorAreaM2,
      targetUsefulRatioPercent,
      reliabilityClass,
      temperatureClass,
      hasWindDeflectors,
      wilayaName,
      clientName,
      projectReference,
    });
  }, [
    installationSite,
    actuatorType,
    sashWidthMm,
    sashHeightMm,
    openingAngleDeg,
    actuatorStrokeMm,
    glazingType,
    roomFloorAreaM2,
    targetUsefulRatioPercent,
    reliabilityClass,
    temperatureClass,
    hasWindDeflectors,
    wilayaName,
    clientName,
    projectReference,
  ]);

  if (!isOpen) return null;

  const handleDownloadPdf = async () => {
    playTactileClick();
    setIsGeneratingPdf(true);
    try {
      const docId = `DENFC-${Date.now().toString().slice(-6)}`;
      await generateSmokeVentilationNoticePdf({
        documentId: docId,
        projectRef: projectReference,
        clientName,
        wilayaName,
        workshopName: 'Baiti Atelier Algerie',
        result: audit,
      });
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const isOk = audit.complianceStatus === 'CONFORME';
  const isWarning = audit.complianceStatus === 'ATTENTION';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-4xl rounded-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                Audit Exutoire de Fumées & Chaleur DENFC
                <span className="text-xs px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 font-medium">
                  NF EN 12101-2
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Surface utile d évacuation (SUE), poussée des vérins et conformité sécurité incendie ERP/IGH
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadPdf}
              disabled={isGeneratingPdf}
              className="min-h-[44px] px-3 py-1.5 bg-rose-600 hover:bg-rose-500 disabled:bg-slate-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
              title="Télécharger le certificat de calcul PDF"
            >
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">
                {isGeneratingPdf ? 'Génération...' : 'Certificat PDF'}
              </span>
            </button>
            <button
              onClick={() => {
                playTactileClick();
                onClose();
              }}
              className="min-h-[44px] min-w-[44px] p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors flex items-center justify-center"
              title="Fermer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Global Compliance Status Banner */}
        <div
          className={`px-5 py-2.5 border-b flex items-center justify-between text-xs font-medium ${
            isOk
              ? 'bg-emerald-950/40 border-emerald-800/50 text-emerald-300'
              : isWarning
              ? 'bg-amber-950/40 border-amber-800/50 text-amber-300'
              : 'bg-rose-950/40 border-rose-800/50 text-rose-300'
          }`}
        >
          <div className="flex items-center gap-2">
            {isOk ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : isWarning ? (
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            )}
            <span>
              {isOk
                ? 'DENFC Conforme (Surface utile Aa suffisante, poussée vérin validée sous vent RNV 2013)'
                : isWarning
                ? 'Conforme avec Réserves (Poussée vérin proche de la limite ou marge faible sur le canton)'
                : 'Non Conforme : Surface utile insuffisante ou poussée vérin inférieure à la charge vent'}
            </span>
          </div>
          <div className="hidden sm:flex items-center gap-4 text-slate-300">
            <span>
              SUE (Aa) : <strong>{audit.aerodynamicUsefulAreaAaM2} m²</strong> / {audit.requiredUsefulAreaM2} m² ({audit.usefulAreaRatioPercent}%)
            </span>
            <span>
              Vérin : <strong>{audit.totalRequiredActuatorThrustN} N</strong> / {audit.actuatorThrustCapacityN} N ({audit.thrustCapacityRatioPercent}%)
            </span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-950/40 px-3 overflow-x-auto">
          <button
            onClick={() => {
              playSwitchSound();
              setActiveTab('config');
            }}
            className={`min-h-[44px] px-4 py-2.5 text-xs font-medium border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'config'
                ? 'border-rose-500 text-rose-400 bg-rose-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sliders className="w-4 h-4" />
            Configuration & Vantail
          </button>
          <button
            onClick={() => {
              playSwitchSound();
              setActiveTab('aeraulics_forces');
            }}
            className={`min-h-[44px] px-4 py-2.5 text-xs font-medium border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'aeraulics_forces'
                ? 'border-rose-500 text-rose-400 bg-rose-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Gauge className="w-4 h-4" />
            Aéraulique & Poussée Vérin
          </button>
          <button
            onClick={() => {
              playSwitchSound();
              setActiveTab('cad_diagram');
            }}
            className={`min-h-[44px] px-4 py-2.5 text-xs font-medium border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'cad_diagram'
                ? 'border-rose-500 text-rose-400 bg-rose-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Compass className="w-4 h-4" />
            Schéma Cinématique & Évacuation
          </button>
          <button
            onClick={() => {
              playSwitchSound();
              setActiveTab('fire_standards');
            }}
            className={`min-h-[44px] px-4 py-2.5 text-xs font-medium border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'fire_standards'
                ? 'border-rose-500 text-rose-400 bg-rose-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            Normes SSI & Sécurité Incendie
          </button>
        </div>

        {/* Tab Content Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5">
          {/* TAB 1: CONFIGURATION & VANTAIL */}
          {activeTab === 'config' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Emplacement & Dimensions */}
              <div className="bg-slate-800/60 border border-slate-700/80 rounded-xl p-4 space-y-4">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <Activity className="w-4 h-4 text-rose-400" />
                  Implantation & Dimensions du Vantail
                </h3>

                <div>
                  <label className="text-xs text-slate-400 block mb-1">Site d Implantation</label>
                  <select
                    value={installationSite}
                    onChange={(e) => {
                      playTactileClick();
                      setInstallationSite(e.target.value as DenfcInstallationSite);
                    }}
                    className="min-h-[44px] w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-xs focus:border-rose-500 focus:outline-none"
                  >
                    <option value="roof_flat_curb_skydome">Toiture Terrasse sur Costière (Skydome zénithal)</option>
                    <option value="roof_pitched_skylight">Verrière Rampante en Toiture Inclinée</option>
                    <option value="facade_vertical_sash">Façade Verticale (Châssis basculant ou projetant)</option>
                    <option value="stairwell_head_vent">Tête de Cage d Escalier (Évacuation secours)</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Largeur trémie (mm)</label>
                    <input
                      type="number"
                      value={sashWidthMm}
                      onChange={(e) => setSashWidthMm(Math.max(600, parseInt(e.target.value) || 600))}
                      className="min-h-[44px] w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:border-rose-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Longueur / Hauteur (mm)</label>
                    <input
                      type="number"
                      value={sashHeightMm}
                      onChange={(e) => setSashHeightMm(Math.max(600, parseInt(e.target.value) || 600))}
                      className="min-h-[44px] w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:border-rose-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Angle d Ouverture (°)</label>
                    <select
                      value={openingAngleDeg}
                      onChange={(e) => setOpeningAngleDeg(parseInt(e.target.value))}
                      className="min-h-[44px] w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-xs focus:border-rose-500 focus:outline-none"
                    >
                      <option value="30">30° (Angle mini réduit)</option>
                      <option value="45">45° (Standard façade)</option>
                      <option value="60">60° (Angle optimal toiture)</option>
                      <option value="90">90° (Ouverture totale 100%)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Remplissage Vantail</label>
                    <select
                      value={glazingType}
                      onChange={(e) => setGlazingType(e.target.value as any)}
                      className="min-h-[44px] w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-xs focus:border-rose-500 focus:outline-none"
                    >
                      <option value="polycarbonate_16mm">Polycarbonate alvéolaire 16 mm (Léger)</option>
                      <option value="polycarbonate_32mm">Polycarbonate 32 mm (Thermique renforcé)</option>
                      <option value="insulated_double_glass">Double vitrage isolant (Acoustique lourd)</option>
                      <option value="insulated_opaque_panel">Panneau sandwich aluminium opaque</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Surface Sol Canton (m²)</label>
                    <input
                      type="number"
                      value={roomFloorAreaM2}
                      onChange={(e) => setRoomFloorAreaM2(Math.max(10, parseInt(e.target.value) || 10))}
                      className="min-h-[44px] w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:border-rose-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Taux Utile Requis ERP</label>
                    <select
                      value={targetUsefulRatioPercent}
                      onChange={(e) => setTargetUsefulRatioPercent(parseFloat(e.target.value))}
                      className="min-h-[44px] w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-xs focus:border-rose-500 focus:outline-none"
                    >
                      <option value="1.0">1.0% de la surface au sol (ERP standard)</option>
                      <option value="2.0">2.0% de la surface au sol (Locaux à risque)</option>
                      <option value="0.5">0.5% (Escaliers et circulations)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Actionneur & Mécanisme */}
              <div className="bg-slate-800/60 border border-slate-700/80 rounded-xl p-4 space-y-4">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <Flame className="w-4 h-4 text-rose-400" />
                  Actionneur DAS & Paramètres Incendie
                </h3>

                <div>
                  <label className="text-xs text-slate-400 block mb-1">Mécanisme d Ouverture (Vérin)</label>
                  <select
                    value={actuatorType}
                    onChange={(e) => {
                      playTactileClick();
                      const nextType = e.target.value as DenfcActuatorType;
                      setActuatorType(nextType);
                      setActuatorStrokeMm(ACTUATOR_CATALOG[nextType].strokeLengthMm);
                    }}
                    className="min-h-[44px] w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-xs focus:border-rose-500 focus:outline-none"
                  >
                    {Object.values(ACTUATOR_CATALOG).map((spec) => (
                      <option key={spec.id} value={spec.id}>
                        {spec.nameFr} (Poussée {spec.nominalThrustForceN} N - Course {spec.strokeLengthMm} mm)
                      </option>
                    ))}
                  </select>
                  <p className="text-[11px] text-slate-400 mt-1.5 italic">
                    {ACTUATOR_CATALOG[actuatorType].description}
                  </p>
                </div>

                <div>
                  <label className="text-xs text-slate-400 block mb-1">Course Réelle Vérin (mm)</label>
                  <input
                    type="number"
                    value={actuatorStrokeMm}
                    onChange={(e) => setActuatorStrokeMm(Math.max(200, parseInt(e.target.value) || 200))}
                    className="min-h-[44px] w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:border-rose-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Classe de Fiabilité</label>
                    <select
                      value={reliabilityClass}
                      onChange={(e) => setReliabilityClass(e.target.value as ReliabilityClass)}
                      className="min-h-[44px] w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-xs focus:border-rose-500 focus:outline-none"
                    >
                      <option value="Re_1000_dual_comfort_smoke">Re 1000 (Mixte Aération + Désenfumage)</option>
                      <option value="Re_50_smoke_only">Re 50 (Sécurité Incendie Seule)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Tenue Température</label>
                    <select
                      value={temperatureClass}
                      onChange={(e) => setTemperatureClass(e.target.value as TemperatureClass)}
                      className="min-h-[44px] w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-xs focus:border-rose-500 focus:outline-none"
                    >
                      <option value="B_300_30min">Classe B 300 (300°C pendant 30 min)</option>
                      <option value="B_600_30min">Classe B 600 (600°C pendant 30 min)</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="deflectorCheck"
                    checked={hasWindDeflectors}
                    onChange={(e) => setHasWindDeflectors(e.target.checked)}
                    className="w-4 h-4 rounded bg-slate-900 border-slate-700 text-rose-500 focus:ring-0 cursor-pointer"
                  />
                  <label htmlFor="deflectorCheck" className="text-xs text-slate-300 cursor-pointer">
                    Bavettes brise-vent aérodynamiques latérales (+15% de débit aéraulique Cv)
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: AERAULIQUE & POUSSEE VERIN */}
          {activeTab === 'aeraulics_forces' && (
            <div className="space-y-4">
              {/* KPI Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-3">
                  <div className="text-xs text-slate-400">Surface Utile (Aa)</div>
                  <div
                    className={`text-xl font-bold mt-1 ${
                      audit.isUsefulAreaCompliant ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {audit.aerodynamicUsefulAreaAaM2} m²
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">
                    Requis : {audit.requiredUsefulAreaM2} m² ({audit.usefulAreaRatioPercent}%)
                  </div>
                </div>

                <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-3">
                  <div className="text-xs text-slate-400">Poussée Vérin</div>
                  <div
                    className={`text-xl font-bold mt-1 ${
                      audit.isActuatorForceCompliant ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {audit.actuatorThrustCapacityN} N
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">
                    Requis sous vent : {audit.totalRequiredActuatorThrustN} N ({audit.thrustCapacityRatioPercent}%)
                  </div>
                </div>

                <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-3">
                  <div className="text-xs text-slate-400">Temps d Ouverture</div>
                  <div
                    className={`text-xl font-bold mt-1 ${
                      audit.isOpeningTimeCompliant ? 'text-sky-400' : 'text-rose-400'
                    }`}
                  >
                    {audit.calculatedOpeningTimeSeconds} s
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">
                    Limite max SSI : &le; 60 s
                  </div>
                </div>

                <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-3">
                  <div className="text-xs text-slate-400">Coefficient Aéraulique</div>
                  <div className="text-xl font-bold text-amber-400 mt-1">
                    Cv = {audit.dischargeCoefficientCv}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">
                    Angle {openingAngleDeg}° {hasWindDeflectors ? '+ Bavettes' : ''}
                  </div>
                </div>
              </div>

              {/* Detailed Breakdown */}
              <div className="bg-slate-800/60 border border-slate-700 rounded-xl overflow-hidden">
                <div className="px-4 py-2.5 bg-slate-900/80 border-b border-slate-700 text-xs font-semibold text-white">
                  Bilan Aéraulique et Résistances Mécaniques (NF EN 12101-2)
                </div>
                <div className="divide-y divide-slate-700/60 text-xs">
                  <div className="flex justify-between items-center p-3">
                    <span className="text-slate-300">Surface géométrique brute du cadre (Ag)</span>
                    <span className="font-semibold text-white">{audit.geometricAreaAgM2} m²</span>
                  </div>
                  <div className="flex justify-between items-center p-3">
                    <span className="text-slate-300">Poids propre total du vantail d exutoire</span>
                    <span className="font-semibold text-white">{audit.sashWeightKg} kg (Gravité : {audit.gravityResistanceN} N)</span>
                  </div>
                  <div className="flex justify-between items-center p-3">
                    <span className="text-slate-300">Pression dynamique du vent (RNV 2013)</span>
                    <span className="font-semibold text-white">{audit.windDynamicPressurePa} Pa ({wilayaName})</span>
                  </div>
                  <div className="flex justify-between items-center p-3">
                    <span className="text-slate-300">Effort antagoniste de vent s opposant à l ouverture</span>
                    <span className="font-semibold text-rose-400">{audit.windOpposingForceN} N</span>
                  </div>
                  <div className="flex justify-between items-center p-3">
                    <span className="text-slate-300">Poussée motrice totale requise (avec marge 1.25)</span>
                    <span className="font-semibold text-white">{audit.totalRequiredActuatorThrustN} N</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: SCHEMA CINEMATIQUE & EVACUATION SVG */}
          {activeTab === 'cad_diagram' && (
            <div className="bg-slate-950/90 border border-slate-800 rounded-xl p-4 space-y-4">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-white">Cinématique d Ouverture & Évacuation des Fumées en Toiture / Façade</span>
                <span className="text-slate-400">Norme NF EN 12101-2</span>
              </div>

              {/* Interactive SVG Diagram */}
              <div className="w-full flex justify-center bg-slate-900/90 border border-slate-800 rounded-xl p-4 overflow-hidden">
                <svg viewBox="0 0 720 360" className="w-full max-w-2xl h-auto">
                  <defs>
                    <pattern id="denfcgrid" width="20" height="20" patternUnits="userSpaceOnUse">
                      <line x1="0" y1="0" x2="20" y2="0" stroke="#1e293b" strokeWidth="0.8" />
                      <line x1="0" y1="0" x2="0" y2="20" stroke="#1e293b" strokeWidth="0.8" />
                    </pattern>
                    <marker id="arrowsmoke" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
                      <polygon points="0 0, 6 3, 0 6" fill="#f43f5e" />
                    </marker>
                    <marker id="arrowthrust" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
                      <polygon points="0 0, 6 3, 0 6" fill="#10b981" />
                    </marker>
                  </defs>
                  <rect x="10" y="10" width="700" height="340" fill="url(#denfcgrid)" rx="8" />

                  {/* Curb / Costière en toiture */}
                  <rect x="70" y="220" width="400" height="70" fill="#334155" stroke="#475569" strokeWidth="2" rx="2" />
                  <text x="270" y="260" fill="#94a3b8" fontSize="10" textAnchor="middle" fontWeight="bold">COSTIÈRE TOITURE</text>
                  <text x="270" y="275" fill="#64748b" fontSize="8" textAnchor="middle">Trémie {sashWidthMm} x {sashHeightMm} mm</text>

                  {/* Fixed Hinge on Left Curb at (80, 220) */}
                  <circle cx="80" cy="220" r="6" fill="#e2e8f0" stroke="#0f172a" strokeWidth="2" />

                  {/* Opening Sash Geometry based on openingAngleDeg */}
                  {(() => {
                    const angleRad = (openingAngleDeg * Math.PI) / 180;
                    const sashLength = 340;
                    const sashEndX = 80 + Math.cos(angleRad) * sashLength;
                    const sashEndY = 220 - Math.sin(angleRad) * sashLength;

                    // Actuator mounting points:
                    // Base at (200, 250) on curb
                    // Rod connected to sash at (80 + cos * (sashLength * 0.55), 220 - sin * (sashLength * 0.55))
                    const rodConnX = 80 + Math.cos(angleRad) * (sashLength * 0.55);
                    const rodConnY = 220 - Math.sin(angleRad) * (sashLength * 0.55);

                    return (
                      <g>
                        {/* Actuator Body & Extended Rod */}
                        <line x1="200" y1="240" x2={rodConnX} y2={rodConnY} stroke="#10b981" strokeWidth="5" strokeLinecap="round" />
                        <line x1="200" y1="240" x2="200" y2="280" stroke="#475569" strokeWidth="6" />
                        <circle cx="200" cy="240" r="4" fill="#0f172a" stroke="#ffffff" strokeWidth="1" />
                        <circle cx={rodConnX} cy={rodConnY} r="4" fill="#10b981" stroke="#ffffff" strokeWidth="1" />

                        {/* Thrust Arrow along rod */}
                        <line
                          x1={200 + (rodConnX - 200) * 0.4}
                          y1={240 + (rodConnY - 240) * 0.4}
                          x2={200 + (rodConnX - 200) * 0.75}
                          y2={240 + (rodConnY - 240) * 0.75}
                          stroke="#10b981"
                          strokeWidth="2.5"
                          markerEnd="url(#arrowthrust)"
                        />
                        <text
                          x={200 + (rodConnX - 200) * 0.5 - 25}
                          y={240 + (rodConnY - 240) * 0.5}
                          fill="#10b981"
                          fontSize="8.5"
                          fontWeight="bold"
                        >
                          F_poussée = {audit.actuatorThrustCapacityN} N
                        </text>

                        {/* DENFC Sash Profile */}
                        <line
                          x1="80"
                          y1="220"
                          x2={sashEndX}
                          y2={sashEndY}
                          stroke="#f43f5e"
                          strokeWidth="10"
                          strokeLinecap="round"
                        />
                        {/* Glazing / Panel inset */}
                        <line
                          x1="85"
                          y1="216"
                          x2={sashEndX - 5}
                          y2={sashEndY + 3}
                          stroke="#38bdf8"
                          strokeWidth="4"
                        />

                        {/* Wind Deflector on Left if active */}
                        {hasWindDeflectors && (
                          <g>
                            <rect x="55" y="160" width="12" height="60" fill="#f59e0b" stroke="#ffffff" strokeWidth="1" rx="2" />
                            <text x="45" y="195" fill="#f59e0b" fontSize="7.5" textAnchor="end" fontWeight="bold">
                              Bavette Déflectrice
                            </text>
                          </g>
                        )}

                        {/* Opening Angle Arc */}
                        <path
                          d={`M 140 220 A 60 60 0 0 0 ${80 + Math.cos(angleRad) * 60} ${220 - Math.sin(angleRad) * 60}`}
                          fill="none"
                          stroke="#f59e0b"
                          strokeWidth="2"
                          strokeDasharray="3 2"
                        />
                        <text x="135" y="195" fill="#f59e0b" fontSize="9" fontWeight="bold">
                          Angle = {openingAngleDeg}°
                        </text>

                        {/* Ascending Smoke Exhaust Flow Arrows */}
                        <g transform="translate(180, 160)">
                          <line x1="0" y1="40" x2="10" y2="0" stroke="#f43f5e" strokeWidth="2.5" markerEnd="url(#arrowsmoke)" />
                          <line x1="40" y1="50" x2="55" y2="5" stroke="#f43f5e" strokeWidth="2.5" markerEnd="url(#arrowsmoke)" />
                          <line x1="80" y1="55" x2="100" y2="10" stroke="#f43f5e" strokeWidth="2.5" markerEnd="url(#arrowsmoke)" />
                          <text x="60" y="-8" fill="#f43f5e" fontSize="9" textAnchor="middle" fontWeight="bold">
                            ÉVACUATION FUMÉES (SUE {audit.aerodynamicUsefulAreaAaM2} m²)
                          </text>
                        </g>
                      </g>
                    );
                  })()}

                  {/* Summary Box on the right */}
                  <g transform="translate(510, 35)">
                    <rect x="0" y="0" width="190" height="280" fill="#0f172a" stroke="#334155" strokeWidth="1" rx="6" />
                    <text x="95" y="22" fill="#f8fafc" fontSize="9" textAnchor="middle" fontWeight="bold">
                      DONNÉES AÉRAULIQUES
                    </text>
                    <line x1="15" y1="35" x2="175" y2="35" stroke="#334155" strokeWidth="1" />

                    <text x="15" y="55" fill="#94a3b8" fontSize="7.5">Surface brute Ag :</text>
                    <text x="175" y="55" fill="#f8fafc" fontSize="8" textAnchor="end" fontWeight="bold">{audit.geometricAreaAgM2} m²</text>

                    <text x="15" y="75" fill="#94a3b8" fontSize="7.5">Coefficient débit Cv :</text>
                    <text x="175" y="75" fill="#f59e0b" fontSize="8" textAnchor="end" fontWeight="bold">{audit.dischargeCoefficientCv}</text>

                    <text x="15" y="95" fill="#94a3b8" fontSize="7.5">Surface utile SUE (Aa) :</text>
                    <text x="175" y="95" fill={audit.isUsefulAreaCompliant ? '#10b981' : '#f43f5e'} fontSize="8" textAnchor="end" fontWeight="bold">{audit.aerodynamicUsefulAreaAaM2} m²</text>

                    <text x="15" y="115" fill="#94a3b8" fontSize="7.5">SUE requise ERP :</text>
                    <text x="175" y="115" fill="#94a3b8" fontSize="8" textAnchor="end">{audit.requiredUsefulAreaM2} m²</text>

                    <text x="15" y="135" fill="#94a3b8" fontSize="7.5">Poids vantail :</text>
                    <text x="175" y="135" fill="#f8fafc" fontSize="8" textAnchor="end" fontWeight="bold">{audit.sashWeightKg} kg</text>

                    <text x="15" y="155" fill="#94a3b8" fontSize="7.5">Effort vent RNV :</text>
                    <text x="175" y="155" fill="#38bdf8" fontSize="8" textAnchor="end" fontWeight="bold">{audit.windOpposingForceN} N</text>

                    <text x="15" y="175" fill="#94a3b8" fontSize="7.5">Poussée vérin requise :</text>
                    <text x="175" y="175" fill="#f8fafc" fontSize="8" textAnchor="end" fontWeight="bold">{audit.totalRequiredActuatorThrustN} N</text>

                    <text x="15" y="195" fill="#94a3b8" fontSize="7.5">Temps d ouverture :</text>
                    <text x="175" y="195" fill="#10b981" fontSize="8" textAnchor="end" fontWeight="bold">{audit.calculatedOpeningTimeSeconds} s (&le; 60s)</text>

                    <rect x="12" y="215" width="166" height="52" fill="#1e293b" rx="4" />
                    <text x="95" y="232" fill="#cbd5e1" fontSize="7.5" textAnchor="middle" fontWeight="bold">
                      CONSIGNE SÉCURITÉ SSI :
                    </text>
                    <text x="95" y="246" fill="#94a3b8" fontSize="6.8" textAnchor="middle">
                      Ligne 24V câble CR1 2x2.5mm²
                    </text>
                    <text x="95" y="258" fill="#94a3b8" fontSize="6.8" textAnchor="middle">
                      Contact fin de course raccordé
                    </text>
                  </g>
                </svg>
              </div>
            </div>
          )}

          {/* TAB 4: NORMES SSI & SECURITE INCENDIE */}
          {activeTab === 'fire_standards' && (
            <div className="space-y-4">
              {/* Checklist Incendie */}
              <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-4 space-y-3">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  Conformité Réglementaire Arrêté Incendie & NF EN 12101-2
                </h3>

                <div className="space-y-2 text-xs">
                  <div className="flex items-start gap-3 p-3 bg-slate-900/80 rounded-lg border border-slate-800">
                    <div className="mt-0.5">
                      {audit.isUsefulAreaCompliant ? (
                        <Check className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <X className="w-4 h-4 text-rose-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-white">
                        Surface utile d évacuation des fumées (SUE / Aa)
                      </div>
                      <p className="text-slate-400 text-[11px] mt-0.5">
                        Surface obtenue : {audit.aerodynamicUsefulAreaAaM2} m² pour {audit.requiredUsefulAreaM2} m² minimum légal (couverture de {audit.usefulAreaRatioPercent}% de l objectif ERP).
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-slate-900/80 rounded-lg border border-slate-800">
                    <div className="mt-0.5">
                      {audit.isActuatorForceCompliant ? (
                        <Check className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <X className="w-4 h-4 text-rose-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-white">
                        Force motrice du vérin sous vent RNV 2013
                      </div>
                      <p className="text-slate-400 text-[11px] mt-0.5">
                        Poussée nominale : {audit.actuatorThrustCapacityN} N contre {audit.totalRequiredActuatorThrustN} N requis. Le vérin vaincra le vent et la gravité en cas d incendie.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-slate-900/80 rounded-lg border border-slate-800">
                    <div className="mt-0.5">
                      {audit.isOpeningTimeCompliant ? (
                        <Check className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <X className="w-4 h-4 text-rose-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-white">
                        Temps d ouverture maximal sous alerte (&le; 60 secondes)
                      </div>
                      <p className="text-slate-400 text-[11px] mt-0.5">
                        Ouverture totale en {audit.calculatedOpeningTimeSeconds} secondes. Évacuation rapide des gaz chauds toxiques pour protéger les voies de secours.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-slate-900/80 rounded-lg border border-slate-800">
                    <div className="mt-0.5">
                      <Check className="w-4 h-4 text-emerald-400" />
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-white">
                        Classification haute température et endurance
                      </div>
                      <p className="text-slate-400 text-[11px] mt-0.5">
                        Homologation {audit.temperatureClass} (maintien sous feu intense) et endurance {audit.reliabilityClass}.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recommendations Box */}
              <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-4 space-y-3">
                <h4 className="text-xs font-semibold text-white uppercase tracking-wider">
                  Recommandations Techniques et Essais Périodiques
                </h4>
                <div className="space-y-1.5">
                  {audit.recommendations.map((rec, idx) => (
                    <div
                      key={idx}
                      className="text-xs text-slate-300 flex items-start gap-2 bg-slate-900/60 p-2 rounded-lg border border-slate-800"
                    >
                      <span className="text-rose-400 font-bold">•</span>
                      <span>{rec}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-slate-800 bg-slate-950/80 text-xs">
          <div className="text-slate-400 hidden sm:block">
            Calcul conforme aux normes NF EN 12101-2, NF S 61-937 et Arrêté de sécurité incendie
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={() => {
                playTactileClick();
                onClose();
              }}
              className="min-h-[44px] px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold transition-colors"
            >
              Fermer
            </button>
            <button
              onClick={handleDownloadPdf}
              disabled={isGeneratingPdf}
              className="min-h-[44px] px-4 py-2 bg-rose-600 hover:bg-rose-500 disabled:bg-slate-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <FileText className="w-4 h-4" />
              {isGeneratingPdf ? 'Génération...' : 'Télécharger Certificat PDF'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
