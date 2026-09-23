// Perimeter Sealant Joint Width and Thermal Movement Amplitude Auditor
// Technical Standards: NF DTU 36.5, ISO 11600, Regles Professionnelles SNJF, CSTB Cahier 3521, DTR E 2.1

export type SealantClassIso11600 =
  | 'class_25lm_polyurethane'
  | 'class_25lm_neutral_silicone'
  | 'class_25lm_ms_polymer'
  | 'class_20lm_elastomer'
  | 'class_12_5e_plasto_elastic'
  | 'class_7_5p_acrylic';

export type FrameColorFinish =
  | 'dark_black_ral_9005'
  | 'dark_anthracite_ral_7016'
  | 'medium_metallic_bronze'
  | 'light_white_ral_9016'
  | 'anodized_natural_silver';

export type SubstrateMasonryType =
  | 'reinforced_concrete'
  | 'hollow_clay_brick'
  | 'concrete_block'
  | 'structural_steel_subframe'
  | 'wood_subframe';

export interface SealantSpecification {
  id: SealantClassIso11600;
  nameFr: string;
  isoClass: string;
  movementCapabilityPercent: number; // e.g. 25 for +/- 25%
  elasticRecoveryPercent: number; // e.g. >= 80% for LM
  secantModulus100Mpa: number; // Bas module <= 0.4 MPa
  shoreAHardness: number;
  maxServiceTempC: number;
  minServiceTempC: number;
  uvResistanceGrade: 'excellent' | 'tres_bon' | 'moyen' | 'faible';
  needsPrimerOnPorous: boolean;
  description: string;
}

export const SEALANT_CATALOG: Record<SealantClassIso11600, SealantSpecification> = {
  class_25lm_polyurethane: {
    id: 'class_25lm_polyurethane',
    nameFr: 'Mastic Polyuréthane 1ère Catégorie 25LM',
    isoClass: 'ISO 11600-F-25LM',
    movementCapabilityPercent: 25,
    elasticRecoveryPercent: 85,
    secantModulus100Mpa: 0.35,
    shoreAHardness: 25,
    maxServiceTempC: 80,
    minServiceTempC: -30,
    uvResistanceGrade: 'tres_bon',
    needsPrimerOnPorous: true,
    description: 'Mastic élastomère polyuréthane à bas module d élasticité et excellente adhérence sur béton et maçonnerie.',
  },
  class_25lm_neutral_silicone: {
    id: 'class_25lm_neutral_silicone',
    nameFr: 'Mastic Silicone Neutre Alcoxy/Oxime 25LM',
    isoClass: 'ISO 11600-F&G-25LM',
    movementCapabilityPercent: 25,
    elasticRecoveryPercent: 90,
    secantModulus100Mpa: 0.30,
    shoreAHardness: 20,
    maxServiceTempC: 150,
    minServiceTempC: -40,
    uvResistanceGrade: 'excellent',
    needsPrimerOnPorous: false,
    description: 'Silicone neutre haute performance résistant aux rayonnements ultraviolets intenses et aux températures extrêmes.',
  },
  class_25lm_ms_polymer: {
    id: 'class_25lm_ms_polymer',
    nameFr: 'Mastic Hybride Polymère MS 25LM',
    isoClass: 'ISO 11600-F-25LM',
    movementCapabilityPercent: 25,
    elasticRecoveryPercent: 80,
    secantModulus100Mpa: 0.38,
    shoreAHardness: 28,
    maxServiceTempC: 90,
    minServiceTempC: -30,
    uvResistanceGrade: 'excellent',
    needsPrimerOnPorous: false,
    description: 'Hybride sans solvant ni isocyanate, recouvrable par peinture acrylique, très résistant au vieillissement climatique.',
  },
  class_20lm_elastomer: {
    id: 'class_20lm_elastomer',
    nameFr: 'Mastic Élastomère Moyen 20LM',
    isoClass: 'ISO 11600-F-20LM',
    movementCapabilityPercent: 20,
    elasticRecoveryPercent: 75,
    secantModulus100Mpa: 0.45,
    shoreAHardness: 30,
    maxServiceTempC: 80,
    minServiceTempC: -25,
    uvResistanceGrade: 'tres_bon',
    needsPrimerOnPorous: true,
    description: 'Élastomère pour joints périmétriques à amplitude de mouvement moyenne pour petites baies.',
  },
  class_12_5e_plasto_elastic: {
    id: 'class_12_5e_plasto_elastic',
    nameFr: 'Mastic Plasto-Élastique 12.5E',
    isoClass: 'ISO 11600-F-12.5E',
    movementCapabilityPercent: 12.5,
    elasticRecoveryPercent: 40,
    secantModulus100Mpa: 0.60,
    shoreAHardness: 35,
    maxServiceTempC: 70,
    minServiceTempC: -15,
    uvResistanceGrade: 'moyen',
    needsPrimerOnPorous: true,
    description: 'Mastic à élasticité restreinte convenant uniquement pour calfeutrements intérieurs ou châssis abrités.',
  },
  class_7_5p_acrylic: {
    id: 'class_7_5p_acrylic',
    nameFr: 'Mastic Acrylique Peinturable 7.5P',
    isoClass: 'ISO 11600-F-7.5P',
    movementCapabilityPercent: 7.5,
    elasticRecoveryPercent: 15,
    secantModulus100Mpa: 0.80,
    shoreAHardness: 45,
    maxServiceTempC: 70,
    minServiceTempC: -10,
    uvResistanceGrade: 'faible',
    needsPrimerOnPorous: false,
    description: 'Mastic économique réservé aux finitions intérieures sans exposition aux intempéries ni forte dilatation.',
  },
};

export interface PerimeterSealantAuditParams {
  windowWidthMm: number;
  windowHeightMm: number;
  frameColorFinish: FrameColorFinish;
  substrateType: SubstrateMasonryType;
  sealantType: SealantClassIso11600;
  actualPlannedJointWidthMm?: number; // Largeur de joint prévue sur plan
  installationTemperatureC?: number; // Température ambiante lors de la pose
  wilayaName?: string;
  clientName?: string;
  projectReference?: string;
}

export interface PerimeterSealantAuditResult {
  // Dimensions and Perimeter
  windowWidthMm: number;
  windowHeightMm: number;
  totalPerimeterM: number;
  governingDimensionMm: number; // Plus grande dimension (L ou H)
  governingAxis: 'largeur' | 'hauteur';

  // Thermal Physics
  frameColorLabelFr: string;
  aluminumSurfaceMaxTempC: number;
  aluminumSurfaceMinTempC: number;
  deltaTAluminumK: number;
  thermalExpansionCoeffAlu: number; // 23.4e-6
  substrateNameFr: string;
  thermalExpansionCoeffSubstrate: number;
  deltaTMasonryK: number;
  differentialThermalMovementMm: number;
  maxSeasonalThermalMovementMm: number;

  // Structural & Tolerance Allocations
  erectionToleranceMm: number; // +/- 2 mm
  structuralSlabDeflectionMm: number; // 1.5 to 3.0 mm
  totalDesignMovementAmplitudeMm: number; // Somme vectorielle ou cumul

  // Sizing Calculations (SNJF / DTU 36.5)
  sealantSpec: SealantSpecification;
  movementCapabilityPercent: number;
  minimumRequiredJointWidthMm: number;
  recommendedDesignJointWidthMm: number;
  actualPlannedJointWidthMm: number;
  recommendedJointDepthMm: number; // Aspect ratio 2:1 (W/2)
  backingRodDiameterMm: number; // PE rod = 1.25 * W
  isWidthCompliant: boolean;
  widthSafetyMarginMm: number;

  // Material Consumption Estimations
  linearMetersCount: number;
  sealantVolumeLiters: number;
  cartridges310mlCount: number;
  sausages600mlCount: number;
  backingRodRollsMetersCount: number;

  // Surface Preparation & Quality Directives
  primerRequired: boolean;
  primerTypeFr: string;
  cleaningSolventFr: string;
  aspectRatioLabelFr: string;

  // Global Verdict & Recommendations
  globalStatus: 'conform' | 'warning' | 'non_conform';
  statusSummaryFr: string;
  recommendations: string[];

  // Metadata
  wilayaName: string;
  clientName: string;
  projectReference: string;
  generatedDate: string;
}

export function computePerimeterSealantAudit(
  params: PerimeterSealantAuditParams
): PerimeterSealantAuditResult {
  const {
    windowWidthMm,
    windowHeightMm,
    frameColorFinish,
    substrateType,
    sealantType,
    actualPlannedJointWidthMm = 10,
    installationTemperatureC = 20,
    wilayaName = 'Alger',
    clientName = 'Chantier Client',
    projectReference = 'Calfeutrement Périphérique Baie DTU 36.5',
  } = params;

  const sealantSpec = SEALANT_CATALOG[sealantType];

  const wM = Math.max(0.4, windowWidthMm / 1000);
  const hM = Math.max(0.4, windowHeightMm / 1000);
  const totalPerimeterM = parseFloat(((wM + hM) * 2).toFixed(2));

  const governingDimensionMm = Math.max(windowWidthMm, windowHeightMm);
  const governingAxis: 'largeur' | 'hauteur' = windowWidthMm >= windowHeightMm ? 'largeur' : 'hauteur';
  const governingSpanM = governingDimensionMm / 1000;

  // 1. Frame Surface Temperature and Thermal Expansion
  let frameColorLabelFr = 'Blanc RAL 9016 (Teinte claire réfléchissante)';
  let aluMaxTempC = 55;
  const aluMinTempC = -5; // Minimum hivernal en Algérie
  const thermalExpansionCoeffAlu = 23.4e-6; // 1/K

  if (frameColorFinish === 'dark_black_ral_9005') {
    frameColorLabelFr = 'Noir Foncé RAL 9005 (Absorption thermique maximale)';
    aluMaxTempC = 82;
  } else if (frameColorFinish === 'dark_anthracite_ral_7016') {
    frameColorLabelFr = 'Gris Anthracite RAL 7016 (Forte absorption solaire)';
    aluMaxTempC = 78;
  } else if (frameColorFinish === 'medium_metallic_bronze') {
    frameColorLabelFr = 'Bronze / Brun Métallisé (Absorption moyenne)';
    aluMaxTempC = 68;
  } else if (frameColorFinish === 'anodized_natural_silver') {
    frameColorLabelFr = 'Anodisé Naturel Satiné (Émission modérée)';
    aluMaxTempC = 60;
  }

  const deltaTAlu = aluMaxTempC - aluMinTempC;

  // 2. Substrate Expansion Properties
  let substrateNameFr = 'Béton armé banché';
  let thermalExpansionCoeffSubstrate = 10.0e-6; // 1/K
  let primerTypeFr = 'Primaire d accrochage polyuréthane pour fonds poreux';
  let primerRequired = true;

  if (substrateType === 'hollow_clay_brick') {
    substrateNameFr = 'Brique creuse en terre cuite';
    thermalExpansionCoeffSubstrate = 6.0e-6;
    primerTypeFr = 'Primaire consolidant pour maçonnerie de brique';
    primerRequired = true;
  } else if (substrateType === 'concrete_block') {
    substrateNameFr = 'Aggloméré de ciment (Parpaing)';
    thermalExpansionCoeffSubstrate = 10.0e-6;
    primerTypeFr = 'Primaire bouche-pores pour maçonnerie béton';
    primerRequired = true;
  } else if (substrateType === 'structural_steel_subframe') {
    substrateNameFr = 'Précadre en acier galvanisé';
    thermalExpansionCoeffSubstrate = 12.0e-6;
    primerTypeFr = 'Primaire dégraissant promoteur d adhérence métaux';
    primerRequired = false;
  } else if (substrateType === 'wood_subframe') {
    substrateNameFr = 'Pré-cadre ou dormant bois';
    thermalExpansionCoeffSubstrate = 5.0e-6;
    primerTypeFr = 'Primaire d imprégnation bois hydrofuge';
    primerRequired = true;
  }

  if (!sealantSpec.needsPrimerOnPorous && substrateType !== 'structural_steel_subframe') {
    primerRequired = false;
    primerTypeFr = 'Application directe sans primaire autorisée par le fabricant silicone';
  }

  const deltaTMasonryK = 40; // Variation de température du gros-oeuvre plus inerte

  // Differential thermal movement: Delta L = L * (alpha_alu * DT_alu - alpha_sub * DT_sub)
  const expansionAluM = governingSpanM * thermalExpansionCoeffAlu * deltaTAlu;
  const expansionSubM = governingSpanM * thermalExpansionCoeffSubstrate * deltaTMasonryK;
  const diffThermalM = Math.max(0.0005, expansionAluM - expansionSubM);
  const differentialThermalMovementMm = parseFloat((diffThermalM * 1000).toFixed(2));

  // Summer compression and winter elongation relative to installation temperature
  const deltaSummerK = Math.max(10, aluMaxTempC - installationTemperatureC);
  const deltaWinterK = Math.max(10, installationTemperatureC - aluMinTempC);
  const maxSeasonalThermalMovementMm = parseFloat(
    (governingSpanM * thermalExpansionCoeffAlu * Math.max(deltaSummerK, deltaWinterK) * 1000).toFixed(2)
  );

  // 3. Structural Tolerance and Deflections
  const erectionToleranceMm = 2.0; // Tolérance de pose
  const structuralSlabDeflectionMm = governingSpanM > 2.5 ? 2.0 : 1.0;
  const totalDesignMovementAmplitudeMm = parseFloat(
    (differentialThermalMovementMm + erectionToleranceMm * 0.5 + structuralSlabDeflectionMm * 0.5).toFixed(2)
  );

  // 4. Required Minimum Joint Width Calculation (SNJF / DTU 36.5)
  // W_min = Total_Movement / (Movement_Capability_Percent / 100) + pose tolerance
  const movementRatio = sealantSpec.movementCapabilityPercent / 100;
  const rawMinJointWidthMm = totalDesignMovementAmplitudeMm / movementRatio;

  // Base threshold according to DTU 36.5: min 5 mm for small windows, min 8 mm for exterior joinery
  let minSafeAbsoluteWidthMm = 7.0;
  if (governingDimensionMm >= 2400 || aluMaxTempC >= 75) {
    minSafeAbsoluteWidthMm = 10.0;
  } else if (governingDimensionMm >= 1800) {
    minSafeAbsoluteWidthMm = 8.0;
  }

  const minimumRequiredJointWidthMm = parseFloat(
    Math.max(minSafeAbsoluteWidthMm, rawMinJointWidthMm).toFixed(1)
  );

  // Recommended design width rounded to next convenient nominal size (8, 10, 12, 15, 20 mm)
  let recommendedDesignJointWidthMm = 10;
  if (minimumRequiredJointWidthMm > 15) {
    recommendedDesignJointWidthMm = 20;
  } else if (minimumRequiredJointWidthMm > 12) {
    recommendedDesignJointWidthMm = 15;
  } else if (minimumRequiredJointWidthMm > 10) {
    recommendedDesignJointWidthMm = 12;
  } else if (minimumRequiredJointWidthMm > 8) {
    recommendedDesignJointWidthMm = 10;
  } else {
    recommendedDesignJointWidthMm = 8;
  }

  const isWidthCompliant = actualPlannedJointWidthMm >= minimumRequiredJointWidthMm;
  const widthSafetyMarginMm = parseFloat((actualPlannedJointWidthMm - minimumRequiredJointWidthMm).toFixed(1));

  // 5. Joint Depth (Aspect Ratio 2:1 rule of thumb by SNJF)
  // For width 6 to 12 mm: depth = 6 to 8 mm. For width > 12 mm: depth = width / 2
  let recommendedJointDepthMm = 6;
  if (actualPlannedJointWidthMm >= 12) {
    recommendedJointDepthMm = Math.round(actualPlannedJointWidthMm / 2);
  } else {
    recommendedJointDepthMm = Math.max(6, Math.min(8, Math.round(actualPlannedJointWidthMm * 0.75)));
  }

  // Backing rod diameter: must be compressed by approx 25%
  // d_rod = 1.25 * W
  const backingRodDiameterMm = Math.round(actualPlannedJointWidthMm * 1.25);

  // 6. Sealant Consumption Estimation
  // Volume = W(m) * D(m) * Perimeter(m) * 1000 (liters)
  const jointWidthM = actualPlannedJointWidthMm / 1000;
  const jointDepthM = recommendedJointDepthMm / 1000;
  const wasteMultiplier = 1.15; // 15% waste on corners and tooling
  const sealantVolumeLiters = parseFloat(
    (jointWidthM * jointDepthM * totalPerimeterM * 1000 * wasteMultiplier).toFixed(2)
  );

  const cartridges310mlCount = Math.max(1, Math.ceil(sealantVolumeLiters / 0.31));
  const sausages600mlCount = Math.max(1, Math.ceil(sealantVolumeLiters / 0.60));
  const backingRodRollsMetersCount = Math.ceil(totalPerimeterM * 1.05);

  const cleaningSolventFr = 'Alcool isopropylique ou nettoyant solvanté non gras (technique des deux chiffons)';
  const aspectRatioLabelFr = `Largeur ${actualPlannedJointWidthMm} mm / Profondeur ${recommendedJointDepthMm} mm (Rapport 2:1 SNJF)`;

  // 7. Global Verdict & Recommendations
  const recommendations: string[] = [];
  let globalStatus: 'conform' | 'warning' | 'non_conform' = 'conform';
  let statusSummaryFr = 'Largeur de joint et amplitude élastique conformes NF DTU 36.5 / SNJF.';

  if (!isWidthCompliant) {
    globalStatus = 'non_conform';
    statusSummaryFr = 'Largeur de joint insuffisante : risque de cisaillement ou décollement du mastic !';
    recommendations.push(
      'La largeur prévue (' + actualPlannedJointWidthMm + ' mm) est inférieure au minimum requis de ' + minimumRequiredJointWidthMm + ' mm.'
    );
    recommendations.push(
      'Élargir la réservation de calfeutrement ou passer sur un mastic à plus haute capacité de déformation (Classe 25LM).'
    );
    recommendations.push(
      'Insérer impérativement un fond de joint PE de diamètre ' + backingRodDiameterMm + ' mm pour éviter l adhérence sur 3 faces.'
    );
  } else if (widthSafetyMarginMm < 1.5 || sealantSpec.movementCapabilityPercent < 20) {
    globalStatus = 'warning';
    statusSummaryFr = 'Dimensionnement valide mais marge de sécurité étroite sous forte canicule.';
    recommendations.push(
      'Marge de sécurité faible (' + widthSafetyMarginMm + ' mm). Soigner particulièrement l écrasement du fond de joint.'
    );
    if (primerRequired) {
      recommendations.push(
        'Appliquer le primaire d adhérence sur support maçonnerie pour garantir la tenue à l arrachement sous 80°C.'
      );
    }
  } else {
    recommendations.push(
      'Excellente configuration élastique avec ' + widthSafetyMarginMm + ' mm de marge de sécurité.'
    );
    recommendations.push(
      'Respecter la profondeur de cordon de ' + recommendedJointDepthMm + ' mm et lisser au savon neutre sans creuser le joint.'
    );
  }

  const generatedDate = new Date().toLocaleDateString('fr-DZ', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  return {
    windowWidthMm,
    windowHeightMm,
    totalPerimeterM,
    governingDimensionMm,
    governingAxis,
    frameColorLabelFr,
    aluminumSurfaceMaxTempC: aluMaxTempC,
    aluminumSurfaceMinTempC: aluMinTempC,
    deltaTAluminumK: deltaTAlu,
    thermalExpansionCoeffAlu,
    substrateNameFr,
    thermalExpansionCoeffSubstrate,
    deltaTMasonryK,
    differentialThermalMovementMm,
    maxSeasonalThermalMovementMm,
    erectionToleranceMm,
    structuralSlabDeflectionMm,
    totalDesignMovementAmplitudeMm,
    sealantSpec,
    movementCapabilityPercent: sealantSpec.movementCapabilityPercent,
    minimumRequiredJointWidthMm,
    recommendedDesignJointWidthMm,
    actualPlannedJointWidthMm,
    recommendedJointDepthMm,
    backingRodDiameterMm,
    isWidthCompliant,
    widthSafetyMarginMm,
    linearMetersCount: totalPerimeterM,
    sealantVolumeLiters,
    cartridges310mlCount,
    sausages600mlCount,
    backingRodRollsMetersCount,
    primerRequired,
    primerTypeFr,
    cleaningSolventFr,
    aspectRatioLabelFr,
    globalStatus,
    statusSummaryFr,
    recommendations,
    wilayaName,
    clientName,
    projectReference,
    generatedDate,
  };
}
