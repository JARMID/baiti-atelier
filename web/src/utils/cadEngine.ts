import type {
  CadCell,
  CadStructure,
  CutPieceDetail,
  GlassCutDetail,
  HardwareItemDetail,
  WorkshopBOM,
  ArchSpecification,
  ArchType,
  RollerShutterConfig,
  RollerShutterBOM,
  RollerShutterComponent,
} from '../types/cad';
import type { WindowConfig } from '../types/window';

export function computeArchSpecification(
  width: number,
  archType: ArchType = 'none',
  customRiseMm?: number
): ArchSpecification | undefined {
  if (!archType || archType === 'none') return undefined;

  let rise = archType === 'full_arch' ? Math.round(width / 2) : (customRiseMm || Math.round(width / 4));
  rise = Math.min(Math.round(width / 2), Math.max(50, rise));

  let radius = rise;
  let angleRad = Math.PI;

  if (archType === 'full_arch') {
    radius = width / 2;
    angleRad = Math.PI;
  } else {
    // Segmental arch curvature formula: R = f/2 + W^2 / (8f)
    radius = rise / 2 + (width * width) / (8 * rise);
    angleRad = 2 * Math.asin(Math.min(1, width / (2 * radius)));
  }

  const arcLength = radius * angleRad;
  const clampLead = 200; // 100mm straight lead on each end for the 3-roller bending machine
  const totalProfile = Math.round(arcLength + clampLead);
  const angleDeg = Math.round((angleRad * 180) / Math.PI);

  return {
    type: archType,
    riseMm: Math.round(rise),
    radiusMm: Math.round(radius),
    arcLengthMm: Math.round(arcLength),
    clampLeadMm: clampLead,
    totalProfileMm: totalProfile,
    angleDeg,
  };
}

export function computeCadCells(structure: CadStructure): CadCell[] {
  const frameFace = 55; // 55mm standard frame profile face

  // Sorted division positions
  const xSplits = [0, ...structure.verticalDividers.slice().sort((a, b) => a - b), structure.width];
  const ySplits = [0, ...structure.horizontalDividers.slice().sort((a, b) => a - b), structure.height];

  const cells: CadCell[] = [];

  // Rows from top to bottom (ySplits descending)
  for (let r = 0; r < ySplits.length - 1; r++) {
    const yBottom = ySplits[r];
    const yTop = ySplits[r + 1];
    const cellHeight = Math.max(50, yTop - yBottom);

    for (let c = 0; c < xSplits.length - 1; c++) {
      const xLeft = xSplits[c];
      const xRight = xSplits[c + 1];
      const cellWidth = Math.max(50, xRight - xLeft);

      const cellKey = `${r}-${c}`;
      const type = structure.cellTypes[cellKey] || 'glass_fixed';

      // Glass cut size (daylight opening minus profile rebate)
      let glassW = Math.max(40, cellWidth - 2 * frameFace);
      let glassH = Math.max(40, cellHeight - 2 * frameFace);

      if (type.startsWith('sash_')) {
        // Sash profile takes additional 65mm per side
        glassW = Math.max(30, cellWidth - 140);
        glassH = Math.max(30, cellHeight - 140);
      }

      cells.push({
        row: r,
        col: c,
        type,
        widthMm: cellWidth,
        heightMm: cellHeight,
        glassWidthMm: glassW,
        glassHeightMm: glassH,
      });
    }
  }

  return cells;
}

export function computeDetailedBOM(structure: CadStructure, config: WindowConfig): WorkshopBOM {
  const cells = computeCadCells(structure);
  const cuts: CutPieceDetail[] = [];
  const glasses: GlassCutDetail[] = [];

  const w = structure.width;
  const h = structure.height;
  const archSpec = computeArchSpecification(w, structure.archType, structure.archHeightMm);

  // 1. OUTER FRAME CUTS (Dormant)
  if (archSpec) {
    cuts.push({
      id: 'dormant-h-cintre',
      label: `Dormant Supérieur Cintré (${archSpec.type === 'full_arch' ? 'Plein Cintre' : 'Arc Surbaissé'})`,
      role: 'arch',
      lengthMm: archSpec.totalProfileMm,
      cutLeftAngle: 90,
      cutRightAngle: 90,
      quantity: 1,
      isCurved: true,
      bendingNote: `Rayon R=${archSpec.radiusMm}mm | Flèche f=${archSpec.riseMm}mm | Arc net=${archSpec.arcLengthMm}mm | Serrage galets=+${archSpec.clampLeadMm}mm`,
    });
  } else {
    cuts.push({
      id: 'dormant-h',
      label: 'Dormant Haut (Cadre)',
      role: 'frame',
      lengthMm: w,
      cutLeftAngle: 45,
      cutRightAngle: 45,
      quantity: 1,
    });
  }
  cuts.push({
    id: 'dormant-b',
    label: 'Dormant Bas (Cadre)',
    role: 'frame',
    lengthMm: w,
    cutLeftAngle: 45,
    cutRightAngle: 45,
    quantity: 1,
  });
  cuts.push({
    id: 'dormant-g',
    label: 'Dormant Montant Gauche',
    role: 'frame',
    lengthMm: h,
    cutLeftAngle: 45,
    cutRightAngle: 45,
    quantity: 1,
  });
  cuts.push({
    id: 'dormant-d',
    label: 'Dormant Montant Droit',
    role: 'frame',
    lengthMm: h,
    cutLeftAngle: 45,
    cutRightAngle: 45,
    quantity: 1,
  });

  // 2. VERTICAL MULLIONS (Meneaux)
  structure.verticalDividers.forEach((x, idx) => {
    cuts.push({
      id: `meneau-${idx + 1}`,
      label: `Meneau Vertical #${idx + 1} (@ ${x}mm)`,
      role: 'mullion',
      lengthMm: h - 110, // deducting top and bottom frame faces
      cutLeftAngle: 90,
      cutRightAngle: 90,
      quantity: 1,
    });
  });

  // 3. HORIZONTAL TRANSOMS (Traverses)
  structure.horizontalDividers.forEach((y, idx) => {
    cuts.push({
      id: `traverse-${idx + 1}`,
      label: `Traverse Horizontale #${idx + 1} (@ ${y}mm)`,
      role: 'transom',
      lengthMm: w - 110, // deducting left and right frame faces
      cutLeftAngle: 90,
      cutRightAngle: 90,
      quantity: 1,
    });
  });

  // 4. SASH PROFILES & GLASS BY CELL
  let hingeCount = 0;
  let handleCount = 0;
  let rollerCount = 0;
  let lockCount = 0;

  cells.forEach((cell) => {
    const labelPrefix = `Case [R${cell.row + 1}, C${cell.col + 1}]`;

    if (cell.type.startsWith('sash_')) {
      const sashW = cell.widthMm - 20;
      const sashH = cell.heightMm - 20;

      // 4 pieces of sash profile per sash
      cuts.push({
        id: `ouvrant-h-${cell.row}-${cell.col}`,
        label: `${labelPrefix} - Ouvrant Traverse Haut`,
        role: 'sash',
        lengthMm: sashW,
        cutLeftAngle: 45,
        cutRightAngle: 45,
        quantity: 1,
      });
      cuts.push({
        id: `ouvrant-b-${cell.row}-${cell.col}`,
        label: `${labelPrefix} - Ouvrant Traverse Bas`,
        role: 'sash',
        lengthMm: sashW,
        cutLeftAngle: 45,
        cutRightAngle: 45,
        quantity: 1,
      });
      cuts.push({
        id: `ouvrant-g-${cell.row}-${cell.col}`,
        label: `${labelPrefix} - Ouvrant Montant Gauche`,
        role: 'sash',
        lengthMm: sashH,
        cutLeftAngle: 45,
        cutRightAngle: 45,
        quantity: 1,
      });
      cuts.push({
        id: `ouvrant-d-${cell.row}-${cell.col}`,
        label: `${labelPrefix} - Ouvrant Montant Droit`,
        role: 'sash',
        lengthMm: sashH,
        cutLeftAngle: 45,
        cutRightAngle: 45,
        quantity: 1,
      });

      // Glass for sash
      glasses.push({
        id: `vitrage-${cell.row}-${cell.col}`,
        label: `${labelPrefix} - Vitrage Vantail`,
        widthMm: cell.glassWidthMm,
        heightMm: cell.glassHeightMm,
        areaM2: Number(((cell.glassWidthMm * cell.glassHeightMm) / 1000000).toFixed(2)),
        glassType: config.glassType,
        quantity: 1,
      });

      handleCount += 1;
      if (cell.type === 'sash_slide') {
        rollerCount += 2;
        lockCount += 1;
      } else {
        hingeCount += 2;
        lockCount += 1;
      }
    } else if (cell.type === 'glass_fixed') {
      glasses.push({
        id: `vitrage-${cell.row}-${cell.col}`,
        label: `${labelPrefix} - Vitrage Fixe Châssis`,
        widthMm: cell.glassWidthMm,
        heightMm: cell.glassHeightMm,
        areaM2: Number(((cell.glassWidthMm * cell.glassHeightMm) / 1000000).toFixed(2)),
        glassType: config.glassType,
        quantity: 1,
      });
    }
  });

  // Arched top glass pane calculation
  if (archSpec) {
    let archGlassM2 = 0;
    if (archSpec.type === 'full_arch') {
      archGlassM2 = (Math.PI * Math.pow((w - 110) / 2000, 2)) / 2;
    } else {
      const rM = archSpec.radiusMm / 1000;
      const angleRad = (archSpec.angleDeg * Math.PI) / 180;
      archGlassM2 = Math.max(0.05, ((rM * rM) / 2) * (angleRad - Math.sin(angleRad)));
    }

    glasses.push({
      id: 'vitrage-imposte-cintre',
      label: `Vitrage Imposte Cintrée (${archSpec.type === 'full_arch' ? 'Plein Cintre' : 'Surbaissé'})`,
      widthMm: w - 110,
      heightMm: archSpec.riseMm,
      areaM2: Number(archGlassM2.toFixed(2)),
      glassType: config.glassType,
      quantity: 1,
      isCurvedArch: true,
    });
  }

  // 5. ROLLER SHUTTER (Volet Roulant Monobloc / Rénovation)
  let shutterBom: RollerShutterBOM | undefined;
  if (structure.shutterConfig?.enabled) {
    shutterBom = computeRollerShutterBOM(w, h, structure.shutterConfig);

    // Box profile cut
    cuts.push({
      id: 'vr-coffre',
      label: `Coffre Volet Roulant ${structure.shutterConfig.boxHeightMm}mm`,
      role: 'shutter_box',
      lengthMm: shutterBom.boxWidthMm,
      cutLeftAngle: 90,
      cutRightAngle: 90,
      quantity: 1,
      profileCode: `VR-BOX-${structure.shutterConfig.boxHeightMm}`,
    });

    // Side guides
    cuts.push({
      id: 'vr-coulisse-g',
      label: 'Coulisse Volet Gauche (avec joint brosse)',
      role: 'shutter_guide',
      lengthMm: shutterBom.guideHeightMm,
      cutLeftAngle: 90,
      cutRightAngle: 90,
      quantity: 1,
      profileCode: 'VR-COUL-53',
    });
    cuts.push({
      id: 'vr-coulisse-d',
      label: 'Coulisse Volet Droite (avec joint brosse)',
      role: 'shutter_guide',
      lengthMm: shutterBom.guideHeightMm,
      cutLeftAngle: 90,
      cutRightAngle: 90,
      quantity: 1,
      profileCode: 'VR-COUL-53',
    });

    // Bottom heavy extruded slat
    cuts.push({
      id: 'vr-lame-finale',
      label: 'Lame Finale Volet Roulant (Lourde + Joint)',
      role: 'shutter_slat',
      lengthMm: shutterBom.slatCutLengthMm,
      cutLeftAngle: 90,
      cutRightAngle: 90,
      quantity: 1,
      profileCode: 'VR-LAME-FIN',
    });

    // Octagonal steel axle
    cuts.push({
      id: 'vr-axe-octo',
      label: `Axe Octogonal Galva Ø${shutterBom.axleDiameterMm}mm`,
      role: 'shutter_axle',
      lengthMm: shutterBom.axleLengthMm,
      cutLeftAngle: 90,
      cutRightAngle: 90,
      quantity: 1,
      profileCode: `VR-AXE-Ø${shutterBom.axleDiameterMm}`,
    });
  }

  // Calculate totals
  const totalProfileLengthMm = cuts.reduce((acc, c) => acc + c.lengthMm * c.quantity, 0);
  const totalProfileMeters = Number((totalProfileLengthMm / 1000).toFixed(1));
  const totalProfileWeightKg = Number((totalProfileMeters * 1.35).toFixed(1)); // ~1.35 kg/m average
  const totalGlassAreaM2 = Number(glasses.reduce((acc, g) => acc + g.areaM2 * g.quantity, 0).toFixed(2));
  const estimatedBars6m = Math.ceil(totalProfileLengthMm / (6000 * 0.9)); // 10% kerf/trim margin

  const miterCount = cuts.filter((c) => c.cutLeftAngle === 45).length;
  const hardwareSummary: HardwareItemDetail[] = [];

  // 1. Equerres d assemblage
  if (miterCount > 0) {
    const qty = miterCount * 2;
    hardwareSummary.push({
      id: 'hw-equerre-45',
      name: "Équerres d'assemblage à sertir 45°",
      referenceCode: 'EQUER-SERT-45',
      category: 'assemblage',
      quantity: qty,
      unit: 'pcs',
      unitPriceDzd: 180,
      totalPriceDzd: qty * 180,
      stockBin: 'BAC-EQ-01',
      notes: "Sertissage des angles dormants et ouvrants 45°",
    });
  }

  // 2. Joints d etancheite EPDM et brosse
  const gasketMeters = Math.max(4, Math.round(totalProfileMeters * 1.8));
  hardwareSummary.push({
    id: 'hw-joint-epdm',
    name: "Joint d'étanchéité EPDM à lèvre & brosse",
    referenceCode: 'JOINT-EPDM-CENT',
    category: 'etancheite',
    quantity: gasketMeters,
    unit: 'm',
    unitPriceDzd: 120,
    totalPriceDzd: gasketMeters * 120,
    stockBin: 'BAC-JT-02',
    notes: "Garniture périphérique dormant et ouvrant",
  });

  // 3. Cales de vitrage
  if (glasses.length > 0) {
    const qty = glasses.length * 8;
    hardwareSummary.push({
      id: 'hw-cale-vitrage',
      name: "Cales d'assise et de calage vitrage 4mm",
      referenceCode: 'CALE-VITR-4MM',
      category: 'assemblage',
      quantity: qty,
      unit: 'pcs',
      unitPriceDzd: 35,
      totalPriceDzd: qty * 35,
      stockBin: 'BAC-CAL-03',
      notes: "Ventilation et calage périphérique vitrage",
    });
  }

  // 4. Cremones et Poignees
  if (handleCount > 0) {
    hardwareSummary.push({
      id: 'hw-cremone',
      name: "Crémone réversible / Poignée aluminium",
      referenceCode: 'CREM-REV-ALU',
      category: 'fermeture',
      quantity: handleCount,
      unit: 'pcs',
      unitPriceDzd: 1800,
      totalPriceDzd: handleCount * 1800,
      stockBin: 'BAC-CR-05',
      notes: "Mécanisme de verrouillage vantail ouvrant",
    });
  }

  // 5. Paumelles reglables (Battants)
  if (hingeCount > 0) {
    hardwareSummary.push({
      id: 'hw-paumelle',
      name: "Paumelles réglables renforcées",
      referenceCode: 'PAUM-REG-ALU',
      category: 'rotation',
      quantity: hingeCount,
      unit: 'pcs',
      unitPriceDzd: 950,
      totalPriceDzd: hingeCount * 950,
      stockBin: 'BAC-PM-06',
      notes: "Axes inox anti-usure pour châssis battant",
    });
  }

  // 6. Roulettes doubles reglables (Coulissants)
  if (rollerCount > 0) {
    hardwareSummary.push({
      id: 'hw-galet',
      name: "Chariots doubles à roulements aiguilles",
      referenceCode: 'GALET-DBL-REG',
      category: 'rotation',
      quantity: rollerCount,
      unit: 'pcs',
      unitPriceDzd: 1450,
      totalPriceDzd: rollerCount * 1450,
      stockBin: 'BAC-RL-07',
      notes: "Galets réglables pour rails coulissants lourds",
    });
  }

  // 7. Gaches et verrous
  if (lockCount > 0) {
    hardwareSummary.push({
      id: 'hw-gache',
      name: "Gâches de fermeture acier zingué",
      referenceCode: 'GACHE-SECUR-ALU',
      category: 'fermeture',
      quantity: lockCount,
      unit: 'pcs',
      unitPriceDzd: 420,
      totalPriceDzd: lockCount * 420,
      stockBin: 'BAC-GC-08',
      notes: "Points de verrouillage sur dormant",
    });
  }

  // 8. Clapets de drainage
  const drainValvesCount = Math.max(2, Math.ceil(w / 800));
  hardwareSummary.push({
    id: 'hw-clapet-drain',
    name: "Clapets anti-retour & busettes de drainage",
    referenceCode: 'CLAPET-DRAIN-PVC',
    category: 'drainage',
    quantity: drainValvesCount,
    unit: 'pcs',
    unitPriceDzd: 150,
    totalPriceDzd: drainValvesCount * 150,
    stockBin: 'BAC-DR-09',
    notes: "Évacuation des eaux de pluie traverse basse",
  });

  // 9. Visserie auto-foreuse
  const screwCount = Math.max(24, Math.round(totalProfileMeters * 3));
  hardwareSummary.push({
    id: 'hw-vis-autof',
    name: "Visserie inox auto-foreuse 4.2×25mm",
    referenceCode: 'VIS-AUTOF-42',
    category: 'fixation',
    quantity: screwCount,
    unit: 'pcs',
    unitPriceDzd: 15,
    totalPriceDzd: screwCount * 15,
    stockBin: 'BAC-VS-10',
    notes: "Fixation des traverses, équerres et accessoires",
  });

  return {
    cuts,
    glasses,
    hardwareSummary,
    totalProfileMeters,
    totalProfileWeightKg,
    totalGlassAreaM2,
    estimatedBars6m,
    archDetails: archSpec,
    shutterBom,
  };
}

export function computeRollerShutterBOM(
  widthMm: number,
  heightMm: number,
  config: RollerShutterConfig
): RollerShutterBOM {
  const boxHeight = config.boxHeightMm || 180;
  const isMonobloc = config.boxType === 'monobloc_pvc' || config.boxType === 'monobloc_alu';

  // Box length equals window frame width
  const boxWidth = widthMm;

  // Guides height: in monobloc, guides cover the frame height below the box
  const guideHeight = Math.max(100, isMonobloc ? heightMm - boxHeight : heightMm);

  // Slat specifications
  let usefulHeight = 39;
  let weightPerM2 = 3.2; // kg/m²
  let slatLabel = 'Lame Aluminium Injectée Polyuréthane 39mm';

  if (config.slatType === 'alu_55') {
    usefulHeight = 55;
    weightPerM2 = 4.5;
    slatLabel = 'Lame Aluminium Haute Densité 55mm';
  } else if (config.slatType === 'pvc_40') {
    usefulHeight = 40;
    weightPerM2 = 3.8;
    slatLabel = 'Lame PVC Double Paroi 40mm';
  } else if (config.slatType === 'alu_extrude_securite') {
    usefulHeight = 45;
    weightPerM2 = 7.8;
    slatLabel = 'Lame Aluminium Extrudé Plein Sécurité 45mm';
  }

  // Slat cut length: deductions for 2 side guides + clearance
  const slatCutLength = Math.max(100, widthMm - 60);

  // Slat count: curtain height divided by slat coverage + 2 extra slats in chest for winding anchor
  const slatCount = Math.ceil(guideHeight / usefulHeight) + 2;

  // Curtain total area and weight
  const curtainAreaM2 = Number(((slatCutLength / 1000) * ((slatCount * usefulHeight) / 1000)).toFixed(2));
  const bottomSlatWeightKg = Number(((slatCutLength / 1000) * 0.95).toFixed(2));
  const curtainWeightKg = Number((curtainAreaM2 * weightPerM2 + bottomSlatWeightKg).toFixed(1));

  // Axle tube calculation
  const axleDiameter: 40 | 60 = curtainWeightKg > 22 || widthMm > 1600 ? 60 : 40;
  const axleLength = Math.max(100, boxWidth - 65);

  // Recommended motor torque (Nm)
  let motorTorqueNm = 10;
  if (curtainWeightKg > 45) motorTorqueNm = 40;
  else if (curtainWeightKg > 30) motorTorqueNm = 30;
  else if (curtainWeightKg > 18) motorTorqueNm = 20;
  else if (curtainWeightKg > 12) motorTorqueNm = 15;

  const components: RollerShutterComponent[] = [
    {
      category: 'box',
      name: `Coffre ${config.boxType === 'monobloc_pvc' ? 'Monobloc PVC' : 'Aluminium'} ${boxHeight}mm`,
      description: "Coffre d'enroulement complet avec trappe de visite amovible",
      dimensions: `${boxWidth} mm`,
      quantity: 1,
      unit: 'ens',
      cutLengthMm: boxWidth,
    },
    {
      category: 'box',
      name: 'Flasques latérales de caisson (Joues)',
      description: 'Paire de joues alu injecté avec portées de roulement',
      dimensions: `${boxHeight} x ${boxHeight} mm`,
      quantity: 2,
      unit: 'pcs',
    },
    {
      category: 'guides',
      name: 'Coulisses latérales aluminium avec joint brosse',
      description: 'Profils de guidage verticaux avec joint anti-bruit fin-seal',
      dimensions: `${guideHeight} mm`,
      quantity: 2,
      unit: 'barres',
      cutLengthMm: guideHeight,
    },
    {
      category: 'slats',
      name: slatLabel,
      description: `Tablier de lames (${config.slatColor}) avec embouts latéraux`,
      dimensions: `${slatCutLength} mm`,
      quantity: slatCount,
      unit: 'lames',
      cutLengthMm: slatCutLength,
    },
    {
      category: 'slats',
      name: "Lame finale d'extrusion lourde avec joint néoprène",
      description: "Profil terminal avec bavette caoutchouc d'étanchéité et butées coniques",
      dimensions: `${slatCutLength} mm`,
      quantity: 1,
      unit: 'barre',
      cutLengthMm: slatCutLength,
    },
    {
      category: 'axle',
      name: `Tube d'enroulement octogonal acier galvanisé Ø${axleDiameter}mm`,
      description: 'Axe porteur rigide anti-flexion',
      dimensions: `${axleLength} mm`,
      quantity: 1,
      unit: 'barre',
      cutLengthMm: axleLength,
    },
    {
      category: 'axle',
      name: `Embout d'axe télescopique avec roulement à billes Ø${axleDiameter}mm`,
      description: 'Support de pivotement avec roulement étanche 28mm',
      quantity: 1,
      unit: 'pcs',
    },
    {
      category: 'drive',
      name: config.driveType.startsWith('motor_')
        ? `Moteur tubulaire 230V ${motorTorqueNm} Nm (${config.driveType === 'motor_radio' ? 'Radio sans-fil' : 'Filaire'})`
        : config.driveType === 'manual_crank'
        ? 'Treuil réducteur 1:4 avec tringle et manivelle oscillante'
        : 'Enrouleur manuel à sangle 14mm avec guide-sangle',
      description: `Système de manœuvre dimensionné pour tablier de ${curtainWeightKg} kg`,
      quantity: 1,
      unit: 'ens',
    },
    {
      category: 'hardware',
      name: config.automaticLocks
        ? 'Verrous automatiques anti-effraction anti-soulèvement (Octoclick)'
        : "Attaches de tablier souples en acier ressort à gorge d'axe",
      description: 'Liaison rigide entre axe et première lame',
      quantity: widthMm > 1500 ? 4 : 3,
      unit: 'pcs',
    },
    {
      category: 'hardware',
      name: "Butées coniques d'arrêt en PVC",
      description: "Empêche l'effacement du tablier dans le coffre",
      quantity: 2,
      unit: 'pcs',
    },
  ];

  if (config.includeMosquitoNet) {
    components.push({
      category: 'box',
      name: 'Cassette moustiquaire enroulable intégrée',
      description: 'Toile fibre de verre enduite PVC avec ressort de rappel et double coulisse',
      dimensions: `${boxWidth} x ${guideHeight} mm`,
      quantity: 1,
      unit: 'ens',
    });
  }

  return {
    boxWidthMm: boxWidth,
    guideHeightMm: guideHeight,
    slatCutLengthMm: slatCutLength,
    slatCount,
    slatUsefulHeightMm: usefulHeight,
    totalCurtainAreaM2: curtainAreaM2,
    totalCurtainWeightKg: curtainWeightKg,
    recommendedMotorTorqueNm: motorTorqueNm,
    axleLengthMm: axleLength,
    axleDiameterMm: axleDiameter,
    components,
  };
}
