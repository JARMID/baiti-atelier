import React, { useState } from 'react';
import { useConfigStore } from '../../store/configStore';
import { MobileAppHeader } from './MobileAppHeader';
import { MobileBottomNavigation, type MobileNavTab } from './MobileBottomNavigation';
import { MobileConfiguratorScreen } from './MobileConfiguratorScreen';
import { MobileCadScreen } from './MobileCadScreen';
import { MobileCuttingScreen } from './MobileCuttingScreen';
import { MobileFieldMeasurementScreen } from './MobileFieldMeasurementScreen';
import { MobileWorkshopScreen } from './MobileWorkshopScreen';
import { QuoteModal } from '../landing/QuoteModal';
import { OfflineQuotesModal } from '../offline/OfflineQuotesModal';
import { MaterialMarketModal } from '../materials/MaterialMarketModal';
import { SketchUploadModal } from '../ai/SketchUploadModal';

interface DedicatedMobileAppProps {
  onSwitchToDesktopView: () => void;
}

export const DedicatedMobileApp: React.FC<DedicatedMobileAppProps> = ({
  onSwitchToDesktopView,
}) => {
  const { theme, isMaterialMarketOpen, setMaterialMarketOpen } = useConfigStore();
  const isLight = theme === 'light';

  const [activeTab, setActiveTab] = useState<MobileNavTab>('configurator');
  const [isOfflineModalOpen, setIsOfflineModalOpen] = useState(false);
  const [isSketchModalOpen, setIsSketchModalOpen] = useState(false);

  const getTabTitle = (tab: MobileNavTab): string => {
    switch (tab) {
      case 'configurator':
        return 'Châssis 3D & Devis';
      case 'cad':
        return 'Studio CAO 2D';
      case 'cutting':
        return 'Optimiseur Débit Scie';
      case 'field_quotes':
        return 'Carnet de Cotes Chantier';
      case 'workshop':
        return 'Suivi d’Affaires Atelier';
      default:
        return 'Baiti Atelier';
    }
  };

  return (
    <div
      className={`min-h-screen flex flex-col selection:bg-[#D4AF37] selection:text-slate-950 transition-colors duration-200 ${
        isLight ? 'bg-[#F1F5F9] text-slate-900' : 'bg-[#06080E] text-zinc-100'
      }`}
    >
      {/* 1. STICKY TOP APP HEADER */}
      <MobileAppHeader
        onSwitchToDesktopView={onSwitchToDesktopView}
        activeTabTitle={getTabTitle(activeTab)}
        onOpenOfflineQuotes={() => setIsOfflineModalOpen(true)}
        onOpenMaterialMarket={() => setMaterialMarketOpen(true)}
      />

      {/* 2. DYNAMIC SCREEN BODY */}
      <main className="flex-1 w-full overflow-y-auto">
        {activeTab === 'configurator' && <MobileConfiguratorScreen />}
        {activeTab === 'cad' && <MobileCadScreen />}
        {activeTab === 'cutting' && <MobileCuttingScreen onNavigateTab={setActiveTab} />}
        {activeTab === 'field_quotes' && <MobileFieldMeasurementScreen onNavigateTab={setActiveTab} />}
        {activeTab === 'workshop' && <MobileWorkshopScreen />}
      </main>

      {/* 3. NATIVE BOTTOM NAVIGATION BAR */}
      <MobileBottomNavigation
        activeTab={activeTab}
        onSelectTab={setActiveTab}
      />

      {/* MODALS */}
      <QuoteModal />

      <OfflineQuotesModal
        isOpen={isOfflineModalOpen}
        onClose={() => setIsOfflineModalOpen(false)}
      />

      <MaterialMarketModal
        isOpen={isMaterialMarketOpen}
        onClose={() => setMaterialMarketOpen(false)}
      />

      <SketchUploadModal
        isOpen={isSketchModalOpen}
        onClose={() => setIsSketchModalOpen(false)}
      />
    </div>
  );
};

export default DedicatedMobileApp;
