import React, { useEffect, useState } from "react";
import {
  Typography,
  Paper,
  TextField,
  MenuItem,
  Grid,
  Box,
  Button,
} from "@mui/material";

import { useDispatch, useSelector } from "react-redux";
import DatePickerField from "@components/reusablecomponents/DatePickerField";
import { dropDownDispatch } from "../actions/GateInActions";

import { theme } from "../App";
import { useSnackbar } from "notistack";
import { getWistimDestimS3Listings } from "../actions/WistimDestimS3Actions";
import { customLabelTypography } from "../utils/CustomClasses";

export default function WestimDestimS3Search() {
  const dispatch = useDispatch();
  const notify = useSnackbar().enqueueSnackbar;
  const store = useSelector((state) => state);
  const [type, setType] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  useEffect(() => {
    let reqArray = ["location_site_dashboard_list"];

    dispatch(dropDownDispatch(reqArray, notify));
  }, []);

  const handleSearch = () => {
    let data;
    data = {
      location: localStorage.getItem("location")
        ? localStorage.getItem("location")
        : null,
      site: localStorage.getItem("site") ? localStorage.getItem("site") : null,
      type: type,
      date: { from: fromDate, to: toDate },
      pg_no: store.stocksAndAllotmentSearch.pg_no,
      on_page_data: 200,
    };
    dispatch(getWistimDestimS3Listings(data));
  };

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

  return (
    <div>
      <Typography variant="subtitle2">
        <Box fontWeight="fontWeightBold" m={1}>
          Wistim Destim Repository Search
        </Box>
      </Typography>
      <Paper
        sx={(theme) => ({
          padding: theme.spacing(4, 3),
        })}
        elevation={0}
      >
        <Grid container spacing={2}>
          <Grid item size={{ xs: 12, sm: 3 }}>
            <Typography variant="subtitle1" sx={customLabelTypography}>
              Type
            </Typography>

            <TextField
              id="handling-client"
              select
              value={type}
              variant="outlined"
              fullWidth
              size="small"
              onChange={(e) => {
                setType(e.target.value);
              }}
            >
              <MenuItem key={"Estimate Westim"} value={"Estimate Westim"}>
                Estimate Westim
              </MenuItem>
              <MenuItem key={"Repair Destim"} value={"Repair Destim"}>
                Repair Destim
              </MenuItem>
              <MenuItem key={"Destim"} value={"Destim"}>
                Destim
              </MenuItem>
              <MenuItem key={"Rejected Westim"} value={"Rejected Westim"}>
                Rejected Westim
              </MenuItem>
            </TextField>
          </Grid>
          <Grid item size={{ xs: 12, sm: 3 }}>
            <Typography variant="subtitle1" sx={customLabelTypography}>
              From Date
            </Typography>

            <DatePickerField
              dateId="from-date"
              fullWidth
              dateValue={fromDate}
              dateChange={handleFromDateChange}
            />
          </Grid>
          <Grid item size={{ xs: 12, sm: 3 }}>
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
            sx={{
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "flex-start",
              mb: 0.4,
              gap: 2,
            }}
          >
            <Button
              variant="contained"
              color="warning"
              sx={{
                fontSize: 12.5,
                borderRadius: 2,
              }}
              onClick={handleSearch}
            >
              Search
            </Button>
            <Button
              variant="outlined"
              color="primary"
              sx={{
                fontSize: 12.5,
                borderRadius: 2,
              }}
              onClick={() => window.location.reload()}
            >
              Reset
            </Button>
          </Grid>
        </Grid>
      </Paper>
    </div>
  );
}
