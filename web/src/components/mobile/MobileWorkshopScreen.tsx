import React, { useState, useEffect } from 'react';
import { useConfigStore } from '../../store/configStore';
import {
  getWorkshopJobs,
  advanceJobStage,
  addWorkshopJob,
  deleteJob,
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
} from 'lucide-react';
import { playTactileClick, playClampSound, playSwitchSound } from '../../utils/audioFeedback';
import { ALGERIAN_WILAYAS_58 } from '../../utils/algerianWilayas';

export const MobileWorkshopScreen: React.FC = () => {
  const { theme, language } = useConfigStore();
  const isLight = theme === 'light';
  const isRtl = language === 'ar';

  const [jobs, setJobs] = useState<WorkshopJob[]>(() => getWorkshopJobs());
  const [selectedStageFilter, setSelectedStageFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isNewJobModalOpen, setIsNewJobModalOpen] = useState<boolean>(false);

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
  const [newClientName, setNewClientName] = useState('');
  const [newClientPhone, setNewClientPhone] = useState('');
  const [newWilaya, setNewWilaya] = useState('16 - Alger');
  const [newDescription, setNewDescription] = useState('');
  const [newItemCount, setNewItemCount] = useState<number>(1);
  const [newTotalAmount, setNewTotalAmount] = useState<number>(150000);
  const [newDeposit, setNewDeposit] = useState<number>(75000);
  const [newDueDate, setNewDueDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().split('T')[0];
  });
  const [newPriority, setNewPriority] = useState<'normal' | 'urgent' | 'critique'>('normal');
  const [newStage, setNewStage] = useState<WorkshopJobStage>('devis');
  const [newProfileSystem, setNewProfileSystem] = useState('gamme_45_thermal');
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

                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold border shrink-0 ${
                      isLight ? stageInfo.bgLight : stageInfo.bgDark
                    } ${stageInfo.color}`}
                  >
                    {stageInfo.labelFr}
                  </span>
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

                {/* Financials Row */}
                <div
                  className={`p-2.5 rounded-2xl border flex items-center justify-between ${
                    isLight ? 'bg-slate-50 border-slate-200' : 'bg-black/30 border-white/5'
                  }`}
                >
                  <div>
                    <span className="text-[10px] text-zinc-500 block">Total Affaire</span>
                    <span className="font-bold text-[#D4AF37]">
                      {job.totalAmountDzd.toLocaleString('fr-DZ')} DZD
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-zinc-500 block">Acompte</span>
                    <span className={`font-semibold ${isLight ? 'text-slate-700' : 'text-zinc-300'}`}>
                      {job.depositDzd.toLocaleString('fr-DZ')} DZD
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-zinc-500 block">Reste Dû</span>
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
              </div>
            );
          })
        )}
      </div>

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
    </div>
  );
};

export default MobileWorkshopScreen;
