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
  Wind,
  Anchor,
} from 'lucide-react';
import { playTactileClick, playSwitchSound } from '../../utils/audioFeedback';
import {
  type WindowOpeningStyle,
  type StayLengthInch,
  type StackHeightMm,
  type SteelGrade,
  type RestrictorType,
  type FrictionShoeMaterial,
  FRICTION_STAY_CATALOG,
  computeFrictionStayAudit,
} from '../../utils/frictionStayManager';
import { generateFrictionStayNoticePdf } from '../../utils/pdfGenerator';

interface FrictionStayModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialWidth?: number;
  initialHeight?: number;
  windowReference?: string;
  wilayaName?: string;
  clientName?: string;
}

export const FrictionStayModal: React.FC<FrictionStayModalProps> = ({
  isOpen,
  onClose,
  initialWidth = 1000,
  initialHeight = 1200,
  windowReference = 'Châssis Projetant À l Italienne',
  wilayaName = 'Alger',
  clientName = 'Chantier Client',
}) => {
  const [activeTab, setActiveTab] = useState<'config' | 'loads_wind' | 'cad_diagram' | 'safety_norms'>('config');

  // Interactive Inputs
  const [sashWidthMm, setSashWidthMm] = useState<number>(initialWidth);
  const [sashHeightMm, setSashHeightMm] = useState<number>(initialHeight);
  const [openingStyle, setOpeningStyle] = useState<WindowOpeningStyle>('top_hung_projecting');
  const [stayLengthInch, setStayLengthInch] = useState<StayLengthInch>(16);
  const [stackHeightMm, setStackHeightMm] = useState<StackHeightMm>(13);
  const [steelGrade, setSteelGrade] = useState<SteelGrade>('marine_grade_316');
  const [restrictorType, setRestrictorType] = useState<RestrictorType>('integrated_restrictor_100mm');
  const [frictionShoeMaterial, setFrictionShoeMaterial] = useState<FrictionShoeMaterial>('brass_metallic');
  const [glazingThicknessMm, setGlazingThicknessMm] = useState<number>(24);
  const [buildingFloorLevel, setBuildingFloorLevel] = useState<number>(3);
  const [isPublicBuildingOrSchool, setIsPublicBuildingOrSchool] = useState<boolean>(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  // Compute Audit Results
  const audit = useMemo(() => {
    return computeFrictionStayAudit({
      sashWidthMm,
      sashHeightMm,
      openingStyle,
      stayLengthInch,
      stackHeightMm,
      steelGrade,
      restrictorType,
      frictionShoeMaterial,
      glazingThicknessMm,
      buildingFloorLevel,
      isPublicBuildingOrSchool,
      wilayaName,
      clientName,
      windowReference,
    });
  }, [
    sashWidthMm,
    sashHeightMm,
    openingStyle,
    stayLengthInch,
    stackHeightMm,
    steelGrade,
    restrictorType,
    frictionShoeMaterial,
    glazingThicknessMm,
    buildingFloorLevel,
    isPublicBuildingOrSchool,
    wilayaName,
    clientName,
    windowReference,
  ]);

  if (!isOpen) return null;

  const handleDownloadPdf = async () => {
    playTactileClick();
    setIsGeneratingPdf(true);
    try {
      const docId = `STAY-${Date.now().toString().slice(-6)}`;
      await generateFrictionStayNoticePdf({
        documentId: docId,
        projectRef: windowReference,
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
            <div className="p-2 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-400">
              <Anchor className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                Audit Compas à Friction & Sécurité Anti-Décrochement
                <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-medium">
                  NF EN 13126-5
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Dimensionnement compas 4 barres, retenue sous vent RNV 2013 et anti-défenestration
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadPdf}
              disabled={isGeneratingPdf}
              className="min-h-[44px] px-3 py-1.5 bg-amber-600 hover:bg-amber-500 disabled:bg-slate-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
              title="Télécharger la fiche de calcul PDF"
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
                ? 'Compas Parfaitement Conformes (Capacité portante, sécurité vent et anti-chute validées)'
                : isWarning
                ? 'Conforme avec Réserves (Taux de charge élevé ou limiteur recommandé)'
                : 'Non Conforme : Vantail en surcharge critique ou limiteur obligatoire manquant'}
            </span>
          </div>
          <div className="hidden sm:flex items-center gap-4 text-slate-300">
            <span>
              Poids : <strong>{audit.totalSashWeightKg} kg</strong> / {audit.stayWeightCapacityKg} kg ({audit.weightCapacityRatioPercent}%)
            </span>
            <span>
              Vent : <strong>{audit.windDynamicPressurePa} Pa</strong> (Sécurité vis {audit.screwSafetyFactor}x)
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
                ? 'border-amber-500 text-amber-400 bg-amber-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sliders className="w-4 h-4" />
            Configuration & Compas
          </button>
          <button
            onClick={() => {
              playSwitchSound();
              setActiveTab('loads_wind');
            }}
            className={`min-h-[44px] px-4 py-2.5 text-xs font-medium border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'loads_wind'
                ? 'border-amber-500 text-amber-400 bg-amber-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Wind className="w-4 h-4" />
            Charges & Vent RNV 2013
          </button>
          <button
            onClick={() => {
              playSwitchSound();
              setActiveTab('cad_diagram');
            }}
            className={`min-h-[44px] px-4 py-2.5 text-xs font-medium border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'cad_diagram'
                ? 'border-amber-500 text-amber-400 bg-amber-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Compass className="w-4 h-4" />
            Schéma Débattement & Géométrie
          </button>
          <button
            onClick={() => {
              playSwitchSound();
              setActiveTab('safety_norms');
            }}
            className={`min-h-[44px] px-4 py-2.5 text-xs font-medium border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'safety_norms'
                ? 'border-amber-500 text-amber-400 bg-amber-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            Normes & Sécurité Anti-Chute
          </button>
        </div>

        {/* Tab Content Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5">
          {/* TAB 1: CONFIGURATION & COMPAS */}
          {activeTab === 'config' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Vantail & Dimensions */}
              <div className="bg-slate-800/60 border border-slate-700/80 rounded-xl p-4 space-y-4">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <Activity className="w-4 h-4 text-amber-400" />
                  Géométrie du Vantail & Vitrage
                </h3>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Largeur vantail (mm)</label>
                    <input
                      type="number"
                      value={sashWidthMm}
                      onChange={(e) => setSashWidthMm(Math.max(300, parseInt(e.target.value) || 300))}
                      className="min-h-[44px] w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Hauteur vantail (mm)</label>
                    <input
                      type="number"
                      value={sashHeightMm}
                      onChange={(e) => setSashHeightMm(Math.max(350, parseInt(e.target.value) || 350))}
                      className="min-h-[44px] w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs text-slate-400 block mb-1">Type d Ouverture Châssis</label>
                  <select
                    value={openingStyle}
                    onChange={(e) => {
                      playTactileClick();
                      setOpeningStyle(e.target.value as WindowOpeningStyle);
                    }}
                    className="min-h-[44px] w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-xs focus:border-amber-500 focus:outline-none"
                  >
                    <option value="top_hung_projecting">À Projection Extérieure / À l Italienne (Top-Hung)</option>
                    <option value="side_hung_projecting">À l Anglaise Projetant Latéral (Side-Hung)</option>
                    <option value="bottom_hung_hopper">Soufflet Basculant Intérieur (Hopper)</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Épaisseur Vitrage (mm)</label>
                    <select
                      value={glazingThicknessMm}
                      onChange={(e) => setGlazingThicknessMm(parseInt(e.target.value))}
                      className="min-h-[44px] w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-xs focus:border-amber-500 focus:outline-none"
                    >
                      <option value="6">Simple vitrage 6 mm (15 kg/m²)</option>
                      <option value="20">Double vitrage 4/12/4 (20 kg/m²)</option>
                      <option value="24">Double vitrage 4/16/4 (20 kg/m²)</option>
                      <option value="28">Double vitrage 6/16/6 (30 kg/m²)</option>
                      <option value="32">Double vitrage feuilleté 44.2/16/6 (35 kg/m²)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Niveau Étage Bâtiment</label>
                    <select
                      value={buildingFloorLevel}
                      onChange={(e) => setBuildingFloorLevel(parseInt(e.target.value))}
                      className="min-h-[44px] w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-xs focus:border-amber-500 focus:outline-none"
                    >
                      <option value="0">Rez-de-chaussée (RDC)</option>
                      <option value="1">1er étage (R+1 - Limiteur requis)</option>
                      <option value="3">3ème étage (R+3)</option>
                      <option value="6">6ème étage (R+6)</option>
                      <option value="10">10ème étage (R+10 - Fort vent)</option>
                      <option value="15">15ème étage et plus (Tour IGH)</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="publicSchoolCheck"
                    checked={isPublicBuildingOrSchool}
                    onChange={(e) => setIsPublicBuildingOrSchool(e.target.checked)}
                    className="w-4 h-4 rounded bg-slate-900 border-slate-700 text-amber-500 focus:ring-0 cursor-pointer"
                  />
                  <label htmlFor="publicSchoolCheck" className="text-xs text-slate-300 cursor-pointer">
                    Établissement recevant du public (ERP) ou école (NF DTU 36.5 strict)
                  </label>
                </div>
              </div>

              {/* Sélection Compas & Matériaux */}
              <div className="bg-slate-800/60 border border-slate-700/80 rounded-xl p-4 space-y-4">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <Anchor className="w-4 h-4 text-amber-400" />
                  Modèle & Caractéristiques des Compas
                </h3>

                <div>
                  <label className="text-xs text-slate-400 block mb-1">Longueur du compas à friction</label>
                  <select
                    value={stayLengthInch}
                    onChange={(e) => {
                      playTactileClick();
                      setStayLengthInch(parseInt(e.target.value) as StayLengthInch);
                    }}
                    className="min-h-[44px] w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-xs focus:border-amber-500 focus:outline-none"
                  >
                    {Object.values(FRICTION_STAY_CATALOG).map((stay) => (
                      <option key={stay.lengthInch} value={stay.lengthInch}>
                        {stay.lengthInch}" ({stay.lengthMm} mm) - Charge max {stay.maxSashWeightKg} kg (Angle {stay.maxOpeningAngleDeg}°)
                      </option>
                    ))}
                  </select>
                  <p className="text-[11px] text-slate-400 mt-1.5 italic">
                    {FRICTION_STAY_CATALOG[stayLengthInch].description}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Nuance d Inox</label>
                    <select
                      value={steelGrade}
                      onChange={(e) => setSteelGrade(e.target.value as SteelGrade)}
                      className="min-h-[44px] w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-xs focus:border-amber-500 focus:outline-none"
                    >
                      <option value="marine_grade_316">Inox AISI 316 / A4 (Recommandé littoral)</option>
                      <option value="austenitic_304">Inox AISI 304 / A2 (Standard intérieur)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Hauteur Gorge (Stack)</label>
                    <select
                      value={stackHeightMm}
                      onChange={(e) => setStackHeightMm(parseInt(e.target.value) as StackHeightMm)}
                      className="min-h-[44px] w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-xs focus:border-amber-500 focus:outline-none"
                    >
                      <option value="13">13 mm (Gorge résidentielle standard)</option>
                      <option value="17">17 mm (Gorge tertiaire / mur-rideau)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Dispositif Limiteur</label>
                    <select
                      value={restrictorType}
                      onChange={(e) => setRestrictorType(e.target.value as RestrictorType)}
                      className="min-h-[44px] w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-xs focus:border-amber-500 focus:outline-none"
                    >
                      <option value="integrated_restrictor_100mm">Limiteur intégré 100 mm (Anti-défenestration)</option>
                      <option value="detachable_safety_cable">Câble acier de sécurité détachable</option>
                      <option value="dual_retaining_arm">Double compas de retenue renforcé</option>
                      <option value="none">Aucun (Ouverture libre totale)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Patin de Friction</label>
                    <select
                      value={frictionShoeMaterial}
                      onChange={(e) => setFrictionShoeMaterial(e.target.value as FrictionShoeMaterial)}
                      className="min-h-[44px] w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-xs focus:border-amber-500 focus:outline-none"
                    >
                      <option value="brass_metallic">Laiton usiné haute tenue (Vantail lourd)</option>
                      <option value="nylon_composite">Nylon autolubrifiant (Usage résidentiel)</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CHARGES & VENT RNV 2013 */}
          {activeTab === 'loads_wind' && (
            <div className="space-y-4">
              {/* KPI Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-3">
                  <div className="text-xs text-slate-400">Poids Total Vantail</div>
                  <div
                    className={`text-xl font-bold mt-1 ${
                      audit.isWeightCapacityOk ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {audit.totalSashWeightKg} kg
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">
                    Capacité compas : {audit.stayWeightCapacityKg} kg
                  </div>
                </div>

                <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-3">
                  <div className="text-xs text-slate-400">Taux de Charge</div>
                  <div
                    className={`text-xl font-bold mt-1 ${
                      audit.weightCapacityRatioPercent <= 80
                        ? 'text-emerald-400'
                        : audit.weightCapacityRatioPercent <= 100
                        ? 'text-amber-400'
                        : 'text-rose-400'
                    }`}
                  >
                    {audit.weightCapacityRatioPercent}%
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">
                    Seuil limite : 100%
                  </div>
                </div>

                <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-3">
                  <div className="text-xs text-slate-400">Pression Vent (RNV)</div>
                  <div className="text-xl font-bold text-sky-400 mt-1">
                    {audit.windDynamicPressurePa} Pa
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">
                    Niveau R+{buildingFloorLevel} ({wilayaName})
                  </div>
                </div>

                <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-3">
                  <div className="text-xs text-slate-400">Sécurité Vis Inox</div>
                  <div
                    className={`text-xl font-bold mt-1 ${
                      audit.screwSafetyFactor >= 2.0 ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {audit.screwSafetyFactor}x
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">
                    Requis : &ge; 2.0x (Cisaillement {audit.stayFixingShearLoadPerScrewN} N/vis)
                  </div>
                </div>
              </div>

              {/* Detailed Breakdown */}
              <div className="bg-slate-800/60 border border-slate-700 rounded-xl overflow-hidden">
                <div className="px-4 py-2.5 bg-slate-900/80 border-b border-slate-700 text-xs font-semibold text-white">
                  Décomposition des Masses & Efforts Mécaniques
                </div>
                <div className="divide-y divide-slate-700/60 text-xs">
                  <div className="flex justify-between items-center p-3">
                    <span className="text-slate-300">Surface totale du vitrage</span>
                    <span className="font-semibold text-white">{audit.sashAreaM2.toFixed(2)} m²</span>
                  </div>
                  <div className="flex justify-between items-center p-3">
                    <span className="text-slate-300">Poids du vitrage seul ({glazingThicknessMm} mm)</span>
                    <span className="font-semibold text-white">{audit.glazingWeightKg} kg</span>
                  </div>
                  <div className="flex justify-between items-center p-3">
                    <span className="text-slate-300">Poids de l ossature aluminium</span>
                    <span className="font-semibold text-white">{audit.profileWeightKg} kg</span>
                  </div>
                  <div className="flex justify-between items-center p-3">
                    <span className="text-slate-300">Force gravitationnelle totale (poids propre)</span>
                    <span className="font-semibold text-white">{audit.totalGravityForceN} N</span>
                  </div>
                  <div className="flex justify-between items-center p-3">
                    <span className="text-slate-300">Force de succion dynamique rafale sur vantail ouvert</span>
                    <span className="font-semibold text-sky-400">{audit.windOutwardSuctionForceN} N</span>
                  </div>
                  <div className="flex justify-between items-center p-3">
                    <span className="text-slate-300">Proportion compas / hauteur de vantail</span>
                    <span className="font-semibold text-white">{audit.lengthToSashRatioPercent}% (Optimal : 45% à 80%)</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: SCHEMA DEBATTEMENT & GEOMETRIE COMPAS */}
          {activeTab === 'cad_diagram' && (
            <div className="bg-slate-950/90 border border-slate-800 rounded-xl p-4 space-y-4">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-white">Cinématique Compas 4 Barres & Débattement en Projection Extérieure</span>
                <span className="text-slate-400">Norme BS 6375-2 / NF EN 13126-5</span>
              </div>

              {/* Interactive SVG Diagram */}
              <div className="w-full flex justify-center bg-slate-900/90 border border-slate-800 rounded-xl p-4 overflow-hidden">
                <svg viewBox="0 0 700 360" className="w-full max-w-2xl h-auto">
                  <defs>
                    <pattern id="staygrid" width="20" height="20" patternUnits="userSpaceOnUse">
                      <line x1="0" y1="0" x2="20" y2="0" stroke="#1e293b" strokeWidth="0.8" />
                      <line x1="0" y1="0" x2="0" y2="20" stroke="#1e293b" strokeWidth="0.8" />
                    </pattern>
                    <marker id="arrowstay" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
                      <polygon points="0 0, 6 3, 0 6" fill="#f59e0b" />
                    </marker>
                    <marker id="arrowwind" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
                      <polygon points="0 0, 6 3, 0 6" fill="#38bdf8" />
                    </marker>
                  </defs>
                  <rect x="10" y="10" width="680" height="340" fill="url(#staygrid)" rx="8" />

                  {/* Window Fixed Frame (Dormant aluminium vertical) */}
                  <rect x="60" y="30" width="35" height="300" fill="#334155" stroke="#475569" strokeWidth="2" rx="2" />
                  <text x="77" y="50" fill="#94a3b8" fontSize="8.5" textAnchor="middle" fontWeight="bold">DORMANT</text>

                  {/* Friction Stay Track (Rail de guidage fixé au dormant) */}
                  <rect x="95" y="45" width="10" height="240" fill="#64748b" stroke="#cbd5e1" strokeWidth="1" rx="1" />

                  {/* Sliding Shoe (Coulisseau en laiton/nylon avec vis BTR) */}
                  <rect x="92" y="75" width="16" height="25" fill="#f59e0b" stroke="#ffffff" strokeWidth="1.2" rx="2" />
                  <circle cx="100" cy="87" r="3" fill="#0f172a" />
                  <text x="115" y="90" fill="#f59e0b" fontSize="7.5" fontWeight="bold">Patin BTR</text>

                  {/* Multi-link stay arms geometry (4-bar kinematic linkage) */}
                  {/* Fixed Pivot A at (100, 270) */}
                  <circle cx="100" cy="270" r="4.5" fill="#38bdf8" stroke="#ffffff" strokeWidth="1" />

                  {/* Slider Pivot B at (100, 87) */}
                  {/* Let opening angle affect projection offset */}
                  {(() => {
                    const angleRad = (audit.actualOpeningAngleDeg * Math.PI) / 180;
                    const sashProjX = 100 + Math.min(240, Math.sin(angleRad) * 280);

                    return (
                      <g>
                        {/* Link 1: Main long arm connecting track to sash */}
                        <line x1="100" y1="270" x2={sashProjX - 25} y2="175" stroke="#94a3b8" strokeWidth="4" strokeLinecap="round" />
                        <line x1="100" y1="87" x2={sashProjX} y2="135" stroke="#cbd5e1" strokeWidth="4" strokeLinecap="round" />
                        
                        {/* Pivot rivets */}
                        <circle cx={sashProjX - 25} cy="175" r="4" fill="#f59e0b" />
                        <circle cx={sashProjX} cy="135" r="4" fill="#f59e0b" />

                        {/* Projecting Sash (Vantail mobile incliné en projection) */}
                        <line
                          x1={100 + Math.sin(angleRad) * 50}
                          y1="50"
                          x2={sashProjX + 30}
                          y2="310"
                          stroke="#38bdf8"
                          strokeWidth="10"
                          strokeLinecap="round"
                        />
                        {/* Glazing Line inside sash */}
                        <line
                          x1={100 + Math.sin(angleRad) * 50 + 4}
                          y1="55"
                          x2={sashProjX + 34}
                          y2="305"
                          stroke="#0284c7"
                          strokeWidth="4"
                        />

                        {/* Text labels on sash */}
                        <text
                          x={sashProjX + 45}
                          y="180"
                          fill="#38bdf8"
                          fontSize="9.5"
                          fontWeight="bold"
                        >
                          VANTAIL PROJETÉ ({audit.totalSashWeightKg} kg)
                        </text>

                        {/* Opening angle arc */}
                        <path
                          d={`M 100 270 A 60 60 0 0 1 ${100 + Math.sin(angleRad) * 60} ${270 - Math.cos(angleRad) * 60}`}
                          fill="none"
                          stroke="#f59e0b"
                          strokeWidth="1.8"
                          strokeDasharray="3 3"
                        />
                        <text x="145" y="240" fill="#f59e0b" fontSize="9" fontWeight="bold">
                          Angle = {audit.actualOpeningAngleDeg}°
                        </text>

                        {/* Opening clearance dimension */}
                        <line x1="100" y1="325" x2={sashProjX + 30} y2="325" stroke="#10b981" strokeWidth="1.5" />
                        <line x1="100" y1="320" x2="100" y2="330" stroke="#10b981" strokeWidth="1.5" />
                        <line x1={sashProjX + 30} y1="320" x2={sashProjX + 30} y2="330" stroke="#10b981" strokeWidth="1.5" />
                        <text
                          x={100 + (sashProjX + 30 - 100) / 2}
                          y="340"
                          fill="#10b981"
                          fontSize="8.5"
                          textAnchor="middle"
                          fontWeight="bold"
                        >
                          Débattement net = {audit.actualMaxOpeningClearanceMm} mm (Max {audit.isRestrictorRequired ? '100 mm' : 'libre'})
                        </text>

                        {/* Wind suction vector */}
                        <line
                          x1={sashProjX + 40}
                          y1="120"
                          x2={sashProjX + 110}
                          y2="100"
                          stroke="#38bdf8"
                          strokeWidth="2.5"
                          markerEnd="url(#arrowwind)"
                        />
                        <text x={sashProjX + 85} y="90" fill="#38bdf8" fontSize="8" fontWeight="bold">
                          Succion Vent {audit.windOutwardSuctionForceN} N
                        </text>

                        {/* Restrictor safety cable / stop if active */}
                        {audit.restrictorType !== 'none' && (
                          <g>
                            <line
                              x1="100"
                              y1="180"
                              x2={sashProjX - 10}
                              y2="200"
                              stroke="#ef4444"
                              strokeWidth="2"
                              strokeDasharray="4 2"
                            />
                            <circle cx="100" cy="180" r="3" fill="#ef4444" />
                            <circle cx={sashProjX - 10} cy="200" r="3" fill="#ef4444" />
                            <text x="140" y="190" fill="#ef4444" fontSize="7.5" fontWeight="bold">
                              Limiteur 100mm
                            </text>
                          </g>
                        )}
                      </g>
                    );
                  })()}

                  {/* Summary Box on the right */}
                  <g transform="translate(500, 40)">
                    <rect x="0" y="0" width="170" height="270" fill="#0f172a" stroke="#334155" strokeWidth="1" rx="6" />
                    <text x="85" y="22" fill="#f8fafc" fontSize="9" textAnchor="middle" fontWeight="bold">
                      DONNÉES COMPAS {audit.selectedStay.lengthInch}"
                    </text>

                    <line x1="15" y1="35" x2="155" y2="35" stroke="#334155" strokeWidth="1" />

                    <text x="15" y="55" fill="#94a3b8" fontSize="7.5">Longueur compas :</text>
                    <text x="155" y="55" fill="#f8fafc" fontSize="8" textAnchor="end" fontWeight="bold">{audit.selectedStay.lengthMm} mm</text>

                    <text x="15" y="75" fill="#94a3b8" fontSize="7.5">Capacité de charge :</text>
                    <text x="155" y="75" fill="#f8fafc" fontSize="8" textAnchor="end" fontWeight="bold">{audit.stayWeightCapacityKg} kg</text>

                    <text x="15" y="95" fill="#94a3b8" fontSize="7.5">Poids vantail réel :</text>
                    <text x="155" y="95" fill={audit.isWeightCapacityOk ? '#10b981' : '#f43f5e'} fontSize="8" textAnchor="end" fontWeight="bold">{audit.totalSashWeightKg} kg</text>

                    <text x="15" y="115" fill="#94a3b8" fontSize="7.5">Taux d utilisation :</text>
                    <text x="155" y="115" fill="#f59e0b" fontSize="8" textAnchor="end" fontWeight="bold">{audit.weightCapacityRatioPercent}%</text>

                    <text x="15" y="135" fill="#94a3b8" fontSize="7.5">Pression RNV 2013 :</text>
                    <text x="155" y="135" fill="#38bdf8" fontSize="8" textAnchor="end" fontWeight="bold">{audit.windDynamicPressurePa} Pa</text>

                    <text x="15" y="155" fill="#94a3b8" fontSize="7.5">Effort cisaillement :</text>
                    <text x="155" y="155" fill="#f8fafc" fontSize="8" textAnchor="end" fontWeight="bold">{audit.stayFixingShearLoadPerScrewN} N/vis</text>

                    <text x="15" y="175" fill="#94a3b8" fontSize="7.5">Facteur sécurité vis :</text>
                    <text x="155" y="175" fill="#10b981" fontSize="8" textAnchor="end" fontWeight="bold">{audit.screwSafetyFactor}x</text>

                    <text x="15" y="195" fill="#94a3b8" fontSize="7.5">Nuance acier inox :</text>
                    <text x="155" y="195" fill="#f8fafc" fontSize="8" textAnchor="end" fontWeight="bold">{audit.steelGrade === 'marine_grade_316' ? 'AISI 316' : 'AISI 304'}</text>

                    <rect x="12" y="215" width="146" height="42" fill="#1e293b" rx="4" />
                    <text x="85" y="232" fill="#cbd5e1" fontSize="7.5" textAnchor="middle" fontWeight="bold">
                      RÉGLAGE VIS PATIN :
                    </text>
                    <text x="85" y="246" fill="#94a3b8" fontSize="6.8" textAnchor="middle">
                      Clé BTR 2.5mm hexagonale
                    </text>
                  </g>
                </svg>
              </div>
            </div>
          )}

          {/* TAB 4: NORMES & SECURITE ANTI-CHUTE */}
          {activeTab === 'safety_norms' && (
            <div className="space-y-4">
              {/* Checklist Sécurité */}
              <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-4 space-y-3">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  Conformité Réglementaire Anti-Défenestration & Normes Européennes
                </h3>

                <div className="space-y-2 text-xs">
                  <div className="flex items-start gap-3 p-3 bg-slate-900/80 rounded-lg border border-slate-800">
                    <div className="mt-0.5">
                      {audit.isWeightCapacityOk ? (
                        <Check className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <X className="w-4 h-4 text-rose-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-white">
                        Capacité portante sous poids propre (NF EN 14608 / NF EN 13126-5)
                      </div>
                      <p className="text-slate-400 text-[11px] mt-0.5">
                        Poids total : {audit.totalSashWeightKg} kg contre {audit.stayWeightCapacityKg} kg max admissible. Pas de déformation permanente sous charge de service 350 N.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-slate-900/80 rounded-lg border border-slate-800">
                    <div className="mt-0.5">
                      {audit.isRestrictorCompliant ? (
                        <Check className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <X className="w-4 h-4 text-rose-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-white">
                        Sécurité anti-défenestration et limiteur 100 mm (NF DTU 36.5)
                      </div>
                      <p className="text-slate-400 text-[11px] mt-0.5">
                        {audit.isRestrictorRequired
                          ? `Obligatoire en R+${buildingFloorLevel} : Limiteur actif avec ouverture restreinte à ${audit.actualMaxOpeningClearanceMm} mm (seuil légal <= 100 mm).`
                          : 'RDC : Ouverture libre autorisée sans obligation de limiteur.'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-slate-900/80 rounded-lg border border-slate-800">
                    <div className="mt-0.5">
                      {audit.isWindRetentionOk ? (
                        <Check className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <X className="w-4 h-4 text-rose-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-white">
                        Résistance à la succion des rafales de vent (CNERIB DTR BC 2-47 RNV 2013)
                      </div>
                      <p className="text-slate-400 text-[11px] mt-0.5">
                        Pression de calcul {audit.windDynamicPressurePa} Pa. Facteur de sécurité des 8 vis inox : {audit.screwSafetyFactor}x (&ge; 2.0x requis pour éviter l arrachement du vantail).
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-slate-900/80 rounded-lg border border-slate-800">
                    <div className="mt-0.5">
                      {audit.isCorrosionProtectionAdequate ? (
                        <Check className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-amber-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-white">
                        Résistance à la corrosion saline en milieu littoral algérien
                      </div>
                      <p className="text-slate-400 text-[11px] mt-0.5">
                        {audit.steelGrade === 'marine_grade_316'
                          ? 'Inox austénitique AISI 316 (A4) avec molybdène, excellente résistance aux chlorures marins.'
                          : 'Inox AISI 304 (A2) standard, à réserver aux wilayas intérieures non soumises aux embruns.'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recommendations Box */}
              <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-4 space-y-3">
                <h4 className="text-xs font-semibold text-white uppercase tracking-wider">
                  Directives et Recommandations Chantier
                </h4>
                <div className="space-y-1.5">
                  {audit.recommendations.map((rec, idx) => (
                    <div
                      key={idx}
                      className="text-xs text-slate-300 flex items-start gap-2 bg-slate-900/60 p-2 rounded-lg border border-slate-800"
                    >
                      <span className="text-amber-400 font-bold">•</span>
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
            Calcul conforme aux normes NF EN 13126-5, NF EN 14608 et CNERIB DTR BC 2-47
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
              className="min-h-[44px] px-4 py-2 bg-amber-600 hover:bg-amber-500 disabled:bg-slate-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
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
