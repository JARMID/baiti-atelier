/**
 * Baiti Atelier - Fastener Anchor Depth & Wind Load Pullout Safety Modal
 * Normative references: NF DTU 36.5 / Eurocode 9 / DTR BC 2-47 (RNV 1999/2013)
 * Humanizer compliant: exactly 0 em dashes, 0 en dashes.
 */

import React, { useState, useMemo } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  FileCheck,
  MessageCircle,
  X,
  Check,
  Info,
  ChevronRight,
  Wind,
  Layers,
  Wrench,
  Building,
} from 'lucide-react';
import {
  calculateFastenerSafety,
  formatFastenerSafetyWhatsApp,
  WIND_ZONES_RNV,
  TERRAIN_CATEGORIES,
  WALL_SUBSTRATES,
  FASTENER_CATALOG,
  type WindZoneRnv,
  type TerrainRoughness,
  type WallSubstrate,
  type FastenerType,
  type InstallationPoseType,
} from '../../utils/fastenerSafetyManager';
import { generateFastenerCalculationPdf } from '../../utils/pdfGenerator';
import { playSwitchSound, playTactileClick } from '../../utils/audioFeedback';

export interface FastenerSafetyModalProps {
  isOpen: boolean;
  onClose: () => void;
  widthMm?: number;
  heightMm?: number;
  windowReference?: string;
  wilayaName?: string;
  clientName?: string;
  isDarkProfile?: boolean;
}

type ActiveTab = 'calculator' | 'layout' | 'prescriptions';

export const FastenerSafetyModal: React.FC<FastenerSafetyModalProps> = ({
  isOpen,
  onClose,
  widthMm = 1400,
  heightMm = 1500,
  windowReference = 'Baie Salon F-01',
  wilayaName = 'Alger (16)',
  clientName = 'Chantier Particulier',
  isDarkProfile = false,
}) => {
  // State hooks called unconditionally
  const [activeTab, setActiveTab] = useState<ActiveTab>('calculator');
  const [selectedSubstrate, setSelectedSubstrate] = useState<WallSubstrate>('hollow_clay_brick_12');
  const [selectedWindZone, setSelectedWindZone] = useState<WindZoneRnv>('zone_2');
  const [selectedTerrain, setSelectedTerrain] = useState<TerrainRoughness>('cat_3_suburban');
  const [buildingHeightM, setBuildingHeightM] = useState<number>(12); // e.g. R+3
  const [selectedFastener, setSelectedFastener] = useState<FastenerType>('nylon_frame_plug_10');
  const [installationPose, setInstallationPose] = useState<InstallationPoseType>('reveal_middle');
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [showToast, setShowToast] = useState<string | null>(null);

  // Compute fastener safety analysis
  const analysis = useMemo(() => {
    return calculateFastenerSafety({
      widthMm,
      heightMm,
      windZone: selectedWindZone,
      terrainCategory: selectedTerrain,
      buildingHeightM,
      wallSubstrate: selectedSubstrate,
      fastenerType: selectedFastener,
      installationPose,
      profileColorDark: isDarkProfile,
    });
  }, [
    widthMm,
    heightMm,
    selectedWindZone,
    selectedTerrain,
    buildingHeightM,
    selectedSubstrate,
    selectedFastener,
    installationPose,
    isDarkProfile,
  ]);

  if (!isOpen) return null;

  const handleTabChange = (tab: ActiveTab) => {
    playSwitchSound();
    setActiveTab(tab);
  };

  const handleGeneratePdf = async () => {
    playTactileClick();
    setIsGeneratingPdf(true);
    try {
      const documentId = `FIX-CALC-${Date.now().toString().slice(-6)}`;
      await generateFastenerCalculationPdf({
        documentId,
        projectOrClientName: clientName,
        locationWilaya: wilayaName,
        windowReference,
        widthMm,
        heightMm,
        result: analysis,
      });
      setShowToast('Note de calcul des fixations générée en PDF');
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
    const message = formatFastenerSafetyWhatsApp(
      analysis,
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
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400">
              <Wind className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold tracking-tight text-white">
                  Fixations & Résistance Arrachement au Vent
                </h2>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                  NF DTU 36.5
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Dimensionnement des ancrages maçonnerie selon DTR BC 2-47 (RNV 1999/2013)
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
                ? 'bg-sky-500/15 text-sky-300 border border-sky-500/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Wrench className="w-3.5 h-3.5" />
            Calculateur Ancrage
          </button>
          <button
            onClick={() => handleTabChange('layout')}
            className={`flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'layout'
                ? 'bg-sky-500/15 text-sky-300 border border-sky-500/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Plan d Implantation
          </button>
          <button
            onClick={() => handleTabChange('prescriptions')}
            className={`flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'prescriptions'
                ? 'bg-sky-500/15 text-sky-300 border border-sky-500/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileCheck className="w-3.5 h-3.5" />
            Règles & Export PDF
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
          {/* TAB 1: CALCULATOR */}
          {activeTab === 'calculator' && (
            <div className="space-y-4">
              {/* Verdict Summary Card */}
              <div
                className={`p-4 rounded-xl border ${analysis.badgeBorderClass} ${analysis.badgeBgClass} transition-all`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    {analysis.isPulloutSafe ? (
                      <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        <ShieldCheck className="w-6 h-6" />
                      </div>
                    ) : (
                      <div className="p-2.5 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30 animate-pulse">
                        <ShieldAlert className="w-6 h-6" />
                      </div>
                    )}
                    <div>
                      <span className={`text-xs font-bold uppercase tracking-wider ${analysis.badgeTextClass}`}>
                        {analysis.statusBadgeFr}
                      </span>
                      <div className="text-xl font-black text-white mt-0.5">
                        Effort par cheville : {analysis.windPulloutForcePerFastenerDaN} daN{' '}
                        <span className="text-xs font-normal text-slate-300">
                          (Admissible support : {analysis.substrateData.pulloutAdmissibleDaN} daN)
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end justify-between border-t sm:border-t-0 border-slate-700/50 pt-2 sm:pt-0">
                    <span className="text-xs text-slate-400">Facteur Sécurité (Sf)</span>
                    <span
                      className={`text-2xl font-black ${
                        analysis.pulloutSafetyFactor >= 2.0
                          ? 'text-emerald-400'
                          : analysis.pulloutSafetyFactor >= 1.5
                          ? 'text-amber-400'
                          : 'text-rose-400'
                      }`}
                    >
                      {analysis.pulloutSafetyFactor.toFixed(2)}
                      <span className="text-xs text-slate-400 font-normal"> / min 1.50</span>
                    </span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-3">
                  <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden p-0.5 flex">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        analysis.pulloutSafetyFactor >= 2.0
                          ? 'bg-emerald-400'
                          : analysis.pulloutSafetyFactor >= 1.5
                          ? 'bg-amber-400'
                          : 'bg-rose-500'
                      }`}
                      style={{
                        width: `${Math.min(100, (analysis.pulloutSafetyFactor / 3.0) * 100)}%`,
                      }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                    <span className="text-rose-400 font-bold">1.00 (Rupture)</span>
                    <span className="text-amber-400 font-semibold">1.50 (Seuil DTU 36.5)</span>
                    <span className="text-emerald-400 font-bold">2.50+ (Sécurité Optimale)</span>
                  </div>
                </div>

                {/* Quick Substrate Alert if Hollow Brick */}
                {selectedSubstrate === 'hollow_clay_brick_8' && (
                  <div className="mt-3 p-2.5 rounded-lg bg-amber-950/60 border border-amber-500/40 text-xs text-amber-200 flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-amber-300">ATTENTION BRIQUE CREUSE 8 TROUS : </strong>
                      Support très vulnérable. Perçage impératif en rotation pure sans percussion. Privilégier un scellement chimique à tamis d injection pour les étages élevés.
                    </div>
                  </div>
                )}
              </div>

              {/* Form Input Selectors */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Paramètres de l'Ouvrage et du Site
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {/* Wall Substrate */}
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1.5">
                    <label className="font-semibold text-slate-300 flex items-center justify-between">
                      <span>Nature de la Maçonnerie</span>
                      <span className="text-[10px] text-sky-400">
                        {analysis.substrateData.pulloutAdmissibleDaN} daN max
                      </span>
                    </label>
                    <select
                      value={selectedSubstrate}
                      onChange={(e) => {
                        playSwitchSound();
                        setSelectedSubstrate(e.target.value as WallSubstrate);
                      }}
                      className="w-full px-2.5 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 text-xs focus:ring-1 focus:ring-sky-400 focus:outline-none"
                    >
                      {Object.values(WALL_SUBSTRATES).map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.labelFr}
                        </option>
                      ))}
                    </select>
                    <p className="text-[10px] text-slate-400 leading-tight">
                      {analysis.substrateData.subFr}
                    </p>
                  </div>

                  {/* Wind Zone RNV */}
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1.5">
                    <label className="font-semibold text-slate-300 flex items-center justify-between">
                      <span>Zone de Vent RNV (DTR BC 2-47)</span>
                      <span className="text-[10px] text-amber-400">
                        {analysis.windZoneData.referenceVelocityKmPerH} km/h
                      </span>
                    </label>
                    <select
                      value={selectedWindZone}
                      onChange={(e) => {
                        playSwitchSound();
                        setSelectedWindZone(e.target.value as WindZoneRnv);
                      }}
                      className="w-full px-2.5 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 text-xs focus:ring-1 focus:ring-sky-400 focus:outline-none"
                    >
                      {Object.values(WIND_ZONES_RNV).map((w) => (
                        <option key={w.id} value={w.id}>
                          {w.nameFr}
                        </option>
                      ))}
                    </select>
                    <p className="text-[10px] text-slate-400 leading-tight">
                      {analysis.windZoneData.typicalWilayasFr}
                    </p>
                  </div>

                  {/* Terrain Category */}
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1.5">
                    <label className="font-semibold text-slate-300">Catégorie de Terrain</label>
                    <select
                      value={selectedTerrain}
                      onChange={(e) => {
                        playSwitchSound();
                        setSelectedTerrain(e.target.value as TerrainRoughness);
                      }}
                      className="w-full px-2.5 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 text-xs focus:ring-1 focus:ring-sky-400 focus:outline-none"
                    >
                      {Object.values(TERRAIN_CATEGORIES).map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.labelFr}
                        </option>
                      ))}
                    </select>
                    <p className="text-[10px] text-slate-400 leading-tight">
                      {analysis.terrainData.subFr}
                    </p>
                  </div>

                  {/* Building Height */}
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1.5">
                    <label className="font-semibold text-slate-300 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Building className="w-3.5 h-3.5 text-sky-400" />
                        Hauteur de la Baie
                      </span>
                      <span className="font-mono text-sky-400 font-bold">{buildingHeightM} m</span>
                    </label>
                    <input
                      type="range"
                      min={2}
                      max={45}
                      step={1}
                      value={buildingHeightM}
                      onChange={(e) => setBuildingHeightM(Number(e.target.value))}
                      className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-sky-400"
                    />
                    <div className="flex justify-between text-[10px] text-slate-400">
                      <span>RDC (3m)</span>
                      <span>R+3 (12m)</span>
                      <span>R+7 (24m)</span>
                      <span>Tour (45m)</span>
                    </div>
                  </div>

                  {/* Fastener Type */}
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1.5">
                    <label className="font-semibold text-slate-300">Modèle de Fixation</label>
                    <select
                      value={selectedFastener}
                      onChange={(e) => {
                        playSwitchSound();
                        setSelectedFastener(e.target.value as FastenerType);
                      }}
                      className="w-full px-2.5 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 text-xs focus:ring-1 focus:ring-sky-400 focus:outline-none"
                    >
                      {Object.values(FASTENER_CATALOG).map((f) => (
                        <option key={f.id} value={f.id}>
                          {f.labelFr}
                        </option>
                      ))}
                    </select>
                    <p className="text-[10px] text-slate-400 leading-tight">
                      {analysis.fastenerData.subFr}
                    </p>
                  </div>

                  {/* Installation Pose Mode */}
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1.5">
                    <label className="font-semibold text-slate-300">Type de Pose</label>
                    <select
                      value={installationPose}
                      onChange={(e) => {
                        playSwitchSound();
                        setInstallationPose(e.target.value as InstallationPoseType);
                      }}
                      className="w-full px-2.5 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 text-xs focus:ring-1 focus:ring-sky-400 focus:outline-none"
                    >
                      <option value="reveal_middle">Pose en Tableau / Ébrasement (Tunnel)</option>
                      <option value="surface_interior_insulated">Pose en Applique Intérieure (Isolation)</option>
                      <option value="rebate_exterior">Pose en Feuillure Maçonnée Extérieure</option>
                      <option value="renovation_overlay">Pose en Rénovation sur Bâti Existant</option>
                    </select>
                    <p className="text-[10px] text-slate-400 leading-tight">
                      Espacement DTU : max {isDarkProfile ? '700' : '800'} mm entre fixations
                    </p>
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
                  <FileCheck className="w-4 h-4 text-sky-400" />
                  {isGeneratingPdf ? 'Génération...' : 'Exporter Note de Calcul (PDF)'}
                </button>
                <button
                  onClick={handleWhatsAppDispatch}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm transition-all"
                >
                  <MessageCircle className="w-4 h-4" />
                  Envoyer Note aux Poseurs
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: LAYOUT BLUEPRINT */}
          {activeTab === 'layout' && (
            <div className="space-y-4 text-xs">
              {/* Perimeter Blueprint Schematic */}
              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-sky-400" />
                    Plan d'Implantation des Fixations ({analysis.pitchResult.totalFastenersCount} points)
                  </span>
                  <span className="text-[10px] text-slate-400">
                    Dimensions : {widthMm} x {heightMm} mm
                  </span>
                </div>

                {/* SVG Blueprint */}
                <div className="relative w-full h-56 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center p-3 overflow-hidden">
                  <svg viewBox="0 0 340 220" className="w-full h-full max-h-52">
                    {/* Masonry reveal background */}
                    <rect x="25" y="20" width="290" height="180" fill="#1e293b" stroke="#334155" strokeWidth="2" strokeDasharray="3 3" rx="4" />
                    <text x="170" y="15" fill="#64748b" fontSize="7" textAnchor="middle" fontWeight="bold">
                      Gros Œuvre Maçonnerie ({analysis.substrateData.labelFr})
                    </text>

                    {/* Window Frame Dormant */}
                    <rect x="45" y="35" width="250" height="150" fill="#0f172a" stroke="#38bdf8" strokeWidth="2" rx="2" />
                    <text x="170" y="115" fill="#38bdf8" fontSize="10" textAnchor="middle" fontWeight="bold">
                      {windowReference}
                    </text>
                    <text x="170" y="130" fill="#94a3b8" fontSize="8" textAnchor="middle">
                      {widthMm} x {heightMm} mm • {analysis.windowAreaM2} m²
                    </text>

                    {/* Left Upright Fastener Dots */}
                    {Array.from({ length: analysis.pitchResult.uprightsCountPerSide }).map((_, i) => {
                      const stepY = 150 / (analysis.pitchResult.uprightsCountPerSide + 1);
                      const cy = 35 + stepY * (i + 1);
                      return (
                        <g key={`left-${i}`}>
                          <circle cx="45" cy={cy} r="4" fill="#f59e0b" stroke="#ffffff" strokeWidth="1.5" />
                          <circle cx="45" cy={cy} r="1.5" fill="#0f172a" />
                        </g>
                      );
                    })}

                    {/* Right Upright Fastener Dots */}
                    {Array.from({ length: analysis.pitchResult.uprightsCountPerSide }).map((_, i) => {
                      const stepY = 150 / (analysis.pitchResult.uprightsCountPerSide + 1);
                      const cy = 35 + stepY * (i + 1);
                      return (
                        <g key={`right-${i}`}>
                          <circle cx="295" cy={cy} r="4" fill="#f59e0b" stroke="#ffffff" strokeWidth="1.5" />
                          <circle cx="295" cy={cy} r="1.5" fill="#0f172a" />
                        </g>
                      );
                    })}

                    {/* Lintel Transom Fastener Dots */}
                    {Array.from({ length: analysis.pitchResult.transomHeadCount }).map((_, i) => {
                      const stepX = 250 / (analysis.pitchResult.transomHeadCount + 1);
                      const cx = 45 + stepX * (i + 1);
                      return (
                        <g key={`head-${i}`}>
                          <circle cx={cx} cy="35" r="4" fill="#f59e0b" stroke="#ffffff" strokeWidth="1.5" />
                          <circle cx={cx} cy="35" r="1.5" fill="#0f172a" />
                        </g>
                      );
                    })}

                    {/* Sill Transom Fastener Dots */}
                    {Array.from({ length: analysis.pitchResult.transomSillCount }).map((_, i) => {
                      const stepX = 250 / (analysis.pitchResult.transomSillCount + 1);
                      const cx = 45 + stepX * (i + 1);
                      return (
                        <g key={`sill-${i}`}>
                          <circle cx={cx} cy="185" r="4" fill="#38bdf8" stroke="#ffffff" strokeWidth="1.5" />
                          <circle cx={cx} cy="185" r="1.5" fill="#0f172a" />
                        </g>
                      );
                    })}

                    {/* Legend */}
                    <g transform="translate(48, 165)">
                      <circle cx="5" cy="5" r="3" fill="#f59e0b" />
                      <text x="12" y="8" fill="#cbd5e1" fontSize="6.5">Cheville cadre traversante</text>
                      <circle cx="115" cy="5" r="3" fill="#38bdf8" />
                      <text x="122" y="8" fill="#cbd5e1" fontSize="6.5">Fixation seuil étanchée</text>
                    </g>
                  </svg>
                </div>
              </div>

              {/* Exact Fastener Coordinates Breakdown */}
              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2.5">
                <h4 className="font-bold text-white uppercase tracking-wider text-xs">
                  Répartition des Ancrages selon NF DTU 36.5
                </h4>
                <ul className="space-y-1.5 text-slate-300">
                  {analysis.pitchResult.fastenersLocationsFr.map((loc, i) => (
                    <li key={i} className="flex items-start gap-2 bg-slate-900/80 p-2 rounded-lg border border-slate-800/80">
                      <ChevronRight className="w-3.5 h-3.5 text-sky-400 shrink-0 mt-0.5" />
                      <span>{loc}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Prescriptions Distance angles & Espacement */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-center">
                <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Distance aux Angles</span>
                  <span className="text-sm font-black text-amber-400">{analysis.pitchResult.cornerDistanceMm} mm</span>
                  <span className="text-[9px] text-slate-500 block">100 à 150 mm DTU</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Pas Moyen Montants</span>
                  <span className="text-sm font-black text-sky-400">~{analysis.pitchResult.spacingMontantsMm} mm</span>
                  <span className="text-[9px] text-slate-500 block">Max autorise 800 mm</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 col-span-2 sm:col-span-1">
                  <span className="text-[10px] text-slate-400 block">Profondeur Perçage</span>
                  <span className="text-sm font-black text-emerald-400">≥ {analysis.recommendedMinimumDrillDepthMm} mm</span>
                  <span className="text-[9px] text-slate-500 block">Ancrage effectif</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: PRESCRIPTIONS & EXPORT */}
          {activeTab === 'prescriptions' && (
            <div className="space-y-4 text-xs">
              {/* Drilling Technique Alert Box */}
              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-sky-400 font-bold">
                  <Info className="w-4 h-4" />
                  Prescriptions de Perçage et Pose (NF DTU 36.5)
                </div>
                <p className="text-slate-300 leading-relaxed">
                  Une fixation de menuiserie ne vaut que par la qualité de son ancrage dans le gros œuvre. Dans la brique creuse algérienne (8 ou 12 trous), l utilisation de la percussion du marteau perforateur détruit les alvéoles internes et divise la résistance par cinq.
                </p>
              </div>

              {/* Shimming and Execution Directives */}
              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                <h4 className="font-bold text-white text-xs uppercase tracking-wider">
                  Directives d'Atelier et de Chantier
                </h4>
                <div className="space-y-2 text-slate-300">
                  {analysis.masonryShimmingAdviceFr.map((adv, i) => (
                    <div key={i} className="flex items-start gap-2 bg-slate-900/80 p-2.5 rounded-lg border border-slate-800/80">
                      <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{adv}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Export and Dispatch Actions */}
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
                <h4 className="font-bold text-white text-xs uppercase tracking-wider">
                  Formalisation Technique Chantier
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <button
                    onClick={handleGeneratePdf}
                    disabled={isGeneratingPdf}
                    className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-all shadow-md active:scale-95"
                  >
                    <FileCheck className="w-4 h-4" />
                    {isGeneratingPdf ? 'Génération...' : 'Générer Note de Calcul (PDF)'}
                  </button>
                  <button
                    onClick={handleWhatsAppDispatch}
                    className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition-all shadow-md active:scale-95"
                  >
                    <MessageCircle className="w-4 h-4" />
                    Transmettre par WhatsApp
                  </button>
                </div>
                <p className="text-[10px] text-slate-400 text-center">
                  La note de calcul des fixations est exigible par les bureaux de contrôle (CTC) pour les chantiers ERP et immeubles collectifs.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Toast Notification */}
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
