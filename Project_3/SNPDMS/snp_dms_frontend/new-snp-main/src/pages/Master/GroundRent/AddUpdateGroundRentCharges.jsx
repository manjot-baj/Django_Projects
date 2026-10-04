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
  addMasterContainerGroundRentCharge,
  getSingleContainerGroundRentCharge,
  updateMasterContainerGroundRentCharge,
} from "../../../actions/master/GroundRentChargesMasterActions";
import { useSnackbar } from "notistack";
import { theme } from "../../../App";
import CustomBackButton from "@components/reusablecomponents/CustomBackButton";
import { custombackDropStyle, customLabelTypography } from "../../../utils/CustomClasses";

export default function AddUpdateContainerTypeSizeCode(props) {
  const dispatch = useDispatch();
  const history = useHistory();
  const store = useSelector((state) => state);
  const { groundRentChargesMaster, gateIn, user } = store;
   const { isloading } = useSelector((state) => state.ui);
  const [clientRefCode, setClientRefCode] = useState("");
  const [day1to30, setDay1to30] = useState("");
  const [day31to60, setDay31to60] = useState("");
  const [day61to90, setDay61to90] = useState("");
  const [day91to120, setDay91to120] = useState("");
  const [dayover120, setDayover120] = useState("");
  const [size, setSize] = useState("");
  const [location, setLocation] = useState(
    localStorage.getItem("location") ? localStorage.getItem("location") : ""
  );
  const [site, setSite] = useState(
    localStorage.getItem("site") ? localStorage.getItem("site") : ""
  );
  const notify = useSnackbar().enqueueSnackbar;

  useEffect(() => {
    if (props.history.location.state) {
      dispatch(
        getSingleContainerGroundRentCharge(
          props.history.location.state.allDetails.pk,
          notify
        )
      );
    }
  }, []);

  useEffect(() => {
    if (groundRentChargesMaster.containerGroundRentChargeDetails.pk) {
      setClientRefCode(
        groundRentChargesMaster.containerGroundRentChargeDetails.client_ref_code
      );
      setDay1to30(
        groundRentChargesMaster.containerGroundRentChargeDetails
          .day_1_to_30_amount
      );
      setDay31to60(
        groundRentChargesMaster.containerGroundRentChargeDetails
          .day_31_to_60_amount
      );
      setDay61to90(
        groundRentChargesMaster.containerGroundRentChargeDetails
          .day_61_to_90_amount
      );
      setDay91to120(
        groundRentChargesMaster.containerGroundRentChargeDetails
          .day_91_to_120_amount
      );
      setDayover120(
        groundRentChargesMaster.containerGroundRentChargeDetails
          .day_over_120_amount
      );
      setLocation(
        groundRentChargesMaster.containerGroundRentChargeDetails.location
      );
      setSite(groundRentChargesMaster.containerGroundRentChargeDetails.site);
    }
  }, [groundRentChargesMaster.containerGroundRentChargeDetails]);

  useEffect(() => {
    let reqArray = [
      "size_data",
      "client_ref_codes",
      "location_site_dashboard_list",
    ];

    dispatch(dropDownDispatch(reqArray, notify));
  }, []);

  const handleNumberDay1CodeChange = (e) => {
    const regex = /^[0-9]+$/;
    if (e === "" || regex.test(e)) {
      setDay1to30(e);
    }
  };
  const handleNumberDay31CodeChange = (e) => {
    const regex = /^[0-9]+$/;
    if (e === "" || regex.test(e)) {
      setDay31to60(e);
    }
  };
  const handleNumberDa61yCodeChange = (e) => {
    const regex = /^[0-9]+$/;
    if (e === "" || regex.test(e)) {
      setDay61to90(e);
    }
  };
  const handleNumberDay91CodeChange = (e) => {
    const regex = /^[0-9]+$/;
    if (e === "" || regex.test(e)) {
      setDay91to120(e);
    }
  };
  const handleNumberDay120CodeChange = (e) => {
    const regex = /^[0-9]+$/;
    if (e === "" || regex.test(e)) {
      setDayover120(e);
    }
  };
  const createGroundRentCharge = () => {
    if (clientRefCode === "")
      notify("Please Enter Client Ref Code", { variant: "warning" });
    else if (day1to30 === "")
      notify("Please Enter Day 1 to 30 Amount", { variant: "warning" });
    else if (day31to60 === "")
      notify("Please Enter Day 31 to 60 Amount", { variant: "warning" });
    else if (day61to90 === "")
      notify("Please Enter Day 61 to 90 Amount", { variant: "warning" });
    else if (day91to120 === "")
      notify("Please Enter Day 91 to 120 Amount", { variant: "warning" });
    else if (dayover120 === "")
      notify("Please Enter Day over 120 Amount", { variant: "warning" });
    else if (size === "") notify("Please Enter Size", { variant: "warning" });
    else if (location === "")
      notify("Please Enter Location", { variant: "warning" });
    else if (site === "") notify("Please Enter Site", { variant: "warning" });
    else {
      let data = {
        client_ref_code: clientRefCode,
        day_1_to_30_amount: day1to30,
        day_31_to_60_amount: day31to60,
        day_61_to_90_amount: day61to90,
        day_91_to_120_amount: day91to120,
        day_over_120_amount: dayover120,
        size: size,
        location: location,
        site: site,
      };
      dispatch(addMasterContainerGroundRentCharge(data, history, notify));
    }
  };

  const updateGroundRentCharge = () => {
    if (clientRefCode === "")
      notify("Please Enter Client Ref Code", { variant: "warning" });
    else if (day1to30 === "")
      notify("Please Enter Day 1 to 30 Amount", { variant: "warning" });
    else if (day31to60 === "")
      notify("Please Enter Day 31 to 60 Amount", { variant: "warning" });
    else if (day61to90 === "")
      notify("Please Enter Day 61 to 90 Amount", { variant: "warning" });
    else if (day91to120 === "")
      notify("Please Enter Day 91 to 120 Amount", { variant: "warning" });
    else if (dayover120 === "")
      notify("Please Enter Day over 120 Amount", { variant: "warning" });
    else if (size === "") notify("Please Enter Size", { variant: "warning" });
    else if (location === "")
      notify("Please Enter Location", { variant: "warning" });
    else if (site === "") notify("Please Enter Site", { variant: "warning" });
    else {
      let data = {
        pk: groundRentChargesMaster.containerGroundRentChargeDetails.pk,
        client_ref_code: clientRefCode,
        day_1_to_30_amount: day1to30,
        day_31_to_60_amount: day31to60,
        day_61_to_90_amount: day61to90,
        day_91_to_120_amount: day91to120,
        day_over_120_amount: dayover120,
        size: size,
        location: location,
        site: site,
      };
      dispatch(
        updateMasterContainerGroundRentCharge(
          groundRentChargesMaster.containerGroundRentChargeDetails.pk,
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

  return (
    <LayoutContainer footer={false}>
      <div>
        <CustomBackButton handleGoBack={handleGoBack} />
        <Typography variant="subtitle2">
          <Box fontWeight="fontWeightBold" m={1}>
            {groundRentChargesMaster.containerGroundRentChargeDetails.pk
              ? "Update Container Ground Rent Charges"
              : "Add Container Ground Rent Charges"}
          </Box>
        </Typography>
        <Paper
          sx={(theme) => ({
            padding: theme.spacing(2, 2),
          })}
          elevation={0}
        >
          <Grid container spacing={1} alignItems="center" justify="center">
            {gateIn.allDropDown && gateIn.allDropDown.client_ref_codes && (
              <Grid
                item
                size={{ xs: 12, sm: 4 }}
                style={theme.breakpoints.down("sm") && { padding: 7 }}
              >
                <Typography variant="subtitle1" sx={customLabelTypography}>
                  Client Ref Code <span style={{ color: "red" }}>*</span>
                </Typography>
                <Autocomplete
                  value={clientRefCode}
                  onChange={(event, newValue) => {
                    setClientRefCode(newValue);
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
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          "& fieldset": {
                            borderColor: "#243545",
                          },
                        },
                      }}
                      onBlur={(e) => {
                        setClientRefCode(e.target.value);
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
                      fullWidth
                    />
                  )}
                />
              </Grid>
            )}

            <Grid
              item
              size={{ xs: 12, sm: 4 }}
              style={theme.breakpoints.down("sm") && { padding: 7 }}
            >
              <Typography variant="subtitle1" sx={customLabelTypography}>
                Day 1 to 30 Amount <span style={{ color: "red" }}>*</span>
              </Typography>
              <TextField
                type={"text"}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    "& fieldset": {
                      borderColor: "#243545",
                    },
                  },
                }}
                id="day-1-to-30-amount"
                value={day1to30}
                variant="outlined"
                fullWidth
                size="small"
                onChange={(e) => handleNumberDay1CodeChange(e.target.value)}
              />
            </Grid>

            <Grid
              item
              size={{ xs: 12, sm: 4 }}
              style={theme.breakpoints.down("sm") && { padding: 7 }}
            >
              <Typography variant="subtitle1" sx={customLabelTypography}>
                Day 31 to 60 Amount <span style={{ color: "red" }}>*</span>
              </Typography>
              <TextField
                type={"text"}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    "& fieldset": {
                      borderColor: "#243545",
                    },
                  },
                }}
                id="day-31-to-60-amount"
                value={day31to60}
                variant="outlined"
                fullWidth
                size="small"
                onChange={(e) => handleNumberDay31CodeChange(e.target.value)}
              />
            </Grid>

            <Grid
              item
              size={{ xs: 12, sm: 4 }}
              style={theme.breakpoints.down("sm") && { padding: 7 }}
            >
              <Typography variant="subtitle1" sx={customLabelTypography}>
                Day 61 to 90 Amount <span style={{ color: "red" }}>*</span>
              </Typography>
              <TextField
                type={"text"}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    "& fieldset": {
                      borderColor: "#243545",
                    },
                  },
                }}
                id="day-61-to-90-amount"
                value={day61to90}
                variant="outlined"
                fullWidth
                size="small"
                onChange={(e) => handleNumberDa61yCodeChange(e.target.value)}
              />
            </Grid>

            <Grid
              item
              size={{ xs: 12, sm: 4 }}
              style={theme.breakpoints.down("sm") && { padding: 7 }}
            >
              <Typography variant="subtitle1" sx={customLabelTypography}>
                Day 91 to 120 Amount <span style={{ color: "red" }}>*</span>
              </Typography>
              <TextField
                type={"text"}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    "& fieldset": {
                      borderColor: "#243545",
                    },
                  },
                }}
                id="day-91-to-120-amount"
                value={day91to120}
                variant="outlined"
                fullWidth
                size="small"
                onChange={(e) => handleNumberDay91CodeChange(e.target.value)}
              />
            </Grid>

            <Grid
              item
              size={{ xs: 12, sm: 4 }}
              style={theme.breakpoints.down("sm") && { padding: 7 }}
            >
              <Typography variant="subtitle1" sx={customLabelTypography}>
                Day over 120 Amount <span style={{ color: "red" }}>*</span>
              </Typography>
              <TextField
                type={"text"}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    "& fieldset": {
                      borderColor: "#243545",
                    },
                  },
                }}
                id="day-over-120-amount"
                value={dayover120}
                variant="outlined"
                fullWidth
                size="small"
                onChange={(e) => handleNumberDay120CodeChange(e.target.value)}
              />
            </Grid>

            <Grid
              item
              size={{ xs: 12, sm: 4 }}
              style={theme.breakpoints.down("sm") && { padding: 7 }}
            >
              <Typography variant="subtitle1" sx={customLabelTypography}>
                Size <span style={{ color: "red" }}>*</span>
              </Typography>
              <TextField
                id="container-ground-rent-master-size"
                select
                value={size}
                variant="outlined"
                fullWidth
                size="small"
                onChange={(e) => {
                  setSize(e.target.value);
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

            <Grid
              item
              size={{ xs: 12, sm: 4 }}
              style={theme.breakpoints.down("sm") && { padding: 7 }}
            >
              <Typography variant="subtitle1" sx={customLabelTypography}>
                Location <span style={{ color: "red" }}>*</span>
              </Typography>

              <TextField
                id="client-master-location"
                select
                value={location}
                variant="outlined"
                fullWidth
                size="small"
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
              size={{ xs: 12, sm: 4 }}
              style={theme.breakpoints.down("sm") && { padding: 7 }}
            >
              <Typography variant="subtitle1" sx={customLabelTypography}>
                Site <span style={{ color: "red" }}>*</span>
              </Typography>
              <TextField
                id="client-master-code"
                select
                value={site}
                variant="outlined"
                fullWidth
                size="small"
                onChange={(e) => {
                  setSite(e.target.value);
                }}
                disabled={
                  (user.role === "Site Admin" || user.role === "Depot User") &&
                  true
                }
              >
                {location !== "" &&
                  gateIn.allDropDown &&
                  gateIn.allDropDown.location_site_dashboard_list &&
                  gateIn.allDropDown.location_site_dashboard_list[location].map(
                    (option) => (
                      <MenuItem key={option} value={option}>
                        {option}
                      </MenuItem>
                    )
                  )}
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
            {groundRentChargesMaster.containerGroundRentChargeDetails.pk ? (
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
                onClick={updateGroundRentCharge}
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
                onClick={createGroundRentCharge}
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
