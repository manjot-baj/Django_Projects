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
  getSingleVesselVoyageDetail,
  addMasterVesselVoyageDetail,
  updateMasterVesselVoyageDetail,
} from "../../../actions/master/VesselVoyageDetailMasterActions";
import { getVesselBkgNoListings } from "../../../actions/master/VesselBkgNoMasterActions";
import { useSnackbar } from "notistack";
import { theme } from "../../../App";
import CustomBackButton from "@components/reusablecomponents/CustomBackButton";
import {
  custombackDropStyle,
  customLabelTypography,
} from "../../../utils/CustomClasses";

export default function AddUpdateVesselVoyageDetail(props) {
  const dispatch = useDispatch();
  const history = useHistory();
  const store = useSelector((state) => state);
  const { vesselVoyageDetailMaster, gateIn, user } = store;
  const { isloading } = useSelector((state) => state.ui);
  const [vesselVoyageDetailLocation, setVesselVoyageDetailLocation] = useState(
    localStorage.getItem("location") ? localStorage.getItem("location") : "",
  );
  const [vesselVoyageDetailSite, setVesselVoyageDetailSite] = useState(
    localStorage.getItem("site") ? localStorage.getItem("site") : "",
  );
  const [vesselVoyageDetailBookingNo, setVesselVoyageDetailBookingNo] =
    useState("");
  const [vesselVoyageDetailName, setVesselVoyageDetailName] = useState("");
  const [vesselVoyageName, setVesselVoyageName] = useState("");
  const [vesselVoyageNumber, setVesselVoyageNumber] = useState("");
  const notify = useSnackbar().enqueueSnackbar;

  useEffect(() => {
    let reqArray = ["vessel_booking_no", "location_site_dashboard_list"];
    dispatch(dropDownDispatch(reqArray, notify));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (props.history.location.state) {
      dispatch(
        getSingleVesselVoyageDetail(
          props.history.location.state.allDetails.pk,
          notify,
        ),
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (vesselVoyageDetailMaster.vesselVoyageDetail.pk) {
      setVesselVoyageDetailLocation(
        vesselVoyageDetailMaster.vesselVoyageDetail.location,
      );
      setVesselVoyageDetailSite(
        vesselVoyageDetailMaster.vesselVoyageDetail.site,
      );
      setVesselVoyageDetailBookingNo(
        vesselVoyageDetailMaster.vesselVoyageDetail.booking_no,
      );
      setVesselVoyageDetailName(
        vesselVoyageDetailMaster.vesselVoyageDetail.vessel_voyage_name,
      );
      setVesselVoyageName(
        vesselVoyageDetailMaster.vesselVoyageDetail.vessel_name,
      );
      setVesselVoyageNumber(
        vesselVoyageDetailMaster.vesselVoyageDetail.voyage_no,
      );
    }
  }, [vesselVoyageDetailMaster.vesselVoyageDetail]);

  const createVesselVoyageDetail = () => {
    if (vesselVoyageDetailLocation === "")
      notify("Please Enter Location", { variant: "warning" });
    else if (vesselVoyageDetailSite === "")
      notify("Please Enter Site", { variant: "warning" });
    else if (vesselVoyageDetailName === "")
      notify("Please Enter Name", { variant: "warning" });
    else if (
      gateIn.allDropDown &&
      gateIn.allDropDown.vessel_booking_no &&
      vesselVoyageDetailBookingNo === ""
    )
      notify("Please Enter Booking Number", { variant: "warning" });
    else if (vesselVoyageDetailName.indexOf("-") === -1)
      notify("Vessel Name - Voyage No should be Hyphen(-) separated", {
        variant: "warning",
      });
    else {
      let data = {
        location: vesselVoyageDetailLocation,
        site: vesselVoyageDetailSite,
        booking_no: vesselVoyageDetailBookingNo,
        vessel_voyage_name: vesselVoyageDetailName,
      };
      dispatch(addMasterVesselVoyageDetail(data, history, notify));
    }
  };

  const updateVesselVoyageDetail = () => {
    if (vesselVoyageDetailLocation === "")
      notify("Please Enter Location", { variant: "warning" });
    else if (vesselVoyageDetailSite === "")
      notify("Please Enter Site", { variant: "warning" });
    else if (vesselVoyageDetailName === "")
      notify("Please Enter Name", { variant: "warning" });
    else if (
      gateIn.allDropDown &&
      gateIn.allDropDown.vessel_booking_no &&
      vesselVoyageDetailBookingNo === ""
    )
      notify("Please Enter Booking Number", { variant: "warning" });
    else if (vesselVoyageDetailName.indexOf("-") === -1)
      notify("Vessel Name - Voyage No should be Hyphen(-) separated", {
        variant: "warning",
      });
    else {
      let data = {
        pk: vesselVoyageDetailMaster.vesselVoyageDetail.pk,
        location: vesselVoyageDetailLocation,
        site: vesselVoyageDetailSite,
        booking_no: vesselVoyageDetailBookingNo,
        vessel_voyage_name: vesselVoyageDetailName,
        vessel_name: vesselVoyageName,
        voyage_no: vesselVoyageNumber,
      };
      dispatch(
        updateMasterVesselVoyageDetail(
          vesselVoyageDetailMaster.vesselVoyageDetail.pk,
          data,
          history,
          notify,
        ),
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
            {vesselVoyageDetailMaster.vesselVoyageDetail.pk
              ? "Update Vessel Voyage Detail"
              : "Add Vessel Voyage Detail"}
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
              size={{
                xs: 12,
                sm: 6,
                lg: vesselVoyageDetailMaster.vesselVoyageDetail.pk ? 4 : 3,
              }}
              style={theme.breakpoints.down("sm") && { padding: 7 }}
            >
              <Typography variant="subtitle1" sx={customLabelTypography}>
                Location <span style={{ color: "red" }}>*</span>
              </Typography>

              <TextField
                id="vessel-voyage-master-location"
                select
                value={vesselVoyageDetailLocation}
                variant="outlined"
                fullWidth
                size="small"
                onChange={(e) => {
                  setVesselVoyageDetailLocation(e.target.value);
                  setVesselVoyageDetailSite("");
                  setVesselVoyageDetailBookingNo("");
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
              size={{
                xs: 12,
                sm: 6,
                lg: vesselVoyageDetailMaster.vesselVoyageDetail.pk ? 4 : 3,
              }}
              style={theme.breakpoints.down("sm") && { padding: 7 }}
            >
              <Typography variant="subtitle1" sx={customLabelTypography}>
                Site <span style={{ color: "red" }}>*</span>
              </Typography>

              <TextField
                id="vessel-voyage-master-site"
                select
                value={vesselVoyageDetailSite}
                variant="outlined"
                fullWidth
                size="small"
                onChange={(e) => {
                  setVesselVoyageDetailSite(e.target.value);
                  setVesselVoyageDetailBookingNo("");
                  let req = {
                    from_date: "",
                    to_date: "",
                    number: "",
                    location: vesselVoyageDetailLocation,
                    site: vesselVoyageDetailSite,
                  };
                  dispatch(getVesselBkgNoListings(req));
                }}
                disabled={
                  (user.role === "Site Admin" || user.role === "Depot User") &&
                  true
                }
              >
                {vesselVoyageDetailLocation !== undefined &&
                  gateIn.allDropDown &&
                  gateIn.allDropDown.location_site_dashboard_list &&
                  gateIn.allDropDown.location_site_dashboard_list[
                    vesselVoyageDetailLocation
                  ].map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
              </TextField>
            </Grid>
            {gateIn.allDropDown && gateIn.allDropDown.vessel_booking_no && (
              <Grid
                item
                size={{
                  xs: 12,
                  sm: 6,
                  lg: vesselVoyageDetailMaster.vesselVoyageDetail.pk ? 4 : 3,
                }}
                style={theme.breakpoints.down("sm") && { padding: 7 }}
              >
                <Typography variant="subtitle1" sx={customLabelTypography}>
                  Booking No <span style={{ color: "red" }}>*</span>
                </Typography>
                <Autocomplete
                  value={vesselVoyageDetailBookingNo}
                  onChange={(event, newValue) => {
                    setVesselVoyageDetailBookingNo(newValue);
                  }}
                  style={{ padding: 0 }}
                  sx={{
                    "& .MuiAutocomplete-inputRoot[class*='MuiOutlinedInput-root']":
                      {
                        padding: 0,
                        height: "35px",
                      },
                  }}
                  options={gateIn.allDropDown.vessel_booking_no.map(
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
                        setVesselVoyageDetailBookingNo(e.target.value);
                      }}
                      fullWidth
                      disabled={
                        (user.role === "Location Admin" ||
                          user.role === "Site Admin") &&
                        true
                      }
                    />
                  )}
                />
              </Grid>
            )}

            <Grid
              item
              size={{
                xs: 12,
                sm: 6,
                lg: vesselVoyageDetailMaster.vesselVoyageDetail.pk ? 4 : 3,
              }}
              style={theme.breakpoints.down("sm") && { padding: 7 }}
            >
              <Typography variant="subtitle1" sx={customLabelTypography}>
                Vessel Name - Voyage No <span style={{ color: "red" }}>*</span>
              </Typography>

              <TextField
                id="vessel-voyage-name"
                type={"text"}
                value={vesselVoyageDetailName}
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
                onChange={(e) => setVesselVoyageDetailName(e.target.value)}
              />
            </Grid>

            {vesselVoyageDetailMaster.vesselVoyageDetail.pk && (
              <>
                <Grid
                  item
                  size={{ xs: 12, sm: 6, lg: 4 }}
                  style={theme.breakpoints.down("sm") && { padding: 7 }}
                >
                  <Typography variant="subtitle1" sx={customLabelTypography}>
                    Vessel Name
                  </Typography>

                  <TextField
                    id="vessel-name"
                    type={"text"}
                    value={vesselVoyageName}
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
                    onChange={(e) => setVesselVoyageName(e.target.value)}
                    disabled={true}
                  />
                </Grid>

                <Grid
                  item
                  size={{ xs: 12, sm: 6, lg: 4 }}
                  style={theme.breakpoints.down("sm") && { padding: 7 }}
                >
                  <Typography variant="subtitle1" sx={customLabelTypography}>
                    Voyage No
                  </Typography>

                  <TextField
                    id="voyage-number"
                    type={"text"}
                    value={vesselVoyageNumber}
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
                    onChange={(e) => setVesselVoyageNumber(e.target.value)}
                    disabled={true}
                  />
                </Grid>
              </>
            )}

            {vesselVoyageDetailMaster.vesselVoyageDetail.pk ? (
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
                onClick={updateVesselVoyageDetail}
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
                onClick={createVesselVoyageDetail}
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
