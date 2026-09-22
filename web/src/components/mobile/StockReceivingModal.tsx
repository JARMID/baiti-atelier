import React, { useState, useMemo } from 'react';
import {
  type WorkshopStockItem,
  type StockInwardReceipt,
  type StockInwardReceiptItem,
  recordStockInwardReceipt,
} from '../../utils/workshopInventoryManager';
import { generateStockReceivingSlipPdf } from '../../utils/pdfGenerator';
import { playTactileClick, playClampSound } from '../../utils/audioFeedback';
import {
  X,
  Check,
  Plus,
  Trash2,
  PackageCheck,
  Truck,
  MessageCircle,
  FileCheck,
  AlertTriangle,
} from 'lucide-react';
import { useConfigStore } from '../../store/configStore';

export interface StockReceivingModalProps {
  isOpen: boolean;
  onClose: () => void;
  stockItems: WorkshopStockItem[];
  preselectedItem?: WorkshopStockItem | null;
  onStockUpdated: (updated: WorkshopStockItem[]) => void;
}

const ALGERIAN_SUPPLIERS = [
  'Profilor Extrusion Alger',
  'Algal Aluminium Oran',
  'TPR Profilés Constantine',
  'Eurl Benhamadi Bordj Bou Arreridj',
  'Soprofen Algérie',
  'Visserie Industrielle Blida',
  'Miroiterie Centrale Constantine',
  'Autre Fournisseur',
];

export const StockReceivingModal: React.FC<StockReceivingModalProps> = ({
  isOpen,
  onClose,
  stockItems,
  preselectedItem,
  onStockUpdated,
}) => {
  const { theme } = useConfigStore();
  const isLight = theme === 'light';

  const [receiptNumber] = useState<string>(
    () => `BR-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`
  );
  const [supplierName, setSupplierName] = useState<string>(() => {
    return preselectedItem?.supplierName || ALGERIAN_SUPPLIERS[0];
  });
  const [supplierDeliveryNoteRef, setSupplierDeliveryNoteRef] = useState<string>('');
  const [deliveryDate, setDeliveryDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [receiverName, setReceiverName] = useState<string>('Chef d Atelier');
  const [notes, setNotes] = useState<string>(
    'Colisage vérifié et pointé à l arrivée du camion. Barres intactes sous film protecteur.'
  );

  // Receiving line items
  const [receiptLines, setReceiptLines] = useState<StockInwardReceiptItem[]>(() => {
    if (preselectedItem) {
      const needed = Math.max(1, preselectedItem.minAlertThreshold * 2 - preselectedItem.currentQuantity);
      return [
        {
          stockItemId: preselectedItem.id,
          code: preselectedItem.code,
          name: preselectedItem.name,
          category: preselectedItem.category,
          quantityReceived: needed > 0 ? needed : 5,
          unit: preselectedItem.unit,
          unitCostDzd: preselectedItem.unitCostDzd,
          rackLocation: preselectedItem.rackLocation || 'CASIER-A-01',
          conformity: 'conforme',
        },
      ];
    }
    // Default to low stock items (up to 4)
    const low = stockItems.filter((i) => i.currentQuantity <= i.minAlertThreshold).slice(0, 4);
    if (low.length > 0) {
      return low.map((item) => ({
        stockItemId: item.id,
        code: item.code,
        name: item.name,
        category: item.category,
        quantityReceived: Math.max(1, item.minAlertThreshold * 2 - item.currentQuantity),
        unit: item.unit,
        unitCostDzd: item.unitCostDzd,
        rackLocation: item.rackLocation || 'CASIER-A-01',
        conformity: 'conforme',
      }));
    }
    // Fallback on first item
    const first = stockItems[0];
    return first
      ? [
          {
            stockItemId: first.id,
            code: first.code,
            name: first.name,
            category: first.category,
            quantityReceived: 5,
            unit: first.unit,
            unitCostDzd: first.unitCostDzd,
            rackLocation: first.rackLocation || 'CASIER-A-01',
            conformity: 'conforme',
          },
        ]
      : [];
  });

  const [selectedStockToAdd, setSelectedStockToAdd] = useState<string>('');
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const totalValueDzd = useMemo(() => {
    return receiptLines.reduce((sum, line) => sum + line.quantityReceived * line.unitCostDzd, 0);
  }, [receiptLines]);

  const totalUnits = useMemo(() => {
    return receiptLines.reduce((sum, line) => sum + line.quantityReceived, 0);
  }, [receiptLines]);

  if (!isOpen) return null;

  const handleUpdateQty = (index: number, newQty: number) => {
    playTactileClick();
    const safeQty = Math.max(1, newQty);
    setReceiptLines((prev) =>
      prev.map((line, idx) => (idx === index ? { ...line, quantityReceived: safeQty } : line))
    );
  };

  const handleUpdateRack = (index: number, rackLocation: string) => {
    setReceiptLines((prev) =>
      prev.map((line, idx) => (idx === index ? { ...line, rackLocation } : line))
    );
  };

  const handleToggleConformity = (index: number) => {
    playTactileClick();
    setReceiptLines((prev) =>
      prev.map((line, idx) =>
        idx === index
          ? { ...line, conformity: line.conformity === 'conforme' ? 'reserves' : 'conforme' }
          : line
      )
    );
  };

  const handleRemoveLine = (index: number) => {
    playTactileClick();
    setReceiptLines((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleAddCatalogItem = () => {
    if (!selectedStockToAdd) return;
    const found = stockItems.find((s) => s.id === selectedStockToAdd);
    if (!found) return;

    playTactileClick();
    // Check if already in lines
    if (receiptLines.some((l) => l.stockItemId === found.id)) {
      setToastMessage('Cet article est déjà présent dans la liste.');
      setTimeout(() => setToastMessage(null), 2500);
      return;
    }

    const needed = Math.max(1, found.minAlertThreshold * 2 - found.currentQuantity);
    setReceiptLines((prev) => [
      ...prev,
      {
        stockItemId: found.id,
        code: found.code,
        name: found.name,
        category: found.category,
        quantityReceived: needed > 0 ? needed : 5,
        unit: found.unit,
        unitCostDzd: found.unitCostDzd,
        rackLocation: found.rackLocation || 'CASIER-A-01',
        conformity: 'conforme',
      },
    ]);
    setSelectedStockToAdd('');
  };

  const handleValidateReception = () => {
    if (receiptLines.length === 0) return;
    playClampSound();

    const receipt: StockInwardReceipt = {
      receiptNumber,
      supplierName,
      supplierDeliveryNoteRef: supplierDeliveryNoteRef.trim() || 'BL-DIRECT',
      deliveryDate,
      receiverName,
      items: receiptLines,
      totalValueDzd,
      notes,
    };

    const updatedStock = recordStockInwardReceipt(receipt);
    onStockUpdated(updatedStock);

    setToastMessage(`Entrée de ${totalUnits} unités validée avec succès !`);
    setTimeout(() => {
      setToastMessage(null);
      onClose();
    }, 600);
  };

  const handleDownloadPdf = async () => {
    playTactileClick();
    if (receiptLines.length === 0) return;
    setIsGeneratingPdf(true);
    try {
      await generateStockReceivingSlipPdf({
        receiptNumber,
        supplierName,
        supplierDeliveryNoteRef: supplierDeliveryNoteRef.trim() || 'BL-DIRECT',
        deliveryDate,
        receiverName,
        items: receiptLines,
        totalValueDzd,
        notes,
      });
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleWhatsAppConfirmation = () => {
    playTactileClick();
    let msg = `*ACCUSÉ DE RÉCEPTION ARRIVAGE • BAITI ATELIER*\n`;
    msg += `----------------------------------------\n`;
    msg += `📄 *Bon de Réception :* ${receiptNumber}\n`;
    msg += `🚚 *Fournisseur :* ${supplierName}\n`;
    msg += `📦 *N° BL Fournisseur :* ${supplierDeliveryNoteRef.trim() || 'Sans référence'}\n`;
    msg += `📅 *Date réception :* ${deliveryDate}\n`;
    msg += `👨‍🔧 *Réceptionnaire :* ${receiverName}\n`;
    msg += `----------------------------------------\n`;
    msg += `*ARTICLES DÉCHARGÉS ET POINTÉS (${totalUnits} unités) :*\n`;
    receiptLines.forEach((line, idx) => {
      const icon = line.conformity === 'conforme' ? '✅' : '⚠️';
      msg += `${idx + 1}. ${icon} *${line.name}* [${line.code}]\n   Qté reçue : *${line.quantityReceived} ${line.unit}* | Casier : ${line.rackLocation || 'Stock'}\n`;
    });
    msg += `----------------------------------------\n`;
    msg += `💰 *Valeur totale arrivage :* ${totalValueDzd.toLocaleString('fr-DZ')} DZD\n`;
    msg += `📝 *Observations :* ${notes || 'Colisage 100% conforme'}\n`;
    msg += `----------------------------------------\n`;
    msg += `_Baiti Atelier • Plateforme Métier Menuiserie & Pose Algérie_`;

    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-xs">
      <div
        className={`w-full max-w-xl rounded-t-3xl sm:rounded-3xl border shadow-2xl overflow-hidden flex flex-col max-h-[92vh] ${
          isLight ? 'bg-white border-slate-200' : 'bg-[#0B0F19] border-white/10'
        }`}
      >
        {/* Modal Header */}
        <div className="p-4 border-b border-black/5 dark:border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-sky-500/10 text-sky-400">
              <PackageCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className={`text-sm font-bold font-mono ${isLight ? 'text-slate-900' : 'text-white'}`}>
                Réception Arrivage & Entrée Stock
              </h2>
              <span className="text-[11px] font-mono text-zinc-500">
                {receiptNumber} • Pointage des barres et matières
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className={`p-2 rounded-xl border cursor-pointer ${
              isLight
                ? 'bg-slate-100 border-slate-200 text-slate-500 hover:bg-slate-200'
                : 'bg-white/5 border-white/10 text-zinc-400 hover:bg-white/10'
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 overflow-y-auto space-y-4 font-mono text-xs">
          {/* Toast Notice */}
          {toastMessage && (
            <div className="p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold text-center">
              {toastMessage}
            </div>
          )}

          {/* Supplier & Delivery Metadata Card */}
          <div
            className={`p-3 rounded-2xl border space-y-2.5 ${
              isLight ? 'bg-slate-50 border-slate-200' : 'bg-black/30 border-white/5'
            }`}
          >
            <div className="flex items-center gap-1.5 font-bold text-[11px] text-sky-400">
              <Truck className="w-3.5 h-3.5" />
              <span>Origine Fournisseur & Bon de Livraison (BL)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-[10px] text-zinc-500 block">Fournisseur</label>
                <select
                  value={supplierName}
                  onChange={(e) => setSupplierName(e.target.value)}
                  className={`w-full p-2 rounded-xl border text-xs font-mono min-h-[40px] cursor-pointer ${
                    isLight
                      ? 'bg-white border-slate-200 text-slate-800'
                      : 'bg-black/40 border-white/10 text-white'
                  }`}
                >
                  {ALGERIAN_SUPPLIERS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-zinc-500 block">N° Bon de Livraison Fournisseur</label>
                <input
                  type="text"
                  value={supplierDeliveryNoteRef}
                  onChange={(e) => setSupplierDeliveryNoteRef(e.target.value)}
                  placeholder="Ex: BL-4892 / BL-PROFILOR"
                  className={`w-full p-2 rounded-xl border text-xs font-mono min-h-[40px] ${
                    isLight
                      ? 'bg-white border-slate-200 text-slate-800'
                      : 'bg-black/40 border-white/10 text-white'
                  }`}
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-zinc-500 block">Date d arrivage</label>
                <input
                  type="date"
                  value={deliveryDate}
                  onChange={(e) => setDeliveryDate(e.target.value)}
                  className={`w-full p-2 rounded-xl border text-xs font-mono min-h-[40px] ${
                    isLight
                      ? 'bg-white border-slate-200 text-slate-800'
                      : 'bg-black/40 border-white/10 text-white'
                  }`}
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-zinc-500 block">Magasinier réceptionnaire</label>
                <input
                  type="text"
                  value={receiverName}
                  onChange={(e) => setReceiverName(e.target.value)}
                  placeholder="Nom du responsable magasin"
                  className={`w-full p-2 rounded-xl border text-xs font-mono min-h-[40px] ${
                    isLight
                      ? 'bg-white border-slate-200 text-slate-800'
                      : 'bg-black/40 border-white/10 text-white'
                  }`}
                />
              </div>
            </div>
          </div>

          {/* KPI Summary Banner */}
          <div
            className={`p-3 rounded-2xl border flex items-center justify-between ${
              isLight ? 'bg-sky-50 border-sky-200 text-sky-900' : 'bg-sky-500/10 border-sky-500/20 text-sky-300'
            }`}
          >
            <div>
              <span className="text-[10px] opacity-80 block uppercase">Arrivage Total</span>
              <span className="text-base font-black">
                {totalUnits} unités pointées
              </span>
            </div>
            <div className="text-right">
              <span className="text-[10px] opacity-80 block uppercase">Valeur Estimée HT</span>
              <span className="text-base font-black text-[#D4AF37]">
                {totalValueDzd.toLocaleString('fr-DZ')} DZD
              </span>
            </div>
          </div>

          {/* Add Article from Catalog Row */}
          <div className="flex items-center gap-1.5">
            <select
              value={selectedStockToAdd}
              onChange={(e) => setSelectedStockToAdd(e.target.value)}
              className={`flex-1 p-2 rounded-xl border text-xs font-mono min-h-[40px] cursor-pointer ${
                isLight ? 'bg-white border-slate-200 text-slate-800' : 'bg-[#0B0F19] border-white/10 text-white'
              }`}
            >
              <option value="">+ Ajouter un article de l inventaire au bon...</option>
              {stockItems.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name} [{item.code}] (Stock : {item.currentQuantity} {item.unit})
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={handleAddCatalogItem}
              disabled={!selectedStockToAdd}
              className="py-2 px-3 rounded-xl bg-sky-500 text-white font-bold flex items-center justify-center gap-1 min-h-[40px] cursor-pointer disabled:opacity-40"
            >
              <Plus className="w-4 h-4" />
              <span>Ajouter</span>
            </button>
          </div>

          {/* Receiving Lines List */}
          <div className="space-y-2">
            <span className="text-[10px] text-zinc-400 uppercase tracking-wider block font-bold">
              Articles à Pointage & Racks d Affectation ({receiptLines.length})
            </span>

            {receiptLines.length === 0 ? (
              <div
                className={`p-6 rounded-2xl border text-center text-zinc-500 ${
                  isLight ? 'bg-slate-50 border-slate-200' : 'bg-white/5 border-white/5'
                }`}
              >
                Aucun article dans ce bon de réception. Utilisez le menu ci-dessus pour en ajouter.
              </div>
            ) : (
              <div className="space-y-2">
                {receiptLines.map((line, index) => {
                  const lineTotal = line.quantityReceived * line.unitCostDzd;
                  return (
                    <div
                      key={line.stockItemId}
                      className={`p-3 rounded-2xl border space-y-2 ${
                        line.conformity === 'conforme'
                          ? isLight
                            ? 'bg-white border-slate-200'
                            : 'bg-white/5 border-white/10'
                          : 'bg-rose-500/10 border-rose-500/30'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <span className="text-[10px] text-sky-400 font-bold block">{line.code}</span>
                          <h4 className={`text-xs font-bold truncate ${isLight ? 'text-slate-900' : 'text-white'}`}>
                            {line.name}
                          </h4>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleToggleConformity(index)}
                            className={`px-2 py-1 rounded-lg text-[9px] font-bold border cursor-pointer transition-all flex items-center gap-1 ${
                              line.conformity === 'conforme'
                                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                                : 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                            }`}
                            title="Changer le statut de conformité"
                          >
                            {line.conformity === 'conforme' ? (
                              <>
                                <Check className="w-3 h-3" />
                                <span>Conforme</span>
                              </>
                            ) : (
                              <>
                                <AlertTriangle className="w-3 h-3" />
                                <span>Réserves</span>
                              </>
                            )}
                          </button>

                          <button
                            type="button"
                            onClick={() => handleRemoveLine(index)}
                            className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-400 cursor-pointer"
                            title="Retirer cet article"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Quantity Stepper & Rack Location Row */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                        {/* Quantity Stepper */}
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] text-zinc-500 shrink-0">Qté reçue :</span>
                          <div className="flex items-center gap-1 flex-1">
                            <button
                              type="button"
                              onClick={() => handleUpdateQty(index, line.quantityReceived - 1)}
                              className={`w-7 h-7 rounded-lg border font-bold text-xs flex items-center justify-center cursor-pointer ${
                                isLight
                                  ? 'bg-slate-100 border-slate-200 text-slate-700'
                                  : 'bg-white/10 border-white/10 text-white'
                              }`}
                            >
                              -
                            </button>
                            <input
                              type="number"
                              min="1"
                              value={line.quantityReceived}
                              onChange={(e) => handleUpdateQty(index, Number(e.target.value))}
                              className={`w-14 text-center p-1 rounded-lg border font-bold text-xs ${
                                isLight
                                  ? 'bg-white border-slate-200 text-slate-900'
                                  : 'bg-black/30 border-white/10 text-white'
                              }`}
                            />
                            <button
                              type="button"
                              onClick={() => handleUpdateQty(index, line.quantityReceived + 1)}
                              className={`w-7 h-7 rounded-lg border font-bold text-xs flex items-center justify-center cursor-pointer ${
                                isLight
                                  ? 'bg-slate-100 border-slate-200 text-slate-700'
                                  : 'bg-white/10 border-white/10 text-white'
                              }`}
                            >
                              +
                            </button>
                            <button
                              type="button"
                              onClick={() => handleUpdateQty(index, line.quantityReceived + 5)}
                              className={`px-1.5 py-1 rounded-lg border font-bold text-[10px] cursor-pointer ${
                                isLight
                                  ? 'bg-slate-100 border-slate-200 text-slate-700'
                                  : 'bg-white/10 border-white/10 text-white'
                              }`}
                            >
                              +5
                            </button>
                            <button
                              type="button"
                              onClick={() => handleUpdateQty(index, line.quantityReceived + 10)}
                              className={`px-1.5 py-1 rounded-lg border font-bold text-[10px] cursor-pointer ${
                                isLight
                                  ? 'bg-slate-100 border-slate-200 text-slate-700'
                                  : 'bg-white/10 border-white/10 text-white'
                              }`}
                            >
                              +10
                            </button>
                          </div>
                        </div>

                        {/* Rack Location */}
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] text-zinc-500 shrink-0">Casier/Rack :</span>
                          <input
                            type="text"
                            value={line.rackLocation || ''}
                            onChange={(e) => handleUpdateRack(index, e.target.value)}
                            placeholder="Ex: RACK-A-01"
                            className={`flex-1 p-1 rounded-lg border text-xs font-mono ${
                              isLight
                                ? 'bg-white border-slate-200 text-slate-900'
                                : 'bg-black/30 border-white/10 text-white'
                            }`}
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-zinc-500 pt-0.5 border-t border-black/5 dark:border-white/5">
                        <span>P.U. : {line.unitCostDzd.toLocaleString('fr-DZ')} DA / {line.unit}</span>
                        <span className="font-bold text-[#D4AF37]">
                          Ligne : {lineTotal.toLocaleString('fr-DZ')} DZD
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Observations */}
          <div className="space-y-1">
            <label className="text-[10px] text-zinc-500 block">Observations & Réserves de Réception</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className={`w-full p-2 rounded-xl border text-xs font-mono resize-none ${
                isLight ? 'bg-slate-50 border-slate-200 text-slate-800' : 'bg-black/30 border-white/10 text-white'
              }`}
              placeholder="Ex: Matériel déchargé et stocké en casiers d atelier. Aucune avarie apparente constatée."
            />
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-3 border-t border-black/5 dark:border-white/5 bg-black/5 dark:bg-white/5 flex items-center gap-2 font-mono">
          <button
            type="button"
            onClick={handleWhatsAppConfirmation}
            disabled={receiptLines.length === 0}
            className="flex-1 py-2.5 px-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer hover:bg-emerald-500/25 min-h-[44px] active:scale-98 transition-all disabled:opacity-40"
            title="Envoyer un accusé de réception WhatsApp au fournisseur"
          >
            <MessageCircle className="w-4 h-4" />
            <span>WhatsApp BR</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadPdf}
            disabled={isGeneratingPdf || receiptLines.length === 0}
            className={`flex-1 py-2.5 px-2 rounded-xl border font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer min-h-[44px] active:scale-98 transition-all disabled:opacity-40 ${
              isLight
                ? 'bg-sky-50 border-sky-300 text-sky-800 hover:bg-sky-100'
                : 'bg-sky-500/15 border-sky-500/30 text-sky-300 hover:bg-sky-500/25'
            }`}
            title="Télécharger le Bon de Réception officiel (PDF)"
          >
            <FileCheck className="w-4 h-4 text-sky-400" />
            <span>{isGeneratingPdf ? 'Génération...' : 'Bon BR (PDF)'}</span>
          </button>

          <button
            type="button"
            onClick={handleValidateReception}
            disabled={receiptLines.length === 0}
            className="py-2.5 px-4 rounded-xl bg-[#D4AF37] text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer hover:brightness-110 min-h-[44px] active:scale-98 transition-all shadow-md disabled:opacity-40"
          >
            <Check className="w-4 h-4" />
            <span>Valider Entrée</span>
          </button>
        </div>
      </div>
    </div>
  );
};
