import React, { useState, useEffect } from 'react';
import { useConfigStore } from '../../store/configStore';
import { calculateWindowCost } from '../../utils/pricingEngine';
import type { WindowConfig, OpeningType, ProfileSystem, GlassType, ShutterType } from '../../types/window';
import {
  Plus,
  Trash2,
  MessageCircle,
  FileDown,
  Building,
} from 'lucide-react';
import { playTactileClick, playClampSound } from '../../utils/audioFeedback';
import { generateClientDevisPdf } from '../../utils/pdfGenerator';

export interface FieldOpeningItem {
  id: string;
  roomName: string;
  width: number;
  height: number;
  openingType: OpeningType;
  profileSystem: ProfileSystem;
  glassType: GlassType;
  shutterType: ShutterType;
  quantity: number;
  estimatedUnitPriceDzd: number;
}

const STORAGE_KEY = 'baiti_field_measurement_project';
const STORAGE_INFO_KEY = 'baiti_field_measurement_info';

export const MobileFieldMeasurementScreen: React.FC = () => {
  const { selectedWilaya, theme, language, calibration } = useConfigStore();
  const isLight = theme === 'light';
  const isRtl = language === 'ar';

  const [clientName, setClientName] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(STORAGE_INFO_KEY);
        if (saved) return JSON.parse(saved).clientName || 'M. Amrani';
      } catch {
        // Fallback
      }
    }
    return 'M. Amrani';
  });

  const [clientPhone, setClientPhone] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(STORAGE_INFO_KEY);
        if (saved) return JSON.parse(saved).clientPhone || '0550123456';
      } catch {
        // Fallback
      }
    }
    return '0550123456';
  });

  const [projectSite, setProjectSite] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(STORAGE_INFO_KEY);
        if (saved) return JSON.parse(saved).projectSite || 'Chantier Villa Bir Mourad Raïs';
      } catch {
        // Fallback
      }
    }
    return 'Chantier Villa Bir Mourad Raïs';
  });

  // Save project header info to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_INFO_KEY, JSON.stringify({ clientName, clientPhone, projectSite }));
      } catch {
        // Fallback
      }
    }
  }, [clientName, clientPhone, projectSite]);

  const [openings, setOpenings] = useState<FieldOpeningItem[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) return JSON.parse(saved);
      } catch {
        // Fallback
      }
    }
    return [
      {
        id: 'op_1',
        roomName: 'Salon - Baie Vitrée',
        width: 2150,
        height: 2400,
        openingType: 'sliding_2',
        profileSystem: 'gamme_67_slide',
        glassType: 'stop_sol',
        shutterType: 'motorized',
        quantity: 1,
        estimatedUnitPriceDzd: 112000,
      },
      {
        id: 'op_2',
        roomName: 'Chambre 1',
        width: 1200,
        height: 1400,
        openingType: 'sliding_2',
        profileSystem: 'gamme_45_thermal',
        glassType: 'double_clear',
        shutterType: 'manual',
        quantity: 2,
        estimatedUnitPriceDzd: 46000,
      },
      {
        id: 'op_3',
        roomName: 'Cuisine',
        width: 1000,
        height: 1200,
        openingType: 'tilt_turn',
        profileSystem: 'gamme_45_thermal',
        glassType: 'double_clear',
        shutterType: 'none',
        quantity: 1,
        estimatedUnitPriceDzd: 38000,
      },
    ];
  });

  // Save to localStorage on change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(openings));
      } catch {
        // Fallback
      }
    }
  }, [openings]);

  // Form for new opening
  const [newRoom, setNewRoom] = useState('Chambre 2');
  const [newWidth, setNewWidth] = useState(1200);
  const [newHeight, setNewHeight] = useState(1400);
  const [newOpeningType, setNewOpeningType] = useState<OpeningType>('sliding_2');
  const [newProfile, setNewProfile] = useState<ProfileSystem>('gamme_45_thermal');
  const [newGlass, setNewGlass] = useState<GlassType>('double_clear');
  const [newShutter, setNewShutter] = useState<ShutterType>('manual');
  const [newQty, setNewQty] = useState(1);

  // Total project cost calculation
  const totalProjectDzd = openings.reduce(
    (sum, item) => sum + item.estimatedUnitPriceDzd * item.quantity,
    0
  );
  const totalOpeningsCount = openings.reduce((sum, item) => sum + item.quantity, 0);

  const handleAddOpening = () => {
    if (!newRoom.trim() || newWidth <= 0 || newHeight <= 0) return;
    playClampSound();

    const dummyConfig: WindowConfig = {
      width: newWidth,
      height: newHeight,
      openingType: newOpeningType,
      profileSystem: newProfile,
      finishColor: 'ral_7016',
      glassType: newGlass,
      shutterType: newShutter,
      isOpen: false,
      openPercent: 0,
      explodedView: false,
    };

    const costResult = calculateWindowCost(dummyConfig, calibration);

    const newItem: FieldOpeningItem = {
      id: `op_${Date.now()}`,
      roomName: newRoom,
      width: newWidth,
      height: newHeight,
      openingType: newOpeningType,
      profileSystem: newProfile,
      glassType: newGlass,
      shutterType: newShutter,
      quantity: newQty,
      estimatedUnitPriceDzd: costResult.totalEstimatedDzd,
    };

    setOpenings((prev) => [...prev, newItem]);
    setNewRoom('');
  };

  const handleRemoveOpening = (id: string) => {
    playTactileClick();
    setOpenings((prev) => prev.filter((item) => item.id !== id));
  };

  const handleShareProjectWhatsApp = () => {
    playTactileClick();
    let text = `*RELEVÉ DE COTES & DEVIS CHANTIER*\nClient : ${clientName} (${clientPhone})\nLieu : ${projectSite}\nWilaya : ${selectedWilaya}\n\n*LISTE DES CHÂSSIS :*\n`;

    openings.forEach((op, idx) => {
      text += `${idx + 1}. ${op.roomName} : ${op.width} × ${op.height} mm (×${op.quantity})\n   Prix unitaire : ${op.estimatedUnitPriceDzd.toLocaleString('fr-DZ')} DZD\n`;
    });

    text += `\n*TOTAL ESTIMÉ (${totalOpeningsCount} ouvertures) : ${totalProjectDzd.toLocaleString('fr-DZ')} DZD*\n\nÉtabli avec Baiti Atelier • https://web-two-tan-31.vercel.app`;

    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleDownloadProjectPdf = async () => {
    playTactileClick();
    // Use first window or dummy window config
    const sampleConfig: WindowConfig = {
      width: openings[0]?.width || 1200,
      height: openings[0]?.height || 1400,
      openingType: openings[0]?.openingType || 'sliding_2',
      profileSystem: openings[0]?.profileSystem || 'gamme_45_thermal',
      finishColor: 'ral_7016',
      glassType: openings[0]?.glassType || 'double_clear',
      shutterType: openings[0]?.shutterType || 'manual',
      isOpen: false,
      openPercent: 0,
      explodedView: false,
    };

    const costBreakdown = calculateWindowCost(sampleConfig, calibration);
    costBreakdown.totalEstimatedDzd = totalProjectDzd;

    await generateClientDevisPdf(
      sampleConfig,
      costBreakdown,
      clientName,
      clientPhone,
      selectedWilaya
    );
  };

  return (
    <div className="pb-36 px-3 sm:px-6 pt-2 max-w-xl md:max-w-2xl mx-auto space-y-4" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* 1. PROJECT CLIENT BANNER */}
      <div
        className={`p-4 rounded-3xl border shadow-md space-y-3 ${
          isLight ? 'bg-white border-slate-200' : 'bg-[#0B0F19] border-white/10'
        }`}
      >
        <div className="flex items-center justify-between font-mono text-xs">
          <div className="flex items-center gap-1.5 font-bold text-[#D4AF37]">
            <Building className="w-4 h-4" />
            <span>Carnet Relevé de Cotes Chantier</span>
          </div>
          <span className="text-[10px] text-zinc-500">{openings.length} Pièces</span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs font-mono">
          <div>
            <label className="text-[10px] text-zinc-500 block mb-1">Nom du Client</label>
            <input
              type="text"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              className={`w-full p-2 rounded-xl border ${
                isLight ? 'bg-slate-50 border-slate-200' : 'bg-black/30 border-white/10 text-white'
              }`}
            />
          </div>

          <div>
            <label className="text-[10px] text-zinc-500 block mb-1">Téléphone</label>
            <input
              type="text"
              value={clientPhone}
              onChange={(e) => setClientPhone(e.target.value)}
              className={`w-full p-2 rounded-xl border ${
                isLight ? 'bg-slate-50 border-slate-200' : 'bg-black/30 border-white/10 text-white'
              }`}
            />
          </div>

          <div className="col-span-2">
            <label className="text-[10px] text-zinc-500 block mb-1">Intitulé / Adresse Chantier</label>
            <input
              type="text"
              value={projectSite}
              onChange={(e) => setProjectSite(e.target.value)}
              className={`w-full p-2 rounded-xl border ${
                isLight ? 'bg-slate-50 border-slate-200' : 'bg-black/30 border-white/10 text-white'
              }`}
            />
          </div>
        </div>
      </div>

      {/* 2. OPENINGS LIST */}
      <div
        className={`p-4 rounded-3xl border shadow-md space-y-3 ${
          isLight ? 'bg-white border-slate-200' : 'bg-[#0B0F19] border-white/10'
        }`}
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono font-bold">Ouvertures Relevées</span>
          <span className="text-[10px] font-mono text-[#D4AF37] font-bold">
            Total : {totalProjectDzd.toLocaleString('fr-DZ')} DZD
          </span>
        </div>

        <div className="space-y-2">
          {openings.map((op) => (
            <div
              key={op.id}
              className={`p-3 rounded-2xl border flex items-center justify-between text-xs font-mono ${
                isLight ? 'bg-slate-50 border-slate-200' : 'bg-black/20 border-white/5'
              }`}
            >
              <div>
                <div className="font-bold flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]" />
                  <span>{op.roomName}</span>
                </div>
                <div className="text-[10px] text-zinc-400 pl-3 mt-0.5">
                  {op.width} × {op.height} mm • Qté : {op.quantity}
                </div>
                <div className="text-[10px] text-zinc-500 pl-3">
                  {op.profileSystem} • {op.glassType}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="font-black text-cyan-400">
                    {(op.estimatedUnitPriceDzd * op.quantity).toLocaleString('fr-DZ')} DZD
                  </div>
                  {op.quantity > 1 && (
                    <div className="text-[9px] text-zinc-500">
                      ({op.estimatedUnitPriceDzd.toLocaleString('fr-DZ')} /u)
                    </div>
                  )}
                </div>

                <button
                  onClick={() => handleRemoveOpening(op.id)}
                  className="p-1.5 rounded-lg text-zinc-400 hover:text-red-400 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Form to add opening */}
        <div className="pt-3 border-t border-black/5 dark:border-white/10 space-y-2 text-xs font-mono">
          <span className="text-[11px] font-bold text-zinc-400 block">+ Ajouter une Fenêtre / Baie</span>

          {/* Quick Room Suggestions */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
            {['Salon', 'Cuisine', 'Chambre 1', 'Chambre 2', 'Chambre Parents', 'SDB', 'Couloir', 'Balcon'].map((rm) => (
              <button
                key={rm}
                type="button"
                onClick={() => {
                  playTactileClick();
                  setNewRoom(rm);
                }}
                className={`px-2.5 py-1 rounded-xl border text-[10px] whitespace-nowrap cursor-pointer transition-all ${
                  newRoom === rm
                    ? 'bg-[#D4AF37] text-slate-950 font-bold border-[#D4AF37]'
                    : isLight
                    ? 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
                    : 'bg-white/5 border-white/10 text-zinc-400 hover:text-white'
                }`}
              >
                {rm}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-12 gap-1.5">
            <input
              type="text"
              placeholder="Pièce (ex: Salon, Cuisine)"
              value={newRoom}
              onChange={(e) => setNewRoom(e.target.value)}
              className={`col-span-12 p-2 rounded-xl border ${
                isLight ? 'bg-white border-slate-300' : 'bg-black/40 border-white/10 text-white'
              }`}
            />

            <div className="col-span-6">
              <label className="text-[9px] text-zinc-500 block mb-0.5">Type Ouverture</label>
              <select
                value={newOpeningType}
                onChange={(e) => setNewOpeningType(e.target.value as OpeningType)}
                className={`w-full p-2 rounded-xl border text-[11px] ${
                  isLight ? 'bg-white border-slate-300' : 'bg-black/40 border-white/10 text-white'
                }`}
              >
                <option value="sliding_2">Coulissant 2V</option>
                <option value="sliding_3">Coulissant 3V</option>
                <option value="casement_1">Battant 1V</option>
                <option value="casement_2">Battant 2V</option>
                <option value="tilt_turn">Oscillo-battant</option>
                <option value="fixed">Fixe</option>
              </select>
            </div>

            <div className="col-span-6">
              <label className="text-[9px] text-zinc-500 block mb-0.5">Profilé</label>
              <select
                value={newProfile}
                onChange={(e) => setNewProfile(e.target.value as ProfileSystem)}
                className={`w-full p-2 rounded-xl border text-[11px] ${
                  isLight ? 'bg-white border-slate-300' : 'bg-black/40 border-white/10 text-white'
                }`}
              >
                <option value="gamme_45_thermal">Gamme 45 RPT</option>
                <option value="gamme_40">Standard 40</option>
                <option value="gamme_67_slide">Coulissant 67</option>
                <option value="pvc_70_chamber">PVC 70mm 5Ch</option>
              </select>
            </div>

            <div className="col-span-4">
              <div className="flex items-center justify-between text-[9px] text-zinc-500 mb-0.5">
                <span>Largeur (mm)</span>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => setNewWidth((w) => Math.max(500, w - 50))}
                    className="hover:text-white"
                  >
                    -50
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewWidth((w) => Math.min(3200, w + 50))}
                    className="text-[#D4AF37]"
                  >
                    +50
                  </button>
                </div>
              </div>
              <input
                type="number"
                placeholder="1200"
                value={newWidth}
                onChange={(e) => setNewWidth(parseInt(e.target.value) || 0)}
                className={`w-full p-2 rounded-xl border ${
                  isLight ? 'bg-white border-slate-300' : 'bg-black/40 border-white/10 text-white'
                }`}
              />
            </div>

            <div className="col-span-4">
              <div className="flex items-center justify-between text-[9px] text-zinc-500 mb-0.5">
                <span>Hauteur (mm)</span>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => setNewHeight((h) => Math.max(500, h - 50))}
                    className="hover:text-white"
                  >
                    -50
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewHeight((h) => Math.min(2800, h + 50))}
                    className="text-[#D4AF37]"
                  >
                    +50
                  </button>
                </div>
              </div>
              <input
                type="number"
                placeholder="1400"
                value={newHeight}
                onChange={(e) => setNewHeight(parseInt(e.target.value) || 0)}
                className={`w-full p-2 rounded-xl border ${
                  isLight ? 'bg-white border-slate-300' : 'bg-black/40 border-white/10 text-white'
                }`}
              />
            </div>

            <div className="col-span-4">
              <label className="text-[9px] text-zinc-500 block mb-0.5">Quantité</label>
              <input
                type="number"
                placeholder="1"
                value={newQty}
                onChange={(e) => setNewQty(parseInt(e.target.value) || 1)}
                className={`w-full p-2 rounded-xl border ${
                  isLight ? 'bg-white border-slate-300' : 'bg-black/40 border-white/10 text-white'
                }`}
              />
            </div>

            <div className="col-span-6">
              <label className="text-[9px] text-zinc-500 block mb-0.5">Vitrage</label>
              <select
                value={newGlass}
                onChange={(e) => setNewGlass(e.target.value as GlassType)}
                className={`w-full p-2 rounded-xl border text-[11px] ${
                  isLight ? 'bg-white border-slate-300' : 'bg-black/40 border-white/10 text-white'
                }`}
              >
                <option value="double_clear">Double 4/16/4 Clair</option>
                <option value="stop_sol">Stop-Sol Teinté</option>
                <option value="simple_clear">Simple Clair 6mm</option>
                <option value="sable">Sablé / Dépoli</option>
              </select>
            </div>

            <div className="col-span-6">
              <label className="text-[9px] text-zinc-500 block mb-0.5">Volet Roulant</label>
              <select
                value={newShutter}
                onChange={(e) => setNewShutter(e.target.value as ShutterType)}
                className={`w-full p-2 rounded-xl border text-[11px] ${
                  isLight ? 'bg-white border-slate-300' : 'bg-black/40 border-white/10 text-white'
                }`}
              >
                <option value="manual">Manuel Sangle</option>
                <option value="motorized">Motorisé Télécommande</option>
                <option value="none">Sans Volet</option>
              </select>
            </div>

            <button
              onClick={handleAddOpening}
              className="col-span-12 py-2.5 rounded-xl bg-[#D4AF37] text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer hover:brightness-110 active:scale-98 transition-all shadow-sm min-h-[44px]"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Enregistrer la Cote au Chantier</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. AGGREGATE TOTAL & ACTION BUTTONS */}
      <div
        className={`p-4 rounded-3xl border shadow-xl space-y-3 ${
          isLight ? 'bg-white border-slate-200' : 'bg-[#0B0F19] border-white/10'
        }`}
      >
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono text-zinc-400 block uppercase">
              Total Chantier Estimé ({totalOpeningsCount} unités)
            </span>
            <div className="text-2xl font-black font-mono text-[#D4AF37]">
              {totalProjectDzd.toLocaleString('fr-DZ')} <span className="text-xs font-normal">DZD</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            onClick={handleShareProjectWhatsApp}
            className="w-full py-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-mono font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer min-h-[48px] active:scale-98 transition-all"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Envoyer WhatsApp</span>
          </button>

          <button
            onClick={handleDownloadProjectPdf}
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-[#C5A880] to-[#D4AF37] text-slate-950 font-mono font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer min-h-[48px] hover:brightness-110 active:scale-98 transition-all shadow-md"
          >
            <FileDown className="w-4 h-4" />
            <span>Devis Chantier PDF</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default MobileFieldMeasurementScreen;
