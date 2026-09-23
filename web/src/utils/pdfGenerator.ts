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
    ral_9016: 'RAL 9016 Blanc Pur Brillant',
    ral_7016: 'RAL 7016 Gris Anthracite Sablé',
    ral_9005: 'RAL 9005 Noir Mat Fine Texture',
    faux_bois: 'Faux Bois Chêne Doré',
    faux_bois_noyer: 'Faux Bois Noyer Foncé',
    bronze_ano: 'Bronze Champagne Anodisé',
    argent_ano: 'Argent Naturel Satiné',
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
    manual: 'Volet roulant manuel à sangle',
    manual_crank: 'Volet manuel à treuil & manivelle',
    motorized: 'Volet motorisé filaire (inverseur)',
    motorized_radio: 'Volet motorisé radio RTS (télécommande)',
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

export interface InstallationCheckPointItem {
  id: string;
  label: string;
  standard: string;
  verdict: 'CONFORME' | 'AVEC RESERVE' | 'NON APPLICABLE';
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
  clientSignatureDataUrl?: string;
  installerSignatureDataUrl?: string;
  paidOnSiteDzd?: number;
  checkPoints?: InstallationCheckPointItem[];
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

  const initialBalanceDue = Math.max(0, params.totalAmountDzd - params.depositDzd);
  const paidOnSite = Math.min(initialBalanceDue, Math.max(0, params.paidOnSiteDzd || 0));
  const finalBalanceDue = Math.max(0, initialBalanceDue - paidOnSite);

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
  const defaultInspectionPoints: Array<[string, string, string, string]> = [
    ['1', 'Aplomb, horizontalité et niveau des dormants', 'Tolérance conforme (≤ 2 mm par mètre courant)', 'CONFORME'],
    ['2', 'Fixations mécaniques et ancrages maçonnerie', 'Chevilles adaptées, calage d\'assise imputrescible', 'CONFORME'],
    ['3', 'Étanchéité périphérique extérieure', 'Cordon continu mastic élastomère 1ère catégorie', 'CONFORME'],
    ['4', 'Drainage et évacuation des eaux pluviales', 'Chicanes et orifices de décompression dégagés', 'CONFORME'],
    ['5', 'Fonctionnement cinématique des ouvrants', 'Coulissement fluide, compression hermétique des joints', 'CONFORME'],
    ['6', 'Aspect et intégrité des vitrages', 'Absence d\'impact, rayure ou condensation interne', 'CONFORME'],
    ['7', 'Quincaillerie, serrures et crémones', 'Verrouillage sécurisé et manœuvre sans point dur', 'CONFORME'],
    ['8', 'Nettoyage et repliement du chantier', 'Films de protection déposés, zone rendue propre', 'CONFORME'],
  ];

  const inspectionTableRows = params.checkPoints && params.checkPoints.length > 0
    ? params.checkPoints.map((cp, idx) => [
        String(idx + 1),
        cp.label,
        cp.standard,
        cp.verdict,
      ])
    : defaultInspectionPoints;

  autoTable(doc, {
    startY: 77,
    head: [['N°', 'Point de Contrôle Technique', 'Critère d\'Appréciation / Norme', 'Verdict']],
    body: inspectionTableRows,
    theme: 'grid',
    headStyles: {
      fillColor: [15, 23, 42],
      textColor: [255, 255, 255],
      fontSize: 8,
      fontStyle: 'bold',
    },
    bodyStyles: {
      fontSize: 7,
      textColor: [15, 23, 42],
      cellPadding: 1.5,
    },
    columnStyles: {
      0: { cellWidth: 8, halign: 'center', fontStyle: 'bold' },
      1: { cellWidth: 76 },
      2: { cellWidth: 70 },
      3: { cellWidth: 28, halign: 'center', fontStyle: 'bold' },
    },
    didParseCell: (data) => {
      if (data.section === 'body' && data.column.index === 3) {
        const val = String(data.cell.raw);
        if (val === 'AVEC RESERVE') {
          data.cell.styles.textColor = [180, 83, 9];
        } else if (val === 'NON APPLICABLE') {
          data.cell.styles.textColor = [100, 116, 139];
        } else {
          data.cell.styles.textColor = [4, 120, 87];
        }
      }
    },
  });

  let currentY = (doc as any).lastAutoTable.finalY + 4;

  // Optional: Reservation Details Box
  if (params.hasReservations && params.reservationNotes && params.reservationNotes.trim().length > 0) {
    doc.setDrawColor(245, 158, 11);
    doc.setFillColor(254, 243, 199);
    doc.roundedRect(14, currentY, 182, 14, 2, 2, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(180, 83, 9);
    doc.text('Réserves formulées par le Maître d\'Ouvrage (Délai de levée : 15 jours ouvrés) :', 18, currentY + 4.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(120, 53, 15);
    const splitNotes = doc.splitTextToSize(params.reservationNotes, 172);
    doc.text(splitNotes.slice(0, 2), 18, currentY + 9);

    currentY += 17;
  }

  // 4. Financial Status Box
  doc.setDrawColor(226, 232, 240);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, currentY, 182, 20, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);
  doc.text('2. Règlement Financier des Travaux :', 20, currentY + 5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text(`Montant global convenu : ${params.totalAmountDzd.toLocaleString('fr-DZ')} DZD`, 20, currentY + 11);
  doc.text(`Acomptes perçus : ${params.depositDzd.toLocaleString('fr-DZ')} DZD`, 20, currentY + 16);

  if (paidOnSite > 0) {
    doc.setTextColor(4, 120, 87);
    doc.setFont('helvetica', 'bold');
    doc.text(`Encaissé sur chantier : ${paidOnSite.toLocaleString('fr-DZ')} DZD`, 95, currentY + 11);
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(finalBalanceDue > 0 ? 180 : 4, finalBalanceDue > 0 ? 83 : 120, finalBalanceDue > 0 ? 9 : 87);
  doc.text(`Solde final restant : ${finalBalanceDue.toLocaleString('fr-DZ')} DZD`, 95, currentY + 16);

  // 5. Legal Guarantee Terms Box
  currentY += 23;
  doc.setDrawColor(226, 232, 240);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, currentY, 182, 19, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(15, 23, 42);
  doc.text('3. Régime des Garanties Légales :', 20, currentY + 5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(71, 85, 105);
  doc.text('• Garantie de parfait achèvement (1 an) couvrant toute non-conformité signalée lors de l\'exploitation.', 20, currentY + 9.5);
  doc.text('• Garantie biennale de bon fonctionnement (2 ans) sur la quincaillerie, galets, compas et accessoires.', 20, currentY + 13.5);
  doc.text('• Garantie décennale (10 ans) relative à la solidité de fixation et l\'étanchéité à l\'eau du gros œuvre.', 20, currentY + 17);

  // 6. Signatures and Stamp Block
  currentY += 22;
  const qrDataUrl = await QRCode.toDataURL(
    `https://web-two-tan-31.vercel.app/verify/pv?job=${params.jobId}&ref=${pvNumber}`,
    { width: 120, margin: 1 }
  );

  doc.setDrawColor(203, 213, 225);
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(14, currentY, 88, 30, 2, 2, 'FD');
  doc.roundedRect(108, currentY, 88, 30, 2, 2, 'FD');

  // Client Signature Box
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(15, 23, 42);
  doc.text('Le Maître d\'Ouvrage (Client) :', 20, currentY + 5.5);
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(6);
  doc.setTextColor(100, 116, 139);
  doc.text('« Lu et approuvé, bon pour réception des travaux »', 20, currentY + 9.5);
  doc.text(`Nom : ${params.clientName} • Date : ${pvDate}`, 20, currentY + 13.5);

  if (params.clientSignatureDataUrl) {
    try {
      doc.addImage(params.clientSignatureDataUrl, 'PNG', 20, currentY + 14.5, 45, 13.5);
    } catch {
      // ignore
    }
  }

  // Installer Signature Box
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(15, 23, 42);
  doc.text('Pour l\'Entreprise (Baiti Atelier) :', 114, currentY + 5.5);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6);
  doc.setTextColor(100, 116, 139);
  doc.text('Cachet de l\'Atelier & Signature du Poseur :', 114, currentY + 9.5);
  doc.text('BAITI ATELIER ALGERIE • Conforme DTU 36.5', 114, currentY + 13.5);

  if (params.installerSignatureDataUrl) {
    try {
      doc.addImage(params.installerSignatureDataUrl, 'PNG', 114, currentY + 14.5, 45, 13.5);
    } catch {
      // ignore
    }
  }

  // QR Code embedded inside stamp area
  doc.addImage(qrDataUrl, 'PNG', 170, currentY + 8, 20, 20);

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

export interface QualityCheckItemRow {
  id: string;
  labelFr: string;
  category: string;
  descriptionFr: string;
  standardToleranceFr: string;
  status: 'conforme' | 'corrige' | 'non_applicable';
}

export interface GenerateQualityControlSheetParams {
  jobId: string;
  clientName: string;
  clientPhone: string;
  wilaya: string;
  description: string;
  itemCount: number;
  dueDate: string;
  inspectorName: string;
  inspectedAt: string;
  overallNotes: string;
  items: QualityCheckItemRow[];
  scorePercentage: number;
  isApproved: boolean;
}

export async function generateQualityControlSheetPdf(
  params: GenerateQualityControlSheetParams
): Promise<void> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const primaryBlue: [number, number, number] = [0, 51, 102];
  const goldAccent: [number, number, number] = [212, 175, 55];
  const docRef = `QA-${params.jobId}`;

  // 1. Top Header Banner
  doc.setFillColor(...primaryBlue);
  doc.rect(0, 0, 210, 22, 'F');

  doc.setFillColor(...goldAccent);
  doc.rect(0, 22, 210, 1.5, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(255, 255, 255);
  doc.text('BAITI ATELIER • CONTRÔLE QUALITÉ & BON DE SORTIE ATELIER', 14, 10);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(220, 230, 242);
  doc.text('Procédure de Réception Usine & Audit Technique Menuiserie Alu / PVC', 14, 16);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(255, 255, 255);
  doc.text(`RÉF : ${docRef}`, 196, 10, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(212, 175, 55);
  doc.text(`Date contrôle : ${params.inspectedAt}`, 196, 16, { align: 'right' });

  // 2. Job Metadata Box
  doc.setDrawColor(203, 213, 225);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, 28, 182, 24, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...primaryBlue);
  doc.text('DONNÉES DU CHANTIER & DE L AFFAIRE :', 18, 34);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(51, 65, 85);
  doc.text(`Affaire : ${params.jobId} - ${params.clientName}`, 18, 40);
  doc.text(`Téléphone : ${params.clientPhone || 'Non renseigné'}`, 18, 46);

  doc.text(`Wilaya : ${params.wilaya}`, 110, 40);
  doc.text(`Volume : ${params.itemCount} châssis`, 110, 46);

  doc.text(`Date livraison prévue : ${params.dueDate}`, 155, 40);
  doc.text(`Inspecteur : ${params.inspectorName}`, 155, 46);

  // 3. Score & Approval Banner
  const statusColor: [number, number, number] = params.isApproved ? [16, 185, 129] : [245, 158, 11];
  doc.setDrawColor(...statusColor);
  doc.setFillColor(params.isApproved ? 236 : 254, params.isApproved ? 253 : 243, params.isApproved ? 245 : 199);
  doc.roundedRect(14, 55, 182, 11, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(...statusColor);
  const statusLabel = params.isApproved
    ? `AUDIT CONFORME (${params.scorePercentage}%) • AUTORISATION DE SORTIE D ATELIER ACCORDÉE`
    : `AUDIT AVEC RÉSERVES (${params.scorePercentage}%) • AJUSTEMENTS REQUIS AVANT CHARGEMENT`;
  doc.text(statusLabel, 105, 62, { align: 'center' });

  // 4. Quality Inspection Grid Table
  const tableRows = params.items.map((it, idx) => {
    let resultLabel = 'CONFORME';
    if (it.status === 'corrige') resultLabel = 'AJUSTÉ & VALIDÉ';
    if (it.status === 'non_applicable') resultLabel = 'SANS OBJET (N/A)';

    let catLabel = 'Usinage';
    if (it.category === 'etancheite_vitrage') catLabel = 'Étanchéité';
    if (it.category === 'mecanique_quincaillerie') catLabel = 'Mécanique';
    if (it.category === 'finition_emballage') catLabel = 'Finition';

    return [
      String(idx + 1),
      catLabel,
      it.labelFr,
      it.standardToleranceFr,
      resultLabel,
      it.status === 'conforme' || it.status === 'corrige' ? 'VALIDE' : 'N/A',
    ];
  });

  autoTable(doc, {
    startY: 69,
    head: [['N°', 'Discipline', 'Point de Contrôle & Spécification Métier', 'Tolérance Requise', 'Résultat Audit', 'Visa']],
    body: tableRows,
    theme: 'grid',
    styles: {
      fontSize: 7,
      cellPadding: 2,
      textColor: [30, 41, 59],
      valign: 'middle',
    },
    headStyles: {
      fillColor: primaryBlue,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 7.5,
      halign: 'center',
    },
    columnStyles: {
      0: { cellWidth: 8, halign: 'center', fontStyle: 'bold' },
      1: { cellWidth: 20, fontStyle: 'bold', textColor: [0, 51, 102] },
      2: { cellWidth: 64 },
      3: { cellWidth: 50, fontSize: 6.5 },
      4: { cellWidth: 26, halign: 'center', fontStyle: 'bold' },
      5: { cellWidth: 14, halign: 'center', fontStyle: 'bold', textColor: [16, 185, 129] },
    },
    didParseCell: (data) => {
      if (data.section === 'body' && data.column.index === 4) {
        const val = String(data.cell.raw);
        if (val.includes('CONFORME')) {
          data.cell.styles.textColor = [16, 185, 129];
        } else if (val.includes('AJUSTÉ')) {
          data.cell.styles.textColor = [217, 119, 6];
        } else {
          data.cell.styles.textColor = [148, 163, 184];
        }
      }
    },
  });

  const finalY = (doc as any).lastAutoTable.finalY + 4;
  const isOverflow = finalY > 225;

  if (isOverflow) {
    doc.addPage();
  }

  const notesY = isOverflow ? 20 : finalY;

  // 5. Overall Notes Box
  doc.setDrawColor(226, 232, 240);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, notesY, 182, 18, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(...primaryBlue);
  doc.text('OBSERVATIONS DU CHEF D ATELIER & DIRECTIVES CHANTIER :', 18, notesY + 5.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(71, 85, 105);
  const notesText = params.overallNotes || 'Tous les châssis ont fait l objet d un contrôle d équerrage et de bon fonctionnement mécanique. Prêts pour enlèvement.';
  doc.text(doc.splitTextToSize(notesText, 174), 18, notesY + 11);

  // 6. Signatures Box
  const signY = notesY + 22;

  doc.setDrawColor(203, 213, 225);
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(14, signY, 65, 24, 1.5, 1.5, 'FD');
  doc.roundedRect(131, signY, 65, 24, 1.5, 1.5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(...primaryBlue);
  doc.text('Le Responsable Qualité / Chef Atelier :', 18, signY + 5.5);
  doc.text('Le Chauffeur-Livreur / Client :', 135, signY + 5.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(100, 116, 139);
  doc.text(`Nom : ${params.inspectorName}`, 18, signY + 11);
  doc.text('Date & Signature :', 18, signY + 18);

  doc.text(`Nom : ${params.clientName}`, 135, signY + 11);
  doc.text('Date & Signature (Bon pour départ) :', 135, signY + 18);

  // 7. Dynamic QR Authentication Code
  try {
    const qrPayload = `BAITI|QA|${params.jobId}|SCORE=${params.scorePercentage}%|INSP=${params.inspectorName}|DATE=${params.inspectedAt}`;
    const qrDataUrl = await QRCode.toDataURL(qrPayload, { width: 90, margin: 0 });
    doc.addImage(qrDataUrl, 'PNG', 92, signY + 2, 20, 20);
  } catch {
    // QR Code fallback
  }

  // 8. Footer
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(6.5);
  doc.setTextColor(148, 163, 184);
  doc.text(
    `Document de conformité technique généré par Baiti Atelier • ${docRef} • www.baitiatelier.dz`,
    105,
    288,
    { align: 'center' }
  );

  const safeFilename = `Fiche_Controle_Qualite_${docRef}.pdf`;
  doc.save(safeFilename);
}

export interface StockReceivingSlipPdfItem {
  code: string;
  name: string;
  category: string;
  quantityReceived: number;
  unit: string;
  unitCostDzd: number;
  rackLocation?: string;
  conformity: 'conforme' | 'reserves';
  notes?: string;
}

export interface GenerateStockReceivingSlipParams {
  receiptNumber: string;
  supplierName: string;
  supplierDeliveryNoteRef: string;
  deliveryDate: string;
  receiverName: string;
  items: StockReceivingSlipPdfItem[];
  totalValueDzd: number;
  notes?: string;
}

export async function generateStockReceivingSlipPdf(
  params: GenerateStockReceivingSlipParams
): Promise<void> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const primaryBlue: [number, number, number] = [0, 51, 102];
  const goldAccent: [number, number, number] = [212, 175, 55];
  const docRef = params.receiptNumber;

  // 1. Top Header Banner
  doc.setFillColor(...primaryBlue);
  doc.rect(0, 0, 210, 22, 'F');

  doc.setFillColor(...goldAccent);
  doc.rect(0, 22, 210, 1.5, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(255, 255, 255);
  doc.text('BAITI ATELIER • BON DE RÉCEPTION FOURNISSEUR & ENTRÉE STOCK', 14, 10);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(220, 230, 242);
  doc.text('Procédure de Réception Magasin, Pointage des Barres & Contrôle Qualité Matière', 14, 16);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(255, 255, 255);
  doc.text(`RÉF : ${docRef}`, 196, 10, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(212, 175, 55);
  doc.text(`Date arrivage : ${params.deliveryDate}`, 196, 16, { align: 'right' });

  // 2. Metadata Box
  doc.setDrawColor(203, 213, 225);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, 28, 182, 24, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...primaryBlue);
  doc.text('ORIGINE FOURNISSEUR & DÉTAILS DE LIVRAISON :', 18, 34);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(51, 65, 85);
  doc.text(`Fournisseur : ${params.supplierName}`, 18, 40);
  doc.text(`N° Bon de Livraison (BL) : ${params.supplierDeliveryNoteRef || 'Non renseigné'}`, 18, 46);

  doc.text('Atelier réceptionnaire : Baiti Atelier Menuiserie', 110, 40);
  doc.text(`Magasinier / Chef d Atelier : ${params.receiverName}`, 110, 46);

  // 3. KPI Total Banner
  doc.setDrawColor(16, 185, 129);
  doc.setFillColor(236, 253, 245);
  doc.roundedRect(14, 55, 182, 11, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(16, 185, 129);
  const totalCount = params.items.reduce((sum, it) => sum + it.quantityReceived, 0);
  const bannerText = `ARRIVAGE POINTÉ ET CONFORME • TOTAL : ${totalCount} UNITÉS / BARRES • VALEUR : ${params.totalValueDzd.toLocaleString('fr-DZ')} DZD`;
  doc.text(bannerText, 105, 62, { align: 'center' });

  // 4. Inward Stock Table
  const tableRows = params.items.map((it, idx) => {
    const lineTotal = it.quantityReceived * it.unitCostDzd;
    const conformityLabel = it.conformity === 'conforme' ? 'CONFORME (OK)' : 'AVEC RÉSERVES';
    return [
      String(idx + 1),
      it.code,
      it.name,
      it.rackLocation || 'CASIER-A',
      `${it.quantityReceived} ${it.unit}`,
      it.unitCostDzd > 0 ? `${it.unitCostDzd.toLocaleString('fr-DZ')} DA` : '-',
      lineTotal > 0 ? `${lineTotal.toLocaleString('fr-DZ')} DA` : '-',
      conformityLabel,
    ];
  });

  autoTable(doc, {
    startY: 69,
    head: [['N°', 'Code Réf', 'Désignation Matière / Profilé', 'Emplacement', 'Qté Reçue', 'P.U. HT', 'Total HT', 'État']],
    body: tableRows,
    theme: 'grid',
    styles: {
      fontSize: 7,
      cellPadding: 2,
      textColor: [30, 41, 59],
      valign: 'middle',
    },
    headStyles: {
      fillColor: primaryBlue,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 7.5,
      halign: 'center',
    },
    columnStyles: {
      0: { cellWidth: 8, halign: 'center', fontStyle: 'bold' },
      1: { cellWidth: 26, fontStyle: 'bold', textColor: [0, 51, 102] },
      2: { cellWidth: 54 },
      3: { cellWidth: 22, halign: 'center', fontStyle: 'bold', textColor: [100, 116, 139] },
      4: { cellWidth: 18, halign: 'center', fontStyle: 'bold', textColor: [16, 185, 129] },
      5: { cellWidth: 16, halign: 'right' },
      6: { cellWidth: 18, halign: 'right', fontStyle: 'bold' },
      7: { cellWidth: 20, halign: 'center', fontSize: 6.5, fontStyle: 'bold' },
    },
    didParseCell: (data) => {
      if (data.section === 'body' && data.column.index === 7) {
        const val = String(data.cell.raw);
        if (val.includes('CONFORME')) {
          data.cell.styles.textColor = [16, 185, 129];
        } else {
          data.cell.styles.textColor = [225, 29, 72];
        }
      }
    },
  });

  const finalY = (doc as any).lastAutoTable.finalY + 4;
  const isOverflow = finalY > 225;

  if (isOverflow) {
    doc.addPage();
  }

  const notesY = isOverflow ? 20 : finalY;

  // 5. Notes & Observations
  doc.setDrawColor(226, 232, 240);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, notesY, 182, 18, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(...primaryBlue);
  doc.text('OBSERVATIONS DU MAGASINIER & RÉSERVES ÉVENTUELLES :', 18, notesY + 5.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(71, 85, 105);
  const notesText =
    params.notes ||
    'Colisage vérifié et pointé à l arrivée du camion. Barres aluminium 6m intactes sous film protecteur. Aucun défaut dimensionnel constaté.';
  doc.text(doc.splitTextToSize(notesText, 174), 18, notesY + 11);

  // 6. Signatures Box
  const signY = notesY + 22;

  doc.setDrawColor(203, 213, 225);
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(14, signY, 65, 24, 1.5, 1.5, 'FD');
  doc.roundedRect(131, signY, 65, 24, 1.5, 1.5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(...primaryBlue);
  doc.text('Le Chauffeur / Livreur Fournisseur :', 18, signY + 5.5);
  doc.text('Le Magasinier / Réceptionnaire Atelier :', 135, signY + 5.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(100, 116, 139);
  doc.text('Signature & Date (Bon pour remise) :', 18, signY + 16);
  doc.text(`Nom : ${params.receiverName}`, 135, signY + 11);
  doc.text('Cachet & Signature (Bon pour entrée) :', 135, signY + 18);

  // 7. Dynamic QR Authentication Code
  try {
    const qrPayload = `BAITI|BR|${docRef}|SUPP=${params.supplierName}|VAL=${params.totalValueDzd}|ART=${params.items.length}|DATE=${params.deliveryDate}`;
    const qrDataUrl = await QRCode.toDataURL(qrPayload, { width: 90, margin: 0 });
    doc.addImage(qrDataUrl, 'PNG', 92, signY + 2, 20, 20);
  } catch {
    // QR Code fallback
  }

  // 8. Footer
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(6.5);
  doc.setTextColor(148, 163, 184);
  doc.text(
    `Document de gestion de stock généré par Baiti Atelier • ${docRef} • www.baitiatelier.dz`,
    105,
    288,
    { align: 'center' }
  );

  const safeFilename = `Bon_Reception_Stock_${docRef}.pdf`;
  doc.save(safeFilename);
}

export interface GenerateStoreRequisitionPdfParams {
  slipNumber: string;
  date: string;
  projectTitle: string;
  clientName: string;
  sawOperator: string;
  storekeeper: string;
  totalBars6m: number;
  items: {
    code: string;
    name: string;
    quantity: number;
    rackLocation: string;
    unitCostDzd: number;
    totalCostDzd: number;
    isAvailable: boolean;
  }[];
  notes?: string;
}

export async function generateStoreRequisitionPdf(
  params: GenerateStoreRequisitionPdfParams
): Promise<void> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const primaryBlue: [number, number, number] = [0, 51, 102];
  const goldAccent: [number, number, number] = [212, 175, 55];
  const darkSlate: [number, number, number] = [15, 23, 42];

  // 1. Header Banner
  doc.setFillColor(...primaryBlue);
  doc.rect(0, 0, 210, 28, 'F');

  doc.setFillColor(...goldAccent);
  doc.rect(0, 28, 210, 1.5, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(255, 255, 255);
  doc.text('BON DE SORTIE DE STOCK & PRÉLÈVEMENT MATIÈRE', 14, 13);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(226, 232, 240);
  doc.text(
    'Alimentation du poste de coupe scie 1D • Traçabilité des barres 6.00m et casiers',
    14,
    20
  );

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...goldAccent);
  doc.text(`RÉF : ${params.slipNumber}`, 196, 13, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(255, 255, 255);
  doc.text(`Date : ${params.date}`, 196, 20, { align: 'right' });

  // 2. Project & Participants Metadata Container
  doc.setDrawColor(226, 232, 240);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, 34, 182, 22, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(...darkSlate);
  doc.text('Affaire / Projet :', 18, 41);
  doc.setFont('helvetica', 'normal');
  doc.text(params.projectTitle, 50, 41);

  doc.setFont('helvetica', 'bold');
  doc.text('Client :', 18, 48);
  doc.setFont('helvetica', 'normal');
  doc.text(params.clientName, 50, 48);

  doc.setFont('helvetica', 'bold');
  doc.text('Demandeur (Scie) :', 115, 41);
  doc.setFont('helvetica', 'normal');
  doc.text(params.sawOperator, 150, 41);

  doc.setFont('helvetica', 'bold');
  doc.text('Délivré par (Magasin) :', 115, 48);
  doc.setFont('helvetica', 'normal');
  doc.text(params.storekeeper, 150, 48);

  // 3. KPI Summary Banner
  const totalValueDzd = params.items.reduce((sum, item) => sum + item.totalCostDzd, 0);

  doc.setFillColor(241, 245, 249);
  doc.roundedRect(14, 60, 182, 14, 1.5, 1.5, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...primaryBlue);
  doc.text(
    `TOTAL BARRES 6.00M SORTIES : ${params.totalBars6m} UNITÉS`,
    20,
    69
  );

  doc.setTextColor(...darkSlate);
  doc.text(
    `VALEUR MATIÈRE : ${totalValueDzd.toLocaleString('fr-DZ')} DZD HT`,
    190,
    69,
    { align: 'right' }
  );

  // 4. AutoTable of Requisitioned Bars
  const tableRows = params.items.map((item, idx) => [
    (idx + 1).toString(),
    item.code,
    item.name,
    item.rackLocation,
    `${item.quantity} barre(s)`,
    `${item.unitCostDzd.toLocaleString('fr-DZ')} DZD`,
    `${item.totalCostDzd.toLocaleString('fr-DZ')} DZD`,
    item.isAvailable ? '[ X ] Servie' : '[ ! ] Rupture',
  ]);

  autoTable(doc, {
    startY: 78,
    head: [
      [
        'N°',
        'Code Réf',
        'Désignation Profilé (6.00m)',
        'Emplacement Casier',
        'Quantité',
        'P.U. HT',
        'Total HT',
        'État Sortie',
      ],
    ],
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
      fontSize: 7.5,
      textColor: darkSlate,
      valign: 'middle',
    },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center', fontStyle: 'bold' },
      1: { cellWidth: 26, fontStyle: 'bold' },
      2: { cellWidth: 54 },
      3: { cellWidth: 28, halign: 'center' },
      4: { cellWidth: 20, halign: 'center', fontStyle: 'bold' },
      5: { cellWidth: 20, halign: 'right' },
      6: { cellWidth: 24, halign: 'right', fontStyle: 'bold' },
      7: { cellWidth: 0, halign: 'center' },
    },
  });

  const finalY = (doc as any).lastAutoTable.finalY || 160;

  // 5. Notes Container
  const notesY = finalY + 6;
  doc.setDrawColor(226, 232, 240);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, notesY, 182, 18, 1.5, 1.5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(...darkSlate);
  doc.text('Instructions de Prélèvement & Sécurité Atelier :', 18, notesY + 5.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(100, 116, 139);
  const notesText =
    params.notes ||
    'Contrôler la planéité et l absence de rayures sur le thermolaquage avant transfert au banc de scie. Les chutes réutilisables supérieures à 800 mm générées en fin de débit devront être réétiquetées et replacées dans leur casier d origine.';
  doc.text(doc.splitTextToSize(notesText, 174), 18, notesY + 11);

  // 6. Dual Signatures Box
  const signY = notesY + 22;

  doc.setDrawColor(203, 213, 225);
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(14, signY, 65, 24, 1.5, 1.5, 'FD');
  doc.roundedRect(131, signY, 65, 24, 1.5, 1.5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(...primaryBlue);
  doc.text('Le Magasinier Atelier :', 18, signY + 5.5);
  doc.text('L Opérateur Scie / Chef d Atelier :', 135, signY + 5.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(100, 116, 139);
  doc.text(`Nom : ${params.storekeeper}`, 18, signY + 11);
  doc.text('Visa & Date (Délivré par) :', 18, signY + 18);
  doc.text(`Nom : ${params.sawOperator}`, 135, signY + 11);
  doc.text('Visa & Date (Pris en charge) :', 135, signY + 18);

  // 7. Dynamic QR Code
  try {
    const qrPayload = `BAITI|BS|${params.slipNumber}|BARRES=${params.totalBars6m}|VAL=${totalValueDzd}|DATE=${params.date}`;
    const qrDataUrl = await QRCode.toDataURL(qrPayload, { width: 90, margin: 0 });
    doc.addImage(qrDataUrl, 'PNG', 92, signY + 2, 20, 20);
  } catch {
    // Handled
  }

  // 8. Footer
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(6.5);
  doc.setTextColor(148, 163, 184);
  doc.text(
    `Document de prélèvement de matière généré par Baiti Atelier • ${params.slipNumber} • www.baitiatelier.dz`,
    105,
    288,
    { align: 'center' }
  );

  const safeFilename = `Bon_Sortie_Matiere_${params.slipNumber}.pdf`;
  doc.save(safeFilename);
}

export interface GeneratePaymentReceiptPdfParams {
  receiptNumber: string;
  date: string;
  clientName: string;
  clientPhone?: string;
  projectTitle: string;
  amountDzd: number;
  amountInWordsFr: string;
  paymentMethodFr: string;
  transactionRef: string;
  jobTotalDzd: number;
  depositTotalDzd: number;
  balanceDzd: number;
  issuerName: string;
  notes?: string;
}

export async function generatePaymentReceiptPdf(
  params: GeneratePaymentReceiptPdfParams
): Promise<void> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const primaryBlue: [number, number, number] = [0, 51, 102];
  const goldAccent: [number, number, number] = [212, 175, 55];
  const darkSlate: [number, number, number] = [15, 23, 42];

  // 1. Header Banner
  doc.setFillColor(...primaryBlue);
  doc.rect(0, 0, 210, 28, 'F');

  doc.setFillColor(...goldAccent);
  doc.rect(0, 28, 210, 1.5, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(255, 255, 255);
  doc.text('QUITTANCE OFFICIELLE DE RÈGLEMENT', 14, 13);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(226, 232, 240);
  doc.text(
    'Reçu certifié de versement d acompte • Baiti Atelier Menuiserie Aluminium & PVC',
    14,
    20
  );

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...goldAccent);
  doc.text(`RÉF : ${params.receiptNumber}`, 196, 13, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(255, 255, 255);
  doc.text(`Date : ${params.date}`, 196, 20, { align: 'right' });

  // 2. Client & Project Metadata Container
  doc.setDrawColor(226, 232, 240);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, 34, 182, 24, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(...darkSlate);
  doc.text('Client Bénéficiaire :', 18, 42);
  doc.setFont('helvetica', 'normal');
  doc.text(params.clientName, 55, 42);

  if (params.clientPhone) {
    doc.setFont('helvetica', 'bold');
    doc.text('Téléphone :', 18, 50);
    doc.setFont('helvetica', 'normal');
    doc.text(params.clientPhone, 55, 50);
  }

  doc.setFont('helvetica', 'bold');
  doc.text('Affaire / Commande :', 115, 42);
  doc.setFont('helvetica', 'normal');
  doc.text(params.projectTitle, 150, 42);

  doc.setFont('helvetica', 'bold');
  doc.text('Émetteur Quittance :', 115, 50);
  doc.setFont('helvetica', 'normal');
  doc.text(params.issuerName, 150, 50);

  // 3. Highlighted Payment Amount Box
  doc.setFillColor(241, 245, 249);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(14, 63, 182, 30, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('MONTANT NET ENCAISSÉ ET CRÉDITÉ :', 18, 71);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(...primaryBlue);
  doc.text(`+${params.amountDzd.toLocaleString('fr-DZ')} DZD`, 18, 80);

  doc.setFont('helvetica', 'italic');
  doc.setFontSize(7.5);
  doc.setTextColor(...darkSlate);
  doc.text(`Soit en toutes lettres : ${params.amountInWordsFr}`, 18, 87);

  // 4. Payment Settlement AutoTable
  const paymentRows = [
    ['Mode de Règlement', params.paymentMethodFr],
    ['Référence Transaction / N° Reçu', params.transactionRef],
    ['Date & Heure d Encaissement', params.date],
    ['Montant de la présente quittance', `${params.amountDzd.toLocaleString('fr-DZ')} DZD`],
    ['Montant total TTC de la commande', `${params.jobTotalDzd.toLocaleString('fr-DZ')} DZD`],
    ['Cumul des acomptes perçus à ce jour', `${params.depositTotalDzd.toLocaleString('fr-DZ')} DZD`],
    ['Solde restant à régler à la livraison', `${params.balanceDzd.toLocaleString('fr-DZ')} DZD`],
  ];

  autoTable(doc, {
    startY: 98,
    head: [['Désignation Comptable', 'Valeur / Référence Enregistrée']],
    body: paymentRows,
    theme: 'grid',
    headStyles: {
      fillColor: primaryBlue,
      textColor: [255, 255, 255],
      fontSize: 8,
      fontStyle: 'bold',
    },
    bodyStyles: {
      fontSize: 8,
      textColor: darkSlate,
      valign: 'middle',
    },
    columnStyles: {
      0: { cellWidth: 80, fontStyle: 'bold' },
      1: { cellWidth: 102, halign: 'right' },
    },
  });

  const finalY = (doc as any).lastAutoTable.finalY || 160;

  // 5. Legal Quittance Clause Container
  const legalY = finalY + 6;
  doc.setDrawColor(226, 232, 240);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, legalY, 182, 18, 1.5, 1.5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(...darkSlate);
  doc.text('Clause Juridique de Quittance :', 18, legalY + 5.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(100, 116, 139);
  const legalText =
    params.notes ||
    'La présente quittance atteste du paiement effectif de la somme mentionnée ci-dessus au titre d acompte sur commande. Les acomptes versés sont déduits du montant final exigible à la réception définitive et pose des ouvrages.';
  doc.text(doc.splitTextToSize(legalText, 174), 18, legalY + 11);

  // 6. Signatures Box
  const signY = legalY + 22;

  doc.setDrawColor(203, 213, 225);
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(14, signY, 65, 24, 1.5, 1.5, 'FD');
  doc.roundedRect(131, signY, 65, 24, 1.5, 1.5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(...primaryBlue);
  doc.text('Pour le Client (Soussigné) :', 18, signY + 5.5);
  doc.text('Pour l Entreprise / Baiti Atelier :', 135, signY + 5.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(100, 116, 139);
  doc.text(`Nom : ${params.clientName}`, 18, signY + 11);
  doc.text('Émargement & Mention "Bon pour versement" :', 18, signY + 18);
  doc.text(`Responsable : ${params.issuerName}`, 135, signY + 11);
  doc.text('Cachet commercial & Signature certifiée :', 135, signY + 18);

  // 7. Dynamic QR Code
  try {
    const qrPayload = `BAITI|REC|${params.receiptNumber}|MONTANT=${params.amountDzd}|CLIENT=${params.clientName}|TX=${params.transactionRef}|DATE=${params.date}`;
    const qrDataUrl = await QRCode.toDataURL(qrPayload, { width: 90, margin: 0 });
    doc.addImage(qrDataUrl, 'PNG', 92, signY + 2, 20, 20);
  } catch {
    // Handled
  }

  // 8. Footer
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(6.5);
  doc.setTextColor(148, 163, 184);
  doc.text(
    `Quittance de paiement certifiée par Baiti Atelier • ${params.receiptNumber} • www.baitiatelier.dz`,
    105,
    288,
    { align: 'center' }
  );

  const safeFilename = `Quittance_Versement_${params.receiptNumber}.pdf`;
  doc.save(safeFilename);
}

export interface SiteDeliveryManifestPdfParams {
  manifestId: string;
  jobId: string;
  clientName: string;
  clientPhone: string;
  deliverySiteAddress: string;
  wilayaName: string;
  vehicleTypeFr: string;
  vehiclePlate: string;
  driverName: string;
  driverPhone: string;
  departureDate: string;
  departureTime: string;
  totalPackagesCount: number;
  totalWeightKg: number;
  packages: {
    packageNumber: number;
    labelFr: string;
    categoryFr: string;
    contentsDescription: string;
    itemCount: number;
    weightEstimatedKg: number;
    dimensionsEstimated: string;
    isFragileGlass: boolean;
    conditionFr: string;
  }[];
  generalNotes?: string;
}

/**
 * Generates an official A4 Site Delivery Manifest and Packaging Slip (Bordereau de Livraison par Chantier)
 */
export async function generateSiteDeliveryManifestPdf(params: SiteDeliveryManifestPdfParams): Promise<void> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const primaryBlue: [number, number, number] = [0, 51, 102];
  const goldAccent: [number, number, number] = [212, 175, 55];
  const darkSlate: [number, number, number] = [15, 23, 42];

  // 1. Top Decorative Bar
  doc.setFillColor(...primaryBlue);
  doc.rect(0, 0, 210, 5, 'F');
  doc.setFillColor(...goldAccent);
  doc.rect(0, 5, 210, 1.5, 'F');

  // 2. Company Brand & Document Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.setTextColor(...primaryBlue);
  doc.text('BAITI ATELIER ALGERIE', 14, 16);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('Menuiserie Aluminium & PVC • Logistique & Expédition Chantier', 14, 21);

  // Document Badge
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(120, 10, 76, 15, 2, 2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...primaryBlue);
  doc.text('BORDEREAU DE LIVRAISON', 123, 16);
  doc.setFontSize(7.5);
  doc.setTextColor(...goldAccent);
  doc.text(`Réf : ${params.manifestId}`, 123, 22);

  // 3. Side-by-side Info Cards
  const cardY = 28;
  const cardH = 29;

  // Left Card: Chantier & Destinataire
  doc.setDrawColor(226, 232, 240);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, cardY, 88, cardH, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...primaryBlue);
  doc.text('CHANTIER & DESTINATAIRE', 18, cardY + 5.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(...darkSlate);
  doc.text(`Client : ${params.clientName}`, 18, cardY + 11);
  doc.text(`Téléphone : ${params.clientPhone || 'Non renseigné'}`, 18, cardY + 16);
  doc.text(`Adresse : ${params.deliverySiteAddress}`, 18, cardY + 21);
  doc.text(`Wilaya : ${params.wilayaName} • Affaire : ${params.jobId}`, 18, cardY + 26);

  // Right Card: Véhicule & Transport
  doc.roundedRect(108, cardY, 88, cardH, 2, 2, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...primaryBlue);
  doc.text('ACHEMINEMENT & TRANSPORTEUR', 112, cardY + 5.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(...darkSlate);
  doc.text(`Véhicule : ${params.vehicleTypeFr} [${params.vehiclePlate}]`, 112, cardY + 11);
  doc.text(`Chauffeur : ${params.driverName}`, 112, cardY + 16);
  doc.text(`Contact Livreur : ${params.driverPhone}`, 112, cardY + 21);
  doc.text(`Date & Heure : ${params.departureDate} à ${params.departureTime}`, 112, cardY + 26);

  // 4. Packaging Table (autoTable)
  const tableData = params.packages.map((pkg) => [
    `Colis #${pkg.packageNumber}`,
    `${pkg.labelFr}\n${pkg.contentsDescription}${pkg.isFragileGlass ? ' [VITRAGE FRAGILE]' : ''}`,
    pkg.categoryFr,
    `${pkg.itemCount} u\n${pkg.dimensionsEstimated}`,
    `~${pkg.weightEstimatedKg} kg`,
    '[  ] Conforme\n[  ] Réserve',
  ]);

  autoTable(doc, {
    startY: cardY + cardH + 4,
    margin: { left: 14, right: 14 },
    head: [['N°', 'Désignation & Contenu du Colis', 'Catégorie', 'Qté / Dim.', 'Poids Est.', 'Pointage Chantier']],
    body: tableData,
    theme: 'grid',
    styles: {
      font: 'helvetica',
      fontSize: 7.5,
      cellPadding: 2.2,
      overflow: 'linebreak',
    },
    headStyles: {
      fillColor: primaryBlue,
      textColor: [255, 255, 255],
      fontSize: 7.5,
      fontStyle: 'bold',
      halign: 'center',
    },
    bodyStyles: {
      fontSize: 7.5,
      textColor: darkSlate,
      valign: 'middle',
    },
    columnStyles: {
      0: { cellWidth: 18, halign: 'center', fontStyle: 'bold' },
      1: { cellWidth: 70 },
      2: { cellWidth: 32 },
      3: { cellWidth: 26, halign: 'center' },
      4: { cellWidth: 16, halign: 'center' },
      5: { cellWidth: 20, halign: 'center', fontSize: 6.5 },
    },
  });

  const finalY = (doc as any).lastAutoTable.finalY || 180;

  // 5. Total Summary Bar
  const sumY = finalY + 4;
  doc.setDrawColor(226, 232, 240);
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(14, sumY, 182, 8, 1.5, 1.5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...primaryBlue);
  doc.text(
    `TOTAL COLISAGE : ${params.totalPackagesCount} Colis expédiés • Poids cumulé approximatif : ~${params.totalWeightKg} kg`,
    18,
    sumY + 5.5
  );

  // 6. Site Storage & Legal Responsibility Clause
  const legalY = sumY + 11;
  doc.setDrawColor(226, 232, 240);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, legalY, 182, 17, 1.5, 1.5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(...primaryBlue);
  doc.text('Clause de Décharge et Transfert de Garde sur Chantier :', 18, legalY + 5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(100, 116, 139);
  const clauseText =
    params.generalNotes ||
    'La signature du présent bordereau atteste du contrôle contradictoire du nombre de colis et de l intégrité visuelle des profilés et vitrages. Le stockage sur chantier incombe au destinataire : les cadres et vitrages doivent être stockés sur cales bois, à l abri des intempéries, des poussières de ciment et des chocs.';
  doc.text(doc.splitTextToSize(clauseText, 174), 18, legalY + 10);

  // 7. Signature Blocks & QR Code
  const signY = legalY + 21;

  doc.setDrawColor(203, 213, 225);
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(14, signY, 65, 24, 1.5, 1.5, 'FD');
  doc.roundedRect(131, signY, 65, 24, 1.5, 1.5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(...primaryBlue);
  doc.text('Pour l Expéditeur (Chauffeur / Atelier) :', 18, signY + 5.5);
  doc.text('Pour le Réceptionnaire (Chantier) :', 135, signY + 5.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(100, 116, 139);
  doc.text(`Livreur : ${params.driverName}`, 18, signY + 11);
  doc.text('Signature & Date de remise :', 18, signY + 18);
  doc.text(`Nom client : ${params.clientName}`, 135, signY + 11);
  doc.text('Mention "Reçu conforme sans réserve" & Signature :', 135, signY + 18);

  // QR Code
  try {
    const qrPayload = `BAITI|DELIVERY|${params.manifestId}|JOB=${params.jobId}|COLIS=${params.totalPackagesCount}|POIDS=${params.totalWeightKg}KG|DATE=${params.departureDate}`;
    const qrDataUrl = await QRCode.toDataURL(qrPayload, { width: 90, margin: 0 });
    doc.addImage(qrDataUrl, 'PNG', 92, signY + 2, 20, 20);
  } catch {
    // Handled
  }

  // 8. Footer
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(6.5);
  doc.setTextColor(148, 163, 184);
  doc.text(
    `Bordereau officiel d expédition émis par Baiti Atelier Menuiserie • ${params.manifestId} • www.baitiatelier.dz`,
    105,
    288,
    { align: 'center' }
  );

  const safeFilename = `Bordereau_Livraison_${params.manifestId}.pdf`;
  doc.save(safeFilename);
}

export interface ThermalStressPdfParams {
  documentId: string;
  projectOrClientName: string;
  locationWilaya: string;
  windowReference: string;
  glassLabelFr: string;
  widthMm: number;
  heightMm: number;
  result: import('./glazingThermalStressManager').ThermalStressResult;
  workshopName?: string;
  workshopPhone?: string;
  workshopAddress?: string;
}

/**
 * Generates an official A4 technical compliance notice for glazing thermal stress.
 * References: NF DTU 39 P3 / CSTB Cahier 3488 / DTR C3-2.
 */
export async function generateThermalStressNoticePdf(params: ThermalStressPdfParams): Promise<void> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const primaryBlue: [number, number, number] = [15, 23, 42]; // slate-900
  const emeraldGreen: [number, number, number] = [16, 185, 129];
  const roseRed: [number, number, number] = [239, 68, 68];
  const isCompliant = params.result.isCompliant;
  const statusColor = isCompliant ? emeraldGreen : roseRed;

  // 1. Header Banner
  doc.setFillColor(...primaryBlue);
  doc.rect(0, 0, 210, 28, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(255, 255, 255);
  doc.text(params.workshopName || 'BAITI ATELIER ALGERIE', 14, 11);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text('Calcul & Verification au Choc Thermique des Vitrages • NF DTU 39 P3 / CSTB 3488', 14, 17);
  doc.text('Reglementation Thermique Algerienne CNERIB DTR C3-2 / C3-4', 14, 22);

  // Document Badge
  doc.setFillColor(30, 41, 59);
  doc.roundedRect(145, 6, 51, 16, 1.5, 1.5, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.text(`AUDIT : ${params.documentId}`, 148, 12);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(203, 213, 225);
  doc.text(`Date : ${new Date().toLocaleDateString('fr-FR')}`, 148, 18);

  // 2. Project & Window Identification Box
  const infoY = 33;
  doc.setDrawColor(226, 232, 240);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, infoY, 182, 22, 1.5, 1.5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...primaryBlue);
  doc.text('Client / Chantier :', 18, infoY + 6);
  doc.text('Wilaya d implantation :', 18, infoY + 12);
  doc.text('Zone Climatique DTR :', 18, infoY + 18);

  doc.setFont('helvetica', 'normal');
  doc.text(params.projectOrClientName || 'Client Particulier', 55, infoY + 6);
  doc.text(params.locationWilaya, 55, infoY + 12);
  doc.text(`${params.result.climaticZoneData.nameFr} (${params.result.climaticZoneData.code})`, 55, infoY + 18);

  doc.setFont('helvetica', 'bold');
  doc.text('Repere Menuiserie :', 115, infoY + 6);
  doc.text('Type de Vitrage :', 115, infoY + 12);
  doc.text('Dimensions Baie :', 115, infoY + 18);

  doc.setFont('helvetica', 'normal');
  doc.text(params.windowReference, 150, infoY + 6);
  doc.text(params.glassLabelFr, 150, infoY + 12);
  doc.text(`${params.widthMm} x ${params.heightMm} mm`, 150, infoY + 18);

  // 3. Environmental & Shading Conditions Table
  const condTableY = infoY + 26;
  autoTable(doc, {
    startY: condTableY,
    margin: { left: 14, right: 14 },
    head: [['Parametre d Exposition', 'Valeur Retenue', 'Incidence sur la Contrainte Thermique']],
    body: [
      ['Orientation Facade', params.result.orientationData.labelFr, params.result.orientationData.subFr],
      ['Ombrage Exterieur', params.result.shadingData.labelFr, params.result.shadingData.subFr],
      ['Confinement Interieur', params.result.interiorObstructionData.labelFr, params.result.interiorObstructionData.subFr],
      ['Profil Menuiserie', params.result.frameProfileData.labelFr, params.result.frameProfileData.subFr],
      ['Faconnage des Aretes', params.result.edgeFinishingData.labelFr, params.result.edgeFinishingData.subFr],
      ['Traitement du Verre', params.result.thermalTreatmentData.labelFr, params.result.thermalTreatmentData.tradeUsageFr],
    ],
    theme: 'grid',
    styles: { fontSize: 7, cellPadding: 2, textColor: [30, 41, 59] },
    headStyles: { fillColor: primaryBlue, textColor: 255, fontStyle: 'bold', fontSize: 7.5 },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 42 },
      1: { cellWidth: 55 },
      2: { cellWidth: 85 },
    },
  });

  // 4. Thermal Calculation & Stress Gradient Table
  const calcTableY = (doc as any).lastAutoTable.finalY + 4;
  autoTable(doc, {
    startY: calcTableY,
    margin: { left: 14, right: 14 },
    head: [['Grandeur Physique Calculee', 'Valeur Numerique', 'Reference Normative DTU 39 / CSTB 3488']],
    body: [
      ['Rayonnement Solaire Nominal', `${params.result.solarIrradianceNominal} W/m2`, 'Flux maximal d ete selon zone DTR'],
      ['Rayonnement Solaire Effectif', `${params.result.solarIrradianceEffective} W/m2`, 'Apres ponderation d orientation facade'],
      ['Absorption Energetique Vitrage', `${Math.round(params.result.glassProperties.solarAbsorption * 100)} %`, 'Coefficient alpha d absorption de la couche'],
      ['Temperature Estimee Centre Vitrage', `${params.result.estimatedCenterTempC} deg C`, 'Zone ensoleillee au centre du panneau'],
      ['Temperature Estimee Bord Feuillure', `${params.result.estimatedEdgeTempC} deg C`, 'Bord ombrage sous parclose et profil'],
      ['Gradient Thermique Reel (Delta T)', `${params.result.deltaTActualK} K (deg C)`, 'Ecart de temperature maximal centre/bord'],
      ['Seuil Critique Admissible (Delta T crit)', `${params.result.deltaTCritK} K (deg C)`, 'Limite elastique avant amorce de fissure'],
      ['Ratio de Securite (R = Delta T / Delta T crit)', `${params.result.safetyRatio}`, 'Seuil reglementaire maximal autorise = 1.00'],
    ],
    theme: 'grid',
    styles: { fontSize: 7, cellPadding: 2, textColor: [30, 41, 59] },
    headStyles: { fillColor: [51, 65, 85], textColor: 255, fontStyle: 'bold', fontSize: 7.5 },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 65 },
      1: { cellWidth: 35, fontStyle: 'bold' },
      2: { cellWidth: 82 },
    },
  });

  // 5. Verdict and Recommendation Banner
  const verdictY = (doc as any).lastAutoTable.finalY + 5;
  doc.setDrawColor(...statusColor);
  doc.setFillColor(isCompliant ? 240 : 254, isCompliant ? 253 : 242, isCompliant ? 244 : 242);
  doc.roundedRect(14, verdictY, 182, 24, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...statusColor);
  const verdictTitle = isCompliant
    ? 'CONFORME : RISQUE DE CASSE THERMIQUE MAITRISE'
    : 'NON CONFORME : DANGER DE CASSE THERMIQUE CRITIQUE';
  doc.text(verdictTitle, 20, verdictY + 7);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(30, 41, 59);
  const recLine1 = params.result.temperingMandatory
    ? 'Preconisation Imperative : TREMPE THERMIQUE SECURIT (ESG / EN 12150) OBLIGATOIRE.'
    : 'Preconisation Technique : Verre recuit ordinaire admissible sous reserve d aretes abattues soignees.';
  doc.text(recLine1, 20, verdictY + 13);

  const recLine2 = `Finition des aretes requise : ${params.result.recommendedEdge === 'polished_jpp' ? 'Joint Plat Poli (JPP) pour eliminer les amorces de rupture' : 'Aretes abattues soignees a la meule'}.`;
  doc.text(recLine2, 20, verdictY + 18);

  // 6. Workshop Technical Advice & Crack Morphology Guide
  const adviceY = verdictY + 27;
  doc.setDrawColor(226, 232, 240);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, adviceY, 182, 28, 1.5, 1.5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(...primaryBlue);
  doc.text('Prescriptions de Pose et Preventions Atelier (DTU 39) :', 18, adviceY + 5.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(71, 85, 105);
  let curAdvY = adviceY + 10;
  for (const adv of params.result.workshopRecommendationsFr.slice(0, 3)) {
    doc.text(`• ${adv}`, 18, curAdvY);
    curAdvY += 4.5;
  }
  doc.text(`• Diagnostic casse : ${params.result.crackTypeDescriptionFr}`, 18, curAdvY, {
    maxWidth: 174,
  });

  // 7. Signature Blocks & QR Code
  const signY = adviceY + 31;
  doc.setDrawColor(203, 213, 225);
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(14, signY, 65, 22, 1.5, 1.5, 'FD');
  doc.roundedRect(131, signY, 65, 22, 1.5, 1.5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(...primaryBlue);
  doc.text('Pour Baiti Atelier (Controle Qualite) :', 18, signY + 5.5);
  doc.text('Visa Client / Bureau d Etudes :', 135, signY + 5.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(100, 116, 139);
  doc.text('Ingenieur menuiserie & vitrage', 18, signY + 11);
  doc.text('Signature & Tampon :', 18, signY + 17);
  doc.text('Bon pour accord specifications vitrage', 135, signY + 11);
  doc.text('Signature & Date :', 135, signY + 17);

  // QR Code
  try {
    const qrPayload = `BAITI|THERMAL_STRESS|${params.documentId}|REF=${params.windowReference}|GLASS=${params.glassLabelFr}|ZONE=${params.result.climaticZoneData.code}|RATIO=${params.result.safetyRatio}|STATUS=${isCompliant ? 'OK' : 'RISK'}`;
    const qrDataUrl = await QRCode.toDataURL(qrPayload, { width: 90, margin: 0 });
    doc.addImage(qrDataUrl, 'PNG', 92, signY + 1, 20, 20);
  } catch {
    // Handled
  }

  // 8. Footer
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(6.5);
  doc.setTextColor(148, 163, 184);
  doc.text(
    `Document technique officiel Baiti Atelier • ${params.documentId} • NF DTU 39 P3 • CSTB Cahier 3488 • CNERIB DTR C3-2`,
    105,
    289,
    { align: 'center' }
  );

  const safeFilename = `Controle_Choc_Thermique_${params.documentId}.pdf`;
  doc.save(safeFilename);
}

export interface FastenerPdfParams {
  documentId: string;
  projectOrClientName: string;
  locationWilaya: string;
  windowReference: string;
  widthMm: number;
  heightMm: number;
  result: import('./fastenerSafetyManager').FastenerSafetyResult;
  workshopName?: string;
}

/**
 * Generates an official A4 technical calculation note for window fasteners and wind load pullout safety.
 * References: NF DTU 36.5 / Eurocode 9 / DTR BC 2-47.
 */
export async function generateFastenerCalculationPdf(params: FastenerPdfParams): Promise<void> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const primaryBlue: [number, number, number] = [15, 23, 42]; // slate-900
  const emeraldGreen: [number, number, number] = [16, 185, 129];
  const roseRed: [number, number, number] = [239, 68, 68];
  const isSafe = params.result.isPulloutSafe;
  const statusColor = isSafe ? emeraldGreen : roseRed;

  // 1. Header Banner
  doc.setFillColor(...primaryBlue);
  doc.rect(0, 0, 210, 28, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(255, 255, 255);
  doc.text(params.workshopName || 'BAITI ATELIER ALGERIE', 14, 11);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text('Note de Calcul Fixations & Resistance a l Arrachement au Vent • NF DTU 36.5', 14, 17);
  doc.text('Actions du Vent sur les Parois selon DTR BC 2-47 (RNV 1999/2013) & Eurocode 9', 14, 22);

  // Document Badge
  doc.setFillColor(30, 41, 59);
  doc.roundedRect(145, 6, 51, 16, 1.5, 1.5, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.text(`NOTE : ${params.documentId}`, 148, 12);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(203, 213, 225);
  doc.text(`Date : ${new Date().toLocaleDateString('fr-FR')}`, 148, 18);

  // 2. Identification Block
  const infoY = 33;
  doc.setDrawColor(226, 232, 240);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, infoY, 182, 22, 1.5, 1.5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...primaryBlue);
  doc.text('Projet / Chantier :', 18, infoY + 6);
  doc.text('Wilaya d implantation :', 18, infoY + 12);
  doc.text('Support Maconnerie :', 18, infoY + 18);

  doc.setFont('helvetica', 'normal');
  doc.text(params.projectOrClientName || 'Chantier Client', 55, infoY + 6);
  doc.text(params.locationWilaya, 55, infoY + 12);
  doc.text(params.result.substrateData.labelFr, 55, infoY + 18);

  doc.setFont('helvetica', 'bold');
  doc.text('Repere Ouvrage :', 115, infoY + 6);
  doc.text('Dimensions Baie :', 115, infoY + 12);
  doc.text('Modele Fixation :', 115, infoY + 18);

  doc.setFont('helvetica', 'normal');
  doc.text(params.windowReference, 145, infoY + 6);
  doc.text(`${params.widthMm} x ${params.heightMm} mm (${params.result.windowAreaM2} m2)`, 145, infoY + 12);
  doc.text(params.result.fastenerData.labelFr, 145, infoY + 18);

  // 3. Wind Load & Aerodynamic Actions Table
  const windTableY = infoY + 26;
  autoTable(doc, {
    startY: windTableY,
    margin: { left: 14, right: 14 },
    head: [['Parametre Eolien & Exposition', 'Valeur Calculee', 'Norme DTR BC 2-47 (RNV 1999/2013)']],
    body: [
      ['Zone de Vent RNV', params.result.windZoneData.nameFr, `Vitesse de reference v = ${params.result.windZoneData.referenceVelocityKmPerH} km/h`],
      ['Pression de Base (qref)', `${params.result.windZoneData.referencePressureNPerM2} N/m2`, 'Pression dynamique de reference normale'],
      ['Rugosite & Categorie Terrain', params.result.terrainData.labelFr, params.result.terrainData.subFr],
      ['Hauteur au-dessus du sol (z)', `${params.result.buildingHeightM} m`, 'Coefficient d exposition Ce(z)'],
      ['Pression Dynamique de Succion (qdyn)', `${params.result.dynamicPressureNPerM2} N/m2`, 'Coefficient net Cnet = 1.35 sous le vent'],
      ['Charge Totale du Vent sur la Baie', `${params.result.totalWindLoadDaN} daN (~${params.result.totalWindLoadDaN * 10} kgf)`, 'Effort d arrachement perpendiculaire a la baie'],
    ],
    theme: 'grid',
    styles: { fontSize: 7, cellPadding: 2, textColor: [30, 41, 59] },
    headStyles: { fillColor: primaryBlue, textColor: 255, fontStyle: 'bold', fontSize: 7.5 },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 55 },
      1: { cellWidth: 50, fontStyle: 'bold' },
      2: { cellWidth: 77 },
    },
  });

  // 4. Fastener Layout & Pitch Table (DTU 36.5)
  const pitchTableY = (doc as any).lastAutoTable.finalY + 4;
  autoTable(doc, {
    startY: pitchTableY,
    margin: { left: 14, right: 14 },
    head: [['Localisation sur le Cadre Dormant', 'Nombre de Fixations', 'Espacement & Regles NF DTU 36.5']],
    body: [
      ['Montant Gauche', `${params.result.pitchResult.uprightsCountPerSide} points`, `Espacement ~${params.result.pitchResult.spacingMontantsMm} mm (max autorise 800 mm)`],
      ['Montant Droit', `${params.result.pitchResult.uprightsCountPerSide} points`, `Espacement ~${params.result.pitchResult.spacingMontantsMm} mm (depart a 120 mm des angles)`],
      ['Traverse Haute (Linteau)', `${params.result.pitchResult.transomHeadCount} points`, `Espacement ~${params.result.pitchResult.spacingTraversesMm} mm`],
      ['Traverse Basse (Seuil/Rejingot)', `${params.result.pitchResult.transomSillCount} points`, 'Etancheite sous tete par rondelle EPDM ou silicone neutre'],
      ['TOTAL FIXATIONS DU CHASSIS', `${params.result.pitchResult.totalFastenersCount} POINTS D ANCRAGE`, 'Repartition conforme au perimetre de la baie'],
    ],
    theme: 'grid',
    styles: { fontSize: 7, cellPadding: 2, textColor: [30, 41, 59] },
    headStyles: { fillColor: [51, 65, 85], textColor: 255, fontStyle: 'bold', fontSize: 7.5 },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 55 },
      1: { cellWidth: 40, fontStyle: 'bold' },
      2: { cellWidth: 87 },
    },
  });

  // 5. Verification & Safety Margin Table
  const verifTableY = (doc as any).lastAutoTable.finalY + 4;
  autoTable(doc, {
    startY: verifTableY,
    margin: { left: 14, right: 14 },
    head: [['Grandeur Mecanique d Ancrage', 'Valeur', 'Condition de Securite Eurocode 9 / DTU 36.5']],
    body: [
      ['Effort d Arrachement par Cheville (Traction)', `${params.result.windPulloutForcePerFastenerDaN} daN`, 'Effort de pointe majore aux angles (+15%)'],
      ['Resistance Admissible du Support (Traction)', `${params.result.substrateData.pulloutAdmissibleDaN} daN`, 'Capacite utile admissible dans la maconnerie'],
      ['Facteur de Securite a l Arrachement (Sf)', `${params.result.pulloutSafetyFactor}`, 'Seuil reglementaire minimum : Sf >= 1.50'],
      ['Effort de Cisaillement par Cheville (Poids)', `${params.result.deadLoadShearForcePerFastenerDaN} daN`, 'Transmis aux fixations et cales d assise'],
      ['Facteur de Securite au Cisaillement', `${params.result.shearSafetyFactor}`, 'Seuil reglementaire minimum : Sf >= 1.50'],
    ],
    theme: 'grid',
    styles: { fontSize: 7, cellPadding: 2, textColor: [30, 41, 59] },
    headStyles: { fillColor: [71, 85, 105], textColor: 255, fontStyle: 'bold', fontSize: 7.5 },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 65 },
      1: { cellWidth: 35, fontStyle: 'bold' },
      2: { cellWidth: 82 },
    },
  });

  // 6. Verdict Banner
  const verdictY = (doc as any).lastAutoTable.finalY + 5;
  doc.setDrawColor(...statusColor);
  doc.setFillColor(isSafe ? 240 : 254, isSafe ? 253 : 242, isSafe ? 244 : 242);
  doc.roundedRect(14, verdictY, 182, 22, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...statusColor);
  const verdictTitle = isSafe
    ? 'ANCRAGE VALIDE : RESISTANCE A L ARRACHEMENT CONFORME'
    : 'DANGER ARRACHEMENT : RESISTANCE INSUFFISANTE AU VENT';
  doc.text(verdictTitle, 20, verdictY + 7);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(30, 41, 59);
  doc.text(
    `Profondeur de percage preconisee : ${params.result.recommendedMinimumDrillDepthMm} mm • Distance min a l arete : ${params.result.recommendedEdgeDistanceMm} mm`,
    20,
    verdictY + 13
  );
  doc.text(
    `Mode de percage obligatoire : ${params.result.substrateData.drillingTechniqueFr}.`,
    20,
    verdictY + 18
  );

  // 7. Site Installation Directives
  const directY = verdictY + 25;
  doc.setDrawColor(226, 232, 240);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, directY, 182, 25, 1.5, 1.5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(...primaryBlue);
  doc.text('Prescriptions de Pose et Calage sur Chantier (NF DTU 36.5) :', 18, directY + 5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(71, 85, 105);
  let curDirY = directY + 9.5;
  for (const dir of params.result.masonryShimmingAdviceFr.slice(0, 3)) {
    doc.text(`• ${dir}`, 18, curDirY);
    curDirY += 4.5;
  }

  // 8. Signatures Block & QR Code
  const signY = directY + 28;
  doc.setDrawColor(203, 213, 225);
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(14, signY, 65, 22, 1.5, 1.5, 'FD');
  doc.roundedRect(131, signY, 65, 22, 1.5, 1.5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(...primaryBlue);
  doc.text('Pour l Entreprise de Pose / Atelier :', 18, signY + 5.5);
  doc.text('Controleur Technique / Bureau d Etudes :', 135, signY + 5.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(100, 116, 139);
  doc.text('Visa Poseur Qualifie DTU 36.5', 18, signY + 11);
  doc.text('Signature & Date :', 18, signY + 17);
  doc.text('Bon pour execution fixations gros oeuvre', 135, signY + 11);
  doc.text('Signature & Date :', 135, signY + 17);

  // QR Code
  try {
    const qrPayload = `BAITI|FASTENERS|${params.documentId}|REF=${params.windowReference}|PULLOUT=${params.result.windPulloutForcePerFastenerDaN}daN|SF=${params.result.pulloutSafetyFactor}|PTS=${params.result.pitchResult.totalFastenersCount}|STATUS=${isSafe ? 'OK' : 'RISK'}`;
    const qrDataUrl = await QRCode.toDataURL(qrPayload, { width: 90, margin: 0 });
    doc.addImage(qrDataUrl, 'PNG', 92, signY + 1, 20, 20);
  } catch {
    // Handled
  }

  // 9. Footer
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(6.5);
  doc.setTextColor(148, 163, 184);
  doc.text(
    `Note technique officielle Baiti Atelier • ${params.documentId} • NF DTU 36.5 • Eurocode 9 • CNERIB DTR BC 2-47`,
    105,
    289,
    { align: 'center' }
  );

  const safeFilename = `Note_Calcul_Fixations_${params.documentId}.pdf`;
  doc.save(safeFilename);
}

export interface ShutterWindingPdfParams {
  documentId: string;
  projectOrClientName: string;
  locationWilaya: string;
  windowReference: string;
  slatLabelFr: string;
  boxLabelFr: string;
  result: import('./rollerShutterWindingManager').WindingCalculationResult;
  workshopName?: string;
}

/**
 * Generates an official A4 technical calculation sheet for roller shutter winding diameter and box clearance.
 */
export async function generateRollerShutterWindingPdf(params: ShutterWindingPdfParams): Promise<void> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const primaryBlue: [number, number, number] = [15, 23, 42]; // slate-900
  const emeraldGreen: [number, number, number] = [16, 185, 129];
  const roseRed: [number, number, number] = [239, 68, 68];
  const isOk = params.result.clearanceStatus !== 'oversized_block';
  const statusColor = isOk ? emeraldGreen : roseRed;

  // 1. Header Banner
  doc.setFillColor(...primaryBlue);
  doc.rect(0, 0, 210, 28, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(255, 255, 255);
  doc.text(params.workshopName || 'BAITI ATELIER ALGERIE', 14, 11);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text('Calcul d Enroulement & Dimensionnement Caisson Volet Roulant', 14, 17);
  doc.text('Garde au Caisson, Spirale d Enroulement & Couple Moteur Tubulaire', 14, 22);

  // Document Badge
  doc.setFillColor(30, 41, 59);
  doc.roundedRect(145, 6, 51, 16, 1.5, 1.5, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.text(`VOLET : ${params.documentId}`, 148, 12);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(203, 213, 225);
  doc.text(`Date : ${new Date().toLocaleDateString('fr-FR')}`, 148, 18);

  // 2. Identification Block
  const infoY = 33;
  doc.setDrawColor(226, 232, 240);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, infoY, 182, 22, 1.5, 1.5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...primaryBlue);
  doc.text('Client / Chantier :', 18, infoY + 6);
  doc.text('Wilaya de pose :', 18, infoY + 12);
  doc.text('Repere Ouvrage :', 18, infoY + 18);

  doc.setFont('helvetica', 'normal');
  doc.text(params.projectOrClientName || 'Chantier Client', 55, infoY + 6);
  doc.text(params.locationWilaya, 55, infoY + 12);
  doc.text(params.windowReference, 55, infoY + 18);

  doc.setFont('helvetica', 'bold');
  doc.text('Dimensions Baie :', 115, infoY + 6);
  doc.text('Modele de Lame :', 115, infoY + 12);
  doc.text('Modele Caisson :', 115, infoY + 18);

  doc.setFont('helvetica', 'normal');
  doc.text(`${params.result.apronWidthMm} x ${params.result.apronHeightMm} mm`, 145, infoY + 6);
  doc.text(params.slatLabelFr, 145, infoY + 12);
  doc.text(params.boxLabelFr, 145, infoY + 18);

  // 3. Winding Geometry & Clearance Table
  const windTableY = infoY + 26;
  autoTable(doc, {
    startY: windTableY,
    margin: { left: 14, right: 14 },
    head: [['Parametre d Enroulement Tablier', 'Valeur Calculee', 'Tolerance & Observations Atelier']],
    body: [
      ['Diametre Exterieur Enroule (D)', `${params.result.woundRollDiameterMm} mm`, 'Diametre maximal tablier totalement releve'],
      ['Diametre Utile Interieur Caisson', `${params.result.selectedBoxData.maxUsefulWindingDiameterMm} mm`, `Espace net sous ${params.result.selectedBoxData.labelFr}`],
      ['Garde Radiale au Caisson (Jeu)', `${params.result.radialClearanceMm} mm`, 'Jeu peripherique minimal recommande : 8 mm'],
      ['Nombre de Spires Enroulees', `${params.result.spiralLayersCount} tours`, 'Nombre de couches concentriques sur axe'],
      ['Nombre Total de Lames', `${params.result.totalSlatCount} lames`, `${params.result.totalSlatCount - params.result.securitySlatsInBox} visibles + ${params.result.securitySlatsInBox} de securite dans coffre`],
      ['Axe d Enroulement Octogonal', `Octo ${params.result.tubeDiameterMm} mm`, 'Tube acier galvanise profile anti fleche'],
    ],
    theme: 'grid',
    styles: { fontSize: 7, cellPadding: 2, textColor: [30, 41, 59] },
    headStyles: { fillColor: primaryBlue, textColor: 255, fontStyle: 'bold', fontSize: 7.5 },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 60 },
      1: { cellWidth: 45, fontStyle: 'bold' },
      2: { cellWidth: 77 },
    },
  });

  // 4. Weight, Torque and Workshop Cut Sheet Table
  const cutTableY = (doc as any).lastAutoTable.finalY + 4;
  autoTable(doc, {
    startY: cutTableY,
    margin: { left: 14, right: 14 },
    head: [['Composant / Grandeur Atelier', 'Cote de Debit / Valeur', 'Recommandation Fabrication']],
    body: [
      ['Poids Total du Tablier', `${params.result.curtainWeightKg} kg`, 'Poids des lames avec lame finale leste'],
      ['Couple Moteur Calcule', `${params.result.motorTorqueRequiredNm} Nm`, 'Couple nominal avec coefficient de securite'],
      ['Moteur Tubulaire Preconise', `${params.result.recommendedMotorRatingNm} Nm`, 'Gamme moteur standard Somfy / Cherubini 45mm'],
      ['Debit Lames Volet', `${params.result.cutLengths.slatCutLengthMm} mm (${params.result.totalSlatCount} pcs)`, 'Deduisant le jeu de penetration des coulisses'],
      ['Debit Axe Octogonal Acier', `${params.result.cutLengths.octagonalAxleLengthMm} mm`, 'Prevoir embout telescopique reglable'],
      ['Debit Coulisses Laterales', `${params.result.cutLengths.guideRailsLengthMm} mm (2 pcs)`, 'Avec tulipes de guidage PVC en partie haute'],
    ],
    theme: 'grid',
    styles: { fontSize: 7, cellPadding: 2, textColor: [30, 41, 59] },
    headStyles: { fillColor: [51, 65, 85], textColor: 255, fontStyle: 'bold', fontSize: 7.5 },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 60 },
      1: { cellWidth: 45, fontStyle: 'bold' },
      2: { cellWidth: 77 },
    },
  });

  // 5. Verdict Banner
  const verdictY = (doc as any).lastAutoTable.finalY + 5;
  doc.setDrawColor(...statusColor);
  doc.setFillColor(isOk ? 240 : 254, isOk ? 253 : 242, isOk ? 244 : 242);
  doc.roundedRect(14, verdictY, 182, 22, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...statusColor);
  const verdictTitle = isOk
    ? 'ENROULEMENT CONFORME : JEU PERIPHERIQUE SECURISE'
    : 'CAISSON TROP PETIT : RISQUE DE BLOCAGE DU TABLIER';
  doc.text(verdictTitle, 20, verdictY + 7);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(30, 41, 59);
  doc.text(
    `Diametre enroule : ${params.result.woundRollDiameterMm} mm • Jeu radial restant : ${params.result.radialClearanceMm} mm.`,
    20,
    verdictY + 13
  );
  const recLine = isOk
    ? 'Le caisson selectionne offre un espace suffisant sans risque de rayure ni frottement.'
    : `Preconisation imperative : Remplacer par un coffre plus volumineux (minimum 180 ou 205 mm).`;
  doc.text(recLine, 20, verdictY + 18);

  // 6. Workshop Directives
  const directY = verdictY + 25;
  doc.setDrawColor(226, 232, 240);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, directY, 182, 25, 1.5, 1.5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(...primaryBlue);
  doc.text('Directives d Assemblage et Montage en Atelier :', 18, directY + 5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(71, 85, 105);
  let curDirY = directY + 9.5;
  for (const note of params.result.workshopFabricationNotesFr.slice(0, 3)) {
    doc.text(`• ${note}`, 18, curDirY);
    curDirY += 4.5;
  }

  // 7. Signatures & QR Code
  const signY = directY + 28;
  doc.setDrawColor(203, 213, 225);
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(14, signY, 65, 22, 1.5, 1.5, 'FD');
  doc.roundedRect(131, signY, 65, 22, 1.5, 1.5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(...primaryBlue);
  doc.text('Pour l Atelier Volet Roulant :', 18, signY + 5.5);
  doc.text('Visa Controle Qualite & Reception :', 135, signY + 5.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(100, 116, 139);
  doc.text('Chef d atelier menuiserie', 18, signY + 11);
  doc.text('Signature & Date :', 18, signY + 17);
  doc.text('Controle bon d enroulement valide', 135, signY + 11);
  doc.text('Signature & Date :', 135, signY + 17);

  // QR Code
  try {
    const qrPayload = `BAITI|SHUTTER_WINDING|${params.documentId}|REF=${params.windowReference}|ROLL_DIA=${params.result.woundRollDiameterMm}MM|BOX=${params.result.selectedBoxData.id}|CLEARANCE=${params.result.radialClearanceMm}MM|STATUS=${isOk ? 'OK' : 'BLOCK'}`;
    const qrDataUrl = await QRCode.toDataURL(qrPayload, { width: 90, margin: 0 });
    doc.addImage(qrDataUrl, 'PNG', 92, signY + 1, 20, 20);
  } catch {
    // Handled
  }

  // 8. Footer
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(6.5);
  doc.setTextColor(148, 163, 184);
  doc.text(
    `Document technique officiel Baiti Atelier • ${params.documentId} • Fiche d enroulement et debit volet roulant`,
    105,
    289,
    { align: 'center' }
  );

  const safeFilename = `Enroulement_Volet_${params.documentId}.pdf`;
  doc.save(safeFilename);
}

export interface AcousticNoticePdfParams {
  documentId: string;
  projectOrClientName: string;
  locationWilaya: string;
  windowReference: string;
  glassLabelFr: string;
  frameLabelFr: string;
  result: import('./acousticInsulationManager').AcousticCalculationResult;
  workshopName?: string;
}

/**
 * Generates an official A4 technical notice for acoustic insulation and traffic noise reduction (NF EN ISO 717-1 / DTR C3-3).
 */
export async function generateAcousticInsulationNoticePdf(params: AcousticNoticePdfParams): Promise<void> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const primaryNavy: [number, number, number] = [15, 23, 42]; // slate-900
  const emeraldGreen: [number, number, number] = [16, 185, 129];
  const amberOrange: [number, number, number] = [245, 158, 11];
  const roseRed: [number, number, number] = [239, 68, 68];

  const isCompliant = params.result.isCompliant;
  const statusColor = isCompliant
    ? emeraldGreen
    : params.result.acousticMarginDb >= -3
      ? amberOrange
      : roseRed;

  // 1. Header Banner
  doc.setFillColor(...primaryNavy);
  doc.rect(0, 0, 210, 28, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(255, 255, 255);
  doc.text(params.workshopName || 'BAITI ATELIER ALGERIE', 14, 11);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text('Note de Calcul d Isolement Acoustique & Bruits de Voirie', 14, 17);
  doc.text('Conformite aux Normes NF EN ISO 717-1, NF EN 14351-1 et DTR C3-3 CNERIB', 14, 22);

  // Document Badge
  doc.setFillColor(30, 41, 59);
  doc.roundedRect(145, 6, 51, 16, 1.5, 1.5, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.text(`ACOUSTIQUE : ${params.documentId}`, 148, 12);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(203, 213, 225);
  doc.text(`Date : ${new Date().toLocaleDateString('fr-FR')}`, 148, 18);

  // 2. Identification Block
  const infoY = 33;
  doc.setDrawColor(226, 232, 240);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, infoY, 182, 24, 1.5, 1.5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(...primaryNavy);
  doc.text('Chantier / Projet :', 18, infoY + 6);
  doc.text('Wilaya / Localisation :', 18, infoY + 12);
  doc.text('Zone de Bruit Exterieur :', 18, infoY + 18);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text(params.projectOrClientName || 'Projet Particulier', 55, infoY + 6);
  doc.text(params.locationWilaya || 'Alger Centre', 55, infoY + 12);
  doc.text(params.result.selectedNoiseZone.titleFr, 55, infoY + 18);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...primaryNavy);
  doc.text('Repere Fenetre :', 125, infoY + 6);
  doc.text('Dimensions Baie :', 125, infoY + 12);
  doc.text('Exigence Façade DTR :', 125, infoY + 18);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(params.windowReference, 158, infoY + 6);
  doc.text(`${params.result.windowWidthMm} x ${params.result.windowHeightMm} mm (${params.result.totalAreaM2} m2)`, 158, infoY + 12);
  doc.text(`${params.result.requiredFacadeIsolationDb} dB (DnT,w + Ctr)`, 158, infoY + 18);

  // 3. Composite Acoustic Performance Table
  const tableY = infoY + 28;
  autoTable(doc, {
    startY: tableY,
    margin: { left: 14, right: 14 },
    head: [['Composant / Grandeur Acoustique', 'Indice & Valeur', 'Observations Techniques & Normatives']],
    body: [
      ['Vitrage Installe', `${params.result.selectedGlassData.nameFr}`, `Rw: ${params.result.selectedGlassData.rwDb} dB (C: ${params.result.selectedGlassData.cDb}, Ctr: ${params.result.selectedGlassData.ctrDb} dB)`],
      ['Chassis & Menuiserie', `${params.result.selectedFrameData.nameFr}`, `Rw cadre: ${params.result.selectedFrameData.frameRwDb} dB, etancheite classe ${params.result.selectedAirPermeability}`],
      ['Entree d Air de Ventilation', `${params.result.selectedVentData.labelFr}`, `Isolement grille Dn,e,w: ${params.result.selectedVentData.dnewCtrDb === 99 ? 'Sans fuite' : `${params.result.selectedVentData.dnewCtrDb} dB`}`],
      ['Coffre de Volet Roulant', `${params.result.selectedBoxData.labelFr}`, `Isolement coffre Dn,e,w: ${params.result.selectedBoxData.dnewCtrDb === 99 ? 'Sans coffre' : `${params.result.selectedBoxData.dnewCtrDb} dB`}`],
      ['Indice Global Rw Fenetre', `${params.result.compositeRwDb} dB`, 'Affaiblissement acoustique composite global de la baie'],
      ['Indice Bruits de Trafic (Rw + Ctr)', `${params.result.compositeRwPlusCtrDb} dB`, 'Indicateur officiel reglementaire de voirie urbaine'],
      ['Atténuation Bruit Perçu', `-${params.result.perceivedNoiseReductionPercent}%`, 'Reduction psycho-acoustique ressentie par l occupant'],
      ['Niveau Sonore Intérieur Estimé', `Jour: ${params.result.estimatedInteriorNoiseLdenDb} dB(A) • Nuit: ${params.result.estimatedInteriorNoiseNightDb} dB(A)`, 'Objectif confort nocturne admissible DTR C3-3 <= 35 dB(A)'],
    ],
    theme: 'grid',
    styles: { fontSize: 7, cellPadding: 2, textColor: [30, 41, 59] },
    headStyles: { fillColor: primaryNavy, textColor: 255, fontStyle: 'bold', fontSize: 7.5 },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 55 },
      1: { cellWidth: 55, fontStyle: 'bold' },
      2: { cellWidth: 72 },
    },
  });

  // 4. Octave Band Spectrum Table
  const octTableY = (doc as any).lastAutoTable.finalY + 4;
  const spec = params.result.soundSpectrumLevels;
  autoTable(doc, {
    startY: octTableY,
    margin: { left: 14, right: 14 },
    head: [['Bande d Octave (Hz)', '125 Hz', '250 Hz', '500 Hz', '1000 Hz', '2000 Hz', '4000 Hz']],
    body: [
      [
        'Affaiblissement R (dB)',
        `${spec.hz125} dB`,
        `${spec.hz250} dB`,
        `${spec.hz500} dB`,
        `${spec.hz1000} dB`,
        `${spec.hz2000} dB`,
        `${spec.hz4000} dB`,
      ],
    ],
    theme: 'grid',
    styles: { fontSize: 7, cellPadding: 2, halign: 'center', textColor: [30, 41, 59] },
    headStyles: { fillColor: [51, 65, 85], textColor: 255, fontStyle: 'bold', fontSize: 7.5 },
    columnStyles: {
      0: { fontStyle: 'bold', halign: 'left', cellWidth: 44 },
      1: { cellWidth: 23 },
      2: { cellWidth: 23 },
      3: { cellWidth: 23 },
      4: { cellWidth: 23 },
      5: { cellWidth: 23 },
      6: { cellWidth: 23 },
    },
  });

  // 5. Verdict Banner
  const verdictY = (doc as any).lastAutoTable.finalY + 5;
  doc.setDrawColor(...statusColor);
  doc.setFillColor(isCompliant ? 240 : 254, isCompliant ? 253 : 242, isCompliant ? 244 : 242);
  doc.roundedRect(14, verdictY, 182, 22, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...statusColor);
  const verdictTitle = isCompliant
    ? 'ISOLEMENT ACOUSTIQUE CONFORME AU DTR C3-3'
    : 'ISOLEMENT INSUFFISANT : AMELIORATION REQUISE';
  doc.text(verdictTitle, 20, verdictY + 7);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(30, 41, 59);
  doc.text(
    `Indice calcule (Rw + Ctr) : ${params.result.compositeRwPlusCtrDb} dB • Exigence reglementaire : ${params.result.requiredFacadeIsolationDb} dB • Marge : ${params.result.acousticMarginDb >= 0 ? '+' : ''}${params.result.acousticMarginDb} dB.`,
    20,
    verdictY + 13
  );
  doc.text(
    `Point faible acoustique dominant identifie : ${params.result.primaryAcousticWeakPointFr}.`,
    20,
    verdictY + 18
  );

  // 6. Engineering Recommendations
  const directY = verdictY + 25;
  doc.setDrawColor(226, 232, 240);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, directY, 182, 24, 1.5, 1.5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(...primaryNavy);
  doc.text('Prescriptions et Recommandations Acoustiques Atelier :', 18, directY + 5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(71, 85, 105);
  let curDirY = directY + 9.5;
  for (const note of params.result.engineeringRecommendationsFr.slice(0, 3)) {
    doc.text(`• ${note}`, 18, curDirY);
    curDirY += 4.5;
  }

  // 7. Signatures & QR Code
  const signY = directY + 27;
  doc.setDrawColor(203, 213, 225);
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(14, signY, 65, 22, 1.5, 1.5, 'FD');
  doc.roundedRect(131, signY, 65, 22, 1.5, 1.5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(...primaryNavy);
  doc.text('Pour le Concepteur Menuiserie :', 18, signY + 5.5);
  doc.text('Visa Acoustique & Reception :', 135, signY + 5.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(100, 116, 139);
  doc.text('Ingénieur bureau d études Baiti', 18, signY + 11);
  doc.text('Signature & Date :', 18, signY + 17);
  doc.text('Bureau de controle / Maître d œuvre', 135, signY + 11);
  doc.text('Signature & Date :', 135, signY + 17);

  // QR Code
  try {
    const qrPayload = `BAITI|ACOUSTIC|${params.documentId}|REF=${params.windowReference}|RW=${params.result.compositeRwDb}|RW_CTR=${params.result.compositeRwPlusCtrDb}|ZONE=${params.result.selectedNoiseZone.id}|REQ=${params.result.requiredFacadeIsolationDb}|MARGIN=${params.result.acousticMarginDb}|STATUS=${isCompliant ? 'PASS' : 'FAIL'}`;
    const qrDataUrl = await QRCode.toDataURL(qrPayload, { width: 90, margin: 0 });
    doc.addImage(qrDataUrl, 'PNG', 92, signY + 1, 20, 20);
  } catch {
    // Handled
  }

  // 8. Footer
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(6.5);
  doc.setTextColor(148, 163, 184);
  doc.text(
    `Document technique officiel Baiti Atelier • ${params.documentId} • NF EN ISO 717-1 • NF EN 14351-1 • DTR C3-3 CNERIB`,
    105,
    289,
    { align: 'center' }
  );

  const safeFilename = `Note_Acoustique_${params.documentId}.pdf`;
  doc.save(safeFilename);
}

export interface CurtainWallPdfParams {
  documentId: string;
  projectOrClientName: string;
  locationWilaya: string;
  facadeReference: string;
  typologyFr: string;
  result: import('./curtainWallStructuralManager').CurtainWallCalculationResult;
  workshopName?: string;
}

/**
 * Generates an official A4 structural calculation sheet for curtain wall mullion deflection and wind inertia (Eurocode 9 / DTU 33.1 / DTR BC 2-47).
 */
export async function generateCurtainWallCalculationPdf(params: CurtainWallPdfParams): Promise<void> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const primaryNavy: [number, number, number] = [15, 23, 42]; // slate-900
  const emeraldGreen: [number, number, number] = [16, 185, 129];
  const amberOrange: [number, number, number] = [245, 158, 11];
  const roseRed: [number, number, number] = [239, 68, 68];

  const isOk = params.result.isMullionCompliant && params.result.isTransomCompliant;
  const statusColor = isOk
    ? emeraldGreen
    : params.result.deflectionRatioPercent <= 110
      ? amberOrange
      : roseRed;

  // 1. Header Banner
  doc.setFillColor(...primaryNavy);
  doc.rect(0, 0, 210, 28, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(255, 255, 255);
  doc.text(params.workshopName || 'BAITI ATELIER ALGERIE', 14, 11);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text('Note de Calcul Statique Façade Rideau (Inertie & Fleche sous Vent)', 14, 17);
  doc.text('Normes : NF DTU 33.1, NF EN 13830, Eurocode 9 (NF EN 1999) & CNERIB DTR BC 2-47 RNV', 14, 22);

  // Document Badge
  doc.setFillColor(30, 41, 59);
  doc.roundedRect(145, 6, 51, 16, 1.5, 1.5, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.text(`FACADE : ${params.documentId}`, 148, 12);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(203, 213, 225);
  doc.text(`Date : ${new Date().toLocaleDateString('fr-FR')}`, 148, 18);

  // 2. Identification Block
  const infoY = 33;
  doc.setDrawColor(226, 232, 240);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, infoY, 182, 24, 1.5, 1.5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(...primaryNavy);
  doc.text('Chantier / Tour :', 18, infoY + 6);
  doc.text('Wilaya / Localisation :', 18, infoY + 12);
  doc.text('Zone de Vent & Site :', 18, infoY + 18);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text(params.projectOrClientName || 'Tour de Bureaux / Complexe', 55, infoY + 6);
  doc.text(params.locationWilaya || 'Alger Bab Ezzouar', 55, infoY + 12);
  doc.text(`${params.result.selectedWindZone.nameFr} (z = ${params.result.buildingHeightAboveGroundM} m)`, 55, infoY + 18);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...primaryNavy);
  doc.text('Repere Façade :', 125, infoY + 6);
  doc.text('Trame / Entraxe B :', 125, infoY + 12);
  doc.text('Hauteur d Etage L :', 125, infoY + 18);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(params.facadeReference, 158, infoY + 6);
  doc.text(`${params.result.mullionSpacingMm} mm`, 158, infoY + 12);
  doc.text(`${params.result.floorHeightMm} mm entre dalles`, 158, infoY + 18);

  // 3. Structural Calculation Table
  const tableY = infoY + 28;
  autoTable(doc, {
    startY: tableY,
    margin: { left: 14, right: 14 },
    head: [['Parametre Statique / Element de Structure', 'Valeur Calculee', 'Exigence Normative / Observation']],
    body: [
      ['Pression Dynamique de Pointe qp(z)', `${params.result.dynamicWindPressureQpDanM2} daN/m² (${params.result.dynamicWindPressurePascals} Pa)`, 'Calcul DTR BC 2-47 avec coefficient d exposition Ce(z)'],
      ['Charge Lineique sur Montant (w)', `${params.result.linearWindLoadNPerMm.toFixed(3)} N/mm`, `Pour un entraxe entre montants de ${params.result.mullionSpacingMm} mm`],
      ['Montant Aluminium Selectionne', `${params.result.selectedMullion.labelFr}`, `Inertie Ix : ${params.result.selectedMullion.ixCm4} cm4 (Poids : ${params.result.selectedMullion.weightKgPerM} kg/m)`],
      ['Inertie Minimale Requise (Ix,min)', `${params.result.requiredMullionIxCm4} cm4`, 'Calcul Eurocode 9 sous charge de vent de service'],
      ['Fleche Calculee du Montant (f)', `${params.result.calculatedMullionDeflectionMm} mm`, `Taux de fleche : ${params.result.deflectionRatioPercent}% de la limite admissible`],
      ['Fleche Limite Admissible (f_adm)', `${params.result.permissibleMullionDeflectionMm} mm`, 'Limite NF DTU 33.1 (L/200 ou L/300 + 5mm, plafonnee a 15mm)'],
      ['Traverse Horizontale Selectionnee', `${params.result.selectedTransom.labelFr}`, `Inertie Iy : ${params.result.selectedTransom.iyCm4} cm4 (Max : ${params.result.selectedTransom.maxGlassWeightKg} kg)`],
      ['Poids du Vitrage & Fleche Traverse', `${params.result.glassPanelWeightKg} kg • f = ${params.result.calculatedTransomDeflectionMm} mm`, 'Fleche admissible traverse <= 3 mm pour drainage de feuillure'],
    ],
    theme: 'grid',
    styles: { fontSize: 7, cellPadding: 2, textColor: [30, 41, 59] },
    headStyles: { fillColor: primaryNavy, textColor: 255, fontStyle: 'bold', fontSize: 7.5 },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 60 },
      1: { cellWidth: 50, fontStyle: 'bold' },
      2: { cellWidth: 72 },
    },
  });

  // 4. Anchors and Dilatation Table
  const anchorTableY = (doc as any).lastAutoTable.finalY + 4;
  autoTable(doc, {
    startY: anchorTableY,
    margin: { left: 14, right: 14 },
    head: [['Ancrage & Dilatation Thermique', 'Valeur de Calcul', 'Preconisation Technique DTU 33.1']],
    body: [
      ['Reaction Horizontale Vent a l Appui', `${params.result.anchorReactions.windReactionMaxDan} daN`, 'Effort de traction / cisaillement sur les chevilles d ancrage'],
      ['Charge Verticale Poids Propre', `${params.result.anchorReactions.deadLoadAnchorDan} daN`, 'Poids cumule vitrage + montant repris a l appui fixe'],
      ['Jeu de Dilatation Thermique', `${params.result.thermalExpansionGapMm} mm`, 'Jeu net obligatoire au droit du manchon telescopique de dalle'],
      ['Type de Fixation Recommandee', `${params.result.anchorReactions.anchorBoltRecommendedFr}`, 'Etrier reglable 3D en acier galvanise ou aluminium moule'],
    ],
    theme: 'grid',
    styles: { fontSize: 7, cellPadding: 2, textColor: [30, 41, 59] },
    headStyles: { fillColor: [51, 65, 85], textColor: 255, fontStyle: 'bold', fontSize: 7.5 },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 60 },
      1: { cellWidth: 50, fontStyle: 'bold' },
      2: { cellWidth: 72 },
    },
  });

  // 5. Verdict Banner
  const verdictY = (doc as any).lastAutoTable.finalY + 5;
  doc.setDrawColor(...statusColor);
  doc.setFillColor(isOk ? 240 : 254, isOk ? 253 : 242, isOk ? 244 : 242);
  doc.roundedRect(14, verdictY, 182, 22, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...statusColor);
  const verdictTitle = isOk
    ? 'DIMENSIONNEMENT CONFORME : FLECHE ET INERTIE VALIDEES'
    : 'NON CONFORME : FLECHE DU MONTANT HORS TOLERANCE';
  doc.text(verdictTitle, 20, verdictY + 7);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(30, 41, 59);
  doc.text(
    `Fleche calculee : ${params.result.calculatedMullionDeflectionMm} mm pour une limite de ${params.result.permissibleMullionDeflectionMm} mm • Taux d utilisation : ${params.result.deflectionRatioPercent}%.`,
    20,
    verdictY + 13
  );
  const recLine = isOk
    ? 'Le montant offre une reserve de securite satisfaisante protegeant l integrite des vitrages sous rafales.'
    : `Preconisation imperative : Remplacer par le profil ${params.result.recommendedMullionModel} (Inertie requise : ${params.result.requiredMullionIxCm4} cm4).`;
  doc.text(recLine, 20, verdictY + 18);

  // 6. Directives and Recommendations
  const directY = verdictY + 25;
  doc.setDrawColor(226, 232, 240);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, directY, 182, 24, 1.5, 1.5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(...primaryNavy);
  doc.text('Directives de Montage et Securite Chantier DTU 33.1 :', 18, directY + 5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(71, 85, 105);
  let curDirY = directY + 9.5;
  for (const note of params.result.engineeringObservationsFr.slice(0, 3)) {
    doc.text(`• ${note}`, 18, curDirY);
    curDirY += 4.5;
  }

  // 7. Signatures & QR Code
  const signY = directY + 27;
  doc.setDrawColor(203, 213, 225);
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(14, signY, 65, 22, 1.5, 1.5, 'FD');
  doc.roundedRect(131, signY, 65, 22, 1.5, 1.5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(...primaryNavy);
  doc.text('Pour le Bureau d Etudes Facades :', 18, signY + 5.5);
  doc.text('Visa Controle Technique (CTC) :', 135, signY + 5.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(100, 116, 139);
  doc.text('Ingenieur structure Baiti Atelier', 18, signY + 11);
  doc.text('Signature & Date :', 18, signY + 17);
  doc.text('Organisme de controle qualite', 135, signY + 11);
  doc.text('Signature & Date :', 135, signY + 17);

  // QR Code
  try {
    const qrPayload = `BAITI|CURTAIN_WALL|${params.documentId}|REF=${params.facadeReference}|MULLION=${params.result.selectedMullion.id}|IX=${params.result.selectedMullion.ixCm4}|DEFLECTION=${params.result.calculatedMullionDeflectionMm}MM|LIMIT=${params.result.permissibleMullionDeflectionMm}MM|STATUS=${isOk ? 'OK' : 'EXCEEDED'}`;
    const qrDataUrl = await QRCode.toDataURL(qrPayload, { width: 90, margin: 0 });
    doc.addImage(qrDataUrl, 'PNG', 92, signY + 1, 20, 20);
  } catch {
    // Handled
  }

  // 8. Footer
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(6.5);
  doc.setTextColor(148, 163, 184);
  doc.text(
    `Note technique officielle Baiti Atelier • ${params.documentId} • NF DTU 33.1 • NF EN 13830 • Eurocode 9 • CNERIB DTR BC 2-47`,
    105,
    289,
    { align: 'center' }
  );

  const safeFilename = `Note_Calcul_Facade_Rideau_${params.documentId}.pdf`;
  doc.save(safeFilename);
}

export interface SeismicNoticePdfParams {
  documentId: string;
  projectOrClientName: string;
  locationWilaya: string;
  windowReference: string;
  glassSecurityLabelFr: string;
  result: import('./seismicJoineryManager').SeismicCalculationResult;
  workshopName?: string;
}

/**
 * Generates an official A4 seismic calculation note for window and glazing movement under inter-story drift (RPA 99 / Eurocode 8 / DTU 36.5).
 */
export async function generateSeismicCalculationPdf(params: SeismicNoticePdfParams): Promise<void> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const primaryNavy: [number, number, number] = [15, 23, 42]; // slate-900
  const emeraldGreen: [number, number, number] = [16, 185, 129];
  const amberOrange: [number, number, number] = [245, 158, 11];
  const roseRed: [number, number, number] = [239, 68, 68];

  const isOk = params.result.isGlassClearanceCompliant && params.result.isStoryDriftCompliant;
  const statusColor = isOk
    ? emeraldGreen
    : params.result.seismicSafetyFactor >= 0.85
      ? amberOrange
      : roseRed;

  // 1. Header Banner
  doc.setFillColor(...primaryNavy);
  doc.rect(0, 0, 210, 28, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(255, 255, 255);
  doc.text(params.workshopName || 'BAITI ATELIER ALGERIE', 14, 11);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text('Note de Calcul de Securite Parasismique & Derive d Etage (RPA 99)', 14, 17);
  doc.text('Normes : RPA 99 v2003 (DTR BC 2-48), NF EN 1998-1 Eurocode 8 & NF DTU 36.5 Annexe B', 14, 22);

  // Document Badge
  doc.setFillColor(30, 41, 59);
  doc.roundedRect(145, 6, 51, 16, 1.5, 1.5, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.text(`SEISME : ${params.documentId}`, 148, 12);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(203, 213, 225);
  doc.text(`Date : ${new Date().toLocaleDateString('fr-FR')}`, 148, 18);

  // 2. Identification Block
  const infoY = 33;
  doc.setDrawColor(226, 232, 240);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, infoY, 182, 24, 1.5, 1.5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(...primaryNavy);
  doc.text('Projet / Chantier :', 18, infoY + 6);
  doc.text('Wilaya / Zone Sismique :', 18, infoY + 12);
  doc.text('Groupe d Usage & Structure :', 18, infoY + 18);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text(params.projectOrClientName || 'Projet Collectif / Tertiaire', 55, infoY + 6);
  doc.text(`${params.locationWilaya} • ${params.result.selectedZone.nameFr} (A = ${params.result.designAccelerationA}g)`, 55, infoY + 12);
  doc.text(`${params.result.selectedUsage.titleFr} • ${params.result.selectedStructure.nameFr}`, 55, infoY + 18);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...primaryNavy);
  doc.text('Repere Ouvrage :', 125, infoY + 6);
  doc.text('Dimensions Menuiserie :', 125, infoY + 12);
  doc.text('Hauteur d Etage :', 125, infoY + 18);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(params.windowReference, 158, infoY + 6);
  doc.text(`${params.result.windowWidthMm} x ${params.result.windowHeightMm} mm`, 158, infoY + 12);
  doc.text(`${params.result.storyHeightMm} mm entre dalles`, 158, infoY + 18);

  // 3. Structural Calculation Table
  const tableY = infoY + 28;
  autoTable(doc, {
    startY: tableY,
    margin: { left: 14, right: 14 },
    head: [['Grandeur Parasismique / Critere de Securite', 'Valeur Calculee', 'Exigence RPA 99 / DTU 36.5']],
    body: [
      ['Acceleration de Calcul (A_eff = A * I)', `${params.result.designAccelerationA} g`, `Zone RPA ${params.result.selectedZone.nameFr.split(':')[0]} x I=${params.result.selectedUsage.importanceFactorI}`],
      ['Deplacement Elastique d Etage (de)', `${params.result.calculatedElasticDriftMm} mm`, 'Deformation horizontale sous seisme de calcul'],
      ['Derive Relative de Calcul (dr = q * de)', `${params.result.calculatedDesignDriftDrMm} mm`, `Taux de derive : ${params.result.storyDriftRatioPercent}% de la hauteur d etage`],
      ['Limite Admissible Derive RPA 99', `${params.result.allowableStoryDriftRpaMm} mm`, 'Delta_adm = 0.010 * h (Article 5.10 du RPA 99 v2003)'],
      ['Jeu Fond de Feuillure Initial', `${params.result.glassEdgeClearanceMm} mm`, 'Espace net peripherique entre verre et profile'],
      ['Capacite de Jeu Avant Choc d Angle', `${params.result.glassFalloutClearanceDriftMm} mm`, 'Formule AAMA 501.4 / FEMA 451 de distorsion angulaire'],
      ['Facteur de Securite Sismique Vitrage', `${params.result.seismicSafetyFactor}`, 'Rapport capacite / derive (minimum requis >= 1.00)'],
      ['Joint Sismique Peripherique Requis', `${params.result.requiredPeripheralSeismicJointMm} mm`, 'Desolidarisation gros œuvre garnie de mastic elastique'],
    ],
    theme: 'grid',
    styles: { fontSize: 7, cellPadding: 2, textColor: [30, 41, 59] },
    headStyles: { fillColor: primaryNavy, textColor: 255, fontStyle: 'bold', fontSize: 7.5 },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 60 },
      1: { cellWidth: 50, fontStyle: 'bold' },
      2: { cellWidth: 72 },
    },
  });

  // 4. Fasteners & Glazing Directives Table
  const anchorTableY = (doc as any).lastAutoTable.finalY + 4;
  autoTable(doc, {
    startY: anchorTableY,
    margin: { left: 14, right: 14 },
    head: [['Dispositif de Pose / Securite Verre', 'Specification Atelier', 'Observation Chantier']],
    body: [
      ['Trous Oblongs sur Pattes de Fixation', `${params.result.recommendedSlottedHoleLengthMm} mm`, 'Permettant la distorsion du portique sans cisailler les chevilles'],
      ['Type de Vitrage Recommande', `${params.glassSecurityLabelFr}`, params.result.requiresLaminatedSafetyGlass ? 'Feuilleté de sécurité OBLIGATOIRE (Zone IIb/III)' : 'Standard admissible'],
      ['Cales d Assise & Calage Lateral', 'Cales elastomeres Shore A 60-70', 'Calage biseaute empechant le blocage diagonal sous distorsion'],
    ],
    theme: 'grid',
    styles: { fontSize: 7, cellPadding: 2, textColor: [30, 41, 59] },
    headStyles: { fillColor: [51, 65, 85], textColor: 255, fontStyle: 'bold', fontSize: 7.5 },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 60 },
      1: { cellWidth: 50, fontStyle: 'bold' },
      2: { cellWidth: 72 },
    },
  });

  // 5. Verdict Banner
  const verdictY = (doc as any).lastAutoTable.finalY + 5;
  doc.setDrawColor(...statusColor);
  doc.setFillColor(isOk ? 240 : 254, isOk ? 253 : 242, isOk ? 244 : 242);
  doc.roundedRect(14, verdictY, 182, 22, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...statusColor);
  const verdictTitle = isOk
    ? 'SECURITE PARASISMIQUE VALIDEE : JEU DE FEUILLURE CONFORME'
    : 'ALERTE PARASISMIQUE : RISQUE DE CASSE DU VITRAGE';
  doc.text(verdictTitle, 20, verdictY + 7);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(30, 41, 59);
  doc.text(
    `Derive calculee dr = ${params.result.calculatedDesignDriftDrMm} mm • Capacite feuillure = ${params.result.glassFalloutClearanceDriftMm} mm • Facteur securite = ${params.result.seismicSafetyFactor}.`,
    20,
    verdictY + 13
  );
  const recLine = isOk
    ? 'Le vitrage dispose d une marge suffisante pour osciller sans choc contre les angles du dormant aluminium.'
    : 'Preconisation imperative : Augmenter le jeu de fond de feuillure a 8 ou 10 mm avec parcloses profondes.';
  doc.text(recLine, 20, verdictY + 18);

  // 6. Directives and Recommendations
  const directY = verdictY + 25;
  doc.setDrawColor(226, 232, 240);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, directY, 182, 24, 1.5, 1.5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(...primaryNavy);
  doc.text('Prescriptions et Recommandations Parasismiques Atelier :', 18, directY + 5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(71, 85, 105);
  let curDirY = directY + 9.5;
  for (const note of params.result.engineeringDirectivesFr.slice(0, 3)) {
    doc.text(`• ${note}`, 18, curDirY);
    curDirY += 4.5;
  }

  // 7. Signatures & QR Code
  const signY = directY + 27;
  doc.setDrawColor(203, 213, 225);
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(14, signY, 65, 22, 1.5, 1.5, 'FD');
  doc.roundedRect(131, signY, 65, 22, 1.5, 1.5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(...primaryNavy);
  doc.text('Pour le Concepteur Menuiserie :', 18, signY + 5.5);
  doc.text('Visa Controle Technique CTC :', 135, signY + 5.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(100, 116, 139);
  doc.text('Ingenieur structure Baiti Atelier', 18, signY + 11);
  doc.text('Signature & Date :', 18, signY + 17);
  doc.text('Organisme national de controle', 135, signY + 11);
  doc.text('Signature & Date :', 135, signY + 17);

  // QR Code
  try {
    const qrPayload = `BAITI|SEISMIC|${params.documentId}|REF=${params.windowReference}|ZONE=${params.result.selectedZone.id}|DRIFT=${params.result.calculatedDesignDriftDrMm}MM|CLEARANCE=${params.result.glassFalloutClearanceDriftMm}MM|SF=${params.result.seismicSafetyFactor}|STATUS=${isOk ? 'OK' : 'RISK'}`;
    const qrDataUrl = await QRCode.toDataURL(qrPayload, { width: 90, margin: 0 });
    doc.addImage(qrDataUrl, 'PNG', 92, signY + 1, 20, 20);
  } catch {
    // Handled
  }

  // 8. Footer
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(6.5);
  doc.setTextColor(148, 163, 184);
  doc.text(
    `Note technique officielle Baiti Atelier • ${params.documentId} • RPA 99 v2003 • NF EN 1998-1 • NF DTU 36.5 Annexe B`,
    105,
    289,
    { align: 'center' }
  );

  const safeFilename = `Note_Calcul_Parasismique_${params.documentId}.pdf`;
  doc.save(safeFilename);
}

export interface BifoldDoorPdfParams {
  documentId: string;
  clientName: string;
  wilayaName: string;
  windowReference: string;
  widthMm: number;
  heightMm: number;
  result: import('./bifoldDoorManager').BifoldCalculationResult;
  workshopName?: string;
}

/**
 * Generates an official A4 technical specification and calculation note for bifold accordion doors.
 * References: NF EN 1527 / NF EN 1191 / NF DTU 36.5 / Decret Executif PMR 06-455.
 * Humanizer invariant: exactly 0 em dashes, 0 en dashes.
 */
export async function generateBifoldDoorNoticePdf(params: BifoldDoorPdfParams): Promise<void> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const primaryNavy: [number, number, number] = [15, 23, 42]; // slate-900
  const emeraldGreen: [number, number, number] = [16, 185, 129];
  const amberOrange: [number, number, number] = [245, 158, 11];
  const roseRed: [number, number, number] = [239, 68, 68];

  const isOk = params.result.overallVerdict === 'favorable';
  const isWarn = params.result.overallVerdict === 'warning';
  const statusColor = isOk ? emeraldGreen : isWarn ? amberOrange : roseRed;

  // 1. Header & Title Block
  doc.setFillColor(...primaryNavy);
  doc.rect(14, 12, 182, 22, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(255, 255, 255);
  doc.text('BAITI ATELIER : NOTE TECHNIQUE PORTE ACCORDEON', 20, 21);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(203, 213, 225);
  doc.text('Calcul Mecanique des Chariots, Fleche Linteau & Drainage Seuil (NF EN 1527 / DTU 36.5)', 20, 27);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(212, 175, 55);
  doc.text(`Doc N: ${params.documentId}`, 150, 21);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(203, 213, 225);
  doc.text(`Date : ${new Date().toLocaleDateString('fr-FR')}`, 150, 27);

  // 2. Project & Location Metadata Card
  doc.setDrawColor(226, 232, 240);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, 38, 182, 20, 1.5, 1.5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(...primaryNavy);
  doc.text('Reference Ouvrage :', 18, 44);
  doc.text('Maitre d Ouvrage / Client :', 18, 50);
  doc.text('Localisation / Wilaya :', 18, 55);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(51, 65, 85);
  doc.text(`${params.windowReference} (${params.widthMm} x ${params.heightMm} mm)`, 60, 44);
  doc.text(`${params.clientName || 'Projet Standard'}`, 60, 50);
  doc.text(`${params.wilayaName || 'Alger (16)'}`, 60, 55);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...primaryNavy);
  doc.text('Configuration Schema :', 115, 44);
  doc.text('Type de Guidage :', 115, 50);
  doc.text('Type de Seuil :', 115, 55);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(51, 65, 85);
  doc.text(`${params.result.configSpec.label}`, 152, 44);
  doc.text(`${params.result.mountingSpec.nameFr.split('(')[0].trim()}`, 152, 50);
  doc.text(`${params.result.thresholdSpec.nameFr.split('(')[0].trim()}`, 152, 55);

  // 3. Technical Parameters Grid
  const gridY = 62;
  const colWidth = 43.5;
  const colGap = 2.6;

  // Box 1: Geometrie & Vantaux
  doc.setDrawColor(203, 213, 225);
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(14, gridY, colWidth, 42, 1.5, 1.5, 'FD');
  doc.setFillColor(241, 245, 249);
  doc.rect(14, gridY, colWidth, 7, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(...primaryNavy);
  doc.text('1. Geometrie Vantaux', 17, gridY + 5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(71, 85, 105);
  doc.text(`Nombre de vantaux : ${params.result.leafCount}`, 17, gridY + 12);
  doc.text(`Largeur vantail : ${params.result.leafWidthMm} mm`, 17, gridY + 18);
  doc.text(`Hauteur vantail : ${params.result.leafHeightMm} mm`, 17, gridY + 24);
  doc.text(`Porte de service : ${params.result.configSpec.trafficDoor ? 'Oui (battante)' : 'Non'}`, 17, gridY + 30);
  doc.text(`Surface vitree : ${params.result.totalGlassAreaM2.toFixed(2)} m2`, 17, gridY + 36);

  // Box 2: Masses & Chariots
  const b2X = 14 + colWidth + colGap;
  doc.roundedRect(b2X, gridY, colWidth, 42, 1.5, 1.5, 'FD');
  doc.setFillColor(241, 245, 249);
  doc.rect(b2X, gridY, colWidth, 7, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(...primaryNavy);
  doc.text('2. Charges & Chariots', b2X + 3, gridY + 5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(71, 85, 105);
  doc.text(`Poids vitrage/u : ${params.result.leafGlassWeightKg} kg`, b2X + 3, gridY + 12);
  doc.text(`Poids total/vantail : ${params.result.singleLeafTotalWeightKg} kg`, b2X + 3, gridY + 18);
  doc.text(`Poids tablier total : ${params.result.totalDoorLeavesWeightKg} kg`, b2X + 3, gridY + 24);
  doc.text(`Charge/chariot : ${params.result.loadPerBogieKg} kg`, b2X + 3, gridY + 30);
  doc.text(`Taux charge : ${params.result.bogieUtilizationPercent}% (cap ${params.result.selectedBogieCapacityKg}kg)`, b2X + 3, gridY + 36);

  // Box 3: Linteau & Fleche
  const b3X = b2X + colWidth + colGap;
  doc.roundedRect(b3X, gridY, colWidth, 42, 1.5, 1.5, 'FD');
  doc.setFillColor(241, 245, 249);
  doc.rect(b3X, gridY, colWidth, 7, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(...primaryNavy);
  doc.text('3. Appui Linteau Replie', b3X + 3, gridY + 5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(71, 85, 105);
  doc.text(`Vantaux empiles : ${params.result.stackedLeavesCountMaxSide}`, b3X + 3, gridY + 12);
  doc.text(`Charge ponctuelle : ${params.result.stackedConcentratedLoadKg} kg`, b3X + 3, gridY + 18);
  doc.text(`Largeur paquet : ${params.result.stackedWidthMm} mm`, b3X + 3, gridY + 24);
  doc.text(`Fleche limite : ${params.result.lintelDeflectionLimitMm} mm`, b3X + 3, gridY + 30);
  doc.text(`Inertie est. : ${params.result.recommendedLintelInertiaCm4} cm4`, b3X + 3, gridY + 36);

  // Box 4: Seuil & Drainage
  const b4X = b3X + colWidth + colGap;
  doc.roundedRect(b4X, gridY, colWidth, 42, 1.5, 1.5, 'FD');
  doc.setFillColor(241, 245, 249);
  doc.rect(b4X, gridY, colWidth, 7, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(...primaryNavy);
  doc.text('4. Seuil & Drainage', b4X + 3, gridY + 5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(71, 85, 105);
  doc.text(`Hauteur seuil : ${params.result.thresholdSpec.heightMm} mm`, b4X + 3, gridY + 12);
  doc.text(`PMR Decret 06-455 : ${params.result.thresholdSpec.pmrCompliant ? 'Conforme' : 'Non PMR'}`, b4X + 3, gridY + 18);
  doc.text(`Etancheite : ${params.result.thresholdSpec.waterTightnessClass}`, b4X + 3, gridY + 24);
  doc.text(`Fentes buses : ${params.result.weepHoleCount} buses`, b4X + 3, gridY + 30);
  doc.text(`Clapet anti-retour : ${params.result.antiReturnFlapRequired ? 'Obligatoire' : 'Optionnel'}`, b4X + 3, gridY + 36);

  // 4. Detailed Kinematics & Mechanics Table
  const tableY = 109;
  doc.setFillColor(...primaryNavy);
  doc.rect(14, tableY, 182, 7, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(255, 255, 255);
  doc.text('COMPOSANT / PARAMETRE', 18, tableY + 5);
  doc.text('VALEUR CALCULEE', 90, tableY + 5);
  doc.text('CRITERE NORMATIF', 140, tableY + 5);

  const rows = [
    {
      label: 'Charge dynamique par chariot a roulettes',
      val: `${params.result.loadPerBogieKg} kg (${params.result.bogieUtilizationPercent}% capacite)`,
      crit: `Capacite nominale ${params.result.selectedBogieCapacityKg} kg (NF EN 1527)`,
    },
    {
      label: 'Effort de traction sur paumelle haute',
      val: `${params.result.hingeTensionDaN} daN (couple de porte a faux)`,
      crit: 'Minimum 3 paumelles avec vis traversantes dans tubulure',
    },
    {
      label: 'Charge linteau sous vantaux empiles',
      val: `${params.result.stackedConcentratedLoadKg} kg en extremite de baie`,
      crit: `Fleche maximale ${params.result.lintelDeflectionLimitMm} mm sous charge reelle`,
    },
    {
      label: 'Evacuation des eaux de pluie en traverse basse',
      val: `Debit d evacuation ${params.result.drainageRateLitersPerMin} L/min`,
      crit: `${params.result.weepHoleCount} fentes 8x30 mm + buses avec clapet silicone`,
    },
    {
      label: 'Fixation du dormant lateral en maconnerie',
      val: `${params.result.minAnchorFastenersPerJamb} chevilles par montant lateral`,
      crit: 'Espacement max 400 mm avec calage d appui incompressible',
    },
  ];

  let curY = tableY + 7;
  rows.forEach((r, idx) => {
    doc.setFillColor(idx % 2 === 0 ? 255 : 248, idx % 2 === 0 ? 255 : 250, idx % 2 === 0 ? 255 : 252);
    doc.rect(14, curY, 182, 6.5, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.line(14, curY + 6.5, 196, curY + 6.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.8);
    doc.setTextColor(30, 41, 59);
    doc.text(r.label, 18, curY + 4.5);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text(r.val, 90, curY + 4.5);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text(r.crit, 140, curY + 4.5);

    curY += 6.5;
  });

  // 5. Compliance Banner & Verdict Card
  const verdictY = curY + 4;
  doc.setDrawColor(...statusColor);
  doc.setFillColor(isOk ? 240 : isWarn ? 254 : 254, isOk ? 253 : isWarn ? 243 : 242, isOk ? 244 : isWarn ? 199 : 242);
  doc.roundedRect(14, verdictY, 182, 34, 1.5, 1.5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(...statusColor);
  doc.text(`VERDICT TECHNIQUE : ${params.result.verdictTitleFr.toUpperCase()}`, 18, verdictY + 6.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.8);
  doc.setTextColor(30, 41, 59);
  let vY = verdictY + 12;
  for (const det of params.result.verdictDetailsFr) {
    doc.text(`• ${det}`, 18, vY);
    vY += 4.5;
  }
  if (params.result.structuralLintelWarning) {
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...roseRed);
    doc.text(`• ${params.result.structuralLintelWarning}`, 18, vY);
    vY += 4.5;
  }

  // 6. Workshop Directives & Maintenance Guide
  const directY = verdictY + 37;
  doc.setDrawColor(226, 232, 240);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, directY, 182, 30, 1.5, 1.5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(...primaryNavy);
  doc.text('Prescriptions de Fabrication et Montage (NF DTU 36.5 P20-202) :', 18, directY + 5.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(71, 85, 105);
  let dY = directY + 10;
  for (const rec of params.result.recommendationsFr) {
    doc.text(`• ${rec}`, 18, dY, { maxWidth: 174 });
    dY += 4.5;
  }

  // 7. Signatures & QR Code
  const signY = directY + 33;
  doc.setDrawColor(203, 213, 225);
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(14, signY, 65, 21, 1.5, 1.5, 'FD');
  doc.roundedRect(131, signY, 65, 21, 1.5, 1.5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(...primaryNavy);
  doc.text('Pour le Fabricant Menuisier :', 18, signY + 5.5);
  doc.text('Visa Client / Architecte :', 135, signY + 5.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(100, 116, 139);
  doc.text('Atelier de fabrication Baiti Atelier', 18, signY + 10.5);
  doc.text('Signature & Date :', 18, signY + 16);
  doc.text('Bon pour accord specifications baie pliante', 135, signY + 10.5);
  doc.text('Signature & Date :', 135, signY + 16);

  // QR Code
  try {
    const qrPayload = `BAITI|BIFOLD|${params.documentId}|REF=${params.windowReference}|CONFIG=${params.result.configSpec.id}|WEIGHT=${params.result.singleLeafTotalWeightKg}KG|BOGIE=${params.result.loadPerBogieKg}KG|STATUS=${isOk ? 'OK' : 'RISK'}`;
    const qrDataUrl = await QRCode.toDataURL(qrPayload, { width: 90, margin: 0 });
    doc.addImage(qrDataUrl, 'PNG', 92, signY + 0.5, 20, 20);
  } catch {
    // Handled
  }

  // 8. Footer
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(6.5);
  doc.setTextColor(148, 163, 184);
  doc.text(
    `Note technique officielle Baiti Atelier • ${params.documentId} • NF EN 1527 • NF EN 1191 • NF DTU 36.5 • Decret PMR 06-455`,
    105,
    289,
    { align: 'center' }
  );

  const safeFilename = `Note_Porte_Accordeon_${params.documentId}.pdf`;
  doc.save(safeFilename);
}

export interface LouverAerodynamicPdfParams {
  documentId: string;
  clientName: string;
  wilayaName: string;
  projectRef: string;
  widthMm: number;
  heightMm: number;
  result: import('./louverAerodynamicsManager').LouverCalculationResult;
  workshopName?: string;
}

/**
 * Generates an official A4 technical specification note for louvers and sunshades aerodynamic performance.
 * References: NF EN 13030 / NF DTU 68.3 / Prescriptions Sonelgaz / CNERIB DTR C3-4.
 * Humanizer invariant: exactly 0 em dashes, 0 en dashes.
 */
export async function generateLouverAerodynamicPdf(params: LouverAerodynamicPdfParams): Promise<void> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const primaryNavy: [number, number, number] = [15, 23, 42]; // slate-900
  const emeraldGreen: [number, number, number] = [16, 185, 129];
  const amberOrange: [number, number, number] = [245, 158, 11];
  const roseRed: [number, number, number] = [239, 68, 68];

  const isOk = params.result.overallVerdict === 'favorable';
  const isWarn = params.result.overallVerdict === 'warning';
  const statusColor = isOk ? emeraldGreen : isWarn ? amberOrange : roseRed;

  // 1. Header & Title Block
  doc.setFillColor(...primaryNavy);
  doc.rect(14, 12, 182, 22, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12.5);
  doc.setTextColor(255, 255, 255);
  doc.text('BAITI ATELIER : NOTE AERAULIQUE GRILLE A VENTELLES', 20, 21);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(203, 213, 225);
  doc.text('Section Libre, Vitesse d Air & Perte de Charge (NF EN 13030 / DTU 68.3 / Sonelgaz)', 20, 27);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(212, 175, 55);
  doc.text(`Doc N: ${params.documentId}`, 150, 21);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(203, 213, 225);
  doc.text(`Date : ${new Date().toLocaleDateString('fr-FR')}`, 150, 27);

  // 2. Project Metadata Card
  doc.setDrawColor(226, 232, 240);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, 38, 182, 20, 1.5, 1.5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(...primaryNavy);
  doc.text('Reference Ouvrage :', 18, 44);
  doc.text('Maitre d Ouvrage / Client :', 18, 50);
  doc.text('Localisation / Wilaya :', 18, 55);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(51, 65, 85);
  doc.text(`${params.projectRef} (${params.widthMm} x ${params.heightMm} mm)`, 60, 44);
  doc.text(`${params.clientName || 'Client Projet'}`, 60, 50);
  doc.text(`${params.wilayaName || 'Alger (16)'}`, 60, 55);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...primaryNavy);
  doc.text('Usage du Local :', 115, 44);
  doc.text('Profil Lame :', 115, 50);
  doc.text('Type de Grillage :', 115, 55);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(51, 65, 85);
  doc.text(`${params.result.appSpec.labelFr}`, 148, 44, { maxWidth: 44 });
  doc.text(`${params.result.profileSpec.nameFr.split('(')[0].trim()}`, 148, 50, { maxWidth: 44 });
  doc.text(`${params.result.screenSpec.nameFr.split('(')[0].trim()}`, 148, 55, { maxWidth: 44 });

  // 3. Technical Parameters Grid
  const gridY = 62;
  const colWidth = 43.5;
  const colGap = 2.6;

  // Box 1: Geometrie & Lames
  doc.setDrawColor(203, 213, 225);
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(14, gridY, colWidth, 42, 1.5, 1.5, 'FD');
  doc.setFillColor(241, 245, 249);
  doc.rect(14, gridY, colWidth, 7, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(...primaryNavy);
  doc.text('1. Geometrie Lames', 17, gridY + 5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(71, 85, 105);
  doc.text(`Surface brute : ${params.result.grossAreaM2.toFixed(3)} m2`, 17, gridY + 12);
  doc.text(`Nombre de lames : ${params.result.bladeCount}`, 17, gridY + 18);
  doc.text(`Pas des lames : ${params.result.bladePitchMm} mm`, 17, gridY + 24);
  doc.text(`Longueur lame : ${params.result.bladeLengthMm} mm`, 17, gridY + 30);
  doc.text(`Angle inclinaison : ${params.result.profileSpec.bladeAngleDeg} deg`, 17, gridY + 36);

  // Box 2: Section Libre
  const b2X = 14 + colWidth + colGap;
  doc.roundedRect(b2X, gridY, colWidth, 42, 1.5, 1.5, 'FD');
  doc.setFillColor(241, 245, 249);
  doc.rect(b2X, gridY, colWidth, 7, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(...primaryNavy);
  doc.text('2. Section Libre', b2X + 3, gridY + 5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(71, 85, 105);
  doc.text(`Taux passage : ${params.result.geometricFreeAreaPercent}%`, b2X + 3, gridY + 12);
  doc.text(`Section libre : ${params.result.geometricFreeAreaM2.toFixed(3)} m2`, b2X + 3, gridY + 18);
  doc.text(`Surface aero Ce : ${params.result.effectiveAeroAreaM2.toFixed(3)} m2`, b2X + 3, gridY + 24);
  doc.text(`Coef Ce : ${params.result.profileSpec.dischargeCoefficientCe}`, b2X + 3, gridY + 30);
  doc.text(`Facteur grille : x${params.result.screenSpec.freeAreaFactor}`, b2X + 3, gridY + 36);

  // Box 3: Aeraulique & Vitesse
  const b3X = b2X + colWidth + colGap;
  doc.roundedRect(b3X, gridY, colWidth, 42, 1.5, 1.5, 'FD');
  doc.setFillColor(241, 245, 249);
  doc.rect(b3X, gridY, colWidth, 7, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(...primaryNavy);
  doc.text('3. Debit & Vitesse', b3X + 3, gridY + 5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(71, 85, 105);
  doc.text(`Debit etude : ${params.result.airflowM3PerHour} m3/h`, b3X + 3, gridY + 12);
  doc.text(`Debit seconde : ${params.result.airflowM3PerSecond.toFixed(3)} m3/s`, b3X + 3, gridY + 18);
  doc.text(`Vitesse frontale : ${params.result.faceVelocityMPerSec} m/s`, b3X + 3, gridY + 24);
  doc.text(`Vitesse gorge : ${params.result.freeAreaVelocityMPerSec} m/s`, b3X + 3, gridY + 30);
  doc.text(`Limite preconisee : ${params.result.appSpec.maxAirVelocityMPerSec} m/s`, b3X + 3, gridY + 36);

  // Box 4: Perte de Charge & Pluie
  const b4X = b3X + colWidth + colGap;
  doc.roundedRect(b4X, gridY, colWidth, 42, 1.5, 1.5, 'FD');
  doc.setFillColor(241, 245, 249);
  doc.rect(b4X, gridY, colWidth, 7, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(...primaryNavy);
  doc.text('4. Pression & Pluie', b4X + 3, gridY + 5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(71, 85, 105);
  doc.text(`Delta P total : ${params.result.pressureDropPa} Pa`, b4X + 3, gridY + 12);
  doc.text(`Masse volumique : ${params.result.airDensityKgM3} kg/m3`, b4X + 3, gridY + 18);
  doc.text(`Rejet pluie : ${params.result.profileSpec.waterRejectionClass.split('(')[0].trim()}`, b4X + 3, gridY + 24);
  doc.text(`Efficacite : ${params.result.profileSpec.waterRejectionClass.includes('99%') ? '99% a 100%' : 'Standard'}`, b4X + 3, gridY + 30);
  doc.text(`Grillage : ${params.result.screenSpec.meshPitchMm}`, b4X + 3, gridY + 36);

  // 4. Detailed Aerodynamics Table
  const tableY = 109;
  doc.setFillColor(...primaryNavy);
  doc.rect(14, tableY, 182, 7, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(255, 255, 255);
  doc.text('GRANDEUR AERAULIQUE / NORME', 18, tableY + 5);
  doc.text('VALEUR CALCULEE', 90, tableY + 5);
  doc.text('EXIGENCE / SEUIL APPLICABLE', 140, tableY + 5);

  const rows = [
    {
      label: 'Section libre geometrique nette (A_free)',
      val: `${params.result.geometricFreeAreaM2.toFixed(3)} m2 (${params.result.geometricFreeAreaPercent}%)`,
      crit: `Minimum requis : ${params.result.appSpec.minFreeAreaPercentRequired}% de surface brute`,
    },
    {
      label: 'Vitesse de passage frontale (V_face)',
      val: `${params.result.faceVelocityMPerSec} m/s sous ${params.result.airflowM3PerHour} m3/h`,
      crit: `Vitesse max recommandee : ${params.result.appSpec.maxAirVelocityMPerSec} m/s`,
    },
    {
      label: 'Perte de charge statique aeraulique (Delta P)',
      val: `${params.result.pressureDropPa} Pa (avec grille ${params.result.screenSpec.meshPitchMm})`,
      crit: 'Admissible en prise d air neuf et rejet direct',
    },
    {
      label: 'Efficacite contre la penetration de pluie',
      val: `${params.result.profileSpec.waterRejectionClass}`,
      crit: 'Essai selon NF EN 13030 sous pluie battante 75 L/h',
    },
    {
      label: 'Fixation cadre dormant et rigidite',
      val: `Cadre aluminium 35 mm avec ${params.result.bladeCount} lames serties`,
      crit: 'Fixation par chevilles acier espacées de 500 mm max',
    },
  ];

  let curY = tableY + 7;
  rows.forEach((r, idx) => {
    doc.setFillColor(idx % 2 === 0 ? 255 : 248, idx % 2 === 0 ? 255 : 250, idx % 2 === 0 ? 255 : 252);
    doc.rect(14, curY, 182, 6.5, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.line(14, curY + 6.5, 196, curY + 6.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.8);
    doc.setTextColor(30, 41, 59);
    doc.text(r.label, 18, curY + 4.5);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text(r.val, 90, curY + 4.5);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text(r.crit, 140, curY + 4.5);

    curY += 6.5;
  });

  // 5. Compliance Banner & Verdict Card
  const verdictY = curY + 4;
  doc.setDrawColor(...statusColor);
  doc.setFillColor(isOk ? 240 : isWarn ? 254 : 254, isOk ? 253 : isWarn ? 243 : 242, isOk ? 244 : isWarn ? 199 : 242);
  doc.roundedRect(14, verdictY, 182, 34, 1.5, 1.5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(...statusColor);
  doc.text(`VERDICT TECHNIQUE : ${params.result.velocityStatusTitleFr.toUpperCase()}`, 18, verdictY + 6.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.8);
  doc.setTextColor(30, 41, 59);
  let vY = verdictY + 12;
  for (const det of params.result.verdictDetailsFr) {
    doc.text(`• ${det}`, 18, vY);
    vY += 4.5;
  }
  doc.text(`• Protection eau : ${params.result.waterPenetrationVerdictFr}`, 18, vY);

  // 6. Workshop Directives & Installation Rules
  const directY = verdictY + 37;
  doc.setDrawColor(226, 232, 240);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, directY, 182, 30, 1.5, 1.5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(...primaryNavy);
  doc.text('Prescriptions Aerauliques et Directives Chantier (NF DTU 68.3 / Sonelgaz) :', 18, directY + 5.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(71, 85, 105);
  let dY = directY + 10;
  for (const rec of params.result.recommendationsFr) {
    doc.text(`• ${rec}`, 18, dY, { maxWidth: 174 });
    dY += 4.5;
  }

  // 7. Signatures & QR Code
  const signY = directY + 33;
  doc.setDrawColor(203, 213, 225);
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(14, signY, 65, 21, 1.5, 1.5, 'FD');
  doc.roundedRect(131, signY, 65, 21, 1.5, 1.5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(...primaryNavy);
  doc.text('Pour le Concepteur Aeraulique :', 18, signY + 5.5);
  doc.text('Visa Bureau d Etudes / Sonelgaz :', 135, signY + 5.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(100, 116, 139);
  doc.text('Ingenieur CVC Baiti Atelier', 18, signY + 10.5);
  doc.text('Signature & Date :', 18, signY + 16);
  doc.text('Bon pour accord specifications grille', 135, signY + 10.5);
  doc.text('Signature & Date :', 135, signY + 16);

  // QR Code
  try {
    const qrPayload = `BAITI|LOUVER|${params.documentId}|REF=${params.projectRef}|FREE=${params.result.geometricFreeAreaPercent}%|V=${params.result.faceVelocityMPerSec}MS|DP=${params.result.pressureDropPa}PA|STATUS=${isOk ? 'OK' : 'RISK'}`;
    const qrDataUrl = await QRCode.toDataURL(qrPayload, { width: 90, margin: 0 });
    doc.addImage(qrDataUrl, 'PNG', 92, signY + 0.5, 20, 20);
  } catch {
    // Handled
  }

  // 8. Footer
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(6.5);
  doc.setTextColor(148, 163, 184);
  doc.text(
    `Note technique officielle Baiti Atelier • ${params.documentId} • NF EN 13030 • NF DTU 68.3 • CNERIB DTR C3-4 • Prescriptions Sonelgaz`,
    105,
    289,
    { align: 'center' }
  );

  const safeFilename = `Note_Ventelles_Aeraulique_${params.documentId}.pdf`;
  doc.save(safeFilename);
}

export interface SecurityLockingPdfParams {
  documentId: string;
  clientName: string;
  wilayaName: string;
  projectRef: string;
  widthMm: number;
  heightMm: number;
  result: import('./securityLockingManager').SecurityAuditorResult;
  workshopName?: string;
}

/**
 * Generates an official A4 technical specification note for burglary resistance and locking hardware.
 * References: NF EN 1627 a 1630 / NF EN 356 / A2P / NF P20-302.
 * Humanizer invariant: exactly 0 em dashes, 0 en dashes.
 */
export async function generateSecurityLockingPdf(params: SecurityLockingPdfParams): Promise<void> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const primaryNavy: [number, number, number] = [15, 23, 42]; // slate-900
  const emeraldGreen: [number, number, number] = [16, 185, 129];
  const amberOrange: [number, number, number] = [245, 158, 11];
  const roseRed: [number, number, number] = [239, 68, 68];

  const isOk = params.result.overallVerdict === 'favorable';
  const isWarn = params.result.overallVerdict === 'warning';
  const statusColor = isOk ? emeraldGreen : isWarn ? amberOrange : roseRed;

  // 1. Header & Title Block
  doc.setFillColor(...primaryNavy);
  doc.rect(14, 12, 182, 22, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12.5);
  doc.setTextColor(255, 255, 255);
  doc.text('BAITI ATELIER : AUDIT SECURITE ANTI-EFFRACTION', 20, 21);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(203, 213, 225);
  doc.text('Quincaillerie Multipoints, Galets Champignon & Vitrage (NF EN 1627 a 1630 / EN 356)', 20, 27);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(212, 175, 55);
  doc.text(`Doc N: ${params.documentId}`, 150, 21);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(203, 213, 225);
  doc.text(`Date : ${new Date().toLocaleDateString('fr-FR')}`, 150, 27);

  // 2. Project Metadata Card
  doc.setDrawColor(226, 232, 240);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, 38, 182, 20, 1.5, 1.5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(...primaryNavy);
  doc.text('Reference Ouvrage :', 18, 44);
  doc.text('Maitre d Ouvrage / Client :', 18, 50);
  doc.text('Localisation / Wilaya :', 18, 55);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(51, 65, 85);
  doc.text(`${params.projectRef} (${params.widthMm} x ${params.heightMm} mm)`, 60, 44);
  doc.text(`${params.clientName || 'Client Projet'}`, 60, 50);
  doc.text(`${params.wilayaName || 'Alger (16)'}`, 60, 55);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...primaryNavy);
  doc.text('Classe Ciblee :', 115, 44);
  doc.text('Type de Condamnation :', 115, 50);
  doc.text('Vitrage Specifie :', 115, 55);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(51, 65, 85);
  doc.text(`${params.result.classSpec.label}`, 150, 44);
  doc.text(`${params.result.camSpec.nameFr.split('(')[0].trim()}`, 150, 50, { maxWidth: 44 });
  doc.text(`${params.result.input.currentGlazingType}`, 150, 55, { maxWidth: 44 });

  // 3. Technical Parameters Grid
  const gridY = 62;
  const colWidth = 43.5;
  const colGap = 2.6;

  // Box 1: Classe & Resistance
  doc.setDrawColor(203, 213, 225);
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(14, gridY, colWidth, 42, 1.5, 1.5, 'FD');
  doc.setFillColor(241, 245, 249);
  doc.rect(14, gridY, colWidth, 7, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(...primaryNavy);
  doc.text('1. Classe de Securite', 17, gridY + 5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(71, 85, 105);
  doc.text(`Classe : ${params.result.classSpec.label}`, 17, gridY + 12);
  doc.text(`Temps contact : ${params.result.classSpec.resistanceTimeMinutes} min d attaque`, 17, gridY + 18);
  doc.text(`Charge verin : ${params.result.classSpec.staticLoadPerPointDaN} daN/pt`, 17, gridY + 24);
  doc.text(`Espacement max : ${params.result.classSpec.maxLockingSpacingMm} mm`, 17, gridY + 30);
  doc.text(`Poignee a cle : ${params.result.classSpec.handleLockTorqueNm} Nm min`, 17, gridY + 36);

  // Box 2: Points de Condamnation
  const b2X = 14 + colWidth + colGap;
  doc.roundedRect(b2X, gridY, colWidth, 42, 1.5, 1.5, 'FD');
  doc.setFillColor(241, 245, 249);
  doc.rect(b2X, gridY, colWidth, 7, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(...primaryNavy);
  doc.text('2. Points de Condamnation', b2X + 3, gridY + 5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(71, 85, 105);
  doc.text(`Points installes : ${params.result.effectiveLockingPoints}`, b2X + 3, gridY + 12);
  doc.text(`Minimum requis : ${params.result.recommendedMinLockingPoints} points`, b2X + 3, gridY + 18);
  doc.text(`Espacement reel : ${params.result.actualSpacingMm} mm`, b2X + 3, gridY + 24);
  doc.text(`Renvois d angle : ${params.result.cornerDrivesCount} compas/angles`, b2X + 3, gridY + 30);
  doc.text(`Perimetre ouvrant : ${params.result.perimeterMm} mm`, b2X + 3, gridY + 36);

  // Box 3: Quincaillerie & Force
  const b3X = b2X + colWidth + colGap;
  doc.roundedRect(b3X, gridY, colWidth, 42, 1.5, 1.5, 'FD');
  doc.setFillColor(241, 245, 249);
  doc.rect(b3X, gridY, colWidth, 7, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(...primaryNavy);
  doc.text('3. Resistance Mecanique', b3X + 3, gridY + 5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(71, 85, 105);
  doc.text(`Type galet : ${params.result.camSpec.nameFr.split('(')[0].trim()}`, b3X + 3, gridY + 12, { maxWidth: 39 });
  doc.text(`Cisaillement : ${params.result.camSpec.shearStrengthDaN} daN/pt`, b3X + 3, gridY + 18);
  doc.text(`Force globale : ${params.result.totalResistingForceDaN} daN`, b3X + 3, gridY + 24);
  doc.text(`Force requise : ${params.result.requiredClassForceDaN} daN`, b3X + 3, gridY + 30);
  doc.text(`Poignee a cle : ${params.result.input.hasLockingHandleKey ? 'Conforme 100Nm' : 'Absente'}`, b3X + 3, gridY + 36);

  // Box 4: Vitrage de Securite
  const b4X = b3X + colWidth + colGap;
  doc.roundedRect(b4X, gridY, colWidth, 42, 1.5, 1.5, 'FD');
  doc.setFillColor(241, 245, 249);
  doc.rect(b4X, gridY, colWidth, 7, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(...primaryNavy);
  doc.text('4. Vitrage NF EN 356', b4X + 3, gridY + 5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(71, 85, 105);
  doc.text(`Exigence : ${params.result.classSpec.mandatoryGlazingEn356.split('(')[0].trim()}`, b4X + 3, gridY + 12, { maxWidth: 39 });
  doc.text(`Verre actuel : ${params.result.input.currentGlazingType}`, b4X + 3, gridY + 18, { maxWidth: 39 });
  doc.text(`Harmonisation : ${params.result.isGlazingAligned ? 'Conforme' : 'Non Conforme'}`, b4X + 3, gridY + 24);
  doc.text(`Plaque percage : ${params.result.input.hasAntiDrillPlate ? 'Installee' : 'Non installee'}`, b4X + 3, gridY + 30);
  doc.text(`Calage feuillure : Incompressible`, b4X + 3, gridY + 36);

  // 4. Detailed Security Table
  const tableY = 109;
  doc.setFillColor(...primaryNavy);
  doc.rect(14, tableY, 182, 7, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(255, 255, 255);
  doc.text('PARAMETRE DE SECURITE / NORME', 18, tableY + 5);
  doc.text('CONFIGURATION REELLE', 90, tableY + 5);
  doc.text('PRESCRIPTION CLASSE ' + params.result.classSpec.label, 140, tableY + 5);

  const rows = [
    {
      label: 'Nombre et espacement des pênes / galets',
      val: `${params.result.effectiveLockingPoints} points (espacement ${params.result.actualSpacingMm} mm)`,
      crit: `Espacement max ${params.result.classSpec.maxLockingSpacingMm} mm sur 4 cotes`,
    },
    {
      label: 'Geometrie des gaches et galets de fermeture',
      val: `${params.result.camSpec.nameFr}`,
      crit: 'Galets champignon ou pênes crochets anti-degondage',
    },
    {
      label: 'Effort statique de poussee admissible',
      val: `${params.result.totalResistingForceDaN} daN resistance calculee`,
      crit: `Minimum requis : ${params.result.requiredClassForceDaN} daN sous verin d essai`,
    },
    {
      label: 'Poignee de manoeuvre a cle ou bouton secable',
      val: params.result.input.hasLockingHandleKey ? 'Poignee a cle certifiee 100 Nm' : 'Poignee standard non verrouillable',
      crit: 'Obligatoire en RC2/RC3 pour eviter manipulation externe',
    },
    {
      label: 'Vitrage de protection a l attaque manuelle',
      val: `${params.result.input.currentGlazingType}`,
      crit: `${params.result.classSpec.mandatoryGlazingEn356}`,
    },
  ];

  let curY = tableY + 7;
  rows.forEach((r, idx) => {
    doc.setFillColor(idx % 2 === 0 ? 255 : 248, idx % 2 === 0 ? 255 : 250, idx % 2 === 0 ? 255 : 252);
    doc.rect(14, curY, 182, 6.5, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.line(14, curY + 6.5, 196, curY + 6.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.8);
    doc.setTextColor(30, 41, 59);
    doc.text(r.label, 18, curY + 4.5);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text(r.val, 90, curY + 4.5);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text(r.crit, 140, curY + 4.5);

    curY += 6.5;
  });

  // 5. Compliance Banner & Verdict Card
  const verdictY = curY + 4;
  doc.setDrawColor(...statusColor);
  doc.setFillColor(isOk ? 240 : isWarn ? 254 : 254, isOk ? 253 : isWarn ? 243 : 242, isOk ? 244 : isWarn ? 199 : 242);
  doc.roundedRect(14, verdictY, 182, 34, 1.5, 1.5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(...statusColor);
  doc.text(`VERDICT TECHNIQUE : ${params.result.verdictTitleFr.toUpperCase()}`, 18, verdictY + 6.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.8);
  doc.setTextColor(30, 41, 59);
  let vY = verdictY + 12;
  if (params.result.complianceDefectsFr.length > 0) {
    for (const def of params.result.complianceDefectsFr) {
      doc.text(`• ${def}`, 18, vY);
      vY += 4.5;
    }
  } else {
    doc.text('• Tous les criteres d espacement, de resistance mecanique et d equipement de securite sont satisfaits.', 18, vY);
    vY += 4.5;
    doc.text('• Menuiserie apte a resister a une tentative d effraction selon les conditions d essai NF EN 1627.', 18, vY);
    vY += 4.5;
  }
  doc.text(`• Vitrage : ${params.result.glazingMatchVerdictFr}`, 18, vY);

  // 6. Workshop Directives & Installation Rules
  const directY = verdictY + 37;
  doc.setDrawColor(226, 232, 240);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, directY, 182, 30, 1.5, 1.5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(...primaryNavy);
  doc.text('Directives d Assemblage et Pose Anti-Effraction (NF DTU 36.5 / A2P) :', 18, directY + 5.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(71, 85, 105);
  let dY = directY + 10;
  for (const rec of params.result.recommendationsFr) {
    doc.text(`• ${rec}`, 18, dY, { maxWidth: 174 });
    dY += 4.5;
  }

  // 7. Signatures & QR Code
  const signY = directY + 33;
  doc.setDrawColor(203, 213, 225);
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(14, signY, 65, 21, 1.5, 1.5, 'FD');
  doc.roundedRect(131, signY, 65, 21, 1.5, 1.5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(...primaryNavy);
  doc.text('Pour le Fabricant Menuisier :', 18, signY + 5.5);
  doc.text('Visa Client / Assureur :', 135, signY + 5.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(100, 116, 139);
  doc.text('Atelier de fabrication Baiti Atelier', 18, signY + 10.5);
  doc.text('Signature & Date :', 18, signY + 16);
  doc.text('Bon pour accord quincaillerie securite', 135, signY + 10.5);
  doc.text('Signature & Date :', 135, signY + 16);

  // QR Code
  try {
    const qrPayload = `BAITI|SECURITY|${params.documentId}|REF=${params.projectRef}|CLASS=${params.result.classSpec.label}|POINTS=${params.result.effectiveLockingPoints}|FORCE=${params.result.totalResistingForceDaN}DAN|STATUS=${isOk ? 'OK' : 'RISK'}`;
    const qrDataUrl = await QRCode.toDataURL(qrPayload, { width: 90, margin: 0 });
    doc.addImage(qrDataUrl, 'PNG', 92, signY + 0.5, 20, 20);
  } catch {
    // Handled
  }

  // 8. Footer
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(6.5);
  doc.setTextColor(148, 163, 184);
  doc.text(
    `Note technique officielle Baiti Atelier • ${params.documentId} • NF EN 1627 a 1630 • NF EN 356 • NF DTU 36.5 • Certification A2P`,
    105,
    289,
    { align: 'center' }
  );

  const safeFilename = `Note_Securite_Effraction_${params.documentId}.pdf`;
  doc.save(safeFilename);
}

export interface StructuralGlazingPdfParams {
  documentId: string;
  clientName: string;
  wilayaName: string;
  projectRef: string;
  widthMm: number;
  heightMm: number;
  result: import('./structuralGlazingManager').StructuralGlazingResult;
  workshopName?: string;
}

/**
 * Generates an official A4 technical specification note for structural silicone glazing (VEC / VEP).
 * References: NF DTU 39 P4 / EOTA ETAG 002 / ASTM C1401 / DTR BC 2-47.
 * Humanizer invariant: exactly 0 em dashes, 0 en dashes.
 */
export async function generateStructuralGlazingPdf(params: StructuralGlazingPdfParams): Promise<void> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const primaryNavy: [number, number, number] = [15, 23, 42]; // slate-900
  const emeraldGreen: [number, number, number] = [16, 185, 129];
  const amberOrange: [number, number, number] = [245, 158, 11];
  const roseRed: [number, number, number] = [239, 68, 68];

  const isOk = params.result.overallVerdict === 'favorable';
  const isWarn = params.result.overallVerdict === 'warning';
  const statusColor = isOk ? emeraldGreen : isWarn ? amberOrange : roseRed;

  // 1. Header & Title Block
  doc.setFillColor(...primaryNavy);
  doc.rect(14, 12, 182, 22, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12.5);
  doc.setTextColor(255, 255, 255);
  doc.text('BAITI ATELIER : NOTE TECHNIQUE VITRAGE VEC / VEP', 20, 21);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(203, 213, 225);
  doc.text('Dimensionnement Joint Silicone Structural & Contraintes (NF DTU 39 P4 / ETAG 002)', 20, 27);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(212, 175, 55);
  doc.text(`Doc N: ${params.documentId}`, 150, 21);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(203, 213, 225);
  doc.text(`Date : ${new Date().toLocaleDateString('fr-FR')}`, 150, 27);

  // 2. Project Metadata Card
  doc.setDrawColor(226, 232, 240);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, 38, 182, 20, 1.5, 1.5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(...primaryNavy);
  doc.text('Reference Ouvrage :', 18, 44);
  doc.text('Maitre d Ouvrage / Client :', 18, 50);
  doc.text('Localisation / Wilaya :', 18, 55);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(51, 65, 85);
  doc.text(`${params.projectRef} (${params.widthMm} x ${params.heightMm} mm)`, 60, 44);
  doc.text(`${params.clientName || 'Client Façade'}`, 60, 50);
  doc.text(`${params.wilayaName || 'Alger (16)'}`, 60, 55);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...primaryNavy);
  doc.text('Systeme de Collage :', 115, 44);
  doc.text('Mastic Structural :', 115, 50);
  doc.text('Pression de Vent :', 115, 55);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(51, 65, 85);
  doc.text(`${params.result.systemSpec.nameFr.split('(')[0].trim()}`, 148, 44, { maxWidth: 44 });
  doc.text(`${params.result.sealantSpec.nameFr.split('(')[0].trim()}`, 148, 50, { maxWidth: 44 });
  doc.text(`${params.result.input.windPressurePa} Pa (RNV 2013)`, 148, 55);

  // 3. Technical Parameters Grid
  const gridY = 62;
  const colWidth = 43.5;
  const colGap = 2.6;

  // Box 1: Geometrie & Verre
  doc.setDrawColor(203, 213, 225);
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(14, gridY, colWidth, 42, 1.5, 1.5, 'FD');
  doc.setFillColor(241, 245, 249);
  doc.rect(14, gridY, colWidth, 7, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(...primaryNavy);
  doc.text('1. Geometrie Panneau', 17, gridY + 5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(71, 85, 105);
  doc.text(`Surface verre : ${params.result.panelAreaM2.toFixed(3)} m2`, 17, gridY + 12);
  doc.text(`Poids verre : ${params.result.glassWeightKg} kg`, 17, gridY + 18);
  doc.text(`Petit cote a : ${params.result.shortSideMm} mm`, 17, gridY + 24);
  doc.text(`Grand cote b : ${params.result.longSideMm} mm`, 17, gridY + 30);
  doc.text(`Perimetre colle : ${params.result.perimeterMm} mm`, 17, gridY + 36);

  // Box 2: Bite Structural
  const b2X = 14 + colWidth + colGap;
  doc.roundedRect(b2X, gridY, colWidth, 42, 1.5, 1.5, 'FD');
  doc.setFillColor(241, 245, 249);
  doc.rect(b2X, gridY, colWidth, 7, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(...primaryNavy);
  doc.text('2. Bite Structural hc', b2X + 3, gridY + 5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(71, 85, 105);
  doc.text(`Bite calcule : ${params.result.calculatedBiteMm} mm`, b2X + 3, gridY + 12);
  doc.text(`Bite recommande : ${params.result.recommendedBiteMm} mm`, b2X + 3, gridY + 18);
  doc.text(`Minimum norme : ${params.result.minNormativeBiteMm} mm`, b2X + 3, gridY + 24);
  doc.text(`Sigma dyn admissible : 0.14 MPa`, b2X + 3, gridY + 30);
  doc.text(`Statut bite : ${params.result.isBiteSufficient ? 'Conforme ETAG' : 'Insuffisant'}`, b2X + 3, gridY + 36);

  // Box 3: Epaisseur Joint e
  const b3X = b2X + colWidth + colGap;
  doc.roundedRect(b3X, gridY, colWidth, 42, 1.5, 1.5, 'FD');
  doc.setFillColor(241, 245, 249);
  doc.rect(b3X, gridY, colWidth, 7, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(...primaryNavy);
  doc.text('3. Epaisseur Joint e', b3X + 3, gridY + 5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(71, 85, 105);
  doc.text(`Delta L thermique : ${params.result.calculatedDifferentialExpansionMm} mm`, b3X + 3, gridY + 12);
  doc.text(`Epaisseur calc. : ${params.result.calculatedGluelineThicknessMm} mm`, b3X + 3, gridY + 18);
  doc.text(`Epaisseur reco. : ${params.result.recommendedGluelineThicknessMm} mm`, b3X + 3, gridY + 24);
  doc.text(`Ratio hc / e : ${params.result.jointAspectRatio}`, b3X + 3, gridY + 30);
  doc.text(`Optimal ratio : [1.0 a 3.0]`, b3X + 3, gridY + 36);

  // Box 4: Securite & Mastic
  const b4X = b3X + colWidth + colGap;
  doc.roundedRect(b4X, gridY, colWidth, 42, 1.5, 1.5, 'FD');
  doc.setFillColor(241, 245, 249);
  doc.rect(b4X, gridY, colWidth, 7, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(...primaryNavy);
  doc.text('4. Securite & Mastic', b4X + 3, gridY + 5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(71, 85, 105);
  doc.text(`Tau poids propre : ${params.result.deadLoadStressMpa} MPa`, b4X + 3, gridY + 12);
  doc.text(`Tau admissible : ${params.result.allowableDeadLoadStressMpa} MPa`, b4X + 3, gridY + 18);
  doc.text(`Pattes de securite : ${params.result.minSafetyClipsCount} pattes`, b4X + 3, gridY + 24);
  doc.text(`Volume mastic : ${params.result.sealantVolumeLiters} L`, b4X + 3, gridY + 30);
  doc.text(`Poches 600 ml : ${params.result.sausage600mlPacksRequired} unites`, b4X + 3, gridY + 36);

  // 4. Detailed Joint Sizing Table
  const tableY = 109;
  doc.setFillColor(...primaryNavy);
  doc.rect(14, tableY, 182, 7, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(255, 255, 255);
  doc.text('PARAMETRE VEC / NORME ETAG 002', 18, tableY + 5);
  doc.text('VALEUR CALCULEE', 90, tableY + 5);
  doc.text('CRITERE / SEUIL NORMATIF', 140, tableY + 5);

  const rows = [
    {
      label: 'Hauteur de contact de collage (Bite hc)',
      val: `${params.result.recommendedBiteMm} mm (calcul dynamique ${params.result.calculatedBiteMm} mm)`,
      crit: `Minimum ${params.result.minNormativeBiteMm} mm sous vent ${params.result.input.windPressurePa} Pa`,
    },
    {
      label: 'Epaisseur du joint de colle (Glueline e)',
      val: `${params.result.recommendedGluelineThicknessMm} mm (Delta L = ${params.result.calculatedDifferentialExpansionMm} mm)`,
      crit: 'Minimum 6 mm (capacite de cisaillement 15%)',
    },
    {
      label: 'Ratio de forme geometrique du joint (hc / e)',
      val: `Ratio = ${params.result.jointAspectRatio}`,
      crit: 'Plage recommandee : 1.0 <= hc/e <= 3.0',
    },
    {
      label: 'Contrainte permanente sous poids propre (tau_dead)',
      val: `${params.result.deadLoadStressMpa} MPa`,
      crit: `Plafond ETAG 002 : ${params.result.allowableDeadLoadStressMpa} MPa`,
    },
    {
      label: 'Dispositif mecanique anti-chute de securite',
      val: `${params.result.minSafetyClipsCount} pattes inox laterales`,
      crit: 'Obligatoire DTU 39 P4 au-dela de 2 etages',
    },
  ];

  let curY = tableY + 7;
  rows.forEach((r, idx) => {
    doc.setFillColor(idx % 2 === 0 ? 255 : 248, idx % 2 === 0 ? 255 : 250, idx % 2 === 0 ? 255 : 252);
    doc.rect(14, curY, 182, 6.5, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.line(14, curY + 6.5, 196, curY + 6.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.8);
    doc.setTextColor(30, 41, 59);
    doc.text(r.label, 18, curY + 4.5);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text(r.val, 90, curY + 4.5);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text(r.crit, 140, curY + 4.5);

    curY += 6.5;
  });

  // 5. Compliance Banner & Verdict Card
  const verdictY = curY + 4;
  doc.setDrawColor(...statusColor);
  doc.setFillColor(isOk ? 240 : isWarn ? 254 : 254, isOk ? 253 : isWarn ? 243 : 242, isOk ? 244 : isWarn ? 199 : 242);
  doc.roundedRect(14, verdictY, 182, 34, 1.5, 1.5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(...statusColor);
  doc.text(`VERDICT TECHNIQUE : ${params.result.verdictTitleFr.toUpperCase()}`, 18, verdictY + 6.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.8);
  doc.setTextColor(30, 41, 59);
  let vY = verdictY + 12;
  for (const det of params.result.verdictDetailsFr) {
    doc.text(`• ${det}`, 18, vY);
    vY += 4.5;
  }

  // 6. Workshop Directives & Quality Control
  const directY = verdictY + 37;
  doc.setDrawColor(226, 232, 240);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, directY, 182, 30, 1.5, 1.5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(...primaryNavy);
  doc.text('Prescriptions Atelier et Controle Qualite VEC (NF DTU 39 P4 / ETAG 002) :', 18, directY + 5.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(71, 85, 105);
  let dY = directY + 10;
  for (const rec of params.result.recommendationsFr) {
    doc.text(`• ${rec}`, 18, dY, { maxWidth: 174 });
    dY += 4.5;
  }

  // 7. Signatures & QR Code
  const signY = directY + 33;
  doc.setDrawColor(203, 213, 225);
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(14, signY, 65, 21, 1.5, 1.5, 'FD');
  doc.roundedRect(131, signY, 65, 21, 1.5, 1.5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(...primaryNavy);
  doc.text('Pour le Facadier / Applicateur VEC :', 18, signY + 5.5);
  doc.text('Visa Controle Technique CTC / Bureau d Etudes :', 135, signY + 5.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(100, 116, 139);
  doc.text('Ingenieur facade Baiti Atelier', 18, signY + 10.5);
  doc.text('Signature & Date :', 18, signY + 16);
  doc.text('Bon pour accord note de calcul VEC', 135, signY + 10.5);
  doc.text('Signature & Date :', 135, signY + 16);

  // QR Code
  try {
    const qrPayload = `BAITI|VEC|${params.documentId}|REF=${params.projectRef}|BITE=${params.result.recommendedBiteMm}MM|GLUELINE=${params.result.recommendedGluelineThicknessMm}MM|WIND=${params.result.input.windPressurePa}PA|STATUS=${isOk ? 'OK' : 'RISK'}`;
    const qrDataUrl = await QRCode.toDataURL(qrPayload, { width: 90, margin: 0 });
    doc.addImage(qrDataUrl, 'PNG', 92, signY + 0.5, 20, 20);
  } catch {
    // Handled
  }

  // 8. Footer
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(6.5);
  doc.setTextColor(148, 163, 184);
  doc.text(
    `Note technique officielle Baiti Atelier • ${params.documentId} • NF DTU 39 P4 • EOTA ETAG 002 • ASTM C1401 • DTR BC 2-47 RNV 2013`,
    105,
    289,
    { align: 'center' }
  );

  const safeFilename = `Note_Calcul_VEC_${params.documentId}.pdf`;
  doc.save(safeFilename);
}

export interface IntegratedBlindPdfParams {
  documentId: string;
  projectRef: string;
  clientName: string;
  wilayaName: string;
  workshopName: string;
  result: import('./integratedBlindManager').IntegratedBlindResult;
}

export async function generateIntegratedBlindNoticePdf(params: IntegratedBlindPdfParams): Promise<void> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const todayStr = new Date().toLocaleDateString('fr-DZ', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  const res = params.result;
  const isOk = res.complianceStatus === 'CONFORME';
  const isWarning = res.complianceStatus === 'ATTENTION';

  // 1. Header Banner
  doc.setFillColor(15, 23, 42); // Slate 900
  doc.rect(0, 0, 210, 26, 'F');

  doc.setFillColor(13, 148, 136); // Teal 600 accent bar
  doc.rect(0, 26, 210, 2, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(255, 255, 255);
  doc.text('BAITI ATELIER ALGERIE', 14, 11);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(203, 213, 225);
  doc.text('Plateforme Technique de Conception & Fabrication Menuiserie Aluminium & Vitrage Isolant', 14, 17);
  doc.text('Normes : NF EN 1279-1 a 6 • NF DTU 39 P1-1 • Cahier CSTB 3677 • NF EN 13363-1 • DTR C3-2', 14, 22);

  // Status Badge in Header
  doc.setFillColor(isOk ? 16 : isWarning ? 217 : 225, isOk ? 185 : isWarning ? 119 : 29, isOk ? 129 : isWarning ? 6 : 72);
  doc.roundedRect(148, 7, 48, 12, 2, 2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.text(isOk ? 'STORE CONFORME' : isWarning ? 'AVEC RESERVES' : 'NON CONFORME', 172, 14.5, { align: 'center' });

  // 2. Document Title Box
  let curY = 33;
  doc.setDrawColor(226, 232, 240);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, curY, 182, 18, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(15, 23, 42);
  doc.text('FICHE TECHNIQUE & COMMANDE : STORE INTEGRE DANS DOUBLE VITRAGE', 18, curY + 6.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text(`Doc N° : ${params.documentId}  |  Chantier : ${params.projectRef}  |  Wilaya : ${params.wilayaName}  |  Date : ${todayStr}`, 18, curY + 13);

  curY += 22;

  // 3. Identification & Actuation Table
  autoTable(doc, {
    startY: curY,
    head: [['PARAMETRE DU STORE', 'VALEUR RETENUE', 'SPECIFICATION & NORME']],
    body: [
      ['Modele de store integre', res.blindSpec.name, res.blindSpec.slatMaterial],
      ['Mode de manœuvre', res.actuationSpec.name, res.actuationSpec.powerSupply],
      ['Dimensions de la baie', `${res.widthMm} x ${res.heightMm} mm`, `Surface : ${res.surfaceAreaM2.toFixed(3)} m2`],
      ['Position / Orientation', 'Lamelles orientables & relevables', 'Reglage manuel ou telecommande'],
      ['Poids du mecanisme store', `${res.blindMechanismWeightKg.toFixed(1)} kg`, 'Mecanisme et lamelles suspendues'],
      ['Poids total du vitrage', `${res.totalWeightKg.toFixed(1)} kg`, `Verre + store (${(res.totalWeightKg / res.surfaceAreaM2).toFixed(1)} kg/m2)`],
    ],
    theme: 'grid',
    headStyles: { fillColor: [13, 148, 136], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 7.5 },
    styles: { fontSize: 7, cellPadding: 2, textColor: [15, 23, 42] },
    columnStyles: {
      0: { cellWidth: 55, fontStyle: 'bold' },
      1: { cellWidth: 55 },
      2: { cellWidth: 72, textColor: [71, 85, 105] },
    },
    margin: { left: 14, right: 14 },
  });

  curY = (doc as any).lastAutoTable.finalY + 5;

  // 4. Glazing Makeup & Cavity Table
  autoTable(doc, {
    startY: curY,
    head: [['COMPOSITION DU VITRAGE ISOLANT', 'DIMENSION', 'EXIGENCE TECHNIQUE']],
    body: [
      ['Epaisseur totale du vitrage', `${res.totalIguThicknessMm} mm`, 'A verifier avec profondeur de parclose profil'],
      ['Largeur de la cavite gaz', `${res.cavityWidthMm} mm`, `Requis min : ${res.minRecommendedCavityMm} mm (${res.isCavitySufficient ? 'CONFORME' : 'INSUFFISANT'})`],
      ['Jeu lateral lamelle / verre', `${res.slatClearanceFrontMm} mm de chaque cote`, 'Jeu minimal de securite anti-frottement (>= 3.0 mm)'],
      ['Encombrement paquet replie', `${res.stackHeightMm} mm en imposte`, 'Hauteur du rail et lamelles en position haute'],
      ['Remplissage gaz isolant', 'Argon 90% certifie', 'Taux de fuite NF EN 1279-3 <= 1.0 % par an'],
      ['Intercalaire thermique', 'Warm Edge composite noir', 'Rupture de pont thermique de bordure'],
    ],
    theme: 'grid',
    headStyles: { fillColor: [30, 41, 59], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 7.5 },
    styles: { fontSize: 7, cellPadding: 2, textColor: [15, 23, 42] },
    columnStyles: {
      0: { cellWidth: 55, fontStyle: 'bold' },
      1: { cellWidth: 55 },
      2: { cellWidth: 72, textColor: [71, 85, 105] },
    },
    margin: { left: 14, right: 14 },
  });

  curY = (doc as any).lastAutoTable.finalY + 5;

  // 5. Energetics & Thermal Table
  autoTable(doc, {
    startY: curY,
    head: [['PERFORMANCE ENERGETIQUE & SOLAIRE', 'VALEUR CALCULEE', 'GAIN & CONFORT CONSTATE']],
    body: [
      ['Facteur solaire global gtot', `${res.effectiveGtot.toFixed(2)}`, `Reduction de chaleur : ${res.solarHeatReductionPercent}%`],
      ['Coefficient transmission Ug', `${res.effectiveUg.toFixed(2)} W/(m2.K)`, `Base vitrage clair : ${res.baseGlassUg.toFixed(2)} W/(m2.K)`],
      ['Transmission lumineuse Tau_v', `${(res.lightTransmittanceTauV * 100).toFixed(0)} %`, 'Filtrage anti-eblouissement selon orientation'],
      ['Indice de confort d ete', res.summerComfortRating, 'Conforme aux exigences de la reglementation DTR C3-2'],
    ],
    theme: 'grid',
    headStyles: { fillColor: [180, 83, 9], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 7.5 },
    styles: { fontSize: 7, cellPadding: 2, textColor: [15, 23, 42] },
    columnStyles: {
      0: { cellWidth: 55, fontStyle: 'bold' },
      1: { cellWidth: 55 },
      2: { cellWidth: 72, textColor: [71, 85, 105] },
    },
    margin: { left: 14, right: 14 },
  });

  curY = (doc as any).lastAutoTable.finalY + 5;

  // 6. Altitude & Barometric Safety Box
  doc.setDrawColor(res.requiresAltimetricValve ? 217 : 203, res.requiresAltimetricValve ? 119 : 213, res.requiresAltimetricValve ? 6 : 225);
  doc.setFillColor(res.requiresAltimetricValve ? 254 : 248, res.requiresAltimetricValve ? 242 : 250, res.requiresAltimetricValve ? 242 : 252);
  doc.roundedRect(14, curY, 182, 16, 1.5, 1.5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(res.requiresAltimetricValve ? 185 : 15, res.requiresAltimetricValve ? 28 : 23, res.requiresAltimetricValve ? 28 : 42);
  doc.text('SECURITE BAROMETRIQUE & TRANSPORT EN ALTITUDE (CSTB / ALUPROM) :', 18, curY + 5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.8);
  doc.setTextColor(71, 85, 105);
  doc.text(
    `Altitude chantier : ${res.altitudeDifferenceM >= 0 ? '+' : ''}${res.altitudeDifferenceM} m (ecart) • Delta P : ${res.estimatedPressureDeltaHPa} hPa • Fleche bombe : ${res.glassOutwardDeflectionMm} mm`,
    18,
    curY + 9.5
  );
  doc.text(res.altimetricSafetyAdvice, 18, curY + 13.5);

  curY += 20;

  // 7. Recommendations & Compliance Directives
  if (res.recommendations.length > 0) {
    doc.setDrawColor(226, 232, 240);
    doc.setFillColor(255, 255, 255);
    const boxHeight = Math.min(22, 6 + res.recommendations.length * 3.5);
    doc.roundedRect(14, curY, 182, boxHeight, 1.5, 1.5, 'D');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.2);
    doc.setTextColor(15, 23, 42);
    doc.text('RECOMMANDATIONS PARTICULIERES DE MIROITERIE & COMMANDE :', 18, curY + 4.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(71, 85, 105);
    res.recommendations.slice(0, 4).forEach((rec, idx) => {
      doc.text(`• ${rec}`, 20, curY + 8.5 + idx * 3.8);
    });

    curY += boxHeight + 4;
  }

  // 8. Signature Block
  const signY = Math.min(curY, 258);
  doc.setDrawColor(203, 213, 225);
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(14, signY, 70, 22, 1.5, 1.5, 'D');
  doc.roundedRect(126, signY, 70, 22, 1.5, 1.5, 'D');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(15, 23, 42);
  doc.text('Visa Responsable Miroiterie', 18, signY + 5.5);
  doc.text('Bon pour Commande Vitrage & Store', 130, signY + 5.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(100, 116, 139);
  doc.text('Date & Cachet Atelier :', 18, signY + 11);
  doc.text('Signature Client / Poseur :', 130, signY + 11);

  // QR Code
  try {
    const qrPayload = `BAITI|STORE_INTEGRE|${params.documentId}|REF=${params.projectRef}|TYPE=${res.blindSpec.id}|CAV=${res.cavityWidthMm}MM|GTOT=${res.effectiveGtot}|STATUS=${isOk ? 'OK' : 'RISK'}`;
    const qrDataUrl = await QRCode.toDataURL(qrPayload, { width: 90, margin: 0 });
    doc.addImage(qrDataUrl, 'PNG', 92, signY + 1, 20, 20);
  } catch {
    // Handled
  }

  // 9. Footer
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(6.5);
  doc.setTextColor(148, 163, 184);
  doc.text(
    `Fiche technique officielle Baiti Atelier • ${params.documentId} • NF EN 1279 • NF DTU 39 P1-1 • Cahier CSTB 3677 • DTR C3-2`,
    105,
    289,
    { align: 'center' }
  );

  const safeFilename = `Fiche_Store_Integre_${params.documentId}.pdf`;
  doc.save(safeFilename);
}

export interface WindowDrainagePdfParams {
  documentId: string;
  projectRef: string;
  clientName: string;
  wilayaName: string;
  workshopName: string;
  result: import('./windowDrainageManager').WindowDrainageResult;
}

export async function generateWindowDrainageNoticePdf(params: WindowDrainagePdfParams): Promise<void> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const todayStr = new Date().toLocaleDateString('fr-DZ', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  const res = params.result;
  const isOk = res.complianceStatus === 'CONFORME';
  const isWarning = res.complianceStatus === 'ATTENTION';

  // 1. Header Banner
  doc.setFillColor(15, 23, 42); // Slate 900
  doc.rect(0, 0, 210, 26, 'F');

  doc.setFillColor(2, 132, 199); // Sky 600 accent bar
  doc.rect(0, 26, 210, 2, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(255, 255, 255);
  doc.text('BAITI ATELIER ALGERIE', 14, 11);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(203, 213, 225);
  doc.text('Bureau d Etudes Menuiserie Aluminium & PVC • Plan d Usinage et Note Hydrostatique', 14, 17);
  doc.text('Normes : NF DTU 36.5 P1-1 • NF P 20-302 • NF EN 1027 • NF EN 12208 • CSTB 3529 • RNV 2013', 14, 22);

  // Status Badge in Header
  doc.setFillColor(isOk ? 16 : isWarning ? 217 : 225, isOk ? 185 : isWarning ? 119 : 29, isOk ? 129 : isWarning ? 6 : 72);
  doc.roundedRect(146, 7, 50, 12, 2, 2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.text(isOk ? 'DRAINAGE CONFORME' : isWarning ? 'AVEC RESERVES' : 'NON CONFORME', 171, 14.5, { align: 'center' });

  // 2. Document Title Box
  let curY = 33;
  doc.setDrawColor(226, 232, 240);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, curY, 182, 18, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(15, 23, 42);
  doc.text('PLAN D USINAGE & NOTE TECHNIQUE : DRAINAGE & ETANCHEITE A L EAU', 18, curY + 6.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text(`Doc N° : ${params.documentId}  |  Chantier : ${params.projectRef}  |  Wilaya : ${params.wilayaName}  |  Date : ${todayStr}`, 18, curY + 13);

  curY += 22;

  // 3. Identification & Water Tightness Table
  autoTable(doc, {
    startY: curY,
    head: [['PARAMETRE D ETANCHEITE', 'VALEUR RETENUE', 'EXIGENCE NORMATIVE']],
    body: [
      ['Dimensions de la traverse basse', `${res.widthMm} x ${res.heightMm} mm`, `Surface vitree : ${res.glazingAreaM2.toFixed(3)} m2`],
      ['Classe d etancheite a l eau', res.targetClassSpec.name, `Pression d essai : ${res.testPressurePa} Pa`],
      ['Vitesse de vent equivalente', `${res.targetClassSpec.equivalentWindSpeedKmH} km/h`, 'Essai sous pluie battante continue'],
      ['Colonne d eau hydrostatique', `${res.hydrostaticHeadMm} mm`, 'Poussee d eau inversee dans la feuillure'],
      ['Hauteur de remontee / gorge', `${res.upstandHeightMm} mm`, `Marge de garde : ${res.upstandSafetyMarginMm} mm (${res.isUpstandSufficient ? 'SUFFISANT' : 'CRITIQUE'})`],
      ['Debit d evacuation global', `${res.totalDischargeCapacityLMin} L/min`, `Facteur de securite hydraulique : ${res.hydraulicSafetyFactor}`],
    ],
    theme: 'grid',
    headStyles: { fillColor: [2, 132, 199], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 7.5 },
    styles: { fontSize: 7, cellPadding: 2, textColor: [15, 23, 42] },
    columnStyles: {
      0: { cellWidth: 55, fontStyle: 'bold' },
      1: { cellWidth: 55 },
      2: { cellWidth: 72, textColor: [71, 85, 105] },
    },
    margin: { left: 14, right: 14 },
  });

  curY = (doc as any).lastAutoTable.finalY + 5;

  // 4. Weep Hole Sizing & Machining Specs Table
  autoTable(doc, {
    startY: curY,
    head: [['SPECIFICATION D USINAGE', 'VALEUR ATELIER', 'CONFORMITE NF DTU 36.5']],
    body: [
      ['Geometrie de la lumiere', res.slotSpec.name, `Dimensions : ${res.slotSpec.widthMm} x ${res.slotSpec.heightMm} mm`],
      ['Section unitaire de passage', `${res.slotSpec.slotAreaMm2.toFixed(1)} mm2`, `Minimum exige : 50.0 mm2 (${res.isSectionAreaCompliant ? 'CONFORME' : 'INSUFFISANT'})`],
      ['Nombre d orifices de drainage', `${res.actualHolesCount} trou(s)`, `Minimum requis : ${res.minimumRequiredHoles} trou(s) (${res.isHolesCountCompliant ? 'CONFORME' : 'NON CONFORME'})`],
      ['Entraxe reel entre lumieres', `${res.actualSpacingMm} mm`, `Entraxe maximal autorise : ${res.maxSpacingMm} mm (${res.isSpacingCompliant ? 'CONFORME' : 'EXCESSIF'})`],
      ['Events de decompression hauts', `${res.decompressionVentsCount} events obligatoires`, 'Evite l effet ventouse / retention d eau'],
      ['Mode d usinage conseille', res.slotSpec.recommendedMachining, 'Fraise carbure sur centre CNC ou poinçonneuse'],
    ],
    theme: 'grid',
    headStyles: { fillColor: [30, 41, 59], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 7.5 },
    styles: { fontSize: 7, cellPadding: 2, textColor: [15, 23, 42] },
    columnStyles: {
      0: { cellWidth: 55, fontStyle: 'bold' },
      1: { cellWidth: 55 },
      2: { cellWidth: 72, textColor: [71, 85, 105] },
    },
    margin: { left: 14, right: 14 },
  });

  curY = (doc as any).lastAutoTable.finalY + 5;

  // 5. CNC Weep Hole Coordinates Table
  const holeRows = res.weepHolePositions.map((h) => [
    `Trou N° ${h.index}`,
    `${h.coordinateXMm} mm`,
    h.label,
    `${res.slotSpec.widthMm} x ${res.slotSpec.heightMm} mm`,
  ]);

  autoTable(doc, {
    startY: curY,
    head: [['REPERE D USINAGE', 'COTE X (DEPUIS GAUCHE)', 'DESIGNATION & LOCALISATION', 'COTE LUMIERE']],
    body: holeRows,
    theme: 'grid',
    headStyles: { fillColor: [15, 118, 110], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 7.5 },
    styles: { fontSize: 7, cellPadding: 2, textColor: [15, 23, 42] },
    columnStyles: {
      0: { cellWidth: 35, fontStyle: 'bold' },
      1: { cellWidth: 45, fontStyle: 'bold', textColor: [2, 132, 199] },
      2: { cellWidth: 62 },
      3: { cellWidth: 40, textColor: [71, 85, 105] },
    },
    margin: { left: 14, right: 14 },
  });

  curY = (doc as any).lastAutoTable.finalY + 5;

  // 6. Anti-Backflow & Deflector Protection Box
  doc.setDrawColor(res.requiresAntiReturnFlap ? 217 : 203, res.requiresAntiReturnFlap ? 119 : 213, res.requiresAntiReturnFlap ? 6 : 225);
  doc.setFillColor(res.requiresAntiReturnFlap ? 254 : 248, res.requiresAntiReturnFlap ? 242 : 250, res.requiresAntiReturnFlap ? 242 : 252);
  doc.roundedRect(14, curY, 182, 16, 1.5, 1.5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(res.requiresAntiReturnFlap ? 185 : 15, res.requiresAntiReturnFlap ? 28 : 23, res.requiresAntiReturnFlap ? 28 : 42);
  doc.text('DISPOSITIFS ANTI-REFOULEMENT & PROTECTIONS EXTERIEURES (NF EN 12208) :', 18, curY + 5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.8);
  doc.setTextColor(71, 85, 105);
  doc.text(
    `Clapet anti-retour silicone : ${res.requiresAntiReturnFlap ? 'OBLIGATOIRE (Pression >= 300 Pa ou gorge basse)' : 'Optionnel'} • Busettes déflectrices : ${res.requiresExteriorDeflector ? 'OBLIGATOIRES' : 'Non requises'}`,
    18,
    curY + 9.5
  );
  doc.text(
    'Les clapets anti-retour à membrane empêchent l effet d écopage et la remontée de bulles d eau sous vent violent.',
    18,
    curY + 13.5
  );

  curY += 20;

  // 7. Workshop Recommendations
  if (res.recommendations.length > 0) {
    doc.setDrawColor(226, 232, 240);
    doc.setFillColor(255, 255, 255);
    const boxHeight = Math.min(22, 6 + res.recommendations.length * 3.5);
    doc.roundedRect(14, curY, 182, boxHeight, 1.5, 1.5, 'D');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.2);
    doc.setTextColor(15, 23, 42);
    doc.text('DIRECTIVES D USINAGE & CONTROLES ATELIER :', 18, curY + 4.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(71, 85, 105);
    res.recommendations.slice(0, 4).forEach((rec, idx) => {
      doc.text(`• ${rec}`, 20, curY + 8.5 + idx * 3.8);
    });

    curY += boxHeight + 4;
  }

  // 8. Signature Block
  const signY = Math.min(curY, 258);
  doc.setDrawColor(203, 213, 225);
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(14, signY, 70, 22, 1.5, 1.5, 'D');
  doc.roundedRect(126, signY, 70, 22, 1.5, 1.5, 'D');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(15, 23, 42);
  doc.text('Visa Responsable Usinage CNC', 18, signY + 5.5);
  doc.text('Bon pour Montage & Controle Qualite', 130, signY + 5.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(100, 116, 139);
  doc.text('Date & Cachet Atelier :', 18, signY + 11);
  doc.text('Signature Controleur :', 130, signY + 11);

  // QR Code
  try {
    const qrPayload = `BAITI|DRAINAGE|${params.documentId}|REF=${params.projectRef}|CLASS=${res.targetClassSpec.classId}|HOLES=${res.actualHolesCount}|STATUS=${isOk ? 'OK' : 'RISK'}`;
    const qrDataUrl = await QRCode.toDataURL(qrPayload, { width: 90, margin: 0 });
    doc.addImage(qrDataUrl, 'PNG', 92, signY + 1, 20, 20);
  } catch {
    // Handled
  }

  // 9. Footer
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(6.5);
  doc.setTextColor(148, 163, 184);
  doc.text(
    `Fiche technique officielle Baiti Atelier • ${params.documentId} • NF DTU 36.5 • NF P 20-302 • NF EN 12208 • CSTB 3529`,
    105,
    289,
    { align: 'center' }
  );

  const safeFilename = `Plan_Usinage_Drainage_${params.documentId}.pdf`;
  doc.save(safeFilename);
}

export interface CornerCrimpingPdfParams {
  documentId: string;
  projectRef: string;
  clientName: string;
  wilayaName: string;
  workshopName: string;
  result: import('./cornerCrimpingManager').CornerCrimpingResult;
}

export async function generateCornerCrimpingNoticePdf(params: CornerCrimpingPdfParams): Promise<void> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const todayStr = new Date().toLocaleDateString('fr-DZ', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  const res = params.result;
  const isOk = res.complianceStatus === 'CONFORME';
  const isWarning = res.complianceStatus === 'ATTENTION';

  // 1. Header Banner
  doc.setFillColor(15, 23, 42); // Slate 900
  doc.rect(0, 0, 210, 26, 'F');

  doc.setFillColor(217, 119, 6); // Amber 600 accent bar
  doc.rect(0, 26, 210, 2, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(255, 255, 255);
  doc.text('BAITI ATELIER ALGERIE', 14, 11);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(203, 213, 225);
  doc.text('Bureau d Etudes Menuiserie Aluminium • Note de Sertissage & Resistance des Angles', 14, 17);
  doc.text('Normes : NF P 20-302 • NF EN 12046-1 • NF EN 1191 • Eurocode 9 (NF EN 1999-1-1) • SNFA', 14, 22);

  // Status Badge in Header
  doc.setFillColor(isOk ? 16 : isWarning ? 217 : 225, isOk ? 185 : isWarning ? 119 : 29, isOk ? 129 : isWarning ? 6 : 72);
  doc.roundedRect(144, 7, 52, 12, 2, 2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.text(isOk ? 'ONGLET CONFORME' : isWarning ? 'AVEC RESERVES' : 'NON CONFORME', 170, 14.5, { align: 'center' });

  // 2. Document Title Box
  let curY = 33;
  doc.setDrawColor(226, 232, 240);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, curY, 182, 18, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(15, 23, 42);
  doc.text('FICHE D ATELIER & NOTE DE CALCUL : SERTISSAGE DES EQUERRES D ONGLET', 18, curY + 6.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text(`Doc N° : ${params.documentId}  |  Chantier : ${params.projectRef}  |  Wilaya : ${params.wilayaName}  |  Date : ${todayStr}`, 18, curY + 13);

  curY += 22;

  // 3. Sash Dimensions & Mechanical Loads Table
  autoTable(doc, {
    startY: curY,
    head: [['PARAMETRE DU VANTAIL', 'VALEUR RETENUE', 'EXIGENCE NORMATIVE']],
    body: [
      ['Dimensions du vantail ouvrant', `${res.sashWidthMm} x ${res.sashHeightMm} mm`, `Perimetre profil : ${res.sashPerimeterM.toFixed(2)} m`],
      ['Poids total du vantail', `${res.totalSashWeightKg} kg`, 'Verre lourd + profilés aluminium + quincaillerie'],
      ['Charge accidentelle verticale', `${res.accidentalVerticalLoadN} N (80 kg)`, 'Norme NF EN 14608 / NF EN 12046-1'],
      ['Moment de flexion d angle agissant', `${res.cornerBendingMomentNm} N.m`, 'Sollicitation d affaissement en pointe d ouvrant'],
      ['Effort d arrachement agissant', `${res.pullOutForceActingN} N`, 'Traction axiale sur l assemblage d onglet'],
      ['Moment de torsion secondaire', `${res.cornerTorsionalMomentNm} N.m`, 'Gauchissement sous manœuvre brutale'],
    ],
    theme: 'grid',
    headStyles: { fillColor: [217, 119, 6], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 7.5 },
    styles: { fontSize: 7, cellPadding: 2, textColor: [15, 23, 42] },
    columnStyles: {
      0: { cellWidth: 55, fontStyle: 'bold' },
      1: { cellWidth: 55 },
      2: { cellWidth: 72, textColor: [71, 85, 105] },
    },
    margin: { left: 14, right: 14 },
  });

  curY = (doc as any).lastAutoTable.finalY + 5;

  // 4. Corner Assembly Specifications Table
  autoTable(doc, {
    startY: curY,
    head: [['SPECIFICATION DU JOINT D ANGLE', 'VALEUR ATELIER', 'CONFORMITE TECHNIQUE']],
    body: [
      ['Mode d assemblage d onglet', res.assemblySpec.name, res.assemblySpec.setupComplexity],
      ['Alliage de l equerre d angle', res.materialSpec.name, `Limite elastique : ${res.materialSpec.yieldStrengthMpa} MPa`],
      ['Profondeur de sertissage couteau', `${res.knifePenetrationMm} mm`, `Plage toleree : 1.2 a 1.8 mm (${res.isPenetrationCompliant ? 'CONFORME' : 'HORS PLAGE'})`],
      ['Pression de sertissage reglee', `${res.effectivePunchPressureBar} bar`, 'Pression hydraulique sur verins a 45 degres'],
      ['Adherent d onglet / etancheite', res.adhesiveBondStrengthN > 0 ? 'Colle PU bi-composant injectee' : 'Assemblage a sec', `Apport adhesion : +${res.adhesiveBondStrengthN} N`],
      ['Equerre d alignement exterieure', res.flushOffsetToleranceMm <= 0.20 ? 'Presente (inox ressort)' : 'Absente', `Desaffleurement : ${res.flushOffsetToleranceMm} mm (max 0.20 mm)`],
    ],
    theme: 'grid',
    headStyles: { fillColor: [30, 41, 59], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 7.5 },
    styles: { fontSize: 7, cellPadding: 2, textColor: [15, 23, 42] },
    columnStyles: {
      0: { cellWidth: 55, fontStyle: 'bold' },
      1: { cellWidth: 55 },
      2: { cellWidth: 72, textColor: [71, 85, 105] },
    },
    margin: { left: 14, right: 14 },
  });

  curY = (doc as any).lastAutoTable.finalY + 5;

  // 5. Resistance & Deflection Results Table
  autoTable(doc, {
    startY: curY,
    head: [['CRITERE DE RESISTANCE & RIGIDITE', 'VALEUR CALCULEE', 'VERIFICATION EUROCODE 9']],
    body: [
      ['Resistance ultime a l arrachement', `${res.ultimatePullOutResistanceN} N`, `Effort agissant : ${res.pullOutForceActingN} N`],
      ['Facteur de securite global', `${res.safetyFactor.toFixed(2)}`, `Exigence minimale : 1.50 (${res.isResistanceCompliant ? 'CONFORME' : 'INSUFFISANT'})`],
      ['Fleche diagonale d affaissement', `${res.diagonalRackingDeflectionMm} mm`, `Limite admissible : ${res.maxAllowableDeflectionMm} mm (${res.isDeflectionAcceptable ? 'RIGIDE' : 'EXCESSIF'})`],
      ['Surface d impact des poinçons', `${res.crimpContactAreaMm2} mm2`, 'Cisaillement des parois du profile'],
    ],
    theme: 'grid',
    headStyles: { fillColor: [15, 118, 110], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 7.5 },
    styles: { fontSize: 7, cellPadding: 2, textColor: [15, 23, 42] },
    columnStyles: {
      0: { cellWidth: 55, fontStyle: 'bold' },
      1: { cellWidth: 55 },
      2: { cellWidth: 72, textColor: [71, 85, 105] },
    },
    margin: { left: 14, right: 14 },
  });

  curY = (doc as any).lastAutoTable.finalY + 5;

  // 6. Workshop Crimping Guidelines Box
  doc.setDrawColor(res.safetyFactor >= 1.5 ? 203 : 217, res.safetyFactor >= 1.5 ? 213 : 119, res.safetyFactor >= 1.5 ? 225 : 6);
  doc.setFillColor(res.safetyFactor >= 1.5 ? 248 : 254, res.safetyFactor >= 1.5 ? 250 : 242, res.safetyFactor >= 1.5 ? 252 : 242);
  doc.roundedRect(14, curY, 182, 16, 1.5, 1.5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(res.safetyFactor >= 1.5 ? 15 : 185, res.safetyFactor >= 1.5 ? 23 : 28, res.safetyFactor >= 1.5 ? 42 : 28);
  doc.text('CONSIGNES DE REGLAGE DE LA SERTISSEUSE PNEUMATIQUE / HYDRAULIQUE :', 18, curY + 5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.8);
  doc.setTextColor(71, 85, 105);
  doc.text(
    `Pression manometre : ${res.effectivePunchPressureBar} bar • Penetration couteau : ${res.knifePenetrationMm} mm • Equerre d alignement : ${res.flushOffsetToleranceMm <= 0.2 ? 'Active' : 'A poser'}`,
    18,
    curY + 9.5
  );
  doc.text(
    'Encoller abondamment les faces de coupe a 45 degres avec la colle PU bicomposant avant emboitement et sertissage.',
    18,
    curY + 13.5
  );

  curY += 20;

  // 7. Workshop Recommendations
  if (res.recommendations.length > 0) {
    doc.setDrawColor(226, 232, 240);
    doc.setFillColor(255, 255, 255);
    const boxHeight = Math.min(22, 6 + res.recommendations.length * 3.5);
    doc.roundedRect(14, curY, 182, boxHeight, 1.5, 1.5, 'D');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.2);
    doc.setTextColor(15, 23, 42);
    doc.text('DIRECTIVES PARTICULIERES D ASSEMBLAGE ATELIER :', 18, curY + 4.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(71, 85, 105);
    res.recommendations.slice(0, 4).forEach((rec, idx) => {
      doc.text(`• ${rec}`, 20, curY + 8.5 + idx * 3.8);
    });

    curY += boxHeight + 4;
  }

  // 8. Signature Block
  const signY = Math.min(curY, 258);
  doc.setDrawColor(203, 213, 225);
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(14, signY, 70, 22, 1.5, 1.5, 'D');
  doc.roundedRect(126, signY, 70, 22, 1.5, 1.5, 'D');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(15, 23, 42);
  doc.text('Visa Responsable Assemblage', 18, signY + 5.5);
  doc.text('Bon pour Montage & Controle Onglet', 130, signY + 5.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(100, 116, 139);
  doc.text('Date & Cachet Atelier :', 18, signY + 11);
  doc.text('Signature Controleur Qualite :', 130, signY + 11);

  // QR Code
  try {
    const qrPayload = `BAITI|CORNER|${params.documentId}|REF=${params.projectRef}|METHOD=${res.assemblySpec.methodId}|RES=${res.ultimatePullOutResistanceN}N|STATUS=${isOk ? 'OK' : 'RISK'}`;
    const qrDataUrl = await QRCode.toDataURL(qrPayload, { width: 90, margin: 0 });
    doc.addImage(qrDataUrl, 'PNG', 92, signY + 1, 20, 20);
  } catch {
    // Handled
  }

  // 9. Footer
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(6.5);
  doc.setTextColor(148, 163, 184);
  doc.text(
    `Fiche technique officielle Baiti Atelier • ${params.documentId} • NF P 20-302 • NF EN 12046-1 • Eurocode 9 • SNFA`,
    105,
    289,
    { align: 'center' }
  );

  const safeFilename = `Note_Sertissage_Angle_${params.documentId}.pdf`;
  doc.save(safeFilename);
}

export interface HandleErgonomicsPdfParams {
  documentId: string;
  projectRef: string;
  clientName: string;
  wilayaName: string;
  workshopName: string;
  result: import('./handleErgonomicsManager').HandleErgonomicsResult;
}

export async function generateHandleErgonomicsNoticePdf(params: HandleErgonomicsPdfParams): Promise<void> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const todayStr = new Date().toLocaleDateString('fr-DZ', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  const res = params.result;
  const isOk = res.complianceStatus === 'CONFORME';
  const isWarning = res.complianceStatus === 'ATTENTION';

  // 1. Header Banner
  doc.setFillColor(15, 23, 42); // Slate 900
  doc.rect(0, 0, 210, 26, 'F');

  doc.setFillColor(14, 165, 233); // Sky 500 accent bar
  doc.rect(0, 26, 210, 2, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(255, 255, 255);
  doc.text('BAITI ATELIER ALGERIE', 14, 11);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(203, 213, 225);
  doc.text('Bureau d Etudes Menuiserie Aluminium • Audit Ergonomique & Accessibilite PMR', 14, 17);
  doc.text('Normes : NF EN 12046-1 • NF EN 13115 • NF EN 13126-3 • Decret Algerien 06-455 (PMR) • NF DTU 36.5', 14, 22);

  // Status Badge in Header
  doc.setFillColor(
    res.isPmrClassAchieved ? 16 : isOk ? 2 : isWarning ? 217 : 225,
    res.isPmrClassAchieved ? 185 : isOk ? 132 : isWarning ? 119 : 29,
    res.isPmrClassAchieved ? 129 : isOk ? 199 : isWarning ? 6 : 72
  );
  doc.roundedRect(142, 7, 54, 12, 2, 2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.text(
    res.isPmrClassAchieved ? 'CONFORME PMR' : isOk ? 'CONFORME STD' : isWarning ? 'AVEC RESERVES' : 'NON CONFORME',
    169,
    14.5,
    { align: 'center' }
  );

  // 2. Document Title Box
  let curY = 33;
  doc.setDrawColor(226, 232, 240);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, curY, 182, 18, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(15, 23, 42);
  doc.text('CERTIFICAT D AUDIT ERGONOMIQUE & EFFORTS DE MANŒUVRE (PMR)', 18, curY + 6.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text(`Doc N° : ${params.documentId}  |  Chantier : ${params.projectRef}  |  Wilaya : ${params.wilayaName}  |  Date : ${todayStr}`, 18, curY + 13);

  curY += 22;

  // 3. Sash Dimensions & Hardware Specification Table
  autoTable(doc, {
    startY: curY,
    head: [['PARAMETRE DE LA BAIE & QUINCAILLERIE', 'VALEUR RETENUE', 'EXIGENCE NORMATIVE']],
    body: [
      ['Dimensions du vantail mobile', `${res.sashWidthMm} x ${res.sashHeightMm} mm`, `Perimetre profil : ${res.sashPerimeterM.toFixed(2)} m`],
      ['Modele de poignee installee', res.handleSpec.name, `Bras de levier : ${res.handleSpec.leverArmLengthMm} mm`],
      ['Garde / Degagement au dormant', `${res.handleSpec.frameClearanceMm} mm`, `Minimum securite doigts : 40.0 mm (${res.isClearanceCompliant ? 'CONFORME' : 'DANGEREUX'})`],
      ['Hauteur de manoeuvre du sol fini', 'Plage recommandee : 900 a 1300 mm', 'Conforme Decret executif algerien 06-455'],
      ['Demultiplication cremone', `${res.gearRatio.toFixed(2)}x`, 'Rapport de transmission a pignon / cremaillere'],
      ['Agrement accessibilite PMR', res.handleSpec.isPmrApproved ? 'Valide PMR (retour courbe)' : 'Usage courant standard', 'Prise en main sans rotation poignet douloureuse'],
    ],
    theme: 'grid',
    headStyles: { fillColor: [14, 165, 233], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 7.5 },
    styles: { fontSize: 7, cellPadding: 2, textColor: [15, 23, 42] },
    columnStyles: {
      0: { cellWidth: 55, fontStyle: 'bold' },
      1: { cellWidth: 55 },
      2: { cellWidth: 72, textColor: [71, 85, 105] },
    },
    margin: { left: 14, right: 14 },
  });

  curY = (doc as any).lastAutoTable.finalY + 5;

  // 4. Operating Forces & Torques Table
  autoTable(doc, {
    startY: curY,
    head: [['EFFORT DE MANŒUVRE & COUPLE', 'VALEUR CALCULEE', 'SEUIL ADMISSIBLE (NF EN 12046-1)']],
    body: [
      ['Couple sur l axe de la poignee', `${res.calculatedHandleTorqueNm} N.m`, `Limite max autorisee : ${res.maxAllowableTorqueNm} N.m (${res.calculatedHandleTorqueNm <= res.maxAllowableTorqueNm ? 'CONFORME' : 'EXCESSIF'})`],
      ['Effort de traction / rotation main', `${res.operatingHandForceN} N`, `Limite max main : ${res.maxAllowableHandForceN} N (${res.operatingHandForceN <= res.maxAllowableHandForceN ? 'DOUX' : 'DUR'})`],
      ['Resistance compression joints', `${res.totalGasketResistanceN} N`, `Force lineaire : ${res.gasketLinearForceNPerM} N/m`],
      ['Frottement galets de verrouillage', `${res.camFrictionForceN} N`, 'Frottement sur gaches de securite'],
      ['Effort lineaire tringle cremaillere', `${res.totalRodOperatingForceN} N`, 'Poussee axiale necessaire au verrouillage'],
    ],
    theme: 'grid',
    headStyles: { fillColor: [30, 41, 59], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 7.5 },
    styles: { fontSize: 7, cellPadding: 2, textColor: [15, 23, 42] },
    columnStyles: {
      0: { cellWidth: 55, fontStyle: 'bold' },
      1: { cellWidth: 55 },
      2: { cellWidth: 72, textColor: [71, 85, 105] },
    },
    margin: { left: 14, right: 14 },
  });

  curY = (doc as any).lastAutoTable.finalY + 5;

  // 5. Algerian PMR Accessibility Compliance Checklist Table
  autoTable(doc, {
    startY: curY,
    head: [['CRITERE ACCESSIBILITE PMR', 'VERIFICATION CHANTIER', 'STATUT DECRET 06-455']],
    body: [
      ['Effort d ouverture et fermeture', `${res.operatingHandForceN} N (requis <= 20 N)`, res.operatingHandForceN <= 20 ? 'CONFORME CLASSE 2 PMR' : 'CLASSE 1 STANDARD'],
      ['Couple de manoeuvre poignee', `${res.calculatedHandleTorqueNm} N.m (requis <= 5.0 N.m)`, res.calculatedHandleTorqueNm <= 5.0 ? 'CONFORME PMR' : 'COUPLE STANDARD'],
      ['Prehension ergonomique sans torsion', res.handleSpec.gripDiameterMm >= 20 ? 'Diametre tube optimal' : 'Trop fin', 'Manœuvrable paume ouverte ou poing ferme'],
      ['Garde anti-pincement dormant', `${res.handleSpec.frameClearanceMm} mm (requis >= 40 mm)`, res.isClearanceCompliant ? 'SECURITE GARANTIE' : 'RISQUE PINCEMENT'],
    ],
    theme: 'grid',
    headStyles: { fillColor: [15, 118, 110], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 7.5 },
    styles: { fontSize: 7, cellPadding: 2, textColor: [15, 23, 42] },
    columnStyles: {
      0: { cellWidth: 55, fontStyle: 'bold' },
      1: { cellWidth: 55 },
      2: { cellWidth: 72, textColor: [71, 85, 105] },
    },
    margin: { left: 14, right: 14 },
  });

  curY = (doc as any).lastAutoTable.finalY + 5;

  // 6. Workshop Maintenance Guidelines Box
  doc.setDrawColor(res.isPmrClassAchieved ? 16 : 203, res.isPmrClassAchieved ? 185 : 213, res.isPmrClassAchieved ? 129 : 225);
  doc.setFillColor(res.isPmrClassAchieved ? 240 : 248, res.isPmrClassAchieved ? 253 : 250, res.isPmrClassAchieved ? 244 : 252);
  doc.roundedRect(14, curY, 182, 16, 1.5, 1.5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(res.isPmrClassAchieved ? 22 : 15, res.isPmrClassAchieved ? 101 : 23, res.isPmrClassAchieved ? 52 : 42);
  doc.text('DIRECTIVES D AJUSTEMENT QUINCAILLERIE & LUBRIFICATION ATELIER :', 18, curY + 5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.8);
  doc.setTextColor(71, 85, 105);
  doc.text(
    `Bras de levier : ${res.handleSpec.leverArmLengthMm} mm • Effort hand : ${res.operatingHandForceN} N • Classe PMR : ${res.isPmrClassAchieved ? 'Atteinte' : 'Non atteinte'}`,
    18,
    curY + 9.5
  );
  doc.text(
    'Ajuster la pression des galets excentriques sur les gaches et appliquer une graisse silicone neutre sur les tringles.',
    18,
    curY + 13.5
  );

  curY += 20;

  // 7. Workshop Recommendations
  if (res.recommendations.length > 0) {
    doc.setDrawColor(226, 232, 240);
    doc.setFillColor(255, 255, 255);
    const boxHeight = Math.min(22, 6 + res.recommendations.length * 3.5);
    doc.roundedRect(14, curY, 182, boxHeight, 1.5, 1.5, 'D');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.2);
    doc.setTextColor(15, 23, 42);
    doc.text('RECOMMANDATIONS D ERGONOMIE & CONFORT D USAGE :', 18, curY + 4.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(71, 85, 105);
    res.recommendations.slice(0, 4).forEach((rec, idx) => {
      doc.text(`• ${rec}`, 20, curY + 8.5 + idx * 3.8);
    });

    curY += boxHeight + 4;
  }

  // 8. Signature Block
  const signY = Math.min(curY, 258);
  doc.setDrawColor(203, 213, 225);
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(14, signY, 70, 22, 1.5, 1.5, 'D');
  doc.roundedRect(126, signY, 70, 22, 1.5, 1.5, 'D');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(15, 23, 42);
  doc.text('Visa Responsable Quincaillerie', 18, signY + 5.5);
  doc.text('Bon pour Reception Ergonomique', 130, signY + 5.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(100, 116, 139);
  doc.text('Date & Cachet Atelier :', 18, signY + 11);
  doc.text('Signature Controleur PMR :', 130, signY + 11);

  // QR Code
  try {
    const qrPayload = `BAITI|HANDLE|${params.documentId}|REF=${params.projectRef}|TYPE=${res.handleSpec.id}|TORQUE=${res.calculatedHandleTorqueNm}NM|PMR=${res.isPmrClassAchieved ? 'YES' : 'NO'}|STATUS=${isOk ? 'OK' : 'RISK'}`;
    const qrDataUrl = await QRCode.toDataURL(qrPayload, { width: 90, margin: 0 });
    doc.addImage(qrDataUrl, 'PNG', 92, signY + 1, 20, 20);
  } catch {
    // Handled
  }

  // 9. Footer
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(6.5);
  doc.setTextColor(148, 163, 184);
  doc.text(
    `Fiche technique officielle Baiti Atelier • ${params.documentId} • NF EN 12046-1 • NF EN 13115 • Decret PMR 06-455`,
    105,
    289,
    { align: 'center' }
  );

  const safeFilename = `Certificat_Ergonomie_Poignee_${params.documentId}.pdf`;
  doc.save(safeFilename);
}
















