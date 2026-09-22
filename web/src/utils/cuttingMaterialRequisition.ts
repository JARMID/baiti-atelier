import {
  getWorkshopStock,
  updateStockQuantity,
  type WorkshopStockItem,
} from './workshopInventoryManager';
import type { OptimizedBar1D } from '../types/optimizer';

export interface CuttingBatchRequisitionItem {
  profileCode: string;
  profileName: string;
  requiredBars6m: number;
  matchedStockItem: WorkshopStockItem | null;
  availableInStock: number;
  shortageQuantity: number;
  isAvailable: boolean;
  targetRackLocation: string;
  unitCostDzd: number;
  totalCostDzd: number;
}

export interface CuttingBatchRequisitionSummary {
  totalRequiredBars: number;
  totalAvailableBars: number;
  hasShortage: boolean;
  totalShortageBars: number;
  totalEstimatedCostDzd: number;
  items: CuttingBatchRequisitionItem[];
}

export interface StoreRequisitionSlipRecord {
  id: string;
  slipNumber: string;
  date: string;
  projectTitle: string;
  clientName: string;
  sawOperator: string;
  storekeeper: string;
  totalBarsDeducted: number;
  items: {
    code: string;
    name: string;
    quantity: number;
    rackLocation: string;
    unitCostDzd: number;
  }[];
}

const STORAGE_REQUISITION_SLIPS_KEY = 'baiti_store_requisition_slips_v1';

// Profile code normalization & matching helper
function findMatchingStockItem(
  profileCode: string,
  stockItems: WorkshopStockItem[]
): WorkshopStockItem | null {
  const norm = profileCode.toUpperCase().trim();

  // 1. Direct code exact match
  const exact = stockItems.find((s) => s.code.toUpperCase() === norm);
  if (exact) return exact;

  // 2. Partial substring matching on code or name
  if (norm.includes('DORM')) {
    const match = stockItems.find(
      (s) => s.code.toUpperCase().includes('DORM') || s.name.toUpperCase().includes('DORM')
    );
    if (match) return match;
  }

  if (norm.includes('OUV')) {
    const match = stockItems.find(
      (s) => s.code.toUpperCase().includes('OUV') || s.name.toUpperCase().includes('OUV')
    );
    if (match) return match;
  }

  if (norm.includes('PAR') || norm.includes('16')) {
    const match = stockItems.find(
      (s) => s.code.toUpperCase().includes('PAR') || s.name.toUpperCase().includes('PARCLOSE')
    );
    if (match) return match;
  }

  if (norm.includes('67') || norm.includes('COUL')) {
    const match = stockItems.find(
      (s) => s.code.toUpperCase().includes('67') || s.name.toUpperCase().includes('COULISS')
    );
    if (match) return match;
  }

  // 3. Fallback to any profile category item
  return stockItems.find((s) => s.category === 'profiles') || null;
}

export function buildCuttingRequisitionMatrix(
  bars: OptimizedBar1D[]
): CuttingBatchRequisitionSummary {
  const stockItems = getWorkshopStock();

  // Group 6m standard bars by profileCode
  const barCountsByProfile: Record<string, number> = {};

  bars.forEach((bar) => {
    // Only count standard stock bars (6000 mm), not remnants
    if (bar.stockLength >= 6000) {
      // Find the dominant profileCode from the cuts placed on this bar
      const firstCut = bar.cuts[0];
      const code = firstCut?.profileCode || 'DORMANT-45';
      barCountsByProfile[code] = (barCountsByProfile[code] || 0) + 1;
    }
  });

  // If no 6m bars were identified, provide default baseline
  if (Object.keys(barCountsByProfile).length === 0 && bars.length > 0) {
    barCountsByProfile['DORMANT-45'] = bars.filter((b) => b.stockLength >= 6000).length;
  }

  const items: CuttingBatchRequisitionItem[] = [];
  let totalRequiredBars = 0;
  let totalAvailableBars = 0;
  let totalShortageBars = 0;
  let totalEstimatedCostDzd = 0;

  Object.entries(barCountsByProfile).forEach(([code, requiredQty]) => {
    const matched = findMatchingStockItem(code, stockItems);
    const available = matched ? matched.currentQuantity : 0;
    const shortage = Math.max(0, requiredQty - available);
    const isAvail = available >= requiredQty;
    const rack = matched?.rackLocation || 'RACK-A-01';
    const unitCost = matched?.unitCostDzd || 12500;
    const totalCost = requiredQty * unitCost;

    totalRequiredBars += requiredQty;
    totalAvailableBars += Math.min(available, requiredQty);
    if (shortage > 0) totalShortageBars += shortage;
    totalEstimatedCostDzd += totalCost;

    let friendlyName = 'Profilé Aluminium Standard (6.00m)';
    if (matched) {
      friendlyName = matched.name;
    } else if (code.toUpperCase().includes('DORM')) {
      friendlyName = 'Dormant Tubulaire 45 RPT (6.00m)';
    } else if (code.toUpperCase().includes('OUV')) {
      friendlyName = 'Ouvrant Frappe 45 RPT (6.00m)';
    } else if (code.toUpperCase().includes('PAR')) {
      friendlyName = 'Parclose Clip 16mm (6.00m)';
    }

    items.push({
      profileCode: matched ? matched.code : code,
      profileName: friendlyName,
      requiredBars6m: requiredQty,
      matchedStockItem: matched,
      availableInStock: available,
      shortageQuantity: shortage,
      isAvailable: isAvail,
      targetRackLocation: rack,
      unitCostDzd: unitCost,
      totalCostDzd: totalCost,
    });
  });

  return {
    totalRequiredBars,
    totalAvailableBars,
    hasShortage: totalShortageBars > 0,
    totalShortageBars,
    totalEstimatedCostDzd,
    items,
  };
}

export function executeStoreRequisitionDeduction(
  items: CuttingBatchRequisitionItem[],
  projectTitle: string,
  clientName: string,
  sawOperator = 'Opérateur Scie Atelier',
  storekeeper = 'Magasinier Atelier'
): { success: boolean; deductedCount: number; slipRecord: StoreRequisitionSlipRecord } {
  let deductedCount = 0;
  const slipItems: StoreRequisitionSlipRecord['items'] = [];

  items.forEach((item) => {
    if (item.matchedStockItem && item.requiredBars6m > 0) {
      // Deduct required bars from inventory
      updateStockQuantity(item.matchedStockItem.id, -item.requiredBars6m);
      deductedCount += item.requiredBars6m;

      slipItems.push({
        code: item.matchedStockItem.code,
        name: item.matchedStockItem.name,
        quantity: item.requiredBars6m,
        rackLocation: item.targetRackLocation,
        unitCostDzd: item.unitCostDzd,
      });
    }
  });

  const todayStr = new Date().toISOString();
  const slipNumber = `BS-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`;

  const slipRecord: StoreRequisitionSlipRecord = {
    id: `req-${Date.now()}`,
    slipNumber,
    date: todayStr,
    projectTitle: projectTitle.trim() || 'Lot Menuiserie Chantier',
    clientName: clientName.trim() || 'Client Atelier',
    sawOperator,
    storekeeper,
    totalBarsDeducted: deductedCount,
    items: slipItems,
  };

  // Persist slip to history
  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem(STORAGE_REQUISITION_SLIPS_KEY);
      const existing: StoreRequisitionSlipRecord[] = raw ? JSON.parse(raw) : [];
      localStorage.setItem(STORAGE_REQUISITION_SLIPS_KEY, JSON.stringify([slipRecord, ...existing]));
    } catch {
      // Handled
    }
  }

  return { success: true, deductedCount, slipRecord };
}

export function formatStoreRequisitionWhatsAppMessage(
  summary: CuttingBatchRequisitionSummary,
  projectTitle: string,
  clientName: string,
  storekeeperName = 'Magasinier'
): string {
  let msg = `*BON DE PRÉLÈVEMENT MATIÈRE • SORTIE DE STOCK ATELIER*\n`;
  msg += `Destinataire : ${storekeeperName}\n`;
  msg += `Projet / Affaire : ${projectTitle || 'Débit Scie 1D'}\n`;
  msg += `Client : ${clientName || 'Chantier Atelier'}\n`;
  msg += `Date : ${new Date().toLocaleDateString('fr-DZ')} ${new Date().toLocaleTimeString('fr-DZ', { hour: '2-digit', minute: '2-digit' })}\n\n`;

  msg += `*PROFILÉS 6.00M À DÉLIVRER AU POSTE SCIE :*\n`;
  summary.items.forEach((item, idx) => {
    msg += `${idx + 1}. *${item.requiredBars6m} barre(s)* • ${item.profileCode} (${item.profileName})\n`;
    msg += `   → Emplacement : *${item.targetRackLocation}*\n`;
    msg += `   → Dispo stock : ${item.availableInStock} barres ${item.isAvailable ? '✓' : `⚠️ (Manque ${item.shortageQuantity}u)`}\n`;
  });

  msg += `\n*TOTAL :* ${summary.totalRequiredBars} barres de 6.00m demandées\n`;
  if (summary.hasShortage) {
    msg += `⚠️ ATTENTION : Rupture de stock détectée sur ${summary.totalShortageBars} barre(s) !\n`;
  } else {
    msg += `✓ Disponibilité stock 100% conforme pour lancement débit immédiat.\n`;
  }

  msg += `\nMerci de préparer les barres sur la table d amenage à rouleaux.\n`;
  msg += `Plateforme Baiti Atelier Logistique & Débit`;

  return msg;
}
