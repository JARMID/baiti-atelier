import React, { useState } from 'react';
import {
  X,
  PackageCheck,
  AlertTriangle,
  Check,
  FileDown,
  MessageCircle,
  Warehouse,
  Boxes,
} from 'lucide-react';
import { playTactileClick, playClampSound } from '../../utils/audioFeedback';
import { useConfigStore } from '../../store/configStore';
import {
  executeStoreRequisitionDeduction,
  formatStoreRequisitionWhatsAppMessage,
  type CuttingBatchRequisitionSummary,
} from '../../utils/cuttingMaterialRequisition';
import { generateStoreRequisitionPdf } from '../../utils/pdfGenerator';

export interface CuttingStockPreCheckModalProps {
  isOpen: boolean;
  onClose: () => void;
  summary: CuttingBatchRequisitionSummary;
  projectTitle?: string;
  clientName?: string;
  onRequisitionCompleted?: () => void;
}

export const CuttingStockPreCheckModal: React.FC<CuttingStockPreCheckModalProps> = ({
  isOpen,
  onClose,
  summary,
  projectTitle = 'Lot Menuiserie Chantier',
  clientName = 'Client Atelier',
  onRequisitionCompleted,
}) => {
  const { theme } = useConfigStore();
  const isLight = theme === 'light';

  const [sawOperator, setSawOperator] = useState('Opérateur Scie Atelier');
  const [storekeeper, setStorekeeper] = useState('Magasinier Atelier');
  const [isDeducted, setIsDeducted] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  if (!isOpen) return null;

  // Execute actual stock deduction
  const handleConfirmDeduction = () => {
    playClampSound();
    const result = executeStoreRequisitionDeduction(
      summary.items,
      projectTitle,
      clientName,
      sawOperator,
      storekeeper
    );

    if (result.success) {
      setIsDeducted(true);
      showToast(
        `${result.deductedCount} barre(s) de 6.00m déduite(s) avec succès de l inventaire magasin !`
      );
      if (onRequisitionCompleted) onRequisitionCompleted();
    }
  };

  // Generate and download official PDF
  const handleDownloadPdf = async () => {
    playTactileClick();
    setIsGeneratingPdf(true);
    try {
      const todayStr = new Date().toLocaleDateString('fr-DZ');
      const slipNumber = `BS-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`;

      await generateStoreRequisitionPdf({
        slipNumber,
        date: todayStr,
        projectTitle,
        clientName,
        sawOperator,
        storekeeper,
        totalBars6m: summary.totalRequiredBars,
        items: summary.items.map((item) => ({
          code: item.profileCode,
          name: item.profileName,
          quantity: item.requiredBars6m,
          rackLocation: item.targetRackLocation,
          unitCostDzd: item.unitCostDzd,
          totalCostDzd: item.totalCostDzd,
          isAvailable: item.isAvailable,
        })),
      });

      showToast('Bon de sortie matière PDF généré et téléchargé.');
    } catch {
      showToast('Erreur lors de la génération du PDF.');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // Dispatch WhatsApp message to storekeeper
  const handleSendWhatsApp = () => {
    playTactileClick();
    const msg = formatStoreRequisitionWhatsAppMessage(
      summary,
      projectTitle,
      clientName,
      storekeeper
    );
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div
        className={`w-full max-w-xl max-h-[92vh] flex flex-col rounded-t-3xl sm:rounded-3xl border shadow-2xl font-mono text-xs overflow-hidden ${
          isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-[#0B0F19] border-white/10 text-white'
        }`}
      >
        {/* 1. HEADER */}
        <div className="p-4 border-b border-black/10 dark:border-white/10 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-sky-500/20 border border-sky-500/30 flex items-center justify-center text-sky-400 shrink-0">
              <Boxes className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-bold truncate">
                Disponibilité Stock & Sortie Magasin
              </h3>
              <p className="text-[10px] text-zinc-500 truncate">
                Rapprochement des barres 6.00m requises avec l inventaire magasin
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

        {/* 2. OVERALL STATUS BANNER */}
        <div className="p-3 border-b border-black/5 dark:border-white/5 shrink-0">
          {summary.hasShortage ? (
            <div className="p-3 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300 flex items-center gap-2.5 text-xs">
              <AlertTriangle className="w-5 h-5 shrink-0 text-rose-400" />
              <div className="min-w-0">
                <span className="font-bold block">
                  Alerte Rupture : Manque {summary.totalShortageBars} barre(s) en stock !
                </span>
                <span className="text-[10px] text-rose-300/80 block">
                  Vous devez commander des barres supplémentaires avant de pouvoir débiter l intégralité du lot.
                </span>
              </div>
            </div>
          ) : (
            <div className="p-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 flex items-center gap-2.5 text-xs">
              <Check className="w-5 h-5 shrink-0 text-emerald-400" />
              <div className="min-w-0">
                <span className="font-bold block">
                  Stock 100% Conforme & Disponible ({summary.totalRequiredBars} barres de 6.00m)
                </span>
                <span className="text-[10px] text-emerald-300/80 block">
                  Tous les profilés requis sont localisés dans les casiers et prêts au prélèvement.
                </span>
              </div>
            </div>
          )}
        </div>

        {/* 3. CONTENT LIST */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          <div className="flex items-center justify-between text-[11px] font-bold text-zinc-400">
            <span>Détail des Barres à Prélever au Magasin :</span>
            <span className="text-[#D4AF37]">
              Total : {summary.totalEstimatedCostDzd.toLocaleString('fr-DZ')} DZD
            </span>
          </div>

          <div className="space-y-2">
            {summary.items.map((item, idx) => {
              const stockRatio = item.availableInStock > 0
                ? Math.min(100, Math.round((item.requiredBars6m / item.availableInStock) * 100))
                : 100;

              return (
                <div
                  key={idx}
                  className={`p-3 rounded-2xl border space-y-2 transition-all ${
                    !item.isAvailable
                      ? isLight
                        ? 'bg-rose-50/70 border-rose-300'
                        : 'bg-rose-500/10 border-rose-500/30'
                      : isLight
                      ? 'bg-slate-50 border-slate-200'
                      : 'bg-black/30 border-white/5'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                          {item.profileCode}
                        </span>
                        <span className="px-1.5 py-0.5 rounded text-[10px] bg-amber-500/15 text-amber-400 border border-amber-500/30 font-bold flex items-center gap-1">
                          <Warehouse className="w-3 h-3" />
                          <span>{item.targetRackLocation}</span>
                        </span>
                      </div>

                      <h4
                        className={`text-xs font-bold truncate ${
                          isLight ? 'text-slate-900' : 'text-white'
                        }`}
                      >
                        {item.profileName}
                      </h4>
                      <p className="text-[10px] text-zinc-500">
                        P.U. indicatif : {item.unitCostDzd.toLocaleString('fr-DZ')} DZD / barre
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-sm font-black text-cyan-400">
                        {item.requiredBars6m} barre(s) 6m
                      </div>
                      <span
                        className={`text-[10px] font-bold block ${
                          item.isAvailable ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {item.availableInStock} en stock{' '}
                        {item.isAvailable ? '✓' : `(Manque ${item.shortageQuantity})`}
                      </span>
                    </div>
                  </div>

                  {/* Stock reservation visual progress */}
                  <div className="space-y-0.5">
                    <div className="w-full h-1.5 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          !item.isAvailable
                            ? 'bg-rose-500'
                            : stockRatio > 80
                            ? 'bg-amber-400'
                            : 'bg-emerald-500'
                        }`}
                        style={{ width: `${Math.min(100, stockRatio)}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[9px] text-zinc-500">
                      <span>Prélèvement : {item.requiredBars6m} barres</span>
                      <span>Stock restant après débit : {Math.max(0, item.availableInStock - item.requiredBars6m)} barres</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Participants Inputs Container */}
          <div
            className={`p-3 rounded-2xl border space-y-2 ${
              isLight ? 'bg-slate-50 border-slate-200' : 'bg-black/20 border-white/5'
            }`}
          >
            <span className="text-[10px] font-bold text-zinc-400 block">
              Signataires du Bon de Sortie :
            </span>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[9px] text-zinc-500 block mb-0.5">Demandeur Scie</label>
                <input
                  type="text"
                  value={sawOperator}
                  onChange={(e) => setSawOperator(e.target.value)}
                  className={`w-full p-2 rounded-xl border text-[11px] ${
                    isLight ? 'bg-white border-slate-300' : 'bg-black/30 border-white/10'
                  }`}
                />
              </div>

              <div>
                <label className="text-[9px] text-zinc-500 block mb-0.5">Magasinier</label>
                <input
                  type="text"
                  value={storekeeper}
                  onChange={(e) => setStorekeeper(e.target.value)}
                  className={`w-full p-2 rounded-xl border text-[11px] ${
                    isLight ? 'bg-white border-slate-300' : 'bg-black/30 border-white/10'
                  }`}
                />
              </div>
            </div>
          </div>
        </div>

        {/* 4. ACTION FOOTER */}
        <div className="p-3 border-t border-black/10 dark:border-white/10 space-y-2 shrink-0 bg-black/5 dark:bg-white/5">
          {isDeducted ? (
            <div className="p-2.5 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-center font-bold text-xs flex items-center justify-center gap-2">
              <Check className="w-4 h-4" />
              <span>Barres Déduites du Stock Magasin avec Succès !</span>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleConfirmDeduction}
              className="w-full py-3 rounded-2xl bg-[#D4AF37] text-slate-950 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer hover:brightness-110 active:scale-98 transition-all min-h-[46px] shadow-md"
            >
              <PackageCheck className="w-4 h-4" />
              <span>Valider la Sortie du Stock (-{summary.totalRequiredBars} barres)</span>
            </button>
          )}

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={isGeneratingPdf}
              className={`py-2.5 px-2 rounded-xl border font-bold text-[11px] flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 transition-all min-h-[42px] ${
                isLight
                  ? 'bg-white border-slate-300 text-slate-800 hover:bg-slate-100'
                  : 'bg-white/5 border-white/10 text-zinc-200 hover:bg-white/10'
              }`}
            >
              <FileDown className="w-3.5 h-3.5 text-sky-400 shrink-0" />
              <span className="truncate">{isGeneratingPdf ? 'Génération...' : 'Bon Sortie PDF'}</span>
            </button>

            <button
              type="button"
              onClick={handleSendWhatsApp}
              className="py-2.5 px-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-bold text-[11px] flex items-center justify-center gap-1.5 cursor-pointer hover:bg-emerald-500/25 active:scale-95 transition-all min-h-[42px]"
            >
              <MessageCircle className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">WhatsApp Magasin</span>
            </button>
          </div>
        </div>

        {/* 5. FLOATING TOAST */}
        {toastMessage && (
          <div className="p-2.5 bg-emerald-500/20 border-t border-emerald-500/30 text-emerald-400 flex items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2">
              <Check className="w-3.5 h-3.5 shrink-0" />
              <span>{toastMessage}</span>
            </div>
            <button
              type="button"
              onClick={() => setToastMessage(null)}
              className="text-zinc-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
