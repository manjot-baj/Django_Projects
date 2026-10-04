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
import { getClientDocListing } from "../../../actions/master/ClientDocumentMasterActions";
import { theme } from "../../../App";
import { customLabelTypography } from "../../../utils/CustomClasses";

export default function ClientDocumentSearch() {
  const dispatch = useDispatch();
  const store = useSelector((state) => state);
  const { gateIn, user } = store;
  const [clientName, setClientName] = useState("");
  const notify = useSnackbar().enqueueSnackbar;

  useEffect(() => {
    let reqArray = ["client_data", "location_site_dashboard_list"];
    dispatch(dropDownDispatch(reqArray, notify));
  }, []);

  const handleSearch = () => {
    let data = {
      client_name: clientName,
      location: user.location,
      site: user.site,
      pg_no: 1,
      on_page_data: 5,
    };
    dispatch(getClientDocListing(data));
  };

  const mapped =
    gateIn.allDropDown &&
    gateIn.allDropDown.client_data &&
    gateIn.allDropDown.client_data.map((obj) => obj.name);
  const filtered =
    mapped && mapped.filter((type, index) => mapped.indexOf(type) === index);

  return (
    <div>
      <Typography variant="subtitle2">
        <Box fontWeight="fontWeightBold" m={1}>
          Client Document Search
        </Box>
      </Typography>
      <Paper
        sx={(theme) => ({
          padding: theme.spacing(2, 2),
        })}
        elevation={0}
      >
        <Grid container spacing={2}>
          {gateIn.allDropDown && filtered && (
            <Grid
              item
              size={{ xs: 12, sm: 3 }}
            
            >
              <Typography variant="subtitle1" sx={customLabelTypography}>
                Client Name
              </Typography>
              <Autocomplete
                value={clientName}
                onChange={(event, newValue) => {
                  setClientName(newValue);
                }}
                style={{ padding: 0 }}
                sx={{
                  "& .MuiAutocomplete-inputRoot[class*='MuiOutlinedInput-root']":
                    {
                      padding: 0,
                    },
                }}
                options={filtered.map((option) => option)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    variant="outlined"
                    onBlur={(e) => {
                      setClientName(e.target.value);
                      dispatch({
                        type: filtered.map((option) => (
                          <MenuItem key={option} value={option}>
                            {option}
                          </MenuItem>
                        )),
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

        <Grid
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            marginTop: 20,
          }}
        ></Grid>
      </Paper>
    </div>
  );
}
