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
import { dropDownDispatch } from "../actions/GateInActions";

import { theme } from "../App";
import { getGroundRentBilling } from "../actions/BillingActions";
import { useSnackbar } from "notistack";

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
    border: "1.5px solid #FDBD2E",
    boxShadow: "0px 3px 6px #9199A14D",
    backgroundColor: "#FDBD2E",
    color: "#fff",
    "&:hover": {
      backgroundColor: "#FDBD2E",
    },
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
}));

export default function GroundRentSearch() {
  const classes = useStyles();
  const dispatch = useDispatch();
  const notify = useSnackbar().enqueueSnackbar;
  const store = useSelector((state) => state);
  const { gateIn, user } = store;
  const [containerNo, setContainerNo] = useState("");
  const [clientName, setClientName] = useState("");
  const [Location, setLocation] = useState(
    localStorage.getItem("location") ? localStorage.getItem("location") : null
  );
  const [site, setSite] = useState(
    localStorage.getItem("site") ? localStorage.getItem("site") : null
  );

  useEffect(() => {
    let reqArray = ["client_data", "location_site_dashboard_list"];

    dispatch(dropDownDispatch(reqArray, notify));
  }, []);

  const handleSearch = () => {
    let data = {
      container_no: containerNo,
      client: clientName,
      location: Location,
      site: site,
    };
    dispatch(getGroundRentBilling(data));
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
          Ground Rent Search
        </Box>
      </Typography>
      <Paper className={classes.paperContainer} elevation={0}>
        <Grid container spacing={3}>
          <Grid
            item
            xs={12}
            sm={6}
            lg={3}
            style={theme.breakpoints.down("sm") && { padding: 7 }}
          >
            <Typography variant="subtitle1" className={classes.LabelTypography}>
              Location
            </Typography>

            <TextField
              id="handling-location"
              select
              value={Location}
              variant="outlined"
              fullWidth
              inputProps={{ className: classes.input }}
              onChange={(e) => {
                setLocation(e.target.value);
              }}
              disabled={
                (user.role === "Location Admin" ||
                  user.role === "Site Admin" ||
                  user.role === "Depot User") &&
                true
              }
            >
              {gateIn.allDropDown &&
                gateIn.allDropDown.location_site_dashboard_list &&
                Object.keys(
                  gateIn.allDropDown.location_site_dashboard_list
                ).map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
            </TextField>
          </Grid>
          <Grid
            item
            xs={12}
            sm={6}
            lg={3}
            style={theme.breakpoints.down("sm") && { padding: 7 }}
          >
            <Typography variant="subtitle1" className={classes.LabelTypography}>
              Site
            </Typography>

            <TextField
              id="handling-site"
              select
              value={site}
              variant="outlined"
              fullWidth
              inputProps={{ className: classes.input }}
              onChange={(e) => {
                setSite(e.target.value);
              }}
              disabled={
                (user.role === "Site Admin" || user.role === "Depot User") &&
                true
              }
            >
              {Location !== "" &&
                gateIn.allDropDown &&
                gateIn.allDropDown.location_site_dashboard_list &&
                gateIn.allDropDown.location_site_dashboard_list[Location].map(
                  (option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  )
                )}
            </TextField>
          </Grid>
          <Grid
            item
            xs={12}
            sm={6}
            lg={3}
            style={theme.breakpoints.down("sm") && { padding: 7 }}
          >
            <Typography variant="subtitle1" className={classes.LabelTypography}>
              Container No
            </Typography>

            <TextField
              id="handling-container-no"
              value={containerNo}
              variant="outlined"
              fullWidth
              inputProps={{ className: classes.input }}
              onChange={(e) => {
                setContainerNo(e.target.value);
              }}
            />
          </Grid>
          <Grid
            item
            xs={12}
            sm={6}
            lg={3}
            style={theme.breakpoints.down("sm") && { padding: 7 }}
          >
            <Typography variant="subtitle1" className={classes.LabelTypography}>
              Client Name
            </Typography>

            <TextField
              id="handling-client"
              select
              value={clientName}
              variant="outlined"
              fullWidth
              inputProps={{ className: classes.input }}
              onChange={(e) => {
                setClientName(e.target.value);
              }}
            >
              {/* <Grid style={{ maxHeight: "150px" }}> */}
              {filtered &&
                filtered.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              {/* </Grid> */}
            </TextField>
          </Grid>
          <Button className={classes.button} onClick={handleSearch}>
            Search
          </Button>
      
        </Grid>
      </Paper>
    </div>
  );
}
