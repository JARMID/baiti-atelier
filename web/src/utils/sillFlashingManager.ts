/**
 * Aluminum Window Sill Flashing, Drainage Runoff & Anti-Drumming Manager
 * Normative references:
 * - NF DTU 36.5: Mise en œuvre des fenêtres et portes-fenêtres (Bavettes d appui, relevés latéraux et rejet d eau)
 * - CSTB Cahier 3529: Recommandations professionnelles relatives aux appuis de fenêtres métalliques
 * - NF P 20-302: Caractéristiques des bavettes et appuis préfabriqués en alliage d aluminium
 * - NF EN 12208: Étanchéité à l eau (Classes 1A à 9A / Exx)
 */

export type SillProfileType =
  | 'folded_sheet_15_10'
  | 'folded_sheet_20_10'
  | 'extruded_heavy_sill';

export type AcousticDampenerType =
  | 'none'
  | 'bituminous_membrane_1_5mm'
  | 'epdm_dense_foam_3mm';

export type EndDamType =
  | 'welded_end_caps'
  | 'folded_lateral_ears'
  | 'molded_abs_caps';

export interface SillProfileSpec {
  id: SillProfileType;
  labelFr: string;
  nominalThicknessMm: number;
  material: string;
  weightPerM2Kg: number;
  description: string;
}

export interface AcousticDampenerSpec {
  id: AcousticDampenerType;
  labelFr: string;
  noiseAttenuationDbA: number;
  contactCoveragePercent: number;
  description: string;
}

export const SILL_PROFILE_SPECS: Record<SillProfileType, SillProfileSpec> = {
  folded_sheet_15_10: {
    id: 'folded_sheet_15_10',
    labelFr: 'Tôle Aluminium Pliée 15/10e (1.5 mm)',
    nominalThicknessMm: 1.5,
    material: 'Aluminium 5754 H111 thermolaqué Qualicoat',
    weightPerM2Kg: 4.05,
    description: 'Bavette standard économique pour baies résidentielles de largeur inférieure à 2.0 m.',
  },
  folded_sheet_20_10: {
    id: 'folded_sheet_20_10',
    labelFr: 'Tôle Aluminium Épaisse 20/10e (2.0 mm)',
    nominalThicknessMm: 2.0,
    material: 'Aluminium 5754 H111 haute rigidité',
    weightPerM2Kg: 5.40,
    description: 'Excellente tenue mécanique contre le gauchissement et les chocs pour grandes largeurs.',
  },
  extruded_heavy_sill: {
    id: 'extruded_heavy_sill',
    labelFr: 'Profilé d Appui Extrudé Lourd Monobloc',
    nominalThicknessMm: 2.5,
    material: 'Aluminium 6060 T6 extrudé avec gorge clipsable',
    weightPerM2Kg: 6.80,
    description: 'Profilé rigide haut de gamme intégrant larmier filant et clip sous dormant.',
  },
};

export const ACOUSTIC_DAMPENER_SPECS: Record<AcousticDampenerType, AcousticDampenerSpec> = {
  none: {
    id: 'none',
    labelFr: 'Sans Isolant Phonique (Métal Nu)',
    noiseAttenuationDbA: 0,
    contactCoveragePercent: 0,
    description: 'Bavette métallique nue résonante sous gouttes d orage (niveau sonore jusqu à 68 dBA).',
  },
  bituminous_membrane_1_5mm: {
    id: 'bituminous_membrane_1_5mm',
    labelFr: 'Bande Bitumineuse Auto-Adhésive 1.5 mm',
    noiseAttenuationDbA: 14,
    contactCoveragePercent: 60,
    description: 'Amortisseur viscoélastique standard absorbant l énergie vibratoire des gouttes de pluie.',
  },
  epdm_dense_foam_3mm: {
    id: 'epdm_dense_foam_3mm',
    labelFr: 'Mousse EPDM Haute Densité 3.0 mm',
    noiseAttenuationDbA: 22,
    contactCoveragePercent: 85,
    description: 'Isolation acoustique maximale garantissant un confort intérieur silencieux sous pluies battantes.',
  },
};

export interface SillFlashingInput {
  openingWidthMm: number; // Width of window opening
  wallThroatDepthMm: number; // Distance from window bottom frame to outside facade face (typically 120-280mm)
  dripOverhangMm: number; // Projection beyond finished facade (min 30mm per DTU 36.5)
  sillSlopePercent: number; // Slope percentage (min 5% per DTU 36.5, recommended 8%)
  sillProfile: SillProfileType;
  endDamType: EndDamType;
  acousticDampener: AcousticDampenerType;
  drivingRainPressurePa: number; // 250 Pa (Class 4A) to 900 Pa (Class 9A / E900)
  wilayaName: string;
  clientName?: string;
  projectReference?: string;
}

export interface SillFlashingAuditResult {
  // Developed Geometry & Dimensions
  developedWidthMm: number;
  totalLengthMm: number;
  sillSlopeDegrees: number;
  isSlopeCompliant: boolean; // slope >= 5%
  isDripOverhangCompliant: boolean; // overhang >= 30mm

  // Water Evacuation & Runoff
  peakRainIntensityMmH: number;
  runoffFlowRateLitersPerMin: number;
  waterSpeedMetersPerSec: number;
  riskOfWaterPonding: boolean;

  // Lateral End Dam Safety (Oreilles de retour)
  endDamHeightMm: number;
  isEndDamCompliant: boolean; // height >= 20mm to prevent masonry insulation soaking

  // Acoustic Rain Impact
  rainImpactNoiseDbA: number;
  isAcousticallyComfortable: boolean; // noise <= 48 dBA

  // Mass & Surface
  totalFlashingAreaM2: number;
  totalFlashingWeightKg: number;

  // Overall Status & Recommendations
  overallStatus: 'valid' | 'warning' | 'critical';
  recommendationsFr: string[];
}

export function computeSillFlashingAudit(input: SillFlashingInput): SillFlashingAuditResult {
  const widthM = input.openingWidthMm / 1000;
  const throatM = input.wallThroatDepthMm / 1000;
  const overhangM = input.dripOverhangMm / 1000;

  // Developed width across the sill profile:
  // Back lip under window (18 mm) + slope depth (throat + overhang) + drip downward fold (25 mm) + hem return (8 mm)
  const slopeWidthMm = Math.round(
    Math.sqrt(Math.pow(input.wallThroatDepthMm + input.dripOverhangMm, 2) + Math.pow((input.wallThroatDepthMm + input.dripOverhangMm) * (input.sillSlopePercent / 100), 2))
  );
  const developedWidthMm = 18 + slopeWidthMm + 25 + 8;

  // Total length with lateral end ears: width of opening + 2x 25mm masonry embedment
  const totalLengthMm = input.openingWidthMm + 50;

  // Slope conversion to degrees: tan(theta) = slope% / 100
  const sillSlopeDegrees = parseFloat((Math.atan(input.sillSlopePercent / 100) * (180 / Math.PI)).toFixed(1));
  const isSlopeCompliant = input.sillSlopePercent >= 5.0;
  const isDripOverhangCompliant = input.dripOverhangMm >= 30;

  // End dam evaluation
  let endDamHeightMm = 25;
  if (input.endDamType === 'folded_lateral_ears') endDamHeightMm = 22;
  if (input.endDamType === 'molded_abs_caps') endDamHeightMm = 28;
  const isEndDamCompliant = endDamHeightMm >= 20;

  // Hydraulic Runoff: Mediterranean torrential rain 120 mm/h
  const peakRainIntensityMmH = 120;
  const catchmentAreaM2 = (widthM) * (throatM + overhangM);
  // Flow rate: Area (m2) * intensity (m/h) * 1000 / 60 (liters/min)
  const runoffFlowRateLitersPerMin = parseFloat((catchmentAreaM2 * (peakRainIntensityMmH / 1000) * (1000 / 60)).toFixed(2));

  // Flow velocity approximation via Manning formula on smooth aluminum: v ~ 0.45 m/s at 5% slope, 0.72 m/s at 8%
  const waterSpeedMetersPerSec = parseFloat((0.25 * Math.sqrt(input.sillSlopePercent)).toFixed(2));
  const riskOfWaterPonding = input.sillSlopePercent < 4.0;

  // Acoustic Rain Impact Noise (dBA)
  // Bare aluminum under heavy rain generates ~66 dBA
  const dampener = ACOUSTIC_DAMPENER_SPECS[input.acousticDampener];
  const rainImpactNoiseDbA = Math.round(66 - dampener.noiseAttenuationDbA);
  const isAcousticallyComfortable = rainImpactNoiseDbA <= 48;

  // Mass calculations
  const totalFlashingAreaM2 = parseFloat(((developedWidthMm / 1000) * (totalLengthMm / 1000)).toFixed(3));
  const profileSpec = SILL_PROFILE_SPECS[input.sillProfile];
  const totalFlashingWeightKg = parseFloat((totalFlashingAreaM2 * profileSpec.weightPerM2Kg).toFixed(2));

  // Actionable diagnostics
  const recommendationsFr: string[] = [];

  if (!isSlopeCompliant) {
    recommendationsFr.push(
      `Pente d appui insuffisante (${input.sillSlopePercent}% < 5% minimum DTU 36.5). Risque de stagnation d eau et d infiltration sous la traverse basse. Portez la pente à 8%.`
    );
  }
  if (!isDripOverhangCompliant) {
    recommendationsFr.push(
      `Saillie du larmier trop courte (${input.dripOverhangMm} mm < 30 mm réglementaire DTU 36.5). L eau de pluie risque de ruisseler sur la façade et de créer des salissures noires par capillarité.`
    );
  }
  if (input.acousticDampener === 'none') {
    recommendationsFr.push(
      `Absence d amortisseur phonique sous la bavette. Bruit d impact de pluie élevé (${rainImpactNoiseDbA} dBA). Posez impérativement une bande bitumineuse ou mousse EPDM anti-tambourinage.`
    );
  }
  if (input.openingWidthMm > 2000 && input.sillProfile === 'folded_sheet_15_10') {
    recommendationsFr.push(
      'Grande largeur (> 2.0 m) en tôle 15/10e sujette aux déformations thermiques. Passez sur de la tôle 20/10e ou installez des pattes d arrêt intermédiaires tous les 60 cm.'
    );
  }
  if (recommendationsFr.length === 0) {
    recommendationsFr.push(
      'Conception d appui exemplaire. Écoulement gravitaire fluide, larmier débordant protecteur et amortissement acoustique garantissant un silence parfait.'
    );
  }

  let overallStatus: 'valid' | 'warning' | 'critical' = 'valid';
  if (!isSlopeCompliant || !isDripOverhangCompliant) {
    overallStatus = 'critical';
  } else if (input.acousticDampener === 'none' || (input.openingWidthMm > 2000 && input.sillProfile === 'folded_sheet_15_10')) {
    overallStatus = 'warning';
  }

  return {
    developedWidthMm,
    totalLengthMm,
    sillSlopeDegrees,
    isSlopeCompliant,
    isDripOverhangCompliant,
    peakRainIntensityMmH,
    runoffFlowRateLitersPerMin,
    waterSpeedMetersPerSec,
    riskOfWaterPonding,
    endDamHeightMm,
    isEndDamCompliant,
    rainImpactNoiseDbA,
    isAcousticallyComfortable,
    totalFlashingAreaM2,
    totalFlashingWeightKg,
    overallStatus,
    recommendationsFr,
  };
}
