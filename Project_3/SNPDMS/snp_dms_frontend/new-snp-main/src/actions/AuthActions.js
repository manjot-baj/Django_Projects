import axiosInstance from "@/AxiosExtend"
import { USER_INFO } from "../reducers/UserReducer";
import {AES,enc} from 'crypto-js'

export const loginUserDispatch =
  (body, actions, history, isRemember, alert) => (dispatch) => {
    dispatch({ type: "SET_ERROR_MSG", payload: "" });
    axiosInstance
      .post("account/login/token/", body)
      .then((res) => {
        
        // if remember me is checked then store the username and pwd in encrypted format
        if (isRemember) {
          var encryptedPass = AES.encrypt(
            body.password,
            "secret key 123"
          ).toString();
          localStorage.setItem("pwd", encryptedPass);
          localStorage.setItem("userName", body.username);
        }
        // if not checked then remove if there is any previous value from storage
        else {
          localStorage.removeItem("pwd");
          localStorage.removeItem("userName");
        }

        if (
          res.data.transportation_module === "" ||
          res.data.transportation_module === false
        ) {
          dispatch({
            type: "SET_TRANSPORTATION_MODULE",
            payload: false,
          });
          localStorage.setItem("transportation_module", false);
        } else {
          dispatch({
            type: "SET_TRANSPORTATION_MODULE",
            payload: true,
          });
          localStorage.setItem("transportation_module", true);
        }

        if (
          res.data.mnr_ftp_upload === "" ||
          res.data.mnr_ftp_upload === false
        ) {
          dispatch({
            type: "SET_MNR_FTP_UPLOAD",
            payload: false,
          });
          localStorage.setItem("mnr_ftp_upload", false);
        } else {
          dispatch({
            type: "SET_MNR_FTP_UPLOAD",
            payload: true,
          });
          localStorage.setItem("mnr_ftp_upload", true);
        }

        if (
          res.data.loaded_yard_module === "" ||
          res.data.loaded_yard_module === false
        ) {
          dispatch({
            type: "SET_LOADED_EMPTY_YARD_MODULE",
            payload: false,
          });
          localStorage.setItem("loaded_yard_module", false);
        } else {
          dispatch({
            type: "SET_LOADED_EMPTY_YARD_MODULE",
            payload: true,
          });
          localStorage.setItem("loaded_yard_module", true);
        }

        if (res.data.lolo_finance === "" || res.data.lolo_finance === false) {
          dispatch({
            type: USER_INFO.LOLO_FINANCE_MODULE,
            payload: false,
          });
          localStorage.setItem("lolo_finance", false);
        } else {
          dispatch({
            type: USER_INFO.LOLO_FINANCE_MODULE,
            payload: true,
          });
          localStorage.setItem("lolo_finance", true);
        }

        if (
          res.data.procurement_module === "" ||
          res.data.procurement_module === false
        ) {
          dispatch({
            type: USER_INFO.PROCUREMENT_MODULE,
            payload: false,
          });
          localStorage.setItem("procurement_module", false);
        } else {
          dispatch({
            type: USER_INFO.PROCUREMENT_MODULE,
            payload: true,
          });
          localStorage.setItem("procurement_module", true);
        }

        if (
          res.data?.procurement_admin === "" ||
          res.data?.procurement_admin === false
        ) {
          dispatch({
            type: "SET_PROCUREMENT_ADMIN",
            payload: false,
          });
          localStorage.setItem("procurement_admin", false);
        } else {
          dispatch({
            type: "SET_PROCUREMENT_ADMIN",
            payload: true,
          });
          localStorage.setItem("procurement_admin", true);
        }

        if (
          res.data.new_billing_module === "" ||
          res.data.new_billing_module === false
        ) {
          dispatch({
            type: "SET_NEW_BILLING_MODULE",
            payload: false,
          });
          localStorage.setItem("new_billing_module", false);
        } else {
          dispatch({
            type: "SET_NEW_BILLING_MODULE",
            payload: true,
          });
          localStorage.setItem("new_billing_module", true);
        }

        if (res.data.mnr_team === "" || res.data.mnr_team === false) {
          dispatch({
            type: USER_INFO.MNR_TEAM,
            payload: false,
          });
          localStorage.setItem("mnr_team", false);
        } else {
          dispatch({
            type: USER_INFO.MNR_TEAM,
            payload: true,
          });
          localStorage.setItem("mnr_team", true);
        }

        if (
          res.data?.en_block_movement === "" ||
          res.data?.en_block_movement === false ||
          res.data?.en_block_movement === "false" ||
          res.data?.en_block_movement === "False"
        ) {
          dispatch({
            type: USER_INFO.EN_BLOCK_MOVEMENT_MODULE,
            payload: false,
          });
          localStorage.setItem("en_block_movement", false);
        } else {
          dispatch({
            type: USER_INFO.EN_BLOCK_MOVEMENT_MODULE,
            payload: true,
          });
          localStorage.setItem("en_block_movement", true);
        }

        if (
          res.data?.en_block_movement_v2 === "" ||
          res.data?.en_block_movement_v2 === false ||
          res.data?.en_block_movement_v2 === "false" ||
          res.data?.en_block_movement_v2 === "False"
        ) {
          dispatch({
            type: USER_INFO.EN_BLOCK_MOVEMENT_VERSION_2,
            payload: false,
          });
          localStorage.setItem("en_block_movement_v2", false);
        } else {
          dispatch({
            type: USER_INFO.EN_BLOCK_MOVEMENT_VERSION_2,
            payload: true,
          });
          localStorage.setItem("en_block_movement_v2", true);
        }

        dispatch({
          type: USER_INFO.IS_PAID,
          payload: res.data?.payment_due_date,
        });
        localStorage.setItem("payment_due_date", res.data?.payment_due_date);

        localStorage.setItem("isRemember", isRemember);
        localStorage.setItem("accessToken", res.data.access);

        localStorage.setItem("userInfo", JSON.stringify(res.data));
        localStorage.setItem("location", res.data.location);
        localStorage.setItem("site", res.data.site);
        localStorage.setItem("type", res.data.site_type);
        dispatch({ type: "SET_USER_INFO", payload: res.data });
        dispatch({ type: "SET_LOCATION", payload: res.data.location });

        dispatch({ type: "SET_SITE", payload: res.data.site });
        dispatch({ type: "SET_TYPE", payload: res.data.site_type });
        dispatch({ type: "SET_ROLE", payload: res.data.role });
        if (res.data.role === "no role" || res.data.role === "Wistim Distim") {
          history.push("/mnr_edi_upload");
        } else if (res.data.role === "Analytics") {
          history.push("/analytics/dashboard");
        } else if (res.data.role === "Automation") {
          history.push("/automation/dashboard");
        } else {
          history.push("/dashboard");
        }
        actions.setSubmitting(false);
      })
      .catch((err) => {
        if (
          err?.response?.data?.detail ===
          "No active account found with the given credentials"
        ) {
          dispatch({ type: "LOGIN_FAILED", payload: true });
          // dispatch({ type: "SET_ERROR_MSG", payload: "Invalid Credentials" });
          alert(err.response.data.detail, { variant: "error" });
        }
        actions.setSubmitting(false);
        history.push("/login");
      });
  };
export const resetPasswordDispatch =
  (body, actions, history, alert) => (dispatch) => {
    dispatch({ type: "SET_ERROR_MSG", payload: "" });
    axiosInstance
      .post("account/reset_password/", body)
      .then((res) => {
        if (res.data.successMsg) {
          alert(res.data.successMsg, { variant: "success" });
          actions.setSubmitting(false);
          history.push("/login");
        }
      })
      .catch((err) => {
        actions.setSubmitting(false);
        if (err.response.data.errorMsg);
        dispatch({
          type: "SET_ERROR_MSG",
          payload: err.response.data.errorMsg,
        });
      });
  };
