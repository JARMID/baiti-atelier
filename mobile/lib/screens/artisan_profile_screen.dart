import 'package:flutter/material.dart';
import '../models/artisan_profile.dart';
import '../services/storage_service.dart';
import '../services/app_settings.dart';
import '../utils/algerian_financials.dart';
import '../widgets/baiti_app_bar.dart';
import '../widgets/algerian_payment_dialog.dart';
import '../widgets/algerian_material_market_dialog.dart';
import '../widgets/security_2fa_dialog.dart';
import 'auth_screen.dart';

class ArtisanProfileScreen extends StatefulWidget {
  final VoidCallback? onProfileUpdated;

  const ArtisanProfileScreen({super.key, this.onProfileUpdated});

  @override
  State<ArtisanProfileScreen> createState() => _ArtisanProfileScreenState();
}

class _ArtisanProfileScreenState extends State<ArtisanProfileScreen> {
  ArtisanProfile _profile = ArtisanProfile.defaultProfile();
  bool _isLoading = true;
  bool _isSaving = false;

  late TextEditingController _nameController;
  late TextEditingController _workshopController;
  late TextEditingController _phoneController;
  late TextEditingController _emailController;
  late TextEditingController _nifController;
  late TextEditingController _rcController;
  late TextEditingController _ccpController;
  late TextEditingController _ccpKeyController;
  late TextEditingController _ripController;
  String _selectedWilaya = '16 - Alger';
  int _selectedAvatarIndex = 0;

  static const List<String> _wilayasList = [
    '01 - Adrar',
    '02 - Chlef',
    '03 - Laghouat',
    '04 - Oum El Bouaghi',
    '05 - Batna',
    '06 - Béjaïa',
    '07 - Biskra',
    '08 - Béchar',
    '09 - Blida',
    '10 - Bouira',
    '11 - Tamanrasset',
    '12 - Tébessa',
    '13 - Tlemcen',
    '14 - Tiaret',
    '15 - Tizi Ouzou',
    '16 - Alger',
    '17 - Djelfa',
    '18 - Jijel',
    '19 - Sétif',
    '20 - Saïda',
    '21 - Skikda',
    '22 - Sidi Bel Abbès',
    '23 - Annaba',
    '24 - Guelma',
    '25 - Constantine',
    '26 - Médéa',
    '27 - Mostaganem',
    '28 - M\'Sila',
    '29 - Mascara',
    '30 - Ouargla',
    '31 - Oran',
    '32 - El Bayadh',
    '33 - Illizi',
    '34 - Bordj Bou Arreridj',
    '35 - Boumerdès',
    '36 - El Tarf',
    '37 - Tindouf',
    '38 - Tissemsilt',
    '39 - El Oued',
    '40 - Khenchela',
    '41 - Souk Ahras',
    '42 - Tipaza',
    '43 - Mila',
    '44 - Aïn Defla',
    '45 - Naâma',
    '46 - Aïn Témouchent',
    '47 - Ghardaïa',
    '48 - Relizane',
    '49 - Timimoun',
    '50 - Bordj Badji Mokhtar',
    '51 - Ouled Djellal',
    '52 - Béni Abbès',
    '53 - In Salah',
    '54 - In Guezzam',
    '55 - Touggourt',
    '56 - Djanet',
    '57 - El M\'Ghair',
    '58 - El Meniaa',
  ];

  @override
  void initState() {
    super.initState();
    _nameController = TextEditingController();
    _workshopController = TextEditingController();
    _phoneController = TextEditingController();
    _emailController = TextEditingController();
    _nifController = TextEditingController();
    _rcController = TextEditingController();
    _ccpController = TextEditingController();
    _ccpKeyController = TextEditingController();
    _ripController = TextEditingController();
    _loadProfile();
  }

  @override
  void dispose() {
    _nameController.dispose();
    _workshopController.dispose();
    _phoneController.dispose();
    _emailController.dispose();
    _nifController.dispose();
    _rcController.dispose();
    _ccpController.dispose();
    _ccpKeyController.dispose();
    _ripController.dispose();
    super.dispose();
  }

  void _onCcpChanged(String val) {
    final clean = val.replaceAll(RegExp(r'\D'), '');
    if (clean.isNotEmpty) {
      final key = calculateCcpKey(clean);
      final rip = generateBaridiMobRip(clean);
      setState(() {
        _ccpKeyController.text = key;
        _ripController.text = rip;
      });
    }
  }

  Future<void> _loadProfile() async {
    final loaded = await StorageService.loadArtisanProfile();
    if (mounted) {
      setState(() {
        _profile = loaded;
        _nameController.text = loaded.name;
        _workshopController.text = loaded.workshopName;
        _phoneController.text = loaded.phone;
        _emailController.text = loaded.email;
        _nifController.text = loaded.nif ?? '';
        _rcController.text = loaded.rc ?? '';
        _ccpController.text = loaded.ccp ?? '0021458974';
        _ccpKeyController.text = loaded.ccpKey ?? '42';
        _ripController.text = loaded.rip ?? '00799999002145897442';
        _selectedWilaya = _wilayasList.contains(loaded.wilaya)
            ? loaded.wilaya
            : '16 - Alger';
        _selectedAvatarIndex = loaded.avatarIndex;
        _isLoading = false;
      });
    }
  }

  Future<void> _saveProfile() async {
    setState(() => _isSaving = true);
    final updated = _profile.copyWith(
      name: _nameController.text.trim(),
      workshopName: _workshopController.text.trim(),
      phone: _phoneController.text.trim(),
      email: _emailController.text.trim(),
      wilaya: _selectedWilaya,
      avatarIndex: _selectedAvatarIndex,
      nif: _nifController.text.trim().isNotEmpty ? _nifController.text.trim() : null,
      rc: _rcController.text.trim().isNotEmpty ? _rcController.text.trim() : null,
      ccp: _ccpController.text.trim().isNotEmpty ? _ccpController.text.trim() : null,
      ccpKey: _ccpKeyController.text.trim().isNotEmpty ? _ccpKeyController.text.trim() : null,
      rip: _ripController.text.trim().isNotEmpty ? _ripController.text.trim() : null,
    );
    await StorageService.saveArtisanProfile(updated);
    if (mounted) {
      setState(() {
        _profile = updated;
        _isSaving = false;
      });
      widget.onProfileUpdated?.call();
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          backgroundColor: const Color(0xFF10B981),
          content: Text(
            AppSettings.instance.tr('profile_saved_snack'),
            style: const TextStyle(fontFamily: 'Inter', fontWeight: FontWeight.bold),
          ),
          duration: const Duration(seconds: 2),
        ),
      );
    }
  }

  IconData _getAvatarIcon(int index) {
    switch (index) {
      case 0:
        return Icons.construction_rounded;
      case 1:
        return Icons.architecture_rounded;
      case 2:
        return Icons.carpenter_rounded;
      case 3:
        return Icons.precision_manufacturing_rounded;
      case 4:
        return Icons.design_services_rounded;
      case 5:
      default:
        return Icons.straighten_rounded;
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return Scaffold(
        backgroundColor: AppSettings.instance.scaffoldBackground,
        body: const Center(
          child: CircularProgressIndicator(color: Color(0xFFD4AF37)),
        ),
      );
    }

    return AnimatedBuilder(
      animation: AppSettings.instance,
      builder: (context, _) {
        final settings = AppSettings.instance;
        final isDark = settings.isDarkMode;

        return Scaffold(
          backgroundColor: settings.scaffoldBackground,
          appBar: BaitiAppBar(
            title: settings.tr('profil_header_title'),
            subtitle: settings.tr('profil_header_subtitle'),
            profile: _profile,
            customActions: [
              IconButton(
                icon: const Icon(Icons.analytics_rounded, color: Color(0xFFD4AF37), size: 20),
                tooltip: 'Argus Matières & Calibrateur',
                onPressed: () => AlgerianMaterialMarketDialog.show(context),
              ),
            ],
          ),
          body: SingleChildScrollView(
            padding: const EdgeInsets.fromLTRB(16, 12, 16, 140),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                // 1. TOP ARTISAN IDENTITY HEADER CARD
                _buildArtisanHeaderCard(settings, isDark),
                const SizedBox(height: 16),

                // 2. AVATAR SELECTION CAROUSEL
                _buildAvatarSelectionSection(settings, isDark),
                const SizedBox(height: 16),

                // 3. ANNUAL PRO SUBSCRIPTION TIER (35 000 DZD / 3.5M Centimes)
                _buildSubscriptionCard(settings, isDark),
                const SizedBox(height: 16),

                // 4. ARGUS MATIÈRES PREMIÈRES & CALIBRATEUR DZD
                _buildMaterialMarketCard(settings, isDark),
                const SizedBox(height: 16),

                // 5. WORKSHOP COORDINATES & CARTOUCHE FORM
                _buildWorkshopDetailsForm(settings, isDark),
                const SizedBox(height: 24),

                // SAVE BUTTON
                SizedBox(
                  height: 48,
                  child: ElevatedButton(
                    onPressed: _isSaving ? null : _saveProfile,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFFD4AF37),
                      foregroundColor: const Color(0xFF040B16),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                      elevation: 4,
                    ),
                    child: _isSaving
                        ? const SizedBox(
                            width: 20,
                            height: 20,
                            child: CircularProgressIndicator(strokeWidth: 2, color: Colors.black),
                          )
                        : FittedBox(
                            fit: BoxFit.scaleDown,
                            child: Row(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                const Icon(Icons.save_rounded, size: 18),
                                const SizedBox(width: 8),
                                Text(
                                  settings.tr('profile_save_btn'),
                                  style: const TextStyle(
                                    fontWeight: FontWeight.bold,
                                    fontSize: 13,
                                    letterSpacing: 0.5,
                                  ),
                                ),
                              ],
                            ),
                          ),
                  ),
                ),
                const SizedBox(height: 20),

                // 5. SECURITY & 2FA GOOGLE AUTHENTICATOR (RFC 6238 TOTP)
                _buildSecurity2FASection(settings, isDark),
                const SizedBox(height: 20),

                // 6. APP SETTINGS & PREFERENCES SECTION
                _buildSettingsSection(settings, isDark),
                const SizedBox(height: 20),
              ],
            ),
          ),
        );
      },
    );
  }

  Widget _buildSecurity2FASection(AppSettings settings, bool isDark) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: settings.cardBackground,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: settings.cardBorder),
        boxShadow: isDark
            ? null
            : [
                BoxShadow(
                  color: Colors.black.withValues(alpha: 0.04),
                  blurRadius: 8,
                  offset: const Offset(0, 2),
                ),
              ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Icon(Icons.security_rounded, size: 18, color: Color(0xFFD4AF37)),
              const SizedBox(width: 8),
              Expanded(
                child: Text(
                  settings.tr('security_2fa_title'),
                  style: const TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.w800,
                    color: Color(0xFFD4AF37),
                    letterSpacing: 0.5,
                  ),
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: const Color(0xFF10B981).withValues(alpha: 0.15),
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: const Color(0xFF10B981).withValues(alpha: 0.4)),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Container(width: 6, height: 6, decoration: const BoxDecoration(shape: BoxShape.circle, color: Color(0xFF10B981))),
                    const SizedBox(width: 4),
                    Text(
                      settings.tr('security_2fa_active'),
                      style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Color(0xFF10B981)),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),
          Text(
            settings.tr('profile_2fa_desc'),
            style: TextStyle(fontSize: 11.5, color: settings.secondaryText, height: 1.4),
          ),
          const SizedBox(height: 14),
          SizedBox(
            width: double.infinity,
            height: 42,
            child: OutlinedButton.icon(
              style: OutlinedButton.styleFrom(
                side: const BorderSide(color: Color(0xFFD4AF37), width: 1.2),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                backgroundColor: const Color(0xFFD4AF37).withValues(alpha: 0.08),
              ),
              onPressed: () {
                Security2FADialog.show(
                  context,
                  profile: _profile,
                  onProfileUpdated: _loadProfile,
                );
              },
              icon: const Icon(Icons.qr_code_scanner_rounded, size: 16, color: Color(0xFFD4AF37)),
              label: Text(
                settings.tr('security_setup_btn'),
                style: const TextStyle(fontSize: 11.5, fontWeight: FontWeight.bold, color: Color(0xFFD4AF37)),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSettingsSection(AppSettings settings, bool isDark) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: settings.cardBackground,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: settings.cardBorder),
        boxShadow: isDark
            ? null
            : [
                BoxShadow(
                  color: Colors.black.withValues(alpha: 0.04),
                  blurRadius: 8,
                  offset: const Offset(0, 2),
                ),
              ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          FittedBox(
            fit: BoxFit.scaleDown,
            alignment: settings.isRtl ? Alignment.centerRight : Alignment.centerLeft,
            child: Row(
              children: [
                const Icon(Icons.tune_rounded, size: 16, color: Color(0xFFD4AF37)),
                const SizedBox(width: 8),
                Text(
                  settings.tr('settings_title'),
                  style: const TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.w800,
                    color: Color(0xFFD4AF37),
                    letterSpacing: 0.5,
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 14),

          // Theme Switcher Tile
          ListTile(
            contentPadding: EdgeInsets.zero,
            leading: Icon(
              isDark ? Icons.dark_mode_rounded : Icons.light_mode_rounded,
              color: isDark ? const Color(0xFF38BDF8) : const Color(0xFFF59E0B),
            ),
            title: Text(
              isDark ? settings.tr('theme_dark') : settings.tr('theme_light'),
              style: TextStyle(
                fontSize: 13,
                fontWeight: FontWeight.w600,
                color: settings.primaryText,
              ),
            ),
            subtitle: Text(
              isDark ? settings.tr('profile_theme_dark_sub') : settings.tr('profile_theme_light_sub'),
              style: TextStyle(fontSize: 11, color: settings.secondaryText),
            ),
            trailing: Switch(
              value: isDark,
              activeThumbColor: const Color(0xFFD4AF37),
              onChanged: (val) {
                settings.setDarkMode(val);
              },
            ),
          ),

          Divider(height: 1, color: settings.cardBorder),

          // Language Switcher Tile
          ListTile(
            contentPadding: EdgeInsets.zero,
            leading: const Icon(Icons.translate_rounded, color: Color(0xFF10B981)),
            title: Text(
              settings.tr('lang_label'),
              style: TextStyle(
                fontSize: 13,
                fontWeight: FontWeight.w600,
                color: settings.primaryText,
              ),
            ),
            subtitle: Text(
              settings.language == 'ar' ? 'العربية الجزائرية' : 'Français (FR)',
              style: TextStyle(fontSize: 11, color: settings.secondaryText),
            ),
            trailing: GestureDetector(
              onTap: () {
                settings.toggleLanguage();
              },
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                decoration: BoxDecoration(
                  color: isDark ? const Color(0xFF0F1B2D) : const Color(0xFFF1F5F9),
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: const Color(0xFFD4AF37)),
                ),
                child: Text(
                  settings.language == 'fr' ? 'FR -> ع' : 'ع -> FR',
                  style: const TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.w800,
                    color: Color(0xFFD4AF37),
                  ),
                ),
              ),
            ),
          ),

          Divider(height: 1, color: settings.cardBorder),
          const SizedBox(height: 14),

          // Logout / Switch Account
          SizedBox(
            width: double.infinity,
            height: 42,
            child: OutlinedButton.icon(
              onPressed: () {
                Navigator.pushReplacement(
                  context,
                  MaterialPageRoute(builder: (ctx) => const AuthScreen()),
                );
              },
              icon: const Icon(Icons.logout_rounded, size: 16, color: Color(0xFFEF4444)),
              label: Text(
                settings.tr('profile_logout_btn'),
                style: const TextStyle(fontSize: 11.5, fontWeight: FontWeight.bold, color: Color(0xFFEF4444)),
              ),
              style: OutlinedButton.styleFrom(
                side: const BorderSide(color: Color(0xFFEF4444)),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildArtisanHeaderCard(AppSettings settings, bool isDark) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: settings.cardBackground,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: settings.cardBorder),
        boxShadow: isDark
            ? null
            : [
                BoxShadow(
                  color: Colors.black.withValues(alpha: 0.04),
                  blurRadius: 8,
                  offset: const Offset(0, 2),
                ),
              ],
      ),
      child: Row(
        children: [
          Container(
            width: 58,
            height: 58,
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                colors: [Color(0xFFD4AF37), Color(0xFFC5A880)],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: BorderRadius.circular(16),
              boxShadow: [
                BoxShadow(
                  color: const Color(0xFFD4AF37).withValues(alpha: 0.25),
                  blurRadius: 10,
                  offset: const Offset(0, 4),
                ),
              ],
            ),
            child: Icon(
              _getAvatarIcon(_selectedAvatarIndex),
              color: const Color(0xFF040B16),
              size: 32,
            ),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                FittedBox(
                  fit: BoxFit.scaleDown,
                  alignment: Alignment.centerLeft,
                  child: Row(
                    children: [
                      Text(
                        _workshopController.text.isNotEmpty
                            ? _workshopController.text
                            : 'Mon Atelier Aluminium',
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                          color: settings.primaryText,
                        ),
                      ),
                      const SizedBox(width: 6),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                        decoration: BoxDecoration(
                          color: const Color(0xFF10B981).withValues(alpha: 0.15),
                          borderRadius: BorderRadius.circular(8),
                          border: Border.all(color: const Color(0xFF10B981).withValues(alpha: 0.4)),
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            const Icon(Icons.verified_rounded, size: 10, color: Color(0xFF10B981)),
                            const SizedBox(width: 3),
                            Text(
                              settings.tr('profile_verified_badge'),
                              style: const TextStyle(
                                fontSize: 9,
                                color: Color(0xFF10B981),
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 3),
                FittedBox(
                  fit: BoxFit.scaleDown,
                  alignment: Alignment.centerLeft,
                  child: Text(
                    '${_nameController.text.isNotEmpty ? _nameController.text : "Artisan"} · $_selectedWilaya',
                    style: TextStyle(
                      fontSize: 12,
                      color: settings.secondaryText,
                    ),
                  ),
                ),
                const SizedBox(height: 3),
                FittedBox(
                  fit: BoxFit.scaleDown,
                  alignment: Alignment.centerLeft,
                  child: Text(
                    _phoneController.text.isNotEmpty
                        ? _phoneController.text
                        : '0797780838',
                    style: const TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.bold,
                      color: Color(0xFFD4AF37),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildAvatarSelectionSection(AppSettings settings, bool isDark) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: settings.cardBackground,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: settings.cardBorder),
        boxShadow: isDark
            ? null
            : [
                BoxShadow(
                  color: Colors.black.withValues(alpha: 0.04),
                  blurRadius: 8,
                  offset: const Offset(0, 2),
                ),
              ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          FittedBox(
            fit: BoxFit.scaleDown,
            child: Text(
              settings.tr('profile_avatar_title'),
              style: TextStyle(
                fontSize: 11,
                fontWeight: FontWeight.w800,
                color: settings.secondaryText,
                letterSpacing: 0.5,
              ),
            ),
          ),
          const SizedBox(height: 10),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: List.generate(6, (idx) {
              final isSelected = _selectedAvatarIndex == idx;
              return GestureDetector(
                onTap: () => setState(() => _selectedAvatarIndex = idx),
                child: AnimatedContainer(
                  duration: const Duration(milliseconds: 200),
                  width: 44,
                  height: 44,
                  decoration: BoxDecoration(
                    color: isSelected ? const Color(0xFFD4AF37) : (isDark ? const Color(0xFF0F1B2D) : const Color(0xFFF1F5F9)),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(
                      color: isSelected ? const Color(0xFFD4AF37) : settings.cardBorder,
                      width: isSelected ? 2 : 1,
                    ),
                    boxShadow: isSelected
                        ? [
                            BoxShadow(
                              color: const Color(0xFFD4AF37).withValues(alpha: 0.3),
                              blurRadius: 8,
                            ),
                          ]
                        : null,
                  ),
                  child: Icon(
                    _getAvatarIcon(idx),
                    color: isSelected ? const Color(0xFF040B16) : settings.primaryText.withValues(alpha: 0.8),
                    size: 22,
                  ),
                ),
              );
            }),
          ),
          const SizedBox(height: 8),
          FittedBox(
            fit: BoxFit.scaleDown,
            child: Text(
              ArtisanProfile.presetAvatars[_selectedAvatarIndex]['title'] as String,
              style: const TextStyle(
                fontSize: 12,
                color: Color(0xFFD4AF37),
                fontWeight: FontWeight.w700,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSubscriptionCard(AppSettings settings, bool isDark) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: isDark
              ? const [Color(0xFF0F2547), Color(0xFF0A1830)]
              : const [Color(0xFFFFFBEB), Color(0xFFFEF3C7)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFFD4AF37).withValues(alpha: isDark ? 0.4 : 0.6), width: 1.2),
        boxShadow: [
          BoxShadow(
            color: const Color(0xFFD4AF37).withValues(alpha: isDark ? 0.08 : 0.15),
            blurRadius: 16,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Flexible(
                child: FittedBox(
                  fit: BoxFit.scaleDown,
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const Icon(Icons.workspace_premium_rounded, color: Color(0xFFD4AF37), size: 18),
                      const SizedBox(width: 6),
                      Text(
                        settings.tr('sub_title'),
                        style: TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.w800,
                          color: isDark ? const Color(0xFFD4AF37) : const Color(0xFF92400E),
                          letterSpacing: 0.5,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: const Color(0xFF10B981).withValues(alpha: 0.2),
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: const Color(0xFF10B981)),
                ),
                child: Text(
                  settings.tr('profile_sub_badge_active'),
                  style: const TextStyle(
                    fontSize: 10,
                    fontWeight: FontWeight.bold,
                    color: Color(0xFF10B981),
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          FittedBox(
            fit: BoxFit.scaleDown,
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.baseline,
              textBaseline: TextBaseline.alphabetic,
              children: [
                Text(
                  '35 000 DZD',
                  style: TextStyle(
                    fontSize: 24,
                    fontWeight: FontWeight.bold,
                    color: isDark ? Colors.white : const Color(0xFF78350F),
                  ),
                ),
                const SizedBox(width: 6),
                Text(
                  settings.tr('sub_period'),
                  style: TextStyle(
                    fontSize: 13,
                    color: isDark ? const Color(0xFFC5A880) : const Color(0xFFB45309),
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 8),
          Text(
            settings.tr('profile_sub_desc'),
            style: TextStyle(
              fontSize: 11,
              color: isDark ? const Color(0xFF94A3B8) : const Color(0xFF6B7280),
              height: 1.4,
            ),
          ),
          const SizedBox(height: 12),
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: isDark ? Colors.black.withValues(alpha: 0.3) : Colors.white.withValues(alpha: 0.7),
              borderRadius: BorderRadius.circular(10),
              border: Border.all(color: isDark ? Colors.white.withValues(alpha: 0.08) : const Color(0xFFD4AF37).withValues(alpha: 0.3)),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                FittedBox(
                  fit: BoxFit.scaleDown,
                  child: Row(
                    children: [
                      const Icon(Icons.payment_rounded, size: 14, color: Color(0xFFD4AF37)),
                      const SizedBox(width: 6),
                      Text(
                        settings.tr('profile_payment_methods'),
                        style: TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.bold,
                          color: isDark ? Colors.white : const Color(0xFF1E293B),
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  settings.tr('profile_payment_instant'),
                  style: TextStyle(
                    fontSize: 10,
                    color: isDark ? const Color(0xFF94A3B8) : const Color(0xFF64748B),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 14),
          SizedBox(
            width: double.infinity,
            height: 42,
            child: ElevatedButton.icon(
              onPressed: () {
                AlgerianPaymentDialog.show(
                  context,
                  profile: _profile,
                  onPaymentSuccess: _loadProfile,
                );
              },
              icon: const Icon(Icons.flash_on_rounded, size: 16),
              label: Text(
                _profile.isSubscriptionActive
                    ? settings.tr('sub_manage')
                    : settings.tr('sub_simulate'),
                style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 11),
              ),
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFFD4AF37),
                foregroundColor: const Color(0xFF040B16),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildMaterialMarketCard(AppSettings settings, bool isDark) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: settings.cardBackground,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: settings.cardBorder),
        boxShadow: isDark
            ? null
            : [
                BoxShadow(
                  color: Colors.black.withValues(alpha: 0.04),
                  blurRadius: 8,
                  offset: const Offset(0, 2),
                ),
              ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Flexible(
                child: FittedBox(
                  fit: BoxFit.scaleDown,
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const Icon(Icons.analytics_rounded, color: Color(0xFFD4AF37), size: 18),
                      const SizedBox(width: 6),
                      Text(
                        settings.tr('profile_market_title'),
                        style: TextStyle(
                          fontSize: 11.5,
                          fontWeight: FontWeight.w800,
                          color: settings.primaryText,
                          letterSpacing: 0.5,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                decoration: BoxDecoration(
                  color: const Color(0xFF10B981).withValues(alpha: 0.15),
                  borderRadius: BorderRadius.circular(6),
                  border: Border.all(color: const Color(0xFF10B981).withValues(alpha: 0.4)),
                ),
                child: Text(
                  settings.tr('profile_market_badge'),
                  style: const TextStyle(
                    fontSize: 9.5,
                    fontWeight: FontWeight.bold,
                    color: Color(0xFF10B981),
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 6),
          Text(
            settings.tr('profile_market_desc'),
            style: TextStyle(
              fontSize: 10.5,
              color: settings.secondaryText,
            ),
          ),
          const SizedBox(height: 12),
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: isDark ? const Color(0xFF070F1E) : const Color(0xFFF8FAFC),
              borderRadius: BorderRadius.circular(10),
              border: Border.all(color: isDark ? const Color(0xFF1E293B) : const Color(0xFFE2E8F0)),
            ),
            child: Column(
              children: [
                _buildSpotMiniRow(
                  label: 'Alu 45 Thermique (TPR)',
                  price: '10 500 DZD',
                  trend: '+2.9%',
                  isUp: true,
                  settings: settings,
                ),
                const SizedBox(height: 6),
                _buildSpotMiniRow(
                  label: 'Double Vitrage 4/16/4 (MFG)',
                  price: '5 800 DZD',
                  trend: '+3.5%',
                  isUp: true,
                  settings: settings,
                ),
                const SizedBox(height: 6),
                _buildSpotMiniRow(
                  label: 'Tube Carré 40×40 (El Hadjar)',
                  price: '3 200 DZD',
                  trend: '-3.0%',
                  isUp: false,
                  settings: settings,
                ),
              ],
            ),
          ),
          const SizedBox(height: 12),
          SizedBox(
            width: double.infinity,
            height: 42,
            child: OutlinedButton.icon(
              onPressed: () {
                AlgerianMaterialMarketDialog.show(context);
              },
              icon: const Icon(Icons.tune_rounded, size: 16, color: Color(0xFFD4AF37)),
              label: FittedBox(
                fit: BoxFit.scaleDown,
                child: Text(
                  settings.tr('profile_market_btn'),
                  style: const TextStyle(
                    fontSize: 11,
                    fontWeight: FontWeight.bold,
                    color: Color(0xFFD4AF37),
                  ),
                ),
              ),
              style: OutlinedButton.styleFrom(
                side: const BorderSide(color: Color(0xFFD4AF37)),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSpotMiniRow({
    required String label,
    required String price,
    required String trend,
    required bool isUp,
    required AppSettings settings,
  }) {
    final trendColor = isUp ? const Color(0xFF10B981) : const Color(0xFFEF4444);
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Expanded(
          child: Text(
            label,
            style: TextStyle(fontSize: 10.5, color: settings.primaryText),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
        ),
        const SizedBox(width: 8),
        Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              price,
              style: const TextStyle(
                fontFamily: 'monospace',
                fontSize: 11,
                fontWeight: FontWeight.bold,
                color: Color(0xFFD4AF37),
              ),
            ),
            const SizedBox(width: 6),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 1),
              decoration: BoxDecoration(
                color: trendColor.withValues(alpha: 0.15),
                borderRadius: BorderRadius.circular(4),
              ),
              child: Text(
                trend,
                style: TextStyle(
                  fontSize: 9,
                  fontWeight: FontWeight.bold,
                  color: trendColor,
                ),
              ),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildWorkshopDetailsForm(AppSettings settings, bool isDark) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: settings.cardBackground,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: settings.cardBorder),
        boxShadow: isDark
            ? null
            : [
                BoxShadow(
                  color: Colors.black.withValues(alpha: 0.04),
                  blurRadius: 8,
                  offset: const Offset(0, 2),
                ),
              ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          FittedBox(
            fit: BoxFit.scaleDown,
            child: Text(
              settings.tr('profile_coords_title'),
              style: TextStyle(
                fontSize: 11,
                fontWeight: FontWeight.w800,
                color: settings.secondaryText,
                letterSpacing: 0.5,
              ),
            ),
          ),
          const SizedBox(height: 12),
          _buildTextField(
            label: settings.tr('profile_label_workshop_name'),
            controller: _workshopController,
            icon: Icons.storefront_rounded,
            hint: settings.tr('profile_hint_workshop_name'),
            settings: settings,
          ),
          const SizedBox(height: 10),
          _buildTextField(
            label: settings.tr('profile_label_artisan_name'),
            controller: _nameController,
            icon: Icons.person_rounded,
            hint: settings.tr('profile_hint_artisan_name'),
            settings: settings,
          ),
          const SizedBox(height: 10),
          _buildTextField(
            label: settings.tr('profile_label_phone'),
            controller: _phoneController,
            icon: Icons.phone_rounded,
            hint: '0797780838',
            keyboardType: TextInputType.phone,
            settings: settings,
          ),
          const SizedBox(height: 10),
          _buildTextField(
            label: settings.tr('profile_label_email'),
            controller: _emailController,
            icon: Icons.alternate_email_rounded,
            hint: 'midbariola@gmail.com',
            keyboardType: TextInputType.emailAddress,
            settings: settings,
          ),
          const SizedBox(height: 10),
          // Wilaya Dropdown
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                settings.tr('profile_label_wilaya'),
                style: TextStyle(fontSize: 11, color: settings.secondaryText),
              ),
              const SizedBox(height: 4),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 12),
                decoration: BoxDecoration(
                  color: settings.inputBackground,
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(color: settings.inputBorder),
                ),
                child: DropdownButtonHideUnderline(
                  child: DropdownButton<String>(
                    value: _selectedWilaya,
                    isExpanded: true,
                    dropdownColor: settings.cardBackground,
                    icon: const Icon(Icons.keyboard_arrow_down_rounded, color: Color(0xFFD4AF37)),
                    items: _wilayasList.map((w) {
                      return DropdownMenuItem(
                        value: w,
                        child: Text(
                          w,
                          style: TextStyle(fontSize: 12, color: settings.primaryText),
                        ),
                      );
                    }).toList(),
                    onChanged: (val) {
                      if (val != null) {
                        setState(() => _selectedWilaya = val);
                      }
                    },
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),
          _buildTextField(
            label: settings.tr('profile_label_nif'),
            controller: _nifController,
            icon: Icons.receipt_long_rounded,
            hint: settings.tr('profile_hint_nif'),
            settings: settings,
          ),
          const SizedBox(height: 10),
          _buildTextField(
            label: settings.tr('profile_label_rc'),
            controller: _rcController,
            icon: Icons.business_center_rounded,
            hint: settings.tr('profile_hint_rc'),
            settings: settings,
          ),
          const SizedBox(height: 10),
          Row(
            children: [
              Expanded(
                flex: 7,
                child: _buildTextField(
                  label: settings.tr('profile_label_ccp'),
                  controller: _ccpController,
                  icon: Icons.credit_card_rounded,
                  hint: settings.tr('profile_hint_ccp'),
                  keyboardType: TextInputType.number,
                  settings: settings,
                  onChanged: _onCcpChanged,
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                flex: 3,
                child: _buildTextField(
                  label: settings.tr('profile_label_ccp_key'),
                  controller: _ccpKeyController,
                  icon: Icons.vpn_key_rounded,
                  hint: '42',
                  keyboardType: TextInputType.number,
                  settings: settings,
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),
          _buildTextField(
            label: settings.tr('profile_label_rip'),
            controller: _ripController,
            icon: Icons.account_balance_wallet_rounded,
            hint: settings.tr('profile_hint_rip'),
            keyboardType: TextInputType.number,
            settings: settings,
          ),
        ],
      ),
    );
  }

  Widget _buildTextField({
    required String label,
    required TextEditingController controller,
    required IconData icon,
    required String hint,
    required AppSettings settings,
    TextInputType keyboardType = TextInputType.text,
    ValueChanged<String>? onChanged,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: TextStyle(fontSize: 11, color: settings.secondaryText),
        ),
        const SizedBox(height: 4),
        Container(
          decoration: BoxDecoration(
            color: settings.inputBackground,
            borderRadius: BorderRadius.circular(10),
            border: Border.all(color: settings.inputBorder),
          ),
          child: TextField(
            controller: controller,
            keyboardType: keyboardType,
            onChanged: onChanged,
            style: TextStyle(fontSize: 12, color: settings.primaryText),
            decoration: InputDecoration(
              isDense: true,
              prefixIcon: Icon(icon, size: 16, color: const Color(0xFFD4AF37)),
              hintText: hint,
              hintStyle: TextStyle(fontSize: 11, color: settings.secondaryText.withValues(alpha: 0.6)),
              border: InputBorder.none,
              contentPadding: const EdgeInsets.symmetric(horizontal: 10, vertical: 10),
            ),
          ),
        ),
      ],
    );
  }
}
