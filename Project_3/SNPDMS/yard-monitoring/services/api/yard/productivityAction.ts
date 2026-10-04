import { useAuthStore } from "@/store/authStore";
import clientAxios from "../client";
import { useProductivityStore } from "@/store/productivityStore";

export const productivityAction = async (
  user: any,
  productivity_listing: string[],
  onToggleSnackBar: Function
) => {
  const { setLoadingTrue, setLoadingFalse } = useAuthStore.getState();
  const { setProductivityData, from_date, to_date } =
    useProductivityStore.getState();
  setLoadingTrue();
  try {
    const res = await clientAxios.post("/yard_monitoring/yard_dashboard/", {
      location: user.location ?? "ALL",
      site: user.site ?? "ALL",
      from_date: from_date,
      to_date: to_date,
      get_list: productivity_listing,
    });

    if (res.data.errorMsg) {
      onToggleSnackBar();
    } else {
      setProductivityData(res.data?.yard_mnr_productivity);
    }
  } catch (error) {
    onToggleSnackBar();
  } finally {
    setLoadingFalse();
  }
};
