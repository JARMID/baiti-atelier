import React, { useState, useMemo } from 'react';
import {
  X,
  Zap,
  Sliders,
  MessageCircle,
  HelpCircle,
  ShieldAlert,
  ArrowUp,
  ArrowDown,
  Gauge,
  Radio,
} from 'lucide-react';
import { playTactileClick } from '../../utils/audioFeedback';
import { useConfigStore } from '../../store/configStore';
import {
  calculateShutterMotorTorque,
  getMotorWiringScheme,
  MOTOR_LIMIT_GUIDES,
  SHUTTER_TROUBLESHOOTING_LIST,
  formatShutterElectricianWhatsAppMessage,
  type MotorWiringType,
  type MotorBrand,
} from '../../utils/shutterMotorGuide';

export interface RollerShutterMotorModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialWidth?: number;
  initialHeight?: number;
}

export const RollerShutterMotorModal: React.FC<RollerShutterMotorModalProps> = ({
  isOpen,
  onClose,
  initialWidth = 1400,
  initialHeight = 1400,
}) => {
  const { theme } = useConfigStore();
  const isLight = theme === 'light';

  // Segmented tab: 'wiring' (Schéma câblage), 'torque' (Calculateur couple), 'limits' (Fins de course & pannes)
  const [activeTab, setActiveTab] = useState<'wiring' | 'torque' | 'limits'>('wiring');

  // Wiring settings
  const [wiringType, setWiringType] = useState<MotorWiringType>('filaire_4fils');
  const [activeDirectionTest, setActiveDirectionTest] = useState<'stop' | 'up' | 'down'>('stop');

  // Torque calculator settings
  const [widthMm, setWidthMm] = useState<number>(initialWidth);
  const [heightMm, setHeightMm] = useState<number>(initialHeight);
  const [slatType, setSlatType] = useState<'alu_foam_43' | 'alu_extruded_55' | 'pvc_40'>('alu_foam_43');
  const [tubeDiameterMm, setTubeDiameterMm] = useState<60 | 40>(60);

  // Brand guide settings
  const [selectedBrand, setSelectedBrand] = useState<MotorBrand>('somfy');

  // Slat weight reference in kg/m²
  const slatDensityKgPerM2 = useMemo(() => {
    if (slatType === 'alu_extruded_55') return 7.8;
    if (slatType === 'pvc_40') return 3.2;
    return 4.2; // alu_foam_43
  }, [slatType]);

  // Torque calculation
  const torqueResult = useMemo(() => {
    return calculateShutterMotorTorque(
      widthMm,
      heightMm,
      slatDensityKgPerM2,
      tubeDiameterMm
    );
  }, [widthMm, heightMm, slatDensityKgPerM2, tubeDiameterMm]);

  // Wiring scheme
  const wiringScheme = useMemo(() => {
    return getMotorWiringScheme(wiringType);
  }, [wiringType]);

  // Limit switch guide
  const limitGuide = useMemo(() => {
    return MOTOR_LIMIT_GUIDES[selectedBrand];
  }, [selectedBrand]);

  // WhatsApp dispatch
  const handleWhatsAppDispatch = () => {
    playTactileClick();
    const msg = formatShutterElectricianWhatsAppMessage(
      { width: widthMm, height: heightMm },
      torqueResult,
      wiringType,
      selectedBrand
    );
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div
        className={`w-full max-w-2xl max-h-[92vh] flex flex-col rounded-t-3xl sm:rounded-3xl border shadow-2xl font-mono text-xs overflow-hidden ${
          isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-[#0B0F19] border-white/10 text-white'
        }`}
      >
        {/* 1. HEADER */}
        <div className="p-4 border-b border-black/10 dark:border-white/10 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
              <Zap className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-bold truncate">
                Raccordement & Réglage Moteur 230V
              </h3>
              <p className="text-[10px] text-zinc-500 truncate">
                Câblage électrique, calcul de couple (Nm) et réglage des fins de course
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              playTactileClick();
              onClose();
            }}
            className={`p-1.5 rounded-xl cursor-pointer ${
              isLight ? 'hover:bg-slate-100 text-slate-500' : 'hover:bg-white/10 text-zinc-400'
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 2. SEGMENTED TABS */}
        <div className="flex border-b border-black/10 dark:border-white/10 p-2 gap-1.5 shrink-0">
          <button
            type="button"
            onClick={() => {
              playTactileClick();
              setActiveTab('wiring');
            }}
            className={`flex-1 py-2 px-2 rounded-xl text-center font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
              activeTab === 'wiring'
                ? 'bg-[#D4AF37] text-slate-950 shadow-sm'
                : isLight
                ? 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                : 'bg-white/5 text-zinc-400 hover:text-white'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Câblage 230V</span>
          </button>

          <button
            type="button"
            onClick={() => {
              playTactileClick();
              setActiveTab('torque');
            }}
            className={`flex-1 py-2 px-2 rounded-xl text-center font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
              activeTab === 'torque'
                ? 'bg-emerald-500 text-slate-950 shadow-sm'
                : isLight
                ? 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                : 'bg-white/5 text-zinc-400 hover:text-white'
            }`}
          >
            <Gauge className="w-3.5 h-3.5" />
            <span>Couple Nm ({torqueResult.recommendedMotorNm} Nm)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              playTactileClick();
              setActiveTab('limits');
            }}
            className={`flex-1 py-2 px-2 rounded-xl text-center font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
              activeTab === 'limits'
                ? 'bg-cyan-500 text-slate-950 shadow-sm'
                : isLight
                ? 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                : 'bg-white/5 text-zinc-400 hover:text-white'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Fins de Course</span>
          </button>
        </div>

        {/* 3. CONTENT SCROLL AREA */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* TAB 1: WIRING DIAGRAM */}
          {activeTab === 'wiring' && (
            <div className="space-y-4">
              {/* Wiring Type Selector */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    playTactileClick();
                    setWiringType('filaire_4fils');
                  }}
                  className={`p-2.5 rounded-2xl border flex items-center justify-center gap-2 cursor-pointer transition-all ${
                    wiringType === 'filaire_4fils'
                      ? 'bg-amber-500/20 border-amber-500/40 text-amber-400 font-bold shadow-xs'
                      : isLight
                      ? 'bg-slate-50 border-slate-200 text-slate-600'
                      : 'bg-white/5 border-white/10 text-zinc-400'
                  }`}
                >
                  <Zap className="w-4 h-4" />
                  <span>Moteur Filaire (4 Fils)</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    playTactileClick();
                    setWiringType('radio_3fils');
                  }}
                  className={`p-2.5 rounded-2xl border flex items-center justify-center gap-2 cursor-pointer transition-all ${
                    wiringType === 'radio_3fils'
                      ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-400 font-bold shadow-xs'
                      : isLight
                      ? 'bg-slate-50 border-slate-200 text-slate-600'
                      : 'bg-white/5 border-white/10 text-zinc-400'
                  }`}
                >
                  <Radio className="w-4 h-4" />
                  <span>Moteur Radio RTS (3 Fils)</span>
                </button>
              </div>

              {/* Graphical Interactive Wiring Diagram */}
              <div
                className={`p-4 rounded-3xl border space-y-3 ${
                  isLight ? 'bg-slate-50 border-slate-200' : 'bg-black/30 border-white/10'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-zinc-400">
                    Schéma de Connexion Électrique 230V
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 font-bold border border-emerald-500/30">
                    230V ~ 50Hz
                  </span>
                </div>

                {/* Conductors Visual Cards */}
                <div className="space-y-2">
                  {wiringScheme.conductors.map((conductor) => (
                    <div
                      key={conductor.colorNameFr}
                      className={`p-2.5 rounded-2xl border flex items-center justify-between gap-3 ${
                        isLight ? 'bg-white border-slate-200' : 'bg-[#0E131F] border-white/5'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className="w-4 h-10 rounded-lg shadow-sm shrink-0 border border-white/20 flex items-center justify-center"
                          style={{ backgroundColor: conductor.hexColor }}
                        >
                          {conductor.colorNameFr.includes('Vert') && (
                            <div className="w-1.5 h-full bg-yellow-400" />
                          )}
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span
                              className={`font-bold ${
                                isLight ? 'text-slate-900' : 'text-white'
                              }`}
                            >
                              Fil {conductor.colorNameFr}
                            </span>
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-black/10 dark:bg-white/10 text-zinc-400">
                              {conductor.terminalCode}
                            </span>
                          </div>
                          <p className="text-[10px] text-zinc-500 truncate">
                            {conductor.roleFr}
                          </p>
                        </div>
                      </div>

                      <span className="text-[9px] text-zinc-400 max-w-[40%] text-right truncate">
                        {conductor.notesFr}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Direction Test Interactive Buttons (For Filaire) */}
                {wiringType === 'filaire_4fils' && (
                  <div className="p-3 rounded-2xl bg-black/5 dark:bg-black/40 border border-black/5 dark:border-white/5 space-y-2">
                    <div className="flex items-center justify-between text-[10px] text-zinc-400">
                      <span>Simulation Inverseur Mural (Double Poussoir) :</span>
                      <span className="font-bold text-amber-400">
                        {activeDirectionTest === 'up'
                          ? 'Phase Marron active (Montée ▲)'
                          : activeDirectionTest === 'down'
                          ? 'Phase Noire active (Descente ▼)'
                          : 'Neutre seul (Arrêt ■)'}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          playTactileClick();
                          setActiveDirectionTest('up');
                        }}
                        className={`py-2 rounded-xl border flex items-center justify-center gap-1 font-bold text-xs cursor-pointer transition-all ${
                          activeDirectionTest === 'up'
                            ? 'bg-emerald-500 text-slate-950 border-emerald-500 shadow-xs'
                            : isLight
                            ? 'bg-white border-slate-300 text-slate-700'
                            : 'bg-white/5 border-white/10 text-zinc-300'
                        }`}
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                        <span>Montée (▲)</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          playTactileClick();
                          setActiveDirectionTest('stop');
                        }}
                        className={`py-2 rounded-xl border flex items-center justify-center gap-1 font-bold text-xs cursor-pointer transition-all ${
                          activeDirectionTest === 'stop'
                            ? 'bg-zinc-600 text-white border-zinc-600 shadow-xs'
                            : isLight
                            ? 'bg-white border-slate-300 text-slate-700'
                            : 'bg-white/5 border-white/10 text-zinc-300'
                        }`}
                      >
                        <span>Stop (■)</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          playTactileClick();
                          setActiveDirectionTest('down');
                        }}
                        className={`py-2 rounded-xl border flex items-center justify-center gap-1 font-bold text-xs cursor-pointer transition-all ${
                          activeDirectionTest === 'down'
                            ? 'bg-cyan-500 text-slate-950 border-cyan-500 shadow-xs'
                            : isLight
                            ? 'bg-white border-slate-300 text-slate-700'
                            : 'bg-white/5 border-white/10 text-zinc-300'
                        }`}
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                        <span>Descente (▼)</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Inversion Warning & Tip */}
                <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px] space-y-1">
                  <div className="flex items-center gap-1.5 font-bold">
                    <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>Astuce Inversion de Sens de Rotation</span>
                  </div>
                  <p className="text-[10px] text-amber-300/90 leading-relaxed">
                    {wiringScheme.inversionTipFr}
                  </p>
                </div>

                {/* Electrical Protection Norms */}
                <div className="p-3 rounded-2xl bg-black/10 dark:bg-black/50 border border-black/10 dark:border-white/5 text-[10px] text-zinc-400 space-y-1">
                  <span className="font-bold block text-zinc-300">
                    Norme Électrique & Protection Tableau :
                  </span>
                  <p>{wiringScheme.electricalProtectionFr}</p>
                  <p>{wiringScheme.switchConnectionFr}</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: MOTOR TORQUE CALCULATOR */}
          {activeTab === 'torque' && (
            <div className="space-y-4">
              {/* Inputs Grid */}
              <div
                className={`p-4 rounded-3xl border space-y-3 ${
                  isLight ? 'bg-slate-50 border-slate-200' : 'bg-black/30 border-white/10'
                }`}
              >
                <span className="text-[11px] font-bold text-zinc-400 block">
                  Paramètres Physiques du Tablier
                </span>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-zinc-500 block mb-0.5">Largeur (mm)</label>
                    <input
                      type="number"
                      step="50"
                      value={widthMm}
                      onChange={(e) => setWidthMm(Math.max(400, parseInt(e.target.value) || 0))}
                      className={`w-full p-2 rounded-xl border font-bold ${
                        isLight ? 'bg-white border-slate-300' : 'bg-black/30 border-white/10'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-zinc-500 block mb-0.5">Hauteur (mm)</label>
                    <input
                      type="number"
                      step="50"
                      value={heightMm}
                      onChange={(e) => setHeightMm(Math.max(400, parseInt(e.target.value) || 0))}
                      className={`w-full p-2 rounded-xl border font-bold ${
                        isLight ? 'bg-white border-slate-300' : 'bg-black/30 border-white/10'
                      }`}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-zinc-500 block mb-0.5">Type de Lame</label>
                    <select
                      value={slatType}
                      onChange={(e) => setSlatType(e.target.value as any)}
                      className={`w-full p-2 rounded-xl border ${
                        isLight ? 'bg-white border-slate-300' : 'bg-black/30 border-white/10'
                      }`}
                    >
                      <option value="alu_foam_43">Alu Double Paroi 43mm (4.2 kg/m²)</option>
                      <option value="alu_extruded_55">Alu Extrudé Sécurité 55mm (7.8 kg/m²)</option>
                      <option value="pvc_40">PVC Standard 40mm (3.2 kg/m²)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] text-zinc-500 block mb-0.5">Tube d Enroulement</label>
                    <select
                      value={tubeDiameterMm}
                      onChange={(e) => setTubeDiameterMm(parseInt(e.target.value) as any)}
                      className={`w-full p-2 rounded-xl border ${
                        isLight ? 'bg-white border-slate-300' : 'bg-black/30 border-white/10'
                      }`}
                    >
                      <option value={60}>Octogonal Ø60 mm (Standard)</option>
                      <option value={40}>Octogonal Ø40 mm (Petit coffre)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Live Calculation Output Card */}
              <div
                className={`p-4 rounded-3xl border space-y-3 ${
                  isLight
                    ? 'bg-emerald-50/70 border-emerald-300 text-emerald-950 shadow-xs'
                    : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Gauge className="w-5 h-5 text-emerald-400" />
                    <div>
                      <span className="text-[10px] uppercase font-bold text-zinc-400 block">
                        Résultat Dimensionnement Moteur
                      </span>
                      <h4 className="text-base font-black text-emerald-400">
                        {torqueResult.motorCommercialLabelFr}
                      </h4>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-2xl font-black text-[#D4AF37]">
                      {torqueResult.recommendedMotorNm} <span className="text-xs">Nm</span>
                    </span>
                    <span className="text-[9px] text-zinc-500 block">
                      Calculé : {torqueResult.calculatedTorqueNm} Nm
                    </span>
                  </div>
                </div>

                {/* 4 KPI Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center font-mono text-xs pt-1">
                  <div className="p-2 rounded-2xl bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/5">
                    <span className="text-[9px] text-zinc-500 block">Surface Tablier</span>
                    <span className="font-bold">{torqueResult.curtainAreaM2} m²</span>
                  </div>

                  <div className="p-2 rounded-2xl bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/5">
                    <span className="text-[9px] text-zinc-500 block">Poids Tablier</span>
                    <span className="font-bold text-cyan-400">{torqueResult.curtainWeightKg} kg</span>
                  </div>

                  <div className="p-2 rounded-2xl bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/5">
                    <span className="text-[9px] text-zinc-500 block">Capacité Max Moteur</span>
                    <span className="font-bold text-amber-400">jusqu à {torqueResult.maxCurtainWeightKg} kg</span>
                  </div>

                  <div className="p-2 rounded-2xl bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/5">
                    <span className="text-[9px] text-zinc-500 block">Axe Requis</span>
                    <span className="font-bold">Ø{torqueResult.tubeDiameterMm} mm</span>
                  </div>
                </div>

                {/* Sizing physics note */}
                <p className="text-[10px] text-zinc-500 leading-relaxed pt-1">
                  Le calcul intègre le coefficient de frottement dans les coulisses EPDM (1.30) et le rendement du réducteur planétaire (0.85) selon les règles professionnelles du SNFA.
                </p>
              </div>
            </div>
          )}

          {/* TAB 3: LIMIT SWITCH CALIBRATION & DIAGNOSTICS */}
          {activeTab === 'limits' && (
            <div className="space-y-4">
              {/* Brand Selector */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-zinc-400 block">
                  Marque du Moteur Tubulaire Installé
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                  {(['somfy', 'becker', 'nice', 'acm_universel'] as const).map((b) => (
                    <button
                      key={b}
                      type="button"
                      onClick={() => {
                        playTactileClick();
                        setSelectedBrand(b);
                      }}
                      className={`p-2 rounded-2xl border text-center font-bold text-xs cursor-pointer transition-all ${
                        selectedBrand === b
                          ? 'bg-cyan-500 text-slate-950 border-cyan-500 shadow-sm'
                          : isLight
                          ? 'bg-slate-50 border-slate-200 text-slate-700'
                          : 'bg-white/5 border-white/10 text-zinc-400'
                      }`}
                    >
                      {b === 'acm_universel' ? 'ACM / Universel' : b.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Brand Specific Instructions Card */}
              <div
                className={`p-4 rounded-3xl border space-y-3 ${
                  isLight ? 'bg-slate-50 border-slate-200' : 'bg-black/30 border-white/10'
                }`}
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-xs">{limitGuide.brandName}</h4>
                  <span className="text-[10px] text-zinc-500">
                    Outil : {limitGuide.toolNeededFr}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="p-2 rounded-xl bg-black/5 dark:bg-black/30 border border-black/5 dark:border-white/5">
                    <span className="text-[9px] text-zinc-500 block">Butée Haute (▲)</span>
                    <span className="font-bold text-emerald-400">{limitGuide.upAdjustmentFr}</span>
                  </div>

                  <div className="p-2 rounded-xl bg-black/5 dark:bg-black/30 border border-black/5 dark:border-white/5">
                    <span className="text-[9px] text-zinc-500 block">Butée Basse (▼)</span>
                    <span className="font-bold text-cyan-400">{limitGuide.downAdjustmentFr}</span>
                  </div>
                </div>

                {/* Steps List */}
                <div className="space-y-1.5 pt-1">
                  <span className="text-[10px] font-bold text-zinc-400 block">
                    Procédure de Calibrage :
                  </span>
                  {limitGuide.instructions.map((step, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-[11px] leading-relaxed">
                      <span className="w-4 h-4 rounded-full bg-cyan-500/20 text-cyan-400 font-bold flex items-center justify-center shrink-0 mt-0.5 text-[10px]">
                        {idx + 1}
                      </span>
                      <span className={isLight ? 'text-slate-800' : 'text-zinc-300'}>{step}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Common Diagnostics List */}
              <div className="space-y-2 pt-2">
                <div className="flex items-center gap-1.5 text-zinc-400 font-bold text-[11px]">
                  <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
                  <span>Diagnostics des Pannes Fréquentes sur Chantier</span>
                </div>

                <div className="space-y-2">
                  {SHUTTER_TROUBLESHOOTING_LIST.map((t, idx) => (
                    <div
                      key={idx}
                      className={`p-3 rounded-2xl border space-y-1 text-[11px] ${
                        isLight ? 'bg-white border-slate-200' : 'bg-[#0E131F] border-white/5'
                      }`}
                    >
                      <div className="font-bold text-rose-400 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                        <span>{t.symptomFr}</span>
                      </div>
                      <div className="text-zinc-500 pl-3">
                        <strong>Cause :</strong> {t.causeFr}
                      </div>
                      <div className="text-emerald-400 pl-3">
                        <strong>Solution :</strong> {t.solutionFr}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 4. ACTION FOOTER */}
        <div className="p-3 border-t border-black/10 dark:border-white/10 flex items-center justify-between gap-2 shrink-0 bg-black/5 dark:bg-white/5">
          <button
            type="button"
            onClick={handleWhatsAppDispatch}
            className="flex-1 py-2.5 px-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer hover:bg-emerald-500/25 active:scale-98 transition-all min-h-[44px]"
            title="Transmettre la fiche de câblage et de réglage par WhatsApp à l électricien"
          >
            <MessageCircle className="w-4 h-4 shrink-0" />
            <span className="truncate">Envoyer Fiche Raccordement WhatsApp</span>
          </button>

          <button
            type="button"
            onClick={() => {
              playTactileClick();
              onClose();
            }}
            className="py-2.5 px-4 rounded-2xl bg-gradient-to-r from-[#C5A880] to-[#D4AF37] text-slate-950 font-bold text-xs cursor-pointer hover:brightness-110 active:scale-98 transition-all min-h-[44px]"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
