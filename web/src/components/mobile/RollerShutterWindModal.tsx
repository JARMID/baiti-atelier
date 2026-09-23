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
  Gauge,
} from 'lucide-react';
import { playTactileClick, playSwitchSound } from '../../utils/audioFeedback';
import {
  type SlatProfileType,
  type GuideRailType,
  type EndLockType,
  type AlgerianWindZone,
  type TerrainRoughnessCategory,
  SLAT_CATALOG,
  GUIDE_RAIL_CATALOG,
  computeRollerShutterWindAudit,
} from '../../utils/rollerShutterWindManager';
import { generateRollerShutterWindNoticePdf } from '../../utils/pdfGenerator';

interface RollerShutterWindModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialWidth?: number;
  initialHeight?: number;
  projectReference?: string;
  wilayaName?: string;
  clientName?: string;
}

export const RollerShutterWindModal: React.FC<RollerShutterWindModalProps> = ({
  isOpen,
  onClose,
  initialWidth = 1800,
  initialHeight = 2150,
  projectReference = 'Tablier Volet Roulant RNV 2013',
  wilayaName = 'Alger',
  clientName = 'Chantier Client',
}) => {
  const [activeTab, setActiveTab] = useState<'config' | 'deflection_stress' | 'cad_diagram' | 'wind_standards'>('config');

  // Interactive Inputs
  const [curtainWidthMm, setCurtainWidthMm] = useState<number>(initialWidth);
  const [curtainHeightMm, setCurtainHeightMm] = useState<number>(initialHeight);
  const [slatType, setSlatType] = useState<SlatProfileType>('alu_dp_43_std');
  const [guideRailType, setGuideRailType] = useState<GuideRailType>('rail_std_22x53');
  const [endLockType, setEndLockType] = useState<EndLockType>('caps_std_straight');
  const [algerianWindZone, setAlgerianWindZone] = useState<AlgerianWindZone>('zone_1_littoral');
  const [terrainCategory, setTerrainCategory] = useState<TerrainRoughnessCategory>('cat_3_suburban');
  const [buildingHeightM, setBuildingHeightM] = useState<number>(10);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  // Compute Audit Results
  const audit = useMemo(() => {
    return computeRollerShutterWindAudit({
      curtainWidthMm,
      curtainHeightMm,
      slatType,
      guideRailType,
      endLockType,
      algerianWindZone,
      terrainCategory,
      buildingHeightM,
      wilayaName,
      clientName,
      projectReference,
    });
  }, [
    curtainWidthMm,
    curtainHeightMm,
    slatType,
    guideRailType,
    endLockType,
    algerianWindZone,
    terrainCategory,
    buildingHeightM,
    wilayaName,
    clientName,
    projectReference,
  ]);

  if (!isOpen) return null;

  const isOk = audit.globalStatus === 'conform';
  const isWarning = audit.globalStatus === 'warning';

  const handleDownloadPdf = async () => {
    try {
      setIsGeneratingPdf(true);
      playTactileClick();
      const docId = `VENT-${Date.now().toString().slice(-6)}`;
      await generateRollerShutterWindNoticePdf({
        documentId: docId,
        projectRef: projectReference,
        clientName,
        wilayaName,
        result: audit,
      });
    } catch (err) {
      console.error('Erreur generation PDF Tenue au Vent Volet:', err);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header Bar */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400">
              <Wind className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                <span>Tenue au Vent Volet Roulant & Flèche Tablier</span>
                <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/30">
                  NF EN 13659
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Calcul de flèche sous rafales, pénétration en coulisse et anti-déraillement RNV 2013
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadPdf}
              disabled={isGeneratingPdf}
              className="min-h-[44px] px-3.5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 disabled:bg-slate-700 text-white text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer shadow-sm active:scale-95"
              title="Exporter la note de calcul technique officielle PDF"
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
              className="min-h-[44px] min-w-[44px] p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer flex items-center justify-center"
              aria-label="Fermer la modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Global Verdict Banner */}
        <div
          className={`px-5 py-3 border-b flex flex-wrap items-center justify-between gap-3 text-xs ${
            isOk
              ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-300'
              : isWarning
                ? 'bg-amber-950/40 border-amber-800/60 text-amber-300'
                : 'bg-rose-950/40 border-rose-800/60 text-rose-300'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {isOk ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            )}
            <span className="font-semibold text-white">{audit.statusSummaryFr}</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="bg-slate-900/60 px-2.5 py-1 rounded-md border border-slate-700/60 text-slate-200">
              Classe : <strong>CLASSE {audit.achievedEn13659Class}</strong> ({audit.peakDynamicWindPressurePa} Pa)
            </span>
            <span className="bg-slate-900/60 px-2.5 py-1 rounded-md border border-slate-700/60 text-slate-200">
              Pénétration résiduelle : <strong>{audit.residualBiteDepthMm} mm</strong> (min {audit.minSafeBiteDepthMm} mm)
            </span>
            <span className="bg-slate-900/60 px-2.5 py-1 rounded-md border border-slate-700/60 text-slate-200">
              Flèche : <strong>{audit.midSpanDeflectionMm} mm</strong> (L/{audit.deflectionSpanRatio})
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
                ? 'border-sky-500 text-sky-400 bg-sky-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sliders className="w-4 h-4" />
            Configuration & Tablier
          </button>
          <button
            onClick={() => {
              playSwitchSound();
              setActiveTab('deflection_stress');
            }}
            className={`min-h-[44px] px-4 py-2.5 text-xs font-medium border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'deflection_stress'
                ? 'border-sky-500 text-sky-400 bg-sky-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Gauge className="w-4 h-4" />
            Flèche & Pénétration Coulisse
          </button>
          <button
            onClick={() => {
              playSwitchSound();
              setActiveTab('cad_diagram');
            }}
            className={`min-h-[44px] px-4 py-2.5 text-xs font-medium border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'cad_diagram'
                ? 'border-sky-500 text-sky-400 bg-sky-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Compass className="w-4 h-4" />
            Schéma Technique CAD (Coupe & Flexion)
          </button>
          <button
            onClick={() => {
              playSwitchSound();
              setActiveTab('wind_standards');
            }}
            className={`min-h-[44px] px-4 py-2.5 text-xs font-medium border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'wind_standards'
                ? 'border-sky-500 text-sky-400 bg-sky-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            Normes NF EN 13659 & RNV 2013
          </button>
        </div>

        {/* Tab Content Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5">
          {/* TAB 1: CONFIGURATION & TABLIER */}
          {activeTab === 'config' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Dimensions et Profil de Lame */}
              <div className="bg-slate-800/60 border border-slate-700/80 rounded-xl p-4 space-y-4">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <Activity className="w-4 h-4 text-sky-400" />
                  Dimensions de Baie & Lame de Tablier
                </h3>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Largeur dos coulisses (mm)</label>
                    <input
                      type="number"
                      value={curtainWidthMm}
                      onChange={(e) => setCurtainWidthMm(Math.max(600, parseInt(e.target.value) || 600))}
                      className="min-h-[44px] w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:border-sky-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Hauteur tablier (mm)</label>
                    <input
                      type="number"
                      value={curtainHeightMm}
                      onChange={(e) => setCurtainHeightMm(Math.max(600, parseInt(e.target.value) || 600))}
                      className="min-h-[44px] w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:border-sky-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs text-slate-400 block mb-1">Type de Lame de Volet</label>
                  <select
                    value={slatType}
                    onChange={(e) => {
                      playTactileClick();
                      setSlatType(e.target.value as SlatProfileType);
                    }}
                    className="min-h-[44px] w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-xs focus:border-sky-500 focus:outline-none"
                  >
                    {Object.values(SLAT_CATALOG).map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.nameFr} (Ixx {s.momentOfInertiaCm4} cm4 - Portée max {s.maxRecommendedSpanM} m)
                      </option>
                    ))}
                  </select>
                  <p className="text-[11px] text-slate-400 mt-1.5 italic">
                    {SLAT_CATALOG[slatType].description}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800 text-xs">
                    <span className="text-slate-400 block">Masse surfacique</span>
                    <strong className="text-white text-sm">{audit.slatSpec.linearMassKgM2} kg/m²</strong>
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      Poids total : {audit.curtainTotalWeightKg} kg ({audit.totalSlatCount} lames)
                    </span>
                  </div>
                  <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800 text-xs">
                    <span className="text-slate-400 block">Inertie de flexion</span>
                    <strong className="text-white text-sm">{audit.slatSpec.momentOfInertiaCm4} cm4</strong>
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      Wel = {audit.slatSpec.sectionModulusCm3} cm3 (fy {audit.slatSpec.yieldStrengthMpa} MPa)
                    </span>
                  </div>
                </div>
              </div>

              {/* Coulisses de guidage et Embouts */}
              <div className="bg-slate-800/60 border border-slate-700/80 rounded-xl p-4 space-y-4">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <Wind className="w-4 h-4 text-sky-400" />
                  Coulisses de Guidage & Exposition Vent
                </h3>

                <div>
                  <label className="text-xs text-slate-400 block mb-1">Modèle de Coulisse Latérale</label>
                  <select
                    value={guideRailType}
                    onChange={(e) => {
                      playTactileClick();
                      setGuideRailType(e.target.value as GuideRailType);
                    }}
                    className="min-h-[44px] w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-xs focus:border-sky-500 focus:outline-none"
                  >
                    {Object.values(GUIDE_RAIL_CATALOG).map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.nameFr}
                      </option>
                    ))}
                  </select>
                  <p className="text-[11px] text-slate-400 mt-1.5 italic">
                    {GUIDE_RAIL_CATALOG[guideRailType].description}
                  </p>
                </div>

                <div>
                  <label className="text-xs text-slate-400 block mb-1">Embouts d Extrémité de Lame</label>
                  <select
                    value={endLockType}
                    onChange={(e) => {
                      playTactileClick();
                      setEndLockType(e.target.value as EndLockType);
                    }}
                    className="min-h-[44px] w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-xs focus:border-sky-500 focus:outline-none"
                  >
                    <option value="caps_std_straight">Embouts droits en polyamide (Glissement libre classique)</option>
                    <option value="caps_anti_storm_hooks">Embouts à crochets ergots anti-tempête (Verrouillage positif)</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Zone de Vent RNV 2013</label>
                    <select
                      value={algerianWindZone}
                      onChange={(e) => setAlgerianWindZone(e.target.value as AlgerianWindZone)}
                      className="min-h-[44px] w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-xs focus:border-sky-500 focus:outline-none"
                    >
                      <option value="zone_1_littoral">Zone I : Littoral (Alger, Oran, Annaba)</option>
                      <option value="zone_2_hauts_plateaux">Zone II : Hauts Plateaux (Sétif, Batna)</option>
                      <option value="zone_3_sud_saharien">Zone III : Sud Saharien (Biskra, Ghardaia)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Rugosité du Terrain</label>
                    <select
                      value={terrainCategory}
                      onChange={(e) => setTerrainCategory(e.target.value as TerrainRoughnessCategory)}
                      className="min-h-[44px] w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-xs focus:border-sky-500 focus:outline-none"
                    >
                      <option value="cat_3_suburban">Cat III : Suburbain / Bâtiments moyens</option>
                      <option value="cat_1_seaside_exposed">Cat I : Bord de mer exposé / Lac</option>
                      <option value="cat_2_open_country">Cat II : Campagne rase sans obstacle</option>
                      <option value="cat_4_dense_urban">Cat IV : Ville dense (hauteur &gt; 15 m)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs text-slate-400 block mb-1">Hauteur au-dessus du sol (m)</label>
                  <input
                    type="number"
                    value={buildingHeightM}
                    onChange={(e) => setBuildingHeightM(Math.max(2, parseInt(e.target.value) || 2))}
                    className="min-h-[44px] w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:border-sky-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: FLECHE & PENETRATION COULISSE */}
          {activeTab === 'deflection_stress' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-slate-800/70 border border-slate-700 rounded-xl p-3.5">
                  <span className="text-slate-400 text-xs block">Pression Dynamique qp</span>
                  <span className="text-xl font-bold text-sky-400">{audit.peakDynamicWindPressurePa} Pa</span>
                  <span className="text-[11px] text-slate-400 block mt-1">
                    Calcul ELU : {audit.designWindPressurePa} Pa (majoration 25%)
                  </span>
                </div>
                <div className="bg-slate-800/70 border border-slate-700 rounded-xl p-3.5">
                  <span className="text-slate-400 text-xs block">Flèche Maximale Tablier</span>
                  <span
                    className={`text-xl font-bold ${
                      audit.deflectionSpanRatio >= 50 ? 'text-emerald-400' : 'text-amber-400'
                    }`}
                  >
                    {audit.midSpanDeflectionMm} mm
                  </span>
                  <span className="text-[11px] text-slate-400 block mt-1">
                    Rapport portée : L / {audit.deflectionSpanRatio}
                  </span>
                </div>
                <div className="bg-slate-800/70 border border-slate-700 rounded-xl p-3.5">
                  <span className="text-slate-400 text-xs block">Pénétration Résiduelle en Coulisse</span>
                  <span
                    className={`text-xl font-bold ${
                      audit.residualBiteDepthMm >= audit.minSafeBiteDepthMm ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {audit.residualBiteDepthMm} mm
                  </span>
                  <span className="text-[11px] text-slate-400 block mt-1">
                    Pénétration initiale au repos : {audit.initialNominalBiteMm} mm
                  </span>
                </div>
              </div>

              {/* Analyse Anti-Déraillement Box */}
              <div
                className={`p-4 rounded-xl border ${
                  audit.isDerailmentRiskDetected
                    ? 'bg-rose-950/40 border-rose-800/80 text-rose-300'
                    : 'bg-emerald-950/40 border-emerald-800/80 text-emerald-300'
                }`}
              >
                <div className="flex items-start gap-3">
                  {audit.isDerailmentRiskDetected ? (
                    <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                  ) : (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  )}
                  <div className="space-y-1 text-xs">
                    <h4 className="font-bold text-white text-sm">
                      {audit.isDerailmentRiskDetected
                        ? 'DANGER CRITIQUE : SORTIE DE COULISSE IMMINENTE SOUS VENT FORT'
                        : 'SÉCURITÉ VÉRIFIÉE : AUCUN RISQUE DE SORTIE DE COULISSE DÉTECTÉ'}
                    </h4>
                    <p>
                      Sous la dépression du vent ({audit.peakDynamicWindPressurePa} Pa), la flexion de{' '}
                      {audit.midSpanDeflectionMm} mm engendre un raccourcissement géométrique d arc de corde de{' '}
                      {audit.arcShorteningMm} mm, soit un retrait latéral de{' '}
                      <strong>{audit.pulloutPerSideMm} mm</strong> de chaque côté.
                    </p>
                    <p>
                      {audit.areHooksEngagedAndSecuring ? (
                        <span className="text-emerald-300 font-semibold">
                          Les crochets anti-tempête s enclenchent dans la lèvre de la coulisse ({audit.railSpec.retentionLipWidthMm} mm) et verrouillent positivement le tablier.
                        </span>
                      ) : (
                        <span>
                          En l absence de crochets anti-tempête, le tablier compte uniquement sur la pénétration résiduelle en fond de rainure ({audit.residualBiteDepthMm} mm).
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              </div>

              {/* Table Détails Mécaniques */}
              <div className="bg-slate-800/60 border border-slate-700/80 rounded-xl overflow-hidden">
                <div className="px-4 py-2.5 bg-slate-950/60 border-b border-slate-800 font-semibold text-xs text-white">
                  Grandeurs Physiques & Efforts de Réaction
                </div>
                <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-2">
                    <div className="flex justify-between py-1 border-b border-slate-800">
                      <span className="text-slate-400">Force totale de vent sur tablier :</span>
                      <strong className="text-white">
                        {audit.totalWindForceOnCurtainN} N ({Math.round(audit.totalWindForceOnCurtainN / 9.81)} kgf)
                      </strong>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-800">
                      <span className="text-slate-400">Réaction horizontale par coulisse :</span>
                      <strong className="text-white">{audit.reactionPerGuideRailN} N</strong>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-800">
                      <span className="text-slate-400">Charge linéaire par lame :</span>
                      <strong className="text-white">{audit.linearLoadPerSlatNM} N/m</strong>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-800">
                      <span className="text-slate-400">Moment fléchissant maximal :</span>
                      <strong className="text-white">{audit.maxBendingMomentNM} N.m / lame</strong>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between py-1 border-b border-slate-800">
                      <span className="text-slate-400">Contrainte de flexion calculée :</span>
                      <strong className={audit.bendingStressUtilizationPercent <= 100 ? 'text-emerald-400' : 'text-rose-400'}>
                        {audit.bendingStressMpa} MPa ({audit.bendingStressUtilizationPercent}%)
                      </strong>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-800">
                      <span className="text-slate-400">Limite élastique admissible :</span>
                      <strong className="text-white">{audit.allowableBendingStressMpa} MPa</strong>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-800">
                      <span className="text-slate-400">Fixations par coulisse (pas 400 mm) :</span>
                      <strong className="text-white">
                        {audit.fastenersPerRailCount} chevilles ({audit.shearForcePerFastenerN} N / fixation)
                      </strong>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-800">
                      <span className="text-slate-400">Arrachement estimé par cheville :</span>
                      <strong className="text-white">{audit.pulloutTensionPerFastenerN} N</strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: SCHEMA TECHNIQUE CAD */}
          {activeTab === 'cad_diagram' && (
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-4">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-white">
                  Visualisation 2D en Coupe Transversale (Vue en Plan du Tablier et Coulisses)
                </span>
                <span className="text-slate-400">
                  Largeur : {curtainWidthMm} mm | Flèche : {audit.midSpanDeflectionMm} mm
                </span>
              </div>

              {/* Interactive SVG Diagram */}
              <div className="relative w-full h-64 bg-slate-900/90 rounded-lg border border-slate-800 flex items-center justify-center p-2 overflow-hidden">
                <svg viewBox="0 0 600 240" className="w-full h-full max-h-60">
                  {/* Background grid */}
                  <defs>
                    <pattern id="smallGrid" width="20" height="20" patternUnits="userSpaceOnUse">
                      <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#1e293b" strokeWidth="0.5" />
                    </pattern>
                  </defs>
                  <rect width="600" height="240" fill="url(#smallGrid)" />

                  {/* Wind Direction Arrows */}
                  <g opacity="0.6">
                    <line x1="300" y1="20" x2="300" y2="60" stroke="#38bdf8" strokeWidth="2" strokeDasharray="4 2" />
                    <polygon points="296,55 300,65 304,55" fill="#38bdf8" />

                    <line x1="220" y1="20" x2="220" y2="60" stroke="#38bdf8" strokeWidth="2" strokeDasharray="4 2" />
                    <polygon points="216,55 220,65 224,55" fill="#38bdf8" />

                    <line x1="380" y1="20" x2="380" y2="60" stroke="#38bdf8" strokeWidth="2" strokeDasharray="4 2" />
                    <polygon points="376,55 380,65 384,55" fill="#38bdf8" />

                    <text x="300" y="16" fill="#38bdf8" fontSize="10" fontWeight="bold" textAnchor="middle">
                      Pression du Vent ({audit.peakDynamicWindPressurePa} Pa)
                    </text>
                  </g>

                  {/* Left Guide Rail */}
                  <rect x="40" y="80" width="30" height="80" fill="#334155" stroke="#64748b" strokeWidth="1.5" rx="2" />
                  {/* Left Rail Groove */}
                  <rect x="52" y="90" width="18" height="60" fill="#0f172a" stroke="#475569" strokeWidth="1" />
                  {audit.railSpec.hasRetentionLip && (
                    <rect x="64" y="90" width="6" height="15" fill="#0284c7" />
                  )}

                  {/* Right Guide Rail */}
                  <rect x="530" y="80" width="30" height="80" fill="#334155" stroke="#64748b" strokeWidth="1.5" rx="2" />
                  {/* Right Rail Groove */}
                  <rect x="530" y="90" width="18" height="60" fill="#0f172a" stroke="#475569" strokeWidth="1" />
                  {audit.railSpec.hasRetentionLip && (
                    <rect x="530" y="90" width="6" height="15" fill="#0284c7" />
                  )}

                  {/* Neutral position line (dotted) */}
                  <line x1="60" y1="120" x2="540" y2="120" stroke="#475569" strokeWidth="1" strokeDasharray="3 3" />
                  <text x="300" y="115" fill="#64748b" fontSize="8" textAnchor="middle">
                    Position au repos (Plan neutre)
                  </text>

                  {/* Deflected Slat Arc */}
                  {/* Bowed curve under wind load */}
                  {(() => {
                    const maxDeflectionScale = Math.min(38, Math.max(8, audit.midSpanDeflectionMm * 0.7));
                    const ctrlY = 120 + maxDeflectionScale;
                    const leftTipX = 60 + Math.min(8, audit.pulloutPerSideMm * 0.8);
                    const rightTipX = 540 - Math.min(8, audit.pulloutPerSideMm * 0.8);

                    return (
                      <g>
                        <path
                          d={`M ${leftTipX} 120 Q 300 ${ctrlY} ${rightTipX} 120`}
                          fill="none"
                          stroke={audit.isDerailmentRiskDetected ? '#f43f5e' : '#38bdf8'}
                          strokeWidth="5"
                          strokeLinecap="round"
                        />

                        {/* Deflection Dimension Arrow */}
                        <line x1="300" y1="120" x2="300" y2={ctrlY} stroke="#f59e0b" strokeWidth="1.5" />
                        <polygon points="298,122 300,118 302,122" fill="#f59e0b" />
                        <polygon points={`298,${ctrlY - 2} 300,${ctrlY + 2} 302,${ctrlY - 2}`} fill="#f59e0b" />
                        <text x="310" y={(120 + ctrlY) / 2 + 3} fill="#f59e0b" fontSize="9" fontWeight="bold">
                          f = {audit.midSpanDeflectionMm} mm
                        </text>

                        {/* End hooks indicator */}
                        {audit.endLockType === 'caps_anti_storm_hooks' && (
                          <>
                            <circle cx={leftTipX} cy="120" r="3.5" fill="#10b981" />
                            <circle cx={rightTipX} cy="120" r="3.5" fill="#10b981" />
                          </>
                        )}
                      </g>
                    );
                  })()}

                  {/* Annotation Left rail bite */}
                  <text x="45" y="180" fill="#94a3b8" fontSize="8" textAnchor="middle">
                    Coulisse Gauche
                  </text>
                  <text x="545" y="180" fill="#94a3b8" fontSize="8" textAnchor="middle">
                    Coulisse Droite
                  </text>

                  {/* Residual Bite Box */}
                  <rect x="200" y="195" width="200" height="28" fill="#1e293b" stroke="#334155" rx="4" />
                  <text x="300" y="213" fill="#e2e8f0" fontSize="9" fontWeight="bold" textAnchor="middle">
                    Pénétration résiduelle : {audit.residualBiteDepthMm} mm
                  </text>
                </svg>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-300">
                <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800">
                  <span className="text-sky-400 font-semibold block mb-1">
                    Mécanisme de Déformation
                  </span>
                  Le tablier se comporte comme une poutre fléchie appuyée sur deux appuis simples. Le cintrage de la lame raccourcit la corde de {audit.arcShorteningMm} mm, tirant les extrémités vers le centre.
                </div>
                <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800">
                  <span className="text-sky-400 font-semibold block mb-1">
                    Rôle de la Coulisse Anti-Tempête
                  </span>
                  Une coulisse profonde ({audit.railSpec.grooveDepthMm} mm utile) assure un recouvrement suffisant même en cas de grand vent, évitant l éjection du tablier hors de la façade.
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: NORMES NF EN 13659 & RNV 2013 */}
          {activeTab === 'wind_standards' && (
            <div className="space-y-4">
              <div className="bg-slate-800/60 border border-slate-700/80 rounded-xl p-4 space-y-3">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-sky-400" />
                  Exigences de la Norme NF EN 13659 (Résistance au Vent)
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  La norme européenne NF EN 13659 impose que tout volet roulant ou fermeture extérieure résiste à une pression nominale de vent sans déformation résiduelle permanente ni risque de décrochage (déraillement des coulisses).
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs pt-1">
                  <div className={`p-2.5 rounded-lg border ${audit.achievedEn13659Class >= 1 ? 'bg-slate-900 border-sky-500/40 text-white' : 'bg-slate-900/40 border-slate-800 text-slate-500'}`}>
                    <span className="font-bold block">Classe 1</span>
                    <span className="text-[11px] text-slate-400 block">50 Pa (Sec. 75 Pa)</span>
                  </div>
                  <div className={`p-2.5 rounded-lg border ${audit.achievedEn13659Class >= 2 ? 'bg-slate-900 border-sky-500/40 text-white' : 'bg-slate-900/40 border-slate-800 text-slate-500'}`}>
                    <span className="font-bold block">Classe 2</span>
                    <span className="text-[11px] text-slate-400 block">70 Pa (Sec. 100 Pa)</span>
                  </div>
                  <div className={`p-2.5 rounded-lg border ${audit.achievedEn13659Class >= 3 ? 'bg-slate-900 border-sky-500/40 text-white' : 'bg-slate-900/40 border-slate-800 text-slate-500'}`}>
                    <span className="font-bold block">Classe 3 (Standard)</span>
                    <span className="text-[11px] text-slate-400 block">100 Pa (Sec. 150 Pa)</span>
                  </div>
                  <div className={`p-2.5 rounded-lg border ${audit.achievedEn13659Class >= 4 ? 'bg-slate-900 border-sky-500/40 text-white' : 'bg-slate-900/40 border-slate-800 text-slate-500'}`}>
                    <span className="font-bold block">Classe 4 (Exposé)</span>
                    <span className="text-[11px] text-slate-400 block">170 Pa (Sec. 250 Pa)</span>
                  </div>
                  <div className={`p-2.5 rounded-lg border ${audit.achievedEn13659Class >= 5 ? 'bg-slate-900 border-sky-500/40 text-white' : 'bg-slate-900/40 border-slate-800 text-slate-500'}`}>
                    <span className="font-bold block">Classe 5 (Grand Vent)</span>
                    <span className="text-[11px] text-slate-400 block">270 Pa (Sec. 400 Pa)</span>
                  </div>
                  <div className={`p-2.5 rounded-lg border ${audit.achievedEn13659Class >= 6 ? 'bg-slate-900 border-emerald-500/60 text-white' : 'bg-slate-900/40 border-slate-800 text-slate-500'}`}>
                    <span className="font-bold block text-emerald-400">Classe 6 (Tempête)</span>
                    <span className="text-[11px] text-slate-400 block">400 Pa (Sec. 600 Pa)</span>
                  </div>
                </div>
              </div>

              {/* RNV 2013 & Prescriptions Algériennes */}
              <div className="bg-slate-800/60 border border-slate-700/80 rounded-xl p-4 space-y-3 text-xs text-slate-300">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <Wind className="w-4 h-4 text-sky-400" />
                  Réglementation Algérienne CNERIB DTR BC 2-47 (RNV 2013)
                </h3>
                <p>
                  En Algérie, le littoral méditerranéen (Zone I) et les façades ouvertes subissent des pressions de crête dynamiques dépassant fréquemment 500 à 700 Pa lors des tempêtes hivernales.
                </p>
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Fixation des coulisses tous les 400 mm maximum avec vis acier inoxydable et chevilles nylon 8 mm.</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Utilisation d embouts anti-tempête dès que la largeur dépasse 2.20 m en zone littorale exposée.</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Lame finale renforcée en aluminium extrudé avec joint tubulaire néoprène de contact d appui.</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
