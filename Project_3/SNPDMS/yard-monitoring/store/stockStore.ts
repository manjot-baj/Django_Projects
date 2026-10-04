import { create } from "zustand";

interface YardStockState {
  stock_data: any | null;
  location_site_dashboard_list: any | null;
  setLocationSiteDashboardList: (locationdata: any) => void;
  setStockData: (stock_data: any) => void;
}

export const useStockStore = create<YardStockState>()((set, get) => ({
  stock_data: null,
  location_site_dashboard_list: null,
  setStockData: (stock_data: any) => set({ stock_data }),
  setLocationSiteDashboardList: (locationdata: any) =>
    set({ location_site_dashboard_list: locationdata }),
  getState: () => get(),
}));
