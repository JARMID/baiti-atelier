export type WorkshopStockCategory = 'profiles' | 'hardware' | 'gaskets' | 'glass' | 'screws';

export interface WorkshopStockItem {
  id: string;
  code: string;
  name: string;
  category: WorkshopStockCategory;
  currentQuantity: number;
  minAlertThreshold: number;
  unit: string;
  unitCostDzd: number;
  supplierName: string;
  supplierPhone?: string;
  rackLocation?: string;
  lastUpdated: string;
}

const STORAGE_KEY = 'baiti_workshop_stock_inventory_v1';

export const STOCK_CATEGORIES: { id: WorkshopStockCategory | 'all'; label: string; iconName: string }[] = [
  { id: 'all', label: 'Tout le Stock', iconName: 'Layers' },
  { id: 'profiles', label: 'Profilés 6m', iconName: 'Columns' },
  { id: 'hardware', label: 'Quincaillerie', iconName: 'Wrench' },
  { id: 'gaskets', label: 'Joints & Cales', iconName: 'Shield' },
  { id: 'screws', label: 'Visserie & Fixation', iconName: 'Disc' },
  { id: 'glass', label: 'Vitrage', iconName: 'Square' },
];

const INITIAL_STOCK_ITEMS: WorkshopStockItem[] = [
  {
    id: 'stk-01',
    code: 'ALU-DORM-45',
    name: 'Dormant Tubulaire 45 RPT (6.00m)',
    category: 'profiles',
    currentQuantity: 14,
    minAlertThreshold: 6,
    unit: 'barres (6m)',
    unitCostDzd: 12500,
    supplierName: 'Profilor Extrusion Alger',
    supplierPhone: '0550123456',
    rackLocation: 'RACK-A-01',
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 'stk-02',
    code: 'ALU-OUV-45',
    name: 'Ouvrant Fenêtre 45 RPT (6.00m)',
    category: 'profiles',
    currentQuantity: 18,
    minAlertThreshold: 8,
    unit: 'barres (6m)',
    unitCostDzd: 13800,
    supplierName: 'Profilor Extrusion Alger',
    supplierPhone: '0550123456',
    rackLocation: 'RACK-A-02',
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 'stk-03',
    code: 'ALU-PAR-16',
    name: 'Parclose Ronde Clip 16mm (6.00m)',
    category: 'profiles',
    currentQuantity: 25,
    minAlertThreshold: 10,
    unit: 'barres (6m)',
    unitCostDzd: 2800,
    supplierName: 'Profilor Extrusion Alger',
    supplierPhone: '0550123456',
    rackLocation: 'RACK-B-01',
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 'stk-04',
    code: 'ALU-COUL-DORM',
    name: 'Dormant Coulissant 2 Rails (6.00m)',
    category: 'profiles',
    currentQuantity: 4,
    minAlertThreshold: 6,
    unit: 'barres (6m)',
    unitCostDzd: 16500,
    supplierName: 'Algal Aluminium Oran',
    supplierPhone: '0555987654',
    rackLocation: 'RACK-C-01',
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 'stk-05',
    code: 'ALU-CHIC-COUL',
    name: 'Chicane Centrale Renforcée (6.00m)',
    category: 'profiles',
    currentQuantity: 3,
    minAlertThreshold: 5,
    unit: 'barres (6m)',
    unitCostDzd: 7200,
    supplierName: 'Algal Aluminium Oran',
    supplierPhone: '0555987654',
    rackLocation: 'RACK-C-02',
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 'stk-06',
    code: 'PVC-DORM-60',
    name: 'Dormant PVC 60 4 Chambres (6.00m)',
    category: 'profiles',
    currentQuantity: 12,
    minAlertThreshold: 6,
    unit: 'barres (6m)',
    unitCostDzd: 9500,
    supplierName: 'Comptoir PVC Sétif',
    supplierPhone: '0560234567',
    rackLocation: 'RACK-PVC-01',
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 'stk-07',
    code: 'EQUER-SERT-45',
    name: 'Équerres à sertir aluminium 45',
    category: 'hardware',
    currentQuantity: 80,
    minAlertThreshold: 50,
    unit: 'boîtes (50 pcs)',
    unitCostDzd: 4500,
    supplierName: 'Quincaillerie El Eulma',
    supplierPhone: '0551443322',
    rackLocation: 'BAC-Q-01',
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 'stk-08',
    code: 'CREM-REV-ALU',
    name: 'Crémones réversibles pour frappe',
    category: 'hardware',
    currentQuantity: 8,
    minAlertThreshold: 15,
    unit: 'pièces',
    unitCostDzd: 1850,
    supplierName: 'Quincaillerie El Eulma',
    supplierPhone: '0551443322',
    rackLocation: 'BAC-Q-03',
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 'stk-09',
    code: 'GALET-DBL-REG',
    name: 'Galets doubles inox réglables coulissant',
    category: 'hardware',
    currentQuantity: 6,
    minAlertThreshold: 15,
    unit: 'paires',
    unitCostDzd: 2200,
    supplierName: 'Distributeur Giesse Alger',
    supplierPhone: '0540889900',
    rackLocation: 'BAC-Q-04',
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 'stk-10',
    code: 'JOINT-EPDM-CENT',
    name: 'Joint étanchéité central EPDM (100m)',
    category: 'gaskets',
    currentQuantity: 4,
    minAlertThreshold: 2,
    unit: 'rouleaux (100m)',
    unitCostDzd: 5800,
    supplierName: 'TechnoJoint Bab Ezzouar',
    supplierPhone: '0552778899',
    rackLocation: 'ETAG-J-01',
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 'stk-11',
    code: 'JOINT-VITR-EXT',
    name: 'Joint vitrage extérieur à lèvre (100m)',
    category: 'gaskets',
    currentQuantity: 1,
    minAlertThreshold: 3,
    unit: 'rouleaux (100m)',
    unitCostDzd: 4200,
    supplierName: 'TechnoJoint Bab Ezzouar',
    supplierPhone: '0552778899',
    rackLocation: 'ETAG-J-02',
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 'stk-12',
    code: 'CALE-VITR-4MM',
    name: 'Cales d assise vitrage 4mm x 28mm',
    category: 'gaskets',
    currentQuantity: 350,
    minAlertThreshold: 200,
    unit: 'pièces',
    unitCostDzd: 15,
    supplierName: 'Quincaillerie El Eulma',
    supplierPhone: '0551443322',
    rackLocation: 'BAC-C-01',
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 'stk-13',
    code: 'VIS-AUTOF-INOX',
    name: 'Vis autoforantes inox A2 4.2x25',
    category: 'screws',
    currentQuantity: 6,
    minAlertThreshold: 3,
    unit: 'boîtes (1000 pcs)',
    unitCostDzd: 3200,
    supplierName: 'Visserie Industrielle Blida',
    supplierPhone: '0554112233',
    rackLocation: 'BAC-V-01',
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 'stk-14',
    code: 'VITR-DBL-4164',
    name: 'Double vitrage 4/16/4 clair argon',
    category: 'glass',
    currentQuantity: 8,
    minAlertThreshold: 10,
    unit: 'm²',
    unitCostDzd: 6800,
    supplierName: 'Miroiterie Centrale Constantine',
    supplierPhone: '0556334455',
    rackLocation: 'CHEV-VITR-01',
    lastUpdated: new Date().toISOString(),
  },
];

export function getWorkshopStock(): WorkshopStockItem[] {
  if (typeof window === 'undefined') return INITIAL_STOCK_ITEMS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_STOCK_ITEMS));
      return INITIAL_STOCK_ITEMS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_STOCK_ITEMS));
    return INITIAL_STOCK_ITEMS;
  } catch {
    return INITIAL_STOCK_ITEMS;
  }
}

export function saveWorkshopStock(items: WorkshopStockItem[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    window.dispatchEvent(new Event('baiti_stock_updated'));
  } catch {
    // Local storage failure fallback
  }
}

export function updateStockQuantity(id: string, delta: number): WorkshopStockItem[] {
  const current = getWorkshopStock();
  const updated = current.map((item) => {
    if (item.id === id) {
      const newQty = Math.max(0, item.currentQuantity + delta);
      return {
        ...item,
        currentQuantity: newQty,
        lastUpdated: new Date().toISOString(),
      };
    }
    return item;
  });
  saveWorkshopStock(updated);
  return updated;
}

export function addStockItem(item: Omit<WorkshopStockItem, 'id' | 'lastUpdated'>): WorkshopStockItem[] {
  const current = getWorkshopStock();
  const newItem: WorkshopStockItem = {
    ...item,
    id: `stk_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`,
    lastUpdated: new Date().toISOString(),
  };
  const updated = [newItem, ...current];
  saveWorkshopStock(updated);
  return updated;
}

export function deleteStockItem(id: string): WorkshopStockItem[] {
  const current = getWorkshopStock();
  const updated = current.filter((item) => item.id !== id);
  saveWorkshopStock(updated);
  return updated;
}

export function resetDefaultStock(): WorkshopStockItem[] {
  saveWorkshopStock(INITIAL_STOCK_ITEMS);
  return INITIAL_STOCK_ITEMS;
}

export interface StockInwardReceiptItem {
  stockItemId: string;
  code: string;
  name: string;
  category: WorkshopStockCategory;
  quantityReceived: number;
  unit: string;
  unitCostDzd: number;
  rackLocation?: string;
  conformity: 'conforme' | 'reserves';
  notes?: string;
}

export interface StockInwardReceipt {
  receiptNumber: string;
  supplierName: string;
  supplierDeliveryNoteRef: string;
  deliveryDate: string;
  receiverName: string;
  items: StockInwardReceiptItem[];
  totalValueDzd: number;
  notes?: string;
}

const RECEIPTS_STORAGE_KEY = 'baiti_workshop_stock_receipts_v1';

export function getRecentStockReceipts(): StockInwardReceipt[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(RECEIPTS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveStockReceipt(receipt: StockInwardReceipt): void {
  if (typeof window === 'undefined') return;
  try {
    const current = getRecentStockReceipts();
    const updated = [receipt, ...current].slice(0, 50);
    localStorage.setItem(RECEIPTS_STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // Storage quota fallback
  }
}

export function recordStockInwardReceipt(receipt: StockInwardReceipt): WorkshopStockItem[] {
  const current = getWorkshopStock();
  const updated = current.map((item) => {
    const received = receipt.items.find((r) => r.stockItemId === item.id || r.code === item.code);
    if (received && received.quantityReceived > 0) {
      return {
        ...item,
        currentQuantity: item.currentQuantity + received.quantityReceived,
        rackLocation: received.rackLocation || item.rackLocation,
        unitCostDzd: received.unitCostDzd > 0 ? received.unitCostDzd : item.unitCostDzd,
        lastUpdated: new Date().toISOString(),
      };
    }
    return item;
  });

  saveWorkshopStock(updated);
  saveStockReceipt(receipt);
  return updated;
}

