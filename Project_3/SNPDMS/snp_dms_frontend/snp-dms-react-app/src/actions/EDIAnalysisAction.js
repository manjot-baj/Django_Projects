import { axiosInstance } from "../Axios";
import { downloadReport } from "./ReportActions";

export const getEDIAnalysisSuccessAction =
  (notify) => async (dispatch, getState) => {
    const location = await getState().user.location;
    const site = await getState().user.site;
    const { month, line, edi_type } = await getState().EDIAnalysisReducer
      .succesData;

    dispatch({
      type: "GET_SUCCESS_DATA",
      payload: {
        loading: true,
      },
    });
    axiosInstance
      .post("edi/edi_analytics/", {
        location: location,
        site: site,
        month,
        line,
        edi_type,
      })
      .then((res) => {
        if (res.data.errorMsg) {
          notify("Data Not Found", { variant: "error" });
          dispatch({
            type: "GET_SUCCESS_DATA",
            payload: {
              loading: false,
              data: null,
            },
          });
        } else {
          dispatch({
            type: "GET_SUCCESS_DATA",
            payload: {
              loading: false,
              data: Object.values(res.data).map((val, ind) => ({
                ...val,
                date: Object.keys(res.data)[ind],
                "IN/OUT": `${val.in_success_rate}/${val.out_success_rate}`,
              })),
            },
          });
        }
      })
      .catch((err) => {
        console.log("Dashboard Error !", err);
      });
  };

export const getEDIAnalysisBackDatedAction =
  (notify) => async (dispatch, getState) => {
    const location = await getState().user.location;
    const site = await getState().user.site;
    const { month, line, edi_type } = await getState().EDIAnalysisReducer
      .backDated;

    dispatch({
      type: "GET_BACKDATED_DATA",
      payload: {
        loading: true,
      },
    });
    axiosInstance
      .post("edi/edi_backdated_data/", {
        location: location,
        site: site,
        month,
        line,
        edi_type,
      })
      .then((res) => {
        if (res.data.errorMsg) {
          notify("Data Not Found", { variant: "error" });
          dispatch({
            type: "GET_BACKDATED_DATA",
            payload: {
              loading: false,
              data: null,
            },
          });
        } else {
          dispatch({
            type: "GET_BACKDATED_DATA",
            payload: {
              loading: false,
              data: Object.values(res.data).map((val, ind) => ({
                ...val,
                date: Object.keys(res.data)[ind],
                "IN/OUT": `${val.in_success_rate}/${val.out_success_rate}`,
              })),
            },
          });
        }
      })
      .catch((err) => {
        console.log("Dashboard Error !", err);
      });
  };

export const getEDIAnalysisMissingAction =
  (notify) => async (dispatch, getState) => {
    const location = await getState().user.location;
    const site = await getState().user.site;
    const { month, line, edi_type } = await getState().EDIAnalysisReducer
      .missingData;

    dispatch({
      type: "GET_MISSING_DATA",
      payload: {
        loading: true,
      },
    });
    axiosInstance
      .post("edi/edi_missing_data/", {
        location: location,
        site: site,
        month,
        line,
        edi_type,
      })
      .then((res) => {
        if (res.data.errorMsg) {
          notify("Data Not Found", { variant: "error" });
          dispatch({
            type: "GET_MISSING_DATA",
            payload: {
              loading: false,
              data: null,
            },
          });
        } else {
          dispatch({
            type: "GET_MISSING_DATA",
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

export const getEDIAnalysisMoveCodeAction =
  (notify) => async (dispatch, getState) => {
    const location = await getState().user.location;
    const site = await getState().user.site;
    const { month, edi_type, process, type } = await getState()
      .EDIAnalysisReducer.moveCode;

    dispatch({
      type: "GET_MOVE_CODE_DATA",
      payload: {
        loading: true,
      },
    });
    axiosInstance
      .post("edi/edi_move_code_wise_data/", {
        location: location,
        site: site,
        month,
        type,
        edi_type,
        process,
      })
      .then((res) => {
        if (res.data.errorMsg) {
          notify("Data Not Found", { variant: "error" });
          dispatch({
            type: "GET_MOVE_CODE_DATA",
            payload: {
              loading: false,
              data: null,
            },
          });
        } else {
          dispatch({
            type: "GET_MOVE_CODE_DATA",
            payload: {
              loading: false,
              rowMoveCode : getRowMoveCode({type,edi_type,process}),
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


  function getRowMoveCode(data){
    let moveCodeRow =["date"]
    const {type,edi_type,process}=data
    switch (process) {
      case "Factory":
        if (edi_type==="text") {
          type==="Arrived"?moveCodeRow=["date","MTIN","DMG_MT","REP_OUT_MT"]:moveCodeRow=["date","VAN","REP_RET_MT"]
        }else{
          type==="Arrived"?moveCodeRow=["date","MCY","DAM","TBR"]:moveCodeRow=["date","MSH","REP"]
        }
        break;
      case "Road/Rail":
        if (edi_type==="text") {
          type==="Arrived"?moveCodeRow=["date","MOR","MIR","DMG_MT","REP_OUT_MT"]:moveCodeRow=["date","MOR","REP_RET_MT"]
        }else{
          type==="Arrived"?moveCodeRow=["date","MPO","MPI","DAM","TBR"]:moveCodeRow=["date","MPO","REP"]
        }
        break;
      case "CFS/ICD":
        if (edi_type==="text") {
          type==="Arrived"?moveCodeRow=["date","DVAN","MTIN","DMG_MT","REP_OUT_MT"]:moveCodeRow=["date","VAN","REP_RET_MT"]
        }else{
          type==="Arrived"?moveCodeRow=["date","ICO","MCY","DAM","TBR"]:moveCodeRow=["date","MSH","REP"]
        }
        break;
      case "Port/Vessel":
        if (edi_type==="text") {
          type==="Arrived"?moveCodeRow=["date","MOR","MIR","DMG_MT","REP_OUT_MT"]:moveCodeRow=["date","MOR","REP_RET_MT"]
        }else{
          type==="Arrived"?moveCodeRow=["date","MPO","MPI","DAM","TBR"]:moveCodeRow=["date","MPO","REP"]
        }
        break;
      case "FS RETURN":
        if (edi_type==="text") {
          type==="Arrived"?moveCodeRow=["date","RET"]:moveCodeRow=["date","VAN"]
        }else{
          type==="Arrived"?moveCodeRow=["date","ERM"]:moveCodeRow=["date","MSH"]
        }
        break;
      default:
        break;
    }

    return moveCodeRow
  }

export const downloadEDIReportSuccess =
  (notify) => async (dispatch, getState) => {
    const location = await getState().user.location;
    const site = await getState().user.site;
    const { month, edi_type, line } = await getState().EDIAnalysisReducer
      .succesData;

    axiosInstance
      .post(
        "edi/edi_reports/",
        {
          location: location,
          site: site,
          month,
          edi_type,
          line,
        },
        { responseType: "arraybuffer" }
      )
      .then((res) => {
        if (res.data.errorMsg) {
          notify("Data Not Found", { variant: "error" });
        } else {
          downloadReport(res.data, "EDI Success Report");
        }
      })
      .catch((err) => {
        console.log("Dashboard Error !", err);
      });
  };


  export const downloadEDIReportBackDated =
  (notify) => async (dispatch, getState) => {
    const location = await getState().user.location;
    const site = await getState().user.site;
    const { month, edi_type, line } = await getState().EDIAnalysisReducer
      .backDated;

    axiosInstance
      .post(
        "edi/edi_backdated_reports/",
        {
          location: location,
          site: site,
          month,
          edi_type,
          line,
        },
        { responseType: "arraybuffer" }
      )
      .then((res) => {
        if (res.data.errorMsg) {
          notify("Data Not Found", { variant: "error" });
        } else {
          downloadReport(res.data, "EDI Backdated Report");
        }
      })
      .catch((err) => {
        console.log("Dashboard Error !", err);
      });
  };


  
  export const downloadEDIReportMissing =
  (notify) => async (dispatch, getState) => {
    const location = await getState().user.location;
    const site = await getState().user.site;
    const { month, edi_type, line } = await getState().EDIAnalysisReducer
      .missingData;

    axiosInstance
      .post(
        "edi/edi_missing_reports/",
        {
          location: location,
          site: site,
          month,
          edi_type,
          line,
        },
        { responseType: "arraybuffer" }
      )
      .then((res) => {
        if (res.data.errorMsg) {
          notify("Data Not Found", { variant: "error" });
        } else {
          downloadReport(res.data, "EDI Missing Report");
        }
      })
      .catch((err) => {
        console.log("Dashboard Error !", err);
      });
  };

  export const downloadEDIReportMoveCode =
  (notify) => async (dispatch, getState) => {
    const location = await getState().user.location;
    const site = await getState().user.site;
    const { month, edi_type,process ,type} = await getState().EDIAnalysisReducer
      .moveCode;

    axiosInstance
      .post(
        "edi/edi_move_code_reports/",
        {
          location: location,
          site: site,
          month,
          edi_type,
          process,
          type
        },
        { responseType: "arraybuffer" }
      )
      .then((res) => {
        if (res.data.errorMsg) {
          notify("Data Not Found", { variant: "error" });
        } else {
          downloadReport(res.data, "EDI Move Code  Report");
        }
      })
      .catch((err) => {
        console.log("Dashboard Error !", err);
      });
  };