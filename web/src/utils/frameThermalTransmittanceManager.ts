/**
 * Aluminum & PVC Window Frame Thermal Transmittance (Uf), Polyamide Thermal Break & Linear Spacer (Psi_g) Auditor
 * Normative references:
 * - ISO 10077-1: Performance thermique des fenêtres, portes et fermetures - Calcul du coefficient de transmission thermique (Méthode simplifiée)
 * - ISO 10077-2: Performance thermique des fenêtres - Calcul numérique du coefficient de transmission thermique des profilés (Uf)
 * - NF EN 14351-1 + A2: Fenêtres et blocs-baies extérieurs - Performances thermiques
 * - CNERIB DTR C3-2 / C3-4: Réglementation Thermique Algérienne des Bâtiments - Déperditions calorifiques et facteurs solaires
 * - CSTB e-Cahier 3698: Fenêtres et portes-fenêtres à rupture de pont thermique
 */

export type FrameProfileSystemType =
  | 'alu_cold_no_rpt'
  | 'alu_rpt_standard_14mm'
  | 'alu_rpt_high_perf_24mm'
  | 'alu_rpt_passive_34mm_foam'
  | 'pvc_chamber_3_standard'
  | 'pvc_chamber_5_reinforced';

export type SpacerBarType =
  | 'aluminum_standard'
  | 'stainless_steel'
  | 'warm_edge_composite'
  | 'warm_edge_foam_structural';

export interface FrameProfileSystemSpec {
  id: FrameProfileSystemType;
  labelFr: string;
  category: 'aluminum' | 'pvc';
  polyamideStripWidthMm: number; // 0 for cold, 14.8, 24.0, 34.0 mm
  hasInsulatingFoamCore: boolean;
  nominalFrameDepthMm: number; // 40, 45, 52, 70 mm
  faceWidthMm: number; // combined frame + sash visible width (e.g. 105 mm)
  ufValueWPerM2K: number; // ISO 10077-2 frame U-value
  internalThermalResistanceM2KPerW: number;
  description: string;
  recommendedUsageFr: string;
}

export interface SpacerBarSpec {
  id: SpacerBarType;
  labelFr: string;
  psiValueWPerMK: number; // linear thermal bridge Psi_g
  materialDescriptionFr: string;
  condensationMitigationPercent: number; // compared to aluminum
}

export interface GlazingThermalOption {
  id: string;
  labelFr: string;
  ugValueWPerM2K: number;
  solarHeatGainG: number;
  lightTransmittance: number;
  description: string;
}

export const FRAME_SYSTEM_SPECS: Record<FrameProfileSystemType, FrameProfileSystemSpec> = {
  alu_cold_no_rpt: {
    id: 'alu_cold_no_rpt',
    labelFr: 'Aluminium Froid Monobloc Sans RPT (Série 40)',
    category: 'aluminum',
    polyamideStripWidthMm: 0,
    hasInsulatingFoamCore: false,
    nominalFrameDepthMm: 40,
    faceWidthMm: 95,
    ufValueWPerM2K: 6.20,
    internalThermalResistanceM2KPerW: 0.16,
    description: 'Profilé aluminium extrudé brut continu sans barrette isolante. Conductivité thermique maximale.',
    recommendedUsageFr: 'Réservé aux vérandas non chauffées, cloisons intérieures ou locaux industriels ventilés.',
  },
  alu_rpt_standard_14mm: {
    id: 'alu_rpt_standard_14mm',
    labelFr: 'Aluminium RPT Standard 14.8 mm (Gamme 45)',
    category: 'aluminum',
    polyamideStripWidthMm: 14.8,
    hasInsulatingFoamCore: false,
    nominalFrameDepthMm: 45,
    faceWidthMm: 105,
    ufValueWPerM2K: 2.70,
    internalThermalResistanceM2KPerW: 0.37,
    description: 'Barettes continues en polyamide PA66 GF25 serties mécaniquement. Réduit les déperditions de 55%.',
    recommendedUsageFr: 'Habitat résidentiel courant en zone littorale et tempérée (Zone Climatique A).',
  },
  alu_rpt_high_perf_24mm: {
    id: 'alu_rpt_high_perf_24mm',
    labelFr: 'Aluminium RPT Haute Performance 24 mm (Gamme 52)',
    category: 'aluminum',
    polyamideStripWidthMm: 24.0,
    hasInsulatingFoamCore: false,
    nominalFrameDepthMm: 52,
    faceWidthMm: 110,
    ufValueWPerM2K: 2.10,
    internalThermalResistanceM2KPerW: 0.48,
    description: 'Barrettes tubulaires alvéolaires en polyamide avec joint central d étanchéité en EPDM cellulaire.',
    recommendedUsageFr: 'Hauts plateaux et zones à fort contraste thermique hivernal (Zone Climatique B).',
  },
  alu_rpt_passive_34mm_foam: {
    id: 'alu_rpt_passive_34mm_foam',
    labelFr: 'Aluminium RPT Passif 34 mm avec Mousses Isolantes (Gamme 70+)',
    category: 'aluminum',
    polyamideStripWidthMm: 34.0,
    hasInsulatingFoamCore: true,
    nominalFrameDepthMm: 75,
    faceWidthMm: 118,
    ufValueWPerM2K: 1.35,
    internalThermalResistanceM2KPerW: 0.74,
    description: 'Barettes larges à rupture totale, âme centrale garnie d inserts en mousse polyoléfine et bouclier thermique.',
    recommendedUsageFr: 'Bâtiments basse consommation (BBC), zones montagneuses très froides et triple vitrage.',
  },
  pvc_chamber_3_standard: {
    id: 'pvc_chamber_3_standard',
    labelFr: 'PVC 60 mm 3 Chambres avec Renfort Acier',
    category: 'pvc',
    polyamideStripWidthMm: 0,
    hasInsulatingFoamCore: false,
    nominalFrameDepthMm: 60,
    faceWidthMm: 112,
    ufValueWPerM2K: 1.60,
    internalThermalResistanceM2KPerW: 0.62,
    description: 'Profilé thermoplastique multi-chambres avec tube de rigidité en acier galvanisé de 1.5 mm.',
    recommendedUsageFr: 'Rénovation résidentielle économique et constructions pavillonnaires régulières.',
  },
  pvc_chamber_5_reinforced: {
    id: 'pvc_chamber_5_reinforced',
    labelFr: 'PVC 70 mm 5 Chambres Haute Efficacité',
    category: 'pvc',
    polyamideStripWidthMm: 0,
    hasInsulatingFoamCore: false,
    nominalFrameDepthMm: 70,
    faceWidthMm: 115,
    ufValueWPerM2K: 1.25,
    internalThermalResistanceM2KPerW: 0.80,
    description: 'Cinq chambres d isolation indépendantes et renforts composites à pont thermique rompu.',
    recommendedUsageFr: 'Logements collectifs durables, forte isolation acoustique et thermique combinée.',
  },
};

export const SPACER_BAR_SPECS: Record<SpacerBarType, SpacerBarSpec> = {
  aluminum_standard: {
    id: 'aluminum_standard',
    labelFr: 'Intercalaire Aluminium Standard (Non-Isolant)',
    psiValueWPerMK: 0.080,
    materialDescriptionFr: 'Profil aluminium étiré creux perforé avec tamis moléculaire déshydratant.',
    condensationMitigationPercent: 0,
  },
  stainless_steel: {
    id: 'stainless_steel',
    labelFr: 'Intercalaire Acier Inoxydable Fin',
    psiValueWPerMK: 0.055,
    materialDescriptionFr: 'Acier inoxydable à faible épaisseur de paroi. Conductivité réduite par rapport à l aluminium.',
    condensationMitigationPercent: 31,
  },
  warm_edge_composite: {
    id: 'warm_edge_composite',
    labelFr: 'Warm-Edge Composite Hybride (Inox + Plastique)',
    psiValueWPerMK: 0.040,
    materialDescriptionFr: 'Corps en polypropylène renforcé doublé d un feuillard acier inox ultra-fin étanche aux gaz.',
    condensationMitigationPercent: 50,
  },
  warm_edge_foam_structural: {
    id: 'warm_edge_foam_structural',
    labelFr: 'Warm-Edge Mousse Thermoplastique Haute Performance (TPA)',
    psiValueWPerMK: 0.034,
    materialDescriptionFr: 'Mousse de silicone alvéolaire structurelle à conductivité minimale et barrière pare-vapeur continue.',
    condensationMitigationPercent: 58,
  },
};

export const GLAZING_THERMAL_CATALOG: Record<string, GlazingThermalOption> = {
  single_float_6mm: {
    id: 'single_float_6mm',
    labelFr: 'Simple Vitrage Clair 6 mm',
    ugValueWPerM2K: 5.70,
    solarHeatGainG: 0.82,
    lightTransmittance: 0.88,
    description: 'Verre monolithique sans isolation thermique. Risque immédiat de condensation et paroi froide.',
  },
  double_4_16_4_air: {
    id: 'double_4_16_4_air',
    labelFr: 'Double Vitrage Standard 4/16/4 Air',
    ugValueWPerM2K: 2.70,
    solarHeatGainG: 0.76,
    lightTransmittance: 0.81,
    description: 'Lame d air sec déshydraté de 16 mm entre deux glaces claires standard.',
  },
  double_4_16_4_low_e_argon: {
    id: 'double_4_16_4_low_e_argon',
    labelFr: 'Double Vitrage ITR Faible Émissivité 4/16/4 Argon 90%',
    ugValueWPerM2K: 1.10,
    solarHeatGainG: 0.62,
    lightTransmittance: 0.78,
    description: 'Couche d argent magnétron sous vide et remplissage gaz argon à 90%. Réduit les pertes par 2.5.',
  },
  triple_4_12_4_12_4_argon: {
    id: 'triple_4_12_4_12_4_argon',
    labelFr: 'Triple Vitrage Haute Isolation 4/12/4/12/4 Deux Couches ITR Argon',
    ugValueWPerM2K: 0.70,
    solarHeatGainG: 0.50,
    lightTransmittance: 0.70,
    description: 'Trois verres avec deux cavités argon et deux couches peu émissives. Isolation thermique d élite.',
  },
};

export interface FrameThermalInput {
  windowWidthMm: number;
  windowHeightMm: number;
  frameProfile: FrameProfileSystemType;
  spacerType: SpacerBarType;
  glazingKey: string;
  hasMullionOrTransom?: boolean;
  intermediateProfileCount?: number; // extra vertical or horizontal profile lengths
  outdoorDesignTempC?: number; // e.g. 0 deg C for winter
  indoorDesignTempC?: number; // default 20 deg C
  indoorRelativeHumidityPercent?: number; // default 50%
  wilayaName?: string;
  clientName?: string;
  projectReference?: string;
}

export interface FrameThermalResult {
  windowWidthMm: number;
  windowHeightMm: number;
  windowTotalAreaM2: number;
  frameOpaqueAreaM2: number;
  glassVisionAreaM2: number;
  glassEdgePerimeterM: number;
  frameAreaFractionPercent: number;
  selectedFrame: FrameProfileSystemSpec;
  selectedSpacer: SpacerBarSpec;
  selectedGlazing: GlazingThermalOption;
  ufValueWPerM2K: number;
  ugValueWPerM2K: number;
  psiValueWPerMK: number;
  uwOverallWindowTransmittanceWPerM2K: number;
  heatLossRateWPerK: number; // Watts per Kelvin temperature difference
  heatLossBreakdownPercent: {
    glassLossPercent: number;
    frameLossPercent: number;
    spacerLossPercent: number;
  };
  dewPointTempC: number;
  indoorSurfaceTempFrameC: number;
  indoorSurfaceTempGlassEdgeC: number;
  condensationRiskIndexFrsi: number;
  isCondensationLikelyOnFrame: boolean;
  isCondensationLikelyOnGlassEdge: boolean;
  dtrZoneTargetUwWPerM2K: number;
  isDtrCompliant: boolean;
  dtrZoneName: string;
  thermalAuditStatus: 'optimal' | 'acceptable' | 'non_compliant';
  energyClassBadge: 'A+' | 'A' | 'B' | 'C' | 'D' | 'E';
  auditWarnings: string[];
  auditRecommendations: string[];
  billOfMaterials: {
    frameLinearLengthM: number;
    polyamideStripsTotalLengthM: number;
    spacerPerimeterM: number;
    recommendedGlazingThicknessMm: number;
  };
}

/**
 * Calculates window thermal transmittance Uw, frame Uf, linear thermal bridge Psi_g,
 * surface temperatures, and condensation risk according to ISO 10077-1 and CNERIB DTR C3-2.
 */
export function calculateFrameThermalAudit(input: FrameThermalInput): FrameThermalResult {
  const widthM = Math.max(0.4, input.windowWidthMm / 1000);
  const heightM = Math.max(0.4, input.windowHeightMm / 1000);
  const windowTotalAreaM2 = Number((widthM * heightM).toFixed(3));

  const frame = FRAME_SYSTEM_SPECS[input.frameProfile];
  const spacer = SPACER_BAR_SPECS[input.spacerType];
  const glazing = GLAZING_THERMAL_CATALOG[input.glazingKey] || GLAZING_THERMAL_CATALOG['double_4_16_4_air'];

  // Frame visible width in meters
  const faceWidthM = frame.faceWidthMm / 1000;

  // Frame perimeter and area
  const perimeterM = 2 * (widthM + heightM);
  let frameOpaqueAreaM2 = perimeterM * faceWidthM - 4 * Math.pow(faceWidthM, 2);

  // Intermediate profiles (mullions / transoms)
  const extraProfilesCount = input.intermediateProfileCount ?? (input.hasMullionOrTransom ? 1 : 0);
  if (extraProfilesCount > 0) {
    const intermediateWidthM = (frame.faceWidthMm * 0.9) / 1000;
    frameOpaqueAreaM2 += extraProfilesCount * heightM * intermediateWidthM;
  }

  frameOpaqueAreaM2 = Math.min(windowTotalAreaM2 * 0.65, Math.max(0.08, Number(frameOpaqueAreaM2.toFixed(3))));
  const glassVisionAreaM2 = Number((windowTotalAreaM2 - frameOpaqueAreaM2).toFixed(3));
  const frameAreaFractionPercent = Number(((frameOpaqueAreaM2 / windowTotalAreaM2) * 100).toFixed(1));

  // Glazing edge perimeter
  const daylightWidthM = Math.max(0.1, widthM - 2 * faceWidthM);
  const daylightHeightM = Math.max(0.1, heightM - 2 * faceWidthM);
  let glassEdgePerimeterM = 2 * (daylightWidthM + daylightHeightM);
  if (extraProfilesCount > 0) {
    glassEdgePerimeterM += 2 * daylightHeightM * extraProfilesCount;
  }
  glassEdgePerimeterM = Number(glassEdgePerimeterM.toFixed(2));

  // Overall Window Thermal Transmittance (Uw) per ISO 10077-1
  // Uw = (Ag * Ug + Af * Uf + lg * Psi_g) / (Ag + Af)
  const glassHeatLossW = glassVisionAreaM2 * glazing.ugValueWPerM2K;
  const frameHeatLossW = frameOpaqueAreaM2 * frame.ufValueWPerM2K;
  const spacerHeatLossW = glassEdgePerimeterM * spacer.psiValueWPerMK;
  const totalHeatLossRateWPerK = glassHeatLossW + frameHeatLossW + spacerHeatLossW;

  const uwOverallWindowTransmittanceWPerM2K = Number((totalHeatLossRateWPerK / windowTotalAreaM2).toFixed(2));

  // Heat loss breakdown percentages
  const glassLossPercent = Number(((glassHeatLossW / totalHeatLossRateWPerK) * 100).toFixed(1));
  const frameLossPercent = Number(((frameHeatLossW / totalHeatLossRateWPerK) * 100).toFixed(1));
  const spacerLossPercent = Number(((spacerHeatLossW / totalHeatLossRateWPerK) * 100).toFixed(1));

  // Psychrometric calculation for Dew Point & Condensation
  // Magnus formula for saturation vapor pressure and dew point
  const tIndoor = input.indoorDesignTempC ?? 20.0;
  const tOutdoor = input.outdoorDesignTempC ?? 0.0;
  const rh = (input.indoorRelativeHumidityPercent ?? 50.0) / 100;

  const a = 17.27;
  const b = 237.7;
  const alphaVal = (a * tIndoor) / (b + tIndoor) + Math.log(rh);
  const dewPointTempC = Number(((b * alphaVal) / (a - alphaVal)).toFixed(1));

  // Surface temperatures: Theta_si = Ti - Rsi * U * (Ti - Te)
  // Rsi standard vertical = 0.13 m2.K/W
  const rsi = 0.13;
  const deltaT = tIndoor - tOutdoor;

  // Frame internal surface temperature
  const indoorSurfaceTempFrameC = Number((tIndoor - rsi * frame.ufValueWPerM2K * deltaT).toFixed(1));
  // Glass edge surface temperature (combines Ug and Psi_g effect)
  const edgeLocalUVal = glazing.ugValueWPerM2K + (spacer.psiValueWPerMK / 0.06); // 60mm edge zone
  const indoorSurfaceTempGlassEdgeC = Number((tIndoor - rsi * edgeLocalUVal * deltaT).toFixed(1));

  // Temperature factor f_Rsi = (Theta_si - Te) / (Ti - Te)
  const minSurfaceTemp = Math.min(indoorSurfaceTempFrameC, indoorSurfaceTempGlassEdgeC);
  const condensationRiskIndexFrsi = Number(((minSurfaceTemp - tOutdoor) / deltaT).toFixed(2));

  const isCondensationLikelyOnFrame = indoorSurfaceTempFrameC <= dewPointTempC;
  const isCondensationLikelyOnGlassEdge = indoorSurfaceTempGlassEdgeC <= dewPointTempC;

  // DTR C3-2 Algerian Bioclimatic Regulations Target
  // Default Zone A (Alger, Oran) = 3.20 W/m2K, Zone B (Setif, Batna) = 2.60 W/m2K, Zone C (Sud) = 2.80 W/m2K
  let dtrZoneTargetUwWPerM2K = 3.20;
  let dtrZoneName = 'Zone A (Littoral & Tell)';

  const wilayaLower = (input.wilayaName || '').toLowerCase();
  if (
    wilayaLower.includes('sétif') ||
    wilayaLower.includes('setif') ||
    wilayaLower.includes('batna') ||
    wilayaLower.includes('médéa') ||
    wilayaLower.includes('djelfa') ||
    wilayaLower.includes('constantine') ||
    wilayaLower.includes('bordj')
  ) {
    dtrZoneTargetUwWPerM2K = 2.60;
    dtrZoneName = 'Zone B (Hauts-Plateaux)';
  } else if (
    wilayaLower.includes('biskra') ||
    wilayaLower.includes('ouargla') ||
    wilayaLower.includes('ghardaïa') ||
    wilayaLower.includes('adrar') ||
    wilayaLower.includes('béchar')
  ) {
    dtrZoneTargetUwWPerM2K = 2.80;
    dtrZoneName = 'Zone C (Sud & Sahara)';
  }

  const isDtrCompliant = uwOverallWindowTransmittanceWPerM2K <= dtrZoneTargetUwWPerM2K;

  // Thermal status and energy class
  let thermalAuditStatus: 'optimal' | 'acceptable' | 'non_compliant' = 'optimal';
  if (!isDtrCompliant || isCondensationLikelyOnFrame || isCondensationLikelyOnGlassEdge) {
    thermalAuditStatus = 'non_compliant';
  } else if (uwOverallWindowTransmittanceWPerM2K > 2.0) {
    thermalAuditStatus = 'acceptable';
  }

  let energyClassBadge: 'A+' | 'A' | 'B' | 'C' | 'D' | 'E' = 'C';
  if (uwOverallWindowTransmittanceWPerM2K <= 1.0) {
    energyClassBadge = 'A+';
  } else if (uwOverallWindowTransmittanceWPerM2K <= 1.4) {
    energyClassBadge = 'A';
  } else if (uwOverallWindowTransmittanceWPerM2K <= 1.9) {
    energyClassBadge = 'B';
  } else if (uwOverallWindowTransmittanceWPerM2K <= 2.6) {
    energyClassBadge = 'C';
  } else if (uwOverallWindowTransmittanceWPerM2K <= 3.2) {
    energyClassBadge = 'D';
  } else {
    energyClassBadge = 'E';
  }

  // Warnings and Recommendations
  const auditWarnings: string[] = [];
  const auditRecommendations: string[] = [];

  if (frame.ufValueWPerM2K >= 5.0) {
    auditWarnings.push('Profilé aluminium sans rupture de pont thermique : déperditions massives et pont thermique direct.');
    auditRecommendations.push('Adopter impérativement un profilé à rupture thermique (polyamide >= 14.8 mm) pour stopper le ruissellement d eau.');
  }

  if (isCondensationLikelyOnFrame) {
    auditWarnings.push(`Température de surface intérieure du profilé (${indoorSurfaceTempFrameC}°C) inférieure au point de rosée (${dewPointTempC}°C). Risque de buée.`);
    auditRecommendations.push('Passer à une gamme supérieure (RPT 24 mm ou PVC 5 chambres) pour remonter la température de contact intérieure.');
  }

  if (isCondensationLikelyOnGlassEdge) {
    auditWarnings.push(`Point froid au pourtour du vitrage (${indoorSurfaceTempGlassEdgeC}°C <= ${dewPointTempC}°C) causé par l intercalaire conducteur.`);
    auditRecommendations.push('Remplacer l intercalaire aluminium par un intercalaire Warm-Edge en composite thermoplastique (Psi = 0.040 W/m.K).');
  }

  if (!isDtrCompliant) {
    auditWarnings.push(`Coefficient Uw calculé (${uwOverallWindowTransmittanceWPerM2K} W/m²K) supérieur au seuil réglementaire CNERIB DTR C3-2 (${dtrZoneTargetUwWPerM2K} W/m²K).`);
    auditRecommendations.push(`Combiner un vitrage peu émissif avec gaz argon (Ug = 1.1 W/m²K) et une barrette polyamide d au moins 24 mm.`);
  }

  if (spacer.id === 'aluminum_standard') {
    auditRecommendations.push('L intercalaire standard représente ' + spacerLossPercent + '% des pertes globales de la baie. Le Warm-Edge réduit ce poste de moitié.');
  }

  return {
    windowWidthMm: input.windowWidthMm,
    windowHeightMm: input.windowHeightMm,
    windowTotalAreaM2,
    frameOpaqueAreaM2,
    glassVisionAreaM2,
    glassEdgePerimeterM,
    frameAreaFractionPercent,
    selectedFrame: frame,
    selectedSpacer: spacer,
    selectedGlazing: glazing,
    ufValueWPerM2K: frame.ufValueWPerM2K,
    ugValueWPerM2K: glazing.ugValueWPerM2K,
    psiValueWPerMK: spacer.psiValueWPerMK,
    uwOverallWindowTransmittanceWPerM2K,
    heatLossRateWPerK: Number(totalHeatLossRateWPerK.toFixed(2)),
    heatLossBreakdownPercent: {
      glassLossPercent,
      frameLossPercent,
      spacerLossPercent,
    },
    dewPointTempC,
    indoorSurfaceTempFrameC,
    indoorSurfaceTempGlassEdgeC,
    condensationRiskIndexFrsi,
    isCondensationLikelyOnFrame,
    isCondensationLikelyOnGlassEdge,
    dtrZoneTargetUwWPerM2K,
    isDtrCompliant,
    dtrZoneName,
    thermalAuditStatus,
    energyClassBadge,
    auditWarnings,
    auditRecommendations,
    billOfMaterials: {
      frameLinearLengthM: perimeterM,
      polyamideStripsTotalLengthM: frame.polyamideStripWidthMm > 0 ? Number((perimeterM * 2).toFixed(2)) : 0, // 2 strips per profile
      spacerPerimeterM: glassEdgePerimeterM,
      recommendedGlazingThicknessMm: frame.nominalFrameDepthMm >= 60 ? 28 : 24,
    },
  };
}
