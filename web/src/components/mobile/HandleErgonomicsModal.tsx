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
  Hand,
  Gauge,
  UserCheck,
} from 'lucide-react';
import { playTactileClick, playSwitchSound } from '../../utils/audioFeedback';
import {
  type HandleType,
  type TransmissionType,
  type CamType,
  type OperatingForceClass,
  HANDLE_SPECS,
  computeHandleErgonomicsAudit,
} from '../../utils/handleErgonomicsManager';
import { generateHandleErgonomicsNoticePdf } from '../../utils/pdfGenerator';

interface HandleErgonomicsModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialWidth?: number;
  initialHeight?: number;
  windowReference?: string;
  wilayaName?: string;
  clientName?: string;
}

export const HandleErgonomicsModal: React.FC<HandleErgonomicsModalProps> = ({
  isOpen,
  onClose,
  initialWidth = 1200,
  initialHeight = 1400,
  windowReference = 'Châssis Battant 1 Vantail',
  wilayaName = 'Alger',
  clientName = 'Chantier Client',
}) => {
  const [activeTab, setActiveTab] = useState<'config' | 'forces' | 'cad_diagram' | 'pmr_standards'>('config');

  // Interactive Inputs
  const [sashWidthMm, setSashWidthMm] = useState<number>(initialWidth);
  const [sashHeightMm, setSashHeightMm] = useState<number>(initialHeight);
  const [handleType, setHandleType] = useState<HandleType>('ergonomic_extended_175');
  const [transmissionType, setTransmissionType] = useState<TransmissionType>('reduction_geared');
  const [camType, setCamType] = useState<CamType>('rotating_roller_cam');
  const [lockingPointCount, setLockingPointCount] = useState<number>(4);
  const [targetClass, setTargetClass] = useState<OperatingForceClass>('class_2_pmr');
  const [handleHeightFromFloorMm, setHandleHeightFromFloorMm] = useState<number>(1050);
  const [gasketType, setGasketType] = useState<'standard_epdm' | 'soft_sponge_epdm' | 'acoustic_double'>('standard_epdm');
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  // Compute Audit
  const audit = useMemo(() => {
    return computeHandleErgonomicsAudit({
      sashWidthMm,
      sashHeightMm,
      handleType,
      transmissionType,
      camType,
      lockingPointCount,
      targetClass,
      handleHeightFromFloorMm,
      gasketType,
      wilayaName,
      clientName,
      windowReference,
    });
  }, [
    sashWidthMm,
    sashHeightMm,
    handleType,
    transmissionType,
    camType,
    lockingPointCount,
    targetClass,
    handleHeightFromFloorMm,
    gasketType,
    wilayaName,
    clientName,
    windowReference,
  ]);

  if (!isOpen) return null;

  const handleDownloadPdf = async () => {
    playTactileClick();
    setIsGeneratingPdf(true);
    try {
      const docId = `ERG-${Date.now().toString().slice(-6)}`;
      await generateHandleErgonomicsNoticePdf({
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
      <div className="bg-slate-900 border border-slate-700 w-full max-w-4xl rounded-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-sky-500/10 border border-sky-500/20 rounded-xl text-sky-400">
              <Hand className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                Audit Ergonomie & Forces de Manœuvre
                <span className="text-xs px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/30 font-medium">
                  NF EN 12046-1
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Effort de rotation poignée, crémone démultipliée et conformité PMR Décret 06-455
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadPdf}
              disabled={isGeneratingPdf}
              className="min-h-[44px] px-3 py-1.5 bg-sky-600 hover:bg-sky-500 disabled:bg-slate-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
              title="Télécharger la fiche de calcul PDF"
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
              className="min-h-[44px] min-w-[44px] p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors flex items-center justify-center"
              title="Fermer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Global Compliance Status Banner */}
        <div
          className={`px-5 py-2.5 border-b flex items-center justify-between text-xs font-medium ${
            audit.isPmrClassAchieved
              ? 'bg-emerald-950/40 border-emerald-800/50 text-emerald-300'
              : isOk
              ? 'bg-sky-950/40 border-sky-800/50 text-sky-300'
              : isWarning
              ? 'bg-amber-950/40 border-amber-800/50 text-amber-300'
              : 'bg-rose-950/40 border-rose-800/50 text-rose-300'
          }`}
        >
          <div className="flex items-center gap-2">
            {audit.isPmrClassAchieved ? (
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : isOk ? (
              <CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            )}
            <span>
              {audit.isPmrClassAchieved
                ? 'Conformité Totale PMR (Décret exécutif 06-455 et Classe 2 NF EN 13115 validée)'
                : isOk
                ? 'Conforme Classe 1 Standard (Effort admissible pour usage général non PMR)'
                : isWarning
                ? 'Attention : Seuil PMR dépassé ou garde main limite sur dormant'
                : 'Non Conforme : Effort de manœuvre excessif ou hauteur non conforme'}
            </span>
          </div>
          <div className="hidden sm:flex items-center gap-4 text-slate-300">
            <span>
              Couple : <strong>{audit.calculatedHandleTorqueNm} N.m</strong> / {audit.maxAllowableTorqueNm} N.m
            </span>
            <span>
              Effort main : <strong>{audit.operatingHandForceN} N</strong> / {audit.maxAllowableHandForceN} N
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
                ? 'border-sky-500 text-sky-400 bg-sky-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sliders className="w-4 h-4" />
            Configuration & Poignée
          </button>
          <button
            onClick={() => {
              playSwitchSound();
              setActiveTab('forces');
            }}
            className={`min-h-[44px] px-4 py-2.5 text-xs font-medium border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'forces'
                ? 'border-sky-500 text-sky-400 bg-sky-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Gauge className="w-4 h-4" />
            Efforts & Couple NF EN 12046-1
          </button>
          <button
            onClick={() => {
              playSwitchSound();
              setActiveTab('cad_diagram');
            }}
            className={`min-h-[44px] px-4 py-2.5 text-xs font-medium border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'cad_diagram'
                ? 'border-sky-500 text-sky-400 bg-sky-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Compass className="w-4 h-4" />
            Schéma Ergonomie & Bras de Levier
          </button>
          <button
            onClick={() => {
              playSwitchSound();
              setActiveTab('pmr_standards');
            }}
            className={`min-h-[44px] px-4 py-2.5 text-xs font-medium border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'pmr_standards'
                ? 'border-sky-500 text-sky-400 bg-sky-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            Accessibilité PMR (Décret 06-455)
          </button>
        </div>

        {/* Tab Content Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5">
          {/* TAB 1: CONFIGURATION & POIGNEE */}
          {activeTab === 'config' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Vantail & Dimensions */}
              <div className="bg-slate-800/60 border border-slate-700/80 rounded-xl p-4 space-y-4">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <Activity className="w-4 h-4 text-sky-400" />
                  Dimensions du Vantail & Hauteur de Pose
                </h3>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Largeur vantail (mm)</label>
                    <input
                      type="number"
                      value={sashWidthMm}
                      onChange={(e) => setSashWidthMm(Math.max(400, parseInt(e.target.value) || 400))}
                      className="min-h-[44px] w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:border-sky-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Hauteur vantail (mm)</label>
                    <input
                      type="number"
                      value={sashHeightMm}
                      onChange={(e) => setSashHeightMm(Math.max(500, parseInt(e.target.value) || 500))}
                      className="min-h-[44px] w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:border-sky-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs text-slate-400">Hauteur de l axe par rapport au sol fini</label>
                    <span
                      className={`text-xs font-semibold px-2 py-0.5 rounded ${
                        audit.isHandleHeightCompliant
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : 'bg-rose-500/20 text-rose-400'
                      }`}
                    >
                      {handleHeightFromFloorMm} mm (PMR : 900 à 1300 mm)
                    </span>
                  </div>
                  <input
                    type="range"
                    min={700}
                    max={1600}
                    step={25}
                    value={handleHeightFromFloorMm}
                    onChange={(e) => setHandleHeightFromFloorMm(parseInt(e.target.value))}
                    className="w-full accent-sky-500 h-2 bg-slate-700 rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                    <span>700 mm (trop bas)</span>
                    <span className="text-emerald-400 font-medium">1050 mm (recommandé PMR)</span>
                    <span>1600 mm (inaccessible)</span>
                  </div>
                </div>

                <div>
                  <label className="text-xs text-slate-400 block mb-1">Qualité & Compression des Joints d Étanchéité</label>
                  <select
                    value={gasketType}
                    onChange={(e) => setGasketType(e.target.value as any)}
                    className="min-h-[44px] w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-xs focus:border-sky-500 focus:outline-none"
                  >
                    <option value="standard_epdm">EPDM Extrudé Standard (Résistance moyenne 22 N/m)</option>
                    <option value="soft_sponge_epdm">EPDM Cellulaire Souple (Forte compression 14 N/m - Recommandé PMR)</option>
                    <option value="acoustic_double">Double Frappe Acoustique Renforcée (Résistance 32 N/m)</option>
                  </select>
                </div>
              </div>

              {/* Poignée & Quincaillerie */}
              <div className="bg-slate-800/60 border border-slate-700/80 rounded-xl p-4 space-y-4">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <Hand className="w-4 h-4 text-sky-400" />
                  Sélection Poignée & Bras de Levier
                </h3>

                <div>
                  <label className="text-xs text-slate-400 block mb-1">Modèle de poignée</label>
                  <select
                    value={handleType}
                    onChange={(e) => {
                      playTactileClick();
                      setHandleType(e.target.value as HandleType);
                    }}
                    className="min-h-[44px] w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-xs focus:border-sky-500 focus:outline-none"
                  >
                    {Object.values(HANDLE_SPECS).map((spec) => (
                      <option key={spec.id} value={spec.id}>
                        {spec.name} (Bras {spec.leverArmLengthMm} mm - {spec.isPmrApproved ? 'Agrément PMR' : 'Standard'})
                      </option>
                    ))}
                  </select>
                  <p className="text-[11px] text-slate-400 mt-1.5 italic">
                    {HANDLE_SPECS[handleType].description}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Transmission Crémone</label>
                    <select
                      value={transmissionType}
                      onChange={(e) => setTransmissionType(e.target.value as TransmissionType)}
                      className="min-h-[44px] w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-xs focus:border-sky-500 focus:outline-none"
                    >
                      <option value="direct_rack_pinion">Directe Pignon/Crémaillère (1.0x)</option>
                      <option value="reduction_geared">Démultipliée à Engrenages (1.55x - PMR)</option>
                      <option value="concealed_slide_rod">Tringle Coulissante Carénée (1.15x)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Galets de Verrouillage</label>
                    <select
                      value={camType}
                      onChange={(e) => setCamType(e.target.value as CamType)}
                      className="min-h-[44px] w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-xs focus:border-sky-500 focus:outline-none"
                    >
                      <option value="fixed_sliding_cam">Galets Fixes Frottants (Coef 0.22)</option>
                      <option value="rotating_roller_cam">Galets Tournants sur Palier (Coef 0.08)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Points de verrouillage</label>
                    <select
                      value={lockingPointCount}
                      onChange={(e) => setLockingPointCount(parseInt(e.target.value))}
                      className="min-h-[44px] w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-xs focus:border-sky-500 focus:outline-none"
                    >
                      {[2, 3, 4, 5, 6, 8].map((pts) => (
                        <option key={pts} value={pts}>
                          {pts} points de verrouillage
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Exigence Visée</label>
                    <select
                      value={targetClass}
                      onChange={(e) => setTargetClass(e.target.value as OperatingForceClass)}
                      className="min-h-[44px] w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-xs focus:border-sky-500 focus:outline-none"
                    >
                      <option value="class_2_pmr">Classe 2 PMR (Couple &le; 5 N.m, Main &le; 20 N)</option>
                      <option value="class_1_standard">Classe 1 Standard (Couple &le; 10 N.m, Main &le; 50 N)</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: EFFORTS & COUPLE NF EN 12046-1 */}
          {activeTab === 'forces' && (
            <div className="space-y-4">
              {/* KPI Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-3">
                  <div className="text-xs text-slate-400">Couple Poignée Calculé</div>
                  <div
                    className={`text-xl font-bold mt-1 ${
                      audit.calculatedHandleTorqueNm <= audit.maxAllowableTorqueNm
                        ? 'text-emerald-400'
                        : 'text-rose-400'
                    }`}
                  >
                    {audit.calculatedHandleTorqueNm} N.m
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">
                    Limite max : {audit.maxAllowableTorqueNm} N.m
                  </div>
                </div>

                <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-3">
                  <div className="text-xs text-slate-400">Effort Manuel Requis</div>
                  <div
                    className={`text-xl font-bold mt-1 ${
                      audit.operatingHandForceN <= audit.maxAllowableHandForceN
                        ? 'text-emerald-400'
                        : 'text-rose-400'
                    }`}
                  >
                    {audit.operatingHandForceN} N
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">
                    Limite max : {audit.maxAllowableHandForceN} N
                  </div>
                </div>

                <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-3">
                  <div className="text-xs text-slate-400">Garde Main / Dormant</div>
                  <div
                    className={`text-xl font-bold mt-1 ${
                      audit.isClearanceCompliant ? 'text-sky-400' : 'text-amber-400'
                    }`}
                  >
                    {audit.handleSpec.frameClearanceMm} mm
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">
                    Requis anti-pincement : &ge; 40 mm
                  </div>
                </div>

                <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-3">
                  <div className="text-xs text-slate-400">Démultiplication</div>
                  <div className="text-xl font-bold text-sky-400 mt-1">
                    {audit.gearRatio.toFixed(2)}x
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">
                    Gain mécanique crémone
                  </div>
                </div>
              </div>

              {/* Detailed Breakdown Table */}
              <div className="bg-slate-800/60 border border-slate-700 rounded-xl overflow-hidden">
                <div className="px-4 py-2.5 bg-slate-900/80 border-b border-slate-700 text-xs font-semibold text-white">
                  Décomposition des Résistances Mécaniques & Frottements
                </div>
                <div className="divide-y divide-slate-700/60 text-xs">
                  <div className="flex justify-between items-center p-3">
                    <span className="text-slate-300">Périmètre total du vantail mobile</span>
                    <span className="font-semibold text-white">{audit.sashPerimeterM.toFixed(2)} m</span>
                  </div>
                  <div className="flex justify-between items-center p-3">
                    <span className="text-slate-300">Résistance totale de compression des joints EPDM</span>
                    <span className="font-semibold text-white">{audit.totalGasketResistanceN} N ({audit.gasketLinearForceNPerM} N/m)</span>
                  </div>
                  <div className="flex justify-between items-center p-3">
                    <span className="text-slate-300">Effort de frottement sur les gâches de verrouillage</span>
                    <span className="font-semibold text-white">{audit.camFrictionForceN} N ({camType === 'rotating_roller_cam' ? 'Galets rotatifs' : 'Galets fixes'})</span>
                  </div>
                  <div className="flex justify-between items-center p-3">
                    <span className="text-slate-300">Effort linéaire de commande sur la tringle</span>
                    <span className="font-semibold text-sky-400">{audit.totalRodOperatingForceN} N</span>
                  </div>
                  <div className="flex justify-between items-center p-3">
                    <span className="text-slate-300">Bras de levier de la béquille</span>
                    <span className="font-semibold text-white">{audit.handleSpec.leverArmLengthMm} mm</span>
                  </div>
                  <div className="flex justify-between items-center p-3">
                    <span className="text-slate-300">Diamètre du tube de préhension</span>
                    <span className="font-semibold text-white">{audit.handleSpec.gripDiameterMm} mm</span>
                  </div>
                </div>
              </div>

              {/* Standards Reference Card */}
              <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 text-xs text-slate-300 space-y-2">
                <div className="font-semibold text-white flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-sky-400" />
                  Classification Européenne NF EN 13115 / NF EN 12046-1 :
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px] text-slate-400">
                  <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800">
                    <div className="font-bold text-slate-200">Classe 1 (Standard)</div>
                    <div>Couple maximal admissible : 10.0 N.m</div>
                    <div>Effort manuel maximal : 50.0 N</div>
                    <div>Application : Locaux professionnels, fenêtres tertiaires standard.</div>
                  </div>
                  <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800">
                    <div className="font-bold text-emerald-400">Classe 2 (PMR & Confort Supérieur)</div>
                    <div>Couple maximal admissible : 5.0 N.m</div>
                    <div>Effort manuel maximal : 20.0 N</div>
                    <div>Application : Logements PMR, EHPAD, crèches, hôpitaux, Décret 06-455.</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: SCHEMA ERGONOMIE & BRAS DE LEVIER SVG */}
          {activeTab === 'cad_diagram' && (
            <div className="bg-slate-950/90 border border-slate-800 rounded-xl p-4 space-y-4">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-white">Visualisation Dynamique : Bras de Levier, Garde au Dormant & Arc de Rotation</span>
                <span className="text-slate-400">Norme NF EN 13126-3</span>
              </div>

              {/* Interactive SVG Cad Rendering */}
              <div className="w-full flex justify-center bg-slate-900/90 border border-slate-800 rounded-xl p-4 overflow-hidden">
                <svg viewBox="0 0 700 360" className="w-full max-w-2xl h-auto">
                  {/* Background Grid */}
                  <defs>
                    <pattern id="ergogrid" width="20" height="20" patternUnits="userSpaceOnUse">
                      <line x1="0" y1="0" x2="20" y2="0" stroke="#1e293b" strokeWidth="0.8" />
                      <line x1="0" y1="0" x2="0" y2="20" stroke="#1e293b" strokeWidth="0.8" />
                    </pattern>
                  </defs>
                  <rect x="10" y="10" width="680" height="340" fill="url(#ergogrid)" rx="8" />

                  {/* Window Frame Jamb (Dormant aluminium) */}
                  <rect x="40" y="30" width="60" height="300" fill="#334155" stroke="#475569" strokeWidth="2" rx="2" />
                  <text x="70" y="55" fill="#94a3b8" fontSize="10" textAnchor="middle" fontWeight="bold">DORMANT</text>
                  <text x="70" y="70" fill="#64748b" fontSize="8" textAnchor="middle">Aluminium 50mm</text>

                  {/* Window Sash Stile (Montant Vantail) */}
                  <rect x="105" y="40" width="55" height="280" fill="#1e293b" stroke="#38bdf8" strokeWidth="1.8" rx="2" />
                  <text x="132" y="65" fill="#38bdf8" fontSize="9" textAnchor="middle" fontWeight="bold">VANTAIL</text>

                  {/* EPDM Gaskets (Joints de frappe) */}
                  <rect x="100" y="45" width="5" height="270" fill="#0284c7" />
                  <text x="96" y="180" fill="#38bdf8" fontSize="7.5" textAnchor="end" transform="rotate(-90 96 180)">Joint EPDM</text>

                  {/* Handle Rosette / Escutcheon (Rosace Poignée) */}
                  <circle cx="160" cy="180" r="16" fill="#0f172a" stroke="#94a3b8" strokeWidth="2" />
                  <circle cx="160" cy="180" r="5" fill="#f8fafc" />

                  {/* Handle Lever Calculation */}
                  {/* Lever arm base at (160, 180), extending rightwards */}
                  {/* Let scaled length = handleSpec.leverArmLengthMm * 1.1 */}
                  {(() => {
                    const scaledLength = Math.min(260, audit.handleSpec.leverArmLengthMm * 1.15);
                    const handleColor = audit.isPmrClassAchieved ? '#10b981' : isOk ? '#38bdf8' : '#f43f5e';
                    const clearanceColor = audit.isClearanceCompliant ? '#10b981' : '#f59e0b';

                    return (
                      <g>
                        {/* Stand-off Neck (Col de la poignée sortant du vantail) */}
                        <rect x="160" y="174" width="30" height="12" fill="#64748b" stroke="#475569" strokeWidth="1" />

                        {/* Lever Bar */}
                        <rect
                          x="190"
                          y={174 - (audit.handleSpec.gripDiameterMm - 20) / 2}
                          width={scaledLength}
                          height={audit.handleSpec.gripDiameterMm * 0.7}
                          fill={handleColor}
                          stroke="#ffffff"
                          strokeWidth="1.2"
                          rx={audit.handleSpec.isPmrApproved ? 7 : 3}
                        />

                        {/* Curved PMR Return if approved */}
                        {audit.handleSpec.isPmrApproved && (
                          <path
                            d={`M ${190 + scaledLength} 174 C ${190 + scaledLength + 15} 174, ${190 + scaledLength + 15} 205, ${190 + scaledLength} 205`}
                            fill="none"
                            stroke={handleColor}
                            strokeWidth={audit.handleSpec.gripDiameterMm * 0.7}
                            strokeLinecap="round"
                          />
                        )}

                        {/* Hand Grip Zone Highlight */}
                        <rect
                          x={190 + scaledLength * 0.55}
                          y={166}
                          width={scaledLength * 0.4}
                          height={28}
                          fill="#38bdf8"
                          fillOpacity="0.15"
                          stroke="#38bdf8"
                          strokeWidth="1"
                          strokeDasharray="3 3"
                          rx="4"
                        />
                        <text
                          x={190 + scaledLength * 0.75}
                          y={160}
                          fill="#38bdf8"
                          fontSize="8.5"
                          textAnchor="middle"
                          fontWeight="bold"
                        >
                          Zone de Préhension Main
                        </text>

                        {/* Applied Hand Force Arrow F_hand */}
                        <line
                          x1={190 + scaledLength * 0.75}
                          y1="125"
                          x2={190 + scaledLength * 0.75}
                          y2="162"
                          stroke={handleColor}
                          strokeWidth="2.5"
                          markerEnd="url(#arrowhead)"
                        />
                        <text
                          x={190 + scaledLength * 0.75}
                          y="118"
                          fill={handleColor}
                          fontSize="10"
                          textAnchor="middle"
                          fontWeight="bold"
                        >
                          F_main = {audit.operatingHandForceN} N
                        </text>

                        {/* Dimension: Lever Arm Length L */}
                        <line x1="160" y1="230" x2={190 + scaledLength} y2="230" stroke="#94a3b8" strokeWidth="1" />
                        <line x1="160" y1="225" x2="160" y2="235" stroke="#94a3b8" strokeWidth="1" />
                        <line x1={190 + scaledLength} y1="225" x2={190 + scaledLength} y2="235" stroke="#94a3b8" strokeWidth="1" />
                        <text
                          x={160 + (30 + scaledLength) / 2}
                          y="244"
                          fill="#cbd5e1"
                          fontSize="9"
                          textAnchor="middle"
                          fontWeight="bold"
                        >
                          Bras de levier L = {audit.handleSpec.leverArmLengthMm} mm
                        </text>

                        {/* Clearance Dimension: Frame to Handle Grip */}
                        <line x1="100" y1="270" x2="190" y2="270" stroke={clearanceColor} strokeWidth="1.5" />
                        <line x1="100" y1="265" x2="100" y2="275" stroke={clearanceColor} strokeWidth="1.5" />
                        <line x1="190" y1="265" x2="190" y2="275" stroke={clearanceColor} strokeWidth="1.5" />
                        <text
                          x="145"
                          y="285"
                          fill={clearanceColor}
                          fontSize="9"
                          textAnchor="middle"
                          fontWeight="bold"
                        >
                          Garde C = {audit.handleSpec.frameClearanceMm} mm (Min 40 mm)
                        </text>

                        {/* 90-Degree Rotation Arc */}
                        <path
                          d="M 190 180 A 30 30 0 0 1 160 210"
                          fill="none"
                          stroke="#f59e0b"
                          strokeWidth="2"
                          strokeDasharray="4 2"
                        />
                        <text x="205" y="215" fill="#f59e0b" fontSize="8" fontWeight="bold">
                          Rotation 90° (C = {audit.calculatedHandleTorqueNm} N.m)
                        </text>
                      </g>
                    );
                  })()}

                  {/* Markers Definition */}
                  <defs>
                    <marker
                      id="arrowhead"
                      markerWidth="6"
                      markerHeight="6"
                      refX="3"
                      refY="3"
                      orient="auto"
                    >
                      <polygon points="0 0, 6 3, 0 6" fill="#38bdf8" />
                    </marker>
                  </defs>

                  {/* Locking Points & Roller Cam Representation on the Right */}
                  <g transform="translate(500, 40)">
                    <rect x="0" y="0" width="160" height="270" fill="#0f172a" stroke="#334155" strokeWidth="1" rx="6" />
                    <text x="80" y="20" fill="#f8fafc" fontSize="9.5" textAnchor="middle" fontWeight="bold">
                      TRINGLE & GALETS
                    </text>
                    <text x="80" y="34" fill="#94a3b8" fontSize="7.5" textAnchor="middle">
                      {lockingPointCount} points de fermeture
                    </text>

                    {/* Vertical Rod */}
                    <line x1="80" y1="45" x2="80" y2="255" stroke="#64748b" strokeWidth="4" />

                    {/* Roller Cams along the rod */}
                    {Array.from({ length: lockingPointCount }).map((_, idx) => {
                      const yPos = 55 + idx * (190 / Math.max(1, lockingPointCount - 1));
                      return (
                        <g key={idx}>
                          <circle
                            cx="80"
                            cy={yPos}
                            r="7"
                            fill={camType === 'rotating_roller_cam' ? '#10b981' : '#f59e0b'}
                            stroke="#ffffff"
                            strokeWidth="1"
                          />
                          <rect
                            x="94"
                            y={yPos - 6}
                            width="14"
                            height="12"
                            fill="#334155"
                            stroke="#64748b"
                            strokeWidth="1"
                            rx="1"
                          />
                          <text x="115" y={yPos + 3} fill="#94a3b8" fontSize="7">
                            Gâche #{idx + 1}
                          </text>
                        </g>
                      );
                    })}
                  </g>
                </svg>
              </div>

              {/* Explanation of Ergonomic Parameters */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg">
                  <div className="font-semibold text-white mb-1">Bras de levier allongé</div>
                  <p className="text-slate-400 text-[11px]">
                    Un bras de 175 mm ou 220 mm augmente le bras de levier de 40 à 75%, réduisant proportionnellement l effort musculaire imposé à la main de l usager.
                  </p>
                </div>
                <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg">
                  <div className="font-semibold text-white mb-1">Garde de sécurité anti-pincement</div>
                  <p className="text-slate-400 text-[11px]">
                    Un dégagement minimal de 40 mm entre la poignée et le dormant évite l écrasement des phalanges lors de la manœuvre de fermeture rapide.
                  </p>
                </div>
                <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg">
                  <div className="font-semibold text-white mb-1">Galets champignons rotatifs</div>
                  <p className="text-slate-400 text-[11px]">
                    Les galets montés sur roulement tournant divisent par près de trois le frottement au franchissement de la gâche par rapport à un galet fixe.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: ACCESSIBILITE PMR (DECRET 06-455) */}
          {activeTab === 'pmr_standards' && (
            <div className="space-y-4">
              {/* Checklist PMR */}
              <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-4 space-y-3">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-emerald-400" />
                  Conformité Réglementaire Décret Exécutif Algérien N° 06-455 (PMR)
                </h3>

                <div className="space-y-2 text-xs">
                  <div className="flex items-start gap-3 p-3 bg-slate-900/80 rounded-lg border border-slate-800">
                    <div className="mt-0.5">
                      {audit.isHandleHeightCompliant ? (
                        <Check className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <X className="w-4 h-4 text-rose-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-white">
                        Hauteur de préhension entre 900 mm et 1300 mm du sol fini
                      </div>
                      <p className="text-slate-400 text-[11px] mt-0.5">
                        Actuel : {handleHeightFromFloorMm} mm. Doit être utilisable par une personne en position assise (fauteuil roulant) sans lever le bras au-dessus de l épaule.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-slate-900/80 rounded-lg border border-slate-800">
                    <div className="mt-0.5">
                      {audit.operatingHandForceN <= 20 ? (
                        <Check className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <X className="w-4 h-4 text-rose-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-white">
                        Effort maximal de manœuvre inférieur ou égal à 20 N (Classe 2 PMR)
                      </div>
                      <p className="text-slate-400 text-[11px] mt-0.5">
                        Actuel : {audit.operatingHandForceN} N. Une personne ayant une force manuelle réduite ou des douleurs articulaires peut fermer la fenêtre sans effort pénible.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-slate-900/80 rounded-lg border border-slate-800">
                    <div className="mt-0.5">
                      {audit.calculatedHandleTorqueNm <= 5.0 ? (
                        <Check className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <X className="w-4 h-4 text-rose-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-white">
                        Couple de rotation sur l axe inférieur ou égal à 5.0 N.m
                      </div>
                      <p className="text-slate-400 text-[11px] mt-0.5">
                        Actuel : {audit.calculatedHandleTorqueNm} N.m. Prévient la torsion douloureuse du poignet grâce à la démultiplication de la crémone.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-slate-900/80 rounded-lg border border-slate-800">
                    <div className="mt-0.5">
                      {audit.isClearanceCompliant ? (
                        <Check className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <X className="w-4 h-4 text-rose-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-white">
                        Garde minimale anti-pincement supérieure ou égale à 40 mm
                      </div>
                      <p className="text-slate-400 text-[11px] mt-0.5">
                        Actuel : {audit.handleSpec.frameClearanceMm} mm. Permet le passage aisé de la main ou d une main gantée sans frottement douloureux contre le dormant.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-slate-900/80 rounded-lg border border-slate-800">
                    <div className="mt-0.5">
                      {audit.handleSpec.isPmrApproved ? (
                        <Check className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-amber-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-white">
                        Forme ergonomique à retour courbé sans angle vif
                      </div>
                      <p className="text-slate-400 text-[11px] mt-0.5">
                        Poignée {audit.handleSpec.name}. Évite d accrocher les manches de vêtements et offre un appui sécurisé pour la paume de la main.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recommendations Box */}
              <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-4 space-y-3">
                <h4 className="text-xs font-semibold text-white uppercase tracking-wider">
                  Recommandations Techniques de l Atelier
                </h4>
                <div className="space-y-1.5">
                  {audit.recommendations.map((rec, idx) => (
                    <div
                      key={idx}
                      className="text-xs text-slate-300 flex items-start gap-2 bg-slate-900/60 p-2 rounded-lg border border-slate-800"
                    >
                      <span className="text-sky-400 font-bold">•</span>
                      <span>{rec}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-slate-800 bg-slate-950/80 text-xs">
          <div className="text-slate-400 hidden sm:block">
            Calcul conforme aux normes NF EN 12046-1, NF EN 13115 et Décret algérien PMR 06-455
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={() => {
                playTactileClick();
                onClose();
              }}
              className="min-h-[44px] px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold transition-colors"
            >
              Fermer
            </button>
            <button
              onClick={handleDownloadPdf}
              disabled={isGeneratingPdf}
              className="min-h-[44px] px-4 py-2 bg-sky-600 hover:bg-sky-500 disabled:bg-slate-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <FileText className="w-4 h-4" />
              {isGeneratingPdf ? 'Génération...' : 'Télécharger Certificat PDF'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
