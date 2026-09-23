import React, { useState, useMemo } from 'react';
import {
  X,
  FileCheck,
  Compass,
  Sliders,
  Activity,
  Wind,
  Droplets,
  Sun,
  ShieldCheck,
  AlertTriangle,
  RotateCw,
  Zap,
} from 'lucide-react';
import { playTactileClick, playSwitchSound, playSlideTick } from '../../utils/audioFeedback';
import {
  computeBioclimaticPergolaAudit,
  SLAT_SPECS,
  POST_SPECS,
  BEAM_SPECS,
  type PergolaTypology,
  type PergolaSlatModel,
  type PergolaPostModel,
  type PergolaBeamModel,
} from '../../utils/bioclimaticPergolaManager';
import { generateBioclimaticPergolaNoticePdf } from '../../utils/pdfGenerator';

interface BioclimaticPergolaModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialWidth?: number;
  initialLength?: number;
  initialHeight?: number;
  projectReference?: string;
  wilayaName?: string;
  clientName?: string;
}

export const BioclimaticPergolaModal: React.FC<BioclimaticPergolaModalProps> = ({
  isOpen,
  onClose,
  initialWidth = 3600,
  initialLength = 4500,
  initialHeight = 2600,
  projectReference = 'Pergola Bioclimatique 3.6x4.5m',
  wilayaName = '16 - Alger',
  clientName = 'Chantier Client',
}) => {
  const [activeTab, setActiveTab] = useState<'config' | 'structural_loads' | 'cad_slat_view' | 'hydraulics_motor'>('config');

  // Pergola Dimensions
  const [pergolaWidthMm, setPergolaWidthMm] = useState<number>(initialWidth);
  const [pergolaLengthMm, setPergolaLengthMm] = useState<number>(initialLength);
  const [pergolaHeightMm, setPergolaHeightMm] = useState<number>(initialHeight);

  // Configuration States
  const [slatAngleDegrees, setSlatAngleDegrees] = useState<number>(45);
  const [typology, setTypology] = useState<PergolaTypology>('freestanding_4_posts');
  const [slatModel, setSlatModel] = useState<PergolaSlatModel>('slat_200_reinforced');
  const [postModel, setPostModel] = useState<PergolaPostModel>('post_150x150');
  const [beamModel, setBeamModel] = useState<PergolaBeamModel>('beam_240x120');

  // Climatic Actions
  const [snowLoadKnM2, setSnowLoadKnM2] = useState<number>(0.25);
  const [windDynamicPressurePa, setWindDynamicPressurePa] = useState<number>(475);
  const [rainIntensityMmH, setRainIntensityMmH] = useState<number>(150);

  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  // Audit Calculations
  const audit = useMemo(() => {
    return computeBioclimaticPergolaAudit({
      pergolaWidthMm,
      pergolaLengthMm,
      pergolaHeightMm,
      slatAngleDegrees,
      typology,
      slatModel,
      postModel,
      beamModel,
      snowLoadKnM2,
      windDynamicPressurePa,
      rainIntensityMmH,
      wilayaName,
      clientName,
      projectReference,
    });
  }, [
    pergolaWidthMm,
    pergolaLengthMm,
    pergolaHeightMm,
    slatAngleDegrees,
    typology,
    slatModel,
    postModel,
    beamModel,
    snowLoadKnM2,
    windDynamicPressurePa,
    rainIntensityMmH,
    wilayaName,
    clientName,
    projectReference,
  ]);

  if (!isOpen) return null;

  const handleExportPdf = async () => {
    playTactileClick();
    setIsGeneratingPdf(true);
    try {
      const docId = `PERG-${Date.now().toString().slice(-6)}`;
      await generateBioclimaticPergolaNoticePdf({
        documentId: docId,
        projectRef: projectReference,
        clientName,
        wilayaName,
        input: {
          pergolaWidthMm,
          pergolaLengthMm,
          pergolaHeightMm,
          slatAngleDegrees,
          typology,
          slatModel,
          postModel,
          beamModel,
          snowLoadKnM2,
          windDynamicPressurePa,
          rainIntensityMmH,
          wilayaName,
          clientName,
          projectReference,
        },
        audit,
      });
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 w-full max-w-4xl max-h-[92vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-100 font-sans">
        
        {/* Header Bar */}
        <div className="px-4 py-3 bg-gradient-to-r from-teal-950/70 via-slate-900 to-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-teal-500/15 text-teal-400 border border-teal-500/30">
              <Sun className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <span>Pergola Bioclimatique à Lames Orientables</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30 font-mono">
                  Eurocode 9 / RNV 2013
                </span>
              </h2>
              <p className="text-[11px] text-slate-400">
                Statique vent et neige, drainage pluvial chéneau et vérin motorisé
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportPdf}
              disabled={isGeneratingPdf}
              className="min-h-[44px] px-3.5 py-1.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 transition-all shadow-md active:scale-95 disabled:opacity-50 cursor-pointer"
              title="Générer la notice technique complète en PDF"
            >
              <FileCheck className="w-4 h-4" />
              <span className="hidden sm:inline">{isGeneratingPdf ? 'Génération...' : 'Notice PDF'}</span>
            </button>

            <button
              onClick={() => {
                playTactileClick();
                onClose();
              }}
              className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Global KPI Banner */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-3 bg-slate-950/60 border-b border-slate-800/80 text-xs font-mono">
          <div className="bg-slate-900/90 p-2 rounded-lg border border-slate-800">
            <span className="text-slate-400 block text-[10px]">Surface & Poids</span>
            <strong className="text-teal-400 text-sm">{audit.roofAreaM2} m²</strong>
            <span className="text-[10px] text-slate-400 block">{audit.totalStructureWeightKg} kg total</span>
          </div>

          <div className="bg-slate-900/90 p-2 rounded-lg border border-slate-800">
            <span className="text-slate-400 block text-[10px]">Flèche Lames (EC9)</span>
            <strong className={audit.isSlatDeflectionCompliant ? 'text-emerald-400 text-sm' : 'text-rose-400 text-sm'}>
              {audit.slatDeflectionMm} mm
            </strong>
            <span className="text-[10px] text-slate-400 block">Max admis : {audit.slatAllowableDeflectionMm} mm</span>
          </div>

          <div className="bg-slate-900/90 p-2 rounded-lg border border-slate-800">
            <span className="text-slate-400 block text-[10px]">Traction Vent RNV</span>
            <strong className="text-amber-400 text-sm">{audit.anchorTensionDan} daN</strong>
            <span className="text-[10px] text-slate-400 block">Par poteau ({audit.netUpliftForceKn} kN tot)</span>
          </div>

          <div className="bg-slate-900/90 p-2 rounded-lg border border-slate-800">
            <span className="text-slate-400 block text-[10px]">Drainage Pluvial</span>
            <strong className={audit.isDrainageCompliant ? 'text-emerald-400 text-sm' : 'text-rose-400 text-sm'}>
              x{audit.hydraulicSafetyRatio}
            </strong>
            <span className="text-[10px] text-slate-400 block">
              {audit.isDrainageCompliant ? 'Débit sécurisé' : 'Risque débordement'}
            </span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 bg-slate-950/40 px-3 overflow-x-auto">
          <button
            onClick={() => {
              playSwitchSound();
              setActiveTab('config');
            }}
            className={`min-h-[44px] px-4 py-2.5 text-xs font-medium border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'config'
                ? 'border-teal-500 text-teal-400 bg-teal-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sliders className="w-4 h-4" />
            Dimensions & Profilés
          </button>

          <button
            onClick={() => {
              playSwitchSound();
              setActiveTab('structural_loads');
            }}
            className={`min-h-[44px] px-4 py-2.5 text-xs font-medium border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'structural_loads'
                ? 'border-teal-500 text-teal-400 bg-teal-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Activity className="w-4 h-4" />
            Statique & Soulèvement
          </button>

          <button
            onClick={() => {
              playSwitchSound();
              setActiveTab('cad_slat_view');
            }}
            className={`min-h-[44px] px-4 py-2.5 text-xs font-medium border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'cad_slat_view'
                ? 'border-teal-500 text-teal-400 bg-teal-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Compass className="w-4 h-4" />
            Coupe CAD Lames & Chéneau
          </button>

          <button
            onClick={() => {
              playSwitchSound();
              setActiveTab('hydraulics_motor');
            }}
            className={`min-h-[44px] px-4 py-2.5 text-xs font-medium border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'hydraulics_motor'
                ? 'border-teal-500 text-teal-400 bg-teal-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Droplets className="w-4 h-4" />
            Hydraulique & Vérin
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 overflow-y-auto flex-1 space-y-4">
          
          {/* TAB 1: DIMENSIONS & PROFILES */}
          {activeTab === 'config' && (
            <div className="space-y-4">
              
              {/* Dimensions Section */}
              <div className="bg-slate-800/60 border border-slate-700/80 rounded-xl p-4 space-y-3">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-teal-400" />
                  Dimensions Générales de la Toiture (mm)
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">
                      Largeur (Portée Lames) : {pergolaWidthMm} mm
                    </label>
                    <input
                      type="range"
                      min="2500"
                      max="6500"
                      step="50"
                      value={pergolaWidthMm}
                      onChange={(e) => {
                        playSlideTick();
                        setPergolaWidthMm(parseInt(e.target.value));
                      }}
                      className="w-full accent-teal-500 cursor-pointer min-h-[44px]"
                    />
                    <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                      <span>2.5 m</span>
                      <span className="text-teal-400 font-bold">{(pergolaWidthMm / 1000).toFixed(2)} m</span>
                      <span>6.5 m</span>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-slate-400 block mb-1">
                      Longueur (Avancée Poutre) : {pergolaLengthMm} mm
                    </label>
                    <input
                      type="range"
                      min="2500"
                      max="7500"
                      step="50"
                      value={pergolaLengthMm}
                      onChange={(e) => {
                        playSlideTick();
                        setPergolaLengthMm(parseInt(e.target.value));
                      }}
                      className="w-full accent-teal-500 cursor-pointer min-h-[44px]"
                    />
                    <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                      <span>2.5 m</span>
                      <span className="text-teal-400 font-bold">{(pergolaLengthMm / 1000).toFixed(2)} m</span>
                      <span>7.5 m</span>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-slate-400 block mb-1">
                      Hauteur sous poutre : {pergolaHeightMm} mm
                    </label>
                    <input
                      type="range"
                      min="2200"
                      max="3500"
                      step="50"
                      value={pergolaHeightMm}
                      onChange={(e) => {
                        playSlideTick();
                        setPergolaHeightMm(parseInt(e.target.value));
                      }}
                      className="w-full accent-teal-500 cursor-pointer min-h-[44px]"
                    />
                    <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                      <span>2.2 m</span>
                      <span className="text-teal-400 font-bold">{(pergolaHeightMm / 1000).toFixed(2)} m</span>
                      <span>3.5 m</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Typology and Profiles Grid */}
              <div className="bg-slate-800/60 border border-slate-700/80 rounded-xl p-4 space-y-4">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-teal-400" />
                  Sélection des Profilés & Typologie de Pose
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Typologie d Implantation</label>
                    <select
                      value={typology}
                      onChange={(e) => {
                        playTactileClick();
                        setTypology(e.target.value as PergolaTypology);
                      }}
                      className="min-h-[44px] w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-xs focus:border-teal-500 focus:outline-none cursor-pointer"
                    >
                      <option value="freestanding_4_posts">Autoportée 4 Poteaux Indépendante (Terrasse / Jardin)</option>
                      <option value="wall_mounted_2_posts">Adossée Façade 2 Poteaux (Fixation murale sablière)</option>
                      <option value="between_walls_no_posts">Entre Murs sans Poteaux (Toiture suspendue encastrée)</option>
                      <option value="double_bay_6_posts">Double Baie Couplée 6 Poteaux (Grande surface restaurant)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Modèle de Lame Orientable</label>
                    <select
                      value={slatModel}
                      onChange={(e) => {
                        playTactileClick();
                        setSlatModel(e.target.value as PergolaSlatModel);
                      }}
                      className="min-h-[44px] w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-xs focus:border-teal-500 focus:outline-none cursor-pointer"
                    >
                      {Object.values(SLAT_SPECS).map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.labelFr} (Ix={s.momentOfInertiaIxCm4} cm4, Max {s.maxRecommendedSpanM}m)
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Modèle de Sablière Chéneau Intégré</label>
                    <select
                      value={beamModel}
                      onChange={(e) => {
                        playTactileClick();
                        setBeamModel(e.target.value as PergolaBeamModel);
                      }}
                      className="min-h-[44px] w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-xs focus:border-teal-500 focus:outline-none cursor-pointer"
                    >
                      {Object.values(BEAM_SPECS).map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.labelFr} (Chéneau {b.gutterWidthMm}x{b.gutterDepthMm} mm)
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Modèle de Poteau & Descente Pluviale</label>
                    <select
                      value={postModel}
                      onChange={(e) => {
                        playTactileClick();
                        setPostModel(e.target.value as PergolaPostModel);
                      }}
                      className="min-h-[44px] w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-xs focus:border-teal-500 focus:outline-none cursor-pointer"
                    >
                      {Object.values(POST_SPECS).map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.labelFr} (Tube descente dia {p.internalDownspoutDiameterMm} mm)
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: STRUCTURAL LOADS & UPLIFT */}
          {activeTab === 'structural_loads' && (
            <div className="space-y-4">
              
              {/* Climatic Loads Controls */}
              <div className="bg-slate-800/60 border border-slate-700/80 rounded-xl p-4 space-y-3">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <Wind className="w-4 h-4 text-teal-400" />
                  Paramètres Climatiques Locaux (CNERIB RNV 2013 / Eurocode 1)
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">
                      Pression vent dynamique : {windDynamicPressurePa} Pa
                    </label>
                    <input
                      type="range"
                      min="350"
                      max="850"
                      step="25"
                      value={windDynamicPressurePa}
                      onChange={(e) => {
                        playSlideTick();
                        setWindDynamicPressurePa(parseInt(e.target.value));
                      }}
                      className="w-full accent-teal-500 cursor-pointer min-h-[44px]"
                    />
                    <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                      <span>Zone I (375)</span>
                      <span>Zone II (475)</span>
                      <span>Zone IV (750)</span>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-slate-400 block mb-1">
                      Charge de neige : {snowLoadKnM2} kN/m² ({(snowLoadKnM2 * 100).toFixed(0)} daN/m²)
                    </label>
                    <input
                      type="range"
                      min="0.00"
                      max="1.20"
                      step="0.05"
                      value={snowLoadKnM2}
                      onChange={(e) => {
                        playSlideTick();
                        setSnowLoadKnM2(parseFloat(e.target.value));
                      }}
                      className="w-full accent-teal-500 cursor-pointer min-h-[44px]"
                    />
                    <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                      <span>Plaine (0.0)</span>
                      <span>Plateaux (0.4)</span>
                      <span>Atlas (1.2)</span>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-slate-400 block mb-1">
                      Averse orageuse : {rainIntensityMmH} mm/h
                    </label>
                    <input
                      type="range"
                      min="60"
                      max="240"
                      step="10"
                      value={rainIntensityMmH}
                      onChange={(e) => {
                        playSlideTick();
                        setRainIntensityMmH(parseInt(e.target.value));
                      }}
                      className="w-full accent-teal-500 cursor-pointer min-h-[44px]"
                    />
                    <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                      <span>Standard (90)</span>
                      <span>Orage (150)</span>
                      <span>Déluge (240)</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stress & Deflection Audit Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-slate-800/70 border border-slate-700 rounded-xl p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">Résistance des Lames (Eurocode 9)</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold ${
                      audit.isSlatStressCompliant ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                    }`}>
                      {audit.isSlatStressCompliant ? 'Contrainte Validée' : 'Dépassement ELU'}
                    </span>
                  </div>
                  <div className="text-xs text-slate-300 space-y-1 font-mono">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Moment fléchissant Mmax :</span>
                      <strong>{audit.slatMomentMaxNm} N.m</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Contrainte de flexion sigma :</span>
                      <strong>{audit.slatBendingStressMpa} MPa / 145.5 MPa</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Flèche sous charges (ELS) :</span>
                      <strong className={audit.isSlatDeflectionCompliant ? 'text-emerald-400' : 'text-rose-400'}>
                        {audit.slatDeflectionMm} mm (Limite {audit.slatAllowableDeflectionMm} mm)
                      </strong>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-800/70 border border-slate-700 rounded-xl p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">Sablière Porteuse & Chéneau</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold ${
                      audit.isBeamDeflectionCompliant ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                    }`}>
                      {audit.isBeamDeflectionCompliant ? 'Flèche Validée' : 'Poutre trop souple'}
                    </span>
                  </div>
                  <div className="text-xs text-slate-300 space-y-1 font-mono">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Moment fléchissant Mmax :</span>
                      <strong>{audit.beamMomentMaxNm} N.m</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Contrainte de flexion sigma :</span>
                      <strong>{audit.beamBendingStressMpa} MPa / 145.5 MPa</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Flèche sablière (ELS L/300) :</span>
                      <strong className={audit.isBeamDeflectionCompliant ? 'text-emerald-400' : 'text-rose-400'}>
                        {audit.beamDeflectionMm} mm (Limite {audit.beamAllowableDeflectionMm} mm)
                      </strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* Wind Uplift & Footing Anchors */}
              <div className="bg-slate-800/60 border border-slate-700/80 rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                    Vérification du Soulèvement au Vent & Platines Sol (RNV 2013)
                  </h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
                  <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">Aspiration Nette Totale</span>
                    <strong className="text-amber-300 text-sm">{audit.netUpliftForceKn} kN</strong>
                    <span className="text-[10px] text-slate-500 block">Poids propre favorable déduit</span>
                  </div>

                  <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">Traction par Platine</span>
                    <strong className="text-amber-300 text-sm">{audit.anchorTensionDan} daN</strong>
                    <span className="text-[10px] text-slate-500 block">Sur {audit.postCount} poteaux</span>
                  </div>

                  <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">Lestage Recommandé</span>
                    <strong className="text-teal-400 text-sm">{audit.recommendedBallastPerPostKg} kg</strong>
                    <span className="text-[10px] text-slate-500 block">Si pose sans scellement dalle</span>
                  </div>
                </div>

                <p className="text-[11px] text-slate-300 leading-relaxed bg-slate-950/40 p-2.5 rounded-lg border border-slate-800">
                  <strong className="text-teal-400">Prescription Ancrage : </strong>
                  {audit.recommendedAnchorBolts}
                </p>
              </div>
            </div>
          )}

          {/* TAB 3: CAD DYNAMIC SLAT & GUTTER CROSS SECTION */}
          {activeTab === 'cad_slat_view' && (
            <div className="space-y-4">
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col items-center">
                
                {/* Slat Angle Controller Bar */}
                <div className="w-full max-w-lg mb-4 space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <RotateCw className="w-3.5 h-3.5 text-teal-400" />
                      Orientation des Lames : <strong className="text-white">{slatAngleDegrees}°</strong>
                    </span>
                    <span className="text-teal-400 font-bold">
                      {slatAngleDegrees === 0 && 'Fermé étanche (Pluie)'}
                      {slatAngleDegrees > 0 && slatAngleDegrees <= 60 && 'Ombrage & ventilation'}
                      {slatAngleDegrees > 60 && slatAngleDegrees <= 100 && 'Luminosité zénithale max'}
                      {slatAngleDegrees > 100 && 'Tirage thermique venturi'}
                    </span>
                  </div>

                  <input
                    type="range"
                    min="0"
                    max="135"
                    step="5"
                    value={slatAngleDegrees}
                    onChange={(e) => {
                      playSlideTick();
                      setSlatAngleDegrees(parseInt(e.target.value));
                    }}
                    className="w-full accent-teal-500 cursor-pointer min-h-[44px]"
                  />

                  {/* Preset Buttons */}
                  <div className="grid grid-cols-4 gap-1.5 pt-1">
                    {[
                      { label: '0° Fermé', val: 0 },
                      { label: '45° Ombre', val: 45 },
                      { label: '90° Zénith', val: 90 },
                      { label: '135° Venturi', val: 135 },
                    ].map((btn) => (
                      <button
                        key={btn.val}
                        type="button"
                        onClick={() => {
                          playTactileClick();
                          setSlatAngleDegrees(btn.val);
                        }}
                        className={`min-h-[44px] py-1 text-[11px] font-mono rounded-lg border transition-all cursor-pointer ${
                          slatAngleDegrees === btn.val
                            ? 'bg-teal-500 text-slate-950 font-bold border-teal-400'
                            : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                        }`}
                      >
                        {btn.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* SVG Live Simulation */}
                <div className="w-full overflow-x-auto flex justify-center py-2">
                  <svg
                    viewBox="0 0 700 280"
                    className="w-full max-w-2xl h-auto bg-slate-900 rounded-xl border border-slate-800 shadow-inner"
                  >
                    <defs>
                      {/* Sun ray gradient */}
                      <linearGradient id="sunRayGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.8" />
                        <stop offset="100%" stopColor="#F59E0B" stopOpacity="0.05" />
                      </linearGradient>

                      {/* Aluminum metallic gradient */}
                      <linearGradient id="aluBeamGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#64748B" />
                        <stop offset="50%" stopColor="#94A3B8" />
                        <stop offset="100%" stopColor="#475569" />
                      </linearGradient>
                    </defs>

                    {/* Background Sky / Sun Indicator */}
                    <circle cx="120" cy="40" r="22" fill="#FBBF24" opacity="0.9" />
                    <text x="120" y="44" fill="#0F172A" fontSize="10" fontWeight="bold" textAnchor="middle">
                      Soleil
                    </text>

                    {/* Sun Rays penetrating or blocked */}
                    {slatAngleDegrees > 15 && (
                      <g opacity={Math.min(1, slatAngleDegrees / 90)}>
                        <line x1="120" y1="65" x2="200" y2="210" stroke="#FBBF24" strokeWidth="2" strokeDasharray="4 4" />
                        <line x1="160" y1="65" x2="280" y2="210" stroke="#FBBF24" strokeWidth="2" strokeDasharray="4 4" />
                        <line x1="200" y1="65" x2="360" y2="210" stroke="#FBBF24" strokeWidth="2" strokeDasharray="4 4" />
                        <line x1="240" y1="65" x2="440" y2="210" stroke="#FBBF24" strokeWidth="2" strokeDasharray="4 4" />
                      </g>
                    )}

                    {/* Rain droplets when 0° */}
                    {slatAngleDegrees === 0 && (
                      <g opacity="0.85">
                        {[160, 210, 260, 310, 360, 410, 460, 510].map((rx) => (
                          <g key={rx}>
                            <line
                              x1={rx}
                              y1="25"
                              x2={rx - 10}
                              y2="90"
                              stroke="#38BDF8"
                              strokeWidth="1.8"
                              strokeDasharray="5 3"
                            />
                            <circle cx={rx - 10} cy="95" r="2" fill="#38BDF8" />
                          </g>
                        ))}
                      </g>
                    )}

                    {/* Perimeter Gutter Beam Left */}
                    <rect x="30" y="85" width="70" height="110" rx="3" fill="url(#aluBeamGrad)" stroke="#334155" strokeWidth="1.5" />
                    <rect x="38" y="93" width="54" height="80" rx="2" fill="#0F172A" />
                    {/* Water flow inside left gutter */}
                    <rect x="38" y="150" width="54" height="23" fill="#0284C7" opacity="0.75" />
                    <text x="65" y="140" fill="#38BDF8" fontSize="8" fontWeight="bold" textAnchor="middle">
                      Chéneau
                    </text>

                    {/* Downspout inside Post Left */}
                    <rect x="35" y="195" width="60" height="75" fill="#334155" />
                    <rect x="52" y="195" width="26" height="75" fill="#0284C7" opacity="0.4" />
                    <text x="65" y="240" fill="#94A3B8" fontSize="7.5" textAnchor="middle">
                      Descente Ø{POST_SPECS[postModel].internalDownspoutDiameterMm}
                    </text>

                    {/* Perimeter Gutter Beam Right */}
                    <rect x="580" y="85" width="70" height="110" rx="3" fill="url(#aluBeamGrad)" stroke="#334155" strokeWidth="1.5" />
                    <rect x="588" y="93" width="54" height="80" rx="2" fill="#0F172A" />
                    <rect x="588" y="150" width="54" height="23" fill="#0284C7" opacity="0.75" />

                    {/* Bioclimatic Rotating Slats (Array of 4 slats) */}
                    {[175, 275, 375, 475].map((cx) => {
                      return (
                        <g
                          key={cx}
                          transform={`translate(${cx}, 125) rotate(${-slatAngleDegrees})`}
                          style={{ transition: 'transform 0.4s ease-out' }}
                        >
                          {/* Slat Main Profile Wing */}
                          <path
                            d="M -48 -6 C -20 -14, 20 -14, 48 -6 C 52 -4, 52 4, 48 6 C 20 14, -20 14, -48 6 C -52 4, -52 -4, -48 -6 Z"
                            fill="#0D9488"
                            stroke="#5EEAD4"
                            strokeWidth="1.6"
                          />
                          {/* Internal Stiffener Web */}
                          <line x1="-20" y1="-8" x2="-20" y2="8" stroke="#115E59" strokeWidth="1.2" />
                          <line x1="20" y1="-8" x2="20" y2="8" stroke="#115E59" strokeWidth="1.2" />
                          {/* EPDM Gasket Lip on Right Edge */}
                          <circle cx="48" cy="0" r="3.5" fill="#0F172A" stroke="#38BDF8" strokeWidth="1" />
                          {/* Center Pivot Pin */}
                          <circle cx="0" cy="0" r="4.5" fill="#D4AF37" stroke="#0F172A" strokeWidth="1.5" />
                        </g>
                      );
                    })}

                    {/* Driving Rod Synchronisation Bar */}
                    <line
                      x1="175"
                      y1={125 - Math.sin((slatAngleDegrees * Math.PI) / 180) * 22}
                      x2="475"
                      y2={125 - Math.sin((slatAngleDegrees * Math.PI) / 180) * 22}
                      stroke="#94A3B8"
                      strokeWidth="2.5"
                      strokeDasharray="2 2"
                    />

                    {/* Legend / Annotations */}
                    <text x="350" y="265" fill="#64748B" fontSize="9" textAnchor="middle" fontFamily="monospace">
                      Coupe transversale des lames aluminium 6060 T6 • Rotation synchronisée 0° à 135°
                    </text>
                  </svg>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: HYDRAULICS & ACTUATOR MOTOR */}
          {activeTab === 'hydraulics_motor' && (
            <div className="space-y-4">
              
              {/* Rain Evacuation Section */}
              <div className="bg-slate-800/60 border border-slate-700/80 rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <Droplets className="w-4 h-4 text-teal-400" />
                  <h3 className="text-sm font-semibold text-white">
                    Bilan Hydraulique d Évacuation Pluviale (NF EN 12056-3)
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
                  <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">Débit d Orage Collecté</span>
                    <strong className="text-white text-base">{audit.stormFlowLiterPerSec} L/s</strong>
                    <span className="text-[10px] text-slate-500 block">Sur {audit.roofAreaM2} m² à {rainIntensityMmH} mm/h</span>
                  </div>

                  <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">Capacité Chéneaux Sablières</span>
                    <strong className="text-teal-400 text-base">{audit.gutterEvacuationCapacityLiterPerSec} L/s</strong>
                    <span className="text-[10px] text-slate-500 block">Pente interne 0.5% (2 chéneaux)</span>
                  </div>

                  <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">Débit Descentes Poteaux</span>
                    <strong className="text-cyan-400 text-base">{audit.downspoutCapacityLiterPerSec} L/s</strong>
                    <span className="text-[10px] text-slate-500 block">{audit.downspoutCount} tubes Ø{POST_SPECS[postModel].internalDownspoutDiameterMm} mm</span>
                  </div>
                </div>

                <div className={`p-3 rounded-xl border text-xs font-mono flex items-center justify-between ${
                  audit.isDrainageCompliant ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-300' : 'bg-rose-500/10 border-rose-500/25 text-rose-300'
                }`}>
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 shrink-0" />
                    <span>Coefficient de sécurité pluviale : <strong>x{audit.hydraulicSafetyRatio}</strong></span>
                  </div>
                  <span className="font-bold">{audit.isDrainageCompliant ? '100% Conforme' : 'Risque Débordement'}</span>
                </div>
              </div>

              {/* Linear Actuator & Automation Motor */}
              <div className="bg-slate-800/60 border border-slate-700/80 rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-400" />
                  <h3 className="text-sm font-semibold text-white">
                    Motorisation & Vérin Linéaire Électrique 24V CC
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
                  <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">Force de Poussée Requise</span>
                    <strong className="text-white text-base">{audit.actuatorPushForceN} N</strong>
                    <span className="text-[10px] text-slate-500 block">Frottements + traînée vent</span>
                  </div>

                  <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">Vérin Recommandé</span>
                    <strong className="text-amber-400 text-base">{audit.recommendedActuatorRatingN} N</strong>
                    <span className="text-[10px] text-slate-500 block">Moteur tubulaire étanche IP66</span>
                  </div>

                  <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">Course Utile & Vitesse</span>
                    <strong className="text-teal-400 text-base">{audit.actuatorStrokeMm} mm</strong>
                    <span className="text-[10px] text-slate-500 block">{audit.operatingSpeedSeconds} s pour 0° à 135°</span>
                  </div>
                </div>

                <div className="text-[11px] text-slate-400 space-y-1 bg-slate-950/40 p-3 rounded-xl border border-slate-800">
                  <div className="flex items-center gap-2 text-slate-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-400" />
                    <span><strong>Capteur de pluie : </strong>Fermeture automatique d urgence dès les premières gouttes.</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                    <span><strong>Anémomètre vent fort : </strong>Ouverture automatique de sécurité à 45° si vent &gt; 50 km/h pour délester l aspiration.</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-4 py-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          <div className="text-[11px] text-slate-400 font-mono hidden sm:block">
            {audit.slatCount} lames ({audit.slatLengthMm} mm) • Poteaux {audit.postCount}u • Sablières {audit.beamLengthMm} mm
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={() => {
                playTactileClick();
                onClose();
              }}
              className="min-h-[44px] px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
            >
              Fermer
            </button>

            <button
              onClick={handleExportPdf}
              disabled={isGeneratingPdf}
              className="min-h-[44px] px-4 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 transition-all shadow-md active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              <FileCheck className="w-4 h-4" />
              <span>{isGeneratingPdf ? 'Génération du PDF...' : 'Télécharger Attestation (PDF)'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
