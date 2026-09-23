/**
 * Bioclimatic Pergola Structural, Aerodynamic & Hydraulic Manager
 * Normative references:
 * - Eurocode 9 (NF EN 1999-1-1): Design of aluminum structures (EN AW-6060/6063 T6)
 * - Eurocode 1 (NF EN 1991-1-3 / NF EN 1991-1-4): Snow and wind actions on canopies
 * - CNERIB DTR BC 2-47 RNV 2013: Algerian wind pressures (Zones I to IV) and snow zones
 * - CSTB Guide Pergolas Bioclimatiques: Slat deflection, joint water tightness, wind uplift
 * - NF EN 12056-3: Roof drainage systems and internal downspout sizing
 */

export type PergolaTypology =
  | 'freestanding_4_posts'
  | 'wall_mounted_2_posts'
  | 'between_walls_no_posts'
  | 'double_bay_6_posts';

export type PergolaSlatModel =
  | 'slat_160_standard'
  | 'slat_200_reinforced'
  | 'slat_210_aerofoil'
  | 'slat_250_heavy_duty';

export type PergolaPostModel =
  | 'post_120x120'
  | 'post_150x150'
  | 'post_200x200';

export type PergolaBeamModel =
  | 'beam_180x100'
  | 'beam_240x120'
  | 'beam_280x150';

export interface SlatModelSpec {
  id: PergolaSlatModel;
  labelFr: string;
  widthMm: number;
  heightMm: number;
  wallThicknessMm: number;
  weightKgPerM: number;
  momentOfInertiaIxCm4: number;
  sectionModulusWxCm3: number;
  maxRecommendedSpanM: number;
  hasCoextrudedGasket: boolean;
  description: string;
}

export interface PostModelSpec {
  id: PergolaPostModel;
  labelFr: string;
  dimensionMm: number;
  wallThicknessMm: number;
  weightKgPerM: number;
  internalDownspoutDiameterMm: number;
  momentOfInertiaIxCm4: number;
  description: string;
}

export interface BeamModelSpec {
  id: PergolaBeamModel;
  labelFr: string;
  heightMm: number;
  widthMm: number;
  wallThicknessMm: number;
  weightKgPerM: number;
  momentOfInertiaIxCm4: number;
  sectionModulusWxCm3: number;
  gutterWidthMm: number;
  gutterDepthMm: number;
  gutterCrossSectionCm2: number;
  description: string;
}

export const SLAT_SPECS: Record<PergolaSlatModel, SlatModelSpec> = {
  slat_160_standard: {
    id: 'slat_160_standard',
    labelFr: 'Lame 160 mm Simple Paroi Tubulaire',
    widthMm: 160,
    heightMm: 35,
    wallThicknessMm: 1.8,
    weightKgPerM: 2.15,
    momentOfInertiaIxCm4: 32.5,
    sectionModulusWxCm3: 5.4,
    maxRecommendedSpanM: 3.5,
    hasCoextrudedGasket: true,
    description: 'Profil léger économique idéal pour petites terrasses résidentielles jusqu à 3.5 m de portée.',
  },
  slat_200_reinforced: {
    id: 'slat_200_reinforced',
    labelFr: 'Lame 200 mm Double Paroi Renforcée',
    widthMm: 200,
    heightMm: 42,
    wallThicknessMm: 2.3,
    weightKgPerM: 3.45,
    momentOfInertiaIxCm4: 98.0,
    sectionModulusWxCm3: 11.8,
    maxRecommendedSpanM: 4.5,
    hasCoextrudedGasket: true,
    description: 'Double chambre tubulaire avec ailettes de rigidité, excellente tenue au vent et à la neige.',
  },
  slat_210_aerofoil: {
    id: 'slat_210_aerofoil',
    labelFr: 'Lame 210 mm Profil Aile d Avion Galbée',
    widthMm: 210,
    heightMm: 45,
    wallThicknessMm: 2.6,
    weightKgPerM: 4.10,
    momentOfInertiaIxCm4: 152.0,
    sectionModulusWxCm3: 16.5,
    maxRecommendedSpanM: 5.5,
    hasCoextrudedGasket: true,
    description: 'Profil aérodynamique à écoulement silencieux, portée confortable jusqu à 5.5 m sans renfort.',
  },
  slat_250_heavy_duty: {
    id: 'slat_250_heavy_duty',
    labelFr: 'Lame 250 mm Industrielle Haute Résistance',
    widthMm: 250,
    heightMm: 55,
    wallThicknessMm: 3.2,
    weightKgPerM: 5.80,
    momentOfInertiaIxCm4: 255.0,
    sectionModulusWxCm3: 26.2,
    maxRecommendedSpanM: 6.5,
    hasCoextrudedGasket: true,
    description: 'Profil massif pour terrasses ERP, hôtellerie et zones côtières très ventées.',
  },
};

export const POST_SPECS: Record<PergolaPostModel, PostModelSpec> = {
  post_120x120: {
    id: 'post_120x120',
    labelFr: 'Poteau 120 x 120 mm (Tube 3.0 mm)',
    dimensionMm: 120,
    wallThicknessMm: 3.0,
    weightKgPerM: 5.65,
    internalDownspoutDiameterMm: 63,
    momentOfInertiaIxCm4: 295.0,
    description: 'Poteau carré avec platine de fixation sol cachée et évacuation pluviale intégrée 63 mm.',
  },
  post_150x150: {
    id: 'post_150x150',
    labelFr: 'Poteau 150 x 150 mm (Tube 4.0 mm)',
    dimensionMm: 150,
    wallThicknessMm: 4.0,
    weightKgPerM: 9.20,
    internalDownspoutDiameterMm: 80,
    momentOfInertiaIxCm4: 720.0,
    description: 'Section renforcée pour grandes dimensions et résistance élevée aux rafales de tempête.',
  },
  post_200x200: {
    id: 'post_200x200',
    labelFr: 'Poteau 200 x 200 mm (Tube 5.0 mm)',
    dimensionMm: 200,
    wallThicknessMm: 5.0,
    weightKgPerM: 15.50,
    internalDownspoutDiameterMm: 100,
    momentOfInertiaIxCm4: 2280.0,
    description: 'Poteau architectural grand format permettant des portées libres sans montant intermédiaire.',
  },
};

export const BEAM_SPECS: Record<PergolaBeamModel, BeamModelSpec> = {
  beam_180x100: {
    id: 'beam_180x100',
    labelFr: 'Poutre Sablière 180 x 100 mm Chéneau Standard',
    heightMm: 180,
    widthMm: 100,
    wallThicknessMm: 3.0,
    weightKgPerM: 7.80,
    momentOfInertiaIxCm4: 680.0,
    sectionModulusWxCm3: 75.5,
    gutterWidthMm: 75,
    gutterDepthMm: 110,
    gutterCrossSectionCm2: 82.5,
    description: 'Chéneau intégré avec pente interne pour collecte des eaux de ruissellement des lames.',
  },
  beam_240x120: {
    id: 'beam_240x120',
    labelFr: 'Poutre Sablière 240 x 120 mm Grand Chéneau',
    heightMm: 240,
    widthMm: 120,
    wallThicknessMm: 3.5,
    weightKgPerM: 11.90,
    momentOfInertiaIxCm4: 1480.0,
    sectionModulusWxCm3: 123.0,
    gutterWidthMm: 95,
    gutterDepthMm: 140,
    gutterCrossSectionCm2: 133.0,
    description: 'Profil grande rigidité supportant des portées de 5 à 6 mètres sans flèche visible.',
  },
  beam_280x150: {
    id: 'beam_280x150',
    labelFr: 'Poutre Sablière 280 x 150 mm Chéneau XXL ERP',
    heightMm: 280,
    widthMm: 150,
    wallThicknessMm: 4.5,
    weightKgPerM: 18.20,
    momentOfInertiaIxCm4: 2850.0,
    sectionModulusWxCm3: 203.5,
    gutterWidthMm: 120,
    gutterDepthMm: 170,
    gutterCrossSectionCm2: 204.0,
    description: 'Profil mastodonte pour toitures bioclimatiques de grande envergure avec orages violents.',
  },
};

export interface BioclimaticPergolaInput {
  pergolaWidthMm: number; // Dimension along slat length (portée des lames)
  pergolaLengthMm: number; // Dimension along perimeter beam (longueur d'avancée)
  pergolaHeightMm: number; // Hauteur sous poutre (typiquement 2500 - 3000 mm)
  slatAngleDegrees: number; // 0 deg (fermé étanche) à 135 deg (ventilation maximale)
  typology: PergolaTypology;
  slatModel: PergolaSlatModel;
  postModel: PergolaPostModel;
  beamModel: PergolaBeamModel;
  snowLoadKnM2: number; // Charge de neige (0.00 à 1.20 kN/m²)
  windDynamicPressurePa: number; // Pression dynamique du vent de base (375 à 850 Pa)
  rainIntensityMmH: number; // Intensité d'averse orageuse (typiquement 120 à 180 mm/h)
  wilayaName: string;
  clientName?: string;
  projectReference?: string;
}

export interface BioclimaticPergolaAuditResult {
  // Dimensions & Geometry
  widthM: number;
  lengthM: number;
  heightM: number;
  roofAreaM2: number;
  slatCount: number;
  slatLengthMm: number;
  beamLengthMm: number;
  postCount: number;
  downspoutCount: number;

  // Mass & Weights
  slatsTotalWeightKg: number;
  beamsTotalWeightKg: number;
  postsTotalWeightKg: number;
  accessoriesWeightKg: number;
  totalStructureWeightKg: number;
  deadLoadKnM2: number;

  // Mechanical Actions & Pressures
  downwardPressureKnM2: number;
  slatLinearLoadKnM: number;
  beamLinearLoadKnM: number;

  // Slat Verification (Eurocode 9)
  slatMomentMaxNm: number;
  slatBendingStressMpa: number;
  slatAllowableStressMpa: number;
  slatDeflectionMm: number;
  slatAllowableDeflectionMm: number;
  isSlatStressCompliant: boolean;
  isSlatDeflectionCompliant: boolean;
  slatStressSafetyRatio: number;

  // Beam Verification (Eurocode 9)
  beamMomentMaxNm: number;
  beamBendingStressMpa: number;
  beamAllowableStressMpa: number;
  beamDeflectionMm: number;
  beamAllowableDeflectionMm: number;
  isBeamStressCompliant: boolean;
  isBeamDeflectionCompliant: boolean;
  beamStressSafetyRatio: number;

  // Wind Uplift & Footing Anchorage (CNERIB RNV 2013)
  windUpliftCoefficientCp: number;
  netUpliftForceKn: number;
  upliftPerPostKn: number;
  anchorTensionDan: number;
  recommendedAnchorBolts: string;
  isBallastRequired: boolean;
  recommendedBallastPerPostKg: number;

  // Hydraulic Rain Drainage (NF EN 12056-3)
  stormFlowLiterPerSec: number;
  gutterEvacuationCapacityLiterPerSec: number;
  downspoutCapacityLiterPerSec: number;
  hydraulicSafetyRatio: number;
  isDrainageCompliant: boolean;

  // Motorization & Actuator Sizing
  actuatorPushForceN: number;
  recommendedActuatorRatingN: number;
  actuatorStrokeMm: number;
  operatingSpeedSeconds: number;

  // Overall Status
  overallStatus: 'valid' | 'warning' | 'critical';
  recommendationsFr: string[];
}

export function computeBioclimaticPergolaAudit(input: BioclimaticPergolaInput): BioclimaticPergolaAuditResult {
  const widthM = input.pergolaWidthMm / 1000;
  const lengthM = input.pergolaLengthMm / 1000;
  const heightM = input.pergolaHeightMm / 1000;
  const roofAreaM2 = parseFloat((widthM * lengthM).toFixed(2));

  const slatSpec = SLAT_SPECS[input.slatModel];
  const postSpec = POST_SPECS[input.postModel];
  const beamSpec = BEAM_SPECS[input.beamModel];

  // Number of posts based on typology
  let postCount = 4;
  if (input.typology === 'wall_mounted_2_posts') postCount = 2;
  if (input.typology === 'between_walls_no_posts') postCount = 0;
  if (input.typology === 'double_bay_6_posts') postCount = 6;

  // Number of integrated downspouts (at least 2 downspouts for drainage redundancy)
  const downspoutCount = postCount > 0 ? Math.min(postCount, 4) : 2;

  // Slat geometry and count along length
  // Overlap allowance for water tightness: slat visible pitch = width - 15 mm
  const slatEffectivePitchMm = slatSpec.widthMm - 15;
  const slatCount = Math.ceil(input.pergolaLengthMm / slatEffectivePitchMm);
  const slatLengthMm = input.pergolaWidthMm - (beamSpec.widthMm * 2); // fits between inner beam faces
  const beamLengthMm = input.pergolaLengthMm;

  // Weights calculation
  const totalSlatLinearMeters = (slatLengthMm / 1000) * slatCount;
  const slatsTotalWeightKg = Math.round(totalSlatLinearMeters * slatSpec.weightKgPerM);

  // Perimeter beams: 2 primary gutter beams along length + 2 transverse header beams along width
  const totalBeamLinearMeters = (2 * lengthM) + (2 * widthM);
  const beamsTotalWeightKg = Math.round(totalBeamLinearMeters * beamSpec.weightKgPerM);

  const totalPostLinearMeters = postCount * heightM;
  const postsTotalWeightKg = Math.round(totalPostLinearMeters * postSpec.weightKgPerM);

  // Accessories: pivot brackets, driving rod, motor actuator, fasteners, baseplates
  const accessoriesWeightKg = Math.round(25 + (slatCount * 0.45) + (postCount * 6));

  const totalStructureWeightKg = slatsTotalWeightKg + beamsTotalWeightKg + postsTotalWeightKg + accessoriesWeightKg;
  const deadLoadKnM2 = parseFloat(((totalStructureWeightKg * 9.81) / (roofAreaM2 * 1000)).toFixed(3));

  // Downward combined design load at ULS (Eurocode 0/1/9):
  // 1.35 * G + 1.5 * Q_snow + 1.5 * Q_wind_down
  // Base wind downward pressure: q_wind = windDynamicPressurePa * 0.8 / 1000 kN/m2
  const windDownPressureKnM2 = (input.windDynamicPressurePa * 0.75) / 1000;
  const downwardPressureKnM2 = parseFloat(
    (1.35 * deadLoadKnM2 + 1.5 * input.snowLoadKnM2 + 1.5 * windDownPressureKnM2).toFixed(3)
  );

  // Slat Mechanical Calculation
  // Tributary width for one slat = slatEffectivePitchMm / 1000 m
  const slatTribWidthM = slatEffectivePitchMm / 1000;
  const slatSpanM = slatLengthMm / 1000;
  const slatLinearLoadKnM = downwardPressureKnM2 * slatTribWidthM;

  // Maximum bending moment in simply supported beam: M = q * L^2 / 8
  const slatMomentMaxNm = Math.round((slatLinearLoadKnM * 1000 * Math.pow(slatSpanM, 2)) / 8);

  // Bending stress: sigma = M / Wx
  // Wx in cm3, convert to mm3: Wx_mm3 = Wx_cm3 * 1000
  const slatWxMm3 = slatSpec.sectionModulusWxCm3 * 1000;
  const slatBendingStressMpa = parseFloat(((slatMomentMaxNm * 1000) / slatWxMm3).toFixed(1));

  // Eurocode 9 allowable stress for 6060/6063 T6: fo / gamma_M0 = 160 / 1.10 = 145.5 MPa
  const slatAllowableStressMpa = 145.5;
  const isSlatStressCompliant = slatBendingStressMpa <= slatAllowableStressMpa;
  const slatStressSafetyRatio = parseFloat((slatAllowableStressMpa / Math.max(1, slatBendingStressMpa)).toFixed(2));

  // Slat Deflection under characteristic SLS load (G + S + W):
  // q_sls = (deadLoadKnM2 + input.snowLoadKnM2 + windDownPressureKnM2) * slatTribWidthM
  const slatLinearSlsKnM = (deadLoadKnM2 + input.snowLoadKnM2 + windDownPressureKnM2) * slatTribWidthM;
  // f = (5 * q * L^4) / (384 * E * I)
  // E = 70,000 MPa for aluminum, I in cm4 -> mm4 = Ix * 10^4
  const E_alu = 70000;
  const slatIxMm4 = slatSpec.momentOfInertiaIxCm4 * 10000;
  const slatDeflectionMm = parseFloat(
    (
      (5 * (slatLinearSlsKnM * 1) * Math.pow(slatSpanM * 1000, 4)) /
      (384 * E_alu * slatIxMm4)
    ).toFixed(1)
  );
  // Allowable deflection: L / 200 (standard)
  const slatAllowableDeflectionMm = parseFloat(((slatSpanM * 1000) / 200).toFixed(1));
  const isSlatDeflectionCompliant = slatDeflectionMm <= slatAllowableDeflectionMm;

  // Perimeter Beam Mechanical Calculation
  // Primary gutter beam supports half the total slats span: trib width = slatSpanM / 2
  const beamSpanM = lengthM;
  const beamLinearLoadKnM = parseFloat(
    (
      (downwardPressureKnM2 * (slatSpanM / 2)) +
      (1.35 * (beamSpec.weightKgPerM * 9.81) / 1000)
    ).toFixed(2)
  );

  const beamMomentMaxNm = Math.round((beamLinearLoadKnM * 1000 * Math.pow(beamSpanM, 2)) / 8);
  const beamWxMm3 = beamSpec.sectionModulusWxCm3 * 1000;
  const beamBendingStressMpa = parseFloat(((beamMomentMaxNm * 1000) / beamWxMm3).toFixed(1));
  const beamAllowableStressMpa = 145.5;
  const isBeamStressCompliant = beamBendingStressMpa <= beamAllowableStressMpa;
  const beamStressSafetyRatio = parseFloat((beamAllowableStressMpa / Math.max(1, beamBendingStressMpa)).toFixed(2));

  const beamLinearSlsKnM =
    ((deadLoadKnM2 + input.snowLoadKnM2 + windDownPressureKnM2) * (slatSpanM / 2)) +
    ((beamSpec.weightKgPerM * 9.81) / 1000);
  const beamIxMm4 = beamSpec.momentOfInertiaIxCm4 * 10000;
  const beamDeflectionMm = parseFloat(
    (
      (5 * (beamLinearSlsKnM * 1) * Math.pow(beamSpanM * 1000, 4)) /
      (384 * E_alu * beamIxMm4)
    ).toFixed(1)
  );
  // Allowable beam deflection: L / 300 to ensure smooth water slope without sagging
  const beamAllowableDeflectionMm = parseFloat(((beamSpanM * 1000) / 300).toFixed(1));
  const isBeamDeflectionCompliant = beamDeflectionMm <= beamAllowableDeflectionMm;

  // Wind Uplift Calculation (Eurocode 1 / RNV 2013)
  // For open canopy with closed slats, peak net suction coefficient Cp_net = -1.25
  const windUpliftCoefficientCp = -1.25;
  // Peak suction pressure (Pa):
  const gustSuctionPressurePa = input.windDynamicPressurePa * Math.abs(windUpliftCoefficientCp);
  const totalGrossUpliftForceKn = (gustSuctionPressurePa * roofAreaM2) / 1000;
  // Stabilizing dead weight of structure (favorable, factor 0.9):
  const stabilizingWeightKn = (totalStructureWeightKg * 9.81 * 0.9) / 1000;
  const netUpliftForceKn = parseFloat(Math.max(0, totalGrossUpliftForceKn - stabilizingWeightKn).toFixed(2));

  const activeAnchorPosts = Math.max(1, postCount);
  const upliftPerPostKn = parseFloat((netUpliftForceKn / activeAnchorPosts).toFixed(2));
  const anchorTensionDan = Math.round(upliftPerPostKn * 100);

  // Baseplate recommendation & ballast
  let recommendedAnchorBolts = '4x M10 Inox A4 avec cheville chimique injection résine (Profondeur 90 mm)';
  if (anchorTensionDan > 600) {
    recommendedAnchorBolts = '4x M12 Inox A4 scellement chimique haute adhérence (Profondeur 120 mm)';
  }
  if (anchorTensionDan > 1200) {
    recommendedAnchorBolts = '4x M16 Inox A4 tige filetée scellée dans massif béton armé C25/30 (Profondeur 160 mm)';
  }

  // Ballast required if installing on terrace without structural slab anchoring
  const isBallastRequired = netUpliftForceKn > 0;
  const recommendedBallastPerPostKg = Math.round((upliftPerPostKn * 1000) / 9.81);

  // Hydraulic Rain Drainage Calculation (NF EN 12056-3)
  // Design rainfall intensity r: mm/h converted to L/(s * m2) -> 1 mm/h = 1/3600 L/(s*m2)
  const rainfallIntensityLiterSecM2 = input.rainIntensityMmH / 3600;
  const stormFlowLiterPerSec = parseFloat((roofAreaM2 * rainfallIntensityLiterSecM2).toFixed(2));

  // Gutter capacity via Manning-Strickler equation for rectangular channel:
  // Q = (1/n) * A * Rh^(2/3) * S^(1/2)
  // Two lateral gutters collect the flow: 2 * Q_gutter
  const gutterAreaM2 = (beamSpec.gutterWidthMm / 1000) * (beamSpec.gutterDepthMm / 1000);
  const wettedPerimeterM = (beamSpec.gutterWidthMm / 1000) + 2 * (beamSpec.gutterDepthMm / 1000);
  const hydraulicRadiusM = gutterAreaM2 / wettedPerimeterM;
  const gutterSlope = 0.005; // 0.5% built-in slope
  const manningRoughness = 0.011; // smooth extruded aluminum
  const oneGutterCapacityM3s = (1 / manningRoughness) * gutterAreaM2 * Math.pow(hydraulicRadiusM, 2 / 3) * Math.sqrt(gutterSlope);
  const gutterEvacuationCapacityLiterPerSec = parseFloat((2 * oneGutterCapacityM3s * 1000).toFixed(2));

  // Downspout discharge capacity: orifice formula Q = mu * A * sqrt(2 * g * h)
  const downspoutDiaM = postSpec.internalDownspoutDiameterMm / 1000;
  const downspoutAreaM2 = Math.PI * Math.pow(downspoutDiaM / 2, 2);
  const dischargeCoeffMu = 0.62;
  const waterHeadM = beamSpec.gutterDepthMm / 1000; // head of water in gutter
  const oneDownspoutCapacityM3s = dischargeCoeffMu * downspoutAreaM2 * Math.sqrt(2 * 9.81 * waterHeadM);
  const downspoutCapacityLiterPerSec = parseFloat((downspoutCount * oneDownspoutCapacityM3s * 1000).toFixed(2));

  const limitingHydraulicCapacity = Math.min(gutterEvacuationCapacityLiterPerSec, downspoutCapacityLiterPerSec);
  const hydraulicSafetyRatio = parseFloat((limitingHydraulicCapacity / Math.max(0.1, stormFlowLiterPerSec)).toFixed(2));
  const isDrainageCompliant = hydraulicSafetyRatio >= 1.2;

  // Actuator Sizing
  // Thrust force depends on number of slats, friction, and wind drag during rotation:
  // Base pivot friction per slat: ~45 N
  // Aerodynamic torque at 45 deg under 40 km/h wind gust: ~85 N per slat
  const actuatorPushForceN = Math.round((slatCount * 55) + (roofAreaM2 * 28));
  let recommendedActuatorRatingN = 1500;
  if (actuatorPushForceN > 1200) recommendedActuatorRatingN = 2500;
  if (actuatorPushForceN > 2200) recommendedActuatorRatingN = 3500;
  if (actuatorPushForceN > 3200) recommendedActuatorRatingN = 5000;

  // Actuator stroke (course du vérin): typical 250 mm to 350 mm for 135 deg rotation
  const actuatorStrokeMm = 300;
  const operatingSpeedSeconds = 18; // approx 18 seconds for full 0 to 135 deg stroke

  // Recommendations and Synthesis
  const recommendationsFr: string[] = [];

  if (!isSlatDeflectionCompliant) {
    recommendationsFr.push(
      `Flèche des lames excessive (${slatDeflectionMm} mm > ${slatAllowableDeflectionMm} mm). Choisissez un modèle de lame supérieure ou réduisez la portée entre sablières.`
    );
  }
  if (!isBeamDeflectionCompliant) {
    recommendationsFr.push(
      `Flèche de la sablière porteuse hors tolérance (${beamDeflectionMm} mm > ${beamAllowableDeflectionMm} mm). Passez au profil chéneau 240x120 mm ou 280x150 mm.`
    );
  }
  if (!isDrainageCompliant) {
    recommendationsFr.push(
      `Capacité d évacuation pluviale insuffisante face aux orages oranais/algérois (${stormFlowLiterPerSec} L/s requis contre ${limitingHydraulicCapacity} L/s max). Ajoutez des descentes d eau supplémentaires.`
    );
  }
  if (anchorTensionDan > 800) {
    recommendationsFr.push(
      `Forte traction de soulèvement au vent (${anchorTensionDan} daN par poteau). Exigez un massif de lestage béton armé ou des tiges filetées M12/M16 scellées chimiquement.`
    );
  }
  if (recommendationsFr.length === 0) {
    recommendationsFr.push(
      'Structure parfaitement équilibrée. Flèches sous vent et neige conformes à l Eurocode 9, drainage pluvial et ancrages validés selon le RNV 2013.'
    );
  }

  let overallStatus: 'valid' | 'warning' | 'critical' = 'valid';
  if (!isSlatStressCompliant || !isBeamStressCompliant || anchorTensionDan > 1500) {
    overallStatus = 'critical';
  } else if (!isSlatDeflectionCompliant || !isBeamDeflectionCompliant || !isDrainageCompliant) {
    overallStatus = 'warning';
  }

  return {
    widthM,
    lengthM,
    heightM,
    roofAreaM2,
    slatCount,
    slatLengthMm,
    beamLengthMm,
    postCount,
    downspoutCount,
    slatsTotalWeightKg,
    beamsTotalWeightKg,
    postsTotalWeightKg,
    accessoriesWeightKg,
    totalStructureWeightKg,
    deadLoadKnM2,
    downwardPressureKnM2,
    slatLinearLoadKnM,
    beamLinearLoadKnM,
    slatMomentMaxNm,
    slatBendingStressMpa,
    slatAllowableStressMpa,
    slatDeflectionMm,
    slatAllowableDeflectionMm,
    isSlatStressCompliant,
    isSlatDeflectionCompliant,
    slatStressSafetyRatio,
    beamMomentMaxNm,
    beamBendingStressMpa,
    beamAllowableStressMpa,
    beamDeflectionMm,
    beamAllowableDeflectionMm,
    isBeamStressCompliant,
    isBeamDeflectionCompliant,
    beamStressSafetyRatio,
    windUpliftCoefficientCp,
    netUpliftForceKn,
    upliftPerPostKn,
    anchorTensionDan,
    recommendedAnchorBolts,
    isBallastRequired,
    recommendedBallastPerPostKg,
    stormFlowLiterPerSec,
    gutterEvacuationCapacityLiterPerSec,
    downspoutCapacityLiterPerSec,
    hydraulicSafetyRatio,
    isDrainageCompliant,
    actuatorPushForceN,
    recommendedActuatorRatingN,
    actuatorStrokeMm,
    operatingSpeedSeconds,
    overallStatus,
    recommendationsFr,
  };
}
