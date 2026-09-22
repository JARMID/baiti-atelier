import React, { useState, useMemo } from 'react';
import type { WorkshopJob } from '../../types/workshop';
import {
  INSTALLATION_SITE_CHECKPOINTS,
  getJobInstallationAcceptance,
  saveJobInstallationAcceptance,
  formatInstallationPvWhatsAppMessage,
  type JobInstallationAcceptance,
  type InstallationVerdict,
} from '../../utils/installationAcceptanceManager';
import { generateInstallationAcceptancePdf } from '../../utils/pdfGenerator';
import { TouchSignaturePad } from './TouchSignaturePad';
import { playTactileClick, playClampSound } from '../../utils/audioFeedback';
import {
  X,
  Check,
  AlertTriangle,
  ShieldCheck,
  MessageCircle,
  FileCheck,
  DollarSign,
  UserCheck,
  CheckCircle2,
} from 'lucide-react';
import { useConfigStore } from '../../store/configStore';

export interface InstallationAcceptanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  job: WorkshopJob;
  onAcceptanceSaved?: (acceptance: JobInstallationAcceptance) => void;
  onJobCompleted?: (jobId: string) => void;
}

export const InstallationAcceptanceModal: React.FC<InstallationAcceptanceModalProps> = ({
  isOpen,
  onClose,
  job,
  onAcceptanceSaved,
  onJobCompleted,
}) => {
  const { theme, language } = useConfigStore();
  const isLight = theme === 'light';
  const isRtl = language === 'ar';

  const [acceptance, setAcceptance] = useState<JobInstallationAcceptance>(() =>
    getJobInstallationAcceptance(job)
  );

  const [activeTab, setActiveTab] = useState<'points' | 'signatures' | 'finance'>('points');
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [savedSuccessToast, setSavedSuccessToast] = useState(false);

  const initialBalanceDue = Math.max(0, job.totalAmountDzd - job.depositDzd);
  const paidOnSite = Math.min(initialBalanceDue, Math.max(0, acceptance.paidOnSiteDzd || 0));
  const finalBalanceDue = Math.max(0, initialBalanceDue - paidOnSite);

  const compliantCount = useMemo(() => {
    return Object.values(acceptance.checkPoints).filter((v) => v === 'conforme').length;
  }, [acceptance.checkPoints]);

  const reserveCount = useMemo(() => {
    return Object.values(acceptance.checkPoints).filter((v) => v === 'avec_reserve').length;
  }, [acceptance.checkPoints]);

  if (!isOpen) return null;

  const handleVerdictChange = (checkpointId: string, verdict: InstallationVerdict) => {
    playTactileClick();
    setAcceptance((prev) => {
      const nextCheckPoints = {
        ...prev.checkPoints,
        [checkpointId]: verdict,
      };
      const hasAnyReserve = Object.values(nextCheckPoints).some((v) => v === 'avec_reserve');
      return {
        ...prev,
        checkPoints: nextCheckPoints,
        hasReservations: hasAnyReserve || prev.hasReservations,
      };
    });
  };

  const handleSave = () => {
    playClampSound();
    saveJobInstallationAcceptance(acceptance);
    if (onAcceptanceSaved) {
      onAcceptanceSaved(acceptance);
    }
    setSavedSuccessToast(true);
    setTimeout(() => {
      setSavedSuccessToast(false);
      onClose();
    }, 600);
  };

  const handleSaveAndCompleteJob = () => {
    playClampSound();
    saveJobInstallationAcceptance(acceptance);
    if (onAcceptanceSaved) {
      onAcceptanceSaved(acceptance);
    }
    if (onJobCompleted) {
      onJobCompleted(job.id);
    }
    setSavedSuccessToast(true);
    setTimeout(() => {
      setSavedSuccessToast(false);
      onClose();
    }, 600);
  };

  const handleWhatsApp = () => {
    playTactileClick();
    const message = formatInstallationPvWhatsAppMessage(job, acceptance);
    const cleanPhone = job.clientPhone.replace(/\D/g, '');
    const phoneParam = cleanPhone.startsWith('0')
      ? '213' + cleanPhone.slice(1)
      : cleanPhone.startsWith('213')
      ? cleanPhone
      : '';
    const url = phoneParam
      ? `https://wa.me/${phoneParam}?text=${encodeURIComponent(message)}`
      : `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  const handleDownloadPdf = async () => {
    playTactileClick();
    setIsGeneratingPdf(true);
    try {
      const checkPointRows = INSTALLATION_SITE_CHECKPOINTS.map((cp) => {
        const v = acceptance.checkPoints[cp.id] || 'conforme';
        const verdictLabel: 'CONFORME' | 'AVEC RESERVE' | 'NON APPLICABLE' =
          v === 'conforme'
            ? 'CONFORME'
            : v === 'avec_reserve'
            ? 'AVEC RESERVE'
            : 'NON APPLICABLE';
        return {
          id: cp.id,
          label: cp.labelFr,
          standard: cp.standardFr,
          verdict: verdictLabel,
        };
      });

      await generateInstallationAcceptancePdf({
        jobId: job.id,
        clientName: acceptance.clientSignerName || job.clientName,
        clientPhone: job.clientPhone,
        wilaya: job.wilaya,
        description: job.description,
        itemCount: job.itemCount,
        totalAmountDzd: job.totalAmountDzd,
        depositDzd: job.depositDzd,
        profileSystem: job.profileSystem,
        installationDate: acceptance.acceptedAt,
        hasReservations: acceptance.hasReservations,
        reservationNotes: acceptance.reservationNotes,
        clientSignatureDataUrl: acceptance.clientSignatureDataUrl,
        installerSignatureDataUrl: acceptance.installerSignatureDataUrl,
        paidOnSiteDzd: acceptance.paidOnSiteDzd,
        checkPoints: checkPointRows,
      });
    } catch (err) {
      console.error('Failed to generate signed PV PDF:', err);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const quickReservationChips = [
    'Nettoyage et dépose film à parachever',
    'Réglage fin gâche crémone vantail droit',
    'Livraison cache-vis manquants sous 48h',
    'Retouche mastic silicone joint extérieur',
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-xs p-0 sm:p-4"
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      <div
        className={`w-full max-w-lg rounded-t-3xl sm:rounded-3xl border shadow-2xl flex flex-col max-h-[92vh] sm:max-h-[88vh] overflow-hidden animate-in fade-in slide-in-from-bottom duration-200 ${
          isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-[#0B0F19] border-white/10 text-white'
        }`}
      >
        {/* HEADER */}
        <div className="p-4 border-b border-black/5 dark:border-white/10 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-[#D4AF37]/15 border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37] shrink-0">
              <FileCheck className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm font-bold truncate">
                PV de Réception de Pose Chantier
              </h2>
              <p className="text-[11px] text-zinc-500 truncate font-mono">
                {job.id} • {job.clientName} ({job.wilaya})
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className={`p-2 rounded-xl border min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer transition-all ${
              isLight
                ? 'border-slate-200 text-slate-500 hover:bg-slate-100'
                : 'border-white/10 text-zinc-400 hover:bg-white/10'
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* STATUS & SUMMARY STRIP */}
        <div
          className={`px-4 py-2.5 border-b font-mono text-xs flex items-center justify-between gap-2 shrink-0 ${
            acceptance.hasReservations
              ? isLight
                ? 'bg-amber-50 border-amber-200 text-amber-900'
                : 'bg-amber-500/10 border-amber-500/25 text-amber-200'
              : isLight
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-emerald-500/10 border-emerald-500/25 text-emerald-200'
          }`}
        >
          <div className="flex items-center gap-1.5 font-bold">
            {acceptance.hasReservations ? (
              <>
                <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                <span>Avec Réserves ({reserveCount})</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Sans Réserve ({compliantCount}/8)</span>
              </>
            )}
          </div>

          <div className="flex items-center gap-2 text-[11px]">
            <span>Solde restant :</span>
            <span className="font-bold text-[#D4AF37]">
              {finalBalanceDue.toLocaleString('fr-DZ')} DZD
            </span>
          </div>
        </div>

        {/* NAVIGATION TABS */}
        <div className="grid grid-cols-3 p-1.5 border-b border-black/5 dark:border-white/10 font-mono text-xs shrink-0">
          <button
            type="button"
            onClick={() => {
              playTactileClick();
              setActiveTab('points');
            }}
            className={`py-2 rounded-xl font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
              activeTab === 'points'
                ? 'bg-[#D4AF37] text-slate-950 shadow-xs'
                : isLight
                ? 'text-slate-600 hover:text-slate-950'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Contrôles ({compliantCount}/8)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              playTactileClick();
              setActiveTab('signatures');
            }}
            className={`py-2 rounded-xl font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
              activeTab === 'signatures'
                ? 'bg-[#D4AF37] text-slate-950 shadow-xs'
                : isLight
                ? 'text-slate-600 hover:text-slate-950'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Signatures {acceptance.clientSignatureDataUrl ? '✓' : ''}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              playTactileClick();
              setActiveTab('finance');
            }}
            className={`py-2 rounded-xl font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
              activeTab === 'finance'
                ? 'bg-[#D4AF37] text-slate-950 shadow-xs'
                : isLight
                ? 'text-slate-600 hover:text-slate-950'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5" />
            <span>Règlement</span>
          </button>
        </div>

        {/* TAB CONTENTS (SCROLLABLE) */}
        <div className="p-4 space-y-4 overflow-y-auto flex-1 font-mono text-xs">
          {/* TAB 1: 8 TECHNICAL CHECKPOINTS */}
          {activeTab === 'points' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-[11px] text-zinc-500">
                <span>Normes DTU 36.5 & DTR C3-2</span>
                <span>8 points obligatoires</span>
              </div>

              {INSTALLATION_SITE_CHECKPOINTS.map((cp, idx) => {
                const currentVerdict = acceptance.checkPoints[cp.id] || 'conforme';
                return (
                  <div
                    key={cp.id}
                    className={`p-3 rounded-2xl border space-y-2 transition-all ${
                      currentVerdict === 'avec_reserve'
                        ? isLight
                          ? 'bg-amber-50/70 border-amber-300'
                          : 'bg-amber-500/10 border-amber-500/30'
                        : isLight
                        ? 'bg-slate-50/80 border-slate-200'
                        : 'bg-black/30 border-white/5'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <span className="text-[10px] text-zinc-500 font-bold">Point {idx + 1}</span>
                        <h4 className={`font-bold text-xs ${isLight ? 'text-slate-900' : 'text-white'}`}>
                          {cp.labelFr}
                        </h4>
                        <p className="text-[10px] text-zinc-500 mt-0.5">{cp.standardFr}</p>
                      </div>
                    </div>

                    {/* Segmented 3-Way Verdict Selector */}
                    <div className="grid grid-cols-3 p-1 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 gap-1 text-[11px]">
                      <button
                        type="button"
                        onClick={() => handleVerdictChange(cp.id, 'conforme')}
                        className={`py-1.5 rounded-lg font-bold flex items-center justify-center gap-1 cursor-pointer transition-all ${
                          currentVerdict === 'conforme'
                            ? 'bg-emerald-500 text-white shadow-xs'
                            : isLight
                            ? 'text-slate-600 hover:text-emerald-700'
                            : 'text-zinc-400 hover:text-emerald-300'
                        }`}
                      >
                        <Check className="w-3 h-3" />
                        <span>Conforme</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleVerdictChange(cp.id, 'avec_reserve')}
                        className={`py-1.5 rounded-lg font-bold flex items-center justify-center gap-1 cursor-pointer transition-all ${
                          currentVerdict === 'avec_reserve'
                            ? 'bg-amber-500 text-slate-950 shadow-xs'
                            : isLight
                            ? 'text-slate-600 hover:text-amber-700'
                            : 'text-zinc-400 hover:text-amber-300'
                        }`}
                      >
                        <AlertTriangle className="w-3 h-3" />
                        <span>Réserve</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleVerdictChange(cp.id, 'non_applicable')}
                        className={`py-1.5 rounded-lg font-bold flex items-center justify-center gap-1 cursor-pointer transition-all ${
                          currentVerdict === 'non_applicable'
                            ? 'bg-slate-500 text-white shadow-xs'
                            : isLight
                            ? 'text-slate-500 hover:text-slate-700'
                            : 'text-zinc-400 hover:text-zinc-200'
                        }`}
                      >
                        <span>N/A</span>
                      </button>
                    </div>
                  </div>
                );
              })}

              {/* RESERVATIONS ACCORDION / TOGGLE */}
              <div
                className={`p-3.5 rounded-2xl border space-y-2.5 transition-all ${
                  acceptance.hasReservations
                    ? isLight
                      ? 'bg-amber-50 border-amber-300'
                      : 'bg-amber-500/10 border-amber-500/30'
                    : isLight
                    ? 'bg-slate-50 border-slate-200'
                    : 'bg-black/30 border-white/5'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertTriangle
                      className={`w-4 h-4 ${
                        acceptance.hasReservations ? 'text-amber-500' : 'text-zinc-400'
                      }`}
                    />
                    <span className="font-bold text-xs">Formuler des réserves de pose</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      playTactileClick();
                      setAcceptance((prev) => ({
                        ...prev,
                        hasReservations: !prev.hasReservations,
                      }));
                    }}
                    className={`px-3 py-1 rounded-xl text-[11px] font-bold cursor-pointer transition-all ${
                      acceptance.hasReservations
                        ? 'bg-amber-500 text-slate-950'
                        : isLight
                        ? 'bg-slate-200 text-slate-700'
                        : 'bg-white/10 text-zinc-300'
                    }`}
                  >
                    {acceptance.hasReservations ? 'Actif' : 'Sans Réserve'}
                  </button>
                </div>

                {acceptance.hasReservations && (
                  <div className="space-y-2 pt-1 animate-in fade-in duration-150">
                    <textarea
                      rows={3}
                      value={acceptance.reservationNotes}
                      onChange={(e) =>
                        setAcceptance((prev) => ({ ...prev, reservationNotes: e.target.value }))
                      }
                      placeholder="Détail des réserves émises par le client ou le poseur..."
                      className={`w-full p-2.5 rounded-xl border text-xs focus:outline-none focus:border-[#D4AF37] ${
                        isLight
                          ? 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400'
                          : 'bg-black/40 border-white/15 text-white placeholder:text-zinc-600'
                      }`}
                    />

                    {/* Quick Suggestion Chips */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {quickReservationChips.map((chip) => (
                        <button
                          key={chip}
                          type="button"
                          onClick={() => {
                            playTactileClick();
                            setAcceptance((prev) => ({
                              ...prev,
                              reservationNotes: prev.reservationNotes
                                ? `${prev.reservationNotes.trim()}; ${chip}`
                                : chip,
                            }));
                          }}
                          className={`text-[10px] px-2 py-1 rounded-lg border cursor-pointer transition-all ${
                            isLight
                              ? 'bg-white border-amber-200 text-amber-900 hover:bg-amber-100'
                              : 'bg-white/5 border-amber-500/20 text-amber-300 hover:bg-white/10'
                          }`}
                        >
                          + {chip}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: DUAL TOUCH SIGNATURE PADS */}
          {activeTab === 'signatures' && (
            <div className="space-y-4">
              <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/25 text-amber-200 text-[11px] leading-relaxed">
                Les signatures électroniques capturées sur cette tablette ou smartphone sont
                directement intégrées au Procès-Verbal officiel (PV A4) et scellées par QR Code.
              </div>

              {/* Installer Signature */}
              <div
                className={`p-3.5 rounded-2xl border space-y-2 ${
                  isLight ? 'bg-slate-50 border-slate-200' : 'bg-black/30 border-white/5'
                }`}
              >
                <div className="space-y-1">
                  <label className="text-[10px] text-zinc-500 font-bold block">
                    Conducteur de Travaux / Poseur Atelier
                  </label>
                  <input
                    type="text"
                    value={acceptance.installerName}
                    onChange={(e) =>
                      setAcceptance((prev) => ({ ...prev, installerName: e.target.value }))
                    }
                    className={`w-full p-2 rounded-xl border text-xs focus:outline-none focus:border-[#D4AF37] ${
                      isLight
                        ? 'bg-white border-slate-300 text-slate-900'
                        : 'bg-black/40 border-white/10 text-white'
                    }`}
                  />
                </div>

                <TouchSignaturePad
                  label="Signature du Poseur"
                  subtitle="Baiti Atelier • Validation règles de l art"
                  initialDataUrl={acceptance.installerSignatureDataUrl}
                  onSignatureChange={(dataUrl) =>
                    setAcceptance((prev) => ({ ...prev, installerSignatureDataUrl: dataUrl }))
                  }
                  isLight={isLight}
                />
              </div>

              {/* Client Signature */}
              <div
                className={`p-3.5 rounded-2xl border space-y-2 ${
                  isLight ? 'bg-slate-50 border-slate-200' : 'bg-black/30 border-white/5'
                }`}
              >
                <div className="space-y-1">
                  <label className="text-[10px] text-zinc-500 font-bold block">
                    Maître d Ouvrage / Signataire Client
                  </label>
                  <input
                    type="text"
                    value={acceptance.clientSignerName}
                    onChange={(e) =>
                      setAcceptance((prev) => ({ ...prev, clientSignerName: e.target.value }))
                    }
                    className={`w-full p-2 rounded-xl border text-xs focus:outline-none focus:border-[#D4AF37] ${
                      isLight
                        ? 'bg-white border-slate-300 text-slate-900'
                        : 'bg-black/40 border-white/10 text-white'
                    }`}
                  />
                </div>

                <TouchSignaturePad
                  label="Signature du Maître d Ouvrage (Client)"
                  subtitle="« Lu et approuvé, bon pour réception des travaux »"
                  initialDataUrl={acceptance.clientSignatureDataUrl}
                  onSignatureChange={(dataUrl) =>
                    setAcceptance((prev) => ({ ...prev, clientSignatureDataUrl: dataUrl }))
                  }
                  isLight={isLight}
                />
              </div>
            </div>
          )}

          {/* TAB 3: FINANCIAL SETTLEMENT ON SITE */}
          {activeTab === 'finance' && (
            <div className="space-y-3.5">
              <div
                className={`p-4 rounded-2xl border space-y-3 ${
                  isLight ? 'bg-slate-50 border-slate-200' : 'bg-black/30 border-white/5'
                }`}
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="text-zinc-500">Montant total marché :</span>
                  <span className="font-bold">{job.totalAmountDzd.toLocaleString('fr-DZ')} DZD</span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-zinc-500">Acomptes déjà versés :</span>
                  <span className="font-semibold text-emerald-500">
                    {job.depositDzd.toLocaleString('fr-DZ')} DZD
                  </span>
                </div>

                <div className="border-t border-black/10 dark:border-white/10 pt-2 flex items-center justify-between text-xs">
                  <span className="text-zinc-500">Solde exigible à réception :</span>
                  <span className="font-bold text-[#D4AF37]">
                    {initialBalanceDue.toLocaleString('fr-DZ')} DZD
                  </span>
                </div>
              </div>

              {/* On-Site Payment Input */}
              <div
                className={`p-4 rounded-2xl border space-y-2.5 ${
                  isLight ? 'bg-emerald-50/70 border-emerald-300' : 'bg-emerald-500/10 border-emerald-500/25'
                }`}
              >
                <label className="text-xs font-bold flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-emerald-400">
                    <DollarSign className="w-4 h-4" />
                    Encaisser sur Chantier (Espèces ou Chèque)
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      playTactileClick();
                      setAcceptance((prev) => ({ ...prev, paidOnSiteDzd: initialBalanceDue }));
                    }}
                    className="text-[10px] px-2 py-0.5 rounded-lg bg-emerald-500 text-slate-950 font-bold cursor-pointer"
                  >
                    Régler la totalité
                  </button>
                </label>

                <div className="relative">
                  <input
                    type="number"
                    min={0}
                    max={initialBalanceDue}
                    step={1000}
                    value={acceptance.paidOnSiteDzd || ''}
                    onChange={(e) => {
                      const val = Number(e.target.value) || 0;
                      setAcceptance((prev) => ({ ...prev, paidOnSiteDzd: val }));
                    }}
                    placeholder="0"
                    className={`w-full p-3 rounded-xl border text-sm font-bold focus:outline-none focus:border-emerald-500 ${
                      isLight
                        ? 'bg-white border-slate-300 text-slate-900'
                        : 'bg-black/50 border-white/15 text-white'
                    }`}
                  />
                  <span className="absolute right-3 top-3 text-xs text-zinc-500 font-bold">DZD</span>
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="text-zinc-500">Solde final restant après visite :</span>
                  <span
                    className={`font-bold ${
                      finalBalanceDue === 0 ? 'text-emerald-500' : 'text-amber-400'
                    }`}
                  >
                    {finalBalanceDue.toLocaleString('fr-DZ')} DZD
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* TOAST SUCCESS */}
        {savedSuccessToast && (
          <div className="px-4 py-2 bg-emerald-500 text-slate-950 text-xs font-bold text-center flex items-center justify-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>Procès-Verbal de Réception enregistré avec succès !</span>
          </div>
        )}

        {/* FOOTER ACTIONS */}
        <div className="p-3 border-t border-black/5 dark:border-white/10 flex items-center gap-2 bg-black/5 dark:bg-white/5 shrink-0 flex-wrap">
          <button
            type="button"
            onClick={handleWhatsApp}
            className="flex-1 py-2.5 px-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer min-h-[44px] hover:bg-emerald-500/25 active:scale-98 transition-all"
            title="Envoyer la synthèse du PV par WhatsApp"
          >
            <MessageCircle className="w-4 h-4 shrink-0" />
            <span>WhatsApp</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadPdf}
            disabled={isGeneratingPdf}
            className={`flex-1 py-2.5 px-3 rounded-2xl border font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer min-h-[44px] active:scale-98 transition-all ${
              isLight
                ? 'bg-slate-100 border-slate-300 text-slate-800 hover:bg-slate-200'
                : 'bg-white/10 border-white/15 text-white hover:bg-white/15'
            }`}
            title="Télécharger le document contractuel signé en PDF"
          >
            <FileCheck className="w-4 h-4 text-[#D4AF37] shrink-0" />
            <span>{isGeneratingPdf ? 'Édition...' : 'PDF Signé'}</span>
          </button>

          <button
            type="button"
            onClick={handleSave}
            className="py-2.5 px-3.5 rounded-2xl bg-slate-700 text-white font-bold text-xs flex items-center justify-center gap-1 cursor-pointer min-h-[44px] hover:bg-slate-600 active:scale-98 transition-all"
          >
            Enregistrer
          </button>

          <button
            type="button"
            onClick={handleSaveAndCompleteJob}
            className="py-2.5 px-4 rounded-2xl bg-gradient-to-r from-[#C5A880] to-[#D4AF37] text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer min-h-[44px] shadow-md hover:brightness-110 active:scale-98 transition-all"
            title="Valider la réception et clôturer l affaire"
          >
            <Check className="w-4 h-4" />
            <span>Clôturer Pose</span>
          </button>
        </div>
      </div>
    </div>
  );
};
