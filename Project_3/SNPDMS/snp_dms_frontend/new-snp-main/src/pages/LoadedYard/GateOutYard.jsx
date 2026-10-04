import React, { useState, useEffect } from "react";
import {
  Typography,
  Paper,
  TextField,
  MenuItem,
  Grid,
  Button,
  useMediaQuery,
} from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import CustomTextfield from "@components/reusablecomponents/GateInTextField";
import DatePickerField from "@components/reusablecomponents/DatePickerField";
import LoadedYardSearch from "./LoadedYardSearch";
import {
  updateLoadedYardDetails,
  containerValidatorDispatch,
} from "../../actions/LoadedYardActions";
import { useSnackbar } from "notistack";
import { customLabelTypography } from "../../utils/CustomClasses";
import { TableFootercontainer } from "@/components/TableComponent/TableComponent";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";

const GateOutYard = (props) => {
  const dispatch = useDispatch();
  const store = useSelector((state) => state);
  const user = useSelector((state) => state.user);
  const isLoadedYardLogin = user.role === "Loaded Yard"
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
  const [MOTTruckNumber, setMOTTruckNumber] = useState("");
  const [MOTToDepotCode, setMOTToDepotCode] = useState("");
  const [MORTruckNumber, setMORTruckNumber] = useState("");
  const [MORToDepotCode, setMORToDepotCode] = useState("");
  const [EOTTransporter, setEOTTransporter] = useState('');
  const [EOTToLocation, setEOTToLocation] = useState('');
  const [EOTToDepotCode, setEOTToDepotCode] = useState('');


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
    setMOTTruckNumber(store?.loadedYard?.mot_truck_no);
    setMOTToDepotCode(store?.loadedYard?.mot_to_depot_code);
    setMORTruckNumber(store?.loadedYard?.mor_truck_no);
    setMORToDepotCode(store?.loadedYard?.mor_to_depot_code);
    setEOTToDepotCode(store?.loadedYard?.eot_to_depot_code);
    setEOTToLocation(store?.loadedYard?.eot_to_location);
    setEOTTransporter(store?.loadedYard?.eot_transporter);
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
      <Paper
        sx={(theme) => ({
          padding: theme.spacing(2, 3),
          [theme.breakpoints.down("md")]: {
            marginTop: 2,
          },
        })}
        elevation={0}
      >
        <Grid container spacing={1}>
          <Grid item size={{ xs: 12, sm: 6, lg: 3 }}>
            <Typography variant="subtitle1" sx={customLabelTypography}>
              Container Number <span style={{ color: "red" }}>*</span>
            </Typography>
            <TextField
              id="container-number"
              value={containerNumber}
              variant="filled"
              fullWidth
              sx={{
                "& .MuiOutlinedInput-root": {
                  "& fieldset": {
                    borderColor: "#243545",
                  },
                },
              }}
              size="small"
              onChange={handleContainerNumberChange}
              onBlur={handleContainerNumberOnBlur}
              InputProps={{
                readOnly: true,
              }}
              disabled
            />
          </Grid>
          <Grid item size={{ xs: 12, sm: 6, lg: 3 }}>
            <Typography variant="subtitle1" sx={customLabelTypography}>
              Size <span style={{ color: "red" }}>*</span>
            </Typography>
            <TextField
              id="container-size"
              value={size}
              variant="filled"
              fullWidth
              size="small"
              onChange={(e) => {
                setSize(e.target.value);
              }}
              dispatchType={"LOADEDYARD_SIZE"}
              readOnlyP
            />
          </Grid>
          <Grid item size={{ xs: 12, sm: 6, lg: 3 }}>
            <Typography variant="subtitle1" sx={customLabelTypography}>
              Process Type <span style={{ color: "red" }}>*</span>
            </Typography>
            <TextField
              id="container-type"
              select
              value={processType}
              variant="filled"
              fullWidth
              size="small"
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

          <Grid item size={{ xs: 12, sm: 6, lg: 3 }}>
            <Typography variant="subtitle1" sx={customLabelTypography}>
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
          <Grid item size={{ xs: 12, sm: 6, lg: 3 }}>
            <Typography variant="subtitle1" sx={customLabelTypography}>
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
          <Grid item size={{ xs: 12, sm: 6, lg: 3 }}>
            <Typography variant="subtitle1" sx={customLabelTypography}>
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
          <Grid item size={{ xs: 12, sm: 6, lg: 3 }}>
            <Typography variant="subtitle1" sx={customLabelTypography}>
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

          <Grid item size={{ xs: 12, sm: 6, lg: 3 }}>
            <Typography variant="subtitle1" sx={customLabelTypography}>
              OUT Date
            </Typography>

            <DatePickerField
              fullWidth
              dateId="out-date"
              dateValue={outDate}
              dateChange={handleOutDateChange}
              dispatchType={"LOADEDYARD_OUT_DATE"}
              variant="filled"
            />
          </Grid>

          <Grid item size={{ xs: 12, sm: 6, lg: 3 }}>
            <Typography variant="subtitle1" sx={customLabelTypography}>
              Dvan Date <span style={{ color: "red" }}>*</span>
            </Typography>

            <DatePickerField
              fullWidth
              dateId="dvan-date"
              dateValue={DvanDate}
              dateChange={handleDvanDateChange}
              dispatchType={"LOADEDYARD_DVAN_DATE"}
            />
          </Grid>
          <Grid item size={{ xs: 12, sm: 6, lg: 3 }}>
            <Typography variant="subtitle1" sx={customLabelTypography}>
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
            size={{ xs: 12, sm: 6, lg: 3 }}
          >
            <Typography variant="subtitle1" sx={customLabelTypography}>
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
            size={{ xs: 12, sm: 6, lg: 3 }}
          >
            <Typography variant="subtitle1" sx={customLabelTypography}>
              VAN Date
            </Typography>

            <DatePickerField
              fullWidth
              dateId="van-date"
              dateValue={vanDate}
              dateChange={handleVanDateChange}
              dispatchType={"LOADEDYARD_VAN_DATE"}
            />
          </Grid>
          <Grid item size={{ xs: 12, sm: 6, lg: 3 }}>
            <Typography variant="subtitle1" sx={customLabelTypography}>
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
            size={{ xs: 12, sm: 6, lg: 3 }}
          >
            <Typography variant="subtitle1" sx={customLabelTypography}>
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
            size={{ xs: 12, sm: 6, lg: 3 }}
          >
            <Typography variant="subtitle1" sx={customLabelTypography}>
              MOT Date
            </Typography>

            <DatePickerField
              fullWidth
              dateId="mot-date"
              dateValue={motDate}
              dateChange={handleMotDateChange}
              dispatchType={"LOADEDYARD_MOT_DATE"}
            />
          </Grid>
          <Grid item size={{ xs: 12, sm: 6, lg: 3 }}>
            <Typography variant="subtitle1" sx={customLabelTypography}>
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
          <Grid item size={{ xs: 12, sm: 6, lg: 3 }}>
            <Typography variant="subtitle1" sx={customLabelTypography}>
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
          <Grid item size={{ xs: 12, sm: 6, lg: 3 }}>
            <Typography variant="subtitle1" sx={customLabelTypography}>
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
          <Grid item size={{ xs: 12, sm: 6, lg: 3 }}>
            <Typography variant="subtitle1" sx={customLabelTypography}>
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
          <Grid item size={{ xs: 12, sm: 6, lg: 3 }}>
            <Typography variant="subtitle1" sx={customLabelTypography}>
              MOT Truck No.
            </Typography>
            <CustomTextfield
              id="in-time"
              type="text"
              handleChange={(e) => setMOTTruckNumber(e.target.value)}
              value={MOTTruckNumber}
              readOnlyP={user.role !== "Loaded Yard"}
              dispatchType={"LOADEDYARD_MOT_TRUCK_NO"}
            />
          </Grid>
          <Grid item size={{ xs: 12, sm: 6, lg: 3 }}>
            <Typography variant="subtitle1" sx={customLabelTypography}>
              MOT To Depot Code
            </Typography>
            <CustomTextfield
              id="in-time"
              type="text"
              handleChange={(e) => setMOTToDepotCode(e.target.value)}
              value={MOTToDepotCode}
              readOnlyP={user.role !== "Loaded Yard"}
              dispatchType={"LOADEDYARD_MOT_TO_DEPOT_CODE"}
            />
          </Grid>
          <Grid item size={{ xs: 12, sm: 6, lg: 3 }}>
            <Typography variant="subtitle1" sx={customLabelTypography}>
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
            size={{ xs: 12, sm: 6, lg: 3 }}
          >
            <Typography variant="subtitle1" sx={customLabelTypography}>
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
            size={{ xs: 12, sm: 6, lg: 3 }}
          >
            <Typography variant="subtitle1" sx={customLabelTypography}>
              MOR Date
            </Typography>

            <DatePickerField
              fullWidth
              dateId="mor-date"
              dateValue={morDate}
              dateChange={handleMorDateChange}
              dispatchType={"LOADEDYARD_MOR_DATE"}
            />
          </Grid>
          <Grid item size={{ xs: 12, sm: 6, lg: 3 }}>
            <Typography variant="subtitle1" sx={customLabelTypography}>
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
          <Grid item size={{ xs: 12, sm: 6, lg: 3 }}>
            <Typography variant="subtitle1" sx={customLabelTypography}>
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
          <Grid item size={{ xs: 12, sm: 6, lg: 3 }}>
            <Typography variant="subtitle1" sx={customLabelTypography}>
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
          <Grid item size={{ xs: 12, sm: 6, lg: 3 }}>
            <Typography variant="subtitle1" sx={customLabelTypography}>
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
          <Grid item size={{ xs: 12, sm: 6, lg: 3 }}>
            <Typography variant="subtitle1" sx={customLabelTypography}>
              MOR Truck No.
            </Typography>
            <CustomTextfield
              id="in-time"
              type="text"
              handleChange={(e) => setMORTruckNumber(e.target.value)}
              value={MORTruckNumber}
              readOnlyP={user.role !== "Loaded Yard"}
              dispatchType={"LOADEDYARD_MOR_TRUCK_NO"}
            />
          </Grid>
          <Grid item size={{ xs: 12, sm: 6, lg: 3 }}>
            <Typography variant="subtitle1" sx={customLabelTypography}>
              MOR To Depot Code
            </Typography>
            <CustomTextfield
              id="in-time"
              type="text"
              readOnlyP={user.role !== "Loaded Yard"}
              handleChange={(e) => setMORToDepotCode(e.target.value)}
              value={MORToDepotCode}
              dispatchType={"LOADEDYARD_MOR_TO_DEPOT_CODE"}
            />
          </Grid>
          <Grid item size={{ xs: 12, sm: 6, lg: 3 }}>
            <Typography variant="subtitle1" sx={customLabelTypography}>
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
            size={{ xs: 12, sm: 6, lg: 3 }}
          >
            <Typography variant="subtitle1" sx={customLabelTypography}>
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
            size={{ xs: 12, sm: 6, lg: 3 }}
          >
            <Typography variant="subtitle1" sx={customLabelTypography}>
              EOT Date
            </Typography>

            <DatePickerField
              fullWidth
              dateId="eot-date"
              dateValue={eotDate}
              dateChange={handleEotDateChange}
              dispatchType={"LOADEDYARD_EOT_DATE"}
            />
          </Grid>
          <Grid item size={{ xs: 12, sm: 6, lg: 3 }}>
            <Typography variant="subtitle1" sx={customLabelTypography}>
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
               {isLoadedYardLogin &&  <Grid
            item
            size={{ xs: 12, sm: 6, lg: 3 }}
          >
            <Typography variant="subtitle1" sx={customLabelTypography}>
              EOT To Location
            </Typography>
            <CustomTextfield
              id="eot_to_location"
              handleChange={(e) => setEOTToLocation(e.target.value)}
              value={EOTToLocation}
              dispatchType={"LOADEDYARD_EOT_TO_LOCATION"}
              
            />
          </Grid>}
                {isLoadedYardLogin &&  <Grid
            item
            size={{ xs: 12, sm: 6, lg: 3 }}
          >
            <Typography variant="subtitle1" sx={customLabelTypography}>
              EOT To Depot Code
            </Typography>
            <CustomTextfield
              id="eot_to_depot_code"
              handleChange={(e) => setEOTToDepotCode(e.target.value)}
              value={EOTToDepotCode}
              dispatchType={"LOADEDYARD_EOT_TO_DEPOT_CODE"}
              
            />
          </Grid>}
        {isLoadedYardLogin &&  <Grid
            item
            size={{ xs: 12, sm: 6, lg: 3 }}
          >
            <Typography variant="subtitle1" sx={customLabelTypography}>
              EOT Transporter
            </Typography>
            <CustomTextfield
              id="eot-transporter"
              handleChange={(e) => setEOTTransporter(e.target.value)}
              value={EOTTransporter}
              dispatchType={"LOADEDYARD_EOT_TRANSPORTER"}
              
            />
          </Grid>}
   
  
       
          <Grid
            item
            size={{ xs: 12, sm: 6, lg: 3 }}
          >
            <Typography variant="subtitle1" sx={customLabelTypography}>
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
            size={{ xs: 12, sm: 6, lg: 3 }}
          >
            <Typography variant="subtitle1" sx={customLabelTypography}>
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
            size={{ xs: 12, sm: 6, lg: 3 }}
          >
            <Typography variant="subtitle1" sx={customLabelTypography}>
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
            size={{ xs: 12, sm: 6, lg: 3 }}
          >
            <Typography variant="subtitle1" sx={customLabelTypography}>
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
            size={{ xs: 12, sm: 6, lg: 3 }}
          >
            <Typography variant="subtitle1" sx={customLabelTypography}>
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
      </Paper>
      <TableFootercontainer>
        <Button
          variant="contained"
          color="primary"
          size="small"
          sx={{ width: 240, borderRadius: 12 }}
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
              mot_truck_no: MOTTruckNumber,
              mot_to_depot_code: MOTToDepotCode,
              mor_truck_no: MORTruckNumber,
              mor_to_depot_code: MORToDepotCode,
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
            if (isLoadedYardLogin) {
              data.eot_transporter = EOTTransporter
              data.eot_to_location = EOTToLocation
              data.eot_to_depot_code = EOTToDepotCode
            }
            dispatch(updateLoadedYardDetails(data, notify));
          }}
          startIcon={<EditOutlinedIcon fontSize="small" />}
        >
          Update Details
        </Button>
      </TableFootercontainer>
    </div>
  );
};
export default GateOutYard;
