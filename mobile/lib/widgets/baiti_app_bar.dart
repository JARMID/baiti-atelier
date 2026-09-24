import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../services/app_settings.dart';
import '../models/artisan_profile.dart';

class BaitiAppBar extends StatelessWidget implements PreferredSizeWidget {
  final String title;
  final String subtitle;
  final ArtisanProfile? profile;
  final VoidCallback? onAvatarTap;
  final List<Widget>? customActions;

  const BaitiAppBar({
    super.key,
    required this.title,
    required this.subtitle,
    this.profile,
    this.onAvatarTap,
    this.customActions,
  });

  @override
  Size get preferredSize => const Size.fromHeight(66);

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
    final settings = AppSettings.instance;
    final isDark = settings.isDarkMode;

    final bgColor = isDark ? const Color(0xFF040B16) : const Color(0xFFFFFFFF);
    final borderColor = isDark ? const Color(0xFF1E293B) : const Color(0xFFE2E8F0);
    final subtextColor = isDark ? const Color(0xFF94A3B8) : const Color(0xFF64748B);

    return Container(
      decoration: BoxDecoration(
        color: bgColor,
        border: Border(
          bottom: BorderSide(color: borderColor, width: 1),
        ),
      ),
      child: SafeArea(
        bottom: false,
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
          child: Row(
            children: [
              // 1. BRAND LOGO MARK (3D SQUIRCLE)
              Container(
                width: 38,
                height: 38,
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(
                    color: const Color(0xFFD4AF37).withValues(alpha: 0.4),
                    width: 1.2,
                  ),
                  boxShadow: [
                    BoxShadow(
                      color: const Color(0xFFD4AF37).withValues(alpha: 0.15),
                      blurRadius: 8,
                      offset: const Offset(0, 2),
                    ),
                  ],
                ),
                child: ClipRRect(
                  borderRadius: BorderRadius.circular(9),
                  child: Image.asset(
                    'assets/images/baiti_logo.png',
                    fit: BoxFit.cover,
                    errorBuilder: (ctx, err, stack) => Container(
                      color: const Color(0xFF0A1830),
                      child: const Icon(Icons.architecture_rounded, color: Color(0xFFD4AF37), size: 20),
                    ),
                  ),
                ),
              ),

              const SizedBox(width: 10),

              // 2. BRAND LOCKUP: LUXURY GOLD BRAND AT TOP, CRISP CONTEXT AT BOTTOM
              Expanded(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    FittedBox(
                      fit: BoxFit.scaleDown,
                      alignment: settings.isRtl ? Alignment.centerRight : Alignment.centerLeft,
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Text(
                            settings.isRtl ? 'بيتي أتيليي' : 'BAITI ATELIER',
                            style: TextStyle(
                              fontSize: 13,
                              fontWeight: FontWeight.w900,
                              letterSpacing: settings.isRtl ? 0.6 : 2.0,
                              color: const Color(0xFFD4AF37),
                            ),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                          const SizedBox(width: 6),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 1),
                            decoration: BoxDecoration(
                              color: const Color(0xFFD4AF37).withValues(alpha: 0.15),
                              borderRadius: BorderRadius.circular(4),
                              border: Border.all(color: const Color(0xFFD4AF37).withValues(alpha: 0.4), width: 0.8),
                            ),
                            child: Text(
                              settings.isRtl ? 'برو' : 'PRO',
                              style: const TextStyle(
                                fontSize: 8.5,
                                fontWeight: FontWeight.w800,
                                color: Color(0xFFD4AF37),
                                letterSpacing: 0.8,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      title.toUpperCase(),
                      style: TextStyle(
                        fontSize: 9.5,
                        fontWeight: FontWeight.w700,
                        color: subtextColor,
                        letterSpacing: 0.8,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ],
                ),
              ),

              // 3. RIGHT CONTROLS: THEME + LANGUAGE + AVATAR
              Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  ...?customActions,

                  // Language Toggle Button (FR / AR)
                  GestureDetector(
                    onTap: () {
                      HapticFeedback.selectionClick();
                      settings.toggleLanguage();
                    },
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 5),
                      decoration: BoxDecoration(
                        color: isDark ? const Color(0xFF0F1B2D) : const Color(0xFFF1F5F9),
                        borderRadius: BorderRadius.circular(8),
                        border: Border.all(
                          color: isDark ? const Color(0xFF1E293B) : const Color(0xFFCBD5E1),
                        ),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          const Icon(Icons.language_rounded, size: 13, color: Color(0xFFD4AF37)),
                          const SizedBox(width: 4),
                          Text(
                            settings.language.toUpperCase(),
                            style: const TextStyle(
                              fontSize: 11,
                              fontWeight: FontWeight.w800,
                              color: Color(0xFFD4AF37),
                              letterSpacing: 0.5,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),

                  const SizedBox(width: 6),

                  // Dark / Light Theme Toggle
                  GestureDetector(
                    onTap: () {
                      HapticFeedback.selectionClick();
                      settings.toggleDarkMode();
                    },
                    child: Container(
                      width: 32,
                      height: 32,
                      decoration: BoxDecoration(
                        color: isDark ? const Color(0xFF0F1B2D) : const Color(0xFFF1F5F9),
                        borderRadius: BorderRadius.circular(8),
                        border: Border.all(
                          color: isDark ? const Color(0xFF1E293B) : const Color(0xFFCBD5E1),
                        ),
                      ),
                      child: Icon(
                        isDark ? Icons.light_mode_rounded : Icons.dark_mode_rounded,
                        size: 15,
                        color: isDark ? const Color(0xFFFBBF24) : const Color(0xFF334155),
                      ),
                    ),
                  ),

                  const SizedBox(width: 6),

                  // User Avatar Capsule
                  GestureDetector(
                    onTap: onAvatarTap,
                    child: Container(
                      padding: const EdgeInsets.all(3),
                      decoration: BoxDecoration(
                        color: isDark ? const Color(0xFF0F1B2D) : const Color(0xFFF1F5F9),
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(
                          color: profile?.isSubscriptionActive == true
                              ? const Color(0xFFD4AF37)
                              : (isDark ? const Color(0xFF1E293B) : const Color(0xFFCBD5E1)),
                          width: 1.2,
                        ),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          CircleAvatar(
                            radius: 12,
                            backgroundColor: profile?.isSubscriptionActive == true
                                ? const Color(0xFFD4AF37)
                                : const Color(0xFF1E293B),
                            child: Icon(
                              _getAvatarIcon(profile?.avatarIndex ?? 0),
                              size: 14,
                              color: profile?.isSubscriptionActive == true ? Colors.black : Colors.white70,
                            ),
                          ),
                          const SizedBox(width: 4),
                          Container(
                            width: 6,
                            height: 6,
                            margin: const EdgeInsets.only(right: 4),
                            decoration: BoxDecoration(
                              shape: BoxShape.circle,
                              color: profile?.isSubscriptionActive == true
                                  ? const Color(0xFF10B981)
                                  : const Color(0xFF94A3B8),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}
