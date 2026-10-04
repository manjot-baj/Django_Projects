import axiosInstance from "@/AxiosExtend";
import { MNR_CONTAINER_SEARCH } from "./types";
import { startLoading, stopLoading } from "./UIActions";
let tempJson = {};

export const getMNRGrid = () => async (dispatch, getState) => {
  const location = await getState().user.location;
  const site = await getState().user.site;
  const data = await getState().MNRGridSearch;
  dispatch(startLoading());
  try {
    const res = await axiosInstance.post("mnr/grid/", {
      ...data,
      location,
      site,
    });

    dispatch({ type: "MNR_SEARCH_RESULT", payload: res.data.data });
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
    console.log(err);
  } finally {
    dispatch(stopLoading());
  }
};

export const addNonDepotContainer = (data, alert,setDisableHandleNonDepot) => async (dispatch) => {
  dispatch(startLoading());
  try {
    const res = await axiosInstance.post("non_depot/in_out_process/", data);

    if (res.data.errorMsg) {
      alert(res.data.errorMsg, { variant: "error" });
    } else {
      if (setDisableHandleNonDepot) {
        setDisableHandleNonDepot(true)
      }
      alert("Added Non-Depot Container", { variant: "success" });
      dispatch(getMNRGrid(tempJson));
    }
  } catch (err) {
    console.log(err);
  } finally {
    dispatch(stopLoading());
  }
};

export const addNonDepotContainerUpdate = (data, alert) => async (dispatch) => {
  dispatch(startLoading())
  try {
    const res = await axiosInstance.put("non_depot/update_in_out/", data);

    if (res.data.errorMsg) {
      alert(res.data.errorMsg, { variant: "error" });
    } else {
      alert("Updated Non-Depot Container", { variant: "success" });
      dispatch(getMNRGrid(tempJson));
    }
  } catch (err) {
    console.log(err);
  }finally{
    dispatch(stopLoading())
  }
};

export const nonDepotContainerValidatorDispatch =
  (body, alert) => (dispatch) => {
    dispatch(startLoading())
    axiosInstance
      .post("non_depot/container_no_validation/", body)
      .then((res) => {
        if (res.data.errorMsg) {
          alert(res.data.errorMsg, {
            variant: "error",
          });
        }
      })
      .catch((err) => {
        console.error(err);
        alert(err, {
          variant: "error",
        });
      }).finally(()=>{
        dispatch(stopLoading())
      })
  };

export const nonDepotContainerSearchDispatch =
  (body, setDropdown) => async (dispatch, getState) => {
    const location = await getState().user.location;
    const site = await getState().user.site;
    const bodyData = {
      container_no: body.container_no,
      location: location,
      site: site,
    };
    dispatch(startLoading())
    axiosInstance
      .post("non_depot/container_search/", bodyData)
      .then((res) => {
        setDropdown(true);
        if (res.data.container_no)
          dispatch({ type: MNR_CONTAINER_SEARCH, payload: res.data });
        else {
          dispatch({ type: MNR_CONTAINER_SEARCH, payload: res.data.errorMsg });
        }
      })
      .catch((err) => {
        console.error(err);
      }).finally(()=>{
        dispatch(stopLoading())
      })
  };

export const getNonDepotContainerByDateDispatch =
  (body, setDropdown) => async (dispatch, getState) => {
    const location = await getState().user.location;
    const site = await getState().user.site;
    body["location"] = location;
    body["site"] = site;
    dispatch(startLoading())
    axiosInstance
      .post("non_depot/update_in_out/", body)
      .then((res) => {
        console.log("Res.data", res.data);
        dispatch({
          type: "GET_MNR_CONTAINER_BY_DATE",
          payload: res.data,
        });
        setDropdown(false);
      })
      .catch((err) => {
        console.log(err);
      }).finally(()=>{
        dispatch(stopLoading())
      })
  };

export const makeContainersAvailable = (data, alert) => async (dispatch) => {
  dispatch(startLoading());
  try {
    const res = await axiosInstance.post("mnr/bulk_make_available/", data);
    if (res.data.errorMsg) {
      alert(res.data.errorMsg, {
        variant: "error",
      });
    } else {
      alert(res.data.successMsg, {
        variant: "success",
      });
      dispatch({ type: "MNR_CLEAR_CONTAINER_LIST" });
      dispatch(getMNRGrid(tempJson));
    }
  } catch (err) {
    console.log(err);
  } finally {
    dispatch(stopLoading());
  }
};

export const addRemoveContainerQueueMnr = (body, alert) => async () => {
  try {
    const res = await axiosInstance.post("/depot/add_remove_from_queue/", body);
    console.log(res);
    if (res.data.successMsg) {
      alert(res.data.successMsg, { variant: "success" });
      window.location.reload();
    }
  } catch (err) {
    alert(err, {
      variant: "error",
    });
  }
};
export const removeMnrDispatch = (body, alert) => async (dispatch) => {
  try {
    const res = await axiosInstance.post("/depot/remove_allotment/", body);
    if (res.data.successMsg) {
      alert("Container removed from allotment", { variant: "success" });
      dispatch(getMNRGrid(tempJson));
    }
  } catch (err) {
    alert(err, {
      variant: "error",
    });
  }
};
