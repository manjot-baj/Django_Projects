import { USER_SUPPORT_CONST } from "@/reducers/UserSupportReducer";
import { startLoading, stopLoading } from "./UIActions";
import { axiosInstance } from "@/Axios";
import { downloadFileReusable } from "@/utils/Utils";

export const userSupportTicketListingAction =
  (notify,locationAdmin) => async (dispatch, getState) => {
    const {
      pg_no,
      on_page_data_client,
      ticket_number,
      ticket_type,
      status,
      location,
      site,
      module_name,
      from_date,
      to_date,
    } = await getState().UserSupportReducer.ticket_listing;
    const {
      role,
      location: locationUser,
      site: siteUser,
    } = await getState().user;
    dispatch(startLoading());
    try {
      const res = await axiosInstance.post("/user_support/tickets/", {
        pg_no,
        on_page_data: on_page_data_client,
        ticket_number,
        ticket_type,
        status,
        module_name,
        from_date,
        to_date,
        location: role === "Admin" ? location : locationUser,
        site: role === "Admin" || locationAdmin ? site :  siteUser,
      });
      if (res.data?.errorMsg) {
        notify(res.data?.errorMsg, { variant: "error" });
      } else {
        dispatch({
          type: USER_SUPPORT_CONST.GET_ALL_TICKETS,
          payload: res.data,
        });

      }
    } catch (err) {
      notify(err.message, { variant: "error" });
    } finally {
      dispatch(stopLoading());
    }
  };



export const getTicketDropDownAction =
  (array, alert) => async (dispatch, getState) => {
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
        get_list: dataArray,
      })
      .then((res) => {
        dispatch({
          type: USER_SUPPORT_CONST.GET_TICKET_DROPDOWN,
          payload: res.data,
        });
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

export const userSupportCreateTicketAction =
  (data, history, notify,closeModal) => async (dispatch, getState) => {
    const { location, site } = await getState().user;
    dispatch(startLoading());
    try {
      const res = await axiosInstance.post("/user_support/tickets/create/", {
        ...data,
        location,
        site,
      });

      if (res?.data?.errorMsg) {
        notify(res?.data?.errorMsg, { variant: "error" });
      } else if (res?.data?.successMsg) {
     
        dispatch(userSupportTicketListingAction(notify));
        notify(res?.data?.successMsg, { variant: "success" });
        if (closeModal) {
          closeModal()
        }
      }
    } catch (err) {
      notify(err.response.data?.detail, { variant: "error" });
    } finally {
      dispatch(stopLoading());
    }
  };

export const getSingleUserSupportTicketAction =
  (pk, notify) => async (dispatch) => {
    dispatch(startLoading());
    try {
      const res = await axiosInstance.get(
        `/user_support/tickets/${pk}/detail/`
      );
      if (res.data) {
        dispatch({
          type: USER_SUPPORT_CONST.GET_SINGLE_TICKET,
          payload: res.data,
        });
        if (res?.data?.errorMsg) {
          notify(res?.data?.errorMsg, { variant: "error" });
        } else if (res?.data?.successMsg) {
          notify(res?.data?.successMsg, { variant: "success" });
        }
      }
    } catch (err) {
      notify(err.response.data?.detail, { variant: "error" });
    } finally {
      dispatch(stopLoading());
    }
  };

export const addCommentSingleUserSupportTicketAction =
  (pk, data, notify) => async (dispatch) => {
    dispatch(startLoading());
    try {
      const res = await axiosInstance.post(
        `/user_support/tickets/${pk}/comment/add/`,
        data
      );
      if (res.data) {
        if (res?.data?.errorMsg) {
          notify(res?.data?.errorMsg, { variant: "error" });
        } else if (res?.data?.successMsg) {
          notify(res?.data?.successMsg, { variant: "success" });
        }
        dispatch(getSingleUserSupportTicketAction(pk, notify));
      }
    } catch (err) {
      notify(err.response.data?.detail, { variant: "error" });
    } finally {
      dispatch(stopLoading());
    }
  };
export const downloadAttachmentSingleUserSupportTicketAction =
  (pk, file_name, notify) => async (dispatch) => {
    dispatch(startLoading());
    try {
      const res = await axiosInstance.get(
        `/user_support/attachments/${pk}/download/`,
        {
          responseType: "arraybuffer", // or "blob"
        }
      );
      if (res.data) {

        downloadFileReusable(
          res.data,
          file_name,
          res.headers?.["content-type"]
        );
        if (res?.data?.errorMsg) {
          notify(res?.data?.errorMsg, { variant: "error" });
        } else if (res?.data?.successMsg) {
          notify(res?.data?.successMsg, { variant: "success" });
        }
      }
    } catch (err) {
      notify(err.response.data?.detail, { variant: "error" });
    } finally {
      dispatch(stopLoading());
    }
  };

export const uploadAttachmentSingleUserSupportTicketAction =
  (pk, file, handleRemove, notify) => async (dispatch) => {
    dispatch(startLoading());
    try {
      const res = await axiosInstance.post(
        `/user_support/tickets/${pk}/attachment/add/`,
        file,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      if (res.data) {
        if (res?.data?.errorMsg) {
          notify(res?.data?.errorMsg, { variant: "error" });
        } else if (res?.data?.successMsg) {
          handleRemove();
          dispatch(getSingleUserSupportTicketAction(pk, notify));
          notify(res?.data?.successMsg, { variant: "success" });
        }
      }
    } catch (err) {
      notify(err.response.data?.detail, { variant: "error" });
    } finally {
      dispatch(stopLoading());
    }
  };

export const deleteAttachmentSingleUserSupportTicketAction =
  (pk, ticket_pk, notify) => async (dispatch) => {
    dispatch(startLoading());
    try {
      const res = await axiosInstance.delete(
        `/user_support/attachments/${pk}/delete/`
      );
      if (res.data) {
        if (res?.data?.errorMsg) {
          notify(res?.data?.errorMsg, { variant: "error" });
        } else if (res?.data?.successMsg) {
          dispatch(getSingleUserSupportTicketAction(ticket_pk, notify));
          notify(res?.data?.successMsg, { variant: "success" });
        }
      }
    } catch (err) {
      notify(err.response.data?.detail, { variant: "error" });
    } finally {
      dispatch(stopLoading());
    }
  };

export const deleteCommentsSingleUserSupportTicketAction =
  (pk, ticket_pk, notify) => async (dispatch) => {
    dispatch(startLoading());
    try {
      const res = await axiosInstance.delete(
        `/user_support/comments/${pk}/delete/`
      );
      if (res.data) {
        if (res?.data?.errorMsg) {
          notify(res?.data?.errorMsg, { variant: "error" });
        } else if (res?.data?.successMsg) {
          dispatch(getSingleUserSupportTicketAction(ticket_pk, notify));
          notify(res?.data?.successMsg, { variant: "success" });
        }
      }
    } catch (err) {
      notify(err.response.data?.detail, { variant: "error" });
    } finally {
      dispatch(stopLoading());
    }
  };

export const deleteSingleUserSupportTicketAction =
  (pk, history, notify) => async (dispatch) => {
    dispatch(startLoading());
    try {
      const res = await axiosInstance.delete(
        `/user_support/tickets/${pk}/delete/`
      );
      if (res.data) {
        if (res?.data?.errorMsg) {
          notify(res?.data?.errorMsg, { variant: "error" });
        } else if (res?.data?.successMsg) {
          history.push("/user-support-ticket");
          dispatch(userSupportTicketListingAction(notify));
          notify(res?.data?.successMsg, { variant: "success" });
        }
      }
    } catch (err) {
      notify(err.response.data?.detail, { variant: "error" });
    } finally {
      dispatch(stopLoading());
    }
  };

export const statusChangeSingleUserSupportTicketAction =
  (pk, status, notify) => async (dispatch) => {
    dispatch(startLoading());
    try {
      const res = await axiosInstance.post(
        `/user_support/tickets/${pk}/review/`,
        {
          status: status,
        }
      );
      if (res.data) {
        if (res?.data?.errorMsg) {
          notify(res?.data?.errorMsg, { variant: "error" });
        } else if (res?.data?.successMsg) {
          dispatch(getSingleUserSupportTicketAction(pk, notify));
          dispatch(userSupportTicketListingAction(notify));
          notify(res?.data?.successMsg, { variant: "success" });
        }
      }
    } catch (err) {
      notify(err.response.data?.detail, { variant: "error" });
    } finally {
      dispatch(stopLoading());
    }
  };

export const updateModuleNameSingleUserSupportTicketAction =
  (pk, data, type, setAnchorElModule, notify) => async (dispatch, getState) => {
    const { subject, description, module_name, ticket_type } = await getState()
      .UserSupportReducer.get_single_ticket;
    const { location, site } = await getState().user;
    dispatch(startLoading());
    try {
      const res = await axiosInstance.put(
        `/user_support/tickets/${pk}/update/`,
        {
          location,
          site,
          subject: type === "subject" ? data : subject,
          description: type === "description" ? data : description,
          module_name: type === "module_name" ? data : module_name,
          ticket_type: type === "ticket_type" ? data : ticket_type,
        }
      );
      if (res.data) {
        if (res?.data?.errorMsg) {
          notify(res?.data?.errorMsg, { variant: "error" });
        } else if (res?.data?.successMsg) {
          if (setAnchorElModule) {
            setAnchorElModule(null);
          }

          dispatch(getSingleUserSupportTicketAction(pk, notify));
          dispatch(userSupportTicketListingAction(notify));
          notify(res?.data?.successMsg, { variant: "success" });
        }
      }
    } catch (err) {
      notify(err.response.data?.detail, { variant: "error" });
    } finally {
      dispatch(stopLoading());
    }
  };

export const createJiraTicketSingleUserSupportTicketAction =
  (pk, notify) => async (dispatch) => {
    dispatch(startLoading());
    try {
      const res = await axiosInstance.get(
        `/user_support/tickets/${pk}/create_jira_ticket/`
      );
      if (res.data) {
        if (res?.data?.errorMsg) {
          notify(res?.data?.errorMsg, { variant: "error" });
        } else if (res?.data?.successMsg) {
          dispatch(getSingleUserSupportTicketAction(pk, notify));
          dispatch(userSupportTicketListingAction(notify));
          notify(res?.data?.successMsg, { variant: "success" });
        }
      }
    } catch (err) {
      notify(err.response.data?.detail, { variant: "error" });
    } finally {
      dispatch(stopLoading());
    }
  };

export const informDropdownUserSupportAction =
  (notify) => async (dispatch, getState) => {
    const { location, site } = await getState().user;

    dispatch(startLoading());
    try {
      const res = await axiosInstance.post("depot/inform_dropdown/", {
        location,
        site,
        get_list: ["location_site_dashboard_list"],
      });

      if (res.data) {
        if (res?.data?.errorMsg) {
          notify(res?.data?.errorMsg, { variant: "error" });
        } else if (res?.data?.successMsg) {
          notify(res?.data?.successMsg, { variant: "success" });
        }
        dispatch({
          type: USER_SUPPORT_CONST.GET_USER_SUPPORT_LOCATION_SITE,
          payload: res.data?.location_site_dashboard_list,
        });
      }
    } catch (error) {
      notify(err?.response?.data?.errorMsg, { variant: "error" });
    } finally {
      dispatch(stopLoading());
    }
  };
