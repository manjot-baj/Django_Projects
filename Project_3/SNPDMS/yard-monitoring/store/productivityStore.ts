import { create } from "zustand";

interface ProductivityState {
  productivity_data: any | null;
  loading_productivity: boolean;
  from_date: string;
  to_date: string;
  setProductivityData: (productivity_data: any) => void;
  setFromAndToDateProductivity: (from_date: string, to_date: string) => void;
}

export const useProductivityStore = create<ProductivityState>()((set, get) => ({
  productivity_data: null,
  loading_productivity: false,
  from_date: "",
  to_date: "",
  setFromAndToDateProductivity: (from_date, to_date) =>
    set({ from_date, to_date }),
  setProductivityData: (productivity_data: any) => set({ productivity_data }),
  setLoadingProductivity: (loading_productivity: boolean) =>
    set({ loading_productivity }),
  getState: () => get(),
}));
