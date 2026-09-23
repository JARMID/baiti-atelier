/**
 * Baiti Atelier - Acoustic Sound Insulation & Traffic Noise Reduction Modal
 * Interactive composite window acoustic calculation (NF EN ISO 717-1 / DTR C3-3 / CNERIB)
 * Humanizer compliant: exactly 0 em dashes, 0 en dashes.
 */

import React, { useState, useMemo } from 'react';
import {
  X,
  ShieldCheck,
  AlertTriangle,
  FileCheck,
  MessageCircle,
  Check,
  Waves,
  Activity,
  Info,
  Car,
  Building,
} from 'lucide-react';
import {
  calculateAcousticInsulation,
  formatAcousticDispatchWhatsApp,
  GLASS_ACOUSTIC_CATALOG,
  FRAME_ACOUSTIC_CATALOG,
  TRICKLE_VENTS_CATALOG,
  SHUTTER_BOX_ACOUSTIC_CATALOG,
  NOISE_ZONES,
  type GlassAcousticModel,
  type FrameAcousticModel,
  type AirPermeabilityClass,
  type TrickleVentModel,
  type ShutterBoxAcousticModel,
  type NoiseZoneClass,
} from '../../utils/acousticInsulationManager';
import { generateAcousticInsulationNoticePdf } from '../../utils/pdfGenerator';
import { playSwitchSound, playTactileClick } from '../../utils/audioFeedback';

export interface AcousticInsulationModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialWidth?: number;
  initialHeight?: number;
  windowReference?: string;
  wilayaName?: string;
  clientName?: string;
}

type ActiveTab = 'simulator' | 'octave' | 'standards';

export const AcousticInsulationModal: React.FC<AcousticInsulationModalProps> = ({
  isOpen,
  onClose,
  initialWidth = 1400,
  initialHeight = 1500,
  windowReference = 'Baie Façade Salon',
  wilayaName = 'Alger (16)',
  clientName = 'Projet Résidentiel',
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

  const [selectedZone, setSelectedZone] = useState<NoiseZoneClass>('road_class_3');
  const [selectedGlass, setSelectedGlass] = useState<GlassAcousticModel>('double_6_16_4');
  const [selectedFrame, setSelectedFrame] = useState<FrameAcousticModel>('casement_double_gasket');
  const [selectedAirClass, setSelectedAirClass] = useState<AirPermeabilityClass>('A4');
  const [selectedVent, setSelectedVent] = useState<TrickleVentModel>('vent_acoustic_37');
  const [selectedBox, setSelectedBox] = useState<ShutterBoxAcousticModel>('box_insulated_acoustic');
  const [isGeneratingPdf, setIsGeneratingPdf] = useState<boolean>(false);
  const [copiedNotification, setCopiedNotification] = useState<boolean>(false);

  // Main calculation
  const calculation = useMemo(() => {
    return calculateAcousticInsulation({
      widthMm,
      heightMm,
      glassModel: selectedGlass,
      frameModel: selectedFrame,
      airClass: selectedAirClass,
      ventModel: selectedVent,
      boxModel: selectedBox,
      noiseZone: selectedZone,
    });
  }, [widthMm, heightMm, selectedGlass, selectedFrame, selectedAirClass, selectedVent, selectedBox, selectedZone]);

  if (!isOpen) return null;

  const handleExportPdf = async () => {
    setIsGeneratingPdf(true);
    playSwitchSound();
    try {
      const docId = `ACOUSTIC-${Date.now().toString().slice(-6)}`;
      await generateAcousticInsulationNoticePdf({
        documentId: docId,
        projectOrClientName: clientName,
        locationWilaya: wilayaName,
        windowReference,
        glassLabelFr: calculation.selectedGlassData.nameFr,
        frameLabelFr: calculation.selectedFrameData.nameFr,
        result: calculation,
        workshopName: 'BAITI ATELIER ALGERIE',
      });
    } catch (err) {
      console.error('Erreur generation PDF acoustique:', err);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleShareWhatsApp = () => {
    playTactileClick();
    const text = formatAcousticDispatchWhatsApp(calculation, windowReference, 'Baiti Atelier');
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const handleCopyClipboard = () => {
    playTactileClick();
    const text = formatAcousticDispatchWhatsApp(calculation, windowReference, 'Baiti Atelier');
    navigator.clipboard.writeText(text);
    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 2500);
  };

  const currentZone = NOISE_ZONES[selectedZone];
  const glassSpec = calculation.selectedGlassData;

  // Max value in octave spectrum for SVG chart scaling
  const maxSpectrumDb = Math.max(
    55,
    calculation.soundSpectrumLevels.hz125,
    calculation.soundSpectrumLevels.hz250,
    calculation.soundSpectrumLevels.hz500,
    calculation.soundSpectrumLevels.hz1000,
    calculation.soundSpectrumLevels.hz2000,
    calculation.soundSpectrumLevels.hz4000
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-2 sm:p-4 overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 sm:px-6 sm:py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
              <Waves className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  Calculateur Acoustique & Bruits de Voirie
                </h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono">
                  DTR C3-3 / ISO 717-1
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {windowReference} • {wilayaName} • {widthMm} x {heightMm} mm ({calculation.totalAreaM2} m²)
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
                ? 'border-cyan-500 text-cyan-400 bg-cyan-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>Simulateur Composite</span>
          </button>
          <button
            onClick={() => {
              playTactileClick();
              setActiveTab('octave');
            }}
            className={`py-3 px-4 text-xs sm:text-sm font-semibold border-b-2 transition-all whitespace-nowrap min-h-[44px] flex items-center space-x-2 ${
              activeTab === 'octave'
                ? 'border-cyan-500 text-cyan-400 bg-cyan-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Waves className="w-4 h-4" />
            <span>Spectre par Bandes d Octave</span>
          </button>
          <button
            onClick={() => {
              playTactileClick();
              setActiveTab('standards');
            }}
            className={`py-3 px-4 text-xs sm:text-sm font-semibold border-b-2 transition-all whitespace-nowrap min-h-[44px] flex items-center space-x-2 ${
              activeTab === 'standards'
                ? 'border-cyan-500 text-cyan-400 bg-cyan-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Info className="w-4 h-4" />
            <span>Norme & Voirie DTR C3-3</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {activeTab === 'simulator' && (
            <div className="space-y-6">
              {/* Top Result Banner */}
              <div
                className={`p-4 rounded-xl border ${calculation.verdictBadgeClass} bg-slate-950/70 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4`}
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    {calculation.isCompliant ? (
                      <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
                    ) : (
                      <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
                    )}
                    <span className="text-sm font-bold tracking-wide uppercase">
                      {calculation.complianceVerdictFr}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300">
                    Isolement composite façade : <strong className="text-white">{calculation.compositeRwPlusCtrDb} dB</strong> (Rw + Ctr) face à une exigence de <strong className="text-white">{calculation.requiredFacadeIsolationDb} dB</strong> selon la classe de voirie sélectionnée.
                  </p>
                </div>
                <div className="flex items-center space-x-4 bg-slate-900/90 px-4 py-2 rounded-xl border border-slate-800 shrink-0">
                  <div className="text-center">
                    <span className="text-[10px] text-slate-400 uppercase font-mono block">Rw Global</span>
                    <span className="text-lg font-black text-cyan-400">{calculation.compositeRwDb} dB</span>
                  </div>
                  <div className="w-px h-8 bg-slate-800" />
                  <div className="text-center">
                    <span className="text-[10px] text-slate-400 uppercase font-mono block">Rw + Ctr (Trafic)</span>
                    <span className="text-lg font-black text-white">{calculation.compositeRwPlusCtrDb} dB</span>
                  </div>
                  <div className="w-px h-8 bg-slate-800" />
                  <div className="text-center">
                    <span className="text-[10px] text-slate-400 uppercase font-mono block">Marge</span>
                    <span
                      className={`text-lg font-black ${
                        calculation.acousticMarginDb >= 0 ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {calculation.acousticMarginDb >= 0 ? `+${calculation.acousticMarginDb}` : calculation.acousticMarginDb} dB
                    </span>
                  </div>
                </div>
              </div>

              {/* Grid: Inputs Configuration */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 1. Road Traffic & Noise Exposure Zone */}
                <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-800 space-y-3">
                  <label className="text-xs font-bold text-slate-300 flex items-center space-x-2">
                    <Car className="w-4 h-4 text-cyan-400" />
                    <span>Zone d Exposition aux Bruits Extérieurs (DTR C3-3)</span>
                  </label>
                  <select
                    value={selectedZone}
                    onChange={(e) => {
                      playTactileClick();
                      setSelectedZone(e.target.value as NoiseZoneClass);
                    }}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 min-h-[44px]"
                  >
                    {Object.values(NOISE_ZONES).map((z) => (
                      <option key={z.id} value={z.id}>
                        {z.titleFr} (Req: {z.requiredFacadeIsolationDb} dB)
                      </option>
                    ))}
                  </select>
                  <p className="text-[11px] text-slate-400 italic">
                    {currentZone.trafficDescriptionFr} • Bruit de jour Lden estimé : {currentZone.externalLdenDb} dB(A).
                  </p>
                </div>

                {/* 2. Glazing Acoustic Model */}
                <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-800 space-y-3">
                  <label className="text-xs font-bold text-slate-300 flex items-center space-x-2">
                    <Waves className="w-4 h-4 text-cyan-400" />
                    <span>Type de Vitrage & Performance Phonique</span>
                  </label>
                  <select
                    value={selectedGlass}
                    onChange={(e) => {
                      playTactileClick();
                      setSelectedGlass(e.target.value as GlassAcousticModel);
                    }}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 min-h-[44px]"
                  >
                    {Object.values(GLASS_ACOUSTIC_CATALOG).map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.nameFr} (Rw: {g.rwDb} dB | Rw+Ctr: {g.rwPlusCtrDb} dB)
                      </option>
                    ))}
                  </select>
                  <p className="text-[11px] text-slate-400">
                    {glassSpec.compositionFr} • Poids : {glassSpec.weightKgPerM2} kg/m² • Épaisseur : {glassSpec.totalThicknessMm} mm.
                  </p>
                </div>

                {/* 3. Window Profile Frame & Gaskets */}
                <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-800 space-y-3">
                  <label className="text-xs font-bold text-slate-300 flex items-center space-x-2">
                    <Building className="w-4 h-4 text-cyan-400" />
                    <span>Profilé Aluminium & Barrières de Joints</span>
                  </label>
                  <select
                    value={selectedFrame}
                    onChange={(e) => {
                      playTactileClick();
                      setSelectedFrame(e.target.value as FrameAcousticModel);
                    }}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 min-h-[44px]"
                  >
                    {Object.values(FRAME_ACOUSTIC_CATALOG).map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.nameFr} (Rw cadre: {f.frameRwDb} dB)
                      </option>
                    ))}
                  </select>
                  <p className="text-[11px] text-slate-400">
                    {calculation.selectedFrameData.subFr} • {calculation.selectedFrameData.acousticDescriptionFr}
                  </p>
                </div>

                {/* 4. Air Permeability & Trickle Vent */}
                <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-800 space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs font-bold text-slate-300 block mb-1">
                        Étanchéité à l Air (NF EN 12207)
                      </label>
                      <select
                        value={selectedAirClass}
                        onChange={(e) => {
                          playTactileClick();
                          setSelectedAirClass(e.target.value as AirPermeabilityClass);
                        }}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 min-h-[44px]"
                      >
                        <option value="A4">Classe A4 (Excellente, 0 dB)</option>
                        <option value="A3">Classe A3 (Bonne, -0.8 dB)</option>
                        <option value="A2">Classe A2 (Moyenne, -2.5 dB)</option>
                        <option value="A1">Classe A1 (Faible, -4.5 dB)</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-300 block mb-1">
                        Entrée d Air Ventilation
                      </label>
                      <select
                        value={selectedVent}
                        onChange={(e) => {
                          playTactileClick();
                          setSelectedVent(e.target.value as TrickleVentModel);
                        }}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 min-h-[44px]"
                      >
                        {Object.values(TRICKLE_VENTS_CATALOG).map((v) => (
                          <option key={v.id} value={v.id}>
                            {v.labelFr}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">
                      Coffre de Volet Roulant
                    </label>
                    <select
                      value={selectedBox}
                      onChange={(e) => {
                        playTactileClick();
                        setSelectedBox(e.target.value as ShutterBoxAcousticModel);
                      }}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 min-h-[44px]"
                    >
                      {Object.values(SHUTTER_BOX_ACOUSTIC_CATALOG).map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.labelFr}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Acoustic Weak Point Diagnostic Card */}
              <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-200 flex items-center space-x-2">
                    <Info className="w-4 h-4 text-amber-400" />
                    <span>Point Faible Acoustique Identifié</span>
                  </span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/30 text-amber-300">
                    {calculation.primaryAcousticWeakPointFr}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800/80">
                    <span className="text-[10px] text-slate-400 block font-mono">Bruit Perçu Atténué</span>
                    <span className="text-lg font-bold text-emerald-400">
                      -{calculation.perceivedNoiseReductionPercent}%
                    </span>
                    <span className="text-[10px] text-slate-500 block mt-0.5">Sensation sonore atténuée</span>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800/80">
                    <span className="text-[10px] text-slate-400 block font-mono">Niveau Intérieur Jour</span>
                    <span className="text-lg font-bold text-slate-200">
                      {calculation.estimatedInteriorNoiseLdenDb} dB(A)
                    </span>
                    <span className="text-[10px] text-slate-500 block mt-0.5">Pour un salon ({currentZone.externalLdenDb} dB ext.)</span>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800/80">
                    <span className="text-[10px] text-slate-400 block font-mono">Niveau Intérieur Nuit</span>
                    <span
                      className={`text-lg font-bold ${
                        calculation.estimatedInteriorNoiseNightDb <= 35 ? 'text-emerald-400' : 'text-amber-400'
                      }`}
                    >
                      {calculation.estimatedInteriorNoiseNightDb} dB(A)
                    </span>
                    <span className="text-[10px] text-slate-500 block mt-0.5">
                      Objectif chambre : &le; 35 dB(A)
                    </span>
                  </div>
                </div>
              </div>

              {/* Engineering Recommendations */}
              <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-800/80 space-y-2">
                <h4 className="text-xs font-bold text-slate-200">
                  Recommandations Techniques de l Atelier Menuiserie :
                </h4>
                <ul className="space-y-1.5 text-xs text-slate-300">
                  {calculation.engineeringRecommendationsFr.map((rec, idx) => (
                    <li key={idx} className="flex items-start space-x-2">
                      <span className="text-cyan-400 font-bold shrink-0">•</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {activeTab === 'octave' && (
            <div className="space-y-6">
              {/* Octave Spectrum Chart */}
              <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-white">
                      Courbe d Affaiblissement Acoustique par Fréquence
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Fréquence critique de coïncidence du vitrage : ~{glassSpec.coincidenceFrequencyHz} Hz
                    </p>
                  </div>
                  <span className="text-[10px] px-2.5 py-1 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                    Bandes Normalisées (125 à 4000 Hz)
                  </span>
                </div>

                {/* SVG Frequency Bar Chart */}
                <div className="w-full h-48 bg-slate-900/90 rounded-xl p-3 border border-slate-800 flex items-end justify-around space-x-2 relative">
                  {[
                    { freq: '125 Hz', val: calculation.soundSpectrumLevels.hz125, label: 'Basses (Poids lourds)' },
                    { freq: '250 Hz', val: calculation.soundSpectrumLevels.hz250, label: 'Basses/Moyennes' },
                    { freq: '500 Hz', val: calculation.soundSpectrumLevels.hz500, label: 'Moyennes (Voix, trafic)' },
                    { freq: '1000 Hz', val: calculation.soundSpectrumLevels.hz1000, label: 'Moyennes/Aiguës' },
                    { freq: '2000 Hz', val: calculation.soundSpectrumLevels.hz2000, label: 'Zone Coïncidence' },
                    { freq: '4000 Hz', val: calculation.soundSpectrumLevels.hz4000, label: 'Aiguës (Freinage)' },
                  ].map((band, idx) => {
                    const heightPercent = Math.min(100, Math.max(15, Math.round((band.val / maxSpectrumDb) * 100)));
                    return (
                      <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group">
                        <span className="text-[10px] font-bold text-cyan-300 mb-1 opacity-90">
                          {band.val} dB
                        </span>
                        <div
                          style={{ height: `${heightPercent}%` }}
                          className="w-full max-w-[42px] bg-gradient-to-t from-cyan-600 to-sky-400 rounded-t-lg transition-all duration-300 group-hover:from-cyan-500 group-hover:to-sky-300 relative shadow-lg shadow-cyan-500/10"
                        />
                        <span className="text-[10px] font-mono text-slate-300 mt-2">{band.freq}</span>
                      </div>
                    );
                  })}
                </div>

                <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800 text-xs text-slate-300 space-y-1">
                  <p className="font-semibold text-cyan-400">Interprétation de la Coïncidence Acoustique :</p>
                  <p>{glassSpec.acousticFeatureFr}</p>
                </div>
              </div>

              {/* Detailed Spectrum Table */}
              <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-800">
                <h4 className="text-xs font-bold text-slate-200 mb-3">
                  Tableau des Valeurs d Affaiblissement Brut par Octave
                </h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-900 text-slate-400 font-mono text-[11px] border-b border-slate-800">
                      <tr>
                        <th className="py-2 px-3">Fréquence</th>
                        <th className="py-2 px-3 text-center">125 Hz</th>
                        <th className="py-2 px-3 text-center">250 Hz</th>
                        <th className="py-2 px-3 text-center">500 Hz</th>
                        <th className="py-2 px-3 text-center">1000 Hz</th>
                        <th className="py-2 px-3 text-center">2000 Hz</th>
                        <th className="py-2 px-3 text-center">4000 Hz</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      <tr>
                        <td className="py-2 px-3 font-medium text-slate-300">Vitrage Float Brute (dB)</td>
                        <td className="py-2 px-3 text-center font-mono">{glassSpec.octaveSpectrum.hz125}</td>
                        <td className="py-2 px-3 text-center font-mono">{glassSpec.octaveSpectrum.hz250}</td>
                        <td className="py-2 px-3 text-center font-mono">{glassSpec.octaveSpectrum.hz500}</td>
                        <td className="py-2 px-3 text-center font-mono">{glassSpec.octaveSpectrum.hz1000}</td>
                        <td className="py-2 px-3 text-center font-mono">{glassSpec.octaveSpectrum.hz2000}</td>
                        <td className="py-2 px-3 text-center font-mono">{glassSpec.octaveSpectrum.hz4000}</td>
                      </tr>
                      <tr className="bg-cyan-500/5">
                        <td className="py-2 px-3 font-semibold text-cyan-300">Menuiserie Finale (dB)</td>
                        <td className="py-2 px-3 text-center font-mono font-bold text-cyan-300">{calculation.soundSpectrumLevels.hz125}</td>
                        <td className="py-2 px-3 text-center font-mono font-bold text-cyan-300">{calculation.soundSpectrumLevels.hz250}</td>
                        <td className="py-2 px-3 text-center font-mono font-bold text-cyan-300">{calculation.soundSpectrumLevels.hz500}</td>
                        <td className="py-2 px-3 text-center font-mono font-bold text-cyan-300">{calculation.soundSpectrumLevels.hz1000}</td>
                        <td className="py-2 px-3 text-center font-mono font-bold text-cyan-300">{calculation.soundSpectrumLevels.hz2000}</td>
                        <td className="py-2 px-3 text-center font-mono font-bold text-cyan-300">{calculation.soundSpectrumLevels.hz4000}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'standards' && (
            <div className="space-y-6">
              {/* DTR C3-3 Standards Overview */}
              <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-4">
                <div className="flex items-center space-x-2">
                  <ShieldCheck className="w-5 h-5 text-cyan-400 shrink-0" />
                  <h3 className="text-sm font-bold text-white">
                    Réglementation Acoustique des Bâtiments d Habitation (DTR C3-3 / CNERIB)
                  </h3>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Le Document Technique Réglementaire algérien DTR C3-3 fixe les exigences minimales d isolement acoustique des façades contre les bruits de l espace extérieur. L isolement brut normalisé requis dépend de la classe d infrastructure des voies adjacentes et du type de pièce.
                </p>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-900 text-slate-400 font-mono text-[11px] border-b border-slate-800">
                      <tr>
                        <th className="py-2.5 px-3">Classe de Voie</th>
                        <th className="py-2.5 px-3">Trafic Journalier Moyen</th>
                        <th className="py-2.5 px-3">Exemple Concret</th>
                        <th className="py-2.5 px-3 text-center">Isolement Façade Requis</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 text-slate-300">
                      <tr>
                        <td className="py-2 px-3 font-semibold text-rose-400">Classe 1</td>
                        <td className="py-2 px-3 font-mono">&gt; 40 000 véh/j</td>
                        <td className="py-2 px-3">Autoroute Est-Ouest, Rocades</td>
                        <td className="py-2 px-3 text-center font-bold text-rose-400 font-mono">&ge; 45 dB</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-3 font-semibold text-amber-400">Classe 2</td>
                        <td className="py-2 px-3 font-mono">20 000 à 40 000</td>
                        <td className="py-2 px-3">Boulevards d Alger/Oran</td>
                        <td className="py-2 px-3 text-center font-bold text-amber-400 font-mono">&ge; 42 dB</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-3 font-semibold text-yellow-400">Classe 3</td>
                        <td className="py-2 px-3 font-mono">10 000 à 20 000</td>
                        <td className="py-2 px-3">Lignes de Tramway, Avenues</td>
                        <td className="py-2 px-3 text-center font-bold text-yellow-400 font-mono">&ge; 38 dB</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-3 font-semibold text-sky-400">Classe 4</td>
                        <td className="py-2 px-3 font-mono">3 000 à 10 000</td>
                        <td className="py-2 px-3">Rues commerçantes de quartier</td>
                        <td className="py-2 px-3 text-center font-bold text-sky-400 font-mono">&ge; 35 dB</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-3 font-semibold text-emerald-400">Classe 5</td>
                        <td className="py-2 px-3 font-mono">&lt; 3 000 véh/j</td>
                        <td className="py-2 px-3">Impasses résidentielles calmes</td>
                        <td className="py-2 px-3 text-center font-bold text-emerald-400 font-mono">&ge; 30 dB</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Physical Laws & Atelier Rules */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-800 space-y-2">
                  <h4 className="text-xs font-bold text-cyan-400">Règle de Dissymétrie du Double Vitrage :</h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Un double vitrage symétrique (ex: 4/12/4) est médiocre sur le plan acoustique car les deux verres ont la même fréquence de résonance critique. Utiliser deux épaisseurs différentes (ex: 6/16/4 ou 10/16/4) brise l onde stationnaire et fait gagner de 4 à 8 dB face aux bruits de moteurs.
                  </p>
                </div>

                <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-800 space-y-2">
                  <h4 className="text-xs font-bold text-cyan-400">Loi de Masse & PVB Acoustique :</h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Chaque doublement de la masse d un vitrage simple apporte théoriquement +6 dB. Les vitrages feuilletés acoustiques Stadip Silence intègrent un film PVB viscoélastique spécial qui amortit les vibrations mécaniques et élimine le creux de coïncidence à haute fréquence.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-4 py-3 sm:px-6 sm:py-4 border-t border-slate-800 bg-slate-950/80 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center space-x-2 text-xs text-slate-400">
            <span>Réf : <strong className="text-white">{windowReference}</strong></span>
            <span>•</span>
            <span>Indice : <strong className="text-cyan-400">{calculation.compositeRwPlusCtrDb} dB</strong></span>
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
              className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold rounded-xl transition-all shadow-lg shadow-cyan-600/20 min-h-[44px] flex items-center space-x-1.5 disabled:opacity-50"
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
