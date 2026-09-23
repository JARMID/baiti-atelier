import React, { useState, useMemo } from 'react';
import {
  X,
  FileCheck,
  Sliders,
  Layers,
  CheckCircle2,
  AlertTriangle,
  Wind,
  Building2,
  Anchor,
  Activity,
  Maximize2,
} from 'lucide-react';
import { playTactileClick, playSwitchSound, playSlideTick } from '../../utils/audioFeedback';
import {
  calculatePerimeterAnchorageAudit,
  SUBSTRATE_SPECS,
  FASTENER_SPECS,
  type MasonrySubstrateType,
  type InstallationMountingType,
  type AnchorFastenerType,
} from '../../utils/perimeterAnchorManager';
import { generatePerimeterAnchorNoticePdf } from '../../utils/pdfGenerator';

interface PerimeterAnchorModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialWidth?: number;
  initialHeight?: number;
  projectReference?: string;
  wilayaName?: string;
  clientName?: string;
}

export const PerimeterAnchorModal: React.FC<PerimeterAnchorModalProps> = ({
  isOpen,
  onClose,
  initialWidth = 1200,
  initialHeight = 1400,
  projectReference = 'Audit Fixations au Gros Œuvre',
  wilayaName = '16 - Alger',
  clientName = 'Particulier',
}) => {
  const [activeTab, setActiveTab] = useState<'config' | 'spacing_dtu' | 'cad_view' | 'bom_dtu'>('config');

  // Input states
  const [windowWidthMm, setWindowWidthMm] = useState<number>(initialWidth);
  const [windowHeightMm, setWindowHeightMm] = useState<number>(initialHeight);
  const [substrateType, setSubstrateType] = useState<MasonrySubstrateType>('hollow_clay_brick_algerian');
  const [mountingType, setMountingType] = useState<InstallationMountingType>('applique_interieure');
  const [customFastenerType, setCustomFastenerType] = useState<AnchorFastenerType | ''>('');
  const [intermediateMullionsCount, setIntermediateMullionsCount] = useState<number>(0);
  const [intermediateTransomsCount, setIntermediateTransomsCount] = useState<number>(0);
  const [darkProfileExposureSummer, setDarkProfileExposureSummer] = useState<boolean>(true);
  const [windDesignPressurePa, setWindDesignPressurePa] = useState<number>(1000);

  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  // Compute audit
  const audit = useMemo(() => {
    return calculatePerimeterAnchorageAudit({
      windowWidthMm,
      windowHeightMm,
      substrateType,
      mountingType,
      fastenerType: customFastenerType ? customFastenerType : undefined,
      intermediateMullionsCount,
      intermediateTransomsCount,
      darkProfileExposureSummer,
      windDesignPressurePa,
      wilayaName,
      clientName,
      projectReference,
    });
  }, [
    windowWidthMm,
    windowHeightMm,
    substrateType,
    mountingType,
    customFastenerType,
    intermediateMullionsCount,
    intermediateTransomsCount,
    darkProfileExposureSummer,
    windDesignPressurePa,
    wilayaName,
    clientName,
    projectReference,
  ]);

  if (!isOpen) return null;

  const currentSubstrate = SUBSTRATE_SPECS[substrateType];
  const currentFastener = audit.selectedFastener;

  const handleExportPdf = async () => {
    try {
      setIsGeneratingPdf(true);
      playTactileClick();
      const docId = `ANCR-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
      await generatePerimeterAnchorNoticePdf({
        documentId: docId,
        projectRef: projectReference,
        clientName,
        wilaya: wilayaName,
        auditInput: {
          windowWidthMm,
          windowHeightMm,
          substrateType,
          mountingType,
          fastenerType: customFastenerType ? customFastenerType : undefined,
          intermediateMullionsCount,
          intermediateTransomsCount,
          darkProfileExposureSummer,
          windDesignPressurePa,
          wilayaName,
          clientName,
          projectReference,
        },
        auditResult: audit,
      });
    } catch (err) {
      console.error('Erreur génération attestation ancrage:', err);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-sm p-2 sm:p-4 overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden text-slate-900 dark:text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-600/10 text-blue-600 dark:text-blue-400">
              <Anchor className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                Fixations au Gros Œuvre & Entraxe DTU
                <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300">
                  NF DTU 36.5
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Implantation des chevilles, entraxe maximal 800 mm et traction sous vent RNV 2013
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              playTactileClick();
              onClose();
            }}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-100/60 dark:bg-slate-950 px-3 pt-2 gap-1 overflow-x-auto">
          <button
            onClick={() => {
              playSwitchSound();
              setActiveTab('config');
            }}
            className={`flex items-center gap-2 px-3.5 py-2.5 text-xs font-semibold rounded-t-lg transition min-h-[44px] whitespace-nowrap ${
              activeTab === 'config'
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 border-t-2 border-blue-500 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Sliders className="w-4 h-4" />
            Géométrie & Support
          </button>

          <button
            onClick={() => {
              playSwitchSound();
              setActiveTab('spacing_dtu');
            }}
            className={`flex items-center gap-2 px-3.5 py-2.5 text-xs font-semibold rounded-t-lg transition min-h-[44px] whitespace-nowrap ${
              activeTab === 'spacing_dtu'
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 border-t-2 border-blue-500 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Activity className="w-4 h-4" />
            Entraxe & DTU
          </button>

          <button
            onClick={() => {
              playSwitchSound();
              setActiveTab('cad_view');
            }}
            className={`flex items-center gap-2 px-3.5 py-2.5 text-xs font-semibold rounded-t-lg transition min-h-[44px] whitespace-nowrap ${
              activeTab === 'cad_view'
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 border-t-2 border-blue-500 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Layers className="w-4 h-4" />
            Dessin CAD 2D
          </button>

          <button
            onClick={() => {
              playSwitchSound();
              setActiveTab('bom_dtu');
            }}
            className={`flex items-center gap-2 px-3.5 py-2.5 text-xs font-semibold rounded-t-lg transition min-h-[44px] whitespace-nowrap ${
              activeTab === 'bom_dtu'
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 border-t-2 border-blue-500 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <FileCheck className="w-4 h-4" />
            Nomenclature & PDF
          </button>
        </div>

        {/* Tab Contents */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-5">
          {/* TAB 1: CONFIGURATION */}
          {activeTab === 'config' && (
            <div className="space-y-5">
              {/* Quick Presets */}
              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-800">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-2">
                  Préréglages Dimensionnels Rapides :
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    onClick={() => {
                      playTactileClick();
                      setWindowWidthMm(1200);
                      setWindowHeightMm(1400);
                      setIntermediateMullionsCount(0);
                    }}
                    className="p-2 text-left bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg hover:border-blue-500 transition min-h-[44px]"
                  >
                    <span className="text-xs font-bold block text-slate-800 dark:text-slate-200">Fenêtre 1200x1400</span>
                    <span className="text-[10px] text-slate-500">Châssis standard 8 chevilles</span>
                  </button>
                  <button
                    onClick={() => {
                      playTactileClick();
                      setWindowWidthMm(1400);
                      setWindowHeightMm(2150);
                      setIntermediateMullionsCount(0);
                    }}
                    className="p-2 text-left bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg hover:border-blue-500 transition min-h-[44px]"
                  >
                    <span className="text-xs font-bold block text-slate-800 dark:text-slate-200">Porte-Fenêtre 1.4x2.15m</span>
                    <span className="text-[10px] text-slate-500">Montants hauts 12 chevilles</span>
                  </button>
                  <button
                    onClick={() => {
                      playTactileClick();
                      setWindowWidthMm(2400);
                      setWindowHeightMm(1500);
                      setIntermediateMullionsCount(1);
                    }}
                    className="p-2 text-left bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg hover:border-blue-500 transition min-h-[44px]"
                  >
                    <span className="text-xs font-bold block text-slate-800 dark:text-slate-200">Baie 2.4m avec Meneau</span>
                    <span className="text-[10px] text-slate-500">Fixations renforcées meneau</span>
                  </button>
                  <button
                    onClick={() => {
                      playTactileClick();
                      setWindowWidthMm(3000);
                      setWindowHeightMm(2400);
                      setIntermediateMullionsCount(2);
                    }}
                    className="p-2 text-left bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg hover:border-blue-500 transition min-h-[44px]"
                  >
                    <span className="text-xs font-bold block text-slate-800 dark:text-slate-200">Baie Monumentale 3.0m</span>
                    <span className="text-[10px] text-slate-500">Forte charge vent 18+ ancrages</span>
                  </button>
                </div>
              </div>

              {/* Window Dimensions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Largeur Hors-Tout Cadre (mm)
                  </label>
                  <input
                    type="number"
                    value={windowWidthMm}
                    onChange={(e) => {
                      playSlideTick();
                      setWindowWidthMm(Math.max(400, Number(e.target.value)));
                    }}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-sm font-semibold min-h-[44px]"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Hauteur Hors-Tout Cadre (mm)
                  </label>
                  <input
                    type="number"
                    value={windowHeightMm}
                    onChange={(e) => {
                      playSlideTick();
                      setWindowHeightMm(Math.max(400, Number(e.target.value)));
                    }}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-sm font-semibold min-h-[44px]"
                  />
                </div>
              </div>

              {/* Substrate & Mounting Method */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Nature du Gros Œuvre (Support Récepteur)
                  </label>
                  <select
                    value={substrateType}
                    onChange={(e) => {
                      playSwitchSound();
                      setSubstrateType(e.target.value as MasonrySubstrateType);
                    }}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-sm font-semibold min-h-[44px]"
                  >
                    {Object.values(SUBSTRATE_SPECS).map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.labelFr}
                      </option>
                    ))}
                  </select>
                  <div className="mt-1 p-2 rounded-lg bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-[11px]">
                    <span className="font-semibold block text-slate-700 dark:text-slate-300">
                      Résistance Caractéristique : N_Rk = {currentSubstrate.characteristicTensileResistanceKn} kN
                    </span>
                    <span className="text-slate-500">{currentSubstrate.description}</span>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Mode d Implantation & Pose
                  </label>
                  <select
                    value={mountingType}
                    onChange={(e) => {
                      playSwitchSound();
                      setMountingType(e.target.value as InstallationMountingType);
                    }}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-sm font-semibold min-h-[44px]"
                  >
                    <option value="applique_interieure">Pose en applique intérieure (ITI standard)</option>
                    <option value="tunnel_tableau">Pose en tunnel (en tableau de maçonnerie)</option>
                    <option value="feuillure_maconnerie">Pose en feuillure maçonnerie traditionnelle</option>
                    <option value="applique_exterieure_ite">Pose en applique extérieure (ITE / pattes équerres)</option>
                  </select>

                  <div className="mt-3">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Type de Cheville / Vis
                    </label>
                    <select
                      value={customFastenerType}
                      onChange={(e) => {
                        playSwitchSound();
                        setCustomFastenerType(e.target.value as AnchorFastenerType);
                      }}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-sm font-semibold min-h-[44px]"
                    >
                      <option value="">Recommandation automatique ({currentFastener.labelFr.slice(0, 35)}...)</option>
                      {Object.values(FASTENER_SPECS).map((f) => (
                        <option key={f.id} value={f.id}>
                          {f.labelFr}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Structural Reinforcements & Solar Exposure */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Meneaux Intermédiaires (Verticaux)
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={4}
                    value={intermediateMullionsCount}
                    onChange={(e) => {
                      playSlideTick();
                      setIntermediateMullionsCount(Math.max(0, Number(e.target.value)));
                    }}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-sm font-semibold min-h-[44px]"
                  />
                  <span className="text-[10px] text-slate-400">+2 fixations d appui par meneau</span>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Traverses Intermédiaires (Horizontales)
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={4}
                    value={intermediateTransomsCount}
                    onChange={(e) => {
                      playSlideTick();
                      setIntermediateTransomsCount(Math.max(0, Number(e.target.value)));
                    }}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-sm font-semibold min-h-[44px]"
                  />
                  <span className="text-[10px] text-slate-400">+2 fixations au droit des traverses</span>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Pression Vent RNV 2013 (Pa)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min={500}
                      max={2000}
                      step={50}
                      value={windDesignPressurePa}
                      onChange={(e) => {
                        playSlideTick();
                        setWindDesignPressurePa(Number(e.target.value));
                      }}
                      className="flex-1 accent-blue-500 cursor-pointer min-h-[44px]"
                    />
                    <span className="w-16 text-right text-xs font-bold text-blue-600 dark:text-blue-400">
                      {windDesignPressurePa} Pa
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400">Force globale vent : {audit.totalWindForceKn} kN</span>
                </div>
              </div>

              {/* Dark Profile Summer Exposure Toggle */}
              <div className="p-3 bg-blue-500/5 rounded-xl border border-blue-500/20 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                    Profilé Foncé en Plein Soleil Été (Anthracite / Noir)
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    NF DTU 36.5 restreint l entraxe maximal à 700 mm au lieu de 800 mm
                  </span>
                </div>
                <button
                  onClick={() => {
                    playTactileClick();
                    setDarkProfileExposureSummer(!darkProfileExposureSummer);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition min-h-[44px] ${
                    darkProfileExposureSummer
                      ? 'bg-amber-500 text-white shadow-sm'
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {darkProfileExposureSummer ? 'Entraxe Max 700 mm' : 'Entraxe Max 800 mm'}
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: ENTRAXE & DTU */}
          {activeTab === 'spacing_dtu' && (
            <div className="space-y-5">
              {/* Compliance Status Banner */}
              <div
                className={`p-4 rounded-xl border flex items-center justify-between ${
                  audit.isStructurallySafe && audit.dtuPitchCompliant
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-800 dark:text-emerald-300'
                    : audit.isStructurallySafe
                    ? 'bg-amber-500/10 border-amber-500/30 text-amber-800 dark:text-amber-300'
                    : 'bg-rose-500/10 border-rose-500/30 text-rose-800 dark:text-rose-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  {audit.isStructurallySafe && audit.dtuPitchCompliant ? (
                    <CheckCircle2 className="w-6 h-6 shrink-0" />
                  ) : (
                    <AlertTriangle className="w-6 h-6 shrink-0" />
                  )}
                  <div>
                    <span className="text-xs font-extrabold uppercase tracking-wider block">
                      Conformité NF DTU 36.5 P1-1
                    </span>
                    <span className="text-base font-bold">
                      {audit.isStructurallySafe && audit.dtuPitchCompliant
                        ? 'Ancrage & Entraxe 100% Conformes'
                        : audit.isStructurallySafe
                        ? 'Entraxe à Corriger (Trop Large)'
                        : 'Surcharge à l Arrachement (Critique)'}
                    </span>
                  </div>
                </div>
                <span className="text-xs px-3 py-1 rounded-full font-bold bg-white/60 dark:bg-slate-900/60 shadow-sm">
                  {audit.totalAnchorsCount} fixations totales
                </span>
              </div>

              {/* 4 Performance KPI Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center gap-2 mb-2 text-blue-600 dark:text-blue-400">
                    <Maximize2 className="w-4 h-4" />
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      Entraxe Réel sur Montants
                    </span>
                  </div>
                  <div className="flex items-baseline justify-between mb-1">
                    <span className="text-2xl font-black text-blue-600 dark:text-blue-400">
                      {audit.actualJambSpacingMm} mm
                    </span>
                    <span className="text-xs font-semibold text-slate-500">
                      Max : {audit.maxAllowablePitchMm} mm
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Distance d angle respectée à {audit.cornerOffsetMm} mm (plage DTU : 100 à 150 mm).
                  </p>
                </div>

                <div className="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center gap-2 mb-2 text-indigo-600 dark:text-indigo-400">
                    <Wind className="w-4 h-4" />
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      Traction de Calcul par Cheville
                    </span>
                  </div>
                  <div className="flex items-baseline justify-between mb-1">
                    <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
                      {audit.tensileDesignReactionPerAnchorKn} kN
                    </span>
                    <span className="text-xs font-semibold text-slate-500">
                      N_Rd admissible : {audit.designTensileResistanceKn} kN
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Sous dépression de vent RNV 2013 de {windDesignPressurePa} Pa avec concentration trapézoïdale.
                  </p>
                </div>

                <div className="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center gap-2 mb-2 text-emerald-600 dark:text-emerald-400">
                    <Activity className="w-4 h-4" />
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      Taux de Sollicitation ETAG 020
                    </span>
                  </div>
                  <div className="flex items-baseline justify-between mb-1">
                    <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                      {audit.utilizationRatePercent}%
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        audit.utilizationRatePercent <= 70
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300'
                          : audit.utilizationRatePercent <= 100
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300'
                          : 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300'
                      }`}
                    >
                      {audit.utilizationRatePercent <= 100 ? 'Sécuritaire' : 'Surcharge'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Critère de rupture à l arrachement : N_Ed / N_Rd doit rester strictement &lt;= 100%.
                  </p>
                </div>

                <div className="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center gap-2 mb-2 text-cyan-600 dark:text-cyan-400">
                    <Building2 className="w-4 h-4" />
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      Profondeur Forage & Serrage
                    </span>
                  </div>
                  <div className="flex items-baseline justify-between mb-1">
                    <span className="text-2xl font-black text-cyan-600 dark:text-cyan-400">
                      {currentSubstrate.minEmbedmentDepthHefMm} mm
                    </span>
                    <span className="text-xs font-semibold text-slate-500">
                      Couple : {currentFastener.tighteningTorqueNm} N·m
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Distance minimale aux arêtes de maçonnerie c_min = {currentSubstrate.minEdgeDistanceCminMm} mm.
                  </p>
                </div>
              </div>

              {/* Fasteners Breakdown List */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
                <span className="font-bold text-slate-800 dark:text-slate-200 block mb-2">
                  Répartition Géométrique des {audit.totalAnchorsCount} Ancrages :
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-slate-600 dark:text-slate-300">
                  <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <span className="text-slate-400 block text-[10px]">Montants Latéraux</span>
                    <span className="font-bold text-sm text-slate-900 dark:text-white">
                      {audit.jambAnchorsPerSide * 2} unités
                    </span>
                    <span className="text-[10px] text-slate-500 block">
                      ({audit.jambAnchorsPerSide} par montant à entraxe {audit.actualJambSpacingMm}mm)
                    </span>
                  </div>
                  <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <span className="text-slate-400 block text-[10px]">Traverse Haute (Linteau)</span>
                    <span className="font-bold text-sm text-slate-900 dark:text-white">
                      {audit.headAnchorsCount} unités
                    </span>
                    <span className="text-[10px] text-slate-500 block">
                      (Entraxe {audit.actualTransomSpacingMm}mm)
                    </span>
                  </div>
                  <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <span className="text-slate-400 block text-[10px]">Traverse Basse (Appui)</span>
                    <span className="font-bold text-sm text-slate-900 dark:text-white">
                      {audit.sillAnchorsCount} unités
                    </span>
                    <span className="text-[10px] text-slate-500 block">
                      (Vis étanches avec rondelles EPDM)
                    </span>
                  </div>
                  <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <span className="text-slate-400 block text-[10px]">Meneaux / Traverses</span>
                    <span className="font-bold text-sm text-slate-900 dark:text-white">
                      {audit.intermediateReinforcementAnchors} unités
                    </span>
                    <span className="text-[10px] text-slate-500 block">
                      (Fixations de renfort &lt;= 150mm)
                    </span>
                  </div>
                </div>
              </div>

              {/* Warnings List */}
              {audit.auditWarnings.length > 0 && (
                <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl">
                  <span className="text-xs font-bold text-amber-700 dark:text-amber-300 flex items-center gap-1.5 mb-1.5">
                    <AlertTriangle className="w-4 h-4" />
                    Alertes Techniques d Ancrage :
                  </span>
                  <ul className="text-xs text-amber-900 dark:text-amber-200 space-y-1">
                    {audit.auditWarnings.map((w, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="text-amber-500">•</span>
                        <span>{w}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: DESSIN CAD 2D */}
          {activeTab === 'cad_view' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                    Plan d Implantation CAD 2D des Chevilles
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Repérage des points de fixation selon NF DTU 36.5 et coupe de cheville
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs font-bold">
                  <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                    Conforme (&lt;={audit.maxAllowablePitchMm}mm)
                  </span>
                </div>
              </div>

              {/* Dynamic 2D CAD SVG */}
              <div className="w-full bg-slate-950 rounded-2xl border border-slate-800 p-4 overflow-hidden relative shadow-inner">
                <svg
                  viewBox="0 0 650 360"
                  className="w-full h-auto max-h-[380px] select-none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <defs>
                    <pattern id="brickHatchCad" width="12" height="6" patternUnits="userSpaceOnUse">
                      <rect width="12" height="6" fill="#1e293b" />
                      <line x1="0" y1="0" x2="12" y2="0" stroke="#334155" strokeWidth="0.8" />
                      <line x1="6" y1="0" x2="6" y2="6" stroke="#334155" strokeWidth="0.8" />
                    </pattern>
                  </defs>

                  {/* Blueprint Grid */}
                  <g opacity="0.15">
                    {Array.from({ length: 14 }).map((_, i) => (
                      <line key={`v-${i}`} x1={i * 50} y1="0" x2={i * 50} y2="360" stroke="#3b82f6" strokeWidth="0.5" />
                    ))}
                    {Array.from({ length: 8 }).map((_, i) => (
                      <line key={`h-${i}`} x1="0" y1={i * 50} x2="650" y2={i * 50} stroke="#3b82f6" strokeWidth="0.5" />
                    ))}
                  </g>

                  {/* LEFT REGION: ELEVATION WITH ANCHOR POINTS */}
                  {/* Surrounding Wall / Tableau */}
                  <rect x="30" y="30" width="340" height="300" fill="url(#brickHatchCad)" stroke="#475569" strokeWidth="1" />

                  {/* Window Frame Opening */}
                  <rect x="50" y="50" width="300" height="260" fill="#090d16" stroke="#38bdf8" strokeWidth="2" />
                  <rect x="65" y="65" width="270" height="230" fill="rgba(14, 165, 233, 0.08)" stroke="#0284c7" strokeWidth="1.2" />

                  {/* Glass Reflection Highlight */}
                  <polygon points="75,75 140,75 95,285 75,285" fill="rgba(255, 255, 255, 0.04)" />
                  <polygon points="160,75 220,75 125,285 105,285" fill="rgba(255, 255, 255, 0.03)" />

                  {/* Optional Intermediate Mullion */}
                  {intermediateMullionsCount > 0 && (
                    <rect x="195" y="50" width="10" height="260" fill="#1e293b" stroke="#38bdf8" strokeWidth="1" />
                  )}

                  {/* Fastener Points Plotted Along Frame */}
                  {/* Left Jamb Anchors */}
                  {Array.from({ length: audit.jambAnchorsPerSide }).map((_, idx) => {
                    const stepY = (260 - 24) / (audit.jambAnchorsPerSide - 1);
                    const cy = 50 + 12 + idx * stepY;
                    return (
                      <g key={`left-${idx}`}>
                        <circle cx="50" cy={cy} r="5" fill="#10b981" stroke="#ffffff" strokeWidth="1.2" />
                        <line x1="42" y1={cy} x2="58" y2={cy} stroke="#ffffff" strokeWidth="0.8" />
                        <line x1="50" y1={cy - 4} x2="50" y2={cy + 4} stroke="#ffffff" strokeWidth="0.8" />
                      </g>
                    );
                  })}

                  {/* Right Jamb Anchors */}
                  {Array.from({ length: audit.jambAnchorsPerSide }).map((_, idx) => {
                    const stepY = (260 - 24) / (audit.jambAnchorsPerSide - 1);
                    const cy = 50 + 12 + idx * stepY;
                    return (
                      <g key={`right-${idx}`}>
                        <circle cx="350" cy={cy} r="5" fill="#10b981" stroke="#ffffff" strokeWidth="1.2" />
                        <line x1="342" y1={cy} x2="358" y2={cy} stroke="#ffffff" strokeWidth="0.8" />
                        <line x1="350" y1={cy - 4} x2="350" y2={cy + 4} stroke="#ffffff" strokeWidth="0.8" />
                      </g>
                    );
                  })}

                  {/* Head Anchors (Traverse Haute) */}
                  {Array.from({ length: audit.headAnchorsCount }).map((_, idx) => {
                    const stepX = (300 - 24) / (audit.headAnchorsCount - 1);
                    const cx = 50 + 12 + idx * stepX;
                    return (
                      <circle key={`head-${idx}`} cx={cx} cy="50" r="4.5" fill="#10b981" stroke="#ffffff" strokeWidth="1" />
                    );
                  })}

                  {/* Sill Anchors (Traverse Basse) */}
                  {Array.from({ length: audit.sillAnchorsCount }).map((_, idx) => {
                    const stepX = (300 - 24) / (audit.sillAnchorsCount - 1);
                    const cx = 50 + 12 + idx * stepX;
                    return (
                      <circle key={`sill-${idx}`} cx={cx} cy="310" r="4.5" fill="#10b981" stroke="#ffffff" strokeWidth="1" />
                    );
                  })}

                  {/* Dimension Annotations */}
                  {/* Corner Offset Dimension on Top-Left */}
                  <line x1="20" y1="50" x2="20" y2="62" stroke="#94a3b8" strokeWidth="1" />
                  <line x1="16" y1="50" x2="24" y2="50" stroke="#94a3b8" strokeWidth="1" />
                  <line x1="16" y1="62" x2="24" y2="62" stroke="#94a3b8" strokeWidth="1" />
                  <text x="14" y="58" fill="#94a3b8" fontSize="8" textAnchor="end" fontWeight="bold">
                    {audit.cornerOffsetMm}mm
                  </text>

                  {/* Pitch Dimension on Left Jamb */}
                  <line x1="20" y1="62" x2="20" y2={62 + (260 - 24) / (audit.jambAnchorsPerSide - 1)} stroke="#38bdf8" strokeWidth="1" />
                  <line x1="16" y1={62 + (260 - 24) / (audit.jambAnchorsPerSide - 1)} x2="24" y2={62 + (260 - 24) / (audit.jambAnchorsPerSide - 1)} stroke="#38bdf8" strokeWidth="1" />
                  <text
                    x="14"
                    y={62 + (260 - 24) / (audit.jambAnchorsPerSide - 1) / 2}
                    fill="#38bdf8"
                    fontSize="8.5"
                    textAnchor="end"
                    fontWeight="bold"
                  >
                    Entraxe {audit.actualJambSpacingMm}mm
                  </text>

                  {/* Center Label on Window */}
                  <text x="200" y="170" fill="#e2e8f0" fontSize="12" fontWeight="bold" textAnchor="middle">
                    {windowWidthMm} × {windowHeightMm} mm
                  </text>
                  <text x="200" y="186" fill="#38bdf8" fontSize="9.5" textAnchor="middle">
                    {audit.totalAnchorsCount} Fixations • Entraxe max {audit.maxAllowablePitchMm}mm
                  </text>

                  {/* RIGHT REGION: ANCHOR CROSS-SECTION DETAIL */}
                  <rect x="400" y="35" width="225" height="295" rx="12" fill="#0f172a" stroke="#334155" strokeWidth="1.5" />
                  <text x="512" y="60" fill="#f8fafc" fontSize="11" fontWeight="bold" textAnchor="middle">
                    COUPE ANCRAGE CHEVILLE
                  </text>

                  {/* Masonry Substrate Section */}
                  <rect x="420" y="80" width="185" height="150" fill="url(#brickHatchCad)" stroke="#64748b" strokeWidth="1" />

                  {/* Window Frame Profile Edge */}
                  <rect x="420" y="80" width="25" height="150" fill="#1e293b" stroke="#38bdf8" strokeWidth="1.5" />

                  {/* Drilled Hole in Substrate */}
                  <rect x="445" y="140" width="130" height="28" fill="#020617" stroke="#475569" strokeWidth="1" />

                  {/* Nylon Plug Sleeve with Expansion Wings */}
                  <rect x="445" y="144" width="120" height="20" rx="3" fill="#38bdf8" stroke="#0284c7" strokeWidth="1.2" />
                  {/* Expansion Wings */}
                  <polygon points="515,144 535,136 538,144" fill="#0284c7" />
                  <polygon points="515,164 535,172 538,164" fill="#0284c7" />

                  {/* Steel Screw Shaft through frame */}
                  <rect x="415" y="151" width="155" height="6" fill="#cbd5e1" stroke="#94a3b8" strokeWidth="0.8" />
                  {/* Screw Head on Frame */}
                  <polygon points="415,145 423,151 423,157 415,163" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="1" />

                  {/* Wind Traction Reaction Force Arrow */}
                  <path d="M 400 154 L 370 154" fill="none" stroke="#f43f5e" strokeWidth="2.5" />
                  <polygon points="365,154 374,150 374,158" fill="#f43f5e" />
                  <text x="360" y="144" fill="#f43f5e" fontSize="9" fontWeight="bold" textAnchor="middle">
                    N_Ed {audit.tensileDesignReactionPerAnchorKn}kN
                  </text>

                  {/* Substrate Embedment Text */}
                  <text x="510" y="195" fill="#e2e8f0" fontSize="9" textAnchor="middle" fontWeight="bold">
                    hef = {currentSubstrate.minEmbedmentDepthHefMm} mm
                  </text>
                  <text x="510" y="210" fill="#94a3b8" fontSize="8" textAnchor="middle">
                    Foret diamètre {currentFastener.drillDiameterMm} mm
                  </text>

                  {/* Status Banner in Card */}
                  <rect x="415" y="245" width="195" height="34" rx="6" fill="rgba(16, 185, 129, 0.15)" stroke="#10b981" />
                  <text x="512" y="261" fill="#34d399" fontSize="10" fontWeight="bold" textAnchor="middle">
                    RÉSISTANCE : N_Rd = {audit.designTensileResistanceKn} kN
                  </text>
                  <text x="512" y="273" fill="#a7f3d0" fontSize="8" textAnchor="middle">
                    Sollicitation : {audit.utilizationRatePercent}% (Sécurité certifiée)
                  </text>
                </svg>
              </div>

              {/* Principles legend */}
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 space-y-1">
                <span className="font-bold text-slate-800 dark:text-slate-200 block">
                  Règles Techniques d Implantation NF DTU 36.5 P1-1 :
                </span>
                <p>
                  1. Les fixations d angle doivent être positionnées à une distance de 100 à 150 mm des angles intérieurs pour autoriser la libre dilatation thermique des profilés aluminium.
                </p>
                <p>
                  2. L entraxe maximal entre fixations ne doit pas dépasser 800 mm pour profilés clairs (700 mm pour profilés sombres exposés au soleil estival).
                </p>
              </div>
            </div>
          )}

          {/* TAB 4: NOMENCLATURE & PDF */}
          {activeTab === 'bom_dtu' && (
            <div className="space-y-5">
              {/* BOM Table */}
              <div>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block mb-2">
                  Quincaillerie & Consommables de Pose au Gros Œuvre
                </span>
                <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-700">
                      <tr>
                        <th className="p-3">Composant</th>
                        <th className="p-3">Désignation</th>
                        <th className="p-3">Quantité</th>
                        <th className="p-3">Spécifications</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                      <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className="p-3 font-semibold text-slate-900 dark:text-white">Chevilles de Dormant</td>
                        <td className="p-3">{currentFastener.labelFr}</td>
                        <td className="p-3 font-bold text-blue-600 dark:text-blue-400">
                          {audit.totalAnchorsCount} unités
                        </td>
                        <td className="p-3 text-[11px] text-slate-500">
                          Diamètre {currentFastener.drillDiameterMm}mm • Longueur {currentFastener.totalLengthMm}mm
                        </td>
                      </tr>
                      <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className="p-3 font-semibold text-slate-900 dark:text-white">Foret & Outillage</td>
                        <td className="p-3">{audit.billOfMaterials.recommendedDrillBit}</td>
                        <td className="p-3 font-bold text-blue-600 dark:text-blue-400">1 pièce</td>
                        <td className="p-3 text-[11px] text-slate-500">
                          Profondeur forée : {currentSubstrate.minEmbedmentDepthHefMm + 15} mm
                        </td>
                      </tr>
                      <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className="p-3 font-semibold text-slate-900 dark:text-white">Cales de Calfeutrement</td>
                        <td className="p-3">Cales d assise et d espacement imputrescibles</td>
                        <td className="p-3 font-bold text-blue-600 dark:text-blue-400">
                          {Math.max(6, Math.ceil(audit.totalAnchorsCount * 0.8))} cales
                        </td>
                        <td className="p-3 text-[11px] text-slate-500">
                          Placer au droit des fixations sans déformer le profilé
                        </td>
                      </tr>
                      <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className="p-3 font-semibold text-slate-900 dark:text-white">Temps de Fixation Chantier</td>
                        <td className="p-3">Perçage, calage, chevillage et réglage d aplomb</td>
                        <td className="p-3 font-bold text-emerald-600 dark:text-emerald-400">
                          {audit.billOfMaterials.assemblyTimeMinutes} minutes
                        </td>
                        <td className="p-3 text-[11px] text-slate-500">
                          Couple de serrage {currentFastener.tighteningTorqueNm} N·m
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Recommendations checklist */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block mb-2">
                  Prescriptions Techniques de Chantier (NF DTU 36.5 P1-1) :
                </span>
                <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-1.5">
                  {audit.auditRecommendations.map((reco, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                      <span>{reco}</span>
                    </li>
                  ))}
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                    <span>
                      Dans la brique creuse, percer impérativement en rotation simple sans activer la percussion pour préserver l intégrité des alvéoles.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                    <span>
                      Dépoussiérer soigneusement les trous de forage à l air comprimé ou avec une pompe manuelle avant l insertion de la cheville.
                    </span>
                  </li>
                </ul>
              </div>

              {/* PDF Action Button */}
              <button
                onClick={handleExportPdf}
                disabled={isGeneratingPdf}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-bold rounded-xl shadow-lg shadow-blue-500/20 transition min-h-[48px] disabled:opacity-50"
              >
                <FileCheck className="w-5 h-5" />
                <span>
                  {isGeneratingPdf ? 'Génération de l Attestation en cours...' : 'Télécharger l Attestation Technique d Ancrage (PDF)'}
                </span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
