import React, { useState, useEffect } from "react";
import {
  makeStyles,
  Typography,
  Paper,
  TextField,
  MenuItem,
  Grid,
  Button,
  useMediaQuery,
} from "@material-ui/core";
import { useDispatch, useSelector } from "react-redux";
import CustomTextfield from "../../components/reusableComponents/GateInTextField";
import DatePickerField from "../../components/reusableComponents/DatePickerField";
import { theme } from "../../App";
import LoadedYardSearch from "./LoadedYardSearch";
import {
  updateLoadedYardDetails,
  containerValidatorDispatch,
} from "../../actions/LoadedYardActions";
import { useSnackbar } from "notistack";

const useStyles = makeStyles((theme) => ({
  paperContainer: {
    padding: theme.spacing(2, 3),
  },
  input: {
    padding: 7,
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

  textField: {
    "& .MuiOutlinedInput-root": {
      "& fieldset": {
        borderColor: "#243545",
      },
    },
  },
  searchButton: {
    backgroundColor: "#2A5FA5",
    color: "#fff",
    borderRadius: "0.5rem",
    padding: "1px 4px",
    height: 40,
    width: "100%",
    "&:hover": {
      backgroundColor: "#2A5FA5",
      color: "#fff",
    },
  },
}));

const GateOutYard = (props) => {
  const classes = useStyles();

  const dispatch = useDispatch();
  const store = useSelector((state) => state);
  const [containerNumber, setContainerNumber] = useState("");
  const [size, setSize] = useState("");
  const [processType, setProcessType] = useState("");
  const [liner, setLiner] = useState("");
  const [inwardRake, setInwardRake] = useState("");
  const [outwardRake, setOutwardRake] = useState("");
  const [outDate, setOutDate] = useState("");
  const [DvanDate, setDvanDate] = useState("");
  const [DvanTime, setDvanTime] = useState("");
  const [DvanMoveCode, setDvanMoveCode] = useState("");
  const [id, setId] = useState("");
  const [vanDate, setVanDate] = useState("");
  const [vanTime, setVanTime] = useState("");
  const [vanMoveCode, setVanMoveCode] = useState("");
  const [motDate, setMotDate] = useState("");
  const [motTime, setMotTime] = useState("");
  const [motMoveCode, setMotMoveCode] = useState("");
  const [morDate, setMorDate] = useState("");
  const [morTime, setMorTime] = useState("");
  const [morMoveCode, setMorMoveCode] = useState("");
  const [eotDate, setEotDate] = useState("");
  const [eotTime, setEotTime] = useState("");
  const [eotMoveCode, setEotMoveCode] = useState("");
  const [bookingNo, setBookingNo] = useState("");
  const [sealNo, setSealNo] = useState("");
  const [report, setReport] = useState("");
  const [remark, setRemark] = useState("");
  const [port, setPort] = useState("");
  const [MOTCurrentLocation, setMOTCurrentLocation] = useState("");
  const [MOTTOLocation, setMOTTOLocation] = useState("");
  const [MOTBookingNo, setMOTBookingNo] = useState("");
  const [MOTTransporter, setMOTTransporter] = useState("");
  const [MORCurrentLocation, setMORCurrentLocation] = useState("");
  const [MORToLocation, setMORToLocation] = useState("");
  const [MORBookingNo, setMORBookingNo] = useState("");
  const [MORTransporter, setMORTransporter] = useState("");

  const notify = useSnackbar().enqueueSnackbar;
  const matchesIphone = useMediaQuery("(max-width:400px)");
  useEffect(() => {
    setContainerNumber(store?.loadedYard?.container_no);
    setSize(store?.loadedYard?.size);
    setId(store.loadedYard?.pk);
    setProcessType(store?.loadedYard?.process_type);
    setLiner(store?.loadedYard?.liner);
    setInwardRake(store?.loadedYard?.inward_rake);
    setOutwardRake(store?.loadedYard?.outward_rake);
    setOutDate(store?.loadedYard?.out_date);
    setDvanDate(store?.loadedYard?.dvan_date);
    setDvanTime(store?.loadedYard?.dvan_time);
    setDvanMoveCode(store?.loadedYard?.dvan_move_code);
    setVanDate(store?.loadedYard?.van_date);
    setVanTime(store?.loadedYard?.van_time);
    setVanMoveCode(store?.loadedYard?.van_move_code);
    setMotDate(store?.loadedYard?.mot_date);
    setMotTime(store?.loadedYard?.mot_time);
    setMotMoveCode(store?.loadedYard?.mot_move_code);
    setMorDate(store?.loadedYard?.mor_date);
    setMorTime(store?.loadedYard?.mor_time);
    setMorMoveCode(store?.loadedYard?.mor_move_code);
    setEotDate(store?.loadedYard?.eot_date);
    setEotTime(store?.loadedYard?.eot_time);
    setEotMoveCode(store?.loadedYard?.eot_move_code);
    setBookingNo(store?.loadedYard?.booking_no);
    setSealNo(store?.loadedYard?.seal_no);
    setReport(store?.loadedYard?.report);
    setRemark(store?.loadedYard?.remarks);
    setPort(store?.loadedYard?.port);
    setMOTBookingNo(store?.loadedYard?.mot_booking_no);
    setMOTCurrentLocation(store?.loadedYard?.mot_current_location);
    setMOTTOLocation(store?.loadedYard?.mot_to_location);
    setMOTTransporter(store?.loadedYard?.mot_transporter);
    setMORCurrentLocation(store?.loadedYard?.mor_current_location);
    setMORToLocation(store?.loadedYard?.mor_to_location);
    setMORBookingNo(store?.loadedYard?.mor_booking_no);
    setMORTransporter(store?.loadedYard?.mor_transporter);
  }, [store?.loadedYard]);

  const handleContainerNumberChange = (event) => {
    setContainerNumber(event.target.value);
  };

  const handleContainerNumberOnBlur = (event) => {
    dispatch(
      containerValidatorDispatch(
        {
          container_no: event.target.value,
          location: localStorage.getItem("location")
            ? localStorage.getItem("location")
            : "",
          site: localStorage.getItem("site")
            ? localStorage.getItem("site")
            : null,
        },
        store.loadedYard.container_no,
        notify
      )
    );
    dispatch({ type: "LOADEDYARD_CONTAINER_NUMBER" });
  };

  const handleOutDateChange = (date) => {
    var selectedDate = new Date(date);
    var dd = String(selectedDate.getDate()).padStart(2, "0");
    var mm = String(selectedDate.getMonth() + 1).padStart(2, "0"); //
    var yyyy = selectedDate.getFullYear();
    var selectedDateFormat = yyyy + "-" + mm + "-" + dd;
    setOutDate(selectedDateFormat);
  };

  const handleDvanDateChange = (date) => {
    var selectedDate = new Date(date);
    var dd = String(selectedDate.getDate()).padStart(2, "0");
    var mm = String(selectedDate.getMonth() + 1).padStart(2, "0"); //
    var yyyy = selectedDate.getFullYear();
    var selectedDateFormat = yyyy + "-" + mm + "-" + dd;
    setDvanDate(selectedDateFormat);
  };

  const handleVanDateChange = (date) => {
    var selectedDate = new Date(date);
    var dd = String(selectedDate.getDate()).padStart(2, "0");
    var mm = String(selectedDate.getMonth() + 1).padStart(2, "0"); //
    var yyyy = selectedDate.getFullYear();
    var selectedDateFormat = yyyy + "-" + mm + "-" + dd;
    setVanDate(selectedDateFormat);
  };

  const handleMotDateChange = (date) => {
    var selectedDate = new Date(date);
    var dd = String(selectedDate.getDate()).padStart(2, "0");
    var mm = String(selectedDate.getMonth() + 1).padStart(2, "0"); //
    var yyyy = selectedDate.getFullYear();
    var selectedDateFormat = yyyy + "-" + mm + "-" + dd;
    setMotDate(selectedDateFormat);
  };

  const handleMorDateChange = (date) => {
    var selectedDate = new Date(date);
    var dd = String(selectedDate.getDate()).padStart(2, "0");
    var mm = String(selectedDate.getMonth() + 1).padStart(2, "0"); //
    var yyyy = selectedDate.getFullYear();
    var selectedDateFormat = yyyy + "-" + mm + "-" + dd;
    setMorDate(selectedDateFormat);
  };

  const handleEotDateChange = (date) => {
    var selectedDate = new Date(date);
    var dd = String(selectedDate.getDate()).padStart(2, "0");
    var mm = String(selectedDate.getMonth() + 1).padStart(2, "0"); //
    var yyyy = selectedDate.getFullYear();
    var selectedDateFormat = yyyy + "-" + mm + "-" + dd;
    setEotDate(selectedDateFormat);
  };

  let processArray = ["IN", "OUT"];
  // const editContainerDetails =
  return (
    <div>
      <LoadedYardSearch searchType="GateOutYard" />
      {!matchesIphone && (
        <div
          style={{
            display: "flex",
            alignItems: "left",
            justifyContent: "space-around",
          }}
        >
          <Typography
            variant="subtitle2"
            style={{ paddingTop: 14, paddingBottom: 14 }}
          >
            Gate Out Loaded Yard Container Details
          </Typography>
        </div>
      )}
      <Paper className={classes.paperContainer} elevation={0}>
        <Grid container spacing={3}>
          <Grid
            item
            xs={8}
            sm={6}
            lg={3}
            style={theme.breakpoints.down("sm") && { padding: 7 }}
          >
            <Typography variant="subtitle1" className={classes.LabelTypography}>
              Container Number <span style={{ color: "red" }}>*</span>
            </Typography>
            <TextField
              id="container-number"
              value={containerNumber}
              variant="filled"
              fullWidth
              className={classes.textField}
              inputProps={{ className: classes.input }}
              onChange={handleContainerNumberChange}
              onBlur={handleContainerNumberOnBlur}
              InputProps={{
                readOnly: true,
              }}
              disabled
            />
          </Grid>
          <Grid
            item
            xs={8}
            sm={6}
            lg={3}
            style={theme.breakpoints.down("sm") && { padding: 7 }}
          >
            <Typography variant="subtitle1" className={classes.LabelTypography}>
              Size <span style={{ color: "red" }}>*</span>
            </Typography>
            <TextField
              id="container-size"
              value={size}
              variant="filled"
              fullWidth
              inputProps={{ className: classes.input }}
              onChange={(e) => {
                setSize(e.target.value);
              }}
              dispatchType={"LOADEDYARD_SIZE"}
              readOnlyP
            />
          </Grid>
          <Grid
            item
            xs={8}
            sm={6}
            lg={3}
            style={theme.breakpoints.down("sm") && { padding: 7 }}
          >
            <Typography variant="subtitle1" className={classes.LabelTypography}>
              Process Type <span style={{ color: "red" }}>*</span>
            </Typography>
            <TextField
              id="container-type"
              select
              value={processType}
              variant="filled"
              fullWidth
              inputProps={{ className: classes.input }}
              onChange={(e) => {
                setProcessType(e.target.value);
              }}
              dispatchType={"LOADEDYARD_PROCESSTYPE"}
              readOnlyP
              disabled
            >
              {processArray.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid
            item
            xs={8}
            sm={6}
            lg={3}
            style={theme.breakpoints.down("sm") && { padding: 7 }}
          >
            <Typography variant="subtitle1" className={classes.LabelTypography}>
              Port <span style={{ color: "red" }}>*</span>
            </Typography>
            <CustomTextfield
              id="port"
              value={port}
              handleChange={(e) => {
                setPort(e.target.value);
              }}
              dispatchType={"LOADEDYARD_PORT"}
              readOnlyP
            />
          </Grid>
          <Grid
            item
            xs={8}
            sm={6}
            lg={3}
            style={theme.breakpoints.down("sm") && { padding: 7 }}
          >
            <Typography variant="subtitle1" className={classes.LabelTypography}>
              Liner
            </Typography>
            <CustomTextfield
              id="liner"
              value={liner}
              handleChange={(e) => {
                setLiner(e.target.value);
              }}
              dispatchType={"LOADEDYARD_LINER"}
              readOnlyP
            />
          </Grid>
          <Grid
            item
            xs={8}
            sm={6}
            lg={3}
            style={theme.breakpoints.down("sm") && { padding: 7 }}
          >
            <Typography variant="subtitle1" className={classes.LabelTypography}>
              Inward Rake
            </Typography>
            <CustomTextfield
              id="inward-rake"
              handleChange={(e) => {
                setInwardRake(e.target.value);
              }}
              value={inwardRake}
              dispatchType={"LOADEDYARD_INWARD_RAKE"}
              readOnlyP
            />
          </Grid>
          <Grid
            item
            xs={8}
            sm={6}
            lg={3}
            style={theme.breakpoints.down("sm") && { padding: 7 }}
          >
            <Typography variant="subtitle1" className={classes.LabelTypography}>
              Outward Rake
            </Typography>
            <CustomTextfield
              id="outward-rake"
              handleChange={(e) => {
                setOutwardRake(e.target.value);
              }}
              value={outwardRake}
              dispatchType={"LOADEDYARD_OUTWARD_RAKE"}
              readOnlyP
            />
          </Grid>

          <Grid
            item
            xs={8}
            sm={6}
            lg={3}
            style={theme.breakpoints.down("sm") && { padding: 7 }}
          >
            <Typography variant="subtitle1" className={classes.LabelTypography}>
              OUT Date
            </Typography>

            <DatePickerField
              dateId="out-date"
              dateValue={outDate}
              dateChange={handleOutDateChange}
              dispatchType={"LOADEDYARD_OUT_DATE"}
              variant="filled"
            />
          </Grid>

          <Grid
            item
            xs={8}
            sm={6}
            lg={3}
            style={theme.breakpoints.down("sm") && { padding: 7 }}
          >
            <Typography variant="subtitle1" className={classes.LabelTypography}>
              Dvan Date <span style={{ color: "red" }}>*</span>
            </Typography>

            <DatePickerField
              dateId="dvan-date"
              dateValue={DvanDate}
              dateChange={handleDvanDateChange}
              dispatchType={"LOADEDYARD_DVAN_DATE"}
            />
          </Grid>
          <Grid item xs={8} sm={6} md={4} lg={3}>
            <Typography variant="subtitle1" className={classes.LabelTypography}>
              Dvan Time
            </Typography>
            <CustomTextfield
              id="Dvan-time"
              type="time"
              handleChange={(e) => setDvanTime(e.target.value)}
              value={DvanTime}
              dispatchType={"LOADEDYARD_DVAN_TIME"}
            />
          </Grid>
          <Grid
            item
            xs={8}
            sm={6}
            lg={3}
            style={theme.breakpoints.down("sm") && { padding: 7 }}
          >
            <Typography variant="subtitle1" className={classes.LabelTypography}>
              Dvan Move Code
            </Typography>
            <CustomTextfield
              id="dvan-move-code"
              handleChange={(e) => setDvanMoveCode(e.target.value)}
              value={DvanMoveCode}
              dispatchType={"LOADEDYARD_DVAN_MOVE_CODE"}
              readOnlyP
            />
          </Grid>

          <Grid
            item
            xs={8}
            sm={6}
            lg={3}
            style={theme.breakpoints.down("sm") && { padding: 7 }}
          >
            <Typography variant="subtitle1" className={classes.LabelTypography}>
              VAN Date
            </Typography>

            <DatePickerField
              dateId="van-date"
              dateValue={vanDate}
              dateChange={handleVanDateChange}
              dispatchType={"LOADEDYARD_VAN_DATE"}
            />
          </Grid>
          <Grid item xs={8} sm={6} md={4} lg={3}>
            <Typography variant="subtitle1" className={classes.LabelTypography}>
              VAN Time
            </Typography>
            <CustomTextfield
              id="in-time"
              type="time"
              handleChange={(e) => setVanTime(e.target.value)}
              value={vanTime}
              dispatchType={"LOADEDYARD_VAN_TIME"}
            />
          </Grid>
          <Grid
            item
            xs={8}
            sm={6}
            lg={3}
            style={theme.breakpoints.down("sm") && { padding: 7 }}
          >
            <Typography variant="subtitle1" className={classes.LabelTypography}>
              VAN Move Code
            </Typography>
            <CustomTextfield
              id="van-move-code"
              handleChange={(e) => setVanMoveCode(e.target.value)}
              value={vanMoveCode}
              dispatchType={"LOADEDYARD_VAN_MOVE_CODE"}
              readOnlyP
            />
          </Grid>

          <Grid
            item
            xs={8}
            sm={6}
            lg={3}
            style={theme.breakpoints.down("sm") && { padding: 7 }}
          >
            <Typography variant="subtitle1" className={classes.LabelTypography}>
              MOT Date
            </Typography>

            <DatePickerField
              dateId="mot-date"
              dateValue={motDate}
              dateChange={handleMotDateChange}
              dispatchType={"LOADEDYARD_MOT_DATE"}
            />
          </Grid>
          <Grid item xs={8} sm={6} md={4} lg={3}>
            <Typography variant="subtitle1" className={classes.LabelTypography}>
              MOT Time
            </Typography>
            <CustomTextfield
              id="in-time"
              type="time"
              handleChange={(e) => setMotTime(e.target.value)}
              value={motTime}
              dispatchType={"LOADEDYARD_MOT_TIME"}
            />
          </Grid>
          <Grid item xs={8} sm={6} md={4} lg={3}>
            <Typography variant="subtitle1" className={classes.LabelTypography}>
              MOT Current Location
            </Typography>
            <CustomTextfield
              id="in-time"
              type="text"
              handleChange={(e) => setMOTCurrentLocation(e.target.value)}
              value={MOTCurrentLocation}
              dispatchType={"LOADEDYARD_MOT_CURRENT_LOCATION"}
            />
          </Grid>
          <Grid item xs={8} sm={6} md={4} lg={3}>
            <Typography variant="subtitle1" className={classes.LabelTypography}>
              MOT To Location
            </Typography>
            <CustomTextfield
              id="in-time"
              type="text"
              handleChange={(e) => setMOTTOLocation(e.target.value)}
              value={MOTTOLocation}
              dispatchType={"LOADEDYARD_MOT_TO_LOCATION"}
            />
          </Grid>
          <Grid item xs={8} sm={6} md={4} lg={3}>
            <Typography variant="subtitle1" className={classes.LabelTypography}>
              MOT Booking No.
            </Typography>
            <CustomTextfield
              id="in-time"
              type="text"
              handleChange={(e) => setMOTBookingNo(e.target.value)}
              value={MOTBookingNo}
              dispatchType={"LOADEDYARD_MOT_BOOKING_NO"}
            />
          </Grid>
          <Grid item xs={8} sm={6} md={4} lg={3}>
            <Typography variant="subtitle1" className={classes.LabelTypography}>
              MOT Transporter
            </Typography>
            <CustomTextfield
              id="in-time"
              type="text"
              handleChange={(e) => setMOTTransporter(e.target.value)}
              value={MOTTransporter}
              dispatchType={"LOADEDYARD_MOT_TRANSPORTER"}
            />
          </Grid>
          <Grid
            item
            xs={8}
            sm={6}
            lg={3}
            style={theme.breakpoints.down("sm") && { padding: 7 }}
          >
            <Typography variant="subtitle1" className={classes.LabelTypography}>
              MOT Move Code
            </Typography>
            <CustomTextfield
              id="tare-weight"
              handleChange={(e) => setMotMoveCode(e.target.value)}
              value={motMoveCode}
              dispatchType={"LOADEDYARD_MOT_MOVE_CODE"}
              readOnlyP
            />
          </Grid>

          <Grid
            item
            xs={8}
            sm={6}
            lg={3}
            style={theme.breakpoints.down("sm") && { padding: 7 }}
          >
            <Typography variant="subtitle1" className={classes.LabelTypography}>
              MOR Date
            </Typography>

            <DatePickerField
              dateId="mor-date"
              dateValue={morDate}
              dateChange={handleMorDateChange}
              dispatchType={"LOADEDYARD_MOR_DATE"}
            />
          </Grid>
          <Grid item xs={8} sm={6} md={4} lg={3}>
            <Typography variant="subtitle1" className={classes.LabelTypography}>
              MOR Time
            </Typography>
            <CustomTextfield
              id="in-time"
              type="time"
              handleChange={(e) => setMorTime(e.target.value)}
              value={morTime}
              dispatchType={"LOADEDYARD_MOR_TIME"}
            />
          </Grid>
          <Grid item xs={8} sm={6} md={4} lg={3}>
            <Typography variant="subtitle1" className={classes.LabelTypography}>
              MOR Current Location
            </Typography>
            <CustomTextfield
              id="in-time"
              type="text"
              handleChange={(e) => setMORCurrentLocation(e.target.value)}
              value={MORCurrentLocation}
              dispatchType={"LOADEDYARD_MOR_CURRENT_LOCATION"}
            />
          </Grid>
          <Grid item xs={8} sm={6} md={4} lg={3}>
            <Typography variant="subtitle1" className={classes.LabelTypography}>
              MOR TO Location
            </Typography>
            <CustomTextfield
              id="in-time"
              type="text"
              handleChange={(e) => setMORToLocation(e.target.value)}
              value={MORToLocation}
              dispatchType={"LOADEDYARD_MOR_TO_LOCATION"}
            />
          </Grid>
          <Grid item xs={8} sm={6} md={4} lg={3}>
            <Typography variant="subtitle1" className={classes.LabelTypography}>
              MOR Booking No.
            </Typography>
            <CustomTextfield
              id="in-time"
              type="text"
              handleChange={(e) => setMORBookingNo(e.target.value)}
              value={MORBookingNo}
              dispatchType={"LOADEDYARD_MOR_BOOKING_NO"}
            />
          </Grid>
          <Grid item xs={8} sm={6} md={4} lg={3}>
            <Typography variant="subtitle1" className={classes.LabelTypography}>
              MOR Transporter
            </Typography>
            <CustomTextfield
              id="in-time"
              type="text"
              handleChange={(e) => setMORTransporter(e.target.value)}
              value={MORTransporter}
              dispatchType={"LOADEDYARD_MOR_TRANSPORTER"}
            />
          </Grid>
          <Grid
            item
            xs={8}
            sm={6}
            lg={3}
            style={theme.breakpoints.down("sm") && { padding: 7 }}
          >
            <Typography variant="subtitle1" className={classes.LabelTypography}>
              MOR Move Code
            </Typography>
            <CustomTextfield
              id="tare-weight"
              handleChange={(e) => setMorMoveCode(e.target.value)}
              value={morMoveCode}
              dispatchType={"LOADEDYARD_MOR_MOVE_CODE"}
              readOnlyP
            />
          </Grid>

          <Grid
            item
            xs={8}
            sm={6}
            lg={3}
            style={theme.breakpoints.down("sm") && { padding: 7 }}
          >
            <Typography variant="subtitle1" className={classes.LabelTypography}>
              EOT Date
            </Typography>

            <DatePickerField
              dateId="eot-date"
              dateValue={eotDate}
              dateChange={handleEotDateChange}
              dispatchType={"LOADEDYARD_EOT_DATE"}
            />
          </Grid>
          <Grid item xs={8} sm={6} md={4} lg={3}>
            <Typography variant="subtitle1" className={classes.LabelTypography}>
              EOT Time
            </Typography>
            <CustomTextfield
              id="in-time"
              type="time"
              handleChange={(e) => setEotTime(e.target.value)}
              value={eotTime}
              dispatchType={"LOADEDYARD_EOT_TIME"}
            />
          </Grid>
          <Grid
            item
            xs={8}
            sm={6}
            lg={3}
            style={theme.breakpoints.down("sm") && { padding: 7 }}
          >
            <Typography variant="subtitle1" className={classes.LabelTypography}>
              EOT Move Code
            </Typography>
            <CustomTextfield
              id="tare-weight"
              handleChange={(e) => setEotMoveCode(e.target.value)}
              value={eotMoveCode}
              dispatchType={"LOADEDYARD_EOT_MOVE_CODE"}
              readOnlyP
            />
          </Grid>
          <Grid
            item
            xs={8}
            sm={6}
            lg={3}
            style={theme.breakpoints.down("sm") && { padding: 7 }}
          >
            <Typography variant="subtitle1" className={classes.LabelTypography}>
              Booking Number
            </Typography>
            <CustomTextfield
              id="tare-weight"
              handleChange={(e) => setBookingNo(e.target.value)}
              value={bookingNo}
              dispatchType={"LOADEDYARD_BOOKING_NUMBER"}
              readOnlyP
            />
          </Grid>
          <Grid
            item
            xs={8}
            sm={6}
            lg={3}
            style={theme.breakpoints.down("sm") && { padding: 7 }}
          >
            <Typography variant="subtitle1" className={classes.LabelTypography}>
              Seal Number
            </Typography>
            <CustomTextfield
              id="tare-weight"
              handleChange={(e) => setSealNo(e.target.value)}
              value={sealNo}
              dispatchType={"LOADEDYARD_SEAL_NUMBER"}
              readOnlyP
            />
          </Grid>
          <Grid
            item
            xs={8}
            sm={6}
            lg={3}
            style={theme.breakpoints.down("sm") && { padding: 7 }}
          >
            <Typography variant="subtitle1" className={classes.LabelTypography}>
              Report
            </Typography>
            <CustomTextfield
              id="tare-weight"
              handleChange={(e) => setReport(e.target.value)}
              value={report}
              dispatchType={"LOADEDYARD_REPORT"}
              readOnlyP
            />
          </Grid>
          <Grid
            item
            xs={8}
            sm={6}
            lg={3}
            style={theme.breakpoints.down("sm") && { padding: 7 }}
          >
            <Typography variant="subtitle1" className={classes.LabelTypography}>
              Remark
            </Typography>
            <CustomTextfield
              id="tare-weight"
              handleChange={(e) => setRemark(e.target.value)}
              value={remark}
              dispatchType={"LOADEDYARD_REMARKS"}
              readOnlyP
            />
          </Grid>
        </Grid>
        <Grid
          style={{
            margin: matchesIphone ? "20px 0px auto" : "24px auto",
            width: matchesIphone ? "315px" : "350px",
            display: "flex",
            justifyContent: "space-between",
            paddingTop: matchesIphone ? "0%" : "5%",
          }}
        >
          <Button
            className={classes.searchButton}
            style={{ marginRight: 16 }}
            onClick={() => {
              let data = {
                container_no: containerNumber,
                size: size,
                pk: id,
                port: port,
                process_type: processType,
                liner: liner,
                inward_rake: inwardRake,
                outward_rake: outwardRake,
                out_date: outDate,
                dvan_date: DvanDate,
                dvan_time: DvanTime,
                dvan_move_code: DvanMoveCode,
                van_date: vanDate,
                van_time: vanTime,
                van_move_code: vanMoveCode,
                mot_date: motDate,
                mot_time: motTime,
                mot_current_location: MOTCurrentLocation,
                mot_to_location: MOTTOLocation,
                mot_booking_no: MOTBookingNo,
                mot_transporter: MOTTransporter,
                mor_current_location: MORCurrentLocation,
                mor_to_location: MORToLocation,
                mor_booking_no: MORBookingNo,
                mor_transporter: MORTransporter,
                mot_move_code: motMoveCode,
                mor_date: morDate,
                mor_time: morTime,
                mor_move_code: morMoveCode,
                eot_date: eotDate,
                eot_time: eotTime,
                eot_move_code: eotMoveCode,
                booking_no: bookingNo,
                seal_no: sealNo,
                report: report,
                remarks: remark,
                location: localStorage.getItem("location")
                  ? localStorage.getItem("location")
                  : null,
                site: localStorage.getItem("site")
                  ? localStorage.getItem("site")
                  : null,
              };
              dispatch(updateLoadedYardDetails(data, notify));
            }}
          >
            Update Details
          </Button>
        </Grid>
      </Paper>
    </div>
  );
};
export default GateOutYard;
