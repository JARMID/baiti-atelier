/**
 * Glazing Bead (Parclose) Profile Miter Angle, Notching & Gasket Calculator
 * Baiti Atelier Aluminum & PVC Architectural Joinery Suite
 *
 * Implements European & Algerian carpentry standards for glazing beads:
 * - 45-degree miter corner joints (coupes d onglet)
 * - 90-degree straight butt joints with clip heel notching (coupes droites avec grugeage)
 * - Glass thickness and gasket compatibility matrix
 * - Glazing setting blocks placement guidelines (DTU 39)
 */

export type GlazingCutMethod =
  | 'miter_45'
  | 'straight_90_horizontal_continuous'
  | 'straight_90_vertical_continuous';

export type ProfileSeriesId =
  | 'gamme_45_thermal'
  | 'gamme_50_52_thermal'
  | 'gamme_coulissant_standard'
  | 'pvc_60_multi'
  | 'menuiserie_traditionnelle_froide';

export interface GlazingBeadProfile {
  id: string;
  name: string;
  seriesId: ProfileSeriesId;
  depthMm: number;
  faceWidthMm: number;
  shape: 'carree' | 'ronde_galbee' | 'mouluree';
  allowedMethods: GlazingCutMethod[];
  clipType: 'clippable_direct' | 'clip_nylon_rapporte' | 'coextrude';
  defaultNotchMm: number;
  weightKgPerM: number;
}

export interface GasketSpec {
  id: string;
  name: string;
  position: 'exterieur' | 'interieur';
  thicknessMm: number;
  colorName: string;
  colorHex: string;
  type: 'joint_lèvre_epdm' | 'joint_coin_cale' | 'mousse_adhesive';
}

export interface SettingBlockGuide {
  blockType: 'supportage' | 'centrage_diagonale' | 'jeu_peripherique';
  description: string;
  positionFr: string;
  recommendedThicknessMm: number;
  minDistanceCornerMm: number;
}

export interface ParclosePieceCut {
  id: string;
  orientation: 'horizontal_haut' | 'horizontal_bas' | 'vertical_gauche' | 'vertical_droit';
  labelFr: string;
  lengthMm: number;
  cutLeftAngle: 45 | 90;
  cutRightAngle: 45 | 90;
  hasNotch: boolean;
  notchLengthMm: number;
  notchNoteFr: string;
}

export interface GlazingBeadCalculationResult {
  seriesName: string;
  glassThicknessMm: number;
  totalRebateDepthMm: number;
  selectedBead: GlazingBeadProfile;
  exteriorGasket: GasketSpec;
  interiorGasket: GasketSpec;
  slackClearanceMm: number;
  isFitFeasible: boolean;
  cutMethod: GlazingCutMethod;
  pieces: ParclosePieceCut[];
  totalLengthMm: number;
  estimatedWeightKg: number;
  settingBlocks: SettingBlockGuide[];
  workshopNotesFr: string[];
}

export const PROFILE_SERIES_CATALOG: Record<
  ProfileSeriesId,
  { name: string; rebateDepthMm: number; description: string }
> = {
  gamme_45_thermal: {
    name: 'Aluminium 45 RPT Standard',
    rebateDepthMm: 42,
    description: 'Série la plus répandue en Algérie (Alugraf, Profilor). Feuillure 42 mm.',
  },
  gamme_50_52_thermal: {
    name: 'Aluminium 50/52 RPT Haute Isolation',
    rebateDepthMm: 46,
    description: 'Conforme DTR C3-2 Zone B et Hauts Plateaux. Feuillure 46 mm.',
  },
  gamme_coulissant_standard: {
    name: 'Aluminium Coulissant 28/32',
    rebateDepthMm: 30,
    description: 'Vantail coulissant classique avec feuillure vitrage de 30 mm.',
  },
  pvc_60_multi: {
    name: 'PVC 60 Multi-Chambres',
    rebateDepthMm: 48,
    description: 'Profilé PVC 4 chambres avec feuillure profonde de 48 mm.',
  },
  menuiserie_traditionnelle_froide: {
    name: 'Menuiserie Alu Froide (Traditionnelle)',
    rebateDepthMm: 34,
    description: 'Profilés économiques sans rupture thermique. Feuillure 34 mm.',
  },
};

export const STANDARD_BEADS_CATALOG: GlazingBeadProfile[] = [
  // Gamme 45
  {
    id: 'g45_p6',
    name: 'Parclose Plate 6 mm (Très étroite)',
    seriesId: 'gamme_45_thermal',
    depthMm: 6,
    faceWidthMm: 14,
    shape: 'carree',
    allowedMethods: ['miter_45', 'straight_90_horizontal_continuous', 'straight_90_vertical_continuous'],
    clipType: 'clippable_direct',
    defaultNotchMm: 12,
    weightKgPerM: 0.165,
  },
  {
    id: 'g45_p10',
    name: 'Parclose Carrée 10 mm (Double vitrage standard)',
    seriesId: 'gamme_45_thermal',
    depthMm: 10,
    faceWidthMm: 16,
    shape: 'carree',
    allowedMethods: ['miter_45', 'straight_90_horizontal_continuous', 'straight_90_vertical_continuous'],
    clipType: 'clippable_direct',
    defaultNotchMm: 12,
    weightKgPerM: 0.19,
  },
  {
    id: 'g45_p14',
    name: 'Parclose Carrée 14 mm (Double vitrage 20mm)',
    seriesId: 'gamme_45_thermal',
    depthMm: 14,
    faceWidthMm: 16,
    shape: 'carree',
    allowedMethods: ['miter_45', 'straight_90_horizontal_continuous', 'straight_90_vertical_continuous'],
    clipType: 'clippable_direct',
    defaultNotchMm: 12,
    weightKgPerM: 0.22,
  },
  {
    id: 'g45_p18',
    name: 'Parclose Carrée 18 mm (Double vitrage 16mm)',
    seriesId: 'gamme_45_thermal',
    depthMm: 18,
    faceWidthMm: 18,
    shape: 'carree',
    allowedMethods: ['miter_45', 'straight_90_horizontal_continuous', 'straight_90_vertical_continuous'],
    clipType: 'clippable_direct',
    defaultNotchMm: 12,
    weightKgPerM: 0.245,
  },
  {
    id: 'g45_p24',
    name: 'Parclose Carrée 24 mm (Simple vitrage épais / 10mm)',
    seriesId: 'gamme_45_thermal',
    depthMm: 24,
    faceWidthMm: 20,
    shape: 'carree',
    allowedMethods: ['miter_45', 'straight_90_horizontal_continuous', 'straight_90_vertical_continuous'],
    clipType: 'clippable_direct',
    defaultNotchMm: 14,
    weightKgPerM: 0.29,
  },
  {
    id: 'g45_p30',
    name: 'Parclose Carrée 30 mm (Simple vitrage 4mm à 6mm)',
    seriesId: 'gamme_45_thermal',
    depthMm: 30,
    faceWidthMm: 22,
    shape: 'carree',
    allowedMethods: ['miter_45', 'straight_90_horizontal_continuous', 'straight_90_vertical_continuous'],
    clipType: 'clippable_direct',
    defaultNotchMm: 14,
    weightKgPerM: 0.34,
  },
  {
    id: 'g45_round_14',
    name: 'Parclose Galbée Moulurée 14 mm',
    seriesId: 'gamme_45_thermal',
    depthMm: 14,
    faceWidthMm: 18,
    shape: 'ronde_galbee',
    allowedMethods: ['miter_45'],
    clipType: 'clippable_direct',
    defaultNotchMm: 0,
    weightKgPerM: 0.23,
  },
  // Gamme 50/52
  {
    id: 'g52_p10',
    name: 'Parclose 52 RPT Carrée 10 mm',
    seriesId: 'gamme_50_52_thermal',
    depthMm: 10,
    faceWidthMm: 16,
    shape: 'carree',
    allowedMethods: ['miter_45', 'straight_90_horizontal_continuous', 'straight_90_vertical_continuous'],
    clipType: 'clippable_direct',
    defaultNotchMm: 12,
    weightKgPerM: 0.2,
  },
  {
    id: 'g52_p14',
    name: 'Parclose 52 RPT Carrée 14 mm',
    seriesId: 'gamme_50_52_thermal',
    depthMm: 14,
    faceWidthMm: 16,
    shape: 'carree',
    allowedMethods: ['miter_45', 'straight_90_horizontal_continuous', 'straight_90_vertical_continuous'],
    clipType: 'clippable_direct',
    defaultNotchMm: 12,
    weightKgPerM: 0.23,
  },
  {
    id: 'g52_p20',
    name: 'Parclose 52 RPT Carrée 20 mm',
    seriesId: 'gamme_50_52_thermal',
    depthMm: 20,
    faceWidthMm: 18,
    shape: 'carree',
    allowedMethods: ['miter_45', 'straight_90_horizontal_continuous', 'straight_90_vertical_continuous'],
    clipType: 'clippable_direct',
    defaultNotchMm: 14,
    weightKgPerM: 0.26,
  },
  // Coulissant
  {
    id: 'coul_p10',
    name: 'Parclose Coulissant 10 mm (Double vitrage)',
    seriesId: 'gamme_coulissant_standard',
    depthMm: 10,
    faceWidthMm: 14,
    shape: 'carree',
    allowedMethods: ['miter_45', 'straight_90_horizontal_continuous'],
    clipType: 'clippable_direct',
    defaultNotchMm: 10,
    weightKgPerM: 0.17,
  },
  {
    id: 'coul_p20',
    name: 'Parclose Coulissant 20 mm (Simple vitrage 6mm)',
    seriesId: 'gamme_coulissant_standard',
    depthMm: 20,
    faceWidthMm: 16,
    shape: 'carree',
    allowedMethods: ['miter_45', 'straight_90_horizontal_continuous'],
    clipType: 'clippable_direct',
    defaultNotchMm: 10,
    weightKgPerM: 0.23,
  },
  // PVC 60
  {
    id: 'pvc60_p14',
    name: 'Parclose PVC 60 mm (14 mm double vitrage)',
    seriesId: 'pvc_60_multi',
    depthMm: 14,
    faceWidthMm: 18,
    shape: 'carree',
    allowedMethods: ['miter_45'],
    clipType: 'coextrude',
    defaultNotchMm: 0,
    weightKgPerM: 0.21,
  },
  {
    id: 'pvc60_p20',
    name: 'Parclose PVC 60 mm (20 mm double vitrage 24mm)',
    seriesId: 'pvc_60_multi',
    depthMm: 20,
    faceWidthMm: 20,
    shape: 'carree',
    allowedMethods: ['miter_45'],
    clipType: 'coextrude',
    defaultNotchMm: 0,
    weightKgPerM: 0.25,
  },
  // Traditionnel
  {
    id: 'trad_p18',
    name: 'Parclose Traditionnelle Alu 18 mm',
    seriesId: 'menuiserie_traditionnelle_froide',
    depthMm: 18,
    faceWidthMm: 16,
    shape: 'carree',
    allowedMethods: ['miter_45', 'straight_90_horizontal_continuous'],
    clipType: 'clippable_direct',
    defaultNotchMm: 10,
    weightKgPerM: 0.18,
  },
];

export const STANDARD_GASKETS: GasketSpec[] = [
  {
    id: 'gasket_ext_3mm',
    name: 'Joint extérieur EPDM portefeuille 3 mm',
    position: 'exterieur',
    thicknessMm: 3.0,
    colorName: 'Noir mat',
    colorHex: '#1E293B',
    type: 'joint_lèvre_epdm',
  },
  {
    id: 'gasket_ext_4mm',
    name: 'Joint extérieur EPDM forte compression 4 mm',
    position: 'exterieur',
    thicknessMm: 4.0,
    colorName: 'Noir mat',
    colorHex: '#1E293B',
    type: 'joint_lèvre_epdm',
  },
  {
    id: 'gasket_int_2_5mm',
    name: 'Joint coin de calage EPDM 2.5 mm',
    position: 'interieur',
    thicknessMm: 2.5,
    colorName: 'Repère Blanc',
    colorHex: '#F8FAFC',
    type: 'joint_coin_cale',
  },
  {
    id: 'gasket_int_3_5mm',
    name: 'Joint coin de calage EPDM 3.5 mm',
    position: 'interieur',
    thicknessMm: 3.5,
    colorName: 'Repère Jaune',
    colorHex: '#FBBF24',
    type: 'joint_coin_cale',
  },
  {
    id: 'gasket_int_4_5mm',
    name: 'Joint coin de calage EPDM 4.5 mm',
    position: 'interieur',
    thicknessMm: 4.5,
    colorName: 'Repère Noir',
    colorHex: '#0F172A',
    type: 'joint_coin_cale',
  },
  {
    id: 'gasket_int_5_5mm',
    name: 'Joint coin de calage EPDM 5.5 mm',
    position: 'interieur',
    thicknessMm: 5.5,
    colorName: 'Repère Vert',
    colorHex: '#22C55E',
    type: 'joint_coin_cale',
  },
];

/**
 * Automatically calculates the best parclose and gasket combination
 * based on glass unit thickness and profile series rebate depth.
 */
export function calculateGlazingBeadAssembly(params: {
  seriesId: ProfileSeriesId;
  glassThicknessMm: number;
  daylightWidthMm: number;
  daylightHeightMm: number;
  preferredMethod?: GlazingCutMethod;
}): GlazingBeadCalculationResult {
  const seriesInfo = PROFILE_SERIES_CATALOG[params.seriesId] || PROFILE_SERIES_CATALOG.gamme_45_thermal;
  const rebate = seriesInfo.rebateDepthMm;
  const glassT = Math.max(3, params.glassThicknessMm);

  // Exterior gasket is typically 3mm (or 4mm for thick thermal series)
  const extGasket = STANDARD_GASKETS.find((g) => g.id === 'gasket_ext_3mm') || STANDARD_GASKETS[0];

  // Filter available beads for this series
  const seriesBeads = STANDARD_BEADS_CATALOG.filter((b) => b.seriesId === params.seriesId);

  // Find candidate bead that leaves between 2.0mm and 6.0mm for interior wedge gasket
  let bestBead: GlazingBeadProfile = seriesBeads[0];
  let bestSlackDiff = 999;
  let chosenIntGasket: GasketSpec = STANDARD_GASKETS[2];

  const intGasketCandidates = STANDARD_GASKETS.filter((g) => g.position === 'interieur');

  for (const bead of seriesBeads) {
    for (const gasket of intGasketCandidates) {
      const totalStack = glassT + extGasket.thicknessMm + bead.depthMm + gasket.thicknessMm;
      const slack = rebate - totalStack;
      const absSlack = Math.abs(slack);

      if (absSlack < bestSlackDiff) {
        bestSlackDiff = absSlack;
        bestBead = bead;
        chosenIntGasket = gasket;
      }
    }
  }

  const finalTotalStack = glassT + extGasket.thicknessMm + bestBead.depthMm + chosenIntGasket.thicknessMm;
  const finalSlack = rebate - finalTotalStack;
  const isFeasible = Math.abs(finalSlack) <= 1.5;

  // Determine method
  let cutMethod: GlazingCutMethod = params.preferredMethod || 'miter_45';
  if (!bestBead.allowedMethods.includes(cutMethod)) {
    cutMethod = bestBead.allowedMethods[0];
  }

  // Calculate cut pieces
  const W = Math.max(100, Math.round(params.daylightWidthMm));
  const H = Math.max(100, Math.round(params.daylightHeightMm));
  const beadFace = bestBead.faceWidthMm;
  const pieces: ParclosePieceCut[] = [];

  if (cutMethod === 'miter_45') {
    // 4 cuts with dual 45-degree angles
    // Length is outer daylight dimension minus 1.5mm thermal/clipping play
    const hCut = Math.max(50, W - 2);
    const vCut = Math.max(50, H - 2);

    pieces.push({
      id: 'p_h_haut',
      orientation: 'horizontal_haut',
      labelFr: 'Traverse Haute (45°)',
      lengthMm: hCut,
      cutLeftAngle: 45,
      cutRightAngle: 45,
      hasNotch: false,
      notchLengthMm: 0,
      notchNoteFr: 'Coupe onglet 45° standard sans grugeage',
    });
    pieces.push({
      id: 'p_h_bas',
      orientation: 'horizontal_bas',
      labelFr: 'Traverse Basse (45°)',
      lengthMm: hCut,
      cutLeftAngle: 45,
      cutRightAngle: 45,
      hasNotch: false,
      notchLengthMm: 0,
      notchNoteFr: 'Coupe onglet 45° standard sans grugeage',
    });
    pieces.push({
      id: 'p_v_gauche',
      orientation: 'vertical_gauche',
      labelFr: 'Montant Gauche (45°)',
      lengthMm: vCut,
      cutLeftAngle: 45,
      cutRightAngle: 45,
      hasNotch: false,
      notchLengthMm: 0,
      notchNoteFr: 'Coupe onglet 45° standard sans grugeage',
    });
    pieces.push({
      id: 'p_v_droit',
      orientation: 'vertical_droit',
      labelFr: 'Montant Droit (45°)',
      lengthMm: vCut,
      cutLeftAngle: 45,
      cutRightAngle: 45,
      hasNotch: false,
      notchLengthMm: 0,
      notchNoteFr: 'Coupe onglet 45° standard sans grugeage',
    });
  } else if (cutMethod === 'straight_90_horizontal_continuous') {
    // Horizontals run full width; Verticals are cut straight and notched
    const hCut = Math.max(50, W - 1);
    const vCut = Math.max(50, H - 2 * beadFace - 1);
    const notchLen = bestBead.defaultNotchMm || 12;

    pieces.push({
      id: 'p_h_haut',
      orientation: 'horizontal_haut',
      labelFr: 'Traverse Haute Filante (90°)',
      lengthMm: hCut,
      cutLeftAngle: 90,
      cutRightAngle: 90,
      hasNotch: false,
      notchLengthMm: 0,
      notchNoteFr: 'Traverse filante de rive à rive, coupe droite 90°',
    });
    pieces.push({
      id: 'p_h_bas',
      orientation: 'horizontal_bas',
      labelFr: 'Traverse Basse Filante (90°)',
      lengthMm: hCut,
      cutLeftAngle: 90,
      cutRightAngle: 90,
      hasNotch: false,
      notchLengthMm: 0,
      notchNoteFr: 'Traverse filante de rive à rive, coupe droite 90°',
    });
    pieces.push({
      id: 'p_v_gauche',
      orientation: 'vertical_gauche',
      labelFr: 'Montant Gauche Grugeoir (90°)',
      lengthMm: vCut,
      cutLeftAngle: 90,
      cutRightAngle: 90,
      hasNotch: true,
      notchLengthMm: notchLen,
      notchNoteFr: `Entailler le pied de clip de ${notchLen} mm aux 2 extrémités`,
    });
    pieces.push({
      id: 'p_v_droit',
      orientation: 'vertical_droit',
      labelFr: 'Montant Droit Grugeoir (90°)',
      lengthMm: vCut,
      cutLeftAngle: 90,
      cutRightAngle: 90,
      hasNotch: true,
      notchLengthMm: notchLen,
      notchNoteFr: `Entailler le pied de clip de ${notchLen} mm aux 2 extrémités`,
    });
  } else {
    // Verticals run full height; Horizontals are cut straight and notched
    const vCut = Math.max(50, H - 1);
    const hCut = Math.max(50, W - 2 * beadFace - 1);
    const notchLen = bestBead.defaultNotchMm || 12;

    pieces.push({
      id: 'p_h_haut',
      orientation: 'horizontal_haut',
      labelFr: 'Traverse Haute Grugeoir (90°)',
      lengthMm: hCut,
      cutLeftAngle: 90,
      cutRightAngle: 90,
      hasNotch: true,
      notchLengthMm: notchLen,
      notchNoteFr: `Entailler le pied de clip de ${notchLen} mm aux 2 extrémités`,
    });
    pieces.push({
      id: 'p_h_bas',
      orientation: 'horizontal_bas',
      labelFr: 'Traverse Basse Grugeoir (90°)',
      lengthMm: hCut,
      cutLeftAngle: 90,
      cutRightAngle: 90,
      hasNotch: true,
      notchLengthMm: notchLen,
      notchNoteFr: `Entailler le pied de clip de ${notchLen} mm aux 2 extrémités`,
    });
    pieces.push({
      id: 'p_v_gauche',
      orientation: 'vertical_gauche',
      labelFr: 'Montant Gauche Filant (90°)',
      lengthMm: vCut,
      cutLeftAngle: 90,
      cutRightAngle: 90,
      hasNotch: false,
      notchLengthMm: 0,
      notchNoteFr: 'Montant filant de haut en bas, coupe droite 90°',
    });
    pieces.push({
      id: 'p_v_droit',
      orientation: 'vertical_droit',
      labelFr: 'Montant Droit Filant (90°)',
      lengthMm: vCut,
      cutLeftAngle: 90,
      cutRightAngle: 90,
      hasNotch: false,
      notchLengthMm: 0,
      notchNoteFr: 'Montant filant de haut en bas, coupe droite 90°',
    });
  }

  const totalLengthMm = pieces.reduce((sum, p) => sum + p.lengthMm, 0);
  const estimatedWeightKg = parseFloat(((totalLengthMm / 1000) * bestBead.weightKgPerM).toFixed(3));

  // Glazing setting blocks guidance according to DTU 39
  const settingBlocks: SettingBlockGuide[] = [
    {
      blockType: 'supportage',
      description: 'Cales d assise supportant le poids total du vitrage',
      positionFr: 'Bas de feuillure, 2 cales à 100 mm de chaque angle inférieur',
      recommendedThicknessMm: Math.min(6, Math.max(3, extGasket.thicknessMm + 1)),
      minDistanceCornerMm: 100,
    },
    {
      blockType: 'centrage_diagonale',
      description: 'Calage triangulé anti-affaissement du vantail battant',
      positionFr: 'Côté ferrure en bas et côté poignée en haut',
      recommendedThicknessMm: 4.0,
      minDistanceCornerMm: 80,
    },
    {
      blockType: 'jeu_peripherique',
      description: 'Cales latérales pour maintien du jeu périmétrique uniforme',
      positionFr: 'Montants verticaux à mi-hauteur',
      recommendedThicknessMm: 3.0,
      minDistanceCornerMm: 150,
    },
  ];

  const notes: string[] = [
    `Feuillure nominale : ${rebate} mm. Vitrage : ${glassT} mm.`,
    `Joint extérieur : ${extGasket.thicknessMm} mm (${extGasket.name}).`,
    `Parclose retenue : ${bestBead.name} (Profondeur ${bestBead.depthMm} mm, Vue face ${bestBead.faceWidthMm} mm).`,
    `Joint coin intérieur : ${chosenIntGasket.thicknessMm} mm (${chosenIntGasket.colorName}).`,
  ];

  if (!isFeasible) {
    notes.push('Attention : écart de calage supérieur à 1.5 mm. Vérifier l épaisseur du joint ou la parclose.');
  }

  return {
    seriesName: seriesInfo.name,
    glassThicknessMm: glassT,
    totalRebateDepthMm: rebate,
    selectedBead: bestBead,
    exteriorGasket: extGasket,
    interiorGasket: chosenIntGasket,
    slackClearanceMm: parseFloat(finalSlack.toFixed(2)),
    isFitFeasible: isFeasible,
    cutMethod,
    pieces,
    totalLengthMm,
    estimatedWeightKg,
    settingBlocks,
    workshopNotesFr: notes,
  };
}

/**
 * Format WhatsApp transmission message for glazier & saw operator
 */
export function formatGlazingBeadWhatsApp(result: GlazingBeadCalculationResult): string {
  const methodLabel =
    result.cutMethod === 'miter_45'
      ? 'Coupe d Onglet à 45°'
      : result.cutMethod === 'straight_90_horizontal_continuous'
      ? 'Coupe Droite 90° (Traverses Filantes)'
      : 'Coupe Droite 90° (Montants Filants)';

  let msg = '*FICHE DÉBIT PARCLOSES & VITRAGE • BAITI ATELIER*\n';
  msg += `Série : ${result.seriesName}\n`;
  msg += `Méthode d assemblage : *${methodLabel}*\n`;
  msg += `Épaisseur vitrage : *${result.glassThicknessMm} mm*\n`;
  msg += `Modèle parclose : *${result.selectedBead.name}*\n`;
  msg += `Joint intérieur : *${result.interiorGasket.thicknessMm} mm* (${result.interiorGasket.colorName})\n\n`;

  msg += '*DÉBIT DES 4 PARCLOSES :*\n';
  result.pieces.forEach((p, idx) => {
    msg += `${idx + 1}. *${p.labelFr}* : *${p.lengthMm} mm*\n`;
    msg += `   Coupes : [${p.cutLeftAngle}° / ${p.cutRightAngle}°]\n`;
    if (p.hasNotch) {
      msg += `   ⚠️ *Grugeage :* ${p.notchNoteFr}\n`;
    }
  });

  msg += `\nMétré linéaire total : *${(result.totalLengthMm / 1000).toFixed(2)} m* (~${result.estimatedWeightKg} kg alu)\n`;
  msg += '\n*CALAGE VITRAGE DTU 39 :*\n';
  msg += '• Cales d assise : 2 cales en bas à 100 mm des angles\n';
  msg += '• Triangulation vantail : cale côté paumelle bas et côté poignée haut\n';
  msg += '\nBaiti Atelier Menuiserie Aluminium & PVC Algérie';

  return msg;
}
