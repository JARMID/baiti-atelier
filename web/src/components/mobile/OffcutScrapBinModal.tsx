import React, { useState, useMemo } from 'react';
import {
  X,
  Recycle,
  Trash2,
  Plus,
  Scale,
  MessageCircle,
  Warehouse,
  Check,
  Search,
  Sparkles,
} from 'lucide-react';
import { playTactileClick, playClampSound } from '../../utils/audioFeedback';
import { useConfigStore } from '../../store/configStore';
import {
  getOffcutInventory,
  addOffcut,
  removeOffcut,
  type OffcutRecord,
} from '../../utils/offcutManager';
import {
  getScrapBins,
  addScrapWeight,
  convertOffcutToScrap,
  recordScrapSaleTransaction,
  getScrapSales,
  formatScrapCollectorWhatsAppMessage,
  estimateProfileWeightKg,
  type ScrapBin,
  type ScrapSaleRecord,
} from '../../utils/workshopScrapManager';

export interface OffcutScrapBinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInventoryChanged?: () => void;
}

export const OffcutScrapBinModal: React.FC<OffcutScrapBinModalProps> = ({
  isOpen,
  onClose,
  onInventoryChanged,
}) => {
  const { theme } = useConfigStore();
  const isLight = theme === 'light';

  // Active view tab: 'chutes' (Chutes réutilisables >= 800mm), 'scrap' (Bacs fonderie & pesée), 'new' (Enregistrer une chute)
  const [activeTab, setActiveTab] = useState<'chutes' | 'scrap' | 'new'>('chutes');

  // Offcuts inventory state
  const [offcuts, setOffcuts] = useState<OffcutRecord[]>(() => getOffcutInventory());
  const [materialFilter, setMaterialFilter] = useState<'all' | 'aluminium' | 'pvc'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [minLengthFilter, setMinLengthFilter] = useState<number>(0);

  // Scrap bins and sales state
  const [scrapBins, setScrapBins] = useState<ScrapBin[]>(() => getScrapBins());
  const [scrapSales, setScrapSales] = useState<ScrapSaleRecord[]>(() => getScrapSales());
  const [selectedBinForSale, setSelectedBinForSale] = useState<ScrapBin | null>(null);

  // Scrap sale form state
  const [saleWeight, setSaleWeight] = useState<number>(0);
  const [salePricePerKg, setSalePricePerKg] = useState<number>(280);
  const [saleCollector, setSaleCollector] = useState<string>('');
  const [saleReceiptRef, setSaleReceiptRef] = useState<string>('');
  const [salePaymentStatus, setSalePaymentStatus] = useState<'especes_recue' | 'baridimob' | 'en_attente'>('especes_recue');
  const [saleNotes, setSaleNotes] = useState<string>('');

  // New offcut form state
  const [newProfileCode, setNewProfileCode] = useState('TPR-40');
  const [newLabel, setNewLabel] = useState('Dormant Tubulaire 40 RPT');
  const [newMaterial, setNewMaterial] = useState<'aluminium' | 'pvc'>('aluminium');
  const [newFinishColor, setNewFinishColor] = useState('Blanc RAL 9016');
  const [newLengthMm, setNewLengthMm] = useState<number>(1450);
  const [newRackLocation, setNewRackLocation] = useState('CASIER-A-03');
  const [newJobOrigin, setNewJobOrigin] = useState('');

  // Toast state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Filtered offcuts
  const filteredOffcuts = useMemo(() => {
    return offcuts.filter((item) => {
      const matchMaterial = materialFilter === 'all' || item.material === materialFilter;
      const matchMinLength = item.lengthMm >= minLengthFilter;
      const matchSearch =
        searchQuery.trim() === '' ||
        item.profileCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.finishColor.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.rackLocation.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.jobOrigin && item.jobOrigin.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchMaterial && matchMinLength && matchSearch;
    });
  }, [offcuts, materialFilter, minLengthFilter, searchQuery]);

  // Aggregate telemetry
  const totalUsableLengthM = useMemo(() => {
    return Math.round((offcuts.reduce((sum, item) => sum + item.lengthMm, 0) / 1000) * 10) / 10;
  }, [offcuts]);

  const totalUsableEstimatedWeightKg = useMemo(() => {
    return Math.round(
      offcuts.reduce((sum, item) => sum + estimateProfileWeightKg(item.profileCode, item.lengthMm), 0) * 10
    ) / 10;
  }, [offcuts]);

  const totalScrapWeightKg = useMemo(() => {
    return Math.round(scrapBins.reduce((sum, b) => sum + b.currentWeightKg, 0) * 10) / 10;
  }, [scrapBins]);

  const totalScrapValuationDzd = useMemo(() => {
    return scrapBins.reduce((sum, b) => sum + Math.round(b.currentWeightKg * b.marketPriceDzdPerKg), 0);
  }, [scrapBins]);

  // Handle removing / consuming offcut
  const handleConsumeOffcut = (id: string, label: string) => {
    playClampSound();
    removeOffcut(id);
    const updated = getOffcutInventory();
    setOffcuts(updated);
    showToast(`Chute "${label}" consommée et déduite de l'inventaire.`);
    if (onInventoryChanged) onInventoryChanged();
  };

  // Handle converting offcut to scrap
  const handleConvertToScrap = (id: string, label: string) => {
    playClampSound();
    const res = convertOffcutToScrap(id);
    if (res) {
      setOffcuts(getOffcutInventory());
      setScrapBins(res.bins);
      showToast(
        `Chute "${label}" (${res.scrapWeight} kg) transférée vers le ${res.targetBinName}.`
      );
      if (onInventoryChanged) onInventoryChanged();
    }
  };

  // Handle adding weight to scrap bin directly
  const handleQuickAddScrap = (binId: string, deltaKg: number) => {
    playTactileClick();
    const updated = addScrapWeight(binId, deltaKg);
    setScrapBins(updated);
    showToast(`+${deltaKg} kg ajoutés à la pesée du bac.`);
  };

  // Open scrap sale settlement modal
  const handleOpenSaleModal = (bin: ScrapBin) => {
    playTactileClick();
    setSelectedBinForSale(bin);
    setSaleWeight(bin.currentWeightKg);
    setSalePricePerKg(bin.marketPriceDzdPerKg);
    setSaleCollector(bin.preferredCollector);
    setSaleReceiptRef(`PESEE-${Date.now().toString().slice(-4)}`);
    setSalePaymentStatus('especes_recue');
    setSaleNotes('');
  };

  // Confirm scrap sale
  const handleConfirmSale = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBinForSale || saleWeight <= 0) return;
    playClampSound();

    const { updatedBins } = recordScrapSaleTransaction(
      selectedBinForSale.id,
      saleWeight,
      salePricePerKg,
      saleCollector,
      saleReceiptRef,
      salePaymentStatus,
      saleNotes
    );

    setScrapBins(updatedBins);
    setScrapSales(getScrapSales());
    showToast(
      `Vente de ${saleWeight} kg (${(saleWeight * salePricePerKg).toLocaleString('fr-DZ')} DZD) enregistrée !`
    );
    setSelectedBinForSale(null);
  };

  // WhatsApp dispatch to foundry collector
  const handleWhatsAppCollector = (bin: ScrapBin) => {
    playTactileClick();
    const msg = formatScrapCollectorWhatsAppMessage(
      bin,
      'Baiti Atelier Aluminium',
      '0550 00 00 00',
      'Alger'
    );
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
  };

  // Create new offcut
  const handleCreateOffcut = (e: React.FormEvent) => {
    e.preventDefault();
    if (newLengthMm <= 0) return;
    playClampSound();

    if (newLengthMm < 800) {
      // Suggest sending directly to scrap if length is under 800 mm
      const weight = estimateProfileWeightKg(newProfileCode, newLengthMm);
      const binId = newMaterial === 'pvc' ? 'bin-pvc-01' : 'bin-alu-01';
      const updatedBins = addScrapWeight(binId, weight);
      setScrapBins(updatedBins);
      showToast(
        `Chute courte (${newLengthMm} mm < 800 mm) dirigée vers le bac rebut fonderie (${weight} kg).`
      );
      setActiveTab('scrap');
      return;
    }

    addOffcut({
      profileCode: newProfileCode.trim(),
      label: newLabel.trim(),
      material: newMaterial,
      finishColor: newFinishColor.trim(),
      lengthMm: newLengthMm,
      rackLocation: newRackLocation.trim() || 'CASIER-A-01',
      jobOrigin: newJobOrigin.trim() || undefined,
    });

    const updated = getOffcutInventory();
    setOffcuts(updated);
    showToast(`Chute de ${newLengthMm} mm enregistrée au ${newRackLocation} !`);
    setActiveTab('chutes');
    if (onInventoryChanged) onInventoryChanged();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div
        className={`w-full max-w-2xl max-h-[92vh] flex flex-col rounded-t-3xl sm:rounded-3xl border shadow-2xl font-mono text-xs overflow-hidden ${
          isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-[#0B0F19] border-white/10 text-white'
        }`}
      >
        {/* 1. MODAL HEADER */}
        <div className="p-4 border-b border-black/10 dark:border-white/10 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
              <Recycle className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-bold truncate">
                Chutes Réutilisables & Bacs Fonderie
              </h3>
              <p className="text-[10px] text-zinc-500 truncate">
                Gestion des profilés $\ge 800$ mm et valorisation du scrap aluminium
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              playTactileClick();
              onClose();
            }}
            className={`p-1.5 rounded-xl cursor-pointer ${
              isLight ? 'hover:bg-slate-100 text-slate-500' : 'hover:bg-white/10 text-zinc-400'
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 2. LIVE TELEMETRY BANNER */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-3 bg-black/5 dark:bg-white/5 border-b border-black/5 dark:border-white/5 shrink-0 text-center">
          <div className="p-1.5 rounded-xl bg-black/5 dark:bg-black/30 border border-black/5 dark:border-white/5">
            <span className="text-[9px] text-zinc-500 block">Chutes en Stock</span>
            <span className="text-xs font-bold text-cyan-400">
              {offcuts.length} barres ({totalUsableLengthM} ml)
            </span>
          </div>

          <div className="p-1.5 rounded-xl bg-black/5 dark:bg-black/30 border border-black/5 dark:border-white/5">
            <span className="text-[9px] text-zinc-500 block">Poids Chutes</span>
            <span className={`text-xs font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
              {totalUsableEstimatedWeightKg} kg
            </span>
          </div>

          <div className="p-1.5 rounded-xl bg-black/5 dark:bg-black/30 border border-black/5 dark:border-white/5">
            <span className="text-[9px] text-zinc-500 block">Bac Scrap Fonderie</span>
            <span className="text-xs font-bold text-amber-400">
              {totalScrapWeightKg} kg
            </span>
          </div>

          <div className="p-1.5 rounded-xl bg-black/5 dark:bg-black/30 border border-black/5 dark:border-white/5">
            <span className="text-[9px] text-zinc-500 block">Valeur Scrap Estimée</span>
            <span className="text-xs font-bold text-[#D4AF37]">
              {totalScrapValuationDzd.toLocaleString('fr-DZ')} DZD
            </span>
          </div>
        </div>

        {/* 3. SEGMENTED TABS */}
        <div className="flex border-b border-black/10 dark:border-white/10 p-2 gap-1.5 shrink-0">
          <button
            type="button"
            onClick={() => {
              playTactileClick();
              setActiveTab('chutes');
            }}
            className={`flex-1 py-2 px-2 rounded-xl text-center font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
              activeTab === 'chutes'
                ? 'bg-[#D4AF37] text-slate-950 shadow-sm'
                : isLight
                ? 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                : 'bg-white/5 text-zinc-400 hover:text-white'
            }`}
          >
            <Warehouse className="w-3.5 h-3.5" />
            <span>Chutes Casier ({offcuts.length})</span>
          </button>

          <button
            type="button"
            onClick={() => {
              playTactileClick();
              setActiveTab('scrap');
            }}
            className={`flex-1 py-2 px-2 rounded-xl text-center font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
              activeTab === 'scrap'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : isLight
                ? 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                : 'bg-white/5 text-zinc-400 hover:text-white'
            }`}
          >
            <Scale className="w-3.5 h-3.5" />
            <span>Bacs Fonderie ({totalScrapWeightKg} kg)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              playTactileClick();
              setActiveTab('new');
            }}
            className={`py-2 px-3 rounded-xl text-center font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
              activeTab === 'new'
                ? 'bg-emerald-500 text-slate-950 shadow-sm'
                : isLight
                ? 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                : 'bg-white/5 text-zinc-400 hover:text-white'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Nouvelle</span>
          </button>
        </div>

        {/* 4. CONTENT SCROLL AREA */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* TAB 1: USABLE OFFCUTS */}
          {activeTab === 'chutes' && (
            <div className="space-y-3">
              {/* Filter controls */}
              <div className="space-y-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                  <input
                    type="text"
                    placeholder="Filtrer par profilé, couleur, casier..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={`w-full pl-9 pr-3 py-2 rounded-xl border text-xs ${
                      isLight
                        ? 'bg-white border-slate-300 text-slate-900'
                        : 'bg-black/30 border-white/10 text-white'
                    }`}
                  />
                </div>

                <div className="flex items-center justify-between gap-2 overflow-x-auto no-scrollbar pb-1">
                  <div className="flex items-center gap-1">
                    {(['all', 'aluminium', 'pvc'] as const).map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => {
                          playTactileClick();
                          setMaterialFilter(m);
                        }}
                        className={`px-2.5 py-1 rounded-lg text-[10px] uppercase font-bold cursor-pointer transition-all ${
                          materialFilter === m
                            ? 'bg-[#D4AF37] text-slate-950'
                            : isLight
                            ? 'bg-slate-100 text-slate-600'
                            : 'bg-white/5 text-zinc-400'
                        }`}
                      >
                        {m === 'all' ? 'Tous' : m}
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center gap-1 text-[10px]">
                    <span className="text-zinc-500">Longueur :</span>
                    {[0, 1000, 1500, 1800].map((len) => (
                      <button
                        key={len}
                        type="button"
                        onClick={() => {
                          playTactileClick();
                          setMinLengthFilter(len);
                        }}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer ${
                          minLengthFilter === len
                            ? 'bg-cyan-500 text-slate-950'
                            : isLight
                            ? 'bg-slate-100 text-slate-600'
                            : 'bg-white/5 text-zinc-400'
                        }`}
                      >
                        {len === 0 ? 'Toutes' : `≥ ${len}mm`}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Offcuts list */}
              {filteredOffcuts.length === 0 ? (
                <div
                  className={`p-8 rounded-2xl border text-center space-y-2 ${
                    isLight ? 'bg-slate-50 border-slate-200' : 'bg-black/20 border-white/5'
                  }`}
                >
                  <Warehouse className="w-8 h-8 mx-auto text-zinc-500 opacity-40" />
                  <p className="text-zinc-400">Aucune chute correspondant aux critères.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredOffcuts.map((item) => {
                    const estWeight = estimateProfileWeightKg(item.profileCode, item.lengthMm);
                    const lengthPercent = Math.min(100, Math.round((item.lengthMm / 6000) * 100));

                    return (
                      <div
                        key={item.id}
                        className={`p-3 rounded-2xl border transition-all space-y-2 ${
                          isLight
                            ? 'bg-slate-50 border-slate-200 hover:border-slate-300'
                            : 'bg-black/25 border-white/5 hover:border-white/10'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 mb-1">
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                  item.material === 'pvc'
                                    ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                                    : 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                                }`}
                              >
                                {item.profileCode}
                              </span>
                              <span className="px-1.5 py-0.5 rounded text-[10px] bg-amber-500/15 text-amber-400 border border-amber-500/30 font-bold">
                                {item.rackLocation}
                              </span>
                              <span className="text-[10px] text-zinc-500">{item.barcode}</span>
                            </div>

                            <h4
                              className={`text-xs font-bold truncate ${
                                isLight ? 'text-slate-900' : 'text-white'
                              }`}
                            >
                              {item.label}
                            </h4>
                            <p className="text-[10px] text-zinc-500">
                              {item.finishColor} {item.jobOrigin ? `• Origine : ${item.jobOrigin}` : ''}
                            </p>
                          </div>

                          <div className="text-right shrink-0">
                            <div className="text-sm font-black text-cyan-400">
                              {item.lengthMm} mm
                            </div>
                            <span className="text-[10px] text-zinc-500 block">
                              ~{estWeight} kg
                            </span>
                          </div>
                        </div>

                        {/* Visual length bar */}
                        <div className="space-y-0.5">
                          <div className="w-full h-1.5 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-cyan-500 to-[#D4AF37] rounded-full"
                              style={{ width: `${lengthPercent}%` }}
                            />
                          </div>
                          <div className="flex justify-between text-[9px] text-zinc-500 font-mono">
                            <span>0 mm</span>
                            <span>{lengthPercent}% d une barre de 6m</span>
                            <span>6000 mm</span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-end gap-1.5 pt-1 border-t border-black/5 dark:border-white/5">
                          <button
                            type="button"
                            onClick={() => handleConvertToScrap(item.id, item.label)}
                            className="px-2.5 py-1.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 text-[10px] font-bold flex items-center gap-1 cursor-pointer hover:bg-amber-500/25 active:scale-95 transition-all"
                            title="Rebuter cette chute et transférer son poids vers le bac fonderie"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>Rebut Fonderie</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleConsumeOffcut(item.id, item.label)}
                            className="px-2.5 py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold flex items-center gap-1 cursor-pointer hover:bg-emerald-500/25 active:scale-95 transition-all"
                            title="Déduire cette chute de l inventaire après découpe"
                          >
                            <Check className="w-3 h-3" />
                            <span>Consommer sur Débit</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: SCRAP BINS & FOUNDRY VALUATION */}
          {activeTab === 'scrap' && (
            <div className="space-y-4">
              <div className="space-y-3">
                {scrapBins.map((bin) => {
                  const fillPercent = Math.min(100, Math.round((bin.currentWeightKg / bin.capacityKg) * 100));
                  const valuationDzd = Math.round(bin.currentWeightKg * bin.marketPriceDzdPerKg);
                  const isNearlyFull = fillPercent >= 80;

                  return (
                    <div
                      key={bin.id}
                      className={`p-4 rounded-3xl border space-y-3 ${
                        isNearlyFull
                          ? isLight
                            ? 'bg-amber-50/70 border-amber-300 shadow-xs'
                            : 'bg-amber-500/10 border-amber-500/30 shadow-xs'
                          : isLight
                          ? 'bg-white border-slate-200 shadow-xs'
                          : 'bg-black/25 border-white/10'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="w-2 h-2 rounded-full bg-amber-400" />
                            <h4
                              className={`text-xs font-bold truncate ${
                                isLight ? 'text-slate-900' : 'text-white'
                              }`}
                            >
                              {bin.name}
                            </h4>
                          </div>
                          <p className="text-[10px] text-zinc-500">
                            {bin.alloyType} • {bin.locationInWorkshop}
                          </p>
                          <p className="text-[9px] text-zinc-500">
                            Collecteur habituel : {bin.preferredCollector}
                          </p>
                        </div>

                        <div className="text-right shrink-0">
                          <div className="text-base font-black text-amber-400">
                            {bin.currentWeightKg} kg
                          </div>
                          <span className="text-[10px] text-zinc-500">
                            / {bin.capacityKg} kg max
                          </span>
                        </div>
                      </div>

                      {/* Fill Progress Bar */}
                      <div className="space-y-1">
                        <div className="w-full h-2 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              fillPercent >= 90
                                ? 'bg-rose-500'
                                : fillPercent >= 70
                                ? 'bg-amber-400'
                                : 'bg-emerald-500'
                            }`}
                            style={{ width: `${fillPercent}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-[9px] text-zinc-500 font-mono">
                          <span>Remplissage : {fillPercent}%</span>
                          <span>Cours : {bin.marketPriceDzdPerKg} DZD/kg</span>
                          <span className="font-bold text-[#D4AF37]">
                            Valeur : {valuationDzd.toLocaleString('fr-DZ')} DZD
                          </span>
                        </div>
                      </div>

                      {/* Weight Steppers */}
                      <div className="flex items-center justify-between gap-1 pt-1 border-t border-black/5 dark:border-white/5">
                        <span className="text-[10px] text-zinc-500">Ajout Pesée :</span>
                        <div className="flex items-center gap-1">
                          {[5, 10, 25, 50].map((delta) => (
                            <button
                              key={delta}
                              type="button"
                              onClick={() => handleQuickAddScrap(bin.id, delta)}
                              className={`px-2 py-1 rounded-lg border text-[10px] font-bold cursor-pointer transition-all active:scale-95 ${
                                isLight
                                  ? 'bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200'
                                  : 'bg-white/5 border-white/10 text-zinc-300 hover:bg-white/10'
                              }`}
                            >
                              +{delta} kg
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="grid grid-cols-2 gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => handleWhatsAppCollector(bin)}
                          className="py-2 px-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold flex items-center justify-center gap-1.5 cursor-pointer hover:bg-emerald-500/25 active:scale-95 transition-all"
                        >
                          <MessageCircle className="w-3.5 h-3.5 shrink-0" />
                          <span>Avis Enlèvement WhatsApp</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleOpenSaleModal(bin)}
                          className="py-2 px-2 rounded-xl bg-gradient-to-r from-[#C5A880] to-[#D4AF37] text-slate-950 text-[10px] font-bold flex items-center justify-center gap-1.5 cursor-pointer hover:brightness-110 active:scale-95 transition-all shadow-xs"
                        >
                          <Scale className="w-3.5 h-3.5 shrink-0" />
                          <span>Vente & Vider Bac</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Past Sales History */}
              <div className="pt-2 space-y-2">
                <span className="text-[11px] font-bold text-zinc-400 block">
                  Historique Récent des Ventes Fonderie ({scrapSales.length})
                </span>

                <div className="space-y-1.5">
                  {scrapSales.map((sale) => (
                    <div
                      key={sale.id}
                      className={`p-2.5 rounded-xl border flex items-center justify-between text-[11px] ${
                        isLight
                          ? 'bg-slate-50 border-slate-200'
                          : 'bg-black/20 border-white/5 text-zinc-300'
                      }`}
                    >
                      <div>
                        <div className="font-bold">{sale.collectorName}</div>
                        <div className="text-[10px] text-zinc-500">
                          {sale.date} • {sale.receiptRef} • {sale.binName}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-[#D4AF37]">
                          +{sale.totalPaidDzd.toLocaleString('fr-DZ')} DZD
                        </div>
                        <div className="text-[10px] text-zinc-500">
                          {sale.weightKg} kg @ {sale.pricePerKgDzd} DZD/kg
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: NEW OFFCUT FORM */}
          {activeTab === 'new' && (
            <form onSubmit={handleCreateOffcut} className="space-y-3">
              <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[11px] flex items-center gap-2">
                <Sparkles className="w-4 h-4 shrink-0 text-amber-400" />
                <span>
                  Toute chute inférieure à 800 mm sera automatiquement redirigée vers la pesée scrap fonderie.
                </span>
              </div>

              <div className="grid grid-cols-12 gap-2">
                <div className="col-span-6">
                  <label className="text-[10px] text-zinc-400 block mb-1">Matière</label>
                  <select
                    value={newMaterial}
                    onChange={(e) => setNewMaterial(e.target.value as any)}
                    className={`w-full p-2 rounded-xl border ${
                      isLight
                        ? 'bg-white border-slate-300 text-slate-900'
                        : 'bg-black/30 border-white/10 text-white'
                    }`}
                  >
                    <option value="aluminium">Aluminium</option>
                    <option value="pvc">PVC</option>
                  </select>
                </div>

                <div className="col-span-6">
                  <label className="text-[10px] text-zinc-400 block mb-1">Code Profilé</label>
                  <input
                    type="text"
                    value={newProfileCode}
                    onChange={(e) => setNewProfileCode(e.target.value)}
                    placeholder="ex: TPR-40, TPR-OUV"
                    className={`w-full p-2 rounded-xl border ${
                      isLight
                        ? 'bg-white border-slate-300 text-slate-900'
                        : 'bg-black/30 border-white/10 text-white'
                    }`}
                  />
                </div>

                <div className="col-span-12">
                  <label className="text-[10px] text-zinc-400 block mb-1">Désignation</label>
                  <input
                    type="text"
                    value={newLabel}
                    onChange={(e) => setNewLabel(e.target.value)}
                    placeholder="ex: Dormant Tubulaire 40 RPT"
                    className={`w-full p-2 rounded-xl border ${
                      isLight
                        ? 'bg-white border-slate-300 text-slate-900'
                        : 'bg-black/30 border-white/10 text-white'
                    }`}
                  />
                </div>

                <div className="col-span-6">
                  <label className="text-[10px] text-zinc-400 block mb-1">Longueur (mm)</label>
                  <input
                    type="number"
                    value={newLengthMm}
                    onChange={(e) => setNewLengthMm(parseInt(e.target.value) || 0)}
                    placeholder="1450"
                    className={`w-full p-2 rounded-xl border font-bold ${
                      isLight
                        ? 'bg-white border-slate-300 text-slate-900'
                        : 'bg-black/30 border-white/10 text-white'
                    }`}
                  />
                </div>

                <div className="col-span-6">
                  <label className="text-[10px] text-zinc-400 block mb-1">Casier Stockage</label>
                  <input
                    type="text"
                    value={newRackLocation}
                    onChange={(e) => setNewRackLocation(e.target.value)}
                    placeholder="CASIER-A-03"
                    className={`w-full p-2 rounded-xl border ${
                      isLight
                        ? 'bg-white border-slate-300 text-slate-900'
                        : 'bg-black/30 border-white/10 text-white'
                    }`}
                  />
                </div>

                <div className="col-span-6">
                  <label className="text-[10px] text-zinc-400 block mb-1">Couleur Finition</label>
                  <input
                    type="text"
                    value={newFinishColor}
                    onChange={(e) => setNewFinishColor(e.target.value)}
                    placeholder="Blanc RAL 9016"
                    className={`w-full p-2 rounded-xl border ${
                      isLight
                        ? 'bg-white border-slate-300 text-slate-900'
                        : 'bg-black/30 border-white/10 text-white'
                    }`}
                  />
                </div>

                <div className="col-span-6">
                  <label className="text-[10px] text-zinc-400 block mb-1">Affaire d Origine</label>
                  <input
                    type="text"
                    value={newJobOrigin}
                    onChange={(e) => setNewJobOrigin(e.target.value)}
                    placeholder="Villa Hydra"
                    className={`w-full p-2 rounded-xl border ${
                      isLight
                        ? 'bg-white border-slate-300 text-slate-900'
                        : 'bg-black/30 border-white/10 text-white'
                    }`}
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-[#C5A880] to-[#D4AF37] text-slate-950 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md hover:brightness-110 active:scale-98 transition-all min-h-[46px]"
              >
                <Plus className="w-4 h-4" />
                <span>Enregistrer la Chute dans le Casier</span>
              </button>
            </form>
          )}
        </div>

        {/* 5. SCRAP SALE SETTLEMENT MODAL (NESTED OVERLAY) */}
        {selectedBinForSale && (
          <div className="fixed inset-0 z-60 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div
              className={`w-full max-w-md p-4 rounded-3xl border shadow-2xl space-y-3 font-mono text-xs ${
                isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-[#0E131F] border-white/10 text-white'
              }`}
            >
              <div className="flex items-center justify-between border-b border-black/10 dark:border-white/10 pb-2">
                <div className="flex items-center gap-2">
                  <Scale className="w-4 h-4 text-amber-400" />
                  <h4 className="font-bold">Règlement & Vente Ferraille</h4>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedBinForSale(null)}
                  className="p-1 rounded-lg text-zinc-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleConfirmSale} className="space-y-2.5">
                <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[11px]">
                  Vente du contenu de : <strong>{selectedBinForSale.name}</strong>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-zinc-500 block mb-0.5">Poids Pesé (kg)</label>
                    <input
                      type="number"
                      step="0.5"
                      value={saleWeight}
                      onChange={(e) => setSaleWeight(parseFloat(e.target.value) || 0)}
                      className={`w-full p-2 rounded-xl border font-bold ${
                        isLight ? 'bg-white border-slate-300' : 'bg-black/30 border-white/10'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-zinc-500 block mb-0.5">Prix convenu (DZD/kg)</label>
                    <input
                      type="number"
                      value={salePricePerKg}
                      onChange={(e) => setSalePricePerKg(parseInt(e.target.value) || 0)}
                      className={`w-full p-2 rounded-xl border font-bold ${
                        isLight ? 'bg-white border-slate-300' : 'bg-black/30 border-white/10'
                      }`}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] text-zinc-500 block mb-0.5">Fonderie / Récupérateur</label>
                  <input
                    type="text"
                    value={saleCollector}
                    onChange={(e) => setSaleCollector(e.target.value)}
                    className={`w-full p-2 rounded-xl border ${
                      isLight ? 'bg-white border-slate-300' : 'bg-black/30 border-white/10'
                    }`}
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-zinc-500 block mb-0.5">N° Bon / Ticket Pesée</label>
                    <input
                      type="text"
                      value={saleReceiptRef}
                      onChange={(e) => setSaleReceiptRef(e.target.value)}
                      className={`w-full p-2 rounded-xl border ${
                        isLight ? 'bg-white border-slate-300' : 'bg-black/30 border-white/10'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-zinc-500 block mb-0.5">Règlement</label>
                    <select
                      value={salePaymentStatus}
                      onChange={(e) => setSalePaymentStatus(e.target.value as any)}
                      className={`w-full p-2 rounded-xl border ${
                        isLight ? 'bg-white border-slate-300' : 'bg-black/30 border-white/10'
                      }`}
                    >
                      <option value="especes_recue">Espèces perçues</option>
                      <option value="baridimob">BaridiMob reçu</option>
                      <option value="en_attente">En attente règlement</option>
                    </select>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 flex items-center justify-between">
                  <span className="text-[11px] text-zinc-400">Total Encaissé :</span>
                  <span className="text-base font-black text-[#D4AF37]">
                    {(Math.round(saleWeight * salePricePerKg)).toLocaleString('fr-DZ')} DZD
                  </span>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-[#D4AF37] text-slate-950 font-bold text-xs cursor-pointer hover:brightness-110 active:scale-98 transition-all"
                >
                  Valider l Encaissement & Vider le Bac
                </button>
              </form>
            </div>
          </div>
        )}

        {/* 6. FLOATING TOAST */}
        {toastMessage && (
          <div className="p-3 bg-emerald-500/20 border-t border-emerald-500/30 text-emerald-400 flex items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2">
              <Check className="w-3.5 h-3.5 shrink-0" />
              <span>{toastMessage}</span>
            </div>
            <button
              type="button"
              onClick={() => setToastMessage(null)}
              className="text-zinc-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
