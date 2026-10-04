import React, { useState, useEffect } from "react";
import {
  Typography,
  Paper,
  Grid,
  Box,
  Button,
  TextField,
  MenuItem,
  Backdrop,
  CircularProgress,
} from "@mui/material";

import { useHistory } from "react-router-dom";
import LayoutContainer from "@components/reusablecomponents/LayoutContainer";
import DatePickerField from "@components/reusablecomponents/DatePickerField";
import { useDispatch, useSelector } from "react-redux";
import { dropDownDispatch } from "../../../actions/GateInActions";
import {
  getSingleVesselBkgNo,
  addMasterVesselBkgNo,
  updateMasterVesselBkgNo,
} from "../../../actions/master/VesselBkgNoMasterActions";
import { useSnackbar } from "notistack";
import { theme } from "../../../App";
import CustomBackButton from "@components/reusablecomponents/CustomBackButton";
import { custombackDropStyle, customLabelTypography } from "../../../utils/CustomClasses";



export default function AddUpdateVesselBkgNo(props) {

  const dispatch = useDispatch();
  const history = useHistory();
  const store = useSelector((state) => state);
  const { vesselBkgNoMaster, gateIn, user } = store;
    const { isloading } = useSelector((state) => state.ui);
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
        <CustomBackButton handleGoBack={handleGoBack} />
        <Typography variant="subtitle2">
          <Box fontWeight="fontWeightBold" m={1}>
            {vesselBkgNoMaster.vesselBkgNoDetails.pk
              ? "Update Vessel Bkg No"
              : "Add Vessel Bkg No"}
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
              size={{xs:12,sm:6,lg:3}}
              style={theme.breakpoints.down("sm") && { padding: 7 }}
            >
              <Typography variant="subtitle1" sx={customLabelTypography}>
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
              size={{xs:12,sm:6,lg:3}}
              style={theme.breakpoints.down("sm") && { padding: 7 }}
            >
              <Typography variant="subtitle1" sx={customLabelTypography}>
                Number <span style={{ color: "red" }}>*</span>
              </Typography>

              <TextField
                id="vessel-bkg-no"
                type={"text"}
                value={vesselBkgNoNumber}
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
                onChange={(e) => setVesselBkgNoNumber(e.target.value)}
              />
            </Grid>

            <Grid
              item
              size={{xs:12,sm:6,lg:3}}
              style={theme.breakpoints.down("sm") && { padding: 7 }}
            >
              <Typography variant="subtitle1" sx={customLabelTypography}>
                Location <span style={{ color: "red" }}>*</span>
              </Typography>

              <TextField
                id="vessel-bkg-no-master-location"
                select
                value={vesselBkgNoLocation}
                variant="outlined"
                fullWidth
                size="small"
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
              size={{xs:12,sm:6,lg:3}}
              style={theme.breakpoints.down("sm") && { padding: 7 }}
            >
              <Typography variant="subtitle1" sx={customLabelTypography}>
                Site <span style={{ color: "red" }}>*</span>
              </Typography>

              <TextField
                id="vessel-bkg-no-master-site"
                select
                value={vesselBkgNoSite}
                variant="outlined"
                fullWidth
                size="small"
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
                onClick={updateVesselBkgNo}
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
                onClick={createVesselBkgNo}
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
