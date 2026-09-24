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

  // --- LOCALIZED STRINGS DICTIONARY ---
  String tr(String key) {
    final map = _language == 'ar' ? _arStrings : _frStrings;
    return map[key] ?? _frStrings[key] ?? key;
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
    'trade_aluminum': 'Alu & PVC',
    'trade_wood': 'Ébénisterie',
    'trade_metal': 'Ferronnerie',
    'trade_tapestry': 'Tapisserie',

    'tab_cad': 'Plan CAD',
    'tab_cut_sheet': 'Débit Scie',
    'tab_hardware': 'Quincaillerie',
    'cad_overall': 'Hors-Tout',
    'cad_fullscreen': 'Plein Écran',
    'cad_laser': 'Laser AR',
    'presets_title': 'PRESETS STANDARDS ATELIER',

    'dim_width': 'Largeur Totale (L)',
    'dim_height': 'Hauteur Totale (H)',
    'dim_sill': 'Allège (A)',
    'dim_wall': 'Épaisseur Mur (E)',
    'btn_save_spec': 'ENREGISTRER LA COTE',
    'btn_export_pdf': 'EXPORTER DEVIS PDF',

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
    'dim_sill': 'العتبة (A)',
    'dim_wall': 'سمك الجدار (E)',
    'btn_save_spec': 'حفظ المقاس والبيانات',
    'btn_export_pdf': 'استخراج فاتورة PDF',

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
  };
}
