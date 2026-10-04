import React, { useState, useEffect } from "react";
import {
  Typography,
  Paper,
  Grid,
  Box,
  Button,
  TextField,
  Backdrop,
  CircularProgress,
  Autocomplete,
} from "@mui/material";

import LayoutContainer from "@components/reusablecomponents/LayoutContainer";
import DatePickerField from "@components/reusablecomponents/DatePickerField";
import { useDispatch, useSelector } from "react-redux";
import { dropDownDispatch } from "../../actions/GateInActions";
import {
  downloadAnalyticsReports,
  downloadReports,
} from "../../actions/ReportActions";
import CustomTextfield from "@components/reusablecomponents/GateInTextField";
import { useSnackbar } from "notistack";
import { theme } from "../../App";
import {
  custombackDropStyle,
  customLabelTypography,
} from "../../utils/CustomClasses";

const AnalyticsReport = () => {
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
    else if (fromDate === "")
      notify("Please Enter From Date", {
        variant: "warning",
      });
    else if (toDate === "")
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
        <Paper
          sx={(theme) => ({
            padding: theme.spacing(4, 3),
          })}
          elevation={0}
        >
          <Grid container spacing={4}>
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
              <Typography variant="subtitle1" sx={customLabelTypography}>
                To Date
              </Typography>

              <DatePickerField
               fullWidth
                dateId="manufacturing-date"
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
              size={{ xs: 12, sm: 3 }}
              style={theme.breakpoints.down("sm") && { padding: 7 }}
            >
              <Typography variant="subtitle1" sx={customLabelTypography}>
                Line
              </Typography>
              <Autocomplete
                value={line}
                onChange={(e, newValue) => {
                  setLine(newValue);
                }}
                size="small"
                style={{ padding: 0 }}
               
                options={
                  (gateIn.allDropDown &&
                    gateIn.allDropDown.client_ref_codes && [
                      "ALL",
                      ...gateIn.allDropDown.client_ref_codes,
                    ]) ||
                  []
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    style={{ padding: 0 }}
                    variant="outlined"
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        "& fieldset": {
                          borderColor: "#243545",
                        },
                      },
                    }}
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
             
            }}
          >
            <Button
              variant="contained"
              color="primary"
              sx={{
                marginTop:8,
                width:320
              }}
              onClick={downloadReport}
              disabled={loader}
            >
              Download Reports
            </Button>
          </Grid>
        </Paper>
      </div>
      <Backdrop sx={custombackDropStyle} open={ui.isloading}>
        <CircularProgress color="inherit" />
      </Backdrop>
    </LayoutContainer>
  );
};

export default AnalyticsReport;
