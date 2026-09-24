import 'package:flutter/material.dart';
import '../services/storage_service.dart';
import '../services/app_settings.dart';
import 'auth_screen.dart';

class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key});

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen> with SingleTickerProviderStateMixin {
  late AnimationController _animController;
  late Animation<double> _scaleAnimation;
  late Animation<double> _fadeAnimation;
  late String _statusText;

  @override
  void initState() {
    super.initState();
    _statusText = AppSettings.instance.tr('boot_cad');
    _animController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1400),
    );

    _scaleAnimation = Tween<double>(begin: 0.85, end: 1.0).animate(
      CurvedAnimation(parent: _animController, curve: Curves.easeOutBack),
    );

    _fadeAnimation = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(parent: _animController, curve: Curves.easeIn),
    );

    _animController.forward();
    _runBootSequence();
  }

  Future<void> _runBootSequence() async {
    final settings = AppSettings.instance;
    await Future.delayed(const Duration(milliseconds: 400));
    if (mounted) setState(() => _statusText = settings.tr('boot_profiles'));

    await Future.delayed(const Duration(milliseconds: 500));
    if (mounted) setState(() => _statusText = settings.tr('boot_wilayas'));

    await Future.delayed(const Duration(milliseconds: 500));
    if (mounted) setState(() => _statusText = settings.tr('boot_dtr'));

    await StorageService.loadArtisanProfile();
    await Future.delayed(const Duration(milliseconds: 600));

    if (!mounted) return;

    Navigator.pushReplacement(
      context,
      PageRouteBuilder(
        transitionDuration: const Duration(milliseconds: 500),
        pageBuilder: (ctx, anim, secAnim) => FadeTransition(
          opacity: anim,
          child: const AuthScreen(),
        ),
      ),
    );
  }

  @override
  void dispose() {
    _animController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final settings = AppSettings.instance;
    return Scaffold(
      backgroundColor: settings.scaffoldBackground,
      body: Center(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 24),
          child: FadeTransition(
            opacity: _fadeAnimation,
            child: ScaleTransition(
              scale: _scaleAnimation,
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  // 3D SQUIRCLE EMBLEM WITH GLOW
                  Container(
                    width: 90,
                    height: 90,
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(24),
                      border: Border.all(
                        color: const Color(0xFFD4AF37).withValues(alpha: 0.5),
                        width: 1.5,
                      ),
                      boxShadow: [
                        BoxShadow(
                          color: const Color(0xFFD4AF37).withValues(alpha: 0.25),
                          blurRadius: 30,
                          spreadRadius: 2,
                        ),
                      ],
                    ),
                    child: ClipRRect(
                      borderRadius: BorderRadius.circular(22),
                      child: Image.asset(
                        'assets/images/baiti_logo.png',
                        fit: BoxFit.cover,
                        errorBuilder: (ctx, err, stack) => Container(
                          color: settings.chipBackground,
                          child: const Icon(Icons.architecture_rounded, color: Color(0xFFD4AF37), size: 45),
                        ),
                      ),
                    ),
                  ),

                  const SizedBox(height: 24),

                  // BRAND TITLE
                  Text(
                    'BAITI ATELIER',
                    style: TextStyle(
                      fontFamily: 'monospace',
                      fontSize: 22,
                      fontWeight: FontWeight.w900,
                      color: settings.primaryText,
                      letterSpacing: 2.5,
                    ),
                  ),

                  const SizedBox(height: 4),

                  const Text(
                    'بيتي أتيليي · منظومة الورشات الجزائرية',
                    textDirection: TextDirection.rtl,
                    style: TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.bold,
                      color: Color(0xFFD4AF37),
                    ),
                  ),

                  const SizedBox(height: 30),

                  // LOADER
                  SizedBox(
                    width: 140,
                    child: LinearProgressIndicator(
                      backgroundColor: settings.chipBackground,
                      valueColor: const AlwaysStoppedAnimation<Color>(Color(0xFFD4AF37)),
                      minHeight: 2.5,
                    ),
                  ),

                  const SizedBox(height: 14),

                  // DYNAMIC STATUS
                  Text(
                    _statusText,
                    style: TextStyle(
                      fontSize: 11,
                      color: settings.secondaryText,
                      fontFamily: 'monospace',
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
