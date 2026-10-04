import React, { useState, useEffect } from "react";
import {
  Typography,
  Paper,
  Grid,
  Button,
  TextField,
  MenuItem,
  Backdrop,
  CircularProgress,
  Autocomplete,
  Box,
} from "@mui/material";

import LayoutContainer from "@components/reusablecomponents/LayoutContainer";
import DatePickerField from "@components/reusablecomponents/DatePickerField";
import { useDispatch, useSelector } from "react-redux";
import { dropDownDispatch } from "../actions/GateInActions";
import {
  downloadReports,
  LOLOInvoiceReportDownloadAction,
} from "../actions/ReportActions";
import CustomTextfield from "@components/reusablecomponents/GateInTextField";
import { useSnackbar } from "notistack";
import { theme } from "../App";
import { Stack, ToggleButtonGroup, ToggleButton } from "@mui/material";
import { custombackDropStyle } from "../utils/CustomClasses";

export default function Reports() {
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
    else if (
      alignment === "FTP" &&
      container === "" &&
      fromDate === "" &&
      toDate === ""
    )
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
        container_no:
          alignment === "FTP"
            ? container.length > 0
              ? container.split(",")
              : []
            : [],
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
    else if (container === "" && fromDate === "" && toDate === "")
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

  const downloadLOLOInvoiceReport = () => {
    if (fromDate === "")
      notify("Please Enter From Date", { variant: "warning" });
    else if (toDate === "")
      notify("Please Enter To Date", { variant: "warning" });
    else if (fromDate !== "" && toDate === "")
      notify("Please Enter To Date & From Date", {
        variant: "warning",
      });
    else {
      dispatch(LOLOInvoiceReportDownloadAction(fromDate, toDate, notify));
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
    setLine("");
  };

  const handleTabClickMSC = () => {
    setReport("");
    setLine("MSC");
  };

  const handleTabClickLOLOINVOICE = () => {
    setReport("");
    setLine("");
  };



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
            sx={(theme) => ({
              "&.MuiToggleButtonGroup-root": {
                backgroundColor: "transparent",
                borderRadius: "6px",
                color: "white",
                "& .MuiToggleButtonGroup-grouped:not(:first-of-type).Mui-selected":
                  {
                    borderLeft: `2px solid  ${theme.palette.primary.main}`,
                  },
                "& .Mui-selected ": {
                  backgroundColor: theme.palette.primary.main,
                  color: "white",
                  borderRadius: "6px",
                  border: "none",
                  fontWeight: "bolder",

                  zIndex: 10,
                },
                "& .Mui-selected:hover": {
                  backgroundColor: theme.palette.primary.main,
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
            })}
            aria-label="Platform"
          >
            <ToggleButton
              value="Report"
              onClick={handleTabClick}
              style={{ fontSize: "12px" }}
            >
              REPORT
            </ToggleButton>
            <ToggleButton
              value="FTP"
              onClick={handleTabClickMSC}
              style={{ fontSize: "12px" }}
            >
              MSC EXCEL EDI FTP UPLOAD
            </ToggleButton>
            <ToggleButton
              value="LOLOINVOICE"
              onClick={handleTabClickLOLOINVOICE}
              style={{ fontSize: "12px" }}
            >
              LOLO INVOICE REPORT
            </ToggleButton>
          
          </ToggleButtonGroup>
          <Box></Box>
        </Stack>

        <Paper
            sx={(theme) => ({
              padding: theme.spacing(4, 3),
            })}
            elevation={0}
          >
            <Grid container spacing={1}>
              <Grid
                item
                size={{ xs: 12, sm: 3 }}
                style={theme.breakpoints.down("sm") && { padding: 7 }}
              >
                <Typography
                  variant="subtitle1"
                  sx={(theme) => ({
                    fontSize: 14,
                    fontWeight: 600,
                    color: "#243545",

                    [theme.breakpoints.down("sm")]: {
                      paddingBottom: 1,
                    },
                  })}
                >
                  From Date
                </Typography>

                <DatePickerField
                  fullWidth
                  dateId="manufacturing-date"
                  dateValue={fromDate}
                  dateChange={handleFromDateChange}
                />
              </Grid>
              <Grid
                item
                size={{ xs: 12, sm: 3 }}
                style={theme.breakpoints.down("sm") && { padding: 7 }}
              >
                <Typography
                  variant="subtitle1"
                  sx={(theme) => ({
                    fontSize: 14,
                    fontWeight: 600,
                    color: "#243545",

                    [theme.breakpoints.down("sm")]: {
                      paddingBottom: 1,
                    },
                  })}
                >
                  To Date
                </Typography>

                <DatePickerField
                  fullWidth
                  dateId="manufacturing-date"
                  dateValue={toDate}
                  dateChange={handleToDateChange}
                />
              </Grid>
              {alignment === "LOLOINVOICE" ? null : (
                <Grid
                  item
                  size={{ xs: 12, sm: 3 }}
                  style={theme.breakpoints.down("sm") && { padding: 7 }}
                >
                  <Typography
                    variant="subtitle1"
                    sx={(theme) => ({
                      fontSize: 14,
                      fontWeight: 600,
                      color: "#243545",

                      [theme.breakpoints.down("sm")]: {
                        paddingBottom: 1,
                      },
                    })}
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
              )}
              {alignment === "LOLOINVOICE" ? null : (
                <Grid
                  item
                  size={{ xs: 12, sm: 3 }}
                  style={theme.breakpoints.down("sm") && { padding: 7 }}
                >
                  <Typography
                    variant="subtitle1"
                    sx={(theme) => ({
                      fontSize: 14,
                      fontWeight: 600,
                      color: "#243545",

                      [theme.breakpoints.down("sm")]: {
                        paddingBottom: 1,
                      },
                    })}
                  >
                    To Time
                  </Typography>

                  <CustomTextfield
                    id="from-time"
                    type="time"
                    value={toTime}
                    handleChange={handleToTime}
                    readOnlyP={
                      (fromDate === "" || toDate === "" || fromTime === "") &&
                      true
                    }
                    dispatchType={"SET_REPORT_TO_TIME"}
                  />
                </Grid>
              )}
              {alignment === "LOLOINVOICE" ? null : (
                <Grid
                  item
                  size={{ xs: 12, sm: 3 }}
                  style={theme.breakpoints.down("sm") && { padding: 7 }}
                >
                  <Typography
                    variant="subtitle1"
                    sx={(theme) => ({
                      fontSize: 14,
                      fontWeight: 600,
                      color: "#243545",

                      [theme.breakpoints.down("sm")]: {
                        paddingBottom: 1,
                      },
                    })}
                  >
                    Line
                  </Typography>

                  <Autocomplete
                    id="report-line"
                    freeSolo={true}
                    value={alignment === "FTP" ? "MSC" : line}
                    noOptionsText="No Reports Available"
                    options={
                      alignment !== "FTP"
                        ? gateIn?.allDropDown &&
                          gateIn?.allDropDown?.report_shipping_lines &&
                          gateIn?.allDropDown?.report_shipping_lines
                        : ["MSC"]
                    }
                    getOptionLabel={(option) => option}
                    style={{ padding: 0 }}
                    sx={{
                      "& .MuiAutocomplete-inputRoot[class*='MuiOutlinedInput-root']":
                        {
                          padding: 0,
                        },
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        autoComplete="off"
                        value={alignment === "FTP" ? "MSC" : line}
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            "& fieldset": {
                              borderColor: "#243545",
                            },
                          },
                        }}
                        onBlur={(e) => {
                          setLine(e.target.value);
                        }}
                        fullWidth
                        variant="outlined"
                      />
                    )}
                  />
                </Grid>
              )}
              {alignment === "LOLOINVOICE" ? null : (
                <Grid
                  item
                  size={{ xs: 12, sm: 3 }}
                  style={theme.breakpoints.down("sm") && { padding: 7 }}
                >
                  <Typography
                    variant="subtitle1"
                    sx={(theme) => ({
                      fontSize: 14,
                      fontWeight: 600,
                      color: "#243545",

                      [theme.breakpoints.down("sm")]: {
                        paddingBottom: 1,
                      },
                    })}
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
                        size="small"
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
                        size="small"
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
                        <MenuItem
                          key={"ESTIMATE REPORT"}
                          value={"ESTIMATE REPORT"}
                        >
                          ESTIMATE REPORT
                        </MenuItem>
                        <MenuItem
                          key={"APPROVED  REPORT"}
                          value={"APPROVED  REPORT"}
                        >
                          APPROVED REPORT
                        </MenuItem>
                        <MenuItem
                          key={"REJECTED REPORT"}
                          value={"REJECTED REPORT"}
                        >
                          REJECTED REPORT
                        </MenuItem>
                        <MenuItem key={"REPAIR REPORT"} value={"REPAIR REPORT"}>
                          REPAIR REPORT
                        </MenuItem>
                        <MenuItem
                          key={"SURVEYOR CONTAINER REPORT"}
                          value={"SURVEYOR CONTAINER REPORT"}
                        >
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
                          key={"SEAL SUMMARY REPORT"}
                          value={"SEAL SUMMARY REPORT"}
                        >
                          SEAL SUMMARY REPORT
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
                        <MenuItem key={"DMR REPORT"} value={"DMR REPORT"}>
                          DMR REPORT
                        </MenuItem>
                        <MenuItem
                          key={"EXCEL EDI MAIL TRACKED REPORT"}
                          value={"EXCEL EDI MAIL TRACKED REPORT"}
                        >
                          EXCEL EDI MAIL TRACKED REPORT
                        </MenuItem>
                        <MenuItem
                          key={"MOVECODE EXCEL EDI MAIL TRACKED REPORT"}
                          value={"MOVECODE EXCEL EDI MAIL TRACKED REPORT"}
                        >
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
                      size="small"
                      onChange={(e) => {
                        setReport(e.target.value);
                      }}
                    >
                      <MenuItem
                        key={"ESTIMATE REPORT"}
                        value={"ESTIMATE REPORT"}
                      >
                        ESTIMATE REPORT
                      </MenuItem>
                      <MenuItem
                        key={"APPROVED  REPORT"}
                        value={"APPROVED  REPORT"}
                      >
                        APPROVED REPORT
                      </MenuItem>
                      <MenuItem
                        key={"REJECTED REPORT"}
                        value={"REJECTED REPORT"}
                      >
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
              )}
              {alignment === "FTP" && (
                <Grid
                  item
                  size={{ xs: 12, sm: 3 }}
                  style={theme.breakpoints.down("sm") && { padding: 7 }}
                >
                  <Typography
                    variant="subtitle1"
                    sx={(theme) => ({
                      fontSize: 14,
                      fontWeight: 600,
                      color: "#243545",

                      [theme.breakpoints.down("sm")]: {
                        paddingBottom: 1,
                      },
                    })}
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
                marginTop: 12,
              }}
            >
              {alignment === "LOLOINVOICE" ? null : (
                <Button
                  variant="contained"
                  color="primary"
                  sx={{
                    fontSize: 12.5,
                    borderRadius: 2,
                    marginLeft: "auto",
                    marginRight: "auto",
                    marginTop: 4,
                    width: "35%",
                  }}
                  onClick={downloadReport}
                  disabled={loader}
                >
                  {alignment === "FTP" ? "Download" : " Download Reports"}
                </Button>
              )}
              {alignment === "FTP" && (
                <Button
                  variant="contained"
                  color="primary"
                  sx={{
                    fontSize: 12.5,
                    borderRadius: 2,
                    marginLeft: "auto",
                    marginRight: "auto",
                    marginTop: 4,
                    width: "35%",
                  }}
                  onClick={downloadFTP}
                  disabled={loader}
                >
                  FTP Upload
                </Button>
              )}
              {alignment === "LOLOINVOICE" && (
                <Button
                  variant="contained"
                  color="primary"
                  sx={{
                    fontSize: 12.5,
                    borderRadius: 2,
                    marginLeft: "auto",
                    marginRight: "auto",
                    marginTop: 4,
                    width: "35%",
                  }}
                  onClick={downloadLOLOInvoiceReport}
                  disabled={loader}
                >
                  Download LOLO Invoice Report
                </Button>
              )}
            </Grid>
          </Paper>
      </div>
      <Backdrop sx={custombackDropStyle} open={ui.isloading}>
        <CircularProgress color="inherit" />
      </Backdrop>
    </LayoutContainer>
  );
}
