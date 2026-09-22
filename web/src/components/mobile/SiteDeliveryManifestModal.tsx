import React, { useState, useMemo } from 'react';
import {
  X,
  Truck,
  Package,
  Check,
  FileDown,
  MessageCircle,
  Plus,
  Trash2,
  UserCheck,
  ShieldCheck,
} from 'lucide-react';
import {
  getDeliveryManifestForJob,
  saveDeliveryManifest,
  formatSiteDeliveryWhatsApp,
  PACKAGE_CATEGORY_CONFIG,
  type SiteDeliveryManifest,
  type DeliveryPackageItem,
  type PackageCategory,
  type PackageCondition,
} from '../../utils/deliveryManifestManager';
import { generateSiteDeliveryManifestPdf } from '../../utils/pdfGenerator';
import { playTactileClick, playClampSound } from '../../utils/audioFeedback';
import { useConfigStore } from '../../store/configStore';
import type { WorkshopJob } from '../../types/workshop';

export interface SiteDeliveryManifestModalProps {
  isOpen: boolean;
  onClose: () => void;
  job: WorkshopJob;
  onManifestUpdated?: (manifest: SiteDeliveryManifest) => void;
}

export const SiteDeliveryManifestModal: React.FC<SiteDeliveryManifestModalProps> = ({
  isOpen,
  onClose,
  job,
  onManifestUpdated,
}) => {
  const { theme } = useConfigStore();
  const isLight = theme === 'light';

  // Active tab: 'packages' (Colisage), 'transport' (Véhicule & Chauffeur), 'reception' (Décharge & Signatures)
  const [activeTab, setActiveTab] = useState<'packages' | 'transport' | 'reception'>('packages');

  // Manifest state
  const [manifest, setManifest] = useState<SiteDeliveryManifest>(() => getDeliveryManifestForJob(job));
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // New package modal form
  const [showAddPackage, setShowAddPackage] = useState(false);
  const [newCat, setNewCat] = useState<PackageCategory>('quincaillerie_accessoires');
  const [newLabel, setNewLabel] = useState('Carton Accessoires Supplémentaires');
  const [newDesc, setNewDesc] = useState('Visserie inox, poignées et cales');
  const [newQty, setNewQty] = useState(1);
  const [newWeight, setNewWeight] = useState(8);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const totalWeight = useMemo(() => {
    return manifest.packages.reduce((sum, p) => sum + p.weightEstimatedKg, 0);
  }, [manifest.packages]);

  const allPackagesChecked = useMemo(() => {
    return manifest.packages.every((p) => p.status === 'charge_camion' || p.status === 'decharge_chantier');
  }, [manifest.packages]);

  if (!isOpen) return null;

  // Update a package property
  const handleTogglePackageStatus = (pkgId: string) => {
    playTactileClick();
    const updatedPackages = manifest.packages.map((p) => {
      if (p.id !== pkgId) return p;
      const nextStatus: DeliveryPackageItem['status'] =
        p.status === 'pret_atelier'
          ? 'charge_camion'
          : p.status === 'charge_camion'
          ? 'decharge_chantier'
          : 'pret_atelier';
      return { ...p, status: nextStatus };
    });

    const updatedManifest: SiteDeliveryManifest = {
      ...manifest,
      packages: updatedPackages,
      totalWeightKg: updatedPackages.reduce((sum, p) => sum + p.weightEstimatedKg, 0),
    };

    setManifest(updatedManifest);
    saveDeliveryManifest(updatedManifest);
    if (onManifestUpdated) onManifestUpdated(updatedManifest);
  };

  const handleUpdatePackageCondition = (pkgId: string, condition: PackageCondition) => {
    playClampSound();
    const updatedPackages = manifest.packages.map((p) => {
      if (p.id !== pkgId) return p;
      return { ...p, condition };
    });

    const updatedManifest: SiteDeliveryManifest = {
      ...manifest,
      packages: updatedPackages,
    };

    setManifest(updatedManifest);
    saveDeliveryManifest(updatedManifest);
    if (onManifestUpdated) onManifestUpdated(updatedManifest);
  };

  const handleDeletePackage = (pkgId: string) => {
    playTactileClick();
    const updatedPackages = manifest.packages.filter((p) => p.id !== pkgId);
    const updatedManifest: SiteDeliveryManifest = {
      ...manifest,
      packages: updatedPackages,
      totalPackagesCount: updatedPackages.length,
      totalWeightKg: updatedPackages.reduce((sum, p) => sum + p.weightEstimatedKg, 0),
    };
    setManifest(updatedManifest);
    saveDeliveryManifest(updatedManifest);
    if (onManifestUpdated) onManifestUpdated(updatedManifest);
    showToast('Colis supprimé du bordereau');
  };

  const handleAddPackage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLabel.trim()) return;
    playClampSound();

    const nextNum = manifest.packages.length + 1;
    const newPkg: DeliveryPackageItem = {
      id: `pkg_${Date.now()}`,
      packageNumber: nextNum,
      category: newCat,
      labelFr: newLabel.trim(),
      contentsDescription: newDesc.trim() || 'Lot conditionné sous emballage',
      itemCount: Math.max(1, newQty),
      weightEstimatedKg: Math.max(1, newWeight),
      dimensionsEstimated: 'Emballage atelier standard',
      isFragileGlass: newCat === 'vitrages_pupitre',
      status: 'pret_atelier',
      condition: 'intact',
    };

    const updatedPackages = [...manifest.packages, newPkg];
    const updatedManifest: SiteDeliveryManifest = {
      ...manifest,
      packages: updatedPackages,
      totalPackagesCount: updatedPackages.length,
      totalWeightKg: updatedPackages.reduce((sum, p) => sum + p.weightEstimatedKg, 0),
    };

    setManifest(updatedManifest);
    saveDeliveryManifest(updatedManifest);
    if (onManifestUpdated) onManifestUpdated(updatedManifest);
    setShowAddPackage(false);
    showToast(`Colis #${nextNum} ajouté au bordereau`);
  };

  const handleUpdateVehicle = (field: keyof SiteDeliveryManifest['vehicle'], value: string) => {
    const updatedManifest: SiteDeliveryManifest = {
      ...manifest,
      vehicle: {
        ...manifest.vehicle,
        [field]: value,
      },
    };
    setManifest(updatedManifest);
    saveDeliveryManifest(updatedManifest);
    if (onManifestUpdated) onManifestUpdated(updatedManifest);
  };

  const handleDownloadPdf = async () => {
    playClampSound();
    setIsGeneratingPdf(true);
    try {
      const vehicleTypeLabels: Record<string, string> = {
        camionnette_plateau: 'Camionnette Plateau 3.5t',
        camion_pupitre_verre: 'Camion Pupitre Miroiterie',
        fourgon_bache: 'Fourgon Tôlé Bâché',
        vehicule_leger: 'Véhicule Léger Atelier',
      };

      await generateSiteDeliveryManifestPdf({
        manifestId: manifest.manifestId,
        jobId: manifest.jobId,
        clientName: manifest.clientName,
        clientPhone: manifest.clientPhone,
        deliverySiteAddress: manifest.deliverySiteAddress,
        wilayaName: manifest.wilayaName,
        vehicleTypeFr: vehicleTypeLabels[manifest.vehicle.vehicleType] || 'Camionnette Plateau',
        vehiclePlate: manifest.vehicle.vehiclePlate,
        driverName: manifest.vehicle.driverName,
        driverPhone: manifest.vehicle.driverPhone,
        departureDate: manifest.vehicle.departureDate,
        departureTime: manifest.vehicle.departureTime,
        totalPackagesCount: manifest.packages.length,
        totalWeightKg: totalWeight,
        packages: manifest.packages.map((p) => ({
          packageNumber: p.packageNumber,
          labelFr: p.labelFr,
          categoryFr: PACKAGE_CATEGORY_CONFIG[p.category]?.labelFr || p.category,
          contentsDescription: p.contentsDescription,
          itemCount: p.itemCount,
          weightEstimatedKg: p.weightEstimatedKg,
          dimensionsEstimated: p.dimensionsEstimated,
          isFragileGlass: p.isFragileGlass,
          conditionFr: p.condition === 'intact' ? 'Intact' : p.condition === 'reserve_mineure' ? 'Réserve' : 'Refusé',
        })),
        generalNotes: manifest.generalNotes,
      });

      showToast('Bordereau de livraison PDF généré avec succès !');
    } catch (err) {
      console.error('Failed to generate PDF', err);
      showToast('Erreur lors de la génération du PDF');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleShareWhatsApp = () => {
    playTactileClick();
    const msg = formatSiteDeliveryWhatsApp(manifest);
    const targetPhone = manifest.clientPhone || manifest.vehicle.driverPhone || '';
    window.open(`https://wa.me/${targetPhone.replace(/\D/g, '')}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div
        className={`w-full max-w-xl max-h-[92vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl border shadow-2xl p-4 sm:p-6 space-y-4 font-mono text-xs ${
          isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-[#0E131F] border-white/10 text-white'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-black/10 dark:border-white/10 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-sky-500/20 border border-sky-500/40 flex items-center justify-center text-sky-400">
              <Truck className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold flex items-center gap-1.5">
                <span>Bordereau de Livraison</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-500/15 text-sky-300 border border-sky-500/30">
                  {manifest.manifestId}
                </span>
              </h2>
              <p className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
                {manifest.clientName} • {manifest.packages.length} colis (~{totalWeight} kg)
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 text-zinc-400 hover:text-white cursor-pointer transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* View Tabs */}
        <div className="grid grid-cols-3 p-1 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10">
          <button
            type="button"
            onClick={() => {
              playTactileClick();
              setActiveTab('packages');
            }}
            className={`py-2 rounded-xl font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
              activeTab === 'packages'
                ? 'bg-[#D4AF37] text-slate-950 shadow-sm'
                : isLight
                ? 'text-slate-600 hover:text-slate-950'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            <span>Colisage ({manifest.packages.length})</span>
          </button>

          <button
            type="button"
            onClick={() => {
              playTactileClick();
              setActiveTab('transport');
            }}
            className={`py-2 rounded-xl font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
              activeTab === 'transport'
                ? 'bg-[#D4AF37] text-slate-950 shadow-sm'
                : isLight
                ? 'text-slate-600 hover:text-slate-950'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Truck className="w-3.5 h-3.5" />
            <span>Transport</span>
          </button>

          <button
            type="button"
            onClick={() => {
              playTactileClick();
              setActiveTab('reception');
            }}
            className={`py-2 rounded-xl font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
              activeTab === 'reception'
                ? 'bg-[#D4AF37] text-slate-950 shadow-sm'
                : isLight
                ? 'text-slate-600 hover:text-slate-950'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Décharge</span>
          </button>
        </div>

        {/* TAB 1: COLISAGE & PACKAGING */}
        {activeTab === 'packages' && (
          <div className="space-y-3">
            {/* Quick Status Counter Banner */}
            <div
              className={`p-3 rounded-2xl border flex items-center justify-between text-xs ${
                allPackagesChecked
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                  : isLight
                  ? 'bg-slate-50 border-slate-200 text-slate-700'
                  : 'bg-black/30 border-white/5 text-zinc-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400" />
                <span>
                  Pointage :{' '}
                  {manifest.packages.filter((p) => p.status === 'charge_camion' || p.status === 'decharge_chantier').length} /{' '}
                  {manifest.packages.length} colis chargés
                </span>
              </div>
              <span className="font-bold text-[#D4AF37]">Poids Total : ~{totalWeight} kg</span>
            </div>

            {/* Packages List */}
            <div className="space-y-2">
              {manifest.packages.map((pkg) => {
                const catCfg = PACKAGE_CATEGORY_CONFIG[pkg.category];
                return (
                  <div
                    key={pkg.id}
                    className={`p-3 rounded-2xl border transition-all ${
                      pkg.status === 'charge_camion'
                        ? 'border-sky-500/40 bg-sky-500/5'
                        : pkg.status === 'decharge_chantier'
                        ? 'border-emerald-500/40 bg-emerald-500/5'
                        : isLight
                        ? 'bg-white border-slate-200'
                        : 'bg-black/20 border-white/5'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2.5 min-w-0">
                        <button
                          type="button"
                          onClick={() => handleTogglePackageStatus(pkg.id)}
                          className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 cursor-pointer transition-all ${
                            pkg.status === 'decharge_chantier'
                              ? 'bg-emerald-500 text-white'
                              : pkg.status === 'charge_camion'
                              ? 'bg-sky-500 text-white'
                              : 'border border-zinc-600 text-zinc-400 hover:border-zinc-400'
                          }`}
                          title="Cliquer pour changer le statut (Atelier -> Camion -> Chantier)"
                        >
                          {pkg.status === 'decharge_chantier' || pkg.status === 'charge_camion' ? (
                            <Check className="w-4 h-4" />
                          ) : (
                            pkg.packageNumber
                          )}
                        </button>

                        <div className="space-y-0.5 min-w-0">
                          <div className="font-bold flex items-center gap-1.5 flex-wrap">
                            <span className="truncate">{pkg.labelFr}</span>
                            <span className={`text-[9px] px-1.5 py-0.2 rounded-full border ${catCfg.colorClass}`}>
                              {catCfg.labelFr}
                            </span>
                            {pkg.isFragileGlass && (
                              <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 font-bold">
                                Fragile
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-zinc-400 line-clamp-2">{pkg.contentsDescription}</p>
                          <div className="text-[10px] text-[#D4AF37] pt-0.5">
                            {pkg.itemCount} pièces • ~{pkg.weightEstimatedKg} kg • {pkg.dimensionsEstimated}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        {/* Condition selector chip */}
                        <button
                          type="button"
                          onClick={() =>
                            handleUpdatePackageCondition(
                              pkg.id,
                              pkg.condition === 'intact'
                                ? 'reserve_mineure'
                                : pkg.condition === 'reserve_mineure'
                                ? 'refuse_endommage'
                                : 'intact'
                            )
                          }
                          className={`px-2 py-1 rounded-lg border text-[9px] font-bold cursor-pointer transition-all ${
                            pkg.condition === 'intact'
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                              : pkg.condition === 'reserve_mineure'
                              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                              : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                          }`}
                          title="Cliquer pour basculer état (Intact / Réserve / Refusé)"
                        >
                          {pkg.condition === 'intact' ? 'Intact' : pkg.condition === 'reserve_mineure' ? 'Réserve' : 'Refusé'}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeletePackage(pkg.id)}
                          className="p-1 rounded-lg hover:bg-rose-500/20 text-zinc-500 hover:text-rose-400 cursor-pointer transition-all"
                          title="Supprimer ce colis"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Add package button */}
            {!showAddPackage ? (
              <button
                type="button"
                onClick={() => {
                  playTactileClick();
                  setShowAddPackage(true);
                }}
                className="w-full py-2.5 rounded-2xl border border-dashed border-black/20 dark:border-white/20 hover:border-[#D4AF37] text-zinc-400 hover:text-[#D4AF37] font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Ajouter un Colis / Carton</span>
              </button>
            ) : (
              <form
                onSubmit={handleAddPackage}
                className={`p-3.5 rounded-2xl border space-y-2.5 ${
                  isLight ? 'bg-slate-50 border-slate-300' : 'bg-black/40 border-white/10'
                }`}
              >
                <div className="font-bold text-xs flex items-center justify-between">
                  <span>Nouveau Colis d Expédition</span>
                  <button
                    type="button"
                    onClick={() => setShowAddPackage(false)}
                    className="p-1 rounded-lg text-zinc-400 hover:text-white"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-zinc-400 block mb-1">Catégorie</label>
                    <select
                      value={newCat}
                      onChange={(e) => setNewCat(e.target.value as PackageCategory)}
                      className={`w-full p-2 rounded-xl border text-[11px] ${
                        isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-black/40 border-white/10 text-white'
                      }`}
                    >
                      {Object.entries(PACKAGE_CATEGORY_CONFIG).map(([id, cfg]) => (
                        <option key={id} value={id}>
                          {cfg.labelFr}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] text-zinc-400 block mb-1">Libellé Colis</label>
                    <input
                      type="text"
                      value={newLabel}
                      onChange={(e) => setNewLabel(e.target.value)}
                      className={`w-full p-2 rounded-xl border text-[11px] ${
                        isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-black/40 border-white/10 text-white'
                      }`}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] text-zinc-400 block mb-1">Description Contenu</label>
                  <input
                    type="text"
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                    className={`w-full p-2 rounded-xl border text-[11px] ${
                      isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-black/40 border-white/10 text-white'
                    }`}
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-zinc-400 block mb-1">Nombre Pièces</label>
                    <input
                      type="number"
                      min="1"
                      value={newQty}
                      onChange={(e) => setNewQty(parseInt(e.target.value) || 1)}
                      className={`w-full p-2 rounded-xl border text-[11px] ${
                        isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-black/40 border-white/10 text-white'
                      }`}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-zinc-400 block mb-1">Poids Estimé (kg)</label>
                    <input
                      type="number"
                      min="1"
                      value={newWeight}
                      onChange={(e) => setNewWeight(parseInt(e.target.value) || 1)}
                      className={`w-full p-2 rounded-xl border text-[11px] ${
                        isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-black/40 border-white/10 text-white'
                      }`}
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowAddPackage(false)}
                    className="px-3 py-1.5 rounded-xl border border-black/10 dark:border-white/10 text-xs"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-xl bg-[#D4AF37] text-slate-950 font-bold text-xs"
                  >
                    Enregistrer Colis
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* TAB 2: TRANSPORT & VEHICLE */}
        {activeTab === 'transport' && (
          <div className="space-y-3 font-mono">
            <div
              className={`p-3.5 rounded-2xl border space-y-3 ${
                isLight ? 'bg-slate-50 border-slate-200' : 'bg-black/30 border-white/5'
              }`}
            >
              <div className="font-bold text-xs flex items-center gap-1.5 text-sky-400">
                <Truck className="w-4 h-4" />
                <span>Véhicule & Transporteur</span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-zinc-400 block mb-1">Type de Véhicule</label>
                  <select
                    value={manifest.vehicle.vehicleType}
                    onChange={(e) => handleUpdateVehicle('vehicleType', e.target.value as any)}
                    className={`w-full p-2 rounded-xl border text-[11px] font-bold ${
                      isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-black/40 border-white/10 text-white'
                    }`}
                  >
                    <option value="camionnette_plateau">Camionnette Plateau 3.5t</option>
                    <option value="camion_pupitre_verre">Camion Pupitre Verre</option>
                    <option value="fourgon_bache">Fourgon Bâché</option>
                    <option value="vehicule_leger">Véhicule Léger</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] text-zinc-400 block mb-1">Immatriculation</label>
                  <input
                    type="text"
                    value={manifest.vehicle.vehiclePlate}
                    onChange={(e) => handleUpdateVehicle('vehiclePlate', e.target.value)}
                    className={`w-full p-2 rounded-xl border text-[11px] font-bold ${
                      isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-black/40 border-white/10 text-white'
                    }`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-zinc-400 block mb-1">Nom Chauffeur Livreur</label>
                  <input
                    type="text"
                    value={manifest.vehicle.driverName}
                    onChange={(e) => handleUpdateVehicle('driverName', e.target.value)}
                    className={`w-full p-2 rounded-xl border text-[11px] ${
                      isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-black/40 border-white/10 text-white'
                    }`}
                  />
                </div>

                <div>
                  <label className="text-[10px] text-zinc-400 block mb-1">Téléphone Livreur</label>
                  <input
                    type="tel"
                    value={manifest.vehicle.driverPhone}
                    onChange={(e) => handleUpdateVehicle('driverPhone', e.target.value)}
                    className={`w-full p-2 rounded-xl border text-[11px] ${
                      isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-black/40 border-white/10 text-white'
                    }`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-zinc-400 block mb-1">Date Départ</label>
                  <input
                    type="date"
                    value={manifest.vehicle.departureDate}
                    onChange={(e) => handleUpdateVehicle('departureDate', e.target.value)}
                    className={`w-full p-2 rounded-xl border text-[11px] ${
                      isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-black/40 border-white/10 text-white'
                    }`}
                  />
                </div>

                <div>
                  <label className="text-[10px] text-zinc-400 block mb-1">Heure de Départ</label>
                  <input
                    type="time"
                    value={manifest.vehicle.departureTime}
                    onChange={(e) => handleUpdateVehicle('departureTime', e.target.value)}
                    className={`w-full p-2 rounded-xl border text-[11px] ${
                      isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-black/40 border-white/10 text-white'
                    }`}
                  />
                </div>
              </div>
            </div>

            {/* Destination Address Card */}
            <div
              className={`p-3.5 rounded-2xl border space-y-2 ${
                isLight ? 'bg-slate-50 border-slate-200' : 'bg-black/30 border-white/5'
              }`}
            >
              <label className="text-[10px] text-zinc-400 block">Adresse de Livraison Chantier</label>
              <input
                type="text"
                value={manifest.deliverySiteAddress}
                onChange={(e) => {
                  const updated = { ...manifest, deliverySiteAddress: e.target.value };
                  setManifest(updated);
                  saveDeliveryManifest(updated);
                }}
                className={`w-full p-2.5 rounded-xl border text-xs font-bold ${
                  isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-black/40 border-white/10 text-white'
                }`}
              />
            </div>
          </div>
        )}

        {/* TAB 3: DECHARGE & RECEPTION */}
        {activeTab === 'reception' && (
          <div className="space-y-3 font-mono">
            {/* Custody Transfer Clause */}
            <div
              className={`p-3.5 rounded-2xl border space-y-2 ${
                isLight ? 'bg-slate-50 border-slate-200' : 'bg-black/30 border-white/5'
              }`}
            >
              <div className="font-bold text-xs flex items-center gap-1.5 text-[#D4AF37]">
                <ShieldCheck className="w-4 h-4" />
                <span>Transfert de Garde & Responsabilité Chantier</span>
              </div>
              <p className="text-[10px] text-zinc-400 leading-relaxed">
                La signature du bordereau par le client ou son représentant sur le chantier atteste de la conformité du nombre de colis reçus et de l intégrité visuelle des profilés et vitrages.
              </p>
            </div>

            {/* Receiver Identification */}
            <div
              className={`p-3.5 rounded-2xl border space-y-2.5 ${
                isLight ? 'bg-slate-50 border-slate-200' : 'bg-black/30 border-white/5'
              }`}
            >
              <div className="font-bold text-xs flex items-center gap-1.5 text-emerald-400">
                <UserCheck className="w-4 h-4" />
                <span>Réceptionnaire Chantier (Soussigné)</span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-zinc-400 block mb-1">Nom Réceptionnaire</label>
                  <input
                    type="text"
                    value={manifest.receiverName || manifest.clientName}
                    onChange={(e) => {
                      const updated = { ...manifest, receiverName: e.target.value };
                      setManifest(updated);
                      saveDeliveryManifest(updated);
                    }}
                    className={`w-full p-2 rounded-xl border text-[11px] ${
                      isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-black/40 border-white/10 text-white'
                    }`}
                  />
                </div>

                <div>
                  <label className="text-[10px] text-zinc-400 block mb-1">N° Carte d Identité (NIN)</label>
                  <input
                    type="text"
                    placeholder="Optionnel"
                    value={manifest.receiverIdCard || ''}
                    onChange={(e) => {
                      const updated = { ...manifest, receiverIdCard: e.target.value };
                      setManifest(updated);
                      saveDeliveryManifest(updated);
                    }}
                    className={`w-full p-2 rounded-xl border text-[11px] ${
                      isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-black/40 border-white/10 text-white'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] text-zinc-400 block mb-1">Observations / Réserves Générales</label>
                <textarea
                  rows={2}
                  value={manifest.generalNotes || ''}
                  onChange={(e) => {
                    const updated = { ...manifest, generalNotes: e.target.value };
                    setManifest(updated);
                    saveDeliveryManifest(updated);
                  }}
                  placeholder="Ex: RAS, déchargé au RDC dans le garage fermé sous abri..."
                  className={`w-full p-2 rounded-xl border text-[11px] ${
                    isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-black/40 border-white/10 text-white'
                  }`}
                />
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-between gap-2 pt-2 border-t border-black/10 dark:border-white/10">
          <button
            type="button"
            onClick={handleDownloadPdf}
            disabled={isGeneratingPdf}
            className="px-3.5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold flex items-center gap-1.5 cursor-pointer text-xs transition-all shadow-md min-h-[44px]"
          >
            <FileDown className="w-4 h-4" />
            <span>{isGeneratingPdf ? 'Génération...' : 'PDF Bordereau'}</span>
          </button>

          <button
            type="button"
            onClick={handleShareWhatsApp}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center gap-1.5 cursor-pointer text-xs transition-all shadow-md min-h-[44px]"
          >
            <MessageCircle className="w-4 h-4" />
            <span>WhatsApp Départ</span>
          </button>
        </div>

        {/* Toast */}
        {toastMessage && (
          <div className="p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 font-bold text-center text-xs animate-in fade-in duration-200">
            {toastMessage}
          </div>
        )}
      </div>
    </div>
  );
};
