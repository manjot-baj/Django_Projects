import React, { useEffect, useState } from "react";
import { Typography, Paper, Grid, Box, Button } from "@mui/material";

import { useDispatch, useSelector } from "react-redux";
import CustomTextfield from "@components/reusablecomponents/GateInTextField";
import { dropDownDispatch } from "../../../actions/GateInActions";
import { getVesselVoyageDetailListings } from "../../../actions/master/VesselVoyageDetailMasterActions";
import { useSnackbar } from "notistack";
import { theme } from "../../../App";
import { customLabelTypography } from "../../../utils/CustomClasses";

export default function VesselVoyageDetailSearch() {
  const dispatch = useDispatch();
  const store = useSelector((state) => state);
  const { user } = store;
  // eslint-disable-next-line no-unused-vars
  const [Location, setLocation] = useState(user.location ? user.location : "");
  // eslint-disable-next-line no-unused-vars
  const [site, setSite] = useState(user.site ? user.site : "");
  const [bookingNo, setBookingNo] = useState("");
  const [vesselVoyage, setVesselVoyage] = useState("");
  const [vesselName, setVesselName] = useState("");
  const [voyageNo, setVoyageNo] = useState("");
  const notify = useSnackbar().enqueueSnackbar;

  useEffect(() => {
    let reqArray = ["location_site_dashboard_list"];

    dispatch(dropDownDispatch(reqArray, notify));

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = () => {
    let data = {
      vessel_voyage: vesselVoyage,
      vessel_name: vesselName,
      voyage_no: voyageNo,
      booking_no: bookingNo,
      location: Location,
      site: site,
      pg_no: 1,
      on_page_data: store.stocksAndAllotmentSearch.on_page_data,
    };
    dispatch(getVesselVoyageDetailListings(data));
  };

  return (
    <div>
      <Typography variant="subtitle2">
        <Box fontWeight="fontWeightBold" m={1}>
          Vessel Voyage Detail Search
        </Box>
      </Typography>
      <Paper
        sx={(theme) => ({
          padding: theme.spacing(2, 2),
        })}
        elevation={0}
      >
        <Grid container spacing={2}>
          <Grid item size={{ xs: 12, sm: 2 }}>
            <Typography variant="subtitle1" sx={customLabelTypography}>
              Vessel Voyage
            </Typography>

            <CustomTextfield
              id="vessel-voyage"
              value={vesselVoyage}
              handleChange={(e) => setVesselVoyage(e.target.value)}
              dispatchType={"SET_MASTER_VESSEL_VOYAGE"}
            />
          </Grid>
          <Grid item size={{ xs: 12, sm: 2 }}>
            <Typography variant="subtitle1" sx={customLabelTypography}>
              Vessel Name
            </Typography>

            <CustomTextfield
              id="vessel-name"
              value={vesselName}
              handleChange={(e) => setVesselName(e.target.value)}
              dispatchType={"SET_MASTER_VESSEL_VOYAGE_NAME"}
            />
          </Grid>
          <Grid item size={{ xs: 12, sm: 2 }}>
            <Typography variant="subtitle1" sx={customLabelTypography}>
              Voyage Number
            </Typography>

            <CustomTextfield
              id="voyage-no"
              value={voyageNo}
              handleChange={(e) => setVoyageNo(e.target.value)}
              dispatchType={"SET_MASTER_VOYAGE_NO"}
            />
          </Grid>
          <Grid item size={{ xs: 12, sm: 2 }}>
            <Typography variant="subtitle1" sx={customLabelTypography}>
              Booking Number
            </Typography>

            <CustomTextfield
              id="booking-no"
              value={bookingNo}
              handleChange={(e) => setBookingNo(e.target.value)}
              dispatchType={"SET_MASTER_BOOKING_NO"}
            />
          </Grid>
          <Grid
            item
            size={{ xs: 12, sm: 3 }}
            sx={{
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "flex-start",
              gap: 2,
            }}
          >
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
