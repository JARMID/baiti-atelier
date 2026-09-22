import React, { useState, useEffect } from 'react';
import {
  isTauriDesktop,
  listOfflineQuotes,
  saveOfflineQuote,
  deleteOfflineQuote,
  loadOfflineQuote,
  getWorkshopSystemInfo,
  type OfflineQuoteSummary,
  type OfflineQuote,
  type WorkshopSystemInfo,
} from '../../services/desktopBridge';
import { useConfigStore } from '../../store/configStore';
import {
  HardDrive,
  X,
  Plus,
  Trash2,
  Upload,
  Download,
  FolderSync,
  Cpu,
  CheckCircle2,
  CloudUpload,
  FileDown,
  MessageCircle,
} from 'lucide-react';
import { generateClientDevisPdf } from '../../utils/pdfGenerator';
import {
  exportLocalDatabaseToJson,
  importLocalDatabaseFromJson,
} from '../../services/offlineStorage';
import { syncOfflineQuotesToCloud } from '../../utils/supabaseClient';
import { playTactileClick, playClampSound, playSwitchSound } from '../../utils/audioFeedback';

interface OfflineQuotesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OfflineQuotesModal: React.FC<OfflineQuotesModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { config, cost, selectedWilaya, applyPreset, theme, language } = useConfigStore();
  const isLight = theme === 'light';
  const isRtl = language === 'ar';
  const [quotes, setQuotes] = useState<OfflineQuoteSummary[]>([]);
  const [systemInfo, setSystemInfo] = useState<WorkshopSystemInfo | null>(null);
  const [newClientName, setNewClientName] = useState('');
  const [newClientPhone, setNewClientPhone] = useState('');
  const [newQuoteTitle, setNewQuoteTitle] = useState('Menuiserie Chantier');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const fetchQuotes = async () => {
    try {
      const list = await listOfflineQuotes();
      setQuotes(list);
      const info = await getWorkshopSystemInfo();
      setSystemInfo(info);
    } catch (err) {
      console.error('Error listing offline quotes:', err);
    }
  };

  const handleSyncCloud = async () => {
    if (quotes.length === 0) return;
    setIsSyncing(true);
    setSyncMessage(null);
    try {
      const fullQuotes: OfflineQuote[] = [];
      for (const q of quotes) {
        const full = await loadOfflineQuote(q.id);
        if (full) fullQuotes.push(full);
      }
      const result = await syncOfflineQuotesToCloud(fullQuotes);
      const msg =
        language === 'ar'
          ? `تمت مزامنة ${result.synced} مقايسة بنجاح مع السحابة.`
          : language === 'en'
          ? `${result.synced} quotes synced successfully to the Cloud.`
          : `${result.synced} devis synchronisés avec succès vers le Cloud.`;
      setSyncMessage(msg);
      setTimeout(() => setSyncMessage(null), 5000);
    } catch (err) {
      console.error('Sync error:', err);
      const errMsg =
        language === 'ar'
          ? 'خطأ في المزامنة مع السحابة.'
          : language === 'en'
          ? 'Cloud synchronization error.'
          : 'Erreur de synchronisation.';
      setSyncMessage(errMsg);
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    let isSubscribed = true;
    void (async () => {
      try {
        const list = await listOfflineQuotes();
        const info = await getWorkshopSystemInfo();
        if (isSubscribed) {
          setQuotes(list);
          setSystemInfo(info);
        }
      } catch (err) {
        console.error('Error listing offline quotes:', err);
      }
    })();
    return () => {
      isSubscribed = false;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSaveCurrentQuote = async (e: React.FormEvent) => {
    e.preventDefault();
    const id = `QTE-${Date.now().toString().slice(-6)}`;
    const totalTtc = Math.round(cost.totalEstimatedDzd * 1.19);
    const newQuote: OfflineQuote = {
      id,
      title: newQuoteTitle || 'Menuiserie Chantier',
      trade_type: 'aluminum',
      client_name: newClientName || 'Client Particulier',
      client_phone: newClientPhone || '05 50 12 34 56',
      client_wilaya: selectedWilaya,
      total_ht_dzd: cost.totalEstimatedDzd,
      total_ttc_dzd: totalTtc,
      deposit_required_dzd: Math.round(totalTtc * 0.4),
      created_at: new Date().toISOString(),
      payload_json: JSON.stringify({ config, cost, selectedWilaya }),
    };

    await saveOfflineQuote(newQuote);
    playClampSound();
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
    setNewClientName('');
    setNewClientPhone('');
    fetchQuotes();
  };

  const handleDeleteQuote = async (id: string) => {
    const confirmPrompt =
      language === 'ar'
        ? `هل تؤكد حذف المقايسة ${id} ؟`
        : language === 'en'
        ? `Confirm deleting quote ${id}?`
        : `Confirmer la suppression du devis ${id} ?`;
    if (confirm(confirmPrompt)) {
      playSwitchSound();
      await deleteOfflineQuote(id);
      fetchQuotes();
    }
  };

  const handleRestoreQuote = async (id: string) => {
    playTactileClick();
    const q = await loadOfflineQuote(id);
    if (q) {
      try {
        const payload = JSON.parse(q.payload_json);
        if (payload.config) {
          applyPreset(payload.config);
          onClose();
        }
      } catch (err) {
        console.error('Error restoring quote:', err);
      }
    }
  };

  const handleDownloadQuotePdf = async (id: string) => {
    playTactileClick();
    const q = await loadOfflineQuote(id);
    if (!q) return;
    try {
      const payload = JSON.parse(q.payload_json);
      if (payload.config && payload.cost) {
        await generateClientDevisPdf(
          payload.config,
          payload.cost,
          q.client_name,
          q.client_phone || '05 50 00 00 00',
          q.client_wilaya || 'Alger'
        );
      }
    } catch (err) {
      console.error('Failed to parse quote payload for PDF', err);
    }
  };

  const handleShareQuoteWhatsApp = async (qSummary: OfflineQuoteSummary) => {
    playTactileClick();
    const q = await loadOfflineQuote(qSummary.id);
    const clientPhone = q?.client_phone || '';
    const cleanPhone = clientPhone.replace(/\D/g, '');
    const waPhone = cleanPhone.startsWith('0') ? '213' + cleanPhone.slice(1) : cleanPhone;
    const msg = `*DEVIS BAITI ATELIER N° ${qSummary.id}*\nClient : ${qSummary.client_name}\nWilaya : ${qSummary.client_wilaya}\nMontant Total : ${qSummary.total_ttc_dzd.toLocaleString('fr-DZ')} DZD\n\nConçu avec Baiti Atelier (58 Wilayas Algérie)\nhttps://web-two-tan-31.vercel.app`;
    window.open(`https://wa.me/${waPhone}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const handleExportBackup = async () => {
    playTactileClick();
    try {
      const jsonStr = await exportLocalDatabaseToJson();
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const dl = document.createElement('a');
      dl.setAttribute('href', url);
      dl.setAttribute('download', `sauvegarde_baiti_atelier_${new Date().toISOString().slice(0, 10)}.json`);
      dl.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export error:', err);
    }
  };

  const handleImportBackup = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    playTactileClick();
    try {
      const text = await file.text();
      const result = await importLocalDatabaseFromJson(text);
      if (result.success) {
        setSyncMessage(`${result.importedCount} devis restaurés avec succès dans la base locale.`);
        await fetchQuotes();
      } else {
        setSyncMessage('Erreur lors de la lecture du fichier de sauvegarde.');
      }
    } catch (err) {
      console.error('Import error:', err);
      setSyncMessage('Format de fichier de sauvegarde non reconnu.');
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
      setTimeout(() => setSyncMessage(null), 5000);
    }
  };

  const isNative = isTauriDesktop();

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      <div
        className={`border rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 transition-colors ${
          isLight
            ? 'bg-white border-slate-200 text-slate-900'
            : 'bg-[#0D121F] border-white/10 text-white'
        }`}
      >
        {/* Hidden File Input for JSON Backup Import */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleImportBackup}
          accept=".json,application/json"
          className="hidden"
        />

        {/* Modal Header */}
        <div
          className={`p-6 border-b flex items-center justify-between transition-colors ${
            isLight ? 'border-slate-200 bg-slate-50/80' : 'border-white/10 bg-transparent'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
              <HardDrive className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className={`text-xl font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  {language === 'ar'
                    ? 'سجل المقايسات دون إنترنت'
                    : language === 'en'
                    ? 'Offline Quotes Ledger'
                    : 'Carnet de Devis Hors-Ligne'}
                </h3>
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                    isNative
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                      : 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30'
                  }`}
                >
                  {isNative
                    ? language === 'ar'
                      ? 'تطبيق مكتبي أصلي (القرص الصلب)'
                      : language === 'en'
                      ? 'Native Desktop (Hard Drive)'
                      : 'Tauri V2 Natif (Disque Dur)'
                    : language === 'ar'
                    ? 'تخزين محلي IndexedDB'
                    : language === 'en'
                    ? 'Local IndexedDB'
                    : 'IndexedDB Hors-Ligne'}
                </span>
              </div>
              <p className={`text-xs mt-0.5 ${isLight ? 'text-slate-600' : 'text-zinc-400'}`}>
                {language === 'ar'
                  ? 'حفظ محلي فوري مضمون دون اتصال بالإنترنت لورشات العمل.'
                  : language === 'en'
                  ? 'Guaranteed local disk storage without internet for workshop terminals.'
                  : "Sauvegarde locale garantie sans connexion internet pour les postes d'atelier."}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                playTactileClick();
                handleSyncCloud();
              }}
              disabled={isSyncing || quotes.length === 0}
              className={`p-2 rounded-xl text-xs font-mono flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-40 btn-press ${
                isLight
                  ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-300'
                  : 'text-emerald-300 hover:text-white bg-emerald-500/10 border border-emerald-500/30'
              }`}
              title={
                language === 'ar'
                  ? 'مزامنة مع السحابة'
                  : language === 'en'
                  ? 'Sync to Cloud'
                  : 'Synchroniser vers le Cloud'
              }
            >
              <CloudUpload className={`w-4 h-4 text-emerald-500 ${isSyncing ? 'animate-bounce' : ''}`} />
              <span className="hidden sm:inline">
                {isSyncing
                  ? language === 'ar'
                    ? 'جاري المزامنة...'
                    : language === 'en'
                    ? 'Syncing...'
                    : 'Synchronisation...'
                  : language === 'ar'
                  ? 'مزامنة سحابية'
                  : language === 'en'
                  ? 'Cloud Sync'
                  : 'Sync Cloud'}
              </span>
            </button>

            <button
              onClick={() => {
                playTactileClick();
                fileInputRef.current?.click();
              }}
              className={`p-2 rounded-xl text-xs font-mono flex items-center gap-1.5 transition-colors cursor-pointer btn-press ${
                isLight
                  ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300'
                  : 'text-zinc-300 hover:text-white bg-white/5 border border-white/10'
              }`}
              title="Restaurer sauvegarde JSON"
            >
              <Upload className="w-4 h-4 text-sky-500" />
              <span className="hidden sm:inline">Import JSON</span>
            </button>

            <button
              onClick={() => {
                playTactileClick();
                handleExportBackup();
              }}
              className={`p-2 rounded-xl text-xs font-mono flex items-center gap-1.5 transition-colors cursor-pointer btn-press ${
                isLight
                  ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300'
                  : 'text-zinc-300 hover:text-white bg-white/5 border border-white/10'
              }`}
              title="Exporter sauvegarde JSON"
            >
              <Download className="w-4 h-4 text-amber-500" />
              <span className="hidden sm:inline">Export JSON</span>
            </button>

            <button
              onClick={() => {
                playTactileClick();
                onClose();
              }}
              className={`p-2 rounded-xl transition-colors cursor-pointer btn-press ${
                isLight
                  ? 'bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-300'
                  : 'text-zinc-400 hover:text-white bg-white/5 border border-white/10'
              }`}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 flex flex-col gap-6">
          {/* Cloud Sync Status Notification */}
          {syncMessage && (
            <div
              className={`p-3 rounded-2xl border text-xs font-mono flex items-center gap-2 ${
                isLight
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                  : 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
              }`}
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>{syncMessage}</span>
            </div>
          )}

          {/* Hardware Telemetry Bar */}
          {systemInfo && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div
                className={`p-3 rounded-2xl border flex items-center gap-2.5 ${
                  isLight ? 'bg-slate-50 border-slate-200' : 'bg-white/5 border-white/5'
                }`}
              >
                <Cpu className="w-4 h-4 text-emerald-500" />
                <div>
                  <span className={`text-[10px] font-mono block ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
                    {language === 'ar' ? 'نظام الورشة' : language === 'en' ? 'WORKSHOP OS' : 'OS ATELIER'}
                  </span>
                  <span className={`text-xs font-bold uppercase ${isLight ? 'text-slate-900' : 'text-white'}`}>
                    {systemInfo.os_family}
                  </span>
                </div>
              </div>

              <div
                className={`p-3 rounded-2xl border flex items-center gap-2.5 ${
                  isLight ? 'bg-slate-50 border-slate-200' : 'bg-white/5 border-white/5'
                }`}
              >
                <FolderSync className="w-4 h-4 text-blue-500" />
                <div>
                  <span className={`text-[10px] font-mono block ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
                    {language === 'ar' ? 'التخزين' : language === 'en' ? 'STORAGE' : 'STOCKAGE DISQUE'}
                  </span>
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    {language === 'ar' ? 'نشط ودائم' : language === 'en' ? 'Active & Persistent' : 'Actif & Persistant'}
                  </span>
                </div>
              </div>

              <div
                className={`p-3 rounded-2xl border flex items-center gap-2.5 ${
                  isLight ? 'bg-slate-50 border-slate-200' : 'bg-white/5 border-white/5'
                }`}
              >
                <CheckCircle2 className="w-4 h-4 text-amber-500" />
                <div>
                  <span className={`text-[10px] font-mono block ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
                    {language === 'ar' ? 'إصدار البرنامج' : language === 'en' ? 'APP VERSION' : 'VERSION APP'}
                  </span>
                  <span className={`text-xs font-bold font-mono ${isLight ? 'text-slate-900' : 'text-white'}`}>
                    v{systemInfo.app_version}
                  </span>
                </div>
              </div>

              <div
                className={`p-3 rounded-2xl border flex items-center gap-2.5 ${
                  isLight ? 'bg-slate-50 border-slate-200' : 'bg-white/5 border-white/5'
                }`}
              >
                <HardDrive className="w-4 h-4 text-purple-500" />
                <div>
                  <span className={`text-[10px] font-mono block ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
                    {language === 'ar' ? 'المقايسات' : language === 'en' ? 'TOTAL QUOTES' : 'TOTAL DEVIS'}
                  </span>
                  <span className={`text-xs font-bold font-mono ${isLight ? 'text-slate-900' : 'text-white'}`}>
                    {quotes.length}{' '}
                    {language === 'ar'
                      ? 'محفوظة'
                      : language === 'en'
                      ? 'saved'
                      : 'en mémoire'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Quick Save Current Quote Form */}
          <form
            onSubmit={handleSaveCurrentQuote}
            className={`p-4 rounded-2xl border flex flex-col gap-3 ${
              isLight ? 'bg-slate-50/70 border-slate-200' : 'bg-white/5 border-white/10'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className={`text-xs font-bold uppercase tracking-wider font-mono ${isLight ? 'text-slate-800' : 'text-white'}`}>
                {language === 'ar'
                  ? 'حفظ المقايسة الحالية على القرص الصلب'
                  : language === 'en'
                  ? 'Save Current Quote to Local Disk'
                  : 'Enregistrer le Devis Actuel sur Disque'}
              </span>
              <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                {Math.round(cost.totalEstimatedDzd * 1.19).toLocaleString('fr-DZ')} DZD TTC
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className={`block text-[11px] font-mono mb-1 ${isLight ? 'text-slate-600' : 'text-zinc-400'}`}>
                  {language === 'ar' ? 'عنوان المشروع' : language === 'en' ? 'Project Title' : 'Titre du Projet'}
                </label>
                <input
                  type="text"
                  value={newQuoteTitle}
                  onChange={(e) => setNewQuoteTitle(e.target.value)}
                  placeholder={
                    language === 'ar'
                      ? 'مثال: فيلا درارية الطابق الأول'
                      : language === 'en'
                      ? 'e.g. Villa 1st Floor'
                      : 'Ex: Villa Draria 1er étage'
                  }
                  className={`w-full rounded-xl px-3 py-2 text-xs border focus:outline-none transition-colors ${
                    isLight
                      ? 'bg-white border-slate-300 text-slate-900 focus:border-amber-500'
                      : 'bg-[#080A0E] border-white/10 text-zinc-200 focus:border-amber-400'
                  }`}
                  required
                />
              </div>

              <div>
                <label className={`block text-[11px] font-mono mb-1 ${isLight ? 'text-slate-600' : 'text-zinc-400'}`}>
                  {language === 'ar' ? 'اسم الزبون' : language === 'en' ? 'Client Name' : 'Nom Client'}
                </label>
                <input
                  type="text"
                  value={newClientName}
                  onChange={(e) => setNewClientName(e.target.value)}
                  placeholder={
                    language === 'ar'
                      ? 'مثال: السيد بن علي'
                      : language === 'en'
                      ? 'e.g. Mr. Benali'
                      : 'Ex: M. Benali'
                  }
                  className={`w-full rounded-xl px-3 py-2 text-xs border focus:outline-none transition-colors ${
                    isLight
                      ? 'bg-white border-slate-300 text-slate-900 focus:border-amber-500'
                      : 'bg-[#080A0E] border-white/10 text-zinc-200 focus:border-amber-400'
                  }`}
                  required
                />
              </div>

              <div>
                <label className={`block text-[11px] font-mono mb-1 ${isLight ? 'text-slate-600' : 'text-zinc-400'}`}>
                  {language === 'ar' ? 'رقم الهاتف' : language === 'en' ? 'Phone Number' : 'Téléphone'}
                </label>
                <input
                  type="tel"
                  value={newClientPhone}
                  onChange={(e) => setNewClientPhone(e.target.value)}
                  placeholder="05 50 12 34 56"
                  className={`w-full rounded-xl px-3 py-2 text-xs border focus:outline-none transition-colors ${
                    isLight
                      ? 'bg-white border-slate-300 text-slate-900 focus:border-amber-500'
                      : 'bg-[#080A0E] border-white/10 text-zinc-200 focus:border-amber-400'
                  }`}
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              {saveSuccess ? (
                <span className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {language === 'ar'
                    ? 'تم حفظ المقايسة بنجاح على القرص المحلي !'
                    : language === 'en'
                    ? 'Quote saved successfully to disk!'
                    : 'Devis enregistré avec succès sur le disque !'}
                </span>
              ) : (
                <span className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-zinc-500'}`}>
                  {language === 'ar'
                    ? 'المقايسة محفوظة محلياً ويمكن الرجوع إليها دون إنترنت.'
                    : language === 'en'
                    ? 'Stored locally and accessible without internet connection.'
                    : "Le devis est stocké localement et accessible même sans signal internet."}
                </span>
              )}

              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-black font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-md btn-press hover-lift"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>
                  {language === 'ar'
                    ? 'حفظ هذه المقايسة'
                    : language === 'en'
                    ? 'Save this Quote'
                    : 'Sauvegarder ce Devis'}
                </span>
              </button>
            </div>
          </form>

          {/* List of Offline Quotes */}
          <div className="flex flex-col gap-3">
            <h4 className={`text-sm font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
              {language === 'ar'
                ? `المقايسات المسجلة (${quotes.length})`
                : language === 'en'
                ? `Saved Quotes (${quotes.length})`
                : `Devis Enregistrés (${quotes.length})`}
            </h4>

            {quotes.length === 0 ? (
              <div
                className={`p-8 text-center rounded-2xl border border-dashed ${
                  isLight
                    ? 'bg-slate-50 border-slate-300 text-slate-500'
                    : 'bg-white/5 border-white/10 text-zinc-400'
                }`}
              >
                <HardDrive className={`w-8 h-8 mx-auto mb-2 ${isLight ? 'text-slate-400' : 'text-zinc-600'}`} />
                <p className="text-sm">
                  {language === 'ar'
                    ? 'لا توجد مقايسات مسجلة دون اتصال حتى الآن.'
                    : language === 'en'
                    ? 'No offline quotes saved yet.'
                    : 'Aucun devis enregistré hors-ligne pour le moment.'}
                </p>
                <p className={`text-xs mt-1 ${isLight ? 'text-slate-400' : 'text-zinc-500'}`}>
                  {language === 'ar'
                    ? 'املأ النموذج أعلاه لأرشفة ورشاتك مباشرة على قرص الحاسوب.'
                    : language === 'en'
                    ? 'Use the form above to archive projects directly onto your drive.'
                    : "Remplissez le formulaire ci-dessus pour archiver vos chantiers sur le disque de l'ordinateur."}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {quotes.map((q) => (
                  <div
                    key={q.id}
                    className={`p-4 rounded-2xl border transition-all flex flex-col justify-between gap-3 hover-lift ${
                      isLight
                        ? 'bg-slate-50 border-slate-200 hover:border-amber-500/50 shadow-sm'
                        : 'bg-zinc-900/80 border-white/10 hover:border-amber-500/30'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 font-mono text-[10px] font-bold">
                          {q.id}
                        </span>
                        <span className={`text-[11px] font-mono ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
                          {new Date(q.created_at).toLocaleDateString('fr-DZ')}
                        </span>
                      </div>

                      <h5 className={`text-sm font-bold mt-1.5 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                        {q.title}
                      </h5>
                      <div className={`text-xs flex items-center gap-2 mt-1 ${isLight ? 'text-slate-600' : 'text-zinc-400'}`}>
                        <span>{q.client_name}</span>
                        <span>•</span>
                        <span>{q.client_wilaya}</span>
                      </div>
                    </div>

                    <div className={`flex items-baseline justify-between pt-2 border-t ${isLight ? 'border-slate-200' : 'border-white/5'}`}>
                      <div>
                        <span className={`text-[10px] block ${isLight ? 'text-slate-500' : 'text-zinc-500'}`}>
                          {language === 'ar' ? 'المبلغ الإجمالي' : language === 'en' ? 'TOTAL AMOUNT' : 'MONTANT TOTAL'}
                        </span>
                        <span className={`text-base font-extrabold font-mono ${isLight ? 'text-slate-900' : 'text-white'}`}>
                          {q.total_ttc_dzd.toLocaleString('fr-DZ')} DZD
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 sm:gap-2">
                        <button
                          onClick={() => handleDownloadQuotePdf(q.id)}
                          className={`p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl text-xs font-medium flex items-center gap-1 transition-colors cursor-pointer btn-press ${
                            isLight
                              ? 'bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200'
                              : 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20'
                          }`}
                          title="Télécharger le Devis PDF officiel"
                        >
                          <FileDown className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">PDF</span>
                        </button>

                        <button
                          onClick={() => handleShareQuoteWhatsApp(q)}
                          className={`p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl text-xs font-medium flex items-center gap-1 transition-colors cursor-pointer btn-press ${
                            isLight
                              ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200'
                              : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20'
                          }`}
                          title="Partager le devis sur WhatsApp"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">WhatsApp</span>
                        </button>

                        <button
                          onClick={() => {
                            playTactileClick();
                            handleRestoreQuote(q.id);
                          }}
                          className={`px-2.5 py-1.5 rounded-xl text-xs font-medium flex items-center gap-1 transition-colors cursor-pointer btn-press ${
                            isLight
                              ? 'bg-white hover:bg-slate-100 text-slate-800 border border-slate-200 shadow-sm'
                              : 'bg-white/10 hover:bg-white/15 text-zinc-200'
                          }`}
                          title="Charger dans le configurateur 3D"
                        >
                          <Upload className="w-3.5 h-3.5 text-sky-500" />
                          <span>
                            {language === 'ar' ? 'فتح' : language === 'en' ? 'Open' : 'Ouvrir'}
                          </span>
                        </button>

                        <button
                          onClick={() => {
                            playTactileClick();
                            handleDeleteQuote(q.id);
                          }}
                          className="p-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-500 text-xs transition-colors cursor-pointer btn-press"
                          title="Supprimer ce devis"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
