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
  Download,
  Upload,
  RotateCcw,
  Layers,
  Scissors,
  FileCheck,
  Copy,
  Minus,
} from 'lucide-react';
import { playTactileClick, playClampSound } from '../../utils/audioFeedback';
import {
  generateClientDevisPdf,
  generateGlazierCuttingOrderPdf,
  formatOpeningTypeFr,
  formatProfileSystemFr,
  formatGlassTypeFr,
  formatShutterTypeFr,
} from '../../utils/pdfGenerator';
import type { MobileNavTab } from './MobileBottomNavigation';

export interface FieldOpeningItem {
  id: string;
  roomName: string;
  width: number;
  height: number;
  allegeMm?: number;
  openingType: OpeningType;
  profileSystem: ProfileSystem;
  glassType: GlassType;
  shutterType: ShutterType;
  quantity: number;
  estimatedUnitPriceDzd: number;
}

let nextOpeningSequence = 100;
function createOpeningId(): string {
  nextOpeningSequence += 1;
  return `op_${nextOpeningSequence}`;
}

const STORAGE_KEY = 'baiti_field_measurement_project';
const STORAGE_INFO_KEY = 'baiti_field_measurement_info';

interface MobileFieldMeasurementScreenProps {
  onNavigateTab?: (tab: MobileNavTab) => void;
}

export const MobileFieldMeasurementScreen: React.FC<MobileFieldMeasurementScreenProps> = ({
  onNavigateTab,
}) => {
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
        allegeMm: 0,
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
        allegeMm: 900,
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
        allegeMm: 1000,
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
  const [newAllege, setNewAllege] = useState(900);
  const [newOpeningType, setNewOpeningType] = useState<OpeningType>('sliding_2');
  const [newProfile, setNewProfile] = useState<ProfileSystem>('gamme_45_thermal');
  const [newGlass, setNewGlass] = useState<GlassType>('double_clear');
  const [newShutter, setNewShutter] = useState<ShutterType>('manual');
  const [newQty, setNewQty] = useState(1);
  const [isGeneratingGlazierPdf, setIsGeneratingGlazierPdf] = useState(false);

  // Total project cost and surfaces calculation
  const totalProjectDzd = openings.reduce(
    (sum, item) => sum + item.estimatedUnitPriceDzd * item.quantity,
    0
  );
  const totalOpeningsCount = openings.reduce((sum, item) => sum + item.quantity, 0);

  const totalGlassSurfaceM2 = openings.reduce(
    (sum, item) => sum + (item.width * item.height * item.quantity) / 1000000,
    0
  );

  const totalProfileLinearM = openings.reduce((sum, item) => {
    const perimeterM = (2 * (item.width + item.height)) / 1000;
    const factor = item.openingType.includes('sliding') || item.openingType.includes('2') ? 2.5 : 2.0;
    return sum + perimeterM * factor * item.quantity;
  }, 0);

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
      id: createOpeningId(),
      roomName: newRoom,
      width: newWidth,
      height: newHeight,
      allegeMm: newAllege,
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

  const handleDuplicateOpening = (op: FieldOpeningItem) => {
    playClampSound();
    const duplicated: FieldOpeningItem = {
      ...op,
      id: createOpeningId(),
      roomName: `${op.roomName} (Copie)`,
    };
    setOpenings((prev) => [...prev, duplicated]);
  };

  const handleUpdateQuantity = (id: string, delta: number) => {
    playTactileClick();
    setOpenings((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const updatedQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: updatedQty };
      })
    );
  };

  const handleSendSurveyToCutting = () => {
    playClampSound();
    if (typeof window !== 'undefined') {
      try {
        sessionStorage.setItem('baiti_auto_import_survey_cutting', 'true');
      } catch {
        // Handled
      }
    }
    if (onNavigateTab) {
      onNavigateTab('cutting');
    }
  };

  const handleLaunchWorkshopJob = () => {
    playClampSound();
    if (typeof window !== 'undefined') {
      try {
        sessionStorage.setItem('baiti_auto_open_new_job_survey', 'true');
      } catch {
        // Handled
      }
    }
    if (onNavigateTab) {
      onNavigateTab('workshop');
    }
  };

  const handleShareProjectWhatsApp = () => {
    playTactileClick();
    let text = `*RELEVÉ DE COTES & DEVIS CHANTIER*\nClient : ${clientName} (${clientPhone})\nLieu : ${projectSite}\nWilaya : ${selectedWilaya}\n\n*LISTE DES CHÂSSIS :*\n`;

    openings.forEach((op, idx) => {
      const allegeInfo = op.allegeMm !== undefined ? ` (Allège : ${op.allegeMm} mm)` : '';
      text += `${idx + 1}. ${op.roomName} : ${op.width} × ${op.height} mm${allegeInfo} (×${op.quantity})\n   Prix unitaire : ${op.estimatedUnitPriceDzd.toLocaleString('fr-DZ')} DZD\n`;
    });

    text += `\n*TOTAL ESTIMÉ (${totalOpeningsCount} ouvertures) : ${totalProjectDzd.toLocaleString('fr-DZ')} DZD*\n\nÉtabli avec Baiti Atelier • https://web-two-tan-31.vercel.app`;

    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleGlazierOrderWhatsApp = () => {
    playTactileClick();
    let text = `*COMMANDE VERRES & VITRAGES - CHANTIER*\n`;
    text += `Client : ${clientName || 'Particulier'} (${clientPhone})\n`;
    text += `Chantier : ${projectSite}\n`;
    text += `Wilaya : ${selectedWilaya}\n\n`;
    text += `*VOLUMES DE VITRAGE À DÉBITER :*\n`;

    openings.forEach((op, idx) => {
      const glassLabel = formatGlassTypeFr(op.glassType);
      const m2 = ((op.width * op.height * op.quantity) / 1000000).toFixed(2);
      const allegeInfo = op.allegeMm !== undefined ? ` (Allège : ${op.allegeMm} mm)` : '';
      text += `${idx + 1}. ${op.roomName} : ${op.width} × ${op.height} mm${allegeInfo}\n`;
      text += `   - Type : ${glassLabel}\n`;
      text += `   - Quantité : ${op.quantity} unité(s) • Surface : ${m2} m²\n`;
    });

    text += `\n*RÉCAPITULATIF MIROITERIE :*\n`;
    text += `• Total châssis : ${totalOpeningsCount}\n`;
    text += `• Surface vitrée totale estimée : ${totalGlassSurfaceM2.toFixed(2)} m²\n\n`;
    text += `Transmis via Baiti Atelier • https://web-two-tan-31.vercel.app`;

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
      selectedWilaya,
      openings
    );
  };

  const handleDownloadGlazierOrderPdf = async () => {
    playTactileClick();
    if (openings.length === 0) return;
    setIsGeneratingGlazierPdf(true);
    try {
      const items = openings.map((op, idx) => {
        const isSliding = op.openingType.startsWith('sliding');
        const sashesCount = op.openingType === 'sliding_3' ? 3 : isSliding || op.openingType === 'casement_2' ? 2 : 1;
        const netW = Math.max(200, op.width - (isSliding ? 120 : 90));
        const netH = Math.max(200, op.height - (isSliding ? 120 : 90));
        const areaM2 = (netW * netH) / 1000000;
        return {
          id: op.id || `vit_${idx + 1}`,
          label: `${op.roomName} (${op.width}×${op.height} mm)`,
          widthMm: netW,
          heightMm: netH,
          glassType: formatGlassTypeFr(op.glassType),
          quantity: op.quantity * sashesCount,
          areaM2,
          edgeFinish: 'Arêtes abattues (AA)',
        };
      });

      await generateGlazierCuttingOrderPdf({
        projectTitle: projectSite || 'Chantier Menuiserie',
        clientName: clientName || 'Client Particulier',
        clientPhone: clientPhone || '+213 550 00 00 00',
        wilaya: selectedWilaya,
        items,
      });
    } finally {
      setIsGeneratingGlazierPdf(false);
    }
  };

  const handleExportJson = () => {
    playTactileClick();
    const payload = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      clientName,
      clientPhone,
      projectSite,
      selectedWilaya,
      openings,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `releve_${clientName.replace(/\s+/g, '_') || 'chantier'}_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (data.clientName) setClientName(data.clientName);
        if (data.clientPhone) setClientPhone(data.clientPhone);
        if (data.projectSite) setProjectSite(data.projectSite);
        if (Array.isArray(data.openings)) {
          setOpenings(data.openings);
        }
        playClampSound();
      } catch {
        alert('Format de fichier JSON non reconnu.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleResetSurvey = () => {
    if (window.confirm('Voulez-vous réinitialiser le carnet pour démarrer un nouveau chantier ?')) {
      playTactileClick();
      setClientName('');
      setClientPhone('');
      setProjectSite('');
      setOpenings([]);
    }
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
            <label className={`text-[10px] block mb-1 ${isLight ? 'text-slate-600 font-medium' : 'text-zinc-500'}`}>Nom du Client</label>
            <input
              type="text"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              className={`w-full p-2 rounded-xl border ${
                isLight ? 'bg-slate-50 border-slate-200 text-slate-900' : 'bg-black/30 border-white/10 text-white'
              }`}
            />
          </div>

          <div>
            <label className={`text-[10px] block mb-1 ${isLight ? 'text-slate-600 font-medium' : 'text-zinc-500'}`}>Téléphone</label>
            <input
              type="text"
              value={clientPhone}
              onChange={(e) => setClientPhone(e.target.value)}
              className={`w-full p-2 rounded-xl border ${
                isLight ? 'bg-slate-50 border-slate-200 text-slate-900' : 'bg-black/30 border-white/10 text-white'
              }`}
            />
          </div>

          <div className="col-span-2">
            <label className={`text-[10px] block mb-1 ${isLight ? 'text-slate-600 font-medium' : 'text-zinc-500'}`}>Intitulé / Adresse Chantier</label>
            <input
              type="text"
              value={projectSite}
              onChange={(e) => setProjectSite(e.target.value)}
              className={`w-full p-2 rounded-xl border ${
                isLight ? 'bg-slate-50 border-slate-200 text-slate-900' : 'bg-black/30 border-white/10 text-white'
              }`}
            />
          </div>
        </div>

        {/* Action toolbar: Backup, restore, reset */}
        <div className="flex items-center justify-between gap-1.5 pt-1 border-t border-black/5 dark:border-white/10 text-xs font-mono">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleExportJson}
              className="px-2.5 py-1.5 rounded-lg bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 flex items-center gap-1 text-[10px] hover:bg-black/10 dark:hover:bg-white/10 active:scale-95 transition-all"
              title="Exporter les cotes au format JSON"
            >
              <Download className="w-3 h-3 text-[#D4AF37]" />
              <span>Exporter JSON</span>
            </button>

            <label className="px-2.5 py-1.5 rounded-lg bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 flex items-center gap-1 text-[10px] hover:bg-black/10 dark:hover:bg-white/10 active:scale-95 transition-all cursor-pointer">
              <Upload className="w-3 h-3 text-[#D4AF37]" />
              <span>Importer</span>
              <input
                type="file"
                accept=".json,application/json"
                onChange={handleImportJson}
                className="hidden"
              />
            </label>
          </div>

          <button
            type="button"
            onClick={handleResetSurvey}
            className="px-2 py-1.5 rounded-lg text-rose-400 hover:bg-rose-500/10 flex items-center gap-1 text-[10px] transition-all ml-auto"
            title="Réinitialiser pour un nouveau chantier"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Nouveau Chantier</span>
          </button>
        </div>
      </div>

      {/* 2. OPENINGS LIST */}
      <div
        className={`p-4 rounded-3xl border shadow-md space-y-3 ${
          isLight ? 'bg-white border-slate-200' : 'bg-[#0B0F19] border-white/10'
        }`}
      >
        <div className="flex items-center justify-between">
          <span className={`text-xs font-mono font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
            Ouvertures Relevées ({openings.length})
          </span>
          <span className="text-[10px] font-mono text-[#D4AF37] font-bold">
            Total : {totalProjectDzd.toLocaleString('fr-DZ')} DZD
          </span>
        </div>

        {/* 4-Metric Summary Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-xs">
          <div className={`p-2 rounded-2xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-black/20 border-white/5'}`}>
            <span className="text-[9px] text-zinc-500 block">Châssis</span>
            <span className={`text-xs font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
              {totalOpeningsCount} unité{totalOpeningsCount > 1 ? 's' : ''}
            </span>
          </div>

          <div className={`p-2 rounded-2xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-black/20 border-white/5'}`}>
            <span className="text-[9px] text-zinc-500 block">Vitrage Débité</span>
            <span className="text-xs font-bold text-cyan-400">
              {totalGlassSurfaceM2.toFixed(2)} m²
            </span>
          </div>

          <div className={`p-2 rounded-2xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-black/20 border-white/5'}`}>
            <span className="text-[9px] text-zinc-500 block">Profilés Estimés</span>
            <span className={`text-xs font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
              {totalProfileLinearM.toFixed(0)} ml
            </span>
          </div>

          <div className={`p-2 rounded-2xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-black/20 border-white/5'}`}>
            <span className="text-[9px] text-zinc-500 block">Montant Estimé</span>
            <span className="text-xs font-bold text-[#D4AF37]">
              {totalProjectDzd.toLocaleString('fr-DZ')} DZD
            </span>
          </div>
        </div>

        {/* List of Opening Cards */}
        <div className="space-y-2 pt-1">
          {openings.map((op) => (
            <div
              key={op.id}
              className={`p-3 rounded-2xl border flex items-center justify-between text-xs font-mono ${
                isLight ? 'bg-slate-50 border-slate-200' : 'bg-black/20 border-white/5'
              }`}
            >
              <div className="space-y-0.5">
                <div className="font-bold flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]" />
                  <span className={isLight ? 'text-slate-900 font-bold' : 'text-white'}>{op.roomName}</span>
                </div>
                <div className={`text-[10px] pl-3 ${isLight ? 'text-slate-700 font-medium' : 'text-zinc-400'}`}>
                  {op.width} × {op.height} mm
                  <span className="text-[#D4AF37] ml-1 font-semibold">
                    (Allège : {op.allegeMm !== undefined ? op.allegeMm : (op.height > 2000 ? 0 : 900)} mm)
                  </span>
                  {' • Qté : '}{op.quantity}
                </div>
                <div className={`text-[9px] pl-3 ${isLight ? 'text-slate-600' : 'text-zinc-500'}`}>
                  {formatOpeningTypeFr(op.openingType)} • {formatProfileSystemFr(op.profileSystem)}
                </div>
                <div className={`text-[9px] pl-3 ${isLight ? 'text-slate-600' : 'text-zinc-500'}`}>
                  {formatGlassTypeFr(op.glassType)} • {formatShutterTypeFr(op.shutterType)}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 shrink-0">
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

                <div className="flex items-center gap-1 self-end sm:self-auto">
                  {/* Quantity Stepper */}
                  <div
                    className={`flex items-center border rounded-xl overflow-hidden ${
                      isLight ? 'border-slate-300 bg-white' : 'border-white/10 bg-black/40'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => handleUpdateQuantity(op.id, -1)}
                      disabled={op.quantity <= 1}
                      className="px-2 py-1 hover:bg-black/5 dark:hover:bg-white/10 disabled:opacity-30 cursor-pointer transition-all"
                      title="Diminuer la quantité"
                    >
                      <Minus className="w-2.5 h-2.5" />
                    </button>
                    <span className="px-1.5 text-[11px] font-bold min-w-[20px] text-center">
                      {op.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleUpdateQuantity(op.id, 1)}
                      className="px-2 py-1 hover:bg-black/5 dark:hover:bg-white/10 cursor-pointer transition-all"
                      title="Augmenter la quantité"
                    >
                      <Plus className="w-2.5 h-2.5" />
                    </button>
                  </div>

                  {/* Duplicate Opening */}
                  <button
                    type="button"
                    onClick={() => handleDuplicateOpening(op)}
                    className={`p-1.5 rounded-xl border cursor-pointer active:scale-95 transition-all ${
                      isLight
                        ? 'border-slate-300 bg-white hover:bg-slate-100 text-slate-700'
                        : 'border-white/10 bg-white/5 hover:bg-white/10 text-zinc-300'
                    }`}
                    title="Dupliquer ce châssis avec toutes ses options"
                  >
                    <Copy className="w-3.5 h-3.5 text-[#D4AF37]" />
                  </button>

                  {/* Remove Opening */}
                  <button
                    type="button"
                    onClick={() => handleRemoveOpening(op.id)}
                    className="p-1.5 rounded-xl text-zinc-400 hover:text-red-400 cursor-pointer active:scale-95 transition-all"
                    title="Supprimer ce châssis"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Form to add opening */}
        <div className="pt-3 border-t border-black/5 dark:border-white/10 space-y-2 text-xs font-mono">
          <span className="text-[11px] font-bold text-zinc-400 block">+ Ajouter une Fenêtre / Baie</span>

          {/* Quick Room Suggestions with smart defaults */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
            {[
              { name: 'Salon', w: 2150, h: 2400, a: 0, t: 'sliding_2', p: 'gamme_67_slide' },
              { name: 'Cuisine', w: 1000, h: 1200, a: 1000, t: 'tilt_turn', p: 'gamme_45_thermal' },
              { name: 'Chambre 1', w: 1200, h: 1400, a: 900, t: 'sliding_2', p: 'gamme_45_thermal' },
              { name: 'Chambre 2', w: 1200, h: 1400, a: 900, t: 'sliding_2', p: 'gamme_45_thermal' },
              { name: 'Chambre Parents', w: 1400, h: 1400, a: 900, t: 'sliding_2', p: 'gamme_45_thermal' },
              { name: 'SDB', w: 800, h: 800, a: 1200, t: 'tilt_turn', p: 'gamme_45_thermal' },
              { name: 'Couloir', w: 900, h: 1200, a: 900, t: 'fixed', p: 'gamme_45_thermal' },
              { name: 'Balcon', w: 1800, h: 2200, a: 0, t: 'sliding_2', p: 'gamme_67_slide' },
            ].map((rm) => (
              <button
                key={rm.name}
                type="button"
                onClick={() => {
                  playTactileClick();
                  setNewRoom(rm.name);
                  setNewWidth(rm.w);
                  setNewHeight(rm.h);
                  setNewAllege(rm.a);
                  setNewOpeningType(rm.t as OpeningType);
                  setNewProfile(rm.p as ProfileSystem);
                }}
                className={`px-2.5 py-1 rounded-xl border text-[10px] whitespace-nowrap cursor-pointer transition-all ${
                  newRoom === rm.name
                    ? 'bg-[#D4AF37] text-slate-950 font-bold border-[#D4AF37]'
                    : isLight
                    ? 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
                    : 'bg-white/5 border-white/10 text-zinc-400 hover:text-white'
                }`}
              >
                {rm.name}
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
                isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-black/40 border-white/10 text-white'
              }`}
            />

            <div className="col-span-6">
              <label className={`text-[9px] block mb-0.5 ${isLight ? 'text-slate-700 font-medium' : 'text-zinc-500'}`}>Type Ouverture</label>
              <select
                value={newOpeningType}
                onChange={(e) => setNewOpeningType(e.target.value as OpeningType)}
                className={`w-full p-2 rounded-xl border text-[11px] ${
                  isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-black/40 border-white/10 text-white'
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
              <label className={`text-[9px] block mb-0.5 ${isLight ? 'text-slate-700 font-medium' : 'text-zinc-500'}`}>Profilé</label>
              <select
                value={newProfile}
                onChange={(e) => setNewProfile(e.target.value as ProfileSystem)}
                className={`w-full p-2 rounded-xl border text-[11px] ${
                  isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-black/40 border-white/10 text-white'
                }`}
              >
                <option value="gamme_45_thermal">Gamme 45 RPT</option>
                <option value="gamme_40">Standard 40</option>
                <option value="gamme_67_slide">Coulissant 67</option>
                <option value="pvc_70_chamber">PVC 70mm 5Ch</option>
              </select>
            </div>

            {/* Width */}
            <div className="col-span-6 sm:col-span-3">
              <div className={`flex items-center justify-between text-[9px] mb-0.5 ${isLight ? 'text-slate-700 font-medium' : 'text-zinc-500'}`}>
                <span>Largeur (mm)</span>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => setNewWidth((w) => Math.max(400, w - 50))}
                    className="hover:text-[#D4AF37]"
                  >
                    -50
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewWidth((w) => Math.min(3500, w + 50))}
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
                  isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-black/40 border-white/10 text-white'
                }`}
              />
            </div>

            {/* Height */}
            <div className="col-span-6 sm:col-span-3">
              <div className={`flex items-center justify-between text-[9px] mb-0.5 ${isLight ? 'text-slate-700 font-medium' : 'text-zinc-500'}`}>
                <span>Hauteur (mm)</span>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => setNewHeight((h) => Math.max(400, h - 50))}
                    className="hover:text-[#D4AF37]"
                  >
                    -50
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewHeight((h) => Math.min(3000, h + 50))}
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
                  isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-black/40 border-white/10 text-white'
                }`}
              />
            </div>

            {/* Allège (Cill Height) */}
            <div className="col-span-6 sm:col-span-3">
              <div className={`flex items-center justify-between text-[9px] mb-0.5 ${isLight ? 'text-slate-700 font-medium' : 'text-zinc-500'}`}>
                <span>Allège (mm)</span>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => setNewAllege(0)}
                    className="text-[#D4AF37] hover:underline"
                    title="0 mm pour baie vitrée"
                  >
                    0
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewAllege(900)}
                    className="hover:text-[#D4AF37]"
                    title="900 mm standard"
                  >
                    900
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewAllege(1000)}
                    className="hover:text-[#D4AF37]"
                    title="1000 mm cuisine"
                  >
                    1000
                  </button>
                </div>
              </div>
              <input
                type="number"
                placeholder="900"
                value={newAllege}
                onChange={(e) => setNewAllege(parseInt(e.target.value) || 0)}
                className={`w-full p-2 rounded-xl border ${
                  isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-black/40 border-white/10 text-white'
                }`}
              />
            </div>

            {/* Quantity */}
            <div className="col-span-6 sm:col-span-3">
              <label className={`text-[9px] block mb-0.5 ${isLight ? 'text-slate-700 font-medium' : 'text-zinc-500'}`}>Quantité</label>
              <input
                type="number"
                placeholder="1"
                min={1}
                value={newQty}
                onChange={(e) => setNewQty(parseInt(e.target.value) || 1)}
                className={`w-full p-2 rounded-xl border ${
                  isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-black/40 border-white/10 text-white'
                }`}
              />
            </div>

            <div className="col-span-6">
              <label className={`text-[9px] block mb-0.5 ${isLight ? 'text-slate-700 font-medium' : 'text-zinc-500'}`}>Vitrage</label>
              <select
                value={newGlass}
                onChange={(e) => setNewGlass(e.target.value as GlassType)}
                className={`w-full p-2 rounded-xl border text-[11px] ${
                  isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-black/40 border-white/10 text-white'
                }`}
              >
                <option value="double_clear">Double 4/16/4 Clair</option>
                <option value="stop_sol">Stop-Sol Teinté</option>
                <option value="simple_clear">Simple Clair 6mm</option>
                <option value="sable">Sablé / Dépoli</option>
              </select>
            </div>

            <div className="col-span-6">
              <label className={`text-[9px] block mb-0.5 ${isLight ? 'text-slate-700 font-medium' : 'text-zinc-500'}`}>Volet Roulant</label>
              <select
                value={newShutter}
                onChange={(e) => setNewShutter(e.target.value as ShutterType)}
                className={`w-full p-2 rounded-xl border text-[11px] ${
                  isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-black/40 border-white/10 text-white'
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

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
          <button
            onClick={handleShareProjectWhatsApp}
            className="py-3 px-2 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-mono font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer min-h-[48px] active:scale-98 transition-all"
            title="Partager le devis estimatif au client par WhatsApp"
          >
            <MessageCircle className="w-4 h-4 shrink-0" />
            <span className="truncate">Devis WhatsApp</span>
          </button>

          <button
            onClick={handleDownloadProjectPdf}
            className="py-3 px-2 rounded-2xl bg-gradient-to-r from-[#C5A880] to-[#D4AF37] text-slate-950 font-mono font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer min-h-[48px] hover:brightness-110 active:scale-98 transition-all shadow-md"
            title="Télécharger le devis officiel PDF pour le client"
          >
            <FileDown className="w-4 h-4 shrink-0" />
            <span className="truncate">Devis PDF</span>
          </button>

          <button
            onClick={handleGlazierOrderWhatsApp}
            className="py-3 px-2 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 font-mono font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer min-h-[48px] active:scale-98 transition-all"
            title="Transmettre la commande de découpe à la miroiterie via WhatsApp"
          >
            <Layers className="w-4 h-4 shrink-0" />
            <span className="truncate">WhatsApp Vitrier</span>
          </button>

          <button
            onClick={handleDownloadGlazierOrderPdf}
            disabled={isGeneratingGlazierPdf || openings.length === 0}
            className={`py-3 px-2 rounded-2xl border font-mono font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer min-h-[48px] active:scale-98 transition-all ${
              isLight
                ? 'bg-sky-50 border-sky-300 text-sky-900 hover:bg-sky-100 shadow-xs'
                : 'bg-sky-500/15 border-sky-500/30 text-sky-300 hover:bg-sky-500/25'
            }`}
            title="Télécharger le bon de commande découpe vitrerie officiel A4 PDF"
          >
            <FileCheck className="w-4 h-4 text-sky-400 shrink-0" />
            <span className="truncate">{isGeneratingGlazierPdf ? 'PDF...' : 'Bon Vitrage PDF'}</span>
          </button>
        </div>

        {openings.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
            <button
              type="button"
              onClick={handleLaunchWorkshopJob}
              className={`py-3 px-3 rounded-2xl border font-mono font-bold text-xs flex items-center justify-center gap-2 cursor-pointer min-h-[46px] active:scale-98 transition-all ${
                isLight
                  ? 'bg-amber-50 hover:bg-amber-100 text-amber-950 border-amber-300 shadow-xs'
                  : 'bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border-amber-500/30'
              }`}
              title="Créer une affaire de fabrication directement dans le suivi d'atelier"
            >
              <Building className="w-4 h-4 text-[#D4AF37]" />
              <span className="truncate">Lancer Affaire Atelier ({openings.length} châssis)</span>
            </button>

            <button
              type="button"
              onClick={handleSendSurveyToCutting}
              className={`py-3 px-3 rounded-2xl border font-mono font-bold text-xs flex items-center justify-center gap-2 cursor-pointer min-h-[46px] active:scale-98 transition-all ${
                isLight
                  ? 'bg-sky-50 hover:bg-sky-100 text-sky-950 border-sky-300 shadow-xs'
                  : 'bg-sky-500/15 hover:bg-sky-500/25 text-sky-300 border-sky-500/30'
              }`}
              title="Optimiser et générer les débits pour l'atelier scie"
            >
              <Scissors className="w-4 h-4 text-sky-400" />
              <span className="truncate">Débiter à la Scie 1D</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MobileFieldMeasurementScreen;
