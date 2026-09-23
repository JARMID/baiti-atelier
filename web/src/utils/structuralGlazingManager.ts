/**
 * Baiti Atelier - Structural Silicone Glazing (VEC / VEP) Joint Sizing & Stress Auditor
 * Normative references:
 * - NF DTU 39 P4: Travaux de vitrerie - Vitrage exterieur colle (VEC)
 * - EOTA ETAG 002: Guideline for European Technical Approval for Structural Sealant Glazing Kits (SSGK)
 * - ASTM C1401: Standard Guide for Structural Sealant Glazing
 * - CNERIB DTR BC 2-47 / RNV 2013: Regles Neige et Vent en Algerie (Pression dynamique de vent)
 *
 * Humanizer invariant: exactly 0 em dashes, 0 en dashes.
 */

export type VecGlazingSystemType =
  | 'vec_full_bonded_no_supports'
  | 'vec_supported_deadload_blocks'
  | 'vep_mechanically_pinched'
  | 'ssg_2_sided_structural'
  | 'ssg_4_sided_structural';

export interface VecSystemSpec {
  id: VecGlazingSystemType;
  nameFr: string;
  loadTransferMode: string;
  requiresMechanicalRetentionClips: boolean;
  permanentStaticStressLimitMpa: number; // 0.014 MPa typically under dead load
  dynamicWindStressLimitMpa: number; // 0.14 MPa dynamic
  descriptionFr: string;
}

export const VEC_SYSTEM_TYPES: Record<VecGlazingSystemType, VecSystemSpec> = {
  vec_supported_deadload_blocks: {
    id: 'vec_supported_deadload_blocks',
    nameFr: 'VEC 4 Côtés avec Cales d Appui de Poids Propre (Standard)',
    loadTransferMode: 'Le vent est repris par le silicone structural, le poids propre du vitrage repose sur cales mecaniques.',
    requiresMechanicalRetentionClips: true,
    permanentStaticStressLimitMpa: 0.014,
    dynamicWindStressLimitMpa: 0.14,
    descriptionFr: 'Configuration la plus fiable conforme au DTU 39 P4. Cales d appui inox supportant le double vitrage.',
  },
  vec_full_bonded_no_supports: {
    id: 'vec_full_bonded_no_supports',
    nameFr: 'VEC Collé Total sans Cales Porteuses (Collage Structural Total)',
    loadTransferMode: 'Le silicone structural reprend a la fois le vent en traction et le poids propre en cisaillement permanent.',
    requiresMechanicalRetentionClips: true,
    permanentStaticStressLimitMpa: 0.014,
    dynamicWindStressLimitMpa: 0.14,
    descriptionFr: 'Silicone bi-composant haute performance controle en laboratoire avec essais d adherence quotidiens.',
  },
  vep_mechanically_pinched: {
    id: 'vep_mechanically_pinched',
    nameFr: 'VEP Vitrage Extérieur Pincé (Bordures Pincées Discrètes)',
    loadTransferMode: 'Maintien mecanique ponctuel par pattes de pincement invisibles en fond de feuillure avec joint EPDM.',
    requiresMechanicalRetentionClips: false,
    permanentStaticStressLimitMpa: 0.020,
    dynamicWindStressLimitMpa: 0.18,
    descriptionFr: 'Combine l esthetique bord a bord avec securite mecanique positive sans dependance exclusive du mastic.',
  },
  ssg_2_sided_structural: {
    id: 'ssg_2_sided_structural',
    nameFr: 'SSG 2 Côtés (Collage Vertical + Capot Serreur Horizontal)',
    loadTransferMode: 'Montants verticaux en VEC lisse et traverses horizontales avec capot serreeur mecano-porteuse.',
    requiresMechanicalRetentionClips: false,
    permanentStaticStressLimitMpa: 0.014,
    dynamicWindStressLimitMpa: 0.14,
    descriptionFr: 'Architecture en trame horizontale avec lignes d ombre marquees et joints silicones continus verticaux.',
  },
  ssg_4_sided_structural: {
    id: 'ssg_4_sided_structural',
    nameFr: 'SSG 4 Côtés Façade Monumentale Cadres Préfabriqués',
    loadTransferMode: 'Elements de facade unises colles en atelier sur cadres alu anodises puis montes sur chantiers.',
    requiresMechanicalRetentionClips: true,
    permanentStaticStressLimitMpa: 0.014,
    dynamicWindStressLimitMpa: 0.14,
    descriptionFr: 'Cadres VEC rapportes sur ossature mur rideau par crochets et pattes de retenue mecanique de securite.',
  },
};

export type StructuralSealantBrand =
  | 'dow_silicone_993'
  | 'sika_silicon_sg_500'
  | 'tremco_proglaze_ii'
  | 'bostik_simson_ssg';

export interface SealantSpec {
  id: StructuralSealantBrand;
  nameFr: string;
  typeFr: string;
  dynamicDesignTensileStressMpa: number; // sigma_des (MPa = N/mm2)
  staticDesignShearStressMpa: number; // tau_des (MPa)
  allowableShearStrainPercent: number; // gamma_adm (%)
  curingTimeHours: number;
  descriptionFr: string;
}

export const STRUCTURAL_SEALANTS: Record<StructuralSealantBrand, SealantSpec> = {
  dow_silicone_993: {
    id: 'dow_silicone_993',
    nameFr: 'DOW Dowsil 993 Bi-Composant Gris/Noir',
    typeFr: 'Silicone neutre bi-composant a polymérisation rapide',
    dynamicDesignTensileStressMpa: 0.14,
    staticDesignShearStressMpa: 0.014,
    allowableShearStrainPercent: 15,
    curingTimeHours: 24,
    descriptionFr: 'Mastic de reference mondiale agree ETAG 002 classe 1 pour vitrages exterieurs colles en usine.',
  },
  sika_silicon_sg_500: {
    id: 'sika_silicon_sg_500',
    nameFr: 'Sikasil SG-500 Bi-Composant Haute Performance',
    typeFr: 'Mastic silicone structural bi-composant haut module',
    dynamicDesignTensileStressMpa: 0.14,
    staticDesignShearStressMpa: 0.014,
    allowableShearStrainPercent: 15,
    curingTimeHours: 24,
    descriptionFr: 'Haute resistance aux UV et a l ozone avec excellente adherence sur aluminium anodise et verre a couche.',
  },
  tremco_proglaze_ii: {
    id: 'tremco_proglaze_ii',
    nameFr: 'Tremco Proglaze II Structural Sealant',
    typeFr: 'Silicone bi-composant neutre haute adherence',
    dynamicDesignTensileStressMpa: 0.14,
    staticDesignShearStressMpa: 0.014,
    allowableShearStrainPercent: 15,
    curingTimeHours: 36,
    descriptionFr: 'Formulation stabilisee resistante aux conditions sahariennes et aux vents de sable violents.',
  },
  bostik_simson_ssg: {
    id: 'bostik_simson_ssg',
    nameFr: 'Bostik Simson SSG Mono-Composant Atelier',
    typeFr: 'Silicone mono-composant a vulcanisation avec l humidite de l air',
    dynamicDesignTensileStressMpa: 0.12,
    staticDesignShearStressMpa: 0.012,
    allowableShearStrainPercent: 12.5,
    curingTimeHours: 72,
    descriptionFr: 'Pour reparations et petites surfaces sans equipement de dosage bi-composant industriel.',
  },
};

export interface StructuralGlazingInput {
  widthMm: number;
  heightMm: number;
  windPressurePa: number; // Pression dynamique de vent de calcul q_w
  systemType: VecGlazingSystemType;
  sealantBrand: StructuralSealantBrand;
  totalGlassThicknessMm: number;
  extremeDeltaTempCelsius?: number; // Ecart thermique extreme, defaut 60 K
  wilayaName?: string;
  projectRef?: string;
}

export interface StructuralGlazingResult {
  input: StructuralGlazingInput;
  systemSpec: VecSystemSpec;
  sealantSpec: SealantSpec;

  // Geometry
  shortSideMm: number;
  longSideMm: number;
  panelAreaM2: number;
  perimeterMm: number;
  glassWeightKg: number;

  // Structural Bite (hc)
  calculatedBiteMm: number;
  minNormativeBiteMm: number;
  recommendedBiteMm: number;
  isBiteSufficient: boolean;

  // Glueline Thickness (e)
  calculatedDifferentialExpansionMm: number;
  calculatedGluelineThicknessMm: number;
  minNormativeGluelineThicknessMm: number;
  recommendedGluelineThicknessMm: number;

  // Joint Aspect Ratio
  jointAspectRatio: number;
  isAspectRatioFavorable: boolean;

  // Dead Load Stress Check (tau_dead)
  deadLoadStressMpa: number;
  allowableDeadLoadStressMpa: number;
  isDeadLoadStressSafe: boolean;

  // Material Consumption
  jointCrossSectionMm2: number;
  sealantVolumeLiters: number;
  sausage600mlPacksRequired: number;

  // Mechanical Safety Retention Clips
  safetyClipsRequired: boolean;
  minSafetyClipsCount: number;

  // Compliance Verdict
  overallVerdict: 'favorable' | 'warning' | 'critical';
  verdictTitleFr: string;
  verdictDetailsFr: string[];
  recommendationsFr: string[];
}

/**
 * Calculates structural silicone joint dimensions (bite and glueline thickness) and stresses according to ETAG 002 / ASTM C1401.
 */
export function calculateStructuralGlazing(input: StructuralGlazingInput): StructuralGlazingResult {
  const systemSpec = VEC_SYSTEM_TYPES[input.systemType];
  const sealantSpec = STRUCTURAL_SEALANTS[input.sealantBrand];

  const W = input.widthMm;
  const H = input.heightMm;
  const shortSideMm = Math.min(W, H);
  const longSideMm = Math.max(W, H);
  const panelAreaM2 = Math.round(((W * H) / 1_000_000) * 1000) / 1000;
  const perimeterMm = 2 * (W + H);

  // Glass Weight Calculation: Area * thickness * 2.5 kg/(m2.mm)
  const glassWeightKg = Math.round(panelAreaM2 * input.totalGlassThicknessMm * 2.5 * 10) / 10;

  // 1. Structural Bite Dimension (hc) under Wind Suction (ASTM C1401 / ETAG 002)
  // hc = (q_w * a) / (2 * sigma_des)
  // q_w in N/mm2 = Pa * 1e-6
  const windPressureNPerMm2 = input.windPressurePa * 1e-6;
  const sigmaDes = sealantSpec.dynamicDesignTensileStressMpa; // typically 0.14 N/mm2

  const rawCalculatedBite = (windPressureNPerMm2 * shortSideMm) / (2 * sigmaDes);
  const calculatedBiteMm = Math.round(rawCalculatedBite * 10) / 10;
  const minNormativeBiteMm = panelAreaM2 > 2.0 ? 8.0 : 6.0;
  const recommendedBiteMm = Math.max(Math.ceil(calculatedBiteMm), minNormativeBiteMm);
  const isBiteSufficient = recommendedBiteMm >= minNormativeBiteMm;

  // 2. Glueline Thickness (e) under Differential Thermal Expansion (ASTM C1401)
  // Delta L = (alpha_alu - alpha_glass) * Delta T * (Diagonal / 2)
  const alphaAlu = 24e-6; // 1/K
  const alphaGlass = 9e-6; // 1/K
  const deltaTempK = input.extremeDeltaTempCelsius || 60; // 60 K swing
  const diagonalMm = Math.sqrt(W * W + H * H);
  const calculatedDifferentialExpansionMm =
    Math.round((alphaAlu - alphaGlass) * deltaTempK * (diagonalMm / 2) * 100) / 100;

  // e = Delta L / gamma_adm
  const gammaAdm = sealantSpec.allowableShearStrainPercent / 100; // e.g. 0.15
  const rawGluelineThickness = calculatedDifferentialExpansionMm / gammaAdm;
  const calculatedGluelineThicknessMm = Math.round(rawGluelineThickness * 10) / 10;
  const minNormativeGluelineThicknessMm = 6.0;
  const recommendedGluelineThicknessMm = Math.max(
    Math.ceil(calculatedGluelineThicknessMm),
    minNormativeGluelineThicknessMm
  );

  // 3. Aspect Ratio check: hc / e should be between 1.0 and 3.0
  const jointAspectRatio = Math.round((recommendedBiteMm / recommendedGluelineThicknessMm) * 10) / 10;
  const isAspectRatioFavorable = jointAspectRatio >= 1.0 && jointAspectRatio <= 3.0;

  // 4. Dead Load Stress Check (tau_dead) under self-weight
  // If dead load is carried by silicone (collé total)
  let deadLoadStressMpa = 0;
  if (input.systemType === 'vec_full_bonded_no_supports') {
    const glassWeightN = glassWeightKg * 9.81;
    const bondedAreaMm2 = perimeterMm * recommendedBiteMm;
    deadLoadStressMpa = Math.round((glassWeightN / bondedAreaMm2) * 1000) / 1000;
  }
  const allowableDeadLoadStressMpa = sealantSpec.staticDesignShearStressMpa; // 0.014 MPa
  const isDeadLoadStressSafe =
    input.systemType !== 'vec_full_bonded_no_supports' ||
    deadLoadStressMpa <= allowableDeadLoadStressMpa;

  // 5. Sealant Volume & Cartridge Consumption
  const jointCrossSectionMm2 = recommendedBiteMm * recommendedGluelineThicknessMm;
  // Volume in Litres = Section * Perimeter * 1e-6
  const sealantVolumeLiters =
    Math.round(jointCrossSectionMm2 * perimeterMm * 1e-6 * 1.15 * 100) / 100; // 15% wastage
  const sausage600mlPacksRequired = Math.max(Math.ceil(sealantVolumeLiters / 0.6), 1);

  // 6. Mechanical Retention Clips (Sécurité anti-chute NF DTU 39 P4)
  const safetyClipsRequired = systemSpec.requiresMechanicalRetentionClips;
  // 1 clip every 600 mm on vertical sides, min 4 clips per panel
  const minSafetyClipsCount = safetyClipsRequired
    ? Math.max(2 * Math.ceil(H / 600), 4)
    : 0;

  // Verdict Determination
  let overallVerdict: 'favorable' | 'warning' | 'critical' = 'favorable';
  let verdictTitleFr = 'Conforme ETAG 002 et NF DTU 39 P4';
  const verdictDetailsFr: string[] = [];
  const recommendationsFr: string[] = [];

  verdictDetailsFr.push(
    'Bite structural (hauteur de contact hc) : ' +
      recommendedBiteMm +
      ' mm (Calcul dynamique : ' +
      calculatedBiteMm +
      ' mm sous ' +
      input.windPressurePa +
      ' Pa).'
  );

  verdictDetailsFr.push(
    'Epaisseur de joint silicone (e) : ' +
      recommendedGluelineThicknessMm +
      ' mm (Dilatation différentielle Delta L = ' +
      calculatedDifferentialExpansionMm +
      ' mm sous Delta T = ' +
      deltaTempK +
      ' K).'
  );

  verdictDetailsFr.push(
    'Ratio géométrique hc / e = ' +
      jointAspectRatio +
      ' (Plage admissible recommandée : 1.0 à 3.0).'
  );

  if (!isAspectRatioFavorable) {
    overallVerdict = 'warning';
    verdictTitleFr = 'Attention: Ratio de Joint Silicone en Limite Normative';
    recommendationsFr.push(
      'Le ratio hc / e (' +
        jointAspectRatio +
        ') sort de la plage optimale [1.0 - 3.0]. Ajuster l epaisseur du fond de joint pour ameliorer la polymerisation a coeur.'
    );
  }

  if (!isDeadLoadStressSafe) {
    overallVerdict = 'critical';
    verdictTitleFr = 'Non Conforme: Contrainte Permanente de Poids Propre Dépassée';
    verdictDetailsFr.push(
      'Contrainte de cisaillement permanente sous poids propre (' +
        deadLoadStressMpa +
        ' MPa) supérieure au plafond ETAG 002 (' +
        allowableDeadLoadStressMpa +
        ' MPa).'
    );
    recommendationsFr.push(
      'Passer imperativement a un systeme VEC avec cales d appui mecaniques de poids propre.'
    );
  }

  if (safetyClipsRequired) {
    verdictDetailsFr.push(
      'Pattes de retenue mecanique de securite : ' +
        minSafetyClipsCount +
        ' cales de securite anti-chute requises sur les rives laterales.'
    );
    recommendationsFr.push(
      'Poser au minimum ' +
        minSafetyClipsCount +
        ' pattes de securite inox en U engagees dans la rainure du profil d ouvrant.'
    );
  }

  recommendationsFr.push(
    'Degraissage imperatif des surfaces d adherence a l alcool isopropylique suivi de l application du primaire d adherence certifie.'
  );
  recommendationsFr.push(
    'Conserver des eprouvettes en H de chaque lot de mastic pour essai de pelage a 90 degres et controle de rupture cohesive.'
  );

  return {
    input,
    systemSpec,
    sealantSpec,
    shortSideMm,
    longSideMm,
    panelAreaM2,
    perimeterMm,
    glassWeightKg,
    calculatedBiteMm,
    minNormativeBiteMm,
    recommendedBiteMm,
    isBiteSufficient,
    calculatedDifferentialExpansionMm,
    calculatedGluelineThicknessMm,
    minNormativeGluelineThicknessMm,
    recommendedGluelineThicknessMm,
    jointAspectRatio,
    isAspectRatioFavorable,
    deadLoadStressMpa,
    allowableDeadLoadStressMpa,
    isDeadLoadStressSafe,
    jointCrossSectionMm2,
    sealantVolumeLiters,
    sausage600mlPacksRequired,
    safetyClipsRequired,
    minSafetyClipsCount,
    overallVerdict,
    verdictTitleFr,
    verdictDetailsFr,
    recommendationsFr,
  };
}

/**
 * Formats WhatsApp technical dispatch for facade engineers, quality controllers, and installation teams.
 */
export function formatStructuralGlazingWhatsApp(
  res: StructuralGlazingResult,
  clientName: string,
  projectRef: string
): string {
  const lines: string[] = [
    '*BAITI ATELIER - NOTE TECHNIQUE VITRAGE VEC / VEP*',
    'Ref: ' + projectRef + ' | Client: ' + clientName,
    'Normes: NF DTU 39 P4 / EOTA ETAG 002 / ASTM C1401',
    '----------------------------------------',
    '*1. GEOMETRIE ET VITRAGE*',
    'Dimensions: ' + res.input.widthMm + ' x ' + res.input.heightMm + ' mm',
    'Surface du panneau: ' + res.panelAreaM2.toFixed(3) + ' m2',
    'Poids propre du verre: ' + res.glassWeightKg + ' kg (Epaisseur: ' + res.input.totalGlassThicknessMm + ' mm)',
    'Systeme VEC: ' + res.systemSpec.nameFr,
    'Mastic structural: ' + res.sealantSpec.nameFr,
    '',
    '*2. DIMENSIONNEMENT DU JOINT SILICONE*',
    'Pression de vent de calcul: ' + res.input.windPressurePa + ' Pa',
    'Bite structural recommande (hc): ' + res.recommendedBiteMm + ' mm (Min norme: ' + res.minNormativeBiteMm + ' mm)',
    'Epaisseur de joint (e): ' + res.recommendedGluelineThicknessMm + ' mm (Dilatation Delta L: ' + res.calculatedDifferentialExpansionMm + ' mm)',
    'Ratio de joint hc / e: ' + res.jointAspectRatio + ' (Optimal: 1.0 a 3.0)',
    'Consommation: ' + res.sealantVolumeLiters + ' L (' + res.sausage600mlPacksRequired + ' poches de 600 ml)',
    '',
    '*3. SECURITE ET PATTES ANTI-CHUTE*',
    'Cales de retenue mecanique: ' + (res.safetyClipsRequired ? res.minSafetyClipsCount + ' pattes inox' : 'Non requises'),
    'Contrainte poids propre: ' + res.deadLoadStressMpa + ' MPa (Seuil max: ' + res.allowableDeadLoadStressMpa + ' MPa)',
    '',
    '*4. VERDICT TECHNIQUE*',
    'Statut: ' + res.verdictTitleFr,
    res.recommendationsFr.length > 0 ? 'Prescription: ' + res.recommendationsFr[0] : '',
    '----------------------------------------',
    'Genere automatiquement par Baiti Atelier Facades VEC',
  ];

  return lines.join('\n');
}
