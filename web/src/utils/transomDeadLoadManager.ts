/**
 * Transom Dead Load Glass Weight & Setting Block Sizing Auditor
 * Normative references:
 * - NF DTU 39 P1-1: Travaux de vitrerie-miroiterie - Calage des vitrages (cales d assise et cales périphériques)
 * - NF EN 13830: Façades rideaux - Norme produit (Flèche sous poids propre f <= L/500 ou 3.0 mm)
 * - CSTB Cahier 3220: Spécifications techniques des cales en élastomère et drainage de feuillure
 * - NF EN 1999-1-1 (Eurocode 9): Calcul des structures en alliage d aluminium
 */

export type TransomProfileModelType =
  | 'transom_50_standard'
  | 'transom_50_80_reinforced'
  | 'transom_cw_50_120_curtain'
  | 'transom_cw_50_150_monumental';

export type SettingBlockMaterialType =
  | 'epdm_dense_80sh'
  | 'silicone_structural_75sh'
  | 'neoprene_industrial_85sh';

export interface TransomProfileSpec {
  id: TransomProfileModelType;
  labelFr: string;
  depthMm: number;
  widthMm: number;
  momentOfInertiaIyCm4: number; // Inertia on vertical weak axis taking gravity dead load
  momentOfInertiaIxCm4: number; // Inertia on horizontal strong axis taking wind pressure
  massPerMeterKg: number;
  description: string;
}

export interface SettingBlockMaterialSpec {
  id: SettingBlockMaterialType;
  labelFr: string;
  hardnessShoreA: number;
  maxAllowablePressureMpa: number;
  temperatureRangeFr: string;
  description: string;
}

export const TRANSOM_PROFILE_SPECS: Record<TransomProfileModelType, TransomProfileSpec> = {
  transom_50_standard: {
    id: 'transom_50_standard',
    labelFr: 'Traverse 50 mm Standard (Fenêtre / Imposte)',
    depthMm: 50,
    widthMm: 50,
    momentOfInertiaIyCm4: 6.8,
    momentOfInertiaIxCm4: 12.4,
    massPerMeterKg: 1.85,
    description: 'Profilé économique pour châssis composés de taille modérée et double vitrage standard.',
  },
  transom_50_80_reinforced: {
    id: 'transom_50_80_reinforced',
    labelFr: 'Traverse 50x80 mm Renforcée (Grande Portée)',
    depthMm: 80,
    widthMm: 50,
    momentOfInertiaIyCm4: 15.2,
    momentOfInertiaIxCm4: 42.0,
    massPerMeterKg: 2.75,
    description: 'Traverse intermédiaire renforcée pour vitrages isolants de grande largeur jusqu à 2.2 m.',
  },
  transom_cw_50_120_curtain: {
    id: 'transom_cw_50_120_curtain',
    labelFr: 'Traverse Mur-Rideau 50x120 mm (Grille VEC / VEP)',
    depthMm: 120,
    widthMm: 50,
    momentOfInertiaIyCm4: 38.6,
    momentOfInertiaIxCm4: 145.0,
    massPerMeterKg: 3.90,
    description: 'Conçue pour façades rideaux tertiaires avec reprise directe des charges par embouts de traverse.',
  },
  transom_cw_50_150_monumental: {
    id: 'transom_cw_50_150_monumental',
    labelFr: 'Traverse Monumentale 50x150 mm (Triple Vitrage Lourd)',
    depthMm: 150,
    widthMm: 50,
    momentOfInertiaIyCm4: 74.5,
    momentOfInertiaIxCm4: 285.0,
    massPerMeterKg: 5.10,
    description: 'Forte inertie sous gravité pour baies monumentales et vitrages feuilletés acoustiques lourds.',
  },
};

export const SETTING_BLOCK_SPECS: Record<SettingBlockMaterialType, SettingBlockMaterialSpec> = {
  epdm_dense_80sh: {
    id: 'epdm_dense_80sh',
    labelFr: 'EPDM Dense Vulcanisé 80 Shore A',
    hardnessShoreA: 80,
    maxAllowablePressureMpa: 4.0,
    temperatureRangeFr: '-35°C à +100°C',
    description: 'Élastomère standard NF DTU 39 imputrescible avec canaux de drainage intégrés.',
  },
  silicone_structural_75sh: {
    id: 'silicone_structural_75sh',
    labelFr: 'Silicone Haute Densité 75 Shore A',
    hardnessShoreA: 75,
    maxAllowablePressureMpa: 3.5,
    temperatureRangeFr: '-50°C à +150°C',
    description: 'Parfaite neutralité chimique avec les mastics de scellement VEC et films PVB/SGP.',
  },
  neoprene_industrial_85sh: {
    id: 'neoprene_industrial_85sh',
    labelFr: 'Néoprène Compact 85 Shore A Renforcé',
    hardnessShoreA: 85,
    maxAllowablePressureMpa: 5.0,
    temperatureRangeFr: '-30°C à +90°C',
    description: 'Très haute résistance à l écrasement pour vitrages très épais ou triple vitrage.',
  },
};

export interface TransomDeadLoadInput {
  transomLengthMm: number; // Width of opening between upright mullions
  glassHeightMm: number; // Height of glass pane resting on this transom
  glassThicknessMm: number; // Sum of glass panes thickness in mm (e.g. 8 for 4/16/4, 16 for 44.2/12/44.2)
  transomProfileModel: TransomProfileModelType;
  settingBlockDistanceMm: number; // Distance from mullion to block (typically L/10 or 100-200mm)
  settingBlockLengthMm: number; // Length of each setting block (min 100mm per DTU 39)
  settingBlockMaterial: SettingBlockMaterialType;
  hasAntiTorsionBracket: boolean; // Anti-torsion supporting bracket for wide glass
  wilayaName: string;
  clientName?: string;
  projectReference?: string;
}

export interface TransomDeadLoadAuditResult {
  // Mass & Load Breakdowns
  glassAreaM2: number;
  glassWeightKg: number;
  glassWeightN: number;
  loadPerSettingBlockKg: number;
  loadPerSettingBlockN: number;

  // Deflection Calculations (NF EN 13830)
  deflectionActualMm: number;
  deflectionLimitStandardMm: number; // L / 500
  deflectionLimitAbsoluteMm: number; // 3.0 mm
  deflectionLimitEffectiveMm: number; // min(L / 500, 3.0 mm)
  deflectionRatioPercent: number; // (actual / limit) * 100
  isDeflectionCompliant: boolean;

  // Setting Block Verification (NF DTU 39 P1-1)
  contactAreaPerBlockMm2: number;
  contactPressureMpa: number;
  maxAllowablePressureMpa: number;
  isPressureCompliant: boolean;
  minRecommendedBlockLengthMm: number;
  isBlockLengthCompliant: boolean;

  // Torsion & Glazing Drainage
  glassCenterEccentricityMm: number;
  torsionMomentNm: number;
  isAntiTorsionRequired: boolean;
  clearanceRebateMm: number; // Bottom edge clearance (typically 5 mm)

  // Global Status & Actionable Recommendations
  overallStatus: 'valid' | 'warning' | 'critical';
  recommendationsFr: string[];
}

export function computeTransomDeadLoadAudit(input: TransomDeadLoadInput): TransomDeadLoadAuditResult {
  const lengthM = input.transomLengthMm / 1000;
  const heightM = input.glassHeightMm / 1000;
  const glassAreaM2 = parseFloat((lengthM * heightM).toFixed(3));

  // Glass weight: 2.5 kg/m2 per mm of glass thickness
  const glassWeightKg = Math.round(glassAreaM2 * input.glassThicknessMm * 2.5 * 10) / 10;
  const glassWeightN = parseFloat((glassWeightKg * 9.81).toFixed(1));

  // 2 setting blocks per pane
  const loadPerSettingBlockKg = parseFloat((glassWeightKg / 2).toFixed(1));
  const loadPerSettingBlockN = parseFloat((glassWeightN / 2).toFixed(1));

  // Profile specs
  const profile = TRANSOM_PROFILE_SPECS[input.transomProfileModel];
  const blockSpec = SETTING_BLOCK_SPECS[input.settingBlockMaterial];

  // Young Modulus Aluminum E = 70 000 MPa = 70 x 10^9 N/m2
  const E_PA = 70e9;
  // Iy in m4 (1 cm4 = 1e-8 m4)
  const Iy_M4 = profile.momentOfInertiaIyCm4 * 1e-8;

  // Distance of setting block from support in meters (a)
  const a_M = Math.min(lengthM / 2 - 0.05, Math.max(0.05, input.settingBlockDistanceMm / 1000));
  const L_M = lengthM;
  const P_N = loadPerSettingBlockN;

  // Mid-span deflection under two symmetrical point loads:
  // f = (P * a) / (24 * E * Iy) * (3 * L^2 - 4 * a^2)
  const numerator = P_N * a_M * (3 * Math.pow(L_M, 2) - 4 * Math.pow(a_M, 2));
  const denominator = 24 * E_PA * Iy_M4;
  const deflectionM = numerator / denominator;
  const deflectionActualMm = parseFloat((deflectionM * 1000).toFixed(2));

  // NF EN 13830 Deflection limits:
  // f <= L / 500 and f <= 3.0 mm
  const deflectionLimitStandardMm = parseFloat(((input.transomLengthMm / 500)).toFixed(2));
  const deflectionLimitAbsoluteMm = 3.0;
  const deflectionLimitEffectiveMm = Math.min(deflectionLimitStandardMm, deflectionLimitAbsoluteMm);

  const deflectionRatioPercent = Math.round((deflectionActualMm / deflectionLimitEffectiveMm) * 100);
  const isDeflectionCompliant = deflectionActualMm <= deflectionLimitEffectiveMm;

  // Setting block contact pressure check (NF DTU 39)
  // Contact area = length of block * total glass thickness
  const contactAreaPerBlockMm2 = input.settingBlockLengthMm * input.glassThicknessMm;
  const contactPressureMpa = parseFloat((loadPerSettingBlockN / contactAreaPerBlockMm2).toFixed(2));
  const maxAllowablePressureMpa = blockSpec.maxAllowablePressureMpa;
  const isPressureCompliant = contactPressureMpa <= maxAllowablePressureMpa;

  // DTU 39 Rule: Minimum length of setting block is 100 mm, or 2 mm per kg of glass
  // L_min = max(100 mm, (glassWeightKg / 2) * 1.5)
  const minRecommendedBlockLengthMm = Math.max(100, Math.round(loadPerSettingBlockKg * 1.2));
  const isBlockLengthCompliant = input.settingBlockLengthMm >= minRecommendedBlockLengthMm;

  // Torsion from glazing eccentricity
  // Glass is set into the glazing pocket, with typical eccentricity e = depth / 3
  const glassCenterEccentricityMm = Math.round(profile.depthMm * 0.30);
  const torsionMomentNm = parseFloat(
    ((glassWeightN * (glassCenterEccentricityMm / 1000))).toFixed(1)
  );
  // Anti-torsion bracket required if glass weight > 80 kg or glass depth > 24 mm
  const isAntiTorsionRequired = glassWeightKg > 80 || input.glassThicknessMm >= 16;
  const clearanceRebateMm = 5; // Standard DTU 39 nominal drainage clearance

  // Diagnostics and recommendations
  const recommendationsFr: string[] = [];

  if (!isDeflectionCompliant) {
    recommendationsFr.push(
      `Flèche de traverse excessive (${deflectionActualMm} mm > limite ${deflectionLimitEffectiveMm} mm NF EN 13830). Risque d écrasement de la cale d assise et de descellement du vitrage. Passez sur le profilé 50x80 mm renforcé ou 50x120 mm.`
    );
  }
  if (!isPressureCompliant) {
    recommendationsFr.push(
      `Pression de contact trop forte sur la cale (${contactPressureMpa} MPa > limite ${maxAllowablePressureMpa} MPa). Augmentez la longueur de la cale ou choisissez un néoprène 85 Shore A.`
    );
  }
  if (!isBlockLengthCompliant) {
    recommendationsFr.push(
      `Longueur de cale insuffisante (${input.settingBlockLengthMm} mm < minimum recommandé ${minRecommendedBlockLengthMm} mm DTU 39). Allongez la cale pour mieux répartir le poids du vitrage.`
    );
  }
  if (isAntiTorsionRequired && !input.hasAntiTorsionBracket) {
    recommendationsFr.push(
      `Vitrage lourd (${glassWeightKg} kg) générant un couple de basculement de ${torsionMomentNm} N.m. Installez obligatoirement des étriers anti-torsion sous les cales pour éviter le vrillage de la traverse.`
    );
  }
  if (input.settingBlockDistanceMm < 60) {
    recommendationsFr.push(
      'Cales d assise trop proches des montants (< 60 mm). Risque de pincement d angle du vitrage feuilleté. Réglez la distance à L/10 (environ 150 mm).'
    );
  }
  if (recommendationsFr.length === 0) {
    recommendationsFr.push(
      'Calage d assise et rigidité de traverse parfaitement conformes. Flèche minimale préservant la lame d air scellée et drainage de feuillure optimal.'
    );
  }

  let overallStatus: 'valid' | 'warning' | 'critical' = 'valid';
  if (!isDeflectionCompliant || !isPressureCompliant) {
    overallStatus = 'critical';
  } else if (!isBlockLengthCompliant || (isAntiTorsionRequired && !input.hasAntiTorsionBracket) || deflectionRatioPercent > 80) {
    overallStatus = 'warning';
  }

  return {
    glassAreaM2,
    glassWeightKg,
    glassWeightN,
    loadPerSettingBlockKg,
    loadPerSettingBlockN,
    deflectionActualMm,
    deflectionLimitStandardMm,
    deflectionLimitAbsoluteMm,
    deflectionLimitEffectiveMm,
    deflectionRatioPercent,
    isDeflectionCompliant,
    contactAreaPerBlockMm2,
    contactPressureMpa,
    maxAllowablePressureMpa,
    isPressureCompliant,
    minRecommendedBlockLengthMm,
    isBlockLengthCompliant,
    glassCenterEccentricityMm,
    torsionMomentNm,
    isAntiTorsionRequired,
    clearanceRebateMm,
    overallStatus,
    recommendationsFr,
  };
}
