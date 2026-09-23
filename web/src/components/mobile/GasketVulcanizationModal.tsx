import React, { useState, useMemo } from 'react';
import {
  X,
  FileCheck,
  Sliders,
  Layers,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Wind,
  Droplets,
  Volume2,
  Activity,
} from 'lucide-react';
import { playTactileClick, playSwitchSound, playSlideTick } from '../../utils/audioFeedback';
import {
  calculateGasketVulcanizationAudit,
  GASKET_MATERIAL_SPECS,
  CORNER_TECHNOLOGY_SPECS,
  GASKET_PROFILE_SPECS,
  type GasketMaterialType,
  type CornerTechnologyType,
  type GasketProfileRoleType,
  type WindowOpeningSystemType,
} from '../../utils/gasketVulcanizationManager';
import { generateGasketVulcanizationNoticePdf } from '../../utils/pdfGenerator';

interface GasketVulcanizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialWidth?: number;
  initialHeight?: number;
  projectReference?: string;
  wilayaName?: string;
  clientName?: string;
}

export const GasketVulcanizationModal: React.FC<GasketVulcanizationModalProps> = ({
  isOpen,
  onClose,
  initialWidth = 1200,
  initialHeight = 1400,
  projectReference = 'Audit Joints EPDM & Coins Soudés',
  wilayaName = '16 - Alger',
  clientName = 'Particulier',
}) => {
  const [activeTab, setActiveTab] = useState<'config' | 'compression_aev' | 'cad_view' | 'bom_dtu'>('config');

  // Input states
  const [windowWidthMm, setWindowWidthMm] = useState<number>(initialWidth);
  const [windowHeightMm, setWindowHeightMm] = useState<number>(initialHeight);
  const [sashCount, setSashCount] = useState<number>(2);
  const [openingSystem, setOpeningSystem] = useState<WindowOpeningSystemType>('casement_tilt_turn');
  const [materialType, setMaterialType] = useState<GasketMaterialType>('epdm_peroxide_cured');
  const [cornerTechnology, setCornerTechnology] = useState<CornerTechnologyType>('welded_prefabricated_corners');
  const [profileRole, setProfileRole] = useState<GasketProfileRoleType>('central_decompression_bulb');
  const [actualRebateGapMm, setActualRebateGapMm] = useState<number>(5.5);
  const [darkProfileExposureSummer, setDarkProfileExposureSummer] = useState<boolean>(true);
  const [lockingPointsCount, setLockingPointsCount] = useState<number>(4);

  const [cadCornerDisplayMode, setCadCornerDisplayMode] = useState<'welded_corner' | 'dry_cut_defect'>('welded_corner');
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  // Update actual rebate gap default when profile role changes
  const handleProfileRoleChange = (role: GasketProfileRoleType) => {
    playSwitchSound();
    setProfileRole(role);
    setActualRebateGapMm(GASKET_PROFILE_SPECS[role].standardRebateGapMm);
  };

  // Compute audit
  const audit = useMemo(() => {
    return calculateGasketVulcanizationAudit({
      windowWidthMm,
      windowHeightMm,
      sashCount,
      openingSystem,
      materialType,
      cornerTechnology,
      profileRole,
      actualRebateGapMm,
      lockingPointsCount,
      darkProfileExposureSummer,
    });
  }, [
    windowWidthMm,
    windowHeightMm,
    sashCount,
    openingSystem,
    materialType,
    cornerTechnology,
    profileRole,
    actualRebateGapMm,
    lockingPointsCount,
    darkProfileExposureSummer,
  ]);

  if (!isOpen) return null;

  const currentMat = GASKET_MATERIAL_SPECS[materialType];
  const currentCorner = CORNER_TECHNOLOGY_SPECS[cornerTechnology];
  const currentProfile = GASKET_PROFILE_SPECS[profileRole];

  const handleExportPdf = async () => {
    try {
      setIsGeneratingPdf(true);
      playTactileClick();
      const docId = `VULC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
      await generateGasketVulcanizationNoticePdf({
        documentId: docId,
        projectRef: projectReference,
        clientName,
        wilaya: wilayaName,
        auditInput: {
          windowWidthMm,
          windowHeightMm,
          sashCount,
          openingSystem,
          materialType,
          cornerTechnology,
          profileRole,
          actualRebateGapMm,
          lockingPointsCount,
          darkProfileExposureSummer,
        },
        auditResult: audit,
      });
    } catch (err) {
      console.error('Erreur génération attestation joints:', err);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-sm p-2 sm:p-4 overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden text-slate-900 dark:text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-600/10 text-cyan-600 dark:text-cyan-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                Vulcanisation des Joints & Étanchéité AEV
                <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-cyan-100 dark:bg-cyan-900/40 text-cyan-800 dark:text-cyan-300">
                  NF DTU 36.5
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Angles soudés, écrasement élastomère et perméabilité à l air (NF EN 12365 / CSTB 3698)
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              playTactileClick();
              onClose();
            }}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-100/60 dark:bg-slate-950 px-3 pt-2 gap-1 overflow-x-auto">
          <button
            onClick={() => {
              playSwitchSound();
              setActiveTab('config');
            }}
            className={`flex items-center gap-2 px-3.5 py-2.5 text-xs font-semibold rounded-t-lg transition min-h-[44px] whitespace-nowrap ${
              activeTab === 'config'
                ? 'bg-white dark:bg-slate-900 text-cyan-600 dark:text-cyan-400 border-t-2 border-cyan-500 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Sliders className="w-4 h-4" />
            Géométrie & Angles
          </button>

          <button
            onClick={() => {
              playSwitchSound();
              setActiveTab('compression_aev');
            }}
            className={`flex items-center gap-2 px-3.5 py-2.5 text-xs font-semibold rounded-t-lg transition min-h-[44px] whitespace-nowrap ${
              activeTab === 'compression_aev'
                ? 'bg-white dark:bg-slate-900 text-cyan-600 dark:text-cyan-400 border-t-2 border-cyan-500 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Activity className="w-4 h-4" />
            Compression & AEV
          </button>

          <button
            onClick={() => {
              playSwitchSound();
              setActiveTab('cad_view');
            }}
            className={`flex items-center gap-2 px-3.5 py-2.5 text-xs font-semibold rounded-t-lg transition min-h-[44px] whitespace-nowrap ${
              activeTab === 'cad_view'
                ? 'bg-white dark:bg-slate-900 text-cyan-600 dark:text-cyan-400 border-t-2 border-cyan-500 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Layers className="w-4 h-4" />
            Dessin CAD 2D
          </button>

          <button
            onClick={() => {
              playSwitchSound();
              setActiveTab('bom_dtu');
            }}
            className={`flex items-center gap-2 px-3.5 py-2.5 text-xs font-semibold rounded-t-lg transition min-h-[44px] whitespace-nowrap ${
              activeTab === 'bom_dtu'
                ? 'bg-white dark:bg-slate-900 text-cyan-600 dark:text-cyan-400 border-t-2 border-cyan-500 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <FileCheck className="w-4 h-4" />
            Nomenclature & PDF
          </button>
        </div>

        {/* Tab Contents */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-5">
          {/* TAB 1: CONFIGURATION */}
          {activeTab === 'config' && (
            <div className="space-y-5">
              {/* Presets */}
              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-800">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-2">
                  Préréglages d Atelier Rapides :
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    onClick={() => {
                      playTactileClick();
                      setWindowWidthMm(1200);
                      setWindowHeightMm(1400);
                      setSashCount(2);
                      setOpeningSystem('casement_tilt_turn');
                    }}
                    className="p-2 text-left bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg hover:border-cyan-500 transition min-h-[44px]"
                  >
                    <span className="text-xs font-bold block text-slate-800 dark:text-slate-200">Fenêtre 1200x1400</span>
                    <span className="text-[10px] text-slate-500">2V Oscillo-battant</span>
                  </button>
                  <button
                    onClick={() => {
                      playTactileClick();
                      setWindowWidthMm(1400);
                      setWindowHeightMm(2150);
                      setSashCount(2);
                      setOpeningSystem('casement_side_hung');
                    }}
                    className="p-2 text-left bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg hover:border-cyan-500 transition min-h-[44px]"
                  >
                    <span className="text-xs font-bold block text-slate-800 dark:text-slate-200">Porte-Fenêtre 1400x2150</span>
                    <span className="text-[10px] text-slate-500">2V Frappe lourde</span>
                  </button>
                  <button
                    onClick={() => {
                      playTactileClick();
                      setWindowWidthMm(2400);
                      setWindowHeightMm(2200);
                      setSashCount(2);
                      setOpeningSystem('sliding_door');
                    }}
                    className="p-2 text-left bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg hover:border-cyan-500 transition min-h-[44px]"
                  >
                    <span className="text-xs font-bold block text-slate-800 dark:text-slate-200">Baie Coulissante 2.4m</span>
                    <span className="text-[10px] text-slate-500">2V Joint tubulaire</span>
                  </button>
                  <button
                    onClick={() => {
                      playTactileClick();
                      setWindowWidthMm(900);
                      setWindowHeightMm(600);
                      setSashCount(1);
                      setOpeningSystem('projected_top_hung');
                    }}
                    className="p-2 text-left bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg hover:border-cyan-500 transition min-h-[44px]"
                  >
                    <span className="text-xs font-bold block text-slate-800 dark:text-slate-200">Soufflet 900x600</span>
                    <span className="text-[10px] text-slate-500">1V Sanitaire/Cave</span>
                  </button>
                </div>
              </div>

              {/* Geometry Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Largeur Ouvrage (mm)
                  </label>
                  <input
                    type="number"
                    value={windowWidthMm}
                    onChange={(e) => {
                      playSlideTick();
                      setWindowWidthMm(Math.max(400, Number(e.target.value)));
                    }}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-sm font-semibold min-h-[44px]"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Hauteur Ouvrage (mm)
                  </label>
                  <input
                    type="number"
                    value={windowHeightMm}
                    onChange={(e) => {
                      playSlideTick();
                      setWindowHeightMm(Math.max(400, Number(e.target.value)));
                    }}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-sm font-semibold min-h-[44px]"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Nombre de Vantaux
                  </label>
                  <select
                    value={sashCount}
                    onChange={(e) => {
                      playSwitchSound();
                      setSashCount(Number(e.target.value));
                    }}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-sm font-semibold min-h-[44px]"
                  >
                    <option value={1}>1 Vantail</option>
                    <option value={2}>2 Vantaux (Battement central)</option>
                    <option value={3}>3 Vantaux</option>
                    <option value={4}>4 Vantaux</option>
                  </select>
                </div>
              </div>

              {/* System & Gasket Role */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Rôle Fonctionnel du Joint
                  </label>
                  <select
                    value={profileRole}
                    onChange={(e) => handleProfileRoleChange(e.target.value as GasketProfileRoleType)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-sm font-semibold min-h-[44px]"
                  >
                    {Object.values(GASKET_PROFILE_SPECS).map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.labelFr}
                      </option>
                    ))}
                  </select>
                  <p className="text-[11px] text-slate-500 mt-1">{currentProfile.description}</p>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Jeu de Feuillure Effectif (mm)
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min={2.0}
                      max={10.0}
                      step={0.1}
                      value={actualRebateGapMm}
                      onChange={(e) => {
                        playSlideTick();
                        setActualRebateGapMm(Number(e.target.value));
                      }}
                      className="flex-1 accent-cyan-500 cursor-pointer min-h-[44px]"
                    />
                    <span className="w-14 text-right text-sm font-bold text-cyan-600 dark:text-cyan-400">
                      {actualRebateGapMm} mm
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400">
                    Hauteur nominale H0 : {currentProfile.nominalUncompressedHeightMm} mm
                  </span>
                </div>
              </div>

              {/* Technology & Material */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Technologie d Assemblage d Angle
                  </label>
                  <select
                    value={cornerTechnology}
                    onChange={(e) => {
                      playSwitchSound();
                      setCornerTechnology(e.target.value as CornerTechnologyType);
                    }}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-sm font-semibold min-h-[44px]"
                  >
                    {Object.values(CORNER_TECHNOLOGY_SPECS).map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.labelFr} ({c.dtuCompliance})
                      </option>
                    ))}
                  </select>
                  <div className="mt-1 p-2 rounded-lg bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-[11px]">
                    <span className="font-semibold block text-slate-700 dark:text-slate-300">
                      {currentCorner.assemblyToolingFr}
                    </span>
                    <span className="text-slate-500">{currentCorner.description}</span>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Matériau Élastomère
                  </label>
                  <select
                    value={materialType}
                    onChange={(e) => {
                      playSwitchSound();
                      setMaterialType(e.target.value as GasketMaterialType);
                    }}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-sm font-semibold min-h-[44px]"
                  >
                    {Object.values(GASKET_MATERIAL_SPECS).map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.labelFr}
                      </option>
                    ))}
                  </select>
                  <div className="mt-1 p-2 rounded-lg bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-[11px]">
                    <div className="flex justify-between text-slate-600 dark:text-slate-300 mb-0.5">
                      <span>Dureté : {currentMat.hardnessShoreA} Shore A</span>
                      <span>Reprise CS : {currentMat.compressionSetPercentage}%</span>
                    </div>
                    <span className="text-slate-500">{currentMat.description}</span>
                  </div>
                </div>
              </div>

              {/* Thermal Exposure & Locking Points */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-3 bg-cyan-500/5 rounded-xl border border-cyan-500/20">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                      Profilé Foncé en Plein Soleil Été (75°C)
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">
                      Vérifie le retrait thermique d angle (gradient saharien)
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      playTactileClick();
                      setDarkProfileExposureSummer(!darkProfileExposureSummer);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition min-h-[44px] ${
                      darkProfileExposureSummer
                        ? 'bg-rose-500 text-white shadow-sm'
                        : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {darkProfileExposureSummer ? 'Actif (+65°C)' : 'Inactif (+38°C)'}
                  </button>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      Points de Verrouillage Crémone
                    </span>
                    <span className="text-xs font-bold text-cyan-600 dark:text-cyan-400">
                      {lockingPointsCount} galets
                    </span>
                  </div>
                  <input
                    type="range"
                    min={2}
                    max={8}
                    step={1}
                    value={lockingPointsCount}
                    onChange={(e) => {
                      playSlideTick();
                      setLockingPointsCount(Number(e.target.value));
                    }}
                    className="w-full accent-cyan-500 cursor-pointer min-h-[44px]"
                  />
                  <span className="text-[10px] text-slate-400">
                    Répartit l effort de compression sur les gâches du dormant
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: COMPRESSION & AEV */}
          {activeTab === 'compression_aev' && (
            <div className="space-y-5">
              {/* Compliance Banner */}
              <div
                className={`p-4 rounded-xl border flex items-center justify-between ${
                  audit.dtuComplianceStatus === 'Conforme Certifie'
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-800 dark:text-emerald-300'
                    : audit.dtuComplianceStatus === 'Conforme Standard'
                    ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-800 dark:text-cyan-300'
                    : audit.dtuComplianceStatus === 'Tolere avec Reserve'
                    ? 'bg-amber-500/10 border-amber-500/30 text-amber-800 dark:text-amber-300'
                    : 'bg-rose-500/10 border-rose-500/30 text-rose-800 dark:text-rose-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  {audit.dtuComplianceStatus === 'Conforme Certifie' || audit.dtuComplianceStatus === 'Conforme Standard' ? (
                    <CheckCircle2 className="w-6 h-6 shrink-0" />
                  ) : (
                    <AlertTriangle className="w-6 h-6 shrink-0" />
                  )}
                  <div>
                    <span className="text-xs font-extrabold uppercase tracking-wider block">
                      Statut NF DTU 36.5 P1-1
                    </span>
                    <span className="text-base font-bold">{audit.dtuComplianceStatus}</span>
                  </div>
                </div>
                <span className="text-xs px-3 py-1 rounded-full font-bold bg-white/60 dark:bg-slate-900/60 shadow-sm">
                  {currentCorner.labelFr}
                </span>
              </div>

              {/* Compression Ratio Gauge */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Taux d Écrasement Élastique du Joint (CR)
                  </span>
                  <span
                    className={`text-sm font-extrabold px-2 py-0.5 rounded ${
                      audit.compressionStatus === 'optimal'
                        ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300'
                        : audit.compressionStatus === 'undercompressed'
                        ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300'
                        : 'bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300'
                    }`}
                  >
                    {audit.compressionRatioPercent}% ({audit.compressionStatus})
                  </span>
                </div>

                {/* Progress bar with zones */}
                <div className="relative w-full h-4 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden mb-2">
                  <div
                    className={`h-full transition-all duration-300 ${
                      audit.compressionStatus === 'optimal'
                        ? 'bg-emerald-500'
                        : audit.compressionStatus === 'undercompressed'
                        ? 'bg-amber-500'
                        : 'bg-rose-500'
                    }`}
                    style={{ width: `${Math.min(100, (audit.compressionRatioPercent / 60) * 100)}%` }}
                  />
                  {/* Marker lines for target zone */}
                  <div
                    className="absolute top-0 bottom-0 border-l-2 border-emerald-700/60"
                    style={{ left: `${(currentProfile.idealCompressionRange.minPercent / 60) * 100}%` }}
                    title={`Min ${currentProfile.idealCompressionRange.minPercent}%`}
                  />
                  <div
                    className="absolute top-0 bottom-0 border-r-2 border-emerald-700/60"
                    style={{ left: `${(currentProfile.idealCompressionRange.maxPercent / 60) * 100}%` }}
                    title={`Max ${currentProfile.idealCompressionRange.maxPercent}%`}
                  />
                </div>

                <div className="flex justify-between text-[11px] text-slate-500 dark:text-slate-400">
                  <span>Sous-compression (&lt;{currentProfile.idealCompressionRange.minPercent}%)</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                    Plage Idéale CSTB ({currentProfile.idealCompressionRange.minPercent}% à {currentProfile.idealCompressionRange.maxPercent}%)
                  </span>
                  <span>Surcompression (&gt;{currentProfile.idealCompressionRange.maxPercent}%)</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3 pt-3 border-t border-slate-200 dark:border-slate-700 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Hauteur Libre H0</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{audit.nominalHeightMm} mm</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Jeu sous Pression</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{audit.actualGapMm} mm</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Course d Écrasement</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{audit.effectiveCompressionDepthMm} mm</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Effort Linéaire Fc</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{audit.linearCompressionForceNm} N/m</span>
                  </div>
                </div>
              </div>

              {/* 4 AEV Performance Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center gap-2 mb-2 text-cyan-600 dark:text-cyan-400">
                    <Wind className="w-4 h-4" />
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      Perméabilité à l Air NF EN 12207
                    </span>
                  </div>
                  <div className="flex items-baseline justify-between mb-1">
                    <span className="text-2xl font-black text-cyan-600 dark:text-cyan-400">
                      Classe {audit.airTightnessClass}
                    </span>
                    <span className="text-xs font-semibold text-slate-500">
                      {audit.resultingAirInfiltrationRateM3Hm} m³/(h·m)
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    À 100 Pa de dépression. La classe A*4 garantit une étanchéité passive sans sifflement d air.
                  </p>
                </div>

                <div className="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center gap-2 mb-2 text-blue-600 dark:text-blue-400">
                    <Droplets className="w-4 h-4" />
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      Étanchéité à l Eau NF EN 12208
                    </span>
                  </div>
                  <div className="flex items-baseline justify-between mb-1">
                    <span className="text-2xl font-black text-blue-600 dark:text-blue-400">
                      Classe {audit.watertightnessClass}
                    </span>
                    <span className="text-xs font-semibold text-slate-500">
                      {audit.watertightnessClass === 'E1200' ? '1200 Pa Cyclonique' : 'Pression certifiée'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Résistance au ruissellement sous pluie battante et rafales de vent méditerranéennes.
                  </p>
                </div>

                <div className="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center gap-2 mb-2 text-emerald-600 dark:text-emerald-400">
                    <Activity className="w-4 h-4" />
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      Couple de Manœuvre Poignée
                    </span>
                  </div>
                  <div className="flex items-baseline justify-between mb-1">
                    <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                      {audit.handleOperatingTorqueNm} N·m
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        audit.pmrForceCompliant
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300'
                          : 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300'
                      }`}
                    >
                      {audit.pmrForceCompliant ? 'Conforme PMR' : 'Dureté PMR'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Décret Exécutif 06-455 (PMR) : seuil de confort ergonomique fixé à 5.0 N·m maximum.
                  </p>
                </div>

                <div className="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center gap-2 mb-2 text-purple-600 dark:text-purple-400">
                    <Volume2 className="w-4 h-4" />
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      Atténuation Acoustique & Durabilité
                    </span>
                  </div>
                  <div className="flex items-baseline justify-between mb-1">
                    <span className="text-2xl font-black text-purple-600 dark:text-purple-400">
                      +{audit.acousticFlankingReductionDba} dBA
                    </span>
                    <span className="text-xs font-semibold text-slate-500">
                      Durabilité : ~{audit.estimatedElasticLifespanYears} ans
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Gain acoustique contre les transmissions latérales et reprise élastique après 1000h à chaud.
                  </p>
                </div>
              </div>

              {/* Warnings List */}
              {audit.auditWarnings.length > 0 && (
                <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl">
                  <span className="text-xs font-bold text-amber-700 dark:text-amber-300 flex items-center gap-1.5 mb-1.5">
                    <AlertTriangle className="w-4 h-4" />
                    Alertes & Réserves Techniques :
                  </span>
                  <ul className="text-xs text-amber-900 dark:text-amber-200 space-y-1">
                    {audit.auditWarnings.map((w, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="text-amber-500">•</span>
                        <span>{w}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: DESSIN CAD 2D */}
          {activeTab === 'cad_view' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                    Coupe Technique CAD 2D & Simulation d Angle
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Chambre de décompression CSTB 3698 et détail d angle EPDM
                  </span>
                </div>
                <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
                  <button
                    onClick={() => {
                      playTactileClick();
                      setCadCornerDisplayMode('welded_corner');
                    }}
                    className={`px-3 py-1 rounded text-xs font-bold transition min-h-[38px] ${
                      cadCornerDisplayMode === 'welded_corner'
                        ? 'bg-cyan-500 text-white shadow-sm'
                        : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    Angle Soudé Conforme
                  </button>
                  <button
                    onClick={() => {
                      playTactileClick();
                      setCadCornerDisplayMode('dry_cut_defect');
                    }}
                    className={`px-3 py-1 rounded text-xs font-bold transition min-h-[38px] ${
                      cadCornerDisplayMode === 'dry_cut_defect'
                        ? 'bg-rose-500 text-white shadow-sm'
                        : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    Angle Coupé Défectueux
                  </button>
                </div>
              </div>

              {/* Dynamic 2D CAD SVG */}
              <div className="w-full bg-slate-950 rounded-2xl border border-slate-800 p-4 overflow-hidden relative shadow-inner">
                <svg
                  viewBox="0 0 650 360"
                  className="w-full h-auto max-h-[380px] select-none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <defs>
                    {/* Aluminum Hatch Pattern */}
                    <pattern id="cadHatch" width="8" height="8" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
                      <line x1="0" y1="0" x2="0" y2="8" stroke="#334155" strokeWidth="1" />
                    </pattern>
                    {/* Thermal Break Polyamide Pattern */}
                    <pattern id="polyamideHatch" width="6" height="6" patternTransform="rotate(-45 0 0)" patternUnits="userSpaceOnUse">
                      <line x1="0" y1="0" x2="0" y2="6" stroke="#0284c7" strokeWidth="1.2" />
                    </pattern>
                  </defs>

                  {/* Blueprint Grid */}
                  <g opacity="0.15">
                    {Array.from({ length: 14 }).map((_, i) => (
                      <line key={`v-${i}`} x1={i * 50} y1="0" x2={i * 50} y2="360" stroke="#0ea5e9" strokeWidth="0.5" />
                    ))}
                    {Array.from({ length: 8 }).map((_, i) => (
                      <line key={`h-${i}`} x1="0" y1={i * 50} x2="650" y2={i * 50} stroke="#0ea5e9" strokeWidth="0.5" />
                    ))}
                  </g>

                  {/* LEFT REGION: CROSS-SECTION PROFILE */}
                  {/* Outer Frame Profile (Dormant) */}
                  <rect x="50" y="50" width="130" height="240" fill="#1e293b" stroke="#64748b" strokeWidth="1.5" />
                  <rect x="50" y="50" width="130" height="240" fill="url(#cadHatch)" />

                  {/* Polyamide Thermal Break Bars on Dormant */}
                  <rect x="95" y="110" width="40" height="18" fill="#0369a1" stroke="#38bdf8" strokeWidth="1.2" />
                  <rect x="95" y="110" width="40" height="18" fill="url(#polyamideHatch)" />
                  <rect x="95" y="190" width="40" height="18" fill="#0369a1" stroke="#38bdf8" strokeWidth="1.2" />
                  <rect x="95" y="190" width="40" height="18" fill="url(#polyamideHatch)" />

                  {/* Sash Profile (Ouvrant) */}
                  <rect x="230" y="70" width="110" height="200" fill="#1e293b" stroke="#64748b" strokeWidth="1.5" />
                  <rect x="230" y="70" width="110" height="200" fill="url(#cadHatch)" />

                  {/* Polyamide on Sash */}
                  <rect x="260" y="120" width="35" height="16" fill="#0369a1" stroke="#38bdf8" strokeWidth="1.2" />
                  <rect x="260" y="180" width="35" height="16" fill="#0369a1" stroke="#38bdf8" strokeWidth="1.2" />

                  {/* Decompression Chamber Zone (Chambre de décompression) */}
                  <rect x="180" y="90" width="50" height="160" fill="rgba(14, 165, 233, 0.05)" stroke="#0284c7" strokeDasharray="3,3" />

                  {/* Outer Lip Gasket (Joint de frappe) */}
                  <path d="M 180 75 Q 195 82 230 80" fill="none" stroke="#06b6d4" strokeWidth="3.5" strokeLinecap="round" />

                  {/* Central Decompression Gasket (Joint central tubulaire EPDM) */}
                  {/* Base clamped on sash, bulb compressed against dormant polyamide */}
                  <path
                    d="M 230 150 L 215 150 C 200 145 190 155 180 155 C 190 165 200 170 215 168 L 230 168 Z"
                    fill={audit.compressionStatus === 'optimal' ? '#06b6d4' : audit.compressionStatus === 'undercompressed' ? '#f59e0b' : '#f43f5e'}
                    stroke="#22d3ee"
                    strokeWidth="1.5"
                  />
                  {/* Tubular hollow hole in gasket */}
                  <circle cx="206" cy="158" r="5" fill="#020617" stroke="#22d3ee" strokeWidth="1" />

                  {/* Water Weep Drainage Arrow in bottom */}
                  <path d="M 180 270 L 140 270 L 140 295 L 110 295" fill="none" stroke="#38bdf8" strokeWidth="2" strokeDasharray="4,2" />
                  <polygon points="106,295 114,291 114,299" fill="#38bdf8" />

                  {/* Dimension Annotations */}
                  <line x1="180" y1="40" x2="230" y2="40" stroke="#94a3b8" strokeWidth="1" />
                  <line x1="180" y1="36" x2="180" y2="44" stroke="#94a3b8" strokeWidth="1" />
                  <line x1="230" y1="36" x2="230" y2="44" stroke="#94a3b8" strokeWidth="1" />
                  <text x="205" y="32" fill="#94a3b8" fontSize="10" textAnchor="middle" fontWeight="bold">
                    Jeu : {audit.actualGapMm} mm
                  </text>

                  {/* Labels on Cross-Section */}
                  <text x="115" y="75" fill="#e2e8f0" fontSize="10" fontWeight="bold" textAnchor="middle">
                    Dormant RPT
                  </text>
                  <text x="285" y="95" fill="#e2e8f0" fontSize="10" fontWeight="bold" textAnchor="middle">
                    Ouvrant
                  </text>
                  <text x="205" y="210" fill="#38bdf8" fontSize="9" textAnchor="middle">
                    Chambre de
                  </text>
                  <text x="205" y="222" fill="#38bdf8" fontSize="9" textAnchor="middle">
                    décompression
                  </text>

                  {/* RIGHT REGION: 90° CORNER DETAIL SIMULATION */}
                  <rect x="380" y="45" width="240" height="280" rx="12" fill="#0f172a" stroke="#334155" strokeWidth="1.5" />
                  <text x="500" y="70" fill="#f8fafc" fontSize="12" fontWeight="bold" textAnchor="middle">
                    DÉTAIL D ANGLE 90°
                  </text>

                  {cadCornerDisplayMode === 'welded_corner' ? (
                    <g>
                      {/* Molded Corner Block (Angle Moulé Vulcanisé) */}
                      <path
                        d="M 430 120 L 530 120 C 545 120 560 135 560 150 L 560 260 L 535 260 L 535 155 C 535 150 530 145 525 145 L 430 145 Z"
                        fill="#0891b2"
                        stroke="#22d3ee"
                        strokeWidth="2"
                      />
                      {/* Connection weld lines */}
                      <line x1="465" y1="120" x2="465" y2="145" stroke="#a5f3fc" strokeWidth="2" strokeDasharray="2,2" />
                      <line x1="535" y1="225" x2="560" y2="225" stroke="#a5f3fc" strokeWidth="2" strokeDasharray="2,2" />

                      {/* Continuous Gasket Bulb highlight */}
                      <circle cx="535" cy="145" r="14" fill="rgba(34, 211, 238, 0.2)" stroke="#22d3ee" strokeWidth="1.5" />

                      {/* Green Status Callout */}
                      <rect x="410" y="275" width="180" height="34" rx="6" fill="rgba(16, 185, 129, 0.15)" stroke="#10b981" />
                      <text x="500" y="291" fill="#34d399" fontSize="10" fontWeight="bold" textAnchor="middle">
                        CONTINUITÉ MOLÉCULAIRE 100%
                      </text>
                      <text x="500" y="303" fill="#a7f3d0" fontSize="8.5" textAnchor="middle">
                        Conforme DTU 36.5 • Zéro Infiltration Eau
                      </text>
                    </g>
                  ) : (
                    <g>
                      {/* Defective Dry Butt Cut with Retraction Gap */}
                      <path d="M 430 120 L 515 120 L 515 145 L 430 145 Z" fill="#475569" stroke="#94a3b8" strokeWidth="1.5" />
                      <path d="M 540 155 L 565 155 L 565 260 L 540 260 Z" fill="#475569" stroke="#94a3b8" strokeWidth="1.5" />

                      {/* Gap at Corner */}
                      <rect x="515" y="120" width="25" height="35" fill="rgba(244, 63, 94, 0.25)" stroke="#f43f5e" strokeDasharray="3,2" />
                      <text x="528" y="142" fill="#fb7185" fontSize="10" fontWeight="bold" textAnchor="middle">
                        ΔL {audit.summerCornerThermalShrinkageMm || 2.1}mm
                      </text>

                      {/* Leaking Water Droplets */}
                      <circle cx="528" cy="165" r="3.5" fill="#38bdf8" />
                      <circle cx="532" cy="180" r="3" fill="#38bdf8" />
                      <circle cx="526" cy="195" r="2.5" fill="#38bdf8" />

                      {/* Whistling Air Streamlines */}
                      <path d="M 505 130 Q 528 135 550 125" fill="none" stroke="#fbbf24" strokeWidth="1.5" strokeDasharray="3,2" />
                      <path d="M 505 138 Q 528 143 550 133" fill="none" stroke="#fbbf24" strokeWidth="1.5" strokeDasharray="3,2" />

                      {/* Red Warning Callout */}
                      <rect x="410" y="275" width="180" height="34" rx="6" fill="rgba(244, 63, 94, 0.2)" stroke="#f43f5e" />
                      <text x="500" y="291" fill="#f87171" fontSize="10" fontWeight="bold" textAnchor="middle">
                        FUITE D EAU & SIFFLEMENT D AIR
                      </text>
                      <text x="500" y="303" fill="#fca5a5" fontSize="8.5" textAnchor="middle">
                        Retrait thermique EPDM • Interdit DTU 36.5
                      </text>
                    </g>
                  )}
                </svg>
              </div>

              {/* Legend & Mechanics */}
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 space-y-1">
                <span className="font-bold text-slate-800 dark:text-slate-200 block">
                  Principe de Décompression & Continuité d Angle :
                </span>
                <p>
                  1. La chambre de décompression équilibre la pression atmosphérique extérieure avec la feuillure, drainant les eaux d infiltration par le bas.
                </p>
                <p>
                  2. Le joint central tubulaire assure l étanchéité définitive. La soudure des 4 angles empêche le retrait thermique de créer une ouverture d angle sous soleil estival.
                </p>
              </div>
            </div>
          )}

          {/* TAB 4: NOMENCLATURE & PDF */}
          {activeTab === 'bom_dtu' && (
            <div className="space-y-5">
              {/* BOM Table */}
              <div>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block mb-2">
                  Nomenclature & Quincaillerie d Assemblage d Atelier
                </span>
                <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-700">
                      <tr>
                        <th className="p-3">Composant</th>
                        <th className="p-3">Désignation</th>
                        <th className="p-3">Quantité</th>
                        <th className="p-3">Spécifications</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                      <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className="p-3 font-semibold text-slate-900 dark:text-white">Joint Linéaire Extrudé</td>
                        <td className="p-3">{currentMat.labelFr}</td>
                        <td className="p-3 font-bold text-cyan-600 dark:text-cyan-400">
                          {audit.totalGasketLengthM} m
                        </td>
                        <td className="p-3 text-[11px] text-slate-500">
                          Profil {currentProfile.labelFr.slice(0, 24)} (inclus réserve +4%)
                        </td>
                      </tr>
                      <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className="p-3 font-semibold text-slate-900 dark:text-white">Angles Préfabriqués 90°</td>
                        <td className="p-3">{currentCorner.labelFr}</td>
                        <td className="p-3 font-bold text-cyan-600 dark:text-cyan-400">
                          {audit.billOfMaterials.moldedCornersCount} pièces
                        </td>
                        <td className="p-3 text-[11px] text-slate-500">
                          {currentCorner.dtuCompliance === 'Conforme Certifie'
                            ? 'Moulés d usine sur cadre'
                            : currentCorner.dtuCompliance === 'Conforme Standard'
                            ? 'Coins injectés à coller'
                            : 'Non requis (déconseillé)'}
                        </td>
                      </tr>
                      <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className="p-3 font-semibold text-slate-900 dark:text-white">Colle de Vulcanisation</td>
                        <td className="p-3">Cyanoacrylate spéciale EPDM + activateur</td>
                        <td className="p-3 font-bold text-cyan-600 dark:text-cyan-400">
                          {audit.billOfMaterials.adhesiveTubesRequired} tube(s)
                        </td>
                        <td className="p-3 text-[11px] text-slate-500">
                          Prise instantanée 5s • Résistance au cisaillement
                        </td>
                      </tr>
                      <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className="p-3 font-semibold text-slate-900 dark:text-white">Temps d Assemblage Atelier</td>
                        <td className="p-3">Pose, encollage d angles et contrôle écrasement</td>
                        <td className="p-3 font-bold text-emerald-600 dark:text-emerald-400">
                          {audit.billOfMaterials.assemblyTimeMinutes} minutes
                        </td>
                        <td className="p-3 text-[11px] text-slate-500">
                          Pour l ensemble des {sashCount} vantaux
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Recommendations list */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block mb-2">
                  Prescriptions Techniques de Chantier (NF DTU 36.5 P1-1) :
                </span>
                <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-1.5">
                  {audit.auditRecommendations.map((reco, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-cyan-500 shrink-0 mt-0.5" />
                      <span>{reco}</span>
                    </li>
                  ))}
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-cyan-500 shrink-0 mt-0.5" />
                    <span>
                      Ne jamais tirer sur le joint élastomère pendant l insertion dans la gorge aluminium (risque d allongement résiduel et retrait ultérieur).
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-cyan-500 shrink-0 mt-0.5" />
                    <span>
                      Vérifier que les trous d évacuation d eau de la traverse basse restent libres de tout résidu de joint ou colle.
                    </span>
                  </li>
                </ul>
              </div>

              {/* PDF Action Button */}
              <button
                onClick={handleExportPdf}
                disabled={isGeneratingPdf}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-cyan-600 to-blue-700 hover:from-cyan-700 hover:to-blue-800 text-white font-bold rounded-xl shadow-lg shadow-cyan-500/20 transition min-h-[48px] disabled:opacity-50"
              >
                <FileCheck className="w-5 h-5" />
                <span>
                  {isGeneratingPdf ? 'Génération de l Attestation en cours...' : 'Télécharger l Attestation Technique AEV (PDF)'}
                </span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
