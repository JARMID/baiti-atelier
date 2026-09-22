import React from 'react';
import { Layers, Sparkles, Scale, Wrench } from 'lucide-react';
import { useConfigStore } from '../../store/configStore';
import { playTactileClick } from '../../utils/audioFeedback';

export const MethodologySection: React.FC = () => {
  const { language, theme } = useConfigStore();
  const isLight = theme === 'light';
  const isRtl = language === 'ar';

  const badgeText =
    language === 'ar'
      ? 'الشفافية وحساب التكلفة'
      : language === 'en'
      ? 'Transparency & Cost Breakdown'
      : 'Transparence & Chiffrage';

  const titleText =
    language === 'ar'
      ? 'كيف يتم حساب كشف التكلفة؟'
      : language === 'en'
      ? 'How is the Joinery Quote Calculated?'
      : 'Comment est Calculé le Devis ?';

  const descText =
    language === 'ar'
      ? 'انتهى عهد الأسعار الجزافية بالمتر المربع التي تسبب خسائر للمقاول أو الزبون. محركنا يتبع قواعد التصنيع الحقيقية في ورشات الجزائر.'
      : language === 'en'
      ? 'No more arbitrary square-meter pricing causing workshop losses. Our engine models real workshop fabrication parameters.'
      : 'Fini les prix forfaitaires au mètre carré qui créent des pertes. Notre moteur de calcul intègre les variables réelles de fabrication en atelier.';

  const pillars = [
    {
      num: 1,
      icon: Scale,
      iconColor: 'text-[#D4AF37]',
      iconBg: 'bg-[#D4AF37]/10 border-[#D4AF37]/20',
      title:
        language === 'ar'
          ? '1. وزن الألمنيوم الفعلي (كغ)'
          : language === 'en'
          ? '1. True Aluminum Mass (Kg)'
          : '1. Masse d’Aluminium (Kg)',
      desc:
        language === 'ar'
          ? 'حساب المحيط الحقيقي للإطار الثابت، الدرف المتحركة، والباركلوز مضروباً في الكثافة الخطية للقطاع (1.15 إلى 1.65 كغ/م).'
          : language === 'en'
          ? 'Exact perimeter of outer frame, sashes, and glazing beads multiplied by linear profile density (1.15 to 1.65 kg/m).'
          : 'Périmètre réel du dormant, des ouvrants et des parcloses multiplié par la densité linéaire (1,15 à 1,65 kg/m selon la gamme).',
    },
    {
      num: 2,
      icon: Layers,
      iconColor: 'text-blue-500',
      iconBg: 'bg-blue-500/10 border-blue-500/20',
      title:
        language === 'ar'
          ? '2. مساحة الزجاج الصافية (م²)'
          : language === 'en'
          ? '2. Net Glazing Area (m²)'
          : '2. Surface Vitrage (m²)',
      desc:
        language === 'ar'
          ? 'خصم عمق تجويف القطاعات للحصول على مقاس الزجاج الصافي، ومطابقته مع أسعار مصانع الزجاج (عادي، ستوب-سول، أو رملي).'
          : language === 'en'
          ? 'Precise deduction of profile rebate depths to obtain true glass cutting area, priced by unit rate (Clear, Stop-Sol, Frosted).'
          : 'Déduction précise du recouvrement des profilés pour obtenir la surface exacte de verre, chiffrée selon le tarif miroitier.',
    },
    {
      num: 3,
      icon: Sparkles,
      iconColor: 'text-amber-500',
      iconBg: 'bg-amber-500/10 border-amber-500/20',
      title:
        language === 'ar'
          ? '3. طقم الإكسسوارات والمفصلات'
          : language === 'en'
          ? '3. Hardware & Gaskets Pack'
          : '3. Pack Quincaillerie',
      desc:
        language === 'ar'
          ? 'زوايا الكبس 24x14، حواشي EPDM المطاطية المقاومة للطقس، عجلات سحاب مزدوجة، وأقفال محكمة متعددة النقاط.'
          : language === 'en'
          ? 'Crimped corner cleats, EPDM weather seals, double-roller adjustable carriages, and multi-point perimeter locks.'
          : 'Équerres de sertissage, joints EPDM, roulettes réglables doubles galets, crémones multipoints et embouts d’étanchéité.',
    },
    {
      num: 4,
      icon: Wrench,
      iconColor: 'text-emerald-500',
      iconBg: 'bg-emerald-500/10 border-emerald-500/20',
      title:
        language === 'ar'
          ? '4. أجور التصنيع والتركيب'
          : language === 'en'
          ? '4. Fabrication & Milling Labor'
          : '4. Main-d’œuvre & Usinage',
      desc:
        language === 'ar'
          ? 'وقت تشغيل مناشير الورشة بزوايا 45°، ثقوب تصريف مياه الأمطار، تجميع الزوايا بالكبس الهيدروليكي وتثبيت الحواشي.'
          : language === 'en'
          ? 'Workshop machine time, 45-degree miter cuts, drainage weep slots, hydraulic corner crimping, and glass blocking.'
          : 'Temps d’usinage en atelier, découpes d’onglets 45°, perçages de drainage d’eau, assemblage et calage des vitrages.',
    },
  ];

  return (
    <section
      id="methodology"
      className={`py-20 border-t relative transition-colors duration-300 ${
        isLight
          ? 'bg-slate-50/80 border-slate-200'
          : 'bg-[#0E1117]/60 border-white/10'
      }`}
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mb-14">
          <span className="text-xs uppercase font-mono font-semibold tracking-wider text-[#D4AF37] px-3 py-1 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/20">
            {badgeText}
          </span>
          <h2
            className={`text-3xl sm:text-4xl font-bold tracking-tight mt-3 ${
              isLight ? 'text-slate-900' : 'text-white'
            }`}
          >
            {titleText}
          </h2>
          <p
            className={`text-sm mt-2 leading-relaxed ${
              isLight ? 'text-slate-600' : 'text-zinc-400'
            }`}
          >
            {descText}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {pillars.map((p) => {
            const Icon = p.icon;
            return (
              <div
                key={p.num}
                onClick={() => playTactileClick()}
                className={`p-5 rounded-2xl border transition-all duration-300 hover-lift spotlight-card cursor-pointer ${
                  isLight
                    ? 'bg-white border-slate-200 hover:border-slate-300 shadow-sm hover:shadow-xl'
                    : 'glass-panel border-white/10 hover:border-white/20'
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-xl border flex items-center justify-center mb-4 ${p.iconBg} ${p.iconColor}`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <h3
                  className={`text-sm font-semibold ${
                    isLight ? 'text-slate-900' : 'text-white'
                  }`}
                >
                  {p.title}
                </h3>
                <p
                  className={`text-xs mt-1.5 leading-relaxed ${
                    isLight ? 'text-slate-600' : 'text-zinc-400'
                  }`}
                >
                  {p.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
