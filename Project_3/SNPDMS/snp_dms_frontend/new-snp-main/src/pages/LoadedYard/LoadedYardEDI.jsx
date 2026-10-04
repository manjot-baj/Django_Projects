import React, { useState, useEffect } from "react";
import {
  Typography,
  Paper,
  Grid,
  Box,
  Button,
  TextField,
  MenuItem,
  Radio,
  Backdrop,
  CircularProgress,
  Autocomplete,
} from "@mui/material";

import LayoutContainer from "@components/reusablecomponents/LayoutContainer";
import DatePickerField from "@components/reusablecomponents/DatePickerField";
import { useDispatch, useSelector } from "react-redux";
import {
  downloadRegeneratedEDILoaded,
  downloadExcelEDI,
} from "../../actions/RegenerateEDIActions";
import CustomTextfield from "@components/reusablecomponents/GateInTextField";
import { useSnackbar } from "notistack";
import {
  dropDownDispatch,
  containerValidatorDispatch,
} from "../../actions/GateInActions";
import { theme } from "../../App";
import {
  custombackDropStyle,
  customLabelTypography,
} from "../../utils/CustomClasses";

const IN = ["IIT", "MTIN", "MIR", "MIT", "EXPIN"];
const OUT = ["DVAN", "MOT", "MOR", "VAN", "EOT"];

const LoadedYardEDI = () => {
  const dispatch = useDispatch();
  const store = useSelector((state) => state);
  const { gateIn, user, ui } = store;
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [fromTime, setFromTime] = useState("");
  const [toTime, setToTime] = useState("");
  const [line, setLine] = useState("");
  const [containerNo, setContainerNo] = useState("");
  const [type, setType] = useState("");
  const [process, setProcess] = useState("");
  const [location] = useState(user.location ? user.location : "");
  const [site] = useState(user.site ? user.site : "");
  const [loader, setLoader] = useState(false);
  const [attribute, setAttribute] = useState("mscMoveCode");
  const notify = useSnackbar().enqueueSnackbar;

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

  const handleFromTime = (event) => {
    setFromTime(event.target.value);
  };

  const handleToTime = (event) => {
    setToTime(event.target.value);
  };

  const downloadEDI = () => {
    if (
      (attribute === "containerNo" || attribute === "mscMoveCode") &&
      fromDate === "" &&
      toDate === "" &&
      containerNo === ""
    ) {
      if (attribute === "containerNo") {
        notify("Please Enter Container No", {
          variant: "warning",
        });
      } else {
        notify("Please Enter From Date", {
          variant: "warning",
        });
      }
    } else if (
      (attribute === "shippingLine" || attribute === "mscMoveCode") &&
      fromDate === ""
    ) {
      notify("Please Enter From Date", {
        variant: "warning",
      });
    } else if (
      (attribute === "shippingLine" || attribute === "mscMoveCode") &&
      toDate === ""
    ) {
      notify("Please Enter To Date", {
        variant: "warning",
      });
    } else if (type === "") {
      notify("Please Enter Process Type", {
        variant: "warning",
      });
    } else if (process === "") {
      notify("Please Enter Move Code", {
        variant: "warning",
      });
    } else if (attribute === "mscMoveCode" && type === "") {
      notify("Please Enter Move Code Process and it's code", {
        variant: "warning",
      });
    } else if (attribute === "mscMoveCode" && process === "") {
      notify("Please Enter Move Code Process and it's code", {
        variant: "warning",
      });
    } else {
      let data = {
        from_date: fromDate,
        to_date: toDate,
        from_time: fromTime,
        to_time: toTime,
        process: type,
        move_code: process,
        location: location,
        site: site,
        container_no: containerNo,
      };
      dispatch(downloadRegeneratedEDILoaded(data, setLoader, notify));
    }
  };

  const downloadLoadedExcelEDI = () => {
    if (
      (attribute === "containerNo" || attribute === "mscMoveCode") &&
      fromDate === "" &&
      toDate === "" &&
      containerNo === ""
    ) {
      if (attribute === "containerNo") {
        notify("Please Enter Container No", {
          variant: "warning",
        });
      } else {
        notify("Please Enter From Date", {
          variant: "warning",
        });
      }
    } else if (
      (attribute === "shippingLine" || attribute === "mscMoveCode") &&
      fromDate === ""
    ) {
      notify("Please Enter From Date", {
        variant: "warning",
      });
    } else if (
      (attribute === "shippingLine" || attribute === "mscMoveCode") &&
      toDate === ""
    ) {
      notify("Please Enter To Date", {
        variant: "warning",
      });
    } else if (type === "") {
      notify("Please Enter Process Type", {
        variant: "warning",
      });
    } else if (process === "") {
      notify("Please Enter Move Code", {
        variant: "warning",
      });
    } else if (attribute === "mscMoveCode" && type === "") {
      notify("Please Enter Move Code Process and it's code", {
        variant: "warning",
      });
    } else if (attribute === "mscMoveCode" && process === "") {
      notify("Please Enter Move Code Process and it's code", {
        variant: "warning",
      });
    } else {
      let data = {
        from_date: fromDate,
        to_date: toDate,
        from_time: fromTime,
        to_time: toTime,
        process: type,
        move_code: process,
        location: location,
        site: site,
        container_no: containerNo,
      };
      dispatch(downloadExcelEDI(data, notify));
    }
  };
  useEffect(() => {
    let reqArray = [
      "client_ref_codes",
      "edi_move_code_process_list",
      "edi_shipping_lines",
    ];
    dispatch(dropDownDispatch(reqArray, notify));
  }, []);

  const handleContainerNumberOnBlur = (event) => {
    dispatch(
      containerValidatorDispatch(
        {
          container_no: event.target.value,
          location: localStorage.getItem("location")
            ? localStorage.getItem("location")
            : "",
        },
        gateIn?.selectedContainer?.container_data?.container_no,
        notify
      )
    );
    dispatch({ type: "SET_GATE_IN_DATE_TIME" });
  };

  return (
    <LayoutContainer footer={false}>
      <div>
        <Typography variant="subtitle2">
          <Box fontWeight="fontWeightBold" m={1}>
            Download Regenerated EDI
          </Box>
        </Typography>
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
              <Typography variant="subtitle1" sx={customLabelTypography}>
                Get EDI Report By:
              </Typography>
            </Grid>

            <Grid
              item
              size={{ xs: 12, sm: 4 }}
              style={theme.breakpoints.down("sm") && { padding: 7 }}
            >
              <Radio
                style={{ color: theme.palette.primary.main }}
                value={attribute}
                onClick={() => {
                  setAttribute("containerNo");
                  setFromDate("");
                  setToDate("");
                  setType("");
                  setProcess("");
                }}
                checked={attribute === "containerNo"}
              />
              Container No
            </Grid>

            <Grid
              item
              size={{ xs: 12, sm: 4 }}
              style={theme.breakpoints.down("sm") && { padding: 7 }}
            >
              <Radio
                style={{ color: theme.palette.primary.main }}
                value={attribute}
                onClick={() => {
                  setAttribute("mscMoveCode");
                  setContainerNo("");
                  setType("");
                  setProcess("");
                }}
                checked={attribute === "mscMoveCode"}
              />
              Date
            </Grid>
            {attribute === "shippingLine" && (
              <>
                <Grid
                  item
                  size={{ xs: 12, sm: 4 }}
                  style={theme.breakpoints.down("sm") && { padding: 7 }}
                >
                  <Typography variant="subtitle1" sx={customLabelTypography}>
                    From Date
                  </Typography>

                  <DatePickerField
                    fullWidth
                    dateId="from-date"
                    dateValue={fromDate}
                    dateChange={handleFromDateChange}
                  />
                </Grid>
                <Grid
                  item
                  size={{ xs: 12, sm: 3 }}
                  style={theme.breakpoints.down("sm") && { padding: 7 }}
                >
                  <Typography variant="subtitle1" sx={customLabelTypography}>
                    To Date
                  </Typography>

                  <DatePickerField
                    fullWidth
                    dateId="to-date"
                    dateValue={toDate}
                    dateChange={handleToDateChange}
                  />
                </Grid>
                <Grid
                  item
                  size={{ xs: 12, sm: 3 }}
                  style={theme.breakpoints.down("sm") && { padding: 7 }}
                >
                  <Typography variant="subtitle1" sx={customLabelTypography}>
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
                  size={{ xs: 12, sm: 3 }}
                  style={theme.breakpoints.down("sm") && { padding: 7 }}
                >
                  <Typography variant="subtitle1" sx={customLabelTypography}>
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
                {gateIn.allDropDown &&
                  gateIn.allDropDown.edi_shipping_lines && (
                    <Grid
                      item
                      size={{ xs: 12, sm: 6, lg: 4 }}
                      style={theme.breakpoints.down("sm") && { padding: 7 }}
                    >
                      <Typography
                        variant="subtitle1"
                        sx={customLabelTypography}
                      >
                        Line
                      </Typography>
                      <Autocomplete
                        value={line}
                        onChange={(event, newValue) => {
                          setLine(newValue);
                        }}
                        style={{ padding: 0 }}
                        sx={{
                          "& .MuiAutocomplete-inputRoot[class*='MuiOutlinedInput-root']":
                            {
                              padding: 0,
                            },
                        }}
                        options={gateIn.allDropDown.edi_shipping_lines.flatMap(
                          (option) => option
                        )}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            variant="outlined"
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
                          />
                        )}
                      />
                    </Grid>
                  )}
              </>
            )}
            {attribute === "containerNo" && (
              <Grid
                item
                size={{ xs: 12, sm: 4 }}
                style={theme.breakpoints.down("sm") && { padding: 7 }}
              >
                <Typography variant="subtitle1" sx={customLabelTypography}>
                  Container No.
                </Typography>

                <TextField
                  id="edi-container-number"
                  value={containerNo}
                  variant="outlined"
                  fullWidth
                  size="small"
                  onChange={(e) => {
                    setContainerNo(e.target.value);
                  }}
                  onBlur={handleContainerNumberOnBlur}
                />
              </Grid>
            )}
            {attribute === "mscMoveCode" && (
              <>
                <Grid
                  item
                  size={{ xs: 12, sm: 3 }}
                  style={theme.breakpoints.down("sm") && { padding: 7 }}
                >
                  <Typography variant="subtitle1" sx={customLabelTypography}>
                    From Date
                  </Typography>

                  <DatePickerField
                  fullWidth
                    dateId="from-date"
                    dateValue={fromDate}
                    dateChange={handleFromDateChange}
                  />
                </Grid>
                <Grid
                  item
                  size={{ xs: 12, sm: 3 }}
                  style={theme.breakpoints.down("sm") && { padding: 7 }}
                >
                  <Typography variant="subtitle1" sx={customLabelTypography}>
                    To Date
                  </Typography>

                  <DatePickerField
                  fullWidth
                    dateId="to-date"
                    dateValue={toDate}
                    dateChange={handleToDateChange}
                  />
                </Grid>
                <Grid
                  item
                  size={{ xs: 12, sm: 3 }}
                  style={theme.breakpoints.down("sm") && { padding: 7 }}
                >
                  <Typography variant="subtitle1" sx={customLabelTypography}>
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
                  size={{ xs: 12, sm: 3 }}
                  style={theme.breakpoints.down("sm") && { padding: 7 }}
                >
                  <Typography variant="subtitle1" sx={customLabelTypography}>
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
              </>
            )}

            <>
              <Grid
                item
                size={{ xs: 12, sm: 3 }}
                style={theme.breakpoints.down("sm") && { padding: 7 }}
              >
                <Typography variant="subtitle1" sx={customLabelTypography}>
                  Process
                </Typography>

                <TextField
                  id="edi-type"
                  select
                  value={type}
                  variant="outlined"
                  fullWidth
                  size="small"
                  onChange={(e) => {
                    setType(e.target.value);
                  }}
                >
                  <MenuItem key={"IN"} value={"IN"}>
                    IN
                  </MenuItem>
                  <MenuItem key={"OUT"} value={"OUT"}>
                    OUT
                  </MenuItem>
                </TextField>
              </Grid>
              <Grid
                item
                size={{ xs: 12, sm: 3 }}
                style={theme.breakpoints.down("sm") && { padding: 7 }}
              >
                <Typography variant="subtitle1" sx={customLabelTypography}>
                  Move Code
                </Typography>

                <TextField
                  id="edi-process"
                  select
                  value={process}
                  variant="outlined"
                  fullWidth
                  size="small"
                  onChange={(e) => {
                    setProcess(e.target.value);
                  }}
                >
                  {type === "IN"
                    ? IN.map((value, index) => (
                        <MenuItem key={value} value={value}>
                          {value}
                        </MenuItem>
                      ))
                    : type === "OUT"
                    ? OUT.map((value, index) => (
                        <MenuItem key={value} value={value}>
                          {value}
                        </MenuItem>
                      ))
                    : ""}
                </TextField>
              </Grid>
            </>
          </Grid>
          <br />
          <br />
          <Grid container size={{ xs: 12 }}>
            <Grid size={{ xs: 2 }} xs={2}></Grid>
            <Grid size={{ xs: 4 }}>
              <Button
                variant="contained"
                color="primary"
                sx={{ width: 320 }}
                onClick={downloadEDI}
                disabled={loader}
              >
                Download EDI
              </Button>
            </Grid>
            <Grid size={{ xs: 2 }}></Grid>
            <Grid size={{ xs: 4 }}>
              <Button
                variant="contained"
                color="primary"
                sx={{ width: 320 }}
                onClick={downloadLoadedExcelEDI}
                disabled={loader}
              >
                Download Excel EDI
              </Button>
            </Grid>
          </Grid>
        </Paper>
      </div>
      <Backdrop sx={custombackDropStyle} open={ui.isloading}>
        <CircularProgress color="inherit" />
      </Backdrop>
    </LayoutContainer>
  );
};

export default LoadedYardEDI;
