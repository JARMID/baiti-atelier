import type { WorkshopJob } from '../types/workshop';

export type InstallationVerdict = 'conforme' | 'avec_reserve' | 'non_applicable';

export interface InstallationCheckPointDef {
  id: string;
  labelFr: string;
  labelAr: string;
  standardFr: string;
}

export interface JobInstallationAcceptance {
  jobId: string;
  acceptedAt: string;
  installerName: string;
  clientSignerName: string;
  hasReservations: boolean;
  reservationNotes: string;
  checkPoints: Record<string, InstallationVerdict>;
  paidOnSiteDzd: number;
  clientSignatureDataUrl?: string;
  installerSignatureDataUrl?: string;
}

export const INSTALLATION_SITE_CHECKPOINTS: InstallationCheckPointDef[] = [
  {
    id: 'aplomb_niveau',
    labelFr: 'Aplomb, horizontalité et niveau des dormants',
    labelAr: 'شاقولية وأفقية وضبط إطارات النوافذ والأبواب',
    standardFr: 'Tolérance conforme (≤ 2 mm par mètre courant)',
  },
  {
    id: 'fixations_ancrages',
    labelFr: 'Fixations mécaniques et ancrages maçonnerie',
    labelAr: 'التثبيت الميكانيكي والبراغي في الخرسانة أو الطوب',
    standardFr: 'Chevilles adaptées, calage d assise imputrescible',
  },
  {
    id: 'etancheite_silicone',
    labelFr: 'Étanchéité périphérique extérieure (Silicone)',
    labelAr: 'العزل الخارجي بمادة السيليكون المقاومة للعوامل الجوية',
    standardFr: 'Cordon continu mastic élastomère 1ère catégorie',
  },
  {
    id: 'drainage_evacuation',
    labelFr: 'Drainage et évacuation des eaux pluviales',
    labelAr: 'مجاري تصريف مياه الأمطار وعدم انسداد الفتحات',
    standardFr: 'Chicanes et orifices de décompression dégagés',
  },
  {
    id: 'cinematique_ouvrants',
    labelFr: 'Fonctionnement cinématique des ouvrants',
    labelAr: 'سلاسة حركة الدرفات المنزلقة أو المفصلية وضغط الجوانات',
    standardFr: 'Coulissement fluide, compression hermétique des joints',
  },
  {
    id: 'integrite_vitrage',
    labelFr: 'Aspect et intégrité des vitrages',
    labelAr: 'سلامة الزجاج من الخدوش أو الشروخ ونظافة الأسطح',
    standardFr: 'Absence d impact, rayure ou condensation interne',
  },
  {
    id: 'quincaillerie_verrouillage',
    labelFr: 'Quincaillerie, serrures et crémones',
    labelAr: 'إحكام الأقفال والمقابض وإغلاق آمن بدون أي مقاومة',
    standardFr: 'Verrouillage sécurisé et manœuvre sans point dur',
  },
  {
    id: 'nettoyage_repliement',
    labelFr: 'Nettoyage et repliement du chantier',
    labelAr: 'نزع أشرطة الحماية اللاصقة وتنظيف مكان العمل',
    standardFr: 'Films de protection déposés, zone rendue propre',
  },
];

const STORAGE_PREFIX = 'baiti_installation_pv_';

export function getJobInstallationAcceptance(job: WorkshopJob): JobInstallationAcceptance {
  if (typeof window === 'undefined') {
    return createDefaultAcceptance(job);
  }

  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}${job.id}`);
    if (raw) {
      const parsed = JSON.parse(raw) as JobInstallationAcceptance;
      return parsed;
    }
  } catch (err) {
    console.error('Error loading installation acceptance from localStorage:', err);
  }

  return createDefaultAcceptance(job);
}

export function saveJobInstallationAcceptance(acceptance: JobInstallationAcceptance): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(`${STORAGE_PREFIX}${acceptance.jobId}`, JSON.stringify(acceptance));
  } catch (err) {
    console.error('Error saving installation acceptance to localStorage:', err);
  }
}

function createDefaultAcceptance(job: WorkshopJob): JobInstallationAcceptance {
  const initialCheckPoints: Record<string, InstallationVerdict> = {};
  for (const cp of INSTALLATION_SITE_CHECKPOINTS) {
    initialCheckPoints[cp.id] = 'conforme';
  }

  return {
    jobId: job.id,
    acceptedAt: new Date().toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }),
    installerName: 'Chef d Équipe Poseur',
    clientSignerName: job.clientName,
    hasReservations: false,
    reservationNotes: '',
    checkPoints: initialCheckPoints,
    paidOnSiteDzd: 0,
  };
}

export function formatInstallationPvWhatsAppMessage(
  job: WorkshopJob,
  acceptance: JobInstallationAcceptance
): string {
  const initialBalanceDue = Math.max(0, job.totalAmountDzd - job.depositDzd);
  const paidOnSite = Math.min(initialBalanceDue, Math.max(0, acceptance.paidOnSiteDzd || 0));
  const finalBalanceDue = Math.max(0, initialBalanceDue - paidOnSite);

  const statusLabel = acceptance.hasReservations
    ? 'AVEC RÉSERVES (Délai d intervention : 15 jours)'
    : 'SANS RÉSERVE (RÉCEPTION DÉFINITIVE)';

  let msg = `*PROCÈS-VERBAL DE RÉCEPTION DE POSE - BAITI ATELIER*\n`;
  msg += `Affaire : ${job.id} • ${job.description}\n`;
  msg += `Client : ${job.clientName} (${job.clientPhone})\n`;
  msg += `Wilaya : ${job.wilaya}\n`;
  msg += `Date d intervention : ${acceptance.acceptedAt}\n`;
  msg += `Verdict : *${statusLabel}*\n\n`;

  msg += `*CONTRÔLES TECHNIQUES CHANTIER (DTU 36.5) :*\n`;
  for (const cp of INSTALLATION_SITE_CHECKPOINTS) {
    const verdict = acceptance.checkPoints[cp.id] || 'conforme';
    const tag = verdict === 'conforme' ? 'CONFORME' : verdict === 'avec_reserve' ? 'RÉSERVE' : 'N/A';
    msg += `• ${cp.labelFr} : ${tag}\n`;
  }

  if (acceptance.hasReservations && acceptance.reservationNotes.trim().length > 0) {
    msg += `\n*Détail des réserves :*\n${acceptance.reservationNotes.trim()}\n`;
  }

  msg += `\n*RÈGLEMENT FINANCIER :*\n`;
  msg += `• Montant total : ${job.totalAmountDzd.toLocaleString('fr-DZ')} DZD\n`;
  msg += `• Acompte initial : ${job.depositDzd.toLocaleString('fr-DZ')} DZD\n`;
  if (paidOnSite > 0) {
    msg += `• Encaissé sur chantier : ${paidOnSite.toLocaleString('fr-DZ')} DZD\n`;
  }
  msg += `• Solde restant : *${finalBalanceDue.toLocaleString('fr-DZ')} DZD*\n\n`;

  msg += `Garantie de parfait achèvement (1 an) et garantie biennale quincaillerie activées.\n`;
  msg += `Baiti Atelier Algérie • Menuiserie Aluminium & PVC`;

  return msg;
}
