export type Language = 'fr' | 'ar' | 'en';

export const DICTIONARY = {
  fr: {
    // Header & Navigation
    appName: 'Baiti',
    appBadge: 'Atelier',
    subtitle: 'منصة بيتي لورشات النجارة والألمنيوم في الجزائر',
    navStudio3D: 'Studio 3D',
    navCadStudio: 'Studio CAO 2D',
    navWorkshops: 'Trouver un Atelier',
    navCutting: 'Débitage & Devis',
    navMethodology: 'Calcul de Coûts',
    offlineQuotesBtn: 'Devis Hors-Ligne',
    scanSketchBtn: 'Relevé Photo & Croquis',
    contactDirectBtn: 'Contact Direct',
    themeDark: 'Mode Sombre',
    themeLight: 'Mode Clair',

    // Cinematic 3D Inspection Canvas Stages
    stage1Title: 'Vue d’Ensemble Paramétrique',
    stage1Desc: 'Ajustement dimensionnel en temps réel aux cotes réelles du chantier.',
    stage2Title: 'Rupture de Pont Thermique',
    stage2Desc: 'Barrette polyamide centrale et chambre d’isolation phonique certifiée.',
    stage3Title: 'Cinématique d’Ouverture',
    stage3Desc: 'Mécanismes coulissants ou oscillo-battants avec crémones multipoints.',
    stage4Title: 'Vue Éclatée d’Atelier',
    stage4Desc: 'Dormants, ouvrants, double vitrage, joints EPDM et équerres de sertissage.',
    stage5Title: 'Débitage & Fabrication',
    stage5Desc: 'Export direct des plans de coupe vers l’optimiseur de barres et feuilles.',

    // Telemetry HUD
    telemetryTitle: 'Télémétrie Atelier',
    activeProfile: 'Profilé',
    dimensions: 'Dimensions (L x H)',
    surface: 'Surface vitrée',
    uwValue: 'Isolation Uw',
    sashWeight: 'Poids ouvrant',
    cutAngle: 'Angle d’onglet',
    algerianStandard: 'Norme DTR C3-2',
    autoTour: 'Visite guidée',
    pauseTour: 'Pause',
    resetView: 'Réinitialiser',
    scrubberHint: 'Cliquez sur une étape pour inspecter le châssis en détail',
    stepLabel: 'Étape',
    prevStage: 'Précédent',
    nextStage: 'Suivant',
    scrollHint: 'Défiler pour zoomer et décomposer en 3D',
    inspected: 'inspecté',

    // Trade Selector
    tradeAluminum: 'Menuiserie Aluminium & PVC',
    tradeWood: 'Menuiserie Bois & Cuisines',
    tradeMetal: 'Ferronnerie d’Art & Portails',
    tradeTapestry: 'Tapisserie & Salons',

    // 3D View Modes
    singleWindow: 'Châssis Unitaire 3D',
    villaFacade: 'Façade Villa Complète 3D',

    // Configurator Section
    studioBadge: 'Studio Menuiserie Aluminium & PVC',
    heroTitlePart1: 'Ajustez vos Cotes.',
    heroTitlePart2: 'Chiffrez en Dinars Algériens.',
    heroDescription:
      'Modifiez les dimensions au millimètre, choisissez les gammes de profilés (Alugraf 40, Coulissant 67, RPT 52), les teintes RAL et vitrages certifiés en Algérie.',
    sketchPrompt: 'Vous avez un croquis de chantier ou un relevé ?',
    sketchScanLink: 'Numériser le plan',
    badgeMillimeter: 'Cotes réelles mm',
    badgeNorms: 'Normes Algérie DZD',
    badgeCAD: 'Export Scie & CAO',
    badgeCutLoss: 'Calcul des chutes',

    // Controls
    controlsTitle: 'Paramètres Menuiserie',
    controlsSubtitle: 'Calcul temps réel conforme au barème atelier',
    widthLabel: 'Largeur de baie (L)',
    heightLabel: 'Hauteur sous linteau (H)',
    openingTypeLabel: 'Système d’Ouverture',
    profileSystemLabel: 'Gamme de Profilé',
    finishColorLabel: 'Finition & Teinte RAL',
    glassTypeLabel: 'Type de Vitrage',
    shutterTypeLabel: 'Volet Roulant Intégré',
    openAnimationLabel: 'Simulation d’Ouverture',
    explodedViewLabel: 'Vue Éclatée des Profilés',

    // Pricing Card
    priceEstimateTitle: 'Estimation Indicative Fourniture & Pose',
    totalTTC: 'Total Estimé TTC',
    depositRequired: 'Acompte Réservation (40%)',
    profilesCost: 'Profilés Aluminium',
    glassCost: 'Vitrage & Joints',
    hardwareCost: 'Quincaillerie & Équerres',
    shutterCost: 'Volet Roulant',
    laborCost: 'Façonnage & Assemblage',
    downloadDevisBtn: 'Télécharger Devis PDF',
    downloadCutSheetBtn: 'Fiche Débit Scie',

    // Opening types
    sliding_2: 'Coulissant 2 Vantaux',
    sliding_3: 'Coulissant 3 Vantaux (3 Rails)',
    casement_1: 'Ouvrant Français 1 Vantail',
    casement_2: 'Ouvrant Français 2 Vantaux',
    tilt_turn: 'Oscillo-Battant Sécurité',
    fixed: 'Châssis Fixe Vitré',

    // Profile systems
    gamme_40: 'Alugraf 40 Standard (Éco)',
    gamme_45_thermal: 'Gamme 45 Rupture Pont Thermique (RPT)',
    gamme_67_slide: 'Coulissant Renforcé 67mm (Lourd)',
    pvc_70_chamber: 'PVC 70mm 5 Chambres Haute Isolation',

    // Finish colors
    ral_9016: 'RAL 9016 Blanc Brillant',
    ral_7016: 'RAL 7016 Gris Anthracite Sablé',
    ral_9005: 'RAL 9005 Noir Mat Finition Sablée',
    faux_bois: 'Faux Bois Chêne Doré',
    bronze_ano: 'Bronze Anodisé Métallisé',

    // Glass types
    simple_clear: 'Simple Vitrage Clair 6mm',
    double_clear: 'Double Vitrage 4/16/4 Isolation',
    stop_sol: 'Stop-Sol Réfléchissant Anti-Chaleur',
    sable: 'Vitrage Sablé Dépoli Intimité',
    double_argon_warmedge: 'Double Vitrage 4/16/4 Argon + Warm-Edge',
    phonique_stadip: 'Feuilleté Phonique Stadip Silence 6/16/4 (Rw 38dB)',
    securit_tempered: 'Verre Trempé Sécurit 8mm Anti-Choc',

    // Shutters
    none: 'Sans volet roulant',
    manual: 'Volet roulant manuel (Sangle / Manivelle)',
    motorized: 'Volet motorisé électrique filaire / télécommande',

    // 2D CAD Studio
    cadBadge: 'CAO Paramétrique Métier 2D',
    cadTitle: 'Studio Dessin & Fiche de Débitage',
    cadSubtitle:
      'Dessinez vos traverses, meneaux et impostes. Cliquez sur une case pour changer son type (Ouvrant, Fixe, Coulissant). Générez instantanément le Devis Client, la Fiche Débit Atelier, le fichier DXF AutoCAD et l’export CSV pour scies à double tête.',
    exportDevisPdf: 'Devis PDF',
    exportCutSheet: 'Fiche Scie',
    exportDxf: 'Export DXF',
    exportCsv: 'Export CSV Scie',
    workshopTerminal: 'Poste Atelier Usinage',
    bpuTender: 'BPU / DQE Appel d’Offres',
    addMullion: 'Ajouter Meneau',
    addTransom: 'Ajouter Traverse',
    archedFrame: 'Plein Cintre / Cintrage',
    shutterModule: 'Volet Roulant Intégré',
    bomTabProfiles: 'Profilés Alu & PVC',
    bomTabGlass: 'Volumes Verre',
    bomTabShutter: 'Composants Volet',
    bomTabHardware: 'Accessoires & Joints',
    bomTabThermal: 'Bilan Thermique DTR',

    // Cutting Stock Optimizer
    cuttingBadge: 'Optimiseur Débitage 1D & 2D',
    cuttingTitle: 'Plans de Coupe & Imbrication Guillotine',
    cuttingSubtitle:
      'Minimisez les chutes de barres aluminium (6 mètres) et panneaux de vitrage. Générez les étiquettes code-barres thermiques et pilotez les scies d’atelier.',
    tabLinear1D: 'Débitage Profilés (1D)',
    tabSheet2D: 'Découpe Vitrage & Panneaux (2D)',
    tabShutterCalc: 'Calculateur Volet Roulant',
    tabRemnants: 'Gestion des Chutes',
    printThermalLabels: 'Imprimer Étiquettes Barcode',
    openAssemblyTerminal: 'Lancer Poste Montage',
    importCurrentWindow: 'Importer le Châssis Actuel',

    // Audio Feedback
    soundFeedbackOn: 'Effets Sonores Activés',
    soundFeedbackOff: 'Effets Sonores Coupés',
    soundToggleTitle: 'Activer ou couper les sons tactiles d’atelier',

    // CAD Toolbar & Shapes
    archShapeLabel: 'Cintre',
    archNone: 'Droit',
    archFull: 'Plein Cintre',
    archLowered: 'Arc Surbaissé',
    shutterToggleLabel: 'Volet Roulant',
    shutterBoxTypeLabel: 'Type de Coffre',
    shutterBoxHeightLabel: 'Taille du Caisson',

    // 1D/2D Optimizer Details
    standardBarLength: 'Longueur de Barre Standard',
    standardAlgeriaBar: '6 000 mm (Standard Algérie)',
    sawBladeKerf: 'Trait de Scie (Kerf)',
    clampMargin: 'Marge de Serrage (Pneumatique)',
    stockBarsRequired: 'Barres 6m Requises',
    globalWasteRate: 'Taux de Chute Global',
    materialYield: 'Rendement Matière',
    reusableRemnants: 'Chutes Réutilisables',
    addManualCut: 'Ajouter une Coupe Manuelle',
    profileCodeLabel: 'Profilé / Code',
    cutLengthMmLabel: 'Longueur (mm)',
    quantityLabel: 'Quantité',
    anglesLabel: 'Angle G / D',
    actionsLabel: 'Actions',
    emptyCutsNotice: 'Aucune coupe dans la liste. Cliquez sur "Ajouter une Coupe" ou importez le châssis actuel.',
    remnantsNotice: 'Chutes valorisables supérieures à 500 mm enregistrées pour les futurs petits châssis.',
  },

  ar: {
    // Header & Navigation
    appName: 'بيتي',
    appBadge: 'أَتَلْيِي',
    subtitle: 'منصة بيتي لورشات النجارة والألمنيوم بالجزائر',
    navStudio3D: 'المصمم 3D',
    navCadStudio: 'استوديو الرسم CAO',
    navWorkshops: 'ابحث عن ورشة',
    navCutting: 'مخطط التقطيع والأسعار',
    navMethodology: 'طريقة الحساب',
    offlineQuotesBtn: 'كشف الحسابات المحلي',
    scanSketchBtn: 'مسح مخطط أو صورة ورشة',
    contactDirectBtn: 'اتصال مباشر',
    themeDark: 'الوضع الليلي',
    themeLight: 'الوضع النهاري',

    // Cinematic 3D Inspection Canvas Stages
    stage1Title: 'نظرة عامة وضبط الأبعاد',
    stage1Desc: 'تعديل القياسات في الوقت الفعلي وفق المقاسات الدقيقة لورشة البناء.',
    stage2Title: 'عازل الجسر الحراري RPT',
    stage2Desc: 'شريط بولياميد عازل وغرفة هوائية معتمدة لعزل الحرارة والصوت.',
    stage3Title: 'محاكاة حركة الفتح والإغلاق',
    stage3Desc: 'أنظمة الفتح السحاب أو القلاب المفصلي مع أقفال محكمة متعددة النقاط.',
    stage4Title: 'التفكيك الهندسي 3D للأجزاء',
    stage4Desc: 'عرض الإطار الثابت، الدرف المتحركة، الزجاج المزدوج، وحواشي EPDM المطاطية.',
    stage5Title: 'مخطط التقطيع وتجهيز الورشة',
    stage5Desc: 'تصدير زوايا القطع 45 درجة ومقاسات الألمنيوم مباشرة لمنشار الورشة.',

    // Telemetry HUD
    telemetryTitle: 'لوحة القياسات التقنية',
    activeProfile: 'القطاع المعتمد',
    dimensions: 'الأبعاد (العرض × الارتفاع)',
    surface: 'المساحة الزجاجية',
    uwValue: 'معامل العزل Uw',
    sashWeight: 'وزن الدرفة',
    cutAngle: 'زاوية القص',
    algerianStandard: 'معيار DTR C3-2',
    autoTour: 'جولة استعراضية',
    pauseTour: 'إيقاف مؤقت',
    resetView: 'إعادة الضبط',
    scrubberHint: 'انقر على أي مرحلة لفحص النافذة وتفاصيل التركيب',
    stepLabel: 'المرحلة',
    prevStage: 'السابق',
    nextStage: 'التالي',
    scrollHint: 'مرر للأسفل لمعاينة حركة الفتح وتفكيك الأجزاء ثلاثي الأبعاد',
    inspected: 'مكتمل',

    // Trade Selector
    tradeAluminum: 'نجارة الألمنيوم والـ PVC',
    tradeWood: 'نجارة الخشب والمطابخ',
    tradeMetal: 'الحدادة الفنية والبوابات',
    tradeTapestry: 'تنجيد الصالونات والستائر',

    // 3D View Modes
    singleWindow: 'شاسيه مفرد 3D',
    villaFacade: 'واجهة فيلا كاملة 3D',

    // Configurator Section
    studioBadge: 'استوديو نجارة الألمنيوم والـ PVC',
    heroTitlePart1: 'اضبط قياساتك بالمليمتر.',
    heroTitlePart2: 'احصل على التكلفة بالدينار الجزائري.',
    heroDescription:
      'حدد القياسات الدقيقة، اختر قطاعات الألمنيوم المعتمدة في الجزائر (ألوغراف 40، سحاب 67، العازل الحراري RPT 52)، الألوان ونوعية الزجاج العازل.',
    sketchPrompt: 'لديك رسم يدوي أو كشف مقاسات من الورشة؟',
    sketchScanLink: 'رقمنة المقاسات',
    badgeMillimeter: 'قياسات حقيقية بالمليمتر',
    badgeNorms: 'معايير السوق الجزائري (دج)',
    badgeCAD: 'تصدير لمنشار الورشة و CAD',
    badgeCutLoss: 'حساب نسبة الفواضل',

    // Controls
    controlsTitle: 'خصائص النافذة أو الباب',
    controlsSubtitle: 'حساب آني ودقيق متوافق مع أسعار الورشات الوطنية',
    widthLabel: 'عرض فتحة الجدار (L)',
    heightLabel: 'ارتفاع فتحة الجدار (H)',
    openingTypeLabel: 'نظام الفتح والتحريك',
    profileSystemLabel: 'نوع قطاع الألمنيوم أو الـ PVC',
    finishColorLabel: 'اللون ودهان الأسطح (RAL)',
    glassTypeLabel: 'نوع الزجاج والطبقات العازلة',
    shutterTypeLabel: 'الستار الدوار (ريدو)',
    openAnimationLabel: 'محاكاة حركة الفتح والإغلاق',
    explodedViewLabel: 'عرض التفكيك والتركيب 3D',

    // Pricing Card
    priceEstimateTitle: 'الكشف التقديري للسلعة والتركيب',
    totalTTC: 'السعر الإجمالي شامل الرسوم (TTC)',
    depositRequired: 'الدفعة المقدمة للتثبيت (40% عربون)',
    profilesCost: 'قطاعات الألمنيوم والإكسسوارات',
    glassCost: 'الزجاج المزدوج والحواشي المطاطية',
    hardwareCost: 'المفصلات والزوايا والأقفال',
    shutterCost: 'الستار الدوار مع المحرك',
    laborCost: 'التصنيع وتجميع الإطارات',
    downloadDevisBtn: 'تحميل كشف الحساب (Devis PDF)',
    downloadCutSheetBtn: 'بطاقة التقطيع للمنشار',

    // Opening types
    sliding_2: 'سحاب درفتين (Coulissant 2V)',
    sliding_3: 'سحاب 3 درف (3 سكك)',
    casement_1: 'مفصلي درفة واحدة (Battant 1V)',
    casement_2: 'مفصلي درفتين (Battant 2V)',
    tilt_turn: 'قلاب ومفصلي للأمان (Oscillo-Battant)',
    fixed: 'إطار ثابت مع زجاج (Fixe)',

    // Profile systems
    gamme_40: 'ألوغراف 40 القياسي الاقتصادي',
    gamme_45_thermal: 'قطاع 45 عازل للحرارة والبرودة (RPT)',
    gamme_67_slide: 'سحاب ثقيل مقوى 67 ملم للواجهات الكبيرة',
    pvc_70_chamber: 'بي في سي 70 ملم خماسي الغرف عزل ممتاز',

    // Finish colors
    ral_9016: 'أبيض لامع RAL 9016',
    ral_7016: 'رمادي أنثراسيت محبب RAL 7016',
    ral_9005: 'أسود مطفي راقٍ RAL 9005',
    faux_bois: 'خشب شين دوري تقليدي (Faux Bois)',
    bronze_ano: 'برونز مؤكسد معدني (Anodisé)',

    // Glass types
    simple_clear: 'زجاج عادي مفرد شفاف 6 ملم',
    double_clear: 'زجاج مزدوج عازل 4/16/4',
    stop_sol: 'ستوب-سول عاكس حامي من حرارة الصيف',
    sable: 'زجاج رملي معتم لحفظ الخصوصية',
    double_argon_warmedge: 'زجاج مزدوج 4/16/4 غاز آرغون عالي العزل',
    phonique_stadip: 'زجاج صامت عازل للصوت ستاديب 38 ديسيبل',
    securit_tempered: 'زجاج مقوى سيكوريت 8 ملم مضاد للصدمات',

    // Shutters
    none: 'بدون ستار دوار',
    manual: 'ستار دوار يدوي (شريط سحب)',
    motorized: 'ستار دوار كهربائي بمحرك وجهاز تحكم',

    // 2D CAD Studio
    cadBadge: 'الرسم الهندسي والتقطيع 2D',
    cadTitle: 'استوديو الرسم وبطاقة تقطيع الورشة',
    cadSubtitle:
      'ارسم القواطع الأفقية والعمودية والمناور. انقر على أي خانة لتغيير نوعها (درفة متحركة، إطار ثابت، سحاب). قم بتوليد كشف الحساب وبطاقة تقطيع المنشار وملف DXF لـ AutoCAD وملف CSV لمناشير الورشة.',
    exportDevisPdf: 'كشف حساب PDF',
    exportCutSheet: 'بطاقة المنشار',
    exportDxf: 'تصدير DXF',
    exportCsv: 'تصدير CSV للمنشار',
    workshopTerminal: 'محطة تشغيل الورشة',
    bpuTender: 'جدول الأسعار والتفاصيل DQE',
    addMullion: 'إضافة قاطع عمودي',
    addTransom: 'إضافة قاطع أفقي',
    archedFrame: 'قوس دائري / انحناء',
    shutterModule: 'ستار دوار مدمج',
    bomTabProfiles: 'قطاعات الألمنيوم والـ PVC',
    bomTabGlass: 'ألواح الزجاج',
    bomTabShutter: 'أجزاء الستار الدوار',
    bomTabHardware: 'الإكسسوارات وحواشي العزل',
    bomTabThermal: 'العزل الحراري DTR',

    // Cutting Stock Optimizer
    cuttingBadge: 'محسّن تقطيع القضبان والألواح 1D و 2D',
    cuttingTitle: 'مخططات التتقطيع وتقليل فواضل الورشة',
    cuttingSubtitle:
      'قلل فواضل قضبان الألمنيوم (6 أمتار) وألواح الزجاج. أنشئ ملصقات الباركود الحرارية ووجّه منشار التقطيع في الورشة بدقة.',
    tabLinear1D: 'تقطيع القضبان (1D)',
    tabSheet2D: 'تقطيع ألواح الزجاج (2D)',
    tabShutterCalc: 'حاسبة الستار الدوار',
    tabRemnants: 'إدارة الفواضل الصالحة',
    printThermalLabels: 'طباعة ملصقات الباركود',
    openAssemblyTerminal: 'فتح شاشة تجميع الإطارات',
    importCurrentWindow: 'استيراد قياسات النافذة الحالية',

    // Audio Feedback
    soundFeedbackOn: 'التأثيرات الصوتية مفعلة',
    soundFeedbackOff: 'التأثيرات الصوتية معطلة',
    soundToggleTitle: 'تفعيل أو كتم أصوات الأدوات الميكانيكية',

    // CAD Toolbar & Shapes
    archShapeLabel: 'شكل القوس',
    archNone: 'مستقيم',
    archFull: 'قوس دائري كامل',
    archLowered: 'قوس مخفض',
    shutterToggleLabel: 'ستار دوار',
    shutterBoxTypeLabel: 'نوع الصندوق',
    shutterBoxHeightLabel: 'ارتفاع الصندوق',

    // 1D/2D Optimizer Details
    standardBarLength: 'طول القضيب القياسي',
    standardAlgeriaBar: '6 000 ملم (القياس الجزائري)',
    sawBladeKerf: 'سماكة شفرة المنشار (Kerf)',
    clampMargin: 'هامش التثبيت الهوائي',
    stockBarsRequired: 'قضبان 6م المطلوبة',
    globalWasteRate: 'نسبة الفواضل الكلية',
    materialYield: 'كفاءة استغلال المادة',
    reusableRemnants: 'فواضل صالحة للاستخدام',
    addManualCut: 'إضافة مقاس تقطيع يدوي',
    profileCodeLabel: 'القطاع / الرمز',
    cutLengthMmLabel: 'الطول (ملم)',
    quantityLabel: 'العدد',
    anglesLabel: 'زاوية ي / ي',
    actionsLabel: 'الإجراءات',
    emptyCutsNotice: 'لا توجد مقاسات في القائمة. اضغط على إضافة مقاس أو استورد قياسات النافذة الحالية.',
    remnantsNotice: 'فواضل يزيد طولها عن 500 ملم محفوظة لاستخدامها في تصنيع الشاسيهات الصغيرة.',
  },

  en: {
    // Header & Navigation
    appName: 'Baiti',
    appBadge: 'Atelier',
    subtitle: 'Baiti Platform for Carpentry & Aluminum Workshops in Algeria',
    navStudio3D: '3D Studio',
    navCadStudio: '2D CAD Studio',
    navWorkshops: 'Find a Workshop',
    navCutting: 'Cutting Stock & Quotes',
    navMethodology: 'Cost Formula',
    offlineQuotesBtn: 'Offline Quotes',
    scanSketchBtn: 'Workshop Sketch & Photo',
    contactDirectBtn: 'Direct Contact',
    themeDark: 'Dark Mode',
    themeLight: 'Light Mode',

    // Cinematic 3D Inspection Canvas Stages
    stage1Title: 'Parametric 3D Overview',
    stage1Desc: 'Real-time dimensional adjustment aligned with site measurements.',
    stage2Title: 'Thermal Break Assembly',
    stage2Desc: 'Polyamide barrier strip and certified acoustic cavity profiles.',
    stage3Title: 'Opening Kinematics',
    stage3Desc: 'Sliding and tilt-and-turn movements with multi-point perimeter locks.',
    stage4Title: 'Exploded Workshop Assembly',
    stage4Desc: 'Outer frames, sashes, double glazing, EPDM gaskets, and crimped corner cleats.',
    stage5Title: 'Saw Cutting & Workshop Plan',
    stage5Desc: 'Direct export of 45-degree cut angles and linear bar optimization sheets.',

    // Telemetry HUD
    telemetryTitle: 'Workshop Telemetry',
    activeProfile: 'Active Profile',
    dimensions: 'Dimensions (W x H)',
    surface: 'Glazing Area',
    uwValue: 'Thermal Uw',
    sashWeight: 'Sash Weight',
    cutAngle: 'Miter Cut',
    algerianStandard: 'DTR C3-2 Standard',
    autoTour: 'Auto Tour',
    pauseTour: 'Pause',
    resetView: 'Reset View',
    scrubberHint: 'Click any stage to inspect workshop construction details',
    stepLabel: 'Stage',
    prevStage: 'Previous',
    nextStage: 'Next',
    scrollHint: 'Scroll down to inspect kinematics & 3D exploded view',
    inspected: 'inspected',

    // Trade Selector
    tradeAluminum: 'Aluminum & PVC Joinery',
    tradeWood: 'Woodworking & Cabinetry',
    tradeMetal: 'Artistic Metalwork & Gates',
    tradeTapestry: 'Upholstery & Furnishing',

    // 3D View Modes
    singleWindow: 'Single 3D Window',
    villaFacade: 'Complete 3D Villa Facade',

    // Configurator Section
    studioBadge: 'Aluminum & PVC Joinery Studio',
    heroTitlePart1: 'Configure Millimetric Dimensions.',
    heroTitlePart2: 'Get Estimates in Algerian Dinars.',
    heroDescription:
      'Adjust dimensions to the millimeter, select verified Algerian profile systems (Alugraf 40, Sliding 67, RPT 52), RAL finishes, and certified glazing.',
    sketchPrompt: 'Have a workshop sketch or site measurement sheet?',
    sketchScanLink: 'Digitize plan',
    badgeMillimeter: 'Real mm dimensions',
    badgeNorms: 'Algerian DZD norms',
    badgeCAD: 'Saw & CAD Export',
    badgeCutLoss: 'Kerf & Waste Loss',

    // Controls
    controlsTitle: 'Joinery Specifications',
    controlsSubtitle: 'Real-time calculation compliant with Algerian workshop pricing',
    widthLabel: 'Opening Width (W)',
    heightLabel: 'Opening Height (H)',
    openingTypeLabel: 'Opening Kinematics',
    profileSystemLabel: 'Profile Extrusion System',
    finishColorLabel: 'Surface Finish & RAL Color',
    glassTypeLabel: 'Glazing & Acoustic Glass',
    shutterTypeLabel: 'Integrated Roller Shutter',
    openAnimationLabel: 'Sash Motion Simulation',
    explodedViewLabel: '3D Exploded Assembly View',

    // Pricing Card
    priceEstimateTitle: 'Estimated Cost (Materials & Fabrication)',
    totalTTC: 'Total Estimated (Incl. VAT)',
    depositRequired: 'Reservation Deposit (40%)',
    profilesCost: 'Aluminum Profiles & Gaskets',
    glassCost: 'Insulated Glazing Units',
    hardwareCost: 'Hinges, Locks & Brackets',
    shutterCost: 'Roller Shutter & Motor',
    laborCost: 'Workshop Cutting & Assembly',
    downloadDevisBtn: 'Download Quote PDF',
    downloadCutSheetBtn: 'Workshop Cut Sheet',

    // Opening types
    sliding_2: '2-Panel Sliding Sash',
    sliding_3: '3-Panel Sliding Sash (3 Tracks)',
    casement_1: 'Single Casement Sash',
    casement_2: 'Double Casement Sash',
    tilt_turn: 'Tilt-and-Turn Security Window',
    fixed: 'Fixed Daylight Picture Frame',

    // Profile systems
    gamme_40: 'Alugraf 40 Standard (Cost-effective)',
    gamme_45_thermal: 'Gamme 45 Thermal Break System (RPT)',
    gamme_67_slide: 'Heavy-Duty 67mm Sliding Bay',
    pvc_70_chamber: 'PVC 70mm 5-Chamber High Insulation',

    // Finish colors
    ral_9016: 'RAL 9016 Gloss Traffic White',
    ral_7016: 'RAL 7016 Textured Anthracite Grey',
    ral_9005: 'RAL 9005 Jet Black Matte',
    faux_bois: 'Golden Oak Faux-Bois Woodgrain',
    bronze_ano: 'Anodized Architectural Bronze',

    // Glass types
    simple_clear: 'Single Clear Float Glass 6mm',
    double_clear: 'Insulated Double Glazing 4/16/4',
    stop_sol: 'Stop-Sol Solar Heat Reflective',
    sable: 'Frosted Privacy Sandblasted Glass',
    double_argon_warmedge: 'Double Glazed 4/16/4 Argon + Warm-Edge',
    phonique_stadip: 'Acoustic Laminated Stadip Silence 38dB',
    securit_tempered: 'Toughened Tempered Safety Glass 8mm',

    // Shutters
    none: 'No roller shutter',
    manual: 'Manual strap/crank roller shutter',
    motorized: 'Motorized electric roller shutter with remote',

    // 2D CAD Studio
    cadBadge: 'Parametric 2D CAD Studio',
    cadTitle: 'Drawing Studio & Saw Cut Sheets',
    cadSubtitle:
      'Draft transoms, mullions, and transoms. Click any cell to switch its type (Casement, Fixed, Sliding). Instantly produce customer quotes, workshop cut sheets, AutoCAD DXF files, and CSV exports for double-head saws.',
    exportDevisPdf: 'Quote PDF',
    exportCutSheet: 'Saw Sheet',
    exportDxf: 'DXF Export',
    exportCsv: 'Saw CSV Export',
    workshopTerminal: 'Workshop Machining Terminal',
    bpuTender: 'Tender BPU / DQE Bill',
    addMullion: 'Add Mullion',
    addTransom: 'Add Transom',
    archedFrame: 'Arched / Curved Frame',
    shutterModule: 'Integrated Roller Shutter',
    bomTabProfiles: 'Aluminum & PVC Extrusions',
    bomTabGlass: 'Glazing Panes',
    bomTabShutter: 'Roller Shutter Parts',
    bomTabHardware: 'Hardware & Gaskets',
    bomTabThermal: 'Thermal Report DTR',

    // Cutting Stock Optimizer
    cuttingBadge: '1D & 2D Cutting Stock Optimizer',
    cuttingTitle: 'Cutting Layouts & Stock Nesting',
    cuttingSubtitle:
      'Minimize waste across 6-meter aluminum bars and sheet glazing panels. Generate thermal barcode labels and drive workshop saws with precision.',
    tabLinear1D: 'Linear Bar Cutting (1D)',
    tabSheet2D: 'Sheet & Glass Nesting (2D)',
    tabShutterCalc: 'Roller Shutter Calculator',
    tabRemnants: 'Remnants & Offcuts Stock',
    printThermalLabels: 'Print Barcode Labels',
    openAssemblyTerminal: 'Open Assembly Station',
    importCurrentWindow: 'Import Current Window',

    // Audio Feedback
    soundFeedbackOn: 'Tactile Audio Enabled',
    soundFeedbackOff: 'Tactile Audio Muted',
    soundToggleTitle: 'Toggle tactile atelier acoustic feedback',

    // CAD Toolbar & Shapes
    archShapeLabel: 'Arch Shape',
    archNone: 'Straight',
    archFull: 'Full Round Arch',
    archLowered: 'Segmental Arch',
    shutterToggleLabel: 'Roller Shutter',
    shutterBoxTypeLabel: 'Box System',
    shutterBoxHeightLabel: 'Box Height',

    // 1D/2D Optimizer Details
    standardBarLength: 'Standard Bar Length',
    standardAlgeriaBar: '6,000 mm (Algerian Standard)',
    sawBladeKerf: 'Saw Blade Kerf',
    clampMargin: 'Pneumatic Clamp Margin',
    stockBarsRequired: 'Required 6m Bars',
    globalWasteRate: 'Total Scrap Rate',
    materialYield: 'Material Yield',
    reusableRemnants: 'Reusable Offcuts',
    addManualCut: 'Add Manual Cut',
    profileCodeLabel: 'Profile / Code',
    cutLengthMmLabel: 'Length (mm)',
    quantityLabel: 'Quantity',
    anglesLabel: 'Angles L / R',
    actionsLabel: 'Actions',
    emptyCutsNotice: 'No cuts in list. Click "Add Manual Cut" or import current window dimensions.',
    remnantsNotice: 'Usable remnants longer than 500 mm cataloged for future small frames.',
  },
};

/**
 * Hook to get current translations based on configStore language
 */
export function getTranslation(lang: Language) {
  return DICTIONARY[lang] || DICTIONARY.fr;
}
