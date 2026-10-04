import { useAuthStore } from "@/store/authStore";
import clientAxios from "../client";
import { useInventoryStore } from "@/store/inventoryStore";

export const inventoryListingAction = async (
  inventory_listing: string[],
  onToggleSnackBar: Function
) => {
  const { user } = useAuthStore.getState();
  const {
    setLoadingInventory,
    setInventoryData,
    seetInventoryMainData,
    from_date,
    to_date,
  } = useInventoryStore.getState();

  setLoadingInventory(true);
  try {
    const res = await clientAxios.post("/yard_monitoring/yard_dashboard/", {
      location: user.location ?? "ALL",
      site: user.site ?? "ALL",
      from_date: from_date,
      to_date: to_date,
      get_list: inventory_listing,
    });

    if (res.data.errorMsg) {
      onToggleSnackBar();
    } else {
      setInventoryData(res.data?.yard_stock_main_data);
      seetInventoryMainData(res.data?.yard_mnr_stage_main_data);
    }
  } catch (error) {
    onToggleSnackBar();
  } finally {
    setLoadingInventory(false);
  }
};
