import { useAuthStore } from "@/store/authStore";
import clientAxios from "../client";
import { useRevenueStore } from "@/store/revenueStore";

export const revenueListingAction = async (
  revenue_listing: string[],
  onToggleSnackBar: Function
) => {
  const { user } = useAuthStore.getState();
  const {
    setRevenueData,
    setLoadingRevenue,
    from_date,
    to_date,
    setFromAndToDateRevenue,
  } = useRevenueStore.getState();
  setLoadingRevenue(true);
  try {
    const res = await clientAxios.post("/yard_monitoring/yard_dashboard/", {
      location: user.location ?? "ALL",
      site: user.site ?? "ALL",
      from_date: from_date,
      to_date: to_date,
      get_list: revenue_listing,
    });

    if (res.data.errorMsg) {
      onToggleSnackBar();
    } else {
      
      
      setRevenueData(res.data);
      
      setFromAndToDateRevenue(
        res.data?.["yard_in_lolo_volume_revenue_data"]?.from_date,
        res.data?.["yard_in_lolo_volume_revenue_data"]?.to_date
      );
    }
  } catch (error) {
    onToggleSnackBar();
  } finally {
    setLoadingRevenue(false);
  }
};
