import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../models/artisan_profile.dart';
import '../services/storage_service.dart';
import '../services/app_settings.dart';

class AlgerianPaymentDialog extends StatefulWidget {
  final ArtisanProfile profile;
  final VoidCallback onPaymentSuccess;

  const AlgerianPaymentDialog({
    super.key,
    required this.profile,
    required this.onPaymentSuccess,
  });

  static Future<void> show(
    BuildContext context, {
    required ArtisanProfile profile,
    required VoidCallback onPaymentSuccess,
  }) {
    return showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => Padding(
        padding: EdgeInsets.only(bottom: MediaQuery.of(ctx).viewInsets.bottom),
        child: AlgerianPaymentDialog(
          profile: profile,
          onPaymentSuccess: onPaymentSuccess,
        ),
      ),
    );
  }

  @override
  State<AlgerianPaymentDialog> createState() => _AlgerianPaymentDialogState();
}

class _AlgerianPaymentDialogState extends State<AlgerianPaymentDialog> {
  int _activeMethod = 0; // 0: BaridiMob, 1: Edahabia/CIB, 2: CCP Mandat
  bool _isProcessing = false;
  bool _isOtpStep = false;
  final TextEditingController _otpController = TextEditingController(text: '482910');
  final TextEditingController _cardNumberController = TextEditingController(text: '6280 0451 9283 1044');
  final TextEditingController _cardExpiryController = TextEditingController(text: '08/28');
  final TextEditingController _cardCvvController = TextEditingController(text: '349');
  final TextEditingController _ccpSlipController = TextEditingController(text: 'REC-DZ-8942');

  final String _baridimobRip = '007 99999 0021458932 45';
  final String _ccpAccount = '00214589 Clé 45';

  Future<void> _simulatePayment() async {
    setState(() => _isProcessing = true);
    await Future.delayed(const Duration(milliseconds: 1400));
    if (!mounted) return;

    if (_activeMethod == 0 || _activeMethod == 1) {
      // Show OTP step for 3DS / BaridiMob
      setState(() {
        _isProcessing = false;
        _isOtpStep = true;
      });
    } else {
      await _completeSubscription();
    }
  }

  Future<void> _completeSubscription() async {
    setState(() => _isProcessing = true);
    await Future.delayed(const Duration(milliseconds: 1000));

    final updated = widget.profile.copyWith(
      isSubscriptionActive: true,
      subscriptionTier: 'Atelier Pro Annuel · 35 000 DZD',
      subscriptionExpiry: DateTime.now().add(const Duration(days: 365)).toIso8601String().split('T')[0],
    );

    await StorageService.saveArtisanProfile(updated);

    if (mounted) {
      setState(() {
        _isProcessing = false;
        _isOtpStep = false;
      });
      widget.onPaymentSuccess();
      Navigator.pop(context);

      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          backgroundColor: Color(0xFF10B981),
          content: Row(
            children: [
              Icon(Icons.verified_rounded, color: Colors.white, size: 20),
              SizedBox(width: 8),
              Expanded(
                child: Text(
                  'Abonnement Pro activé avec succès ! Reçu de 35 000 DZD émis.',
                  style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12),
                ),
              ),
            ],
          ),
          duration: Duration(seconds: 4),
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDark = AppSettings.instance.isDarkMode;
    final bgColor = isDark ? const Color(0xFF071224) : Colors.white;
    final cardColor = isDark ? const Color(0xFF0F1D33) : const Color(0xFFF8FAFC);
    final borderColor = isDark ? const Color(0xFF1E293B) : const Color(0xFFE2E8F0);
    final textColor = isDark ? Colors.white : const Color(0xFF0F172A);

    return Container(
      constraints: BoxConstraints(
        maxHeight: MediaQuery.of(context).size.height * 0.88,
      ),
      decoration: BoxDecoration(
        color: bgColor,
        borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
        border: Border.all(color: borderColor),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          // Drag handle
          Container(
            width: 40,
            height: 4,
            margin: const EdgeInsets.symmetric(vertical: 10),
            decoration: BoxDecoration(
              color: Colors.grey.withValues(alpha: 0.4),
              borderRadius: BorderRadius.circular(2),
            ),
          ),

          // Header
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 6),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'PAIEMENT SÉCURISÉ ALGÉRIE',
                      style: TextStyle(
                        fontFamily: 'monospace',
                        fontSize: 11,
                        fontWeight: FontWeight.bold,
                        color: const Color(0xFFD4AF37),
                        letterSpacing: 1.0,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      'Abonnement Atelier Pro · 35 000 DZD',
                      style: TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.bold,
                        color: textColor,
                      ),
                    ),
                  ],
                ),
                IconButton(
                  icon: const Icon(Icons.close_rounded, size: 20),
                  onPressed: () => Navigator.pop(context),
                ),
              ],
            ),
          ),

          const Divider(height: 1),

          // Method Selector Pills
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            child: Row(
              children: [
                _buildMethodPill(0, 'BaridiMob', Icons.send_to_mobile_rounded, const Color(0xFF10B981)),
                const SizedBox(width: 8),
                _buildMethodPill(1, 'Edahabia/CIB', Icons.credit_card_rounded, const Color(0xFFD4AF37)),
                const SizedBox(width: 8),
                _buildMethodPill(2, 'CCP Mandat', Icons.account_balance_rounded, const Color(0xFF38BDF8)),
              ],
            ),
          ),

          // Method Body
          Expanded(
            child: SingleChildScrollView(
              padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 8),
              child: _isOtpStep
                  ? _buildOtpVerificationView(textColor, cardColor, borderColor)
                  : _buildActiveMethodView(textColor, cardColor, borderColor),
            ),
          ),

          // Action Button
          Padding(
            padding: const EdgeInsets.all(16),
            child: SizedBox(
              width: double.infinity,
              height: 48,
              child: ElevatedButton(
                onPressed: _isProcessing ? null : (_isOtpStep ? _completeSubscription : _simulatePayment),
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFFD4AF37),
                  foregroundColor: const Color(0xFF040B16),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  elevation: 2,
                ),
                child: _isProcessing
                    ? const SizedBox(
                        width: 20,
                        height: 20,
                        child: CircularProgressIndicator(strokeWidth: 2, color: Colors.black),
                      )
                    : Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(
                            _isOtpStep ? Icons.verified_user_rounded : Icons.lock_outline_rounded,
                            size: 18,
                          ),
                          const SizedBox(width: 8),
                          Text(
                            _isOtpStep ? 'CONFIRMER LE CODE OTP' : 'SIMULER LE RÈGLEMENT (35 000 DZD)',
                            style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12),
                          ),
                        ],
                      ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildMethodPill(int index, String label, IconData icon, Color accent) {
    final isSelected = _activeMethod == index;
    return Expanded(
      child: GestureDetector(
        onTap: () {
          HapticFeedback.selectionClick();
          setState(() {
            _activeMethod = index;
            _isOtpStep = false;
          });
        },
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 180),
          padding: const EdgeInsets.symmetric(vertical: 8),
          decoration: BoxDecoration(
            color: isSelected ? accent.withValues(alpha: 0.18) : Colors.transparent,
            borderRadius: BorderRadius.circular(10),
            border: Border.all(
              color: isSelected ? accent : const Color(0xFF334155),
              width: isSelected ? 1.5 : 1,
            ),
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(icon, size: 16, color: isSelected ? accent : const Color(0xFF94A3B8)),
              const SizedBox(height: 3),
              Text(
                label,
                style: TextStyle(
                  fontSize: 10,
                  fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                  color: isSelected ? Colors.white : const Color(0xFF94A3B8),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildActiveMethodView(Color textColor, Color cardColor, Color borderColor) {
    if (_activeMethod == 0) {
      // BARIDIMOB
      return Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: cardColor,
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: borderColor),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    const Icon(Icons.qr_code_rounded, color: Color(0xFF10B981), size: 24),
                    const SizedBox(width: 10),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text('Virement BaridiMob Instantané', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: Colors.white)),
                          Text('Sans déplacement · Confirmation par SMS', style: TextStyle(fontSize: 11, color: Colors.grey.shade400)),
                        ],
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 14),
                const Text('RIP DESTINATAIRE (SARL BAITI)', style: TextStyle(fontSize: 10, fontFamily: 'monospace', color: Color(0xFF94A3B8))),
                const SizedBox(height: 4),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                  decoration: BoxDecoration(
                    color: const Color(0xFF071224),
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: const Color(0xFF1E293B)),
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        _baridimobRip,
                        style: const TextStyle(
                          fontFamily: 'monospace',
                          fontSize: 13,
                          fontWeight: FontWeight.bold,
                          color: Color(0xFF10B981),
                        ),
                      ),
                      GestureDetector(
                        onTap: () {
                          Clipboard.setData(ClipboardData(text: _baridimobRip));
                          ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(content: Text('RIP copié dans le presse-papier !'), duration: Duration(seconds: 1)),
                          );
                        },
                        child: const Icon(Icons.copy_rounded, size: 16, color: Color(0xFF10B981)),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 12),
          Text(
            'En cliquant sur Simuler, un ordre de virement BaridiMob test de 35 000 DZD sera généré avec vérification OTP simulée.',
            style: TextStyle(fontSize: 11, color: Colors.grey.shade400),
          ),
        ],
      );
    } else if (_activeMethod == 1) {
      // EDAHABIA / CIB
      return Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                colors: [Color(0xFF1A365D), Color(0xFF0F172A)],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: const Color(0xFFD4AF37).withValues(alpha: 0.3)),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text('SATIM 3D-SECURE', style: TextStyle(fontFamily: 'monospace', fontSize: 10, color: Color(0xFFD4AF37), fontWeight: FontWeight.bold)),
                    Icon(Icons.contactless_rounded, color: Colors.white70, size: 20),
                  ],
                ),
                const SizedBox(height: 16),
                TextField(
                  controller: _cardNumberController,
                  style: const TextStyle(fontFamily: 'monospace', fontSize: 14, fontWeight: FontWeight.bold, color: Colors.white),
                  decoration: const InputDecoration(
                    labelText: 'Numéro de Carte (Edahabia / CIB)',
                    labelStyle: TextStyle(fontSize: 10, color: Color(0xFF94A3B8)),
                    isDense: true,
                    border: InputBorder.none,
                  ),
                ),
                const SizedBox(height: 10),
                Row(
                  children: [
                    Expanded(
                      child: TextField(
                        controller: _cardExpiryController,
                        style: const TextStyle(fontFamily: 'monospace', fontSize: 12, color: Colors.white),
                        decoration: const InputDecoration(
                          labelText: 'Expiration (MM/AA)',
                          labelStyle: TextStyle(fontSize: 9, color: Color(0xFF94A3B8)),
                          isDense: true,
                          border: InputBorder.none,
                        ),
                      ),
                    ),
                    Expanded(
                      child: TextField(
                        controller: _cardCvvController,
                        style: const TextStyle(fontFamily: 'monospace', fontSize: 12, color: Colors.white),
                        decoration: const InputDecoration(
                          labelText: 'CVV2 / CVC',
                          labelStyle: TextStyle(fontSize: 9, color: Color(0xFF94A3B8)),
                          isDense: true,
                          border: InputBorder.none,
                        ),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
          const SizedBox(height: 12),
          Text(
            'Passerelle bancaire nationale SATIM certifiée. Test de débit immédiat de 35 000 DZD avec simulation de clé SMS.',
            style: TextStyle(fontSize: 11, color: Colors.grey.shade400),
          ),
        ],
      );
    } else {
      // CCP MANDAT
      return Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: cardColor,
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: borderColor),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    const Icon(Icons.receipt_long_rounded, color: Color(0xFF38BDF8), size: 24),
                    const SizedBox(width: 10),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text('Versement Bureau de Poste CCP', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: Colors.white)),
                          Text('Bordereau Algérie Poste', style: TextStyle(fontSize: 11, color: Colors.grey.shade400)),
                        ],
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 14),
                const Text('COMPTE CCP BÉNÉFICIAIRE', style: TextStyle(fontSize: 10, fontFamily: 'monospace', color: Color(0xFF94A3B8))),
                const SizedBox(height: 4),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                  decoration: BoxDecoration(
                    color: const Color(0xFF071224),
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: const Color(0xFF1E293B)),
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        _ccpAccount,
                        style: const TextStyle(
                          fontFamily: 'monospace',
                          fontSize: 13,
                          fontWeight: FontWeight.bold,
                          color: Color(0xFF38BDF8),
                        ),
                      ),
                      GestureDetector(
                        onTap: () {
                          Clipboard.setData(ClipboardData(text: _ccpAccount));
                          ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(content: Text('Compte CCP copié !'), duration: Duration(seconds: 1)),
                          );
                        },
                        child: const Icon(Icons.copy_rounded, size: 16, color: Color(0xFF38BDF8)),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 10),
                TextField(
                  controller: _ccpSlipController,
                  style: const TextStyle(fontFamily: 'monospace', fontSize: 12, color: Colors.white),
                  decoration: const InputDecoration(
                    labelText: 'Numéro de Reçu / Bordereau de Versement',
                    labelStyle: TextStyle(fontSize: 10, color: Color(0xFF94A3B8)),
                    isDense: true,
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 12),
          Text(
            'La validation du versement active automatiquement la clé d\'activation annuelle pour votre atelier.',
            style: TextStyle(fontSize: 11, color: Colors.grey.shade400),
          ),
        ],
      );
    }
  }

  Widget _buildOtpVerificationView(Color textColor, Color cardColor, Color borderColor) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.center,
      children: [
        const SizedBox(height: 10),
        Container(
          width: 50,
          height: 50,
          decoration: BoxDecoration(
            color: const Color(0xFF10B981).withValues(alpha: 0.15),
            shape: BoxShape.circle,
            border: Border.all(color: const Color(0xFF10B981)),
          ),
          child: const Icon(Icons.sms_rounded, color: Color(0xFF10B981), size: 24),
        ),
        const SizedBox(height: 14),
        const Text(
          'VÉRIFICATION SMS 3D-SECURE',
          style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Color(0xFFD4AF37), fontFamily: 'monospace'),
        ),
        const SizedBox(height: 4),
        Text(
          'Un code de sécurité test a été généré pour valider le débit de 35 000 DZD :',
          textAlign: TextAlign.center,
          style: TextStyle(fontSize: 11, color: Colors.grey.shade400),
        ),
        const SizedBox(height: 16),
        Container(
          width: 200,
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
          decoration: BoxDecoration(
            color: const Color(0xFF0F1D33),
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: const Color(0xFFD4AF37)),
          ),
          child: TextField(
            controller: _otpController,
            textAlign: TextAlign.center,
            style: const TextStyle(
              fontSize: 20,
              fontWeight: FontWeight.bold,
              letterSpacing: 6,
              color: Colors.white,
              fontFamily: 'monospace',
            ),
            decoration: const InputDecoration(
              isDense: true,
              border: InputBorder.none,
            ),
          ),
        ),
        const SizedBox(height: 12),
        const Text(
          'Code pré-rempli pour la simulation : 482910',
          style: TextStyle(fontSize: 10, color: Color(0xFF10B981), fontFamily: 'monospace'),
        ),
      ],
    );
  }
}
