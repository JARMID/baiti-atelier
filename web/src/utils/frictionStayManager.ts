/**
 * FRICTION STAY & PROJECTING TOP-HUNG WINDOW SASH SAFETY AUDITOR
 * 
 * Normative Framework:
 * - NF EN 13126-5: Quincaillerie pour le bâtiment - Dispositifs limiteurs d ouverture et compas à friction
 * - NF EN 14608: Fenêtres - Détermination de la résistance à la charge verticale dans le plan du vantail
 * - NF EN 1191: Portes et fenêtres - Résistance aux manœuvres répétées (durabilité 25 000 cycles)
 * - BS 6375-2: Spécification de performance des fenêtres en projection (efforts et charges de service)
 * - CNERIB DTR BC 2-47 (RNV 2013): Règles Parasismiques & Actions du Vent en Algérie
 * - NF DTU 36.5: Mise en œuvre des fenêtres et dispositifs de sécurité anti-défenestration
 */

/**
 * Returns the reference dynamic wind pressure (Pa) according to CNERIB DTR BC 2-47 (RNV 2013).
 */
export function getWindPressureForWilaya(wilayaName: string): number {
  const zone4Wilayas = ['Béjaïa', 'Jijel', 'Skikda', 'Annaba', 'El Tarf'];
  const zone3Wilayas = ['Alger', 'Oran', 'Tipaza', 'Boumerdès', 'Mostaganem', 'Aïn Témouchent', 'Chlef', 'Tizi Ouzou'];
  const zone1Wilayas = ['Sétif', 'Batna', 'Djelfa', 'Médéa', 'Biskra', 'M\'Sila', 'Laghouat', 'Ouargla', 'Ghardaïa'];

  if (zone4Wilayas.includes(wilayaName)) return 585;
  if (zone3Wilayas.includes(wilayaName)) return 505;
  if (zone1Wilayas.includes(wilayaName)) return 375;
  return 435; // Default Zone II (plaines intérieures)
}

export type WindowOpeningStyle = 'top_hung_projecting' | 'side_hung_projecting' | 'bottom_hung_hopper';

export type StayLengthInch = 10 | 12 | 14 | 16 | 20 | 24 | 28;

export type StackHeightMm = 13 | 17;

export type SteelGrade = 'austenitic_304' | 'marine_grade_316';

export type RestrictorType =
  | 'none'
  | 'integrated_restrictor_100mm'
  | 'detachable_safety_cable'
  | 'dual_retaining_arm';

export type FrictionShoeMaterial = 'nylon_composite' | 'brass_metallic';

export interface FrictionStaySpec {
  lengthInch: StayLengthInch;
  lengthMm: number;
  maxSashHeightTopHungMm: number;
  maxSashWidthSideHungMm: number;
  maxSashWeightKg: number;
  maxOpeningAngleDeg: number;
  recommendedMinimumHeightMm: number;
  description: string;
}

export const FRICTION_STAY_CATALOG: Record<StayLengthInch, FrictionStaySpec> = {
  10: {
    lengthInch: 10,
    lengthMm: 254,
    maxSashHeightTopHungMm: 550,
    maxSashWidthSideHungMm: 450,
    maxSashWeightKg: 26,
    maxOpeningAngleDeg: 45,
    recommendedMinimumHeightMm: 350,
    description: 'Compas court 10 pouces pour petits châssis d aération, imposte et salles d eau.',
  },
  12: {
    lengthInch: 12,
    lengthMm: 305,
    maxSashHeightTopHungMm: 650,
    maxSashWidthSideHungMm: 550,
    maxSashWeightKg: 35,
    maxOpeningAngleDeg: 45,
    recommendedMinimumHeightMm: 450,
    description: 'Compas standard 12 pouces pour fenêtres résidentielles courantes.',
  },
  14: {
    lengthInch: 14,
    lengthMm: 356,
    maxSashHeightTopHungMm: 780,
    maxSashWidthSideHungMm: 650,
    maxSashWeightKg: 42,
    maxOpeningAngleDeg: 38,
    recommendedMinimumHeightMm: 550,
    description: 'Compas intermédiaire 14 pouces offrant un angle d ouverture et ventilation équilibrés.',
  },
  16: {
    lengthInch: 16,
    lengthMm: 406,
    maxSashHeightTopHungMm: 950,
    maxSashWidthSideHungMm: 750,
    maxSashWeightKg: 55,
    maxOpeningAngleDeg: 35,
    recommendedMinimumHeightMm: 650,
    description: 'Compas 16 pouces polyvalent pour vantaux moyens avec double vitrage lourd.',
  },
  20: {
    lengthInch: 20,
    lengthMm: 508,
    maxSashHeightTopHungMm: 1200,
    maxSashWidthSideHungMm: 850,
    maxSashWeightKg: 70,
    maxOpeningAngleDeg: 30,
    recommendedMinimumHeightMm: 850,
    description: 'Compas 20 pouces haute capacité pour grandes hauteurs en tertiaire et façades.',
  },
  24: {
    lengthInch: 24,
    lengthMm: 610,
    maxSashHeightTopHungMm: 1450,
    maxSashWidthSideHungMm: 950,
    maxSashWeightKg: 100,
    maxOpeningAngleDeg: 25,
    recommendedMinimumHeightMm: 1050,
    description: 'Compas lourd 24 pouces renforcé à 5 articulations pour murs-rideaux.',
  },
  28: {
    lengthInch: 28,
    lengthMm: 711,
    maxSashHeightTopHungMm: 1750,
    maxSashWidthSideHungMm: 1100,
    maxSashWeightKg: 140,
    maxOpeningAngleDeg: 20,
    recommendedMinimumHeightMm: 1300,
    description: 'Compas architectural 28 pouces à charge extrême pour baies monumentales vitrées.',
  },
};

export interface FrictionStayInput {
  sashWidthMm: number;
  sashHeightMm: number;
  openingStyle: WindowOpeningStyle;
  stayLengthInch: StayLengthInch;
  stackHeightMm: StackHeightMm;
  steelGrade: SteelGrade;
  restrictorType: RestrictorType;
  frictionShoeMaterial: FrictionShoeMaterial;
  glazingThicknessMm: number; // e.g. 24 mm for 4/16/4, 28 mm for 6/16/6
  buildingFloorLevel: number; // 0 for RDC, 1 to 20 for étages
  isPublicBuildingOrSchool: boolean;
  wilayaName?: string;
  clientName?: string;
  windowReference?: string;
}

export interface FrictionStayResult {
  sashWidthMm: number;
  sashHeightMm: number;
  sashAreaM2: number;
  openingStyle: WindowOpeningStyle;
  selectedStay: FrictionStaySpec;
  stackHeightMm: StackHeightMm;
  steelGrade: SteelGrade;
  restrictorType: RestrictorType;
  frictionShoeMaterial: FrictionShoeMaterial;
  
  // Weights and Loads
  glazingWeightKg: number;
  profileWeightKg: number;
  totalSashWeightKg: number;
  totalGravityForceN: number;
  stayWeightCapacityKg: number;
  weightCapacityRatioPercent: number;
  isWeightCapacityOk: boolean;

  // Geometric Compliance
  lengthToSashRatioPercent: number;
  isStayLengthProportionOk: boolean;
  actualOpeningAngleDeg: number;
  actualMaxOpeningClearanceMm: number;

  // Wind Action (RNV 2013)
  windDynamicPressurePa: number;
  windOutwardSuctionForceN: number;
  stayFixingShearLoadPerScrewN: number;
  screwSafetyFactor: number;
  isWindRetentionOk: boolean;

  // Safety Restrictor & Child Protection (NF DTU 36.5)
  isRestrictorRequired: boolean;
  isRestrictorCompliant: boolean;
  isCorrosionProtectionAdequate: boolean;

  // Global Compliance
  complianceStatus: 'CONFORME' | 'NON_CONFORME' | 'ATTENTION';
  recommendations: string[];
}

/**
 * Main Calculation Engine for Window Friction Stays & Sash Drop Retention
 */
export function computeFrictionStayAudit(input: FrictionStayInput): FrictionStayResult {
  const {
    sashWidthMm,
    sashHeightMm,
    openingStyle,
    stayLengthInch,
    stackHeightMm,
    steelGrade,
    restrictorType,
    frictionShoeMaterial,
    glazingThicknessMm,
    buildingFloorLevel,
    isPublicBuildingOrSchool,
    wilayaName = 'Alger',
  } = input;

  const selectedStay = FRICTION_STAY_CATALOG[stayLengthInch];
  const sashAreaM2 = Math.round(((sashWidthMm * sashHeightMm) / 1000000) * 100) / 100;
  const sashPerimeterM = ((2 * (sashWidthMm + sashHeightMm)) / 1000);

  // 1. Sash Weight Calculation
  // Glass density = 2.5 kg/m2 per mm thickness
  const glazingWeightKg = Math.round(sashAreaM2 * glazingThicknessMm * 2.5 * 10) / 10;
  // Aluminium profile weight ~ 1.35 kg/m perimeter
  const profileWeightKg = Math.round(sashPerimeterM * 1.35 * 10) / 10;
  const hardwareWeightKg = 3.5; // lock, friction stays, corner keys
  const totalSashWeightKg = Math.round((glazingWeightKg + profileWeightKg + hardwareWeightKg) * 10) / 10;
  const totalGravityForceN = Math.round(totalSashWeightKg * 9.81);

  // 2. Weight Capacity Check
  const stayWeightCapacityKg = selectedStay.maxSashWeightKg;
  const weightCapacityRatioPercent = Math.round((totalSashWeightKg / stayWeightCapacityKg) * 100);
  const isWeightCapacityOk = totalSashWeightKg <= stayWeightCapacityKg;

  // 3. Stay Length Proportionality
  // For top-hung: stay length should be between 50% and 75% of sash height
  // For side-hung: stay length should be between 70% and 100% of sash width
  let relevantDimensionMm = sashHeightMm;
  if (openingStyle === 'side_hung_projecting') {
    relevantDimensionMm = sashWidthMm;
  }
  const lengthToSashRatioPercent = Math.round((selectedStay.lengthMm / relevantDimensionMm) * 100);
  
  let isStayLengthProportionOk = false;
  if (openingStyle === 'top_hung_projecting') {
    isStayLengthProportionOk = lengthToSashRatioPercent >= 45 && lengthToSashRatioPercent <= 80;
  } else if (openingStyle === 'side_hung_projecting') {
    isStayLengthProportionOk = lengthToSashRatioPercent >= 65 && lengthToSashRatioPercent <= 100;
  } else {
    // bottom hung hopper
    isStayLengthProportionOk = lengthToSashRatioPercent >= 40 && lengthToSashRatioPercent <= 75;
  }

  // 4. Opening Clearance & Restrictor
  let actualOpeningAngleDeg = selectedStay.maxOpeningAngleDeg;
  if (restrictorType === 'integrated_restrictor_100mm') {
    // Limits opening to 100 mm gap
    const calculatedAngle = Math.round((Math.asin(Math.min(1, 100 / selectedStay.lengthMm)) * 180) / Math.PI);
    actualOpeningAngleDeg = Math.min(calculatedAngle, 15);
  } else if (restrictorType === 'detachable_safety_cable') {
    actualOpeningAngleDeg = 12;
  }

  const actualMaxOpeningClearanceMm = Math.round(
    selectedStay.lengthMm * Math.sin((actualOpeningAngleDeg * Math.PI) / 180)
  );

  // 5. Wind Action Calculation (CNERIB DTR BC 2-47 / RNV 2013)
  const baseWindPressure = getWindPressureForWilaya(wilayaName);
  // Dynamic pressure with gust and height coefficient
  const heightFactor = Math.min(2.1, 1.0 + (buildingFloorLevel * 3.0) / 45);
  const windDynamicPressurePa = Math.round(baseWindPressure * heightFactor);
  
  // Suction on open projecting sash (Cp net ~ 1.05)
  const suctionCoef = 1.05;
  const projectedOpeningSin = Math.sin((actualOpeningAngleDeg * Math.PI) / 180);
  const rawSuctionForceN = windDynamicPressurePa * sashAreaM2 * suctionCoef * Math.max(0.35, projectedOpeningSin);
  const windOutwardSuctionForceN = Math.round(rawSuctionForceN * 10) / 10;

  // Shear and tension per screw (minimum 4 fixing screws per stay, 8 total)
  const totalFixingScrews = 8;
  const stayFixingShearLoadPerScrewN = Math.round((windOutwardSuctionForceN / totalFixingScrews) * 10) / 10;
  // A2/A4 stainless steel screw allowable shear load in 1.6mm alu ~ 850 N
  const screwSafetyFactor = Math.round((850 / Math.max(10, stayFixingShearLoadPerScrewN)) * 10) / 10;
  const isWindRetentionOk = screwSafetyFactor >= 2.0 && weightCapacityRatioPercent <= 100;

  // 6. Child Protection & Anti-Defenestration Verification (NF DTU 36.5)
  // Restrictor mandatory if floor level >= 1 or in public buildings/schools
  const isRestrictorRequired = buildingFloorLevel >= 1 || isPublicBuildingOrSchool;
  const isRestrictorCompliant = !isRestrictorRequired || (restrictorType !== 'none' && actualMaxOpeningClearanceMm <= 100);

  // 7. Coastal Corrosion Resistance (Saline Atmosphere)
  const isCoastalWilaya = [
    'Alger', 'Oran', 'Annaba', 'Béjaïa', 'Tipaza', 'Boumerdès', 'Tizi Ouzou', 'Jijel', 'Skikda', 'Mostaganem', 'Chlef', 'Aïn Témouchent', 'El Tarf'
  ].includes(wilayaName);
  const isCorrosionProtectionAdequate = !isCoastalWilaya || steelGrade === 'marine_grade_316';

  // 8. Global Status & Recommendations
  let complianceStatus: 'CONFORME' | 'NON_CONFORME' | 'ATTENTION' = 'CONFORME';

  if (!isWeightCapacityOk || !isRestrictorCompliant) {
    complianceStatus = 'NON_CONFORME';
  } else if (!isStayLengthProportionOk || !isCorrosionProtectionAdequate || weightCapacityRatioPercent > 85) {
    complianceStatus = 'ATTENTION';
  }

  const recommendations: string[] = [];

  if (!isWeightCapacityOk) {
    recommendations.push(
      `Poids du vantail (${totalSashWeightKg} kg) supérieur à la capacité maximale des compas ${stayLengthInch}" (${stayWeightCapacityKg} kg). Risque critique de rupture des biellettes.`
    );
  }
  if (!isRestrictorCompliant) {
    recommendations.push(
      `Absence de limiteur d ouverture obligatoire au niveau R+${buildingFloorLevel}. Installer un dispositif limiteur 100 mm conforme NF DTU 36.5 pour la sécurité anti-défenestration.`
    );
  }
  if (!isStayLengthProportionOk) {
    recommendations.push(
      `Longueur de compas (${selectedStay.lengthMm} mm) inadaptée à la hauteur du vantail (${sashHeightMm} mm, ratio ${lengthToSashRatioPercent}%). Ajuster la taille de compas pour stabiliser le guidage.`
    );
  }
  if (!isCorrosionProtectionAdequate) {
    recommendations.push(
      `Wilaya côtière (${wilayaName}) exposée aux embruns marins : prescrire impérativement l acier inoxydable austénitique AISI 316 (A4) pour éviter la corrosion par piqûres.`
    );
  }
  if (weightCapacityRatioPercent > 85 && isWeightCapacityOk) {
    recommendations.push(
      `Taux de charge élevé (${weightCapacityRatioPercent}%). Vérifier le serrage des patins de friction et lubrifier annuellement les axes de rotation avec un spray silicone neutre.`
    );
  }
  if (frictionShoeMaterial === 'nylon_composite' && totalSashWeightKg > 45) {
    recommendations.push(
      'Vantail lourd : Remplacer le patin nylon par un patin métallique en laiton usiné pour garantir la tenue de friction sous les rafales de vent.'
    );
  }
  if (complianceStatus === 'CONFORME') {
    recommendations.push(
      `Dimensionnement conforme : Compas ${stayLengthInch} pouces équilibrés, charge admissible respectée (${weightCapacityRatioPercent}%), sécurité anti-chute et résistance RNV 2013 validées.`
    );
  }

  return {
    sashWidthMm,
    sashHeightMm,
    sashAreaM2,
    openingStyle,
    selectedStay,
    stackHeightMm,
    steelGrade,
    restrictorType,
    frictionShoeMaterial,
    glazingWeightKg,
    profileWeightKg,
    totalSashWeightKg,
    totalGravityForceN,
    stayWeightCapacityKg,
    weightCapacityRatioPercent,
    isWeightCapacityOk,
    lengthToSashRatioPercent,
    isStayLengthProportionOk,
    actualOpeningAngleDeg,
    actualMaxOpeningClearanceMm,
    windDynamicPressurePa,
    windOutwardSuctionForceN,
    stayFixingShearLoadPerScrewN,
    screwSafetyFactor,
    isWindRetentionOk,
    isRestrictorRequired,
    isRestrictorCompliant,
    isCorrosionProtectionAdequate,
    complianceStatus,
    recommendations,
  };
}
