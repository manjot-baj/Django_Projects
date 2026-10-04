import { axiosInstance } from "../../Axios";
import { TOOL_TRANSFER_CONSTANT } from "../../reducers/procurement/toolTransferReducer";
import { handleGetCurrentDateUtils } from "../../utils/WeekNumbre";

export const requestToolTransferAction =
  (admin,notify, history) => async (dispatch, getState) => {
    const location_id = await getState().user.location_id;
    const site_id = await getState().user.site_id;
    const { toolRequest } = await getState().toolTransferReducer;

    axiosInstance
      .post("procurement/tool_transfer/add/", {
        ...toolRequest,
        requested_from:admin,
        location_id,
        site_id,
      })
      .then((res) => {
        if (res.data.message) {
          notify(res.data.message, { variant: "success" });
          history.goBack();
        } else {
          notify("Tool Request Failed", { variant: "error" });
        }
      })
      .catch((err) => {
        notify(err.response.data.message, { variant: "error" });
      });
  };

export const handleToolStatusPartiallAction =
  (pk, notify, history,setToolLine) => async (dispatch, getState) => {
    const location_id = await getState().user.location_id;
    const site_id = await getState().user.site_id;
    const { toolRequest } = await getState().toolTransferReducer;
    delete toolRequest.status_list;
    axiosInstance
      .put(`procurement/tool_transfer/${pk}/approve_request/`, {
        ...toolRequest,
        status: "Partial Approved", 
        location_id,
        site_id,
      })
      .then((res) => {
        if (res.data.message) {
          notify(res.data.message, { variant: "success" });
          if (res.data.data) {
            dispatch({
              type: TOOL_TRANSFER_CONSTANT.TOOL_TRANSFER_REQUEST_FORM,
              payload: res.data.data,
            });
            if (setToolLine) {
              setToolLine(res.data.data?.tool_request_line)
            }
          }else{
            history.go(0)
          }
          
        } else if(res.data.errorMsg) {
          notify(res.data.errorMsg, { variant: "error" });
        }else{
          notify("Tool Transfer Approve Request Failed",{variant:"error"})
        }
      })
      .catch((err) => {
        notify(err.response.data.message, { variant: "error" });
      });
  };

  export const handleToolStatusApproveAction =
  (pk, notify, history) => async (dispatch, getState) => {
    const location_id = await getState().user.location_id;
    const site_id = await getState().user.site_id;
    const { toolRequest } = await getState().toolTransferReducer;
    delete toolRequest.status_list;
    axiosInstance
      .put(`procurement/tool_transfer/${pk}/approve_request/`, {
        ...toolRequest,
        tool_request_line: toolRequest.tool_request_line.map((val) => ({
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
          if (res.data.data) {
            dispatch({
              type: TOOL_TRANSFER_CONSTANT.TOOL_TRANSFER_REQUEST_FORM,
              payload: res.data.data,
            });
           
          }else{
            history.go(0)
          }
        } else if(res.data.errorMsg) {
          notify(res.data.errorMsg, { variant: "error" });
        }else{
          notify("Tool Transfer Approve Request Failed",{variant:"error"})
        }
      })
      .catch((err) => {
        notify(err.response.data.message, { variant: "error" });
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
      
    } = await getState().toolTransferReducer.toolTable;
    axiosInstance
      .post("procurement/tool_transfer/table/", {
        tool_transfer_no,
        status,
        on_page_data: on_page_data_client,
        pg_no,
        item,
        sku_code,
        location_id,
        is_admin: (procurement_admin === true || procurement_admin ==="True") ? true :false,
        site_id
      })
      .then((res) => {
        dispatch({
          type: TOOL_TRANSFER_CONSTANT.TOOL_TRANSFER_TABLE,
          payload:  res.data ,
        });
      })
      .catch((err) => {
        notify(err.response.data.message, { variant: "error" });
      });
  };

export const getToolTransferPerIDAction = (pk, notify,setToolLine) => async (dispatch) => {
  axiosInstance
    .get(`procurement/tool_transfer/${pk}/form_data/`)
    .then((res) => {
      dispatch({
        type: TOOL_TRANSFER_CONSTANT.TOOL_TRANSFER_REQUEST_FORM,
        payload: res.data,
      });
      setToolLine(res.data?.tool_request_line)
    })
    .catch((err) => {
      notify(err.response.data.message, { variant: "error" });
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

export const getToolTransferNoAction = (notify) => async (dispatch, getState) => {
  const location_id = await getState().user.location_id;
  const site_id = await getState().user.site_id;

  axiosInstance
    .post(`procurement/dropdown/`, {
      fields: ["tool_transfer_no","admin_sites"],
      location_id,
      site_id,
    })
    .then((res) => {
      
      dispatch({
        type: TOOL_TRANSFER_CONSTANT.TOOL_TRANSFER_REQUEST_FORM,
        payload: {
          tool_transfer_no: res.data.tool_transfer_no,
          admin_sites: res.data.admin_sites,
          date: handleGetCurrentDateUtils(),
        },
      });
    })
    .catch((err) => {
      notify(err.response.data.message,{variant:"error"})
    });
};
