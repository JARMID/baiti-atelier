import React, { useState, useMemo } from 'react';
import {
  X,
  FileCheck,
  Sliders,
  Layers,
  CheckCircle2,
  AlertTriangle,
  Activity,
  ShieldCheck,
  Compass,
} from 'lucide-react';
import { playTactileClick, playSwitchSound, playSlideTick } from '../../utils/audioFeedback';
import {
  calculateCasementHingeAudit,
  GLAZING_WEIGHT_CATALOG,
  HINGE_MODEL_SPECS,
  type HingeModelType,
  type GlassBracingMethodType,
} from '../../utils/casementHingeManager';
import { generateCasementHingeNoticePdf } from '../../utils/pdfGenerator';

interface CasementHingeModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialWidth?: number;
  initialHeight?: number;
  projectReference?: string;
  wilayaName?: string;
  clientName?: string;
}

export const CasementHingeModal: React.FC<CasementHingeModalProps> = ({
  isOpen,
  onClose,
  initialWidth = 1100,
  initialHeight = 1400,
  projectReference = 'Audit Ferrure Ouvrant & Équerrage',
  wilayaName = '16 - Alger',
  clientName = 'Client Particulier',
}) => {
  const [activeTab, setActiveTab] = useState<'config' | 'mechanics_dtu' | 'cad_view' | 'bom_dtu'>('config');

  // Input states
  const [sashWidthMm, setSashWidthMm] = useState<number>(initialWidth);
  const [sashHeightMm, setSashHeightMm] = useState<number>(initialHeight);
  const [glazingKey, setGlazingKey] = useState<string>('double_4_16_4');
  const [hingeModel, setHingeModel] = useState<HingeModelType>('heavy_tilt_turn_100kg');
  const [bracingMethod, setBracingMethod] = useState<GlassBracingMethodType>('triangulated_dtu39');
  const [aluminumProfileWeightKgPerM, setAluminumProfileWeightKgPerM] = useState<number>(2.2);
  const [hardwareWeightKg, setHardwareWeightKg] = useState<number>(3.5);

  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  // Audit computation
  const audit = useMemo(() => {
    return calculateCasementHingeAudit({
      sashWidthMm,
      sashHeightMm,
      glazingKey,
      hingeModel,
      bracingMethod,
      aluminumProfileWeightKgPerM,
      hardwareWeightKg,
      wilayaName,
      clientName,
      projectReference,
    });
  }, [
    sashWidthMm,
    sashHeightMm,
    glazingKey,
    hingeModel,
    bracingMethod,
    aluminumProfileWeightKgPerM,
    hardwareWeightKg,
    wilayaName,
    clientName,
    projectReference,
  ]);

  if (!isOpen) return null;

  const handleExportPdf = async () => {
    try {
      setIsGeneratingPdf(true);
      playTactileClick();
      const docId = `FER-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
      await generateCasementHingeNoticePdf({
        documentId: docId,
        projectRef: projectReference,
        clientName,
        wilaya: wilayaName,
        auditInput: {
          sashWidthMm,
          sashHeightMm,
          glazingKey,
          hingeModel,
          bracingMethod,
          aluminumProfileWeightKgPerM,
          hardwareWeightKg,
          wilayaName,
          clientName,
          projectReference,
        },
        auditResult: audit,
      });
    } catch (err) {
      console.error('Erreur génération attestation ferrure:', err);
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
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                Ferrure Ouvrant, Traction Compas & Calage DTU 39
                <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300">
                  NF EN 13126-8
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Calcul de charge ferrure oscillo-battante, calage d équerrage et tenue à l affaissement
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
            Géométrie & Ferrure
          </button>

          <button
            onClick={() => {
              playSwitchSound();
              setActiveTab('mechanics_dtu');
            }}
            className={`flex items-center gap-2 px-3.5 py-2.5 text-xs font-semibold rounded-t-lg transition min-h-[44px] whitespace-nowrap ${
              activeTab === 'mechanics_dtu'
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 border-t-2 border-blue-500 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Activity className="w-4 h-4" />
            Statique & DTU 39
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
          {/* TAB 1: GÉOMÉTRIE & FERRURE */}
          {activeTab === 'config' && (
            <div className="space-y-5">
              {/* Presets */}
              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-800">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-2">
                  Préréglages d Ouvrants Types :
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    onClick={() => {
                      playTactileClick();
                      setSashWidthMm(1000);
                      setSashHeightMm(1300);
                      setGlazingKey('double_4_16_4');
                      setHingeModel('standard_tilt_turn_80kg');
                    }}
                    className="p-2 text-left bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg hover:border-blue-500 transition min-h-[44px]"
                  >
                    <span className="text-xs font-bold block text-slate-800 dark:text-slate-200">OB Résidentiel</span>
                    <span className="text-[10px] text-slate-500">1000x1300 • Vitrage 4/16/4</span>
                  </button>
                  <button
                    onClick={() => {
                      playTactileClick();
                      setSashWidthMm(1100);
                      setSashHeightMm(2150);
                      setGlazingKey('double_6_16_6');
                      setHingeModel('reinforced_tilt_turn_130kg');
                    }}
                    className="p-2 text-left bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg hover:border-blue-500 transition min-h-[44px]"
                  >
                    <span className="text-xs font-bold block text-slate-800 dark:text-slate-200">Porte-Fenêtre Balcon</span>
                    <span className="text-[10px] text-slate-500">1100x2150 • 6/16/6 Lourd</span>
                  </button>
                  <button
                    onClick={() => {
                      playTactileClick();
                      setSashWidthMm(1250);
                      setSashHeightMm(1450);
                      setGlazingKey('acoustic_44_2_12_4');
                      setHingeModel('heavy_tilt_turn_100kg');
                    }}
                    className="p-2 text-left bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg hover:border-blue-500 transition min-h-[44px]"
                  >
                    <span className="text-xs font-bold block text-slate-800 dark:text-slate-200">Silence Acoustique</span>
                    <span className="text-[10px] text-slate-500">1250x1450 • Feuilleté 44.2</span>
                  </button>
                  <button
                    onClick={() => {
                      playTactileClick();
                      setSashWidthMm(1400);
                      setSashHeightMm(2300);
                      setGlazingKey('triple_4_12_4_12_4');
                      setHingeModel('monumental_tilt_turn_160kg');
                    }}
                    className="p-2 text-left bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg hover:border-blue-500 transition min-h-[44px]"
                  >
                    <span className="text-xs font-bold block text-slate-800 dark:text-slate-200">Baie Monumentale</span>
                    <span className="text-[10px] text-slate-500">1400x2300 • Triple Vitrage</span>
                  </button>
                </div>
              </div>

              {/* Dimensional Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Largeur Ouvrant de Fond de Feuillure (mm)
                  </label>
                  <input
                    type="number"
                    value={sashWidthMm}
                    onChange={(e) => {
                      playSlideTick();
                      setSashWidthMm(Math.max(400, Number(e.target.value)));
                    }}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-sm font-semibold min-h-[44px]"
                  />
                  <span className="text-[11px] text-slate-500 mt-1 block">
                    Largeur de rotation : {sashWidthMm} mm (Ratio L/H : {audit.aspectRatioWidthToHeight})
                  </span>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Hauteur Ouvrant de Fond de Feuillure (mm)
                  </label>
                  <input
                    type="number"
                    value={sashHeightMm}
                    onChange={(e) => {
                      playSlideTick();
                      setSashHeightMm(Math.max(400, Number(e.target.value)));
                    }}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-sm font-semibold min-h-[44px]"
                  />
                  <span className="text-[11px] text-slate-500 mt-1 block">
                    Surface vitrée calculée : {audit.glassSurfaceM2} m²
                  </span>
                </div>
              </div>

              {/* Advanced Profile & Hardware Weights */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Poids Linéaire Profilé Ouvrant (kg/m)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={aluminumProfileWeightKgPerM}
                    onChange={(e) => {
                      playSlideTick();
                      setAluminumProfileWeightKgPerM(Math.max(1.0, Number(e.target.value)));
                    }}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-sm font-semibold min-h-[44px]"
                  />
                  <span className="text-[11px] text-slate-500 mt-1 block">
                    Poids total cadre aluminium : {audit.frameAluminumMassKg} kg
                  </span>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Poids Garniture Ferrure & Crémone (kg)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={hardwareWeightKg}
                    onChange={(e) => {
                      playSlideTick();
                      setHardwareWeightKg(Math.max(1.0, Number(e.target.value)));
                    }}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-sm font-semibold min-h-[44px]"
                  />
                  <span className="text-[11px] text-slate-500 mt-1 block">
                    Poids accessoires et tringlerie : {audit.hardwareMassKg} kg
                  </span>
                </div>
              </div>

              {/* Glazing Selection */}
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Composition du Vitrage Isolant
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {Object.entries(GLAZING_WEIGHT_CATALOG).map(([key, spec]) => (
                    <button
                      key={key}
                      onClick={() => {
                        playTactileClick();
                        setGlazingKey(key);
                      }}
                      className={`p-3 text-left rounded-xl border transition min-h-[44px] flex flex-col justify-between ${
                        glazingKey === key
                          ? 'border-blue-500 bg-blue-50/60 dark:bg-blue-900/20 ring-1 ring-blue-500'
                          : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-slate-300'
                      }`}
                    >
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        {spec.labelFr}
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        Épaisseur totale : {spec.totalThicknessMm} mm • Épaisseur verre utile : {spec.glassThicknessMm} mm
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Hinge Selection */}
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Modèle & Capacité de la Ferrure (NF EN 13126-8)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {Object.entries(HINGE_MODEL_SPECS).map(([key, spec]) => (
                    <button
                      key={key}
                      onClick={() => {
                        playTactileClick();
                        setHingeModel(key as HingeModelType);
                      }}
                      className={`p-3 text-left rounded-xl border transition min-h-[44px] flex flex-col justify-between ${
                        hingeModel === key
                          ? 'border-blue-500 bg-blue-50/60 dark:bg-blue-900/20 ring-1 ring-blue-500'
                          : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                          {spec.labelFr}
                        </span>
                        <span className="text-xs px-2 py-0.5 rounded font-bold bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                          Max {spec.maxRatedSashWeightKg} kg
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                        Compas : {spec.maxAllowableStayTensileForceN} N • Pivot bas : {spec.maxAllowablePivotResultantLoadN} N • {spec.testedEnduranceCycles.toLocaleString()} cycles
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Bracing Method */}
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Méthode de Calage d Équerrage du Vitrage
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <button
                    onClick={() => {
                      playTactileClick();
                      setBracingMethod('triangulated_dtu39');
                    }}
                    className={`p-3 text-left rounded-xl border transition min-h-[44px] ${
                      bracingMethod === 'triangulated_dtu39'
                        ? 'border-emerald-500 bg-emerald-50/60 dark:bg-emerald-900/20 ring-1 ring-emerald-500'
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800'
                    }`}
                  >
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                      Triangulé DTU 39 (Recommandé)
                    </span>
                    <span className="text-[10px] text-slate-500 mt-1 block">
                      Cales d assise et d équerrage opposées. Le verre absorbe 78% du cisaillement.
                    </span>
                  </button>

                  <button
                    onClick={() => {
                      playTactileClick();
                      setBracingMethod('structural_bonding');
                    }}
                    className={`p-3 text-left rounded-xl border transition min-h-[44px] ${
                      bracingMethod === 'structural_bonding'
                        ? 'border-blue-500 bg-blue-50/60 dark:bg-blue-900/20 ring-1 ring-blue-500'
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800'
                    }`}
                  >
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                      Collage VEC / Structural
                    </span>
                    <span className="text-[10px] text-slate-500 mt-1 block">
                      Cordons silicone structurel continu. Rigidité maximale 92%.
                    </span>
                  </button>

                  <button
                    onClick={() => {
                      playTactileClick();
                      setBracingMethod('perimeter_unbraced');
                    }}
                    className={`p-3 text-left rounded-xl border transition min-h-[44px] ${
                      bracingMethod === 'perimeter_unbraced'
                        ? 'border-rose-500 bg-rose-50/60 dark:bg-rose-900/20 ring-1 ring-rose-500'
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800'
                    }`}
                  >
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                      Calage Périphérique Non-Triangulé
                    </span>
                    <span className="text-[10px] text-rose-500 mt-1 block">
                      Équerres alu seules. Risque élevé d affaissement et de frottement du vantail.
                    </span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: STATIQUE & DTU 39 */}
          {activeTab === 'mechanics_dtu' && (
            <div className="space-y-5">
              {/* Summary Status Banner */}
              <div
                className={`p-4 rounded-xl border ${
                  audit.capacityStatus === 'optimal' && audit.isSaggingAcceptable
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800'
                    : audit.capacityStatus === 'acceptable' && audit.isSaggingAcceptable
                    ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800'
                    : 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  {audit.capacityStatus === 'optimal' && audit.isSaggingAcceptable ? (
                    <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  ) : (
                    <AlertTriangle className="w-6 h-6 text-amber-600 dark:text-amber-400 shrink-0" />
                  )}
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      Charge Ouvrant : {audit.totalSashMassKg} kg (Capacité Nominale : {audit.hingeRatedCapacityKg} kg)
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                      Taux de charge ferrure : {audit.capacityUtilizationPercent}% • Flèche d affaissement : {audit.estimatedDiagonalDroopMm} mm (Seuil DTU : {audit.maxAllowableDroopMm} mm)
                    </p>
                  </div>
                </div>
              </div>

              {/* 4 Cards Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
                  <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block">
                    Poids Total Ouvrant
                  </span>
                  <span className="text-lg font-extrabold text-slate-900 dark:text-white block mt-1">
                    {audit.totalSashMassKg} kg
                  </span>
                  <span className="text-[10px] text-slate-500 block mt-0.5">
                    Verre : {audit.glassMassKg} kg • Cadre : {audit.frameAluminumMassKg} kg
                  </span>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
                  <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block">
                    Traction Compas Haut
                  </span>
                  <span className="text-lg font-extrabold text-blue-600 dark:text-blue-400 block mt-1">
                    {audit.topStayTensileForceN} N
                  </span>
                  <span className="text-[10px] text-slate-500 block mt-0.5">
                    Admissible : {audit.maxAllowableStayForceN} N (Sf = {audit.staySafetyFactor})
                  </span>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
                  <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block">
                    Charge Pivot Bas
                  </span>
                  <span className="text-lg font-extrabold text-indigo-600 dark:text-indigo-400 block mt-1">
                    {audit.bottomPivotResultantForceN} N
                  </span>
                  <span className="text-[10px] text-slate-500 block mt-0.5">
                    Vertical : {audit.bottomPivotVerticalForceN} N • Sf = {audit.pivotSafetyFactor}
                  </span>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
                  <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block">
                    Affaissement Diagonal
                  </span>
                  <span
                    className={`text-lg font-extrabold block mt-1 ${
                      audit.isSaggingAcceptable ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                    }`}
                  >
                    {audit.estimatedDiagonalDroopMm} mm
                  </span>
                  <span className="text-[10px] text-slate-500 block mt-0.5">
                    Limite DTU : {audit.maxAllowableDroopMm} mm • Réglage H : ±{audit.adjustmentMarginHeightMm} mm
                  </span>
                </div>
              </div>

              {/* Statics Breakdown */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3">
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Équilibre Statique & Moment de Basculement (NF EN 13126-8) :
                </h4>
                <div className="text-xs text-slate-600 dark:text-slate-300 space-y-1.5 leading-relaxed">
                  <p>
                    • Le vantail en rotation transmet son moment de gravité $M = P \cdot (L / 2)$ en un couple de forces horizontales opposées.
                  </p>
                  <p>
                    • Le compas supérieur encaisse un effort de traction horizontal direct de <strong>{audit.topStayTensileForceN} N</strong> (limite constructeur : {audit.maxAllowableStayForceN} N).
                  </p>
                  <p>
                    • Le palier d angle inférieur reprend la résultante de la gravité ({audit.bottomPivotVerticalForceN} N) et de la poussée horizontale, soit <strong>{audit.bottomPivotResultantForceN} N</strong>.
                  </p>
                  <p>
                    • Calage d équerrage NF DTU 39 Section 6.5 : {audit.dtu39CalageCompliant ? 'Conforme. La rigidité propre du verre soulage les angles alu.' : 'Non conforme. Le cadre alu fléchit sous son propre poids.'}
                  </p>
                </div>
              </div>

              {/* Recommendations and Warnings */}
              {(audit.auditWarnings.length > 0 || audit.auditRecommendations.length > 0) && (
                <div className="space-y-2">
                  {audit.auditWarnings.map((w, idx) => (
                    <div
                      key={`warn-${idx}`}
                      className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2"
                    >
                      <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>{w}</span>
                    </div>
                  ))}
                  {audit.auditRecommendations.map((r, idx) => (
                    <div
                      key={`reco-${idx}`}
                      className="p-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg text-xs text-blue-800 dark:text-blue-300 flex items-start gap-2"
                    >
                      <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>{r}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: DESSIN CAD 2D */}
          {activeTab === 'cad_view' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Schéma Vectoriel 2D : Vantail, Réactions d Appuis & Calage d Équerrage
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 font-semibold">
                  Norme NF DTU 39
                </span>
              </div>

              <div className="relative w-full h-[380px] bg-slate-900 rounded-xl border border-slate-700 p-4 flex items-center justify-center overflow-hidden">
                <svg
                  viewBox="0 0 500 420"
                  className="w-full h-full max-h-[360px]"
                  style={{ filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.5))' }}
                >
                  <defs>
                    <pattern id="gridPattern" width="20" height="20" patternUnits="userSpaceOnUse">
                      <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" />
                    </pattern>
                    <marker id="arrowRed" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                      <polygon points="0 0, 6 3, 0 6" fill="#ef4444" />
                    </marker>
                    <marker id="arrowBlue" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                      <polygon points="0 0, 6 3, 0 6" fill="#3b82f6" />
                    </marker>
                    <marker id="arrowGreen" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                      <polygon points="0 0, 6 3, 0 6" fill="#10b981" />
                    </marker>
                  </defs>

                  {/* Grid background */}
                  <rect x="0" y="0" width="500" height="420" fill="url(#gridPattern)" />

                  {/* Sash Profile Outer Rectangle */}
                  <rect
                    x="100"
                    y="50"
                    width="260"
                    height="320"
                    rx="4"
                    fill="#1e293b"
                    stroke="#475569"
                    strokeWidth="3"
                  />

                  {/* Sash Profile Inner Opening (Glass Rebate) */}
                  <rect
                    x="124"
                    y="74"
                    width="212"
                    height="272"
                    rx="2"
                    fill="#0f172a"
                    stroke="#64748b"
                    strokeWidth="1.5"
                  />

                  {/* Insulating Glass Unit */}
                  <rect
                    x="130"
                    y="80"
                    width="200"
                    height="260"
                    fill="rgba(56, 189, 248, 0.12)"
                    stroke="#0284c7"
                    strokeWidth="1.5"
                    strokeDasharray="4 2"
                  />

                  {/* Diagonal Compression Strut (DTU 39 Diaphragm effect) */}
                  <line
                    x1="130"
                    y1="340"
                    x2="330"
                    y2="80"
                    stroke="#10b981"
                    strokeWidth="2"
                    strokeDasharray="6 3"
                  />
                  <text x="235" y="205" fill="#10b981" fontSize="10" fontWeight="bold" transform="rotate(-52 235 205)">
                    Axe de Triangulation Vitrage DTU 39
                  </text>

                  {/* Top Stay Arm (Compas OB) */}
                  <rect x="92" y="44" width="16" height="24" rx="2" fill="#3b82f6" stroke="#ffffff" strokeWidth="1" />
                  <line x1="108" y1="56" x2="220" y2="56" stroke="#3b82f6" strokeWidth="3" strokeDasharray="3 2" />
                  <text x="100" y="36" fill="#93c5fd" fontSize="9" fontWeight="bold">
                    Compas Haut
                  </text>

                  {/* Tension Pullout Force Vector Arrow on Stay Arm */}
                  <line
                    x1="170"
                    y1="38"
                    x2="105"
                    y2="38"
                    stroke="#ef4444"
                    strokeWidth="2.5"
                    markerEnd="url(#arrowRed)"
                  />
                  <text x="180" y="42" fill="#f87171" fontSize="10" fontWeight="bold">
                    F_compas = {audit.topStayTensileForceN} N
                  </text>

                  {/* Bottom Corner Pivot (Palier d angle bas) */}
                  <rect x="90" y="352" width="20" height="24" rx="2" fill="#6366f1" stroke="#ffffff" strokeWidth="1" />
                  <text x="50" y="390" fill="#a5b4fc" fontSize="9" fontWeight="bold">
                    Pivot d Angle Bas
                  </text>

                  {/* Resultant Reaction Vector on Bottom Pivot */}
                  <line
                    x1="100"
                    y1="364"
                    x2="60"
                    y2="390"
                    stroke="#3b82f6"
                    strokeWidth="2.5"
                    markerEnd="url(#arrowBlue)"
                  />
                  <text x="60" y="410" fill="#60a5fa" fontSize="9" fontWeight="bold">
                    R_pivot = {audit.bottomPivotResultantForceN} N
                  </text>

                  {/* DTU 39 Setting Blocks (Cales élastomères vertes) */}
                  {/* 1. Bottom pivot corner setting block (Assise) */}
                  <rect x="135" y="338" width="34" height="6" rx="1.5" fill="#10b981" stroke="#ffffff" strokeWidth="1" />
                  {/* Lateral hinge bottom block */}
                  <rect x="126" y="300" width="6" height="34" rx="1.5" fill="#10b981" stroke="#ffffff" strokeWidth="1" />

                  {/* 2. Top stay opposite corner setting block (Équerrage) */}
                  <rect x="290" y="76" width="34" height="6" rx="1.5" fill="#10b981" stroke="#ffffff" strokeWidth="1" />
                  {/* Lateral handle top block */}
                  <rect x="328" y="86" width="6" height="34" rx="1.5" fill="#10b981" stroke="#ffffff" strokeWidth="1" />

                  {/* Annotations for setting blocks */}
                  <text x="140" y="360" fill="#34d399" fontSize="8.5" fontWeight="bold">
                    Cale Assise (Bas Paumelle)
                  </text>
                  <text x="250" y="70" fill="#34d399" fontSize="8.5" fontWeight="bold">
                    Cale Équerrage (Haut Opposé)
                  </text>

                  {/* Dimension Lines */}
                  {/* Width */}
                  <line x1="100" y1="395" x2="360" y2="395" stroke="#94a3b8" strokeWidth="1" />
                  <line x1="100" y1="390" x2="100" y2="400" stroke="#94a3b8" strokeWidth="1" />
                  <line x1="360" y1="390" x2="360" y2="400" stroke="#94a3b8" strokeWidth="1" />
                  <text x="210" y="408" fill="#cbd5e1" fontSize="10" textAnchor="middle">
                    L = {audit.sashWidthMm} mm
                  </text>

                  {/* Height */}
                  <line x1="380" y1="50" x2="380" y2="370" stroke="#94a3b8" strokeWidth="1" />
                  <line x1="375" y1="50" x2="385" y2="50" stroke="#94a3b8" strokeWidth="1" />
                  <line x1="375" y1="370" x2="385" y2="370" stroke="#94a3b8" strokeWidth="1" />
                  <text x="395" y="215" fill="#cbd5e1" fontSize="10" textAnchor="middle" transform="rotate(90 395 215)">
                    H = {audit.sashHeightMm} mm
                  </text>
                </svg>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300">
                <span className="font-bold text-slate-800 dark:text-slate-200 block mb-1">
                  Principe Mécanique du Calage d Équerrage NF DTU 39 Section 6.5 :
                </span>
                La cale d assise inférieure transmet le poids mort du vitrage au pivot bas, tandis que la cale d équerrage supérieure bloque l affaissement de l angle opposé. La diagonale ainsi formée met le vitrage en compression pure, empêchant la déformation en parallélogramme du châssis.
              </div>
            </div>
          )}

          {/* TAB 4: NOMENCLATURE & PDF */}
          {activeTab === 'bom_dtu' && (
            <div className="space-y-5">
              {/* Hardware & Setting Blocks Bill of Materials */}
              <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                <div className="bg-slate-100 dark:bg-slate-800/80 px-4 py-2.5 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Bordereau Quincaillerie & Cales d Équerrage DTU 39
                  </span>
                  <span className="text-[11px] text-slate-500">Prêt pour atelier</span>
                </div>
                <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                  <div className="p-3 flex justify-between items-center bg-white dark:bg-slate-900">
                    <div>
                      <span className="font-bold block text-slate-800 dark:text-slate-200">
                        {audit.selectedHinge.labelFr}
                      </span>
                      <span className="text-[11px] text-slate-500">
                        {audit.selectedHinge.description}
                      </span>
                    </div>
                    <span className="font-bold text-blue-600 dark:text-blue-400">1 kit complet</span>
                  </div>

                  <div className="p-3 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
                    <div>
                      <span className="font-bold block text-slate-800 dark:text-slate-200">
                        Cales d Assise et d Équerrage EPDM (Dureté 80 Shore A)
                      </span>
                      <span className="text-[11px] text-slate-500">
                        Épaisseur 4 à 6 mm selon jeu de feuillure, largeur égale au vitrage + 2 mm
                      </span>
                    </div>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">
                      {audit.billOfMaterials.settingBlocksCount} cales
                    </span>
                  </div>

                  <div className="p-3 flex justify-between items-center bg-white dark:bg-slate-900">
                    <div>
                      <span className="font-bold block text-slate-800 dark:text-slate-200">
                        Outillage de Réglage Tridimensionnel
                      </span>
                      <span className="text-[11px] text-slate-500">
                        {audit.billOfMaterials.recommendedAdjustmentKey}
                      </span>
                    </div>
                    <span className="font-bold text-slate-600 dark:text-slate-300">1 lot</span>
                  </div>

                  <div className="p-3 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
                    <div>
                      <span className="font-bold block text-slate-800 dark:text-slate-200">
                        Gamme de Maintenance Périodique
                      </span>
                      <span className="text-[11px] text-slate-500">
                        {audit.billOfMaterials.maintenanceScheduleFr}
                      </span>
                    </div>
                    <span className="font-bold text-slate-600 dark:text-slate-300">Annuel</span>
                  </div>
                </div>
              </div>

              {/* PDF Export Card */}
              <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-800/60 dark:to-blue-950/30 rounded-xl border border-blue-200 dark:border-blue-800/50 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <h4 className="text-sm font-bold text-blue-900 dark:text-blue-200">
                    Attestation Technique de Charge & Équerrage A4
                  </h4>
                  <p className="text-xs text-blue-700 dark:text-blue-300/80 mt-0.5">
                    Génère le procès-verbal certifié conforme NF EN 13126-8 et NF DTU 39 avec code QR sécurisé.
                  </p>
                </div>
                <button
                  onClick={handleExportPdf}
                  disabled={isGeneratingPdf}
                  className="w-full sm:w-auto px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2 min-h-[44px] shrink-0 disabled:opacity-60"
                >
                  <FileCheck className="w-4 h-4" />
                  {isGeneratingPdf ? 'Génération du PDF...' : 'Télécharger Attestation PDF'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
