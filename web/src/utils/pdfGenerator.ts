import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import QRCode from 'qrcode';
import type { WindowConfig, CostBreakdown } from '../types/window';
import type { CadStructure, WorkshopBOM } from '../types/cad';

export function formatOpeningTypeFr(openingType: string): string {
  const map: Record<string, string> = {
    sliding_2: 'Coulissant 2 Vantaux',
    sliding_3: 'Coulissant 3 Vantaux (3 Rails)',
    casement_1: 'Ouvrant Français 1 Vantail',
    casement_2: 'Ouvrant Français 2 Vantaux',
    tilt_turn: 'Oscillo-Battant Sécurité',
    fixed: 'Châssis Fixe Vitré',
  };
  return map[openingType] || openingType;
}

export function formatProfileSystemFr(profileSystem: string): string {
  const map: Record<string, string> = {
    gamme_40: 'Alugraf 40 Standard (Éco)',
    gamme_45_thermal: 'Gamme 45 Rupture Pont Thermique (RPT)',
    gamme_67_slide: 'Coulissant Renforcé 67mm (Lourd)',
    pvc_70_chamber: 'PVC 70mm 5 Chambres Haute Isolation',
  };
  return map[profileSystem] || profileSystem;
}

export function formatFinishColorFr(finishColor: string): string {
  const map: Record<string, string> = {
    ral_9016: 'RAL 9016 Blanc Brillant',
    ral_7016: 'RAL 7016 Gris Anthracite Sablé',
    ral_9005: 'RAL 9005 Noir Mat Sablé',
    faux_bois: 'Faux Bois Chêne Doré',
    bronze_ano: 'Bronze Anodisé Métallisé',
  };
  return map[finishColor] || finishColor;
}

export function formatGlassTypeFr(glassType: string): string {
  const map: Record<string, string> = {
    simple_clear: 'Simple Vitrage Clair 6mm',
    double_clear: 'Double Vitrage 4/16/4 Isolation',
    stop_sol: 'Stop-Sol Réfléchissant Anti-Chaleur',
    sable: 'Vitrage Sablé Dépoli Intimité',
  };
  return map[glassType] || glassType;
}

export function formatShutterTypeFr(shutterType: string): string {
  const map: Record<string, string> = {
    none: 'Sans volet roulant',
    manual: 'Volet roulant manuel',
    motorized: 'Volet roulant motorisé',
  };
  return map[shutterType] || shutterType;
}

export async function generateClientDevisPdf(
  config: WindowConfig,
  cost: CostBreakdown,
  clientName: string = 'Client Particulier',
  clientPhone: string = '05 50 00 00 00',
  clientWilaya: string = 'Alger'
) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const quoteNumber = `DEV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
  const quoteDate = new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' });

  // 1. Header Banner & Workshop Details
  doc.setFillColor(15, 23, 42); // Deep slate #0F172A
  doc.rect(0, 0, 210, 38, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text('BAITI ATELIER', 14, 18);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(203, 213, 225);
  doc.text('Menuiserie Aluminium & PVC • Fabrication & Pose Qualifiée', 14, 25);
  doc.text('Zone d’Activité Industrielle • 58 Wilayas Algérie • Tel: +213 (0) 550 12 34 56', 14, 30);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(212, 175, 55); // Accent Gold #D4AF37
  doc.text('DEVIS CLIENT', 150, 18);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(226, 232, 240);
  doc.text(`N° : ${quoteNumber}`, 150, 25);
  doc.text(`Date : ${quoteDate}`, 150, 30);

  // 2. Client Details Box
  doc.setDrawColor(226, 232, 240);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, 46, 182, 26, 3, 3, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text('Destinataire :', 20, 53);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(51, 65, 85);
  doc.text(`Nom / Client : ${clientName}`, 20, 60);
  doc.text(`Téléphone : ${clientPhone}`, 20, 66);
  doc.text(`Localisation / Wilaya : ${clientWilaya}`, 110, 60);
  doc.text(`Validité de l'offre : 30 jours`, 110, 66);

  // 3. Itemized Window Specification Table
  const tableRows = [
    [
      'Châssis Menuiserie sur-mesure',
      `${formatOpeningTypeFr(config.openingType)} (${config.width} × ${config.height} mm)`,
      formatProfileSystemFr(config.profileSystem),
      formatFinishColorFr(config.finishColor),
      formatGlassTypeFr(config.glassType),
      formatShutterTypeFr(config.shutterType),
      '1',
      `${cost.totalEstimatedDzd.toLocaleString()} DZD`,
    ],
  ];

  autoTable(doc, {
    startY: 80,
    head: [['Désignation', 'Dimensions & Type', 'Gamme Profilé', 'Finition', 'Vitrage', 'Volet', 'Qté', 'Total TTC']],
    body: tableRows,
    theme: 'grid',
    headStyles: {
      fillColor: [30, 41, 59],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8,
    },
    bodyStyles: {
      fontSize: 8,
      textColor: [30, 41, 59],
    },
    columnStyles: {
      0: { cellWidth: 32 },
      1: { cellWidth: 28 },
      2: { cellWidth: 26 },
      3: { cellWidth: 24 },
      4: { cellWidth: 24 },
      5: { cellWidth: 20 },
      6: { cellWidth: 10, halign: 'center' },
      7: { cellWidth: 26, fontStyle: 'bold', halign: 'right' },
    },
  });

  // Get final Y position after table
  const finalY = (doc as any).lastAutoTable.finalY + 8;

  // 4. Detailed Cost Breakdown Box
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(110, finalY, 86, 44, 2, 2, 'FD');

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);

  doc.text(`Profilés (${cost.profileWeightKg} kg / ${cost.profileLengthMeters}m) :`, 114, finalY + 7);
  doc.text(`${cost.profileCostDzd.toLocaleString()} DZD`, 190, finalY + 7, { align: 'right' });

  doc.text(`Vitrage (${cost.glassAreaM2} m²) :`, 114, finalY + 14);
  doc.text(`${cost.glassCostDzd.toLocaleString()} DZD`, 190, finalY + 14, { align: 'right' });

  doc.text('Quincaillerie & Accessoires :', 114, finalY + 21);
  doc.text(`${cost.hardwareCostDzd.toLocaleString()} DZD`, 190, finalY + 21, { align: 'right' });

  if (cost.shutterCostDzd > 0) {
    doc.text('Volet Roulant Intégré :', 114, finalY + 28);
    doc.text(`${cost.shutterCostDzd.toLocaleString()} DZD`, 190, finalY + 28, { align: 'right' });
  }

  doc.setDrawColor(203, 213, 225);
  doc.line(114, finalY + 32, 192, finalY + 32);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(224, 122, 95);
  doc.text('Total Net à Payer :', 114, finalY + 39);
  doc.text(`${cost.totalEstimatedDzd.toLocaleString()} DZD`, 190, finalY + 39, { align: 'right' });

  // 5. Verification QR Code
  try {
    const qrDataUrl = await QRCode.toDataURL(`https://baiti.dz/verify/${quoteNumber}`, { width: 100, margin: 1 });
    doc.addImage(qrDataUrl, 'PNG', 16, finalY, 34, 34);
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);
    doc.text('Scannez pour vérifier', 33, finalY + 38, { align: 'center' });
    doc.text('l’authenticité du devis', 33, finalY + 41, { align: 'center' });
  } catch (err) {
    console.error('QR code error', err);
  }

  // 6. Payment Terms & Stamp Box
  const termsY = finalY + 54;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text('Modalités de Règlement & Conditions :', 14, termsY);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text('• Acompte de 50% exigible à la validation de la commande.', 14, termsY + 6);
  doc.text('• Solde de 50% à la livraison et réception des ouvrages sur chantier.', 14, termsY + 11);
  doc.text('• Profilés thermolaqués certifiés selon normes Qualicoat / Qualanod.', 14, termsY + 16);
  doc.text('• Garantie de parfait achèvement et étanchéité de 2 ans.', 14, termsY + 21);

  // Workshop Stamp Box
  doc.setDrawColor(148, 163, 184);
  doc.roundedRect(120, termsY, 76, 30, 2, 2, 'D');
  doc.setFontSize(8);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(148, 163, 184);
  doc.text('Cachet et signature de l’Atelier :', 124, termsY + 6);

  // 7. Footer
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(148, 163, 184);
  doc.text('Document édité via Baiti Atelier • Logiciel de Conception & Chiffrage Menuiserie Algérie', 105, 288, {
    align: 'center',
  });

  // Trigger browser download
  doc.save(`Devis_${quoteNumber}_${clientName.replace(/\s+/g, '_')}.pdf`);
}

export function generateWorkshopCutSheetPdf(
  structure: CadStructure,
  config: WindowConfig,
  bom: WorkshopBOM
) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const jobCode = `OF-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;

  // Header
  doc.setFillColor(30, 41, 59);
  doc.rect(0, 0, 210, 32, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('FICHE DE DÉBITAGE ATELIER (Usage Scie & Montage)', 14, 15);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(226, 232, 240);
  doc.text(`Ordre de Fabrication : ${jobCode} • Date : ${new Date().toLocaleDateString('fr-FR')}`, 14, 23);
  doc.text(`Menuiserie : ${formatOpeningTypeFr(config.openingType)} • Cotes Hors-Tout : ${structure.width} × ${structure.height} mm • Gamme : ${formatProfileSystemFr(config.profileSystem)}`, 14, 28);

  // 1. Profile Cuts Table
  const profileRows = bom.cuts.map((c, i) => [
    `#${i + 1}`,
    c.label,
    c.role.toUpperCase(),
    `${c.lengthMm} mm`,
    `${c.cutLeftAngle}°`,
    `${c.cutRightAngle}°`,
    `${c.quantity}`,
  ]);

  autoTable(doc, {
    startY: 38,
    head: [['N°', 'Désignation Pièce', 'Profilé', 'Longueur Brute', 'Onglet G', 'Onglet D', 'Qté']],
    body: profileRows,
    theme: 'striped',
    headStyles: {
      fillColor: [212, 175, 55], // Accent Gold #D4AF37
      textColor: [255, 255, 255],
      fontSize: 8,
      fontStyle: 'bold',
    },
    bodyStyles: {
      fontSize: 8,
      textColor: [15, 23, 42],
    },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center' },
      1: { cellWidth: 70 },
      2: { cellWidth: 26 },
      3: { cellWidth: 28, fontStyle: 'bold', halign: 'right' },
      4: { cellWidth: 18, halign: 'center' },
      5: { cellWidth: 18, halign: 'center' },
      6: { cellWidth: 14, halign: 'center' },
    },
  });

  const glassStartY = (doc as any).lastAutoTable.finalY + 8;

  // 2. Glass Cut Sizes Table
  const glassRows = bom.glasses.map((g, i) => [
    `V#${i + 1}`,
    g.label,
    `${g.widthMm} × ${g.heightMm} mm`,
    `${g.areaM2} m²`,
    formatGlassTypeFr(g.glassType),
    `${g.quantity}`,
  ]);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text('Cotes de Découpe Verre (Miroiterie) :', 14, glassStartY - 2);

  autoTable(doc, {
    startY: glassStartY,
    head: [['Ref', 'Emplacement', 'Cotes Débit (L × H)', 'Surface', 'Type Verre', 'Qté']],
    body: glassRows,
    theme: 'grid',
    headStyles: {
      fillColor: [59, 130, 246], // Blue
      textColor: [255, 255, 255],
      fontSize: 8,
    },
    bodyStyles: {
      fontSize: 8,
    },
    columnStyles: {
      0: { cellWidth: 14, halign: 'center' },
      1: { cellWidth: 66 },
      2: { cellWidth: 40, fontStyle: 'bold' },
      3: { cellWidth: 20, halign: 'right' },
      4: { cellWidth: 32 },
      5: { cellWidth: 14, halign: 'center' },
    },
  });

  const summaryY = (doc as any).lastAutoTable.finalY + 8;

  // 3. Summary & Hardware Pack Box
  doc.setDrawColor(203, 213, 225);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, summaryY, 182, 34, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text('Bilan Matière Première (Barres de 6 mètres) :', 20, summaryY + 7);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text(`• Longueur totale débitée : ${bom.totalProfileMeters} mètres linéaires`, 20, summaryY + 14);
  doc.text(`• Masse brute profilé : ${bom.totalProfileWeightKg} kg d'aluminium`, 20, summaryY + 20);
  doc.text(`• Surface totale vitrage : ${bom.totalGlassAreaM2} m²`, 20, summaryY + 26);

  doc.setFont('helvetica', 'bold');
  doc.text(`• Barres de 6.00m requises au magasin : ${bom.estimatedBars6m} barres`, 105, summaryY + 14);

  // Hardware count inline
  const hwText = bom.hardwareSummary.map((h) => `${h.name}: ${h.quantity} ${h.unit}`).join(' • ');
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text(`Quincaillerie : ${hwText}`, 20, summaryY + 31);

  doc.save(`Fiche_Debit_${jobCode}.pdf`);
}

/**
 * Converts a numerical amount in DZD into formal French words
 * for official Algerian tender and contract schedules (Marchés publics & privés).
 */
export function numberToFrenchWords(n: number): string {
  const rounded = Math.round(n);
  if (rounded === 0) return 'zéro';
  const units = [
    '',
    'un',
    'deux',
    'trois',
    'quatre',
    'cinq',
    'six',
    'sept',
    'huit',
    'neuf',
    'dix',
    'onze',
    'douze',
    'treize',
    'quatorze',
    'quinze',
    'seize',
    'dix-sept',
    'dix-huit',
    'dix-neuf',
  ];
  const tens = [
    '',
    'dix',
    'vingt',
    'trente',
    'quarante',
    'cinquante',
    'soixante',
    'soixante-dix',
    'quatre-vingt',
    'quatre-vingt-dix',
  ];

  const convertChunk = (num: number): string => {
    let res = '';
    const h = Math.floor(num / 100);
    const r = num % 100;
    if (h > 0) {
      if (h === 1) res += 'cent';
      else res += units[h] + ' cent' + (r === 0 ? 's' : '');
    }
    if (r > 0) {
      if (res.length > 0) res += ' ';
      if (r < 20) {
        res += units[r];
      } else {
        const t = Math.floor(r / 10);
        const u = r % 10;
        if (t === 7) {
          res += 'soixante-' + (u === 1 ? 'et-onze' : units[10 + u]);
        } else if (t === 9) {
          res += 'quatre-vingt-' + units[10 + u];
        } else {
          res += tens[t];
          if (u === 1) res += ' et un';
          else if (u > 1) res += '-' + units[u];
          else if (t === 8 && u === 0) res += 's';
        }
      }
    }
    return res;
  };

  const millions = Math.floor(rounded / 1000000);
  const thousands = Math.floor((rounded % 1000000) / 1000);
  const remainder = Math.floor(rounded % 1000);

  const parts: string[] = [];
  if (millions > 0) {
    parts.push(millions === 1 ? 'un million' : `${convertChunk(millions)} millions`);
  }
  if (thousands > 0) {
    parts.push(thousands === 1 ? 'mille' : `${convertChunk(thousands)} mille`);
  }
  if (remainder > 0) {
    parts.push(convertChunk(remainder));
  }

  return parts.join(' ');
}

/**
 * Generates an official Algerian BPU / DQE (Bordereau des Prix Unitaires & Devis Quantitatif Estimatif)
 * compliant with Algerian public works standards (DLEP, CTC, CNERIB) and private real-estate tenders.
 */
export async function generateBpuDqeTenderPdf(
  structure: CadStructure,
  config: WindowConfig,
  cost: CostBreakdown,
  bom: WorkshopBOM,
  projectName: string = 'Chantier Résidentiel Promotion Immobilière',
  clientName: string = 'Maître d’Ouvrage / Promoteur',
  wilaya: string = 'Alger'
) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const tenderCode = `BPU-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
  const dateStr = new Date().toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Top Algerian Official Banner
  doc.setFillColor(15, 23, 42); // Deep Navy Slate
  doc.rect(0, 0, 210, 36, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('RÉPUBLIQUE ALGÉRIENNE DÉMOCRATIQUE ET POPULAIRE', 105, 11, { align: 'center' });

  doc.setFontSize(13);
  doc.setTextColor(212, 175, 55); // Architectural Gold #D4AF37
  doc.text('BORDEREAU DES PRIX UNITAIRES & DEVIS QUANTITATIF ESTIMATIF (BPU / DQE)', 105, 19, {
    align: 'center',
  });

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(203, 213, 225);
  doc.text(
    'LOT : MENUISERIE ALUMINIUM, PVC & VITRERIE ISOLANTE (CONFORME DTR C3-2 / DTR E4-1)',
    105,
    26,
    { align: 'center' }
  );
  doc.text(`RÉFÉRENCE CONSULTATION : ${tenderCode} • DATE D’ÉMISSION : ${dateStr}`, 105, 31, {
    align: 'center',
  });

  // Project & Parties Metadata Box
  doc.setDrawColor(226, 232, 240);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, 42, 182, 28, 2.5, 2.5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text('1. Identification du Projet & des Parties Contractantes :', 18, 48);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(51, 65, 85);
  doc.text(`• Intitulé de l'Opération : ${projectName}`, 18, 55);
  doc.text(`• Maître d'Ouvrage (Client) : ${clientName}`, 18, 61);
  doc.text(`• Localisation / Wilaya : ${wilaya} (58 Wilayas Algérie)`, 18, 66);

  doc.text(`• Entreprise / Artisan Réalisateur : BAITI ATELIER SARL`, 110, 55);
  doc.text(`• Registre Commerce / NIF : 16/00-1284902B21 / 002116012849025`, 110, 61);
  doc.text(`• Délai d'Exécution Contractuel : 25 Jours Calendaires`, 110, 66);

  // Financial Breakdown Calculations
  const surfaceM2 = Math.max(0.1, (structure.width * structure.height) / 1000000);
  const totalAluHt = Math.round(cost.profileCostDzd);
  const puAluHt = Math.round(totalAluHt / surfaceM2);

  const totalGlassHt = Math.round(cost.glassCostDzd);
  const puGlassHt = Math.round(cost.glassAreaM2 > 0 ? totalGlassHt / cost.glassAreaM2 : 4800);

  const totalHardwareHt = Math.round(cost.hardwareCostDzd);
  const totalPoseEtanchHt = Math.round(cost.laborCostDzd);

  let totalSpecialCurvedHt = 0;
  if (structure.archType && structure.archType !== 'none') {
    totalSpecialCurvedHt = 8500; // Algerian workshop bending surcharge
  }

  const subtotalHt = totalAluHt + totalGlassHt + totalHardwareHt + totalPoseEtanchHt + totalSpecialCurvedHt;
  const tvaRate = 0.19; // Algerian standard 19% VAT
  const tvaAmount = Math.round(subtotalHt * tvaRate);
  const grandTotalTtc = subtotalHt + tvaAmount;

  // Tender Schedule Articles Table
  const tenderArticles = [
    [
      '01.01',
      `Fourniture et pose de profilés aluminium extrudé alliage 6060 T5 thermolaqué conforme au label Qualicoat (${formatFinishColorFr(config.finishColor)}). Système : ${formatProfileSystemFr(config.profileSystem)}. Compris découpe d'onglet 45°, assemblage mécanique par équerres à sertir/visser étanchées, joints d'étanchéité EPDM dans gorges prévues à cet effet. Cotes hors-tout : ${structure.width} × ${structure.height} mm.`,
      'M²',
      surfaceM2.toFixed(2),
      `${puAluHt.toLocaleString()} DZD`,
      `${totalAluHt.toLocaleString()} DZD`,
    ],
    [
      '01.02',
      `Fourniture et calage de vitrage isolant haute performance (${formatGlassTypeFr(config.glassType)}), constitué de feuilles assemblées par cordon butyle et mastic polysulfure bi-composant, avec intercalaire aluminium contenant du tamis moléculaire déshydratant. Conformité exigences thermo-acoustiques DTR C3-2. Surface totale : ${bom.totalGlassAreaM2} m².`,
      'M²',
      bom.totalGlassAreaM2.toFixed(2),
      `${puGlassHt.toLocaleString()} DZD`,
      `${totalGlassHt.toLocaleString()} DZD`,
    ],
    [
      '01.03',
      `Fourniture et montage de quincaillerie de manœuvre et de condamnation multipoints de qualité certifiée : paumelles aluminium réglables, crémones à engrenage en zamak, galets inox sur roulements à billes pour vantaux mobiles, gâches de sécurité anti-dégondage et poignées de tirage ergonomiques.`,
      'ENS',
      '1',
      `${totalHardwareHt.toLocaleString()} DZD`,
      `${totalHardwareHt.toLocaleString()} DZD`,
    ],
    [
      '01.04',
      `Prestation de fixation sur précadre ou maçonnerie brute au moyen de chevilles métalliques à expansion, réglage des aplombs et niveaux à la tolérance de 1 mm/m, et réalisation du calfeutrement d'étanchéité périphérique par fond de joint en mousse polyéthylène et mastic élastomère polyuréthane 1ère catégorie.`,
      'ENS',
      '1',
      `${totalPoseEtanchHt.toLocaleString()} DZD`,
      `${totalPoseEtanchHt.toLocaleString()} DZD`,
    ],
  ];

  if (structure.archType && structure.archType !== 'none') {
    const archTitle = structure.archType === 'full_arch' ? 'Plein Cintre' : 'Arc Surbaissé';
    tenderArticles.push([
      '01.05',
      `Plus-value d'atelier pour cintrage mécanique à la cintreuse motorisée à trois galets du dormant supérieur (${archTitle}). Y compris réalisation du tracé d'épure au 1/1, calage des outillages, respect du rayon de courbure et contrôle géométrique de la flèche.`,
      'U',
      '1',
      `${totalSpecialCurvedHt.toLocaleString()} DZD`,
      `${totalSpecialCurvedHt.toLocaleString()} DZD`,
    ]);
  }

  autoTable(doc, {
    startY: 74,
    head: [['N° Art', 'Désignation des Ouvrages & Spécifications Techniques', 'Unité', 'Qté', 'P.U HT', 'Montant HT']],
    body: tenderArticles,
    theme: 'grid',
    headStyles: {
      fillColor: [15, 23, 42],
      textColor: [255, 255, 255],
      fontSize: 7.5,
      fontStyle: 'bold',
      halign: 'center',
    },
    bodyStyles: {
      fontSize: 7.5,
      textColor: [15, 23, 42],
      cellPadding: 2,
    },
    columnStyles: {
      0: { cellWidth: 14, halign: 'center', fontStyle: 'bold' },
      1: { cellWidth: 96 },
      2: { cellWidth: 12, halign: 'center' },
      3: { cellWidth: 14, halign: 'center' },
      4: { cellWidth: 22, halign: 'right', fontStyle: 'bold' },
      5: { cellWidth: 24, halign: 'right', fontStyle: 'bold' },
    },
  });

  const tableFinalY = (doc as any).lastAutoTable.finalY + 4;

  // Financial Recap Table
  autoTable(doc, {
    startY: tableFinalY,
    body: [
      ['Montant Total Hors Taxes (HT) :', `${subtotalHt.toLocaleString()} DZD`],
      ['Taxe sur la Valeur Ajoutée (TVA 19% Algérie) :', `${tvaAmount.toLocaleString()} DZD`],
      ['MONTANT TOTAL TOUTES TAXES COMPRISES (TTC) :', `${grandTotalTtc.toLocaleString()} DZD`],
    ],
    theme: 'plain',
    bodyStyles: {
      fontSize: 8.5,
      textColor: [15, 23, 42],
      cellPadding: 1.5,
    },
    columnStyles: {
      0: { cellWidth: 140, halign: 'right', fontStyle: 'bold' },
      1: { cellWidth: 42, halign: 'right', fontStyle: 'bold', textColor: [224, 122, 95] },
    },
  });

  const recapFinalY = (doc as any).lastAutoTable.finalY + 4;

  // Legal Closing in Words (Arrêté en toutes lettres)
  doc.setDrawColor(226, 232, 240);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, recapFinalY, 182, 16, 2, 2, 'FD');

  const wordsTtc = numberToFrenchWords(grandTotalTtc);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);
  doc.text('Arrêté du Présent Devis Quantitatif et Estimatif :', 18, recapFinalY + 5);

  doc.setFont('helvetica', 'italic');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text(
    `« Arrêté le présent bordereau des prix unitaires et devis estimatif à la somme toutes taxes comprises de : ${wordsTtc.toUpperCase()} DINARS ALGÉRIENS ( ${grandTotalTtc.toLocaleString()} DZD TTC). »`,
    18,
    recapFinalY + 11,
    { maxWidth: 174 }
  );

  // Signatures & Approval Blocks
  const sigY = recapFinalY + 20;

  doc.setDrawColor(203, 213, 225);
  // Box 1: Entrepreneur
  doc.roundedRect(14, sigY, 56, 32, 2, 2);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(15, 23, 42);
  doc.text('Pour le Soumissionnaire', 17, sigY + 5);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(100, 116, 139);
  doc.text('BAITI ATELIER', 17, sigY + 10);
  doc.text('Date & Cachet humide :', 17, sigY + 15);

  // Box 2: BET / Architecte
  doc.roundedRect(76, sigY, 58, 32, 2, 2);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(15, 23, 42);
  doc.text('Pour le Bureau d’Études (BET)', 79, sigY + 5);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(100, 116, 139);
  doc.text('Visa & Vérification conformité :', 79, sigY + 10);

  // Box 3: Maître d'Ouvrage
  doc.roundedRect(140, sigY, 56, 32, 2, 2);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(15, 23, 42);
  doc.text('Pour le Maître d’Ouvrage', 143, sigY + 5);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(100, 116, 139);
  doc.text('Mention manuscrite « Bon pour accord »', 143, sigY + 10);
  doc.text('Signature & Date :', 143, sigY + 15);

  doc.save(`BPU_DQE_${tenderCode}.pdf`);
}
