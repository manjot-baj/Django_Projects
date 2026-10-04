import React, { useState, useEffect } from "react";
import {
  makeStyles,
  Typography,
  Paper,
  TextField,
  MenuItem,
  Grid,
  Button,
  Select,
  FormControlLabel,
  Radio,
} from "@material-ui/core";
import AddCircleOutlineIcon from "@material-ui/icons/AddCircleOutline";
import { useDispatch, useSelector } from "react-redux";
import CustomTextfield from "./reusableComponents/GateInTextField";
import DatePickerField from "./reusableComponents/DatePickerField";
import { theme } from "../App";
import { containerValidatorDispatch } from "../actions/GateInActions";
import { useSnackbar } from "notistack";
import { truckTurnAroundGateInContainerDetailsAction } from "../actions/TruckTurnAroundAction";
import { getEnBLockPreGateInContainerValidationAction } from "../actions/EnBlockMovementAction";

const useStyles = makeStyles((theme) => ({
  paperContainer: {
    padding: theme.spacing(2, 3),
  },
  input: {
    padding: 7,
  },
  choiceSelectContainer: {
    border: "1px solid #243545",
    marginTop: "0rem",
    display: "flex",
    borderRadius: 6,
  },
  choice: {
    backgroundColor: "#fff",
    width: "100%",
    padding: 1,
  },
  selectedChoice: {
    borderRadius: 5,
    color: "#fff",
    backgroundColor: "#2F6FB7",
    width: "100%",
    padding: 1,
    "&:hover": {
      backgroundColor: "#2F6FB7",
    },
  },
  lift: {
    backgroundColor: "#fff",
    width: "100%",
    padding: 1,
  },
  selectedLift: {
    borderRadius: 5,
    color: "#fff",
    backgroundColor: "#2F6FB7",
    width: "100%",
    padding: 1,
    "&:hover": {
      backgroundColor: "#2F6FB7",
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
  autocomplete: {
    "& .MuiAutocomplete-inputRoot[class*='MuiOutlinedInput-root']": {
      padding: 0,
    },
  },
  textField: {
    "& .MuiOutlinedInput-root": {
      "& fieldset": {
        borderColor: "#243545",
      },
    },
  },
  textFieldNoLift: {
    "& .MuiOutlinedInput-root": {
      "& fieldset": {
        borderColor: "#243545",
        backgroundColor: "#E8EAEC",
      },
    },
  },
}));

const GateInContainerDetails = (props) => {
  const classes = useStyles();
  const { todayDate } = props;
  const dispatch = useDispatch();
  const store = useSelector((state) => state);
  const {
    gateIn,
    gateInEdit,
    gateInContainerDetails,
    user,
    AdvanceFinanceReducer,
    TruckTurnAroundReducer,
    EnBlockReducer
  } = store;
  const { preGateInFetch } = AdvanceFinanceReducer;
  const { enBlock_Vessel_Voyage_Name } = EnBlockReducer;
  const { getTruckGateInData } = TruckTurnAroundReducer;
  const [clientName, setClientName] = useState("");
  const [containerNumber, setContainerNumber] = useState("");
  const [size, setSize] = useState("");
  const [containerType, setContainerType] = useState("");
  const [payload, setPayload] = useState("0");
  const [grossWeight, setGrossWeight] = useState("0");
  const [tareWeight, setTareWeight] = useState("0");
  const [manufacturingDate, setManufacturingDate] = useState("");
  const [shippingLine, setShippingLine] = useState("");
  const [shippingLineMenuItems, setShippingLineMenuItems] = useState("");
  const notify = useSnackbar().enqueueSnackbar;
  const [selectedChoice, setSelectedChoice] = React.useState(false);
  const [selectedLift, setSelectedLift] = React.useState(false);
  const [doNotLiftRemark, setDoNotLiftRemark] = React.useState("");

  const MenuProps = {
    PaperProps: {
      style: {
        maxHeight: "300px",
        marginTop: 50,
      },
    },
  };

  useEffect(() => {
    // This function will be called when the component is unmounted
    return () => {
      // Dispatch an action to reset the reducer
      dispatch({ type: "RESET_GET_IN_CONTAINER" });
    };
  }, []);

  // Setting the shipping line dropdown whe the client name is selected
  useEffect(() => {
    setShippingLineMenuItems(gateIn.shippingLineMenu);
  }, [gateIn.shippingLineMenu]);

  useEffect(() => {
    setClientShippingLine();
  }, [gateInEdit.selectedContainer.container_data.client]);

  // Checking for data in reducer and setting the state accordingly

  useEffect(() => {
    if (gateInEdit.selectedContainer.container_data.container_no) {
      // Container number
      setContainerNumber(
        gateInEdit.selectedContainer.container_data.container_no
      );
      // CLIENT NAME
      setClientName(gateInEdit.selectedContainer.container_data.client);
      //
      setShippingLine(
        gateInEdit.selectedContainer.container_data.shipping_line
      );
      // shipping line
      setSize(gateInEdit.selectedContainer.container_data.size);
      // type
      setContainerType(gateInEdit.selectedContainer.container_data.type);
      // container payload
      setPayload(gateInEdit.selectedContainer.container_data.payload);
      // container grossweight
      setGrossWeight(gateInEdit.selectedContainer.container_data.gross_wt);
      // tare weight
      setTareWeight(gateInEdit.selectedContainer.container_data.tare_wt);
      // manufacturing date
      setManufacturingDate(
        gateInEdit.selectedContainer.container_data.manufacturing_date
      );
      //Do not lift remark
      setDoNotLiftRemark(
        gateInEdit.selectedContainer.container_data.do_not_lift_remarks
      );
      if (gateInEdit.selectedContainer.container_data.leased_box === "False") {
        setSelectedChoice(false);
      } else {
        setSelectedChoice(true);
      }
      if (gateInEdit.selectedContainer.container_data.do_not_lift === "False") {
        setSelectedLift(false);
      } else {
        setSelectedLift(true);
      }
    } 
  }, [gateInEdit.selectedContainer]);

  useEffect(() => {
    if (gateInEdit.fetchedContainer !== null) {
      setContainerNumber(gateInEdit.fetchedContainer.container_no);
      // CLIENT NAME
      setClientName(gateInEdit.fetchedContainer.client);
      //
      setShippingLine(gateInEdit.fetchedContainer.shipping_line);
      // shipping line
      setSize(gateInEdit.fetchedContainer.size);
      //Do not lift remark
      setDoNotLiftRemark(
        gateInEdit.selectedContainer.container_data.do_not_lift_remarks
      );
      // type
      setContainerType(gateInEdit.fetchedContainer.type);
      // container payload
      setPayload(gateInEdit.fetchedContainer.payload);
      // container grossweight
      setGrossWeight(gateInEdit.fetchedContainer.gross_wt || "0");
      // tare weight
      setTareWeight(gateInEdit.fetchedContainer.tare_wt || "0");
      // manufacturing date
      setManufacturingDate(
        gateInEdit.fetchedContainer.manufacturing_date || todayDate
      );
    }
  }, [gateInEdit.fetchedContainer]);

  useEffect(()=>{
    if (getTruckGateInData !== null) {
      setClientName(getTruckGateInData?.client);
      setShippingLine(getTruckGateInData?.line)
    }
  },[getTruckGateInData])

  useEffect(() => {
   
    if (enBlock_Vessel_Voyage_Name !== null) {
      setSize(enBlock_Vessel_Voyage_Name?.size);
      setContainerType(enBlock_Vessel_Voyage_Name?.type);
      setClientName(enBlock_Vessel_Voyage_Name?.client)
      setShippingLineMenuItems(enBlock_Vessel_Voyage_Name?.line)
    }
  }, [enBlock_Vessel_Voyage_Name]);

  const handleGrossWeightChange = (event) => {
    setGrossWeight(event.target.value);
  };
  const handleTareWeightChange = (event) => {
    setTareWeight(event.target.value);
  };
  const handleDateChange = (date) => {
    setManufacturingDate(date);
  };

  function validateContainerNumber(containerNumber) {
    var re = /^[A-Z]{4}\d{7}$/;
    return re.test(containerNumber);
  }

  const numberExpression = /^\d+$/;

  const handleContainerNumberChange = (event) => {
    if (containerNumber === "" && !validateContainerNumber(containerNumber))
      notify(
        "Please Enter 4 Uppercase and 7 digit combination for Container Number.",
        {
          variant: "warning",
        }
      );
    if (event.target.value.length > 11) {
      notify(
        "Please enter the valid 11 digit combination(4 Uppercase & 7 Number)",
        { variant: "warning" }
      );
      return;
    }
    if (numberExpression.test(event?.target?.value[4])) {
      setContainerNumber(event?.target?.value);
    } else {
      if (event?.target?.value?.length < 5) {
        setContainerNumber(event?.target?.value);
      } else {
        notify(
          "Please enter the valid 11 digit combination(4 Uppercase & 7 Number)",
          { variant: "warning" }
        );
      }
    }
  };

  const handleContainerNumberOnBlur = (event) => {
    let first = event.target.value.slice(0, 4);
    let second = event.target.value.slice(4, 11);
    if (/^[A-Z]+$/.test(first) === false) {
      notify("First 4 alphabets should be uppercase.", {
        variant: "warning",
      });
      setContainerNumber("");
      return;
    }
    if (/^\d+$/.test(second) === false) {
      notify("Select 7 combination of digits.", {
        variant: "warning",
      });
      setContainerNumber("");
      return;
    }
    dispatch(
      containerValidatorDispatch(
        {
          container_no: event.target.value,
          location: localStorage.getItem("location")
            ? localStorage.getItem("location")
            : "",
        },
        gateInEdit.selectedContainer.container_data.container_no,
        notify
      )
    );
    dispatch(
      truckTurnAroundGateInContainerDetailsAction(event.target.value, notify))

    dispatch(
      getEnBLockPreGateInContainerValidationAction(event.target.value, notify)
    );
    dispatch({ type: "SET_GATE_IN_DATE_TIME" });
  };

  // set client shipping line in edit
  const setClientShippingLine = () => {
    const { gateIn } = store;
    if (gateIn.allDropDown && gateIn.allDropDown.client_data) {
      for (var client of gateIn.allDropDown.client_data) {
        if (
          client.name === gateInEdit.selectedContainer.container_data.client
        ) {
          dispatch({
            type: "SET_SHIPPING_LINE_MENU_ITEMS",
            payload: client.shipping_line,
          });
        }
      }
    }
  };

  const handleChoiceSelect = () => {
    setSelectedChoice((choice) => !choice);
  };

  const handleLiftSelect = () => {
    setSelectedLift((lift) => !lift);
  };

  const handleNoSelect = () => {
    handleChoiceSelect();
    dispatch({
      type: gateInEdit.selectedContainer.container_data.leased_box
        ? "SET_EDIT_LEASED_BOX"
        : "SET_LEASED_BOX",
      payload: "False",
    });
  };

  const handleYesSelect = () => {
    handleChoiceSelect();
    dispatch({
      type: gateInEdit.selectedContainer.container_data.leased_box
        ? "SET_EDIT_LEASED_BOX"
        : "SET_LEASED_BOX",
      payload: "True",
    });
  };

  const handleNoLiftSelect = () => {
    handleLiftSelect();
    dispatch({
      type: gateInEdit.selectedContainer.container_data.do_not_lift
        ? "SET_EDIT_DO_NOT_LIFT"
        : "SET_DO_NOT_LIFT",
      payload: "False",
    });
  };

  const handleYesLiftSelect = () => {
    handleLiftSelect();
    dispatch({
      type: gateInEdit.selectedContainer.container_data.do_not_lift
        ? "SET_EDIT_DO_NOT_LIFT"
        : "SET_DO_NOT_LIFT",
      payload: "True",
    });
  };

 

  // const editContainerDetails =
  return (
    <div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-around",
        }}
      >
        <Typography
          variant="subtitle2"
          style={{ paddingTop: 14, paddingBottom: 14 }}
        >
          Container details
        </Typography>
        <Button
          onClick={() => window.location.reload()}
          style={{
            paddingLeft: 50,
            paddingRight: 50,
            color: "#fff",
            cursor: "pointer",
            backgroundColor: "#2A5FA5",
          }}
          startIcon={<AddCircleOutlineIcon />}
        >
          New
        </Button>
      </div>
      <Paper className={classes.paperContainer} elevation={0}>
        <Grid container spacing={3}>
          <Grid
            item
            xs={12}
            sm={6}
            lg={3}
            style={theme.breakpoints.down("sm") && { padding: 7 }}
          >
            <Typography variant="subtitle1" className={classes.LabelTypography}>
              Client Name <span style={{ color: "red" }}>*</span>
            </Typography>

            {preGateInFetch === null &&
            gateInEdit.selectedContainer.lolo_data.payment_type !==
              "Advance" &&  enBlock_Vessel_Voyage_Name == null && getTruckGateInData === null ? (
              <Select
                id="client-name"
                value={clientName}
                fullWidth
                onChange={(e) => {
                  setClientName(e.target.value);
                  dispatch({
                    type: gateInEdit.selectedContainer.container_data.client
                      ? "EDIT_CLIENT_NAME"
                      : "SET_CLIENT",
                    payload: e.target.value,
                  });
                }}
                inputProps={{
                  style: {
                    padding: "0px",
                  },
                }}
                MenuProps={MenuProps}
              >
                {gateIn.allDropDown &&
                  gateIn.allDropDown.line_client_data &&
                  gateIn.allDropDown.line_client_data.map((option) => (
                    <MenuItem
                      key={option.name}
                      value={option.name}
                      onClick={() => {
                        setShippingLine("");
                        dispatch({
                          type: gateInEdit.selectedContainer.container_data
                            .client
                            ? "CLEAR_SHIPPING_LINE_EDIT"
                            : "CLEAR_SHIPPING_LINE",
                        });
                        dispatch({
                          type: "SET_SHIPPING_LINE_MENU_ITEMS",
                          payload: option.shipping_line,
                        });
                      }}
                    >
                      {option.name}
                    </MenuItem>
                  ))}
              </Select>
            ) : (
              <CustomTextfield value={clientName} readOnlyP={true} />
            )}
          </Grid>
          <Grid
            item
            xs={12}
            sm={6}
            lg={3}
            style={theme.breakpoints.down("sm") && { padding: 7 }}
          >
            <Typography variant="subtitle1" className={classes.LabelTypography}>
              Container Number <span style={{ color: "red" }}>*</span>
            </Typography>
            {preGateInFetch === null &&
            gateInEdit.selectedContainer.lolo_data.payment_type !==
              "Advance" ? (
              <TextField
                id="container-number"
                value={containerNumber}
                variant="outlined"
                fullWidth
                className={classes.textField}
                inputProps={{ className: classes.input }}
                onChange={handleContainerNumberChange}
                onBlur={handleContainerNumberOnBlur}
                autoComplete="off"
              />
            ) : (
              <CustomTextfield value={containerNumber} readOnlyP={true} />
            )}
          </Grid>
          <Grid
            item
            xs={12}
            sm={6}
            lg={3}
            style={theme.breakpoints.down("sm") && { padding: 7 }}
          >
            <Typography variant="subtitle1" className={classes.LabelTypography}>
              Size <span style={{ color: "red" }}>*</span>
            </Typography>

            {(preGateInFetch === null &&
            gateInEdit.selectedContainer.lolo_data.payment_type !==
              "Advance") && enBlock_Vessel_Voyage_Name == null ? (
              <TextField
                id="container-size"
                select
                value={size}
                variant="outlined"
                fullWidth
                inputProps={{ className: classes.input }}
                onChange={(e) => {
                  setSize(e.target.value);
                  dispatch({
                    type: gateInEdit.selectedContainer.container_data.size
                      ? "EDIT_CONTAINER_SIZE"
                      : "SET_SIZE",
                    payload: e.target.value,
                  });
                }}
              >
                {gateIn.allDropDown &&
                  gateIn.allDropDown.size_data &&
                  gateIn.allDropDown.size_data.map((option) => (
                    <MenuItem key={option.name} value={option.name}>
                      {option.name}
                    </MenuItem>
                  ))}
              </TextField>
            ) : (
              <CustomTextfield value={size} readOnlyP={true} />
            )}
          </Grid>
          <Grid
            item
            xs={12}
            sm={6}
            lg={3}
            style={theme.breakpoints.down("sm") && { padding: 7 }}
          >
            <Typography variant="subtitle1" className={classes.LabelTypography}>
              Type <span style={{ color: "red" }}>*</span>
            </Typography>
            {(preGateInFetch === null &&
              gateInEdit.selectedContainer.lolo_data.payment_type !==
                "Advance") &&
            enBlock_Vessel_Voyage_Name === null ? (
              <TextField
                id="container-type"
                select
                value={containerType}
                variant="outlined"
                fullWidth
                inputProps={{ className: classes.input }}
                onChange={(e) => {
                  setContainerType(e.target.value);
                  dispatch({
                    type: gateInEdit.selectedContainer.container_data.type
                      ? "EDIT_CONTAINER_TYPE"
                      : "SET_TYPE",
                    payload: e.target.value,
                  });
                }}
              >
                {gateIn.allDropDown &&
                  gateIn.allDropDown.type_data &&
                  gateIn.allDropDown.type_data.map((option) => (
                    <MenuItem key={option.name} value={option.name}>
                      {option.name}
                    </MenuItem>
                  ))}
              </TextField>
            ) : (
              <CustomTextfield value={containerType} readOnlyP={true} />
            )}
          </Grid>

          <Grid
            item
            xs={12}
            sm={6}
            lg={3}
            style={theme.breakpoints.down("sm") && { padding: 7 }}
          >
            <Typography variant="subtitle1" className={classes.LabelTypography}>
              Payload
            </Typography>
            <CustomTextfield
              id="payload"
              value={parseFloat(grossWeight) - parseFloat(tareWeight)}
              readOnlyP={true}
            />
          </Grid>
          <Grid
            item
            xs={12}
            sm={6}
            lg={3}
            style={theme.breakpoints.down("sm") && { padding: 7 }}
          >
            <Typography variant="subtitle1" className={classes.LabelTypography}>
              Gross weight
              {/* <span style={{ color: 'red' }}>*</span> */}
            </Typography>
            <CustomTextfield
              id="gross-weight"
              value={grossWeight}
              handleChange={handleGrossWeightChange}
              dispatchType={
                gateInEdit.selectedContainer.container_data.gross_wt
                  ? "EDIT_GROSS_WEIGHT"
                  : "SET_GROSS_WEIGHT"
              }
            />
          </Grid>
          <Grid
            item
            xs={12}
            sm={6}
            lg={3}
            style={theme.breakpoints.down("sm") && { padding: 7 }}
          >
            <Typography variant="subtitle1" className={classes.LabelTypography}>
              Tare Weight
              {/* <span style={{ color: "red" }}>*</span> */}
            </Typography>
            <CustomTextfield
              id="tare-weight"
              handleChange={handleTareWeightChange}
              value={tareWeight}
              dispatchType={
                gateInEdit.selectedContainer.container_data.tare_wt
                  ? "EDIT_TARE_WEIGHT"
                  : "SET_TARE_WEIGHT"
              }
            />
          </Grid>

          <Grid
            item
            xs={12}
            sm={6}
            lg={3}
            style={theme.breakpoints.down("sm") && { padding: 7 }}
          >
            <Typography variant="subtitle1" className={classes.LabelTypography}>
              Manufacturing Date<span style={{ color: "red" }}>*</span>
            </Typography>

            <DatePickerField
              dateId="manufacturing-date"
              dateValue={manufacturingDate}
              dateChange={handleDateChange}
              isDisableFuture={true}
              dispatchType={
                gateInEdit && gateInEdit.selectedContainer.container_data.pk
                  ? "EDIT_MANUFACTURING_DATE"
                  : "SET_MANUFACTURING_DATE"
              }
            />
          </Grid>
          <Grid
            item
            xs={12}
            sm={6}
            lg={3}
            style={theme.breakpoints.down("sm") && { padding: 7 }}
          >
            <Typography variant="subtitle1" className={classes.LabelTypography}>
              Shipping Line <span style={{ color: "red" }}>*</span>
            </Typography>

            {shippingLineMenuItems?.length > 0 ? (
              <TextField
                id="shipping-line"
                select
                value={shippingLine}
                variant="outlined"
                fullWidth
                inputProps={{ className: classes.input }}
                onChange={(e) => {
                  setShippingLine(e.target.value);
                  dispatch({
                    type: gateInEdit.selectedContainer.container_data.client
                      ? "EDIT_SHIPPING_LINE"
                      : "SET_SHIPPING_LINE",
                    payload: e.target.value,
                  });
                }}
              >
                {shippingLineMenuItems.map((option) => (
                  <MenuItem key={option.name} value={option.name}>
                    {option.name}
                  </MenuItem>
                ))}
              </TextField>
            ) : (
              <TextField
                id="shipping-line-disable"
                value={shippingLine}
                // disabled
                inputProps={{ className: classes.input }}
                variant="outlined"
                fullWidth
                InputProps={clientName === "" && { readOnly: true }}
              />
            )}
          </Grid>
          <Grid
            item
            xs={12}
            sm={6}
            lg={3}
            style={theme.breakpoints.down("sm") && { padding: 7 }}
          >
            <Typography variant="subtitle1" className={classes.LabelTypography}>
              Leased Box
            </Typography>
            <Grid
              container
              spacing={1}
              className={classes.choiceSelectContainer}
            >
              <Grid item xs={6}>
                <Button
                  className={
                    selectedChoice ? classes.choice : classes.selectedChoice
                  }
                  onClick={handleNoSelect}
                >
                  No
                </Button>
              </Grid>
              <Grid item xs={6}>
                <Button
                  className={
                    selectedChoice ? classes.selectedChoice : classes.choice
                  }
                  onClick={handleYesSelect}
                >
                  Yes
                </Button>
              </Grid>
            </Grid>
          </Grid>
          <Grid
            item
            xs={12}
            sm={6}
            lg={3}
            style={theme.breakpoints.down("sm") && { padding: 7 }}
          >
            <Typography variant="subtitle1" className={classes.LabelTypography}>
              Do Not Lift
            </Typography>
            <Grid
              container
              spacing={1}
              className={classes.choiceSelectContainer}
            >
              <Grid item xs={6}>
                <Button
                  className={selectedLift ? classes.lift : classes.selectedLift}
                  onClick={handleNoLiftSelect}
                >
                  No
                </Button>
              </Grid>
              <Grid item xs={6}>
                <Button
                  className={selectedLift ? classes.selectedLift : classes.lift}
                  onClick={handleYesLiftSelect}
                >
                  Yes
                </Button>
              </Grid>
            </Grid>
          </Grid>
          <Grid
            item
            xs={12}
            sm={6}
            lg={3}
            style={theme.breakpoints.down("sm") && { padding: 7 }}
          >
            <Typography variant="subtitle1" className={classes.LabelTypography}>
              Do Not Lift remark
            </Typography>
            <TextField
              id="do-not-lift-remark"
              value={doNotLiftRemark}
              variant="outlined"
              fullWidth
              className={
                selectedLift ? classes.textField : classes.textFieldNoLift
              }
              inputProps={{ className: classes.input, readOnly: !selectedLift }}
              onChange={(e) => {
                setDoNotLiftRemark(e.target.value);
                dispatch({
                  type: gateInEdit.selectedContainer.container_data.client
                    ? "EDIT_DO_NOT_LIFT_REMARKS"
                    : "SET_DO_NOT_LIFT_REMARKS",
                  payload: e.target.value,
                });
              }}
              autoComplete="off"
            />
          </Grid>
          <Grid
            item
            xs={12}
            sm={6}
            lg={3}
            style={theme.breakpoints.down("sm") && { padding: 7 }}
          >
            <Typography variant="subtitle2" style={{ paddingRight: 10 }}>
              Automatic MNR Status Change?
            </Typography>
            <FormControlLabel
              value="yes"
              control={
                <Radio
                  style={{ color: "#2A5FA5" }}
                  checked={
                    gateInEdit.selectedContainer.container_data
                      .automatic_mnr_status_change
                      ? gateInEdit.selectedContainer.container_data
                          .automatic_mnr_status_change === "True"
                      : gateInContainerDetails.automatic_mnr_status_change ===
                        "True"
                  }
                  onClick={() =>
                    dispatch({
                      type: gateInEdit.selectedContainer.container_data
                        .automatic_mnr_status_change
                        ? "SET_EDIT_AUTO_STATUS_CHANGE"
                        : "SET_GATE_IN_AUTO_MNR",
                      payload: "True",
                    })
                  }
                  disabled={
                    (localStorage.getItem("mnr_module") === "false" ||
                      localStorage.getItem("transportation_module") ===
                        "false" ||
                      localStorage.getItem("loaded_yard_module") === "false" ||
                      localStorage.getItem("new_billing_module") === "false") &&
                    localStorage.getItem("automatic_mnr_status_change") ===
                      "false"
                  }
                />
              }
              label="Yes"
            />
            <FormControlLabel
              value="no"
              control={
                <Radio
                  style={{ color: "#2A5FA5" }}
                  checked={
                    gateInEdit.selectedContainer.container_data
                      .automatic_mnr_status_change
                      ? gateInEdit.selectedContainer.container_data
                          .automatic_mnr_status_change === "False"
                      : gateInContainerDetails.automatic_mnr_status_change ===
                        "False"
                  }
                  disabled={
                    (localStorage.getItem("mnr_module") === "false" ||
                      localStorage.getItem("transportation_module") ===
                        "false" ||
                      localStorage.getItem("loaded_yard_module") === "false" ||
                      localStorage.getItem("new_billing_module") === "false") &&
                    localStorage.getItem("automatic_mnr_status_change") ===
                      "false"
                  }
                  onClick={() =>
                    dispatch({
                      type: gateInEdit.selectedContainer.container_data
                        .automatic_mnr_status_change
                        ? "SET_EDIT_AUTO_STATUS_CHANGE"
                        : "SET_GATE_IN_AUTO_MNR",
                      payload: "False",
                    })
                  }
                />
              }
              label="No"
            />
          </Grid>
        </Grid>
      </Paper>
    </div>
  );
};
export default GateInContainerDetails;
