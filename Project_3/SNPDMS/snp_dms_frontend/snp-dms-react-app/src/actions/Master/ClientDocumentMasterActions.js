import { axiosInstance } from "../../Axios";
import { clearCheck } from "./ClientMasterActions";
import { downloadReceiptsDO } from "../GateInActions";

let tempJson = {};

export const getClientDocListing = (data,alert) => async (dispatch) => {
  tempJson = data;
  dispatch({
    type: "RESET_STOCK_ALLOTMENT_SEARCH_RESULT",
  });
  try {
    const res = await axiosInstance.post(
      `master/client_document/all/`,
      data
    );
    dispatch({ type: "GET_ALL_CLIENT_DOCS", payload: res.data.data });
    dispatch({
      type: "STOCK_ALLOTMENT_NEXT_PAGE_LINK",
      payload: res.data.next_page,
    });
    dispatch({
      type: "STOCK_ALLOTMENT_PREV_PAGE_LINK",
      payload: res.data.prev_page,
    });
    dispatch({
      type:"STOCK_ALLOTMENT_TOTAL_PAGE_LINK",
      payload:res.data.total_pages,
    })
  } catch (err) {
    alert(err.response.data.errorMsg, { variant: "error" });

  }
};

export const getSingleClientDocument = (pkId, alert) => async (dispatch) => {
  try {
    const res = await axiosInstance.get(
      `master/client_document/${pkId}/`
    );
    if (!res.data.errorMsg)
      dispatch({ type: "GET_SINGLE_CLIENT_DOC", payload: res.data });
    else if (res.data.errorMsg) {
      alert(res.data.errorMsg, { variant: "error" });
    }
  } catch (err) {
    alert(err.response.data.errorMsg, { variant: "error" });

  }
};

export const addMasterClientDocument =
  (clientBodyData, history, alert) => async () => {
    try {
      const res = await axiosInstance.post(
        `master/client_document/add/`,
        clientBodyData
      );
      if (res.data.successMsg) {
        alert("Client Document created successfully", { variant: "success" });
        history.push("/master/clientDocument");
      } else if (res.data.errorMsg) {
        alert(res.data.errorMsg, { variant: "error" });
      }
    } catch (err) {
      alert(err.response.data.errorMsg, { variant: "error" });

    }
  };

export const updateMasterClientDoc =
  (pkId, clientBodyData, history, alert) => async () => {
    try {
      const res = await axiosInstance.put(
        `master/client_document/${pkId}/update/`,
        clientBodyData
      );
      if (res.data.successMsg) {
        alert("Client Document updated successfully", { variant: "success" });
        history.push("/master/clientDocument");
      } else if (res.data.errorMsg) {
        alert(res.data.errorMsg, { variant: "error" });
      }
    } catch (err) {
      alert(err.response.data.errorMsg, { variant: "error" });

    }
  };

export const deleteClientDoc = (deleteIDs) => async (dispatch) => {
  try {
    await axiosInstance.post(
      `master/client_document/delete/`,
      deleteIDs
    );
    dispatch(clearCheck());
    dispatch(getClientDocListing(tempJson));
  } catch (err) {
    alert(err.response.data.errorMsg, { variant: "error" });

  }
};

export const downloadClientDocument = (gih_pk) => async () => {
  try {
    const res = await axiosInstance.get(
      `master/client_document/${gih_pk}/download/`,
      {
        responseType: "arraybuffer",
      }
    );
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
    downloadReceiptsDO(res.data, "Client_Doc", type);
  } catch (err) {
    alert(err.response.data.errorMsg, { variant: "error" });

  }
};
