import { create } from 'zustand';

export interface UserProfile {
  id: string;
  name: string;
  workshopName: string;
  email: string;
  phone: string;
  wilaya: string;
  role: 'artisan' | 'bureau_etude' | 'poseur' | 'client';
  avatarUrl: string;
  nif?: string;
  rc?: string;
  isVerified: boolean;
  twoFactorEnabled?: boolean;
}

export interface PresetAvatar {
  id: string;
  title: string;
  url: string;
}

export const PRESET_AVATARS: PresetAvatar[] = [
  {
    id: 'artisan_kouba',
    title: 'Maître Artisan Aluminium',
    url: 'https://images.unsplash.com/photo-1541888946425-d0fbb186f5f7?w=160&auto=format&fit=crop&q=80',
  },
  {
    id: 'engineer_cad',
    title: 'Ingénieur Bureau d’Études',
    url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=160&auto=format&fit=crop&q=80',
  },
  {
    id: 'wood_craft',
    title: 'Ébéniste d’Art & Agencement',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=160&auto=format&fit=crop&q=80',
  },
  {
    id: 'iron_master',
    title: 'Ferronnier & Métallerie',
    url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=160&auto=format&fit=crop&q=80',
  },
  {
    id: 'designer_pro',
    title: 'Architecte Menuiserie',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=160&auto=format&fit=crop&q=80',
  },
  {
    id: 'technician_pose',
    title: 'Technicien Poseur Chantier',
    url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=160&auto=format&fit=crop&q=80',
  },
];

export const DEMO_PROFILES: UserProfile[] = [
  {
    id: 'demo-artisan-alger',
    name: 'Mourad Hadj-Ali',
    workshopName: 'Atelier Aluminium Kouba',
    email: 'm.hadjali@kouba-alu.dz',
    phone: '0550 12 34 56',
    wilaya: '16 - Alger',
    role: 'artisan',
    avatarUrl: PRESET_AVATARS[0].url,
    nif: '001916012345678',
    rc: '16/00-1234567B19',
    isVerified: true,
    twoFactorEnabled: true,
  },
  {
    id: 'demo-artisan-oran',
    name: 'Karim Belkacem',
    workshopName: 'Oran Façades & Profils RPT',
    email: 'k.belkacem@oran-facades.dz',
    phone: '0560 98 76 54',
    wilaya: '31 - Oran',
    role: 'bureau_etude',
    avatarUrl: PRESET_AVATARS[1].url,
    nif: '002031098765432',
    rc: '31/00-9876543A20',
    isVerified: true,
    twoFactorEnabled: false,
  },
  {
    id: 'demo-artisan-setif',
    name: 'Sofiane Bouzid',
    workshopName: 'Atelier Agencement des Hauts Plateaux',
    email: 'contact@setif-agencement.dz',
    phone: '0541 33 22 11',
    wilaya: '19 - Sétif',
    role: 'artisan',
    avatarUrl: PRESET_AVATARS[2].url,
    nif: '001819055443322',
    rc: '19/00-5544332B18',
    isVerified: true,
    twoFactorEnabled: false,
  },
];

const STORAGE_KEY = 'baiti_artisan_user_profile';

function loadPersistedProfile(): UserProfile {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch {
    // Fallback on default
  }
  return DEMO_PROFILES[0];
}

interface AuthState {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isAuthModalOpen: boolean;
  authModalTab: 'profile' | 'login' | 'signup' | 'switch_demo';

  // Actions
  openAuthModal: (tab?: 'profile' | 'login' | 'signup' | 'switch_demo') => void;
  closeAuthModal: () => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
  selectAvatar: (avatarUrl: string) => void;
  loginWithDemo: (profileId: string) => void;
  login: (email: string, pass: string) => boolean;
  signup: (newProfile: Omit<UserProfile, 'id' | 'isVerified'>) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: loadPersistedProfile(),
  isAuthenticated: true,
  isAuthModalOpen: false,
  authModalTab: 'profile',

  openAuthModal: (tab = 'profile') => set({ isAuthModalOpen: true, authModalTab: tab }),
  closeAuthModal: () => set({ isAuthModalOpen: false }),

  updateProfile: (updates) =>
    set((state) => {
      if (!state.user) return state;
      const updated: UserProfile = { ...state.user, ...updates };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch {
        // Ignored
      }
      return { user: updated };
    }),

  selectAvatar: (avatarUrl) =>
    set((state) => {
      if (!state.user) return state;
      const updated: UserProfile = { ...state.user, avatarUrl };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch {
        // Ignored
      }
      return { user: updated };
    }),

  loginWithDemo: (profileId) =>
    set(() => {
      const match = DEMO_PROFILES.find((p) => p.id === profileId) || DEMO_PROFILES[0];
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(match));
      } catch {
        // Ignored
      }
      return { user: match, isAuthenticated: true, isAuthModalOpen: false };
    }),

  login: (email, _pass) => {
    const existing = DEMO_PROFILES.find((p) => p.email.toLowerCase() === email.toLowerCase());
    const profileToUse: UserProfile = existing || {
      id: `usr-${Date.now()}`,
      name: email.split('@')[0],
      workshopName: `Atelier ${email.split('@')[0]}`,
      email,
      phone: '0550 00 00 00',
      wilaya: '16 - Alger',
      role: 'artisan',
      avatarUrl: PRESET_AVATARS[0].url,
      isVerified: true,
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(profileToUse));
    } catch {
      // Ignored
    }
    set({ user: profileToUse, isAuthenticated: true, isAuthModalOpen: false });
    return true;
  },

  signup: (newProfile) => {
    const created: UserProfile = {
      ...newProfile,
      id: `usr-${Date.now()}`,
      isVerified: true,
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(created));
    } catch {
      // Ignored
    }
    set({ user: created, isAuthenticated: true, isAuthModalOpen: false });
  },

  logout: () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignored
    }
    set({ user: null, isAuthenticated: false, authModalTab: 'login' });
  },
}));
