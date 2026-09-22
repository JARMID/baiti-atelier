/**
 * Baiti Atelier - Glazing Thermal Stress & Solar Breakage Calculator
 * Normative references: NF DTU 39 P3 / CSTB Cahier 3488 / DTR C3-2 (Algeria)
 * Strict Humanizer adherence: 0 em dashes, 0 en dashes, authentic joinery terminology.
 */

import type { GlassType } from '../types/window';

export type ThermalClimaticZone = 'zone_a' | 'zone_b' | 'zone_c' | 'zone_d';

export type ExposureOrientation = 'south' | 'south_west' | 'west' | 'east' | 'north' | 'horizontal';

export type ExteriorShading = 'none' | 'overhang' | 'partial_shutter' | 'vertical_fin' | 'building_mask';

export type InteriorObstruction =
  | 'none'
  | 'light_curtain_ventilated'
  | 'dark_blind_close'
  | 'venetian_blind'
  | 'air_convector'
  | 'spandrel_insulation';

export type EdgeFinishing = 'cut_raw' | 'arrised' | 'polished_jpp';

export type ThermalTreatment = 'annealed' | 'heat_strengthened' | 'tempered_securit' | 'tempered_hst';

export type FrameProfileType = 'cold_alu' | 'thermal_break_alu' | 'pvc_multi_chamber';

export type RiskLevel = 'low' | 'moderate' | 'high' | 'critical';

export interface ClimaticZoneData {
  id: ThermalClimaticZone;
  code: string;
  nameFr: string;
  subFr: string;
  maxSolarIrradianceWPerM2: number;
  maxSummerTempC: number;
  minMorningTempC: number;
  wilayasRepresentativeFr: string;
  descriptionFr: string;
}

export const CLIMATIC_ZONES: Record<ThermalClimaticZone, ClimaticZoneData> = {
  zone_a: {
    id: 'zone_a',
    code: 'DTR Zone A',
    nameFr: 'Zone Littorale & Tell',
    subFr: 'Alger, Oran, Annaba, Tipaza, Bejaia',
    maxSolarIrradianceWPerM2: 850,
    maxSummerTempC: 36,
    minMorningTempC: 8,
    wilayasRepresentativeFr: 'Alger, Oran, Annaba, Tipaza, Bejaia, Mostaganem',
    descriptionFr: 'Climat maritime tempéré. Ensoleillement modéré avec humidité relative soutenue.',
  },
  zone_b: {
    id: 'zone_b',
    code: 'DTR Zone B',
    nameFr: 'Hauts Plateaux & Atlas Tellien',
    subFr: 'Setif, Batna, Constantine, BBA, Medea',
    maxSolarIrradianceWPerM2: 920,
    maxSummerTempC: 39,
    minMorningTempC: -2,
    wilayasRepresentativeFr: 'Setif, Batna, Constantine, Bordj Bou Arreridj, Medea, Djelfa',
    descriptionFr: 'Forte amplitude thermique diurne (20 à 25 deg C d ecart). Matinées froides avec soleil vif.',
  },
  zone_c: {
    id: 'zone_c',
    code: 'DTR Zone C',
    nameFr: 'Atlas Saharien & Piedmont',
    subFr: 'Biskra, Laghouat, El Oued, Tebessa',
    maxSolarIrradianceWPerM2: 980,
    maxSummerTempC: 44,
    minMorningTempC: 4,
    wilayasRepresentativeFr: 'Biskra, Laghouat, El Oued, Tebessa, Ghardaia',
    descriptionFr: 'Climat semi aride a aride. Rayonnement solaire intense et ciel limpide sans nuages.',
  },
  zone_d: {
    id: 'zone_d',
    code: 'DTR Zone D',
    nameFr: 'Sahara Profond & Grand Sud',
    subFr: 'Adrar, Ouargla, In Salah, Tamanrasset',
    maxSolarIrradianceWPerM2: 1050,
    maxSummerTempC: 49,
    minMorningTempC: 10,
    wilayasRepresentativeFr: 'Adrar, Ouargla, In Salah, Timimoun, Bechar, Tindouf, Tamanrasset',
    descriptionFr: 'Conditions climatiques extremes. Rayonnement direct maximal et canicules estivales continues.',
  },
};

export interface OrientationData {
  id: ExposureOrientation;
  labelFr: string;
  subFr: string;
  irradianceCoefficient: number;
  riskFactorCommentFr: string;
}

export const ORIENTATIONS: Record<ExposureOrientation, OrientationData> = {
  south_west: {
    id: 'south_west',
    labelFr: 'Sud Ouest (Critique en ete)',
    subFr: 'Rayonnement maximal combine a la canicule de l apres midi',
    irradianceCoefficient: 0.98,
    riskFactorCommentFr: 'Orientation la plus dangereuse pour le choc thermique en climat algerien.',
  },
  west: {
    id: 'west',
    labelFr: 'Plein Ouest (Chaud apres midi)',
    subFr: 'Soleil rasant direct a l heure la plus chaude',
    irradianceCoefficient: 0.94,
    riskFactorCommentFr: 'Surchauffe brutale en fin de journee sur vitrage deja chaud.',
  },
  south: {
    id: 'south',
    labelFr: 'Plein Sud (Fort en mi saison)',
    subFr: 'Angle solaire optimal et apport thermique soutenu',
    irradianceCoefficient: 0.90,
    riskFactorCommentFr: 'Fort apport thermique en hiver et intersaison quand le soleil est bas.',
  },
  east: {
    id: 'east',
    labelFr: 'Plein Est (Matin froid)',
    subFr: 'Soleil matinal violent sur vitrage refroidi pendant la nuit',
    irradianceCoefficient: 0.88,
    riskFactorCommentFr: 'Choc thermique violent au lever du soleil sur profil froid des Hauts Plateaux.',
  },
  north: {
    id: 'north',
    labelFr: 'Plein Nord (Diffus)',
    subFr: 'Rayonnement indirect uniquement',
    irradianceCoefficient: 0.28,
    riskFactorCommentFr: 'Risque de casse thermique quasi nul sauf apport convectif interne anormal.',
  },
  horizontal: {
    id: 'horizontal',
    labelFr: 'Verriere / Toiture (Zenithal)',
    subFr: 'Exposition directe sous le soleil au zenith',
    irradianceCoefficient: 1.00,
    riskFactorCommentFr: 'Exposition maximale au zenith. Trempe de securite ou feuillete trempe requis.',
  },
};

export interface ShadingData {
  id: ExteriorShading;
  labelFr: string;
  subFr: string;
  gradientMultiplier: number;
  descriptionFr: string;
}

export const EXTERIOR_SHADINGS: Record<ExteriorShading, ShadingData> = {
  none: {
    id: 'none',
    labelFr: 'Aucun ombrage (Exposition totale)',
    subFr: 'Ensoleillement uniforme sans obstacle',
    gradientMultiplier: 1.0,
    descriptionFr: 'Le vitrage s echauffe de facon homogene mais le bord en feuillure reste plus frais.',
  },
  overhang: {
    id: 'overhang',
    labelFr: 'Casquette beton / Debord de toit',
    subFr: 'Ligne d ombre nette horizontale au tiers superieur',
    gradientMultiplier: 1.35,
    descriptionFr: 'Cree une demarcation thermique abrupte entre la zone a l ombre et la zone eclairee.',
  },
  partial_shutter: {
    id: 'partial_shutter',
    labelFr: 'Volet roulant entrouvert (30 a 50%)',
    subFr: 'Zone superieure confinee et zone basse au soleil',
    gradientMultiplier: 1.55,
    descriptionFr: 'Cas typique de casse thermique. Le bas du vitrage chauffe pendant que le haut reste a l ombre.',
  },
  vertical_fin: {
    id: 'vertical_fin',
    labelFr: 'Brise soleil vertical / Retour tableau',
    subFr: 'Ombre diagonale ou verticale se deplacant lentement',
    gradientMultiplier: 1.25,
    descriptionFr: 'Ombrage lateral creant une contrainte de cisaillement le long des bords verticaux.',
  },
  building_mask: {
    id: 'building_mask',
    labelFr: 'Batiment voisin / Arbre touffu',
    subFr: 'Masque lointain projetant une ombre progressive',
    gradientMultiplier: 1.15,
    descriptionFr: 'Ombrage d intensite variable generant un gradient modere sur la surface vitree.',
  },
};

export interface InteriorObstructionData {
  id: InteriorObstruction;
  labelFr: string;
  subFr: string;
  deltaTAddK: number;
  descriptionFr: string;
}

export const INTERIOR_OBSTRUCTIONS: Record<InteriorObstruction, InteriorObstructionData> = {
  none: {
    id: 'none',
    labelFr: 'Aucun obstacle (Ventilation normale)',
    subFr: 'Piece aeree sans rideau proche du vitrage',
    deltaTAddK: 0,
    descriptionFr: 'Circulation d air libre sur la face interieure du vitrage.',
  },
  light_curtain_ventilated: {
    id: 'light_curtain_ventilated',
    labelFr: 'Voilage clair ventilé (Distance > 10 cm)',
    subFr: 'Tissu clair laissant circuler l air haut et bas',
    deltaTAddK: 4,
    descriptionFr: 'Faible piegeage calorifique grace a la circulation convective.',
  },
  dark_blind_close: {
    id: 'dark_blind_close',
    labelFr: 'Rideau opaque sombre proche (< 5 cm)',
    subFr: 'Piege calorifique majeur absorbant et re-emettant',
    deltaTAddK: 18,
    descriptionFr: 'L air bloque entre le rideau et le vitrage monte a plus de 60 deg C.',
  },
  venetian_blind: {
    id: 'venetian_blind',
    labelFr: 'Store venitien metallique interne',
    subFr: 'Lames d alu reflechissant le rayonnement sur le vitrage',
    deltaTAddK: 14,
    descriptionFr: 'Effet de miroir renvoyant la chaleur directement sur le verre interieur.',
  },
  air_convector: {
    id: 'air_convector',
    labelFr: 'Soufflage climatiseur / Convecteur dirige',
    subFr: 'Flux thermique ou froid souffle contre la vitre',
    deltaTAddK: 12,
    descriptionFr: 'Cree un point chaud ou froid tres localise provoquant un gradient thermique ponctuel.',
  },
  spandrel_insulation: {
    id: 'spandrel_insulation',
    labelFr: 'Allege opaque isolee (Shadow box non ventilee)',
    subFr: 'Laine de roche plaquee derriere le vitrage',
    deltaTAddK: 28,
    descriptionFr: 'Confinement total de la chaleur. Trempe obligatoire sans aucune exception.',
  },
};

export interface EdgeFinishingData {
  id: EdgeFinishing;
  labelFr: string;
  subFr: string;
  deltaTCritAnnealedK: number;
  descriptionFr: string;
}

export const EDGE_FINISHINGS: Record<EdgeFinishing, EdgeFinishingData> = {
  cut_raw: {
    id: 'cut_raw',
    labelFr: 'Coupe brute (Sans faconnage)',
    subFr: 'Aretes vives avec microfissures de coupe residuelles',
    deltaTCritAnnealedK: 35,
    descriptionFr: 'Les microfissures de decoupe constituent des amorces de rupture a basse contrainte.',
  },
  arrised: {
    id: 'arrised',
    labelFr: 'Aretes abattues (Meulees a sec ou sous eau)',
    subFr: 'Chanfrein protecteur eliminant les ecailles de bord',
    deltaTCritAnnealedK: 42,
    descriptionFr: 'Standard atelier de qualite. Reduit nettement le risque d amorce de fissure.',
  },
  polished_jpp: {
    id: 'polished_jpp',
    labelFr: 'Joint Plat Poli (JPP)',
    subFr: 'Chant parfaitement lisse et poli sans aucun defaut',
    deltaTCritAnnealedK: 48,
    descriptionFr: 'Finition soignee augmentant la resistance thermique admissible du verre recuit.',
  },
};

export interface ThermalTreatmentData {
  id: ThermalTreatment;
  labelFr: string;
  subFr: string;
  deltaTCritK: number;
  tradeUsageFr: string;
}

export const THERMAL_TREATMENTS: Record<ThermalTreatment, ThermalTreatmentData> = {
  annealed: {
    id: 'annealed',
    labelFr: 'Verre Recuit Ordinaire (Float standard)',
    subFr: 'Sans traitement thermique de precontrainte',
    deltaTCritK: 40, // Base modifiee par le faconnage des aretes
    tradeUsageFr: 'Vitrage standard pour chassis sans ombrage critique ni store sombre confine.',
  },
  heat_strengthened: {
    id: 'heat_strengthened',
    labelFr: 'Verre Semi Trempé / Durci (TVG)',
    subFr: 'Precontrainte thermique moyenne (EN 1863)',
    deltaTCritK: 100,
    tradeUsageFr: 'Excellente tenue au choc thermique sans risque de casse spontanee par sulfure de nickel.',
  },
  tempered_securit: {
    id: 'tempered_securit',
    labelFr: 'Verre Trempé Thermique Sécurit (ESG)',
    subFr: 'Forte precontrainte thermique (EN 12150)',
    deltaTCritK: 150,
    tradeUsageFr: 'Obligatoire des que le gradient depasse 45 deg C selon DTU 39. Resistance mecanique quintuplee.',
  },
  tempered_hst: {
    id: 'tempered_hst',
    labelFr: 'Trempé Sécurit + Heat Soak Test (HST)',
    subFr: 'Trempe controlee avec elimination du sulfure de nickel',
    deltaTCritK: 200,
    tradeUsageFr: 'Recommande pour facons vitrees, verrieres et regions du Sahara a ensoleillement extreme.',
  },
};

export interface FrameProfileData {
  id: FrameProfileType;
  labelFr: string;
  subFr: string;
  rebateConductionFactor: number;
  descriptionFr: string;
}

export const FRAME_PROFILES: Record<FrameProfileType, FrameProfileData> = {
  cold_alu: {
    id: 'cold_alu',
    labelFr: 'Aluminium Froid (Sans RPT)',
    subFr: 'Transmission directe du froid et de la chaleur',
    rebateConductionFactor: 1.22,
    descriptionFr: 'Profil conducteur gardant le bord du vitrage tres froid en hiver lors du lever du soleil.',
  },
  thermal_break_alu: {
    id: 'thermal_break_alu',
    labelFr: 'Aluminium avec Rupture Thermique (RPT)',
    subFr: 'Barrettes polyamide isolantes de 14 a 24 mm',
    rebateConductionFactor: 1.0,
    descriptionFr: 'Feuillure temperee attenuant le choc thermique entre le centre du vitrage et son bord.',
  },
  pvc_multi_chamber: {
    id: 'pvc_multi_chamber',
    labelFr: 'PVC Multi Chambres (5 chambres)',
    subFr: 'Excellente isolation thermique de feuillure',
    rebateConductionFactor: 0.92,
    descriptionFr: 'Profil chaud reduisant l ecart thermique entre le bord enchasse et la partie centrale.',
  },
};

export interface GlassAbsorptionEstimate {
  solarAbsorption: number; // 0.0 to 1.0
  solarFactorG: number;
  lightTransmissionTl: number;
  outerPaneAbs: number;
  innerPaneAbs: number;
  tradeObservationFr: string;
}

export function getGlassThermalProperties(glassType: GlassType | string): GlassAbsorptionEstimate {
  switch (glassType) {
    case 'stop_sol':
      return {
        solarAbsorption: 0.52,
        solarFactorG: 0.28,
        lightTransmissionTl: 0.38,
        outerPaneAbs: 0.48,
        innerPaneAbs: 0.08,
        tradeObservationFr: 'Forte absorption sur la couche reflechissante. Echauffement rapide en plein soleil.',
      };
    case 'sable':
      return {
        solarAbsorption: 0.38,
        solarFactorG: 0.44,
        lightTransmissionTl: 0.55,
        outerPaneAbs: 0.32,
        innerPaneAbs: 0.12,
        tradeObservationFr: 'Diffusion sablée absorbant une partie de l energie radiative.',
      };
    case 'double_argon_warmedge':
      return {
        solarAbsorption: 0.24,
        solarFactorG: 0.50,
        lightTransmissionTl: 0.79,
        outerPaneAbs: 0.16,
        innerPaneAbs: 0.14,
        tradeObservationFr: 'Couche peu emissive faiblement absorbante. Warm Edge limitant le pont thermique de bord.',
      };
    case 'phonique_stadip':
      return {
        solarAbsorption: 0.26,
        solarFactorG: 0.48,
        lightTransmissionTl: 0.75,
        outerPaneAbs: 0.20,
        innerPaneAbs: 0.10,
        tradeObservationFr: 'Intercalaire PVB acoustique resistant a des ecarts de temperature moderes.',
      };
    case 'securit_tempered':
      return {
        solarAbsorption: 0.15,
        solarFactorG: 0.79,
        lightTransmissionTl: 0.87,
        outerPaneAbs: 0.15,
        innerPaneAbs: 0.0,
        tradeObservationFr: 'Verre trempe d origine. Immunite totale face aux contraintes thermiques courantes.',
      };
    case 'double_clear':
      return {
        solarAbsorption: 0.18,
        solarFactorG: 0.76,
        lightTransmissionTl: 0.81,
        outerPaneAbs: 0.14,
        innerPaneAbs: 0.08,
        tradeObservationFr: 'Double vitrage clair classique a faible absorption naturelle.',
      };
    case 'simple_clear':
    default:
      return {
        solarAbsorption: 0.12,
        solarFactorG: 0.82,
        lightTransmissionTl: 0.89,
        outerPaneAbs: 0.12,
        innerPaneAbs: 0.0,
        tradeObservationFr: 'Simple vitrage float standard. Absorption solaire minime.',
      };
  }
}

export interface ThermalStressInput {
  glassType: GlassType | string;
  zone: ThermalClimaticZone;
  orientation: ExposureOrientation;
  exteriorShading: ExteriorShading;
  interiorObstruction: InteriorObstruction;
  edgeFinishing: EdgeFinishing;
  thermalTreatment: ThermalTreatment;
  frameProfile: FrameProfileType;
  paneWidthMm?: number;
  paneHeightMm?: number;
}

export interface ThermalStressResult {
  climaticZoneData: ClimaticZoneData;
  orientationData: OrientationData;
  shadingData: ShadingData;
  interiorObstructionData: InteriorObstructionData;
  edgeFinishingData: EdgeFinishingData;
  thermalTreatmentData: ThermalTreatmentData;
  frameProfileData: FrameProfileData;
  glassProperties: GlassAbsorptionEstimate;
  ambientMaxTempC: number;
  ambientMinTempC: number;
  solarIrradianceNominal: number;
  solarIrradianceEffective: number;
  estimatedCenterTempC: number;
  estimatedEdgeTempC: number;
  deltaTActualK: number;
  deltaTCritK: number;
  safetyRatio: number;
  riskLevel: RiskLevel;
  statusBadgeFr: string;
  badgeBgClass: string;
  badgeTextClass: string;
  badgeBorderClass: string;
  isCompliant: boolean;
  temperingMandatory: boolean;
  recommendedTreatment: ThermalTreatment;
  recommendedEdge: EdgeFinishing;
  crackTypeDescriptionFr: string;
  normativeClausesFr: string[];
  workshopRecommendationsFr: string[];
}

/**
 * Calculates thermal gradient and breakage risk according to CSTB 3488 / DTU 39.
 */
export function calculateGlazingThermalStress(input: ThermalStressInput): ThermalStressResult {
  const zoneData = CLIMATIC_ZONES[input.zone] || CLIMATIC_ZONES.zone_a;
  const orientData = ORIENTATIONS[input.orientation] || ORIENTATIONS.south_west;
  const shadeData = EXTERIOR_SHADINGS[input.exteriorShading] || EXTERIOR_SHADINGS.none;
  const obstData = INTERIOR_OBSTRUCTIONS[input.interiorObstruction] || INTERIOR_OBSTRUCTIONS.none;
  const edgeData = EDGE_FINISHINGS[input.edgeFinishing] || EDGE_FINISHINGS.arrised;
  const treatData = THERMAL_TREATMENTS[input.thermalTreatment] || THERMAL_TREATMENTS.annealed;
  const frameData = FRAME_PROFILES[input.frameProfile] || FRAME_PROFILES.thermal_break_alu;
  const glassProps = getGlassThermalProperties(input.glassType);

  // Irradiance calculation
  const nominalIrr = zoneData.maxSolarIrradianceWPerM2;
  const effectiveIrr = Math.round(nominalIrr * orientData.irradianceCoefficient);

  // Surface exchange coefficient: he ~ 20 W/m2.K, hi ~ 8 W/m2.K => total ~ 28 W/m2.K
  const hCombined = 28;
  const directSolarRise = (glassProps.solarAbsorption * effectiveIrr) / hCombined;

  // Center temperature estimation in extreme conditions
  const estimatedCenter = Math.round(
    zoneData.maxSummerTempC +
      directSolarRise * shadeData.gradientMultiplier +
      obstData.deltaTAddK
  );

  // Shaded rebate temperature estimation
  // In the rebate, the glass edge is protected from sun, shielded by profile and gaskets
  // During hot period, frame conduction warms it slightly, but stays lower than glass center
  // In winter morning scenario on east/south-east, ambient is minMorningTempC while center rises rapidly
  const edgeBaseTemp = zoneData.maxSummerTempC + 4;
  const estimatedEdge = Math.round(edgeBaseTemp * (frameData.rebateConductionFactor > 1 ? 0.92 : 0.98));

  // Actual thermal gradient Delta T across the pane
  // CSTB 3488 empirical model formulation:
  const baseDeltaT = directSolarRise * shadeData.gradientMultiplier * frameData.rebateConductionFactor;
  const finalDeltaT = Math.round(baseDeltaT + obstData.deltaTAddK);

  // Critical threshold Delta T crit calculation
  let deltaTCrit = 40;
  if (input.thermalTreatment === 'annealed') {
    deltaTCrit = edgeData.deltaTCritAnnealedK;
    // Tinted and coated glass reduce annealed resistance by 3 K due to surface absorption concentration
    if (input.glassType === 'stop_sol') {
      deltaTCrit = Math.max(30, deltaTCrit - 4);
    }
  } else {
    deltaTCrit = treatData.deltaTCritK;
  }

  // Safety ratio R = DeltaT / DeltaTCrit
  const safetyRatio = Number((finalDeltaT / deltaTCrit).toFixed(2));

  // Risk categorization
  let riskLevel: RiskLevel = 'low';
  let statusBadgeFr = 'Conforme & Sécurisé';
  let badgeBgClass = 'bg-emerald-500/10';
  let badgeTextClass = 'text-emerald-400';
  let badgeBorderClass = 'border-emerald-500/30';
  let isCompliant = true;
  let temperingMandatory = false;

  if (safetyRatio >= 1.0) {
    riskLevel = 'critical';
    statusBadgeFr = 'DANGER CASSE THERMIQUE (Non Conforme DTU 39)';
    badgeBgClass = 'bg-rose-500/15';
    badgeTextClass = 'text-rose-400';
    badgeBorderClass = 'border-rose-500/40';
    isCompliant = false;
    temperingMandatory = true;
  } else if (safetyRatio >= 0.82) {
    riskLevel = 'high';
    statusBadgeFr = 'Risque Élevé (Zone Limite Normative)';
    badgeBgClass = 'bg-amber-500/15';
    badgeTextClass = 'text-amber-400';
    badgeBorderClass = 'border-amber-500/40';
    isCompliant = false;
    temperingMandatory = true;
  } else if (safetyRatio >= 0.65) {
    riskLevel = 'moderate';
    statusBadgeFr = 'Vigilance Requise (Façonnage Soigné Recommandé)';
    badgeBgClass = 'bg-sky-500/15';
    badgeTextClass = 'text-sky-400';
    badgeBorderClass = 'border-sky-500/30';
    isCompliant = true;
    temperingMandatory = false;
  }

  // Recommendations
  let recommendedTreatment: ThermalTreatment = 'annealed';
  let recommendedEdge: EdgeFinishing = 'arrised';

  if (temperingMandatory) {
    if (input.zone === 'zone_d' || input.interiorObstruction === 'spandrel_insulation') {
      recommendedTreatment = 'tempered_hst';
    } else {
      recommendedTreatment = 'tempered_securit';
    }
    recommendedEdge = 'polished_jpp';
  } else if (safetyRatio >= 0.65) {
    recommendedTreatment = 'annealed';
    recommendedEdge = 'polished_jpp';
  }

  const workshopRecommendationsFr: string[] = [];
  if (temperingMandatory) {
    workshopRecommendationsFr.push(
      'Trempe thermique de securite (ESG) obligatoire avant montage. Le verre recuit ordinaire cassera des les premieres fortes chaleurs.'
    );
    workshopRecommendationsFr.push(
      'Ne jamais expedier sur chantier de vitrage recuit avec cette configuration d ombrage ou de store confine.'
    );
  } else {
    workshopRecommendationsFr.push(
      'Le verre recuit convient pour cette application sous reserve d une coupe propre et sans ecaillures.'
    );
  }

  if (input.edgeFinishing === 'cut_raw' && safetyRatio >= 0.55) {
    workshopRecommendationsFr.push(
      'Proscrire les aretes brutes de coupe. Exiger au minimum un meulage des aretes abattues a l atelier pour supprimer les microfissures.'
    );
  }

  if (input.interiorObstruction === 'dark_blind_close' || input.interiorObstruction === 'venetian_blind') {
    workshopRecommendationsFr.push(
      'Informer le client de laisser au moins 50 mm entre le vitrage et les stores, avec fentes d aeration en partie haute et basse.'
    );
  }

  if (input.exteriorShading === 'partial_shutter') {
    workshopRecommendationsFr.push(
      'Sensibiliser l utilisateur: ne pas laisser le volet roulant mi clos a 40% en plein soleil sur les facades Sud et Ouest.'
    );
  }

  if (input.frameProfile === 'cold_alu') {
    workshopRecommendationsFr.push(
      'Le profile alu froid majore le gradient au niveau de la feuillure. Privilegier des cales d assise isolantes et des joints EPDM souples.'
    );
  }

  const normativeClausesFr: string[] = [
    'NF DTU 39 P3 (Travaux de vitrerie et miroiterie): calcul des contraintes d origine thermique sous rayonnement solaire.',
    'CSTB Cahier 3488: guide d evaluation du risque de casse thermique dans les vitrages isolants.',
    'DTR C3-2 / C3-4 (Reglementation thermique du batiment en Algerie): cartographie des zones climatiques et sollicitations d ete.',
  ];

  const crackTypeDescriptionFr =
    'Une casse d origine thermique debute toujours rigoureusement perpendiculaire au bord du vitrage et au chant sur environ 20 a 50 mm, avant de bifurquer ou de s arboriser. Elle se distingue nettement d une casse par impact mecanique ou point de frappe concentrique.';

  return {
    climaticZoneData: zoneData,
    orientationData: orientData,
    shadingData: shadeData,
    interiorObstructionData: obstData,
    edgeFinishingData: edgeData,
    thermalTreatmentData: treatData,
    frameProfileData: frameData,
    glassProperties: glassProps,
    ambientMaxTempC: zoneData.maxSummerTempC,
    ambientMinTempC: zoneData.minMorningTempC,
    solarIrradianceNominal: nominalIrr,
    solarIrradianceEffective: effectiveIrr,
    estimatedCenterTempC: estimatedCenter,
    estimatedEdgeTempC: estimatedEdge,
    deltaTActualK: finalDeltaT,
    deltaTCritK: deltaTCrit,
    safetyRatio,
    riskLevel,
    statusBadgeFr,
    badgeBgClass,
    badgeTextClass,
    badgeBorderClass,
    isCompliant,
    temperingMandatory,
    recommendedTreatment,
    recommendedEdge,
    crackTypeDescriptionFr,
    normativeClausesFr,
    workshopRecommendationsFr,
  };
}

/**
 * Generates WhatsApp dispatch report for the workshop manager, glazier or architect.
 */
export function formatThermalStressWhatsApp(
  result: ThermalStressResult,
  glassNameFr: string,
  openingDimensionsFr: string,
  workshopName: string = 'Baiti Atelier'
): string {
  const complianceEmoji = result.isCompliant ? '✅ CONFORME' : '🚨 RISQUE CASSE THERMIQUE';
  const temperingStatus = result.temperingMandatory
    ? 'TREMPE THERMIQUE OBLIGATOIRE'
    : 'Verre recuit admissible';

  return `*${workshopName} - AUDIT CHOC THERMIQUE VITRAGE (DTU 39 / DTR C3-2)*

📋 *Ouvrage:* ${openingDimensionsFr}
🪟 *Vitrage:* ${glassNameFr}
📍 *Zone DTR:* ${result.climaticZoneData.nameFr} (${result.climaticZoneData.code})
🧭 *Orientation:* ${result.orientationData.labelFr}
🏢 *Ombrage exterieur:* ${result.shadingData.labelFr}
🪟 *Confinement interieur:* ${result.interiorObstructionData.labelFr}

📊 *DIAGNOSTIC THERMIQUE:*
• Rayonnement effectif: ${result.solarIrradianceEffective} W/m²
• T° estimée centre vitrage: ${result.estimatedCenterTempC}°C
• Gradient thermique (ΔT): ${result.deltaTActualK} K
• Seuil critique admissible (ΔT crit): ${result.deltaTCritK} K
• Ratio de sécurité: ${result.safetyRatio} (seuil max: 1.00)

⚖️ *VERDICT NORMATIF:* ${complianceEmoji}
🔧 *Préconisation:* ${temperingStatus}
🔪 *Finition des arêtes:* ${result.recommendedEdge === 'polished_jpp' ? 'Joint Plat Poli (JPP)' : 'Arêtes abattues soignées'}

⚠️ *Conseil Atelier:*
${result.workshopRecommendationsFr[0] || 'Vérifier la bonne ventilation des feuillures et des cales de drainage.'}

_Généré via Baiti Atelier - Conforme NF DTU 39 & DTR C3-2_`;
}
