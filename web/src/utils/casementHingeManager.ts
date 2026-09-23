/**
 * Heavy Casement & Tilt-Turn Window Hinge Load, Diagonal Glazing Racking & Sagging Auditor
 * Normative references:
 * - NF EN 13126-8: Quincaillerie pour le bâtiment - Ferrures oscillo-battantes, battantes et soufflets
 * - NF EN 1191: Fenêtres et portes - Résistance aux manœuvres répétées (Classes 15 000 et 25 000 cycles)
 * - NF DTU 39 P1-1: Travaux de vitrerie-miroiterie - Calage d équerrage des châssis ouvrants (Section 6.5)
 * - NF DTU 36.5 P1-1: Mise en œuvre des fenêtres et portes-extérieures
 * - CSTB e-Cahier 3698: Fenêtres aluminium à rupture de pont thermique - Résistance mécanique des ferrures
 */

export type HingeModelType =
  | 'standard_tilt_turn_80kg'
  | 'heavy_tilt_turn_100kg'
  | 'reinforced_tilt_turn_130kg'
  | 'monumental_tilt_turn_160kg'
  | 'heavy_duty_casement_200kg';

export type GlassBracingMethodType =
  | 'triangulated_dtu39'
  | 'perimeter_unbraced'
  | 'structural_bonding';

export interface HingeModelSpec {
  id: HingeModelType;
  labelFr: string;
  maxRatedSashWeightKg: number;
  maxAllowableStayTensileForceN: number;
  maxAllowablePivotResultantLoadN: number;
  testedEnduranceCycles: number; // NF EN 1191 cycles
  heightAdjustmentMm: number; // +/- range
  lateralAdjustmentMm: number;
  compressionAdjustmentMm: number;
  recommendedApplicationFr: string;
  description: string;
}

export interface GlazingSpecDetail {
  totalThicknessMm: number;
  glassThicknessMm: number; // sum of glass sheets only
  labelFr: string;
}

export const GLAZING_WEIGHT_CATALOG: Record<string, GlazingSpecDetail> = {
  double_4_16_4: { totalThicknessMm: 24, glassThicknessMm: 8, labelFr: 'Double Vitrage 4/16/4 Clair (20 kg/m²)' },
  double_6_16_6: { totalThicknessMm: 28, glassThicknessMm: 12, labelFr: 'Double Vitrage 6/16/6 Lourd (30 kg/m²)' },
  acoustic_44_2_12_4: { totalThicknessMm: 24, glassThicknessMm: 12, labelFr: 'Feuilleté Silence 44.2/12/4 (30.8 kg/m²)' },
  triple_4_12_4_12_4: { totalThicknessMm: 36, glassThicknessMm: 12, labelFr: 'Triple Vitrage 4/12/4/12/4 (30 kg/m²)' },
  security_66_2_16_6: { totalThicknessMm: 34, glassThicknessMm: 18, labelFr: 'Blindé Sécurité 66.2/16/6 (46.5 kg/m²)' },
};

export const HINGE_MODEL_SPECS: Record<HingeModelType, HingeModelSpec> = {
  standard_tilt_turn_80kg: {
    id: 'standard_tilt_turn_80kg',
    labelFr: 'Ferrure Oscillo-Battante Standard 80 kg',
    maxRatedSashWeightKg: 80,
    maxAllowableStayTensileForceN: 480,
    maxAllowablePivotResultantLoadN: 950,
    testedEnduranceCycles: 15000,
    heightAdjustmentMm: 2.0,
    lateralAdjustmentMm: 1.5,
    compressionAdjustmentMm: 0.8,
    recommendedApplicationFr: 'Châssis 1 vantail de dimensions modérées avec double vitrage 4/16/4.',
    description: 'Ferrure économique standard pour fenêtres résidentielles courantes.',
  },
  heavy_tilt_turn_100kg: {
    id: 'heavy_tilt_turn_100kg',
    labelFr: 'Ferrure Oscillo-Battante Renforcée 100 kg',
    maxRatedSashWeightKg: 100,
    maxAllowableStayTensileForceN: 650,
    maxAllowablePivotResultantLoadN: 1250,
    testedEnduranceCycles: 20000,
    heightAdjustmentMm: 2.5,
    lateralAdjustmentMm: 2.0,
    compressionAdjustmentMm: 1.0,
    recommendedApplicationFr: 'Fenêtres 1 et 2 vantaux équipées de vitrages acoustiques ou retardateurs d effraction.',
    description: 'Palier d angle et compas forgés en acier traité avec douilles en polyamide autolubrifiantes.',
  },
  reinforced_tilt_turn_130kg: {
    id: 'reinforced_tilt_turn_130kg',
    labelFr: 'Ferrure OB Haute Performance 130 kg (Grand Format)',
    maxRatedSashWeightKg: 130,
    maxAllowableStayTensileForceN: 900,
    maxAllowablePivotResultantLoadN: 1650,
    testedEnduranceCycles: 25000,
    heightAdjustmentMm: 3.0,
    lateralAdjustmentMm: 2.5,
    compressionAdjustmentMm: 1.2,
    recommendedApplicationFr: 'Portes-fenêtres de balcon et baies de hauteur jusqu à 2.4 m avec vitrage phonique lourd.',
    description: 'Charnière d angle haute résistance à axe traversant trempé et compas à double bras articulé.',
  },
  monumental_tilt_turn_160kg: {
    id: 'monumental_tilt_turn_160kg',
    labelFr: 'Ferrure Monumentale 160 kg (Triple Vitrage)',
    maxRatedSashWeightKg: 160,
    maxAllowableStayTensileForceN: 1150,
    maxAllowablePivotResultantLoadN: 2100,
    testedEnduranceCycles: 25000,
    heightAdjustmentMm: 3.5,
    lateralAdjustmentMm: 3.0,
    compressionAdjustmentMm: 1.5,
    recommendedApplicationFr: 'Ouvrages d architecture tertiaires, triple vitrage de sécurité ou baies très larges.',
    description: 'Paumelles en acier inoxydable massif AISI 304 avec roulements axiaux à aiguilles étanches.',
  },
  heavy_duty_casement_200kg: {
    id: 'heavy_duty_casement_200kg',
    labelFr: 'Paumelles Lourdes à Clamer 200 kg (Frappe Seule)',
    maxRatedSashWeightKg: 200,
    maxAllowableStayTensileForceN: 1450,
    maxAllowablePivotResultantLoadN: 2600,
    testedEnduranceCycles: 50000,
    heightAdjustmentMm: 4.0,
    lateralAdjustmentMm: 2.5,
    compressionAdjustmentMm: 1.5,
    recommendedApplicationFr: 'Portes lourdes de grand passage, ouvrants battants monumentaux et vitrages blindés.',
    description: 'Corps en profil aluminium extrudé avec contre-plaques de serrage en acier inoxydable.',
  },
};

export interface CasementHingeInput {
  sashWidthMm: number;
  sashHeightMm: number;
  glazingKey: string; // key in GLAZING_WEIGHT_CATALOG
  hingeModel: HingeModelType;
  bracingMethod: GlassBracingMethodType;
  aluminumProfileWeightKgPerM?: number; // default ~2.2 kg/m for sash profile
  hardwareWeightKg?: number; // default ~3.5 kg
  openingCycleDailyFrequency?: number; // default 10 cycles/day
  wilayaName?: string;
  clientName?: string;
  projectReference?: string;
}

export interface SettingBlockLocation {
  id: string;
  roleFr: string;
  posX: 'corner_hinge_bottom' | 'corner_stay_top' | 'lateral_lock_top' | 'lateral_hinge_bottom';
  description: string;
  mandatoryByDtu39: boolean;
}

export interface CasementHingeResult {
  sashWidthMm: number;
  sashHeightMm: number;
  aspectRatioWidthToHeight: number;
  glassSurfaceM2: number;
  glassMassKg: number;
  frameAluminumMassKg: number;
  hardwareMassKg: number;
  totalSashMassKg: number;
  hingeRatedCapacityKg: number;
  capacityUtilizationPercent: number;
  capacityStatus: 'optimal' | 'acceptable' | 'overloaded';
  topStayTensileForceN: number;
  maxAllowableStayForceN: number;
  staySafetyFactor: number;
  bottomPivotVerticalForceN: number;
  bottomPivotResultantForceN: number;
  maxAllowablePivotLoadN: number;
  pivotSafetyFactor: number;
  estimatedDiagonalDroopMm: number;
  maxAllowableDroopMm: number;
  isSaggingAcceptable: boolean;
  adjustmentMarginHeightMm: number;
  dtu39CalageCompliant: boolean;
  selectedHinge: HingeModelSpec;
  settingBlocksList: SettingBlockLocation[];
  auditWarnings: string[];
  auditRecommendations: string[];
  billOfMaterials: {
    hingeKitDesignation: string;
    settingBlocksCount: number;
    recommendedAdjustmentKey: string;
    maintenanceScheduleFr: string;
  };
}

export function calculateCasementHingeAudit(input: CasementHingeInput): CasementHingeResult {
  const widthM = Math.max(0.4, input.sashWidthMm / 1000);
  const heightM = Math.max(0.4, input.sashHeightMm / 1000);
  const glassSurfaceM2 = Number((widthM * heightM).toFixed(2));
  const aspectRatioWidthToHeight = Number((widthM / heightM).toFixed(2));

  // Glazing specifications & mass
  const glazing = GLAZING_WEIGHT_CATALOG[input.glazingKey] || GLAZING_WEIGHT_CATALOG['double_4_16_4'];
  const glassDensityKgM2PerMm = 2.5; // Flat float glass standard density
  const glassMassKg = Number((glassSurfaceM2 * glazing.glassThicknessMm * glassDensityKgM2PerMm).toFixed(1));

  // Aluminum perimeter & hardware mass
  const sashPerimeterM = 2 * (widthM + heightM);
  const profileLinearKg = input.aluminumProfileWeightKgPerM ?? 2.2;
  const frameAluminumMassKg = Number((sashPerimeterM * profileLinearKg).toFixed(1));
  const hardwareMassKg = input.hardwareWeightKg ?? (input.sashHeightMm > 1800 ? 4.5 : 3.2);

  const totalSashMassKg = Number((glassMassKg + frameAluminumMassKg + hardwareMassKg).toFixed(1));

  // Hinge capacity verification
  const hinge = HINGE_MODEL_SPECS[input.hingeModel];
  const capacityUtilizationPercent = Number(((totalSashMassKg / hinge.maxRatedSashWeightKg) * 100).toFixed(1));

  let capacityStatus: 'optimal' | 'acceptable' | 'overloaded' = 'optimal';
  if (capacityUtilizationPercent > 100.0) {
    capacityStatus = 'overloaded';
  } else if (capacityUtilizationPercent > 80.0) {
    capacityStatus = 'acceptable';
  }

  // Statics & Reaction Forces
  // Gravity constant g = 9.81 m/s2
  const g = 9.81;
  const gravityForceN = totalSashMassKg * g;

  // Effective vertical distance between top stay arm anchor and bottom pivot bearing
  const effectiveHingeSpanM = Math.max(0.3, heightM - 0.12);

  // Horizontal tension pullout on top stay arm (compas):
  // Moment about bottom pivot: M = Gravity * (Width / 2) = F_stay * H_span
  const rawStayForceN = (gravityForceN * (widthM / 2)) / effectiveHingeSpanM;
  const topStayTensileForceN = Number(rawStayForceN.toFixed(0));
  const staySafetyFactor = Number((hinge.maxAllowableStayTensileForceN / topStayTensileForceN).toFixed(2));

  // Bottom corner pivot bearing loads
  const bottomPivotVerticalForceN = Number(gravityForceN.toFixed(0));
  // Resultant load on bottom pivot combining vertical gravity and horizontal stay reaction
  const bottomPivotResultantForceN = Number(
    Math.sqrt(Math.pow(bottomPivotVerticalForceN, 2) + Math.pow(topStayTensileForceN, 2)).toFixed(0)
  );
  const pivotSafetyFactor = Number((hinge.maxAllowablePivotResultantLoadN / bottomPivotResultantForceN).toFixed(2));

  // Diagonal sash droop / sagging mechanics (Affaissement d angle opposé)
  // Glazing acts as structural diaphragm when triangulated according to NF DTU 39
  let glassShearBracingEfficiency = 0.78; // Triangulated setting blocks transfer 78% of shear directly into glass
  if (input.bracingMethod === 'perimeter_unbraced') {
    glassShearBracingEfficiency = 0.15; // Bare aluminum corner cleats deflect under gravity racking
  } else if (input.bracingMethod === 'structural_bonding') {
    glassShearBracingEfficiency = 0.92;
  }

  // Base cantilever droop on unbraced aluminum frame (approx 3.2 mm for 1.2x1.4m @ 60kg)
  const baseDeflectionMm = (gravityForceN / 500) * Math.pow(widthM, 2) * 1.8;
  const estimatedDiagonalDroopMm = Number(Math.max(0.4, baseDeflectionMm * (1 - glassShearBracingEfficiency)).toFixed(2));
  const maxAllowableDroopMm = 1.50; // CSTB limit to prevent sash rubbing against bottom rebate
  const isSaggingAcceptable = estimatedDiagonalDroopMm <= maxAllowableDroopMm;

  const dtu39CalageCompliant = input.bracingMethod === 'triangulated_dtu39' || input.bracingMethod === 'structural_bonding';

  // Setting blocks list per DTU 39
  const settingBlocksList: SettingBlockLocation[] = [
    {
      id: 'block_pivot_bottom',
      roleFr: 'Cale d assise principale inférieure (côté paumelle basse)',
      posX: 'corner_hinge_bottom',
      description: 'Supporte le poids mort du vitrage et transmet la charge directement au pivot bas.',
      mandatoryByDtu39: true,
    },
    {
      id: 'block_stay_top',
      roleFr: 'Cale d équerrage supérieure (côté compas opposé)',
      posX: 'corner_stay_top',
      description: 'Bloque l affaissement de l angle haut opposé et met le vitrage en compression diagonale.',
      mandatoryByDtu39: true,
    },
    {
      id: 'block_lock_lateral',
      roleFr: 'Cale de maintien latéral (côté poignée haut)',
      posX: 'lateral_lock_top',
      description: 'Empêche la translation du double vitrage vers la gâche de fermeture.',
      mandatoryByDtu39: true,
    },
    {
      id: 'block_hinge_lateral',
      roleFr: 'Cale de maintien latéral (côté paumelle bas)',
      posX: 'lateral_hinge_bottom',
      description: 'Verrouille la triangulation de base contre le montant de rotation.',
      mandatoryByDtu39: true,
    },
  ];

  // Warnings and recommendations
  const auditWarnings: string[] = [];
  const auditRecommendations: string[] = [];

  if (capacityStatus === 'overloaded') {
    auditWarnings.push(`Poids de l ouvrant (${totalSashMassKg} kg) supérieur à la capacité nominale de la ferrure (${hinge.maxRatedSashWeightKg} kg).`);
    auditRecommendations.push(`Monter en gamme sur une ferrure renforcée (modèle ${totalSashMassKg > 130 ? '160 kg' : '130 kg'}).`);
  } else if (capacityStatus === 'acceptable') {
    auditWarnings.push(`Utilisation élevée de la ferrure (${capacityUtilizationPercent}%). Marge réduite pour l endurance cyclique.`);
    auditRecommendations.push('Une ferrure de capacité immédiatement supérieure offrira une durabilité de 25 000 cycles sans déréglage.');
  }

  if (aspectRatioWidthToHeight > 1.25) {
    auditWarnings.push(`Ratio largeur/hauteur élevé (${aspectRatioWidthToHeight}). L effet de levier amplifie fortement la traction sur le compas.`);
    auditRecommendations.push('Vérifier que la ferrure intègre un anti-fausse manœuvre et un compas à frein d ouverture.');
  }

  if (staySafetyFactor < 1.15) {
    auditWarnings.push(`Effort de traction sur le compas (${topStayTensileForceN} N) proche de la limite admissible (${hinge.maxAllowableStayTensileForceN} N).`);
    auditRecommendations.push('Adopter un compas renforcé avec axe d articulation en acier trempé.');
  }

  if (!dtu39CalageCompliant) {
    auditWarnings.push('Absence de calage d équerrage diagonal : affaissement calculé à ' + estimatedDiagonalDroopMm + ' mm (> 1.50 mm limite).');
    auditRecommendations.push('Appliquer impérativement le calage d équerrage diagonal NF DTU 39 pour utiliser le vitrage comme contreventement.');
  } else if (!isSaggingAcceptable) {
    auditWarnings.push(`Affaissement diagonal estimé à ${estimatedDiagonalDroopMm} mm (supérieur au jeu de feuillure standard).`);
    auditRecommendations.push('Pré-régler la vis de rehausse du pivot bas de +1.5 mm en atelier pour anticiper le tassement résiduel.');
  }

  return {
    sashWidthMm: input.sashWidthMm,
    sashHeightMm: input.sashHeightMm,
    aspectRatioWidthToHeight,
    glassSurfaceM2,
    glassMassKg,
    frameAluminumMassKg,
    hardwareMassKg,
    totalSashMassKg,
    hingeRatedCapacityKg: hinge.maxRatedSashWeightKg,
    capacityUtilizationPercent,
    capacityStatus,
    topStayTensileForceN,
    maxAllowableStayForceN: hinge.maxAllowableStayTensileForceN,
    staySafetyFactor,
    bottomPivotVerticalForceN,
    bottomPivotResultantForceN,
    maxAllowablePivotLoadN: hinge.maxAllowablePivotResultantLoadN,
    pivotSafetyFactor,
    estimatedDiagonalDroopMm,
    maxAllowableDroopMm,
    isSaggingAcceptable,
    adjustmentMarginHeightMm: hinge.heightAdjustmentMm,
    dtu39CalageCompliant,
    selectedHinge: hinge,
    settingBlocksList,
    auditWarnings,
    auditRecommendations,
    billOfMaterials: {
      hingeKitDesignation: hinge.labelFr,
      settingBlocksCount: 6, // 2 assise + 2 équerrage + 2 latérales
      recommendedAdjustmentKey: 'Clé Allen six pans 4.0 mm et tournevis Torx T15',
      maintenanceScheduleFr: 'Lubrification annuelle des paliers avec graisse blanche au PTFE sans acide',
    },
  };
}
