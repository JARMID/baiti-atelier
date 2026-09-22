import React, { useState, useMemo } from 'react';
import {
  X,
  Wrench,
  Check,
  AlertTriangle,
  Calendar,
  History,
  Droplets,
  MessageCircle,
  ShieldCheck,
  Clock,
} from 'lucide-react';
import {
  getWorkshopMachines,
  getMaintenanceLogs,
  recordCompletedTask,
  formatMachineMaintenanceWhatsApp,
  type WorkshopMachine,
  type MaintenanceTask,
  type MaintenanceLogEntry,
} from '../../utils/machineMaintenanceManager';
import { playTactileClick, playClampSound } from '../../utils/audioFeedback';
import { useConfigStore } from '../../store/configStore';

export interface MachineMaintenanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onMachinesUpdated?: (machines: WorkshopMachine[]) => void;
}

export const MachineMaintenanceModal: React.FC<MachineMaintenanceModalProps> = ({
  isOpen,
  onClose,
  onMachinesUpdated,
}) => {
  const { theme } = useConfigStore();
  const isLight = theme === 'light';

  // Active tab: 'machines' (Parc & Alertes), 'calendar' (Échéancier), 'history' (Historique)
  const [activeTab, setActiveTab] = useState<'machines' | 'calendar' | 'history'>('machines');

  const [machines, setMachines] = useState<WorkshopMachine[]>(() => getWorkshopMachines());
  const [logs, setLogs] = useState<MaintenanceLogEntry[]>(() => getMaintenanceLogs());

  // Quick check-off task drawer state
  const [selectedTask, setSelectedTask] = useState<{ machine: WorkshopMachine; task: MaintenanceTask } | null>(null);
  const [technicianName, setTechnicianName] = useState('Karim (Chef d Atelier)');
  const [interventionNotes, setInterventionNotes] = useState('Contrôle et lubrification effectués avec succès');
  const [interventionCost, setInterventionCost] = useState<number>(0);
  const [partsReplaced, setPartsReplaced] = useState<string>('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const totalOverdueCount = useMemo(() => {
    return machines.reduce((sum, m) => sum + m.tasks.filter((t) => t.isOverdue).length, 0);
  }, [machines]);

  const overallFleetHealth = useMemo(() => {
    if (machines.length === 0) return 100;
    const avg = machines.reduce((sum, m) => sum + m.healthPercent, 0) / machines.length;
    return Math.round(avg);
  }, [machines]);

  // All tasks sorted by urgency
  const allScheduledTasks = useMemo(() => {
    const list: { machine: WorkshopMachine; task: MaintenanceTask }[] = [];
    machines.forEach((m) => {
      m.tasks.forEach((t) => {
        list.push({ machine: m, task: t });
      });
    });
    return list.sort((a, b) => {
      if (a.task.isOverdue && !b.task.isOverdue) return -1;
      if (!a.task.isOverdue && b.task.isOverdue) return 1;
      return a.task.nextDueDate.localeCompare(b.task.nextDueDate);
    });
  }, [machines]);

  if (!isOpen) return null;

  const handleOpenTaskCheckoff = (machine: WorkshopMachine, task: MaintenanceTask) => {
    playTactileClick();
    setSelectedTask({ machine, task });
    setInterventionNotes(`Vérification conforme : ${task.titleFr}`);
    setInterventionCost(0);
    setPartsReplaced('');
  };

  const handleConfirmTaskDone = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTask) return;
    playClampSound();

    const updated = recordCompletedTask({
      machineId: selectedTask.machine.id,
      taskId: selectedTask.task.id,
      technicianName: technicianName.trim() || 'Technicien Atelier',
      notesFr: interventionNotes.trim(),
      costDzd: interventionCost,
      partsReplacedFr: partsReplaced.trim() || undefined,
    });

    setMachines(updated);
    setLogs(getMaintenanceLogs());
    if (onMachinesUpdated) onMachinesUpdated(updated);
    showToast(`Tâche "${selectedTask.task.titleFr}" validée !`);
    setSelectedTask(null);
  };

  const handleShareWhatsAppAlert = () => {
    playTactileClick();
    const msg = formatMachineMaintenanceWhatsApp(machines);
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div
        className={`w-full max-w-xl max-h-[92vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl border shadow-2xl p-4 sm:p-6 space-y-4 font-mono text-xs ${
          isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-[#0E131F] border-white/10 text-white'
        }`}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-black/10 dark:border-white/10 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Wrench className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold flex items-center gap-1.5">
                <span>Maintenance Parc Machines</span>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${
                    overallFleetHealth >= 80
                      ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                      : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                  }`}
                >
                  Santé : {overallFleetHealth}%
                </span>
              </h2>
              <p className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
                {machines.length} machines • {totalOverdueCount > 0 ? `${totalOverdueCount} en retard ⚠️` : 'À jour ✓'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 text-zinc-400 hover:text-white cursor-pointer transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* View Tabs */}
        <div className="grid grid-cols-3 p-1 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10">
          <button
            type="button"
            onClick={() => {
              playTactileClick();
              setActiveTab('machines');
            }}
            className={`py-2 rounded-xl font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
              activeTab === 'machines'
                ? 'bg-[#D4AF37] text-slate-950 shadow-sm'
                : isLight
                ? 'text-slate-600 hover:text-slate-950'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Wrench className="w-3.5 h-3.5" />
            <span>Machines ({machines.length})</span>
          </button>

          <button
            type="button"
            onClick={() => {
              playTactileClick();
              setActiveTab('calendar');
            }}
            className={`py-2 rounded-xl font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
              activeTab === 'calendar'
                ? 'bg-[#D4AF37] text-slate-950 shadow-sm'
                : isLight
                ? 'text-slate-600 hover:text-slate-950'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Échéancier ({allScheduledTasks.length})</span>
          </button>

          <button
            type="button"
            onClick={() => {
              playTactileClick();
              setActiveTab('history');
            }}
            className={`py-2 rounded-xl font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
              activeTab === 'history'
                ? 'bg-[#D4AF37] text-slate-950 shadow-sm'
                : isLight
                ? 'text-slate-600 hover:text-slate-950'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Historique ({logs.length})</span>
          </button>
        </div>

        {/* TAB 1: PARC MACHINES & ALERTES */}
        {activeTab === 'machines' && (
          <div className="space-y-3">
            {/* Global Telemetry Banner */}
            <div
              className={`p-3 rounded-2xl border flex items-center justify-between text-xs ${
                totalOverdueCount === 0
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                  : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 shrink-0" />
                <span>
                  {totalOverdueCount === 0
                    ? 'Toutes les machines sont à jour et lubrifiées.'
                    : `${totalOverdueCount} tâche(s) de maintenance préventive dépassée(s) !`}
                </span>
              </div>
              <button
                type="button"
                onClick={handleShareWhatsAppAlert}
                className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center gap-1 cursor-pointer transition-all shadow-xs"
              >
                <MessageCircle className="w-3 h-3" />
                <span>Alerte</span>
              </button>
            </div>

            {/* Machines Cards */}
            <div className="space-y-2.5">
              {machines.map((machine) => {
                const overdueCount = machine.tasks.filter((t) => t.isOverdue).length;

                return (
                  <div
                    key={machine.id}
                    className={`p-3.5 rounded-2xl border transition-all ${
                      overdueCount > 0
                        ? 'border-amber-500/40 bg-amber-500/5'
                        : isLight
                        ? 'bg-slate-50 border-slate-200'
                        : 'bg-black/25 border-white/5'
                    }`}
                  >
                    {/* Machine Header */}
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <div className="font-bold flex items-center gap-1.5 flex-wrap">
                          <span>{machine.name}</span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-black/10 dark:bg-white/10 text-zinc-400">
                            {machine.brandModel}
                          </span>
                        </div>
                        <div className="text-[10px] text-zinc-400 pt-0.5">
                          {machine.powerRatingKw} kW • {machine.operatingPressureBar ? `${machine.operatingPressureBar} bars • ` : ''}
                          S/N : {machine.serialNumber}
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span
                          className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                            machine.healthPercent >= 80
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          }`}
                        >
                          {machine.healthPercent}% santé
                        </span>
                      </div>
                    </div>

                    {/* Machine Tasks List */}
                    <div className="space-y-1.5 pt-1 border-t border-black/5 dark:border-white/5">
                      {machine.tasks.map((task) => (
                        <div
                          key={task.id}
                          className={`p-2 rounded-xl border flex items-center justify-between gap-2 ${
                            task.isOverdue
                              ? 'bg-amber-500/10 border-amber-500/30 text-amber-200'
                              : isLight
                              ? 'bg-white border-slate-200 text-slate-800'
                              : 'bg-black/20 border-white/5 text-zinc-300'
                          }`}
                        >
                          <div className="space-y-0.5 min-w-0">
                            <div className="font-bold flex items-center gap-1.5">
                              {task.isOverdue && <AlertTriangle className="w-3 h-3 text-amber-400 shrink-0" />}
                              <span className="truncate">{task.titleFr}</span>
                            </div>
                            <div className="text-[9px] text-zinc-400">
                              Échéance : {task.nextDueDate}{' '}
                              {task.isOverdue ? (
                                <span className="text-amber-400 font-bold">(Retard +{task.overdueDays}j)</span>
                              ) : (
                                `(Dernière : ${task.lastDoneDate})`
                              )}
                            </div>
                            {task.consumableNeededFr && (
                              <div className="text-[9px] text-[#D4AF37] flex items-center gap-1">
                                <Droplets className="w-2.5 h-2.5" />
                                <span>{task.consumableNeededFr}</span>
                              </div>
                            )}
                          </div>

                          <button
                            type="button"
                            onClick={() => handleOpenTaskCheckoff(machine, task)}
                            className="px-2.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center gap-1 cursor-pointer transition-all shadow-xs shrink-0 text-[10px]"
                          >
                            <Check className="w-3 h-3" />
                            <span>Valider</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 2: CALENDRIER & ECHEANCIER */}
        {activeTab === 'calendar' && (
          <div className="space-y-2">
            <div className="text-[10px] text-zinc-400 px-1">
              Toutes les interventions de graissage, vidange et purge triées par ordre d urgence :
            </div>

            <div className="space-y-1.5">
              {allScheduledTasks.map(({ machine, task }) => (
                <div
                  key={`${machine.id}_${task.id}`}
                  className={`p-2.5 rounded-2xl border flex items-center justify-between gap-2.5 ${
                    task.isOverdue
                      ? 'border-amber-500/40 bg-amber-500/10'
                      : isLight
                      ? 'bg-slate-50 border-slate-200'
                      : 'bg-black/25 border-white/5'
                  }`}
                >
                  <div className="flex items-start gap-2.5 min-w-0">
                    <div
                      className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 ${
                        task.isOverdue ? 'bg-amber-500/20 text-amber-400' : 'bg-black/10 dark:bg-white/10 text-zinc-400'
                      }`}
                    >
                      <Clock className="w-3.5 h-3.5" />
                    </div>

                    <div className="space-y-0.5 min-w-0">
                      <div className="font-bold flex items-center gap-1.5 flex-wrap">
                        <span className="truncate">{task.titleFr}</span>
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-black/10 dark:bg-white/10 text-zinc-400">
                          {machine.name}
                        </span>
                      </div>
                      <p className="text-[10px] text-zinc-400 line-clamp-1">{task.descriptionFr}</p>
                      <div className="text-[10px] text-[#D4AF37]">
                        Fréquence : {task.frequency} ({task.frequencyDays}j) • Prévu le :{' '}
                        <strong>{task.nextDueDate}</strong>
                        {task.isOverdue && <span className="text-amber-400 font-bold ml-1.5">⚠️ Dépassé</span>}
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleOpenTaskCheckoff(machine, task)}
                    className="px-2.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center gap-1 cursor-pointer transition-all shrink-0 text-[10px]"
                  >
                    <Check className="w-3 h-3" />
                    <span>Fait</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: HISTORIQUE DES INTERVENTIONS */}
        {activeTab === 'history' && (
          <div className="space-y-2">
            {logs.length === 0 ? (
              <div className="p-8 text-center text-zinc-500 text-xs">
                Aucune intervention consignée pour le moment.
              </div>
            ) : (
              <div className="space-y-1.5">
                {logs.map((log) => (
                  <div
                    key={log.id}
                    className={`p-3 rounded-2xl border space-y-1 ${
                      isLight ? 'bg-slate-50 border-slate-200' : 'bg-black/25 border-white/5'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs">{log.taskTitle}</span>
                      <span className="text-[10px] text-zinc-400">{log.performedDate}</span>
                    </div>

                    <div className="text-[10px] text-zinc-400">
                      Machine : <strong>{log.machineName}</strong> • Technicien : {log.technicianName}
                    </div>

                    <p className="text-[10px] text-zinc-300">{log.notesFr}</p>

                    {(log.costDzd > 0 || log.partsReplacedFr) && (
                      <div className="text-[10px] text-[#D4AF37] pt-0.5 border-t border-black/5 dark:border-white/5">
                        {log.partsReplacedFr ? `Pièces : ${log.partsReplacedFr} • ` : ''}
                        {log.costDzd > 0 ? `Coût : ${log.costDzd.toLocaleString('fr-DZ')} DZD` : ''}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* CHECK-OFF TASK MODAL / FORM DRAWER */}
        {selectedTask && (
          <div className="p-3.5 rounded-2xl border border-emerald-500/40 bg-emerald-500/10 space-y-2.5 animate-in fade-in duration-150">
            <div className="flex items-center justify-between font-bold text-xs">
              <span className="flex items-center gap-1.5 text-emerald-400">
                <Check className="w-4 h-4" />
                <span>Validation : {selectedTask.task.titleFr}</span>
              </span>
              <button
                type="button"
                onClick={() => setSelectedTask(null)}
                className="p-1 rounded-lg text-zinc-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <form onSubmit={handleConfirmTaskDone} className="space-y-2 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-zinc-400 block mb-1">Technicien</label>
                  <input
                    type="text"
                    value={technicianName}
                    onChange={(e) => setTechnicianName(e.target.value)}
                    className={`w-full p-2 rounded-xl border text-[11px] ${
                      isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-black/40 border-white/10 text-white'
                    }`}
                    required
                  />
                </div>
                <div>
                  <label className="text-[10px] text-zinc-400 block mb-1">Coût Fournitures (DZD)</label>
                  <input
                    type="number"
                    min="0"
                    value={interventionCost}
                    onChange={(e) => setInterventionCost(parseInt(e.target.value) || 0)}
                    className={`w-full p-2 rounded-xl border text-[11px] ${
                      isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-black/40 border-white/10 text-white'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] text-zinc-400 block mb-1">Observations & Consommables Utilisés</label>
                <input
                  type="text"
                  value={interventionNotes}
                  onChange={(e) => setInterventionNotes(e.target.value)}
                  className={`w-full p-2 rounded-xl border text-[11px] ${
                    isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-black/40 border-white/10 text-white'
                  }`}
                />
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setSelectedTask(null)}
                  className="px-3 py-1.5 rounded-xl border border-black/10 dark:border-white/10 text-xs"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs cursor-pointer shadow-md"
                >
                  Enregistrer l Intervention
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-between gap-2 pt-2 border-t border-black/10 dark:border-white/10">
          <button
            type="button"
            onClick={handleShareWhatsAppAlert}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center gap-1.5 cursor-pointer text-xs transition-all shadow-md min-h-[44px]"
          >
            <MessageCircle className="w-4 h-4" />
            <span>WhatsApp Chef d Atelier</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 text-zinc-300 hover:text-white font-bold text-xs cursor-pointer transition-all min-h-[44px]"
          >
            Fermer
          </button>
        </div>

        {/* Toast */}
        {toastMessage && (
          <div className="p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 font-bold text-center text-xs animate-in fade-in duration-200">
            {toastMessage}
          </div>
        )}
      </div>
    </div>
  );
};
