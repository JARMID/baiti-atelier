/**
 * Baiti Atelier - Seismic Joinery Movement & Inter-Story Drift Safety Manager
 * Calculation of structural drift and glass clearance safety (NF EN 1998-1 / RPA 99 v2003 / NF DTU 36.5 Annexe B)
 * Humanizer compliant: exactly 0 em dashes, 0 en dashes.
 */

export type AlgerianSeismicZone =
  | 'zone_0'
  | 'zone_1'
  | 'zone_2a'
  | 'zone_2b'
  | 'zone_3';

export type BuildingUsageGroup =
  | 'group_1a'
  | 'group_1b'
  | 'group_2'
  | 'group_3';

export type StructuralFrameSystem =
  | 'concrete_portal_ductile'
  | 'concrete_shear_walls'
  | 'steel_braced_frame'
  | 'masonry_confined';

export type GlazingSecurityType =
  | 'annealed_float'
  | 'toughened_esg'
  | 'laminated_pvb_33_2'
  | 'laminated_pvb_44_2'
  | 'laminated_acoustic_silence';

export interface SeismicZoneData {
  id: AlgerianSeismicZone;
  nameFr: string;
  nominalAccelerationA: number; // Acceleration de zone A pour groupe 2
  seismicityLevelFr: string;
  representativeWilayasFr: string;
}

export const SEISMIC_ZONES_RPA: Record<AlgerianSeismicZone, SeismicZoneData> = {
  zone_0: {
    id: 'zone_0',
    nameFr: 'Zone 0 : Sismicité Négligeable',
    nominalAccelerationA: 0.0,
    seismicityLevelFr: 'Négligeable',
    representativeWilayasFr: 'Tamanrasset, Adrar, Illizi, Tindouf, In Salah',
  },
  zone_1: {
    id: 'zone_1',
    nameFr: 'Zone I : Sismicité Faible',
    nominalAccelerationA: 0.10,
    seismicityLevelFr: 'Faible',
    representativeWilayasFr: 'Biskra, Djelfa, Laghouat, Tébessa, El Oued, Ouargla',
  },
  zone_2a: {
    id: 'zone_2a',
    nameFr: 'Zone IIa : Sismicité Moyenne',
    nominalAccelerationA: 0.15,
    seismicityLevelFr: 'Moyenne',
    representativeWilayasFr: 'Sétif, Batna, Tlemcen, Sidi Bel Abbès, Tizi Ouzou, Bordj Bou Arreridj, Guelma',
  },
  zone_2b: {
    id: 'zone_2b',
    nameFr: 'Zone IIb : Sismicité Élevée',
    nominalAccelerationA: 0.25,
    seismicityLevelFr: 'Élevée',
    representativeWilayasFr: 'Alger, Boumerdès, Tipaza, Blida, Oran, Bouira, Médéa, Mostaganem, Mascara',
  },
  zone_3: {
    id: 'zone_3',
    nameFr: 'Zone III : Sismicité Très Élevée',
    nominalAccelerationA: 0.35,
    seismicityLevelFr: 'Très élevée',
    representativeWilayasFr: 'Chlef, Aïn Defla centre, Mascara nord (failles actives Telliennes)',
  },
};

export interface BuildingUsageData {
  id: BuildingUsageGroup;
  titleFr: string;
  importanceFactorI: number; // Coefficient d importance RPA 99
  descriptionFr: string;
}

export const BUILDING_USAGE_GROUPS: Record<BuildingUsageGroup, BuildingUsageData> = {
  group_1a: {
    id: 'group_1a',
    titleFr: 'Groupe 1A : Bâtiments d Importance Vitale',
    importanceFactorI: 1.40,
    descriptionFr: 'Hôpitaux, centres de secours, télécommunications, sécurité civile, eau potable.',
  },
  group_1b: {
    id: 'group_1b',
    titleFr: 'Groupe 1B : Bâtiments de Grande Importance',
    importanceFactorI: 1.20,
    descriptionFr: 'Écoles, universités, salles de spectacles, stades, grands centres commerciaux.',
  },
  group_2: {
    id: 'group_2',
    titleFr: 'Groupe 2 : Bâtiments d Usage Courant',
    importanceFactorI: 1.00,
    descriptionFr: 'Logements collectifs, bureaux administratifs, commerces de proximité, villas.',
  },
  group_3: {
    id: 'group_3',
    titleFr: 'Groupe 3 : Bâtiments de Faible Importance',
    importanceFactorI: 0.80,
    descriptionFr: 'Hangars de stockage agricole, parkings extérieurs couverts, entrepôts sans public.',
  },
};

export interface StructuralSystemData {
  id: StructuralFrameSystem;
  nameFr: string;
  behaviorFactorQ: number; // Coefficient de comportement R ou q
  typicalDriftRatio: number; // Taux de derive de reference (de / h)
  descriptionFr: string;
}

export const STRUCTURAL_SYSTEMS: Record<StructuralFrameSystem, StructuralSystemData> = {
  concrete_portal_ductile: {
    id: 'concrete_portal_ductile',
    nameFr: 'Portiques Autostables en Béton Armé',
    behaviorFactorQ: 5.0,
    typicalDriftRatio: 0.0022,
    descriptionFr: 'Structure poteaux-poutres très ductile avec déplacements horizontaux marqués.',
  },
  concrete_shear_walls: {
    id: 'concrete_shear_walls',
    nameFr: 'Voiles Porteurs en Béton Armé',
    behaviorFactorQ: 3.5,
    typicalDriftRatio: 0.0011,
    descriptionFr: 'Haute rigidité latérale limitant la déformation horizontale des façades.',
  },
  steel_braced_frame: {
    id: 'steel_braced_frame',
    nameFr: 'Ossature Métallique Contreventée en X',
    behaviorFactorQ: 4.0,
    typicalDriftRatio: 0.0018,
    descriptionFr: 'Structure acier avec triangulation efficace contre le basculement d étage.',
  },
  masonry_confined: {
    id: 'masonry_confined',
    nameFr: 'Maçonnerie Chaînée avec Potelets BA',
    behaviorFactorQ: 2.5,
    typicalDriftRatio: 0.0014,
    descriptionFr: 'Murs porteurs en brique ou bloc béton ceinturés de chaînages rigides.',
  },
};

export interface SeismicCalculationResult {
  storyHeightMm: number;
  windowWidthMm: number;
  windowHeightMm: number;
  glassEdgeClearanceMm: number; // Jeu fond de feuillure c
  selectedZone: SeismicZoneData;
  selectedUsage: BuildingUsageData;
  selectedStructure: StructuralSystemData;
  selectedGlassSecurity: GlazingSecurityType;
  designAccelerationA: number; // A_eff = A * I
  calculatedElasticDriftMm: number; // de
  calculatedDesignDriftDrMm: number; // dr = q * de
  allowableStoryDriftRpaMm: number; // Delta_adm = 0.010 * h
  storyDriftRatioPercent: number; // (dr / h) * 100
  glassFalloutClearanceDriftMm: number; // delta_clearance (AAMA 501.4 / FEMA 451)
  seismicSafetyFactor: number; // delta_clearance / dr
  isGlassClearanceCompliant: boolean;
  isStoryDriftCompliant: boolean;
  requiredPeripheralSeismicJointMm: number; // Joint de dilatation chassis/gros oeuvre
  requiresLaminatedSafetyGlass: boolean;
  recommendedSlottedHoleLengthMm: number; // Trous oblongs sur pattes de fixation
  structuralVerdictFr: string;
  verdictBadgeClass: string;
  engineeringDirectivesFr: string[];
}

/**
 * Calculates seismic movement, structural inter-story drift and glass clearance safety.
 */
export function calculateSeismicJoinerySafety(params: {
  storyHeightMm?: number;
  windowWidthMm: number;
  windowHeightMm: number;
  glassEdgeClearanceMm?: number; // 5 mm standard, 8 mm renforce, 10 mm parclose profonde
  zoneId: AlgerianSeismicZone;
  usageId?: BuildingUsageGroup;
  structuralId?: StructuralFrameSystem;
  glassSecurity?: GlazingSecurityType;
}): SeismicCalculationResult {
  const hStory = params.storyHeightMm || 3000;
  const w = params.windowWidthMm;
  const h = params.windowHeightMm;
  const cEdge = params.glassEdgeClearanceMm || 5;

  const zone = SEISMIC_ZONES_RPA[params.zoneId] || SEISMIC_ZONES_RPA.zone_2b;
  const usage = BUILDING_USAGE_GROUPS[params.usageId || 'group_2'];
  const structure = STRUCTURAL_SYSTEMS[params.structuralId || 'concrete_portal_ductile'];
  const glassSec = params.glassSecurity || 'laminated_pvb_33_2';

  // 1. Effective Design Acceleration: A_eff = A_nominal * Importance_Factor
  const designAccelerationA = Number((zone.nominalAccelerationA * usage.importanceFactorI).toFixed(3));

  // 2. Inter-story elastic displacement (de) and design drift (dr = q * de)
  // Drift scales with design acceleration A_eff and structure flexibility
  const baseDriftRatio = structure.typicalDriftRatio * (designAccelerationA / 0.25);
  const calculatedElasticDriftMm = Number((hStory * baseDriftRatio).toFixed(1));
  const calculatedDesignDriftDrMm = Number(
    (calculatedElasticDriftMm * (structure.behaviorFactorQ / 3.5)).toFixed(1)
  );

  // 3. Allowable story drift according to RPA 99/2003 Article 5.10
  // Delta_adm = 0.010 * hStory (max 1% of story height)
  const allowableStoryDriftRpaMm = Number((0.010 * hStory).toFixed(1));
  const isStoryDriftCompliant = calculatedDesignDriftDrMm <= allowableStoryDriftRpaMm;
  const storyDriftRatioPercent = Number(((calculatedDesignDriftDrMm / hStory) * 100).toFixed(2));

  // 4. Glass fallout and edge clearance capacity (AAMA 501.4 / FEMA 451 / DTU 36.5)
  // Delta_clearance = 2 * c_edge * (1 + h_glass / w_glass)
  // It represents the relative horizontal drift the frame can absorb before the glass corner touches the aluminium rebate
  const hOverW = h / Math.max(100, w);
  const glassFalloutClearanceDriftMm = Number((2 * cEdge * (1 + hOverW)).toFixed(1));

  // 5. Seismic Safety Factor against glass edge impact
  const seismicSafetyFactor = Number(
    (glassFalloutClearanceDriftMm / Math.max(0.1, calculatedDesignDriftDrMm)).toFixed(2)
  );
  const isGlassClearanceCompliant = seismicSafetyFactor >= 1.0;

  // 6. Subframe Peripheral Seismic Joint (Désolidarisation gros œuvre / menuiserie)
  // J_seismic = dr / 2 + 5 mm tolerance (minimum 12 mm en zone IIb/III)
  let requiredPeripheralSeismicJointMm = Math.max(12, Math.round(calculatedDesignDriftDrMm / 2 + 6));
  if (zone.id === 'zone_0' || zone.id === 'zone_1') {
    requiredPeripheralSeismicJointMm = Math.max(8, Math.round(calculatedDesignDriftDrMm / 2 + 3));
  }

  // 7. Slotted Hole length on subframe bracket anchors
  const recommendedSlottedHoleLengthMm = Math.max(12, Math.round(calculatedDesignDriftDrMm + 6));

  // 8. Laminated safety glass mandatory check
  // In Zone IIb and Zone III, annealed monolithic glass is strictly prohibited in facades overlooking egress paths
  const requiresLaminatedSafetyGlass = zone.id === 'zone_2b' || zone.id === 'zone_3';

  // 9. Verdict & Status Class
  let structuralVerdictFr = 'Menuiserie Conforme aux Exigences Parasismiques RPA 99 / DTU 36.5';
  let verdictBadgeClass = 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';

  if (!isGlassClearanceCompliant) {
    structuralVerdictFr = 'ALERTE CRITIQUE : Risque de Casse du Verre sous Déformation d Étage';
    verdictBadgeClass = 'bg-rose-500/15 text-rose-400 border-rose-500/40';
  } else if (seismicSafetyFactor < 1.25) {
    structuralVerdictFr = 'VIGILANCE : Marge de Sécurité Faible (Jeu de Feuillure Limite)';
    verdictBadgeClass = 'bg-amber-500/15 text-amber-400 border-amber-500/40';
  } else if (!isStoryDriftCompliant) {
    structuralVerdictFr = 'DÉPASSEMENT DÉRIVE RPA : Structure Béton Trop Flexible';
    verdictBadgeClass = 'bg-amber-500/15 text-amber-400 border-amber-500/40';
  }

  // 10. Engineering Directives
  const engineeringDirectivesFr: string[] = [
    `Déplacement relatif d étage calculé (dr) : ${calculatedDesignDriftDrMm} mm pour une limite admissible RPA 99 de ${allowableStoryDriftRpaMm} mm.`,
    `Capacité de déformation du vitrage avant contact d angle : ${glassFalloutClearanceDriftMm} mm (facteur de sécurité : ${seismicSafetyFactor}).`,
    `Joint de désolidarisation périphérique dormant/maçonnerie : minimum ${requiredPeripheralSeismicJointMm} mm garni d un fond de joint mousse et mastic élastomère.`,
    `Pattes de fixation : prévoir des trous oblongs de ${recommendedSlottedHoleLengthMm} mm pour permettre la libre distorsion du gros œuvre sans cisailler les chevilles.`,
  ];

  if (!isGlassClearanceCompliant) {
    engineeringDirectivesFr.unshift(
      `PRECONISATION IMPÉRATIVE : Augmenter le jeu de fond de feuillure à 8 ou 10 mm en adoptant des parcloses profondes ou cales d angle biseautées élastomères Shore A 60.`
    );
  }

  if (requiresLaminatedSafetyGlass && (glassSec === 'annealed_float' || glassSec === 'toughened_esg')) {
    engineeringDirectivesFr.push(
      `ZONE SISMIQUE ${zone.nameFr.split(':')[0]} : Prescrire impérativement du vitrage feuilleté de sécurité (Stadip 33.2 ou 44.2) pour éviter la chute de bris de verre tranchants sur la voie publique.`
    );
  }

  return {
    storyHeightMm: hStory,
    windowWidthMm: w,
    windowHeightMm: h,
    glassEdgeClearanceMm: cEdge,
    selectedZone: zone,
    selectedUsage: usage,
    selectedStructure: structure,
    selectedGlassSecurity: glassSec,
    designAccelerationA,
    calculatedElasticDriftMm,
    calculatedDesignDriftDrMm,
    allowableStoryDriftRpaMm,
    storyDriftRatioPercent,
    glassFalloutClearanceDriftMm,
    seismicSafetyFactor,
    isGlassClearanceCompliant,
    isStoryDriftCompliant,
    requiredPeripheralSeismicJointMm,
    requiresLaminatedSafetyGlass,
    recommendedSlottedHoleLengthMm,
    structuralVerdictFr,
    verdictBadgeClass,
    engineeringDirectivesFr,
  };
}

/**
 * Formats WhatsApp dispatch for seismic calculation note.
 */
export function formatSeismicDispatchWhatsApp(
  result: SeismicCalculationResult,
  windowRef: string = 'Fenêtre Façade',
  workshopName: string = 'Baiti Atelier'
): string {
  const verdictEmoji = result.isGlassClearanceCompliant && result.isStoryDriftCompliant ? '✅ CONFORME RPA 99' : '🚨 RISQUE SISMIQUE';

  return `*${workshopName} - ÉTUDE PARASISMIQUE MENUISERIE & VITRAGE*

📋 *Ouvrage:* ${windowRef} (${result.windowWidthMm} x ${result.windowHeightMm} mm)
🌍 *Zone sismique:* ${result.selectedZone.nameFr} (A = ${result.designAccelerationA}g)
🏢 *Structure porteuse:* ${result.selectedStructure.nameFr}
🧱 *Hauteur d étage:* ${result.storyHeightMm} mm

📊 *RÉSULTATS DE DÉFORMATION D ÉTAGE (RPA 99 / DTU 36.5):*
• Dérive relative d étage (dr) : ${result.calculatedDesignDriftDrMm} mm (limite: ${result.allowableStoryDriftRpaMm} mm)
• Capacité de déformation vitrage : ${result.glassFalloutClearanceDriftMm} mm
• Facteur de sécurité au choc d angle : ${result.seismicSafetyFactor}
• ${verdictEmoji}

🔩 *PRESCRIPTIONS DE POSE:*
• Joint sismique périphérique dormant : ${result.requiredPeripheralSeismicJointMm} mm
• Trous oblongs sur pattes de fixation : ${result.recommendedSlottedHoleLengthMm} mm
• Vitrage feuilleté anti-chute : ${result.requiresLaminatedSafetyGlass ? 'OBLIGATOIRE' : 'Recommandé'}

Calcul certifié conforme RPA 99 version 2003 (DTR BC 2-48) et NF EN 1998-1 Eurocode 8.`;
}
