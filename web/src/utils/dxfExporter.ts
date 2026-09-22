import type { CadStructure } from '../types/cad';
import { computeCadCells } from './cadEngine';

/**
 * Generates an AutoCAD R2000 (AC1015) compliant ASCII DXF file
 * for window blueprints, including outer frame, mullions, transoms,
 * sashes, glass panes, and millimeter dimension annotations.
 */
export function generateCadDxf(
  structure: CadStructure,
  projectName = 'Menuiserie Baiti'
): string {
  const cells = computeCadCells(structure);
  const width = structure.width;
  const height = structure.height;
  const frameThick = 50; // Standard 50mm frame depth

  const lines: string[] = [];

  // Helper to push key-value pairs
  const pushCode = (code: number | string, val: number | string) => {
    lines.push(code.toString());
    lines.push(val.toString());
  };

  const addLine = (
    layer: string,
    x1: number,
    y1: number,
    x2: number,
    y2: number
  ) => {
    pushCode(0, 'LINE');
    pushCode(8, layer);
    pushCode(10, x1.toFixed(2));
    pushCode(20, y1.toFixed(2));
    pushCode(30, '0.0');
    pushCode(11, x2.toFixed(2));
    pushCode(21, y2.toFixed(2));
    pushCode(31, '0.0');
  };

  const addRect = (
    layer: string,
    x: number,
    y: number,
    w: number,
    h: number
  ) => {
    addLine(layer, x, y, x + w, y);
    addLine(layer, x + w, y, x + w, y + h);
    addLine(layer, x + w, y + h, x, y + h);
    addLine(layer, x, y + h, x, y);
  };

  const addText = (
    layer: string,
    text: string,
    x: number,
    y: number,
    textHeight = 35
  ) => {
    pushCode(0, 'TEXT');
    pushCode(8, layer);
    pushCode(10, x.toFixed(2));
    pushCode(20, y.toFixed(2));
    pushCode(30, '0.0');
    pushCode(40, textHeight.toFixed(2));
    pushCode(1, text);
  };

  const addArc = (
    layer: string,
    cx: number,
    cy: number,
    radius: number,
    startAngle: number,
    endAngle: number
  ) => {
    pushCode(0, 'ARC');
    pushCode(8, layer);
    pushCode(10, cx.toFixed(2));
    pushCode(20, cy.toFixed(2));
    pushCode(30, '0.0');
    pushCode(40, radius.toFixed(2));
    pushCode(50, startAngle.toFixed(2));
    pushCode(51, endAngle.toFixed(2));
  };

  // DXF HEADER
  pushCode(0, 'SECTION');
  pushCode(2, 'HEADER');
  pushCode(9, '$ACADVER');
  pushCode(1, 'AC1015');
  pushCode(9, '$INSUNITS');
  pushCode(70, 4); // Millimeters
  pushCode(0, 'ENDSEC');

  // DXF TABLES & LAYERS
  pushCode(0, 'SECTION');
  pushCode(2, 'TABLES');
  pushCode(0, 'TABLE');
  pushCode(2, 'LAYER');
  pushCode(70, 5);

  const layers = [
    { name: 'CADRE_DORMANT', color: 7 }, // White / Black
    { name: 'MENEAU_TRAVERSE', color: 3 }, // Green
    { name: 'OUVRANTS', color: 4 }, // Cyan
    { name: 'VITRAGE', color: 5 }, // Blue
    { name: 'COTATIONS', color: 1 }, // Red
  ];

  layers.forEach((ly) => {
    pushCode(0, 'LAYER');
    pushCode(2, ly.name);
    pushCode(70, 0);
    pushCode(62, ly.color);
    pushCode(6, 'CONTINUOUS');
  });

  pushCode(0, 'ENDTAB');
  pushCode(0, 'ENDSEC');

  // DXF ENTITIES
  pushCode(0, 'SECTION');
  pushCode(2, 'ENTITIES');

  // 1. Outer Frame (Dormant Extérieur)
  const isArch = Boolean(structure.archType && structure.archType !== 'none');
  let archRise = 0;
  let archRadius = 0;
  let archCenterX = width / 2;
  let archCenterY = height;
  let startDeg = 0;
  let endDeg = 180;

  if (isArch) {
    if (structure.archType === 'full_arch') {
      archRise = width / 2;
      archRadius = width / 2;
      archCenterY = height;
      startDeg = 0;
      endDeg = 180;
    } else {
      archRise = structure.archHeightMm
        ? Math.min(width / 2, Math.max(50, structure.archHeightMm))
        : Math.round(width / 4);
      archRadius = archRise / 2 + (width * width) / (8 * archRise);
      archCenterY = height - (archRadius - archRise);
      const halfAngleRad = Math.asin(Math.min(1, width / (2 * archRadius)));
      const halfAngleDeg = (halfAngleRad * 180) / Math.PI;
      startDeg = 90 - halfAngleDeg;
      endDeg = 90 + halfAngleDeg;
    }

    // Straight bottom and uprights
    addLine('CADRE_DORMANT', 0, 0, width, 0);
    addLine('CADRE_DORMANT', frameThick, frameThick, width - frameThick, frameThick);
    addLine('CADRE_DORMANT', 0, 0, 0, height);
    addLine('CADRE_DORMANT', frameThick, frameThick, frameThick, height);
    addLine('CADRE_DORMANT', width, 0, width, height);
    addLine('CADRE_DORMANT', width - frameThick, frameThick, width - frameThick, height);

    // Imposte transom separator
    addRect('MENEAU_TRAVERSE', frameThick, height - frameThick / 2, width - 2 * frameThick, frameThick);

    // Arches
    addArc('CADRE_DORMANT', archCenterX, archCenterY, archRadius, startDeg, endDeg);
    addArc('CADRE_DORMANT', archCenterX, archCenterY, Math.max(10, archRadius - frameThick), startDeg, endDeg);
    addArc('VITRAGE', archCenterX, archCenterY, Math.max(10, archRadius - frameThick - 10), startDeg, endDeg);
    addText(
      'CADRE_DORMANT',
      `CINTRE R=${Math.round(archRadius)}mm F=${Math.round(archRise)}mm`,
      archCenterX - 180,
      height + archRise / 2,
      28
    );
  } else {
    addRect('CADRE_DORMANT', 0, 0, width, height);
    // Frame inner boundary
    addRect('CADRE_DORMANT', frameThick, frameThick, width - 2 * frameThick, height - 2 * frameThick);
  }

  // 2. Vertical Mullions
  structure.verticalDividers.forEach((x) => {
    const half = frameThick / 2;
    addRect('MENEAU_TRAVERSE', x - half, frameThick, frameThick, height - 2 * frameThick);
  });

  // 3. Horizontal Transoms
  structure.horizontalDividers.forEach((y) => {
    const half = frameThick / 2;
    addRect('MENEAU_TRAVERSE', frameThick, y - half, width - 2 * frameThick, frameThick);
  });

  // 4. Cells (Sashes, Glass, Panels)
  const xSplits = [0, ...structure.verticalDividers.slice().sort((a, b) => a - b), structure.width];
  const ySplits = [0, ...structure.horizontalDividers.slice().sort((a, b) => a - b), structure.height];

  cells.forEach((cell) => {
    const cx = xSplits[cell.col];
    const cy = ySplits[cell.row];
    const cw = cell.widthMm;
    const ch = cell.heightMm;

    if (cell.type.startsWith('sash_')) {
      // Draw sash profile rectangle inside cell
      const sashMargin = 12;
      const sashProfile = 45;
      const sx = cx + sashMargin;
      const sy = cy + sashMargin;
      const sw = cw - 2 * sashMargin;
      const sh = ch - 2 * sashMargin;

      addRect('OUVRANTS', sx, sy, sw, sh);
      addRect('OUVRANTS', sx + sashProfile, sy + sashProfile, sw - 2 * sashProfile, sh - 2 * sashProfile);

      // Label sash type in center
      const label = cell.type === 'sash_left'
        ? 'OUVRANT GAUCHE'
        : cell.type === 'sash_right'
        ? 'OUVRANT DROIT'
        : cell.type === 'sash_tilt_turn'
        ? 'OSCILLO-BATTANT'
        : 'COULISSANT';
      addText('OUVRANTS', label, sx + sw / 4, sy + sh / 2, 24);
    } else {
      // Fixed glass or panel
      addRect('VITRAGE', cx + 10, cy + 10, cw - 20, ch - 20);
      // Small diagonal indicator lines for glass reflection
      addLine('VITRAGE', cx + cw * 0.3, cy + ch * 0.3, cx + cw * 0.45, cy + ch * 0.55);
      addLine('VITRAGE', cx + cw * 0.35, cy + ch * 0.25, cx + cw * 0.55, cy + ch * 0.55);

      const label = cell.type === 'panel_solid' ? 'PANNEAU PLEIN' : 'VITRAGE FIXE';
      addText('VITRAGE', label, cx + cw / 4, cy + ch / 2, 24);
    }

    // Dimension label inside cell
    addText('COTATIONS', `${Math.round(cw)}x${Math.round(ch)}`, cx + cw / 3, cy + 25, 20);
  });

  // 5. Overall Dimension Annotations (Outside window bounds)
  // Width dimension at bottom
  const dimY = -120;
  addLine('COTATIONS', 0, dimY, width, dimY);
  addLine('COTATIONS', 0, dimY - 20, 0, dimY + 20);
  addLine('COTATIONS', width, dimY - 20, width, dimY + 20);
  addText('COTATIONS', `LARGEUR = ${Math.round(width)} mm`, width / 2 - 120, dimY + 25, 32);

  // Height dimension at left
  const dimX = -120;
  addLine('COTATIONS', dimX, 0, dimX, height);
  addLine('COTATIONS', dimX - 20, 0, dimX + 20, 0);
  addLine('COTATIONS', dimX - 20, height, dimX + 20, height);
  addText('COTATIONS', `HAUTEUR = ${Math.round(height)} mm`, dimX - 350, height / 2, 32);

  // Title Block in DXF
  addText('COTATIONS', `BAITI ATELIER - ${projectName}`, 0, height + 80, 40);
  addText('COTATIONS', `ECHELLE 1:1 (UNITE: MM) - DATE: ${new Date().toLocaleDateString('fr-DZ')}`, 0, height + 35, 22);

  // DXF TAIL
  pushCode(0, 'ENDSEC');
  pushCode(0, 'EOF');

  return lines.join('\n');
}

/**
 * Triggers a browser download of the generated .dxf file
 */
export function downloadCadDxf(
  structure: CadStructure,
  filename = 'plan_menuiserie.dxf',
  projectName = 'Chantier Menuiserie Baiti'
): void {
  const dxfContent = generateCadDxf(structure, projectName);
  const blob = new Blob([dxfContent], { type: 'application/dxf;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
