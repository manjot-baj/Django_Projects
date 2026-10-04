import axiosInstance from "@/AxiosExtend";
import { clearCheck } from "@/actions/master/ClientMasterActions";

import { downloadSample } from "../StockUploadActions";
import { startLoading, stopLoading } from "../UIActions";

// eslint-disable-next-line no-unused-vars
let tempJson = {};

export const getTariffListing = (data) => async (dispatch) => {
  tempJson = data;
  dispatch(startLoading())
  try {
    const res = await axiosInstance.post("/mnr/get_all_tariff/", data);
    dispatch({ type: "GET_ALL_TARIFF", payload: res.data });
  } catch (err) {
    console.log(err);
  }finally{
    dispatch(stopLoading())
  }
};

export const addMasterTariff = (clientBodyData, history, alert) => async (dispatch) => {
  dispatch(startLoading())
  try {
    const res = await axiosInstance.post(
      `/mnr/upload_tariff/`,
      clientBodyData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    if (res.data.successMsg) {
      alert("Tariff created successfully", { variant: "success" });
      history.push("/master/tariffDocument");
    } else if (res.data.errorMsg) {
      alert(res.data.errorMsg, { variant: "error" });
    }
  } catch (err) {
    console.log(err);
  }finally{
    dispatch(stopLoading())
  }
};

export const deleteTariff = (deleteIDs, alert) => async (dispatch) => {
  dispatch(startLoading())
  try {
    const res = await axiosInstance.post(
      `/mnr/get_all_tariff/delete/`,
      deleteIDs
    );
    dispatch(clearCheck());
    dispatch(getTariffListing());
    if (res.data.successMsg) {
      alert(res.data.successMsg, { variant: "success" });
    } else if (res.data.errorMsg) {
      alert(res.data.errorMsg, { variant: "warning" });
    }
  } catch (err) {
    console.log(err);
  }finally{
    dispatch(stopLoading())
  }
};

export const downloadTariff = (body, alert) => async (dispatch) => {
  dispatch(startLoading())
  try {
    const res = await axiosInstance.post(
      `/mnr/get_all_tariff/download/`,
      body,
      {
        responseType: "arraybuffer",
      }
    );
    if (res.data) {
      dispatch(clearCheck());
      downloadSample(res.data, "Tariff");
    } else alert(res.data.errorMsg, { variant: "error" });
  } catch (err) {
    console.log(err);
  }finally{
    dispatch(stopLoading())
  }
};

export const getTariffRowData =
  (data, arraySwap, index) => async (dispatch, getState) => {
    dispatch(startLoading())
    const repair_type = await getState().MNRProcess.mnrProcessData?.repair_type;
    try {
      const res = await axiosInstance.post("/mnr/get_row_tariff_data/", {
        ...data,
        repair_type: repair_type,
      });
      let val = {
        index: index,
        data: res.data,
      };
      if (arraySwap === "main_component")
        dispatch({ type: "MNR_COMPONENT", payload: val });
      else if (arraySwap === "component_code")
        dispatch({ type: "MNR_LOCATION", payload: val });
      else if (arraySwap === "location_code")
        dispatch({ type: "MNR_SPECIFIC_LOCATION", payload: val });
      else if (arraySwap === "specific_location_code")
        dispatch({ type: "MNR_DAMAGE", payload: val });
      else if (arraySwap === "damage_code")
        dispatch({ type: "MNR_MATERIAL", payload: val });
      else if (arraySwap === "material_code")
        dispatch({ type: "MNR_REPAIR", payload: val });
      else if (arraySwap === "repair_code")
        dispatch({ type: "MNR_MEASUREMENT", payload: val });
      else if (arraySwap === "measurement")
        dispatch({ type: "MNR_LENGTH_WIDTH", payload: val });
      // else if (arraySwap === "unit")
      //   dispatch({ type: "MNR_LENGTH_WIDTH", payload: val });
    } catch (err) {
      console.log(err);
    }finally{
      dispatch(stopLoading())
    }
  };
