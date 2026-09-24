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
    'workshops_empty_subtitle': 'Essayez de modifier vos filtres de recherche ou de wilaya.',
    'workshops_reset_filters': 'Réinitialiser les filtres',

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

    // Profile & Cartouche
    'profile_save_btn': 'ENREGISTRER LES COORDONNÉES ATELIER',
    'profile_saved_snack': 'Profil atelier et entête de devis enregistrés avec succès !',
    'profile_avatar_title': 'AVATAR PROFESSIONNEL DE L\'ATELIER',
    'profile_sub_badge_active': 'Actif · 1 An',
    'profile_sub_desc': 'Formule complète pour maîtres ateliers : calculs illimités, plans de débitage, devis proforma WhatsApp certifiés et exports G-Code scies CNC.',
    'profile_payment_methods': 'Paiement : BaridiMob · CCP · CIB / Edahabia',
    'profile_payment_instant': 'Activation instantanée sur présentation du reçu BaridiMob.',
    'profile_market_title': 'ARGUS MATIÈRES & CALIBRATEUR DZD',
    'profile_market_badge': 'En Direct',
    'profile_market_desc': 'Cotations des profilés (TPR, Profilor, Sidal), vitrage (MFG Cevital) et acier (El Hadjar / Tosyali). Ajustez vos multiplicateurs et taux horaire d\'atelier.',
    'profile_market_btn': 'CONSULTER L\'ARGUS & CALIBRER LES MARGES',
    'profile_coords_title': 'COORDONNÉES DE L\'ATELIER (CARTOUCHE DEVIS)',
    'profile_label_workshop_name': 'Raison sociale de l\'atelier',
    'profile_hint_workshop_name': 'Ex: Atelier Aluminium Kouba',
    'profile_label_artisan_name': 'Nom du responsable / artisan',
    'profile_hint_artisan_name': 'Ex: Mourad Hadj-Ali',
    'profile_label_phone': 'Téléphone Atelier (WhatsApp)',
    'profile_label_email': 'Email Professionnel Atelier (Facturation & Reçus)',
    'profile_label_wilaya': 'Wilaya d\'implantation',
    'profile_label_nif': 'NIF Fiscal (Optionnel)',
    'profile_hint_nif': 'Ex: 001916012345678',
    'profile_label_rc': 'Registre de Commerce - RC (Optionnel)',
    'profile_hint_rc': 'Ex: 16/00-1234567B19',
    'profile_label_ccp': 'Compte CCP (sans clé)',
    'profile_hint_ccp': 'Ex: 0021458974',
    'profile_label_ccp_key': 'Clé CCP',
    'profile_label_rip': 'RIP BaridiMob Algérie Poste (20 chiffres)',
    'profile_hint_rip': 'Ex: 00799999002145897442',
    'profile_logout_btn': 'SE DÉCONNECTER / CHANGER DE COMPTE',
    'profile_2fa_desc': 'Sécurisez l\'accès à votre carnet de chantiers et devis via Google Authenticator, Microsoft Authenticator ou Aegis (standard RFC 6238 TOTP avec code dynamique 30 secondes).',
    'profile_theme_dark_sub': 'Contraste atelier sombre',
    'profile_theme_light_sub': 'Contraste élevé plein soleil',
    'profile_verified_badge': 'Agréé',

    // Payment Dialog
    'pay_dialog_secure': 'PAIEMENT SÉCURISÉ ALGÉRIE',
    'pay_dialog_pro_title': 'Abonnement Atelier Pro · 35 000 DZD',
    'pay_dialog_confirm_otp': 'CONFIRMER LE CODE OTP',
    'pay_dialog_simulate_btn': 'SIMULER LE RÈGLEMENT (35 000 DZD)',
    'pay_dialog_success_snack': 'Abonnement Pro activé avec succès ! Reçu de 35 000 DZD émis.',
    'pay_dialog_baridimob_title': 'Virement BaridiMob Instantané',
    'pay_dialog_baridimob_sub': 'Sans déplacement · Confirmation par SMS',
    'pay_dialog_rip_dest': 'RIP DESTINATAIRE (SARL BAITI)',
    'pay_dialog_rip_copied': 'RIP copié dans le presse-papier !',
    'pay_dialog_baridimob_note': 'En cliquant sur Simuler, un ordre de virement BaridiMob test de 35 000 DZD sera généré avec vérification OTP simulée.',
    'pay_dialog_satim_title': 'SATIM 3D-SECURE',
    'pay_dialog_card_num': 'Numéro de Carte (Edahabia / CIB)',
    'pay_dialog_card_expiry': 'Expiration (MM/AA)',
    'pay_dialog_card_cvv': 'CVV2 / CVC',
    'pay_dialog_satim_note': 'Passerelle bancaire nationale SATIM certifiée. Test de débit immédiat de 35 000 DZD avec simulation de clé SMS.',
    'pay_dialog_ccp_title': 'Versement Bureau de Poste CCP',
    'pay_dialog_ccp_sub': 'Bordereau Algérie Poste',
    'pay_dialog_ccp_dest': 'COMPTE CCP BÉNÉFICIAIRE',
    'pay_dialog_ccp_copied': 'Compte CCP copié !',
    'pay_dialog_ccp_slip': 'Numéro de Reçu / Bordereau de Versement',
    'pay_dialog_ccp_note': 'La validation du versement active automatiquement la clé d\'activation annuelle pour votre atelier.',
    'pay_dialog_otp_title': 'VÉRIFICATION SMS 3D-SECURE',
    'pay_dialog_otp_desc': 'Un code de sécurité test a été généré pour valider le débit de 35 000 DZD :',
    'pay_dialog_otp_sim_code': 'Code pré-rempli pour la simulation : 482910',

    // 2FA Security Dialog
    'sec_2fa_step1_title': 'Étape 1 : Scanner le QR Code',
    'sec_2fa_step1_desc': 'Ouvrez Google Authenticator, appuyez sur "+" puis scannez ce code pour lier votre atelier.',
    'sec_2fa_step1_compat': 'Compatible Google & Microsoft Auth',
    'sec_2fa_manual_key_label': 'OU SAISIE MANUELLE DE LA CLÉ SECRÈTE :',
    'sec_2fa_key_copied': 'Clé secrète TOTP copiée dans le presse-papiers',
    'sec_2fa_step2_title': 'Étape 2 : Confirmer le code 6 chiffres',
    'sec_2fa_confirm_btn': 'ACTIVER LA DOUBLE AUTHENTIFICATION (2FA)',
    'sec_2fa_code_hint': 'Code dynamique 30s',
    'sec_2fa_invalid_code': 'Veuillez saisir un code à 6 chiffres valide',
    'sec_2fa_activated_snack': 'Authentification Google Authenticator (TOTP) configurée avec succès !',

    // Authentication Screen
    'auth_portal_desc': 'Portail des Artisans & Menuisiers Algériens (58 Wilayas)',
    'auth_tab_login': 'CONNEXION ATELIER',
    'auth_tab_signup': 'CRÉER UN COMPTE',
    'auth_guest_access': 'Accéder immédiatement en Mode Invité / Découverte',
    'auth_method_email': 'Email / Passe',
    'auth_method_phone': 'Téléphone SMS',
    'auth_email_label': 'Adresse Email Atelier',
    'auth_password_label': 'Mot de passe Atelier',
    'auth_phone_label': 'Numéro de Téléphone (ex: 0797780838)',
    'auth_otp_label': 'Code de vérification SMS (6 chiffres)',
    'auth_otp_resend': 'Renvoyer',
    'auth_btn_get_otp': 'RECEVOIR LE CODE SMS OTP',
    'auth_btn_login': 'SE CONNECTER À MON ATELIER',
    'auth_name_label': 'Nom & Prénom du Responsable',
    'auth_workshop_label': 'Nom de l\'Atelier (Raison Sociale)',
    'auth_signup_pass_label': 'Mot de passe sécurisé',
    'auth_btn_signup': 'CRÉER MON ATELIER PRO',
    'auth_password_policy_title': 'CRITÈRES DE SÉCURITÉ DU MOT DE PASSE :',
    'auth_crit_min_len': 'Minimum 8 caractères',
    'auth_crit_upper': 'Au moins une lettre majuscule (A-Z)',
    'auth_crit_lower': 'Au moins une lettre minuscule (a-z)',
    'auth_crit_num': 'Au moins un chiffre (0-9)',
    'auth_crit_special': 'Au moins un caractère spécial (!@#\$%...)',
    'auth_choose_avatar': 'CHOISIR L\'AVATAR DE VOTRE ATELIER',

    // Laser Measure Dialog
    'laser_title': 'VISEUR LASER CHANTIER',
    'laser_subtitle': 'Mesure optique tableau & équerrage maçonnerie',
    'laser_calibrated': 'CALIBRAGE LASER 1:1',
    'laser_recalibrate': 'RECALIBRAGE REQUIS',
    'laser_corner_b': 'B (Coin Bas Droit)',
    'laser_raw_opening': 'COTE TABLEAU BRUT',
    'laser_squaring': 'ÉQUERRAGE',
    'laser_square_conforming': 'CONFORME',
    'laser_square_warning': 'FAUX-ÉQUERRE',
    'laser_std_presets': 'Tableau std:',
    'laser_clearance': 'Jeu de pose:',
    'laser_clearance_std': 'Standard (-10mm)',
    'laser_clearance_reno': 'Rénov (-15mm)',
    'laser_clearance_raw': 'Brut (0mm)',
    'laser_fab_dimension': 'COTE DE FABRICATION ATELIER',
    'laser_apply_btn': 'Appliquer au Devis',
    'laser_preset_window': '1200×1200 (Fenêtre)',
    'laser_preset_french_door': '1400×2200 (Porte-Fenêtre)',
    'laser_preset_bay': '2400×2200 (Baie Salon)',
    'laser_preset_kitchen': '1000×1400 (Cuisine)',
    'laser_preset_bathroom': '600×600 (Vasistas SDB)',
    'laser_preset_transom': '800×500 (Imposte)',

    // Material Market & Calibrator Dialog
    'market_header_code': 'ARGUS DES COURS & CALIBRATEUR DZD',
    'market_header_title': 'Bourse des Matières Premières Algérie',
    'market_header_subtitle': 'Cotations industrielles 58 wilayas',
    'market_tab_bourse': 'ARGUS BOURSE',
    'market_tab_calibrator': 'CALIBRATEUR ATELIER',
    'market_cat_all': 'Tous',
    'market_cat_aluminum': 'Aluminium',
    'market_cat_glass': 'Vitrage',
    'market_cat_metal': 'Acier / Métal',
    'market_cat_wood': 'Bois',
    'market_cat_hardware': 'Quincaillerie',
    'market_search_hint': 'Rechercher un profilé, verre ou fournisseur...',
    'market_empty_search': 'Aucun matériau trouvé pour cette recherche',
    'calib_presets_title': 'PRÉRÉGLAGES RÉGIONAUX & CONDITIONS ATELIER',
    'calib_preset_wholesale': 'Gros (-6%)',
    'calib_preset_standard': 'Standard',
    'calib_preset_south': 'Sud (+15%)',
    'calib_slider_alu_title': 'Multiplicateur Profilés Aluminium',
    'calib_slider_alu_sub': 'Ajustement cours TPR, Profilor, Sidal',
    'calib_slider_glass_title': 'Multiplicateur Vitrage & Miroiterie',
    'calib_slider_glass_sub': 'Ajustement verre simple, double vitrage MFG Cevital',
    'calib_slider_margin_title': 'Marge Cible Atelier',
    'calib_slider_margin_sub': 'Bénéfice net artisan après charges',
    'calib_slider_labor_title': 'Taux Horaire Main d\'Œuvre',
    'calib_slider_labor_sub': 'Coût horaire fabrication et montage',
    'calib_sim_title': 'SIMULATION DEVIS ATELIER TYPE',
    'calib_sim_spec': 'Fenêtre 2V 1200×1200 mm',
    'calib_sim_price_label': 'Prix Estimé HT avec marge :',
    'calib_btn_whatsapp': 'PARTAGER WHATSAPP',
    'calib_btn_save': 'ENREGISTRER',
    'calib_btn_saved': 'ENREGISTRÉ',
    'calib_snack_copied': 'Grille tarifaire copiée pour WhatsApp',

    // Chantiers Project Modal & Tooltips
    'chantiers_project_client_name': 'Nom du Chantier / Client :',
    'chantiers_project_hint': 'ex: Villa Kouba R+2 - M. Benali',
    'chantiers_execution_wilaya': 'Wilaya d\'Exécution :',
    'chantiers_create_btn': 'Créer Chantier',
    'chantiers_no_match': 'Aucun projet ne correspond aux filtres',
    'chantiers_tooltip_new': 'Nouveau chantier',
    'chantiers_tooltip_export_all': 'Exporter récapitulatif WhatsApp global',
    'chantiers_tooltip_proforma': 'Devis & Proforma Officiel',
    'chantiers_tooltip_cutting': 'Fiche Débit Scie & Verre',
    'chantiers_tooltip_share_project': 'Partager ce chantier WhatsApp',
    'chantiers_projects_label': 'Projets',
    'chantiers_openings_count': 'ouv.',

    // Common Action Buttons
    'cancel': 'Annuler',
    'confirm': 'Confirmer',
    'close': 'Fermer',
    'save': 'Enregistrer',
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
    'workshops_empty_subtitle': 'يرجى تغيير خيارات البحث أو تحديد ولاية أخرى.',
    'workshops_reset_filters': 'إعادة ضبط الفلاتر',

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

    // Profile & Cartouche
    'profile_save_btn': 'حفظ بيانات وإحداثيات الورشة',
    'profile_saved_snack': 'تم حفظ بيانات الورشة وترويسة الفاتورة بنجاح!',
    'profile_avatar_title': 'الرمز المهني لورشة العمل',
    'profile_sub_badge_active': 'مفعّل · سنة كاملة',
    'profile_sub_desc': 'اشتراك متكامل للورشات: حسابات غير محدودة، مخططات تقطيع، فواتير بروفورما مصادق عليها وتصدير G-Code لمناشير CNC.',
    'profile_payment_methods': 'الدفع: بريدي موب · الحساب البريدي CCP · البطاقة الذهبية / CIB',
    'profile_payment_instant': 'تفعيل فوري ومباشر بمجرد إرفاق وصل بريدي موب.',
    'profile_market_title': 'بورصة المواد وأسعار السوق DZD',
    'profile_market_badge': 'مباشر',
    'profile_market_desc': 'أسعار البروفيلات (TPR، Profilor، Sidal)، الزجاج (MFG Cevital) والحديد (الحجار / Tosyali). ضبط هوامش الربح وسعر ساعة الورشة.',
    'profile_market_btn': 'معاينة البورصة وضبط هوامش الربح',
    'profile_coords_title': 'معلومات الورشة (ترويسة الفواتير)',
    'profile_label_workshop_name': 'الاسم التجاري للورشة',
    'profile_hint_workshop_name': 'مثال: ورشة الألمنيوم القبة',
    'profile_label_artisan_name': 'اسم الحرفي / المسؤول',
    'profile_hint_artisan_name': 'مثال: مراد حاج علي',
    'profile_label_phone': 'هاتف الورشة (واتساب)',
    'profile_label_email': 'البريد الإلكتروني المهني (الفواتير والوصولات)',
    'profile_label_wilaya': 'ولاية النشاط والورشة',
    'profile_label_nif': 'الرقم التعريفي الجبائي NIF (اختياري)',
    'profile_hint_nif': 'مثال: 001916012345678',
    'profile_label_rc': 'السجل التجاري RC (اختياري)',
    'profile_hint_rc': 'مثال: 16/00-1234567B19',
    'profile_label_ccp': 'رقم الحساب البريدي CCP (بدون المفتاح)',
    'profile_hint_ccp': 'مثال: 0021458974',
    'profile_label_ccp_key': 'المفتاح',
    'profile_label_rip': 'رقم الحساب البريدي الجاري RIP (20 رقماً)',
    'profile_hint_rip': 'مثال: 00799999002145897442',
    'profile_logout_btn': 'تسجيل الخروج / تبديل الحساب',
    'profile_2fa_desc': 'حماية المشاريع والفواتير عبر Google Authenticator أو Microsoft Authenticator أو Aegis (معيار RFC 6238 TOTP برمز ديناميكي كل 30 ثانية).',
    'profile_theme_dark_sub': 'تباين عالي للورشة',
    'profile_theme_light_sub': 'وضوح فائق تحت أشعة الشمس',
    'profile_verified_badge': 'معتمد',

    // Payment Dialog
    'pay_dialog_secure': 'دفع آمن في الجزائر',
    'pay_dialog_pro_title': 'اشتراك الورشة الاحترافي · 35,000 دج',
    'pay_dialog_confirm_otp': 'تأكيد الرمز الأمني OTP',
    'pay_dialog_simulate_btn': 'تأكيد التسديد (35,000 دج)',
    'pay_dialog_success_snack': 'تم تفعيل الاشتراك الاحترافي بنجاح! تم إصدار وصل بقيمة 35,000 دج.',
    'pay_dialog_baridimob_title': 'تحويل بريدي موب الفوري',
    'pay_dialog_baridimob_sub': 'بدون تنقل · تأكيد فوري عبر SMS',
    'pay_dialog_rip_dest': 'رقم RIP المستفيد (شركة بيتي ش.ذ.م.م)',
    'pay_dialog_rip_copied': 'تم نسخ رقم RIP في الحافظة!',
    'pay_dialog_baridimob_note': 'عند الضغط على تأكيد، يتم إنشاء أمر تحويل بريدي موب تجريبي بقيمة 35,000 دج مع التحقق من رمز OTP.',
    'pay_dialog_satim_title': 'نظام الدفع الوطني SATIM 3D-SECURE',
    'pay_dialog_card_num': 'رقم البطاقة (الذهبية / CIB)',
    'pay_dialog_card_expiry': 'تاريخ الصلاحية (شهر/سنة)',
    'pay_dialog_card_cvv': 'الرمز السري CVV2 / CVC',
    'pay_dialog_satim_note': 'بوابة الدفع الإلكتروني الوطنية المعتمدة SATIM. تجربة خصم مباشر بقيمة 35,000 دج مع محاكاة رمز التحقق SMS.',
    'pay_dialog_ccp_title': 'دفع حوالة عبر مكتب البريد CCP',
    'pay_dialog_ccp_sub': 'حوالة بريد الجزائر',
    'pay_dialog_ccp_dest': 'حساب البريد الجاري المستفيد CCP',
    'pay_dialog_ccp_copied': 'تم نسخ رقم الحساب البريدي CCP!',
    'pay_dialog_ccp_slip': 'رقم الوصل أو الحوالة البريدية',
    'pay_dialog_ccp_note': 'تأكيد الحوالة يفعّل تلقائياً مفتاح الاشتراك السنوي لورشتكم.',
    'pay_dialog_otp_title': 'التحقق الأمني عبر SMS 3D-SECURE',
    'pay_dialog_otp_desc': 'تم توليد رمز أمان تجريبي لتأكيد تسديد 35,000 دج:',
    'pay_dialog_otp_sim_code': 'الرمز المعد مسبقاً للتجربة: 482910',

    // 2FA Security Dialog
    'sec_2fa_step1_title': 'الخطوة 1: مسح رمز الاستجابة السريعة QR',
    'sec_2fa_step1_desc': 'افتح تطبيق Google Authenticator واضغط على "+" ثم امسح هذا الرمز لربط ورشتك.',
    'sec_2fa_step1_compat': 'متوافق مع Google و Microsoft Authenticator',
    'sec_2fa_manual_key_label': 'أو الإدخال اليدوي للمفتاح السري:',
    'sec_2fa_key_copied': 'تم نسخ المفتاح السري TOTP في الحافظة',
    'sec_2fa_step2_title': 'الخطوة 2: تأكيد الرمز المكوّن من 6 أرقام',
    'sec_2fa_confirm_btn': 'تفعيل التحقق بخطوتين (2FA)',
    'sec_2fa_code_hint': 'رمز متجدد كل 30 ثانية',
    'sec_2fa_invalid_code': 'يرجى إدخال رمز صحيح مكوّن من 6 أرقام',
    'sec_2fa_activated_snack': 'تم تفعيل المصادقة الثنائية Google Authenticator بنجاح!',

    // Authentication Screen
    'auth_portal_desc': 'بوابة الحرفيين وورشات النجارة في الجزائر (58 ولاية)',
    'auth_tab_login': 'تسجيل الدخول للورشة',
    'auth_tab_signup': 'إنشاء حساب ورشة',
    'auth_guest_access': 'الدخول الفوري بنمط الزائر / الاستكشاف',
    'auth_method_email': 'البريد / كلمة المرور',
    'auth_method_phone': 'الهاتف / رسالة SMS',
    'auth_email_label': 'البريد الإلكتروني للورشة',
    'auth_password_label': 'كلمة مرور الورشة',
    'auth_phone_label': 'رقم الهاتف (مثال: 0797780838)',
    'auth_otp_label': 'رمز التحقق عبر SMS (6 أرقام)',
    'auth_otp_resend': 'إعادة إرسال',
    'auth_btn_get_otp': 'إرسال رمز التحقق SMS',
    'auth_btn_login': 'الدخول إلى ورشتي',
    'auth_name_label': 'الاسم واللقب للمسؤول',
    'auth_workshop_label': 'اسم الورشة (الاسم التجاري)',
    'auth_signup_pass_label': 'كلمة مرور قوية',
    'auth_btn_signup': 'إنشاء وتفعيل ورشتي',
    'auth_password_policy_title': 'معايير أمان كلمة المرور :',
    'auth_crit_min_len': '8 أحرف على الأقل',
    'auth_crit_upper': 'حرف كبير واحد على الأقل (A-Z)',
    'auth_crit_lower': 'حرف صغير واحد على الأقل (a-z)',
    'auth_crit_num': 'رقم واحد على الأقل (0-9)',
    'auth_crit_special': 'رمز خاص واحد على الأقل (!@#\$%...)',
    'auth_choose_avatar': 'اختيار الصورة الرمزية لورشتك',

    // Laser Measure Dialog
    'laser_title': 'محدد المقاسات بالليزر للورشة',
    'laser_subtitle': 'القياس البصري لفتحة الجدار وضبط استقامة البناء',
    'laser_calibrated': 'معايرة ليزرية دقيقة 1:1',
    'laser_recalibrate': 'إعادة المعايرة مطلوبة',
    'laser_corner_b': 'ب (الزاوية السفلية اليمنى)',
    'laser_raw_opening': 'مقاس فتحة الجدار الخام',
    'laser_squaring': 'استقامة الزوايا',
    'laser_square_conforming': 'مطابق ومضبوط',
    'laser_square_warning': 'انحراف في الزاوية',
    'laser_std_presets': 'مقاسات قياسية:',
    'laser_clearance': 'فراغ التركيب:',
    'laser_clearance_std': 'قياسي (-10 مم)',
    'laser_clearance_reno': 'ترميم (-15 مم)',
    'laser_clearance_raw': 'خام (0 مم)',
    'laser_fab_dimension': 'مقاس تصنيع الورشة النهائي',
    'laser_apply_btn': 'اعتماد في المقايسة',
    'laser_preset_window': '1200×1200 (نافذة)',
    'laser_preset_french_door': '1400×2200 (نافذة شرفة)',
    'laser_preset_bay': '2400×2200 (واجهة صالون)',
    'laser_preset_kitchen': '1000×1400 (مطبخ)',
    'laser_preset_bathroom': '600×600 (شباك حمام)',
    'laser_preset_transom': '800×500 (نافذة علوية)',

    // Material Market & Calibrator Dialog
    'market_header_code': 'بورصة المواد وضبط الهوامش DZD',
    'market_header_title': 'بورصة المواد الأولية في الجزائر',
    'market_header_subtitle': 'الأسعار الصناعية المعتمدة عبر 58 ولاية',
    'market_tab_bourse': 'بورصة المواد',
    'market_tab_calibrator': 'معدل هوامش الورشة',
    'market_cat_all': 'الكل',
    'market_cat_aluminum': 'ألمنيوم',
    'market_cat_glass': 'زجاج',
    'market_cat_metal': 'حديد وصلب',
    'market_cat_wood': 'خشب',
    'market_cat_hardware': 'إكسسوارات',
    'market_search_hint': 'ابحث عن مقطع، زجاج أو مورد...',
    'market_empty_search': 'لم يتم العثور على مواد مطابقة للبحث',
    'calib_presets_title': 'الإعدادات المسبقة وشروط الورشة',
    'calib_preset_wholesale': 'بالجملة (-6%)',
    'calib_preset_standard': 'عادي',
    'calib_preset_south': 'الجنوب (+15%)',
    'calib_slider_alu_title': 'معامل أسعار قطاعات الألمنيوم',
    'calib_slider_alu_sub': 'مواكبة أسعار TPR و Profilor و Sidal',
    'calib_slider_glass_title': 'معامل أسعار الزجاج والمرايا',
    'calib_slider_glass_sub': 'مواكبة زجاج MFG Cevital البسيط والمزدوج',
    'calib_slider_margin_title': 'نسبة الربح المستهدفة للورشة',
    'calib_slider_margin_sub': 'الربح الصافي للحرفي بعد احتساب التكاليف',
    'calib_slider_labor_title': 'تكلفة ساعة اليد العاملة',
    'calib_slider_labor_sub': 'سعر الساعة في التصنيع والتركيب الميداني',
    'calib_sim_title': 'نموذج محاكاة مقايسة ورشة نموذجية',
    'calib_sim_spec': 'نافذة درفتين 1200×1200 مم',
    'calib_sim_price_label': 'السعر التقديري قبل الرسوم مع الهامش :',
    'calib_btn_whatsapp': 'مشاركة عبر واتساب',
    'calib_btn_save': 'حفظ الإعدادات',
    'calib_btn_saved': 'تم الحفظ بنجاح',
    'calib_snack_copied': 'تم نسخ لائحة الأسعار لمشاركتها عبر واتساب',

    // Chantiers Project Modal & Tooltips
    'chantiers_project_client_name': 'اسم المشروع / الزبون :',
    'chantiers_project_hint': 'مثال: فيلا القبة طابقين - السيد بن علي',
    'chantiers_execution_wilaya': 'ولاية الإنجاز :',
    'chantiers_create_btn': 'إنشاء المشروع',
    'chantiers_no_match': 'لا توجد مشاريع مطابقة لمعايير البحث',
    'chantiers_tooltip_new': 'مشروع جديد',
    'chantiers_tooltip_export_all': 'مشاركة التقرير الإجمالي عبر واتساب',
    'chantiers_tooltip_proforma': 'الفاتورة التقديرية الرسمية',
    'chantiers_tooltip_cutting': 'بطاقة تقطيع المنشار والزجاج',
    'chantiers_tooltip_share_project': 'مشاركة هذا المشروع عبر واتساب',
    'chantiers_projects_label': 'مشاريع',
    'chantiers_openings_count': 'فتحة',

    // Common Action Buttons
    'cancel': 'إلغاء',
    'confirm': 'تأكيد',
    'close': 'إغلاق',
    'save': 'حفظ',
  };
}
