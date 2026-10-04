import axiosInstance from "@/AxiosExtend";
import { clearCheck } from "@/actions/master/ClientMasterActions";
import { startLoading, stopLoading } from "../UIActions";

let tempJson = {};

export const getSealManagementListings = (data, alert) => async (dispatch) => {
  dispatch(startLoading());
  dispatch({
    type: "RESET_STOCK_ALLOTMENT_SEARCH_RESULT",
  });
  try {
    const res = await axiosInstance.post(`master/seal_no/all/`, data);

    dispatch({ type: "GET_ALL_SEALMANAGEMENT", payload: res.data.data });
    dispatch({
      type: "STOCK_ALLOTMENT_NEXT_PAGE_LINK",
      payload: res.data.next_page,
    });
    dispatch({
      type: "STOCK_ALLOTMENT_PREV_PAGE_LINK",
      payload: res.data.prev_page,
    });
    dispatch({
      type: "STOCK_ALLOTMENT_TOTAL_PAGE_LINK",
      payload: res.data.total_pages,
    });
  } catch (err) {
    alert(err.response.data.errorMsg, { variant: "error" });
  } finally {
    dispatch(stopLoading());
  }
};

export const getSingleSealManagement = (pkId, alert) => async (dispatch) => {
  dispatch(startLoading());
  try {
    const res = await axiosInstance.get(`master/seal_no/${pkId}/`);
    if (!res.data.errorMsg)
      dispatch({ type: "GET_SINGLE_SEALMANAGEMENT_DETAIL", payload: res.data });
    else if (res.data.errorMsg) {
      alert(res.data.errorMsg, { variant: "error" });
    }
  } catch (err) {
    alert(err.response.data.errorMsg, { variant: "error" });
  } finally {
    dispatch(stopLoading());
  }
};

export const addSealManagementMaster =
  (SealManagementBodyData, history, alert) => async (dispatch) => {
    dispatch(startLoading());
    try {
      const res = await axiosInstance.post(
        `master/seal_no/add/`,
        SealManagementBodyData,
      );

      if (res.data.successMsg) {
        alert("Seal created successfully", {
          variant: "success",
        });
        history.push("/master/sealManagement");
      } else if (res.data.errorMsg) {
        alert(res.data.errorMsg, { variant: "error" });
      }
    } catch (err) {
      alert(err.response.data.errorMsg, { variant: "error" });
    } finally {
      dispatch(stopLoading());
    }
  };

export const updateSealManagementMaster =
  (pkId, SealManagementBodyData, history, alert) =>
  async (dispatch, getState) => {
    dispatch(startLoading());
    const location = await getState().user.location;
    const site = await getState().user.site;
    const pg_no = await getState().stocksAndAllotmentSearch.pg_no;
    const on_page_data = await getState().stocksAndAllotmentSearch.on_page_data;
    const { line, number, container_no, in_date, out_date, in_use_date } =
      await getState().sealManagementSearch;
    try {
      const res = await axiosInstance.put(
        `master/seal_no/${pkId}/update/`,
        SealManagementBodyData,
      );
      if (res.data.successMsg) {
        alert("Seal updated successfully", {
          variant: "success",
        });
        let sealData = {
          location: location,
          site: site,
          pg_no: pg_no,
          on_page_data: on_page_data,
          line: line,
          number: number,
          container_no: container_no,
          is_available: true,
          is_damaged: false,
          is_cut: false,
          is_first_allotment: true,
          is_history: false,
          in_date: { from: in_date.from, to: in_date.to },
          out_date: { from: out_date.from, to: out_date.to },
          in_use_date: { from: in_use_date.from, to: in_use_date.to },
        };
        dispatch(getSealManagementListings(sealData));
        history.push("/master/sealManagement");
      } else if (res.data.errorMsg) {
        alert(res.data.errorMsg, {
          variant: "error",
        });
      }
    } catch (err) {
      alert(err.response.data.errorMsg, { variant: "error" });
    } finally {
      dispatch(stopLoading());
    }
  };

export const deleteSealManagementListings =
  (deleteIDs, alert) => async (dispatch, getState) => {
    const location = await getState().user.location;
    const site = await getState().user.site;
    const pg_no = await getState().stocksAndAllotmentSearch.pg_no;
    const on_page_data = await getState().stocksAndAllotmentSearch.on_page_data;
    const { line, number, container_no, in_date, out_date, in_use_date } =
      await getState().sealManagementSearch;
    try {
      const res = await axiosInstance.post(`master/seal_no/delete/`, deleteIDs);
      dispatch(clearCheck());
      let sealData = {
        location: location,
        site: site,
        pg_no: pg_no,
        on_page_data: on_page_data,
        line: line,
        number: number,
        container_no: container_no,
        is_available: true,
        is_damaged: false,
        is_cut: false,
        is_first_allotment: true,
        is_history: false,
        in_date: { from: in_date.from, to: in_date.to },
        out_date: { from: out_date.from, to: out_date.to },
        in_use_date: { from: in_use_date.from, to: in_use_date.to },
      };
      dispatch(getSealManagementListings(sealData));
      if (res.data.successMsg) {
        alert(res.data.successMsg, { variant: "success" });
      } else if (res.data.errorMsg) {
        alert(res.data.errorMsg, { variant: "warning" });
      }
    } catch (err) {
      alert(err.response.data.errorMsg, { variant: "error" });
    }
  };
