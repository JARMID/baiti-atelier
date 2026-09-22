import { useState } from 'react';
import { SmoothScrollProvider } from './components/layout/SmoothScrollProvider';
import { Header } from './components/landing/Header';
import { HeroScrollytellingStudio } from './components/landing/HeroScrollytellingStudio';
import { WindowCanvas } from './components/3d/WindowCanvas';
import { VillaFacadeStudio3D } from './components/3d/VillaFacadeStudio3D';
import { InteractiveControls } from './components/landing/InteractiveControls';
import { CadStudio2D } from './components/cad/CadStudio2D';
import { ContainerScroll3D } from './components/ui/ContainerScroll3D';
import { CuttingStudio } from './components/optimizer/CuttingStudio';
import { TradeSelector } from './components/trades/TradeSelector';
import { WoodStudio } from './components/trades/WoodStudio';
import { MetalStudio } from './components/trades/MetalStudio';
import { TapestryStudio } from './components/trades/TapestryStudio';
import type { TradeCategory } from './types/trades';
import { FeaturesGrid } from './components/landing/FeaturesGrid';
import { ProductsShowcase } from './components/marketplace/ProductsShowcase';
import { WorkshopsMarketplace } from './components/landing/WorkshopsMarketplace';
import { MethodologySection } from './components/landing/MethodologySection';
import { QuoteModal } from './components/landing/QuoteModal';
import { SketchUploadModal } from './components/ai/SketchUploadModal';
import { OfflineQuotesModal } from './components/offline/OfflineQuotesModal';
import { MaterialMarketModal } from './components/materials/MaterialMarketModal';
import { WorkshopProWorkspace } from './components/workshop/WorkshopProWorkspace';
import { MobileBottomNavigation } from './components/mobile/MobileBottomNavigation';
import { MobilePriceStickyBar } from './components/mobile/MobilePriceStickyBar';
import { isTauriDesktop } from './services/desktopBridge';
import { useConfigStore } from './store/configStore';
import { getTranslation } from './utils/i18n';
import { Footer } from './components/landing/Footer';
import { Camera, AppWindow, Building2, CheckCircle2, Layers, Scissors } from 'lucide-react';
import { playTactileClick, playSwitchSound } from './utils/audioFeedback';
import './App.css';

export function App() {
  const { language, theme, isMaterialMarketOpen, setMaterialMarketOpen, setQuoteModalOpen } = useConfigStore();
  const t = getTranslation(language);
  const isLight = theme === 'light';
  const [isSketchModalOpen, setIsSketchModalOpen] = useState(false);
  const [isOfflineModalOpen, setIsOfflineModalOpen] = useState(false);
  const [selectedTrade, setSelectedTrade] = useState<TradeCategory>('aluminum');
  const [view3DMode, setView3DMode] = useState<'single' | 'facade'>('single');

  // Workshop owners in desktop app start directly in Workshop Pro Workspace
  const [isWorkshopMode, setIsWorkshopMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('baiti_workspace_mode');
      if (saved !== null) {
        return saved === 'true';
      }
    }
    return isTauriDesktop();
  });

  const handleToggleWorkshopMode = () => {
    setIsWorkshopMode((prev) => {
      const next = !prev;
      if (typeof window !== 'undefined') {
        localStorage.setItem('baiti_workspace_mode', String(next));
      }
      return next;
    });
  };

  // If in dedicated workshop mode, render pro workstation
  if (isWorkshopMode) {
    return (
      <div
        className={`min-h-screen flex flex-col selection:bg-[#D4AF37] selection:text-slate-950 transition-colors duration-200 ${
          isLight ? 'bg-[#F1F5F9] text-slate-900' : 'bg-[#06080E] text-zinc-100'
        }`}
      >
        <WorkshopProWorkspace
          onSwitchToVitrine={handleToggleWorkshopMode}
          onOpenSketchModal={() => setIsSketchModalOpen(true)}
          onOpenOfflineQuotes={() => setIsOfflineModalOpen(true)}
          onOpenMaterialMarket={() => setMaterialMarketOpen(true)}
        />

        {/* AI Sketch Upload Modal */}
        <SketchUploadModal
          isOpen={isSketchModalOpen}
          onClose={() => setIsSketchModalOpen(false)}
        />

        {/* Quote Submission Modal */}
        <QuoteModal />

        {/* Offline Quotes Disk Manager Modal */}
        <OfflineQuotesModal
          isOpen={isOfflineModalOpen}
          onClose={() => setIsOfflineModalOpen(false)}
        />

        {/* Algerian Raw Material Spot Bourse & Margin Calibrator Modal */}
        <MaterialMarketModal
          isOpen={isMaterialMarketOpen}
          onClose={() => setMaterialMarketOpen(false)}
        />

        {/* Mobile Bottom Thumb Dock for Phone & Tablet */}
        <MobileBottomNavigation
          isWorkshopMode={isWorkshopMode}
          onToggleWorkshopMode={handleToggleWorkshopMode}
          onOpenOfflineQuotes={() => setIsOfflineModalOpen(true)}
        />
      </div>
    );
  }

  return (
    <SmoothScrollProvider>
      <div
        className={`min-h-screen flex flex-col selection:bg-[#D4AF37] selection:text-slate-950 transition-colors duration-300 ${
          isLight ? 'bg-[#F8FAFC] text-slate-900' : 'bg-[#06080C] text-zinc-100'
        }`}
      >
        {/* Navigation Header */}
        <Header
          onOpenSketchModal={() => setIsSketchModalOpen(true)}
          onOpenOfflineModal={() => setIsOfflineModalOpen(true)}
          onOpenMaterialMarket={() => setMaterialMarketOpen(true)}
          onToggleWorkshopMode={handleToggleWorkshopMode}
          isWorkshopMode={isWorkshopMode}
        />

        {/* Main Content */}
        <main className="flex-1">
          {/* SECTION 1: INTERACTIVE 3D SCROLLYTELLING HERO STUDIO */}
          <section id="hero-studio" className="relative">
            <HeroScrollytellingStudio
              activeTrade={selectedTrade}
              onSelectTrade={(t) => setSelectedTrade(t)}
            />
          </section>

          {/* MULTI-TRADE SELECTION (ALUMINIUM, BOIS, FERRONNERIE, TAPISSERIE) */}
          <div className="pt-4" id="trade-studios">
            <TradeSelector
              selectedTrade={selectedTrade}
              onSelectTrade={(t) => setSelectedTrade(t)}
            />
          </div>

          {/* DYNAMIC STUDIO RENDERING ACCORDING TO SELECTED TRADE */}
          {selectedTrade === 'aluminum' && (
            <>
              {/* SECTION 2: TACTILE 3D CONFIGURATOR & REAL-TIME CPQ */}
              <section id="configurator" className="relative pt-4 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                {/* Ambient Background Glows */}
                <div className="absolute top-10 left-1/4 w-96 h-96 bg-[#D4AF37]/10 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute top-40 right-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

                {/* Configurator Header */}
                <div className="text-center max-w-3xl mx-auto mb-10">
                  <div className={`inline-flex items-center gap-2 px-3.5 py-1 rounded-full border text-xs font-mono mb-4 backdrop-blur-md ${
                    isLight
                      ? 'bg-white border-slate-200 text-slate-700 shadow-xs'
                      : 'bg-white/5 border-white/10 text-zinc-300'
                  }`}>
                    <span className="w-2 h-2 rounded-full bg-[#D4AF37]" />
                    <span>{t.studioBadge}</span>
                  </div>

                  <h2 className={`text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight ${
                    isLight ? 'text-slate-900' : 'text-white'
                  }`}>
                    {t.heroTitlePart1}{' '}
                    <span className="bg-gradient-to-r from-[#C5A880] via-[#D4AF37] to-[#E2C799] bg-clip-text text-transparent">
                      {t.heroTitlePart2}
                    </span>
                  </h2>

                  <p className={`text-sm sm:text-base mt-3 max-w-2xl mx-auto leading-relaxed ${
                    isLight ? 'text-slate-600' : 'text-zinc-400'
                  }`}>
                    {t.heroDescription}
                  </p>

                  {/* Quick AI Trigger Banner */}
                  <div className="mt-6 flex justify-center">
                    <button
                      onClick={() => {
                        playTactileClick();
                        setIsSketchModalOpen(true);
                      }}
                      className={`inline-flex items-center gap-2 px-4 py-2 rounded-2xl border text-xs font-mono transition-all shadow-md group cursor-pointer btn-press hover-lift ${
                        isLight
                          ? 'bg-white hover:bg-slate-50 border-[#C5A880]/40 text-slate-800'
                          : 'bg-white/5 hover:bg-white/10 border-[#C5A880]/30 text-zinc-200'
                      }`}
                    >
                      <Camera className="w-4 h-4 text-[#C5A880]" />
                      <span>{t.sketchPrompt}</span>
                      <span className="text-[#D4AF37] font-bold underline ml-1">{t.sketchScanLink}</span>
                    </button>
                  </div>
                  {/* 3D Mode Selector Pill */}
                  <div className="flex justify-center mt-6">
                    <div
                      className={`inline-flex p-1.5 rounded-2xl border shadow-xl ${
                        isLight
                          ? 'bg-white border-slate-200 shadow-slate-200/50'
                          : 'bg-[#0E121E] border-white/10'
                      }`}
                    >
                      <button
                        onClick={() => {
                          playSwitchSound();
                          setView3DMode('single');
                        }}
                        className={`px-5 py-2 rounded-xl text-xs font-mono font-medium transition-all flex items-center gap-2 cursor-pointer btn-press ${
                          view3DMode === 'single'
                            ? 'bg-gradient-to-r from-[#C5A880] to-[#D4AF37] text-slate-950 shadow-lg shadow-[#D4AF37]/20 font-bold'
                            : isLight
                            ? 'text-slate-600 hover:text-slate-900'
                            : 'text-zinc-400 hover:text-white'
                        }`}
                      >
                        <AppWindow className="w-3.5 h-3.5" />
                        <span>{t.singleWindow}</span>
                      </button>
                      <button
                        onClick={() => {
                          playSwitchSound();
                          setView3DMode('facade');
                        }}
                        className={`px-5 py-2 rounded-xl text-xs font-mono font-medium transition-all flex items-center gap-2 cursor-pointer btn-press ${
                          view3DMode === 'facade'
                            ? 'bg-gradient-to-r from-[#C5A880] to-[#D4AF37] text-slate-950 shadow-lg shadow-[#D4AF37]/20 font-bold'
                            : isLight
                            ? 'text-slate-600 hover:text-slate-900'
                            : 'text-zinc-400 hover:text-white'
                        }`}
                      >
                        <Building2 className="w-3.5 h-3.5" />
                        <span>{t.villaFacade}</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Mode 1: Single Window 3D + Tactile Sliders */}
                {view3DMode === 'single' && (
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    {/* 3D WebGL Canvas Area (7 cols on lg) */}
                    <div className="lg:col-span-7 flex flex-col gap-3">
                      <WindowCanvas />
                      {/* Feature Badges */}
                      <div className="grid grid-cols-3 gap-3 text-center">
                        <div className={`glass-panel py-2 px-3 rounded-xl border flex items-center justify-center gap-2 text-xs font-mono hover-lift ${
                          isLight ? 'bg-white border-slate-200 text-slate-700 shadow-xs' : 'border-white/10 text-zinc-300'
                        }`}>
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                          <span>{t.badgeMillimeter}</span>
                        </div>
                        <div className={`glass-panel py-2 px-3 rounded-xl border flex items-center justify-center gap-2 text-xs font-mono hover-lift ${
                          isLight ? 'bg-white border-slate-200 text-slate-700 shadow-xs' : 'border-white/10 text-zinc-300'
                        }`}>
                          <Layers className="w-3.5 h-3.5 text-[#D4AF37] shrink-0" />
                          <span>{t.explodedViewLabel}</span>
                        </div>
                        <div className={`glass-panel py-2 px-3 rounded-xl border flex items-center justify-center gap-2 text-xs font-mono hover-lift ${
                          isLight ? 'bg-white border-slate-200 text-slate-700 shadow-xs' : 'border-white/10 text-zinc-300'
                        }`}>
                          <Scissors className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                          <span>{t.badgeCutLoss}</span>
                        </div>
                      </div>
                    </div>

                    {/* Tactile Sliders & Price Summary (5 cols on lg) */}
                    <div className="lg:col-span-5">
                      <InteractiveControls />
                    </div>
                  </div>
                )}

                {/* Mode 2: Multi-Châssis Villa Facade 3D Studio */}
                {view3DMode === 'facade' && <VillaFacadeStudio3D />}
              </section>

              {/* SECTION 3: 2D PRO WORKSHOP CAD STUDIO (WRAPPED IN 3D PERSPECTIVE SCROLL) */}
              <section id="cad-studio" className="relative">
                <ContainerScroll3D
                  badgeText={
                    language === 'ar'
                      ? 'استوديو CAO 2D للمحترفين'
                      : language === 'en'
                      ? '2D CAD Studio for Artisan Joiners'
                      : 'Studio CAO 2D pour Artisans Menuisiers'
                  }
                  titleComponent={
                    <div>
                      <h2 className={`text-3xl sm:text-5xl font-extrabold tracking-tight ${
                        isLight ? 'text-slate-900' : 'text-white'
                      }`}>
                        {language === 'ar'
                          ? 'تصميم الهياكل والشاسيهات المركبة'
                          : language === 'en'
                          ? 'Design Complex Joinery Assemblies'
                          : 'Conception de Châssis Complexes'}
                      </h2>
                      <p className={`text-sm sm:text-base mt-2 max-w-2xl mx-auto leading-relaxed ${
                        isLight ? 'text-slate-600' : 'text-zinc-400'
                      }`}>
                        {language === 'ar'
                          ? 'أضف القواطع العمودية والأفقية وخصص كل خانة (متحرك، قلاب، ثابت) مع استخراج فوري لمخطط التقطيع.'
                          : language === 'en'
                          ? 'Add transoms and mullions, customize each opening (casement, tilt-and-turn, fixed) with instant saw cutting sheet generation.'
                          : 'Ajoutez des meneaux verticaux, traverses horizontales et affectez chaque cellule (ouvrant, oscillo-battant, fixe) avec génération instantanée du plan de débitage.'}
                      </p>
                    </div>
                  }
                >
                  <CadStudio2D />
                </ContainerScroll3D>
              </section>
            </>
          )}

          {selectedTrade === 'woodworking' && (
            <section id="wood-studio" className="relative pt-4 pb-20">
              <WoodStudio />
            </section>
          )}

          {selectedTrade === 'metalwork' && (
            <section id="metal-studio" className="relative pt-4 pb-20">
              <MetalStudio />
            </section>
          )}

          {selectedTrade === 'tapestry' && (
            <section id="tapestry-studio" className="relative pt-4 pb-20">
              <TapestryStudio />
            </section>
          )}

          {/* SECTION 4: INDUSTRIAL 1D & 2D CUTTING STOCK OPTIMIZER */}
          <CuttingStudio />

          {/* SECTION 5: FEATURES & METHODOLOGY */}
          <FeaturesGrid />

          {/* SECTION 6: ARTISAN PRODUCTS SHOWCASE & ONLINE DEPOSITS */}
          <ProductsShowcase />

          {/* SECTION 7: WORKSHOPS DIRECTORY */}
          <WorkshopsMarketplace />

          {/* SECTION 8: PRICING FORMULA */}
          <MethodologySection />
        </main>

        {/* AI Sketch Upload Modal */}
        <SketchUploadModal
          isOpen={isSketchModalOpen}
          onClose={() => setIsSketchModalOpen(false)}
        />

        {/* Quote Submission Modal */}
        <QuoteModal />

        {/* Offline Quotes Disk Manager Modal */}
        <OfflineQuotesModal
          isOpen={isOfflineModalOpen}
          onClose={() => setIsOfflineModalOpen(false)}
        />

        {/* Algerian Raw Material Spot Bourse & Margin Calibrator Modal */}
        <MaterialMarketModal
          isOpen={isMaterialMarketOpen}
          onClose={() => setMaterialMarketOpen(false)}
        />

        {/* Footer */}
        <Footer />

        {/* Mobile Sticky Price & Fast Quote Bar (Phone only) */}
        <MobilePriceStickyBar
          onOpenQuoteModal={() => setQuoteModalOpen(true)}
        />

        {/* Mobile Bottom Thumb Dock for Phone & Tablet */}
        <MobileBottomNavigation
          isWorkshopMode={isWorkshopMode}
          onToggleWorkshopMode={handleToggleWorkshopMode}
          onOpenOfflineQuotes={() => setIsOfflineModalOpen(true)}
        />
      </div>
    </SmoothScrollProvider>
  );
}

export default App;
