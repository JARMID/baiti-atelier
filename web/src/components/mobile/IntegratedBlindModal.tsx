import React, { useState, useMemo } from 'react';
import {
  X,
  FileText,
  Sliders,
  Sun,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Info,
  Maximize2,
  Minimize2,
  Compass,
  Layers,
  Sparkles,
} from 'lucide-react';
import { playTactileClick, playSwitchSound } from '../../utils/audioFeedback';
import {
  type BlindType,
  type ActuationMode,
  type SlatOrientation,
  BLIND_TYPE_SPECS,
  ACTUATION_SPECS,
  computeIntegratedBlindAudit,
} from '../../utils/integratedBlindManager';
import { generateIntegratedBlindNoticePdf } from '../../utils/pdfGenerator';

interface IntegratedBlindModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialWidth?: number;
  initialHeight?: number;
  windowReference?: string;
  wilayaName?: string;
  clientName?: string;
}

export const IntegratedBlindModal: React.FC<IntegratedBlindModalProps> = ({
  isOpen,
  onClose,
  initialWidth = 1200,
  initialHeight = 1400,
  windowReference = 'Baie Salon Double Vitrage',
  wilayaName = 'Alger',
  clientName = 'Chantier Client',
}) => {
  const [activeTab, setActiveTab] = useState<'config' | 'energetics' | 'cad_section' | 'standards'>('config');

  // Interactive Inputs
  const [widthMm, setWidthMm] = useState<number>(initialWidth);
  const [heightMm, setHeightMm] = useState<number>(initialHeight);
  const [blindType, setBlindType] = useState<BlindType>('venetian_16');
  const [actuationMode, setActuationMode] = useState<ActuationMode>('magnetic_slider');
  const [orientation, setOrientation] = useState<SlatOrientation>('tilted_45');
  const [cavityWidthMm, setCavityWidthMm] = useState<number>(27);
  const [glassOuterThicknessMm, setGlassOuterThicknessMm] = useState<number>(6);
  const [glassInnerThicknessMm, setGlassInnerThicknessMm] = useState<number>(4);
  const [installationAltitudeM, setInstallationAltitudeM] = useState<number>(250);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  // Compute Audit Results
  const audit = useMemo(() => {
    return computeIntegratedBlindAudit({
      widthMm,
      heightMm,
      blindType,
      actuationMode,
      orientation,
      cavityWidthMm,
      glassOuterThicknessMm,
      glassInnerThicknessMm,
      installationAltitudeM,
      manufacturingAltitudeM: 20,
      wilayaName,
      clientName,
      windowReference,
    });
  }, [
    widthMm,
    heightMm,
    blindType,
    actuationMode,
    orientation,
    cavityWidthMm,
    glassOuterThicknessMm,
    glassInnerThicknessMm,
    installationAltitudeM,
    wilayaName,
    clientName,
    windowReference,
  ]);

  if (!isOpen) return null;

  const handleDownloadPdf = async () => {
    playTactileClick();
    setIsGeneratingPdf(true);
    try {
      const docId = `BLIND-${Date.now().toString().slice(-6)}`;
      await generateIntegratedBlindNoticePdf({
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
      <div className="bg-slate-900 border border-slate-700/80 w-full max-w-4xl max-h-[92vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-100">
        {/* HEADER */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-teal-500/15 border border-teal-500/30 flex items-center justify-center text-teal-400">
              <Sun className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white tracking-wide">
                  Store Intégré Double Vitrage
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-teal-500/10 text-teal-300 border border-teal-500/20">
                  NF EN 1279 / CSTB
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono">
                {windowReference} • Wilaya : {wilayaName} • Cavité {cavityWidthMm} mm
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={isGeneratingPdf}
              className="px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-500 active:scale-95 text-white font-semibold text-xs flex items-center gap-1.5 shadow-lg shadow-teal-900/30 transition-all cursor-pointer min-h-[44px]"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>{isGeneratingPdf ? 'Génération...' : 'Fiche PDF'}</span>
            </button>
            <button
              type="button"
              onClick={() => {
                playTactileClick();
                onClose();
              }}
              className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-400 hover:text-white flex items-center justify-center transition-all cursor-pointer min-h-[44px]"
              aria-label="Fermer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* COMPLIANCE STATUS BAR */}
        <div
          className={`px-4 py-2 border-b flex items-center justify-between text-xs font-semibold ${
            isOk
              ? 'bg-emerald-950/40 border-emerald-800/40 text-emerald-300'
              : isWarning
              ? 'bg-amber-950/40 border-amber-800/40 text-amber-300'
              : 'bg-rose-950/40 border-rose-800/40 text-rose-300'
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
                ? 'Conception conforme : Cavité, surface et jeu de lamelles validés'
                : isWarning
                ? 'Attention : Point de vigilance altimétrique ou jeu latéral à ajuster'
                : 'Non conforme : Vérifier la largeur de cavité ou la surface maximale'}
            </span>
          </div>
          <span className="font-mono text-[11px] opacity-80">
            Ép. totale : {audit.totalIguThicknessMm} mm • gtot : {audit.effectiveGtot.toFixed(2)}
          </span>
        </div>

        {/* NAVIGATION TABS */}
        <div className="flex border-b border-slate-800 bg-slate-950/40 px-3 pt-1 gap-1">
          <button
            type="button"
            onClick={() => {
              playSwitchSound();
              setActiveTab('config');
            }}
            className={`px-3 py-2.5 rounded-t-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer min-h-[44px] ${
              activeTab === 'config'
                ? 'bg-slate-900 text-teal-400 border-t-2 border-teal-500 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Dimensions & Type</span>
          </button>

          <button
            type="button"
            onClick={() => {
              playSwitchSound();
              setActiveTab('energetics');
            }}
            className={`px-3 py-2.5 rounded-t-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer min-h-[44px] ${
              activeTab === 'energetics'
                ? 'bg-slate-900 text-teal-400 border-t-2 border-teal-500 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sun className="w-3.5 h-3.5" />
            <span>Solaire & Thermique</span>
          </button>

          <button
            type="button"
            onClick={() => {
              playSwitchSound();
              setActiveTab('cad_section');
            }}
            className={`px-3 py-2.5 rounded-t-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer min-h-[44px] ${
              activeTab === 'cad_section'
                ? 'bg-slate-900 text-teal-400 border-t-2 border-teal-500 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Schéma Coupe Vitrage</span>
          </button>

          <button
            type="button"
            onClick={() => {
              playSwitchSound();
              setActiveTab('standards');
            }}
            className={`px-3 py-2.5 rounded-t-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer min-h-[44px] ${
              activeTab === 'standards'
                ? 'bg-slate-900 text-teal-400 border-t-2 border-teal-500 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Réglementation & Pose</span>
          </button>
        </div>

        {/* MODAL CONTENT BODY */}
        <div className="p-4 overflow-y-auto space-y-4 flex-1">
          {/* TAB 1: CONFIGURATION */}
          {activeTab === 'config' && (
            <div className="space-y-4">
              {/* Dimensions Card */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-xl bg-slate-800/50 border border-slate-700/60">
                <div>
                  <label className="text-[11px] font-mono text-slate-300 block mb-1">
                    Largeur Baie (mm)
                  </label>
                  <input
                    type="number"
                    value={widthMm}
                    onChange={(e) => setWidthMm(Math.max(300, Number(e.target.value)))}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white font-mono text-xs focus:ring-2 focus:ring-teal-500 outline-hidden min-h-[44px]"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Plage : {audit.blindSpec.minWidthMm} a {audit.blindSpec.maxWidthMm} mm
                  </span>
                </div>

                <div>
                  <label className="text-[11px] font-mono text-slate-300 block mb-1">
                    Hauteur Baie (mm)
                  </label>
                  <input
                    type="number"
                    value={heightMm}
                    onChange={(e) => setHeightMm(Math.max(400, Number(e.target.value)))}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white font-mono text-xs focus:ring-2 focus:ring-teal-500 outline-hidden min-h-[44px]"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Plage : {audit.blindSpec.minHeightMm} a {audit.blindSpec.maxHeightMm} mm
                  </span>
                </div>

                <div>
                  <label className="text-[11px] font-mono text-slate-300 block mb-1">
                    Surface & Poids Estimé
                  </label>
                  <div className="p-2 rounded-lg bg-slate-900/80 border border-slate-700/50 text-xs font-mono text-teal-300 min-h-[44px] flex flex-col justify-center">
                    <div>{audit.surfaceAreaM2.toFixed(3)} m²</div>
                    <div className="text-[10px] text-slate-400">Poids total : {audit.totalWeightKg} kg</div>
                  </div>
                </div>
              </div>

              {/* Blind Type Selector */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-teal-400" />
                  <span>Modèle de Store Intégré en Cavité</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {(Object.keys(BLIND_TYPE_SPECS) as BlindType[]).map((key) => {
                    const spec = BLIND_TYPE_SPECS[key];
                    const isSelected = blindType === key;
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => {
                          playTactileClick();
                          setBlindType(key);
                          if (cavityWidthMm < spec.minCavityWidthMm) {
                            setCavityWidthMm(spec.recommendedCavityMm);
                          }
                        }}
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer min-h-[44px] flex flex-col justify-between ${
                          isSelected
                            ? 'bg-teal-950/40 border-teal-500/80 shadow-md ring-1 ring-teal-500'
                            : 'bg-slate-800/40 border-slate-700/60 hover:bg-slate-800/80 text-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-bold text-white">{spec.name}</span>
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-900/80 text-teal-300 border border-slate-700">
                            Cavité {spec.minCavityWidthMm} mm+
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 leading-tight">
                          {spec.description}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Cavity Width & Glazing Thickness */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-xl bg-slate-800/50 border border-slate-700/60">
                <div>
                  <label className="text-[11px] font-mono text-slate-300 block mb-1">
                    Épaisseur Cavité Gaz (mm)
                  </label>
                  <select
                    value={cavityWidthMm}
                    onChange={(e) => setCavityWidthMm(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white font-mono text-xs focus:ring-2 focus:ring-teal-500 outline-hidden min-h-[44px]"
                  >
                    <option value={20}>20 mm (Micro-lamelles 12.5)</option>
                    <option value={22}>22 mm (Recommandé 12.5 / Plissé)</option>
                    <option value={27}>27 mm (Standard ScreenLine 16)</option>
                    <option value={29}>29 mm (Confort large / Acoustique)</option>
                    <option value={32}>32 mm (Toile Soltis / Triple vitrage)</option>
                  </select>
                  {!audit.isCavitySufficient && (
                    <span className="text-[10px] text-rose-400 mt-1 block font-semibold">
                      Cavité insuffisante (min {audit.minRecommendedCavityMm} mm)
                    </span>
                  )}
                </div>

                <div>
                  <label className="text-[11px] font-mono text-slate-300 block mb-1">
                    Verre Extérieur (mm)
                  </label>
                  <select
                    value={glassOuterThicknessMm}
                    onChange={(e) => setGlassOuterThicknessMm(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white font-mono text-xs focus:ring-2 focus:ring-teal-500 outline-hidden min-h-[44px]"
                  >
                    <option value={4}>4 mm Trempé ou Float</option>
                    <option value={6}>6 mm Trempé Sécurité</option>
                    <option value={8}>8 mm Trempé</option>
                    <option value={8.76}>44.2 Feuilleté (8.76 mm)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-mono text-slate-300 block mb-1">
                    Verre Intérieur Low-E (mm)
                  </label>
                  <select
                    value={glassInnerThicknessMm}
                    onChange={(e) => setGlassInnerThicknessMm(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white font-mono text-xs focus:ring-2 focus:ring-teal-500 outline-hidden min-h-[44px]"
                  >
                    <option value={4}>4 mm Faible Émissivité</option>
                    <option value={6}>6 mm Faible Émissivité</option>
                    <option value={8.76}>44.2 Silence Acoustique</option>
                    <option value={10.76}>55.2 Sécurité Anti-Effraction</option>
                  </select>
                </div>
              </div>

              {/* Actuation Mode Selector */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5 text-teal-400" />
                  <span>Mode de Manœuvre & Commande</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {(Object.keys(ACTUATION_SPECS) as ActuationMode[]).map((key) => {
                    const spec = ACTUATION_SPECS[key];
                    const isSelected = actuationMode === key;
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => {
                          playTactileClick();
                          setActuationMode(key);
                        }}
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer min-h-[44px] flex flex-col justify-between ${
                          isSelected
                            ? 'bg-teal-950/40 border-teal-500/80 ring-1 ring-teal-500'
                            : 'bg-slate-800/40 border-slate-700/60 hover:bg-slate-800/80 text-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-bold text-white">{spec.name}</span>
                          <span className="text-[10px] font-mono text-teal-300">Max {spec.maxAreaM2} m²</span>
                        </div>
                        <p className="text-[11px] text-slate-400 leading-tight mb-1">
                          {spec.description}
                        </p>
                        <span className="text-[10px] font-mono text-slate-500">
                          {spec.powerSupply}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Altitude & Site Setting */}
              <div className="p-3.5 rounded-xl bg-slate-800/50 border border-slate-700/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5 text-amber-400" />
                    <span>Altitude du Chantier d'Installation</span>
                  </span>
                  <p className="text-[11px] text-slate-400">
                    Détermine la pression barométrique et la nécessité d'une soupape de détente (CSTB 3677)
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={installationAltitudeM}
                    onChange={(e) => setInstallationAltitudeM(Number(e.target.value))}
                    className="w-28 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white font-mono text-xs focus:ring-2 focus:ring-teal-500 outline-hidden min-h-[44px]"
                  />
                  <span className="text-xs font-mono text-slate-300">mètres</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ENERGETICS */}
          {activeTab === 'energetics' && (
            <div className="space-y-4">
              {/* Slat Tilt Controls */}
              <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/60 space-y-3">
                <label className="text-xs font-bold text-white flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Sliders className="w-4 h-4 text-teal-400" />
                    <span>Orientation & Déploiement des Lamelles</span>
                  </span>
                  <span className="font-mono text-teal-300 text-xs">
                    Position : {orientation}
                  </span>
                </label>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      playTactileClick();
                      setOrientation('retracted');
                    }}
                    className={`p-3 rounded-xl border text-center transition-all cursor-pointer min-h-[44px] flex flex-col items-center justify-center ${
                      orientation === 'retracted'
                        ? 'bg-teal-950/50 border-teal-500 text-teal-200 ring-1 ring-teal-500'
                        : 'bg-slate-900/60 border-slate-700/60 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <Minimize2 className="w-4 h-4 mb-1" />
                    <span className="text-xs font-bold">Relevé</span>
                    <span className="text-[10px] opacity-75">100% Vue Claire</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      playTactileClick();
                      setOrientation('horizontal_0');
                    }}
                    className={`p-3 rounded-xl border text-center transition-all cursor-pointer min-h-[44px] flex flex-col items-center justify-center ${
                      orientation === 'horizontal_0'
                        ? 'bg-teal-950/50 border-teal-500 text-teal-200 ring-1 ring-teal-500'
                        : 'bg-slate-900/60 border-slate-700/60 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <Maximize2 className="w-4 h-4 mb-1" />
                    <span className="text-xs font-bold">Horizontal 0°</span>
                    <span className="text-[10px] opacity-75">Lumière directe</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      playTactileClick();
                      setOrientation('tilted_45');
                    }}
                    className={`p-3 rounded-xl border text-center transition-all cursor-pointer min-h-[44px] flex flex-col items-center justify-center ${
                      orientation === 'tilted_45'
                        ? 'bg-teal-950/50 border-teal-500 text-teal-200 ring-1 ring-teal-500'
                        : 'bg-slate-900/60 border-slate-700/60 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <Sun className="w-4 h-4 mb-1" />
                    <span className="text-xs font-bold">Incliné 45°</span>
                    <span className="text-[10px] opacity-75">Anti-éblouissement</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      playTactileClick();
                      setOrientation('closed_75');
                    }}
                    className={`p-3 rounded-xl border text-center transition-all cursor-pointer min-h-[44px] flex flex-col items-center justify-center ${
                      orientation === 'closed_75'
                        ? 'bg-teal-950/50 border-teal-500 text-teal-200 ring-1 ring-teal-500'
                        : 'bg-slate-900/60 border-slate-700/60 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <ShieldCheck className="w-4 h-4 mb-1" />
                    <span className="text-xs font-bold">Fermé 75°</span>
                    <span className="text-[10px] opacity-75">Occultation max</span>
                  </button>
                </div>
              </div>

              {/* Thermal & Solar Performance Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/60 flex flex-col justify-between">
                  <span className="text-[11px] font-mono text-slate-400">Facteur Solaire gtot</span>
                  <div className="my-2">
                    <span className="text-3xl font-black font-mono text-teal-400">
                      {audit.effectiveGtot.toFixed(2)}
                    </span>
                    <span className="text-xs text-slate-400 ml-2">
                      (vs {audit.baseGlassG.toFixed(2)} clair)
                    </span>
                  </div>
                  <span className="text-[10px] text-teal-300 font-semibold">
                    -{audit.solarHeatReductionPercent}% d'apports solaires estivaux
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/60 flex flex-col justify-between">
                  <span className="text-[11px] font-mono text-slate-400">Transmission Thermique Ug</span>
                  <div className="my-2">
                    <span className="text-3xl font-black font-mono text-amber-400">
                      {audit.effectiveUg.toFixed(2)}
                    </span>
                    <span className="text-xs text-slate-400 ml-1">W/(m²·K)</span>
                  </div>
                  <span className="text-[10px] text-slate-400">
                    Cavité subdivisée par les lamelles
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/60 flex flex-col justify-between">
                  <span className="text-[11px] font-mono text-slate-400">Facteur Lumière Tau_v</span>
                  <div className="my-2">
                    <span className="text-3xl font-black font-mono text-sky-400">
                      {(audit.lightTransmittanceTauV * 100).toFixed(0)}%
                    </span>
                    <span className="text-xs text-slate-400 ml-1">Lumière du jour</span>
                  </div>
                  <span className="text-[10px] text-sky-300 font-semibold">
                    Confort d'été : {audit.summerComfortRating}
                  </span>
                </div>
              </div>

              {/* Algerian Climate Compliance (DTR C3-2) */}
              <div className="p-3.5 rounded-xl bg-teal-950/30 border border-teal-800/40 space-y-1.5">
                <span className="text-xs font-bold text-teal-300 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-teal-400" />
                  <span>Validation Réglementation Thermique DTR C3-2 (Zones Climatiques A, B, C)</span>
                </span>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  En position inclinée à 45° ou fermée, le facteur solaire gtot est inférieur à 0.20, satisfaisant amplement les exigences de surchauffe estivale du CNERIB et permettant d'éliminer jusqu'à 85% de la charge de climatisation sans store extérieur soumis au vent ou à la poussière.
                </p>
              </div>
            </div>
          )}

          {/* TAB 3: CAD SECTION */}
          {activeTab === 'cad_section' && (
            <div className="space-y-4">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center">
                {/* SVG Technical Cross Section Diagram */}
                <svg
                  viewBox="0 0 600 320"
                  className="w-full h-auto max-h-[300px]"
                  style={{ background: '#090d16' }}
                >
                  {/* Grid Lines */}
                  <defs>
                    <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                      <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#1e293b" strokeWidth="0.5" />
                    </pattern>
                  </defs>
                  <rect width="600" height="320" fill="url(#grid)" />

                  {/* Exterior Sun Rays */}
                  <g opacity="0.8">
                    <line x1="30" y1="50" x2="110" y2="90" stroke="#f59e0b" strokeWidth="2" strokeDasharray="4 2" />
                    <line x1="20" y1="100" x2="110" y2="130" stroke="#f59e0b" strokeWidth="2" strokeDasharray="4 2" />
                    <line x1="30" y1="160" x2="110" y2="180" stroke="#f59e0b" strokeWidth="2" strokeDasharray="4 2" />
                    <text x="35" y="40" fill="#f59e0b" fontSize="10" fontFamily="monospace">RAYONS SOLAIRES</text>
                  </g>

                  {/* Outer Glass Pane */}
                  <rect x="110" y="30" width="16" height="260" fill="#38bdf8" fillOpacity="0.4" stroke="#0ea5e9" strokeWidth="1.5" rx="2" />
                  <text x="118" y="25" fill="#38bdf8" fontSize="9" fontFamily="monospace" textAnchor="middle">EXT : {glassOuterThicknessMm}mm</text>

                  {/* Warm Edge Spacers Top & Bottom */}
                  <rect x="126" y="30" width="70" height="18" fill="#1e293b" stroke="#64748b" strokeWidth="1" />
                  <rect x="126" y="272" width="70" height="18" fill="#1e293b" stroke="#64748b" strokeWidth="1" />
                  <rect x="135" y="34" width="52" height="10" fill="#0d9488" fillOpacity="0.6" rx="1" />
                  <rect x="135" y="276" width="52" height="10" fill="#0d9488" fillOpacity="0.6" rx="1" />

                  {/* Headrail & Mechanism at Top of Cavity */}
                  <rect x="130" y="52" width="62" height="24" fill="#334155" stroke="#94a3b8" strokeWidth="1" rx="2" />
                  <text x="161" y="68" fill="#f8fafc" fontSize="8" fontFamily="monospace" textAnchor="middle" fontWeight="bold">
                    {actuationMode.startsWith('motorized') ? 'MOTEUR 24V' : 'BOITIER TETE'}
                  </text>

                  {/* Slat Bundle / Stack representation if retracted */}
                  {orientation === 'retracted' ? (
                    <g>
                      <rect x="135" y="78" width="52" height="40" fill="#cbd5e1" stroke="#94a3b8" strokeWidth="1" rx="1" />
                      <line x1="135" y1="88" x2="187" y2="88" stroke="#475569" strokeWidth="1" />
                      <line x1="135" y1="98" x2="187" y2="98" stroke="#475569" strokeWidth="1" />
                      <line x1="135" y1="108" x2="187" y2="108" stroke="#475569" strokeWidth="1" />
                      <text x="161" y="130" fill="#94a3b8" fontSize="8" fontFamily="monospace" textAnchor="middle">
                        PAQUET REPLIE {audit.stackHeightMm} mm
                      </text>
                    </g>
                  ) : (
                    /* Deployed Slats inside cavity */
                    <g>
                      {Array.from({ length: 8 }).map((_, i) => {
                        const y = 90 + i * 20;
                        const angle = orientation === 'horizontal_0' ? 0 : orientation === 'tilted_45' ? 35 : 65;
                        return (
                          <g key={i} transform={`translate(161, ${y}) rotate(${angle})`}>
                            <rect x="-24" y="-2" width="48" height="4" fill="#cbd5e1" stroke="#475569" strokeWidth="0.8" rx="1" />
                          </g>
                        );
                      })}
                      {/* Vertical ladder cords */}
                      <line x1="145" y1="76" x2="145" y2="250" stroke="#94a3b8" strokeWidth="0.8" strokeDasharray="3 3" />
                      <line x1="177" y1="76" x2="177" y2="250" stroke="#94a3b8" strokeWidth="0.8" strokeDasharray="3 3" />
                      {/* Bottom rail */}
                      <rect x="134" y="250" width="54" height="12" fill="#475569" stroke="#94a3b8" strokeWidth="1" rx="1" />
                    </g>
                  )}

                  {/* Inner Glass Pane */}
                  <rect x="196" y="30" width="14" height="260" fill="#38bdf8" fillOpacity="0.4" stroke="#0ea5e9" strokeWidth="1.5" rx="2" />
                  <text x="203" y="25" fill="#38bdf8" fontSize="9" fontFamily="monospace" textAnchor="middle">INT : {glassInnerThicknessMm}mm</text>

                  {/* Cavity Gas Label */}
                  <text x="161" y="220" fill="#14b8a6" fontSize="9" fontFamily="monospace" textAnchor="middle" opacity="0.6">
                    ARGON 90%
                  </text>

                  {/* Dimension Annotations */}
                  {/* Cavity Width Dimension */}
                  <line x1="126" y1="298" x2="196" y2="298" stroke="#14b8a6" strokeWidth="1.5" />
                  <circle cx="126" cy="298" r="2.5" fill="#14b8a6" />
                  <circle cx="196" cy="298" r="2.5" fill="#14b8a6" />
                  <text x="161" y="312" fill="#14b8a6" fontSize="10" fontFamily="monospace" textAnchor="middle" fontWeight="bold">
                    Cavité : {cavityWidthMm} mm
                  </text>

                  {/* Total IGU Dimension */}
                  <line x1="110" y1="12" x2="210" y2="12" stroke="#f1f5f9" strokeWidth="1.5" />
                  <circle cx="110" cy="12" r="2" fill="#f1f5f9" />
                  <circle cx="210" cy="12" r="2" fill="#f1f5f9" />
                  <text x="160" y="8" fill="#f1f5f9" fontSize="10" fontFamily="monospace" textAnchor="middle" fontWeight="bold">
                    Total : {audit.totalIguThicknessMm} mm
                  </text>

                  {/* Magnetic Slider / Actuator on Glass Exterior */}
                  {actuationMode === 'magnetic_slider' && (
                    <g>
                      <rect x="94" y="140" width="14" height="40" fill="#f59e0b" stroke="#d97706" strokeWidth="1.5" rx="3" />
                      <circle cx="101" cy="160" r="4" fill="#78350f" />
                      <text x="85" y="163" fill="#f59e0b" fontSize="8" fontFamily="monospace" textAnchor="end">CURSEUR</text>
                      <line x1="94" y1="160" x2="108" y2="160" stroke="#f59e0b" strokeWidth="1" strokeDasharray="2 2" />
                    </g>
                  )}

                  {/* Technical Legend Panel on Right */}
                  <g transform="translate(250, 40)">
                    <rect width="330" height="240" fill="#0f172a" stroke="#334155" strokeWidth="1" rx="8" />
                    <text x="16" y="24" fill="#f8fafc" fontSize="11" fontWeight="bold" fontFamily="sans-serif">
                      Spécifications de Pose en Feuillure
                    </text>

                    <text x="16" y="50" fill="#94a3b8" fontSize="9" fontFamily="sans-serif">
                      • Modèle : <tspan fill="#f1f5f9" fontWeight="bold">{audit.blindSpec.name}</tspan>
                    </text>
                    <text x="16" y="70" fill="#94a3b8" fontSize="9" fontFamily="sans-serif">
                      • Commande : <tspan fill="#f1f5f9">{audit.actuationSpec.name}</tspan>
                    </text>
                    <text x="16" y="90" fill="#94a3b8" fontSize="9" fontFamily="sans-serif">
                      • Jeu latéral lamelle/verre : <tspan fill="#2dd4bf" fontWeight="bold">{audit.slatClearanceFrontMm} mm</tspan> de chaque côté
                    </text>
                    <text x="16" y="110" fill="#94a3b8" fontSize="9" fontFamily="sans-serif">
                      • Hauteur paquet replié : <tspan fill="#f1f5f9">{audit.stackHeightMm} mm</tspan> en imposte
                    </text>
                    <text x="16" y="130" fill="#94a3b8" fontSize="9" fontFamily="sans-serif">
                      • Étanchéité primaire : <tspan fill="#f1f5f9">Double cordon Butyle PIB</tspan>
                    </text>
                    <text x="16" y="150" fill="#94a3b8" fontSize="9" fontFamily="sans-serif">
                      • Scellement secondaire : <tspan fill="#f1f5f9">Polysulfure / Silicone structural</tspan>
                    </text>
                    <text x="16" y="170" fill="#94a3b8" fontSize="9" fontFamily="sans-serif">
                      • Gaz isolant : <tspan fill="#14b8a6">Argon 90% (NF EN 1279-3)</tspan>
                    </text>
                    <text x="16" y="190" fill="#94a3b8" fontSize="9" fontFamily="sans-serif">
                      • Pression barométrique : <tspan fill={audit.requiresAltimetricValve ? '#f59e0b' : '#10b981'}>
                        {audit.estimatedPressureDeltaHPa} hPa ({audit.requiresAltimetricValve ? 'Soupape Aluprom requise' : 'Normal'})
                      </tspan>
                    </text>
                    <text x="16" y="215" fill="#64748b" fontSize="8" fontFamily="monospace">
                      Certification CEKAL / CSTB 3677
                    </text>
                  </g>
                </svg>
              </div>

              {/* Clearance Check Alert */}
              <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/60 flex items-center justify-between text-xs">
                <span className="text-slate-300">
                  Jeu de sécurité entre lamelle et paroi de verre :
                </span>
                <span className={`font-mono font-bold ${audit.slatClearanceFrontMm >= 3 ? 'text-teal-400' : 'text-amber-400'}`}>
                  {audit.slatClearanceFrontMm} mm (Recommandé &ge; 3.0 mm)
                </span>
              </div>
            </div>
          )}

          {/* TAB 4: STANDARDS */}
          {activeTab === 'standards' && (
            <div className="space-y-4">
              {/* Checklist Card */}
              <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/60 space-y-3">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-teal-400" />
                  <span>Conformité Normative NF EN 1279 & Cahier CSTB 3677</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-slate-200 block">Étanchéité Vapeur d'Eau</span>
                      <span className="text-[11px] text-slate-400">
                        Indice de pénétration d'humidité I &le; 0.20 selon NF EN 1279-2. Point de rosée garanti &le; -40°C.
                      </span>
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-slate-200 block">Taux de Fuite de Gaz Argon</span>
                      <span className="text-[11px] text-slate-400">
                        Perte annuelle &le; 1% par an selon NF EN 1279-3. Rétention thermique durable sur 15 ans.
                      </span>
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-slate-200 block">Transmission Magnétique N52</span>
                      <span className="text-[11px] text-slate-400">
                        Couplage par aimants permanents néodyme à travers le verre sans percement mécanique (zéro fuite).
                      </span>
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-slate-200 block">Endurance & Cycles Mécaniques</span>
                      <span className="text-[11px] text-slate-400">
                        20 000 cycles d'ouverture/fermeture testés en laboratoire selon la norme NF EN 13120.
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Altimetric Valve Guide */}
              <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-800/40 space-y-2">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-bold text-amber-300">
                    Prescription Altimétrique & Transport Routier (CSTB 3677)
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  En Algérie, les vitrages assemblés au niveau de la mer (Alger, Oran, Annaba) et transportés vers les hauts plateaux (Médéa 900m, Sétif 1100m, Djelfa 1150m, Batna 1050m) subissent une dépression barométrique importante provoquant un gonflement convexe du vitrage jusqu'à 6 mm. Cela risque de coincer les lamelles ou de briser le verre. Une valve d'équilibrage temporaire Aluprom ou un capillaire ouvert puis scellé sur site est obligatoire au-delà de 700 m de dénivelé.
                </p>
              </div>

              {/* Glazing Bead Matching Table */}
              <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/60 space-y-2">
                <span className="text-xs font-bold text-white block">
                  Guide de Choix des Parcloses Menuiserie Aluminium
                </span>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-[11px] font-mono">
                    <thead className="text-slate-400 border-b border-slate-700">
                      <tr>
                        <th className="pb-1.5 font-bold">Gamme Profil</th>
                        <th className="pb-1.5 font-bold">Feuillure Max</th>
                        <th className="pb-1.5 font-bold">Épaisseur Vitrage</th>
                        <th className="pb-1.5 font-bold">Parclose Compatible</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 text-slate-300">
                      <tr>
                        <td className="py-1.5">Gamme 45 RPT</td>
                        <td className="py-1.5">38 mm</td>
                        <td className="py-1.5 text-teal-300">35 mm (4/27/4)</td>
                        <td className="py-1.5">Parclose fine clipsable 8 mm</td>
                      </tr>
                      <tr>
                        <td className="py-1.5">Gamme 67 Coulissant</td>
                        <td className="py-1.5">44 mm</td>
                        <td className="py-1.5 text-teal-300">39 mm (6/27/6)</td>
                        <td className="py-1.5">Parclose carrée 11 mm</td>
                      </tr>
                      <tr>
                        <td className="py-1.5">PVC 70 mm 5 Ch.</td>
                        <td className="py-1.5">48 mm</td>
                        <td className="py-1.5 text-teal-300">42 mm (6/27/44.2)</td>
                        <td className="py-1.5">Parclose droite 12 mm</td>
                      </tr>
                      <tr>
                        <td className="py-1.5">Mur Rideau VEC/Capot</td>
                        <td className="py-1.5">56 mm</td>
                        <td className="py-1.5 text-teal-300">46 mm (8/29/44.2)</td>
                        <td className="py-1.5">Cale EPDM + Serreur frontal</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* FOOTER ACTIONS */}
        <div className="px-4 py-3 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <div className="text-[11px] font-mono text-slate-400">
            {audit.blindSpec.name} • {audit.actuationSpec.name}
          </div>
          <button
            type="button"
            onClick={() => {
              playTactileClick();
              onClose();
            }}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-white text-xs font-bold transition-all cursor-pointer min-h-[44px]"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
