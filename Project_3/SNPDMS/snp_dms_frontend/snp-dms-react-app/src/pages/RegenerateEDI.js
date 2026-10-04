import React, { useState, useEffect } from "react";
import {
  makeStyles,
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
} from "@material-ui/core";

import LayoutContainer from "../components/reusableComponents/LayoutContainer";
import DatePickerField from "../components/reusableComponents/DatePickerField";
import { useDispatch, useSelector } from "react-redux";
import { downloadRegeneratedEDI } from "../actions/RegenerateEDIActions";
import CustomTextfield from "../components/reusableComponents/GateInTextField";
import { useSnackbar } from "notistack";
import {
  dropDownDispatch,
  containerValidatorDispatch,
} from "../actions/GateInActions";
import { theme } from "../App";
import Autocomplete from "@material-ui/lab/Autocomplete";
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
  backImage: {
    height: 40,
    width: 40,
    marginBottom: 15,
    cursor: "pointer",
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
}));

export default function RegenerateEDI() {
  const classes = useStyles();
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
  const [moveCode, setMoveCode] = useState("");
  const [moveCodeProcess, setMoveCodeProcess] = useState("");
  const [location] = useState(user.location ? user.location : "");
  const [site] = useState(user.site ? user.site : "");
  const [loader, setLoader] = useState(false);
  const [attribute, setAttribute] = useState("containerNo");
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
      containerNo === "" &&
      fromDate === "" &&
      toDate === ""
    ) {
      notify("Please Enter Container No", {
        variant: "warning",
      });
    } else if (
      (attribute === "shippingLine" || attribute === "mscMoveCode") &&
      fromDate === "" &&
      containerNo === ""
    ) {
      notify("Please Enter From Date", {
        variant: "warning",
      });
    } else if (
      (attribute === "shippingLine" || attribute === "mscMoveCode") &&
      toDate === "" &&
      containerNo === ""
    ) {
      notify("Please Enter To Date", {
        variant: "warning",
      });
    } else if (type === "") {
      notify("Please Enter Type", {
        variant: "warning",
      });
    } else if (process === "") {
      notify("Please Enter Process", {
        variant: "warning",
      });
    } else if (attribute === "mscMoveCode" && moveCodeProcess === "") {
      notify("Please Enter Move Code Process and it's code", {
        variant: "warning",
      });
    } else if (attribute === "mscMoveCode" && moveCode === "") {
      notify("Please Enter Move Code Process and it's code", {
        variant: "warning",
      });
    } else if (
      (attribute === "shippingLine" || attribute === "mscMoveCode") &&
      line === ""
    ) {
      notify("Please Enter Line", {
        variant: "warning",
      });
    } else {
      let splitArray = containerNo.replace(/\s/g, "").split(",", 2);
      let data = {
        from_date: fromDate,
        to_date: toDate,
        from_time: fromTime,
        to_time: toTime,
        line: line,
        container_no:
          attribute !== "shippingLine" || attribute === "mscMoveCode"
            ? containerNo === ""
              ? []
              : splitArray
            : [],
        edi_type: type,
        edi_move_code: moveCodeProcess,
        edi_move_code_process: moveCode,
        process: process,
        location: location,
        site: site,
      };
      dispatch(downloadRegeneratedEDI(data, setLoader, notify));
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
    let first = event.target.value.slice(0, 4);
    let second = event.target.value.slice(4, 11);
    if (/^[A-Z]+$/.test(first) === false) {
      notify("First 4 alphabets should be uppercase.", {
        variant: "warning",
      });
      setContainerNo("");
      return;
    }
    if (/^\d+$/.test(second) === false) {
      notify("Select 7 combination of digits.", {
        variant: "warning",
      });
      setContainerNo("");
      return;
    }
    dispatch({
      type: "EDIT_CONTAINER_NUMBER",
      payload: containerNo,
    });
    // dispatch(
    //   containerValidatorDispatch(
    //     {
    //       container_no: event.target.value,
    //       location: localStorage.getItem("location")
    //         ? localStorage.getItem("location")
    //         : "",
    //     },
    //     gateInEdit.selectedContainer.container_data.container_no,
    //     notify
    //   )
    // );
    // dispatch({ type: "SET_GATE_IN_DATE_TIME" });
    // dispatch(
    //   containerValidatorDispatch(
    //     {
    //       container_no: event.target.value,
    //       location: localStorage.getItem("location")
    //         ? localStorage.getItem("location")
    //         : "",
    //     },
    //     gateIn?.selectedContainer?.container_data?.container_no,
    //     notify
    //   )
    // );
    // dispatch({ type: "SET_GATE_IN_DATE_TIME" });
  };

  return (
    <LayoutContainer footer={false}>
      <div>
        <Typography variant="subtitle2">
          <Box fontWeight="fontWeightBold" m={1}>
            Download Regenerated EDI
          </Box>
        </Typography>
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
                Please Select An Attribute :
              </Typography>
            </Grid>

            <Grid
              item
              xs={12}
              sm={3}
              style={theme.breakpoints.down("sm") && { padding: 7 }}
            >
              <Radio
                style={{ color: "#243545" }}
                value={attribute}
                onClick={() => {
                  setAttribute("containerNo");
                  setFromDate("");
                  setToDate("");
                  setLine("");
                  setType("");
                  setProcess("");
                }}
                checked={attribute === "containerNo"}
              />
              Container No
            </Grid>

            <Grid
              item
              xs={12}
              sm={3}
              style={theme.breakpoints.down("sm") && { padding: 7 }}
            >
              <Radio
                style={{ color: "#243545" }}
                value={attribute}
                onClick={() => {
                  setAttribute("shippingLine");
                  setContainerNo("");
                  setType("");
                  setProcess("");
                  setLine("")
                }}
                checked={attribute === "shippingLine"}
              />
              Shipping Line
            </Grid>
            <Grid
              item
              xs={12}
              sm={3}
              style={theme.breakpoints.down("sm") && { padding: 7 }}
            >
              <Radio
                style={{ color: "#243545" }}
                value={attribute}
                onClick={() => {
                  setAttribute("mscMoveCode");
                  setContainerNo("");
                  setType("");
                  setProcess("");
                  setMoveCode("");
                  setMoveCodeProcess("");
                  setLine("MSC")
                }}
                checked={attribute === "mscMoveCode"}
              />
              MSC Move Code
            </Grid>
            {attribute === "shippingLine" && (
              <>
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
                    dateId="from-date"
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
                    dateId="to-date"
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
                      xs={12}
                      sm={6}
                      lg={4}
                      style={theme.breakpoints.down("sm") && { padding: 7 }}
                    >
                      <Typography
                        variant="subtitle1"
                        className={classes.LabelTypography}
                      >
                        Line
                      </Typography>
                      <Autocomplete
                        value={line}
                        onChange={(event, newValue) => {
                          setLine(newValue);
                        }}
                        style={{ padding: 0 }}
                        className={classes.autocomplete}
                        options={gateIn.allDropDown.edi_shipping_lines.flatMap(
                          (option) => option
                        )}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            variant="outlined"
                            className={classes.textField}
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
                xs={12}
                sm={4}
                style={theme.breakpoints.down("sm") && { padding: 7 }}
              >
                <Typography
                  variant="subtitle1"
                  className={classes.LabelTypography}
                >
                  Container No.
                </Typography>

                <TextField
                  id="edi-container-number"
                  value={containerNo}
                  variant="outlined"
                  fullWidth
                  inputProps={{ className: classes.input }}
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
                    dateId="from-date"
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
                    dateId="to-date"
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
                      (fromDate === "" || toDate === "" || fromTime === "") &&
                      true
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
                    Container No.
                  </Typography>

                  <TextField
                    id="edi-container-number"
                    value={containerNo}
                    variant="outlined"
                    fullWidth
                    inputProps={{ className: classes.input }}
                    onChange={(e) => {
                      setContainerNo(e.target.value);
                    }}
                    onBlur={handleContainerNumberOnBlur}
                  />
                </Grid>
                {gateIn.allDropDown &&
                  gateIn.allDropDown.edi_shipping_lines && (
                    <Grid
                      item
                      xs={12}
                      sm={6}
                      lg={3}
                      style={theme.breakpoints.down("sm") && { padding: 7 }}
                    >
                      <Typography
                        variant="subtitle1"
                        className={classes.LabelTypography}
                      >
                        Line
                      </Typography>
                      <TextField
                        value={"MSC"}
                        style={{ padding: 0 }}
                        variant="outlined"
                        fullWidth
                        inputProps={{ className: classes.input }}
                        onBlur={() => setLine("MSC")}
                      />
                    </Grid>
                  )}
                <Grid
                  item
                  xs={12}
                  sm={6}
                  lg={3}
                  style={theme.breakpoints.down("sm") && { padding: 7 }}
                >
                  <Typography
                    variant="subtitle1"
                    className={classes.LabelTypography}
                  >
                    EDI Move Code Process
                  </Typography>

                  <TextField
                    id="move-code-value"
                    select
                    value={moveCode}
                    variant="outlined"
                    fullWidth
                    inputProps={{ className: classes.input }}
                    onChange={(e) => {
                      setMoveCode(e.target.value);
                      if (e.target.value.charAt(e.target.value.length-1)==="n") {
                        setType("IN")
                      }else{
                        setType("OUT")
                      }
                    }}
                  >
                    {gateIn.allDropDown &&
                      gateIn.allDropDown.edi_move_code_process_list &&
                      Object.keys(
                        gateIn.allDropDown.edi_move_code_process_list
                      ).map((option) => (
                        <MenuItem key={option} value={option}>
                          {option}
                        </MenuItem>
                      ))}
                  </TextField>
                </Grid>
                <Grid
                  item
                  xs={12}
                  sm={6}
                  lg={3}
                  style={theme.breakpoints.down("sm") && { padding: 7 }}
                >
                  <Typography
                    variant="subtitle1"
                    className={classes.LabelTypography}
                  >
                    EDI Move Code
                  </Typography>

                  <TextField
                    id="move-code-value"
                    select
                    value={moveCodeProcess}
                    variant="outlined"
                    fullWidth
                    inputProps={{ className: classes.input }}
                    onChange={(e) => {
                      setMoveCodeProcess(e.target.value);
                    }}
                  >
                    {moveCode !== "" &&
                      gateIn.allDropDown &&
                      gateIn.allDropDown.edi_move_code_process_list &&
                      gateIn.allDropDown.edi_move_code_process_list[
                        moveCode
                      ].map((option) => (
                        <MenuItem key={option} value={option}>
                          {option}
                        </MenuItem>
                      ))}
                  </TextField>
                </Grid>
              </>
            )}
            {attribute === "mscMoveCode" ? (
              <>
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
                    EDI Type
                  </Typography>

                  <TextField
                    id="edi-type"
                    select
                    value={type}
                    variant="outlined"
                    fullWidth
                    inputProps={{ className: classes.input }}
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
                  xs={12}
                  sm={3}
                  style={theme.breakpoints.down("sm") && { padding: 7 }}
                >
                  <Typography
                    variant="subtitle1"
                    className={classes.LabelTypography}
                  >
                    Process
                  </Typography>

                  <TextField
                    id="edi-process"
                    select
                    value={process}
                    variant="outlined"
                    fullWidth
                    inputProps={{ className: classes.input }}
                    onChange={(e) => {
                      setProcess(e.target.value);
                    }}
                  >
                    <MenuItem key={"Download"} value={"D"}>
                      Download
                    </MenuItem>
                  </TextField>
                </Grid>
              </>
            ) : (
              <>
                <Grid
                  item
                  xs={12}
                  sm={4}
                  style={theme.breakpoints.down("sm") && { padding: 7 }}
                >
                  <Typography
                    variant="subtitle1"
                    className={classes.LabelTypography}
                  >
                    EDI Type
                  </Typography>

                  <TextField
                    id="edi-type"
                    select
                    value={type}
                    variant="outlined"
                    fullWidth
                    inputProps={{ className: classes.input }}
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
                    <MenuItem key={"BOTH"} value={"BOTH"}>
                      BOTH
                    </MenuItem>
                  </TextField>
                </Grid>
                <Grid
                  item
                  xs={12}
                  sm={4}
                  style={theme.breakpoints.down("sm") && { padding: 7 }}
                >
                  <Typography
                    variant="subtitle1"
                    className={classes.LabelTypography}
                  >
                    Process
                  </Typography>

                  <TextField
                    id="edi-process"
                    select
                    value={process}
                    variant="outlined"
                    fullWidth
                    inputProps={{ className: classes.input }}
                    onChange={(e) => {
                      setProcess(e.target.value);
                    }}
                  >
                    <MenuItem key={"Download"} value={"D"}>
                      Download
                    </MenuItem>
                    <MenuItem key={"DownloadNEmail"} value={"DE"}>
                      Download {"&"} Email
                    </MenuItem>
                  </TextField>
                </Grid>
              </>
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
              onClick={downloadEDI}
              disabled={loader}
            >
              Download EDI
            </Button>
          </Grid>
        </Paper>
      </div>
      <Backdrop className={classes.backdrop} open={ui.isloading}>
        <CircularProgress color="inherit" />
      </Backdrop>
    </LayoutContainer>
  );
}
