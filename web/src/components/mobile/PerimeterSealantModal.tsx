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
  Droplets,
  Layers,
} from 'lucide-react';
import { playTactileClick, playSwitchSound } from '../../utils/audioFeedback';
import {
  type SealantClassIso11600,
  type FrameColorFinish,
  type SubstrateMasonryType,
  SEALANT_CATALOG,
  computePerimeterSealantAudit,
} from '../../utils/perimeterSealantManager';
import { generatePerimeterSealantNoticePdf } from '../../utils/pdfGenerator';

interface PerimeterSealantModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialWidth?: number;
  initialHeight?: number;
  projectReference?: string;
  wilayaName?: string;
  clientName?: string;
}

export const PerimeterSealantModal: React.FC<PerimeterSealantModalProps> = ({
  isOpen,
  onClose,
  initialWidth = 1600,
  initialHeight = 2150,
  projectReference = 'Calfeutrement Périphérique Baie DTU 36.5',
  wilayaName = 'Alger',
  clientName = 'Chantier Client',
}) => {
  const [activeTab, setActiveTab] = useState<'config' | 'joint_calc' | 'cad_diagram' | 'snjf_standards'>('config');

  // Interactive Inputs
  const [windowWidthMm, setWindowWidthMm] = useState<number>(initialWidth);
  const [windowHeightMm, setWindowHeightMm] = useState<number>(initialHeight);
  const [frameColorFinish, setFrameColorFinish] = useState<FrameColorFinish>('dark_anthracite_ral_7016');
  const [substrateType, setSubstrateType] = useState<SubstrateMasonryType>('reinforced_concrete');
  const [sealantType, setSealantType] = useState<SealantClassIso11600>('class_25lm_polyurethane');
  const [actualPlannedJointWidthMm, setActualPlannedJointWidthMm] = useState<number>(10);
  const [installationTemperatureC, setInstallationTemperatureC] = useState<number>(20);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  // Compute Audit Results
  const audit = useMemo(() => {
    return computePerimeterSealantAudit({
      windowWidthMm,
      windowHeightMm,
      frameColorFinish,
      substrateType,
      sealantType,
      actualPlannedJointWidthMm,
      installationTemperatureC,
      wilayaName,
      clientName,
      projectReference,
    });
  }, [
    windowWidthMm,
    windowHeightMm,
    frameColorFinish,
    substrateType,
    sealantType,
    actualPlannedJointWidthMm,
    installationTemperatureC,
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
      const docId = `MASTIC-${Date.now().toString().slice(-6)}`;
      await generatePerimeterSealantNoticePdf({
        documentId: docId,
        projectRef: projectReference,
        clientName,
        wilayaName,
        result: audit,
      });
    } catch (err) {
      console.error('Erreur generation PDF Calfeutrement Mastic:', err);
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
            <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
              <Droplets className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                <span>Joint de Calfeutrement Périphérique & Mastic</span>
                <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  NF DTU 36.5 / SNJF
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Dimensionnement de la largeur du joint, dilatation thermique et fond de joint PE
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadPdf}
              disabled={isGeneratingPdf}
              className="min-h-[44px] px-3.5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-700 text-white text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer shadow-sm active:scale-95"
              title="Exporter la note de calcul de calfeutrement PDF"
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
              Largeur min requise : <strong>{audit.minimumRequiredJointWidthMm} mm</strong> (Prévue : {audit.actualPlannedJointWidthMm} mm)
            </span>
            <span className="bg-slate-900/60 px-2.5 py-1 rounded-md border border-slate-700/60 text-slate-200">
              Fond de joint PE : <strong>Ø {audit.backingRodDiameterMm} mm</strong>
            </span>
            <span className="bg-slate-900/60 px-2.5 py-1 rounded-md border border-slate-700/60 text-slate-200">
              Cartouches 310 ml : <strong>{audit.cartridges310mlCount}</strong> ({audit.sealantVolumeLiters} L)
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
                ? 'border-cyan-500 text-cyan-400 bg-cyan-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sliders className="w-4 h-4" />
            Configuration & Baie
          </button>
          <button
            onClick={() => {
              playSwitchSound();
              setActiveTab('joint_calc');
            }}
            className={`min-h-[44px] px-4 py-2.5 text-xs font-medium border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'joint_calc'
                ? 'border-cyan-500 text-cyan-400 bg-cyan-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-4 h-4" />
            Calcul Largeur & Amplitude
          </button>
          <button
            onClick={() => {
              playSwitchSound();
              setActiveTab('cad_diagram');
            }}
            className={`min-h-[44px] px-4 py-2.5 text-xs font-medium border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'cad_diagram'
                ? 'border-cyan-500 text-cyan-400 bg-cyan-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Compass className="w-4 h-4" />
            Schéma 2D CAD Calfeutrement
          </button>
          <button
            onClick={() => {
              playSwitchSound();
              setActiveTab('snjf_standards');
            }}
            className={`min-h-[44px] px-4 py-2.5 text-xs font-medium border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'snjf_standards'
                ? 'border-cyan-500 text-cyan-400 bg-cyan-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            Prescriptions DTU 36.5 & SNJF
          </button>
        </div>

        {/* Tab Content Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5">
          {/* TAB 1: CONFIGURATION & BAIE */}
          {activeTab === 'config' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Dimensions et Teinte Profil */}
              <div className="bg-slate-800/60 border border-slate-700/80 rounded-xl p-4 space-y-4">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <Activity className="w-4 h-4 text-cyan-400" />
                  Dimensions de Baie & Profil Aluminium
                </h3>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Largeur baie (mm)</label>
                    <input
                      type="number"
                      value={windowWidthMm}
                      onChange={(e) => setWindowWidthMm(Math.max(400, parseInt(e.target.value) || 400))}
                      className="min-h-[44px] w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:border-cyan-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Hauteur baie (mm)</label>
                    <input
                      type="number"
                      value={windowHeightMm}
                      onChange={(e) => setWindowHeightMm(Math.max(400, parseInt(e.target.value) || 400))}
                      className="min-h-[44px] w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:border-cyan-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs text-slate-400 block mb-1">Teinte et Finition du Profil</label>
                  <select
                    value={frameColorFinish}
                    onChange={(e) => {
                      playTactileClick();
                      setFrameColorFinish(e.target.value as FrameColorFinish);
                    }}
                    className="min-h-[44px] w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-xs focus:border-cyan-500 focus:outline-none"
                  >
                    <option value="dark_anthracite_ral_7016">Gris Anthracite RAL 7016 (Tmax surface 78°C)</option>
                    <option value="dark_black_ral_9005">Noir Foncé RAL 9005 (Tmax surface 82°C)</option>
                    <option value="medium_metallic_bronze">Bronze / Brun Métallisé (Tmax surface 68°C)</option>
                    <option value="anodized_natural_silver">Anodisé Naturel Satiné (Tmax surface 60°C)</option>
                    <option value="light_white_ral_9016">Blanc RAL 9016 (Tmax surface 55°C)</option>
                  </select>
                  <p className="text-[11px] text-slate-400 mt-1.5 italic">
                    Les teintes sombres absorbent fortement le rayonnement solaire, augmentant la dilatation thermique de plus de 45% par rapport au blanc.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800 text-xs">
                    <span className="text-slate-400 block">Périmètre total</span>
                    <strong className="text-white text-sm">{audit.linearMetersCount} m</strong>
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      Axe directeur : {audit.governingAxis} ({audit.governingDimensionMm} mm)
                    </span>
                  </div>
                  <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800 text-xs">
                    <span className="text-slate-400 block">Température max surface</span>
                    <strong className="text-white text-sm">{audit.aluminumSurfaceMaxTempC} °C</strong>
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      Écart annuel DT = {audit.deltaTAluminumK} K
                    </span>
                  </div>
                </div>
              </div>

              {/* Support Gros-Œuvre et Choix Mastic */}
              <div className="bg-slate-800/60 border border-slate-700/80 rounded-xl p-4 space-y-4">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <Droplets className="w-4 h-4 text-cyan-400" />
                  Support Gros-Œuvre & Classe de Mastic
                </h3>

                <div>
                  <label className="text-xs text-slate-400 block mb-1">Nature du Support Maçonnerie</label>
                  <select
                    value={substrateType}
                    onChange={(e) => {
                      playTactileClick();
                      setSubstrateType(e.target.value as SubstrateMasonryType);
                    }}
                    className="min-h-[44px] w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-xs focus:border-cyan-500 focus:outline-none"
                  >
                    <option value="reinforced_concrete">Béton armé banché (Coeff 10 x10-6 /K)</option>
                    <option value="hollow_clay_brick">Brique creuse en terre cuite (Coeff 6 x10-6 /K)</option>
                    <option value="concrete_block">Aggloméré de ciment / Parpaing (Coeff 10 x10-6 /K)</option>
                    <option value="structural_steel_subframe">Précadre en acier galvanisé (Coeff 12 x10-6 /K)</option>
                    <option value="wood_subframe">Pré-cadre ou ossature bois (Coeff 5 x10-6 /K)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs text-slate-400 block mb-1">Type de Mastic Élastomère (ISO 11600)</label>
                  <select
                    value={sealantType}
                    onChange={(e) => {
                      playTactileClick();
                      setSealantType(e.target.value as SealantClassIso11600);
                    }}
                    className="min-h-[44px] w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-xs focus:border-cyan-500 focus:outline-none"
                  >
                    {Object.values(SEALANT_CATALOG).map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.nameFr} (±{s.movementCapabilityPercent}%)
                      </option>
                    ))}
                  </select>
                  <p className="text-[11px] text-slate-400 mt-1.5 italic">
                    {SEALANT_CATALOG[sealantType].description}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Largeur prévue sur plan (mm)</label>
                    <input
                      type="number"
                      value={actualPlannedJointWidthMm}
                      onChange={(e) => setActualPlannedJointWidthMm(Math.max(4, parseInt(e.target.value) || 4))}
                      className="min-h-[44px] w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:border-cyan-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Température de pose (°C)</label>
                    <input
                      type="number"
                      value={installationTemperatureC}
                      onChange={(e) => setInstallationTemperatureC(parseInt(e.target.value) || 20)}
                      className="min-h-[44px] w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:border-cyan-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CALCUL LARGEUR & AMPLITUDE */}
          {activeTab === 'joint_calc' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-slate-800/70 border border-slate-700 rounded-xl p-3.5">
                  <span className="text-slate-400 text-xs block">Dilatation Différentielle</span>
                  <span className="text-xl font-bold text-cyan-400">{audit.differentialThermalMovementMm} mm</span>
                  <span className="text-[11px] text-slate-400 block mt-1">
                    Mouvement saisonnier : {audit.maxSeasonalThermalMovementMm} mm
                  </span>
                </div>
                <div className="bg-slate-800/70 border border-slate-700 rounded-xl p-3.5">
                  <span className="text-slate-400 text-xs block">Largeur Minimale Requise</span>
                  <span
                    className={`text-xl font-bold ${
                      audit.isWidthCompliant ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {audit.minimumRequiredJointWidthMm} mm
                  </span>
                  <span className="text-[11px] text-slate-400 block mt-1">
                    Largeur conseillée : {audit.recommendedDesignJointWidthMm} mm
                  </span>
                </div>
                <div className="bg-slate-800/70 border border-slate-700 rounded-xl p-3.5">
                  <span className="text-slate-400 text-xs block">Fond de Joint Mousse PE</span>
                  <span className="text-xl font-bold text-cyan-400">Ø {audit.backingRodDiameterMm} mm</span>
                  <span className="text-[11px] text-slate-400 block mt-1">
                    Profondeur mastic : {audit.recommendedJointDepthMm} mm (2:1)
                  </span>
                </div>
              </div>

              {/* Conformité Largeur Box */}
              <div
                className={`p-4 rounded-xl border ${
                  audit.isWidthCompliant
                    ? 'bg-emerald-950/40 border-emerald-800/80 text-emerald-300'
                    : 'bg-rose-950/40 border-rose-800/80 text-rose-300'
                }`}
              >
                <div className="flex items-start gap-3">
                  {audit.isWidthCompliant ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                  )}
                  <div className="space-y-1 text-xs">
                    <h4 className="font-bold text-white text-sm">
                      {audit.isWidthCompliant
                        ? `DIMENSIONNEMENT CONFORME : MARGE DE SÉCURITÉ DE +${audit.widthSafetyMarginMm} MM`
                        : `DANGER DE DÉCOLLEMENT : JOINT TROP ÉTROIT DE ${Math.abs(audit.widthSafetyMarginMm)} MM`}
                    </h4>
                    <p>
                      Pour une amplitude de mouvement globale de {audit.totalDesignMovementAmplitudeMm} mm, le mastic{' '}
                      {audit.sealantSpec.nameFr} (capacité ±{audit.movementCapabilityPercent}%) exige une largeur minimale de{' '}
                      <strong>{audit.minimumRequiredJointWidthMm} mm</strong>.
                    </p>
                    <p>
                      {audit.isWidthCompliant ? (
                        <span>
                          La largeur prévue ({audit.actualPlannedJointWidthMm} mm) permet au cordon d absorber les cycles dilatation/contraction sans dépassement de la contrainte d adhésion.
                        </span>
                      ) : (
                        <span className="text-rose-300 font-semibold">
                          Le joint subira un allongement supérieur à la limite de rupture du mastic, entraînant une fissure prématurée et des infiltrations d eau.
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              </div>

              {/* Estimation Consommables & Préparation */}
              <div className="bg-slate-800/60 border border-slate-700/80 rounded-xl overflow-hidden">
                <div className="px-4 py-2.5 bg-slate-950/60 border-b border-slate-800 font-semibold text-xs text-white">
                  Fournitures & Quantitatif Chantier
                </div>
                <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-2">
                    <div className="flex justify-between py-1 border-b border-slate-800">
                      <span className="text-slate-400">Longueur totale de cordon :</span>
                      <strong className="text-white">{audit.linearMetersCount} mètres linéaires</strong>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-800">
                      <span className="text-slate-400">Section de cordon (W x D) :</span>
                      <strong className="text-white">
                        {audit.actualPlannedJointWidthMm} x {audit.recommendedJointDepthMm} mm
                      </strong>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-800">
                      <span className="text-slate-400">Volume net + perte (15%) :</span>
                      <strong className="text-white">{audit.sealantVolumeLiters} Litres</strong>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-800">
                      <span className="text-slate-400">Cartouches 310 ml nécessaires :</span>
                      <strong className="text-white">{audit.cartridges310mlCount} cartouches</strong>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between py-1 border-b border-slate-800">
                      <span className="text-slate-400">Poches 600 ml (Saucisses) :</span>
                      <strong className="text-white">{audit.sausages600mlCount} poches</strong>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-800">
                      <span className="text-slate-400">Fond de joint PE requis :</span>
                      <strong className="text-white">
                        {audit.backingRodRollsMetersCount} m (Ø {audit.backingRodDiameterMm} mm)
                      </strong>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-800">
                      <span className="text-slate-400">Primaire d accrochage :</span>
                      <strong className={audit.primerRequired ? 'text-amber-400' : 'text-emerald-400'}>
                        {audit.primerRequired ? 'Requis (fonds poreux)' : 'Non requis'}
                      </strong>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-800">
                      <span className="text-slate-400">Nettoyage surfaces alu :</span>
                      <strong className="text-white">2 chiffons blancs / Solvant non gras</strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: SCHEMA 2D CAD CALFEUTREMENT */}
          {activeTab === 'cad_diagram' && (
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-4">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-white">
                  Coupe Technique CAD du Joint d Étanchéité (Dormant Alu / Gros-Œuvre)
                </span>
                <span className="text-slate-400">
                  Rapport 2:1 ({actualPlannedJointWidthMm} x {audit.recommendedJointDepthMm} mm)
                </span>
              </div>

              {/* Interactive SVG Diagram */}
              <div className="relative w-full h-64 bg-slate-900/90 rounded-lg border border-slate-800 flex items-center justify-center p-2 overflow-hidden">
                <svg viewBox="0 0 600 240" className="w-full h-full max-h-60">
                  {/* Background grid */}
                  <defs>
                    <pattern id="sealGrid" width="20" height="20" patternUnits="userSpaceOnUse">
                      <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#1e293b" strokeWidth="0.5" />
                    </pattern>
                  </defs>
                  <rect width="600" height="240" fill="url(#sealGrid)" />

                  {/* Left: Masonry Concrete/Brick Substrate */}
                  <rect x="40" y="30" width="180" height="180" fill="#334155" stroke="#475569" strokeWidth="1.5" />
                  {/* Masonry hatching lines */}
                  <line x1="50" y1="30" x2="220" y2="200" stroke="#1e293b" strokeWidth="1" />
                  <line x1="90" y1="30" x2="220" y2="160" stroke="#1e293b" strokeWidth="1" />
                  <line x1="130" y1="30" x2="220" y2="120" stroke="#1e293b" strokeWidth="1" />
                  <line x1="50" y1="70" x2="190" y2="210" stroke="#1e293b" strokeWidth="1" />
                  <text x="130" y="125" fill="#cbd5e1" fontSize="11" fontWeight="bold" textAnchor="middle">
                    Gros-Œuvre ({audit.substrateNameFr})
                  </text>

                  {/* Right: Aluminum Window Frame (Dormant) */}
                  <rect x="360" y="30" width="200" height="180" fill="#1e293b" stroke="#0ea5e9" strokeWidth="1.5" />
                  {/* Thermal Break bar in frame */}
                  <rect x="440" y="30" width="30" height="180" fill="#0284c7" opacity="0.6" />
                  <text x="455" y="125" fill="#f8fafc" fontSize="9" fontWeight="bold" textAnchor="middle">
                    Rupture Pont Thermique
                  </text>
                  <text x="460" y="70" fill="#e2e8f0" fontSize="11" fontWeight="bold" textAnchor="middle">
                    Dormant Alu ({audit.frameColorLabelFr.split(' ')[0]})
                  </text>

                  {/* Gap between Masonry and Frame (The Joint Area) */}
                  {/* X ranges from 220 to 360 = 140px on screen. Actual width is actualPlannedJointWidthMm */}
                  {/* Backing Rod (Fond de joint PE cellulaire rond) */}
                  <circle cx="290" cy="120" r="48" fill="#64748b" stroke="#94a3b8" strokeWidth="1.5" />
                  <text x="290" y="116" fill="#f8fafc" fontSize="9" fontWeight="bold" textAnchor="middle">
                    Fond de Joint PE
                  </text>
                  <text x="290" y="130" fill="#f8fafc" fontSize="8" textAnchor="middle">
                    Ø {audit.backingRodDiameterMm} mm
                  </text>

                  {/* Sealant Bead (Mastic Elastomer Bead) at exterior face */}
                  {/* Outer face is on top or left. Let's make top exterior face */}
                  <path
                    d="M 220 30 L 360 30 L 360 72 Q 290 85 220 72 Z"
                    fill="#06b6d4"
                    stroke="#0891b2"
                    strokeWidth="1.5"
                    opacity="0.9"
                  />
                  <text x="290" y="55" fill="#ffffff" fontSize="10" fontWeight="bold" textAnchor="middle">
                    Cordon Mastic {audit.sealantSpec.isoClass.split('-')[2] || '25LM'}
                  </text>

                  {/* Dimension Width W */}
                  <line x1="220" y1="20" x2="360" y2="20" stroke="#f59e0b" strokeWidth="1.5" />
                  <polygon points="220,18 215,20 220,22" fill="#f59e0b" />
                  <polygon points="360,18 365,20 360,22" fill="#f59e0b" />
                  <text x="290" y="15" fill="#f59e0b" fontSize="9" fontWeight="bold" textAnchor="middle">
                    Largeur W = {actualPlannedJointWidthMm} mm (Min {audit.minimumRequiredJointWidthMm} mm)
                  </text>

                  {/* Dimension Depth D */}
                  <line x1="375" y1="30" x2="375" y2="72" stroke="#38bdf8" strokeWidth="1.5" />
                  <polygon points="373,30 375,25 377,30" fill="#38bdf8" />
                  <polygon points="373,72 375,77 377,72" fill="#38bdf8" />
                  <text x="382" y="54" fill="#38bdf8" fontSize="8" fontWeight="bold">
                    Prof. D = {audit.recommendedJointDepthMm} mm
                  </text>

                  {/* Exterior / Interior Labels */}
                  <text x="290" y="225" fill="#64748b" fontSize="9" textAnchor="middle">
                    Face Intérieure (Air sec)
                  </text>
                </svg>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-300">
                <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800">
                  <span className="text-cyan-400 font-semibold block mb-1">
                    Règle d Or SNJF du Rapport 2:1
                  </span>
                  Pour une largeur de joint supérieure à 12 mm, la profondeur de mastic doit être égale à la moitié de la largeur (D = W/2). Un joint trop épais subit des contraintes internes de cisaillement excessives qui provoquent son décollement.
                </div>
                <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800">
                  <span className="text-cyan-400 font-semibold block mb-1">
                    Rôle Crucial du Fond de Joint
                  </span>
                  Le fond de joint cylindrique en mousse PE non adhérente garantit que le mastic ne colle que sur deux faces opposées (dormant alu et maçonnerie). Tout collage sur 3 faces bloque la déformation élastique et arrache le joint.
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: PRESCRIPTIONS DTU 36.5 & SNJF */}
          {activeTab === 'snjf_standards' && (
            <div className="space-y-4">
              <div className="bg-slate-800/60 border border-slate-700/80 rounded-xl p-4 space-y-3">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-cyan-400" />
                  Règles Professionnelles SNJF & NF DTU 36.5 (Mise en Œuvre)
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Le calfeutrement entre la maçonnerie et le cadre dormant assure l étanchéité à l air et à l eau de l enveloppe du bâtiment. En climat algérien, soumis à de forts rayonnements ultraviolets et à des écarts thermiques brutaux, les règles d application doivent être rigoureusement respectées.
                </p>

                <div className="space-y-2 pt-1 text-xs">
                  <div className="flex items-start gap-2 bg-slate-900/70 p-3 rounded-lg border border-slate-800">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-white block">Technique des Deux Chiffons :</strong>
                      <span className="text-slate-300">
                        Nettoyer le profil aluminium au solvant non gras avec un premier chiffon propre imbibé, puis essuyer immédiatement les résidus avec un second chiffon blanc sec avant évaporation du solvant.
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2 bg-slate-900/70 p-3 rounded-lg border border-slate-800">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-white block">Primaire d Adhérence :</strong>
                      <span className="text-slate-300">
                        {audit.primerRequired
                          ? 'Sur support béton ou brique poreuse, l application d un primaire compatible est impérative pour éviter la rupture adhésive lors des fortes dilatations estivales.'
                          : 'Avec un mastic silicone neutre ou MS polymère haut de gamme, l adhérence directe sans primaire est validée sous réserve d un support dépoussiéré et sec.'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2 bg-slate-900/70 p-3 rounded-lg border border-slate-800">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-white block">Serrage et Lissage :</strong>
                      <span className="text-slate-300">
                        Injecter le mastic en continu sans inclusion de bulles d air. Serrer le cordon contre les lèvres de la réservation et lisser à la spatule avec de l eau savonneuse neutre sans creuser le joint.
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2 bg-slate-900/70 p-3 rounded-lg border border-slate-800">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-white block">Températures d Application :</strong>
                      <span className="text-slate-300">
                        Ne jamais mastiquer sous une température inférieure à +5°C ou supérieure à +40°C, ni sur support humide, ruisselant ou exposé en plein soleil caniculaire direct.
                      </span>
                    </div>
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
