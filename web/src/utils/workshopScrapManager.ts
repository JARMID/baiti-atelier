import { getOffcutInventory, removeOffcut } from './offcutManager';

export interface ScrapBin {
  id: string;
  name: string;
  material: 'aluminium' | 'pvc' | 'acier';
  alloyType: string;
  currentWeightKg: number;
  capacityKg: number;
  marketPriceDzdPerKg: number;
  lastEmptiedAt: string;
  preferredCollector: string;
  locationInWorkshop: string;
}

export interface ScrapSaleRecord {
  id: string;
  binId: string;
  binName: string;
  date: string;
  weightKg: number;
  pricePerKgDzd: number;
  totalPaidDzd: number;
  collectorName: string;
  receiptRef: string;
  paymentStatus: 'especes_recue' | 'baridimob' | 'en_attente';
  notes?: string;
}

const STORAGE_SCRAP_BINS_KEY = 'baiti_workshop_scrap_bins_v1';
const STORAGE_SCRAP_SALES_KEY = 'baiti_workshop_scrap_sales_v1';

export const INITIAL_SCRAP_BINS: ScrapBin[] = [
  {
    id: 'bin-alu-01',
    name: 'Bac Principal Aluminium 6060/6063 (Chutes < 800mm)',
    material: 'aluminium',
    alloyType: 'Alloy 6063 T5 / T6 Propre',
    currentWeightKg: 138.5,
    capacityKg: 200,
    marketPriceDzdPerKg: 280,
    lastEmptiedAt: '2026-09-05',
    preferredCollector: 'Fonderie Affinerie Oued Smar (Alger)',
    locationInWorkshop: 'Poste Scie Débit • Casier B-08',
  },
  {
    id: 'bin-alu-rpt',
    name: 'Bac Aluminium RPT (Mixte Barrette Polyamide)',
    material: 'aluminium',
    alloyType: 'Profilés avec RPT 14.8/24mm',
    currentWeightKg: 46.0,
    capacityKg: 150,
    marketPriceDzdPerKg: 220,
    lastEmptiedAt: '2026-08-28',
    preferredCollector: 'Récupération Métaux El Eulma (Sétif)',
    locationInWorkshop: 'Zone Sertissage • Atelier Nord',
  },
  {
    id: 'bin-pvc-01',
    name: 'Bac Chutes & Retailles PVC Blanc 60mm',
    material: 'pvc',
    alloyType: 'PVC Rigide Sans Plomb',
    currentWeightKg: 64.0,
    capacityKg: 150,
    marketPriceDzdPerKg: 75,
    lastEmptiedAt: '2026-09-10',
    preferredCollector: 'Société Recyclage Plastique Baraki',
    locationInWorkshop: 'Poste Ébavurage PVC',
  },
];

export const INITIAL_SCRAP_SALES: ScrapSaleRecord[] = [
  {
    id: 'sale-001',
    binId: 'bin-alu-01',
    binName: 'Bac Principal Aluminium 6060/6063',
    date: '2026-09-05',
    weightKg: 194.0,
    pricePerKgDzd: 275,
    totalPaidDzd: 53350,
    collectorName: 'Fonderie Affinerie Oued Smar (Alger)',
    receiptRef: 'PESEE-OS-2026-88',
    paymentStatus: 'especes_recue',
    notes: 'Pesée sur pont bascule certifié. Paiement comptant en espèces à la livraison.',
  },
  {
    id: 'sale-002',
    binId: 'bin-alu-rpt',
    binName: 'Bac Aluminium RPT (Mixte Polyamide)',
    date: '2026-08-28',
    weightKg: 145.0,
    pricePerKgDzd: 215,
    totalPaidDzd: 31175,
    collectorName: 'Récupération Métaux El Eulma (Sétif)',
    receiptRef: 'BL-FOND-EL-412',
    paymentStatus: 'baridimob',
    notes: 'Virement BaridiMob effectué sur le compte CCP atelier.',
  },
];

// Profile linear weight reference (kg per meter) for weight estimation
export function estimateProfileWeightKg(profileCode: string, lengthMm: number): number {
  const code = profileCode.toUpperCase();
  const lengthM = lengthMm / 1000;

  let kgPerM = 1.15; // default aluminum profile weight
  if (code.includes('TPR-40') || code.includes('DORM')) {
    kgPerM = 1.12;
  } else if (code.includes('OUV')) {
    kgPerM = 0.98;
  } else if (code.includes('PAR') || code.includes('16')) {
    kgPerM = 0.28;
  } else if (code.includes('67') || code.includes('COUL')) {
    kgPerM = 1.38;
  } else if (code.includes('PVC')) {
    kgPerM = 1.25;
  } else if (code.includes('ACIER') || code.includes('RENF')) {
    kgPerM = 0.85;
  }

  return Math.round(lengthM * kgPerM * 100) / 100;
}

export function getScrapBins(): ScrapBin[] {
  if (typeof window === 'undefined') return INITIAL_SCRAP_BINS;
  try {
    const raw = localStorage.getItem(STORAGE_SCRAP_BINS_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_SCRAP_BINS_KEY, JSON.stringify(INITIAL_SCRAP_BINS));
      return INITIAL_SCRAP_BINS;
    }
    return JSON.parse(raw) as ScrapBin[];
  } catch {
    return INITIAL_SCRAP_BINS;
  }
}

export function saveScrapBins(bins: ScrapBin[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_SCRAP_BINS_KEY, JSON.stringify(bins));
  } catch {
    // Handled
  }
}

export function getScrapSales(): ScrapSaleRecord[] {
  if (typeof window === 'undefined') return INITIAL_SCRAP_SALES;
  try {
    const raw = localStorage.getItem(STORAGE_SCRAP_SALES_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_SCRAP_SALES_KEY, JSON.stringify(INITIAL_SCRAP_SALES));
      return INITIAL_SCRAP_SALES;
    }
    return JSON.parse(raw) as ScrapSaleRecord[];
  } catch {
    return INITIAL_SCRAP_SALES;
  }
}

export function saveScrapSales(sales: ScrapSaleRecord[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_SCRAP_SALES_KEY, JSON.stringify(sales));
  } catch {
    // Handled
  }
}

export function addScrapWeight(binId: string, deltaKg: number): ScrapBin[] {
  const bins = getScrapBins();
  const updated = bins.map((b) => {
    if (b.id !== binId) return b;
    const newWeight = Math.max(0, Math.round((b.currentWeightKg + deltaKg) * 10) / 10);
    return { ...b, currentWeightKg: newWeight };
  });
  saveScrapBins(updated);
  return updated;
}

export function convertOffcutToScrap(offcutId: string): { bins: ScrapBin[]; scrapWeight: number; targetBinName: string } | null {
  const inventory = getOffcutInventory();
  const target = inventory.find((i) => i.id === offcutId);
  if (!target) return null;

  const weightKg = estimateProfileWeightKg(target.profileCode, target.lengthMm);
  removeOffcut(offcutId);

  // Target aluminum or pvc bin
  let targetBinId = 'bin-alu-01';
  if (target.material === 'pvc') {
    targetBinId = 'bin-pvc-01';
  } else if (target.label.toLowerCase().includes('rpt') || target.profileCode.toLowerCase().includes('rpt')) {
    targetBinId = 'bin-alu-rpt';
  }

  const updated = addScrapWeight(targetBinId, weightKg);
  const matchedBin = updated.find((b) => b.id === targetBinId) || updated[0];

  return {
    bins: updated,
    scrapWeight: weightKg,
    targetBinName: matchedBin.name,
  };
}

export function recordScrapSaleTransaction(
  binId: string,
  weightSoldKg: number,
  pricePerKgDzd: number,
  collectorName: string,
  receiptRef: string,
  paymentStatus: 'especes_recue' | 'baridimob' | 'en_attente',
  notes?: string
): { updatedBins: ScrapBin[]; newSale: ScrapSaleRecord } {
  const bins = getScrapBins();
  const bin = bins.find((b) => b.id === binId) || bins[0];

  const totalDzd = Math.round(weightSoldKg * pricePerKgDzd);
  const todayStr = new Date().toISOString().split('T')[0];

  const newSale: ScrapSaleRecord = {
    id: `sale-${Date.now()}`,
    binId: bin.id,
    binName: bin.name,
    date: todayStr,
    weightKg: weightSoldKg,
    pricePerKgDzd,
    totalPaidDzd: totalDzd,
    collectorName: collectorName.trim() || bin.preferredCollector,
    receiptRef: receiptRef.trim() || `PESEE-${Date.now().toString().slice(-4)}`,
    paymentStatus,
    notes,
  };

  // Deduct weight from bin and update lastEmptiedAt
  const updatedBins = bins.map((b) => {
    if (b.id !== binId) return b;
    const remaining = Math.max(0, Math.round((b.currentWeightKg - weightSoldKg) * 10) / 10);
    return {
      ...b,
      currentWeightKg: remaining,
      lastEmptiedAt: todayStr,
    };
  });

  saveScrapBins(updatedBins);

  const sales = getScrapSales();
  saveScrapSales([newSale, ...sales]);

  return { updatedBins, newSale };
}

export function resetDefaultScrapBins(): ScrapBin[] {
  saveScrapBins(INITIAL_SCRAP_BINS);
  saveScrapSales(INITIAL_SCRAP_SALES);
  return INITIAL_SCRAP_BINS;
}

export function formatScrapCollectorWhatsAppMessage(
  bin: ScrapBin,
  workshopName: string,
  workshopPhone: string,
  wilaya: string
): string {
  const totalValuation = Math.round(bin.currentWeightKg * bin.marketPriceDzdPerKg);
  const fillPercent = Math.round((bin.currentWeightKg / bin.capacityKg) * 100);

  let msg = `*DEMANDE D ENLÈVEMENT FERRAILLE ALUMINIUM / DÉCHETS ATELIER*\n`;
  msg += `Atelier : ${workshopName || 'Menuiserie Aluminium & PVC'}\n`;
  msg += `Localisation : ${wilaya || 'Alger'}\n`;
  msg += `Contact : ${workshopPhone || ''}\n\n`;

  msg += `*DÉTAILS DU BAC PRÊT À L ENLÈVEMENT :*\n`;
  msg += `• Désignation : ${bin.name}\n`;
  msg += `• Type alliage : ${bin.alloyType}\n`;
  msg += `• Poids estimé actuel : *${bin.currentWeightKg} kg* (${fillPercent}% de capacité)\n`;
  msg += `• Cours indicatif convenu : ${bin.marketPriceDzdPerKg} DZD / kg\n`;
  msg += `• Montant estimatif total : *${totalValuation.toLocaleString('fr-DZ')} DZD*\n\n`;

  msg += `Merci de nous confirmer le passage de votre camion avec bascule mobile ou rendez-vous pour pesée sur pont bascule agréé.\n`;
  msg += `Plateforme Baiti Atelier Gestion des Déchets de Coupe`;

  return msg;
}
