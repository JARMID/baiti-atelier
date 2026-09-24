import React, { useState, useRef } from 'react';
import {
  X,
  User,
  Building,
  Phone,
  MapPin,
  ShieldCheck,
  KeyRound,
  Upload,
  Check,
  LogOut,
  Sparkles,
  Briefcase,
  FileText,
} from 'lucide-react';
import { useAuthStore, PRESET_AVATARS, DEMO_PROFILES, type UserProfile } from '../../store/authStore';
import { useConfigStore } from '../../store/configStore';
import { ALGERIAN_WILAYAS_58 } from '../../utils/algerianWilayas';
import { playTactileClick, playSwitchSound } from '../../utils/audioFeedback';
import { validatePhoneNumber } from '../../lib/phoneValidator';
import { isEmailValidAndReal } from '../../lib/emailChecker';
import { evaluatePasswordPolicy } from '../../lib/passwordPolicy';

interface AuthAccountModalProps {
  onOpen2FaModal?: () => void;
}

export const AuthAccountModal: React.FC<AuthAccountModalProps> = ({ onOpen2FaModal }) => {
  const {
    user,
    isAuthenticated,
    isAuthModalOpen,
    authModalTab,
    closeAuthModal,
    openAuthModal,
    updateProfile,
    selectAvatar,
    loginWithDemo,
    login,
    signup,
    logout,
  } = useAuthStore();

  const { theme, language } = useConfigStore();
  const isLight = theme === 'light';
  const isRtl = language === 'ar';

  const [formName, setFormName] = useState(user?.name || '');
  const [formWorkshop, setFormWorkshop] = useState(user?.workshopName || '');
  const [formPhone, setFormPhone] = useState(user?.phone || '');
  const [formWilaya, setFormWilaya] = useState(user?.wilaya || '16 - Alger');
  const [formNif, setFormNif] = useState(user?.nif || '');
  const [formRc, setFormRc] = useState(user?.rc || '');
  const [formRole, setFormRole] = useState<UserProfile['role']>(user?.role || 'artisan');
  const [isSavedSuccess, setIsSavedSuccess] = useState(false);

  // Login & Signup state
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [signupWorkshop, setSignupWorkshop] = useState('');
  const [signupName, setSignupName] = useState('');
  const [signupPhone, setSignupPhone] = useState('');
  const [signupWilaya, setSignupWilaya] = useState('16 - Alger');

  const passwordPolicy = evaluatePasswordPolicy(passwordInput);
  const emailCheck = isEmailValidAndReal(emailInput);
  const phoneCheck = validatePhoneNumber(signupPhone);

  const handleFillMouradCredentials = () => {
    playTactileClick();
    setEmailInput('midbariola@gmail.com');
    setPasswordInput('BaitiPro2026!');
    setSignupName('Mourad Hadj-Ali');
    setSignupWorkshop('Atelier Aluminium Kouba');
    setSignupPhone('0797780838');
    setSignupWilaya('16 - Alger');
  };

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isAuthModalOpen) return null;

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    playTactileClick();
    updateProfile({
      name: formName,
      workshopName: formWorkshop,
      phone: formPhone,
      wilaya: formWilaya,
      nif: formNif,
      rc: formRc,
      role: formRole,
    });
    setIsSavedSuccess(true);
    setTimeout(() => setIsSavedSuccess(false), 2500);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        playSwitchSound();
        selectAvatar(dataUrl);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput) return;
    playTactileClick();
    login(emailInput, passwordInput);
  };

  const handleSignupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput || !signupWorkshop) return;
    playTactileClick();
    signup({
      name: signupName || emailInput.split('@')[0],
      workshopName: signupWorkshop,
      email: emailInput,
      phone: signupPhone || '0550 00 00 00',
      wilaya: signupWilaya,
      role: 'artisan',
      avatarUrl: PRESET_AVATARS[0].url,
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in"
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      <div
        className={`w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-3xl border shadow-2xl flex flex-col relative transition-all ${
          isLight
            ? 'bg-white border-slate-200 text-slate-800'
            : 'bg-gradient-to-b from-[#071326] to-[#030a17] border-white/15 text-zinc-100'
        }`}
      >
        {/* Top Header Bar */}
        <div className="flex items-center justify-between p-6 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#D4AF37] to-[#C5A880] flex items-center justify-center shadow-lg shadow-[#D4AF37]/20 text-slate-950 font-bold">
              <Building className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-serif font-bold tracking-tight">
                {isAuthenticated ? 'Profil Atelier & Compte Artisan' : 'Espace Membres Baiti Atelier'}
              </h3>
              <p className="text-xs text-zinc-400 font-mono">
                {isAuthenticated
                  ? 'Gestion de l’identité professionnelle et des coordonnées du devis'
                  : 'Connexion aux fiches de fabrication et synchronisation'}
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              playTactileClick();
              closeAuthModal();
            }}
            className="p-2 rounded-full hover:bg-white/10 transition-colors text-zinc-400 hover:text-white cursor-pointer"
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 flex-1 flex flex-col gap-6">
          {isAuthenticated && user ? (
            /* ========================================================================= */
            /* LOGGED IN: PROFILE & WORKSHOP SETTINGS                                    */
            /* ========================================================================= */
            <div className="flex flex-col gap-6">
              {/* Top Banner with Avatar & Identity */}
              <div
                className={`p-5 rounded-2xl border flex flex-col sm:flex-row items-center sm:items-start gap-4 ${
                  isLight ? 'bg-slate-50 border-slate-200' : 'bg-white/[0.03] border-white/10'
                }`}
              >
                <div className="relative group shrink-0">
                  <img
                    src={user.avatarUrl}
                    alt={user.name}
                    className="w-20 h-20 rounded-2xl object-cover border-2 border-[#D4AF37] shadow-xl"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute inset-0 bg-black/60 rounded-2xl flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-mono text-white cursor-pointer"
                  >
                    <Upload className="w-4 h-4 mb-1 text-[#D4AF37]" />
                    <span>Modifier</span>
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept="image/*"
                    className="hidden"
                  />
                </div>

                <div className="flex-1 flex flex-col items-center sm:items-start text-center sm:text-left rtl:sm:text-right">
                  <div className="flex items-center gap-2">
                    <h4 className="text-base font-bold font-serif">{user.workshopName}</h4>
                    {user.isVerified && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10px] font-mono font-bold">
                        <ShieldCheck className="w-3 h-3" />
                        <span>Vérifié</span>
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    {user.name} · {user.wilaya}
                  </p>
                  <p className="text-[11px] font-mono text-[#D4AF37] mt-1">{user.email}</p>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      onClick={() => {
                        playTactileClick();
                        closeAuthModal();
                        if (onOpen2FaModal) onOpen2FaModal();
                      }}
                      className="px-3 py-1 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] font-mono flex items-center gap-1.5 transition-colors cursor-pointer text-zinc-300"
                    >
                      <KeyRound className="w-3 h-3 text-emerald-400" />
                      <span>Sécurité 2FA</span>
                    </button>
                    <button
                      onClick={() => {
                        playTactileClick();
                        logout();
                      }}
                      className="px-3 py-1 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-[11px] font-mono flex items-center gap-1.5 transition-colors cursor-pointer text-red-400"
                    >
                      <LogOut className="w-3 h-3" />
                      <span>Déconnexion</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Avatar Selector Tray */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-mono text-zinc-400 flex items-center justify-between">
                  <span>CHOISIR UN AVATAR MÉTIER :</span>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="text-[#D4AF37] hover:underline cursor-pointer flex items-center gap-1"
                  >
                    <Upload className="w-3 h-3" />
                    <span>Photo personnalisée</span>
                  </button>
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {PRESET_AVATARS.map((p) => {
                    const isSelected = user.avatarUrl === p.url;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => {
                          playSwitchSound();
                          selectAvatar(p.url);
                        }}
                        className={`relative rounded-xl overflow-hidden border-2 transition-all p-0.5 cursor-pointer hover:scale-105 ${
                          isSelected
                            ? 'border-[#D4AF37] shadow-lg shadow-[#D4AF37]/30 ring-2 ring-[#D4AF37]/50'
                            : 'border-white/10 hover:border-white/30 opacity-70 hover:opacity-100'
                        }`}
                        title={p.title}
                      >
                        <img src={p.url} alt={p.title} className="w-full h-14 object-cover rounded-lg" />
                        {isSelected && (
                          <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[#D4AF37] text-slate-950 flex items-center justify-center">
                            <Check className="w-2.5 h-2.5 stroke-[3]" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Edit Details Form */}
              <form onSubmit={handleSaveProfile} className="flex flex-col gap-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-mono text-zinc-400 mb-1">
                      NOM DU RESPONSABLE / ARTISAN
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
                      <input
                        type="text"
                        value={formName}
                        onChange={(e) => setFormName(e.target.value)}
                        className={`w-full pl-9 pr-3 py-2 rounded-xl text-xs border font-medium focus:outline-none focus:border-[#D4AF37] ${
                          isLight ? 'bg-white border-slate-300' : 'bg-white/5 border-white/10'
                        }`}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono text-zinc-400 mb-1">
                      RAISON SOCIALE DE L'ATELIER
                    </label>
                    <div className="relative">
                      <Building className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
                      <input
                        type="text"
                        value={formWorkshop}
                        onChange={(e) => setFormWorkshop(e.target.value)}
                        className={`w-full pl-9 pr-3 py-2 rounded-xl text-xs border font-medium focus:outline-none focus:border-[#D4AF37] ${
                          isLight ? 'bg-white border-slate-300' : 'bg-white/5 border-white/10'
                        }`}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono text-zinc-400 mb-1">
                      TÉLÉPHONE DE L'ATELIER (WHATSAPP)
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
                      <input
                        type="tel"
                        value={formPhone}
                        onChange={(e) => setFormPhone(e.target.value)}
                        className={`w-full pl-9 pr-3 py-2 rounded-xl text-xs border font-mono focus:outline-none focus:border-[#D4AF37] ${
                          isLight ? 'bg-white border-slate-300' : 'bg-white/5 border-white/10'
                        }`}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono text-zinc-400 mb-1">
                      WILAYA D'IMPLANTATION
                    </label>
                    <div className="relative">
                      <MapPin className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
                      <select
                        value={formWilaya}
                        onChange={(e) => setFormWilaya(e.target.value)}
                        className={`w-full pl-9 pr-3 py-2 rounded-xl text-xs border font-mono focus:outline-none focus:border-[#D4AF37] cursor-pointer ${
                          isLight ? 'bg-white border-slate-300' : 'bg-[#0E1422] border-white/10 text-white'
                        }`}
                      >
                        {ALGERIAN_WILAYAS_58.map((w) => (
                          <option key={w.code} value={`${w.code} - ${w.nameFr}`}>
                            {w.code} - {w.nameFr} ({w.nameAr})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono text-zinc-400 mb-1">
                      NUMÉRO FISCAL (NIF - OPTIONNEL)
                    </label>
                    <div className="relative">
                      <FileText className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
                      <input
                        type="text"
                        value={formNif}
                        onChange={(e) => setFormNif(e.target.value)}
                        placeholder="Ex: 001916012345678"
                        className={`w-full pl-9 pr-3 py-2 rounded-xl text-xs border font-mono focus:outline-none focus:border-[#D4AF37] ${
                          isLight ? 'bg-white border-slate-300' : 'bg-white/5 border-white/10'
                        }`}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono text-zinc-400 mb-1">
                      REGISTRE DE COMMERCE (RC)
                    </label>
                    <div className="relative">
                      <Briefcase className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
                      <input
                        type="text"
                        value={formRc}
                        onChange={(e) => setFormRc(e.target.value)}
                        placeholder="Ex: 16/00-1234567B19"
                        className={`w-full pl-9 pr-3 py-2 rounded-xl text-xs border font-mono focus:outline-none focus:border-[#D4AF37] ${
                          isLight ? 'bg-white border-slate-300' : 'bg-white/5 border-white/10'
                        }`}
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-mono text-zinc-400 mb-1">
                      RÔLE & QUALIFICATION PROFESSIONNELLE
                    </label>
                    <div className="relative">
                      <Briefcase className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
                      <select
                        value={formRole}
                        onChange={(e) => setFormRole(e.target.value as UserProfile['role'])}
                        className={`w-full pl-9 pr-3 py-2 rounded-xl text-xs border font-mono focus:outline-none focus:border-[#D4AF37] cursor-pointer ${
                          isLight ? 'bg-white border-slate-300' : 'bg-[#0E1422] border-white/10 text-white'
                        }`}
                      >
                        <option value="artisan">Maître Artisan Fabricant (Atelier)</option>
                        <option value="bureau_etude">Bureau d’Études & Chiffrage</option>
                        <option value="poseur">Technicien Poseur sur Chantier</option>
                        <option value="client">Client Promoteur / Particulier</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Switch Demo Profiles Helper */}
                <div
                  className={`p-3 rounded-xl border flex flex-col gap-2 ${
                    isLight ? 'bg-slate-100 border-slate-200' : 'bg-white/[0.02] border-white/10'
                  }`}
                >
                  <span className="text-[10px] font-mono text-zinc-400 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-[#D4AF37]" />
                    <span>CHARGER UN PROFIL D’ATELIER TEST ALGÉRIE :</span>
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {DEMO_PROFILES.map((dp) => (
                      <button
                        key={dp.id}
                        type="button"
                        onClick={() => {
                          playSwitchSound();
                          loginWithDemo(dp.id);
                          setFormName(dp.name);
                          setFormWorkshop(dp.workshopName);
                          setFormPhone(dp.phone);
                          setFormWilaya(dp.wilaya);
                          setFormNif(dp.nif || '');
                          setFormRc(dp.rc || '');
                        }}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-mono border transition-all cursor-pointer ${
                          user.id === dp.id
                            ? 'bg-[#D4AF37]/20 border-[#D4AF37] text-[#D4AF37]'
                            : 'bg-white/5 border-white/10 text-zinc-300 hover:border-white/20'
                        }`}
                      >
                        {dp.workshopName} ({dp.wilaya.split(' - ')[0]})
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  {isSavedSuccess ? (
                    <span className="text-xs font-mono text-emerald-400 flex items-center gap-1.5">
                      <Check className="w-4 h-4" />
                      <span>Coordonnées de l'atelier enregistrées !</span>
                    </span>
                  ) : (
                    <span className="text-[11px] font-mono text-zinc-500">
                      Ces informations figureront sur les devis proforma exportés.
                    </span>
                  )}

                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#C5A880] text-slate-950 font-bold text-xs font-mono tracking-wider uppercase hover:brightness-110 shadow-lg shadow-[#D4AF37]/20 transition-all cursor-pointer active:scale-95"
                  >
                    Enregistrer Profil
                  </button>
                </div>
              </form>
            </div>
          ) : (
            /* ========================================================================= */
            /* LOGGED OUT: LOGIN / SIGNUP WITH DEMO BUTTONS                             */
            /* ========================================================================= */
            <div className="flex flex-col gap-6">
              {/* Tab Selector */}
              <div className="flex items-center p-1 rounded-xl bg-white/5 border border-white/10">
                <button
                  type="button"
                  onClick={() => openAuthModal('login')}
                  className={`flex-1 py-1.5 text-xs font-mono font-bold rounded-lg transition-all cursor-pointer ${
                    authModalTab === 'login' ? 'bg-[#D4AF37] text-slate-950' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  Se Connecter
                </button>
                <button
                  type="button"
                  onClick={() => openAuthModal('signup')}
                  className={`flex-1 py-1.5 text-xs font-mono font-bold rounded-lg transition-all cursor-pointer ${
                    authModalTab === 'signup' ? 'bg-[#D4AF37] text-slate-950' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  Créer un Atelier
                </button>
              </div>

              {/* Pre-fill Mourad Hadj-Ali Shortcut Button */}
              <button
                type="button"
                onClick={handleFillMouradCredentials}
                className="p-2.5 rounded-xl bg-[#D4AF37]/10 hover:bg-[#D4AF37]/20 border border-[#D4AF37]/40 flex items-center justify-between text-left transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#D4AF37]" />
                  <div>
                    <span className="block text-xs font-bold text-[#D4AF37]">
                      Compte Test : Mourad Hadj-Ali (Kouba)
                    </span>
                    <span className="text-[10px] text-zinc-400 font-mono">
                      midbariola@gmail.com · 0797780838 · BaitiPro2026!
                    </span>
                  </div>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#D4AF37] text-slate-950 font-bold group-hover:scale-105 transition-transform">
                  Préremplir
                </span>
              </button>

              {authModalTab === 'login' ? (
                <form onSubmit={handleLoginSubmit} className="flex flex-col gap-4">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-[11px] font-mono text-zinc-400">
                        ADRESSE EMAIL PROFESSIONNELLE
                      </label>
                      {emailInput && (
                        <span className={`text-[10px] font-mono ${emailCheck.valid ? 'text-emerald-400' : 'text-amber-400'}`}>
                          {emailCheck.valid ? 'Email Valide' : 'Format Requis'}
                        </span>
                      )}
                    </div>
                    <input
                      type="email"
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      placeholder="midbariola@gmail.com"
                      className={`w-full px-3 py-2 rounded-xl text-xs border font-medium focus:outline-none focus:border-[#D4AF37] ${
                        isLight ? 'bg-white border-slate-300' : 'bg-white/5 border-white/10'
                      }`}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-mono text-zinc-400 mb-1">
                      MOT DE PASSE (BaitiPro2026!)
                    </label>
                    <input
                      type="password"
                      value={passwordInput}
                      onChange={(e) => setPasswordInput(e.target.value)}
                      placeholder="••••••••••••"
                      className={`w-full px-3 py-2 rounded-xl text-xs border font-mono focus:outline-none focus:border-[#D4AF37] ${
                        isLight ? 'bg-white border-slate-300' : 'bg-white/5 border-white/10'
                      }`}
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#C5A880] text-slate-950 font-bold text-xs font-mono tracking-wider uppercase hover:brightness-110 shadow-lg shadow-[#D4AF37]/20 transition-all cursor-pointer"
                  >
                    Connexion Atelier
                  </button>
                </form>
              ) : (
                <form onSubmit={handleSignupSubmit} className="flex flex-col gap-3">
                  <div>
                    <label className="block text-[11px] font-mono text-zinc-400 mb-1">
                      NOM DE VOTRE ATELIER
                    </label>
                    <input
                      type="text"
                      value={signupWorkshop}
                      onChange={(e) => setSignupWorkshop(e.target.value)}
                      placeholder="Ex: Atelier Aluminium Kouba"
                      className={`w-full px-3 py-2 rounded-xl text-xs border font-medium focus:outline-none focus:border-[#D4AF37] ${
                        isLight ? 'bg-white border-slate-300' : 'bg-white/5 border-white/10'
                      }`}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-mono text-zinc-400 mb-1">
                        NOM DE L’ARTISAN
                      </label>
                      <input
                        type="text"
                        value={signupName}
                        onChange={(e) => setSignupName(e.target.value)}
                        placeholder="Ex: Mourad Hadj-Ali"
                        className={`w-full px-3 py-2 rounded-xl text-xs border font-medium focus:outline-none focus:border-[#D4AF37] ${
                          isLight ? 'bg-white border-slate-300' : 'bg-white/5 border-white/10'
                        }`}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-mono text-zinc-400 mb-1">WILAYA</label>
                      <select
                        value={signupWilaya}
                        onChange={(e) => setSignupWilaya(e.target.value)}
                        className={`w-full px-3 py-2 rounded-xl text-xs border font-mono focus:outline-none focus:border-[#D4AF37] cursor-pointer ${
                          isLight ? 'bg-white border-slate-300' : 'bg-[#0E1422] border-white/10 text-white'
                        }`}
                      >
                        {ALGERIAN_WILAYAS_58.map((w) => (
                          <option key={w.code} value={`${w.code} - ${w.nameFr}`}>
                            {w.code} - {w.nameFr}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-mono text-zinc-400 mb-1">EMAIL</label>
                      <input
                        type="email"
                        value={emailInput}
                        onChange={(e) => setEmailInput(e.target.value)}
                        placeholder="midbariola@gmail.com"
                        className={`w-full px-3 py-2 rounded-xl text-xs border font-medium focus:outline-none focus:border-[#D4AF37] ${
                          isLight ? 'bg-white border-slate-300' : 'bg-white/5 border-white/10'
                        }`}
                        required
                      />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-[11px] font-mono text-zinc-400">TÉLÉPHONE</label>
                        {phoneCheck.operator && (
                          <span className="text-[9px] font-mono text-emerald-400 font-bold">
                            {phoneCheck.operator}
                          </span>
                        )}
                      </div>
                      <input
                        type="tel"
                        value={signupPhone}
                        onChange={(e) => setSignupPhone(e.target.value)}
                        placeholder="0797780838"
                        className={`w-full px-3 py-2 rounded-xl text-xs border font-mono focus:outline-none focus:border-[#D4AF37] ${
                          isLight ? 'bg-white border-slate-300' : 'bg-white/5 border-white/10'
                        }`}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono text-zinc-400 mb-1">
                      MOT DE PASSE SÉCURISÉ
                    </label>
                    <input
                      type="password"
                      value={passwordInput}
                      onChange={(e) => setPasswordInput(e.target.value)}
                      placeholder="BaitiPro2026!"
                      className={`w-full px-3 py-2 rounded-xl text-xs border font-mono focus:outline-none focus:border-[#D4AF37] ${
                        isLight ? 'bg-white border-slate-300' : 'bg-white/5 border-white/10'
                      }`}
                      required
                    />
                  </div>

                  {/* Password Security Checklist */}
                  <div
                    className={`p-3 rounded-xl border text-[11px] font-mono flex flex-col gap-1.5 ${
                      isLight ? 'bg-slate-100 border-slate-200' : 'bg-white/[0.03] border-white/10'
                    }`}
                  >
                    <span className="text-[10px] font-bold text-zinc-400">CRITÈRES DE SÉCURITÉ :</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-[10px]">
                      <span className={`flex items-center gap-1.5 ${passwordPolicy.isLengthValid ? 'text-emerald-400 font-bold' : 'text-zinc-500'}`}>
                        {passwordPolicy.isLengthValid ? '✓' : '•'} Min. 8 caractères
                      </span>
                      <span className={`flex items-center gap-1.5 ${passwordPolicy.hasUpperCase ? 'text-emerald-400 font-bold' : 'text-zinc-500'}`}>
                        {passwordPolicy.hasUpperCase ? '✓' : '•'} Majuscule (A-Z)
                      </span>
                      <span className={`flex items-center gap-1.5 ${passwordPolicy.hasLowerCase ? 'text-emerald-400 font-bold' : 'text-zinc-500'}`}>
                        {passwordPolicy.hasLowerCase ? '✓' : '•'} Minuscule (a-z)
                      </span>
                      <span className={`flex items-center gap-1.5 ${passwordPolicy.hasNumber ? 'text-emerald-400 font-bold' : 'text-zinc-500'}`}>
                        {passwordPolicy.hasNumber ? '✓' : '•'} Chiffre (0-9)
                      </span>
                      <span className={`flex items-center gap-1.5 ${passwordPolicy.hasSpecialChar ? 'text-emerald-400 font-bold' : 'text-zinc-500'}`}>
                        {passwordPolicy.hasSpecialChar ? '✓' : '•'} Spécial (!@#$%)
                      </span>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#C5A880] text-slate-950 font-bold text-xs font-mono tracking-wider uppercase hover:brightness-110 shadow-lg shadow-[#D4AF37]/20 transition-all cursor-pointer mt-2"
                  >
                    Créer mon Espace Atelier
                  </button>
                </form>
              )}

              {/* Instant 1-Click Demo Profiles */}
              <div
                className={`p-4 rounded-2xl border flex flex-col gap-3 ${
                  isLight ? 'bg-slate-50 border-slate-200' : 'bg-white/[0.02] border-white/10'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#D4AF37]" />
                  <span className="text-xs font-serif font-bold">
                    Ou essayez instantanément un atelier agréé :
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {DEMO_PROFILES.map((dp) => (
                    <button
                      key={dp.id}
                      type="button"
                      onClick={() => {
                        playTactileClick();
                        loginWithDemo(dp.id);
                      }}
                      className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex flex-col items-center text-center gap-2 transition-all cursor-pointer hover:border-[#D4AF37]/40 group"
                    >
                      <img
                        src={dp.avatarUrl}
                        alt={dp.name}
                        className="w-10 h-10 rounded-full object-cover border border-[#D4AF37]/40 group-hover:border-[#D4AF37]"
                      />
                      <div>
                        <span className="block text-xs font-bold leading-tight">{dp.workshopName}</span>
                        <span className="text-[10px] text-zinc-400 font-mono">{dp.wilaya}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
