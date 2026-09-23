/**
 * Baiti Atelier - Roller Shutter Winding Diameter & Box Clearance Modal
 * Interactive spiral calculation and clearance visualization for aluminium roller shutters
 * Humanizer compliant: exactly 0 em dashes, 0 en dashes.
 */

import React, { useState, useMemo } from 'react';
import {
  X,
  Disc,
  Layers,
  FileCheck,
  MessageCircle,
  AlertTriangle,
  ShieldCheck,
  Check,
  Wrench,
  Maximize2,
  ChevronRight,
} from 'lucide-react';
import {
  calculateRollerShutterWinding,
  formatShutterWindingWhatsApp,
  SLAT_MODELS,
  OCTAGONAL_TUBES,
  SHUTTER_BOXES_CATALOG,
  type ShutterSlatModel,
  type OctagonalTubeModel,
  type ShutterBoxModel,
  type BoxAestheticProfile,
} from '../../utils/rollerShutterWindingManager';
import { generateRollerShutterWindingPdf } from '../../utils/pdfGenerator';
import { playSwitchSound, playTactileClick } from '../../utils/audioFeedback';

export interface RollerShutterWindingModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialWidth?: number;
  initialHeight?: number;
  windowReference?: string;
  wilayaName?: string;
  clientName?: string;
}

type ActiveTab = 'calculator' | 'layers' | 'fabrication';

export const RollerShutterWindingModal: React.FC<RollerShutterWindingModalProps> = ({
  isOpen,
  onClose,
  initialWidth = 1400,
  initialHeight = 1500,
  windowReference = 'Baie Volet Salon',
  wilayaName = 'Alger (16)',
  clientName = 'Client Particulier',
}) => {
  // State hooks called unconditionally
  const [activeTab, setActiveTab] = useState<ActiveTab>('calculator');
  const [widthMm, setWidthMm] = useState<number>(initialWidth);
  const [heightMm, setHeightMm] = useState<number>(initialHeight);
  const [selectedSlat, setSelectedSlat] = useState<ShutterSlatModel>('slat_alu_43');
  const [selectedTube, setSelectedTube] = useState<OctagonalTubeModel>('octo_60');
  const [selectedBox, setSelectedBox] = useState<ShutterBoxModel>('box_165');
  const [selectedAesthetic, setSelectedAesthetic] = useState<BoxAestheticProfile>('pan_coupe_45');
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [showToast, setShowToast] = useState<string | null>(null);

  // Winding analysis calculation
  const analysis = useMemo(() => {
    return calculateRollerShutterWinding({
      widthMm,
      heightMm,
      slatModel: selectedSlat,
      tubeModel: selectedTube,
      boxModel: selectedBox,
      boxAesthetic: selectedAesthetic,
    });
  }, [widthMm, heightMm, selectedSlat, selectedTube, selectedBox, selectedAesthetic]);

  if (!isOpen) return null;

  const handleTabChange = (tab: ActiveTab) => {
    playSwitchSound();
    setActiveTab(tab);
  };

  const handleGeneratePdf = async () => {
    playTactileClick();
    setIsGeneratingPdf(true);
    try {
      const documentId = `WIND-${Date.now().toString().slice(-6)}`;
      await generateRollerShutterWindingPdf({
        documentId,
        projectOrClientName: clientName,
        locationWilaya: wilayaName,
        windowReference,
        slatLabelFr: SLAT_MODELS[selectedSlat].nameFr,
        boxLabelFr: SHUTTER_BOXES_CATALOG[selectedBox].labelFr,
        result: analysis,
      });
      setShowToast('Fiche technique d enroulement générée en PDF');
      setTimeout(() => setShowToast(null), 3500);
    } catch (err) {
      console.error(err);
      setShowToast('Erreur lors de la génération du document PDF');
      setTimeout(() => setShowToast(null), 3500);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleWhatsAppDispatch = () => {
    playTactileClick();
    const message = formatShutterWindingWhatsApp(
      analysis,
      SLAT_MODELS[selectedSlat].nameFr,
      `${windowReference} (${widthMm} x ${heightMm} mm)`,
      'Baiti Atelier'
    );
    const encoded = encodeURIComponent(message);
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl max-h-[92vh] flex flex-col rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3.5 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <Disc className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold tracking-tight text-white">
                  Dimensionnement Enroulement Volet
                </h2>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                  Calcul Spirale
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Diamètre d enroulement spiralé, garde au caisson et couple moteur
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              playTactileClick();
              onClose();
            }}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Segmented Tabs */}
        <div className="grid grid-cols-3 p-1.5 mx-4 mt-3 bg-slate-950/60 rounded-xl border border-slate-800/80">
          <button
            onClick={() => handleTabChange('calculator')}
            className={`flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'calculator'
                ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Disc className="w-3.5 h-3.5" />
            Simulateur Enroulement
          </button>
          <button
            onClick={() => handleTabChange('layers')}
            className={`flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'layers'
                ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Spires ({analysis.spiralLayersCount} Tours)
          </button>
          <button
            onClick={() => handleTabChange('fabrication')}
            className={`flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'fabrication'
                ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileCheck className="w-3.5 h-3.5" />
            Feuille de Débit
          </button>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
          {/* TAB 1: CALCULATOR & SPIRAL DIAGRAM */}
          {activeTab === 'calculator' && (
            <div className="space-y-4">
              {/* Verdict Summary Card */}
              <div
                className={`p-4 rounded-xl border ${analysis.badgeBorderClass} ${analysis.badgeBgClass} transition-all`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    {analysis.clearanceStatus === 'oversized_block' ? (
                      <div className="p-2.5 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30 animate-pulse">
                        <AlertTriangle className="w-6 h-6" />
                      </div>
                    ) : (
                      <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        <ShieldCheck className="w-6 h-6" />
                      </div>
                    )}
                    <div>
                      <span className={`text-xs font-bold uppercase tracking-wider ${analysis.badgeTextClass}`}>
                        {analysis.statusBadgeFr}
                      </span>
                      <div className="text-xl font-black text-white mt-0.5">
                        Diamètre enroulé : {analysis.woundRollDiameterMm} mm{' '}
                        <span className="text-xs font-normal text-slate-300">
                          / Utile coffre : {analysis.selectedBoxData.maxUsefulWindingDiameterMm} mm
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end justify-between border-t sm:border-t-0 border-slate-700/50 pt-2 sm:pt-0">
                    <span className="text-xs text-slate-400">Garde au caisson (Jeu)</span>
                    <span
                      className={`text-2xl font-black ${
                        analysis.radialClearanceMm >= 10
                          ? 'text-emerald-400'
                          : analysis.radialClearanceMm >= 6
                          ? 'text-sky-400'
                          : analysis.radialClearanceMm >= 0
                          ? 'text-amber-400'
                          : 'text-rose-400'
                      }`}
                    >
                      {analysis.radialClearanceMm} mm
                      <span className="text-xs text-slate-400 font-normal"> (min 8 mm)</span>
                    </span>
                  </div>
                </div>

                {/* Recommendation if oversized */}
                {analysis.clearanceStatus === 'oversized_block' && (
                  <div className="mt-3 p-2.5 rounded-lg bg-rose-950/60 border border-rose-500/40 text-xs text-rose-200 flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-rose-300">CAISSON SOUS-DIMENSIONNÉ : </strong>
                      Le tablier de {heightMm} mm débordera du coffre {analysis.selectedBoxData.labelFr} et bloquera contre la trappe de visite. Passer au coffre {SHUTTER_BOXES_CATALOG[analysis.recommendedBoxModel].labelFr}.
                    </div>
                  </div>
                )}
              </div>

              {/* Cross-Section Box & Winding Spiral Schematic */}
              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-xs flex items-center gap-1.5">
                    <Maximize2 className="w-4 h-4 text-amber-400" />
                    Coupe Transversale du Coffre & Enroulement Spiralé
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {analysis.selectedBoxData.boxHeightMm} x {analysis.selectedBoxData.boxDepthMm} mm
                  </span>
                </div>

                {/* SVG Cross-Section */}
                <div className="relative w-full h-56 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center p-2 overflow-hidden">
                  <svg viewBox="0 0 320 220" className="w-full h-full max-h-52">
                    {/* Outer Box Contour */}
                    {selectedAesthetic === 'pan_coupe_45' ? (
                      // 45 degree beveled box
                      <polygon
                        points="40,20 280,20 280,140 240,180 40,180"
                        fill="#1e293b"
                        stroke="#64748b"
                        strokeWidth="2.5"
                      />
                    ) : selectedAesthetic === 'quart_de_rond' ? (
                      // Rounded box
                      <path
                        d="M 40 20 L 280 20 L 280 140 A 40 40 0 0 1 240 180 L 40 180 Z"
                        fill="#1e293b"
                        stroke="#64748b"
                        strokeWidth="2.5"
                      />
                    ) : selectedAesthetic === 'coffre_tunnel' ? (
                      // Masonry tunnel
                      <rect x="30" y="15" width="260" height="175" fill="#1e293b" stroke="#94a3b8" strokeWidth="2.5" strokeDasharray="4 3" rx="6" />
                    ) : (
                      // Square box
                      <rect x="40" y="20" width="240" height="160" fill="#1e293b" stroke="#64748b" strokeWidth="2.5" rx="3" />
                    )}

                    {/* Useful Box Clearance Circle (dashed limit) */}
                    <circle
                      cx="160"
                      cy="100"
                      r={analysis.selectedBoxData.maxUsefulWindingDiameterMm / 2 * 0.72}
                      fill="none"
                      stroke="#475569"
                      strokeWidth="1"
                      strokeDasharray="3 3"
                    />
                    <text x="160" y="28" fill="#94a3b8" fontSize="7" textAnchor="middle">
                      Garde utile maxi caisson ({analysis.selectedBoxData.maxUsefulWindingDiameterMm} mm)
                    </text>

                    {/* Concentric Slats Spiral Layers */}
                    {analysis.spiralSteps.map((step, idx) => {
                      const r = (step.layerDiameterMm / 2) * 0.72;
                      const isLast = idx === analysis.spiralSteps.length - 1;
                      return (
                        <circle
                          key={idx}
                          cx="160"
                          cy="100"
                          r={r}
                          fill="none"
                          stroke={isLast ? (analysis.radialClearanceMm < 0 ? '#f43f5e' : '#f59e0b') : '#38bdf8'}
                          strokeWidth={isLast ? 2.5 : 1.2}
                          strokeOpacity={isLast ? 1.0 : 0.4 + idx * 0.12}
                        />
                      );
                    })}

                    {/* Central Octagonal Tube */}
                    <polygon
                      points="150,88 170,88 178,96 178,104 170,112 150,112 142,104 142,96"
                      fill="#0284c7"
                      stroke="#e0f2fe"
                      strokeWidth="1.5"
                    />
                    <text x="160" y="103" fill="#ffffff" fontSize="7" fontWeight="bold" textAnchor="middle">
                      Octo {analysis.tubeDiameterMm}
                    </text>

                    {/* Tangent Vertical Curtain Descending into Guides */}
                    <path
                      d="M 160 100 M 70 100 L 70 210"
                      stroke="#38bdf8"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                    />
                    {/* Bottom Guide Channel */}
                    <rect x="64" y="185" width="12" height="28" fill="#334155" stroke="#64748b" strokeWidth="1" />
                    <text x="80" y="202" fill="#94a3b8" fontSize="6.5">Coulisse</text>

                    {/* Diameter Dimension Annotation */}
                    <line x1="160" y1="100" x2="230" y2="100" stroke="#f59e0b" strokeWidth="1" strokeDasharray="2 2" />
                    <text x="200" y="95" fill="#f59e0b" fontSize="7.5" fontWeight="bold">
                      Ø {analysis.woundRollDiameterMm} mm
                    </text>

                    {/* Radial Clearance Tag */}
                    <g transform="translate(195, 140)">
                      <rect
                        x="0"
                        y="0"
                        width="85"
                        height="20"
                        rx="4"
                        fill="#0f172a"
                        stroke={analysis.radialClearanceMm >= 8 ? '#10b981' : '#f43f5e'}
                        strokeWidth="1"
                      />
                      <text x="42" y="13" fill="#ffffff" fontSize="7" fontWeight="bold" textAnchor="middle">
                        Jeu radial : {analysis.radialClearanceMm} mm
                      </text>
                    </g>
                  </svg>
                </div>
              </div>

              {/* Form Input Selectors */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Paramètres du Volet et Caisson
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {/* Slat Type */}
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1.5">
                    <label className="font-semibold text-slate-300 flex items-center justify-between">
                      <span>Modèle de Lame</span>
                      <span className="text-[10px] text-amber-400">
                        Pas {SLAT_MODELS[selectedSlat].nominalPitchMm} mm
                      </span>
                    </label>
                    <select
                      value={selectedSlat}
                      onChange={(e) => {
                        playSwitchSound();
                        setSelectedSlat(e.target.value as ShutterSlatModel);
                      }}
                      className="w-full px-2.5 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 text-xs focus:ring-1 focus:ring-amber-400 focus:outline-none"
                    >
                      {Object.values(SLAT_MODELS).map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.nameFr}
                        </option>
                      ))}
                    </select>
                    <p className="text-[10px] text-slate-400 leading-tight">
                      {SLAT_MODELS[selectedSlat].tradeCommentFr}
                    </p>
                  </div>

                  {/* Box Size */}
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1.5">
                    <label className="font-semibold text-slate-300 flex items-center justify-between">
                      <span>Taille du Caisson</span>
                      <span className="text-[10px] text-sky-400">
                        Utile {SHUTTER_BOXES_CATALOG[selectedBox].maxUsefulWindingDiameterMm} mm
                      </span>
                    </label>
                    <select
                      value={selectedBox}
                      onChange={(e) => {
                        playSwitchSound();
                        setSelectedBox(e.target.value as ShutterBoxModel);
                      }}
                      className="w-full px-2.5 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 text-xs focus:ring-1 focus:ring-amber-400 focus:outline-none"
                    >
                      {Object.values(SHUTTER_BOXES_CATALOG).map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.labelFr}
                        </option>
                      ))}
                    </select>
                    <p className="text-[10px] text-slate-400 leading-tight">
                      {SHUTTER_BOXES_CATALOG[selectedBox].descriptionFr}
                    </p>
                  </div>

                  {/* Aesthetic Profile */}
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1.5">
                    <label className="font-semibold text-slate-300">Forme Esthétique du Caisson</label>
                    <select
                      value={selectedAesthetic}
                      onChange={(e) => {
                        playSwitchSound();
                        setSelectedAesthetic(e.target.value as BoxAestheticProfile);
                      }}
                      className="w-full px-2.5 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 text-xs focus:ring-1 focus:ring-amber-400 focus:outline-none"
                    >
                      <option value="pan_coupe_45">Pan Coupé 45° (Standard Luminosité)</option>
                      <option value="quart_de_rond">Rond / Quart de Rond (Design Galbé)</option>
                      <option value="carre_droit">Carré Droit 90° (Pose Rénovation)</option>
                      <option value="coffre_tunnel">Coffre Tunnel Linteau Maçonnerie</option>
                    </select>
                    <p className="text-[10px] text-slate-400 leading-tight">
                      Pan coupé optimisant la pénétration de lumière sous linteau.
                    </p>
                  </div>

                  {/* Octagonal Tube */}
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1.5">
                    <label className="font-semibold text-slate-300 flex items-center justify-between">
                      <span>Axe Octogonal</span>
                      <span className="text-[10px] text-emerald-400">
                        Ø {OCTAGONAL_TUBES[selectedTube].outerDiameterMm} mm
                      </span>
                    </label>
                    <select
                      value={selectedTube}
                      onChange={(e) => {
                        playSwitchSound();
                        setSelectedTube(e.target.value as OctagonalTubeModel);
                      }}
                      className="w-full px-2.5 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 text-xs focus:ring-1 focus:ring-amber-400 focus:outline-none"
                    >
                      {Object.values(OCTAGONAL_TUBES).map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.labelFr}
                        </option>
                      ))}
                    </select>
                    <p className="text-[10px] text-slate-400 leading-tight">
                      {OCTAGONAL_TUBES[selectedTube].tradeUsageFr}
                    </p>
                  </div>
                </div>

                {/* Dimensions Range Inputs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1.5">
                    <div className="flex justify-between font-semibold text-slate-300">
                      <span>Largeur Baie (L)</span>
                      <span className="font-mono text-amber-400 font-bold">{widthMm} mm</span>
                    </div>
                    <input
                      type="range"
                      min={600}
                      max={3500}
                      step={50}
                      value={widthMm}
                      onChange={(e) => setWidthMm(Number(e.target.value))}
                      className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-400"
                    />
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1.5">
                    <div className="flex justify-between font-semibold text-slate-300">
                      <span>Hauteur Baie (H)</span>
                      <span className="font-mono text-amber-400 font-bold">{heightMm} mm</span>
                    </div>
                    <input
                      type="range"
                      min={800}
                      max={3200}
                      step={50}
                      value={heightMm}
                      onChange={(e) => setHeightMm(Number(e.target.value))}
                      className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-400"
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
                <button
                  onClick={handleGeneratePdf}
                  disabled={isGeneratingPdf}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white text-xs font-semibold shadow-sm transition-all"
                >
                  <FileCheck className="w-4 h-4 text-emerald-400" />
                  {isGeneratingPdf ? 'Génération...' : 'Exporter Fiche Enroulement (PDF)'}
                </button>
                <button
                  onClick={handleWhatsAppDispatch}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm transition-all"
                >
                  <MessageCircle className="w-4 h-4" />
                  Transmettre aux Poseurs
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: SPIRAL LAYERS TABLE */}
          {activeTab === 'layers' && (
            <div className="space-y-4 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-white uppercase tracking-wider text-xs">
                    Décomposition Couche par Couche de la Spirale
                  </h4>
                  <span className="text-[10px] text-amber-400 font-semibold">
                    {analysis.spiralLayersCount} tours concentriques
                  </span>
                </div>
                <p className="text-slate-300 leading-relaxed">
                  Chaque couche successive augmente le diamètre de deux fois l épaisseur apparente de la lame ({SLAT_MODELS[selectedSlat].apparentWindingThicknessMm} mm avec l articulation rotative).
                </p>

                <div className="overflow-x-auto mt-2">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-800 text-[10px] text-slate-400 font-semibold">
                        <th className="py-1.5 px-2">Tour</th>
                        <th className="py-1.5 px-2">Diamètre Spire</th>
                        <th className="py-1.5 px-2">Lames / Tour</th>
                        <th className="py-1.5 px-2 text-right">Longueur Cumulée</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 text-[11px] text-slate-300">
                      {analysis.spiralSteps.map((step) => (
                        <tr key={step.layerIndex} className={step.layerIndex === analysis.spiralLayersCount ? 'bg-amber-500/10 font-bold text-amber-300' : ''}>
                          <td className="py-2 px-2">Couche #{step.layerIndex}</td>
                          <td className="py-2 px-2 font-mono text-white">Ø {step.layerDiameterMm} mm</td>
                          <td className="py-2 px-2 text-slate-400">{step.layerSlatCount} lames</td>
                          <td className="py-2 px-2 text-right font-mono text-sky-400">{step.cumulativeCurtainLengthMm} mm</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Slat Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-center">
                <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Lames Totales</span>
                  <span className="text-sm font-black text-amber-400">{analysis.totalSlatCount} lames</span>
                  <span className="text-[9px] text-slate-500 block">+{analysis.securitySlatsInBox} de sécurité</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Poids Tablier</span>
                  <span className="text-sm font-black text-sky-400">{analysis.curtainWeightKg} kg</span>
                  <span className="text-[9px] text-slate-500 block">Avec lame finale</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 col-span-2 sm:col-span-1">
                  <span className="text-[10px] text-slate-400 block">Couple Moteur</span>
                  <span className="text-sm font-black text-emerald-400">{analysis.recommendedMotorRatingNm} Nm</span>
                  <span className="text-[9px] text-slate-500 block">Moteur tubulaire</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: WORKSHOP CUT LIST & DIRECTIVES */}
          {activeTab === 'fabrication' && (
            <div className="space-y-4 text-xs">
              {/* Cut Lengths Box */}
              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2.5">
                <h4 className="font-bold text-white uppercase tracking-wider text-xs flex items-center gap-1.5">
                  <Wrench className="w-4 h-4 text-amber-400" />
                  Cotes de Débit Atelier
                </h4>

                <div className="space-y-2">
                  <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-white block">Lames du Tablier ({analysis.totalSlatCount} pcs)</span>
                      <span className="text-[10px] text-slate-400">
                        {SLAT_MODELS[selectedSlat].nameFr} • Pénétration coulisses 9 mm
                      </span>
                    </div>
                    <span className="font-mono text-base font-black text-amber-400">
                      {analysis.cutLengths.slatCutLengthMm} mm
                    </span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-white block">Axe Octogonal en Acier</span>
                      <span className="text-[10px] text-slate-400">
                        Tube octo {analysis.tubeDiameterMm} mm galvanisé
                      </span>
                    </div>
                    <span className="font-mono text-base font-black text-sky-400">
                      {analysis.cutLengths.octagonalAxleLengthMm} mm
                    </span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-white block">Coulisses Latérales (2 pcs)</span>
                      <span className="text-[10px] text-slate-400">
                        Avec joint brosse anti-bruit et tulipes PVC
                      </span>
                    </div>
                    <span className="font-mono text-base font-black text-emerald-400">
                      {analysis.cutLengths.guideRailsLengthMm} mm
                    </span>
                  </div>
                </div>
              </div>

              {/* Fabrication Notes */}
              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                <h4 className="font-bold text-white text-xs uppercase tracking-wider">
                  Directives d'Assemblage Atelier
                </h4>
                <div className="space-y-1.5 text-slate-300">
                  {analysis.workshopFabricationNotesFr.map((note, i) => (
                    <div key={i} className="flex items-start gap-2 bg-slate-900/80 p-2.5 rounded-lg border border-slate-800/80">
                      <ChevronRight className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                      <span>{note}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Export Buttons */}
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
                <h4 className="font-bold text-white text-xs uppercase tracking-wider">
                  Diffusion Fiche Atelier & Devis
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <button
                    onClick={handleGeneratePdf}
                    disabled={isGeneratingPdf}
                    className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-all shadow-md active:scale-95"
                  >
                    <FileCheck className="w-4 h-4" />
                    {isGeneratingPdf ? 'Génération...' : 'Générer Fiche Atelier (PDF)'}
                  </button>
                  <button
                    onClick={handleWhatsAppDispatch}
                    className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition-all shadow-md active:scale-95"
                  >
                    <MessageCircle className="w-4 h-4" />
                    Partager sur WhatsApp
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Toast */}
        {showToast && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-xl bg-slate-800 text-white text-xs font-semibold shadow-2xl border border-slate-700 flex items-center gap-2 animate-bounce">
            <Check className="w-4 h-4 text-emerald-400" />
            <span>{showToast}</span>
          </div>
        )}
      </div>
    </div>
  );
};
