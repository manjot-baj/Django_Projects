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
import { getSingleLocation } from "../../../actions/Master/LocationMasterActions";
import { useSnackbar } from "notistack";
import {
  addMasterLocation,
  updateMasterLocation,
} from "../../../actions/Master/LocationMasterActions";
import { theme } from "../../../App";
import { Image } from "semantic-ui-react";
import { dropDownDispatch } from "../../../actions/GateInActions";

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
    width: "165px",
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

export default function AddUpdateLocation(props) {
  const classes = useStyles();
  const dispatch = useDispatch();
  const history = useHistory();
  const store = useSelector((state) => state);
  const { locationMaster, gateIn } = store;
  const [locationCode, setLocationCode] = useState("");
  const [locationName, setLocationName] = useState("");
  const [locationTarget, setLocationTarget] = useState("");
  const [locationCompanyName, setLocationCompanyName] = useState("");
  const [locationCompanyAddress, setLocationCompanyAddress] = useState("");
  const [locationStateCode, setLocationStateCode] = useState("");
  const [locationCountry, setLocationCountry] = useState("");
  const [upload, setUpload] = useState("");
  const [uploadDisplay, setUploadDisplay] = useState("");
  const [locationGSTNo, setLocationGSTNo] = useState("");
  const notify = useSnackbar().enqueueSnackbar;

  useEffect(() => {
    let reqArray = ["country_data"];
    dispatch(dropDownDispatch(reqArray, notify));
  }, []);

  useEffect(() => {
    if (props.history.location.state) {
      dispatch(
        getSingleLocation(props.history.location.state.allDetails.pk, notify)
      );
    }
  }, []);

  useEffect(() => {
    if (locationMaster.locationDetails.pk) {
      setLocationCode(locationMaster.locationDetails.code);
      setLocationName(locationMaster.locationDetails.name);
      setLocationTarget(locationMaster.locationDetails.target);
      setLocationCompanyName(locationMaster.locationDetails.company_name);
      setLocationCompanyAddress(locationMaster.locationDetails.company_address);
      setLocationStateCode(locationMaster.locationDetails.state_code);
      setLocationCountry(locationMaster.locationDetails.country);
      setLocationGSTNo(locationMaster.locationDetails.gst_no);
      setUpload(
        locationMaster.locationDetails.icon &&
          "http://3.108.171.12:8000" + locationMaster.locationDetails.icon
      );
      setUploadDisplay(
        locationMaster.locationDetails.icon &&
          "http://3.108.171.12:8000" + locationMaster.locationDetails.icon
      );
    }
  }, [locationMaster.locationDetails]);

  const createLocation = () => {
    if (locationCode === "")
      notify("Please Enter Location Code ", { variant: "warning" });
    else if (locationName === "")
      notify("Please Enter Location Name", { variant: "warning" });
    else if (locationCompanyName === "")
      notify("Please Enter Company Name", { variant: "warning" });
    else if (locationCompanyAddress === "")
      notify("Please Enter Company Address", { variant: "warning" });
    else if (locationCountry === "")
      notify("Please Enter Country", { variant: "warning" });
    else if (!isAlphaNumeric(locationGSTNo))
      notify("Please Enter A valid GST Number", { variant: "warning" });
    else {
      let formData_create = new FormData();
      formData_create.append("name", locationName);
      formData_create.append("code", locationCode);
      formData_create.append("target", locationTarget);
      formData_create.append("company_name", locationCompanyName);
      formData_create.append("company_address", locationCompanyAddress);
      formData_create.append("state_code", locationStateCode);
      formData_create.append("country", locationCountry);
      formData_create.append("icon", upload);
      formData_create.append("gst_no", locationGSTNo);
      dispatch(addMasterLocation(formData_create, history, notify));
    }
  };

  const updateLocation = () => {
    if (locationName === "")
      notify("Please Enter Location Name", { variant: "warning" });
    else if (locationCode === "")
      notify("Please Enter Location Code", { variant: "warning" });
    else if (locationCompanyName === "")
      notify("Please Enter Company Name", { variant: "warning" });
    else if (locationCompanyAddress === "")
      notify("Please Enter Company Address", { variant: "warning" });
    else if (locationCountry === "")
      notify("Please Enter Country", { variant: "warning" });
    else if (!isAlphaNumeric(locationGSTNo))
      notify("Please Enter A valid GST Number", { variant: "warning" });
    else {
      let formData = new FormData();
      formData.append("pk", locationMaster.locationDetails.pk);
      formData.append("name", locationName);
      formData.append("code", locationCode);
      formData.append("target", locationTarget);
      formData.append("company_name", locationCompanyName);
      formData.append("company_address", locationCompanyAddress);
      formData.append("state_code", locationStateCode);
      formData.append("country", locationCountry);
      formData.append("icon", upload);
      formData.append("gst_no", locationGSTNo);
      dispatch(
        updateMasterLocation(
          locationMaster.locationDetails.pk,
          formData,
          history,
          notify
        )
      );
    }
  };

  const handleGoBack = () => {
    history.goBack();
  };

  const handleLocationCodeChange = (e) => {
    const regex = /^[a-z0-9]+$/i;
    if (e.target.value === "" || regex.test(e.target.value)) {
      setLocationCode(e.target.value);
    }
  };

  const handleStateCodeChange = (e) => {
    const regex = /^[0-9\b]+$/;
    if (e.target.value === "" || regex.test(e.target.value)) {
      setLocationStateCode(e.target.value);
    }
  };

  function isAlphaNumeric(str) {
    var code, i, len;

    if (str.length !== 15) return false;

    for (i = 0, len = str.length; i < len; i++) {
      code = str.charCodeAt(i);
      if (
        !(code > 47 && code < 58) && // numeric (0-9)
        !(code > 64 && code < 91) && // upper alpha (A-Z)
        !(code > 96 && code < 123) // lower alpha (a-z)
      ) {
        return false;
      }
    }
    return true;
  }

  const mapped =
    gateIn?.allDropDown &&
    gateIn?.allDropDown?.country_data &&
    gateIn?.allDropDown?.country_data?.map((obj) => obj.name);
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
            {locationMaster.locationDetails.pk
              ? "Update Location"
              : "Add Location"}
          </Box>
        </Typography>
        <Paper className={classes.paperContainer} elevation={0}>
          <Grid container spacing={3}>
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
                Location Code <span style={{ color: "red" }}>*</span>
              </Typography>

              <TextField
                id="location-master-code"
                type={"text"}
                value={locationCode}
                variant="outlined"
                fullWidth
                className={classes.textField}
                inputProps={{ className: classes.input }}
                onChange={(e) => handleLocationCodeChange(e)}
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
                Location Name <span style={{ color: "red" }}>*</span>
              </Typography>

              <TextField
                id="location-master-name"
                type={"text"}
                value={locationName}
                variant="outlined"
                fullWidth
                className={classes.textField}
                inputProps={{ className: classes.input }}
                onChange={(e) => setLocationName(e.target.value)}
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
                Target
              </Typography>

              <TextField
                id="location-master-target"
                type={"text"}
                value={locationTarget}
                variant="outlined"
                fullWidth
                className={classes.textField}
                inputProps={{ className: classes.input }}
                onChange={(e) => setLocationTarget(e.target.value)}
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
                Company Name <span style={{ color: "red" }}>*</span>
              </Typography>

              <TextField
                id="location-master-company-name"
                type={"text"}
                value={locationCompanyName}
                variant="outlined"
                fullWidth
                className={classes.textField}
                inputProps={{ className: classes.input }}
                onChange={(e) => setLocationCompanyName(e.target.value)}
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
                Company Address <span style={{ color: "red" }}>*</span>
              </Typography>

              <TextField
                id="location-master-company-address"
                type={"text"}
                value={locationCompanyAddress}
                variant="outlined"
                fullWidth
                className={classes.textField}
                inputProps={{ className: classes.input }}
                onChange={(e) => setLocationCompanyAddress(e.target.value)}
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
                State Code
              </Typography>

              <TextField
                id="location-master-state-code"
                type={"text"}
                value={locationStateCode}
                variant="outlined"
                fullWidth
                className={classes.textField}
                inputProps={{ className: classes.input }}
                onChange={(e) => handleStateCodeChange(e)}
              />
            </Grid>
            {gateIn.allDropDown && gateIn.allDropDown.country_data && (
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
                  Country
                </Typography>
                <TextField
                  id="handling-client"
                  select
                  value={locationCountry}
                  variant="outlined"
                  fullWidth
                  inputProps={{ className: classes.input }}
                  onChange={(e) => {
                    setLocationCountry(e.target.value);
                  }}
                >
                  {filtered &&
                    filtered.map((option) => (
                      <MenuItem key={option} value={option}>
                        {option}
                      </MenuItem>
                    ))}
                </TextField>
              </Grid>
            )}
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
                GST Number <span style={{ color: "red" }}>*</span>
              </Typography>

              <TextField
                id="location-master-gst-no"
                type={"text"}
                value={locationGSTNo}
                variant="outlined"
                fullWidth
                className={classes.textField}
                inputProps={{ className: classes.input }}
                onChange={(e) => setLocationGSTNo(e.target.value)}
              />
            </Grid>
            <Grid
              item
              xs={12}
              sm={6}
              lg={4}
              style={theme.breakpoints.down("sm") && { padding: 7 }}
            >
              <Grid
                style={{
                  display: "flex",
                  // justifyContent: "space-around",
                  alignItems: "center",
                }}
              >
                <Grid>
                  <Typography
                    variant="subtitle1"
                    className={classes.LabelTypography}
                  >
                    Icon
                  </Typography>

                  <Button
                    className={classes.uploadButton}
                    id="location-master-icon"
                    component="label"
                  >
                    Choose Icon
                    <input
                      type="file"
                      style={{ display: "none" }}
                      id="do-location-master-icon"
                      onChange={(e) => {
                        var file = e.target.files[0];
                        var reader = new FileReader();
                        reader.readAsDataURL(file);
                        setUpload(file);

                        reader.onloadend = function (e) {
                          setUploadDisplay(reader.result);
                        };
                      }}
                    />
                  </Button>
                </Grid>
                {uploadDisplay !== "" && (
                  <img src={uploadDisplay} alt="" height="100" />
                )}
              </Grid>
            </Grid>
            {locationMaster.locationDetails.pk ? (
              <Button className={classes.button} onClick={updateLocation}>
                Update
              </Button>
            ) : (
              <Button className={classes.button} onClick={createLocation}>
                Save
              </Button>
            )}
          </Grid>
        </Paper>
      </div>
    </LayoutContainer>
  );
}
