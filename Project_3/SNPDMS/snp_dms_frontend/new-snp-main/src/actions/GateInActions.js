import axiosInstance from "@/AxiosExtend";
import { ADVANCE_FINANCE_CONSTANT } from "../reducers/AdvanceFinance/AdvanceFinanceReducer";
import { SERVEY_REDUCER } from "../reducers/ServeyorReducer";
import { downloadReceipts } from "./LoloReceiptActions";
import {
  LOLO_AMOUNT,
  LOLO_APPLY_CHARGES,
  LOLO_CUSTOMER_NAME,
  LOLO_PAYMENT_TYPE,
  SET_ARRIVED,
  SET_BL_NUMBER,
  SET_CONSIGNOR,
  SET_GROSS_WEIGHT,
  SET_IMPORT_CARGO,
  SET_MANUFACTURING_DATE,
  SET_REMARK,
  SET_SHIPPER,
  SET_TARE_WEIGHT,
} from "./types";
import { downloadFileReusable } from "../utils/Utils";

import { startLoading, stopLoading } from "./UIActions";
import {
  getCurrentDateUTILS,
  handleDateCurrentUTILS,
  handleTimeCurentUTILS,
} from "../utils/WeekNumbre";

export const TOGGLE_SELF_TRANSPORT = "TOGGLE_SELF_TRANSPORT";
// CONTAINER SEARCH
export const CONTAINER_SEARCH = "CONTAINER_SEARCH";
export const GET_CONTAINER_BY_DATE = "GET_CONTAINER_BY_DATE";
export const GET_DROPDOWN_VALUES = "GET_DROPDOWN_VALUES";
export const CLEAR_DROPDOWN_VALUES = "CLEAR_DROPDOWN_VALUES";
export const SELECT_SEAL_NUMBER = "SELECT_SEAL_NUMBER";
// LOlO SEARCH
export const GET_LOLO_PAYMENT_SEARCH_RESULT = "GET_LOLO_PAYMENT_SEARCH_RESULT";
export const SET_SELECTED_LOLO_PAYMENT_SEARCH =
  "SET_SELECTED_LOLO_PAYMENT_SEARCH";

// SELF TRANSPORT SEARCH
export const GET_SELF_TRANSPORT_SEARCH_RESULT =
  "GET_SELF_TRANSPORT_SEARCH_RESULT";
export const SET_SELECTED_SELF_TRANSPORT_SEARCH =
  "SET_SELECTED_SELF_TRANSPORT_SEARCH";

export const containerSearchDispatch =
  (body, setDropdown) => async (dispatch, getState) => {
    const location = await getState().user.location;
    const site = await getState().user.site;
    const bodyData = {
      container_no: body.container_no,
      location: location,
      site: site,
    };
    dispatch(startLoading());
    axiosInstance
      .post("depot/container_search/", bodyData)
      .then((res) => {
        setDropdown(true);
        if (res.data.container_no)
          dispatch({ type: CONTAINER_SEARCH, payload: res.data });
        else {
          dispatch({ type: CONTAINER_SEARCH, payload: res.data.errorMsg });
        }
      })
      .catch((err) => {
        console.error(err);
      })
      .finally(() => {
        dispatch(stopLoading());
      });
  };

export const cacheCleanDataDispatch =
  (setLoader, notify) => async (dispatch, getState) => {
    const location = await getState().user.location;
    const site = await getState().user.site;
    const bodyData = {
      location: location,
      site: site,
    };
    if (location === "" || site === "") {
      notify("Please select location and site first.", { variant: "warning" });
      return;
    }
    setLoader(true);
    axiosInstance
      .post("dms_cache/manage_cache_keys/", bodyData)
      .then((res) => {
        if (res.data.successMsg) {
          setLoader(false);
          notify("Analytics Cache Data cleaned successfully", {
            variant: "success",
          });
          window.location.reload();
        } else {
          setLoader(false);
          notify("Analytics Cache Data not cleaned ,try again ", {
            variant: "error",
          });
        }
      })
      .catch((err) => {
        setLoader(false);
        console.error(err);
      });
  };

export const downloadGateLicenseImage =
  (pk, type, notify) => async (dispatch) => {
    axiosInstance
      .post(
        `depot/download_driver_details/${pk}/`,
        { process: type },
        { responseType: "arraybuffer" },
      )
      .then((res) => {
        downloadFileReusable(
          res.data,
          "driver_licesne.jpg",
          "application/.jpeg",
        );
      })
      .catch((err) => {
        console.log(err);
      });
  };

export const getContainerByDateDispatch =
  (body, setDropdown) => async (dispatch, getState) => {
    const location = await getState().user.location;
    const site = await getState().user.site;
    body["location"] = location;
    body["site"] = site;
    axiosInstance
      .post("depot/update_gate_in/", body)
      .then((res) => {
        dispatch({
          type: "EDIT_DRIVER_LICENSE_IMAGE",
          payload: "",
        });
        dispatch({
          type: "SET_DRIVER_IMAGE",
          payload: "",
        });
        let { gate_in_data, ...data } = res.data;

        dispatch({
          type: GET_CONTAINER_BY_DATE,
          payload: {
            ...data,
            gate_in_data: { image_url: "", ...gate_in_data },
          },
        });
        dispatch({ type: "SET_GIH_PK", payload: res.data.gih_pk });
        setDropdown(false);
        if (res.data.self_transportation_data === "") {
          dispatch({ type: "SET_ENABLE_TRANSPORTATION" });
        } else {
          console.log("Here");
          dispatch({ type: "SET_DISABLE_TRANSPORTATION" });
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };

export const dropDownContainerAction = () => async (dispatch, getState) => {
  const location = await getState().user.location;
  const site = await getState().user.site;
  dispatch(startLoading());
  axiosInstance
    .post("surveyor/import_surveyor_containers/", {
      location: location,
      site: site,
    })
    .then((res) => {
      dispatch({ type: "GATE_IN_CONTAINER_LIST", payload: res.data });
    })
    .catch((err) => {
      console.error(err);
    })
    .finally(() => {
      dispatch(stopLoading());
    });
};

export const ContainerSurveyGetAction =
  (pk, notify) => async (dispatch, getState) => {
    dispatch({ type: "START_LOADING" });
    axiosInstance
      .get(`surveyor/import_surveyor_data_in_gate_in/${pk}/`)
      .then((res) => {
        notify("Container Found", { variant: "success" });
        dispatch({ type: "EDIT_CONTAINER_SURVEY_DATA", payload: res.data });
        dispatch({ type: "SET_GATE_IN_CONTAINER_DETAILS", payload: res.data });
        if (res.data.payment_type === "Advance") {
          dispatch({
            type: ADVANCE_FINANCE_CONSTANT.PRE_GATE_IN_FETCH,
            payload: res.data,
          });
          dispatch({ type: SET_CONSIGNOR, payload: res.data.consignee ?? "" });
          dispatch({ type: SET_SHIPPER, payload: res.data.shipper ?? "" });
          dispatch({ type: SET_BL_NUMBER, payload: res.data.bl_no });
          dispatch({ type: SET_IMPORT_CARGO, payload: res.data.cargo ?? "" });
          dispatch({ type: SET_ARRIVED, payload: res.data.arrived });
          dispatch({ type: SET_REMARK, payload: res.data.remarks ?? "" });
          dispatch({
            type: LOLO_APPLY_CHARGES,
            payload: res.data.apply_charges,
          });
          dispatch({
            type: LOLO_CUSTOMER_NAME,
            payload: res.data.customer_name,
          });
          dispatch({ type: LOLO_PAYMENT_TYPE, payload: res.data.payment_type });
          dispatch({ type: LOLO_AMOUNT, payload: res.data.lolo_amount });
        }
        dispatch({ type: "STOP_LOADING" });
      })
      .catch((err) => {
        dispatch({ type: "STOP_LOADING" });
        console.error(err);
      });
  };

export const ContainerPreGateInGetAction =
  (container_no, notify) => async (dispatch, getState) => {
    const location = await getState().user.location;
    const site = await getState().user.site;
    dispatch({ type: "START_LOADING" });
    axiosInstance
      .post(`depot/pregatein_container_info/`, {
        location,
        site,
        container_no,
      })
      .then((res) => {
        notify("Container Found", { variant: "success" });
        dispatch({ type: "EDIT_CONTAINER_SURVEY_DATA", payload: res.data });
        dispatch({ type: "SET_GATE_IN_CONTAINER_DETAILS", payload: res.data });
        if (res.data.gross_wt === undefined || res.data.gross_wt === "") {
          dispatch({ type: SET_GROSS_WEIGHT, payload: "0" });
        }
        if (res.data.tare_wt === undefined || res.data.tare_wt === "") {
          dispatch({ type: SET_TARE_WEIGHT, payload: "0" });
        }
        dispatch({ type: "SET_IN_DATE", payload: getCurrentDateUTILS() });
        dispatch({ type: "SET_IN_TIME", payload: handleTimeCurentUTILS() });
        if (
          res.data.manufacturing_date === undefined ||
          res.data.manufacturing_date === ""
        ) {
          dispatch({
            type: SET_MANUFACTURING_DATE,
            payload: getCurrentDateUTILS(),
          });
        }
        dispatch({
          type: ADVANCE_FINANCE_CONSTANT.PRE_GATE_IN_FETCH,
          payload: res.data,
        });
        dispatch({
          type: SET_CONSIGNOR,
          payload: res.data.consignee ? res.data.consignee : "",
        });
        dispatch({
          type: SET_SHIPPER,
          payload: res.data.shipper ? res.data.shipper : "",
        });
        dispatch({ type: SET_BL_NUMBER, payload: res.data.bl_no });
        dispatch({
          type: SET_IMPORT_CARGO,
          payload: res.data.cargo ? res.data.cargo : "",
        });
        dispatch({ type: SET_ARRIVED, payload: res.data.arrived });
        dispatch({
          type: SET_REMARK,
          payload: res.data.remarks ? res.data.remarks : "",
        });
        dispatch({ type: LOLO_APPLY_CHARGES, payload: res.data.apply_charges });
        dispatch({ type: LOLO_CUSTOMER_NAME, payload: res.data.customer_name });
        dispatch({ type: LOLO_PAYMENT_TYPE, payload: res.data.payment_type });
        dispatch({ type: LOLO_AMOUNT, payload: res.data.lolo_amount });
        dispatch({ type: "STOP_LOADING" });
      })
      .catch((err) => {
        dispatch({ type: "STOP_LOADING" });
        console.error(err);
      });
  };

export const ContainerPreGateInSurveyGetAction =
  (container_no, notify) => async (dispatch, getState) => {
    const location = await getState().user.location;
    const site = await getState().user.site;
    dispatch({ type: "START_LOADING" });
    axiosInstance
      .post(`depot/pregatein_container_info/`, {
        location,
        site,
        container_no,
      })
      .then((res) => {
        notify("Container Found", { variant: "success" });
        dispatch({ type: SERVEY_REDUCER.INITIAL_SURVEY });
        dispatch({ type: SERVEY_REDUCER.DATA_CHANGE, payload: res.data });
        dispatch({ type: "STOP_LOADING" });
      })
      .catch((err) => {
        dispatch({ type: "STOP_LOADING" });
        console.error(err);
      });
  };

export const ContainerSurveyGetNONDEPOTAction =
  (pk, notify) => async (dispatch, getState) => {
    dispatch({ type: "START_LOADING" });
    axiosInstance
      .get(`surveyor/import_surveyor_data_in_gate_in/${pk}/`)
      .then((res) => {
        notify("Container Found", { variant: "success" });
        dispatch({
          type: "GET_MNR_CONTAINER_BY_DATE",
          payload: res.data,
        });
        dispatch({ type: "STOP_LOADING" });
      })
      .catch((err) => {
        dispatch({ type: "STOP_LOADING" });
        console.error(err);
      });
  };

export const dropDownDispatch =
  (array, alert, dashboard) => async (dispatch, getState) => {
    dispatch({ type: "START_LOADING" });
    await dispatch({ type: "CLEAR_DROPDOWN_VALUES" });
    const location = await getState().user.location;
    const site = await getState().user.site;
    const stateCode = await getState().user.state_code;

    const dataArray = array !== undefined ? array : [];
    axiosInstance
      .post("depot/inform_dropdown/", {
        location: location,
        site: site,
        state_code: stateCode,
        get_list: dashboard ? [...dataArray, "client_ref_codes"] : dataArray,
      })
      .then((res) => {
        dispatch({ type: GET_DROPDOWN_VALUES, payload: res.data });
        dispatch({ type: "STOP_LOADING" });
      })
      .catch((err) => {
        console.error(err);
        if (!err.response)
          alert("Please check your internet connection and reload the page", {
            variant: "info",
          });
        dispatch({ type: "STOP_LOADING" });
      });
  };

export const dropDownLocationandSiteIDDispatch =
  (array, alert) => async (dispatch, getState) => {
    dispatch({ type: "START_LOADING" });

    const location = await getState().user.location;
    const site = await getState().user.site;
    const stateCode = await getState().user.state_code;
    const { allDropDown } = await getState().gateIn;

    const dataArray = array !== undefined ? array : [];
    axiosInstance
      .post("depot/inform_dropdown/", {
        location: location,
        site: site,
        state_code: stateCode,
        get_list: dataArray,
      })
      .then((res) => {
        dispatch({
          type: "GET_DROPDOWN_VALUES_SITE_LOCATION_ID",
          payload: res.data?.location_site_id_and_name,
        });

        let location_id = res.data?.location_site_id_and_name?.find(
          (val) => Object.keys(val)[0] === location,
        );
        localStorage.setItem("location_id", location_id?.[location]?.pk);
        dispatch({
          type: "SET_LOCATION_ID",
          payload: location_id?.[location]?.pk,
        });

        localStorage.setItem(
          "site_id",
          location_id?.[location]?.sites?.find((val) => val.name === site)?.pk,
        );
        dispatch({
          type: "SET_SITE_ID",
          payload: location_id?.[location]?.sites?.find(
            (val) => val.name === site,
          )?.pk,
        });

        dispatch({ type: "STOP_LOADING" });
      })
      .catch((err) => {
        console.error(err);
        if (!err.response)
          alert("Please check your internet connection and reload the page", {
            variant: "info",
          });
        dispatch({ type: "STOP_LOADING" });
      });
  };

export const dropDownPreGateInDispatch =
  (array, alert) => async (dispatch, getState) => {
    const location = await getState().user.location;
    const site = await getState().user.site;
    const stateCode = await getState().user.state_code;

    const dataArray = array !== undefined ? array : [];
    dispatch(startLoading());
    axiosInstance
      .post("depot/inform_dropdown/", {
        location: location,
        site: site,
        state_code: stateCode,
        get_list: dataArray,
      })
      .then((res) => {
        dispatch({
          type: ADVANCE_FINANCE_CONSTANT.PRE_GATE_IN_TABLE_EDIT,
          payload: { preGateInDropdown: res.data },
        });
        dispatch({
          type: ADVANCE_FINANCE_CONSTANT.PRE_GATE_OUT_TABLE,
          payload: { preGateOutDropdown: res.data },
        });
      })
      .catch((err) => {
        console.error(err);
        if (!err.response)
          alert("Please check your internet connection and reload the page", {
            variant: "info",
          });
      })
      .finally(() => {
        dispatch(stopLoading());
      });
  };

export const dropDownPreGateOUTContainerActionDispatch =
  (booking_no, alert) => async (dispatch, getState) => {
    const location = await getState().user.location;
    const site = await getState().user.site;
    dispatch(startLoading())
    axiosInstance
      .post("depot/pregateout_available_container_list/", {
        location: location,
        site: site,
        booking_no: booking_no,
      })
      .then((res) => {
        dispatch({
          type: ADVANCE_FINANCE_CONSTANT.PRE_GATE_OUT_TABLE,
          payload: { preGateOutDropdownContainersList: res.data },
        });
      })
      .catch((err) => {
        console.error(err);
        if (!err.response)
          alert("Please check your internet connection and reload the page", {
            variant: "info",
          });
      }).finally(()=>{
        dispatch(stopLoading())
      })
  };

export const setCustomerNameVal = (value, setValue) => async () => {
  setValue(value);
};

export const saveGateInInfo = (body, alert) => (dispatch) => {
  if (
    body?.lolo_data?.payment_type !== "NEFT" &&
    body?.lolo_data?.payment_type !== "RTGS" &&
    body?.lolo_data?.payment_type !== "Cheque"
  ) {
    body.lolo_data.lolo_payment = "";
  }
  if (
    body?.self_transportation_data?.payment_type !== "NEFT" &&
    body?.self_transportation_data?.payment_type !== "RTGS" &&
    body?.self_transportation_data?.payment_type !== "Cheque"
  ) {
    if (body.self_transportation_data) {
      body.self_transportation_data.self_transportation_payment = "";
    }
  }
  dispatch(startLoading());
  axiosInstance
    .post("depot/gate_in/", body)
    .then((res) => {
      if (res.data.successMsg) {
        alert(res.data.successMsg, {
          variant: "success",
        });
    
        dispatch({ type: "SET_GIH_PK", payload: res.data.gih_pk });
        dispatch({ type: "SET_IS_REQUIRED", payload: false });
        if (
          body.self_transportation_data === "" ||
          body.self_transportation_data === undefined
        ) {
          dispatch({ type: "SET_ENABLE_TRANSPORTATION" });
        } else {
          console.log("Here");
          dispatch({ type: "SET_DISABLE_TRANSPORTATION" });
        }
      } else if (res.data.errorMsg) {
        alert(res.data.errorMsg, {
          variant: "error",
        });
      }
      dispatch(stopLoading());
    })
    .catch((err) => {
      console.error(err.response);
      if (err.response.data.code === "token_not_valid") {
        alert("Session expired please login again", {
          variant: "info",
        });
      }
      dispatch(stopLoading());
    });
};

export const loloPaymentSearch = (body, notify) => (dispatch) => {
  axiosInstance
    .post("depot/lolo_payment_search/", body)
    .then((res) => {
      dispatch({ type: GET_LOLO_PAYMENT_SEARCH_RESULT, payload: res.data });
    })
    .catch((err) => {
      console.error(err.response.data);
    });
};

export const loloPaymentSearchHandlingSeperateAction =
  (body, paymentType, notify) => (dispatch) => {
    axiosInstance
      .post("depot/lolo_payment_search/", body)
      .then((res) => {
        if (paymentType !== res.data.payment_type) {
          if (res.data?.errorMsg) {
            notify(
              "This Payment no. does not exist for Handling. Try again with another Payment no. ",
              {
                variant: "error",
              },
            );
          } else {
            notify(`First please select ${res.data.payment_type} from above.`, {
              variant: "error",
            });
          }
        } else {
          dispatch({ type: GET_LOLO_PAYMENT_SEARCH_RESULT, payload: res.data });
        }
      })
      .catch((err) => {
        console.error(err.response.data);
      });
  };

export const loloPaymentSearchHandlingGateOutSeperateAction =
  (body, paymentType, notify) => (dispatch) => {
    axiosInstance
      .post("depot/lolo_payment_search/", body)
      .then((res) => {
        if (paymentType !== res.data.payment_type) {
          if (res.data?.errorMsg) {
            notify(
              "This Payment no. does not exist for Handling. Try again with another Payment no. ",
              {
                variant: "error",
              },
            );
          } else {
            notify(`First please select ${res.data.payment_type} from above.`, {
              variant: "error",
            });
          }
        } else {
          dispatch({ type: GET_LOLO_PAYMENT_SEARCH_RESULT, payload: res.data });
        }
      })
      .catch((err) => {
        console.error(err.response.data);
      });
  };

export const selfTransportSearch = (body) => (dispatch) => {
  axiosInstance
    .post("depot/self_transportation_payment_search/", body)
    .then((res) => {
      dispatch({ type: GET_SELF_TRANSPORT_SEARCH_RESULT, payload: res.data });
    })
    .catch((err) => {
      console.error(err.response.data);
    });
};

export const selfTransportSearchHandlingAction =
  (body, paymentType, notify) => (dispatch) => {
    axiosInstance
      .post("depot/self_transportation_payment_search/", body)
      .then((res) => {
        if (paymentType !== res.data.payment_type) {
          if (res.data?.errorMsg) {
            notify(
              "This Payment no. does not exist for Self Transportation. Try again with another Payment no. ",
              {
                variant: "error",
              },
            );
          } else {
            notify(`First please select ${res.data.payment_type} from above.`, {
              variant: "error",
            });
          }
        } else {
          dispatch({
            type: GET_SELF_TRANSPORT_SEARCH_RESULT,
            payload: res.data,
          });
        }
      })
      .catch((err) => {
        console.error(err.response.data);
      });
  };
export const updateGateInDetails =
  (body, alert) => async (dispatch, getState) => {
    dispatch(startLoading());
    const location = await getState().user.location;
    const site = await getState().user.site;
    body["location"] = location;
    body["site"] = site;
    if (
      body?.lolo_data?.payment_type !== "NEFT" &&
      body?.lolo_data?.payment_type !== "RTGS" &&
      body?.lolo_data?.payment_type !== "Cheque"
    ) {
      body.lolo_data.lolo_payment = "";
    }
    if (
      body?.self_transportation_data?.payment_type !== "NEFT" &&
      body?.self_transportation_data?.payment_type !== "RTGS" &&
      body?.self_transportation_data?.payment_type !== "Cheque"
    ) {
      if (body.self_transportation_data) {
        body.self_transportation_data.self_transportation_payment = "";
      }
    }
    axiosInstance
      .put("depot/update_gate_in/", body)
      .then((res) => {
        if (res.data.errorMsg) {
          alert(res.data.errorMsg, {
            variant: "error",
          });
        } else {
          if (
            body.self_transportation_data === "" ||
            body.self_transportation_data === undefined
          ) {
            dispatch({ type: "SET_ENABLE_TRANSPORTATION" });
          } else {
            console.log("Here");
            dispatch({ type: "SET_DISABLE_TRANSPORTATION" });
          }
          alert(res.data.successMsg, {
            variant: "success",
          });
        }
        dispatch(stopLoading());
      })
      .catch((err) => {
        if (err.response.data.code === "token_not_valid") {
          alert("Session expired please login again", {
            variant: "info",
          });
        }
        dispatch(stopLoading());
      });
  };

export const printGatePass = (gih_pk, alert) => async (dispatch, getState) => {
  const location = await getState().user.location;
  const site = await getState().user.site;
  return axiosInstance
    .post(
      `depot/gate_in_pass/${gih_pk}/`,
      {
        location: location,
        site: site,
      },
      { responseType: "arraybuffer" },
    )
    .then((res) => {
      if (res.data) {
        downloadReceipts(res.data, "Gate-Pass");
      }
    })
    .catch((err) => {
      if (err.response.data.code === "token_not_valid") {
        alert("Session expired please login again", {
          variant: "info",
        });
      } else {
        alert(err.response, { variant: "error" });
      }
    });
};

// DO CHALAAN
export const gateInDOUpload = (file, gih_pk, alert) => async () => {
  try {
    const res = await axiosInstance.post(
      `depot/in_do_upload/${gih_pk}/`,
      file,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );
    if (res.data.successMsg) {
      alert(res.data.successMsg, {
        variant: "success",
      });
    } else {
      alert(res.data.errorMsg, {
        variant: "error",
      });
    }
  } catch (err) {
    alert(err, {
      variant: "error",
    });
  }
};

export const gateInDODownload = (gih_pk) => async () => {
  try {
    const res = await axiosInstance.get(`depot/in_do_upload/${gih_pk}/`, {
      responseType: "arraybuffer",
    });
    let type = {};
    if (res.headers["content-type"] === "application/.pdf") {
      type = {
        type: "application/pdf",
      };
    } else {
      type = {
        type: "application/zip",
      };
    }
    downloadReceiptsDO(res.data, "DO_Chalaan", type);
  } catch (err) {
    console.log(err);
  }
};

export const containerValidatorDispatch =
  (body, gateInEditContainerNo, alert) => (dispatch) => {
    axiosInstance
      .post("depot/container_no_validation/", body)
      .then((res) => {
        console.log(res.data);
        if (
          res.data.errorMsg &&
          res.data.errorMsg !== "Container_no Not Valid"
        ) {
          alert(res.data.errorMsg, {
            variant: "error",
          });
        }
        if (
          res.data.successMsg ||
          res.data.errorMsg === "Container_no Not Valid"
        ) {
          if (gateInEditContainerNo) {
            dispatch({
              type: "EDIT_CONTAINER_NUMBER",
              payload: body.container_no,
            });
          } else {
            dispatch({
              type: "SET_CONTAINER_NUMBER",
              payload: body.container_no,
            });
          }
        }
      })
      .catch((err) => {
        console.error(err);
        alert(err, {
          variant: "error",
        });
      });
  };

export const downloadReceiptsDO = (byteString, FileName, DownloadType) => {
  let blob = new Blob([byteString], DownloadType);
  let link = document.createElement("a");
  link.href = window.URL.createObjectURL(blob);
  link.download = FileName;
  link.click();
};
