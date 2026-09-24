import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { optimize1DLinearStock } from '../src/utils/linearCutOptimizer.ts';
import { packColumnShelves } from '../src/utils/guillotineOptimizer.ts';
import {
  calculateCcpKey,
  generateBaridiMobRip,
  formatBaridiMobRip,
  calculateAlgerianTaxes,
  amountInDzdWords,
  amountInDzdWordsAr,
} from '../src/lib/algerianFinancials.ts';
import type { CutDemand1D, StockBar1D } from '../src/types/optimizer.ts';

describe('Linear Cut Optimizer (1D Bar Packing)', () => {
  test('packs 4 cuts of 1200mm into a single 6000mm bar with high utilization', () => {
    const demands: CutDemand1D[] = [
      {
        id: 'cut-1',
        label: 'Montant Fenêtre F1',
        length: 1200,
        quantity: 4,
        miterLeft: 45,
        miterRight: 45,
        profileCode: 'ALUGRAF-40-DORMANT',
      },
    ];

    const result = optimize1DLinearStock(demands, [], {
      standardBarLength: 6000,
      kerf: 3,
      clampTrim: 25,
      minRemnantLength: 800,
    });

    assert.equal(result.totalStockBars, 1);
    assert.equal(result.totalCutCount, 4);
    assert.ok(result.overallUtilizationRate >= 0.79);
    assert.equal(result.bars[0].cuts.length, 4);

    // Verify first cut starts at clampTrim (25mm)
    assert.equal(result.bars[0].cuts[0].startPosition, 25);
    assert.equal(result.bars[0].cuts[0].endPosition, 25 + 1200);

    // Verify second cut starts with kerf
    assert.equal(result.bars[0].cuts[1].startPosition, 25 + 1200 + 3);

    // Waste is: 6000 - (25 + 4*1200 + 3*3) = 6000 - 4834 = 1166mm
    // Since 1166 >= 800 (minRemnantLength), it should be marked as reusable remnant
    assert.equal(result.bars[0].isReusableRemnant, true);
    assert.equal(result.newRemnantsGenerated, 1);
  });

  test('prioritizes existing remnants before consuming fresh 6000mm bars', () => {
    const remnants: StockBar1D[] = [
      {
        id: 'REM-PREV-01',
        length: 2200,
        isRemnant: true,
        sourceChantier: 'Chantier Kouba',
      },
    ];

    const demands: CutDemand1D[] = [
      {
        id: 'cut-short',
        label: 'Traverse Imposte',
        length: 900,
        quantity: 2,
        miterLeft: 90,
        miterRight: 90,
        profileCode: 'ALUGRAF-40',
      },
    ];

    const result = optimize1DLinearStock(demands, remnants, {
      standardBarLength: 6000,
      kerf: 3,
      clampTrim: 25,
    });

    // Both 900mm cuts should fit into the 2200mm remnant:
    // 25 + 900 + 3 + 900 = 1828mm <= 2200mm
    assert.equal(result.totalRemnantsUsed, 1);
    assert.equal(result.totalStockBars, 0); // zero fresh 6m bars opened!
    assert.equal(result.totalCutCount, 2);
  });

  test('allocates multiple 6m bars when cut demands exceed one bar', () => {
    const demands: CutDemand1D[] = [
      {
        id: 'cut-long',
        label: 'Montant Rideau Façade',
        length: 2500,
        quantity: 4,
        miterLeft: 90,
        miterRight: 90,
        profileCode: 'TUBE-ALU-60',
      },
    ];

    const result = optimize1DLinearStock(demands, [], {
      standardBarLength: 6000,
      kerf: 3,
      clampTrim: 25,
    });

    // 2500 * 2 = 5000mm (+ 25 + 3 = 5028mm) per bar -> fits 2 cuts per bar
    // 4 cuts need 2 bars
    assert.equal(result.totalStockBars, 2);
    assert.equal(result.totalCutCount, 4);
    assert.equal(result.bars[0].cuts.length, 2);
    assert.equal(result.bars[1].cuts.length, 2);
  });
});

describe('Guillotine 2D Sheet Optimizer (Panels & Glass)', () => {
  test('packs rectangles into column shelves without overlapping', () => {
    const items = [
      { id: 'p1', specId: 's1', w: 600, h: 800, label: 'Vantail 1' },
      { id: 'p2', specId: 's1', w: 600, h: 800, label: 'Vantail 2' },
      { id: 'p3', specId: 's2', w: 500, h: 700, label: 'Imposte' },
    ];

    const result = packColumnShelves(1, 0, 1300, 2400, items, 3, true);

    assert.equal(result.success, true);
    assert.equal(result.placed.length, 3);
    assert.ok(result.usedHeight <= 2400);

    // Verify bounding constraints
    for (const piece of result.placed) {
      assert.ok(piece.x >= 0);
      assert.ok(piece.x + piece.width <= 1300);
      assert.ok(piece.y + piece.height <= 2400);
    }
  });
});

describe('Algerian Financials & Tax Rules (Web Implementation)', () => {
  test('calculateCcpKey matches standard Algérie Poste algorithm', () => {
    const key = calculateCcpKey('0021458974');
    assert.equal(key, '38');
  });

  test('generateBaridiMobRip generates 20-digit postal code with 007 and 99999', () => {
    const rip = generateBaridiMobRip('0021458974');
    assert.equal(rip, '00799999002145897438');
    assert.equal(rip.length, 20);
  });

  test('formatBaridiMobRip groups digits into standard 4-block bank format', () => {
    const formatted = formatBaridiMobRip('00799999002145897442');
    assert.equal(formatted, '007 99999 0021458974 42');
  });

  test('calculateAlgerianTaxes calculates 19% VAT and cash Timbre Fiscal within limits', () => {
    // Normal case
    const t1 = calculateAlgerianTaxes(100000, false, true);
    assert.equal(t1.subtotalHt, 100000);
    assert.equal(t1.tvaRate, 0.19);
    assert.equal(t1.tvaAmount, 19000);
    assert.equal(t1.timbreFiscal, 1000);
    assert.equal(t1.totalTtc, 120000);

    // Minimum limit case (50 DZD)
    const tMin = calculateAlgerianTaxes(2000, false, true);
    assert.equal(tMin.timbreFiscal, 50);

    // Maximum cap case (2500 DZD)
    const tMax = calculateAlgerianTaxes(600000, false, true);
    assert.equal(tMax.timbreFiscal, 2500);

    // Bank transfer / non-cash payment (no timbre fiscal)
    const tBank = calculateAlgerianTaxes(100000, false, false);
    assert.equal(tBank.timbreFiscal, 0);
    assert.equal(tBank.totalTtc, 119000);
  });

  test('amountInDzdWords formats numbers into French legal currency text', () => {
    const words = amountInDzdWords(125000);
    assert.ok(words.toLowerCase().includes('cent'));
    assert.ok(words.toLowerCase().includes('mille'));
    assert.ok(words.includes('Dinars Algériens'));
  });

  test('amountInDzdWordsAr formats numbers into Arabic legal currency text', () => {
    const wordsAr = amountInDzdWordsAr(125000);
    assert.ok(wordsAr.includes('دينار جزائري'));
    assert.ok(wordsAr.includes('ألف'));
  });
});
