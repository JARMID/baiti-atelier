import React, { useState, useMemo } from 'react';
import {
  X,
  FileCheck,
  Sliders,
  Layers,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Droplets,
  Volume2,
} from 'lucide-react';
import { playTactileClick, playSwitchSound, playSlideTick } from '../../utils/audioFeedback';
import {
  computeSillFlashingAudit,
  SILL_PROFILE_SPECS,
  ACOUSTIC_DAMPENER_SPECS,
  type SillProfileType,
  type AcousticDampenerType,
  type EndDamType,
} from '../../utils/sillFlashingManager';
import { generateSillFlashingNoticePdf } from '../../utils/pdfGenerator';

interface SillFlashingModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialWidth?: number;
  projectReference?: string;
  wilayaName?: string;
  clientName?: string;
}

export const SillFlashingModal: React.FC<SillFlashingModalProps> = ({
  isOpen,
  onClose,
  initialWidth = 1400,
  projectReference = 'Bavette d Appui Aluminium',
  wilayaName = '16 - Alger',
  clientName = 'Particulier',
}) => {
  const [activeTab, setActiveTab] = useState<'config' | 'runoff_drainage' | 'cad_view' | 'dtu365_acoustics'>('config');

  // Input states
  const [openingWidthMm, setOpeningWidthMm] = useState<number>(initialWidth);
  const [wallThroatDepthMm, setWallThroatDepthMm] = useState<number>(160);
  const [dripOverhangMm, setDripOverhangMm] = useState<number>(35);
  const [sillSlopePercent, setSillSlopePercent] = useState<number>(8);
  const [sillProfile, setSillProfile] = useState<SillProfileType>('folded_sheet_15_10');
  const [endDamType, setEndDamType] = useState<EndDamType>('folded_lateral_ears');
  const [acousticDampener, setAcousticDampener] = useState<AcousticDampenerType>('bituminous_membrane_1_5mm');
  const [drivingRainPressurePa, setDrivingRainPressurePa] = useState<number>(450);

  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  // Compute audit
  const audit = useMemo(() => {
    return computeSillFlashingAudit({
      openingWidthMm,
      wallThroatDepthMm,
      dripOverhangMm,
      sillSlopePercent,
      sillProfile,
      endDamType,
      acousticDampener,
      drivingRainPressurePa,
      wilayaName,
      clientName,
      projectReference,
    });
  }, [
    openingWidthMm,
    wallThroatDepthMm,
    dripOverhangMm,
    sillSlopePercent,
    sillProfile,
    endDamType,
    acousticDampener,
    drivingRainPressurePa,
    wilayaName,
    clientName,
    projectReference,
  ]);

  if (!isOpen) return null;

  const currentProfile = SILL_PROFILE_SPECS[sillProfile];
  const currentDampener = ACOUSTIC_DAMPENER_SPECS[acousticDampener];

  const handleExportPdf = async () => {
    playTactileClick();
    setIsGeneratingPdf(true);
    try {
      const docId = `SIL-${Date.now().toString().slice(-6)}`;
      await generateSillFlashingNoticePdf({
        documentId: docId,
        projectRef: projectReference,
        clientName,
        wilayaName,
        input: {
          openingWidthMm,
          wallThroatDepthMm,
          dripOverhangMm,
          sillSlopePercent,
          sillProfile,
          endDamType,
          acousticDampener,
          drivingRainPressurePa,
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
        <div className="px-4 py-3 bg-gradient-to-r from-teal-950/80 via-slate-900 to-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-teal-500/15 text-teal-400 border border-teal-500/30">
              <Droplets className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <span>Bavette d Appui & Rejet d Eau</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30 font-mono">
                  NF DTU 36.5 / CSTB 3529 / NF P 20-302
                </span>
              </h2>
              <p className="text-[11px] text-slate-400">
                Pente gravitaire, saillie larmier 30 mm, oreilles étanches et amortissement phonique
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportPdf}
              disabled={isGeneratingPdf}
              className="min-h-[44px] px-3.5 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-md active:scale-95 disabled:opacity-50 cursor-pointer"
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
            <span className="text-slate-400 block text-[10px]">Pente d Appui</span>
            <strong className={audit.isSlopeCompliant ? 'text-emerald-400 text-sm' : 'text-rose-400 text-sm'}>
              {sillSlopePercent}% ({audit.sillSlopeDegrees}°)
            </strong>
            <span className="text-[10px] text-slate-400 block">Min DTU : 5.0%</span>
          </div>

          <div className="bg-slate-900/90 p-2 rounded-lg border border-slate-800">
            <span className="text-slate-400 block text-[10px]">Saillie Larmier</span>
            <strong className={audit.isDripOverhangCompliant ? 'text-emerald-400 text-sm' : 'text-rose-400 text-sm'}>
              {dripOverhangMm} mm
            </strong>
            <span className="text-[10px] text-slate-400 block">Min requis : 30 mm</span>
          </div>

          <div className="bg-slate-900/90 p-2 rounded-lg border border-slate-800">
            <span className="text-slate-400 block text-[10px]">Bruit Impact Pluie</span>
            <strong className={audit.isAcousticallyComfortable ? 'text-emerald-400 text-sm' : 'text-amber-400 text-sm'}>
              {audit.rainImpactNoiseDbA} dBA
            </strong>
            <span className="text-[10px] text-slate-400 block">Atténuation : -{currentDampener.noiseAttenuationDbA} dBA</span>
          </div>

          <div className="bg-slate-900/90 p-2 rounded-lg border border-slate-800">
            <span className="text-slate-400 block text-[10px]">Joues Latérales</span>
            <strong className={audit.isEndDamCompliant ? 'text-emerald-400 text-sm' : 'text-amber-400 text-sm'}>
              Relevé {audit.endDamHeightMm} mm
            </strong>
            <span className="text-[10px] text-slate-400 block">Isolant protégé</span>
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
            Configuration & Pliage
          </button>

          <button
            onClick={() => {
              playSwitchSound();
              setActiveTab('runoff_drainage');
            }}
            className={`min-h-[44px] px-4 py-2.5 text-xs font-medium border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'runoff_drainage'
                ? 'border-teal-500 text-teal-400 bg-teal-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Droplets className="w-4 h-4" />
            Ruissellement & Pente
          </button>

          <button
            onClick={() => {
              playSwitchSound();
              setActiveTab('cad_view');
            }}
            className={`min-h-[44px] px-4 py-2.5 text-xs font-medium border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'cad_view'
                ? 'border-teal-500 text-teal-400 bg-teal-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-4 h-4" />
            Schéma 2D CAD Coupe d Appui
          </button>

          <button
            onClick={() => {
              playSwitchSound();
              setActiveTab('dtu365_acoustics');
            }}
            className={`min-h-[44px] px-4 py-2.5 text-xs font-medium border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'dtu365_acoustics'
                ? 'border-teal-500 text-teal-400 bg-teal-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            DTU 36.5 & Isolation Acoustique
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
                  <Sliders className="w-4 h-4 text-teal-400" />
                  1. Dimensions de la Baie et de la Gorge Maçonnée
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Opening width */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-300">Largeur tableau maçonnerie (L) :</span>
                      <span className="font-mono text-teal-400 font-bold">{openingWidthMm} mm</span>
                    </div>
                    <input
                      type="range"
                      min={600}
                      max={3500}
                      step={25}
                      value={openingWidthMm}
                      onChange={(e) => {
                        playSlideTick();
                        setOpeningWidthMm(Number(e.target.value));
                      }}
                      className="w-full accent-teal-500 cursor-pointer h-2 bg-slate-700 rounded-lg"
                    />
                    <div className="flex justify-between text-[10px] text-slate-500">
                      <span>600 mm</span>
                      <span>1400 mm (standard)</span>
                      <span>3500 mm (baie coulissante)</span>
                    </div>
                  </div>

                  {/* Wall throat depth */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-300">Profondeur d ébrasement / gorge (P) :</span>
                      <span className="font-mono text-teal-400 font-bold">{wallThroatDepthMm} mm</span>
                    </div>
                    <input
                      type="range"
                      min={80}
                      max={320}
                      step={5}
                      value={wallThroatDepthMm}
                      onChange={(e) => {
                        playSlideTick();
                        setWallThroatDepthMm(Number(e.target.value));
                      }}
                      className="w-full accent-teal-500 cursor-pointer h-2 bg-slate-700 rounded-lg"
                    />
                    <div className="flex justify-between text-[10px] text-slate-500">
                      <span>80 mm (isolation fine)</span>
                      <span>160 mm (standard 20 cm)</span>
                      <span>320 mm (ITE épaisse)</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-800">
                  {/* Drip overhang */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-300">Saillie du larmier goutte d eau :</span>
                      <span className={`font-mono font-bold ${dripOverhangMm >= 30 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {dripOverhangMm} mm {dripOverhangMm < 30 ? '(Min 30 mm)' : ''}
                      </span>
                    </div>
                    <input
                      type="range"
                      min={15}
                      max={60}
                      step={5}
                      value={dripOverhangMm}
                      onChange={(e) => {
                        playSlideTick();
                        setDripOverhangMm(Number(e.target.value));
                      }}
                      className="w-full accent-teal-500 cursor-pointer h-2 bg-slate-700 rounded-lg"
                    />
                    <div className="flex justify-between text-[10px] text-slate-500">
                      <span>15 mm (trop court)</span>
                      <span>30 mm (DTU min)</span>
                      <span>60 mm (grand débord)</span>
                    </div>
                  </div>

                  {/* Slope percent */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-300">Pente d écoulement d appui :</span>
                      <span className={`font-mono font-bold ${sillSlopePercent >= 5 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {sillSlopePercent}% ({audit.sillSlopeDegrees}°) {sillSlopePercent < 5 ? '(Min 5%)' : ''}
                      </span>
                    </div>
                    <input
                      type="range"
                      min={2}
                      max={15}
                      step={1}
                      value={sillSlopePercent}
                      onChange={(e) => {
                        playSlideTick();
                        setSillSlopePercent(Number(e.target.value));
                      }}
                      className="w-full accent-teal-500 cursor-pointer h-2 bg-slate-700 rounded-lg"
                    />
                    <div className="flex justify-between text-[10px] text-slate-500">
                      <span>2% (stagnation)</span>
                      <span>5% (DTU min)</span>
                      <span>8% (recommandé)</span>
                      <span>15%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Profile & End Dams */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Sill Profile Selection */}
                <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/60 space-y-2">
                  <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                    Modèle de Bavette / Tôle d Appui
                  </h4>
                  <div className="space-y-2">
                    {Object.values(SILL_PROFILE_SPECS).map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => {
                          playTactileClick();
                          setSillProfile(p.id);
                        }}
                        className={`w-full text-left p-2.5 rounded-xl border transition-all cursor-pointer min-h-[44px] ${
                          sillProfile === p.id
                            ? 'bg-teal-600/20 border-teal-500 text-white shadow-sm'
                            : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-bold">{p.labelFr}</span>
                          <span className="px-1.5 py-0.5 rounded bg-teal-500/10 text-teal-400 font-mono text-[10px]">
                            {p.nominalThicknessMm} mm
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          {p.material} • {p.weightPerM2Kg} kg/m² • {p.description}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Acoustic Dampener & End Dams */}
                <div className="space-y-4">
                  {/* Acoustic Dampener */}
                  <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/60 space-y-2">
                    <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                      Amortisseur Phonique Anti-Tambourinage
                    </h4>
                    <div className="space-y-1.5">
                      {Object.values(ACOUSTIC_DAMPENER_SPECS).map((d) => (
                        <button
                          key={d.id}
                          type="button"
                          onClick={() => {
                            playTactileClick();
                            setAcousticDampener(d.id);
                          }}
                          className={`w-full text-left p-2.5 rounded-xl border transition-all cursor-pointer min-h-[44px] ${
                            acousticDampener === d.id
                              ? 'bg-teal-600/20 border-teal-500 text-white shadow-sm'
                              : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700'
                          }`}
                        >
                          <div className="flex justify-between items-center text-xs">
                            <span className="font-bold">{d.labelFr}</span>
                            <span className="text-[10px] font-mono text-emerald-400">-{d.noiseAttenuationDbA} dBA</span>
                          </div>
                          <div className="text-[10px] text-slate-400 mt-0.5">
                            {d.description}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* End dam types */}
                  <div className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-700/60 space-y-2">
                    <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                      Oreilles Latérales / Joues d Étanchéité
                    </h4>
                    <div className="grid grid-cols-3 gap-1.5">
                      {[
                        { id: 'welded_end_caps', label: 'Joues Soudées', desc: 'Relevé 25 mm alu' },
                        { id: 'folded_lateral_ears', label: 'Oreilles Pliées', desc: 'Monobloc façonnée' },
                        { id: 'molded_abs_caps', label: 'Embouts ABS', desc: 'Clipsables avec joint' },
                      ].map((ed) => (
                        <button
                          key={ed.id}
                          type="button"
                          onClick={() => {
                            playTactileClick();
                            setEndDamType(ed.id as any);
                          }}
                          className={`p-2 rounded-lg border text-center transition-all cursor-pointer min-h-[44px] ${
                            endDamType === ed.id
                              ? 'bg-teal-600/20 border-teal-500 text-white font-bold'
                              : 'bg-slate-900/60 border-slate-800 text-slate-300'
                          }`}
                        >
                          <div className="text-[11px]">{ed.label}</div>
                          <div className="text-[9px] text-slate-400">{ed.desc}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Driving Rain Pressure Selection */}
                  <div className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-700/60 space-y-2">
                    <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center justify-between">
                      <span>Pression Pluie Battante</span>
                      <span className="text-[10px] font-mono text-cyan-400">NF EN 12208</span>
                    </h4>
                    <div className="grid grid-cols-3 gap-1.5">
                      {[
                        { pa: 250, label: 'Classe 4A', sub: '250 Pa (Pluie modérée)' },
                        { pa: 450, label: 'Classe 7A', sub: '450 Pa (Vent orageux)' },
                        { pa: 900, label: 'Classe E900', sub: '900 Pa (Bord de mer)' },
                      ].map((pr) => (
                        <button
                          key={pr.pa}
                          type="button"
                          onClick={() => {
                            playTactileClick();
                            setDrivingRainPressurePa(pr.pa);
                          }}
                          className={`p-2 rounded-lg border text-center transition-all cursor-pointer min-h-[44px] ${
                            drivingRainPressurePa === pr.pa
                              ? 'bg-teal-600/20 border-teal-500 text-white font-bold'
                              : 'bg-slate-900/60 border-slate-800 text-slate-300'
                          }`}
                        >
                          <div className="text-[11px]">{pr.label}</div>
                          <div className="text-[9px] text-slate-400">{pr.sub}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: RUNOFF & DRAINAGE */}
          {activeTab === 'runoff_drainage' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              
              {/* Hydraulic Runoff Evaluation */}
              <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/60 space-y-3">
                <div className="flex justify-between items-center">
                  <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                    <CheckCircle2 className={`w-4 h-4 ${audit.isSlopeCompliant ? 'text-emerald-400' : 'text-rose-400'}`} />
                    Capacité d Évacuation Gravitaire (NF DTU 36.5)
                  </h3>
                  <span className={`px-2 py-0.5 rounded text-xs font-mono font-bold ${
                    audit.isSlopeCompliant
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                  }`}>
                    {audit.isSlopeCompliant ? 'ÉCOULEMENT CONFORME' : 'PENTE INSUFFISANTE'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800">
                    <div className="text-xs text-slate-400">Débit Orageux de Ruissellement</div>
                    <div className="text-lg font-bold font-mono text-white mt-1">{audit.runoffFlowRateLitersPerMin} L/min</div>
                    <div className="text-[10px] text-slate-500 mt-1">
                      Pluie orageuse 120 mm/h • Surface collectrice {((openingWidthMm / 1000) * (wallThroatDepthMm + dripOverhangMm) / 1000).toFixed(2)} m²
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800">
                    <div className="text-xs text-slate-400">Vitesse de Chasse sur Aluminium</div>
                    <div className="text-lg font-bold font-mono text-teal-400 mt-1">{audit.waterSpeedMetersPerSec} m/s</div>
                    <div className="text-[10px] text-slate-500 mt-1">
                      Évacuation rapide éliminant les dépôts de poussière sableuse
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800">
                    <div className="text-xs text-slate-400">Risque de Flaque / Stagnation</div>
                    <div className={`text-lg font-bold font-mono mt-1 ${audit.riskOfWaterPonding ? 'text-rose-400' : 'text-emerald-400'}`}>
                      {audit.riskOfWaterPonding ? 'Risque Élevé (< 4%)' : 'Nul (Évacuation Libre)'}
                    </div>
                    <div className="text-[10px] text-slate-500 mt-1">
                      Pente réelle : {sillSlopePercent}% ({audit.sillSlopeDegrees}°)
                    </div>
                  </div>
                </div>

                {/* Pressure equalization chamber */}
                <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 text-xs space-y-1">
                  <div className="flex justify-between text-slate-300">
                    <span className="font-bold text-white">Chambre de Décompression sous Traverse :</span>
                    <span className="font-mono text-cyan-400">Pression essai : {drivingRainPressurePa} Pa (Classe E{drivingRainPressurePa})</span>
                  </div>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    Les orifices de drainage de la traverse basse débouchent directement sur la pente de la bavette. L air circulant librement équilibre la pression et empêche le siphonage de l eau vers l intérieur sous fortes rafales de vent.
                  </p>
                </div>
              </div>

              {/* Drip Edge & Lateral Water Stops */}
              <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/60 space-y-3">
                <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center justify-between">
                  <span>Larmier & Rejet d Eau Hors Façade</span>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                    audit.isDripOverhangCompliant ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                  }`}>
                    {audit.isDripOverhangCompliant ? 'SAILLIE >= 30 MM CONFORME' : 'SAILLIE INSUFFISANTE'}
                  </span>
                </h4>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">Saillie Extérieure</span>
                    <strong className="text-white font-mono text-sm">{dripOverhangMm} mm</strong>
                    <span className="text-[10px] text-slate-500 block">Débord hors enduit fini</span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">Relevé d Oreilles</span>
                    <strong className="text-teal-400 font-mono text-sm">{audit.endDamHeightMm} mm</strong>
                    <span className="text-[10px] text-slate-500 block">Min 20 mm réglementaire</span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">Longueur Développée</span>
                    <strong className="text-emerald-400 font-mono text-sm">{audit.developedWidthMm} mm</strong>
                    <span className="text-[10px] text-slate-500 block">Largeur tôle dépliée</span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">Masse Totale Bavette</span>
                    <strong className="text-amber-400 font-mono text-sm">{audit.totalFlashingWeightKg} kg</strong>
                    <span className="text-[10px] text-slate-500 block">Alu {currentProfile.nominalThicknessMm} mm</span>
                  </div>
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
                    <Layers className="w-4 h-4 text-teal-400" />
                    Coupe Verticale d Appui Maçonné & Bavette d Écoulement
                  </span>
                  <span className="text-[10px] font-mono text-teal-400">
                    Baie {openingWidthMm} mm • Pente {sillSlopePercent}% • Larmier {dripOverhangMm} mm
                  </span>
                </div>

                {/* SVG CAD Drawing */}
                <div className="w-full max-w-xl bg-slate-950 rounded-lg p-2 border border-slate-800 flex justify-center">
                  <svg
                    viewBox="0 0 500 320"
                    className="w-full h-auto max-h-[300px] select-none font-mono"
                  >
                    <defs>
                      <linearGradient id="concreteGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#334155" />
                        <stop offset="100%" stopColor="#1e293b" />
                      </linearGradient>

                      <linearGradient id="sillAluGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#94a3b8" />
                        <stop offset="50%" stopColor="#cbd5e1" />
                        <stop offset="100%" stopColor="#64748b" />
                      </linearGradient>

                      <linearGradient id="dampenerGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#047857" />
                        <stop offset="100%" stopColor="#10b981" />
                      </linearGradient>
                    </defs>

                    {/* 1. Masonry Wall Throat (Allège Maçonnée en Béton / Brique) */}
                    <polygon points="40,160 220,160 380,185 380,300 40,300" fill="url(#concreteGradient)" stroke="#475569" strokeWidth="1.5" />
                    {/* Concrete hatch lines */}
                    <line x1="60" y1="200" x2="120" y2="280" stroke="#334155" strokeWidth="1" />
                    <line x1="140" y1="200" x2="200" y2="280" stroke="#334155" strokeWidth="1" />
                    <line x1="220" y1="200" x2="280" y2="280" stroke="#334155" strokeWidth="1" />
                    <text x="130" y="250" fill="#64748b" fontSize="10">ALLÈGE MAÇONNÉE</text>

                    {/* Exterior Facade Finished Wall Plaster Line */}
                    <line x1="380" y1="185" x2="380" y2="300" stroke="#94a3b8" strokeWidth="2" />
                    <text x="388" y="270" fill="#94a3b8" fontSize="8">NU FAÇADE ENDUIT</text>

                    {/* 2. Window Frame Bottom Extrusion (Traverse Basse Dormant) */}
                    <rect x="40" y="70" width="100" height="90" fill="#1e293b" stroke="#64748b" strokeWidth="1.5" rx="2" />
                    <rect x="80" y="70" width="20" height="90" fill="#0f172a" stroke="#000" strokeWidth="1" />
                    <text x="90" y="115" fill="#64748b" fontSize="7" textAnchor="middle">RPT</text>
                    <text x="90" y="140" fill="#94a3b8" fontSize="8" textAnchor="middle">DORMANT</text>

                    {/* Drainage weep hole in window frame */}
                    <rect x="125" y="145" width="15" height="5" fill="#38bdf8" rx="1" />
                    <text x="132" y="140" fill="#38bdf8" fontSize="6" textAnchor="middle">Drainage</text>

                    {/* Compribande / Pre-compressed expanding seal under window */}
                    <rect x="45" y="156" width="90" height="6" fill="#0284c7" stroke="#0369a1" strokeWidth="0.8" />
                    <text x="90" y="161" fill="#bae6fd" fontSize="5" textAnchor="middle">JOINT ÉTANCHE</text>

                    {/* 3. Aluminum Flashing Profile (Bavette Pliée) */}
                    {/* Back vertical upstand entering sill slot */}
                    <path
                      d={`M 135,120 L 135,155 L 140,158 L 220,160 L 415,${160 + (wallThroatDepthMm + dripOverhangMm) * (sillSlopePercent / 100) * 0.7} L 415,${160 + (wallThroatDepthMm + dripOverhangMm) * (sillSlopePercent / 100) * 0.7 + 22} L 407,${160 + (wallThroatDepthMm + dripOverhangMm) * (sillSlopePercent / 100) * 0.7 + 22}`}
                      fill="none"
                      stroke="url(#sillAluGradient)"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />

                    {/* Acoustic dampener strip beneath sill */}
                    {acousticDampener !== 'none' && (
                      <path
                        d={`M 220,165 L 380,${165 + (wallThroatDepthMm) * (sillSlopePercent / 100) * 0.7}`}
                        fill="none"
                        stroke="url(#dampenerGradient)"
                        strokeWidth="3"
                        strokeDasharray="4 2"
                      />
                    )}

                    {/* Drip edge projection dimension (Saillie larmier) */}
                    {(() => {
                      const dripX = 415;
                      const facadeX = 380;
                      const dripY = 160 + (wallThroatDepthMm + dripOverhangMm) * (sillSlopePercent / 100) * 0.7;

                      return (
                        <g>
                          {/* Dimension line */}
                          <line x1={facadeX} y1={dripY - 20} x2={dripX} y2={dripY - 20} stroke="#10b981" strokeWidth="1.5" />
                          <line x1={facadeX} y1={dripY - 25} x2={facadeX} y2={dripY - 15} stroke="#10b981" strokeWidth="1.5" />
                          <line x1={dripX} y1={dripY - 25} x2={dripX} y2={dripY - 15} stroke="#10b981" strokeWidth="1.5" />
                          <text x={(facadeX + dripX) / 2} y={dripY - 28} fill="#10b981" fontSize="8" textAnchor="middle" fontWeight="bold">
                            {dripOverhangMm} mm (&gt;= 30 mm)
                          </text>

                          {/* Water droplets dripping from larmier */}
                          <circle cx={dripX - 8} cy={dripY + 35} r="3" fill="#38bdf8" />
                          <circle cx={dripX - 8} cy={dripY + 50} r="2.5" fill="#38bdf8" />
                          <circle cx={dripX - 8} cy={dripY + 65} r="2" fill="#38bdf8" />
                          <text x={dripX - 2} y={dripY + 75} fill="#38bdf8" fontSize="7">Goutte d eau</text>
                        </g>
                      );
                    })()}

                    {/* Slope angle indicator */}
                    <line x1="220" y1="160" x2="350" y2="160" stroke="#64748b" strokeWidth="1" strokeDasharray="3 2" />
                    <text x="290" y="155" fill="#06b6d4" fontSize="8" fontWeight="bold">
                      Pente {sillSlopePercent}% ({audit.sillSlopeDegrees}°)
                    </text>

                    {/* Acoustic label */}
                    {acousticDampener !== 'none' ? (
                      <text x="240" y="190" fill="#10b981" fontSize="8">
                        Amortisseur : {currentDampener.labelFr.split('(')[0].trim()} (-{currentDampener.noiseAttenuationDbA} dBA)
                      </text>
                    ) : (
                      <text x="240" y="190" fill="#f43f5e" fontSize="8">
                        Métal nu résonant (Tambourinage pluie)
                      </text>
                    )}
                  </svg>
                </div>

                {/* Legend bar */}
                <div className="flex flex-wrap items-center justify-center gap-4 text-[10px] text-slate-400 mt-2 font-mono">
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded bg-slate-400 inline-block" />
                    Bavette Alu {currentProfile.nominalThicknessMm} mm
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded bg-emerald-400 inline-block" />
                    Amortisseur Acoustique
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded bg-sky-400 inline-block" />
                    Goutte d Eau Larmier &ge; 30 mm
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded bg-slate-600 inline-block" />
                    Maçonnerie Allège
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: DTU 36.5 & ACOUSTICS */}
          {activeTab === 'dtu365_acoustics' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              
              {/* NF DTU 36.5 Prescriptions */}
              <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/60 space-y-3">
                <div className="flex justify-between items-center">
                  <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-teal-400" />
                    Exigences Réglementaires de Pose (NF DTU 36.5)
                  </h3>
                  <span className={`px-2 py-0.5 rounded text-xs font-mono font-bold ${
                    audit.isSlopeCompliant && audit.isDripOverhangCompliant
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  }`}>
                    {audit.isSlopeCompliant && audit.isDripOverhangCompliant
                      ? 'APPUI PARFAITEMENT CONFORME'
                      : 'NON-CONFORMITÉ DTU DÉTECTÉE'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {/* Slope criterion */}
                  <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 flex items-start gap-2.5">
                    {audit.isSlopeCompliant ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <span className="font-bold text-white block">Pente minimale vers l extérieur : &ge; 5%</span>
                      <p className="text-slate-400 text-[11px] mt-0.5">
                        Appliquée : <strong className="text-white font-mono">{sillSlopePercent}% ({audit.sillSlopeDegrees}°)</strong> ({audit.isSlopeCompliant ? 'Conforme, écoulement fluide prévenant les infiltrations' : 'Non conforme, risque majeur de stagnation et fuite sous traverse'})
                      </p>
                    </div>
                  </div>

                  {/* Overhang criterion */}
                  <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 flex items-start gap-2.5">
                    {audit.isDripOverhangCompliant ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <span className="font-bold text-white block">Saillie du larmier hors crépi : &ge; 30 mm</span>
                      <p className="text-slate-400 text-[11px] mt-0.5">
                        Saillie : <strong className="text-white font-mono">{dripOverhangMm} mm</strong> ({audit.isDripOverhangCompliant ? 'Conforme, rupture nette des filets d eau protégeant la façade' : 'Trop courte, risque de salissures noires par ruissellement capillaire'})
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Acoustic Rain Impact Card */}
              <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/60 space-y-3">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                    <Volume2 className="w-4 h-4 text-emerald-400" />
                    Confort Acoustique sous Pluie d Orage
                  </h4>
                  <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                    audit.isAcousticallyComfortable ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
                  }`}>
                    {audit.rainImpactNoiseDbA} dBA ({audit.isAcousticallyComfortable ? 'Silencieux' : 'Bruyant'})
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">Isolant Anti-Vibratoire</span>
                    <strong className="text-white font-mono text-sm">{currentDampener.labelFr.split('(')[0].trim()}</strong>
                    <span className="text-[10px] text-slate-500 block">Sous la bavette</span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">Atténuation Bruit</span>
                    <strong className="text-emerald-400 font-mono text-sm">-{currentDampener.noiseAttenuationDbA} dBA</strong>
                    <span className="text-[10px] text-slate-500 block">Absorption des impacts</span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">Seuil de Confort Sommeil</span>
                    <strong className="text-cyan-400 font-mono text-sm">&le; 48 dBA</strong>
                    <span className="text-[10px] text-slate-500 block">Chambre à coucher</span>
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
                      <ArrowRight className="w-3.5 h-3.5 text-teal-400 shrink-0 mt-0.5" />
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
                ? 'Conception d appui conforme NF DTU 36.5'
                : audit.overallStatus === 'warning'
                ? 'Améliorations conseillées pour acoustique ou portée'
                : 'Pente ou saillie de larmier insuffisante'}
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
