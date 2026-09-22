import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import QRCode from 'qrcode';
import type { WindowConfig, CostBreakdown, OpeningType, ProfileSystem, GlassType, ShutterType } from '../types/window';
import type { CadStructure, WorkshopBOM, HardwareItemDetail } from '../types/cad';
import { ALGERIAN_WILAYAS_58 } from './algerianWilayas';
import { DTR_ZONE_THRESHOLDS, getDtrZoneForWilaya } from './dtrThermal';

export interface DevisOpeningItem {
  id: string;
  roomName: string;
  width: number;
  height: number;
  allegeMm?: number;
  openingType: OpeningType;
  profileSystem: ProfileSystem;
  glassType: GlassType;
  shutterType: ShutterType;
  quantity: number;
  estimatedUnitPriceDzd: number;
}

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
    double_argon_warmedge: 'Double Vitrage 4/16/4 Argon + Warm-Edge',
    phonique_stadip: 'Feuilleté Phonique Stadip Silence 6/16/4 (Rw 38dB)',
    securit_tempered: 'Verre Trempé Sécurit 8mm Anti-Choc',
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
  clientWilaya: string = 'Alger',
  items?: DevisOpeningItem[]
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
  const hasMultipleItems = items && items.length > 0;
  const tableRows = hasMultipleItems
    ? items.map((it) => [
        it.roomName || 'Châssis',
        it.allegeMm !== undefined
          ? `${formatOpeningTypeFr(it.openingType)} (${it.width} × ${it.height} mm, Allège ${it.allegeMm} mm)`
          : `${formatOpeningTypeFr(it.openingType)} (${it.width} × ${it.height} mm)`,
        formatProfileSystemFr(it.profileSystem),
        formatFinishColorFr(config.finishColor),
        formatGlassTypeFr(it.glassType),
        formatShutterTypeFr(it.shutterType),
        `${it.quantity}`,
        `${(it.estimatedUnitPriceDzd * it.quantity).toLocaleString()} DZD`,
      ])
    : [
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

  // Get final Y position after table with multi-page safety
  let currentY = (doc as any).lastAutoTable.finalY + 8;
  if (currentY > 210) {
    doc.addPage();
    currentY = 25;
  }

  // 4. Detailed Cost Breakdown Box
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(110, currentY, 86, 44, 2, 2, 'FD');

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);

  if (hasMultipleItems && items.length > 1) {
    const totalQty = items.reduce((s, it) => s + it.quantity, 0);
    doc.text(`Ensemble châssis (${totalQty} ouvertures) :`, 114, currentY + 7);
    doc.text(`${cost.totalEstimatedDzd.toLocaleString()} DZD`, 190, currentY + 7, { align: 'right' });

    doc.text(`Chantier : ${items.length} pièces mesurées`, 114, currentY + 14);
    doc.text(`Conforme DTR C3-2`, 190, currentY + 14, { align: 'right' });

    doc.text('Quincaillerie & Pose sur chantier :', 114, currentY + 21);
    doc.text(`Inclus au devis`, 190, currentY + 21, { align: 'right' });
  } else {
    doc.text(`Profilés (${cost.profileWeightKg} kg / ${cost.profileLengthMeters}m) :`, 114, currentY + 7);
    doc.text(`${cost.profileCostDzd.toLocaleString()} DZD`, 190, currentY + 7, { align: 'right' });

    doc.text(`Vitrage (${cost.glassAreaM2} m²) :`, 114, currentY + 14);
    doc.text(`${cost.glassCostDzd.toLocaleString()} DZD`, 190, currentY + 14, { align: 'right' });

    doc.text('Quincaillerie & Accessoires :', 114, currentY + 21);
    doc.text(`${cost.hardwareCostDzd.toLocaleString()} DZD`, 190, currentY + 21, { align: 'right' });

    if (cost.shutterCostDzd > 0) {
      doc.text('Volet Roulant Intégré :', 114, currentY + 28);
      doc.text(`${cost.shutterCostDzd.toLocaleString()} DZD`, 190, currentY + 28, { align: 'right' });
    }
  }

  doc.setDrawColor(203, 213, 225);
  doc.line(114, currentY + 32, 192, currentY + 32);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(224, 122, 95);
  doc.text('Total Net à Payer :', 114, currentY + 39);
  doc.text(`${cost.totalEstimatedDzd.toLocaleString()} DZD`, 190, currentY + 39, { align: 'right' });

  // 5. Verification QR Code
  try {
    const qrDataUrl = await QRCode.toDataURL(`https://baiti.dz/verify/${quoteNumber}`, { width: 100, margin: 1 });
    doc.addImage(qrDataUrl, 'PNG', 16, currentY, 34, 34);
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);
    doc.text('Scannez pour vérifier', 33, currentY + 38, { align: 'center' });
    doc.text('l’authenticité du devis', 33, currentY + 41, { align: 'center' });
  } catch (err) {
    console.error('QR code error', err);
  }

  // 6. Payment Terms & Stamp Box
  let termsY = currentY + 50;
  if (termsY > 235) {
    doc.addPage();
    termsY = 25;
  }

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

export interface DtrCertificateParams {
  projectTitle?: string;
  clientName?: string;
  clientPhone?: string;
  wilayaName: string;
  widthMm: number;
  heightMm: number;
  openingType: OpeningType | string;
  profileSystem: ProfileSystem | string;
  glassType: GlassType | string;
  spacerType?: 'standard_alu' | 'warm_edge';
  glassAreaM2?: number;
  dateStr?: string;
}

export async function generateDtrThermalCertificatePdf(params: DtrCertificateParams) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const year = new Date().getFullYear();
  const certNumber = `DTR-TH-${year}-${Math.floor(1000 + Math.random() * 9000)}`;
  const certDate = params.dateStr || new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' });

  // Locate Wilaya
  const normalizedWilaya = (params.wilayaName || 'Alger').toLowerCase();
  const currentWilaya =
    ALGERIAN_WILAYAS_58.find(
      (w) => normalizedWilaya.includes(w.nameFr.toLowerCase()) || normalizedWilaya.startsWith(w.code)
    ) || ALGERIAN_WILAYAS_58[15];

  const zoneKey = getDtrZoneForWilaya(currentWilaya);
  const zoneThreshold = DTR_ZONE_THRESHOLDS[zoneKey];

  // Glass thermal properties
  let ug = 2.7;
  let rw = 32;
  let sw = 0.52;
  let glassLabel = 'Double vitrage isolant 4/16/4 clair standard';
  if (params.glassType === 'double_clear') {
    ug = 2.7;
    rw = 32;
    sw = 0.52;
    glassLabel = 'Double vitrage 4/16/4 isolation standard';
  } else if (params.glassType === 'simple_clear') {
    ug = 5.7;
    rw = 29;
    sw = 0.82;
    glassLabel = 'Simple vitrage clair 6 mm';
  } else if (params.glassType === 'stop_sol') {
    ug = 2.4;
    rw = 32;
    sw = 0.28;
    glassLabel = 'Double vitrage teinté Stop-Sol anti-surchauffe';
  } else if (params.glassType === 'sable') {
    ug = 3.0;
    rw = 31;
    sw = 0.44;
    glassLabel = 'Vitrage sablé dépoli translucide';
  } else if (params.glassType === 'double_argon_warmedge') {
    ug = 1.3;
    rw = 33;
    sw = 0.50;
    glassLabel = 'Double vitrage 4/16/4 Argon 90% + Warm-Edge';
  } else if (params.glassType === 'phonique_stadip') {
    ug = 1.4;
    rw = 38;
    sw = 0.48;
    glassLabel = 'Feuilleté phonique Stadip Silence 6/16/4 (Rw 38dB)';
  } else if (params.glassType === 'securit_tempered') {
    ug = 5.5;
    rw = 32;
    sw = 0.79;
    glassLabel = 'Verre trempé Sécurit 8 mm anti-choc';
  }

  // Frame thermal properties
  let uf = 2.4;
  let frameLabel = 'Alu Gamme 45 Rupture Pont Thermique (RPT barrette 14.8 mm)';
  if (params.profileSystem === 'pvc_70_chamber') {
    uf = 1.4;
    frameLabel = 'PVC 70 mm 5 Chambres Haute Performance';
  } else if (params.profileSystem === 'gamme_40') {
    uf = 5.8;
    frameLabel = 'Alu Gamme 40 Standard (Sans rupture thermique)';
  } else if (params.profileSystem === 'gamme_67_slide') {
    uf = 3.2;
    frameLabel = 'Alu Coulissant Renforcé Gamme 67';
  }

  // Spacer
  const spacerType = params.spacerType || 'standard_alu';
  const psiG = spacerType === 'warm_edge' ? 0.04 : 0.08;
  const spacerLabel =
    spacerType === 'warm_edge'
      ? 'Warm-Edge composite isolant (Psi = 0.04 W/m·K)'
      : 'Aluminium standard (Psi = 0.08 W/m·K)';

  // Geometric surfaces
  const totalAreaM2 = Math.max(0.2, (params.widthMm * params.heightMm) / 1000000);
  const calculatedGlassAreaM2 = params.glassAreaM2
    ? Math.min(totalAreaM2 * 0.85, params.glassAreaM2)
    : totalAreaM2 * 0.72;
  const frameAreaM2 = Math.max(0.04, totalAreaM2 - calculatedGlassAreaM2);
  const glassPerimeterM = Math.max(0.8, (2 * (params.widthMm + params.heightMm) * 0.85) / 1000);

  // Uw = (Ag*Ug + Af*Uf + lg*psiG) / Aw
  const uw = Number(
    ((calculatedGlassAreaM2 * ug + frameAreaM2 * uf + glassPerimeterM * psiG) / totalAreaM2).toFixed(2)
  );

  const isUwCompliant = uw <= zoneThreshold.maxUw;
  const isSwCompliant = sw <= zoneThreshold.maxSw;
  const isRwCompliant = rw >= zoneThreshold.minRw;
  const isFullyCompliant = isUwCompliant && isSwCompliant;

  let energyClass: string = 'C';
  if (uw <= 1.4) energyClass = 'A+';
  else if (uw <= 1.8) energyClass = 'A';
  else if (uw <= 2.3) energyClass = 'B';
  else if (uw <= 2.8) energyClass = 'C';
  else if (uw <= 3.5) energyClass = 'D';
  else if (uw <= 4.5) energyClass = 'E';
  else energyClass = 'F';

  // 1. Header Banner (Algerian Building Regulations DTR C3-2)
  doc.setFillColor(15, 23, 42); // Deep Slate #0F172A
  doc.rect(0, 0, 210, 36, 'F');

  // Emerald Regulatory Accent Line
  doc.setFillColor(5, 150, 105);
  doc.rect(0, 36, 210, 2, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text('RÉPUBLIQUE ALGÉRIENNE DÉMOCRATIQUE ET POPULAIRE', 105, 10, { align: 'center' });

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(203, 213, 225);
  doc.text("DOCUMENT TECHNIQUE RÉGLEMENTAIRE (DTR C3-2) • RÈGLES D'ISOLATION THERMIQUE", 105, 16, {
    align: 'center',
  });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12.5);
  doc.setTextColor(255, 255, 255);
  doc.text('ATTESTATION DE CONFORMITÉ THERMO-ACOUSTIQUE', 105, 24, { align: 'center' });

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(212, 175, 55); // Gold
  doc.text('MÉTHODE DE CALCUL NORMATIVE ISO 10077-1 • HOMOLOGATION ATELIER BAITI', 105, 30, {
    align: 'center',
  });

  // 2. Metadata Certificate Banner
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, 42, 182, 14, 1.5, 1.5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);
  doc.text(`ATTESTATION N° : ${certNumber}`, 18, 48);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text(`Date d'émission : ${certDate}`, 18, 53);

  // Status Badge Pill
  if (isFullyCompliant) {
    doc.setFillColor(209, 250, 229);
    doc.setDrawColor(5, 150, 105);
    doc.roundedRect(138, 45, 54, 8, 1, 1, 'FD');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(4, 120, 87);
    doc.text('CONFORME DTR C3-2', 165, 50.5, { align: 'center' });
  } else {
    doc.setFillColor(254, 243, 199);
    doc.setDrawColor(217, 119, 6);
    doc.roundedRect(130, 45, 62, 8, 1, 1, 'FD');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(180, 83, 9);
    doc.text('OPTIMISATION REQUISE', 161, 50.5, { align: 'center' });
  }

  // 3. Identification & Zone Bioclimatique (Side by side)
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, 60, 88, 27, 1.5, 1.5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(15, 23, 42);
  doc.text('IDENTIFICATION DU PROJET & CHANTIER', 18, 66);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(71, 85, 105);
  doc.text(`Projet : ${params.projectTitle || 'Menuiserie Bâtiment Privé'}`, 18, 72);
  doc.text(`Maître d'Ouvrage : ${params.clientName || 'Client Particulier'}`, 18, 77);
  doc.text(`Wilaya de Pose : ${currentWilaya.code} - ${currentWilaya.nameFr}`, 18, 82);

  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(108, 60, 88, 27, 1.5, 1.5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(15, 23, 42);
  doc.text('CADRAGE BIOCLIMATIQUE (DTR C3-2)', 112, 66);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(71, 85, 105);
  doc.text(`Classification : ${zoneThreshold.label}`, 112, 72);
  doc.text(`Transmittance maximale admise (Uw,adm) : ≤ ${zoneThreshold.maxUw} W/(m²·K)`, 112, 77);
  doc.text(`Facteur solaire été admis (Sw,adm) : ≤ ${zoneThreshold.maxSw}`, 112, 82);

  // 4. Caractéristiques Techniques de l'Ouvrage
  const openingLabel = formatOpeningTypeFr(params.openingType);

  autoTable(doc, {
    startY: 91,
    head: [['Paramètre Ouvrage', 'Spécification Technique Retenue', 'Unité / Valeur']],
    body: [
      ['Désignation de la baie', openingLabel, `${params.widthMm} × ${params.heightMm} mm`],
      ['Surface totale de baie (Aw)', 'Surface tableau maçonnerie', `${totalAreaM2.toFixed(2)} m²`],
      ['Système de profilés (Cadre)', frameLabel, `Uf = ${uf} W/(m²·K)`],
      ['Complexe de vitrage', glassLabel, `Ug = ${ug} W/(m²·K)`],
      ['Intercalaire de vitrage', spacerLabel, `Ψg = ${psiG} W/(m·K)`],
    ],
    theme: 'grid',
    headStyles: {
      fillColor: [15, 23, 42],
      textColor: [255, 255, 255],
      fontSize: 7.5,
      fontStyle: 'bold',
      cellPadding: 1.8,
    },
    bodyStyles: {
      fontSize: 7,
      textColor: [15, 23, 42],
      cellPadding: 1.5,
    },
    columnStyles: {
      0: { cellWidth: 50, fontStyle: 'bold' },
      1: { cellWidth: 92 },
      2: { cellWidth: 40, halign: 'right', fontStyle: 'bold', textColor: [30, 41, 59] },
    },
  });

  const table1Y = (doc as any).lastAutoTable.finalY + 3.5;

  // 5. Décomposition Détaillée des Déperditions Thermiques
  autoTable(doc, {
    startY: table1Y,
    head: [['Composant', 'Surface / Longueur', 'Transmittance Unitaire', 'Quote-Part (Flux Thermique)']],
    body: [
      [
        'Vitrage (Ag · Ug)',
        `${calculatedGlassAreaM2.toFixed(2)} m²`,
        `${ug} W/(m²·K)`,
        `${(calculatedGlassAreaM2 * ug).toFixed(2)} W/K`,
      ],
      [
        'Profilés Cadre (Af · Uf)',
        `${frameAreaM2.toFixed(2)} m²`,
        `${uf} W/(m²·K)`,
        `${(frameAreaM2 * uf).toFixed(2)} W/K`,
      ],
      [
        'Intercalaire linéaire (lg · Ψg)',
        `${glassPerimeterM.toFixed(2)} ml`,
        `${psiG} W/(m·K)`,
        `${(glassPerimeterM * psiG).toFixed(2)} W/K`,
      ],
      [
        'TRANSMITTANCE GLOBALE RÉSULTANTE (Uw)',
        `Aw = ${totalAreaM2.toFixed(2)} m²`,
        'Formule DTR C3-2 / ISO 10077',
        `${uw} W/(m²·K)`,
      ],
    ],
    theme: 'grid',
    headStyles: {
      fillColor: [30, 41, 59],
      textColor: [255, 255, 255],
      fontSize: 7.5,
      fontStyle: 'bold',
      cellPadding: 1.8,
    },
    bodyStyles: {
      fontSize: 7,
      textColor: [15, 23, 42],
      cellPadding: 1.5,
    },
    columnStyles: {
      0: { cellWidth: 64, fontStyle: 'bold' },
      1: { cellWidth: 38, halign: 'center' },
      2: { cellWidth: 44, halign: 'center' },
      3: { cellWidth: 36, halign: 'right', fontStyle: 'bold' },
    },
    didParseCell: (data) => {
      if (data.row.index === 3) {
        data.cell.styles.fillColor = isUwCompliant ? [240, 253, 244] : [254, 242, 242];
        data.cell.styles.textColor = isUwCompliant ? [4, 120, 87] : [185, 28, 28];
        data.cell.styles.fontStyle = 'bold';
      }
    },
  });

  const table2Y = (doc as any).lastAutoTable.finalY + 3.5;

  // 6. Tableau Récapitulatif de Conformité & Performance Énergétique
  autoTable(doc, {
    startY: table2Y,
    head: [['Critère Réglementaire', 'Valeur Calculée', 'Seuil DTR C3-2', 'Évaluation']],
    body: [
      [
        'Transmittance thermique globale (Uw)',
        `${uw} W/(m²·K)`,
        `≤ ${zoneThreshold.maxUw} W/(m²·K)`,
        isUwCompliant ? 'CONFORME (HOMOLOGUÉ)' : 'NON CONFORME (SURCONSOMMATION)',
      ],
      [
        'Facteur solaire estival (Sw / g)',
        `${sw}`,
        `≤ ${zoneThreshold.maxSw}`,
        isSwCompliant ? 'CONFORME (CONFORT ÉTÉ)' : 'ATTENTION (RISQUE SURCHAUFFE)',
      ],
      [
        'Affaiblissement acoustique façade (Rw)',
        `${rw} dB`,
        `≥ ${zoneThreshold.minRw} dB`,
        isRwCompliant ? 'CONFORME (ISOLATION OPTIMALE)' : 'STANDARD',
      ],
      [
        'Classe d’Efficacité Énergétique',
        `Classe ${energyClass}`,
        'Classification Bâtiment Durable',
        `NIVEAU ${energyClass}`,
      ],
    ],
    theme: 'grid',
    headStyles: {
      fillColor: [15, 23, 42],
      textColor: [255, 255, 255],
      fontSize: 7.5,
      fontStyle: 'bold',
      cellPadding: 1.8,
    },
    bodyStyles: {
      fontSize: 7,
      textColor: [15, 23, 42],
      cellPadding: 1.5,
    },
    columnStyles: {
      0: { cellWidth: 64, fontStyle: 'bold' },
      1: { cellWidth: 36, halign: 'center', fontStyle: 'bold' },
      2: { cellWidth: 42, halign: 'center' },
      3: { cellWidth: 40, halign: 'center', fontStyle: 'bold' },
    },
    didParseCell: (data) => {
      if (data.section === 'body' && data.column.index === 3) {
        if (data.row.index === 0) {
          data.cell.styles.textColor = isUwCompliant ? [4, 120, 87] : [185, 28, 28];
        } else if (data.row.index === 1) {
          data.cell.styles.textColor = isSwCompliant ? [4, 120, 87] : [217, 119, 6];
        } else if (data.row.index === 2) {
          data.cell.styles.textColor = [4, 120, 87];
        } else if (data.row.index === 3) {
          data.cell.styles.textColor = [30, 41, 59];
        }
      }
    },
  });

  const table3Y = (doc as any).lastAutoTable.finalY + 4;

  // 7. QR Code & Validation Signature Block
  const qrDataUrl = await QRCode.toDataURL(
    `https://baiti.dz/dtr/${certNumber}?uw=${uw}&zone=${zoneKey}&wilaya=${currentWilaya.code}`,
    { width: 100, margin: 1 }
  );

  doc.setDrawColor(226, 232, 240);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, table3Y, 182, 34, 1.5, 1.5, 'FD');

  // QR Code Image
  doc.addImage(qrDataUrl, 'PNG', 16, table3Y + 3, 28, 28);

  // Legal text
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(15, 23, 42);
  doc.text('ATTESTATION TECHNIQUE D’HOMOLOGATION', 48, table3Y + 7);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(71, 85, 105);
  doc.text(
    'La présente attestation certifie que la menuiserie vitrée décrite a fait l’objet d’une modélisation thermique',
    48,
    table3Y + 12
  );
  doc.text(
    'conforme aux règles du Document Technique Réglementaire DTR C3-2 et aux méthodes ISO 10077-1.',
    48,
    table3Y + 16
  );
  doc.text(
    'Ce document est valable pour le dépôt du dossier de permis de construire et le visa technique de conformité.',
    48,
    table3Y + 20
  );
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(100, 116, 139);
  doc.text(`Scannez le code QR pour vérifier l'authenticité sur la plateforme Baiti Atelier.`, 48, table3Y + 25);

  // Right Signatures
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(15, 23, 42);
  doc.text('Cachet de l’Atelier & Date :', 138, table3Y + 7);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6);
  doc.setTextColor(100, 116, 139);
  doc.text('BAITI ATELIER ALGERIE', 138, table3Y + 12);
  doc.text('Responsable Technique & Métreur', 138, table3Y + 16);
  doc.text(certDate, 138, table3Y + 28);

  doc.save(`Attestation_DTR_C32_${currentWilaya.code}_${certNumber}.pdf`);
}

export interface LinearCuttingPlanPdfParams {
  projectTitle?: string;
  clientName?: string;
  clientWilaya?: string;
  kerfMm: number;
  totalStockBars: number;
  totalRemnantsUsed: number;
  overallYieldPercent: number;
  bars: Array<{
    barIndex: number;
    stockLength: number;
    isRemnant?: boolean;
    cuts: Array<{
      length: number;
      label: string;
      miterLeft?: number;
      miterRight?: number;
    }>;
    wasteLength: number;
  }>;
}

/**
 * Generates an official Algerian workshop 1D linear saw cutting plan (A4 PDF)
 * detailing stock bar allocations, prioritized offcut reuse, and operator checkoff boxes.
 */
export function generateLinearCuttingPlanPdf(params: LinearCuttingPlanPdfParams) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const refNumber = `SCIE-2026-${Math.floor(1000 + Math.random() * 9000)}`;
  const docDate = new Date().toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  // 1. Header Banner
  doc.setFillColor(15, 23, 42); // Deep slate #0F172A
  doc.rect(0, 0, 210, 36, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('BAITI ATELIER ALGERIE', 14, 15);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(203, 213, 225);
  doc.text('Menuiserie Aluminium & PVC • Fiche d\'Optimisation de Débit Scie 1D', 14, 22);
  doc.text('Standard Barres 6.00m • Réemploi Prioritaire des Chutes d\'Atelier', 14, 27);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(212, 175, 55); // Accent Gold #D4AF37
  doc.text('PLAN DE DÉBIT SCIE', 145, 15);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(226, 232, 240);
  doc.text(`Réf : ${refNumber}`, 145, 22);
  doc.text(`Date : ${docDate}`, 145, 27);

  // 2. Project Metadata Box
  doc.setDrawColor(226, 232, 240);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, 42, 182, 24, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text('Paramètres du Chantier & Réglage Scie :', 20, 49);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text(`Chantier / Client : ${params.clientName || 'Atelier Général'}`, 20, 56);
  doc.text(`Wilaya : ${params.clientWilaya || 'Alger'}`, 20, 61);

  doc.text(`Épaisseur trait de scie (Lame) : ${params.kerfMm} mm`, 110, 56);
  doc.text(`Rognage mors de serrage : 25 mm`, 110, 61);

  // 3. KPI Summary Tiles
  const kpiY = 70;
  const tileWidth = 43;
  const tileHeight = 16;

  // Tile 1: Barres 6m
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(14, kpiY, tileWidth, tileHeight, 1.5, 1.5, 'FD');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text('BARRES 6M NEUVES', 14 + tileWidth / 2, kpiY + 5, { align: 'center' });
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(212, 175, 55);
  doc.text(`${params.totalStockBars}`, 14 + tileWidth / 2, kpiY + 12, { align: 'center' });

  // Tile 2: Chutes Réutilisées
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(60, kpiY, tileWidth, tileHeight, 1.5, 1.5, 'FD');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text('CHUTES RÉEMPLOYÉES', 60 + tileWidth / 2, kpiY + 5, { align: 'center' });
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(14, 165, 233);
  doc.text(`${params.totalRemnantsUsed}`, 60 + tileWidth / 2, kpiY + 12, { align: 'center' });

  // Tile 3: Rendement Matière
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(106, kpiY, tileWidth, tileHeight, 1.5, 1.5, 'FD');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text('RENDEMENT MATIÈRE', 106 + tileWidth / 2, kpiY + 5, { align: 'center' });
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(16, 185, 129);
  doc.text(`${params.overallYieldPercent.toFixed(1)}%`, 106 + tileWidth / 2, kpiY + 12, { align: 'center' });

  // Tile 4: Économie Estimée
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(152, kpiY, tileWidth, tileHeight, 1.5, 1.5, 'FD');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text('GAIN CHUTES ATELIER', 152 + tileWidth / 2, kpiY + 5, { align: 'center' });
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  const savingDzd = params.totalRemnantsUsed * 3200;
  doc.text(`+${savingDzd.toLocaleString('fr-DZ')} DZD`, 152 + tileWidth / 2, kpiY + 12, { align: 'center' });

  // 4. Cutting Schedule Table
  const tableRows = params.bars.map((bar) => {
    const typeLabel = bar.isRemnant || bar.stockLength < 6000
      ? `Chute Atelier (${bar.stockLength} mm)`
      : `Barre Neuve (6000 mm)`;

    const cutsFormatted = bar.cuts
      .map((c) => {
        const mLeft = c.miterLeft !== undefined ? `${c.miterLeft}°` : '45°';
        const mRight = c.miterRight !== undefined ? `${c.miterRight}°` : '45°';
        return `• ${c.length} mm (${mLeft}/${mRight}) : ${c.label}`;
      })
      .join('\n');

    const totalCutsLength = bar.cuts.reduce((sum, c) => sum + c.length, 0);

    const wasteLabel = bar.wasteLength >= 800
      ? `${bar.wasteLength} mm (À réintégrer au stock chute)`
      : bar.wasteLength > 0
      ? `${bar.wasteLength} mm (Reste / Déchet)`
      : '0 mm';

    return [
      `#${bar.barIndex}`,
      typeLabel,
      cutsFormatted,
      `${totalCutsLength} mm`,
      wasteLabel,
      '[   ] Fait',
    ];
  });

  autoTable(doc, {
    startY: 92,
    head: [['N°', 'Origine Support', 'Tronçons de Découpe (Longueur • Onglets • Emplacement)', 'Longueur Nette', 'Chute Résiduelle', 'Visa Scie']],
    body: tableRows,
    theme: 'grid',
    headStyles: {
      fillColor: [15, 23, 42],
      textColor: [255, 255, 255],
      fontSize: 8,
      fontStyle: 'bold',
    },
    bodyStyles: {
      fontSize: 7.5,
      textColor: [15, 23, 42],
      valign: 'middle',
    },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center', fontStyle: 'bold' },
      1: { cellWidth: 32 },
      2: { cellWidth: 78 },
      3: { cellWidth: 22, halign: 'right', fontStyle: 'bold' },
      4: { cellWidth: 26, fontSize: 6.5 },
      5: { cellWidth: 14, halign: 'center' },
    },
  });

  // 5. Workshop Quality & Safety Signatures
  const finalY = (doc as any).lastAutoTable.finalY + 8;
  const isCloseToBottom = finalY > 240;
  const targetSignY = isCloseToBottom ? 245 : finalY;

  if (isCloseToBottom) {
    doc.addPage();
  }

  const signBlockY = isCloseToBottom ? 20 : targetSignY;

  doc.setDrawColor(226, 232, 240);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, signBlockY, 182, 30, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);
  doc.text('Consignes d\'Atelier & Émargement Opérateurs :', 20, signBlockY + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(71, 85, 105);
  doc.text('1. Contrôler l\'état de la lame carbure et lubrifier lors de la coupe aluminium.', 20, signBlockY + 12);
  doc.text('2. Ranger immédiatement les chutes de longueur supérieure ou égale à 800 mm dans le rack à chutes.', 20, signBlockY + 17);
  doc.text('3. Ébavurer chaque arête avant transmission au poste d\'usinage et de sertissage.', 20, signBlockY + 22);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(15, 23, 42);
  doc.text('Visa Opérateur Scie :', 125, signBlockY + 12);
  doc.text('Visa Contrôle Qualité :', 125, signBlockY + 22);

  doc.setFont('helvetica', 'italic');
  doc.setFontSize(6.5);
  doc.setTextColor(148, 163, 184);
  doc.text('Document généré via Baiti Atelier • Système de Débit Linéaire Optimisé', 105, 290, {
    align: 'center',
  });

  doc.save(`Fiche_Debit_Scie_${refNumber}.pdf`);
}

export interface InstallationAcceptancePdfParams {
  jobId: string;
  clientName: string;
  clientPhone: string;
  wilaya: string;
  description: string;
  itemCount: number;
  totalAmountDzd: number;
  depositDzd: number;
  profileSystem?: string;
  installationDate?: string;
  hasReservations?: boolean;
  reservationNotes?: string;
}

/**
 * Generates an official Algerian Job Site Installation Acceptance Certificate (PV de Pose)
 * in accordance with building trade standards and DTR / DTU specifications.
 */
export async function generateInstallationAcceptancePdf(params: InstallationAcceptancePdfParams) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pvNumber = `PV-${params.jobId.replace(/^AFF-/, '')}-${Math.floor(100 + Math.random() * 900)}`;
  const pvDate = params.installationDate || new Date().toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const balanceDue = Math.max(0, params.totalAmountDzd - params.depositDzd);

  // 1. Official Header
  doc.setFillColor(15, 23, 42); // Deep slate #0F172A
  doc.rect(0, 0, 210, 36, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('BAITI ATELIER ALGERIE', 14, 14);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(203, 213, 225);
  doc.text('Menuiserie Aluminium & PVC • Travaux de Fabrication et Pose sur Chantier', 14, 21);
  doc.text('Contrôle de Conformité DTU 36.5 / DTR C3-2 • Réception Conjointe des Travaux', 14, 26);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(212, 175, 55); // Accent Gold #D4AF37
  doc.text('PROCÈS-VERBAL DE RÉCEPTION (PV)', 132, 14);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(226, 232, 240);
  doc.text(`N° : ${pvNumber}`, 132, 21);
  doc.text(`Date : ${pvDate}`, 132, 26);

  // Status Badge Pill
  if (!params.hasReservations) {
    doc.setFillColor(209, 250, 229);
    doc.setDrawColor(5, 150, 105);
    doc.roundedRect(132, 29, 64, 5.5, 1, 1, 'FD');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(4, 120, 87);
    doc.text('RÉCEPTION PRONONCÉE SANS RÉSERVE', 164, 33, { align: 'center' });
  } else {
    doc.setFillColor(254, 243, 199);
    doc.setDrawColor(217, 119, 6);
    doc.roundedRect(132, 29, 64, 5.5, 1, 1, 'FD');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(180, 83, 9);
    doc.text('RÉCEPTION AVEC RÉSERVES', 164, 33, { align: 'center' });
  }

  // 2. Identification of Parties & Project Box
  doc.setDrawColor(226, 232, 240);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, 42, 182, 30, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text('1. Identification des Parties et du Chantier :', 20, 48);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text(`Maître d'Ouvrage (Client) : ${params.clientName}`, 20, 55);
  doc.text(`Téléphone : ${params.clientPhone}`, 20, 60);
  doc.text(`Localisation / Wilaya : ${params.wilaya}`, 20, 65);

  doc.text(`Affaire N° : ${params.jobId}`, 110, 55);
  doc.text(`Gamme Posée : ${formatProfileSystemFr(params.profileSystem || 'gamme_45_thermal')}`, 110, 60);
  doc.text(`Volume Réceptionné : ${params.itemCount} châssis menuiserie`, 110, 65);

  // 3. Technical Inspection Matrix Table
  const inspectionPoints = [
    ['1', 'Aplomb, horizontalité et niveau des dormants', 'Tolérance conforme (≤ 2 mm par mètre courant)', 'CONFORME'],
    ['2', 'Fixations mécaniques et ancrages maçonnerie', 'Chevilles adaptées, calage d\'assise imputrescible', 'CONFORME'],
    ['3', 'Étanchéité périphérique extérieure', 'Cordon continu mastic élastomère 1ère catégorie', 'CONFORME'],
    ['4', 'Drainage et évacuation des eaux pluviales', 'Chicanes et orifices de décompression dégagés', 'CONFORME'],
    ['5', 'Fonctionnement cinématique des ouvrants', 'Coulissement fluide, compression hermétique des joints', 'CONFORME'],
    ['6', 'Aspect et intégrité des vitrages', 'Absence d\'impact, rayure ou condensation interne', 'CONFORME'],
    ['7', 'Quincaillerie, serrures et crémones', 'Verrouillage sécurisé et manœuvre sans point dur', 'CONFORME'],
    ['8', 'Nettoyage et repliement du chantier', 'Films de protection déposés, zone rendue propre', 'CONFORME'],
  ];

  autoTable(doc, {
    startY: 77,
    head: [['N°', 'Point de Contrôle Technique', 'Critère d\'Appréciation / Norme', 'Verdict']],
    body: inspectionPoints,
    theme: 'grid',
    headStyles: {
      fillColor: [15, 23, 42],
      textColor: [255, 255, 255],
      fontSize: 8,
      fontStyle: 'bold',
    },
    bodyStyles: {
      fontSize: 7.5,
      textColor: [15, 23, 42],
    },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center', fontStyle: 'bold' },
      1: { cellWidth: 74 },
      2: { cellWidth: 74 },
      3: { cellWidth: 24, halign: 'center', fontStyle: 'bold', textColor: [4, 120, 87] },
    },
  });

  const tableEnd = (doc as any).lastAutoTable.finalY + 6;

  // 4. Financial Status Box
  doc.setDrawColor(226, 232, 240);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, tableEnd, 182, 22, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text('2. Règlement Financier des Travaux :', 20, tableEnd + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text(`Montant global convenu : ${params.totalAmountDzd.toLocaleString('fr-DZ')} DZD`, 20, tableEnd + 13);
  doc.text(`Acomptes perçus : ${params.depositDzd.toLocaleString('fr-DZ')} DZD`, 20, tableEnd + 18);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(balanceDue > 0 ? 180 : 4, balanceDue > 0 ? 83 : 120, balanceDue > 0 ? 9 : 87);
  doc.text(`Solde net à régler à réception : ${balanceDue.toLocaleString('fr-DZ')} DZD`, 105, tableEnd + 15);

  // 5. Legal Guarantee Terms Box
  const termsY = tableEnd + 26;
  doc.setDrawColor(226, 232, 240);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, termsY, 182, 21, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);
  doc.text('3. Régime des Garanties Légales :', 20, termsY + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(71, 85, 105);
  doc.text('• Garantie de parfait achèvement (1 an) couvrant toute non-conformité signalée lors de l\'exploitation.', 20, termsY + 11);
  doc.text('• Garantie biennale de bon fonctionnement (2 ans) sur la quincaillerie, galets, compas et accessoires.', 20, termsY + 15);
  doc.text('• Garantie décennale (10 ans) relative à la solidité de fixation et l\'étanchéité à l\'eau du gros œuvre.', 20, termsY + 19);

  // 6. Signatures and Stamp Block
  const signY = termsY + 25;
  const qrDataUrl = await QRCode.toDataURL(
    `https://web-two-tan-31.vercel.app/verify/pv?job=${params.jobId}&ref=${pvNumber}`,
    { width: 120, margin: 1 }
  );

  doc.setDrawColor(203, 213, 225);
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(14, signY, 88, 30, 2, 2, 'FD');
  doc.roundedRect(108, signY, 88, 30, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(15, 23, 42);
  doc.text('Le Maître d\'Ouvrage (Client) :', 20, signY + 6);
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(6.5);
  doc.setTextColor(100, 116, 139);
  doc.text('« Lu et approuvé, bon pour réception des travaux »', 20, signY + 11);
  doc.text(`Nom : ${params.clientName}`, 20, signY + 16);
  doc.text(`Date : ${pvDate}`, 20, signY + 21);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(15, 23, 42);
  doc.text('Pour l\'Entreprise (Baiti Atelier) :', 114, signY + 6);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(100, 116, 139);
  doc.text('Cachet de l\'Atelier & Signature du Conducteur :', 114, signY + 11);
  doc.text('BAITI ATELIER ALGERIE', 114, signY + 16);
  doc.text('Validé conforme aux règles de l\'art', 114, signY + 21);

  // QR Code embedded inside stamp area
  doc.addImage(qrDataUrl, 'PNG', 166, signY + 10, 18, 18);

  // Footer Note
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(6.5);
  doc.setTextColor(148, 163, 184);
  doc.text('Document contractuel de réception édité via Baiti Atelier • Fait en double exemplaire original', 105, 290, {
    align: 'center',
  });

  doc.save(`PV_Reception_Pose_${pvNumber}_${params.clientName.replace(/\s+/g, '_')}.pdf`);
}

export interface GlazierOrderItem {
  id: string;
  label: string;
  widthMm: number;
  heightMm: number;
  glassType: string;
  quantity: number;
  areaM2: number;
  edgeFinish?: string;
}

export interface GlazierCuttingOrderPdfParams {
  orderNumber?: string;
  projectTitle: string;
  clientName: string;
  clientPhone: string;
  wilaya: string;
  supplierName?: string;
  supplierPhone?: string;
  deliveryDate?: string;
  items: GlazierOrderItem[];
}

/**
 * Generates an official A4 Glazier Cutting & Procurement Order Sheet (Bon de Commande Débit Vitrerie)
 * for glass factories, temperers, and double-glazing suppliers across Algerian Wilayas.
 */
export async function generateGlazierCuttingOrderPdf(params: GlazierCuttingOrderPdfParams) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const orderNumber =
    params.orderNumber ||
    `VIT-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
  const orderDate = new Date().toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const totalVolumes = params.items.reduce((sum, it) => sum + it.quantity, 0);
  const totalAreaM2 = params.items.reduce((sum, it) => sum + it.areaM2 * it.quantity, 0);

  // 1. Header Banner
  doc.setFillColor(15, 23, 42); // Deep slate #0F172A
  doc.rect(0, 0, 210, 38, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('BAITI ATELIER', 14, 16);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(203, 213, 225);
  doc.text('Menuiserie Aluminium & PVC • Gestion des Approvisionnements', 14, 23);
  doc.text('Service Technique & Débit Vitrage • 58 Wilayas Algérie', 14, 28);
  doc.text(`Contact Chantier : ${params.clientPhone || '+213 (0) 550 12 34 56'}`, 14, 33);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(212, 175, 55); // Accent Gold #D4AF37
  doc.text('BON DE COMMANDE VITRERIE', 125, 16);

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(226, 232, 240);
  doc.text(`Réf : ${orderNumber}`, 125, 23);
  doc.text(`Date : ${orderDate}`, 125, 28);
  doc.text(`Livraison : ${params.deliveryDate || 'Sous 48 à 72 heures'}`, 125, 33);

  // 2. Client & Supplier Information Cards
  doc.setDrawColor(226, 232, 240);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, 43, 88, 26, 2, 2, 'FD');
  doc.roundedRect(108, 43, 88, 26, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);
  doc.text('DESTINATAIRE (FOURNISSEUR VITRAGE) :', 18, 49);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text(`Société : ${params.supplierName || 'Miroiterie / Usine de Vitrage'}`, 18, 55);
  doc.text(`Wilaya : ${params.wilaya || 'Alger'}`, 18, 60);
  doc.text(`Téléphone : ${params.supplierPhone || 'Service Commercial Miroiterie'}`, 18, 65);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);
  doc.text('RÉFÉRENCE CHANTIER & ÉMETTEUR :', 112, 49);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text(`Projet : ${params.projectTitle || 'Chantier Menuiserie'}`, 112, 55);
  doc.text(`Client Final : ${params.clientName || 'Particulier'}`, 112, 60);
  doc.text(`Wilaya de Pose : ${params.wilaya || 'Alger'}`, 112, 65);

  // 3. KPI Tiles (Total Volumes, Total M2, Tolerance, Sealing)
  const kpiY = 73;
  const tileW = 43.5;
  const tileH = 14;

  const kpis = [
    { label: 'Volumes Commandés', value: `${totalVolumes} vitrages`, color: [15, 23, 42] },
    { label: 'Surface Globale', value: `${totalAreaM2.toFixed(2)} m²`, color: [15, 23, 42] },
    { label: 'Tolérance Coupe', value: '± 1.0 mm', color: [15, 23, 42] },
    { label: 'Contrôle Arêtes', value: 'Arêtes Abattues (AA)', color: [212, 175, 55] },
  ];

  kpis.forEach((kpi, idx) => {
    const x = 14 + idx * (tileW + 2.6);
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(x, kpiY, tileW, tileH, 1.5, 1.5, 'FD');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(100, 116, 139);
    doc.text(kpi.label, x + 3, kpiY + 4.5);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(kpi.color[0], kpi.color[1], kpi.color[2]);
    doc.text(kpi.value, x + 3, kpiY + 10.5);
  });

  // 4. Cutting Table
  const tableRows = params.items.map((it, idx) => {
    const unitArea = it.areaM2.toFixed(2);
    const totalLineArea = (it.areaM2 * it.quantity).toFixed(2);
    const finish = it.edgeFinish || 'Arêtes abattues';

    return [
      `R${idx + 1}`,
      it.label,
      it.glassType,
      `${it.widthMm} mm`,
      `${it.heightMm} mm`,
      `${it.quantity}`,
      `${unitArea} m²`,
      `${totalLineArea} m²`,
      finish,
    ];
  });

  autoTable(doc, {
    startY: 91,
    head: [
      [
        'Rep.',
        'Emplacement / Pièce',
        'Composition Vitrage',
        'Larg.',
        'Haut.',
        'Qté',
        'Surf. Un.',
        'Surf. Tot.',
        'Façonnage',
      ],
    ],
    body: tableRows,
    theme: 'grid',
    headStyles: {
      fillColor: [15, 23, 42],
      textColor: [255, 255, 255],
      fontSize: 7.5,
      fontStyle: 'bold',
      halign: 'center',
    },
    bodyStyles: {
      fontSize: 7,
      textColor: [15, 23, 42],
      valign: 'middle',
    },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center', fontStyle: 'bold' },
      1: { cellWidth: 32 },
      2: { cellWidth: 42 },
      3: { cellWidth: 16, halign: 'right', fontStyle: 'bold' },
      4: { cellWidth: 16, halign: 'right', fontStyle: 'bold' },
      5: { cellWidth: 10, halign: 'center', fontStyle: 'bold' },
      6: { cellWidth: 15, halign: 'right' },
      7: { cellWidth: 15, halign: 'right', fontStyle: 'bold' },
      8: { cellWidth: 26, fontSize: 6.5 },
    },
  });

  // 5. Total Row Summary & Technical Instructions
  const tableEndY = (doc as any).lastAutoTable.finalY + 4;
  const isOverflow = tableEndY > 230;

  if (isOverflow) {
    doc.addPage();
  }

  const specBlockY = isOverflow ? 20 : tableEndY;

  doc.setDrawColor(226, 232, 240);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, specBlockY, 182, 24, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);
  doc.text('Prescriptions Techniques & Contrôle Qualité Miroiterie :', 20, specBlockY + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(71, 85, 105);
  doc.text('1. Tolérance de découpe impérative : ± 1.0 mm sur les diagonales et les chants.', 20, specBlockY + 11);
  doc.text('2. Double vitrage avec intercalaire aluminium ou warm-edge déshydraté et scellement double barrière.', 20, specBlockY + 15);
  doc.text('3. Étiquetage individuel obligatoire portant la mention du repère (R1, R2...) pour identification sur chantier.', 20, specBlockY + 19);

  // 6. Dual Signature Blocks
  const signBlockY = specBlockY + 28;

  doc.setDrawColor(203, 213, 225);
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(14, signBlockY, 88, 26, 2, 2, 'FD');
  doc.roundedRect(108, signBlockY, 88, 26, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(15, 23, 42);
  doc.text('Le Fournisseur Miroiterie (Accusé de Réception) :', 20, signBlockY + 6);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(100, 116, 139);
  doc.text('Date de confirmation de commande :', 20, signBlockY + 12);
  doc.text('Signature & Cachet de l\'usine :', 20, signBlockY + 18);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(15, 23, 42);
  doc.text('L\'Émetteur (Baiti Atelier) :', 114, signBlockY + 6);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(100, 116, 139);
  doc.text('Responsable des Achats & Débit :', 114, signBlockY + 12);
  doc.text('Bon pour fabrication selon cotes ci-dessus', 114, signBlockY + 18);

  // Footer Note
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(6.5);
  doc.setTextColor(148, 163, 184);
  doc.text('Document technique de débit vitrerie édité via Baiti Atelier • Conforme aux spécifications menuiserie', 105, 290, {
    align: 'center',
  });

  const safeFilename = `Commande_Vitrage_${orderNumber}_${(params.projectTitle || 'Chantier').replace(/\s+/g, '_')}.pdf`;
  doc.save(safeFilename);
}

export interface FabricationOrderPdfParams {
  jobId: string;
  clientName: string;
  clientPhone: string;
  wilaya: string;
  stage: string;
  description: string;
  itemCount: number;
  totalAmountDzd: number;
  depositDzd: number;
  dueDate: string;
  priority: string;
  profileSystem?: string;
  notes?: string;
}

/**
 * Generates an official Algerian Workshop Fabrication & Traveler Order Sheet (Fiche Suiveuse d'Atelier / OF)
 * for tracking aluminum and PVC joinery across 5 fabrication workstations.
 */
export async function generateFabricationOrderPdf(params: FabricationOrderPdfParams) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const ofNumber = `OF-2026-${params.jobId.replace(/\D/g, '') || Math.floor(1000 + Math.random() * 9000)}`;
  const emissionDate = new Date().toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const balanceDzd = Math.max(0, params.totalAmountDzd - params.depositDzd);

  // 1. Header Banner
  doc.setFillColor(15, 23, 42); // Deep slate #0F172A
  doc.rect(0, 0, 210, 38, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('BAITI ATELIER', 14, 16);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(203, 213, 225);
  doc.text('Menuiserie Aluminium & PVC • Gestion de la Production Atelier', 14, 23);
  doc.text('Fiche Suiveuse d\'Atelier • Contrôle Qualité aux Postes', 14, 28);
  doc.text('Zone Industrielle • 58 Wilayas Algérie • Tel: +213 (0) 550 12 34 56', 14, 33);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(212, 175, 55); // Accent Gold #D4AF37
  doc.text('ORDRE DE FABRICATION', 130, 16);

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(226, 232, 240);
  doc.text(`N° OF : ${ofNumber}`, 130, 23);
  doc.text(`Émis le : ${emissionDate}`, 130, 28);
  doc.text(`Livraison : ${params.dueDate || 'À convenir'}`, 130, 33);

  // 2. Client & Job Summary Cards
  doc.setDrawColor(226, 232, 240);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, 43, 88, 30, 2, 2, 'FD');
  doc.roundedRect(108, 43, 88, 30, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);
  doc.text('DONNÉES CLIENT & CHANTIER :', 18, 49);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text(`Client : ${params.clientName || 'Client Particulier'}`, 18, 55);
  doc.text(`Téléphone : ${params.clientPhone || 'Non renseigné'}`, 18, 60);
  doc.text(`Wilaya : ${params.wilaya || 'Alger'}`, 18, 65);
  doc.text(`Statut initial : ${params.stage.toUpperCase()}`, 18, 70);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);
  doc.text('RÉCAPITULATIF FINANCIER & PRIORITÉ :', 112, 49);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text(`Priorité : ${params.priority === 'critique' ? 'Critique (Urgentissime)' : params.priority === 'urgent' ? 'Urgente' : 'Normale'}`, 112, 55);
  doc.text(`Montant Devis : ${params.totalAmountDzd.toLocaleString('fr-DZ')} DZD`, 112, 60);
  doc.text(`Acompte Reçu : ${params.depositDzd.toLocaleString('fr-DZ')} DZD`, 112, 65);
  doc.text(`Solde à Percevoir : ${balanceDzd.toLocaleString('fr-DZ')} DZD`, 112, 70);

  // 3. Technical Specifications Banner
  doc.setDrawColor(212, 175, 55);
  doc.setFillColor(254, 252, 232); // Pale amber #FEFCE8
  doc.roundedRect(14, 76, 182, 18, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(120, 53, 15);
  doc.text('SPÉCIFICATIONS TECHNIQUES DE L\'OUVRAGE :', 18, 81);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(69, 26, 3);
  const profileLabel = formatProfileSystemFr(params.profileSystem || 'gamme_45_thermal');
  doc.text(`Série Profilés : ${profileLabel} • Quantité : ${params.itemCount} châssis`, 18, 86);
  doc.text(`Description : ${params.description || 'Menuiserie standard selon cotes carnet.'}`, 18, 91);

  // 4. Five Fabrication Workstations Table
  const stations = [
    [
      'Poste 1\nDébitage & Tronçonnage',
      '• Coupe profilés dormant et ouvrant (45° / 90°)\n• Coupe parcloses et rejets d\'eau\n• Contrôle ébavurage et vérification longueurs',
      '[   ] Conforme\nTolérance ±0.5mm',
      '[   ] Fait\nDate : ___/___',
    ],
    [
      'Poste 2\nUsinage & Fraisage',
      '• Lumières d\'évacuation d\'eau (drainage dormant)\n• Trous de poignée et logement têtière de serrure\n• Fraisage des embouts de traverse et meneaux',
      '[   ] Conforme\nDrainage vérifié',
      '[   ] Fait\nDate : ___/___',
    ],
    [
      'Poste 3\nAssemblage & Sertissage',
      '• Mise en place équerres de sertissage / vissage\n• Injection colle polyuréthane étanchéité d\'angle\n• Insertion joints d\'étanchéité EPDM dans gorge',
      '[   ] Conforme\nDiagonales égales',
      '[   ] Fait\nDate : ___/___',
    ],
    [
      'Poste 4\nQuincaillerie & Vitrage',
      '• Pose galets roulement inox ou compas OB\n• Calage périmétrique des vitrages (cales 2 à 5mm)\n• Clippage des parcloses et joints de bourrage',
      '[   ] Conforme\nManœuvre fluide',
      '[   ] Fait\nDate : ___/___',
    ],
    [
      'Poste 5\nContrôle Final & Emballage',
      '• Nettoyage résidus aluminium et dépoussiérage\n• Contrôle fermeture, compression joints et jeu\n• Filmage étirable et étiquetage repère chantier',
      '[   ] Validé\nBon pour pose',
      '[   ] Fait\nDate : ___/___',
    ],
  ];

  autoTable(doc, {
    startY: 97,
    head: [
      ['Poste d\'Atelier', 'Opérations Techniques de Fabrication', 'Contrôle Qualité Requis', 'Visa Opérateur'],
    ],
    body: stations,
    theme: 'grid',
    headStyles: {
      fillColor: [15, 23, 42],
      textColor: [255, 255, 255],
      fontSize: 8,
      fontStyle: 'bold',
      halign: 'center',
    },
    bodyStyles: {
      fontSize: 7,
      textColor: [15, 23, 42],
      valign: 'middle',
    },
    columnStyles: {
      0: { cellWidth: 38, fontStyle: 'bold' },
      1: { cellWidth: 88 },
      2: { cellWidth: 32, fontSize: 6.5 },
      3: { cellWidth: 24, halign: 'center', fontSize: 6.5 },
    },
  });

  // 5. Notes and Directives
  const tableEndY = (doc as any).lastAutoTable.finalY + 4;
  const isOverflow = tableEndY > 235;

  if (isOverflow) {
    doc.addPage();
  }

  const specY = isOverflow ? 20 : tableEndY;

  doc.setDrawColor(226, 232, 240);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, specY, 182, 20, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(15, 23, 42);
  doc.text('Prescriptions d\'Atelier & Directives de Sécurité :', 18, specY + 5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(71, 85, 105);
  doc.text('1. Port obligatoire des lunettes de protection, gants anti-coupure et coquilles antibruit à tous les postes.', 18, specY + 9.5);
  doc.text('2. Contrôle impératif de l\'équerrage et de l\'égalité des diagonales avant la pose des vitrages.', 18, specY + 13.5);
  doc.text('3. Toute non-conformité supérieure à 1 mm doit être signalée au chef d\'atelier avant sertissage définitif.', 18, specY + 17.5);

  // 6. Signatures & Stamp Blocks
  const signY = specY + 23;
  const qrDataUrl = await QRCode.toDataURL(
    `https://web-two-tan-31.vercel.app/verify/of?job=${params.jobId}&ref=${ofNumber}`,
    { width: 120, margin: 1 }
  );

  doc.setDrawColor(203, 213, 225);
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(14, signY, 88, 28, 2, 2, 'FD');
  doc.roundedRect(108, signY, 88, 28, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(15, 23, 42);
  doc.text('Le Chef d\'Atelier (Lancement de Fabrication) :', 18, signY + 5.5);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(100, 116, 139);
  doc.text('Visa de validation des débits et plans :', 18, signY + 11);
  doc.text(`Date : ${emissionDate}`, 18, signY + 16);
  doc.text('Signature : ____________________', 18, signY + 22);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(15, 23, 42);
  doc.text('Contrôle Qualité & Libération Sortie :', 112, signY + 5.5);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(100, 116, 139);
  doc.text('Bon pour expédition et pose sur chantier', 112, signY + 11);
  doc.text('Cachet de l\'Atelier :', 112, signY + 16);

  // QR Code embedded
  doc.addImage(qrDataUrl, 'PNG', 166, signY + 7, 18, 18);

  // Footer Note
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(6.5);
  doc.setTextColor(148, 163, 184);
  doc.text('Fiche suiveuse de fabrication éditée via Baiti Atelier • À conserver avec les châssis jusqu\'à la pose', 105, 290, {
    align: 'center',
  });

  const safeFilename = `Fiche_OF_Fabrication_${ofNumber}_${(params.clientName || 'Client').replace(/\s+/g, '_')}.pdf`;
  doc.save(safeFilename);
}

export interface PieceLabelItem {
  id: string;
  label: string;
  length: number;
  miterLeft: number;
  miterRight: number;
  profileCode?: string;
  destinationRoom?: string;
  quantity?: number;
}

export interface PieceLabelsPdfParams {
  projectTitle: string;
  clientName: string;
  finishColor?: string;
  profileSystem?: string;
  pieces: PieceLabelItem[];
}

export async function generatePieceLabelsPdf(params: PieceLabelsPdfParams): Promise<void> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const expandedPieces: PieceLabelItem[] = [];
  params.pieces.forEach((p) => {
    const qty = p.quantity && p.quantity > 0 ? p.quantity : 1;
    for (let q = 1; q <= qty; q++) {
      expandedPieces.push({
        ...p,
        label: qty > 1 ? `${p.label} (${q}/${qty})` : p.label,
      });
    }
  });

  const labelsPerPage = 10;
  const cols = 2;
  const labelWidth = 92;
  const labelHeight = 50;
  const marginX = 10;
  const marginY = 12;
  const colGap = 6;
  const rowGap = 4;

  const totalPages = Math.ceil(expandedPieces.length / labelsPerPage) || 1;
  const todayStr = new Date().toLocaleDateString('fr-DZ');

  for (let i = 0; i < expandedPieces.length; i++) {
    const pageIndex = Math.floor(i / labelsPerPage);
    const indexOnPage = i % labelsPerPage;

    if (i > 0 && indexOnPage === 0) {
      doc.addPage();
    }

    const col = indexOnPage % cols;
    const row = Math.floor(indexOnPage / cols);
    const x = marginX + col * (labelWidth + colGap);
    const y = marginY + row * (labelHeight + rowGap);

    const piece = expandedPieces[i];

    // Label Outer Border
    doc.setDrawColor(203, 213, 225);
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(x, y, labelWidth, labelHeight, 2, 2, 'FD');

    // Header Stripe
    doc.setFillColor(241, 245, 249);
    doc.roundedRect(x, y, labelWidth, 7, 2, 2, 'F');
    doc.rect(x, y + 4, labelWidth, 3, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(0, 51, 102);
    const clientTitle = `BAITI • ${params.clientName || 'Chantier Atelier'}`;
    doc.text(clientTitle.slice(0, 32), x + 3, y + 5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(5.5);
    doc.setTextColor(100, 116, 139);
    doc.text(todayStr, x + labelWidth - 3, y + 5, { align: 'right' });

    // QR Code
    try {
      const qrPayload = `BAITI|${piece.label}|L=${piece.length}mm|A=${piece.miterLeft}/${piece.miterRight}|${params.clientName || ''}`;
      const qrDataUrl = await QRCode.toDataURL(qrPayload, { width: 90, margin: 0 });
      doc.addImage(qrDataUrl, 'PNG', x + labelWidth - 25, y + 10, 22, 22);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(5);
      doc.setTextColor(148, 163, 184);
      doc.text('SCAN ATELIER', x + labelWidth - 14, y + 34.5, { align: 'center' });
      doc.text(`ID: ${piece.id.slice(-6)}`, x + labelWidth - 14, y + 37.5, { align: 'center' });
    } catch {
      // Fallback
    }

    // Left Column Info
    // Room / Destination
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(0, 51, 102);
    const roomText = piece.destinationRoom ? `[${piece.destinationRoom}]` : '[Châssis Atelier]';
    doc.text(roomText.slice(0, 28), x + 3, y + 12.5);

    // Piece designation
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(30, 41, 59);
    doc.text(piece.label.slice(0, 30), x + 3, y + 17);

    // Big Cutting Length
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(5.5);
    doc.setTextColor(100, 116, 139);
    doc.text('LONGUEUR DE COUPE :', x + 3, y + 22);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(0, 51, 102);
    doc.text(`${piece.length} mm`, x + 3, y + 28);

    // Miter angles
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(15, 23, 42);
    const miterDesc =
      piece.miterLeft === 45 && piece.miterRight === 45
        ? '45° / 45° (Biseau)'
        : piece.miterLeft === 90 && piece.miterRight === 90
        ? '90° / 90° (Droit)'
        : `${piece.miterLeft}° / ${piece.miterRight}°`;
    doc.text(`Onglets : ${miterDesc}`, x + 3, y + 33.5);

    // Profile & Finish
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6);
    doc.setTextColor(100, 116, 139);
    const finishLine = `${piece.profileCode || params.profileSystem || 'Alu 45 RPT'} • ${params.finishColor || 'Standard'}`;
    doc.text(finishLine.slice(0, 32), x + 3, y + 38);

    // Mini status checkbox
    doc.setDrawColor(203, 213, 225);
    doc.rect(x + 3, y + 41.5, 3.5, 3.5);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(5.5);
    doc.setTextColor(148, 163, 184);
    doc.text('Usiné', x + 8, y + 44.5);

    doc.rect(x + 20, y + 41.5, 3.5, 3.5);
    doc.text('Assemblé', x + 25, y + 44.5);

    // Footer on page bottom (if last label on page or last overall)
    if (indexOnPage === labelsPerPage - 1 || i === expandedPieces.length - 1) {
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(6.5);
      doc.setTextColor(148, 163, 184);
      doc.text(
        `Planche d'étiquettes de débitage Baiti Atelier • Page ${pageIndex + 1}/${totalPages} • Total : ${expandedPieces.length} étiquettes`,
        105,
        290,
        { align: 'center' }
      );
    }
  }

  const safeFilename = `Etiquettes_Debit_${(params.clientName || 'Chantier').replace(/\s+/g, '_')}_${Date.now()}.pdf`;
  doc.save(safeFilename);
}

export interface SupplierOrderItem {
  code: string;
  name: string;
  category?: string;
  quantity: number;
  unit: string;
  estimatedUnitCostDzd?: number;
}

export interface SupplierPurchaseOrderPdfParams {
  supplierName: string;
  supplierPhone?: string;
  orderReference: string;
  workshopName?: string;
  wilaya?: string;
  items: SupplierOrderItem[];
  notes?: string;
}

export async function generateSupplierPurchaseOrderPdf(params: SupplierPurchaseOrderPdfParams): Promise<void> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const primaryBlue: [number, number, number] = [0, 51, 102];
  const slateDark: [number, number, number] = [15, 23, 42];
  const goldAccent: [number, number, number] = [212, 175, 55];
  const textMuted: [number, number, number] = [100, 116, 139];

  // Header band
  doc.setFillColor(...primaryBlue);
  doc.rect(0, 0, 210, 24, 'F');

  doc.setFillColor(...goldAccent);
  doc.rect(0, 24, 210, 1.5, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(255, 255, 255);
  doc.text('BON DE COMMANDE FOURNISSEUR', 14, 12);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(226, 232, 240);
  doc.text('Approvisionnement Matières Premières & Quincaillerie Atelier', 14, 18);

  const todayStr = new Date().toLocaleDateString('fr-DZ');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text(`Réf : ${params.orderReference}`, 196, 12, { align: 'right' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.text(`Date : ${todayStr}`, 196, 18, { align: 'right' });

  // Supplier & Workshop Info Cards
  // Workshop Card
  doc.setDrawColor(226, 232, 240);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, 32, 88, 30, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...primaryBlue);
  doc.text('ÉMETTEUR (ATELIER)', 18, 38);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...slateDark);
  doc.text(params.workshopName || 'Baiti Atelier Aluminium & PVC', 18, 44);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(...textMuted);
  doc.text(`Wilaya : ${params.wilaya || 'Alger'}`, 18, 50);
  doc.text('Service Approvisionnement & Gestion de Stock', 18, 56);

  // Supplier Card
  doc.roundedRect(108, 32, 88, 30, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...primaryBlue);
  doc.text('FOURNISSEUR DESTINATAIRE', 112, 38);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...slateDark);
  doc.text(params.supplierName, 112, 44);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(...textMuted);
  if (params.supplierPhone) {
    doc.text(`Téléphone : ${params.supplierPhone}`, 112, 50);
  } else {
    doc.text('Distributeur / Grossiste Agréé', 112, 50);
  }
  doc.text('Commande prioritaire pour mise en production', 112, 56);

  // Table of Items
  const tableRows = params.items.map((it, idx) => {
    const unitPrice = it.estimatedUnitCostDzd || 0;
    const totalLine = unitPrice * it.quantity;
    return [
      String(idx + 1),
      it.code,
      it.name,
      `${it.quantity} ${it.unit}`,
      unitPrice > 0 ? `${unitPrice.toLocaleString('fr-DZ')} DZD` : 'Selon tarif',
      totalLine > 0 ? `${totalLine.toLocaleString('fr-DZ')} DZD` : '-',
    ];
  });

  const totalEstimated = params.items.reduce((sum, it) => sum + (it.estimatedUnitCostDzd || 0) * it.quantity, 0);

  autoTable(doc, {
    startY: 68,
    head: [['N°', 'Référence', 'Désignation Article', 'Quantité', 'P.U Estimé', 'Total Estimé']],
    body: tableRows,
    theme: 'grid',
    headStyles: {
      fillColor: primaryBlue,
      textColor: [255, 255, 255],
      fontSize: 8,
      fontStyle: 'bold',
      halign: 'center',
    },
    bodyStyles: {
      fontSize: 8,
      textColor: slateDark,
      cellPadding: 2.5,
    },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center' },
      1: { cellWidth: 32, fontStyle: 'bold' },
      2: { cellWidth: 70 },
      3: { cellWidth: 26, halign: 'center', fontStyle: 'bold' },
      4: { cellWidth: 26, halign: 'right' },
      5: { cellWidth: 26, halign: 'right', fontStyle: 'bold' },
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
  });

  let curY = (doc as any).lastAutoTable.finalY + 8;

  // Total summary box if estimated cost > 0
  if (totalEstimated > 0) {
    doc.setDrawColor(203, 213, 225);
    doc.setFillColor(241, 245, 249);
    doc.roundedRect(120, curY, 76, 12, 1.5, 1.5, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(...primaryBlue);
    doc.text('TOTAL ESTIMÉ COMMANDE :', 124, curY + 7.5);

    doc.setFontSize(9.5);
    doc.setTextColor(15, 23, 42);
    doc.text(`${totalEstimated.toLocaleString('fr-DZ')} DZD`, 192, curY + 7.5, { align: 'right' });

    curY += 18;
  }

  // Notes and logistics directives
  if (curY > 230) {
    doc.addPage();
    curY = 20;
  }

  doc.setDrawColor(226, 232, 240);
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(14, curY, 182, 26, 2, 2, 'D');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(...primaryBlue);
  doc.text('DIRECTIVES DE LIVRAISON ET CONDITIONS :', 18, curY + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(...textMuted);
  doc.text('1. Contrôle quantitatif et qualitatif obligatoire au déchargement à l atelier.', 18, curY + 11);
  doc.text('2. Profilés aluminium sous film protecteur intact sans rayures de transport.', 18, curY + 16);
  doc.text('3. Règlement effectué selon les conditions habituelles convenues (comptant ou virement).', 18, curY + 21);

  curY += 32;

  // Signatures
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...primaryBlue);
  doc.text('Visa Responsable Atelier', 30, curY);
  doc.text('Accusé Réception Fournisseur', 140, curY);

  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(20, curY + 4, 60, 20, 1.5, 1.5, 'D');
  doc.roundedRect(130, curY + 4, 60, 20, 1.5, 1.5, 'D');

  // QR Code Verification
  try {
    const qrPayload = `BAITI|BC|${params.orderReference}|${params.supplierName}|ART=${params.items.length}|${todayStr}`;
    const qrDataUrl = await QRCode.toDataURL(qrPayload, { width: 90, margin: 0 });
    doc.addImage(qrDataUrl, 'PNG', 94, curY + 3, 22, 22);
  } catch {
    // QR Code fallback
  }

  // Footer
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(6.5);
  doc.setTextColor(148, 163, 184);
  doc.text(
    `Document généré par Baiti Atelier • Bon de Commande ${params.orderReference} • www.baitiatelier.dz`,
    105,
    288,
    { align: 'center' }
  );

  const safeFilename = `Bon_Commande_${params.orderReference}_${params.supplierName.replace(/\s+/g, '_')}.pdf`;
  doc.save(safeFilename);
}

export interface HardwarePickListPdfParams {
  orderReference?: string;
  projectTitle: string;
  clientName?: string;
  clientPhone?: string;
  wilaya?: string;
  profileSystem?: string;
  finishColor?: string;
  widthMm: number;
  heightMm: number;
  items: HardwareItemDetail[];
}

export async function generateHardwarePickListPdf(params: HardwarePickListPdfParams) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const primaryBlue = [0, 51, 102] as const;
  const accentGold = [212, 175, 55] as const;
  const orderRef =
    params.orderReference ||
    `QC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
  const dateStr = new Date().toLocaleDateString('fr-DZ', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const totalPieces = params.items.reduce(
    (sum, it) => sum + (it.unit === 'pcs' ? it.quantity : 0),
    0
  );
  const totalCostDzd = params.items.reduce((sum, it) => sum + it.totalPriceDzd, 0);

  // 1. Header Banner
  doc.setFillColor(...primaryBlue);
  doc.rect(0, 0, 210, 36, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.text('BAITI ATELIER', 14, 15);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(203, 213, 225);
  doc.text('Magasin Général & Quincaillerie Bâtiment • Aluminium & PVC', 14, 22);
  doc.text(`Chantier : ${params.projectTitle} • ${params.wilaya || 'Alger'}`, 14, 27);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(...accentGold);
  doc.text('BON DE SORTIE QUINCAILLERIE', 122, 15);

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(226, 232, 240);
  doc.text(`Réf : ${orderRef}`, 122, 22);
  doc.text(`Date : ${dateStr}`, 122, 27);

  // 2. Chassis Context Card
  doc.setDrawColor(226, 232, 240);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, 42, 182, 18, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(...primaryBlue);
  doc.text('Caractéristiques Menuiserie à Équiper :', 18, 48);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(51, 65, 85);
  doc.text(`Dimensions : ${params.widthMm} × ${params.heightMm} mm`, 18, 55);
  doc.text(`Gamme : ${params.profileSystem || 'Gamme 45 RPT'}`, 80, 55);
  doc.text(`Finition : ${params.finishColor || 'RAL 7016'}`, 145, 55);

  // 3. KPI Summary Tiles
  const kpiY = 64;
  const tileW = 43.5;
  const tileH = 15;
  const kpis = [
    { label: 'Articles Réf.', value: `${params.items.length} références`, color: primaryBlue },
    { label: 'Quantité Pièces', value: `${totalPieces} pièces`, color: primaryBlue },
    { label: 'Valeur Matière', value: `${totalCostDzd.toLocaleString('fr-DZ')} DZD`, color: accentGold },
    { label: 'Statut Magasin', value: 'Prêt à Préparer', color: [16, 185, 129] },
  ];

  kpis.forEach((kpi, idx) => {
    const x = 14 + idx * (tileW + 2.6);
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(x, kpiY, tileW, tileH, 1.5, 1.5, 'FD');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(100, 116, 139);
    doc.text(kpi.label, x + 3, kpiY + 4.5);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(kpi.color[0], kpi.color[1], kpi.color[2]);
    doc.text(kpi.value, x + 3, kpiY + 10.5);
  });

  // 4. Hardware Table
  const tableRows = params.items.map((it, idx) => {
    return [
      `Q${idx + 1}`,
      it.referenceCode,
      it.name,
      it.stockBin || `BAC-${idx + 1}`,
      `${it.quantity} ${it.unit}`,
      `${it.unitPriceDzd.toLocaleString('fr-DZ')} DA`,
      `${it.totalPriceDzd.toLocaleString('fr-DZ')} DA`,
      it.notes || '',
      '[  ]',
    ];
  });

  autoTable(doc, {
    startY: 83,
    head: [
      [
        'N°',
        'Code Réf.',
        'Désignation Quincaillerie / Accessoire',
        'Bac/Casier',
        'Qté',
        'P.U Est.',
        'Total DZD',
        'Instructions de Pose',
        'Pointé',
      ],
    ],
    body: tableRows,
    theme: 'grid',
    headStyles: {
      fillColor: [...primaryBlue],
      textColor: [255, 255, 255],
      fontSize: 7,
      fontStyle: 'bold',
      halign: 'center',
    },
    bodyStyles: {
      fontSize: 7,
      textColor: [15, 23, 42],
      valign: 'middle',
    },
    columnStyles: {
      0: { cellWidth: 8, halign: 'center', fontStyle: 'bold' },
      1: { cellWidth: 24, fontStyle: 'bold', textColor: [0, 51, 102] },
      2: { cellWidth: 46 },
      3: { cellWidth: 16, halign: 'center' },
      4: { cellWidth: 14, halign: 'right', fontStyle: 'bold' },
      5: { cellWidth: 16, halign: 'right' },
      6: { cellWidth: 18, halign: 'right', fontStyle: 'bold' },
      7: { cellWidth: 30, fontSize: 6.5 },
      8: { cellWidth: 10, halign: 'center', fontStyle: 'bold' },
    },
  });

  // 5. Total Row & Instructions
  const tableEndY = (doc as any).lastAutoTable.finalY + 4;
  const isOverflow = tableEndY > 230;

  if (isOverflow) {
    doc.addPage();
  }

  const specBlockY = isOverflow ? 20 : tableEndY;

  doc.setDrawColor(226, 232, 240);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, specBlockY, 182, 22, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(...primaryBlue);
  doc.text("Directives d'Assemblage & Contrôle Quincaillerie :", 18, specBlockY + 5.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(71, 85, 105);
  doc.text('1. Contrôler le serrage et le sertissage des équerres d angle avant montage des vitrages.', 18, specBlockY + 10.5);
  doc.text('2. Appliquer une noisette de graisse silicone sur les axes de galets et gorges de crémone.', 18, specBlockY + 14.5);
  doc.text('3. Orienter les clapets anti-retour de drainage fentes vers le bas pour un écoulement optimal.', 18, specBlockY + 18.5);

  // 6. Signatures
  const signBlockY = specBlockY + 26;

  doc.setDrawColor(203, 213, 225);
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(14, signBlockY, 65, 22, 1.5, 1.5, 'FD');
  doc.roundedRect(131, signBlockY, 65, 22, 1.5, 1.5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(...primaryBlue);
  doc.text('Visa Magasinier / Préparateur :', 18, signBlockY + 5.5);
  doc.text('Visa Chef Atelier / Réception :', 135, signBlockY + 5.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6);
  doc.setTextColor(100, 116, 139);
  doc.text('Date & Signature :', 18, signBlockY + 16);
  doc.text('Date & Signature :', 135, signBlockY + 16);

  // QR Code Verification
  try {
    const qrPayload = `BAITI|QUINCAILLERIE|${orderRef}|DIM=${params.widthMm}x${params.heightMm}|ART=${params.items.length}|VAL=${totalCostDzd}`;
    const qrDataUrl = await QRCode.toDataURL(qrPayload, { width: 90, margin: 0 });
    doc.addImage(qrDataUrl, 'PNG', 92, signBlockY + 1, 20, 20);
  } catch {
    // QR Code fallback
  }

  // Footer
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(6.5);
  doc.setTextColor(148, 163, 184);
  doc.text(
    `Document technique atelier généré par Baiti Atelier • ${orderRef} • www.baitiatelier.dz`,
    105,
    288,
    { align: 'center' }
  );

  const safeFilename = `Bon_Sortie_Quincaillerie_${orderRef}.pdf`;
  doc.save(safeFilename);
}



