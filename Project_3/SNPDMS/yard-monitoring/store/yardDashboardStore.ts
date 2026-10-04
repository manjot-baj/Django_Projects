import { create } from "zustand";

interface YardDashboardState {
  yard_data: any | null;
  location_site_dashboard_list: any | null;
  from_date: string;
  to_date: string;
  setLocationSiteDashboardList: (locationdata: any) => void;
  setYardData: (yard_data: any) => void;
  setFromAndToDate: (from_date: string, to_date: string) => void;
}

export const useYardDashboardStore = create<YardDashboardState>()(
  (set, get) => ({
    yard_data: null,
    location_site_dashboard_list: null,
    from_date: "",
    to_date: "",
    setFromAndToDate: (from_date, to_date) => set({ from_date, to_date }),
    setYardData: (yard_data: any) => set({ yard_data }),
    setLocationSiteDashboardList: (locationdata: any) =>
      set({ location_site_dashboard_list: locationdata }),
    getState: () => get(),
  })
);
