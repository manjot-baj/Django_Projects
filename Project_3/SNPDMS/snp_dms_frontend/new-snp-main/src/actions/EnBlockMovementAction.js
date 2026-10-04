import axiosInstance from "@/AxiosExtend"
import { ENBLOCK_REDUCER_CONST } from "../reducers/EnBlockReducer";
import { downloadFileReusable } from "../utils/Utils";
import { startLoading, stopLoading } from "./UIActions";
export const getEnBLockListingAction =
  (notify) => async (dispatch, getState) => {
    const location = await getState().user.location_id;
    const site = await getState().user.site_id;
    const { page_no, on_page_data_client, vessel_no, voyage_no, job_order_no } =
      await getState().EnBlockReducer.enBlockListing;

    dispatch(startLoading());
    axiosInstance
      .post("depot/en_block/all/", {
        location_id: location,
        site_id: site,
        page_no,
        on_page_data: on_page_data_client,
        vessel_no,
        voyage_no,
        job_order_no,
      })
      .then((res) => {
        if (res.data) {
          dispatch(stopLoading());
          // notify(res.data.message, { variant: "success" });
          dispatch({
            type: ENBLOCK_REDUCER_CONST.EN_BLOCK_REDUCER_LISTING,
            payload: res.data,
          });
        }
      })
      .catch((err) => {
        dispatch(stopLoading());
        notify(err.response.data.message, { variant: "error" });
      });
  };

export const downloadEnBlockSampleData = (alert) => async (dispatch) => {
  dispatch(startLoading());
  try {
    const res = await axiosInstance.get(`/depot/en_block/sample_file/`, {
      responseType: "arraybuffer",
    });
    if (res.data) {
      dispatch(stopLoading());
      downloadFileReusable(
        res.data,
        "En Block Sample File ",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      alert("File Downloaded successfully", { variant: "success" });
    }
  } catch (err) {
    dispatch(stopLoading());
    alert(err.response.data.message, {
      variant: "error",
    });
  }
};

export const downloadEnBlockReportFileAction =
  (job_order_no, alert) => async (dispatch, getState) => {
    const location = await getState().user.location_id;
    const site = await getState().user.site_id;
    dispatch(startLoading());
    try {
      const res = await axiosInstance.post(
        `/depot/en_block/report/`,
        {
          location_id: location,
          site_id: site,
          job_order_no: job_order_no,
        },
        {
          responseType: "arraybuffer",
        }
      );
      if (res.data) {
        dispatch(stopLoading());
        downloadFileReusable(
          res.data,
          "En Block Report File ",
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        );
        alert("File Downloaded successfully", { variant: "success" });
      }
    } catch (err) {
      dispatch(stopLoading());
      alert(err.response.data.message, {
        variant: "error",
      });
    }
  };

export const extractEnBlockDataAction =
  (fileData, alert) => async (dispatch) => {
    dispatch(startLoading());
    try {
      const res = await axiosInstance.post(
        `/depot/en_block/extract/`,
        fileData ,
       {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
      );
      if (res.data) {
        dispatch(stopLoading());
        dispatch({
          type: ENBLOCK_REDUCER_CONST.EN_BLOCK_EXTRACT_DATA,
          payload: res.data,
        });
        alert(res.data.message, { variant: "success" });
      }
    } catch (err) {
      dispatch(stopLoading());
      alert(err.response.data.message, {
        variant: "error",
      });
    }
  };

export const downloadEnBlockRejectedData =
  (rejectArray, alert) => async (dispatch) => {
    dispatch(startLoading());
    try {
      const res = await axiosInstance.post(
        `/depot/en_block/rejected_file/`,
        rejectArray,
        { responseType: "arraybuffer" }
      );
      if (res.data) {
        dispatch(stopLoading());
        downloadFileReusable(
          res.data,
          "En Block Rejected File ",
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        );
      }
    } catch (err) {
      dispatch(stopLoading());
      alert(err.response.data.message, {
        variant: "error",
      });
    }
  };

export const importEnBlockDataAction =
  (importArray, alert,setDisableImport) => async (dispatch) => {
    dispatch(startLoading());
    try {
      const res = await axiosInstance.post(
        `/depot/en_block/import/`,
        importArray,
        { responseType: "arraybuffer" }
      );
      if (res.data) {
        dispatch(stopLoading());
        downloadFileReusable(
          res.data,
          "En Block Approved File ",
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        );
        if (setDisableImport) {
          setDisableImport(true)
        }

        alert(res.data.message, { variant: "success" });
      }
    } catch (err) {
      dispatch(stopLoading());
      alert(err.response.data.message, { variant: "error" });
    }
  };

export const getEnBLockDataByPkAction =
  (pk, notify, setOpen, setEnBlockEdit) => async (dispatch, getState) => {
    dispatch(startLoading());
    axiosInstance
      .get(`depot/en_block/${pk}/`)
      .then((res) => {
        if (res.data) {
          dispatch(stopLoading());
          setOpen(true);
          setEnBlockEdit((prev) => ({ ...prev, pk: pk }));
          notify(res.data.message, { variant: "success" });
          dispatch({
            type: ENBLOCK_REDUCER_CONST.EN_BLOCK_EDIT,
            payload: res.data.data,
          });
        }
      })
      .catch((err) => {
        dispatch(stopLoading());
        notify(err.response.data.message, { variant: "error" });
      });
  };

export const updateEnBlockAction =
  (enBlockEdit, notify, setOpen) => async (dispatch, getState) => {
    dispatch(startLoading());
    axiosInstance
      .put(`depot/en_block/${enBlockEdit.pk}/update/`, {
        quantity: Number(enBlockEdit.quantity),
      })
      .then((res) => {
        if (res.data) {
          dispatch(stopLoading());
          setOpen(false);
          dispatch(getEnBLockListingAction(notify));
          notify(res.data.message, { variant: "success" });
        }
      })
      .catch((err) => {
        dispatch(stopLoading());
        notify(err.response.data.message, { variant: "error" });
      });
  };

export const addEnBLockDataAction =
  (data, notify, handleClose) => async (dispatch, getState) => {
    const location = await getState().user.location_id;
    const site = await getState().user.site_id;

    dispatch(startLoading());
    axiosInstance
      .post("depot/en_block/add/", {
        location_id: location,
        site_id: site,
        ...data,
      })
      .then((res) => {
        if (res.data) {
          dispatch(stopLoading());
          notify(res.data.message, { variant: "success" });
          handleClose();
          dispatch(getEnBLockListingAction(notify));
        }
      })
      .catch((err) => {
        dispatch(stopLoading());
        notify(err.response.data.message, { variant: "error" });
      });
  };

export const getEnBLockVesselVoyageNameDataAction =
  (notify) => async (dispatch, getState) => {
    const location = await getState().user.location_id;
    const site = await getState().user.site_id;

    dispatch(startLoading());
    axiosInstance
      .post("depot/en_block/list/vessel_voyage/", {
        location_id: location,
        site_id: site,
      })
      .then((res) => {
        if (res.data) {
          dispatch(stopLoading());
          // notify(res.data.message, { variant: "success" });
          dispatch({
            type: ENBLOCK_REDUCER_CONST.EN_BLOCK_VESSEL_VOYAGE_NAME,
            payload: res.data,
          });
        }
      })
      .catch((err) => {
        dispatch(stopLoading());
        notify(err.response.data.message, { variant: "error" });
      });
  };

export const getEnBLockListingPreGateInAction =
  (notify) => async (dispatch, getState) => {
    const location = await getState().user.location_id;
    const site = await getState().user.site_id;
    const {
      page_no,
      on_page_data_client,
      vessel_name,
      voyage_no,
      job_order_no,
      container_no,
      status,
    } = await getState().EnBlockReducer.enBlockPreGateInListing;

    dispatch(startLoading());
    axiosInstance
      .post("depot/en_block_pregatein/all/", {
        location_id: location,
        site_id: site,
        page_no,
        on_page_data: on_page_data_client,
        vessel_name,
        voyage_no,
        status,
        job_order_no,
        container_no,
      })
      .then((res) => {
        if (res.data) {
          dispatch(stopLoading());

          dispatch({
            type: ENBLOCK_REDUCER_CONST.EN_BLOCK_PRE_GATE_IN_LISTING,
            payload: res.data,
          });
        }
      })
      .catch((err) => {
        dispatch(stopLoading());
        notify(err.response.data.message, { variant: "error" });
      });
  };

export const downloadEnBlockPreGateInSampleData =
  (alert) => async (dispatch) => {
    dispatch(startLoading());
    try {
      const res = await axiosInstance.get(
        `/depot/en_block_pregatein/download/`,
        {
          responseType: "arraybuffer",
        }
      );
      if (res.data) {
        dispatch(stopLoading());
        downloadFileReusable(
          res.data,
          "En Block Pre Gate IN Sample File ",
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        );
        alert("File Downloaded successfully", { variant: "success" });
      }
    } catch (err) {
      dispatch(stopLoading());
      alert(err.response.data.message, {
        variant: "error",
      });
    }
  };

export const extractEnBlockPreGateInDataAction =
  (fileData, alert) => async (dispatch) => {
    dispatch(startLoading());
    try {
      const res = await axiosInstance.post(
        `/depot/en_block_pregatein/extract/`,
        fileData,
        {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
      );
      if (res.data) {
        dispatch(stopLoading());
        dispatch({
          type: ENBLOCK_REDUCER_CONST.EN_BLOCK_PRE_GATE_IN_EXTRACT,
          payload: res.data,
        });
      }
    } catch (err) {
      dispatch(stopLoading());
      alert(err.response.data.message, {
        variant: "error",
      });
    }
  };

export const downloadEnBlockPreGateInRejectedData =
  (rejectArray, alert) => async (dispatch) => {
    dispatch(startLoading());
    try {
      const res = await axiosInstance.post(
        `/depot/en_block_pregatein/rejected/`,
        rejectArray,
        { responseType: "arraybuffer" }
      );
      if (res.data) {
        dispatch(stopLoading());
        downloadFileReusable(
          res.data,
          "En Block Pre Gate In Rejected File ",
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        );
      }
    } catch (err) {
      dispatch(stopLoading());
      alert(err.response.data.message, {
        variant: "error",
      });
    }
  };

export const importEnBlockPreGateInDataAction =
  (importArray, alert) => async (dispatch) => {
    dispatch(startLoading());
    try {
      const res = await axiosInstance.post(
        `/depot/en_block_pregatein/import/`,
        importArray,
        { responseType: "arraybuffer" }
      );
      if (res.data) {
        dispatch(stopLoading());

        alert("File Imported Successfully", { variant: "success" });
      }
    } catch (err) {
      dispatch(stopLoading());
      alert(err.response.data.message, { variant: "error" });
    }
  };

export const getEnBLockPreGateInContainerValidationAction =
  (container_no, notify) => async (dispatch, getState) => {
    const location = await getState().user.location_id;
    const site = await getState().user.site_id;

    dispatch(startLoading());
    axiosInstance
      .post("depot/en_block_pregatein/pregatein_info/", {
        location_id: location,
        site_id: site,
        container_no,
      })
      .then((res) => {
        if (res.data) {
          dispatch(stopLoading());

          dispatch({
            type: ENBLOCK_REDUCER_CONST.EN_BLOCK_VESSEL_VOYAGE_NAME,
            payload: res.data.data,
          });
          dispatch({
            type: "SET_BL_NUMBER",
            payload: res.data.data.job_order_no,
          });
          dispatch({
            type: "SET_VESSEL_NAME",
            payload: res.data.data.vessel_name,
          });
          dispatch({
            type: "SET_VOYAGE_NUMBER",
            payload: res.data.data.voyage_no,
          });
          dispatch({
            type: "SET_SIZE",
            payload: res.data.data?.size,
          });
          dispatch({
            type: "SET_TYPE",
            payload: res.data.data?.type,
          });
          dispatch({
            type: "SET_CLIENT",
            payload: res.data.data?.client,
          });
          dispatch({
            type: "CLEAR_SHIPPING_LINE",
          });
          dispatch({
            type: "SET_SHIPPING_LINE_MENU_ITEMS",
            payload: res.data.data?.line?.map((val) => ({ name: val })),
          });
          dispatch({
            type: "SET_ARRIVED",
            payload: "Port/Vessel",
          });
        }
      })
      .catch((err) => {
        dispatch(stopLoading());
      });
  };

export const downloadEnBlockPreGateInReportFile =
  (job_order_no, alert, handleClose) => async (dispatch, getState) => {
    const location = await getState().user.location_id;
    const site = await getState().user.site_id;

    dispatch(startLoading());
    try {
      const res = await axiosInstance.post(
        `/depot/en_block_pregatein/report/`,
        {
          job_order_no: job_order_no,
          site_id: site,
          location_id: location,
        },
        {
          responseType: "arraybuffer",
        }
      );
      if (res.data) {
        dispatch(stopLoading());
        handleClose();
        downloadFileReusable(
          res.data,
          "En Block Pre Gate IN Report  File ",
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        );
        alert("File Downloaded successfully", { variant: "success" });
      }
    } catch (err) {
      alert(
        "Job Order No does not exists , try again with different Job Order No",
        { variant: "error" }
      );
      dispatch(stopLoading());
    }
  };

export const discardEnBLockPreGateInContainerAction =
  (pk_list, remark, job_order_no, notify,setSelectedRows,handleModalCloseDiscard) => async (dispatch, getState) => {
    const location = await getState().user.location_id;
    const site = await getState().user.site_id;

    dispatch(startLoading());
    axiosInstance
      .post("depot/en_block_pregatein/discard/", {
        location_id: location,
        site_id: site,
        pk_list: pk_list,
        job_order_no,
        remark,
      })
      .then((res) => {
        setSelectedRows([])
        notify(res.data.message, { variant: "success" });
        handleModalCloseDiscard()
        dispatch(getEnBLockListingPreGateInAction(notify))
        dispatch(stopLoading());
      })
      .catch((err) => {
        dispatch(stopLoading());
      });
  };
