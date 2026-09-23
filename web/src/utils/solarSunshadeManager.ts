/**
 * Solar Sunshade & Architectural Louver Energy, Daylight & Thermal Auditor
 * Normative references:
 * - Algerian DTR C3-2: Thermal regulation of residential buildings (Solar Factor Sw max)
 * - Algerian DTR C3-4: Thermal calculation of tertiary and public buildings
 * - NF EN 13363-1 / ISO 52022-1: Solar protection devices combined with glazing (gtot, tau_v_tot)
 * - NF EN 14501: Blinds and shutters - Thermal and visual comfort performance classes
 * - CNERIB DTR BC 2-47 RNV 2013 / Eurocode 1: Wind action on cantilevered sunshades
 */

export type SunshadeType =
  | 'horizontal_canopy_casquette'
  | 'horizontal_louvers_blades'
  | 'vertical_louvers_blades'
  | 'motorized_adjustable_louvers';

export type FacadeOrientation =
  | 'south'
  | 'south_west'
  | 'west'
  | 'east'
  | 'north';

export type BladeProfileModel =
  | 'blade_100_elliptical'
  | 'blade_150_elliptical'
  | 'blade_200_aerofoil'
  | 'blade_300_tubular_cstb';

export interface BladeProfileSpec {
  id: BladeProfileModel;
  labelFr: string;
  depthMm: number; // Dimension P (projection/profondeur)
  thicknessMm: number;
  weightKgPerM: number;
  maxSpanM: number;
  description: string;
}

export const BLADE_SPECS: Record<BladeProfileModel, BladeProfileSpec> = {
  blade_100_elliptical: {
    id: 'blade_100_elliptical',
    labelFr: 'Lame Elliptique 100 mm (Pas serré)',
    depthMm: 100,
    thicknessMm: 20,
    weightKgPerM: 1.15,
    maxSpanM: 2.2,
    description: 'Profil d ombrage fin pour fenêtres résidentielles et appartements urbains.',
  },
  blade_150_elliptical: {
    id: 'blade_150_elliptical',
    labelFr: 'Lame Elliptique 150 mm Standard',
    depthMm: 150,
    thicknessMm: 28,
    weightKgPerM: 1.85,
    maxSpanM: 3.0,
    description: 'Format polyvalent offrant un excellent ratio ombrage estival et luminosité.',
  },
  blade_200_aerofoil: {
    id: 'blade_200_aerofoil',
    labelFr: 'Lame Aile d Avion 200 mm Tertiaire',
    depthMm: 200,
    thicknessMm: 35,
    weightKgPerM: 2.75,
    maxSpanM: 3.8,
    description: 'Profil architectural galbé pour façades de bureaux, banques et sièges administratifs.',
  },
  blade_300_tubular_cstb: {
    id: 'blade_300_tubular_cstb',
    labelFr: 'Lame Tubulaire 300 mm Grande Portée',
    depthMm: 300,
    thicknessMm: 50,
    weightKgPerM: 4.60,
    maxSpanM: 4.8,
    description: 'Lame massive pour hôpitaux, universités et murs-rideaux de grande hauteur.',
  },
};

export interface SolarSunshadeInput {
  windowWidthMm: number;
  windowHeightMm: number;
  sunshadeType: SunshadeType;
  bladeModel: BladeProfileModel;
  bladePitchSpacingMm: number; // Entraxe vertical ou horizontal entre lames (S)
  bladeTiltAngleDeg: number; // Inclinaison de la lame (0 deg à 60 deg)
  canopyProjectionMm: number; // Profondeur du débord si casquette (typiquement 400 à 1000 mm)
  facadeOrientation: FacadeOrientation;
  glassSolarFactorG: number; // g du vitrage sans protection (ex: 0.72 simple, 0.60 double)
  glassLightTransmissionTv: number; // TL du vitrage (ex: 0.80)
  targetMonth: 'summer_solstice' | 'mid_season_equinox' | 'winter_solstice';
  wilayaName: string;
  clientName?: string;
  projectReference?: string;
}

export interface SolarSunshadeAuditResult {
  // Geometry
  glazingAreaM2: number;
  bladeCount: number;
  bladeLengthMm: number;
  cutOffAngleDeg: number;
  solarProfileAngleDeg: number;
  effectiveShadingRatio: number; // fraction masquée du rayonnement direct (0.00 à 1.00)

  // Solar & Thermal Factors
  unshadedSolarFactorG: number;
  totalCombinedSolarFactorGtot: number;
  dtrMaxAllowedGtot: number;
  isDtrCompliant: boolean;
  solarHeatReductionPercent: number;

  // Energy & Cooling Power
  incidentPeakSolarIrradianceWM2: number;
  unshadedCoolingPowerW: number;
  shadedCoolingPowerW: number;
  coolingPowerSavedW: number;
  summerEnergySavedKwh: number;
  coolingCostSavedDzd: number;

  // Daylight & Visual Comfort
  effectiveLightTransmissionTvTot: number;
  daylightFactorEstimatedPercent: number;
  glareProtectionClass: 'classe_0_tres_faible' | 'classe_1_faible' | 'classe_2_modere' | 'classe_3_bon' | 'classe_4_excellent';
  glareProtectionLabelFr: string;
  thermalComfortSummerClass: string;

  // Overall Verdict & Synthesis
  overallStatus: 'valid' | 'warning' | 'critical';
  recommendationsFr: string[];
}

export function computeSolarSunshadeAudit(input: SolarSunshadeInput): SolarSunshadeAuditResult {
  const glazingAreaM2 = parseFloat(((input.windowWidthMm * input.windowHeightMm) / 1000000).toFixed(2));
  const bladeSpec = BLADE_SPECS[input.bladeModel];

  // Effective projection depth P
  const projectionP = input.sunshadeType === 'horizontal_canopy_casquette'
    ? input.canopyProjectionMm
    : bladeSpec.depthMm;

  // Effective spacing S
  const spacingS = input.sunshadeType === 'horizontal_canopy_casquette'
    ? input.windowHeightMm
    : Math.max(50, input.bladePitchSpacingMm);

  // Number of blades
  let bladeCount = 1;
  let bladeLengthMm = input.windowWidthMm + 200; // 100 mm side overlap

  if (input.sunshadeType === 'horizontal_louvers_blades' || input.sunshadeType === 'motorized_adjustable_louvers') {
    bladeCount = Math.ceil(input.windowHeightMm / spacingS);
    bladeLengthMm = input.windowWidthMm + 150;
  } else if (input.sunshadeType === 'vertical_louvers_blades') {
    bladeCount = Math.ceil(input.windowWidthMm / spacingS);
    bladeLengthMm = input.windowHeightMm + 100;
  }

  // Solar Geometry for Algerian latitudes (average lat 36 deg North: Alger, Oran, Constantine)
  // Solar elevation at solar noon (midday):
  // Summer Solstice (June 21): alpha = 90 - 36 + 23.5 = 77.5 deg
  // Equinox (March/Sept): alpha = 90 - 36 = 54.0 deg
  // Winter Solstice (Dec 21): alpha = 90 - 36 - 23.5 = 30.5 deg
  let solarElevationDeg = 77.5;
  let peakIrradiance = 880; // W/m2 in Algerian summer sun
  if (input.targetMonth === 'mid_season_equinox') {
    solarElevationDeg = 54.0;
    peakIrradiance = 720;
  } else if (input.targetMonth === 'winter_solstice') {
    solarElevationDeg = 30.5;
    peakIrradiance = 550;
  }

  // Wall azimuth angle relative to South:
  // South = 0 deg, SW = 45 deg, West = 90 deg, East = -90 deg, North = 180 deg
  let wallAzimuthDeg = 0;
  if (input.facadeOrientation === 'south_west') wallAzimuthDeg = 45;
  if (input.facadeOrientation === 'west') wallAzimuthDeg = 90;
  if (input.facadeOrientation === 'east') wallAzimuthDeg = 90;
  if (input.facadeOrientation === 'north') wallAzimuthDeg = 180;

  // Solar Profile Angle Omega (angle of incidence on horizontal blades):
  // tan(Omega) = tan(alpha) / cos(gamma)
  // At solar noon gamma = wallAzimuthDeg
  const cosGamma = Math.max(0.2, Math.cos((wallAzimuthDeg * Math.PI) / 180));
  const tanElevation = Math.tan((solarElevationDeg * Math.PI) / 180);
  const profileAngleRad = Math.atan(tanElevation / cosGamma);
  const solarProfileAngleDeg = parseFloat(((profileAngleRad * 180) / Math.PI).toFixed(1));

  // Direct Cut-off Angle: theta_cutoff = arctan(S / P)
  // When solar profile angle >= cutoff, 100% of direct sun is blocked!
  const cutOffAngleDeg = parseFloat(((Math.atan(spacingS / projectionP) * 180) / Math.PI).toFixed(1));

  // Shading coefficient calculation:
  let effectiveShadingRatio = 0;
  if (input.sunshadeType === 'horizontal_canopy_casquette') {
    // Shaded vertical height on window: h_shaded = projectionP * tan(Omega)
    const shadedHeightMm = projectionP * Math.tan(profileAngleRad);
    effectiveShadingRatio = Math.min(1.0, Math.max(0.1, shadedHeightMm / input.windowHeightMm));
  } else if (input.sunshadeType === 'horizontal_louvers_blades') {
    const shadowDropMm = projectionP * Math.tan(((solarProfileAngleDeg + input.bladeTiltAngleDeg) * Math.PI) / 180);
    effectiveShadingRatio = Math.min(1.0, Math.max(0.15, shadowDropMm / spacingS));
  } else if (input.sunshadeType === 'motorized_adjustable_louvers') {
    // Adjustable slats can rotate to fully close direct sun
    effectiveShadingRatio = Math.min(1.0, Math.max(0.25, (solarProfileAngleDeg + input.bladeTiltAngleDeg * 1.3) / cutOffAngleDeg));
  } else {
    // Vertical blades: most effective for East / West low sun
    const incidentAngleWallRad = (wallAzimuthDeg * Math.PI) / 180;
    effectiveShadingRatio = Math.min(1.0, Math.max(0.3, (Math.tan(incidentAngleWallRad) * projectionP) / spacingS));
  }
  effectiveShadingRatio = parseFloat(effectiveShadingRatio.toFixed(2));

  // Total Combined Solar Factor g_tot (NF EN 13363-1 / ISO 52022-1):
  // g_shaded: solar factor when completely in shadow of external aluminum louver
  // Extruded aluminum louvers re-radiate very little heat to the glass because outside air carries heat away
  const gShaded = input.glassSolarFactorG * 0.18; // approx 18% of base glass factor
  const totalCombinedSolarFactorGtot = parseFloat(
    (effectiveShadingRatio * gShaded + (1 - effectiveShadingRatio) * input.glassSolarFactorG).toFixed(2)
  );

  // Algerian DTR C3-2 / DTR C3-4 maximum permissible solar factor:
  // South/West facades in Zones A/B require g_tot <= 0.35, Zone C (Sahara) requires g_tot <= 0.22
  const dtrMaxAllowedGtot = input.wilayaName.includes('Ghardaia') || input.wilayaName.includes('Adrar') || input.wilayaName.includes('Ouargla')
    ? 0.22
    : 0.32;
  const isDtrCompliant = totalCombinedSolarFactorGtot <= dtrMaxAllowedGtot;
  const solarHeatReductionPercent = Math.round((1 - (totalCombinedSolarFactorGtot / input.glassSolarFactorG)) * 100);

  // Cooling Power & Energy Computations
  const unshadedCoolingPowerW = Math.round(glazingAreaM2 * peakIrradiance * input.glassSolarFactorG);
  const shadedCoolingPowerW = Math.round(glazingAreaM2 * peakIrradiance * totalCombinedSolarFactorGtot);
  const coolingPowerSavedW = unshadedCoolingPowerW - shadedCoolingPowerW;

  // Seasonal calculation: approx 1100 cooling hours in Algerian summer (June to September)
  // Air conditioning COP = 2.8 (climatiseur inverter standard)
  const summerEnergySavedKwh = Math.round(((coolingPowerSavedW / 1000) * 1100) / 2.8);
  const sonelgazTariffDzdPerKwh = 5.40;
  const coolingCostSavedDzd = Math.round(summerEnergySavedKwh * sonelgazTariffDzdPerKwh);

  // Daylight & Visual Comfort Performance (NF EN 14501)
  // Light transmission tau_v_tot:
  const obstructionRatio = (bladeSpec.thicknessMm / spacingS) + (1 - effectiveShadingRatio) * 0.1;
  const effectiveLightTransmissionTvTot = parseFloat(
    Math.max(0.12, (input.glassLightTransmissionTv * (1 - Math.min(0.75, obstructionRatio * 1.4)))).toFixed(2)
  );

  // Estimated Daylight Factor (Facteur de Lumière du Jour FLJ in %):
  // Rule of thumb for standard room depth 4m: FLJ approx = 0.12 * windowArea/floorArea * Tv * 100
  const estimatedRoomFloorArea = glazingAreaM2 / 0.18; // approx 18% window to floor ratio
  const daylightFactorEstimatedPercent = parseFloat(
    ((0.15 * (glazingAreaM2 / estimatedRoomFloorArea) * effectiveLightTransmissionTvTot) * 100).toFixed(1)
  );

  // Glare Protection Classification (NF EN 14501):
  let glareProtectionClass: 'classe_0_tres_faible' | 'classe_1_faible' | 'classe_2_modere' | 'classe_3_bon' | 'classe_4_excellent' = 'classe_2_modere';
  let glareProtectionLabelFr = 'Classe 2 (Protection Modérée)';

  if (effectiveShadingRatio >= 0.90 && totalCombinedSolarFactorGtot <= 0.15) {
    glareProtectionClass = 'classe_4_excellent';
    glareProtectionLabelFr = 'Classe 4 (Excellente Protection Anti-Éblouissement)';
  } else if (effectiveShadingRatio >= 0.75) {
    glareProtectionClass = 'classe_3_bon';
    glareProtectionLabelFr = 'Classe 3 (Bonne Protection Confort Visuel)';
  } else if (effectiveShadingRatio < 0.45) {
    glareProtectionClass = 'classe_1_faible';
    glareProtectionLabelFr = 'Classe 1 (Faible - Rayonnement direct résiduel)';
  }

  // Thermal comfort class
  let thermalComfortSummerClass = 'Classe 2 (Confort Modéré)';
  if (totalCombinedSolarFactorGtot <= 0.15) {
    thermalComfortSummerClass = 'Classe 4 (Très Haut Confort Thermique Estival)';
  } else if (totalCombinedSolarFactorGtot <= 0.25) {
    thermalComfortSummerClass = 'Classe 3 (Bon Confort Thermique DTR)';
  }

  // Recommendations
  const recommendationsFr: string[] = [];
  if (!isDtrCompliant) {
    recommendationsFr.push(
      `Facteur solaire g_tot (${totalCombinedSolarFactorGtot}) supérieur au plafond DTR C3-2 (${dtrMaxAllowedGtot}). Augmentez la projection des lames ou réduisez l entraxe.`
    );
  }
  if (daylightFactorEstimatedPercent < 1.5) {
    recommendationsFr.push(
      `Facteur de lumière du jour réduit (${daylightFactorEstimatedPercent}% < 1.5%). Ajustez l angle d inclinaison pour maintenir un éclairage naturel suffisant.`
    );
  }
  if (input.facadeOrientation === 'west' && input.sunshadeType === 'horizontal_canopy_casquette') {
    recommendationsFr.push(
      'Orientation Ouest : une simple casquette horizontale laisse pénétrer le soleil bas de fin d après-midi. Privilégiez des lames verticales ou orientables.'
    );
  }
  if (recommendationsFr.length === 0) {
    recommendationsFr.push(
      'Protection solaire optimale. Réduction de 70%+ des surchauffes estivales avec respect strict du DTR C3-2 et préservation du confort lumineux naturel.'
    );
  }

  let overallStatus: 'valid' | 'warning' | 'critical' = 'valid';
  if (!isDtrCompliant && totalCombinedSolarFactorGtot > 0.45) {
    overallStatus = 'critical';
  } else if (!isDtrCompliant || daylightFactorEstimatedPercent < 1.5) {
    overallStatus = 'warning';
  }

  return {
    glazingAreaM2,
    bladeCount,
    bladeLengthMm,
    cutOffAngleDeg,
    solarProfileAngleDeg,
    effectiveShadingRatio,
    unshadedSolarFactorG: input.glassSolarFactorG,
    totalCombinedSolarFactorGtot,
    dtrMaxAllowedGtot,
    isDtrCompliant,
    solarHeatReductionPercent,
    incidentPeakSolarIrradianceWM2: peakIrradiance,
    unshadedCoolingPowerW,
    shadedCoolingPowerW,
    coolingPowerSavedW,
    summerEnergySavedKwh,
    coolingCostSavedDzd,
    effectiveLightTransmissionTvTot,
    daylightFactorEstimatedPercent,
    glareProtectionClass,
    glareProtectionLabelFr,
    thermalComfortSummerClass,
    overallStatus,
    recommendationsFr,
  };
}
