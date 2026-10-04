import axiosInstance from "@/AxiosExtend"
import { SERVEY_REDUCER } from "../reducers/ServeyorReducer";

export const getTariffServeyAction =
  (data, name, notify) => async (dispatch, getState) => {
    const surveydata = await getState().ServeyorReducer;
    if (surveydata?.data?.tariff_id === "nothing") {
      notify("Please add the client name first", { variant: "warning" });
      return;
    } else {
      axiosInstance
        .post("surveyor/surveyor_tarrif/", {
          tariff_id: surveydata?.data?.tariff_id,
          ...data,
        })
        .then((res) => {
          if (res.data[0])
            dispatch({
              type: SERVEY_REDUCER.ADD_TERIFF_DATA,
              payload: { [name]: res.data },
            });
        })
        .catch((err) => {
          notify("Data Load Failed . Try Again", { variant: "error" });
          console.log("Dashboard Error !", err);
        });
    }
  };

export const ContainerPreGateInGetSurveyorAction =
  (container_no, notify, setSurveySearch) => async (dispatch, getState) => {
    const location = await getState().user.location;
    const site = await getState().user.site;
    const surveydata = await getState().ServeyorReducer;
    dispatch({ type: "START_LOADING" });
    axiosInstance
      .post(`depot/pregatein_container_info/`, {
        location,
        site,
        container_no,
      })
      .then((res) => {
        if (res.data.errorMsg) {
          notify(res.data.errorMsg, { variant: "error" });
        } else {
          dispatch({ type: SERVEY_REDUCER.INITIAL_SURVEY });
          delete res.data.pk;
          dispatch({
            type: SERVEY_REDUCER.DATA_CHANGE,
            payload: { line: res.data.shipping_line, ...res.data },
          });
          if(surveydata.inform?.client_data?.find(
            (val) => val.name === res.data.client
          )){
            dispatch({
              type: SERVEY_REDUCER.DATA_CHANGE,
              payload: {
                [`client`]: res.data.client,
                line: surveydata.inform?.client_data?.find(
                  (val) => val.name === res.data.client
                )?.line,
                tariff_id: surveydata.inform?.client_data?.find(
                  (val) => val.name === res.data.client
                )?.tariff_id,
              },
            });
          }else {
            dispatch({
              type: SERVEY_REDUCER.DATA_CHANGE,
              payload: {
                [`client`]: "",
                line: "",
                tariff_id: "",
              },
            });
          }

          setSurveySearch(true);
        }
      })
      .catch((err) => {
        dispatch({ type: "STOP_LOADING" });
        console.error(err);
      });
  };

export const getTariffServeyInformAction =
  (notify) => async (dispatch, getState) => {
    const location = await getState().user.location;
    const site = await getState().user.site;

    axiosInstance
      .post("surveyor/surveyor_inform_dependency/", {
        location,
        site,
      })
      .then((res) => {
        dispatch({
          type: SERVEY_REDUCER.INFORM_ADD,
          payload: res.data,
        });
      })
      .catch((err) => {
        notify("Data Load Failed . Try Again", { variant: "error" });
        console.log("Dashboard Error !", err);
      });
  };

export const getServeyContainerValidation =
  (container_no, notify, imageRef, setShowImage) =>
  async (dispatch, getState) => {
    const location = await getState().user.location;
    const site = await getState().user.site;

    axiosInstance
      .post("surveyor/container_validation/", {
        location,
        site,
        container_no,
      })
      .then((res) => {
        if (res.data.errorMsg) {
          notify(res.data.errorMsg, { variant: "warning" });
          dispatch({
            type: SERVEY_REDUCER.DATA_CHANGE,
            payload: {
              [`container_no`]: "",
            },
          });
        } else if (res.data.pk) {
          notify(`Images not uploaded for ${res.data.container_no} `, {
            variant: "error",
          });
          dispatch({ type: SERVEY_REDUCER.DATA_CHANGE, payload: res.data });
          setShowImage(true);
          imageRef.current.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        } else {
        }
      })
      .catch((err) => {
        console.log("Dashboard Error !", err);
      });
  };

export const uploadServeyAction = (notify) => async (dispatch, getState) => {
  const location = await getState().user.location;
  const site = await getState().user.site;
  const {
    client,
    line,
    container_no,
    manufacturing_date,
    gate_in_date,
    survey_date,
    manufacturing_time,
    gate_in_time,
    survey_time,
    type,
    size,
    tariff_id,
    survey_by,
    gross_wt,
    tare_wt,
    survey_line,
    grade,
    arrived,
  } = await getState().ServeyorReducer.data;

  axiosInstance
    .post("surveyor/add_survey/", {
      client,
      line,
      container_no,
      manufacturing_date,
      gate_in_date,
      survey_date,
      manufacturing_time,
      gate_in_time,
      survey_time,
      type,
      size,
      tariff_id,
      survey_by,
      gross_wt,
      tare_wt,
      survey_line,
      location,
      site,
      grade,
      arrived,
    })
    .then((res) => {
      notify("Data uploaded successfully", { variant: "success" });
      dispatch({
        type: SERVEY_REDUCER.DATA_CHANGE,
        payload: { pk: res.data.surveyor_id },
      });
    })
    .catch((err) => {
      notify("Data Load Failed . Try Again", { variant: "error" });
      console.log("Dashboard Error !", err);
    });
};

export const uploadSurveyImageAction =
  (body, pk, notify, setMobileUpload, setFile, setIsImageUploading) =>
  async (dispatch, getState) => {
    axiosInstance
      .post(`surveyor/surveyor_image_upload/${pk}/`, body,{
        headers:{
          "Content-Type":'multipart/form-data'
        }
      })
      .then((res) => {
        if (res.data.errorMsg) {
          notify(res.data.errorMsg, { variant: "error" });
          setIsImageUploading(false);
        } else {
          notify("Images uploaded successfully ", { variant: "success" });
          dispatch({ type: SERVEY_REDUCER.INITIAL_SURVEY });
          dispatch({ type: SERVEY_REDUCER.DATA_CHANGE, payload: res.data });
          setMobileUpload([]);
          setFile([]);
          setIsImageUploading(false);
        }
      })
      .catch((err) => {
        console.error(err);
        setIsImageUploading(false);
      }).finally(()=>{
        setIsImageUploading(false);
           dispatch({ type: "STOP_LOADING" });
      });
  };

export const searchContainerAction =
  (container_no, notify, setSurveySearch) => async (dispatch, getState) => {
    const location = await getState().user.location;
    const site = await getState().user.site;

    axiosInstance
      .post(`surveyor/get_survey_details/`, {
        container_no,
        location,
        site,
      })
      .then((res) => {
        if (res.data.errorMsg) {
          notify(res.data.errorMsg, { variant: "error" });
        } else {
          dispatch({ type: SERVEY_REDUCER.INITIAL_SURVEY });
          dispatch({ type: SERVEY_REDUCER.DATA_CHANGE, payload: res.data });
          setSurveySearch(true);
        }
      })
      .catch((err) => {
        console.error(err);
      });
  };

export const getContainerListAction = () => async (dispatch, getState) => {
  const location = await getState().user.location;
  const site = await getState().user.site;

  axiosInstance
    .post(`surveyor/get_survey_containers/`, {
      location,
      site,
    })
    .then((res) => {
      dispatch({ type: SERVEY_REDUCER.CONTAINERS_ADD, payload: res.data });
    })
    .catch((err) => {
      console.error(err);
    });
};
