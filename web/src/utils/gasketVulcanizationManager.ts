/**
 * Aluminum Window and Door Gasket Corner Vulcanization, AEV Tightness and Compression Set Auditor
 * Normative references:
 * - NF EN 12365-1 to 4: Profilés d étanchéité pour portes, fenêtres, fermetures et façades rideaux
 * - NF DTU 36.5 P1-1: Mise en œuvre des fenêtres et portes-extérieures (continuité d étanchéité en angle)
 * - CSTB e-Cahier 3698: Fenêtres aluminium à rupture de pont thermique (chambre de décompression)
 * - NF EN 1026 / NF EN 12207: Perméabilité à l air (Classes A*1 à A*4)
 * - NF EN 1027 / NF EN 12208: Étanchéité à l eau (Classes 1A à E1200)
 * - ISO 815-1: Déformation rémanente après compression des élastomères (Compression Set)
 */

export type GasketMaterialType =
  | 'epdm_peroxide_cured'
  | 'epdm_sulfur_cured'
  | 'tpe_cellular'
  | 'silicone_elastomer'
  | 'pvc_plasticized';

export type CornerTechnologyType =
  | 'molded_continuous_frame'
  | 'welded_prefabricated_corners'
  | 'continuous_notched_top_splice'
  | 'butt_glued_corners'
  | 'butt_dry_cut';

export type GasketProfileRoleType =
  | 'central_decompression_bulb'
  | 'casement_lip_acoustic'
  | 'glazing_wedge_epdm'
  | 'double_chamber_heavy';

export type WindowOpeningSystemType =
  | 'casement_tilt_turn'
  | 'casement_side_hung'
  | 'projected_top_hung'
  | 'sliding_door'
  | 'pivot_window';

export interface GasketMaterialSpec {
  id: GasketMaterialType;
  labelFr: string;
  basePolymer: string;
  hardnessShoreA: number;
  compressionSetPercentage: number; // ISO 815-1 at 70°C for 24h
  linearThermalExpansionPerK: number; // 10^-6 / K
  operatingTempRangeFr: string;
  weatheringOzoneResistance: 'Excellente' | 'Tres Bonne' | 'Moyenne' | 'Faible';
  stiffnessKFactor: number; // N/(mm * m)
  description: string;
}

export interface CornerTechnologySpec {
  id: CornerTechnologyType;
  labelFr: string;
  dtuCompliance: 'Conforme Certifie' | 'Conforme Standard' | 'Tolere avec Reserve' | 'Non Conforme Interdit';
  cornerIntegrityRating: 'Optimale (100%)' | 'Elevee (90%)' | 'Acceptable (70%)' | 'Faible (40%)' | 'Critique (0%)';
  cornerThermalShrinkageRisk: 'Nul' | 'Tres Faible' | 'Modere' | 'Eleve' | 'Critique';
  assemblyToolingFr: string;
  recommendedAirClass: 'A*4' | 'A*3' | 'A*2' | 'A*1' | 'Non Classe';
  recommendedWaterClass: 'E1200' | '9A' | '7A' | '4A' | '1A';
  description: string;
}

export interface GasketProfileSpec {
  id: GasketProfileRoleType;
  labelFr: string;
  nominalUncompressedHeightMm: number; // H0
  standardRebateGapMm: number; // Hg
  mountingBaseWidthMm: number;
  idealCompressionRange: { minPercent: number; maxPercent: number };
  acousticDecouplingGainDba: number;
  description: string;
}

export const GASKET_MATERIAL_SPECS: Record<GasketMaterialType, GasketMaterialSpec> = {
  epdm_peroxide_cured: {
    id: 'epdm_peroxide_cured',
    labelFr: 'EPDM Dense Vulcanisé au Peroxyde (Haut de Gamme)',
    basePolymer: 'Terpolymère éthylène-propylène-diène (réticulation peroxyde)',
    hardnessShoreA: 65,
    compressionSetPercentage: 16.0,
    linearThermalExpansionPerK: 150e-6,
    operatingTempRangeFr: '-40°C à +120°C',
    weatheringOzoneResistance: 'Excellente',
    stiffnessKFactor: 9.5,
    description: 'Réticulation dense sans soufre offrant une mémoire élastique maximale et une stabilité chimique totale sous climat saharien.',
  },
  epdm_sulfur_cured: {
    id: 'epdm_sulfur_cured',
    labelFr: 'EPDM Standard Vulcanisé au Soufre (Atelier Courant)',
    basePolymer: 'EPDM standard vulcanisation soufre',
    hardnessShoreA: 60,
    compressionSetPercentage: 24.0,
    linearThermalExpansionPerK: 165e-6,
    operatingTempRangeFr: '-30°C à +90°C',
    weatheringOzoneResistance: 'Tres Bonne',
    stiffnessKFactor: 8.2,
    description: 'Joint de frappe et central courant en menuiserie aluminium, économique et souple avec bonne tenue aux intempéries.',
  },
  tpe_cellular: {
    id: 'tpe_cellular',
    labelFr: 'TPE / TPV Thermoplastique Expansé (Soudable à Chaud)',
    basePolymer: 'Santoprene / élastomère thermoplastique microcellulaire',
    hardnessShoreA: 55,
    compressionSetPercentage: 32.0,
    linearThermalExpansionPerK: 180e-6,
    operatingTempRangeFr: '-25°C à +80°C',
    weatheringOzoneResistance: 'Tres Bonne',
    stiffnessKFactor: 6.8,
    description: 'Élastomère thermoplastique adapté aux machines de soudage d angles automatisées, souplesse immédiate au montage.',
  },
  silicone_elastomer: {
    id: 'silicone_elastomer',
    labelFr: 'Silicone Élastomère Haute Performance (Acoustique & Feu)',
    basePolymer: 'Polydiméthylsiloxane réticulé',
    hardnessShoreA: 50,
    compressionSetPercentage: 12.0,
    linearThermalExpansionPerK: 210e-6,
    operatingTempRangeFr: '-50°C à +180°C',
    weatheringOzoneResistance: 'Excellente',
    stiffnessKFactor: 7.2,
    description: 'Élastomère inaltérable par les rayons ultraviolets, résilience thermique extrême et découplage acoustique de référence.',
  },
  pvc_plasticized: {
    id: 'pvc_plasticized',
    labelFr: 'PVC Souple Plastifié (Économique - Déconseillé Extérieur)',
    basePolymer: 'Polychlorure de vinyle avec plastifiants volatils',
    hardnessShoreA: 70,
    compressionSetPercentage: 52.0,
    linearThermalExpansionPerK: 260e-6,
    operatingTempRangeFr: '-10°C à +60°C',
    weatheringOzoneResistance: 'Faible',
    stiffnessKFactor: 14.0,
    description: 'Sensible aux ultraviolets et à l évaporation des plastifiants, durcissement et rétractation rapide déconseillés par NF DTU 36.5.',
  },
};

export const CORNER_TECHNOLOGY_SPECS: Record<CornerTechnologyType, CornerTechnologySpec> = {
  molded_continuous_frame: {
    id: 'molded_continuous_frame',
    labelFr: 'Cadre Monobloc 4 Angles Vulcanisés en Usine',
    dtuCompliance: 'Conforme Certifie',
    cornerIntegrityRating: 'Optimale (100%)',
    cornerThermalShrinkageRisk: 'Nul',
    assemblyToolingFr: 'Presse d injection thermique industrielle avec matrice 90°',
    recommendedAirClass: 'A*4',
    recommendedWaterClass: 'E1200',
    description: 'Les 4 angles sont moulés et polymérisés sous pression en usine. Continuité physique moléculaire parfaite sans ligne de collage.',
  },
  welded_prefabricated_corners: {
    id: 'welded_prefabricated_corners',
    labelFr: 'Angles Moulés Préfabriqués Soudés à Froid',
    dtuCompliance: 'Conforme Standard',
    cornerIntegrityRating: 'Elevee (90%)',
    cornerThermalShrinkageRisk: 'Tres Faible',
    assemblyToolingFr: 'Colle cyanoacrylate spécifique EPDM avec activateur et pinces 90°',
    recommendedAirClass: 'A*4',
    recommendedWaterClass: '9A',
    description: 'Quatre pièces d angle d usine avec inserts tubulaires, collées chimiquement aux profilés filants coupés à 90°. Recommandé DTU 36.5.',
  },
  continuous_notched_top_splice: {
    id: 'continuous_notched_top_splice',
    labelFr: 'Joint Filant Continu Plié avec Raccord Unique en Imposte',
    dtuCompliance: 'Conforme Standard',
    cornerIntegrityRating: 'Acceptable (70%)',
    cornerThermalShrinkageRisk: 'Modere',
    assemblyToolingFr: 'Pince à gruger les talons et colle de raccordement en traverse haute',
    recommendedAirClass: 'A*3',
    recommendedWaterClass: '7A',
    description: 'Le profilé fait le tour complet du cadre. Les talons sont crantés sans couper la lèvre étanche. Raccord vulcanisé au point haut.',
  },
  butt_glued_corners: {
    id: 'butt_glued_corners',
    labelFr: 'Coupes d Onglet 45° Collées sans Renfort d Angle',
    dtuCompliance: 'Tolere avec Reserve',
    cornerIntegrityRating: 'Faible (40%)',
    cornerThermalShrinkageRisk: 'Eleve',
    assemblyToolingFr: 'Cisailles d angle 45° manuelles et colle rapide',
    recommendedAirClass: 'A*2',
    recommendedWaterClass: '4A',
    description: 'Coupe en biseau à 45° assemblée par simple colle. Risque d arrachement par retrait thermique au bout de quelques saisons ensoleillées.',
  },
  butt_dry_cut: {
    id: 'butt_dry_cut',
    labelFr: 'Coupes d Onglet Simples Non Collées (Pose à Sec)',
    dtuCompliance: 'Non Conforme Interdit',
    cornerIntegrityRating: 'Critique (0%)',
    cornerThermalShrinkageRisk: 'Critique',
    assemblyToolingFr: 'Aucun outil de soudage (assemblage défectueux)',
    recommendedAirClass: 'A*1',
    recommendedWaterClass: '1A',
    description: 'Interdit formellement par NF DTU 36.5. Le retrait élastomère ouvre un jour de 1 à 3 mm aux 4 angles, causant des infiltrations d eau directes.',
  },
};

export const GASKET_PROFILE_SPECS: Record<GasketProfileRoleType, GasketProfileSpec> = {
  central_decompression_bulb: {
    id: 'central_decompression_bulb',
    labelFr: 'Joint Central Tubulaire à Chambre de Décompression',
    nominalUncompressedHeightMm: 8.5,
    standardRebateGapMm: 5.5,
    mountingBaseWidthMm: 14.0,
    idealCompressionRange: { minPercent: 25.0, maxPercent: 38.0 },
    acousticDecouplingGainDba: 3.5,
    description: 'Barrière principale étanche à l air et à l eau s appuyant contre la barrette isolante polyamide du dormant.',
  },
  casement_lip_acoustic: {
    id: 'casement_lip_acoustic',
    labelFr: 'Joint de Battement de Frappe Ouvrant à Lèvre Acoustique',
    nominalUncompressedHeightMm: 6.2,
    standardRebateGapMm: 4.2,
    mountingBaseWidthMm: 10.0,
    idealCompressionRange: { minPercent: 22.0, maxPercent: 35.0 },
    acousticDecouplingGainDba: 2.5,
    description: 'Joint extérieur périphérique protégeant la gorge de ferrure contre les poussières et brisant l énergie sonore directe.',
  },
  glazing_wedge_epdm: {
    id: 'glazing_wedge_epdm',
    labelFr: 'Joint Compensateur de Vitrage Intérieur (Sous Pareclose)',
    nominalUncompressedHeightMm: 4.8,
    standardRebateGapMm: 3.3,
    mountingBaseWidthMm: 8.5,
    idealCompressionRange: { minPercent: 20.0, maxPercent: 32.0 },
    acousticDecouplingGainDba: 1.5,
    description: 'Maintient la pression de contact élastique sur le double vitrage sans risquer de desolidarisation de la pareclose.',
  },
  double_chamber_heavy: {
    id: 'double_chamber_heavy',
    labelFr: 'Joint Lourd Double Alvéole pour Baies de Grande Hauteur',
    nominalUncompressedHeightMm: 11.5,
    standardRebateGapMm: 7.2,
    mountingBaseWidthMm: 16.5,
    idealCompressionRange: { minPercent: 28.0, maxPercent: 42.0 },
    acousticDecouplingGainDba: 4.5,
    description: 'Conçu pour portes d entrée aluminium et baies vitrées de 3.0 m de haut soumises à fortes pressions d air.',
  },
};

export interface GasketAuditInput {
  windowWidthMm: number;
  windowHeightMm: number;
  sashCount: number;
  openingSystem: WindowOpeningSystemType;
  materialType: GasketMaterialType;
  cornerTechnology: CornerTechnologyType;
  profileRole: GasketProfileRoleType;
  customNominalHeightMm?: number;
  actualRebateGapMm?: number;
  lockingPointsCount?: number;
  darkProfileExposureSummer: boolean; // Summer solar heating up to 75°C
  facadeWindPressurePa?: number; // e.g. 100 Pa, 250 Pa, 600 Pa
}

export interface GasketAuditResult {
  windowPerimeterM: number;
  totalGasketLengthM: number; // with fabrication reserve
  nominalHeightMm: number;
  actualGapMm: number;
  effectiveCompressionDepthMm: number;
  compressionRatioPercent: number;
  compressionStatus: 'undercompressed' | 'optimal' | 'overcompressed' | 'crushed';
  linearCompressionForceNm: number;
  totalPerimeterCompressionForceN: number;
  handleOperatingTorqueNm: number;
  pmrForceCompliant: boolean; // Decree 06-455 (handle torque <= 5.0 N*m or opening force <= 50 N)
  summerCornerThermalShrinkageMm: number;
  resultingAirInfiltrationRateM3Hm: number;
  airTightnessClass: 'A*4' | 'A*3' | 'A*2' | 'A*1' | 'Non Conforme';
  watertightnessClass: 'E1200' | '9A' | '7A' | '4A' | '1A' | 'Echec (Fuite)';
  acousticFlankingReductionDba: number;
  compressionSetLongTermPercent: number;
  estimatedElasticLifespanYears: number;
  dtuComplianceStatus: 'Conforme Certifie' | 'Conforme Standard' | 'Tolere avec Reserve' | 'Non Conforme Interdit';
  auditWarnings: string[];
  auditRecommendations: string[];
  billOfMaterials: {
    linearGasketMeters: number;
    moldedCornersCount: number;
    adhesiveTubesRequired: number;
    assemblyTimeMinutes: number;
  };
}

export function calculateGasketVulcanizationAudit(input: GasketAuditInput): GasketAuditResult {
  const widthM = Math.max(0.4, input.windowWidthMm / 1000);
  const heightM = Math.max(0.4, input.windowHeightMm / 1000);
  const singlePerimeterM = 2 * (widthM + heightM);
  const totalGasketLengthM = Number((singlePerimeterM * input.sashCount * 1.04).toFixed(2)); // +4% for corner inserts and trimming

  const matSpec = GASKET_MATERIAL_SPECS[input.materialType];
  const cornerSpec = CORNER_TECHNOLOGY_SPECS[input.cornerTechnology];
  const profileSpec = GASKET_PROFILE_SPECS[input.profileRole];

  const nominalHeightMm = input.customNominalHeightMm ?? profileSpec.nominalUncompressedHeightMm;
  const actualGapMm = input.actualRebateGapMm ?? profileSpec.standardRebateGapMm;

  // Compression mechanics
  const effectiveCompressionDepthMm = Math.max(0, Number((nominalHeightMm - actualGapMm).toFixed(2)));
  const compressionRatioPercent = Number(((effectiveCompressionDepthMm / nominalHeightMm) * 100).toFixed(1));

  let compressionStatus: 'undercompressed' | 'optimal' | 'overcompressed' | 'crushed' = 'optimal';
  if (compressionRatioPercent < profileSpec.idealCompressionRange.minPercent) {
    compressionStatus = 'undercompressed';
  } else if (compressionRatioPercent > 50.0) {
    compressionStatus = 'crushed';
  } else if (compressionRatioPercent > profileSpec.idealCompressionRange.maxPercent) {
    compressionStatus = 'overcompressed';
  }

  // Linear force per meter F_c (N/m)
  const linearForceBase = matSpec.stiffnessKFactor * effectiveCompressionDepthMm * 4.5;
  const linearCompressionForceNm = Number(Math.max(10, Math.min(90, linearForceBase)).toFixed(1));
  const totalPerimeterCompressionForceN = Number((linearCompressionForceNm * singlePerimeterM).toFixed(0));

  // Handle operating torque (N*m) through cremone gear
  const lockingPoints = Math.max(2, input.lockingPointsCount ?? (singlePerimeterM > 4.0 ? 5 : 3));
  const camFrictionMu = 0.12;
  const camSpindleRadiusM = 0.018; // 18 mm cam eccentric arm
  const cremoneEfficiency = 0.72;
  const rawTorque = (totalPerimeterCompressionForceN * camFrictionMu * camSpindleRadiusM) / (lockingPoints * cremoneEfficiency * 0.18);
  const handleOperatingTorqueNm = Number(Math.max(1.2, Math.min(14.0, rawTorque)).toFixed(1));
  const pmrForceCompliant = handleOperatingTorqueNm <= 5.0;

  // Thermal shrinkage at corners under Algerian solar cycle (dT = 60°C on dark profile, 35°C on clear profile)
  const deltaT = input.darkProfileExposureSummer ? 65.0 : 38.0;
  const maxLinearSpanM = Math.max(widthM, heightM);
  let summerCornerThermalShrinkageMm = 0;
  if (input.cornerTechnology === 'molded_continuous_frame') {
    summerCornerThermalShrinkageMm = 0.0; // Molded corners absorb tension homogeneously
  } else if (input.cornerTechnology === 'welded_prefabricated_corners') {
    summerCornerThermalShrinkageMm = 0.1;
  } else if (input.cornerTechnology === 'continuous_notched_top_splice') {
    summerCornerThermalShrinkageMm = 0.4;
  } else if (input.cornerTechnology === 'butt_glued_corners') {
    summerCornerThermalShrinkageMm = Number((maxLinearSpanM * 1000 * matSpec.linearThermalExpansionPerK * deltaT * 0.15).toFixed(1));
  } else {
    // Dry cut corners pull back significantly
    summerCornerThermalShrinkageMm = Number((maxLinearSpanM * 1000 * matSpec.linearThermalExpansionPerK * deltaT * 0.45).toFixed(1));
  }

  // Resulting air permeability at 100 Pa (NF EN 12207)
  let baseAirLeakage = 0.50; // m3/(h * m) for perfect seal
  if (compressionStatus === 'undercompressed') {
    baseAirLeakage += (profileSpec.idealCompressionRange.minPercent - compressionRatioPercent) * 0.25;
  } else if (compressionStatus === 'crushed') {
    baseAirLeakage += 0.8;
  }

  // Penalty based on corner technology
  if (input.cornerTechnology === 'molded_continuous_frame') {
    baseAirLeakage += 0.05;
  } else if (input.cornerTechnology === 'welded_prefabricated_corners') {
    baseAirLeakage += 0.25;
  } else if (input.cornerTechnology === 'continuous_notched_top_splice') {
    baseAirLeakage += 0.95;
  } else if (input.cornerTechnology === 'butt_glued_corners') {
    baseAirLeakage += 2.80 + summerCornerThermalShrinkageMm * 1.2;
  } else {
    baseAirLeakage += 8.50 + summerCornerThermalShrinkageMm * 3.5;
  }

  const resultingAirInfiltrationRateM3Hm = Number(baseAirLeakage.toFixed(2));

  let airTightnessClass: 'A*4' | 'A*3' | 'A*2' | 'A*1' | 'Non Conforme' = 'A*4';
  if (resultingAirInfiltrationRateM3Hm <= 2.25) {
    airTightnessClass = 'A*4';
  } else if (resultingAirInfiltrationRateM3Hm <= 6.75) {
    airTightnessClass = 'A*3';
  } else if (resultingAirInfiltrationRateM3Hm <= 20.25) {
    airTightnessClass = 'A*2';
  } else if (resultingAirInfiltrationRateM3Hm <= 50.0) {
    airTightnessClass = 'A*1';
  } else {
    airTightnessClass = 'Non Conforme';
  }

  // Watertightness class (NF EN 12208)
  let watertightnessClass: 'E1200' | '9A' | '7A' | '4A' | '1A' | 'Echec (Fuite)' = 'E1200';
  if (input.cornerTechnology === 'butt_dry_cut' || compressionStatus === 'undercompressed' && compressionRatioPercent < 15) {
    watertightnessClass = 'Echec (Fuite)';
  } else if (input.cornerTechnology === 'butt_glued_corners' || airTightnessClass === 'A*2') {
    watertightnessClass = '4A'; // 150 Pa
  } else if (input.cornerTechnology === 'continuous_notched_top_splice') {
    watertightnessClass = '7A'; // 300 Pa
  } else if (input.cornerTechnology === 'welded_prefabricated_corners') {
    watertightnessClass = '9A'; // 600 Pa
  } else {
    watertightnessClass = 'E1200'; // 1200 Pa exceptional driving rain
  }

  // Acoustic flanking reduction
  let acousticFlankingReductionDba = profileSpec.acousticDecouplingGainDba;
  if (input.materialType === 'silicone_elastomer') {
    acousticFlankingReductionDba += 1.0;
  } else if (input.materialType === 'pvc_plasticized') {
    acousticFlankingReductionDba -= 1.0;
  }
  if (airTightnessClass === 'A*4') {
    acousticFlankingReductionDba += 0.5;
  } else if (airTightnessClass === 'A*1' || airTightnessClass === 'Non Conforme') {
    acousticFlankingReductionDba = 0.5; // Acoustic bridge at leaks
  }
  acousticFlankingReductionDba = Number(acousticFlankingReductionDba.toFixed(1));

  // Compression set durability
  const compressionSetLongTermPercent = Number((matSpec.compressionSetPercentage * (input.darkProfileExposureSummer ? 1.25 : 1.0)).toFixed(1));
  let estimatedElasticLifespanYears = 25;
  if (input.materialType === 'epdm_peroxide_cured') estimatedElasticLifespanYears = 30;
  else if (input.materialType === 'epdm_sulfur_cured') estimatedElasticLifespanYears = 20;
  else if (input.materialType === 'tpe_cellular') estimatedElasticLifespanYears = 15;
  else if (input.materialType === 'silicone_elastomer') estimatedElasticLifespanYears = 35;
  else if (input.materialType === 'pvc_plasticized') estimatedElasticLifespanYears = 6;

  if (input.cornerTechnology === 'butt_glued_corners') estimatedElasticLifespanYears = Math.min(estimatedElasticLifespanYears, 8);
  if (input.cornerTechnology === 'butt_dry_cut') estimatedElasticLifespanYears = 1;

  // Warnings & Recommendations
  const auditWarnings: string[] = [];
  const auditRecommendations: string[] = [];

  if (cornerSpec.dtuCompliance === 'Non Conforme Interdit') {
    auditWarnings.push('Angles coupés vifs sans soudure interdits par NF DTU 36.5 (risque immédiat d infiltration d eau et de sifflement d air).');
    auditRecommendations.push('Passer impérativement sur des angles moulés soudés ou un cadre vulcanisé d usine.');
  } else if (cornerSpec.dtuCompliance === 'Tolere avec Reserve') {
    auditWarnings.push('Collage d onglet 45° sans renfort: vulnérable aux écarts thermiques estivaux méditerranéens.');
    auditRecommendations.push('Employer au minimum des angles préfabriqués vulcanisés avec colle cyanoacrylate spécifique élastomère.');
  }

  if (compressionStatus === 'undercompressed') {
    auditWarnings.push(`Sous-compression du joint (${compressionRatioPercent}% < ${profileSpec.idealCompressionRange.minPercent}%). Étanchéité à l air et à l eau compromise.`);
    auditRecommendations.push('Régler les gâches de crémone ou augmenter la hauteur nominale du joint pour atteindre au moins 25% d écrasement.');
  } else if (compressionStatus === 'crushed') {
    auditWarnings.push(`Joint écrasé excessivement (${compressionRatioPercent}% > 50%). Risque de déformation rémanente rapide et dureté à la poignée.`);
    auditRecommendations.push('Réduire la cote d écrasement en ajustant les galets excentriques pour préserver l élasticité du bulbe.');
  }

  if (!pmrForceCompliant) {
    auditWarnings.push(`Couple de manœuvre crémone (${handleOperatingTorqueNm} N*m) supérieur au seuil de confort PMR recommandé (5.0 N*m).`);
    auditRecommendations.push('Lubrifier les gorges de gâche avec spray silicone et ajuster le nombre de points de verrouillage.');
  }

  if (input.darkProfileExposureSummer && summerCornerThermalShrinkageMm > 1.0) {
    auditWarnings.push(`Profilé foncé en plein soleil: retrait thermique d angle calculé à ${summerCornerThermalShrinkageMm} mm.`);
    auditRecommendations.push('Utiliser un EPDM réticulé au peroxyde et verrouiller les raccords filants en traverse haute.');
  }

  // Bill of materials
  const moldedCornersCount = (input.cornerTechnology === 'welded_prefabricated_corners' || input.cornerTechnology === 'molded_continuous_frame') ? 4 * input.sashCount : 0;
  const adhesiveTubesRequired = (input.cornerTechnology === 'welded_prefabricated_corners' || input.cornerTechnology === 'continuous_notched_top_splice' || input.cornerTechnology === 'butt_glued_corners')
    ? Math.max(1, Math.ceil((4 * input.sashCount) / 12))
    : 0;
  const assemblyTimeMinutes = input.cornerTechnology === 'molded_continuous_frame'
    ? 5 * input.sashCount
    : input.cornerTechnology === 'welded_prefabricated_corners'
    ? 12 * input.sashCount
    : input.cornerTechnology === 'continuous_notched_top_splice'
    ? 10 * input.sashCount
    : 8 * input.sashCount;

  return {
    windowPerimeterM: Number(singlePerimeterM.toFixed(2)),
    totalGasketLengthM,
    nominalHeightMm,
    actualGapMm,
    effectiveCompressionDepthMm,
    compressionRatioPercent,
    compressionStatus,
    linearCompressionForceNm,
    totalPerimeterCompressionForceN,
    handleOperatingTorqueNm,
    pmrForceCompliant,
    summerCornerThermalShrinkageMm,
    resultingAirInfiltrationRateM3Hm,
    airTightnessClass,
    watertightnessClass,
    acousticFlankingReductionDba,
    compressionSetLongTermPercent,
    estimatedElasticLifespanYears,
    dtuComplianceStatus: cornerSpec.dtuCompliance,
    auditWarnings,
    auditRecommendations,
    billOfMaterials: {
      linearGasketMeters: totalGasketLengthM,
      moldedCornersCount,
      adhesiveTubesRequired,
      assemblyTimeMinutes,
    },
  };
}
