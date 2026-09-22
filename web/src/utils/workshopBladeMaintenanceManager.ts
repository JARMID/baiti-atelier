export type BladeWearStatus = 'optimal' | 'avertissement' | 'critique' | 'affutage_requis' | 'rebut';

export interface BladeSharpeningLog {
  id: string;
  date: string;
  cycleNumber: number;
  sharpenerWorkshop: string;
  costDzd: number;
  technicianNotes?: string;
}

export interface WorkshopSawBlade {
  id: string;
  code: string;
  name: string;
  sawMachineName: string;
  diameterMm: number;
  teethCount: number;
  kerfWidthMm: number;
  currentCutCount: number;
  maxCutsBeforeResharpen: number;
  sharpeningCyclesDone: number;
  maxSharpeningCycles: number;
  lastSharpeningDate: string;
  lubricationOilLevelPercent: number;
  pneumaticPressureBar: number;
  history: BladeSharpeningLog[];
}

const STORAGE_BLADES_KEY = 'baiti_workshop_saw_blades';

export const DEFAULT_WORKSHOP_BLADES: WorkshopSawBlade[] = [
  {
    id: 'blade_01',
    code: 'LAME-TCT-450-Z108',
    name: 'Lame TCT Carbure Ø450 Z=108 Trapèze/Plat',
    sawMachineName: 'Tronçonneuse Monotête Ascendante 450mm',
    diameterMm: 450,
    teethCount: 108,
    kerfWidthMm: 3.5,
    currentCutCount: 2840,
    maxCutsBeforeResharpen: 4000,
    sharpeningCyclesDone: 2,
    maxSharpeningCycles: 5,
    lastSharpeningDate: '12/08/2026',
    lubricationOilLevelPercent: 74,
    pneumaticPressureBar: 6.8,
    history: [
      {
        id: 'aff_01',
        date: '10/04/2026',
        cycleNumber: 1,
        sharpenerWorkshop: 'Atelier Affûtage Outilleur Kouba',
        costDzd: 1600,
        technicianNotes: 'Reprise des faces d attaque, dents carbure intactes.',
      },
      {
        id: 'aff_02',
        date: '12/08/2026',
        cycleNumber: 2,
        sharpenerWorkshop: 'Atelier Affûtage Outilleur Kouba',
        costDzd: 1800,
        technicianNotes: 'Affûtage diamant, équilibrage dynamique effectué.',
      },
    ],
  },
  {
    id: 'blade_02',
    code: 'LAME-TCT-500-Z120',
    name: 'Lame TCT Carbure Ø500 Z=120 Silencieuse',
    sawMachineName: 'Scie Double-Tête CNC 500mm',
    diameterMm: 500,
    teethCount: 120,
    kerfWidthMm: 3.8,
    currentCutCount: 1120,
    maxCutsBeforeResharpen: 4500,
    sharpeningCyclesDone: 1,
    maxSharpeningCycles: 5,
    lastSharpeningDate: '28/08/2026',
    lubricationOilLevelPercent: 88,
    pneumaticPressureBar: 7.2,
    history: [
      {
        id: 'aff_03',
        date: '28/08/2026',
        cycleNumber: 1,
        sharpenerWorkshop: 'Service Technique Outils Rouiba',
        costDzd: 2200,
        technicianNotes: 'Première passe d affûtage après rodage.',
      },
    ],
  },
  {
    id: 'blade_03',
    code: 'LAME-TCT-300-PARCLOSE',
    name: 'Paire de Lames Parcloses 45° Ø200 + Ø98',
    sawMachineName: 'Scie à Parclose Découpe Simultanée',
    diameterMm: 200,
    teethCount: 80,
    kerfWidthMm: 2.2,
    currentCutCount: 3650,
    maxCutsBeforeResharpen: 4000,
    sharpeningCyclesDone: 3,
    maxSharpeningCycles: 5,
    lastSharpeningDate: '05/07/2026',
    lubricationOilLevelPercent: 62,
    pneumaticPressureBar: 6.5,
    history: [
      {
        id: 'aff_04',
        date: '05/07/2026',
        cycleNumber: 3,
        sharpenerWorkshop: 'Atelier Affûtage Outilleur Kouba',
        costDzd: 1400,
        technicianNotes: 'Changement de 2 pastilles carbure ébréchées.',
      },
    ],
  },
];

export function getWorkshopBlades(): WorkshopSawBlade[] {
  if (typeof window === 'undefined') return DEFAULT_WORKSHOP_BLADES;
  try {
    const raw = localStorage.getItem(STORAGE_BLADES_KEY);
    if (!raw) {
      saveWorkshopBlades(DEFAULT_WORKSHOP_BLADES);
      return DEFAULT_WORKSHOP_BLADES;
    }
    const parsed = JSON.parse(raw) as WorkshopSawBlade[];
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_WORKSHOP_BLADES;
  } catch (err) {
    console.error('Error reading workshop saw blades from localStorage:', err);
    return DEFAULT_WORKSHOP_BLADES;
  }
}

export function saveWorkshopBlades(blades: WorkshopSawBlade[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_BLADES_KEY, JSON.stringify(blades));
  } catch (err) {
    console.error('Error writing workshop saw blades to localStorage:', err);
  }
}

export function incrementBladeCutCount(bladeId: string, count: number): WorkshopSawBlade[] {
  const blades = getWorkshopBlades();
  const next = blades.map((b) => {
    if (b.id === bladeId) {
      const nextCount = Math.max(0, b.currentCutCount + count);
      return { ...b, currentCutCount: nextCount };
    }
    return b;
  });
  saveWorkshopBlades(next);
  return next;
}

export function recordBladeResharpening(
  bladeId: string,
  sharpenerWorkshop: string,
  costDzd: number,
  notes?: string
): WorkshopSawBlade[] {
  const blades = getWorkshopBlades();
  const next = blades.map((b) => {
    if (b.id === bladeId) {
      const nextCycle = b.sharpeningCyclesDone + 1;
      const newLog: BladeSharpeningLog = {
        id: `aff_${Date.now()}`,
        date: new Date().toLocaleDateString('fr-DZ'),
        cycleNumber: nextCycle,
        sharpenerWorkshop: sharpenerWorkshop.trim() || 'Atelier Affûtage',
        costDzd: Math.max(0, costDzd),
        technicianNotes: notes?.trim() || undefined,
      };
      return {
        ...b,
        currentCutCount: 0,
        sharpeningCyclesDone: nextCycle,
        lastSharpeningDate: newLog.date,
        history: [newLog, ...b.history],
      };
    }
    return b;
  });
  saveWorkshopBlades(next);
  return next;
}

export function getBladeWearTelemetry(blade: WorkshopSawBlade): {
  wearPercent: number;
  status: BladeWearStatus;
  statusLabelFr: string;
  badgeClass: string;
  remainingCuts: number;
  isNearingAffutage: boolean;
} {
  const remainingCuts = Math.max(0, blade.maxCutsBeforeResharpen - blade.currentCutCount);
  const wearPercent = Math.min(100, Math.round((blade.currentCutCount / blade.maxCutsBeforeResharpen) * 100));

  if (blade.sharpeningCyclesDone >= blade.maxSharpeningCycles && wearPercent >= 90) {
    return {
      wearPercent,
      status: 'rebut',
      statusLabelFr: 'Fin de vie (Pastilles carbure au témoin)',
      badgeClass: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
      remainingCuts,
      isNearingAffutage: true,
    };
  }

  if (wearPercent >= 90) {
    return {
      wearPercent,
      status: 'affutage_requis',
      statusLabelFr: 'Affûtage Urgent Requis',
      badgeClass: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
      remainingCuts,
      isNearingAffutage: true,
    };
  }

  if (wearPercent >= 70) {
    return {
      wearPercent,
      status: 'avertissement',
      statusLabelFr: 'Usure Modérée (Surveiller bavures)',
      badgeClass: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
      remainingCuts,
      isNearingAffutage: true,
    };
  }

  return {
    wearPercent,
    status: 'optimal',
    statusLabelFr: 'Tranchant Optimal (Coupe nette)',
    badgeClass: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    remainingCuts,
    isNearingAffutage: false,
  };
}

export function formatBladeMaintenanceWhatsAppAlert(blade: WorkshopSawBlade): string {
  const telemetry = getBladeWearTelemetry(blade);
  let msg = `*ALERTE MAINTENANCE ATELIER • LAME DE SCIE CIRCULAIRE*\n`;
  msg += `Machine : *${blade.sawMachineName}*\n`;
  msg += `Outil : ${blade.name} [${blade.code}]\n`;
  msg += `Diamètre : Ø${blade.diameterMm} mm • Dents : Z=${blade.teethCount} • Trait : ${blade.kerfWidthMm} mm\n\n`;
  msg += `*ÉTAT D USURE DU TRANCHANT :*\n`;
  msg += `• Compteur de coupes : *${blade.currentCutCount.toLocaleString('fr-DZ')} / ${blade.maxCutsBeforeResharpen.toLocaleString('fr-DZ')} coupes* (${telemetry.wearPercent}%)\n`;
  msg += `• Coupes restantes estimées : *${telemetry.remainingCuts.toLocaleString('fr-DZ')} coupes*\n`;
  msg += `• Diagnostic : *${telemetry.statusLabelFr}*\n`;
  msg += `• Cycle d affûtage actuel : *${blade.sharpeningCyclesDone} / ${blade.maxSharpeningCycles}*\n\n`;
  msg += `*TÉLÉMÉTRIE MACHINE :*\n`;
  msg += `• Niveau huile de coupe micro-pulvérisation : ${blade.lubricationOilLevelPercent}%\n`;
  msg += `• Pression pneumatique des vérins : ${blade.pneumaticPressureBar} bars (Standard : 6.0 à 7.5 bars)\n\n`;
  msg += `Merci de programmer le démontage et l envoi chez l affûteur outilleur.\n`;
  msg += `Baiti Atelier Algérie • Gestion et Maintenance de Parc Machine`;
  return msg;
}
