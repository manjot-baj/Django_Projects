import React, { useEffect, useState } from "react";
import { Typography, Paper, Grid, Box, Button } from "@mui/material";

import { useDispatch, useSelector } from "react-redux";
import CustomTextfield from "@components/reusablecomponents/GateInTextField";
import DatePickerField from "@components/reusablecomponents/DatePickerField";
import { dropDownDispatch } from "../../../actions/GateInActions";

import { getVesselBkgNoListings } from "../../../actions/master/VesselBkgNoMasterActions";
import { useSnackbar } from "notistack";
import { theme } from "../../../App";
import { customLabelTypography } from "../../../utils/CustomClasses";

export default function VesselBkgNoSearch() {
  const dispatch = useDispatch();
  const store = useSelector((state) => state);
  const { user } = store;
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [vesselBkgNo, setVesselBkgNo] = useState("");
  // eslint-disable-next-line no-unused-vars
  const [Location, setLocation] = useState(user.location ? user.location : "");
  // eslint-disable-next-line no-unused-vars
  const [site, setSite] = useState(user.site ? user.site : "");
  const notify = useSnackbar().enqueueSnackbar;

  useEffect(() => {
    let reqArray = ["location_site_dashboard_list"];
    dispatch(dropDownDispatch(reqArray, notify));

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = () => {
    let data = {
      from_date: fromDate,
      to_date: toDate,
      number: vesselBkgNo,
      location: Location,
      site: site,
      pg_no: 1,
      on_page_data: store.stocksAndAllotmentSearch.on_page_data,
    };
    dispatch(getVesselBkgNoListings(data, 1));
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
          Vessel Bkg No Search
        </Box>
      </Typography>
      <Paper
        sx={(theme) => ({
          padding: theme.spacing(2, 2),
        })}
        elevation={0}
      >
        <Grid container spacing={2}>
          <Grid item size={{ xs: 12, sm: 3 }}>
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
          <Grid item size={{ xs: 12, sm: 3 }}>
            <Typography variant="subtitle1" sx={customLabelTypography}>
              Vessel Bkg Number
            </Typography>

            <CustomTextfield
              id="vessel-bkg-no"
              value={vesselBkgNo}
              handleChange={(e) => setVesselBkgNo(e.target.value)}
              dispatchType={"SET_MASTER_VESSEL_BKG_NO"}
            />
          </Grid>
          <Grid item size={{ xs: 12, sm: 3 }}    sx={{
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "flex-start",
              gap: 2,
              paddingBottom:0.2
            }}>
            <Button variant="contained" color="warning" onClick={handleSearch}>
              Search
            </Button>
            <Button
              variant="outlined"
              color="primary"
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
