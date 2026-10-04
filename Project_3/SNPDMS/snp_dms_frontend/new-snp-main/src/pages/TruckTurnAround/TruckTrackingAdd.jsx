import React, { useEffect, useState } from "react";
import LayoutContainer from "@components/reusablecomponents/LayoutContainer";
import { useParams, useHistory } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { useSnackbar } from "notistack";
import { useDispatch, useSelector } from "react-redux";
import {
  Backdrop,
  Box,
  CircularProgress,
  Typography,
  Grid,
  Paper,
  Tabs,
  Tab,
  TextField,
  Button,
  MenuItem,
} from "@mui/material";
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
import GateInTextField from "@components/reusablecomponents/GateInTextField";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import { Image } from "semantic-ui-react";
import {
  custombackDropStyle,
  customLabelTypography,
} from "../../utils/CustomClasses";
import CustomBackButton from "@components/reusablecomponents/CustomBackButton";
import LOADED_TRUCK_IMAGE from "../../assets/images/truckTracking/loaded-truck.svg";
import EMPTY_TRUCK_IMAGE from "../../assets/images/truckTracking/empty-truck.svg";

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`scrollable-force-tabpanel-${index}`}
      aria-labelledby={`scrollable-force-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box
          sx={(theme) => ({
            paddingTop: 8,
            paddingBottom: 8,
            [theme.breakpoints.down("sm")]: {
              paddingLeft: 0,
              paddingY: 4,
            },
          })}
        >
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

const TruckTrackingAdd = () => {
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
      var decode = jwtDecode(token);
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
      let reqArray = ["size_data", "type_data", "transporter", "client_data"];
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
      <Box
        sx={(theme) => ({
          paddingX: 8,
          [theme.breakpoints.down("sm")]: {
            paddingX: 0,
          },
        })}
      >
        <Grid container>
          <Grid item size={{ xs: 12 }}>
            <CustomBackButton handleGoBack={handleGoBack} />
          </Grid>
          <Grid item size={{ xs: 12 }}>
            <Paper
              elevation={0}
              sx={(theme) => ({
                flexGrow: 1,
                backgroundColor: "#fff",
                borderRadius: 4,

                [theme.breakpoints.down("md")]: {
                  maxWidth: "unset",
                  marginLeft: "2%",
                  marginRight: "2%",
                  marginTop: "12px",
                },
              })}
            >
              <Tabs
                value={value}
                onChange={handleChange}
                variant="fullWidth"
                indicatorColor="white"
              >
                <Tab
                  sx={(theme) => ({
                    margin: 1,
                    fontSize: 13,
                    borderRadius: value === 0 ? 4 : 2,
                    fontWeight: 600,
                    color: value === 0 ? "#fff !important" : "#000",
                    backgroundColor:
                      value === 0 ? theme.palette.primary.main : "transparent",
                    [theme.breakpoints.down("sm")]: {
                      margin: 1,
                      fontSize: 9,
                    },
                  })}
                  label={
                    <Stack
                      direction={"row"}
                      alignItems={"center"}
                      justifyContent={"center"}
                      spacing={2}
                    >
                      <Image
                        src={LOADED_TRUCK_IMAGE}
                        style={{
                          height: 32,
                          width: 32,
                        }}
                      />
                      <Typography> Loaded Truck </Typography>
                    </Stack>
                  }
                  {...a11yProps(0)}
                />
                <Tab
                  sx={(theme) => ({
                    margin: 1,
                    fontSize: 13,
                    borderRadius: value === 1 ? 4 : 2,
                    fontWeight: 600,
                    color: value === 1 ? "#fff !important" : "#000",
                    backgroundColor:
                      value === 1 ? theme.palette.primary.main : "transparent",
                    [theme.breakpoints.down("sm")]: {
                      margin: 1,
                      fontSize: 9,
                    },
                  })}
                  label={
                    <Stack
                      direction={"row"}
                      alignItems={"center"}
                      justifyContent={"center"}
                      spacing={2}
                    >
                      <Image
                        src={EMPTY_TRUCK_IMAGE}
                        style={{
                          height: 32,
                          width: 32,
                        }}
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
          <Paper
            sx={(theme) => ({
              flexGrow: 1,
              backgroundColor: "#fff",
              borderRadius: 4,

              [theme.breakpoints.down("md")]: {
                maxWidth: "unset",
                marginLeft: "2%",
                marginRight: "2%",
                marginTop: "2px",
              },
            })}
            style={{ padding: "24px 16px" }}
          >
            <Grid container spacing={2}>
              <Grid item size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                <Typography variant="subtitle1" sx={customLabelTypography}>
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
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        "& fieldset": {
                          borderColor: "#243545",
                        },
                      },
                    }}
                    size="small"
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

              <Grid item size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                <Typography variant="subtitle1" sx={customLabelTypography}>
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
                        gateIn?.allDropDown?.client_data?.map(
                          (val) => val.name
                        )) ||
                      []
                    }
                    style={{ padding: 0 }}
                    sx={{
                      "& .MuiAutocomplete-inputRoot[class*='MuiOutlinedInput-root']":
                        {
                          padding: 0,
                        },
                    }}
                    onChange={(event, newValue) => setLine(newValue)}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        autoComplete="off"
                        value={line}
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            "& fieldset": {
                              borderColor: "#243545",
                            },
                          },
                        }}
                        fullWidth
                        variant="outlined"
                      />
                    )}
                  />
                ) : (
                  <GateInTextField value={line} readOnlyP={true} />
                )}
              </Grid>
              <Grid item size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                <Typography variant="subtitle1" sx={customLabelTypography}>
                  Vehicle No <span style={{ color: "red" }}>*</span>
                </Typography>
                {isEditing ? (
                  <TextField
                    id="line"
                    value={vehicleNo}
                    variant="outlined"
                    fullWidth
                    name="line"
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        "& fieldset": {
                          borderColor: "#243545",
                        },
                      },
                    }}
                    size="small"
                    onChange={(e) => handleEditChange(e, setVehicleNo)}
                  />
                ) : (
                  <GateInTextField value={vehicleNo} readOnlyP={true} />
                )}
              </Grid>
              <Grid item size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                <Typography variant="subtitle1" sx={customLabelTypography}>
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
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        "& fieldset": {
                          borderColor: "#243545",
                        },
                      },
                    }}
                    size="small"
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
              <Grid item size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                <Typography variant="subtitle1" sx={customLabelTypography}>
                  Move Mode <span style={{ color: "red" }}>*</span>
                </Typography>
                {isEditing ? (
                  <TextField
                    id="line"
                    value={value === 0 ? "IMPORT" : moveMode}
                    variant="outlined"
                    fullWidth
                    name="line"
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        "& fieldset": {
                          borderColor: "#243545",
                        },
                      },
                    }}
                    size="small"
                    onChange={(e) => handleEditChange(e, setMoveMode)}
                  />
                ) : (
                  <GateInTextField value={moveMode} readOnlyP={true} />
                )}
              </Grid>

              {!isEditing && (
                <Grid item size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                  <Typography variant="subtitle1" sx={customLabelTypography}>
                    Truck In Time
                  </Typography>
                  <GateInTextField
                    value={getTruck?.gate_in_time}
                    readOnlyP={true}
                  />
                </Grid>
              )}

              {!isEditing && (
                <Grid item size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                  <Typography variant="subtitle1" sx={customLabelTypography}>
                    Truck Out Time
                  </Typography>
                  <GateInTextField
                    value={getTruck?.gate_out_time}
                    readOnlyP={true}
                  />
                </Grid>
              )}

              {!isEditing && (
                <Grid item size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                  <Typography variant="subtitle1" sx={customLabelTypography}>
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
                size={{ xs: 12 }}
                style={{ textAlign: "center", marginTop: "24px" }}
              >
                {isEditing ? (
                  <Button
                    variant="contained"
                    color="primary"
                    sx={{
                      width: "240px",
                    }}
                    onClick={handleTruckAdd}
                    startIcon={<AddCircleOutlineOutlinedIcon />}
                  >
                    Add Truck
                  </Button>
                ) : getTruck?.status === "OUT" ? null : (
                  <Button
                    variant="contained"
                    color="primary"
                    sx={{
                      width: "240px",
                    }}
                    onClick={handleTruckUpdate}
                    startIcon={<EditOutlinedIcon />}
                  >
                    Update
                  </Button>
                )}
              </Grid>
            </Grid>
          </Paper>
        </TabPanel>
        <TabPanel value={value} index={1}>
          <Paper
            sx={(theme) => ({
              flexGrow: 1,
              backgroundColor: "#fff",
              borderRadius: 4,

              [theme.breakpoints.down("md")]: {
                maxWidth: "unset",
                marginLeft: "2%",
                marginRight: "2%",
                marginTop: "2px",
              },
            })}
            style={{ padding: "24px 16px" }}
          >
            <Grid container spacing={2}>
              {!isEditing && getTruck?.status === "OUT" && (
                <Grid item size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                  <Typography variant="subtitle1" sx={customLabelTypography}>
                    Container No <span style={{ color: "red" }}>*</span>
                  </Typography>

                  <GateInTextField
                    value={getTruck?.container_no}
                    readOnlyP={true}
                  />
                </Grid>
              )}
              {!isEditing && getTruck?.status === "OUT" && (
                <Grid item size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                  <Typography variant="subtitle1" sx={customLabelTypography}>
                    Line <span style={{ color: "red" }}>*</span>
                  </Typography>

                  <GateInTextField value={getTruck?.line} readOnlyP={true} />
                </Grid>
              )}
              {!isEditing && getTruck?.status === "OUT" && (
                <Grid item size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                  <Typography variant="subtitle1" sx={customLabelTypography}>
                    Size <span style={{ color: "red" }}>*</span>
                  </Typography>

                  <GateInTextField value={getTruck?.size} readOnlyP={true} />
                </Grid>
              )}
              {!isEditing && getTruck?.status === "OUT" && (
                <Grid item size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                  <Typography variant="subtitle1" sx={customLabelTypography}>
                    Type <span style={{ color: "red" }}>*</span>
                  </Typography>

                  <GateInTextField value={getTruck?.type} readOnlyP={true} />
                </Grid>
              )}
              {!isEditing && getTruck?.status === "OUT" && (
                <Grid item size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                  <Typography variant="subtitle1" sx={customLabelTypography}>
                    Booking No <span style={{ color: "red" }}>*</span>
                  </Typography>

                  <GateInTextField
                    value={getTruck?.booking_no}
                    readOnlyP={true}
                  />
                </Grid>
              )}
              <Grid item size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                <Typography variant="subtitle1" sx={customLabelTypography}>
                  Vehicle No <span style={{ color: "red" }}>*</span>
                </Typography>
                {isEditing ? (
                  <TextField
                    id="line"
                    value={vehicleNo}
                    variant="outlined"
                    fullWidth
                    name="line"
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        "& fieldset": {
                          borderColor: "#243545",
                        },
                      },
                    }}
                    size="small"
                    onChange={(e) => handleEditChange(e, setVehicleNo)}
                  />
                ) : (
                  <GateInTextField value={vehicleNo} readOnlyP={true} />
                )}
              </Grid>
              <Grid item size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                <Typography variant="subtitle1" sx={customLabelTypography}>
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
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        "& fieldset": {
                          borderColor: "#243545",
                        },
                      },
                    }}
                    size="small"
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
              <Grid item size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                <Typography variant="subtitle1" sx={customLabelTypography}>
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
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        "& fieldset": {
                          borderColor: "#243545",
                        },
                      },
                    }}
                    size="small"
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
                <Grid item size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                  <Typography variant="subtitle1" sx={customLabelTypography}>
                    Truck In Time
                  </Typography>
                  <GateInTextField
                    value={getTruck?.gate_in_time}
                    readOnlyP={true}
                  />
                </Grid>
              )}

              {!isEditing && (
                <Grid item size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                  <Typography variant="subtitle1" sx={customLabelTypography}>
                    Truck Out Time
                  </Typography>
                  <GateInTextField
                    value={getTruck?.gate_out_time}
                    readOnlyP={true}
                  />
                </Grid>
              )}

              {!isEditing && (
                <Grid item size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                  <Typography variant="subtitle1" sx={customLabelTypography}>
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
                size={{ xs: 12 }}
                style={{ textAlign: "center", marginTop: "24px" }}
              >
                {isEditing && (
                  <Button
                    variant="contained"
                    color="primary"
                    sx={{
                      width: "240px",
                    }}
                    startIcon={<AddCircleOutlineOutlinedIcon />}
                    onClick={handleTruckAdd}
                  >
                    Add Truck
                  </Button>
                )}
              </Grid>
            </Grid>
          </Paper>
        </TabPanel>
      </Box>
      <Backdrop sx={custombackDropStyle} open={ui.isloading}>
        <CircularProgress color="inherit" />
      </Backdrop>
    </LayoutContainer>
  );
};

export default TruckTrackingAdd;
