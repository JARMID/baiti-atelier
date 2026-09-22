import type { LinearOptimizationResult, OptimizedBar1D, PlacedCut1D } from '../types/optimizer';

/**
 * Generates ISO Standard G-Code for electronic pusher digital stops
 * (Compatible with GRBL, Mach3, LinuxCNC, TigerStop, and DIY workshop pushers)
 */
export function generateSawGcode(solution: LinearOptimizationResult, jobName: string): string {
  let gcode = `; ==========================================\n`;
  gcode += `; BAITI ATELIER | بيتي - PROGRAMME SCIE CNC\n`;
  gcode += `; CHANTIER: ${jobName}\n`;
  gcode += `; DATE: ${new Date().toISOString()}\n`;
  gcode += `; TOTAL BARRES: ${solution.totalStockBars}\n`;
  gcode += `; RENDEMENT GLOBAL: ${(solution.overallUtilizationRate * 100).toFixed(1)}%\n`;
  gcode += `; ==========================================\n\n`;
  gcode += `G21 ; Unités métriques (mm)\n`;
  gcode += `G90 ; Positionnement absolu\n\n`;

  solution.bars.forEach((bar: OptimizedBar1D) => {
    gcode += `; --- DEBUT BARRE #${bar.barIndex} (Longueur: ${bar.stockLength} mm) ---\n`;
    gcode += `M08 ; Serrage vérins pneumatiques\n`;
    bar.cuts.forEach((cut: PlacedCut1D, idx: number) => {
      gcode += `; Piece ${idx + 1}: ${cut.label} (${cut.length}mm, Angles: ${cut.miterLeft}° / ${cut.miterRight}°)\n`;
      gcode += `G00 X${cut.length.toFixed(2)} ; Butée numérique\n`;
      gcode += `M21 A${cut.miterLeft} B${cut.miterRight} ; Orientation têtes de coupe\n`;
      gcode += `M03 S2800 ; Mise en rotation lame carbure\n`;
      gcode += `G01 Z-120.0 F800 ; Descente lame avec microlubrification\n`;
      gcode += `G00 Z10.0 ; Remontée de lame\n`;
      gcode += `M05 ; Arrêt lame\n\n`;
    });
    gcode += `M09 ; Desserrage vérins\n`;
    gcode += `; --- FIN BARRE #${bar.barIndex} (Chute: ${bar.wasteLength} mm) ---\n\n`;
  });

  gcode += `M30 ; Fin de cycle\n`;
  return gcode;
}

/**
 * Generates CSV / TSV cut list for TigerStop and computerized miter saws
 * (Format: BarIndex;Sequence;LengthMM;AngleLeft;AngleRight;ProfileCode;Label;Barcode)
 */
export function generateTigerStopCsv(solution: LinearOptimizationResult, jobName: string): string {
  const lines: string[] = [];
  lines.push('Barre;Sequence;Longueur_MM;Angle_G;Angle_D;Profil;Designation;Chantier;CodeBarre');

  solution.bars.forEach((bar) => {
    bar.cuts.forEach((cut, cutIdx) => {
      const barcode = `BAR${bar.barIndex}-P${cutIdx + 1}-${Math.round(cut.length)}`;
      lines.push(
        `${bar.barIndex};${cutIdx + 1};${cut.length.toFixed(1)};${cut.miterLeft};${cut.miterRight};${cut.profileCode || 'ALU-40'};"${cut.label}";"${jobName}";${barcode}`
      );
    });
  });

  return lines.join('\r\n');
}

/**
 * Generates Elumatec / FOM Industrie XML cut job format
 */
export function generateElumatecXml(solution: LinearOptimizationResult, jobName: string): string {
  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<Job name="${jobName}" date="${new Date().toISOString()}">\n`;
  xml += `  <Summary totalBars="${solution.totalStockBars}" utilization="${(solution.overallUtilizationRate * 100).toFixed(1)}"/>\n`;
  xml += `  <Bars>\n`;

  solution.bars.forEach((bar) => {
    xml += `    <Bar index="${bar.barIndex}" stockLength="${bar.stockLength}" waste="${bar.wasteLength}">\n`;
    bar.cuts.forEach((cut, idx) => {
      xml += `      <Piece seq="${idx + 1}" length="${cut.length.toFixed(1)}" leftAngle="${cut.miterLeft}" rightAngle="${cut.miterRight}" profile="${cut.profileCode || 'ALU'}" label="${cut.label}"/>\n`;
    });
    xml += `    </Bar>\n`;
  });

  xml += `  </Bars>\n`;
  xml += `</Job>\n`;
  return xml;
}

/**
 * Triggers a client-side file download
 */
export function downloadSawFile(content: string, filename: string, mimeType = 'text/plain;charset=utf-8'): void {
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
