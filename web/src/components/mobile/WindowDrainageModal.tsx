import React, { useState, useMemo } from 'react';
import {
  X,
  FileText,
  Droplets,
  Layers,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Sliders,
  Wind,
  Compass,
  Check,
} from 'lucide-react';
import { playTactileClick, playSwitchSound } from '../../utils/audioFeedback';
import {
  type WaterTightnessClass,
  type DrainageSlotType,
  type ProfileFamily,
  type ExposureSite,
  WATER_TIGHTNESS_SPECS,
  DRAINAGE_SLOT_SPECS,
  computeWindowDrainageAudit,
} from '../../utils/windowDrainageManager';
import { generateWindowDrainageNoticePdf } from '../../utils/pdfGenerator';

interface WindowDrainageModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialWidth?: number;
  initialHeight?: number;
  windowReference?: string;
  wilayaName?: string;
  clientName?: string;
}

export const WindowDrainageModal: React.FC<WindowDrainageModalProps> = ({
  isOpen,
  onClose,
  initialWidth = 1400,
  initialHeight = 1500,
  windowReference = 'Fenêtre Battante 2 Vantaux',
  wilayaName = 'Alger',
  clientName = 'Chantier Client',
}) => {
  const [activeTab, setActiveTab] = useState<'config' | 'hydrostatic' | 'cad_machining' | 'standards'>('config');

  // Interactive Inputs
  const [widthMm, setWidthMm] = useState<number>(initialWidth);
  const [heightMm, setHeightMm] = useState<number>(initialHeight);
  const [targetClass, setTargetClass] = useState<WaterTightnessClass>('class_9a');
  const [slotType, setSlotType] = useState<DrainageSlotType>('oblong_5x30');
  const [profileFamily, setProfileFamily] = useState<ProfileFamily>('alu_thermal_break');
  const [exposureSite, setExposureSite] = useState<ExposureSite>('exposed_coastal');
  const [upstandHeightMm, setUpstandHeightMm] = useState<number>(35);
  const [userWeepHoleCount, setUserWeepHoleCount] = useState<number>(3);
  const [hasAntiReturnFlaps, setHasAntiReturnFlaps] = useState<boolean>(true);
  const [hasExteriorDeflectors, setHasExteriorDeflectors] = useState<boolean>(true);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  // Compute Audit Results
  const audit = useMemo(() => {
    return computeWindowDrainageAudit({
      widthMm,
      heightMm,
      targetClass,
      slotType,
      profileFamily,
      exposureSite,
      upstandHeightMm,
      userWeepHoleCount,
      hasAntiReturnFlaps,
      hasExteriorDeflectors,
      wilayaName,
      clientName,
      windowReference,
    });
  }, [
    widthMm,
    heightMm,
    targetClass,
    slotType,
    profileFamily,
    exposureSite,
    upstandHeightMm,
    userWeepHoleCount,
    hasAntiReturnFlaps,
    hasExteriorDeflectors,
    wilayaName,
    clientName,
    windowReference,
  ]);

  if (!isOpen) return null;

  const handleDownloadPdf = async () => {
    playTactileClick();
    setIsGeneratingPdf(true);
    try {
      const docId = `DRAIN-${Date.now().toString().slice(-6)}`;
      await generateWindowDrainageNoticePdf({
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
            <div className="w-9 h-9 rounded-xl bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-400">
              <Droplets className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white tracking-wide">
                  Drainage & Étanchéité à l'Eau
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-sky-500/10 text-sky-300 border border-sky-500/20">
                  NF DTU 36.5 / EN 12208
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono">
                {windowReference} • Wilaya : {wilayaName} • Classe {audit.targetClassSpec.name}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={isGeneratingPdf}
              className="px-3 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 active:scale-95 text-white font-semibold text-xs flex items-center gap-1.5 shadow-lg shadow-sky-900/30 transition-all cursor-pointer min-h-[44px]"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>{isGeneratingPdf ? 'Génération...' : 'Plan PDF'}</span>
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

        {/* STATUS BAR */}
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
                ? 'Drainage conforme : Nombre de trous, entraxe et débit validés'
                : isWarning
                ? 'Attention : Espacement des trous ou protection anti-refoulement à ajuster'
                : 'Non conforme : Remontée de gorge ou nombre de drainages insuffisant'}
            </span>
          </div>
          <span className="font-mono text-[11px] opacity-80">
            {audit.actualHolesCount} trou(s) • Entraxe : {audit.actualSpacingMm} mm • Pression : {audit.testPressurePa} Pa
          </span>
        </div>

        {/* TABS HEADER */}
        <div className="flex border-b border-slate-800 bg-slate-950/40 px-3 pt-1 gap-1">
          <button
            type="button"
            onClick={() => {
              playSwitchSound();
              setActiveTab('config');
            }}
            className={`px-3 py-2.5 rounded-t-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer min-h-[44px] ${
              activeTab === 'config'
                ? 'bg-slate-900 text-sky-400 border-t-2 border-sky-500 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Dimensions & Profil</span>
          </button>

          <button
            type="button"
            onClick={() => {
              playSwitchSound();
              setActiveTab('hydrostatic');
            }}
            className={`px-3 py-2.5 rounded-t-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer min-h-[44px] ${
              activeTab === 'hydrostatic'
                ? 'bg-slate-900 text-sky-400 border-t-2 border-sky-500 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Wind className="w-3.5 h-3.5" />
            <span>Pression & Hydrostatique</span>
          </button>

          <button
            type="button"
            onClick={() => {
              playSwitchSound();
              setActiveTab('cad_machining');
            }}
            className={`px-3 py-2.5 rounded-t-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer min-h-[44px] ${
              activeTab === 'cad_machining'
                ? 'bg-slate-900 text-sky-400 border-t-2 border-sky-500 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Plan d'Usinage SVG</span>
          </button>

          <button
            type="button"
            onClick={() => {
              playSwitchSound();
              setActiveTab('standards');
            }}
            className={`px-3 py-2.5 rounded-t-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer min-h-[44px] ${
              activeTab === 'standards'
                ? 'bg-slate-900 text-sky-400 border-t-2 border-sky-500 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Réglementation NF DTU</span>
          </button>
        </div>

        {/* MODAL BODY */}
        <div className="p-4 overflow-y-auto space-y-4 flex-1">
          {/* TAB 1: CONFIGURATION */}
          {activeTab === 'config' && (
            <div className="space-y-4">
              {/* Dimensions Card */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-xl bg-slate-800/50 border border-slate-700/60">
                <div>
                  <label className="text-[11px] font-mono text-slate-300 block mb-1">
                    Largeur Traverse Basse (mm)
                  </label>
                  <input
                    type="number"
                    value={widthMm}
                    onChange={(e) => setWidthMm(Math.max(300, Number(e.target.value)))}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white font-mono text-xs focus:ring-2 focus:ring-sky-500 outline-hidden min-h-[44px]"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Largeur vitrée hors-tout
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
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white font-mono text-xs focus:ring-2 focus:ring-sky-500 outline-hidden min-h-[44px]"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Surface vitrée : {audit.glazingAreaM2.toFixed(3)} m²
                  </span>
                </div>

                <div>
                  <label className="text-[11px] font-mono text-slate-300 block mb-1">
                    Nombre d'Orifices Usinés
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={userWeepHoleCount}
                      onChange={(e) => setUserWeepHoleCount(Math.max(1, Number(e.target.value)))}
                      className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white font-mono text-xs focus:ring-2 focus:ring-sky-500 outline-hidden min-h-[44px]"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        playTactileClick();
                        setUserWeepHoleCount(audit.minimumRequiredHoles);
                      }}
                      className="px-2.5 py-2 rounded-lg bg-slate-800 text-[10px] text-sky-400 font-mono font-bold hover:bg-slate-700 cursor-pointer min-h-[44px] shrink-0"
                    >
                      Min ({audit.minimumRequiredHoles})
                    </button>
                  </div>
                </div>
              </div>

              {/* Water Tightness Class Target */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-200 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Wind className="w-3.5 h-3.5 text-sky-400" />
                    <span>Classe d'Étanchéité à l'Eau Visée (NF EN 12208)</span>
                  </span>
                  <span className="text-[11px] font-mono text-sky-300">
                    Pression : {audit.testPressurePa} Pa ({audit.targetClassSpec.equivalentWindSpeedKmH} km/h)
                  </span>
                </label>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(Object.keys(WATER_TIGHTNESS_SPECS) as WaterTightnessClass[]).slice(1, 6).map((key) => {
                    const spec = WATER_TIGHTNESS_SPECS[key];
                    const isSelected = targetClass === key;
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => {
                          playTactileClick();
                          setTargetClass(key);
                        }}
                        className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer min-h-[44px] flex flex-col justify-between ${
                          isSelected
                            ? 'bg-sky-950/50 border-sky-500/80 ring-1 ring-sky-500'
                            : 'bg-slate-800/40 border-slate-700/60 hover:bg-slate-800/80 text-slate-300'
                        }`}
                      >
                        <span className="text-xs font-bold text-white">{spec.name}</span>
                        <span className="text-[10px] font-mono text-slate-400">
                          {spec.equivalentWindSpeedKmH} km/h • {spec.hydrostaticHeadMm} mm H₂O
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Drainage Slot Type Selector */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5 text-sky-400" />
                  <span>Géométrie des Lumières de Drainage (NF P 20-302)</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {(Object.keys(DRAINAGE_SLOT_SPECS) as DrainageSlotType[]).map((key) => {
                    const spec = DRAINAGE_SLOT_SPECS[key];
                    const isSelected = slotType === key;
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => {
                          playTactileClick();
                          setSlotType(key);
                        }}
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer min-h-[44px] flex flex-col justify-between ${
                          isSelected
                            ? 'bg-sky-950/40 border-sky-500/80 ring-1 ring-sky-500'
                            : 'bg-slate-800/40 border-slate-700/60 hover:bg-slate-800/80 text-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-bold text-white">{spec.name}</span>
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-900/80 text-sky-300 border border-slate-700">
                            {spec.slotAreaMm2} mm²
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 leading-tight">
                          {spec.recommendedMachining}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Profile Family, Upstand Height & Site Exposure */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-xl bg-slate-800/50 border border-slate-700/60">
                <div>
                  <label className="text-[11px] font-mono text-slate-300 block mb-1">
                    Gamme de Profilé
                  </label>
                  <select
                    value={profileFamily}
                    onChange={(e) => setProfileFamily(e.target.value as ProfileFamily)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white font-mono text-xs focus:ring-2 focus:ring-sky-500 outline-hidden min-h-[44px]"
                  >
                    <option value="alu_thermal_break">Aluminium Rupture Pont Thermique (RPT)</option>
                    <option value="alu_standard_cold">Aluminium Standard Chambre Froide</option>
                    <option value="pvc_multichamber">PVC Multi-Chambres (5 Chambres)</option>
                    <option value="sliding_patio_track">Coulissant 2/3 Rails (Drainage Étagé)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-mono text-slate-300 block mb-1">
                    Hauteur de Remontée de Gorge (mm)
                  </label>
                  <input
                    type="number"
                    value={upstandHeightMm}
                    onChange={(e) => setUpstandHeightMm(Math.max(10, Number(e.target.value)))}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white font-mono text-xs focus:ring-2 focus:ring-sky-500 outline-hidden min-h-[44px]"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Gorge d'étanchéité du dormant (recommandé &ge; 25 mm)
                  </span>
                </div>

                <div>
                  <label className="text-[11px] font-mono text-slate-300 block mb-1">
                    Exposition du Site (RNV 2013)
                  </label>
                  <select
                    value={exposureSite}
                    onChange={(e) => setExposureSite(e.target.value as ExposureSite)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white font-mono text-xs focus:ring-2 focus:ring-sky-500 outline-hidden min-h-[44px]"
                  >
                    <option value="sheltered">Site Abrité (Zone urbaine dense / cour)</option>
                    <option value="normal">Site Normal (Campagne / faubourgs)</option>
                    <option value="exposed_coastal">Site Exposé Littoral (Front de mer / falaises)</option>
                  </select>
                </div>
              </div>

              {/* Toggles for Deflector & Anti-Return Flap */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    playTactileClick();
                    setHasAntiReturnFlaps(!hasAntiReturnFlaps);
                  }}
                  className={`p-3 rounded-xl border flex items-center justify-between transition-all cursor-pointer min-h-[44px] ${
                    hasAntiReturnFlaps
                      ? 'bg-sky-950/40 border-sky-500/80 text-white'
                      : 'bg-slate-800/40 border-slate-700 text-slate-400'
                  }`}
                >
                  <span className="text-xs font-bold">Clapets Anti-Retour Silicone</span>
                  <div className={`w-5 h-5 rounded-md flex items-center justify-center ${hasAntiReturnFlaps ? 'bg-sky-500 text-white' : 'bg-slate-700'}`}>
                    {hasAntiReturnFlaps && <Check className="w-3.5 h-3.5" />}
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    playTactileClick();
                    setHasExteriorDeflectors(!hasExteriorDeflectors);
                  }}
                  className={`p-3 rounded-xl border flex items-center justify-between transition-all cursor-pointer min-h-[44px] ${
                    hasExteriorDeflectors
                      ? 'bg-sky-950/40 border-sky-500/80 text-white'
                      : 'bg-slate-800/40 border-slate-700 text-slate-400'
                  }`}
                >
                  <span className="text-xs font-bold">Busettes Déflectrices Façade</span>
                  <div className={`w-5 h-5 rounded-md flex items-center justify-center ${hasExteriorDeflectors ? 'bg-sky-500 text-white' : 'bg-slate-700'}`}>
                    {hasExteriorDeflectors && <Check className="w-3.5 h-3.5" />}
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: HYDROSTATIC */}
          {activeTab === 'hydrostatic' && (
            <div className="space-y-4">
              {/* Metric Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/60 flex flex-col justify-between">
                  <span className="text-[11px] font-mono text-slate-400">Pression d'Essai (NF EN 1027)</span>
                  <div className="my-2">
                    <span className="text-3xl font-black font-mono text-sky-400">
                      {audit.testPressurePa}
                    </span>
                    <span className="text-xs text-slate-400 ml-1">Pa</span>
                  </div>
                  <span className="text-[10px] text-sky-300 font-semibold">
                    Vent équivalent : {audit.targetClassSpec.equivalentWindSpeedKmH} km/h
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/60 flex flex-col justify-between">
                  <span className="text-[11px] font-mono text-slate-400">Colonne d'Eau Hydrostatique</span>
                  <div className="my-2">
                    <span className="text-3xl font-black font-mono text-amber-400">
                      {audit.hydrostaticHeadMm}
                    </span>
                    <span className="text-xs text-slate-400 ml-1">mm H₂O</span>
                  </div>
                  <span className="text-[10px] text-slate-400">
                    Poussée inverse dans la feuillure
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/60 flex flex-col justify-between">
                  <span className="text-[11px] font-mono text-slate-400">Marge de Garde Profil</span>
                  <div className="my-2">
                    <span className={`text-3xl font-black font-mono ${audit.upstandSafetyMarginMm >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {audit.upstandSafetyMarginMm >= 0 ? `+${audit.upstandSafetyMarginMm}` : audit.upstandSafetyMarginMm}
                    </span>
                    <span className="text-xs text-slate-400 ml-1">mm</span>
                  </div>
                  <span className={`text-[10px] font-semibold ${audit.isUpstandSufficient ? 'text-emerald-300' : 'text-rose-400'}`}>
                    {audit.isUpstandSufficient ? 'Gorge suffisante' : 'Gorge sous-dimensionnée'}
                  </span>
                </div>
              </div>

              {/* Hydraulic Evacuation Balance */}
              <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/60 space-y-3">
                <span className="text-xs font-bold text-white flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Droplets className="w-4 h-4 text-sky-400" />
                    <span>Bilan Hydraulique d'Évacuation Gravitaire</span>
                  </span>
                  <span className="font-mono text-sky-300 text-xs">
                    Facteur sécurité : {audit.hydraulicSafetyFactor}x
                  </span>
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800">
                    <span className="text-slate-400 block mb-1">Apport d'eau de pluie battante estimé :</span>
                    <span className="text-lg font-mono font-bold text-slate-200">
                      {audit.estimatedWaterInflowLMin} L/min
                    </span>
                    <span className="text-[10px] text-slate-500 block mt-0.5">
                      Intensité pluie : {audit.rainfallIntensityLMinM2} L/(min·m²)
                    </span>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800">
                    <span className="text-slate-400 block mb-1">Capacité totale d'évacuation des lumières :</span>
                    <span className="text-lg font-mono font-bold text-emerald-400">
                      {audit.totalDischargeCapacityLMin} L/min
                    </span>
                    <span className="text-[10px] text-slate-500 block mt-0.5">
                      Soit {audit.dischargeCapacityPerHoleLMin} L/min par lumière de {audit.slotSpec.slotAreaMm2} mm²
                    </span>
                  </div>
                </div>
              </div>

              {/* Hydrostatic Risk Callout */}
              {!audit.isUpstandSufficient && (
                <div className="p-3.5 rounded-xl bg-amber-950/30 border border-amber-800/40 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                    <span className="text-xs font-bold text-amber-300">
                      Risque de Refoulement d'Eau sous Vent Violent
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    À {audit.testPressurePa} Pa de pression, la colonne d'eau s'élève de {audit.hydrostaticHeadMm} mm dans la feuillure, dépassant la gorge de {audit.upstandHeightMm} mm. La présence de clapets anti-retour à membrane silicone est impérative pour bloquer l'effet de vague et garantir l'étanchéité intérieure.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: CAD MACHINING */}
          {activeTab === 'cad_machining' && (
            <div className="space-y-4">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center">
                {/* SVG Technical Cross Section & Elevation */}
                <svg
                  viewBox="0 0 600 320"
                  className="w-full h-auto max-h-[300px]"
                  style={{ background: '#090d16' }}
                >
                  <defs>
                    <pattern id="drain_grid" width="20" height="20" patternUnits="userSpaceOnUse">
                      <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#1e293b" strokeWidth="0.5" />
                    </pattern>
                  </defs>
                  <rect width="600" height="320" fill="url(#drain_grid)" />

                  {/* Profile Cross Section Left */}
                  <g transform="translate(30, 20)">
                    <text x="0" y="15" fill="#38bdf8" fontSize="10" fontFamily="monospace" fontWeight="bold">
                      COUPE PROFILE TRANSVERSALE
                    </text>

                    {/* Outer frame profile outline */}
                    <path
                      d="M 20,40 L 160,40 L 160,180 L 110,180 L 110,160 L 50,160 L 50,180 L 20,180 Z"
                      fill="#1e293b"
                      stroke="#64748b"
                      strokeWidth="1.5"
                    />

                    {/* Glazing Rebate Chamber */}
                    <rect x="50" y="60" width="90" height="70" fill="#0f172a" stroke="#38bdf8" strokeWidth="1" strokeDasharray="3 2" />
                    <text x="95" y="85" fill="#94a3b8" fontSize="8" fontFamily="monospace" textAnchor="middle">
                      FEUILLURE
                    </text>

                    {/* Glass Pane bottom edge */}
                    <rect x="65" y="40" width="30" height="60" fill="#38bdf8" fillOpacity="0.4" stroke="#0ea5e9" strokeWidth="1" />
                    {/* Setting block */}
                    <rect x="65" y="100" width="30" height="8" fill="#10b981" rx="1" />
                    <text x="80" y="106" fill="#f8fafc" fontSize="6" textAnchor="middle">CALE</text>

                    {/* Water flow path blue arrow */}
                    <path d="M 60,70 Q 55,120 50,135" fill="none" stroke="#0284c7" strokeWidth="2" strokeDasharray="3 2" />
                    <circle cx="50" cy="135" r="2" fill="#0284c7" />

                    {/* Internal drainage hole */}
                    <rect x="45" y="130" width="10" height="8" fill="#0284c7" stroke="#38bdf8" strokeWidth="1" />

                    {/* Decompression chamber */}
                    <rect x="25" y="130" width="20" height="30" fill="#0369a1" fillOpacity="0.3" stroke="#0284c7" strokeWidth="0.8" />

                    {/* Anti-return silicone flap */}
                    {hasAntiReturnFlaps && (
                      <line x1="25" y1="135" x2="25" y2="155" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" />
                    )}

                    {/* Front weep hole & deflector */}
                    <rect x="15" y="140" width="10" height="8" fill="#0284c7" stroke="#38bdf8" strokeWidth="1" />
                    {hasExteriorDeflectors && (
                      <path d="M 15,135 L 5,145 L 15,155 Z" fill="#475569" stroke="#94a3b8" strokeWidth="1" />
                    )}

                    {/* Upstand Height dimension */}
                    <line x1="170" y1="130" x2="170" y2="60" stroke="#f59e0b" strokeWidth="1.5" />
                    <circle cx="170" cy="130" r="2" fill="#f59e0b" />
                    <circle cx="170" cy="60" r="2" fill="#f59e0b" />
                    <text x="175" y="100" fill="#f59e0b" fontSize="8" fontFamily="monospace">
                      Gorge : {upstandHeightMm} mm
                    </text>
                  </g>

                  {/* CNC Machining Elevation Map Right */}
                  <g transform="translate(250, 20)">
                    <text x="0" y="15" fill="#38bdf8" fontSize="10" fontFamily="monospace" fontWeight="bold">
                      PLAN D'USINAGE DES LUMIÈRES (TRAVERSE BASSE)
                    </text>

                    {/* Horizontal Profile Profile Bar */}
                    <rect x="0" y="40" width="320" height="45" fill="#1e293b" stroke="#64748b" strokeWidth="1.5" rx="2" />
                    <text x="160" y="35" fill="#94a3b8" fontSize="8" fontFamily="monospace" textAnchor="middle">
                      Largeur totale : {widthMm} mm
                    </text>

                    {/* Render Each Weep Hole along the profile bar */}
                    {audit.weepHolePositions.map((hole) => {
                      const relX = Math.round((hole.coordinateXMm / widthMm) * 300) + 10;
                      return (
                        <g key={hole.index}>
                          <rect
                            x={relX - 8}
                            y="55"
                            width="16"
                            height="8"
                            fill="#0284c7"
                            stroke="#38bdf8"
                            strokeWidth="1.2"
                            rx="2"
                          />
                          <line x1={relX} y1="40" x2={relX} y2="55" stroke="#38bdf8" strokeWidth="0.8" strokeDasharray="2 2" />
                          <text x={relX} y="78" fill="#38bdf8" fontSize="8" fontFamily="monospace" textAnchor="middle" fontWeight="bold">
                            T{hole.index}
                          </text>
                          <text x={relX} y="92" fill="#f1f5f9" fontSize="7" fontFamily="monospace" textAnchor="middle">
                            {hole.coordinateXMm} mm
                          </text>
                        </g>
                      );
                    })}

                    {/* Weep Hole Coordinates Table Snippet */}
                    <g transform="translate(0, 115)">
                      <rect width="320" height="150" fill="#0f172a" stroke="#334155" strokeWidth="1" rx="6" />
                      <text x="12" y="20" fill="#f8fafc" fontSize="10" fontWeight="bold" fontFamily="sans-serif">
                        Coordonnées d'Usinage CNC (Depuis l'Angle Gauche)
                      </text>

                      {audit.weepHolePositions.slice(0, 4).map((h, idx) => (
                        <g key={h.index} transform={`translate(12, ${40 + idx * 22})`}>
                          <circle cx="4" cy="4" r="3" fill="#0284c7" />
                          <text x="14" y="8" fill="#94a3b8" fontSize="8" fontFamily="monospace">
                            Trou N°{h.index} : <tspan fill="#38bdf8" fontWeight="bold">X = {h.coordinateXMm} mm</tspan> ({h.label})
                          </text>
                        </g>
                      ))}

                      <text x="12" y="135" fill="#64748b" fontSize="8" fontFamily="monospace">
                        Entraxe réel : {audit.actualSpacingMm} mm • Max NF DTU : {audit.maxSpacingMm} mm
                      </text>
                    </g>
                  </g>
                </svg>
              </div>

              {/* CNC Summary Bar */}
              <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/60 flex items-center justify-between text-xs">
                <span className="text-slate-300">
                  Section unitaire : <strong className="text-sky-400">{audit.slotSpec.slotAreaMm2} mm²</strong> ({audit.slotSpec.name})
                </span>
                <span className="font-mono text-slate-400">
                  Décompression : 2 évents hauts obligatoires
                </span>
              </div>
            </div>
          )}

          {/* TAB 4: STANDARDS */}
          {activeTab === 'standards' && (
            <div className="space-y-4">
              {/* Checklist */}
              <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/60 space-y-3">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-sky-400" />
                  <span>Exigences Réglementaires NF DTU 36.5 & NF P 20-302</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-slate-200 block">Section Minimale par Trou</span>
                      <span className="text-[11px] text-slate-400">
                        Section minimale obligatoire &ge; 50 mm² par orifice (ou oblongue 5x30 de 150 mm²).
                      </span>
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-slate-200 block">Entraxe Maximal de 600 mm</span>
                      <span className="text-[11px] text-slate-400">
                        La distance entre deux orifices successifs ne doit jamais excéder 600 mm pour éviter la stagnation d'eau.
                      </span>
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-slate-200 block">Orifices d'Angle (50 à 150 mm)</span>
                      <span className="text-[11px] text-slate-400">
                        Les premiers orifices doivent se situer entre 50 et 150 mm des angles de feuillure pour drainer les équerres.
                      </span>
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-slate-200 block">Évents de Décompression</span>
                      <span className="text-[11px] text-slate-400">
                        Au moins 2 évents en partie haute ou latérale pour équilibrer la pression et annuler l'effet pipette.
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Rain Rejection & Wind Recommendations */}
              <div className="p-4 rounded-xl bg-sky-950/20 border border-sky-800/40 space-y-2">
                <div className="flex items-center gap-2">
                  <Droplets className="w-4 h-4 text-sky-400" />
                  <span className="text-xs font-bold text-sky-300">
                    Directives Techniques de Pose & Écoulement (Cahier CSTB 3529)
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  L'eau s'infiltrant sous les joints de vitrage doit être guidée vers la chambre de drainage sans contact prolongé avec le mastic de scellement du double vitrage (risque de décollement du butyle ou de buée interne). Les cales de vitrage drainantes en polypropylène doivent impérativement comporter des rainures inférieures d'au moins 5 mm pour ne pas obstruer le passage de l'eau vers les lumières.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="px-4 py-3 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <div className="text-[11px] font-mono text-slate-400">
            {audit.slotSpec.name} • {audit.actualHolesCount} trou(s) • Classe {audit.targetClassSpec.name}
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
