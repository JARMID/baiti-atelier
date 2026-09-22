export interface StockBar1D {
  id: string;
  length: number; // in mm, e.g. 6000
  costPerBar?: number; // in DZD
  isRemnant: boolean;
  profileCode: string;
}

export interface CutDemand1D {
  id: string;
  length: number; // in mm
  quantity: number;
  miterLeft: 45 | 90;
  miterRight: 45 | 90;
  label: string;
  profileCode: string;
}

export interface PlacedCut1D {
  id: string;
  demandId: string;
  length: number;
  startPosition: number;
  endPosition: number;
  miterLeft: 45 | 90;
  miterRight: 45 | 90;
  label: string;
  profileCode?: string;
}

export interface OptimizedBar1D {
  barIndex: number;
  stockLength: number;
  cuts: PlacedCut1D[];
  kerf: number;
  clampTrim: number;
  totalUsedLength: number;
  wasteLength: number;
  utilizationRate: number; // 0 to 1
  isReusableRemnant: boolean; // if wasteLength >= minRemnantLength
  remnantId?: string;
}

export interface LinearOptimizationResult {
  bars: OptimizedBar1D[];
  totalStockBars: number;
  totalRemnantsUsed: number;
  newRemnantsGenerated: number;
  totalCutCount: number;
  overallUtilizationRate: number;
  totalWasteLength: number;
  totalMaterialLength: number;
}

// 2D SHEET OPTIMIZATION TYPES
export interface SheetStock2D {
  id: string;
  name: string;
  width: number; // mm
  height: number; // mm
  material: 'glass' | 'wood' | 'mdf' | 'pvc' | 'aluminum_composite';
  kerf: number; // mm (e.g. 0 for glass, 3.5 for panel saw)
  costPerSheet?: number;
}

export interface PieceSpec2D {
  id: string;
  width: number; // mm
  height: number; // mm
  quantity: number;
  allowRotate: boolean;
  grainDirection?: 'horizontal' | 'vertical' | 'none';
  label: string;
}

export interface PlacedPiece2D {
  id: string; // e.g. #1, #2
  specId: string;
  width: number;
  height: number;
  rotated: boolean;
  x: number;
  y: number;
  boardIndex: number;
  stripIndex: number;
  label: string;
}

export interface Strip2D {
  x: number;
  y: number;
  width: number;
  height: number;
  pieces: PlacedPiece2D[];
  usedWidth: number;
}

export interface BoardLayout2D {
  index: number;
  width: number;
  height: number;
  strips: Strip2D[];
  columnSplits?: number[]; // master vertical split positions
}

export interface GuillotineCut2D {
  id: number;
  type: 'H' | 'V';
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  boardIndex: number;
  stage: 1 | 2 | 3;
}

export interface GuillotineOptimizationResult {
  boards: BoardLayout2D[];
  allPlacedPieces: PlacedPiece2D[];
  cuts: GuillotineCut2D[];
  totalSheetsUsed: number;
  totalPlacedCount: number;
  totalRequiredCount: number;
  overallUtilization: number;
  totalPieceAreaM2: number;
  totalSheetAreaM2: number;
}
