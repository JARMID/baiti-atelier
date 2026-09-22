import type { AlgerianWilaya } from './algerianWilayas';

export type DtrZone = 'zone_a' | 'zone_b' | 'zone_c';

export interface ZoneThreshold {
  zone: DtrZone;
  label: string;
  subLabel: string;
  maxUw: number; // W/(m²·K)
  maxSw: number; // Maximum solar factor for summer comfort
  minRw: number; // dB acoustic
  description: string;
}

export const DTR_ZONE_THRESHOLDS: Record<DtrZone, ZoneThreshold> = {
  zone_a: {
    zone: 'zone_a',
    label: 'Zone A - Littoral & Tell',
    subLabel: 'Alger, Oran, Annaba, Béjaïa, Tipaza',
    maxUw: 3.2,
    maxSw: 0.55,
    minRw: 28,
    description: 'Climat tempéré méditerranéen. Priorité à la ventilation nocturne et à la protection contre la salinité.',
  },
  zone_b: {
    zone: 'zone_b',
    label: 'Zone B - Hauts Plateaux & Atlas',
    subLabel: 'Sétif, Batna, Djelfa, Médéa, BBA, Constantine',
    maxUw: 2.6,
    maxSw: 0.45,
    minRw: 30,
    description: 'Hiver rigoureux avec gelées fréquentes et amplitude thermique jour/nuit élevée. Barrette RPT 24mm obligatoire.',
  },
  zone_c: {
    zone: 'zone_c',
    label: 'Zone C - Sud & Sahara',
    subLabel: 'Biskra, Ouargla, Ghardaïa, Béchar, El Oued, Adrar',
    maxUw: 2.8,
    maxSw: 0.35,
    minRw: 32,
    description: 'Ensoleillement extrême et canicule estivale prolongée. Double vitrage teinté ou Stop-Sol impératif.',
  },
};

export function getDtrZoneForWilaya(wilaya: AlgerianWilaya): DtrZone {
  if (
    wilaya.region === 'sud' ||
    wilaya.region === 'grand_sud' ||
    ['07', '08', '11', '30', '33', '37', '39', '47', '49', '50', '51', '52', '53', '54', '55', '56', '57', '58'].includes(
      wilaya.code
    )
  ) {
    return 'zone_c';
  }
  if (
    wilaya.region === 'hauts_plateaux' ||
    ['03', '04', '05', '12', '14', '17', '19', '20', '22', '24', '25', '26', '28', '29', '32', '34', '38', '40', '41', '43', '45'].includes(
      wilaya.code
    )
  ) {
    return 'zone_b';
  }
  return 'zone_a';
}
