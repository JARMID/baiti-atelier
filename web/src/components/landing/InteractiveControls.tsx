import React, { useState } from 'react';
import { useConfigStore } from '../../store/configStore';
import type { FinishColor, GlassType, OpeningType, ProfileSystem, ShutterType } from '../../types/window';
import { getTranslation } from '../../utils/i18n';
import { playSlideTick, playTactileClick, playSwitchSound } from '../../utils/audioFeedback';
import { ChevronDown, ChevronUp, MessageCircle, FileText, Check, Sliders } from 'lucide-react';

export const InteractiveControls: React.FC = () => {
  const {
    config,
    cost,
    language,
    theme,
    setWidth,
    setHeight,
    setOpeningType,
    setProfileSystem,
    setFinishColor,
    setGlassType,
    setShutterType,
    applyPreset,
    setQuoteModalOpen,
    setMaterialMarketOpen,
  } = useConfigStore();

  const t = getTranslation(language);
  const isRtl = language === 'ar';
  const isLight = theme === 'light';

  const [activeTab, setActiveTab] = useState<'dims' | 'type' | 'finish' | 'glass'>('dims');
  const [showCostBreakdown, setShowCostBreakdown] = useState(false);

  const getOpeningDesc = (id: OpeningType) => {
    if (language === 'ar') {
      switch (id) {
        case 'sliding_2':
          return 'توفير مساحة، مثالي للصالات والشرفات';
        case 'sliding_3':
          return 'فتحة بانورامية واسعة 3 سكك';
        case 'casement_1':
          return 'عزل هوائي وصوتي محكم درفة واحدة';
        case 'casement_2':
          return 'فتح تقليدي درفتين متقابلتين';
        case 'tilt_turn':
          return 'تهوية آمنة مع حماية من السقوط';
        case 'fixed':
          return 'إطلالة زجاجية نقية بدون فتح';
      }
    }
    if (language === 'en') {
      switch (id) {
        case 'sliding_2':
          return 'Space saving, ideal for balconies and living rooms';
        case 'sliding_3':
          return 'Wide panoramic 3-track sliding opening';
        case 'casement_1':
          return 'Maximum thermal and acoustic air tightness';
        case 'casement_2':
          return 'Classic French double casement opening';
        case 'tilt_turn':
          return 'Secure tilt ventilation and night latch';
        case 'fixed':
          return 'Unobstructed daylight picture frame';
      }
    }
    switch (id) {
      case 'sliding_2':
        return 'Gain d’espace, idéal balcons et séjours';
      case 'sliding_3':
        return 'Grande ouverture panoramique';
      case 'casement_1':
        return 'Étanchéité thermique et acoustique maximale';
      case 'casement_2':
        return 'Ouverture classique à la française';
      case 'tilt_turn':
        return 'Aération sécurisée par basculement haut';
      case 'fixed':
        return 'Vue panoramique pure sans montant ouvrant';
    }
  };

  const getProfileTag = (id: ProfileSystem) => {
    if (language === 'ar') {
      switch (id) {
        case 'gamme_45_thermal':
          return 'موصى به';
        case 'gamme_40':
          return 'اقتصادي';
        case 'gamme_67_slide':
          return 'مقوى ثقيل';
        case 'pvc_70_chamber':
          return 'عزل صوتي';
      }
    }
    if (language === 'en') {
      switch (id) {
        case 'gamme_45_thermal':
          return 'Recommended';
        case 'gamme_40':
          return 'Budget';
        case 'gamme_67_slide':
          return 'Heavy-Duty';
        case 'pvc_70_chamber':
          return 'Acoustic';
      }
    }
    switch (id) {
      case 'gamme_45_thermal':
        return 'Recommandé';
      case 'gamme_40':
        return 'Éco';
      case 'gamme_67_slide':
        return 'Lourd';
      case 'pvc_70_chamber':
        return 'Acoustique';
    }
  };

  const getGlassNote = (id: GlassType) => {
    if (language === 'ar') {
      switch (id) {
        case 'double_clear':
          return 'عزل حراري قياسي';
        case 'stop_sol':
          return 'حماية من الشمس وحفظ الخصوصية';
        case 'sable':
          return 'معتم للحمامات والمطابخ';
        case 'double_argon_warmedge':
          return 'غاز آرغون عالي العزل الحراري';
        case 'phonique_stadip':
          return 'عزل صوتي فائق 38 ديسيبل';
        case 'securit_tempered':
          return 'زجاج سيكوريت مقاوم للصدمات';
        case 'simple_clear':
          return 'للاستعمال الداخلي فقط';
      }
    }
    if (language === 'en') {
      switch (id) {
        case 'double_clear':
          return 'Standard thermal insulation';
        case 'stop_sol':
          return 'Solar heat control and daytime privacy';
        case 'sable':
          return 'Frosted obscurity for bathrooms';
        case 'double_argon_warmedge':
          return 'Argon 90% high thermal performance';
        case 'phonique_stadip':
          return 'Superior acoustic barrier 38dB';
        case 'securit_tempered':
          return 'Toughened tempered impact safety';
        case 'simple_clear':
          return 'Interior divider use only';
      }
    }
    switch (id) {
      case 'double_clear':
        return 'Isolation thermique standard';
      case 'stop_sol':
        return 'Protection solaire et intimité';
      case 'sable':
        return 'Intimité sdb et buanderie';
      case 'double_argon_warmedge':
        return 'Argon 90% haute performance thermique';
      case 'phonique_stadip':
        return 'Affaiblissement acoustique 38 dB';
      case 'securit_tempered':
        return 'Verre trempé sécurité anti-choc';
      case 'simple_clear':
        return 'Usage intérieur ou atelier';
    }
  };

  const OPENING_OPTIONS: { id: OpeningType; label: string; desc: string }[] = [
    { id: 'sliding_2', label: t.sliding_2, desc: getOpeningDesc('sliding_2') },
    { id: 'sliding_3', label: t.sliding_3, desc: getOpeningDesc('sliding_3') },
    { id: 'casement_1', label: t.casement_1, desc: getOpeningDesc('casement_1') },
    { id: 'casement_2', label: t.casement_2, desc: getOpeningDesc('casement_2') },
    { id: 'tilt_turn', label: t.tilt_turn, desc: getOpeningDesc('tilt_turn') },
    { id: 'fixed', label: t.fixed, desc: getOpeningDesc('fixed') },
  ];

  const PROFILE_OPTIONS: { id: ProfileSystem; label: string; tag: string }[] = [
    { id: 'gamme_45_thermal', label: t.gamme_45_thermal, tag: getProfileTag('gamme_45_thermal') },
    { id: 'gamme_40', label: t.gamme_40, tag: getProfileTag('gamme_40') },
    { id: 'gamme_67_slide', label: t.gamme_67_slide, tag: getProfileTag('gamme_67_slide') },
    { id: 'pvc_70_chamber', label: t.pvc_70_chamber, tag: getProfileTag('pvc_70_chamber') },
  ];

  const COLOR_OPTIONS: { id: FinishColor; label: string; bg: string; border: string }[] = [
    { id: 'ral_7016', label: t.ral_7016, bg: '#272B33', border: '#3F4450' },
    { id: 'ral_9016', label: t.ral_9016, bg: '#F1F3F5', border: '#CBD5E1' },
    { id: 'ral_9005', label: t.ral_9005, bg: '#131418', border: '#2D3139' },
    { id: 'faux_bois', label: t.faux_bois, bg: '#784622', border: '#965A2E' },
    { id: 'faux_bois_noyer', label: t.faux_bois_noyer, bg: '#451A03', border: '#602206' },
    { id: 'bronze_ano', label: t.bronze_ano, bg: '#6A5641', border: '#8A7258' },
    { id: 'argent_ano', label: t.argent_ano, bg: '#94A3B8', border: '#CBD5E1' },
  ];

  const GLASS_OPTIONS: { id: GlassType; label: string; note: string }[] = [
    { id: 'double_clear', label: t.double_clear, note: getGlassNote('double_clear') },
    { id: 'double_argon_warmedge', label: t.double_argon_warmedge, note: getGlassNote('double_argon_warmedge') },
    { id: 'phonique_stadip', label: t.phonique_stadip, note: getGlassNote('phonique_stadip') },
    { id: 'stop_sol', label: t.stop_sol, note: getGlassNote('stop_sol') },
    { id: 'sable', label: t.sable, note: getGlassNote('sable') },
    { id: 'securit_tempered', label: t.securit_tempered, note: getGlassNote('securit_tempered') },
    { id: 'simple_clear', label: t.simple_clear, note: getGlassNote('simple_clear') },
  ];

  const SHUTTER_OPTIONS: { id: ShutterType; label: string }[] = [
    { id: 'none', label: t.none },
    { id: 'manual', label: t.manual },
    { id: 'motorized', label: t.motorized },
  ];

  const openWhatsAppInquiry = () => {
    const text = isRtl
      ? encodeURIComponent(
          `السلام عليكم، أود الحصول على كشف حساب (دوفيز) لنجارة ألمنيوم :\n` +
          `• الأبعاد: ${config.width} ملم x ${config.height} ملم\n` +
          `• التكلفة التقديرية: ${cost.totalEstimatedDzd.toLocaleString('fr-DZ')} دج.`
        )
      : language === 'en'
      ? encodeURIComponent(
          `Hello, I would like an official quote for joinery:\n` +
          `• Type: ${config.openingType}\n` +
          `• Dimensions: ${config.width} mm x ${config.height} mm\n` +
          `• Profile: ${config.profileSystem}\n` +
          `• Indicative estimate: ${cost.totalEstimatedDzd.toLocaleString()} DZD.`
        )
      : encodeURIComponent(
          `Bonjour, je souhaite un devis pour une menuiserie :\n` +
          `• Type: ${config.openingType}\n` +
          `• Dimensions: ${config.width} mm x ${config.height} mm\n` +
          `• Profilé: ${config.profileSystem}\n` +
          `• Estimation indicative: ${cost.totalEstimatedDzd.toLocaleString()} DZD.`
        );
    window.open(`https://wa.me/213555000000?text=${text}`, '_blank');
  };

  const rangeText =
    language === 'ar'
      ? 'المجال المعتاد:'
      : language === 'en'
      ? 'Typical market range:'
      : 'Fourchette constatée :';

  const detailsBtnText =
    language === 'ar' ? 'التفاصيل' : language === 'en' ? 'Breakdown' : 'Détails';

  const footnoteText =
    language === 'ar'
      ? '* حساب مبني على الأسعار المتوسطة للورشات ومصانع الزجاج بالجزائر'
      : language === 'en'
      ? '* Calculation calibrated against average extrusion and glass rates in Algeria'
      : '* Calcul basé sur les cours moyens des gammistes et miroiteries en Algérie.';

  const waBtnText =
    language === 'ar' ? 'طلب عبر واتساب' : language === 'en' ? 'WhatsApp Quote' : 'WhatsApp Devis';

  const quoteBtnText =
    language === 'ar' ? 'كشف حساب رسمي' : language === 'en' ? 'Formal Quote' : 'Devis Formel';

  const tabNames = {
    dims: language === 'ar' ? 'القياسات' : language === 'en' ? 'Dimensions' : 'Dimensions',
    type: language === 'ar' ? 'نظام الفتح' : language === 'en' ? 'Opening' : 'Ouverture',
    finish: language === 'ar' ? 'الألوان' : language === 'en' ? 'Colors' : 'Couleur',
    glass: language === 'ar' ? 'الزجاج والستار' : language === 'en' ? 'Glass & Shutter' : 'Vitrage & Volet',
  };

  const presetsHeader =
    language === 'ar'
      ? 'المقاسات الأكثر طلباً في الجزائر'
      : language === 'en'
      ? 'Standard Algerian Architectural Openings'
      : 'Dimensions Standards Algérie';

  return (
    <div className="flex flex-col h-full gap-5" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Live Estimate Card Header */}
      <div
        className={`p-5 rounded-2xl border relative overflow-hidden transition-all duration-300 shadow-xl ${
          isLight
            ? 'bg-white/95 border-slate-200 text-slate-900 shadow-slate-200/60'
            : 'bg-[#0E121C]/90 border-white/10 text-white shadow-black/50'
        }`}
      >
        <div className="absolute -right-10 -bottom-10 w-36 h-36 bg-[#D4AF37]/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-start justify-between">
          <div>
            <span className="text-[11px] uppercase tracking-wider text-[#D4AF37] font-mono font-semibold">
              {t.priceEstimateTitle}
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-bold tracking-tight font-mono">
                {cost.totalEstimatedDzd.toLocaleString()}
              </span>
              <span className={`text-sm font-semibold ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
                DZD
              </span>
            </div>
            <p className={`text-xs mt-0.5 ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
              {rangeText} {cost.minRangeDzd.toLocaleString()} - {cost.maxRangeDzd.toLocaleString()} DZD
            </p>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => {
                playTactileClick();
                setMaterialMarketOpen(true);
              }}
              className={`px-2.5 py-1.5 text-xs rounded-lg border flex items-center gap-1.5 transition-colors cursor-pointer btn-press ${
                isLight
                  ? 'bg-emerald-50 hover:bg-emerald-100 border-emerald-200 text-emerald-800'
                  : 'bg-emerald-500/10 hover:bg-emerald-500/20 border-emerald-500/30 text-emerald-300'
              }`}
              title="Calibrer les coefficients d’achat et la marge de l’atelier"
            >
              <Sliders className="w-3.5 h-3.5 text-emerald-500" />
              <span className="hidden sm:inline font-mono">
                {language === 'ar' ? 'معايرة' : language === 'en' ? 'Calibrate' : 'Calibrer'}
              </span>
            </button>

            <button
              onClick={() => {
                playSwitchSound();
                setShowCostBreakdown(!showCostBreakdown);
              }}
              className={`p-2 text-xs rounded-lg border flex items-center gap-1 transition-colors cursor-pointer btn-press ${
                isLight
                  ? 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700'
                  : 'bg-white/5 hover:bg-white/10 border-white/10 text-zinc-400 hover:text-white'
              }`}
            >
              <span>{detailsBtnText}</span>
              {showCostBreakdown ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Expandable Cost Breakdown */}
        {showCostBreakdown && (
          <div
            className={`mt-4 pt-4 border-t text-xs flex flex-col gap-2 font-mono ${
              isLight ? 'border-slate-200 text-slate-700' : 'border-white/10 text-zinc-300'
            }`}
          >
            <div className="flex justify-between">
              <span className={isLight ? 'text-slate-500' : 'text-zinc-400'}>
                {t.profilesCost} ({cost.profileWeightKg} kg / {cost.profileLengthMeters}m) :
              </span>
              <span>{cost.profileCostDzd.toLocaleString()} DZD</span>
            </div>
            <div className="flex justify-between">
              <span className={isLight ? 'text-slate-500' : 'text-zinc-400'}>
                {t.glassCost} ({cost.glassAreaM2} m²) :
              </span>
              <span>{cost.glassCostDzd.toLocaleString()} DZD</span>
            </div>
            <div className="flex justify-between">
              <span className={isLight ? 'text-slate-500' : 'text-zinc-400'}>{t.hardwareCost} :</span>
              <span>{cost.hardwareCostDzd.toLocaleString()} DZD</span>
            </div>
            {cost.shutterCostDzd > 0 && (
              <div className="flex justify-between text-amber-500 font-semibold">
                <span>{t.shutterCost} :</span>
                <span>{cost.shutterCostDzd.toLocaleString()} DZD</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className={isLight ? 'text-slate-500' : 'text-zinc-400'}>{t.laborCost} :</span>
              <span>{cost.laborCostDzd.toLocaleString()} DZD</span>
            </div>
            <p className={`text-[10px] pt-1 font-sans ${isLight ? 'text-slate-400' : 'text-zinc-500'}`}>
              {footnoteText}
            </p>
          </div>
        )}

        {/* Primary Call to Actions */}
        <div className="grid grid-cols-2 gap-2.5 mt-4 pt-1">
          <button
            onClick={() => {
              playTactileClick();
              openWhatsAppInquiry();
            }}
            className="w-full py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs flex items-center justify-center gap-1.5 transition-all shadow-lg shadow-emerald-900/30 cursor-pointer btn-press hover-lift"
          >
            <MessageCircle className="w-4 h-4" />
            <span>{waBtnText}</span>
          </button>

          <button
            onClick={() => {
              playTactileClick();
              setQuoteModalOpen(true);
            }}
            className="w-full py-2.5 px-3 rounded-xl bg-[#D4AF37] hover:bg-[#C5A880] text-black font-semibold text-xs flex items-center justify-center gap-1.5 transition-all shadow-lg shadow-[#D4AF37]/20 cursor-pointer btn-press hover-lift"
          >
            <FileText className="w-4 h-4" />
            <span>{quoteBtnText}</span>
          </button>
        </div>
      </div>

      {/* Control Navigation Tabs */}
      <div
        className={`flex items-center p-1 rounded-xl border text-xs ${
          isLight ? 'bg-slate-100 border-slate-200' : 'bg-black/40 border-white/10'
        }`}
      >
        {(['dims', 'type', 'finish', 'glass'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => {
              playSwitchSound();
              setActiveTab(tab);
            }}
            className={`flex-1 py-2 rounded-lg font-medium transition-all cursor-pointer btn-press ${
              activeTab === tab
                ? isLight
                  ? 'bg-white text-slate-900 shadow-sm border border-slate-200 font-bold'
                  : 'bg-white/10 text-white shadow-sm font-bold'
                : isLight
                ? 'text-slate-500 hover:text-slate-900'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            {tabNames[tab]}
          </button>
        ))}
      </div>

      {/* Tab Panels */}
      <div
        className={`p-5 rounded-2xl border flex-1 overflow-y-auto max-h-[380px] flex flex-col gap-4 ${
          isLight
            ? 'bg-white/90 border-slate-200 shadow-sm'
            : 'bg-[#0E121C]/80 border-white/10'
        }`}
      >
        {activeTab === 'dims' && (
          <div className="flex flex-col gap-4">
            <div>
              <div className="flex justify-between items-center text-xs mb-1.5">
                <span className={`font-medium ${isLight ? 'text-slate-700' : 'text-zinc-300'}`}>
                  {t.widthLabel}
                </span>
                <span className="font-mono text-[#D4AF37] bg-[#D4AF37]/10 px-2 py-0.5 rounded border border-[#D4AF37]/20 font-semibold">
                  {config.width} mm
                </span>
              </div>
              <input
                type="range"
                min="600"
                max="2800"
                step="10"
                value={config.width}
                onChange={(e) => {
                  setWidth(Number(e.target.value));
                  playSlideTick();
                }}
                className="w-full accent-[#D4AF37] cursor-pointer"
              />
              <div
                className={`flex justify-between text-[10px] font-mono mt-0.5 ${
                  isLight ? 'text-slate-400' : 'text-zinc-500'
                }`}
              >
                <span>600 mm</span>
                <span>1800 mm</span>
                <span>2800 mm</span>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center text-xs mb-1.5">
                <span className={`font-medium ${isLight ? 'text-slate-700' : 'text-zinc-300'}`}>
                  {t.heightLabel}
                </span>
                <span className="font-mono text-[#D4AF37] bg-[#D4AF37]/10 px-2 py-0.5 rounded border border-[#D4AF37]/20 font-semibold">
                  {config.height} mm
                </span>
              </div>
              <input
                type="range"
                min="500"
                max="2400"
                step="10"
                value={config.height}
                onChange={(e) => {
                  setHeight(Number(e.target.value));
                  playSlideTick();
                }}
                className="w-full accent-[#D4AF37] cursor-pointer"
              />
              <div
                className={`flex justify-between text-[10px] font-mono mt-0.5 ${
                  isLight ? 'text-slate-400' : 'text-zinc-500'
                }`}
              >
                <span>500 mm</span>
                <span>1400 mm</span>
                <span>2400 mm</span>
              </div>
            </div>

            <div className="pt-2">
              <span className={`text-[11px] font-medium block mb-2 ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
                {presetsHeader}
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    playTactileClick();
                    applyPreset({ width: 1200, height: 1400, openingType: 'sliding_2' });
                  }}
                  className={`p-2.5 rounded-xl border ${isRtl ? 'text-right' : 'text-left'} text-xs transition-all cursor-pointer btn-press hover-lift ${
                    isLight
                      ? 'bg-slate-50 hover:bg-slate-100 border-slate-200'
                      : 'bg-white/5 hover:bg-white/10 border-white/5'
                  }`}
                >
                  <span className={`font-semibold block ${isLight ? 'text-slate-800' : 'text-zinc-200'}`}>
                    {language === 'ar' ? 'صالون / معيشة' : language === 'en' ? 'Living Room' : 'Salon / Séjour'}
                  </span>
                  <span className={`text-[10px] font-mono ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
                    1200 × 1400 mm
                  </span>
                </button>

                <button
                  onClick={() => {
                    playTactileClick();
                    applyPreset({ width: 1600, height: 2150, openingType: 'sliding_2' });
                  }}
                  className={`p-2.5 rounded-xl border ${isRtl ? 'text-right' : 'text-left'} text-xs transition-all cursor-pointer btn-press hover-lift ${
                    isLight
                      ? 'bg-slate-50 hover:bg-slate-100 border-slate-200'
                      : 'bg-white/5 hover:bg-white/10 border-white/5'
                  }`}
                >
                  <span className={`font-semibold block ${isLight ? 'text-slate-800' : 'text-zinc-200'}`}>
                    {language === 'ar' ? 'باب شرفة' : language === 'en' ? 'Balcony Door' : 'Porte Balcon'}
                  </span>
                  <span className={`text-[10px] font-mono ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
                    1600 × 2150 mm
                  </span>
                </button>

                <button
                  onClick={() => {
                    playTactileClick();
                    applyPreset({ width: 1000, height: 1200, openingType: 'casement_1' });
                  }}
                  className={`p-2.5 rounded-xl border ${isRtl ? 'text-right' : 'text-left'} text-xs transition-all cursor-pointer btn-press hover-lift ${
                    isLight
                      ? 'bg-slate-50 hover:bg-slate-100 border-slate-200'
                      : 'bg-white/5 hover:bg-white/10 border-white/5'
                  }`}
                >
                  <span className={`font-semibold block ${isLight ? 'text-slate-800' : 'text-zinc-200'}`}>
                    {language === 'ar' ? 'نافذة غرفة' : language === 'en' ? 'Bedroom Window' : 'Chambre Battante'}
                  </span>
                  <span className={`text-[10px] font-mono ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
                    1000 × 1200 mm
                  </span>
                </button>

                <button
                  onClick={() => {
                    playTactileClick();
                    applyPreset({ width: 600, height: 500, openingType: 'tilt_turn', glassType: 'sable' });
                  }}
                  className={`p-2.5 rounded-xl border ${isRtl ? 'text-right' : 'text-left'} text-xs transition-all cursor-pointer btn-press hover-lift ${
                    isLight
                      ? 'bg-slate-50 hover:bg-slate-100 border-slate-200'
                      : 'bg-white/5 hover:bg-white/10 border-white/5'
                  }`}
                >
                  <span className={`font-semibold block ${isLight ? 'text-slate-800' : 'text-zinc-200'}`}>
                    {language === 'ar' ? 'حمام / مطبخ' : language === 'en' ? 'Bathroom Vent' : 'Sanitaire / Sdb'}
                  </span>
                  <span className={`text-[10px] font-mono ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
                    600 × 500 mm
                  </span>
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'type' && (
          <div className="flex flex-col gap-4">
            <div>
              <span className={`text-[11px] font-medium block mb-2 ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
                {t.openingTypeLabel}
              </span>
              <div className="flex flex-col gap-1.5">
                {OPENING_OPTIONS.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => {
                      playTactileClick();
                      setOpeningType(opt.id);
                    }}
                    className={`w-full p-2.5 rounded-xl border ${isRtl ? 'text-right' : 'text-left'} flex items-center justify-between transition-all cursor-pointer btn-press hover-lift ${
                      config.openingType === opt.id
                        ? 'bg-[#D4AF37]/15 border-[#D4AF37] shadow-sm'
                        : isLight
                        ? 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                        : 'bg-white/5 border-white/5 text-zinc-300 hover:bg-white/10'
                    }`}
                  >
                    <div>
                      <span className={`text-xs font-semibold block ${isLight ? 'text-slate-900' : 'text-white'}`}>
                        {opt.label}
                      </span>
                      <span className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
                        {opt.desc}
                      </span>
                    </div>
                    {config.openingType === opt.id && <Check className="w-4 h-4 text-[#D4AF37] shrink-0" />}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2">
              <span className={`text-[11px] font-medium block mb-2 ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
                {t.profileSystemLabel}
              </span>
              <div className="grid grid-cols-2 gap-2">
                {PROFILE_OPTIONS.map((prof) => (
                  <button
                    key={prof.id}
                    onClick={() => {
                      playTactileClick();
                      setProfileSystem(prof.id);
                    }}
                    className={`p-2.5 rounded-xl border ${isRtl ? 'text-right' : 'text-left'} transition-all cursor-pointer btn-press hover-lift ${
                      config.profileSystem === prof.id
                        ? 'bg-[#D4AF37]/15 border-[#D4AF37]'
                        : isLight
                        ? 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                        : 'bg-white/5 border-white/5 hover:bg-white/10'
                    }`}
                  >
                    <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-[#D4AF37]/15 text-[#D4AF37] inline-block mb-1 font-semibold">
                      {prof.tag}
                    </span>
                    <span className={`text-xs font-medium block ${isLight ? 'text-slate-900' : 'text-white'}`}>
                      {prof.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'finish' && (
          <div className="flex flex-col gap-3">
            <span className={`text-[11px] font-medium block ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
              {t.finishColorLabel}
            </span>
            <div className="flex flex-col gap-2">
              {COLOR_OPTIONS.map((col) => (
                <button
                  key={col.id}
                  onClick={() => {
                    playTactileClick();
                    setFinishColor(col.id);
                  }}
                  className={`w-full p-2.5 rounded-xl border flex items-center gap-3 transition-all cursor-pointer btn-press hover-lift ${
                    config.finishColor === col.id
                      ? 'bg-[#D4AF37]/15 border-[#D4AF37] shadow-sm'
                      : isLight
                      ? 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                      : 'bg-white/5 border-white/5 text-zinc-300 hover:bg-white/10'
                  }`}
                >
                  <div
                    className="w-7 h-7 rounded-lg shrink-0 shadow-inner"
                    style={{ backgroundColor: col.bg, border: `1.5px solid ${col.border}` }}
                  />
                  <div className={`flex-1 ${isRtl ? 'text-right' : 'text-left'}`}>
                    <span className={`text-xs font-medium block ${isLight ? 'text-slate-900' : 'text-white'}`}>
                      {col.label}
                    </span>
                  </div>
                  {config.finishColor === col.id && <Check className="w-4 h-4 text-[#D4AF37] shrink-0" />}
                </button>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'glass' && (
          <div className="flex flex-col gap-4">
            <div>
              <span className={`text-[11px] font-medium block mb-2 ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
                {t.glassTypeLabel}
              </span>
              <div className="flex flex-col gap-1.5">
                {GLASS_OPTIONS.map((g) => (
                  <button
                    key={g.id}
                    onClick={() => {
                      playTactileClick();
                      setGlassType(g.id);
                    }}
                    className={`w-full p-2.5 rounded-xl border ${isRtl ? 'text-right' : 'text-left'} flex items-center justify-between transition-all cursor-pointer btn-press hover-lift ${
                      config.glassType === g.id
                        ? 'bg-[#D4AF37]/15 border-[#D4AF37]'
                        : isLight
                        ? 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                        : 'bg-white/5 border-white/5 hover:bg-white/10'
                    }`}
                  >
                    <div>
                      <span className={`text-xs font-semibold block ${isLight ? 'text-slate-900' : 'text-white'}`}>
                        {g.label}
                      </span>
                      <span className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
                        {g.note}
                      </span>
                    </div>
                    {config.glassType === g.id && <Check className="w-4 h-4 text-[#D4AF37] shrink-0" />}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2">
              <span className={`text-[11px] font-medium block mb-2 ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
                {t.shutterTypeLabel}
              </span>
              <div className="grid grid-cols-3 gap-1.5">
                {SHUTTER_OPTIONS.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => {
                      playTactileClick();
                      setShutterType(s.id);
                    }}
                    className={`py-2 px-2 rounded-xl border text-center text-xs font-medium transition-all cursor-pointer btn-press hover-lift ${
                      config.shutterType === s.id
                        ? 'bg-[#D4AF37]/15 border-[#D4AF37] font-bold'
                        : isLight
                        ? 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700'
                        : 'bg-white/5 border-white/5 text-zinc-400 hover:bg-white/10'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
