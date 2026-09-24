import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';

class AppSettings extends ChangeNotifier {
  static final AppSettings instance = AppSettings._internal();
  AppSettings._internal();

  static const String _prefLanguage = 'baiti_app_lang';
  static const String _prefTheme = 'baiti_app_theme';

  String _language = 'fr'; // 'fr' or 'ar'
  bool _isDarkMode = true;
  bool _isLoaded = false;

  String get language => _language;
  bool get isDarkMode => _isDarkMode;
  bool get isDark => _isDarkMode;
  bool get isRtl => _language == 'ar';
  bool get isLoaded => _isLoaded;

  Future<void> init() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      _language = prefs.getString(_prefLanguage) ?? 'fr';
      _isDarkMode = prefs.getBool(_prefTheme) ?? true;
      _isLoaded = true;
      notifyListeners();
    } catch (_) {
      _isLoaded = true;
    }
  }

  Future<void> setLanguage(String lang) async {
    if (lang != 'fr' && lang != 'ar') return;
    _language = lang;
    notifyListeners();
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString(_prefLanguage, lang);
    } catch (_) {}
  }

  Future<void> toggleLanguage() async {
    final next = _language == 'fr' ? 'ar' : 'fr';
    await setLanguage(next);
  }

  Future<void> setDarkMode(bool dark) async {
    _isDarkMode = dark;
    notifyListeners();
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setBool(_prefTheme, dark);
    } catch (_) {}
  }

  Future<void> toggleDarkMode() async {
    await setDarkMode(!_isDarkMode);
  }

  // --- THEME COLOR ACCESSORS ---
  Color get scaffoldBackground => _isDarkMode ? const Color(0xFF040B16) : const Color(0xFFF8FAFC);
  Color get cardBackground => _isDarkMode ? const Color(0xFF0A1324) : Colors.white;
  Color get cardBorder => _isDarkMode ? const Color(0xFF1E293B) : const Color(0xFFE2E8F0);
  Color get primaryText => _isDarkMode ? Colors.white : const Color(0xFF0F172A);
  Color get secondaryText => _isDarkMode ? const Color(0xFF94A3B8) : const Color(0xFF64748B);
  Color get inputBackground => _isDarkMode ? const Color(0xFF060D18) : const Color(0xFFF1F5F9);
  Color get inputBorder => _isDarkMode ? const Color(0xFF1E293B) : const Color(0xFFCBD5E1);
  Color get goldAccent => _isDarkMode ? const Color(0xFFD4AF37) : const Color(0xFFB8860B);

  Color get subCardBackground => _isDarkMode ? const Color(0xFF0F172A) : const Color(0xFFF1F5F9);
  Color get subCardBorder => _isDarkMode ? const Color(0xFF1E293B) : const Color(0xFFE2E8F0);
  Color get dividerColor => _isDarkMode ? const Color(0xFF1E293B) : const Color(0xFFE2E8F0);
  Color get chipBackground => _isDarkMode ? const Color(0xFF121B2D) : const Color(0xFFF1F5F9);
  Color get chipBorder => _isDarkMode ? const Color(0xFF1E293B) : const Color(0xFFCBD5E1);
  Color get chipText => _isDarkMode ? const Color(0xFFCBD5E1) : const Color(0xFF334155);
  Color get cadCanvasBackground => _isDarkMode ? const Color(0xFF080E1A) : const Color(0xFFF8FAFC);
  Color get cadGridColor => _isDarkMode ? const Color(0xFF1E293B).withValues(alpha: 0.35) : const Color(0xFFCBD5E1).withValues(alpha: 0.5);
  Color get dialogBackground => _isDarkMode ? const Color(0xFF0A1324) : Colors.white;
  Color get dialogBorder => _isDarkMode ? const Color(0xFF1E293B) : const Color(0xFFE2E8F0);
  Color get sheetBackground => _isDarkMode ? const Color(0xFF0A1324) : Colors.white;
  Color get sheetBorder => _isDarkMode ? const Color(0xFF1E293B) : const Color(0xFFE2E8F0);
  Color get sheetHandle => _isDarkMode ? const Color(0xFF475569) : const Color(0xFFCBD5E1);

  // --- LOCALIZED STRINGS DICTIONARY ---
  String tr(String key) {
    final map = _language == 'ar' ? _arStrings : _frStrings;
    return map[key] ?? _frStrings[key] ?? key;
  }

  String trTrade(String trade) {
    switch (trade) {
      case 'aluminum':
        return tr('trade_aluminum');
      case 'woodworking':
        return tr('trade_wood');
      case 'metalwork':
        return tr('trade_metal');
      case 'tapestry':
        return tr('trade_tapestry');
      default:
        return tr('trade_aluminum');
    }
  }

  String trStatus(String status) {
    switch (status) {
      case 'quote':
        return tr('status_quote');
      case 'cutting':
        return tr('status_cutting');
      case 'assembly':
        return tr('status_assembly');
      case 'installed':
        return tr('status_installed');
      default:
        return status;
    }
  }

  static const Map<String, String> _frStrings = {
    'app_title': 'BAITI ATELIER',
    'app_subtitle': 'Menuiserie, Fermetures & Agencement',
    'tab_cotes': 'Cotes & Devis',
    'tab_ateliers': 'Ateliers 58W',
    'tab_chantiers': 'Chantiers',
    'tab_mon_atelier': 'Mon Atelier',

    'cotes_header_title': 'PRISE DE COTES CAD',
    'cotes_header_subtitle': 'Calculs de coupe & DTR C3-2',
    'ateliers_header_title': 'RÉPERTOIRE 58 WILAYAS',
    'ateliers_header_subtitle': 'Menuisiers certifiés en Algérie',
    'chantiers_header_title': 'SUIVI DES CHANTIERS',
    'chantiers_header_subtitle': 'Devis & débits collectifs',
    'profil_header_title': 'ESPACE ATELIER PRO',
    'profil_header_subtitle': 'Identité, Avatars & Abonnement',

    'project_assigned': 'Chantier Assigné',
    'project_name_hint': 'Nom du Chantier (ex: Villa Kouba R+2)',
    'reference_label': 'Repère',
    'trade_aluminum': 'Aluminium & PVC',
    'trade_wood': 'Ébénisterie Bois',
    'trade_metal': 'Ferronnerie d\'Art',
    'trade_tapestry': 'Rideaux & Tapisserie',

    'tab_cad': 'Plan CAD',
    'tab_cut_sheet': 'Débit Scie',
    'tab_hardware': 'Quincaillerie',
    'cad_overall': 'Hors-Tout',
    'cad_fullscreen': 'Plein Écran',
    'cad_laser': 'Laser AR',
    'presets_title': 'PRESETS STANDARDS ATELIER',

    'dim_width': 'Largeur Totale (L)',
    'dim_height': 'Hauteur Totale (H)',
    'dim_depth': 'Profondeur Caisson (P)',
    'dim_sill': 'Allège (A)',
    'dim_wall': 'Épaisseur Mur (E)',
    'btn_save_spec': 'ENREGISTRER LA COTE',
    'btn_export_pdf': 'EXPORTER DEVIS PDF',

    'opt_primary_alu': 'Gamme Profilé',
    'opt_primary_wood': 'Type Panneau',
    'opt_primary_metal': 'Gamme Profilé',
    'opt_primary_tapestry': 'Matière Tissu',

    'opt_secondary_alu': 'Vitrage Isolé',
    'opt_secondary_wood': 'Finition Chants',
    'opt_secondary_metal': 'Motif & Barreaux',
    'opt_secondary_tapestry': 'Tête Confection',

    'opt_finish_alu': 'Couleur RAL',
    'opt_finish_wood': 'Teinte & Placage',
    'opt_finish_metal': 'Finition Peinture',
    'opt_finish_tapestry': 'Teinte Textile',

    'opt_acc_alu': 'Volet Roulant',
    'opt_acc_wood': 'Quincaillerie & Rails',
    'opt_acc_metal': 'Serrurerie & Sécurité',
    'opt_acc_tapestry': 'Support & Tringle',

    'quote_detailed_title': 'CHIFFRAGE DÉTAILLÉ EN DZD',
    'quote_units': 'unité(s)',
    'cost_primary': 'Matériau principal',
    'cost_secondary': 'Second œuvre / vitrage / chants',
    'cost_hardware': 'Accessoires & quincaillerie',
    'cost_finishing': 'Finition / volet / thermolaquage',
    'cost_labor': 'Main d\'œuvre & façonnage atelier',
    'cost_total_ht': 'TOTAL ESTIMÉ HT',
    'cost_algeria_note': 'Tarif indicatif atelier Algérie',
    'btn_whatsapp': 'Transmettre sur WhatsApp',
    'btn_save': 'Enregistrer',

    'sheet_devis_title': 'DEVIS CLIENT ET FACTURE PROFORMA',
    'sheet_tab_quote': 'Devis Express DZD',
    'sheet_tab_cut': 'Débit Scie Collectif',
    'sheet_total_ht': 'Total Général HT',
    'sheet_tva': 'TVA (19%)',
    'sheet_timbre': 'Timbre Fiscal',
    'sheet_total_ttc': 'TOTAL GÉNÉRAL TTC',
    'sheet_acompte': 'Acompte de Démarrage (40%)',
    'sheet_solde': 'Solde à la Livraison (60%)',
    'sheet_btn_share_wa': 'PARTAGER DEVIS PAR WHATSAPP',
    'sheet_btn_copy': 'COPIER LE TEXTE DU DEVIS',
    'sheet_btn_share_cuts': 'PARTAGER FEUILLE DE DÉBIT SCIE',

    'chantiers_total_amount': 'Montant Total Chantiers :',
    'chantiers_new_btn': 'NOUVEAU CHANTIER',
    'chantiers_search_hint': 'Rechercher un chantier, client, repère...',
    'chantiers_empty_title': 'Aucun chantier enregistré',
    'chantiers_empty_desc': 'Créez un nouveau chantier ou ajoutez des ouvertures depuis l\'écran Prise de Cotes.',
    'chantiers_collective_quote': 'Devis Collectif',
    'chantiers_add_opening': 'Ajouter Ouverture',
    'chantiers_status_label': 'Statut :',
    'status_quote': 'Devis Estimatif',
    'status_cutting': 'Débitage en Atelier',
    'status_assembly': 'Assemblage Châssis',
    'status_installed': 'Posé sur Chantier',

    'workshops_search_hint': 'Rechercher par nom, ville, wilaya...',
    'workshops_all_wilayas': 'Toutes les Wilayas',
    'workshops_all_trades': 'Tous Corps d\'État',
    'workshops_call': 'Appeler',
    'workshops_whatsapp': 'WhatsApp',
    'workshops_rate_alu': 'Alu :',
    'workshops_rate_glass': 'Verre :',
    'workshops_empty': 'Aucun artisan trouvé avec ces critères',

    'settings_title': 'PARAMÈTRES & PRÉFÉRENCES',
    'theme_dark': 'Mode Sombre Atelier',
    'theme_light': 'Mode Clair Haute Luminosité',
    'lang_label': 'Langue d\'affichage',
    'lang_french': 'Français (FR)',
    'lang_arabic': 'العربية (AR)',

    'security_2fa_title': 'SÉCURITÉ ATELIER & 2FA',
    'security_totp_label': 'Google Authenticator (TOTP)',
    'security_totp_desc': 'Code dynamique 30 secondes',
    'security_2fa_active': '2FA Activé',
    'security_2fa_inactive': '2FA Désactivé',
    'security_setup_btn': 'Configurer Google Authenticator',

    'sub_title': 'ABONNEMENT ATELIER PRO',
    'sub_price': '35 000 DZD',
    'sub_period': '/ an (3,5 Millions de Centimes)',
    'sub_active': 'Actif · 1 An',
    'sub_inactive': 'Mode Découverte / Invité',
    'sub_simulate': 'Activer l\'Abonnement Pro (35 000 DZD)',
    'sub_manage': 'GÉRER LE PAIEMENT (BaridiMob / Edahabia / CCP)',
    'sub_renew': 'Renouveler l\'Abonnement',

    'payment_dialog_title': 'Règlement Abonnement Atelier Pro',
    'pay_baridimob': 'BaridiMob',
    'pay_edahabia': 'Edahabia / CIB',
    'pay_ccp': 'CCP Algérie Poste',

    'guest_pill': 'Mode Invité',
    'pro_pill': 'Atelier Certifié Pro',
    'logout': 'Déconnexion Atelier',
    'login_signup': 'Connexion / Créer un Compte',

    'col_piece': 'DÉSIGNATION PIÈCE',
    'col_cote': 'COTE (mm)',
    'col_angles': 'ANGLES',
    'col_qte': 'QTÉ',
    'cut_est_bars': 'Estim. Barres 6.00m',
    'cut_action_copy': 'Copier Fiche',
    'quote_send_whatsapp': 'Transmettre sur WhatsApp',
    'quote_tooltip_proforma': 'Fiche Devis & Facture Proforma',
    'quote_tooltip_save': 'Enregistrer dans l\'historique chantier',
    'quote_sub_algeria': 'Tarif atelier Algérie',
    'chantiers_total_portfolio': 'TOTAL PORTFOLIO CHANTIERS',
    'chantiers_acompte_40': 'ACOMPTES 40%',
    'chantiers_solde_60': 'SOLDE 60%',
    'chantiers_filter_all': 'Tous',
    'chantiers_empty_subtitle': 'Enregistrez des cotes depuis l\'onglet "Cotes & Devis"\nou appuyez sur le bouton ci-dessous pour créer un projet.',
    'chantiers_new_project': 'Nouveau Chantier',
    'chantiers_total_project': 'TOTAL CHANTIER',
    'chantiers_installed_count': 'posés',
    'sheet_devis_proforma': 'Devis Proforma',
    'sheet_debit_saw_glass': 'Débit Scie & Verre',
    'sheet_nomenclature_openings': 'NOMENCLATURE DES OUVRAGES',
    'sheet_subtotal_chassis': 'Sous-total Châssis HT',
    'sheet_tva_legal': 'TVA Fiscale Légale (19%)',
    'sheet_timbre_fiscal': 'Droit de Timbre Fiscal',
    'sheet_total_general_ttc': 'TOTAL GENERAL TTC',
    'sheet_arrete_somme': 'Arrêté à la somme de :',
    'sheet_acompte_requis': 'ACOMPTE REQUIS (40%)',
    'sheet_solde_reception': 'SOLDE APRES POSE (60%)',
    'sheet_payment_baridimob_title': 'PAIEMENT BARIDIMOB',
    'sheet_algerie_poste_badge': 'Algérie Poste',
    'sheet_rip_algerie_poste': 'RIP Virement Algérie Poste (20 chiffres)',
    'sheet_titulaire_label': 'Titulaire :',
    'sheet_cut_summary_title': 'RÉSUMÉ DÉBITS CHANTIER',
    'sheet_chassis_count_label': 'châssis',
    'sheet_pieces_count_label': 'pièces',
    'sheet_stock_barres_6m': 'STOCK BARRES 6M',
    'sheet_linear_meters': 'm linéaires',
    'sheet_vitrage_total_net': 'VITRAGE TOTAL NET',
    'sheet_vitrage_surface_sub': 'Surface vitrière totale',
    'sheet_detail_coupes_title': 'DÉTAIL DES COUPES PAR CHÂSSIS',
    'sheet_copy_devis': 'Copier Devis',
    'sheet_copy_debit': 'Copier Fiche Débit',
    'sheet_wa_client': 'WhatsApp Client',
    'sheet_wa_workshop': 'WhatsApp Atelier',
    'sheet_quote_copied_snack': 'Devis formel copié dans le presse-papier.',
    'sheet_cut_copied_snack': 'Fiche de débit collective copiée dans le presse-papier.',
    'sheet_rip_copied_snack': 'RIP BaridiMob copié avec succès.',
    'sheet_client_chantier': 'CLIENT & CHANTIER',
    'sheet_date_emission': 'DATE EMISSION',
    'sheet_validite_30j': 'Validité: 30 jours',
    'sheet_dtr_valid': 'DTR C3-2 VALIDÉ',
  };

  static const Map<String, String> _arStrings = {
    'app_title': 'بيتي أتيليي',
    'app_subtitle': 'برمجية نجارة الألمنيوم والأشغال',
    'tab_cotes': 'المقاسات والتسعير',
    'tab_ateliers': 'دليل الورشات',
    'tab_chantiers': 'المشاريع',
    'tab_mon_atelier': 'ورشتي',

    'cotes_header_title': 'أخذ المقاسات والرسم 2D',
    'cotes_header_subtitle': 'حساب التقطيع والوثيقة التقنية DTR C3-2',
    'ateliers_header_title': 'دليل الورشات 58 ولاية',
    'ateliers_header_subtitle': 'حرفيون معتمدون عبر كامل القطر الجزائري',
    'chantiers_header_title': 'متابعة المشاريع والطلبيات',
    'chantiers_header_subtitle': 'فواتير مقايسة وتقطيع الورشة المجمع',
    'profil_header_title': 'حساب الورشة والاشتراك',
    'profil_header_subtitle': 'الهوية المهنية، الرمز الرمزي والفوترة',

    'project_assigned': 'المشروع المحدد',
    'project_name_hint': 'اسم المشروع (مثال: فيلا القبة R+2)',
    'reference_label': 'رمز الفتحة',
    'trade_aluminum': 'ألمنيوم وPVC',
    'trade_wood': 'نجارة خشبية',
    'trade_metal': 'حدادة فنية',
    'trade_tapestry': 'ستائر وتأثيث',

    'tab_cad': 'مخطط CAD',
    'tab_cut_sheet': 'تقطيع المنشار',
    'tab_hardware': 'الإكسسوارات',
    'cad_overall': 'الأبعاد الإجمالية',
    'cad_fullscreen': 'شاشة كاملة',
    'cad_laser': 'قياس ليزر',
    'presets_title': 'المقاسات القياسية للورشة',

    'dim_width': 'العرض الإجمالي (L)',
    'dim_height': 'الارتفاع الإجمالي (H)',
    'dim_depth': 'عمق الصندوق (P)',
    'dim_sill': 'العتبة (A)',
    'dim_wall': 'سمك الجدار (E)',
    'btn_save_spec': 'حفظ المقاس والبيانات',
    'btn_export_pdf': 'استخراج فاتورة PDF',

    'opt_primary_alu': 'سلسلة البروفيل',
    'opt_primary_wood': 'نوع اللوح الخشبي',
    'opt_primary_metal': 'سلسلة الحديد',
    'opt_primary_tapestry': 'نوع القماش',

    'opt_secondary_alu': 'نوع الزجاج العازل',
    'opt_secondary_wood': 'تشطيب الحواف (الشونت)',
    'opt_secondary_metal': 'نقش وزخرفة القضبان',
    'opt_secondary_tapestry': 'طريقة تفصيل الستارة',

    'opt_finish_alu': 'لون الدهان RAL',
    'opt_finish_wood': 'لون وتشطيب القشرة',
    'opt_finish_metal': 'دهان الحماية واللون',
    'opt_finish_tapestry': 'لون وخامة النسيج',

    'opt_acc_alu': 'الستار الدوار (فولي)',
    'opt_acc_wood': 'الإكسسوارات والمجاري',
    'opt_acc_metal': 'الأقفال والأمان',
    'opt_acc_tapestry': 'الحامل وقضيب الستارة',

    'quote_detailed_title': 'تفصيل التسعير بالدينار الجزائري DZD',
    'quote_units': 'قطعة',
    'cost_primary': 'المادة الأولية الرئيسية',
    'cost_secondary': 'الأشغال التكميلية والزجاج والحواف',
    'cost_hardware': 'الإكسسوارات واللواحق',
    'cost_finishing': 'التشطيب والدهان والستائر',
    'cost_labor': 'اليد العاملة وتصنيع الورشة',
    'cost_total_ht': 'المجموع الإجمالي التقريبي',
    'cost_algeria_note': 'سعر الورشة التقديري بالجزائر',
    'btn_whatsapp': 'إرسال عبر واتساب',
    'btn_save': 'حفظ الفتحة',

    'sheet_devis_title': 'فاتورة تقديرية رسمية للزبون',
    'sheet_tab_quote': 'فاتورة مفصلة DZD',
    'sheet_tab_cut': 'مخطط تقطيع المنشار',
    'sheet_total_ht': 'المجموع الإجمالي خارج الرسوم HT',
    'sheet_tva': 'الرسم على القيمة المضافة (19%)',
    'sheet_timbre': 'رسم الطابع الجبائي',
    'sheet_total_ttc': 'المجموع الإجمالي بكل الرسوم TTC',
    'sheet_acompte': 'عربون البداية (40%)',
    'sheet_solde': 'المتبقي عند التسليم (60%)',
    'sheet_btn_share_wa': 'مشاركة الفاتورة عبر واتساب',
    'sheet_btn_copy': 'نسخ نص الفاتورة كاملاً',
    'sheet_btn_share_cuts': 'مشاركة قائمة تقطيع المنشار',

    'chantiers_total_amount': 'المبلغ الإجمالي للمشاريع :',
    'chantiers_new_btn': 'مشروع جديد',
    'chantiers_search_hint': 'البحث عن مشروع، زبون، رمز فتحة...',
    'chantiers_empty_title': 'لا توجد مشاريع مسجلة حالياً',
    'chantiers_empty_desc': 'أنشئ مشروعاً جديداً أو أضف فتحات من شاشة أخذ المقاسات.',
    'chantiers_collective_quote': 'فاتورة المشروع المجمعة',
    'chantiers_add_opening': 'إضافة فتحة',
    'chantiers_status_label': 'الحالة :',
    'status_quote': 'عرض سعر وتقدير',
    'status_cutting': 'تقطيع في الورشة',
    'status_assembly': 'تجميع الهيكل',
    'status_installed': 'تم التركيب في الورشة',

    'workshops_search_hint': 'بحث بالاسم، المدينة، الولاية...',
    'workshops_all_wilayas': 'كل الولايات (58)',
    'workshops_all_trades': 'كل المهن والتخصصات',
    'workshops_call': 'اتصال',
    'workshops_whatsapp': 'واتساب',
    'workshops_rate_alu': 'ألمنيوم :',
    'workshops_rate_glass': 'زجاج :',
    'workshops_empty': 'لم يتم العثور على ورشات بهذه المواصفات',

    'settings_title': 'إعدادات المنظومة',
    'theme_dark': 'الوضع الليلي للورشة',
    'theme_light': 'الوضع النهاري عالي الإضاءة',
    'lang_label': 'لغة واجهة البرنامج',
    'lang_french': 'Français (فرنسية)',
    'lang_arabic': 'العربية (جزائر)',

    'security_2fa_title': 'أمان الحساب والتحقق بخطوتين',
    'security_totp_label': 'تطبيق المصادقة (Google Authenticator)',
    'security_totp_desc': 'رمز أمني متجدد كل 30 ثانية',
    'security_2fa_active': 'التحقق بخطوتين مفعّل',
    'security_2fa_inactive': 'التحقق بخطوتين غير مفعّل',
    'security_setup_btn': 'إعداد Google Authenticator',

    'sub_title': 'اشتراك الورشة الاحترافي',
    'sub_price': '35,000 دج',
    'sub_period': '/ سنوياً (3 ملايين ونصف سنتيم)',
    'sub_active': 'مفعّل · سنة كاملة',
    'sub_inactive': 'نسخة استكشافية / زائر',
    'sub_simulate': 'تفعيل الاشتراك الاحترافي (35,000 دج)',
    'sub_manage': 'إدارة الدفع (بريدي موب / الذهبية / CCP)',
    'sub_renew': 'تجديد الاشتراك السنوي',

    'payment_dialog_title': 'دفع وتفعيل اشتراك الورشة',
    'pay_baridimob': 'بريدي موب',
    'pay_edahabia': 'البطاقة الذهبية / CIB',
    'pay_ccp': 'حوالة بريد الجزائر CCP',

    'guest_pill': 'حساب زائر',
    'pro_pill': 'ورشة معتمدة برو',
    'logout': 'تسجيل الخروج',
    'login_signup': 'تسجيل الدخول / إنشاء حساب',

    'col_piece': 'تسمية القطعة',
    'col_cote': 'المقاس (مم)',
    'col_angles': 'زوايا القص',
    'col_qte': 'العدد',
    'cut_est_bars': 'تقدير القضبان 6م',
    'cut_action_copy': 'نسخ المخطط',
    'quote_send_whatsapp': 'إرسال عبر واتساب',
    'quote_tooltip_proforma': 'كشف حساب وفاتورة بروفورما',
    'quote_tooltip_save': 'حفظ في سجل المشاريع',
    'quote_sub_algeria': 'تسعيرة ورشات الجزائر',
    'chantiers_total_portfolio': 'إجمالي محفظة المشاريع',
    'chantiers_acompte_40': 'التسبيقات 40%',
    'chantiers_solde_60': 'المتبقي 60%',
    'chantiers_filter_all': 'الكل',
    'chantiers_empty_subtitle': 'قم بحفظ المقاسات من تبويب "المقاسات والتسعير"\nأو اضغط على الزر أدناه لإنشاء مشروع جديد.',
    'chantiers_new_project': 'مشروع جديد',
    'chantiers_total_project': 'إجمالي المشروع',
    'chantiers_installed_count': 'تم تركيبها',
    'sheet_devis_proforma': 'فاتورة بروفورما',
    'sheet_debit_saw_glass': 'تقطيع المنشار والزجاج',
    'sheet_nomenclature_openings': 'قائمة وتفاصيل الفتحات',
    'sheet_subtotal_chassis': 'المجموع الفرعي للهياكل HT',
    'sheet_tva_legal': 'الرسم على القيمة المضافة (19%)',
    'sheet_timbre_fiscal': 'حق الطابع الجبائي',
    'sheet_total_general_ttc': 'المجموع الإجمالي بكل الرسوم TTC',
    'sheet_arrete_somme': 'حُرر هذا الكشف بمبلغ قدره:',
    'sheet_acompte_requis': 'التسبيق المطلوب (40%)',
    'sheet_solde_reception': 'المتبقي بعد التركيب (60%)',
    'sheet_payment_baridimob_title': 'الدفع عبر بريدي موب',
    'sheet_algerie_poste_badge': 'بريد الجزائر',
    'sheet_rip_algerie_poste': 'رقم الحساب البريدي الجاري RIP (20 رقماً)',
    'sheet_titulaire_label': 'صاحب الحساب:',
    'sheet_cut_summary_title': 'ملخص تقطيع المشروع',
    'sheet_chassis_count_label': 'هيكل',
    'sheet_pieces_count_label': 'قطعة',
    'sheet_stock_barres_6m': 'مخزون القضبان 6م',
    'sheet_linear_meters': 'متر طولي',
    'sheet_vitrage_total_net': 'المساحة الإجمالية للزجاج',
    'sheet_vitrage_surface_sub': 'المساحة الزجاجية الإجمالية',
    'sheet_detail_coupes_title': 'تفاصيل التقطيع لكل هيكل',
    'sheet_copy_devis': 'نسخ الفاتورة',
    'sheet_copy_debit': 'نسخ مخطط التقطيع',
    'sheet_wa_client': 'واتساب الزبون',
    'sheet_wa_workshop': 'واتساب الورشة',
    'sheet_quote_copied_snack': 'تم نسخ نص الفاتورة بنجاح.',
    'sheet_cut_copied_snack': 'تم نسخ مخطط التقطيع بنجاح.',
    'sheet_rip_copied_snack': 'تم نسخ رقم RIP بنجاح.',
    'sheet_client_chantier': 'الزبون والمشروع',
    'sheet_date_emission': 'تاريخ الإصدار',
    'sheet_validite_30j': 'صلاحية العرض: 30 يوماً',
    'sheet_dtr_valid': 'معتمد DTR C3-2',
  };
}
