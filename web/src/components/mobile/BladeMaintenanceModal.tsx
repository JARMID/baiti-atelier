import React, { useState } from 'react';
import {
  X,
  Plus,
  RotateCcw,
  MessageCircle,
  Gauge,
  Droplet,
  History,
  Check,
  Disc,
} from 'lucide-react';
import {
  getWorkshopBlades,
  incrementBladeCutCount,
  recordBladeResharpening,
  getBladeWearTelemetry,
  formatBladeMaintenanceWhatsAppAlert,
  type WorkshopSawBlade,
} from '../../utils/workshopBladeMaintenanceManager';
import { playTactileClick, playClampSound, playSwitchSound } from '../../utils/audioFeedback';
import { useConfigStore } from '../../store/configStore';

export interface BladeMaintenanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBladesUpdated?: (blades: WorkshopSawBlade[]) => void;
}

export const BladeMaintenanceModal: React.FC<BladeMaintenanceModalProps> = ({
  isOpen,
  onClose,
  onBladesUpdated,
}) => {
  const { theme, language } = useConfigStore();
  const isLight = theme === 'light';
  const isRtl = language === 'ar';

  const [blades, setBlades] = useState<WorkshopSawBlade[]>(() => getWorkshopBlades());
  const [selectedBladeId, setSelectedBladeId] = useState<string>(() => blades[0]?.id || 'blade_01');
  const [activeTab, setActiveTab] = useState<'wear' | 'resharpen' | 'history'>('wear');

  // Resharpening Form State
  const [sharpenerWorkshop, setSharpenerWorkshop] = useState('Atelier Affûtage Outilleur Kouba');
  const [sharpenCostDzd, setSharpenCostDzd] = useState<number>(1800);
  const [technicianNotes, setTechnicianNotes] = useState('Rectification faces d attaque carbure diamant');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentBlade = blades.find((b) => b.id === selectedBladeId) || blades[0];
  const telemetry = currentBlade ? getBladeWearTelemetry(currentBlade) : null;

  const handleIncrementCuts = (amount: number) => {
    if (!currentBlade) return;
    playClampSound();
    const updated = incrementBladeCutCount(currentBlade.id, amount);
    setBlades(updated);
    if (onBladesUpdated) onBladesUpdated(updated);
    setToastMessage(`+${amount} coupes ajoutées au compteur de la lame !`);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleConfirmResharpen = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentBlade) return;
    playClampSound();
    const updated = recordBladeResharpening(
      currentBlade.id,
      sharpenerWorkshop,
      sharpenCostDzd,
      technicianNotes
    );
    setBlades(updated);
    if (onBladesUpdated) onBladesUpdated(updated);
    setActiveTab('wear');
    setToastMessage(`Affûtage enregistré ! Compteur de coupes remis à zéro.`);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleWhatsAppAlert = () => {
    if (!currentBlade) return;
    playTactileClick();
    const msg = formatBladeMaintenanceWhatsAppAlert(currentBlade);
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
  };

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
            <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
              <Disc className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm font-bold truncate">
                Maintenance Lames de Scie & Usure Outil
              </h2>
              <p className="text-[11px] text-zinc-500 truncate font-mono">
                Suivi d affûtage TCT • Pression • Lubrification pneumatique
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

        {/* SAW MACHINES / BLADES SELECTOR CAROUSEL */}
        <div className="flex items-center gap-1.5 p-2 overflow-x-auto no-scrollbar border-b border-black/5 dark:border-white/10 font-mono text-xs shrink-0">
          {blades.map((b) => {
            const isSelected = b.id === selectedBladeId;
            const bTelem = getBladeWearTelemetry(b);
            return (
              <button
                key={b.id}
                type="button"
                onClick={() => {
                  playSwitchSound();
                  setSelectedBladeId(b.id);
                }}
                className={`px-3 py-2 rounded-xl border text-left cursor-pointer transition-all shrink-0 min-h-[44px] flex items-center gap-2 ${
                  isSelected
                    ? 'bg-[#D4AF37] text-slate-950 font-bold border-[#D4AF37] shadow-xs'
                    : isLight
                    ? 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    : 'bg-white/5 border-white/10 text-zinc-300 hover:bg-white/10'
                }`}
              >
                <Disc className="w-3.5 h-3.5 shrink-0" />
                <div className="min-w-0">
                  <div className="truncate text-[11px] font-bold">Ø{b.diameterMm} {b.code}</div>
                  <div className={`text-[9px] ${isSelected ? 'text-slate-800' : 'text-zinc-500'}`}>
                    {b.currentCutCount} / {b.maxCutsBeforeResharpen} ({bTelem.wearPercent}%)
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* SUB-TABS */}
        <div className="grid grid-cols-3 p-1.5 border-b border-black/5 dark:border-white/10 font-mono text-xs shrink-0">
          <button
            type="button"
            onClick={() => {
              playTactileClick();
              setActiveTab('wear');
            }}
            className={`py-2 rounded-xl font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
              activeTab === 'wear'
                ? 'bg-[#D4AF37] text-slate-950 shadow-xs'
                : isLight
                ? 'text-slate-600 hover:text-slate-950'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Gauge className="w-3.5 h-3.5" />
            <span>Usure & Compteur</span>
          </button>

          <button
            type="button"
            onClick={() => {
              playTactileClick();
              setActiveTab('resharpen');
            }}
            className={`py-2 rounded-xl font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
              activeTab === 'resharpen'
                ? 'bg-[#D4AF37] text-slate-950 shadow-xs'
                : isLight
                ? 'text-slate-600 hover:text-slate-950'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Affûtage ({currentBlade.sharpeningCyclesDone}/{currentBlade.maxSharpeningCycles})</span>
          </button>

          <button
            type="button"
            onClick={() => {
              playTactileClick();
              setActiveTab('history');
            }}
            className={`py-2 rounded-xl font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
              activeTab === 'history'
                ? 'bg-[#D4AF37] text-slate-950 shadow-xs'
                : isLight
                ? 'text-slate-600 hover:text-slate-950'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Historique ({currentBlade.history.length})</span>
          </button>
        </div>

        {/* SCROLLABLE BODY */}
        <div className="p-4 space-y-4 overflow-y-auto flex-1 font-mono text-xs">
          {/* TAB 1: WEAR & QUICK INCREMENT */}
          {activeTab === 'wear' && telemetry && (
            <div className="space-y-3.5">
              {/* Main Blade Info Box */}
              <div
                className={`p-3.5 rounded-2xl border space-y-2.5 ${
                  isLight ? 'bg-slate-50 border-slate-200' : 'bg-black/30 border-white/5'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] text-zinc-500 font-bold block">
                      {currentBlade.sawMachineName}
                    </span>
                    <h3 className={`font-bold text-xs mt-0.5 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                      {currentBlade.name}
                    </h3>
                    <p className="text-[10px] text-zinc-400 mt-0.5">
                      Ø{currentBlade.diameterMm} mm • Z={currentBlade.teethCount} dents • Kerf {currentBlade.kerfWidthMm} mm
                    </p>
                  </div>

                  <span className={`px-2 py-0.5 rounded-md border text-[10px] font-bold ${telemetry.badgeClass}`}>
                    {telemetry.statusLabelFr}
                  </span>
                </div>

                {/* Big Wear Progress Bar */}
                <div className="space-y-1 pt-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-zinc-500">Compteur de coupes d onglet :</span>
                    <span className="font-bold">
                      {currentBlade.currentCutCount.toLocaleString('fr-DZ')} /{' '}
                      {currentBlade.maxCutsBeforeResharpen.toLocaleString('fr-DZ')} ({telemetry.wearPercent}%)
                    </span>
                  </div>

                  <div className="w-full h-3 rounded-full bg-black/10 dark:bg-white/10 overflow-hidden p-0.5">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        telemetry.wearPercent >= 90
                          ? 'bg-rose-500'
                          : telemetry.wearPercent >= 70
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                      }`}
                      style={{ width: `${telemetry.wearPercent}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-zinc-500 pt-0.5">
                    <span>Dernier affûtage : {currentBlade.lastSharpeningDate}</span>
                    <span>Reste : ~{telemetry.remainingCuts.toLocaleString('fr-DZ')} coupes</span>
                  </div>
                </div>
              </div>

              {/* Quick Cut Steppers */}
              <div
                className={`p-3 rounded-2xl border space-y-2 ${
                  isLight ? 'bg-slate-50 border-slate-200' : 'bg-black/30 border-white/5'
                }`}
              >
                <span className="text-[10px] text-zinc-500 font-bold block">
                  Enregistrer des Coupes Réalisées à l Atelier
                </span>
                <div className="grid grid-cols-4 gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleIncrementCuts(10)}
                    className={`py-2 rounded-xl border text-[11px] font-bold flex items-center justify-center gap-1 cursor-pointer transition-all ${
                      isLight
                        ? 'bg-white border-slate-200 text-slate-800 hover:bg-slate-100'
                        : 'bg-white/5 border-white/10 text-white hover:bg-white/10'
                    }`}
                  >
                    <Plus className="w-3 h-3" />
                    <span>10</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleIncrementCuts(25)}
                    className={`py-2 rounded-xl border text-[11px] font-bold flex items-center justify-center gap-1 cursor-pointer transition-all ${
                      isLight
                        ? 'bg-white border-slate-200 text-slate-800 hover:bg-slate-100'
                        : 'bg-white/5 border-white/10 text-white hover:bg-white/10'
                    }`}
                  >
                    <Plus className="w-3 h-3" />
                    <span>25</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleIncrementCuts(50)}
                    className={`py-2 rounded-xl border text-[11px] font-bold flex items-center justify-center gap-1 cursor-pointer transition-all ${
                      isLight
                        ? 'bg-white border-slate-200 text-slate-800 hover:bg-slate-100'
                        : 'bg-white/5 border-white/10 text-white hover:bg-white/10'
                    }`}
                  >
                    <Plus className="w-3 h-3" />
                    <span>50</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleIncrementCuts(100)}
                    className="py-2 rounded-xl bg-[#D4AF37] text-slate-950 text-[11px] font-bold flex items-center justify-center gap-1 cursor-pointer hover:brightness-110 active:scale-95 transition-all shadow-xs"
                  >
                    <Plus className="w-3 h-3" />
                    <span>100</span>
                  </button>
                </div>
              </div>

              {/* Machine Telemetry Gauges (Oil & Pressure) */}
              <div className="grid grid-cols-2 gap-2">
                <div
                  className={`p-3 rounded-2xl border space-y-1 ${
                    isLight ? 'bg-slate-50 border-slate-200' : 'bg-black/30 border-white/5'
                  }`}
                >
                  <div className="flex items-center gap-1.5 text-cyan-400">
                    <Droplet className="w-3.5 h-3.5" />
                    <span className="font-bold text-[11px]">Huile Micro-Pulv.</span>
                  </div>
                  <div className="text-base font-bold">{currentBlade.lubricationOilLevelPercent}%</div>
                  <p className="text-[9px] text-zinc-500">Huile de coupe végétale propre</p>
                </div>

                <div
                  className={`p-3 rounded-2xl border space-y-1 ${
                    isLight ? 'bg-slate-50 border-slate-200' : 'bg-black/30 border-white/5'
                  }`}
                >
                  <div className="flex items-center gap-1.5 text-amber-400">
                    <Gauge className="w-3.5 h-3.5" />
                    <span className="font-bold text-[11px]">Pression Vérins</span>
                  </div>
                  <div className="text-base font-bold">{currentBlade.pneumaticPressureBar} bars</div>
                  <p className="text-[9px] text-zinc-500">Plage normale 6.0 à 7.5 bars</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: RESHARPENING REGISTRATION */}
          {activeTab === 'resharpen' && (
            <form onSubmit={handleConfirmResharpen} className="space-y-3.5">
              <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/25 text-amber-200 text-[11px] leading-relaxed">
                Après affûtage par l outilleur spécialisé, le compteur de coupes de la lame est remis
                à zéro et le cycle d affûtage est incrémenté (max {currentBlade.maxSharpeningCycles} cycles).
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-zinc-500 font-bold block">
                  Atelier / Artisan Affûteur Outilleur
                </label>
                <input
                  type="text"
                  required
                  value={sharpenerWorkshop}
                  onChange={(e) => setSharpenerWorkshop(e.target.value)}
                  className={`w-full p-2.5 rounded-xl border text-xs focus:outline-none focus:border-[#D4AF37] ${
                    isLight
                      ? 'bg-white border-slate-300 text-slate-900'
                      : 'bg-black/40 border-white/15 text-white'
                  }`}
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-zinc-500 font-bold block">
                  Coût de l Affûtage (DZD)
                </label>
                <input
                  type="number"
                  min={0}
                  step={100}
                  required
                  value={sharpenCostDzd}
                  onChange={(e) => setSharpenCostDzd(Number(e.target.value) || 0)}
                  className={`w-full p-2.5 rounded-xl border text-xs font-bold focus:outline-none focus:border-[#D4AF37] ${
                    isLight
                      ? 'bg-white border-slate-300 text-slate-900'
                      : 'bg-black/40 border-white/15 text-white'
                  }`}
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-zinc-500 font-bold block">
                  Observations Techniques / Pastilles Carbure
                </label>
                <textarea
                  rows={2}
                  value={technicianNotes}
                  onChange={(e) => setTechnicianNotes(e.target.value)}
                  className={`w-full p-2.5 rounded-xl border text-xs focus:outline-none focus:border-[#D4AF37] ${
                    isLight
                      ? 'bg-white border-slate-300 text-slate-900'
                      : 'bg-black/40 border-white/15 text-white'
                  }`}
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-[#C5A880] to-[#D4AF37] text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer hover:brightness-110 active:scale-98 transition-all shadow-md min-h-[44px]"
              >
                <Check className="w-4 h-4" />
                <span>Enregistrer l Affûtage (Remise à Zéro)</span>
              </button>
            </form>
          )}

          {/* TAB 3: RESHARPENING HISTORY LOG */}
          {activeTab === 'history' && (
            <div className="space-y-2">
              {currentBlade.history.length === 0 ? (
                <div className="p-6 text-center text-xs text-zinc-500">
                  Aucun historique d affûtage enregistré pour cette lame.
                </div>
              ) : (
                currentBlade.history.map((log) => (
                  <div
                    key={log.id}
                    className={`p-3 rounded-2xl border space-y-1.5 ${
                      isLight ? 'bg-slate-50 border-slate-200' : 'bg-black/30 border-white/5'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-[#D4AF37]">
                        Passe d affûtage N° {log.cycleNumber}
                      </span>
                      <span className="text-[10px] text-zinc-500">{log.date}</span>
                    </div>

                    <div className="flex items-center justify-between text-[11px]">
                      <span className={isLight ? 'text-slate-800' : 'text-zinc-300'}>
                        {log.sharpenerWorkshop}
                      </span>
                      <span className="font-bold text-emerald-400">
                        {log.costDzd.toLocaleString('fr-DZ')} DZD
                      </span>
                    </div>

                    {log.technicianNotes && (
                      <p className="text-[10px] text-zinc-500 pt-0.5 border-t border-black/5 dark:border-white/5">
                        {log.technicianNotes}
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* TOAST MESSAGE */}
        {toastMessage && (
          <div className="px-4 py-2 bg-emerald-500 text-slate-950 text-xs font-bold text-center flex items-center justify-center gap-1.5">
            <Check className="w-3.5 h-3.5" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* FOOTER ACTIONS */}
        <div className="p-3 border-t border-black/5 dark:border-white/10 flex items-center justify-between gap-2 bg-black/5 dark:bg-white/5 shrink-0">
          <button
            type="button"
            onClick={handleWhatsAppAlert}
            className="flex-1 py-2.5 px-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer min-h-[44px] hover:bg-emerald-500/25 active:scale-98 transition-all"
            title="Alerter l outilleur ou le chef d atelier par WhatsApp"
          >
            <MessageCircle className="w-4 h-4 shrink-0" />
            <span>Alerte WhatsApp Affûteur</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className={`px-4 py-2.5 rounded-2xl border font-bold text-xs cursor-pointer min-h-[44px] ${
              isLight
                ? 'border-slate-300 text-slate-700 hover:bg-slate-100'
                : 'border-white/10 text-zinc-300 hover:bg-white/10'
            }`}
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
