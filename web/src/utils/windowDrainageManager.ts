/**
 * WINDOW DRAINAGE & WATER EVACUATION AUDITOR (DRAINAGE ET ETANCHEITE A L'EAU)
 * 
 * Normative Framework:
 * - NF DTU 36.5 P1-1 et P1-2: Mise en œuvre des fenêtres et portes extérieures (Drainage et décompression)
 * - NF P 20-302: Caractéristiques des profilés en alliage d'aluminium pour fenêtres et portes-fenêtres
 * - NF EN 1027: Fenêtres et portes - Étanchéité à l'eau - Méthode d'essai sous pression d'air pulsée
 * - NF EN 12208: Fenêtres et portes - Étanchéité à l'eau - Classification (Classes 1A à 9A et Exxx)
 * - Cahier CSTB 3529: Recommandations professionnelles sur l'évacuation des eaux de pluie en feuillure
 * - DTR BC 2-47 RNV 2013: Règlement Neige et Vent Algérie (Pressions dynamiques de pointe)
 */

export type WaterTightnessClass =
  | 'class_3a'
  | 'class_5a'
  | 'class_7a'
  | 'class_9a'
  | 'class_e750'
  | 'class_e900'
  | 'class_e1200';

export type DrainageSlotType =
  | 'oblong_5x30'
  | 'oblong_8x30'
  | 'oblong_5x20'
  | 'circular_8'
  | 'circular_double_6'
  | 'concealed_bottom';

export type ProfileFamily =
  | 'alu_thermal_break'
  | 'alu_standard_cold'
  | 'pvc_multichamber'
  | 'sliding_patio_track';

export type ExposureSite = 'sheltered' | 'normal' | 'exposed_coastal';

export interface WaterTightnessSpec {
  classId: WaterTightnessClass;
  name: string;
  testPressurePa: number;
  equivalentWindSpeedKmH: number;
  hydrostaticHeadMm: number;
  description: string;
}

export const WATER_TIGHTNESS_SPECS: Record<WaterTightnessClass, WaterTightnessSpec> = {
  class_3a: {
    classId: 'class_3a',
    name: 'Classe 3A (100 Pa)',
    testPressurePa: 100,
    equivalentWindSpeedKmH: 45,
    hydrostaticHeadMm: 10.2,
    description: 'Etanchéité de base pour bâtiments abrités en rez-de-chaussée.',
  },
  class_5a: {
    classId: 'class_5a',
    name: 'Classe 5A (200 Pa)',
    testPressurePa: 200,
    equivalentWindSpeedKmH: 64,
    hydrostaticHeadMm: 20.4,
    description: 'Exposition standard pour habitat individuel en zone urbaine.',
  },
  class_7a: {
    classId: 'class_7a',
    name: 'Classe 7A (300 Pa)',
    testPressurePa: 300,
    equivalentWindSpeedKmH: 78,
    hydrostaticHeadMm: 30.6,
    description: 'Bâtiments collectifs R+4 en zone semi-exposée.',
  },
  class_9a: {
    classId: 'class_9a',
    name: 'Classe 9A (600 Pa)',
    testPressurePa: 600,
    equivalentWindSpeedKmH: 110,
    hydrostaticHeadMm: 61.2,
    description: 'Haute étanchéité pour littoral et immeubles de moyenne hauteur (R+8).',
  },
  class_e750: {
    classId: 'class_e750',
    name: 'Classe E750 (750 Pa)',
    testPressurePa: 750,
    equivalentWindSpeedKmH: 123,
    hydrostaticHeadMm: 76.5,
    description: 'Classe exceptionnelle pour façades exposées au vent violent et pluie battante.',
  },
  class_e900: {
    classId: 'class_e900',
    name: 'Classe E900 (900 Pa)',
    testPressurePa: 900,
    equivalentWindSpeedKmH: 135,
    hydrostaticHeadMm: 91.7,
    description: 'Exposition sévère front de mer ou altitude élevée (falaises, tours).',
  },
  class_e1200: {
    classId: 'class_e1200',
    name: 'Classe E1200 (1200 Pa)',
    testPressurePa: 1200,
    equivalentWindSpeedKmH: 156,
    hydrostaticHeadMm: 122.3,
    description: 'Immeubles de grande hauteur IGH et conditions climatiques extrêmes.',
  },
};

export interface DrainageSlotSpec {
  id: DrainageSlotType;
  name: string;
  widthMm: number;
  heightMm: number;
  slotAreaMm2: number;
  recommendedMachining: string;
  isConcealed: boolean;
}

export const DRAINAGE_SLOT_SPECS: Record<DrainageSlotType, DrainageSlotSpec> = {
  oblong_5x30: {
    id: 'oblong_5x30',
    name: 'Lumière Oblongue 5 x 30 mm (Standard)',
    widthMm: 30,
    heightMm: 5,
    slotAreaMm2: 150,
    recommendedMachining: 'Fraisage avec fraise 5 mm sur centre d usinage ou grugeuse',
    isConcealed: false,
  },
  oblong_8x30: {
    id: 'oblong_8x30',
    name: 'Lumière Oblongue 8 x 30 mm (Grand Débit)',
    widthMm: 30,
    heightMm: 8,
    slotAreaMm2: 240,
    recommendedMachining: 'Fraisage 8 mm haute capacité pour régions à pluviométrie intense',
    isConcealed: false,
  },
  oblong_5x20: {
    id: 'oblong_5x20',
    name: 'Lumière Oblongue 5 x 20 mm (Compacte)',
    widthMm: 20,
    heightMm: 5,
    slotAreaMm2: 100,
    recommendedMachining: 'Fraisage compact pour profilés à feuillure étroite',
    isConcealed: false,
  },
  circular_8: {
    id: 'circular_8',
    name: 'Perçage Circulaire Diamètre 8 mm',
    widthMm: 8,
    heightMm: 8,
    slotAreaMm2: 50.3,
    recommendedMachining: 'Perçage rapide foret hélicoïdal 8 mm avec busette ronde',
    isConcealed: false,
  },
  circular_double_6: {
    id: 'circular_double_6',
    name: 'Double Perçage Diamètre 6 mm',
    widthMm: 12,
    heightMm: 6,
    slotAreaMm2: 56.5,
    recommendedMachining: 'Deux trous de 6 mm espacés de 15 mm',
    isConcealed: false,
  },
  concealed_bottom: {
    id: 'concealed_bottom',
    name: 'Drainage Invisible en Sous-Face (Bavette)',
    widthMm: 25,
    heightMm: 5,
    slotAreaMm2: 125,
    recommendedMachining: 'Usinage sous-face dormant vers pièce d appui ou bavette alu',
    isConcealed: true,
  },
};

export interface WindowDrainageInput {
  widthMm: number;
  heightMm: number;
  targetClass: WaterTightnessClass;
  slotType: DrainageSlotType;
  profileFamily: ProfileFamily;
  exposureSite: ExposureSite;
  upstandHeightMm: number; // Hauteur de gorge / remontée d'étanchéité du profil (ex: 20, 25, 35, 50 mm)
  userWeepHoleCount?: number; // Nombre configuré manuellement (facultatif)
  hasAntiReturnFlaps: boolean; // Clapets anti-retour silicone
  hasExteriorDeflectors: boolean; // Busettes / déflecteurs pare-vent
  wilayaName?: string;
  clientName?: string;
  windowReference?: string;
}

export interface WeepHolePosition {
  index: number;
  coordinateXMm: number; // Distance par rapport au bord gauche
  label: string;
}

export interface WindowDrainageResult {
  widthMm: number;
  heightMm: number;
  glazingAreaM2: number;
  targetClassSpec: WaterTightnessSpec;
  slotSpec: DrainageSlotSpec;
  
  // Hydraulic & Evacuation Requirements
  rainfallIntensityLMinM2: number;
  estimatedWaterInflowLMin: number;
  dischargeCapacityPerHoleLMin: number;
  totalDischargeCapacityLMin: number;
  hydraulicSafetyFactor: number;
  
  // Required Holes Count (NF DTU 36.5)
  minimumRequiredHoles: number;
  recommendedHolesCount: number;
  actualHolesCount: number;
  decompressionVentsCount: number;
  maxSpacingMm: number;
  actualSpacingMm: number;
  weepHolePositions: WeepHolePosition[];
  
  // Hydrostatic Water Head vs Profile Upstand
  testPressurePa: number;
  hydrostaticHeadMm: number;
  upstandHeightMm: number;
  upstandSafetyMarginMm: number;
  isUpstandSufficient: boolean;
  requiresAntiReturnFlap: boolean;
  requiresExteriorDeflector: boolean;
  
  // Compliance
  isHolesCountCompliant: boolean;
  isSectionAreaCompliant: boolean;
  isSpacingCompliant: boolean;
  isWaterTightnessFeasible: boolean;
  complianceStatus: 'CONFORME' | 'NON_CONFORME' | 'ATTENTION';
  recommendations: string[];
}

/**
 * Main Calculation Engine for Window Drainage & Weep Holes (NF DTU 36.5 / NF EN 12208)
 */
export function computeWindowDrainageAudit(input: WindowDrainageInput): WindowDrainageResult {
  const {
    widthMm,
    heightMm,
    targetClass,
    slotType,
    profileFamily,
    exposureSite,
    upstandHeightMm,
    userWeepHoleCount,
    hasAntiReturnFlaps,
    hasExteriorDeflectors,
  } = input;

  const targetClassSpec = WATER_TIGHTNESS_SPECS[targetClass];
  const slotSpec = DRAINAGE_SLOT_SPECS[slotType];

  const glazingAreaM2 = Math.round(((widthMm * heightMm) / 1000000) * 1000) / 1000;

  // Rainfall intensity under wind-driven rain (L/(min.m2))
  let rainfallIntensityLMinM2 = 2.0; // Standard NF EN 1027
  if (exposureSite === 'exposed_coastal') {
    rainfallIntensityLMinM2 = 3.5;
  } else if (exposureSite === 'sheltered') {
    rainfallIntensityLMinM2 = 1.2;
  }

  const estimatedWaterInflowLMin = Math.round(glazingAreaM2 * rainfallIntensityLMinM2 * 0.15 * 100) / 100; // 15% reaches rebate

  // Minimum required weep holes by NF DTU 36.5:
  // - Minimum 2 holes for width <= 1000 mm
  // - Minimum 3 holes for 1000 < width <= 1600 mm
  // - Minimum 4 holes for 1600 < width <= 2400 mm
  // - +1 hole per 600 mm beyond 2400 mm
  let minimumRequiredHoles = 2;
  if (widthMm > 2400) {
    minimumRequiredHoles = 4 + Math.ceil((widthMm - 2400) / 600);
  } else if (widthMm > 1600) {
    minimumRequiredHoles = 4;
  } else if (widthMm > 1000) {
    minimumRequiredHoles = 3;
  }

  // Sliding patio tracks require 1 additional hole per rail
  if (profileFamily === 'sliding_patio_track') {
    minimumRequiredHoles = Math.max(minimumRequiredHoles, 3);
  }

  const recommendedHolesCount = minimumRequiredHoles;
  const actualHolesCount = userWeepHoleCount && userWeepHoleCount > 0 ? userWeepHoleCount : recommendedHolesCount;

  // Decompression Vents (NF DTU 36.5 § 5.3):
  // At least 2 decompression vents in upper or lateral corners
  const decompressionVentsCount = 2;

  // Spacing and coordinates
  const cornerOffsetMm = Math.min(150, Math.max(50, Math.round(widthMm * 0.08)));
  const usableWidthMm = widthMm - 2 * cornerOffsetMm;
  const actualSpacingMm = actualHolesCount > 1 ? Math.round(usableWidthMm / (actualHolesCount - 1)) : 0;
  const maxAllowedSpacingMm = 600; // NF DTU 36.5 maximum spacing 600 mm

  const weepHolePositions: WeepHolePosition[] = [];
  if (actualHolesCount === 1) {
    weepHolePositions.push({
      index: 1,
      coordinateXMm: Math.round(widthMm / 2),
      label: 'Drainage central',
    });
  } else {
    for (let i = 0; i < actualHolesCount; i++) {
      const coordX = Math.round(cornerOffsetMm + i * (usableWidthMm / (actualHolesCount - 1)));
      let label = `Drainage intermédiaire ${i + 1}`;
      if (i === 0) label = 'Drainage angle gauche';
      if (i === actualHolesCount - 1) label = 'Drainage angle droit';
      weepHolePositions.push({
        index: i + 1,
        coordinateXMm: coordX,
        label,
      });
    }
  }

  // Discharge capacity (Torricelli gravity drain: Q = Cd * A * sqrt(2 * g * h_eff))
  // For a slot of area A with ~10mm hydraulic head: ~1.2 to 2.5 L/min per slot
  const dischargeCapacityPerHoleLMin = Math.round((slotSpec.slotAreaMm2 / 100) * 1.4 * 10) / 10;
  const totalDischargeCapacityLMin = Math.round(actualHolesCount * dischargeCapacityPerHoleLMin * 10) / 10;
  const hydraulicSafetyFactor = estimatedWaterInflowLMin > 0
    ? Math.round((totalDischargeCapacityLMin / estimatedWaterInflowLMin) * 10) / 10
    : 10.0;

  // Hydrostatic Water Head vs Upstand Height
  const testPressurePa = targetClassSpec.testPressurePa;
  const hydrostaticHeadMm = Math.round(targetClassSpec.hydrostaticHeadMm * 10) / 10;
  const upstandSafetyMarginMm = Math.round((upstandHeightMm - hydrostaticHeadMm) * 10) / 10;
  
  // Upstand sufficiency
  const isUpstandSufficient = upstandHeightMm >= hydrostaticHeadMm;
  const requiresAntiReturnFlap = !isUpstandSufficient || testPressurePa >= 300;
  const requiresExteriorDeflector = !slotSpec.isConcealed && testPressurePa >= 200;

  // Compliance checks
  const isHolesCountCompliant = actualHolesCount >= minimumRequiredHoles;
  const isSectionAreaCompliant = slotSpec.slotAreaMm2 >= 50; // NF DTU 36.5 specifies >= 50 mm2
  const isSpacingCompliant = actualSpacingMm <= maxAllowedSpacingMm;

  let isWaterTightnessFeasible = isHolesCountCompliant && isSectionAreaCompliant;
  if (!isUpstandSufficient && !hasAntiReturnFlaps) {
    isWaterTightnessFeasible = false;
  }

  let complianceStatus: 'CONFORME' | 'NON_CONFORME' | 'ATTENTION' = 'CONFORME';
  if (!isWaterTightnessFeasible) {
    complianceStatus = 'NON_CONFORME';
  } else if (
    !isSpacingCompliant ||
    (!hasExteriorDeflectors && requiresExteriorDeflector) ||
    (!hasAntiReturnFlaps && requiresAntiReturnFlap)
  ) {
    complianceStatus = 'ATTENTION';
  }

  // Recommendations construction
  const recommendations: string[] = [];
  if (!isHolesCountCompliant) {
    recommendations.push(
      `Nombre de drainages insuffisant: ${actualHolesCount} prévu(s) contre ${minimumRequiredHoles} exigé(s) par le NF DTU 36.5 pour une largeur de ${widthMm} mm.`
    );
  }
  if (!isSpacingCompliant) {
    recommendations.push(
      `Entraxe de drainage excessif (${actualSpacingMm} mm). Le NF DTU 36.5 impose un espacement maximal de 600 mm.`
    );
  }
  if (!isUpstandSufficient) {
    recommendations.push(
      `Hauteur de gorge (${upstandHeightMm} mm) inférieure à la colonne hydrostatique (${hydrostaticHeadMm} mm à ${testPressurePa} Pa). Des clapets anti-retour à membrane silicone sont obligatoires.`
    );
  }
  if (requiresAntiReturnFlap && !hasAntiReturnFlaps) {
    recommendations.push(
      `Pression d'essai de ${testPressurePa} Pa (Classe ${targetClassSpec.name}): Poser impérativement des clapets anti-retour pour empêcher le refoulement de l'eau par le vent.`
    );
  }
  if (requiresExteriorDeflector && !hasExteriorDeflectors) {
    recommendations.push(
      'Usinages débouchants en façade: Poser des busettes déflectrices pare-vent avec grille anti-insectes sur chaque lumière extérieure.'
    );
  }
  if (profileFamily === 'pvc_multichamber') {
    recommendations.push(
      'Profil PVC: Décaler les usinages de drainage intérieur et extérieur d au moins 50 mm pour préserver l isolation thermique et la décompression.'
    );
  }
  if (isWaterTightnessFeasible && complianceStatus === 'CONFORME') {
    recommendations.push(
      `Drainage parfaitement calibré pour la Classe ${targetClassSpec.name} (${testPressurePa} Pa) avec un facteur de sécurité hydraulique de ${hydraulicSafetyFactor}.`
    );
  }

  return {
    widthMm,
    heightMm,
    glazingAreaM2,
    targetClassSpec,
    slotSpec,
    rainfallIntensityLMinM2,
    estimatedWaterInflowLMin,
    dischargeCapacityPerHoleLMin,
    totalDischargeCapacityLMin,
    hydraulicSafetyFactor,
    minimumRequiredHoles,
    recommendedHolesCount,
    actualHolesCount,
    decompressionVentsCount,
    maxSpacingMm: maxAllowedSpacingMm,
    actualSpacingMm,
    weepHolePositions,
    testPressurePa,
    hydrostaticHeadMm,
    upstandHeightMm,
    upstandSafetyMarginMm,
    isUpstandSufficient,
    requiresAntiReturnFlap,
    requiresExteriorDeflector,
    isHolesCountCompliant,
    isSectionAreaCompliant,
    isSpacingCompliant,
    isWaterTightnessFeasible,
    complianceStatus,
    recommendations,
  };
}
