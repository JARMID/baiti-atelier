import type { GlassType } from '../types/window';

export type SpacerType = 'standard_alu' | 'warm_edge';
export type GasFilling = 'air' | 'argon';
export type GlassCategory = 'standard' | 'thermique' | 'acoustique' | 'solaire' | 'intimite' | 'securite';

export interface GlassSpecification {
  id: GlassType;
  labelFr: string;
  shortLabel: string;
  tradeFormula: string;
  category: GlassCategory;
  ug: number;
  rwDb: number;
  sw: number;
  tl: number;
  thicknessTotalMm: number;
  basePriceDzdPerM2: number;
  recommendedSpacer: SpacerType;
  gasFilling: GasFilling;
  applicationTradeFr: string;
  visualProps: {
    color: string;
    roughness: number;
    transmission: number;
    opacity: number;
    ior: number;
  };
}

export const GLASS_SPECIFICATIONS: Record<GlassType, GlassSpecification> = {
  simple_clear: {
    id: 'simple_clear',
    labelFr: 'Simple Vitrage Clair 6 mm',
    shortLabel: 'Simple 6mm',
    tradeFormula: '6 mm Clair',
    category: 'standard',
    ug: 5.7,
    rwDb: 29,
    sw: 0.82,
    tl: 0.89,
    thicknessTotalMm: 6,
    basePriceDzdPerM2: 2600,
    recommendedSpacer: 'standard_alu',
    gasFilling: 'air',
    applicationTradeFr: 'Cloisons atelier, impostes intérieures et menuiseries économiques',
    visualProps: {
      color: '#EAF5F4',
      roughness: 0.05,
      transmission: 0.92,
      opacity: 0.35,
      ior: 1.52,
    },
  },
  double_clear: {
    id: 'double_clear',
    labelFr: 'Double Vitrage 4/16/4 Isolation',
    shortLabel: 'Double 4/16/4',
    tradeFormula: '4-16-4 Air',
    category: 'standard',
    ug: 2.7,
    rwDb: 32,
    sw: 0.76,
    tl: 0.81,
    thicknessTotalMm: 24,
    basePriceDzdPerM2: 5400,
    recommendedSpacer: 'standard_alu',
    gasFilling: 'air',
    applicationTradeFr: 'Résidentiel standard, isolation thermique courante CNERIB',
    visualProps: {
      color: '#DCEDEB',
      roughness: 0.06,
      transmission: 0.88,
      opacity: 0.45,
      ior: 1.52,
    },
  },
  stop_sol: {
    id: 'stop_sol',
    labelFr: 'Stop-Sol Réfléchissant Anti-Chaleur',
    shortLabel: 'Stop-Sol 4/16/4',
    tradeFormula: '4-16-4 Stop-Sol',
    category: 'solaire',
    ug: 2.4,
    rwDb: 32,
    sw: 0.28,
    tl: 0.38,
    thicknessTotalMm: 24,
    basePriceDzdPerM2: 7800,
    recommendedSpacer: 'standard_alu',
    gasFilling: 'air',
    applicationTradeFr: 'Façades plein sud et wilayas sahariennes à fort ensoleillement',
    visualProps: {
      color: '#253B47',
      roughness: 0.12,
      transmission: 0.52,
      opacity: 0.72,
      ior: 1.65,
    },
  },
  sable: {
    id: 'sable',
    labelFr: 'Vitrage Sablé Dépoli Intimité',
    shortLabel: 'Sablé Dépoli',
    tradeFormula: '4-16-4 Sablé',
    category: 'intimite',
    ug: 3.0,
    rwDb: 31,
    sw: 0.44,
    tl: 0.55,
    thicknessTotalMm: 24,
    basePriceDzdPerM2: 4900,
    recommendedSpacer: 'standard_alu',
    gasFilling: 'air',
    applicationTradeFr: 'Salles de bains, sanitaires, cabinets médicaux et zones à occulter',
    visualProps: {
      color: '#E2E8F0',
      roughness: 0.78,
      transmission: 0.62,
      opacity: 0.88,
      ior: 1.45,
    },
  },
  double_argon_warmedge: {
    id: 'double_argon_warmedge',
    labelFr: 'Double Vitrage 4/16/4 Argon + Warm-Edge',
    shortLabel: '4/16/4 Argon WE',
    tradeFormula: '4-16-4 Argon 90% WE',
    category: 'thermique',
    ug: 1.3,
    rwDb: 33,
    sw: 0.5,
    tl: 0.79,
    thicknessTotalMm: 24,
    basePriceDzdPerM2: 6800,
    recommendedSpacer: 'warm_edge',
    gasFilling: 'argon',
    applicationTradeFr: 'Haute performance thermique DTR C3-2, rupture thermique renforcée',
    visualProps: {
      color: '#D5EDEA',
      roughness: 0.05,
      transmission: 0.89,
      opacity: 0.42,
      ior: 1.52,
    },
  },
  phonique_stadip: {
    id: 'phonique_stadip',
    labelFr: 'Feuilleté Phonique Stadip Silence 6/16/4',
    shortLabel: 'Stadip Phonique 38dB',
    tradeFormula: '44.2 Silence - 16 - 4',
    category: 'acoustique',
    ug: 1.4,
    rwDb: 38,
    sw: 0.48,
    tl: 0.75,
    thicknessTotalMm: 28,
    basePriceDzdPerM2: 9500,
    recommendedSpacer: 'warm_edge',
    gasFilling: 'argon',
    applicationTradeFr: 'Boulevards urbains, rocades, autoroutes et zones à trafic bruyant',
    visualProps: {
      color: '#CFE6EC',
      roughness: 0.08,
      transmission: 0.85,
      opacity: 0.5,
      ior: 1.53,
    },
  },
  securit_tempered: {
    id: 'securit_tempered',
    labelFr: 'Verre Trempé Sécurit 8 mm',
    shortLabel: 'Sécurit 8mm',
    tradeFormula: '8 mm Trempé',
    category: 'securite',
    ug: 5.5,
    rwDb: 32,
    sw: 0.79,
    tl: 0.87,
    thicknessTotalMm: 8,
    basePriceDzdPerM2: 6200,
    recommendedSpacer: 'standard_alu',
    gasFilling: 'air',
    applicationTradeFr: 'Vitrines commerciales, portes d entrée et protection anti-choc',
    visualProps: {
      color: '#E8F2F4',
      roughness: 0.04,
      transmission: 0.94,
      opacity: 0.32,
      ior: 1.51,
    },
  },
};

export const GLASS_LIST: GlassSpecification[] = [
  GLASS_SPECIFICATIONS.double_clear,
  GLASS_SPECIFICATIONS.double_argon_warmedge,
  GLASS_SPECIFICATIONS.phonique_stadip,
  GLASS_SPECIFICATIONS.stop_sol,
  GLASS_SPECIFICATIONS.sable,
  GLASS_SPECIFICATIONS.securit_tempered,
  GLASS_SPECIFICATIONS.simple_clear,
];

export function getGlassSpec(glassType: GlassType | string): GlassSpecification {
  if (glassType in GLASS_SPECIFICATIONS) {
    return GLASS_SPECIFICATIONS[glassType as GlassType];
  }
  return GLASS_SPECIFICATIONS.double_clear;
}

export function getEffectiveUg(glassType: GlassType | string, spacerType: SpacerType = 'standard_alu'): number {
  const spec = getGlassSpec(glassType);
  if (spec.thicknessTotalMm <= 8) {
    return spec.ug;
  }
  if (spacerType === 'warm_edge' && spec.id === 'double_clear') {
    return 2.5;
  }
  return spec.ug;
}

export function getEffectiveRw(glassType: GlassType | string, spacerType: SpacerType = 'standard_alu'): number {
  const spec = getGlassSpec(glassType);
  if (spacerType === 'warm_edge' && spec.thicknessTotalMm > 8) {
    return spec.rwDb + 1;
  }
  return spec.rwDb;
}

export function formatAcousticRating(rw: number): {
  label: string;
  badgeClass: string;
  noiseDropRatio: string;
} {
  if (rw >= 38) {
    return {
      label: 'Isolation Acoustique Supérieure (Trafic Intense)',
      badgeClass: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
      noiseDropRatio: '-85% de bruit perçu',
    };
  }
  if (rw >= 33) {
    return {
      label: 'Isolation Acoustique Renforcée (Urbain Calme)',
      badgeClass: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',
      noiseDropRatio: '-70% de bruit perçu',
    };
  }
  if (rw >= 30) {
    return {
      label: 'Isolation Acoustique Standard (Résidentiel)',
      badgeClass: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
      noiseDropRatio: '-50% de bruit perçu',
    };
  }
  return {
    label: 'Isolation Acoustique Basique (Intérieur)',
    badgeClass: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    noiseDropRatio: '-30% de bruit perçu',
  };
}

export function formatThermalRating(ug: number): {
  label: string;
  badgeClass: string;
  energyGrade: string;
} {
  if (ug <= 1.4) {
    return {
      label: 'Haute Efficacité Thermique DTR C3-2',
      badgeClass: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
      energyGrade: 'Classe A+',
    };
  }
  if (ug <= 2.7) {
    return {
      label: 'Isolation Thermique Conforme Standard',
      badgeClass: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',
      energyGrade: 'Classe B',
    };
  }
  if (ug <= 3.2) {
    return {
      label: 'Isolation Thermique Modérée',
      badgeClass: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
      energyGrade: 'Classe C',
    };
  }
  return {
    label: 'Déperdition Élevée (Non Isolé)',
    badgeClass: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
    energyGrade: 'Classe E',
  };
}
