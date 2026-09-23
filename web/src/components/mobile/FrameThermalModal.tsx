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
  Thermometer,
} from 'lucide-react';
import { playTactileClick, playSwitchSound, playSlideTick } from '../../utils/audioFeedback';
import {
  calculateFrameThermalAudit,
  FRAME_SYSTEM_SPECS,
  SPACER_BAR_SPECS,
  GLAZING_THERMAL_CATALOG,
  type FrameProfileSystemType,
  type SpacerBarType,
} from '../../utils/frameThermalTransmittanceManager';
import { generateFrameThermalNoticePdf } from '../../utils/pdfGenerator';

interface FrameThermalModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialWidth?: number;
  initialHeight?: number;
  projectReference?: string;
  wilayaName?: string;
  clientName?: string;
}

export const FrameThermalModal: React.FC<FrameThermalModalProps> = ({
  isOpen,
  onClose,
  initialWidth = 1200,
  initialHeight = 1400,
  projectReference = 'Audit Thermique Uf & Isothermes',
  wilayaName = '16 - Alger',
  clientName = 'Client Particulier',
}) => {
  const [activeTab, setActiveTab] = useState<'config' | 'thermal_dtu' | 'cad_view' | 'bom_dtu'>('config');

  // Input states
  const [windowWidthMm, setWindowWidthMm] = useState<number>(initialWidth);
  const [windowHeightMm, setWindowHeightMm] = useState<number>(initialHeight);
  const [frameProfile, setFrameProfile] = useState<FrameProfileSystemType>('alu_rpt_high_perf_24mm');
  const [spacerType, setSpacerType] = useState<SpacerBarType>('warm_edge_composite');
  const [glazingKey, setGlazingKey] = useState<string>('double_4_16_4_low_e_argon');
  const [intermediateProfileCount, setIntermediateProfileCount] = useState<number>(0);
  const [outdoorDesignTempC, setOutdoorDesignTempC] = useState<number>(0);
  const [indoorRelativeHumidityPercent, setIndoorRelativeHumidityPercent] = useState<number>(50);

  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  // Audit computation
  const audit = useMemo(() => {
    return calculateFrameThermalAudit({
      windowWidthMm,
      windowHeightMm,
      frameProfile,
      spacerType,
      glazingKey,
      intermediateProfileCount,
      outdoorDesignTempC,
      indoorDesignTempC: 20,
      indoorRelativeHumidityPercent,
      wilayaName,
      clientName,
      projectReference,
    });
  }, [
    windowWidthMm,
    windowHeightMm,
    frameProfile,
    spacerType,
    glazingKey,
    intermediateProfileCount,
    outdoorDesignTempC,
    indoorRelativeHumidityPercent,
    wilayaName,
    clientName,
    projectReference,
  ]);

  if (!isOpen) return null;

  const handleExportPdf = async () => {
    try {
      setIsGeneratingPdf(true);
      playTactileClick();
      const docId = `THU-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
      await generateFrameThermalNoticePdf({
        documentId: docId,
        projectRef: projectReference,
        clientName,
        wilaya: wilayaName,
        auditInput: {
          windowWidthMm,
          windowHeightMm,
          frameProfile,
          spacerType,
          glazingKey,
          intermediateProfileCount,
          outdoorDesignTempC,
          indoorDesignTempC: 20,
          indoorRelativeHumidityPercent,
          wilayaName,
          clientName,
          projectReference,
        },
        auditResult: audit,
      });
    } catch (err) {
      console.error('Erreur génération attestation thermique:', err);
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
            <div className="p-2.5 rounded-xl bg-orange-600/10 text-orange-600 dark:text-orange-400">
              <Thermometer className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                Transmittance Uf, Rupture Thermique & Pont Linéique Ψg
                <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-orange-100 dark:bg-orange-900/40 text-orange-800 dark:text-orange-300">
                  ISO 10077-2
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Calcul des coefficients thermiques Uf, Uw, isothermes de contact et risque de condensation DTR C3-2
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
                ? 'bg-white dark:bg-slate-900 text-orange-600 dark:text-orange-400 border-t-2 border-orange-500 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Sliders className="w-4 h-4" />
            Profil & Intercalaire
          </button>

          <button
            onClick={() => {
              playSwitchSound();
              setActiveTab('thermal_dtu');
            }}
            className={`flex items-center gap-2 px-3.5 py-2.5 text-xs font-semibold rounded-t-lg transition min-h-[44px] whitespace-nowrap ${
              activeTab === 'thermal_dtu'
                ? 'bg-white dark:bg-slate-900 text-orange-600 dark:text-orange-400 border-t-2 border-orange-500 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Activity className="w-4 h-4" />
            Thermique & Isothermes
          </button>

          <button
            onClick={() => {
              playSwitchSound();
              setActiveTab('cad_view');
            }}
            className={`flex items-center gap-2 px-3.5 py-2.5 text-xs font-semibold rounded-t-lg transition min-h-[44px] whitespace-nowrap ${
              activeTab === 'cad_view'
                ? 'bg-white dark:bg-slate-900 text-orange-600 dark:text-orange-400 border-t-2 border-orange-500 shadow-sm'
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
                ? 'bg-white dark:bg-slate-900 text-orange-600 dark:text-orange-400 border-t-2 border-orange-500 shadow-sm'
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
              {/* Presets */}
              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-800">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-2">
                  Préréglages d Isolation Thermique :
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    onClick={() => {
                      playTactileClick();
                      setFrameProfile('alu_cold_no_rpt');
                      setSpacerType('aluminum_standard');
                      setGlazingKey('double_4_16_4_air');
                    }}
                    className="p-2 text-left bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg hover:border-orange-500 transition min-h-[44px]"
                  >
                    <span className="text-xs font-bold block text-slate-800 dark:text-slate-200">Alu Froid Sans RPT</span>
                    <span className="text-[10px] text-rose-500">Uf = 6.2 • Pont thermique</span>
                  </button>
                  <button
                    onClick={() => {
                      playTactileClick();
                      setFrameProfile('alu_rpt_standard_14mm');
                      setSpacerType('aluminum_standard');
                      setGlazingKey('double_4_16_4_air');
                    }}
                    className="p-2 text-left bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg hover:border-orange-500 transition min-h-[44px]"
                  >
                    <span className="text-xs font-bold block text-slate-800 dark:text-slate-200">RPT Standard 14 mm</span>
                    <span className="text-[10px] text-slate-500">Uf = 2.7 • Double 4/16/4</span>
                  </button>
                  <button
                    onClick={() => {
                      playTactileClick();
                      setFrameProfile('alu_rpt_high_perf_24mm');
                      setSpacerType('warm_edge_composite');
                      setGlazingKey('double_4_16_4_low_e_argon');
                    }}
                    className="p-2 text-left bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg hover:border-orange-500 transition min-h-[44px]"
                  >
                    <span className="text-xs font-bold block text-slate-800 dark:text-slate-200">Haute Performance 24 mm</span>
                    <span className="text-[10px] text-emerald-500">Uf = 2.1 • Warm-Edge + ITR</span>
                  </button>
                  <button
                    onClick={() => {
                      playTactileClick();
                      setFrameProfile('alu_rpt_passive_34mm_foam');
                      setSpacerType('warm_edge_foam_structural');
                      setGlazingKey('triple_4_12_4_12_4_argon');
                    }}
                    className="p-2 text-left bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg hover:border-orange-500 transition min-h-[44px]"
                  >
                    <span className="text-xs font-bold block text-slate-800 dark:text-slate-200">Passif 34 mm Mousses</span>
                    <span className="text-[10px] text-indigo-500">Uf = 1.35 • Triple vitrage</span>
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
                  <span className="text-[11px] text-slate-500 mt-1 block">
                    Largeur : {windowWidthMm} mm • Surface baie : {audit.windowTotalAreaM2} m²
                  </span>
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
                  <span className="text-[11px] text-slate-500 mt-1 block">
                    Hauteur : {windowHeightMm} mm • Part opaque cadre : {audit.frameAreaFractionPercent}%
                  </span>
                </div>
              </div>

              {/* Profile System Selection */}
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Système de Profilé & Rupture Thermique (Uf ISO 10077-2)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {Object.entries(FRAME_SYSTEM_SPECS).map(([key, spec]) => (
                    <button
                      key={key}
                      onClick={() => {
                        playTactileClick();
                        setFrameProfile(key as FrameProfileSystemType);
                      }}
                      className={`p-3 text-left rounded-xl border transition min-h-[44px] flex flex-col justify-between ${
                        frameProfile === key
                          ? 'border-orange-500 bg-orange-50/60 dark:bg-orange-900/20 ring-1 ring-orange-500'
                          : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                          {spec.labelFr}
                        </span>
                        <span className="text-xs px-2 py-0.5 rounded font-bold bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                          Uf = {spec.ufValueWPerM2K}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                        {spec.description}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Spacer Bar Selection */}
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Type d Intercalaire de Vitrage (Pont Linéique Ψg)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {Object.entries(SPACER_BAR_SPECS).map(([key, spec]) => (
                    <button
                      key={key}
                      onClick={() => {
                        playTactileClick();
                        setSpacerType(key as SpacerBarType);
                      }}
                      className={`p-3 text-left rounded-xl border transition min-h-[44px] flex flex-col justify-between ${
                        spacerType === key
                          ? 'border-orange-500 bg-orange-50/60 dark:bg-orange-900/20 ring-1 ring-orange-500'
                          : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                          {spec.labelFr}
                        </span>
                        <span className="text-xs px-2 py-0.5 rounded font-bold bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                          Ψg = {spec.psiValueWPerMK} W/m.K
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                        {spec.materialDescriptionFr}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Glazing Selection */}
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Type de Vitrage Remplissage (Ug EN 673)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {Object.entries(GLAZING_THERMAL_CATALOG).map(([key, spec]) => (
                    <button
                      key={key}
                      onClick={() => {
                        playTactileClick();
                        setGlazingKey(key);
                      }}
                      className={`p-3 text-left rounded-xl border transition min-h-[44px] flex flex-col justify-between ${
                        glazingKey === key
                          ? 'border-orange-500 bg-orange-50/60 dark:bg-orange-900/20 ring-1 ring-orange-500'
                          : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                          {spec.labelFr}
                        </span>
                        <span className="text-xs px-2 py-0.5 rounded font-bold bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                          Ug = {spec.ugValueWPerM2K}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                        {spec.description}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Environmental & Climatology Conditions */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Température Extérieure d Hiver (°C)
                  </label>
                  <input
                    type="number"
                    value={outdoorDesignTempC}
                    onChange={(e) => {
                      playSlideTick();
                      setOutdoorDesignTempC(Number(e.target.value));
                    }}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-sm font-semibold min-h-[44px]"
                  />
                  <span className="text-[10px] text-slate-500 mt-1 block">
                    Base de calcul DTR : {outdoorDesignTempC}°C
                  </span>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Humidité Relative Intérieure (%)
                  </label>
                  <input
                    type="number"
                    min={20}
                    max={90}
                    value={indoorRelativeHumidityPercent}
                    onChange={(e) => {
                      playSlideTick();
                      setIndoorRelativeHumidityPercent(Number(e.target.value));
                    }}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-sm font-semibold min-h-[44px]"
                  />
                  <span className="text-[10px] text-slate-500 mt-1 block">
                    Point de rosée calculé : {audit.dewPointTempC}°C
                  </span>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Meneaux ou Traverses Intermédiaires
                  </label>
                  <select
                    value={intermediateProfileCount}
                    onChange={(e) => {
                      playTactileClick();
                      setIntermediateProfileCount(Number(e.target.value));
                    }}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-sm font-semibold min-h-[44px]"
                  >
                    <option value={0}>0 profil intermédiaire (châssis simple)</option>
                    <option value={1}>1 meneau ou traverse (+ pont thermique)</option>
                    <option value={2}>2 profilés intermédiaires (grille 2x2)</option>
                  </select>
                  <span className="text-[10px] text-slate-500 mt-1 block">
                    Périmètre intercalaire : {audit.glassEdgePerimeterM} m
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: THERMIQUE & ISOTHERMES */}
          {activeTab === 'thermal_dtu' && (
            <div className="space-y-5">
              {/* Summary Status Banner */}
              <div
                className={`p-4 rounded-xl border ${
                  audit.thermalAuditStatus === 'optimal'
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800'
                    : audit.thermalAuditStatus === 'acceptable'
                    ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800'
                    : 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  {audit.thermalAuditStatus === 'optimal' ? (
                    <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  ) : (
                    <AlertTriangle className="w-6 h-6 text-amber-600 dark:text-amber-400 shrink-0" />
                  )}
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      Transmittance Globale Uw = {audit.uwOverallWindowTransmittanceWPerM2K} W/m²K
                      <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-white/80 dark:bg-slate-800 text-slate-800 dark:text-white border border-slate-300 dark:border-slate-600">
                        Classe {audit.energyClassBadge}
                      </span>
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                      Réglementation {audit.dtrZoneName} : Seuil maxi Uw = {audit.dtrZoneTargetUwWPerM2K} W/m²K • {audit.isDtrCompliant ? 'Conforme aux exigences DTR C3-2' : 'Dépassement du seuil de déperdition'}
                    </p>
                  </div>
                </div>
              </div>

              {/* 4 Cards Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
                  <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block">
                    Cadre Opaque Uf
                  </span>
                  <span className="text-lg font-extrabold text-orange-600 dark:text-orange-400 block mt-1">
                    {audit.ufValueWPerM2K} W/m²K
                  </span>
                  <span className="text-[10px] text-slate-500 block mt-0.5">
                    Surface : {audit.frameOpaqueAreaM2} m² ({audit.frameAreaFractionPercent}%)
                  </span>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
                  <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block">
                    Vitrage de Vision Ug
                  </span>
                  <span className="text-lg font-extrabold text-blue-600 dark:text-blue-400 block mt-1">
                    {audit.ugValueWPerM2K} W/m²K
                  </span>
                  <span className="text-[10px] text-slate-500 block mt-0.5">
                    Surface : {audit.glassVisionAreaM2} m² • G = {audit.selectedGlazing.solarHeatGainG}
                  </span>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
                  <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block">
                    Pont Linéique Ψg
                  </span>
                  <span className="text-lg font-extrabold text-indigo-600 dark:text-indigo-400 block mt-1">
                    {audit.psiValueWPerMK} W/m.K
                  </span>
                  <span className="text-[10px] text-slate-500 block mt-0.5">
                    Périmètre bord : {audit.glassEdgePerimeterM} ml
                  </span>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
                  <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block">
                    T° Surface Cadre / Rosée
                  </span>
                  <span
                    className={`text-lg font-extrabold block mt-1 ${
                      !audit.isCondensationLikelyOnFrame ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                    }`}
                  >
                    {audit.indoorSurfaceTempFrameC}°C
                  </span>
                  <span className="text-[10px] text-slate-500 block mt-0.5">
                    Point rosée : {audit.dewPointTempC}°C • f_Rsi = {audit.condensationRiskIndexFrsi}
                  </span>
                </div>
              </div>

              {/* Heat Loss Distribution Bar */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3">
                <div className="flex justify-between items-center text-xs font-bold text-slate-800 dark:text-slate-200">
                  <span>Répartition des Pertes Thermiques de la Baie :</span>
                  <span>Flux Total = {audit.heatLossRateWPerK} W/K</span>
                </div>

                <div className="w-full h-4 rounded-full overflow-hidden flex shadow-inner">
                  <div
                    style={{ width: `${audit.heatLossBreakdownPercent.glassLossPercent}%` }}
                    className="bg-blue-500 h-full flex items-center justify-center text-[9px] font-bold text-white"
                    title={`Pertes Vitrage : ${audit.heatLossBreakdownPercent.glassLossPercent}%`}
                  >
                    {audit.heatLossBreakdownPercent.glassLossPercent}%
                  </div>
                  <div
                    style={{ width: `${audit.heatLossBreakdownPercent.frameLossPercent}%` }}
                    className="bg-orange-500 h-full flex items-center justify-center text-[9px] font-bold text-white"
                    title={`Pertes Cadre : ${audit.heatLossBreakdownPercent.frameLossPercent}%`}
                  >
                    {audit.heatLossBreakdownPercent.frameLossPercent}%
                  </div>
                  <div
                    style={{ width: `${audit.heatLossBreakdownPercent.spacerLossPercent}%` }}
                    className="bg-indigo-500 h-full flex items-center justify-center text-[9px] font-bold text-white"
                    title={`Pertes Intercalaire : ${audit.heatLossBreakdownPercent.spacerLossPercent}%`}
                  >
                    {audit.heatLossBreakdownPercent.spacerLossPercent}%
                  </div>
                </div>

                <div className="flex flex-wrap gap-4 text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-blue-500"></span>
                    <span className="text-slate-600 dark:text-slate-300">
                      Vitrage de Vision : {audit.heatLossBreakdownPercent.glassLossPercent}%
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-orange-500"></span>
                    <span className="text-slate-600 dark:text-slate-300">
                      Cadre Opaque : {audit.heatLossBreakdownPercent.frameLossPercent}%
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-indigo-500"></span>
                    <span className="text-slate-600 dark:text-slate-300">
                      Intercalaire Vitrage : {audit.heatLossBreakdownPercent.spacerLossPercent}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Warnings and Recommendations */}
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
                  Schéma de Coupe Thermique : Gradient d Isothermes & Rupture Polyamide
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded bg-orange-100 dark:bg-orange-900/40 text-orange-800 dark:text-orange-300 font-semibold">
                  Norme ISO 10077-2
                </span>
              </div>

              <div className="relative w-full h-[380px] bg-slate-900 rounded-xl border border-slate-700 p-4 flex items-center justify-center overflow-hidden">
                <svg
                  viewBox="0 0 520 420"
                  className="w-full h-full max-h-[360px]"
                  style={{ filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.5))' }}
                >
                  <defs>
                    <linearGradient id="thermalRamp" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.8" />
                      <stop offset="35%" stopColor="#0284c7" stopOpacity="0.9" />
                      <stop offset="50%" stopColor="#475569" stopOpacity="0.95" />
                      <stop offset="65%" stopColor="#f97316" stopOpacity="0.9" />
                      <stop offset="100%" stopColor="#ef4444" stopOpacity="0.8" />
                    </linearGradient>
                    <pattern id="gridCad" width="20" height="20" patternUnits="userSpaceOnUse">
                      <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" />
                    </pattern>
                  </defs>

                  <rect x="0" y="0" width="520" height="420" fill="url(#gridCad)" />

                  {/* Left Exterior Environment Banner */}
                  <rect x="20" y="30" width="80" height="360" rx="6" fill="rgba(56, 189, 248, 0.08)" stroke="#38bdf8" strokeWidth="1" strokeDasharray="3 2" />
                  <text x="60" y="60" fill="#38bdf8" fontSize="11" fontWeight="bold" textAnchor="middle">
                    EXTÉRIEUR
                  </text>
                  <text x="60" y="80" fill="#bae6fd" fontSize="12" fontWeight="extrabold" textAnchor="middle">
                    {outdoorDesignTempC}°C
                  </text>
                  <text x="60" y="100" fill="#7dd3fc" fontSize="9" textAnchor="middle">
                    Froid & Pluie
                  </text>

                  {/* Right Interior Environment Banner */}
                  <rect x="420" y="30" width="80" height="360" rx="6" fill="rgba(239, 68, 68, 0.08)" stroke="#ef4444" strokeWidth="1" strokeDasharray="3 2" />
                  <text x="460" y="60" fill="#ef4444" fontSize="11" fontWeight="bold" textAnchor="middle">
                    INTÉRIEUR
                  </text>
                  <text x="460" y="80" fill="#fca5a5" fontSize="12" fontWeight="extrabold" textAnchor="middle">
                    20°C
                  </text>
                  <text x="460" y="100" fill="#f87171" fontSize="9" textAnchor="middle">
                    HR = {indoorRelativeHumidityPercent}%
                  </text>

                  {/* Central Aluminum Frame Cross-Section */}
                  {/* Outer Aluminium Half-shell (Cold Side) */}
                  <rect x="130" y="80" width="75" height="240" rx="3" fill="#1e293b" stroke="#38bdf8" strokeWidth="2" />
                  <text x="167" y="110" fill="#93c5fd" fontSize="9" fontWeight="bold" textAnchor="middle">
                    Coque Ext. Alu
                  </text>
                  <text x="167" y="130" fill="#38bdf8" fontSize="11" fontWeight="extrabold" textAnchor="middle">
                    ~{(outdoorDesignTempC + 1.8).toFixed(1)}°C
                  </text>

                  {/* Polyamide Thermal Break Bars (PA66 GF25) */}
                  {audit.selectedFrame.polyamideStripWidthMm > 0 ? (
                    <>
                      {/* Top Bar */}
                      <rect x="205" y="105" width="45" height="16" rx="2" fill="#0f172a" stroke="#f59e0b" strokeWidth="1.5" />
                      {/* Bottom Bar */}
                      <rect x="205" y="275" width="45" height="16" rx="2" fill="#0f172a" stroke="#f59e0b" strokeWidth="1.5" />
                      <line x1="205" y1="113" x2="250" y2="113" stroke="#f59e0b" strokeWidth="1" strokeDasharray="2 2" />
                      <line x1="205" y1="283" x2="250" y2="283" stroke="#f59e0b" strokeWidth="1" strokeDasharray="2 2" />

                      <text x="227" y="200" fill="#fbbf24" fontSize="9" fontWeight="bold" textAnchor="middle">
                        Barrettes RPT
                      </text>
                      <text x="227" y="218" fill="#fde68a" fontSize="10" fontWeight="bold" textAnchor="middle">
                        {audit.selectedFrame.polyamideStripWidthMm} mm
                      </text>
                      <text x="227" y="235" fill="#f59e0b" fontSize="8" textAnchor="middle">
                        PA66 GF25
                      </text>
                    </>
                  ) : (
                    <>
                      {/* Continuous solid aluminum bridge without RPT */}
                      <rect x="205" y="100" width="45" height="195" fill="#ef4444" stroke="#b91c1c" strokeWidth="2" strokeDasharray="4 2" />
                      <text x="227" y="195" fill="#fee2e2" fontSize="9" fontWeight="bold" textAnchor="middle">
                        Pont Thermique
                      </text>
                      <text x="227" y="212" fill="#ffffff" fontSize="10" fontWeight="bold" textAnchor="middle">
                        CONTINU SANS RPT
                      </text>
                    </>
                  )}

                  {/* Inner Aluminium Half-shell (Warm Side) */}
                  <rect x="250" y="80" width="85" height="240" rx="3" fill="#1e293b" stroke="#f97316" strokeWidth="2" />
                  <text x="292" y="110" fill="#fed7aa" fontSize="9" fontWeight="bold" textAnchor="middle">
                    Coque Int. Alu
                  </text>
                  <text x="292" y="130" fill="#fb923c" fontSize="11" fontWeight="extrabold" textAnchor="middle">
                    {audit.indoorSurfaceTempFrameC}°C
                  </text>

                  {/* Glazing Unit Mounted in Sash Rebate (Top part) */}
                  <rect x="235" y="40" width="130" height="40" fill="rgba(56, 189, 248, 0.15)" stroke="#0284c7" strokeWidth="1.5" />
                  <text x="300" y="62" fill="#bae6fd" fontSize="9" fontWeight="bold" textAnchor="middle">
                    Double Vitrage ({audit.selectedGlazing.ugValueWPerM2K} W/m²K)
                  </text>

                  {/* Spacer Bar Position */}
                  <rect x="270" y="70" width="18" height="10" rx="1" fill="#6366f1" stroke="#ffffff" strokeWidth="1" />
                  <text x="279" y="92" fill="#c7d2fe" fontSize="8" textAnchor="middle">
                    Ψg = {audit.selectedSpacer.psiValueWPerMK}
                  </text>

                  {/* Dew Point Line & Surface Warning */}
                  <line x1="120" y1="355" x2="380" y2="355" stroke="#ef4444" strokeWidth="1.5" strokeDasharray="4 2" />
                  <text x="250" y="370" fill="#fca5a5" fontSize="9" textAnchor="middle">
                    Ligne Seuil Point de Rosée : {audit.dewPointTempC}°C
                  </text>

                  {/* Isothermal Heat Flux Arrows (Left to right) */}
                  <line x1="390" y1="200" x2="340" y2="200" stroke="#f97316" strokeWidth="2.5" />
                  <polygon points="340,195 330,200 340,205" fill="#f97316" />
                  <text x="375" y="190" fill="#fed7aa" fontSize="8" fontWeight="bold">
                    Flux Chaud
                  </text>

                  <line x1="125" y1="200" x2="95" y2="200" stroke="#38bdf8" strokeWidth="2.5" />
                  <polygon points="95,195 85,200 95,205" fill="#38bdf8" />
                  <text x="100" y="190" fill="#7dd3fc" fontSize="8" fontWeight="bold">
                    Déperdition
                  </text>
                </svg>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300">
                <span className="font-bold text-slate-800 dark:text-slate-200 block mb-1">
                  Principe de la Rupture de Pont Thermique (NF EN 14024 & ISO 10077-2) :
                </span>
                La barrette en polyamide PA66 renforcée à 25% de fibres de verre possède une conductivité thermique de 0.30 W/m.K, plus de 500 fois inférieure à celle de l aluminium brut (160 W/m.K). Elle interrompt la conduction calorifique, élevant la face interne au-dessus du point de rosée ({audit.dewPointTempC}°C) pour empêcher la formation de condensation.
              </div>
            </div>
          )}

          {/* TAB 4: NOMENCLATURE & PDF */}
          {activeTab === 'bom_dtu' && (
            <div className="space-y-5">
              {/* Thermal Balance Summary */}
              <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                <div className="bg-slate-100 dark:bg-slate-800/80 px-4 py-2.5 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Bilan des Déperditions & Composants Thermiques
                  </span>
                  <span className="text-[11px] text-slate-500">ISO 10077-1</span>
                </div>
                <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                  <div className="p-3 flex justify-between items-center bg-white dark:bg-slate-900">
                    <div>
                      <span className="font-bold block text-slate-800 dark:text-slate-200">
                        {audit.selectedFrame.labelFr}
                      </span>
                      <span className="text-[11px] text-slate-500">
                        Uf = {audit.ufValueWPerM2K} W/m²K • {audit.frameOpaqueAreaM2} m² ({audit.frameAreaFractionPercent}%)
                      </span>
                    </div>
                    <span className="font-bold text-orange-600 dark:text-orange-400">
                      {(audit.frameOpaqueAreaM2 * audit.ufValueWPerM2K).toFixed(1)} W/K
                    </span>
                  </div>

                  <div className="p-3 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
                    <div>
                      <span className="font-bold block text-slate-800 dark:text-slate-200">
                        {audit.selectedGlazing.labelFr}
                      </span>
                      <span className="text-[11px] text-slate-500">
                        Ug = {audit.ugValueWPerM2K} W/m²K • {audit.glassVisionAreaM2} m²
                      </span>
                    </div>
                    <span className="font-bold text-blue-600 dark:text-blue-400">
                      {(audit.glassVisionAreaM2 * audit.ugValueWPerM2K).toFixed(1)} W/K
                    </span>
                  </div>

                  <div className="p-3 flex justify-between items-center bg-white dark:bg-slate-900">
                    <div>
                      <span className="font-bold block text-slate-800 dark:text-slate-200">
                        {audit.selectedSpacer.labelFr}
                      </span>
                      <span className="text-[11px] text-slate-500">
                        Ψg = {audit.psiValueWPerMK} W/m.K • Périmètre {audit.glassEdgePerimeterM} ml
                      </span>
                    </div>
                    <span className="font-bold text-indigo-600 dark:text-indigo-400">
                      {(audit.glassEdgePerimeterM * audit.psiValueWPerMK).toFixed(1)} W/K
                    </span>
                  </div>

                  <div className="p-3 flex justify-between items-center bg-orange-50/60 dark:bg-orange-950/30">
                    <div>
                      <span className="font-bold block text-slate-900 dark:text-white">
                        Performance Globale de la Baie (Uw)
                      </span>
                      <span className="text-[11px] text-slate-600 dark:text-slate-300">
                        Flux total : {audit.heatLossRateWPerK} W/K • Classe {audit.energyClassBadge}
                      </span>
                    </div>
                    <span className="text-sm font-extrabold text-orange-600 dark:text-orange-400">
                      Uw = {audit.uwOverallWindowTransmittanceWPerM2K} W/m²K
                    </span>
                  </div>
                </div>
              </div>

              {/* PDF Export Card */}
              <div className="p-4 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-slate-800/60 dark:to-orange-950/30 rounded-xl border border-orange-200 dark:border-orange-800/50 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <h4 className="text-sm font-bold text-orange-900 dark:text-orange-200">
                    Attestation Thermique Officielle A4 DTR C3-2
                  </h4>
                  <p className="text-xs text-orange-700 dark:text-orange-300/80 mt-0.5">
                    Génère le procès-verbal certifié conforme ISO 10077-1/2 et CNERIB DTR C3-2 avec code QR sécurisé.
                  </p>
                </div>
                <button
                  onClick={handleExportPdf}
                  disabled={isGeneratingPdf}
                  className="w-full sm:w-auto px-5 py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2 min-h-[44px] shrink-0 disabled:opacity-60"
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
