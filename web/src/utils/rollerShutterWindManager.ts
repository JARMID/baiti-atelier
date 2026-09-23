// Roller Shutter Storm Wind Slat Deflection and Guide Rail Retention Auditor
// Technical Standards: NF EN 13659, CNERIB DTR BC 2-47 RNV 2013, CSTB Cahier 3422

export type SlatProfileType =
  | 'alu_dp_39_std'
  | 'alu_dp_43_std'
  | 'alu_dp_55_hd'
  | 'alu_ext_37_sec'
  | 'alu_ext_55_heavy'
  | 'pvc_dp_39_eco'
  | 'pvc_dp_50_eco';

export type GuideRailType =
  | 'rail_std_22x53'
  | 'rail_deep_28x66'
  | 'rail_storm_30x80'
  | 'rail_heavy_45x100';

export type EndLockType =
  | 'caps_std_straight'
  | 'caps_anti_storm_hooks';

export type AlgerianWindZone =
  | 'zone_1_littoral'
  | 'zone_2_hauts_plateaux'
  | 'zone_3_sud_saharien';

export type TerrainRoughnessCategory =
  | 'cat_1_seaside_exposed'
  | 'cat_2_open_country'
  | 'cat_3_suburban'
  | 'cat_4_dense_urban';

export interface SlatSpecification {
  id: SlatProfileType;
  nameFr: string;
  material: 'alu_foam' | 'alu_extruded' | 'pvc_cellular';
  slatHeightMm: number;
  slatThicknessMm: number;
  wallThicknessMm: number;
  foamDensityKgM3?: number;
  momentOfInertiaCm4: number; // Ixx
  sectionModulusCm3: number; // Wel
  linearMassKgM2: number;
  youngModulusMpa: number;
  yieldStrengthMpa: number;
  maxRecommendedSpanM: number;
  description: string;
}

export interface GuideRailSpecification {
  id: GuideRailType;
  nameFr: string;
  railWidthMm: number;
  railDepthMm: number;
  grooveDepthMm: number; // Profondeur utile rainure
  nominalBiteDepthMm: number; // Penetration initiale au repos
  hasRetentionLip: boolean;
  retentionLipWidthMm: number;
  description: string;
}

export const SLAT_CATALOG: Record<SlatProfileType, SlatSpecification> = {
  alu_dp_39_std: {
    id: 'alu_dp_39_std',
    nameFr: 'Aluminium DP 39 mm Mousse PU Standard',
    material: 'alu_foam',
    slatHeightMm: 39,
    slatThicknessMm: 8.5,
    wallThicknessMm: 0.28,
    foamDensityKgM3: 70,
    momentOfInertiaCm4: 0.72,
    sectionModulusCm3: 0.17,
    linearMassKgM2: 3.2,
    youngModulusMpa: 70000,
    yieldStrengthMpa: 160,
    maxRecommendedSpanM: 2.2,
    description: 'Lame aluminium thermo-laquee double paroi injectee mousse polyurethane classique pour baies residentielles.',
  },
  alu_dp_43_std: {
    id: 'alu_dp_43_std',
    nameFr: 'Aluminium DP 43 mm Mousse PU Standard',
    material: 'alu_foam',
    slatHeightMm: 43,
    slatThicknessMm: 9.0,
    wallThicknessMm: 0.30,
    foamDensityKgM3: 75,
    momentOfInertiaCm4: 1.05,
    sectionModulusCm3: 0.23,
    linearMassKgM2: 3.5,
    youngModulusMpa: 70000,
    yieldStrengthMpa: 160,
    maxRecommendedSpanM: 2.6,
    description: 'Lame double paroi a inertie amelioree pour fenetres et porte-fenetres de dimensions moyennes.',
  },
  alu_dp_55_hd: {
    id: 'alu_dp_55_hd',
    nameFr: 'Aluminium DP 55 mm Haute Densite (300 kg/m3)',
    material: 'alu_foam',
    slatHeightMm: 55,
    slatThicknessMm: 13.5,
    wallThicknessMm: 0.40,
    foamDensityKgM3: 300,
    momentOfInertiaCm4: 3.20,
    sectionModulusCm3: 0.48,
    linearMassKgM2: 5.5,
    youngModulusMpa: 70000,
    yieldStrengthMpa: 175,
    maxRecommendedSpanM: 3.6,
    description: 'Lame haute rigidite injectee avec mousse dense renforcee pour grandes largeurs et zones venteuses.',
  },
  alu_ext_37_sec: {
    id: 'alu_ext_37_sec',
    nameFr: 'Aluminium Extrude 37 mm Haute Securite',
    material: 'alu_extruded',
    slatHeightMm: 37,
    slatThicknessMm: 9.0,
    wallThicknessMm: 1.2,
    momentOfInertiaCm4: 1.65,
    sectionModulusCm3: 0.36,
    linearMassKgM2: 7.8,
    youngModulusMpa: 70000,
    yieldStrengthMpa: 210,
    maxRecommendedSpanM: 3.2,
    description: 'Lame pleine aluminium extrude 6063 T6 bi-paroi rigide alliant securite anti-intrusion et resistance au vent.',
  },
  alu_ext_55_heavy: {
    id: 'alu_ext_55_heavy',
    nameFr: 'Aluminium Extrude 55 mm Grand Vent & Tempete',
    material: 'alu_extruded',
    slatHeightMm: 55,
    slatThicknessMm: 14.0,
    wallThicknessMm: 1.5,
    momentOfInertiaCm4: 5.80,
    sectionModulusCm3: 0.82,
    linearMassKgM2: 9.5,
    youngModulusMpa: 70000,
    yieldStrengthMpa: 220,
    maxRecommendedSpanM: 4.5,
    description: 'Lame extrudee lourde speciale baies vitrees d atelier, vitrines commerciales et sites maritimes tres exposes.',
  },
  pvc_dp_39_eco: {
    id: 'pvc_dp_39_eco',
    nameFr: 'PVC Alveolaire 39 mm Economique',
    material: 'pvc_cellular',
    slatHeightMm: 39,
    slatThicknessMm: 8.0,
    wallThicknessMm: 0.9,
    momentOfInertiaCm4: 0.45,
    sectionModulusCm3: 0.11,
    linearMassKgM2: 3.0,
    youngModulusMpa: 3000,
    yieldStrengthMpa: 45,
    maxRecommendedSpanM: 1.6,
    description: 'Lame PVC blanc economique a chambre alveolaire pour petites fenetres abritees.',
  },
  pvc_dp_50_eco: {
    id: 'pvc_dp_50_eco',
    nameFr: 'PVC Alveolaire 50 mm Standard',
    material: 'pvc_cellular',
    slatHeightMm: 50,
    slatThicknessMm: 10.0,
    wallThicknessMm: 1.0,
    momentOfInertiaCm4: 0.85,
    sectionModulusCm3: 0.17,
    linearMassKgM2: 3.8,
    youngModulusMpa: 3000,
    yieldStrengthMpa: 45,
    maxRecommendedSpanM: 1.9,
    description: 'Lame PVC a chambres multiples pour porte-fenetres standard a budget reduit.',
  },
};

export const GUIDE_RAIL_CATALOG: Record<GuideRailType, GuideRailSpecification> = {
  rail_std_22x53: {
    id: 'rail_std_22x53',
    nameFr: 'Coulisse Standard 22x53 mm (Prof. 22 mm)',
    railWidthMm: 53,
    railDepthMm: 22,
    grooveDepthMm: 22,
    nominalBiteDepthMm: 14,
    hasRetentionLip: false,
    retentionLipWidthMm: 0,
    description: 'Coulisse aluminium classique equipee de joints brosses silencieux sans ergot de verrouillage.',
  },
  rail_deep_28x66: {
    id: 'rail_deep_28x66',
    nameFr: 'Coulisse Profonde 28x66 mm (Prof. 28 mm)',
    railWidthMm: 66,
    railDepthMm: 28,
    grooveDepthMm: 28,
    nominalBiteDepthMm: 20,
    hasRetentionLip: false,
    retentionLipWidthMm: 0,
    description: 'Coulisse a profondeur accrue offrant 6 mm de penetration supplementaire contre le decrochage.',
  },
  rail_storm_30x80: {
    id: 'rail_storm_30x80',
    nameFr: 'Coulisse Anti-Tempete 30x80 mm avec Chambre (Prof. 40 mm)',
    railWidthMm: 80,
    railDepthMm: 30,
    grooveDepthMm: 40,
    nominalBiteDepthMm: 30,
    hasRetentionLip: true,
    retentionLipWidthMm: 6,
    description: 'Coulisse renforcee avec rainure de 40 mm et levre de retenue capturant les ergots anti-tempete.',
  },
  rail_heavy_45x100: {
    id: 'rail_heavy_45x100',
    nameFr: 'Coulisse Grand Vent Haute Securite 45x100 mm (Prof. 55 mm)',
    railWidthMm: 100,
    railDepthMm: 45,
    grooveDepthMm: 55,
    nominalBiteDepthMm: 42,
    hasRetentionLip: true,
    retentionLipWidthMm: 9,
    description: 'Coulisse blindee grand format pour baies de tres grande dimension en zone cyclonique ou cotiere ouverte.',
  },
};

export interface RollerShutterWindAuditParams {
  curtainWidthMm: number; // Largeur dos de coulisse / jour
  curtainHeightMm: number; // Hauteur tablier
  slatType: SlatProfileType;
  guideRailType: GuideRailType;
  endLockType: EndLockType;
  algerianWindZone: AlgerianWindZone;
  terrainCategory: TerrainRoughnessCategory;
  buildingHeightM: number;
  safetyFactor?: number;
  wilayaName?: string;
  clientName?: string;
  projectReference?: string;
}

export interface RollerShutterWindAuditResult {
  // Geometry and Input Specs
  curtainWidthMm: number;
  curtainHeightMm: number;
  curtainAreaM2: number;
  slatSpec: SlatSpecification;
  railSpec: GuideRailSpecification;
  endLockType: EndLockType;
  totalSlatCount: number;
  curtainTotalWeightKg: number;

  // Aerodynamic and Wind Pressure Specs (RNV 2013)
  windZoneName: string;
  terrainName: string;
  baseReferenceWindPressurePa: number; // q_ref
  exposureCoefficientCe: number; // c_e(z)
  peakDynamicWindPressurePa: number; // q_p(z)
  designWindPressurePa: number; // q_design with factor
  totalWindForceOnCurtainN: number;
  reactionPerGuideRailN: number;

  // Slat Deflection and Mechanical Stress
  linearLoadPerSlatNM: number;
  midSpanDeflectionMm: number;
  deflectionSpanRatio: number; // L / deflection
  maxBendingMomentNM: number;
  bendingStressMpa: number;
  allowableBendingStressMpa: number;
  bendingStressUtilizationPercent: number;

  // Rail Engagement & Anti-Derailment Analysis
  initialNominalBiteMm: number;
  arcShorteningMm: number; // Raccourcissement de corde
  pulloutPerSideMm: number; // Retrait lateral par coulisse
  residualBiteDepthMm: number; // Penetration restante
  minSafeBiteDepthMm: number; // Seuil minimum de securite
  isDerailmentRiskDetected: boolean;
  areHooksEngagedAndSecuring: boolean;

  // Fasteners & Anchors on Rails
  fastenerSpacingMm: number;
  fastenersPerRailCount: number;
  shearForcePerFastenerN: number;
  pulloutTensionPerFastenerN: number;

  // NF EN 13659 Classification
  achievedEn13659Class: number; // 0 to 6
  nominalPressureLimitPa: number;
  safetyPressureLimitPa: number;
  isCompliantEn13659: boolean;
  isCompliantRnv2013: boolean;

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

export function computeRollerShutterWindAudit(
  params: RollerShutterWindAuditParams
): RollerShutterWindAuditResult {
  const {
    curtainWidthMm,
    curtainHeightMm,
    slatType,
    guideRailType,
    endLockType,
    algerianWindZone,
    terrainCategory,
    buildingHeightM,
    safetyFactor = 1.25,
    wilayaName = 'Alger',
    clientName = 'Chantier Client',
    projectReference = 'Tablier Volet Roulant RNV 2013',
  } = params;

  const slatSpec = SLAT_CATALOG[slatType];
  const railSpec = GUIDE_RAIL_CATALOG[guideRailType];

  const spanM = Math.max(0.6, curtainWidthMm / 1000);
  const heightM = Math.max(0.6, curtainHeightMm / 1000);
  const curtainAreaM2 = parseFloat((spanM * heightM).toFixed(3));
  const totalSlatCount = Math.ceil(curtainHeightMm / slatSpec.slatHeightMm);
  const curtainTotalWeightKg = parseFloat((curtainAreaM2 * slatSpec.linearMassKgM2).toFixed(1));

  // 1. RNV 2013 Reference Pressure and Terrain Exposure
  let qRefPa = 375;
  let windZoneName = 'Zone I (Littoral - qref = 375 N/m2)';
  if (algerianWindZone === 'zone_2_hauts_plateaux') {
    qRefPa = 435;
    windZoneName = 'Zone II (Hauts Plateaux - qref = 435 N/m2)';
  } else if (algerianWindZone === 'zone_3_sud_saharien') {
    qRefPa = 500;
    windZoneName = 'Zone III (Sud Saharien - qref = 500 N/m2)';
  }

  let terrainName = 'Categorie III (Zone Suburbaine / Industrielle)';
  let ce = 1.35;
  const z = Math.max(2, Math.min(60, buildingHeightM));

  if (terrainCategory === 'cat_1_seaside_exposed') {
    terrainName = 'Categorie I (Bord de mer sans obstacle / Lac)';
    ce = 1.8 + 0.25 * Math.log(z / 10);
  } else if (terrainCategory === 'cat_2_open_country') {
    terrainName = 'Categorie II (Campagne rase avec haies dispersees)';
    ce = 1.5 + 0.22 * Math.log(z / 10);
  } else if (terrainCategory === 'cat_3_suburban') {
    terrainName = 'Categorie III (Zone Suburbaine / Industrielle)';
    ce = 1.25 + 0.20 * Math.log(z / 10);
  } else {
    terrainName = 'Categorie IV (Zone Urbaine Dense batiments > 15 m)';
    ce = 1.05 + 0.18 * Math.log(z / 10);
  }

  ce = Math.max(0.9, Math.min(2.6, parseFloat(ce.toFixed(2))));
  const peakDynamicWindPressurePa = Math.round(qRefPa * ce);
  const designWindPressurePa = Math.round(peakDynamicWindPressurePa * safetyFactor);

  const totalWindForceOnCurtainN = Math.round(designWindPressurePa * curtainAreaM2);
  const reactionPerGuideRailN = Math.round(totalWindForceOnCurtainN / 2);

  // 2. Slat Deflection and Mechanical Bending Stress
  const slatHeightM = slatSpec.slatHeightMm / 1000;
  const linearLoadPerSlatNM = parseFloat((designWindPressurePa * slatHeightM).toFixed(2));

  // Mid-span deflection: f = (5 * w * L^4) / (384 * E * I)
  // E in N/m2 = youngModulusMpa * 1e6
  // I in m4 = momentOfInertiaCm4 * 1e-8
  const eNPerM2 = slatSpec.youngModulusMpa * 1e6;
  const iM4 = slatSpec.momentOfInertiaCm4 * 1e-8;

  const deflectionM = (5 * linearLoadPerSlatNM * Math.pow(spanM, 4)) / (384 * eNPerM2 * iM4);
  const midSpanDeflectionMm = parseFloat((deflectionM * 1000).toFixed(1));
  const deflectionSpanRatio = Math.round(curtainWidthMm / Math.max(0.1, midSpanDeflectionMm));

  // Max bending moment per slat: M = (w * L^2) / 8
  const maxBendingMomentNM = parseFloat(((linearLoadPerSlatNM * Math.pow(spanM, 2)) / 8).toFixed(2));
  // Wel in m3 = sectionModulusCm3 * 1e-6
  const welM3 = slatSpec.sectionModulusCm3 * 1e-6;
  const bendingStressPa = (maxBendingMomentNM / welM3);
  const bendingStressMpa = parseFloat((bendingStressPa / 1e6).toFixed(1));

  const allowableBendingStressMpa = parseFloat((slatSpec.yieldStrengthMpa / 1.15).toFixed(1));
  const bendingStressUtilizationPercent = Math.round((bendingStressMpa / allowableBendingStressMpa) * 100);

  // 3. Rail Penetration and Arc Shortening (Cord Shortening)
  // Delta L = (8 * f^2) / (3 * L)
  const arcShorteningM = (8 * Math.pow(deflectionM, 2)) / (3 * spanM);
  const arcShorteningMm = parseFloat((arcShorteningM * 1000).toFixed(2));
  const pulloutPerSideMm = parseFloat((arcShorteningMm / 2).toFixed(2));

  const initialNominalBiteMm = railSpec.nominalBiteDepthMm;
  const residualBiteDepthMm = parseFloat((initialNominalBiteMm - pulloutPerSideMm).toFixed(1));
  const minSafeBiteDepthMm = 8.0;

  const hasHooks = endLockType === 'caps_anti_storm_hooks';
  const hasRetentionLip = railSpec.hasRetentionLip;
  const areHooksEngagedAndSecuring = hasHooks && hasRetentionLip;

  // Derailment risk without storm hooks
  const isDerailmentRiskDetected = (!areHooksEngagedAndSecuring && residualBiteDepthMm < minSafeBiteDepthMm) || (residualBiteDepthMm <= 0);

  // 4. Fasteners along Guide Rails (Spacing standard 400 mm)
  const fastenerSpacingMm = 400;
  const fastenersPerRailCount = Math.max(3, Math.ceil(curtainHeightMm / fastenerSpacingMm) + 1);
  const shearForcePerFastenerN = Math.round(reactionPerGuideRailN / fastenersPerRailCount);
  const pulloutTensionPerFastenerN = Math.round(
    (totalWindForceOnCurtainN * 0.15) / fastenersPerRailCount
  );

  // 5. NF EN 13659 Classification mapping
  // Nominal classes: Cl 1 (50 Pa), Cl 2 (70 Pa), Cl 3 (100 Pa), Cl 4 (170 Pa), Cl 5 (270 Pa), Cl 6 (400 Pa)
  // Safety factor = 1.5 in NF EN 13659
  let achievedEn13659Class = 0;
  let nominalPressureLimitPa = 0;
  let safetyPressureLimitPa = 0;

  const maxTestedNominalPa = peakDynamicWindPressurePa;
  if (maxTestedNominalPa >= 400 && !isDerailmentRiskDetected && bendingStressUtilizationPercent <= 100) {
    achievedEn13659Class = 6;
    nominalPressureLimitPa = 400;
    safetyPressureLimitPa = 600;
  } else if (maxTestedNominalPa >= 270 && !isDerailmentRiskDetected && bendingStressUtilizationPercent <= 100) {
    achievedEn13659Class = 5;
    nominalPressureLimitPa = 270;
    safetyPressureLimitPa = 400;
  } else if (maxTestedNominalPa >= 170 && !isDerailmentRiskDetected && bendingStressUtilizationPercent <= 100) {
    achievedEn13659Class = 4;
    nominalPressureLimitPa = 170;
    safetyPressureLimitPa = 250;
  } else if (maxTestedNominalPa >= 100 && !isDerailmentRiskDetected && bendingStressUtilizationPercent <= 100) {
    achievedEn13659Class = 3;
    nominalPressureLimitPa = 100;
    safetyPressureLimitPa = 150;
  } else if (maxTestedNominalPa >= 70 && !isDerailmentRiskDetected && bendingStressUtilizationPercent <= 100) {
    achievedEn13659Class = 2;
    nominalPressureLimitPa = 70;
    safetyPressureLimitPa = 100;
  } else if (maxTestedNominalPa >= 50 && !isDerailmentRiskDetected && bendingStressUtilizationPercent <= 100) {
    achievedEn13659Class = 1;
    nominalPressureLimitPa = 50;
    safetyPressureLimitPa = 75;
  } else {
    achievedEn13659Class = 0;
    nominalPressureLimitPa = 0;
    safetyPressureLimitPa = 0;
  }

  const isCompliantEn13659 = achievedEn13659Class >= 3;
  const isCompliantRnv2013 = !isDerailmentRiskDetected && bendingStressUtilizationPercent <= 100;

  // 6. Global Verdict and Recommendations
  const recommendations: string[] = [];
  let globalStatus: 'conform' | 'warning' | 'non_conform' = 'conform';
  let statusSummaryFr = 'Tablier conforme sous vent extreme RNV 2013 et classe NF EN 13659 validee.';

  if (isDerailmentRiskDetected) {
    globalStatus = 'non_conform';
    statusSummaryFr = 'Risque critique de sortie de coulisse (deraillement) sous rafales de vent !';
    recommendations.push(
      'Penetration residuelle insuffisante (' + residualBiteDepthMm + ' mm restante < seuil de 8 mm).'
    );
    recommendations.push(
      'Remplacer les embouts droits par des embouts anti-tempete a crochets d ancrage.'
    );
    recommendations.push(
      'Adopter une coulisse profonde 28x66 mm ou coulisse anti-tempete 30x80 mm avec chambre de retenue.'
    );
  } else if (bendingStressUtilizationPercent > 100) {
    globalStatus = 'non_conform';
    statusSummaryFr = 'Depassement de la contrainte elastique admissible de la lame alu/pvc.';
    recommendations.push(
      'Contrainte de flexion ' + bendingStressMpa + ' MPa superieure a la limite ' + allowableBendingStressMpa + ' MPa (' + bendingStressUtilizationPercent + '%).'
    );
    recommendations.push(
      'Augmenter le gabarit de lame (ex: passer de 39 mm a 43 mm ou 55 mm haute densite).'
    );
  } else if (deflectionSpanRatio < 50 || residualBiteDepthMm < 12) {
    globalStatus = 'warning';
    statusSummaryFr = 'Tablier stable mais fleche importante sous forte depression venteuse.';
    recommendations.push(
      'Fleche a mi-portee de ' + midSpanDeflectionMm + ' mm (L/' + deflectionSpanRatio + '). Vigilance sur le frottement contre le vitrage.'
    );
    if (!areHooksEngagedAndSecuring) {
      recommendations.push(
        'L ajout d embouts a crochets anti-arrachement securiserait l installation en cas de vent superieur aux previsions.'
      );
    }
  } else {
    recommendations.push(
      'Marge de securite structurelle excellente avec penetration residuelle de ' + residualBiteDepthMm + ' mm.'
    );
    recommendations.push(
      'Fixation des coulisses recommandee tous les ' + fastenerSpacingMm + ' mm avec chevilles nylon expansibles 8 mm.'
    );
  }

  const generatedDate = new Date().toLocaleDateString('fr-DZ', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  return {
    curtainWidthMm,
    curtainHeightMm,
    curtainAreaM2,
    slatSpec,
    railSpec,
    endLockType,
    totalSlatCount,
    curtainTotalWeightKg,
    windZoneName,
    terrainName,
    baseReferenceWindPressurePa: qRefPa,
    exposureCoefficientCe: ce,
    peakDynamicWindPressurePa,
    designWindPressurePa,
    totalWindForceOnCurtainN,
    reactionPerGuideRailN,
    linearLoadPerSlatNM,
    midSpanDeflectionMm,
    deflectionSpanRatio,
    maxBendingMomentNM,
    bendingStressMpa,
    allowableBendingStressMpa,
    bendingStressUtilizationPercent,
    initialNominalBiteMm,
    arcShorteningMm,
    pulloutPerSideMm,
    residualBiteDepthMm,
    minSafeBiteDepthMm,
    isDerailmentRiskDetected,
    areHooksEngagedAndSecuring,
    fastenerSpacingMm,
    fastenersPerRailCount,
    shearForcePerFastenerN,
    pulloutTensionPerFastenerN,
    achievedEn13659Class,
    nominalPressureLimitPa,
    safetyPressureLimitPa,
    isCompliantEn13659,
    isCompliantRnv2013,
    globalStatus,
    statusSummaryFr,
    recommendations,
    wilayaName,
    clientName,
    projectReference,
    generatedDate,
  };
}
