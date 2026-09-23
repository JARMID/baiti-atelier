import React, { useState, useMemo } from 'react';
import {
  X,
  FileCheck,
  Sliders,
  Layers,
  Scale,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  Accessibility,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { playTactileClick, playSwitchSound, playSlideTick } from '../../utils/audioFeedback';
import {
  computeSlidingCarriageAudit,
  CARRIAGE_SPECS,
  TRACK_SPECS,
  type CarriageModelType,
  type TrackRailType,
  type BrushSealType,
} from '../../utils/slidingCarriageManager';
import { generateSlidingCarriageNoticePdf } from '../../utils/pdfGenerator';

interface SlidingCarriageModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialWidth?: number;
  initialHeight?: number;
  initialGlassThickness?: number;
  projectReference?: string;
  wilayaName?: string;
  clientName?: string;
}

export const SlidingCarriageModal: React.FC<SlidingCarriageModalProps> = ({
  isOpen,
  onClose,
  initialWidth = 2000,
  initialHeight = 2150,
  initialGlassThickness = 8,
  projectReference = 'Coulissant Grand Format',
  wilayaName = '16 - Alger',
  clientName = 'Particulier',
}) => {
  const [activeTab, setActiveTab] = useState<'config' | 'loads_capacity' | 'cad_section_view' | 'pmr_forces'>('config');

  // Input states
  // For a 2-sash sliding window of initialWidth, single sash width is approx initialWidth / 2
  const defaultSashWidth = initialWidth > 1400 ? Math.round(initialWidth / 2) : initialWidth;
  const [sashWidthMm, setSashWidthMm] = useState<number>(defaultSashWidth);
  const [sashHeightMm, setSashHeightMm] = useState<number>(initialHeight);
  const [glassThicknessMm, setGlassThicknessMm] = useState<number>(initialGlassThickness || 8);
  const [profileSeries, setProfileSeries] = useState<'gamme_45_standard' | 'gamme_67_heavy' | 'lift_slide_120'>('gamme_67_heavy');
  const [carriageModel, setCarriageModel] = useState<CarriageModelType>('carriage_tandem_pom_160kg');
  const [trackRail, setTrackRail] = useState<TrackRailType>('rail_stainless_steel_insert');
  const [brushSeal, setBrushSeal] = useState<BrushSealType>('brush_silicone_tri_fin');
  const [handleLeverLengthMm, setHandleLeverLengthMm] = useState<number>(160);

  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  // Compute audit
  const audit = useMemo(() => {
    return computeSlidingCarriageAudit({
      sashWidthMm,
      sashHeightMm,
      glassThicknessMm,
      profileSeries,
      carriageModel,
      trackRail,
      brushSeal,
      handleLeverLengthMm,
      wilayaName,
      clientName,
      projectReference,
    });
  }, [
    sashWidthMm,
    sashHeightMm,
    glassThicknessMm,
    profileSeries,
    carriageModel,
    trackRail,
    brushSeal,
    handleLeverLengthMm,
    wilayaName,
    clientName,
    projectReference,
  ]);

  if (!isOpen) return null;

  const currentCarriage = CARRIAGE_SPECS[carriageModel];
  const currentTrack = TRACK_SPECS[trackRail];

  const handleExportPdf = async () => {
    playTactileClick();
    setIsGeneratingPdf(true);
    try {
      const docId = `CAR-${Date.now().toString().slice(-6)}`;
      await generateSlidingCarriageNoticePdf({
        documentId: docId,
        projectRef: projectReference,
        clientName,
        wilayaName,
        input: {
          sashWidthMm,
          sashHeightMm,
          glassThicknessMm,
          profileSeries,
          carriageModel,
          trackRail,
          brushSeal,
          handleLeverLengthMm,
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
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <span>Chariots Coulissant & Effort PMR</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 font-mono">
                  NF EN 13126-15 / NF EN 12046-2 / Décret 06-455
                </span>
              </h2>
              <p className="text-[11px] text-slate-400">
                Bilan massique vantail, capacité des galets, roulement sur rail inox et accessibilité fauteuil
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
            <span className="text-slate-400 block text-[10px]">Masse Vantail</span>
            <strong className="text-white text-sm">{audit.totalSashWeightKg} kg</strong>
            <span className="text-[10px] text-blue-400 block">Vitrage : {audit.glassWeightKg} kg ({audit.glassAreaM2} m²)</span>
          </div>

          <div className="bg-slate-900/90 p-2 rounded-lg border border-slate-800">
            <span className="text-slate-400 block text-[10px]">Charge / Chariot</span>
            <strong className={audit.isCapacityCompliant ? 'text-emerald-400 text-sm' : 'text-rose-400 text-sm'}>
              {audit.loadPerCarriageKg} kg ({audit.capacityUtilizationPercent}%)
            </strong>
            <span className="text-[10px] text-slate-400 block">Capacité max : {audit.ratedMaxLoadPerSashKg} kg</span>
          </div>

          <div className="bg-slate-900/90 p-2 rounded-lg border border-slate-800">
            <span className="text-slate-400 block text-[10px]">Effort Démarrage</span>
            <strong className={audit.isPmrForceCompliant ? 'text-emerald-400 text-sm' : 'text-amber-400 text-sm'}>
              {audit.startingFrictionForceN} N
            </strong>
            <span className="text-[10px] text-slate-400 block">
              {audit.en12046Class === 'classe_2_ergonomique'
                ? 'Classe 2 Ergonomique'
                : audit.en12046Class === 'classe_1_standard'
                ? 'Classe 1 Standard'
                : 'Hors Tolérance'}
            </span>
          </div>

          <div className="bg-slate-900/90 p-2 rounded-lg border border-slate-800">
            <span className="text-slate-400 block text-[10px]">Accès PMR (Décret 06-455)</span>
            <strong className={audit.isPmrForceCompliant && audit.isThresholdPmrCompliant ? 'text-emerald-400 text-sm' : 'text-amber-400 text-sm'}>
              {audit.isPmrForceCompliant && audit.isThresholdPmrCompliant
                ? '100% Conforme'
                : audit.isPmrForceCompliant
                ? 'Effort OK, Seuil > 20mm'
                : 'Effort Manuel Trop Dur'}
            </strong>
            <span className="text-[10px] text-slate-400 block">Ressaut Seuil : {audit.thresholdStepHeightMm} mm</span>
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
            Configuration & Profilés
          </button>

          <button
            onClick={() => {
              playSwitchSound();
              setActiveTab('loads_capacity');
            }}
            className={`min-h-[44px] px-4 py-2.5 text-xs font-medium border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'loads_capacity'
                ? 'border-blue-500 text-blue-400 bg-blue-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Scale className="w-4 h-4" />
            Bilan des Charges (NF EN 13126-15)
          </button>

          <button
            onClick={() => {
              playSwitchSound();
              setActiveTab('cad_section_view');
            }}
            className={`min-h-[44px] px-4 py-2.5 text-xs font-medium border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'cad_section_view'
                ? 'border-blue-500 text-blue-400 bg-blue-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-4 h-4" />
            Schéma 2D CAD Traverse Basse
          </button>

          <button
            onClick={() => {
              playSwitchSound();
              setActiveTab('pmr_forces');
            }}
            className={`min-h-[44px] px-4 py-2.5 text-xs font-medium border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'pmr_forces'
                ? 'border-blue-500 text-blue-400 bg-blue-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Accessibility className="w-4 h-4" />
            Efforts & Décret PMR 06-455
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">

          {/* TAB 1: CONFIGURATION */}
          {activeTab === 'config' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              
              {/* Vantail Geometry Controls */}
              <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/60 space-y-3">
                <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-blue-400" />
                  1. Dimensions du Vantail Coulissant
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Width */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-300">Largeur du vantail mobile (L) :</span>
                      <span className="font-mono text-blue-400 font-bold">{sashWidthMm} mm</span>
                    </div>
                    <input
                      type="range"
                      min={600}
                      max={3200}
                      step={25}
                      value={sashWidthMm}
                      onChange={(e) => {
                        playSlideTick();
                        setSashWidthMm(Number(e.target.value));
                      }}
                      className="w-full accent-blue-500 cursor-pointer h-2 bg-slate-700 rounded-lg"
                    />
                    <div className="flex justify-between text-[10px] text-slate-500">
                      <span>600 mm (châssis étroit)</span>
                      <span>1800 mm</span>
                      <span>3200 mm (grand format)</span>
                    </div>
                  </div>

                  {/* Height */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-300">Hauteur du vantail mobile (H) :</span>
                      <span className="font-mono text-blue-400 font-bold">{sashHeightMm} mm</span>
                    </div>
                    <input
                      type="range"
                      min={1000}
                      max={3500}
                      step={25}
                      value={sashHeightMm}
                      onChange={(e) => {
                        playSlideTick();
                        setSashHeightMm(Number(e.target.value));
                      }}
                      className="w-full accent-blue-500 cursor-pointer h-2 bg-slate-700 rounded-lg"
                    />
                    <div className="flex justify-between text-[10px] text-slate-500">
                      <span>1000 mm (allège)</span>
                      <span>2150 mm (porte-fenêtre)</span>
                      <span>3500 mm (hauteur plafond)</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Glass & Profile Series Selection */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Profile Series */}
                <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/60 space-y-2">
                  <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                    Série de Menuiserie Aluminium
                  </h4>
                  <div className="space-y-2">
                    {[
                      {
                        id: 'gamme_45_standard',
                        label: 'Gamme 45 mm RPT Standard',
                        sub: 'Pour baies résidentielles courantes (2.4 kg/m linéaire)',
                      },
                      {
                        id: 'gamme_67_heavy',
                        label: 'Gamme 67 mm Renforcée Lourde',
                        sub: 'Grande inertie mécanique et double vitrage épais (3.6 kg/m)',
                      },
                      {
                        id: 'lift_slide_120',
                        label: 'Système Levant-Coulissant 120 mm',
                        sub: 'Châssis architectural monumental à rupture élargie (5.2 kg/m)',
                      },
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => {
                          playTactileClick();
                          setProfileSeries(opt.id as any);
                          if (opt.id === 'lift_slide_120') {
                            setCarriageModel('carriage_lift_slide_300kg');
                            setBrushSeal('gasket_epdm_lift_slide');
                            setHandleLeverLengthMm(220);
                          }
                        }}
                        className={`w-full text-left p-2.5 rounded-xl border transition-all cursor-pointer min-h-[44px] ${
                          profileSeries === opt.id
                            ? 'bg-blue-600/20 border-blue-500 text-white'
                            : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        <div className="text-xs font-bold">{opt.label}</div>
                        <div className="text-[10px] text-slate-400">{opt.sub}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Glazing thickness */}
                <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/60 space-y-2">
                  <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                    Composition & Épaisseur du Vitrage
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { mm: 6, label: '6 mm', desc: 'Simple trempé 6mm' },
                      { mm: 8, label: '8 mm verre', desc: 'Double 4/16/4 standard' },
                      { mm: 10, label: '10 mm verre', desc: 'Double 6/14/4 feuilleté' },
                      { mm: 12, label: '12 mm verre', desc: 'Double 6/16/6 acoustique' },
                      { mm: 16, label: '16 mm verre', desc: 'Double sécurit 44.2/12/44.2' },
                      { mm: 20, label: '20 mm verre', desc: 'Triple vitrage sécurité' },
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
                </div>
              </div>

              {/* Hardware: Carriages & Track Rail */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Carriage Model */}
                <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/60 space-y-2">
                  <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center justify-between">
                    <span>Modèle de Chariots de Roulement (x2)</span>
                    <span className="text-[10px] text-blue-400 font-mono">NF EN 13126-15</span>
                  </h4>
                  <div className="space-y-1.5">
                    {Object.values(CARRIAGE_SPECS).map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => {
                          playTactileClick();
                          setCarriageModel(c.id);
                        }}
                        className={`w-full text-left p-2.5 rounded-xl border transition-all cursor-pointer min-h-[44px] ${
                          carriageModel === c.id
                            ? 'bg-blue-600/20 border-blue-500 text-white shadow-sm'
                            : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-bold">{c.labelFr}</span>
                          <span className="px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 font-mono text-[10px]">
                            {c.maxSashLoadKg} kg
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          {c.wheelCount} galets Ø{c.wheelDiameterMm}mm ({c.wheelMaterial}) • {c.bearingType}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Track Rail & Gaskets */}
                <div className="space-y-4">
                  {/* Track Rail */}
                  <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/60 space-y-2">
                    <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                      Profil du Rail Bas de Roulement
                    </h4>
                    <div className="space-y-1.5">
                      {Object.values(TRACK_SPECS).map((t) => (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => {
                            playTactileClick();
                            setTrackRail(t.id);
                          }}
                          className={`w-full text-left p-2.5 rounded-xl border transition-all cursor-pointer min-h-[44px] ${
                            trackRail === t.id
                              ? 'bg-blue-600/20 border-blue-500 text-white shadow-sm'
                              : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700'
                          }`}
                        >
                          <div className="flex justify-between items-center text-xs">
                            <span className="font-bold">{t.labelFr}</span>
                            <span className="text-[10px] font-mono text-cyan-400">mu = {t.frictionCoefficientMu}</span>
                          </div>
                          <div className="text-[10px] text-slate-400 mt-0.5 flex justify-between">
                            <span>{t.material}</span>
                            <span className={t.isPmrCompliant ? 'text-emerald-400 font-semibold' : 'text-amber-400'}>
                              Seuil {t.thresholdHeightAboveFloorMm} mm {t.isPmrCompliant ? '(PMR)' : ''}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Weatherseal brush */}
                  <div className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-700/60 space-y-2">
                    <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                      Joints d Étanchéité
                    </h4>
                    <div className="grid grid-cols-3 gap-1.5">
                      {[
                        { id: 'brush_standard_fin_seal', label: 'Brosse Fin-Seal', desc: 'Standard polypropylène' },
                        { id: 'brush_silicone_tri_fin', label: 'Silicone Triple', desc: 'Haute glisse silencieuse' },
                        { id: 'gasket_epdm_lift_slide', label: 'Joints EPDM', desc: 'Écrasement levant-coulissant' },
                      ].map((b) => (
                        <button
                          key={b.id}
                          type="button"
                          onClick={() => {
                            playTactileClick();
                            setBrushSeal(b.id as any);
                          }}
                          className={`p-2 rounded-lg border text-center transition-all cursor-pointer min-h-[44px] ${
                            brushSeal === b.id
                              ? 'bg-blue-600/20 border-blue-500 text-white font-bold'
                              : 'bg-slate-900/60 border-slate-800 text-slate-300'
                          }`}
                        >
                          <div className="text-[11px]">{b.label}</div>
                          <div className="text-[9px] text-slate-400">{b.desc}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: LOADS & CAPACITY */}
          {activeTab === 'loads_capacity' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              
              {/* Detailed Mass Breakdown Card */}
              <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/60 space-y-3">
                <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Scale className="w-4 h-4 text-blue-400" />
                    Bilan Détaillé des Masses du Vantail
                  </span>
                  <span className="text-sm font-mono font-bold text-blue-400">
                    Total : {audit.totalSashWeightKg} kg
                  </span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Glass */}
                  <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800">
                    <div className="text-xs text-slate-400">Panneau de Vitrage</div>
                    <div className="text-lg font-bold font-mono text-white mt-1">{audit.glassWeightKg} kg</div>
                    <div className="text-[10px] text-slate-500 mt-1">
                      Surface : {audit.glassAreaM2} m² • Épaisseur cumulée : {glassThicknessMm} mm (2.5 kg/m²/mm)
                    </div>
                  </div>

                  {/* Aluminum profile */}
                  <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800">
                    <div className="text-xs text-slate-400">Profilés Cadre Aluminium</div>
                    <div className="text-lg font-bold font-mono text-white mt-1">{audit.profileWeightKg} kg</div>
                    <div className="text-[10px] text-slate-500 mt-1">
                      Périmètre : {((sashWidthMm + sashHeightMm) * 2 / 1000).toFixed(2)} m • Masse profilé au mètre
                    </div>
                  </div>

                  {/* Hardware & Fittings */}
                  <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800">
                    <div className="text-xs text-slate-400">Quincaillerie & Équerres</div>
                    <div className="text-lg font-bold font-mono text-white mt-1">{audit.hardwareWeightKg} kg</div>
                    <div className="text-[10px] text-slate-500 mt-1">
                      Crémone multipoints, gâches, poignée, chariots et cales
                    </div>
                  </div>
                </div>

                {/* Visual Proportion Bar */}
                <div className="space-y-1 pt-2">
                  <div className="flex justify-between text-[11px] text-slate-400 font-mono">
                    <span>Répartition des masses</span>
                    <span>
                      Verre {Math.round((audit.glassWeightKg / audit.totalSashWeightKg) * 100)}% • Profilé {Math.round((audit.profileWeightKg / audit.totalSashWeightKg) * 100)}% • Accessoires {Math.round((audit.hardwareWeightKg / audit.totalSashWeightKg) * 100)}%
                    </span>
                  </div>
                  <div className="h-2.5 w-full rounded-full bg-slate-800 overflow-hidden flex">
                    <div
                      style={{ width: `${(audit.glassWeightKg / audit.totalSashWeightKg) * 100}%` }}
                      className="bg-blue-500 h-full"
                      title="Vitrage"
                    />
                    <div
                      style={{ width: `${(audit.profileWeightKg / audit.totalSashWeightKg) * 100}%` }}
                      className="bg-cyan-500 h-full"
                      title="Profilés Aluminium"
                    />
                    <div
                      style={{ width: `${(audit.hardwareWeightKg / audit.totalSashWeightKg) * 100}%` }}
                      className="bg-amber-500 h-full"
                      title="Quincaillerie"
                    />
                  </div>
                </div>
              </div>

              {/* Carriage Capacity Evaluation */}
              <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/60 space-y-3">
                <div className="flex justify-between items-center">
                  <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                    <CheckCircle2 className={`w-4 h-4 ${audit.isCapacityCompliant ? 'text-emerald-400' : 'text-rose-400'}`} />
                    Vérification de la Capacité Portante (NF EN 13126-15)
                  </h3>
                  <span className={`px-2 py-0.5 rounded text-xs font-mono font-bold ${
                    audit.isCapacityCompliant
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                  }`}>
                    {audit.isCapacityCompliant ? 'CHARGE ADMISSIBLE' : 'SURCHARGE CRITIQUE'}
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-300">Taux d utilisation des chariots :</span>
                    <span className="font-mono font-bold text-white">
                      {audit.capacityUtilizationPercent}% (Masse {audit.totalSashWeightKg} kg / Capacité max {audit.ratedMaxLoadPerSashKg} kg)
                    </span>
                  </div>
                  <div className="h-3 w-full rounded-full bg-slate-800 overflow-hidden relative">
                    <div
                      style={{ width: `${Math.min(100, audit.capacityUtilizationPercent)}%` }}
                      className={`h-full transition-all duration-300 ${
                        audit.capacityUtilizationPercent <= 70
                          ? 'bg-emerald-500'
                          : audit.capacityUtilizationPercent <= 85
                          ? 'bg-amber-500'
                          : 'bg-rose-500'
                      }`}
                    />
                  </div>
                </div>

                {/* Specs breakdown grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-xs">
                  <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">Nombre de Chariots</span>
                    <strong className="text-white font-mono">2 ensembles</strong>
                    <span className="text-[10px] text-slate-500 block">Aux extrémités du vantail</span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">Charge par Chariot</span>
                    <strong className="text-cyan-400 font-mono">{audit.loadPerCarriageKg} kg</strong>
                    <span className="text-[10px] text-slate-500 block">Répartition symétrique P/2</span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">Réglage Micrométrique</span>
                    <strong className="text-emerald-400 font-mono">± {currentCarriage.adjustmentRangeMm} mm</strong>
                    <span className="text-[10px] text-slate-500 block">Vis hexagonale en nez</span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">Endurance Mécanique</span>
                    <strong className="text-amber-400 font-mono">{currentCarriage.enduranceClassCycles.toLocaleString('fr-DZ')}</strong>
                    <span className="text-[10px] text-slate-500 block">Cycles certifiés NF</span>
                  </div>
                </div>
              </div>

              {/* Technical Advice Card */}
              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-start gap-3">
                <HelpCircle className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                <div className="text-xs text-slate-300 space-y-1">
                  <span className="font-bold text-white block">Note d atelier & Règles professionnelles SNFA :</span>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    Les chariots doivent être positionnés rigoureusement à l aplomb des cales d assise du vitrage afin que le poids propre du verre soit transmis directement au rail sans fléchissement de la traverse basse en aluminium.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: CAD 2D SECTION VIEW */}
          {activeTab === 'cad_section_view' && (
            <div className="space-y-3 animate-in fade-in duration-150">
              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col items-center">
                <div className="w-full flex justify-between items-center mb-2 px-1 text-xs">
                  <span className="font-bold text-slate-200 flex items-center gap-2">
                    <Layers className="w-4 h-4 text-blue-400" />
                    Coupe Technique Traverse Basse & Chariot sur Rail
                  </span>
                  <span className="text-[10px] font-mono text-cyan-400">
                    Vantail {sashWidthMm} x {sashHeightMm} mm • Rail {currentTrack.material.split('(')[0].trim()}
                  </span>
                </div>

                {/* SVG CAD Drawing */}
                <div className="w-full max-w-xl bg-slate-950 rounded-lg p-2 border border-slate-800 flex justify-center">
                  <svg
                    viewBox="0 0 500 360"
                    className="w-full h-auto max-h-[340px] select-none font-mono"
                  >
                    <defs>
                      {/* Gradient for metallic aluminum profiles */}
                      <linearGradient id="aluGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#334155" />
                        <stop offset="50%" stopColor="#475569" />
                        <stop offset="100%" stopColor="#1e293b" />
                      </linearGradient>

                      {/* Gradient for stainless steel roller track */}
                      <linearGradient id="inoxRailGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#f8fafc" />
                        <stop offset="40%" stopColor="#cbd5e1" />
                        <stop offset="100%" stopColor="#64748b" />
                      </linearGradient>

                      {/* Glass gradient */}
                      <linearGradient id="glassGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="rgba(56, 189, 248, 0.4)" />
                        <stop offset="50%" stopColor="rgba(56, 189, 248, 0.15)" />
                        <stop offset="100%" stopColor="rgba(56, 189, 248, 0.5)" />
                      </linearGradient>

                      {/* Delrin / POM wheel gradient */}
                      <linearGradient id="wheelPomGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#fef3c7" />
                        <stop offset="100%" stopColor="#d97706" />
                      </linearGradient>

                      {/* Inox wheel gradient */}
                      <linearGradient id="wheelInoxGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#f1f5f9" />
                        <stop offset="50%" stopColor="#94a3b8" />
                        <stop offset="100%" stopColor="#475569" />
                      </linearGradient>
                    </defs>

                    {/* 1. Floor Line (Sol Fini) */}
                    <line x1="30" y1="300" x2="470" y2="300" stroke="#64748b" strokeWidth="2" strokeDasharray="6 3" />
                    <text x="35" y="315" fill="#94a3b8" fontSize="10" fontFamily="sans-serif">NIVEAU SOL FINI INTERIEUR</text>

                    {/* Floor hatch underneath */}
                    <path d="M 40 302 L 30 315 M 80 302 L 70 315 M 120 302 L 110 315 M 160 302 L 150 315 M 400 302 L 390 315 M 440 302 L 430 315" stroke="#334155" strokeWidth="1.5" />

                    {/* 2. Dormant Bas (Threshold Aluminum Frame) */}
                    {trackRail === 'rail_recessed_pmr_flat' ? (
                      /* Flat PMR Threshold encastré */
                      <g>
                        {/* Recessed block in floor */}
                        <rect x="130" y="285" width="240" height="40" fill="url(#aluGradient)" stroke="#64748b" strokeWidth="1.5" rx="2" />
                        {/* Thermal break */}
                        <rect x="235" y="285" width="25" height="40" fill="#0f172a" stroke="#000" strokeWidth="1" />
                        <text x="248" y="310" fill="#64748b" fontSize="8" textAnchor="middle">RPT</text>
                        {/* Stainless steel low inset track */}
                        <rect x="235" y="280" width="30" height="7" fill="url(#inoxRailGradient)" stroke="#94a3b8" strokeWidth="1" rx="2" />
                        {/* PMR Beveled ramp */}
                        <polygon points="100,300 130,285 130,300" fill="#475569" stroke="#64748b" strokeWidth="1" />
                        <text x="105" y="295" fill="#38bdf8" fontSize="8">Rampe PMR</text>
                      </g>
                    ) : (
                      /* Standard elevated threshold */
                      <g>
                        {/* Aluminum bottom frame extrusion */}
                        <rect x="120" y="252" width="260" height="48" fill="url(#aluGradient)" stroke="#64748b" strokeWidth="1.5" rx="3" />
                        {/* Polyamide thermal breaks */}
                        <rect x="210" y="252" width="20" height="48" fill="#0f172a" stroke="#000" strokeWidth="1" />
                        <rect x="270" y="252" width="20" height="48" fill="#0f172a" stroke="#000" strokeWidth="1" />
                        <text x="220" y="280" fill="#64748b" fontSize="7" textAnchor="middle">RPT</text>
                        <text x="280" y="280" fill="#64748b" fontSize="7" textAnchor="middle">RPT</text>

                        {/* Rail profile */}
                        {trackRail === 'rail_stainless_steel_insert' ? (
                          <g>
                            {/* Inserted tubular stainless track */}
                            <path d="M 242 252 L 242 244 A 6 6 0 0 1 254 244 L 254 252 Z" fill="url(#inoxRailGradient)" stroke="#cbd5e1" strokeWidth="1.2" />
                            <circle cx="248" cy="244" r="3.5" fill="#e2e8f0" />
                          </g>
                        ) : (
                          /* Raw extruded aluminum fin track */
                          <rect x="243" y="242" width="10" height="10" fill="#475569" stroke="#64748b" strokeWidth="1.2" />
                        )}
                      </g>
                    )}

                    {/* 3. Roller Wheel (Galet du Chariot) */}
                    {/* Track top Y coordinate */}
                    {/* For recessed: track is at Y=280; for elevated: track is at Y=242 */}
                    {(() => {
                      const trackTopY = trackRail === 'rail_recessed_pmr_flat' ? 280 : (trackRail === 'rail_stainless_steel_insert' ? 240 : 242);
                      const wheelRadius = currentCarriage.wheelDiameterMm / 2 + 8; // scaled for visibility
                      const wheelCenterY = trackTopY - wheelRadius;
                      const wheelCenterX = 248;

                      return (
                        <g>
                          {/* Roller wheel */}
                          <circle
                            cx={wheelCenterX}
                            cy={wheelCenterY}
                            r={wheelRadius}
                            fill={carriageModel.includes('inox') ? 'url(#wheelInoxGradient)' : 'url(#wheelPomGradient)'}
                            stroke="#0f172a"
                            strokeWidth="1.5"
                          />
                          {/* Bearing outer ring */}
                          <circle cx={wheelCenterX} cy={wheelCenterY} r={wheelRadius * 0.55} fill="#334155" stroke="#1e293b" strokeWidth="1" />
                          {/* Bearing seal 2RS */}
                          <circle cx={wheelCenterX} cy={wheelCenterY} r={wheelRadius * 0.42} fill="#ef4444" stroke="#991b1b" strokeWidth="0.8" />
                          {/* Inner bore / axle pin */}
                          <circle cx={wheelCenterX} cy={wheelCenterY} r={wheelRadius * 0.22} fill="#e2e8f0" />

                          {/* Carriage Body (Boîtier en acier zingué / zamak) */}
                          <rect
                            x="218"
                            y={wheelCenterY - wheelRadius - 14}
                            width="60"
                            height="24"
                            fill="#64748b"
                            stroke="#334155"
                            strokeWidth="1.2"
                            rx="2"
                          />

                          {/* Height adjustment screw */}
                          <line x1="225" y1={wheelCenterY - wheelRadius - 8} x2="225" y2={wheelCenterY - wheelRadius + 4} stroke="#f59e0b" strokeWidth="2.5" />
                          <circle cx="225" cy={wheelCenterY - wheelRadius - 8} r="2.5" fill="#f59e0b" />
                          <text x="200" y={wheelCenterY - wheelRadius - 10} fill="#f59e0b" fontSize="8">Vis réglage</text>

                          {/* 4. Sash Bottom Rail Extrusion (Traverse Basse Vantail) */}
                          <rect
                            x="180"
                            y={wheelCenterY - wheelRadius - 95}
                            width="136"
                            height="82"
                            fill="url(#aluGradient)"
                            stroke="#94a3b8"
                            strokeWidth="1.5"
                            rx="2"
                          />

                          {/* Sash thermal breaks */}
                          <rect x="238" y={wheelCenterY - wheelRadius - 95} width="20" height="82" fill="#0f172a" stroke="#000" strokeWidth="1" />
                          <text x="248" y={wheelCenterY - wheelRadius - 55} fill="#64748b" fontSize="7" textAnchor="middle">RPT</text>

                          {/* Weatherseal Brushes (Joints brosses latéraux) */}
                          <line x1="184" y1={wheelCenterY - 10} x2="184" y2={trackTopY} stroke="#94a3b8" strokeWidth="3" strokeDasharray="2 1" />
                          <line x1="312" y1={wheelCenterY - 10} x2="312" y2={trackTopY} stroke="#94a3b8" strokeWidth="3" strokeDasharray="2 1" />

                          {/* Glazing setting blocks and Glass pane */}
                          {/* Setting block */}
                          <rect x="215" y={wheelCenterY - wheelRadius - 98} width="66" height="5" fill="#10b981" stroke="#047857" strokeWidth="1" />
                          <text x="285" y={wheelCenterY - wheelRadius - 94} fill="#10b981" fontSize="8">Cale assise 80 Sh</text>

                          {/* Double Glazing Pane */}
                          <rect
                            x="222"
                            y={wheelCenterY - wheelRadius - 195}
                            width="52"
                            height="95"
                            fill="url(#glassGradient)"
                            stroke="#38bdf8"
                            strokeWidth="1.5"
                            rx="1"
                          />
                          {/* Warm-edge spacer */}
                          <rect x="242" y={wheelCenterY - wheelRadius - 110} width="12" height="8" fill="#1e293b" stroke="#000" strokeWidth="0.8" />
                          <text x="248" y={wheelCenterY - wheelRadius - 104} fill="#94a3b8" fontSize="6" textAnchor="middle">WE</text>

                          {/* Glass thickness label */}
                          <text x="248" y={wheelCenterY - wheelRadius - 150} fill="#bae6fd" fontSize="10" textAnchor="middle" fontWeight="bold">
                            Vitrage {glassThicknessMm}mm
                          </text>

                          {/* Load Vector (Flèche de gravité P = M/2) */}
                          <line x1="248" y1="30" x2="248" y2={wheelCenterY - wheelRadius - 102} stroke="#ef4444" strokeWidth="2.5" />
                          <polygon points="248,70 243,58 253,58" fill="#ef4444" />
                          <text x="255" y="45" fill="#ef4444" fontSize="10" fontWeight="bold">
                            P = {audit.loadPerCarriageKg} kg ({Math.round(audit.loadPerCarriageKg * 9.81)} N)
                          </text>

                          {/* Horizontal Motion Vector */}
                          <line x1="285" y1={wheelCenterY} x2="355" y2={wheelCenterY} stroke="#3b82f6" strokeWidth="2.5" />
                          <polygon points="355,wheelCenterY 345,wheelCenterY-4 345,wheelCenterY+4" fill="#3b82f6" />
                          <text x="360" y={wheelCenterY + 3} fill="#60a5fa" fontSize="9" fontWeight="bold">
                            F_arrachement = {audit.startingFrictionForceN} N
                          </text>

                          {/* Threshold Step Height Dimension Line */}
                          {trackRail === 'rail_recessed_pmr_flat' ? (
                            <g>
                              <line x1="80" y1="285" x2="80" y2="300" stroke="#10b981" strokeWidth="1.5" />
                              <line x1="75" y1="285" x2="85" y2="285" stroke="#10b981" strokeWidth="1" />
                              <line x1="75" y1="300" x2="85" y2="300" stroke="#10b981" strokeWidth="1" />
                              <text x="70" y="295" fill="#10b981" fontSize="9" textAnchor="end" fontWeight="bold">
                                H = 15 mm (&lt; 20 mm PMR)
                              </text>
                            </g>
                          ) : (
                            <g>
                              <line x1="80" y1="252" x2="80" y2="300" stroke="#f59e0b" strokeWidth="1.5" />
                              <line x1="75" y1="252" x2="85" y2="252" stroke="#f59e0b" strokeWidth="1" />
                              <line x1="75" y1="300" x2="85" y2="300" stroke="#f59e0b" strokeWidth="1" />
                              <text x="70" y="280" fill="#f59e0b" fontSize="9" textAnchor="end" fontWeight="bold">
                                H = {currentTrack.thresholdHeightAboveFloorMm} mm (&gt; 20 mm)
                              </text>
                            </g>
                          )}
                        </g>
                      );
                    })()}
                  </svg>
                </div>

                {/* Legend bar */}
                <div className="flex flex-wrap items-center justify-center gap-4 text-[10px] text-slate-400 mt-2 font-mono">
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded bg-blue-400 inline-block" />
                    Double Vitrage & Cales
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded bg-slate-500 inline-block" />
                    Traverse Aluminium RPT
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded bg-amber-500 inline-block" />
                    Galet {currentCarriage.wheelMaterial.split(' ')[0]} Ø{currentCarriage.wheelDiameterMm}mm
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded bg-emerald-500 inline-block" />
                    Rail {currentTrack.material.split(' ')[0]}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: PMR FORCES & ACCESSIBILITY */}
          {activeTab === 'pmr_forces' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              
              {/* NF EN 12046-2 Evaluation */}
              <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/60 space-y-3">
                <div className="flex justify-between items-center">
                  <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-blue-400" />
                    Classification des Forces de Manœuvre (NF EN 12046-2)
                  </h3>
                  <span className={`px-2 py-0.5 rounded text-xs font-mono font-bold ${
                    audit.en12046Class === 'classe_2_ergonomique'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : audit.en12046Class === 'classe_1_standard'
                      ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                      : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                  }`}>
                    {audit.en12046Class === 'classe_2_ergonomique'
                      ? 'CLASSE 2 ERGONOMIQUE'
                      : audit.en12046Class === 'classe_1_standard'
                      ? 'CLASSE 1 STANDARD'
                      : 'NON CONFORME'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Breakaway Starting force */}
                  <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 space-y-1">
                    <div className="flex justify-between text-xs text-slate-400">
                      <span>Effort Initial d Arrachement (F_start) :</span>
                      <span className="font-mono font-bold text-white">{audit.startingFrictionForceN} N</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
                      <div
                        style={{ width: `${Math.min(100, (audit.startingFrictionForceN / 100) * 100)}%` }}
                        className={`h-full ${audit.startingFrictionForceN <= 50 ? 'bg-emerald-500' : 'bg-amber-500'}`}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-500">
                      <span>Ergonomique &le; 50 N</span>
                      <span>Norme NF &le; 100 N</span>
                    </div>
                  </div>

                  {/* Motion rolling force */}
                  <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 space-y-1">
                    <div className="flex justify-between text-xs text-slate-400">
                      <span>Force de Déplacement Continu (F_motion) :</span>
                      <span className="font-mono font-bold text-white">{audit.motionFrictionForceN} N</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
                      <div
                        style={{ width: `${Math.min(100, (audit.motionFrictionForceN / 50) * 100)}%` }}
                        className={`h-full ${audit.motionFrictionForceN <= 30 ? 'bg-emerald-500' : 'bg-amber-500'}`}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-500">
                      <span>Ergonomique &le; 30 N</span>
                      <span>Norme NF &le; 50 N</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Algerian PMR Decree 06-455 Compliance Banner */}
              <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/60 space-y-3">
                <div className="flex justify-between items-center">
                  <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                    <Accessibility className="w-4 h-4 text-emerald-400" />
                    Accessibilité PMR (Décret Exécutif 06-455)
                  </h3>
                  <span className={`px-2 py-0.5 rounded text-xs font-mono font-bold ${
                    audit.isPmrForceCompliant && audit.isThresholdPmrCompliant
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  }`}>
                    {audit.isPmrForceCompliant && audit.isThresholdPmrCompliant
                      ? 'CONFORMITÉ TOTALE ERP & LOGEMENT'
                      : 'ADAPTATIONS REQUISES'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {/* Criterion 1: Operating force */}
                  <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 flex items-start gap-2.5">
                    {audit.isPmrForceCompliant ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <span className="font-bold text-white block">Effort maximal à la poignée : &le; 50 N</span>
                      <p className="text-slate-400 text-[11px] mt-0.5">
                        Mesuré : <strong className="text-white font-mono">{audit.startingFrictionForceN} N</strong> ({audit.isPmrForceCompliant ? 'Conforme, manœuvre aisée d une seule main sans effort' : 'Excessif, risque de blocage pour les personnes âgées ou à mobilité réduite'})
                      </p>
                    </div>
                  </div>

                  {/* Criterion 2: Threshold step height */}
                  <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 flex items-start gap-2.5">
                    {audit.isThresholdPmrCompliant ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <span className="font-bold text-white block">Ressaut de seuil : &le; 20 mm</span>
                      <p className="text-slate-400 text-[11px] mt-0.5">
                        Hauteur profilé : <strong className="text-white font-mono">{audit.thresholdStepHeightMm} mm</strong> ({audit.isThresholdPmrCompliant ? 'Conforme, franchissement fluide en fauteuil roulant' : 'Ressaut non conforme ERP, nécessite un seuil encastré ou un chanfrein'})
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Lift-and-slide mechanism torque card (if applicable) */}
              {audit.isLiftAndSlide && (
                <div className="p-4 rounded-xl bg-blue-950/40 border border-blue-500/30 space-y-2">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-blue-400" />
                    <h4 className="text-xs font-bold text-blue-300 uppercase tracking-wider">
                      Mécanisme Levant-Coulissant Architectural
                    </h4>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
                      <span className="text-slate-400 block text-[10px]">Couple de Levage au Levier</span>
                      <strong className="text-white font-mono text-sm">{audit.leverOperatingTorqueNm} N.m</strong>
                      <span className="text-[10px] text-slate-500 block">Démultiplication mécanique 1:22</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
                      <span className="text-slate-400 block text-[10px]">Effort Main sur Poignée ({handleLeverLengthMm} mm)</span>
                      <strong className="text-cyan-400 font-mono text-sm">{audit.handLiftEffortN} N</strong>
                      <span className="text-[10px] text-slate-500 block">Course d élévation du vantail : 7 mm</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Recommendations */}
              <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/60 space-y-2">
                <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                  Recommandations Techniques d Atelier
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
                ? 'Conception conforme et optimisée'
                : audit.overallStatus === 'warning'
                ? 'Ajustements conseillés pour ergonomie optimale'
                : 'Surcharge ou effort excessif détecté'}
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
