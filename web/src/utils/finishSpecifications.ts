import type { FinishColor } from '../types/window';

export type SurfaceTreatmentType = 'thermolaquage' | 'sublimation' | 'anodisation';
export type FinishTexture = 'brillant' | 'sable' | 'mat' | 'veine' | 'satine';

export interface FinishSpecification {
  id: FinishColor;
  labelFr: string;
  labelAr: string;
  labelEn: string;
  ralCode?: string;
  treatmentType: SurfaceTreatmentType;
  treatmentLabelFr: string;
  treatmentLabelAr: string;
  texture: FinishTexture;
  textureLabelFr: string;
  priceMultiplier: number;
  surchargeDzdPerKg: number;
  colorHex: string;
  roughness: number;
  metalness: number;
  qualityLabelFr: string;
  guaranteeYears: number;
  descriptionFr: string;
  recommendedUseFr: string;
}

export const FINISH_LIST: FinishSpecification[] = [
  {
    id: 'ral_9016',
    labelFr: 'Blanc Pur Brillant',
    labelAr: 'أبيض ناصع لامع (RAL 9016)',
    labelEn: 'Pure White Gloss (RAL 9016)',
    ralCode: 'RAL 9016',
    treatmentType: 'thermolaquage',
    treatmentLabelFr: 'Thermolaquage Polyester',
    treatmentLabelAr: 'طلاء حراري بودرة بوليستر',
    texture: 'brillant',
    textureLabelFr: 'Brillant Lisse (85 GU)',
    priceMultiplier: 1.0,
    surchargeDzdPerKg: 0,
    colorHex: '#F8FAFC',
    roughness: 0.32,
    metalness: 0.15,
    qualityLabelFr: 'Qualicoat Classe 1',
    guaranteeYears: 10,
    descriptionFr: 'Thermolaquage blanc haute réflexion solaire, standard le plus économique et répandu en Algérie.',
    recommendedUseFr: 'Habitations collectives, promotions immobilières, et loggias standards.',
  },
  {
    id: 'ral_7016',
    labelFr: 'Gris Anthracite Sablé',
    labelAr: 'رمادي أنثراسيت محبب (RAL 7016)',
    labelEn: 'Textured Anthracite Grey (RAL 7016)',
    ralCode: 'RAL 7016',
    treatmentType: 'thermolaquage',
    treatmentLabelFr: 'Thermolaquage Haute Durabilité',
    treatmentLabelAr: 'طلاء حراري عالي المتانة',
    texture: 'sable',
    textureLabelFr: 'Sablé Texturé Fin (60 µm)',
    priceMultiplier: 1.08,
    surchargeDzdPerKg: 65,
    colorHex: '#374151',
    roughness: 0.45,
    metalness: 0.35,
    qualityLabelFr: 'Qualicoat Seaside',
    guaranteeYears: 15,
    descriptionFr: 'Finition architecturale contemporaine mate et texturée, masquant les micro-rayures et traces de doigts.',
    recommendedUseFr: 'Villas modernes, baies coulissantes minimalistes, et façades contemporaines.',
  },
  {
    id: 'ral_9005',
    labelFr: 'Noir Profond Mat Fine Texture',
    labelAr: 'أسود مطفي ملمس ناعم (RAL 9005)',
    labelEn: 'Deep Matte Black (RAL 9005)',
    ralCode: 'RAL 9005',
    treatmentType: 'thermolaquage',
    treatmentLabelFr: 'Thermolaquage Architectural',
    treatmentLabelAr: 'طلاء معماري حديث',
    texture: 'mat',
    textureLabelFr: 'Mat Velouté (15 GU)',
    priceMultiplier: 1.1,
    surchargeDzdPerKg: 80,
    colorHex: '#111827',
    roughness: 0.5,
    metalness: 0.25,
    qualityLabelFr: 'Qualicoat Classe 2',
    guaranteeYears: 15,
    descriptionFr: 'Noir sobre ultra-mat inspiré des verrières atelier d artiste et profils industriels épurés.',
    recommendedUseFr: 'Verrières intérieures, lofts, bureaux de direction, et menuiseries de standing.',
  },
  {
    id: 'faux_bois',
    labelFr: 'Faux Bois Chêne Doré',
    labelAr: 'خشب سندياني مذهب (Sublimation)',
    labelEn: 'Golden Oak Woodgrain (Sublimation)',
    ralCode: 'Sublimation Chêne',
    treatmentType: 'sublimation',
    treatmentLabelFr: 'Sublimation Sous Vide Poudre-sur-Poudre',
    treatmentLabelAr: 'تقنية سبلوميشن طبع حراري ثلاثي الأبعاد',
    texture: 'veine',
    textureLabelFr: 'Effet Veiné Chêne Naturel',
    priceMultiplier: 1.25,
    surchargeDzdPerKg: 190,
    colorHex: '#92400E',
    roughness: 0.58,
    metalness: 0.08,
    qualityLabelFr: 'Qualideco Label',
    guaranteeYears: 10,
    descriptionFr: 'Reproduction réaliste des fibres du chêne sur profilé alu avec thermo-transfert sous vide haute définition.',
    recommendedUseFr: 'Villas traditionnelles, chalets de montagne, et rénovations préservant le cachet boisé.',
  },
  {
    id: 'faux_bois_noyer',
    labelFr: 'Faux Bois Noyer Foncé',
    labelAr: 'خشب جوز داكن (Sublimation)',
    labelEn: 'Dark Walnut Woodgrain (Sublimation)',
    ralCode: 'Sublimation Noyer',
    treatmentType: 'sublimation',
    treatmentLabelFr: 'Sublimation Sous Vide Haute Résolution',
    treatmentLabelAr: 'سبلوميشن جوز فاخر',
    texture: 'veine',
    textureLabelFr: 'Effet Veiné Noyer Sombre',
    priceMultiplier: 1.28,
    surchargeDzdPerKg: 220,
    colorHex: '#451A03',
    roughness: 0.6,
    metalness: 0.08,
    qualityLabelFr: 'Qualideco Label',
    guaranteeYears: 10,
    descriptionFr: 'Texture bois sombre noble avec veinage accentué, conférant un standing haut de gamme.',
    recommendedUseFr: 'Salons de réception, portes d entrée prestige, et habillages intérieurs cossus.',
  },
  {
    id: 'bronze_ano',
    labelFr: 'Bronze Champagne Anodisé',
    labelAr: 'برونز مؤكسد شامباني (Qualanod)',
    labelEn: 'Champagne Bronze Anodized',
    ralCode: 'Anodisé C33',
    treatmentType: 'anodisation',
    treatmentLabelFr: 'Anodisation Électrolytique Colorée',
    treatmentLabelAr: 'أكسدة كهرلية برونزية',
    texture: 'satine',
    textureLabelFr: 'Satiné Métallique (Classe 15)',
    priceMultiplier: 1.18,
    surchargeDzdPerKg: 140,
    colorHex: '#78350F',
    roughness: 0.3,
    metalness: 0.75,
    qualityLabelFr: 'Qualanod Classe 15',
    guaranteeYears: 20,
    descriptionFr: 'Couche d alumine intégrée 15 microns par bain électrolytique, inaltérable face aux embruns marins.',
    recommendedUseFr: 'Zones côtières algériennes (Alger, Oran, Annaba), hôtellerie et façades exposées au sel marin.',
  },
  {
    id: 'argent_ano',
    labelFr: 'Argent Naturel Satiné',
    labelAr: 'فضي ألومنيوم طبيعي ساتيني (Qualanod)',
    labelEn: 'Natural Satin Silver Anodized',
    ralCode: 'Anodisé C0',
    treatmentType: 'anodisation',
    treatmentLabelFr: 'Anodisation Électrolytique Incolore',
    treatmentLabelAr: 'أكسدة طبيعية شفافة',
    texture: 'satine',
    textureLabelFr: 'Brossé Satiné Doux',
    priceMultiplier: 1.12,
    surchargeDzdPerKg: 95,
    colorHex: '#94A3B8',
    roughness: 0.28,
    metalness: 0.8,
    qualityLabelFr: 'Qualanod Classe 15',
    guaranteeYears: 20,
    descriptionFr: 'Teinte aluminium brut pur protégée par passivation anodique 15 microns, aspect technique intemporel.',
    recommendedUseFr: 'Cliniques, hôpitaux, locaux techniques, et menuiseries industrielles rigoureuses.',
  },
];

export const FINISH_MAP = new Map<FinishColor, FinishSpecification>(
  FINISH_LIST.map((f) => [f.id, f])
);

export function getFinishSpec(id: FinishColor): FinishSpecification {
  return FINISH_MAP.get(id) || FINISH_LIST[0];
}

export const FINISH_PALETTES: Record<
  FinishColor,
  { color: string; roughness: number; metalness: number }
> = {
  ral_9016: { color: '#F1F3F5', roughness: 0.32, metalness: 0.15 },
  ral_7016: { color: '#272B33', roughness: 0.45, metalness: 0.35 },
  ral_9005: { color: '#131418', roughness: 0.5, metalness: 0.25 },
  faux_bois: { color: '#784622', roughness: 0.58, metalness: 0.08 },
  faux_bois_noyer: { color: '#3B1F0E', roughness: 0.6, metalness: 0.08 },
  bronze_ano: { color: '#6A5641', roughness: 0.3, metalness: 0.75 },
  argent_ano: { color: '#94A3B8', roughness: 0.28, metalness: 0.8 },
};

export function formatFinishColorFr(id: string): string {
  const spec = FINISH_MAP.get(id as FinishColor);
  if (spec) return `${spec.labelFr} (${spec.ralCode || spec.treatmentLabelFr})`;
  if (id === 'ral_9016') return 'Blanc Pur 9016';
  if (id === 'ral_7016') return 'Gris Anthracite 7016';
  if (id === 'ral_9005') return 'Noir Mat 9005';
  if (id === 'faux_bois') return 'Faux Bois Chêne Doré';
  if (id === 'faux_bois_noyer') return 'Faux Bois Noyer Foncé';
  if (id === 'bronze_ano') return 'Bronze Anodisé Champagne';
  if (id === 'argent_ano') return 'Argent Naturel Satiné';
  return id;
}

export function formatFinishTreatmentBadge(type: SurfaceTreatmentType): {
  label: string;
  badgeClass: string;
} {
  switch (type) {
    case 'thermolaquage':
      return {
        label: 'Thermolaquage Poudre',
        badgeClass: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      };
    case 'sublimation':
      return {
        label: 'Sublimation Effet Bois',
        badgeClass: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
      };
    case 'anodisation':
      return {
        label: 'Anodisation Électrolytique',
        badgeClass: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
      };
    default:
      return {
        label: 'Traitement de Surface',
        badgeClass: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20',
      };
  }
}
