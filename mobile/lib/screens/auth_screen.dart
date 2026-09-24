import 'dart:async';
import 'package:flutter/material.dart';
import '../models/artisan_profile.dart';
import '../services/storage_service.dart';
import '../services/app_settings.dart';
import '../main.dart';

class AuthScreen extends StatefulWidget {
  const AuthScreen({super.key});

  @override
  State<AuthScreen> createState() => _AuthScreenState();
}

class _AuthScreenState extends State<AuthScreen> {
  int _activeTab = 0; // 0: Connexion, 1: Inscription
  int _loginMethod = 0; // 0: Email + Mot de passe, 1: Téléphone SMS OTP
  bool _isLoading = false;
  bool _obscurePassword = true;

  // OTP State for Phone Login
  bool _otpSent = false;
  final TextEditingController _otpController = TextEditingController();
  int _otpCountdown = 30;
  Timer? _countdownTimer;

  // Form Controllers initialized with requested test credentials
  final TextEditingController _emailController = TextEditingController(text: 'midbariola@gmail.com');
  final TextEditingController _phoneController = TextEditingController(text: '0797780838');
  final TextEditingController _passwordController = TextEditingController(text: 'BaitiPro2026!');
  final TextEditingController _nameController = TextEditingController(text: 'Mourad Hadj-Ali');
  final TextEditingController _workshopController = TextEditingController(text: 'Atelier Aluminium Kouba');
  String _selectedWilaya = '16 - Alger';
  int _selectedAvatarIndex = 0;

  // Real-time Password Criteria
  bool get _hasMinLength => _passwordController.text.length >= 8;
  bool get _hasUppercase => RegExp(r'[A-Z]').hasMatch(_passwordController.text);
  bool get _hasLowercase => RegExp(r'[a-z]').hasMatch(_passwordController.text);
  bool get _hasNumber => RegExp(r'[0-9]').hasMatch(_passwordController.text);
  bool get _hasSpecialChar => RegExp(r'[!@#$%^&*(),.?":{}|<>]').hasMatch(_passwordController.text);
  bool get _isPasswordValid =>
      _hasMinLength && _hasUppercase && _hasLowercase && _hasNumber && _hasSpecialChar;

  // Real-time Email Validity
  bool get _isEmailValid {
    final email = _emailController.text.trim();
    if (email.isEmpty) return false;
    return RegExp(r'^[a-zA-Z0-9.!#$%&*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+\.[a-zA-Z]{2,12}$').hasMatch(email);
  }

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
    _passwordController.addListener(_onFieldChanged);
    _emailController.addListener(_onFieldChanged);
  }

  void _onFieldChanged() {
    if (mounted) setState(() {});
  }

  @override
  void dispose() {
    _countdownTimer?.cancel();
    _passwordController.removeListener(_onFieldChanged);
    _emailController.removeListener(_onFieldChanged);
    _emailController.dispose();
    _phoneController.dispose();
    _passwordController.dispose();
    _nameController.dispose();
    _workshopController.dispose();
    _otpController.dispose();
    super.dispose();
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

  void _startOtpCountdown() {
    setState(() {
      _otpCountdown = 30;
      _otpSent = true;
      _otpController.text = '482910'; // Pre-filled valid simulation code
    });
    _countdownTimer?.cancel();
    _countdownTimer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (!mounted) return;
      if (_otpCountdown > 0) {
        setState(() => _otpCountdown--);
      } else {
        timer.cancel();
      }
    });
  }

  Future<void> _handleLogin() async {
    if (_loginMethod == 0) {
      // Email login validation
      if (!_isEmailValid) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Veuillez saisir une adresse email professionnelle valide (ex: midbariola@gmail.com)'),
            backgroundColor: Colors.redAccent,
          ),
        );
        return;
      }
    } else {
      // Phone OTP mode
      if (!_otpSent) {
        _startOtpCountdown();
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Code SMS OTP envoyé au 0797780838 (Code test : 482910)'),
            backgroundColor: Color(0xFF10B981),
          ),
        );
        return;
      }
      if (_otpController.text.trim().length != 6) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Veuillez saisir le code de vérification SMS à 6 chiffres'),
            backgroundColor: Colors.redAccent,
          ),
        );
        return;
      }
    }

    setState(() => _isLoading = true);
    await Future.delayed(const Duration(milliseconds: 600));

    final existing = await StorageService.loadArtisanProfile();
    final updated = existing.copyWith(
      phone: _phoneController.text.trim(),
      email: _emailController.text.trim(),
      name: _nameController.text.trim().isNotEmpty ? _nameController.text.trim() : existing.name,
      workshopName: _workshopController.text.trim().isNotEmpty ? _workshopController.text.trim() : existing.workshopName,
      isSubscriptionActive: true,
    );
    await StorageService.saveArtisanProfile(updated);

    if (mounted) {
      setState(() => _isLoading = false);
      Navigator.pushReplacement(
        context,
        MaterialPageRoute(builder: (ctx) => const MainNavigationHolder()),
      );
    }
  }

  Future<void> _handleSignUp() async {
    if (!_isEmailValid) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Veuillez saisir une adresse email valide'),
          backgroundColor: Colors.redAccent,
        ),
      );
      return;
    }
    if (!_isPasswordValid) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Le mot de passe doit respecter tous les critères de sécurité ci-dessous'),
          backgroundColor: Colors.redAccent,
        ),
      );
      return;
    }

    setState(() => _isLoading = true);
    await Future.delayed(const Duration(milliseconds: 700));

    final newProfile = ArtisanProfile(
      id: 'artisan-${DateTime.now().millisecondsSinceEpoch}',
      name: _nameController.text.trim().isNotEmpty ? _nameController.text.trim() : 'Mourad Hadj-Ali',
      workshopName: _workshopController.text.trim().isNotEmpty ? _workshopController.text.trim() : 'Atelier Aluminium Kouba',
      phone: _phoneController.text.trim().isNotEmpty ? _phoneController.text.trim() : '0797780838',
      email: _emailController.text.trim().isNotEmpty ? _emailController.text.trim() : 'midbariola@gmail.com',
      wilaya: _selectedWilaya,
      avatarIndex: _selectedAvatarIndex,
      isSubscriptionActive: true,
      subscriptionTier: 'Atelier Pro Annuel · 35 000 DZD',
      twoFactorEnabled: true,
    );

    await StorageService.saveArtisanProfile(newProfile);

    if (mounted) {
      setState(() => _isLoading = false);
      Navigator.pushReplacement(
        context,
        MaterialPageRoute(builder: (ctx) => const MainNavigationHolder()),
      );
    }
  }

  void _continueAsGuest() {
    Navigator.pushReplacement(
      context,
      MaterialPageRoute(builder: (ctx) => const MainNavigationHolder()),
    );
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: AppSettings.instance,
      builder: (context, _) {
        final settings = AppSettings.instance;
        final isDark = settings.isDarkMode;

        return Scaffold(
          backgroundColor: settings.scaffoldBackground,
          body: SafeArea(
            child: Center(
              child: SingleChildScrollView(
                padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    // Top Brand Mark (3D Squircle with ambient gold aura)
                    Container(
                      width: 68,
                      height: 68,
                      decoration: BoxDecoration(
                        borderRadius: BorderRadius.circular(18),
                        border: Border.all(
                          color: const Color(0xFFD4AF37).withValues(alpha: 0.6),
                          width: 1.5,
                        ),
                        boxShadow: [
                          BoxShadow(
                            color: const Color(0xFFD4AF37).withValues(alpha: 0.25),
                            blurRadius: 22,
                            offset: const Offset(0, 4),
                          ),
                        ],
                      ),
                      child: ClipRRect(
                        borderRadius: BorderRadius.circular(16),
                        child: Image.asset(
                          'assets/images/baiti_logo.png',
                          fit: BoxFit.cover,
                          errorBuilder: (ctx, err, stack) => Container(
                            color: const Color(0xFF0F1B2D),
                            child: const Icon(
                              Icons.architecture_rounded,
                              color: Color(0xFFD4AF37),
                              size: 34,
                            ),
                          ),
                        ),
                      ),
                    ),

                    const SizedBox(height: 14),

                    Text(
                      settings.isRtl ? 'بيتي أتيليي' : 'BAITI ATELIER',
                      style: const TextStyle(
                        fontSize: 22,
                        fontWeight: FontWeight.w900,
                        color: Color(0xFFD4AF37),
                        letterSpacing: 2.2,
                      ),
                    ),

                    const SizedBox(height: 4),

                    Text(
                      settings.isRtl
                          ? 'بوابة الحرفيين وورشات النجارة في الجزائر'
                          : 'Portail des Artisans & Menuisiers Algériens (58 Wilayas)',
                      textAlign: TextAlign.center,
                      style: TextStyle(fontSize: 12, color: settings.secondaryText),
                    ),

                    const SizedBox(height: 22),

                    // Tab Switcher: Connexion vs Inscription
                    Container(
                      padding: const EdgeInsets.all(4),
                      decoration: BoxDecoration(
                        color: isDark ? const Color(0xFF0E1A2C) : const Color(0xFFE2E8F0),
                        borderRadius: BorderRadius.circular(14),
                        border: Border.all(color: settings.cardBorder),
                      ),
                      child: Row(
                        children: [
                          Expanded(
                            child: GestureDetector(
                              onTap: () => setState(() => _activeTab = 0),
                              child: Container(
                                padding: const EdgeInsets.symmetric(vertical: 10, horizontal: 6),
                                decoration: BoxDecoration(
                                  color: _activeTab == 0 ? const Color(0xFFD4AF37) : Colors.transparent,
                                  borderRadius: BorderRadius.circular(10),
                                ),
                                child: FittedBox(
                                  fit: BoxFit.scaleDown,
                                  child: Text(
                                    'CONNEXION ATELIER',
                                    textAlign: TextAlign.center,
                                    style: TextStyle(
                                      fontSize: 11.5,
                                      fontWeight: FontWeight.bold,
                                      color: _activeTab == 0 ? const Color(0xFF040B16) : settings.secondaryText,
                                      letterSpacing: 0.5,
                                    ),
                                  ),
                                ),
                              ),
                            ),
                          ),
                          Expanded(
                            child: GestureDetector(
                              onTap: () => setState(() => _activeTab = 1),
                              child: Container(
                                padding: const EdgeInsets.symmetric(vertical: 10, horizontal: 6),
                                decoration: BoxDecoration(
                                  color: _activeTab == 1 ? const Color(0xFFD4AF37) : Colors.transparent,
                                  borderRadius: BorderRadius.circular(10),
                                ),
                                child: FittedBox(
                                  fit: BoxFit.scaleDown,
                                  child: Text(
                                    'CRÉER UN COMPTE',
                                    textAlign: TextAlign.center,
                                    style: TextStyle(
                                      fontSize: 11.5,
                                      fontWeight: FontWeight.bold,
                                      color: _activeTab == 1 ? const Color(0xFF040B16) : settings.secondaryText,
                                      letterSpacing: 0.5,
                                    ),
                                  ),
                                ),
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),

                    const SizedBox(height: 18),

                    // Main Form Container
                    Container(
                      padding: const EdgeInsets.all(20),
                      decoration: BoxDecoration(
                        color: settings.cardBackground,
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(color: settings.cardBorder),
                        boxShadow: isDark
                            ? null
                            : [
                                BoxShadow(
                                  color: Colors.black.withValues(alpha: 0.05),
                                  blurRadius: 14,
                                  offset: const Offset(0, 4),
                                ),
                              ],
                      ),
                      child: _activeTab == 0 ? _buildLoginForm(settings, isDark) : _buildSignUpForm(settings, isDark),
                    ),

                    const SizedBox(height: 16),

                    // Guest Mode Button
                    TextButton.icon(
                      onPressed: _continueAsGuest,
                      icon: const Icon(Icons.arrow_forward_rounded, size: 16, color: Color(0xFF38BDF8)),
                      label: const Text(
                        'Accéder immédiatement en Mode Invité / Découverte',
                        style: TextStyle(
                          color: Color(0xFF38BDF8),
                          fontSize: 12,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        );
      },
    );
  }

  Widget _buildLoginForm(AppSettings settings, bool isDark) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        // Mode Switcher: Email vs Phone SMS OTP
        Row(
          children: [
            Expanded(
              child: GestureDetector(
                onTap: () => setState(() => _loginMethod = 0),
                child: Container(
                  padding: const EdgeInsets.symmetric(vertical: 8),
                  decoration: BoxDecoration(
                    color: _loginMethod == 0
                        ? const Color(0xFFD4AF37).withValues(alpha: 0.15)
                        : Colors.transparent,
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(
                      color: _loginMethod == 0 ? const Color(0xFFD4AF37) : settings.inputBorder,
                    ),
                  ),
                  child: FittedBox(
                    fit: BoxFit.scaleDown,
                    child: Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 6),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(Icons.alternate_email_rounded,
                              size: 14, color: _loginMethod == 0 ? const Color(0xFFD4AF37) : settings.secondaryText),
                          const SizedBox(width: 5),
                          Text(
                            'Email / Passe',
                            style: TextStyle(
                              fontSize: 11,
                              fontWeight: FontWeight.bold,
                              color: _loginMethod == 0 ? const Color(0xFFD4AF37) : settings.secondaryText,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
              ),
            ),
            const SizedBox(width: 8),
            Expanded(
              child: GestureDetector(
                onTap: () => setState(() => _loginMethod = 1),
                child: Container(
                  padding: const EdgeInsets.symmetric(vertical: 8),
                  decoration: BoxDecoration(
                    color: _loginMethod == 1
                        ? const Color(0xFFD4AF37).withValues(alpha: 0.15)
                        : Colors.transparent,
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(
                      color: _loginMethod == 1 ? const Color(0xFFD4AF37) : settings.inputBorder,
                    ),
                  ),
                  child: FittedBox(
                    fit: BoxFit.scaleDown,
                    child: Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 6),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(Icons.phone_android_rounded,
                              size: 14, color: _loginMethod == 1 ? const Color(0xFFD4AF37) : settings.secondaryText),
                          const SizedBox(width: 5),
                          Text(
                            'Téléphone SMS',
                            style: TextStyle(
                              fontSize: 11,
                              fontWeight: FontWeight.bold,
                              color: _loginMethod == 1 ? const Color(0xFFD4AF37) : settings.secondaryText,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
              ),
            ),
          ],
        ),

        const SizedBox(height: 16),

        if (_loginMethod == 0) ...[
          // Email Field
          TextField(
            controller: _emailController,
            keyboardType: TextInputType.emailAddress,
            style: TextStyle(color: settings.primaryText, fontSize: 13),
            decoration: InputDecoration(
              labelText: 'Adresse Email Atelier',
              labelStyle: TextStyle(fontSize: 11, color: settings.secondaryText),
              prefixIcon: const Icon(Icons.email_outlined, color: Color(0xFFD4AF37), size: 18),
              suffixIcon: _isEmailValid
                  ? const Icon(Icons.check_circle_rounded, color: Color(0xFF10B981), size: 18)
                  : null,
              filled: true,
              fillColor: settings.inputBackground,
              border: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: BorderSide(color: settings.inputBorder)),
              enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: BorderSide(color: settings.inputBorder)),
            ),
          ),
          const SizedBox(height: 14),

          // Password Field
          TextField(
            controller: _passwordController,
            obscureText: _obscurePassword,
            style: TextStyle(color: settings.primaryText, fontSize: 13),
            decoration: InputDecoration(
              labelText: 'Mot de passe Atelier',
              labelStyle: TextStyle(fontSize: 11, color: settings.secondaryText),
              prefixIcon: const Icon(Icons.lock_outline_rounded, color: Color(0xFFD4AF37), size: 18),
              suffixIcon: IconButton(
                icon: Icon(
                  _obscurePassword ? Icons.visibility_off_rounded : Icons.visibility_rounded,
                  color: settings.secondaryText,
                  size: 18,
                ),
                onPressed: () => setState(() => _obscurePassword = !_obscurePassword),
              ),
              filled: true,
              fillColor: settings.inputBackground,
              border: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: BorderSide(color: settings.inputBorder)),
              enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: BorderSide(color: settings.inputBorder)),
            ),
          ),
        ] else ...[
          // Phone Field
          TextField(
            controller: _phoneController,
            keyboardType: TextInputType.phone,
            style: TextStyle(color: settings.primaryText, fontSize: 13),
            decoration: InputDecoration(
              labelText: 'Numéro de Téléphone (ex: 0797780838)',
              labelStyle: TextStyle(fontSize: 11, color: settings.secondaryText),
              prefixIcon: const Icon(Icons.phone_iphone_rounded, color: Color(0xFFD4AF37), size: 18),
              filled: true,
              fillColor: settings.inputBackground,
              border: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: BorderSide(color: settings.inputBorder)),
              enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: BorderSide(color: settings.inputBorder)),
            ),
          ),
          if (_otpSent) ...[
            const SizedBox(height: 12),
            TextField(
              controller: _otpController,
              keyboardType: TextInputType.number,
              style: TextStyle(color: settings.primaryText, fontSize: 16, fontWeight: FontWeight.bold, letterSpacing: 4),
              textAlign: TextAlign.center,
              decoration: InputDecoration(
                labelText: 'Code de vérification SMS (6 chiffres)',
                labelStyle: TextStyle(fontSize: 11, color: settings.secondaryText, letterSpacing: 0),
                prefixIcon: const Icon(Icons.security_rounded, color: Color(0xFF10B981), size: 18),
                suffixText: _otpCountdown > 0 ? '${_otpCountdown}s' : 'Renvoyer',
                suffixStyle: const TextStyle(color: Color(0xFFD4AF37), fontWeight: FontWeight.bold, fontSize: 12),
                filled: true,
                fillColor: settings.inputBackground,
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: BorderSide(color: settings.inputBorder)),
                enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: const BorderSide(color: Color(0xFF10B981))),
              ),
            ),
          ],
        ],

        const SizedBox(height: 20),

        SizedBox(
          height: 48,
          child: ElevatedButton(
            onPressed: _isLoading ? null : _handleLogin,
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFFD4AF37),
              foregroundColor: const Color(0xFF040B16),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              elevation: 3,
            ),
            child: _isLoading
                ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.black))
                : Text(
                    _loginMethod == 1 && !_otpSent
                        ? 'RECEVOIR LE CODE SMS OTP'
                        : 'SE CONNECTER À MON ATELIER',
                    style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12, letterSpacing: 0.5),
                  ),
          ),
        ),
      ],
    );
  }

  Widget _buildSignUpForm(AppSettings settings, bool isDark) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        // Name
        TextField(
          controller: _nameController,
          style: TextStyle(color: settings.primaryText, fontSize: 13),
          decoration: InputDecoration(
            labelText: 'Nom & Prénom du Responsable',
            labelStyle: TextStyle(fontSize: 11, color: settings.secondaryText),
            prefixIcon: const Icon(Icons.person_rounded, color: Color(0xFFD4AF37), size: 18),
            filled: true,
            fillColor: settings.inputBackground,
            border: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: BorderSide(color: settings.inputBorder)),
            enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: BorderSide(color: settings.inputBorder)),
          ),
        ),
        const SizedBox(height: 10),

        // Workshop Name
        TextField(
          controller: _workshopController,
          style: TextStyle(color: settings.primaryText, fontSize: 13),
          decoration: InputDecoration(
            labelText: 'Nom de l\'Atelier (Raison Sociale)',
            labelStyle: TextStyle(fontSize: 11, color: settings.secondaryText),
            prefixIcon: const Icon(Icons.storefront_rounded, color: Color(0xFFD4AF37), size: 18),
            filled: true,
            fillColor: settings.inputBackground,
            border: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: BorderSide(color: settings.inputBorder)),
            enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: BorderSide(color: settings.inputBorder)),
          ),
        ),
        const SizedBox(height: 10),

        // Phone
        TextField(
          controller: _phoneController,
          keyboardType: TextInputType.phone,
          style: TextStyle(color: settings.primaryText, fontSize: 13),
          decoration: InputDecoration(
            labelText: 'Numéro de Téléphone (ex: 0797780838)',
            labelStyle: TextStyle(fontSize: 11, color: settings.secondaryText),
            prefixIcon: const Icon(Icons.phone_rounded, color: Color(0xFFD4AF37), size: 18),
            filled: true,
            fillColor: settings.inputBackground,
            border: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: BorderSide(color: settings.inputBorder)),
            enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: BorderSide(color: settings.inputBorder)),
          ),
        ),
        const SizedBox(height: 10),

        // Email
        TextField(
          controller: _emailController,
          keyboardType: TextInputType.emailAddress,
          style: TextStyle(color: settings.primaryText, fontSize: 13),
          decoration: InputDecoration(
            labelText: 'Adresse Email Atelier (midbariola@gmail.com)',
            labelStyle: TextStyle(fontSize: 11, color: settings.secondaryText),
            prefixIcon: const Icon(Icons.alternate_email_rounded, color: Color(0xFFD4AF37), size: 18),
            suffixIcon: _isEmailValid
                ? const Icon(Icons.check_circle_rounded, color: Color(0xFF10B981), size: 18)
                : null,
            filled: true,
            fillColor: settings.inputBackground,
            border: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: BorderSide(color: settings.inputBorder)),
            enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: BorderSide(color: settings.inputBorder)),
          ),
        ),
        const SizedBox(height: 10),

        // Password with Live Policy Validation
        TextField(
          controller: _passwordController,
          obscureText: _obscurePassword,
          style: TextStyle(color: settings.primaryText, fontSize: 13),
          decoration: InputDecoration(
            labelText: 'Mot de passe sécurisé',
            labelStyle: TextStyle(fontSize: 11, color: settings.secondaryText),
            prefixIcon: const Icon(Icons.lock_rounded, color: Color(0xFFD4AF37), size: 18),
            suffixIcon: IconButton(
              icon: Icon(
                _obscurePassword ? Icons.visibility_off_rounded : Icons.visibility_rounded,
                color: settings.secondaryText,
                size: 18,
              ),
              onPressed: () => setState(() => _obscurePassword = !_obscurePassword),
            ),
            filled: true,
            fillColor: settings.inputBackground,
            border: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: BorderSide(color: settings.inputBorder)),
            enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: BorderSide(color: settings.inputBorder)),
          ),
        ),
        const SizedBox(height: 10),

        // TrustDesk-grade Password Policy Checklist Box
        Container(
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            color: isDark ? const Color(0xFF060E1A) : const Color(0xFFF1F5F9),
            borderRadius: BorderRadius.circular(10),
            border: Border.all(color: settings.cardBorder),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'CRITÈRES DE SÉCURITÉ DU MOT DE PASSE :',
                style: TextStyle(
                  fontSize: 10,
                  fontWeight: FontWeight.w800,
                  color: settings.secondaryText,
                  letterSpacing: 0.5,
                ),
              ),
              const SizedBox(height: 6),
              _buildCriteriaRow('Minimum 8 caractères', _hasMinLength, settings),
              _buildCriteriaRow('Au moins une lettre majuscule (A-Z)', _hasUppercase, settings),
              _buildCriteriaRow('Au moins une lettre minuscule (a-z)', _hasLowercase, settings),
              _buildCriteriaRow('Au moins un chiffre (0-9)', _hasNumber, settings),
              _buildCriteriaRow('Au moins un caractère spécial (!@#\$%...)', _hasSpecialChar, settings),
            ],
          ),
        ),

        const SizedBox(height: 12),

        // Wilaya Dropdown
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
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
              style: TextStyle(fontSize: 12.5, color: settings.primaryText),
              icon: const Icon(Icons.keyboard_arrow_down_rounded, color: Color(0xFFD4AF37)),
              items: _wilayasList.map((w) => DropdownMenuItem(value: w, child: Text(w))).toList(),
              onChanged: (val) {
                if (val != null) setState(() => _selectedWilaya = val);
              },
            ),
          ),
        ),
        const SizedBox(height: 14),

        // Avatar Selection Carousel
        Text(
          'CHOISIR L\'AVATAR DE VOTRE ATELIER',
          style: TextStyle(fontSize: 10, fontWeight: FontWeight.w800, color: settings.secondaryText, letterSpacing: 0.5),
        ),
        const SizedBox(height: 8),
        Wrap(
          spacing: 8,
          runSpacing: 8,
          children: List.generate(6, (idx) {
            final isSelected = _selectedAvatarIndex == idx;
            return GestureDetector(
              onTap: () => setState(() => _selectedAvatarIndex = idx),
              child: AnimatedContainer(
                duration: const Duration(milliseconds: 200),
                width: 42,
                height: 42,
                decoration: BoxDecoration(
                  color: isSelected ? const Color(0xFFD4AF37) : (isDark ? const Color(0xFF0F1B2D) : const Color(0xFFF1F5F9)),
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(
                    color: isSelected ? const Color(0xFFD4AF37) : settings.cardBorder,
                    width: isSelected ? 2 : 1,
                  ),
                ),
                child: Icon(
                  _getAvatarIcon(idx),
                  color: isSelected ? const Color(0xFF040B16) : settings.primaryText.withValues(alpha: 0.8),
                  size: 20,
                ),
              ),
            );
          }),
        ),

        const SizedBox(height: 18),

        SizedBox(
          height: 48,
          child: ElevatedButton(
            onPressed: _isLoading ? null : _handleSignUp,
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFFD4AF37),
              foregroundColor: const Color(0xFF040B16),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              elevation: 3,
            ),
            child: _isLoading
                ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.black))
                : const Text('CRÉER MON ESPACE ATELIER PRO', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12, letterSpacing: 0.5)),
          ),
        ),
      ],
    );
  }

  Widget _buildCriteriaRow(String text, bool valid, AppSettings settings) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 2),
      child: Row(
        children: [
          Icon(
            valid ? Icons.check_circle_rounded : Icons.radio_button_unchecked_rounded,
            size: 13,
            color: valid ? const Color(0xFF10B981) : settings.secondaryText.withValues(alpha: 0.5),
          ),
          const SizedBox(width: 6),
          Expanded(
            child: Text(
              text,
              style: TextStyle(
                fontSize: 10.5,
                color: valid ? (settings.isDarkMode ? Colors.white : const Color(0xFF0F172A)) : settings.secondaryText,
                fontWeight: valid ? FontWeight.w600 : FontWeight.normal,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
