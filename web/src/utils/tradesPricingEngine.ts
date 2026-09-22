import type {
  WoodConfig,
  WoodCost,
  MetalConfig,
  MetalCost,
  TapestryConfig,
  TapestryCost,
} from '../types/trades';
import type { WorkshopMarginCalibration } from './materialMarketData';

// ==========================================
// 1. WOODWORKING PRICING (MENUISERIE BOIS)
// ==========================================
export function calculateWoodCost(
  config: WoodConfig,
  calibration?: Partial<WorkshopMarginCalibration>
): WoodCost {
  const wM = config.width / 1000.0;
  const hM = config.height / 1000.0;
  const dM = config.depth / 1000.0;
  const woodMultiplier = calibration?.woodPriceMultiplier ?? 1.0;
  const laborFactor = (calibration?.artisanHourlyRateDzd ?? 1800) / 1800;

  // Approximate panel surface calculation (m2)
  // Sides: 2 * (H * D)
  // Top & Bottom: 2 * (W * D)
  // Back: W * H (3mm or 18mm)
  // Shelves: shelvesCount * (W * D)
  // Doors: doorsCount * (H * (W / Math.max(1, doorsCount)))
  // Drawers: drawersCount * (4 * D * 0.15 + W * D)
  const sidesArea = 2 * (hM * dM);
  const topBottomArea = 2 * (wM * dM);
  const backArea = wM * hM;
  const shelvesArea = config.shelvesCount * (wM * dM);
  const doorsArea = wM * hM;
  const drawersArea = config.drawersCount * (4 * dM * 0.15 + wM * dM);

  const totalBoardAreaM2 = sidesArea + topBottomArea + backArea + shelvesArea + doorsArea + drawersArea;

  // Standard sheet in Algeria: 2.80m x 2.07m = 5.796 m2
  const SHEET_AREA = 5.796;
  const boardSheetsRequired = Math.max(1, Math.ceil((totalBoardAreaM2 * 1.15) / SHEET_AREA)); // 15% cutting scrap

  let sheetPriceDzd = 6200.0; // Mélaminé 18mm standard
  if (config.material === 'mdf_hydrofuge') {
    sheetPriceDzd = 8800.0;
  } else if (config.material === 'chene_noble') {
    sheetPriceDzd = 15500.0;
  } else if (config.material === 'hetre_massif') {
    sheetPriceDzd = 18000.0;
  } else if (config.material === 'stratifie_hpl') {
    sheetPriceDzd = 11500.0;
  }
  const boardCostDzd = boardSheetsRequired * (sheetPriceDzd * woodMultiplier);

  // Edge banding (Chants PVC en mètres linéaires)
  const edgeBandMeters = (2 * hM + 4 * wM + config.shelvesCount * wM + config.doorsCount * (2 * hM + 2 * (wM / Math.max(1, config.doorsCount)))) * 1.1;
  const edgeRatePerMeter = config.finishEdge === 'pvc_2mm_choc' ? 180.0 : 85.0;
  const edgeCostDzd = edgeBandMeters * edgeRatePerMeter;

  // Hardware: hinges (charnières invisibles), slides (glissières)
  const hingesPerDoor = hM > 1.8 ? 4 : hM > 1.2 ? 3 : 2;
  const hingesCount = config.doorsCount * hingesPerDoor;
  const hingeUnitPrice = config.hardwareTier === 'soft_close_premium' ? 550.0 : 250.0;
  const slideUnitPrice = config.hardwareTier === 'soft_close_premium' ? 2200.0 : 1100.0;

  const hardwareCostDzd =
    hingesCount * hingeUnitPrice +
    config.drawersCount * slideUnitPrice +
    (config.doorsCount + config.drawersCount) * 450.0; // Poignées profilées

  // Labor: cutting, edge banding, assembly, installation
  const laborAssemblyDzd = (6500.0 + (totalBoardAreaM2 * 1200.0)) * laborFactor;

  const totalEstimatedDzd = Math.round(boardCostDzd + edgeCostDzd + hardwareCostDzd + laborAssemblyDzd);

  return {
    boardAreaM2: Number(totalBoardAreaM2.toFixed(2)),
    boardSheetsRequired,
    boardCostDzd: Math.round(boardCostDzd),
    edgeBandMeters: Number(edgeBandMeters.toFixed(1)),
    edgeCostDzd: Math.round(edgeCostDzd),
    hingesCount,
    slidesCount: config.drawersCount,
    hardwareCostDzd: Math.round(hardwareCostDzd),
    laborAssemblyDzd: Math.round(laborAssemblyDzd),
    totalEstimatedDzd,
  };
}

// ==========================================
// 2. METALWORK PRICING (FERRONNERIE D'ART)
// ==========================================
export function calculateMetalCost(
  config: MetalConfig,
  calibration?: Partial<WorkshopMarginCalibration>
): MetalCost {
  const wM = config.width / 1000.0;
  const hM = config.height / 1000.0;
  const metalMultiplier = calibration?.metalPriceMultiplier ?? 1.0;
  const laborFactor = (calibration?.artisanHourlyRateDzd ?? 1800) / 1800;

  // Frame perimeter (tube carré 40x40x2mm: ~2.45 kg/m)
  const framePerimeterM = 2 * (wM + hM);
  const frameWeightKg = framePerimeterM * 2.45;

  // Infill bars count and weight
  const spacingM = config.barSpacingMm / 1000.0;
  const barsCount = Math.max(1, Math.floor(wM / spacingM));
  const barsLinearMeters = barsCount * hM;

  let barWeightPerMeter = 1.54; // Carré 14x14mm
  if (config.barType === 'square_16') {
    barWeightPerMeter = 2.01;
  } else if (config.barType === 'round_tube_20') {
    barWeightPerMeter = 1.10;
  } else if (config.barType === 'forged_twisted') {
    barWeightPerMeter = 1.85;
  }

  const barsWeightKg = barsLinearMeters * barWeightPerMeter;
  const totalSteelWeightKg = (frameWeightKg + barsWeightKg) * 1.08; // 8% waste

  // Raw steel price in Algeria: ~210 DZD/kg
  const steelCostDzd = totalSteelWeightKg * 215.0 * metalMultiplier;

  // Forged decorative scrolls and spears
  const scrollsCount = config.hasForgedScrolls ? Math.max(2, Math.floor(barsCount / 2)) : 0;
  const spearsCount = config.hasSpearHeads ? barsCount : 0;
  const decorCostDzd = scrollsCount * 380.0 + spearsCount * 260.0;

  // Locksets, hinges, gate wheels
  let locksetAndHingesDzd = 2500.0;
  if (config.productType.includes('gate')) {
    locksetAndHingesDzd = 14500.0; // Rail de guidage, roulettes sur roulements, gâche
  } else if (config.productType === 'security_door') {
    locksetAndHingesDzd = 18500.0; // Serrure multipoints de sécurité
  }

  // Surface treatment
  const areaM2 = wM * hM;
  let surfaceRatePerM2 = 850.0; // Antirouille seul
  if (config.finishTreatment === 'epoxy_powder_coat') {
    surfaceRatePerM2 = 2200.0; // Thermolaquage au four
  } else if (config.finishTreatment === 'hammered_bronze') {
    surfaceRatePerM2 = 1800.0;
  }
  const surfaceFinishingDzd = Math.max(1500.0, areaM2 * surfaceRatePerM2);

  // Welding labor & installation
  const weldingLaborDzd = (4500.0 + (totalSteelWeightKg * 45.0)) * laborFactor;

  const totalEstimatedDzd = Math.round(
    steelCostDzd + decorCostDzd + locksetAndHingesDzd + surfaceFinishingDzd + weldingLaborDzd
  );

  return {
    steelWeightKg: Number(totalSteelWeightKg.toFixed(1)),
    steelCostDzd: Math.round(steelCostDzd),
    scrollsCount,
    spearsCount,
    decorCostDzd: Math.round(decorCostDzd),
    locksetAndHingesDzd: Math.round(locksetAndHingesDzd),
    surfaceFinishingDzd: Math.round(surfaceFinishingDzd),
    weldingLaborDzd: Math.round(weldingLaborDzd),
    totalEstimatedDzd,
  };
}

// ==========================================
// 3. TAPESTRY & COUTURE (RIDEAUX & AMEUBLEMENT)
// ==========================================
export function calculateTapestryCost(
  config: TapestryConfig,
  calibration?: Partial<WorkshopMarginCalibration>
): TapestryCost {
  const railM = config.railWidthCm / 100.0;
  const laborFactor = (calibration?.artisanHourlyRateDzd ?? 1800) / 1800;

  // Linear meters of fabric = rail width * pleat multiplier
  const fabricLinearMeters = railM * config.pleatRatio;

  let fabricPricePerMeter = 1850.0; // Velours anti-tache standard
  if (config.fabricType === 'lin_naturel') {
    fabricPricePerMeter = 2600.0;
  } else if (config.fabricType === 'jacquard_damas') {
    fabricPricePerMeter = 2900.0;
  } else if (config.fabricType === 'voilage_organza') {
    fabricPricePerMeter = 980.0;
  } else if (config.fabricType === 'blackout_thermic') {
    fabricPricePerMeter = 2400.0;
  }

  const fabricCostDzd = fabricLinearMeters * fabricPricePerMeter;

  // Ruflette header, eyelets (œillets métalliques)
  let rufletteAndEyeletsDzd = fabricLinearMeters * 220.0;
  if (config.headerType === 'eyelets_metal') {
    const eyeletsCount = Math.ceil(fabricLinearMeters * 6);
    rufletteAndEyeletsDzd = fabricLinearMeters * 180.0 + eyeletsCount * 65.0;
  }

  // Thermal/blackout lining
  const liningCostDzd = config.hasThermalLining ? fabricLinearMeters * 900.0 : 0.0;

  // Confection labor (ourlet bas avec plomb, ruflette, coupe et repassage)
  const tailoringLaborDzd = (2500.0 + (fabricLinearMeters * 450.0)) * laborFactor;

  const totalEstimatedDzd = Math.round(
    fabricCostDzd + rufletteAndEyeletsDzd + liningCostDzd + tailoringLaborDzd
  );

  return {
    fabricLinearMeters: Number(fabricLinearMeters.toFixed(1)),
    fabricCostDzd: Math.round(fabricCostDzd),
    rufletteAndEyeletsDzd: Math.round(rufletteAndEyeletsDzd),
    liningCostDzd: Math.round(liningCostDzd),
    tailoringLaborDzd: Math.round(tailoringLaborDzd),
    totalEstimatedDzd,
  };
}
