import type {
  StockBar1D,
  CutDemand1D,
  OptimizedBar1D,
  PlacedCut1D,
  LinearOptimizationResult,
} from '../types/optimizer';

interface LinearOptimizerOptions {
  kerf?: number; // mm (default 3)
  clampTrim?: number; // mm (default 25)
  minRemnantLength?: number; // mm (default 800)
  standardBarLength?: number; // mm (default 6000)
}

export function optimize1DLinearStock(
  demands: CutDemand1D[],
  existingRemnants: StockBar1D[] = [],
  options: LinearOptimizerOptions = {}
): LinearOptimizationResult {
  const kerf = options.kerf ?? 3;
  const clampTrim = options.clampTrim ?? 25;
  const minRemnantLength = options.minRemnantLength ?? 800;
  const standardBarLength = options.standardBarLength ?? 6000;

  // Flatten all demands into individual cut items
  const items: {
    demandId: string;
    length: number;
    miterLeft: 45 | 90;
    miterRight: 45 | 90;
    label: string;
    profileCode: string;
  }[] = [];

  demands.forEach((d) => {
    for (let i = 0; i < d.quantity; i++) {
      items.push({
        demandId: d.id,
        length: d.length,
        miterLeft: d.miterLeft,
        miterRight: d.miterRight,
        label: d.label,
        profileCode: d.profileCode,
      });
    }
  });

  // Sort descending by length (First-Fit Decreasing)
  items.sort((a, b) => b.length - a.length);

  const remainingItems = [...items];
  const packedBars: OptimizedBar1D[] = [];

  // Phase 1: Try to consume existing remnants first (Best Fit)
  const sortedRemnants = [...existingRemnants]
    .filter((r) => r.isRemnant && r.length > 0)
    .sort((a, b) => a.length - b.length);

  for (const remnant of sortedRemnants) {
    if (remainingItems.length === 0) break;

    let currentPos = clampTrim;
    const placedCuts: PlacedCut1D[] = [];

    for (let i = 0; i < remainingItems.length; ) {
      const item = remainingItems[i];
      const neededSpace = placedCuts.length === 0 ? item.length : item.length + kerf;

      if (currentPos + neededSpace <= remnant.length) {
        const start = currentPos + (placedCuts.length === 0 ? 0 : kerf);
        const end = start + item.length;

        placedCuts.push({
          id: `cut-${packedBars.length + 1}-${placedCuts.length + 1}`,
          demandId: item.demandId,
          length: item.length,
          startPosition: start,
          endPosition: end,
          miterLeft: item.miterLeft,
          miterRight: item.miterRight,
          label: item.label,
          profileCode: item.profileCode,
        });

        currentPos = end;
        remainingItems.splice(i, 1);
      } else {
        i++;
      }
    }

    if (placedCuts.length > 0) {
      const totalCutLength = placedCuts.reduce((acc, c) => acc + c.length, 0);
      const totalKerf = (placedCuts.length - 1) * kerf;
      const totalUsed = totalCutLength + totalKerf + clampTrim;
      const waste = remnant.length - currentPos;

      packedBars.push({
        barIndex: packedBars.length + 1,
        stockLength: remnant.length,
        cuts: placedCuts,
        kerf,
        clampTrim,
        totalUsedLength: totalUsed,
        wasteLength: Math.max(0, waste),
        utilizationRate: totalCutLength / remnant.length,
        isReusableRemnant: waste >= minRemnantLength,
        remnantId: waste >= minRemnantLength ? `REM-${packedBars.length + 1}` : undefined,
      });
    }
  }

  // Phase 2: Pack remaining items into new standard 6.0m bars
  while (remainingItems.length > 0) {
    const barLength = standardBarLength;
    let currentPos = clampTrim;
    const placedCuts: PlacedCut1D[] = [];

    for (let i = 0; i < remainingItems.length; ) {
      const item = remainingItems[i];
      const neededSpace = placedCuts.length === 0 ? item.length : item.length + kerf;

      if (currentPos + neededSpace <= barLength) {
        const start = currentPos + (placedCuts.length === 0 ? 0 : kerf);
        const end = start + item.length;

        placedCuts.push({
          id: `cut-${packedBars.length + 1}-${placedCuts.length + 1}`,
          demandId: item.demandId,
          length: item.length,
          startPosition: start,
          endPosition: end,
          miterLeft: item.miterLeft,
          miterRight: item.miterRight,
          label: item.label,
          profileCode: item.profileCode,
        });

        currentPos = end;
        remainingItems.splice(i, 1);
      } else {
        i++;
      }
    }

    if (placedCuts.length === 0) {
      // Piece exceeds standard bar length! Cannot fit.
      break;
    }

    const totalCutLength = placedCuts.reduce((acc, c) => acc + c.length, 0);
    const totalKerf = (placedCuts.length - 1) * kerf;
    const totalUsed = totalCutLength + totalKerf + clampTrim;
    const waste = barLength - currentPos;

    packedBars.push({
      barIndex: packedBars.length + 1,
      stockLength: barLength,
      cuts: placedCuts,
      kerf,
      clampTrim,
      totalUsedLength: totalUsed,
      wasteLength: Math.max(0, waste),
      utilizationRate: totalCutLength / barLength,
      isReusableRemnant: waste >= minRemnantLength,
      remnantId: waste >= minRemnantLength ? `REM-${packedBars.length + 1}` : undefined,
    });
  }

  // Compile overall statistics
  const totalStockBars = packedBars.filter((b) => b.stockLength === standardBarLength).length;
  const totalRemnantsUsed = packedBars.filter((b) => b.stockLength !== standardBarLength).length;
  const newRemnantsGenerated = packedBars.filter((b) => b.isReusableRemnant).length;
  const totalCutCount = packedBars.reduce((acc, b) => acc + b.cuts.length, 0);

  const totalRawStockLength = packedBars.reduce((acc, b) => acc + b.stockLength, 0);
  const totalUsefulCutLength = packedBars.reduce(
    (acc, b) => acc + b.cuts.reduce((s, c) => s + c.length, 0),
    0
  );
  const totalWasteLength = packedBars.reduce((acc, b) => acc + b.wasteLength, 0);

  const overallUtilizationRate =
    totalRawStockLength > 0 ? totalUsefulCutLength / totalRawStockLength : 0;

  return {
    bars: packedBars,
    totalStockBars,
    totalRemnantsUsed,
    newRemnantsGenerated,
    totalCutCount,
    overallUtilizationRate,
    totalWasteLength,
    totalMaterialLength: totalUsefulCutLength,
  };
}
