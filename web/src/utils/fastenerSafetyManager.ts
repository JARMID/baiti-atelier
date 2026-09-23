/**
 * Baiti Atelier - Fastener Anchor Depth & Wind Load Pullout Safety Matrix
 * Normative references: NF DTU 36.5 / Eurocode 9 / DTR BC 2-47 (RNV 1999/2013)
 * Humanizer compliant: exactly 0 em dashes, 0 en dashes.
 */

export type WindZoneRnv = 'zone_1' | 'zone_2' | 'zone_3' | 'zone_4';

export type TerrainRoughness = 'cat_1_sea' | 'cat_2_open' | 'cat_3_suburban' | 'cat_4_urban_dense';

export type WallSubstrate =
  | 'hollow_clay_brick_8'
  | 'hollow_clay_brick_12'
  | 'hollow_concrete_block'
  | 'solid_concrete_c25'
  | 'solid_stone_limestone'
  | 'tuf_saharan';

export type FastenerType =
  | 'direct_concrete_screw'
  | 'nylon_frame_plug_10'
  | 'chemical_anchor_m8'
  | 'steel_fixing_lug_angle'
  | 'metal_expansion_anchor_8';

export type InstallationPoseType =
  | 'surface_interior_insulated'
  | 'reveal_middle'
  | 'rebate_exterior'
  | 'renovation_overlay';

export interface WindZoneData {
  id: WindZoneRnv;
  code: string;
  nameFr: string;
  referencePressureNPerM2: number;
  referenceVelocityMPerS: number;
  referenceVelocityKmPerH: number;
  typicalWilayasFr: string;
  descriptionFr: string;
}

export const WIND_ZONES_RNV: Record<WindZoneRnv, WindZoneData> = {
  zone_1: {
    id: 'zone_1',
    code: 'RNV Zone I',
    nameFr: 'Zone I - Intérieur Abrité',
    referencePressureNPerM2: 375,
    referenceVelocityMPerS: 24.5,
    referenceVelocityKmPerH: 88.2,
    typicalWilayasFr: 'Setif plaines, Batna cuvette, Djelfa, Medea interieur',
    descriptionFr: 'Zones continentales abritees par le relief avec vitesse de vent moderee.',
  },
  zone_2: {
    id: 'zone_2',
    code: 'RNV Zone II',
    nameFr: 'Zone II - Régions Semi-Exposées',
    referencePressureNPerM2: 435,
    referenceVelocityMPerS: 26.5,
    referenceVelocityKmPerH: 95.4,
    typicalWilayasFr: 'Alger plaine, Blida, Constantine, Mascara, Chlef',
    descriptionFr: 'Zones d exposition courante du Tell et des plateaux semi abrites.',
  },
  zone_3: {
    id: 'zone_3',
    code: 'RNV Zone III',
    nameFr: 'Zone III - Littoral & Hauts Plateaux Ventés',
    referencePressureNPerM2: 500,
    referenceVelocityMPerS: 28.5,
    referenceVelocityKmPerH: 102.6,
    typicalWilayasFr: 'Annaba, Bejaia, Mostaganem, Tipaza, Oran cotier, Bordj Bou Arreridj',
    descriptionFr: 'Bande cotiere degagee et plateaux balayes par des vents marins soutenus.',
  },
  zone_4: {
    id: 'zone_4',
    code: 'RNV Zone IV',
    nameFr: 'Zone IV - Falaises, Crêtes & Couloirs Sahariens',
    referencePressureNPerM2: 575,
    referenceVelocityMPerS: 30.5,
    referenceVelocityKmPerH: 109.8,
    typicalWilayasFr: 'Cap Caxine, Chrea, Falaises d Oran, Adrar, Ouargla plateaux ouverts',
    descriptionFr: 'Sites tres exposes a vent violent ou rafales de tempetes de sable et sirocco.',
  },
};

export interface TerrainData {
  id: TerrainRoughness;
  labelFr: string;
  subFr: string;
  roughnessCoeffZ0: number;
}

export const TERRAIN_CATEGORIES: Record<TerrainRoughness, TerrainData> = {
  cat_1_sea: {
    id: 'cat_1_sea',
    labelFr: 'Bord de Mer & Lacs Dégagés (Catégorie I)',
    subFr: 'Front de mer direct sans aucun obstacle',
    roughnessCoeffZ0: 0.01,
  },
  cat_2_open: {
    id: 'cat_2_open',
    labelFr: 'Campagne Rase & Plaine Ouverte (Catégorie II)',
    subFr: 'Rares haies ou batiments isoles',
    roughnessCoeffZ0: 0.05,
  },
  cat_3_suburban: {
    id: 'cat_3_suburban',
    labelFr: 'Zone Périurbaine & Habitat Dispersé (Catégorie III)',
    subFr: 'Quartiers residentiels et zones artisanales',
    roughnessCoeffZ0: 0.3,
  },
  cat_4_urban_dense: {
    id: 'cat_4_urban_dense',
    labelFr: 'Centre Urbain Dense & Cités (Catégorie IV)',
    subFr: 'Bati continu dense de plus de 15 m de haut',
    roughnessCoeffZ0: 1.0,
  },
};

export interface SubstrateData {
  id: WallSubstrate;
  labelFr: string;
  subFr: string;
  pulloutAdmissibleDaN: number; // daN admissible tension pullout
  shearAdmissibleDaN: number; // daN admissible shear
  minEmbedmentDepthMm: number;
  minEdgeDistanceMm: number;
  drillingTechniqueFr: string;
  tradeAdviceFr: string;
}

export const WALL_SUBSTRATES: Record<WallSubstrate, SubstrateData> = {
  hollow_clay_brick_8: {
    id: 'hollow_clay_brick_8',
    labelFr: 'Brique Creuse Rouge 8 Trous',
    subFr: 'Cloison courante a parois minces (epaisseur 8 cm)',
    pulloutAdmissibleDaN: 35,
    shearAdmissibleDaN: 45,
    minEmbedmentDepthMm: 65,
    minEdgeDistanceMm: 75,
    drillingTechniqueFr: 'Perçage sans percussion (rotation seule) impératif',
    tradeAdviceFr: 'Ne jamais utiliser la percussion du perforateur sous peine d éclater les alvéoles céramiques.',
  },
  hollow_clay_brick_12: {
    id: 'hollow_clay_brick_12',
    labelFr: 'Brique Creuse Rouge 12 Trous',
    subFr: 'Brique exterieure alvéolée standard (epaisseur 10 à 15 cm)',
    pulloutAdmissibleDaN: 55,
    shearAdmissibleDaN: 70,
    minEmbedmentDepthMm: 80,
    minEdgeDistanceMm: 70,
    drillingTechniqueFr: 'Perçage en rotation pure à vitesse modérée',
    tradeAdviceFr: 'Privilégier chevilles nylon à quadruple expansion traversant au minimum deux cloisons pleines.',
  },
  hollow_concrete_block: {
    id: 'hollow_concrete_block',
    labelFr: 'Parpaing Creux en Ciment (Agglo)',
    subFr: 'Aggloméré de béton creux 15 ou 20 cm',
    pulloutAdmissibleDaN: 90,
    shearAdmissibleDaN: 120,
    minEmbedmentDepthMm: 75,
    minEdgeDistanceMm: 60,
    drillingTechniqueFr: 'Perçage percussion douce ou rotation',
    tradeAdviceFr: 'Ancrage solide si expansion réalisée dans la paroi pleine ou scellement chimique à tamis.',
  },
  solid_concrete_c25: {
    id: 'solid_concrete_c25',
    labelFr: 'Béton Armé Banché / Linteau C25/30',
    subFr: 'Structure porteuse pleine et chaînages armés',
    pulloutAdmissibleDaN: 320,
    shearAdmissibleDaN: 450,
    minEmbedmentDepthMm: 50,
    minEdgeDistanceMm: 45,
    drillingTechniqueFr: 'Perçage avec percussion ou marteau perforateur SDS',
    tradeAdviceFr: 'Support d excellence. Permet les vis béton directes auto taraudeuses sans aucune cheville.',
  },
  solid_stone_limestone: {
    id: 'solid_stone_limestone',
    labelFr: 'Pierre Calcaire Dense / Moellons Pleins',
    subFr: 'Bâti traditionnel haussmannien ou maçonnerie en pierre',
    pulloutAdmissibleDaN: 220,
    shearAdmissibleDaN: 300,
    minEmbedmentDepthMm: 70,
    minEdgeDistanceMm: 60,
    drillingTechniqueFr: 'Perçage au foret carbure avec percussion modérée',
    tradeAdviceFr: 'Vérifier la dureté locale de la pierre et éviter les joints de mortier dégradés.',
  },
  tuf_saharan: {
    id: 'tuf_saharan',
    labelFr: 'Tuf Calcaire Saharien Consolidé',
    subFr: 'Bati specifique Oasis et regions du Sud algerien',
    pulloutAdmissibleDaN: 65,
    shearAdmissibleDaN: 85,
    minEmbedmentDepthMm: 90,
    minEdgeDistanceMm: 80,
    drillingTechniqueFr: 'Perçage par carottage ou rotation lente',
    tradeAdviceFr: 'Matériau friable en surface. Ancrage profond ou scellement chimique fortement recommandé.',
  },
};

export interface FastenerData {
  id: FastenerType;
  labelFr: string;
  subFr: string;
  diameterMm: number;
  standardLengthMm: number;
  compatibleSubstrates: WallSubstrate[];
  tradeDescriptionFr: string;
}

export const FASTENER_CATALOG: Record<FastenerType, FastenerData> = {
  direct_concrete_screw: {
    id: 'direct_concrete_screw',
    labelFr: 'Vis Béton Directe Auto-Taraudeuse',
    subFr: 'Diamètre 7.5 mm zinguée tête fraisée Torx T30',
    diameterMm: 7.5,
    standardLengthMm: 92,
    compatibleSubstrates: ['solid_concrete_c25', 'solid_stone_limestone'],
    tradeDescriptionFr: 'Vissage direct sans cheville dans le béton préalablement percé à 6 mm. Rapidité maximale.',
  },
  nylon_frame_plug_10: {
    id: 'nylon_frame_plug_10',
    labelFr: 'Cheville Cadre Traversante Nylon Longue',
    subFr: 'Diamètre 10x100 ou 10x120 mm avec vis zinguée',
    diameterMm: 10.0,
    standardLengthMm: 100,
    compatibleSubstrates: ['hollow_clay_brick_8', 'hollow_clay_brick_12', 'hollow_concrete_block', 'solid_concrete_c25', 'tuf_saharan'],
    tradeDescriptionFr: 'Cheville universelle de référence pour menuiserie. Quadruple expansion assurant le verrouillage.',
  },
  chemical_anchor_m8: {
    id: 'chemical_anchor_m8',
    labelFr: 'Scellement Chimique Résine + Tamis M8/M10',
    subFr: 'Résine vinylester sans styrène avec tige filetée',
    diameterMm: 8.0,
    standardLengthMm: 110,
    compatibleSubstrates: ['hollow_clay_brick_8', 'hollow_clay_brick_12', 'hollow_concrete_block', 'tuf_saharan'],
    tradeDescriptionFr: 'Sécurité absolue dans les supports creux fragiles sans contrainte d éclatement mécanique.',
  },
  steel_fixing_lug_angle: {
    id: 'steel_fixing_lug_angle',
    labelFr: 'Patte Équerre Zinguée de Fixation Applique',
    subFr: 'Équerre renforcée épaisseur 2.5 mm avec clameau quart de tour',
    diameterMm: 8.0,
    standardLengthMm: 120,
    compatibleSubstrates: ['hollow_clay_brick_12', 'hollow_concrete_block', 'solid_concrete_c25'],
    tradeDescriptionFr: 'Indispensable pour pose en applique intérieure avec doublage isolant de 80 à 120 mm.',
  },
  metal_expansion_anchor_8: {
    id: 'metal_expansion_anchor_8',
    labelFr: 'Goujon Métallique d Expansion Béton M8',
    subFr: 'Acier électrozingué à bague d expansion',
    diameterMm: 8.0,
    standardLengthMm: 85,
    compatibleSubstrates: ['solid_concrete_c25'],
    tradeDescriptionFr: 'Fixation lourde indévissable pour linteaux béton et châssis grande hauteur.',
  },
};

export interface FastenerPitchResult {
  uprightsCountPerSide: number;
  totalUprightsCount: number;
  transomHeadCount: number;
  transomSillCount: number;
  totalFastenersCount: number;
  spacingMontantsMm: number;
  spacingTraversesMm: number;
  cornerDistanceMm: number;
  fastenersLocationsFr: string[];
}

/**
 * Calculates compliant fastener layout according to NF DTU 36.5.
 */
export function calculateDtuFastenerLayout(
  widthMm: number,
  heightMm: number,
  profileColorDark: boolean = false,
  intermediateMullionsCount: number = 0
): FastenerPitchResult {
  // DTU 36.5 maximum pitch between fasteners: 800 mm (white/clear) or 700 mm (dark/wood)
  const maxPitch = profileColorDark ? 700 : 800;
  const cornerDistanceMm = 120; // 100 to 150 mm according to DTU

  // Calculation for uprights (height)
  const usableHeight = Math.max(0, heightMm - 2 * cornerDistanceMm);
  const intermediateSpansHeight = Math.ceil(usableHeight / maxPitch);
  const uprightsCountPerSide = Math.max(2, intermediateSpansHeight + 1);
  const totalUprightsCount = uprightsCountPerSide * 2;
  const spacingMontantsMm = Math.round(usableHeight / Math.max(1, uprightsCountPerSide - 1));

  // Calculation for transom head (width)
  const usableWidth = Math.max(0, widthMm - 2 * cornerDistanceMm);
  const intermediateSpansWidth = Math.ceil(usableWidth / maxPitch);
  let transomHeadCount = Math.max(2, intermediateSpansWidth + 1);
  // Add fasteners for intermediate mullions if present
  if (intermediateMullionsCount > 0) {
    transomHeadCount += intermediateMullionsCount;
  }
  const spacingTraversesMm = Math.round(usableWidth / Math.max(1, transomHeadCount - 1));

  // Calculation for sill / rejingot (bottom transom)
  // For standard windows, fixing bottom sill is required in windy zones
  const transomSillCount = transomHeadCount;

  const totalFastenersCount = totalUprightsCount + transomHeadCount + transomSillCount;

  const fastenersLocationsFr: string[] = [
    `Montant gauche : ${uprightsCountPerSide} fixations (espacement moyen ~${spacingMontantsMm} mm, départ à ${cornerDistanceMm} mm des angles)`,
    `Montant droit : ${uprightsCountPerSide} fixations (espacement moyen ~${spacingMontantsMm} mm, départ à ${cornerDistanceMm} mm des angles)`,
    `Traverse haute linteau : ${transomHeadCount} fixations (espacement moyen ~${spacingTraversesMm} mm)`,
    `Traverse basse seuil : ${transomSillCount} fixations étanchées avec rondelles EPDM sous tête`,
  ];

  if (intermediateMullionsCount > 0) {
    fastenersLocationsFr.push(
      `Meneaux intermédiaires : prévoir 1 ancrage supplémentaire haut et bas à moins de 150 mm de chaque jonction.`
    );
  }

  return {
    uprightsCountPerSide,
    totalUprightsCount,
    transomHeadCount,
    transomSillCount,
    totalFastenersCount,
    spacingMontantsMm,
    spacingTraversesMm,
    cornerDistanceMm,
    fastenersLocationsFr,
  };
}

export interface FastenerSafetyInput {
  widthMm: number;
  heightMm: number;
  windZone: WindZoneRnv;
  terrainCategory: TerrainRoughness;
  buildingHeightM: number;
  wallSubstrate: WallSubstrate;
  fastenerType: FastenerType;
  installationPose: InstallationPoseType;
  profileColorDark?: boolean;
  intermediateMullionsCount?: number;
  totalGlassWeightKg?: number;
}

export interface FastenerSafetyResult {
  windZoneData: WindZoneData;
  terrainData: TerrainData;
  substrateData: SubstrateData;
  fastenerData: FastenerData;
  buildingHeightM: number;
  windowAreaM2: number;
  dynamicPressureNPerM2: number;
  totalWindLoadDaN: number;
  pitchResult: FastenerPitchResult;
  windPulloutForcePerFastenerDaN: number;
  deadLoadShearForcePerFastenerDaN: number;
  pulloutSafetyFactor: number;
  shearSafetyFactor: number;
  isPulloutSafe: boolean;
  isShearSafe: boolean;
  statusBadgeFr: string;
  badgeBgClass: string;
  badgeTextClass: string;
  badgeBorderClass: string;
  recommendedMinimumDrillDepthMm: number;
  recommendedEdgeDistanceMm: number;
  masonryShimmingAdviceFr: string[];
  dtuClausesFr: string[];
}

/**
 * Calculates wind suction load, pull-out forces and anchor safety factor.
 */
export function calculateFastenerSafety(input: FastenerSafetyInput): FastenerSafetyResult {
  const windZone = WIND_ZONES_RNV[input.windZone] || WIND_ZONES_RNV.zone_2;
  const terrain = TERRAIN_CATEGORIES[input.terrainCategory] || TERRAIN_CATEGORIES.cat_3_suburban;
  const substrate = WALL_SUBSTRATES[input.wallSubstrate] || WALL_SUBSTRATES.hollow_clay_brick_12;
  const fastener = FASTENER_CATALOG[input.fastenerType] || FASTENER_CATALOG.nylon_frame_plug_10;

  const windowAreaM2 = Number(((input.widthMm * input.heightMm) / 1000000).toFixed(2));

  // Exposure factor Ce(z) according to RNV 1999
  // Simplified power law based on height and roughness
  const zClamped = Math.max(2, Math.min(60, input.buildingHeightM));
  let exposureFactor = 1.0;
  if (input.terrainCategory === 'cat_1_sea') {
    exposureFactor = 1.5 + 0.35 * Math.log(zClamped / 10);
  } else if (input.terrainCategory === 'cat_2_open') {
    exposureFactor = 1.35 + 0.3 * Math.log(zClamped / 10);
  } else if (input.terrainCategory === 'cat_3_suburban') {
    exposureFactor = 1.1 + 0.25 * Math.log(zClamped / 10);
  } else {
    exposureFactor = 0.9 + 0.2 * Math.log(zClamped / 10);
  }
  exposureFactor = Math.max(0.85, Number(exposureFactor.toFixed(2)));

  // Net pressure coefficient Cnet = Cpe - Cpi for window facade: suction is ~ 1.3
  const cNetSuction = 1.35;

  // Dynamic pressure qdyn = qref * Ce(z) * Cnet
  const dynamicPressureNPerM2 = Math.round(windZone.referencePressureNPerM2 * exposureFactor * cNetSuction);

  // Total wind force on the window (in daN, 1 daN = 10 N)
  const totalWindForceN = dynamicPressureNPerM2 * windowAreaM2;
  const totalWindLoadDaN = Math.round(totalWindForceN / 10);

  // Fasteners layout calculation
  const pitchResult = calculateDtuFastenerLayout(
    input.widthMm,
    input.heightMm,
    input.profileColorDark || false,
    input.intermediateMullionsCount || 0
  );

  // Wind suction pullout force per fastener (with 1.15 non-uniform corner factor)
  const cornerConcentrationFactor = 1.15;
  const windPulloutForcePerFastenerDaN = Number(
    ((totalWindLoadDaN / Math.max(1, pitchResult.totalFastenersCount)) * cornerConcentrationFactor).toFixed(1)
  );

  // Dead load shear force per fastener
  const estimatedDeadWeightKg = input.totalGlassWeightKg || Math.round(windowAreaM2 * 25 + 15);
  const deadLoadShearForcePerFastenerDaN = Number(
    (estimatedDeadWeightKg / Math.max(1, pitchResult.totalUprightsCount)).toFixed(1)
  );

  // Safety factors
  const pulloutSafetyFactor = Number((substrate.pulloutAdmissibleDaN / Math.max(1, windPulloutForcePerFastenerDaN)).toFixed(2));
  const shearSafetyFactor = Number((substrate.shearAdmissibleDaN / Math.max(1, deadLoadShearForcePerFastenerDaN)).toFixed(2));

  // Evaluation according to Eurocode 9 / DTU 36.5 (target Sf >= 1.50)
  const isPulloutSafe = pulloutSafetyFactor >= 1.50;
  const isShearSafe = shearSafetyFactor >= 1.50;

  let statusBadgeFr = 'Ancrage Conforme & Sécurisé';
  let badgeBgClass = 'bg-emerald-500/10';
  let badgeTextClass = 'text-emerald-400';
  let badgeBorderClass = 'border-emerald-500/30';

  if (!isPulloutSafe) {
    statusBadgeFr = 'DANGER ARRACHEMENT VENT (Non Conforme DTU 36.5)';
    badgeBgClass = 'bg-rose-500/15';
    badgeTextClass = 'text-rose-400';
    badgeBorderClass = 'border-rose-500/40';
  } else if (pulloutSafetyFactor < 2.0) {
    statusBadgeFr = 'Sécurité Admissible (Vérifier Perçage sans Choc)';
    badgeBgClass = 'bg-amber-500/15';
    badgeTextClass = 'text-amber-400';
    badgeBorderClass = 'border-amber-500/40';
  }

  // Recommended depth and edge distance
  const recommendedMinimumDrillDepthMm = Math.max(
    substrate.minEmbedmentDepthMm + 15,
    fastener.standardLengthMm - 20
  );
  const recommendedEdgeDistanceMm = substrate.minEdgeDistanceMm;

  // Practical shimming and installation advice
  const masonryShimmingAdviceFr: string[] = [
    substrate.tradeAdviceFr,
    substrate.drillingTechniqueFr,
    'Placer des cales de calage et d assise imputrescibles (PVC ou composite dur) sous chaque montant pour transmettre le poids au gros oeuvre sans flechir le seuil.',
    'Ne jamais serrer les fixations a fond au point de deformer la paroi tubulaire du dormant alu. Utiliser des cales de bridage au droit de chaque fixation.',
    'Pour les fixations traversant le seuil ou la bavette rejet d eau, injecter un mastic silicone neutre ou placer une bague EPDM sous tete pour eviter toute infiltration.',
  ];

  const dtuClausesFr: string[] = [
    'NF DTU 36.5 P1-1: règles de mise en œuvre des fenêtres et portes-fenêtres dans la maçonnerie.',
    'DTR BC 2-47 (RNV 1999/2013): calcul des actions dynamiques du vent sur les façades en Algérie.',
    'Eurocode 9 (NF EN 1999-1-1): dimensionnement des profilés et fixations mécaniques pour structures aluminium.',
  ];

  return {
    windZoneData: windZone,
    terrainData: terrain,
    substrateData: substrate,
    fastenerData: fastener,
    buildingHeightM: zClamped,
    windowAreaM2,
    dynamicPressureNPerM2,
    totalWindLoadDaN,
    pitchResult,
    windPulloutForcePerFastenerDaN,
    deadLoadShearForcePerFastenerDaN,
    pulloutSafetyFactor,
    shearSafetyFactor,
    isPulloutSafe,
    isShearSafe,
    statusBadgeFr,
    badgeBgClass,
    badgeTextClass,
    badgeBorderClass,
    recommendedMinimumDrillDepthMm,
    recommendedEdgeDistanceMm,
    masonryShimmingAdviceFr,
    dtuClausesFr,
  };
}

/**
 * Formats WhatsApp dispatch for the poseur / site installation team.
 */
export function formatFastenerSafetyWhatsApp(
  result: FastenerSafetyResult,
  openingDimensionsFr: string,
  siteName: string = 'Chantier Baiti'
): string {
  const verdictEmoji = result.isPulloutSafe ? '✅ ANCRAGE VALIDE' : '🚨 ANCRAGE DANGEREUX';

  return `*${siteName} - NOTE DE CALCUL FIXATIONS & RESISTANCE AU VENT (DTU 36.5)*

📋 *Ouvrage:* ${openingDimensionsFr}
🧱 *Maçonnerie support:* ${result.substrateData.labelFr}
🔩 *Type de fixation:* ${result.fastenerData.labelFr}
💨 *Zone de vent RNV:* ${result.windZoneData.nameFr} (${result.windZoneData.referenceVelocityKmPerH} km/h)
🏢 *Hauteur bâtiment:* ${result.buildingHeightM} m (${result.terrainData.labelFr})

📊 *CHARGES & EFFORTS:*
• Pression dynamique vent: ${result.dynamicPressureNPerM2} N/m²
• Charge vent totale sur baie: ${result.totalWindLoadDaN} daN (~${result.totalWindLoadDaN * 10} kgf)
• Nombre total de fixations: ${result.pitchResult.totalFastenersCount} points
• Effort d arrachement par cheville: ${result.windPulloutForcePerFastenerDaN} daN
• Résistance admissible support: ${result.substrateData.pulloutAdmissibleDaN} daN
• Facteur de sécurité à l arrachement: ${result.pulloutSafetyFactor} (requis >= 1.50)

⚖️ *VERDICT DE POSE:* ${verdictEmoji}

🔧 *CONSIGNES CHANTIER OBLIGATOIRES:*
• ${result.substrateData.drillingTechniqueFr}
• Profondeur de perçage minimale: ${result.recommendedMinimumDrillDepthMm} mm
• Distance minimale à l arête: ${result.recommendedEdgeDistanceMm} mm
• Espacement montants: ~${result.pitchResult.spacingMontantsMm} mm (max 800 mm)
• Calage d assise obligatoire sous les montants

_Généré via Baiti Atelier - Conforme NF DTU 36.5 & DTR BC 2-47_`;
}
