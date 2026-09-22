import React, { useState, useMemo } from 'react';
import {
  VillaFacadeCanvas,
  type FacadeOpening,
  type WallFinish,
  type LightingAtmosphere,
} from './VillaFacadeCanvas';
import { useConfigStore } from '../../store/configStore';
import {
  Sun,
  Sunset,
  Moon,
  Building2,
  DollarSign,
  Send,
  Scissors,
  CheckCircle2,
  Eye,
} from 'lucide-react';
import {
  playTactileClick,
  playClampSound,
  playSwitchSound,
  playSlideTick,
} from '../../utils/audioFeedback';

const INITIAL_VILLA_OPENINGS: FacadeOpening[] = [
  {
    id: 'op-rdc-door',
    refCode: 'P01',
    name: "Porte d'Entrée Principale",
    floor: 'RDC',
    x: -3.2,
    y: 0.16,
    widthMm: 1100,
    heightMm: 2200,
    type: 'entrance_door',
    profileColor: '#2B2E33',
    hasShutter: false,
    shutterPosition: 100,
    hasGrille: false,
    hasBalcony: false,
    unitPriceDzd: 88000,
  },
  {
    id: 'op-rdc-salon',
    refCode: 'BC01',
    name: 'Baie Coulissante Grand Salon',
    floor: 'RDC',
    x: 1.6,
    y: 0.16,
    widthMm: 3200,
    heightMm: 2200,
    type: 'sliding_bay',
    profileColor: '#2B2E33',
    hasShutter: true,
    shutterPosition: 70,
    hasGrille: false,
    hasBalcony: false,
    unitPriceDzd: 154000,
  },
  {
    id: 'op-rdc-cuisine',
    refCode: 'F01',
    name: 'Fenêtre Cuisine & Sécurité',
    floor: 'RDC',
    x: -1.2,
    y: 1.0,
    widthMm: 1400,
    heightMm: 1200,
    type: 'tilt_turn',
    profileColor: '#2B2E33',
    hasShutter: true,
    shutterPosition: 100,
    hasGrille: true,
    hasBalcony: false,
    unitPriceDzd: 62000,
  },
  {
    id: 'op-r1-suite',
    refCode: 'BC02',
    name: 'Baie Vitrée Suite avec Balcon',
    floor: 'R+1',
    x: 1.6,
    y: 3.5,
    widthMm: 2400,
    heightMm: 2200,
    type: 'sliding_bay',
    profileColor: '#2B2E33',
    hasShutter: true,
    shutterPosition: 85,
    hasGrille: false,
    hasBalcony: true,
    unitPriceDzd: 126000,
  },
  {
    id: 'op-r1-chambre1',
    refCode: 'F02',
    name: 'Fenêtre Chambre 1',
    floor: 'R+1',
    x: -1.2,
    y: 4.1,
    widthMm: 1400,
    heightMm: 1400,
    type: 'casement_window',
    profileColor: '#2B2E33',
    hasShutter: true,
    shutterPosition: 100,
    hasGrille: false,
    hasBalcony: false,
    unitPriceDzd: 54000,
  },
  {
    id: 'op-r1-chambre2',
    refCode: 'F03',
    name: 'Fenêtre Chambre 2',
    floor: 'R+1',
    x: -3.2,
    y: 4.1,
    widthMm: 1400,
    heightMm: 1400,
    type: 'casement_window',
    profileColor: '#2B2E33',
    hasShutter: true,
    shutterPosition: 100,
    hasGrille: false,
    hasBalcony: false,
    unitPriceDzd: 54000,
  },
];

export const VillaFacadeStudio3D: React.FC = () => {
  const { selectedWilaya, language, theme } = useConfigStore();
  const isLight = theme === 'light';
  const isRtl = language === 'ar';

  const [openings, setOpenings] = useState<FacadeOpening[]>(INITIAL_VILLA_OPENINGS);
  const [selectedOpeningId, setSelectedOpeningId] = useState<string>('op-rdc-salon');
  const [wallFinish, setWallFinish] = useState<WallFinish>('enduit_blanc');
  const [atmosphere, setAtmosphere] = useState<LightingAtmosphere>('day');
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const selectedOpening = useMemo(
    () => openings.find((o) => o.id === selectedOpeningId) || openings[0],
    [openings, selectedOpeningId]
  );

  const totals = useMemo(() => {
    const totalHt = openings.reduce((sum, o) => sum + o.unitPriceDzd, 0);
    const totalAreaM2 = (
      openings.reduce((sum, o) => sum + (o.widthMm * o.heightMm) / 1000000, 0)
    ).toFixed(2);
    const totalTtc = Math.round(totalHt * 1.19);
    const acompte40 = Math.round(totalTtc * 0.4);
    const solde60 = totalTtc - acompte40;

    return {
      count: openings.length,
      totalHt,
      totalTtc,
      totalAreaM2,
      acompte40,
      solde60,
    };
  }, [openings]);

  // Set all shutters at once
  const setAllShutters = (percent: number) => {
    playSwitchSound();
    setOpenings((prev) =>
      prev.map((o) => (o.hasShutter ? { ...o, shutterPosition: percent } : o))
    );
  };

  // Update selected opening property
  const updateSelectedOpening = (patch: Partial<FacadeOpening>) => {
    setOpenings((prev) =>
      prev.map((o) => (o.id === selectedOpening.id ? { ...o, ...patch } : o))
    );
  };

  const handleShareWhatsApp = () => {
    playTactileClick();
    const lines: string[] = [
      '*DEVIS CHANTIER FAÇADE VILLA: BAITI ATELIER | بيتي*',
      `Wilaya: ${selectedWilaya}`,
      `Date: ${new Date().toLocaleDateString('fr-DZ')}`,
      `Nombre total d'ouvrages: ${totals.count} châssis`,
      `Surface vitrée totale: ${totals.totalAreaM2} m²`,
      '',
      '*Détail des Ouvrages par Niveau:*',
    ];

    openings.forEach((o) => {
      const shutterText = o.hasShutter ? 'avec volet roulant' : 'sans volet';
      lines.push(
        `• [${o.refCode}] ${o.name} (${o.floor}) : ${o.widthMm} × ${o.heightMm} mm, ${shutterText} - ${o.unitPriceDzd.toLocaleString()} DZD`
      );
    });

    lines.push('');
    lines.push(`*Total Châssis HT :* ${totals.totalHt.toLocaleString()} DZD`);
    lines.push(`*TVA (19%) :* ${Math.round(totals.totalHt * 0.19).toLocaleString()} DZD`);
    lines.push(`*TOTAL CHANTIER TTC :* ${totals.totalTtc.toLocaleString()} DZD`);

    const encoded = encodeURIComponent(lines.join('\n'));
    window.open(`https://wa.me/213550123456?text=${encoded}`, '_blank');
  };

  const handleSendToOptimizer = () => {
    playClampSound();
    const msg =
      language === 'ar'
        ? `تم تصدير ${totals.count} إطارات من الواجهة بنجاح إلى مُحسّن قص الألمنيوم.`
        : language === 'en'
        ? `${totals.count} facade openings exported to aluminum cut optimizer.`
        : `${totals.count} châssis de la façade envoyés vers l'optimiseur de coupe.`;
    setActionSuccess(msg);
    setTimeout(() => setActionSuccess(null), 4000);
  };

  return (
    <div className="flex flex-col gap-6" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Studio Header Bar */}
      <div
        className={`flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-3xl border backdrop-blur-xl transition-colors duration-300 shadow-xl ${
          isLight
            ? 'bg-white/95 border-slate-200 text-slate-900 shadow-slate-200/50'
            : 'bg-[#0F1422]/80 border-white/10 text-white'
        }`}
      >
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#C5A880] to-[#D4AF37] flex items-center justify-center text-white shadow-lg shadow-[#D4AF37]/20 shrink-0">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-extrabold tracking-tight">
                {language === 'ar' ? 'استوديو واجهة الفيلا 3D' : language === 'en' ? '3D Villa Facade Studio' : 'Studio Façade de Villa 3D'}
              </h3>
              <span className="px-2.5 py-0.5 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/30 text-xs font-mono text-[#D4AF37] font-semibold">
                {language === 'ar' ? 'طابق أرضي + علوي' : language === 'en' ? 'GF + 1st Floor' : 'RDC + R+1'}
              </span>
            </div>
            <p className={`text-xs mt-0.5 ${isLight ? 'text-slate-600' : 'text-zinc-400'}`}>
              {language === 'ar'
                ? 'تصميم شامل وحساب تكلفة فتحات النوافذ والأبواب للفلل والمنازل الخاصة.'
                : language === 'en'
                ? 'Comprehensive architectural facade and joinery quote for villas and residences.'
                : 'Conception d’ensemble et chiffrage global des ouvertures pour villas et résidences.'}
            </p>
          </div>
        </div>

        {/* Lighting & Wall Finish Toolbars */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Atmosphere Selector */}
          <div
            className={`flex items-center p-1 rounded-2xl border ${
              isLight ? 'bg-slate-100 border-slate-200' : 'bg-black/50 border-white/10'
            }`}
          >
            <button
              onClick={() => {
                playSwitchSound();
                setAtmosphere('day');
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer btn-press ${
                atmosphere === 'day'
                  ? 'bg-amber-500/20 text-amber-500 border border-amber-500/40 font-bold'
                  : isLight
                  ? 'text-slate-600 hover:text-slate-900'
                  : 'text-zinc-400 hover:text-white'
              }`}
              title="Jour ensoleillé"
            >
              <Sun className="w-3.5 h-3.5 text-amber-500" />
              <span>{language === 'ar' ? 'نهار' : language === 'en' ? 'Day' : 'Jour'}</span>
            </button>
            <button
              onClick={() => {
                playSwitchSound();
                setAtmosphere('golden_hour');
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer btn-press ${
                atmosphere === 'golden_hour'
                  ? 'bg-orange-500/20 text-orange-500 border border-orange-500/40 font-bold'
                  : isLight
                  ? 'text-slate-600 hover:text-slate-900'
                  : 'text-zinc-400 hover:text-white'
              }`}
              title="Coucher de soleil doré"
            >
              <Sunset className="w-3.5 h-3.5 text-orange-500" />
              <span>{language === 'ar' ? 'غروب' : language === 'en' ? 'Sunset' : 'Doré'}</span>
            </button>
            <button
              onClick={() => {
                playSwitchSound();
                setAtmosphere('night');
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer btn-press ${
                atmosphere === 'night'
                  ? 'bg-indigo-500/20 text-indigo-500 border border-indigo-500/40 font-bold'
                  : isLight
                  ? 'text-slate-600 hover:text-slate-900'
                  : 'text-zinc-400 hover:text-white'
              }`}
              title="Ambiance nocturne"
            >
              <Moon className="w-3.5 h-3.5 text-indigo-500" />
              <span>{language === 'ar' ? 'ليل' : language === 'en' ? 'Night' : 'Nuit'}</span>
            </button>
          </div>

          {/* Wall Finish Selector */}
          <div
            className={`flex items-center p-1 rounded-2xl border ${
              isLight ? 'bg-slate-100 border-slate-200' : 'bg-black/50 border-white/10'
            }`}
          >
            <button
              onClick={() => {
                playSwitchSound();
                setWallFinish('enduit_blanc');
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer btn-press ${
                wallFinish === 'enduit_blanc'
                  ? isLight
                    ? 'bg-white text-slate-900 font-bold shadow-xs'
                    : 'bg-white/20 text-white font-bold'
                  : isLight
                  ? 'text-slate-600 hover:text-slate-900'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              {language === 'ar' ? 'إندوي أبيض' : language === 'en' ? 'White Plaster' : 'Enduit Blanc'}
            </button>
            <button
              onClick={() => {
                playSwitchSound();
                setWallFinish('pierre_saharienne');
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer btn-press ${
                wallFinish === 'pierre_saharienne'
                  ? 'bg-amber-600/30 text-amber-500 font-bold border border-amber-500/30'
                  : isLight
                  ? 'text-slate-600 hover:text-slate-900'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              {language === 'ar' ? 'حجر صحراوي' : language === 'en' ? 'Saharan Stone' : 'Pierre Dorée'}
            </button>
            <button
              onClick={() => {
                playSwitchSound();
                setWallFinish('crepis_anthracite');
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer btn-press ${
                wallFinish === 'crepis_anthracite'
                  ? isLight
                    ? 'bg-slate-300 text-slate-900 font-bold'
                    : 'bg-zinc-700/50 text-zinc-200 font-bold'
                  : isLight
                  ? 'text-slate-600 hover:text-slate-900'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              {language === 'ar' ? 'رمادي أنثراسيت' : language === 'en' ? 'Anthracite Stucco' : 'Anthracite'}
            </button>
          </div>
        </div>
      </div>

      {/* Global Shutter Quick Automation Bar */}
      <div
        className={`flex flex-wrap items-center justify-between gap-3 px-5 py-3 rounded-2xl border ${
          isLight ? 'bg-slate-50 border-slate-200 text-slate-700' : 'bg-black/40 border-white/5 text-zinc-300'
        }`}
      >
        <div className="flex items-center gap-2 text-xs font-mono">
          <Eye className="w-4 h-4 text-[#D4AF37]" />
          <span>{language === 'ar' ? 'التحكم الجماعي بالستائر الدوارة:' : language === 'en' ? 'Grouped Shutter Control:' : 'Commande Groupée Volets Roulants :'}</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setAllShutters(100)}
            className={`px-3 py-1 rounded-xl border text-xs font-medium text-emerald-500 transition-colors cursor-pointer btn-press ${
              isLight ? 'bg-white hover:bg-slate-100 border-slate-200 shadow-xs' : 'bg-white/5 hover:bg-white/10 border-white/10'
            }`}
          >
            {language === 'ar' ? 'فتح الكل (100%)' : language === 'en' ? 'Open All (100%)' : 'Tout Ouvrir (100%)'}
          </button>
          <button
            onClick={() => setAllShutters(30)}
            className={`px-3 py-1 rounded-xl border text-xs font-medium text-amber-500 transition-colors cursor-pointer btn-press ${
              isLight ? 'bg-white hover:bg-slate-100 border-slate-200 shadow-xs' : 'bg-white/5 hover:bg-white/10 border-white/10'
            }`}
          >
            {language === 'ar' ? 'حماية من الشمس (30%)' : language === 'en' ? 'Heat Protection (30%)' : 'Protection Canicule (30%)'}
          </button>
          <button
            onClick={() => setAllShutters(0)}
            className={`px-3 py-1 rounded-xl border text-xs font-medium transition-colors cursor-pointer btn-press ${
              isLight
                ? 'bg-white hover:bg-slate-100 border-slate-200 text-slate-600 shadow-xs'
                : 'bg-white/5 hover:bg-white/10 border-white/10 text-zinc-400 hover:text-white'
            }`}
          >
            {language === 'ar' ? 'إغلاق الكل (0%)' : language === 'en' ? 'Close All (0%)' : 'Tout Fermer (0%)'}
          </button>
        </div>
      </div>

      {/* Notification Toast */}
      {actionSuccess && (
        <div className="p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-500 text-xs font-mono flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Main Grid: 3D Facade Viewport (8 cols) + Opening Inspector & BOM (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: 3D Architectural Facade Canvas */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          <VillaFacadeCanvas
            openings={openings}
            selectedOpeningId={selectedOpeningId}
            onSelectOpening={(id) => {
              playTactileClick();
              setSelectedOpeningId(id);
            }}
            wallFinish={wallFinish}
            atmosphere={atmosphere}
          />

          {/* Facade Openings Selector Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
            {openings.map((o) => {
              const active = o.id === selectedOpeningId;
              return (
                <button
                  key={o.id}
                  onClick={() => {
                    playTactileClick();
                    setSelectedOpeningId(o.id);
                  }}
                  className={`p-3 rounded-2xl ${isRtl ? 'text-right' : 'text-left'} border transition-all cursor-pointer hover-lift btn-press ${
                    active
                      ? 'bg-[#D4AF37]/15 border-[#D4AF37] shadow-lg shadow-[#D4AF37]/10'
                      : isLight
                      ? 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
                      : 'bg-[#0E121D]/60 border-white/5 text-zinc-400 hover:border-white/20 hover:text-zinc-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold font-mono text-[#D4AF37]">
                      {o.refCode}
                    </span>
                    <span
                      className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                        isLight ? 'bg-slate-100 text-slate-600' : 'bg-white/5 text-zinc-400'
                      }`}
                    >
                      {o.floor}
                    </span>
                  </div>
                  <div className={`text-xs font-semibold truncate mt-1 ${isLight ? 'text-slate-800' : 'text-zinc-200'}`}>
                    {o.name}
                  </div>
                  <div className={`text-[11px] font-mono mt-0.5 ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
                    {o.widthMm} × {o.heightMm}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Selected Opening Inspector & Global Villa Financials */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          {/* Selected Châssis Inspector Card */}
          <div
            className={`p-5 rounded-3xl border flex flex-col gap-4 shadow-xl ${
              isLight
                ? 'bg-white border-slate-200 text-slate-900 shadow-slate-200/50'
                : 'bg-[#0D121E]/90 border-white/10 text-white'
            }`}
          >
            <div className={`flex items-center justify-between border-b pb-3 ${isLight ? 'border-slate-100' : 'border-white/10'}`}>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-xl bg-[#D4AF37]/15 text-[#D4AF37] font-mono font-bold text-xs">
                  {selectedOpening.refCode}
                </span>
                <h4 className={`font-bold text-sm ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  {selectedOpening.name}
                </h4>
              </div>
              <span className={`text-xs font-mono ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
                {selectedOpening.floor}
              </span>
            </div>

            {/* Dimensional Properties */}
            <div className="grid grid-cols-2 gap-2">
              <div className={`p-2.5 rounded-xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-white/5 border-white/5'}`}>
                <span className={`text-[10px] font-mono block ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
                  {language === 'ar' ? 'العرض (L)' : language === 'en' ? 'Width (W)' : 'Largeur (L)'}
                </span>
                <span className={`text-sm font-mono font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  {selectedOpening.widthMm} mm
                </span>
              </div>
              <div className={`p-2.5 rounded-xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-white/5 border-white/5'}`}>
                <span className={`text-[10px] font-mono block ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
                  {language === 'ar' ? 'الارتفاع (H)' : language === 'en' ? 'Height (H)' : 'Hauteur (H)'}
                </span>
                <span className={`text-sm font-mono font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  {selectedOpening.heightMm} mm
                </span>
              </div>
            </div>

            {/* Profile Color Palette */}
            <div>
              <label className={`text-xs font-mono block mb-1.5 ${isLight ? 'text-slate-600' : 'text-zinc-400'}`}>
                {language === 'ar' ? 'لون ودهان الألمنيوم:' : language === 'en' ? 'Profile Finish & Color:' : 'Teinte Aluminium / Finition :'}
              </label>
              <div className="flex items-center gap-2">
                {[
                  { color: '#2B2E33', label: 'Gris 7016 Anthracite' },
                  { color: '#F1F5F9', label: 'Blanc 9010 Brillant' },
                  { color: '#18181B', label: 'Noir 9005 Sablé' },
                  { color: '#5C381E', label: 'Faux Bois Chêne Doré' },
                ].map((item) => (
                  <button
                    key={item.color}
                    onClick={() => {
                      playTactileClick();
                      updateSelectedOpening({ profileColor: item.color });
                    }}
                    title={item.label}
                    className={`w-7 h-7 rounded-xl border-2 transition-transform cursor-pointer btn-press ${
                      selectedOpening.profileColor === item.color
                        ? 'border-[#D4AF37] scale-110 shadow-sm'
                        : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                    style={{ backgroundColor: item.color }}
                  />
                ))}
              </div>
            </div>

            {/* Roller Shutter Controls */}
            {selectedOpening.hasShutter && (
              <div className={`p-3 rounded-2xl border flex flex-col gap-2 ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-white/5 border-white/5'}`}>
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className={isLight ? 'text-slate-700' : 'text-zinc-300'}>
                    {language === 'ar' ? 'الستار الدوار:' : language === 'en' ? 'Roller Shutter Curtain:' : 'Tablier Volet Roulant :'}
                  </span>
                  <span className="text-[#D4AF37] font-bold">
                    {selectedOpening.shutterPosition}% {language === 'ar' ? 'مفتوح' : language === 'en' ? 'open' : 'ouvert'}
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={selectedOpening.shutterPosition}
                  onChange={(e) => {
                    playSlideTick();
                    updateSelectedOpening({ shutterPosition: Number(e.target.value) });
                  }}
                  className="w-full accent-[#D4AF37] cursor-pointer"
                />
              </div>
            )}

            {/* Accessories Toggles */}
            <div className="flex flex-col gap-2 pt-1">
              <label className={`flex items-center justify-between p-2.5 rounded-xl transition-colors cursor-pointer text-xs border btn-press ${
                isLight ? 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-800' : 'bg-white/5 hover:bg-white/10 border-white/5 text-zinc-300'
              }`}>
                <span>{language === 'ar' ? 'صندوق ستار دوار ألمنيوم' : language === 'en' ? 'Aluminum Shutter Box' : 'Coffre Volet Roulant Alu'}</span>
                <input
                  type="checkbox"
                  checked={selectedOpening.hasShutter}
                  onChange={(e) => {
                    playTactileClick();
                    updateSelectedOpening({ hasShutter: e.target.checked });
                  }}
                  className="w-4 h-4 accent-[#D4AF37] rounded cursor-pointer"
                />
              </label>

              {selectedOpening.floor === 'RDC' && (
                <label className={`flex items-center justify-between p-2.5 rounded-xl transition-colors cursor-pointer text-xs border btn-press ${
                  isLight ? 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-800' : 'bg-white/5 hover:bg-white/10 border-white/5 text-zinc-300'
                }`}>
                  <span>{language === 'ar' ? 'شباك حدادة حماية' : language === 'en' ? 'Wrought Iron Security Grille' : 'Grille Ferronnerie Sécurité'}</span>
                  <input
                    type="checkbox"
                    checked={selectedOpening.hasGrille}
                    onChange={(e) => {
                      playTactileClick();
                      updateSelectedOpening({ hasGrille: e.target.checked });
                    }}
                    className="w-4 h-4 accent-[#D4AF37] rounded cursor-pointer"
                  />
                </label>
              )}
            </div>

            {/* Unit Price */}
            <div className="p-3.5 rounded-2xl bg-[#D4AF37]/10 border border-[#D4AF37]/20 flex items-center justify-between">
              <span className={`text-xs font-mono ${isLight ? 'text-slate-700' : 'text-zinc-300'}`}>
                {language === 'ar' ? 'السعر التقديري للقطعة:' : language === 'en' ? 'Estimated Unit Price:' : 'Prix unitaire estimé :'}
              </span>
              <span className="text-base font-bold font-mono text-[#D4AF37]">
                {selectedOpening.unitPriceDzd.toLocaleString()} DZD
              </span>
            </div>
          </div>

          {/* Global Villa Project Financial Summary */}
          <div
            className={`p-5 rounded-3xl border flex flex-col gap-4 shadow-xl ${
              isLight
                ? 'bg-gradient-to-b from-white to-slate-50 border-slate-200 text-slate-900 shadow-slate-200/50'
                : 'bg-gradient-to-b from-[#131A2B] to-[#0A0D14] border-white/10 text-white'
            }`}
          >
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-sm flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-emerald-500" />
                <span>
                  {language === 'ar'
                    ? 'الحصيلة المالية الشاملة للواجهة'
                    : language === 'en'
                    ? 'Complete Facade Financial Summary'
                    : 'Bilan Chiffrage Global Façade'}
                </span>
              </h4>
              <span className={`text-xs font-mono ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
                {totals.count} {language === 'ar' ? 'شاسيه' : language === 'en' ? 'openings' : 'ouvrages'} • {totals.totalAreaM2} m²
              </span>
            </div>

            <div className="flex flex-col gap-2 text-xs font-mono">
              <div className="flex justify-between">
                <span className={isLight ? 'text-slate-500' : 'text-zinc-400'}>
                  {language === 'ar' ? 'إجمالي الشاسيهات HT:' : language === 'en' ? 'Total Joinery excl. tax:' : 'Total Châssis HT :'}
                </span>
                <span className="font-bold">
                  {totals.totalHt.toLocaleString()} DZD
                </span>
              </div>
              <div className="flex justify-between">
                <span className={isLight ? 'text-slate-500' : 'text-zinc-400'}>
                  {language === 'ar' ? 'الرسم على القيمة المضافة TVA (19%):' : language === 'en' ? 'Statutory VAT (19%):' : 'TVA Réglementaire (19%) :'}
                </span>
                <span>
                  {Math.round(totals.totalHt * 0.19).toLocaleString()} DZD
                </span>
              </div>
              <div className={`h-px my-1 ${isLight ? 'bg-slate-200' : 'bg-white/10'}`} />
              <div className="flex justify-between text-sm font-bold">
                <span>{language === 'ar' ? 'المجموع النهائي TTC:' : language === 'en' ? 'TOTAL INCL. TAX (TTC):' : 'TOTAL CHANTIER TTC :'}</span>
                <span className="text-[#D4AF37] font-mono">
                  {totals.totalTtc.toLocaleString()} DZD
                </span>
              </div>
            </div>

            {/* Payment Schedule */}
            <div className="grid grid-cols-2 gap-2 text-center text-xs font-mono pt-1">
              <div className={`p-2.5 rounded-xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-white/5 border-white/5'}`}>
                <span className={`text-[10px] block ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
                  {language === 'ar' ? 'عربون 40%' : language === 'en' ? '40% Deposit' : 'Acompte 40%'}
                </span>
                <span className="text-xs font-bold text-emerald-500">
                  {totals.acompte40.toLocaleString()} DZD
                </span>
              </div>
              <div className={`p-2.5 rounded-xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-white/5 border-white/5'}`}>
                <span className={`text-[10px] block ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
                  {language === 'ar' ? 'الباقي عند التركيب' : language === 'en' ? 'Balance on Installation' : 'Solde à la Pose'}
                </span>
                <span className={`text-xs font-bold ${isLight ? 'text-slate-700' : 'text-zinc-300'}`}>
                  {totals.solde60.toLocaleString()} DZD
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2 pt-2">
              <button
                onClick={handleSendToOptimizer}
                className="w-full py-2.5 px-4 rounded-xl bg-blue-600/15 hover:bg-blue-600/25 border border-blue-500/30 text-blue-500 font-mono text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer font-bold btn-press hover-lift"
              >
                <Scissors className="w-4 h-4 text-blue-500" />
                <span>
                  {language === 'ar'
                    ? 'تحويل المقاسات إلى منشار التقطيع 1D'
                    : language === 'en'
                    ? 'Transfer Frame Cuts to 1D Saw'
                    : 'Transférer Débits vers Scie 1D'}
                </span>
              </button>

              <button
                onClick={handleShareWhatsApp}
                className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs flex items-center justify-center gap-2 transition-colors shadow-lg shadow-emerald-900/30 cursor-pointer btn-press hover-lift"
              >
                <Send className="w-4 h-4" />
                <span>
                  {language === 'ar'
                    ? 'مشاركة كشف حساب الفيلا عبر واتساب'
                    : language === 'en'
                    ? 'Share Villa Quote via WhatsApp'
                    : 'Partager Devis Façade WhatsApp'}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
