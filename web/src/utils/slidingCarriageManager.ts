/**
 * Sliding Door Roller Carriage Load, Friction & PMR Operating Force Manager
 * Normative references:
 * - NF EN 13126-15: Building hardware - Requirements and test methods for sliding and lift-and-slide
 * - NF EN 12046-2: Operating forces for sliding doors and windows (Class 1: 100N/50N, Class 2: 50N/30N)
 * - Algerian Executive Decree n° 06-455: Accessibility for persons with reduced mobility (PMR) in ERP and housing
 * - CSTB e-Cahier 3698: Flat threshold and water tightness for heavy sliding joinery
 */

export type CarriageModelType =
  | 'carriage_single_roller_80kg'
  | 'carriage_tandem_pom_160kg'
  | 'carriage_tandem_inox_250kg'
  | 'carriage_lift_slide_300kg'
  | 'carriage_lift_slide_400kg';

export type TrackRailType =
  | 'rail_aluminum_integrated'
  | 'rail_stainless_steel_insert'
  | 'rail_recessed_pmr_flat';

export type BrushSealType =
  | 'brush_standard_fin_seal'
  | 'brush_silicone_tri_fin'
  | 'gasket_epdm_lift_slide';

export interface CarriageModelSpec {
  id: CarriageModelType;
  labelFr: string;
  maxSashLoadKg: number;
  wheelCount: number;
  wheelDiameterMm: number;
  wheelMaterial: string;
  bearingType: string;
  isAdjustableHeight: boolean;
  adjustmentRangeMm: number;
  enduranceClassCycles: number;
  description: string;
}

export interface TrackRailSpec {
  id: TrackRailType;
  labelFr: string;
  material: string;
  frictionCoefficientMu: number;
  thresholdHeightAboveFloorMm: number;
  isPmrCompliant: boolean;
  description: string;
}

export const CARRIAGE_SPECS: Record<CarriageModelType, CarriageModelSpec> = {
  carriage_single_roller_80kg: {
    id: 'carriage_single_roller_80kg',
    labelFr: 'Chariot Simple Réglable 80 kg (Galet Polyamide)',
    maxSashLoadKg: 80,
    wheelCount: 1,
    wheelDiameterMm: 28,
    wheelMaterial: 'Polyamide PA6.6 renforcé fibres de verre',
    bearingType: 'Palier lisse autolubrifiant',
    isAdjustableHeight: true,
    adjustmentRangeMm: 3.5,
    enduranceClassCycles: 15000,
    description: 'Chariot économique pour petits vantaux légers ou impostes coulissantes.',
  },
  carriage_tandem_pom_160kg: {
    id: 'carriage_tandem_pom_160kg',
    labelFr: 'Chariot Double Tandem 160 kg (Galets POM & Roulement Bille)',
    maxSashLoadKg: 160,
    wheelCount: 2,
    wheelDiameterMm: 32,
    wheelMaterial: 'Polyoxyméthylène (POM Delrin haute dureté)',
    bearingType: 'Roulements à billes inox étanches 2RS',
    isAdjustableHeight: true,
    adjustmentRangeMm: 5.0,
    enduranceClassCycles: 25000,
    description: 'Configuration standard pour baies coulissantes 2 et 3 vantaux en double vitrage.',
  },
  carriage_tandem_inox_250kg: {
    id: 'carriage_tandem_inox_250kg',
    labelFr: 'Chariot Double Tandem Lourd 250 kg (Galets Inox 316)',
    maxSashLoadKg: 250,
    wheelCount: 2,
    wheelDiameterMm: 38,
    wheelMaterial: 'Acier inoxydable AISI 316 usiné dans la masse',
    bearingType: 'Roulement à aiguilles haute charge étanche',
    isAdjustableHeight: true,
    adjustmentRangeMm: 6.0,
    enduranceClassCycles: 50000,
    description: 'Pour grands vantaux lourds, vitrages feuilletés acoustiques ou sécurit 44.2/66.2.',
  },
  carriage_lift_slide_300kg: {
    id: 'carriage_lift_slide_300kg',
    labelFr: 'Système Levant-Coulissant 300 kg (Bielles à Galets Inox)',
    maxSashLoadKg: 300,
    wheelCount: 2,
    wheelDiameterMm: 42,
    wheelMaterial: 'Acier inox poli à gorge concave',
    bearingType: 'Double roulement à rouleaux étanches',
    isAdjustableHeight: true,
    adjustmentRangeMm: 4.0,
    enduranceClassCycles: 50000,
    description: 'Vantail surélevé de 7 mm par la poignée, éliminant tout frottement des joints EPDM en translation.',
  },
  carriage_lift_slide_400kg: {
    id: 'carriage_lift_slide_400kg',
    labelFr: 'Système Levant-Coulissant Monumental 400 kg (Bogie 4 Galets)',
    maxSashLoadKg: 400,
    wheelCount: 4,
    wheelDiameterMm: 42,
    wheelMaterial: 'Inox 316L trempé rectifié',
    bearingType: 'Quadruple roulements industriels à aiguilles',
    isAdjustableHeight: true,
    adjustmentRangeMm: 6.0,
    enduranceClassCycles: 50000,
    description: 'Mécanisme pour vantaux panoramiques monumentaux jusqu à 3.5 m de hauteur et triple vitrage.',
  },
};

export const TRACK_SPECS: Record<TrackRailType, TrackRailSpec> = {
  rail_aluminum_integrated: {
    id: 'rail_aluminum_integrated',
    labelFr: 'Rail Aluminium Brut Intégré au Dormant',
    material: 'Aluminium 6060 T6 brut extrudé',
    frictionCoefficientMu: 0.045,
    thresholdHeightAboveFloorMm: 48,
    isPmrCompliant: false,
    description: 'Dormant monobloc économique mais sensible au marquage et à l usure par frottement.',
  },
  rail_stainless_steel_insert: {
    id: 'rail_stainless_steel_insert',
    labelFr: 'Rail Inox Rapporté Tubulaire (Galbe Ø 6 mm)',
    material: 'Acier inoxydable 304 / 316 clipsé',
    frictionCoefficientMu: 0.018,
    thresholdHeightAboveFloorMm: 35,
    isPmrCompliant: false,
    description: 'Surface ultra-lisse inusable garantissant un silence de roulement et un effort minimal.',
  },
  rail_recessed_pmr_flat: {
    id: 'rail_recessed_pmr_flat',
    labelFr: 'Seuil Plat PMR Encastré Affleurant (H < 20 mm)',
    material: 'Rail inox affleurant avec profilé composite isolant',
    frictionCoefficientMu: 0.020,
    thresholdHeightAboveFloorMm: 15,
    isPmrCompliant: true,
    description: 'Conforme au Décret 06-455 pour le passage fluide des fauteuils roulants sans butée.',
  },
};

export interface SlidingCarriageInput {
  sashWidthMm: number;
  sashHeightMm: number;
  glassThicknessMm: number; // Total thickness of glass panes in mm (e.g. 8 for 4/16/4, 12 for 6/16/6, 16 for 44.2/16/44.2)
  profileSeries: 'gamme_45_standard' | 'gamme_67_heavy' | 'lift_slide_120';
  carriageModel: CarriageModelType;
  trackRail: TrackRailType;
  brushSeal: BrushSealType;
  handleLeverLengthMm: number; // typical 130 mm standard to 240 mm lift-and-slide
  wilayaName: string;
  clientName?: string;
  projectReference?: string;
}

export interface SlidingCarriageAuditResult {
  // Mass Breakdown
  glassAreaM2: number;
  glassWeightKg: number;
  profileWeightKg: number;
  hardwareWeightKg: number;
  totalSashWeightKg: number;

  // Carriage Capacity & Loading
  carriagesCount: number;
  loadPerCarriageKg: number;
  ratedMaxLoadPerSashKg: number;
  capacityUtilizationPercent: number;
  isCapacityCompliant: boolean;

  // Operating Forces (NF EN 12046-2 / Décret 06-455 PMR)
  startingFrictionForceN: number; // Effort d'arrachement initial
  motionFrictionForceN: number; // Force de maintien en mouvement continu
  en12046Class: 'classe_1_standard' | 'classe_2_ergonomique' | 'non_conforme';
  isPmrForceCompliant: boolean; // F <= 50 N at handle according to Algerian PMR decree

  // Lift Mechanism Torque (for lift-and-slide)
  isLiftAndSlide: boolean;
  leverOperatingTorqueNm: number;
  handLiftEffortN: number;

  // Threshold Safety
  thresholdStepHeightMm: number;
  isThresholdPmrCompliant: boolean;

  // Overall Status & Recommendations
  overallStatus: 'valid' | 'warning' | 'critical';
  recommendationsFr: string[];
}

export function computeSlidingCarriageAudit(input: SlidingCarriageInput): SlidingCarriageAuditResult {
  const widthM = input.sashWidthMm / 1000;
  const heightM = input.sashHeightMm / 1000;
  const glassAreaM2 = parseFloat((widthM * heightM * 0.82).toFixed(2));

  // Glass weight: 2.5 kg/m2 per mm of glass thickness
  const glassWeightKg = Math.round(glassAreaM2 * input.glassThicknessMm * 2.5);

  // Profile perimeter weight
  const sashPerimeterM = 2 * (widthM + heightM);
  let profileWeightPerM = 2.4; // standard 45mm
  if (input.profileSeries === 'gamme_67_heavy') profileWeightPerM = 3.6;
  if (input.profileSeries === 'lift_slide_120') profileWeightPerM = 5.2;

  const profileWeightKg = Math.round(sashPerimeterM * profileWeightPerM);

  // Hardware: multipoint lock, espagnolette, corner cleats, carriages
  let hardwareWeightKg = 4;
  if (input.carriageModel === 'carriage_lift_slide_300kg' || input.carriageModel === 'carriage_lift_slide_400kg') {
    hardwareWeightKg = 12;
  }

  const totalSashWeightKg = glassWeightKg + profileWeightKg + hardwareWeightKg;

  // Carriage evaluation (always 2 carriages per sliding sash)
  const carriagesCount = 2;
  const loadPerCarriageKg = parseFloat((totalSashWeightKg / carriagesCount).toFixed(1));
  const carriageSpec = CARRIAGE_SPECS[input.carriageModel];
  const trackSpec = TRACK_SPECS[input.trackRail];

  const ratedMaxLoadPerSashKg = carriageSpec.maxSashLoadKg;
  const capacityUtilizationPercent = Math.round((totalSashWeightKg / ratedMaxLoadPerSashKg) * 100);
  const isCapacityCompliant = totalSashWeightKg <= ratedMaxLoadPerSashKg;

  // Friction Forces Calculation (NF EN 12046-2)
  // Normal weight force (N):
  const weightForceN = totalSashWeightKg * 9.81;

  // Weatherstrip friction drag:
  let brushDragN = 18; // standard fin-seal
  if (input.brushSeal === 'brush_silicone_tri_fin') brushDragN = 11;
  if (input.brushSeal === 'gasket_epdm_lift_slide') {
    // Lift and slide lifts above gaskets, so translation drag is zero from gaskets
    brushDragN = 4;
  }

  // Breakaway starting friction coefficient: approx 2.2x rolling friction
  const muRoll = trackSpec.frictionCoefficientMu;
  const startingBreakawayCoeff = muRoll * 2.4;

  const startingFrictionForceN = parseFloat(
    (weightForceN * startingBreakawayCoeff + brushDragN * 1.5).toFixed(1)
  );

  const motionFrictionForceN = parseFloat(
    (weightForceN * muRoll + brushDragN).toFixed(1)
  );

  // NF EN 12046-2 Classification:
  // Class 1: F_start <= 100 N and F_motion <= 50 N
  // Class 2: F_start <= 50 N and F_motion <= 30 N
  let en12046Class: 'classe_1_standard' | 'classe_2_ergonomique' | 'non_conforme' = 'classe_1_standard';
  if (startingFrictionForceN <= 50 && motionFrictionForceN <= 30) {
    en12046Class = 'classe_2_ergonomique';
  } else if (startingFrictionForceN > 100 || motionFrictionForceN > 60) {
    en12046Class = 'non_conforme';
  }

  // Algerian PMR Decree 06-455: Force at handle must be <= 50 N
  const isPmrForceCompliant = startingFrictionForceN <= 50.0;
  const thresholdStepHeightMm = trackSpec.thresholdHeightAboveFloorMm;
  const isThresholdPmrCompliant = trackSpec.isPmrCompliant;

  // Lift-and-Slide Lever Torque Calculation
  const isLiftAndSlide =
    input.carriageModel === 'carriage_lift_slide_300kg' ||
    input.carriageModel === 'carriage_lift_slide_400kg';

  let leverOperatingTorqueNm = 0;
  let handLiftEffortN = 0;

  if (isLiftAndSlide) {
    // Sashes are raised by 7 mm cam stroke
    // Mechanical advantage of internal gear: ratio approx 1:22
    const liftForceRequiredN = weightForceN * 0.65;
    const effectiveCamRadiusM = 0.012;
    leverOperatingTorqueNm = parseFloat(((liftForceRequiredN * effectiveCamRadiusM) / 0.85).toFixed(1));
    const handleLengthM = Math.max(0.12, input.handleLeverLengthMm / 1000);
    handLiftEffortN = parseFloat((leverOperatingTorqueNm / handleLengthM).toFixed(1));
  }

  // Recommendations and Diagnostics
  const recommendationsFr: string[] = [];

  if (!isCapacityCompliant) {
    recommendationsFr.push(
      `Surcharge critique des chariots (${totalSashWeightKg} kg > limite ${ratedMaxLoadPerSashKg} kg). Risque d écrasement des galets. Installez des chariots tandem 250 kg ou un mécanisme levant-coulissant.`
    );
  }
  if (!isPmrForceCompliant) {
    recommendationsFr.push(
      `Effort de démarrage trop élevé (${startingFrictionForceN} N > 50 N max PMR Décret 06-455). Adoptez un rail inox rapporté ou des brosses silicone triple lèvre.`
    );
  }
  if (!isThresholdPmrCompliant) {
    recommendationsFr.push(
      `Hauteur de seuil (${thresholdStepHeightMm} mm) supérieure aux 20 mm réglementaires PMR. Prévoyez un seuil encastré plat avec profil de compensation PMR.`
    );
  }
  if (capacityUtilizationPercent > 80 && isCapacityCompliant) {
    recommendationsFr.push(
      `Chariots chargés à ${capacityUtilizationPercent}% de leur capacité nominale. Prévoir un réglage d aplomb précis pour éviter une usure prématurée des roulements.`
    );
  }
  if (recommendationsFr.length === 0) {
    recommendationsFr.push(
      'Maniabilité parfaite. Glissement silencieux et fluide, effort de manœuvre conforme à la Classe 2 ergonomique et respect intégral du Décret PMR 06-455.'
    );
  }

  let overallStatus: 'valid' | 'warning' | 'critical' = 'valid';
  if (!isCapacityCompliant || startingFrictionForceN > 110) {
    overallStatus = 'critical';
  } else if (!isPmrForceCompliant || !isThresholdPmrCompliant || capacityUtilizationPercent > 85) {
    overallStatus = 'warning';
  }

  return {
    glassAreaM2,
    glassWeightKg,
    profileWeightKg,
    hardwareWeightKg,
    totalSashWeightKg,
    carriagesCount,
    loadPerCarriageKg,
    ratedMaxLoadPerSashKg,
    capacityUtilizationPercent,
    isCapacityCompliant,
    startingFrictionForceN,
    motionFrictionForceN,
    en12046Class,
    isPmrForceCompliant,
    isLiftAndSlide,
    leverOperatingTorqueNm,
    handLiftEffortN,
    thresholdStepHeightMm,
    isThresholdPmrCompliant,
    overallStatus,
    recommendationsFr,
  };
}
