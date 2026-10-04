
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
  FormControlLabel,
  Switch,
  Radio,
  useMediaQuery,
} from "@material-ui/core";

import { useHistory } from "react-router-dom";
import LayoutContainer from "../../../components/reusableComponents/LayoutContainer";
import { useDispatch, useSelector } from "react-redux";
import {
  addSealManagementMaster,
  getSingleSealManagement,
  updateSealManagementMaster,
} from "../../../actions/Master/SealManagementMasterActions";
import { dropDownDispatch } from "../../../actions/GateInActions";
import { useSnackbar } from "notistack";
import { theme } from "../../../App";
import { Image } from "semantic-ui-react";
import Autocomplete from "@material-ui/lab/Autocomplete";
import DatePickerField from "../../../components/reusableComponents/DatePickerField";
import CustomTextfield from "../../../components/reusableComponents/GateInTextField";
import { getSealManagementListings } from "../../../actions/Master/SealManagementMasterActions";
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
    // padding: 6,
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
    // border: "1.5px solid #2A5FA5",
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
  switchWrapper: {
    marginTop: "32px",
  },
}));

export default function AddUpdateSealManagement(props) {
  const classes = useStyles();
  const dispatch = useDispatch();
  const history = useHistory();
  const store = useSelector((state) => state);
  const { sealManagementMaster, gateIn, user } = store;
  const [sealNumber, setSealNumber] = useState("");
  const [containerNo, setContainerNo] = useState("");
  const [sealLine, setSealLine] = useState("");
  const [inDate, setInDate] = useState("");
  const [inTime, setInTime] = useState("");
  const [outDate, setOutDate] = useState("");
  const [outTime, setOutTime] = useState("");
  const [inUseDate, setInUseDate] = useState("");
  const [inUseTime, setInUseTime] = useState("");
  const [isLocked, setIsLocked] = useState(false);
  const [isAvailable, setIsAvailable] = useState(true);
  const [isCut, setIsCut] = useState(false);
  const [isDamage, setIsDamage] = useState(false);
  const [isFirstAllotment, setIsFirstAllotment] = useState(true);
  const [isInUse, setIsInUse] = useState(false);
  const [isHistory, setIsHistory] = useState(false);
  const matchesIphone = useMediaQuery("(max-width:400px)");

  const [sealLocation, setSealLocation] = useState(
    localStorage.getItem("location") ? localStorage.getItem("location") : ""
  );
  const [sealSite, setSealSite] = useState(
    localStorage.getItem("site") ? localStorage.getItem("site") : ""
  );
  const notify = useSnackbar().enqueueSnackbar;

  useEffect(() => {
    if (props.history.location.state) {
      dispatch(
        getSingleSealManagement(
          props.history.location.state.allDetails.pk,
          notify
        )
      );
    }
  }, []);

  useEffect(() => {
    if (sealManagementMaster.sealManagementDetails.pk) {
      setSealNumber(sealManagementMaster.sealManagementDetails.number);
      setSealLine(sealManagementMaster.sealManagementDetails.line);
      setSealLocation(sealManagementMaster.sealManagementDetails.location);
      setSealSite(sealManagementMaster.sealManagementDetails.site);
      setInDate(sealManagementMaster.sealManagementDetails.in_date);
      setInTime(sealManagementMaster.sealManagementDetails.in_time);
      setOutDate(sealManagementMaster.sealManagementDetails.out_date);
      setOutTime(sealManagementMaster.sealManagementDetails.out_time);
      setInUseDate(sealManagementMaster.sealManagementDetails.in_use_date);
      setInUseTime(sealManagementMaster.sealManagementDetails.in_use_time);
      setIsLocked(sealManagementMaster.sealManagementDetails.is_lock);
      setIsAvailable(sealManagementMaster.sealManagementDetails.is_available);
      setIsInUse(sealManagementMaster.sealManagementDetails.in_use);
      setContainerNo(sealManagementMaster.sealManagementDetails.container_no);
      setIsCut(sealManagementMaster.sealManagementDetails.is_cut);
      setIsDamage(sealManagementMaster.sealManagementDetails.is_damaged);
    }
  }, [sealManagementMaster.sealManagementDetails]);

  useEffect(() => {
    let reqArray = ["client_ref_codes", "location_site_dashboard_list"];
    dispatch(dropDownDispatch(reqArray, notify));
  }, []);

  const createSeal = () => {
    if (sealNumber === "") {
      notify("Please Enter Seal Number", { variant: "warning" });
    } else if (sealLine === "") {
      notify("Please Enter Seal Line", { variant: "warning" });
    } else if (inDate === "") {
      notify("Please Enter In Date ", { variant: "warning" });
    } else if (inTime === "") {
      notify("Please Enter In Time ", { variant: "warning" });
    } else {
      let data = {
        line: sealLine,
        number: sealNumber,
        container_no: containerNo,
        location: sealLocation,
        site: sealSite,
        in_date: inDate,
        in_time: inTime,
        out_date: outDate,
        out_time: outTime,
        in_use_date: inUseDate,
        in_use_time: inUseTime,
        is_available: isAvailable,
        is_damaged: isDamage,
        is_cut: isCut,
        in_use: isInUse,
        is_first_allotment: isFirstAllotment,
        is_lock: isLocked,
        pg_no: 1,
        on_page_data: 3,
      };
      dispatch(addSealManagementMaster(data, history, notify));
    }
  };

  const updateSeal = () => {
    if (sealNumber === "") {
      notify("Please Enter Seal Number", { variant: "warning" });
    } else if (sealLine === "") {
      notify("Please Enter Seal Line", { variant: "warning" });
    } else {
      let data = {
        pk: sealManagementMaster.sealManagementDetails.pk,
        line: sealLine,
        number: sealNumber,
        container_no: containerNo,
        location: sealLocation,
        site: sealSite,
        in_date: inDate,
        in_time: inTime,
        out_date: outDate,
        out_time: outTime,
        in_use_date: inUseDate,
        in_use_time: inUseTime,
        is_available: isAvailable,
        is_damaged: isDamage,
        is_cut: isCut,
        in_use: isInUse,
        is_first_allotment: isFirstAllotment,
        pg_no: 1,
        on_page_data: 3,
        is_lock: isLocked,
      };
      dispatch(
        updateSealManagementMaster(
          sealManagementMaster.sealManagementDetails.pk,
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

  const handleInDateChange = (date) => {
    var selectedDate = new Date(date);
    var dd = String(selectedDate.getDate()).padStart(2, "0");
    var mm = String(selectedDate.getMonth() + 1).padStart(2, "0");
    var yyyy = selectedDate.getFullYear();
    var selectedDateFormat = yyyy + "-" + mm + "-" + dd;
    setInDate(selectedDateFormat);
  };

  const handleOutDateChange = (date) => {
    var selectedDate = new Date(date);
    var dd = String(selectedDate.getDate()).padStart(2, "0");
    var mm = String(selectedDate.getMonth() + 1).padStart(2, "0");
    var yyyy = selectedDate.getFullYear();
    var selectedDateFormat = yyyy + "-" + mm + "-" + dd;
    setOutDate(selectedDateFormat);
  };

  const handleInUseDateChange = (date) => {
    var selectedDate = new Date(date);
    var dd = String(selectedDate.getDate()).padStart(2, "0");
    var mm = String(selectedDate.getMonth() + 1).padStart(2, "0");
    var yyyy = selectedDate.getFullYear();
    var selectedDateFormat = yyyy + "-" + mm + "-" + dd;
    setInUseDate(selectedDateFormat);
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
            {sealManagementMaster.sealManagementDetails.pk
              ? "Update Seal"
              : "Add Seal"}
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
                Location <span style={{ color: "red" }}>*</span>
              </Typography>

              <TextField
                id="seal-master-location"
                select
                value={sealLocation}
                variant="outlined"
                fullWidth
                inputProps={{ className: classes.input }}
                onChange={(e) => {
                  setSealLocation(e.target.value);
                }}
                disabled={
                  ((user.role === "Location Admin" ||
                    user.role === "Site Admin" ||
                    user.role === "Depot User") &&
                    true) ||
                  isLocked === true
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
                id="seal-master-site"
                select
                value={sealSite}
                variant="outlined"
                fullWidth
                inputProps={{ className: classes.input }}
                onChange={(e) => {
                  setSealSite(e.target.value);
                }}
                disabled={
                  ((user.role === "Site Admin" || user.role === "Depot User") &&
                    true) ||
                  isLocked === true
                }
              >
                {sealLocation !== "" &&
                  gateIn.allDropDown &&
                  gateIn.allDropDown.location_site_dashboard_list &&
                  gateIn.allDropDown.location_site_dashboard_list[
                    sealLocation
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
                Seal Number <span style={{ color: "red" }}>*</span>
              </Typography>

              <TextField
                id="seal-master-number"
                type={"text"}
                value={sealNumber}
                variant="outlined"
                fullWidth
                className={classes.textField}
                inputProps={{ className: classes.input }}
                onChange={(e) => setSealNumber(e.target.value)}
                disabled={isLocked === true}
              />
            </Grid>

            {gateIn.allDropDown && gateIn.allDropDown.client_ref_codes && (
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
                  Line<span style={{ color: "red" }}>*</span>
                </Typography>
                <Autocomplete
                  value={sealLine}
                  onChange={(event, newValue) => {
                    setSealLine(newValue);
                  }}
                  style={{ padding: 0 }}
                  className={classes.autocomplete}
                  options={gateIn.allDropDown.client_ref_codes.map(
                    (option) => option
                  )}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      variant="outlined"
                      className={classes.textField}
                      onBlur={(e) => {
                        setSealLine(e.target.value);
                      }}
                      fullWidth
                    />
                  )}
                  disabled={isLocked === true}
                />
              </Grid>
            )}
            {sealManagementMaster.sealManagementDetails.pk ? (
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
                  Container Number
                </Typography>

                <TextField
                  id="conatiner-number"
                  type={"text"}
                  value={containerNo}
                  variant="outlined"
                  fullWidth
                  className={classes.textField}
                  inputProps={{ className: classes.input }}
                  onChange={(e) => setContainerNo(e.target.value)}
                  disabled
                  readOnlyP={true}
                />
              </Grid>
            ) : (
              ""
            )}
            <Grid
              item
              xs={12}
              sm={3}
              lg={3}
              style={theme.breakpoints.down("sm") && { padding: 7 }}
            >
              <Typography
                variant="subtitle1"
                className={classes.LabelTypography}
              >
                In Date<span style={{ color: "red" }}>*</span>
              </Typography>
              <DatePickerField
                dateId="in-date"
                dateValue={inDate}
                dateChange={handleInDateChange}
              />
            </Grid>

            <Grid
              item
              xs={12}
              sm={6}
              md={4}
              lg={3}
              style={theme.breakpoints.down("sm") && { padding: 7 }}
            >
              <Typography
                variant="subtitle1"
                className={classes.LabelTypography}
              >
                IN Time<span style={{ color: "red" }}>*</span>
              </Typography>
              <CustomTextfield
                id="in-time"
                type="time"
                handleChange={(e) => setInTime(e.target.value)}
                value={inTime}
              />
            </Grid>

            <Grid
              item
              xs={12}
              sm={3}
              lg={3}
              style={theme.breakpoints.down("sm") && { padding: 7 }}
            >
              <Typography
                variant="subtitle1"
                className={classes.LabelTypography}
              >
                Out Date
              </Typography>
              <CustomTextfield
                id="out-date"
                type="date"
                dateChange={handleOutDateChange}
                value={outDate}
                readOnlyP
              />
            </Grid>

            <Grid
              item
              xs={12}
              sm={6}
              md={4}
              lg={3}
              style={theme.breakpoints.down("sm") && { padding: 7 }}
            >
              <Typography
                variant="subtitle1"
                className={classes.LabelTypography}
              >
                Out Time
              </Typography>
              <CustomTextfield
                id="out-time"
                type="time"
                handleChange={(e) => setOutTime(e.target.value)}
                value={outTime}
                readOnlyP
              />
            </Grid>

            <Grid
              item
              xs={12}
              sm={3}
              lg={3}
              style={theme.breakpoints.down("sm") && { padding: 7 }}
            >
              <Typography
                variant="subtitle1"
                className={classes.LabelTypography}
              >
                In Use Date
              </Typography>

              <CustomTextfield
                dateId="in-use-date"
                type="date"
                dateChange={handleInUseDateChange}
                value={inUseDate}
                readOnlyP
              />
            </Grid>

            <Grid
              item
              xs={12}
              sm={6}
              md={4}
              lg={3}
              style={theme.breakpoints.down("sm") && { padding: 7 }}
            >
              <Typography
                variant="subtitle1"
                className={classes.LabelTypography}
              >
                In Use Time
              </Typography>
              <CustomTextfield
                id="in-use-time"
                type="time"
                handleChange={(e) => setInUseTime(e.target.value)}
                value={inUseTime}
                readOnlyP
              />
            </Grid>
          </Grid>
          <Grid
            container
            style={{
              marginTop: "20px",
              display: matchesIphone ? "block" : "flex",
            }}
          >
            <Grid container xs={12} style={{ display: "flex" }}>
              <Grid item xs={12} lg={3} md={6}>
                <Grid
                  item
                  xs={6}
                  lg={6}
                  style={{
                    display: matchesIphone ? "block" : "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "2px 18px 8px 0px",
                  }}
                >
                  <Typography variant="subtitle2">Is Available</Typography>
                </Grid>
                <Grid container xs={6} lg={6}>
                  <Grid item xs={10}>
                    <FormControlLabel
                      value="yes"
                      control={
                        <Radio
                          style={{ color: "#2A5FA5" }}
                          checked={isAvailable === true && isHistory === false}
                          onClick={() => {
                            setIsAvailable(true);
                            setIsHistory(false);
                            let data = {
                              location: "ALL",
                              site: "ALL",
                              line: "",
                              number: "",
                              container_no: "",
                              is_available: true,
                              is_damaged: false,
                              is_cut: false,
                              is_first_allotment: true,
                              is_history: false,
                              is_lock: false,
                              in_use: true,
                              in_date: { from: "", to: "" },
                              out_date: { from: "", to: "" },
                              in_use_date: { from: "", to: "" },
                              pg_no: 1,
                              on_page_data: 3,
                            };
                            dispatch(getSealManagementListings(data));
                          }}
                        />
                      }
                      label="Yes"
                      disabled={true}
                    />
                  </Grid>
                  <Grid item xs={2} lg={2}>
                    <FormControlLabel
                      value="No"
                      control={
                        <Radio
                          style={{ color: "#2A5FA5" }}
                          checked={isAvailable === false}
                          onClick={() => {
                            setIsAvailable(false);
                            let data = {
                              location: "ALL",
                              site: "ALL",
                              line: "",
                              number: "",
                              container_no: "",
                              is_available: false,
                              is_damaged: true,
                              is_cut: false,
                              is_first_allotment: true,
                              is_history: true,
                              is_lock: false,
                              in_use: false,
                              in_date: { from: "", to: "" },
                              out_date: { from: "", to: "" },
                              in_use_date: { from: "", to: "" },
                              pg_no: 1,
                              on_page_data: 3,
                            };
                            dispatch(getSealManagementListings(data));
                          }}
                        />
                      }
                      label="No"
                      disabled={true}
                    />
                  </Grid>
                </Grid>
              </Grid>

              <Grid item xs={12} lg={6} md={6}>
                <Grid
                  item
                  xs={4}
                  style={{
                    display: matchesIphone ? "block" : "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "2px 18px 8px 0px",
                  }}
                >
                  <Typography variant="subtitle2">In Use seal</Typography>
                </Grid>
                <Grid container xs={6} lg={4}>
                  <Grid item xs={10}>
                    <FormControlLabel
                      value="yes"
                      control={
                        <Radio
                          style={{ color: "#2A5FA5" }}
                          checked={isInUse === true && isHistory === false}
                          onClick={() => {
                            setIsInUse(true);
                            setIsHistory(false);
                            let data = {
                              location: "ALL",
                              site: "ALL",
                              line: "",
                              number: "",
                              container_no: "",
                              is_available: true,
                              is_damaged: false,
                              is_cut: false,
                              in_use: true,
                              is_first_allotment: true,
                              is_history: false,
                              is_lock: false,
                              in_date: { from: "", to: "" },
                              out_date: { from: "", to: "" },
                              in_use_date: { from: "", to: "" },
                              pg_no: 1,
                              on_page_data: 3,
                            };
                            dispatch(getSealManagementListings(data));
                          }}
                        />
                      }
                      label="Yes"
                      disabled={true}
                    />
                  </Grid>
                  <Grid item xs={2}>
                    <FormControlLabel
                      value="No"
                      control={
                        <Radio
                          style={{ color: "#2A5FA5" }}
                          checked={isInUse === false && isHistory === false}
                          onClick={() => {
                            setIsInUse(false);
                            isAvailable(false);
                            let data = {
                              location: "ALL",
                              site: "ALL",
                              line: "",
                              number: "",
                              container_no: "",
                              in_use: false,
                              is_available: false,
                              is_damaged: true,
                              is_cut: false,
                              is_first_allotment: false,
                              is_history: true,
                              in_date: { from: "", to: "" },
                              out_date: { from: "", to: "" },
                              in_use_date: { from: "", to: "" },
                              pg_no: 1,
                              on_page_data: 3,
                            };
                            dispatch(getSealManagementListings(data));
                          }}
                        />
                      }
                      label="No"
                      disabled={true}
                    />
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
          <Grid container spacing={2}>
            <Grid
              item
              xs={6}
              md={2}
              lg={2}
              className={classes.switchWrapper}
              style={{
                display: matchesIphone ? "block" : "flex",
                alignItems: "center",
              }}
            >
              <span>First Allotment</span>
              <Switch
                value={isFirstAllotment}
                defaultChecked
                onChange={(e) => setIsFirstAllotment(e.target.value)}
                inputProps={{ "aria-label": "controlled" }}
              />
            </Grid>
            <Grid item   xs={6}
              md={2}
              lg={2} className={classes.switchWrapper}>
              <span>Cut</span>
              <Switch
                defaultChecked={isAvailable === true}
                value={isCut}
                checked={isCut}
                onChange={() => {
                  setIsCut(true);
                  setIsDamage(false);
                }}
                inputProps={{ "aria-label": "controlled" }}
              />
            </Grid>
            <Grid item   xs={6}
              md={2}
              lg={2} className={classes.switchWrapper}>
              <span>Damage</span>
              <Switch
                defaultChecked={isAvailable === true}
                value={isDamage}
                checked={isDamage}
                onChange={() => {
                  setIsDamage(true);
                  setIsCut(false);
                }}
                inputProps={{ "aria-label": "controlled" }}
              />
            </Grid>
          </Grid>
          <Grid style={{ display: "flex", justifyContent: "center" }}>
            {sealManagementMaster.sealManagementDetails.pk ? (
              <Button
                className={classes.button}
                onClick={updateSeal}
                disabled={isLocked}
              >
                Update
              </Button>
            ) : (
              <Button className={classes.button} onClick={createSeal}>
                Save
              </Button>
            )}
          </Grid>
        </Paper>
      </div>
    </LayoutContainer>
  );
}