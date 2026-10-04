import { ADVANCE_FINANCE_CUSTOMER_ACCOUNT } from "@/reducers/LOLOFinance/LoloFinanceCustomerReducer";
import { startLoading, stopLoading } from "../UIActions";
import { axiosInstance } from "@/Axios";
import { downloadFileReusable } from "@/utils/Utils";

export const getLOLOFinanceCustomerAccountBalanceLeftAction =
  (client, setClientAmount,setClientDetails, notify) => async (dispatch, getState) => {
    const { location, site } = await getState().user;

    dispatch(startLoading());
    axiosInstance
      .post("depot/get_client_fin_account_balance/", {
        client,
        location,
        site,
      })
      .then((res) => {
        if (res.data) {
          dispatch(stopLoading());
          if (setClientDetails) {
               setClientDetails(res.data) 
          }
      
          setClientAmount(res.data?.balance);
        }
      })
      .catch((err) => {
        dispatch(stopLoading());
        notify(err.response.data.errorMsg, { variant: "error" });
        dispatch({ type: HANDLING_ST_PAYMENT.HANDLING_LIST_INIT });
      });
  };
export const updateLOLOFinanceCustomerAccountAction =
  (with_gst, client, notify) => async (dispatch, getState) => {
    const { location, site } = await getState().user;
    try {
      dispatch(startLoading());
      const res = await axiosInstance.put("depot/update_client_fin_account/", {
        with_gst: with_gst,
        client: client,
        location,
        site,
      });
      if (res.data) {
        if (res.data.errorMsg) {
          notify(res.data.errorMsg, { variant: "error" });
        }
        if (res.data.success) {
          notify(res.data.success, { variant: "success" });
          dispatch(getLOLOFinanceCustomerAccountListingAction(notify));
        } else {
          dispatch(getLOLOFinanceCustomerAccountListingAction(notify));
        }
      }
    } catch (error) {
      if (error.response?.data?.errorMsg) {
        notify(error.response?.data?.errorMsg, { variant: "error" });
      }
    } finally {
      dispatch(stopLoading());
    }
  };

export const getLOLOFinanceCustomerAccountListingAction =
  (notify) => async (dispatch, getState) => {
    const { pg_no, edit_on_page_data, client ,with_gst } = await getState()
      .LoloFinanceCustomerReducer.lolo_finance_customer_account_list;
    const { location, site } = await getState().user;

    dispatch(startLoading());
    axiosInstance
      .post("depot/customer_fin_account_list/", {
        pg_no,
        on_page_data: edit_on_page_data,
        client,
        location,
        site,
        with_gst
      })
      .then((res) => {
        if (res.data) {
          dispatch(stopLoading());

          dispatch({
            type: ADVANCE_FINANCE_CUSTOMER_ACCOUNT.ADVANCE_LOLO_FINANCE_CUSTOMER_ACCOUNT_LISTING,
            payload: res.data,
          });
        }
      })
      .catch((err) => {
        dispatch(stopLoading());
        notify(err.response.data.errorMsg, { variant: "error" });
        dispatch({ type: HANDLING_ST_PAYMENT.HANDLING_LIST_INIT });
      });
  };

export const deleteLOLOFinanceCustomerAccountPaymentAction =
  (pk, notify) => async (dispatch, getState) => {
    dispatch(startLoading());
    axiosInstance
      .get(`depot/customer_fin_account/${pk}/delete/`)
      .then((res) => {
        if (res.data.successMsg) {
          notify(res.data.successMsg, { variant: "success" });
          dispatch(getLOLOFinanceCustomerAccountListingAction(notify));
        } else if (res.data.errorMsg) {
          notify(res.data.errorMsg, { variant: "error" });
        }
      })
      .catch((err) => {
        notify(err.response.data.errorMsg, { variant: "error" });
      })
      .finally(() => dispatch(stopLoading()));
  };

export const deleteSingleAccountLOLOFinanceCustomerAccountPaymentAction =
  (pk, account_pk, notify) => async (dispatch, getState) => {
    dispatch(startLoading());
    axiosInstance
      .get(`depot/customer_fin_account/${pk}/transaction_delete/`)
      .then((res) => {
        if (res.data.successMsg) {
          notify(res.data.successMsg, { variant: "success" });
          dispatch(
            getSingleLOLOFinanceCustomerAccountPaymentAction(account_pk, notify)
          );
        } else if (res.data.errorMsg) {
          notify(res.data.errorMsg, { variant: "error" });
        }
      })
      .catch((err) => {
        notify(err.response.data.errorMsg, { variant: "error" });
      })
      .finally(() => dispatch(stopLoading()));
  };

export const getSingleLOLOFinanceCustomerAccountPaymentAction =
  (pk, notify) => async (dispatch, getState) => {
    dispatch(startLoading());
    axiosInstance
      .get(`depot/customer_fin_account/${pk}/`)
      .then((res) => {
        if (res.data) {
          dispatch({
            type: ADVANCE_FINANCE_CUSTOMER_ACCOUNT.SINGLE_ADVANCE_LOLO_FINANCE_CUSTOMER_ACCOUNT,
            payload: res.data,
          });
        } else if (res.data.errorMsg) {
          notify(res.data.errorMsg, { variant: "error" });
        }
      })
      .catch((err) => {
        notify(err.response.data.errorMsg, { variant: "error" });
      })
      .finally(() => dispatch(stopLoading()));
  };

export const addLOLOFinanceCustomerAccountPaymentAction =
  (data, handleModalclose, notify) => async (dispatch, getState) => {
    const { location, site } = await getState().user;
    dispatch(startLoading());
    axiosInstance
      .post("depot/customer_fin_account/", { ...data, location, site })
      .then((res) => {
        if (res.data.successMsg) {
          handleModalclose();
          notify(res.data.successMsg, { variant: "success" });
          dispatch(getLOLOFinanceCustomerAccountListingAction(notify));
        }
      })
      .catch((err) => {
        notify(err.response.data.errorMsg, { variant: "error" });
      })
      .finally(() => dispatch(stopLoading()));
  };

export const extractLOLOFinanceCustomerAccountBulkUploadDataAction =
  (fileData, alert) => async (dispatch) => {
    dispatch(startLoading());
    try {
      const res = await axiosInstance.post(
        `/depot/customer_fin_account_bulk_upload/`,
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
          type: ADVANCE_FINANCE_CUSTOMER_ACCOUNT.ADVANCE_LOLO_FINANCE_CUSTOMER_ACCOUNT_BULK_UPLOAD,
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

export const importLOLOFinanceCustomerAccountBulkUploadDataAction =
  (importArray, alert, setDisableImport) => async (dispatch) => {
    dispatch(startLoading());
    try {
      const res = await axiosInstance.post(
        `/depot/customer_fin_account_bulk_import/`,
        importArray
      );
      if (res.data) {
        dispatch(stopLoading());
        if (res.data.errorMsg) {
          alert(res.data.errorMsg, { variant: "error" });
        } else {
          setDisableImport(true);
          alert(res.data.successMsg, { variant: "success" });
        }
      }
    } catch (err) {
      dispatch(stopLoading());
      alert(err.response.data.message, { variant: "error" });
    }
  };

export const downloadLOLOFinanceCustomerAccountRejectedData =
  (rejectArray, alert) => async (dispatch) => {
    dispatch(startLoading());
    try {
      const res = await axiosInstance.post(
        `/depot/rejected_customer_fin_account_download/`,
        rejectArray,
        { responseType: "arraybuffer" }
      );
      if (res.data) {
        dispatch(stopLoading());
        downloadFileReusable(
          res.data,
          "LOLO Finance Customer Account Bulk Upload Rejected File ",
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

export const downloadLOLOFinanceCustomerAccountBulkUploadSampleFile =
  (alert) => async (dispatch) => {
    dispatch(startLoading());
    try {
      const res = await axiosInstance.get(
        `/depot/customer_fin_account_bulk_upload/`,
        {
          responseType: "arraybuffer",
        }
      );
      if (res.data) {
        dispatch(stopLoading());
        downloadFileReusable(
          res.data,
          "Customer Finance Account Bulk Upload  Sample File ",
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


  export const downloadLOLOFinanceCustomerAccountLedgePdfFile =
  (data,alert) => async (dispatch,getState) => {
    dispatch(startLoading());
      const { location, site } = await getState().user;
    try {
      const res = await axiosInstance.post(
        `/depot/customer_fin_account_ledger/`,{
          ...data,
          location,
          site
        },
        {
          responseType: "arraybuffer",
        }
      );
      if (res.data) {
        dispatch(stopLoading());
        downloadFileReusable(
          res.data,
          "Customer Finance Account Ledger File",
          "application/pdf"
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