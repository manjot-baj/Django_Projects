import axiosInstance from "@/AxiosExtend"
import { startLoading, stopLoading } from "./UIActions";
// CONTAINER SEARCH
export const CONTAINER_SEARCHYARD = "CONTAINER_SEARCHYARD";
export const GET_CONTAINER_BY_DATE = "GET_CONTAINER_BY_DATE";
export const GET_DROPDOWN_VALUES = "GET_DROPDOWN_VALUES";
export const CLEAR_DROPDOWN_VALUES = "CLEAR_DROPDOWN_VALUES";


export const containerSearchDispatch =
  (body, setDropdown) => async (dispatch, getState) => {
    const location = await getState().user.location;
    const site = await getState().user.site;
    const bodyData = {
      container_no: body.container_no,
      location: location,
      site: site,
    };
    axiosInstance
      .post("loaded_yard/loaded_yard_in_container_details/", bodyData)
      .then((res) => {
        setDropdown(true);
        if (res.data.container_no)
          dispatch({ type: CONTAINER_SEARCHYARD, payload: res.data });
        else if (res.data.data) {
          dispatch({ type: CONTAINER_SEARCHYARD, payload: res.data });
        }
        else {
          dispatch({ type: CONTAINER_SEARCHYARD, payload: res.data.errorMsg });
        }
      })
      .catch((err) => {
        console.error(err);
      });
  };

export const containerSearchDispatchOut =
  (body, setDropdown) => async (dispatch, getState) => {
    const location = await getState().user.location;
    const site = await getState().user.site;
    const bodyData = {
      container_no: body.container_no,
      location: location,
      site: site,
    };
    axiosInstance
      .post("loaded_yard/loaded_yard_out_container_details/", bodyData)
      .then((res) => {
        setDropdown(true);
        if (res.data.container_no)
          dispatch({ type: CONTAINER_SEARCHYARD, payload: res.data });
        else if (res.data.data) {
          dispatch({ type: CONTAINER_SEARCHYARD, payload: res.data });
        }
        else {
          dispatch({ type: CONTAINER_SEARCHYARD, payload: res.data.errorMsg });
        }
      })
      .catch((err) => {
        console.error(err);
      });
  };

export const getGateInContainerByDateDispatch =
  (body, setDropdown) => async (dispatch, getState) => {
    const location = await getState().user.location;
    const site = await getState().user.site;
    body["location"] = location;
    body["site"] = site;
    axiosInstance
      .post("loaded_yard/get_loaded_yard/", body)
      .then((res) => {
        console.log(res.data, "gateInData");
        dispatch({
          type: GET_CONTAINER_BY_DATE,
          payload: res.data,
        });
        dispatch({ type: "SET_ID", payload: res.data.pk });
        dispatch({ type: "LOADEDYARD_CONTAINER_NUMBER", payload: res.data.container_no });
        dispatch({ type: "LOADEDYARD_SIZE", payload: res.data.size });
        dispatch({ type: "LOADEDYARD_PORT", payload: res.data.port });
        dispatch({ type: "LOADEDYARD_PROCESSTYPE", payload: res.data.process_type });
        dispatch({ type: "LOADEDYARD_LINER", payload: res.data.liner });
        dispatch({ type: "LOADEDYARD_INWARD_RAKE", payload: res.data.inward_rake });
        dispatch({ type: "LOADEDYARD_OUTWARD_RAKE", payload: res.data.outward_rake });
        dispatch({ type: "LOADEDYARD_IN_DATE", payload: res.data.in_date });
        dispatch({ type: "LOADEDYARD_OUT_DATE", payload: res.data.out_date });
        dispatch({ type: "LOADEDYARD_IIT_DATE", payload: res.data.iit_date });
        dispatch({ type: "LOADEDYARD_IIT_TIME", payload: res.data.iit_time });
        dispatch({ type: "LOADEDYARD_IIT_MOVE_CODE", payload: res.data.iit_move_code });
        dispatch({ type: "LOADEDYARD_DVAN_DATE", payload: res.data.dvan_date });
        dispatch({ type: "LOADEDYARD_DVAN_TIME", payload: res.data.dvan_time });
        dispatch({ type: "LOADEDYARD_DVAN_MOVE_CODE", payload: res.data.dvan_move_code });
        dispatch({ type: "LOADEDYARD_MTIN_DATE", payload: res.data.mtin_date });
        dispatch({ type: "LOADEDYARD_MTIN_TIME", payload: res.data.mtin_time });
        dispatch({ type: "LOADEDYARD_MTIN_MOVE_CODE", payload: res.data.mtin_move_code });
        dispatch({ type: "LOADEDYARD_VAN_DATE", payload: res.data.van_date });
        dispatch({ type: "LOADEDYARD_VAN_TIME", payload: res.data.van_time });
        dispatch({ type: "LOADEDYARD_VAN_MOVE_CODE", payload: res.data.van_move_code });
        dispatch({ type: "LOADEDYARD_MIR_DATE", payload: res.data.mir_date });
        dispatch({ type: "LOADEDYARD_MIR_TIME", payload: res.data.mir_time });
        dispatch({ type: "LOADEDYARD_MIR_MOVE_CODE", payload: res.data.mir_move_code });
        dispatch({ type: "LOADEDYARD_MOT_DATE", payload: res.data.mot_date });
        dispatch({ type: "LOADEDYARD_MOT_TIME", payload: res.data.mot_time });
        dispatch({ type: "LOADEDYARD_MOT_MOVE_CODE", payload: res.data.mot_move_code });
        dispatch({ type: "LOADEDYARD_MIT_DATE", payload: res.data.mit_date });
        dispatch({ type: "LOADEDYARD_MIT_TIME", payload: res.data.mit_time });
        dispatch({ type: "LOADEDYARD_MIT_MOVE_CODE", payload: res.data.mit_move_code });
        dispatch({ type: "LOADEDYARD_MOR_DATE", payload: res.data.mor_date });
        dispatch({ type: "LOADEDYARD_MOR_TIME", payload: res.data.mor_time });
        dispatch({ type: "LOADEDYARD_MOR_MOVE_CODE", payload: res.data.mor_move_code });
        dispatch({ type: "LOADEDYARD_EXPIN_DATE", payload: res.data.expin_date });
        dispatch({ type: "LOADEDYARD_EXPIN_TIME", payload: res.data.expin_time });
        dispatch({ type: "LOADEDYARD_EXPIN_MOVE_CODE", payload: res.data.expin_move_code });
        dispatch({ type: "LOADEDYARD_EOT_DATE", payload: res.data.eot_date });
        dispatch({ type: "LOADEDYARD_EOT_TIME", payload: res.data.eot_time });
        dispatch({ type: "LOADEDYARD_EOT_MOVE_CODE", payload: res.data.eot_move_code });
        dispatch({ type: "LOADEDYARD_BOOKING_NUMBER", payload: res.data.booking_no });
        dispatch({ type: "LOADEDYARD_SEAL_NUMBER", payload: res.data.seal_no });
        dispatch({ type: "LOADEDYARD_REPORT", payload: res.data.report });
        dispatch({ type: "LOADEDYARD_REMARKS", payload: res.data.remarks });
        dispatch({ type: "LOADEDYARD_HISTORY", payload: res.data.history });
        dispatch({ type: "STOCK_YARD_NEXT_PAGE_LINK", payload: res.data.next_page });
        dispatch({ type: "STOCK_YARD_PREV_PAGE_LINK", payload: res.data.prev_page });
        dispatch({ type: "STOCK_YARD_TOTAL_PAGE_LINK", payload: res.data.total_pages });
        dispatch({ type: "LOADEDYARD_MIT_CURRENT_LOCATION", payload: res.data.mit_current_location });
        dispatch({ type: "LOADEDYARD_MOT_CURRENT_LOCATION", payload: res.data.mot_current_location });
        dispatch({ type: "LOADEDYARD_MOT_TO_LOCATION", payload: res.data.mot_to_location });
        dispatch({ type: "LOADEDYARD_MOT_BOOKING_NO", payload: res.data.mot_booking_no });
        dispatch({ type: "LOADEDYARD_MOT_TRANSPORTER", payload: res.data.mot_transporter });
        dispatch({ type: "LOADEDYARD_MOR_CURRENT_LOCATION", payload: res.data.mor_current_location });
        dispatch({ type: "LOADEDYARD_MOR_TO_LOCATION", payload: res.data.mor_to_location });
        dispatch({ type: "LOADEDYARD_MOR_BOOKING_NO", payload: res.data.mor_booking_no });
        dispatch({ type: "LOADEDYARD_MOR_TRANSPORTER", payload: res.data.mor_transporter });
        setDropdown(false);
      })
      .catch((err) => {
        console.log(err);
      });
  };


export const getGateContainerByClientSearch =
  (pk, setDropdown, notify) => async (dispatch, getState) => {
    const location = await getState().user.location;
    const site = await getState().user.site;
    axiosInstance
      .get(`loaded_yard/get_client_specific_data/${pk}/`)
      .then((res) => {
        dispatch({
          type: GET_CONTAINER_BY_DATE,
          payload: res.data,
        });
        dispatch({ type: "SET_ID", payload: res.data.pk });
        dispatch({ type: "LOADEDYARD_CONTAINER_NUMBER", payload: res.data.container_no });
        dispatch({ type: "LOADEDYARD_SIZE", payload: res.data.size });
        dispatch({ type: "LOADEDYARD_PORT", payload: res.data.port });
        dispatch({ type: "LOADEDYARD_PROCESSTYPE", payload: res.data.process_type });
        dispatch({ type: "LOADEDYARD_LINER", payload: res.data.liner });
        dispatch({ type: "LOADEDYARD_INWARD_RAKE", payload: res.data.inward_rake });
        dispatch({ type: "LOADEDYARD_OUTWARD_RAKE", payload: res.data.outward_rake });
        dispatch({ type: "LOADEDYARD_IN_DATE", payload: res.data.in_date });
        dispatch({ type: "LOADEDYARD_OUT_DATE", payload: res.data.out_date });
        dispatch({ type: "LOADEDYARD_IIT_DATE", payload: res.data.iit_date });
        dispatch({ type: "LOADEDYARD_IIT_TIME", payload: res.data.iit_time });
        dispatch({ type: "LOADEDYARD_IIT_MOVE_CODE", payload: res.data.iit_move_code });
        dispatch({ type: "LOADEDYARD_DVAN_DATE", payload: res.data.dvan_date });
        dispatch({ type: "LOADEDYARD_DVAN_TIME", payload: res.data.dvan_time });
        dispatch({ type: "LOADEDYARD_DVAN_MOVE_CODE", payload: res.data.dvan_move_code });
        dispatch({ type: "LOADEDYARD_MTIN_DATE", payload: res.data.mtin_date });
        dispatch({ type: "LOADEDYARD_MTIN_TIME", payload: res.data.mtin_time });
        dispatch({ type: "LOADEDYARD_MTIN_MOVE_CODE", payload: res.data.mtin_move_code });
        dispatch({ type: "LOADEDYARD_VAN_DATE", payload: res.data.van_date });
        dispatch({ type: "LOADEDYARD_VAN_TIME", payload: res.data.van_time });
        dispatch({ type: "LOADEDYARD_VAN_MOVE_CODE", payload: res.data.van_move_code });
        dispatch({ type: "LOADEDYARD_MIR_DATE", payload: res.data.mir_date });
        dispatch({ type: "LOADEDYARD_MIR_TIME", payload: res.data.mir_time });
        dispatch({ type: "LOADEDYARD_MIR_MOVE_CODE", payload: res.data.mir_move_code });
        dispatch({ type: "LOADEDYARD_MOT_DATE", payload: res.data.mot_date });
        dispatch({ type: "LOADEDYARD_MOT_TIME", payload: res.data.mot_time });
        dispatch({ type: "LOADEDYARD_MOT_MOVE_CODE", payload: res.data.mot_move_code });
        dispatch({ type: "LOADEDYARD_MIT_DATE", payload: res.data.mit_date });
        dispatch({ type: "LOADEDYARD_MIT_TIME", payload: res.data.mit_time });
        dispatch({ type: "LOADEDYARD_MIT_MOVE_CODE", payload: res.data.mit_move_code });
        dispatch({ type: "LOADEDYARD_MOR_DATE", payload: res.data.mor_date });
        dispatch({ type: "LOADEDYARD_MOR_TIME", payload: res.data.mor_time });
        dispatch({ type: "LOADEDYARD_MOR_MOVE_CODE", payload: res.data.mor_move_code });
        dispatch({ type: "LOADEDYARD_EXPIN_DATE", payload: res.data.expin_date });
        dispatch({ type: "LOADEDYARD_EXPIN_TIME", payload: res.data.expin_time });
        dispatch({ type: "LOADEDYARD_EXPIN_MOVE_CODE", payload: res.data.expin_move_code });
        dispatch({ type: "LOADEDYARD_EOT_DATE", payload: res.data.eot_date });
        dispatch({ type: "LOADEDYARD_EOT_TIME", payload: res.data.eot_time });
        dispatch({ type: "LOADEDYARD_EOT_MOVE_CODE", payload: res.data.eot_move_code });
        dispatch({ type: "LOADEDYARD_BOOKING_NUMBER", payload: res.data.booking_no });
        dispatch({ type: "LOADEDYARD_SEAL_NUMBER", payload: res.data.seal_no });
        dispatch({ type: "LOADEDYARD_REPORT", payload: res.data.report });
        dispatch({ type: "LOADEDYARD_REMARKS", payload: res.data.remarks });
        dispatch({ type: "LOADEDYARD_HISTORY", payload: res.data.history });
        dispatch({ type: "STOCK_YARD_NEXT_PAGE_LINK", payload: res.data.next_page });
        dispatch({ type: "STOCK_YARD_PREV_PAGE_LINK", payload: res.data.prev_page });
        dispatch({ type: "STOCK_YARD_TOTAL_PAGE_LINK", payload: res.data.total_pages });
        dispatch({ type: "LOADEDYARD_MIT_CURRENT_LOCATION", payload: res.data.mit_current_location });
        dispatch({ type: "LOADEDYARD_MOT_CURRENT_LOCATION", payload: res.data.mot_current_location });
        dispatch({ type: "LOADEDYARD_MOT_TO_LOCATION", payload: res.data.mot_to_location });
        dispatch({ type: "LOADEDYARD_MOT_BOOKING_NO", payload: res.data.mot_booking_no });
        dispatch({ type: "LOADEDYARD_MOT_TRANSPORTER", payload: res.data.mot_transporter });
        dispatch({ type: "LOADEDYARD_MOR_CURRENT_LOCATION", payload: res.data.mor_current_location });
        dispatch({ type: "LOADEDYARD_MOR_TO_LOCATION", payload: res.data.mor_to_location });
        dispatch({ type: "LOADEDYARD_MOR_BOOKING_NO", payload: res.data.mor_booking_no });
        dispatch({ type: "LOADEDYARD_MOR_TRANSPORTER", payload: res.data.mor_transporter });
        dispatch({ type: "LOADEDYARD_MOT_TRUCK_NO", payload: res.data.mot_truck_no });
        dispatch({ type: "LOADEDYARD_MOT_TO_DEPOT_CODE", payload: res.data.mot_to_depot_code });
        dispatch({ type: "LOADEDYARD_MOR_TRUCK_NO", payload: res.data.mor_truck_no });
        dispatch({ type: "LOADEDYARD_MOR_TO_DEPOT_CODE", payload: res.data.mor_to_depot_code });
        dispatch({ type: "LOADEDYARD_EOT_TRANSPORTER", payload: res.data?.eot_transporter });
        dispatch({ type: 'LOADEDYARD_EOT_TO_LOCATION', payload: res.data?.eot_to_location })
        dispatch({ type: 'LOADEDYARD_EOT_TO_DEPOT_CODE', payload: res.data?.eot_to_depot_code })

        setDropdown(false);
      })
      .catch((err) => {
        console.log(err);
      });
  };

export const dropDownDispatch =
  (array, alert) => async (dispatch, getState) => {
    // dispatch({ type: "START_LOADING" });
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
        get_list: dataArray,
      })
      .then((res) => {
        console.log("Inform Dependency", res);
        dispatch({ type: GET_DROPDOWN_VALUES, payload: res.data });
        dispatch({ type: "STOP_LOADING" });
      })
      .catch((err) => {
        console.error(err);
        if (!err.response)
          alert("Please check your internet connection and reload the page", {
            variant: "info",
          });
        // dispatch({ type: "STOP_LOADING" });
      });
  };

export const setCustomerNameVal = (value, setValue) => async () => {
  setValue(value);
};

export const updateLoadedYardDetails =
  (body, alert) => async (dispatch, getState) => {
    const location = await getState().user.location;
    const site = await getState().user.site;
    body["location"] = location;
    body["site"] = site;
    axiosInstance
      .put("loaded_yard/update_loaded_yard/", body)
      .then((res) => {
        if (res.data.successMsg) {
          alert(res.data.successMsg, { variant: "success" });
        } else {
          alert(res.data.errorMsg, {
            variant: "error",
          });
        }
      })
      .catch((res) => {
        alert(res.data.errorMsg, {
          variant: "error",
        });
      });
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


export const searchLoadedYardDispatch = () => async (dispatch, getState) => {
  const location = await getState().user.location;
  const site = await getState().user.site;
  const { pg_no, next_page, prev_page, on_page_data_change, booking_no, port, process_type, size, container_no, history, in_date, out_date } = await getState().loadedYardSearch

  try {
    const res = await axiosInstance.post(
      "/loaded_yard/get_all_loaded_yard/",
      {
        history,
        in_date,
        out_date,
        pg_no,
        port,
        booking_no,
        process_type,
        size,
        container_no,
        next_page,
        prev_page,
        booking_no,
        on_page_data: Number(on_page_data_change),
        site: site,
        location: location
      }
    );
    dispatch({
      type: "LOADEDYARD_PAGE_CHANGE",
      payload: {
        yardListing: res.data.data,
        next_page: res.data.next_page,
        prev_page: res.data.prev_page,
        no_of_data: res.data.no_of_data,
        total_pages: res.data.total_pages,
        on_page_data: res.data.on_page_data
      },
    });

  } catch (err) {
    console.log(err);
  }
};

export const downloadEdi = (data,) => async (dispatch) => {
  try {
    console.log(data);
    const url = "/loaded_yard/get_loaded_yard_edi/"
    const res = await axiosInstance.post(url, data, {
      responseType: "arraybuffer",
    });
    if (res.data.errorMsg) {
      alert(res.data.errorMsg, {
        variant: "error",
      });
      window.location.reload();
    } else {
      downloadEDI(
        res.data,
        "Loaded Yard Stock EDI"
      );
    }
  } catch (err) {
    console.log(err);
  }
};

export const downloadEDI = (arrayBuffer, FileName, FileType) => {
  let blob = new Blob([arrayBuffer], {
    type: FileType,
  });
  let link = document.createElement("a");
  link.href = window.URL.createObjectURL(blob);
  link.download = FileName;
  link.click();
};

