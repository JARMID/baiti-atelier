export type OpeningType =
  | 'sliding_2'     // Coulissant 2 Vantaux
  | 'sliding_3'     // Coulissant 3 Vantaux (3 Rails)
  | 'casement_1'    // Battant / Ouvrant 1 Vantail
  | 'casement_2'    // Battant / Ouvrant 2 Vantaux
  | 'tilt_turn'     // Oscillo-battant
  | 'fixed';        // Châssis Fixe

export type ProfileSystem =
  | 'gamme_40'            // Profilé standard 40mm économique
  | 'gamme_45_thermal'    // Gamme 45 avec Rupture de Pont Thermique (RPT)
  | 'gamme_67_slide'      // Coulissant lourd 67mm
  | 'pvc_70_chamber';     // Profilé PVC 70mm 5 chambres

export type FinishColor =
  | 'ral_9016'   // Blanc Pur
  | 'ral_7016'   // Gris Anthracite Sablé
  | 'ral_9005'   // Noir Mat
  | 'faux_bois'  // Chêne Doré / Faux Bois
  | 'bronze_ano' // Bronze Anodisé

export type GlassType =
  | 'simple_clear'           // Simple vitrage 6mm clair
  | 'double_clear'           // Double vitrage 4/16/4 isolation
  | 'stop_sol'               // Double vitrage teinté réfléchissant Stop-Sol
  | 'sable'                  // Vitrage sablé / dépoli
  | 'double_argon_warmedge'  // Double vitrage 4/16/4 Argon + Warm-Edge
  | 'phonique_stadip'        // Feuilleté phonique Stadip Silence 6/16/4 (Rw 38dB)
  | 'securit_tempered';      // Verre trempé Sécurit 8mm anti-choc

export type ShutterType =
  | 'none'       // Sans volet
  | 'manual'     // Volet roulant manuel à sangle / manivelle
  | 'motorized'; // Volet roulant motorisé avec commande filaire/télécommande

export interface WindowConfig {
  width: number;       // Largeur en mm (ex: 1200)
  height: number;      // Hauteur en mm (ex: 1400)
  openingType: OpeningType;
  profileSystem: ProfileSystem;
  finishColor: FinishColor;
  glassType: GlassType;
  spacerType?: 'standard_alu' | 'warm_edge'; // Intercalaire standard alu ou warm-edge à rupture
  shutterType: ShutterType;
  isOpen: boolean;     // Animation state (open/close)
  openPercent: number; // 0 to 100%
  explodedView: boolean; // 3D exploded assembly view
  shutterPosition?: number; // 0 (fully raised / open) to 100% (fully lowered / closed)
}

export interface CostBreakdown {
  profileLengthMeters: number;
  profileWeightKg: number;
  profileCostDzd: number;
  glassAreaM2: number;
  glassCostDzd: number;
  hardwareCostDzd: number;
  shutterCostDzd: number;
  laborCostDzd: number;
  totalEstimatedDzd: number;
  minRangeDzd: number;
  maxRangeDzd: number;
}

export interface Workshop {
  id: string;
  name: string;
  ownerName: string;
  wilaya: string;
  wilayaCode: number;
  commune: string;
  address: string;
  phone: string;
  whatsappPhone: string;
  telegramHandle?: string;
  rating: number;
  reviewCount: number;
  verified: boolean;
  specialties: string[];
  avatarUrl: string;
  projectCount: number;
  bio: string;
}
