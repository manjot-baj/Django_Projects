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
  Backdrop,
  CircularProgress,
} from "@material-ui/core";


import LayoutContainer from "../../components/reusableComponents/LayoutContainer";
import DatePickerField from "../../components/reusableComponents/DatePickerField";
import { useDispatch, useSelector } from "react-redux";
import { dropDownDispatch } from "../../actions/GateInActions";
import { downloadAnalyticsReports, downloadReports } from "../../actions/ReportActions";
import CustomTextfield from "../../components/reusableComponents/GateInTextField";
import { useSnackbar } from "notistack";
import { theme } from "../../App";
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

const AnalyticsReport = () => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const store = useSelector((state) => state);
  const { gateIn, user, ui } = store;
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [line, setLine] = useState("");
  const [location] = useState(user.location ? user.location : "");
  const [site] = useState(user.site ? user.site : "");
  const [loader, setLoader] = useState(false);
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
    else if (fromDate === "" )
      notify("Please Enter From Date", {
        variant: "warning",
      });
    else if(toDate ==="")
      notify("Please Enter To Date", {
        variant: "warning",
      });
    else {
      let data = {
        from_date: fromDate,
        to_date: toDate,
        line: line,
        report_name: "Re-Estimate",
        location: location,
        site: site,
      };
      dispatch(downloadAnalyticsReports(data, setLoader, notify));
    }
  };


  return (
    <LayoutContainer footer={false}>
      <div>
        <Typography variant="subtitle2">
          <Box fontWeight="fontWeightBold" m={1}>
            Download Analytics Reports
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
                Report Name
              </Typography>

              <CustomTextfield
                id="from-time"
                type="text"
                value={"Re-Estimate"}
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
              value={line}
              onChange={(e, newValue) => {
                setLine(newValue);
              }}
              size="small"
              style={{ padding: 0 }}
              className={classes.autocomplete}
              options={
                (gateIn.allDropDown &&
                  gateIn.allDropDown.client_ref_codes &&
                  ["ALL",...gateIn.allDropDown.client_ref_codes]) ||
                []
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  style={{ padding: 0 }}
                  variant="outlined"
                  className={classes.textField}
                  onBlur={(e) => {
                    const { value } = e.target;

                    setLine(value);
                  }}
                  size="small"
                />
              )}
            />
             
            </Grid>
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
              Download Reports
            </Button>
          </Grid>
        </Paper>
      </div>
      <Backdrop className={classes.backdrop} open={ui.isloading}>
        <CircularProgress color="inherit" />
      </Backdrop>
    </LayoutContainer>
  );
};

export default AnalyticsReport;
