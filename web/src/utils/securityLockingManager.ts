/**
 * Baiti Atelier - Multi-Point Espagnolette Locking & Burglary Resistance Safety Manager
 * Normative references:
 * - NF EN 1627: Portes et fenetres - Resistance a l effraction - Prescriptions et classification (RC1N a RC4)
 * - NF EN 1628: Essai de resistance sous charge statique (jusqu a 1000 daN par point de condamnation)
 * - NF EN 1629: Essai de resistance sous charge dynamique (choc au pendule 50 kg)
 * - NF EN 1630: Essai de resistance a l attaque manuelle (outillage et temps de contact)
 * - NF EN 356: Vitrage de securite - Essais et classification de resistance a l attaque manuelle (P1A a P8B)
 * - NF P20-302 / A2P: Serrures et quincailleries de securite certifiees
 *
 * Humanizer invariant: exactly 0 em dashes, 0 en dashes.
 */

export type BurglaryResistanceClass = 'rc1n' | 'rc2n' | 'rc2' | 'rc3' | 'rc4';

export interface ResistanceClassSpec {
  id: BurglaryResistanceClass;
  label: string;
  nameFr: string;
  targetAttacker: string;
  toolSetFr: string;
  resistanceTimeMinutes: number;
  staticLoadPerPointDaN: number;
  maxLockingSpacingMm: number;
  mandatoryGlazingEn356: string;
  handleLockTorqueNm: number;
  descriptionFr: string;
}

export const BURGLARY_RESISTANCE_CLASSES: Record<BurglaryResistanceClass, ResistanceClassSpec> = {
  rc1n: {
    id: 'rc1n',
    label: 'RC1N (Base)',
    nameFr: 'Classe RC1N - Protection Elémentaire contre la Force Corporelle',
    targetAttacker: 'Vandalisme spontané ou cambrioleur opportuniste sans outil (coups de pied, épaule).',
    toolSetFr: 'Force physique seule, sans levier ni outil coupant.',
    resistanceTimeMinutes: 0,
    staticLoadPerPointDaN: 150,
    maxLockingSpacingMm: 800,
    mandatoryGlazingEn356: 'Verre standard non exigé (double vitrage ordinaire)',
    handleLockTorqueNm: 0,
    descriptionFr: 'Convient aux etages eleves sans acces balcon, terrasses inaccessibles ou fenetres de toit protegees.',
  },
  rc2n: {
    id: 'rc2n',
    label: 'RC2N (Standard)',
    nameFr: 'Classe RC2N - Protection Quincaillerie Renforcée sans Verre Sécurit',
    targetAttacker: 'Cambrioleur occasionnel avec petits outils (tournevis, coins bois, pinces).',
    toolSetFr: 'Tournevis 375 mm, pied de biche court 300 mm, pinces multiprises.',
    resistanceTimeMinutes: 3,
    staticLoadPerPointDaN: 300,
    maxLockingSpacingMm: 600,
    mandatoryGlazingEn356: 'Vitrage standard admis (menuiserie fermee par volet roulant certifie)',
    handleLockTorqueNm: 100,
    descriptionFr: 'Idéal pour fenetres protégées par un volet roulant extrudé renforcé ou grille extérieure.',
  },
  rc2: {
    id: 'rc2',
    label: 'RC2 (Sécurité Résidentielle)',
    nameFr: 'Classe RC2 - Norme Résidentielle Recommandée Villas & Rez-de-Chaussée',
    targetAttacker: 'Cambrioleur averti cherchant l effraction rapide par relevage ou torsion d ouvrant.',
    toolSetFr: 'Tournevis, coins, pinces, pied de biche moyen 350 mm.',
    resistanceTimeMinutes: 3,
    staticLoadPerPointDaN: 300,
    maxLockingSpacingMm: 550,
    mandatoryGlazingEn356: 'Feuilleté Sécurité Classe P4A obligatoire (44.2 ou 33.4)',
    handleLockTorqueNm: 100,
    descriptionFr: 'Exigence minimale pour rez-de-chaussee, balcons accessibles et fenetres de plain-pied en villa.',
  },
  rc3: {
    id: 'rc3',
    label: 'RC3 (Haute Sécurité)',
    nameFr: 'Classe RC3 - Haute Sécurité Anti-Effraction Commerces & Résidences',
    targetAttacker: 'Cambrioleur chevronné et déterminé prêt à forcer les points de verrouillage.',
    toolSetFr: 'Pied de biche long 710 mm, massette 200 g, pointeau, scie a métaux manuelle.',
    resistanceTimeMinutes: 5,
    staticLoadPerPointDaN: 600,
    maxLockingSpacingMm: 450,
    mandatoryGlazingEn356: 'Feuilleté Haute Sécurité Classe P5A obligatoire (6 intercalaires PVB)',
    handleLockTorqueNm: 100,
    descriptionFr: 'Recommandé pour bijouteries, bureaux de change, banques, pharmacies et villas de prestige isolées.',
  },
  rc4: {
    id: 'rc4',
    label: 'RC4 (Blindage Professionnel)',
    nameFr: 'Classe RC4 - Blindage Renforcé pour Sites Stratégiques',
    targetAttacker: 'Équipe criminelle expérimentée disposant d outillage lourd de découpe et de frappe.',
    toolSetFr: 'Masse 1.25 kg, ciseau a froid, hachette, perceuse sur batterie a forets cobalt.',
    resistanceTimeMinutes: 10,
    staticLoadPerPointDaN: 1000,
    maxLockingSpacingMm: 350,
    mandatoryGlazingEn356: 'Verre Blindé Anti-Hache Classe P6B ou P7B obligatoire',
    handleLockTorqueNm: 150,
    descriptionFr: 'Chambre forte, salles informatiques sensibles, armureries et résidences diplomatiques.',
  },
};

export type LockingCamType =
  | 'round_standard'
  | 'mushroom_steel'
  | 'hook_claw_bolt'
  | 'linear_shootbolt';

export interface LockingCamSpec {
  id: LockingCamType;
  nameFr: string;
  shearStrengthDaN: number;
  antiPryingFeature: string;
  recommendedMaxClass: BurglaryResistanceClass;
  descriptionFr: string;
}

export const LOCKING_CAM_TYPES: Record<LockingCamType, LockingCamSpec> = {
  round_standard: {
    id: 'round_standard',
    nameFr: 'Galet Rond Simple Réglable',
    shearStrengthDaN: 120,
    antiPryingFeature: 'Aucun ancrage anti-dégondage (glisse hors de la gâche sous levier).',
    recommendedMaxClass: 'rc1n',
    descriptionFr: 'Quincaillerie basique uniquement destinee a la compression du joint d etancheite.',
  },
  mushroom_steel: {
    id: 'mushroom_steel',
    nameFr: 'Galet Champignon Acier Trempé (Mushroom Cam)',
    shearStrengthDaN: 380,
    antiPryingFeature: 'Tête évasée qui s emboîte dans la gâche de sécurité et bloque le relevage d ouvrant.',
    recommendedMaxClass: 'rc2',
    descriptionFr: 'Standard de sécurité européen pour menuiseries oscillo-battantes et ouvrants a la francaise.',
  },
  hook_claw_bolt: {
    id: 'hook_claw_bolt',
    nameFr: 'Pênes Crochets Basculants en Acier Massif',
    shearStrengthDaN: 850,
    antiPryingFeature: 'Crochet acier se verrouillant en sens opposé interdisant tout ecartement du dormant.',
    recommendedMaxClass: 'rc3',
    descriptionFr: 'Haut niveau de resistance mecanique particulièrement efficace contre le pied de biche de 700 mm.',
  },
  linear_shootbolt: {
    id: 'linear_shootbolt',
    nameFr: 'Verrous a Pêne Rectiligne Traversant (Shootbolts)',
    shearStrengthDaN: 1200,
    antiPryingFeature: 'Goupille cylindrique de 12 mm s enfoncant profondément dans la traverse haute et basse.',
    recommendedMaxClass: 'rc4',
    descriptionFr: 'Verrouillage d angle ultra-rigide pour portes et grandes baies de securite maximale.',
  },
};

export interface SecurityAuditorInput {
  widthMm: number;
  heightMm: number;
  targetClass: BurglaryResistanceClass;
  chosenCamType: LockingCamType;
  installedLockingPointsCount?: number;
  hasLockingHandleKey: boolean;
  hasAntiDrillPlate: boolean;
  currentGlazingType: string;
  wilayaName?: string;
  windowReference?: string;
}

export interface SecurityAuditorResult {
  input: SecurityAuditorInput;
  classSpec: ResistanceClassSpec;
  camSpec: LockingCamSpec;

  // Geometry
  perimeterMm: number;
  recommendedMinLockingPoints: number;
  effectiveLockingPoints: number;
  cornerDrivesCount: number;
  actualSpacingMm: number;
  isSpacingCompliant: boolean;

  // Mechanical Strength
  totalResistingForceDaN: number;
  requiredClassForceDaN: number;
  isStrengthSufficient: boolean;

  // Hardware Checks
  isCamTypeAdequate: boolean;
  isHandleKeyCompliant: boolean;
  isAntiDrillCompliant: boolean;
  glazingMatchVerdictFr: string;
  isGlazingAligned: boolean;

  // Compliance Verdicts
  overallVerdict: 'favorable' | 'warning' | 'critical';
  verdictTitleFr: string;
  complianceDefectsFr: string[];
  recommendationsFr: string[];
}

/**
 * Audits window and door locking hardware security according to NF EN 1627-1630.
 */
export function auditSecurityLocking(input: SecurityAuditorInput): SecurityAuditorResult {
  const classSpec = BURGLARY_RESISTANCE_CLASSES[input.targetClass];
  const camSpec = LOCKING_CAM_TYPES[input.chosenCamType];

  const perimeterMm = 2 * (input.widthMm + input.heightMm);
  const maxSpacing = classSpec.maxLockingSpacingMm;

  // Minimum required locking points based on perimeter and corners
  const pointsOnWidth = Math.max(Math.ceil(input.widthMm / maxSpacing), 1);
  const pointsOnHeight = Math.max(Math.ceil(input.heightMm / maxSpacing), 2);
  // 4 corners should have adjacent locking points for RC2 and above
  const recommendedMinLockingPoints = 2 * (pointsOnWidth + pointsOnHeight);
  const cornerDrivesCount = input.targetClass !== 'rc1n' ? 4 : 2;

  const effectiveLockingPoints = input.installedLockingPointsCount && input.installedLockingPointsCount > 0
    ? input.installedLockingPointsCount
    : recommendedMinLockingPoints;

  const actualSpacingMm = Math.round(perimeterMm / effectiveLockingPoints);
  const isSpacingCompliant = actualSpacingMm <= maxSpacing * 1.10;

  // Mechanical static push-out resistance
  const totalResistingForceDaN = effectiveLockingPoints * camSpec.shearStrengthDaN;
  const requiredClassForceDaN = effectiveLockingPoints * classSpec.staticLoadPerPointDaN;
  const isStrengthSufficient = totalResistingForceDaN >= requiredClassForceDaN;

  // Cam adequacy hierarchy
  const camRank: Record<LockingCamType, number> = {
    round_standard: 1,
    mushroom_steel: 2,
    hook_claw_bolt: 3,
    linear_shootbolt: 4,
  };
  const classRank: Record<BurglaryResistanceClass, number> = {
    rc1n: 1,
    rc2n: 2,
    rc2: 2,
    rc3: 3,
    rc4: 4,
  };

  const isCamTypeAdequate = camRank[input.chosenCamType] >= classRank[input.targetClass];

  // Handle key lock requirement (mandatory for RC2, RC3, RC4)
  const isHandleKeyCompliant = input.targetClass === 'rc1n' || input.hasLockingHandleKey;
  // Anti drill plate requirement (mandatory for RC3, RC4)
  const isAntiDrillCompliant =
    input.targetClass === 'rc1n' || input.targetClass === 'rc2n' || input.targetClass === 'rc2' || input.hasAntiDrillPlate;

  // Glazing alignment check
  let isGlazingAligned = true;
  let glazingMatchVerdictFr = 'Vitrage en accord avec l exigence normative de la classe.';

  const gType = input.currentGlazingType.toLowerCase();
  if (input.targetClass === 'rc2') {
    if (!gType.includes('44') && !gType.includes('feuil') && !gType.includes('lamin') && !gType.includes('33.4')) {
      isGlazingAligned = false;
      glazingMatchVerdictFr = 'Non Conforme: Vitrage P4A (44.2 ou equivalent) obligatoire en classe RC2.';
    }
  } else if (input.targetClass === 'rc3') {
    if (!gType.includes('55') && !gType.includes('p5a')) {
      isGlazingAligned = false;
      glazingMatchVerdictFr = 'Non Conforme: Vitrage P5A haute sécurité exigé en classe RC3.';
    }
  } else if (input.targetClass === 'rc4') {
    if (!gType.includes('blind') && !gType.includes('p6b') && !gType.includes('p7b')) {
      isGlazingAligned = false;
      glazingMatchVerdictFr = 'Non Conforme: Vitrage Blindé Anti-Hache (P6B minimum) obligatoire en classe RC4.';
    }
  }

  // Determine overall verdict
  const complianceDefectsFr: string[] = [];
  const recommendationsFr: string[] = [];

  if (!isSpacingCompliant) {
    complianceDefectsFr.push(
      'Espacement moyen de ' +
        actualSpacingMm +
        ' mm supérieur au plafond normatif de ' +
        maxSpacing +
        ' mm.'
    );
    recommendationsFr.push(
      'Ajouter au minimum ' +
        (recommendedMinLockingPoints - effectiveLockingPoints) +
        ' point(s) de condamnation supplémentaire(s).'
    );
  }

  if (!isCamTypeAdequate) {
    complianceDefectsFr.push(
      'Type de galet ' +
        camSpec.nameFr +
        ' insuffisant pour la classe ' +
        classSpec.label +
        ' (galets champignons ou pênes crochets requis).'
    );
    recommendationsFr.push(
      'Remplacer les galets simples par des galets champignons en acier cémenté avec gâches de sécurité.'
    );
  }

  if (!isStrengthSufficient) {
    complianceDefectsFr.push(
      'Résistance globale calculée (' +
        totalResistingForceDaN +
        ' daN) inférieure à l effort statique d essai (' +
        requiredClassForceDaN +
        ' daN).'
    );
  }

  if (!isHandleKeyCompliant) {
    complianceDefectsFr.push(
      'Poignée à clé ou bouton sécable 100 Nm absente (exigée pour bloquer le fouillot sous attaque par perçage).'
    );
    recommendationsFr.push(
      'Installer une poignée de sécurité à clé certifiée 100 Nm avec mécanisme anti-torsion.'
    );
  }

  if (!isAntiDrillCompliant) {
    complianceDefectsFr.push(
      'Plaque de blindage anti-perçage au manganèse absente devant le coffre de serrure.'
    );
    recommendationsFr.push(
      'Poser une plaque d acier trempé ou manganèse protégeant le boîtier crémone contre le perçage direct.'
    );
  }

  if (!isGlazingAligned) {
    complianceDefectsFr.push(glazingMatchVerdictFr);
    recommendationsFr.push(
      'Spécifier un vitrage conforme à la norme NF EN 356 : ' + classSpec.mandatoryGlazingEn356 + '.'
    );
  }

  let overallVerdict: 'favorable' | 'warning' | 'critical' = 'favorable';
  let verdictTitleFr = 'Conforme NF EN 1627 Classe ' + classSpec.label;

  if (complianceDefectsFr.length > 0) {
    if (
      !isCamTypeAdequate ||
      !isStrengthSufficient ||
      (!isGlazingAligned && input.targetClass !== 'rc2n')
    ) {
      overallVerdict = 'critical';
      verdictTitleFr = 'Non Conforme: Résistance Insuffisante pour la Classe ' + classSpec.label;
    } else {
      overallVerdict = 'warning';
      verdictTitleFr = 'Conformité Partielle: Ajustements Quincaillerie Recommandés';
    }
  }

  // Base workshop recommendations
  recommendationsFr.push(
    'Visser chaque gâche de sécurité par 3 vis acier inox traversant directement la paroi aluminium ou le renfort tubulaire.'
  );
  recommendationsFr.push(
    'Disposer des cales d appui incompressibles au droit de chaque point de verrouillage pour empêcher le cintrage des montants.'
  );

  return {
    input,
    classSpec,
    camSpec,
    perimeterMm,
    recommendedMinLockingPoints,
    effectiveLockingPoints,
    cornerDrivesCount,
    actualSpacingMm,
    isSpacingCompliant,
    totalResistingForceDaN,
    requiredClassForceDaN,
    isStrengthSufficient,
    isCamTypeAdequate,
    isHandleKeyCompliant,
    isAntiDrillCompliant,
    glazingMatchVerdictFr,
    isGlazingAligned,
    overallVerdict,
    verdictTitleFr,
    complianceDefectsFr,
    recommendationsFr,
  };
}

/**
 * Formats WhatsApp technical dispatch for locksmiths, workshops, and security consultants.
 */
export function formatSecurityDispatchWhatsApp(
  res: SecurityAuditorResult,
  clientName: string,
  projectRef: string
): string {
  const lines: string[] = [
    '*BAITI ATELIER - AUDIT SECURITE ANTI-EFFRACTION*',
    'Ref: ' + projectRef + ' | Client: ' + clientName,
    'Normes: NF EN 1627 a 1630 / NF EN 356 / A2P',
    '----------------------------------------',
    '*1. CLASSEMENT DE SECURITE CIBLE*',
    'Classe visee: ' + res.classSpec.nameFr,
    'Temps de resistance officiel: ' + res.classSpec.resistanceTimeMinutes + ' minutes d attaque continue',
    'Profil de cambrioleur: ' + res.classSpec.targetAttacker,
    'Outillage teste: ' + res.classSpec.toolSetFr,
    '',
    '*2. QUINCAILLERIE & CONDAMNATION*',
    'Dimensions: ' + res.input.widthMm + ' x ' + res.input.heightMm + ' mm (Perimetre: ' + res.perimeterMm + ' mm)',
    'Points de verrouillage: ' + res.effectiveLockingPoints + ' points (Min requis: ' + res.recommendedMinLockingPoints + ')',
    'Espacement moyen entre points: ' + res.actualSpacingMm + ' mm (Max autorise: ' + res.classSpec.maxLockingSpacingMm + ' mm)',
    'Type de galets: ' + res.camSpec.nameFr,
    'Resistance globale calculee: ' + res.totalResistingForceDaN + ' daN (Exigence: ' + res.requiredClassForceDaN + ' daN)',
    'Poignee a cle: ' + (res.input.hasLockingHandleKey ? 'OUI (100 Nm)' : 'NON'),
    'Blindage anti-percage: ' + (res.input.hasAntiDrillPlate ? 'OUI' : 'NON'),
    '',
    '*3. VITRAGE DE SECURITE*',
    'Exigence NF EN 356: ' + res.classSpec.mandatoryGlazingEn356,
    'Statut vitrage: ' + res.glazingMatchVerdictFr,
    '',
    '*4. VERDICT TECHNIQUE*',
    'Statut: ' + res.verdictTitleFr,
    res.complianceDefectsFr.length > 0 ? 'Defauts: ' + res.complianceDefectsFr.join(' • ') : 'Tous criteres valides.',
    '----------------------------------------',
    'Genere automatiquement par Baiti Atelier Securite',
  ];

  return lines.join('\n');
}
