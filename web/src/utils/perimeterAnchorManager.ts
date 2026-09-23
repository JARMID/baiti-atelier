/**
 * Window & Door Perimeter Anchorage, Fastener Spacing & Wind Load Reaction Auditor
 * Normative references:
 * - NF DTU 36.5 P1-1: Mise en œuvre des fenêtres et portes-extérieures (Section 5.8 Fixations)
 * - CSTB Cahier 3529: Règles de fixation des menuiseries en travaux neufs et réhabilitation
 * - CNERIB DTR BC 2-47 / RNV 2013: Règlement Neige et Vent en Algérie
 * - ETAG 020 / NF EN 1992-4: Conception et calcul des fixations pour béton et maçonnerie
 * - NF EN 1999-1-1 (Eurocode 9): Calcul des structures en alliage d aluminium
 */

export type MasonrySubstrateType =
  | 'hollow_clay_brick_algerian'
  | 'concrete_c20_25'
  | 'hollow_concrete_block'
  | 'solid_limestone_stone'
  | 'steel_subframe_tube';

export type InstallationMountingType =
  | 'applique_interieure'
  | 'tunnel_tableau'
  | 'feuillure_maconnerie'
  | 'applique_exterieure_ite';

export type AnchorFastenerType =
  | 'nylon_long_frame_plug_10x100'
  | 'concrete_screw_direct_7_5x82'
  | 'chemical_injection_anchor_m8'
  | 'fixing_bracket_galva_ite'
  | 'bimetal_self_drilling_screw';

export interface SubstrateSpec {
  id: MasonrySubstrateType;
  labelFr: string;
  substrateCategory: 'Maçonnerie Creuse' | 'Béton Armé Plein' | 'Bloc Béton Creux' | 'Pierre Naturelle' | 'Ossature Acier';
  characteristicTensileResistanceKn: number; // N_Rk
  characteristicShearResistanceKn: number; // V_Rk
  safetyPartialFactorGammaM: number; // gamma_M (1.5 for concrete, 2.0 for hollow brick)
  recommendedFastener: AnchorFastenerType;
  minEmbedmentDepthHefMm: number;
  minEdgeDistanceCminMm: number;
  description: string;
}

export interface FastenerSpec {
  id: AnchorFastenerType;
  labelFr: string;
  drillDiameterMm: number;
  screwDiameterMm: number;
  totalLengthMm: number;
  materialFinish: string;
  recommendedSubstrates: MasonrySubstrateType[];
  tighteningTorqueNm: number;
  description: string;
}

export const SUBSTRATE_SPECS: Record<MasonrySubstrateType, SubstrateSpec> = {
  hollow_clay_brick_algerian: {
    id: 'hollow_clay_brick_algerian',
    labelFr: 'Brique Rouge Creuse 8 ou 12 Trous (Algérie)',
    substrateCategory: 'Maçonnerie Creuse',
    characteristicTensileResistanceKn: 1.20,
    characteristicShearResistanceKn: 1.05,
    safetyPartialFactorGammaM: 2.00,
    recommendedFastener: 'nylon_long_frame_plug_10x100',
    minEmbedmentDepthHefMm: 70,
    minEdgeDistanceCminMm: 100,
    description: 'Support le plus courant en Algérie. Les parois minces nécessitent un ancrage multi-chambres sans percussion agressive.',
  },
  concrete_c20_25: {
    id: 'concrete_c20_25',
    labelFr: 'Béton Armé Plein C20/25 (Voiles, Linteaux, Poteaux)',
    substrateCategory: 'Béton Armé Plein',
    characteristicTensileResistanceKn: 6.80,
    characteristicShearResistanceKn: 5.50,
    safetyPartialFactorGammaM: 1.50,
    recommendedFastener: 'concrete_screw_direct_7_5x82',
    minEmbedmentDepthHefMm: 45,
    minEdgeDistanceCminMm: 50,
    description: 'Béton vibré dense offrant une excellente tenue à l arrachement et au cisaillement sous fortes rafales.',
  },
  hollow_concrete_block: {
    id: 'hollow_concrete_block',
    labelFr: 'Parpaing / Bloc de Béton Creux Standard',
    substrateCategory: 'Bloc Béton Creux',
    characteristicTensileResistanceKn: 1.80,
    characteristicShearResistanceKn: 1.60,
    safetyPartialFactorGammaM: 2.00,
    recommendedFastener: 'nylon_long_frame_plug_10x100',
    minEmbedmentDepthHefMm: 70,
    minEdgeDistanceCminMm: 80,
    description: 'Alvéoles creuses en granulats de béton avec parois d épaisseur modérée.',
  },
  solid_limestone_stone: {
    id: 'solid_limestone_stone',
    labelFr: 'Pierre de Taille Calcaire / Moellon Plein',
    substrateCategory: 'Pierre Naturelle',
    characteristicTensileResistanceKn: 4.50,
    characteristicShearResistanceKn: 3.80,
    safetyPartialFactorGammaM: 1.80,
    recommendedFastener: 'nylon_long_frame_plug_10x100',
    minEmbedmentDepthHefMm: 60,
    minEdgeDistanceCminMm: 75,
    description: 'Bâti traditionnel ou réhabilitation de bâtisses haussmanniennes du centre d Alger et Constantine.',
  },
  steel_subframe_tube: {
    id: 'steel_subframe_tube',
    labelFr: 'Précadre Métallique en Tube Acier 20/10',
    substrateCategory: 'Ossature Acier',
    characteristicTensileResistanceKn: 8.50,
    characteristicShearResistanceKn: 7.20,
    safetyPartialFactorGammaM: 1.35,
    recommendedFastener: 'bimetal_self_drilling_screw',
    minEmbedmentDepthHefMm: 15,
    minEdgeDistanceCminMm: 25,
    description: 'Cadre dormant acier scellé au gros œuvre, fixation directe par vis auto-perceuses cémentées.',
  },
};

export const FASTENER_SPECS: Record<AnchorFastenerType, FastenerSpec> = {
  nylon_long_frame_plug_10x100: {
    id: 'nylon_long_frame_plug_10x100',
    labelFr: 'Cheville Cadre Rallongée Nylon 10x100 mm + Vis Inox A2',
    drillDiameterMm: 10,
    screwDiameterMm: 7.0,
    totalLengthMm: 100,
    materialFinish: 'Polyamide PA6 haute ténacité + Vis inox austénitique A2',
    recommendedSubstrates: ['hollow_clay_brick_algerian', 'hollow_concrete_block', 'solid_limestone_stone'],
    tighteningTorqueNm: 8.0,
    description: 'Corps d expansion à ailettes multiples se nouant dans les cavités de la brique creuse sans éclatement.',
  },
  concrete_screw_direct_7_5x82: {
    id: 'concrete_screw_direct_7_5x82',
    labelFr: 'Vis à Béton Directe Auto-taraudeuse 7.5x82 mm (Sans Cheville)',
    drillDiameterMm: 6.0,
    screwDiameterMm: 7.5,
    totalLengthMm: 82,
    materialFinish: 'Acier cémenté zingué lamellaire anti-corrosion (1000h brouillard salin)',
    recommendedSubstrates: ['concrete_c20_25'],
    tighteningTorqueNm: 15.0,
    description: 'Filetage hélicoïdal mordant directement dans le béton foré. Zéro contrainte d expansion latérale.',
  },
  chemical_injection_anchor_m8: {
    id: 'chemical_injection_anchor_m8',
    labelFr: 'Scellement Chimique Résine Vinylester + Tamis + Tige M8 Inox',
    drillDiameterMm: 14,
    screwDiameterMm: 8.0,
    totalLengthMm: 110,
    materialFinish: 'Résine vinylester sans styrène + Tige filetée inox A4 marine',
    recommendedSubstrates: ['hollow_clay_brick_algerian', 'hollow_concrete_block'],
    tighteningTorqueNm: 10.0,
    description: 'Solution d ancrage haute sécurité pour grands ensembles exposés et menuiseries lourdes.',
  },
  fixing_bracket_galva_ite: {
    id: 'fixing_bracket_galva_ite',
    labelFr: 'Pattes Équerres de Fixation Acier Galvanisé 25/10 + Goujon',
    drillDiameterMm: 8.0,
    screwDiameterMm: 8.0,
    totalLengthMm: 120,
    materialFinish: 'Acier galvanisé à chaud Z275 épaisseur 2.5 mm',
    recommendedSubstrates: ['concrete_c20_25', 'solid_limestone_stone', 'hollow_concrete_block'],
    tighteningTorqueNm: 12.0,
    description: 'Permet de déporter la fixation pour intégrer une isolation thermique par l extérieur (ITE) sans pont thermique.',
  },
  bimetal_self_drilling_screw: {
    id: 'bimetal_self_drilling_screw',
    labelFr: 'Vis Autoperceuse Bi-métal 5.5x45 mm (Pointe Acier / Corps Inox)',
    drillDiameterMm: 0, // self-drilling
    screwDiameterMm: 5.5,
    totalLengthMm: 45,
    materialFinish: 'Pointe acier trempé soudée par friction sur corps inox A2',
    recommendedSubstrates: ['steel_subframe_tube'],
    tighteningTorqueNm: 6.5,
    description: 'Perce et taraude les précadres acier jusqu à 4.0 mm d épaisseur en une seule opération.',
  },
};

export interface PerimeterAnchorInput {
  windowWidthMm: number;
  windowHeightMm: number;
  intermediateMullionsCount?: number;
  intermediateTransomsCount?: number;
  substrateType: MasonrySubstrateType;
  mountingType: InstallationMountingType;
  fastenerType?: AnchorFastenerType;
  darkProfileExposureSummer: boolean; // Dark profile limits pitch to 700 mm instead of 800 mm
  windDesignPressurePa: number; // e.g. 600 Pa, 1000 Pa, 1400 Pa
  wilayaName?: string;
  clientName?: string;
  projectReference?: string;
}

export interface PerimeterAnchorResult {
  windowWidthMm: number;
  windowHeightMm: number;
  windowAreaM2: number;
  framePerimeterM: number;
  cornerOffsetMm: number; // NF DTU 36.5 specifies 100 to 150 mm
  maxAllowablePitchMm: number; // 800 mm for clear profile, 700 mm for dark profile
  jambAnchorsPerSide: number;
  headAnchorsCount: number;
  sillAnchorsCount: number;
  intermediateReinforcementAnchors: number;
  totalAnchorsCount: number;
  actualJambSpacingMm: number;
  actualTransomSpacingMm: number;
  totalWindForceKn: number;
  tensileDesignReactionPerAnchorKn: number; // N_Ed
  designTensileResistanceKn: number; // N_Rd = N_Rk / gamma_M
  utilizationRatePercent: number; // (N_Ed / N_Rd) * 100
  isStructurallySafe: boolean;
  dtuPitchCompliant: boolean;
  selectedFastener: FastenerSpec;
  substrateSpec: SubstrateSpec;
  auditWarnings: string[];
  auditRecommendations: string[];
  billOfMaterials: {
    fastenerDesignation: string;
    totalUnitsCount: number;
    recommendedDrillBit: string;
    assemblyTimeMinutes: number;
  };
}

export function calculatePerimeterAnchorageAudit(input: PerimeterAnchorInput): PerimeterAnchorResult {
  const widthM = Math.max(0.4, input.windowWidthMm / 1000);
  const heightM = Math.max(0.4, input.windowHeightMm / 1000);
  const windowAreaM2 = Number((widthM * heightM).toFixed(2));
  const framePerimeterM = Number((2 * (widthM + heightM)).toFixed(2));

  const substrate = SUBSTRATE_SPECS[input.substrateType];
  const chosenFastenerId = input.fastenerType ?? substrate.recommendedFastener;
  const fastener = FASTENER_SPECS[chosenFastenerId];

  // DTU 36.5 rules for pitch
  const cornerOffsetMm = 120; // within mandatory 100-150 mm
  const maxAllowablePitchMm = input.darkProfileExposureSummer ? 700 : 800;

  // Calcul du nombre de fixations par montant latéral (jambs)
  // Longueur utile = Hauteur - 2 * cornerOffsetMm
  const effectiveHeightMm = Math.max(100, input.windowHeightMm - 2 * cornerOffsetMm);
  const jambIntervals = Math.max(1, Math.ceil(effectiveHeightMm / maxAllowablePitchMm));
  const jambAnchorsPerSide = jambIntervals + 1; // 2 corner anchors + intermediates
  const actualJambSpacingMm = Number((effectiveHeightMm / jambIntervals).toFixed(0));

  // Calcul du nombre de fixations en traverse haute (head) et basse (sill)
  const effectiveWidthMm = Math.max(100, input.windowWidthMm - 2 * cornerOffsetMm);
  const widthIntervals = Math.max(1, Math.ceil(effectiveWidthMm / maxAllowablePitchMm));
  const headAnchorsCount = widthIntervals + 1;
  const sillAnchorsCount = input.mountingType === 'tunnel_tableau' ? widthIntervals + 1 : Math.max(2, Math.ceil(widthIntervals * 0.75));
  const actualTransomSpacingMm = Number((effectiveWidthMm / widthIntervals).toFixed(0));

  // Fixations supplémentaires au droit des meneaux et traverses (NF DTU 36.5 Section 5.8: <= 150 mm de chaque côté du profil)
  const mullions = input.intermediateMullionsCount ?? 0;
  const transoms = input.intermediateTransomsCount ?? 0;
  const intermediateReinforcementAnchors = (mullions * 2) + (transoms * 2);

  // Total d ancrages
  const totalAnchorsCount = (jambAnchorsPerSide * 2) + headAnchorsCount + sillAnchorsCount + intermediateReinforcementAnchors;

  // Mécanique sous vent (RNV 2013 / Eurocode 1)
  const totalWindForceKn = Number(((windowAreaM2 * input.windDesignPressurePa) / 1000).toFixed(2));

  // Charge de traction maximale par fixation (N_Ed)
  // Coefficient de concentration trapézoïdale de la charge du vitrage = 1.30
  const distributionFactor = 1.30;
  const rawTensileReactionKn = (totalWindForceKn / totalAnchorsCount) * distributionFactor;
  const tensileDesignReactionPerAnchorKn = Number(Math.max(0.15, rawTensileReactionKn).toFixed(2));

  // Résistance de calcul de l ancrage N_Rd = N_Rk / gamma_M
  const designTensileResistanceKn = Number((substrate.characteristicTensileResistanceKn / substrate.safetyPartialFactorGammaM).toFixed(2));
  const utilizationRatePercent = Number(((tensileDesignReactionPerAnchorKn / designTensileResistanceKn) * 100).toFixed(1));

  const isStructurallySafe = utilizationRatePercent <= 100.0;
  const dtuPitchCompliant = actualJambSpacingMm <= maxAllowablePitchMm && actualTransomSpacingMm <= maxAllowablePitchMm;

  // Alertes et recommandations
  const auditWarnings: string[] = [];
  const auditRecommendations: string[] = [];

  if (!isStructurallySafe) {
    auditWarnings.push(`Taux de sollicitation de l ancrage (${utilizationRatePercent}%) supérieur à 100% de la résistance admissible du support.`);
    auditRecommendations.push(`Rapprocher les fixations périphériques ou passer sur un scellement chimique vinylester avec tamis d injection.`);
  }

  if (!dtuPitchCompliant) {
    auditWarnings.push(`Espacement des fixations supérieur au maximum DTU 36.5 (${maxAllowablePitchMm} mm). Risque de déformation de profilé sous vent.`);
    auditRecommendations.push(`Ajouter une fixation intermédiaire par côté pour respecter l entraxe maximal de ${maxAllowablePitchMm} mm.`);
  }

  if (input.substrateType === 'hollow_clay_brick_algerian' && chosenFastenerId === 'concrete_screw_direct_7_5x82') {
    auditWarnings.push('Vis à béton directe déconseillée dans la brique creuse 8/12 trous (absence de prise continue dans les alvéoles minces).');
    auditRecommendations.push('Utiliser impérativement des chevilles cadres rallongées nylon multi-expansions ou scellement chimique.');
  }

  if (input.darkProfileExposureSummer && actualJambSpacingMm > 700) {
    auditWarnings.push(`Profilé sombre exposé au soleil estival : entraxe mesuré à ${actualJambSpacingMm} mm (limite recommandée 700 mm).`);
    auditRecommendations.push('Réduire l entraxe à 700 mm pour absorber la dilatation thermique linéaire sans gauchissement.');
  }

  // Bill of materials
  const drillBitDesc = fastener.drillDiameterMm > 0
    ? `Foret béton carbure diamètre ${fastener.drillDiameterMm} mm (perçage sans percussion dans la brique)`
    : 'Embout de vissage Torx T30 pour vis autoperceuse';

  const assemblyTimeMinutes = Math.max(10, Math.ceil(totalAnchorsCount * 2.5));

  return {
    windowWidthMm: input.windowWidthMm,
    windowHeightMm: input.windowHeightMm,
    windowAreaM2,
    framePerimeterM,
    cornerOffsetMm,
    maxAllowablePitchMm,
    jambAnchorsPerSide,
    headAnchorsCount,
    sillAnchorsCount,
    intermediateReinforcementAnchors,
    totalAnchorsCount,
    actualJambSpacingMm,
    actualTransomSpacingMm,
    totalWindForceKn,
    tensileDesignReactionPerAnchorKn,
    designTensileResistanceKn,
    utilizationRatePercent,
    isStructurallySafe,
    dtuPitchCompliant,
    selectedFastener: fastener,
    substrateSpec: substrate,
    auditWarnings,
    auditRecommendations,
    billOfMaterials: {
      fastenerDesignation: fastener.labelFr,
      totalUnitsCount: totalAnchorsCount,
      recommendedDrillBit: drillBitDesc,
      assemblyTimeMinutes,
    },
  };
}
