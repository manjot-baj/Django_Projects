import React, { useEffect, useState } from "react";
import { Typography, Paper, Grid, Box, Button } from "@mui/material";

import { useDispatch, useSelector } from "react-redux";
import CustomTextfield from "@components/reusablecomponents/GateInTextField";
import { dropDownDispatch } from "../../../actions/GateInActions";
import { getCarrierCodeListings } from "../../../actions/master/CarrierCodeMasterActions";
import { useSnackbar } from "notistack";
import { theme } from "../../../App";
import { customLabelTypography } from "../../../utils/CustomClasses";

export default function CarrierCodeSearch() {
  const dispatch = useDispatch();
  const store = useSelector((state) => state);
  const [code, setCode] = useState("");
  const notify = useSnackbar().enqueueSnackbar;

  useEffect(() => {
    let reqArray = ["location_site_dashboard_list"];

    dispatch(dropDownDispatch(reqArray, notify));
  }, []);

  const handleSearch = () => {
    let data = {
      code: code,
      location: localStorage.getItem("location")
        ? localStorage.getItem("location")
        : null,
      site: localStorage.getItem("site") ? localStorage.getItem("site") : null,
      pg_no: 1,
      on_page_data: store.stocksAndAllotmentSearch.on_page_data,
    };
    dispatch(getCarrierCodeListings(data));
  };

  return (
    <div>
      <Typography variant="subtitle2">
        <Box fontWeight="fontWeightBold" m={1}>
          Carrier Code Search
        </Box>
      </Typography>
      <Paper
        sx={(theme) => ({
          padding: theme.spacing(2, 2),
        })}
        elevation={0}
      >
        <Grid container spacing={2}>
          <Grid
            item
            size={{ xs: 12, sm: 3 }}
        
          >
            <Typography variant="subtitle1" sx={customLabelTypography}>
              Code
            </Typography>

            <CustomTextfield
              id="vessel-bkg-no"
              value={code}
              handleChange={(e) => setCode(e.target.value)}
              dispatchType={"SET_MASTER_CARRIER_CODE"}
            />
          </Grid>
          <Grid item      size={{ xs: 4 }}
            sx={{
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "flex-start",
              gap: 2,
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
