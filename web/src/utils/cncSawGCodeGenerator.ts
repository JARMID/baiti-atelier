import type { OptimizedBar1D } from '../types/optimizer';

export type CncMachineBrand = 'iso_gcode' | 'elumatec' | 'emmegi' | 'yilmaz' | 'fom_industrie';

export interface CncSawExportOptions {
  machineType: CncMachineBrand;
  jobName: string;
  profileCode: string;
  bladeDiameterMm?: number; // default 500mm
  spindleRpm?: number; // default 3200 RPM
  feedRateMmMin?: number; // default 450 mm/min
  operatorName?: string;
  wilaya?: string;
}

/**
 * Calculates effective blade kerf compensation for miter angles
 * For 45-degree angle, effective kerf across the profile axis is kerf * sqrt(2)
 */
export function calculateEffectiveKerf(baseKerf: number, angleDeg: 45 | 90): number {
  if (angleDeg === 90) return baseKerf;
  return Number((baseKerf * Math.SQRT2).toFixed(2));
}

/**
 * Universal ISO Standard G-Code for CNC automated double-miter saws
 */
export function generateIsoGCode(
  bars: OptimizedBar1D[],
  options: CncSawExportOptions
): string {
  const {
    jobName,
    profileCode,
    spindleRpm = 3200,
    feedRateMmMin = 450,
    operatorName = 'Atelier Baiti',
  } = options;

  const dateStr = new Date().toISOString().split('T')[0];
  const lines: string[] = [];

  lines.push(`%`);
  lines.push(`(================================================)`);
  lines.push(`( PROGRAMME CN DEBITAGE SCIE DOUBLE-TETE        )`);
  lines.push(`( PROJET: ${jobName.toUpperCase()} )`);
  lines.push(`( PROFILE: ${profileCode} )`);
  lines.push(`( DATE: ${dateStr} | OPERATEUR: ${operatorName} )`);
  lines.push(`( SYSTEME: BAITI ATELIER ALGERIE - DTR C3-2     )`);
  lines.push(`(================================================)`);
  lines.push(``);
  lines.push(`G21          (Unites millimetriques)`);
  lines.push(`G90          (Coordonnees absolues)`);
  lines.push(`G17          (Plan de travail XY)`);
  lines.push(`G94          (Vitesse d'avance en mm/min)`);
  lines.push(``);

  bars.forEach((bar, bIdx) => {
    const barNum = bIdx + 1;
    lines.push(`(------------------------------------------------)`);
    lines.push(`( BARRE N° ${barNum} SUR ${bars.length} - LONGUEUR: ${bar.stockLength} mm )`);
    lines.push(`( CHUTES RESTANTES: ${bar.wasteLength.toFixed(1)} mm )`);
    lines.push(`(------------------------------------------------)`);
    lines.push(`M00          (Pause: Charger barre brute en butee)`);
    lines.push(`M08          (Serrage etau pneumatique principal)`);
    lines.push(`M03 S${spindleRpm} (Demarrage rotation des lames)`);
    lines.push(`G04 P1.5     (Temporisation montee en regime)`);
    lines.push(``);

    // Initial trim cut (défraîchissage)
    if (bar.clampTrim > 0) {
      lines.push(`( Defraichissage d'entame: ${bar.clampTrim} mm )`);
      lines.push(`G00 X${bar.clampTrim} A90.0 B90.0`);
      lines.push(`M10          (Micro-pulverisation lubrifiant)`);
      lines.push(`G01 Z-45.0 F${feedRateMmMin} (Descente lame entame)`);
      lines.push(`G00 Z5.0     (Remontee rapide lame)`);
      lines.push(`M11          (Arret pulverisation)`);
      lines.push(``);
    }

    bar.cuts.forEach((cut, cIdx) => {
      const cutNum = cIdx + 1;
      const angleA = cut.miterLeft;
      const angleB = cut.miterRight;

      lines.push(`( Piece ${barNum}.${cutNum}: ${cut.label} - L=${cut.length}mm - ${angleA}°/${angleB}° )`);
      lines.push(`G00 X${cut.endPosition.toFixed(1)} A${angleA}.0 B${angleB}.0`);
      lines.push(`M08          (Validation serrage piece)`);
      lines.push(`M10          (Micro-pulverisation active)`);
      lines.push(`G01 Z-55.0 F${feedRateMmMin} (Descente lame de coupe)`);
      lines.push(`G04 P0.2     (Pause en fin de course)`);
      lines.push(`G00 Z10.0    (Degagement rapide de la lame)`);
      lines.push(`M11          (Arret pulverisation)`);
      lines.push(`M09          (Desserrage etau piece terminee)`);
      lines.push(``);
    });

    lines.push(`M05          (Arret rotation des lames)`);
    lines.push(`M09          (Ouverture totale des presseurs)`);
    lines.push(`G00 X0.0     (Retour chariot pousseur a l'origine)`);
    lines.push(``);
  });

  lines.push(`M30          (Fin de programme et rebouclage)`);
  lines.push(`%`);

  return lines.join('\n');
}

/**
 * Elumatec DG 244 / DG 142 double-miter saw CSV interface format
 */
export function generateElumatecData(
  bars: OptimizedBar1D[],
  options: CncSawExportOptions
): string {
  const lines: string[] = [];
  lines.push(`[HEADER]`);
  lines.push(`VERSION=4.2`);
  lines.push(`PROJECT=${options.jobName}`);
  lines.push(`PROFILE=${options.profileCode}`);
  lines.push(`TOTAL_BARS=${bars.length}`);
  lines.push(`DATE=${new Date().toISOString()}`);
  lines.push(`[CUTS]`);
  lines.push(`BarId;CutIndex;PieceId;LengthMm;AngleLeft;AngleRight;ProfileCode;Label;RemnantMm`);

  bars.forEach((bar, bIdx) => {
    bar.cuts.forEach((cut, cIdx) => {
      lines.push(
        `${bIdx + 1};${cIdx + 1};${cut.id};${cut.length.toFixed(1)};${cut.miterLeft};${cut.miterRight};${options.profileCode};"${cut.label}";${bar.wasteLength.toFixed(1)}`
      );
    });
  });

  return lines.join('\n');
}

/**
 * Emmegi Precision TS2 / Classic Star saw cutting list format
 */
export function generateEmmegiFormat(
  bars: OptimizedBar1D[],
  options: CncSawExportOptions
): string {
  const lines: string[] = [];
  lines.push(`JOB_NAME,BAR_INDEX,PIECE_INDEX,LENGTH,ANGLE_L,ANGLE_R,PROFILE,DESIGNATION,WASTE`);
  bars.forEach((bar, bIdx) => {
    bar.cuts.forEach((cut, cIdx) => {
      lines.push(
        `"${options.jobName}",${bIdx + 1},${cIdx + 1},${cut.length.toFixed(1)},${cut.miterLeft},${cut.miterRight},"${options.profileCode}","${cut.label}",${bar.wasteLength.toFixed(1)}`
      );
    });
  });
  return lines.join('\n');
}

/**
 * Yilmaz DC 421 PB / DC 550 PB saw format
 */
export function generateYilmazFormat(
  bars: OptimizedBar1D[],
  options: CncSawExportOptions
): string {
  const lines: string[] = [];
  lines.push(`// YILMAZ CNC CUTTING FILE`);
  lines.push(`// FILE CREATED BY BAITI ATELIER`);
  lines.push(`// JOB: ${options.jobName}`);
  lines.push(`// PROFILE: ${options.profileCode}`);
  lines.push(`// ===================================`);

  bars.forEach((bar, bIdx) => {
    lines.push(`BAR_START:${bIdx + 1},LENGTH:${bar.stockLength}`);
    bar.cuts.forEach((cut, cIdx) => {
      lines.push(
        `CUT:${cIdx + 1},LEN:${cut.length.toFixed(1)},AL:${cut.miterLeft},AR:${cut.miterRight},ID:${cut.id},DESC:${cut.label}`
      );
    });
    lines.push(`BAR_END:${bIdx + 1},REMNANT:${bar.wasteLength.toFixed(1)}`);
  });

  return lines.join('\n');
}

/**
 * Dispatches file generation based on selected brand
 */
export function generateCncSawFile(
  bars: OptimizedBar1D[],
  options: CncSawExportOptions
): { content: string; filename: string; mimeType: string } {
  const sanitizedName = options.jobName.replace(/[^a-zA-Z0-9_-]/g, '_').toLowerCase();

  switch (options.machineType) {
    case 'elumatec':
      return {
        content: generateElumatecData(bars, options),
        filename: `${sanitizedName}_elumatec.dat`,
        mimeType: 'text/plain;charset=utf-8',
      };
    case 'emmegi':
      return {
        content: generateEmmegiFormat(bars, options),
        filename: `${sanitizedName}_emmegi.csv`,
        mimeType: 'text/csv;charset=utf-8',
      };
    case 'yilmaz':
      return {
        content: generateYilmazFormat(bars, options),
        filename: `${sanitizedName}_yilmaz.txt`,
        mimeType: 'text/plain;charset=utf-8',
      };
    case 'iso_gcode':
    case 'fom_industrie':
    default:
      return {
        content: generateIsoGCode(bars, options),
        filename: `${sanitizedName}_saw.nc`,
        mimeType: 'text/plain;charset=utf-8',
      };
  }
}

/**
 * Initiates browser download of generated CNC code file
 */
export function downloadCncSawFile(
  bars: OptimizedBar1D[],
  options: CncSawExportOptions
): void {
  const { content, filename, mimeType } = generateCncSawFile(bars, options);
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Calculates estimated machine cycle time in minutes
 */
export function estimateSawCycleTimeSeconds(bars: OptimizedBar1D[]): {
  perBarSec: number;
  totalMinutes: number;
} {
  let totalSeconds = 0;
  bars.forEach((bar) => {
    // 15 seconds to load bar, clamp, and trim
    let barTime = 15;
    // 6 seconds per cut (pusher advance, clamp, plunge, return, unclamp)
    barTime += bar.cuts.length * 6;
    // 5 seconds bar unload
    barTime += 5;
    totalSeconds += barTime;
  });

  const perBarSec = bars.length > 0 ? Math.round(totalSeconds / bars.length) : 0;
  const totalMinutes = Number((totalSeconds / 60).toFixed(1));

  return { perBarSec, totalMinutes };
}
