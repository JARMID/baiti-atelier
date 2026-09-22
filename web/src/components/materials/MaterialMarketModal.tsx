import React, { useState } from 'react';
import { useConfigStore } from '../../store/configStore';
import {
  ALGERIAN_MATERIAL_SPOT_DATA,
  type MaterialSpotItem,
  type WorkshopMarginCalibration,
} from '../../utils/materialMarketData';
import {
  X,
  TrendingUp,
  TrendingDown,
  Minus,
  Sliders,
  RotateCcw,
  Check,
  Building2,
  Package,
  Layers,
  ShieldAlert,
  Percent,
  Calculator,
} from 'lucide-react';
import {
  playTactileClick,
  playSwitchSound,
  playSlideTick,
  playClampSound,
} from '../../utils/audioFeedback';

interface MaterialMarketModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type FilterCategory = 'all' | 'aluminum' | 'glass' | 'wood' | 'metal' | 'hardware';

export const MaterialMarketModal: React.FC<MaterialMarketModalProps> = ({ isOpen, onClose }) => {
  const {
    calibration,
    setCalibration,
    resetCalibration,
    language,
    theme,
  } = useConfigStore();

  const isLight = theme === 'light';
  const isRtl = language === 'ar';

  const [activeCategory, setActiveCategory] = useState<FilterCategory>('all');
  const [activeTab, setActiveTab] = useState<'bourse' | 'calibrator'>('bourse');
  const [tempCalibration, setTempCalibration] = useState<WorkshopMarginCalibration>(calibration);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const filteredItems = ALGERIAN_MATERIAL_SPOT_DATA.filter((item) => {
    if (activeCategory === 'all') return true;
    return item.category === activeCategory;
  });

  const handleApplyPreset = (preset: 'wholesale' | 'standard' | 'south') => {
    playSwitchSound();
    if (preset === 'wholesale') {
      setTempCalibration((prev) => ({
        ...prev,
        aluminumPriceMultiplier: 0.94,
        glassPriceMultiplier: 0.95,
        woodPriceMultiplier: 0.93,
        metalPriceMultiplier: 0.95,
        workshopTargetMarginPercent: 20,
        artisanHourlyRateDzd: 1800,
      }));
    } else if (preset === 'standard') {
      setTempCalibration((prev) => ({
        ...prev,
        aluminumPriceMultiplier: 1.0,
        glassPriceMultiplier: 1.0,
        woodPriceMultiplier: 1.0,
        metalPriceMultiplier: 1.0,
        workshopTargetMarginPercent: 22,
        artisanHourlyRateDzd: 1800,
      }));
    } else if (preset === 'south') {
      setTempCalibration((prev) => ({
        ...prev,
        aluminumPriceMultiplier: 1.12,
        glassPriceMultiplier: 1.15,
        woodPriceMultiplier: 1.10,
        metalPriceMultiplier: 1.12,
        workshopTargetMarginPercent: 26,
        artisanHourlyRateDzd: 2200,
      }));
    }
  };

  const handleSave = () => {
    playClampSound();
    setCalibration(tempCalibration);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
    }, 2000);
  };

  const handleReset = () => {
    playTactileClick();
    resetCalibration();
    setTempCalibration({
      aluminumPriceMultiplier: 1.0,
      glassPriceMultiplier: 1.0,
      woodPriceMultiplier: 1.0,
      metalPriceMultiplier: 1.0,
      workshopTargetMarginPercent: 22,
      artisanHourlyRateDzd: 1800,
      lastCalibratedAt: new Date().toISOString(),
    });
  };

  const t = {
    title: {
      fr: 'Bourse des Matières Premières & Calibrateur Atelier Algérie',
      ar: 'بورصة المواد الأولية ومقاطع الورشات بالجزائر',
      en: 'Algerian Raw Materials Bourse & Workshop Calibrator',
    }[language],
    subtitle: {
      fr: 'Indices de cours réels des usines algériennes (TPR, Cevital MFG, Sider El Hadjar, Profilor) et ajustement de vos marges réelles.',
      ar: 'أسعار المصانع الجزائرية (TPR، سيفيتال MFG، الحجار، بروفيلور) وضبط هوامش ربح الورشة بدقة.',
      en: 'Actual spot indices from Algerian plants (TPR, Cevital MFG, Sider El Hadjar, Profilor) and live workshop margin calibration.',
    }[language],
    tabs: {
      bourse: { fr: 'Bourse des Prix Spot (DZD)', ar: 'أسعار البورصة الحالية (دج)', en: 'Spot Prices Bourse (DZD)' }[language],
      calibrator: { fr: 'Calibrateur de Marges Atelier', ar: 'مُعاير تكاليف وهوامش الورشة', en: 'Workshop Margin Calibrator' }[language],
    },
    categories: {
      all: { fr: 'Tous les Matériaux', ar: 'كل المواد', en: 'All Materials' }[language],
      aluminum: { fr: 'Aluminium (TPR / Profilor)', ar: 'ألمنيوم (TPR / بروفيلور)', en: 'Aluminum' }[language],
      glass: { fr: 'Vitrerie (MFG Cevital)', ar: 'زجاج (سيفيتال MFG)', en: 'Glazing' }[language],
      wood: { fr: 'Bois & MDF Panneaux', ar: 'خشب وألواح MDF', en: 'Wood & MDF' }[language],
      metal: { fr: 'Ferronnerie & Acier', ar: 'حدادة وفولاذ', en: 'Wrought Iron & Steel' }[language],
      hardware: { fr: 'Quincaillerie & Moteurs', ar: 'إكسسوارات ومحركات', en: 'Hardware' }[language],
    },
    presets: {
      title: { fr: 'Préréglages Régionaux Rapides :', ar: 'إعدادات مسبقة حسب المنطقة :', en: 'Quick Regional Presets:' }[language],
      wholesale: { fr: 'Grossiste Alger / Oran (-6%)', ar: 'سعر الجملة الجزائر / وهران (-6%)', en: 'Wholesale Algiers / Oran (-6%)' }[language],
      standard: { fr: 'Moyenne Nationale 58 Wilayas', ar: 'المعدل الوطني 58 ولاية', en: 'National Average 58 Wilayas' }[language],
      south: { fr: 'Sud & Hauts-Plateaux (+12% Fret)', ar: 'الجنوب والهضاب (+12% شحن)', en: 'South & High Plateaus (+12% Freight)' }[language],
    },
    labels: {
      aluMult: { fr: 'Coefficient Achat Aluminium', ar: 'معامل شراء مقاطع الألمنيوم', en: 'Aluminum Purchase Coefficient' }[language],
      glassMult: { fr: 'Coefficient Achat Verre', ar: 'معامل شراء الزجاج والمضاعف', en: 'Glass Purchase Coefficient' }[language],
      woodMult: { fr: 'Coefficient Achat Panneaux Bois', ar: 'معامل شراء ألواح الخشب', en: 'Wood Panels Coefficient' }[language],
      metalMult: { fr: 'Coefficient Achat Profilés Acier', ar: 'معامل شراء قضبان الفولاذ', en: 'Steel Sections Coefficient' }[language],
      marginPct: { fr: 'Marge Nette Atelier Visée (%)', ar: 'نسبة هامش ربح الورشة الصافي (%)', en: 'Target Workshop Net Margin (%)' }[language],
      hourlyRate: { fr: 'Taux Horaire Main d’Œuvre (DZD/h)', ar: 'تكلفة ساعة اليد العاملة (دج/ساعة)', en: 'Hourly Labor Rate (DZD/h)' }[language],
      saveBtn: { fr: 'Appliquer & Recalculer les Devis', ar: 'تطبيق وإعادة حساب عروض الأسعار', en: 'Apply & Recalculate Quotes' }[language],
      saved: { fr: 'Tarifs Calibrés Enregistrés !', ar: 'تم حفظ وتطبيق التكاليف بنجاح !', en: 'Calibrated Tariffs Saved!' }[language],
      resetBtn: { fr: 'Rétablir Défauts', ar: 'استرجاع الافتراضي', en: 'Reset to Defaults' }[language],
      notice: {
        fr: 'Les prix spot sont basés sur les bordereaux des distributeurs agréés en Algérie. Vos coefficients sont appliqués instantanément à l’ensemble des modules 3D, CAO et Devis.',
        ar: 'تستند الأسعار إلى كشوفات الموزعين المعتمدين بالجزائر. يتم تطبيق معاملاتكم فورا على جميع أدوات الحساب والتصميم 3D و CAO.',
        en: 'Spot prices reflect authorized Algerian distributor catalogs. Your calibration multipliers update all 3D, CAD, and CPQ quote calculations immediately.',
      }[language],
    },
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div
        dir={isRtl ? 'rtl' : 'ltr'}
        className={`relative w-full max-w-5xl rounded-2xl border shadow-2xl overflow-hidden flex flex-col max-h-[90vh] transition-all duration-300 ${
          isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-[#0E121E] border-white/15 text-zinc-100'
        }`}
      >
        {/* Modal Header */}
        <div
          className={`px-5 py-4 border-b flex items-center justify-between shrink-0 ${
            isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#131827] border-white/10'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/20 border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37] shrink-0">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold flex items-center gap-2">
                <span>{t.title}</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  MARCHÉ DZ 2026
                </span>
              </h3>
              <p className={`text-xs mt-0.5 line-clamp-1 ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
                {t.subtitle}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              playTactileClick();
              onClose();
            }}
            className={`p-2 rounded-xl border transition-colors cursor-pointer btn-press ${
              isLight
                ? 'border-slate-200 hover:bg-slate-100 text-slate-500 hover:text-slate-800'
                : 'border-white/10 hover:bg-white/10 text-zinc-400 hover:text-white'
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* View Mode Tabs */}
        <div
          className={`px-5 py-2.5 border-b flex items-center justify-between gap-3 shrink-0 ${
            isLight ? 'bg-slate-100/70 border-slate-200' : 'bg-[#090C14] border-white/10'
          }`}
        >
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                playSwitchSound();
                setActiveTab('bourse');
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-semibold transition-all flex items-center gap-1.5 cursor-pointer btn-press ${
                activeTab === 'bourse'
                  ? 'bg-[#D4AF37] text-black font-bold shadow-md shadow-[#D4AF37]/20'
                  : isLight
                  ? 'text-slate-600 hover:text-slate-900 hover:bg-white'
                  : 'text-zinc-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>{t.tabs.bourse}</span>
            </button>
            <button
              onClick={() => {
                playSwitchSound();
                setActiveTab('calibrator');
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-semibold transition-all flex items-center gap-1.5 cursor-pointer btn-press ${
                activeTab === 'calibrator'
                  ? 'bg-[#D4AF37] text-black font-bold shadow-md shadow-[#D4AF37]/20'
                  : isLight
                  ? 'text-slate-600 hover:text-slate-900 hover:bg-white'
                  : 'text-zinc-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>{t.tabs.calibrator}</span>
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-[11px] font-mono text-zinc-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Mise à jour hebdomadaire</span>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 flex flex-col gap-6">
          {/* VIEW 1: SPOT BOURSE ITEMS */}
          {activeTab === 'bourse' && (
            <div className="flex flex-col gap-5">
              {/* Category Pills */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-mono">
                {(['all', 'aluminum', 'glass', 'wood', 'metal', 'hardware'] as FilterCategory[]).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => {
                      playTactileClick();
                      setActiveCategory(cat);
                    }}
                    className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-all cursor-pointer btn-press ${
                      activeCategory === cat
                        ? isLight
                          ? 'bg-slate-900 text-white font-bold'
                          : 'bg-white text-slate-900 font-bold'
                        : isLight
                        ? 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        : 'bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-zinc-200'
                    }`}
                  >
                    {t.categories[cat]}
                  </button>
                ))}
              </div>

              {/* Items Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredItems.map((item: MaterialSpotItem) => {
                  const name = language === 'ar' ? item.nameAr : language === 'en' ? item.nameEn : item.nameFr;
                  const notes = language === 'ar' ? item.notesAr : item.notesFr;

                  return (
                    <div
                      key={item.id}
                      className={`p-4 rounded-xl border flex flex-col justify-between gap-3 transition-all hover-lift ${
                        isLight
                          ? 'bg-slate-50/80 border-slate-200 shadow-xs'
                          : 'bg-[#121624] border-white/10'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#D4AF37]/15 text-[#D4AF37] font-semibold">
                              {item.category.toUpperCase()}
                            </span>
                            <span className={`text-[11px] font-mono ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
                              {item.supplier}
                            </span>
                          </div>
                          <h4 className={`text-sm font-bold leading-snug ${isLight ? 'text-slate-900' : 'text-white'}`}>
                            {name}
                          </h4>
                          <p className={`text-xs mt-1.5 leading-relaxed ${isLight ? 'text-slate-600' : 'text-zinc-400'}`}>
                            {notes}
                          </p>
                        </div>

                        {/* Trend badge */}
                        <div className="shrink-0 flex flex-col items-end">
                          <div
                            className={`flex items-center gap-1 text-xs font-mono font-bold px-2 py-0.5 rounded-md ${
                              item.trend === 'up'
                                ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                                : item.trend === 'down'
                                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                                : 'bg-zinc-500/15 text-zinc-400 border border-zinc-500/30'
                            }`}
                          >
                            {item.trend === 'up' && <TrendingUp className="w-3 h-3" />}
                            {item.trend === 'down' && <TrendingDown className="w-3 h-3" />}
                            {item.trend === 'stable' && <Minus className="w-3 h-3" />}
                            <span>
                              {item.changePercent > 0 ? `+${item.changePercent}%` : `${item.changePercent}%`}
                            </span>
                          </div>
                          <span className="text-[10px] font-mono text-zinc-500 mt-1">vs mois précédent</span>
                        </div>
                      </div>

                      {/* Price and size bar */}
                      <div
                        className={`pt-3 border-t flex items-center justify-between text-xs font-mono ${
                          isLight ? 'border-slate-200' : 'border-white/10'
                        }`}
                      >
                        <span className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
                          {item.standardLengthOrSize}
                        </span>
                        <div className="flex items-baseline gap-1 text-right">
                          <span className="text-base font-extrabold text-[#D4AF37]">
                            {item.currentPriceDzd.toLocaleString()}
                          </span>
                          <span className="text-[10px] font-semibold text-zinc-400">DZD / {item.unit}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Informational Footer Note */}
              <div
                className={`p-3.5 rounded-xl border flex items-start gap-3 text-xs leading-relaxed ${
                  isLight
                    ? 'bg-amber-50 border-amber-200 text-amber-900'
                    : 'bg-amber-500/10 border-amber-500/20 text-amber-200'
                }`}
              >
                <ShieldAlert className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <p>{t.labels.notice}</p>
              </div>
            </div>
          )}

          {/* VIEW 2: WORKSHOP MARGIN & MULTIPLIER CALIBRATOR */}
          {activeTab === 'calibrator' && (
            <div className="flex flex-col gap-6">
              {/* Presets Header */}
              <div
                className={`p-4 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                  isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#121624] border-white/10'
                }`}
              >
                <span className="text-xs font-mono font-bold text-zinc-400">{t.presets.title}</span>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => handleApplyPreset('wholesale')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all cursor-pointer btn-press border ${
                      isLight
                        ? 'bg-white hover:bg-slate-100 border-slate-300 text-slate-700'
                        : 'bg-white/5 hover:bg-white/10 border-white/10 text-zinc-300'
                    }`}
                  >
                    {t.presets.wholesale}
                  </button>
                  <button
                    onClick={() => handleApplyPreset('standard')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all cursor-pointer btn-press border ${
                      isLight
                        ? 'bg-white hover:bg-slate-100 border-slate-300 text-slate-700'
                        : 'bg-white/5 hover:bg-white/10 border-white/10 text-zinc-300'
                    }`}
                  >
                    {t.presets.standard}
                  </button>
                  <button
                    onClick={() => handleApplyPreset('south')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all cursor-pointer btn-press border ${
                      isLight
                        ? 'bg-white hover:bg-slate-100 border-slate-300 text-slate-700'
                        : 'bg-white/5 hover:bg-white/10 border-white/10 text-zinc-300'
                    }`}
                  >
                    {t.presets.south}
                  </button>
                </div>
              </div>

              {/* Sliders Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* 1. Aluminium Multiplier */}
                <div
                  className={`p-4 rounded-xl border flex flex-col gap-2.5 ${
                    isLight ? 'bg-white border-slate-200' : 'bg-[#121624] border-white/10'
                  }`}
                >
                  <div className="flex justify-between items-center text-xs font-mono">
                    <span className="font-semibold flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-[#D4AF37]" />
                      {t.labels.aluMult}
                    </span>
                    <span className="font-bold text-[#D4AF37] px-2 py-0.5 rounded bg-[#D4AF37]/15">
                      {tempCalibration.aluminumPriceMultiplier.toFixed(2)}×
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.80"
                    max="1.30"
                    step="0.01"
                    value={tempCalibration.aluminumPriceMultiplier}
                    onChange={(e) => {
                      playSlideTick();
                      setTempCalibration((prev) => ({
                        ...prev,
                        aluminumPriceMultiplier: parseFloat(e.target.value),
                      }));
                    }}
                    className="w-full accent-[#D4AF37] cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] font-mono text-zinc-500">
                    <span>Remise Usine (0.80×)</span>
                    <span>Standard (1.00×)</span>
                    <span>Majoration Fret (1.30×)</span>
                  </div>
                </div>

                {/* 2. Glass Multiplier */}
                <div
                  className={`p-4 rounded-xl border flex flex-col gap-2.5 ${
                    isLight ? 'bg-white border-slate-200' : 'bg-[#121624] border-white/10'
                  }`}
                >
                  <div className="flex justify-between items-center text-xs font-mono">
                    <span className="font-semibold flex items-center gap-1.5">
                      <Package className="w-3.5 h-3.5 text-blue-400" />
                      {t.labels.glassMult}
                    </span>
                    <span className="font-bold text-blue-400 px-2 py-0.5 rounded bg-blue-500/15">
                      {tempCalibration.glassPriceMultiplier.toFixed(2)}×
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.80"
                    max="1.30"
                    step="0.01"
                    value={tempCalibration.glassPriceMultiplier}
                    onChange={(e) => {
                      playSlideTick();
                      setTempCalibration((prev) => ({
                        ...prev,
                        glassPriceMultiplier: parseFloat(e.target.value),
                      }));
                    }}
                    className="w-full accent-blue-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] font-mono text-zinc-500">
                    <span>MFG Direct (0.80×)</span>
                    <span>Standard (1.00×)</span>
                    <span>Verre Importé (1.30×)</span>
                  </div>
                </div>

                {/* 3. Wood Multiplier */}
                <div
                  className={`p-4 rounded-xl border flex flex-col gap-2.5 ${
                    isLight ? 'bg-white border-slate-200' : 'bg-[#121624] border-white/10'
                  }`}
                >
                  <div className="flex justify-between items-center text-xs font-mono">
                    <span className="font-semibold flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-amber-500" />
                      {t.labels.woodMult}
                    </span>
                    <span className="font-bold text-amber-500 px-2 py-0.5 rounded bg-amber-500/15">
                      {tempCalibration.woodPriceMultiplier.toFixed(2)}×
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.80"
                    max="1.30"
                    step="0.01"
                    value={tempCalibration.woodPriceMultiplier}
                    onChange={(e) => {
                      playSlideTick();
                      setTempCalibration((prev) => ({
                        ...prev,
                        woodPriceMultiplier: parseFloat(e.target.value),
                      }));
                    }}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] font-mono text-zinc-500">
                    <span>MDF Gros (0.80×)</span>
                    <span>Standard (1.00×)</span>
                    <span>Chêne Massif (1.30×)</span>
                  </div>
                </div>

                {/* 4. Steel Multiplier */}
                <div
                  className={`p-4 rounded-xl border flex flex-col gap-2.5 ${
                    isLight ? 'bg-white border-slate-200' : 'bg-[#121624] border-white/10'
                  }`}
                >
                  <div className="flex justify-between items-center text-xs font-mono">
                    <span className="font-semibold flex items-center gap-1.5">
                      <Calculator className="w-3.5 h-3.5 text-emerald-400" />
                      {t.labels.metalMult}
                    </span>
                    <span className="font-bold text-emerald-400 px-2 py-0.5 rounded bg-emerald-500/15">
                      {tempCalibration.metalPriceMultiplier.toFixed(2)}×
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.80"
                    max="1.30"
                    step="0.01"
                    value={tempCalibration.metalPriceMultiplier}
                    onChange={(e) => {
                      playSlideTick();
                      setTempCalibration((prev) => ({
                        ...prev,
                        metalPriceMultiplier: parseFloat(e.target.value),
                      }));
                    }}
                    className="w-full accent-emerald-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] font-mono text-zinc-500">
                    <span>El Hadjar (0.80×)</span>
                    <span>Standard (1.00×)</span>
                    <span>Acier Traité (1.30×)</span>
                  </div>
                </div>

                {/* 5. Workshop Target Margin */}
                <div
                  className={`p-4 rounded-xl border flex flex-col gap-2.5 ${
                    isLight ? 'bg-white border-slate-200' : 'bg-[#121624] border-white/10'
                  }`}
                >
                  <div className="flex justify-between items-center text-xs font-mono">
                    <span className="font-semibold flex items-center gap-1.5">
                      <Percent className="w-3.5 h-3.5 text-purple-400" />
                      {t.labels.marginPct}
                    </span>
                    <span className="font-bold text-purple-400 px-2 py-0.5 rounded bg-purple-500/15">
                      {tempCalibration.workshopTargetMarginPercent}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="15"
                    max="40"
                    step="1"
                    value={tempCalibration.workshopTargetMarginPercent}
                    onChange={(e) => {
                      playSlideTick();
                      setTempCalibration((prev) => ({
                        ...prev,
                        workshopTargetMarginPercent: parseInt(e.target.value, 10),
                      }));
                    }}
                    className="w-full accent-purple-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] font-mono text-zinc-500">
                    <span>15% (Chantiers Gros Volume)</span>
                    <span>22% (Normal)</span>
                    <span>40% (Sur-Mesure Luxe)</span>
                  </div>
                </div>

                {/* 6. Hourly Labor Rate */}
                <div
                  className={`p-4 rounded-xl border flex flex-col gap-2.5 ${
                    isLight ? 'bg-white border-slate-200' : 'bg-[#121624] border-white/10'
                  }`}
                >
                  <div className="flex justify-between items-center text-xs font-mono">
                    <span className="font-semibold flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-orange-400" />
                      {t.labels.hourlyRate}
                    </span>
                    <span className="font-bold text-orange-400 px-2 py-0.5 rounded bg-orange-500/15">
                      {tempCalibration.artisanHourlyRateDzd.toLocaleString()} DZD/h
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1200"
                    max="3500"
                    step="50"
                    value={tempCalibration.artisanHourlyRateDzd}
                    onChange={(e) => {
                      playSlideTick();
                      setTempCalibration((prev) => ({
                        ...prev,
                        artisanHourlyRateDzd: parseInt(e.target.value, 10),
                      }));
                    }}
                    className="w-full accent-orange-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] font-mono text-zinc-500">
                    <span>1 200 DZD</span>
                    <span>1 800 DZD (Atelier Qualifié)</span>
                    <span>3 500 DZD</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <button
                  onClick={handleReset}
                  className={`px-4 py-2 rounded-xl text-xs font-mono flex items-center gap-2 border transition-all cursor-pointer btn-press ${
                    isLight
                      ? 'border-slate-200 hover:bg-slate-100 text-slate-600'
                      : 'border-white/10 hover:bg-white/10 text-zinc-400'
                  }`}
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>{t.labels.resetBtn}</span>
                </button>

                <button
                  onClick={handleSave}
                  className="px-6 py-2.5 rounded-xl text-xs font-mono font-bold bg-[#D4AF37] hover:bg-[#C5A880] text-black shadow-lg shadow-[#D4AF37]/25 flex items-center gap-2 transition-all cursor-pointer btn-press"
                >
                  {savedSuccess ? <Check className="w-4 h-4 text-emerald-950" /> : <Sliders className="w-4 h-4" />}
                  <span>{savedSuccess ? t.labels.saved : t.labels.saveBtn}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
