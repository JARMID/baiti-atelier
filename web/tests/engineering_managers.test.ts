import test from 'node:test';
import assert from 'node:assert/strict';

import {
  calculateFrameThermalAudit,
} from '../src/utils/frameThermalTransmittanceManager.ts';

import {
  computeSlidingCarriageAudit,
} from '../src/utils/slidingCarriageManager.ts';

import {
  computeSolarSunshadeAudit,
} from '../src/utils/solarSunshadeManager.ts';

import {
  computeFrictionStayAudit,
  getWindPressureForWilaya,
} from '../src/utils/frictionStayManager.ts';

// ---------------------------------------------------------
// 1. Frame Thermal Transmittance (ISO 10077 / DTR C3-2) Tests
// ---------------------------------------------------------
test('Frame Thermal Transmittance Auditor', async (t) => {
  await t.test('calculates Uw correctly for standard RPT frame with double glazing', () => {
    const audit = calculateFrameThermalAudit({
      windowWidthMm: 1200,
      windowHeightMm: 1400,
      frameProfile: 'alu_rpt_standard_14mm',
      spacerType: 'warm_edge_composite',
      glazingKey: 'double_4_16_4_low_e_argon',
      wilayaName: 'Alger',
    });

    assert.ok(audit.windowTotalAreaM2 > 0, 'Total area must be positive');
    assert.equal(audit.windowTotalAreaM2, 1.68);
    assert.ok(audit.ufValueWPerM2K === 2.70, 'Frame Uf must match spec (2.70)');
    assert.ok(audit.ugValueWPerM2K === 1.10, 'Glazing Ug must match low-e argon spec (1.10)');
    assert.ok(audit.uwOverallWindowTransmittanceWPerM2K < 2.0, 'Overall Uw should be below 2.0 W/m2K');
    assert.equal(audit.isDtrCompliant, true, 'Must comply with DTR C3-2 for Alger (target 3.20 W/m2K)');
    assert.equal(audit.dtrZoneName, 'Zone A (Littoral & Tell)');
  });

  await t.test('detects non-compliance for cold non-RPT aluminum in cold continental zone (Zone B)', () => {
    const audit = calculateFrameThermalAudit({
      windowWidthMm: 1500,
      windowHeightMm: 1600,
      frameProfile: 'alu_cold_no_rpt',
      spacerType: 'aluminum_standard',
      glazingKey: 'single_float_6mm',
      wilayaName: 'Sétif',
    });

    assert.ok(audit.ufValueWPerM2K === 6.20, 'Cold aluminum frame Uf is high (6.20)');
    assert.ok(audit.uwOverallWindowTransmittanceWPerM2K > 5.0, 'Overall Uw must be very poor (> 5.0)');
    assert.equal(audit.isDtrCompliant, false, 'Cold frame must fail DTR C3-2 in Sétif');
    assert.equal(audit.thermalAuditStatus, 'non_compliant');
    assert.ok(audit.isCondensationLikelyOnFrame, 'Cold frame must trigger condensation risk');
  });

  await t.test('calculates psychrometric dew point accurately at standard room conditions', () => {
    const audit = calculateFrameThermalAudit({
      windowWidthMm: 1000,
      windowHeightMm: 1000,
      frameProfile: 'alu_rpt_high_perf_24mm',
      spacerType: 'warm_edge_composite',
      glazingKey: 'double_4_16_4_low_e_argon',
      indoorDesignTempC: 20,
      indoorRelativeHumidityPercent: 50,
      outdoorDesignTempC: 0,
    });

    // Magnus formula at 20 deg C and 50% RH yields dew point around 9.3 deg C
    assert.ok(audit.dewPointTempC >= 9.0 && audit.dewPointTempC <= 9.6);
  });
});

// ---------------------------------------------------------
// 2. Sliding Door Carriage & PMR Operating Force Tests
// ---------------------------------------------------------
test('Sliding Door Roller Carriage & Ergonomics Auditor', async (t) => {
  await t.test('evaluates tandem POM carriages for 2-sash sliding door within safe load', () => {
    const result = computeSlidingCarriageAudit({
      sashWidthMm: 1200,
      sashHeightMm: 2150,
      glassThicknessMm: 8, // 4/16/4
      profileSeries: 'gamme_45_standard',
      carriageModel: 'carriage_tandem_pom_160kg',
      trackRail: 'rail_stainless_steel_insert',
      brushSeal: 'brush_standard_fin_seal',
      handleLeverLengthMm: 130,
      wilayaName: 'Oran',
    });

    assert.ok(result.totalSashWeightKg > 0, 'Sash weight must be positive');
    assert.ok(result.totalSashWeightKg < 160, 'Sash weight must be well under 160 kg capacity');
    assert.equal(result.isCapacityCompliant, true);
    assert.equal(result.carriagesCount, 2);
    assert.equal(result.en12046Class, 'classe_1_standard', 'Standard weatherstrip meets NF EN 12046-2 Class 1');

    // Test with low-friction tri-fin seal to achieve PMR compliance
    const pmrResult = computeSlidingCarriageAudit({
      sashWidthMm: 1000,
      sashHeightMm: 2000,
      glassThicknessMm: 8,
      profileSeries: 'gamme_45_standard',
      carriageModel: 'carriage_tandem_pom_160kg',
      trackRail: 'rail_stainless_steel_insert',
      brushSeal: 'brush_silicone_tri_fin',
      handleLeverLengthMm: 130,
      wilayaName: 'Oran',
    });
    assert.equal(pmrResult.isPmrForceCompliant, true, 'Low friction tri-fin seal achieves PMR force under 50N');
  });

  await t.test('flags overload when single roller carriage carries oversized heavy sash', () => {
    const result = computeSlidingCarriageAudit({
      sashWidthMm: 1800,
      sashHeightMm: 2800,
      glassThicknessMm: 16, // heavy laminated 44.2/16/44.2
      profileSeries: 'gamme_67_heavy',
      carriageModel: 'carriage_single_roller_80kg', // rated max 80kg
      trackRail: 'rail_aluminum_integrated',
      brushSeal: 'brush_standard_fin_seal',
      handleLeverLengthMm: 130,
      wilayaName: 'Alger',
    });

    assert.ok(result.totalSashWeightKg > 80, 'Heavy sash exceeds 80 kg capacity');
    assert.equal(result.isCapacityCompliant, false, 'Must flag capacity non-compliance');
    assert.equal(result.overallStatus, 'critical');
    assert.ok(result.recommendationsFr.length > 0, 'Must provide remediation recommendations');
  });
});

// ---------------------------------------------------------
// 3. Solar Sunshade & Architectural Louver Tests
// ---------------------------------------------------------
test('Solar Sunshade & Architectural Louver Auditor', async (t) => {
  await t.test('computes solar cut-off and shading reduction on South facade in summer', () => {
    const audit = computeSolarSunshadeAudit({
      sunshadeType: 'horizontal_canopy_casquette',
      windowWidthMm: 1400,
      windowHeightMm: 1500,
      canopyProjectionMm: 600,
      bladePitchSpacingMm: 150,
      bladeTiltAngleDeg: 0,
      bladeModel: 'blade_150_elliptical',
      facadeOrientation: 'south',
      glassSolarFactorG: 0.65,
      glassLightTransmissionTv: 0.80,
      targetMonth: 'summer_solstice',
      wilayaName: 'Alger',
    });

    assert.ok(audit.solarProfileAngleDeg > 60, 'Summer noon profile angle on South facade is steep (>60 deg)');
    assert.ok(audit.effectiveShadingRatio > 0.5, 'Canopy provides significant summer shading');
    assert.ok(audit.totalCombinedSolarFactorGtot < audit.unshadedSolarFactorG, 'g_tot must be lower than base glass g');
    assert.equal(audit.isDtrCompliant, true);
    assert.ok(audit.coolingPowerSavedW > 0, 'Cooling power saved must be positive');
  });

  await t.test('computes solar heat reduction and energy savings with motorized adjustable louvers', () => {
    const audit = computeSolarSunshadeAudit({
      sunshadeType: 'motorized_adjustable_louvers',
      windowWidthMm: 2000,
      windowHeightMm: 2200,
      canopyProjectionMm: 0,
      bladePitchSpacingMm: 180,
      bladeTiltAngleDeg: 45,
      bladeModel: 'blade_200_aerofoil',
      facadeOrientation: 'west',
      glassSolarFactorG: 0.60,
      glassLightTransmissionTv: 0.75,
      targetMonth: 'summer_solstice',
      wilayaName: 'Oran',
    });

    assert.ok(audit.solarHeatReductionPercent > 50, 'Adjustable louvers block over 50% of direct heat');
    assert.ok(audit.summerEnergySavedKwh > 0, 'Summer energy savings must be positive');
    assert.ok(audit.coolingCostSavedDzd > 0, 'Financial cooling savings in DZD must be positive');
    assert.ok(audit.bladeCount > 0, 'Blade count must be calculated');
  });
});

// ---------------------------------------------------------
// 4. Friction Stay & Sash Safety (RNV 2013 / NF EN 13126) Tests
// ---------------------------------------------------------
test('Friction Stay & Projecting Window Sash Safety Auditor', async (t) => {
  await t.test('accurately maps Algerian wilayas to RNV 2013 wind pressure zones', () => {
    assert.equal(getWindPressureForWilaya('Annaba'), 585, 'Zone 4 coastal wilaya');
    assert.equal(getWindPressureForWilaya('Alger'), 505, 'Zone 3 Tell wilaya');
    assert.equal(getWindPressureForWilaya('Sétif'), 375, 'Zone 1 High Plateau wilaya');
    assert.equal(getWindPressureForWilaya('Mascara'), 435, 'Zone 2 default plains');
  });

  await t.test('validates top-hung window stay sizing and restrictor requirement', () => {
    const audit = computeFrictionStayAudit({
      sashWidthMm: 800,
      sashHeightMm: 800,
      stayLengthInch: 16, // 406 mm
      stackHeightMm: 17,
      steelGrade: 'austenitic_304',
      frictionShoeMaterial: 'brass_metallic',
      openingStyle: 'top_hung_projecting',
      glazingThicknessMm: 8,
      buildingFloorLevel: 3,
      isPublicBuildingOrSchool: false,
      wilayaName: 'Alger',
      restrictorType: 'integrated_restrictor_100mm',
    });

    assert.ok(audit.totalSashWeightKg > 0, 'Sash weight is positive');
    assert.equal(audit.isWeightCapacityOk, true, '16-inch stay handles standard sash');
    assert.equal(audit.isStayLengthProportionOk, true, 'Stay length ratio is balanced (406mm for 800mm sash)');
    assert.ok(audit.actualMaxOpeningClearanceMm <= 100, 'Restrictor strictly bounds opening gap to <= 100mm');
    assert.equal(audit.isRestrictorCompliant, true);
  });
});
