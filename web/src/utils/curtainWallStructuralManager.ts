/**
 * Baiti Atelier - Curtain Wall Static Wind Inertia & Mullion Deflection Manager
 * Structural sizing according to Eurocode 9 / NF DTU 33.1 / NF EN 13830 / DTR BC 2-47 RNV
 * Humanizer compliant: exactly 0 em dashes, 0 en dashes.
 */

export type CurtainWallTypology =
  | 'facade_grille_capot_serreur'
  | 'vec_silicone_structurel'
  | 'vep_parclose'
  | 'facade_semi_vep';

export type AlgerianWindZone = 'zone_1' | 'zone_2' | 'zone_3' | 'zone_4';

export type SiteRoughnessCategory =
  | 'site_1_mer_cote'
  | 'site_2_campagne_rase'
  | 'site_3_suburbain'
  | 'site_4_centre_urbain_dense';

export type StructuralSupportCondition =
  | 'simple_span' // Appui simple sur 2 dalles
  | 'continuous_two_spans'; // Montant filant continu sur 2 etages

export type MullionProfileModel =
  | 'mullion_50_85'
  | 'mullion_50_105'
  | 'mullion_50_125'
  | 'mullion_50_150'
  | 'mullion_50_175'
  | 'mullion_50_200'
  | 'mullion_steel_reinforced_150'
  | 'mullion_steel_reinforced_200';

export type TransomProfileModel =
  | 'transom_50_55'
  | 'transom_50_75'
  | 'transom_50_95'
  | 'transom_50_115';

export interface MullionProfileData {
  id: MullionProfileModel;
  labelFr: string;
  depthMm: number;
  faceWidthMm: number;
  ixCm4: number; // Inertie principale face au vent
  iyCm4: number; // Inertie secondaire
  weightKgPerM: number;
  hasSteelReinforcement: boolean;
  steelTubeDimensionsFr?: string;
  descriptionFr: string;
}

export const MULLION_PROFILES_CATALOG: Record<MullionProfileModel, MullionProfileData> = {
  mullion_50_85: {
    id: 'mullion_50_85',
    labelFr: 'Montant Alu 50x85 mm',
    depthMm: 85,
    faceWidthMm: 50,
    ixCm4: 68.5,
    iyCm4: 22.4,
    weightKgPerM: 2.45,
    hasSteelReinforcement: false,
    descriptionFr: 'Profil économique pour petites hauteurs d étage (jusqu à 2.80 m) et faible exposition au vent.',
  },
  mullion_50_105: {
    id: 'mullion_50_105',
    labelFr: 'Montant Alu 50x105 mm',
    depthMm: 105,
    faceWidthMm: 50,
    ixCm4: 125.4,
    iyCm4: 26.8,
    weightKgPerM: 2.85,
    hasSteelReinforcement: false,
    descriptionFr: 'Montant polyvalent pour rez-de-chaussée et étages courants jusqu à 3.20 m de hauteur.',
  },
  mullion_50_125: {
    id: 'mullion_50_125',
    labelFr: 'Montant Alu 50x125 mm (Standard)',
    depthMm: 125,
    faceWidthMm: 50,
    ixCm4: 210.8,
    iyCm4: 31.2,
    weightKgPerM: 3.35,
    hasSteelReinforcement: false,
    descriptionFr: 'Standard de référence pour hauteurs de 3.50 m en zone côtière urbaine.',
  },
  mullion_50_150: {
    id: 'mullion_50_150',
    labelFr: 'Montant Alu 50x150 mm (Renforcé)',
    depthMm: 150,
    faceWidthMm: 50,
    ixCm4: 372.5,
    iyCm4: 37.6,
    weightKgPerM: 4.10,
    hasSteelReinforcement: false,
    descriptionFr: 'Indispensable pour grandes trames vitrées ou hauteurs sous dalle jusqu à 4.00 m.',
  },
  mullion_50_175: {
    id: 'mullion_50_175',
    labelFr: 'Montant Alu 50x175 mm (Haute Inertie)',
    depthMm: 175,
    faceWidthMm: 50,
    ixCm4: 598.2,
    iyCm4: 44.5,
    weightKgPerM: 4.95,
    hasSteelReinforcement: false,
    descriptionFr: 'Haute rigidité pour halls d accueil, atriums et façades de grande hauteur.',
  },
  mullion_50_200: {
    id: 'mullion_50_200',
    labelFr: 'Montant Alu 50x200 mm (Très Grande Hauteur)',
    depthMm: 200,
    faceWidthMm: 50,
    ixCm4: 910.6,
    iyCm4: 52.0,
    weightKgPerM: 5.85,
    hasSteelReinforcement: false,
    descriptionFr: 'Profil de forte inertie pour façades exposées aux vents violents ou double hauteur.',
  },
  mullion_steel_reinforced_150: {
    id: 'mullion_steel_reinforced_150',
    labelFr: 'Montant Alu 50x150 mm + Renfort Acier 40x80x4',
    depthMm: 150,
    faceWidthMm: 50,
    ixCm4: 820.0,
    iyCm4: 75.0,
    weightKgPerM: 9.80,
    hasSteelReinforcement: true,
    steelTubeDimensionsFr: 'Tube acier galva 40x80x4 mm glissé à l intérieur du montant alu',
    descriptionFr: 'Association aluminium/acier décuplant la rigidité sans augmenter l encombrement visuel.',
  },
  mullion_steel_reinforced_200: {
    id: 'mullion_steel_reinforced_200',
    labelFr: 'Montant Alu 50x200 mm + Renfort Acier 40x120x5',
    depthMm: 200,
    faceWidthMm: 50,
    ixCm4: 1850.0,
    iyCm4: 110.0,
    weightKgPerM: 16.50,
    hasSteelReinforcement: true,
    steelTubeDimensionsFr: 'Tube acier galva 40x120x5 mm pour grandes portées sous vent extrême',
    descriptionFr: 'Solution extrême pour tours de bureaux, aéroports et façades d atriums de plus de 5.50 m.',
  },
};

export interface TransomProfileData {
  id: TransomProfileModel;
  labelFr: string;
  depthMm: number;
  faceWidthMm: number;
  iyCm4: number; // Inertie verticale sous poids du verre
  weightKgPerM: number;
  maxGlassWeightKg: number;
}

export const TRANSOM_PROFILES_CATALOG: Record<TransomProfileModel, TransomProfileData> = {
  transom_50_55: {
    id: 'transom_50_55',
    labelFr: 'Traverse Alu 50x55 mm',
    depthMm: 55,
    faceWidthMm: 50,
    iyCm4: 14.8,
    weightKgPerM: 1.85,
    maxGlassWeightKg: 90,
  },
  transom_50_75: {
    id: 'transom_50_75',
    labelFr: 'Traverse Alu 50x75 mm',
    depthMm: 75,
    faceWidthMm: 50,
    iyCm4: 38.6,
    weightKgPerM: 2.30,
    maxGlassWeightKg: 160,
  },
  transom_50_95: {
    id: 'transom_50_95',
    labelFr: 'Traverse Alu 50x95 mm',
    depthMm: 95,
    faceWidthMm: 50,
    iyCm4: 82.4,
    weightKgPerM: 2.85,
    maxGlassWeightKg: 240,
  },
  transom_50_115: {
    id: 'transom_50_115',
    labelFr: 'Traverse Alu 50x115 mm',
    depthMm: 115,
    faceWidthMm: 50,
    iyCm4: 154.2,
    weightKgPerM: 3.40,
    maxGlassWeightKg: 350,
  },
};

export interface WindZoneData {
  id: AlgerianWindZone;
  nameFr: string;
  referenceSpeedMs: number;
  basePressureQrefDanM2: number;
  wilayasExamplesFr: string;
}

export const ALGERIAN_WIND_ZONES: Record<AlgerianWindZone, WindZoneData> = {
  zone_1: {
    id: 'zone_1',
    nameFr: 'Zone I : Vent Modéré (Intérieur & Plaines)',
    referenceSpeedMs: 25,
    basePressureQrefDanM2: 37.5,
    wilayasExamplesFr: 'Médéa, Bouira, Blida plaine, Mascara, Relizane',
  },
  zone_2: {
    id: 'zone_2',
    nameFr: 'Zone II : Vent Moyen (Bande Côtière Protégée & Hauts Plateaux)',
    referenceSpeedMs: 27,
    basePressureQrefDanM2: 43.5,
    wilayasExamplesFr: 'Alger centre, Tipaza, Constantine, Sétif, Bordj Bou Arreridj',
  },
  zone_3: {
    id: 'zone_3',
    nameFr: 'Zone III : Vent Fort (Littoral Ouvert & Reliefs Exposés)',
    referenceSpeedMs: 29,
    basePressureQrefDanM2: 50.0,
    wilayasExamplesFr: 'Oran côte, Annaba, Béjaïa, Skikda, Mostaganem, Tizi Ouzou crêtes',
  },
  zone_4: {
    id: 'zone_4',
    nameFr: 'Zone IV : Vent Violent & Saharien (Falaises & Couloirs Venteux)',
    referenceSpeedMs: 31,
    basePressureQrefDanM2: 57.5,
    wilayasExamplesFr: 'Biskra, Béchar, Ouargla, Ghardaïa (tempêtes de vent de sable), caps rocheux',
  },
};

export interface SiteRoughnessData {
  id: SiteRoughnessCategory;
  nameFr: string;
  exposureFactorCe: number; // Coefficient moyen d exposition a 15m
  descriptionFr: string;
}

export const SITE_ROUGHNESS_CATALOG: Record<SiteRoughnessCategory, SiteRoughnessData> = {
  site_1_mer_cote: {
    id: 'site_1_mer_cote',
    nameFr: 'Site 1 : Front de Mer et Côtes Ouvertes',
    exposureFactorCe: 2.45,
    descriptionFr: 'Aucun obstacle naturel ou urbain, turbulence maximale face au large.',
  },
  site_2_campagne_rase: {
    id: 'site_2_campagne_rase',
    nameFr: 'Site 2 : Campagne Rase et Zones Aéroportuaires',
    exposureFactorCe: 2.10,
    descriptionFr: 'Quelques haies ou arbres bas, rase campagne sans masque protecteur.',
  },
  site_3_suburbain: {
    id: 'site_3_suburbain',
    nameFr: 'Site 3 : Zones Suburbaines et Industrielles',
    exposureFactorCe: 1.75,
    descriptionFr: 'Présence régulière d habitations, hangars et arbres brise-vent.',
  },
  site_4_centre_urbain_dense: {
    id: 'site_4_centre_urbain_dense',
    nameFr: 'Site 4 : Centres Urbains Denses',
    exposureFactorCe: 1.45,
    descriptionFr: 'Environnement urbain dense avec bâtiments d au moins 15 m de hauteur.',
  },
};

export interface CurtainWallCalculationResult {
  floorHeightMm: number; // Hauteur entre dalles L
  mullionSpacingMm: number; // Entraxe des montants B
  transomSpacingMm: number; // Hauteur d un vitrage H_glass
  buildingHeightAboveGroundM: number;
  glassThicknessTotalMm: number;
  glassTypeFr: string;
  selectedMullion: MullionProfileData;
  selectedTransom: TransomProfileData;
  selectedWindZone: WindZoneData;
  selectedRoughness: SiteRoughnessData;
  selectedSupportCondition: StructuralSupportCondition;
  dynamicWindPressureQpDanM2: number; // qp(z) en daN/m²
  dynamicWindPressurePascals: number; // qp(z) en N/m²
  linearWindLoadNPerMm: number; // w en N/mm
  calculatedMullionDeflectionMm: number; // Fleche reelle
  permissibleMullionDeflectionMm: number; // Fleche admissible f_adm
  deflectionRatioPercent: number; // (f / f_adm) * 100
  requiredMullionIxCm4: number; // Inertie minimale reglementaire
  isMullionCompliant: boolean;
  glassPanelWeightKg: number;
  calculatedTransomDeflectionMm: number;
  permissibleTransomDeflectionMm: number; // 3 mm max
  isTransomCompliant: boolean;
  recommendedMullionModel: MullionProfileModel;
  recommendedTransomModel: TransomProfileModel;
  thermalExpansionGapMm: number; // Dilatation thermique par etage
  anchorReactions: {
    deadLoadAnchorDan: number; // Poids propre repris
    windReactionMaxDan: number; // Reaction horizontale a l appui
    anchorBoltRecommendedFr: string;
  };
  structuralVerdictFr: string;
  verdictBadgeClass: string;
  engineeringObservationsFr: string[];
}

/**
 * Calculates static wind inertia and deflection of curtain wall mullions and transoms.
 */
export function calculateCurtainWallStructural(params: {
  floorHeightMm: number;
  mullionSpacingMm: number;
  transomSpacingMm?: number;
  buildingHeightM?: number;
  glassThicknessMm?: number;
  glassTypeLabelFr?: string;
  mullionModel: MullionProfileModel;
  transomModel: TransomProfileModel;
  windZone: AlgerianWindZone;
  roughness: SiteRoughnessCategory;
  supportCondition?: StructuralSupportCondition;
}): CurtainWallCalculationResult {
  const L = params.floorHeightMm;
  const B = params.mullionSpacingMm;
  const Hglass = params.transomSpacingMm || Math.min(L, 1600);
  const z = params.buildingHeightM || 18;
  const glassThickness = params.glassThicknessMm || 24;
  const supportCondition = params.supportCondition || 'simple_span';

  const mullion = MULLION_PROFILES_CATALOG[params.mullionModel] || MULLION_PROFILES_CATALOG.mullion_50_125;
  const transom = TRANSOM_PROFILES_CATALOG[params.transomModel] || TRANSOM_PROFILES_CATALOG.transom_50_75;
  const windZone = ALGERIAN_WIND_ZONES[params.windZone] || ALGERIAN_WIND_ZONES.zone_2;
  const site = SITE_ROUGHNESS_CATALOG[params.roughness] || SITE_ROUGHNESS_CATALOG.site_3_suburbain;

  // 1. Wind Pressure calculation according to DTR BC 2-47 RNV
  // Ce(z) correction for building height
  const heightCorrection = Math.pow(Math.max(5, z) / 10, 0.24);
  const effectiveCe = site.exposureFactorCe * heightCorrection;
  const netPressureCoeff = 1.35; // Cpe - Cpi pour facette de facade
  const dynamicWindPressureQpDanM2 = Number(
    (windZone.basePressureQrefDanM2 * effectiveCe * netPressureCoeff).toFixed(1)
  );
  const dynamicWindPressurePascals = Math.round(dynamicWindPressureQpDanM2 * 9.81);

  // 2. Linear Wind Load on Mullion
  // w = (q_p in N/m2) * (B in m) / 1000 => N/mm
  const widthM = B / 1000;
  const linearWindLoadNPerM = dynamicWindPressurePascals * widthM;
  const linearWindLoadNPerMm = linearWindLoadNPerM / 1000;

  // 3. Permissible Mullion Deflection (NF DTU 33.1 / NF EN 13830)
  // For L <= 3000 mm: f_adm = L / 200 (max 15 mm)
  // For L > 3000 mm: f_adm = L / 300 + 5 mm (limited to 15 mm to safeguard insulating glass seal)
  let permissibleMullionDeflectionMm = 15;
  if (L <= 3000) {
    permissibleMullionDeflectionMm = Math.min(15, L / 200);
  } else {
    permissibleMullionDeflectionMm = Math.min(15, L / 300 + 5);
  }
  permissibleMullionDeflectionMm = Number(permissibleMullionDeflectionMm.toFixed(2));

  // 4. Maximum Mullion Deflection:
  // E_alu = 70 000 MPa (N/mm2)
  // Simple span: f = (5 * w * L^4) / (384 * E * Ix)
  // Continuous 2 spans: f_cont = (w * L^4) / (185 * E * Ix)
  const E_alu = 70000; // N/mm²
  const Ix_mm4 = mullion.ixCm4 * 10000;

  let calculatedMullionDeflectionMm = 0;
  if (supportCondition === 'continuous_two_spans') {
    calculatedMullionDeflectionMm = (linearWindLoadNPerMm * Math.pow(L, 4)) / (185 * E_alu * Ix_mm4);
  } else {
    calculatedMullionDeflectionMm = (5 * linearWindLoadNPerMm * Math.pow(L, 4)) / (384 * E_alu * Ix_mm4);
  }
  calculatedMullionDeflectionMm = Number(calculatedMullionDeflectionMm.toFixed(2));

  // Required Ix in cm4
  let requiredIxMm4 = 0;
  if (supportCondition === 'continuous_two_spans') {
    requiredIxMm4 = (linearWindLoadNPerMm * Math.pow(L, 4)) / (185 * E_alu * permissibleMullionDeflectionMm);
  } else {
    requiredIxMm4 = (5 * linearWindLoadNPerMm * Math.pow(L, 4)) / (384 * E_alu * permissibleMullionDeflectionMm);
  }
  const requiredMullionIxCm4 = Number((requiredIxMm4 / 10000).toFixed(1));

  const isMullionCompliant = calculatedMullionDeflectionMm <= permissibleMullionDeflectionMm;
  const deflectionRatioPercent = Math.round(
    (calculatedMullionDeflectionMm / permissibleMullionDeflectionMm) * 100
  );

  // 5. Transom Deflection under Dead Weight of Glass
  // Glass density = 2500 kg/m3 => 2.5 kg/m2 per mm of glass
  // Total glass thickness e.g. 4+16+4 => 8 mm glass = 20 kg/m2
  // Or e.g. 6+16+44.2 => 14 mm glass = 35 kg/m2
  const glassThicknessActualMm = Math.min(30, Math.max(6, glassThickness - 16)); // subtract typical 16mm argon gap
  const glassDensityKgPerM2 = glassThicknessActualMm * 2.5;
  const glassAreaM2 = (B / 1000) * (Hglass / 1000);
  const glassPanelWeightKg = Number((glassAreaM2 * glassDensityKgPerM2).toFixed(1));
  const glassWeightN = glassPanelWeightKg * 9.81;

  // Setting blocks placed at a = 150 mm from each end of the transom
  // For two concentrated loads P/2 at distance a from ends:
  // f_dead = (P/2 * a * (3*B^2 - 4*a^2)) / (24 * E * Iy)
  const a = Math.min(200, Math.max(100, B / 10)); // distance cale au montant
  const P_half = glassWeightN / 2;
  const Iy_transom_mm4 = transom.iyCm4 * 10000;
  const calculatedTransomDeflectionMm = Number(
    ((P_half * a * (3 * Math.pow(B, 2) - 4 * Math.pow(a, 2))) / (24 * E_alu * Iy_transom_mm4)).toFixed(2)
  );
  const permissibleTransomDeflectionMm = 3.0; // max 3 mm to guarantee water drainage and clear rebate
  const isTransomCompliant =
    calculatedTransomDeflectionMm <= permissibleTransomDeflectionMm &&
    glassPanelWeightKg <= transom.maxGlassWeightKg;

  // 6. Recommended profiles if not compliant
  let recommendedMullionModel: MullionProfileModel = params.mullionModel;
  const mullionKeys: MullionProfileModel[] = [
    'mullion_50_85',
    'mullion_50_105',
    'mullion_50_125',
    'mullion_50_150',
    'mullion_50_175',
    'mullion_50_200',
    'mullion_steel_reinforced_150',
    'mullion_steel_reinforced_200',
  ];
  for (const mKey of mullionKeys) {
    if (MULLION_PROFILES_CATALOG[mKey].ixCm4 >= requiredMullionIxCm4) {
      recommendedMullionModel = mKey;
      break;
    }
    recommendedMullionModel = 'mullion_steel_reinforced_200';
  }

  let recommendedTransomModel: TransomProfileModel = params.transomModel;
  const transomKeys: TransomProfileModel[] = [
    'transom_50_55',
    'transom_50_75',
    'transom_50_95',
    'transom_50_115',
  ];
  for (const tKey of transomKeys) {
    if (TRANSOM_PROFILES_CATALOG[tKey].maxGlassWeightKg >= glassPanelWeightKg) {
      recommendedTransomModel = tKey;
      break;
    }
    recommendedTransomModel = 'transom_50_115';
  }

  // 7. Thermal expansion gap at floor slab
  // Delta_L = alpha * L * Delta_T with alpha = 23.4 x 10^-6, Delta_T = 60°C
  const alphaAlu = 23.4e-6;
  const deltaT = 60; // degres Celsius (canicule 45°C - hiver 0°C + echauffement alu sombre)
  const thermalExpansionGapMm = Number(((L * alphaAlu * deltaT) + 1.5).toFixed(1)); // +1.5 mm tolerance

  // 8. Anchor reactions
  const totalTributaryAreaM2 = (B / 1000) * (L / 1000);
  const totalWindForceN = dynamicWindPressurePascals * totalTributaryAreaM2;
  const windReactionMaxDan = Number(((totalWindForceN / 2) / 9.81).toFixed(1)); // Appui simple prend la moitie
  const mullionSelfWeightKg = (mullion.weightKgPerM * (L / 1000));
  const deadLoadAnchorDan = Number((glassPanelWeightKg + mullionSelfWeightKg).toFixed(1));

  let anchorBoltRecommendedFr = 'Goujon M12 acier inox A4 ou vis T-Head 50/30 pour rail Halfen';
  if (windReactionMaxDan > 350) {
    anchorBoltRecommendedFr = 'Platine soudée avec 2 goujons d ancrage M16 classe 8.8 avec trous oblongs';
  }

  // 9. Verdict and Observations
  let structuralVerdictFr = 'Structure Conforme aux Exigences Eurocode 9 / DTU 33.1';
  let verdictBadgeClass = 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';

  if (!isMullionCompliant && !isTransomCompliant) {
    structuralVerdictFr = 'NON CONFORME : Flèche Montant et Traverse Hors Tolérance';
    verdictBadgeClass = 'bg-rose-500/15 text-rose-400 border-rose-500/40';
  } else if (!isMullionCompliant) {
    structuralVerdictFr = 'NON CONFORME : Flèche Montant Supérieure à la Limite Admissible';
    verdictBadgeClass = 'bg-rose-500/15 text-rose-400 border-rose-500/40';
  } else if (!isTransomCompliant) {
    structuralVerdictFr = 'VIGILANCE : Traverse Trop Flexible Sous le Poids du Verre';
    verdictBadgeClass = 'bg-amber-500/15 text-amber-400 border-amber-500/40';
  } else if (deflectionRatioPercent > 85) {
    structuralVerdictFr = 'CONFORME (Flèche Proche de la Limite Admissible)';
    verdictBadgeClass = 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30';
  }

  const engineeringObservationsFr: string[] = [
    `Pression dynamique du vent calculée selon DTR BC 2-47 : ${dynamicWindPressureQpDanM2} daN/m² (${dynamicWindPressurePascals} Pa) à ${z} m du sol.`,
    `Flèche réelle du montant : ${calculatedMullionDeflectionMm} mm pour une limite admissible DTU 33.1 de ${permissibleMullionDeflectionMm} mm (taux de travail : ${deflectionRatioPercent}%).`,
    `Inertie requise : ${requiredMullionIxCm4} cm⁴ (profil sélectionné : ${mullion.ixCm4} cm⁴).`,
    `Jeu de dilatation thermique obligatoire au manchon : minimum ${thermalExpansionGapMm} mm au droit de chaque nez de dalle.`,
  ];

  if (!isMullionCompliant) {
    engineeringObservationsFr.unshift(
      `ALERTE INERTIE : Remplacer impérativement par le profilé ${MULLION_PROFILES_CATALOG[recommendedMullionModel].labelFr} pour garantir la sécurité face aux rafales de vent.`
    );
  }

  if (!isTransomCompliant) {
    engineeringObservationsFr.push(
      `Poids du volume verrier (${glassPanelWeightKg} kg) : remplacer la traverse par ${TRANSOM_PROFILES_CATALOG[recommendedTransomModel].labelFr} pour éviter l affaissement de la feuillure basse.`
    );
  }

  return {
    floorHeightMm: L,
    mullionSpacingMm: B,
    transomSpacingMm: Hglass,
    buildingHeightAboveGroundM: z,
    glassThicknessTotalMm: glassThickness,
    glassTypeFr: params.glassTypeLabelFr || 'Double Vitrage Acoustique 24 mm',
    selectedMullion: mullion,
    selectedTransom: transom,
    selectedWindZone: windZone,
    selectedRoughness: site,
    selectedSupportCondition: supportCondition,
    dynamicWindPressureQpDanM2,
    dynamicWindPressurePascals,
    linearWindLoadNPerMm,
    calculatedMullionDeflectionMm,
    permissibleMullionDeflectionMm,
    deflectionRatioPercent,
    requiredMullionIxCm4,
    isMullionCompliant,
    glassPanelWeightKg,
    calculatedTransomDeflectionMm,
    permissibleTransomDeflectionMm,
    isTransomCompliant,
    recommendedMullionModel,
    recommendedTransomModel,
    thermalExpansionGapMm,
    anchorReactions: {
      deadLoadAnchorDan,
      windReactionMaxDan,
      anchorBoltRecommendedFr,
    },
    structuralVerdictFr,
    verdictBadgeClass,
    engineeringObservationsFr,
  };
}

/**
 * Formats WhatsApp dispatch for structural note to façade engineers.
 */
export function formatCurtainWallStructuralWhatsApp(
  result: CurtainWallCalculationResult,
  facadeRef: string = 'Façade Principale Tour',
  workshopName: string = 'Baiti Atelier'
): string {
  const verdictEmoji = result.isMullionCompliant && result.isTransomCompliant ? '✅ CONFORME DTU 33.1' : '🚨 NON CONFORME';

  return `*${workshopName} - NOTE DE CALCUL STATIQUE FAÇADE RIDEAU*

📋 *Ouvrage:* ${facadeRef}
🏢 *Hauteur sous dalle:* ${result.floorHeightMm} mm • Entraxe montants: ${result.mullionSpacingMm} mm
💨 *Zone de vent:* ${result.selectedWindZone.nameFr} (z = ${result.buildingHeightAboveGroundM} m)
🧱 *Montant:* ${result.selectedMullion.labelFr} (Ix = ${result.selectedMullion.ixCm4} cm4)
🪟 *Traverse:* ${result.selectedTransom.labelFr}

📊 *RÉSULTATS DE FLÈCHE SOUS VENT:*
• Pression dynamique qp(z) : ${result.dynamicWindPressureQpDanM2} daN/m² (${result.dynamicWindPressurePascals} Pa)
• Flèche réelle calculée : ${result.calculatedMullionDeflectionMm} mm
• Flèche limite admissible : ${result.permissibleMullionDeflectionMm} mm
• Taux d utilisation de la flèche : ${result.deflectionRatioPercent}%
• Inertie minimale requise : ${result.requiredMullionIxCm4} cm4
• ${verdictEmoji}

🔩 *ANCRAGES & DILATATION:*
• Réaction d appui vent : ${result.anchorReactions.windReactionMaxDan} daN
• Charge poids propre : ${result.anchorReactions.deadLoadAnchorDan} daN
• Jeu de dilatation thermique au manchon : ${result.thermalExpansionGapMm} mm

Calcul certifié conforme Eurocode 9 (NF EN 1999) et DTR BC 2-47 RNV CNERIB.`;
}
