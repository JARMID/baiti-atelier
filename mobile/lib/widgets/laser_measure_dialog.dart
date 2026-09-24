import 'dart:math' as math;
import 'package:flutter/material.dart';

class LaserMeasureDialog extends StatefulWidget {
  final double initialWidthMm;
  final double initialHeightMm;
  final Function(double widthMm, double heightMm) onApplyDimensions;

  const LaserMeasureDialog({
    super.key,
    required this.initialWidthMm,
    required this.initialHeightMm,
    required this.onApplyDimensions,
  });

  @override
  State<LaserMeasureDialog> createState() => _LaserMeasureDialogState();
}

class _LaserMeasureDialogState extends State<LaserMeasureDialog> {
  // Rough opening measurements (Tableau maçonnerie brut)
  late double _measuredWidth;
  late double _measuredHeight;
  int _masonryPlayIndex = 0; // 0: -10mm (Standard), 1: -15mm (Rénovation), 2: 0mm (Brut)
  
  // Interactive crosshair coordinates normalized in [0, 1]
  Offset _pointA = const Offset(0.20, 0.25);
  Offset _pointB = const Offset(0.80, 0.75);

  // Simulated digital spirit level / laser tilt in degrees
  double _tiltAngle = 0.1;
  bool _isCalibrated = true;

  void _recalibrateLevel() {
    setState(() {
      _tiltAngle = 0.0;
      _isCalibrated = true;
    });
  }

  @override
  void initState() {
    super.initState();
    _measuredWidth = widget.initialWidthMm;
    _measuredHeight = widget.initialHeightMm;
  }

  double get _clearanceMm {
    if (_masonryPlayIndex == 0) return 10.0;
    if (_masonryPlayIndex == 1) return 15.0;
    return 0.0;
  }

  double get _finalFabricationWidth => math.max(400.0, _measuredWidth - _clearanceMm);
  double get _finalFabricationHeight => math.max(400.0, _measuredHeight - _clearanceMm);

  // Diagonal calculation for squareness check (Pythagoras)
  double get _diagonal1 => math.sqrt(_measuredWidth * _measuredWidth + _measuredHeight * _measuredHeight);
  // Simulated slight deviation for diagonal 2 to show artisan diagonal validation
  double get _diagonal2 => _diagonal1 + (_measuredWidth > 1500 ? 3.0 : 1.5);
  double get _diagonalDiff => (_diagonal2 - _diagonal1).abs();

  void _updateDimensionsFromPoints(Size canvasSize) {
    if (canvasSize.width <= 0 || canvasSize.height <= 0) return;
    final pixelWidth = (_pointB.dx - _pointA.dx).abs() * canvasSize.width;
    final pixelHeight = (_pointB.dy - _pointA.dy).abs() * canvasSize.height;

    // Scale: 240px corresponds roughly to 1200mm (5mm per pixel scale)
    const scaleFactor = 5.0;
    setState(() {
      _measuredWidth = (pixelWidth * scaleFactor).clamp(400.0, 4000.0).roundToDouble();
      _measuredHeight = (pixelHeight * scaleFactor).clamp(400.0, 3200.0).roundToDouble();
    });
  }

  void _applyPreset(double widthMm, double heightMm) {
    setState(() {
      _measuredWidth = widthMm;
      _measuredHeight = heightMm;
      _pointA = const Offset(0.20, 0.25);
      _pointB = const Offset(0.80, 0.75);
    });
  }

  @override
  Widget build(BuildContext context) {
    return Dialog(
      backgroundColor: const Color(0xFF0F172A),
      insetPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 20),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
      child: Container(
        constraints: const BoxConstraints(maxWidth: 500, maxHeight: 720),
        child: Column(
          children: [
            // 1. Header Bar with Laser Status
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              decoration: const BoxDecoration(
                border: Border(bottom: BorderSide(color: Color(0xFF1E293B))),
              ),
              child: Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(6),
                    decoration: BoxDecoration(
                      color: const Color(0xFFEF4444).withValues(alpha: 0.15),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: const Icon(Icons.videocam_outlined, color: Color(0xFFEF4444), size: 18),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          'VISEUR LASER CHANTIER',
                          style: TextStyle(
                            fontFamily: 'monospace',
                            fontSize: 12,
                            fontWeight: FontWeight.bold,
                            color: Colors.white,
                            letterSpacing: 1.0,
                          ),
                        ),
                        Text(
                          'Mesure optique tableau & équerrage maçonnerie',
                          style: TextStyle(fontSize: 10, color: Colors.grey.shade400),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ],
                    ),
                  ),
                  // Level Indicator Bubble
                  GestureDetector(
                    onTap: _recalibrateLevel,
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(
                        color: _tiltAngle.abs() <= 0.3
                            ? const Color(0xFF10B981).withValues(alpha: 0.2)
                            : const Color(0xFFF59E0B).withValues(alpha: 0.2),
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(
                          color: _tiltAngle.abs() <= 0.3 ? const Color(0xFF10B981) : const Color(0xFFF59E0B),
                          width: 1,
                        ),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(
                            Icons.speed_rounded,
                            size: 13,
                            color: _tiltAngle.abs() <= 0.3 ? const Color(0xFF10B981) : const Color(0xFFF59E0B),
                          ),
                          const SizedBox(width: 4),
                          Text(
                            '${_tiltAngle >= 0 ? "+" : ""}${_tiltAngle.toStringAsFixed(1)}°',
                            style: TextStyle(
                              fontFamily: 'monospace',
                              fontSize: 10,
                              fontWeight: FontWeight.bold,
                              color: _tiltAngle.abs() <= 0.3 ? const Color(0xFF10B981) : const Color(0xFFF59E0B),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(width: 8),
                  IconButton(
                    icon: const Icon(Icons.close, color: Colors.white70, size: 20),
                    onPressed: () => Navigator.of(context).pop(),
                  ),
                ],
              ),
            ),

            // 2. Interactive Crosshair Camera Canvas
            Expanded(
              child: Container(
                margin: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: const Color(0xFF020617),
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(color: const Color(0xFF334155)),
                ),
                child: ClipRRect(
                  borderRadius: BorderRadius.circular(14),
                  child: LayoutBuilder(
                    builder: (context, constraints) {
                      final size = Size(constraints.maxWidth, constraints.maxHeight);
                      return Stack(
                        children: [
                          // Background grid & brick masonry texture
                          CustomPaint(
                            size: size,
                            painter: _MasonryWallBackgroundPainter(),
                          ),

                          // Bounding Laser Box & Laser guideline
                          CustomPaint(
                            size: size,
                            painter: _LaserGuidelinesPainter(
                              pointA: _pointA,
                              pointB: _pointB,
                              widthMm: _measuredWidth,
                              heightMm: _measuredHeight,
                            ),
                          ),

                          // Target Crosshair A (Top Left)
                          Positioned(
                            left: _pointA.dx * size.width - 20,
                            top: _pointA.dy * size.height - 20,
                            child: GestureDetector(
                              onPanUpdate: (details) {
                                setState(() {
                                  final newX = (_pointA.dx + details.delta.dx / size.width).clamp(0.05, _pointB.dx - 0.15);
                                  final newY = (_pointA.dy + details.delta.dy / size.height).clamp(0.05, _pointB.dy - 0.15);
                                  _pointA = Offset(newX, newY);
                                  _updateDimensionsFromPoints(size);
                                });
                              },
                              child: _buildCrosshairMarker('A (Coin Haut Gauche)', const Color(0xFF38BDF8)),
                            ),
                          ),

                          // Target Crosshair B (Bottom Right)
                          Positioned(
                            left: _pointB.dx * size.width - 20,
                            top: _pointB.dy * size.height - 20,
                            child: GestureDetector(
                              onPanUpdate: (details) {
                                setState(() {
                                  final newX = (_pointB.dx + details.delta.dx / size.width).clamp(_pointA.dx + 0.15, 0.95);
                                  final newY = (_pointB.dy + details.delta.dy / size.height).clamp(_pointA.dy + 0.15, 0.95);
                                  _pointB = Offset(newX, newY);
                                  _updateDimensionsFromPoints(size);
                                });
                              },
                              child: _buildCrosshairMarker('B (Coin Bas Droit)', const Color(0xFFEF4444)),
                            ),
                          ),

                          // Live HUD Telemetry Badge
                          Positioned(
                            top: 10,
                            left: 10,
                            child: GestureDetector(
                              onTap: _recalibrateLevel,
                              child: Container(
                                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                decoration: BoxDecoration(
                                  color: Colors.black.withValues(alpha: 0.75),
                                  borderRadius: BorderRadius.circular(6),
                                  border: Border.all(
                                    color: _isCalibrated ? const Color(0xFF10B981) : const Color(0xFFF59E0B),
                                  ),
                                ),
                                child: Row(
                                  children: [
                                    Container(
                                      width: 6,
                                      height: 6,
                                      decoration: BoxDecoration(
                                        color: _isCalibrated ? const Color(0xFF10B981) : const Color(0xFFF59E0B),
                                        shape: BoxShape.circle,
                                      ),
                                    ),
                                    const SizedBox(width: 6),
                                    Text(
                                      _isCalibrated ? 'CALIBRAGE LASER 1:1' : 'RECALIBRAGE REQUIS',
                                      style: TextStyle(
                                        fontFamily: 'monospace',
                                        fontSize: 9,
                                        fontWeight: FontWeight.bold,
                                        color: _isCalibrated ? const Color(0xFF10B981) : const Color(0xFFF59E0B),
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ),
                          ),

                          // Direct Quick Micro-Adjustment Buttons (Right Side)
                          Positioned(
                            right: 8,
                            top: 8,
                            child: Column(
                              children: [
                                _buildNudgeButton('+10 W', () {
                                  setState(() => _measuredWidth = math.min(4000.0, _measuredWidth + 10));
                                }),
                                const SizedBox(height: 4),
                                _buildNudgeButton('-10 W', () {
                                  setState(() => _measuredWidth = math.max(400.0, _measuredWidth - 10));
                                }),
                                const SizedBox(height: 8),
                                _buildNudgeButton('+10 H', () {
                                  setState(() => _measuredHeight = math.min(3200.0, _measuredHeight + 10));
                                }),
                                const SizedBox(height: 4),
                                _buildNudgeButton('-10 H', () {
                                  setState(() => _measuredHeight = math.max(400.0, _measuredHeight - 10));
                                }),
                              ],
                            ),
                          ),
                        ],
                      );
                    },
                  ),
                ),
              ),
            ),

            // 3. Technical Calculation Dashboard
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
              decoration: const BoxDecoration(
                color: Color(0xFF0F172A),
                border: Border(top: BorderSide(color: Color(0xFF1E293B))),
              ),
              child: Column(
                children: [
                  // Row: Brut Maçonnerie vs Jeux de Pose
                  Row(
                    children: [
                      // Dimension Display (Brut)
                      Expanded(
                        child: Container(
                          padding: const EdgeInsets.all(8),
                          decoration: BoxDecoration(
                            color: const Color(0xFF1E293B),
                            borderRadius: BorderRadius.circular(10),
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const Text(
                                'COTE TABLEAU BRUT',
                                style: TextStyle(
                                  fontFamily: 'monospace',
                                  fontSize: 9,
                                  color: Color(0xFF94A3B8),
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                              const SizedBox(height: 2),
                              FittedBox(
                                fit: BoxFit.scaleDown,
                                alignment: Alignment.centerLeft,
                                child: Text(
                                  ' ×  mm',
                                  style: const TextStyle(
                                    fontFamily: 'monospace',
                                    fontSize: 14,
                                    fontWeight: FontWeight.bold,
                                    color: Colors.white,
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                      const SizedBox(width: 8),
                      // Diagonal Squareness Check Card
                      Expanded(
                        child: Container(
                          padding: const EdgeInsets.all(8),
                          decoration: BoxDecoration(
                            color: const Color(0xFF1E293B),
                            borderRadius: BorderRadius.circular(10),
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              FittedBox(
                                fit: BoxFit.scaleDown,
                                alignment: Alignment.centerLeft,
                                child: Row(
                                  mainAxisSize: MainAxisSize.min,
                                  children: [
                                    const Text(
                                      'ÉQUERRAGE',
                                      style: TextStyle(
                                        fontFamily: 'monospace',
                                        fontSize: 9,
                                        color: Color(0xFF94A3B8),
                                        fontWeight: FontWeight.bold,
                                      ),
                                    ),
                                    const SizedBox(width: 6),
                                    Text(
                                      _diagonalDiff <= 4.0 ? 'CONFORME' : 'FAUX-ÉQUERRE',
                                      style: TextStyle(
                                        fontFamily: 'monospace',
                                        fontSize: 8,
                                        fontWeight: FontWeight.bold,
                                        color: _diagonalDiff <= 4.0 ? const Color(0xFF10B981) : const Color(0xFFF59E0B),
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                              const SizedBox(height: 2),
                              FittedBox(
                                fit: BoxFit.scaleDown,
                                alignment: Alignment.centerLeft,
                                child: Text(
                                  'ΔD = ${_diagonalDiff.toStringAsFixed(1)} mm',
                                  style: TextStyle(
                                    fontFamily: 'monospace',
                                    fontSize: 13,
                                    fontWeight: FontWeight.bold,
                                    color: _diagonalDiff <= 4.0 ? const Color(0xFF10B981) : const Color(0xFFF59E0B),
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),

                  // Tableaux Standards Algériens
                  _buildStandardPresetsBar(),
                  const SizedBox(height: 8),

                  // Clearance Selector (Jeux de pose maçonnerie) - Horizontally scrollable
                  SingleChildScrollView(
                    scrollDirection: Axis.horizontal,
                    child: Row(
                      children: [
                        const Text(
                          'Jeu de pose:',
                          style: TextStyle(fontSize: 11, color: Colors.white70),
                        ),
                        const SizedBox(width: 8),
                        _buildPlayChip('Standard (-10mm)', 0),
                        const SizedBox(width: 4),
                        _buildPlayChip('Rénov (-15mm)', 1),
                        const SizedBox(width: 4),
                        _buildPlayChip('Brut (0mm)', 2),
                      ],
                    ),
                  ),
                  const SizedBox(height: 8),

                  // Fabrication Final Dimension Banner
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                    decoration: BoxDecoration(
                      color: const Color(0xFF38BDF8).withValues(alpha: 0.12),
                      borderRadius: BorderRadius.circular(10),
                      border: Border.all(color: const Color(0xFF38BDF8).withValues(alpha: 0.3)),
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const Text(
                                'COTE DE FABRICATION ATELIER',
                                style: TextStyle(
                                  fontFamily: 'monospace',
                                  fontSize: 9,
                                  fontWeight: FontWeight.bold,
                                  color: Color(0xFF38BDF8),
                                ),
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                              ),
                              FittedBox(
                                fit: BoxFit.scaleDown,
                                alignment: Alignment.centerLeft,
                                child: Text(
                                  '${_finalFabricationWidth.toInt()} × ${_finalFabricationHeight.toInt()} mm',
                                  style: const TextStyle(
                                    fontFamily: 'monospace',
                                    fontSize: 15,
                                    fontWeight: FontWeight.bold,
                                    color: Colors.white,
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(width: 8),
                        ElevatedButton.icon(
                          style: ElevatedButton.styleFrom(
                            backgroundColor: const Color(0xFF38BDF8),
                            foregroundColor: const Color(0xFF0F172A),
                            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                          ),
                          icon: const Icon(Icons.check_circle_outline, size: 15),
                          label: const FittedBox(
                            fit: BoxFit.scaleDown,
                            child: Text(
                              'Appliquer au Devis',
                              style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold),
                            ),
                          ),
                          onPressed: () {
                            widget.onApplyDimensions(_finalFabricationWidth, _finalFabricationHeight);
                            Navigator.of(context).pop();
                          },
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildCrosshairMarker(String label, Color color) {
    return Container(
      width: 40,
      height: 40,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        color: color.withValues(alpha: 0.25),
        border: Border.all(color: color, width: 2),
      ),
      child: Center(
        child: Container(
          width: 8,
          height: 8,
          decoration: BoxDecoration(
            color: color,
            shape: BoxShape.circle,
          ),
        ),
      ),
    );
  }

  Widget _buildStandardPresetsBar() {
    final presets = [
      {'label': '1200×1200 (Fenêtre)', 'w': 1200.0, 'h': 1200.0},
      {'label': '1400×2200 (Porte-Fenêtre)', 'w': 1400.0, 'h': 2200.0},
      {'label': '2400×2200 (Baie Salon)', 'w': 2400.0, 'h': 2200.0},
      {'label': '1000×1400 (Cuisine)', 'w': 1000.0, 'h': 1400.0},
      {'label': '600×600 (Vasistas SDB)', 'w': 600.0, 'h': 600.0},
      {'label': '800×500 (Imposte)', 'w': 800.0, 'h': 500.0},
    ];

    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      child: Row(
        children: [
          const Text(
            'Tableau std:',
            style: TextStyle(fontSize: 11, color: Color(0xFFD4AF37), fontWeight: FontWeight.bold),
          ),
          const SizedBox(width: 8),
          ...presets.map((p) {
            final isMatch = _measuredWidth == (p['w'] as double) && _measuredHeight == (p['h'] as double);
            return Padding(
              padding: const EdgeInsets.only(right: 4),
              child: GestureDetector(
                onTap: () => _applyPreset(p['w'] as double, p['h'] as double),
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: isMatch ? const Color(0xFFD4AF37) : const Color(0xFF1E293B),
                    borderRadius: BorderRadius.circular(6),
                    border: Border.all(
                      color: isMatch ? const Color(0xFFD4AF37) : const Color(0xFF334155),
                    ),
                  ),
                  child: Text(
                    p['label'] as String,
                    style: TextStyle(
                      fontSize: 10,
                      fontWeight: isMatch ? FontWeight.bold : FontWeight.normal,
                      color: isMatch ? const Color(0xFF0F172A) : Colors.white70,
                    ),
                  ),
                ),
              ),
            );
          }),
        ],
      ),
    );
  }

  Widget _buildPlayChip(String title, int index) {
    final isSelected = _masonryPlayIndex == index;
    return GestureDetector(
      onTap: () => setState(() => _masonryPlayIndex = index),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
        decoration: BoxDecoration(
          color: isSelected ? const Color(0xFF38BDF8) : const Color(0xFF1E293B),
          borderRadius: BorderRadius.circular(6),
        ),
        child: Text(
          title,
          style: TextStyle(
            fontSize: 10,
            fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
            color: isSelected ? const Color(0xFF0F172A) : Colors.white70,
          ),
        ),
      ),
    );
  }

  Widget _buildNudgeButton(String label, VoidCallback onTap) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 4),
        decoration: BoxDecoration(
          color: const Color(0xFF1E293B),
          borderRadius: BorderRadius.circular(4),
          border: Border.all(color: const Color(0xFF334155)),
        ),
        child: Text(
          label,
          style: const TextStyle(
            fontFamily: 'monospace',
            fontSize: 9,
            fontWeight: FontWeight.bold,
            color: Colors.white,
          ),
        ),
      ),
    );
  }
}

class _MasonryWallBackgroundPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    // Soft concrete / brick masonry mortar simulation pattern
    final bgPaint = Paint()..color = const Color(0xFF090D16);
    canvas.drawRect(Rect.fromLTWH(0, 0, size.width, size.height), bgPaint);

    final mortarPaint = Paint()
      ..color = const Color(0xFF1E293B).withValues(alpha: 0.4)
      ..strokeWidth = 1.0;

    const brickHeight = 22.0;
    const brickWidth = 55.0;

    int row = 0;
    for (double y = 0; y < size.height; y += brickHeight) {
      canvas.drawLine(Offset(0, y), Offset(size.width, y), mortarPaint);
      final xOffset = (row % 2 == 0) ? 0.0 : brickWidth / 2.0;
      for (double x = xOffset; x < size.width; x += brickWidth) {
        canvas.drawLine(Offset(x, y), Offset(x, y + brickHeight), mortarPaint);
      }
      row++;
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}

class _LaserGuidelinesPainter extends CustomPainter {
  final Offset pointA;
  final Offset pointB;
  final double widthMm;
  final double heightMm;

  _LaserGuidelinesPainter({
    required this.pointA,
    required this.pointB,
    required this.widthMm,
    required this.heightMm,
  });

  @override
  void paint(Canvas canvas, Size size) {
    final x1 = pointA.dx * size.width;
    final y1 = pointA.dy * size.height;
    final x2 = pointB.dx * size.width;
    final y2 = pointB.dy * size.height;

    // Laser Box
    final laserPaint = Paint()
      ..color = const Color(0xFFEF4444)
      ..strokeWidth = 1.5
      ..style = PaintingStyle.stroke;

    final boxRect = Rect.fromLTRB(
      math.min(x1, x2),
      math.min(y1, y2),
      math.max(x1, x2),
      math.max(y1, y2),
    );
    canvas.drawRect(boxRect, laserPaint);

    // Diagonals for squareness test
    final diagPaint = Paint()
      ..color = const Color(0xFFF59E0B).withValues(alpha: 0.4)
      ..strokeWidth = 1.0
      ..style = PaintingStyle.stroke;

    canvas.drawLine(boxRect.topLeft, boxRect.bottomRight, diagPaint);
    canvas.drawLine(boxRect.topRight, boxRect.bottomLeft, diagPaint);

    // Dimension indicators in glowing red/amber
    final textPainterW = TextPainter(
      text: TextSpan(
        text: 'L = ${widthMm.toInt()} mm',
        style: const TextStyle(
          fontFamily: 'monospace',
          fontSize: 11,
          fontWeight: FontWeight.bold,
          color: Color(0xFFEF4444),
          backgroundColor: Color(0xCC000000),
        ),
      ),
      textDirection: TextDirection.ltr,
    )..layout();
    textPainterW.paint(canvas, Offset(boxRect.center.dx - textPainterW.width / 2, boxRect.top - 16));

    final textPainterH = TextPainter(
      text: TextSpan(
        text: 'H = ${heightMm.toInt()} mm',
        style: const TextStyle(
          fontFamily: 'monospace',
          fontSize: 11,
          fontWeight: FontWeight.bold,
          color: Color(0xFFEF4444),
          backgroundColor: Color(0xCC000000),
        ),
      ),
      textDirection: TextDirection.ltr,
    )..layout();
    textPainterH.paint(canvas, Offset(boxRect.right + 4, boxRect.center.dy - textPainterH.height / 2));
  }

  @override
  bool shouldRepaint(covariant _LaserGuidelinesPainter oldDelegate) {
    return oldDelegate.pointA != pointA ||
        oldDelegate.pointB != pointB ||
        oldDelegate.widthMm != widthMm ||
        oldDelegate.heightMm != heightMm;
  }
}
