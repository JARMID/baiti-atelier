import React, { useState } from 'react';
import type { MetalConfig, MetalProductType, IronBarType } from '../../types/trades';
import { calculateMetalCost } from '../../utils/tradesPricingEngine';
import { useConfigStore } from '../../store/configStore';
import { MessageCircle, FileDown, ShieldAlert, Sliders } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
  playTactileClick,
  playClampSound,
  playSlideTick,
  playSwitchSound,
} from '../../utils/audioFeedback';

let metalQuoteCounter = 1000;

export const MetalStudio: React.FC = () => {
  const { language, theme, calibration } = useConfigStore();
  const isLight = theme === 'light';
  const isRtl = language === 'ar';

  const [config, setConfig] = useState<MetalConfig>({
    productType: 'window_grille',
    width: 1200,
    height: 1400,
    barType: 'square_14',
    barSpacingMm: 110,
    hasForgedScrolls: true,
    hasSpearHeads: true,
    finishTreatment: 'epoxy_powder_coat',
  });

  const cost = calculateMetalCost(config, calibration);

  const presets: {
    label: string;
    type: MetalProductType;
    w: number;
    h: number;
    bar: IronBarType;
    spacing: number;
    scrolls: boolean;
    spears: boolean;
  }[] = [
    {
      label: language === 'ar' ? 'شباك حماية للنافذة' : language === 'en' ? 'Window Security Grille' : 'Grille de Sécurité Fenêtre',
      type: 'window_grille',
      w: 1200,
      h: 1400,
      bar: 'square_14',
      spacing: 110,
      scrolls: true,
      spears: true,
    },
    {
      label: language === 'ar' ? 'بوابة سحابة عصرية' : language === 'en' ? 'Modern Sliding Gate' : 'Portail Coulissant Moderne',
      type: 'sliding_gate',
      w: 3500,
      h: 2000,
      bar: 'square_16',
      spacing: 120,
      scrolls: false,
      spears: false,
    },
    {
      label: language === 'ar' ? 'بوابة حدادة أصيلة' : language === 'en' ? 'Traditional Forged Gate' : 'Portail Forgé Traditionnel',
      type: 'swing_gate',
      w: 3000,
      h: 1800,
      bar: 'forged_twisted',
      spacing: 110,
      scrolls: true,
      spears: true,
    },
    {
      label: language === 'ar' ? 'درابزين شرفة' : language === 'en' ? 'Balcony Railing' : 'Garde-Corps Balcon',
      type: 'balcony_railing',
      w: 2500,
      h: 1000,
      bar: 'square_14',
      spacing: 105,
      scrolls: true,
      spears: false,
    },
    {
      label: language === 'ar' ? 'باب حديدي مصفح' : language === 'en' ? 'Security Steel Door' : 'Porte Métallique Blindée',
      type: 'security_door',
      w: 1000,
      h: 2150,
      bar: 'square_16',
      spacing: 100,
      scrolls: false,
      spears: false,
    },
  ];

  const barsCount = Math.max(1, Math.floor(config.width / config.barSpacingMm));

  const generateMetalPdf = () => {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const quoteCode = `FER-26-${String(++metalQuoteCounter)}`;

    doc.setFillColor(15, 23, 42);
    doc.rect(0, 0, 210, 36, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text('BAITI ATELIER: FERRONNERIE D’ART & MÉTALLERIE', 14, 16);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(203, 213, 225);
    doc.text('Barreaudage, Portails, Garde-Corps & Serrurerie • Devis Algérie', 14, 24);

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(212, 175, 55);
    doc.text(`RÉF : ${quoteCode}`, 155, 16);

    // Summary Box
    doc.setDrawColor(226, 232, 240);
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(14, 44, 182, 28, 3, 3, 'FD');

    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('OUVRAGE MÉTALLIQUE :', 20, 52);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text(`Type : ${config.productType} • Cotes : ${config.width} mm (L) × ${config.height} mm (H)`, 20, 58);
    doc.text(`Barreaux : ${barsCount} unités (${config.barType}) • Finition : ${config.finishTreatment}`, 20, 64);

    // Cost Breakdown Table
    const costData = [
      ['Poids d’acier & profilés tubulaires', `${cost.steelWeightKg} kg`, `${cost.steelCostDzd.toLocaleString()} DZD`],
      ['Éléments décoratifs (Volutes & Pointes)', `${cost.scrollsCount} volutes + ${cost.spearsCount} pointes`, `${cost.decorCostDzd.toLocaleString()} DZD`],
      ['Accessoires (Serrures, Gonds, Rails)', 'Quincaillerie industrielle', `${cost.locksetAndHingesDzd.toLocaleString()} DZD`],
      ['Traitement de surface & Thermolaquage', `${config.finishTreatment}`, `${cost.surfaceFinishingDzd.toLocaleString()} DZD`],
      ['Main d’œuvre forge, soudure & installation', 'Chantier qualifié', `${cost.weldingLaborDzd.toLocaleString()} DZD`],
      ['TOTAL ESTIMÉ DE L’OUVRAGE', 'Montant TTC indicatif', `${cost.totalEstimatedDzd.toLocaleString()} DZD`],
    ];

    autoTable(doc, {
      startY: 78,
      head: [['Poste de Dépense', 'Détails de Fabrication', 'Montant DZD']],
      body: costData,
      theme: 'grid',
      headStyles: { fillColor: [15, 23, 42], textColor: 255, fontSize: 9 },
      bodyStyles: { fontSize: 8.5 },
    });

    playClampSound();
    doc.save(`BAITI_DEVIS_FER_${quoteCode}.pdf`);
  };

  const dispatchWhatsApp = () => {
    playTactileClick();
    const text = encodeURIComponent(
      `*DEVIS FERRONNERIE D’ART - BAITI ATELIER | بيتي*\n` +
      `Ouvrage: ${config.productType}\n` +
      `Dimensions: ${config.width} mm (L) x ${config.height} mm (H)\n` +
      `Barreaudage: ${barsCount} barreaux (${config.barType})\n` +
      `Finition: ${config.finishTreatment}\n` +
      `Ornements: ${config.hasForgedScrolls ? 'Volutes incluses' : 'Sans volute'} • ${config.hasSpearHeads ? 'Pointes incluses' : 'Sans pointe'}\n\n` +
      `*Chiffrage Indicatif Atelier :*\n` +
      `• Acier (${cost.steelWeightKg} kg): ${cost.steelCostDzd.toLocaleString()} DZD\n` +
      `• Ornements & Volutes: ${cost.decorCostDzd.toLocaleString()} DZD\n` +
      `• Serrurerie & Accessoires: ${cost.locksetAndHingesDzd.toLocaleString()} DZD\n` +
      `• Thermolaquage: ${cost.surfaceFinishingDzd.toLocaleString()} DZD\n` +
      `• Forge & Soudure: ${cost.weldingLaborDzd.toLocaleString()} DZD\n` +
      `*TOTAL ESTIMÉ: ${cost.totalEstimatedDzd.toLocaleString()} DZD*\n\n` +
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
                productType: p.type,
                width: p.w,
                height: p.h,
                barType: p.bar,
                barSpacingMm: p.spacing,
                hasForgedScrolls: p.scrolls,
                hasSpearHeads: p.spears,
                finishTreatment: config.finishTreatment,
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
        {/* LEFT: Interactive 2D Ironwork Blueprint (7 cols) */}
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
                <ShieldAlert className="w-4 h-4 text-[#D4AF37]" />
                <span
                  className={`text-xs font-mono font-bold uppercase tracking-wider ${
                    isLight ? 'text-slate-900' : 'text-white'
                  }`}
                >
                  {language === 'ar' ? 'مخطط الحدادة الفنية والباروداج' : language === 'en' ? 'Wrought Iron & Grille Blueprint' : 'Schéma de Forge & Barreaudage'}
                </span>
              </div>
              <div className={`flex items-center gap-3 text-xs font-mono ${isLight ? 'text-slate-600' : 'text-zinc-400'}`}>
                <span>{barsCount} {language === 'ar' ? 'قضيب' : 'barreaux'}</span>
                <span className="text-[#D4AF37] font-bold">{cost.steelWeightKg} kg {language === 'ar' ? 'حديد' : 'd’acier'}</span>
              </div>
            </div>

            {/* SVG Grille Schematic */}
            <div
              className={`h-96 flex items-center justify-center rounded-2xl border p-4 relative ${
                isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#090D15] border-white/5'
              }`}
            >
              <svg viewBox="0 0 500 400" className="w-full h-full max-h-80">
                {/* Outer Steel Frame */}
                <rect x="70" y="60" width="360" height="280" fill="none" stroke={isLight ? '#475569' : '#64748B'} strokeWidth="8" rx="2" />
                <rect x="74" y="64" width="352" height="272" fill={isLight ? '#F8FAFC' : '#101726'} />

                {/* Vertical Infill Bars */}
                {Array.from({ length: barsCount }).map((_, i) => {
                  const xPos = 74 + ((i + 1) * 352) / (barsCount + 1);
                  return (
                    <g key={i}>
                      {/* Vertical Bar */}
                      <line x1={xPos} y1="64" x2={xPos} y2="336" stroke={isLight ? '#334155' : '#94A3B8'} strokeWidth="3" />

                      {/* Top Spear Head */}
                      {config.hasSpearHeads && (
                        <polygon
                          points={`${xPos - 5},60 ${xPos},42 ${xPos + 5},60`}
                          fill="#D4AF37"
                        />
                      )}

                      {/* Forged Scroll */}
                      {config.hasForgedScrolls && i % 2 === 1 && (
                        <circle
                          cx={xPos}
                          cy="200"
                          r="12"
                          fill="none"
                          stroke="#D4AF37"
                          strokeWidth="2"
                        />
                      )}
                    </g>
                  );
                })}

                {/* Horizontal Reinforcement Rails */}
                <line x1="74" y1="130" x2="426" y2="130" stroke={isLight ? '#475569' : '#64748B'} strokeWidth="4" />
                <line x1="74" y1="270" x2="426" y2="270" stroke={isLight ? '#475569' : '#64748B'} strokeWidth="4" />

                {/* Dimension Annotations */}
                <line x1="70" y1="30" x2="430" y2="30" stroke="#38BDF8" strokeWidth="1.5" />
                <line x1="70" y1="24" x2="70" y2="36" stroke="#38BDF8" strokeWidth="1.5" />
                <line x1="430" y1="24" x2="430" y2="36" stroke="#38BDF8" strokeWidth="1.5" />
                <text x="250" y="24" textAnchor="middle" fill="#38BDF8" fontSize="11" fontFamily="monospace" fontWeight="bold">
                  {config.width} mm ({config.barSpacingMm}mm)
                </text>

                <line x1="450" y1="60" x2="450" y2="340" stroke="#38BDF8" strokeWidth="1.5" />
                <line x1="444" y1="60" x2="456" y2="60" stroke="#38BDF8" strokeWidth="1.5" />
                <line x1="444" y1="340" x2="456" y2="340" stroke="#38BDF8" strokeWidth="1.5" />
                <text x="470" y="200" textAnchor="middle" fill="#38BDF8" fontSize="11" fontFamily="monospace" fontWeight="bold" transform="rotate(90 470 200)">
                  {config.height} mm
                </text>
              </svg>
            </div>

            {/* Feature Badges */}
            <div className="mt-4 grid grid-cols-3 gap-3 text-center text-xs font-mono">
              <div className={`p-2.5 rounded-xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-white/5 border-white/10'}`}>
                <span className={`block text-[10px] ${isLight ? 'text-slate-500' : 'text-zinc-500'}`}>
                  {language === 'ar' ? 'مقطع الحديد:' : language === 'en' ? 'IRON PROFILE:' : 'SECTION FER :'}
                </span>
                <span className={`font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>{config.barType}</span>
              </div>
              <div className={`p-2.5 rounded-xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-white/5 border-white/10'}`}>
                <span className={`block text-[10px] ${isLight ? 'text-slate-500' : 'text-zinc-500'}`}>
                  {language === 'ar' ? 'الوزن الإجمالي:' : language === 'en' ? 'ESTIMATED WEIGHT:' : 'POIDS ESTIMÉ :'}
                </span>
                <span className="font-bold text-[#D4AF37]">{cost.steelWeightKg} kg</span>
              </div>
              <div className={`p-2.5 rounded-xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-white/5 border-white/10'}`}>
                <span className={`block text-[10px] ${isLight ? 'text-slate-500' : 'text-zinc-500'}`}>
                  {language === 'ar' ? 'الدهان:' : language === 'en' ? 'FINISH:' : 'FINITION :'}
                </span>
                <span className="font-bold text-emerald-500">Thermolaquage</span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT: Controls & Devis (5 cols) */}
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
              <span>{language === 'ar' ? 'خصائص العمل المعدني' : language === 'en' ? 'Metalwork Parameters' : 'Paramètres Ferronnerie'}</span>
            </h4>

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
                  min="600"
                  max="5000"
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
                  min="600"
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
                    {language === 'ar' ? 'المسافة بين القضبان' : language === 'en' ? 'Bar Spacing' : 'Espacement des barreaux'}
                  </span>
                  <span className="font-mono font-bold text-[#D4AF37]">{config.barSpacingMm} mm</span>
                </div>
                <input
                  type="range"
                  min="90"
                  max="150"
                  step="5"
                  value={config.barSpacingMm}
                  onChange={(e) => {
                    playSlideTick();
                    setConfig({ ...config, barSpacingMm: Number(e.target.value) });
                  }}
                  className="w-full accent-[#D4AF37] cursor-pointer"
                />
              </div>

              {/* Bar Section Selection */}
              <div className="pt-2">
                <label className={`block mb-1 ${isLight ? 'text-slate-600' : 'text-zinc-400'}`}>
                  {language === 'ar' ? 'نوع مقطع الحديد' : language === 'en' ? 'Iron Profile Type' : 'Type de Profilé / Fer'}
                </label>
                <select
                  value={config.barType}
                  onChange={(e) => {
                    playSwitchSound();
                    setConfig({ ...config, barType: e.target.value as IronBarType });
                  }}
                  className={`w-full px-3 py-2 rounded-xl border font-mono text-xs focus:outline-none focus:border-[#D4AF37] cursor-pointer ${
                    isLight ? 'bg-slate-50 border-slate-200 text-slate-800' : 'bg-white/5 border-white/10 text-white'
                  }`}
                >
                  <option value="square_14" className={isLight ? 'bg-white text-slate-900' : 'bg-[#12151C]'}>Carré Plein 14×14 mm (Standard)</option>
                  <option value="square_16" className={isLight ? 'bg-white text-slate-900' : 'bg-[#12151C]'}>Carré Plein 16×16 mm (Sécurité)</option>
                  <option value="round_tube_20" className={isLight ? 'bg-white text-slate-900' : 'bg-[#12151C]'}>Tube Rond 20 mm (Épuré)</option>
                  <option value="forged_twisted" className={isLight ? 'bg-white text-slate-900' : 'bg-[#12151C]'}>Fer Torsadé Forgé à Chaud</option>
                </select>
              </div>

              {/* Decorative Toggles */}
              <div className="pt-2 grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    playSwitchSound();
                    setConfig({ ...config, hasForgedScrolls: !config.hasForgedScrolls });
                  }}
                  className={`p-2.5 rounded-xl border text-xs cursor-pointer ${isRtl ? 'text-right' : 'text-left'} transition-all btn-press hover-lift ${
                    config.hasForgedScrolls
                      ? 'bg-[#D4AF37]/20 border-[#D4AF37] text-[#D4AF37] font-bold'
                      : isLight
                      ? 'bg-slate-50 border-slate-200 text-slate-600'
                      : 'bg-white/5 border-white/10 text-zinc-400'
                  }`}
                >
                  <div className="text-[11px] font-semibold">{language === 'ar' ? 'حلزونات زخرفية' : 'Volutes Forgées'}</div>
                  <div className="text-[9px] opacity-75">{config.hasForgedScrolls ? (language === 'ar' ? 'مرفقة' : 'Incluses') : (language === 'ar' ? 'بدون' : 'Sans volute')}</div>
                </button>

                <button
                  onClick={() => {
                    playSwitchSound();
                    setConfig({ ...config, hasSpearHeads: !config.hasSpearHeads });
                  }}
                  className={`p-2.5 rounded-xl border text-xs cursor-pointer ${isRtl ? 'text-right' : 'text-left'} transition-all btn-press hover-lift ${
                    config.hasSpearHeads
                      ? 'bg-[#D4AF37]/20 border-[#D4AF37] text-[#D4AF37] font-bold'
                      : isLight
                      ? 'bg-slate-50 border-slate-200 text-slate-600'
                      : 'bg-white/5 border-white/10 text-zinc-400'
                  }`}
                >
                  <div className="text-[11px] font-semibold">{language === 'ar' ? 'رؤوس رمح حادة' : 'Pointes de Lance'}</div>
                  <div className="text-[9px] opacity-75">{config.hasSpearHeads ? (language === 'ar' ? 'مرفقة' : 'Incluses') : (language === 'ar' ? 'بدون' : 'Sans pointes')}</div>
                </button>
              </div>

              {/* Surface Finish */}
              <div className="pt-2">
                <label className={`block mb-1 ${isLight ? 'text-slate-600' : 'text-zinc-400'}`}>
                  {language === 'ar' ? 'المعالجة السطحية والدهان' : language === 'en' ? 'Surface Treatment' : 'Traitement & Finition Peinture'}
                </label>
                <select
                  value={config.finishTreatment}
                  onChange={(e) => {
                    playSwitchSound();
                    setConfig({ ...config, finishTreatment: e.target.value as any });
                  }}
                  className={`w-full px-3 py-2 rounded-xl border font-mono text-xs focus:outline-none focus:border-[#D4AF37] cursor-pointer ${
                    isLight ? 'bg-slate-50 border-slate-200 text-slate-800' : 'bg-white/5 border-white/10 text-white'
                  }`}
                >
                  <option value="epoxy_powder_coat" className={isLight ? 'bg-white text-slate-900' : 'bg-[#12151C]'}>Thermolaquage Époxy au Four (10 ans)</option>
                  <option value="hammered_bronze" className={isLight ? 'bg-white text-slate-900' : 'bg-[#12151C]'}>Peinture Martelé Bronze Traditionnel</option>
                  <option value="antirust_primer" className={isLight ? 'bg-white text-slate-900' : 'bg-[#12151C]'}>Couche d’Apprêt Antirouille Simple</option>
                </select>
              </div>
            </div>

            {/* Price Summary */}
            <div
              className={`mt-6 p-4 rounded-2xl border flex flex-col gap-2 text-xs font-mono ${
                isLight ? 'bg-slate-50 border-slate-200 text-slate-800' : 'bg-white/5 border-white/10 text-white'
              }`}
            >
              <div className="flex justify-between">
                <span className={isLight ? 'text-slate-500' : 'text-zinc-400'}>
                  {language === 'ar' ? 'الحديد الخام' : 'Acier brut'} ({cost.steelWeightKg} kg) :
                </span>
                <span className="font-bold">{cost.steelCostDzd.toLocaleString()} DZD</span>
              </div>
              <div className="flex justify-between">
                <span className={isLight ? 'text-slate-500' : 'text-zinc-400'}>
                  {language === 'ar' ? 'الزخارف والنقوش' : 'Ornements forgés'} :
                </span>
                <span className="font-bold">{cost.decorCostDzd.toLocaleString()} DZD</span>
              </div>
              <div className="flex justify-between">
                <span className={isLight ? 'text-slate-500' : 'text-zinc-400'}>
                  {language === 'ar' ? 'المفصلات والأقفال' : 'Quincaillerie / Serrure'} :
                </span>
                <span className="font-bold">{cost.locksetAndHingesDzd.toLocaleString()} DZD</span>
              </div>
              <div className="flex justify-between">
                <span className={isLight ? 'text-slate-500' : 'text-zinc-400'}>
                  {language === 'ar' ? 'الدهان الحراري' : 'Traitement thermolaqué'} :
                </span>
                <span className="font-bold">{cost.surfaceFinishingDzd.toLocaleString()} DZD</span>
              </div>
              <div className="flex justify-between">
                <span className={isLight ? 'text-slate-500' : 'text-zinc-400'}>
                  {language === 'ar' ? 'الحدادة واللحام' : 'Forge & Soudure atelier'} :
                </span>
                <span className="font-bold">{cost.weldingLaborDzd.toLocaleString()} DZD</span>
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
                <span>{language === 'ar' ? 'طلب كشف حدادة عبر واتساب' : language === 'en' ? 'Ironwork Quote on WhatsApp' : 'Devis Ferronnerie sur WhatsApp'}</span>
              </button>

              <button
                onClick={generateMetalPdf}
                className={`w-full py-2.5 rounded-xl border font-medium text-xs flex items-center justify-center gap-2 transition-all cursor-pointer btn-press hover-lift ${
                  isLight
                    ? 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-800'
                    : 'bg-white/10 hover:bg-white/15 border-white/15 text-white'
                }`}
              >
                <FileDown className="w-4 h-4 text-[#D4AF37]" />
                <span>{language === 'ar' ? 'تحميل كشف حساب الحديد PDF' : language === 'en' ? 'Download Ironwork PDF' : 'Télécharger Fiche Débit Fer PDF'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
