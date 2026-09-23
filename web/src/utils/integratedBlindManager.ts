/**
 * INTEGRATED BLIND IN INSULATED GLAZING (STORE INTEGRE DANS DOUBLE VITRAGE)
 * 
 * Normative Framework:
 * - NF EN 1279-1 a 6: Vitrage isolant (Permeabilite a l'humidite, taux de fuite d'argon <= 1%/an)
 * - NF DTU 39 P1-1 et P4: Travaux de miroiterie et vitrages specifiques
 * - Cahier CSTB 3677: Vitrages isolants avec stores integres motorises ou manuels
 * - NF EN 13363-1 / NF EN ISO 52022-1: Dispositifs de protection solaire combines avec des vitrages (gtot, Tau_v)
 * - DTR C3-2 / RE 2020: Confort d'ete et facteur solaire maximal admissible
 */

export type BlindType =
  | 'venetian_12_5'
  | 'venetian_16'
  | 'pleated_single'
  | 'cellular_blackout'
  | 'roller_soltis';

export type ActuationMode =
  | 'magnetic_slider'
  | 'magnetic_cord'
  | 'motorized_24v_wired'
  | 'motorized_solar_battery';

export type SlatOrientation = 'retracted' | 'horizontal_0' | 'tilted_45' | 'closed_75';

export interface BlindTypeSpec {
  id: BlindType;
  name: string;
  category: 'venetian' | 'pleated' | 'cellular' | 'roller';
  minCavityWidthMm: number;
  recommendedCavityMm: number;
  slatWidthMm: number;
  slatMaterial: string;
  weightPerM2Kg: number;
  minWidthMm: number;
  maxWidthMm: number;
  minHeightMm: number;
  maxHeightMm: number;
  maxAreaM2: number;
  description: string;
}

export const BLIND_TYPE_SPECS: Record<BlindType, BlindTypeSpec> = {
  venetian_12_5: {
    id: 'venetian_12_5',
    name: 'Micro-Lamelles Alu 12.5 mm',
    category: 'venetian',
    minCavityWidthMm: 20,
    recommendedCavityMm: 22,
    slatWidthMm: 12.5,
    slatMaterial: 'Alliage aluminium 6063-T6 thermo-laque',
    weightPerM2Kg: 0.35,
    minWidthMm: 300,
    maxWidthMm: 2000,
    minHeightMm: 400,
    maxHeightMm: 2600,
    maxAreaM2: 3.5,
    description: 'Lamelles compactes adaptees aux cavites etroites de 20 a 22 mm, relevables et orientables.',
  },
  venetian_16: {
    id: 'venetian_16',
    name: 'Lamelles Vénitiennes Alu 16 mm (ScreenLine)',
    category: 'venetian',
    minCavityWidthMm: 27,
    recommendedCavityMm: 27,
    slatWidthMm: 16.0,
    slatMaterial: 'Aluminium ressort specifique anti-decoloration',
    weightPerM2Kg: 0.42,
    minWidthMm: 350,
    maxWidthMm: 2500,
    minHeightMm: 400,
    maxHeightMm: 3000,
    maxAreaM2: 5.0,
    description: 'Standard de reference ScreenLine pour cavite de 27 mm, rigidite superieure et guidage lateral.',
  },
  pleated_single: {
    id: 'pleated_single',
    name: 'Store Plisse Filtrant Tissu Technique',
    category: 'pleated',
    minCavityWidthMm: 20,
    recommendedCavityMm: 22,
    slatWidthMm: 15.0,
    slatMaterial: 'Polyester technique anti-statique anti-UV',
    weightPerM2Kg: 0.28,
    minWidthMm: 300,
    maxWidthMm: 2000,
    minHeightMm: 400,
    maxHeightMm: 2400,
    maxAreaM2: 3.0,
    description: 'Diffusion douce de la lumiere sans eblouissement, traitement anti-poussiere hermetique.',
  },
  cellular_blackout: {
    id: 'cellular_blackout',
    name: 'Store Alveolaire Occultant Duette (Nid d\'Abeilles)',
    category: 'cellular',
    minCavityWidthMm: 27,
    recommendedCavityMm: 27,
    slatWidthMm: 20.0,
    slatMaterial: 'Double alvéole polyester avec film aluminium intérieur',
    weightPerM2Kg: 0.45,
    minWidthMm: 350,
    maxWidthMm: 2200,
    minHeightMm: 400,
    maxHeightMm: 2800,
    maxAreaM2: 4.5,
    description: 'Occultation totale a 99% et isolation thermique renforcee grace a l\'air piege dans les cellules.',
  },
  roller_soltis: {
    id: 'roller_soltis',
    name: 'Toile Enrouleur Microperforee Soltis 92',
    category: 'roller',
    minCavityWidthMm: 27,
    recommendedCavityMm: 32,
    slatWidthMm: 0,
    slatMaterial: 'Composite Serge Ferrari Soltis micro-aeré',
    weightPerM2Kg: 0.50,
    minWidthMm: 400,
    maxWidthMm: 2400,
    minHeightMm: 500,
    maxHeightMm: 2800,
    maxAreaM2: 4.0,
    description: 'Protection thermique maximale tout en conservant la vue vers l\'exterieur, cavite 27 ou 32 mm.',
  },
};

export interface ActuationSpec {
  id: ActuationMode;
  name: string;
  maxAreaM2: number;
  maintenanceType: string;
  powerSupply: string;
  description: string;
}

export const ACTUATION_SPECS: Record<ActuationMode, ActuationSpec> = {
  magnetic_slider: {
    id: 'magnetic_slider',
    name: 'Curseur Magnétique Frontal (Manuel)',
    maxAreaM2: 2.5,
    maintenanceType: 'Nulle (aimants neodyme permanents scellés)',
    powerSupply: 'Aucune alimentation electrique requise',
    description: 'Transmission de mouvement a travers le verre par couplage magnetique frontal sans traversee mecanique.',
  },
  magnetic_cord: {
    id: 'magnetic_cord',
    name: 'Boîtier Magnétique à Cordon Sans Fin (Manuel)',
    maxAreaM2: 4.0,
    maintenanceType: 'Cordon textile amovible remplaçable sans desceller le vitrage',
    powerSupply: 'Aucune alimentation electrique requise',
    description: 'Boitier amovible applique sur le vitrage avec boucle textile continue pour relever les stores de moyenne surface.',
  },
  motorized_24v_wired: {
    id: 'motorized_24v_wired',
    name: 'Moteur Interne 24V DC Filaire (Domotique / GTC)',
    maxAreaM2: 6.0,
    maintenanceType: 'Moteur brushless scellé longue duree (20 000 cycles)',
    powerSupply: '24 V DC externe via traversée hermétique brevetée',
    description: 'Integration complete dans la feuillure, raccordable aux automatismes domotiques Somfy, KNX ou DALI.',
  },
  motorized_solar_battery: {
    id: 'motorized_solar_battery',
    name: 'Moteur Autonome Photovoltaïque avec Batterie Lithium',
    maxAreaM2: 4.5,
    maintenanceType: 'Batterie rechargeable par micro-cellule solaire exterieure',
    powerSupply: 'Panneau solaire applique sur verre exterieur + batterie integree',
    description: 'Solution sans passage de cables parfaite pour la renovation, pilotage par telecommande radio.',
  },
};

export interface IntegratedBlindInput {
  widthMm: number;
  heightMm: number;
  blindType: BlindType;
  actuationMode: ActuationMode;
  orientation: SlatOrientation;
  cavityWidthMm: number; // 20, 22, 27, 29, 32
  glassOuterThicknessMm: number; // 4, 6, 8, etc.
  glassInnerThicknessMm: number; // 4, 6, 8, 44.2 (8.76), etc.
  installationAltitudeM: number; // Altitude du chantier (ex: Alger 20m, Djelfa 1150m, Setif 1100m)
  manufacturingAltitudeM?: number; // Altitude atelier (ex: 20m)
  wilayaName?: string;
  clientName?: string;
  windowReference?: string;
}

export interface IntegratedBlindResult {
  widthMm: number;
  heightMm: number;
  surfaceAreaM2: number;
  blindSpec: BlindTypeSpec;
  actuationSpec: ActuationSpec;
  
  // Dimensional & Clearances
  totalIguThicknessMm: number;
  cavityWidthMm: number;
  slatClearanceFrontMm: number;
  slatClearanceBackMm: number;
  isCavitySufficient: boolean;
  minRecommendedCavityMm: number;
  
  // Mechanical Sizing
  stackHeightMm: number;
  blindMechanismWeightKg: number;
  glassUnitWeightKg: number;
  totalWeightKg: number;
  
  // Thermal & Solar Energetics
  baseGlassUg: number;
  effectiveUg: number;
  baseGlassG: number;
  effectiveGtot: number;
  solarHeatReductionPercent: number;
  lightTransmittanceTauV: number;
  summerComfortRating: 'Excellent' | 'Bon' | 'Moyen';
  
  // Barometric Pressure & Transport Safety
  altitudeDifferenceM: number;
  estimatedPressureDeltaHPa: number;
  glassOutwardDeflectionMm: number;
  requiresAltimetricValve: boolean;
  altimetricSafetyAdvice: string;
  
  // Regulatory & System Feasibility
  isAreaCompliant: boolean;
  isDimensionCompliant: boolean;
  isOverallFeasible: boolean;
  complianceStatus: 'CONFORME' | 'NON_CONFORME' | 'ATTENTION';
  recommendations: string[];
}

/**
 * Main Calculation Engine for Integrated Blinds in Insulating Glass
 */
export function computeIntegratedBlindAudit(input: IntegratedBlindInput): IntegratedBlindResult {
  const {
    widthMm,
    heightMm,
    blindType,
    actuationMode,
    orientation,
    cavityWidthMm,
    glassOuterThicknessMm,
    glassInnerThicknessMm,
    installationAltitudeM,
    manufacturingAltitudeM = 20,
  } = input;

  const blindSpec = BLIND_TYPE_SPECS[blindType];
  const actuationSpec = ACTUATION_SPECS[actuationMode];

  const surfaceAreaM2 = Math.round(((widthMm * heightMm) / 1000000) * 1000) / 1000;
  const totalIguThicknessMm = Math.round((glassOuterThicknessMm + cavityWidthMm + glassInnerThicknessMm) * 10) / 10;

  // Cavity Clearance Check
  const minRecommendedCavityMm = blindSpec.minCavityWidthMm;
  const isCavitySufficient = cavityWidthMm >= minRecommendedCavityMm;
  
  // Clearances on both sides of the slat
  const effectiveSlatWidth = blindSpec.slatWidthMm;
  const remainingSpace = Math.max(0, cavityWidthMm - effectiveSlatWidth);
  const slatClearanceFrontMm = Math.round((remainingSpace / 2) * 10) / 10;
  const slatClearanceBackMm = slatClearanceFrontMm;

  // Stack Height (Hauteur du paquet replié)
  // Headrail height ~35mm + bottom rail ~15mm + slat bundle
  let stackHeightMm = 50;
  if (blindSpec.category === 'venetian') {
    const slatPitchDeploy = blindSpec.slatWidthMm * 0.75;
    const slatCount = Math.ceil(heightMm / slatPitchDeploy);
    const compressedSlatThickness = 0.35; // mm per slat stacked
    stackHeightMm = Math.round(45 + 15 + slatCount * compressedSlatThickness);
  } else if (blindSpec.category === 'pleated') {
    stackHeightMm = Math.round(40 + (heightMm / 1000) * 25);
  } else if (blindSpec.category === 'cellular') {
    stackHeightMm = Math.round(45 + (heightMm / 1000) * 30);
  } else {
    // Roller tube diameter inside headrail
    stackHeightMm = 65;
  }

  // Weight Estimation
  const blindFabricWeightKg = surfaceAreaM2 * blindSpec.weightPerM2Kg;
  const headrailMechanismWeightKg = actuationMode.startsWith('motorized') ? 1.6 : 0.9;
  const blindMechanismWeightKg = Math.round((blindFabricWeightKg + headrailMechanismWeightKg) * 10) / 10;
  
  // Glass Weight: 2.5 kg/m2 per mm of glass
  const totalGlassThickness = glassOuterThicknessMm + glassInnerThicknessMm;
  const glassUnitWeightKg = Math.round((surfaceAreaM2 * totalGlassThickness * 2.5) * 10) / 10;
  const totalWeightKg = Math.round((blindMechanismWeightKg + glassUnitWeightKg) * 10) / 10;

  // Energetics (gtot & Ug calculation)
  // Base glass: assumed Low-E 1.1 W/(m2.K) with argon 90%
  const baseGlassUg = cavityWidthMm >= 20 ? 1.15 : 1.30;
  const baseGlassG = 0.62;

  let effectiveGtot = baseGlassG;
  let effectiveUg = baseGlassUg;
  let lightTransmittanceTauV = 0.78;

  switch (orientation) {
    case 'retracted':
      effectiveGtot = baseGlassG;
      effectiveUg = baseGlassUg;
      lightTransmittanceTauV = 0.76;
      break;
    case 'horizontal_0':
      if (blindSpec.category === 'venetian') {
        effectiveGtot = 0.38;
        effectiveUg = baseGlassUg - 0.05;
        lightTransmittanceTauV = 0.52;
      } else {
        effectiveGtot = 0.32;
        effectiveUg = baseGlassUg - 0.10;
        lightTransmittanceTauV = 0.40;
      }
      break;
    case 'tilted_45':
      if (blindSpec.category === 'venetian') {
        effectiveGtot = 0.20;
        effectiveUg = baseGlassUg - 0.10;
        lightTransmittanceTauV = 0.16;
      } else {
        effectiveGtot = 0.18;
        effectiveUg = baseGlassUg - 0.12;
        lightTransmittanceTauV = 0.14;
      }
      break;
    case 'closed_75':
      if (blindSpec.category === 'venetian') {
        effectiveGtot = 0.11;
        effectiveUg = baseGlassUg - 0.15;
        lightTransmittanceTauV = 0.02;
      } else if (blindSpec.category === 'cellular') {
        effectiveGtot = 0.09;
        effectiveUg = baseGlassUg - 0.22;
        lightTransmittanceTauV = 0.01;
      } else {
        effectiveGtot = 0.12;
        effectiveUg = baseGlassUg - 0.16;
        lightTransmittanceTauV = 0.04;
      }
      break;
  }

  const solarHeatReductionPercent = Math.round((1 - effectiveGtot / baseGlassG) * 100);
  
  let summerComfortRating: 'Excellent' | 'Bon' | 'Moyen' = 'Moyen';
  if (effectiveGtot <= 0.15) {
    summerComfortRating = 'Excellent';
  } else if (effectiveGtot <= 0.30) {
    summerComfortRating = 'Bon';
  }

  // Barometric Pressure & Altitude Safety (NF EN 1279 / CSTB)
  const altitudeDifferenceM = installationAltitudeM - manufacturingAltitudeM;
  // deltaP approx = rho_air * g * deltaH ~ 1.2 * 9.81 * deltaH / 100 in hPa
  const estimatedPressureDeltaHPa = Math.round((1.2 * 9.81 * altitudeDifferenceM) / 100);
  
  // Deflection approximation for glass pane: delta = alpha * p * a^4 / (D)
  // When deltaH > 800m, outward bulging of glass can exceed 3 to 6 mm, pinching slats
  const glassOutwardDeflectionMm = Math.round((Math.abs(estimatedPressureDeltaHPa) * 0.045) * 10) / 10;
  const requiresAltimetricValve = Math.abs(altitudeDifferenceM) >= 700;

  let altimetricSafetyAdvice = 'Ecart altimetrique standard. Equilibrage barometrique classique.';
  if (requiresAltimetricValve) {
    altimetricSafetyAdvice = `Chantier a +${installationAltitudeM}m (ecart ${altitudeDifferenceM}m). Clapet d'équilibrage altimétrique Aluprom obligatoire en usine avant scellement définitif pour eviter le blocage des lamelles par bombement du verre.`;
  }

  // Compliance checks
  const isAreaCompliant = surfaceAreaM2 <= Math.min(blindSpec.maxAreaM2, actuationSpec.maxAreaM2);
  const isDimensionCompliant =
    widthMm >= blindSpec.minWidthMm &&
    widthMm <= blindSpec.maxWidthMm &&
    heightMm >= blindSpec.minHeightMm &&
    heightMm <= blindSpec.maxHeightMm;

  const isOverallFeasible = isCavitySufficient && isAreaCompliant && isDimensionCompliant;
  
  let complianceStatus: 'CONFORME' | 'NON_CONFORME' | 'ATTENTION' = 'CONFORME';
  if (!isOverallFeasible) {
    complianceStatus = 'NON_CONFORME';
  } else if (requiresAltimetricValve || slatClearanceFrontMm < 3.0) {
    complianceStatus = 'ATTENTION';
  }

  // Construct recommendations
  const recommendations: string[] = [];
  if (!isCavitySufficient) {
    recommendations.push(
      `Cavite insuffisante: ${cavityWidthMm} mm alors que ${blindSpec.name} requiert au minimum ${minRecommendedCavityMm} mm (recommande ${blindSpec.recommendedCavityMm} mm).`
    );
  }
  if (!isAreaCompliant) {
    recommendations.push(
      `Surface de ${surfaceAreaM2} m² superieure a la limite admissible (${Math.min(blindSpec.maxAreaM2, actuationSpec.maxAreaM2)} m²) pour le mode ${actuationSpec.name}.`
    );
  }
  if (!isDimensionCompliant) {
    recommendations.push(
      `Dimensions (${widthMm} x ${heightMm} mm) hors plage constructeur (${blindSpec.minWidthMm}-${blindSpec.maxWidthMm} x ${blindSpec.minHeightMm}-${blindSpec.maxHeightMm} mm).`
    );
  }
  if (slatClearanceFrontMm < 3.0 && isCavitySufficient) {
    recommendations.push(
      `Jeu lateral lamelle/verre faible (${slatClearanceFrontMm} mm). Un intercalaire de ${cavityWidthMm + 2} mm est conseille pour eviter le frottement par flexion thermique.`
    );
  }
  if (requiresAltimetricValve) {
    recommendations.push(
      `Pose en altitude (${installationAltitudeM} m): Prevoir la pose d'une soupape de detente barometrique ou tube capillaire scellé sur site.`
    );
  }
  if (effectiveGtot <= 0.15) {
    recommendations.push(
      `Facteur solaire gtot remarquable (${effectiveGtot.toFixed(2)}) bloquant ${solarHeatReductionPercent}% des apports de chaleur solaires estivaux (conforme DTR C3-2).`
    );
  }

  return {
    widthMm,
    heightMm,
    surfaceAreaM2,
    blindSpec,
    actuationSpec,
    totalIguThicknessMm,
    cavityWidthMm,
    slatClearanceFrontMm,
    slatClearanceBackMm,
    isCavitySufficient,
    minRecommendedCavityMm,
    stackHeightMm,
    blindMechanismWeightKg,
    glassUnitWeightKg,
    totalWeightKg,
    baseGlassUg,
    effectiveUg: Math.round(effectiveUg * 100) / 100,
    baseGlassG,
    effectiveGtot: Math.round(effectiveGtot * 100) / 100,
    solarHeatReductionPercent,
    lightTransmittanceTauV: Math.round(lightTransmittanceTauV * 100) / 100,
    summerComfortRating,
    altitudeDifferenceM,
    estimatedPressureDeltaHPa,
    glassOutwardDeflectionMm,
    requiresAltimetricValve,
    altimetricSafetyAdvice,
    isAreaCompliant,
    isDimensionCompliant,
    isOverallFeasible,
    complianceStatus,
    recommendations,
  };
}
