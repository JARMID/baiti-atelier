/**
 * ARCHITECTURAL LOUVER SUNSHADE & BRISE-SOLEIL STRUCTURAL AUDITOR
 * 
 * Normative Framework:
 * - Eurocode 9 (NF EN 1999-1-1): Calcul des structures en alliage d aluminium
 * - CSTB Cahier 3712: Règles professionnelles de conception et mise en œuvre des brise-soleil
 * - CNERIB DTR BC 2-47 (RNV 2013): Règles Neige et Vent en Algérie (Pressions aérodynamiques)
 * - NF EN 1991-1-4: Actions du vent sur les auvents, casquettes et claire-voies
 * - NF P 20-302: Conception des menuiseries et éléments d habillage en aluminium
 */

import { getWindPressureForWilaya } from './frictionStayManager';

export type LouverBladeType =
  | 'airfoil_wing_150'
  | 'airfoil_wing_250'
  | 'airfoil_wing_350'
  | 'z_blade_100'
  | 'c_blade_120'
  | 'rectangular_tube_150x30';

export type LouverLayoutType =
  | 'horizontal_canopy_cantilever'
  | 'vertical_facade_screens'
  | 'slanted_pergola_blades';

export type BracketMaterial = 'extruded_alu_6063_t6' | 'galvanized_steel_s235' | 'stainless_steel_316';

export type AnchorSubstrate = 'reinforced_concrete_c25' | 'steel_substructure' | 'solid_brick_masonry';

export interface LouverBladeSpec {
  id: LouverBladeType;
  nameFr: string;
  chordWidthMm: number;
  bladeDepthMm: number;
  linearWeightKgPerM: number;
  momentOfInertiaIxxCm4: number;
  sectionModulusWelCm3: number;
  aerodynamicDragCoefCd: number;
  description: string;
}

export const LOUVER_BLADE_CATALOG: Record<LouverBladeType, LouverBladeSpec> = {
  airfoil_wing_150: {
    id: 'airfoil_wing_150',
    nameFr: 'Aile d Avion 150 mm (Profil Elliptique Extrudé)',
    chordWidthMm: 150,
    bladeDepthMm: 30,
    linearWeightKgPerM: 1.85,
    momentOfInertiaIxxCm4: 24.5,
    sectionModulusWelCm3: 3.25,
    aerodynamicDragCoefCd: 0.65,
    description: 'Lame profilée aérodynamique fine pour casquettes résidentielles et petits auvents.',
  },
  airfoil_wing_250: {
    id: 'airfoil_wing_250',
    nameFr: 'Aile d Avion 250 mm (Gamme Tertiaire Standard)',
    chordWidthMm: 250,
    bladeDepthMm: 45,
    linearWeightKgPerM: 3.40,
    momentOfInertiaIxxCm4: 98.0,
    sectionModulusWelCm3: 7.80,
    aerodynamicDragCoefCd: 0.60,
    description: 'Profil d ombrage architectural universel pour façades tertiaires et hôpitaux.',
  },
  airfoil_wing_350: {
    id: 'airfoil_wing_350',
    nameFr: 'Grande Aile d Avion 350 mm (Haute Portée)',
    chordWidthMm: 350,
    bladeDepthMm: 60,
    linearWeightKgPerM: 5.60,
    momentOfInertiaIxxCm4: 285.0,
    sectionModulusWelCm3: 16.20,
    aerodynamicDragCoefCd: 0.55,
    description: 'Lame monumentale pour portées jusqu à 3.0 m sous vents côtiers violents.',
  },
  z_blade_100: {
    id: 'z_blade_100',
    nameFr: 'Lame en Z 100 mm (Anti-Pluie & Brise-Vue)',
    chordWidthMm: 100,
    bladeDepthMm: 65,
    linearWeightKgPerM: 1.45,
    momentOfInertiaIxxCm4: 14.0,
    sectionModulusWelCm3: 2.10,
    aerodynamicDragCoefCd: 1.25,
    description: 'Lame brise-soleil à double chicane pour grilles de ventilation et coursives techniques.',
  },
  c_blade_120: {
    id: 'c_blade_120',
    nameFr: 'Lame Incurvée en C 120 mm',
    chordWidthMm: 120,
    bladeDepthMm: 40,
    linearWeightKgPerM: 1.65,
    momentOfInertiaIxxCm4: 18.5,
    sectionModulusWelCm3: 2.70,
    aerodynamicDragCoefCd: 1.10,
    description: 'Lame galbée offrant une coupure solaire diffuse et un aspect arrondi fluide.',
  },
  rectangular_tube_150x30: {
    id: 'rectangular_tube_150x30',
    nameFr: 'Tube Rectangulaire 150 x 30 x 2 mm',
    chordWidthMm: 150,
    bladeDepthMm: 30,
    linearWeightKgPerM: 2.10,
    momentOfInertiaIxxCm4: 31.0,
    sectionModulusWelCm3: 4.10,
    aerodynamicDragCoefCd: 0.95,
    description: 'Profil rectangulaire épuré contemporain à arêtes vives pour architecture minimaliste.',
  },
};

export interface BriseSoleilInput {
  layoutType: LouverLayoutType;
  bladeType: LouverBladeType;
  cantileverArmLengthMm: number; // 300 to 1800 mm projection
  bladeSpanMm: number; // distance between bracket supports, e.g. 1200 to 3000 mm
  bladePitchMm: number; // spacing between consecutive blades, e.g. 150 to 350 mm
  bracketHeightMm: number; // fixing plate height, e.g. 150 to 300 mm
  bracketMaterial: BracketMaterial;
  anchorSubstrate: AnchorSubstrate;
  buildingFloorLevel: number; // R+0 to R+20
  wilayaName?: string;
  clientName?: string;
  projectReference?: string;
}

export interface BriseSoleilResult {
  layoutType: LouverLayoutType;
  bladeSpec: LouverBladeSpec;
  cantileverArmLengthMm: number;
  bladeSpanMm: number;
  bladePitchMm: number;
  bladeCountPerBracket: number;
  totalCanopyAreaM2: number;

  // Masses & Dead Loads
  bladesDeadLoadKgPerBracket: number;
  bracketSelfWeightKg: number;
  totalDeadLoadN: number;

  // Aerodynamic Wind Loads (RNV 2013)
  windDynamicPressurePa: number;
  upwardWindSuctionLiftN: number;
  downwardWindPressureN: number;
  governingVerticalLoadN: number;

  // Bracket Stress & Moment (Eurocode 9)
  cantileverBendingMomentNm: number;
  bracketElasticModulusWelCm3: number;
  bracketBendingStressMpa: number;
  allowableBendingStressMpa: number;
  stressUtilizationPercent: number;
  isBracketStressOk: boolean;

  // Cantilever Tip Deflection
  tipDeflectionMm: number;
  allowableDeflectionMm: number;
  isTipDeflectionOk: boolean;

  // Anchoring Pull-Out & Shear Forces
  anchorPlateTensionN: number;
  anchorBoltShearN: number;
  anchorSafetyFactor: number;
  isAnchoringOk: boolean;

  // Thermal Expansion
  thermalExpansionGapMm: number;

  // Compliance & Recommendations
  complianceStatus: 'CONFORME' | 'NON_CONFORME' | 'ATTENTION';
  recommendations: string[];
}

/**
 * Main Calculation Engine for Louver Sunshades & Cantilever Bracket Structural Integrity
 */
export function computeBriseSoleilAudit(input: BriseSoleilInput): BriseSoleilResult {
  const {
    layoutType,
    bladeType,
    cantileverArmLengthMm,
    bladeSpanMm,
    bladePitchMm,
    bracketHeightMm,
    bracketMaterial,
    anchorSubstrate,
    buildingFloorLevel,
    wilayaName = 'Alger',
  } = input;

  const bladeSpec = LOUVER_BLADE_CATALOG[bladeType];

  // Number of blades mounted on the cantilever arm
  const bladeCountPerBracket = Math.max(1, Math.floor(cantileverArmLengthMm / bladePitchMm));
  const canopyWidthM = bladeSpanMm / 1000;
  const canopyProjectionM = cantileverArmLengthMm / 1000;
  const totalCanopyAreaM2 = Math.round(canopyWidthM * canopyProjectionM * 100) / 100;

  // 1. Masses & Dead Load
  const bladesDeadLoadKgPerBracket =
    Math.round(bladeCountPerBracket * (bladeSpanMm / 1000) * bladeSpec.linearWeightKgPerM * 10) / 10;
  let bracketLinearWeightKgM = 3.2; // aluminium bracket default
  if (bracketMaterial === 'galvanized_steel_s235' || bracketMaterial === 'stainless_steel_316') {
    bracketLinearWeightKgM = 8.5; // steel bracket
  }
  const bracketSelfWeightKg = Math.round(canopyProjectionM * bracketLinearWeightKgM * 10) / 10;
  const totalDeadLoadN = Math.round((bladesDeadLoadKgPerBracket + bracketSelfWeightKg) * 9.81 * 10) / 10;

  // 2. Wind Actions (CNERIB DTR BC 2-47 / RNV 2013)
  const baseWindPressurePa = getWindPressureForWilaya(wilayaName);
  const heightFactor = Math.min(2.2, 1.0 + (buildingFloorLevel * 3.0) / 40);
  const windDynamicPressurePa = Math.round(baseWindPressurePa * heightFactor);

  // Aerodynamic Net Lift and Pressure on Cantilever Canopy
  // Under RNV 2013 / Eurocode 1-4 for canopies:
  // Upward suction lift: Cp,net ~ -1.15 to -1.40 (ascendant gust can rip canopy upward)
  // Downward pressure: Cp,net ~ +0.90 to +1.10
  const tributaryAreaM2 = canopyWidthM * canopyProjectionM;
  const suctionCpNet = 1.30 * bladeSpec.aerodynamicDragCoefCd;
  const pressureCpNet = 1.05 * bladeSpec.aerodynamicDragCoefCd;

  const upwardWindSuctionLiftN = Math.round(windDynamicPressurePa * tributaryAreaM2 * suctionCpNet * 10) / 10;
  const downwardWindPressureN = Math.round(windDynamicPressurePa * tributaryAreaM2 * pressureCpNet * 10) / 10;

  // Ultimate Limit State (ULS / ELU) Governing Vertical Load:
  // Combination 1 (Downward): 1.35 * G + 1.50 * Q_wind_down
  // Combination 2 (Upward Uplift): 1.50 * Q_wind_up - 0.90 * G
  const ulsDownwardN = 1.35 * totalDeadLoadN + 1.5 * downwardWindPressureN;
  const ulsUpwardN = 1.5 * upwardWindSuctionLiftN - 0.9 * totalDeadLoadN;
  const governingVerticalLoadN = Math.round(Math.max(ulsDownwardN, ulsUpwardN) * 10) / 10;

  // 3. Cantilever Bending Moment at Root (N.m)
  // Uniformly distributed load over cantilever projection arm L:
  // M_root = F_gov * (L_arm / 2) / 1000
  const cantileverBendingMomentNm = Math.round(governingVerticalLoadN * (canopyProjectionM / 2) * 10) / 10;

  // 4. Bracket Profile Section & Stress (Eurocode 9 / Eurocode 3)
  // Assume hollow rectangular or T-bracket: section modulus Wel depends on projection arm
  let bracketElasticModulusWelCm3 = 18.0; // default for 80x50x4 mm alu console
  let allowableBendingStressMpa = 145.0; // 6063-T6 characteristic yield with safety factor

  if (bracketMaterial === 'galvanized_steel_s235') {
    bracketElasticModulusWelCm3 = 25.0;
    allowableBendingStressMpa = 215.0; // S235 steel
  } else if (bracketMaterial === 'stainless_steel_316') {
    bracketElasticModulusWelCm3 = 22.0;
    allowableBendingStressMpa = 200.0;
  }

  // Adjust bracket section for long projections
  if (cantileverArmLengthMm > 1000) {
    bracketElasticModulusWelCm3 *= 1.6;
  }

  // sigma = M / W (where M in N.mm, W in mm3 => Wel_cm3 * 1000)
  const bracketBendingStressMpa =
    Math.round(((cantileverBendingMomentNm * 1000) / (bracketElasticModulusWelCm3 * 1000)) * 10) / 10;
  const stressUtilizationPercent = Math.round((bracketBendingStressMpa / allowableBendingStressMpa) * 100);
  const isBracketStressOk = stressUtilizationPercent <= 100;

  // 5. Cantilever Tip Deflection under Serviceability Limit State (SLS / ELS)
  // delta_tip = q * L^4 / (8 * E * I) = (F_sls * L^3) / (3 * E * I)
  // E_alu = 70 000 MPa, E_steel = 210 000 MPa
  const eModulusMpa = bracketMaterial === 'extruded_alu_6063_t6' ? 70000 : 210000;
  const bracketMomentInertiaCm4 = bracketElasticModulusWelCm3 * 4.5;
  const bracketMomentInertiaMm4 = bracketMomentInertiaCm4 * 10000;
  const slsForceN = totalDeadLoadN + downwardWindPressureN * 0.6; // SLS combination

  const rawTipDeflectionMm =
    (slsForceN * Math.pow(cantileverArmLengthMm, 3)) / (3 * eModulusMpa * bracketMomentInertiaMm4);
  const tipDeflectionMm = Math.round(rawTipDeflectionMm * 10) / 10;
  const allowableDeflectionMm = Math.round((cantileverArmLengthMm / 200) * 10) / 10;
  const isTipDeflectionOk = tipDeflectionMm <= allowableDeflectionMm;

  // 6. Anchoring Pull-out & Shear Forces
  // Lever arm of anchor plate = bracketHeightMm (typically 200 mm)
  // Tension at top anchors: N_top = M_root / (bracketHeightMm / 1000)
  const anchorPlateTensionN = Math.round(cantileverBendingMomentNm / (bracketHeightMm / 1000));
  const anchorBoltShearN = Math.round(governingVerticalLoadN / 2); // 2 bolts minimum
  
  // Anchor pull-out capacity depending on substrate
  let anchorAllowableTensionN = 4500; // Concrete C25/30 with M10 chemical anchor
  if (anchorSubstrate === 'steel_substructure') {
    anchorAllowableTensionN = 9500; // Bolt through steel flange
  } else if (anchorSubstrate === 'solid_brick_masonry') {
    anchorAllowableTensionN = 2800; // Sieve sleeve in brick
  }

  const anchorSafetyFactor = Math.round((anchorAllowableTensionN / Math.max(10, anchorPlateTensionN)) * 10) / 10;
  const isAnchoringOk = anchorSafetyFactor >= 1.5;

  // 7. Thermal Expansion of Continuous Blades
  // delta_L = alpha * L * delta_T (alpha_alu = 23e-6 /K, delta_T = 55 K in Algeria)
  const thermalExpansionGapMm = Math.round(canopyWidthM * 23e-6 * 55 * 1000 * 10) / 10;

  // 8. Global Status & Recommendations
  let complianceStatus: 'CONFORME' | 'NON_CONFORME' | 'ATTENTION' = 'CONFORME';

  if (!isBracketStressOk || !isAnchoringOk) {
    complianceStatus = 'NON_CONFORME';
  } else if (!isTipDeflectionOk || stressUtilizationPercent > 85 || anchorSafetyFactor < 2.0) {
    complianceStatus = 'ATTENTION';
  }

  const recommendations: string[] = [];

  if (!isBracketStressOk) {
    recommendations.push(
      `Contrainte en pied de console (${bracketBendingStressMpa} MPa) supérieure à la limite admissible (${allowableBendingStressMpa} MPa, taux ${stressUtilizationPercent}%). Augmenter la hauteur de section de la console ou réduire le pas des consoles.`
    );
  }
  if (!isAnchoringOk) {
    recommendations.push(
      `Effort d arrachement sur ancrages hauts (${anchorPlateTensionN} N) excessif pour le support (${anchorSubstrate}). Rallonger la platine de fixation (${bracketHeightMm} mm) pour augmenter le bras de levier ou utiliser un scellement chimique traversant.`
    );
  }
  if (!isTipDeflectionOk) {
    recommendations.push(
      `Flèche en bout de casquette (${tipDeflectionMm} mm) supérieure au seuil L/200 (${allowableDeflectionMm} mm). Prévoir des tirants obliques en inox ou un profilé raidisseur tubulaire.`
    );
  }
  if (thermalExpansionGapMm >= 1.5) {
    recommendations.push(
      `Dilatation thermique longitudinale (${thermalExpansionGapMm} mm) : Prévoir des manchons coulissants avec lumières oblongues tous les 3 mètres pour éviter le flambement des lames en période estivale.`
    );
  }
  if (bladeCountPerBracket >= 5) {
    recommendations.push(
      'Nombre élevé de lames en porte-à-faux : Vérifier la prise au vent ascendante (succion) lors des rafales orageuses qui sollicite les fixations en arrachement inverse.'
    );
  }
  if (complianceStatus === 'CONFORME') {
    recommendations.push(
      `Structure du brise-soleil validée : Consoles stables, flèche sous contrôle (${tipDeflectionMm} mm), ancrages conformes (sécurité ${anchorSafetyFactor}x) et tenue aux rafales RNV 2013 certifiée.`
    );
  }

  return {
    layoutType,
    bladeSpec,
    cantileverArmLengthMm,
    bladeSpanMm,
    bladePitchMm,
    bladeCountPerBracket,
    totalCanopyAreaM2,
    bladesDeadLoadKgPerBracket,
    bracketSelfWeightKg,
    totalDeadLoadN,
    windDynamicPressurePa,
    upwardWindSuctionLiftN,
    downwardWindPressureN,
    governingVerticalLoadN,
    cantileverBendingMomentNm,
    bracketElasticModulusWelCm3,
    bracketBendingStressMpa,
    allowableBendingStressMpa,
    stressUtilizationPercent,
    isBracketStressOk,
    tipDeflectionMm,
    allowableDeflectionMm,
    isTipDeflectionOk,
    anchorPlateTensionN,
    anchorBoltShearN,
    anchorSafetyFactor,
    isAnchoringOk,
    thermalExpansionGapMm,
    complianceStatus,
    recommendations,
  };
}
