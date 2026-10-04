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
import DatePickerField from "../../../components/reusableComponents/DatePickerField";
import { useDispatch, useSelector } from "react-redux";
import { dropDownDispatch } from "../../../actions/GateInActions";
import {
  getSingleVesselBkgNo,
  addMasterVesselBkgNo,
  updateMasterVesselBkgNo,
} from "../../../actions/Master/VesselBkgNoMasterActions";
import { useSnackbar } from "notistack";
import { theme } from "../../../App";
import { Image } from "semantic-ui-react";

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
}));

export default function AddUpdateVesselBkgNo(props) {
  const classes = useStyles();
  const dispatch = useDispatch();
  const history = useHistory();
  const store = useSelector((state) => state);
  const { vesselBkgNoMaster, gateIn, user } = store;
  const [vesselBkgNoDate, setVesselBkgDate] = useState("");
  const [vesselBkgNoNumber, setVesselBkgNoNumber] = useState("");
  const [vesselBkgNoLocation, setVesselBkgNoLocation] = useState(
    localStorage.getItem("location") ? localStorage.getItem("location") : ""
  );
  const [vesselBkgNoSite, setVesselBkgNoSite] = useState(
    localStorage.getItem("site") ? localStorage.getItem("site") : ""
  );
  const notify = useSnackbar().enqueueSnackbar;

  // TODAYS DATE
  var today = new Date();
  var dd = String(today.getDate()).padStart(2, "0");
  var mm = String(today.getMonth() + 1).padStart(2, "0"); //
  var yyyy = today.getFullYear();

  var todayDate = yyyy + "-" + mm + "-" + dd;

  useEffect(() => {
    let reqArray = ["location_site_dashboard_list"];
    dispatch(dropDownDispatch(reqArray, notify));
  }, []);

  useEffect(() => {
    if (props.history.location.state) {
      dispatch(
        getSingleVesselBkgNo(props.history.location.state.allDetails.pk, notify)
      );
    }
  }, []);

  useEffect(() => {
    if (vesselBkgNoMaster.vesselBkgNoDetails.pk) {
      setVesselBkgDate(vesselBkgNoMaster.vesselBkgNoDetails.date);
      setVesselBkgNoNumber(vesselBkgNoMaster.vesselBkgNoDetails.number);
      setVesselBkgNoLocation(vesselBkgNoMaster.vesselBkgNoDetails.location);
      setVesselBkgNoSite(vesselBkgNoMaster.vesselBkgNoDetails.site);
    } else {
      setVesselBkgDate(todayDate);
    }
  }, [vesselBkgNoMaster.vesselBkgNoDetails]);

  const createVesselBkgNo = () => {
    if (vesselBkgNoDate === "")
      notify("Please Enter Date", { variant: "warning" });
    else if (vesselBkgNoNumber === "")
      notify("Please Enter Number", { variant: "warning" });
    else if (vesselBkgNoLocation === "")
      notify("Please Enter Location", { variant: "warning" });
    else if (vesselBkgNoSite === "")
      notify("Please Enter Site", { variant: "warning" });
    else {
      let data = {
        date: vesselBkgNoDate,
        number: vesselBkgNoNumber,
        location: vesselBkgNoLocation,
        site: vesselBkgNoSite,
      };
      dispatch(addMasterVesselBkgNo(data, history, notify));
    }
  };

  const updateVesselBkgNo = () => {
    if (vesselBkgNoDate === "")
      notify("Please Enter Date", { variant: "warning" });
    else if (vesselBkgNoNumber === "")
      notify("Please Enter Number", { variant: "warning" });
    else if (vesselBkgNoLocation === "")
      notify("Please Enter Location", { variant: "warning" });
    else if (vesselBkgNoSite === "")
      notify("Please Enter Site", { variant: "warning" });
    else {
      let data = {
        pk: vesselBkgNoMaster.vesselBkgNoDetails.pk,
        date: vesselBkgNoDate,
        number: vesselBkgNoNumber,
        location: vesselBkgNoLocation,
        site: vesselBkgNoSite,
      };
      dispatch(
        updateMasterVesselBkgNo(
          vesselBkgNoMaster.vesselBkgNoDetails.pk,
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

  const handleFromDateChange = (date) => {
    var selectedDate = new Date(date);
    var dd = String(selectedDate.getDate()).padStart(2, "0");
    var mm = String(selectedDate.getMonth() + 1).padStart(2, "0"); //
    var yyyy = selectedDate.getFullYear();
    var selectedDateFormat = yyyy + "-" + mm + "-" + dd;
    setVesselBkgDate(selectedDateFormat);
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
            {vesselBkgNoMaster.vesselBkgNoDetails.pk
              ? "Update Vessel Bkg No"
              : "Add Vessel Bkg No"}
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
              <Typography
                variant="subtitle1"
                className={classes.LabelTypography}
              >
                Date <span style={{ color: "red" }}>*</span>
              </Typography>

              <DatePickerField
                dateId="vessel-bkg-no-master-date"
                dateValue={vesselBkgNoDate}
                dateChange={handleFromDateChange}
                fullWidth
              />
            </Grid>
            <Grid
              item
              xs={12}
              sm={6}
              lg={3}
              style={theme.breakpoints.down("sm") && { padding: 7 }}
            >
              <Typography
                variant="subtitle1"
                className={classes.LabelTypography}
              >
                Number <span style={{ color: "red" }}>*</span>
              </Typography>

              <TextField
                id="vessel-bkg-no"
                type={"text"}
                value={vesselBkgNoNumber}
                variant="outlined"
                fullWidth
                className={classes.textField}
                inputProps={{ className: classes.input }}
                onChange={(e) => setVesselBkgNoNumber(e.target.value)}
              />
            </Grid>

            <Grid
              item
              xs={12}
              sm={6}
              lg={3}
              style={theme.breakpoints.down("sm") && { padding: 7 }}
            >
              <Typography
                variant="subtitle1"
                className={classes.LabelTypography}
              >
                Location <span style={{ color: "red" }}>*</span>
              </Typography>

              <TextField
                id="vessel-bkg-no-master-location"
                select
                value={vesselBkgNoLocation}
                variant="outlined"
                fullWidth
                inputProps={{ className: classes.input }}
                onChange={(e) => {
                  setVesselBkgNoLocation(e.target.value);
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
              xs={12}
              sm={6}
              lg={3}
              style={theme.breakpoints.down("sm") && { padding: 7 }}
            >
              <Typography
                variant="subtitle1"
                className={classes.LabelTypography}
              >
                Site <span style={{ color: "red" }}>*</span>
              </Typography>

              <TextField
                id="vessel-bkg-no-master-site"
                select
                value={vesselBkgNoSite}
                variant="outlined"
                fullWidth
                inputProps={{ className: classes.input }}
                onChange={(e) => {
                  setVesselBkgNoSite(e.target.value);
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
                    vesselBkgNoLocation
                  ].map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
              </TextField>
            </Grid>

            {vesselBkgNoMaster.vesselBkgNoDetails.pk ? (
              <Button className={classes.button} onClick={updateVesselBkgNo}>
                Update
              </Button>
            ) : (
              <Button className={classes.button} onClick={createVesselBkgNo}>
                Save
              </Button>
            )}
          </Grid>
        </Paper>
      </div>
    </LayoutContainer>
  );
}
