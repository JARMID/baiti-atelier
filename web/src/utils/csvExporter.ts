import type { WorkshopBOM } from '../types/cad';
import type { WindowConfig } from '../types/window';
import type { LinearOptimizationResult } from '../types/optimizer';

/**
 * Exports detailed workshop Bill of Materials (BOM) to CSV format
 * formatted for Algerian joinery workshops and double-head saw imports.
 */
export function downloadBomCsv(
  bom: WorkshopBOM,
  config: WindowConfig,
  filename: string = 'fiche_debit_atelier.csv'
): void {
  const lines: string[] = [];

  // Header information
  lines.push('BAITI ATELIER | بيتي - FICHE DE DEBIT & NOMENCLATURE QUINCAILLERIE');
  lines.push(`Chassis: ${config.width} x ${config.height} mm;Gamme: ${config.profileSystem};Vitrage: ${config.glassType}`);
  lines.push(`Date: ${new Date().toLocaleDateString('fr-FR')};Besoin Estime: ${bom.estimatedBars6m} barres de 6.0m;Masse Profils: ${bom.totalProfileWeightKg} kg`);
  lines.push('');

  // 1. SECTION: DECOUPE PROFILES
  lines.push('--- SECTION 1: DEBITAGE PROFILS ET TRAVERSES ---');
  lines.push('Reference;Designation;Role;Longueur (mm);Angle Gauche;Angle Droit;Quantite');
  bom.cuts.forEach((cut, idx) => {
    lines.push(
      `#${idx + 1};${cut.label};${cut.role};${cut.lengthMm};${cut.cutLeftAngle}°;${cut.cutRightAngle}°;${cut.quantity}`
    );
  });
  lines.push('');

  // 2. SECTION: VOLUMES DE VERRE
  lines.push('--- SECTION 2: VOLUMES DE VITRAGE ---');
  lines.push('Reference;Designation;Largeur (mm);Hauteur (mm);Surface (m2);Type Verre;Quantite');
  bom.glasses.forEach((glass, idx) => {
    lines.push(
      `V#${idx + 1};${glass.label};${glass.widthMm};${glass.heightMm};${glass.areaM2};${glass.glassType};${glass.quantity}`
    );
  });
  lines.push('');

  // 3. SECTION: QUINCAILLERIE & ACCESSOIRES
  lines.push('--- SECTION 3: QUINCAILLERIE ET ACCESSOIRES ---');
  lines.push('Designation;Quantite;Unite');
  bom.hardwareSummary.forEach((item) => {
    lines.push(`${item.name};${item.quantity};${item.unit}`);
  });

  // Prepend UTF-8 BOM so Excel on Windows handles special characters cleanly
  const csvContent = '\uFEFF' + lines.join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Exports optimized 1D linear cut sheet to CSV format
 * formatted for workshop saw operators with bar-by-bar cutting patterns.
 */
export function downloadLinearCutPlanCsv(
  result: LinearOptimizationResult,
  filename: string = 'plan_debit_optimise.csv'
): void {
  const lines: string[] = [];
  lines.push('BAITI ATELIER | بيتي - PLAN DE DEBIT LINEAIRE OPTIMISE');
  lines.push(`Barres Necessaires: ${result.totalStockBars};Chutes Reutilisables: ${result.newRemnantsGenerated};Taux Utilisation Moyen: ${(result.overallUtilizationRate * 100).toFixed(1)}%`);
  lines.push(`Date: ${new Date().toLocaleDateString('fr-FR')}`);
  lines.push('');
  lines.push('Barre #;Longueur Stock (mm);Utilisation (%);Chute (mm);Chute Reutilisable;Detail des Coupes (mm)');
  result.bars.forEach((bar) => {
    const cutsDetail = bar.cuts.map((c) => `${c.label}: ${c.length}mm (${c.miterLeft}°/${c.miterRight}°)`).join(' + ');
    lines.push(
      `#${bar.barIndex};${bar.stockLength};${(bar.utilizationRate * 100).toFixed(1)}%;${bar.wasteLength};${bar.isReusableRemnant ? 'OUI' : 'NON'};"${cutsDetail}"`
    );
  });

  const csvContent = '\uFEFF' + lines.join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
