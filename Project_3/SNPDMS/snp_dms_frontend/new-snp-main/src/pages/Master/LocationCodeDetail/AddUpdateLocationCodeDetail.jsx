import React, { useState, useEffect } from "react";
import {
  Typography,
  Paper,
  Grid,
  Box,
  Button,
  TextField,
  MenuItem,
  Stack,
  Backdrop,
  CircularProgress,
} from "@mui/material";

import { useHistory } from "react-router-dom";
import LayoutContainer from "@components/reusablecomponents/LayoutContainer";
import { useDispatch, useSelector } from "react-redux";
import { dropDownDispatch } from "../../../actions/GateInActions";
import {
  getSingleLocationCodeDetail,
  addMasterLocationCodeDetail,
  updateMasterLocationCodeDetail,
} from "../../../actions/master/LocationCodeDetailMasterActions";
import { useSnackbar } from "notistack";
import { theme } from "../../../App";
import { Image } from "semantic-ui-react";
import { custombackDropStyle, customLabelTypography } from "../../../utils/CustomClasses";
import CustomBackButton from "@components/reusablecomponents/CustomBackButton";

export default function AddUpdateLocationCodeDetail(props) {
  const dispatch = useDispatch();
  const history = useHistory();
  const store = useSelector((state) => state);
  const { locationCodeDetailMaster, gateIn, user } = store;
   const { isloading } = useSelector((state) => state.ui);
  const [locationCodeDetailNameCode, setLocationCodeDetailNameCode] =
    useState("");
  const [locationCodeDetailType, setLocationCodeDetailType] = useState("");
  const [depotName, setDepotName] = useState("");
  const [ovaCode, setOvaCode] = useState("");
  const [locationCodeDetailLocation, setLocationCodeDetailLocation] = useState(
    localStorage.getItem("location") ? localStorage.getItem("location") : ""
  );
  const [locationCodeDetailSite, setLocationCodeDetailSite] = useState(
    localStorage.getItem("site") ? localStorage.getItem("site") : ""
  );
  const notify = useSnackbar().enqueueSnackbar;

  useEffect(() => {
    let reqArray = ["arrived", "location_site_dashboard_list"];

    dispatch(dropDownDispatch(reqArray, notify));
  }, []);

  useEffect(() => {
    if (props.history.location.state) {
      dispatch(
        getSingleLocationCodeDetail(
          props.history.location.state.allDetails.pk,
          notify
        )
      );
    }
  }, []);

  useEffect(() => {
    if (locationCodeDetailMaster.locationCodeDetails.pk) {
      setLocationCodeDetailNameCode(
        locationCodeDetailMaster.locationCodeDetails.name_code
      );
      setLocationCodeDetailType(
        locationCodeDetailMaster.locationCodeDetails.type
      );
      setLocationCodeDetailLocation(
        locationCodeDetailMaster.locationCodeDetails.location
      );
      setLocationCodeDetailSite(
        locationCodeDetailMaster.locationCodeDetails.site
      );
      setDepotName(locationCodeDetailMaster.locationCodeDetails.depot_name);
      setOvaCode(locationCodeDetailMaster.locationCodeDetails.ova_code);
    }
  }, [locationCodeDetailMaster.locationCodeDetails]);

  const createLocationCodeDetail = () => {
    if (locationCodeDetailNameCode === "")
      notify("Please Enter Name Code", { variant: "warning" });
    else if (!locationCodeDetailNameCode.includes("-"))
      notify("Name and Code should be Hyphen (-) separated", {
        variant: "warning",
      });
    else if (locationCodeDetailType === "")
      notify("Please Enter Type", { variant: "warning" });
    else if (locationCodeDetailLocation === "")
      notify("Please Enter Location", { variant: "warning" });
    else if (locationCodeDetailSite === "")
      notify("Please Enter Site", { variant: "warning" });
    else {
      let data = {
        name_code: locationCodeDetailNameCode,
        type: locationCodeDetailType,
        location: locationCodeDetailLocation,
        site: locationCodeDetailSite,
        ova_code: ovaCode,
        depot_name: depotName,
      };
      dispatch(addMasterLocationCodeDetail(data, history, notify));
    }
  };

  const updateLocationCodeDetail = () => {
    if (locationCodeDetailNameCode === "")
      notify("Please Enter Name Code", { variant: "warning" });
    else if (!locationCodeDetailNameCode.includes("-"))
      notify("Name and Code should be Hyphen (-) separated", {
        variant: "warning",
      });
    else if (locationCodeDetailType === "")
      notify("Please Enter Type", { variant: "warning" });
    else if (locationCodeDetailLocation === "")
      notify("Please Enter Location", { variant: "warning" });
    else if (locationCodeDetailSite === "")
      notify("Please Enter Site", { variant: "warning" });
    else {
      let data = {
        pk: locationCodeDetailMaster.locationCodeDetails.pk,
        name_code: locationCodeDetailNameCode,
        type: locationCodeDetailType,
        location: locationCodeDetailLocation,
        site: locationCodeDetailSite,
        ova_code: ovaCode,
        depot_name: depotName,
      };
      dispatch(
        updateMasterLocationCodeDetail(
          locationCodeDetailMaster.locationCodeDetails.pk,
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
            {locationCodeDetailMaster.locationCodeDetails.pk
              ? "Update Location Code Detail"
              : "Add Location Code Detail"}
          </Box>
        </Typography>
        <Paper
          sx={(theme) => ({
            padding: theme.spacing(2, 2),
          })}
          elevation={0}
        >
          <Grid container spacing={1}>
            <Grid
              item
              size={{ xs: 12, sm: 6, lg: 3 }}
              style={theme.breakpoints.down("sm") && { padding: 7 }}
            >
              <Typography variant="subtitle1" sx={customLabelTypography}>
                Name Code <span style={{ color: "red" }}>*</span>
              </Typography>

              <TextField
                id="vessel-bkg-no"
                type={"text"}
                value={locationCodeDetailNameCode}
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
                onChange={(e) => setLocationCodeDetailNameCode(e.target.value)}
              />
            </Grid>
            <Grid
              item
              size={{ xs: 12, sm: 6, lg: 3 }}
              style={theme.breakpoints.down("sm") && { padding: 7 }}
            >
              <Typography variant="subtitle1" sx={customLabelTypography}>
                Type <span style={{ color: "red" }}>*</span>
              </Typography>

              <TextField
                id="client-master-code"
                select
                value={locationCodeDetailType}
                variant="outlined"
                fullWidth
                size="small"
                onChange={(e) => {
                  setLocationCodeDetailType(e.target.value);
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
              size={{ xs: 12, sm: 6, lg: 3 }}
              style={theme.breakpoints.down("sm") && { padding: 7 }}
            >
              <Typography variant="subtitle1" sx={customLabelTypography}>
                Location <span style={{ color: "red" }}>*</span>
              </Typography>

              <TextField
                id="vessel-bkg-no-master-location"
                select
                value={locationCodeDetailLocation}
                variant="outlined"
                fullWidth
                size="small"
                onChange={(e) => {
                  setLocationCodeDetailLocation(e.target.value);
                }}
                disabled={
                  (user.role === "Location Admin" ||
                    user.role === "Site Admin") &&
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
              size={{ xs: 12, sm: 6, lg: 3 }}
              style={theme.breakpoints.down("sm") && { padding: 7 }}
            >
              <Typography variant="subtitle1" sx={customLabelTypography}>
                Site <span style={{ color: "red" }}>*</span>
              </Typography>

              <TextField
                id="vessel-bkg-no-master-site"
                select
                value={locationCodeDetailSite}
                variant="outlined"
                fullWidth
                size="small"
                onChange={(e) => {
                  setLocationCodeDetailSite(e.target.value);
                }}
                disabled={
                  (user.role === "Site Admin" || user.role === "Depot User") &&
                  true
                }
              >
                {Location !== "" &&
                  gateIn.allDropDown &&
                  gateIn.allDropDown.location_site_dashboard_list &&
                  gateIn.allDropDown.location_site_dashboard_list[
                    locationCodeDetailLocation
                  ].map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
              </TextField>
            </Grid>

            <Grid
              item
              size={{ xs: 12, sm: 6, lg: 3 }}
              style={theme.breakpoints.down("sm") && { padding: 7 }}
            >
              <Typography variant="subtitle1" sx={customLabelTypography}>
                Depot name <span style={{ color: "red" }}>*</span>
              </Typography>

              <TextField
                id="vessel-bkg-no-master-site"
                name="depot_name"
                value={depotName}
                variant="outlined"
                fullWidth
                size="small"
                onChange={(e) => {
                  setDepotName(e.target.value);
                }}
              ></TextField>
            </Grid>

            <Grid
              item
              size={{ xs: 12, sm: 6, lg: 3 }}
              style={theme.breakpoints.down("sm") && { padding: 7 }}
            >
              <Typography variant="subtitle1" sx={customLabelTypography}>
                OVA code <span style={{ color: "red" }}>*</span>
              </Typography>

              <TextField
                id="vessel-bkg-no-master-site"
                name="ova_code"
                value={ovaCode}
                variant="outlined"
                fullWidth
                size="small"
                onChange={(e) => {
                  setOvaCode(e.target.value);
                }}
              ></TextField>
            </Grid>
          </Grid>
          <Stack
            direction={"row"}
            alignItems={"center"}
            justifyContent={"center"}
          >
            {locationCodeDetailMaster.locationCodeDetails.pk ? (
              <Button
                variant="contained"
                color="primary"
                sx={{
                  fontSize: 12.5,
                  borderRadius: 2,
                  marginLeft: "auto",
                  marginRight: "auto",
                  marginTop: 4,
                  width: "35%",
                }}
                onClick={updateLocationCodeDetail}
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
                  width: "35%",
                }}
                onClick={createLocationCodeDetail}
                style={{ height: "45px" }}
              >
                Save
              </Button>
            )}
          </Stack>
        </Paper>
      </div>
          <Backdrop sx={custombackDropStyle} open={isloading}>
        <CircularProgress color="inherit" />
      </Backdrop>
    </LayoutContainer>
  );
}
