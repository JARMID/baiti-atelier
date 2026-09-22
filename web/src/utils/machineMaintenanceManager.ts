/**
 * Workshop Machine Fleet Maintenance & Lubrication Schedule Manager
 * Baiti Atelier Aluminum & PVC Architectural Joinery Suite
 *
 * Tracks preventive maintenance, calibration, lubrication, and drainage
 * for essential aluminum & PVC workshop machines:
 * - Pneumatic / Hydraulic Corner Crimpers (Sertisseuses de coins)
 * - High-speed Copy Routers / Mortisers (Pantographes / Copieuses)
 * - Transom End Millers (Fraiseuses en bout)
 * - Industrial Air Compressors (Compresseurs d air et purge de condensation)
 * - Precision Saws & Digital Angle Zero Stops
 */

export type MachineType =
  | 'sertisseuse_coins'
  | 'pantographe_copieuse'
  | 'fraiseuse_en_bout'
  | 'compresseur_air'
  | 'tronconneuse_scie';

export type MaintenanceFrequency = 'quotidien' | 'hebdomadaire' | 'mensuel' | 'trimestriel' | 'annuel';

export interface MaintenanceTask {
  id: string;
  machineId: string;
  titleFr: string;
  descriptionFr: string;
  frequency: MaintenanceFrequency;
  frequencyDays: number;
  lastDoneDate: string;
  nextDueDate: string;
  isOverdue: boolean;
  overdueDays: number;
  consumableNeededFr?: string;
  estimatedDurationMin: number;
}

export interface WorkshopMachine {
  id: string;
  name: string;
  brandModel: string;
  machineType: MachineType;
  serialNumber: string;
  yearInstalled: number;
  powerRatingKw: number;
  operatingPressureBar?: number;
  healthPercent: number;
  status: 'operationnelle' | 'maintenance_requise' | 'arret_urgence';
  tasks: MaintenanceTask[];
}

export interface MaintenanceLogEntry {
  id: string;
  machineId: string;
  machineName: string;
  taskId?: string;
  taskTitle: string;
  performedDate: string;
  technicianName: string;
  notesFr: string;
  costDzd: number;
  partsReplacedFr?: string;
}

const STORAGE_KEY_MACHINES = 'baiti_workshop_machines_v1';
const STORAGE_KEY_LOGS = 'baiti_workshop_maintenance_logs_v1';

function computeDates(lastDateStr: string, frequencyDays: number): { nextDue: string; isOverdue: boolean; overdueDays: number } {
  const last = new Date(lastDateStr);
  const next = new Date(last);
  next.setDate(next.getDate() + frequencyDays);

  const today = new Date();
  const diffTime = today.getTime() - next.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  const nextDueStr = next.toISOString().split('T')[0];
  const isOverdue = diffDays > 0;
  const overdueDays = Math.max(0, diffDays);

  return { nextDue: nextDueStr, isOverdue, overdueDays };
}

function computeMachineHealth(tasks: MaintenanceTask[]): number {
  if (tasks.length === 0) return 100;
  const overdueCount = tasks.filter((t) => t.isOverdue).length;
  if (overdueCount === 0) return 100;
  const health = Math.max(20, Math.round(100 - (overdueCount / tasks.length) * 80));
  return health;
}

export function getDefaultMachines(): WorkshopMachine[] {
  const today = new Date();
  const formatPastDate = (daysAgo: number) => {
    const d = new Date(today);
    d.setDate(d.getDate() - daysAgo);
    return d.toISOString().split('T')[0];
  };

  // 1. Sertisseuse de coins
  const crimpTasksRaw = [
    {
      id: 't_crimp_knives',
      titleFr: 'Contrôle & Réglage Couteaux de Sertissage',
      desc: 'Vérifier la hauteur, l alignement et la pénétration (0.8 à 1.2 mm) des couteaux en acier trempé',
      days: 7,
      daysAgo: 5,
      consumable: 'Couteaux de rechange 5mm',
      duration: 15,
    },
    {
      id: 't_crimp_oil',
      titleFr: 'Niveau Huile Hydraulique (ISO VG 46)',
      desc: 'Vérifier le niveau d huile dans le réservoir central et l absence de fuite sur le vérin 35 kN',
      days: 30,
      daysAgo: 18,
      consumable: 'Huile hydraulique ISO VG 46',
      duration: 10,
    },
    {
      id: 't_crimp_grease',
      titleFr: 'Graissage Colonnes de Guidage & Glissières',
      desc: 'Nettoyer les copeaux d alu et appliquer de la graisse au lithium sur les colonnes chromées',
      days: 14,
      daysAgo: 10,
      consumable: 'Graisse multi-usages au lithium',
      duration: 15,
    },
  ];

  const crimpTasks: MaintenanceTask[] = crimpTasksRaw.map((r) => {
    const lastDone = formatPastDate(r.daysAgo);
    const { nextDue, isOverdue, overdueDays } = computeDates(lastDone, r.days);
    return {
      id: r.id,
      machineId: 'M-CRIMP-01',
      titleFr: r.titleFr,
      descriptionFr: r.desc,
      frequency: r.days === 7 ? 'hebdomadaire' : r.days === 30 ? 'mensuel' : 'trimestriel',
      frequencyDays: r.days,
      lastDoneDate: lastDone,
      nextDueDate: nextDue,
      isOverdue,
      overdueDays,
      consumableNeededFr: r.consumable,
      estimatedDurationMin: r.duration,
    };
  });

  // 2. Pantographe / Copieuse
  const routerTasksRaw = [
    {
      id: 't_router_collet',
      titleFr: 'Nettoyage Pince de Broche ER16 & Mandrin',
      desc: 'Dégraisser la pince ER16, souffler les micro-copeaux et vérifier le faux-rond de la fraise',
      days: 7,
      daysAgo: 8, // Overdue by 1 day
      consumable: 'Spray dégraissant industriel',
      duration: 10,
    },
    {
      id: 't_router_lub',
      titleFr: 'Remplissage Micro-Lubrification Venturi',
      desc: 'Faire l appoint en huile de coupe soluble végétale pour le refroidissement de la fraise',
      days: 7,
      daysAgo: 3,
      consumable: 'Huile de coupe émulsionnable',
      duration: 5,
    },
    {
      id: 't_router_finger',
      titleFr: 'Calibrage Doigt de Palpage & Gabarit',
      desc: 'Vérifier la concentricité entre le doigt de copiage 5/8mm et la fraise sur gabarit étalon',
      days: 30,
      daysAgo: 22,
      consumable: 'Gabarit de calibrage alu',
      duration: 20,
    },
  ];

  const routerTasks: MaintenanceTask[] = routerTasksRaw.map((r) => {
    const lastDone = formatPastDate(r.daysAgo);
    const { nextDue, isOverdue, overdueDays } = computeDates(lastDone, r.days);
    return {
      id: r.id,
      machineId: 'M-ROUTER-01',
      titleFr: r.titleFr,
      descriptionFr: r.desc,
      frequency: r.days === 7 ? 'hebdomadaire' : 'mensuel',
      frequencyDays: r.days,
      lastDoneDate: lastDone,
      nextDueDate: nextDue,
      isOverdue,
      overdueDays,
      consumableNeededFr: r.consumable,
      estimatedDurationMin: r.duration,
    };
  });

  // 3. Compresseur d air
  const compTasksRaw = [
    {
      id: 't_comp_purge',
      titleFr: 'Purge de Cuve & Séparateur d Eau',
      desc: 'Ouvrir la vanne de purge inférieure pour évacuer l eau de condensation accumulée dans la cuve 500L',
      days: 1,
      daysAgo: 0,
      consumable: 'Purgeur automatique',
      duration: 5,
    },
    {
      id: 't_comp_oil',
      titleFr: 'Contrôle Huile Compresseur à Vis',
      desc: 'Vérifier le voyant d huile et la couleur (huile claire, sans émulsion blanchâtre)',
      days: 14,
      daysAgo: 9,
      consumable: 'Huile compresseur à vis ISO VG 46',
      duration: 10,
    },
    {
      id: 't_comp_filter',
      titleFr: 'Dépoussiérage Filtre d Aspiration d Air',
      desc: 'Souffler la cartouche filtrante d admission d air pour maintenir le débit et le rendement',
      days: 30,
      daysAgo: 35, // Overdue by 5 days
      consumable: 'Cartouche filtre à air 500L',
      duration: 15,
    },
  ];

  const compTasks: MaintenanceTask[] = compTasksRaw.map((r) => {
    const lastDone = formatPastDate(r.daysAgo);
    const { nextDue, isOverdue, overdueDays } = computeDates(lastDone, r.days);
    return {
      id: r.id,
      machineId: 'M-COMP-01',
      titleFr: r.titleFr,
      descriptionFr: r.desc,
      frequency: r.days === 1 ? 'quotidien' : r.days === 14 ? 'hebdomadaire' : 'mensuel',
      frequencyDays: r.days,
      lastDoneDate: lastDone,
      nextDueDate: nextDue,
      isOverdue,
      overdueDays,
      consumableNeededFr: r.consumable,
      estimatedDurationMin: r.duration,
    };
  });

  // 4. Fraiseuse en bout
  const millTasksRaw = [
    {
      id: 't_mill_grease',
      titleFr: 'Graissage Chariot Coulissant & Paliers',
      desc: 'Graisser les douilles à billes de translation du bloc fraise et vérifier le carter de protection',
      days: 14,
      daysAgo: 11,
      consumable: 'Graisse lithium haute pression',
      duration: 15,
    },
    {
      id: 't_mill_cutters',
      titleFr: 'Contrôle Affûtage Paquet de Fraises',
      desc: 'Inspecter les arêtes carbure pour détecter toute ébréchure causant des bavures sur l alu',
      days: 30,
      daysAgo: 24,
      consumable: 'Fraise de grugeage de rechange',
      duration: 20,
    },
  ];

  const millTasks: MaintenanceTask[] = millTasksRaw.map((r) => {
    const lastDone = formatPastDate(r.daysAgo);
    const { nextDue, isOverdue, overdueDays } = computeDates(lastDone, r.days);
    return {
      id: r.id,
      machineId: 'M-MILL-01',
      titleFr: r.titleFr,
      descriptionFr: r.desc,
      frequency: r.days === 14 ? 'hebdomadaire' : 'mensuel',
      frequencyDays: r.days,
      lastDoneDate: lastDone,
      nextDueDate: nextDue,
      isOverdue,
      overdueDays,
      consumableNeededFr: r.consumable,
      estimatedDurationMin: r.duration,
    };
  });

  return [
    {
      id: 'M-CRIMP-01',
      name: 'Sertisseuse de Coins Pneumatique',
      brandModel: 'Pressta Eisele Corner 45',
      machineType: 'sertisseuse_coins',
      serialNumber: 'PR-2023-8841',
      yearInstalled: 2023,
      powerRatingKw: 2.2,
      operatingPressureBar: 8.0,
      healthPercent: computeMachineHealth(crimpTasks),
      status: crimpTasks.some((t) => t.isOverdue) ? 'maintenance_requise' : 'operationnelle',
      tasks: crimpTasks,
    },
    {
      id: 'M-ROUTER-01',
      name: 'Pantographe Copieuse Haute Vitesse',
      brandModel: 'Yilmaz FR 225 S (18000 RPM)',
      machineType: 'pantographe_copieuse',
      serialNumber: 'YL-2022-4119',
      yearInstalled: 2022,
      powerRatingKw: 1.5,
      operatingPressureBar: 6.5,
      healthPercent: computeMachineHealth(routerTasks),
      status: routerTasks.some((t) => t.isOverdue) ? 'maintenance_requise' : 'operationnelle',
      tasks: routerTasks,
    },
    {
      id: 'M-COMP-01',
      name: 'Centrale d Air Compresseur à Vis 500L',
      brandModel: 'Ceccato CSM 10 Maxi (10 bars)',
      machineType: 'compresseur_air',
      serialNumber: 'CC-2021-9023',
      yearInstalled: 2021,
      powerRatingKw: 7.5,
      operatingPressureBar: 10.0,
      healthPercent: computeMachineHealth(compTasks),
      status: compTasks.some((t) => t.isOverdue) ? 'maintenance_requise' : 'operationnelle',
      tasks: compTasks,
    },
    {
      id: 'M-MILL-01',
      name: 'Fraiseuse en Bout de Traverses',
      brandModel: 'Ozcelik Polar-I Automatique',
      machineType: 'fraiseuse_en_bout',
      serialNumber: 'OZ-2023-1490',
      yearInstalled: 2023,
      powerRatingKw: 1.8,
      operatingPressureBar: 7.0,
      healthPercent: computeMachineHealth(millTasks),
      status: millTasks.some((t) => t.isOverdue) ? 'maintenance_requise' : 'operationnelle',
      tasks: millTasks,
    },
  ];
}

export function getWorkshopMachines(): WorkshopMachine[] {
  if (typeof window === 'undefined') return getDefaultMachines();
  try {
    const raw = localStorage.getItem(STORAGE_KEY_MACHINES);
    if (!raw) {
      const defaults = getDefaultMachines();
      localStorage.setItem(STORAGE_KEY_MACHINES, JSON.stringify(defaults));
      return defaults;
    }
    return JSON.parse(raw);
  } catch {
    return getDefaultMachines();
  }
}

export function saveWorkshopMachines(machines: WorkshopMachine[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY_MACHINES, JSON.stringify(machines));
  } catch (err) {
    console.error('Failed to save machines', err);
  }
}

export function getMaintenanceLogs(): MaintenanceLogEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY_LOGS);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveMaintenanceLogs(logs: MaintenanceLogEntry[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY_LOGS, JSON.stringify(logs));
  } catch (err) {
    console.error('Failed to save logs', err);
  }
}

/**
 * Record a completed maintenance task, recalculate next due date, and log intervention
 */
export function recordCompletedTask(params: {
  machineId: string;
  taskId: string;
  technicianName: string;
  notesFr?: string;
  costDzd?: number;
  partsReplacedFr?: string;
}): WorkshopMachine[] {
  const machines = getWorkshopMachines();
  const todayStr = new Date().toISOString().split('T')[0];

  let targetTaskTitle = '';
  let targetMachineName = '';

  const updatedMachines = machines.map((m) => {
    if (m.id !== params.machineId) return m;
    targetMachineName = m.name;

    const updatedTasks = m.tasks.map((t) => {
      if (t.id !== params.taskId) return t;
      targetTaskTitle = t.titleFr;

      const { nextDue, isOverdue, overdueDays } = computeDates(todayStr, t.frequencyDays);
      return {
        ...t,
        lastDoneDate: todayStr,
        nextDueDate: nextDue,
        isOverdue,
        overdueDays,
      };
    });

    const newHealth = computeMachineHealth(updatedTasks);
    const hasOverdue = updatedTasks.some((t) => t.isOverdue);

    return {
      ...m,
      tasks: updatedTasks,
      healthPercent: newHealth,
      status: (hasOverdue ? 'maintenance_requise' : 'operationnelle') as WorkshopMachine['status'],
    };
  });

  saveWorkshopMachines(updatedMachines);

  // Add log record
  const newLog: MaintenanceLogEntry = {
    id: `log_${Date.now()}`,
    machineId: params.machineId,
    machineName: targetMachineName,
    taskId: params.taskId,
    taskTitle: targetTaskTitle || 'Maintenance Préventive',
    performedDate: todayStr,
    technicianName: params.technicianName || 'Technicien Atelier',
    notesFr: params.notesFr || 'Intervention préventive conforme aux préconisations constructeur',
    costDzd: params.costDzd || 0,
    partsReplacedFr: params.partsReplacedFr,
  };

  const logs = getMaintenanceLogs();
  saveMaintenanceLogs([newLog, ...logs]);

  return updatedMachines;
}

/**
 * Formats a clean WhatsApp dispatch notification for machine maintenance alerts
 */
export function formatMachineMaintenanceWhatsApp(machines: WorkshopMachine[]): string {
  const overdueTasks: { machineName: string; task: MaintenanceTask }[] = [];
  machines.forEach((m) => {
    m.tasks.forEach((t) => {
      if (t.isOverdue) {
        overdueTasks.push({ machineName: m.name, task: t });
      }
    });
  });

  let msg = '*ALERTE MAINTENANCE PARC MACHINES • BAITI ATELIER*\n';
  msg += `Date : ${new Date().toLocaleDateString('fr-DZ')}\n`;
  msg += `Parc : ${machines.length} machines industrielles sous surveillance\n\n`;

  if (overdueTasks.length === 0) {
    msg += '✅ *TOUTES LES MACHINES SONT 100% OPÉRATIONNELLES SANS RETARD.*\n';
    msg += 'Purges d air, graissages et niveaux d huile hydraulique conformes.';
  } else {
    msg += `⚠️ *${overdueTasks.length} INTERVENTIONS EN RETARD À RÉALISER :*\n\n`;
    overdueTasks.forEach((ot, idx) => {
      msg += `${idx + 1}. *${ot.machineName}*\n`;
      msg += `   • Tâche : *${ot.task.titleFr}*\n`;
      msg += `   • Retard : +${ot.task.overdueDays} jour(s) (Échéance : ${ot.task.nextDueDate})\n`;
      if (ot.task.consumableNeededFr) {
        msg += `   • Consommable requis : ${ot.task.consumableNeededFr}\n`;
      }
    });
    msg += '\nMerci au responsable d atelier de planifier ces interventions sans délai pour préserver la précision d usinage.';
  }

  msg += '\n\nBaiti Atelier Menuiserie Aluminium & PVC Algérie';
  return msg;
}
