import React, { useState, useEffect } from "react";
import {
  makeStyles,
  Typography,
  Paper,
  Grid,
  Box,
  Button,
  TextField,
  MenuItem,
} from "@material-ui/core";

import { useHistory } from "react-router-dom";
import LayoutContainer from "../../../components/reusableComponents/LayoutContainer";
import { useDispatch, useSelector } from "react-redux";
import { dropDownDispatch } from "../../../actions/GateInActions";
import {
  addMasterContainerTransportationCharges,
  getSingleContainerTransportationCharges,
  updateMasterContainerTransportationCharges,
} from "../../../actions/Master/TransportationChargesMasterAction";
import { useSnackbar } from "notistack";
import { theme } from "../../../App";
import { Image } from "semantic-ui-react";
import Autocomplete from "@material-ui/lab/Autocomplete";

const useStyles = makeStyles((theme) => ({
  paperContainer: {
    padding: theme.spacing(4, 3),
  },
  LabelTypography: {
    fontSize: 14,
    fontWeight: 600,
    color: "#243545",
    paddingBottom: 4,
    [theme.breakpoints.down("sm")]: {
      paddingBottom: 1,
    },
  },
  button: {
    fontSize: 12.5,
    borderRadius: 6,
    marginLeft: "auto",
    marginRight: "auto",
    marginTop: 20,
    width: "30%",
    border: "1.5px solid #2A5FA5",
    boxShadow: "0px 3px 6px #9199A14D",
    backgroundColor: "#2A5FA5",
    color: "#fff",
    "&:hover": {
      backgroundColor: "#2A5FA5",
    },
  },
  input: {
    padding: 8,
  },
  textField: {
    "& .MuiOutlinedInput-root": {
      "& fieldset": {
        borderColor: "#243545",
      },
    },
  },
  backImage: {
    height: 40,
    width: 40,
    marginBottom: 15,
    cursor: "pointer",
  },
  autocomplete: {
    "& .MuiAutocomplete-inputRoot[class*='MuiOutlinedInput-root']": {
      padding: 0,
    },
  },
}));

export default function AddUpdateContainerTypeSizeCode(props) {
  const classes = useStyles();
  const dispatch = useDispatch();
  const history = useHistory();
  const store = useSelector((state) => state);
  const { transportationChargesMaster, gateIn, user } = store;
  const [transportationType, setTransportationType] = useState("");
  const [transportationAmount, setTransportationAmount] = useState("");
  const [transportationClient, setTransportationClient] = useState("");
  const [transportationSize, setTransportationSize] = useState("");
  const [transportationLocation, setTransportationLocation] = useState(
    localStorage.getItem("location") ? localStorage.getItem("location") : ""
  );
  const [transportationSite, setTransportationSite] = useState(
    localStorage.getItem("site") ? localStorage.getItem("site") : ""
  );
  const notify = useSnackbar().enqueueSnackbar;

  useEffect(() => {
    if (props.history.location.state) {
      dispatch(
        getSingleContainerTransportationCharges(
          props.history.location.state.allDetails.pk,
          notify
        )
      );
    }
  }, []);

  useEffect(() => {
    if (transportationChargesMaster.containerTransportationChargesDetails.pk) {
      setTransportationType(
        transportationChargesMaster.containerTransportationChargesDetails.type
      );
      setTransportationAmount(
        transportationChargesMaster.containerTransportationChargesDetails.amount
      );
      setTransportationClient(
        transportationChargesMaster.containerTransportationChargesDetails.client
      );
      setTransportationSize(
        transportationChargesMaster.containerTransportationChargesDetails.size
      );
      setTransportationLocation(
        transportationChargesMaster.containerTransportationChargesDetails
          .location
      );
      setTransportationSite(
        transportationChargesMaster.containerTransportationChargesDetails.site
      );
    }
  }, [transportationChargesMaster.containerTransportationChargesDetails]);

  useEffect(() => {
    let reqArray = [
      "client_data",
      "size_data",
      "arrived",
      "location_site_dashboard_list",
    ];

    dispatch(dropDownDispatch(reqArray, notify));
  }, []);

  const createHandlingCharge = () => {
    if (transportationLocation === "")
      notify("Please Enter Transportation Location", { variant: "warning" });
    else if (transportationSite === "")
      notify("Please Enter Transportation Site", { variant: "warning" });
    else if (transportationClient === "")
      notify("Please Enter Transportation Client", { variant: "warning" });
    else if (transportationAmount === "")
      notify("Please Enter Transportation Amount", { variant: "warning" });
    else if (transportationType === "")
      notify("Please Enter Transportation Type", { variant: "warning" });
    else if (transportationSize === "")
      notify("Please Enter Transportation Size", { variant: "warning" });
    else {
      let data = {
        type: transportationType,
        amount: transportationAmount,
        client: transportationClient,
        size: transportationSize,
        location: transportationLocation,
        site: transportationSite,
      };
      dispatch(addMasterContainerTransportationCharges(data, history, notify));
    }
  };

  const updateHandlingCharge = () => {
    if (transportationLocation === "")
      notify("Please Enter Transportation Location", { variant: "warning" });
    else if (transportationSite === "")
      notify("Please Enter Transportation Site", { variant: "warning" });
    else if (transportationClient === "")
      notify("Please Enter Transportation Client", { variant: "warning" });
    else if (transportationAmount === "")
      notify("Please Enter Transportation Amount", { variant: "warning" });
    else if (transportationType === "")
      notify("Please Enter Transportation Type", { variant: "warning" });
    else if (transportationSize === "")
      notify("Please Enter Transportation Size", { variant: "warning" });
    else {
      let data = {
        pk: transportationChargesMaster.containerTransportationChargesDetails
          .pk,
        type: transportationType,
        amount: transportationAmount,
        client: transportationClient,
        size: transportationSize,
        location: transportationLocation,
        site: transportationSite,
      };
      dispatch(
        updateMasterContainerTransportationCharges(
          transportationChargesMaster.containerTransportationChargesDetails.pk,
          data,
          history,
          notify
        )
      );
    }
  };

  const handleGoBack = () => {
    history.goBack();
  };

  const mapped =
    gateIn.allDropDown &&
    gateIn.allDropDown.client_data &&
    gateIn.allDropDown.client_data.map((obj) => obj.name);
  const filtered =
    mapped && mapped.filter((type, index) => mapped.indexOf(type) === index);

  return (
    <LayoutContainer footer={false}>
      <div>
        <Image
          src={require("../../../assets/images/back-arrow.png")}
          className={classes.backImage}
          onClick={handleGoBack}
        />
        <Typography variant="subtitle2">
          <Box fontWeight="fontWeightBold" m={1}>
            {transportationChargesMaster.containerTransportationChargesDetails
              .pk
              ? "Update Container Transportation Charge"
              : "Add Container Transportation Charge"}
          </Box>
        </Typography>
        <Paper className={classes.paperContainer} elevation={0}>
          <Grid container spacing={4} alignItems="center" justify="center">
            <Grid
              item
              xs={12}
              sm={4}
              style={theme.breakpoints.down("sm") && { padding: 7 }}
            >
              <Typography
                variant="subtitle1"
                className={classes.LabelTypography}
              >
                Location <span style={{ color: "red" }}>*</span>
              </Typography>

              <TextField
                id="container-transportation-charges-master-location"
                select
                value={transportationLocation}
                variant="outlined"
                fullWidth
                inputProps={{ className: classes.input }}
                onChange={(e) => {
                  setTransportationLocation(e.target.value);
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
              sm={4}
              style={theme.breakpoints.down("sm") && { padding: 7 }}
            >
              <Typography
                variant="subtitle1"
                className={classes.LabelTypography}
              >
                Site <span style={{ color: "red" }}>*</span>
              </Typography>
              <TextField
                id="container-transportation-charges-master-site"
                select
                value={transportationSite}
                variant="outlined"
                fullWidth
                inputProps={{ className: classes.input }}
                onChange={(e) => {
                  setTransportationSite(e.target.value);
                }}
                disabled={
                  (user.role === "Site Admin" || user.role === "Depot User") &&
                  true
                }
              >
                {transportationLocation !== "" &&
                  gateIn.allDropDown &&
                  gateIn.allDropDown.location_site_dashboard_list &&
                  gateIn.allDropDown.location_site_dashboard_list[
                    transportationLocation
                  ].map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
              </TextField>
            </Grid>
            {gateIn.allDropDown && filtered && (
              <Grid
                item
                xs={12}
                sm={4}
                style={theme.breakpoints.down("sm") && { padding: 7 }}
              >
                <Typography
                  variant="subtitle1"
                  className={classes.LabelTypography}
                >
                  Client Name <span style={{ color: "red" }}>*</span>
                </Typography>
                <Autocomplete
                  value={transportationClient}
                  onChange={(event, newValue) => {
                    setTransportationClient(newValue);
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
                        setTransportationClient(e.target.value);
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
              xs={12}
              sm={4}
              style={theme.breakpoints.down("sm") && { padding: 7 }}
            >
              <Typography
                variant="subtitle1"
                className={classes.LabelTypography}
              >
                Transportation Amount <span style={{ color: "red" }}>*</span>
              </Typography>
              <TextField
                id="container-transportation-charges-master-amount"
                type={"text"}
                value={transportationAmount}
                variant="outlined"
                fullWidth
                className={classes.textField}
                inputProps={{ className: classes.input }}
                onChange={(e) => setTransportationAmount(e.target.value)}
              />
            </Grid>
            <Grid
              item
              xs={12}
              sm={4}
              style={theme.breakpoints.down("sm") && { padding: 7 }}
            >
              <Typography
                variant="subtitle1"
                className={classes.LabelTypography}
              >
                Transportation Type <span style={{ color: "red" }}>*</span>
              </Typography>
              <TextField
                id="container-transportation-charges-master-type"
                select
                value={transportationType}
                variant="outlined"
                fullWidth
                inputProps={{ className: classes.input }}
                onChange={(e) => {
                  setTransportationType(e.target.value);
                }}
              >
                {gateIn.allDropDown &&
                  gateIn.allDropDown.arrived &&
                  gateIn.allDropDown.arrived.map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
              </TextField>
            </Grid>
            <Grid
              item
              xs={12}
              sm={4}
              style={theme.breakpoints.down("sm") && { padding: 7 }}
            >
              <Typography
                variant="subtitle1"
                className={classes.LabelTypography}
              >
                Size <span style={{ color: "red" }}>*</span>
              </Typography>
              <TextField
                id="container-transportation-charges-master-size"
                select
                value={transportationSize}
                variant="outlined"
                fullWidth
                inputProps={{ className: classes.input }}
                onChange={(e) => {
                  setTransportationSize(e.target.value);
                }}
              >
                {gateIn.allDropDown &&
                  gateIn.allDropDown.size_data &&
                  gateIn.allDropDown.size_data.map((option) => (
                    <MenuItem key={option.name} value={option.name}>
                      {option.name}
                    </MenuItem>
                  ))}
              </TextField>
            </Grid>
          </Grid>

          <Grid
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              marginTop: 20,
            }}
          >
            {transportationChargesMaster.containerTransportationChargesDetails
              .pk ? (
              <Button className={classes.button} onClick={updateHandlingCharge}>
                Update
              </Button>
            ) : (
              <Button className={classes.button} onClick={createHandlingCharge}>
                Save
              </Button>
            )}
          </Grid>
        </Paper>
      </div>
    </LayoutContainer>
  );
}
