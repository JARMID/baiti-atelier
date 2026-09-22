import type { ShutterType, ShutterSlatType, ShutterBoxType } from '../types/window';

export interface ShutterMechanismSpec {
  id: ShutterType;
  labelFr: string;
  labelAr: string;
  labelEn: string;
  maneuverType: 'none' | 'manuel' | 'motorise';
  basePriceDzd: number;
  descriptionFr: string;
  recommendedUseFr: string;
}

export interface ShutterSlatSpec {
  id: ShutterSlatType;
  labelFr: string;
  labelAr: string;
  labelEn: string;
  pitchMm: number;
  thicknessMm: number;
  weightKgPerM2: number;
  surchargePerM2Dzd: number;
  materialFr: string;
  thermalDeltaR: number;
  securityLevelFr: string;
  descriptionFr: string;
}

export interface ShutterBoxSpec {
  id: ShutterBoxType;
  labelFr: string;
  labelAr?: string;
  labelEn?: string;
  boxHeightMm: number;
  boxDepthMm: number;
  maxCurtainHeightMm: number;
  installationType: 'monobloc_interieur' | 'renovation_exterieur';
  descriptionFr: string;
}

export interface ShutterBOMResult {
  slatCount: number;
  slatCutLengthMm: number;
  finalSlatLengthMm: number;
  guideRailsLengthMm: number;
  octagonalAxleLengthMm: number;
  curtainWeightKg: number;
  motorTorqueNm: number;
  lockingStrapsCount: number;
  totalPriceDzd: number;
}

export const SHUTTER_MECHANISMS: ShutterMechanismSpec[] = [
  {
    id: 'none',
    labelFr: 'Sans Volet Roulant',
    labelAr: 'بدون ستار دوار',
    labelEn: 'No Roller Shutter',
    maneuverType: 'none',
    basePriceDzd: 0,
    descriptionFr: 'Menuiserie nue sans système d occultation intégré.',
    recommendedUseFr: 'Fenêtres intérieures, couloirs, et pièces pourvues de volets extérieurs existants.',
  },
  {
    id: 'manual',
    labelFr: 'Volet Manuel à Sangle',
    labelAr: 'ستار يدوي بشريط سحب',
    labelEn: 'Manual Strap Shutter',
    maneuverType: 'manuel',
    basePriceDzd: 8500,
    descriptionFr: 'Boîtier enrouleur mural blanc avec sangle haute résistance et guide sangle étanche.',
    recommendedUseFr: 'Chambres d appoint et fenêtres de dimensions modérées (< 1.40m de large).',
  },
  {
    id: 'manual_crank',
    labelFr: 'Volet Manuel à Treuil & Manivelle',
    labelAr: 'ستار يدوي بذراع تدوير ومسنن',
    labelEn: 'Manual Crank & Winch Shutter',
    maneuverType: 'manuel',
    basePriceDzd: 12500,
    descriptionFr: 'Treuil démultiplié sous coffre avec tringle oscillante et poignée repliable en acier laqué.',
    recommendedUseFr: 'Manoeuvre souple pour baies moyennes sans installation de câblage électrique.',
  },
  {
    id: 'motorized',
    labelFr: 'Moteur Tubulaire Filaire (Interrupteur)',
    labelAr: 'محرك كهربائي سلكي بمفتاح جداري',
    labelEn: 'Wired Tubular Motor (Wall Switch)',
    maneuverType: 'motorise',
    basePriceDzd: 18500,
    descriptionFr: 'Moteur tubulaire intégré dans l axe octogonal avec réglage de fins de course et inverseur mural.',
    recommendedUseFr: 'Villas et appartements récents avec pré-câblage électrique 220V disponible.',
  },
  {
    id: 'motorized_radio',
    labelFr: 'Moteur Radio RTS (Télécommande Sans Fil)',
    labelAr: 'محرك لاسلكي مع جهاز تحكم عن بعد',
    labelEn: 'Radio RTS Motor (Remote Control)',
    maneuverType: 'motorise',
    basePriceDzd: 24500,
    descriptionFr: 'Motorisation radiofréquence 433 MHz avec télécommande individuelle ergonomique et programmation simplifiée.',
    recommendedUseFr: 'Grandes baies vitrées de séjour, suites parentales, et chantiers de prestige.',
  },
];

export const SHUTTER_SLATS: ShutterSlatSpec[] = [
  {
    id: 'alu_foam_43',
    labelFr: 'Aluminium Double Paroi 43mm (Mousse PU)',
    labelAr: 'ألومنيوم مزدوج 43 ملم معزول برغوة البوليوريثان',
    labelEn: 'Insulated Double Wall Alu 43mm (PU Foam)',
    pitchMm: 43,
    thicknessMm: 8.8,
    weightKgPerM2: 3.2,
    surchargePerM2Dzd: 0,
    materialFr: 'Alu thermolaqué + Mousse PU injectée haute densité 45 kg/m³',
    thermalDeltaR: 0.15,
    securityLevelFr: 'Confort & Isolation Phonique',
    descriptionFr: 'Lame aluminium la plus posée en Algérie, légère, isolante et indéformable à la chaleur estivale.',
  },
  {
    id: 'alu_extruded_45',
    labelFr: 'Aluminium Extrudé Renforcé 45mm (Haute Sécurité)',
    labelAr: 'ألومنيوم مقذوف مقوى 45 ملم عالي الأمان',
    labelEn: 'Extruded Reinforced Alu 45mm (High Security)',
    pitchMm: 45,
    thicknessMm: 9.5,
    weightKgPerM2: 7.6,
    surchargePerM2Dzd: 3800,
    materialFr: 'Alliage aluminium 6060 T5 extrudé pleine matière (sans mousse)',
    thermalDeltaR: 0.08,
    securityLevelFr: 'Anti-Effraction & Résistance au Vent Classe 4',
    descriptionFr: 'Profilé lourd rigide résistant aux tentatives de soulèvement et chocs violents en rez-de-chaussée.',
  },
  {
    id: 'pvc_cellular_40',
    labelFr: 'PVC Alvéolaire Multi-Chambres 40mm',
    labelAr: 'بي في سي خلوي خماسي الغرف 40 ملم اقتصادي',
    labelEn: 'Cellular Multi-Chamber PVC 40mm',
    pitchMm: 40,
    thicknessMm: 8.2,
    weightKgPerM2: 2.9,
    surchargePerM2Dzd: -800,
    materialFr: 'PVC extrudé rigide stabilisé UV sans plomb',
    thermalDeltaR: 0.18,
    securityLevelFr: 'Isolation Thermique Économique',
    descriptionFr: 'Lame PVC légère insensible à la corrosion marine, idéale pour les ouvertures de dimensions réduites.',
  },
];

export const SHUTTER_BOXES: ShutterBoxSpec[] = [
  {
    id: 'monobloc_165',
    labelFr: 'Coffre Monobloc Intérieur 165mm',
    boxHeightMm: 165,
    boxDepthMm: 165,
    maxCurtainHeightMm: 1600,
    installationType: 'monobloc_interieur',
    descriptionFr: 'Caisson compact clipsé solidaire sur le dormant de la fenêtre, sans débordement extérieur.',
  },
  {
    id: 'monobloc_200',
    labelFr: 'Coffre Monobloc Intérieur 200mm (Grandes Hauteurs)',
    boxHeightMm: 200,
    boxDepthMm: 200,
    maxCurtainHeightMm: 2600,
    installationType: 'monobloc_interieur',
    descriptionFr: 'Caisson à grand volume d enroulement adapté aux baies vitrées de 2.15m et grandes hauteurs.',
  },
  {
    id: 'renovation_45',
    labelFr: 'Coffre Rénovation Aluminium Extérieur Pan Coupé 45°',
    boxHeightMm: 180,
    boxDepthMm: 180,
    maxCurtainHeightMm: 2200,
    installationType: 'renovation_exterieur',
    descriptionFr: 'Pose sous linteau en rénovation avec caisson extérieur pan coupé maximisant la luminosité.',
  },
];

export function getShutterMechanismSpec(type: ShutterType): ShutterMechanismSpec {
  return SHUTTER_MECHANISMS.find((m) => m.id === type) || SHUTTER_MECHANISMS[0];
}

export function getShutterSlatSpec(type?: ShutterSlatType): ShutterSlatSpec {
  return SHUTTER_SLATS.find((s) => s.id === type) || SHUTTER_SLATS[0];
}

export function getShutterBoxSpec(type?: ShutterBoxType): ShutterBoxSpec {
  return SHUTTER_BOXES.find((b) => b.id === type) || SHUTTER_BOXES[0];
}

export function computeShutterBOM(
  widthMm: number,
  heightMm: number,
  shutterType: ShutterType,
  slatType?: ShutterSlatType,
  boxType?: ShutterBoxType
): ShutterBOMResult {
  if (shutterType === 'none') {
    return {
      slatCount: 0,
      slatCutLengthMm: 0,
      finalSlatLengthMm: 0,
      guideRailsLengthMm: 0,
      octagonalAxleLengthMm: 0,
      curtainWeightKg: 0,
      motorTorqueNm: 0,
      lockingStrapsCount: 0,
      totalPriceDzd: 0,
    };
  }

  const mech = getShutterMechanismSpec(shutterType);
  const slat = getShutterSlatSpec(slatType);
  const box = getShutterBoxSpec(boxType);

  const slatCutLengthMm = Math.max(200, widthMm - 65);
  const slatCount = Math.ceil(heightMm / slat.pitchMm) + 3;
  const finalSlatLengthMm = slatCutLengthMm;
  const guideRailsLengthMm = Math.max(300, heightMm - box.boxHeightMm);
  const octagonalAxleLengthMm = Math.max(200, widthMm - 45);

  const curtainAreaM2 = (widthMm / 1000) * (heightMm / 1000);
  const curtainWeightKg = Number((curtainAreaM2 * slat.weightKgPerM2).toFixed(1));

  let motorTorqueNm = 0;
  if (mech.maneuverType === 'motorise') {
    if (curtainWeightKg <= 12) motorTorqueNm = 10;
    else if (curtainWeightKg <= 20) motorTorqueNm = 15;
    else if (curtainWeightKg <= 30) motorTorqueNm = 20;
    else motorTorqueNm = 30;
  }

  const lockingStrapsCount = Math.max(2, Math.ceil(widthMm / 600));

  const basePrice = mech.basePriceDzd;
  const curtainPrice = curtainAreaM2 * (6500 + slat.surchargePerM2Dzd);
  const boxPrice = (widthMm / 1000) * 3800;
  const totalPriceDzd = Math.round(basePrice + curtainPrice + boxPrice);

  return {
    slatCount,
    slatCutLengthMm,
    finalSlatLengthMm,
    guideRailsLengthMm,
    octagonalAxleLengthMm,
    curtainWeightKg,
    motorTorqueNm,
    lockingStrapsCount,
    totalPriceDzd,
  };
}
