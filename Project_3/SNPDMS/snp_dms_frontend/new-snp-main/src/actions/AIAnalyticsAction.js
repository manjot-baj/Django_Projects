import { axiosInstance } from "@/Axios";
import { startLoading, stopLoading } from "./UIActions";
import { AI_ANALYTICS_CONST } from "@/reducers/AIAnalyticsReducer";

export const aiAnalyticsQueryAction =
  (formData, setPrompt, setFiles, notify) => async (dispatch) => {
    dispatch(startLoading());
    try {
      const res = await axiosInstance.post(
        "/analytics_with_llm/add_analytics_request/",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      if (res.data) {
        if (res.data?.errorMsg) {
          notify(res.data.errorMsg, { variant: "error" });
        } else {
          if (res.data?.successMsg) {
            notify(res.data.successMsg, { variant: "success" });
          }
          setPrompt("");
          setFiles([]);
          dispatch(getAiAnalyticsListingAction(notify))

        }
      }
    } catch (err) {
      notify(err.response?.data?.errorMsg, { variant: "error" });
    } finally {
      dispatch(stopLoading());
    }
  };

export const getAiAnalyticsListingAction =
  (notify) => async (dispatch, getState) => {
    const { status, processed, from_date, to_date } = await getState()
      .AIAnalyticsReducer.ai_analytics_filter;
    dispatch(startLoading());
    try {
      const res = await axiosInstance.post(
        "/analytics_with_llm/analytics_request_list/",
        {
          status,
          processed,
          from_date,
          to_date,
        }
      );
      if (res.data) {
        if (res.data?.errorMsg) {
          notify(res.data.errorMsg, { variant: "error" });
        } else {
          if (res.data?.successMsg) {
            notify(res.data.successMsg, { variant: "success" });
          }
          dispatch({
            type:AI_ANALYTICS_CONST.AI_ANALYTICS_LISTING,
            payload:res.data
          })
        }
      }
    } catch (err) {
      notify(err.response?.data?.errorMsg, { variant: "error" });
    } finally {
      dispatch(stopLoading());
    }
  };


  export const getSingleAiAnalyticsDataAction =
  (pk,notify) => async (dispatch, getState) => {

    dispatch(startLoading());
    try {
      const res = await axiosInstance.get(
        `/analytics_with_llm/analytics_request_list/${pk}/`
      );
      if (res.data) {
        if (res.data?.errorMsg) {
          notify(res.data.errorMsg, { variant: "error" });
        } else {
          if (res.data?.successMsg) {
            notify(res.data.successMsg, { variant: "success" });
          }
          dispatch({
            type:AI_ANALYTICS_CONST.AI_ANALYTICS_DATA,
            payload:res.data
          })
        }
      }
    } catch (err) {
      notify(err.response?.data?.errorMsg, { variant: "error" });
    } finally {
      dispatch(stopLoading());
    }
  };
