/**
 * Site Delivery & Multi-Unit Logistics Packaging Manifest Manager
 * Baiti Atelier Aluminum & PVC Architectural Joinery Suite
 *
 * Manages site delivery manifests (Bordereaux de Livraison par Chantier):
 * - Multi-package palletizing and classification (dormants, ouvrants, vitrages, volets, quincaillerie)
 * - Vehicle and driver dispatch tracking (plateau, pupitre miroiterie, fourgon)
 * - Client site reception checklist with condition audits
 * - WhatsApp driver and client notifications
 */

import type { WorkshopJob } from '../types/workshop';

export type PackageCategory =
  | 'cadres_dormants'
  | 'ouvrants_vantaux'
  | 'vitrages_pupitre'
  | 'volets_roulants'
  | 'quincaillerie_accessoires'
  | 'habillage_bavettes';

export type PackageCondition = 'intact' | 'reserve_mineure' | 'refuse_endommage';

export interface DeliveryPackageItem {
  id: string;
  packageNumber: number;
  category: PackageCategory;
  labelFr: string;
  contentsDescription: string;
  itemCount: number;
  weightEstimatedKg: number;
  dimensionsEstimated: string;
  isFragileGlass: boolean;
  status: 'pret_atelier' | 'charge_camion' | 'decharge_chantier' | 'reserve';
  condition: PackageCondition;
  conditionNote?: string;
}

export interface VehicleDispatchInfo {
  vehicleType: 'camionnette_plateau' | 'camion_pupitre_verre' | 'fourgon_bache' | 'vehicule_leger';
  vehiclePlate: string;
  driverName: string;
  driverPhone: string;
  departureDate: string;
  departureTime: string;
}

export interface SiteDeliveryManifest {
  manifestId: string;
  jobId: string;
  clientName: string;
  clientPhone: string;
  deliverySiteAddress: string;
  wilayaName: string;
  totalPackagesCount: number;
  totalWeightKg: number;
  hasFragileGlass: boolean;
  vehicle: VehicleDispatchInfo;
  packages: DeliveryPackageItem[];
  receiverName?: string;
  receiverPhone?: string;
  receiverIdCard?: string;
  signedAt?: string;
  generalNotes?: string;
}

const STORAGE_KEY_MANIFESTS = 'baiti_site_delivery_manifests_v1';

export const PACKAGE_CATEGORY_CONFIG: Record<
  PackageCategory,
  { labelFr: string; defaultWeightKg: number; colorClass: string; iconName: string }
> = {
  cadres_dormants: {
    labelFr: 'Cadres Dormants Assemblés',
    defaultWeightKg: 18,
    colorClass: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
    iconName: 'Box',
  },
  ouvrants_vantaux: {
    labelFr: 'Vantaux & Battants Mobiles',
    defaultWeightKg: 22,
    colorClass: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
    iconName: 'Layers',
  },
  vitrages_pupitre: {
    labelFr: 'Vitrages Isolants sur Pupitre',
    defaultWeightKg: 45,
    colorClass: 'text-sky-400 bg-sky-500/10 border-sky-500/30',
    iconName: 'ShieldAlert',
  },
  volets_roulants: {
    labelFr: 'Caissons & Coulisses de Volets',
    defaultWeightKg: 14,
    colorClass: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30',
    iconName: 'Sliders',
  },
  quincaillerie_accessoires: {
    labelFr: 'Carton Quincaillerie & Fixations',
    defaultWeightKg: 8,
    colorClass: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
    iconName: 'PackageCheck',
  },
  habillage_bavettes: {
    labelFr: 'Bottes Cornières & Bavettes Appui',
    defaultWeightKg: 12,
    colorClass: 'text-purple-400 bg-purple-500/10 border-purple-500/30',
    iconName: 'AlignJustify',
  },
};

/**
 * Generate a smart default delivery manifest breakdown from a workshop job
 */
export function buildDefaultManifestForJob(job: WorkshopJob): SiteDeliveryManifest {
  const count = Math.max(1, job.itemCount || 1);
  const now = new Date();
  const dateStr = now.toISOString().split('T')[0];
  const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  const packages: DeliveryPackageItem[] = [];
  let pkgIdx = 1;

  // 1. Cadres dormants (grouped in packs of 2 to 4 frames)
  const dormantPacks = Math.max(1, Math.ceil(count / 3));
  for (let i = 1; i <= dormantPacks; i++) {
    packages.push({
      id: `pkg_${pkgIdx}`,
      packageNumber: pkgIdx,
      category: 'cadres_dormants',
      labelFr: `Colis Dormants #${i}/${dormantPacks}`,
      contentsDescription: `Cadres dormants avec équerres serties et cales de transport (${Math.min(3, count - (i - 1) * 3)} châssis)`,
      itemCount: Math.min(3, count - (i - 1) * 3),
      weightEstimatedKg: 24,
      dimensionsEstimated: '1400 × 1200 × 250 mm',
      isFragileGlass: false,
      status: 'pret_atelier',
      condition: 'intact',
    });
    pkgIdx += 1;
  }

  // 2. Vantaux ouvrants (if casement / sliding)
  const sashPacks = Math.max(1, Math.ceil(count / 2));
  for (let i = 1; i <= sashPacks; i++) {
    packages.push({
      id: `pkg_${pkgIdx}`,
      packageNumber: pkgIdx,
      category: 'ouvrants_vantaux',
      labelFr: `Colis Vantaux #${i}/${sashPacks}`,
      contentsDescription: `Vantaux ferrés équipés de paumelles, crémones et joints d étanchéité`,
      itemCount: Math.min(2, count - (i - 1) * 2) * 2,
      weightEstimatedKg: 30,
      dimensionsEstimated: '1350 × 600 × 200 mm',
      isFragileGlass: false,
      status: 'pret_atelier',
      condition: 'intact',
    });
    pkgIdx += 1;
  }

  // 3. Vitrages sur pupitre ou en caisse
  packages.push({
    id: `pkg_${pkgIdx}`,
    packageNumber: pkgIdx,
    category: 'vitrages_pupitre',
    labelFr: 'Chevalet / Pupitre Vitrages Isolants',
    contentsDescription: `Volumes double vitrage avec intercalaires et étiquettes repères par châssis (${count} volumes)`,
    itemCount: count,
    weightEstimatedKg: count * 18,
    dimensionsEstimated: 'Sur chevalet métallique atelier',
    isFragileGlass: true,
    status: 'pret_atelier',
    condition: 'intact',
  });
  pkgIdx += 1;

  // 4. Carton quincaillerie et fixations en vrac
  packages.push({
    id: `pkg_${pkgIdx}`,
    packageNumber: pkgIdx,
    category: 'quincaillerie_accessoires',
    labelFr: 'Carton Quincaillerie & Fixations',
    contentsDescription: `Poignées aluminium, barillets avec clés sous sachet, chevilles béton, vis dormants, silicone Bostik et cales DTU 39`,
    itemCount: count * 4 + 10,
    weightEstimatedKg: 9,
    dimensionsEstimated: '400 × 300 × 250 mm',
    isFragileGlass: false,
    status: 'pret_atelier',
    condition: 'intact',
  });
  pkgIdx += 1;

  // 5. Bottes d habillage et cornières
  packages.push({
    id: `pkg_${pkgIdx}`,
    packageNumber: pkgIdx,
    category: 'habillage_bavettes',
    labelFr: 'Botte Profilés d Habillage & Bavettes',
    contentsDescription: `Cornières de finition, couvre-joints adhésifs et bavettes rejingot d appui sous film étirable`,
    itemCount: count * 2,
    weightEstimatedKg: 14,
    dimensionsEstimated: 'Longueurs 2500 mm sous film',
    isFragileGlass: false,
    status: 'pret_atelier',
    condition: 'intact',
  });

  const totalWeight = packages.reduce((sum, p) => sum + p.weightEstimatedKg, 0);

  return {
    manifestId: `BL-${job.id.replace(/[^A-Za-z0-9]/g, '')}-${Date.now().toString().slice(-4)}`,
    jobId: job.id,
    clientName: job.clientName,
    clientPhone: job.clientPhone,
    deliverySiteAddress: `${job.wilaya}, Chantier Principal`,
    wilayaName: job.wilaya,
    totalPackagesCount: packages.length,
    totalWeightKg: totalWeight,
    hasFragileGlass: true,
    vehicle: {
      vehicleType: 'camionnette_plateau',
      vehiclePlate: '01429-116-16',
      driverName: 'Mourad Hadj (Livreur Atelier)',
      driverPhone: '0550 44 22 11',
      departureDate: dateStr,
      departureTime: timeStr,
    },
    packages,
    generalNotes: 'Vérifier la bonne fixation sur le chevalet porte-verre avant le départ.',
  };
}

/**
 * Retrieve saved manifests from LocalStorage
 */
export function getAllSavedDeliveryManifests(): Record<string, SiteDeliveryManifest> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY_MANIFESTS);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

/**
 * Save or update a site delivery manifest
 */
export function saveDeliveryManifest(manifest: SiteDeliveryManifest): void {
  if (typeof window === 'undefined') return;
  try {
    const all = getAllSavedDeliveryManifests();
    all[manifest.jobId] = manifest;
    localStorage.setItem(STORAGE_KEY_MANIFESTS, JSON.stringify(all));
  } catch (err) {
    console.error('Failed to save delivery manifest to storage', err);
  }
}

/**
 * Retrieve delivery manifest for a specific job
 */
export function getDeliveryManifestForJob(job: WorkshopJob): SiteDeliveryManifest {
  const all = getAllSavedDeliveryManifests();
  if (all[job.id]) {
    return all[job.id];
  }
  const generated = buildDefaultManifestForJob(job);
  saveDeliveryManifest(generated);
  return generated;
}

/**
 * Formats a clean WhatsApp dispatch notification for the client and driver
 */
export function formatSiteDeliveryWhatsApp(manifest: SiteDeliveryManifest): string {
  let msg = '*AVIS DE DÉPART LIVRAISON CHANTIER • BAITI ATELIER*\n';
  msg += `Réf Bordereau : *${manifest.manifestId}*\n`;
  msg += `Affaire : *${manifest.jobId}*\n`;
  msg += `Client : *${manifest.clientName}*\n`;
  msg += `Destination : ${manifest.deliverySiteAddress}\n\n`;

  msg += '*DÉTAILS DU TRANSPORT & CHAUFFEUR :*\n';
  msg += `• Véhicule : ${manifest.vehicle.vehicleType === 'camionnette_plateau' ? 'Camionnette Plateau' : 'Camion Pupitre Verre'}\n`;
  msg += `• Immatriculation : *${manifest.vehicle.vehiclePlate}*\n`;
  msg += `• Chauffeur : ${manifest.vehicle.driverName} (${manifest.vehicle.driverPhone})\n`;
  msg += `• Départ atelier : ${manifest.vehicle.departureDate} à ${manifest.vehicle.departureTime}\n\n`;

  msg += `*COLISAGE (${manifest.packages.length} COLIS - ~${manifest.totalWeightKg} KG) :*\n`;
  manifest.packages.forEach((pkg) => {
    msg += `• [Colis ${pkg.packageNumber}] *${pkg.labelFr}* (${pkg.itemCount} pièces, ~${pkg.weightEstimatedKg} kg)\n`;
    if (pkg.isFragileGlass) {
      msg += `  ⚠️ *VITRAGE FRAGILE :* ${pkg.contentsDescription}\n`;
    }
  });

  msg += '\n*CONSIGNES DE RÉCEPTION :*\n';
  msg += 'Merci de prévoir l accès au chantier pour le déchargement et une zone abritée pour stocker les vitrages et la quincaillerie.\n';
  msg += '\nBaiti Atelier Menuiserie Aluminium & PVC Algérie';

  return msg;
}
