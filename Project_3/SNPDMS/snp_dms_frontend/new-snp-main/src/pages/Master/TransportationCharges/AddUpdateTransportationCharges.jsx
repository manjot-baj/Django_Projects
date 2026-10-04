import React, { useState, useEffect } from "react";
import {

  Typography,
  Paper,
  Grid,
  Box,
  Button,
  TextField,
  MenuItem,
  Autocomplete,
  Backdrop,
  CircularProgress,
} from "@mui/material";

import { useHistory } from "react-router-dom";
import LayoutContainer from "@components/reusablecomponents/LayoutContainer";
import { useDispatch, useSelector } from "react-redux";
import { dropDownDispatch } from "../../../actions/GateInActions";
import {
  addMasterContainerTransportationCharges,
  getSingleContainerTransportationCharges,
  updateMasterContainerTransportationCharges,
} from "../../../actions/master/TransportationChargesMasterAction";
import { useSnackbar } from "notistack";
import { theme } from "../../../App";

import { custombackDropStyle, customLabelTypography } from "../../../utils/CustomClasses";
import CustomBackButton from "@components/reusablecomponents/CustomBackButton";



export default function AddUpdateContainerTypeSizeCode(props) {

  const dispatch = useDispatch();
  const history = useHistory();
  const store = useSelector((state) => state);
  const { transportationChargesMaster, gateIn, user } = store;
    const { isloading } = useSelector((state) => state.ui);
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
      <CustomBackButton handleGoBack={handleGoBack}
        />
        <Typography variant="subtitle2">
          <Box fontWeight="fontWeightBold" m={1}>
            {transportationChargesMaster.containerTransportationChargesDetails
              .pk
              ? "Update Container Transportation Charge"
              : "Add Container Transportation Charge"}
          </Box>
        </Typography>
        <Paper
          sx={(theme) => ({
            padding: theme.spacing(2, 2),
          })}
          elevation={0}
        >
          <Grid container spacing={1} alignItems="center" justify="center">
            <Grid
              item
              size={{xs:12,sm:4}}
            
              style={theme.breakpoints.down("sm") && { padding: 7 }}
            >
              <Typography variant="subtitle1" sx={customLabelTypography}>
                Location <span style={{ color: "red" }}>*</span>
              </Typography>

              <TextField
                id="container-transportation-charges-master-location"
                select
                value={transportationLocation}
                variant="outlined"
                fullWidth
                size="small"
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
              size={{xs:12,sm:4}}
              style={theme.breakpoints.down("sm") && { padding: 7 }}
            >
              <Typography variant="subtitle1" sx={customLabelTypography}>
                Site <span style={{ color: "red" }}>*</span>
              </Typography>
              <TextField
                id="container-transportation-charges-master-site"
                select
                value={transportationSite}
                variant="outlined"
                fullWidth
                size="small"
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
                size={{xs:12,sm:4}}
                style={theme.breakpoints.down("sm") && { padding: 7 }}
              >
                <Typography variant="subtitle1" sx={customLabelTypography}>
                  Client Name <span style={{ color: "red" }}>*</span>
                </Typography>
                <Autocomplete
                  value={transportationClient}
                  onChange={(event, newValue) => {
                    setTransportationClient(newValue);
                  }}
                  style={{ padding: 0 }}
                    sx={{
                  "& .MuiAutocomplete-inputRoot[class*='MuiOutlinedInput-root']": {
                    padding: 0,
                    height: "35px",
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
              size={{xs:12,sm:4}}
              style={theme.breakpoints.down("sm") && { padding: 7 }}
            >
              <Typography variant="subtitle1" sx={customLabelTypography}>
                Transportation Amount <span style={{ color: "red" }}>*</span>
              </Typography>
              <TextField
                id="container-transportation-charges-master-amount"
                type={"text"}
                value={transportationAmount}
                variant="outlined"
                fullWidth
                 sx={{
                        "& .MuiOutlinedInput-root": {
                          "& fieldset": {
                            borderColor: "#243545",
                          },
                        },
                      }}
                size="small"
                onChange={(e) => setTransportationAmount(e.target.value)}
              />
            </Grid>
            <Grid
              item
              size={{xs:12,sm:4}}
              style={theme.breakpoints.down("sm") && { padding: 7 }}
            >
              <Typography variant="subtitle1" sx={customLabelTypography}>
                Transportation Type <span style={{ color: "red" }}>*</span>
              </Typography>
              <TextField
                id="container-transportation-charges-master-type"
                select
                value={transportationType}
                variant="outlined"
                fullWidth
                size="small"
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
              size={{xs:12,sm:4}}
              style={theme.breakpoints.down("sm") && { padding: 7 }}
            >
              <Typography variant="subtitle1" sx={customLabelTypography}>
                Size <span style={{ color: "red" }}>*</span>
              </Typography>
              <TextField
                id="container-transportation-charges-master-size"
                select
                value={transportationSize}
                variant="outlined"
                fullWidth
                size="small"
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
              marginTop: 4,
            }}
          >
            {transportationChargesMaster.containerTransportationChargesDetails
              .pk ? (
              <Button
                  variant="contained"
              color="primary"
                sx={{
                  fontSize: 12.5,
                  borderRadius: 2,
                  marginLeft: "auto",
                  marginRight: "auto",
                  marginTop: 4,
                  width: "30%",
             
                }}
                onClick={updateHandlingCharge}
              >
                Update
              </Button>
            ) : (
              <Button
                  variant="contained"
              color="primary"
                sx={{
                  fontSize: 12.5,
                  borderRadius: 2,
                  marginLeft: "auto",
                  marginRight: "auto",
                  marginTop: 4,
                  width: "30%",
                
                }}
                onClick={createHandlingCharge}
              >
                Save
              </Button>
            )}
          </Grid>
        </Paper>
      </div>
          <Backdrop sx={custombackDropStyle} open={isloading}>
        <CircularProgress color="inherit" />
      </Backdrop>
    </LayoutContainer>
  );
}
