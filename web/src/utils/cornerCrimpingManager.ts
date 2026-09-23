/**
 * CORNER JOINT CRIMPING & MECHANICAL CORNER CLEAT PULL-OUT RESISTANCE AUDITOR
 * 
 * Normative Framework:
 * - NF P 20-302: Profilés en alliage d'aluminium - Spécifications des assemblages d'angle
 * - NF EN 12046-1 / NF EN 14608: Résistance aux charges verticales et affaissement des vantaux
 * - NF EN 1191: Fenêtres et portes - Résistance aux manœuvres répétées (20 000 cycles)
 * - NF EN 1999-1-1 (Eurocode 9): Calcul des structures en alliages d'aluminium
 * - Recommandations professionnelles SNFA: Conception et collage des onglets à 45°
 * - NF DTU 36.5: Tolérances de désaffleurement et étanchéité des équerrages
 */

export type CornerAssemblyMethod =
  | 'crimped_hydraulic'
  | 'pinned_spring_cleat'
  | 'screw_eccentric_cleat'
  | 'thermal_welded_pvc';

export type CleatMaterial =
  | 'extruded_alu_6063'
  | 'die_cast_alu'
  | 'die_cast_zamak'
  | 'stainless_steel';

export type AdhesiveType =
  | 'pu_two_component'
  | 'hybrid_polymer'
  | 'cyanoacrylate'
  | 'none_dry';

export interface CornerAssemblySpec {
  methodId: CornerAssemblyMethod;
  name: string;
  nominalShearStrengthMpa: number;
  setupComplexity: string;
  recommendedPunchPressureBar: number;
  description: string;
}

export const CORNER_ASSEMBLY_SPECS: Record<CornerAssemblyMethod, CornerAssemblySpec> = {
  crimped_hydraulic: {
    methodId: 'crimped_hydraulic',
    name: 'Sertissage Hydraulique / Pneumatique à Couteaux',
    nominalShearStrengthMpa: 160,
    setupComplexity: 'Presse à sertir d atelier (couteaux 45°)',
    recommendedPunchPressureBar: 95,
    description: 'Poinçonnement indémontable des parois d alu dans les gorges de l équerre. Rigidité maximale.',
  },
  pinned_spring_cleat: {
    methodId: 'pinned_spring_cleat',
    name: 'Équerre à Pions Clippants à Ressort',
    nominalShearStrengthMpa: 120,
    setupComplexity: 'Usinage trous sur poinçonneuse ou CNC',
    recommendedPunchPressureBar: 0,
    description: 'Encliquetage automatique des pions ressorts dans les lumières fraisées. Assemblage rapide.',
  },
  screw_eccentric_cleat: {
    methodId: 'screw_eccentric_cleat',
    name: 'Équerre Mécanique à Vis Excentrique ou Tirant',
    nominalShearStrengthMpa: 140,
    setupComplexity: 'Clé hexagonale ou dynamométrique',
    recommendedPunchPressureBar: 0,
    description: 'Serrage progressif par vis conique permettant un rattrapage d onglet parfait et démontable.',
  },
  thermal_welded_pvc: {
    methodId: 'thermal_welded_pvc',
    name: 'Soudure Thermique d Onglet 240°C (PVC)',
    nominalShearStrengthMpa: 45,
    setupComplexity: 'Soudeuse 4 têtes et ébavureuse CNC',
    recommendedPunchPressureBar: 0,
    description: 'Fusion moléculaire de la matière PVC avec ébavurage automatisé de la bavure extérieure.',
  },
};

export interface CleatMaterialSpec {
  materialId: CleatMaterial;
  name: string;
  yieldStrengthMpa: number;
  ultimateStrengthMpa: number;
  corrosionResistance: string;
}

export const CLEAT_MATERIAL_SPECS: Record<CleatMaterial, CleatMaterialSpec> = {
  extruded_alu_6063: {
    materialId: 'extruded_alu_6063',
    name: 'Aluminium Extrudé 6063-T6',
    yieldStrengthMpa: 170,
    ultimateStrengthMpa: 215,
    corrosionResistance: 'Excellente (compatibilité parfaite avec le profil)',
  },
  die_cast_alu: {
    materialId: 'die_cast_alu',
    name: 'Aluminium Matricé / Injecté',
    yieldStrengthMpa: 140,
    ultimateStrengthMpa: 180,
    corrosionResistance: 'Très bonne',
  },
  die_cast_zamak: {
    materialId: 'die_cast_zamak',
    name: 'Zamak 5 Moulé sous Pression',
    yieldStrengthMpa: 250,
    ultimateStrengthMpa: 310,
    corrosionResistance: 'Bonne (traitement bichromaté requis)',
  },
  stainless_steel: {
    materialId: 'stainless_steel',
    name: 'Acier Inoxydable A2 (Renfort)',
    yieldStrengthMpa: 450,
    ultimateStrengthMpa: 700,
    corrosionResistance: 'Maximale',
  },
};

export interface CornerCrimpingInput {
  sashWidthMm: number;
  sashHeightMm: number;
  profileDepthMm: number; // Profondeur profil (ex: 45, 50, 60, 67, 70 mm)
  profileWallThicknessMm: number; // Epaisseur de paroi alu (ex: 1.4, 1.6, 1.8, 2.0 mm)
  assemblyMethod: CornerAssemblyMethod;
  cleatMaterial: CleatMaterial;
  adhesiveType: AdhesiveType;
  crimpKnifeCount: number; // 2, 4 couteaux par angle
  knifePenetrationMm: number; // 1.2 a 1.8 mm
  glazingWeightKg: number; // Poids du verre (ex: 35 kg)
  hasAlignmentCleat: boolean; // Equerre d alignement exterieure inox
  wilayaName?: string;
  clientName?: string;
  windowReference?: string;
}

export interface CornerCrimpingResult {
  sashWidthMm: number;
  sashHeightMm: number;
  sashPerimeterM: number;
  totalSashWeightKg: number;
  assemblySpec: CornerAssemblySpec;
  materialSpec: CleatMaterialSpec;
  
  // Mechanical Forces & Bending (Eurocode 9 / NF EN 12046-1)
  accidentalVerticalLoadN: number; // 800 N norme
  cornerBendingMomentNm: number;
  cornerTorsionalMomentNm: number;
  pullOutForceActingN: number;
  ultimatePullOutResistanceN: number;
  safetyFactor: number;
  
  // Diagonal Deflection & Sagging
  diagonalRackingDeflectionMm: number;
  maxAllowableDeflectionMm: number;
  isDeflectionAcceptable: boolean;
  
  // Punch & Crimping Workshop Setup
  crimpContactAreaMm2: number;
  knifePenetrationMm: number;
  effectivePunchPressureBar: number;
  recommendedTighteningTorqueNm: number;
  adhesiveBondStrengthN: number;
  flushOffsetToleranceMm: number;
  
  // Compliance
  isResistanceCompliant: boolean;
  isPenetrationCompliant: boolean;
  isAlignmentCompliant: boolean;
  complianceStatus: 'CONFORME' | 'NON_CONFORME' | 'ATTENTION';
  recommendations: string[];
}

/**
 * Main Calculation Engine for Corner Cleats and Crimping Pull-Out Resistance
 */
export function computeCornerCrimpingAudit(input: CornerCrimpingInput): CornerCrimpingResult {
  const {
    sashWidthMm,
    sashHeightMm,
    profileDepthMm,
    profileWallThicknessMm,
    assemblyMethod,
    cleatMaterial,
    adhesiveType,
    crimpKnifeCount,
    knifePenetrationMm,
    glazingWeightKg,
    hasAlignmentCleat,
  } = input;

  const assemblySpec = CORNER_ASSEMBLY_SPECS[assemblyMethod];
  const materialSpec = CLEAT_MATERIAL_SPECS[cleatMaterial];

  const sashPerimeterM = Math.round(((2 * (sashWidthMm + sashHeightMm)) / 1000) * 100) / 100;

  // Sash weight: profile weight (~1.5 kg/m) + glass weight + hardware (3 kg)
  const profileWeightKg = sashPerimeterM * 1.5;
  const totalSashWeightKg = Math.round((profileWeightKg + glazingWeightKg + 3.0) * 10) / 10;

  // Accidental vertical service load according to NF EN 14608 / NF EN 12046-1:
  // Class 4 standard window requires resisting 800 N vertical sagging at handle edge
  const accidentalVerticalLoadN = 800; // N
  const totalVerticalForceN = Math.round(totalSashWeightKg * 9.81 + accidentalVerticalLoadN);

  // Bending moment in the bottom miter joint: M = F * (W / 2)
  const leverArmM = (sashWidthMm / 1000) * 0.5;
  const cornerBendingMomentNm = Math.round(totalVerticalForceN * leverArmM * 10) / 10;
  const cornerTorsionalMomentNm = Math.round((cornerBendingMomentNm * 0.35) * 10) / 10;

  // Corner Joint Depth Arm (distance between upper and lower crimp or contact edges)
  const internalArmMm = Math.max(25, profileDepthMm - 15);
  const pullOutForceActingN = Math.round((cornerBendingMomentNm / (internalArmMm / 1000)) * 10) / 10;

  // Crimp Punch Contact Area: b_knife (typically 5 mm) * knifePenetrationMm * crimpKnifeCount
  const knifeWidthMm = 5.0;
  const crimpContactAreaMm2 = Math.round(knifeWidthMm * knifePenetrationMm * crimpKnifeCount * 10) / 10;

  // Resistance Calculation (Eurocode 9 NF EN 1999-1-1)
  // Base shear resistance of aluminum wall punched into cleat
  const fvProfileMpa = profileWallThicknessMm * 85; // Shear resistance
  let mechanicalResistanceN = 0;

  if (assemblyMethod === 'crimped_hydraulic') {
    // Punch shear: Area * f_v * cleat factor
    mechanicalResistanceN = crimpContactAreaMm2 * fvProfileMpa * 0.75;
  } else if (assemblyMethod === 'pinned_spring_cleat') {
    // Pin shear: 2 pins of diameter 8 mm
    const pinAreaMm2 = 2 * Math.PI * Math.pow(4, 2);
    mechanicalResistanceN = pinAreaMm2 * (materialSpec.yieldStrengthMpa * 0.6);
  } else if (assemblyMethod === 'screw_eccentric_cleat') {
    // Screw tension: M6 bolt grade 8.8
    const boltCoreAreaMm2 = 20.1;
    mechanicalResistanceN = boltCoreAreaMm2 * 450;
  } else {
    // PVC Welded corner: weld miter area ~ profileDepth * wall * 4 * weld strength
    mechanicalResistanceN = profileDepthMm * profileWallThicknessMm * 4 * 35;
  }

  // Adhesive Bond Contribution (PU bi-composant adds massive joint rigidity)
  let adhesiveBondStrengthN = 0;
  if (adhesiveType === 'pu_two_component') {
    // Adhesive contact area inside cleat chambers ~ 1500 mm2, shear strength ~ 8 MPa
    adhesiveBondStrengthN = 1500 * 8.0 * 0.45; // with safety factor ~ 5400 N
  } else if (adhesiveType === 'hybrid_polymer') {
    adhesiveBondStrengthN = 1200 * 4.0 * 0.45;
  } else if (adhesiveType === 'cyanoacrylate') {
    adhesiveBondStrengthN = 600 * 2.5 * 0.45;
  }

  const ultimatePullOutResistanceN = Math.round(mechanicalResistanceN + adhesiveBondStrengthN);
  const safetyFactor = pullOutForceActingN > 0
    ? Math.round((ultimatePullOutResistanceN / pullOutForceActingN) * 100) / 100
    : 10.0;

  // Diagonal Racking Deflection (NF EN 14608)
  // Delta_diag = F * L^3 / (3 * E * I_eff)
  // Acceptable limit: min(L/500, 2.0 mm)
  const maxAllowableDeflectionMm = Math.round(Math.min((sashHeightMm / 500), 2.0) * 10) / 10;
  const jointFlexibilityFactor = adhesiveType === 'pu_two_component' ? 0.35 : 0.85;
  const diagonalRackingDeflectionMm = Math.round(((pullOutForceActingN / 5000) * jointFlexibilityFactor) * 100) / 100;
  const isDeflectionAcceptable = diagonalRackingDeflectionMm <= maxAllowableDeflectionMm;

  // Punch Pressure & Tightening Torques
  let effectivePunchPressureBar = assemblySpec.recommendedPunchPressureBar;
  if (profileWallThicknessMm > 1.8) {
    effectivePunchPressureBar = Math.min(130, Math.round(effectivePunchPressureBar * 1.15));
  }

  const recommendedTighteningTorqueNm = assemblyMethod === 'screw_eccentric_cleat' ? 9.5 : 0;
  const flushOffsetToleranceMm = hasAlignmentCleat ? 0.10 : 0.35; // NF DTU 36.5 specifies <= 0.20 mm

  // Compliance Flags
  const isResistanceCompliant = safetyFactor >= 1.5;
  const isPenetrationCompliant = knifePenetrationMm >= 1.2 && knifePenetrationMm <= 1.8;
  const isAlignmentCompliant = hasAlignmentCleat || flushOffsetToleranceMm <= 0.20;

  let complianceStatus: 'CONFORME' | 'NON_CONFORME' | 'ATTENTION' = 'CONFORME';
  if (!isResistanceCompliant || !isDeflectionAcceptable) {
    complianceStatus = 'NON_CONFORME';
  } else if (!isAlignmentCompliant || adhesiveType === 'none_dry' || !isPenetrationCompliant) {
    complianceStatus = 'ATTENTION';
  }

  // Recommendations construction
  const recommendations: string[] = [];
  if (!isResistanceCompliant) {
    recommendations.push(
      `Facteur de sécurité insuffisant (${safetyFactor} < 1.5). Augmenter la pénétration des couteaux ou utiliser une équerre en aluminium extrudé 6063-T6 avec colle PU.`
    );
  }
  if (!isDeflectionAcceptable) {
    recommendations.push(
      `Affaissement diagonal excessif (${diagonalRackingDeflectionMm} mm > ${maxAllowableDeflectionMm} mm). Injecter impérativement de la colle d'onglet PU bi-composant.`
    );
  }
  if (!hasAlignmentCleat) {
    recommendations.push(
      'Absence d équerre d alignement extérieure: Risque de désaffleurement de l onglet (> 0.2 mm). Monter une équerre inox à clipper en feuillure.'
    );
  }
  if (adhesiveType === 'none_dry') {
    recommendations.push(
      'Assemblage à sec sans colle d onglet déconseillé: Risque d infiltration d eau aux onglets à 45° et de corrosion filiforme des coupes.'
    );
  }
  if (knifePenetrationMm < 1.2 && assemblyMethod === 'crimped_hydraulic') {
    recommendations.push(
      `Pénétration des couteaux (${knifePenetrationMm} mm) trop faible. Régler la course des vérins de sertissage entre 1.4 et 1.6 mm.`
    );
  }
  if (complianceStatus === 'CONFORME') {
    recommendations.push(
      `Assemblage d onglet d angle rigide et étanche. Résistance à l arrachement validée (${ultimatePullOutResistanceN} N) avec coef. de sécurité ${safetyFactor}.`
    );
  }

  return {
    sashWidthMm,
    sashHeightMm,
    sashPerimeterM,
    totalSashWeightKg,
    assemblySpec,
    materialSpec,
    accidentalVerticalLoadN,
    cornerBendingMomentNm,
    cornerTorsionalMomentNm,
    pullOutForceActingN,
    ultimatePullOutResistanceN,
    safetyFactor,
    diagonalRackingDeflectionMm,
    maxAllowableDeflectionMm,
    isDeflectionAcceptable,
    crimpContactAreaMm2,
    knifePenetrationMm,
    effectivePunchPressureBar,
    recommendedTighteningTorqueNm,
    adhesiveBondStrengthN,
    flushOffsetToleranceMm,
    isResistanceCompliant,
    isPenetrationCompliant,
    isAlignmentCompliant,
    complianceStatus,
    recommendations,
  };
}
