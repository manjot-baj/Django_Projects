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
  getSingleVesselVoyageDetail,
  addMasterVesselVoyageDetail,
  updateMasterVesselVoyageDetail,
} from "../../../actions/Master/VesselVoyageDetailMasterActions";
import { getVesselBkgNoListings } from "../../../actions/Master/VesselBkgNoMasterActions";
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
    width: "35%",
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
  uploadButton: {
    fontSize: 12.5,
    borderRadius: 6,
    boxShadow: "0px 3px 6px #9199A14D",
    backgroundColor: "#495057",
    color: "#fff",
    "&:hover": {
      backgroundColor: "#495057",
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

export default function AddUpdateVesselVoyageDetail(props) {
  const classes = useStyles();
  const dispatch = useDispatch();
  const history = useHistory();
  const store = useSelector((state) => state);
  const { vesselVoyageDetailMaster, gateIn, user } = store;
  const [vesselVoyageDetailLocation, setVesselVoyageDetailLocation] = useState(
    localStorage.getItem("location") ? localStorage.getItem("location") : ""
  );
  const [vesselVoyageDetailSite, setVesselVoyageDetailSite] = useState(
    localStorage.getItem("site") ? localStorage.getItem("site") : ""
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
          notify
        )
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (vesselVoyageDetailMaster.vesselVoyageDetail.pk) {
      setVesselVoyageDetailLocation(
        vesselVoyageDetailMaster.vesselVoyageDetail.location
      );
      setVesselVoyageDetailSite(
        vesselVoyageDetailMaster.vesselVoyageDetail.site
      );
      setVesselVoyageDetailBookingNo(
        vesselVoyageDetailMaster.vesselVoyageDetail.booking_no
      );
      setVesselVoyageDetailName(
        vesselVoyageDetailMaster.vesselVoyageDetail.vessel_voyage_name
      );
      setVesselVoyageName(
        vesselVoyageDetailMaster.vesselVoyageDetail.vessel_name
      );
      setVesselVoyageNumber(
        vesselVoyageDetailMaster.vesselVoyageDetail.voyage_no
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
        <Image
          src={require("../../../assets/images/back-arrow.png")}
          className={classes.backImage}
          onClick={handleGoBack}
        />
        <Typography variant="subtitle2">
          <Box fontWeight="fontWeightBold" m={1}>
            {vesselVoyageDetailMaster.vesselVoyageDetail.pk
              ? "Update Vessel Voyage Detail"
              : "Add Vessel Voyage Detail"}
          </Box>
        </Typography>
        <Paper className={classes.paperContainer} elevation={0}>
          <Grid container spacing={3}>
            <Grid
              item
              xs={12}
              sm={6}
              lg={vesselVoyageDetailMaster.vesselVoyageDetail.pk ? 4 : 3}
              style={theme.breakpoints.down("sm") && { padding: 7 }}
            >
              <Typography
                variant="subtitle1"
                className={classes.LabelTypography}
              >
                Location <span style={{ color: "red" }}>*</span>
              </Typography>

              <TextField
                id="vessel-voyage-master-location"
                select
                value={vesselVoyageDetailLocation}
                variant="outlined"
                fullWidth
                inputProps={{ className: classes.input }}
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
              lg={vesselVoyageDetailMaster.vesselVoyageDetail.pk ? 4 : 3}
              style={theme.breakpoints.down("sm") && { padding: 7 }}
            >
              <Typography
                variant="subtitle1"
                className={classes.LabelTypography}
              >
                Site <span style={{ color: "red" }}>*</span>
              </Typography>

              <TextField
                id="vessel-voyage-master-site"
                select
                value={vesselVoyageDetailSite}
                variant="outlined"
                fullWidth
                inputProps={{ className: classes.input }}
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
                xs={12}
                sm={6}
                lg={vesselVoyageDetailMaster.vesselVoyageDetail.pk ? 4 : 3}
                style={theme.breakpoints.down("sm") && { padding: 7 }}
              >
                <Typography
                  variant="subtitle1"
                  className={classes.LabelTypography}
                >
                  Booking No <span style={{ color: "red" }}>*</span>
                </Typography>
                <Autocomplete
                  value={vesselVoyageDetailBookingNo}
                  onChange={(event, newValue) => {
                    setVesselVoyageDetailBookingNo(newValue);
                  }}
                  style={{ padding: 0 }}
                  className={classes.autocomplete}
                  options={gateIn.allDropDown.vessel_booking_no.map(
                    (option) => option
                  )}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      variant="outlined"
                      className={classes.textField}
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
              xs={12}
              sm={6}
              lg={vesselVoyageDetailMaster.vesselVoyageDetail.pk ? 4 : 3}
              style={theme.breakpoints.down("sm") && { padding: 7 }}
            >
              <Typography
                variant="subtitle1"
                className={classes.LabelTypography}
              >
                Vessel Name - Voyage No <span style={{ color: "red" }}>*</span>
              </Typography>

              <TextField
                id="vessel-voyage-name"
                type={"text"}
                value={vesselVoyageDetailName}
                variant="outlined"
                fullWidth
                className={classes.textField}
                inputProps={{ className: classes.input }}
                onChange={(e) => setVesselVoyageDetailName(e.target.value)}
              />
            </Grid>

            {vesselVoyageDetailMaster.vesselVoyageDetail.pk && (
              <>
                <Grid
                  item
                  xs={12}
                  sm={6}
                  lg={4}
                  style={theme.breakpoints.down("sm") && { padding: 7 }}
                >
                  <Typography
                    variant="subtitle1"
                    className={classes.LabelTypography}
                  >
                    Vessel Name
                  </Typography>

                  <TextField
                    id="vessel-name"
                    type={"text"}
                    value={vesselVoyageName}
                    variant="outlined"
                    fullWidth
                    className={classes.textField}
                    inputProps={{ className: classes.input }}
                    onChange={(e) => setVesselVoyageName(e.target.value)}
                    disabled={true}
                  />
                </Grid>

                <Grid
                  item
                  xs={12}
                  sm={6}
                  lg={4}
                  style={theme.breakpoints.down("sm") && { padding: 7 }}
                >
                  <Typography
                    variant="subtitle1"
                    className={classes.LabelTypography}
                  >
                    Voyage No
                  </Typography>

                  <TextField
                    id="voyage-number"
                    type={"text"}
                    value={vesselVoyageNumber}
                    variant="outlined"
                    fullWidth
                    className={classes.textField}
                    inputProps={{ className: classes.input }}
                    onChange={(e) => setVesselVoyageNumber(e.target.value)}
                    disabled={true}
                  />
                </Grid>
              </>
            )}

            {vesselVoyageDetailMaster.vesselVoyageDetail.pk ? (
              <Button
                className={classes.button}
                onClick={updateVesselVoyageDetail}
              >
                Update
              </Button>
            ) : (
              <Button
                className={classes.button}
                onClick={createVesselVoyageDetail}
              >
                Save
              </Button>
            )}
          </Grid>
        </Paper>
      </div>
    </LayoutContainer>
  );
}
