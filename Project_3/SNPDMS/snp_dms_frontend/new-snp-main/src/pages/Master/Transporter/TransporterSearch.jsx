import React, { useEffect, useState } from "react";
import {
  Typography,
  Paper,
  TextField,
  Grid,
  Box,
  Button,
  Autocomplete,
} from "@mui/material";

import { useDispatch, useSelector } from "react-redux";
import { dropDownDispatch } from "../../../actions/GateInActions";
import { getTransporterListings } from "../../../actions/master/TransporterMasterActions";
import { useSnackbar } from "notistack";
import { theme } from "../../../App";
import { customLabelTypography } from "../../../utils/CustomClasses";

export default function TransporterSearch() {
  const dispatch = useDispatch();
  const store = useSelector((state) => state);
  const { gateIn } = store;
  const [transporterName, setTransporterName] = useState("");
  const notify = useSnackbar().enqueueSnackbar;

  useEffect(() => {
    let reqArray = ["transporter", "location_site_dashboard_list"];
    dispatch(dropDownDispatch(reqArray, notify));
  }, []);

  const handleSearch = () => {
    let data = {
      transporter_name: transporterName,
      transporter_code: "",
      location: localStorage.getItem("location")
        ? localStorage.getItem("location")
        : null,
      site: localStorage.getItem("site") ? localStorage.getItem("site") : null,
      pg_no: 1,
      on_page_data: store.stocksAndAllotmentSearch.on_page_data,
    };
    dispatch(getTransporterListings(data));
    console.log(data, "logg----11");
  };

  return (
    <div>
      <Typography variant="subtitle2">
        <Box fontWeight="fontWeightBold" m={1}>
          Transporter Search
        </Box>
      </Typography>
      <Paper
        sx={(theme) => ({
          padding: theme.spacing(2, 2),
        })}
        elevation={0}
      >
        <Grid container spacing={2}>
          {gateIn.allDropDown && gateIn.allDropDown.transporter && (
            <Grid
              item
              size={{ xs: 12, sm: 3 }}
        
            >
              <Typography variant="subtitle1" sx={customLabelTypography}>
                Transporter Name
              </Typography>
              <Autocomplete
                value={transporterName}
                onChange={(event, newValue) => {
                  setTransporterName(newValue);
                }}
                style={{ padding: 0 }}
                sx={{
                  "& .MuiAutocomplete-inputRoot[class*='MuiOutlinedInput-root']":
                    {
                      padding: 0,
                    },
                }}
                options={gateIn.allDropDown.transporter.map(
                  (option) => option.name
                )}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    variant="outlined"
                    onBlur={(e) => {
                      setTransporterName(e.target.value);
                      dispatch({
                        type: "SET_MASTER_TRANSPORTER_CODE",
                        payload: e.target.value,
                      });
                    }}
                    fullWidth
                  />
                )}
              />
            </Grid>
          )}
          <Grid
            item
            size={{ xs: 4 }}
            sx={{
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "flex-start",
              gap: 2,
            }}
          >
            <Button
              variant="contained"
              color="warning"
              onClick={handleSearch}
            >
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
