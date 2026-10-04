import React, { useEffect, useState } from "react";
import {
  makeStyles,
  Typography,
  Paper,
  TextField,
  MenuItem,
  Grid,
  Box,
  Button,
} from "@material-ui/core";

import { useDispatch, useSelector } from "react-redux";
import { dropDownDispatch } from "../../../actions/GateInActions";
import { getClientListing } from "../../../actions/Master/ClientMasterActions";
import { useSnackbar } from "notistack";
import Autocomplete from "@material-ui/lab/Autocomplete";

const useStyles = makeStyles((theme) => ({
  paperContainer: {
    padding: theme.spacing(4, 3),
  },
  input: {
    padding: 7,
  },
  choiceSelectContainer: {
    border: "1px solid #243545",
    marginTop: "0rem",
    display: "flex",
    borderRadius: 6,
  },
  choice: {
    backgroundColor: "#fff",
    width: "100%",
    padding: 1,
  },
  selectedChoice: {
    borderRadius: 5,
    color: "#fff",
    backgroundColor: "#2F6FB7",
    width: "100%",
    padding: 1,
    "&:hover": {
      backgroundColor: "#2F6FB7",
    },
  },
  LabelTypography: {
    fontSize: 14,
    fontWeight: 600,
    color: "#243545",
    paddingBottom: 4,
    [theme.breakpoints.down("sm")]: {
      // padding: "1px 4px",
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
    [theme.breakpoints.down('md')]:{
      height:'40px'
    }
  },
  button2: {
    fontSize: 12.5,
    borderRadius: 6,
    marginLeft: "auto",
    marginRight: "auto",
    marginTop: 20,
    width: "35%",
    border: "1.5px solid #2A5FA5",
    boxShadow: "0px 3px 6px #9199A14D",
    backgroundColor: "#fff",
    color: "#2A5FA5",
    "&:hover": {
      backgroundColor: "#fff",
    },
  },
  autocomplete: {
    "& .MuiAutocomplete-inputRoot[class*='MuiOutlinedInput-root']": {
      padding: 0,
    },
  },
  textField: {
    "& .MuiOutlinedInput-root": {
      "& fieldset": {
        borderColor: "#243545",
      },
    },
  },
}));

export default function ClientSearch() {
  const classes = useStyles();
  const dispatch = useDispatch();
  const store = useSelector((state) => state);
  const { gateIn} = store;
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
    let data = {
      client_name: clientName,
      ref_code: refCode,
      location: localStorage.getItem("location") ? localStorage.getItem("location") : null,
      site: localStorage.getItem("site") ? localStorage.getItem("site") : null,
      type: type,
      pg_no: 1,
      on_page_data:store.stocksAndAllotmentSearch.on_page_data,
    };
    dispatch(getClientListing(data));
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
      <Paper className={classes.paperContainer} elevation={0}>
        <Grid container spacing={3}>
         
           {gateIn.allDropDown && filtered && (
            <Grid item xs={12} sm={6} lg={4}>
              <Typography
                variant="subtitle1"
                className={classes.LabelTypography}
              >
                Client Name
              </Typography>

              <Autocomplete
                value={clientName}
                onChange={(event, newValue) => {
                  setClientName(newValue);
                }}
                style={{ padding: 0 }}
                className={classes.autocomplete}
                options={filtered.map((option) => option)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    variant="outlined"
                    className={classes.textField}
                    onBlur={(e) => {
                      setClientName(e.target.value);
                      dispatch({ type: "SET_CLIENT_NAME", payload: e.target.value });
                    }}
                    fullWidth
                  />
                )}
              />
              
            </Grid>
          )}

          {gateIn.allDropDown && gateIn.allDropDown.client_ref_codes && (
            <Grid
              item
              xs={12}
              sm={6}
              lg={4}
            >
              <Typography
                variant="subtitle1"
                className={classes.LabelTypography}
              >
                Ref Code
              </Typography>
              <Autocomplete
                value={refCode}
                onChange={(event, newValue) => {
                  setRefCode(newValue);
                }}
                style={{ padding: 0 }}
                className={classes.autocomplete}
                options={gateIn.allDropDown.client_ref_codes.map(
                  (option) => option
                )}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    variant="outlined"
                    className={classes.textField}
                    onBlur={(e) => {
                      setRefCode(e.target.value);
                      dispatch({ type: "SET_CLIENT_REF_CODE", payload: e.target.value });
                    }}
                    fullWidth
                  />
                )}
              />
            </Grid>
          )}

          <Grid
            item
            xs={12}
            sm={6}
            lg={4}
          >
            <Typography variant="subtitle1" className={classes.LabelTypography}>
              Type
            </Typography>

            <TextField
              id="client-master-type"
              select
              value={type}
              variant="outlined"
              fullWidth
              inputProps={{ className: classes.input }}
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

          <Button className={classes.button} onClick={handleSearch}>
            Search
          </Button>
          <Button className={classes.button2} onClick={() => window.location.reload()}>
            Reset
          </Button>
        </Grid>
      </Paper>
    </div>
  );
}