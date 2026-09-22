import type { WorkshopJob } from '../types/workshop';

export type QualityItemCategory =
  | 'usinage_assemblage'
  | 'etancheite_vitrage'
  | 'mecanique_quincaillerie'
  | 'finition_emballage';

export type QualityItemStatus = 'conforme' | 'corrige' | 'non_applicable';

export interface QualityCheckItemDefinition {
  id: string;
  category: QualityItemCategory;
  labelFr: string;
  labelAr: string;
  descriptionFr: string;
  standardToleranceFr: string;
}

export interface QualityItemResult {
  itemId: string;
  status: QualityItemStatus;
  note?: string;
}

export interface JobQualityInspection {
  jobId: string;
  inspectorName: string;
  inspectedAt: string;
  items: Record<string, QualityItemResult>;
  overallNotes: string;
  isApproved: boolean;
}

export const QUALITY_CHECK_ITEMS: QualityCheckItemDefinition[] = [
  {
    id: 'equerres_sertissage',
    category: 'usinage_assemblage',
    labelFr: 'Équerres d assemblage & sertissage',
    labelAr: 'زوايا التجميع والكبس',
    descriptionFr: 'Vérification du serrage des équerres à pion ou sertissage des angles de dormants et ouvrants.',
    standardToleranceFr: 'Désaffleurement d onglet < 0.3 mm, équerrage parfait des diagonales.',
  },
  {
    id: 'etancheite_onglets',
    category: 'usinage_assemblage',
    labelFr: 'Étanchéité des onglets de coupe à 45°',
    labelAr: 'عزل وتقفيل الزوايا المشطوفة 45 درجة',
    descriptionFr: 'Application de la colle polyuréthane bi-composant étanche dans les coupes d onglet.',
    standardToleranceFr: 'Joint d onglet fermé sans interstice visible, colle étanche polymérisée.',
  },
  {
    id: 'drainage_trous_eau',
    category: 'etancheite_vitrage',
    labelFr: 'Usinage trous d eau & clapets pare-vent',
    labelAr: 'فتحات تصريف مياه الأمطار وصمامات الرياح',
    descriptionFr: 'Fraisage régulier des évacuations en traverse basse et clipsage des busettes pare-vent.',
    standardToleranceFr: 'Minimum 2 évacuations par travée, fentes débouchantes sans bavures.',
  },
  {
    id: 'calage_vitrage',
    category: 'etancheite_vitrage',
    labelFr: 'Calage du vitrage & prise de feuillure',
    labelAr: 'وسادات ضبط الزجاج وتوزيع الثقل',
    descriptionFr: 'Pose des cales d assise et cales de rive selon schéma métier pour empêcher le fléchissement.',
    standardToleranceFr: 'Prise de feuillure minimale 15 mm, cales imputrescibles en polypropylène.',
  },
  {
    id: 'joints_epdm',
    category: 'etancheite_vitrage',
    labelFr: 'Joints d étanchéité EPDM & brosses',
    labelAr: 'جوانات الإغلاق المطاطية وفراشي منع الغبار',
    descriptionFr: 'Continuité des joints sans étirement aux angles et insertion des brosses d étanchéité sur coulissants.',
    standardToleranceFr: 'Joints compressibles sans plissement ni arrachement, brosses fin-seal montées.',
  },
  {
    id: 'quincaillerie_galets',
    category: 'mecanique_quincaillerie',
    labelFr: 'Crémone, galets inox & verrouillage',
    labelAr: 'الأقفال وعجلات الانزلاق المصنوعة من الإينوكس',
    descriptionFr: 'Essai mécanique d ouverture, roulement doux des vantaux coulissants et enclenchement des gâches.',
    standardToleranceFr: 'Translation silencieuse sans point dur, verrouillage franc 3 points.',
  },
  {
    id: 'volet_tablier',
    category: 'mecanique_quincaillerie',
    labelFr: 'Volet roulant monobloc & fins de course',
    labelAr: 'الستار الدوار وضبط حدود التوقف والأمان',
    descriptionFr: 'Test complet de montée et descente, réglage des butées moteur/treuil et verrous anti-soulèvement.',
    standardToleranceFr: 'Enroulement rectiligne sans déviation, occultation totale en fin de course.',
  },
  {
    id: 'film_protection',
    category: 'finition_emballage',
    labelFr: 'Film pelable de protection & aspect',
    labelAr: 'شريط الحماية اللاصق وسلامة الطلاء',
    descriptionFr: 'Contrôle visuel des surfaces thermolaquées ou anodisées, présence du film de protection chantier.',
    standardToleranceFr: 'Zéro rayure, zéro éclat de laque, angles protégés par cales carton ou mousse.',
  },
];

const STORAGE_KEY_PREFIX = 'baiti_workshop_qa_';

export function getJobQualityInspection(jobId: string): JobQualityInspection {
  if (typeof window === 'undefined') {
    return createDefaultInspection(jobId);
  }

  try {
    const raw = localStorage.getItem(`${STORAGE_KEY_PREFIX}${jobId}`);
    if (raw) {
      const parsed: JobQualityInspection = JSON.parse(raw);
      return parsed;
    }
  } catch {
    // Fallback on clean record
  }

  return createDefaultInspection(jobId);
}

export function saveJobQualityInspection(inspection: JobQualityInspection): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(
      `${STORAGE_KEY_PREFIX}${inspection.jobId}`,
      JSON.stringify(inspection)
    );
  } catch {
    // Storage quota handled
  }
}

export function createDefaultInspection(jobId: string): JobQualityInspection {
  const items: Record<string, QualityItemResult> = {};
  for (const def of QUALITY_CHECK_ITEMS) {
    items[def.id] = {
      itemId: def.id,
      status: 'conforme',
    };
  }

  return {
    jobId,
    inspectorName: 'Chef d Atelier',
    inspectedAt: new Date().toISOString().split('T')[0],
    items,
    overallNotes: 'Châssis conformes aux normes techniques. Prêts pour chargement et pose.',
    isApproved: true,
  };
}

export function computeQualityScore(inspection: JobQualityInspection): {
  conformeCount: number;
  corrigeCount: number;
  naCount: number;
  totalActive: number;
  percentage: number;
  isFullyCompliant: boolean;
} {
  let conformeCount = 0;
  let corrigeCount = 0;
  let naCount = 0;

  for (const def of QUALITY_CHECK_ITEMS) {
    const item = inspection.items[def.id];
    const status = item ? item.status : 'conforme';
    if (status === 'conforme') conformeCount++;
    else if (status === 'corrige') corrigeCount++;
    else if (status === 'non_applicable') naCount++;
  }

  const totalActive = QUALITY_CHECK_ITEMS.length - naCount;
  const compliantTotal = conformeCount + corrigeCount;
  const percentage = totalActive > 0 ? Math.round((compliantTotal / totalActive) * 100) : 100;
  const isFullyCompliant = compliantTotal === totalActive;

  return {
    conformeCount,
    corrigeCount,
    naCount,
    totalActive,
    percentage,
    isFullyCompliant,
  };
}

export function formatQualityWhatsAppMessage(
  job: WorkshopJob,
  inspection: JobQualityInspection
): string {
  const score = computeQualityScore(inspection);
  const statusIcon = score.isFullyCompliant ? '✅' : '⚠️';
  const approvedText = score.isFullyCompliant
    ? 'CONFORME & PRÊT POUR LIVRAISON'
    : 'EN COURS DE VALIDATION';

  const lines = [
    `*BAITI ATELIER • CONTRÔLE QUALITÉ ATELIER*`,
    `----------------------------------------`,
    `📋 *Affaire :* ${job.id} - ${job.clientName}`,
    `📍 *Wilaya :* ${job.wilaya}`,
    `🪟 *Volume :* ${job.itemCount} châssis commandés`,
    `👨‍🔧 *Inspecteur :* ${inspection.inspectorName}`,
    `📅 *Date de contrôle :* ${inspection.inspectedAt}`,
    `----------------------------------------`,
    `${statusIcon} *Résultat Contrôle :* ${score.percentage}% (${approvedText})`,
    `• Points conformes du premier coup : ${score.conformeCount}/${score.totalActive}`,
    score.corrigeCount > 0 ? `• Points ajustés et validés : ${score.corrigeCount}` : null,
    `----------------------------------------`,
    `📝 *Remarque atelier :* ${inspection.overallNotes || 'RAS'}`,
    `🚚 *Statut livraison :* Autorisation de sortie atelier délivrée.`,
    `----------------------------------------`,
    `_Baiti Atelier • Plateforme Métier Menuiserie & Pose Algérie_`,
  ].filter(Boolean);

  return lines.join('\n');
}
