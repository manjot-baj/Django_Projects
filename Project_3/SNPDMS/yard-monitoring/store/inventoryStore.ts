import { create } from "zustand";

interface InventoryState {
  inventory_data: any | null;
  loading_inventory: boolean;
  inventory_main_data: any | null;
  from_date: string;
  to_date: string;
  setInventoryData: (inventory_data: any) => void;
  setLoadingInventory: (loading_inventory: boolean) => void;
  seetInventoryMainData: (inventory_main_data: any) => void;
  setFromAndToDateInventory: (from_date: string, to_date: string) => void;
}

export const useInventoryStore = create<InventoryState>()((set, get) => ({
  inventory_data: null,
  loading_inventory: false,
  inventory_main_data: null,
  from_date: "",
  to_date: "",
  setFromAndToDateInventory: (from_date, to_date) =>
    set({ from_date, to_date }),
  setInventoryData: (inventory_data: any) => set({ inventory_data }),
  seetInventoryMainData: (inventory_main_data: any) =>
    set({ inventory_main_data }),
  setLoadingInventory: (loading_inventory: boolean) =>
    set({ loading_inventory }),
  getState: () => get(),
}));
