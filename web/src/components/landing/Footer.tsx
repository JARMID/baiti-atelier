import React from 'react';
import {
  Hammer,
  ShieldCheck,
  TrendingUp,
  Grid,
  Scissors,
  HardDrive,
  CheckCircle2,
  ArrowRight,
  Download,
  MapPin,
} from 'lucide-react';
import { useConfigStore } from '../../store/configStore';
import { playTactileClick } from '../../utils/audioFeedback';

export const Footer: React.FC = () => {
  const { language, theme, setMaterialMarketOpen } = useConfigStore();
  const isLight = theme === 'light';
  const isRtl = language === 'ar';

  return (
    <footer
      className={`border-t transition-colors duration-300 relative overflow-hidden ${
        isLight
          ? 'bg-slate-100/90 border-slate-200 text-slate-700'
          : 'bg-[#05070A] border-white/10 text-zinc-400'
      }`}
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      {/* PRE-FOOTER ARCHITECTURAL CTA BANNER */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12">
        <div
          className={`p-8 sm:p-12 rounded-3xl border relative overflow-hidden transition-all duration-300 shadow-2xl ${
            isLight
              ? 'bg-gradient-to-br from-white via-slate-50 to-amber-50/30 border-slate-300/80 shadow-slate-200/60'
              : 'bg-gradient-to-br from-[#0F141F] via-[#090C12] to-[#120F0A] border-[#D4AF37]/20 shadow-black/80'
          }`}
        >
          {/* Subtle Ambient Gold Radiance */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#D4AF37]/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#38BDF8]/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/30 text-xs font-mono text-[#D4AF37] font-semibold mb-3">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>
                  {language === 'ar'
                    ? 'المنصة الوطنية للورشات والتفصيل الدقيق'
                    : 'Suite Industrielle de Fabrication & Débitage'}
                </span>
              </div>
              <h3 className={`text-2xl sm:text-4xl font-extrabold tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
                {language === 'ar'
                  ? 'طوّر إنتاج ورشتك وتحكّم في هوامش أرباحك'
                  : 'Modernisez la Production de Votre Atelier de Menuiserie'}
              </h3>
              <p className={`text-sm sm:text-base mt-2 leading-relaxed ${isLight ? 'text-slate-600' : 'text-zinc-300'}`}>
                {language === 'ar'
                  ? 'حسابات دقيقة للمتر المربع وسماكات الزجاج، تقطيع المقاطع الألومنيوم والخشبية مع تقليل نسبة الفواقد، وإصدار كشوف حساب فورية بالدينار الجزائري.'
                  : 'Calculs millimétriques de débit de barres, optimisation de vitrage et de panneaux, fiches de fabrication pour scies à double tête et devis proforma en DZD.'}
              </p>

              {/* Ticker Badges */}
              <div className="flex flex-wrap items-center gap-3 pt-4 text-xs font-mono">
                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>58 Wilayas Couvertes</span>
                </span>
                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Tolérance 0.1 mm</span>
                </span>
                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10">
                  <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                  <span>100% Fonctionnel Hors-Ligne</span>
                </span>
              </div>
            </div>

            {/* Direct CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto shrink-0">
              <a
                href="#cad-studio"
                onClick={() => playTactileClick()}
                className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#C5A880] to-[#D4AF37] hover:brightness-110 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-xl shadow-[#D4AF37]/25 cursor-pointer hover-lift btn-press"
              >
                <Grid className="w-4 h-4" />
                <span>{language === 'ar' ? 'بدء التصميم في ورشة CAD' : 'Lancer le Studio CAD 2D'}</span>
                <ArrowRight className="w-4 h-4" />
              </a>

              <button
                onClick={() => {
                  playTactileClick();
                  setMaterialMarketOpen(true);
                }}
                className={`px-5 py-3.5 rounded-xl border text-xs font-mono flex items-center justify-center gap-2 transition-all cursor-pointer hover-lift btn-press ${
                  isLight
                    ? 'bg-slate-50 hover:bg-slate-100 border-slate-300 text-slate-800'
                    : 'bg-white/10 hover:bg-white/15 border-white/15 text-white'
                }`}
              >
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                <span>{language === 'ar' ? 'أسعار المواد الأولية' : 'Bourse des Matières'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN FOOTER COLUMNS MATRIX */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-14 border-t border-black/5 dark:border-white/5 pt-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-10">
          {/* COLUMN 1: BRAND IDENTITY & OFFICIAL STANDARDS (4 cols) */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#C5A880] to-[#D4AF37] p-0.5 shadow-md flex items-center justify-center">
                <div className={`w-full h-full rounded-[10px] flex items-center justify-center ${
                  isLight ? 'bg-white' : 'bg-[#0A0D14]'
                }`}>
                  <Hammer className="w-4 h-4 text-[#D4AF37]" />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xl font-bold tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  Baiti Atelier
                </span>
                <span dir="rtl" lang="ar" className="text-lg font-bold text-[#D4AF37] font-arabic">
                  بيتي
                </span>
              </div>
            </div>

            <p className={`text-xs leading-relaxed ${isLight ? 'text-slate-600' : 'text-zinc-400'}`}>
              {language === 'ar'
                ? 'المنصة الرقمية المتكاملة لورشات نجارة الألمنيوم والـ PVC والخشب والحدادة الفنية عبر 58 ولاية جزائرية. مخططات تصنيع وحسابات دقيقة وفق المعايير الوطنية.'
                : 'Suite logicielle industrielle dédiée aux artisans fabricants et menuisiers en Algérie. Calculs de débitage au millimètre, plans d’atelier et chiffrage en Dinars Algériens.'}
            </p>

            {/* Regulatory & System Status Pills */}
            <div className="flex flex-col gap-2 pt-1 text-[11px] font-mono">
              <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border ${
                isLight ? 'bg-slate-50 border-slate-200 text-slate-700' : 'bg-white/5 border-white/10 text-zinc-300'
              }`}>
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>Conforme aux normes DTR C3-2 / CNERIB</span>
              </div>
              <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border ${
                isLight ? 'bg-slate-50 border-slate-200 text-slate-700' : 'bg-white/5 border-white/10 text-zinc-300'
              }`}>
                <MapPin className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>Réseau Opérationnel sur les 58 Wilayas</span>
              </div>
            </div>
          </div>

          {/* COLUMN 2: LES 4 MÉTIERS DE FABRICATION (3 cols) */}
          <div className="lg:col-span-3 flex flex-col gap-3">
            <h4 className={`text-xs font-mono font-bold uppercase tracking-wider ${isLight ? 'text-slate-900' : 'text-white'}`}>
              {language === 'ar' ? 'المهن وورشات التصنيع' : 'Les 4 Métiers Baiti'}
            </h4>
            <ul className="flex flex-col gap-2 text-xs">
              <li>
                <a
                  href="#cad-studio"
                  onClick={() => playTactileClick()}
                  className={`transition-colors hover:text-[#D4AF37] flex items-center justify-between ${
                    isLight ? 'text-slate-600' : 'text-zinc-400'
                  }`}
                >
                  <span>Menuiserie Alu & PVC (Gamme 40/45)</span>
                  <span className="text-[10px] font-mono text-[#D4AF37]">CAD 2D</span>
                </a>
              </li>
              <li>
                <a
                  href="#trade-studios"
                  onClick={() => playTactileClick()}
                  className={`transition-colors hover:text-[#D4AF37] flex items-center justify-between ${
                    isLight ? 'text-slate-600' : 'text-zinc-400'
                  }`}
                >
                  <span>Ébénisterie & Cuisines Sur Mesure</span>
                  <span className="text-[10px] font-mono text-amber-500">MDF/ABS</span>
                </a>
              </li>
              <li>
                <a
                  href="#trade-studios"
                  onClick={() => playTactileClick()}
                  className={`transition-colors hover:text-[#D4AF37] flex items-center justify-between ${
                    isLight ? 'text-slate-600' : 'text-zinc-400'
                  }`}
                >
                  <span>Ferronnerie d’Art & Portails</span>
                  <span className="text-[10px] font-mono text-red-400">Acier</span>
                </a>
              </li>
              <li>
                <a
                  href="#trade-studios"
                  onClick={() => playTactileClick()}
                  className={`transition-colors hover:text-[#D4AF37] flex items-center justify-between ${
                    isLight ? 'text-slate-600' : 'text-zinc-400'
                  }`}
                >
                  <span>Draperie & Salons Seddari</span>
                  <span className="text-[10px] font-mono text-purple-400">Textile</span>
                </a>
              </li>
              <li>
                <a
                  href="#configurator"
                  onClick={() => playTactileClick()}
                  className={`transition-colors hover:text-[#D4AF37] flex items-center justify-between ${
                    isLight ? 'text-slate-600' : 'text-zinc-400'
                  }`}
                >
                  <span>Châssis Façade Villa 3D</span>
                  <span className="text-[10px] font-mono text-emerald-400">BIM</span>
                </a>
              </li>
            </ul>
          </div>

          {/* COLUMN 3: OUTILS D'ATELIER & PRODUCTION (3 cols) */}
          <div className="lg:col-span-3 flex flex-col gap-3">
            <h4 className={`text-xs font-mono font-bold uppercase tracking-wider ${isLight ? 'text-slate-900' : 'text-white'}`}>
              {language === 'ar' ? 'أدوات الورشة والإنتاج' : 'Outils de Débitage'}
            </h4>
            <ul className="flex flex-col gap-2 text-xs">
              <li>
                <a
                  href="#debitage-optimizer"
                  onClick={() => playTactileClick()}
                  className={`transition-colors hover:text-[#D4AF37] flex items-center gap-1.5 ${
                    isLight ? 'text-slate-600' : 'text-zinc-400'
                  }`}
                >
                  <Scissors className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>Optimiseur Linéaire 1D (Barres 6m)</span>
                </a>
              </li>
              <li>
                <a
                  href="#debitage-optimizer"
                  onClick={() => playTactileClick()}
                  className={`transition-colors hover:text-[#D4AF37] flex items-center gap-1.5 ${
                    isLight ? 'text-slate-600' : 'text-zinc-400'
                  }`}
                >
                  <Grid className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Découpe Guillotine 2D (Verre/MDF)</span>
                </a>
              </li>
              <li>
                <a
                  href="#cad-studio"
                  onClick={() => playTactileClick()}
                  className={`transition-colors hover:text-[#D4AF37] flex items-center gap-1.5 ${
                    isLight ? 'text-slate-600' : 'text-zinc-400'
                  }`}
                >
                  <Download className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Exports Vectoriels SVG, DXF & CSV</span>
                </a>
              </li>
              <li>
                <a
                  href="#cad-studio"
                  onClick={() => playTactileClick()}
                  className={`transition-colors hover:text-[#D4AF37] flex items-center gap-1.5 ${
                    isLight ? 'text-slate-600' : 'text-zinc-400'
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Fiches Devis & BPU/DQE Marchés</span>
                </a>
              </li>
              <li>
                <a
                  href="#debitage-optimizer"
                  onClick={() => playTactileClick()}
                  className={`transition-colors hover:text-[#D4AF37] flex items-center gap-1.5 ${
                    isLight ? 'text-slate-600' : 'text-zinc-400'
                  }`}
                >
                  <HardDrive className="w-3.5 h-3.5 text-amber-400" />
                  <span>Terminal d’Assemblage & Scie</span>
                </a>
              </li>
            </ul>
          </div>

          {/* COLUMN 4: ÉCOSYSTÈME & TÉLÉCHARGEMENTS (2 cols) */}
          <div className="lg:col-span-2 flex flex-col gap-3">
            <h4 className={`text-xs font-mono font-bold uppercase tracking-wider ${isLight ? 'text-slate-900' : 'text-white'}`}>
              Applications
            </h4>
            <ul className="flex flex-col gap-2 text-xs">
              <li>
                <a
                  href="/downloads/baiti-atelier-desktop-setup.exe"
                  download
                  className={`transition-colors hover:text-[#D4AF37] flex items-center gap-1.5 font-semibold ${
                    isLight ? 'text-slate-800' : 'text-zinc-200'
                  }`}
                >
                  <Download className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>Desktop Windows (.exe)</span>
                </a>
                <span className="text-[10px] text-zinc-500 block ml-5">Tauri v2 · 100% Hors-Ligne</span>
              </li>
              <li>
                <a
                  href="/downloads/baiti-companion-setup.exe"
                  download
                  className={`transition-colors hover:text-[#D4AF37] flex items-center gap-1.5 font-semibold ${
                    isLight ? 'text-slate-800' : 'text-zinc-200'
                  }`}
                >
                  <Download className="w-3.5 h-3.5 text-sky-400" />
                  <span>Compagnon Atelier (.exe)</span>
                </a>
                <span className="text-[10px] text-zinc-500 block ml-5">Flutter 3 · Scie & QR</span>
              </li>
              <li>
                <button
                  onClick={() => {
                    playTactileClick();
                    setMaterialMarketOpen(true);
                  }}
                  className={`transition-colors hover:text-[#D4AF37] text-left cursor-pointer flex items-center gap-1.5 pt-1 ${
                    isLight ? 'text-slate-600' : 'text-zinc-400'
                  }`}
                >
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Bourse Matières 58W</span>
                </button>
              </li>
              <li>
                <a
                  href="#workshops"
                  onClick={() => playTactileClick()}
                  className={`transition-colors hover:text-[#D4AF37] ${
                    isLight ? 'text-slate-600' : 'text-zinc-400'
                  }`}
                >
                  Annuaire des Fabricants
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* BOTTOM LEGAL, CONFIDENTIALITY & TRUST STRIP */}
      <div className="border-t border-black/5 dark:border-white/5 py-6 text-[11px] font-mono">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#D4AF37]" />
            <p>
              {language === 'ar'
                ? `© ${new Date().getFullYear()} منصة بيتي (Baiti Atelier) • جميع الحقوق محفوظة لورشات التصنيع بالجزائر.`
                : `© ${new Date().getFullYear()} Baiti Atelier | بيتي. Conçu pour les artisans fabricants d'Algérie.`}
            </p>
          </div>

          <div className="flex items-center gap-4 text-zinc-500">
            <span>Données Chiffrées en Local</span>
            <span>•</span>
            <span>Prix Confidentiels Atelier</span>
            <span>•</span>
            <span>DTR C3-2 / CNERIB</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
