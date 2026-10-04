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
  Autocomplete,
  Backdrop,
  CircularProgress,
} from "@mui/material";

import { useHistory } from "react-router-dom";
import LayoutContainer from "@components/reusablecomponents/LayoutContainer";
import { useDispatch, useSelector } from "react-redux";
import { dropDownDispatch } from "../../../actions/GateInActions";
import {
  addMasterContainerHandlingCharge,
  getSingleContainerHandlingCharge,
  updateMasterContainerHandlingCharge,
} from "../../../actions/master/HandlingChargesMasterActions";
import { useSnackbar } from "notistack";
import { theme } from "../../../App";
import CustomBackButton from "@components/reusablecomponents/CustomBackButton";
import {
  custombackDropStyle,
  customLabelTypography,
} from "../../../utils/CustomClasses";

export default function AddUpdateContainerTypeSizeCode(props) {
  const dispatch = useDispatch();
  const history = useHistory();
  const store = useSelector((state) => state);
  const { handlingChargesMaster, gateIn, user } = store;
  const { isloading } = useSelector((state) => state.ui);
  const [handlingType, setHandlingType] = useState("");
  const [handlingRate, setHandlingRate] = useState("");
  const [handlingAmount, setHandlingAmount] = useState("");
  const [handlingClient, setHandlingClient] = useState("");
  const [handlingSize, setHandlingSize] = useState("");
  const [handlingLocation, setHandlingLocation] = useState(
    localStorage.getItem("location") ? localStorage.getItem("location") : "",
  );
  const [handlingSite, setHandlingSite] = useState(
    localStorage.getItem("site") ? localStorage.getItem("site") : "",
  );
  const notify = useSnackbar().enqueueSnackbar;

  useEffect(() => {
    if (props.history.location.state) {
      dispatch(
        getSingleContainerHandlingCharge(
          props.history.location.state.allDetails.pk,
          notify,
        ),
      );
    }
  }, []);

  useEffect(() => {
    if (handlingChargesMaster.containerHandlingChargeDetails.pk) {
      setHandlingType(
        handlingChargesMaster.containerHandlingChargeDetails.type,
      );
      setHandlingRate(
        handlingChargesMaster.containerHandlingChargeDetails.rate_of,
      );
      setHandlingAmount(
        handlingChargesMaster.containerHandlingChargeDetails.amount,
      );
      setHandlingClient(
        handlingChargesMaster.containerHandlingChargeDetails.client,
      );
      setHandlingSize(
        handlingChargesMaster.containerHandlingChargeDetails.size,
      );
      setHandlingLocation(
        handlingChargesMaster.containerHandlingChargeDetails.location,
      );
      setHandlingSite(
        handlingChargesMaster.containerHandlingChargeDetails.site,
      );
    }
  }, [handlingChargesMaster.containerHandlingChargeDetails]);

  useEffect(() => {
    let reqArray = [
      "client_data",
      "type_data",
      "size_data",
      "location_site_dashboard_list",
    ];

    dispatch(dropDownDispatch(reqArray, notify));
  }, []);

  const createHandlingCharge = () => {
    if (handlingClient === "") {
      notify("Please Enter Client Name", { variant: "warning" });
    } else if (handlingRate === "") {
      notify("Please Enter Container Rate Type", { variant: "warning" });
    } else if (handlingSize === "") {
      notify("Please Enter Container Size", { variant: "warning" });
    } else if (handlingType === "") {
      notify("Please Enter Container Type", { variant: "warning" });
    } else if (handlingAmount === "") {
      notify("Please Enter Container Amount", { variant: "warning" });
    } else {
      let data = {
        type: handlingType,
        rate_of: handlingRate,
        amount: handlingAmount,
        client: handlingClient,
        size: handlingSize,
        location: handlingLocation,
        site: handlingSite,
      };
      dispatch(addMasterContainerHandlingCharge(data, history, notify));
    }
  };

  const updateHandlingCharge = () => {
    if (handlingClient === "") {
      notify("Please Enter Client Name", { variant: "warning" });
    } else if (handlingRate === "") {
      notify("Please Enter Container Rate Type", { variant: "warning" });
    } else if (handlingSize === "") {
      notify("Please Enter Container Size", { variant: "warning" });
    } else if (handlingType === "") {
      notify("Please Enter Container Type", { variant: "warning" });
    } else if (handlingAmount === "") {
      notify("Please Enter Container Amount", { variant: "warning" });
    } else {
      let data = {
        pk: handlingChargesMaster.containerHandlingChargeDetails.pk,
        type: handlingType,
        rate_of: handlingRate,
        amount: handlingAmount,
        client: handlingClient,
        size: handlingSize,
        location: handlingLocation,
        site: handlingSite,
      };
      dispatch(
        updateMasterContainerHandlingCharge(
          handlingChargesMaster.containerHandlingChargeDetails.pk,
          data,
          history,
          notify,
        ),
      );
    }
  };

  const mapped =
    gateIn.allDropDown &&
    gateIn.allDropDown.client_data &&
    gateIn.allDropDown.client_data.map((obj) => obj.name);
  const filtered =
    mapped && mapped.filter((type, index) => mapped.indexOf(type) === index);

  const handleGoBack = () => {
    history.goBack();
  };

  return (
    <LayoutContainer footer={false}>
      <div>
        <CustomBackButton handleGoBack={handleGoBack} />
        <Typography variant="subtitle2">
          <Box fontWeight="fontWeightBold" m={1}>
            {handlingChargesMaster.containerHandlingChargeDetails.pk
              ? "Update Container Handling Charge"
              : "Add Container Handling Charge"}
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
              style={theme.breakpoints.down("sm") && { padding: 7 }}
            >
              <Typography variant="subtitle1" sx={customLabelTypography}>
                Location
              </Typography>

              <TextField
                id="client-master-code"
                select
                value={handlingLocation}
                variant="outlined"
                fullWidth
                size="small"
                onChange={(e) => {
                  setHandlingLocation(e.target.value);
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
                    gateIn.allDropDown.location_site_dashboard_list,
                  ).map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
              </TextField>
            </Grid>
            <Grid
              item
              size={{ xs: 12, sm: 3 }}
              style={theme.breakpoints.down("sm") && { padding: 7 }}
            >
              <Typography variant="subtitle1" sx={customLabelTypography}>
                Site
              </Typography>
              <TextField
                id="client-master-code"
                select
                value={handlingSite}
                variant="outlined"
                fullWidth
                size="small"
                onChange={(e) => {
                  setHandlingSite(e.target.value);
                }}
                disabled={
                  (user.role === "Site Admin" || user.role === "Depot User") &&
                  true
                }
              >
                {handlingLocation !== "" &&
                  gateIn.allDropDown &&
                  gateIn.allDropDown.location_site_dashboard_list &&
                  gateIn.allDropDown.location_site_dashboard_list[
                    handlingLocation
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
                size={{ xs: 12, sm: 3 }}
                style={theme.breakpoints.down("sm") && { padding: 7 }}
              >
                <Typography variant="subtitle1" sx={customLabelTypography}>
                  Client Name <span style={{ color: "red" }}>*</span>
                </Typography>

                <Autocomplete
                  value={handlingClient}
                  onChange={(event, newValue) => {
                    setHandlingClient(newValue);
                  }}
                  style={{ padding: 0 }}
                  sx={{
                    "& .MuiAutocomplete-inputRoot[class*='MuiOutlinedInput-root']":
                      {
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
                        setHandlingClient(e.target.value);
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
              size={{ xs: 12, sm: 3 }}
              style={theme.breakpoints.down("sm") && { padding: 7 }}
            >
              <Typography variant="subtitle1" sx={customLabelTypography}>
                Container Rate Type<span style={{ color: "red" }}>*</span>
              </Typography>

              <TextField
                id="container-handling-charges-master-rate"
                select
                value={handlingRate}
                variant="outlined"
                fullWidth
                size="small"
                onChange={(e) => {
                  setHandlingRate(e.target.value);
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
              size={{ xs: 12, sm: 3 }}
              style={theme.breakpoints.down("sm") && { padding: 7 }}
            >
              <Typography variant="subtitle1" sx={customLabelTypography}>
                Container Size <span style={{ color: "red" }}>*</span>
              </Typography>
              <TextField
                id="container-type-size-code-master-size"
                select
                value={handlingSize}
                variant="outlined"
                fullWidth
                size="small"
                onChange={(e) => {
                  setHandlingSize(e.target.value);
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

            {gateIn.allDropDown && gateIn.allDropDown.type_data && (
              <Grid
                item
                size={{ xs: 12, sm: 3 }}
                style={theme.breakpoints.down("sm") && { padding: 7 }}
              >
                <Typography variant="subtitle1" sx={customLabelTypography}>
                  Container Type <span style={{ color: "red" }}>*</span>
                </Typography>
                <Autocomplete
                  value={handlingType}
                  onChange={(event, newValue) => {
                    setHandlingType(newValue);
                  }}
                  style={{ padding: 0 }}
                  sx={{
                    "& .MuiAutocomplete-inputRoot[class*='MuiOutlinedInput-root']":
                      {
                        padding: 0,
                        height: "35px",
                      },
                  }}
                  options={gateIn.allDropDown.type_data.map(
                    (option) => option.name,
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
                        setHandlingType(e.target.value);
                        dispatch({
                          type: gateIn.allDropDown.type_data.map((option) => (
                            <MenuItem key={option} value={option}>
                              {option.name}
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
              size={{ xs: 12, sm: 3 }}
              style={theme.breakpoints.down("sm") && { padding: 7 }}
            >
              <Typography variant="subtitle1" sx={customLabelTypography}>
                Container Amount <span style={{ color: "red" }}>*</span>
              </Typography>
              <TextField
                id="container-handling-charges-master-type"
                type={"text"}
                value={handlingAmount}
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
                onChange={(e) => setHandlingAmount(e.target.value)}
              />
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
            {handlingChargesMaster.containerHandlingChargeDetails.pk ? (
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
