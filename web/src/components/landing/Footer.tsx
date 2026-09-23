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
  Lock,
  Layers,
  Sparkles,
  Smartphone,
} from 'lucide-react';
import { useConfigStore } from '../../store/configStore';
import { playTactileClick } from '../../utils/audioFeedback';

const MARQUEE_ITEMS = [
  'Menuiserie Alu & PVC Gamme 40/45',
  'Optimisation Débitage Linéaire 1D & 2D',
  'Conformité DTR C3-2 / CNERIB',
  '100% Fonctionnel Hors-Ligne',
  'Réseau National 58 Wilayas',
  'NF DTU 36.5 & CSTB 3529',
  'Châssis Façades & Double Vitrage Isolant',
  'Chiffrement AES Local des Tarifs Atelier',
  'Génération Instantanée Devis en DZD',
  'Étiquetage Scie Thermique & G-Code CNC',
];

export const Footer: React.FC = () => {
  const { language, theme, setMaterialMarketOpen } = useConfigStore();
  const isLight = theme === 'light';
  const isRtl = language === 'ar';

  return (
    <footer
      className={`border-t transition-colors duration-500 relative overflow-hidden ${
        isLight
          ? 'bg-slate-100/90 border-slate-200 text-slate-700'
          : 'bg-[#030914] border-sky-500/20 text-zinc-400'
      }`}
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      {/* AMBIENT AURORA & GRID BACKGROUND */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Subtle grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]"
          style={{
            backgroundImage:
              'linear-gradient(to right, #38BDF8 1px, transparent 1px), linear-gradient(to bottom, #38BDF8 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />
        {/* Glowing Oceanic and Gold Ambient Orbs */}
        <div className="absolute -top-32 left-1/4 w-[600px] h-[350px] bg-sky-600/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute -bottom-24 right-1/4 w-[500px] h-[300px] bg-[#D4AF37]/10 rounded-full blur-[130px] pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-[#003366]/15 rounded-full blur-[150px] pointer-events-none" />
      </div>

      {/* GIANT ARCHITECTURAL WATERMARK TEXT */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap text-[14vw] font-black tracking-tighter text-transparent select-none pointer-events-none opacity-[0.02] dark:opacity-[0.035] uppercase font-mono">
        BAITI ATELIER
      </div>

      {/* 1. CINEMATIC CONTINUOUS MARQUEE TICKER */}
      <div className="relative border-b border-black/5 dark:border-sky-500/15 bg-black/[0.02] dark:bg-[#020b18]/80 backdrop-blur-md py-3 overflow-hidden z-10">
        <div className="flex w-max animate-marquee space-x-8 text-xs font-mono tracking-wider uppercase text-zinc-500 dark:text-zinc-400">
          {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, idx) => (
            <div key={idx} className="flex items-center gap-4 px-2">
              <span className="font-semibold">{item}</span>
              <span className="text-[#D4AF37] opacity-80 text-sm">✦</span>
            </div>
          ))}
        </div>
      </div>

      {/* 2. PRE-FOOTER ARCHITECTURAL CTA BANNER */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12 relative z-10">
        <div
          className={`p-8 sm:p-12 rounded-3xl border relative overflow-hidden transition-all duration-300 shadow-2xl backdrop-blur-xl ${
            isLight
              ? 'bg-gradient-to-br from-white via-slate-50 to-amber-50/30 border-slate-300/80 shadow-slate-200/60'
              : 'bg-gradient-to-br from-[#05162e] via-[#041124] to-[#020a16] border-sky-400/25 shadow-2xl shadow-[#020b18]/90'
          }`}
        >
          {/* Subtle Ambient Gold Radiance inside card */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#D4AF37]/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#38BDF8]/15 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/35 text-xs font-mono text-[#D4AF37] font-semibold mb-3 shadow-xs">
                <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                <span>
                  {language === 'ar'
                    ? 'المنصة الوطنية للورشات والتفصيل الدقيق'
                    : 'Suite Industrielle de Fabrication & Débitage'}
                </span>
              </div>
              <h3
                className={`text-2xl sm:text-4xl font-extrabold tracking-tight ${
                  isLight ? 'text-slate-900' : 'text-white'
                }`}
              >
                {language === 'ar'
                  ? 'طوّر إنتاج ورشتك وتحكّم في هوامش أرباحك'
                  : 'Modernisez la Production de Votre Atelier de Menuiserie'}
              </h3>
              <p
                className={`text-sm sm:text-base mt-2 leading-relaxed ${
                  isLight ? 'text-slate-600' : 'text-zinc-300'
                }`}
              >
                {language === 'ar'
                  ? 'حسابات دقيقة للمتر المربع وسماكات الزجاج، تقطيع المقاطع الألومنيوم والخشبية مع تقليل نسبة الفواقد، وإصدار كشوف حساب فورية بالدينار الجزائري.'
                  : 'Calculs millimétriques de débit de barres, optimisation de vitrage et de panneaux, fiches de fabrication pour scies à double tête et devis proforma en DZD.'}
              </p>

              {/* Ticker Badges */}
              <div className="flex flex-wrap items-center gap-3 pt-4 text-xs font-mono">
                <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/5 dark:bg-sky-500/10 border border-black/10 dark:border-sky-500/20 text-slate-800 dark:text-sky-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>58 Wilayas Couvertes</span>
                </span>
                <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/5 dark:bg-emerald-500/10 border border-black/10 dark:border-emerald-500/20 text-slate-800 dark:text-emerald-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Tolérance 0.1 mm</span>
                </span>
                <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/5 dark:bg-cyan-500/10 border border-black/10 dark:border-cyan-500/20 text-slate-800 dark:text-cyan-300">
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
                <span>
                  {language === 'ar' ? 'بدء التصميم في ورشة CAD' : 'Lancer le Studio CAD 2D'}
                </span>
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

      {/* 3. MAIN FOOTER 5-COLUMN MATRIX */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-14 border-t border-black/5 dark:border-sky-500/15 pt-12 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-10">
          {/* COLUMN 1: BRAND IDENTITY & OFFICIAL STANDARDS (4 cols) */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#0F4C81] via-[#003366] to-[#D4AF37] p-0.5 shadow-lg shadow-sky-900/30 flex items-center justify-center">
                <div
                  className={`w-full h-full rounded-[14px] flex items-center justify-center ${
                    isLight ? 'bg-white' : 'bg-[#041124]'
                  }`}
                >
                  <Hammer className="w-5 h-5 text-[#D4AF37]" />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`text-xl font-bold tracking-tight ${
                    isLight ? 'text-slate-900' : 'text-white'
                  }`}
                >
                  Baiti Atelier
                </span>
                <span dir="rtl" lang="ar" className="text-xl font-bold text-[#D4AF37] font-arabic">
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
              <div
                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border ${
                  isLight
                    ? 'bg-slate-50 border-slate-200 text-slate-700'
                    : 'bg-sky-950/40 border-sky-500/20 text-sky-200'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Conforme aux normes DTR C3-2 / CNERIB</span>
              </div>
              <div
                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border ${
                  isLight
                    ? 'bg-slate-50 border-slate-200 text-slate-700'
                    : 'bg-white/5 border-white/10 text-zinc-300'
                }`}
              >
                <MapPin className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>Réseau Opérationnel sur les 58 Wilayas</span>
              </div>
              <div
                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border ${
                  isLight
                    ? 'bg-slate-50 border-slate-200 text-slate-700'
                    : 'bg-emerald-950/30 border-emerald-500/20 text-emerald-300'
                }`}
              >
                <Lock className="w-3.5 h-3.5 text-emerald-400" />
                <span>Chiffrement Local & Zéro Fuite de Marge</span>
              </div>
            </div>
          </div>

          {/* COLUMN 2: LES 4 MÉTIERS DE FABRICATION (2 cols) */}
          <div className="lg:col-span-2 flex flex-col gap-3">
            <h4
              className={`text-xs font-mono font-bold uppercase tracking-wider ${
                isLight ? 'text-slate-900' : 'text-white'
              }`}
            >
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
                  <span>Menuiserie Alu & PVC</span>
                  <span className="text-[10px] font-mono text-[#D4AF37]">40/45</span>
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
                  <span>Ébénisterie & Cuisines</span>
                  <span className="text-[10px] font-mono text-amber-500">MDF</span>
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
                  <span>Ferronnerie d’Art</span>
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
                  <span>Façades Murs-Rideaux</span>
                  <span className="text-[10px] font-mono text-emerald-400">BIM</span>
                </a>
              </li>
            </ul>
          </div>

          {/* COLUMN 3: OUTILS D'ATELIER & PRODUCTION (2 cols) */}
          <div className="lg:col-span-2 flex flex-col gap-3">
            <h4
              className={`text-xs font-mono font-bold uppercase tracking-wider ${
                isLight ? 'text-slate-900' : 'text-white'
              }`}
            >
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
                  <span>Optimiseur Linéaire 1D</span>
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
                  <span>Découpe 2D (Verre/MDF)</span>
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
                  <span>Exports SVG, DXF & CSV</span>
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
                  <span>Fiches Devis BPU / DQE</span>
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
                  <span>Spooler Scie Thermique</span>
                </a>
              </li>
            </ul>
          </div>

          {/* COLUMN 4: APPLICATIONS & ÉCOSYSTÈME (2 cols) */}
          <div className="lg:col-span-2 flex flex-col gap-3">
            <h4
              className={`text-xs font-mono font-bold uppercase tracking-wider ${
                isLight ? 'text-slate-900' : 'text-white'
              }`}
            >
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
                  <span>Desktop Windows</span>
                </a>
                <span className="text-[10px] text-zinc-500 block ml-5">Tauri v2 · Rust Shell</span>
              </li>
              <li>
                <a
                  href="/downloads/baiti-companion-setup.exe"
                  download
                  className={`transition-colors hover:text-[#D4AF37] flex items-center gap-1.5 font-semibold ${
                    isLight ? 'text-slate-800' : 'text-zinc-200'
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5 text-sky-400" />
                  <span>Compagnon Mobile</span>
                </a>
                <span className="text-[10px] text-zinc-500 block ml-5">Flutter 3 · Scie & QR</span>
              </li>
              <li>
                <button
                  onClick={() => {
                    playTactileClick();
                    setMaterialMarketOpen(true);
                  }}
                  className={`transition-colors hover:text-[#D4AF37] text-left rtl:text-right cursor-pointer flex items-center gap-1.5 pt-1 ${
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

          {/* COLUMN 5: SÉCURITÉ, AUDIT & CONFORMITÉ (2 cols) */}
          <div className="lg:col-span-2 flex flex-col gap-3">
            <h4
              className={`text-xs font-mono font-bold uppercase tracking-wider ${
                isLight ? 'text-slate-900' : 'text-white'
              }`}
            >
              Sécurité & Normes
            </h4>
            <ul className="flex flex-col gap-2 text-xs">
              <li className="flex items-center gap-1.5 text-zinc-400">
                <Lock className="w-3.5 h-3.5 text-emerald-400" />
                <span>Base SQLite / Supabase</span>
              </li>
              <li className="flex items-center gap-1.5 text-zinc-400">
                <ShieldCheck className="w-3.5 h-3.5 text-sky-400" />
                <span>Row Level Security (RLS)</span>
              </li>
              <li className="flex items-center gap-1.5 text-zinc-400">
                <Layers className="w-3.5 h-3.5 text-indigo-400" />
                <span>InitPlan Optimisé</span>
              </li>
              <li className="flex items-center gap-1.5 text-zinc-400">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>NF DTU 36.5 / 39</span>
              </li>
              <li className="flex items-center gap-1.5 text-zinc-400">
                <HardDrive className="w-3.5 h-3.5 text-amber-400" />
                <span>Tokens Nonces Sécurisés</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* 4. BOTTOM LEGAL, CONFIDENTIALITY & TRUST STRIP */}
      <div className="border-t border-black/5 dark:border-sky-500/15 py-6 text-[11px] font-mono relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#D4AF37] animate-pulse" />
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
