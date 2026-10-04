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
  getSingleLocationCodeDetail,
  addMasterLocationCodeDetail,
  updateMasterLocationCodeDetail,
} from "../../../actions/Master/LocationCodeDetailMasterActions";
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

export default function AddUpdateLocationCodeDetail(props) {
  const classes = useStyles();
  const dispatch = useDispatch();
  const history = useHistory();
  const store = useSelector((state) => state);
  const { locationCodeDetailMaster, gateIn, user } = store;
  const [locationCodeDetailNameCode, setLocationCodeDetailNameCode] =
    useState("");
  const [locationCodeDetailType, setLocationCodeDetailType] = useState("");
  const [depotName,setDepotName] =useState("")
  const [ovaCode,setOvaCode] =useState("")
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
      setOvaCode(locationCodeDetailMaster.locationCodeDetails.ova_code)
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
        ova_code:ovaCode,
        depot_name:depotName
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
        ova_code:ovaCode,
        depot_name:depotName
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
        <Image
          src={require("../../../assets/images/back-arrow.png")}
          className={classes.backImage}
          onClick={handleGoBack}
        />
        <Typography variant="subtitle2">
          <Box fontWeight="fontWeightBold" m={1}>
            {locationCodeDetailMaster.locationCodeDetails.pk
              ? "Update Location Code Detail"
              : "Add Location Code Detail"}
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
                Name Code <span style={{ color: "red" }}>*</span>
              </Typography>

              <TextField
                id="vessel-bkg-no"
                type={"text"}
                value={locationCodeDetailNameCode}
                variant="outlined"
                fullWidth
                className={classes.textField}
                inputProps={{ className: classes.input }}
                onChange={(e) => setLocationCodeDetailNameCode(e.target.value)}
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
                Type <span style={{ color: "red" }}>*</span>
              </Typography>

              <TextField
                id="client-master-code"
                select
                value={locationCodeDetailType}
                variant="outlined"
                fullWidth
                inputProps={{ className: classes.input }}
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
                value={locationCodeDetailLocation}
                variant="outlined"
                fullWidth
                inputProps={{ className: classes.input }}
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
                value={locationCodeDetailSite}
                variant="outlined"
                fullWidth
                inputProps={{ className: classes.input }}
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
              xs={12}
              sm={6}
              lg={3}
              style={theme.breakpoints.down("sm") && { padding: 7 }}
            >
              <Typography
                variant="subtitle1"
                className={classes.LabelTypography}
              >
                Depot name 
              </Typography>

              <TextField
                id="vessel-bkg-no-master-site"
                name="depot_name"

                value={depotName}
                variant="outlined"
                fullWidth
                inputProps={{ className: classes.input }}
                onChange={(e) => {
                  setDepotName(e.target.value);
                }}
               
              >
              
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
                OVA code  
              </Typography>

              <TextField
                id="vessel-bkg-no-master-site"
                name="ova_code"

                value={ovaCode}
                variant="outlined"
                fullWidth
                inputProps={{ className: classes.input }}
                onChange={(e) => {
                  setOvaCode(e.target.value);
                }}
               
              >
              
              </TextField>
            </Grid>

            {locationCodeDetailMaster.locationCodeDetails.pk ? (
              <Button
                className={classes.button}
                onClick={updateLocationCodeDetail}
              >
                Update
              </Button>
            ) : (
              <Button
                className={classes.button}
                onClick={createLocationCodeDetail}
                style={{ height: "45px" }}
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
