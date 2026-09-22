export type CellType =
  | 'glass_fixed'    // Vitrage Fixe
  | 'sash_left'      // Ouvrant à la française (Ferré à gauche)
  | 'sash_right'     // Ouvrant à la française (Ferré à droite)
  | 'sash_tilt_turn' // Oscillo-battant
  | 'sash_slide'     // Vantail Coulissant
  | 'panel_solid';   // Panneau sandwich opaque alu/pvc

export interface CadCell {
  row: number;
  col: number;
  type: CellType;
  widthMm: number;
  heightMm: number;
  glassWidthMm: number;
  glassHeightMm: number;
}

export type ArchType = 'none' | 'full_arch' | 'lowered_arch';

export interface ArchSpecification {
  type: ArchType;
  riseMm: number;        // Flèche f en mm
  radiusMm: number;      // Rayon R = f/2 + W^2/(8f) en mm
  arcLengthMm: number;   // Longueur développée L_arc en mm
  clampLeadMm: number;   // Talons droits pour cintreuse (ex: 200mm)
  totalProfileMm: number; // L_arc + clampLeadMm
  angleDeg: number;      // Angle au centre en degrés
}

export interface CadStructure {
  width: number;
  height: number;
  verticalDividers: number[];   // X coordinates in mm from left (meneaux)
  horizontalDividers: number[]; // Y coordinates in mm from bottom (traverses)
  cellTypes: Record<string, CellType>; // key: `${row}-${col}`
  archType?: ArchType;
  archHeightMm?: number;        // Flèche personnalisée si arc surbaissé
  shutterConfig?: RollerShutterConfig;
}

export type ShutterBoxType =
  | 'monobloc_pvc'
  | 'monobloc_alu'
  | 'renovation_pan_coupe'
  | 'renovation_rond'
  | 'tunnel';

export type ShutterSlatType =
  | 'alu_39'
  | 'alu_55'
  | 'pvc_40'
  | 'alu_extrude_securite';

export type ShutterDriveType =
  | 'manual_strap'
  | 'manual_crank'
  | 'motor_wired'
  | 'motor_radio'
  | 'motor_solar';

export interface RollerShutterConfig {
  enabled: boolean;
  boxType: ShutterBoxType;
  boxHeightMm: number; // 137, 150, 165, 180, 205
  slatType: ShutterSlatType;
  driveType: ShutterDriveType;
  slatColor: string; // e.g. 'Blanc RAL 9016', 'Gris Anthracite 7016', 'Faux Bois Chêne Doré', 'Bronze'
  includeMosquitoNet?: boolean;
  automaticLocks?: boolean;
}

export interface RollerShutterComponent {
  category: 'box' | 'guides' | 'slats' | 'axle' | 'drive' | 'hardware';
  name: string;
  description: string;
  dimensions?: string;
  quantity: number;
  unit: string;
  cutLengthMm?: number;
}

export interface RollerShutterBOM {
  boxWidthMm: number;
  guideHeightMm: number;
  slatCutLengthMm: number;
  slatCount: number;
  slatUsefulHeightMm: number;
  totalCurtainAreaM2: number;
  totalCurtainWeightKg: number;
  recommendedMotorTorqueNm: number;
  axleLengthMm: number;
  axleDiameterMm: 40 | 60;
  components: RollerShutterComponent[];
}

export interface CutPieceDetail {
  id: string;
  label: string;
  role: 'frame' | 'sash' | 'mullion' | 'transom' | 'bead' | 'arch' | 'shutter_box' | 'shutter_guide' | 'shutter_slat' | 'shutter_axle';
  lengthMm: number;
  cutLeftAngle: 45 | 90;
  cutRightAngle: 45 | 90;
  quantity: number;
  isCurved?: boolean;
  bendingNote?: string;
  profileCode?: string;
}

export interface GlassCutDetail {
  id: string;
  label: string;
  widthMm: number;
  heightMm: number;
  areaM2: number;
  glassType: string;
  quantity: number;
  isCurvedArch?: boolean;
}

export interface WorkshopBOM {
  cuts: CutPieceDetail[];
  glasses: GlassCutDetail[];
  hardwareSummary: { name: string; quantity: number; unit: string }[];
  totalProfileMeters: number;
  totalProfileWeightKg: number;
  totalGlassAreaM2: number;
  estimatedBars6m: number;
  archDetails?: ArchSpecification;
  shutterBom?: RollerShutterBOM;
}
