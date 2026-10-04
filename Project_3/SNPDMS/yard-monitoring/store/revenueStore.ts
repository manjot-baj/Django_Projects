import { create } from "zustand";

interface RevenueState {
  revenue_data: any | null;
  loading_revenue: boolean;
  from_date: string;
  to_date: string;
  setRevenueData: (revenue_data: any) => void;
  setLoadingRevenue: (loading_revenue: boolean) => void;
  setFromAndToDateRevenue: (from_date: string, to_date: string) => void;
}

export const useRevenueStore = create<RevenueState>()((set, get) => ({
  revenue_data: null,
  loading_revenue: false,
  from_date: "",
  to_date: "",
  setFromAndToDateRevenue: (from_date, to_date) => set({ from_date, to_date }),
  setRevenueData: (revenue_data: any) => set({ revenue_data }),
  setLoadingRevenue: (loading_revenue: boolean) => set({ loading_revenue }),
  getState: () => get(),
}));
