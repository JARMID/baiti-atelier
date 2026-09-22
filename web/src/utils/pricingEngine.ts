import type { CostBreakdown, GlassType, ProfileSystem, WindowConfig } from '../types/window';
import type { WorkshopMarginCalibration } from './materialMarketData';

export function calculateWindowCost(
  config: WindowConfig,
  calibration?: Partial<WorkshopMarginCalibration>
): CostBreakdown {
  const w = config.width / 1000; // width in meters
  const h = config.height / 1000; // height in meters
  const areaM2 = Math.max(0.1, w * h);

  // Calibration multipliers
  const aluMultiplier = calibration?.aluminumPriceMultiplier ?? 1.0;
  const glassMultiplier = calibration?.glassPriceMultiplier ?? 1.0;
  const marginPct = calibration?.workshopTargetMarginPercent ?? 22;
  const marginMultiplier = 1 + (marginPct / 100);
  const hourlyRate = calibration?.artisanHourlyRateDzd ?? 1800;
  const laborFactor = hourlyRate / 1800;

  // 1. Frame perimeter (Dormant)
  const outerFramePerimeter = 2 * (w + h);

  // 2. Sash perimeter (Ouvrant) & Glass count
  let sashCount = 1;
  let sashPerimeterTotal = 0;
  let glassAreaTotal = areaM2 * 0.82; // deducting frame width

  switch (config.openingType) {
    case 'sliding_2':
      sashCount = 2;
      // Each sash is ~ half width + overlap, full height minus frame
      const s2Width = (w / 2) + 0.03;
      const s2Height = Math.max(0.2, h - 0.08);
      sashPerimeterTotal = 2 * (2 * (s2Width + s2Height));
      glassAreaTotal = 2 * (s2Width - 0.1) * (s2Height - 0.1);
      break;

    case 'sliding_3':
      sashCount = 3;
      const s3Width = (w / 3) + 0.04;
      const s3Height = Math.max(0.2, h - 0.08);
      sashPerimeterTotal = 3 * (2 * (s3Width + s3Height));
      glassAreaTotal = 3 * (s3Width - 0.1) * (s3Height - 0.1);
      break;

    case 'casement_1':
    case 'tilt_turn':
      sashCount = 1;
      const c1Width = Math.max(0.2, w - 0.08);
      const c1Height = Math.max(0.2, h - 0.08);
      sashPerimeterTotal = 2 * (c1Width + c1Height);
      glassAreaTotal = (c1Width - 0.1) * (c1Height - 0.1);
      break;

    case 'casement_2':
      sashCount = 2;
      const c2Width = (w / 2) - 0.04;
      const c2Height = Math.max(0.2, h - 0.08);
      sashPerimeterTotal = 2 * (2 * (c2Width + c2Height)) + c2Height;
      glassAreaTotal = 2 * (c2Width - 0.1) * (c2Height - 0.1);
      break;

    case 'fixed':
      sashCount = 0;
      sashPerimeterTotal = 0;
      glassAreaTotal = (w - 0.08) * (h - 0.08);
      break;
  }

  // Parcloses (Glazing beads) match glass perimeter
  const parcloseLength = Math.max(0, outerFramePerimeter + sashPerimeterTotal * 0.7);

  // Total linear profile length in meters
  const totalProfileLength = outerFramePerimeter + sashPerimeterTotal + parcloseLength;

  // Linear density and cost per kg by profile system
  const profileSpecs: Record<ProfileSystem, { weightKgPerM: number; basePricePerKg: number }> = {
    gamme_40: { weightKgPerM: 1.15, basePricePerKg: 780 },
    gamme_45_thermal: { weightKgPerM: 1.55, basePricePerKg: 1050 },
    gamme_67_slide: { weightKgPerM: 1.65, basePricePerKg: 890 },
    pvc_70_chamber: { weightKgPerM: 1.35, basePricePerKg: 720 },
  };

  const spec = profileSpecs[config.profileSystem] || profileSpecs.gamme_40;

  // Finish surcharge
  let finishMultiplier = 1.0;
  if (config.finishColor === 'faux_bois') finishMultiplier = 1.25;
  if (config.finishColor === 'bronze_ano') finishMultiplier = 1.15;
  if (config.finishColor === 'ral_7016') finishMultiplier = 1.08;

  const totalProfileWeightKg = totalProfileLength * spec.weightKgPerM;
  const profileCost = Math.round(totalProfileWeightKg * spec.basePricePerKg * finishMultiplier * aluMultiplier);

  // Glass cost per m2 in DZD
  const glassPrices: Record<GlassType, number> = {
    simple_clear: 2600,
    double_clear: 5400,
    stop_sol: 7800,
    sable: 4900,
    double_argon_warmedge: 6800,
    phonique_stadip: 9500,
    securit_tempered: 6200,
  };

  const spacerCostPerM2 = config.spacerType === 'warm_edge' ? 650 : 0;
  const glassPricePerM2 = ((glassPrices[config.glassType] || 5400) + spacerCostPerM2) * glassMultiplier;
  const glassCost = Math.round(Math.max(0.2, glassAreaTotal) * glassPricePerM2);

  // Hardware cost in DZD
  let hardwareCost = 2800;
  if (config.openingType === 'sliding_2') hardwareCost += 4200;
  if (config.openingType === 'sliding_3') hardwareCost += 6400;
  if (config.openingType === 'casement_1') hardwareCost += 3900;
  if (config.openingType === 'casement_2') hardwareCost += 7200;
  if (config.openingType === 'tilt_turn') hardwareCost += 9800;

  // Shutter cost
  let shutterCost = 0;
  if (config.shutterType === 'manual') {
    shutterCost = Math.round(areaM2 * 8500 + 4000);
  } else if (config.shutterType === 'motorized') {
    shutterCost = Math.round(areaM2 * 9200 + 15500);
  }

  // Labor
  const baseLabor = 3500 * laborFactor;
  const laborCost = Math.round(baseLabor + sashCount * 1200 * laborFactor + (config.shutterType !== 'none' ? 2500 : 0));

  // Subtotal before margin
  const subtotal = profileCost + glassCost + hardwareCost + shutterCost + laborCost;

  // Workshop markup / margin
  const totalEstimated = Math.round(subtotal * marginMultiplier);

  const minRange = Math.round((totalEstimated * 0.93) / 100) * 100;
  const maxRange = Math.round((totalEstimated * 1.07) / 100) * 100;

  return {
    profileLengthMeters: Number(totalProfileLength.toFixed(1)),
    profileWeightKg: Number(totalProfileWeightKg.toFixed(1)),
    profileCostDzd: profileCost,
    glassAreaM2: Number(glassAreaTotal.toFixed(2)),
    glassCostDzd: glassCost,
    hardwareCostDzd: hardwareCost,
    shutterCostDzd: shutterCost,
    laborCostDzd: laborCost,
    totalEstimatedDzd: totalEstimated,
    minRangeDzd: minRange,
    maxRangeDzd: maxRange,
  };
}
