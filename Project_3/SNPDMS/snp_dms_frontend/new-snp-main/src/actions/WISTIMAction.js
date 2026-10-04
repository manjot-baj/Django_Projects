import axiosInstance from "@/AxiosExtend"
import { WISTIM_CONST } from "../reducers/WISTIMAnalysisReducer";
import { downloadFileReusable } from "../utils/Utils";

export const WISTIMAnalysisFetchAction =
  (notify) => async (dispatch, getState) => {
    const location = await getState().user.location;
    const site = await getState().user.site;
    const { month, line } = await getState().WISTIMAnalysisReducer
      .estimateWestim;

    dispatch({
      type: WISTIM_CONST.WISTIM_ESTIMATE,
      payload: {
        loading: true,
      },
    });
    axiosInstance
      .post("edi/estimate_westim_analytics/", {
        location: location,
        site: site,
        month,
        line,
      })
      .then((res) => {
        if (res.data.errorMsg) {
          notify("Data Not Found", { variant: "error" });
          dispatch({
            type: WISTIM_CONST.WISTIM_ESTIMATE,
            payload: {
              loading: false,
              data: null,
            },
          });
        } else {
          dispatch({
            type: WISTIM_CONST.WISTIM_ESTIMATE,
            payload: {
              loading: false,
              data: Object.values(res.data).map((val, ind) => ({
                ...val,
                date: Object.keys(res.data)[ind],
              })),
            },
          });
        }
      })
      .catch((err) => {
        console.log("Dashboard Error !", err);
      });
  };



  export const DISTIMAnalysisFetchAction =
  (notify) => async (dispatch, getState) => {
    const location = await getState().user.location;
    const site = await getState().user.site;
    const { month, line } = await getState().WISTIMAnalysisReducer
      .repairDistim;

    dispatch({
      type: WISTIM_CONST.DISTIM_REPAIR,
      payload: {
        loading: true,
      },
    });
    axiosInstance
      .post("edi/repair_distim_analytics/", {
        location: location,
        site: site,
        month,
        line,
      })
      .then((res) => {
        if (res.data.errorMsg) {
          notify("Data Not Found", { variant: "error" });
          dispatch({
            type: WISTIM_CONST.DISTIM_REPAIR,
            payload: {
              loading: false,
              data: null,
            },
          });
        } else {
          dispatch({
            type: WISTIM_CONST.DISTIM_REPAIR,
            payload: {
              loading: false,
              data: Object.values(res.data).map((val, ind) => ({
                ...val,
                date: Object.keys(res.data)[ind],
              })),
            },
          });
        }
      })
      .catch((err) => {
        console.log("Dashboard Error !", err);
      });
  };


  export const downloadEDIReportEstimateAction =
  (notify) => async (dispatch, getState) => {
    const location = await getState().user.location;
    const site = await getState().user.site;
    const { month,  line } = await getState().WISTIMAnalysisReducer
      .estimateWestim;

    axiosInstance
      .post(
        "edi/estimate_westim_reports/",
        {
          location: location,
          site: site,
          month,
          line,
        },
        { responseType: "arraybuffer" }
      )
      .then((res) => {
        if (res.data.errorMsg) {
          notify("Data Not Found", { variant: "error" });
        } else {
          downloadFileReusable(res.data, "Estimate Westim And Repair Destim EDI Report","application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;");
        }
      })
      .catch((err) => {
        console.log("Dashboard Error !", err);
      });
  };


  export const downloadEDIReportDistimAction =
  (notify) => async (dispatch, getState) => {
    const location = await getState().user.location;
    const site = await getState().user.site;
    const { month,  line } = await getState().WISTIMAnalysisReducer
      .repairDistim;

    axiosInstance
      .post(
        "edi/repair_distim_reports/",
        {
          location: location,
          site: site,
          month,
          line,
        },
        { responseType: "arraybuffer" }
      )
      .then((res) => {
        if (res.data.errorMsg) {
          notify("Data Not Found", { variant: "error" });
        } else {
          downloadFileReusable(res.data, "Westim And Destim hr EDI Report","application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;");
        }
      })
      .catch((err) => {
        console.log("Dashboard Error !", err);
      });
  };

