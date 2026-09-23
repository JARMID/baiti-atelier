import React, { useState, useMemo } from 'react';
import {
  X,
  FileText,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Sliders,
  Activity,
  Compass,
  Check,
  ShieldAlert,
  Layers,
} from 'lucide-react';
import { playTactileClick, playSwitchSound } from '../../utils/audioFeedback';
import {
  type BalustradeGlassType,
  type BuildingUsageCategory,
  type BaseShoeMountingType,
  type HandrailType,
  BALUSTRADE_GLASS_CATALOG,
  computeGlassBalustradeAudit,
} from '../../utils/glassBalustradeManager';
import { generateGlassBalustradeNoticePdf } from '../../utils/pdfGenerator';

interface GlassBalustradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialWidth?: number;
  initialHeight?: number;
  projectReference?: string;
  wilayaName?: string;
  clientName?: string;
}

export const GlassBalustradeModal: React.FC<GlassBalustradeModalProps> = ({
  isOpen,
  onClose,
  initialWidth = 1200,
  initialHeight = 1000,
  projectReference = 'Garde-Corps Verre Autoportant NF P 01-012',
  wilayaName = 'Alger',
  clientName = 'Chantier Client',
}) => {
  const [activeTab, setActiveTab] = useState<'config' | 'structural_stresses' | 'cad_diagram' | 'safety_standards'>('config');

  // Interactive Inputs
  const [panelWidthMm, setPanelWidthMm] = useState<number>(initialWidth);
  const [panelHeightMm, setPanelHeightMm] = useState<number>(initialHeight);
  const [glassType, setGlassType] = useState<BalustradeGlassType>('glass_10_10_4_esg_pvb');
  const [buildingUsage, setBuildingUsage] = useState<BuildingUsageCategory>('cat_a_residential');
  const [mountingType, setMountingType] = useState<BaseShoeMountingType>('shoe_top_floor_mount');
  const [handrailType, setHandrailType] = useState<HandrailType>('continuous_u_profile_steel');
  const [fallHeightM, setFallHeightM] = useState<number>(3.5);
  const [windDynamicPressurePa, setWindDynamicPressurePa] = useState<number>(375);
  const [anchorSpacingMm, setAnchorSpacingMm] = useState<number>(250);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  // Compute Audit Results
  const audit = useMemo(() => {
    return computeGlassBalustradeAudit({
      panelWidthMm,
      panelHeightMm,
      glassType,
      buildingUsage,
      mountingType,
      handrailType,
      fallHeightM,
      windDynamicPressurePa,
      anchorSpacingMm,
      wilayaName,
      clientName,
      projectReference,
    });
  }, [
    panelWidthMm,
    panelHeightMm,
    glassType,
    buildingUsage,
    mountingType,
    handrailType,
    fallHeightM,
    windDynamicPressurePa,
    anchorSpacingMm,
    wilayaName,
    clientName,
    projectReference,
  ]);

  if (!isOpen) return null;

  const isOk = audit.globalStatus === 'conform';
  const isWarning = audit.globalStatus === 'warning';

  const handleDownloadPdf = async () => {
    try {
      setIsGeneratingPdf(true);
      playTactileClick();
      const docId = `GARDE-${Date.now().toString().slice(-6)}`;
      await generateGlassBalustradeNoticePdf({
        documentId: docId,
        projectRef: projectReference,
        clientName,
        wilayaName,
        result: audit,
      });
    } catch (err) {
      console.error('Erreur generation PDF Garde-Corps:', err);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header Bar */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                <span>Garde-Corps en Verre Autoportant & Sabots</span>
                <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30">
                  NF P 01-012 / 01-013
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Poussée de foule, flexion en pied, flèche en tête et sécurité post-rupture
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadPdf}
              disabled={isGeneratingPdf}
              className="min-h-[44px] px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 disabled:bg-slate-700 text-white text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer shadow-sm active:scale-95"
              title="Exporter la note de calcul technique officielle PDF"
            >
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">
                {isGeneratingPdf ? 'Génération...' : 'Certificat PDF'}
              </span>
            </button>

            <button
              onClick={() => {
                playTactileClick();
                onClose();
              }}
              className="min-h-[44px] min-w-[44px] p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer flex items-center justify-center"
              aria-label="Fermer la modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Global Verdict Banner */}
        <div
          className={`px-5 py-3 border-b flex flex-wrap items-center justify-between gap-3 text-xs ${
            isOk
              ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-300'
              : isWarning
                ? 'bg-amber-950/40 border-amber-800/60 text-amber-300'
                : 'bg-rose-950/40 border-rose-800/60 text-rose-300'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {isOk ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            )}
            <span className="font-semibold text-white">{audit.statusSummaryFr}</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="bg-slate-900/60 px-2.5 py-1 rounded-md border border-slate-700/60 text-slate-200">
              Moment pied : <strong>{audit.overturningBaseMomentNm} N.m</strong>
            </span>
            <span className="bg-slate-900/60 px-2.5 py-1 rounded-md border border-slate-700/60 text-slate-200">
              Flèche : <strong>{audit.topTipDeflectionMm} mm</strong> (limite {audit.allowableDeflectionLimitMm} mm)
            </span>
            <span className="bg-slate-900/60 px-2.5 py-1 rounded-md border border-slate-700/60 text-slate-200">
              Traction cheville : <strong>{audit.tensilePulloutForcePerAnchorN} N</strong>
            </span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-950/40 px-3 overflow-x-auto">
          <button
            onClick={() => {
              playSwitchSound();
              setActiveTab('config');
            }}
            className={`min-h-[44px] px-4 py-2.5 text-xs font-medium border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'config'
                ? 'border-teal-500 text-teal-400 bg-teal-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sliders className="w-4 h-4" />
            Configuration & Vitrage
          </button>
          <button
            onClick={() => {
              playSwitchSound();
              setActiveTab('structural_stresses');
            }}
            className={`min-h-[44px] px-4 py-2.5 text-xs font-medium border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'structural_stresses'
                ? 'border-teal-500 text-teal-400 bg-teal-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Activity className="w-4 h-4" />
            Poussée Foule & Résistance
          </button>
          <button
            onClick={() => {
              playSwitchSound();
              setActiveTab('cad_diagram');
            }}
            className={`min-h-[44px] px-4 py-2.5 text-xs font-medium border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'cad_diagram'
                ? 'border-teal-500 text-teal-400 bg-teal-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Compass className="w-4 h-4" />
            Schéma 2D CAD Sabot & Dalle
          </button>
          <button
            onClick={() => {
              playSwitchSound();
              setActiveTab('safety_standards');
            }}
            className={`min-h-[44px] px-4 py-2.5 text-xs font-medium border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'safety_standards'
                ? 'border-teal-500 text-teal-400 bg-teal-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            Normes NF P 01-012 & Sécurité
          </button>
        </div>

        {/* Tab Content Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5">
          {/* TAB 1: CONFIGURATION & VITRAGE */}
          {activeTab === 'config' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Dimensions et Type de Vitrage */}
              <div className="bg-slate-800/60 border border-slate-700/80 rounded-xl p-4 space-y-4">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <Layers className="w-4 h-4 text-teal-400" />
                  Dimensions du Panneau & Composition Verre
                </h3>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Largeur panneau (mm)</label>
                    <input
                      type="number"
                      value={panelWidthMm}
                      onChange={(e) => setPanelWidthMm(Math.max(400, parseInt(e.target.value) || 400))}
                      className="min-h-[44px] w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:border-teal-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Hauteur garde-corps (mm)</label>
                    <input
                      type="number"
                      value={panelHeightMm}
                      onChange={(e) => setPanelHeightMm(Math.max(800, parseInt(e.target.value) || 800))}
                      className="min-h-[44px] w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:border-teal-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs text-slate-400 block mb-1">Composition du Verre Feuilleté</label>
                  <select
                    value={glassType}
                    onChange={(e) => {
                      playTactileClick();
                      setGlassType(e.target.value as BalustradeGlassType);
                    }}
                    className="min-h-[44px] w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-xs focus:border-teal-500 focus:outline-none"
                  >
                    {Object.values(BALUSTRADE_GLASS_CATALOG).map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.nameFr}
                      </option>
                    ))}
                  </select>
                  <p className="text-[11px] text-slate-400 mt-1.5 italic">
                    {BALUSTRADE_GLASS_CATALOG[glassType].description}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800 text-xs">
                    <span className="text-slate-400 block">Poids du panneau</span>
                    <strong className="text-white text-sm">{audit.panelWeightKg} kg</strong>
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      Surface : {audit.panelAreaM2} m² (2.5 kg/m²/mm)
                    </span>
                  </div>
                  <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800 text-xs">
                    <span className="text-slate-400 block">Hauteur réglementaire</span>
                    <strong className={audit.isHeightCompliant ? 'text-emerald-400 text-sm' : 'text-rose-400 text-sm'}>
                      Min {audit.minRegulatedHeightMm} mm
                    </strong>
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      Chute arrière : {fallHeightM} m ({audit.isHeightCompliant ? 'Valide' : 'Trop bas'})
                    </span>
                  </div>
                </div>
              </div>

              {/* Sabot de Sol et Destination Bâtiment */}
              <div className="bg-slate-800/60 border border-slate-700/80 rounded-xl p-4 space-y-4">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-teal-400" />
                  Sabot de Fixation & Catégorie Bâtiment
                </h3>

                <div>
                  <label className="text-xs text-slate-400 block mb-1">Destination & Usage du Bâtiment</label>
                  <select
                    value={buildingUsage}
                    onChange={(e) => {
                      playTactileClick();
                      setBuildingUsage(e.target.value as BuildingUsageCategory);
                    }}
                    className="min-h-[44px] w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-xs focus:border-teal-500 focus:outline-none"
                  >
                    <option value="cat_a_residential">Logement Privé / Balcon Résidentiel (0.60 kN/m - 60 daN/m)</option>
                    <option value="cat_b_office_admin">Bureaux & Bâtiments Tertiaires (1.00 kN/m - 100 daN/m)</option>
                    <option value="cat_c1_restaurant_hospital">Hôtels, Restaurants & ERP (1.00 kN/m - 100 daN/m)</option>
                    <option value="cat_c2_retail_mall">Centres Commerciaux & Espaces Publics (1.70 kN/m - 170 daN/m)</option>
                    <option value="cat_c5_stadium_crowd">Tribunes de Stades & Salles de Spectacle (3.00 kN/m - 300 daN/m)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs text-slate-400 block mb-1">Modèle de Sabot & Implantation</label>
                  <select
                    value={mountingType}
                    onChange={(e) => {
                      playTactileClick();
                      setMountingType(e.target.value as BaseShoeMountingType);
                    }}
                    className="min-h-[44px] w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-xs focus:border-teal-500 focus:outline-none"
                  >
                    <option value="shoe_top_floor_mount">Pose sur dalle à plat (Sabot continu aluminium 6063 T6)</option>
                    <option value="shoe_side_fascia_mount">Pose en nez de dalle à l anglaise (Sabot latéral façade)</option>
                    <option value="shoe_recessed_in_slab">Pose encastrée dans la chape (Profil affleurant au sol)</option>
                    <option value="point_clamps_spigots">Pinces au sol en inox 316 (Spigots cylindriques ou carrés)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs text-slate-400 block mb-1">Type de Main Courante Supérieure</label>
                  <select
                    value={handrailType}
                    onChange={(e) => {
                      playTactileClick();
                      setHandrailType(e.target.value as HandrailType);
                    }}
                    className="min-h-[44px] w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-xs focus:border-teal-500 focus:outline-none"
                  >
                    <option value="continuous_u_profile_steel">Profil U continu en inox brossé (Solidarise les panneaux)</option>
                    <option value="continuous_aluminum_cap">Profil capot aluminium thermolaqué avec joint EPDM</option>
                    <option value="minimalist_edge_guard">Profil de protection de chant minimaliste ultra-fin</option>
                    <option value="cantilever_frameless_no_rail">Bord franc sans main courante (Verre 100% visible épuré)</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Hauteur chute (m)</label>
                    <input
                      type="number"
                      step="0.5"
                      value={fallHeightM}
                      onChange={(e) => setFallHeightM(Math.max(0.5, parseFloat(e.target.value) || 0.5))}
                      className="min-h-[44px] w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:border-teal-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Entraxe ancrage (mm)</label>
                    <input
                      type="number"
                      step="25"
                      value={anchorSpacingMm}
                      onChange={(e) => setAnchorSpacingMm(Math.max(150, parseInt(e.target.value) || 150))}
                      className="min-h-[44px] w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:border-teal-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Pression vent (Pa)</label>
                    <input
                      type="number"
                      step="25"
                      value={windDynamicPressurePa}
                      onChange={(e) => setWindDynamicPressurePa(Math.max(200, parseInt(e.target.value) || 200))}
                      className="min-h-[44px] w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:border-teal-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: POUSSEE FOULE & RESISTANCE */}
          {activeTab === 'structural_stresses' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-slate-800/70 border border-slate-700 rounded-xl p-3.5">
                  <span className="text-slate-400 text-xs block">Charge Linéaire qd (ELU)</span>
                  <span className="text-xl font-bold text-teal-400">{audit.designCrowdLineLoadQdKnM} kN/m</span>
                  <span className="text-[11px] text-slate-400 block mt-1">
                    Charge nominale qk : {audit.nominalCrowdLineLoadQkKnM} kN/m (x1.5)
                  </span>
                </div>
                <div className="bg-slate-800/70 border border-slate-700 rounded-xl p-3.5">
                  <span className="text-slate-400 text-xs block">Contrainte de Flexion Verre</span>
                  <span
                    className={`text-xl font-bold ${
                      audit.isStressCompliant ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {audit.calculatedBendingStressMpa} MPa
                  </span>
                  <span className="text-[11px] text-slate-400 block mt-1">
                    Limite admissible : {audit.allowableBendingStressMpa} MPa ({audit.bendingStressUtilizationPercent}%)
                  </span>
                </div>
                <div className="bg-slate-800/70 border border-slate-700 rounded-xl p-3.5">
                  <span className="text-slate-400 text-xs block">Flèche en Tête sous Charge</span>
                  <span
                    className={`text-xl font-bold ${
                      audit.isDeflectionCompliant ? 'text-emerald-400' : 'text-amber-400'
                    }`}
                  >
                    {audit.topTipDeflectionMm} mm
                  </span>
                  <span className="text-[11px] text-slate-400 block mt-1">
                    Seuil limite : {audit.allowableDeflectionLimitMm} mm (H/{audit.deflectionRatioSpan})
                  </span>
                </div>
              </div>

              {/* Moment & Ancrage Sol Box */}
              <div
                className={`p-4 rounded-xl border ${
                  audit.isStressCompliant && audit.isAnchorSafe
                    ? 'bg-emerald-950/40 border-emerald-800/80 text-emerald-300'
                    : 'bg-rose-950/40 border-rose-800/80 text-rose-300'
                }`}
              >
                <div className="flex items-start gap-3">
                  {audit.isStressCompliant && audit.isAnchorSafe ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                  )}
                  <div className="space-y-1 text-xs">
                    <h4 className="font-bold text-white text-sm">
                      {audit.isStressCompliant && audit.isAnchorSafe
                        ? 'SÉCURITÉ STRUCTURELLE VÉRIFIÉE À L ÉTAT LIMITE ULTIME (ELU)'
                        : 'NON-CONFORMITÉ STRUCTURELLE : RISQUE DE RUPTURE OU ARRACHEMENT !'}
                    </h4>
                    <p>
                      La poussée horizontale de foule ({audit.totalCrowdForceOnPanelN} N) combinée au vent génère un couple de renversement en pied de{' '}
                      <strong>{audit.overturningBaseMomentNm} N.m</strong>.
                    </p>
                    <p>
                      L effort de traction calculé sur chaque cheville d ancrage est de{' '}
                      <strong>{audit.tensilePulloutForcePerAnchorN} N</strong> ({audit.anchorsCountPerPanel} fixations au sol).{' '}
                      <span className="text-white font-medium">{audit.recommendedAnchorTypeFr}.</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Table Détails Mécaniques */}
              <div className="bg-slate-800/60 border border-slate-700/80 rounded-xl overflow-hidden">
                <div className="px-4 py-2.5 bg-slate-950/60 border-b border-slate-800 font-semibold text-xs text-white">
                  Grandeurs Physiques & Épaisseur Équivalente
                </div>
                <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-2">
                    <div className="flex justify-between py-1 border-b border-slate-800">
                      <span className="text-slate-400">Épaisseur équivalente flexion (heff,sigma) :</span>
                      <strong className="text-white">{audit.effectiveGlassThicknessBendingMm} mm</strong>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-800">
                      <span className="text-slate-400">Épaisseur équivalente flèche (heff,w) :</span>
                      <strong className="text-white">{audit.effectiveGlassThicknessDeflectionMm} mm</strong>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-800">
                      <span className="text-slate-400">Poussée totale de foule sur le panneau :</span>
                      <strong className="text-white">{audit.totalCrowdForceOnPanelN} N</strong>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-800">
                      <span className="text-slate-400">Effort d action du vent (RNV 2013) :</span>
                      <strong className="text-white">{audit.totalWindForceOnPanelN} N</strong>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between py-1 border-b border-slate-800">
                      <span className="text-slate-400">Taux de travail en flexion du vitrage :</span>
                      <strong className={audit.bendingStressUtilizationPercent <= 100 ? 'text-emerald-400' : 'text-rose-400'}>
                        {audit.bendingStressUtilizationPercent} % de fg,d
                      </strong>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-800">
                      <span className="text-slate-400">Essai pendulaire corps mou :</span>
                      <strong className="text-white">{audit.impactEnergyJoules} Joules (Sac 50 kg)</strong>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-800">
                      <span className="text-slate-400">Nombre de chevilles de fixation :</span>
                      <strong className="text-white">{audit.anchorsCountPerPanel} fixations au sol</strong>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-800">
                      <span className="text-slate-400">Sécurité après bris (Post-rupture) :</span>
                      <strong className={audit.isPostBreakageSecure ? 'text-emerald-400' : 'text-rose-400'}>
                        {audit.isPostBreakageSecure ? 'Sécurisée (Panneau retenu)' : 'Critique (Effondrement)'}
                      </strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: SCHEMA 2D CAD SABOT & DALLE */}
          {activeTab === 'cad_diagram' && (
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-4">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-white">
                  Coupe Technique CAD du Sabot en Aluminium et Dalle Béton Armé
                </span>
                <span className="text-slate-400">
                  Hauteur : {panelHeightMm} mm | Épaisseur : {audit.effectiveGlassThicknessBendingMm} mm
                </span>
              </div>

              {/* Interactive SVG Diagram */}
              <div className="relative w-full h-72 bg-slate-900/90 rounded-lg border border-slate-800 flex items-center justify-center p-2 overflow-hidden">
                <svg viewBox="0 0 600 280" className="w-full h-full max-h-68">
                  {/* Background grid */}
                  <defs>
                    <pattern id="balustradeGrid" width="20" height="20" patternUnits="userSpaceOnUse">
                      <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#1e293b" strokeWidth="0.5" />
                    </pattern>
                  </defs>
                  <rect width="600" height="280" fill="url(#balustradeGrid)" />

                  {/* Concrete Slab (Dalle Béton Armé) */}
                  <rect x="60" y="190" width="480" height="80" fill="#334155" stroke="#475569" strokeWidth="1.5" />
                  <line x1="80" y1="190" x2="160" y2="270" stroke="#1e293b" strokeWidth="1" />
                  <line x1="140" y1="190" x2="220" y2="270" stroke="#1e293b" strokeWidth="1" />
                  <line x1="200" y1="190" x2="280" y2="270" stroke="#1e293b" strokeWidth="1" />
                  <line x1="260" y1="190" x2="340" y2="270" stroke="#1e293b" strokeWidth="1" />
                  <line x1="320" y1="190" x2="400" y2="270" stroke="#1e293b" strokeWidth="1" />
                  <text x="440" y="240" fill="#cbd5e1" fontSize="11" fontWeight="bold">
                    Dalle Béton Armé (C25/30)
                  </text>

                  {/* Aluminum Base Shoe Profile (Sabot profil U) */}
                  {/* Position centered around x=200 */}
                  <rect x="150" y="100" width="100" height="90" fill="#1e293b" stroke="#0ea5e9" strokeWidth="2" rx="3" />
                  {/* Inside groove of U shoe */}
                  <rect x="180" y="100" width="40" height="75" fill="#0f172a" stroke="#0284c7" strokeWidth="1" />

                  {/* Chemical Resin Anchor Bolt (Tige filetée scellée dans la dalle) */}
                  <rect x="160" y="140" width="12" height="110" fill="#94a3b8" stroke="#cbd5e1" strokeWidth="1" rx="2" />
                  <circle cx="166" cy="140" r="8" fill="#64748b" stroke="#e2e8f0" strokeWidth="1" />
                  {/* Pullout arrow on bolt */}
                  <line x1="166" y1="125" x2="166" y2="90" stroke="#f43f5e" strokeWidth="2" />
                  <polygon points="163,95 166,85 169,95" fill="#f43f5e" />
                  <text x="140" y="80" fill="#f43f5e" fontSize="9" fontWeight="bold">
                    T = {audit.tensilePulloutForcePerAnchorN} N
                  </text>

                  {/* Glass Panel extending upward from groove */}
                  {/* From y=105 upwards to y=20 */}
                  <rect x="190" y="20" width="20" height="155" fill="#38bdf8" stroke="#0284c7" strokeWidth="1.5" opacity="0.85" rx="1" />
                  {/* Interlayer line inside glass */}
                  <line x1="200" y1="20" x2="200" y2="175" stroke="#ffffff" strokeWidth="1.5" strokeDasharray="3 2" />

                  {/* Wedges & Gaskets in shoe (Cales de serrage excentriques) */}
                  <rect x="182" y="115" width="7" height="40" fill="#f59e0b" rx="1" />
                  <rect x="211" y="115" width="7" height="40" fill="#f59e0b" rx="1" />

                  {/* Handrail on top of glass */}
                  <rect x="185" y="12" width="30" height="14" fill="#64748b" stroke="#e2e8f0" strokeWidth="1.5" rx="2" />
                  <text x="225" y="22" fill="#cbd5e1" fontSize="9" fontWeight="bold">
                    Main Courante ({handrailType === 'cantilever_frameless_no_rail' ? 'Bord franc' : 'Profil U Inox'})
                  </text>

                  {/* Horizontal Crowd Force Arrow at Top */}
                  <line x1="70" y1="20" x2="175" y2="20" stroke="#10b981" strokeWidth="2.5" />
                  <polygon points="170,16 182,20 170,24" fill="#10b981" />
                  <text x="120" y="14" fill="#10b981" fontSize="10" fontWeight="bold" textAnchor="middle">
                    Poussée Foule qk = {audit.nominalCrowdLineLoadQkKnM} kN/m
                  </text>

                  {/* Dimension Height H */}
                  <line x1="310" y1="20" x2="310" y2="190" stroke="#f59e0b" strokeWidth="1.5" />
                  <polygon points="308,25 310,18 312,25" fill="#f59e0b" />
                  <polygon points="308,185 310,192 312,185" fill="#f59e0b" />
                  <text x="325" y="105" fill="#f59e0b" fontSize="10" fontWeight="bold">
                    H = {panelHeightMm} mm
                  </text>

                  {/* Embedment depth dimension */}
                  <line x1="270" y1="100" x2="270" y2="175" stroke="#38bdf8" strokeWidth="1.5" />
                  <polygon points="268,105 270,100 272,105" fill="#38bdf8" />
                  <polygon points="268,170 270,175 272,170" fill="#38bdf8" />
                  <text x="278" y="140" fill="#38bdf8" fontSize="8">
                    Encastrement {audit.effectiveShoeEmbedmentDepthMm} mm
                  </text>
                </svg>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-300">
                <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800">
                  <span className="text-teal-400 font-semibold block mb-1">
                    Système de Calage à Cales Excentriques
                  </span>
                  Le panneau de verre est inséré dans la gorge en U puis verrouillé par des cales en polyamide excentriques brevetées permettant d ajuster l aplomb et l alignement parfait des panneaux voisins avant serrage définitif.
                </div>
                <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800">
                  <span className="text-teal-400 font-semibold block mb-1">
                    Ancrage Chimique dans la Dalle
                  </span>
                  Le sabot transmet un moment de flexion élevé ({audit.overturningBaseMomentNm} N.m). Les chevilles doivent impérativement être scellées à la résine chimique dans la zone comprimée de la dalle avec une distance minimale au bord de 80 mm.
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: NORMES NF P 01-012 & SECURITE */}
          {activeTab === 'safety_standards' && (
            <div className="space-y-4">
              <div className="bg-slate-800/60 border border-slate-700/80 rounded-xl p-4 space-y-3">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-teal-400" />
                  Réglementation NF P 01-012 & NF P 01-013 (Garde-Corps de Sécurité)
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  En Algérie comme en Europe, la réglementation impose une hauteur minimale de 1.00 m pour tout garde-corps protégeant une dénivellation de plus de 1.00 m, portée à 1.10 m dès que la hauteur de chute possible dépasse 6.00 m.
                </p>

                <div className="space-y-2 pt-1 text-xs">
                  <div className="flex items-start gap-2 bg-slate-900/70 p-3 rounded-lg border border-slate-800">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-white block">Zone de Sécurité Enfants (0 à 45 cm) :</strong>
                      <span className="text-slate-300">
                        La zone inférieure située entre 0 et 45 cm du sol fini ne doit présenter aucun élément servant d échelle ou d appui précaire pour les enfants. Le verre plein autoportant remplit nativement cette exigence à 100%.
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2 bg-slate-900/70 p-3 rounded-lg border border-slate-800">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-white block">Intercalaire PVB vs SentryGlas SGP :</strong>
                      <span className="text-slate-300">
                        Sous le climat chaud algérien (températures estivales &gt; 40°C), l intercalaire ionoplaste SentryGlas conserve sa rigidité élastique (shear transfer 85%), tandis que le PVB standard s assouplit. En cas de bris d une feuille, le SentryGlas empêche tout basculement.
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2 bg-slate-900/70 p-3 rounded-lg border border-slate-800">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-white block">Interdiction Absolue du Verre Monolithique :</strong>
                      <span className="text-slate-300">
                        Le verre trempé monolithique simple (sans film feuilleté) est rigoureusement prohibé pour les garde-corps avec risque de chute, car sa rupture spontanée libère instantanément une baie sans aucune barrière de protection.
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
