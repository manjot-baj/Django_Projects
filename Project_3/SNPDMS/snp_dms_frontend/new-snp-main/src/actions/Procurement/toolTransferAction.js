import axiosInstance from "@/AxiosExtend";
import { TOOL_TRANSFER_CONSTANT } from "../../reducers/procurement/toolTransferReducer";
import { handleGetCurrentDateUtils } from "../../utils/WeekNumbre";
import { startLoading, stopLoading } from "../UIActions";

export const requestToolTransferAction =
  (toolRequest, admin, notify, scrollToTop, handleChangeTab) =>
  async (dispatch, getState) => {
    const location_id = await getState().user.location_id;
    const site_id = await getState().user.site_id;

    dispatch(startLoading());
    axiosInstance
      .post("procurement/tool_transfer/add/", {
        ...toolRequest,
        requested_from: admin,
        location_id,
        site_id,
      })
      .then((res) => {
        if (res.data.message) {
          notify(
            `${res.data.message} . You can find your Tool Transfer (Location -> Location ) request above in Location Transfer Section `,
            { variant: "success" },
          );

          dispatch(getToolTransferTableAction(notify));
          if (scrollToTop) {
            scrollToTop();
          }
          if (
            handleChangeTab &&
            toolRequest.tool_transfer_type === "Location Transfer"
          ) {
            handleChangeTab("", 2);
          }
        } else {
          notify("Tool Request Failed", { variant: "error" });
        }
      })
      .catch((err) => {
        notify(err.response.data.message, { variant: "error" });
      })
      .finally(() => {
        dispatch(stopLoading());
      });
  };

export const handleToolStatusPartiallAction =
  (pk, toolRequestData, notify, history) => async (dispatch, getState) => {
    const location_id = await getState().user.location_id;
    const site_id = await getState().user.site_id;

    delete toolRequestData.status_list;
    dispatch(startLoading());
    axiosInstance
      .put(`procurement/tool_transfer/${pk}/approve_request/`, {
        ...toolRequestData,
        status: "Partial Approved",
        location_id,
        site_id,
      })
      .then((res) => {
        if (res.data.message) {
          notify(res.data.message, { variant: "success" });
          history.go(0);
        } else if (res.data.errorMsg) {
          notify(res.data.errorMsg, { variant: "error" });
        } else {
          notify("Tool Transfer Approve Request Failed", { variant: "error" });
        }
      })
      .catch((err) => {
        notify(err.response.data.message, { variant: "error" });
      })
      .finally(() => {
        dispatch(stopLoading());
      });
  };

export const handleToolStatusApproveAction =
  (pk, toolRequestData, notify, history) => async (dispatch, getState) => {
    const location_id = await getState().user.location_id;
    const site_id = await getState().user.site_id;

    delete toolRequestData.status_list;
    dispatch(startLoading());
    axiosInstance
      .put(`procurement/tool_transfer/${pk}/approve_request/`, {
        ...toolRequestData,
        tool_request_line: toolRequestData.tool_request_line.map((val) => ({
          ...val,
          approved_by: "",
        })),
        status: "Approved",
        location_id,
        site_id,
      })
      .then((res) => {
        if (res.data.message) {
          notify(res.data.message, { variant: "success" });
          history.go(0);
        } else if (res.data.errorMsg) {
          notify(res.data.errorMsg, { variant: "error" });
        } else {
          notify("Tool Transfer Approve Request Failed", { variant: "error" });
        }
      })
      .catch((err) => {
        notify(err.response.data.message, { variant: "error" });
      })
      .finally(() => {
        dispatch(stopLoading());
      });
  };

export const getToolTransferTableAction =
  (notify) => async (dispatch, getState) => {
    const location_id = await getState().user.location_id;
    const site_id = await getState().user.site_id;
    const procurement_admin = await getState().user.procurement_admin;
    const {
      tool_transfer_no,
      status,
      item,
      sku_code,
      on_page_data_client,
      pg_no,
      category,
      transfer_type,
      is_admin,
    } = await getState().toolTransferReducer.toolTable;
    dispatch(startLoading());
    axiosInstance
      .post("procurement/tool_transfer/table/", {
        tool_transfer_no,
        status,
        on_page_data: on_page_data_client,
        pg_no,
        item,
        sku_code,
        location_id,
        transfer_type,
        category,
        is_admin:(procurement_admin===false ||procurement_admin==="False")?false:is_admin,
        site_id,
      })
      .then((res) => {
        dispatch({
          type: TOOL_TRANSFER_CONSTANT.TOOL_TRANSFER_TABLE,
          payload: res.data,
        });
      })
      .catch((err) => {
        notify(err.response.data.message, { variant: "error" });
      })
      .finally(() => {
        dispatch(stopLoading());
      });
  };

export const getToolTransferPerIDAction =
  (pk, notify, setToolRequestForm) => async (dispatch) => {
    dispatch(startLoading());
    axiosInstance
      .get(`procurement/tool_transfer/${pk}/form_data/`)
      .then((res) => {
        dispatch({
          type: TOOL_TRANSFER_CONSTANT.TOOL_TRANSFER_REQUEST_FORM,
          payload: res.data,
        });
        if (setToolRequestForm) {
          setToolRequestForm(JSON.parse(JSON.stringify(res.data)));
        }
      })
      .catch((err) => {
        notify(err.response.data.message, { variant: "error" });
      })
      .finally(() => {
        dispatch(stopLoading());
      });
  };

export const approveToolRequestAction =
  (line_pk, notify) => async (dispatch, getState) => {
    const location = await getState().user.location;
    const site = await getState().user.site;

    axiosInstance
      .put(`procurement/tool_request_approval/${line_pk}/`, {
        location,
        site,
      })
      .then((res) => {
        notify("Data Approval Successfull", { variant: "sucess" });
        dispatch({
          type: TOOL_TRANSFER_CONSTANT.TOOL_TRANSFER_GET_TOOL_INIT,
        });
      })
      .catch((err) => {
        notify("Data Request Approval Failed. Try Again", { variant: "error" });
        dispatch({
          type: TOOL_TRANSFER_CONSTANT.TOOL_TRANSFER_GET_TOOL_INIT,
        });
        console.log("Dashboard Error !", err);
      });
  };

export const getToolTransferNoAction =
  (transfer_type, setFieldValue, notify) => async (dispatch, getState) => {
    const location_id = await getState().user.location_id;
    const site_id = await getState().user.site_id;
    dispatch(startLoading());
    axiosInstance
      .post(`procurement/dropdown/`, {
        fields: ["tool_transfer_no", "admin_sites", "all_admin_sites"],
        location_id,
        site_id,
        transfer_type,
      })
      .then((res) => {
        if (setFieldValue) {
          setFieldValue("tool_transfer_no", res.data.tool_transfer_no || "");
        }

        dispatch({
          type: TOOL_TRANSFER_CONSTANT.TOOL_TRANSFER_REQUEST_FORM,
          payload: {
            tool_transfer_no: res.data.tool_transfer_no,
            admin_sites:
              transfer_type === "Location Transfer"
                ? res.data?.all_admin_sites
                : res.data.admin_sites,
            date: handleGetCurrentDateUtils(),
          },
        });
      })
      .catch((err) => {
        notify(err.response?.data?.message, { variant: "error" });
      })
      .finally(() => {
        dispatch(stopLoading());
      });
  };
