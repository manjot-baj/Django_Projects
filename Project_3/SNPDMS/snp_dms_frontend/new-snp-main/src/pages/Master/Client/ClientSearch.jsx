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
import { getClientListing } from "@/actions/master/ClientMasterActions";
import { useSnackbar } from "notistack";
import { customLabelTypography } from "../../../utils/CustomClasses";

export default function ClientSearch() {
  const dispatch = useDispatch();
  const store = useSelector((state) => state);
  const { gateIn } = store;
  const [refCode, setRefCode] = useState("");
  const [clientName, setClientName] = useState("");
  const [type, setType] = useState("");
  const notify = useSnackbar().enqueueSnackbar;

  useEffect(() => {
    let reqArray = [
      "client_data",
      "client_ref_codes",
      "location_site_dashboard_list",
    ];

    dispatch(dropDownDispatch(reqArray, notify));
  }, []);

  const handleSearch = () => {
    dispatch({
      type: "SET_CLIENT_NAME",
      payload: clientName,
    });
    dispatch({
      type: "SET_CLIENT_REF_CODE",
      payload: refCode,
    });
    dispatch({
      type: "SET_CLIENT_TYPE",
      payload: type,
    });
    dispatch(getClientListing(notify));
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
          Client Search
        </Box>
      </Typography>
      <Paper
        sx={(theme) => ({
          padding: theme.spacing(4, 3),
        })}
        elevation={0}
      >
        <Grid container spacing={3}>
          {gateIn.allDropDown && filtered && (
            <Grid item size={{ xs: 12, sm: 3 }}>
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
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        "& fieldset": {
                          borderColor: "#243545",
                        },
                      },
                    }}
                    onBlur={(e) => {
                      setClientName(e.target.value);
                      dispatch({
                        type: "SET_CLIENT_NAME",
                        payload: e.target.value,
                      });
                    }}
                    fullWidth
                  />
                )}
              />
            </Grid>
          )}

          {gateIn.allDropDown && gateIn.allDropDown.client_ref_codes && (
            <Grid item size={{ xs: 12, sm: 3 }}>
              <Typography variant="subtitle1" sx={customLabelTypography}>
                Ref Code
              </Typography>
              <Autocomplete
                value={refCode}
                onChange={(event, newValue) => {
                  setRefCode(newValue);
                }}
                style={{ padding: 0 }}
                sx={{
                  "& .MuiAutocomplete-inputRoot[class*='MuiOutlinedInput-root']":
                    {
                      padding: 0,
                    },
                }}
                options={gateIn.allDropDown.client_ref_codes.map(
                  (option) => option,
                )}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    variant="outlined"
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        "& fieldset": {
                          borderColor: "#243545",
                        },
                      },
                    }}
                    onBlur={(e) => {
                      setRefCode(e.target.value);
                      dispatch({
                        type: "SET_CLIENT_REF_CODE",
                        payload: e.target.value,
                      });
                    }}
                    fullWidth
                  />
                )}
              />
            </Grid>
          )}

          <Grid item size={{ xs: 12, sm: 3 }}>
            <Typography variant="subtitle1" sx={customLabelTypography}>
              Type
            </Typography>

            <TextField
              id="client-master-type"
              select
              value={type}
              variant="outlined"
              fullWidth
              size="small"
              onChange={(e) => {
                setType(e.target.value);
                dispatch({ type: "SET_CLIENT_TYPE", payload: e.target.value });
              }}
            >
              <MenuItem key="Line" value="Line">
                Line
              </MenuItem>
              <MenuItem key="Party" value="Party">
                Party
              </MenuItem>
            </TextField>
          </Grid>
          <Grid
            item
            size={{ sm: 3 }}
            sx={{
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "flex-start",
              gap: 2,
            }}
          >
            {" "}
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
