import React, { useState, useEffect, useMemo } from 'react';
import { useConfigStore } from '../../store/configStore';
import {
  getWorkshopJobs,
  advanceJobStage,
  addWorkshopJob,
  deleteJob,
  updateJob,
  STAGE_CONFIG,
  STAGE_ORDER,
} from '../../utils/workshopJobManager';
import type { WorkshopJob, WorkshopJobStage } from '../../types/workshop';
import {
  Phone,
  MessageCircle,
  ArrowRight,
  Plus,
  X,
  Check,
  Trash2,
  AlertCircle,
  Search,
  Calendar,
  ClipboardList,
  FileCheck,
  Banknote,
  Package,
  AlertTriangle,
  FileText,
  RotateCcw,
  ShieldCheck,
} from 'lucide-react';
import { playTactileClick, playClampSound, playSwitchSound } from '../../utils/audioFeedback';
import { ALGERIAN_WILAYAS_58 } from '../../utils/algerianWilayas';
import { WorkshopQualityModal } from './WorkshopQualityModal';
import { getJobQualityInspection, computeQualityScore } from '../../utils/qualityControlManager';
import {
  generateInstallationAcceptancePdf,
  generateFabricationOrderPdf,
  generateSupplierPurchaseOrderPdf,
} from '../../utils/pdfGenerator';
import {
  getWorkshopStock,
  updateStockQuantity,
  addStockItem,
  deleteStockItem,
  resetDefaultStock,
  STOCK_CATEGORIES,
  type WorkshopStockItem,
  type WorkshopStockCategory,
} from '../../utils/workshopInventoryManager';
import type { MobileNavTab } from './MobileBottomNavigation';

interface MobileWorkshopScreenProps {
  onNavigateTab?: (tab: MobileNavTab) => void;
}

interface SurveyPrefillData {
  isOpen: boolean;
  client: string;
  phone: string;
  desc: string;
  count: number;
  total: number;
  deposit: number;
  prof: string;
}

function getSurveyPrefill(): SurveyPrefillData | null {
  if (typeof window !== 'undefined') {
    try {
      const autoOpen = sessionStorage.getItem('baiti_auto_open_new_job_survey');
      if (autoOpen === 'true') {
        sessionStorage.removeItem('baiti_auto_open_new_job_survey');
        const rawOpenings = localStorage.getItem('baiti_field_measurement_project');
        const rawInfo = localStorage.getItem('baiti_field_measurement_info');
        const openings = rawOpenings ? JSON.parse(rawOpenings) : [];
        const info = rawInfo ? JSON.parse(rawInfo) : undefined;
        if (Array.isArray(openings) && openings.length > 0) {
          const client = info?.clientName?.trim() || 'Client Chantier';
          const phone = info?.clientPhone?.trim() || '';
          const site = info?.projectSite?.trim() || '';
          const count = openings.reduce((sum: number, o: any) => sum + (o.quantity || 1), 0);
          const total = openings.reduce(
            (sum: number, o: any) => sum + (o.estimatedUnitPriceDzd || 0) * (o.quantity || 1),
            0
          );
          const rooms = openings.map((o: any) => o.roomName).slice(0, 3).join(', ');
          const desc = `${count} Châssis (${rooms}${openings.length > 3 ? '...' : ''})${site ? ` • ${site}` : ''}`;
          const prof = openings[0]?.profileSystem || 'gamme_45_thermal';
          return {
            isOpen: true,
            client,
            phone,
            desc,
            count,
            total,
            deposit: Math.round(total * 0.5),
            prof,
          };
        }
      }
    } catch {
      // Handled
    }
  }
  return null;
}

export const MobileWorkshopScreen: React.FC<MobileWorkshopScreenProps> = () => {
  const { theme, language } = useConfigStore();
  const isLight = theme === 'light';
  const isRtl = language === 'ar';

  const [initialPrefill] = useState<SurveyPrefillData | null>(() => getSurveyPrefill());
  const [jobs, setJobs] = useState<WorkshopJob[]>(() => getWorkshopJobs());
  const [selectedStageFilter, setSelectedStageFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isNewJobModalOpen, setIsNewJobModalOpen] = useState<boolean>(() => !!initialPrefill?.isOpen);

  // Workshop view: 'jobs' (Affaires en cours) or 'stock' (Stock & Matières)
  const [workshopView, setWorkshopView] = useState<'jobs' | 'stock'>('jobs');

  // Stock inventory state
  const [stockItems, setStockItems] = useState<WorkshopStockItem[]>(() => getWorkshopStock());
  const [stockCategoryFilter, setStockCategoryFilter] = useState<WorkshopStockCategory | 'all'>('all');
  const [stockSearchQuery, setStockSearchQuery] = useState<string>('');
  const [isNewStockModalOpen, setIsNewStockModalOpen] = useState<boolean>(false);

  // New stock item form state
  const [newStockCode, setNewStockCode] = useState('');
  const [newStockName, setNewStockName] = useState('');
  const [newStockCategory, setNewStockCategory] = useState<WorkshopStockCategory>('profiles');
  const [newStockQuantity, setNewStockQuantity] = useState<number>(10);
  const [newStockMinThreshold, setNewStockMinThreshold] = useState<number>(5);
  const [newStockUnit, setNewStockUnit] = useState('barres (6m)');
  const [newStockUnitCost, setNewStockUnitCost] = useState<number>(12500);
  const [newStockSupplier, setNewStockSupplier] = useState('Profilor Extrusion Alger');
  const [newStockRack, setNewStockRack] = useState('RACK-A-01');

  const lowStockCount = useMemo(() => {
    return stockItems.filter((i) => i.currentQuantity <= i.minAlertThreshold).length;
  }, [stockItems]);

  const totalProfileBars = useMemo(() => {
    return stockItems
      .filter((i) => i.category === 'profiles' && i.unit.includes('barre'))
      .reduce((sum, i) => sum + i.currentQuantity, 0);
  }, [stockItems]);

  const totalStockValueDzd = useMemo(() => {
    return stockItems.reduce((sum, i) => sum + i.currentQuantity * (i.unitCostDzd || 0), 0);
  }, [stockItems]);

  const filteredStockItems = useMemo(() => {
    return stockItems.filter((item) => {
      const matchesCategory = stockCategoryFilter === 'all' || item.category === stockCategoryFilter;
      const matchesSearch =
        stockSearchQuery.trim() === '' ||
        item.name.toLowerCase().includes(stockSearchQuery.toLowerCase()) ||
        item.code.toLowerCase().includes(stockSearchQuery.toLowerCase()) ||
        item.supplierName.toLowerCase().includes(stockSearchQuery.toLowerCase()) ||
        (item.rackLocation && item.rackLocation.toLowerCase().includes(stockSearchQuery.toLowerCase()));
      return matchesCategory && matchesSearch;
    });
  }, [stockItems, stockCategoryFilter, stockSearchQuery]);

  // Active survey notebook project data
  const [surveyProjectData, setSurveyProjectData] = useState<{
    info?: { clientName?: string; clientPhone?: string; projectSite?: string };
    openings: any[];
  } | null>(() => {
    if (typeof window !== 'undefined') {
      try {
        const rawOpenings = localStorage.getItem('baiti_field_measurement_project');
        const rawInfo = localStorage.getItem('baiti_field_measurement_info');
        const openings = rawOpenings ? JSON.parse(rawOpenings) : [];
        const info = rawInfo ? JSON.parse(rawInfo) : undefined;
        if (Array.isArray(openings) && openings.length > 0) {
          return { info, openings };
        }
      } catch {
        return null;
      }
    }
    return null;
  });

  useEffect(() => {
    const syncSurvey = () => {
      if (typeof window !== 'undefined') {
        try {
          const rawOpenings = localStorage.getItem('baiti_field_measurement_project');
          const rawInfo = localStorage.getItem('baiti_field_measurement_info');
          const openings = rawOpenings ? JSON.parse(rawOpenings) : [];
          const info = rawInfo ? JSON.parse(rawInfo) : undefined;
          if (Array.isArray(openings) && openings.length > 0) {
            setSurveyProjectData({ info, openings });
          } else {
            setSurveyProjectData(null);
          }
        } catch {
          setSurveyProjectData(null);
        }
      }
    };
    window.addEventListener('storage', syncSurvey);
    return () => window.removeEventListener('storage', syncSurvey);
  }, []);

  // Form State for New Job
  const [newClientName, setNewClientName] = useState(() => initialPrefill?.client || '');
  const [newClientPhone, setNewClientPhone] = useState(() => initialPrefill?.phone || '');
  const [newWilaya, setNewWilaya] = useState('16 - Alger');
  const [newDescription, setNewDescription] = useState(() => initialPrefill?.desc || '');
  const [newItemCount, setNewItemCount] = useState<number>(() => initialPrefill?.count || 1);
  const [newTotalAmount, setNewTotalAmount] = useState<number>(() => initialPrefill?.total || 150000);
  const [newDeposit, setNewDeposit] = useState<number>(() => initialPrefill?.deposit || 75000);
  const [newDueDate, setNewDueDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().split('T')[0];
  });
  const [newPriority, setNewPriority] = useState<'normal' | 'urgent' | 'critique'>('normal');
  const [newStage, setNewStage] = useState<WorkshopJobStage>('devis');
  const [newProfileSystem, setNewProfileSystem] = useState(() => initialPrefill?.prof || 'gamme_45_thermal');
  const [formError, setFormError] = useState<string | null>(null);

  const handlePrefillFromSurvey = () => {
    playClampSound();
    if (!surveyProjectData) return;
    const client = surveyProjectData.info?.clientName?.trim() || 'Client Chantier';
    const phone = surveyProjectData.info?.clientPhone?.trim() || '';
    const site = surveyProjectData.info?.projectSite?.trim() || '';
    const count = surveyProjectData.openings.reduce((sum, o) => sum + (o.quantity || 1), 0);
    const total = surveyProjectData.openings.reduce(
      (sum, o) => sum + (o.estimatedUnitPriceDzd || 0) * (o.quantity || 1),
      0
    );
    const rooms = surveyProjectData.openings.map((o) => o.roomName).slice(0, 3).join(', ');
    const desc = `${count} Châssis (${rooms}${surveyProjectData.openings.length > 3 ? '...' : ''})${site ? ` • ${site}` : ''}`;

    setNewClientName(client);
    if (phone) setNewClientPhone(phone);
    setNewDescription(desc);
    setNewItemCount(count);
    setNewTotalAmount(total);
    setNewDeposit(Math.round(total * 0.5));
    if (surveyProjectData.openings[0]?.profileSystem) {
      setNewProfileSystem(surveyProjectData.openings[0].profileSystem);
    }
    setIsNewJobModalOpen(true);
  };

  // Payment / Encaissement modal state
  const [paymentJob, setPaymentJob] = useState<WorkshopJob | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<'especes' | 'baridimob' | 'virement' | 'cheque'>('especes');
  const [paymentNote, setPaymentNote] = useState<string>('');
  const [sendWhatsAppReceipt, setSendWhatsAppReceipt] = useState<boolean>(true);
  const [paymentToast, setPaymentToast] = useState<string | null>(null);

  const handleOpenPaymentModal = (job: WorkshopJob) => {
    playTactileClick();
    const remaining = Math.max(0, job.totalAmountDzd - job.depositDzd);
    setPaymentJob(job);
    setPaymentAmount(remaining > 0 ? (remaining >= 50000 ? 50000 : remaining) : 0);
    setPaymentMethod('especes');
    setPaymentNote('');
    setSendWhatsAppReceipt(true);
  };

  const handleConfirmPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentJob || paymentAmount <= 0) return;
    playClampSound();

    const newDeposit = Math.min(paymentJob.totalAmountDzd, paymentJob.depositDzd + paymentAmount);
    const newBalance = Math.max(0, paymentJob.totalAmountDzd - newDeposit);
    updateJob(paymentJob.id, { depositDzd: newDeposit });
    setJobs((prev) =>
      prev.map((j) => (j.id === paymentJob.id ? { ...j, depositDzd: newDeposit } : j))
    );

    const methodLabel =
      paymentMethod === 'especes'
        ? 'Espèces (Cash)'
        : paymentMethod === 'baridimob'
        ? 'BaridiMob / CCP'
        : paymentMethod === 'virement'
        ? 'Virement Bancaire'
        : 'Chèque de Banque';

    if (sendWhatsAppReceipt && paymentJob.clientPhone) {
      const todayStr = new Date().toLocaleDateString('fr-DZ');
      let text = `*REÇU DE VERSEMENT ACOMPTE • BAITI ATELIER*\n`;
      text += `Date : ${todayStr}\n`;
      text += `Client : ${paymentJob.clientName}\n`;
      text += `Réf Affaire : ${paymentJob.id}\n\n`;
      text += `*DÉTAILS DU RÈGLEMENT :*\n`;
      text += `• Montant versé : *+${paymentAmount.toLocaleString('fr-DZ')} DZD*\n`;
      text += `• Mode de paiement : ${methodLabel}\n`;
      if (paymentNote.trim()) {
        text += `• Référence / Note : ${paymentNote.trim()}\n`;
      }
      text += `\n*SITUATION DU COMPTE :*\n`;
      text += `• Montant total commande : ${paymentJob.totalAmountDzd.toLocaleString('fr-DZ')} DZD\n`;
      text += `• Total acomptes perçus : ${newDeposit.toLocaleString('fr-DZ')} DZD\n`;
      text += `• Solde restant à régler : *${newBalance.toLocaleString('fr-DZ')} DZD*\n\n`;
      text += `Document émis pour valoir reçu de règlement d'acompte.\nBaiti Atelier Menuiserie Aluminium & PVC Algérie`;

      window.open(`https://wa.me/${paymentJob.clientPhone.replace(/\D/g, '')}?text=${encodeURIComponent(text)}`, '_blank');
    }

    setPaymentToast(`Versement de ${paymentAmount.toLocaleString('fr-DZ')} DZD enregistré !`);
    setTimeout(() => setPaymentToast(null), 3500);
    setPaymentJob(null);
  };

  // Quality Control modal state
  const [qualityJob, setQualityJob] = useState<WorkshopJob | null>(null);
  const [isQualityModalOpen, setIsQualityModalOpen] = useState<boolean>(false);
  const [, setQaRefreshKey] = useState<number>(0);

  const handleOpenQualityModal = (job: WorkshopJob) => {
    playTactileClick();
    setQualityJob(job);
    setIsQualityModalOpen(true);
  };

  const handleStockDelta = (id: string, delta: number) => {
    playTactileClick();
    const updated = updateStockQuantity(id, delta);
    setStockItems([...updated]);
  };

  const handleDeleteStockItem = (id: string) => {
    playTactileClick();
    const updated = deleteStockItem(id);
    setStockItems([...updated]);
  };

  const handleResetDefaultStock = () => {
    playClampSound();
    const reset = resetDefaultStock();
    setStockItems([...reset]);
    setPaymentToast('Stock d atelier réinitialisé avec les valeurs par défaut.');
    setTimeout(() => setPaymentToast(null), 3000);
  };

  const handleCreateStockItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStockName.trim()) return;
    playClampSound();
    const updated = addStockItem({
      code: newStockCode.trim() || `ART-${Date.now().toString().slice(-4)}`,
      name: newStockName.trim(),
      category: newStockCategory,
      currentQuantity: Math.max(0, newStockQuantity),
      minAlertThreshold: Math.max(0, newStockMinThreshold),
      unit: newStockUnit.trim() || 'pièces',
      unitCostDzd: Math.max(0, newStockUnitCost),
      supplierName: newStockSupplier.trim() || 'Fournisseur Atelier',
      rackLocation: newStockRack.trim() || 'RACK-01',
    });
    setStockItems([...updated]);
    setIsNewStockModalOpen(false);
    setPaymentToast(`Article "${newStockName.trim()}" ajouté au stock !`);
    setTimeout(() => setPaymentToast(null), 3000);
    setNewStockCode('');
    setNewStockName('');
  };

  const handleDownloadPurchaseOrderPdf = async () => {
    playClampSound();
    const lowItems = stockItems.filter((i) => i.currentQuantity <= i.minAlertThreshold);
    const itemsToOrder = lowItems.length > 0 ? lowItems : filteredStockItems.slice(0, 10);

    if (itemsToOrder.length === 0) return;

    const supplier = itemsToOrder[0]?.supplierName || 'Fournisseur Principal Aluminium';

    await generateSupplierPurchaseOrderPdf({
      supplierName: supplier,
      orderReference: `BC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      workshopName: 'Baiti Atelier Menuiserie',
      wilaya: 'Alger',
      items: itemsToOrder.map((it) => {
        const neededQty = Math.max(1, it.minAlertThreshold * 2 - it.currentQuantity);
        return {
          code: it.code,
          name: it.name,
          category: it.category,
          quantity: neededQty,
          unit: it.unit,
          estimatedUnitCostDzd: it.unitCostDzd,
        };
      }),
    });
  };

  const handleWhatsAppSupplierReorder = () => {
    playTactileClick();
    const lowItems = stockItems.filter((i) => i.currentQuantity <= i.minAlertThreshold);
    const itemsToOrder = lowItems.length > 0 ? lowItems : filteredStockItems.slice(0, 6);

    if (itemsToOrder.length === 0) return;

    let msg = `*BON DE COMMANDE RÉAPPROVISIONNEMENT • BAITI ATELIER*\n`;
    msg += `Date : ${new Date().toLocaleDateString('fr-DZ')}\n`;
    msg += `Émetteur : Baiti Atelier Menuiserie Aluminium & PVC\n\n`;
    msg += `*ARTICLES ET QUANTITÉS COMMANDÉES :*\n`;
    itemsToOrder.forEach((it, idx) => {
      const neededQty = Math.max(1, it.minAlertThreshold * 2 - it.currentQuantity);
      msg += `${idx + 1}. *${it.name}* [${it.code}]\n   Quantité : *${neededQty} ${it.unit}* (Stock restant : ${it.currentQuantity})\n`;
    });
    msg += `\nMerci de bien vouloir nous confirmer la disponibilité et le délai de mise à disposition à l'atelier.`;

    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const handleAdvance = (jobId: string) => {
    playClampSound();
    const updated = advanceJobStage(jobId);
    setJobs([...updated]);
  };

  const handleDeleteJob = (jobId: string) => {
    playTactileClick();
    deleteJob(jobId);
    setJobs((prev) => prev.filter((j) => j.id !== jobId));
  };

  const handleWhatsApp = (job: WorkshopJob) => {
    playTactileClick();
    const stageInfo = STAGE_CONFIG[job.stage];
    const text = `*SUIVI DE COMMANDE BAITI ATELIER*\nBonjour ${job.clientName},\nVotre commande (Réf: ${job.id}) avance bien dans notre atelier :\n• Étape actuelle : *${stageInfo.labelFr}*\n• Descriptif : ${job.description}\n• Solde restant : ${(job.totalAmountDzd - job.depositDzd).toLocaleString('fr-DZ')} DZD\n\nNous restons à votre entière disposition pour la livraison.`;
    window.open(`https://wa.me/${job.clientPhone.replace(/\D/g, '')}?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleCreateJob = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClientName.trim()) {
      setFormError('Veuillez saisir le nom du client');
      return;
    }
    if (!newClientPhone.trim()) {
      setFormError('Veuillez renseigner le numéro de téléphone');
      return;
    }

    playClampSound();
    const created = addWorkshopJob({
      clientName: newClientName.trim(),
      clientPhone: newClientPhone.trim(),
      wilaya: newWilaya,
      stage: newStage,
      itemCount: Math.max(1, newItemCount),
      description: newDescription.trim() || `${newItemCount} Châssis menuiserie aluminium`,
      totalAmountDzd: Math.max(0, newTotalAmount),
      depositDzd: Math.max(0, newDeposit),
      dueDate: newDueDate,
      priority: newPriority,
      profileSystem: newProfileSystem,
      notes: 'Affaire saisie sur smartphone atelier',
    });

    setJobs([created, ...jobs]);
    setIsNewJobModalOpen(false);
    setFormError(null);

    // Reset fields
    setNewClientName('');
    setNewClientPhone('');
    setNewDescription('');
    setNewTotalAmount(150000);
    setNewDeposit(75000);
  };

  const filteredJobs = jobs.filter((job) => {
    const matchesStage = selectedStageFilter === 'all' || job.stage === selectedStageFilter;
    const matchesSearch =
      searchQuery.trim() === '' ||
      job.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.wilaya.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStage && matchesSearch;
  });

  const handleDownloadPvPdf = async (job: WorkshopJob) => {
    playClampSound();
    await generateInstallationAcceptancePdf({
      jobId: job.id,
      clientName: job.clientName,
      clientPhone: job.clientPhone,
      wilaya: job.wilaya,
      description: job.description,
      itemCount: job.itemCount,
      totalAmountDzd: job.totalAmountDzd,
      depositDzd: job.depositDzd,
      profileSystem: job.profileSystem,
      installationDate: new Date().toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }),
    });
  };

  const handleDownloadFabricationOrderPdf = async (job: WorkshopJob) => {
    playClampSound();
    await generateFabricationOrderPdf({
      jobId: job.id,
      clientName: job.clientName,
      clientPhone: job.clientPhone,
      wilaya: job.wilaya,
      stage: job.stage,
      description: job.description,
      itemCount: job.itemCount,
      totalAmountDzd: job.totalAmountDzd,
      depositDzd: job.depositDzd,
      dueDate: job.dueDate,
      priority: job.priority,
      profileSystem: job.profileSystem,
      notes: job.notes,
    });
  };

  const handleSharePvWhatsApp = (job: WorkshopJob) => {
    playTactileClick();
    const balanceDue = Math.max(0, job.totalAmountDzd - job.depositDzd);
    let text = `*PROCÈS-VERBAL DE RÉCEPTION DE CHANTIER - BAITI ATELIER*\n`;
    text += `Client : ${job.clientName}\n`;
    text += `Affaire : ${job.id} (${job.description})\n`;
    text += `Wilaya : ${job.wilaya}\n`;
    text += `Volume réceptionné : ${job.itemCount} châssis menuiserie\n\n`;
    text += `*CONFORMITÉ TECHNIQUE DES TRAVAUX :*\n`;
    text += `• Aplomb, niveau et étanchéité périmétrique : CONFORME\n`;
    text += `• Manœuvre des ouvrants et verrouillage : CONFORME\n`;
    text += `• Vitrages et finitions : CONFORME SANS RÉSERVE\n\n`;
    text += `*SITUATION FINANCIÈRE :*\n`;
    text += `• Montant total : ${job.totalAmountDzd.toLocaleString('fr-DZ')} DZD\n`;
    text += `• Acompte perçu : ${job.depositDzd.toLocaleString('fr-DZ')} DZD\n`;
    text += `• Solde à régler à réception : *${balanceDue.toLocaleString('fr-DZ')} DZD*\n\n`;
    text += `Garantie de parfait achèvement (1 an) et biennale quincaillerie activées.\nMerci pour votre confiance ! • Baiti Atelier Algérie`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="pb-36 px-3 sm:px-6 pt-2 max-w-xl md:max-w-2xl mx-auto space-y-4" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* 0. ACTIVE SURVEY NOTEBOOK BANNER */}
      {surveyProjectData && surveyProjectData.openings.length > 0 && (
        <div
          className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 text-xs font-mono shadow-xs transition-all ${
            isLight
              ? 'bg-amber-50/90 border-amber-200 text-slate-800'
              : 'bg-amber-500/10 border-amber-500/25 text-amber-200'
          }`}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-[#D4AF37]/20 border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37] shrink-0">
              <ClipboardList className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="font-bold flex items-center gap-1.5 truncate">
                <span className={isLight ? 'text-slate-900 font-bold' : 'text-white font-bold'}>
                  Chantier Relevé : {surveyProjectData.info?.clientName || 'M. Amrani'}
                </span>
              </div>
              <div className={`text-[10px] truncate ${isLight ? 'text-slate-600 font-medium' : 'text-zinc-400'}`}>
                {surveyProjectData.openings.length} châssis mesurés • {surveyProjectData.openings.reduce((sum, o) => sum + (o.estimatedUnitPriceDzd || 0) * (o.quantity || 1), 0).toLocaleString('fr-DZ')} DZD
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handlePrefillFromSurvey}
            className="px-3 py-2 rounded-xl bg-[#D4AF37] text-slate-950 font-bold text-[11px] shrink-0 cursor-pointer hover:brightness-110 active:scale-95 transition-all shadow-xs"
          >
            Lancer Fabrication
          </button>
        </div>
      )}

      {/* 0B. WORKSHOP VIEW SELECTOR */}
      <div className="grid grid-cols-2 p-1 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 font-mono text-xs">
        <button
          type="button"
          onClick={() => {
            playTactileClick();
            setWorkshopView('jobs');
          }}
          className={`py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 cursor-pointer transition-all ${
            workshopView === 'jobs'
              ? 'bg-[#D4AF37] text-slate-950 shadow-sm'
              : isLight
              ? 'text-slate-600 hover:text-slate-950'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <ClipboardList className="w-3.5 h-3.5 shrink-0" />
          <span>Affaires ({jobs.length})</span>
        </button>

        <button
          type="button"
          onClick={() => {
            playTactileClick();
            setWorkshopView('stock');
          }}
          className={`py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 cursor-pointer transition-all ${
            workshopView === 'stock'
              ? 'bg-[#D4AF37] text-slate-950 shadow-sm'
              : isLight
              ? 'text-slate-600 hover:text-slate-950'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <Package className="w-3.5 h-3.5 shrink-0" />
          <span>Stock & Matières ({lowStockCount > 0 ? `⚠️ ${lowStockCount}` : stockItems.length})</span>
        </button>
      </div>

      {workshopView === 'jobs' ? (
        <>
          {/* 1. TOP ACTION & SEARCH BAR */}
      <div className="flex items-center gap-2">
        <div
          className={`flex-1 flex items-center gap-2 px-3 py-2 rounded-2xl border ${
            isLight ? 'bg-white border-slate-200' : 'bg-[#0B0F19] border-white/10'
          }`}
        >
          <Search className="w-4 h-4 text-zinc-400 shrink-0" />
          <input
            type="text"
            placeholder="Rechercher client, réf ou wilaya..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full bg-transparent text-xs font-mono focus:outline-none ${
              isLight ? 'text-slate-900 placeholder:text-slate-400' : 'text-white placeholder:text-zinc-500'
            }`}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className={`p-1 rounded-lg ${isLight ? 'text-slate-400 hover:text-slate-800' : 'text-zinc-400 hover:text-white'}`}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <button
          onClick={() => {
            playTactileClick();
            setIsNewJobModalOpen(true);
          }}
          className="px-3.5 py-2.5 rounded-2xl bg-gradient-to-r from-[#C5A880] to-[#D4AF37] text-slate-950 font-mono font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-md hover:brightness-110 active:scale-95 transition-all shrink-0 min-h-[44px]"
        >
          <Plus className="w-4 h-4" />
          <span>Nouvelle Affaire</span>
        </button>
      </div>

      {/* 2. STAGE FILTER CAROUSEL */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 text-xs font-mono">
        <button
          onClick={() => {
            playTactileClick();
            setSelectedStageFilter('all');
          }}
          className={`px-3 py-2 rounded-2xl border transition-all shrink-0 cursor-pointer min-h-[44px] ${
            selectedStageFilter === 'all'
              ? 'bg-[#D4AF37] text-slate-950 font-bold border-[#D4AF37]'
              : isLight
              ? 'bg-white text-slate-700 border-slate-200'
              : 'bg-[#0B0F19] text-zinc-300 border-white/10'
          }`}
        >
          Tous ({jobs.length})
        </button>

        {STAGE_ORDER.map((st) => {
          const count = jobs.filter((j) => j.stage === st).length;
          const conf = STAGE_CONFIG[st];
          const isSelected = selectedStageFilter === st;
          return (
            <button
              key={st}
              onClick={() => {
                playTactileClick();
                setSelectedStageFilter(st);
              }}
              className={`px-3 py-2 rounded-2xl border transition-all shrink-0 cursor-pointer min-h-[44px] flex items-center gap-1.5 ${
                isSelected
                  ? 'bg-[#D4AF37] text-slate-950 font-bold border-[#D4AF37]'
                  : isLight
                  ? 'bg-white text-slate-700 border-slate-200'
                  : 'bg-[#0B0F19] text-zinc-300 border-white/10'
              }`}
            >
              <span>{conf.labelFr.split('.')[1]?.trim() || conf.labelFr}</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/10 dark:bg-white/10">
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* 3. JOBS LIST */}
      <div className="space-y-3">
        {filteredJobs.length === 0 ? (
          <div
            className={`p-8 rounded-3xl border text-center font-mono text-xs ${
              isLight ? 'bg-white border-slate-200 text-zinc-500' : 'bg-[#0B0F19] border-white/10 text-zinc-400'
            }`}
          >
            Aucune affaire ne correspond à vos filtres actuels.
          </div>
        ) : (
          filteredJobs.map((job) => {
            const stageInfo = STAGE_CONFIG[job.stage];
            const balanceDue = job.totalAmountDzd - job.depositDzd;
            const isCompleted = job.stage === 'termine';
            const qaInspection = getJobQualityInspection(job.id);
            const qaScore = computeQualityScore(qaInspection);

            return (
              <div
                key={job.id}
                className={`p-4 rounded-3xl border shadow-md space-y-3 font-mono text-xs ${
                  isLight ? 'bg-white border-slate-200' : 'bg-[#0B0F19] border-white/10'
                }`}
              >
                {/* Job Header */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-zinc-500 font-bold">{job.id}</span>
                      <span className="text-[10px] text-cyan-400">{job.wilaya}</span>
                      {job.priority === 'urgent' && (
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-bold">
                          URGENT
                        </span>
                      )}
                      {job.priority === 'critique' && (
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-300 font-bold">
                          CRITIQUE
                        </span>
                      )}
                    </div>
                    <h3 className={`text-sm font-bold leading-tight mt-0.5 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                      {job.clientName}
                    </h3>
                  </div>

                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold border shrink-0 ${
                        isLight ? stageInfo.bgLight : stageInfo.bgDark
                      } ${stageInfo.color}`}
                    >
                      {stageInfo.labelFr}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleOpenQualityModal(job)}
                      className={`text-[9px] px-2 py-0.5 rounded-full font-bold border cursor-pointer transition-all flex items-center gap-1 ${
                        qaScore.isFullyCompliant
                          ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-400 hover:bg-emerald-500/20'
                          : 'bg-amber-500/10 border-amber-500/25 text-amber-400 hover:bg-amber-500/20'
                      }`}
                      title="Ouvrir la Fiche Contrôle Qualité Atelier"
                    >
                      <ShieldCheck className="w-2.5 h-2.5" />
                      <span>QA {qaScore.conformeCount + qaScore.corrigeCount}/8 {qaScore.isFullyCompliant ? '✓' : ''}</span>
                    </button>
                  </div>
                </div>

                {/* Job Description & Details */}
                <div className={`text-xs leading-relaxed ${isLight ? 'text-slate-600' : 'text-zinc-400'}`}>
                  {job.description}
                </div>

                <div className={`flex items-center justify-between text-[11px] pt-0.5 ${isLight ? 'text-slate-500' : 'text-zinc-500'}`}>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Livraison prévue : {job.dueDate}</span>
                  </div>
                  <span>{job.itemCount} châssis</span>
                </div>

                {/* Financials Row (Interactive for quick payment) */}
                <div
                  onClick={() => handleOpenPaymentModal(job)}
                  className={`p-2.5 rounded-2xl border flex items-center justify-between cursor-pointer hover:border-[#D4AF37]/50 active:scale-99 transition-all ${
                    isLight ? 'bg-slate-50 border-slate-200 hover:bg-slate-100' : 'bg-black/30 border-white/5 hover:bg-black/40'
                  }`}
                  title="Cliquer pour enregistrer un versement ou acompte"
                >
                  <div>
                    <span className="text-[10px] text-zinc-500 block">Total Affaire</span>
                    <span className="font-bold text-[#D4AF37]">
                      {job.totalAmountDzd.toLocaleString('fr-DZ')} DZD
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-zinc-500 block">Acompte</span>
                    <span className="font-semibold text-emerald-500">
                      {job.depositDzd.toLocaleString('fr-DZ')} DZD
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-zinc-500 block flex items-center justify-end gap-1">
                      <span>Reste Dû</span>
                      {balanceDue > 0 && (
                        <span className="text-[8px] px-1.5 py-0.2 rounded-md bg-emerald-500/20 text-emerald-400 font-bold">
                          + Encaisser
                        </span>
                      )}
                    </span>
                    <span className={`font-bold ${balanceDue > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                      {balanceDue.toLocaleString('fr-DZ')} DZD
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-1.5 pt-1">
                  <a
                    href={`tel:${job.clientPhone}`}
                    className={`p-2.5 rounded-2xl border flex items-center justify-center cursor-pointer min-h-[44px] min-w-[44px] ${
                      isLight
                        ? 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
                        : 'bg-white/5 border-white/10 text-zinc-300 hover:bg-white/10'
                    }`}
                    title="Appeler le client"
                  >
                    <Phone className="w-4 h-4 text-cyan-400" />
                  </a>

                  <button
                    onClick={() => handleWhatsApp(job)}
                    className="p-2.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-bold flex items-center justify-center gap-1.5 flex-1 min-h-[44px] cursor-pointer hover:bg-emerald-500/20 active:scale-98 transition-all"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>WhatsApp</span>
                  </button>

                  {!isCompleted && (
                    <button
                      onClick={() => handleAdvance(job.id)}
                      className="py-2.5 px-3 rounded-2xl bg-[#D4AF37] text-slate-950 font-bold flex items-center justify-center gap-1 min-h-[44px] cursor-pointer hover:brightness-110 active:scale-98 transition-all"
                      title="Avancer à l'étape suivante"
                    >
                      <span>Étape +1</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}

                  <button
                    onClick={() => handleDeleteJob(job.id)}
                    className={`p-2.5 rounded-2xl border flex items-center justify-center min-h-[44px] min-w-[44px] cursor-pointer transition-colors ${
                      isLight
                        ? 'border-slate-200 text-slate-400 hover:text-rose-500 hover:border-rose-300 hover:bg-rose-50'
                        : 'border-white/5 text-zinc-500 hover:text-rose-400 hover:border-rose-500/40'
                    }`}
                    title="Supprimer cette affaire"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Production Order & Handover Actions (OF, PV, & Encaisser) */}
                <div className="pt-2 border-t border-black/5 dark:border-white/5 flex items-center gap-1.5 flex-wrap">
                  <button
                    type="button"
                    onClick={() => handleDownloadFabricationOrderPdf(job)}
                    className={`flex-1 py-2 px-2 rounded-xl border font-bold text-[11px] flex items-center justify-center gap-1.5 cursor-pointer min-h-[38px] active:scale-98 transition-all ${
                      job.stage !== 'pose' && job.stage !== 'termine'
                        ? 'bg-sky-500/15 border-sky-500/30 text-sky-400 hover:bg-sky-500/25 shadow-xs'
                        : isLight
                        ? 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
                        : 'bg-white/5 border-white/10 text-zinc-300 hover:bg-white/10'
                    }`}
                    title="Générer la Fiche Suiveuse d'Atelier / Ordre de Fabrication officiel (PDF)"
                  >
                    <ClipboardList className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                    <span>Fiche OF</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDownloadPvPdf(job)}
                    className={`flex-1 py-2 px-2 rounded-xl border font-bold text-[11px] flex items-center justify-center gap-1.5 cursor-pointer min-h-[38px] active:scale-98 transition-all ${
                      job.stage === 'pose' || job.stage === 'termine'
                        ? 'bg-[#D4AF37]/15 border-[#D4AF37]/40 text-[#D4AF37] hover:bg-[#D4AF37]/25 shadow-xs'
                        : isLight
                        ? 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
                        : 'bg-white/5 border-white/10 text-zinc-300 hover:bg-white/10'
                    }`}
                    title="Générer le Procès-Verbal de Réception de Pose officiel (PDF)"
                  >
                    <FileCheck className="w-3.5 h-3.5 text-[#D4AF37] shrink-0" />
                    <span>PV de Pose</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleOpenQualityModal(job)}
                    className={`flex-1 py-2 px-2 rounded-xl border font-bold text-[11px] flex items-center justify-center gap-1.5 cursor-pointer min-h-[38px] active:scale-98 transition-all ${
                      qaScore.isFullyCompliant
                        ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/25 shadow-xs'
                        : isLight
                        ? 'bg-amber-50 border-amber-300 text-amber-800 hover:bg-amber-100 shadow-xs'
                        : 'bg-amber-500/15 border-amber-500/30 text-amber-300 hover:bg-amber-500/25 shadow-xs'
                    }`}
                    title="Fiche de Contrôle Qualité Atelier & Bon de Sortie (PDF)"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Fiche QA</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleOpenPaymentModal(job)}
                    className={`py-2 px-2.5 rounded-xl border font-bold text-[11px] flex items-center justify-center gap-1.5 cursor-pointer min-h-[38px] active:scale-98 transition-all ${
                      balanceDue > 0
                        ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/25 shadow-xs'
                        : isLight
                        ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed'
                        : 'bg-white/5 border-white/10 text-zinc-500 cursor-not-allowed'
                    }`}
                    title="Enregistrer un versement client et générer le reçu"
                    disabled={balanceDue <= 0}
                  >
                    <Banknote className="w-3.5 h-3.5 shrink-0" />
                    <span>{balanceDue <= 0 ? 'Soldé' : 'Encaisser'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSharePvWhatsApp(job)}
                    className="py-2 px-2 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 font-bold text-[11px] flex items-center justify-center gap-1 cursor-pointer min-h-[38px] hover:bg-emerald-500/20 active:scale-98 transition-all"
                    title="Partager le résumé de réception et solde par WhatsApp"
                  >
                    <MessageCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>WhatsApp PV</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </>
  ) : (
    <div className="space-y-4">
      {/* 1. STOCK KPI METRICS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono">
        <div className={`p-3 rounded-2xl border ${isLight ? 'bg-white border-slate-200' : 'bg-[#0B0F19] border-white/10'}`}>
          <span className="text-[10px] text-zinc-400 block uppercase">Références</span>
          <span className="text-xl font-black text-[#D4AF37]">{stockItems.length}</span>
        </div>

        <div className={`p-3 rounded-2xl border ${isLight ? 'bg-white border-slate-200' : 'bg-[#0B0F19] border-white/10'}`}>
          <span className="text-[10px] text-zinc-400 block uppercase">Barres 6m Profilés</span>
          <span className="text-xl font-black text-cyan-400">{totalProfileBars}</span>
        </div>

        <div className={`p-3 rounded-2xl border ${
          lowStockCount > 0
            ? isLight ? 'bg-rose-50 border-rose-200' : 'bg-rose-500/10 border-rose-500/30'
            : isLight ? 'bg-white border-slate-200' : 'bg-[#0B0F19] border-white/10'
        }`}>
          <span className="text-[10px] text-zinc-400 block uppercase">Alertes Seuil Bas</span>
          <span className={`text-xl font-black ${lowStockCount > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
            {lowStockCount}
          </span>
        </div>

        <div className={`p-3 rounded-2xl border ${isLight ? 'bg-white border-slate-200' : 'bg-[#0B0F19] border-white/10'}`}>
          <span className="text-[10px] text-zinc-400 block uppercase">Valeur Stock</span>
          <span className="text-sm font-black text-[#D4AF37] truncate block mt-1">
            {(totalStockValueDzd / 1000).toFixed(0)}k DZD
          </span>
        </div>
      </div>

      {/* 2. SEARCH & NEW ARTICLE ACTION */}
      <div className="flex items-center gap-2">
        <div
          className={`flex-1 flex items-center gap-2 px-3 py-2 rounded-2xl border ${
            isLight ? 'bg-white border-slate-200' : 'bg-[#0B0F19] border-white/10'
          }`}
        >
          <Search className="w-4 h-4 text-zinc-400 shrink-0" />
          <input
            type="text"
            placeholder="Rechercher code, désignation, casier..."
            value={stockSearchQuery}
            onChange={(e) => setStockSearchQuery(e.target.value)}
            className={`w-full bg-transparent text-xs font-mono focus:outline-none ${
              isLight ? 'text-slate-900 placeholder:text-slate-400' : 'text-white placeholder:text-zinc-500'
            }`}
          />
          {stockSearchQuery && (
            <button
              type="button"
              onClick={() => setStockSearchQuery('')}
              className={`p-1 rounded-lg ${isLight ? 'text-slate-400 hover:text-slate-800' : 'text-zinc-400 hover:text-white'}`}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={() => {
            playTactileClick();
            setIsNewStockModalOpen(true);
          }}
          className="px-3.5 py-2.5 rounded-2xl bg-gradient-to-r from-[#C5A880] to-[#D4AF37] text-slate-950 font-mono font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-md hover:brightness-110 active:scale-95 transition-all shrink-0 min-h-[44px]"
        >
          <Plus className="w-4 h-4" />
          <span>Nouvel Article</span>
        </button>
      </div>

      {/* 3. CATEGORY FILTERS */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 text-xs font-mono">
        {STOCK_CATEGORIES.map((cat) => {
          const count = cat.id === 'all' ? stockItems.length : stockItems.filter((i) => i.category === cat.id).length;
          const isSelected = stockCategoryFilter === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => {
                playTactileClick();
                setStockCategoryFilter(cat.id as any);
              }}
              className={`px-3 py-2 rounded-2xl border transition-all shrink-0 cursor-pointer min-h-[40px] flex items-center gap-1.5 ${
                isSelected
                  ? 'bg-[#D4AF37] text-slate-950 font-bold border-[#D4AF37]'
                  : isLight
                  ? 'bg-white text-slate-700 border-slate-200'
                  : 'bg-[#0B0F19] text-zinc-300 border-white/10'
              }`}
            >
              <span>{cat.label}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                isSelected ? 'bg-black/20 text-slate-950 font-bold' : 'bg-white/10 text-zinc-400'
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* 4. PROCUREMENT ACTIONS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <button
          type="button"
          onClick={handleDownloadPurchaseOrderPdf}
          className="w-full py-2.5 rounded-2xl bg-[#D4AF37]/15 border border-[#D4AF37]/40 text-[#D4AF37] font-mono font-bold text-xs flex items-center justify-center gap-2 cursor-pointer min-h-[44px] hover:bg-[#D4AF37]/25 active:scale-98 transition-all shadow-xs"
        >
          <FileText className="w-4 h-4" />
          <span>Bon de Commande Fournisseur (PDF)</span>
        </button>

        <button
          type="button"
          onClick={handleWhatsAppSupplierReorder}
          className="w-full py-2.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-mono font-bold text-xs flex items-center justify-center gap-2 cursor-pointer min-h-[44px] hover:bg-emerald-500/20 active:scale-98 transition-all shadow-xs"
        >
          <MessageCircle className="w-4 h-4" />
          <span>WhatsApp Réappro Fournisseur</span>
        </button>
      </div>

      {/* 5. STOCK ITEMS LIST */}
      <div className="space-y-3 font-mono">
        {filteredStockItems.length === 0 ? (
          <div className={`p-8 rounded-3xl border text-center space-y-3 ${isLight ? 'bg-white border-slate-200' : 'bg-[#0B0F19] border-white/10'}`}>
            <Package className="w-8 h-8 mx-auto text-zinc-500 opacity-50" />
            <p className="text-xs text-zinc-400">Aucun article trouvé dans cette catégorie.</p>
          </div>
        ) : (
          filteredStockItems.map((item) => {
            const isLow = item.currentQuantity <= item.minAlertThreshold;
            return (
              <div
                key={item.id}
                className={`p-4 rounded-3xl border transition-all space-y-3 ${
                  isLow
                    ? isLight
                      ? 'bg-rose-50/70 border-rose-200 shadow-xs'
                      : 'bg-rose-500/5 border-rose-500/25 shadow-xs'
                    : isLight
                    ? 'bg-white border-slate-200 shadow-xs'
                    : 'bg-[#0B0F19] border-white/10'
                }`}
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap mb-1">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                        item.category === 'profiles'
                          ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                          : item.category === 'hardware'
                          ? 'bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/30'
                          : item.category === 'gaskets'
                          ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                          : item.category === 'screws'
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      }`}>
                        {item.code}
                      </span>
                      {item.rackLocation && (
                        <span className={`px-1.5 py-0.5 rounded text-[10px] ${
                          isLight ? 'bg-slate-100 text-slate-600' : 'bg-white/5 text-zinc-400'
                        }`}>
                          {item.rackLocation}
                        </span>
                      )}
                    </div>
                    <h4 className={`text-xs font-bold truncate ${isLight ? 'text-slate-900' : 'text-white'}`}>
                      {item.name}
                    </h4>
                    <span className={`text-[10px] block ${isLight ? 'text-slate-500' : 'text-zinc-500'}`}>
                      Fournisseur : {item.supplierName}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDeleteStockItem(item.id)}
                    className={`p-1.5 rounded-xl hover:text-rose-400 cursor-pointer ${
                      isLight ? 'text-slate-300 hover:bg-slate-100' : 'text-zinc-600 hover:bg-white/5'
                    }`}
                    title="Supprimer cet article du stock"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Stock status indicator */}
                <div className="flex items-center justify-between text-xs pt-1 border-t border-black/5 dark:border-white/5">
                  <div className="flex items-center gap-1.5">
                    {isLow ? (
                      <>
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                        <span className="text-[11px] font-bold text-rose-500">
                          Seuil critique (Min : {item.minAlertThreshold})
                        </span>
                      </>
                    ) : (
                      <span className={`text-[11px] ${isLight ? 'text-slate-600' : 'text-zinc-400'}`}>
                        Seuil min de sécurité : {item.minAlertThreshold} {item.unit}
                      </span>
                    )}
                  </div>

                  <span className={`text-xs font-bold ${isLight ? 'text-slate-700' : 'text-zinc-300'}`}>
                    {item.unitCostDzd.toLocaleString('fr-DZ')} DZD / {item.unit.split(' ')[0]}
                  </span>
                </div>

                {/* Quantity Stepper & Control */}
                <div className={`p-2 rounded-2xl flex items-center justify-between gap-3 ${
                  isLight ? 'bg-slate-50 border border-slate-200' : 'bg-black/30 border border-white/5'
                }`}>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleStockDelta(item.id, -5)}
                      disabled={item.currentQuantity < 5}
                      className={`px-2 py-1.5 rounded-xl border text-[10px] font-bold cursor-pointer transition-all ${
                        item.currentQuantity < 5
                          ? 'opacity-30 cursor-not-allowed border-transparent'
                          : isLight
                          ? 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100'
                          : 'bg-white/5 border-white/10 text-zinc-300 hover:bg-white/10'
                      }`}
                      title="Retirer 5 unités"
                    >
                      -5
                    </button>
                    <button
                      type="button"
                      onClick={() => handleStockDelta(item.id, -1)}
                      disabled={item.currentQuantity <= 0}
                      className={`w-8 h-8 rounded-xl border flex items-center justify-center font-bold text-xs cursor-pointer transition-all ${
                        item.currentQuantity <= 0
                          ? 'opacity-30 cursor-not-allowed border-transparent'
                          : isLight
                          ? 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100'
                          : 'bg-white/5 border-white/10 text-zinc-300 hover:bg-white/10'
                      }`}
                      title="Retirer 1 unité"
                    >
                      -1
                    </button>
                  </div>

                  <div className="text-center">
                    <span className={`text-base font-black ${
                      isLow ? 'text-rose-500' : isLight ? 'text-slate-900' : 'text-white'
                    }`}>
                      {item.currentQuantity}
                    </span>
                    <span className={`text-[10px] block font-medium ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
                      {item.unit}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleStockDelta(item.id, 1)}
                      className={`w-8 h-8 rounded-xl border flex items-center justify-center font-bold text-xs cursor-pointer transition-all ${
                        isLight
                          ? 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100'
                          : 'bg-white/5 border-white/10 text-zinc-300 hover:bg-white/10'
                      }`}
                      title="Ajouter 1 unité"
                    >
                      +1
                    </button>
                    <button
                      type="button"
                      onClick={() => handleStockDelta(item.id, 5)}
                      className={`px-2 py-1.5 rounded-xl border text-[10px] font-bold cursor-pointer transition-all ${
                        isLight
                          ? 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100'
                          : 'bg-white/5 border-white/10 text-zinc-300 hover:bg-white/10'
                      }`}
                      title="Ajouter 5 unités"
                    >
                      +5
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}

        {/* Reset Defaults button */}
        <div className="pt-2 text-center">
          <button
            type="button"
            onClick={handleResetDefaultStock}
            className="text-[11px] font-mono text-zinc-500 hover:text-[#D4AF37] cursor-pointer inline-flex items-center gap-1"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Réinitialiser avec le stock standard d atelier</span>
          </button>
        </div>
      </div>
    </div>
  )}

  {/* 4. MODAL NOUVELLE AFFAIRE (BOTTOM SHEET / DIALOG) */}
      {isNewJobModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div
            className={`w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl border shadow-2xl p-5 space-y-4 font-mono text-xs ${
              isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-[#0E131F] border-white/10 text-white'
            }`}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-black/10 dark:border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-[#D4AF37]" />
                <h3 className="text-sm font-bold">Nouvelle Affaire Atelier</h3>
              </div>
              <button
                onClick={() => {
                  playTactileClick();
                  setIsNewJobModalOpen(false);
                  setFormError(null);
                }}
                className={`p-1.5 rounded-xl ${
                  isLight ? 'hover:bg-slate-100 text-slate-400 hover:text-slate-800' : 'hover:bg-white/10 text-zinc-400 hover:text-white'
                }`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {formError && (
              <div className="p-2.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-400 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            {/* Quick Prefill from Field Survey */}
            {surveyProjectData && surveyProjectData.openings.length > 0 && (
              <button
                type="button"
                onClick={handlePrefillFromSurvey}
                className={`w-full p-2.5 rounded-2xl border flex items-center justify-between gap-2 text-xs font-mono font-medium transition-all cursor-pointer ${
                  isLight
                    ? 'bg-amber-50 hover:bg-amber-100 text-amber-950 border-amber-300 shadow-xs'
                    : 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border-amber-500/30'
                }`}
              >
                <div className="flex items-center gap-2">
                  <ClipboardList className="w-4 h-4 text-[#D4AF37]" />
                  <span>Importer depuis le carnet ({surveyProjectData.info?.clientName || 'Client Chantier'})</span>
                </div>
                <span className="text-[10px] opacity-75 font-normal">
                  {surveyProjectData.openings.length} châssis
                </span>
              </button>
            )}

            <form onSubmit={handleCreateJob} className="space-y-3">
              {/* Client Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className={`text-[11px] block ${isLight ? 'text-slate-600 font-medium' : 'text-zinc-400'}`}>Nom du Client *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: M. Benali, Résidence El Bahdja"
                    value={newClientName}
                    onChange={(e) => setNewClientName(e.target.value)}
                    className={`w-full p-2.5 rounded-xl border focus:outline-none focus:border-[#D4AF37] ${
                      isLight ? 'border-slate-300 bg-slate-50 text-slate-900 placeholder:text-slate-400' : 'border-white/10 bg-black/20 text-white placeholder:text-zinc-500'
                    }`}
                  />
                </div>

                <div className="space-y-1">
                  <label className={`text-[11px] block ${isLight ? 'text-slate-600 font-medium' : 'text-zinc-400'}`}>Téléphone *</label>
                  <input
                    type="tel"
                    required
                    placeholder="Ex: 0550123456"
                    value={newClientPhone}
                    onChange={(e) => setNewClientPhone(e.target.value)}
                    className={`w-full p-2.5 rounded-xl border focus:outline-none focus:border-[#D4AF37] ${
                      isLight ? 'border-slate-300 bg-slate-50 text-slate-900 placeholder:text-slate-400' : 'border-white/10 bg-black/20 text-white placeholder:text-zinc-500'
                    }`}
                  />
                </div>
              </div>

              {/* Wilaya & Stage */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className={`text-[11px] block ${isLight ? 'text-slate-600 font-medium' : 'text-zinc-400'}`}>Wilaya de Pose</label>
                  <select
                    value={newWilaya}
                    onChange={(e) => setNewWilaya(e.target.value)}
                    className={`w-full p-2.5 rounded-xl border focus:outline-none focus:border-[#D4AF37] ${
                      isLight ? 'border-slate-300 bg-slate-50 text-slate-900' : 'border-white/10 bg-black/20 text-white'
                    }`}
                  >
                    {ALGERIAN_WILAYAS_58.map((w) => (
                      <option key={w.code} value={`${w.code} - ${w.nameFr}`} className={isLight ? 'bg-white text-slate-900' : 'bg-[#0B0F19]'}>
                        {w.code} - {w.nameFr} ({w.nameAr})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className={`text-[11px] block ${isLight ? 'text-slate-600 font-medium' : 'text-zinc-400'}`}>Étape Initiale</label>
                  <select
                    value={newStage}
                    onChange={(e) => setNewStage(e.target.value as WorkshopJobStage)}
                    className={`w-full p-2.5 rounded-xl border focus:outline-none focus:border-[#D4AF37] ${
                      isLight ? 'border-slate-300 bg-slate-50 text-slate-900' : 'border-white/10 bg-black/20 text-white'
                    }`}
                  >
                    {STAGE_ORDER.map((st) => (
                      <option key={st} value={st} className={isLight ? 'bg-white text-slate-900' : 'bg-[#0B0F19]'}>
                        {STAGE_CONFIG[st].labelFr}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className={`text-[11px] block ${isLight ? 'text-slate-600 font-medium' : 'text-zinc-400'}`}>Descriptif des Châssis</label>
                <textarea
                  rows={2}
                  placeholder="Ex: 4 Coulissants 180×215 Gamme 45 + 2 Portes-Fenêtres avec volets motorisés"
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className={`w-full p-2.5 rounded-xl border focus:outline-none focus:border-[#D4AF37] resize-none ${
                    isLight ? 'border-slate-300 bg-slate-50 text-slate-900 placeholder:text-slate-400' : 'border-white/10 bg-black/20 text-white placeholder:text-zinc-500'
                  }`}
                />
              </div>

              {/* Financials & Count */}
              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-1">
                  <label className={`text-[11px] block ${isLight ? 'text-slate-600 font-medium' : 'text-zinc-400'}`}>Quantité</label>
                  <input
                    type="number"
                    min={1}
                    value={newItemCount}
                    onChange={(e) => setNewItemCount(parseInt(e.target.value, 10) || 1)}
                    className={`w-full p-2.5 rounded-xl border focus:outline-none focus:border-[#D4AF37] ${
                      isLight ? 'border-slate-300 bg-slate-50 text-slate-900' : 'border-white/10 bg-black/20 text-white'
                    }`}
                  />
                </div>

                <div className="space-y-1">
                  <label className={`text-[11px] block ${isLight ? 'text-slate-600 font-medium' : 'text-zinc-400'}`}>Total (DZD)</label>
                  <input
                    type="number"
                    step={5000}
                    value={newTotalAmount}
                    onChange={(e) => setNewTotalAmount(parseInt(e.target.value, 10) || 0)}
                    className={`w-full p-2.5 rounded-xl border focus:outline-none focus:border-[#D4AF37] ${
                      isLight ? 'border-slate-300 bg-slate-50 text-slate-900' : 'border-white/10 bg-black/20 text-white'
                    }`}
                  />
                </div>

                <div className="space-y-1">
                  <label className={`text-[11px] block ${isLight ? 'text-slate-600 font-medium' : 'text-zinc-400'}`}>Acompte (DZD)</label>
                  <input
                    type="number"
                    step={5000}
                    value={newDeposit}
                    onChange={(e) => setNewDeposit(parseInt(e.target.value, 10) || 0)}
                    className={`w-full p-2.5 rounded-xl border focus:outline-none focus:border-[#D4AF37] ${
                      isLight ? 'border-slate-300 bg-slate-50 text-slate-900' : 'border-white/10 bg-black/20 text-white'
                    }`}
                  />
                </div>
              </div>

              {/* Due Date & Priority */}
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className={`text-[11px] block ${isLight ? 'text-slate-600 font-medium' : 'text-zinc-400'}`}>Date de Livraison</label>
                  <input
                    type="date"
                    value={newDueDate}
                    onChange={(e) => setNewDueDate(e.target.value)}
                    className={`w-full p-2.5 rounded-xl border focus:outline-none focus:border-[#D4AF37] ${
                      isLight ? 'border-slate-300 bg-slate-50 text-slate-900' : 'border-white/10 bg-black/20 text-white'
                    }`}
                  />
                </div>

                <div className="space-y-1">
                  <label className={`text-[11px] block ${isLight ? 'text-slate-600 font-medium' : 'text-zinc-400'}`}>Priorité Atelier</label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as 'normal' | 'urgent' | 'critique')}
                    className={`w-full p-2.5 rounded-xl border focus:outline-none focus:border-[#D4AF37] ${
                      isLight ? 'border-slate-300 bg-slate-50 text-slate-900' : 'border-white/10 bg-black/20 text-white'
                    }`}
                  >
                    <option value="normal" className={isLight ? 'bg-white text-slate-900' : 'bg-[#0B0F19]'}>Normale</option>
                    <option value="urgent" className={isLight ? 'bg-white text-slate-900' : 'bg-[#0B0F19]'}>Urgente</option>
                    <option value="critique" className={isLight ? 'bg-white text-slate-900' : 'bg-[#0B0F19]'}>Critique (Immédiat)</option>
                  </select>
                </div>
              </div>

              {/* Profile System */}
              <div className="space-y-1">
                <label className={`text-[11px] block ${isLight ? 'text-slate-600 font-medium' : 'text-zinc-400'}`}>Gamme Principale</label>
                <div className="grid grid-cols-2 gap-1.5">
                  {[
                    { id: 'gamme_45_thermal', label: 'Gamme 45 RPT' },
                    { id: 'gamme_67_slide', label: 'Coulissant 67 Lourd' },
                    { id: 'gamme_40', label: 'Alugraf 40 Éco' },
                    { id: 'pvc_70_chamber', label: 'PVC 70 Isolation' },
                  ].map((pf) => (
                    <button
                      key={pf.id}
                      type="button"
                      onClick={() => {
                        playSwitchSound();
                        setNewProfileSystem(pf.id);
                      }}
                      className={`p-2 rounded-xl border text-center cursor-pointer transition-all ${
                        newProfileSystem === pf.id
                          ? 'border-[#D4AF37] bg-[#D4AF37]/15 text-[#D4AF37] font-bold'
                          : isLight
                          ? 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                          : 'border-white/10 bg-black/20 text-zinc-400 hover:text-white'
                      }`}
                    >
                      {pf.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewJobModalOpen(false)}
                  className={`w-1/3 py-3 rounded-2xl border cursor-pointer min-h-[48px] ${
                    isLight
                      ? 'border-slate-300 text-slate-700 hover:bg-slate-100'
                      : 'border-white/10 text-zinc-400 hover:text-white'
                  }`}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="w-2/3 py-3 rounded-2xl bg-gradient-to-r from-[#C5A880] to-[#D4AF37] text-slate-950 font-bold flex items-center justify-center gap-1.5 cursor-pointer min-h-[48px] shadow-lg hover:brightness-110 active:scale-98 transition-all"
                >
                  <Check className="w-4 h-4" />
                  <span>Enregistrer l'Affaire</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. MODAL ENCAISSEMENT & VERSEMENT ACOMPTE */}
      {paymentJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div
            className={`w-full max-w-md rounded-3xl border p-5 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto ${
              isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-[#0F1420] border-white/10 text-white'
            }`}
          >
            <div className="flex items-center justify-between border-b pb-3 border-black/5 dark:border-white/10">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <Banknote className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold font-mono">Encaisser un Versement</h3>
                  <p className={`text-[10px] font-mono ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
                    {paymentJob.clientName} • {paymentJob.id}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPaymentJob(null)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Financial Summary Card */}
            <div
              className={`p-3 rounded-2xl border text-xs font-mono grid grid-cols-3 gap-2 text-center ${
                isLight ? 'bg-slate-50 border-slate-200' : 'bg-black/30 border-white/5'
              }`}
            >
              <div>
                <span className="text-[10px] text-zinc-500 block">Total</span>
                <span className="font-bold">{paymentJob.totalAmountDzd.toLocaleString('fr-DZ')} DA</span>
              </div>
              <div>
                <span className="text-[10px] text-zinc-500 block">Déjà Réglé</span>
                <span className="font-bold text-emerald-400">{paymentJob.depositDzd.toLocaleString('fr-DZ')} DA</span>
              </div>
              <div>
                <span className="text-[10px] text-zinc-500 block">Solde Restant</span>
                <span className="font-bold text-[#D4AF37]">
                  {Math.max(0, paymentJob.totalAmountDzd - paymentJob.depositDzd).toLocaleString('fr-DZ')} DA
                </span>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleConfirmPayment} className="space-y-3 font-mono text-xs">
              <div>
                <label className={`text-[10px] block mb-1 ${isLight ? 'text-slate-700 font-medium' : 'text-zinc-400'}`}>
                  Montant du Versement (DZD)
                </label>
                <input
                  type="number"
                  min="1"
                  max={Math.max(0, paymentJob.totalAmountDzd - paymentJob.depositDzd)}
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(parseInt(e.target.value) || 0)}
                  className={`w-full p-2.5 rounded-xl border text-sm font-bold ${
                    isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-black/40 border-white/10 text-white'
                  }`}
                  required
                />
              </div>

              {/* Quick Amount Shortcuts */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {[
                  { label: 'Solde Total', amt: Math.max(0, paymentJob.totalAmountDzd - paymentJob.depositDzd) },
                  { label: '100 000 DA', amt: 100000 },
                  { label: '50 000 DA', amt: 50000 },
                  { label: '20 000 DA', amt: 20000 },
                ]
                  .filter((b) => b.amt > 0 && b.amt <= Math.max(0, paymentJob.totalAmountDzd - paymentJob.depositDzd))
                  .map((btn) => (
                    <button
                      key={btn.label}
                      type="button"
                      onClick={() => setPaymentAmount(btn.amt)}
                      className={`px-2.5 py-1 rounded-lg border text-[10px] cursor-pointer transition-all ${
                        paymentAmount === btn.amt
                          ? 'bg-[#D4AF37] text-slate-950 font-bold border-[#D4AF37]'
                          : isLight
                          ? 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
                          : 'bg-white/5 border-white/10 text-zinc-400 hover:text-white'
                      }`}
                    >
                      {btn.label}
                    </button>
                  ))}
              </div>

              {/* Payment Method Selector */}
              <div>
                <label className={`text-[10px] block mb-1 ${isLight ? 'text-slate-700 font-medium' : 'text-zinc-400'}`}>
                  Mode de Règlement
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  {[
                    { id: 'especes', label: 'Espèces (Cash)' },
                    { id: 'baridimob', label: 'BaridiMob / CCP' },
                    { id: 'virement', label: 'Virement Bancaire' },
                    { id: 'cheque', label: 'Chèque de Banque' },
                  ].map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setPaymentMethod(m.id as any)}
                      className={`p-2 rounded-xl border text-[11px] text-left cursor-pointer transition-all ${
                        paymentMethod === m.id
                          ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400 font-bold'
                          : isLight
                          ? 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                          : 'bg-black/30 border-white/5 text-zinc-400 hover:text-white'
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Note / Check or Transfer Ref */}
              <div>
                <label className={`text-[10px] block mb-1 ${isLight ? 'text-slate-700 font-medium' : 'text-zinc-400'}`}>
                  Référence / Note de versement (optionnel)
                </label>
                <input
                  type="text"
                  placeholder="Ex: Reçu BaridiMob N°8491, Chèque BNA N°..."
                  value={paymentNote}
                  onChange={(e) => setPaymentNote(e.target.value)}
                  className={`w-full p-2 rounded-xl border text-xs ${
                    isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-black/40 border-white/10 text-white'
                  }`}
                />
              </div>

              {/* WhatsApp Receipt Toggle */}
              <label className="flex items-center gap-2 pt-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={sendWhatsAppReceipt}
                  onChange={(e) => setSendWhatsAppReceipt(e.target.checked)}
                  className="rounded border-zinc-600 text-emerald-500 focus:ring-0 cursor-pointer"
                />
                <span className={`text-[11px] ${isLight ? 'text-slate-700' : 'text-zinc-300'}`}>
                  Envoyer automatiquement le reçu officiel par WhatsApp
                </span>
              </label>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-black/5 dark:border-white/10">
                <button
                  type="button"
                  onClick={() => setPaymentJob(null)}
                  className="px-3 py-2 rounded-xl border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer text-xs"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={paymentAmount <= 0}
                  className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold cursor-pointer hover:bg-emerald-500 disabled:opacity-50 transition-all text-xs flex items-center gap-1.5 shadow-md"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Valider l'Encaissement</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. MODAL NOUVEL ARTICLE STOCK */}
      {isNewStockModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div
            className={`w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl border shadow-2xl p-5 space-y-4 font-mono text-xs ${
              isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-[#0E131F] border-white/10 text-white'
            }`}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-black/10 dark:border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-[#D4AF37]" />
                <h3 className="text-sm font-bold">Nouvel Article en Stock</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsNewStockModalOpen(false)}
                className={`p-1.5 rounded-xl ${
                  isLight ? 'hover:bg-slate-100 text-slate-400 hover:text-slate-800' : 'hover:bg-white/10 text-zinc-400 hover:text-white'
                }`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateStockItem} className="space-y-3">
              <div className="space-y-1">
                <label className={`text-[11px] block ${isLight ? 'text-slate-600 font-medium' : 'text-zinc-400'}`}>Désignation de l'Article *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Meneau 45 RPT Tubulaire (6.00m)"
                  value={newStockName}
                  onChange={(e) => setNewStockName(e.target.value)}
                  className={`w-full p-2.5 rounded-xl border focus:outline-none focus:border-[#D4AF37] ${
                    isLight ? 'border-slate-300 bg-slate-50 text-slate-900 placeholder:text-slate-400' : 'border-white/10 bg-black/20 text-white placeholder:text-zinc-500'
                  }`}
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className={`text-[11px] block ${isLight ? 'text-slate-600 font-medium' : 'text-zinc-400'}`}>Code / Référence</label>
                  <input
                    type="text"
                    placeholder="Ex: ALU-MEN-45"
                    value={newStockCode}
                    onChange={(e) => setNewStockCode(e.target.value)}
                    className={`w-full p-2.5 rounded-xl border focus:outline-none focus:border-[#D4AF37] ${
                      isLight ? 'border-slate-300 bg-slate-50 text-slate-900 placeholder:text-slate-400' : 'border-white/10 bg-black/20 text-white placeholder:text-zinc-500'
                    }`}
                  />
                </div>

                <div className="space-y-1">
                  <label className={`text-[11px] block ${isLight ? 'text-slate-600 font-medium' : 'text-zinc-400'}`}>Catégorie</label>
                  <select
                    value={newStockCategory}
                    onChange={(e) => setNewStockCategory(e.target.value as WorkshopStockCategory)}
                    className={`w-full p-2.5 rounded-xl border focus:outline-none focus:border-[#D4AF37] ${
                      isLight ? 'border-slate-300 bg-slate-50 text-slate-900' : 'border-white/10 bg-black/20 text-white'
                    }`}
                  >
                    <option value="profiles">Profilés 6m</option>
                    <option value="hardware">Quincaillerie</option>
                    <option value="gaskets">Joints & Cales</option>
                    <option value="screws">Visserie & Fixation</option>
                    <option value="glass">Vitrage</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-1">
                  <label className={`text-[11px] block ${isLight ? 'text-slate-600 font-medium' : 'text-zinc-400'}`}>Quantité Initiale</label>
                  <input
                    type="number"
                    min={0}
                    value={newStockQuantity}
                    onChange={(e) => setNewStockQuantity(parseInt(e.target.value) || 0)}
                    className={`w-full p-2.5 rounded-xl border focus:outline-none focus:border-[#D4AF37] ${
                      isLight ? 'border-slate-300 bg-slate-50 text-slate-900' : 'border-white/10 bg-black/20 text-white'
                    }`}
                  />
                </div>

                <div className="space-y-1">
                  <label className={`text-[11px] block ${isLight ? 'text-slate-600 font-medium' : 'text-zinc-400'}`}>Seuil Alerte Min</label>
                  <input
                    type="number"
                    min={0}
                    value={newStockMinThreshold}
                    onChange={(e) => setNewStockMinThreshold(parseInt(e.target.value) || 0)}
                    className={`w-full p-2.5 rounded-xl border focus:outline-none focus:border-[#D4AF37] ${
                      isLight ? 'border-slate-300 bg-slate-50 text-slate-900' : 'border-white/10 bg-black/20 text-white'
                    }`}
                  />
                </div>

                <div className="space-y-1">
                  <label className={`text-[11px] block ${isLight ? 'text-slate-600 font-medium' : 'text-zinc-400'}`}>Unité</label>
                  <input
                    type="text"
                    value={newStockUnit}
                    onChange={(e) => setNewStockUnit(e.target.value)}
                    placeholder="barres, pcs..."
                    className={`w-full p-2.5 rounded-xl border focus:outline-none focus:border-[#D4AF37] ${
                      isLight ? 'border-slate-300 bg-slate-50 text-slate-900' : 'border-white/10 bg-black/20 text-white'
                    }`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className={`text-[11px] block ${isLight ? 'text-slate-600 font-medium' : 'text-zinc-400'}`}>Prix Unitaire Estimé (DZD)</label>
                  <input
                    type="number"
                    min={0}
                    step={50}
                    value={newStockUnitCost}
                    onChange={(e) => setNewStockUnitCost(parseInt(e.target.value) || 0)}
                    className={`w-full p-2.5 rounded-xl border focus:outline-none focus:border-[#D4AF37] ${
                      isLight ? 'border-slate-300 bg-slate-50 text-slate-900' : 'border-white/10 bg-black/20 text-white'
                    }`}
                  />
                </div>

                <div className="space-y-1">
                  <label className={`text-[11px] block ${isLight ? 'text-slate-600 font-medium' : 'text-zinc-400'}`}>Casier / Rack</label>
                  <input
                    type="text"
                    value={newStockRack}
                    onChange={(e) => setNewStockRack(e.target.value)}
                    placeholder="Ex: RACK-A-03"
                    className={`w-full p-2.5 rounded-xl border focus:outline-none focus:border-[#D4AF37] ${
                      isLight ? 'border-slate-300 bg-slate-50 text-slate-900' : 'border-white/10 bg-black/20 text-white'
                    }`}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className={`text-[11px] block ${isLight ? 'text-slate-600 font-medium' : 'text-zinc-400'}`}>Fournisseur Habituel</label>
                <input
                  type="text"
                  value={newStockSupplier}
                  onChange={(e) => setNewStockSupplier(e.target.value)}
                  placeholder="Ex: Profilor, Algal, Quincaillerie El Eulma..."
                  className={`w-full p-2.5 rounded-xl border focus:outline-none focus:border-[#D4AF37] ${
                    isLight ? 'border-slate-300 bg-slate-50 text-slate-900' : 'border-white/10 bg-black/20 text-white'
                  }`}
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-black/10 dark:border-white/10">
                <button
                  type="button"
                  onClick={() => setIsNewStockModalOpen(false)}
                  className={`px-4 py-2 rounded-xl border font-bold text-xs cursor-pointer ${
                    isLight ? 'border-slate-300 hover:bg-slate-100 text-slate-700' : 'border-white/10 hover:bg-white/5 text-zinc-300'
                  }`}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#D4AF37] text-slate-950 font-bold text-xs cursor-pointer hover:brightness-110 active:scale-95 transition-all shadow-md"
                >
                  Enregistrer l'Article
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Quality Control Modal */}
      {qualityJob && (
        <WorkshopQualityModal
          key={qualityJob.id}
          isOpen={isQualityModalOpen}
          onClose={() => {
            setIsQualityModalOpen(false);
            setQualityJob(null);
          }}
          job={qualityJob}
          onInspectionSaved={() => {
            setQaRefreshKey((k) => k + 1);
          }}
        />
      )}

      {/* Floating Payment Toast */}
      {paymentToast && (
        <div className="fixed bottom-24 left-4 right-4 z-50 flex items-center justify-between gap-3 p-3.5 rounded-2xl bg-slate-900/95 text-white border border-emerald-500/40 shadow-xl backdrop-blur-md animate-in fade-in slide-in-from-bottom-3 duration-200">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
              <Check className="w-4 h-4" />
            </div>
            <span className="text-xs font-mono font-medium truncate">{paymentToast}</span>
          </div>
          <button
            type="button"
            onClick={() => setPaymentToast(null)}
            className="p-1 rounded-lg hover:bg-white/10 text-zinc-400 hover:text-white shrink-0 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};

export default MobileWorkshopScreen;
