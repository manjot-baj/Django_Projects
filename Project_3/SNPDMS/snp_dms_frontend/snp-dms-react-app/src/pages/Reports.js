import React, { useState, useEffect } from "react";
import {
  makeStyles,
  Typography,
  Paper,
  Grid,
  Button,
  TextField,
  MenuItem,
  Backdrop,
  CircularProgress,
} from "@material-ui/core";

import LayoutContainer from "../components/reusableComponents/LayoutContainer";
import DatePickerField from "../components/reusableComponents/DatePickerField";
import { useDispatch, useSelector } from "react-redux";
import { dropDownDispatch } from "../actions/GateInActions";
import { downloadReports } from "../actions/ReportActions";
import CustomTextfield from "../components/reusableComponents/GateInTextField";
import { useSnackbar } from "notistack";
import { theme } from "../App";
import Autocomplete from "@material-ui/lab/Autocomplete";
import { Stack, ToggleButtonGroup, ToggleButton } from "@mui/material";

const useStyles = makeStyles((theme) => ({
  paperContainer: {
    padding: theme.spacing(4, 3),
  },
  LabelTypography: {
    fontSize: 14,
    fontWeight: 600,
    color: "#243545",
    paddingBottom: 4,
    [theme.breakpoints.down("sm")]: {
      paddingBottom: 1,
    },
  },
  button: {
    fontSize: 12.5,
    borderRadius: 6,
    marginLeft: "auto",
    marginRight: "auto",
    marginTop: 20,
    width: "35%",
    border: "1.5px solid #2A5FA5",
    boxShadow: "0px 3px 6px #9199A14D",
    backgroundColor: "#2A5FA5",
    color: "#fff",
    "&:hover": {
      backgroundColor: "#2A5FA5",
    },
  },
  input: {
    padding: 8,
  },
  textField: {
    "& .MuiOutlinedInput-root": {
      "& fieldset": {
        borderColor: "#243545",
      },
    },
  },
  autocomplete: {
    "& .MuiAutocomplete-inputRoot[class*='MuiOutlinedInput-root']": {
      padding: 0,
    },
  },
  backdrop: {
    zIndex: theme.zIndex.drawer + 1,
    color: "#fff",
  },
  togglebutton: {
    "&.MuiToggleButtonGroup-root": {
      backgroundColor: "transparent",
      borderRadius: "6px",
      color: "white",
      "& .MuiToggleButtonGroup-grouped:not(:first-of-type).Mui-selected": {
        borderLeft: "2px solid  #2A5FA5"
      },
      "& .Mui-selected ": {
        backgroundColor: "#2A5FA5",
        color: "white",
        borderRadius: "6px",
        border: "none",
        fontWeight: "bolder",

        zIndex: 10
      },
      "& .Mui-selected:hover": {
        backgroundColor: "#2A5FA5",
        color: "white",
        fontWeight: "bolder",


      },
      "& .Mui-disabled": {
        backgroundColor: "white",
        color: "black",
        border: "none",
        borderRadius: "6px",
      },
    },
  },
}));

export default function Reports() {
  const classes = useStyles();
  const dispatch = useDispatch();
  const store = useSelector((state) => state);
  const { gateIn, user, ui } = store;
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [fromTime, setFromTime] = useState("");
  const [toTime, setToTime] = useState("");
  const [line, setLine] = useState("");
  const [report, setReport] = useState("");
  const [location] = useState(user.location ? user.location : "");
  const [site] = useState(user.site ? user.site : "");
  const [loader, setLoader] = useState(false);
  const [alignment, setAlignment] = React.useState("Report");
  const [container, setContainer] = useState("");
  const notify = useSnackbar().enqueueSnackbar;

  useEffect(() => {
    let reqArray = ["client_ref_codes"];
    dispatch(dropDownDispatch(reqArray, notify));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFromDateChange = (date) => {
    var selectedDate = new Date(date);
    var dd = String(selectedDate.getDate()).padStart(2, "0");
    var mm = String(selectedDate.getMonth() + 1).padStart(2, "0"); //
    var yyyy = selectedDate.getFullYear();
    var selectedDateFormat = yyyy + "-" + mm + "-" + dd;
    setFromDate(selectedDateFormat);
  };

  const handleToDateChange = (date) => {
    var selectedDate = new Date(date);
    var dd = String(selectedDate.getDate()).padStart(2, "0");
    var mm = String(selectedDate.getMonth() + 1).padStart(2, "0"); //
    var yyyy = selectedDate.getFullYear();
    var selectedDateFormat = yyyy + "-" + mm + "-" + dd;
    setToDate(selectedDateFormat);
  };

  const downloadReport = () => {
    if (line === "")
      notify("Please Enter Line", {
        variant: "warning",
      });
    else if (report === "")
      notify("Please Enter Report Type", {
        variant: "warning",
      });
    else if (fromDate !== "" && toDate === "")
      notify("Please Enter To Date", {
        variant: "warning",
      });
    else if (fromTime !== "" && toTime === "")
      notify("Please Enter To Time", {
        variant: "warning",
      });
    else if (alignment === "FTP" && (container === "" && (fromDate === "" && toDate === "")))
      notify("Please Enter Container or Date ", {
        variant: "warning",
      });
    else {
      let data = {
        from_date: fromDate,
        to_date: toDate,
        from_time: fromTime,
        to_time: toTime,
        line: line,
        report: report,
        location: location,
        site: site,
        download_and_upload_to_ftp: null,
        container_no: alignment === "FTP" ? (container.length > 0 ? container.split(",") : []) : [],
      };

      dispatch(downloadReports(data, setLoader, notify));
    }
  };

  const downloadFTP = () => {
    if (line === "")
      notify("Please Enter Line", {
        variant: "warning",
      });
    else if (report === "")
      notify("Please Enter Report Type", {
        variant: "warning",
      });
    else if (fromDate !== "" && toDate === "")
      notify("Please Enter To Date", {
        variant: "warning",
      });
    else if (fromTime !== "" && toTime === "")
      notify("Please Enter To Time", {
        variant: "warning",
      });
    else if (container === "" && (fromDate === "" && toDate === ""))
      notify("Please Enter Container", {
        variant: "warning",
      });
    else {
      let data = {
        from_date: fromDate,
        to_date: toDate,
        from_time: fromTime,
        to_time: toTime,
        line: "MSC",
        report: report,
        download_and_upload_to_ftp: true,
        container_no: container.length > 0 ? container.split(",") : [],
        location: location,
        site: site,
      };

      dispatch(downloadReports(data, setLoader, notify));
    }
  };

  const handleChange = (event, newAlignment) => {
    setAlignment(newAlignment);
  };

  const handleFromTime = (event) => {
    setFromTime(event.target.value);
  };

  const handleToTime = (event) => {
    setToTime(event.target.value);
  };

  const handleContainerChange = (event) => {
    setContainer(event.target.value);
  };

  const handleTabClick = () => {
    setReport("");
    setLine("")
  }

  const handleTabClickMSC = () => {

    setReport("");
    setLine("MSC")
  }

  return (
    <LayoutContainer footer={false}>
      <div>
        <Stack
          direction={"row"}
          justifyContent={"space-between"}
          marginBottom={"20px"}
        >
          <Typography variant="h6" style={{ fontWeight: "bold" }}>
            Download Reports
          </Typography>
          <ToggleButtonGroup
            color="primary"
            value={alignment}
            exclusive
            onChange={handleChange}
            className={classes.togglebutton}
            aria-label="Platform"
          >
            <ToggleButton value="Report" onClick={handleTabClick} style={{ fontSize: "12px", }}>Report</ToggleButton>
            <ToggleButton value="FTP" onClick={handleTabClickMSC} style={{ fontSize: "12px", }}>MSC EXCEL EDI FTP UPLOAD</ToggleButton>
          </ToggleButtonGroup>
        </Stack>

        <Paper className={classes.paperContainer} elevation={0}>
          <Grid container spacing={4}>
            <Grid
              item
              xs={12}
              sm={3}
              style={theme.breakpoints.down("sm") && { padding: 7 }}
            >
              <Typography
                variant="subtitle1"
                className={classes.LabelTypography}
              >
                From Date
              </Typography>

              <DatePickerField
                dateId="manufacturing-date"
                dateValue={fromDate}
                dateChange={handleFromDateChange}
              />
            </Grid>
            <Grid
              item
              xs={12}
              sm={3}
              style={theme.breakpoints.down("sm") && { padding: 7 }}
            >
              <Typography
                variant="subtitle1"
                className={classes.LabelTypography}
              >
                To Date
              </Typography>

              <DatePickerField
                dateId="manufacturing-date"
                dateValue={toDate}
                dateChange={handleToDateChange}
              />
            </Grid>
            <Grid
              item
              xs={12}
              sm={3}
              style={theme.breakpoints.down("sm") && { padding: 7 }}
            >
              <Typography
                variant="subtitle1"
                className={classes.LabelTypography}
              >
                From Time
              </Typography>

              <CustomTextfield
                id="from-time"
                type="time"
                value={fromTime}
                handleChange={handleFromTime}
                readOnlyP={(fromDate === "" || toDate === "") && true}
                dispatchType={"SET_REPORT_FROM_TIME"}
              />
            </Grid>
            <Grid
              item
              xs={12}
              sm={3}
              style={theme.breakpoints.down("sm") && { padding: 7 }}
            >
              <Typography
                variant="subtitle1"
                className={classes.LabelTypography}
              >
                To Time
              </Typography>

              <CustomTextfield
                id="from-time"
                type="time"
                value={toTime}
                handleChange={handleToTime}
                readOnlyP={
                  (fromDate === "" || toDate === "" || fromTime === "") && true
                }
                dispatchType={"SET_REPORT_TO_TIME"}
              />
            </Grid>
            <Grid
              item
              xs={12}
              sm={3}
              style={theme.breakpoints.down("sm") && { padding: 7 }}
            >
              <Typography
                variant="subtitle1"
                className={classes.LabelTypography}
              >
                Line
              </Typography>



              <Autocomplete
                id="report-line"
                freeSolo={true}
                value={alignment === "FTP" ? "MSC" : line}
                noOptionsText="No Reports Available"
                options={alignment !== "FTP" ?
                  (gateIn?.allDropDown &&
                    gateIn?.allDropDown?.report_shipping_lines &&
                    gateIn?.allDropDown?.report_shipping_lines) : ["MSC"]
                }
                getOptionLabel={(option) => option}
                style={{ padding: 0 }}
                className={classes.autocomplete}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    autoComplete="off"
                    value={alignment === "FTP" ? "MSC" : line}
                    className={classes.textField}

                    onBlur={(e) => {
                      setLine(e.target.value);
                    }}
                    fullWidth
                    variant="outlined"
                  />
                )}
              />
            </Grid>
            <Grid
              item
              xs={12}
              sm={3}
              style={theme.breakpoints.down("sm") && { padding: 7 }}
            >
              <Typography
                variant="subtitle1"
                className={classes.LabelTypography}
              >
                Report Type
              </Typography>

              {user.type === "DEPOT" || user.type === null ? (
                alignment === "FTP" ? (
                  <TextField
                    id="report-type"
                    select
                    value={report}
                    variant="outlined"
                    fullWidth
                    inputProps={{ className: classes.input }}
                    onChange={(e) => {
                      setReport(e.target.value);
                    }}
                  >
                    <MenuItem
                      key={"MSC OUT EXCEL EDI"}
                      value={"MSC OUT EXCEL EDI"}
                    >
                      MSC OUT EXCEL EDI
                    </MenuItem>
                    <MenuItem
                      key={"MSC IN EXCEL EDI"}
                      value={"MSC IN EXCEL EDI"}
                    >
                      MSC IN EXCEL EDI
                    </MenuItem>
                  </TextField>
                ) : (
                  <TextField
                    id="report-type"
                    select
                    value={report}
                    variant="outlined"
                    fullWidth
                    inputProps={{ className: classes.input }}
                    onChange={(e) => {
                      setReport(e.target.value);
                    }}
                  >
                    <MenuItem key={"IN REPORT"} value={"IN REPORT"}>
                      IN REPORT
                    </MenuItem>
                    <MenuItem key={"OUT REPORT"} value={"OUT REPORT"}>
                      OUT REPORT
                    </MenuItem>
                    <MenuItem
                      key={"DAILY ACTIVITY REPORT"}
                      value={"DAILY ACTIVITY REPORT"}
                    >
                      DAILY ACTIVITY REPORT
                    </MenuItem>
                    <MenuItem
                      key={"HANDLING REVENUE REPORT"}
                      value={"HANDLING REVENUE REPORT"}
                    >
                      HANDLING REVENUE REPORT
                    </MenuItem>
                    <MenuItem
                      key={"SELF TRANSPORTATION REVENUE REPORT"}
                      value={"SELF TRANSPORTATION REVENUE REPORT"}
                    >
                      SELF TRANSPORTATION REVENUE REPORT
                    </MenuItem>
                    <MenuItem key={"ESTIMATE REPORT"} value={"ESTIMATE REPORT"}>
                      ESTIMATE REPORT
                    </MenuItem>
                    <MenuItem
                      key={"APPROVED  REPORT"}
                      value={"APPROVED  REPORT"}
                    >
                      APPROVED REPORT
                    </MenuItem>
                    <MenuItem key={"REJECTED REPORT"} value={"REJECTED REPORT"}>
                      REJECTED REPORT
                    </MenuItem>
                    <MenuItem key={"REPAIR REPORT"} value={"REPAIR REPORT"}>
                      REPAIR REPORT
                    </MenuItem>
                    <MenuItem key={"SURVEYOR CONTAINER REPORT"} value={"SURVEYOR CONTAINER REPORT"}>
                    SURVEYOR CONTAINER REPORT
                    </MenuItem>
                    <MenuItem
                      key={"EDI MAIL TRACKED REPORT"}
                      value={"EDI MAIL TRACKED REPORT"}
                    >
                      EDI MAIL TRACKED REPORT
                    </MenuItem>
                    <MenuItem
                      key={"SEAL REQUEST REPORT"}
                      value={"SEAL REQUEST REPORT"}
                    >
                      SEAL REQUEST REPORT
                    </MenuItem>
                    <MenuItem key={"SEAL REPORT"} value={"SEAL REPORT"}>
                      SEAL REPORT
                    </MenuItem>
                    <MenuItem
                      key={"MOVECODE EDI MAIL TRACKED REPORT"}
                      value={"MOVECODE EDI MAIL TRACKED REPORT"}
                    >
                      MOVECODE EDI MAIL TRACKED REPORT
                    </MenuItem>
                    <MenuItem key={"OVMNR REPORT"} value={"OVMNR REPORT"}>
                      OVMNR REPORT
                    </MenuItem>
                    <MenuItem key={"DMR REPORT"} value={"DMR REPORT"}>DMR REPORT
                    </MenuItem>
                    <MenuItem key={"EXCEL EDI MAIL TRACKED REPORT"} value={"EXCEL EDI MAIL TRACKED REPORT"}>
                      EXCEL EDI MAIL TRACKED REPORT
                    </MenuItem>
                    <MenuItem key={"MOVECODE EXCEL EDI MAIL TRACKED REPORT"} value={"MOVECODE EXCEL EDI MAIL TRACKED REPORT"}>
                      MOVECODE EXCEL EDI MAIL TRACKED REPORT
                    </MenuItem>
                  </TextField>
                )
              ) : (
                <TextField
                  id="report-type"
                  select
                  value={report}
                  variant="outlined"
                  fullWidth
                  inputProps={{ className: classes.input }}
                  onChange={(e) => {
                    setReport(e.target.value);
                  }}
                >
                  <MenuItem key={"ESTIMATE REPORT"} value={"ESTIMATE REPORT"}>
                    ESTIMATE REPORT
                  </MenuItem>
                  <MenuItem key={"APPROVED  REPORT"} value={"APPROVED  REPORT"}>
                    APPROVED REPORT
                  </MenuItem>
                  <MenuItem key={"REJECTED REPORT"} value={"REJECTED REPORT"}>
                    REJECTED REPORT
                  </MenuItem>
                  <MenuItem key={"REPAIR REPORT"} value={"REPAIR REPORT"}>
                    REPAIR REPORT
                  </MenuItem>
                  <MenuItem key={"OVMNR REPORT"} value={"OVMNR REPORT"}>
                    OVMNR REPORT
                  </MenuItem>
                </TextField>
              )}
            </Grid>
            {alignment === "FTP" && (
              <Grid
                item
                xs={12}
                sm={3}
                style={theme.breakpoints.down("sm") && { padding: 7 }}
              >
                <Typography
                  variant="subtitle1"
                  className={classes.LabelTypography}
                >
                  Container
                </Typography>

                <CustomTextfield
                  id="container"
                  type="text"
                  value={container}
                  handleChange={handleContainerChange}
                />
              </Grid>
            )}
          </Grid>
          <Grid
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              marginTop: 20,
            }}
          >
            <Button
              className={classes.button}
              onClick={downloadReport}
              disabled={loader}
            >
              {alignment === "FTP" ? "Download" : " Download Reports"}
            </Button>
            {alignment === "FTP" && (
              <Button
                className={classes.button}
                onClick={downloadFTP}
                disabled={loader}
              >
                FTP Upload
              </Button>
            )}
          </Grid>
        </Paper>
      </div>
      <Backdrop className={classes.backdrop} open={ui.isloading}>
        <CircularProgress color="inherit" />
      </Backdrop>
    </LayoutContainer>
  );
}
