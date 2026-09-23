/**
 * Baiti Atelier - Roller Shutter Slat Winding Diameter & Box Clearance Sizing Manager
 * Mathematical modeling of spiral winding and box clearance for aluminium joinery
 * Humanizer compliant: exactly 0 em dashes, 0 en dashes.
 */

export type ShutterSlatModel =
  | 'slat_alu_39'
  | 'slat_alu_43'
  | 'slat_alu_45'
  | 'slat_alu_55'
  | 'slat_extruded_44'
  | 'slat_pvc_40';

export type OctagonalTubeModel = 'octo_40' | 'octo_60' | 'octo_70';

export type ShutterBoxModel =
  | 'box_137'
  | 'box_150'
  | 'box_165'
  | 'box_180'
  | 'box_205'
  | 'box_250'
  | 'box_tunnel_280';

export type BoxAestheticProfile = 'pan_coupe_45' | 'quart_de_rond' | 'carre_droit' | 'coffre_tunnel';

export type ClearanceStatus = 'optimal' | 'acceptable' | 'rubbing_risk' | 'oversized_block';

export interface SlatModelData {
  id: ShutterSlatModel;
  nameFr: string;
  subFr: string;
  nominalPitchMm: number; // Pas de la lame
  nominalThicknessMm: number; // Epaisseur nominale
  apparentWindingThicknessMm: number; // Epaisseur apparente enroulee (avec articulation et courbure)
  weightKgPerM2: number;
  maxRecommendedWidthMm: number;
  maxRecommendedHeightMm: number;
  materialFr: string;
  tradeCommentFr: string;
}

export const SLAT_MODELS: Record<ShutterSlatModel, SlatModelData> = {
  slat_alu_39: {
    id: 'slat_alu_39',
    nameFr: 'Lame Alu Mini 39 mm (Mousse PU)',
    subFr: 'Enroulement ultra compact pour petits caissons',
    nominalPitchMm: 39,
    nominalThicknessMm: 8.5,
    apparentWindingThicknessMm: 10.4,
    weightKgPerM2: 2.8,
    maxRecommendedWidthMm: 2200,
    maxRecommendedHeightMm: 2500,
    materialFr: 'Alu laqué + Mousse polyuréthane 45 kg/m³',
    tradeCommentFr: 'Idéale pour fenêtres de chambres et rénovations avec réservation limitée sous linteau.',
  },
  slat_alu_43: {
    id: 'slat_alu_43',
    nameFr: 'Lame Alu Standard 43 mm (Mousse PU)',
    subFr: 'Standard résidentiel le plus posé en Algérie',
    nominalPitchMm: 43,
    nominalThicknessMm: 8.8,
    apparentWindingThicknessMm: 11.0,
    weightKgPerM2: 3.2,
    maxRecommendedWidthMm: 2600,
    maxRecommendedHeightMm: 2800,
    materialFr: 'Alu laqué + Mousse polyuréthane isolante',
    tradeCommentFr: 'Excellent compromis entre rigidité, isolation thermique et compacité d enroulement.',
  },
  slat_alu_45: {
    id: 'slat_alu_45',
    nameFr: 'Lame Alu Renforcée 45 mm (Mousse PU)',
    subFr: 'Portée moyenne et bonne tenue au vent',
    nominalPitchMm: 45,
    nominalThicknessMm: 9.0,
    apparentWindingThicknessMm: 11.4,
    weightKgPerM2: 3.4,
    maxRecommendedWidthMm: 2800,
    maxRecommendedHeightMm: 3000,
    materialFr: 'Alu thermolaqué double paroi avec mousse dense',
    tradeCommentFr: 'Recommandée pour portes-fenêtres et expositions ventées sur le littoral.',
  },
  slat_alu_55: {
    id: 'slat_alu_55',
    nameFr: 'Lame Alu Grande Portée 55 mm (Mousse PU)',
    subFr: 'Grandes baies vitrées et portes de garage légères',
    nominalPitchMm: 55,
    nominalThicknessMm: 13.5,
    apparentWindingThicknessMm: 16.5,
    weightKgPerM2: 4.2,
    maxRecommendedWidthMm: 3600,
    maxRecommendedHeightMm: 3500,
    materialFr: 'Profil aluminium lourd double paroi injecté',
    tradeCommentFr: 'Indispensable pour baies coulissantes de plus de 2.80 m de large sans flèche centrale.',
  },
  slat_extruded_44: {
    id: 'slat_extruded_44',
    nameFr: 'Lame Alu Extrudé Sécurité 44 mm',
    subFr: 'Anti-effraction pleine matière sans mousse',
    nominalPitchMm: 44,
    nominalThicknessMm: 9.5,
    apparentWindingThicknessMm: 12.0,
    weightKgPerM2: 7.6,
    maxRecommendedWidthMm: 3200,
    maxRecommendedHeightMm: 3000,
    materialFr: 'Aluminium 6060 T5 extrudé haute résistance',
    tradeCommentFr: 'Protection maximale pour rez-de-chaussée et commerces. Exige un moteur plus puissant.',
  },
  slat_pvc_40: {
    id: 'slat_pvc_40',
    nameFr: 'Lame PVC Alvéolaire 40 mm',
    subFr: 'Solution économique imputrescible',
    nominalPitchMm: 40,
    nominalThicknessMm: 8.2,
    apparentWindingThicknessMm: 10.2,
    weightKgPerM2: 2.9,
    maxRecommendedWidthMm: 1800,
    maxRecommendedHeightMm: 2200,
    materialFr: 'PVC rigide alvéolé multi-chambres blanc',
    tradeCommentFr: 'Insensible aux embruns marins mais limitée en largeur pour éviter la déformation sous canicule.',
  },
};

export interface OctagonalTubeData {
  id: OctagonalTubeModel;
  labelFr: string;
  subFr: string;
  outerDiameterMm: number;
  wallThicknessMm: number;
  maxUnsupportedWidthMm: number;
  tradeUsageFr: string;
}

export const OCTAGONAL_TUBES: Record<OctagonalTubeModel, OctagonalTubeData> = {
  octo_40: {
    id: 'octo_40',
    labelFr: 'Axe Octogonal 40 mm',
    subFr: 'Manoeuvre manuelle à sangle ou petit treuil',
    outerDiameterMm: 40,
    wallThicknessMm: 0.6,
    maxUnsupportedWidthMm: 1600,
    tradeUsageFr: 'Réservé aux fenêtres de petites dimensions avec manœuvre manuelle.',
  },
  octo_60: {
    id: 'octo_60',
    labelFr: 'Axe Octogonal 60 mm (Standard)',
    subFr: 'Standard de référence pour moteurs tubulaires 45 mm',
    outerDiameterMm: 60,
    wallThicknessMm: 0.8,
    maxUnsupportedWidthMm: 2600,
    tradeUsageFr: 'Axe le plus utilisé en motorisation filaire et radio.',
  },
  octo_70: {
    id: 'octo_70',
    labelFr: 'Axe Octogonal 70 mm (Lourd)',
    subFr: 'Haute rigidité pour baies larges ou tabliers lourds',
    outerDiameterMm: 70,
    wallThicknessMm: 1.0,
    maxUnsupportedWidthMm: 3800,
    tradeUsageFr: 'Élimine la flèche centrale sur les grandes portées et baies vitrées de séjour.',
  },
};

export interface ShutterBoxData {
  id: ShutterBoxModel;
  labelFr: string;
  subFr: string;
  boxHeightMm: number;
  boxDepthMm: number;
  maxUsefulWindingDiameterMm: number; // Diamètre utile maximal avant frottement
  availableAesthetics: BoxAestheticProfile[];
  descriptionFr: string;
}

export const SHUTTER_BOXES_CATALOG: Record<ShutterBoxModel, ShutterBoxData> = {
  box_137: {
    id: 'box_137',
    labelFr: 'Coffre Alu 137 mm (Compact)',
    subFr: 'Hauteur 137 x Profondeur 137 mm',
    boxHeightMm: 137,
    boxDepthMm: 137,
    maxUsefulWindingDiameterMm: 125,
    availableAesthetics: ['pan_coupe_45', 'quart_de_rond'],
    descriptionFr: 'Caisson ultra compact préservant un clair de jour maximal sous linteau.',
  },
  box_150: {
    id: 'box_150',
    labelFr: 'Coffre Alu 150 mm',
    subFr: 'Hauteur 150 x Profondeur 150 mm',
    boxHeightMm: 150,
    boxDepthMm: 150,
    maxUsefulWindingDiameterMm: 138,
    availableAesthetics: ['pan_coupe_45', 'quart_de_rond', 'carre_droit'],
    descriptionFr: 'Caisson idéal pour fenêtres standard de hauteur jusqu à 1.45 m.',
  },
  box_165: {
    id: 'box_165',
    labelFr: 'Coffre Alu 165 mm (Polyvalent)',
    subFr: 'Hauteur 165 x Profondeur 165 mm',
    boxHeightMm: 165,
    boxDepthMm: 165,
    maxUsefulWindingDiameterMm: 152,
    availableAesthetics: ['pan_coupe_45', 'quart_de_rond', 'carre_droit'],
    descriptionFr: 'Format standard universel en Algérie convenant à la majorité des ouvertures de 1.80 m.',
  },
  box_180: {
    id: 'box_180',
    labelFr: 'Coffre Alu 180 mm (Portes-fenêtres)',
    subFr: 'Hauteur 180 x Profondeur 180 mm',
    boxHeightMm: 180,
    boxDepthMm: 180,
    maxUsefulWindingDiameterMm: 166,
    availableAesthetics: ['pan_coupe_45', 'quart_de_rond', 'carre_droit'],
    descriptionFr: 'Indispensable pour portes-fenêtres de 2.20 m avec lame de 43 ou 45 mm.',
  },
  box_205: {
    id: 'box_205',
    labelFr: 'Coffre Alu 205 mm (Grandes Baies)',
    subFr: 'Hauteur 205 x Profondeur 205 mm',
    boxHeightMm: 205,
    boxDepthMm: 205,
    maxUsefulWindingDiameterMm: 190,
    availableAesthetics: ['pan_coupe_45', 'quart_de_rond', 'carre_droit'],
    descriptionFr: 'Grand caisson pour baies vitrées de 2.80 m de haut ou lames de 55 mm.',
  },
  box_250: {
    id: 'box_250',
    labelFr: 'Coffre Alu 250 mm (Hauteur Maximale)',
    subFr: 'Hauteur 250 x Profondeur 250 mm',
    boxHeightMm: 250,
    boxDepthMm: 250,
    maxUsefulWindingDiameterMm: 232,
    availableAesthetics: ['pan_coupe_45', 'carre_droit'],
    descriptionFr: 'Pour très grands vitrages, rideaux de commerces et ateliers.',
  },
  box_tunnel_280: {
    id: 'box_tunnel_280',
    labelFr: 'Coffre Tunnel Maçonnerie (Intégré Gros Œuvre)',
    subFr: 'Réservation béton 280 mm sous linteau',
    boxHeightMm: 280,
    boxDepthMm: 280,
    maxUsefulWindingDiameterMm: 260,
    availableAesthetics: ['coffre_tunnel'],
    descriptionFr: 'Coffre invisible encastré dans la maçonnerie neuve avec sous-face PVC/alu démontable.',
  },
};

export interface WindingSpiralStep {
  layerIndex: number;
  layerDiameterMm: number;
  cumulativeCurtainLengthMm: number;
  layerSlatCount: number;
}

export interface WindingCalculationResult {
  apronHeightMm: number;
  apronWidthMm: number;
  totalSlatCount: number;
  securitySlatsInBox: number;
  woundRollDiameterMm: number;
  tubeDiameterMm: number;
  spiralLayersCount: number;
  spiralSteps: WindingSpiralStep[];
  selectedBoxData: ShutterBoxData;
  recommendedBoxModel: ShutterBoxModel;
  radialClearanceMm: number; // (UsefulBoxDia - WoundRollDia) / 2
  clearanceStatus: ClearanceStatus;
  statusBadgeFr: string;
  badgeBgClass: string;
  badgeTextClass: string;
  badgeBorderClass: string;
  curtainWeightKg: number;
  motorTorqueRequiredNm: number;
  recommendedMotorRatingNm: number;
  cutLengths: {
    slatCutLengthMm: number;
    finalBottomSlatLengthMm: number;
    octagonalTubeLengthMm: number;
    octagonalAxleLengthMm: number;
    guideRailsLengthMm: number;
  };
  workshopFabricationNotesFr: string[];
}

/**
 * Calculates roller shutter winding spiral diameter and verifies box clearance.
 */
export function calculateRollerShutterWinding(params: {
  widthMm: number;
  heightMm: number;
  slatModel: ShutterSlatModel;
  tubeModel: OctagonalTubeModel;
  boxModel: ShutterBoxModel;
  boxAesthetic: BoxAestheticProfile;
  guideChannelDepthMm?: number;
}): WindingCalculationResult {
  const slat = SLAT_MODELS[params.slatModel] || SLAT_MODELS.slat_alu_43;
  const tube = OCTAGONAL_TUBES[params.tubeModel] || OCTAGONAL_TUBES.octo_60;
  const selectedBox = SHUTTER_BOXES_CATALOG[params.boxModel] || SHUTTER_BOXES_CATALOG.box_165;
  const guideDepthMm = params.guideChannelDepthMm || 22;

  const apronHeightMm = params.heightMm;
  const apronWidthMm = params.widthMm;

  // Total slats count: height / pitch + 2 security slats staying in the box when down
  const securitySlatsInBox = 2;
  const visibleSlats = Math.ceil(apronHeightMm / slat.nominalPitchMm);
  const totalSlatCount = visibleSlats + securitySlatsInBox;
  const totalCurtainLengthMm = totalSlatCount * slat.nominalPitchMm;

  // Concentric spiral calculation
  // Initial core diameter includes tube and curtain attachment clips (~12 mm extra on radius)
  const initialCoreDiameterMm = tube.outerDiameterMm + 14;
  let currentDiameter = initialCoreDiameterMm;
  let woundLengthMm = 0;
  let layer = 0;
  const spiralSteps: WindingSpiralStep[] = [];

  while (woundLengthMm < totalCurtainLengthMm && layer < 25) {
    layer++;
    const perimeterMm = Math.PI * currentDiameter;
    const layerSlats = Math.max(1, Math.round(perimeterMm / slat.nominalPitchMm));
    woundLengthMm += perimeterMm;

    spiralSteps.push({
      layerIndex: layer,
      layerDiameterMm: Math.round(currentDiameter),
      cumulativeCurtainLengthMm: Math.round(woundLengthMm),
      layerSlatCount: layerSlats,
    });

    // Each new layer adds two times the apparent winding thickness of the slat
    currentDiameter += 2 * slat.apparentWindingThicknessMm;
  }

  const woundRollDiameterMm = Math.round(currentDiameter);

  // Radial clearance inside selected box
  const radialClearanceMm = Number(
    ((selectedBox.maxUsefulWindingDiameterMm - woundRollDiameterMm) / 2).toFixed(1)
  );

  // Clearance evaluation
  let clearanceStatus: ClearanceStatus = 'optimal';
  let statusBadgeFr = 'Coffre Parfaitement Dimensionné';
  let badgeBgClass = 'bg-emerald-500/10';
  let badgeTextClass = 'text-emerald-400';
  let badgeBorderClass = 'border-emerald-500/30';

  if (radialClearanceMm < 0) {
    clearanceStatus = 'oversized_block';
    statusBadgeFr = 'ERREUR : CAISSON TROP PETIT (Tablier Bloqué)';
    badgeBgClass = 'bg-rose-500/15';
    badgeTextClass = 'text-rose-400';
    badgeBorderClass = 'border-rose-500/40';
  } else if (radialClearanceMm < 6.0) {
    clearanceStatus = 'rubbing_risk';
    statusBadgeFr = 'Risque de Frottement (Jeu Périphérique < 6 mm)';
    badgeBgClass = 'bg-amber-500/15';
    badgeTextClass = 'text-amber-400';
    badgeBorderClass = 'border-amber-500/40';
  } else if (radialClearanceMm < 10.0) {
    clearanceStatus = 'acceptable';
    statusBadgeFr = 'Jeu Admissible (Vérifier Fins de Course)';
    badgeBgClass = 'bg-sky-500/15';
    badgeTextClass = 'text-sky-400';
    badgeBorderClass = 'border-sky-500/30';
  }

  // Recommended minimum box model
  let recommendedBoxModel: ShutterBoxModel = 'box_137';
  const boxCandidates: ShutterBoxModel[] = ['box_137', 'box_150', 'box_165', 'box_180', 'box_205', 'box_250'];
  for (const bId of boxCandidates) {
    const bSpec = SHUTTER_BOXES_CATALOG[bId];
    if (bSpec.maxUsefulWindingDiameterMm >= woundRollDiameterMm + 14) {
      recommendedBoxModel = bId;
      break;
    }
    recommendedBoxModel = 'box_250';
  }

  // Curtain weight & motor sizing
  const curtainAreaM2 = (apronWidthMm * apronHeightMm) / 1000000;
  const bottomSlatWeightKg = 0.8;
  const curtainWeightKg = Number((curtainAreaM2 * slat.weightKgPerM2 + bottomSlatWeightKg).toFixed(1));

  // Motor torque calculation: T = (M * g * R_wound) / eta (with eta = 0.70)
  const woundRadiusM = woundRollDiameterMm / 2000;
  const g = 9.81;
  const etaEfficiency = 0.70;
  const rawTorqueNm = (curtainWeightKg * g * woundRadiusM) / etaEfficiency;
  const motorTorqueRequiredNm = Number(rawTorqueNm.toFixed(1));

  let recommendedMotorRatingNm = 10;
  if (motorTorqueRequiredNm > 35) recommendedMotorRatingNm = 50;
  else if (motorTorqueRequiredNm > 25) recommendedMotorRatingNm = 40;
  else if (motorTorqueRequiredNm > 16) recommendedMotorRatingNm = 30;
  else if (motorTorqueRequiredNm > 10) recommendedMotorRatingNm = 20;
  else recommendedMotorRatingNm = 10;

  // Exact cut lengths for workshop fabrication
  const slatCutLengthMm = Math.max(100, apronWidthMm - 2 * guideDepthMm + 18);
  const finalBottomSlatLengthMm = slatCutLengthMm;
  const octagonalTubeLengthMm = Math.max(100, apronWidthMm - 55);
  const guideRailsLengthMm = Math.max(200, apronHeightMm - selectedBox.boxHeightMm);

  // Practical workshop recommendations
  const workshopFabricationNotesFr: string[] = [
    `Longueur de débit des lames : ${slatCutLengthMm} mm (pour tableau de ${apronWidthMm} mm avec pénétration de 9 mm par coulisse).`,
    `Longueur de débit de l axe octogonal ${tube.outerDiameterMm} mm : ${octagonalTubeLengthMm} mm (déduction des flasques et embout télescopique).`,
    `Longueur des coulisses : ${guideRailsLengthMm} mm avec fixation des tulipes d entrée au sommet.`,
  ];

  if (clearanceStatus === 'oversized_block') {
    workshopFabricationNotesFr.unshift(
      `ALERTE ATELIER : Le caisson ${selectedBox.labelFr} est trop petit pour cette hauteur. Remplacer impérativement par un coffre ${SHUTTER_BOXES_CATALOG[recommendedBoxModel].labelFr}.`
    );
  } else if (clearanceStatus === 'rubbing_risk') {
    workshopFabricationNotesFr.push(
      'Ajuster soigneusement la fixation des tulipes de guidage pour éviter que le tablier ne raye le thermolaquage de la trappe de visite.'
    );
  }

  if (apronWidthMm > 2400 && params.tubeModel === 'octo_40') {
    workshopFabricationNotesFr.push(
      'Largeur supérieure à 2.40 m : proscrire l axe octo 40 mm. Remplacer par un axe octo 60 ou 70 mm pour éviter la flèche centrale.'
    );
  }

  return {
    apronHeightMm,
    apronWidthMm,
    totalSlatCount,
    securitySlatsInBox,
    woundRollDiameterMm,
    tubeDiameterMm: tube.outerDiameterMm,
    spiralLayersCount: layer,
    spiralSteps,
    selectedBoxData: selectedBox,
    recommendedBoxModel,
    radialClearanceMm,
    clearanceStatus,
    statusBadgeFr,
    badgeBgClass,
    badgeTextClass,
    badgeBorderClass,
    curtainWeightKg,
    motorTorqueRequiredNm,
    recommendedMotorRatingNm,
    cutLengths: {
      slatCutLengthMm,
      finalBottomSlatLengthMm,
      octagonalTubeLengthMm,
      octagonalAxleLengthMm: octagonalTubeLengthMm,
      guideRailsLengthMm,
    },
    workshopFabricationNotesFr,
  };
}

/**
 * Formats WhatsApp dispatch for workshop glazier/fitter team.
 */
export function formatShutterWindingWhatsApp(
  result: WindingCalculationResult,
  slatLabelFr: string,
  windowRef: string = 'Baie Volet',
  workshopName: string = 'Baiti Atelier'
): string {
  const verdictEmoji = result.clearanceStatus === 'oversized_block' ? '🚨 COFFRE TROP PETIT' : '✅ CAISSON CONFORME';

  return `*${workshopName} - DIMENSIONNEMENT ENROULEMENT VOLET ROULANT*

📋 *Ouvrage:* ${windowRef} (${result.apronWidthMm} x ${result.apronHeightMm} mm)
🪟 *Lame:* ${slatLabelFr}
📦 *Coffre:* ${result.selectedBoxData.labelFr}
🔩 *Axe octogonal:* ${result.tubeDiameterMm} mm

📊 *RÉSULTATS D ENROULEMENT:*
• Diamètre d enroulement tablier : ${result.woundRollDiameterMm} mm
• Diamètre utile intérieur caisson : ${result.selectedBoxData.maxUsefulWindingDiameterMm} mm
• Garde au caisson (jeu radial) : ${result.radialClearanceMm} mm
• Nombre de spires enroulées : ${result.spiralLayersCount} tours (${result.totalSlatCount} lames au total)
• Poids total tablier : ${result.curtainWeightKg} kg
• Couple moteur requis : ${result.motorTorqueRequiredNm} Nm (Préconisation : ${result.recommendedMotorRatingNm} Nm)

⚖️ *VERDICT ENCOMBREMENT:* ${verdictEmoji}

📏 *FEUILLE DE DÉBIT ATELIER:*
• Débit lames (${result.totalSlatCount} pcs) : ${result.cutLengths.slatCutLengthMm} mm
• Débit axe octogonal : ${result.cutLengths.octagonalAxleLengthMm} mm
• Débit coulisses (2 pcs) : ${result.cutLengths.guideRailsLengthMm} mm

_Généré via Baiti Atelier - Calculateur d enroulement volet roulant_`;
}
