import axiosInstance from "@/AxiosExtend";
import { clearCheck } from "@/actions/master/ClientMasterActions";
import { startLoading, stopLoading } from "../UIActions";

export const getCountryListings = (alert) => async (dispatch) => {
  dispatch(startLoading());
  try {
    const res = await axiosInstance.get("master/country/all/");
    dispatch({ type: "GET_ALL_COUNTRIES", payload: res.data });
  } catch (err) {
    alert(err.response.data.errorMsg, { variant: "error" });
  } finally {
    dispatch(stopLoading());
  }
};

export const getSingleCountry = (pkId, alert) => async (dispatch) => {
  dispatch(startLoading());
  try {
    const res = await axiosInstance.get(`master/country/${pkId}/`);
    if (!res.data.errorMsg)
      dispatch({ type: "GET_SINGLE_COUNTRY_DETAIL", payload: res.data });
    else if (res.data.errorMsg) {
      alert(res.data.errorMsg, { variant: "error" });
    }
  } catch (err) {
    alert(err.response.data.errorMsg, { variant: "error" });
  } finally {
    dispatch(stopLoading());
  }
};

export const addMasterCountry =
  (countryBodyData, history, alert) => async (dispatch) => {
    dispatch(startLoading());
    try {
      const res = await axiosInstance.post(
        `master/country/add/`,
        countryBodyData,
      );
      if (res.data.successMsg) {
        alert("Country created successfully", {
          variant: "success",
        });
        history.push("/master/country");
      } else if (res.data.errorMsg) {
        alert(res.data.errorMsg, { variant: "error" });
      }
    } catch (err) {
      alert(err.response.data.errorMsg?.[0], { variant: "error" });
    } finally {
      dispatch(stopLoading());
    }
  };

export const updateMasterCountry =
  (pkId, countryBodyData, history, alert) => async () => {
    dispatch(startLoading());
    try {
      const res = await axiosInstance.put(
        `master/country/${pkId}/update/`,
        countryBodyData,
      );
      if (res.data.successMsg) {
        alert("Country updated successfully", {
          variant: "success",
        });
        history.push("/master/country");
      } else if (res.data.errorMsg) {
        alert(res.data.errorMsg, { variant: "error" });
      }
    } catch (err) {
      alert(err.response.data.errorMsg, { variant: "error" });
    } finally {
      dispatch(stopLoading());
    }
  };

export const deleteCountryListings = (deleteIDs, alert) => async (dispatch) => {
  try {
    const res = await axiosInstance.post(`master/country/delete/`, deleteIDs);
    dispatch(clearCheck());
    dispatch(getCountryListings());
    if (res.data.successMsg) {
      alert(res.data.successMsg, { variant: "success" });
    } else if (res.data.errorMsg) {
      alert(res.data.errorMsg, { variant: "warning" });
    }
  } catch (err) {
    alert(err.response.data.errorMsg, { variant: "error" });
  }
};
