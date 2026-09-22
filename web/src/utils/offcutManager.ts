import { saveNativeOffcuts, loadNativeOffcuts, isTauriDesktop } from '../services/desktopBridge';

export interface OffcutRecord {
  id: string;
  profileCode: string;
  label: string;
  material: 'aluminium' | 'pvc' | 'bois' | 'acier';
  finishColor: string;
  lengthMm: number;
  rackLocation: string;
  createdAt: string;
  jobOrigin?: string;
  barcode: string;
  isReserved?: boolean;
}

const STORAGE_KEY = 'baiti_offcut_inventory_v1';

const INITIAL_OFFCUTS: OffcutRecord[] = [
  {
    id: 'offcut-101',
    profileCode: 'TPR-40',
    label: 'Dormant Tubulaire 40 RPT',
    material: 'aluminium',
    finishColor: 'Blanc RAL 9016',
    lengthMm: 1850,
    rackLocation: 'CASIER-A-01',
    createdAt: '2026-09-18T10:30:00Z',
    jobOrigin: 'Villa Hydra - Lot Menuiserie',
    barcode: 'CHT-ALU-0101',
  },
  {
    id: 'offcut-102',
    profileCode: 'TPR-40',
    label: 'Dormant Tubulaire 40 RPT',
    material: 'aluminium',
    finishColor: 'Blanc RAL 9016',
    lengthMm: 1420,
    rackLocation: 'CASIER-A-02',
    createdAt: '2026-09-19T14:15:00Z',
    jobOrigin: 'Immeuble Kouba',
    barcode: 'CHT-ALU-0102',
  },
  {
    id: 'offcut-103',
    profileCode: 'TPR-OUV',
    label: 'Ouvrant Frappe 40 RPT',
    material: 'aluminium',
    finishColor: 'Gris Anthracite 7016',
    lengthMm: 1980,
    rackLocation: 'CASIER-A-05',
    createdAt: '2026-09-20T09:00:00Z',
    jobOrigin: 'Résidence Bab Ezzouar',
    barcode: 'CHT-ALU-0103',
  },
  {
    id: 'offcut-104',
    profileCode: 'TPR-OUV',
    label: 'Ouvrant Frappe 40 RPT',
    material: 'aluminium',
    finishColor: 'Blanc RAL 9016',
    lengthMm: 1150,
    rackLocation: 'CASIER-A-06',
    createdAt: '2026-09-20T11:45:00Z',
    jobOrigin: 'Villa Birkhadem',
    barcode: 'CHT-ALU-0104',
  },
  {
    id: 'offcut-105',
    profileCode: 'PAR-16',
    label: 'Parclose Clip 16mm',
    material: 'aluminium',
    finishColor: 'Blanc RAL 9016',
    lengthMm: 2100,
    rackLocation: 'CASIER-B-01',
    createdAt: '2026-09-21T16:20:00Z',
    jobOrigin: 'Bureau Chéraga',
    barcode: 'CHT-ALU-0105',
  },
  {
    id: 'offcut-106',
    profileCode: 'PVC-DORM',
    label: 'Dormant PVC 60 4 Chambres',
    material: 'pvc',
    finishColor: 'Blanc RAL 9016',
    lengthMm: 1650,
    rackLocation: 'CASIER-PVC-02',
    createdAt: '2026-09-21T08:10:00Z',
    jobOrigin: 'Chantier Zéralda',
    barcode: 'CHT-PVC-0106',
  },
];

export function getOffcutInventory(): OffcutRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_OFFCUTS));
      return INITIAL_OFFCUTS;
    }
    return JSON.parse(raw) as OffcutRecord[];
  } catch {
    return INITIAL_OFFCUTS;
  }
}

export function saveOffcutInventory(items: OffcutRecord[]): void {
  try {
    const json = JSON.stringify(items);
    localStorage.setItem(STORAGE_KEY, json);
    if (isTauriDesktop()) {
      saveNativeOffcuts(json).catch((err) =>
        console.warn('Native offcut desktop sync error:', err)
      );
    }
  } catch {
    // local storage unavailable fallback
  }
}

export async function syncOffcutInventoryWithDesktop(): Promise<OffcutRecord[]> {
  if (isTauriDesktop()) {
    try {
      const nativeJson = await loadNativeOffcuts();
      if (nativeJson && nativeJson !== '[]') {
        const parsed = JSON.parse(nativeJson) as OffcutRecord[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          localStorage.setItem(STORAGE_KEY, nativeJson);
          return parsed;
        }
      }
    } catch (err) {
      console.warn('Error reading native offcuts:', err);
    }
  }
  return getOffcutInventory();
}

export function addOffcut(
  offcut: Omit<OffcutRecord, 'id' | 'createdAt' | 'barcode'>
): OffcutRecord {
  const current = getOffcutInventory();
  const index = current.length + 1;
  const prefix = offcut.material === 'pvc' ? 'CHT-PVC' : 'CHT-ALU';
  const newRecord: OffcutRecord = {
    ...offcut,
    id: `offcut-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    barcode: `${prefix}-${String(index).padStart(4, '0')}`,
    createdAt: new Date().toISOString(),
  };

  const updated = [newRecord, ...current];
  saveOffcutInventory(updated);
  return newRecord;
}

export function removeOffcut(id: string): void {
  const current = getOffcutInventory();
  const updated = current.filter((item) => item.id !== id);
  saveOffcutInventory(updated);
}

export function consumeOffcuts(ids: string[]): void {
  const current = getOffcutInventory();
  const set = new Set(ids);
  const updated = current.filter((item) => !set.has(item.id));
  saveOffcutInventory(updated);
}

export function clearAllOffcuts(): void {
  saveOffcutInventory([]);
}

export function resetDefaultOffcuts(): void {
  saveOffcutInventory(INITIAL_OFFCUTS);
}

export function findMatchingOffcuts(
  profileCode: string,
  minLength: number
): OffcutRecord[] {
  const all = getOffcutInventory();
  return all
    .filter(
      (item) =>
        item.profileCode.toLowerCase() === profileCode.toLowerCase() &&
        item.lengthMm >= minLength
    )
    .sort((a, b) => a.lengthMm - b.lengthMm); // Best fit: smallest suitable offcut first
}
