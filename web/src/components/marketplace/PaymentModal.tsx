import React, { useState } from 'react';
import { X, CreditCard, CheckCircle2, Copy, Check, MessageCircle } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useConfigStore } from '../../store/configStore';
import { playTactileClick, playSwitchSound, playClampSound } from '../../utils/audioFeedback';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  productName: string;
  totalPriceDzd: number;
  workshopName: string;
  workshopPhone: string;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  productName,
  totalPriceDzd,
  workshopName,
  workshopPhone,
}) => {
  const { theme, language } = useConfigStore();
  const isLight = theme === 'light';
  const isRtl = language === 'ar';
  const [paymentMethod, setPaymentMethod] = useState<'baridimob' | 'cib' | 'cash'>('baridimob');
  const [copiedRip, setCopiedRip] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  if (!isOpen) return null;

  // 40% deposit (acompte standard en Algérie)
  const depositAmountDzd = Math.round(totalPriceDzd * 0.4);
  const mockRip = '007 99999 0023456789 42';

  const handleCopyRip = () => {
    playTactileClick();
    navigator.clipboard.writeText(mockRip.replace(/\s/g, ''));
    setCopiedRip(true);
    setTimeout(() => setCopiedRip(false), 2500);
  };

  const handleSimulatePayment = () => {
    playTactileClick();
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setPaymentSuccess(true);
      playClampSound();
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
    }, 1200);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      <div
        className={`relative w-full max-w-lg rounded-3xl p-6 border shadow-2xl overflow-hidden transition-colors ${
          isLight
            ? 'bg-white border-slate-200 text-slate-900'
            : 'bg-[#0D121D] border-white/15 text-white'
        }`}
      >
        <button
          onClick={() => {
            playTactileClick();
            onClose();
            setPaymentSuccess(false);
          }}
          className={`absolute top-4 ${
            isRtl ? 'left-4' : 'right-4'
          } p-2 rounded-xl transition-colors cursor-pointer btn-press ${
            isLight
              ? 'bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-300'
              : 'text-zinc-400 hover:text-white bg-white/5 border border-white/10'
          }`}
        >
          <X className="w-4 h-4" />
        </button>

        {!paymentSuccess ? (
          <div>
            <div className="mb-4">
              <span className="text-[11px] font-mono text-[#D4AF37] uppercase tracking-wider font-semibold">
                {language === 'ar'
                  ? 'دفع العربون الموثق'
                  : language === 'en'
                  ? 'Secure Deposit Payment'
                  : "Règlement Sécurisé de l'Acompte"}
              </span>
              <h3 className={`text-xl font-bold mt-0.5 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                {language === 'ar'
                  ? 'تأكيد الحجز وبدء التصنيع'
                  : language === 'en'
                  ? 'Order Reservation & Fabrication'
                  : 'Réservation & Lancement Fabrication'}
              </h3>
              <p className={`text-xs mt-1 ${isLight ? 'text-slate-600' : 'text-zinc-400'}`}>
                {language === 'ar'
                  ? `دفع عربون 40% لبدء التصنيع في ورشة `
                  : language === 'en'
                  ? `Payment of 40% deposit to launch production with `
                  : `Versement de l'acompte de 40% pour démarrer la commande avec `}
                <span className={`font-semibold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  {workshopName}
                </span>
                .
              </p>
            </div>

            {/* Order Recap Banner */}
            <div
              className={`p-3.5 rounded-2xl border mb-4 text-xs font-mono ${
                isLight ? 'bg-slate-50 border-slate-200 text-slate-800' : 'bg-white/5 border-white/10 text-zinc-300'
              }`}
            >
              <div className="flex justify-between items-center mb-1">
                <span className={isLight ? 'text-slate-500' : 'text-zinc-500'}>
                  {language === 'ar' ? 'العمل :' : language === 'en' ? 'Item :' : 'Ouvrage :'}
                </span>
                <span className={`font-semibold truncate max-w-[240px] ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  {productName}
                </span>
              </div>
              <div className="flex justify-between items-center mb-1">
                <span className={isLight ? 'text-slate-500' : 'text-zinc-500'}>
                  {language === 'ar' ? 'إجمالي الطلب :' : language === 'en' ? 'Total order :' : 'Montant total commande :'}
                </span>
                <span className={isLight ? 'text-slate-700' : 'text-zinc-300'}>
                  {totalPriceDzd.toLocaleString()} DZD
                </span>
              </div>
              <div
                className={`flex justify-between items-center border-t pt-1.5 mt-1.5 font-bold ${
                  isLight ? 'border-slate-200' : 'border-white/10'
                }`}
              >
                <span className={isLight ? 'text-slate-900' : 'text-white'}>
                  {language === 'ar' ? 'العربون المستحق (40%) :' : language === 'en' ? 'Deposit (40%) :' : 'Acompte exigible (40%) :'}
                </span>
                <span className="text-xl text-[#D4AF37]">
                  {depositAmountDzd.toLocaleString()} DZD
                </span>
              </div>
            </div>

            {/* Payment Method Switcher */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              <button
                onClick={() => {
                  playSwitchSound();
                  setPaymentMethod('baridimob');
                }}
                className={`py-2 px-2 rounded-xl border text-xs font-mono text-center cursor-pointer transition-all btn-press ${
                  paymentMethod === 'baridimob'
                    ? 'bg-[#D4AF37]/20 border-[#D4AF37] text-[#D4AF37] font-bold shadow-xs'
                    : isLight
                    ? 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    : 'bg-white/5 border-white/10 text-zinc-400'
                }`}
              >
                BaridiMob
              </button>
              <button
                onClick={() => {
                  playSwitchSound();
                  setPaymentMethod('cib');
                }}
                className={`py-2 px-2 rounded-xl border text-xs font-mono text-center cursor-pointer transition-all btn-press ${
                  paymentMethod === 'cib'
                    ? 'bg-[#D4AF37]/20 border-[#D4AF37] text-[#D4AF37] font-bold shadow-xs'
                    : isLight
                    ? 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    : 'bg-white/5 border-white/10 text-zinc-400'
                }`}
              >
                {language === 'ar' ? 'بطاقة ذهبية / CIB' : 'Carte CIB / Edahabia'}
              </button>
              <button
                onClick={() => {
                  playSwitchSound();
                  setPaymentMethod('cash');
                }}
                className={`py-2 px-2 rounded-xl border text-xs font-mono text-center cursor-pointer transition-all btn-press ${
                  paymentMethod === 'cash'
                    ? 'bg-[#D4AF37]/20 border-[#D4AF37] text-[#D4AF37] font-bold shadow-xs'
                    : isLight
                    ? 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    : 'bg-white/5 border-white/10 text-zinc-400'
                }`}
              >
                {language === 'ar' ? 'نقداً بالورشة' : language === 'en' ? 'Cash on Site' : 'Espèces Chantier'}
              </button>
            </div>

            {/* Method Details */}
            {paymentMethod === 'baridimob' && (
              <div
                className={`p-4 rounded-2xl border text-xs flex flex-col gap-3 ${
                  isLight ? 'bg-slate-50 border-slate-200 text-slate-800' : 'bg-[#090D15] border-white/10'
                }`}
              >
                <div className={`flex items-center justify-between ${isLight ? 'text-slate-700' : 'text-zinc-300'}`}>
                  <span className={`font-mono text-[10px] ${isLight ? 'text-slate-500' : 'text-zinc-500'}`}>
                    RIP ALGERIE POSTE :
                  </span>
                  <button
                    onClick={handleCopyRip}
                    className="flex items-center gap-1 text-[11px] font-mono text-[#D4AF37] hover:underline cursor-pointer btn-press"
                  >
                    {copiedRip ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    <span>
                      {copiedRip
                        ? language === 'ar'
                          ? 'تم النسخ !'
                          : 'Copié !'
                        : language === 'ar'
                        ? 'نسخ RIP'
                        : 'Copier RIP'}
                    </span>
                  </button>
                </div>
                <div
                  className={`font-mono text-sm font-bold p-2 rounded-xl border tracking-wider text-center ${
                    isLight
                      ? 'bg-white border-slate-300 text-slate-900 shadow-xs'
                      : 'bg-white/5 border-white/5 text-white'
                  }`}
                >
                  {mockRip}
                </div>
                <p className={`text-[11px] leading-relaxed ${isLight ? 'text-slate-600' : 'text-zinc-400'}`}>
                  {language === 'ar' ? (
                    <>
                      قم بإجراء التحويل بمبلغ{' '}
                      <strong className={isLight ? 'text-slate-900' : 'text-white'}>
                        {depositAmountDzd.toLocaleString()} دج
                      </strong>{' '}
                      عبر تطبيق بريدي موب، ثم شارك صورة الوصل مع الورشة.
                    </>
                  ) : language === 'en' ? (
                    <>
                      Complete the transfer of{' '}
                      <strong className={isLight ? 'text-slate-900' : 'text-white'}>
                        {depositAmountDzd.toLocaleString()} DZD
                      </strong>{' '}
                      via BaridiMob, then share the receipt with the workshop.
                    </>
                  ) : (
                    <>
                      Effectuez le virement de{' '}
                      <strong className={isLight ? 'text-slate-900' : 'text-white'}>
                        {depositAmountDzd.toLocaleString()} DZD
                      </strong>{' '}
                      sur l'application BaridiMob, puis transmettez la capture du reçu à l'atelier.
                    </>
                  )}
                </p>
              </div>
            )}

            {paymentMethod === 'cib' && (
              <div
                className={`p-4 rounded-2xl border text-xs flex flex-col gap-3 ${
                  isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#090D15] border-white/10'
                }`}
              >
                <div className={`flex items-center gap-2 ${isLight ? 'text-slate-800' : 'text-zinc-300'}`}>
                  <CreditCard className="w-4 h-4 text-[#D4AF37]" />
                  <span className="font-semibold">
                    {language === 'ar'
                      ? 'بوابة دفع SATIM / CIB معتمدة'
                      : 'Passerelle SATIM / CIB Certifiée'}
                  </span>
                </div>
                <input
                  type="text"
                  placeholder={
                    language === 'ar'
                      ? 'رقم بطاقة الذهبية أو CIB (16 رقماً)'
                      : 'Numéro de carte Edahabia ou CIB (16 chiffres)'
                  }
                  className={`w-full px-3 py-2 rounded-xl border text-xs font-mono focus:outline-none focus:border-[#D4AF37] ${
                    isLight
                      ? 'bg-white border-slate-300 text-slate-900 placeholder-slate-400'
                      : 'bg-white/5 border-white/10 text-white placeholder-zinc-500'
                  }`}
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="MM/AA"
                    className={`w-full px-3 py-2 rounded-xl border text-xs font-mono focus:outline-none focus:border-[#D4AF37] ${
                      isLight
                        ? 'bg-white border-slate-300 text-slate-900 placeholder-slate-400'
                        : 'bg-white/5 border-white/10 text-white placeholder-zinc-500'
                    }`}
                  />
                  <input
                    type="password"
                    placeholder="CVV2"
                    maxLength={3}
                    className={`w-full px-3 py-2 rounded-xl border text-xs font-mono focus:outline-none focus:border-[#D4AF37] ${
                      isLight
                        ? 'bg-white border-slate-300 text-slate-900 placeholder-slate-400'
                        : 'bg-white/5 border-white/10 text-white placeholder-zinc-500'
                    }`}
                  />
                </div>
              </div>
            )}

            {paymentMethod === 'cash' && (
              <div
                className={`p-4 rounded-2xl border text-xs flex flex-col gap-2 ${
                  isLight ? 'bg-slate-50 border-slate-200 text-slate-800' : 'bg-[#090D15] border-white/10'
                }`}
              >
                <div className={`font-semibold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  {language === 'ar'
                    ? 'دفع العربون نقداً عند الزيارة الميدانية'
                    : 'Règlement en Espèces à la Visite Technique'}
                </div>
                <p className={`text-[11px] leading-relaxed ${isLight ? 'text-slate-600' : 'text-zinc-400'}`}>
                  {language === 'ar'
                    ? `يتنقل الحرفي إلى موقعكم لمعاينة المقاسات بالليزر وتأكيد الطلب، مع دفع العربون ${depositAmountDzd.toLocaleString()} دج مقابل وصل رسمي وعقد موقع.`
                    : language === 'en'
                    ? `The craftsman visits your site to verify dimensions by laser. The deposit of ${depositAmountDzd.toLocaleString()} DZD is paid against an official signed receipt.`
                    : `L'artisan se déplace sur votre chantier pour valider les cotes définitives au laser. L'acompte de ${depositAmountDzd.toLocaleString()} DZD sera versé contre reçu et contrat signé.`}
                </p>
              </div>
            )}

            {/* Action Submit */}
            <button
              onClick={handleSimulatePayment}
              disabled={isProcessing}
              className="w-full mt-4 py-3 rounded-xl bg-[#D4AF37] hover:bg-[#C5A880] text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-[#D4AF37]/25 cursor-pointer disabled:opacity-50 btn-press hover-lift"
            >
              {isProcessing ? (
                <span>
                  {language === 'ar'
                    ? 'جاري التحقق من العملية...'
                    : language === 'en'
                    ? 'Processing verification...'
                    : 'Vérification en cours...'}
                </span>
              ) : (
                <span>
                  {language === 'ar'
                    ? `تأكيد دفع العربون (${depositAmountDzd.toLocaleString()} دج)`
                    : language === 'en'
                    ? `Confirm Deposit of ${depositAmountDzd.toLocaleString()} DZD`
                    : `Confirmer l'Acompte de ${depositAmountDzd.toLocaleString()} DZD`}
                </span>
              )}
            </button>
          </div>
        ) : (
          <div className="text-center py-6 flex flex-col gap-3">
            <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center justify-center mx-auto mb-2">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 uppercase font-semibold">
              {language === 'ar'
                ? 'تم تسجيل العربون بنجاح'
                : language === 'en'
                ? 'Deposit Successfully Confirmed'
                : 'Acompte Enregistré avec Succès'}
            </span>
            <h3 className={`text-xl font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
              {language === 'ar'
                ? 'تم اعتماد الطلب لبدء التصنيع !'
                : language === 'en'
                ? 'Order Confirmed for Production!'
                : 'Commande Validée pour Fabrication !'}
            </h3>
            <p className={`text-xs max-w-sm mx-auto leading-relaxed ${isLight ? 'text-slate-600' : 'text-zinc-400'}`}>
              {language === 'ar' ? (
                <>
                  تم إشعار ورشة{' '}
                  <strong className={isLight ? 'text-slate-900' : 'text-white'}>{workshopName}</strong> بحجزكم.
                  تم إرسال تأكيد عبر رسالة نصية وواتساب.
                </>
              ) : language === 'en' ? (
                <>
                  Workshop <strong className={isLight ? 'text-slate-900' : 'text-white'}>{workshopName}</strong>{' '}
                  has been notified of your reservation. Confirmation sent via SMS and WhatsApp.
                </>
              ) : (
                <>
                  L'atelier <strong className={isLight ? 'text-slate-900' : 'text-white'}>{workshopName}</strong> a
                  été notifié de votre réservation. Un SMS et une confirmation WhatsApp vous ont été transmis.
                </>
              )}
            </p>

            <div className="pt-3">
              <button
                onClick={() => {
                  playClampSound();
                  const text = encodeURIComponent(
                    `Salam ${workshopName}, j'ai validé l'acompte pour la commande "${productName}" sur Baiti Atelier | بيتي. Voici mon contact.`
                  );
                  window.open(`https://wa.me/${workshopPhone.replace(/[^0-9]/g, '')}?text=${text}`, '_blank');
                }}
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer btn-press hover-lift"
              >
                <MessageCircle className="w-4 h-4" />
                <span>
                  {language === 'ar'
                    ? 'فتح محادثة واتساب مع الورشة'
                    : language === 'en'
                    ? 'Open WhatsApp Chat with Workshop'
                    : 'Ouvrir la Discussion WhatsApp'}
                </span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
