import React, { useState, useMemo } from 'react';
import type { WorkshopJob, WorkshopJobStage, JobPriority } from '../../types/workshop';
import {
  getWorkshopJobs,
  addWorkshopJob,
  updateJobStage,
  deleteJob,
  STAGE_CONFIG,
  STAGE_ORDER,
} from '../../utils/workshopJobManager';
import { useConfigStore } from '../../store/configStore';
import { ALGERIAN_WILAYAS_58 } from '../../utils/algerianWilayas';
import { playTactileClick, playSwitchSound } from '../../utils/audioFeedback';
import {
  Layers,
  Plus,
  ArrowRight,
  ArrowLeft,
  Trash2,
  MessageCircle,
  Calendar,
  DollarSign,
  AlertTriangle,
  Search,
  CheckCircle2,
  X,
  Sparkles,
} from 'lucide-react';

export const WorkshopJobTracker: React.FC = () => {
  const { config, cost, theme, language } = useConfigStore();
  const isLight = theme === 'light';
  const isRtl = language === 'ar';

  const [jobs, setJobs] = useState<WorkshopJob[]>(() => getWorkshopJobs());
  const [filterStage, setFilterStage] = useState<WorkshopJobStage | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isNewJobModalOpen, setIsNewJobModalOpen] = useState(false);

  // Form State for new job
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [wilaya, setWilaya] = useState('16 - Alger');
  const [itemCount, setItemCount] = useState(4);
  const [description, setDescription] = useState('');
  const [totalAmountDzd, setTotalAmountDzd] = useState(180000);
  const [depositDzd, setDepositDzd] = useState(90000);
  const [dueDate, setDueDate] = useState(() =>
    new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]
  );
  const [priority, setPriority] = useState<JobPriority>('normal');
  const [notes, setNotes] = useState('');

  // Pre-fill from current 3D configurator
  const handleImportFrom3DConfig = () => {
    playSwitchSound();
    setDescription(
      `Châssis ${config.profileSystem.replace('_', ' ').toUpperCase()} (${config.width} × ${config.height} mm)`
    );
    setTotalAmountDzd(Math.round(cost.totalEstimatedDzd * itemCount));
    setDepositDzd(Math.round((cost.totalEstimatedDzd * itemCount) * 0.5));
    setNotes(
      `Finition: ${config.finishColor} • Vitrage: ${config.glassType} • Remplissage conforme CNERIB`
    );
  };

  const handleCreateJob = (e: React.FormEvent) => {
    e.preventDefault();
    playTactileClick();
    if (!clientName.trim()) return;

    const created = addWorkshopJob({
      clientName: clientName.trim(),
      clientPhone: clientPhone.trim() || '05 50 00 00 00',
      wilaya,
      stage: 'devis',
      itemCount: Number(itemCount) || 1,
      description: description.trim() || 'Menuiserie Aluminium & Vitrage',
      totalAmountDzd: Number(totalAmountDzd) || 0,
      depositDzd: Number(depositDzd) || 0,
      dueDate,
      priority,
      notes,
    });

    setJobs((prev) => [created, ...prev]);
    setIsNewJobModalOpen(false);

    // Reset fields
    setClientName('');
    setClientPhone('');
    setDescription('');
    setNotes('');
  };

  const handleStageMove = (id: string, currentStage: WorkshopJobStage, direction: 'next' | 'prev') => {
    playTactileClick();
    const curIdx = STAGE_ORDER.indexOf(currentStage);
    const targetIdx = direction === 'next' ? curIdx + 1 : curIdx - 1;

    if (targetIdx >= 0 && targetIdx < STAGE_ORDER.length) {
      const targetStage = STAGE_ORDER[targetIdx];
      const updated = updateJobStage(id, targetStage);
      if (updated) {
        setJobs(getWorkshopJobs());
      }
    }
  };

  const handleDeleteJob = (id: string) => {
    playTactileClick();
    if (window.confirm('Voulez-vous archiver et supprimer cet ordre de fabrication ?')) {
      deleteJob(id);
      setJobs(getWorkshopJobs());
    }
  };

  const handleShareWhatsApp = (job: WorkshopJob) => {
    playTactileClick();
    const cleanPhone = job.clientPhone.replace(/\D/g, '');
    const waPhone = cleanPhone.startsWith('0') ? '213' + cleanPhone.slice(1) : cleanPhone;
    const stageInfo = STAGE_CONFIG[job.stage];
    const msg = `*SUIVI DE FABRICATION ATELIER - BAITI*\nRéférence : *${job.id}*\nClient : ${job.clientName}\nStatut Actuel : *${stageInfo.labelFr}*\nOuvrages : ${job.itemCount} pièces (${job.description})\nTotal : ${job.totalAmountDzd.toLocaleString('fr-DZ')} DZD\nAcompte : ${job.depositDzd.toLocaleString('fr-DZ')} DZD\nDate Prévue : ${job.dueDate}\n\nConçu avec Baiti Atelier (58 Wilayas Algérie)\nhttps://web-two-tan-31.vercel.app`;
    window.open(`https://wa.me/${waPhone}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  // KPIs
  const kpis = useMemo(() => {
    const totalPipeline = jobs.reduce((acc, j) => acc + j.totalAmountDzd, 0);
    const totalDeposits = jobs.reduce((acc, j) => acc + j.depositDzd, 0);
    const activeJobs = jobs.filter((j) => j.stage !== 'termine');
    const totalChassis = activeJobs.reduce((acc, j) => acc + j.itemCount, 0);
    const urgentCount = activeJobs.filter((j) => j.priority === 'urgent' || j.priority === 'critique').length;

    return {
      totalPipeline,
      totalDeposits,
      balanceDue: totalPipeline - totalDeposits,
      activeCount: activeJobs.length,
      totalChassis,
      urgentCount,
    };
  }, [jobs]);

  // Filtered jobs
  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      if (filterStage !== 'all' && job.stage !== filterStage) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = job.clientName.toLowerCase().includes(q);
        const matchId = job.id.toLowerCase().includes(q);
        const matchWilaya = job.wilaya.toLowerCase().includes(q);
        const matchDesc = job.description.toLowerCase().includes(q);
        if (!matchName && !matchId && !matchWilaya && !matchDesc) return false;
      }
      return true;
    });
  }, [jobs, filterStage, searchQuery]);

  return (
    <div className="space-y-6" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* TOP HEADER & ACTIONS */}
      <div
        className={`p-6 rounded-3xl border flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all ${
          isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#0E121C] border-white/10'
        }`}
      >
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-[#D4AF37]/10 text-[#D4AF37]">
              <Layers className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold tracking-tight">
              {language === 'ar' ? 'نظام تتبع الإنتاج والورشة' : 'Suivi de Fabrication & Ordres d\'Atelier'}
            </h2>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-semibold">
              KANBAN INDUSTRIEL
            </span>
          </div>
          <p className={`text-xs mt-1.5 max-w-2xl ${isLight ? 'text-slate-600' : 'text-zinc-400'}`}>
            Pilotez chaque chantier depuis le métré initial jusqu'à la pose finale sur chantier. Mettez à jour le statut en un clic et notifiez vos clients sur WhatsApp.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={() => {
              playTactileClick();
              setIsNewJobModalOpen(true);
            }}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#C5A880] to-[#D4AF37] hover:brightness-110 text-slate-950 font-bold text-xs flex items-center gap-2 transition-all shadow-md shadow-[#D4AF37]/25 cursor-pointer hover-lift btn-press"
          >
            <Plus className="w-4 h-4" />
            <span>Nouvel Ordre de Fabrication</span>
          </button>
        </div>
      </div>

      {/* KPI METRICS OVERVIEW */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 font-mono">
        <div
          className={`p-4 rounded-2xl border ${
            isLight ? 'bg-white border-slate-200 shadow-xs' : 'bg-[#0E121C] border-white/10'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span>Volume Affaires En Cours</span>
            <DollarSign className="w-3.5 h-3.5 text-[#D4AF37]" />
          </div>
          <div className="text-xl sm:text-2xl font-bold mt-1 text-[#D4AF37]">
            {kpis.totalPipeline.toLocaleString('fr-DZ')} <span className="text-xs">DZD</span>
          </div>
          <div className={`text-[11px] mt-1 ${isLight ? 'text-slate-500' : 'text-zinc-500'}`}>
            {kpis.activeCount} affaires actives
          </div>
        </div>

        <div
          className={`p-4 rounded-2xl border ${
            isLight ? 'bg-white border-slate-200 shadow-xs' : 'bg-[#0E121C] border-white/10'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span>Châssis en Atelier</span>
            <Layers className="w-3.5 h-3.5 text-sky-400" />
          </div>
          <div className="text-xl sm:text-2xl font-bold mt-1 text-sky-400">
            {kpis.totalChassis} <span className="text-xs">unités</span>
          </div>
          <div className={`text-[11px] mt-1 ${isLight ? 'text-slate-500' : 'text-zinc-500'}`}>
            Découpe, usinage et assemblage
          </div>
        </div>

        <div
          className={`p-4 rounded-2xl border ${
            isLight ? 'bg-white border-slate-200 shadow-xs' : 'bg-[#0E121C] border-white/10'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span>Acomptes Encaissés</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-xl sm:text-2xl font-bold mt-1 text-emerald-400">
            {kpis.totalDeposits.toLocaleString('fr-DZ')} <span className="text-xs">DZD</span>
          </div>
          <div className={`text-[11px] mt-1 ${isLight ? 'text-slate-500' : 'text-zinc-500'}`}>
            Reste à recouvrer: {kpis.balanceDue.toLocaleString('fr-DZ')} DZD
          </div>
        </div>

        <div
          className={`p-4 rounded-2xl border ${
            isLight ? 'bg-white border-slate-200 shadow-xs' : 'bg-[#0E121C] border-white/10'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span>Urgences Chantier</span>
            <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
          </div>
          <div className="text-xl sm:text-2xl font-bold mt-1 text-rose-400">
            {kpis.urgentCount} <span className="text-xs">urgences</span>
          </div>
          <div className={`text-[11px] mt-1 ${isLight ? 'text-slate-500' : 'text-zinc-500'}`}>
            Priorité haute / critique
          </div>
        </div>
      </div>

      {/* SEARCH AND STAGE FILTER STRIP */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Search input */}
        <div
          className={`w-full sm:w-80 flex items-center gap-2 px-3 py-2 rounded-2xl border text-xs ${
            isLight ? 'bg-white border-slate-200 text-slate-800' : 'bg-[#0E121C] border-white/10 text-white'
          }`}
        >
          <Search className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
          <input
            type="text"
            placeholder="Rechercher par client, réf, wilaya..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent border-none outline-none w-full text-xs font-mono placeholder:text-zinc-500"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="text-zinc-400 hover:text-white">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Stage Filter Buttons */}
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar max-w-full pb-1">
          <button
            onClick={() => {
              playTactileClick();
              setFilterStage('all');
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all shrink-0 cursor-pointer ${
              filterStage === 'all'
                ? 'bg-[#D4AF37] text-slate-950 shadow-sm'
                : isLight
                ? 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                : 'bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white'
            }`}
          >
            Tous ({jobs.length})
          </button>
          {STAGE_ORDER.map((st) => {
            const count = jobs.filter((j) => j.stage === st).length;
            const cfg = STAGE_CONFIG[st];
            return (
              <button
                key={st}
                onClick={() => {
                  playTactileClick();
                  setFilterStage(st);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono font-medium transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
                  filterStage === st
                    ? 'bg-[#D4AF37] text-slate-950 font-bold shadow-sm'
                    : isLight
                    ? 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    : 'bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white'
                }`}
              >
                <span>{cfg.labelFr.split('. ')[1]}</span>
                <span className="text-[10px] opacity-75 font-bold">({count})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* KANBAN LANES OR CARD GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredJobs.map((job) => {
          const cfg = STAGE_CONFIG[job.stage];
          const curIdx = STAGE_ORDER.indexOf(job.stage);
          const hasPrev = curIdx > 0;
          const hasNext = curIdx < STAGE_ORDER.length - 1;

          return (
            <div
              key={job.id}
              className={`p-5 rounded-3xl border flex flex-col justify-between gap-4 transition-all hover:shadow-lg ${
                isLight ? 'bg-white border-slate-200 shadow-xs' : 'bg-[#0E121C] border-white/10'
              }`}
            >
              {/* Card Top: Reference, Stage Pill & Priority */}
              <div>
                <div className="flex items-center justify-between gap-2 mb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-[#D4AF37]">{job.id}</span>
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded-md font-semibold border ${
                        isLight ? cfg.bgLight : cfg.bgDark
                      } ${cfg.color}`}
                    >
                      {cfg.labelFr}
                    </span>
                  </div>

                  {job.priority !== 'normal' && (
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold uppercase ${
                        job.priority === 'critique'
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      }`}
                    >
                      {job.priority}
                    </span>
                  )}
                </div>

                {/* Client Name & Wilaya */}
                <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
                  {job.clientName}
                </h3>
                <p className={`text-xs mt-0.5 font-mono ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
                  {job.wilaya} • {job.itemCount} châssis
                </p>

                {/* Description */}
                <p className={`text-xs mt-2 p-2.5 rounded-xl border font-sans ${
                  isLight ? 'bg-slate-50 border-slate-200 text-slate-700' : 'bg-white/5 border-white/5 text-zinc-300'
                }`}>
                  {job.description}
                </p>

                {/* Notes if any */}
                {job.notes && (
                  <p className={`text-[11px] mt-1.5 italic font-sans ${isLight ? 'text-slate-500' : 'text-zinc-500'}`}>
                    Note : {job.notes}
                  </p>
                )}
              </div>

              {/* Card Bottom: Financials, Due Date and Controls */}
              <div className="pt-3 border-t border-black/5 dark:border-white/5 flex flex-col gap-3">
                <div className="flex items-center justify-between text-xs font-mono">
                  <div>
                    <span className="text-zinc-500 text-[10px] block">Montant Global</span>
                    <span className="font-bold text-[#D4AF37]">
                      {job.totalAmountDzd.toLocaleString('fr-DZ')} DZD
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-zinc-500 text-[10px] block">Acompte Reçu</span>
                    <span className="font-bold text-emerald-400">
                      {job.depositDzd.toLocaleString('fr-DZ')} DZD
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-zinc-500 text-[10px] block">Échéance</span>
                    <span className="font-bold text-sky-400 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>{job.dueDate}</span>
                    </span>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex items-center justify-between gap-1.5 pt-1">
                  {/* WhatsApp Notify */}
                  <button
                    onClick={() => handleShareWhatsApp(job)}
                    className="p-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 text-xs flex items-center gap-1 transition-colors cursor-pointer"
                    title="Envoyer un point d'étape au client sur WhatsApp"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline text-[11px]">WhatsApp</span>
                  </button>

                  {/* Move Prev / Next Stage Buttons */}
                  <div className="flex items-center gap-1">
                    {hasPrev && (
                      <button
                        onClick={() => handleStageMove(job.id, job.stage, 'prev')}
                        className={`p-2 rounded-xl border text-xs transition-colors cursor-pointer ${
                          isLight
                            ? 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700'
                            : 'bg-white/5 hover:bg-white/10 border-white/10 text-zinc-300'
                        }`}
                        title="Étape précédente"
                      >
                        <ArrowLeft className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {hasNext ? (
                      <button
                        onClick={() => handleStageMove(job.id, job.stage, 'next')}
                        className="px-3 py-1.5 rounded-xl bg-[#D4AF37] hover:brightness-110 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
                        title="Passer à l'étape de production suivante"
                      >
                        <span>Étape Suivante</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <span className="text-[11px] font-mono font-bold text-emerald-400 px-2 py-1 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                        Terminé ✓
                      </span>
                    )}

                    {/* Delete */}
                    <button
                      onClick={() => handleDeleteJob(job.id)}
                      className="p-2 rounded-xl text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer ml-1"
                      title="Archiver et supprimer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {filteredJobs.length === 0 && (
          <div
            className={`col-span-full p-12 text-center rounded-3xl border ${
              isLight ? 'bg-white border-slate-200 text-slate-600' : 'bg-[#0E121C] border-white/10 text-zinc-400'
            }`}
          >
            <Layers className="w-10 h-10 text-zinc-500 mx-auto mb-3" />
            <p className="text-base font-bold">Aucune affaire trouvée</p>
            <p className="text-xs mt-1 text-zinc-500">
              Modifiez vos critères de recherche ou créez un nouvel ordre de fabrication.
            </p>
          </div>
        )}
      </div>

      {/* MODAL: NOUVEL ORDRE DE FABRICATION */}
      {isNewJobModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div
            className={`w-full max-w-lg rounded-3xl border p-6 shadow-2xl transition-all max-h-[90vh] overflow-y-auto ${
              isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-[#0E121C] border-white/15 text-white'
            }`}
          >
            <div className="flex items-center justify-between pb-4 border-b border-black/10 dark:border-white/10">
              <div className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-[#D4AF37]" />
                <h3 className="text-lg font-bold">Créer un Ordre de Fabrication</h3>
              </div>
              <button
                onClick={() => setIsNewJobModalOpen(false)}
                className="p-1.5 rounded-xl hover:bg-white/10 text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Action: Pre-fill from 3D Config */}
            <div className="my-4 p-3 rounded-2xl bg-[#D4AF37]/10 border border-[#D4AF37]/20 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs">
                <Sparkles className="w-4 h-4 text-[#D4AF37] shrink-0" />
                <span>Importer dimensions & chiffrage du configurateur 3D actuel ({config.width} × {config.height} mm)</span>
              </div>
              <button
                type="button"
                onClick={handleImportFrom3DConfig}
                className="px-3 py-1.5 rounded-xl bg-[#D4AF37] text-slate-950 font-bold text-xs cursor-pointer hover:brightness-110 shrink-0"
              >
                Importer
              </button>
            </div>

            <form onSubmit={handleCreateJob} className="space-y-4 text-xs font-mono">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-400 mb-1">Nom du Client / Chantier *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Villa Belhadj Kouba"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    className={`w-full p-2.5 rounded-xl border ${
                      isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-white/5 border-white/10 text-white'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 mb-1">Téléphone Client</label>
                  <input
                    type="tel"
                    placeholder="05 50 12 34 56"
                    value={clientPhone}
                    onChange={(e) => setClientPhone(e.target.value)}
                    className={`w-full p-2.5 rounded-xl border ${
                      isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-white/5 border-white/10 text-white'
                    }`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-400 mb-1">Wilaya d'Installation</label>
                  <select
                    value={wilaya}
                    onChange={(e) => setWilaya(e.target.value)}
                    className={`w-full p-2.5 rounded-xl border ${
                      isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-black border-white/10 text-white'
                    }`}
                  >
                    {ALGERIAN_WILAYAS_58.map((w) => (
                      <option key={w.code} value={`${w.code} - ${w.nameFr}`}>
                        {w.code} - {w.nameFr} ({w.nameAr})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-zinc-400 mb-1">Nombre d'Ouvrages (Châssis)</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={itemCount}
                    onChange={(e) => setItemCount(Number(e.target.value))}
                    className={`w-full p-2.5 rounded-xl border ${
                      isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-white/5 border-white/10 text-white'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">Description Technique des Ouvrages</label>
                <input
                  type="text"
                  placeholder="Ex: 4 Coulissants 2V + Volets Roulants Monobloc"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className={`w-full p-2.5 rounded-xl border ${
                    isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-white/5 border-white/10 text-white'
                  }`}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-400 mb-1">Montant Total TTC (DZD)</label>
                  <input
                    type="number"
                    step="1000"
                    value={totalAmountDzd}
                    onChange={(e) => setTotalAmountDzd(Number(e.target.value))}
                    className={`w-full p-2.5 rounded-xl border ${
                      isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-white/5 border-white/10 text-white'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 mb-1">Acompte Encaissé (DZD)</label>
                  <input
                    type="number"
                    step="1000"
                    value={depositDzd}
                    onChange={(e) => setDepositDzd(Number(e.target.value))}
                    className={`w-full p-2.5 rounded-xl border ${
                      isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-white/5 border-white/10 text-white'
                    }`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-400 mb-1">Date d'Échéance Prévue</label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className={`w-full p-2.5 rounded-xl border ${
                      isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-white/5 border-white/10 text-white'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 mb-1">Niveau d'Urgence</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as JobPriority)}
                    className={`w-full p-2.5 rounded-xl border ${
                      isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-black border-white/10 text-white'
                    }`}
                  >
                    <option value="normal">Normal</option>
                    <option value="urgent">Urgent</option>
                    <option value="critique">Critique (Chantier Bloqué)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">Notes & Consignes Atelier</label>
                <textarea
                  rows={2}
                  placeholder="Consignes de vitrage, teintes RAL, contraintes de livraison..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className={`w-full p-2.5 rounded-xl border ${
                    isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-white/5 border-white/10 text-white'
                  }`}
                />
              </div>

              <div className="pt-3 border-t border-black/10 dark:border-white/10 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewJobModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-zinc-400 hover:text-white"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#D4AF37] hover:brightness-110 text-slate-950 font-bold"
                >
                  Enregistrer l'Affaire
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkshopJobTracker;
