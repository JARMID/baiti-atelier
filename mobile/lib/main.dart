import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'models/opening_spec.dart';
import 'services/storage_service.dart';
import 'services/app_settings.dart';
import 'screens/measure_take_screen.dart';
import 'screens/workshops_screen.dart';
import 'screens/chantiers_screen.dart';
import 'screens/artisan_profile_screen.dart';
import 'screens/splash_screen.dart';
import 'widgets/baiti_floating_nav_bar.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await AppSettings.instance.init();
  runApp(const BaitiMobileApp());
}

class BaitiMobileApp extends StatelessWidget {
  const BaitiMobileApp({super.key});

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: AppSettings.instance,
      builder: (context, _) {
        final settings = AppSettings.instance;
        final isDark = settings.isDarkMode;

        final darkTheme = ThemeData(
          useMaterial3: true,
          brightness: Brightness.dark,
          scaffoldBackgroundColor: const Color(0xFF040B16),
          primaryColor: const Color(0xFFD4AF37),
          colorScheme: const ColorScheme.dark(
            primary: Color(0xFFD4AF37),
            secondary: Color(0xFF38BDF8),
            surface: Color(0xFF0A1324),
            surfaceContainerHighest: Color(0xFF131D33),
          ),
          cardTheme: CardThemeData(
            color: const Color(0xFF0F172A),
            elevation: 0,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(16),
              side: const BorderSide(color: Color(0xFF1E293B), width: 1.2),
            ),
          ),
          appBarTheme: const AppBarTheme(
            backgroundColor: Color(0xFF040B16),
            elevation: 0,
            scrolledUnderElevation: 0,
          ),
          textTheme: GoogleFonts.interTextTheme(
            ThemeData.dark().textTheme,
          ),
        );

        final lightTheme = ThemeData(
          useMaterial3: true,
          brightness: Brightness.light,
          scaffoldBackgroundColor: const Color(0xFFF8FAFC),
          primaryColor: const Color(0xFFB8860B),
          colorScheme: const ColorScheme.light(
            primary: Color(0xFFB8860B),
            secondary: Color(0xFF0284C7),
            surface: Colors.white,
            surfaceContainerHighest: Color(0xFFF1F5F9),
          ),
          cardTheme: CardThemeData(
            color: Colors.white,
            elevation: 1,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(16),
              side: const BorderSide(color: Color(0xFFE2E8F0), width: 1.2),
            ),
          ),
          appBarTheme: const AppBarTheme(
            backgroundColor: Colors.white,
            elevation: 0,
            scrolledUnderElevation: 0,
          ),
          textTheme: GoogleFonts.interTextTheme(
            ThemeData.light().textTheme,
          ),
        );

        return MaterialApp(
          title: 'Baiti Atelier | بيتي',
          debugShowCheckedModeBanner: false,
          theme: isDark ? darkTheme : lightTheme,
          builder: (context, child) {
            return Directionality(
              textDirection: settings.isRtl ? TextDirection.rtl : TextDirection.ltr,
              child: child!,
            );
          },
          home: const SplashScreen(),
        );
      },
    );
  }
}

class MainNavigationHolder extends StatefulWidget {
  const MainNavigationHolder({super.key});

  @override
  State<MainNavigationHolder> createState() => _MainNavigationHolderState();
}

class _MainNavigationHolderState extends State<MainNavigationHolder> {
  int _currentIndex = 0;
  List<OpeningSpec> _savedSpecs = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadPersistedSpecs();
  }

  Future<void> _loadPersistedSpecs() async {
    final loaded = await StorageService.loadOpenings();
    if (mounted) {
      setState(() {
        _savedSpecs = loaded;
        _isLoading = false;
      });
    }
  }

  void _saveSpec(OpeningSpec spec) {
    setState(() {
      _savedSpecs.insert(0, spec);
    });
    StorageService.saveOpenings(_savedSpecs);
  }

  void _removeSpec(int idx) {
    setState(() {
      _savedSpecs.removeAt(idx);
    });
    StorageService.saveOpenings(_savedSpecs);
  }

  void _updateSpec(int idx, OpeningSpec updated) {
    setState(() {
      _savedSpecs[idx] = updated;
    });
    StorageService.saveOpenings(_savedSpecs);
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return const Scaffold(
        backgroundColor: Color(0xFF040B16),
        body: Center(
          child: CircularProgressIndicator(color: Color(0xFFD4AF37)),
        ),
      );
    }

    final screens = [
      MeasureTakeScreen(onSpecSaved: _saveSpec),
      const WorkshopsScreen(),
      ChantiersScreen(
        savedSpecs: _savedSpecs,
        onRemove: _removeSpec,
        onUpdate: _updateSpec,
        onAddSpec: (spec) => _saveSpec(spec),
      ),
      const ArtisanProfileScreen(),
    ];

    return Scaffold(
      extendBody: true,
      body: IndexedStack(
        index: _currentIndex,
        children: screens,
      ),
      bottomNavigationBar: BaitiFloatingNavBar(
        currentIndex: _currentIndex,
        onTap: (index) => setState(() => _currentIndex = index),
      ),
    );
  }
}
