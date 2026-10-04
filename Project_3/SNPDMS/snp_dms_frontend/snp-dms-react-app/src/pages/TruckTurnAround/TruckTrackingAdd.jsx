import React, { useEffect, useState } from "react";
import LayoutContainer from "../../components/reusableComponents/LayoutContainer";
import { useParams, useHistory } from "react-router-dom";
import jwt_decode from "jwt-decode";
import { useSnackbar } from "notistack";
import { useDispatch, useSelector } from "react-redux";
import {
  Backdrop,
  Box,
  CircularProgress,
  makeStyles,
  Typography,
  Grid,
  Paper,
  Tabs,
  Tab,
  TextField,
  Button,
  MenuItem,
} from "@material-ui/core";
import PropTypes from "prop-types";
import { handleContainerNumberChangeByUseStateUtils } from "../../utils/Utils";
import AddCircleOutlineOutlinedIcon from "@mui/icons-material/AddCircleOutlineOutlined";
import { Autocomplete, Stack } from "@mui/material";
import { dropDownDispatch } from "../../actions/GateInActions";
import {
  gettruckTurnAroundByPkTruckAction,
  truckTurnAroundAddTruckAction,
  updatetruckTurnAroundByPkTruckAction,
} from "../../actions/TruckTurnAroundAction";
import GateInTextField from "../../components/reusableComponents/GateInTextField";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import { Image } from "semantic-ui-react";

function TabPanel(props) {
  const { children, value, index, ...other } = props;
  const useStyle = makeStyles((theme) => ({
    boxPadding: {
      paddingTop: 24,
      paddingBottom: 24,
      [theme.breakpoints.down("sm")]: {
        paddingLeft: 0,
      },
    },
  }));
  const classes = useStyle();

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`scrollable-force-tabpanel-${index}`}
      aria-labelledby={`scrollable-force-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box className={classes.boxPadding}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.any.isRequired,
  value: PropTypes.any.isRequired,
};

function a11yProps(index) {
  return {
    id: `scrollable-force-tab-${index}`,
    "aria-controls": `scrollable-force-tabpanel-${index}`,
  };
}

const useStyles = makeStyles((theme) => ({
  addTruckButton: {
    width: "240px",
  },
  root: {
    flexGrow: 1,
    backgroundColor: "#fff",
    borderRadius: 8,

    [theme.breakpoints.down("md")]: {
      maxWidth: "unset",
      marginLeft: "2%",
      marginRight: "2%",
      marginTop: "12px",
    },
  },
  textField: {
    "& .MuiOutlinedInput-root": {
      "& fieldset": {
        borderColor: "#243545",
      },
    },
  },
  backdrop: {
    zIndex: theme.zIndex.drawer + 1,
    color: "#fff",
  },
  default_tabStyle: {
    margin: 5,
    color: "#000",
    fontSize: 13,
    fontWeight: 600,
    [theme.breakpoints.down("sm")]: {
      margin: 2,
      fontSize: 9,
    },
  },
  autocomplete: {
    "& .MuiAutocomplete-inputRoot[class*='MuiOutlinedInput-root']": {
      padding: 0,
    },
  },
  active_tabStyle: {
    backgroundColor: "#2A5FA5",
    margin: 5,
    borderRadius: 8,
    color: "#fff",
    "& .MuiTab-root": {
      padding: 0,
    },
    [theme.breakpoints.down("sm")]: {
      margin: 2,
      fontSize: 9,
    },
  },
  backImage: {
    height: 40,
    width: 40,
    marginBottom: 15,
    cursor: "pointer",
    marginLeft: "5%",
  },
  iconContainer: {
    height: 32,
    width: 32,
  },
  heading: {
    fontWeight: 700,
    paddingTop: 20,
    paddingBottom: 20,
    backgroundColor: "#243545",
    color: "#FFF",
    paddingLeft: 14,
    borderRadius: 8,
    [theme.breakpoints.down("md")]: {
      paddingTop: 4,
      paddingBottom: 4,
      width: "100%",
    },
  },
  input: {
    padding: 7,
    [theme.breakpoints.down("xs")]: {
      "& .MuiFormControl-fullWidth": {
        width: "200px",
      },
    },
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
  backImage: {
    height: 40,
    width: 40,
    marginBottom: 15,
    cursor: "pointer",
  },
}));

const TruckTrackingAdd = () => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const history = useHistory();
  const { ui, gateIn, TruckTurnAroundReducer } = useSelector((state) => state);
  const { getTruck } = TruckTurnAroundReducer;
  const notify = useSnackbar().enqueueSnackbar;
  const [isEditing, setIsEditing] = useState(true);
  const { pk } = useParams();
  const [value, setValue] = React.useState(0);
  const [containerNumber, setContainerNumber] = useState("");
  const [line, setLine] = useState("");
  const [vehicleNo, setVehicleNo] = useState("");
  const [transporter, setTransporter] = useState("");
  const [moveMode, setMoveMode] = useState("");

  useEffect(() => {
    var token = localStorage.getItem("accessToken");
    if (token) {
      var decode = jwt_decode(token);
      if (decode.exp < new Date().getTime() / 1000) {
        history.push("/login");
      }
      if (!pk) {
        history.replace("/depot/truck-turn-around");
      } else {
        if (pk !== "add") {
          dispatch(gettruckTurnAroundByPkTruckAction(pk, notify));
        }
      }
    } else {
      history.push("/login");
    }
  }, []);

  useEffect(() => {
    if (pk === "add") {
      let reqArray = [
       
        "size_data",
        "type_data",
        "transporter",
        "client_data"
      ];
      dispatch(dropDownDispatch(reqArray, notify));
      setIsEditing(true);
    } else {
      setIsEditing(false);
    }
  }, [pk]);

  useEffect(() => {
    if (pk !== "add" && getTruck !== null) {
      if (getTruck?.move_mode === "IMPORT") {
        setValue(0);
      } else {
        setValue(1);
      }
      setContainerNumber(getTruck?.container_no);
      setLine(getTruck?.line);
      setVehicleNo(getTruck?.vehicle_no);
      setTransporter(getTruck?.transporter);
      setMoveMode(getTruck?.move_mode);
    }
  }, [getTruck?.pk]);

  const handleChange = (event, newValue) => {
    if (!isEditing) {
      return;
    }
    setValue(newValue);
  };

  const handleGoBack = () => {
    history.goBack();
  };

  const handleEditChange = (e, setValue) => {
    const { value, name } = e.target;
    setValue(value);
  };

  const handleTruckAdd = () => {
    if (value === 0) {
      if (containerNumber === "") {
        notify("Container Number is required", { variant: "warning" });
      } else if (line === "") {
        notify("Line is required", { variant: "warning" });
      } else if (vehicleNo === "") {
        notify("Vehicle Number is required", { variant: "warning" });
      } else if (transporter === "") {
        notify("Transporter is required", { variant: "warning" });
      } else {
        let truckAddData = {
          container_no: containerNumber,
          line: line,
          vehicle_no: vehicleNo,
          transporter: transporter,
          move_mode: "IMPORT",
          booking_no: "",
        };
       
        dispatch(truckTurnAroundAddTruckAction(truckAddData, history, notify));
      }
    } else {
      if (vehicleNo === "") {
        notify("Vehicle Number is required", { variant: "warning" });
      } else if (transporter === "") {
        notify("Transporter is required", { variant: "warning" });
      } else {
        let truckAddExportData = {
          vehicle_no: vehicleNo,
          transporter: transporter,
          move_mode: moveMode,
        };
        dispatch(
          truckTurnAroundAddTruckAction(truckAddExportData, history, notify)
        );
      }
    }
  };

  const handleTruckUpdate = () => {
    if (containerNumber === "") {
      notify("Container No is required", { variant: "warning" });
    } else {
      dispatch(
        updatetruckTurnAroundByPkTruckAction(
          pk,
          containerNumber,
          notify,
          history
        )
      );
    }
  };



  return (
    <LayoutContainer>
      <Box paddingX={8}>
        <Grid container>
          <Grid item xs={12}>
            <Image
              src={require("../../assets/images/back-arrow.png")}
              className={classes.backImage}
              onClick={handleGoBack}
            />
          </Grid>
          <Grid item xs={12}>
            <Paper elevation={0} className={classes.root}>
              <Tabs
                value={value}
                onChange={handleChange}
                variant="fullWidth"
                indicatorColor="white"
              >
                <Tab
                  className={
                    value === 0
                      ? classes.active_tabStyle
                      : classes.default_tabStyle
                  }
                  label={
                    <Stack
                      direction={"row"}
                      alignItems={"center"}
                      justifyContent={"center"}
                      spacing={2}
                    >
                      <Image
                        src={require("../../assets/images/truckTracking/loaded-truck.svg")}
                        className={classes.iconContainer}
                      />
                      <Typography> Loaded Truck </Typography>
                    </Stack>
                  }
                  {...a11yProps(0)}
                />
                <Tab
                  className={
                    value === 1
                      ? classes.active_tabStyle
                      : classes.default_tabStyle
                  }
                  label={
                    <Stack
                      direction={"row"}
                      alignItems={"center"}
                      justifyContent={"center"}
                      spacing={2}
                    >
                      <Image
                        src={require("../../assets/images/truckTracking/empty-truck.svg")}
                        className={classes.iconContainer}
                      />
                      <Typography> Empty Truck</Typography>
                    </Stack>
                  }
                  {...a11yProps(1)}
                />
              </Tabs>
            </Paper>
          </Grid>
        </Grid>

        <TabPanel value={value} index={0}>
          <Paper className={classes.root} style={{ padding: "24px 16px" }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={4} lg={3}>
                <Typography
                  variant="subtitle1"
                  className={classes.LabelTypography}
                >
                  Container Number <span style={{ color: "red" }}>*</span>
                </Typography>
                {getTruck?.status === "OUT" ? (
                  <GateInTextField value={containerNumber} readOnlyP={true} />
                ) : (
                  <TextField
                    id="container-number"
                    value={containerNumber}
                    variant="outlined"
                    fullWidth
                    className={classes.textField}
                    inputProps={{ className: classes.input }}
                    onChange={(e) =>
                      handleContainerNumberChangeByUseStateUtils(
                        e,
                        containerNumber,
                        setContainerNumber,
                        notify
                      )
                    }
                    // onBlur={handleContainerNumberOnBlurUtils}
                    dispatchType={""}
                  />
                )}
              </Grid>

              <Grid item xs={12} sm={6} md={4} lg={3}>
                <Typography
                  variant="subtitle1"
                  className={classes.LabelTypography}
                >
                  Line <span style={{ color: "red" }}>*</span>
                </Typography>
                {isEditing ? (
                  <Autocomplete
                    id="report-line"
                    freeSolo={true}
                    value={line}
                    noOptionsText="No Line Available"
                    options={
                      (gateIn?.allDropDown &&
                        gateIn?.allDropDown?.client_data &&
                        gateIn?.allDropDown?.client_data?.map(val=>val.name)) ||
                      []
                    }
                    
                    style={{ padding: 0 }}
                    className={classes.autocomplete}
                    onChange={(event,newValue)=>setLine(newValue)}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        autoComplete="off"
                        value={line}
                        className={classes.textField}
                        
                        fullWidth
                        variant="outlined"
                      />
                    )}
                  />
                ) : (
                  <GateInTextField value={line} readOnlyP={true} />
                )}
              </Grid>
              <Grid item xs={12} sm={6} md={4} lg={3}>
                <Typography
                  variant="subtitle1"
                  className={classes.LabelTypography}
                >
                  Vehicle No <span style={{ color: "red" }}>*</span>
                </Typography>
                {isEditing ? (
                  <TextField
                    id="line"
                    value={vehicleNo}
                    variant="outlined"
                    fullWidth
                    name="line"
                    className={classes.textField}
                    inputProps={{ className: classes.input }}
                    onChange={(e) => handleEditChange(e, setVehicleNo)}
                  />
                ) : (
                  <GateInTextField value={vehicleNo} readOnlyP={true} />
                )}
              </Grid>
              <Grid item xs={12} sm={6} md={4} lg={3}>
                <Typography
                  variant="subtitle1"
                  className={classes.LabelTypography}
                >
                  Transporter <span style={{ color: "red" }}>*</span>
                </Typography>
                {isEditing ? (
                  <TextField
                    id="line"
                    value={transporter}
                    variant="outlined"
                    fullWidth
                    select
                    name="line"
                    className={classes.textField}
                    inputProps={{ className: classes.input }}
                    onChange={(e) => handleEditChange(e, setTransporter)}
                  >
                    {gateIn.allDropDown &&
                      gateIn.allDropDown.transporter &&
                      gateIn.allDropDown.transporter.map((option) => (
                        <MenuItem key={option.name} value={option.name}>
                          {option.name}
                        </MenuItem>
                      ))}
                  </TextField>
                ) : (
                  <GateInTextField value={transporter} readOnlyP={true} />
                )}
              </Grid>
              <Grid item xs={12} sm={6} md={4} lg={3}>
                <Typography
                  variant="subtitle1"
                  className={classes.LabelTypography}
                >
                  Move Mode <span style={{ color: "red" }}>*</span>
                </Typography>
                {isEditing ? (
                  <TextField
                    id="line"
                    value={value === 0 ? "IMPORT" : moveMode}
                    variant="outlined"
                    fullWidth
                    name="line"
                    className={classes.textField}
                    inputProps={{ className: classes.input }}
                    onChange={(e) => handleEditChange(e, setMoveMode)}
                  />
                ) : (
                  <GateInTextField value={moveMode} readOnlyP={true} />
                )}
              </Grid>

              {!isEditing && (
                <Grid item xs={12} sm={6} md={4} lg={3}>
                  <Typography
                    variant="subtitle1"
                    className={classes.LabelTypography}
                  >
                    Truck In Time
                  </Typography>
                  <GateInTextField
                    value={getTruck?.gate_in_time}
                    readOnlyP={true}
                  />
                </Grid>
              )}

              {!isEditing && (
                <Grid item xs={12} sm={6} md={4} lg={3}>
                  <Typography
                    variant="subtitle1"
                    className={classes.LabelTypography}
                  >
                    Truck Out Time
                  </Typography>
                  <GateInTextField
                    value={getTruck?.gate_out_time}
                    readOnlyP={true}
                  />
                </Grid>
              )}

              {!isEditing && (
                <Grid item xs={12} sm={6} md={4} lg={3}>
                  <Typography
                    variant="subtitle1"
                    className={classes.LabelTypography}
                  >
                    Time Since
                  </Typography>
                  <GateInTextField
                    value={getTruck?.time_since}
                    readOnlyP={true}
                  />
                </Grid>
              )}

              <Grid
                item
                xs={12}
                sm={12}
                md={12}
                style={{ textAlign: "center", marginTop: "24px" }}
              >
                {isEditing ? (
                  <Button
                    variant="contained"
                    color="primary"
                    className={classes.addTruckButton}
                    onClick={handleTruckAdd}
                    startIcon={<AddCircleOutlineOutlinedIcon />}
                  >
                    Add Truck
                  </Button>
                ) : (
                 ( getTruck?.status ==="OUT" ?null : <Button
                    variant="contained"
                    color="primary"
                    className={classes.addTruckButton}
                    onClick={handleTruckUpdate}
                    startIcon={<EditOutlinedIcon />}
                  >
                    Update
                  </Button>)
                )}
              </Grid>
            </Grid>
          </Paper>
        </TabPanel>
        <TabPanel value={value} index={1}>
          <Paper className={classes.root} style={{ padding: "24px 16px" }}>
            <Grid container spacing={2}>
              {!isEditing && getTruck?.status === "OUT" && (
                <Grid item xs={12} sm={6} md={4} lg={3}>
                  <Typography
                    variant="subtitle1"
                    className={classes.LabelTypography}
                  >
                    Container No <span style={{ color: "red" }}>*</span>
                  </Typography>

                  <GateInTextField
                    value={getTruck?.container_no}
                    readOnlyP={true}
                  />
                </Grid>
              )}
              {!isEditing && getTruck?.status === "OUT" && (
                <Grid item xs={12} sm={6} md={4} lg={3}>
                  <Typography
                    variant="subtitle1"
                    className={classes.LabelTypography}
                  >
                    Line <span style={{ color: "red" }}>*</span>
                  </Typography>

                  <GateInTextField value={getTruck?.line} readOnlyP={true} />
                </Grid>
              )}
              {!isEditing && getTruck?.status === "OUT" && (
                <Grid item xs={12} sm={6} md={4} lg={3}>
                  <Typography
                    variant="subtitle1"
                    className={classes.LabelTypography}
                  >
                    Size <span style={{ color: "red" }}>*</span>
                  </Typography>

                  <GateInTextField value={getTruck?.size} readOnlyP={true} />
                </Grid>
              )}
              {!isEditing && getTruck?.status === "OUT" && (
                <Grid item xs={12} sm={6} md={4} lg={3}>
                  <Typography
                    variant="subtitle1"
                    className={classes.LabelTypography}
                  >
                    Type <span style={{ color: "red" }}>*</span>
                  </Typography>

                  <GateInTextField value={getTruck?.type} readOnlyP={true} />
                </Grid>
              )}
              {!isEditing && getTruck?.status === "OUT" && (
                <Grid item xs={12} sm={6} md={4} lg={3}>
                  <Typography
                    variant="subtitle1"
                    className={classes.LabelTypography}
                  >
                    Booking No <span style={{ color: "red" }}>*</span>
                  </Typography>

                  <GateInTextField
                    value={getTruck?.booking_no}
                    readOnlyP={true}
                  />
                </Grid>
              )}
              <Grid item xs={12} sm={6} md={4} lg={3}>
                <Typography
                  variant="subtitle1"
                  className={classes.LabelTypography}
                >
                  Vehicle No <span style={{ color: "red" }}>*</span>
                </Typography>
                {isEditing ? (
                  <TextField
                    id="line"
                    value={vehicleNo}
                    variant="outlined"
                    fullWidth
                    name="line"
                    className={classes.textField}
                    inputProps={{ className: classes.input }}
                    onChange={(e) => handleEditChange(e, setVehicleNo)}
                  />
                ) : (
                  <GateInTextField value={vehicleNo} readOnlyP={true} />
                )}
              </Grid>
              <Grid item xs={12} sm={6} md={4} lg={3}>
                <Typography
                  variant="subtitle1"
                  className={classes.LabelTypography}
                >
                  Transporter <span style={{ color: "red" }}>*</span>
                </Typography>
                {isEditing ? (
                  <TextField
                    id="line"
                    value={transporter}
                    variant="outlined"
                    fullWidth
                    select
                    name="line"
                    className={classes.textField}
                    inputProps={{ className: classes.input }}
                    onChange={(e) => handleEditChange(e, setTransporter)}
                  >
                    {gateIn.allDropDown &&
                      gateIn.allDropDown.transporter &&
                      gateIn.allDropDown.transporter.map((option) => (
                        <MenuItem key={option.name} value={option.name}>
                          {option.name}
                        </MenuItem>
                      ))}
                  </TextField>
                ) : (
                  <GateInTextField value={transporter} readOnlyP={true} />
                )}
              </Grid>
              <Grid item xs={12} sm={6} md={4} lg={3}>
                <Typography
                  variant="subtitle1"
                  className={classes.LabelTypography}
                >
                  Move Mode <span style={{ color: "red" }}>*</span>
                </Typography>
                {isEditing ? (
                  <TextField
                    id="line"
                    value={moveMode}
                    variant="outlined"
                    select
                    fullWidth
                    name="line"
                    className={classes.textField}
                    inputProps={{ className: classes.input }}
                    onChange={(e) => handleEditChange(e, setMoveMode)}
                  >
                    {["EXPORT", "RE-EXPORT"].map((option) => (
                      <MenuItem key={option} value={option}>
                        {option}
                      </MenuItem>
                    ))}
                  </TextField>
                ) : (
                  <GateInTextField value={moveMode} readOnlyP={true} />
                )}
              </Grid>

              {!isEditing && (
                <Grid item xs={12} sm={6} md={4} lg={3}>
                  <Typography
                    variant="subtitle1"
                    className={classes.LabelTypography}
                  >
                    Truck In Time
                  </Typography>
                  <GateInTextField
                    value={getTruck?.gate_in_time}
                    readOnlyP={true}
                  />
                </Grid>
              )}

              {!isEditing && (
                <Grid item xs={12} sm={6} md={4} lg={3}>
                  <Typography
                    variant="subtitle1"
                    className={classes.LabelTypography}
                  >
                    Truck Out Time
                  </Typography>
                  <GateInTextField
                    value={getTruck?.gate_out_time}
                    readOnlyP={true}
                  />
                </Grid>
              )}

              {!isEditing && (
                <Grid item xs={12} sm={6} md={4} lg={3}>
                  <Typography
                    variant="subtitle1"
                    className={classes.LabelTypography}
                  >
                    Time Since
                  </Typography>
                  <GateInTextField
                    value={getTruck?.time_since}
                    readOnlyP={true}
                  />
                </Grid>
              )}

              <Grid
                item
                xs={12}
                sm={12}
                md={12}
                style={{ textAlign: "center", marginTop: "24px" }}
              >
                {isEditing &&  <Button
                    variant="contained"
                    color="primary"
                    className={classes.addTruckButton}
                    startIcon={<AddCircleOutlineOutlinedIcon />}
                    onClick={handleTruckAdd}
                  >
                    Add Truck
                  </Button>}
                
              
              </Grid>
            </Grid>
          </Paper>
        </TabPanel>
      </Box>
      <Backdrop className={classes.backdrop} open={ui.isloading}>
        <CircularProgress color="inherit" />
      </Backdrop>
    </LayoutContainer>
  );
};

export default TruckTrackingAdd;
