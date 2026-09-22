export interface MaterialSpotItem {
  id: string;
  category: 'aluminum' | 'glass' | 'wood' | 'metal' | 'hardware';
  nameFr: string;
  nameAr: string;
  nameEn: string;
  supplier: string; // e.g. "TPR Algérie", "Profilor", "Cevital MFG", "Saint-Gobain", "El Hadjar / Tosyali"
  unit: string;
  currentPriceDzd: number;
  previousPriceDzd: number;
  trend: 'up' | 'down' | 'stable';
  changePercent: number;
  standardLengthOrSize: string;
  notesFr: string;
  notesAr: string;
}

export interface WorkshopMarginCalibration {
  aluminumPriceMultiplier: number; // 0.85 to 1.30 (default 1.0)
  glassPriceMultiplier: number; // 0.85 to 1.30 (default 1.0)
  woodPriceMultiplier: number; // 0.85 to 1.30 (default 1.0)
  metalPriceMultiplier: number; // 0.85 to 1.30 (default 1.0)
  workshopTargetMarginPercent: number; // 15 to 40 (default 22%)
  artisanHourlyRateDzd: number; // 1200 to 3500 DZD (default 1800 DZD)
  lastCalibratedAt: string;
}

export const DEFAULT_WORKSHOP_CALIBRATION: WorkshopMarginCalibration = {
  aluminumPriceMultiplier: 1.0,
  glassPriceMultiplier: 1.0,
  woodPriceMultiplier: 1.0,
  metalPriceMultiplier: 1.0,
  workshopTargetMarginPercent: 22,
  artisanHourlyRateDzd: 1800,
  lastCalibratedAt: new Date().toISOString(),
};

export const ALGERIAN_MATERIAL_SPOT_DATA: MaterialSpotItem[] = [
  // 1. ALUMINIUM
  {
    id: 'alu-tpr-gamme45',
    category: 'aluminum',
    nameFr: 'Profilé Aluminium Gamme 45 Thermique (Barre 6.5m)',
    nameAr: 'مقطع ألمنيوم سلسلة 45 عازل حراري (قضيب 6.5م)',
    nameEn: 'Aluminum Profile 45 Thermal Break (6.5m bar)',
    supplier: 'TPR Algérie (Zone Industrielle Oued Smar)',
    unit: 'Barre 6.5m',
    currentPriceDzd: 10500,
    previousPriceDzd: 10200,
    trend: 'up',
    changePercent: 2.9,
    standardLengthOrSize: '6500 mm • 1.55 kg/m',
    notesFr: 'Alliage 6060 T5 thermolaqué conforme Qualicoat, rupture de pont thermique polyamide 14.8mm',
    notesAr: 'سبيكة 6060 T5 طلاء حراري معتمد كواليكوت، عازل حراري بولياميد 14.8 مم',
  },
  {
    id: 'alu-profilor-gamme40',
    category: 'aluminum',
    nameFr: 'Profilé Aluminium Gamme 40 Éco (Barre 6.0m)',
    nameAr: 'مقطع ألمنيوم سلسلة 40 اقتصادي (قضيب 6.0م)',
    nameEn: 'Aluminum Profile 40 Economic (6.0m bar)',
    supplier: 'Profilor / Alugraf (Sétif)',
    unit: 'Barre 6.0m',
    currentPriceDzd: 6800,
    previousPriceDzd: 6850,
    trend: 'stable',
    changePercent: -0.7,
    standardLengthOrSize: '6000 mm • 1.15 kg/m',
    notesFr: 'Idéal fenêtres standard et impostes intérieures, disponible en Blanc 9010 et Gris 7016',
    notesAr: 'مثالي للنوافذ القياسية والفواصل الداخلية، متوفر بالأبيض والرمادي',
  },
  {
    id: 'alu-sidal-gamme67',
    category: 'aluminum',
    nameFr: 'Profilé Coulissant Lourd Gamme 67 (Barre 6.5m)',
    nameAr: 'مقطع سحاب ثقيل سلسلة 67 (قضيب 6.5م)',
    nameEn: 'Heavy Sliding Profile System 67 (6.5m bar)',
    supplier: 'Sidal / Extral Algérie',
    unit: 'Barre 6.5m',
    currentPriceDzd: 12400,
    previousPriceDzd: 12100,
    trend: 'up',
    changePercent: 2.5,
    standardLengthOrSize: '6500 mm • 1.65 kg/m',
    notesFr: 'Pour baies vitrées de grandes portées avec rail inox de guidage intégré',
    notesAr: 'للواجهات الكبيرة مع سكة انزلاق إينوكس مدمجة لتحمل الأوزان العالية',
  },

  // 2. GLASS (VITRERIE)
  {
    id: 'glass-cevital-clear4',
    category: 'glass',
    nameFr: 'Verre Clair Float 4mm Extra-Net',
    nameAr: 'زجاج شفاف نقي 4 مم ممتاز',
    nameEn: 'Clear Float Glass 4mm Extra-Clear',
    supplier: 'Mediterranean Float Glass (MFG Cevital Larbaâ)',
    unit: 'm²',
    currentPriceDzd: 2600,
    previousPriceDzd: 2600,
    trend: 'stable',
    changePercent: 0.0,
    standardLengthOrSize: 'Plein plateau 3210 × 2250 mm',
    notesFr: 'Planéité optique supérieure, transmission lumineuse 89%',
    notesAr: 'استواء بصري فائق، نفاذية ضوئية 89%',
  },
  {
    id: 'glass-mfg-double-argon',
    category: 'glass',
    nameFr: 'Double Vitrage 4-16-4 Gaz Argon + Intercalaire Warm-Edge',
    nameAr: 'زجاج مزدوج 4-16-4 مع غاز الآرغون وفواصل حرارية',
    nameEn: 'Double Glazed Unit 4-16-4 Argon Gas Warm-Edge',
    supplier: 'MFG Cevital / Ateliers Partenaires',
    unit: 'm²',
    currentPriceDzd: 5800,
    previousPriceDzd: 5600,
    trend: 'up',
    changePercent: 3.5,
    standardLengthOrSize: 'Sur-mesure assemblé scellé butyl/silicone',
    notesFr: 'Coefficient Uw = 1.3 W/m²K, isolation acoustique -32dB',
    notesAr: 'معامل عزل حراري 1.3 واط/م² كلفن، عزل صوتي -32 ديسيبل',
  },
  {
    id: 'glass-stopsol-bronze',
    category: 'glass',
    nameFr: 'Verre Solaire Réfléchissant Stop-Sol Bronze 6mm',
    nameAr: 'زجاج عاكس للطاقة الشمسية ستوب سول برونزي 6 مم',
    nameEn: 'Solar Reflective Glass Stop-Sol Bronze 6mm',
    supplier: 'Saint-Gobain Algérie / Distributeurs',
    unit: 'm²',
    currentPriceDzd: 7900,
    previousPriceDzd: 8100,
    trend: 'down',
    changePercent: -2.4,
    standardLengthOrSize: 'Plateau 3210 × 2000 mm',
    notesFr: 'Protection solaire renforcée contre l’éblouissement et chaleur estivale',
    notesAr: 'حماية متقدمة من أشعة الشمس والحرارة الصيفية العالية',
  },

  // 3. WOOD & PANELS (BOIS & PANNEAUX)
  {
    id: 'wood-mdf-hydrofuge18',
    category: 'wood',
    nameFr: 'Panneau MDF Hydrofuge Vert 18mm',
    nameAr: 'لوح خشب إم دي إف مقاوم للرطوبة أخضر 18 مم',
    nameEn: 'Moisture-Resistant Green MDF 18mm Sheet',
    supplier: 'Importateurs Bois & Dérivés (Alger / Oran)',
    unit: 'Panneau (2.80 × 2.07 m)',
    currentPriceDzd: 8800,
    previousPriceDzd: 8600,
    trend: 'up',
    changePercent: 2.3,
    standardLengthOrSize: '2800 × 2070 × 18 mm (5.80 m²)',
    notesFr: 'Résistance élevée à l’humidité pour cuisines, salles d’eau et dressings',
    notesAr: 'مقاومة ممتازة للرطوبة للمطابخ والحمامات وخزائن الملابس',
  },
  {
    id: 'wood-melamine-egger',
    category: 'wood',
    nameFr: 'Panneau Mélaminé 18mm Finition Chêne Structuré',
    nameAr: 'لوح خشب ميلامين 18 مم ملمس بلوط طبيعي',
    nameEn: 'Melamine Faced Board 18mm Textured Oak',
    supplier: 'Distributeurs Nationaux (Sétif / Béjaïa)',
    unit: 'Panneau (2.80 × 2.07 m)',
    currentPriceDzd: 6400,
    previousPriceDzd: 6400,
    trend: 'stable',
    changePercent: 0.0,
    standardLengthOrSize: '2800 × 2070 × 18 mm',
    notesFr: 'Placage double face mélamine haute résistance aux rayures',
    notesAr: 'تغليف وجهين بميلامين عالي المقاومة للخدوش والتآكل',
  },

  // 4. STEEL & WROUGHT IRON (FERRONNERIE & ACIER)
  {
    id: 'steel-elhadjar-carre40',
    category: 'metal',
    nameFr: 'Tube Carré Acier Noir 40×40×2mm (Barre 6m)',
    nameAr: 'أنبوب فولاذي أسود مربع 40×40×2 مم (قضيب 6م)',
    nameEn: 'Black Square Steel Tube 40x40x2mm (6m bar)',
    supplier: 'Complexe Sidérurgique Sider El Hadjar / Tosyali',
    unit: 'Barre 6m',
    currentPriceDzd: 3200,
    previousPriceDzd: 3300,
    trend: 'down',
    changePercent: -3.0,
    standardLengthOrSize: '6000 mm • ~2.45 kg/m',
    notesFr: 'Qualité soudable pour portails, grilles de protection et clôtures lourdes',
    notesAr: 'فولاذ نقي قابل للحام للبوابات وشبابيك الحماية والأسوار',
  },
  {
    id: 'steel-carre-plein14',
    category: 'metal',
    nameFr: 'Fer Carré Plein 14×14mm Forgé à Chaud',
    nameAr: 'قضيب حديد صلب مربع 14×14 مم مشغول',
    nameEn: 'Solid Square Steel Bar 14x14mm Forged',
    supplier: 'Bellara AQS Jijel / Quincailleries Industrielles',
    unit: 'Barre 6m',
    currentPriceDzd: 1950,
    previousPriceDzd: 1950,
    trend: 'stable',
    changePercent: 0.0,
    standardLengthOrSize: '6000 mm • 1.54 kg/m',
    notesFr: 'Forgeable à la flamme et martelable pour volutes et barreaux ouvragés',
    notesAr: 'قابل للتشكيل بالحرارة للمنمنمات الفنية وقضبان الحماية المشغولة',
  },

  // 5. HARDWARE & ACCESSORIES (QUINCAILLERIE & ACCESSOIRES)
  {
    id: 'hard-fapim-oscillo',
    category: 'hardware',
    nameFr: 'Kit Crémone Oscillo-Battant Fapim / Giesse',
    nameAr: 'طقم مقبض وآلية فتح قلاب فابيم / جيسي',
    nameEn: 'Tilt-and-Turn Mechanism Kit Fapim / Giesse',
    supplier: 'Distributeurs Quincaillerie Aluminium (Alger / Oran)',
    unit: 'Kit complet',
    currentPriceDzd: 9800,
    previousPriceDzd: 9500,
    trend: 'up',
    changePercent: 3.1,
    standardLengthOrSize: 'Kit standard vantail jusqu’à 100 kg',
    notesFr: 'Sécurité anti-fausse manœuvre, compas réglable et gâches en zamak',
    notesAr: 'نظام أمان لمنع المناورة الخاطئة وقطع تثبيت عالية المتانة',
  },
];

const LOCAL_STORAGE_KEY = 'baiti_workshop_margin_calibration';
const LEGACY_STORAGE_KEY = 'monyun_workshop_margin_calibration';

/**
 * Loads the workshop calibration settings from local storage or defaults
 */
export function loadWorkshopCalibration(): WorkshopMarginCalibration {
  if (typeof window === 'undefined') return DEFAULT_WORKSHOP_CALIBRATION;
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY) || localStorage.getItem(LEGACY_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return { ...DEFAULT_WORKSHOP_CALIBRATION, ...parsed };
    }
  } catch (err) {
    console.warn('Could not load workshop calibration from storage:', err);
  }
  return DEFAULT_WORKSHOP_CALIBRATION;
}

/**
 * Saves workshop calibration settings to local storage
 */
export function saveWorkshopCalibration(calibration: WorkshopMarginCalibration): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(calibration));
  } catch (err) {
    console.warn('Could not save workshop calibration to storage:', err);
  }
}
