import type { WorkshopJob, WorkshopJobStage, WorkshopSettings } from '../types/workshop';

const STORAGE_JOBS_KEY = 'baiti_workshop_jobs_v1';
const STORAGE_SETTINGS_KEY = 'baiti_workshop_settings_v1';

export const STAGE_CONFIG: Record<
  WorkshopJobStage,
  { labelFr: string; labelAr: string; color: string; bgLight: string; bgDark: string; badge: string }
> = {
  devis: {
    labelFr: '1. Métré & Devis',
    labelAr: '١. رفع المقاسات والتسعير',
    color: 'text-amber-500',
    bgLight: 'bg-amber-50 border-amber-200',
    bgDark: 'bg-amber-500/10 border-amber-500/20',
    badge: 'MÉTRÉ VALIDÉ',
  },
  debitage: {
    labelFr: '2. Débitage Barres',
    labelAr: '٢. قص المقاطع والصفائح',
    color: 'text-sky-500',
    bgLight: 'bg-sky-50 border-sky-200',
    bgDark: 'bg-sky-500/10 border-sky-500/20',
    badge: 'DÉBIT SCIE',
  },
  usinage: {
    labelFr: '3. Usinage & Fraisage',
    labelAr: '٣. التفريز والتخريم',
    color: 'text-indigo-500',
    bgLight: 'bg-indigo-50 border-indigo-200',
    bgDark: 'bg-indigo-500/10 border-indigo-500/20',
    badge: 'DRAINAGE & SERRURE',
  },
  assemblage: {
    labelFr: '4. Assemblage & Vitrage',
    labelAr: '٤. التجميع والتركيب الزجاجي',
    color: 'text-purple-500',
    bgLight: 'bg-purple-50 border-purple-200',
    bgDark: 'bg-purple-500/10 border-purple-500/20',
    badge: 'SERTISSAGE & JOINTS',
  },
  pose: {
    labelFr: '5. Pose sur Chantier',
    labelAr: '٥. التركيب في الورشة أو الموقع',
    color: 'text-orange-500',
    bgLight: 'bg-orange-50 border-orange-200',
    bgDark: 'bg-orange-500/10 border-orange-500/20',
    badge: 'POSE CHANTIER',
  },
  termine: {
    labelFr: '6. Réceptionné & Soldé',
    labelAr: '٦. التسليم والقبض النهائي',
    color: 'text-emerald-500',
    bgLight: 'bg-emerald-50 border-emerald-200',
    bgDark: 'bg-emerald-500/10 border-emerald-500/20',
    badge: 'AFFAIRE CLÔTURÉE',
  },
};

export const STAGE_ORDER: WorkshopJobStage[] = [
  'devis',
  'debitage',
  'usinage',
  'assemblage',
  'pose',
  'termine',
];

const SEED_JOBS: WorkshopJob[] = [
  {
    id: 'AFF-2026-001',
    clientName: 'Promotion Immo Kouba',
    clientPhone: '0550123456',
    wilaya: '16 - Alger',
    stage: 'assemblage',
    itemCount: 12,
    description: '12 Châssis Gamme 45 Thermique + Double Vitrage Phonique',
    totalAmountDzd: 780000,
    depositDzd: 400000,
    dueDate: new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0],
    createdAt: new Date(Date.now() - 12 * 86400000).toISOString(),
    priority: 'urgent',
    profileSystem: 'gamme_45_thermal',
    notes: 'Livraison par tranches de 4 châssis. Accès grue disponible.',
  },
  {
    id: 'AFF-2026-002',
    clientName: 'Villa M. Amrani',
    clientPhone: '0661987654',
    wilaya: '16 - Alger',
    stage: 'debitage',
    itemCount: 6,
    description: '6 Coulissants 2 Vantaux + Volets Roulants Monobloc Radio',
    totalAmountDzd: 520000,
    depositDzd: 260000,
    dueDate: new Date(Date.now() + 8 * 86400000).toISOString().split('T')[0],
    createdAt: new Date(Date.now() - 6 * 86400000).toISOString(),
    priority: 'normal',
    profileSystem: 'coulissant_2v',
    notes: 'Couleur Gris Anthracite 7016 sablé. Télécommandes multicanaux.',
  },
  {
    id: 'AFF-2026-003',
    clientName: 'Clinique Dr. Cherifi',
    clientPhone: '0770334455',
    wilaya: '16 - Alger',
    stage: 'usinage',
    itemCount: 4,
    description: '4 Portes Entrée Double Vantail avec Barre Anti-Panique',
    totalAmountDzd: 340000,
    depositDzd: 170000,
    dueDate: new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0],
    createdAt: new Date(Date.now() - 4 * 86400000).toISOString(),
    priority: 'critique',
    profileSystem: 'porte_lourde',
    notes: 'Ferme-portes hydrauliques à force réglable. Conforme ERP.',
  },
  {
    id: 'AFF-2026-004',
    clientName: 'Résidence Les Pins',
    clientPhone: '0555889900',
    wilaya: '31 - Oran',
    stage: 'pose',
    itemCount: 18,
    description: '18 Châssis Oscillo-Battants 1 Vantail avec Imposte Vitrée',
    totalAmountDzd: 1250000,
    depositDzd: 950000,
    dueDate: new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0],
    createdAt: new Date(Date.now() - 20 * 86400000).toISOString(),
    priority: 'urgent',
    profileSystem: 'ob_1v',
    notes: 'Échafaudage monté sur façade nord. Pose calfeutrement silicone neutre.',
  },
  {
    id: 'AFF-2026-005',
    clientName: 'Duplex Bab Ezzouar',
    clientPhone: '0662112233',
    wilaya: '16 - Alger',
    stage: 'termine',
    itemCount: 3,
    description: '3 Baies Vitrées Coulissantes 3 Rails Galandage',
    totalAmountDzd: 410000,
    depositDzd: 410000,
    dueDate: new Date(Date.now() - 2 * 86400000).toISOString().split('T')[0],
    createdAt: new Date(Date.now() - 25 * 86400000).toISOString(),
    priority: 'normal',
    profileSystem: 'coulissant_3rails',
    notes: 'Pose réceptionnée sans réserve. Solde perçu par virement.',
  },
];

export const DEFAULT_WORKSHOP_SETTINGS: WorkshopSettings = {
  hourlyRateDzd: 1500,
  targetMarginPercent: 30,
  sawKerfMm: 4.0,
  standardBarLengthMm: 6000,
  energyOverheadPercent: 6,
  deliveryBaseDzd: 7000,
  workshopName: 'Menuiserie Aluminium & PVC Moderne',
  workshopPhone: '05 50 00 00 00',
  workshopWilaya: '16 - Alger',
};

export function getWorkshopJobs(): WorkshopJob[] {
  if (typeof window === 'undefined') return SEED_JOBS;
  try {
    const raw = localStorage.getItem(STORAGE_JOBS_KEY);
    if (!raw) {
      saveWorkshopJobs(SEED_JOBS);
      return SEED_JOBS;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to load workshop jobs from local storage', err);
    return SEED_JOBS;
  }
}

export function saveWorkshopJobs(jobs: WorkshopJob[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_JOBS_KEY, JSON.stringify(jobs));
  } catch (err) {
    console.error('Failed to save workshop jobs to local storage', err);
  }
}

export function addWorkshopJob(
  input: Omit<WorkshopJob, 'id' | 'createdAt'>
): WorkshopJob {
  const jobs = getWorkshopJobs();
  const year = new Date().getFullYear();
  const nextNum = jobs.length + 1;
  const id = `AFF-${year}-${String(nextNum).padStart(3, '0')}`;

  const newJob: WorkshopJob = {
    ...input,
    id,
    createdAt: new Date().toISOString(),
  };

  const updated = [newJob, ...jobs];
  saveWorkshopJobs(updated);
  return newJob;
}

export function updateJobStage(
  id: string,
  stage: WorkshopJobStage
): WorkshopJob | null {
  const jobs = getWorkshopJobs();
  let updatedJob: WorkshopJob | null = null;

  const nextJobs = jobs.map((job) => {
    if (job.id === id) {
      updatedJob = { ...job, stage };
      return updatedJob;
    }
    return job;
  });

  if (updatedJob) {
    saveWorkshopJobs(nextJobs);
  }
  return updatedJob;
}

export function advanceJobStage(id: string): WorkshopJob[] {
  const jobs = getWorkshopJobs();
  const nextJobs = jobs.map((job) => {
    if (job.id === id) {
      const curIdx = STAGE_ORDER.indexOf(job.stage);
      if (curIdx < STAGE_ORDER.length - 1) {
        return { ...job, stage: STAGE_ORDER[curIdx + 1] };
      }
    }
    return job;
  });
  saveWorkshopJobs(nextJobs);
  return nextJobs;
}

export function updateJob(
  id: string,
  patch: Partial<WorkshopJob>
): WorkshopJob | null {
  const jobs = getWorkshopJobs();
  let updatedJob: WorkshopJob | null = null;

  const nextJobs = jobs.map((job) => {
    if (job.id === id) {
      updatedJob = { ...job, ...patch };
      return updatedJob;
    }
    return job;
  });

  if (updatedJob) {
    saveWorkshopJobs(nextJobs);
  }
  return updatedJob;
}

export function deleteJob(id: string): void {
  const jobs = getWorkshopJobs();
  const nextJobs = jobs.filter((job) => job.id !== id);
  saveWorkshopJobs(nextJobs);
}

export function getWorkshopSettings(): WorkshopSettings {
  if (typeof window === 'undefined') return DEFAULT_WORKSHOP_SETTINGS;
  try {
    const raw = localStorage.getItem(STORAGE_SETTINGS_KEY);
    if (!raw) {
      saveWorkshopSettings(DEFAULT_WORKSHOP_SETTINGS);
      return DEFAULT_WORKSHOP_SETTINGS;
    }
    return { ...DEFAULT_WORKSHOP_SETTINGS, ...JSON.parse(raw) };
  } catch (err) {
    console.error('Failed to load workshop settings', err);
    return DEFAULT_WORKSHOP_SETTINGS;
  }
}

export function saveWorkshopSettings(settings: WorkshopSettings): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_SETTINGS_KEY, JSON.stringify(settings));
  } catch (err) {
    console.error('Failed to save workshop settings', err);
  }
}
