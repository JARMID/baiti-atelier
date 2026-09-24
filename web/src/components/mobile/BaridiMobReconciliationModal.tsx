import React, { useState, useMemo } from 'react';
import {
  X,
  CreditCard,
  Check,
  FileDown,
  MessageCircle,
  Copy,
  Building,
  Banknote,
  Search,
} from 'lucide-react';
import { playTactileClick, playClampSound } from '../../utils/audioFeedback';
import { useConfigStore } from '../../store/configStore';
import {
  getSavedWorkshopBaridiMob,
  saveWorkshopBaridiMob,
  calculateAlgerianCcpKey,
  validateAlgerianRip,
  convertAmountToFrenchWordsDzd,
  convertAmountToArabicWordsDzd,
  formatBaridiMobRip,
  saveBaridiMobTransaction,
  getBaridiMobTransactions,
  formatBaridiMobPaymentInstructionsWhatsApp,
  formatBaridiMobReceiptWhatsApp,
  type BaridiMobAccountDetails,
  type BaridiMobTransactionRecord,
} from '../../utils/baridiMobManager';
import { generatePaymentReceiptPdf } from '../../utils/pdfGenerator';
import type { WorkshopJob } from '../../types/workshop';

export interface BaridiMobReconciliationModalProps {
  isOpen: boolean;
  onClose: () => void;
  job?: WorkshopJob | null;
  onPaymentRecorded?: (updatedDepositDzd: number) => void;
}

function generateFallbackTxRef(): string {
  return `BM-${Date.now().toString().slice(-6)}`;
}

export const BaridiMobReconciliationModal: React.FC<BaridiMobReconciliationModalProps> = ({
  isOpen,
  onClose,
  job,
  onPaymentRecorded,
}) => {
  const { theme } = useConfigStore();
  const isLight = theme === 'light';

  // Segmented tab: 'payment' (Encaisser versement), 'account' (Coordonnées CCP/RIP atelier), 'history' (Historique)
  const [activeTab, setActiveTab] = useState<'payment' | 'account' | 'history'>('payment');

  // Workshop account state
  const [account, setAccount] = useState<BaridiMobAccountDetails>(() => getSavedWorkshopBaridiMob());
  const [accountEdited, setAccountEdited] = useState(false);

  // Payment form state
  const jobRemainingBalance = useMemo(() => {
    if (!job) return 50000;
    return Math.max(0, job.totalAmountDzd - job.depositDzd);
  }, [job]);

  const [amountDzd, setAmountDzd] = useState<number>(() => {
    if (!job) return 50000;
    const remaining = Math.max(0, job.totalAmountDzd - job.depositDzd);
    return remaining > 0 ? (remaining >= 50000 ? 50000 : remaining) : 25000;
  });

  const [paymentMethod, setPaymentMethod] = useState<'baridimob' | 'virement_ccp' | 'especes' | 'cheque'>('baridimob');
  const [transactionRef, setTransactionRef] = useState<string>(() => generateFallbackTxRef());
  const [senderRipLast4, setSenderRipLast4] = useState<string>('8412');
  const [paymentNotes, setPaymentNotes] = useState<string>('');
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Past transactions state
  const [transactions, setTransactions] = useState<BaridiMobTransactionRecord[]>(() => getBaridiMobTransactions());
  const [historySearch, setHistorySearch] = useState('');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Convert current amount to French & Arabic words
  const amountInWords = useMemo(() => {
    return convertAmountToFrenchWordsDzd(amountDzd);
  }, [amountDzd]);

  const amountInWordsAr = useMemo(() => {
    return convertAmountToArabicWordsDzd(amountDzd);
  }, [amountDzd]);

  // Validation of RIP
  const ripValidation = useMemo(() => {
    return validateAlgerianRip(account.rip20Digits);
  }, [account.rip20Digits]);

  // Financial preview
  const newDepositCalculated = (job?.depositDzd || 0) + amountDzd;
  const newBalanceRemaining = Math.max(0, (job?.totalAmountDzd || amountDzd) - newDepositCalculated);

  // Handle CCP account number change and auto-calculate key
  const handleCcpNumberChange = (rawCcp: string) => {
    const cleaned = rawCcp.replace(/\D/g, '');
    const computedKey = calculateAlgerianCcpKey(cleaned);
    setAccount((prev) => {
      const paddedCompte = cleaned.padStart(10, '0');
      const autoRip = `00799999${paddedCompte}${computedKey}`;
      return {
        ...prev,
        ccpNumber: cleaned,
        ccpKey: computedKey,
        rip20Digits: autoRip,
      };
    });
    setAccountEdited(true);
  };

  // Save updated workshop account details
  const handleSaveAccount = (e: React.FormEvent) => {
    e.preventDefault();
    playClampSound();
    saveWorkshopBaridiMob(account);
    setAccountEdited(false);
    showToast('Coordonnées BaridiMob / Algérie Poste enregistrées avec succès.');
  };

  // Copy RIP to clipboard
  const handleCopyRip = () => {
    playTactileClick();
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(account.rip20Digits);
      showToast('Numéro RIP copié dans le presse-papier !');
    }
  };

  // Share payment details to client via WhatsApp
  const handleShareAccountWhatsApp = () => {
    playTactileClick();
    const msg = formatBaridiMobPaymentInstructionsWhatsApp(
      account,
      job?.clientName || 'Client',
      amountDzd,
      job?.id ? `Affaire ${job.id}` : 'Devis Baiti'
    );
    const phone = job?.clientPhone ? job.clientPhone.replace(/\D/g, '') : '';
    const url = phone ? `https://wa.me/${phone}?text=${encodeURIComponent(msg)}` : `https://wa.me/?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
  };

  // Confirm payment registration
  const handleConfirmPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (amountDzd <= 0) return;
    playClampSound();

    const newTx = saveBaridiMobTransaction({
      jobId: job?.id,
      jobTitle: job?.description || 'Lot Menuiserie Chantier',
      clientName: job?.clientName || 'Client Atelier',
      clientPhone: job?.clientPhone,
      amountDzd,
      transactionRef: transactionRef.trim() || generateFallbackTxRef(),
      senderRipLast4: senderRipLast4.trim() || undefined,
      paymentMethod,
      status: 'valide',
      notes: paymentNotes.trim() || undefined,
    });

    setTransactions(getBaridiMobTransactions());
    if (onPaymentRecorded) {
      onPaymentRecorded(newDepositCalculated);
    }

    showToast(`Versement de ${amountDzd.toLocaleString('fr-DZ')} DZD enregistré et validé !`);

    // Propose immediate receipt download or WhatsApp dispatch
    handleDownloadReceiptPdf(newTx);
  };

  // Generate official A4 PDF Receipt
  const handleDownloadReceiptPdf = async (txParam?: BaridiMobTransactionRecord) => {
    playTactileClick();
    setIsGeneratingPdf(true);
    try {
      const todayStr = new Date().toLocaleDateString('fr-DZ');
      const tx = txParam || transactions[0];
      const receiptNumber = tx ? `REC-${tx.transactionRef}` : `REC-${Date.now().toString().slice(-4)}`;

      const methodLabel =
        paymentMethod === 'baridimob'
          ? 'BaridiMob (Algérie Poste)'
          : paymentMethod === 'virement_ccp'
          ? 'Virement de Compte à Compte CCP'
          : paymentMethod === 'especes'
          ? 'Espèces (Cash)'
          : 'Chèque de Banque';

      await generatePaymentReceiptPdf({
        receiptNumber,
        date: todayStr,
        clientName: job?.clientName || 'Client Atelier',
        clientPhone: job?.clientPhone,
        projectTitle: job?.description || 'Lot Menuiserie Chantier',
        amountDzd,
        amountInWordsFr: amountInWords,
        paymentMethodFr: methodLabel,
        transactionRef: transactionRef.trim() || `BM-${Date.now().toString().slice(-6)}`,
        jobTotalDzd: job?.totalAmountDzd || amountDzd,
        depositTotalDzd: newDepositCalculated,
        balanceDzd: newBalanceRemaining,
        issuerName: account.accountHolderName,
        notes: paymentNotes.trim() || undefined,
      });

      showToast('Quittance officielle de versement PDF téléchargée.');
    } catch {
      showToast('Erreur lors de la génération de la quittance PDF.');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // WhatsApp receipt dispatch
  const handleSendReceiptWhatsApp = () => {
    playTactileClick();
    const mockTx: BaridiMobTransactionRecord = {
      id: 'tx_now',
      clientName: job?.clientName || 'Client Atelier',
      clientPhone: job?.clientPhone,
      amountDzd,
      amountInWordsFr: amountInWords,
      transactionRef: transactionRef.trim() || `BM-${Date.now().toString().slice(-6)}`,
      senderRipLast4: senderRipLast4.trim() || undefined,
      date: new Date().toISOString(),
      paymentMethod,
      status: 'valide',
      jobTitle: job?.description,
    };

    const msg = formatBaridiMobReceiptWhatsApp(
      mockTx,
      job?.totalAmountDzd || amountDzd,
      newDepositCalculated
    );

    const phone = job?.clientPhone ? job.clientPhone.replace(/\D/g, '') : '';
    const url = phone ? `https://wa.me/${phone}?text=${encodeURIComponent(msg)}` : `https://wa.me/?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
  };

  // Filtered transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      if (!historySearch.trim()) return true;
      const q = historySearch.toLowerCase();
      return (
        t.clientName.toLowerCase().includes(q) ||
        t.transactionRef.toLowerCase().includes(q) ||
        (t.jobTitle && t.jobTitle.toLowerCase().includes(q))
      );
    });
  }, [transactions, historySearch]);

  if (!isOpen) return null;

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
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
              <CreditCard className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-bold truncate">
                Règlement BaridiMob & Quittance CCP
              </h3>
              <p className="text-[10px] text-zinc-500 truncate">
                {job ? `${job.clientName} • Réf : ${job.id}` : 'Gestion des encaissements et coordonnées bancaires'}
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
              setActiveTab('payment');
            }}
            className={`flex-1 py-2 px-2 rounded-xl text-center font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
              activeTab === 'payment'
                ? 'bg-[#D4AF37] text-slate-950 shadow-sm'
                : isLight
                ? 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                : 'bg-white/5 text-zinc-400 hover:text-white'
            }`}
          >
            <Banknote className="w-3.5 h-3.5" />
            <span>Encaisser Acompte</span>
          </button>

          <button
            type="button"
            onClick={() => {
              playTactileClick();
              setActiveTab('account');
            }}
            className={`flex-1 py-2 px-2 rounded-xl text-center font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
              activeTab === 'account'
                ? 'bg-cyan-500 text-slate-950 shadow-sm'
                : isLight
                ? 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                : 'bg-white/5 text-zinc-400 hover:text-white'
            }`}
          >
            <Building className="w-3.5 h-3.5" />
            <span>Mon RIP / CCP</span>
          </button>

          <button
            type="button"
            onClick={() => {
              playTactileClick();
              setActiveTab('history');
            }}
            className={`py-2 px-3 rounded-xl text-center font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
              activeTab === 'history'
                ? 'bg-emerald-500 text-slate-950 shadow-sm'
                : isLight
                ? 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                : 'bg-white/5 text-zinc-400 hover:text-white'
            }`}
          >
            <span>Historique ({transactions.length})</span>
          </button>
        </div>

        {/* 3. SCROLL AREA */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* TAB 1: RECORD PAYMENT */}
          {activeTab === 'payment' && (
            <form onSubmit={handleConfirmPayment} className="space-y-4">
              {/* Financial Position Banner */}
              {job && (
                <div
                  className={`p-3 rounded-2xl border space-y-2 ${
                    isLight ? 'bg-slate-50 border-slate-200' : 'bg-black/30 border-white/5'
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-zinc-500">Total Commande :</span>
                    <span className="font-bold">{job.totalAmountDzd.toLocaleString('fr-DZ')} DZD</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-zinc-500">Acomptes Déjà Versés :</span>
                    <span className="font-bold text-emerald-400">{job.depositDzd.toLocaleString('fr-DZ')} DZD</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] pt-1 border-t border-black/5 dark:border-white/5">
                    <span className="text-zinc-400 font-bold">Reste à Régler :</span>
                    <span className="font-black text-[#D4AF37]">{jobRemainingBalance.toLocaleString('fr-DZ')} DZD</span>
                  </div>
                </div>
              )}

              {/* Amount Input with Quick Chips */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] text-zinc-400 block font-bold">
                    Montant Encaissé (DZD)
                  </label>
                  {job && (
                    <button
                      type="button"
                      onClick={() => setAmountDzd(jobRemainingBalance)}
                      className="text-[10px] text-[#D4AF37] hover:underline cursor-pointer"
                    >
                      Solde total ({jobRemainingBalance.toLocaleString('fr-DZ')} DA)
                    </button>
                  )}
                </div>

                <input
                  type="number"
                  step="1000"
                  value={amountDzd}
                  onChange={(e) => setAmountDzd(Math.max(0, parseInt(e.target.value) || 0))}
                  className={`w-full p-3 rounded-2xl border text-base font-black ${
                    isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-black/40 border-white/10 text-white'
                  }`}
                />

                {/* Amount in Words Display (FR + AR) */}
                <div className="p-2.5 rounded-xl bg-black/5 dark:bg-black/30 border border-black/5 dark:border-white/5 space-y-1">
                  <div className="text-[10px] text-zinc-400 italic">
                    {amountInWords}
                  </div>
                  <div className="text-[11px] text-[#D4AF37] font-medium text-right" dir="rtl">
                    {amountInWordsAr}
                  </div>
                </div>

                {/* Quick Increment Chips */}
                <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pt-1">
                  {[10000, 25000, 50000, 100000].map((inc) => (
                    <button
                      key={inc}
                      type="button"
                      onClick={() => {
                        playTactileClick();
                        setAmountDzd(inc);
                      }}
                      className={`px-2.5 py-1 rounded-xl border text-[10px] font-bold cursor-pointer transition-all ${
                        amountDzd === inc
                          ? 'bg-[#D4AF37] text-slate-950 border-[#D4AF37]'
                          : isLight
                          ? 'bg-slate-100 border-slate-200 text-slate-700'
                          : 'bg-white/5 border-white/10 text-zinc-300'
                      }`}
                    >
                      {inc.toLocaleString('fr-DZ')} DA
                    </button>
                  ))}
                </div>
              </div>

              {/* Payment Method Selector */}
              <div className="space-y-1.5">
                <label className="text-[10px] text-zinc-400 block font-bold">
                  Mode de Règlement
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  {[
                    { id: 'baridimob', label: 'BaridiMob (Algérie Poste)' },
                    { id: 'virement_ccp', label: 'Virement CCP' },
                    { id: 'especes', label: 'Espèces (Cash)' },
                    { id: 'cheque', label: 'Chèque de Banque' },
                  ].map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => {
                        playTactileClick();
                        setPaymentMethod(m.id as any);
                      }}
                      className={`p-2.5 rounded-xl border text-left font-bold text-[11px] cursor-pointer transition-all ${
                        paymentMethod === m.id
                          ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300 shadow-xs'
                          : isLight
                          ? 'bg-slate-50 border-slate-200 text-slate-600'
                          : 'bg-white/5 border-white/10 text-zinc-400'
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Transaction Ref & Sender Account */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-zinc-400 block mb-0.5">
                    Réf Transaction / Reçu
                  </label>
                  <input
                    type="text"
                    value={transactionRef}
                    onChange={(e) => setTransactionRef(e.target.value)}
                    placeholder="BM-841209"
                    className={`w-full p-2 rounded-xl border ${
                      isLight ? 'bg-white border-slate-300' : 'bg-black/30 border-white/10'
                    }`}
                  />
                </div>

                <div>
                  <label className="text-[10px] text-zinc-400 block mb-0.5">
                    4 derniers chiffres RIP émetteur
                  </label>
                  <input
                    type="text"
                    maxLength={4}
                    value={senderRipLast4}
                    onChange={(e) => setSenderRipLast4(e.target.value.replace(/\D/g, ''))}
                    placeholder="8412"
                    className={`w-full p-2 rounded-xl border ${
                      isLight ? 'bg-white border-slate-300' : 'bg-black/30 border-white/10'
                    }`}
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="text-[10px] text-zinc-400 block mb-0.5">
                  Observations / Note sur le règlement
                </label>
                <input
                  type="text"
                  value={paymentNotes}
                  onChange={(e) => setPaymentNotes(e.target.value)}
                  placeholder="Versement acompte 50% au lancement de la fabrication"
                  className={`w-full p-2 rounded-xl border ${
                    isLight ? 'bg-white border-slate-300' : 'bg-black/30 border-white/10'
                  }`}
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-2 space-y-2">
                <button
                  type="submit"
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-[#C5A880] to-[#D4AF37] text-slate-950 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md hover:brightness-110 active:scale-98 transition-all min-h-[46px]"
                >
                  <Check className="w-4 h-4" />
                  <span>Valider l Encaissement & Générer Quittance</span>
                </button>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleDownloadReceiptPdf()}
                    disabled={isGeneratingPdf}
                    className={`py-2.5 px-2 rounded-xl border font-bold text-[11px] flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 transition-all min-h-[42px] ${
                      isLight
                        ? 'bg-white border-slate-300 text-slate-800 hover:bg-slate-100'
                        : 'bg-white/5 border-white/10 text-zinc-200 hover:bg-white/10'
                    }`}
                  >
                    <FileDown className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                    <span className="truncate">{isGeneratingPdf ? 'PDF...' : 'Quittance PDF A4'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleSendReceiptWhatsApp}
                    className="py-2.5 px-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-bold text-[11px] flex items-center justify-center gap-1.5 cursor-pointer hover:bg-emerald-500/25 active:scale-95 transition-all min-h-[42px]"
                  >
                    <MessageCircle className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">Reçu WhatsApp</span>
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* TAB 2: WORKSHOP BARIDIMOB / CCP CREDENTIALS */}
          {activeTab === 'account' && (
            <form onSubmit={handleSaveAccount} className="space-y-4">
              <div className="p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-[11px] space-y-1">
                <span className="font-bold block">Coordonnées Algérie Poste de l Atelier :</span>
                <p className="text-[10px] text-cyan-300/80 leading-relaxed">
                  Ces coordonnées sont transmises aux clients pour effectuer leurs virements BaridiMob d acompte. La clé CCP et le RIP à 20 chiffres sont automatiquement calculés et contrôlés.
                </p>
              </div>

              <div>
                <label className="text-[10px] text-zinc-400 block mb-0.5">
                  Nom du Titulaire du Compte
                </label>
                <input
                  type="text"
                  value={account.accountHolderName}
                  onChange={(e) => {
                    setAccount((prev) => ({ ...prev, accountHolderName: e.target.value }));
                    setAccountEdited(true);
                  }}
                  className={`w-full p-2.5 rounded-xl border ${
                    isLight ? 'bg-white border-slate-300' : 'bg-black/30 border-white/10'
                  }`}
                />
              </div>

              <div className="grid grid-cols-12 gap-2">
                <div className="col-span-8">
                  <label className="text-[10px] text-zinc-400 block mb-0.5">
                    Numéro CCP (sans la clé)
                  </label>
                  <input
                    type="text"
                    value={account.ccpNumber}
                    onChange={(e) => handleCcpNumberChange(e.target.value)}
                    placeholder="0012345678"
                    className={`w-full p-2.5 rounded-xl border font-bold ${
                      isLight ? 'bg-white border-slate-300' : 'bg-black/30 border-white/10'
                    }`}
                  />
                </div>

                <div className="col-span-4">
                  <label className="text-[10px] text-zinc-400 block mb-0.5">
                    Clé CCP
                  </label>
                  <input
                    type="text"
                    readOnly
                    value={account.ccpKey}
                    className="w-full p-2.5 rounded-xl border bg-black/10 dark:bg-black/40 text-[#D4AF37] font-black text-center"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-0.5">
                  <label className="text-[10px] text-zinc-400 block font-bold">
                    Numéro RIP Algérie Poste (20 chiffres)
                  </label>
                  <button
                    type="button"
                    onClick={handleCopyRip}
                    className="text-[10px] text-cyan-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Copy className="w-3 h-3" />
                    <span>Copier RIP</span>
                  </button>
                </div>

                <input
                  type="text"
                  value={account.rip20Digits}
                  onChange={(e) => {
                    setAccount((prev) => ({ ...prev, rip20Digits: e.target.value.replace(/\D/g, '') }));
                    setAccountEdited(true);
                  }}
                  className={`w-full p-2.5 rounded-xl border font-mono font-bold tracking-wider ${
                    ripValidation.isValid
                      ? isLight
                        ? 'bg-emerald-50/70 border-emerald-300 text-emerald-950'
                        : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                      : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                  }`}
                />
                <span className="text-[9px] text-zinc-500 block mt-1">
                  {ripValidation.messageFr}
                </span>

                {account.rip20Digits.length === 20 && (
                  <div className="mt-2 p-2.5 rounded-xl bg-black/5 dark:bg-black/30 border border-black/5 dark:border-white/5 flex items-center justify-between">
                    <div>
                      <span className="text-[9px] text-zinc-500 uppercase font-mono block">RIP Formaté (Algérie Poste)</span>
                      <span className="text-xs font-mono font-bold text-[#D4AF37] tracking-wider">
                        {formatBaridiMobRip(account.rip20Digits)}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={handleCopyRip}
                      className="px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-[10px] text-zinc-300 flex items-center gap-1 cursor-pointer transition-all"
                    >
                      <Copy className="w-3 h-3 text-[#D4AF37]" />
                      <span>Copier</span>
                    </button>
                  </div>
                )}
              </div>

              <div>
                <label className="text-[10px] text-zinc-400 block mb-0.5">
                  Téléphone Associé au Compte
                </label>
                <input
                  type="text"
                  value={account.phoneNumber || ''}
                  onChange={(e) => {
                    setAccount((prev) => ({ ...prev, phoneNumber: e.target.value }));
                    setAccountEdited(true);
                  }}
                  placeholder="0550 12 34 56"
                  className={`w-full p-2.5 rounded-xl border ${
                    isLight ? 'bg-white border-slate-300' : 'bg-black/30 border-white/10'
                  }`}
                />
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  type="submit"
                  disabled={!accountEdited}
                  className="py-3 px-3 rounded-2xl bg-[#D4AF37] text-slate-950 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer hover:brightness-110 active:scale-98 transition-all disabled:opacity-50 min-h-[46px]"
                >
                  <Check className="w-4 h-4" />
                  <span>Enregistrer Coordonnées</span>
                </button>

                <button
                  type="button"
                  onClick={handleShareAccountWhatsApp}
                  className="py-3 px-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer hover:bg-emerald-500/25 active:scale-98 transition-all min-h-[46px]"
                >
                  <MessageCircle className="w-4 h-4 shrink-0" />
                  <span className="truncate">Envoyer RIP WhatsApp</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: TRANSACTION HISTORY */}
          {activeTab === 'history' && (
            <div className="space-y-3">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input
                  type="text"
                  placeholder="Rechercher par client, référence..."
                  value={historySearch}
                  onChange={(e) => setHistorySearch(e.target.value)}
                  className={`w-full pl-9 pr-3 py-2 rounded-xl border text-xs ${
                    isLight ? 'bg-white border-slate-300' : 'bg-black/30 border-white/10'
                  }`}
                />
              </div>

              {filteredTransactions.length === 0 ? (
                <div
                  className={`p-8 rounded-2xl border text-center space-y-2 ${
                    isLight ? 'bg-slate-50 border-slate-200' : 'bg-black/20 border-white/5'
                  }`}
                >
                  <CreditCard className="w-8 h-8 mx-auto text-zinc-500 opacity-40" />
                  <p className="text-zinc-400">Aucune transaction enregistrée.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredTransactions.map((tx) => (
                    <div
                      key={tx.id}
                      className={`p-3 rounded-2xl border flex items-center justify-between text-xs ${
                        isLight ? 'bg-slate-50 border-slate-200' : 'bg-black/25 border-white/5'
                      }`}
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span className="font-bold truncate">{tx.clientName}</span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#D4AF37]/20 text-[#D4AF37] font-bold">
                            {tx.transactionRef}
                          </span>
                        </div>
                        <p className="text-[10px] text-zinc-500 truncate">
                          {new Date(tx.date).toLocaleDateString('fr-DZ')} • {tx.jobTitle || 'Commande Atelier'}
                        </p>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="text-sm font-black text-emerald-400">
                          +{tx.amountDzd.toLocaleString('fr-DZ')} DZD
                        </div>
                        <span className="text-[9px] text-zinc-500 uppercase">
                          {tx.paymentMethod}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* 4. TOAST */}
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
