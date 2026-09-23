import React from 'react';
import {
  Grid,
  Scissors,
  Download,
  Smartphone,
  ShieldCheck,
  TrendingUp,
  MapPin,
  Lock,
  ArrowRight,
} from 'lucide-react';
import { useConfigStore } from '../../store/configStore';
import { playTactileClick } from '../../utils/audioFeedback';
import { BaitiLogoMark } from '../brand/BaitiLogoMark';

export const Footer: React.FC = () => {
  const { language, theme, setMaterialMarketOpen } = useConfigStore();
  const isLight = theme === 'light';
  const isRtl = language === 'ar';

  return (
    <footer
      className={`border-t transition-colors duration-500 relative overflow-hidden ${
        isLight
          ? 'bg-slate-50 border-slate-200 text-slate-700'
          : 'bg-[#020713] border-white/10 text-zinc-400'
      }`}
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      {/* AMBIENT LIGHTING BACKGROUND */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/3 w-[600px] h-[300px] bg-sky-600/5 rounded-full blur-[140px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[280px] bg-[#D4AF37]/5 rounded-full blur-[130px]" />
      </div>

      {/* 1. PRE-FOOTER ARCHITECTURAL CTA CALLOUT */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12 relative z-10">
        <div
          className={`p-8 sm:p-12 rounded-3xl border relative overflow-hidden transition-all duration-300 shadow-2xl backdrop-blur-xl ${
            isLight
              ? 'bg-white border-slate-200 shadow-slate-200/50'
              : 'bg-gradient-to-b from-[#051329]/90 to-[#030a17]/95 border-sky-500/20 shadow-2xl shadow-[#010610]'
          }`}
        >
          <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-xs font-mono text-[#D4AF37] font-semibold mb-3">
                <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]" />
                <span>
                  {language === 'ar'
                    ? 'المنصة الوطنية لمهن وحرفيي البناء والتشييد'
                    : 'Suite Industrielle de Fabrication & Débitage'}
                </span>
              </div>
              <h3
                className={`text-2xl sm:text-3xl lg:text-4xl font-serif tracking-tight ${
                  isLight ? 'text-slate-900' : 'text-white'
                }`}
              >
                {language === 'ar'
                  ? 'الدقة الهندسية في خدمة ورشات الألمنيوم والـ PVC'
                  : 'L’Excellence du Débitage & de la Menuiserie Industrielle'}
              </h3>
              <p
                className={`text-sm mt-2.5 leading-relaxed font-light ${
                  isLight ? 'text-slate-600' : 'text-zinc-300'
                }`}
              >
                {language === 'ar'
                  ? 'حسابات دقيقة لقص المقاطع، تقليل فواقد الورشة إلى أقل من 3.5%، وإصدار فوري لمخططات التصنيع وكشوف الأسعار بالدينار الجزائري.'
                  : 'Chiffrage instantané en Dinars Algériens (DZD), optimisation de coupe millimétrique avec gestion des chutes et conformité DTR C3-2 pour les ateliers des 58 Wilayas.'}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto shrink-0">
              <a
                href="#cad-studio"
                onClick={() => playTactileClick()}
                className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#C5A880] to-[#D4AF37] hover:brightness-110 text-slate-950 font-bold text-xs sm:text-sm font-mono flex items-center justify-center gap-2 transition-all shadow-xl shadow-[#D4AF37]/20 cursor-pointer hover-lift btn-press"
              >
                <Grid className="w-4 h-4" />
                <span>
                  {language === 'ar' ? 'فتح ورشة CAD 2D' : 'OUVRIR LE STUDIO CAD'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </a>

              <a
                href="/downloads/baiti-atelier-desktop-setup.exe"
                download
                className={`px-5 py-3.5 rounded-xl border text-xs font-mono flex items-center justify-center gap-2 transition-all cursor-pointer hover-lift btn-press ${
                  isLight
                    ? 'bg-slate-50 hover:bg-slate-100 border-slate-300 text-slate-800'
                    : 'bg-white/5 hover:bg-white/10 border-white/15 text-zinc-200'
                }`}
              >
                <Download className="w-4 h-4 text-[#D4AF37]" />
                <span>App Windows (.exe)</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* 2. MAIN 4-COLUMN ARCHITECTURAL MATRIX */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-14 pt-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-10">
          {/* COLUMN 1: BRAND IDENTITY & STANDARDS (4 cols) */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            <BaitiLogoMark size={38} showText={true} isLight={isLight} />

            <p className={`text-xs leading-relaxed font-light ${isLight ? 'text-slate-600' : 'text-zinc-400'}`}>
              {language === 'ar'
                ? 'البرمجية الرائدة للتفصيل الهندسي وحسابات كلف التصنيع لورشات النجارة المعمارية في الجزائر. مطابقة تامة للمعايير التقنية الوطنية CNERIB و DTR C3-2.'
                : 'Solution logicielle intégrée pour ateliers de menuiserie aluminium, PVC, bois et ferronnerie d’art en Algérie. Précision de coupe, fiches de débitage et conformité DTR C3-2.'}
            </p>

            <div className="flex flex-col gap-2 pt-2 text-[11px] font-mono">
              <div
                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border ${
                  isLight
                    ? 'bg-white border-slate-200 text-slate-700'
                    : 'bg-white/5 border-white/10 text-zinc-300'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Réseau Opérationnel · 58 Wilayas</span>
              </div>
              <div
                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border ${
                  isLight
                    ? 'bg-white border-slate-200 text-slate-700'
                    : 'bg-white/5 border-white/10 text-zinc-300'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5 text-sky-400" />
                <span>Conformité Thermique DTR C3-2 / CNERIB</span>
              </div>
              <div
                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border ${
                  isLight
                    ? 'bg-white border-slate-200 text-slate-700'
                    : 'bg-white/5 border-white/10 text-zinc-300'
                }`}
              >
                <Lock className="w-3.5 h-3.5 text-emerald-400" />
                <span>Chiffrement Local & Devis Protégés</span>
              </div>
            </div>
          </div>

          {/* COLUMN 2: SOLUTIONS DE FABRICATION (3 cols) */}
          <div className="lg:col-span-3 flex flex-col gap-3">
            <h4
              className={`text-xs font-mono font-bold uppercase tracking-wider ${
                isLight ? 'text-slate-900' : 'text-white'
              }`}
            >
              {language === 'ar' ? 'حلول التصنيع' : 'Menuiseries & Métiers'}
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
                  <span>Aluminium 45/52 RPT</span>
                  <span className="text-[10px] font-mono text-[#D4AF37]">40/45 mm</span>
                </a>
              </li>
              <li>
                <a
                  href="#cad-studio"
                  onClick={() => playTactileClick()}
                  className={`transition-colors hover:text-[#D4AF37] flex items-center justify-between ${
                    isLight ? 'text-slate-600' : 'text-zinc-400'
                  }`}
                >
                  <span>PVC Multi-Chambres</span>
                  <span className="text-[10px] font-mono text-cyan-400">70 mm</span>
                </a>
              </li>
              <li>
                <a
                  href="#cad-studio"
                  onClick={() => playTactileClick()}
                  className={`transition-colors hover:text-[#D4AF37] flex items-center justify-between ${
                    isLight ? 'text-slate-600' : 'text-zinc-400'
                  }`}
                >
                  <span>Double Vitrage 4/16/4</span>
                  <span className="text-[10px] font-mono text-emerald-400">Uw 1.4</span>
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
                  <span>Ferronnerie d’Art & Sécurité</span>
                  <span className="text-[10px] font-mono text-red-400">Acier</span>
                </a>
              </li>
            </ul>
          </div>

          {/* COLUMN 3: MOTEURS DE CALCUL (2 cols) */}
          <div className="lg:col-span-2 flex flex-col gap-3">
            <h4
              className={`text-xs font-mono font-bold uppercase tracking-wider ${
                isLight ? 'text-slate-900' : 'text-white'
              }`}
            >
              {language === 'ar' ? 'محركات الحساب' : 'Calcul & Débit'}
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
                  <span>Débit Linéaire 1D</span>
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
                  <span>Découpe Verre 2D</span>
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
                  <span>Exports SVG & G-Code</span>
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
                  <span>Attestation DTR C3-2</span>
                </a>
              </li>
              <li>
                <button
                  onClick={() => {
                    playTactileClick();
                    setMaterialMarketOpen(true);
                  }}
                  className={`transition-colors hover:text-[#D4AF37] flex items-center gap-1.5 cursor-pointer text-left rtl:text-right ${
                    isLight ? 'text-slate-600' : 'text-zinc-400'
                  }`}
                >
                  <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
                  <span>Bourse Matières (DZD)</span>
                </button>
              </li>
            </ul>
          </div>

          {/* COLUMN 4: APPLICATIONS & ÉCOSYSTÈME (3 cols) */}
          <div className="lg:col-span-3 flex flex-col gap-3">
            <h4
              className={`text-xs font-mono font-bold uppercase tracking-wider ${
                isLight ? 'text-slate-900' : 'text-white'
              }`}
            >
              {language === 'ar' ? 'التطبيقات والمنظومة' : 'Applications & Accès'}
            </h4>
            <ul className="flex flex-col gap-2.5 text-xs">
              <li>
                <a
                  href="/downloads/baiti-atelier-desktop-setup.exe"
                  download
                  className={`transition-colors hover:text-[#D4AF37] flex items-center gap-2 font-medium ${
                    isLight ? 'text-slate-800' : 'text-zinc-200'
                  }`}
                >
                  <Download className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>Application Bureau Windows</span>
                </a>
                <span className="text-[10px] text-zinc-500 block ml-5">Tauri v2 · Exécution Hors-Ligne</span>
              </li>
              <li>
                <a
                  href="/downloads/baiti-companion-setup.exe"
                  download
                  className={`transition-colors hover:text-[#D4AF37] flex items-center gap-2 font-medium ${
                    isLight ? 'text-slate-800' : 'text-zinc-200'
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5 text-sky-400" />
                  <span>Compagnon Mobile Chantier</span>
                </a>
                <span className="text-[10px] text-zinc-500 block ml-5">Flutter 3 · Prise de Cotes & QR</span>
              </li>
              <li>
                <a
                  href="#workshops"
                  onClick={() => playTactileClick()}
                  className={`transition-colors hover:text-[#D4AF37] flex items-center gap-2 ${
                    isLight ? 'text-slate-600' : 'text-zinc-400'
                  }`}
                >
                  <MapPin className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>Annuaire des Ateliers Agréés</span>
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* 3. SUB-FOOTER LEGAL & TRUST STRIP */}
      <div className={`border-t py-6 text-[11px] font-mono relative z-10 ${
        isLight ? 'border-slate-200 text-slate-500 bg-white/50' : 'border-white/10 text-zinc-500 bg-black/20'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]" />
            <p>
              {language === 'ar'
                ? `© ${new Date().getFullYear()} بيتي أتيليه (Baiti Atelier) • جميع الحقوق محفوظة لورشات التصنيع بالجزائر.`
                : `© ${new Date().getFullYear()} Baiti Atelier. Conçu pour les maîtres artisans fabricants d'Algérie.`}
            </p>
          </div>

          <div className="flex items-center gap-4">
            <span>Données Chiffrées en Local</span>
            <span>•</span>
            <span>Tarifs Confidentiels Atelier</span>
            <span>•</span>
            <span>Normes DTR C3-2 / DTU 36.5</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
