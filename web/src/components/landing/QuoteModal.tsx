import React, { useState } from 'react';
import { useConfigStore } from '../../store/configStore';
import { X, CheckCircle2, MessageCircle, FileDown, Loader2, Truck, MapPin } from 'lucide-react';
import confetti from 'canvas-confetti';
import { submitQuote, type StoredQuote } from '../../utils/supabaseClient';
import { generateClientDevisPdf } from '../../utils/pdfGenerator';
import { playTactileClick, playClampSound, playSwitchSound } from '../../utils/audioFeedback';
import {
  ALGERIAN_WILAYAS_58,
  formatWilayaLabel,
  calculateWilayaLogistics,
  parseWilayaString,
} from '../../utils/algerianWilayas';

export const QuoteModal: React.FC = () => {
  const {
    isQuoteModalOpen,
    setQuoteModalOpen,
    config,
    cost,
    selectedWilaya,
    setSelectedWilaya,
    theme,
    language,
  } = useConfigStore();
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [commune, setCommune] = useState('');
  const [projectType, setProjectType] = useState('neuf');
  const [deliveryMode, setDeliveryMode] = useState<'workshop_pickup' | 'wilaya_hub' | 'direct_site' | 'express_crane'>('direct_site');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedQuote, setSubmittedQuote] = useState<StoredQuote | null>(null);

  const parsedWilaya = parseWilayaString(selectedWilaya);
  const logistics = calculateWilayaLogistics(parsedWilaya.code, cost.profileWeightKg, deliveryMode);
  const totalWithDelivery = cost.totalEstimatedDzd + logistics.totalCostDzd;

  const isRtl = language === 'ar';

  const t = {
    fr: {
      badge: "Devis Personnalisé Gratuit",
      title: "Transmettre votre projet aux ateliers",
      subtitle: `Votre configuration 3D actuelle (${config.width} × ${config.height} mm) sera transmise aux fabricants certifiés de ${selectedWilaya}.`,
      opening: "Ouverture :",
      indicativeEst: "Estimation Indicative :",
      fullName: "Nom & Prénom",
      fullNamePlaceholder: "ex. Karim Amrani",
      phone: "Numéro Téléphone",
      phonePlaceholder: "05 50 12 34 56",
      commune: "Commune",
      communePlaceholder: "ex. Chéraga, Kouba, Es Senia...",
      projectType: "Type de Travaux",
      typeNew: "Construction Neuve",
      typeReno: "Rénovation ou Remplacement",
      typeCommercial: "Vitrine Commerciale",
      notes: "Précisions ou Nombre de Fenêtres",
      notesPlaceholder: "Ex: J'ai 5 fenêtres identiques, besoin d'une visite pour vérifier les cotes...",
      submitting: "Transmission en cours...",
      submit: "Envoyer la Demande de Devis",
      successRef: "RÉF :",
      successTitle: "Demande Enregistrée !",
      successDesc: `Merci ${fullName}. Votre projet a été enregistré et transmis aux ateliers qualifiés de ${selectedWilaya}. Vous pouvez télécharger votre devis formel au format PDF ou engager la discussion sur WhatsApp.`,
      verificationToken: "JETON DE VÉRIFICATION :",
      downloadPdf: "Télécharger le Devis PDF Officiel",
      openWhatsApp: "Ouvrir sur WhatsApp Directement",
      close: "Fermer",
      waTitle: "*Demande de Devis Formel - BAITI ATELIER | بيتي*",
      waClient: "Client :",
      waPhone: "Téléphone :",
      waLoc: "Localisation :",
      waProject: "Projet :",
      waProjectNew: "Construction neuve",
      waProjectReno: "Rénovation",
      waSpecs: "*Spécifications Menuiserie :*",
      waType: "• Type :",
      waDims: "• Cotes :",
      waProfile: "• Profilé :",
      waFinish: "• Finition :",
      waGlass: "• Vitrage :",
      waShutter: "• Volet :",
      waEst: "• Estimation calculée :",
      waNotes: "• Remarques :",
    },
    ar: {
      badge: "عرض سعر مخصص ومجاني",
      title: "توجيه مشروعك إلى ورشات التصنيع",
      subtitle: `سيتم إرسال قياساتك الثلاثية الأبعاد (${config.width} × ${config.height} ملم) إلى المصنّعين المعتمدين في ولاية ${selectedWilaya}.`,
      opening: "نوع الفتح :",
      indicativeEst: "التقدير الأولي :",
      fullName: "الاسم واللقب",
      fullNamePlaceholder: "مثال: أمين بلقاسم",
      phone: "رقم الهاتف",
      phonePlaceholder: "05 50 12 34 56",
      commune: "البلدية",
      communePlaceholder: "مثال: الشراقة، القبة، السانية...",
      projectType: "نوع الأشغال",
      typeNew: "بناء جديد",
      typeReno: "تجديد أو استبدال",
      typeCommercial: "واجهة تجارية",
      notes: "ملاحظات إضافية أو عدد النوافذ",
      notesPlaceholder: "مثال: 5 نوافذ متطابقة، أحتاج زيارة ميدانية لتأكيد القياسات...",
      submitting: "جاري الإرسال...",
      submit: "إرسال طلب عرض السعر",
      successRef: "المرجع:",
      successTitle: "تم تسجيل الطلب بنجاح!",
      successDesc: `شكراً لك ${fullName}. تم تسجيل مشروعك وتوجيهه إلى المصنّعين المعتمدين في ولاية ${selectedWilaya}. يمكنك تحميل عرض السعر الرسمي بصيغة PDF أو التواصل مباشرة عبر واتساب.`,
      verificationToken: "رمز التحقق:",
      downloadPdf: "تحميل عرض السعر الرسمي PDF",
      openWhatsApp: "التواصل عبر واتساب مباشرة",
      close: "إغلاق",
      waTitle: "*طلب عرض سعر رسمي - BAITI ATELIER | بيتي*",
      waClient: "الزبون :",
      waPhone: "الهاتف :",
      waLoc: "الموقع :",
      waProject: "المشروع :",
      waProjectNew: "بناء جديد",
      waProjectReno: "تجديد",
      waSpecs: "*المواصفات الفنية للنجارة :*",
      waType: "• نوع الفتح :",
      waDims: "• المقاسات :",
      waProfile: "• نوع المقاطع :",
      waFinish: "• لون الطلاء :",
      waGlass: "• نوع الزجاج :",
      waShutter: "• الستار المتحرك :",
      waEst: "• التقدير الإجمالي المحسوب :",
      waNotes: "• ملاحظات :",
    },
    en: {
      badge: "Free Tailored Estimate",
      title: "Forward Your Project to Workshops",
      subtitle: `Your current 3D configuration (${config.width} x ${config.height} mm) will be transmitted to certified manufacturers in ${selectedWilaya}.`,
      opening: "Opening:",
      indicativeEst: "Indicative Estimate:",
      fullName: "Full Name",
      fullNamePlaceholder: "e.g. Karim Amrani",
      phone: "Phone Number",
      phonePlaceholder: "05 50 12 34 56",
      commune: "Commune",
      communePlaceholder: "e.g. Cheraga, Kouba, Es Senia...",
      projectType: "Project Type",
      typeNew: "New Construction",
      typeReno: "Renovation or Replacement",
      typeCommercial: "Commercial Showcase",
      notes: "Additional Notes or Number of Windows",
      notesPlaceholder: "e.g. 5 identical windows, need a site visit to confirm dimensions...",
      submitting: "Submitting...",
      submit: "Send Quote Request",
      successRef: "REF:",
      successTitle: "Request Successfully Registered!",
      successDesc: `Thank you ${fullName}. Your project has been recorded and routed to certified workshops in ${selectedWilaya}. You can download your official PDF estimate or connect directly on WhatsApp.`,
      verificationToken: "VERIFICATION TOKEN:",
      downloadPdf: "Download Official PDF Estimate",
      openWhatsApp: "Connect via WhatsApp Directly",
      close: "Close",
      waTitle: "*Formal Quote Request - BAITI ATELIER | بيتي*",
      waClient: "Client:",
      waPhone: "Phone:",
      waLoc: "Location:",
      waProject: "Project:",
      waProjectNew: "New build",
      waProjectReno: "Renovation",
      waSpecs: "*Joinery Specifications:*",
      waType: "• Type:",
      waDims: "• Dimensions:",
      waProfile: "• Profile:",
      waFinish: "• Finish:",
      waGlass: "• Glass:",
      waShutter: "• Shutter:",
      waEst: "• Calculated Estimate:",
      waNotes: "• Notes:",
    },
  }[language] || {
    badge: "Devis Personnalisé Gratuit",
    title: "Transmettre votre projet aux ateliers",
    subtitle: `Votre configuration 3D actuelle (${config.width} × ${config.height} mm) sera transmise aux fabricants certifiés de ${selectedWilaya}.`,
    opening: "Ouverture :",
    indicativeEst: "Estimation Indicative :",
    fullName: "Nom & Prénom",
    fullNamePlaceholder: "ex. Karim Amrani",
    phone: "Numéro Téléphone",
    phonePlaceholder: "05 50 12 34 56",
    commune: "Commune",
    communePlaceholder: "ex. Chéraga, Kouba, Es Senia...",
    projectType: "Type de Travaux",
    typeNew: "Construction Neuve",
    typeReno: "Rénovation ou Remplacement",
    typeCommercial: "Vitrine Commerciale",
    notes: "Précisions ou Nombre de Fenêtres",
    notesPlaceholder: "Ex: J'ai 5 fenêtres identiques, besoin d'une visite pour vérifier les cotes...",
    submitting: "Transmission en cours...",
    submit: "Envoyer la Demande de Devis",
    successRef: "RÉF :",
    successTitle: "Demande Enregistrée !",
    successDesc: `Merci ${fullName}. Votre projet a été enregistré et transmis aux ateliers qualifiés de ${selectedWilaya}. Vous pouvez télécharger votre devis formel au format PDF ou engager la discussion sur WhatsApp.`,
    verificationToken: "JETON DE VÉRIFICATION :",
    downloadPdf: "Télécharger le Devis PDF Officiel",
    openWhatsApp: "Ouvrir sur WhatsApp Directement",
    close: "Fermer",
    waTitle: "*Demande de Devis Formel - BAITI ATELIER | بيتي*",
    waClient: "Client :",
    waPhone: "Téléphone :",
    waLoc: "Localisation :",
    waProject: "Projet :",
    waProjectNew: "Construction neuve",
    waProjectReno: "Rénovation",
    waSpecs: "*Spécifications Menuiserie :*",
    waType: "• Type :",
    waDims: "• Cotes :",
    waProfile: "• Profilé :",
    waFinish: "• Finition :",
    waGlass: "• Vitrage :",
    waShutter: "• Volet :",
    waEst: "• Estimation calculée :",
    waNotes: "• Remarques :",
  };

  if (!isQuoteModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    playTactileClick();
    setIsSubmitting(true);
    try {
      const res = await submitQuote({
        client_name: fullName,
        client_phone: phone,
        client_wilaya: `${commune}, ${selectedWilaya}`,
        client_notes: notes,
        window_type: config.openingType,
        width_mm: config.width,
        height_mm: config.height,
        quantity: 1,
        profile_system: config.profileSystem,
        finish_color: config.finishColor,
        glass_type: config.glassType,
        total_cost_dzd: cost.totalEstimatedDzd,
        total_price_dzd: cost.totalEstimatedDzd,
        configuration_data: {
          shutterType: config.shutterType,
          projectType,
        },
      });

      if (res.quote) {
        setSubmittedQuote(res.quote);
      }
      playClampSound();
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 },
      });
    } catch (err) {
      console.error('Error submitting quote:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const dispatchToWhatsApp = () => {
    playTactileClick();
    const text = encodeURIComponent(
      `${t.waTitle}\n` +
      `${t.waClient} ${fullName}\n` +
      `${t.waPhone} ${phone}\n` +
      `${t.waLoc} ${commune}, ${selectedWilaya}\n` +
      `${t.waProject} ${projectType === 'neuf' ? t.waProjectNew : t.waProjectReno}\n\n` +
      `${t.waSpecs}\n` +
      `${t.waType} ${config.openingType}\n` +
      `${t.waDims} ${config.width} mm (L) x ${config.height} mm (H)\n` +
      `${t.waProfile} ${config.profileSystem}\n` +
      `${t.waFinish} ${config.finishColor}\n` +
      `${t.waGlass} ${config.glassType}\n` +
      `${t.waShutter} ${config.shutterType}\n` +
      `${t.waEst} ${cost.totalEstimatedDzd.toLocaleString()} DZD\n` +
      (notes ? `${t.waNotes} ${notes}\n` : '')
    );
    window.open(`https://wa.me/213550123456?text=${text}`, '_blank');
  };

  return (
    <div
      dir={isRtl ? 'rtl' : 'ltr'}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in"
    >
      <div className={`relative w-full max-w-lg rounded-3xl p-6 border shadow-2xl overflow-hidden transition-all duration-300 ${
        theme === 'light'
          ? 'bg-white border-slate-200 text-slate-900 shadow-2xl'
          : 'glass-panel-elevated border-white/15 text-zinc-100'
      }`}>
        <button
          onClick={() => {
            playTactileClick();
            setQuoteModalOpen(false);
            setSubmittedQuote(null);
          }}
          className={`absolute top-4 ${isRtl ? 'left-4' : 'right-4'} p-2 rounded-xl transition-colors cursor-pointer btn-press ${
            theme === 'light'
              ? 'text-slate-500 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-200'
              : 'text-zinc-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10'
          }`}
        >
          <X className="w-4 h-4" />
        </button>

        {!submittedQuote ? (
          <div>
            <div className="mb-5">
              <span className="text-[11px] font-mono text-[#D4AF37] uppercase font-semibold">
                {t.badge}
              </span>
              <h3 className={`text-xl font-bold mt-0.5 ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>
                {t.title}
              </h3>
              <p className={`text-xs mt-1 ${theme === 'light' ? 'text-slate-600' : 'text-zinc-400'}`}>
                {t.subtitle}
              </p>
            </div>

            <div className={`p-3 rounded-xl border text-xs font-mono mb-4 grid grid-cols-2 gap-2 ${
              theme === 'light' ? 'bg-slate-50 border-slate-200 text-slate-700' : 'bg-white/5 border-white/10 text-zinc-300'
            }`}>
              <div>
                <span className={`block text-[10px] ${theme === 'light' ? 'text-slate-500' : 'text-zinc-500'}`}>{t.opening}</span>
                <span className={`font-semibold truncate block ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>{config.openingType}</span>
              </div>
              <div>
                <span className={`block text-[10px] ${theme === 'light' ? 'text-slate-500' : 'text-zinc-500'}`}>{t.indicativeEst}</span>
                <span className="font-semibold text-[#D4AF37]">{cost.totalEstimatedDzd.toLocaleString()} DZD</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={`text-xs block mb-1 ${theme === 'light' ? 'text-slate-700' : 'text-zinc-300'}`}>{t.fullName}</label>
                  <input
                    required
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder={t.fullNamePlaceholder}
                    className={`w-full px-3 py-2 rounded-xl border text-xs focus:outline-none focus:border-[#D4AF37] ${
                      theme === 'light'
                        ? 'bg-slate-50 border-slate-300 text-slate-900 placeholder:text-slate-400'
                        : 'bg-white/5 border-white/10 text-white placeholder-zinc-500'
                    }`}
                  />
                </div>

                <div>
                  <label className={`text-xs block mb-1 ${theme === 'light' ? 'text-slate-700' : 'text-zinc-300'}`}>{t.phone}</label>
                  <input
                    required
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder={t.phonePlaceholder}
                    className={`w-full px-3 py-2 rounded-xl border text-xs focus:outline-none focus:border-[#D4AF37] ${
                      theme === 'light'
                        ? 'bg-slate-50 border-slate-300 text-slate-900 placeholder:text-slate-400'
                        : 'bg-white/5 border-white/10 text-white placeholder-zinc-500'
                    }`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={`text-xs block mb-1 font-medium ${theme === 'light' ? 'text-slate-700' : 'text-zinc-300'}`}>
                    {language === 'ar' ? 'الولاية (58 ولاية)' : language === 'en' ? 'Wilaya (58 Wilayas)' : 'Wilaya (58 Wilayas)'}
                  </label>
                  <div className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs ${
                    theme === 'light' ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-[#12151C] border-white/10 text-white'
                  }`}>
                    <MapPin className="w-3.5 h-3.5 text-[#D4AF37] shrink-0" />
                    <select
                      value={selectedWilaya}
                      onChange={(e) => {
                        playSwitchSound();
                        setSelectedWilaya(e.target.value);
                      }}
                      className="w-full bg-transparent border-none text-xs focus:outline-none cursor-pointer"
                    >
                      {ALGERIAN_WILAYAS_58.map((w) => {
                        const label = formatWilayaLabel(w, language);
                        const val = `${w.code} - ${w.nameFr}`;
                        return (
                          <option key={w.code} value={val} className={theme === 'light' ? 'bg-white text-slate-800' : 'bg-[#12151C] text-zinc-200'}>
                            {label}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                </div>

                <div>
                  <label className={`text-xs block mb-1 font-medium ${theme === 'light' ? 'text-slate-700' : 'text-zinc-300'}`}>{t.commune}</label>
                  <input
                    required
                    type="text"
                    value={commune}
                    onChange={(e) => setCommune(e.target.value)}
                    placeholder={t.communePlaceholder}
                    className={`w-full px-3 py-2 rounded-xl border text-xs focus:outline-none focus:border-[#D4AF37] ${
                      theme === 'light'
                        ? 'bg-slate-50 border-slate-300 text-slate-900 placeholder:text-slate-400'
                        : 'bg-white/5 border-white/10 text-white placeholder-zinc-500'
                    }`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={`text-xs block mb-1 font-medium ${theme === 'light' ? 'text-slate-700' : 'text-zinc-300'}`}>{t.projectType}</label>
                  <select
                    value={projectType}
                    onChange={(e) => {
                      playSwitchSound();
                      setProjectType(e.target.value);
                    }}
                    className={`w-full px-3 py-2 rounded-xl border text-xs focus:outline-none focus:border-[#D4AF37] ${
                      theme === 'light'
                        ? 'bg-slate-50 border-slate-300 text-slate-900'
                        : 'bg-[#12151C] border-white/10 text-white'
                    }`}
                  >
                    <option value="neuf">{t.typeNew}</option>
                    <option value="reno">{t.typeReno}</option>
                    <option value="commerce">{t.typeCommercial}</option>
                  </select>
                </div>

                <div>
                  <label className={`text-xs block mb-1 font-medium ${theme === 'light' ? 'text-slate-700' : 'text-zinc-300'}`}>
                    {language === 'ar' ? 'طريقة التوصيل' : language === 'en' ? 'Logistics Delivery' : 'Mode de Livraison'}
                  </label>
                  <div className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs ${
                    theme === 'light' ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-[#12151C] border-white/10 text-white'
                  }`}>
                    <Truck className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                    <select
                      value={deliveryMode}
                      onChange={(e) => {
                        playSwitchSound();
                        setDeliveryMode(e.target.value as any);
                      }}
                      className="w-full bg-transparent border-none text-xs focus:outline-none cursor-pointer"
                    >
                      <option value="workshop_pickup" className={theme === 'light' ? 'bg-white text-slate-800' : 'bg-[#12151C] text-zinc-200'}>
                        {language === 'ar' ? 'استلام من الورشة (0 دج)' : language === 'en' ? 'Workshop Pickup (0 DZD)' : 'Retrait Atelier (0 DZD)'}
                      </option>
                      <option value="wilaya_hub" className={theme === 'light' ? 'bg-white text-slate-800' : 'bg-[#12151C] text-zinc-200'}>
                        {language === 'ar' ? 'مستودع الولاية' : language === 'en' ? 'Wilaya Hub Depot' : 'Dépôt Relais Wilaya'}
                      </option>
                      <option value="direct_site" className={theme === 'light' ? 'bg-white text-slate-800' : 'bg-[#12151C] text-zinc-200'}>
                        {language === 'ar' ? 'توصيل مباشر للورشة/الورش' : language === 'en' ? 'Direct Site Delivery' : 'Livraison Directe Chantier'}
                      </option>
                      <option value="express_crane" className={theme === 'light' ? 'bg-white text-slate-800' : 'bg-[#12151C] text-zinc-200'}>
                        {language === 'ar' ? 'توصيل مع رافعة زجاج' : language === 'en' ? 'Crane / Glass Hoist Delivery' : 'Chantier + Grutage Vitrage'}
                      </option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Dynamic Algerian Logistics Fee Banner */}
              <div
                className={`p-2.5 rounded-xl border text-xs font-mono flex items-center justify-between ${
                  theme === 'light' ? 'bg-blue-50/70 border-blue-200 text-blue-900' : 'bg-blue-500/10 border-blue-500/20 text-blue-200'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-blue-500 shrink-0" />
                  <span>
                    {language === 'ar' ? 'الشحن والتوصيل :' : language === 'en' ? 'Freight Logistics:' : 'Fret & Acheminement :'}
                    <span className="font-semibold ml-1">{logistics.estimatedDays}</span>
                  </span>
                </div>
                <div className="font-bold text-right">
                  <span>{logistics.totalCostDzd > 0 ? `+${logistics.totalCostDzd.toLocaleString()} DZD` : 'GRATUIT'}</span>
                </div>
              </div>

              {/* Total Summary */}
              <div
                className={`p-2.5 rounded-xl border text-xs font-mono flex items-center justify-between ${
                  theme === 'light' ? 'bg-slate-100 border-slate-300 text-slate-900' : 'bg-white/10 border-white/15 text-white'
                }`}
              >
                <span className="font-semibold">
                  {language === 'ar' ? 'المجموع شامل التوصيل :' : language === 'en' ? 'Total with Freight:' : 'Total TTC Estimé avec Fret :'}
                </span>
                <span className="font-extrabold text-sm text-[#D4AF37]">
                  {totalWithDelivery.toLocaleString()} DZD
                </span>
              </div>

              <div>
                <label className={`text-xs block mb-1 ${theme === 'light' ? 'text-slate-700' : 'text-zinc-300'}`}>{t.notes}</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={t.notesPlaceholder}
                  className={`w-full px-3 py-2 rounded-xl border text-xs focus:outline-none focus:border-[#D4AF37] ${
                    theme === 'light'
                      ? 'bg-slate-50 border-slate-300 text-slate-900 placeholder:text-slate-400'
                      : 'bg-white/5 border-white/10 text-white placeholder-zinc-500'
                  }`}
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 rounded-xl bg-[#D4AF37] hover:bg-[#C5A880] disabled:opacity-50 text-black font-semibold text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-[#D4AF37]/25 cursor-pointer mt-2 btn-press hover-lift"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{t.submitting}</span>
                  </>
                ) : (
                  <span>{t.submit}</span>
                )}
              </button>
            </form>
          </div>
        ) : (
          <div className="text-center py-6">
            <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <span className="text-[11px] font-mono text-emerald-400 tracking-wider uppercase font-semibold">
              {t.successRef} {submittedQuote?.quote_code || 'BAI-26-DEV'}
            </span>
            <h3 className={`text-xl font-bold mt-1 ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>{t.successTitle}</h3>
            <p className={`text-xs mt-2 max-w-sm mx-auto leading-relaxed ${theme === 'light' ? 'text-slate-600' : 'text-zinc-400'}`}>
              {t.successDesc}
            </p>

            {submittedQuote?.verification_token && (
              <div className={`my-4 p-2.5 rounded-xl border text-[11px] font-mono text-left ${
                theme === 'light' ? 'bg-slate-50 border-slate-200 text-slate-600' : 'bg-white/5 border-white/10 text-zinc-400'
              }`}>
                <span className={`block text-[9px] ${theme === 'light' ? 'text-slate-500' : 'text-zinc-500'}`}>{t.verificationToken}</span>
                <span className={`break-all ${theme === 'light' ? 'text-slate-800 font-semibold' : 'text-zinc-200'}`}>{submittedQuote.verification_token}</span>
              </div>
            )}

            <div className="mt-5 flex flex-col gap-2.5">
              <button
                onClick={() => {
                  playClampSound();
                  generateClientDevisPdf(config, cost, fullName, phone, `${commune}, ${selectedWilaya}`);
                }}
                className={`w-full py-3 rounded-xl border font-medium text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md btn-press hover-lift ${
                  theme === 'light'
                    ? 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-800'
                    : 'bg-white/10 hover:bg-white/15 border-white/20 text-white'
                }`}
              >
                <FileDown className="w-4 h-4 text-[#D4AF37]" />
                <span>{t.downloadPdf}</span>
              </button>

              <button
                onClick={dispatchToWhatsApp}
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-900/40 cursor-pointer btn-press hover-lift"
              >
                <MessageCircle className="w-4 h-4" />
                <span>{t.openWhatsApp}</span>
              </button>

              <button
                onClick={() => {
                  setQuoteModalOpen(false);
                  setSubmittedQuote(null);
                }}
                className={`py-2 text-xs transition-colors cursor-pointer ${
                  theme === 'light' ? 'text-slate-500 hover:text-slate-800' : 'text-zinc-400 hover:text-white'
                }`}
              >
                {t.close}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

