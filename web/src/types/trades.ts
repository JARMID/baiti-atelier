export type TradeCategory =
  | 'aluminum'    // Menuiserie Aluminium & PVC
  | 'woodworking' // Menuiserie Bois & Ébénisterie (Cuisines, Dressings)
  | 'metalwork'   // Ferronnerie d'Art & Métallerie (Grilles, Portails)
  | 'tapestry';   // Tapisserie & Couture d'Ameublement (Rideaux, Salons)

// --- WOODWORKING (MENUISERIE BOIS) ---
export type WoodProductType =
  | 'kitchen_base'      // Caisson Bas Cuisine
  | 'kitchen_wall'      // Meuble Haut Cuisine
  | 'wardrobe_dressing' // Dressing & Placard Mural
  | 'interior_door'     // Porte d'Intérieur Isoplane / Massif
  | 'custom_furniture'; // Table / Bureau / Meuble TV

export type WoodMaterial =
  | 'melamine_18'      // Panneau Mélaminé 18mm standard
  | 'mdf_hydrofuge'    // MDF Hydrofuge résistant humidité (Cuisines & SDB)
  | 'chene_noble'      // Placage Chêne Noble / Bois Rouge
  | 'hetre_massif'     // Hêtre Massif séché étuvé
  | 'stratifie_hpl';   // Stratifié Haute Pression anti-rayures

export interface WoodConfig {
  productType: WoodProductType;
  width: number;       // mm
  height: number;      // mm
  depth: number;       // mm
  shelvesCount: number;
  drawersCount: number;
  doorsCount: number;
  material: WoodMaterial;
  finishEdge: 'pvc_08mm' | 'pvc_2mm_choc' | 'chant_bois';
  hardwareTier: 'standard' | 'soft_close_premium'; // Amortisseurs Blum
}

export interface WoodCost {
  boardAreaM2: number;
  boardSheetsRequired: number;
  boardCostDzd: number;
  edgeBandMeters: number;
  edgeCostDzd: number;
  hingesCount: number;
  slidesCount: number;
  hardwareCostDzd: number;
  laborAssemblyDzd: number;
  totalEstimatedDzd: number;
}

// --- METALWORK (FERRONNERIE D'ART) ---
export type MetalProductType =
  | 'window_grille'       // Barreaudage Grille de Protection
  | 'sliding_gate'        // Portail Coulissant Motorisable
  | 'swing_gate'          // Portail Battant 2 Vantaux
  | 'balcony_railing'     // Garde-corps Balcon / Escalier
  | 'security_door';      // Porte Blindée / Métallique

export type IronBarType =
  | 'square_14'   // Carré plein 14x14 mm
  | 'square_16'   // Carré plein 16x16 mm renforcé
  | 'round_tube_20' // Tube rond 20 mm
  | 'forged_twisted'; // Fer torsadé forgé à chaud

export interface MetalConfig {
  productType: MetalProductType;
  width: number;  // mm
  height: number; // mm
  barType: IronBarType;
  barSpacingMm: number; // ex: 110mm, 120mm
  hasForgedScrolls: boolean; // Volutes décoratives
  hasSpearHeads: boolean;    // Pointes de lance supérieures
  finishTreatment: 'antirust_primer' | 'epoxy_powder_coat' | 'hammered_bronze';
}

export interface MetalCost {
  steelWeightKg: number;
  steelCostDzd: number;
  scrollsCount: number;
  spearsCount: number;
  decorCostDzd: number;
  locksetAndHingesDzd: number;
  surfaceFinishingDzd: number;
  weldingLaborDzd: number;
  totalEstimatedDzd: number;
}

// --- TAPESTRY & COUTURE (TAPISSERIE & RIDEAUX) ---
export type TapestryProductType =
  | 'curtain_salon'     // Rideaux Doubles & Voilages Salon
  | 'curtain_bedroom'   // Rideaux Occultants Chambre
  | 'seddari_moroccan'  // Banquettes Salon Marocain (Sedari)
  | 'modern_sofa_cover';// Réfection & Housse Canapé

export type FabricType =
  | 'velours_antitache' // Velours Déperlant Anti-tache
  | 'lin_naturel'       // Toile de Lin Lavé Haut de Gamme
  | 'jacquard_damas'    // Tissu Jacquard Relief Traditionnel
  | 'voilage_organza'   // Voilage Transparent Tamisant
  | 'blackout_thermic'; // Tissu 100% Occultant & Isolant Thermique

export interface TapestryConfig {
  productType: TapestryProductType;
  railWidthCm: number;       // Largeur tringle ou longueur assise (cm)
  heightCm: number;          // Hauteur sol au plafond (cm)
  pleatRatio: 1.5 | 2.0 | 2.5; // Taux d'ondulation du tissu
  fabricType: FabricType;
  headerType: 'eyelets_metal' | 'wave_ruflette' | 'pinch_pleat';
  hasThermalLining: boolean;
}

export interface TapestryCost {
  fabricLinearMeters: number;
  fabricCostDzd: number;
  rufletteAndEyeletsDzd: number;
  liningCostDzd: number;
  tailoringLaborDzd: number;
  totalEstimatedDzd: number;
}
