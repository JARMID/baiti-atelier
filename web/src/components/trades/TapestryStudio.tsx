import React, { useState } from 'react';
import type { TapestryConfig, TapestryProductType, FabricType } from '../../types/trades';
import { calculateTapestryCost } from '../../utils/tradesPricingEngine';
import { useConfigStore } from '../../store/configStore';
import { MessageCircle, FileDown, Sliders, Scissors } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
  playTactileClick,
  playClampSound,
  playSlideTick,
  playSwitchSound,
} from '../../utils/audioFeedback';

let tapestryQuoteCounter = 1000;

export const TapestryStudio: React.FC = () => {
  const { language, theme, calibration } = useConfigStore();
  const isLight = theme === 'light';
  const isRtl = language === 'ar';

  const [config, setConfig] = useState<TapestryConfig>({
    productType: 'curtain_salon',
    railWidthCm: 300,
    heightCm: 280,
    pleatRatio: 2.0,
    fabricType: 'velours_antitache',
    headerType: 'eyelets_metal',
    hasThermalLining: false,
  });

  const cost = calculateTapestryCost(config, calibration);

  const presets: {
    label: string;
    type: TapestryProductType;
    w: number;
    h: number;
    pleat: 1.5 | 2.0 | 2.5;
    fabric: FabricType;
    lining: boolean;
  }[] = [
    {
      label: language === 'ar' ? 'ستائر صالون مزدوجة' : language === 'en' ? 'Double Salon Curtains' : 'Rideaux Doubles Salon',
      type: 'curtain_salon',
      w: 300,
      h: 280,
      pleat: 2.0,
      fabric: 'velours_antitache',
      lining: false,
    },
    {
      label: language === 'ar' ? 'فوال شفاف مضيء' : language === 'en' ? 'Sheer Organza Voile' : 'Voilage Tamisant Épuré',
      type: 'curtain_salon',
      w: 250,
      h: 260,
      pleat: 2.0,
      fabric: 'voilage_organza',
      lining: false,
    },
    {
      label: language === 'ar' ? 'ستار معتم عازل للغرفة' : language === 'en' ? 'Blackout Bedroom Curtain' : 'Rideau 100% Occultant Chambre',
      type: 'curtain_bedroom',
      w: 200,
      h: 270,
      pleat: 2.0,
      fabric: 'blackout_thermic',
      lining: true,
    },
    {
      label: language === 'ar' ? 'صالون مغربي تقليدي (4م)' : language === 'en' ? 'Moroccan Seddari (4m)' : 'Banquettes Salon Marocain (4m)',
      type: 'seddari_moroccan',
      w: 400,
      h: 80,
      pleat: 1.5,
      fabric: 'jacquard_damas',
      lining: false,
    },
    {
      label: language === 'ar' ? 'ستائر كتان طبيعي' : language === 'en' ? 'Washed Natural Linen' : 'Rideaux Lin Lavé Naturel',
      type: 'curtain_salon',
      w: 280,
      h: 290,
      pleat: 2.5,
      fabric: 'lin_naturel',
      lining: false,
    },
  ];

  const fabrics: { id: FabricType; label: string; sub: string }[] = [
    {
      id: 'velours_antitache',
      label: language === 'ar' ? 'مخمل مضاد للبقع والماء (Velours)' : language === 'en' ? 'Water-repellent Velvet' : 'Velours Déperlant Anti-Tache',
      sub: language === 'ar' ? 'ملمس ناعم، قابل للغسل ومتين' : language === 'en' ? 'Soft touch, machine washable' : 'Toucher soyeux, lavable & résistant',
    },
    {
      id: 'lin_naturel',
      label: language === 'ar' ? 'كتان مغسول طبيعي راقٍ' : language === 'en' ? 'Pure Washed Linen' : 'Lin Lavé Naturel Noble',
      sub: language === 'ar' ? 'انسيابية أنيقة للمنازل العصرية' : language === 'en' ? 'Fluid drape, organic texture' : 'Tombé fluide, ambiance moderne',
    },
    {
      id: 'jacquard_damas',
      label: language === 'ar' ? 'قماش جاكار دمشقي منقوش' : language === 'en' ? 'Embossed Damask Jacquard' : 'Tissu Jacquard Damassé Relief',
      sub: language === 'ar' ? 'زخارف راقية للصالونات الفخمة' : language === 'en' ? 'Rich patterns for salon decor' : 'Motifs orientaux pour salons',
    },
    {
      id: 'voilage_organza',
      label: language === 'ar' ? 'فوال أورجانزا شفاف' : language === 'en' ? 'Transparent Organza Sheer' : 'Voilage Transparent Organza',
      sub: language === 'ar' ? 'يسمح بدخول ضوء النهار بانسيابية' : language === 'en' ? 'Filters natural daylight softly' : 'Laisse filtrer la lumière du jour',
    },
    {
      id: 'blackout_thermic',
      label: language === 'ar' ? 'قماش 100% عازل للضوء والحرارة' : language === 'en' ? '100% Blackout Thermal Fabric' : 'Tissu 100% Occultant & Isolant',
      sub: language === 'ar' ? 'يحجب أشعة الشمس الحارة تماماً' : language === 'en' ? 'Blocks intense summer heat & light' : 'Bloque la lumière et la chaleur',
    },
  ];

  const generateTapestryPdf = () => {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const quoteCode = `TAP-26-${String(++tapestryQuoteCounter)}`;

    doc.setFillColor(15, 23, 42);
    doc.rect(0, 0, 210, 36, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text('BAITI ATELIER: TAPISSERIE & CONFECTION RIDEAUX', 14, 16);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(203, 213, 225);
    doc.text('Atelier de Couture d’Ameublement & Décoration Textile • Algérie', 14, 24);

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
    doc.text('SPÉCIFICATIONS CONFECTION TEXTILE :', 20, 52);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text(`Ouvrage : ${config.productType} • Tringle : ${config.railWidthCm} cm • Hauteur : ${config.heightCm} cm`, 20, 58);
    doc.text(`Tissu : ${config.fabricType} (Ondulation ${config.pleatRatio}x) • Tête : ${config.headerType}`, 20, 64);

    // Cost Breakdown Table
    const costData = [
      ['Métrage de tissu requis (Laize 2.80m)', `${cost.fabricLinearMeters} mètres linéaires`, `${cost.fabricCostDzd.toLocaleString()} DZD`],
      ['Accessoires tête (Ruflette wave & Œillets inox)', `${config.headerType}`, `${cost.rufletteAndEyeletsDzd.toLocaleString()} DZD`],
      ['Doublure thermique / occultante', config.hasThermalLining ? 'Incluse' : 'Non demandée', `${cost.liningCostDzd.toLocaleString()} DZD`],
      ['Confection atelier, ourlets plombés & finitions', 'Couture professionnelle', `${cost.tailoringLaborDzd.toLocaleString()} DZD`],
      ['TOTAL ESTIMÉ TTC', 'Conforme barème atelier', `${cost.totalEstimatedDzd.toLocaleString()} DZD`],
    ];

    autoTable(doc, {
      startY: 78,
      head: [['Poste de Dépense', 'Détails de Confection', 'Montant DZD']],
      body: costData,
      theme: 'grid',
      headStyles: { fillColor: [15, 23, 42], textColor: 255, fontSize: 9 },
      bodyStyles: { fontSize: 8.5 },
    });

    playClampSound();
    doc.save(`BAITI_DEVIS_TAPISSERIE_${quoteCode}.pdf`);
  };

  const dispatchWhatsApp = () => {
    playTactileClick();
    const text = encodeURIComponent(
      `*DEVIS TAPISSERIE & CONFECTION - BAITI ATELIER | بيتي*\n` +
      `Ouvrage: ${config.productType}\n` +
      `Dimensions: Tringle ${config.railWidthCm} cm x Hauteur ${config.heightCm} cm\n` +
      `Tissu: ${config.fabricType} (Ondulation ${config.pleatRatio}x)\n` +
      `Finition Tête: ${config.headerType} • Doublure: ${config.hasThermalLining ? 'Active' : 'Non'}\n\n` +
      `*Chiffrage Indicatif Atelier :*\n` +
      `• Métrage Tissu (${cost.fabricLinearMeters}m): ${cost.fabricCostDzd.toLocaleString()} DZD\n` +
      `• Ruflette & Œillets: ${cost.rufletteAndEyeletsDzd.toLocaleString()} DZD\n` +
      `• Doublure: ${cost.liningCostDzd.toLocaleString()} DZD\n` +
      `• Façonnage & Ourlets Plombés: ${cost.tailoringLaborDzd.toLocaleString()} DZD\n` +
      `*TOTAL ESTIMÉ: ${cost.totalEstimatedDzd.toLocaleString()} DZD*\n\n` +
      `Transmis via Baiti Atelier Algérie`
    );
    window.open(`https://wa.me/213550123456?text=${text}`, '_blank');
  };

  const pleatsCount = Math.max(6, Math.round(config.railWidthCm / 20));

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Quick Presets */}
      <div className="mb-6 flex items-center gap-2 overflow-x-auto pb-2">
        <span className={`text-xs font-mono shrink-0 ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
          {language === 'ar' ? 'نماذج الستائر والأثاث:' : language === 'en' ? 'CURTAINS & SALONS:' : 'MODÈLES RIDEAUX & SALONS :'}
        </span>
        {presets.map((p) => (
          <button
            key={p.label}
            onClick={() => {
              playTactileClick();
              setConfig({
                productType: p.type,
                railWidthCm: p.w,
                heightCm: p.h,
                pleatRatio: p.pleat,
                fabricType: p.fabric,
                headerType: config.headerType,
                hasThermalLining: p.lining,
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
        {/* LEFT: Interactive 2D Curtain Drape Simulation (7 cols) */}
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
                <Scissors className="w-4 h-4 text-[#D4AF37]" />
                <span
                  className={`text-xs font-mono font-bold uppercase tracking-wider ${
                    isLight ? 'text-slate-900' : 'text-white'
                  }`}
                >
                  {language === 'ar' ? 'محاكاة انسيابية القماش والأمواج' : language === 'en' ? 'Fabric Drape & Wave Simulation' : 'Simulation de Tombé & Ondulation Textile'}
                </span>
              </div>
              <div className={`flex items-center gap-3 text-xs font-mono ${isLight ? 'text-slate-600' : 'text-zinc-400'}`}>
                <span>Laize 2.80m</span>
                <span className="text-[#D4AF37] font-bold">{cost.fabricLinearMeters} m {language === 'ar' ? 'قماش' : 'de tissu'}</span>
              </div>
            </div>

            {/* SVG Curtain Drape Schematic */}
            <div
              className={`h-96 flex items-center justify-center rounded-2xl border p-4 relative ${
                isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#090D15] border-white/5'
              }`}
            >
              <svg viewBox="0 0 500 400" className="w-full h-full max-h-80">
                {/* Curtain Rod / Tringle */}
                <rect x="40" y="40" width="420" height="8" fill={isLight ? '#94A3B8' : '#64748B'} rx="4" />
                <circle cx="40" cy="44" r="8" fill="#D4AF37" />
                <circle cx="460" cy="44" r="8" fill="#D4AF37" />

                {/* Hanging Eyelets */}
                {Array.from({ length: pleatsCount }).map((_, i) => {
                  const xPos = 60 + ((i + 0.5) * 380) / pleatsCount;
                  return (
                    <g key={i}>
                      <circle cx={xPos} cy="44" r="5" fill="none" stroke={isLight ? '#475569' : '#FFFFFF'} strokeWidth="2" />
                    </g>
                  );
                })}

                {/* Left Panel Waves */}
                {Array.from({ length: Math.floor(pleatsCount / 2) }).map((_, i) => {
                  const x1 = 60 + (i * 180) / Math.floor(pleatsCount / 2);
                  const x2 = x1 + 180 / Math.floor(pleatsCount / 2);
                  return (
                    <path
                      key={`left-${i}`}
                      d={`M ${x1} 55 Q ${(x1 + x2) / 2} 70 ${x2} 55 L ${x2} 340 Q ${(x1 + x2) / 2} 355 ${x1} 340 Z`}
                      fill={isLight ? (i % 2 === 0 ? '#E2E8F0' : '#CBD5E1') : (i % 2 === 0 ? '#1E293B' : '#2D3748')}
                      stroke="#D4AF37"
                      strokeWidth="1"
                      opacity="0.9"
                    />
                  );
                })}

                {/* Right Panel Waves */}
                {Array.from({ length: Math.floor(pleatsCount / 2) }).map((_, i) => {
                  const x1 = 260 + (i * 180) / Math.floor(pleatsCount / 2);
                  const x2 = x1 + 180 / Math.floor(pleatsCount / 2);
                  return (
                    <path
                      key={`right-${i}`}
                      d={`M ${x1} 55 Q ${(x1 + x2) / 2} 70 ${x2} 55 L ${x2} 340 Q ${(x1 + x2) / 2} 355 ${x1} 340 Z`}
                      fill={isLight ? (i % 2 === 0 ? '#E2E8F0' : '#CBD5E1') : (i % 2 === 0 ? '#1E293B' : '#2D3748')}
                      stroke="#D4AF37"
                      strokeWidth="1"
                      opacity="0.9"
                    />
                  );
                })}

                {/* Dimension Annotations */}
                <line x1="60" y1="20" x2="440" y2="20" stroke="#38BDF8" strokeWidth="1.5" />
                <line x1="60" y1="14" x2="60" y2="26" stroke="#38BDF8" strokeWidth="1.5" />
                <line x1="440" y1="14" x2="440" y2="26" stroke="#38BDF8" strokeWidth="1.5" />
                <text x="250" y="16" textAnchor="middle" fill="#38BDF8" fontSize="11" fontFamily="monospace" fontWeight="bold">
                  {config.railWidthCm} cm ({Math.round(config.railWidthCm * config.pleatRatio)} cm)
                </text>

                <line x1="465" y1="55" x2="465" y2="340" stroke="#38BDF8" strokeWidth="1.5" />
                <line x1="459" y1="55" x2="471" y2="55" stroke="#38BDF8" strokeWidth="1.5" />
                <line x1="459" y1="340" x2="471" y2="340" stroke="#38BDF8" strokeWidth="1.5" />
                <text x="482" y="195" textAnchor="middle" fill="#38BDF8" fontSize="11" fontFamily="monospace" fontWeight="bold" transform="rotate(90 482 195)">
                  {config.heightCm} cm
                </text>
              </svg>
            </div>

            {/* Feature Badges */}
            <div className="mt-4 grid grid-cols-3 gap-3 text-center text-xs font-mono">
              <div className={`p-2.5 rounded-xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-white/5 border-white/10'}`}>
                <span className={`block text-[10px] ${isLight ? 'text-slate-500' : 'text-zinc-500'}`}>
                  {language === 'ar' ? 'الطول المطلوب:' : language === 'en' ? 'LINEAR FABRIC:' : 'MÉTRAGE LINÉAIRE :'}
                </span>
                <span className="font-bold text-[#D4AF37]">{cost.fabricLinearMeters} m</span>
              </div>
              <div className={`p-2.5 rounded-xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-white/5 border-white/10'}`}>
                <span className={`block text-[10px] ${isLight ? 'text-slate-500' : 'text-zinc-500'}`}>
                  {language === 'ar' ? 'نسبة الأمواج:' : language === 'en' ? 'PLEAT RATIO:' : 'TAUX D’ONDULATION :'}
                </span>
                <span className={`font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>{config.pleatRatio}x</span>
              </div>
              <div className={`p-2.5 rounded-xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-white/5 border-white/10'}`}>
                <span className={`block text-[10px] ${isLight ? 'text-slate-500' : 'text-zinc-500'}`}>
                  {language === 'ar' ? 'تشطيب الرأس:' : language === 'en' ? 'HEADER STYLE:' : 'FINITION TÊTE :'}
                </span>
                <span className="font-bold text-emerald-500">{config.headerType}</span>
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
              <span>{language === 'ar' ? 'خصائص خياطة الستائر' : language === 'en' ? 'Tailoring Parameters' : 'Paramètres de Confection'}</span>
            </h4>

            <div className="flex flex-col gap-3.5 text-xs">
              <div>
                <div className="flex justify-between mb-1">
                  <span className={isLight ? 'text-slate-600' : 'text-zinc-300'}>
                    {language === 'ar' ? 'عرض الترانجل (سم)' : language === 'en' ? 'Rod Width (cm)' : 'Largeur de tringle (cm)'}
                  </span>
                  <span className="font-mono font-bold text-[#D4AF37]">{config.railWidthCm} cm</span>
                </div>
                <input
                  type="range"
                  min="100"
                  max="600"
                  step="10"
                  value={config.railWidthCm}
                  onChange={(e) => {
                    playSlideTick();
                    setConfig({ ...config, railWidthCm: Number(e.target.value) });
                  }}
                  className="w-full accent-[#D4AF37] cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span className={isLight ? 'text-slate-600' : 'text-zinc-300'}>
                    {language === 'ar' ? 'الارتفاع تحت السقف (سم)' : language === 'en' ? 'Drop Height (cm)' : 'Hauteur sous plafond (cm)'}
                  </span>
                  <span className="font-mono font-bold text-[#D4AF37]">{config.heightCm} cm</span>
                </div>
                <input
                  type="range"
                  min="180"
                  max="350"
                  step="5"
                  value={config.heightCm}
                  onChange={(e) => {
                    playSlideTick();
                    setConfig({ ...config, heightCm: Number(e.target.value) });
                  }}
                  className="w-full accent-[#D4AF37] cursor-pointer"
                />
              </div>

              {/* Pleat Ratio Buttons */}
              <div className="pt-2">
                <label className={`block mb-1 ${isLight ? 'text-slate-600' : 'text-zinc-400'}`}>
                  {language === 'ar' ? 'كثافة ونسبة الأمواج' : language === 'en' ? 'Fullness & Pleat Ratio' : 'Ampleur & Taux d’Ondulation'}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { ratio: 1.5, label: '1.5x Standard' },
                    { ratio: 2.0, label: '2.0x Wave' },
                    { ratio: 2.5, label: '2.5x Palace' },
                  ].map((p) => (
                    <button
                      key={p.ratio}
                      onClick={() => {
                        playSwitchSound();
                        setConfig({ ...config, pleatRatio: p.ratio as any });
                      }}
                      className={`py-2 px-2 rounded-xl border text-xs cursor-pointer btn-press ${
                        config.pleatRatio === p.ratio
                          ? 'bg-[#D4AF37]/20 border-[#D4AF37] text-[#D4AF37] font-bold'
                          : isLight
                          ? 'bg-slate-50 border-slate-200 text-slate-600'
                          : 'bg-white/5 border-white/10 text-zinc-400'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Fabric Type Selector */}
              <div className="pt-2">
                <label className={`block mb-1.5 ${isLight ? 'text-slate-600' : 'text-zinc-400'}`}>
                  {language === 'ar' ? 'نوع القماش المختار' : language === 'en' ? 'Fabric Selection' : 'Sélection du Tissu'}
                </label>
                <div className="flex flex-col gap-2">
                  {fabrics.map((f) => (
                    <div
                      key={f.id}
                      onClick={() => {
                        playTactileClick();
                        setConfig({ ...config, fabricType: f.id });
                      }}
                      className={`p-2.5 rounded-xl border ${isRtl ? 'text-right' : 'text-left'} cursor-pointer transition-all btn-press hover-lift ${
                        config.fabricType === f.id
                          ? 'bg-[#D4AF37]/15 border-[#D4AF37] text-white'
                          : isLight
                          ? 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700'
                          : 'bg-white/5 border-white/10 text-zinc-400 hover:text-white'
                      }`}
                    >
                      <div className={`font-semibold text-xs ${isLight ? 'text-slate-900' : 'text-white'}`}>{f.label}</div>
                      <div className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>{f.sub}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Header Type & Lining */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <label className={`block mb-1 ${isLight ? 'text-slate-600' : 'text-zinc-400'}`}>
                    {language === 'ar' ? 'شكل الرأس' : language === 'en' ? 'Header Finish' : 'Finition Tête'}
                  </label>
                  <select
                    value={config.headerType}
                    onChange={(e) => {
                      playSwitchSound();
                      setConfig({ ...config, headerType: e.target.value as any });
                    }}
                    className={`w-full px-3 py-2 rounded-xl border font-mono text-xs focus:outline-none focus:border-[#D4AF37] cursor-pointer ${
                      isLight ? 'bg-slate-50 border-slate-200 text-slate-800' : 'bg-white/5 border-white/10 text-white'
                    }`}
                  >
                    <option value="eyelets_metal" className={isLight ? 'bg-white text-slate-900' : 'bg-[#12151C]'}>Œillets Inox</option>
                    <option value="wave_ruflette" className={isLight ? 'bg-white text-slate-900' : 'bg-[#12151C]'}>Ruflette Wave</option>
                    <option value="pinch_pleat" className={isLight ? 'bg-white text-slate-900' : 'bg-[#12151C]'}>Plis Flamands</option>
                  </select>
                </div>

                <div>
                  <label className={`block mb-1 ${isLight ? 'text-slate-600' : 'text-zinc-400'}`}>
                    {language === 'ar' ? 'البطانة العازلة' : language === 'en' ? 'Thermal Lining' : 'Doublure Isolante'}
                  </label>
                  <button
                    onClick={() => {
                      playSwitchSound();
                      setConfig({ ...config, hasThermalLining: !config.hasThermalLining });
                    }}
                    className={`w-full py-2 px-3 rounded-xl border text-xs cursor-pointer text-center btn-press hover-lift ${
                      config.hasThermalLining
                        ? 'bg-[#D4AF37]/20 border-[#D4AF37] text-[#D4AF37] font-bold'
                        : isLight
                        ? 'bg-slate-50 border-slate-200 text-slate-600'
                        : 'bg-white/5 border-white/10 text-zinc-400'
                    }`}
                  >
                    {config.hasThermalLining ? (language === 'ar' ? 'بطانة مفعلة' : 'Doublure Active') : (language === 'ar' ? 'بدون بطانة' : 'Sans Doublure')}
                  </button>
                </div>
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
                  {language === 'ar' ? 'القماش' : 'Tissu'} ({cost.fabricLinearMeters}m) :
                </span>
                <span className="font-bold">{cost.fabricCostDzd.toLocaleString()} DZD</span>
              </div>
              <div className="flex justify-between">
                <span className={isLight ? 'text-slate-500' : 'text-zinc-400'}>
                  {language === 'ar' ? 'الرَفلت والحلقات' : 'Ruflette & Œillets'} :
                </span>
                <span className="font-bold">{cost.rufletteAndEyeletsDzd.toLocaleString()} DZD</span>
              </div>
              {cost.liningCostDzd > 0 && (
                <div className="flex justify-between">
                  <span className={isLight ? 'text-slate-500' : 'text-zinc-400'}>
                    {language === 'ar' ? 'البطانة العازلة' : 'Doublure thermique'} :
                  </span>
                  <span className="font-bold">{cost.liningCostDzd.toLocaleString()} DZD</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className={isLight ? 'text-slate-500' : 'text-zinc-400'}>
                  {language === 'ar' ? 'الخياطة والأطراف' : 'Confection couture & ourlets'} :
                </span>
                <span className="font-bold">{cost.tailoringLaborDzd.toLocaleString()} DZD</span>
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
                <span>{language === 'ar' ? 'طلب كشف خياطة وستائر عبر واتساب' : language === 'en' ? 'Curtains Quote on WhatsApp' : 'Devis Confection sur WhatsApp'}</span>
              </button>

              <button
                onClick={generateTapestryPdf}
                className={`w-full py-2.5 rounded-xl border font-medium text-xs flex items-center justify-center gap-2 transition-all cursor-pointer btn-press hover-lift ${
                  isLight
                    ? 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-800'
                    : 'bg-white/10 hover:bg-white/15 border-white/15 text-white'
                }`}
              >
                <FileDown className="w-4 h-4 text-[#D4AF37]" />
                <span>{language === 'ar' ? 'تحميل بطاقة الخياطة والتفصيل PDF' : language === 'en' ? 'Download Tailoring PDF' : 'Télécharger Fiche Confection PDF'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
