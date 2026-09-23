import React, { useState, useMemo } from 'react';
import {
  X,
  FileCheck,
  Sliders,
  Layers,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  ArrowRight,
  Maximize2,
  SplitSquareVertical,
} from 'lucide-react';
import { playTactileClick, playSwitchSound, playSlideTick } from '../../utils/audioFeedback';
import {
  computeTransomDeadLoadAudit,
  TRANSOM_PROFILE_SPECS,
  SETTING_BLOCK_SPECS,
  type TransomProfileModelType,
  type SettingBlockMaterialType,
} from '../../utils/transomDeadLoadManager';
import { generateTransomDeadLoadNoticePdf } from '../../utils/pdfGenerator';

interface TransomDeadLoadModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialWidth?: number;
  initialHeight?: number;
  initialGlassThickness?: number;
  projectReference?: string;
  wilayaName?: string;
  clientName?: string;
}

export const TransomDeadLoadModal: React.FC<TransomDeadLoadModalProps> = ({
  isOpen,
  onClose,
  initialWidth = 1500,
  initialHeight = 1800,
  initialGlassThickness = 8,
  projectReference = 'Traverse Intermédiaire',
  wilayaName = '16 - Alger',
  clientName = 'Particulier',
}) => {
  const [activeTab, setActiveTab] = useState<'config' | 'deflection' | 'cad_view' | 'setting_dtu39'>('config');

  // Input states
  const [transomLengthMm, setTransomLengthMm] = useState<number>(initialWidth);
  const [glassHeightMm, setGlassHeightMm] = useState<number>(initialHeight);
  const [glassThicknessMm, setGlassThicknessMm] = useState<number>(initialGlassThickness || 8);
  const [transomProfileModel, setTransomProfileModel] = useState<TransomProfileModelType>('transom_50_80_reinforced');
  const [settingBlockDistanceMm, setSettingBlockDistanceMm] = useState<number>(Math.round(initialWidth / 10));
  const [settingBlockLengthMm, setSettingBlockLengthMm] = useState<number>(100);
  const [settingBlockMaterial, setSettingBlockMaterial] = useState<SettingBlockMaterialType>('epdm_dense_80sh');
  const [hasAntiTorsionBracket, setHasAntiTorsionBracket] = useState<boolean>(true);

  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  // Compute audit
  const audit = useMemo(() => {
    return computeTransomDeadLoadAudit({
      transomLengthMm,
      glassHeightMm,
      glassThicknessMm,
      transomProfileModel,
      settingBlockDistanceMm,
      settingBlockLengthMm,
      settingBlockMaterial,
      hasAntiTorsionBracket,
      wilayaName,
      clientName,
      projectReference,
    });
  }, [
    transomLengthMm,
    glassHeightMm,
    glassThicknessMm,
    transomProfileModel,
    settingBlockDistanceMm,
    settingBlockLengthMm,
    settingBlockMaterial,
    hasAntiTorsionBracket,
    wilayaName,
    clientName,
    projectReference,
  ]);

  if (!isOpen) return null;

  const currentProfile = TRANSOM_PROFILE_SPECS[transomProfileModel];
  const currentBlock = SETTING_BLOCK_SPECS[settingBlockMaterial];

  const handleExportPdf = async () => {
    playTactileClick();
    setIsGeneratingPdf(true);
    try {
      const docId = `TRA-${Date.now().toString().slice(-6)}`;
      await generateTransomDeadLoadNoticePdf({
        documentId: docId,
        projectRef: projectReference,
        clientName,
        wilayaName,
        input: {
          transomLengthMm,
          glassHeightMm,
          glassThicknessMm,
          transomProfileModel,
          settingBlockDistanceMm,
          settingBlockLengthMm,
          settingBlockMaterial,
          hasAntiTorsionBracket,
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
        <div className="px-4 py-3 bg-gradient-to-r from-blue-950/80 via-slate-900 to-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-500/15 text-blue-400 border border-blue-500/30">
              <SplitSquareVertical className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <span>Calage d Assise & Déformation de Traverse</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 font-mono">
                  NF DTU 39 / NF EN 13830 / CSTB 3220
                </span>
              </h2>
              <p className="text-[11px] text-slate-400">
                Poids propre du vitrage sous gravité, flèche limite L/500, étriers anti-torsion et drainage
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportPdf}
              disabled={isGeneratingPdf}
              className="min-h-[44px] px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-md active:scale-95 disabled:opacity-50 cursor-pointer"
              title="Générer l attestation officielle en PDF"
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
            <span className="text-slate-400 block text-[10px]">Masse Vitrage</span>
            <strong className="text-white text-sm">{audit.glassWeightKg} kg</strong>
            <span className="text-[10px] text-blue-400 block">{audit.glassAreaM2} m² • {audit.glassWeightN} N</span>
          </div>

          <div className="bg-slate-900/90 p-2 rounded-lg border border-slate-800">
            <span className="text-slate-400 block text-[10px]">Flèche Traverse (Iy)</span>
            <strong className={audit.isDeflectionCompliant ? 'text-emerald-400 text-sm' : 'text-rose-400 text-sm'}>
              {audit.deflectionActualMm} mm
            </strong>
            <span className="text-[10px] text-slate-400 block">
              Max : {audit.deflectionLimitEffectiveMm} mm ({audit.deflectionRatioPercent}%)
            </span>
          </div>

          <div className="bg-slate-900/90 p-2 rounded-lg border border-slate-800">
            <span className="text-slate-400 block text-[10px]">Cale d Assise (x2)</span>
            <strong className={audit.isPressureCompliant ? 'text-emerald-400 text-sm' : 'text-rose-400 text-sm'}>
              {audit.loadPerSettingBlockKg} kg / cale
            </strong>
            <span className="text-[10px] text-slate-400 block">Pression : {audit.contactPressureMpa} MPa</span>
          </div>

          <div className="bg-slate-900/90 p-2 rounded-lg border border-slate-800">
            <span className="text-slate-400 block text-[10px]">Torsion & Drainage</span>
            <strong className={(!audit.isAntiTorsionRequired || hasAntiTorsionBracket) ? 'text-emerald-400 text-sm' : 'text-amber-400 text-sm'}>
              {hasAntiTorsionBracket ? 'Étriers Installés' : (audit.isAntiTorsionRequired ? 'Étriers Requis' : 'Stable')}
            </strong>
            <span className="text-[10px] text-slate-400 block">Couple : {audit.torsionMomentNm} N.m</span>
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
                ? 'border-blue-500 text-blue-400 bg-blue-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sliders className="w-4 h-4" />
            Traverse & Vitrage
          </button>

          <button
            onClick={() => {
              playSwitchSound();
              setActiveTab('deflection');
            }}
            className={`min-h-[44px] px-4 py-2.5 text-xs font-medium border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'deflection'
                ? 'border-blue-500 text-blue-400 bg-blue-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Maximize2 className="w-4 h-4" />
            Déformation & Rigidité (NF EN 13830)
          </button>

          <button
            onClick={() => {
              playSwitchSound();
              setActiveTab('cad_view');
            }}
            className={`min-h-[44px] px-4 py-2.5 text-xs font-medium border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'cad_view'
                ? 'border-blue-500 text-blue-400 bg-blue-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-4 h-4" />
            Schéma 2D CAD Dynamique
          </button>

          <button
            onClick={() => {
              playSwitchSound();
              setActiveTab('setting_dtu39');
            }}
            className={`min-h-[44px] px-4 py-2.5 text-xs font-medium border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'setting_dtu39'
                ? 'border-blue-500 text-blue-400 bg-blue-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            Cales d Assise & Torsion DTU 39
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">

          {/* TAB 1: CONFIGURATION */}
          {activeTab === 'config' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              
              {/* Geometry Controls */}
              <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/60 space-y-3">
                <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-blue-400" />
                  1. Dimensions de la Traverse et du Vitrage Supérieur
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Transom length */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-300">Portée libre de la traverse (L) :</span>
                      <span className="font-mono text-blue-400 font-bold">{transomLengthMm} mm</span>
                    </div>
                    <input
                      type="range"
                      min={600}
                      max={3500}
                      step={25}
                      value={transomLengthMm}
                      onChange={(e) => {
                        playSlideTick();
                        const val = Number(e.target.value);
                        setTransomLengthMm(val);
                        // Default block distance to L/10
                        setSettingBlockDistanceMm(Math.round(val / 10));
                      }}
                      className="w-full accent-blue-500 cursor-pointer h-2 bg-slate-700 rounded-lg"
                    />
                    <div className="flex justify-between text-[10px] text-slate-500">
                      <span>600 mm</span>
                      <span>1500 mm (standard)</span>
                      <span>3500 mm (monumental)</span>
                    </div>
                  </div>

                  {/* Glass height */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-300">Hauteur du vitrage reposant (H) :</span>
                      <span className="font-mono text-blue-400 font-bold">{glassHeightMm} mm</span>
                    </div>
                    <input
                      type="range"
                      min={500}
                      max={3200}
                      step={25}
                      value={glassHeightMm}
                      onChange={(e) => {
                        playSlideTick();
                        setGlassHeightMm(Number(e.target.value));
                      }}
                      className="w-full accent-blue-500 cursor-pointer h-2 bg-slate-700 rounded-lg"
                    />
                    <div className="flex justify-between text-[10px] text-slate-500">
                      <span>500 mm (imposte)</span>
                      <span>1800 mm</span>
                      <span>3200 mm (étage complet)</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Profile & Glazing Thickness */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Transom Profile Model */}
                <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/60 space-y-2">
                  <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                    Profilé Aluminium de Traverse
                  </h4>
                  <div className="space-y-2">
                    {Object.values(TRANSOM_PROFILE_SPECS).map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => {
                          playTactileClick();
                          setTransomProfileModel(p.id);
                        }}
                        className={`w-full text-left p-2.5 rounded-xl border transition-all cursor-pointer min-h-[44px] ${
                          transomProfileModel === p.id
                            ? 'bg-blue-600/20 border-blue-500 text-white shadow-sm'
                            : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-bold">{p.labelFr}</span>
                          <span className="px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 font-mono text-[10px]">
                            Iy = {p.momentOfInertiaIyCm4} cm4
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          Section {p.widthMm}x{p.depthMm} mm • {p.massPerMeterKg} kg/m • {p.description}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Glass Thickness Selection */}
                <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/60 space-y-2">
                  <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                    Épaisseur Somme du Vitrage
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { mm: 6, label: '6 mm verre', desc: 'Simple vitrage 6mm' },
                      { mm: 8, label: '8 mm verre', desc: 'Double 4/16/4 standard' },
                      { mm: 12, label: '12 mm verre', desc: 'Double 6/16/6 acoustique' },
                      { mm: 16, label: '16 mm verre', desc: 'Feuilleté 44.2/12/44.2' },
                      { mm: 20, label: '20 mm verre', desc: 'Feuilleté 66.2/12/44.2' },
                      { mm: 28, label: '28 mm verre', desc: 'Triple vitrage feuilleté' },
                    ].map((glz) => (
                      <button
                        key={glz.mm}
                        type="button"
                        onClick={() => {
                          playTactileClick();
                          setGlassThicknessMm(glz.mm);
                        }}
                        className={`p-2 rounded-xl border text-left transition-all cursor-pointer min-h-[44px] ${
                          glassThicknessMm === glz.mm
                            ? 'bg-blue-600/20 border-blue-500 text-white'
                            : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        <div className="text-xs font-bold text-blue-400">{glz.label}</div>
                        <div className="text-[10px] text-slate-400">{glz.desc}</div>
                      </button>
                    ))}
                  </div>

                  {/* Setting Blocks Distance & Length */}
                  <div className="pt-2 border-t border-slate-800 space-y-3">
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-300">Distance cales aux montants (a) :</span>
                        <span className="font-mono text-cyan-400 font-bold">{settingBlockDistanceMm} mm</span>
                      </div>
                      <input
                        type="range"
                        min={60}
                        max={Math.round(transomLengthMm / 2 - 50)}
                        step={10}
                        value={settingBlockDistanceMm}
                        onChange={(e) => {
                          playSlideTick();
                          setSettingBlockDistanceMm(Number(e.target.value));
                        }}
                        className="w-full accent-cyan-500 cursor-pointer h-2 bg-slate-700 rounded-lg"
                      />
                      <div className="flex justify-between text-[10px] text-slate-500">
                        <span>60 mm (près montant)</span>
                        <span>L/10 optimal</span>
                        <span>{Math.round(transomLengthMm / 2 - 50)} mm</span>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-300">Longueur de la cale d assise :</span>
                        <span className="font-mono text-cyan-400 font-bold">{settingBlockLengthMm} mm</span>
                      </div>
                      <input
                        type="range"
                        min={80}
                        max={200}
                        step={10}
                        value={settingBlockLengthMm}
                        onChange={(e) => {
                          playSlideTick();
                          setSettingBlockLengthMm(Number(e.target.value));
                        }}
                        className="w-full accent-cyan-500 cursor-pointer h-2 bg-slate-700 rounded-lg"
                      />
                      <div className="flex justify-between text-[10px] text-slate-500">
                        <span>80 mm</span>
                        <span>100 mm (DTU 39 min)</span>
                        <span>200 mm (haute charge)</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Setting Block Material & Anti-Torsion Bracket */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Block Material */}
                <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/60 space-y-2">
                  <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                    Matériau de la Cale d Assise (NF DTU 39)
                  </h4>
                  <div className="space-y-1.5">
                    {Object.values(SETTING_BLOCK_SPECS).map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => {
                          playTactileClick();
                          setSettingBlockMaterial(m.id);
                        }}
                        className={`w-full text-left p-2.5 rounded-xl border transition-all cursor-pointer min-h-[44px] ${
                          settingBlockMaterial === m.id
                            ? 'bg-blue-600/20 border-blue-500 text-white shadow-sm'
                            : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-bold">{m.labelFr}</span>
                          <span className="text-[10px] font-mono text-emerald-400">{m.hardnessShoreA} ShA</span>
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5 flex justify-between">
                          <span>Pression max : {m.maxAllowablePressureMpa} MPa</span>
                          <span>{m.temperatureRangeFr}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Anti-torsion bracket toggle */}
                <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/60 space-y-3 flex flex-col justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center justify-between">
                      <span>Étriers de Support Anti-Torsion</span>
                      <span className="text-[10px] text-cyan-400 font-mono">NF EN 13830</span>
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                      Reprennent le couple de basculement causé par le déport du vitrage par rapport au centre de gravité du profilé.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      playSwitchSound();
                      setHasAntiTorsionBracket(!hasAntiTorsionBracket);
                    }}
                    className={`w-full p-3 rounded-xl border flex items-center justify-between transition-all cursor-pointer min-h-[44px] ${
                      hasAntiTorsionBracket
                        ? 'bg-emerald-600/20 border-emerald-500 text-white'
                        : 'bg-slate-900/60 border-slate-800 text-slate-400'
                    }`}
                  >
                    <div className="text-left">
                      <div className="text-xs font-bold">
                        {hasAntiTorsionBracket ? 'Étriers Inox Installés' : 'Aucun Étrier (Feuillure Simple)'}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {audit.isAntiTorsionRequired ? 'Fortement requis pour ce vitrage' : 'Optionnel pour charges légères'}
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded-lg text-xs font-mono font-bold ${
                      hasAntiTorsionBracket ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {hasAntiTorsionBracket ? 'ACTIF' : 'DÉSACTIVÉ'}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: DEFLECTION & RIGIDITY */}
          {activeTab === 'deflection' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              
              {/* Deflection Evaluation Card */}
              <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/60 space-y-3">
                <div className="flex justify-between items-center">
                  <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                    <CheckCircle2 className={`w-4 h-4 ${audit.isDeflectionCompliant ? 'text-emerald-400' : 'text-rose-400'}`} />
                    Contrôle de la Flèche sous Gravité (NF EN 13830)
                  </h3>
                  <span className={`px-2 py-0.5 rounded text-xs font-mono font-bold ${
                    audit.isDeflectionCompliant
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                  }`}>
                    {audit.isDeflectionCompliant ? 'RIGIDITÉ CONFORME' : 'FLÈCHE EXCESSIVE'}
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-300">Flèche réelle calculée (axe vertical Iy) :</span>
                    <span className="font-mono font-bold text-white">
                      {audit.deflectionActualMm} mm (Limite admise : {audit.deflectionLimitEffectiveMm} mm)
                    </span>
                  </div>
                  <div className="h-3 w-full rounded-full bg-slate-800 overflow-hidden relative">
                    <div
                      style={{ width: `${Math.min(100, audit.deflectionRatioPercent)}%` }}
                      className={`h-full transition-all duration-300 ${
                        audit.deflectionRatioPercent <= 70
                          ? 'bg-emerald-500'
                          : audit.deflectionRatioPercent <= 100
                          ? 'bg-amber-500'
                          : 'bg-rose-500'
                      }`}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                    <span>0 mm</span>
                    <span>Taux d utilisation : {audit.deflectionRatioPercent}%</span>
                    <span>Limite min(L/500, 3.0 mm) : {audit.deflectionLimitEffectiveMm} mm</span>
                  </div>
                </div>

                {/* Physics Formula Explanation */}
                <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 text-xs font-mono space-y-1">
                  <div className="text-slate-400">Formule de flexion sous 2 charges ponctuelles symétriques :</div>
                  <div className="text-cyan-400 font-bold">
                    f = (P • a) / (24 • E • Iy) • (3 • L² - 4 • a²)
                  </div>
                  <div className="text-[10px] text-slate-400">
                    P = {audit.loadPerSettingBlockN} N • a = {settingBlockDistanceMm} mm • L = {transomLengthMm} mm • Iy = {currentProfile.momentOfInertiaIyCm4} cm4
                  </div>
                </div>
              </div>

              {/* Profile Mechanical Rigidity Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">Inertie Verticale (Iy)</span>
                  <strong className="text-white font-mono text-sm">{currentProfile.momentOfInertiaIyCm4} cm4</strong>
                  <span className="text-[10px] text-slate-500 block">Résistance sous gravité</span>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">Inertie Vent (Ix)</span>
                  <strong className="text-cyan-400 font-mono text-sm">{currentProfile.momentOfInertiaIxCm4} cm4</strong>
                  <span className="text-[10px] text-slate-500 block">Pression frontale vent</span>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">Limite Norme L/500</span>
                  <strong className="text-emerald-400 font-mono text-sm">{audit.deflectionLimitStandardMm} mm</strong>
                  <span className="text-[10px] text-slate-500 block">Portée / 500</span>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">Plafond Absolu CSTB</span>
                  <strong className="text-amber-400 font-mono text-sm">{audit.deflectionLimitAbsoluteMm} mm</strong>
                  <span className="text-[10px] text-slate-500 block">Protection des joints</span>
                </div>
              </div>

              {/* Engineering Advice */}
              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-start gap-3">
                <HelpCircle className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                <div className="text-xs text-slate-300 space-y-1">
                  <span className="font-bold text-white block">Règle de l art NF EN 13830 :</span>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    Une flèche de traverse supérieure à 3.0 mm entraîne le cisaillement du scellement polyuréthane du double vitrage, provoquant l entrée d humidité, de la condensation interne et le décollement de la barrière d étanchéité.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: CAD 2D VIEW */}
          {activeTab === 'cad_view' && (
            <div className="space-y-3 animate-in fade-in duration-150">
              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col items-center">
                <div className="w-full flex justify-between items-center mb-2 px-1 text-xs">
                  <span className="font-bold text-slate-200 flex items-center gap-2">
                    <Layers className="w-4 h-4 text-blue-400" />
                    Élévation Frontale & Déformée sous Poids Propre
                  </span>
                  <span className="text-[10px] font-mono text-cyan-400">
                    Traverse {transomLengthMm} mm • 2 cales à a = {settingBlockDistanceMm} mm
                  </span>
                </div>

                {/* SVG CAD Drawing */}
                <div className="w-full max-w-xl bg-slate-950 rounded-lg p-2 border border-slate-800 flex justify-center">
                  <svg
                    viewBox="0 0 500 320"
                    className="w-full h-auto max-h-[300px] select-none font-mono"
                  >
                    <defs>
                      <linearGradient id="transomAluGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#475569" />
                        <stop offset="50%" stopColor="#334155" />
                        <stop offset="100%" stopColor="#1e293b" />
                      </linearGradient>

                      <linearGradient id="glassPaneGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="rgba(56, 189, 248, 0.45)" />
                        <stop offset="100%" stopColor="rgba(56, 189, 248, 0.15)" />
                      </linearGradient>

                      <linearGradient id="blockGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#34d399" />
                        <stop offset="100%" stopColor="#059669" />
                      </linearGradient>
                    </defs>

                    {/* Left & Right Vertical Mullions */}
                    <rect x="30" y="40" width="30" height="240" fill="#1e293b" stroke="#475569" strokeWidth="1.5" />
                    <text x="45" y="160" fill="#64748b" fontSize="8" textAnchor="middle" transform="rotate(-90 45,160)">MONTANT GAUCHE</text>

                    <rect x="440" y="40" width="30" height="240" fill="#1e293b" stroke="#475569" strokeWidth="1.5" />
                    <text x="455" y="160" fill="#64748b" fontSize="8" textAnchor="middle" transform="rotate(90 455,160)">MONTANT DROIT</text>

                    {/* Transom Profile (Traverse Horizontale) */}
                    <rect x="60" y="210" width="380" height="36" fill="url(#transomAluGradient)" stroke="#64748b" strokeWidth="1.5" rx="2" />
                    <text x="250" y="232" fill="#94a3b8" fontSize="9" textAnchor="middle" fontWeight="bold">
                      {currentProfile.labelFr.split('(')[0].trim()} (Iy = {currentProfile.momentOfInertiaIyCm4} cm4)
                    </text>

                    {/* Drainage weep holes (Orifices d évacuation d eau) */}
                    <rect x="180" y="240" width="20" height="4" fill="#38bdf8" rx="1" />
                    <rect x="300" y="240" width="20" height="4" fill="#38bdf8" rx="1" />
                    <text x="250" y="252" fill="#38bdf8" fontSize="7" textAnchor="middle">Drainage feuillure libre</text>

                    {/* Setting blocks positions:
                        Transom spans from x=60 to x=440 (width=380).
                        Scale settingBlockDistanceMm: range 60 to 400 maps to 60px to 140px from edges.
                    */}
                    {(() => {
                      const spanRatio = 380 / transomLengthMm;
                      const distPx = Math.max(25, Math.min(140, settingBlockDistanceMm * spanRatio));
                      const blockW = Math.max(24, Math.min(50, settingBlockLengthMm * spanRatio * 1.4));
                      const leftBlockX = 60 + distPx - blockW / 2;
                      const rightBlockX = 440 - distPx - blockW / 2;
                      const blockY = 200;
                      const blockH = 10;

                      return (
                        <g>
                          {/* Left Setting Block */}
                          <rect x={leftBlockX} y={blockY} width={blockW} height={blockH} fill="url(#blockGradient)" stroke="#047857" strokeWidth="1.2" rx="2" />
                          <text x={leftBlockX + blockW / 2} y={blockY + 8} fill="#064e3b" fontSize="7" textAnchor="middle" fontWeight="bold">CALE</text>

                          {/* Left anti-torsion bracket under block (if enabled) */}
                          {hasAntiTorsionBracket && (
                            <polygon points={`${leftBlockX},${blockY + blockH} ${leftBlockX + blockW},${blockY + blockH} ${leftBlockX + blockW / 2},${blockY + blockH + 12}`} fill="#f59e0b" stroke="#d97706" strokeWidth="1" />
                          )}

                          {/* Right Setting Block */}
                          <rect x={rightBlockX} y={blockY} width={blockW} height={blockH} fill="url(#blockGradient)" stroke="#047857" strokeWidth="1.2" rx="2" />
                          <text x={rightBlockX + blockW / 2} y={blockY + 8} fill="#064e3b" fontSize="7" textAnchor="middle" fontWeight="bold">CALE</text>

                          {/* Right anti-torsion bracket under block (if enabled) */}
                          {hasAntiTorsionBracket && (
                            <polygon points={`${rightBlockX},${blockY + blockH} ${rightBlockX + blockW},${blockY + blockH} ${rightBlockX + blockW / 2},${blockY + blockH + 12}`} fill="#f59e0b" stroke="#d97706" strokeWidth="1" />
                          )}

                          {/* Glass Pane resting on blocks */}
                          <rect x="70" y="60" width="360" height="140" fill="url(#glassPaneGradient)" stroke="#38bdf8" strokeWidth="1.5" rx="1" />
                          
                          {/* Glass weight center label */}
                          <text x="250" y="115" fill="#bae6fd" fontSize="11" textAnchor="middle" fontWeight="bold">
                            Panneau Vitré : {audit.glassWeightKg} kg ({glassThicknessMm} mm)
                          </text>

                          {/* Left Point Load Arrow */}
                          <line x1={leftBlockX + blockW / 2} y1="130" x2={leftBlockX + blockW / 2} y2={blockY - 2} stroke="#ef4444" strokeWidth="2" />
                          <polygon points={`${leftBlockX + blockW / 2},${blockY} ${leftBlockX + blockW / 2 - 4},${blockY - 8} ${leftBlockX + blockW / 2 + 4},${blockY - 8}`} fill="#ef4444" />
                          <text x={leftBlockX + blockW / 2} y="125" fill="#ef4444" fontSize="8" textAnchor="middle" fontWeight="bold">
                            P = {audit.loadPerSettingBlockKg} kg
                          </text>

                          {/* Right Point Load Arrow */}
                          <line x1={rightBlockX + blockW / 2} y1="130" x2={rightBlockX + blockW / 2} y2={blockY - 2} stroke="#ef4444" strokeWidth="2" />
                          <polygon points={`${rightBlockX + blockW / 2},${blockY} ${rightBlockX + blockW / 2 - 4},${blockY - 8} ${rightBlockX + blockW / 2 + 4},${blockY - 8}`} fill="#ef4444" />
                          <text x={rightBlockX + blockW / 2} y="125" fill="#ef4444" fontSize="8" textAnchor="middle" fontWeight="bold">
                            P = {audit.loadPerSettingBlockKg} kg
                          </text>

                          {/* Dimension line: Distance a from left mullion */}
                          <line x1="60" y1="270" x2={leftBlockX + blockW / 2} y2="270" stroke="#06b6d4" strokeWidth="1.5" />
                          <line x1="60" y1="265" x2="60" y2="275" stroke="#06b6d4" strokeWidth="1.5" />
                          <line x1={leftBlockX + blockW / 2} y1="265" x2={leftBlockX + blockW / 2} y2="275" stroke="#06b6d4" strokeWidth="1.5" />
                          <text x={(60 + leftBlockX + blockW / 2) / 2} y="285" fill="#06b6d4" fontSize="8" textAnchor="middle">
                            a = {settingBlockDistanceMm} mm
                          </text>

                          {/* Elastic Deflection Curve (courbe fléchie exagérée) */}
                          <path
                            d={`M 60,246 Q 250,${246 + Math.min(25, audit.deflectionActualMm * 6)} 440,246`}
                            fill="none"
                            stroke="#f43f5e"
                            strokeWidth="2"
                            strokeDasharray="4 2"
                          />
                          <text x="250" y={246 + Math.min(25, audit.deflectionActualMm * 6) + 14} fill="#f43f5e" fontSize="9" textAnchor="middle" fontWeight="bold">
                            Flèche f = {audit.deflectionActualMm} mm (max {audit.deflectionLimitEffectiveMm} mm)
                          </text>
                        </g>
                      );
                    })()}
                  </svg>
                </div>

                {/* Legend bar */}
                <div className="flex flex-wrap items-center justify-center gap-4 text-[10px] text-slate-400 mt-2 font-mono">
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded bg-blue-400 inline-block" />
                    Double Vitrage
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded bg-emerald-400 inline-block" />
                    Cales d Assise {currentBlock.hardnessShoreA} ShA
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded bg-amber-400 inline-block" />
                    Étriers Anti-Torsion
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded bg-rose-400 inline-block" />
                    Courbe de Déformée
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: SETTING DTU 39 & TORSION */}
          {activeTab === 'setting_dtu39' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              
              {/* NF DTU 39 P1-1 Compliance Banner */}
              <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/60 space-y-3">
                <div className="flex justify-between items-center">
                  <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-blue-400" />
                    Exigences de Calage d Assise (NF DTU 39 P1-1)
                  </h3>
                  <span className={`px-2 py-0.5 rounded text-xs font-mono font-bold ${
                    audit.isPressureCompliant && audit.isBlockLengthCompliant
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  }`}>
                    {audit.isPressureCompliant && audit.isBlockLengthCompliant
                      ? 'CALAGE PARFAITEMENT CONFORME'
                      : 'AJUSTEMENT DES CALES REQUIS'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {/* Pressure Check */}
                  <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 flex items-start gap-2.5">
                    {audit.isPressureCompliant ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <span className="font-bold text-white block">Pression de contact élastomère : &le; {audit.maxAllowablePressureMpa} MPa</span>
                      <p className="text-slate-400 text-[11px] mt-0.5">
                        Calculée : <strong className="text-white font-mono">{audit.contactPressureMpa} MPa</strong> ({audit.isPressureCompliant ? 'Admissible, élasticité préservée sans risque d écrasement' : 'Excessif, risque de contact direct verre-métal'})
                      </p>
                    </div>
                  </div>

                  {/* Length Check */}
                  <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 flex items-start gap-2.5">
                    {audit.isBlockLengthCompliant ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <span className="font-bold text-white block">Longueur minimale de cale : &ge; {audit.minRecommendedBlockLengthMm} mm</span>
                      <p className="text-slate-400 text-[11px] mt-0.5">
                        Choisie : <strong className="text-white font-mono">{settingBlockLengthMm} mm</strong> ({audit.isBlockLengthCompliant ? 'Conforme à la règle des 2 mm par kg de verre' : 'Trop courte, allongez la cale pour étaler la pression'})
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Torsion Analysis Card */}
              <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/60 space-y-3">
                <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center justify-between">
                  <span>Analyse de Torsion & Risque de Déversement</span>
                  <span className="text-[10px] text-amber-400 font-mono">Couple = {audit.torsionMomentNm} N.m</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">Excentrement du Verre</span>
                    <strong className="text-white font-mono text-sm">{audit.glassCenterEccentricityMm} mm</strong>
                    <span className="text-[10px] text-slate-500 block">Déport par rapport à l âme</span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">Couple de Basculement</span>
                    <strong className="text-cyan-400 font-mono text-sm">{audit.torsionMomentNm} N.m</strong>
                    <span className="text-[10px] text-slate-500 block">Effort de rotation traverse</span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">Étriers Anti-Torsion</span>
                    <strong className={audit.isAntiTorsionRequired ? 'text-amber-400 font-mono text-sm' : 'text-emerald-400 font-mono text-sm'}>
                      {audit.isAntiTorsionRequired ? 'Requis (M > 80 kg)' : 'Non obligatoire'}
                    </strong>
                    <span className="text-[10px] text-slate-500 block">{hasAntiTorsionBracket ? 'Installés' : 'Absents'}</span>
                  </div>
                </div>
              </div>

              {/* Actionable Workshop Recommendations */}
              <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/60 space-y-2">
                <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                  Recommandations Techniques d Atelier & Pose
                </h4>
                <ul className="space-y-1.5 text-xs text-slate-300">
                  {audit.recommendationsFr.map((rec, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <ArrowRight className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          <div className="text-[11px] text-slate-400 flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${
              audit.overallStatus === 'valid' ? 'bg-emerald-400' : audit.overallStatus === 'warning' ? 'bg-amber-400' : 'bg-rose-400'
            }`} />
            <span>
              {audit.overallStatus === 'valid'
                ? 'Traverse et calage conformes NF DTU 39'
                : audit.overallStatus === 'warning'
                ? 'Ajustements conseillés pour rigidité optimale'
                : 'Flèche excessive ou risque d écrasement des cales'}
            </span>
          </div>

          <button
            onClick={() => {
              playTactileClick();
              onClose();
            }}
            className="min-h-[44px] px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all cursor-pointer"
          >
            Fermer
          </button>
        </div>

      </div>
    </div>
  );
};
