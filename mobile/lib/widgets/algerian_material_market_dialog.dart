import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../models/material_market.dart';
import '../utils/algerian_financials.dart';

class AlgerianMaterialMarketDialog extends StatefulWidget {
  final VoidCallback? onCalibrationSaved;

  const AlgerianMaterialMarketDialog({
    super.key,
    this.onCalibrationSaved,
  });

  static Future<void> show(
    BuildContext context, {
    VoidCallback? onCalibrationSaved,
  }) {
    return showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => Padding(
        padding: EdgeInsets.only(bottom: MediaQuery.of(ctx).viewInsets.bottom),
        child: AlgerianMaterialMarketDialog(
          onCalibrationSaved: onCalibrationSaved,
        ),
      ),
    );
  }

  @override
  State<AlgerianMaterialMarketDialog> createState() => _AlgerianMaterialMarketDialogState();
}

class _AlgerianMaterialMarketDialogState extends State<AlgerianMaterialMarketDialog> {
  int _activeTab = 0; // 0: Argus des Cours, 1: Calibrateur Atelier
  MaterialCategory _selectedCategory = MaterialCategory.all;
  final TextEditingController _searchController = TextEditingController();
  String _searchQuery = '';

  WorkshopMarginCalibration _calibration = kDefaultWorkshopCalibration;
  bool _isLoadingCalibration = true;
  bool _isSaved = false;

  @override
  void initState() {
    super.initState();
    _loadCalibration();
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  Future<void> _loadCalibration() async {
    final loaded = await MaterialMarketStorage.loadCalibration();
    if (mounted) {
      setState(() {
        _calibration = loaded;
        _isLoadingCalibration = false;
      });
    }
  }

  Future<void> _saveCalibration() async {
    setState(() => _isSaved = true);
    await MaterialMarketStorage.saveCalibration(_calibration);
    widget.onCalibrationSaved?.call();
    await Future.delayed(const Duration(milliseconds: 900));
    if (mounted) {
      setState(() => _isSaved = false);
    }
  }

  void _applyPreset(String preset) {
    HapticFeedback.lightImpact();
    setState(() {
      if (preset == 'wholesale') {
        _calibration = _calibration.copyWith(
          aluminumPriceMultiplier: 0.94,
          glassPriceMultiplier: 0.95,
          woodPriceMultiplier: 0.93,
          metalPriceMultiplier: 0.95,
          workshopTargetMarginPercent: 20.0,
          artisanHourlyRateDzd: 1800.0,
          lastCalibratedAt: DateTime.now(),
        );
      } else if (preset == 'standard') {
        _calibration = _calibration.copyWith(
          aluminumPriceMultiplier: 1.0,
          glassPriceMultiplier: 1.0,
          woodPriceMultiplier: 1.0,
          metalPriceMultiplier: 1.0,
          workshopTargetMarginPercent: 22.0,
          artisanHourlyRateDzd: 1800.0,
          lastCalibratedAt: DateTime.now(),
        );
      } else if (preset == 'south') {
        _calibration = _calibration.copyWith(
          aluminumPriceMultiplier: 1.12,
          glassPriceMultiplier: 1.15,
          woodPriceMultiplier: 1.10,
          metalPriceMultiplier: 1.12,
          workshopTargetMarginPercent: 26.0,
          artisanHourlyRateDzd: 2200.0,
          lastCalibratedAt: DateTime.now(),
        );
      }
    });
  }

  List<MaterialSpotItem> get _filteredItems {
    return kAlgerianMaterialSpotData.where((item) {
      final matchesCategory = _selectedCategory == MaterialCategory.all || item.category == _selectedCategory;
      if (!matchesCategory) return false;
      if (_searchQuery.isEmpty) return true;
      final query = _searchQuery.toLowerCase();
      return item.nameFr.toLowerCase().contains(query) ||
          item.nameAr.contains(query) ||
          item.supplier.toLowerCase().contains(query);
    }).toList();
  }

  double _calculateSampleEstimate() {
    // Standard window 1200x1200mm estimate
    final baseProfileCost = 12500.0 * _calibration.aluminumPriceMultiplier;
    final baseGlassCost = 8350.0 * _calibration.glassPriceMultiplier;
    final laborCost = 3.5 * _calibration.artisanHourlyRateDzd;
    final hardwareCost = 2800.0;
    final subtotal = baseProfileCost + baseGlassCost + laborCost + hardwareCost;
    final margin = subtotal * (_calibration.workshopTargetMarginPercent / 100.0);
    return subtotal + margin;
  }

  void _shareViaWhatsApp() {
    HapticFeedback.mediumImpact();
    final sampleTotal = _calculateSampleEstimate();
    final buffer = StringBuffer();
    buffer.writeln('*BAITI ATELIER : GRILLE CALIBRÉE ATELIER*');
    buffer.writeln('Atelier : Atelier Aluminium Kouba');
    buffer.writeln('Artisan Responsable : Mourad Hadj-Ali');
    buffer.writeln('Téléphone Atelier : 0797780838');
    buffer.writeln('RIP BaridiMob : ${formatBaridiMobRip('00799999002145897442')}');
    buffer.writeln('');
    buffer.writeln('*PARAMÈTRES D\'ATELIER ACTIFS :*');
    buffer.writeln('• Multiplicateur Aluminium : ×${_calibration.aluminumPriceMultiplier.toStringAsFixed(2)}');
    buffer.writeln('• Multiplicateur Vitrage : ×${_calibration.glassPriceMultiplier.toStringAsFixed(2)}');
    buffer.writeln('• Marge Cible Atelier : ${_calibration.workshopTargetMarginPercent.toStringAsFixed(0)}%');
    buffer.writeln('• Taux Horaire Main d\'Œuvre : ${_calibration.artisanHourlyRateDzd.toStringAsFixed(0)} DZD/h');
    buffer.writeln('• Exemple Fenêtre 1200×1200 mm : ${formatDzdCurrency(sampleTotal)} HT');
    buffer.writeln('  ${amountInDzdWordsFr(sampleTotal)}');
    buffer.writeln('  ${amountInDzdWordsAr(sampleTotal)}');

    Clipboard.setData(ClipboardData(text: buffer.toString()));
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Grille tarifaire copiée pour WhatsApp'),
        backgroundColor: Color(0xFF10B981),
        duration: Duration(seconds: 2),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    const dialogBg = Color(0xFF0F1B2D);
    const borderColor = Color(0xFF1E293B);
    const goldColor = Color(0xFFD4AF37);

    return Container(
      constraints: BoxConstraints(
        maxHeight: MediaQuery.of(context).size.height * 0.90,
      ),
      decoration: BoxDecoration(
        color: dialogBg,
        borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
        border: Border.all(color: const Color(0xFF334155), width: 1.2),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          // Drag handle
          Center(
            child: Container(
              margin: const EdgeInsets.only(top: 10, bottom: 8),
              width: 44,
              height: 4,
              decoration: BoxDecoration(
                color: const Color(0xFF475569),
                borderRadius: BorderRadius.circular(2),
              ),
            ),
          ),

          // Header with responsive layout
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
            child: Row(
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'ARGUS DES COURS & CALIBRATEUR DZD',
                        style: TextStyle(
                          fontFamily: 'monospace',
                          fontSize: 10.5,
                          fontWeight: FontWeight.bold,
                          color: goldColor,
                          letterSpacing: 0.8,
                        ),
                      ),
                      const SizedBox(height: 2),
                      const Text(
                        'Bourse des Matières Premières Algérie',
                        style: TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.bold,
                          color: Colors.white,
                        ),
                      ),
                      const SizedBox(height: 1),
                      Text(
                        'Cotations industrielles 58 wilayas',
                        style: TextStyle(
                          fontSize: 9.5,
                          color: Colors.white.withValues(alpha: 0.6),
                        ),
                      ),
                    ],
                  ),
                ),
                IconButton(
                  icon: const Icon(Icons.close_rounded, size: 20, color: Colors.white70),
                  onPressed: () => Navigator.of(context).pop(),
                  padding: EdgeInsets.zero,
                  constraints: const BoxConstraints(),
                ),
              ],
            ),
          ),

          const SizedBox(height: 8),

          // Tab Selector Bar
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: Container(
              padding: const EdgeInsets.all(3),
              decoration: BoxDecoration(
                color: const Color(0xFF070F1E),
                borderRadius: BorderRadius.circular(10),
                border: Border.all(color: borderColor),
              ),
              child: Row(
                children: [
                  Expanded(
                    child: _buildTabButton(
                      title: 'ARGUS BOURSE',
                      icon: Icons.trending_up_rounded,
                      isActive: _activeTab == 0,
                      onTap: () => setState(() => _activeTab = 0),
                    ),
                  ),
                  const SizedBox(width: 4),
                  Expanded(
                    child: _buildTabButton(
                      title: 'CALIBRATEUR ATELIER',
                      icon: Icons.tune_rounded,
                      isActive: _activeTab == 1,
                      onTap: () => setState(() => _activeTab = 1),
                    ),
                  ),
                ],
              ),
            ),
          ),

          const SizedBox(height: 8),

          // Main Tab Body
          Expanded(
            child: _isLoadingCalibration
                ? const Center(child: CircularProgressIndicator(color: goldColor))
                : _activeTab == 0
                    ? _buildArgusBourseTab()
                    : _buildCalibratorTab(),
          ),
        ],
      ),
    );
  }

  Widget _buildTabButton({
    required String title,
    required IconData icon,
    required bool isActive,
    required VoidCallback onTap,
  }) {
    return GestureDetector(
      onTap: () {
        HapticFeedback.selectionClick();
        onTap();
      },
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 8),
        decoration: BoxDecoration(
          color: isActive ? const Color(0xFFD4AF37) : Colors.transparent,
          borderRadius: BorderRadius.circular(7),
        ),
        child: FittedBox(
          fit: BoxFit.scaleDown,
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(
                icon,
                size: 14,
                color: isActive ? const Color(0xFF040B16) : const Color(0xFF94A3B8),
              ),
              const SizedBox(width: 6),
              Text(
                title,
                style: TextStyle(
                  fontSize: 10.5,
                  fontWeight: FontWeight.bold,
                  color: isActive ? const Color(0xFF040B16) : const Color(0xFF94A3B8),
                  letterSpacing: 0.5,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  // TAB 1: ARGUS DES COURS
  Widget _buildArgusBourseTab() {
    final items = _filteredItems;

    return Column(
      children: [
        // Category Filters
        SizedBox(
          height: 38,
          child: ListView(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.symmetric(horizontal: 16),
            children: [
              _buildCategoryChip('Tous', MaterialCategory.all),
              _buildCategoryChip('Aluminium', MaterialCategory.aluminum),
              _buildCategoryChip('Vitrage', MaterialCategory.glass),
              _buildCategoryChip('Acier / Métal', MaterialCategory.metal),
              _buildCategoryChip('Bois', MaterialCategory.wood),
              _buildCategoryChip('Quincaillerie', MaterialCategory.hardware),
            ],
          ),
        ),

        const SizedBox(height: 6),

        // Search Input
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16),
          child: Container(
            height: 38,
            decoration: BoxDecoration(
              color: const Color(0xFF070F1E),
              borderRadius: BorderRadius.circular(8),
              border: Border.all(color: const Color(0xFF1E293B)),
            ),
            child: TextField(
              controller: _searchController,
              onChanged: (val) => setState(() => _searchQuery = val),
              style: const TextStyle(fontSize: 11.5, color: Colors.white),
              decoration: InputDecoration(
                isDense: true,
                hintText: 'Rechercher un profilé, verre ou fournisseur...',
                hintStyle: TextStyle(fontSize: 11, color: Colors.white.withValues(alpha: 0.4)),
                prefixIcon: const Icon(Icons.search_rounded, size: 16, color: Color(0xFFD4AF37)),
                suffixIcon: _searchQuery.isNotEmpty
                    ? IconButton(
                        icon: const Icon(Icons.clear_rounded, size: 14, color: Colors.white54),
                        onPressed: () {
                          _searchController.clear();
                          setState(() => _searchQuery = '');
                        },
                      )
                    : null,
                border: InputBorder.none,
                contentPadding: const EdgeInsets.symmetric(vertical: 9),
              ),
            ),
          ),
        ),

        const SizedBox(height: 6),

        // Spot Items List
        Expanded(
          child: items.isEmpty
              ? Center(
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(Icons.inventory_2_outlined, size: 36, color: Colors.white.withValues(alpha: 0.3)),
                      const SizedBox(height: 6),
                      Text(
                        'Aucun matériau trouvé pour cette recherche',
                        style: TextStyle(fontSize: 11, color: Colors.white.withValues(alpha: 0.5)),
                      ),
                    ],
                  ),
                )
              : ListView.builder(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
                  itemCount: items.length,
                  itemBuilder: (ctx, i) => _buildSpotItemCard(items[i]),
                ),
        ),
      ],
    );
  }

  Widget _buildCategoryChip(String label, MaterialCategory category) {
    final isSelected = _selectedCategory == category;
    return GestureDetector(
      onTap: () {
        HapticFeedback.selectionClick();
        setState(() => _selectedCategory = category);
      },
      child: Container(
        margin: const EdgeInsets.only(right: 6),
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
        decoration: BoxDecoration(
          color: isSelected ? const Color(0xFFD4AF37).withValues(alpha: 0.2) : const Color(0xFF070F1E),
          borderRadius: BorderRadius.circular(20),
          border: Border.all(
            color: isSelected ? const Color(0xFFD4AF37) : const Color(0xFF1E293B),
            width: isSelected ? 1.2 : 0.8,
          ),
        ),
        alignment: Alignment.center,
        child: Text(
          label,
          style: TextStyle(
            fontSize: 10.5,
            fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
            color: isSelected ? const Color(0xFFD4AF37) : const Color(0xFF94A3B8),
          ),
        ),
      ),
    );
  }

  Widget _buildSpotItemCard(MaterialSpotItem item) {
    final isUp = item.trend == MarketTrend.up;
    final isDown = item.trend == MarketTrend.down;

    final trendColor = isUp
        ? const Color(0xFF10B981)
        : isDown
            ? const Color(0xFFEF4444)
            : const Color(0xFF94A3B8);

    final trendIcon = isUp
        ? Icons.trending_up_rounded
        : isDown
            ? Icons.trending_down_rounded
            : Icons.trending_flat_rounded;

    final sign = isUp ? '+' : '';

    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: const Color(0xFF070F1E),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: const Color(0xFF1E293B)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      item.nameFr,
                      style: const TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.bold,
                        color: Colors.white,
                      ),
                    ),
                    const SizedBox(height: 1),
                    Text(
                      item.nameAr,
                      style: const TextStyle(
                        fontSize: 10.5,
                        color: Color(0xFFD4AF37),
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 8),
              Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  FittedBox(
                    fit: BoxFit.scaleDown,
                    child: Text(
                      formatDzdCurrency(item.currentPriceDzd),
                      style: const TextStyle(
                        fontFamily: 'monospace',
                        fontSize: 13,
                        fontWeight: FontWeight.bold,
                        color: Color(0xFF10B981),
                      ),
                    ),
                  ),
                  Text(
                    item.unit,
                    style: TextStyle(
                      fontSize: 9.5,
                      color: Colors.white.withValues(alpha: 0.6),
                    ),
                  ),
                ],
              ),
            ],
          ),

          const SizedBox(height: 6),

          // Supplier and Variation Row
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Expanded(
                child: Row(
                  children: [
                    const Icon(Icons.business_rounded, size: 12, color: Color(0xFF94A3B8)),
                    const SizedBox(width: 4),
                    Expanded(
                      child: Text(
                        item.supplier,
                        style: const TextStyle(fontSize: 10, color: Color(0xFF94A3B8)),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 6),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                decoration: BoxDecoration(
                  color: trendColor.withValues(alpha: 0.15),
                  borderRadius: BorderRadius.circular(4),
                  border: Border.all(color: trendColor.withValues(alpha: 0.4), width: 0.8),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(trendIcon, size: 12, color: trendColor),
                    const SizedBox(width: 3),
                    Text(
                      '$sign${item.changePercent.toStringAsFixed(1)}%',
                      style: TextStyle(
                        fontSize: 9.5,
                        fontWeight: FontWeight.bold,
                        color: trendColor,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),

          const SizedBox(height: 6),

          // Standard Length or Size Specs
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
            decoration: BoxDecoration(
              color: const Color(0xFF0F1B2D),
              borderRadius: BorderRadius.circular(6),
            ),
            child: Row(
              children: [
                const Icon(Icons.straighten_rounded, size: 11, color: Color(0xFFD4AF37)),
                const SizedBox(width: 6),
                Expanded(
                  child: Text(
                    item.standardLengthOrSize,
                    style: const TextStyle(fontSize: 9.5, color: Color(0xFFCBD5E1), fontFamily: 'monospace'),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  // TAB 2: CALIBRATEUR ATELIER
  Widget _buildCalibratorTab() {
    final sampleTotal = _calculateSampleEstimate();

    return SingleChildScrollView(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Presets Card
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: const Color(0xFF070F1E),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: const Color(0xFF1E293B)),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'PRÉRÉGLAGES RÉGIONAUX & CONDITIONS ATELIER',
                  style: TextStyle(
                    fontFamily: 'monospace',
                    fontSize: 10,
                    fontWeight: FontWeight.bold,
                    color: Color(0xFFD4AF37),
                    letterSpacing: 0.5,
                  ),
                ),
                const SizedBox(height: 8),
                Row(
                  children: [
                    Expanded(
                      child: _buildPresetButton(
                        label: 'Gros (-6%)',
                        icon: Icons.inventory_rounded,
                        onTap: () => _applyPreset('wholesale'),
                      ),
                    ),
                    const SizedBox(width: 6),
                    Expanded(
                      child: _buildPresetButton(
                        label: 'Standard',
                        icon: Icons.check_circle_outline_rounded,
                        onTap: () => _applyPreset('standard'),
                      ),
                    ),
                    const SizedBox(width: 6),
                    Expanded(
                      child: _buildPresetButton(
                        label: 'Sud (+15%)',
                        icon: Icons.local_shipping_rounded,
                        onTap: () => _applyPreset('south'),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),

          const SizedBox(height: 12),

          // Sliders Configuration
          _buildSliderCard(
            title: 'Multiplicateur Profilés Aluminium',
            subtitle: 'Ajustement cours TPR, Profilor, Sidal',
            value: _calibration.aluminumPriceMultiplier,
            min: 0.85,
            max: 1.30,
            displayValue: '×${_calibration.aluminumPriceMultiplier.toStringAsFixed(2)}',
            onChanged: (val) => setState(() {
              _calibration = _calibration.copyWith(aluminumPriceMultiplier: val);
            }),
          ),

          const SizedBox(height: 8),

          _buildSliderCard(
            title: 'Multiplicateur Vitrage & Miroiterie',
            subtitle: 'Ajustement verre simple, double vitrage MFG Cevital',
            value: _calibration.glassPriceMultiplier,
            min: 0.85,
            max: 1.30,
            displayValue: '×${_calibration.glassPriceMultiplier.toStringAsFixed(2)}',
            onChanged: (val) => setState(() {
              _calibration = _calibration.copyWith(glassPriceMultiplier: val);
            }),
          ),

          const SizedBox(height: 8),

          _buildSliderCard(
            title: 'Marge Cible Atelier',
            subtitle: 'Bénéfice net artisan après charges',
            value: _calibration.workshopTargetMarginPercent,
            min: 15.0,
            max: 40.0,
            displayValue: '${_calibration.workshopTargetMarginPercent.toStringAsFixed(0)}%',
            onChanged: (val) => setState(() {
              _calibration = _calibration.copyWith(workshopTargetMarginPercent: val);
            }),
          ),

          const SizedBox(height: 8),

          _buildSliderCard(
            title: 'Taux Horaire Main d\'Œuvre',
            subtitle: 'Coût horaire fabrication et montage',
            value: _calibration.artisanHourlyRateDzd,
            min: 1200.0,
            max: 3500.0,
            displayValue: '${_calibration.artisanHourlyRateDzd.toStringAsFixed(0)} DZD/h',
            onChanged: (val) => setState(() {
              _calibration = _calibration.copyWith(artisanHourlyRateDzd: val);
            }),
          ),

          const SizedBox(height: 12),

          // Live Simulation Preview Card
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: const Color(0xFF070F1E),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: const Color(0xFFD4AF37).withValues(alpha: 0.5)),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Expanded(
                      child: FittedBox(
                        fit: BoxFit.scaleDown,
                        alignment: Alignment.centerLeft,
                        child: Text(
                          'SIMULATION DEVIS ATELIER TYPE',
                          style: TextStyle(
                            fontFamily: 'monospace',
                            fontSize: 10,
                            fontWeight: FontWeight.bold,
                            color: Color(0xFFD4AF37),
                            letterSpacing: 0.5,
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(width: 8),
                    Text(
                      'Fenêtre 2V 1200×1200 mm',
                      style: TextStyle(
                        fontSize: 9.5,
                        color: Colors.white.withValues(alpha: 0.6),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 6),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Expanded(
                      child: Text(
                        'Prix Estimé HT avec marge :',
                        style: TextStyle(fontSize: 11, color: Colors.white70),
                      ),
                    ),
                    const SizedBox(width: 8),
                    FittedBox(
                      fit: BoxFit.scaleDown,
                      child: Text(
                        formatDzdCurrency(sampleTotal),
                        style: const TextStyle(
                          fontFamily: 'monospace',
                          fontSize: 14,
                          fontWeight: FontWeight.bold,
                          color: Color(0xFF10B981),
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 3),
                Text(
                  amountInDzdWordsFr(sampleTotal),
                  style: const TextStyle(
                    fontSize: 9.5,
                    fontStyle: FontStyle.italic,
                    color: Color(0xFF94A3B8),
                  ),
                ),
                Text(
                  amountInDzdWordsAr(sampleTotal),
                  style: const TextStyle(
                    fontSize: 10,
                    fontWeight: FontWeight.bold,
                    color: Color(0xFFD4AF37),
                  ),
                ),
              ],
            ),
          ),

          const SizedBox(height: 12),

          // Action Buttons: Share WhatsApp + Save
          Row(
            children: [
              Expanded(
                child: SizedBox(
                  height: 42,
                  child: OutlinedButton.icon(
                    onPressed: _shareViaWhatsApp,
                    icon: const Icon(Icons.share_rounded, size: 16, color: Color(0xFF10B981)),
                    label: const FittedBox(
                      fit: BoxFit.scaleDown,
                      child: Text(
                        'PARTAGER WHATSAPP',
                        style: TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.bold,
                          color: Color(0xFF10B981),
                        ),
                      ),
                    ),
                    style: OutlinedButton.styleFrom(
                      side: const BorderSide(color: Color(0xFF10B981)),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: SizedBox(
                  height: 42,
                  child: ElevatedButton.icon(
                    onPressed: _saveCalibration,
                    icon: Icon(
                      _isSaved ? Icons.check_circle_rounded : Icons.save_rounded,
                      size: 16,
                    ),
                    label: FittedBox(
                      fit: BoxFit.scaleDown,
                      child: Text(
                        _isSaved ? 'ENREGISTRÉ' : 'ENREGISTRER',
                        style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold),
                      ),
                    ),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFFD4AF37),
                      foregroundColor: const Color(0xFF040B16),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                    ),
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
        ],
      ),
    );
  }

  Widget _buildPresetButton({
    required String label,
    required IconData icon,
    required VoidCallback onTap,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 4),
        decoration: BoxDecoration(
          color: const Color(0xFF0F1B2D),
          borderRadius: BorderRadius.circular(8),
          border: Border.all(color: const Color(0xFF1E293B)),
        ),
        child: Column(
          children: [
            Icon(icon, size: 14, color: const Color(0xFFD4AF37)),
            const SizedBox(height: 3),
            FittedBox(
              fit: BoxFit.scaleDown,
              child: Text(
                label,
                style: const TextStyle(
                  fontSize: 10,
                  fontWeight: FontWeight.bold,
                  color: Colors.white,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSliderCard({
    required String title,
    required String subtitle,
    required double value,
    required double min,
    required double max,
    required String displayValue,
    required ValueChanged<double> onChanged,
  }) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: const Color(0xFF070F1E),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: const Color(0xFF1E293B)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      title,
                      style: const TextStyle(fontSize: 11.5, fontWeight: FontWeight.bold, color: Colors.white),
                    ),
                    Text(
                      subtitle,
                      style: TextStyle(fontSize: 9.5, color: Colors.white.withValues(alpha: 0.5)),
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 8),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: const Color(0xFFD4AF37).withValues(alpha: 0.15),
                  borderRadius: BorderRadius.circular(6),
                  border: Border.all(color: const Color(0xFFD4AF37).withValues(alpha: 0.5), width: 0.8),
                ),
                child: Text(
                  displayValue,
                  style: const TextStyle(
                    fontFamily: 'monospace',
                    fontSize: 11,
                    fontWeight: FontWeight.bold,
                    color: Color(0xFFD4AF37),
                  ),
                ),
              ),
            ],
          ),
          SliderTheme(
            data: SliderThemeData(
              trackHeight: 3,
              activeTrackColor: const Color(0xFFD4AF37),
              inactiveTrackColor: const Color(0xFF1E293B),
              thumbColor: const Color(0xFFD4AF37),
              thumbShape: const RoundSliderThumbShape(enabledThumbRadius: 7),
              overlayShape: const RoundSliderOverlayShape(overlayRadius: 12),
              overlayColor: const Color(0xFFD4AF37).withValues(alpha: 0.2),
            ),
            child: Slider(
              value: value,
              min: min,
              max: max,
              onChanged: onChanged,
            ),
          ),
        ],
      ),
    );
  }
}
