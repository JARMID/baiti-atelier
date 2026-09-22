export type MotorWiringType = 'filaire_4fils' | 'radio_3fils';
export type MotorBrand = 'somfy' | 'becker' | 'nice' | 'acm_universel';

export interface WireConductor {
  colorNameFr: string;
  hexColor: string;
  roleFr: string;
  terminalCode: string;
  notesFr: string;
}

export interface MotorWiringScheme {
  wiringType: MotorWiringType;
  titleFr: string;
  descriptionFr: string;
  conductors: WireConductor[];
  switchConnectionFr: string;
  electricalProtectionFr: string;
  inversionTipFr: string;
}

export interface MotorTorqueCalculationResult {
  curtainAreaM2: number;
  curtainWeightKg: number;
  calculatedTorqueNm: number;
  recommendedMotorNm: number;
  tubeDiameterMm: number;
  maxCurtainWeightKg: number;
  motorCommercialLabelFr: string;
  sonelgazStandardFr: string;
}

export interface LimitSwitchGuide {
  brand: MotorBrand;
  brandName: string;
  technology: 'vis_mecanique' | 'bouton_poussoir' | 'radio_automatique';
  toolNeededFr: string;
  upAdjustmentFr: string;
  downAdjustmentFr: string;
  instructions: string[];
}

export interface TroubleshootingDiagnostic {
  symptomFr: string;
  causeFr: string;
  solutionFr: string;
}

// 1. Calculate Motor Torque (Nm) based on physical apron weight & tube radius
export function calculateShutterMotorTorque(
  widthMm: number,
  heightMm: number,
  slatWeightKgPerM2 = 4.2, // standard double-wall aluminum foam slat 43mm
  tubeDiameterMm = 60 // standard octagonal tube 60mm
): MotorTorqueCalculationResult {
  const widthM = widthMm / 1000;
  const heightM = heightMm / 1000;
  const areaM2 = Math.round(widthM * heightM * 100) / 100;

  // Total apron weight + bottom slat (lame finale filante extrudée) + 1.25 friction safety margin
  const baseWeightKg = areaM2 * slatWeightKgPerM2;
  const bottomSlatWeightKg = widthM * 0.8;
  const totalWeightKg = Math.round((baseWeightKg + bottomSlatWeightKg) * 10) / 10;

  // Physics calculation:
  // Torque (Nm) = (Total Weight (kg) * 9.81 * Tube Radius (m) * Friction Factor) / Transmission Efficiency
  // For tube Ø60 mm: Radius = 0.03 m
  // Friction factor in guides = 1.30, Efficiency = 0.85
  const tubeRadiusM = (tubeDiameterMm / 2) / 1000;
  const rawTorque = (totalWeightKg * 9.81 * tubeRadiusM * 1.3) / 0.85;
  const calculatedTorqueNm = Math.round(rawTorque * 10) / 10;

  // Commercial sizing standard (10, 15, 20, 30, 40, 50, 80 Nm)
  let recommendedMotorNm = 10;
  let maxWeightKg = 16;
  let label = 'Moteur Tubulaire 10 Nm (Fenêtre standard)';

  if (calculatedTorqueNm > 40) {
    recommendedMotorNm = 50;
    maxWeightKg = 85;
    label = 'Moteur Puissant 50 Nm (Grande baie vitrée / Rideau)';
  } else if (calculatedTorqueNm > 25) {
    recommendedMotorNm = 40;
    maxWeightKg = 65;
    label = 'Moteur Renforcé 40 Nm (Baie coulissante 3m+)';
  } else if (calculatedTorqueNm > 16) {
    recommendedMotorNm = 30;
    maxWeightKg = 48;
    label = 'Moteur Standard 30 Nm (Baie vitrée 2 vantaux)';
  } else if (calculatedTorqueNm > 11) {
    recommendedMotorNm = 20;
    maxWeightKg = 32;
    label = 'Moteur Moyen 20 Nm (Grande fenêtre / Porte-fenêtre)';
  } else if (calculatedTorqueNm > 8) {
    recommendedMotorNm = 15;
    maxWeightKg = 24;
    label = 'Moteur 15 Nm (Fenêtre 2 vantaux 140x140)';
  }

  return {
    curtainAreaM2: areaM2,
    curtainWeightKg: totalWeightKg,
    calculatedTorqueNm,
    recommendedMotorNm,
    tubeDiameterMm,
    maxCurtainWeightKg: maxWeightKg,
    motorCommercialLabelFr: label,
    sonelgazStandardFr: 'Raccordement monophasé 230V 50Hz • Protection disjoncteur 10A ou 16A',
  };
}

// 2. Wiring Schemes (Filaire 4 fils vs Radio RTS 3 fils)
export function getMotorWiringScheme(wiringType: MotorWiringType): MotorWiringScheme {
  if (wiringType === 'radio_3fils') {
    return {
      wiringType: 'radio_3fils',
      titleFr: 'Câblage Moteur Radio avec Télécommande (3 Conducteurs)',
      descriptionFr:
        'Alimentation 230V directe et continue. La platine électronique et le récepteur radio HF (433.42 MHz / 868 MHz) sont intégrés dans la tête du moteur tubulaire.',
      conductors: [
        {
          colorNameFr: 'Bleu',
          hexColor: '#2563EB',
          roleFr: 'Neutre (N) permanent',
          terminalCode: 'N',
          notesFr: 'Raccordé directement au neutre du circuit 230V du coffret ou boîte de dérivation.',
        },
        {
          colorNameFr: 'Marron',
          hexColor: '#78350F',
          roleFr: 'Phase permanente 230V',
          terminalCode: 'L',
          notesFr: 'Alimentation phase continue (sans interrupteur mécanique coupant la phase).',
        },
        {
          colorNameFr: 'Vert / Jaune',
          hexColor: '#65A30D',
          roleFr: 'Terre équipotentielle (PE)',
          terminalCode: 'PE / ⏚',
          notesFr: 'Obligatoire sur tube métallique et carcasse aluminium selon norme de sécurité.',
        },
      ],
      switchConnectionFr:
        'Pas d inverseur filaire mural nécessaire. Commande directe par émetteur radio portable (télécommande 1 canal ou multicanaux) ou bouton mural sans fil RTS.',
      electricalProtectionFr:
        'Disjoncteur divisionnaire 10A ou 16A courbe C, protégé par un interrupteur différentiel 30mA type AC ou A.',
      inversionTipFr:
        'Si le sens de rotation est inversé lors de l appairage initial, maintenir enfoncées les touches Montée et Descente simultanément sur la télécommande, puis appuyer brièvement sur la touche Prog.',
    };
  }

  // Filaire 4 fils standard
  return {
    wiringType: 'filaire_4fils',
    titleFr: 'Câblage Moteur Filaire avec Inverseur Mural (4 Conducteurs)',
    descriptionFr:
      'Alimentation commutable par un interrupteur inverseur à double contact (Montée / Descente). Le neutre est commun et la commande alterne la phase vers le sens désiré.',
    conductors: [
      {
        colorNameFr: 'Bleu',
        hexColor: '#2563EB',
        roleFr: 'Neutre (Commun moteur)',
        terminalCode: 'N (Bleu)',
        notesFr: 'Raccordé directement au neutre du réseau 230V.',
      },
      {
        colorNameFr: 'Marron',
        hexColor: '#78350F',
        roleFr: 'Phase Sens 1 (Montée standard)',
        terminalCode: 'Borne ▲ (1)',
        notesFr: 'Raccordé à la sortie Montée de l inverseur mural.',
      },
      {
        colorNameFr: 'Noir',
        hexColor: '#18181B',
        roleFr: 'Phase Sens 2 (Descente standard)',
        terminalCode: 'Borne ▼ (2)',
        notesFr: 'Raccordé à la sortie Descente de l inverseur mural.',
      },
      {
        colorNameFr: 'Vert / Jaune',
        hexColor: '#65A30D',
        roleFr: 'Terre équipotentielle (PE)',
        terminalCode: 'PE / ⏚',
        notesFr: 'Raccordé à la terre du réseau électrique du bâtiment.',
      },
    ],
    switchConnectionFr:
      'Inverseur de volet roulant bipolaire à position fixe ou impulsionnelle (Legrand, Schneider, Gewiss, Vimar). La phase d alimentation secteur (rouge ou marron de l installation) arrive sur la borne L ou P de l inverseur.',
    electricalProtectionFr:
      'Interdiction absolue d alimenter simultanément le fil marron et le fil noir (risque de griller le bobinage du moteur). Utiliser exclusivement des inverseurs mécaniquement verrouillés.',
    inversionTipFr:
      'Si le moteur descend lorsque vous appuyez sur Montée, couper le disjoncteur et intervertir le fil marron et le fil noir sur les bornes 1 et 2 de l inverseur mural.',
  };
}

// 3. Limit Switch Calibration Guides per Brand
export const MOTOR_LIMIT_GUIDES: Record<MotorBrand, LimitSwitchGuide> = {
  somfy: {
    brand: 'somfy',
    brandName: 'Somfy (LT50 / Jet / Meteor / Ilmo / Oximo)',
    technology: 'bouton_poussoir',
    toolNeededFr: 'Doigt ou tournevis plat pour enfoncer les poussoirs de tête',
    upAdjustmentFr: 'Poussoir blanc ou jaune repéré flèche haute',
    downAdjustmentFr: 'Poussoir blanc ou jaune repéré flèche basse',
    instructions: [
      'Positionner le volet au milieu de sa course.',
      'Enfoncer les deux boutons poussoirs sur la tête du moteur (les boutons restent cliqués au fond).',
      'Faire monter le volet jusqu à la hauteur souhaitée en butée haute, puis relâcher la commande.',
      'Appuyer une fois sur le bouton poussoir correspondant à la montée pour verrouiller la fin de course haute.',
      'Faire descendre le volet jusqu au niveau bas souhaité (lames complètement occultées au seuil).',
      'Appuyer sur le second bouton poussoir pour verrouiller la fin de course basse. Réaliser un cycle complet de test.',
    ],
  },
  becker: {
    brand: 'becker',
    brandName: 'Becker (Série R / Tubulaire Allemand)',
    technology: 'vis_mecanique',
    toolNeededFr: 'Clé Allen six pans 4mm ou molette manuelle',
    upAdjustmentFr: 'Vis supérieure repérée (+) et (-)',
    downAdjustmentFr: 'Vis inférieure repérée (+) et (-)',
    instructions: [
      'Pour augmenter la hauteur de levée du volet en haut : tourner la vis haute dans le sens (+). Chaque tour de vis ajoute environ 3 cm de course.',
      'Pour réduire la hauteur de montée : tourner dans le sens (-).',
      'Pour la butée basse : tourner la vis basse dans le sens (+) pour faire descendre le volet plus bas, ou (-) s il force sur le seuil.',
      'Ne jamais utiliser de visseuse électrique rapide sur les vis de fin de course sous peine de casser la pignonnerie plastique interne.',
    ],
  },
  nice: {
    brand: 'nice',
    brandName: 'Nice (Era M / Neo M / For-Max)',
    technology: 'vis_mecanique',
    toolNeededFr: 'Tournevis de réglage Nice fourni ou clé Allen 4mm',
    upAdjustmentFr: 'Vis 1 marquée ▲',
    downAdjustmentFr: 'Vis 2 marquée ▼',
    instructions: [
      'Identifier le sens d enroulement du tablier (sous-linteau intérieur ou façade extérieure).',
      'Faire tourner la vis ▲ vers le signe (+) pour monter plus haut.',
      'Faire tourner la vis ▼ vers le signe (+) pour allonger la descente jusqu au verrouillage des verrous ClickSur.',
      'Contrôler que les attaches rigides de sécurité ne sont pas soumises à une surtension excessive une fois le tablier posé.',
    ],
  },
  acm_universel: {
    brand: 'acm_universel',
    brandName: 'ACM Titan / Moteur Universel Import Algérie',
    technology: 'vis_mecanique',
    toolNeededFr: 'Tige hexagonale plastique blanche ou clé Allen 4mm',
    upAdjustmentFr: 'Vis supérieure à tête hexagonale',
    downAdjustmentFr: 'Vis inférieure à tête hexagonale',
    instructions: [
      'Amener le volet à 20 cm de sa butée haute pour tester le sens de la vis.',
      'Tourner la vis supérieure : si le volet monte davantage, vous êtes sur la fin de course haute.',
      'Ajuster la butée basse pour que les ajours des lames soient bien fermés sans que le tube continue de forcer.',
      'Vérifier que le condensateur permanent (4µF ou 5µF) est bien calé sans écrasement dans le coffre.',
    ],
  },
};

// 4. Common Troubleshooting in Field Installation
export const SHUTTER_TROUBLESHOOTING_LIST: TroubleshootingDiagnostic[] = [
  {
    symptomFr: 'Le moteur s arrête net après 3 à 4 manœuvres consécutives et ne répond plus',
    causeFr:
      'Déclenchement normal de la sonde de sécurité thermique interne (Klixon à 140°C) suite à des allers-retours répétés lors des réglages.',
    solutionFr:
      'Le moteur n est pas grillé. Patienter 15 à 20 minutes que le carter refroidisse. La sonde se réenclenchera automatiquement.',
  },
  {
    symptomFr: 'Le moteur grogne ou bourdonne sans réussir à soulever le tablier',
    causeFr:
      'Condensateur permanent de déphasage usé ou défaillant (courant sur les moteurs de plus de 4 ans), ou tablier bloqué dans les coulisses.',
    solutionFr:
      'Remplacer le condensateur tubulaire (généralement 3.5µF à 5µF 450V à cosses, coût 400 à 700 DZD chez les fournisseurs de pièces électriques). Vérifier le jeu de dilatation des lames dans les coulisses (minimum 10 mm de jeu total).',
  },
  {
    symptomFr: 'La commande Montée fait descendre le tablier, et Descente le fait monter',
    causeFr:
      'Inversion des deux phases de manœuvre sur l inverseur mural.',
    solutionFr:
      'Couper impérativement le courant au disjoncteur général, ouvrir le boîtier mural, et intervertir le fil marron et le fil noir sur les bornes 1 et 2.',
  },
  {
    symptomFr: 'Le volet descend de travers ou les lames se décalent sur un côté',
    causeFr:
      'Lames non agrafées (embouts de lames latéraux absents ou cassés) ou axe octogonal non horizontal de niveau.',
    solutionFr:
      'Vérifier le niveau à bulle sur le tube octogonal. Réaligner les lames et clipser des embouts de guidage en nylon sur les côtés pour éviter le glissement latéral.',
  },
  {
    symptomFr: 'Le moteur tourne en continu même une fois le tablier complètement relevé',
    causeFr:
      'Fin de course haute déréglée ou sautée lors du transport.',
    solutionFr:
      'Couper immédiatement l interrupteur pour éviter d arracher les verrous de sécurité ou d aspirer le tablier dans le coffre. Réinitialiser la fin de course selon le guide de la marque.',
  },
];

// 5. WhatsApp Electrician Guide Dispatch Formatter
export function formatShutterElectricianWhatsAppMessage(
  windowDimensions: { width: number; height: number },
  torqueResult: MotorTorqueCalculationResult,
  wiringType: MotorWiringType,
  brand: MotorBrand
): string {
  const scheme = getMotorWiringScheme(wiringType);
  const guide = MOTOR_LIMIT_GUIDES[brand];

  let msg = `*FICHE TECHNIQUE RACCORDEMENT MOTEUR VOLET ROULANT*\n`;
  msg += `Dimensions Châssis : Largeur ${windowDimensions.width} mm × Hauteur ${windowDimensions.height} mm\n`;
  msg += `Surface Tablier : ${torqueResult.curtainAreaM2} m² • Poids Estimé : ${torqueResult.curtainWeightKg} kg\n`;
  msg += `Tube Octogonal : Ø${torqueResult.tubeDiameterMm} mm\n`;
  msg += `Couple Calculé : *${torqueResult.calculatedTorqueNm} Nm* → Préconisation : *${torqueResult.recommendedMotorNm} Nm*\n\n`;

  msg += `*SCHÉMA CÂBLAGE 230V (${wiringType === 'filaire_4fils' ? 'Filaire 4 fils' : 'Radio 3 fils'}) :*\n`;
  scheme.conductors.forEach((c) => {
    msg += `• Fil ${c.colorNameFr} : ${c.roleFr} (${c.terminalCode})\n`;
  });

  msg += `\n*RÉGLAGE FINS DE COURSE (${guide.brandName}) :*\n`;
  msg += `• Outil : ${guide.toolNeededFr}\n`;
  msg += `• Butée Haute : ${guide.upAdjustmentFr}\n`;
  msg += `• Butée Basse : ${guide.downAdjustmentFr}\n\n`;

  msg += `*RÈGLE DE SÉCURITÉ :*\n`;
  msg += `En cas d arrêt inopiné lors des essais, ne pas forcer : coupure thermique automatique active pendant 15 minutes.\n`;
  msg += `Baiti Atelier Assistance Technique Poseurs & Électriciens`;

  return msg;
}
