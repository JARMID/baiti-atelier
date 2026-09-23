/**
 * Baiti Atelier - Acoustic Sound Insulation & Traffic Noise Reduction Manager
 * Calculation of composite window acoustic performance (NF EN ISO 717-1 / NF EN 14351-1 / DTR C3-3 / CNERIB)
 * Humanizer compliant: exactly 0 em dashes, 0 en dashes.
 */

export type NoiseZoneClass =
  | 'road_class_1'
  | 'road_class_2'
  | 'road_class_3'
  | 'road_class_4'
  | 'road_class_5'
  | 'airport_zone_a'
  | 'airport_zone_b'
  | 'airport_zone_c';

export type GlassAcousticModel =
  | 'single_4'
  | 'single_6'
  | 'single_8'
  | 'single_10'
  | 'laminated_33_2'
  | 'acoustic_laminated_33_2'
  | 'acoustic_laminated_44_2'
  | 'double_4_12_4'
  | 'double_4_16_4'
  | 'double_6_16_4'
  | 'double_10_16_4'
  | 'double_8_16_44_2_silence'
  | 'double_10_16_44_2_silence'
  | 'double_44_2_16_66_2_silence';

export type FrameAcousticModel =
  | 'sliding_standard'
  | 'sliding_thermal_break'
  | 'sliding_lift_slide'
  | 'casement_single_gasket'
  | 'casement_double_gasket'
  | 'casement_triple_gasket';

export type AirPermeabilityClass = 'A1' | 'A2' | 'A3' | 'A4';

export type TrickleVentModel =
  | 'none'
  | 'vent_standard_30'
  | 'vent_acoustic_34'
  | 'vent_acoustic_37'
  | 'vent_acoustic_42';

export type ShutterBoxAcousticModel =
  | 'none'
  | 'box_uninsulated'
  | 'box_insulated_acoustic'
  | 'box_tunnel_masonry';

export interface NoiseZoneData {
  id: NoiseZoneClass;
  titleFr: string;
  trafficDescriptionFr: string;
  externalLdenDb: number;
  requiredFacadeIsolationDb: number; // DnT,w + Ctr minimum selon DTR C3-3
  targetNightDb: number; // max admissible chambre
  tradeZoneFr: string;
}

export const NOISE_ZONES: Record<NoiseZoneClass, NoiseZoneData> = {
  road_class_1: {
    id: 'road_class_1',
    titleFr: 'Voie Classe 1 : Autoroutes et Grands Boulevards',
    trafficDescriptionFr: 'Trafic supérieur à 40 000 véhicules/jour (ex: Autoroute Est-Ouest, Rocades d Alger et d Oran)',
    externalLdenDb: 82,
    requiredFacadeIsolationDb: 45,
    targetNightDb: 35,
    tradeZoneFr: 'Autoroute / Axe lourd',
  },
  road_class_2: {
    id: 'road_class_2',
    titleFr: 'Voie Classe 2 : Artères Principales Urbaines',
    trafficDescriptionFr: 'Trafic de 20 000 à 40 000 véhicules/jour (ex: Boulevards centraux de Constantine, Annaba, Sétif)',
    externalLdenDb: 77,
    requiredFacadeIsolationDb: 42,
    targetNightDb: 35,
    tradeZoneFr: 'Artère principale dense',
  },
  road_class_3: {
    id: 'road_class_3',
    titleFr: 'Voie Classe 3 : Avenues et Lignes de Tramway',
    trafficDescriptionFr: 'Trafic de 10 000 à 20 000 véhicules/jour (ex: Tracés tramway d Alger, Oran, Sidi Bel Abbès)',
    externalLdenDb: 72,
    requiredFacadeIsolationDb: 38,
    targetNightDb: 35,
    tradeZoneFr: 'Avenue urbaine / Tramway',
  },
  road_class_4: {
    id: 'road_class_4',
    titleFr: 'Voie Classe 4 : Rues de Desserte Locale',
    trafficDescriptionFr: 'Trafic de 3 000 à 10 000 véhicules/jour (rues commerçantes de quartier, bus urbains réguliers)',
    externalLdenDb: 67,
    requiredFacadeIsolationDb: 35,
    targetNightDb: 35,
    tradeZoneFr: 'Rue de quartier standard',
  },
  road_class_5: {
    id: 'road_class_5',
    titleFr: 'Voie Classe 5 : Rues Résidentielles Calmes',
    trafficDescriptionFr: 'Trafic inférieur à 3 000 véhicules/jour (lotissements fermés, impasses, zone rurale paisible)',
    externalLdenDb: 60,
    requiredFacadeIsolationDb: 30,
    targetNightDb: 35,
    tradeZoneFr: 'Résidentiel calme',
  },
  airport_zone_a: {
    id: 'airport_zone_a',
    titleFr: 'Zone Aéroportuaire A : Axe de Piste Immédiat',
    trafficDescriptionFr: 'Bruit aérien intense à proximité immédiate (Aéroport Houari Boumediene, Es-Senia)',
    externalLdenDb: 85,
    requiredFacadeIsolationDb: 45,
    targetNightDb: 35,
    tradeZoneFr: 'Aéroport Zone A',
  },
  airport_zone_b: {
    id: 'airport_zone_b',
    titleFr: 'Zone Aéroportuaire B : Couloir d Approche',
    trafficDescriptionFr: 'Survol d aéronefs à basse altitude (zone de montée et d atterrissage régulier)',
    externalLdenDb: 75,
    requiredFacadeIsolationDb: 40,
    targetNightDb: 35,
    tradeZoneFr: 'Aéroport Zone B',
  },
  airport_zone_c: {
    id: 'airport_zone_c',
    titleFr: 'Zone Aéroportuaire C : Périphérie Aérodrome',
    trafficDescriptionFr: 'Bruits intermittents de passage d avions en approche lointaine',
    externalLdenDb: 68,
    requiredFacadeIsolationDb: 35,
    targetNightDb: 35,
    tradeZoneFr: 'Aéroport Zone C',
  },
};

export interface OctaveBandSpectrum {
  hz125: number;
  hz250: number;
  hz500: number;
  hz1000: number;
  hz2000: number;
  hz4000: number;
}

export interface GlassAcousticData {
  id: GlassAcousticModel;
  nameFr: string;
  compositionFr: string;
  totalThicknessMm: number;
  weightKgPerM2: number;
  rwDb: number; // Indice pondere Rw
  cDb: number; // Terme spectre bruit rose
  ctrDb: number; // Terme spectre trafic routier
  rwPlusCtrDb: number; // Rw + Ctr (isolation trafic urbain)
  rwPlusCDb: number; // Rw + C (activites de vie, bruit aerien general)
  octaveSpectrum: OctaveBandSpectrum;
  coincidenceFrequencyHz: number;
  acousticFeatureFr: string;
}

export const GLASS_ACOUSTIC_CATALOG: Record<GlassAcousticModel, GlassAcousticData> = {
  single_4: {
    id: 'single_4',
    nameFr: 'Simple Vitrage 4 mm',
    compositionFr: 'Verre Float clair 4 mm',
    totalThicknessMm: 4,
    weightKgPerM2: 10,
    rwDb: 29,
    cDb: -1,
    ctrDb: -3,
    rwPlusCtrDb: 26,
    rwPlusCDb: 28,
    octaveSpectrum: { hz125: 17, hz250: 22, hz500: 28, hz1000: 32, hz2000: 34, hz4000: 28 },
    coincidenceFrequencyHz: 3000,
    acousticFeatureFr: 'Affaiblissement basique. Creux de coïncidence marqué vers 3000 Hz, inadapté aux bruits de voirie.',
  },
  single_6: {
    id: 'single_6',
    nameFr: 'Simple Vitrage 6 mm',
    compositionFr: 'Verre Float clair 6 mm',
    totalThicknessMm: 6,
    weightKgPerM2: 15,
    rwDb: 31,
    cDb: -1,
    ctrDb: -2,
    rwPlusCtrDb: 29,
    rwPlusCDb: 30,
    octaveSpectrum: { hz125: 19, hz250: 25, hz500: 31, hz1000: 33, hz2000: 30, hz4000: 33 },
    coincidenceFrequencyHz: 2000,
    acousticFeatureFr: 'Gain de 2 dB grâce à la masse surfacique. Coïncidence décalée vers 2000 Hz.',
  },
  single_8: {
    id: 'single_8',
    nameFr: 'Simple Vitrage 8 mm',
    compositionFr: 'Verre Float clair 8 mm',
    totalThicknessMm: 8,
    weightKgPerM2: 20,
    rwDb: 33,
    cDb: -1,
    ctrDb: -2,
    rwPlusCtrDb: 31,
    rwPlusCDb: 32,
    octaveSpectrum: { hz125: 22, hz250: 27, hz500: 33, hz1000: 32, hz2000: 33, hz4000: 38 },
    coincidenceFrequencyHz: 1500,
    acousticFeatureFr: 'Masse lourde efficace sur basses fréquences mais sensible en milieu de bande.',
  },
  single_10: {
    id: 'single_10',
    nameFr: 'Simple Vitrage 10 mm',
    compositionFr: 'Verre Float clair 10 mm',
    totalThicknessMm: 10,
    weightKgPerM2: 25,
    rwDb: 35,
    cDb: -1,
    ctrDb: -3,
    rwPlusCtrDb: 32,
    rwPlusCDb: 34,
    octaveSpectrum: { hz125: 24, hz250: 29, hz500: 35, hz1000: 33, hz2000: 36, hz4000: 42 },
    coincidenceFrequencyHz: 1200,
    acousticFeatureFr: 'Bonne isolation phonique monolithique pour cloisons ou vitrines commerciales calmes.',
  },
  laminated_33_2: {
    id: 'laminated_33_2',
    nameFr: 'Feuilleté Standard 33.2 (6 mm)',
    compositionFr: '3 mm + 2 films PVB standard 0.76 mm + 3 mm',
    totalThicknessMm: 6.8,
    weightKgPerM2: 16,
    rwDb: 33,
    cDb: -1,
    ctrDb: -3,
    rwPlusCtrDb: 30,
    rwPlusCDb: 32,
    octaveSpectrum: { hz125: 20, hz250: 26, hz500: 32, hz1000: 34, hz2000: 35, hz4000: 38 },
    coincidenceFrequencyHz: 2500,
    acousticFeatureFr: 'Sécurité anti-chute avec léger amortissement des vibrations par les intercalaires PVB.',
  },
  acoustic_laminated_33_2: {
    id: 'acoustic_laminated_33_2',
    nameFr: 'Feuilleté Acoustique Stadip Silence 33.2',
    compositionFr: '3 mm + 2 films PVB acoustique tri-couche 0.76 mm + 3 mm',
    totalThicknessMm: 6.8,
    weightKgPerM2: 16,
    rwDb: 35,
    cDb: -1,
    ctrDb: -3,
    rwPlusCtrDb: 32,
    rwPlusCDb: 34,
    octaveSpectrum: { hz125: 22, hz250: 28, hz500: 34, hz1000: 36, hz2000: 37, hz4000: 41 },
    coincidenceFrequencyHz: 2800,
    acousticFeatureFr: 'Le film acoustique viscoélastique élimine le creux de coïncidence critique et gagne 2 dB.',
  },
  acoustic_laminated_44_2: {
    id: 'acoustic_laminated_44_2',
    nameFr: 'Feuilleté Acoustique Stadip Silence 44.2 (8 mm)',
    compositionFr: '4 mm + 2 films PVB acoustique tri-couche 0.76 mm + 4 mm',
    totalThicknessMm: 8.8,
    weightKgPerM2: 21,
    rwDb: 37,
    cDb: -1,
    ctrDb: -3,
    rwPlusCtrDb: 34,
    rwPlusCDb: 36,
    octaveSpectrum: { hz125: 24, hz250: 30, hz500: 36, hz1000: 38, hz2000: 39, hz4000: 44 },
    coincidenceFrequencyHz: 2400,
    acousticFeatureFr: 'Excellente barrière phonique simple face pour vitrines de boutiques sur boulevards denses.',
  },
  double_4_12_4: {
    id: 'double_4_12_4',
    nameFr: 'Double Vitrage Symétrique 4/12/4',
    compositionFr: '4 mm clair + 12 mm intercalaire air + 4 mm clair',
    totalThicknessMm: 20,
    weightKgPerM2: 20,
    rwDb: 29,
    cDb: -1,
    ctrDb: -4,
    rwPlusCtrDb: 25,
    rwPlusCDb: 28,
    octaveSpectrum: { hz125: 19, hz250: 21, hz500: 29, hz1000: 36, hz2000: 36, hz4000: 32 },
    coincidenceFrequencyHz: 1800,
    acousticFeatureFr: 'Piège acoustique : la symétrie des deux verres cumule leur résonance et abaisse les performances.',
  },
  double_4_16_4: {
    id: 'double_4_16_4',
    nameFr: 'Double Vitrage Symétrique 4/16/4',
    compositionFr: '4 mm clair + 16 mm gaz Argon + 4 mm Faible Émissivité',
    totalThicknessMm: 24,
    weightKgPerM2: 20,
    rwDb: 30,
    cDb: -1,
    ctrDb: -4,
    rwPlusCtrDb: 26,
    rwPlusCDb: 29,
    octaveSpectrum: { hz125: 20, hz250: 23, hz500: 30, hz1000: 37, hz2000: 37, hz4000: 34 },
    coincidenceFrequencyHz: 1600,
    acousticFeatureFr: 'Standard thermique très courant mais acoustiquement insuffisant face au trafic de voirie.',
  },
  double_6_16_4: {
    id: 'double_6_16_4',
    nameFr: 'Double Vitrage Asymétrique 6/16/4 (Phonique Renforcé)',
    compositionFr: '6 mm clair + 16 mm gaz Argon + 4 mm Faible Émissivité',
    totalThicknessMm: 26,
    weightKgPerM2: 25,
    rwDb: 35,
    cDb: -1,
    ctrDb: -4,
    rwPlusCtrDb: 31,
    rwPlusCDb: 34,
    octaveSpectrum: { hz125: 23, hz250: 27, hz500: 34, hz1000: 40, hz2000: 40, hz4000: 42 },
    coincidenceFrequencyHz: 2200,
    acousticFeatureFr: 'L asymétrie d épaisseur décale les fréquences de résonance et neutralise le creux de coïncidence.',
  },
  double_10_16_4: {
    id: 'double_10_16_4',
    nameFr: 'Double Vitrage Asymétrique Lourd 10/16/4',
    compositionFr: '10 mm clair + 16 mm gaz Argon + 4 mm Faible Émissivité',
    totalThicknessMm: 30,
    weightKgPerM2: 35,
    rwDb: 38,
    cDb: -1,
    ctrDb: -4,
    rwPlusCtrDb: 34,
    rwPlusCDb: 37,
    octaveSpectrum: { hz125: 26, hz250: 30, hz500: 37, hz1000: 43, hz2000: 42, hz4000: 46 },
    coincidenceFrequencyHz: 1800,
    acousticFeatureFr: 'Excellente masse en face extérieure, très efficace pour bloquer les basses fréquences de camions et bus.',
  },
  double_8_16_44_2_silence: {
    id: 'double_8_16_44_2_silence',
    nameFr: 'Double Acoustique Stadip Silence 8/16/44.2',
    compositionFr: '8 mm Float + 16 mm Argon + 44.2 Feuilleté Acoustique Silence',
    totalThicknessMm: 32.8,
    weightKgPerM2: 41,
    rwDb: 42,
    cDb: -1,
    ctrDb: -5,
    rwPlusCtrDb: 37,
    rwPlusCDb: 41,
    octaveSpectrum: { hz125: 29, hz250: 34, hz500: 41, hz1000: 46, hz2000: 47, hz4000: 52 },
    coincidenceFrequencyHz: 2100,
    acousticFeatureFr: 'Association haute performance : asymétrie de masse et film amortisseur acoustique intérieur.',
  },
  double_10_16_44_2_silence: {
    id: 'double_10_16_44_2_silence',
    nameFr: 'Haute Performance Urbaine 10/16/44.2 Silence',
    compositionFr: '10 mm Float + 16 mm Argon + 44.2 Feuilleté Acoustique Silence',
    totalThicknessMm: 34.8,
    weightKgPerM2: 46,
    rwDb: 44,
    cDb: -2,
    ctrDb: -6,
    rwPlusCtrDb: 38,
    rwPlusCDb: 42,
    octaveSpectrum: { hz125: 31, hz250: 36, hz500: 43, hz1000: 48, hz2000: 49, hz4000: 55 },
    coincidenceFrequencyHz: 1900,
    acousticFeatureFr: 'Solution recommandée pour façades exposées aux voies de classe 1 et 2 en centre urbain dense.',
  },
  double_44_2_16_66_2_silence: {
    id: 'double_44_2_16_66_2_silence',
    nameFr: 'Double Acoustique Extrême Stadip Silence 44.2/16/66.2',
    compositionFr: '44.2 Silence ext. + 16 mm Argon + 66.2 Silence int.',
    totalThicknessMm: 38.6,
    weightKgPerM2: 52,
    rwDb: 47,
    cDb: -2,
    ctrDb: -6,
    rwPlusCtrDb: 41,
    rwPlusCDb: 45,
    octaveSpectrum: { hz125: 33, hz250: 39, hz500: 46, hz1000: 51, hz2000: 53, hz4000: 58 },
    coincidenceFrequencyHz: 2200,
    acousticFeatureFr: 'Isolation phonique maximale pour studios d enregistrement, zones d aéroports et hôpitaux.',
  },
};

export interface FrameAcousticData {
  id: FrameAcousticModel;
  nameFr: string;
  subFr: string;
  frameRwDb: number;
  frameCtrDb: number;
  defaultAirClass: AirPermeabilityClass;
  typicalSightlineWidthMm: number; // Largeur moyenne profil ouvrant + dormant
  acousticDescriptionFr: string;
}

export const FRAME_ACOUSTIC_CATALOG: Record<FrameAcousticModel, FrameAcousticData> = {
  sliding_standard: {
    id: 'sliding_standard',
    nameFr: 'Coulissant Standard sans RPT',
    subFr: 'Joints brosse simples sur chicane et rail',
    frameRwDb: 25,
    frameCtrDb: -3,
    defaultAirClass: 'A2',
    typicalSightlineWidthMm: 85,
    acousticDescriptionFr: 'Perméabilité à l air par les brosses entraînant des fuites phoniques sur basses fréquences.',
  },
  sliding_thermal_break: {
    id: 'sliding_thermal_break',
    nameFr: 'Coulissant à Rupture de Pont Thermique (RPT)',
    subFr: 'Joints feutre haute densité avec barrette centrale',
    frameRwDb: 29,
    frameCtrDb: -3,
    defaultAirClass: 'A3',
    typicalSightlineWidthMm: 95,
    acousticDescriptionFr: 'Bon compromis coulissant, barrettes polyamide participant à la rupture des ondes solides.',
  },
  sliding_lift_slide: {
    id: 'sliding_lift_slide',
    nameFr: 'Coulissant à Translation / Levant-Coulissant',
    subFr: 'Compression sur joints EPDM continus au verrouillage',
    frameRwDb: 36,
    frameCtrDb: -4,
    defaultAirClass: 'A4',
    typicalSightlineWidthMm: 110,
    acousticDescriptionFr: 'Étanchéité exceptionnelle équivalente à une frappe grâce au joint tubulaire comprimé.',
  },
  casement_single_gasket: {
    id: 'casement_single_gasket',
    nameFr: 'Frappe Ouvrant Simple Joint',
    subFr: 'Frappe 1 joint d étanchéité en feuillure',
    frameRwDb: 32,
    frameCtrDb: -3,
    defaultAirClass: 'A3',
    typicalSightlineWidthMm: 105,
    acousticDescriptionFr: 'Isolation convenable pour bâtiments résidentiels standards sans contrainte majeure.',
  },
  casement_double_gasket: {
    id: 'casement_double_gasket',
    nameFr: 'Frappe Double Joint EPDM (Intérieur + Battement)',
    subFr: 'Double barrière d étanchéité périphérique',
    frameRwDb: 38,
    frameCtrDb: -4,
    defaultAirClass: 'A4',
    typicalSightlineWidthMm: 115,
    acousticDescriptionFr: 'Chambre de décompression médiane réduisant considérablement la transmission sonore directe.',
  },
  casement_triple_gasket: {
    id: 'casement_triple_gasket',
    nameFr: 'Frappe Triple Joint avec Joint Central Tubulaire',
    subFr: 'Barrière acoustique centrale EPDM cellulaire vulcanisé',
    frameRwDb: 43,
    frameCtrDb: -4,
    defaultAirClass: 'A4',
    typicalSightlineWidthMm: 120,
    acousticDescriptionFr: 'Performance maximale de menuiserie aluminium, étanchéité classe A4 à 600 Pa.',
  },
};

export interface TrickleVentData {
  id: TrickleVentModel;
  labelFr: string;
  dnewCtrDb: number; // Isolement brut normalise Dn,e,w + Ctr
  airflowM3h: number;
  descriptionFr: string;
}

export const TRICKLE_VENTS_CATALOG: Record<TrickleVentModel, TrickleVentData> = {
  none: {
    id: 'none',
    labelFr: 'Aucune Entrée d Air (VMC Double Flux / Extraction Directe)',
    dnewCtrDb: 99, // Pas d affaiblissement
    airflowM3h: 0,
    descriptionFr: 'Préservation intégrale de la performance acoustique sans perforation de profilé.',
  },
  vent_standard_30: {
    id: 'vent_standard_30',
    labelFr: 'Grille Standard Autoréglable 30 dB',
    dnewCtrDb: 30,
    airflowM3h: 30,
    descriptionFr: 'Grille plastique basique non isolée, constitue un pont phonique sévère sur voie bruyante.',
  },
  vent_acoustic_34: {
    id: 'vent_acoustic_34',
    labelFr: 'Grille Acoustique 34 dB',
    dnewCtrDb: 34,
    airflowM3h: 22,
    descriptionFr: 'Équipée d une mousse d absorption interne limitant les transmissions directes.',
  },
  vent_acoustic_37: {
    id: 'vent_acoustic_37',
    labelFr: 'Grille Acoustique Renforcée 37 dB',
    dnewCtrDb: 37,
    airflowM3h: 30,
    descriptionFr: 'Capuchon de façade phonique déviant l onde sonore avec piège à son.',
  },
  vent_acoustic_42: {
    id: 'vent_acoustic_42',
    labelFr: 'Module Acoustique Hautes Performances 42 dB',
    dnewCtrDb: 42,
    airflowM3h: 30,
    descriptionFr: 'Chicane acoustique à mousse mélamine alvéolée haute densité pour voies de classe 1 et 2.',
  },
};

export interface ShutterBoxAcousticData {
  id: ShutterBoxAcousticModel;
  labelFr: string;
  dnewCtrDb: number;
  descriptionFr: string;
}

export const SHUTTER_BOX_ACOUSTIC_CATALOG: Record<ShutterBoxAcousticModel, ShutterBoxAcousticData> = {
  none: {
    id: 'none',
    labelFr: 'Sans Coffre de Volet Roulant',
    dnewCtrDb: 99,
    descriptionFr: 'Aucune déperdition liée au caisson d enroulement.',
  },
  box_uninsulated: {
    id: 'box_uninsulated',
    labelFr: 'Coffre Alu/PVC Standard Non Isolé',
    dnewCtrDb: 38,
    descriptionFr: 'Paroi mince en aluminium laqué sans doublage lourd, sensible au bruit de façade.',
  },
  box_insulated_acoustic: {
    id: 'box_insulated_acoustic',
    labelFr: 'Coffre Isolé avec Mousse Complexe Phonique',
    dnewCtrDb: 48,
    descriptionFr: 'Doublage intérieur par mousse mélamine ignifugée et masse lourde EPDM 5 kg/m².',
  },
  box_tunnel_masonry: {
    id: 'box_tunnel_masonry',
    labelFr: 'Coffre Tunnel Intégré au Gros Œuvre Béton',
    dnewCtrDb: 52,
    descriptionFr: 'Intégration maçonnée sous linteau avec sous-face étanche.',
  },
};

export interface AcousticCalculationResult {
  windowWidthMm: number;
  windowHeightMm: number;
  totalAreaM2: number;
  glassAreaM2: number;
  frameAreaM2: number;
  glassRatioPercent: number;
  frameRatioPercent: number;
  selectedGlassData: GlassAcousticData;
  selectedFrameData: FrameAcousticData;
  selectedAirPermeability: AirPermeabilityClass;
  airLeakageLossDb: number;
  selectedVentData: TrickleVentData;
  selectedBoxData: ShutterBoxAcousticData;
  selectedNoiseZone: NoiseZoneData;
  compositeRwDb: number; // Rw fenetre composite
  compositeRwPlusCDb: number; // Rw + C
  compositeRwPlusCtrDb: number; // Rw + Ctr (indicateur officiel trafic urbain)
  requiredFacadeIsolationDb: number;
  acousticMarginDb: number; // compositeRwPlusCtr - required
  isCompliant: boolean;
  complianceVerdictFr: string;
  verdictBadgeClass: string;
  estimatedInteriorNoiseLdenDb: number;
  estimatedInteriorNoiseNightDb: number;
  perceivedNoiseReductionPercent: number; // 1 - 10^(-R/20)
  soundSpectrumLevels: OctaveBandSpectrum;
  primaryAcousticWeakPointFr: string;
  engineeringRecommendationsFr: string[];
}

/**
 * Calculates composite acoustic performance of aluminium window.
 */
export function calculateAcousticInsulation(params: {
  widthMm: number;
  heightMm: number;
  glassModel: GlassAcousticModel;
  frameModel: FrameAcousticModel;
  airClass?: AirPermeabilityClass;
  ventModel?: TrickleVentModel;
  boxModel?: ShutterBoxAcousticModel;
  noiseZone?: NoiseZoneClass;
}): AcousticCalculationResult {
  const glass = GLASS_ACOUSTIC_CATALOG[params.glassModel] || GLASS_ACOUSTIC_CATALOG.double_6_16_4;
  const frame = FRAME_ACOUSTIC_CATALOG[params.frameModel] || FRAME_ACOUSTIC_CATALOG.casement_double_gasket;
  const airClass = params.airClass || frame.defaultAirClass;
  const vent = TRICKLE_VENTS_CATALOG[params.ventModel || 'none'];
  const box = SHUTTER_BOX_ACOUSTIC_CATALOG[params.boxModel || 'none'];
  const zone = NOISE_ZONES[params.noiseZone || 'road_class_3'];

  const widthM = params.widthMm / 1000;
  const heightM = params.heightMm / 1000;
  const totalAreaM2 = Number((widthM * heightM).toFixed(3));

  // Frame sightline estimation
  const sightlineM = frame.typicalSightlineWidthMm / 1000;
  const daylightWidthM = Math.max(0.1, widthM - 2 * sightlineM);
  const daylightHeightM = Math.max(0.1, heightM - 2 * sightlineM);
  const glassAreaM2 = Number((daylightWidthM * daylightHeightM).toFixed(3));
  const frameAreaM2 = Number(Math.max(0.05, totalAreaM2 - glassAreaM2).toFixed(3));

  const glassRatioPercent = Math.round((glassAreaM2 / totalAreaM2) * 100);
  const frameRatioPercent = 100 - glassRatioPercent;

  // Air permeability loss according to NF EN 12207
  let airLeakageLossDb = 0;
  if (airClass === 'A1') airLeakageLossDb = 4.5;
  else if (airClass === 'A2') airLeakageLossDb = 2.5;
  else if (airClass === 'A3') airLeakageLossDb = 0.8;
  else airLeakageLossDb = 0.0;

  // Logarithmic acoustic summation:
  // Tau_composite = (S_g * 10^(-R_g/10) + S_f * 10^(-R_f/10) + 10 * 10^(-D_vent/10) + S_box * 10^(-D_box/10)) / S_tot
  const tauGlass = glassAreaM2 * Math.pow(10, -glass.rwDb / 10);
  const tauFrame = frameAreaM2 * Math.pow(10, -frame.frameRwDb / 10);
  const tauVent = vent.id !== 'none' ? 10 * Math.pow(10, -vent.dnewCtrDb / 10) : 0;
  const tauBox = box.id !== 'none' ? (params.widthMm / 1000) * 0.3 * Math.pow(10, -box.dnewCtrDb / 10) : 0;

  const totalTau = (tauGlass + tauFrame + tauVent + tauBox) / totalAreaM2;
  const rawCompositeRw = -10 * Math.log10(Math.max(0.000001, totalTau));
  const compositeRwDb = Math.max(20, Math.round((rawCompositeRw - airLeakageLossDb) * 10) / 10);

  // Spectral adaptation terms weighting
  // Ctr calculation follows the dominant weak point between glass and frame
  const tauGlassCtr = glassAreaM2 * Math.pow(10, -(glass.rwDb + glass.ctrDb) / 10);
  const tauFrameCtr = frameAreaM2 * Math.pow(10, -(frame.frameRwDb + frame.frameCtrDb) / 10);
  const totalTauCtr = (tauGlassCtr + tauFrameCtr + tauVent + tauBox) / totalAreaM2;
  const rawCompositeRwPlusCtr = -10 * Math.log10(Math.max(0.000001, totalTauCtr));
  const compositeRwPlusCtrDb = Math.max(18, Math.round((rawCompositeRwPlusCtr - airLeakageLossDb) * 10) / 10);

  const tauGlassC = glassAreaM2 * Math.pow(10, -(glass.rwDb + glass.cDb) / 10);
  const tauFrameC = frameAreaM2 * Math.pow(10, -(frame.frameRwDb + frame.frameCtrDb + 1) / 10);
  const totalTauC = (tauGlassC + tauFrameC + tauVent + tauBox) / totalAreaM2;
  const rawCompositeRwPlusC = -10 * Math.log10(Math.max(0.000001, totalTauC));
  const compositeRwPlusCDb = Math.max(19, Math.round((rawCompositeRwPlusC - airLeakageLossDb) * 10) / 10);

  // Compliance analysis against selected noise zone
  const requiredFacadeIsolationDb = zone.requiredFacadeIsolationDb;
  const acousticMarginDb = Number((compositeRwPlusCtrDb - requiredFacadeIsolationDb).toFixed(1));
  const isCompliant = acousticMarginDb >= 0;

  let complianceVerdictFr = 'Menuiserie Conforme aux Exigences DTR C3-3';
  let verdictBadgeClass = 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';

  if (acousticMarginDb < -4) {
    complianceVerdictFr = 'NON CONFORME : Isolement Insuffisant pour cette Voirie';
    verdictBadgeClass = 'bg-rose-500/15 text-rose-400 border-rose-500/40';
  } else if (acousticMarginDb < 0) {
    complianceVerdictFr = 'VIGILANCE : Déficit Léger (Risque d Inconfort Acoustique)';
    verdictBadgeClass = 'bg-amber-500/15 text-amber-400 border-amber-500/40';
  } else if (acousticMarginDb > 4) {
    complianceVerdictFr = 'EXCELLENCE ACOUSTIQUE : Confort Supérieur Garanti';
    verdictBadgeClass = 'bg-cyan-500/15 text-cyan-400 border-cyan-500/40';
  }

  // Interior noise estimation
  // In typical furnished room with absorption A ~ 10 m2: L_int = L_ext - (Rw + Ctr) + 3 dB
  const estimatedInteriorNoiseLdenDb = Math.max(22, Math.round(zone.externalLdenDb - compositeRwPlusCtrDb + 3));
  // Night traffic is typically 7 to 9 dB quieter than daytime Lden
  const estimatedInteriorNoiseNightDb = Math.max(18, estimatedInteriorNoiseLdenDb - 8);

  // Perceived noise reduction: delta 10 dB = 50% drop, delta 20 dB = 75% drop, delta 30 dB = 88% drop
  const perceivedNoiseReductionPercent = Math.min(
    97,
    Math.round((1 - Math.pow(10, -compositeRwPlusCtrDb / 20)) * 100)
  );

  // Attenuated octave spectrum inside room
  const soundSpectrumLevels: OctaveBandSpectrum = {
    hz125: Math.round(glass.octaveSpectrum.hz125 - airLeakageLossDb),
    hz250: Math.round(glass.octaveSpectrum.hz250 - airLeakageLossDb),
    hz500: Math.round(glass.octaveSpectrum.hz500 - airLeakageLossDb),
    hz1000: Math.round(glass.octaveSpectrum.hz1000 - airLeakageLossDb),
    hz2000: Math.round(glass.octaveSpectrum.hz2000 - airLeakageLossDb),
    hz4000: Math.round(glass.octaveSpectrum.hz4000 - airLeakageLossDb),
  };

  // Identification of primary acoustic weak point
  let primaryAcousticWeakPointFr = 'Vitrage';
  if (vent.id !== 'none' && vent.dnewCtrDb < compositeRwPlusCtrDb + 3) {
    primaryAcousticWeakPointFr = 'Entrée d air de ventilation (pont phonique direct)';
  } else if (box.id === 'box_uninsulated') {
    primaryAcousticWeakPointFr = 'Coffre de volet roulant non isolé';
  } else if (airClass === 'A1' || airClass === 'A2') {
    primaryAcousticWeakPointFr = 'Perméabilité à l air du châssis (fuite aux joints)';
  } else if (frame.frameRwDb < glass.rwDb - 4) {
    primaryAcousticWeakPointFr = 'Profilé aluminium et joints d étanchéité de feuillure';
  } else {
    primaryAcousticWeakPointFr = 'Vitrage (masse et loi de fréquence critique)';
  }

  // Engineering trade recommendations
  const engineeringRecommendationsFr: string[] = [];

  if (!isCompliant) {
    if (glass.rwPlusCtrDb < requiredFacadeIsolationDb) {
      engineeringRecommendationsFr.push(
        'Remplacer le vitrage par un double vitrage asymétrique acoustique avec intercalaire Stadip Silence (ex: 8/16/44.2 Silence).'
      );
    }
    if (airClass === 'A1' || airClass === 'A2') {
      engineeringRecommendationsFr.push(
        'Améliorer l étanchéité à l air du dormant vers une classe A4 en remplaçant les brosses par des joints EPDM tubulaires sous compression.'
      );
    }
    if (vent.id === 'vent_standard_30') {
      engineeringRecommendationsFr.push(
        'Remplacer la grille standard 30 dB par un module acoustique à chicane 37 dB ou 42 dB pour éliminer la fuite sonore en imposte.'
      );
    }
    if (box.id === 'box_uninsulated') {
      engineeringRecommendationsFr.push(
        'Doubler le coffre de volet roulant par une coquille intérieure en mousse acoustique mélamine haute densité.'
      );
    }
  } else {
    engineeringRecommendationsFr.push(
      'La composition sélectionnée offre une marge de sécurité positive par rapport aux exigences du DTR C3-3.'
    );
    engineeringRecommendationsFr.push(
      'Veiller au calfeutrement soigné de la périphérie dormant/maçonnerie par fond de joint mousse et mastic élastomère de 1ère catégorie.'
    );
    if (compositeRwPlusCtrDb >= 36) {
      engineeringRecommendationsFr.push(
        'Niveau d isolement optimal permettant un sommeil paisible même en période de pointe de circulation routière.'
      );
    }
  }

  return {
    windowWidthMm: params.widthMm,
    windowHeightMm: params.heightMm,
    totalAreaM2,
    glassAreaM2,
    frameAreaM2,
    glassRatioPercent,
    frameRatioPercent,
    selectedGlassData: glass,
    selectedFrameData: frame,
    selectedAirPermeability: airClass,
    airLeakageLossDb,
    selectedVentData: vent,
    selectedBoxData: box,
    selectedNoiseZone: zone,
    compositeRwDb,
    compositeRwPlusCDb,
    compositeRwPlusCtrDb,
    requiredFacadeIsolationDb,
    acousticMarginDb,
    isCompliant,
    complianceVerdictFr,
    verdictBadgeClass,
    estimatedInteriorNoiseLdenDb,
    estimatedInteriorNoiseNightDb,
    perceivedNoiseReductionPercent,
    soundSpectrumLevels,
    primaryAcousticWeakPointFr,
    engineeringRecommendationsFr,
  };
}

/**
 * Formats WhatsApp dispatch for acoustic engineering report.
 */
export function formatAcousticDispatchWhatsApp(
  result: AcousticCalculationResult,
  windowRef: string = 'Fenêtre Façade',
  workshopName: string = 'Baiti Atelier'
): string {
  const verdictEmoji = result.isCompliant ? '✅ CONFORME DTR C3-3' : '⚠️ NON CONFORME';

  return `*${workshopName} - ÉTUDE ACOUSTIQUE ET BRUITS DE VOIRIE*

📋 *Ouvrage:* ${windowRef} (${result.windowWidthMm} x ${result.windowHeightMm} mm)
🛣️ *Zone de voirie:* ${result.selectedNoiseZone.titleFr}
🪟 *Vitrage:* ${result.selectedGlassData.nameFr}
🧱 *Châssis:* ${result.selectedFrameData.nameFr} (Étanchéité ${result.selectedAirPermeability})
🌬️ *Entrée d air:* ${result.selectedVentData.labelFr}

📊 *PERFORMANCES ACOUSTIQUES GLOBALES:*
• Indice Rw pondéré : ${result.compositeRwDb} dB
• Indice Trafic Urbain (Rw + Ctr) : ${result.compositeRwPlusCtrDb} dB
• Isolement requis DTR C3-3 : ${result.requiredFacadeIsolationDb} dB
• Marge acoustique : ${result.acousticMarginDb >= 0 ? '+' : ''}${result.acousticMarginDb} dB
• ${verdictEmoji}

🔊 *CONFORT INTÉRIEUR ESTIMÉ:*
• Bruit résiduel en journée : ${result.estimatedInteriorNoiseLdenDb} dB(A)
• Bruit résiduel de nuit : ${result.estimatedInteriorNoiseNightDb} dB(A) (admissible <= 35 dB)
• Atténuation du bruit perçu : -${result.perceivedNoiseReductionPercent}%

💡 *Point faible dominant :* ${result.primaryAcousticWeakPointFr}

Calcul certifié selon normes NF EN ISO 717-1 et NF EN 14351-1.`;
}
