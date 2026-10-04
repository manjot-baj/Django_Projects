import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

const ACCESS_KEY = "ACCESS_TOKEN";
const REFRESH_KEY = "REFRESH_TOKEN";

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: any;
  loading: boolean;
  networkError: boolean;
  setTokens: (accessToken: string, refreshToken: string) => void;
  logout: () => void;
  setUser: (user: any) => void;
  setLoadingTrue: () => void;
  setLoadingFalse: () => void;
  setLocationAndSite: (location: string, site: string) => void;
  changeLocationAndSite: () => void;
  setNetWorkError: (network_error: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      accessToken: null,
      refreshToken: null,
      user: null,
      loading: false,
      networkError: false,
      setNetWorkError: (network_error) => set({ networkError: network_error }),
      changeLocationAndSite: () =>
        set((prev) => ({
          ...prev,
          user: { ...prev.user, location: null, site: null },
        })),
      setLocationAndSite: (location: string, site: string) =>
        set((prev) => ({ user: { ...prev.user, location, site } })),
      setLoadingTrue: () => set({ loading: true }),
      setLoadingFalse: () => set({ loading: false }),
      setTokens: async (accessToken: string, refreshToken: string) => {
        set({ accessToken, refreshToken });
        if (accessToken) await AsyncStorage.setItem(ACCESS_KEY, accessToken);
        else await AsyncStorage.removeItem(ACCESS_KEY);

        if (refreshToken) await AsyncStorage.setItem(REFRESH_KEY, refreshToken);
        else await AsyncStorage.removeItem(REFRESH_KEY);
      },

      setUser: (user: any) => set({ user }),

      logout: async () => {
        set({ accessToken: null, refreshToken: null, user: null });
        await AsyncStorage.multiRemove([ACCESS_KEY, REFRESH_KEY]);
      },
      getState: () => get(),
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        user: state.user,
        // "user" is not included → it won't be persisted
      }),
    }
  )
);

export const ACCESS_TOKEN_KEY = ACCESS_KEY;
export const REFRESH_TOKEN_KEY = REFRESH_KEY;
