import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';

enum MaterialCategory {
  all,
  aluminum,
  glass,
  wood,
  metal,
  hardware,
}

enum MarketTrend {
  up,
  down,
  stable,
}

class MaterialSpotItem {
  final String id;
  final MaterialCategory category;
  final String nameFr;
  final String nameAr;
  final String supplier;
  final String unit;
  final double currentPriceDzd;
  final double previousPriceDzd;
  final MarketTrend trend;
  final double changePercent;
  final String standardLengthOrSize;
  final String notesFr;
  final String notesAr;

  const MaterialSpotItem({
    required this.id,
    required this.category,
    required this.nameFr,
    required this.nameAr,
    required this.supplier,
    required this.unit,
    required this.currentPriceDzd,
    required this.previousPriceDzd,
    required this.trend,
    required this.changePercent,
    required this.standardLengthOrSize,
    required this.notesFr,
    required this.notesAr,
  });
}

class WorkshopMarginCalibration {
  final double aluminumPriceMultiplier;
  final double glassPriceMultiplier;
  final double woodPriceMultiplier;
  final double metalPriceMultiplier;
  final double workshopTargetMarginPercent;
  final double artisanHourlyRateDzd;
  final DateTime lastCalibratedAt;

  const WorkshopMarginCalibration({
    this.aluminumPriceMultiplier = 1.0,
    this.glassPriceMultiplier = 1.0,
    this.woodPriceMultiplier = 1.0,
    this.metalPriceMultiplier = 1.0,
    this.workshopTargetMarginPercent = 22.0,
    this.artisanHourlyRateDzd = 1800.0,
    required this.lastCalibratedAt,
  });

  Map<String, dynamic> toJson() => {
        'aluminumPriceMultiplier': aluminumPriceMultiplier,
        'glassPriceMultiplier': glassPriceMultiplier,
        'woodPriceMultiplier': woodPriceMultiplier,
        'metalPriceMultiplier': metalPriceMultiplier,
        'workshopTargetMarginPercent': workshopTargetMarginPercent,
        'artisanHourlyRateDzd': artisanHourlyRateDzd,
        'lastCalibratedAt': lastCalibratedAt.toIso8601String(),
      };

  factory WorkshopMarginCalibration.fromJson(Map<String, dynamic> json) {
    return WorkshopMarginCalibration(
      aluminumPriceMultiplier: (json['aluminumPriceMultiplier'] as num?)?.toDouble() ?? 1.0,
      glassPriceMultiplier: (json['glassPriceMultiplier'] as num?)?.toDouble() ?? 1.0,
      woodPriceMultiplier: (json['woodPriceMultiplier'] as num?)?.toDouble() ?? 1.0,
      metalPriceMultiplier: (json['metalPriceMultiplier'] as num?)?.toDouble() ?? 1.0,
      workshopTargetMarginPercent: (json['workshopTargetMarginPercent'] as num?)?.toDouble() ?? 22.0,
      artisanHourlyRateDzd: (json['artisanHourlyRateDzd'] as num?)?.toDouble() ?? 1800.0,
      lastCalibratedAt: json['lastCalibratedAt'] != null
          ? DateTime.tryParse(json['lastCalibratedAt'] as String) ?? DateTime.now()
          : DateTime.now(),
    );
  }

  WorkshopMarginCalibration copyWith({
    double? aluminumPriceMultiplier,
    double? glassPriceMultiplier,
    double? woodPriceMultiplier,
    double? metalPriceMultiplier,
    double? workshopTargetMarginPercent,
    double? artisanHourlyRateDzd,
    DateTime? lastCalibratedAt,
  }) {
    return WorkshopMarginCalibration(
      aluminumPriceMultiplier: aluminumPriceMultiplier ?? this.aluminumPriceMultiplier,
      glassPriceMultiplier: glassPriceMultiplier ?? this.glassPriceMultiplier,
      woodPriceMultiplier: woodPriceMultiplier ?? this.woodPriceMultiplier,
      metalPriceMultiplier: metalPriceMultiplier ?? this.metalPriceMultiplier,
      workshopTargetMarginPercent: workshopTargetMarginPercent ?? this.workshopTargetMarginPercent,
      artisanHourlyRateDzd: artisanHourlyRateDzd ?? this.artisanHourlyRateDzd,
      lastCalibratedAt: lastCalibratedAt ?? this.lastCalibratedAt,
    );
  }
}

final WorkshopMarginCalibration kDefaultWorkshopCalibration = WorkshopMarginCalibration(
  aluminumPriceMultiplier: 1.0,
  glassPriceMultiplier: 1.0,
  woodPriceMultiplier: 1.0,
  metalPriceMultiplier: 1.0,
  workshopTargetMarginPercent: 22.0,
  artisanHourlyRateDzd: 1800.0,
  lastCalibratedAt: DateTime.now(),
);

const List<MaterialSpotItem> kAlgerianMaterialSpotData = [
  // 1. ALUMINIUM
  MaterialSpotItem(
    id: 'alu-tpr-gamme45',
    category: MaterialCategory.aluminum,
    nameFr: 'Profilé Aluminium Gamme 45 Thermique (Barre 6.5m)',
    nameAr: 'مقطع ألمنيوم سلسلة 45 عازل حراري (قضيب 6.5م)',
    supplier: 'TPR Algérie (Zone Industrielle Oued Smar)',
    unit: 'Barre 6.5m',
    currentPriceDzd: 10500,
    previousPriceDzd: 10200,
    trend: MarketTrend.up,
    changePercent: 2.9,
    standardLengthOrSize: '6500 mm / 1.55 kg/m',
    notesFr: 'Alliage 6060 T5 thermolaqué conforme Qualicoat, rupture thermique polyamide 14.8mm',
    notesAr: 'سبيكة 6060 T5 طلاء حراري معتمد كواليكوت، عازل حراري بولياميد 14.8 مم',
  ),
  MaterialSpotItem(
    id: 'alu-profilor-gamme40',
    category: MaterialCategory.aluminum,
    nameFr: 'Profilé Aluminium Gamme 40 Éco (Barre 6.0m)',
    nameAr: 'مقطع ألمنيوم سلسلة 40 اقتصادي (قضيب 6.0م)',
    supplier: 'Profilor / Alugraf (Sétif)',
    unit: 'Barre 6.0m',
    currentPriceDzd: 6800,
    previousPriceDzd: 6850,
    trend: MarketTrend.stable,
    changePercent: -0.7,
    standardLengthOrSize: '6000 mm / 1.15 kg/m',
    notesFr: 'Idéal fenêtres standard et impostes, disponible en Blanc 9010 et Gris 7016',
    notesAr: 'مثالي للنوافذ القياسية والفواصل الداخلية، متوفر بالأبيض والرمادي',
  ),
  MaterialSpotItem(
    id: 'alu-sidal-gamme67',
    category: MaterialCategory.aluminum,
    nameFr: 'Profilé Coulissant Lourd Gamme 67 (Barre 6.5m)',
    nameAr: 'مقطع سحاب ثقيل سلسلة 67 (قضيب 6.5م)',
    supplier: 'Sidal / Extral Algérie',
    unit: 'Barre 6.5m',
    currentPriceDzd: 12400,
    previousPriceDzd: 12100,
    trend: MarketTrend.up,
    changePercent: 2.5,
    standardLengthOrSize: '6500 mm / 1.65 kg/m',
    notesFr: 'Pour baies vitrées de grandes portées avec rail inox de guidage intégré',
    notesAr: 'للواجهات الكبيرة مع سكة انزلاق إينوكس مدمجة لتحمل الأوزان العالية',
  ),

  // 2. GLASS (VITRERIE)
  MaterialSpotItem(
    id: 'glass-cevital-clear4',
    category: MaterialCategory.glass,
    nameFr: 'Verre Clair Float 4mm Extra-Net',
    nameAr: 'زجاج شفاف نقي 4 مم ممتاز',
    supplier: 'Mediterranean Float Glass (MFG Cevital Larbaâ)',
    unit: 'm²',
    currentPriceDzd: 2600,
    previousPriceDzd: 2600,
    trend: MarketTrend.stable,
    changePercent: 0.0,
    standardLengthOrSize: 'Plein plateau 3210 × 2250 mm',
    notesFr: 'Planéité optique supérieure, transmission lumineuse 89%',
    notesAr: 'استواء بصري فائق، نفاذية ضوئية 89%',
  ),
  MaterialSpotItem(
    id: 'glass-mfg-double-argon',
    category: MaterialCategory.glass,
    nameFr: 'Double Vitrage 4-16-4 Gaz Argon + Intercalaire Warm-Edge',
    nameAr: 'زجاج مزدوج 4-16-4 مع غاز الآرغون وفواصل حرارية',
    supplier: 'MFG Cevital / Ateliers Partenaires',
    unit: 'm²',
    currentPriceDzd: 5800,
    previousPriceDzd: 5600,
    trend: MarketTrend.up,
    changePercent: 3.5,
    standardLengthOrSize: 'Sur-mesure assemblé scellé butyl/silicone',
    notesFr: 'Coefficient Uw = 1.3 W/m²K, isolation acoustique -32dB',
    notesAr: 'معامل عزل حراري 1.3 واط/م² كلفن، عزل صوتي -32 ديسيبل',
  ),
  MaterialSpotItem(
    id: 'glass-stopsol-bronze',
    category: MaterialCategory.glass,
    nameFr: 'Verre Solaire Réfléchissant Stop-Sol Bronze 6mm',
    nameAr: 'زجاج عاكس للطاقة الشمسية ستوب سول برونزي 6 مم',
    supplier: 'Saint-Gobain Algérie / Distributeurs',
    unit: 'm²',
    currentPriceDzd: 7900,
    previousPriceDzd: 8100,
    trend: MarketTrend.down,
    changePercent: -2.4,
    standardLengthOrSize: 'Plateau 3210 × 2000 mm',
    notesFr: 'Protection solaire renforcée contre l’éblouissement et la chaleur estivale',
    notesAr: 'حماية متقدمة من أشعة الشمس والحرارة الصيفية العالية',
  ),

  // 3. WOOD (BOIS & PANNEAUX)
  MaterialSpotItem(
    id: 'wood-mdf-hydrofuge18',
    category: MaterialCategory.wood,
    nameFr: 'Panneau MDF Hydrofuge Vert 18mm',
    nameAr: 'لوح خشب إم دي إف مقاوم للرطوبة أخضر 18 مم',
    supplier: 'Importateurs Bois & Dérivés (Alger / Oran)',
    unit: 'Panneau (2.80 × 2.07 m)',
    currentPriceDzd: 8800,
    previousPriceDzd: 8600,
    trend: MarketTrend.up,
    changePercent: 2.3,
    standardLengthOrSize: '2800 × 2070 × 18 mm (5.80 m²)',
    notesFr: 'Résistance élevée à l’humidité pour cuisines et salles d’eau',
    notesAr: 'مقاومة ممتازة للرطوبة للمطابخ والحمامات وخزائن الملابس',
  ),
  MaterialSpotItem(
    id: 'wood-melamine-egger',
    category: MaterialCategory.wood,
    nameFr: 'Panneau Mélaminé 18mm Finition Chêne Structuré',
    nameAr: 'لوح خشب ميلامين 18 مم ملمس بلوط طبيعي',
    supplier: 'Distributeurs Nationaux (Sétif / Béjaïa)',
    unit: 'Panneau (2.80 × 2.07 m)',
    currentPriceDzd: 6400,
    previousPriceDzd: 6400,
    trend: MarketTrend.stable,
    changePercent: 0.0,
    standardLengthOrSize: '2800 × 2070 × 18 mm',
    notesFr: 'Placage double face mélamine haute résistance aux rayures',
    notesAr: 'تغليف وجهين بميلامين عالي المقاومة للخدوش والتآكل',
  ),

  // 4. METAL & STEEL (FERRONNERIE & ACIER)
  MaterialSpotItem(
    id: 'steel-elhadjar-carre40',
    category: MaterialCategory.metal,
    nameFr: 'Tube Carré Acier Noir 40×40×2mm (Barre 6m)',
    nameAr: 'أنبوب فولاذي أسود مربع 40×40×2 مم (قضيب 6م)',
    supplier: 'Complexe Sidérurgique Sider El Hadjar / Tosyali',
    unit: 'Barre 6m',
    currentPriceDzd: 3200,
    previousPriceDzd: 3300,
    trend: MarketTrend.down,
    changePercent: -3.0,
    standardLengthOrSize: '6000 mm / ~2.45 kg/m',
    notesFr: 'Qualité soudable pour portails, grilles de protection et clôtures',
    notesAr: 'فولاذ نقي قابل للحام للبوابات وشبابيك الحماية والأسوار',
  ),
  MaterialSpotItem(
    id: 'steel-carre-plein14',
    category: MaterialCategory.metal,
    nameFr: 'Fer Carré Plein 14×14mm Forgé à Chaud',
    nameAr: 'قضيب حديد صلب مربع 14×14 مم مشغول',
    supplier: 'Bellara AQS Jijel / Quincailleries Industrielles',
    unit: 'Barre 6m',
    currentPriceDzd: 1950,
    previousPriceDzd: 1950,
    trend: MarketTrend.stable,
    changePercent: 0.0,
    standardLengthOrSize: '6000 mm / 1.54 kg/m',
    notesFr: 'Forgeable à la flamme et martelable pour volutes et barreaux ouvragés',
    notesAr: 'قابل للتشكيل بالحرارة للمنمنمات الفنية وقضبان الحماية المشغولة',
  ),

  // 5. HARDWARE (QUINCAILLERIE & ACCESSOIRES)
  MaterialSpotItem(
    id: 'hard-fapim-oscillo',
    category: MaterialCategory.hardware,
    nameFr: 'Kit Crémone Oscillo-Battant Fapim / Giesse',
    nameAr: 'طقم مقبض وآلية فتح قلاب فابيم / جيسي',
    supplier: 'Distributeurs Quincaillerie Aluminium (Alger / Oran)',
    unit: 'Kit complet',
    currentPriceDzd: 9800,
    previousPriceDzd: 9500,
    trend: MarketTrend.up,
    changePercent: 3.1,
    standardLengthOrSize: 'Kit standard vantail jusqu’à 100 kg',
    notesFr: 'Sécurité anti-fausse manœuvre, compas réglable et gâches en zamak',
    notesAr: 'نظام أمان لمنع المناورة الخاطئة وقطع تثبيت عالية المتانة',
  ),
];

class MaterialMarketStorage {
  static const String _key = 'baiti_workshop_margin_calibration';

  static Future<WorkshopMarginCalibration> loadCalibration() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final str = prefs.getString(_key);
      if (str != null && str.isNotEmpty) {
        final decoded = jsonDecode(str) as Map<String, dynamic>;
        return WorkshopMarginCalibration.fromJson(decoded);
      }
    } catch (_) {
      // Fallback to default
    }
    return kDefaultWorkshopCalibration;
  }

  static Future<bool> saveCalibration(WorkshopMarginCalibration calibration) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final str = jsonEncode(calibration.toJson());
      return await prefs.setString(_key, str);
    } catch (_) {
      return false;
    }
  }
}
