import { useAuthStore } from "@/store/authStore";
import clientAxios from "../client";
import { useYardDashboardStore } from "@/store/yardDashboardStore";

export const yardDashboardAction = async (
  user: any,
  yard_listing: string[],
  onToggleSnackBar: Function
) => {
  const { setLoadingTrue, setLoadingFalse } = useAuthStore.getState();
  const { setYardData, setFromAndToDate, from_date, to_date } =
    useYardDashboardStore.getState();
  setLoadingTrue();


  try {
    const res = await clientAxios.post("/yard_monitoring/yard_dashboard/", {
      location: user.location ?? "ALL",
      site: user.site ?? "ALL",
      from_date: from_date||"",
      to_date: to_date||"",
      get_list: yard_listing,
    });

    if (res.data.errorMsg) {
      onToggleSnackBar();
    } else {
      setFromAndToDate(
        res.data?.["yard_in_lolo_volume_revenue_data"]?.from_date,
        res.data?.["yard_in_lolo_volume_revenue_data"]?.to_date
      );
      setYardData(res.data);

    }
  } catch (error) {
    onToggleSnackBar();
  } finally {
    setLoadingFalse();
  }
};

export const yardDashboardLocationSitedata = async (
  setLocationSiteDashboardList: Function,
  setLoadingTrue: Function,
  setLoadingFalse: Function,
  onToggleSnackBar: Function
) => {
  setLoadingTrue();
  try {
    const res = await clientAxios.post("/depot/inform_dropdown/", {
      get_list: ["location_site_dashboard_list"],
      location: "",
      site: "",
    });

    if (res.data.errorMsg) {
      onToggleSnackBar();
    } else {
      setLocationSiteDashboardList(res.data.location_site_dashboard_list);
    }
  } catch (error) {
    onToggleSnackBar();
  } finally {
    setLoadingFalse();
  }
};

// "yard_stock_main_data": {
//         "20_total_data": [
//             {"name": "Survey Pending", "value": 0}, "SP"
//             {"name": "Estimate Pending", "value": 117},"EP"
//             {"name": "Approval Pending", "value": 8},"AP"
//             {"name": "Under Repairing", "value": 26},"UP"
//             {"name": "Available", "value": 0},"AV"
//             {"name": "Alloted", "value": 0},"Alt"
//         ],
//         "40_total_data": [
//             {"name": "Survey Pending", "value": 0},
//             {"name": "Estimate Pending", "value": 113},
//             {"name": "Approval Pending", "value": 1},
//             {"name": "Under Repairing", "value": 10},
//             {"name": "Available", "value": 0},
//             {"name": "Alloted", "value": 0},
//         ],
//     },
