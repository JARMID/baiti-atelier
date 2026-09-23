/**
 * Baiti Atelier - Louver & Sunshade Aerodynamic Free Area & Pressure Drop Manager
 * Normative references:
 * - NF EN 13030: Ventilation des batiments - Bouches d aeration - Essais de performance des ventelles
 * - NF EN 12101-2: Systemes pour le controle des fumees et de la chaleur
 * - NF DTU 68.3: Installations de ventilation mecanique
 * - CNERIB DTR C3-4 / Regles de ventilation naturelle et securite incendie ERP en Algerie
 * - Prescriptions techniques Sonelgaz pour postes de transformation electrique
 *
 * Humanizer invariant: exactly 0 em dashes, 0 en dashes.
 */

export type LouverBladeProfileType =
  | 'standard_45_single'
  | 'drainable_blade_45'
  | 'double_chevron_rainproof'
  | 'acoustic_louver_insulated'
  | 'aerofoil_sunshade_wing';

export interface LouverProfileSpec {
  id: LouverBladeProfileType;
  nameFr: string;
  bladePitchMm: number;
  bladeAngleDeg: number;
  dischargeCoefficientCe: number; // Coefficient aerodynamique d entree
  waterRejectionClass: 'Classe A (99% - 100%)' | 'Classe B (95% - 98.9%)' | 'Classe C (80% - 94.9%)' | 'Classe D (< 80%)';
  typicalFreeAreaPercent: number;
  descriptionFr: string;
}

export const LOUVER_PROFILE_TYPES: Record<LouverBladeProfileType, LouverProfileSpec> = {
  standard_45_single: {
    id: 'standard_45_single',
    nameFr: 'Ventelle Standard 45 degres Simple Nappe',
    bladePitchMm: 50,
    bladeAngleDeg: 45,
    dischargeCoefficientCe: 0.32,
    waterRejectionClass: 'Classe C (80% - 94.9%)',
    typicalFreeAreaPercent: 52,
    descriptionFr: 'Profil aluminium extrude economique pour ventilation generale, sous-sols et gaines techniques abritees.',
  },
  drainable_blade_45: {
    id: 'drainable_blade_45',
    nameFr: 'Ventelle Drainante avec Goutte d Eau Intégrée',
    bladePitchMm: 65,
    bladeAngleDeg: 45,
    dischargeCoefficientCe: 0.28,
    waterRejectionClass: 'Classe B (95% - 98.9%)',
    typicalFreeAreaPercent: 48,
    descriptionFr: 'Lame avec cannelure collectrice d eau et rejet vers les montants drainants verticaux.',
  },
  double_chevron_rainproof: {
    id: 'double_chevron_rainproof',
    nameFr: 'Double Chevron Haute Protection Pluie Battante',
    bladePitchMm: 75,
    bladeAngleDeg: 60,
    dischargeCoefficientCe: 0.22,
    waterRejectionClass: 'Classe A (99% - 100%)',
    typicalFreeAreaPercent: 44,
    descriptionFr: 'Lames en V inversees bloquant 99% des gouttelettes sous vent fort. Recommande pour postes Sonelgaz et salles serveurs.',
  },
  acoustic_louver_insulated: {
    id: 'acoustic_louver_insulated',
    nameFr: 'Ventelle Acoustique avec Laine Minérale (150 mm)',
    bladePitchMm: 150,
    bladeAngleDeg: 35,
    dischargeCoefficientCe: 0.19,
    waterRejectionClass: 'Classe B (95% - 98.9%)',
    typicalFreeAreaPercent: 38,
    descriptionFr: 'Lames acoustiques renfermant un matelas absorbant en laine minerale surfacetee. Attenuation phonique Rw 14 dB.',
  },
  aerofoil_sunshade_wing: {
    id: 'aerofoil_sunshade_wing',
    nameFr: 'Brise-Soleil Profil Aile d Avion (100 - 150 mm)',
    bladePitchMm: 120,
    bladeAngleDeg: 30,
    dischargeCoefficientCe: 0.42,
    waterRejectionClass: 'Classe D (< 80%)',
    typicalFreeAreaPercent: 68,
    descriptionFr: 'Lames profil goutte d eau a pas elargi optimisant le passage d air et l ombrage solaire architectural.',
  },
};

export type LouverScreenType = 'none' | 'bird_mesh_wire' | 'insect_stainless_mesh';

export interface ScreenSpec {
  id: LouverScreenType;
  nameFr: string;
  meshPitchMm: string;
  pressureDropMultiplier: number;
  freeAreaFactor: number;
  descriptionFr: string;
}

export const LOUVER_SCREENS: Record<LouverScreenType, ScreenSpec> = {
  none: {
    id: 'none',
    nameFr: 'Sans Grillage / Débit Direct',
    meshPitchMm: 'Aucun',
    pressureDropMultiplier: 1.0,
    freeAreaFactor: 1.0,
    descriptionFr: 'Passage direct de l air sans filtre ni grillage.',
  },
  bird_mesh_wire: {
    id: 'bird_mesh_wire',
    nameFr: 'Grillage Anti-Volatiles Galvanisé (12 x 12 mm)',
    meshPitchMm: '12 x 12 mm',
    pressureDropMultiplier: 1.12,
    freeAreaFactor: 0.90,
    descriptionFr: 'Protege les locaux contre l intrusion d oiseaux tout en conservant 90% de la section libre.',
  },
  insect_stainless_mesh: {
    id: 'insect_stainless_mesh',
    nameFr: 'Moustiquaire Inox Anti-Insectes (1.5 x 1.5 mm)',
    meshPitchMm: '1.5 x 1.5 mm',
    pressureDropMultiplier: 1.30,
    freeAreaFactor: 0.72,
    descriptionFr: 'Toile en acier inoxydable tissé. Recommande en agroalimentaire et salles d archives.',
  },
};

export interface LouverApplicationRoom {
  id: string;
  labelFr: string;
  maxAirVelocityMPerSec: number;
  minFreeAreaPercentRequired: number;
  adviceFr: string;
}

export const LOUVER_APPLICATIONS: LouverApplicationRoom[] = [
  {
    id: 'technical_electric_sonelgaz',
    labelFr: 'Local Transformateur & TGBT Sonelgaz',
    maxAirVelocityMPerSec: 1.8,
    minFreeAreaPercentRequired: 45,
    adviceFr: 'Vitesse d air limitee a 1.8 m/s pour eviter l echauffement des enroulements et le refoulement de pluie.',
  },
  {
    id: 'boiler_gas_room',
    labelFr: 'Chaufferie Gaz & Local Technique CTA',
    maxAirVelocityMPerSec: 2.2,
    minFreeAreaPercentRequired: 50,
    adviceFr: 'Amenée d air neuf basse obligatoire pour assurer la combustion complete des bruleurs.',
  },
  {
    id: 'generator_diesel',
    labelFr: 'Local Groupe Electrogene de Secours',
    maxAirVelocityMPerSec: 3.0,
    minFreeAreaPercentRequired: 50,
    adviceFr: 'Grand debit necessaire pour refroidir le radiateur eau/air du moteur diesel.',
  },
  {
    id: 'underground_parking',
    labelFr: 'Parking Souterrain & Desenfumage Naturel',
    maxAirVelocityMPerSec: 2.5,
    minFreeAreaPercentRequired: 40,
    adviceFr: 'Extraction et balayage de l air selon les normes de securite incendie dans les ERP.',
  },
  {
    id: 'residential_storage',
    labelFr: 'Local Poubelles & Celliers Residentiels',
    maxAirVelocityMPerSec: 1.5,
    minFreeAreaPercentRequired: 45,
    adviceFr: 'Ventilation passive permanente avec grille anti-nuisibles obligatoire.',
  },
];

export interface LouverCalculationInput {
  widthMm: number;
  heightMm: number;
  profileType: LouverBladeProfileType;
  screenType: LouverScreenType;
  airflowM3PerHour: number;
  applicationId: string;
  wilayaName?: string;
  projectRef?: string;
}

export interface LouverCalculationResult {
  input: LouverCalculationInput;
  profileSpec: LouverProfileSpec;
  screenSpec: ScreenSpec;
  appSpec: LouverApplicationRoom;

  // Geometry
  grossAreaM2: number;
  bladeCount: number;
  bladeLengthMm: number;
  bladePitchMm: number;
  frameBorderWidthMm: number;
  geometricFreeAreaM2: number;
  geometricFreeAreaPercent: number;
  effectiveAeroAreaM2: number;

  // Aerodynamics & Velocity
  airflowM3PerHour: number;
  airflowM3PerSecond: number;
  faceVelocityMPerSec: number;
  freeAreaVelocityMPerSec: number;
  pressureDropPa: number;
  airDensityKgM3: number;

  // Compliance
  isAirVelocityCompliant: boolean;
  velocityStatusTitleFr: string;
  waterPenetrationVerdictFr: string;
  overallVerdict: 'favorable' | 'warning' | 'critical';
  verdictDetailsFr: string[];
  recommendationsFr: string[];
}

/**
 * Calculates aerodynamic free area, face velocity, and static pressure drop according to NF EN 13030.
 */
export function calculateLouverAerodynamics(input: LouverCalculationInput): LouverCalculationResult {
  const profileSpec = LOUVER_PROFILE_TYPES[input.profileType];
  const screenSpec = LOUVER_SCREENS[input.screenType];
  const appSpec =
    LOUVER_APPLICATIONS.find((a) => a.id === input.applicationId) || LOUVER_APPLICATIONS[0];

  const frameBorderWidthMm = 35; // Standard 35 mm perimeter louver box frame
  const grossAreaM2 = Math.round(((input.widthMm * input.heightMm) / 1_000_000) * 1000) / 1000;

  const availableHeightMm = Math.max(input.heightMm - 2 * frameBorderWidthMm, 50);
  const bladePitchMm = profileSpec.bladePitchMm;
  const bladeCount = Math.max(Math.floor(availableHeightMm / bladePitchMm), 1);
  const bladeLengthMm = Math.max(input.widthMm - 2 * frameBorderWidthMm, 50);

  // Optical blade opening calculation: clear vertical throat opening
  const radAngle = (profileSpec.bladeAngleDeg * Math.PI) / 180;
  const bladeThicknessMm = 1.8;
  const clearThroatHeightMm = Math.max(
    bladePitchMm * Math.cos(radAngle) - bladeThicknessMm,
    bladePitchMm * 0.4
  );

  // Geometric free area with screen factor
  const rawFreeAreaM2 = (bladeCount * bladeLengthMm * clearThroatHeightMm) / 1_000_000;
  const geometricFreeAreaM2 =
    Math.round(rawFreeAreaM2 * screenSpec.freeAreaFactor * 1000) / 1000;
  const geometricFreeAreaPercent =
    Math.round((geometricFreeAreaM2 / grossAreaM2) * 1000) / 10;

  // Effective aerodynamic area via discharge coefficient Ce
  const effectiveAeroAreaM2 =
    Math.round(grossAreaM2 * profileSpec.dischargeCoefficientCe * screenSpec.freeAreaFactor * 1000) / 1000;

  // Airflow conversions
  const airflowM3PerHour = input.airflowM3PerHour;
  const airflowM3PerSecond = airflowM3PerHour / 3600;

  // Velocities
  const faceVelocityMPerSec =
    grossAreaM2 > 0 ? Math.round((airflowM3PerSecond / grossAreaM2) * 100) / 100 : 0;
  const freeAreaVelocityMPerSec =
    geometricFreeAreaM2 > 0 ? Math.round((airflowM3PerSecond / geometricFreeAreaM2) * 100) / 100 : 0;

  // Static pressure drop calculation: Delta P = (1 / Ce^2) * 0.5 * rho * V_face^2
  const airDensityKgM3 = 1.204; // Standard air at 20 C, 1013 hPa
  const baseDeltaP =
    (0.5 * airDensityKgM3 * Math.pow(faceVelocityMPerSec, 2)) /
    Math.pow(profileSpec.dischargeCoefficientCe, 2);
  const pressureDropPa =
    Math.round(baseDeltaP * screenSpec.pressureDropMultiplier * 10) / 10;

  // Verification against application velocity threshold
  const isAirVelocityCompliant = faceVelocityMPerSec <= appSpec.maxAirVelocityMPerSec;

  let overallVerdict: 'favorable' | 'warning' | 'critical' = 'favorable';
  let velocityStatusTitleFr = 'Vitesse d air conforme aux regles de l art';

  if (!isAirVelocityCompliant) {
    if (faceVelocityMPerSec > appSpec.maxAirVelocityMPerSec * 1.35) {
      overallVerdict = 'critical';
      velocityStatusTitleFr = 'Vitesse excessive: risque de sifflement et penetration d eau';
    } else {
      overallVerdict = 'warning';
      velocityStatusTitleFr = 'Attention: vitesse proche du seuil critique d entrainement';
    }
  }

  // Verdict details
  const verdictDetailsFr: string[] = [];
  verdictDetailsFr.push(
    'Section libre geometrique : ' +
      geometricFreeAreaPercent +
      '% (' +
      geometricFreeAreaM2.toFixed(3) +
      ' m2) pour une surface hors-tout de ' +
      grossAreaM2.toFixed(3) +
      ' m2.'
  );

  verdictDetailsFr.push(
    'Vitesse frontale : ' +
      faceVelocityMPerSec +
      ' m/s (Limite recommandee pour ' +
      appSpec.labelFr +
      ' : ' +
      appSpec.maxAirVelocityMPerSec +
      ' m/s).'
  );

  verdictDetailsFr.push(
    'Perte de charge aeraulique calculee : ' +
      pressureDropPa +
      ' Pa sous ' +
      airflowM3PerHour +
      ' m3/h.'
  );

  const waterPenetrationVerdictFr =
    profileSpec.waterRejectionClass +
    ' selon NF EN 13030 (' +
    (profileSpec.id === 'double_chevron_rainproof'
      ? 'Rejet total des embruns et pluies d orage'
      : 'Efficacite standard en facade protegee') +
    ').';

  // Recommendations
  const recommendationsFr: string[] = [];
  recommendationsFr.push(appSpec.adviceFr);

  if (faceVelocityMPerSec > appSpec.maxAirVelocityMPerSec) {
    const minWidthSuggested = Math.round(
      (input.widthMm * (faceVelocityMPerSec / appSpec.maxAirVelocityMPerSec)) / 50
    ) * 50;
    recommendationsFr.push(
      'Augmenter la largeur de la grille a au moins ' +
        minWidthSuggested +
        ' mm pour abaisser la vitesse frontale sous ' +
        appSpec.maxAirVelocityMPerSec +
        ' m/s.'
    );
  }

  if (input.screenType === 'insect_stainless_mesh') {
    recommendationsFr.push(
      'Prevoir un nettoyage semestriel de la moustiquaire inox pour eviter l encrassement et la hausse des pertes de charge.'
    );
  }

  if (profileSpec.id === 'double_chevron_rainproof') {
    recommendationsFr.push(
      'Disposer d un larmier inferieur avec debord de 30 mm pour l ecoulement libre de l eau de ruissellement.'
    );
  } else {
    recommendationsFr.push(
      'Lames fixees par vis inox autobaraudeuses ou par clames aluminium a clipser dans tubulure latérale.'
    );
  }

  return {
    input,
    profileSpec,
    screenSpec,
    appSpec,
    grossAreaM2,
    bladeCount,
    bladeLengthMm,
    bladePitchMm,
    frameBorderWidthMm,
    geometricFreeAreaM2,
    geometricFreeAreaPercent,
    effectiveAeroAreaM2,
    airflowM3PerHour,
    airflowM3PerSecond,
    faceVelocityMPerSec,
    freeAreaVelocityMPerSec,
    pressureDropPa,
    airDensityKgM3,
    isAirVelocityCompliant,
    velocityStatusTitleFr,
    waterPenetrationVerdictFr,
    overallVerdict,
    verdictDetailsFr,
    recommendationsFr,
  };
}

/**
 * Formats WhatsApp technical dispatch for MEP engineers, Sonelgaz, and site supervisors.
 */
export function formatLouverDispatchWhatsApp(
  res: LouverCalculationResult,
  clientName: string,
  projectRef: string
): string {
  const lines: string[] = [
    '*BAITI ATELIER - NOTE AERODYNAMIQUE GRILLE A VENTELLES*',
    'Ref: ' + projectRef + ' | Client: ' + clientName,
    'Normes: NF EN 13030 / NF DTU 68.3 / Prescriptions Sonelgaz',
    '----------------------------------------',
    '*1. CARACTERISTIQUES GEOMETRIQUES*',
    'Dimensions: ' + res.input.widthMm + ' x ' + res.input.heightMm + ' mm',
    'Surface Hors-Tout: ' + res.grossAreaM2.toFixed(3) + ' m2',
    'Type de Lame: ' + res.profileSpec.nameFr,
    'Nombre de lames: ' + res.bladeCount + ' (Pas: ' + res.bladePitchMm + ' mm)',
    'Section Libre Geometrique: ' + res.geometricFreeAreaPercent + '% (' + res.geometricFreeAreaM2.toFixed(3) + ' m2)',
    'Grillage: ' + res.screenSpec.nameFr,
    '',
    '*2. PERFORMANCE AERAULIQUE & DEBIT*',
    'Usage: ' + res.appSpec.labelFr,
    'Debit d air d etude: ' + res.airflowM3PerHour + ' m3/h',
    'Vitesse d air frontale: ' + res.faceVelocityMPerSec + ' m/s (Seuil max: ' + res.appSpec.maxAirVelocityMPerSec + ' m/s)',
    'Vitesse dans la section libre: ' + res.freeAreaVelocityMPerSec + ' m/s',
    'Perte de charge aeraulique: ' + res.pressureDropPa + ' Pa',
    'Efficacite pluie: ' + res.waterPenetrationVerdictFr,
    '',
    '*3. VERDICT ET PRESCRIPTIONS*',
    'Statut: ' + res.velocityStatusTitleFr,
    res.recommendationsFr.length > 0 ? 'Note: ' + res.recommendationsFr[0] : '',
    '----------------------------------------',
    'Genere automatiquement par Baiti Atelier Aeraulique',
  ];

  return lines.join('\n');
}
