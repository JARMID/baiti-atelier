import React, { useState, useMemo } from 'react';
import type { WorkshopJob } from '../../types/workshop';
import {
  QUALITY_CHECK_ITEMS,
  getJobQualityInspection,
  saveJobQualityInspection,
  computeQualityScore,
  formatQualityWhatsAppMessage,
  type JobQualityInspection,
  type QualityItemStatus,
} from '../../utils/qualityControlManager';
import { generateQualityControlSheetPdf } from '../../utils/pdfGenerator';
import { playTactileClick, playClampSound } from '../../utils/audioFeedback';
import { X, Check, AlertTriangle, ShieldCheck, MessageCircle, FileCheck, CheckCircle2 } from 'lucide-react';
import { useConfigStore } from '../../store/configStore';

export interface WorkshopQualityModalProps {
  isOpen: boolean;
  onClose: () => void;
  job: WorkshopJob;
  onInspectionSaved?: (inspection: JobQualityInspection) => void;
}

export const WorkshopQualityModal: React.FC<WorkshopQualityModalProps> = ({
  isOpen,
  onClose,
  job,
  onInspectionSaved,
}) => {
  const { theme } = useConfigStore();
  const isLight = theme === 'light';

  const [inspection, setInspection] = useState<JobQualityInspection>(() =>
    getJobQualityInspection(job.id)
  );
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [savedSuccessToast, setSavedSuccessToast] = useState(false);

  const score = useMemo(() => computeQualityScore(inspection), [inspection]);

  if (!isOpen) return null;

  const handleStatusChange = (itemId: string, status: QualityItemStatus) => {
    playTactileClick();
    setInspection((prev) => {
      const nextItems = {
        ...prev.items,
        [itemId]: {
          itemId,
          status,
          note: prev.items[itemId]?.note,
        },
      };
      const nextInspection = {
        ...prev,
        items: nextItems,
        isApproved: Object.values(nextItems).every(
          (it) => it.status === 'conforme' || it.status === 'corrige' || it.status === 'non_applicable'
        ),
      };
      return nextInspection;
    });
  };

  const handleSave = () => {
    playClampSound();
    saveJobQualityInspection(inspection);
    if (onInspectionSaved) {
      onInspectionSaved(inspection);
    }
    setSavedSuccessToast(true);
    setTimeout(() => {
      setSavedSuccessToast(false);
      onClose();
    }, 600);
  };

  const handleWhatsApp = () => {
    playTactileClick();
    const message = formatQualityWhatsAppMessage(job, inspection);
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
      const itemRows = QUALITY_CHECK_ITEMS.map((def) => {
        const res = inspection.items[def.id];
        return {
          id: def.id,
          labelFr: def.labelFr,
          category: def.category,
          descriptionFr: def.descriptionFr,
          standardToleranceFr: def.standardToleranceFr,
          status: res ? res.status : 'conforme',
        };
      });

      await generateQualityControlSheetPdf({
        jobId: job.id,
        clientName: job.clientName,
        clientPhone: job.clientPhone,
        wilaya: job.wilaya,
        description: job.description,
        itemCount: job.itemCount,
        dueDate: job.dueDate,
        inspectorName: inspection.inspectorName || 'Chef d Atelier',
        inspectedAt: inspection.inspectedAt,
        overallNotes: inspection.overallNotes,
        items: itemRows,
        scorePercentage: score.percentage,
        isApproved: score.isFullyCompliant,
      });
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-xs">
      <div
        className={`w-full max-w-lg rounded-t-3xl sm:rounded-3xl border shadow-2xl overflow-hidden flex flex-col max-h-[92vh] ${
          isLight ? 'bg-white border-slate-200' : 'bg-[#0B0F19] border-white/10'
        }`}
      >
        {/* Modal Header */}
        <div className="p-4 border-b border-black/5 dark:border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className={`text-sm font-bold font-mono ${isLight ? 'text-slate-900' : 'text-white'}`}>
                Contrôle Qualité & Sortie Atelier
              </h2>
              <span className="text-[11px] font-mono text-zinc-500">
                {job.id} • {job.clientName} ({job.wilaya})
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className={`p-2 rounded-xl border cursor-pointer ${
              isLight
                ? 'bg-slate-100 border-slate-200 text-slate-500 hover:bg-slate-200'
                : 'bg-white/5 border-white/10 text-zinc-400 hover:bg-white/10'
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body: Scrollable */}
        <div className="p-4 overflow-y-auto space-y-4 font-mono text-xs">
          {/* Score & Compliance Progress Card */}
          <div
            className={`p-3 rounded-2xl border space-y-2 ${
              score.isFullyCompliant
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs flex items-center gap-1.5">
                {score.isFullyCompliant ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                )}
                <span>
                  {score.isFullyCompliant
                    ? 'Conformité Totale • Sortie Autorisée'
                    : 'Ajustements Requis Avant Chargement'}
                </span>
              </span>
              <span className="font-black text-sm">{score.percentage}%</span>
            </div>

            {/* Progress bar */}
            <div className="w-full h-1.5 rounded-full bg-black/20 dark:bg-white/10 overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  score.isFullyCompliant ? 'bg-emerald-500' : 'bg-amber-500'
                }`}
                style={{ width: `${score.percentage}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[10px] opacity-80 pt-0.5">
              <span>{score.conformeCount} conformes du premier coup</span>
              {score.corrigeCount > 0 && <span>{score.corrigeCount} ajustés</span>}
              <span>{score.totalActive} points audités</span>
            </div>
          </div>

          {/* Inspector & Date Row */}
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label className="text-[10px] text-zinc-500 block">Chef d Atelier / Inspecteur</label>
              <input
                type="text"
                value={inspection.inspectorName}
                onChange={(e) => setInspection((prev) => ({ ...prev, inspectorName: e.target.value }))}
                className={`w-full p-2 rounded-xl border text-xs font-mono min-h-[40px] ${
                  isLight ? 'bg-slate-50 border-slate-200 text-slate-800' : 'bg-black/30 border-white/10 text-white'
                }`}
                placeholder="Nom du Maalem"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] text-zinc-500 block">Date d inspection</label>
              <input
                type="date"
                value={inspection.inspectedAt}
                onChange={(e) => setInspection((prev) => ({ ...prev, inspectedAt: e.target.value }))}
                className={`w-full p-2 rounded-xl border text-xs font-mono min-h-[40px] ${
                  isLight ? 'bg-slate-50 border-slate-200 text-slate-800' : 'bg-black/30 border-white/10 text-white'
                }`}
              />
            </div>
          </div>

          {/* 8 Quality Checklist Points */}
          <div className="space-y-2">
            <span className="text-[10px] text-zinc-400 uppercase tracking-wider block font-bold">
              Grille d Audit Métier (8 Points Clés)
            </span>

            <div className="space-y-2">
              {QUALITY_CHECK_ITEMS.map((item, index) => {
                const currentRes = inspection.items[item.id];
                const currentStatus = currentRes ? currentRes.status : 'conforme';

                return (
                  <div
                    key={item.id}
                    className={`p-2.5 rounded-2xl border space-y-1.5 transition-all ${
                      currentStatus === 'conforme'
                        ? isLight
                          ? 'bg-slate-50/80 border-slate-200'
                          : 'bg-white/5 border-white/10'
                        : currentStatus === 'corrige'
                        ? 'bg-amber-500/10 border-amber-500/30'
                        : isLight
                        ? 'bg-slate-100 border-slate-200 opacity-60'
                        : 'bg-black/40 border-white/5 opacity-50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-0.5 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-bold text-zinc-500">#{index + 1}</span>
                          <span className={`font-bold text-[11px] truncate ${isLight ? 'text-slate-900' : 'text-zinc-200'}`}>
                            {item.labelFr}
                          </span>
                        </div>
                        <p className="text-[10px] text-zinc-500 line-clamp-1">{item.descriptionFr}</p>
                        <span className="text-[9px] text-[#D4AF37] block font-mono">
                          {item.standardToleranceFr}
                        </span>
                      </div>
                    </div>

                    {/* Segmented 3-button status toggle */}
                    <div className="grid grid-cols-3 gap-1 pt-0.5">
                      <button
                        type="button"
                        onClick={() => handleStatusChange(item.id, 'conforme')}
                        className={`py-1.5 px-2 rounded-xl text-[10px] font-bold border transition-all cursor-pointer min-h-[34px] flex items-center justify-center gap-1 ${
                          currentStatus === 'conforme'
                            ? 'bg-emerald-500 text-slate-950 border-emerald-500 shadow-xs'
                            : isLight
                            ? 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                            : 'bg-white/5 border-white/10 text-zinc-400 hover:bg-white/10'
                        }`}
                      >
                        <Check className="w-3 h-3" />
                        <span>Conforme</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleStatusChange(item.id, 'corrige')}
                        className={`py-1.5 px-2 rounded-xl text-[10px] font-bold border transition-all cursor-pointer min-h-[34px] flex items-center justify-center gap-1 ${
                          currentStatus === 'corrige'
                            ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-xs'
                            : isLight
                            ? 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                            : 'bg-white/5 border-white/10 text-zinc-400 hover:bg-white/10'
                        }`}
                      >
                        <AlertTriangle className="w-3 h-3" />
                        <span>Ajusté</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleStatusChange(item.id, 'non_applicable')}
                        className={`py-1.5 px-2 rounded-xl text-[10px] font-bold border transition-all cursor-pointer min-h-[34px] flex items-center justify-center gap-1 ${
                          currentStatus === 'non_applicable'
                            ? isLight
                              ? 'bg-slate-800 text-white border-slate-800'
                              : 'bg-white text-slate-950 border-white'
                            : isLight
                            ? 'bg-white border-slate-200 text-slate-500 hover:bg-slate-100'
                            : 'bg-white/5 border-white/10 text-zinc-500 hover:bg-white/10'
                        }`}
                      >
                        <span>N/A</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Observations & Notes */}
          <div className="space-y-1">
            <label className="text-[10px] text-zinc-500 block">Directives & Notes de Sortie Atelier</label>
            <textarea
              rows={2}
              value={inspection.overallNotes}
              onChange={(e) => setInspection((prev) => ({ ...prev, overallNotes: e.target.value }))}
              className={`w-full p-2 rounded-xl border text-xs font-mono resize-none ${
                isLight ? 'bg-slate-50 border-slate-200 text-slate-800' : 'bg-black/30 border-white/10 text-white'
              }`}
              placeholder="Ex: Équerrage validé, cales d assise en place, prêt pour chargement camionnette."
            />
          </div>
        </div>

        {/* Modal Footer: Action Bar */}
        <div className="p-3 border-t border-black/5 dark:border-white/5 bg-black/5 dark:bg-white/5 flex items-center gap-2 font-mono">
          <button
            type="button"
            onClick={handleWhatsApp}
            className="flex-1 py-2.5 px-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer hover:bg-emerald-500/25 min-h-[44px] active:scale-98 transition-all"
            title="Envoyer l attestation de conformité par WhatsApp"
          >
            <MessageCircle className="w-4 h-4" />
            <span>WhatsApp QA</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadPdf}
            disabled={isGeneratingPdf}
            className={`flex-1 py-2.5 px-2 rounded-xl border font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer min-h-[44px] active:scale-98 transition-all ${
              isLight
                ? 'bg-sky-50 border-sky-300 text-sky-800 hover:bg-sky-100'
                : 'bg-sky-500/15 border-sky-500/30 text-sky-300 hover:bg-sky-500/25'
            }`}
            title="Télécharger la Fiche de Contrôle Qualité officielle (PDF)"
          >
            <FileCheck className="w-4 h-4 text-sky-400" />
            <span>{isGeneratingPdf ? 'Génération...' : 'Fiche QA (PDF)'}</span>
          </button>

          <button
            type="button"
            onClick={handleSave}
            className="py-2.5 px-4 rounded-xl bg-[#D4AF37] text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer hover:brightness-110 min-h-[44px] active:scale-98 transition-all shadow-md"
          >
            <Check className="w-4 h-4" />
            <span>{savedSuccessToast ? 'Enregistré !' : 'Valider'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
