import React, { useCallback, useEffect } from "react";
import LayoutContainer from "../../components/reusableComponents/LayoutContainer";
import { useHistory } from "react-router-dom";
import {
  Tab,
  Tabs,
  Typography,
  Box,
  makeStyles,
  useMediaQuery,
} from "@material-ui/core";
import AutomationTable from "../../components/reusableComponents/AutomationTable.";
import { useDispatch, useSelector } from "react-redux";
import PropTypes from "prop-types";
import {
  downloadEDIReportBackDated,
  downloadEDIReportMissing,
  downloadEDIReportMoveCode,
  downloadEDIReportSuccess,
  getEDIAnalysisBackDatedAction,
  getEDIAnalysisMissingAction,
  getEDIAnalysisMoveCodeAction,
  getEDIAnalysisSuccessAction,
} from "../../actions/EDIAnalysisAction";
import { useSnackbar } from "notistack";

import EDIAnalysisSearch from "../../components/EDIAnalysisSearch";
import { Stack } from "@mui/material";
import { dropDownDispatch } from "../../actions/GateInActions";

const drawerWidth = 220;

const useStyles = makeStyles((theme) => ({
  container: {
    backgroundColor: "transparent",
    padding: "16px 12px",

    borderRadius: "4px",
    width: "100%",
    height: "100%",
    overflow: "auto",
  },
  tabsStyle: {
    height: "50px",
    [theme.breakpoints.down("sm")]: {
      height: "120px",
      "& .MuiTabs-flexContainer": {
        flexWrap: "wrap",
      },
      "& .MuiTabs-indicator": {
        display: "none !important",
      },
    },
    "& .MuiTabs-indicator": {
      display: "none !important",
    },
  },
  backImage: {
    height: 40,
    width: 40,
    marginBottom: 15,
    cursor: "pointer",
  },
  tabNew: {
    border: "2px solid #2a5fa5 ",
    color: "black",
    fontWeight: "bold",
    borderRadius: "5px",
    marginRight: "20px",
    "&.Mui-selected": {
      backgroundColor: "#2a5fa5",
      border: "none",
      color: "white",
      fontWeight: "bold",
    },
    [theme.breakpoints.down("sm")]: {
      marginTop:"12px"
    },
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

const rowSuccess = [
  "date",
  "in_count",
  "in_edi_sent_count",
  "out_count",
  "out_edi_sent_count",
  "IN/OUT",
];

const rowSuccessMissing = ["date", "in_count", "out_count"];

const EdiAnalysis = () => {
  const classes = useStyles();
  const history = useHistory();
  const notify = useSnackbar().enqueueSnackbar;
  const { EDIAnalysisReducer } = useSelector((state) => state);
  const dispatch = useDispatch();
  const [tabValue, setTabValue] = React.useState(0);
  const matchesIphone = useMediaQuery("(max-width:500px)");

  const fetchSuccessData = useCallback(
    () => dispatch(getEDIAnalysisSuccessAction(notify)),
    [EDIAnalysisReducer.succesData, notify]
  );
  const fetchbackData = useCallback(
    () => dispatch(getEDIAnalysisBackDatedAction(notify)),
    [EDIAnalysisReducer.backDated, notify]
  );
  const fetchMissingData = useCallback(
    () => dispatch(getEDIAnalysisMissingAction(notify)),
    [EDIAnalysisReducer.missingData, notify]
  );
  const fetchMoveCodeData = useCallback(
    () => dispatch(getEDIAnalysisMoveCodeAction(notify)),
    [EDIAnalysisReducer.moveCode, notify]
  );

  const handleChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleMonthChange = (event) => {
    dispatch({
      type: "GET_SUCCESS_DATA",
      payload: {
        month: event.target.value,
      },
    });
    fetchSuccessData();
  };

  const handleBackMonthChange = (event) => {
    dispatch({
      type: "GET_BACKDATED_DATA",
      payload: {
        month: event.target.value,
      },
    });
    fetchbackData();
  };

  const handleMissingMonthChange = (event) => {
    dispatch({
      type: "GET_MISSING_DATA",
      payload: {
        month: event.target.value,
      },
    });
    fetchMissingData();
  };

  const handleMoveCodeMonthChange = (event) => {
    dispatch({
      type: "GET_MOVE_CODE_DATA",
      payload: {
        month: event.target.value,
      },
    });
    fetchMoveCodeData();
  };

  const handleTypeChange = (event) => {
    dispatch({
      type: "GET_SUCCESS_DATA",
      payload: {
        edi_type: event.target.value,
      },
    });
    fetchSuccessData();
  };

  const handleBackTypeChange = (event) => {
    dispatch({
      type: "GET_BACKDATED_DATA",
      payload: {
        edi_type: event.target.value,
      },
    });
    fetchbackData();
  };

  const handleMissingTypeChange = (event) => {
    dispatch({
      type: "GET_MISSING_DATA",
      payload: {
        edi_type: event.target.value,
      },
    });
    fetchMissingData();
  };

  const handleMoveCodeTypeChange = (event) => {
    dispatch({
      type: "GET_MOVE_CODE_DATA",
      payload: {
        edi_type: event.target.value,
      },
    });
    fetchMoveCodeData();
  };

  const handleLineChange = (event) => {
    dispatch({
      type: "GET_SUCCESS_DATA",
      payload: {
        line: event.target.value,
      },
    });
    fetchSuccessData();
  };

  const handleBackLineChange = (event) => {
    dispatch({
      type: "GET_BACKDATED_DATA",
      payload: {
        line: event.target.value,
      },
    });
    fetchbackData();
  };

  const handleMisssingLineChange = (event) => {
    dispatch({
      type: "GET_MISSING_DATA",
      payload: {
        line: event.target.value,
      },
    });
    fetchMissingData();
  };

  const handleProcessChange = (event) => {
    dispatch({
      type: "GET_MOVE_CODE_DATA",
      payload: {
        process: event.target.value,
      },
    });
    fetchMoveCodeData();
  };

  const handleMoveTypeChange = (event) => {
    dispatch({
      type: "GET_MOVE_CODE_DATA",
      payload: {
        type: event.target.value,
      },
    });
    fetchMoveCodeData();
  };

  const handleDownloadReportSuccess = () => {
    dispatch(downloadEDIReportSuccess());
  };

  const handleDownloadReportBackdated = () => {
    dispatch(downloadEDIReportBackDated());
  };

  const handleDownloadReportMissing = () => {
    dispatch(downloadEDIReportMissing());
  };

  const handleDownloadReportMoveCode = () => {
    dispatch(downloadEDIReportMoveCode());
  };

  const handleRefresh = (type) => {
    switch (type) {
      case "success":
        dispatch({
          type: "GET_SUCCESS_INITIAL",
        });
        fetchSuccessData();
        break;
      case "back":
        dispatch({
          type: "GET_BACK_INITIAL",
        });
        fetchbackData();
        break;
      case "missing":
        dispatch({
          type: "GET_MISSING_INITIAL",
        });
        fetchMissingData();
        break;
      case "move_code":
        dispatch({
          type: "GET_MOVE_CODE_INITIAL",
        });
        fetchMoveCodeData();
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    let reqArray = ["client_ref_codes"];
    dispatch(dropDownDispatch(reqArray, notify, true));
    fetchSuccessData();
    fetchbackData();
    fetchMissingData();
    fetchMoveCodeData();
  }, []);

  return (
    <LayoutContainer footer={false}>
      <Stack
        flexDirection={matchesIphone ? "column" : "row"}
        direction={matchesIphone ? "column" : "row"}
        alignItems={"center"}
        justifyContent={"space-between"}
        alignContent={matchesIphone ? "flex-start" : "center"}
        spacing={2}
        marginLeft={2}
      >
        <Stack
          flexDirection={"row"}
          alignItems={"center"}
          justifyContent={"flex-start"}
          alignContent={"center"}
          spacing={2}
        >
          <Typography
            variant="h6"
            style={{
              paddingTop: 12,
              paddingBottom: 14,

              color: "black",
              marginTop: 10,
              borderTopLeftRadius: 5,
              borderTopRightRadius: 5,
            }}
          >
            <Box fontWeight="fontWeightBold" m={1}>
              EDI Analysis
            </Box>
          </Typography>
        </Stack>
        <Stack
          flexDirection={"row"}
          alignItems={"center"}
          justifyContent={"center"}
          alignContent={"center"}
        >
          <Tabs
            value={tabValue}
            onChange={handleChange}
            aria-label="basic tabs example"
            className={classes.tabsStyle}
          >
            <Tab
              className={classes.tabNew}
              label="On Dated"
              {...a11yProps(0)}
            />
            <Tab
              className={classes.tabNew}
              label="Backdated"
              {...a11yProps(1)}
            />
            <Tab
              className={classes.tabNew}
              label="Missing Data"
              {...a11yProps(2)}
            />
            <Tab
              className={classes.tabNew}
              label="Move Code "
              {...a11yProps(3)}
            />
          </Tabs>
        </Stack>
        <Stack
          flexDirection={"row"}
          alignItems={"center"}
          justifyContent={"flex-start"}
          alignContent={"center"}
        ></Stack>
      </Stack>
      <Box marginTop={4}></Box>

      <CustomTabPanel value={tabValue} index={0}>
        <EDIAnalysisSearch
          handleMonthChange={handleMonthChange}
          loadingData={EDIAnalysisReducer.succesData.loading}
          handleTypeChange={handleTypeChange}
          handleLineChange={handleLineChange}
          selectedLine={EDIAnalysisReducer.succesData.line}
          selectedMonth={EDIAnalysisReducer.succesData.month}
          selectedEDIType={EDIAnalysisReducer.succesData.edi_type}
          heading="On Dated"
          handleRefresh={() => handleRefresh("success")}
          edi={true}
          handleDownloadReport={handleDownloadReportSuccess} //
        />

        <AutomationTable
          rowArray={rowSuccess}
          masterArray={EDIAnalysisReducer.succesData.data ?? []}
          edi={true}
          loading={EDIAnalysisReducer.succesData.loading}
        />
      </CustomTabPanel>
      <CustomTabPanel value={tabValue} index={1}>
        <EDIAnalysisSearch
          handleMonthChange={handleBackMonthChange}
          loadingData={EDIAnalysisReducer.backDated.loading}
          handleTypeChange={handleBackTypeChange}
          handleLineChange={handleBackLineChange}
          selectedLine={EDIAnalysisReducer.backDated.line}
          selectedMonth={EDIAnalysisReducer.backDated.month}
          selectedEDIType={EDIAnalysisReducer.backDated.edi_type}
          heading="Backdated Data EDI"
          edi={true}
          handleDownloadReport={handleDownloadReportBackdated}
          handleRefresh={() => handleRefresh("back")}
        />
        <AutomationTable
          rowArray={rowSuccess}
          masterArray={EDIAnalysisReducer.backDated.data ?? []}
          edi={true}
        />
      </CustomTabPanel>
      <CustomTabPanel value={tabValue} index={2}>
        <EDIAnalysisSearch
          handleMonthChange={handleMissingMonthChange}
          loadingData={EDIAnalysisReducer.missingData.loading}
          handleTypeChange={handleMissingTypeChange}
          handleLineChange={handleMisssingLineChange}
          selectedLine={EDIAnalysisReducer.missingData.line}
          selectedMonth={EDIAnalysisReducer.missingData.month}
          selectedEDIType={EDIAnalysisReducer.missingData.edi_type}
          heading="Missing Data"
          edi={true}
          handleDownloadReport={handleDownloadReportMissing}
          handleRefresh={() => handleRefresh("missing")}
        />
        <AutomationTable
          rowArray={rowSuccessMissing}
          masterArray={EDIAnalysisReducer.missingData.data ?? []}
          edi={true}
        />
      </CustomTabPanel>
      <CustomTabPanel value={tabValue} index={3}>
        <EDIAnalysisSearch
          handleMonthChange={handleMoveCodeMonthChange}
          loadingData={EDIAnalysisReducer.moveCode.loading}
          handleTypeChange={handleMoveCodeTypeChange}
          handleLineChange={handleMisssingLineChange}
          selectedLine={EDIAnalysisReducer.moveCode.line}
          selectedMonth={EDIAnalysisReducer.moveCode.month}
          selectedEDIType={EDIAnalysisReducer.moveCode.edi_type}
          heading="Move Code "
          handleRefresh={() => handleRefresh("move_code")}
          moveCode={true}
          selectedProcess={EDIAnalysisReducer.moveCode.process}
          handleProcessChange={handleProcessChange}
          selectedMoveType={EDIAnalysisReducer.moveCode.type}
          handleMoveTypeChange={handleMoveTypeChange}
          edi
          handleDownloadReport={handleDownloadReportMoveCode}
        />
        <AutomationTable
          rowArray={EDIAnalysisReducer.moveCode.rowMoveCode}
          masterArray={EDIAnalysisReducer.moveCode.data ?? []}
          edi={true}
          moveCode={true}
        />
      </CustomTabPanel>
    </LayoutContainer>
  );
};

export default EdiAnalysis;
