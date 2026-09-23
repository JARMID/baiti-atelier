import React, { useState, useMemo } from 'react';
import {
  X,
  FileText,
  Wrench,
  Layers,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Sliders,
  Activity,
  Compass,
  Check,
} from 'lucide-react';
import { playTactileClick, playSwitchSound } from '../../utils/audioFeedback';
import {
  type CornerAssemblyMethod,
  type CleatMaterial,
  type AdhesiveType,
  CORNER_ASSEMBLY_SPECS,
  CLEAT_MATERIAL_SPECS,
  computeCornerCrimpingAudit,
} from '../../utils/cornerCrimpingManager';
import { generateCornerCrimpingNoticePdf } from '../../utils/pdfGenerator';

interface CornerCrimpingModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialWidth?: number;
  initialHeight?: number;
  windowReference?: string;
  wilayaName?: string;
  clientName?: string;
}

export const CornerCrimpingModal: React.FC<CornerCrimpingModalProps> = ({
  isOpen,
  onClose,
  initialWidth = 1200,
  initialHeight = 1400,
  windowReference = 'Châssis Battant 1 Vantail',
  wilayaName = 'Alger',
  clientName = 'Chantier Client',
}) => {
  const [activeTab, setActiveTab] = useState<'config' | 'eurocode9' | 'cad_crimping' | 'standards'>('config');

  // Interactive Inputs
  const [sashWidthMm, setSashWidthMm] = useState<number>(initialWidth);
  const [sashHeightMm, setSashHeightMm] = useState<number>(initialHeight);
  const [profileDepthMm, setProfileDepthMm] = useState<number>(50);
  const [profileWallThicknessMm, setProfileWallThicknessMm] = useState<number>(1.6);
  const [assemblyMethod, setAssemblyMethod] = useState<CornerAssemblyMethod>('crimped_hydraulic');
  const [cleatMaterial, setCleatMaterial] = useState<CleatMaterial>('extruded_alu_6063');
  const [adhesiveType, setAdhesiveType] = useState<AdhesiveType>('pu_two_component');
  const [crimpKnifeCount, setCrimpKnifeCount] = useState<number>(2);
  const [knifePenetrationMm, setKnifePenetrationMm] = useState<number>(1.5);
  const [glazingWeightKg, setGlazingWeightKg] = useState<number>(32);
  const [hasAlignmentCleat, setHasAlignmentCleat] = useState<boolean>(true);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  // Compute Audit Results
  const audit = useMemo(() => {
    return computeCornerCrimpingAudit({
      sashWidthMm,
      sashHeightMm,
      profileDepthMm,
      profileWallThicknessMm,
      assemblyMethod,
      cleatMaterial,
      adhesiveType,
      crimpKnifeCount,
      knifePenetrationMm,
      glazingWeightKg,
      hasAlignmentCleat,
      wilayaName,
      clientName,
      windowReference,
    });
  }, [
    sashWidthMm,
    sashHeightMm,
    profileDepthMm,
    profileWallThicknessMm,
    assemblyMethod,
    cleatMaterial,
    adhesiveType,
    crimpKnifeCount,
    knifePenetrationMm,
    glazingWeightKg,
    hasAlignmentCleat,
    wilayaName,
    clientName,
    windowReference,
  ]);

  if (!isOpen) return null;

  const handleDownloadPdf = async () => {
    playTactileClick();
    setIsGeneratingPdf(true);
    try {
      const docId = `CRIMP-${Date.now().toString().slice(-6)}`;
      await generateCornerCrimpingNoticePdf({
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
            <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white tracking-wide">
                  Sertissage & Équerres d'Angle
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-300 border border-amber-500/20">
                  Eurocode 9 / NF P 20-302
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono">
                {windowReference} • Wilaya : {wilayaName} • Pression {audit.effectivePunchPressureBar} bar
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={isGeneratingPdf}
              className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 active:scale-95 text-white font-semibold text-xs flex items-center gap-1.5 shadow-lg shadow-amber-900/30 transition-all cursor-pointer min-h-[44px]"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>{isGeneratingPdf ? 'Génération...' : 'Note PDF'}</span>
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
                ? 'Assemblage d onglet conforme : Résistance mécanique et rigidité validées'
                : isWarning
                ? 'Attention : Point de vigilance alignement, collage ou pénétration des couteaux'
                : 'Non conforme : Risque de rupture sous charge accidentelle ou affaissement excessif'}
            </span>
          </div>
          <span className="font-mono text-[11px] opacity-80">
            Sécurité : {audit.safetyFactor.toFixed(2)}x • Résistance : {audit.ultimatePullOutResistanceN} N
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
                ? 'bg-slate-900 text-amber-400 border-t-2 border-amber-500 font-bold'
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
              setActiveTab('eurocode9');
            }}
            className={`px-3 py-2.5 rounded-t-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer min-h-[44px] ${
              activeTab === 'eurocode9'
                ? 'bg-slate-900 text-amber-400 border-t-2 border-amber-500 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Efforts & Résistance</span>
          </button>

          <button
            type="button"
            onClick={() => {
              playSwitchSound();
              setActiveTab('cad_crimping');
            }}
            className={`px-3 py-2.5 rounded-t-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer min-h-[44px] ${
              activeTab === 'cad_crimping'
                ? 'bg-slate-900 text-amber-400 border-t-2 border-amber-500 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Schéma Sertissage SVG</span>
          </button>

          <button
            type="button"
            onClick={() => {
              playSwitchSound();
              setActiveTab('standards');
            }}
            className={`px-3 py-2.5 rounded-t-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer min-h-[44px] ${
              activeTab === 'standards'
                ? 'bg-slate-900 text-amber-400 border-t-2 border-amber-500 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Réglementation & Qualité</span>
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
                    Largeur Ouvrant (mm)
                  </label>
                  <input
                    type="number"
                    value={sashWidthMm}
                    onChange={(e) => setSashWidthMm(Math.max(300, Number(e.target.value)))}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white font-mono text-xs focus:ring-2 focus:ring-amber-500 outline-hidden min-h-[44px]"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Largeur vantail mobile
                  </span>
                </div>

                <div>
                  <label className="text-[11px] font-mono text-slate-300 block mb-1">
                    Hauteur Ouvrant (mm)
                  </label>
                  <input
                    type="number"
                    value={sashHeightMm}
                    onChange={(e) => setSashHeightMm(Math.max(400, Number(e.target.value)))}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white font-mono text-xs focus:ring-2 focus:ring-amber-500 outline-hidden min-h-[44px]"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Périmètre : {audit.sashPerimeterM.toFixed(2)} m
                  </span>
                </div>

                <div>
                  <label className="text-[11px] font-mono text-slate-300 block mb-1">
                    Poids Remplissage Verre (kg)
                  </label>
                  <input
                    type="number"
                    value={glazingWeightKg}
                    onChange={(e) => setGlazingWeightKg(Math.max(5, Number(e.target.value)))}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white font-mono text-xs focus:ring-2 focus:ring-amber-500 outline-hidden min-h-[44px]"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Poids total ouvrant : {audit.totalSashWeightKg} kg
                  </span>
                </div>
              </div>

              {/* Assembly Method Selector */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5 text-amber-400" />
                  <span>Mode d'Assemblage des Onglets à 45 Degrés</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {(Object.keys(CORNER_ASSEMBLY_SPECS) as CornerAssemblyMethod[]).map((key) => {
                    const spec = CORNER_ASSEMBLY_SPECS[key];
                    const isSelected = assemblyMethod === key;
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => {
                          playTactileClick();
                          setAssemblyMethod(key);
                        }}
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer min-h-[44px] flex flex-col justify-between ${
                          isSelected
                            ? 'bg-amber-950/40 border-amber-500/80 ring-1 ring-amber-500'
                            : 'bg-slate-800/40 border-slate-700/60 hover:bg-slate-800/80 text-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-bold text-white">{spec.name}</span>
                          <span className="text-[10px] font-mono text-amber-300">{spec.nominalShearStrengthMpa} MPa</span>
                        </div>
                        <p className="text-[11px] text-slate-400 leading-tight">
                          {spec.description}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Profile Depth, Wall Thickness & Knife Penetration */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-xl bg-slate-800/50 border border-slate-700/60">
                <div>
                  <label className="text-[11px] font-mono text-slate-300 block mb-1">
                    Profondeur Profil Ouvrant (mm)
                  </label>
                  <select
                    value={profileDepthMm}
                    onChange={(e) => setProfileDepthMm(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white font-mono text-xs focus:ring-2 focus:ring-amber-500 outline-hidden min-h-[44px]"
                  >
                    <option value={45}>45 mm (Gamme 45 RPT)</option>
                    <option value={50}>50 mm (Gamme 50 Frappe)</option>
                    <option value={60}>60 mm (Gamme Lourde RPT)</option>
                    <option value={67}>67 mm (Gamme Coulissant 67)</option>
                    <option value={70}>70 mm (PVC 5 Chambres)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-mono text-slate-300 block mb-1">
                    Épaisseur Paroi Alu (mm)
                  </label>
                  <select
                    value={profileWallThicknessMm}
                    onChange={(e) => setProfileWallThicknessMm(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white font-mono text-xs focus:ring-2 focus:ring-amber-500 outline-hidden min-h-[44px]"
                  >
                    <option value={1.4}>1.4 mm (Profil standard éco)</option>
                    <option value={1.6}>1.6 mm (Standard certifié NF)</option>
                    <option value={1.8}>1.8 mm (Profil renforcé)</option>
                    <option value={2.0}>2.0 mm (Gamme tertiaire lourde)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-mono text-slate-300 block mb-1">
                    Pénétration Couteau (mm)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={knifePenetrationMm}
                    onChange={(e) => setKnifePenetrationMm(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white font-mono text-xs focus:ring-2 focus:ring-amber-500 outline-hidden min-h-[44px]"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Tolérance : 1.2 à 1.8 mm (actuel : {knifePenetrationMm} mm)
                  </span>
                </div>
              </div>

              {/* Cleat Material & Adhesive */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-xl bg-slate-800/50 border border-slate-700/60">
                <div>
                  <label className="text-[11px] font-mono text-slate-300 block mb-1">
                    Alliage de l'Équerre d'Angle
                  </label>
                  <select
                    value={cleatMaterial}
                    onChange={(e) => setCleatMaterial(e.target.value as CleatMaterial)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white font-mono text-xs focus:ring-2 focus:ring-amber-500 outline-hidden min-h-[44px]"
                  >
                    {(Object.keys(CLEAT_MATERIAL_SPECS) as CleatMaterial[]).map((key) => (
                      <option key={key} value={key}>
                        {CLEAT_MATERIAL_SPECS[key].name} ({CLEAT_MATERIAL_SPECS[key].yieldStrengthMpa} MPa)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-mono text-slate-300 block mb-1">
                    Colle d'Onglet Bicomposant
                  </label>
                  <select
                    value={adhesiveType}
                    onChange={(e) => setAdhesiveType(e.target.value as AdhesiveType)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white font-mono text-xs focus:ring-2 focus:ring-amber-500 outline-hidden min-h-[44px]"
                  >
                    <option value="pu_two_component">Colle PU Bi-Composant (Haute Rigidité +5400N)</option>
                    <option value="hybrid_polymer">Polymère Hybride MS (+2600N)</option>
                    <option value="cyanoacrylate">Cyanoacrylate Colle Rapide (+1200N)</option>
                    <option value="none_dry">Assemblage à Sec (Déconseillé)</option>
                  </select>
                </div>
              </div>

              {/* Toggles for Alignment Cleat & Knife Count */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    playTactileClick();
                    setHasAlignmentCleat(!hasAlignmentCleat);
                  }}
                  className={`p-3 rounded-xl border flex items-center justify-between transition-all cursor-pointer min-h-[44px] ${
                    hasAlignmentCleat
                      ? 'bg-amber-950/40 border-amber-500/80 text-white'
                      : 'bg-slate-800/40 border-slate-700 text-slate-400'
                  }`}
                >
                  <span className="text-xs font-bold">Équerre d'Alignement Inox Extérieure</span>
                  <div className={`w-5 h-5 rounded-md flex items-center justify-center ${hasAlignmentCleat ? 'bg-amber-500 text-white' : 'bg-slate-700'}`}>
                    {hasAlignmentCleat && <Check className="w-3.5 h-3.5" />}
                  </div>
                </button>

                <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/60 flex items-center justify-between min-h-[44px]">
                  <span className="text-xs font-bold text-slate-300">Nombre de Couteaux par Angle :</span>
                  <div className="flex items-center gap-1">
                    {[2, 4].map((count) => (
                      <button
                        key={count}
                        type="button"
                        onClick={() => {
                          playTactileClick();
                          setCrimpKnifeCount(count);
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer min-h-[44px] ${
                          crimpKnifeCount === count
                            ? 'bg-amber-500 text-slate-900 font-black'
                            : 'bg-slate-900 text-slate-400 hover:bg-slate-800'
                        }`}
                      >
                        {count} couteaux
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: EUROCODE 9 */}
          {activeTab === 'eurocode9' && (
            <div className="space-y-4">
              {/* Metric Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/60 flex flex-col justify-between">
                  <span className="text-[11px] font-mono text-slate-400">Facteur de Sécurité Eurocode 9</span>
                  <div className="my-2">
                    <span className={`text-3xl font-black font-mono ${audit.safetyFactor >= 1.5 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {audit.safetyFactor.toFixed(2)}x
                    </span>
                    <span className="text-xs text-slate-400 ml-1">(min 1.50)</span>
                  </div>
                  <span className={`text-[10px] font-semibold ${audit.isResistanceCompliant ? 'text-emerald-300' : 'text-rose-400'}`}>
                    {audit.isResistanceCompliant ? 'Résistance validée' : 'Résistance insuffisante'}
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/60 flex flex-col justify-between">
                  <span className="text-[11px] font-mono text-slate-400">Résistance Ultime Arrachement</span>
                  <div className="my-2">
                    <span className="text-3xl font-black font-mono text-amber-400">
                      {audit.ultimatePullOutResistanceN}
                    </span>
                    <span className="text-xs text-slate-400 ml-1">N</span>
                  </div>
                  <span className="text-[10px] text-slate-400">
                    Effort agissant : {audit.pullOutForceActingN} N
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/60 flex flex-col justify-between">
                  <span className="text-[11px] font-mono text-slate-400">Flèche Diagonale d'Affaissement</span>
                  <div className="my-2">
                    <span className={`text-3xl font-black font-mono ${audit.isDeflectionAcceptable ? 'text-sky-400' : 'text-rose-400'}`}>
                      {audit.diagonalRackingDeflectionMm}
                    </span>
                    <span className="text-xs text-slate-400 ml-1">mm</span>
                  </div>
                  <span className="text-[10px] text-slate-400">
                    Limite admissible : {audit.maxAllowableDeflectionMm} mm
                  </span>
                </div>
              </div>

              {/* Bending Moment & Accidental Load Details */}
              <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/60 space-y-3">
                <span className="text-xs font-bold text-white flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Activity className="w-4 h-4 text-amber-400" />
                    <span>Sollicitations Mécaniques au Point d'Onglet (NF EN 12046-1)</span>
                  </span>
                  <span className="font-mono text-amber-300 text-xs">
                    Moment d'angle : {audit.cornerBendingMomentNm} N·m
                  </span>
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800">
                    <span className="text-slate-400 block mb-1">Charge accidentelle verticale normalisée :</span>
                    <span className="text-lg font-mono font-bold text-slate-200">
                      {audit.accidentalVerticalLoadN} N (80 kg)
                    </span>
                    <span className="text-[10px] text-slate-500 block mt-0.5">
                      Poids ouvrant + vitrage : {audit.totalSashWeightKg} kg
                    </span>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800">
                    <span className="text-slate-400 block mb-1">Apport d'adhérence colle d'onglet PU :</span>
                    <span className="text-lg font-mono font-bold text-emerald-400">
                      +{audit.adhesiveBondStrengthN} N
                    </span>
                    <span className="text-[10px] text-slate-500 block mt-0.5">
                      Surface cisaillement couteaux : {audit.crimpContactAreaMm2} mm²
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: CAD CRIMPING */}
          {activeTab === 'cad_crimping' && (
            <div className="space-y-4">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center">
                {/* SVG Technical Diagram of 45° Corner Miter Crimp */}
                <svg
                  viewBox="0 0 600 320"
                  className="w-full h-auto max-h-[300px]"
                  style={{ background: '#090d16' }}
                >
                  <defs>
                    <pattern id="crimp_grid" width="20" height="20" patternUnits="userSpaceOnUse">
                      <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#1e293b" strokeWidth="0.5" />
                    </pattern>
                  </defs>
                  <rect width="600" height="320" fill="url(#crimp_grid)" />

                  {/* 45° Miter Joint Visual */}
                  <g transform="translate(60, 20)">
                    <text x="0" y="15" fill="#f59e0b" fontSize="10" fontFamily="monospace" fontWeight="bold">
                      COUPE ONGLET 45° ET SERTISSAGE COUTEAUX
                    </text>

                    {/* Horizontal Profile Arm */}
                    <path
                      d="M 50,220 L 50,140 L 130,60 L 210,60 L 210,140 L 130,220 Z"
                      fill="#1e293b"
                      stroke="#64748b"
                      strokeWidth="1.5"
                    />

                    {/* Miter Joint Line at 45° */}
                    <line x1="50" y1="220" x2="210" y2="60" stroke="#f59e0b" strokeWidth="2" strokeDasharray="4 2" />

                    {/* Internal Corner Cleat L-Shape */}
                    <path
                      d="M 70,200 L 70,145 L 145,70 L 190,70 L 190,120 L 120,190 L 120,200 Z"
                      fill="#334155"
                      stroke="#94a3b8"
                      strokeWidth="1.2"
                    />
                    <text x="130" y="130" fill="#f1f5f9" fontSize="8" fontFamily="monospace" textAnchor="middle" fontWeight="bold">
                      ÉQUERRE ALU 6063
                    </text>

                    {/* PU Adhesive Injection Layer */}
                    {audit.adhesiveBondStrengthN > 0 && (
                      <g>
                        <path
                          d="M 52,218 L 208,62"
                          stroke="#10b981"
                          strokeWidth="3"
                          strokeOpacity="0.8"
                        />
                        <text x="145" y="170" fill="#10b981" fontSize="8" fontFamily="monospace">
                          COLLE PU
                        </text>
                      </g>
                    )}

                    {/* Crimp Punch Knives Visuals */}
                    {assemblyMethod === 'crimped_hydraulic' && (
                      <g>
                        {/* Knife 1 Top */}
                        <polygon points="140,40 150,55 130,55" fill="#f59e0b" stroke="#d97706" strokeWidth="1" />
                        <line x1="140" y1="20" x2="140" y2="40" stroke="#f59e0b" strokeWidth="2" />
                        <text x="155" y="45" fill="#f59e0b" fontSize="7" fontFamily="monospace">COUTEAU 1</text>

                        {/* Knife 2 Left */}
                        <polygon points="40,140 55,150 55,130" fill="#f59e0b" stroke="#d97706" strokeWidth="1" />
                        <line x1="20" y1="140" x2="40" y2="140" stroke="#f59e0b" strokeWidth="2" />
                        <text x="5" y="130" fill="#f59e0b" fontSize="7" fontFamily="monospace">COUTEAU 2</text>
                      </g>
                    )}

                    {/* Alignment Cleat on Outside Face */}
                    {hasAlignmentCleat && (
                      <g>
                        <rect x="124" y="56" width="12" height="8" fill="#38bdf8" stroke="#0ea5e9" strokeWidth="1" rx="1" />
                        <text x="130" y="48" fill="#38bdf8" fontSize="7" fontFamily="monospace" textAnchor="middle">
                          ALIGNEMENT INOX
                        </text>
                      </g>
                    )}
                  </g>

                  {/* Technical Specifications Panel Right */}
                  <g transform="translate(320, 20)">
                    <rect width="260" height="270" fill="#0f172a" stroke="#334155" strokeWidth="1" rx="8" />
                    <text x="16" y="24" fill="#f8fafc" fontSize="11" fontWeight="bold" fontFamily="sans-serif">
                      Paramètres d'Usinage & Sertissage
                    </text>

                    <text x="16" y="50" fill="#94a3b8" fontSize="9" fontFamily="sans-serif">
                      • Méthode : <tspan fill="#f1f5f9" fontWeight="bold">{audit.assemblySpec.name}</tspan>
                    </text>
                    <text x="16" y="70" fill="#94a3b8" fontSize="9" fontFamily="sans-serif">
                      • Équerre : <tspan fill="#f1f5f9">{audit.materialSpec.name}</tspan>
                    </text>
                    <text x="16" y="90" fill="#94a3b8" fontSize="9" fontFamily="sans-serif">
                      • Pénétration couteaux : <tspan fill="#f59e0b" fontWeight="bold">{audit.knifePenetrationMm} mm</tspan>
                    </text>
                    <text x="16" y="110" fill="#94a3b8" fontSize="9" fontFamily="sans-serif">
                      • Pression vérins : <tspan fill="#f1f5f9">{audit.effectivePunchPressureBar} bar</tspan>
                    </text>
                    <text x="16" y="130" fill="#94a3b8" fontSize="9" fontFamily="sans-serif">
                      • Résistance ultime : <tspan fill="#10b981" fontWeight="bold">{audit.ultimatePullOutResistanceN} N</tspan>
                    </text>
                    <text x="16" y="150" fill="#94a3b8" fontSize="9" fontFamily="sans-serif">
                      • Coef. sécurité : <tspan fill={audit.safetyFactor >= 1.5 ? '#10b981' : '#f43f5e'} fontWeight="bold">
                        {audit.safetyFactor.toFixed(2)}x
                      </tspan>
                    </text>
                    <text x="16" y="170" fill="#94a3b8" fontSize="9" fontFamily="sans-serif">
                      • Flèche diagonale : <tspan fill="#38bdf8">{audit.diagonalRackingDeflectionMm} mm</tspan> (max {audit.maxAllowableDeflectionMm})
                    </text>
                    <text x="16" y="190" fill="#94a3b8" fontSize="9" fontFamily="sans-serif">
                      • Désaffleurement : <tspan fill={audit.flushOffsetToleranceMm <= 0.2 ? '#10b981' : '#f59e0b'}>
                        {audit.flushOffsetToleranceMm} mm
                      </tspan>
                    </text>
                    <text x="16" y="215" fill="#64748b" fontSize="8" fontFamily="monospace">
                      Contrôle NF P 20-302 / Eurocode 9
                    </text>
                  </g>
                </svg>
              </div>

              {/* Summary Bar */}
              <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/60 flex items-center justify-between text-xs">
                <span className="text-slate-300">
                  Désaffleurement d'onglet : <strong className={audit.flushOffsetToleranceMm <= 0.2 ? 'text-emerald-400' : 'text-amber-400'}>{audit.flushOffsetToleranceMm} mm</strong> (Max NF DTU : 0.20 mm)
                </span>
                <span className="font-mono text-slate-400">
                  {hasAlignmentCleat ? 'Équerre inox active' : 'Sans équerre alignement'}
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
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                  <span>Exigences de Fabrication & Contrôle Qualité d'Onglet</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-slate-200 block">Résistance à l'Arrachement</span>
                      <span className="text-[11px] text-slate-400">
                        Facteur de sécurité &ge; 1.50 sous charge accidentelle de 800 N en pointe d'ouvrant selon NF EN 12046-1.
                      </span>
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-slate-200 block">Rigidité Diagonale L/500</span>
                      <span className="text-[11px] text-slate-400">
                        Déformation diagonale &le; 2.0 mm pour préserver l'alignement des gâches et galets de verrouillage.
                      </span>
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-slate-200 block">Étanchéité d'Onglet à 45°</span>
                      <span className="text-[11px] text-slate-400">
                        Encollage obligatoire à la colle PU bicomposant pour sceller la coupe et prévenir la corrosion filiforme.
                      </span>
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-slate-200 block">Désaffleurement &le; 0.20 mm</span>
                      <span className="text-[11px] text-slate-400">
                        Tolérance de planéité extérieure selon NF DTU 36.5 grâce aux équerres d'alignement inox en feuillure.
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quality Directives */}
              <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-800/40 space-y-2">
                <div className="flex items-center gap-2">
                  <Wrench className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-bold text-amber-300">
                    Directives de Réglage de la Sertisseuse (Recommandations SNFA)
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Avant de démarrer une série de production, vérifier la synchronisation des vérins horizontaux et verticaux. Les couteaux de sertissage doivent pénétrer franchement sans cisailler entièrement la paroi aluminium pour éviter l'affaiblissement local. Nettoyer les bavures de colle PU excédentaire sur l'onglet avec un solvant nettoyant pour aluminium thermo-laqué avant polymérisation.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="px-4 py-3 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <div className="text-[11px] font-mono text-slate-400">
            {audit.assemblySpec.name} • {audit.materialSpec.name} • Sécurité : {audit.safetyFactor.toFixed(2)}x
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
