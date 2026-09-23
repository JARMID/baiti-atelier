/**
 * Baiti Atelier - Bifold / Accordion Door Structural & Mechanical Manager
 * Normative references:
 * - NF EN 1527: Quincaillerie pour le batiment - Ferrures pour portes coulissantes et pliantes
 * - NF EN 1191: Fenetres et portes - Resistance aux manoeuvres repetees (100 000 cycles)
 * - NF DTU 36.5 (P20-202): Mise en oeuvre des menuiseries exterieures pliantes et coulissantes
 * - NF EN 12208: Permeabilite a l'eau (Classes 4A a E900)
 * - Decret Executif 06-455 (Algerie): Accessibilite PMR et ressaut franchissable <= 20 mm
 *
 * Humanizer invariant: exactly 0 em dashes, 0 en dashes.
 */

export type BifoldConfigId =
  | '2_0'
  | '3_0'
  | '3_1'
  | '4_0'
  | '4_1'
  | '5_0'
  | '5_1'
  | '6_0'
  | '6_2'
  | '7_1'
  | '8_0';

export interface BifoldConfigSpec {
  id: BifoldConfigId;
  label: string;
  leavesLeft: number;
  leavesRight: number;
  totalLeaves: number;
  trafficDoor: boolean;
  descriptionFr: string;
}

export const BIFOLD_CONFIGURATIONS: BifoldConfigSpec[] = [
  {
    id: '2_0',
    label: '2+0 (2 Vantaux a Gauche)',
    leavesLeft: 2,
    leavesRight: 0,
    totalLeaves: 2,
    trafficDoor: false,
    descriptionFr: '2 vantaux articulés repliables d un seul cote sans porte de service independante',
  },
  {
    id: '3_0',
    label: '3+0 (3 Vantaux a Gauche)',
    leavesLeft: 3,
    leavesRight: 0,
    totalLeaves: 3,
    trafficDoor: true,
    descriptionFr: '3 vantaux avec premier vantail faisant office de porte d acces pivotante battante',
  },
  {
    id: '3_1',
    label: '3+1 (3 a Gauche + 1 a Droite)',
    leavesLeft: 3,
    leavesRight: 1,
    totalLeaves: 4,
    trafficDoor: true,
    descriptionFr: '3 vantaux pliants a gauche et 1 porte battante independante a droite pour acces quotidien',
  },
  {
    id: '4_0',
    label: '4+0 (4 Vantaux a Gauche)',
    leavesLeft: 4,
    leavesRight: 0,
    totalLeaves: 4,
    trafficDoor: false,
    descriptionFr: '4 vantaux repliables en accordeon complet sur un seul refend',
  },
  {
    id: '4_1',
    label: '4+1 (4 a Gauche + 1 a Droite)',
    leavesLeft: 4,
    leavesRight: 1,
    totalLeaves: 5,
    trafficDoor: true,
    descriptionFr: '4 vantaux accordeon a gauche associes a une porte de service a droite',
  },
  {
    id: '5_0',
    label: '5+0 (5 Vantaux a Gauche)',
    leavesLeft: 5,
    leavesRight: 0,
    totalLeaves: 5,
    trafficDoor: true,
    descriptionFr: '5 vantaux articulés pour grande baie panoramique avec porte de passage integree',
  },
  {
    id: '5_1',
    label: '5+1 (5 a Gauche + 1 a Droite)',
    leavesLeft: 5,
    leavesRight: 1,
    totalLeaves: 6,
    trafficDoor: true,
    descriptionFr: '5 vantaux pliants d un cote et 1 vantail de passage independant pour villa et restaurant',
  },
  {
    id: '6_0',
    label: '6+0 (6 Vantaux a Gauche)',
    leavesLeft: 6,
    leavesRight: 0,
    totalLeaves: 6,
    trafficDoor: false,
    descriptionFr: '6 vantaux repliables integralement sur une seule rive pour ouverture totale',
  },
  {
    id: '6_2',
    label: '6+2 (4 a Gauche + 2 a Droite)',
    leavesLeft: 4,
    leavesRight: 2,
    totalLeaves: 6,
    trafficDoor: true,
    descriptionFr: 'Disposition double portefeuille symetrique ou dissymetrique avec deux refends',
  },
  {
    id: '7_1',
    label: '7+1 (7 a Gauche + 1 a Droite)',
    leavesLeft: 7,
    leavesRight: 1,
    totalLeaves: 8,
    trafficDoor: true,
    descriptionFr: 'Envergure monumentale jusqu a 8 metres avec porte battante prioritaire',
  },
  {
    id: '8_0',
    label: '8+0 (4 a Gauche + 4 a Droite)',
    leavesLeft: 4,
    leavesRight: 4,
    totalLeaves: 8,
    trafficDoor: true,
    descriptionFr: 'Division centrale avec 4 vantaux a gauche et 4 vantaux a droite pour terrasse de prestige',
  },
];

export type BifoldMountingSystem = 'top_hung' | 'bottom_rolling';

export interface MountingSystemSpec {
  id: BifoldMountingSystem;
  nameFr: string;
  loadTransfer: string;
  recommendedUse: string;
  lintelDeflectionLimit: string;
}

export const MOUNTING_SYSTEMS: Record<BifoldMountingSystem, MountingSystemSpec> = {
  top_hung: {
    id: 'top_hung',
    nameFr: 'Suspension Haute (Top-Hung)',
    loadTransfer: 'Le poids total des vantaux est suspendu au linteau superieur via chariots a galets inox.',
    recommendedUse: 'Sols sans seuil saillant, passage fluide, vantaux legers a moyens (jusqu a 100 kg par vantail).',
    lintelDeflectionLimit: 'L/500 ou 3 mm maximum sous charge concentree des vantaux empiles.',
  },
  bottom_rolling: {
    id: 'bottom_rolling',
    nameFr: 'Roulement au Sol (Bottom-Rolling)',
    loadTransfer: 'Le poids des vantaux repose directement sur le rail inferieur en acier inoxydable.',
    recommendedUse: 'Vantaux tres lourds (> 100 kg), triple vitrage acoustique ou linteaux a fleche non maitrisable.',
    lintelDeflectionLimit: 'L/300. Le rail haut n agit que comme guide horizontal contre la poussee au vent.',
  },
};

export type BifoldThresholdType = 'pmr_low_profile' | 'standard_rebated' | 'stepped_drainage';

export interface ThresholdSpec {
  id: BifoldThresholdType;
  nameFr: string;
  heightMm: number;
  pmrCompliant: boolean;
  waterTightnessClass: string;
  airTightnessClass: string;
  descriptionFr: string;
}

export const BIFOLD_THRESHOLDS: Record<BifoldThresholdType, ThresholdSpec> = {
  pmr_low_profile: {
    id: 'pmr_low_profile',
    nameFr: 'Seuil Plat Encastré PMR (18 mm)',
    heightMm: 18,
    pmrCompliant: true,
    waterTightnessClass: 'Classe 4A (150 Pa)',
    airTightnessClass: 'Classe 3',
    descriptionFr: 'Seuil extra-plat conforme au Decret 06-455 avec pente chanfreinee pour passage de fauteuil roulant.',
  },
  standard_rebated: {
    id: 'standard_rebated',
    nameFr: 'Seuil a Frappe avec Joint EPDM (45 mm)',
    heightMm: 45,
    pmrCompliant: false,
    waterTightnessClass: 'Classe 9A (600 Pa)',
    airTightnessClass: 'Classe 4',
    descriptionFr: 'Etanchéité superieure avec double joint de frappe tubulaire en EPDM pour zones exposees au vent marin.',
  },
  stepped_drainage: {
    id: 'stepped_drainage',
    nameFr: 'Seuil a Redan et Caniveau Encastre (20 mm)',
    heightMm: 20,
    pmrCompliant: true,
    waterTightnessClass: 'Classe 7A (300 Pa)',
    airTightnessClass: 'Classe 4',
    descriptionFr: 'Combine le franchissement sans obstacle avec chambre de decharge et fentes d evacuation vers l exterieur.',
  },
};

export type BifoldGlazingOption =
  | 'double_4_16_4'
  | 'double_6_16_6'
  | 'laminated_44_2_12_4'
  | 'laminated_55_2_16_6'
  | 'triple_4_12_4_12_4';

export interface GlazingWeightSpec {
  id: BifoldGlazingOption;
  nameFr: string;
  thicknessMm: number;
  glassMassKgPerM2: number;
  acousticRwDb: number;
  thermalUg: number;
}

export const BIFOLD_GLAZINGS: Record<BifoldGlazingOption, GlazingWeightSpec> = {
  double_4_16_4: {
    id: 'double_4_16_4',
    nameFr: 'Double Vitrage 4/16/4 Standard (24 mm)',
    thicknessMm: 24,
    glassMassKgPerM2: 20.0,
    acousticRwDb: 31,
    thermalUg: 1.3,
  },
  double_6_16_6: {
    id: 'double_6_16_6',
    nameFr: 'Double Vitrage Renforcé 6/16/6 (28 mm)',
    thicknessMm: 28,
    glassMassKgPerM2: 30.0,
    acousticRwDb: 35,
    thermalUg: 1.3,
  },
  laminated_44_2_12_4: {
    id: 'laminated_44_2_12_4',
    nameFr: 'Feuilleté Sécurité 44.2/12/4 (24.8 mm)',
    thicknessMm: 24.8,
    glassMassKgPerM2: 30.5,
    acousticRwDb: 37,
    thermalUg: 1.4,
  },
  laminated_55_2_16_6: {
    id: 'laminated_55_2_16_6',
    nameFr: 'Feuilleté Haute Sécurité 55.2/16/6 (32.8 mm)',
    thicknessMm: 32.8,
    glassMassKgPerM2: 40.5,
    acousticRwDb: 40,
    thermalUg: 1.3,
  },
  triple_4_12_4_12_4: {
    id: 'triple_4_12_4_12_4',
    nameFr: 'Triple Vitrage Haute Performance (36 mm)',
    thicknessMm: 36,
    glassMassKgPerM2: 30.0,
    acousticRwDb: 34,
    thermalUg: 0.8,
  },
};

export interface RollerBogieOption {
  capacityKg: number;
  label: string;
  bearingType: string;
  recommendedLeavesWeightLimitKg: number;
}

export const ROLLER_BOGIE_OPTIONS: RollerBogieOption[] = [
  {
    capacityKg: 80,
    label: 'Chariot Standard 80 kg (2 Galets)',
    bearingType: 'Roulements a aiguilles et bagues teflon',
    recommendedLeavesWeightLimitKg: 40,
  },
  {
    capacityKg: 120,
    label: 'Chariot Renforcé 120 kg (4 Galets)',
    bearingType: '4 roulements a billes etanches en inox',
    recommendedLeavesWeightLimitKg: 60,
  },
  {
    capacityKg: 160,
    label: 'Chariot Heavy Duty 160 kg (4 Galets Inox 316)',
    bearingType: 'Galets doubles acier inox avec cage lubrifiee a vie',
    recommendedLeavesWeightLimitKg: 80,
  },
  {
    capacityKg: 250,
    label: 'Chariot Monumental 250 kg (Bogies Multi-Roulettes)',
    bearingType: 'Bogies tandem a roulements industriels blindes',
    recommendedLeavesWeightLimitKg: 125,
  },
];

export interface BifoldCalculationInput {
  totalWidthMm: number;
  totalHeightMm: number;
  configId: BifoldConfigId;
  mountingSystem: BifoldMountingSystem;
  thresholdType: BifoldThresholdType;
  glazingOption: BifoldGlazingOption;
  selectedBogieCapacityKg: number;
  profileSystemName?: string;
  wilayaName?: string;
}

export interface BifoldCalculationResult {
  input: BifoldCalculationInput;
  configSpec: BifoldConfigSpec;
  mountingSpec: MountingSystemSpec;
  thresholdSpec: ThresholdSpec;
  glazingSpec: GlazingWeightSpec;

  // Geometry
  leafCount: number;
  leafWidthMm: number;
  leafHeightMm: number;
  daylightWidthPerLeafMm: number;
  daylightHeightPerLeafMm: number;
  leafGlassAreaM2: number;
  totalGlassAreaM2: number;

  // Mass calculations
  leafGlassWeightKg: number;
  leafProfileWeightKg: number;
  leafHardwareWeightKg: number;
  singleLeafTotalWeightKg: number;
  totalDoorLeavesWeightKg: number;
  totalSystemWeightKg: number;

  // Carriages & Mechanics
  carrierBogieCount: number;
  loadPerBogieKg: number;
  selectedBogieCapacityKg: number;
  bogieUtilizationPercent: number;
  isBogieCapacitySufficient: boolean;

  // Lintel & Structural Load
  stackedLeavesCountMaxSide: number;
  stackedConcentratedLoadKg: number;
  stackedWidthMm: number;
  lintelDeflectionLimitMm: number;
  recommendedLintelInertiaCm4: number;
  structuralLintelWarning: string | null;

  // Drainage & AEV
  weepHoleCount: number;
  weepHoleSectionMm: string;
  drainageRateLitersPerMin: number;
  antiReturnFlapRequired: boolean;

  // Hardware & Hinge Tension
  hingeTensionDaN: number;
  minAnchorFastenersPerJamb: number;

  // Compliance Verdicts
  overallVerdict: 'favorable' | 'warning' | 'critical';
  verdictTitleFr: string;
  verdictDetailsFr: string[];
  recommendationsFr: string[];
}

/**
 * Calculates complete kinematic, load distribution, and drainage parameters for bifold doors.
 */
export function calculateBifoldSystem(input: BifoldCalculationInput): BifoldCalculationResult {
  const configSpec =
    BIFOLD_CONFIGURATIONS.find((c) => c.id === input.configId) || BIFOLD_CONFIGURATIONS[1];
  const mountingSpec = MOUNTING_SYSTEMS[input.mountingSystem];
  const thresholdSpec = BIFOLD_THRESHOLDS[input.thresholdType];
  const glazingSpec = BIFOLD_GLAZINGS[input.glazingOption];

  const N = configSpec.totalLeaves;
  const jambClearanceTotalMm = 70; // 35mm per side
  const interLeafGapTotalMm = (N - 1) * 12; // 12mm hinge clearance between leaves
  const availableClearWidth = Math.max(input.totalWidthMm - jambClearanceTotalMm - interLeafGapTotalMm, 400);

  const leafWidthMm = Math.round(availableClearWidth / N);
  const topTrackHeightMm = 65;
  const bottomSillHeightMm = thresholdSpec.heightMm + 25;
  const leafHeightMm = Math.max(input.totalHeightMm - topTrackHeightMm - bottomSillHeightMm, 500);

  // Optical and Glass dimensions per leaf
  const profileSightlineBorderMm = 75; // profile frame face width
  const daylightWidthPerLeafMm = Math.max(leafWidthMm - 2 * profileSightlineBorderMm, 200);
  const daylightHeightPerLeafMm = Math.max(leafHeightMm - 2 * profileSightlineBorderMm, 300);
  const leafGlassAreaM2 = (daylightWidthPerLeafMm * daylightHeightPerLeafMm) / 1_000_000;
  const totalGlassAreaM2 = leafGlassAreaM2 * N;

  // Weight calculations
  const leafGlassWeightKg = Math.round(leafGlassAreaM2 * glazingSpec.glassMassKgPerM2 * 10) / 10;
  // Aluminium profile weight: perimeter * 1.85 kg/m linear mass for thermal break profile
  const profilePerimeterM = (2 * (leafWidthMm + leafHeightMm)) / 1000;
  const leafProfileWeightKg = Math.round(profilePerimeterM * 1.85 * 10) / 10;
  // Multipoint locking, 3D friction hinges, shootbolts, flush handles
  const leafHardwareWeightKg = 5.5;

  const singleLeafTotalWeightKg =
    Math.round((leafGlassWeightKg + leafProfileWeightKg + leafHardwareWeightKg) * 10) / 10;
  const totalDoorLeavesWeightKg = Math.round(singleLeafTotalWeightKg * N * 10) / 10;
  // Outer frame profile weight
  const outerFramePerimeterM = (2 * (input.totalWidthMm + input.totalHeightMm)) / 1000;
  const outerFrameWeightKg = Math.round(outerFramePerimeterM * 2.6 * 10) / 10;
  const totalSystemWeightKg = Math.round((totalDoorLeavesWeightKg + outerFrameWeightKg) * 10) / 10;

  // Bogies and Carrier load: each pair of folding leaves requires 1 top/bottom carrier bogie
  // For odd configurations, the end leaf also has a guide roller
  const carrierBogieCount = Math.max(Math.ceil(N / 2), 1);
  // Each carrier bogie bears the dynamic reaction of 2 articulated leaves
  const loadPerBogieKg =
    input.mountingSystem === 'top_hung'
      ? Math.round(singleLeafTotalWeightKg * 2 * 10) / 10
      : Math.round((singleLeafTotalWeightKg * 2 * 0.9) * 10) / 10;

  const selectedBogieCap = input.selectedBogieCapacityKg || 120;
  const bogieUtilizationPercent = Math.round((loadPerBogieKg / selectedBogieCap) * 100);
  const isBogieCapacitySufficient = bogieUtilizationPercent <= 100;

  // Lintel load and stacked concentration
  const maxSideLeaves = Math.max(configSpec.leavesLeft, configSpec.leavesRight);
  const stackedLeavesCountMaxSide = maxSideLeaves;
  const stackedConcentratedLoadKg = Math.round(maxSideLeaves * singleLeafTotalWeightKg);
  const stackedWidthMm = maxSideLeaves * 75; // average folded pack thickness per leaf

  // Allowable lintel deflection
  const lintelDeflectionLimitMm = Math.min(Math.round((input.totalWidthMm / 500) * 10) / 10, 3.0);
  // Inertia approximation needed for beam under point load at jamb
  // I = (P * a^2 * b^2) / (3 * E * L * f_adm)
  // Simplified trade calculation for aluminium or steel header beam
  const recommendedLintelInertiaCm4 = Math.round(
    (stackedConcentratedLoadKg * Math.pow(input.totalWidthMm / 1000, 2) * 1.8)
  );

  let structuralLintelWarning: string | null = null;
  if (input.mountingSystem === 'top_hung' && stackedConcentratedLoadKg > 250) {
    structuralLintelWarning =
      'Charge suspendue concentree de ' +
      stackedConcentratedLoadKg +
      ' kg sur linteau en position ouverte. Un renfort par profil tubulaire acier ou corniere est necessaire.';
  }

  // Drainage and Weep holes
  const weepHoleCount = Math.max(Math.ceil(input.totalWidthMm / 550), 3);
  const weepHoleSectionMm = '8 x 30 mm avec buse orientee et clapet silicone';
  // Rain runoff flow rate according to DTU 36.5 for torrential rain
  const drainageRateLitersPerMin =
    Math.round(((input.totalWidthMm * input.totalHeightMm) / 1_000_000) * 3.5 * 10) / 10;
  const antiReturnFlapRequired =
    thresholdSpec.id === 'pmr_low_profile' || thresholdSpec.id === 'stepped_drainage';

  // Hinge tension and pull-out force on upper hinge
  // T = (P_leaf * leafWidth) / (2 * leafHeight)
  const hingeTensionDaN =
    Math.round(((singleLeafTotalWeightKg * (leafWidthMm / 2)) / Math.max(leafHeightMm, 1000)) * 10) / 10;
  const minAnchorFastenersPerJamb = Math.max(Math.ceil(input.totalHeightMm / 400), 4);

  // Verdict determination
  let overallVerdict: 'favorable' | 'warning' | 'critical' = 'favorable';
  let verdictTitleFr = 'Conforme NF EN 1527 et DTU 36.5';
  const verdictDetailsFr: string[] = [];
  const recommendationsFr: string[] = [];

  if (singleLeafTotalWeightKg > 100 && input.mountingSystem === 'top_hung') {
    overallVerdict = 'warning';
    verdictTitleFr = 'Attention: Poids Vantail Eleve pour Suspension Haute';
    verdictDetailsFr.push(
      'Chaque vantail pese ' +
        singleLeafTotalWeightKg +
        ' kg. Une suspension au sol (Bottom-Rolling) offre une meilleure longevite mecanique.'
    );
  }

  if (!isBogieCapacitySufficient) {
    overallVerdict = 'critical';
    verdictTitleFr = 'Non Conforme: Capacite Chariot Depassee';
    verdictDetailsFr.push(
      'La charge par chariot de ' +
        loadPerBogieKg +
        ' kg depasse la capacite choisie de ' +
        selectedBogieCap +
        ' kg (Taux d utilisation: ' +
        bogieUtilizationPercent +
        '%).'
    );
    recommendationsFr.push(
      'Passer imperativement a un chariot porteur de capacite superieure (160 kg ou 250 kg).'
    );
  } else {
    verdictDetailsFr.push(
      'Chariots a galets adaptes: taux de charge a ' +
        bogieUtilizationPercent +
        '% de la charge nominale.'
    );
  }

  if (thresholdSpec.pmrCompliant) {
    verdictDetailsFr.push(
      'Seuil plat franchissable conforme au Decret Executif 06-455 (ressaut inferieur ou egal a 20 mm).'
    );
  } else {
    verdictDetailsFr.push(
      'Seuil avec traverse basse a frappe: etancheite maximale Classe 9A recommandee en bordure cotiere.'
    );
  }

  // Recommendations
  recommendationsFr.push(
    'Prevoir un graissage annuel des galets a roulement etanche a la graisse silicone neutre.'
  );
  recommendationsFr.push(
    'Disposer au minimum ' +
      weepHoleCount +
      ' fentes de drainage protegees par des clapets anti-retour pour bloquer les remontees d air.'
  );
  if (input.mountingSystem === 'top_hung') {
    recommendationsFr.push(
      'Verifier la rigidite du linteau maconne: la fleche sous charge de ' +
        stackedConcentratedLoadKg +
        ' kg ne doit pas depasser ' +
        lintelDeflectionLimitMm +
        ' mm.'
    );
  }
  recommendationsFr.push(
    'Fixation des dormants lateraux par ' +
      minAnchorFastenersPerJamb +
      ' chevilles traversantes haute adherence espacées de 400 mm max.'
  );

  return {
    input,
    configSpec,
    mountingSpec,
    thresholdSpec,
    glazingSpec,
    leafCount: N,
    leafWidthMm,
    leafHeightMm,
    daylightWidthPerLeafMm,
    daylightHeightPerLeafMm,
    leafGlassAreaM2,
    totalGlassAreaM2,
    leafGlassWeightKg,
    leafProfileWeightKg,
    leafHardwareWeightKg,
    singleLeafTotalWeightKg,
    totalDoorLeavesWeightKg,
    totalSystemWeightKg,
    carrierBogieCount,
    loadPerBogieKg,
    selectedBogieCapacityKg: selectedBogieCap,
    bogieUtilizationPercent,
    isBogieCapacitySufficient,
    stackedLeavesCountMaxSide,
    stackedConcentratedLoadKg,
    stackedWidthMm,
    lintelDeflectionLimitMm,
    recommendedLintelInertiaCm4,
    structuralLintelWarning,
    weepHoleCount,
    weepHoleSectionMm,
    drainageRateLitersPerMin,
    antiReturnFlapRequired,
    hingeTensionDaN,
    minAnchorFastenersPerJamb,
    overallVerdict,
    verdictTitleFr,
    verdictDetailsFr,
    recommendationsFr,
  };
}

/**
 * Formats WhatsApp technical dispatch note for workshop and architects.
 */
export function formatBifoldDispatchWhatsApp(
  res: BifoldCalculationResult,
  clientName: string,
  projectRef: string
): string {
  const lines: string[] = [
    '*BAITI ATELIER - ETUDE TECHNIQUE PORTE ACCORDEON*',
    'Ref: ' + projectRef + ' | Client: ' + clientName,
    'Normes: NF EN 1527 / NF DTU 36.5 / Decret PMR 06-455',
    '----------------------------------------',
    '*1. GEOMETRIE ET CONFIGURATION*',
    'Largeur Hors-Tout: ' + res.input.totalWidthMm + ' mm',
    'Hauteur Hors-Tout: ' + res.input.totalHeightMm + ' mm',
    'Schema: ' + res.configSpec.label,
    'Nombre de vantaux: ' + res.leafCount + ' (' + res.leafWidthMm + ' x ' + res.leafHeightMm + ' mm)',
    'Surface vitree totale: ' + res.totalGlassAreaM2.toFixed(2) + ' m2',
    '',
    '*2. MASSES ET CHARGES MECANIQUES*',
    'Poids vitrage par vantail: ' + res.leafGlassWeightKg + ' kg (' + res.glazingSpec.nameFr + ')',
    'Poids unitaire par vantail: ' + res.singleLeafTotalWeightKg + ' kg',
    'Poids total du tablier pliant: ' + res.totalDoorLeavesWeightKg + ' kg',
    'Systeme de guidage: ' + res.mountingSpec.nameFr,
    'Charge par chariot porteur: ' + res.loadPerBogieKg + ' kg (Capacite: ' + res.selectedBogieCapacityKg + ' kg)',
    'Taux de charge chariot: ' + res.bogieUtilizationPercent + '%',
    '',
    '*3. APPUI LINTEAU EN POSITION REPLIEE*',
    'Vantaux empiles cote max: ' + res.stackedLeavesCountMaxSide + ' vantaux',
    'Charge ponctuelle au refend: ' + res.stackedConcentratedLoadKg + ' kg',
    'Fleche maximale admissible linteau: ' + res.lintelDeflectionLimitMm + ' mm',
    res.structuralLintelWarning ? 'Alerte Linteau: ' + res.structuralLintelWarning : 'Rigidite standard requise.',
    '',
    '*4. SEUIL ET ETANCHEITE DRAINAGE*',
    'Seuil: ' + res.thresholdSpec.nameFr,
    'Accessibilite PMR: ' + (res.thresholdSpec.pmrCompliant ? 'OUI (<= 20 mm)' : 'NON (Seuil a frappe)'),
    'Classement Eau / Air: ' + res.thresholdSpec.waterTightnessClass + ' / ' + res.thresholdSpec.airTightnessClass,
    'Fentes d evacuation: ' + res.weepHoleCount + ' buse(s) avec clapet anti-retour',
    '',
    '*5. VERDICT TECHNIQUE*',
    'Statut: ' + res.verdictTitleFr,
    '----------------------------------------',
    'Genere automatiquement par Baiti Atelier CAO/Menuiserie',
  ];

  return lines.join('\n');
}
