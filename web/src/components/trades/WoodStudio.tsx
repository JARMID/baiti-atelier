import React, { useState } from 'react';
import type { WoodConfig, WoodProductType, WoodMaterial } from '../../types/trades';
import { calculateWoodCost } from '../../utils/tradesPricingEngine';
import { useConfigStore } from '../../store/configStore';
import { MessageCircle, FileDown, Sliders, Box } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
  playTactileClick,
  playClampSound,
  playSlideTick,
  playSwitchSound,
} from '../../utils/audioFeedback';

let woodQuoteCounter = 1000;

export const WoodStudio: React.FC = () => {
  const { language, theme, calibration } = useConfigStore();
  const isLight = theme === 'light';
  const isRtl = language === 'ar';

  const [config, setConfig] = useState<WoodConfig>({
    productType: 'kitchen_base',
    width: 800,
    height: 850,
    depth: 600,
    shelvesCount: 1,
    drawersCount: 0,
    doorsCount: 2,
    material: 'mdf_hydrofuge',
    finishEdge: 'pvc_2mm_choc',
    hardwareTier: 'soft_close_premium',
  });

  const cost = calculateWoodCost(config, calibration);

  const presets: {
    label: string;
    type: WoodProductType;
    w: number;
    h: number;
    d: number;
    s: number;
    dr: number;
    do: number;
  }[] = [
    {
      label: language === 'ar' ? 'خزانة سفلية للمطبخ' : language === 'en' ? 'Kitchen Base Unit' : 'Caisson Bas Cuisine',
      type: 'kitchen_base',
      w: 800,
      h: 850,
      d: 600,
      s: 1,
      dr: 0,
      do: 2,
    },
    {
      label: language === 'ar' ? 'خزانة علوية للمطبخ' : language === 'en' ? 'Kitchen Wall Unit' : 'Meuble Haut Cuisine',
      type: 'kitchen_wall',
      w: 800,
      h: 720,
      d: 350,
      s: 2,
      dr: 0,
      do: 2,
    },
    {
      label: language === 'ar' ? 'دريسينغ 3 أبواب' : language === 'en' ? '3-Door Wardrobe' : 'Dressing 3 Portes',
      type: 'wardrobe_dressing',
      w: 1800,
      h: 2200,
      d: 600,
      s: 4,
      dr: 3,
      do: 3,
    },
    {
      label: language === 'ar' ? 'باب داخلي إيزوبلان' : language === 'en' ? 'Flush Interior Door' : 'Porte Intérieure Isoplane',
      type: 'interior_door',
      w: 900,
      h: 2150,
      d: 100,
      s: 0,
      dr: 0,
      do: 1,
    },
    {
      label: language === 'ar' ? 'مكتب عمل عصري' : language === 'en' ? 'Ergonomic Desk' : 'Bureau Ergonomique',
      type: 'custom_furniture',
      w: 1400,
      h: 750,
      d: 700,
      s: 2,
      dr: 3,
      do: 1,
    },
  ];

  const materials: { id: WoodMaterial; label: string; sub: string }[] = [
    {
      id: 'melamine_18',
      label: language === 'ar' ? 'ميلامين أبيض 18 ملم' : language === 'en' ? 'White Melamine 18mm' : 'Mélaminé Blanc 18mm',
      sub: language === 'ar' ? 'اقتصادي وسهل التنظيف' : language === 'en' ? 'Cost-effective & easy care' : 'Économique & Facile d’entretien',
    },
    {
      id: 'mdf_hydrofuge',
      label: language === 'ar' ? 'MDF هيدروفوج أخضر مقاوم للرطوبة' : language === 'en' ? 'Moisture-resistant Green MDF' : 'MDF Hydrofuge Vert',
      sub: language === 'ar' ? 'خاص بالمطابخ ومقاومة الماء' : language === 'en' ? 'Special for kitchens & damp areas' : 'Spécial Cuisines & Humidité',
    },
    {
      id: 'stratifie_hpl',
      label: language === 'ar' ? 'سترارتيفي HPL عالي المقاومة' : language === 'en' ? 'High-pressure Laminate (HPL)' : 'Stratifié HPL Haute Résistance',
      sub: language === 'ar' ? 'مقاوم للخدوش والصدمات' : language === 'en' ? 'Scratch & impact resistant' : 'Anti-rayures & Chocs',
    },
    {
      id: 'chene_noble',
      label: language === 'ar' ? 'قشرة خشب الشين / خشب أحمر' : language === 'en' ? 'Oak Veneer / Red Wood' : 'Placage Chêne / Bois Rouge',
      sub: language === 'ar' ? 'تشطيب نجارة أصيلة راقية' : language === 'en' ? 'Traditional joinery finish' : 'Finition Ébénisterie Traditionnelle',
    },
    {
      id: 'hetre_massif',
      label: language === 'ar' ? 'خشب الزان المجفف (Hêtre massif)' : language === 'en' ? 'Kiln-Dried Solid Beech' : 'Hêtre Massif Séché',
      sub: language === 'ar' ? '100% خشب صلب متين' : language === 'en' ? '100% Solid hardwood' : '100% Bois Noble Robuste',
    },
  ];

  const generateWoodPdf = () => {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const quoteCode = `BOIS-26-${String(++woodQuoteCounter)}`;

    doc.setFillColor(15, 23, 42);
    doc.rect(0, 0, 210, 36, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text('BAITI ATELIER: MENUISERIE BOIS & AMEUBLEMENT', 14, 16);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(203, 213, 225);
    doc.text('Fiche de Débitage Panneaux & Chiffrage Artisanal • Algérie', 14, 24);

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(212, 175, 55);
    doc.text(`RÉF : ${quoteCode}`, 155, 16);

    doc.setFontSize(9);
    doc.setTextColor(226, 232, 240);
    doc.text(`Date : ${new Date().toLocaleDateString('fr-FR')}`, 155, 24);

    // Summary Box
    doc.setDrawColor(226, 232, 240);
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(14, 44, 182, 28, 3, 3, 'FD');

    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('SPÉCIFICATIONS DU MEUBLE :', 20, 52);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text(`Type : ${config.productType} • Cotes : ${config.width}L × ${config.height}H × ${config.depth}P mm`, 20, 58);
    doc.text(`Matériau : ${config.material} • Chants : ${config.finishEdge} • Quincaillerie : ${config.hardwareTier}`, 20, 64);

    // Cutting Table
    const tableData = [
      ['Montants latéraux (Joues)', '2', `${config.height} mm`, `${config.depth} mm`, 'Chant avant 2mm'],
      ['Plafond & Plinthe basse', '2', `${config.width - 36} mm`, `${config.depth} mm`, 'Chant avant 2mm'],
      ['Fond arrière', '1', `${config.width - 10} mm`, `${config.height - 10} mm`, 'Rainuré en applique'],
      ['Étagères intérieures', `${config.shelvesCount}`, `${config.width - 36} mm`, `${config.depth - 20} mm`, 'Chant avant 0.8mm'],
      ['Façades / Portes', `${config.doorsCount}`, `${config.height - 4} mm`, `${Math.round(config.width / Math.max(1, config.doorsCount)) - 4} mm`, '4 côtés chants 2mm'],
    ];

    autoTable(doc, {
      startY: 78,
      head: [['Désignation Panneau', 'Qté', 'Longueur', 'Largeur', 'Finition Chants']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [15, 23, 42], textColor: 255, fontSize: 9 },
      bodyStyles: { fontSize: 8.5 },
    });

    const finalY = (doc as any).lastAutoTable.finalY + 12;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.text('ESTIMATION FOURNITURE & FAÇONNAGE EN ATELIER :', 14, finalY);

    const costData = [
      ['Panneaux dérivés du bois', `${cost.boardSheetsRequired} plaques entières (2.80 × 2.07m)`, `${cost.boardCostDzd.toLocaleString()} DZD`],
      ['Chants PVC antichoc 2mm', `${cost.edgeBandMeters} mètres linéaires plaqués`, `${cost.edgeCostDzd.toLocaleString()} DZD`],
      ['Quincaillerie (charnières clip & coulisses)', `${config.hardwareTier}`, `${cost.hardwareCostDzd.toLocaleString()} DZD`],
      ['Façonnage, découpe scie & assemblage', 'Main-d’œuvre qualifiée', `${cost.laborAssemblyDzd.toLocaleString()} DZD`],
      ['TOTAL ESTIMÉ TTC', 'Conforme barème atelier', `${cost.totalEstimatedDzd.toLocaleString()} DZD`],
    ];

    autoTable(doc, {
      startY: finalY + 4,
      head: [['Poste de Dépense', 'Détails Techniques', 'Montant Estimé']],
      body: costData,
      theme: 'striped',
      headStyles: { fillColor: [212, 175, 55], textColor: 255, fontSize: 9 },
      bodyStyles: { fontSize: 8.5 },
    });

    playClampSound();
    doc.save(`BAITI_DEBIT_BOIS_${quoteCode}.pdf`);
  };

  const dispatchWhatsApp = () => {
    playTactileClick();
    const text = encodeURIComponent(
      `*DEVIS MENUISERIE BOIS - BAITI ATELIER | بيتي*\n` +
      `Meuble: ${config.productType}\n` +
      `Dimensions: ${config.width} mm (L) x ${config.height} mm (H) x ${config.depth} mm (P)\n` +
      `Matériau: ${config.material}\n` +
      `Agencement: ${config.shelvesCount} étagères, ${config.drawersCount} tiroirs, ${config.doorsCount} portes\n` +
      `Chants: ${config.finishEdge} • Quincaillerie: ${config.hardwareTier}\n\n` +
      `*Chiffrage Indicatif Atelier :*\n` +
      `• Panneaux (${cost.boardSheetsRequired} plaques): ${cost.boardCostDzd.toLocaleString()} DZD\n` +
      `• Chants PVC (${cost.edgeBandMeters}m): ${cost.edgeCostDzd.toLocaleString()} DZD\n` +
      `• Quincaillerie: ${cost.hardwareCostDzd.toLocaleString()} DZD\n` +
      `• Façonnage & Montage: ${cost.laborAssemblyDzd.toLocaleString()} DZD\n` +
      `*TOTAL: ${cost.totalEstimatedDzd.toLocaleString()} DZD*\n\n` +
      `Transmis via Baiti Atelier Algérie`
    );
    window.open(`https://wa.me/213550123456?text=${text}`, '_blank');
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Quick Presets */}
      <div className="mb-6 flex items-center gap-2 overflow-x-auto pb-2">
        <span className={`text-xs font-mono shrink-0 ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
          {language === 'ar' ? 'النماذج القياسية:' : language === 'en' ? 'STANDARD MODELS:' : 'MODÈLES STANDARDS :'}
        </span>
        {presets.map((p) => (
          <button
            key={p.label}
            onClick={() => {
              playTactileClick();
              setConfig({
                ...config,
                productType: p.type,
                width: p.w,
                height: p.h,
                depth: p.d,
                shelvesCount: p.s,
                drawersCount: p.dr,
                doorsCount: p.do,
              });
            }}
            className={`px-3 py-1.5 rounded-xl border text-xs font-mono transition-all shrink-0 cursor-pointer btn-press hover-lift ${
              isLight
                ? 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700 shadow-xs'
                : 'bg-white/5 hover:bg-white/10 border-white/10 text-zinc-300 hover:text-white'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT: 2D Interactive Blueprint Preview (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <div
            className={`p-6 rounded-3xl border relative overflow-hidden transition-colors duration-300 shadow-xl ${
              isLight
                ? 'bg-white border-slate-200 text-slate-900 shadow-slate-200/50'
                : 'bg-[#0F1420] border-white/10 text-white'
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Box className="w-4 h-4 text-[#D4AF37]" />
                <span
                  className={`text-xs font-mono font-bold uppercase tracking-wider ${
                    isLight ? 'text-slate-900' : 'text-white'
                  }`}
                >
                  {language === 'ar' ? 'مخطط التوزيع الهندسي 2D للخزانة' : language === 'en' ? '2D Cabinet Elevation Layout' : 'Plan d’Agencement 2D du Meuble'}
                </span>
              </div>
              <span className={`text-xs font-mono ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
                {config.width} × {config.height} × {config.depth} mm
              </span>
            </div>

            {/* SVG Cabinet Wireframe */}
            <div
              className={`h-96 flex items-center justify-center rounded-2xl border p-4 relative ${
                isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#090D15] border-white/5'
              }`}
            >
              <svg
                viewBox="0 0 500 400"
                className="w-full h-full max-h-80"
                style={{ filter: isLight ? 'none' : 'drop-shadow(0 4px 12px rgba(0,0,0,0.5))' }}
              >
                {/* Outer Cabinet Frame */}
                <rect
                  x="100"
                  y="50"
                  width="300"
                  height="280"
                  fill={isLight ? '#F1F5F9' : '#172033'}
                  stroke="#D4AF37"
                  strokeWidth="3"
                  rx="4"
                />

                {/* Top and Bottom Thickness */}
                <rect x="100" y="50" width="300" height="12" fill={isLight ? '#E2E8F0' : '#243048'} />
                <rect x="100" y="318" width="300" height="12" fill={isLight ? '#E2E8F0' : '#243048'} />

                {/* Side Panels */}
                <rect x="100" y="50" width="12" height="280" fill={isLight ? '#CBD5E1' : '#1C263C'} />
                <rect x="388" y="50" width="12" height="280" fill={isLight ? '#CBD5E1' : '#1C263C'} />

                {/* Shelves */}
                {Array.from({ length: config.shelvesCount }).map((_, idx) => {
                  const yPos = 62 + ((256) / (config.shelvesCount + 1)) * (idx + 1);
                  return (
                    <g key={idx}>
                      <rect x="112" y={yPos} width="276" height="8" fill="#D4AF37" opacity={isLight ? 0.75 : 0.85} rx="1" />
                      <text x="250" y={yPos - 4} fill={isLight ? '#64748B' : '#94A3B8'} fontSize="9" textAnchor="middle" fontFamily="monospace">
                        Étagère #{idx + 1}
                      </text>
                    </g>
                  );
                })}

                {/* Doors Divider Lines */}
                {config.doorsCount > 1 &&
                  Array.from({ length: config.doorsCount - 1 }).map((_, idx) => {
                    const xPos = 112 + (276 / config.doorsCount) * (idx + 1);
                    return (
                      <g key={idx}>
                        <line x1={xPos} y1="62" x2={xPos} y2="318" stroke={isLight ? '#94A3B8' : '#475569'} strokeWidth="2" strokeDasharray="4 4" />
                        <circle cx={xPos - 8} cy="190" r="4" fill="#D4AF37" />
                        <circle cx={xPos + 8} cy="190" r="4" fill="#D4AF37" />
                      </g>
                    );
                  })}

                {config.doorsCount === 1 && (
                  <circle cx="360" cy="190" r="4" fill="#D4AF37" />
                )}

                {/* Dimension Arrows */}
                <line x1="100" y1="360" x2="400" y2="360" stroke="#38BDF8" strokeWidth="1.5" />
                <line x1="100" y1="354" x2="100" y2="366" stroke="#38BDF8" strokeWidth="1.5" />
                <line x1="400" y1="354" x2="400" y2="366" stroke="#38BDF8" strokeWidth="1.5" />
                <text x="250" y="378" textAnchor="middle" fill="#38BDF8" fontSize="11" fontFamily="monospace" fontWeight="bold">
                  {config.width} mm
                </text>

                <line x1="425" y1="50" x2="425" y2="330" stroke="#38BDF8" strokeWidth="1.5" />
                <line x1="419" y1="50" x2="431" y2="50" stroke="#38BDF8" strokeWidth="1.5" />
                <line x1="419" y1="330" x2="431" y2="330" stroke="#38BDF8" strokeWidth="1.5" />
                <text x="450" y="195" textAnchor="middle" fill="#38BDF8" fontSize="11" fontFamily="monospace" fontWeight="bold" transform="rotate(90 450 195)">
                  {config.height} mm
                </text>
              </svg>
            </div>

            {/* Cut List Mini Table */}
            <div
              className={`mt-4 p-3 rounded-2xl border text-xs font-mono ${
                isLight ? 'bg-slate-50 border-slate-200' : 'bg-white/5 border-white/10'
              }`}
            >
              <div className="font-semibold mb-2 flex items-center justify-between">
                <span className={isLight ? 'text-slate-600' : 'text-zinc-400'}>
                  {language === 'ar' ? 'مخطط التقطيع الموصى به للمنشار:' : language === 'en' ? 'RECOMMENDED PANEL CUTTING:' : 'DÉBITAGE SCIÉ À FORMAT RECOMMANDÉ :'}
                </span>
                <span className="text-[#D4AF37] font-bold">
                  {cost.boardSheetsRequired} {language === 'ar' ? 'لوح (2.80×2.07م)' : 'plaque(s) (2.80×2.07m)'}
                </span>
              </div>
              <div className={`grid grid-cols-3 gap-2 text-[11px] ${isLight ? 'text-slate-700' : 'text-zinc-300'}`}>
                <div>• Montants : 2 pcs ({config.height}×{config.depth})</div>
                <div>• Traverses : 2 pcs ({config.width}×{config.depth})</div>
                <div>• Façades : {config.doorsCount} portes ({config.height}×{Math.round(config.width / config.doorsCount)})</div>
              </div>
            </div>
          </div>

          {/* Cutting Optimization Alert */}
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs">
            <div className="flex items-center gap-2 text-amber-500 font-bold mb-1">
              <span>{language === 'ar' ? 'حساب تحسين تقطيع الألواح' : language === 'en' ? 'Sheet Nesting & Optimization' : 'Calepinage & Débitage Optimisé'}</span>
            </div>
            <p className={isLight ? 'text-slate-600' : 'text-zinc-400'}>
              {language === 'ar'
                ? `هذا الطلب يتطلب تقريباً ${cost.boardSheetsRequired} ألواح قياسية (2800×2070 مم). نسبة الفاقد التقريبية: 8%.`
                : language === 'en'
                ? `This configuration requires approx. ${cost.boardSheetsRequired} standard sheets (2800x2070 mm). Estimated kerf/waste: 8%.`
                : `Cet ouvrage nécessite environ ${cost.boardSheetsRequired} panneaux standards (2800x2070 mm). Taux de chute estimé à 8%.`}
            </p>
          </div>
        </div>

        {/* RIGHT: Tactile Parametric Controls & Algerian Devis (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div
            className={`p-6 rounded-3xl border transition-colors duration-300 shadow-xl ${
              isLight
                ? 'bg-white border-slate-200 text-slate-900 shadow-slate-200/50'
                : 'bg-[#0F1420] border-white/10 text-white'
            }`}
          >
            <h4 className="text-sm font-bold uppercase tracking-wider mb-4 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-[#D4AF37]" />
              <span>{language === 'ar' ? 'خصائص الخزانة والأبعاد' : language === 'en' ? 'Cabinet Parameters' : 'Paramètres du Meuble'}</span>
            </h4>

            {/* Dimension Sliders */}
            <div className="flex flex-col gap-3.5 text-xs">
              <div>
                <div className="flex justify-between mb-1">
                  <span className={isLight ? 'text-slate-600' : 'text-zinc-300'}>
                    {language === 'ar' ? 'العرض (L)' : language === 'en' ? 'Width (W)' : 'Largeur (L)'}
                  </span>
                  <span className="font-mono font-bold text-[#D4AF37]">{config.width} mm</span>
                </div>
                <input
                  type="range"
                  min="400"
                  max="3000"
                  step="50"
                  value={config.width}
                  onChange={(e) => {
                    playSlideTick();
                    setConfig({ ...config, width: Number(e.target.value) });
                  }}
                  className="w-full accent-[#D4AF37] cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span className={isLight ? 'text-slate-600' : 'text-zinc-300'}>
                    {language === 'ar' ? 'الارتفاع (H)' : language === 'en' ? 'Height (H)' : 'Hauteur (H)'}
                  </span>
                  <span className="font-mono font-bold text-[#D4AF37]">{config.height} mm</span>
                </div>
                <input
                  type="range"
                  min="500"
                  max="2600"
                  step="50"
                  value={config.height}
                  onChange={(e) => {
                    playSlideTick();
                    setConfig({ ...config, height: Number(e.target.value) });
                  }}
                  className="w-full accent-[#D4AF37] cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span className={isLight ? 'text-slate-600' : 'text-zinc-300'}>
                    {language === 'ar' ? 'العمق (P)' : language === 'en' ? 'Depth (D)' : 'Profondeur (P)'}
                  </span>
                  <span className="font-mono font-bold text-[#D4AF37]">{config.depth} mm</span>
                </div>
                <input
                  type="range"
                  min="250"
                  max="800"
                  step="25"
                  value={config.depth}
                  onChange={(e) => {
                    playSlideTick();
                    setConfig({ ...config, depth: Number(e.target.value) });
                  }}
                  className="w-full accent-[#D4AF37] cursor-pointer"
                />
              </div>

              {/* Shelves & Doors Counts */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <label className={`block mb-1 ${isLight ? 'text-slate-600' : 'text-zinc-400'}`}>
                    {language === 'ar' ? 'الرفوف الداخلية' : language === 'en' ? 'Internal Shelves' : 'Étagères intérieures'}
                  </label>
                  <select
                    value={config.shelvesCount}
                    onChange={(e) => {
                      playSwitchSound();
                      setConfig({ ...config, shelvesCount: Number(e.target.value) });
                    }}
                    className={`w-full px-3 py-2 rounded-xl border font-mono text-xs focus:outline-none focus:border-[#D4AF37] cursor-pointer ${
                      isLight ? 'bg-slate-50 border-slate-200 text-slate-800' : 'bg-white/5 border-white/10 text-white'
                    }`}
                  >
                    {[0, 1, 2, 3, 4, 5, 6].map((n) => (
                      <option key={n} value={n} className={isLight ? 'bg-white text-slate-900' : 'bg-[#12151C] text-white'}>
                        {n} {language === 'ar' ? 'رف' : 'étagère(s)'}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={`block mb-1 ${isLight ? 'text-slate-600' : 'text-zinc-400'}`}>
                    {language === 'ar' ? 'عدد الأبواب' : language === 'en' ? 'Doors Count' : 'Nombre de Portes'}
                  </label>
                  <select
                    value={config.doorsCount}
                    onChange={(e) => {
                      playSwitchSound();
                      setConfig({ ...config, doorsCount: Number(e.target.value) });
                    }}
                    className={`w-full px-3 py-2 rounded-xl border font-mono text-xs focus:outline-none focus:border-[#D4AF37] cursor-pointer ${
                      isLight ? 'bg-slate-50 border-slate-200 text-slate-800' : 'bg-white/5 border-white/10 text-white'
                    }`}
                  >
                    {[1, 2, 3, 4].map((n) => (
                      <option key={n} value={n} className={isLight ? 'bg-white text-slate-900' : 'bg-[#12151C] text-white'}>
                        {n} {language === 'ar' ? 'باب' : 'porte(s)'}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Material Selector */}
              <div className="pt-2">
                <label className={`block mb-1.5 ${isLight ? 'text-slate-600' : 'text-zinc-400'}`}>
                  {language === 'ar' ? 'نوع اللوح الخشبي' : language === 'en' ? 'Panel Material' : 'Matériau du Panneau'}
                </label>
                <div className="flex flex-col gap-2">
                  {materials.map((m) => (
                    <div
                      key={m.id}
                      onClick={() => {
                        playTactileClick();
                        setConfig({ ...config, material: m.id });
                      }}
                      className={`p-2.5 rounded-xl border ${isRtl ? 'text-right' : 'text-left'} cursor-pointer transition-all btn-press hover-lift ${
                        config.material === m.id
                          ? 'bg-[#D4AF37]/15 border-[#D4AF37] text-white'
                          : isLight
                          ? 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700'
                          : 'bg-white/5 border-white/10 text-zinc-400 hover:text-white'
                      }`}
                    >
                      <div className={`font-semibold text-xs ${isLight ? 'text-slate-900' : 'text-white'}`}>
                        {m.label}
                      </div>
                      <div className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
                        {m.sub}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Hardware Quality Tier */}
              <div className="pt-2">
                <label className={`block mb-1 ${isLight ? 'text-slate-600' : 'text-zinc-400'}`}>
                  {language === 'ar' ? 'نوعية المفصلات والإكسسوارات' : language === 'en' ? 'Hardware Tier' : 'Gamme Quincaillerie'}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      playSwitchSound();
                      setConfig({ ...config, hardwareTier: 'standard' });
                    }}
                    className={`py-2 px-3 rounded-xl border text-xs cursor-pointer btn-press ${
                      config.hardwareTier === 'standard'
                        ? isLight
                          ? 'bg-slate-200 border-slate-300 text-slate-900 font-bold'
                          : 'bg-white/15 border-white/30 text-white font-bold'
                        : isLight
                        ? 'bg-slate-50 border-slate-200 text-slate-600'
                        : 'bg-white/5 border-white/10 text-zinc-400'
                    }`}
                  >
                    Standard
                  </button>
                  <button
                    onClick={() => {
                      playSwitchSound();
                      setConfig({ ...config, hardwareTier: 'soft_close_premium' });
                    }}
                    className={`py-2 px-3 rounded-xl border text-xs cursor-pointer btn-press ${
                      config.hardwareTier === 'soft_close_premium'
                        ? 'bg-[#D4AF37]/20 border-[#D4AF37] text-[#D4AF37] font-bold'
                        : isLight
                        ? 'bg-slate-50 border-slate-200 text-slate-600'
                        : 'bg-white/5 border-white/10 text-zinc-400'
                    }`}
                  >
                    Amortisseurs Blum
                  </button>
                </div>
              </div>
            </div>

            {/* Price Summary Box */}
            <div
              className={`mt-6 p-4 rounded-2xl border flex flex-col gap-2 text-xs font-mono ${
                isLight ? 'bg-slate-50 border-slate-200 text-slate-800' : 'bg-white/5 border-white/10 text-white'
              }`}
            >
              <div className="flex justify-between">
                <span className={isLight ? 'text-slate-500' : 'text-zinc-400'}>
                  {language === 'ar' ? 'الألواح' : 'Panneaux'} ({cost.boardSheetsRequired} {language === 'ar' ? 'ألواح' : 'plaques'}) :
                </span>
                <span className="font-bold">{cost.boardCostDzd.toLocaleString()} DZD</span>
              </div>
              <div className="flex justify-between">
                <span className={isLight ? 'text-slate-500' : 'text-zinc-400'}>
                  {language === 'ar' ? 'حواشي PVC' : 'Chants PVC'} ({cost.edgeBandMeters}m) :
                </span>
                <span className="font-bold">{cost.edgeCostDzd.toLocaleString()} DZD</span>
              </div>
              <div className="flex justify-between">
                <span className={isLight ? 'text-slate-500' : 'text-zinc-400'}>
                  {language === 'ar' ? 'المفصلات والسكك' : 'Charnières & Coulisses'} :
                </span>
                <span className="font-bold">{cost.hardwareCostDzd.toLocaleString()} DZD</span>
              </div>
              <div className="flex justify-between">
                <span className={isLight ? 'text-slate-500' : 'text-zinc-400'}>
                  {language === 'ar' ? 'التصنيع والتركيب' : 'Assemblage & Finition'} :
                </span>
                <span className="font-bold">{cost.laborAssemblyDzd.toLocaleString()} DZD</span>
              </div>
              <div className={`border-t pt-2 flex justify-between items-baseline ${isLight ? 'border-slate-200' : 'border-white/10'}`}>
                <span className="font-bold text-sm">
                  {language === 'ar' ? 'الإجمالي التقديري:' : language === 'en' ? 'TOTAL ESTIMATE:' : 'TOTAL ESTIMÉ :'}
                </span>
                <span className="font-extrabold text-xl text-[#D4AF37]">
                  {cost.totalEstimatedDzd.toLocaleString()} DZD
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-5 flex flex-col gap-2">
              <button
                onClick={dispatchWhatsApp}
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-900/30 cursor-pointer btn-press hover-lift"
              >
                <MessageCircle className="w-4 h-4" />
                <span>{language === 'ar' ? 'طلب كشف الحساب عبر واتساب' : language === 'en' ? 'Woodwork Quote on WhatsApp' : 'Devis Menuiserie sur WhatsApp'}</span>
              </button>

              <button
                onClick={generateWoodPdf}
                className={`w-full py-2.5 rounded-xl border font-medium text-xs flex items-center justify-center gap-2 transition-all cursor-pointer btn-press hover-lift ${
                  isLight
                    ? 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-800'
                    : 'bg-white/10 hover:bg-white/15 border-white/15 text-white'
                }`}
              >
                <FileDown className="w-4 h-4 text-[#D4AF37]" />
                <span>{language === 'ar' ? 'تحميل بطاقة التقطيع PDF' : language === 'en' ? 'Download Saw Cut PDF' : 'Télécharger Fiche Débitage PDF'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
