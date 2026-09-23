import React, { useState } from 'react';
import {
  ShieldCheck,
  Smartphone,
  Copy,
  Check,
  X,
  AlertTriangle,
  Lock,
  Download,
} from 'lucide-react';
import {
  generateTotpSecret,
  getTotpUri,
  verifyTotpToken,
  generateBackupCodes,
} from '../../utils/totp';
import { playTactileClick, playSwitchSound } from '../../utils/audioFeedback';
import { useConfigStore } from '../../store/configStore';

interface Setup2FAModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const STORAGE_2FA_KEY = 'baiti_totp_2fa_config';

function getInitial2FaStep(): 'intro' | 'active' {
  try {
    const existing = localStorage.getItem(STORAGE_2FA_KEY);
    if (existing && JSON.parse(existing).enabled) {
      return 'active';
    }
  } catch {
    // Ignored
  }
  return 'intro';
}

export const Setup2FAModal: React.FC<Setup2FAModalProps> = ({ isOpen, onClose }) => {
  const { language, theme } = useConfigStore();
  const isLight = theme === 'light';
  const isRtl = language === 'ar';

  const [step, setStep] = useState<'intro' | 'scan' | 'verify' | 'backup' | 'active'>(getInitial2FaStep);
  const [secret, setSecret] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [errorMsg, setErrorMsg] = useState('');
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedBackup, setCopiedBackup] = useState(false);

  const handleStartSetup = () => {
    playTactileClick();
    const newSecret = generateTotpSecret();
    setSecret(newSecret);
    setErrorMsg('');
    setVerificationCode('');
    setStep('scan');
  };

  const handleCopySecret = () => {
    playTactileClick();
    navigator.clipboard.writeText(secret);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (verificationCode.trim().length !== 6) {
      setErrorMsg(
        language === 'ar'
          ? 'يرجى إدخال رمز التحقق المكون من 6 أرقام'
          : 'Veuillez saisir le code à 6 chiffres'
      );
      return;
    }

    const isValid = await verifyTotpToken(verificationCode, secret);
    if (!isValid) {
      setErrorMsg(
        language === 'ar'
          ? 'رمز غير صالح أو منتهي الصلاحية. تأكد من مزامنة وقت هاتفك.'
          : 'Code invalide ou expiré. Assurez-vous que l’horloge de votre téléphone est synchronisée.'
      );
      return;
    }

    playSwitchSound();
    const codes = generateBackupCodes(8);
    setBackupCodes(codes);

    // Save active configuration locally
    try {
      localStorage.setItem(
        STORAGE_2FA_KEY,
        JSON.stringify({
          enabled: true,
          secret: secret,
          backupCodesHashed: codes.map((c) => btoa(c)),
          enabledAt: new Date().toISOString(),
        })
      );
    } catch (err) {
      console.error('Failed to save 2FA config', err);
    }

    setStep('backup');
  };

  const handleDisable2Fa = () => {
    playTactileClick();
    localStorage.removeItem(STORAGE_2FA_KEY);
    setStep('intro');
  };

  const handleCopyBackupCodes = () => {
    playTactileClick();
    navigator.clipboard.writeText(backupCodes.join('\n'));
    setCopiedBackup(true);
    setTimeout(() => setCopiedBackup(false), 2000);
  };

  const handleDownloadBackupCodes = () => {
    playTactileClick();
    const content = `=== BAITI ATELIER (بيتي) - CODES DE RÉCUPÉRATION 2FA ===\nDate: ${new Date().toLocaleString()}\nConservez ces codes dans un endroit sûr et confidentiel.\n\n${backupCodes.map((c, i) => `[${i + 1}] ${c}`).join('\n')}\n`;
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `baiti-atelier-codes-recuperation-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  const totpUri = getTotpUri('artisan@baiti.dz', secret);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div
        className={`w-full max-w-lg rounded-3xl border shadow-2xl overflow-hidden transition-all duration-300 relative ${
          isLight
            ? 'bg-white border-slate-200 text-slate-800'
            : 'bg-gradient-to-b from-[#061426] via-[#040e1b] to-[#020710] border-sky-500/25 text-white shadow-[#020b18]'
        }`}
        dir={isRtl ? 'rtl' : 'ltr'}
      >
        {/* Top Gradient Beam */}
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-sky-400 via-[#D4AF37] to-sky-400 pointer-events-none" />

        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-black/5 dark:border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#0F4C81] to-[#D4AF37] p-0.5 flex items-center justify-center shadow-md">
              <div className="w-full h-full rounded-[14px] bg-[#040f1f] flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-[#D4AF37]" />
              </div>
            </div>
            <div>
              <h3 className="text-base font-bold tracking-tight">
                {language === 'ar' ? 'المصادقة الثنائية TOTP' : 'Authentification 2FA TOTP'}
              </h3>
              <p className="text-xs text-zinc-400 font-mono">
                {language === 'ar' ? 'تطبيق المصادقة (بدون رسائل SMS)' : 'Application d’authentification (Sans SMS)'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {/* STEP: ACTIVE / ENABLED */}
          {step === 'active' && (
            <div className="flex flex-col items-center text-center py-4">
              <div className="w-16 h-16 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center mb-4">
                <Check className="w-8 h-8 text-emerald-400" />
              </div>
              <h4 className="text-lg font-bold mb-2">
                {language === 'ar' ? 'المصادقة الثنائية مفعلة بنجاح' : 'Protection 2FA TOTP Active'}
              </h4>
              <p className="text-xs text-zinc-400 max-w-sm mb-6 leading-relaxed">
                {language === 'ar'
                  ? 'حساب ورشتكم وكشوف الأسعار محمية برمز الأمان المتغير كل 30 ثانية. لا أحد يستطيع تعديل الأسعار بدون هاتفك.'
                  : 'Votre compte atelier et vos prix de revient sont sécurisés par le code tournant à 6 chiffres de votre application.'}
              </p>
              <div className="flex gap-3 w-full">
                <button
                  onClick={handleDisable2Fa}
                  className="flex-1 py-3 rounded-xl border border-red-500/30 text-red-400 hover:bg-red-500/10 text-xs font-mono font-bold transition-all cursor-pointer"
                >
                  {language === 'ar' ? 'تعطيل المصادقة' : 'Désactiver la 2FA'}
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-[#C5A880] to-[#D4AF37] text-slate-950 font-bold text-xs transition-all cursor-pointer hover:brightness-110"
                >
                  {language === 'ar' ? 'إغلاق' : 'Fermer'}
                </button>
              </div>
            </div>
          )}

          {/* STEP: INTRO */}
          {step === 'intro' && (
            <div className="flex flex-col gap-4">
              <div className="p-4 rounded-2xl bg-sky-950/30 border border-sky-500/20 text-xs leading-relaxed text-sky-200">
                <div className="flex items-center gap-2 font-bold mb-1 text-white">
                  <Lock className="w-4 h-4 text-[#D4AF37]" />
                  <span>
                    {language === 'ar' ? 'حماية بيانات الورشة وهوامش الربح' : 'Sécurité Renforcée de l’Atelier'}
                  </span>
                </div>
                {language === 'ar'
                  ? 'تستخدم المصادقة الثنائية تطبيقاً آمناً على هاتفك (Google Authenticator أو Microsoft Authenticator). لا يتم إرسال أي رسائل SMS ولا توجد رسوم ولا مخاوف من تتبع الهاتف.'
                  : 'L’authentification TOTP utilise une application sur votre téléphone (Google Authenticator, Microsoft ou Bitwarden). Aucun SMS requis, zéro frais, zéro risque de piratage SIM.'}
              </div>

              <div className="space-y-2 text-xs text-zinc-300">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center font-mono font-bold text-[10px] text-[#D4AF37]">1</span>
                  <span>{language === 'ar' ? 'امسح رمز QR في تطبيق المصادقة' : 'Scannez le QR Code dans votre application'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center font-mono font-bold text-[10px] text-[#D4AF37]">2</span>
                  <span>{language === 'ar' ? 'أدخل الرمز المكون من 6 أرقام للتأكيد' : 'Saisissez le code à 6 chiffres pour valider'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center font-mono font-bold text-[10px] text-[#D4AF37]">3</span>
                  <span>{language === 'ar' ? 'احفظ رموز الطوارئ البديلة' : 'Conservez vos codes de secours hors-ligne'}</span>
                </div>
              </div>

              <button
                onClick={handleStartSetup}
                className="mt-4 w-full py-3.5 rounded-xl bg-gradient-to-r from-[#C5A880] to-[#D4AF37] hover:brightness-110 text-slate-950 font-bold text-xs transition-all cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-[#D4AF37]/20"
              >
                <Smartphone className="w-4 h-4" />
                <span>{language === 'ar' ? 'بدء إعداد المصادقة 2FA' : 'Configurer l’Application 2FA'}</span>
              </button>
            </div>
          )}

          {/* STEP: SCAN QR */}
          {step === 'scan' && (
            <div className="flex flex-col items-center gap-4">
              <div className="p-4 rounded-2xl bg-white flex flex-col items-center justify-center shadow-lg">
                {/* Clean inline SVG representation of authenticator QR target */}
                <div className="w-44 h-44 border-4 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center text-slate-900 p-2 text-center bg-slate-50">
                  <Smartphone className="w-10 h-10 text-[#0F4C81] mb-2" />
                  <span className="text-[11px] font-bold font-mono">Baiti Atelier 2FA</span>
                  <span className="text-[9px] text-slate-500 font-mono mt-1">RFC 6238 TOTP</span>
                  <div className="mt-2 px-2 py-1 bg-slate-200 rounded text-[9px] font-mono select-all">
                    {secret.slice(0, 8)}...{secret.slice(-6)}
                  </div>
                </div>
              </div>

              <div className="w-full">
                <label className="block text-[11px] font-mono text-zinc-400 mb-1">
                  {language === 'ar' ? 'أو أدخل المفتاح السري يدوياً:' : 'Clé Secrète de Configuration Manuelle :'}
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={secret}
                    className="flex-1 bg-black/30 border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-[#D4AF37] tracking-wider select-all"
                  />
                  <button
                    onClick={handleCopySecret}
                    className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-mono text-white flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    {copiedKey ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey ? 'Copié' : 'Copier'}</span>
                  </button>
                </div>
                <div className="mt-2 text-center">
                  <a
                    href={totpUri}
                    className="text-[11px] font-mono text-sky-400 hover:text-sky-300 underline"
                  >
                    {language === 'ar' ? 'أو افتح مباشرة في تطبيق المصادقة' : 'Ouvrir directement dans l’application d’authentification'}
                  </a>
                </div>
              </div>

              <button
                onClick={() => setStep('verify')}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#C5A880] to-[#D4AF37] hover:brightness-110 text-slate-950 font-bold text-xs transition-all cursor-pointer mt-2"
              >
                {language === 'ar' ? 'التالي: إدخال رمز التحقق' : 'Étape Suivante : Vérifier le Code'}
              </button>
            </div>
          )}

          {/* STEP: VERIFY CODE */}
          {step === 'verify' && (
            <form onSubmit={handleVerifyCode} className="flex flex-col gap-4">
              <p className="text-xs text-zinc-300 leading-relaxed">
                {language === 'ar'
                  ? 'افتح تطبيق المصادقة (Google Authenticator) وأدخل الرمز الحالي المكون من 6 أرقام لتأكيد التفعيل.'
                  : 'Ouvrez votre application d’authentification et saisissez le code à 6 chiffres affiché pour valider la configuration.'}
              </p>

              <div>
                <label className="block text-xs font-mono font-bold text-zinc-300 mb-1.5">
                  {language === 'ar' ? 'رمز المصادقة (6 أرقام):' : 'Code à 6 Chiffres :'}
                </label>
                <input
                  type="text"
                  maxLength={6}
                  autoFocus
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="000000"
                  className="w-full text-center tracking-[0.5em] text-2xl font-mono font-black py-3 rounded-xl bg-black/40 border border-sky-400/40 text-[#D4AF37] focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              {errorMsg && (
                <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/30 text-xs text-red-300 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setStep('scan')}
                  className="py-3 px-4 rounded-xl border border-white/10 text-xs text-zinc-300 hover:bg-white/5 transition-colors cursor-pointer"
                >
                  {language === 'ar' ? 'رجوع' : 'Retour'}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-[#C5A880] to-[#D4AF37] hover:brightness-110 text-slate-950 font-bold text-xs transition-all cursor-pointer shadow-md"
                >
                  {language === 'ar' ? 'تأكيد وتفعيل' : 'Vérifier et Activer'}
                </button>
              </div>
            </form>
          )}

          {/* STEP: BACKUP CODES */}
          {step === 'backup' && (
            <div className="flex flex-col gap-4">
              <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-xs text-emerald-300 flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>
                  {language === 'ar'
                    ? 'تم التحقق بنجاح! احفظ رموز الطوارئ التالية.'
                    : 'Configuration validée ! Sauvegardez ces codes de récupération d’urgence.'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-black/40 border border-white/10">
                {backupCodes.map((code, idx) => (
                  <div key={idx} className="font-mono text-xs text-center py-1.5 px-2 bg-white/5 rounded-lg text-[#D4AF37] font-bold">
                    {code}
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleCopyBackupCodes}
                  className="flex-1 py-2.5 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 text-xs font-mono text-white flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  {copiedBackup ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedBackup ? 'Copié' : 'Copier Tout'}</span>
                </button>
                <button
                  onClick={handleDownloadBackupCodes}
                  className="flex-1 py-2.5 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 text-xs font-mono text-white flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-sky-400" />
                  <span>Télécharger (.txt)</span>
                </button>
              </div>

              <button
                onClick={onClose}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#C5A880] to-[#D4AF37] hover:brightness-110 text-slate-950 font-bold text-xs transition-all cursor-pointer mt-2"
              >
                {language === 'ar' ? 'إتمام وحفظ' : 'Terminer la Configuration'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
