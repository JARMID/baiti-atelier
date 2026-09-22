import React, { useState } from 'react';
import { useConfigStore } from '../../store/configStore';
import {
  getWorkshopJobs,
  advanceJobStage,
  STAGE_CONFIG,
  STAGE_ORDER,
} from '../../utils/workshopJobManager';
import type { WorkshopJob } from '../../types/workshop';
import {
  Phone,
  MessageCircle,
  ArrowRight,
} from 'lucide-react';
import { playTactileClick, playClampSound } from '../../utils/audioFeedback';

export const MobileWorkshopScreen: React.FC = () => {
  const { theme, language } = useConfigStore();
  const isLight = theme === 'light';
  const isRtl = language === 'ar';

  const [jobs, setJobs] = useState<WorkshopJob[]>(() => getWorkshopJobs());
  const [selectedStageFilter, setSelectedStageFilter] = useState<string>('all');

  const handleAdvance = (jobId: string) => {
    playClampSound();
    const updated = advanceJobStage(jobId);
    setJobs([...updated]);
  };

  const handleWhatsApp = (job: WorkshopJob) => {
    playTactileClick();
    const stageInfo = STAGE_CONFIG[job.stage];
    const text = `*SUIVI DE COMMANDE BAITI ATELIER*\nBonjour ${job.clientName},\nVotre commande (Réf: ${job.id}) avance bien dans notre atelier :\n• Étape actuelle : *${stageInfo.labelFr}*\n• Descriptif : ${job.description}\n• Solde restant : ${(job.totalAmountDzd - job.depositDzd).toLocaleString('fr-DZ')} DZD\n\nNous restons à votre entière disposition pour la livraison.`;
    window.open(`https://wa.me/${job.clientPhone.replace(/\D/g, '')}?text=${encodeURIComponent(text)}`, '_blank');
  };

  const filteredJobs = selectedStageFilter === 'all'
    ? jobs
    : jobs.filter((j) => j.stage === selectedStageFilter);

  return (
    <div className="pb-36 px-3 sm:px-6 pt-2 max-w-xl md:max-w-2xl mx-auto space-y-4" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* 1. STAGE FILTER CAROUSEL */}
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

      {/* 2. JOBS LIST */}
      <div className="space-y-3">
        {filteredJobs.length === 0 ? (
          <div
            className={`p-8 rounded-3xl border text-center font-mono text-xs ${
              isLight ? 'bg-white border-slate-200 text-zinc-500' : 'bg-[#0B0F19] border-white/10 text-zinc-400'
            }`}
          >
            Aucune affaire dans cette étape d'atelier.
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
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-zinc-500 font-bold">{job.id}</span>
                    <h3 className="text-sm font-bold text-white leading-tight">{job.clientName}</h3>
                  </div>

                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                      isLight ? stageInfo.bgLight : stageInfo.bgDark
                    } ${stageInfo.color}`}
                  >
                    {stageInfo.labelFr}
                  </span>
                </div>

                {/* Job Details */}
                <div className="text-xs text-zinc-400 leading-relaxed">
                  {job.description}
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
                        ? 'bg-slate-100 border-slate-200 text-slate-700'
                        : 'bg-white/5 border-white/10 text-zinc-300'
                    }`}
                    title="Appeler le client"
                  >
                    <Phone className="w-4 h-4 text-cyan-400" />
                  </a>

                  <button
                    onClick={() => handleWhatsApp(job)}
                    className="p-2.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-bold flex items-center justify-center gap-1.5 flex-1 min-h-[44px] cursor-pointer"
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
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default MobileWorkshopScreen;
