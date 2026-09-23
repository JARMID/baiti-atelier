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
  Sun,
} from 'lucide-react';
import { playTactileClick, playSwitchSound } from '../../utils/audioFeedback';
import {
  type LouverBladeType,
  type LouverLayoutType,
  type BracketMaterial,
  type AnchorSubstrate,
  LOUVER_BLADE_CATALOG,
  computeBriseSoleilAudit,
} from '../../utils/briseSoleilManager';
import { generateBriseSoleilNoticePdf } from '../../utils/pdfGenerator';

interface BriseSoleilModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialWidth?: number;
  initialHeight?: number;
  projectReference?: string;
  wilayaName?: string;
  clientName?: string;
}

export const BriseSoleilModal: React.FC<BriseSoleilModalProps> = ({
  isOpen,
  onClose,
  initialWidth = 1400,
  projectReference = 'Casquette Brise-Soleil Façade Sud',
  wilayaName = 'Alger',
  clientName = 'Chantier Client',
}) => {
  const [activeTab, setActiveTab] = useState<'config' | 'wind_aerodynamics' | 'cad_diagram' | 'eurocode9_anchors'>('config');

  // Interactive Inputs
  const [layoutType, setLayoutType] = useState<LouverLayoutType>('horizontal_canopy_cantilever');
  const [bladeType, setBladeType] = useState<LouverBladeType>('airfoil_wing_250');
  const [cantileverArmLengthMm, setCantileverArmLengthMm] = useState<number>(900);
  const [bladeSpanMm, setBladeSpanMm] = useState<number>(initialWidth || 1500);
  const [bladePitchMm, setBladePitchMm] = useState<number>(220);
  const [bracketHeightMm, setBracketHeightMm] = useState<number>(200);
  const [bracketMaterial, setBracketMaterial] = useState<BracketMaterial>('extruded_alu_6063_t6');
  const [anchorSubstrate, setAnchorSubstrate] = useState<AnchorSubstrate>('reinforced_concrete_c25');
  const [buildingFloorLevel, setBuildingFloorLevel] = useState<number>(4);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  // Compute Audit Results
  const audit = useMemo(() => {
    return computeBriseSoleilAudit({
      layoutType,
      bladeType,
      cantileverArmLengthMm,
      bladeSpanMm,
      bladePitchMm,
      bracketHeightMm,
      bracketMaterial,
      anchorSubstrate,
      buildingFloorLevel,
      wilayaName,
      clientName,
      projectReference,
    });
  }, [
    layoutType,
    bladeType,
    cantileverArmLengthMm,
    bladeSpanMm,
    bladePitchMm,
    bracketHeightMm,
    bracketMaterial,
    anchorSubstrate,
    buildingFloorLevel,
    wilayaName,
    clientName,
    projectReference,
  ]);

  if (!isOpen) return null;

  const handleDownloadPdf = async () => {
    playTactileClick();
    setIsGeneratingPdf(true);
    try {
      const docId = `LOUV-${Date.now().toString().slice(-6)}`;
      await generateBriseSoleilNoticePdf({
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
            <div className="p-2 bg-orange-500/10 border border-orange-500/20 rounded-xl text-orange-400">
              <Sun className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                Audit Brise-Soleil Architectural & Consoles
                <span className="text-xs px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-300 border border-orange-500/30 font-medium">
                  Eurocode 9 / RNV 2013
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Calcul aérodynamique des lames, moment d encastrement, flèche et ancrages CSTB 3712
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadPdf}
              disabled={isGeneratingPdf}
              className="min-h-[44px] px-3 py-1.5 bg-orange-600 hover:bg-orange-500 disabled:bg-slate-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
              title="Télécharger la note de calcul PDF"
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
                ? 'Structure Brise-Soleil Conforme (Résistance flexion, flèche et ancrages validés Eurocode 9)'
                : isWarning
                ? 'Conforme avec Réserves (Taux de contrainte élevé ou flèche proche du seuil L/200)'
                : 'Non Conforme : Surcontrainte en pied de console ou risque d arrachement aux ancrages'}
            </span>
          </div>
          <div className="hidden sm:flex items-center gap-4 text-slate-300">
            <span>
              Moment : <strong>{audit.cantileverBendingMomentNm} N.m</strong>
            </span>
            <span>
              Contrainte : <strong>{audit.bracketBendingStressMpa} MPa</strong> ({audit.stressUtilizationPercent}%)
            </span>
            <span>
              Flèche : <strong>{audit.tipDeflectionMm} mm</strong> / {audit.allowableDeflectionMm} mm
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
                ? 'border-orange-500 text-orange-400 bg-orange-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sliders className="w-4 h-4" />
            Configuration & Lames
          </button>
          <button
            onClick={() => {
              playSwitchSound();
              setActiveTab('wind_aerodynamics');
            }}
            className={`min-h-[44px] px-4 py-2.5 text-xs font-medium border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'wind_aerodynamics'
                ? 'border-orange-500 text-orange-400 bg-orange-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Wind className="w-4 h-4" />
            Efforts Aérodynamiques & RNV 2013
          </button>
          <button
            onClick={() => {
              playSwitchSound();
              setActiveTab('cad_diagram');
            }}
            className={`min-h-[44px] px-4 py-2.5 text-xs font-medium border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'cad_diagram'
                ? 'border-orange-500 text-orange-400 bg-orange-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Compass className="w-4 h-4" />
            Schéma Porte-à-Faux & Consoles
          </button>
          <button
            onClick={() => {
              playSwitchSound();
              setActiveTab('eurocode9_anchors');
            }}
            className={`min-h-[44px] px-4 py-2.5 text-xs font-medium border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'eurocode9_anchors'
                ? 'border-orange-500 text-orange-400 bg-orange-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            Eurocode 9 & Ancrages
          </button>
        </div>

        {/* Tab Content Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5">
          {/* TAB 1: CONFIGURATION & LAMES */}
          {activeTab === 'config' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Géométrie & Consoles */}
              <div className="bg-slate-800/60 border border-slate-700/80 rounded-xl p-4 space-y-4">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <Activity className="w-4 h-4 text-orange-400" />
                  Disposition & Saillie en Porte-à-Faux
                </h3>

                <div>
                  <label className="text-xs text-slate-400 block mb-1">Disposition du Brise-Soleil</label>
                  <select
                    value={layoutType}
                    onChange={(e) => {
                      playTactileClick();
                      setLayoutType(e.target.value as LouverLayoutType);
                    }}
                    className="min-h-[44px] w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-xs focus:border-orange-500 focus:outline-none"
                  >
                    <option value="horizontal_canopy_cantilever">Casquette Horizontale en Porte-à-Faux (Auvent)</option>
                    <option value="vertical_facade_screens">Lames Verticales Brise-Vue / Façade</option>
                    <option value="slanted_pergola_blades">Pergola Solaire à Lames Inclinées</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Saillie console (mm)</label>
                    <input
                      type="number"
                      value={cantileverArmLengthMm}
                      onChange={(e) => setCantileverArmLengthMm(Math.max(300, parseInt(e.target.value) || 300))}
                      className="min-h-[44px] w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:border-orange-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Portée entre consoles (mm)</label>
                    <input
                      type="number"
                      value={bladeSpanMm}
                      onChange={(e) => setBladeSpanMm(Math.max(600, parseInt(e.target.value) || 600))}
                      className="min-h-[44px] w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:border-orange-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Pas entre lames (mm)</label>
                    <input
                      type="number"
                      value={bladePitchMm}
                      onChange={(e) => setBladePitchMm(Math.max(100, parseInt(e.target.value) || 100))}
                      className="min-h-[44px] w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:border-orange-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Hauteur platine (mm)</label>
                    <input
                      type="number"
                      value={bracketHeightMm}
                      onChange={(e) => setBracketHeightMm(Math.max(120, parseInt(e.target.value) || 120))}
                      className="min-h-[44px] w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:border-orange-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs text-slate-400 block mb-1">Niveau Étage Bâtiment</label>
                  <select
                    value={buildingFloorLevel}
                    onChange={(e) => setBuildingFloorLevel(parseInt(e.target.value))}
                    className="min-h-[44px] w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-xs focus:border-orange-500 focus:outline-none"
                  >
                    <option value="0">Rez-de-chaussée (RDC)</option>
                    <option value="2">2ème étage (R+2)</option>
                    <option value="4">4ème étage (R+4)</option>
                    <option value="8">8ème étage (R+8 - Forte exposition)</option>
                    <option value="12">12ème étage (R+12 - Vent critique)</option>
                  </select>
                </div>
              </div>

              {/* Lames & Structure */}
              <div className="bg-slate-800/60 border border-slate-700/80 rounded-xl p-4 space-y-4">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <Sun className="w-4 h-4 text-orange-400" />
                  Profil de Lame & Matériaux de Console
                </h3>

                <div>
                  <label className="text-xs text-slate-400 block mb-1">Modèle de Lame d Ombrage</label>
                  <select
                    value={bladeType}
                    onChange={(e) => {
                      playTactileClick();
                      setBladeType(e.target.value as LouverBladeType);
                    }}
                    className="min-h-[44px] w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-xs focus:border-orange-500 focus:outline-none"
                  >
                    {Object.values(LOUVER_BLADE_CATALOG).map((spec) => (
                      <option key={spec.id} value={spec.id}>
                        {spec.nameFr} (Corde {spec.chordWidthMm} mm - {spec.linearWeightKgPerM} kg/m)
                      </option>
                    ))}
                  </select>
                  <p className="text-[11px] text-slate-400 mt-1.5 italic">
                    {LOUVER_BLADE_CATALOG[bladeType].description}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Matériau Console</label>
                    <select
                      value={bracketMaterial}
                      onChange={(e) => setBracketMaterial(e.target.value as BracketMaterial)}
                      className="min-h-[44px] w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-xs focus:border-orange-500 focus:outline-none"
                    >
                      <option value="extruded_alu_6063_t6">Aluminium 6063-T6 (Léger & Anodisé)</option>
                      <option value="galvanized_steel_s235">Acier Galvanisé S235 (Haute Résistance)</option>
                      <option value="stainless_steel_316">Inox AISI 316 (Marine & Corrosion)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Support d Ancrage</label>
                    <select
                      value={anchorSubstrate}
                      onChange={(e) => setAnchorSubstrate(e.target.value as AnchorSubstrate)}
                      className="min-h-[44px] w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-xs focus:border-orange-500 focus:outline-none"
                    >
                      <option value="reinforced_concrete_c25">Béton Armé C25/30 (Scellement Chimique)</option>
                      <option value="steel_substructure">Ossature Métallique (Boulonnage Traversant)</option>
                      <option value="solid_brick_masonry">Maçonnerie Pleine (Tamis d Injection)</option>
                    </select>
                  </div>
                </div>

                {/* Calculation Quick Facts */}
                <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-lg space-y-1.5 text-xs text-slate-300">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Nombre de lames par console :</span>
                    <span className="font-bold text-white">{audit.bladeCountPerBracket} lames</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Surface couverte par console :</span>
                    <span className="font-bold text-white">{audit.totalCanopyAreaM2.toFixed(2)} m²</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Poids propre repris par console :</span>
                    <span className="font-bold text-white">{audit.bladesDeadLoadKgPerBracket + audit.bracketSelfWeightKg} kg</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: EFFORTS AERODYNAMIQUES & RNV 2013 */}
          {activeTab === 'wind_aerodynamics' && (
            <div className="space-y-4">
              {/* KPI Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-3">
                  <div className="text-xs text-slate-400">Pression Vent (RNV)</div>
                  <div className="text-xl font-bold text-sky-400 mt-1">
                    {audit.windDynamicPressurePa} Pa
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">
                    Wilaya : {wilayaName} (R+{buildingFloorLevel})
                  </div>
                </div>

                <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-3">
                  <div className="text-xs text-slate-400">Succion Ascendante</div>
                  <div className="text-xl font-bold text-amber-400 mt-1">
                    {audit.upwardWindSuctionLiftN} N
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">
                    Uplift rafale vers le haut
                  </div>
                </div>

                <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-3">
                  <div className="text-xs text-slate-400">Moment d Encastrement</div>
                  <div className="text-xl font-bold text-orange-400 mt-1">
                    {audit.cantileverBendingMomentNm} N.m
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">
                    Couple en pied de console
                  </div>
                </div>

                <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-3">
                  <div className="text-xs text-slate-400">Charge Verticale ELU</div>
                  <div className="text-xl font-bold text-emerald-400 mt-1">
                    {audit.governingVerticalLoadN} N
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">
                    Combinaison régissante
                  </div>
                </div>
              </div>

              {/* Detailed Breakdown */}
              <div className="bg-slate-800/60 border border-slate-700 rounded-xl overflow-hidden">
                <div className="px-4 py-2.5 bg-slate-900/80 border-b border-slate-700 text-xs font-semibold text-white">
                  Décomposition des Charges et Combinaisons Eurocode 1 / RNV 2013
                </div>
                <div className="divide-y divide-slate-700/60 text-xs">
                  <div className="flex justify-between items-center p-3">
                    <span className="text-slate-300">Poids propre des lames d ombrage (G_lames)</span>
                    <span className="font-semibold text-white">{audit.bladesDeadLoadKgPerBracket} kg ({Math.round(audit.bladesDeadLoadKgPerBracket * 9.81)} N)</span>
                  </div>
                  <div className="flex justify-between items-center p-3">
                    <span className="text-slate-300">Poids propre de la console métallique (G_console)</span>
                    <span className="font-semibold text-white">{audit.bracketSelfWeightKg} kg</span>
                  </div>
                  <div className="flex justify-between items-center p-3">
                    <span className="text-slate-300">Force de pression descendante sous vent (Q_down)</span>
                    <span className="font-semibold text-white">{audit.downwardWindPressureN} N</span>
                  </div>
                  <div className="flex justify-between items-center p-3">
                    <span className="text-slate-300">Force de succion ascendante sous rafale (Q_up)</span>
                    <span className="font-semibold text-amber-400">{audit.upwardWindSuctionLiftN} N</span>
                  </div>
                  <div className="flex justify-between items-center p-3">
                    <span className="text-slate-300">Coefficient de traînée aérodynamique du profil</span>
                    <span className="font-semibold text-white">Cd = {audit.bladeSpec.aerodynamicDragCoefCd}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: SCHEMA PORTE-A-FAUX & CONSOLES SVG */}
          {activeTab === 'cad_diagram' && (
            <div className="bg-slate-950/90 border border-slate-800 rounded-xl p-4 space-y-4">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-white">Coupe Transversale : Console en Porte-à-Faux & Lames Ailes d Avion</span>
                <span className="text-slate-400">Norme Eurocode 9 / CSTB 3712</span>
              </div>

              {/* Interactive SVG Diagram */}
              <div className="w-full flex justify-center bg-slate-900/90 border border-slate-800 rounded-xl p-4 overflow-hidden">
                <svg viewBox="0 0 720 360" className="w-full max-w-2xl h-auto">
                  <defs>
                    <pattern id="louvgrid" width="20" height="20" patternUnits="userSpaceOnUse">
                      <line x1="0" y1="0" x2="20" y2="0" stroke="#1e293b" strokeWidth="0.8" />
                      <line x1="0" y1="0" x2="0" y2="20" stroke="#1e293b" strokeWidth="0.8" />
                    </pattern>
                    <marker id="arrowup" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
                      <polygon points="0 0, 6 3, 0 6" fill="#f59e0b" />
                    </marker>
                    <marker id="arrowdown" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
                      <polygon points="0 0, 6 3, 0 6" fill="#0284c7" />
                    </marker>
                  </defs>
                  <rect x="10" y="10" width="700" height="340" fill="url(#louvgrid)" rx="8" />

                  {/* Concrete Facade Wall (Support d ancrage) */}
                  <rect x="40" y="30" width="70" height="300" fill="#334155" stroke="#475569" strokeWidth="2" rx="2" />
                  <text x="75" y="55" fill="#94a3b8" fontSize="9" textAnchor="middle" fontWeight="bold">FAÇADE</text>
                  <text x="75" y="70" fill="#64748b" fontSize="7.5" textAnchor="middle">Béton Armé C25</text>

                  {/* Bracket Fixing Plate (Platine de fixation avec goujons) */}
                  <rect x="110" y="100" width="16" height="150" fill="#64748b" stroke="#cbd5e1" strokeWidth="1.5" rx="2" />

                  {/* Anchor Bolts (Goujons hauts et bas) */}
                  <circle cx="118" cy="120" r="5" fill="#f59e0b" stroke="#ffffff" strokeWidth="1" />
                  <line x1="118" y1="120" x2="60" y2="120" stroke="#f59e0b" strokeWidth="2" strokeDasharray="3 2" />
                  <text x="135" y="123" fill="#f59e0b" fontSize="7.5" fontWeight="bold">Traction {audit.anchorPlateTensionN} N</text>

                  <circle cx="118" cy="230" r="5" fill="#10b981" stroke="#ffffff" strokeWidth="1" />
                  <line x1="118" y1="230" x2="60" y2="230" stroke="#10b981" strokeWidth="2" strokeDasharray="3 2" />
                  <text x="135" y="233" fill="#10b981" fontSize="7.5" fontWeight="bold">Compression</text>

                  {/* Cantilever Bracket Arm (Console horizontale en porte-à-faux) */}
                  {(() => {
                    const scaledArmLength = Math.min(360, (audit.cantileverArmLengthMm / 1500) * 360);
                    const armEndX = 126 + scaledArmLength;

                    return (
                      <g>
                        {/* Main Bracket Beam */}
                        <polygon
                          points={`126,160 ${armEndX},170 ${armEndX},185 126,195`}
                          fill="#ea580c"
                          fillOpacity="0.85"
                          stroke="#ffffff"
                          strokeWidth="1.5"
                        />

                        {/* Cantilever Dimension Line */}
                        <line x1="126" y1="260" x2={armEndX} y2="260" stroke="#cbd5e1" strokeWidth="1.2" />
                        <line x1="126" y1="255" x2="126" y2="265" stroke="#cbd5e1" strokeWidth="1.2" />
                        <line x1={armEndX} y1="255" x2={armEndX} y2="265" stroke="#cbd5e1" strokeWidth="1.2" />
                        <text
                          x={126 + scaledArmLength / 2}
                          y="275"
                          fill="#cbd5e1"
                          fontSize="9"
                          textAnchor="middle"
                          fontWeight="bold"
                        >
                          Saillie L_arm = {audit.cantileverArmLengthMm} mm
                        </text>

                        {/* Deflection Curve Arrow */}
                        <line
                          x1={armEndX}
                          y1="195"
                          x2={armEndX}
                          y2="225"
                          stroke="#ef4444"
                          strokeWidth="2"
                          markerEnd="url(#arrowdown)"
                        />
                        <text x={armEndX + 8} y="215" fill="#ef4444" fontSize="8" fontWeight="bold">
                          Flèche {audit.tipDeflectionMm} mm
                        </text>

                        {/* Louver Airfoil Blades along the arm */}
                        {Array.from({ length: audit.bladeCountPerBracket }).map((_, idx) => {
                          const bladeX = 145 + idx * ((scaledArmLength - 35) / Math.max(1, audit.bladeCountPerBracket - 1));
                          const bladeY = 165;
                          return (
                            <g key={idx}>
                              {/* Elliptical airfoil blade tilted at 45 deg */}
                              <ellipse
                                cx={bladeX}
                                cy={bladeY}
                                rx="14"
                                ry="5"
                                transform={`rotate(-40 ${bladeX} ${bladeY})`}
                                fill="#38bdf8"
                                stroke="#ffffff"
                                strokeWidth="1"
                              />
                              {/* Fixation screw */}
                              <circle cx={bladeX} cy={bladeY} r="2" fill="#0f172a" />
                            </g>
                          );
                        })}

                        {/* Wind Uplift Gust Vector */}
                        <line
                          x1={126 + scaledArmLength * 0.6}
                          y1="130"
                          x2={126 + scaledArmLength * 0.6}
                          y2="90"
                          stroke="#f59e0b"
                          strokeWidth="2.5"
                          markerEnd="url(#arrowup)"
                        />
                        <text
                          x={126 + scaledArmLength * 0.6 + 5}
                          y="105"
                          fill="#f59e0b"
                          fontSize="8.5"
                          fontWeight="bold"
                        >
                          Succion Uplift {audit.upwardWindSuctionLiftN} N
                        </text>
                      </g>
                    );
                  })()}

                  {/* Summary Box on the right */}
                  <g transform="translate(520, 35)">
                    <rect x="0" y="0" width="180" height="280" fill="#0f172a" stroke="#334155" strokeWidth="1" rx="6" />
                    <text x="90" y="22" fill="#f8fafc" fontSize="9" textAnchor="middle" fontWeight="bold">
                      DONNÉES STRUCTURALES
                    </text>
                    <line x1="15" y1="35" x2="165" y2="35" stroke="#334155" strokeWidth="1" />

                    <text x="15" y="55" fill="#94a3b8" fontSize="7.5">Moment au scellement :</text>
                    <text x="165" y="55" fill="#f8fafc" fontSize="8" textAnchor="end" fontWeight="bold">{audit.cantileverBendingMomentNm} N.m</text>

                    <text x="15" y="75" fill="#94a3b8" fontSize="7.5">Contrainte flexion :</text>
                    <text x="165" y="75" fill={audit.isBracketStressOk ? '#10b981' : '#f43f5e'} fontSize="8" textAnchor="end" fontWeight="bold">{audit.bracketBendingStressMpa} MPa</text>

                    <text x="15" y="95" fill="#94a3b8" fontSize="7.5">Taux contrainte :</text>
                    <text x="165" y="95" fill="#f59e0b" fontSize="8" textAnchor="end" fontWeight="bold">{audit.stressUtilizationPercent}%</text>

                    <text x="15" y="115" fill="#94a3b8" fontSize="7.5">Flèche en bout :</text>
                    <text x="165" y="115" fill={audit.isTipDeflectionOk ? '#10b981' : '#f43f5e'} fontSize="8" textAnchor="end" fontWeight="bold">{audit.tipDeflectionMm} mm</text>

                    <text x="15" y="135" fill="#94a3b8" fontSize="7.5">Seuil limite L/200 :</text>
                    <text x="165" y="135" fill="#94a3b8" fontSize="8" textAnchor="end">{audit.allowableDeflectionMm} mm</text>

                    <text x="15" y="155" fill="#94a3b8" fontSize="7.5">Traction cheville :</text>
                    <text x="165" y="155" fill="#38bdf8" fontSize="8" textAnchor="end" fontWeight="bold">{audit.anchorPlateTensionN} N</text>

                    <text x="15" y="175" fill="#94a3b8" fontSize="7.5">Sécurité cheville :</text>
                    <text x="165" y="175" fill="#10b981" fontSize="8" textAnchor="end" fontWeight="bold">{audit.anchorSafetyFactor}x</text>

                    <text x="15" y="195" fill="#94a3b8" fontSize="7.5">Dilatation thermique :</text>
                    <text x="165" y="195" fill="#f8fafc" fontSize="8" textAnchor="end" fontWeight="bold">{audit.thermalExpansionGapMm} mm</text>

                    <rect x="12" y="215" width="156" height="52" fill="#1e293b" rx="4" />
                    <text x="90" y="232" fill="#cbd5e1" fontSize="7.5" textAnchor="middle" fontWeight="bold">
                      RECOMMANDATION POSE :
                    </text>
                    <text x="90" y="246" fill="#94a3b8" fontSize="6.8" textAnchor="middle">
                      Goujons M10/M12 scellés
                    </text>
                    <text x="90" y="258" fill="#94a3b8" fontSize="6.8" textAnchor="middle">
                      Rupteur thermique sous platine
                    </text>
                  </g>
                </svg>
              </div>
            </div>
          )}

          {/* TAB 4: EUROCODE 9 & ANCRAGES */}
          {activeTab === 'eurocode9_anchors' && (
            <div className="space-y-4">
              {/* Checklist Eurocode 9 */}
              <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-4 space-y-3">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  Vérification aux États Limites Eurocode 9 & Règles CSTB 3712
                </h3>

                <div className="space-y-2 text-xs">
                  <div className="flex items-start gap-3 p-3 bg-slate-900/80 rounded-lg border border-slate-800">
                    <div className="mt-0.5">
                      {audit.isBracketStressOk ? (
                        <Check className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <X className="w-4 h-4 text-rose-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-white">
                        Résistance à la flexion de la console (ELU - Eurocode 9)
                      </div>
                      <p className="text-slate-400 text-[11px] mt-0.5">
                        Contrainte calculée en pied : {audit.bracketBendingStressMpa} MPa contre {audit.allowableBendingStressMpa} MPa admissible (taux d utilisation {audit.stressUtilizationPercent}%).
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-slate-900/80 rounded-lg border border-slate-800">
                    <div className="mt-0.5">
                      {audit.isTipDeflectionOk ? (
                        <Check className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-amber-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-white">
                        Flèche en bout de console sous charge de service (ELS - L/200)
                      </div>
                      <p className="text-slate-400 text-[11px] mt-0.5">
                        Flèche : {audit.tipDeflectionMm} mm pour {audit.allowableDeflectionMm} mm maximum toléré. Évite les vibrations et le flottement sous rafales de vent.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-slate-900/80 rounded-lg border border-slate-800">
                    <div className="mt-0.5">
                      {audit.isAnchoringOk ? (
                        <Check className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <X className="w-4 h-4 text-rose-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-white">
                        Sécurité à l arrachement des chevilles d ancrage (CSTB 3712)
                      </div>
                      <p className="text-slate-400 text-[11px] mt-0.5">
                        Effort de traction aux fixations supérieures : {audit.anchorPlateTensionN} N. Facteur de sécurité {audit.anchorSafetyFactor}x (&ge; 1.5x requis).
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-slate-900/80 rounded-lg border border-slate-800">
                    <div className="mt-0.5">
                      {audit.thermalExpansionGapMm < 3.0 ? (
                        <Check className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-amber-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-white">
                        Compensation de la dilatation thermique longitudinale
                      </div>
                      <p className="text-slate-400 text-[11px] mt-0.5">
                        Jeu de dilatation nécessaire : {audit.thermalExpansionGapMm} mm pour un écart thermique estival de 55 K. Trous oblongs impératifs aux extrémités.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recommendations Box */}
              <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-4 space-y-3">
                <h4 className="text-xs font-semibold text-white uppercase tracking-wider">
                  Recommandations et Prescriptions de l Atelier
                </h4>
                <div className="space-y-1.5">
                  {audit.recommendations.map((rec, idx) => (
                    <div
                      key={idx}
                      className="text-xs text-slate-300 flex items-start gap-2 bg-slate-900/60 p-2 rounded-lg border border-slate-800"
                    >
                      <span className="text-orange-400 font-bold">•</span>
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
            Calcul conforme aux normes Eurocode 9 (NF EN 1999), CSTB 3712 et CNERIB DTR BC 2-47
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
              className="min-h-[44px] px-4 py-2 bg-orange-600 hover:bg-orange-500 disabled:bg-slate-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <FileText className="w-4 h-4" />
              {isGeneratingPdf ? 'Génération...' : 'Télécharger Note PDF'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
