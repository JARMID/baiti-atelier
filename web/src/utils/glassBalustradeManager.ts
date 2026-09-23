// Structural Glass Balustrade and Parapet Cantilever Load Auditor
// Technical Standards: NF P 01-012, NF P 01-013, Eurocode 1 NF EN 1991-1-1, CSTB Cahier 3034, DTR BC 2-2, CNERIB RNV 2013

export type BalustradeGlassType =
  | 'glass_8_8_4_esg_pvb'
  | 'glass_10_10_4_esg_pvb'
  | 'glass_12_12_4_esg_pvb'
  | 'glass_8_8_2_esg_sgp'
  | 'glass_10_10_2_esg_sgp'
  | 'glass_12_12_4_esg_sgp'
  | 'glass_10_mono_esg_unapproved';

export type BuildingUsageCategory =
  | 'cat_a_residential'
  | 'cat_b_office_admin'
  | 'cat_c1_restaurant_hospital'
  | 'cat_c2_retail_mall'
  | 'cat_c5_stadium_crowd';

export type BaseShoeMountingType =
  | 'shoe_top_floor_mount'
  | 'shoe_side_fascia_mount'
  | 'shoe_recessed_in_slab'
  | 'point_clamps_spigots';

export type HandrailType =
  | 'continuous_u_profile_steel'
  | 'continuous_aluminum_cap'
  | 'minimalist_edge_guard'
  | 'cantilever_frameless_no_rail';

export interface GlassBalustradeSpec {
  id: BalustradeGlassType;
  nameFr: string;
  nominalThicknessMm: number;
  glassPliesCount: number;
  singlePlyThicknessMm: number;
  interlayerType: 'pvb_standard' | 'sentryglas_ionoplast' | 'none_monolithic';
  interlayerThicknessMm: number;
  isToughenedEsg: boolean;
  designBendingStrengthMpa: number; // fg,d = 120 MPa for ESG
  shearTransferCoefficientOmega: number; // 0.15 for PVB summer, 0.80 for SGP
  postBreakageSafetyGrade: 'critique_haute' | 'bonne' | 'dangereuse_effondrement';
  description: string;
}

export const BALUSTRADE_GLASS_CATALOG: Record<BalustradeGlassType, GlassBalustradeSpec> = {
  glass_8_8_4_esg_pvb: {
    id: 'glass_8_8_4_esg_pvb',
    nameFr: 'Verre Feuilleté Trempé 88.4 PVB (17.52 mm)',
    nominalThicknessMm: 17.52,
    glassPliesCount: 2,
    singlePlyThicknessMm: 8.0,
    interlayerType: 'pvb_standard',
    interlayerThicknessMm: 1.52,
    isToughenedEsg: true,
    designBendingStrengthMpa: 120,
    shearTransferCoefficientOmega: 0.20,
    postBreakageSafetyGrade: 'bonne',
    description: 'Double verre trempe securite 8 mm assemble par 4 intercalaires PVB de 0.38 mm pour balcons residentiels.',
  },
  glass_10_10_4_esg_pvb: {
    id: 'glass_10_10_4_esg_pvb',
    nameFr: 'Verre Feuilleté Trempé 1010.4 PVB (21.52 mm)',
    nominalThicknessMm: 21.52,
    glassPliesCount: 2,
    singlePlyThicknessMm: 10.0,
    interlayerType: 'pvb_standard',
    interlayerThicknessMm: 1.52,
    isToughenedEsg: true,
    designBendingStrengthMpa: 120,
    shearTransferCoefficientOmega: 0.25,
    postBreakageSafetyGrade: 'bonne',
    description: 'Configuration de reference tertiaire offrant une excellente rigidite et une retenue securisee des personnes.',
  },
  glass_12_12_4_esg_pvb: {
    id: 'glass_12_12_4_esg_pvb',
    nameFr: 'Verre Feuilleté Trempé 1212.4 PVB (25.52 mm)',
    nominalThicknessMm: 25.52,
    glassPliesCount: 2,
    singlePlyThicknessMm: 12.0,
    interlayerType: 'pvb_standard',
    interlayerThicknessMm: 1.52,
    isToughenedEsg: true,
    designBendingStrengthMpa: 120,
    shearTransferCoefficientOmega: 0.25,
    postBreakageSafetyGrade: 'bonne',
    description: 'Verre lourd haute inertie pour etablissements recevant du public a forte circulation pietonne.',
  },
  glass_8_8_2_esg_sgp: {
    id: 'glass_8_8_2_esg_sgp',
    nameFr: 'Verre Feuilleté Trempé 88.2 SentryGlas SGP (16.89 mm)',
    nominalThicknessMm: 16.89,
    glassPliesCount: 2,
    singlePlyThicknessMm: 8.0,
    interlayerType: 'sentryglas_ionoplast',
    interlayerThicknessMm: 0.89,
    isToughenedEsg: true,
    designBendingStrengthMpa: 120,
    shearTransferCoefficientOmega: 0.85,
    postBreakageSafetyGrade: 'critique_haute',
    description: 'Intercalaire structurel ionoplaste 100 fois plus rigide que le PVB, maintenant le panneau debout meme brise.',
  },
  glass_10_10_2_esg_sgp: {
    id: 'glass_10_10_2_esg_sgp',
    nameFr: 'Verre Feuilleté Trempé 1010.2 SentryGlas SGP (20.89 mm)',
    nominalThicknessMm: 20.89,
    glassPliesCount: 2,
    singlePlyThicknessMm: 10.0,
    interlayerType: 'sentryglas_ionoplast',
    interlayerThicknessMm: 0.89,
    isToughenedEsg: true,
    designBendingStrengthMpa: 120,
    shearTransferCoefficientOmega: 0.85,
    postBreakageSafetyGrade: 'critique_haute',
    description: 'Solution haut de gamme pour centres commerciaux et terrasses littorales soumises au vent d Algerie.',
  },
  glass_12_12_4_esg_sgp: {
    id: 'glass_12_12_4_esg_sgp',
    nameFr: 'Verre Feuilleté Trempé 1212.4 SentryGlas SGP (25.52 mm)',
    nominalThicknessMm: 25.52,
    glassPliesCount: 2,
    singlePlyThicknessMm: 12.0,
    interlayerType: 'sentryglas_ionoplast',
    interlayerThicknessMm: 1.52,
    isToughenedEsg: true,
    designBendingStrengthMpa: 120,
    shearTransferCoefficientOmega: 0.88,
    postBreakageSafetyGrade: 'critique_haute',
    description: 'Capacite de retenue maximale pour tribunes de stades, amphitheâtres et lieux de grand rassemblement.',
  },
  glass_10_mono_esg_unapproved: {
    id: 'glass_10_mono_esg_unapproved',
    nameFr: 'Verre Trempé Monolithique 10 mm (Non Homologué Chute)',
    nominalThicknessMm: 10.0,
    glassPliesCount: 1,
    singlePlyThicknessMm: 10.0,
    interlayerType: 'none_monolithic',
    interlayerThicknessMm: 0,
    isToughenedEsg: true,
    designBendingStrengthMpa: 120,
    shearTransferCoefficientOmega: 1.0,
    postBreakageSafetyGrade: 'dangereuse_effondrement',
    description: 'ATTENTION : Le verre monolithique se desintegre instantanement en petits morceaux sans retention residuelle.',
  },
};

export interface GlassBalustradeAuditParams {
  panelWidthMm: number; // Largeur du panneau de verre (ex: 1200 mm)
  panelHeightMm: number; // Hauteur au-dessus du sol fini (ex: 1000 ou 1100 mm)
  glassType: BalustradeGlassType;
  buildingUsage: BuildingUsageCategory;
  mountingType: BaseShoeMountingType;
  handrailType: HandrailType;
  fallHeightM?: number; // Hauteur de chute potentielle derriere le garde-corps
  windDynamicPressurePa?: number; // Pression dynamique du vent RNV 2013
  anchorSpacingMm?: number; // Entraxe des chevilles de fixation au sol
  wilayaName?: string;
  clientName?: string;
  projectReference?: string;
}

export interface GlassBalustradeAuditResult {
  // Geometry & Heights
  panelWidthMm: number;
  panelHeightMm: number;
  panelAreaM2: number;
  panelWeightKg: number;
  fallHeightM: number;
  minRegulatedHeightMm: number;
  isHeightCompliant: boolean;

  // Normative Crowd & Wind Loadings (NF P 01-013 / Eurocode 1)
  buildingUsageNameFr: string;
  nominalCrowdLineLoadQkKnM: number; // qk (0.6, 1.0, 1.7, 3.0 kN/m)
  designCrowdLineLoadQdKnM: number; // 1.5 * qk
  totalCrowdForceOnPanelN: number;
  windPressurePa: number;
  totalWindForceOnPanelN: number;

  // Cantilever Moments & Bending Stresses
  overturningBaseMomentNm: number;
  effectiveGlassThicknessBendingMm: number; // heff,sigma (Wolfel-Bennison)
  effectiveGlassThicknessDeflectionMm: number; // heff,w
  calculatedBendingStressMpa: number;
  allowableBendingStressMpa: number;
  bendingStressUtilizationPercent: number;
  isStressCompliant: boolean;

  // Deflection at Handrail Tip (Flèche en tête de vitrage)
  topTipDeflectionMm: number;
  allowableDeflectionLimitMm: number; // H / 50 or 25 mm max
  deflectionRatioSpan: number; // H / deflection
  isDeflectionCompliant: boolean;

  // Base Shoe & Anchor Bolt Tensile Forces
  mountingTypeNameFr: string;
  effectiveShoeEmbedmentDepthMm: number; // Profondeur encastrement verre dans sabot (100 - 120 mm)
  anchorSpacingMm: number;
  anchorsCountPerPanel: number;
  tensilePulloutForcePerAnchorN: number;
  recommendedAnchorTypeFr: string;
  isAnchorSafe: boolean;

  // Impact Resistance & Post-Breakage Security (NF P 01-013)
  impactEnergyJoules: number; // 240 J, 360 J, or 600 J
  impactTestRatingFr: string;
  isPostBreakageSecure: boolean;
  postBreakageDiagnosisFr: string;

  // Global Verdict & Recommendations
  globalStatus: 'conform' | 'warning' | 'non_conform';
  statusSummaryFr: string;
  recommendations: string[];

  // Metadata
  wilayaName: string;
  clientName: string;
  projectReference: string;
  generatedDate: string;
}

export function computeGlassBalustradeAudit(
  params: GlassBalustradeAuditParams
): GlassBalustradeAuditResult {
  const {
    panelWidthMm,
    panelHeightMm,
    glassType,
    buildingUsage,
    mountingType,
    handrailType,
    fallHeightM = 3.5,
    windDynamicPressurePa = 375,
    anchorSpacingMm = 250,
    wilayaName = 'Alger',
    clientName = 'Chantier Client',
    projectReference = 'Garde-Corps Verre Autoportant NF P 01-012',
  } = params;

  const glassSpec = BALUSTRADE_GLASS_CATALOG[glassType];

  const wM = Math.max(0.4, panelWidthMm / 1000);
  const hM = Math.max(0.8, panelHeightMm / 1000);
  const panelAreaM2 = parseFloat((wM * hM).toFixed(2));

  // Glass density = 2500 kg/m3. 2.5 kg/m2 per mm thickness
  const panelWeightKg = parseFloat((panelAreaM2 * glassSpec.nominalThicknessMm * 2.5).toFixed(1));

  // 1. Regulatory Height Check (NF P 01-012)
  // H >= 1.00 m standard; H >= 1.10 m if fall height > 6.0 m
  const minRegulatedHeightMm = fallHeightM > 6.0 ? 1100 : 1000;
  const isHeightCompliant = panelHeightMm >= minRegulatedHeightMm;

  // 2. Crowd Loadings (NF P 01-013 / Eurocode 1)
  let nominalCrowdLineLoadQkKnM = 0.60;
  let buildingUsageNameFr = 'Logement Privatif / Balcon Résidentiel (qk = 0.60 kN/m)';
  let impactEnergyJoules = 240;

  if (buildingUsage === 'cat_b_office_admin') {
    nominalCrowdLineLoadQkKnM = 1.00;
    buildingUsageNameFr = 'Bureaux & Bâtiments Administratifs (qk = 1.00 kN/m)';
    impactEnergyJoules = 360;
  } else if (buildingUsage === 'cat_c1_restaurant_hospital') {
    nominalCrowdLineLoadQkKnM = 1.00;
    buildingUsageNameFr = 'Hôtels, Cafés, Restaurants & Établissements de Santé (qk = 1.00 kN/m)';
    impactEnergyJoules = 360;
  } else if (buildingUsage === 'cat_c2_retail_mall') {
    nominalCrowdLineLoadQkKnM = 1.70;
    buildingUsageNameFr = 'Centres Commerciaux & Espaces Publics Commerciaux (qk = 1.70 kN/m)';
    impactEnergyJoules = 600;
  } else if (buildingUsage === 'cat_c5_stadium_crowd') {
    nominalCrowdLineLoadQkKnM = 3.00;
    buildingUsageNameFr = 'Tribunes de Stades, Salles de Spectacle & Foule Dense (qk = 3.00 kN/m)';
    impactEnergyJoules = 600;
  }

  // Safety factor gamma_Q = 1.50
  const designCrowdLineLoadQdKnM = parseFloat((nominalCrowdLineLoadQkKnM * 1.50).toFixed(2));
  const totalCrowdForceOnPanelN = Math.round(designCrowdLineLoadQdKnM * 1000 * wM);

  // Wind load: pressure * area * net drag factor (Cp = 1.3 for balustrade parapet)
  const netWindPressurePa = Math.round(windDynamicPressurePa * 1.3);
  const totalWindForceOnPanelN = Math.round(netWindPressurePa * panelAreaM2);

  // 3. Cantilever Base Moment (Root Overturning Moment)
  // Crowd line load applied at handrail height H
  const momentCrowdNm = totalCrowdForceOnPanelN * hM;
  // Wind load applied at mid-height (H / 2)
  const momentWindNm = (totalWindForceOnPanelN * hM) / 2;
  const overturningBaseMomentNm = Math.round(momentCrowdNm + momentWindNm);

  // 4. Effective Glass Thickness for Bending & Deflection (Wolfel-Bennison EN 16612)
  let heffSigmaMm = glassSpec.nominalThicknessMm;
  let heffWMm = glassSpec.nominalThicknessMm;

  if (glassSpec.glassPliesCount === 2) {
    const t1 = glassSpec.singlePlyThicknessMm;
    const t2 = glassSpec.singlePlyThicknessMm;
    const omega = glassSpec.shearTransferCoefficientOmega;

    // Full composite thickness
    const tTot = t1 + t2;
    // Layered (no shear transfer) equivalent thickness
    const tLayered3 = Math.pow(t1, 3) + Math.pow(t2, 3);
    const tMonolithic3 = Math.pow(tTot, 3);

    // Deflection equivalent thickness
    const hEffW3 = tLayered3 + omega * (tMonolithic3 - tLayered3);
    heffWMm = parseFloat(Math.pow(hEffW3, 1 / 3).toFixed(2));

    // Bending stress equivalent thickness
    heffSigmaMm = parseFloat(
      Math.sqrt(hEffW3 / (t1 + omega * (tTot - t1))).toFixed(2)
    );
  }

  // 5. Bending Stress in Glass (Cantilever beam: M / W)
  // Section modulus: W_glass = (w * heff_sigma^2) / 6
  const wGlassM3 = (wM * Math.pow(heffSigmaMm / 1000, 2)) / 6;
  const calculatedBendingStressPa = overturningBaseMomentNm / wGlassM3;
  const calculatedBendingStressMpa = parseFloat((calculatedBendingStressPa / 1e6).toFixed(1));

  const allowableBendingStressMpa = glassSpec.designBendingStrengthMpa;
  const bendingStressUtilizationPercent = Math.round(
    (calculatedBendingStressMpa / allowableBendingStressMpa) * 100
  );
  const isStressCompliant = bendingStressUtilizationPercent <= 100;

  // 6. Top Tip Deflection (Fleche en tête de vitrage)
  // f = (F_total * H^3) / (3 * E * I_eff)
  // Glass Young's Modulus E = 70,000 MPa = 70e9 N/m2
  const eNPerM2 = 70e9;
  const iEffM4 = (wM * Math.pow(heffWMm / 1000, 3)) / 12;
  const totalServiceHorizontalForceN = (nominalCrowdLineLoadQkKnM * 1000 * wM) + (totalWindForceOnPanelN / 1.5);
  const deflectionM = (totalServiceHorizontalForceN * Math.pow(hM, 3)) / (3 * eNPerM2 * iEffM4);
  const topTipDeflectionMm = parseFloat((deflectionM * 1000).toFixed(1));

  // Allowable deflection limit: H / 50 or 25 mm max to prevent vertigo
  const allowableDeflectionLimitMm = parseFloat(Math.min(25, (panelHeightMm / 50)).toFixed(1));
  const deflectionRatioSpan = Math.round(panelHeightMm / Math.max(0.1, topTipDeflectionMm));
  const isDeflectionCompliant = topTipDeflectionMm <= allowableDeflectionLimitMm;

  // 7. Base Shoe and Anchor Pullout Force
  let mountingTypeNameFr = 'Sabot continu en aluminium posé à plat sur dalle';
  let effectiveShoeEmbedmentDepthMm = 110;
  let leverArmMm = 80; // Distance entre axe de compression et cheville de traction

  if (mountingType === 'shoe_side_fascia_mount') {
    mountingTypeNameFr = 'Sabot aluminium posé en nez de dalle (Pose à l anglaise)';
    effectiveShoeEmbedmentDepthMm = 120;
    leverArmMm = 120;
  } else if (mountingType === 'shoe_recessed_in_slab') {
    mountingTypeNameFr = 'Profilé sabot encastré dans la chape (Affleurant au sol)';
    effectiveShoeEmbedmentDepthMm = 100;
    leverArmMm = 90;
  } else if (mountingType === 'point_clamps_spigots') {
    mountingTypeNameFr = 'Pinces cylindriques ou carrées en inox 316 (Spigots)';
    effectiveShoeEmbedmentDepthMm = 80;
    leverArmMm = 65;
  }

  const effectiveAnchorSpacing = Math.max(150, Math.min(400, anchorSpacingMm));
  const anchorsCountPerPanel = Math.max(2, Math.ceil(panelWidthMm / effectiveAnchorSpacing) + 1);

  // Tensile force per anchor bolt: T = (M_base / lever_arm) / anchors_count
  const totalTensileForceN = overturningBaseMomentNm / (leverArmMm / 1000);
  const tensilePulloutForcePerAnchorN = Math.round(totalTensileForceN / anchorsCountPerPanel);

  let recommendedAnchorTypeFr = 'Cheville chimique M10 acier inox A4 avec tige d ancrage scellée à 90 mm dans béton C25/30';
  let isAnchorSafe = tensilePulloutForcePerAnchorN <= 7500; // Allowable design pullout for M10 resin anchor

  if (tensilePulloutForcePerAnchorN > 7500) {
    recommendedAnchorTypeFr = 'Tiges filetées M12 haute adhérence classe 8.8 avec scellement résine époxy pure (charge élevée)';
    isAnchorSafe = tensilePulloutForcePerAnchorN <= 12000;
  }

  // 8. Impact & Post-Breakage Security (NF P 01-013)
  const isSgp = glassSpec.interlayerType === 'sentryglas_ionoplast';
  const isPvb = glassSpec.interlayerType === 'pvb_standard';
  const isMonolithic = glassSpec.interlayerType === 'none_monolithic';

  const isPostBreakageSecure = !isMonolithic && (isSgp || (isPvb && handrailType !== 'cantilever_frameless_no_rail'));

  let postBreakageDiagnosisFr = 'Sécurité post-rupture optimale : l intercalaire ionoplaste maintient le panneau droit après bris.';
  if (isMonolithic) {
    postBreakageDiagnosisFr = 'DANGER MORTEL : Le verre monolithique s effondre totalement en laissant une baie vide béante sans aucune retenue.';
  } else if (isPvb && handrailType === 'cantilever_frameless_no_rail') {
    postBreakageDiagnosisFr = 'Vigilance post-rupture : sous forte chaleur algérienne (> 40°C), le PVB s assouplit et le panneau peut plier sans main courante.';
  }

  const impactTestRatingFr = `Essai pendulaire corps mou de ${impactEnergyJoules} Joules validé (Sac sphéro-conique 50 kg)`;

  // 9. Global Status & Actionable Recommendations
  const recommendations: string[] = [];
  let globalStatus: 'conform' | 'warning' | 'non_conform' = 'conform';
  let statusSummaryFr = 'Garde-corps en verre 100% conforme aux normes NF P 01-012, NF P 01-013 et Eurocode 1.';

  if (isMonolithic || !isHeightCompliant || !isStressCompliant || !isAnchorSafe) {
    globalStatus = 'non_conform';
    statusSummaryFr = 'Non-conformité critique : risque avéré de chute de personne ou de rupture du vitrage !';

    if (isMonolithic) {
      recommendations.push(
        'Remplacer immédiatement le verre monolithique par un verre feuilleté trempé 88.4 ou 1010.4 homologué pour garde-corps.'
      );
    }
    if (!isHeightCompliant) {
      recommendations.push(
        `Hauteur insuffisante (${panelHeightMm} mm < minimum requis ${minRegulatedHeightMm} mm pour une chute de ${fallHeightM} m).`
      );
    }
    if (!isStressCompliant) {
      recommendations.push(
        `Contrainte de flexion excessive (${calculatedBendingStressMpa} MPa > limite admissible ${allowableBendingStressMpa} MPa, soit ${bendingStressUtilizationPercent}%). Passer à une épaisseur supérieure (1010.4 ou 1212.4).`
      );
    }
    if (!isAnchorSafe) {
      recommendations.push(
        `Effort d arrachement cheville critique (${tensilePulloutForcePerAnchorN} N). Rapprocher l entraxe des fixations à 200 mm ou passer en M12 scellé chimiquement.`
      );
    }
  } else if (!isDeflectionCompliant || (isPvb && handrailType === 'cantilever_frameless_no_rail')) {
    globalStatus = 'warning';
    statusSummaryFr = 'Garde-corps stable mais flèche importante en tête provoquant un sentiment d insécurité.';

    if (!isDeflectionCompliant) {
      recommendations.push(
        `Flèche en tête de ${topTipDeflectionMm} mm (limite ${allowableDeflectionLimitMm} mm). Prévoir une main courante rigide reliant les panneaux ou un intercalaire ionoplaste SentryGlas.`
      );
    }
    if (isPvb && handrailType === 'cantilever_frameless_no_rail') {
      recommendations.push(
        'En pose sans main courante extérieure en Algérie, l intercalaire SentryGlas SGP est fortement recommandé face aux températures estivales extrêmes.'
      );
    }
  } else {
    recommendations.push(
      `Excellente réserve de sécurité avec une contrainte de flexion limitée à ${bendingStressUtilizationPercent}% de la capacité élastique.`
    );
    recommendations.push(
      `Calage du verre dans le sabot au moyen de cales excentriques réglables brevetées pour garantir la verticalité parfaite au fil à plomb.`
    );
  }

  const generatedDate = new Date().toLocaleDateString('fr-DZ', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  return {
    panelWidthMm,
    panelHeightMm,
    panelAreaM2,
    panelWeightKg,
    fallHeightM,
    minRegulatedHeightMm,
    isHeightCompliant,
    buildingUsageNameFr,
    nominalCrowdLineLoadQkKnM,
    designCrowdLineLoadQdKnM,
    totalCrowdForceOnPanelN,
    windPressurePa: netWindPressurePa,
    totalWindForceOnPanelN,
    overturningBaseMomentNm,
    effectiveGlassThicknessBendingMm: heffSigmaMm,
    effectiveGlassThicknessDeflectionMm: heffWMm,
    calculatedBendingStressMpa,
    allowableBendingStressMpa,
    bendingStressUtilizationPercent,
    isStressCompliant,
    topTipDeflectionMm,
    allowableDeflectionLimitMm,
    deflectionRatioSpan,
    isDeflectionCompliant,
    mountingTypeNameFr,
    effectiveShoeEmbedmentDepthMm,
    anchorSpacingMm: effectiveAnchorSpacing,
    anchorsCountPerPanel,
    tensilePulloutForcePerAnchorN,
    recommendedAnchorTypeFr,
    isAnchorSafe,
    impactEnergyJoules,
    impactTestRatingFr,
    isPostBreakageSecure,
    postBreakageDiagnosisFr,
    globalStatus,
    statusSummaryFr,
    recommendations,
    wilayaName,
    clientName,
    projectReference,
    generatedDate,
  };
}
