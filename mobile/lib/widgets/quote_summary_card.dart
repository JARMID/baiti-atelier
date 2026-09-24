import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:url_launcher/url_launcher.dart';
import '../models/opening_spec.dart';
import '../services/app_settings.dart';
import 'devis_preview_sheet.dart';

class QuoteSummaryCard extends StatelessWidget {
  final OpeningSpec spec;
  final VoidCallback onSaveLocally;

  const QuoteSummaryCard({
    super.key,
    required this.spec,
    required this.onSaveLocally,
  });

  String _formatDzd(double amount) {
    final formatter = NumberFormat('#,###', 'fr_FR');
    return '${formatter.format(amount.round())} DZD';
  }

  Future<void> _dispatchWhatsApp(BuildContext context) async {
    final cost = spec.calculateCost();
    final tradeLabel = spec.tradeType == 'woodworking'
        ? 'MENUISERIE BOIS'
        : spec.tradeType == 'metalwork'
            ? 'FERRONNERIE & MÉTAL'
            : spec.tradeType == 'tapestry'
                ? 'TAPISSERIE & RIDEAUX'
                : 'ALUMINIUM & PVC';

    final message = '''
*DEVIS ESTIMATIF $tradeLabel - BAITI ATELIER | بيتي*
Wilaya: ${spec.clientWilaya}
Ouvrage: ${spec.title} (${spec.quantity} unité(s))

*Spécifications Techniques :*
• Type: ${spec.openingType}
• Cotes: ${spec.widthMm.toInt()} mm (L) x ${spec.heightMm.toInt()} mm (H)
• Matériau / Système: ${spec.profileSystem}
• Finition: ${spec.finishColor}

*Détail du Chiffrage Atelier :*
• Matériau principal: ${_formatDzd(cost['primaryMaterial'] ?? 0.0)}
• Compléments & finitions: ${_formatDzd(cost['secondaryMaterial'] ?? 0.0)}
• Accessoires & quincaillerie: ${_formatDzd(cost['hardware'] ?? 0.0)}
• Main d'œuvre façonnage: ${_formatDzd(cost['labor'] ?? 0.0)}

*TOTAL ESTIMÉ: ${_formatDzd(cost['grandTotal']!)}*
_Généré via Baiti Atelier Mobile_
''';

    final uri = Uri.parse('https://wa.me/213550123456?text=${Uri.encodeComponent(message)}');
    try {
      if (await canLaunchUrl(uri)) {
        await launchUrl(uri, mode: LaunchMode.externalApplication);
      } else {
        if (context.mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Impossible d\'ouvrir WhatsApp')),
          );
        }
      }
    } catch (e) {
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Erreur WhatsApp: $e')),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final settings = AppSettings.instance;
    final cost = spec.calculateCost();

    return Card(
      elevation: 0,
      color: settings.cardBackground,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
        side: BorderSide(color: settings.cardBorder, width: 1.2),
      ),
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Expanded(
                  child: Row(
                    children: [
                      Container(
                        width: 8,
                        height: 8,
                        decoration: const BoxDecoration(
                          color: Color(0xFFD4AF37),
                          shape: BoxShape.circle,
                        ),
                      ),
                      const SizedBox(width: 8),
                      Flexible(
                        child: Text(
                          settings.tr('quote_detailed_title').toUpperCase(),
                          style: TextStyle(
                            fontFamily: 'monospace',
                            fontSize: 10.5,
                            fontWeight: FontWeight.bold,
                            color: settings.secondaryText,
                            letterSpacing: 0.8,
                          ),
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(width: 8),
                Text(
                  '${spec.quantity} ${settings.tr('quote_units')}',
                  style: TextStyle(
                    fontSize: 12,
                    color: settings.secondaryText,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 14),

            // Cost lines
            _buildCostRow(settings.tr('cost_primary'), cost['primaryMaterial'] ?? 0.0, settings),
            if ((cost['secondaryMaterial'] ?? 0.0) > 0)
              _buildCostRow(settings.tr('cost_secondary'), cost['secondaryMaterial']!, settings),
            if ((cost['hardware'] ?? 0.0) > 0)
              _buildCostRow(settings.tr('cost_hardware'), cost['hardware']!, settings),
            if ((cost['finishing'] ?? 0.0) > 0)
              _buildCostRow(settings.tr('cost_finishing'), cost['finishing']!, settings),
            _buildCostRow(settings.tr('cost_labor'), cost['labor'] ?? 0.0, settings),

            Divider(color: settings.dividerColor, height: 24),

            // Grand Total
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      settings.tr('cost_total_ht').toUpperCase(),
                      style: TextStyle(
                        fontFamily: 'monospace',
                        fontSize: 10,
                        color: settings.secondaryText,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    Text(
                      settings.tr('quote_sub_algeria'),
                      style: TextStyle(fontSize: 11, color: settings.secondaryText),
                    ),
                  ],
                ),
                const SizedBox(width: 8),
                Flexible(
                  child: FittedBox(
                    fit: BoxFit.scaleDown,
                    alignment: Alignment.centerRight,
                    child: Text(
                      _formatDzd(cost['grandTotal']!),
                      style: const TextStyle(
                        fontSize: 22,
                        fontWeight: FontWeight.w900,
                        color: Color(0xFFD4AF37),
                        letterSpacing: -0.5,
                      ),
                    ),
                  ),
                ),
              ],
            ),

            const SizedBox(height: 16),

            // Action Buttons
            Row(
              children: [
                Expanded(
                  child: ElevatedButton.icon(
                    onPressed: () => _dispatchWhatsApp(context),
                    icon: const Icon(Icons.send_rounded, size: 16, color: Colors.white),
                    label: FittedBox(
                      fit: BoxFit.scaleDown,
                      child: Text(
                        settings.tr('quote_send_whatsapp'),
                        style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: Colors.white),
                      ),
                    ),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF059669),
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 8),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 8),
                IconButton.filledTonal(
                  onPressed: () => DevisPreviewSheet.show(
                    context,
                    spec.projectName.isNotEmpty ? spec.projectName : spec.title,
                    [spec],
                  ),
                  icon: const Icon(Icons.receipt_long_rounded, size: 19),
                  style: IconButton.styleFrom(
                    backgroundColor: settings.chipBackground,
                    foregroundColor: const Color(0xFFD4AF37),
                    padding: const EdgeInsets.all(10),
                    minimumSize: const Size(40, 40),
                  ),
                  tooltip: settings.tr('quote_tooltip_proforma'),
                ),
                const SizedBox(width: 6),
                IconButton.filledTonal(
                  onPressed: onSaveLocally,
                  icon: const Icon(Icons.bookmark_border_rounded, size: 19),
                  style: IconButton.styleFrom(
                    backgroundColor: settings.chipBackground,
                    foregroundColor: settings.primaryText,
                    padding: const EdgeInsets.all(10),
                    minimumSize: const Size(40, 40),
                  ),
                  tooltip: settings.tr('quote_tooltip_save'),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildCostRow(String label, double amount, AppSettings settings) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 3.5),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Expanded(
            child: Text(
              label,
              style: TextStyle(fontSize: 13, color: settings.secondaryText),
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
            ),
          ),
          const SizedBox(width: 8),
          Text(
            _formatDzd(amount),
            style: TextStyle(
              fontFamily: 'monospace',
              fontSize: 13,
              color: settings.primaryText,
              fontWeight: FontWeight.w500,
            ),
          ),
        ],
      ),
    );
  }
}
