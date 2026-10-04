import React, { useEffect, useState } from "react";
import {
  Typography,
  Paper,
  TextField,
  MenuItem,
  Grid,
  Box,
  Button,
  Autocomplete,
} from "@mui/material";

import { useDispatch, useSelector } from "react-redux";
import { dropDownDispatch } from "../../../actions/GateInActions";
import { useSnackbar } from "notistack";
import { getTariffListing } from "../../../actions/master/TariffTypeMasterAction";
import { theme } from "../../../App";
import { customLabelTypography } from "../../../utils/CustomClasses";

export default function TariffDocumentSearch() {
  const dispatch = useDispatch();
  const store = useSelector((state) => state);
  const { gateIn } = store;
  const [client, setclient] = useState("");
  const notify = useSnackbar().enqueueSnackbar;

  useEffect(() => {
    let reqArray = ["client_ref_codes", "location_site_dashboard_list"];
    dispatch(dropDownDispatch(reqArray, notify));
  }, []);

  const handleSearch = () => {
    let data = {
      client: client,
      location: localStorage.getItem("location")
        ? localStorage.getItem("location")
        : null,
      site: localStorage.getItem("site") ? localStorage.getItem("site") : null,
    };
    dispatch(getTariffListing(data));
  };

  return (
    <div>
      <Typography variant="subtitle2">
        <Box fontWeight="fontWeightBold" m={1}>
          Tariff Search
        </Box>
      </Typography>
      <Paper
        sx={(theme) => ({
          padding: theme.spacing(2, 2),
        })}
        elevation={0}
      >
        <Grid container spacing={2}>
          {gateIn.allDropDown && gateIn.allDropDown.client_ref_codes && (
            <Grid
              item
              size={{ xs:4}}
             
            >
              <Typography variant="subtitle1" sx={customLabelTypography}>
                Client Ref Code
              </Typography>
              <Autocomplete
                value={client}
                onChange={(event, newValue) => {
                  setclient(newValue);
                }}
                style={{ padding: 0 }}
                sx={{
                  "& .MuiAutocomplete-inputRoot[class*='MuiOutlinedInput-root']":
                    {
                      padding: 0,
                      height: "35px",
                    },
                }}
                options={gateIn.allDropDown.client_ref_codes.map(
                  (option) => option
                )}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    variant="outlined"
                    onBlur={(e) => {
                      setclient(e.target.value);
                      dispatch({
                        type: gateIn.allDropDown.client_ref_codes.map(
                          (option) => (
                            <MenuItem key={option} value={option}>
                              {option}
                            </MenuItem>
                          )
                        ),
                      });
                    }}
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
