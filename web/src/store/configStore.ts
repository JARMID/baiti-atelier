import { create } from 'zustand';
import type { CostBreakdown, FinishColor, GlassType, OpeningType, ProfileSystem, ShutterType, WindowConfig } from '../types/window';
import { calculateWindowCost } from '../utils/pricingEngine';
import {
  type WorkshopMarginCalibration,
  DEFAULT_WORKSHOP_CALIBRATION,
  loadWorkshopCalibration,
  saveWorkshopCalibration,
} from '../utils/materialMarketData';

interface ConfigState {
  config: WindowConfig;
  cost: CostBreakdown;
  calibration: WorkshopMarginCalibration;
  language: 'fr' | 'ar' | 'en';
  theme: 'dark' | 'light';
  selectedWilaya: string;
  isQuoteModalOpen: boolean;
  isMaterialMarketOpen: boolean;

  // Actions
  setWidth: (width: number) => void;
  setHeight: (height: number) => void;
  setDimensions: (width: number, height: number) => void;
  setOpeningType: (type: OpeningType) => void;
  setProfileSystem: (system: ProfileSystem) => void;
  setFinishColor: (color: FinishColor) => void;
  setGlassType: (glass: GlassType) => void;
  setShutterType: (shutter: ShutterType) => void;
  setShutterPosition: (pos: number) => void;
  toggleOpen: () => void;
  setOpenPercent: (percent: number) => void;
  toggleExplodedView: () => void;
  setLanguage: (lang: 'fr' | 'ar' | 'en') => void;
  setTheme: (theme: 'dark' | 'light') => void;
  toggleTheme: () => void;
  setSelectedWilaya: (wilaya: string) => void;
  setQuoteModalOpen: (open: boolean) => void;
  setMaterialMarketOpen: (open: boolean) => void;
  setCalibration: (cal: Partial<WorkshopMarginCalibration>) => void;
  resetCalibration: () => void;
  applyPreset: (preset: Partial<WindowConfig>) => void;
}

const initialConfig: WindowConfig = {
  width: 1200,
  height: 1400,
  openingType: 'sliding_2',
  profileSystem: 'gamme_45_thermal',
  finishColor: 'ral_7016',
  glassType: 'double_clear',
  shutterType: 'none',
  isOpen: false,
  openPercent: 0,
  explodedView: false,
  shutterPosition: 0,
};

const initialCalibration = loadWorkshopCalibration();

export const useConfigStore = create<ConfigState>((set) => ({
  config: initialConfig,
  calibration: initialCalibration,
  cost: calculateWindowCost(initialConfig, initialCalibration),
  language: 'fr',
  selectedWilaya: '16 - Alger',
  isQuoteModalOpen: false,
  isMaterialMarketOpen: false,

  setWidth: (width) =>
    set((state) => {
      const nextConfig = { ...state.config, width };
      return { config: nextConfig, cost: calculateWindowCost(nextConfig, state.calibration) };
    }),

  setHeight: (height) =>
    set((state) => {
      const nextConfig = { ...state.config, height };
      return { config: nextConfig, cost: calculateWindowCost(nextConfig, state.calibration) };
    }),

  setDimensions: (width, height) =>
    set((state) => {
      const nextConfig = { ...state.config, width, height };
      return { config: nextConfig, cost: calculateWindowCost(nextConfig, state.calibration) };
    }),

  setOpeningType: (openingType) =>
    set((state) => {
      const nextConfig = { ...state.config, openingType };
      return { config: nextConfig, cost: calculateWindowCost(nextConfig, state.calibration) };
    }),

  setProfileSystem: (profileSystem) =>
    set((state) => {
      const nextConfig = { ...state.config, profileSystem };
      return { config: nextConfig, cost: calculateWindowCost(nextConfig, state.calibration) };
    }),

  setFinishColor: (finishColor) =>
    set((state) => {
      const nextConfig = { ...state.config, finishColor };
      return { config: nextConfig, cost: calculateWindowCost(nextConfig, state.calibration) };
    }),

  setGlassType: (glassType) =>
    set((state) => {
      const nextConfig = { ...state.config, glassType };
      return { config: nextConfig, cost: calculateWindowCost(nextConfig, state.calibration) };
    }),

  setShutterType: (shutterType) =>
    set((state) => {
      const nextConfig = { ...state.config, shutterType };
      return { config: nextConfig, cost: calculateWindowCost(nextConfig, state.calibration) };
    }),

  setShutterPosition: (shutterPosition) =>
    set((state) => ({
      config: {
        ...state.config,
        shutterPosition,
      },
    })),

  toggleOpen: () =>
    set((state) => {
      const nextIsOpen = !state.config.isOpen;
      return {
        config: {
          ...state.config,
          isOpen: nextIsOpen,
          openPercent: nextIsOpen ? 75 : 0,
        },
      };
    }),

  setOpenPercent: (openPercent) =>
    set((state) => ({
      config: {
        ...state.config,
        openPercent,
        isOpen: openPercent > 5,
      },
    })),

  toggleExplodedView: () =>
    set((state) => ({
      config: {
        ...state.config,
        explodedView: !state.config.explodedView,
      },
    })),

  theme: 'dark',

  setLanguage: (language) => {
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('dir', language === 'ar' ? 'rtl' : 'ltr');
      document.documentElement.setAttribute('lang', language);
    }
    set({ language });
  },

  setTheme: (theme) => {
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', theme);
      if (theme === 'light') {
        document.documentElement.classList.add('light');
        document.documentElement.classList.remove('dark');
      } else {
        document.documentElement.classList.add('dark');
        document.documentElement.classList.remove('light');
      }
    }
    set({ theme });
  },

  toggleTheme: () =>
    set((state) => {
      const nextTheme = state.theme === 'dark' ? 'light' : 'dark';
      if (typeof document !== 'undefined') {
        document.documentElement.setAttribute('data-theme', nextTheme);
        if (nextTheme === 'light') {
          document.documentElement.classList.add('light');
          document.documentElement.classList.remove('dark');
        } else {
          document.documentElement.classList.add('dark');
          document.documentElement.classList.remove('light');
        }
      }
      return { theme: nextTheme };
    }),

  setSelectedWilaya: (selectedWilaya) => set({ selectedWilaya }),
  setQuoteModalOpen: (isQuoteModalOpen) => set({ isQuoteModalOpen }),
  setMaterialMarketOpen: (isMaterialMarketOpen) => set({ isMaterialMarketOpen }),

  setCalibration: (updatedPartial) =>
    set((state) => {
      const nextCalibration: WorkshopMarginCalibration = {
        ...state.calibration,
        ...updatedPartial,
        lastCalibratedAt: new Date().toISOString(),
      };
      saveWorkshopCalibration(nextCalibration);
      return {
        calibration: nextCalibration,
        cost: calculateWindowCost(state.config, nextCalibration),
      };
    }),

  resetCalibration: () =>
    set((state) => {
      saveWorkshopCalibration(DEFAULT_WORKSHOP_CALIBRATION);
      return {
        calibration: DEFAULT_WORKSHOP_CALIBRATION,
        cost: calculateWindowCost(state.config, DEFAULT_WORKSHOP_CALIBRATION),
      };
    }),

  applyPreset: (preset) =>
    set((state) => {
      const nextConfig = { ...state.config, ...preset };
      return { config: nextConfig, cost: calculateWindowCost(nextConfig, state.calibration) };
    }),
}));
