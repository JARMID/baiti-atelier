/**
 * ARCHITECTURAL HANDLE OPERATING FORCE & ERGONOMICS SAFETY AUDITOR
 * 
 * Normative Framework:
 * - NF EN 12046-1: Forces de manœuvre des fenêtres - Méthodes d'essai
 * - NF EN 13115: Fenêtres - Classification des forces de manœuvre (Classes 1 et 2)
 * - NF EN 13126-3: Quincaillerie pour le bâtiment - Poignées oscillo-battantes, soufflet et battant
 * - NF EN 1906: Poignées de porte et boutons de manœuvre - Exigences et méthodes d'essai
 * - Décret exécutif algérien N° 06-455: Accessibilité des personnes à mobilité réduite (PMR)
 * - NF DTU 36.5: Hauteur de pose des organes de commande et dégagement des mains
 */

export type OperatingForceClass = 'class_1_standard' | 'class_2_pmr';

export type HandleType =
  | 'standard_lever_125'
  | 'ergonomic_extended_175'
  | 'long_crank_220'
  | 'flush_recessed_slider'
  | 'tilt_turn_secustik_135';

export type TransmissionType =
  | 'direct_rack_pinion'
  | 'reduction_geared'
  | 'concealed_slide_rod';

export type CamType = 'fixed_sliding_cam' | 'rotating_roller_cam';

export interface HandleSpec {
  id: HandleType;
  name: string;
  leverArmLengthMm: number;
  gripDiameterMm: number;
  frameClearanceMm: number;
  isPmrApproved: boolean;
  description: string;
}

export const HANDLE_SPECS: Record<HandleType, HandleSpec> = {
  standard_lever_125: {
    id: 'standard_lever_125',
    name: 'Béquille Standard 125 mm',
    leverArmLengthMm: 125,
    gripDiameterMm: 22,
    frameClearanceMm: 48,
    isPmrApproved: false,
    description: 'Poignée battante classique à carré de 7 mm, adaptée à un usage résidentiel courant.',
  },
  ergonomic_extended_175: {
    id: 'ergonomic_extended_175',
    name: 'Béquille Rallongée PMR 175 mm',
    leverArmLengthMm: 175,
    gripDiameterMm: 25,
    frameClearanceMm: 55,
    isPmrApproved: true,
    description: 'Bras de levier accru de 40% avec retour courbé anti-accrochage conforme accessibilité PMR.',
  },
  long_crank_220: {
    id: 'long_crank_220',
    name: 'Poignée à Grand Bras 220 mm',
    leverArmLengthMm: 220,
    gripDiameterMm: 28,
    frameClearanceMm: 60,
    isPmrApproved: true,
    description: 'Démultiplication d effort maximale pour baies lourdes ou personnes en fauteuil roulant.',
  },
  flush_recessed_slider: {
    id: 'flush_recessed_slider',
    name: 'Cuvette Encastrée pour Coulissant',
    leverArmLengthMm: 60,
    gripDiameterMm: 18,
    frameClearanceMm: 35,
    isPmrApproved: false,
    description: 'Poignée affleurante encastrée dans le montant de vantail coulissant sans saillie.',
  },
  tilt_turn_secustik_135: {
    id: 'tilt_turn_secustik_135',
    name: 'Poignée Oscillo-Battante Secustik 135 mm',
    leverArmLengthMm: 135,
    gripDiameterMm: 23,
    frameClearanceMm: 50,
    isPmrApproved: false,
    description: 'Mécanisme autobloquant interne anti-effraction émettant un cliquetis de positionnement.',
  },
};

export interface HandleErgonomicsInput {
  sashWidthMm: number;
  sashHeightMm: number;
  handleType: HandleType;
  transmissionType: TransmissionType;
  camType: CamType;
  lockingPointCount: number; // 2 à 8 points de verrouillage
  targetClass: OperatingForceClass;
  handleHeightFromFloorMm: number; // 900 à 1300 mm selon décret PMR
  gasketType: 'standard_epdm' | 'soft_sponge_epdm' | 'acoustic_double';
  wilayaName?: string;
  clientName?: string;
  windowReference?: string;
}

export interface HandleErgonomicsResult {
  sashWidthMm: number;
  sashHeightMm: number;
  sashPerimeterM: number;
  handleSpec: HandleSpec;
  
  // Friction & Forces
  gasketLinearForceNPerM: number;
  totalGasketResistanceN: number;
  camFrictionForceN: number;
  totalRodOperatingForceN: number;
  
  // Handle Torques & Operating Hand Force (NF EN 12046-1)
  gearRatio: number;
  calculatedHandleTorqueNm: number;
  maxAllowableTorqueNm: number;
  operatingHandForceN: number;
  maxAllowableHandForceN: number;
  
  // PMR Accessibility Evaluation (Décret 06-455)
  isHandleHeightCompliant: boolean;
  isClearanceCompliant: boolean;
  isOperatingForceCompliant: boolean;
  isPmrClassAchieved: boolean;
  
  // Status & Recommendations
  complianceStatus: 'CONFORME' | 'NON_CONFORME' | 'ATTENTION';
  recommendations: string[];
}

/**
 * Main Calculation Engine for Handle Operating Forces & PMR Accessibility
 */
export function computeHandleErgonomicsAudit(input: HandleErgonomicsInput): HandleErgonomicsResult {
  const {
    sashWidthMm,
    sashHeightMm,
    handleType,
    transmissionType,
    camType,
    lockingPointCount,
    targetClass,
    handleHeightFromFloorMm,
    gasketType,
  } = input;

  const handleSpec = HANDLE_SPECS[handleType];
  const sashPerimeterM = Math.round(((2 * (sashWidthMm + sashHeightMm)) / 1000) * 100) / 100;

  // Gasket Compression Resistance (N/m)
  let gasketLinearForceNPerM = 22.0; // standard EPDM
  if (gasketType === 'soft_sponge_epdm') {
    gasketLinearForceNPerM = 14.0; // EPDM cellulaire souple
  } else if (gasketType === 'acoustic_double') {
    gasketLinearForceNPerM = 32.0; // double frappe acoustique renforcée
  }

  const totalGasketResistanceN = Math.round(sashPerimeterM * gasketLinearForceNPerM * 10) / 10;

  // Cam Friction Force:
  // Fixed cam friction coef ~ 0.22, rotating roller cam friction coef ~ 0.08
  const frictionCoef = camType === 'rotating_roller_cam' ? 0.08 : 0.22;
  const rampAngleRad = (20 * Math.PI) / 180; // 20 deg ramp angle
  const compressionPerPointN = totalGasketResistanceN / Math.max(1, lockingPointCount);
  const camFrictionForceN = Math.round(
    lockingPointCount * compressionPerPointN * (Math.sin(rampAngleRad) + frictionCoef * Math.cos(rampAngleRad)) * 10
  ) / 10;

  // Internal rod guide friction (~15 N)
  const rodGuideFrictionN = 15.0;
  const totalRodOperatingForceN = Math.round((camFrictionForceN + rodGuideFrictionN) * 10) / 10;

  // Gear Mechanical Advantage & Pinion Radius
  let pinionRadiusMm = 18.0; // Standard pinion radius
  let gearEfficiency = 0.85;
  let gearRatio = 1.0;

  if (transmissionType === 'reduction_geared') {
    gearRatio = 1.55; // 35% effort reduction
    gearEfficiency = 0.90;
  } else if (transmissionType === 'concealed_slide_rod') {
    gearRatio = 1.15;
    gearEfficiency = 0.88;
  }

  // Handle Torque Calculation (N.m)
  // M = (F_rod * r_pinion / 1000) / (gearRatio * gearEfficiency)
  const rawHandleTorqueNm = (totalRodOperatingForceN * (pinionRadiusMm / 1000)) / (gearRatio * gearEfficiency);
  const calculatedHandleTorqueNm = Math.round(rawHandleTorqueNm * 100) / 100;

  // Hand Operating Force (N)
  // F_hand = M_handle / (L_lever / 1000)
  const leverArmM = handleSpec.leverArmLengthMm / 1000;
  const rawHandForceN = calculatedHandleTorqueNm / leverArmM;
  const operatingHandForceN = Math.round(rawHandForceN * 10) / 10;

  // Thresholds according to NF EN 13115 / NF EN 12046-1
  const isPmrTarget = targetClass === 'class_2_pmr';
  const maxAllowableTorqueNm = isPmrTarget ? 5.0 : 10.0;
  const maxAllowableHandForceN = isPmrTarget ? 20.0 : 50.0;

  // Algerian PMR Accessibility Standards (Décret 06-455)
  // Height must be between 900 mm and 1300 mm (optimal 1050 mm)
  const isHandleHeightCompliant = handleHeightFromFloorMm >= 900 && handleHeightFromFloorMm <= 1300;
  // Frame clearance to prevent hand crushing must be >= 40 mm
  const isClearanceCompliant = handleSpec.frameClearanceMm >= 40;
  // Operating force compliance
  const isOperatingForceCompliant =
    calculatedHandleTorqueNm <= maxAllowableTorqueNm && operatingHandForceN <= maxAllowableHandForceN;

  const isPmrClassAchieved =
    calculatedHandleTorqueNm <= 5.0 &&
    operatingHandForceN <= 20.0 &&
    isHandleHeightCompliant &&
    isClearanceCompliant &&
    handleSpec.isPmrApproved;

  let complianceStatus: 'CONFORME' | 'NON_CONFORME' | 'ATTENTION' = 'CONFORME';
  if (!isOperatingForceCompliant || !isHandleHeightCompliant) {
    complianceStatus = 'NON_CONFORME';
  } else if (!isClearanceCompliant || (!isPmrClassAchieved && isPmrTarget)) {
    complianceStatus = 'ATTENTION';
  }

  // Recommendations construction
  const recommendations: string[] = [];
  if (!isHandleHeightCompliant) {
    recommendations.push(
      `Hauteur de poignée (${handleHeightFromFloorMm} mm) non conforme au Décret exécutif 06-455 (plage obligatoire entre 900 et 1300 mm du sol fini).`
    );
  }
  if (!isOperatingForceCompliant) {
    recommendations.push(
      `Effort de manœuvre excessif (${operatingHandForceN} N > ${maxAllowableHandForceN} N max). Installer une crémone à galets rotatifs ou une transmission démultipliée.`
    );
  }
  if (calculatedHandleTorqueNm > maxAllowableTorqueNm) {
    recommendations.push(
      `Couple sur la poignée (${calculatedHandleTorqueNm} N.m) supérieur à la limite de la ${isPmrTarget ? 'Classe 2 PMR (5.0 N.m)' : 'Classe 1 (10.0 N.m)'}.`
    );
  }
  if (!isClearanceCompliant) {
    recommendations.push(
      `Dégagement main insuffisant (${handleSpec.frameClearanceMm} mm < 40 mm). Risque de coincement des doigts contre le dormant.`
    );
  }
  if (camType === 'fixed_sliding_cam' && lockingPointCount >= 4) {
    recommendations.push(
      'Nombreux points de verrouillage fixes: Remplacer les galets fixes par des galets champignons rotatifs sur roulement pour diviser les frottements par deux.'
    );
  }
  if (isPmrClassAchieved) {
    recommendations.push(
      `Excellente ergonomie conforme au Décret PMR 06-455 et Classe 2 NF EN 13115 (effort doux de ${operatingHandForceN} N, couple ${calculatedHandleTorqueNm} N.m).`
    );
  }

  return {
    sashWidthMm,
    sashHeightMm,
    sashPerimeterM,
    handleSpec,
    gasketLinearForceNPerM,
    totalGasketResistanceN,
    camFrictionForceN,
    totalRodOperatingForceN,
    gearRatio,
    calculatedHandleTorqueNm,
    maxAllowableTorqueNm,
    operatingHandForceN,
    maxAllowableHandForceN,
    isHandleHeightCompliant,
    isClearanceCompliant,
    isOperatingForceCompliant,
    isPmrClassAchieved,
    complianceStatus,
    recommendations,
  };
}
