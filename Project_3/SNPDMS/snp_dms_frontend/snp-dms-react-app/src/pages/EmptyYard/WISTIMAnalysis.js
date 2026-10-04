import React, { useCallback, useEffect, useMemo } from "react";
import LayoutContainer from "../../components/reusableComponents/LayoutContainer";
import { Stack } from "@mui/material";
import { Box, makeStyles, Tab, Tabs, Typography } from "@material-ui/core";
import { useHistory } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useSnackbar } from "notistack";
import PropTypes from "prop-types";
import WISTIMAnalysisSearch from "../../components/WISTIMAnalysisSearch";
import { WISTIM_CONST } from "../../reducers/WISTIMAnalysisReducer";
import WISTIMAnalysisTable from "../../components/reusableComponents/WISTIMAnalysisTable";
import {
  DISTIMAnalysisFetchAction,
  downloadEDIReportDistimAction,
  downloadEDIReportEstimateAction,
  WISTIMAnalysisFetchAction,
} from "../../actions/WISTIMAction";
import { dropDownDispatch } from "../../actions/GateInActions";

const useStyles = makeStyles((theme) => ({
  container: {
    backgroundColor: "transparent",
    padding: "16px 12px",

    borderRadius: "4px",
    width: "100%",
    height: "100%",
    overflow: "auto",
  },
  backImage: {
    height: 40,
    width: 40,
    marginBottom: 15,
    cursor: "pointer",
  },
}));

function CustomTabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

CustomTabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
};

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  };
}

const rowEstimate = [
  "date",
  "gate_in",
  "estimate_wistim",
  "response_distim",
  "repair_distim",

];

const rowDistim = ["date", "gate_in", "wistim", "approved", "repair"];

const WISTIMAnalysis = () => {
  const classes = useStyles();
  const history = useHistory();
  const notify = useSnackbar().enqueueSnackbar;
  const dispatch = useDispatch();
  const { WISTIMAnalysisReducer } = useSelector((state) => state);
  const [tabValue, setTabValue] = React.useState(0);
  const memoRowEstimate = useMemo(() => rowEstimate, []);
  const memoRowDistim = useMemo(() => rowDistim, []);

  const fetchEstimateData = useCallback(
    () => dispatch(WISTIMAnalysisFetchAction(notify)),
    [WISTIMAnalysisReducer.estimateWestim, notify]
  );

  const fetchDistimData = useCallback(
    () => dispatch(DISTIMAnalysisFetchAction(notify)),
    [WISTIMAnalysisReducer.repairDistim, notify]
  );

  useEffect(() => {
    let reqArray = ["client_ref_codes"];
    dispatch(dropDownDispatch(reqArray, notify, true));
    fetchEstimateData();
    fetchDistimData();
  }, []);

  const handleChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleWISTIMLINEchange = useCallback((event) => {
    dispatch({
      type: WISTIM_CONST.WISTIM_ESTIMATE,
      payload: {
        line: event.target.value,
      },
    });
    fetchEstimateData();
  }, []);

  const handleDISTIMLINEchange = useCallback((event) => {
    dispatch({
      type: WISTIM_CONST.DISTIM_REPAIR,
      payload: {
        line: event.target.value,
      },
    });
    fetchDistimData();
  }, []);

  const handleWISTIMmonthChange = useCallback((event) => {
    dispatch({
      type: WISTIM_CONST.WISTIM_ESTIMATE,
      payload: {
        month: event.target.value,
      },
    });
    fetchEstimateData();
  }, []);

  const handleDISTIMMmonthChange = useCallback((event) => {
    dispatch({
      type: WISTIM_CONST.DISTIM_REPAIR,
      payload: {
        month: event.target.value,
      },
    });
    fetchDistimData();
  }, []);

  const handleRefresh = useCallback((type) => {
    switch (type) {
      case "estimate":
        dispatch({
          type: WISTIM_CONST.WISTIM_ESTIMATE_INIT,
        });
        fetchEstimateData();
        break;
      case "distim":
        dispatch({
          type: WISTIM_CONST.DISTIM_REPAIR_INIT,
        });
        fetchDistimData();
        break;

      default:
        break;
    }
  }, []);

  const handleDownloadReportEstimate = useCallback(() => {
    dispatch(downloadEDIReportEstimateAction(notify));
  }, []);

  const handleDownloadReportDistim = useCallback(() => {
    dispatch(downloadEDIReportDistimAction(notify));
  }, []);

  return (
    <LayoutContainer footer={false}>
      <Box marginTop={4} overflow={"hidden"} >
        <CustomTabPanel value={tabValue} index={0}>
          <WISTIMAnalysisSearch
            handleMonthChange={handleWISTIMmonthChange}
            handleLineChange={handleWISTIMLINEchange}
            selectedLine={WISTIMAnalysisReducer.estimateWestim.line}
            selectedMonth={WISTIMAnalysisReducer.estimateWestim.month}
            heading={"Estimate Westim And Repair Destim"}
            handleRefresh={() => handleRefresh("estimate")}
            handleDownloadReport={handleDownloadReportEstimate}
            tabValue={tabValue}
            handleChange={handleChange}
            a11yProps={a11yProps}
            reportFileName="Download Report"
          />
          <WISTIMAnalysisTable
            rowArray={memoRowEstimate}
            masterArray={WISTIMAnalysisReducer.estimateWestim.data}
            loading={WISTIMAnalysisReducer.estimateWestim.loading}
            distim={false}
          />
        </CustomTabPanel>
        <CustomTabPanel value={tabValue} index={1}>
          <WISTIMAnalysisSearch
            handleMonthChange={handleDISTIMMmonthChange}
            handleLineChange={handleDISTIMLINEchange}
            selectedLine={WISTIMAnalysisReducer.repairDistim.line}
            selectedMonth={WISTIMAnalysisReducer.repairDistim.month}
            heading={"Repair Distim"}
            handleRefresh={() => handleRefresh("distim")}
            handleDownloadReport={handleDownloadReportDistim}
            tabValue={tabValue}
            handleChange={handleChange}
            a11yProps={a11yProps}
            reportFileName={"Download Report"}
          />
          <WISTIMAnalysisTable
            rowArray={memoRowDistim}
            masterArray={WISTIMAnalysisReducer.repairDistim.data}
            loading={WISTIMAnalysisReducer.repairDistim.loading}
            distim={true}
          />
        </CustomTabPanel>
      </Box>
    </LayoutContainer>
  );
};

export default WISTIMAnalysis;
