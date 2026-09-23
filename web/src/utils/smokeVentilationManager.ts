/**
 * NATURAL SMOKE & HEAT EXHAUST VENTILATOR (DENFC) AUDITOR
 * 
 * Normative Framework:
 * - NF EN 12101-2: Systèmes pour le contrôle des fumées et de la chaleur - Dispositifs d évacuation naturelle (DENFC)
 * - Arrêté ministériel algérien: Règles de sécurité contre les risques d incendie dans les ERP et IGH
 * - NF S 61-937: Systèmes de sécurité incendie (SSI) - Dispositifs Actionnés de Sécurité (DAS)
 * - CNERIB DTR BC 2-47 (RNV 2013): Actions du vent et surpression sur les exutoires de toiture et façade
 * - NF DTU 36.5: Mise en œuvre des menuiseries et châssis de désenfumage
 */

import { getWindPressureForWilaya } from './frictionStayManager';

export type DenfcInstallationSite =
  | 'facade_vertical_sash'
  | 'roof_pitched_skylight'
  | 'roof_flat_curb_skydome'
  | 'stairwell_head_vent';

export type DenfcActuatorType =
  | 'electric_rack_pinion_24v'
  | 'electric_chain_actuator_24v'
  | 'pneumatic_co2_cylinder'
  | 'electromagnetic_lock_gas_spring';

export type ReliabilityClass = 'Re_50_smoke_only' | 'Re_1000_dual_comfort_smoke';

export type TemperatureClass = 'B_300_30min' | 'B_600_30min';

export interface ActuatorSpec {
  id: DenfcActuatorType;
  nameFr: string;
  nominalThrustForceN: number;
  strokeLengthMm: number;
  openingSpeedMmPerSec: number;
  voltageV: number;
  isDailyVentilationApproved: boolean;
  description: string;
}

export const ACTUATOR_CATALOG: Record<DenfcActuatorType, ActuatorSpec> = {
  electric_rack_pinion_24v: {
    id: 'electric_rack_pinion_24v',
    nameFr: 'Vérin Électrique à Crémaillère 24V DC',
    nominalThrustForceN: 1000,
    strokeLengthMm: 750,
    openingSpeedMmPerSec: 14,
    voltageV: 24,
    isDailyVentilationApproved: true,
    description: 'Vérin mécanique robuste à tige rigide pour vantaux lourds de toiture ou façade.',
  },
  electric_chain_actuator_24v: {
    id: 'electric_chain_actuator_24v',
    nameFr: 'Vérin Électrique à Chaîne Articulée 24V DC',
    nominalThrustForceN: 600,
    strokeLengthMm: 500,
    openingSpeedMmPerSec: 12,
    voltageV: 24,
    isDailyVentilationApproved: true,
    description: 'Actionneur compact discret intégré en feuillure de fenêtre ou traverse haute.',
  },
  pneumatic_co2_cylinder: {
    id: 'pneumatic_co2_cylinder',
    nameFr: 'Vérin Pneumatique CO2 à Cartouche Thermofusible',
    nominalThrustForceN: 1800,
    strokeLengthMm: 800,
    openingSpeedMmPerSec: 35,
    voltageV: 0,
    isDailyVentilationApproved: false,
    description: 'Déclenchement pyrotechnique ou cartouche gaz CO2 68°C/93°C autonome sans alimentation électrique.',
  },
  electromagnetic_lock_gas_spring: {
    id: 'electromagnetic_lock_gas_spring',
    nameFr: 'Verrou Magnétique à Rupture 24V + Vérins à Gaz',
    nominalThrustForceN: 800,
    strokeLengthMm: 600,
    openingSpeedMmPerSec: 25,
    voltageV: 24,
    isDailyVentilationApproved: false,
    description: 'Système à éjection par accumulateurs hydropneumatiques sous coupure de courant SSI.',
  },
};

export interface SmokeVentilationInput {
  installationSite: DenfcInstallationSite;
  actuatorType: DenfcActuatorType;
  sashWidthMm: number;
  sashHeightMm: number;
  openingAngleDeg: number; // 30 deg to 90 deg
  actuatorStrokeMm: number; // 300 to 1000 mm
  glazingType: 'polycarbonate_16mm' | 'polycarbonate_32mm' | 'insulated_double_glass' | 'insulated_opaque_panel';
  roomFloorAreaM2: number; // surface au sol du canton de désenfumage
  targetUsefulRatioPercent: number; // 1% ou 2% selon réglementation ERP
  reliabilityClass: ReliabilityClass;
  temperatureClass: TemperatureClass;
  hasWindDeflectors: boolean; // bavettes brise-vent augmentant le coefficient aéraulique Cv
  wilayaName?: string;
  clientName?: string;
  projectReference?: string;
}

export interface SmokeVentilationResult {
  installationSite: DenfcInstallationSite;
  actuatorSpec: ActuatorSpec;
  sashWidthMm: number;
  sashHeightMm: number;
  openingAngleDeg: number;

  // Areas & Aerodynamic Flow (NF EN 12101-2)
  geometricAreaAgM2: number;
  dischargeCoefficientCv: number;
  aerodynamicUsefulAreaAaM2: number;
  requiredUsefulAreaM2: number;
  usefulAreaRatioPercent: number;
  isUsefulAreaCompliant: boolean;

  // Masses & Gravity Loads
  sashWeightKg: number;
  gravityResistanceN: number;

  // Wind Loads & Opposing Thrust (RNV 2013)
  windDynamicPressurePa: number;
  windOpposingForceN: number;
  totalRequiredActuatorThrustN: number;
  actuatorThrustCapacityN: number;
  thrustCapacityRatioPercent: number;
  isActuatorForceCompliant: boolean;

  // Opening Kinetics & Time
  calculatedOpeningTimeSeconds: number;
  maxAllowableOpeningTimeSeconds: number;
  isOpeningTimeCompliant: boolean;

  // Safety and Standards
  reliabilityClass: ReliabilityClass;
  temperatureClass: TemperatureClass;

  // Compliance Status & Recommendations
  complianceStatus: 'CONFORME' | 'NON_CONFORME' | 'ATTENTION';
  recommendations: string[];
}

/**
 * Main Calculation Engine for Natural Smoke and Heat Exhaust Ventilators (DENFC)
 */
export function computeSmokeVentilationAudit(input: SmokeVentilationInput): SmokeVentilationResult {
  const {
    installationSite,
    actuatorType,
    sashWidthMm,
    sashHeightMm,
    openingAngleDeg,
    actuatorStrokeMm,
    glazingType,
    roomFloorAreaM2,
    targetUsefulRatioPercent,
    reliabilityClass,
    temperatureClass,
    hasWindDeflectors,
    wilayaName = 'Alger',
  } = input;

  const actuatorSpec = ACTUATOR_CATALOG[actuatorType];
  const widthM = sashWidthMm / 1000;
  const heightM = sashHeightMm / 1000;
  const geometricAreaAgM2 = Math.round(widthM * heightM * 100) / 100;

  // 1. Aerodynamic Discharge Coefficient (Cv) according to NF EN 12101-2 Annexe B
  // Cv depends on opening angle theta, presence of side deflectors, and installation site
  let baseCv = 0.40;
  if (openingAngleDeg >= 60) {
    baseCv = 0.62;
  } else if (openingAngleDeg >= 45) {
    baseCv = 0.54;
  } else if (openingAngleDeg >= 30) {
    baseCv = 0.46;
  }

  // Deflector bonus (+0.08 to +0.12) by channeling exhaust flow against wind
  if (hasWindDeflectors) {
    baseCv += 0.08;
  }

  // Site factor (roof flat vs vertical facade)
  if (installationSite === 'facade_vertical_sash') {
    baseCv *= 0.90; // lateral wind eddies reduce vertical draft
  }

  const dischargeCoefficientCv = Math.round(Math.min(0.75, baseCv) * 100) / 100;
  const aerodynamicUsefulAreaAaM2 = Math.round(geometricAreaAgM2 * dischargeCoefficientCv * 100) / 100;

  // Required useful area based on room canton area (typically 1% or 2%)
  const requiredUsefulAreaM2 = Math.round(((roomFloorAreaM2 * targetUsefulRatioPercent) / 100) * 100) / 100;
  const usefulAreaRatioPercent = Math.round((aerodynamicUsefulAreaAaM2 / Math.max(0.1, requiredUsefulAreaM2)) * 100);
  const isUsefulAreaCompliant = aerodynamicUsefulAreaAaM2 >= requiredUsefulAreaM2;

  // 2. Sash Weight Calculation
  let panelWeightKgPerM2 = 2.5; // Polycarbonate 16 mm default
  if (glazingType === 'polycarbonate_32mm') {
    panelWeightKgPerM2 = 3.8;
  } else if (glazingType === 'insulated_double_glass') {
    panelWeightKgPerM2 = 22.0; // 4/16/4
  } else if (glazingType === 'insulated_opaque_panel') {
    panelWeightKgPerM2 = 8.5; // Alu sandwich panel
  }

  const aluminiumProfileFrameWeightKg = (2 * (widthM + heightM)) * 2.2;
  const panelTotalWeightKg = geometricAreaAgM2 * panelWeightKgPerM2;
  const sashWeightKg = Math.round((panelTotalWeightKg + aluminiumProfileFrameWeightKg + 4.0) * 10) / 10;

  // Gravity resistance opposing opening
  // For roof vents: F_g = M * g * cos(pitch)
  // For vertical facades: F_g = M * g * sin(theta / 2)
  let gravityFactor = 0.85; // roof vent default
  if (installationSite === 'facade_vertical_sash') {
    gravityFactor = Math.sin((openingAngleDeg * Math.PI) / 360);
  }
  const gravityResistanceN = Math.round(sashWeightKg * 9.81 * gravityFactor);

  // 3. Wind Resistance (CNERIB DTR BC 2-47 / RNV 2013)
  const baseWindPressurePa = getWindPressureForWilaya(wilayaName);
  const windDynamicPressurePa = Math.round(baseWindPressurePa * 1.15); // height and topography factor
  
  // Wind opposing opening force: P * Ag * sin(angle)
  const projectedOpeningSin = Math.sin((openingAngleDeg * Math.PI) / 180);
  const windOpposingForceN = Math.round(windDynamicPressurePa * geometricAreaAgM2 * projectedOpeningSin * 0.75);

  // Total required actuator thrust with safety factor 1.25
  const totalRequiredActuatorThrustN = Math.round((gravityResistanceN + windOpposingForceN) * 1.25);
  const actuatorThrustCapacityN = actuatorSpec.nominalThrustForceN;
  const thrustCapacityRatioPercent = Math.round((totalRequiredActuatorThrustN / actuatorThrustCapacityN) * 100);
  const isActuatorForceCompliant = totalRequiredActuatorThrustN <= actuatorThrustCapacityN;

  // 4. Opening Time under Emergency Alarm (NF EN 12101-2 requires <= 60 seconds)
  const maxAllowableOpeningTimeSeconds = 60;
  const effectiveStrokeMm = Math.min(actuatorSpec.strokeLengthMm, actuatorStrokeMm);
  const rawOpeningTimeSec = effectiveStrokeMm / actuatorSpec.openingSpeedMmPerSec;
  const calculatedOpeningTimeSeconds = Math.round(rawOpeningTimeSec * 10) / 10;
  const isOpeningTimeCompliant = calculatedOpeningTimeSeconds <= maxAllowableOpeningTimeSeconds;

  // 5. Global Compliance & Recommendations
  let complianceStatus: 'CONFORME' | 'NON_CONFORME' | 'ATTENTION' = 'CONFORME';

  if (!isUsefulAreaCompliant || !isActuatorForceCompliant || !isOpeningTimeCompliant) {
    complianceStatus = 'NON_CONFORME';
  } else if (thrustCapacityRatioPercent > 85 || usefulAreaRatioPercent < 115) {
    complianceStatus = 'ATTENTION';
  }

  const recommendations: string[] = [];

  if (!isUsefulAreaCompliant) {
    recommendations.push(
      `Surface utile d évacuation des fumées insuffisante (${aerodynamicUsefulAreaAaM2} m² < ${requiredUsefulAreaM2} m² requis pour le canton de ${roomFloorAreaM2} m²). Augmenter les dimensions du vantail ou l angle d ouverture.`
    );
  }
  if (!isActuatorForceCompliant) {
    recommendations.push(
      `Poussée du vérin insuffisante (${actuatorThrustCapacityN} N < ${totalRequiredActuatorThrustN} N requis sous vent RNV 2013). Installer un vérin plus puissant (1000 N ou vérin pneumatique CO2).`
    );
  }
  if (!isOpeningTimeCompliant) {
    recommendations.push(
      `Temps d ouverture (${calculatedOpeningTimeSeconds} s) supérieur à la limite réglementaire NF EN 12101-2 (60 secondes max sous alarme incendie).`
    );
  }
  if (!hasWindDeflectors && installationSite !== 'facade_vertical_sash') {
    recommendations.push(
      'Installation de bavettes déflectrices latérales recommandée pour améliorer le coefficient aéraulique Cv de +15% et neutraliser l effet rabattant du vent.'
    );
  }
  if (reliabilityClass === 'Re_1000_dual_comfort_smoke' && !actuatorSpec.isDailyVentilationApproved) {
    recommendations.push(
      'Le mécanisme pneumatique n est pas homologué pour l aération quotidienne. Utiliser un vérin électrique 24V double fonction confort/désenfumage.'
    );
  }
  if (complianceStatus === 'CONFORME') {
    recommendations.push(
      `DENFC conforme aux normes NF EN 12101-2 et SSI : Surface utile (${aerodynamicUsefulAreaAaM2} m²), poussée vérin sécurisée (${thrustCapacityRatioPercent}%), ouverture rapide en ${calculatedOpeningTimeSeconds}s.`
    );
  }

  return {
    installationSite,
    actuatorSpec,
    sashWidthMm,
    sashHeightMm,
    openingAngleDeg,
    geometricAreaAgM2,
    dischargeCoefficientCv,
    aerodynamicUsefulAreaAaM2,
    requiredUsefulAreaM2,
    usefulAreaRatioPercent,
    isUsefulAreaCompliant,
    sashWeightKg,
    gravityResistanceN,
    windDynamicPressurePa,
    windOpposingForceN,
    totalRequiredActuatorThrustN,
    actuatorThrustCapacityN,
    thrustCapacityRatioPercent,
    isActuatorForceCompliant,
    calculatedOpeningTimeSeconds,
    maxAllowableOpeningTimeSeconds,
    isOpeningTimeCompliant,
    reliabilityClass,
    temperatureClass,
    complianceStatus,
    recommendations,
  };
}
