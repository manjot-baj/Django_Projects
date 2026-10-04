import React, { useState, useEffect, useRef } from "react";
import {
  makeStyles,
  Typography,
  Paper,
  TextField,
  MenuItem,
  Grid,
  FormControlLabel,
  Radio,
  Button,
  Modal,
  Box,
} from "@material-ui/core";
import CustomTextfield from "./reusableComponents/GateInTextField";
import DatePickerField from "./reusableComponents/DatePickerField";
import { useDispatch, useSelector } from "react-redux";
import Autocomplete from "@material-ui/lab/Autocomplete";
import { getVesselVoyageDetailListings } from "../actions/Master/VesselVoyageDetailMasterActions";
import { getLocationCodeDetailListings } from "../actions/Master/LocationCodeDetailMasterActions";
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import HighlightOffIcon from "@mui/icons-material/HighlightOff";
import { useSnackbar } from "notistack";
import Camera, { FACING_MODES, IMAGE_TYPES } from "react-html5-camera-photo";
import { Stack } from "@mui/material";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import { downloadGateLicenseImage } from "../actions/GateInActions";

const style = {
  position: "absolute",
  top: "52%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "calc(100%)",
  height: "calc(100%)",
  bgcolor: "transparent",
  border: "none",
  boxShadow: 24,
  pt: 2,
  px: 4,
  pb: 3,
};

const useStyles = makeStyles((theme) => ({
  paperContainer: {
    padding: theme.spacing(1.25, 2.25),
  },
  input: {
    padding: 7,
  },
  LabelTypography: {
    fontSize: 14,
    fontWeight: 600,
    color: "#243545",
    paddingBottom: 4,
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
}));

const GateInDetails = (props) => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const fileRef = useRef();
  const notify = useSnackbar().enqueueSnackbar;
  const store = useSelector((state) => state);
  const {
    gateIn,
    gateInEdit,
    vesselVoyageDetailMaster,
    locationCodeDetailMaster,
    AdvanceFinanceReducer,
    gateInDetails,
    user,
    TruckTurnAroundReducer,
    EnBlockReducer
  } = store;
  const {getTruckGateInData} = TruckTurnAroundReducer;
  const {enBlock_Vessel_Voyage_Name} = EnBlockReducer
  const { preGateInFetch } = AdvanceFinanceReducer;
  const { todayDate, todayTime } = props;
  const [inDate, setInDate] = useState("");
  const [inTime, setInTime] = useState("");
  const [condition, setCondition] = useState("");
  const [grade, setGrade] = useState("");
  const [arrived, setArrived] = useState("");
  const [consignor, setConsignor] = useState("");
  const [customer, setCustomer] = useState("");
  const [shipper, setShipper] = useState("");
  const [source, setSource] = useState("");
  const [locationArray, setLocationArray] = useState([]);
  const [fromLocationCode, setFromLocationCode] = useState("");
  const [fromPortCode, setFromPortCode] = useState("");
  const [vesselVoyageName, setVesselVoyageName] = useState("");
  const [vesselName, setVesselName] = useState("");
  const [voyageNumber, setVoyageNumber] = useState("");
  const [DORef, setDORef] = useState("");
  const [importCargo, setImportCargo] = useState("");
  const [exportCargoType, setExportCargoType] = useState("");
  const [transporterName, setTransporterName] = useState("");
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [bLNumber, setBLNumber] = useState("");
  const [driverName, setDriverName] = useState("");
  const [driverMobile, setDriverMobile] = useState("");
  const [driverLicenseNumber, setDriverLicenseNumber] = useState("");
  const [carrierCode, setCarrierCode] = useState("");
  const [location, setLocation] = useState("");
  const [remark, setRemaek] = useState("");
  const [locationCodeDetail, setLocationCodeDetail] = useState([]);
  var [data] = useState({});
  const [more, setMore] = useState(false);
  const [mobileUpload, setMobileUpload] = useState([]);
  const [imageUploading, setIsImageUploading] = useState(false);
  const [file, setFile] = useState([]);
  const [openMobile, setOpenMobile] = useState(false);
  const [picture, setPicture] = useState([]);
  const [imgData, setImgData] = useState([]);

  useEffect(() => {
    let data = {
      vessel_voyage: "",
      vessel_name: "",
      voyage_no: "",
      booking_no: "",
      location: localStorage.getItem("location")
        ? localStorage.getItem("location")
        : null,
      site: localStorage.getItem("site") ? localStorage.getItem("site") : null,
    };
    dispatch(getVesselVoyageDetailListings(data));
  }, []);

  useEffect(() => {
    if (gateInEdit.selectedContainer.container_data.container_no) {
      setInDate(gateInEdit.selectedContainer.gate_in_data.in_date);
      // IN TIME
      setInTime(gateInEdit.selectedContainer.gate_in_data.in_time);
      // CONDITION
      setCondition(gateInEdit.selectedContainer.gate_in_data.condition);
      // GRADE
      setGrade(gateInEdit.selectedContainer.gate_in_data.grade);
      // ARRIVED
      setArrived(gateInEdit.selectedContainer.gate_in_data.arrived);
      // CONSIGNOR
      setConsignor(gateInEdit.selectedContainer.gate_in_data.consignee);
      // CUSTOMER
      setCustomer(gateInEdit.selectedContainer.gate_in_data.customer);
      // SHIPPER
      setShipper(gateInEdit.selectedContainer.gate_in_data.shipper);
      // SOURCE
      setSource(gateInEdit.selectedContainer.gate_in_data.source);
      // FROM LOCATION CODE
      setFromLocationCode(
        gateInEdit.selectedContainer.gate_in_data.from_location_code
      );
      // PORT CODE
      setFromPortCode(gateInEdit.selectedContainer.gate_in_data.from_port_code);
      // VESSEL NAMAE
      setVesselName(gateInEdit.selectedContainer.gate_in_data.vessel_name);
      // VOYAGE NUMBER
      setVoyageNumber(gateInEdit.selectedContainer.gate_in_data.voyage_no);
      // DO REF
      setDORef(gateInEdit.selectedContainer.gate_in_data.do_ref);
      // IMPORT CARGO
      setImportCargo(gateInEdit.selectedContainer.gate_in_data.cargo);
      // EXPORT CARGO TYPE
      setExportCargoType(
        gateInEdit.selectedContainer.gate_in_data.export_cargo_type
      );
      // Transporter name
      setTransporterName(
        gateInEdit.selectedContainer.gate_in_data.transporter_name
      );
      // Vehicle Number
      setVehicleNumber(gateInEdit.selectedContainer.gate_in_data.vehicle_no);
      // BL Number
      setBLNumber(gateInEdit.selectedContainer.gate_in_data.bl_no);
      // DRIVER NAME
      setDriverName(gateInEdit.selectedContainer.gate_in_data.driver_name);
      // Driver Mobile
      setDriverMobile(
        gateInEdit.selectedContainer.gate_in_data.driver_mobile_no
      );
      // Driver License number
      setDriverLicenseNumber(
        gateInEdit.selectedContainer.gate_in_data.driver_license
      );
      // Carrier code
      setCarrierCode(gateInEdit.selectedContainer.gate_in_data.carrier_code);
      // Location
      setLocation(gateInEdit.selectedContainer.gate_in_data.location);
      //

      // REMARK
      setRemaek(gateInEdit.selectedContainer.gate_in_data.remarks);

      data = {
        name_code: "",
        name: "",
        code: "",
        type: "",
        location: localStorage.getItem("location")
          ? localStorage.getItem("location")
          : null,
        site: localStorage.getItem("site")
          ? localStorage.getItem("site")
          : null,
      };

      setLocationCodeDetail(
        locationCodeDetailMaster?.allLocationCodeDetailListing?.filter(
          (value) => value?.type === arrived
        )
      );
    } else {
      if (gateInEdit.fetchedContainer === null) {
        setInDate(todayDate);
        setInTime(todayTime);
      }

      data = {
        name_code: "",
        name: "",
        code: "",
        type: "",
        location: localStorage.getItem("location")
          ? localStorage.getItem("location")
          : null,
        site: localStorage.getItem("site")
          ? localStorage.getItem("site")
          : null,
      };
    }
    dispatch(getLocationCodeDetailListings(data));
  }, [gateInEdit.selectedContainer, arrived]);

  useEffect(() => {
    if (gateInEdit.fetchedContainer !== null) {
      setInDate(gateInEdit.fetchedContainer.in_date || todayDate);
      setInTime(gateInEdit.fetchedContainer.in_time || todayTime);
      dispatch({
        type: "SET_IN_DATE",
        payload: gateInEdit.fetchedContainer.in_date,
      });
      dispatch({
        type: "SET_IN_TIME",
        payload: gateInEdit.fetchedContainer.in_time,
      });
      setGrade(gateInEdit.fetchedContainer.grade);
      dispatch({
        type: "SET_GRADE",
        payload: gateInEdit.fetchedContainer.grade,
      });
    }
  }, [gateInEdit.fetchedContainer]);

  useEffect(() => {
    setInDate(todayDate);
    setInTime(todayTime);
  }, [todayDate, todayTime]);

  useEffect(() => {
    if (preGateInFetch !== null) {
      setConsignor(preGateInFetch.consignee || "");
      setShipper(preGateInFetch.shipper || "");
      setBLNumber(preGateInFetch.bl_no);
      setImportCargo(preGateInFetch.cargo || "");
      setRemaek(preGateInFetch.remarks || "");
      setArrived(preGateInFetch.arrived);
    }
  }, [preGateInFetch]);

  useEffect(()=>{
     if(getTruckGateInData !==null){
      setTransporterName(getTruckGateInData.transporter)
      setVehicleNumber(getTruckGateInData.vehicle_no)
     }
  },[getTruckGateInData])

  useEffect(()=>{
     if(enBlock_Vessel_Voyage_Name !==null){
       setBLNumber(enBlock_Vessel_Voyage_Name?.job_order_no)
       setVesselName(enBlock_Vessel_Voyage_Name?.vessel_name)
       setVoyageNumber(enBlock_Vessel_Voyage_Name?.voyage_no)
       setArrived("Port/Vessel")
     }
  },[enBlock_Vessel_Voyage_Name])

  const handleMoreHide = () => {
    setMore(!more);
  };

  const onChangePicture = (e) => {
    setMobileUpload([]);
    uploadMultipleFiles(e);
    setPicture(e.target.files[0]);
    const reader = new FileReader();
    reader.addEventListener("load", () => {
      setImgData(reader.result);
      dispatch({
        type: gateInEdit.selectedContainer.gate_in_data.gate_pass_no
          ? "EDIT_DRIVER_LICENSE_IMAGE"
          : "SET_DRIVER_IMAGE",
        payload: reader.result,
      });
    });
    reader.readAsDataURL(e.target.files[0]);
  };

  const handleCloseMobile = () => setOpenMobile((prev) => !prev);
  const handleMobileClick = () => setOpenMobile(true);

  function handleTakePhoto(dataUri) {
    setImgData([]);
    setMobileUpload([dataUri]);
    dispatch({
      type: gateInEdit.selectedContainer.gate_in_data.gate_pass_no
        ? "EDIT_DRIVER_LICENSE_IMAGE"
        : "SET_DRIVER_IMAGE",
      payload: dataUri,
    });
    setOpenMobile(false);
  }

  function handleTakePhotoAnimationDone(dataUri) {
    // Do stuff with the photo...
    console.log("takePhoto");
  }

  function handleCameraError(error) {
    console.log("handleCameraError", error);
  }

  function handleCameraStart(stream) {
    console.log("handleCameraStart");
  }

  function handleCameraStop() {
    console.log("handleCameraStop");
  }

  const uploadMultipleFiles = (e) => {
    setFile([e.target.files[0]]);
  };

  const handleLineSelect = () => {
    dispatch({
      type: gateInEdit.selectedContainer.gih_pk
        ? "EDIT_LOLO_APPLY_CHARGES"
        : "LOLO_APPLY_CHARGES",
      payload: "Line",
    });
  };

  const handlePartySelect = () => {
    dispatch({
      type: gateInEdit.selectedContainer.gih_pk
        ? "EDIT_LOLO_APPLY_CHARGES"
        : "LOLO_APPLY_CHARGES",
      payload: "Party",
    });
  };

  return (
    <div>
      <Typography
        variant="subtitle2"
        style={{ paddingTop: 14, paddingBottom: 14 }}
      >
        Gate in details
      </Typography>
      <Paper className={classes.paperContainer} elevation={0}>
        <Grid container spacing={3}>
          {gateInEdit.selectedContainer.gate_in_data.gate_pass_no && (
            <Grid item xs={12} sm={6} md={4} lg={3}>
              <Typography variant="subtitle1">Gate Pass number</Typography>
              <CustomTextfield
                id="in-gate-pass-number"
                readOnlyP={true}
                value={gateInEdit.selectedContainer.gate_in_data.gate_pass_no}
              />
            </Grid>
          )}
          <Grid item xs={12} sm={6} md={4} lg={3}>
            <Typography variant="subtitle1" className={classes.LabelTypography}>
              IN Date <span style={{ color: "red" }}>*</span>
            </Typography>

            <DatePickerField
              dateId="in-date"
              dateValue={inDate}
              isDisableFuture={true}
              dateChange={(date) => setInDate(date)}
              dispatchType={
                gateInEdit.selectedContainer.gate_in_data.gate_pass_no
                  ? "EDIT_GATE_IN_DATE"
                  : "SET_IN_DATE"
              }
            />
          </Grid>

          <Grid item xs={12} sm={6} md={4} lg={3}>
            <Typography variant="subtitle1" className={classes.LabelTypography}>
              IN Time <span style={{ color: "red" }}>*</span>
            </Typography>
            <CustomTextfield
              id="in-time"
              type="time"
              handleChange={(e) => {
                setInTime(e.target.value);
              }}
              value={inTime}
              dispatchType={
                gateInEdit.selectedContainer.gate_in_data.gate_pass_no
                  ? "EDIT_GATE_IN_TIME"
                  : "SET_IN_TIME"
              }
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4} lg={3}>
            <Typography variant="subtitle1" className={classes.LabelTypography}>
              condition <span style={{ color: "red" }}>*</span>
            </Typography>

            <TextField
              id="condition"
              select
              value={condition}
              variant="outlined"
              fullWidth
              inputProps={{ className: classes.input }}
              onChange={(e) => {
                setCondition(e.target.value);
                dispatch({
                  type: gateInEdit.selectedContainer.container_data.container_no
                    ? "EDIT_GATE_IN_CONDITION"
                    : "SET_CONDITION",
                  payload: e.target.value,
                });
              }}
            >
              {gateIn.allDropDown &&
                gateIn.allDropDown.damage_code_n_condition &&
                gateIn.allDropDown.damage_code_n_condition.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
            </TextField>
          </Grid>

          <Grid item xs={12} sm={6} md={4} lg={3}>
            <Typography variant="subtitle1" className={classes.LabelTypography}>
              Arrived <span style={{ color: "red" }}>*</span>
            </Typography>

            {(preGateInFetch !== null ||
            gateInEdit.selectedContainer.lolo_data.payment_type ===
              "Advance" || enBlock_Vessel_Voyage_Name !==null ) ? (
              <CustomTextfield value={arrived} readOnlyP={true} />
            ) : (
              <TextField
                id="arrived"
                select
                value={arrived}
                variant="outlined"
                fullWidth
                inputProps={{ className: classes.input }}
                onChange={(e) => {
                  if (preGateInFetch !== null) {
                    return;
                  }
                  setArrived(e.target.value);
                  dispatch({
                    type: gateInEdit.selectedContainer.container_data
                      .container_no
                      ? "EDIT_GATE_IN_ARRIVED"
                      : "SET_ARRIVED",
                    payload: e.target.value,
                  });
                  if (gateInEdit.selectedContainer.gih_pk) {
                    if (
                      e.target.value === "Road/Rail" ||
                      e.target.value === "Port/Vessel"
                    ) {
                      handleLineSelect();
                    } else if (
                      e.target.value === "Factory" ||
                      e.target.value === "CFS/ICD"
                    ) {
                      handlePartySelect();
                    } else {
                      handleLineSelect();
                    }
                  }
                  setLocationCodeDetail(
                    locationCodeDetailMaster.allLocationCodeDetailListing.filter(
                      (value) => value.type === e.target.value
                    )
                  );
                }}
              >
                {gateIn.allDropDown &&
                  gateIn.allDropDown.arrived &&
                  gateIn.allDropDown.arrived.map((option) => {
                    if (
                      user.lolo_finance === true ||
                      user.lolo_finance === "True"
                    ) {
                      if (option === "Factory") {
                        return;
                      } else if (option === "CFS/ICD") {
                        return;
                      } else if (option === "FS RETURN") {
                        return;
                      } else {
                        return (
                          <MenuItem key={option} value={option}>
                            {option}
                          </MenuItem>
                        );
                      }
                    } else {
                      return (
                        <MenuItem key={option} value={option}>
                          {option}
                        </MenuItem>
                      );
                    }
                  })}
              </TextField>
            )}
          </Grid>

          {gateIn.allDropDown && gateIn.allDropDown.transporter && (
            <Grid item xs={12} sm={6} md={4} lg={3}>
              <Typography
                variant="subtitle1"
                className={classes.LabelTypography}
              >
                Transporter Name <span style={{ color: "red" }}>*</span>
              </Typography>

            { getTruckGateInData !==null ?<CustomTextfield value={transporterName} readOnlyP={true}/> :  <Autocomplete
                value={transporterName}
                onChange={(event, newValue) => {
                  setTransporterName(newValue);
                  // dispatch({
                  //   type: gateInEdit.selectedContainer.gate_in_data.gate_pass_no
                  //     ? "EDIT_TRANSPORTER_NAME"
                  //     : "SET_TRANSPORTER_NAME",
                  //   payload: newValue,
                  // });
                }}
                style={{ padding: 0 }}
                className={classes.autocomplete}
                options={
                  gateIn.allDropDown &&
                  gateIn.allDropDown.transporter &&
                  gateIn.allDropDown.transporter.map((option) => option.name)
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    variant="outlined"
                    className={classes.textField}
                    onBlur={(e) => {
                      setTransporterName(e.target.value);
                      dispatch({
                        type: gateInEdit.selectedContainer.gate_in_data
                          .gate_pass_no
                          ? "EDIT_TRANSPORTER_NAME"
                          : "SET_TRANSPORTER_NAME",
                        payload: e.target.value,
                      });
                    }}
                    fullWidth
                  />
                )}
              />}
            </Grid>
          )}
          <Grid item xs={12} sm={6} md={4} lg={3}>
            <Typography variant="subtitle1" className={classes.LabelTypography}>
              Vehicle Number <span style={{ color: "red" }}>*</span>
            </Typography>
           {getTruckGateInData !==null ?<CustomTextfield value={vehicleNumber} readOnlyP={true}/> :  <CustomTextfield
              id="vehicle-number"
              handleChange={(e) => setVehicleNumber(e.target.value)}
              value={vehicleNumber}
              dispatchType={
                gateInEdit.selectedContainer.gate_in_data.gate_pass_no
                  ? "EDIT_VEHICLE_NUMBER"
                  : "SET_VEHICLE_NUMBER"
              }
            />}
          </Grid>

          <Grid item xs={12} sm={6} md={4} lg={3}>
            <Typography variant="subtitle1" className={classes.LabelTypography}>
              BL Number
            </Typography>
            <CustomTextfield
              id="bl-number"
              handleChange={(e) => setBLNumber(e.target.value)}
              readOnlyP={preGateInFetch !== null ||gateInEdit.selectedContainer.lolo_data.payment_type ==="Advance"||enBlock_Vessel_Voyage_Name !==null}
              value={bLNumber}
              dispatchType={
                gateInEdit.selectedContainer.gate_in_data.gate_pass_no
                  ? "EDIT_BL_NUMBER"
                  : "SET_BL_NUMBER"
              }
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4} lg={3}>
            <Typography variant="subtitle1" className={classes.LabelTypography}>
              Driver Name <span style={{ color: "red" }}>*</span>
            </Typography>
            <CustomTextfield
              id="driver-name"
              handleChange={(e) => setDriverName(e.target.value)}
              value={driverName}
              dispatchType={
                gateInEdit.selectedContainer.gate_in_data.gate_pass_no
                  ? "EDIT_DRIVER_NAME"
                  : "SET_DRIVER_NAME"
              }
            />
          </Grid>

          <Grid item xs={12} sm={6} md={4} lg={3}>
            <Typography variant="subtitle1" className={classes.LabelTypography}>
              Driver License Number <span style={{ color: "red" }}>*</span>
            </Typography>
            <CustomTextfield
              id="driver-license-number"
              handleChange={(e) => setDriverLicenseNumber(e.target.value)}
              value={driverLicenseNumber}
              dispatchType={
                gateInEdit.selectedContainer.gate_in_data.gate_pass_no
                  ? "EDIT_DRIVER_LICENSE_NUMBER"
                  : "SET_DRIVER_LICENSE_NUMBER"
              }
            />
          </Grid>
          {gateInEdit.selectedContainer.gate_in_data &&
            gateInEdit.selectedContainer.gate_in_data.image_link && (
              <Grid
                item
                sm={12}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-start",
                  justifyContent: "flex-start",
                }}
              >
                <img
                  src={`${
                    gateInEdit.selectedContainer.gate_in_data?.image_link
                  }?${new Date()}`}
                  style={{
                    height: "232px",
                    width: "232px",
                    objectFit: "cover",
                    borderRadius: "10px",
                    margin: "10px",
                  }}
                  alt={gateInEdit.selectedContainer.gate_in_data?.image_link}
                />
                <Button
                  startIcon={<FileDownloadIcon style={{ fill: "white" }} />}
                  variant="contained"
                  color="secondary"
                  style={{
                    backgroundColor: "rgb(11,121,21)",
                    fontSize: "12px",
                  }}
                  onClick={() => {
                    const link = document.createElement("a");
                    link.download = `driver_license.jpeg`;
                    link.href =
                      gateInEdit.selectedContainer.gate_in_data?.image_link;
                    link.click();
                  }}
                >
                  Download Driver Licence Image
                </Button>
              </Grid>
            )}

          <Grid item sm={12}>
            <Typography variant="subtitle1" className={classes.LabelTypography}>
              Upload Driver License Image
            </Typography>
          </Grid>

          <Grid
            item
            sm={8}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              boxShadow: "0px 0px 2px  gray",
              borderRadius: "8px",
            }}
          >
            <Stack
              direction={"column"}
              alignItems={"flex-start"}
              justifyContent={"space-between"}
              spacing={2}
            >
              <input
                type="file"
                className="form-control"
                onChange={onChangePicture}
                ref={fileRef}
                accept=".png, .jpg, .jpeg"
              />
              <Typography
                variant="subtitle2"
                style={{
                  textAlign: "center",
                  width: "70%",
                }}
              >
                or
              </Typography>

              <Button
                variant="contained"
                color="secondary"
                startIcon={<CameraAltIcon />}
                style={{ backgroundColor: "#FE5E37" }}
                onClick={handleMobileClick}
              >
                Camera Upload
              </Button>
            </Stack>

            {(gateInEdit.selectedContainer.gate_in_data?.image_url?.length >
              0 ||
              gateInDetails.image_url?.length > 0) && (
              <img
                src={
                  gateInEdit.selectedContainer.gate_in_data?.image_url
                    ? gateInEdit.selectedContainer.gate_in_data?.image_url
                    : gateInDetails.image_url
                }
                style={{
                  height: "170px",
                  width: "170px",
                  objectFit: "cover",
                  borderRadius: "10px",
                  margin: "10px",
                }}
                alt=""
              />
            )}
          </Grid>

          <Grid
            item
            xs={12}
            style={{
              display: "flex",
              alignItems: "center",
              // justifyContent: "space-between",
              padding: "2px 2px 8px 18px",
            }}
          >
            <Typography
              variant="subtitle2"
              style={{ paddingTop: 14, paddingBottom: 14 }}
            >
              More Details?
            </Typography>
            <FormControlLabel
              value="show"
              style={{ marginLeft: 10 }}
              control={
                <Radio
                  style={{ color: "#2F6FB7" }}
                  checked={more}
                  onClick={() => setMore(true)}
                />
              }
              label="Show"
            />
            <FormControlLabel
              value="hide"
              control={
                <Radio
                  style={{ color: "#2F6FB7" }}
                  checked={!more}
                  onClick={handleMoreHide}
                />
              }
              label="Hide"
            />
          </Grid>

          {more && (
            <>
              <Grid item xs={12} sm={6} md={4} lg={3}>
                <Typography
                  variant="subtitle1"
                  className={classes.LabelTypography}
                >
                  Grade
                </Typography>

                <TextField
                  id="grade"
                  select
                  value={grade}
                  variant="outlined"
                  fullWidth
                  inputProps={{ className: classes.input }}
                  onChange={(e) => {
                    setGrade(e.target.value);
                    dispatch({
                      type: gateInEdit.selectedContainer.container_data
                        .container_no
                        ? "EDIT_GATE_IN_GRADE"
                        : "SET_GRADE",
                      payload: e.target.value,
                    });
                  }}
                >
                  {gateIn.allDropDown &&
                    gateIn.allDropDown.grade &&
                    gateIn.allDropDown.grade.map((option) => (
                      <MenuItem key={option} value={option}>
                        {option}
                      </MenuItem>
                    ))}
                </TextField>
              </Grid>

              <Grid item xs={12} sm={6} md={4} lg={3}>
                <Typography
                  variant="subtitle1"
                  className={classes.LabelTypography}
                >
                  Consignor
                </Typography>
                <CustomTextfield
                  id="consignore"
                  handleChange={(e) => setConsignor(e.target.value)}
                  value={consignor}
                  readOnlyP={
                    preGateInFetch !== null ||
                    gateInEdit.selectedContainer.lolo_data.payment_type ===
                      "Advance"
                  }
                  dispatchType={
                    gateInEdit.selectedContainer.gate_in_data.gate_pass_no
                      ? "EDIT_GATE_IN_CONSIGNOR"
                      : "SET_CONSIGNOR"
                  }
                />
              </Grid>

              <Grid item xs={12} sm={6} md={4} lg={3}>
                <Typography
                  variant="subtitle1"
                  className={classes.LabelTypography}
                >
                  Shipper
                </Typography>
                <CustomTextfield
                  id="shipper"
                  handleChange={(e) => setShipper(e.target.value)}
                  readOnlyP={
                    preGateInFetch !== null ||
                    gateInEdit.selectedContainer.lolo_data.payment_type ===
                      "Advance"
                  }
                  value={shipper}
                  dispatchType={
                    gateInEdit.selectedContainer.gate_in_data.gate_pass_no
                      ? "EDIT_GATE_IN_SHIPPER"
                      : "SET_SHIPPER"
                  }
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4} lg={3}>
                <Typography
                  variant="subtitle1"
                  className={classes.LabelTypography}
                >
                  Source
                </Typography>
                <CustomTextfield
                  id="source"
                  handleChange={(e) => setSource(e.target.value)}
                  value={source}
                  dispatchType={
                    gateInEdit.selectedContainer.gate_in_data.gate_pass_no
                      ? "EDIT_GATE_IN_SOURCE"
                      : "SET_SOURCE"
                  }
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4} lg={3}>
                <Typography
                  variant="subtitle1"
                  className={classes.LabelTypography}
                >
                  Search Name Code
                </Typography>
                <Autocomplete
                  value={locationArray}
                  onChange={(event, newValue) => {
                    setLocationArray(newValue);
                    for (
                      let i = 0;
                      i <
                      locationCodeDetailMaster.allLocationCodeDetailListing
                        .length;
                      i++
                    ) {
                      if (
                        locationCodeDetailMaster.allLocationCodeDetailListing[i]
                          .name_code === newValue
                      ) {
                        setFromLocationCode(
                          locationCodeDetailMaster.allLocationCodeDetailListing[
                            i
                          ].code
                        );
                        gateInEdit.selectedContainer.gate_in_data.gate_pass_no
                          ? dispatch({
                              type: "EDIT_FROM_LOCATION_CODE",
                              payload:
                                locationCodeDetailMaster
                                  .allLocationCodeDetailListing[i].code,
                            })
                          : dispatch({
                              type: "SET_FROM_LOCATION_CODE",
                              payload:
                                locationCodeDetailMaster
                                  .allLocationCodeDetailListing[i].code,
                            });

                        setFromLocationCode(
                          locationCodeDetailMaster.allLocationCodeDetailListing[
                            i
                          ].code
                        );

                        gateInEdit.selectedContainer.gate_in_data.gate_pass_no
                          ? dispatch({
                              type: "EDIT_GATE_IN_FROM_LOCATION_NAME_CODE",
                              payload:
                                locationCodeDetailMaster
                                  .allLocationCodeDetailListing[i].name_code,
                            })
                          : dispatch({
                              type: "SET_IN_FROM_LOCATION_NAME_CODE",
                              payload:
                                locationCodeDetailMaster
                                  .allLocationCodeDetailListing[i].name_code,
                            });
                      }
                    }
                  }}
                  style={{ padding: 0 }}
                  className={classes.autocomplete}
                  options={
                    locationCodeDetail &&
                    locationCodeDetail.map((option) => option.name_code)
                  }
                  disabled={
                    !gateInEdit.selectedContainer.container_data.pk
                      ? locationCodeDetail.length === 0 || arrived === "By Rail"
                      : arrived === "By Rail"
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      variant="outlined"
                      className={classes.textField}
                      fullWidth
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4} lg={3}>
                <Typography
                  variant="subtitle1"
                  className={classes.LabelTypography}
                >
                  From Location Code
                </Typography>
                <CustomTextfield
                  id="from-location-code"
                  handleChange={(e) => setFromLocationCode(e.target.value)}
                  value={fromLocationCode}
                  readOnlyP={true}
                  dispatchType={
                    gateInEdit.selectedContainer.gate_in_data.gate_pass_no
                      ? "EDIT_FROM_LOCATION_CODE"
                      : "SET_FROM_LOCATION_CODE"
                  }
                />
              </Grid>

              <Grid item xs={12} sm={6} md={4} lg={3}>
                <Typography
                  variant="subtitle1"
                  className={classes.LabelTypography}
                >
                  From Port Code
                </Typography>
                <CustomTextfield
                  id="from-port-code"
                  handleChange={(e) => setFromPortCode(e.target.value)}
                  value={fromPortCode}
                  dispatchType={
                    gateInEdit.selectedContainer.gate_in_data.gate_pass_no
                      ? "EDIT_FROM_PORT_CODE"
                      : "SET_FROM_PORT_CODE"
                  }
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4} lg={3}>
                <Typography
                  variant="subtitle1"
                  className={classes.LabelTypography}
                >
                  Carrier Code
                </Typography>
                <Autocomplete
                  value={carrierCode}
                  onChange={(event, newValue) => {
                    setCarrierCode(newValue);
                  }}
                  style={{ padding: 0 }}
                  className={classes.autocomplete}
                  options={
                    gateIn.allDropDown &&
                    gateIn.allDropDown.carrier_code &&
                    gateIn.allDropDown.carrier_code.map((option) => option.name)
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      variant="outlined"
                      className={classes.textField}
                      onBlur={(e) => {
                        setCarrierCode(e.target.value);
                        dispatch({
                          type: gateInEdit.selectedContainer.gate_in_data
                            .gate_pass_no
                            ? "EDIT_CARRIER_CODE"
                            : "SET_CARRIER_CODE",
                          payload: e.target.value,
                        });
                      }}
                      fullWidth
                    />
                  )}
                />
              </Grid>
              { enBlock_Vessel_Voyage_Name ===null && <Grid item xs={12} sm={6} md={4} lg={3}>
                <Typography
                  variant="subtitle1"
                  className={classes.LabelTypography}
                >
                  Search Vessel-Voyage Name
                </Typography>
               <Autocomplete
                  value={vesselVoyageName}
                  onChange={(event, newValue) => {
                    setVesselVoyageName(newValue);
                    for (
                      let i = 0;
                      i <
                      vesselVoyageDetailMaster.allVesselVoyageDetailListing
                        .length;
                      i++
                    ) {
                      if (
                        vesselVoyageDetailMaster.allVesselVoyageDetailListing[i]
                          .vessel_voyage_name === newValue
                      ) {
                        setVesselName(
                          vesselVoyageDetailMaster.allVesselVoyageDetailListing[
                            i
                          ].vessel_name
                        );
                        gateInEdit.selectedContainer.gate_in_data.gate_pass_no
                          ? dispatch({
                              type: "EDIT_VESSEL_NAME",
                              payload:
                                vesselVoyageDetailMaster
                                  .allVesselVoyageDetailListing[i].vessel_name,
                            })
                          : dispatch({
                              type: "SET_VESSEL_NAME",
                              payload:
                                vesselVoyageDetailMaster
                                  .allVesselVoyageDetailListing[i].vessel_name,
                            });
                        setVoyageNumber(
                          vesselVoyageDetailMaster.allVesselVoyageDetailListing[
                            i
                          ].voyage_no
                        );
                        gateInEdit.selectedContainer.gate_in_data.gate_pass_no
                          ? dispatch({
                              type: "EDIT_VOYAGE_NUMBER",
                              payload:
                                vesselVoyageDetailMaster
                                  .allVesselVoyageDetailListing[i].voyage_no,
                            })
                          : dispatch({
                              type: "SET_VOYAGE_NUMBER",
                              payload:
                                vesselVoyageDetailMaster
                                  .allVesselVoyageDetailListing[i].voyage_no,
                            });
                        setDORef(
                          vesselVoyageDetailMaster.allVesselVoyageDetailListing[
                            i
                          ].booking_no
                        );
                        gateInEdit.selectedContainer.gate_in_data.gate_pass_no
                          ? dispatch({
                              type: "EDIT_DO_REF",
                              payload:
                                vesselVoyageDetailMaster
                                  .allVesselVoyageDetailListing[i].booking_no,
                            })
                          : dispatch({
                              type: "SET_DO_REF",
                              payload:
                                vesselVoyageDetailMaster
                                  .allVesselVoyageDetailListing[i].booking_no,
                            });
                      }
                    }
                  }}
                  style={{ padding: 0 }}
                  className={classes.autocomplete}
                  options={
                    vesselVoyageDetailMaster.allVesselVoyageDetailListing &&
                    vesselVoyageDetailMaster.allVesselVoyageDetailListing.map(
                      (option) => option.vessel_voyage_name
                    )
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      variant="outlined"
                      className={classes.textField}
                      fullWidth
                    />
                  )}
                />
              </Grid>}
              <Grid item xs={12} sm={6} md={4} lg={3}>
                <Typography
                  variant="subtitle1"
                  className={classes.LabelTypography}
                >
                  Vessel Name
                </Typography>
                <CustomTextfield
                  id="vessel-name"
                  handleChange={(e) => setVesselName(e.target.value)}
                  value={vesselName}
                  readOnlyP={true}
                  dispatchType={
                    gateInEdit.selectedContainer.gate_in_data.gate_pass_no
                      ? "EDIT_VESSEL_NAME"
                      : "SET_VESSEL_NAME"
                  }
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4} lg={3}>
                <Typography
                  variant="subtitle1"
                  className={classes.LabelTypography}
                >
                  Voyage Number
                </Typography>
                <CustomTextfield
                  id="voyage-number"
                  readOnlyP={true}
                  handleChange={(e) => setVoyageNumber(e.target.value)}
                  value={voyageNumber}
                  dispatchType={
                    gateInEdit.selectedContainer.gate_in_data.gate_pass_no
                      ? "EDIT_VOYAGE_NUMBER"
                      : "SET_VOYAGE_NUMBER"
                  }
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4} lg={3}>
                <Typography
                  variant="subtitle1"
                  className={classes.LabelTypography}
                >
                  DO Ref/Vessel Bkg No.
                </Typography>
                <CustomTextfield
                  id="do-ref"
                  readOnlyP={true}
                  handleChange={(e) => setDORef(e.target.value)}
                  value={DORef}
                  dispatchType={
                    gateInEdit.selectedContainer.gate_in_data.gate_pass_no
                      ? "EDIT_DO_REF"
                      : "SET_DO_REF"
                  }
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4} lg={3}>
                <Typography
                  variant="subtitle1"
                  className={classes.LabelTypography}
                >
                  Import Cargo
                </Typography>
                <CustomTextfield
                  id="import-cargo"
                  handleChange={(e) => setImportCargo(e.target.value)}
                  value={importCargo}
                  readOnlyP={
                    preGateInFetch !== null ||
                    gateInEdit.selectedContainer.lolo_data.payment_type ===
                      "Advance"
                  }
                  dispatchType={
                    gateInEdit.selectedContainer.gate_in_data.gate_pass_no
                      ? "EDIT_IMPORT_CARGO"
                      : "SET_IMPORT_CARGO"
                  }
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4} lg={3}>
                <Typography
                  variant="subtitle1"
                  className={classes.LabelTypography}
                >
                  Export Cargo Type
                </Typography>

                <TextField
                  id="export-cargo-type"
                  select
                  value={exportCargoType}
                  variant="outlined"
                  fullWidth
                  inputProps={{ className: classes.input }}
                  onChange={(e) => {
                    setExportCargoType(e.target.value);
                    dispatch({
                      type: gateInEdit.selectedContainer.container_data
                        .container_no
                        ? "EDIT_EXPORT_CARGO_TYPE"
                        : "SET_EXPORT_CARGO_TYPE",
                      payload: e.target.value,
                    });
                  }}
                >
                  {gateIn.allDropDown &&
                    gateIn.allDropDown.export_cargo_type_data &&
                    gateIn.allDropDown.export_cargo_type_data.map((option) => (
                      <MenuItem key={option.name} value={option.name}>
                        {option.name}
                      </MenuItem>
                    ))}
                </TextField>
              </Grid>

              <Grid item xs={12} sm={6} md={4} lg={3}>
                <Typography
                  variant="subtitle1"
                  className={classes.LabelTypography}
                >
                  Driver Mobile
                </Typography>
                <CustomTextfield
                  id="driver-mobile"
                  handleChange={(e) => setDriverMobile(e.target.value)}
                  value={driverMobile}
                  dispatchType={
                    gateInEdit.selectedContainer.gate_in_data.gate_pass_no
                      ? "EDIT_DRIVER_MOBILE"
                      : "SET_DRIVER_MOBILE"
                  }
                />
              </Grid>

              <Grid item xs={6}>
                <Typography
                  variant="subtitle1"
                  className={classes.LabelTypography}
                >
                  Remark
                </Typography>
                <CustomTextfield
                  id="remark"
                  handleChange={(e) => setRemaek(e.target.value)}
                  isRemark={true}
                  readOnlyP={
                    preGateInFetch !== null ||
                    gateInEdit.selectedContainer.lolo_data.payment_type ===
                      "Advance"
                  }
                  //       rowCount={2}
                  value={remark}
                  dispatchType={
                    gateInEdit.selectedContainer.gate_in_data.gate_pass_no
                      ? "EDIT_GATE_IN_REMARK"
                      : "SET_REMARK"
                  }
                />
              </Grid>
            </>
          )}
        </Grid>
        <Modal
          open={openMobile}
          onClose={handleCloseMobile}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
        >
          <Box style={style}>
            <div
              style={{
                position: "relative",
                width: "100%",
                height: "100%",
              }}
            >
              <Button
                variant="contained"
                color="secondary"
                className={classes.mobileSave}
                onClick={handleCloseMobile}
                style={{
                  backgroundColor: "#1e2337",
                  border: "1px solid #1e2337",
                }}
                endIcon={<CheckCircleOutlineIcon style={{ fill: "green" }} />}
              >
                Save
              </Button>
              <Button
                variant="contained"
                color="secondary"
                className={classes.mobileClose}
                onClick={handleCloseMobile}
                style={{
                  backgroundColor: "rgba(69, 72, 90,0.2)",
                  border: "1px solid #1e2337",
                }}
                endIcon={<HighlightOffIcon style={{ fill: "red" }} />}
              >
                Cancel
              </Button>
              <Camera
                onTakePhoto={(dataUri) => {
                  handleTakePhoto(dataUri);
                }}
                onTakePhotoAnimationDone={(dataUri) => {
                  handleTakePhotoAnimationDone(dataUri);
                }}
                onCameraError={(error) => {
                  handleCameraError(error);
                }}
                idealResolution={{ width: 640, height: 480 }}
                idealFacingMode={FACING_MODES.ENVIRONMENT}
                imageType={IMAGE_TYPES.JPG}
                imageCompression={0.97}
                isMaxResolution={true}
                isImageMirror={false}
                isSilentMode={false}
                isDisplayStartCameraError={true}
                isFullscreen={true}
                sizeFactor={1}
                onCameraStart={(stream) => {
                  handleCameraStart(stream);
                }}
                onCameraStop={() => {
                  handleCameraStop();
                }}
              />
            </div>
          </Box>
        </Modal>
      </Paper>
    </div>
  );
};
export default GateInDetails;
