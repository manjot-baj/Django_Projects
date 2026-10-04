import React, { useState, useEffect, useRef, useMemo } from "react";
import {
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
  Autocomplete,
} from "@mui/material";
import CustomTextfield from "@components/reusablecomponents/GateInTextField";
import DatePickerField from "@components/reusablecomponents/DatePickerField";
import { getVesselVoyageDetailListings } from "../../actions/master/VesselVoyageDetailMasterActions";
import { getLocationCodeDetailListings } from "../../actions/master/LocationCodeDetailMasterActions";
import { useDispatch, useSelector } from "react-redux";
import { Stack } from "@mui/material";
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import Camera, { FACING_MODES, IMAGE_TYPES } from "react-html5-camera-photo";
import "react-html5-camera-photo/build/css/index.css";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import HighlightOffIcon from "@mui/icons-material/HighlightOff";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import { useSnackbar } from "notistack";
import {
  EDIT_GATE_OUT_ROAD_RAIL_TO_LOCATION_CODE,
  EDIT_GATE_OUT_TO_DEPOT_CODE,
  GATE_OUT_ROAD_RAIL_TO_LOCATION_CODE,
  GATE_OUT_TO_DEPOT_CODE,
} from "../../actions/types";
import { truckTurnAroundGateInVehicleDetailsAction } from "../../actions/TruckTurnAroundAction";
import { customLabelTypography } from "../../utils/CustomClasses";

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

const GateOutDetails = (props) => {
  const { todayDate, todayTime } = props;
  const dispatch = useDispatch();
  const fileRef = useRef();
  const notify = useSnackbar().enqueueSnackbar;
  const store = useSelector((state) => state);
  const {
    gateIn,
    gateOutDetails,
    gateOutEdit,
    locationCodeDetailMaster,
    vesselVoyageDetailMaster,
    gateOutContainerDetails,
    user,
    AdvanceFinanceReducer,
    TruckTurnAroundReducer,
  } = store;
  const { getTruckGateOutVehicleList } = TruckTurnAroundReducer;
  const { preGateOutFetch } = AdvanceFinanceReducer;
  const [outDate, setOutDate] = useState("");
  const [outTime, setOutTime] = useState("");
  const [condition, setCondition] = useState("");
  const [grade, setGrade] = useState("");
  const [departed, setDeparted] = useState("");
  const [consignee, setConsignee] = useState("");
  const [shipper, setShipper] = useState("");
  const [destination, setDestination] = useState("");
  const [gateOutSurveyedBy, setGateOutSurveyedBy] = useState("");
  const [delivery, setDelivery] = useState("");
  const [locationArray, setLocationArray] = useState([]);
  const [toLocation, setToLocation] = useState("");
  const [toPort, setToPort] = useState("");
  const [vesselVoyageName, setVesselVoyageName] = useState("");
  const [vesselName, setVesselName] = useState("");
  const [voyageNumber, setVoyageNumber] = useState("");
  const [roRef, setRoRef] = useState("");
  const [exportCargo, setExportCargo] = useState("");
  const [transporterName, setTransporterName] = useState("");

  const [vehicleNo, setVehicleNo] = useState("");
  const [driverName, setDriverName] = useState("");
  const [driverMobile, setDriverMobile] = useState("");
  const [driverLicense, setDriverLicense] = useState("");
  const [carrierCode, setCarrierCode] = useState("");
  const [location, setLocation] = useState("");
  const [portOfLoading, setPortOfLoading] = useState("");
  const [portOfDischarge, setPortOfDischarge] = useState("");
  const [bookingNumber, setBookingNumber] = useState("");
  const [bookingDate, setBookingDate] = useState("");
  const [bookingParty, setBookingParty] = useState("");
  const [sealNumber, setSealNumber] = useState("");
  const [remarks, setRemarks] = useState("");
  // eslint-disable-next-line no-unused-vars
  const [locationCodeDetail, setLocationCodeDetail] = useState([]);
  const [more, setMore] = useState(false);
  const [selectSealNumberList, setSelectSealNumberList] = useState("");

  const [mobileUpload, setMobileUpload] = useState([]);
  const [imageUploading, setIsImageUploading] = useState(false);
  const [toDepotCode, setToDepotCode] = useState("");
  const [roadRailToLocationCode, setRoadRailToLocationCode] = useState("");
  const [file, setFile] = useState([]);
  const [openMobile, setOpenMobile] = useState(false);
  const [picture, setPicture] = useState([]);
  const [imgData, setImgData] = useState([]);

  const handleMobileClick = () => setOpenMobile(true);

  const vesselVoyagePayload = useMemo(
    () => ({
      vessel_voyage: "",
      vessel_name: "",
      voyage_no: "",
      booking_no: "",
      location: user.location ?? null,
      site: user.site ?? null,
    }),
    [user.location, user.site],
  );

  const locationCodeDetailPayload = useMemo(
    () => ({
      name_code: "",
      name: "",
      code: "",
      type: "",
      location: localStorage.getItem("location")
        ? localStorage.getItem("location")
        : null,
      site: localStorage.getItem("site") ? localStorage.getItem("site") : null,
    }),
    [localStorage.getItem("location"), localStorage.getItem("site")],
  );

  useEffect(() => {
    dispatch(getVesselVoyageDetailListings(vesselVoyagePayload));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    dispatch(getLocationCodeDetailListings(locationCodeDetailPayload));
  }, [departed,gateOutDetails.booking_no]);

  useEffect(() => {
    // eslint-disable-next-line no-unused-vars

    if (gateOutDetails.booking_no) {
      setBookingNumber(gateOutDetails.booking_no);
      setBookingDate(gateOutDetails.booking_date);
      setBookingParty(gateOutDetails.booking_party);
      setSealNumber(gateOutDetails.seal_no);
      setGrade(gateOutDetails.grade);
      setCondition(gateOutDetails.condition);
      setDeparted(gateOutDetails.departed);
      setConsignee(gateOutDetails.consignee);
      setExportCargo(gateOutDetails.export_cargo);
      setRemarks(gateOutDetails.remarks);
      setShipper(gateOutDetails.shipper);
      setDeparted(gateOutDetails.departed);
    } else if (gateOutEdit.selectedContainer.container_data.container_no) {
      setOutDate(gateOutEdit.selectedContainer.gate_out_data.out_date);
      // IN TIME
      setOutTime(gateOutEdit.selectedContainer.gate_out_data.out_time);
      //condition
      setCondition(gateOutEdit.selectedContainer.gate_out_data.condition);
      // grade
      setGrade(gateOutEdit.selectedContainer.gate_out_data.grade);
      // Departed
      setDeparted(gateOutEdit.selectedContainer.gate_out_data.departed);
      // CONSIGNOR
      setConsignee(gateOutEdit.selectedContainer.gate_out_data.consignee);
      // CUSTOMER
      // setCustomer(gateOutEdit.selectedContainer.gate_out_data.customer);
      // SHIPPER
      setShipper(gateOutEdit.selectedContainer.gate_out_data.shipper);
      // SOURCE
      setDestination(gateOutEdit.selectedContainer.gate_out_data.destination);
      setGateOutSurveyedBy(
        gateOutEdit.selectedContainer.gate_out_data.surveyor,
      );
      // FROM LOCATION CODE
      setToLocation(
        gateOutEdit.selectedContainer.gate_out_data.to_location_code,
      );
      // PORT CODE
      setToPort(gateOutEdit.selectedContainer.gate_out_data.to_port_code);
      setToDepotCode(gateOutEdit.selectedContainer.gate_out_data.to_depot_code);
      setRoadRailToLocationCode(
        gateOutEdit.selectedContainer.gate_out_data.road_rail_to_location_code,
      );
      // VESSEL NAMAE
      setVesselName(gateOutEdit.selectedContainer.gate_out_data.vessel_name);
      // VOYAGE NUMBER
      setVoyageNumber(gateOutEdit.selectedContainer.gate_out_data.voyage_no);
      // RO REF
      setRoRef(gateOutEdit.selectedContainer.gate_out_data.ro_ref);
      // IMPORT CARGO
      setExportCargo(gateOutEdit.selectedContainer.gate_out_data.export_cargo);
      // Transporter name
      setTransporterName(
        gateOutEdit.selectedContainer.gate_out_data.transporter_name,
      );
      // Vehicle Number
      setVehicleNo(gateOutEdit.selectedContainer.gate_out_data.vehicle_no);
      // DRIVER NAME
      setDriverName(gateOutEdit.selectedContainer.gate_out_data.driver_name);
      // Driver Mobile
      setDriverMobile(
        gateOutEdit.selectedContainer.gate_out_data.driver_mobile_no,
      );
      // Driver License number
      setDriverLicense(
        gateOutEdit.selectedContainer.gate_out_data.driver_license,
      );
      // Carrier code
      setCarrierCode(gateOutEdit.selectedContainer.gate_out_data.carrier_code);
      // Location
      setLocation(gateOutEdit.selectedContainer.gate_out_data.location);
      // BOOKING NO
      setBookingNumber(gateOutEdit.selectedContainer.gate_out_data.booking_no);
      // BOOKING DATE
      setBookingDate(gateOutEdit.selectedContainer.gate_out_data.booking_date);
      // BOOKING PARTY
      setBookingParty(
        gateOutEdit.selectedContainer.gate_out_data.booking_party,
      );
      // SEAL NO
      setSealNumber(gateOutEdit.selectedContainer.gate_out_data.seal_no);
      // REMARK
      setRemarks(gateOutEdit.selectedContainer.gate_out_data.remarks);

      setLocationCodeDetail(
        locationCodeDetailMaster.allLocationCodeDetailListing &&
          locationCodeDetailMaster.allLocationCodeDetailListing.filter(
            (value) => value.type === departed,
          ),
      );
    } else {

      dispatch({
        type: gateOutEdit.selectedContainer.gate_out_data.gate_pass_no
          ? "EDIT_GATE_CONDITION"
          : "GATE_OUT_CONDITION",
        payload: "OK",
      });
      setCondition("OK");
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gateOutDetails.booking_no, gateOutEdit.selectedContainer, departed]);

  useEffect(() => {
    setOutDate(todayDate);
    setOutTime(todayTime);
  }, [todayDate, todayTime]);

  const handleMoreHide = () => {
    setMore(!more);
  };

  const handleCloseMobile = () => setOpenMobile((prev) => !prev);

  const onChangePicture = (e) => {
    setMobileUpload([]);
    uploadMultipleFiles(e);
    setPicture(e.target.files[0]);
    const reader = new FileReader();
    reader.addEventListener("load", () => {
      setImgData(reader.result);
      dispatch({
        type: gateOutEdit.selectedContainer.gate_out_data.gate_pass_no
          ? "EDIT_GATE_OUT_LICENSE_IMAGE"
          : "GATE_OUT_LICENSE_IMAGE",
        payload: reader.result,
      });
    });
    reader.readAsDataURL(e.target.files[0]);
  };

  const uploadMultipleFiles = (e) => {
    setFile([e.target.files[0]]);
  };

  const handleSurveyImageUpload = () => {
    setIsImageUploading(true);
    if (mobileUpload.length > 0) {
      dispatch({
        type: gateOutEdit.selectedContainer.gate_in_data.gate_pass_no
          ? "EDIT_DRIVER_LICENSE_IMAGE"
          : "SET_DRIVER_IMAGE",
        payload: mobileUpload[0],
      });
      setIsImageUploading(false);
    } else {
      dispatch({
        type: gateOutEdit.selectedContainer.gate_in_data.gate_pass_no
          ? "EDIT_DRIVER_LICENSE_IMAGE"
          : "SET_DRIVER_IMAGE",
        payload: imgData,
      });
      setIsImageUploading(false);
    }

    // let formData = new FormData();
    // let files = [
    //   picture,
    //   ...mobileUpload.map((val) => dataURLtoFile(val, "mobile_servey.jpg")),
    // ];
    // files.map((fileItem) => {
    //   return formData.append("file_list", fileItem);
    // });
  };

  function handleTakePhoto(dataUri) {
    setImgData([]);
    setMobileUpload([dataUri]);
    dispatch({
      type: gateOutEdit.selectedContainer.gate_out_data.gate_pass_no
        ? "EDIT_GATE_OUT_LICENSE_IMAGE"
        : "GATE_OUT_LICENSE_IMAGE",
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

  const handleLineSelect = () => {
    dispatch({
      type: gateOutEdit.selectedContainer.goh_pk
        ? "EDIT_GATE_OUT_LOLO_APPLY_CHARGES"
        : "GATE_OUT_LOLO_APPLY_CHARGES",
      payload: "Line",
    });
  };

  const handlePartySelect = () => {
    dispatch({
      type: gateOutEdit.selectedContainer.goh_pk
        ? "EDIT_GATE_OUT_LOLO_APPLY_CHARGES"
        : "GATE_OUT_LOLO_APPLY_CHARGES",
      payload: "Party",
    });
  };

  return (
    <div>
      <Typography
        variant="subtitle2"
        style={{ paddingTop: 14, paddingBottom: 14 }}
      >
        Gate out details
      </Typography>
      <Paper
        sx={(theme) => ({
          padding: theme.spacing(1.25, 2.25),
        })}
        elevation={0}
      >
        <Grid container spacing={3}>
          {gateOutEdit.selectedContainer.gate_out_data.gate_pass_no && (
            <Grid item size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
              <Typography variant="subtitle1">Gate Pass number</Typography>
              <CustomTextfield
                id="out-gate-pass-number"
                readOnlyP={true}
                value={gateOutEdit.selectedContainer.gate_out_data.gate_pass_no}
              />
            </Grid>
          )}
          <Grid item size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
            <Typography variant="subtitle1" sx={customLabelTypography}>
              Out Date <span style={{ color: "red" }}>*</span>
            </Typography>

            <DatePickerField
              fullWidth
              isDisableFuture={true}
              dateId="gate-out-date"
              dateValue={outDate}
              dateChange={(date) => setOutDate(date)}
              dispatchType={
                gateOutEdit.selectedContainer.gate_out_data.gate_pass_no
                  ? "EDIT_GATE_OUT_DATE"
                  : "GATE_OUT_DATE"
              }
            />
          </Grid>
          <Grid item size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
            <Typography variant="subtitle1" sx={customLabelTypography}>
              Out Time <span style={{ color: "red" }}>*</span>
            </Typography>
            <CustomTextfield
              id="gate-out-time"
              handleChange={(e) => {
                setOutTime(e.target.value);
              }}
              value={outTime}
              type="time"
              dispatchType={
                gateOutEdit.selectedContainer.gate_out_data.gate_pass_no
                  ? "EDIT_GATE_OUT_TIME"
                  : "GATE_OUT_TIME"
              }
            />
          </Grid>

          <Grid item size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
            <Typography variant="subtitle1" sx={customLabelTypography}>
              condition <span style={{ color: "red" }}>*</span>
            </Typography>
            <CustomTextfield value={condition} readOnlyP={true} />

            {/* <TextField
              id="condition"
              select
              value={condition}
              variant="outlined"
              fullWidth
              size="small"
              onChange={(e) => {
                setCondition(e.target.value);
                dispatch({
                  type: gateOutEdit.selectedContainer.gate_out_data.gate_pass_no
                    ? "EDIT_GATE_CONDITION"
                    : "GATE_OUT_CONDITION",
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
            </TextField> */}
          </Grid>

          <Grid item size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
            <Typography variant="subtitle1" sx={customLabelTypography}>
              Departed <span style={{ color: "red" }}>*</span>
            </Typography>
            {preGateOutFetch?.payment_type === "Advance" ||
            gateOutEdit.selectedContainer.lolo_data?.payment_type ===
              "Advance" ? (
              <CustomTextfield value={departed} readOnlyP={true} />
            ) : (
              <TextField
                id="departed"
                select
                value={departed}
                variant="outlined"
                fullWidth
                size="small"
                onChange={(e) => {
                  setToLocation("");
                  setLocationArray([]);
                  setRoadRailToLocationCode("");
                  gateOutEdit.selectedContainer.gate_out_data.gate_pass_no
                    ? dispatch({
                        type: "EDIT_GATE_OUT_TO_LOCATION_CODE",
                        payload: "",
                      })
                    : dispatch({
                        type: "GATE_OUT_TO_LOCATION",
                        payload: "",
                      });
                  gateOutEdit.selectedContainer.gate_out_data.gate_pass_no
                    ? dispatch({
                        type: EDIT_GATE_OUT_ROAD_RAIL_TO_LOCATION_CODE,
                        payload: "",
                      })
                    : dispatch({
                        type: GATE_OUT_ROAD_RAIL_TO_LOCATION_CODE,
                        payload: "",
                      });
                  setDeparted(e.target.value);
                  dispatch({
                    type: gateOutEdit.selectedContainer.gate_out_data
                      .gate_pass_no
                      ? "EDIT_GATE_OUT_DEPARTED"
                      : "GATE_OUT_DEPARTED",
                    payload: e.target.value,
                  });
                  if (
                    gateOutEdit.selectedContainer.gate_out_data.gate_pass_no
                  ) {
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
            <Grid item size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
              <Typography variant="subtitle1" sx={customLabelTypography}>
                Transporter Name <span style={{ color: "red" }}>*</span>
              </Typography>

              {user?.truck_tracking === "True" ||
              user?.truck_tracking === true ? (
                <Autocomplete
                  value={transporterName}
                  onChange={(e, newValue) => {
                    setTransporterName(newValue);
                  }}
                  style={{ padding: 0 }}
                  sx={{
                    "& .MuiAutocomplete-inputRoot[class*='MuiOutlinedInput-root']":
                      {
                        padding: 0,
                      },
                  }}
                  options={
                    TruckTurnAroundReducer?.getGateOutTransporter?.map(
                      (option) => option,
                    ) || []
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      variant="outlined"
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          "& fieldset": {
                            borderColor: "#243545",
                          },
                        },
                      }}
                      onBlur={(e) => {
                        setTransporterName(e.target.value);
                        dispatch({
                          type: gateOutEdit.selectedContainer.gate_out_data
                            .gate_pass_no
                            ? "EDIT_GATE_OUT_TRANSPORTER_NAME"
                            : "GATE_OUT_TRANSPORTER_NAME",
                          payload: e.target.value,
                        });
                        dispatch(
                          truckTurnAroundGateInVehicleDetailsAction(
                            e.target.value,
                            notify,
                          ),
                        );
                      }}
                      fullWidth
                    />
                  )}
                />
              ) : (
                <Autocomplete
                  value={transporterName}
                  onChange={(e, newValue) => {
                    setTransporterName(newValue);
                  }}
                  style={{ padding: 0 }}
                  sx={{
                    "& .MuiAutocomplete-inputRoot[class*='MuiOutlinedInput-root']":
                      {
                        padding: 0,
                      },
                  }}
                  options={
                    gateIn.allDropDown.transporter.map(
                      (option) => option.name,
                    ) || []
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      variant="outlined"
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          "& fieldset": {
                            borderColor: "#243545",
                          },
                        },
                      }}
                      onBlur={(e) => {
                        setTransporterName(e.target.value);
                        dispatch({
                          type: gateOutEdit.selectedContainer.gate_out_data
                            .gate_pass_no
                            ? "EDIT_GATE_OUT_TRANSPORTER_NAME"
                            : "GATE_OUT_TRANSPORTER_NAME",
                          payload: e.target.value,
                        });
                        dispatch(
                          truckTurnAroundGateInVehicleDetailsAction(
                            e.target.value,
                            notify,
                          ),
                        );
                      }}
                      fullWidth
                    />
                  )}
                />
              )}
            </Grid>
          )}
          <Grid item size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
            <Typography variant="subtitle1" sx={customLabelTypography}>
              Vehicle No. <span style={{ color: "red" }}>*</span>
            </Typography>
            {user.truck_tracking === "True" || user.truck_tracking === true ? (
              <TextField
                id="vehicle_no"
                key={"vehicle_no"}
                value={vehicleNo}
                variant="outlined"
                fullWidth
                select={getTruckGateOutVehicleList}
                size="small"
                onChange={(e) => {
                  setVehicleNo(e.target.value);
                  dispatch({
                    type: gateOutEdit.selectedContainer.gate_out_data
                      .gate_pass_no
                      ? "EDIT_GATE_OUT_VEHICLE_NUMBER"
                      : "GATE_OUT_VEHICLE_NUMBER",
                    payload: e.target.value,
                  });
                }}
              >
                {(getTruckGateOutVehicleList &&
                  getTruckGateOutVehicleList.map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))) || <MenuItem disabled>Loading...</MenuItem>}
              </TextField>
            ) : (
              <Autocomplete
                value={vehicleNo}
                onChange={(e, newValue) => {
                  setVehicleNo(newValue);
                }}
                style={{ padding: 0 }}
                sx={{
                  "& .MuiAutocomplete-inputRoot[class*='MuiOutlinedInput-root']":
                    {
                      padding: 0,
                    },
                }}
                options={
                  getTruckGateOutVehicleList?.map((option) => option) || []
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    variant="outlined"
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        "& fieldset": {
                          borderColor: "#243545",
                        },
                      },
                    }}
                    onBlur={(e) => {
                      setVehicleNo(e.target.value);
                      dispatch({
                        type: gateOutEdit.selectedContainer.gate_out_data
                          .gate_pass_no
                          ? "EDIT_GATE_OUT_VEHICLE_NUMBER"
                          : "GATE_OUT_VEHICLE_NUMBER",
                        payload: e.target.value,
                      });
                    }}
                    fullWidth
                  />
                )}
              />
            )}
          </Grid>

          <Grid item size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
            <Typography variant="subtitle1" sx={customLabelTypography}>
              Driver Name <span style={{ color: "red" }}>*</span>
            </Typography>
            <CustomTextfield
              id="gate-out-driver-name"
              handleChange={(e) => setDriverName(e.target.value)}
              value={driverName}
              dispatchType={
                gateOutEdit.selectedContainer.gate_out_data.gate_pass_no
                  ? "EDIT_GATE_OUT_DRIVER_NAME"
                  : "GATE_OUT_DRIVER_NAME"
              }
            />
          </Grid>
          <Grid item size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
            <Typography variant="subtitle1" sx={customLabelTypography}>
              Driver Licence Number <span style={{ color: "red" }}>*</span>
            </Typography>
            <CustomTextfield
              id="gate-out-driver-license"
              handleChange={(e) => setDriverLicense(e.target.value)}
              value={driverLicense}
              dispatchType={
                gateOutEdit.selectedContainer.gate_out_data.gate_pass_no
                  ? "EDIT_GATE_OUT_DRIVER_LICENSE_NUMBER"
                  : "GATE_OUT_DRIVER_LICENSE"
              }
            />
          </Grid>
          {gateOutEdit.selectedContainer.gate_out_data &&
            gateOutEdit.selectedContainer.gate_out_data.image_link && (
              <Grid
                item
                size={{ sm: 12 }}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-start",
                  justifyContent: "flex-start",
                }}
              >
                <img
                  src={`${
                    gateOutEdit.selectedContainer.gate_out_data?.image_link
                  }?${new Date()}`}
                  style={{
                    height: "232px",
                    width: "232px",
                    objectFit: "cover",
                    borderRadius: "10px",
                    margin: "10px",
                  }}
                  alt={gateOutEdit.selectedContainer.gate_out_data?.image_link}
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
                      gateOutEdit.selectedContainer.gate_out_data?.image_link;
                    link.click();
                  }}
                >
                  Download Driver Licence Image
                </Button>
              </Grid>
            )}

          <Grid item size={{ sm: 12 }}>
            <Typography variant="subtitle1" sx={customLabelTypography}>
              Upload Driver License Image
            </Typography>
          </Grid>
          <Grid
            item
            size={{ sm: 10 }}
            sx={(theme) => ({
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              boxShadow: "0px 0px 2px  gray",
              borderRadius: "8px",
              [theme.breakpoints.down("sm")]: {
                flexDirection: "column",
                gap: 2,
              },
            })}
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
                onClick={handleMobileClick}
              >
                Camera Upload
              </Button>
            </Stack>
            {(gateOutEdit.selectedContainer.gate_out_data?.image_url?.length >
              0 ||
              gateOutDetails.image_url?.length > 0) && (
              <img
                src={
                  gateOutEdit.selectedContainer.gate_out_data?.image_url
                    ? gateOutEdit.selectedContainer.gate_out_data?.image_url
                    : gateOutDetails.image_url
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
          <Grid item size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
            <Typography variant="subtitle1" sx={customLabelTypography}>
              Surveyed By
            </Typography>
            <CustomTextfield
              id="gate-out-surveyed-by"
              handleChange={(e) => setGateOutSurveyedBy(e.target.value)}
              value={gateOutSurveyedBy}
              dispatchType={
                gateOutEdit.selectedContainer.goh_pk
                  ? "EDIT_GATE_OUT_SURVEYED_BY"
                  : "GATE_OUT_SURVEYED_BY"
              }
            />
          </Grid>

          <Grid
            item
            size={{ xs: 12 }}
            style={{
              display: "flex",
              alignItems: "center",
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
              control={<Radio checked={more} onClick={() => setMore(true)} />}
              label="Show"
            />
            <FormControlLabel
              value="hide"
              control={<Radio checked={!more} onClick={handleMoreHide} />}
              label="Hide"
            />
          </Grid>

          {more && (
            <>
              <Grid item size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                <Typography variant="subtitle1" sx={customLabelTypography}>
                  Grade
                </Typography>

                <TextField
                  id="gate-out-grade"
                  select
                  value={grade}
                  variant="outlined"
                  fullWidth
                  size="small"
                  onChange={(e) => {
                    setGrade(e.target.value);
                    dispatch({
                      type: gateOutEdit.selectedContainer.gate_out_data
                        .gate_pass_no
                        ? "EDIT_GATE_OUT_GRADE"
                        : "GATE_OUT_GRADE",
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

              <Grid item size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                <Typography variant="subtitle1" sx={customLabelTypography}>
                  Destination
                </Typography>
                <CustomTextfield
                  id="gate-out-destination"
                  handleChange={(e) => setDestination(e.target.value)}
                  value={destination}
                  dispatchType={
                    gateOutEdit.selectedContainer.gate_out_data.gate_pass_no
                      ? "EDIT_GATE_OUT_DESTINATION"
                      : "GATE_OUT_DESTINATION"
                  }
                />
              </Grid>
              <Grid item size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                <Typography variant="subtitle1" sx={customLabelTypography}>
                  Consignee
                </Typography>
                <CustomTextfield
                  id="gate-out-consignee"
                  handleChange={(e) => setConsignee(e.target.value)}
                  value={consignee}
                  readOnlyP={
                    preGateOutFetch?.payment_type === "Advance" ||
                    gateOutEdit.selectedContainer.lolo_data?.payment_type ===
                      "Advance"
                  }
                  dispatchType={
                    gateOutEdit.selectedContainer.gate_out_data.gate_pass_no
                      ? "EDIT_GATE_OUT_CONSIGNOR"
                      : "GATE_OUT_CONSIGNEE"
                  }
                />
              </Grid>

              <Grid item size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                <Typography variant="subtitle1" sx={customLabelTypography}>
                  Shipper
                </Typography>
                <CustomTextfield
                  id="gate-out-Shipper"
                  handleChange={(e) => setShipper(e.target.value)}
                  value={shipper}
                  readOnlyP={
                    preGateOutFetch?.payment_type === "Advance" ||
                    gateOutEdit.selectedContainer.lolo_data?.payment_type ===
                      "Advance"
                  }
                  dispatchType={
                    gateOutEdit.selectedContainer.gate_out_data.gate_pass_no
                      ? "EDIT_GATE_OUT_SHIPPER"
                      : "GATE_OUT_SHIPPER"
                  }
                />
              </Grid>

              <Grid item size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                <Typography variant="subtitle1" sx={customLabelTypography}>
                  Delivery
                </Typography>
                <CustomTextfield
                  id="gate-out-delivery"
                  handleChange={(e) => setDelivery(e.target.value)}
                  value={delivery}
                  dispatchType={
                    gateOutEdit.selectedContainer.gate_out_data.gate_pass_no
                      ? "EDIT_GATE_OUT_DELIVERY"
                      : "GATE_OUT_DELIVERY"
                  }
                />
              </Grid>
              <Grid item size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                <Typography variant="subtitle1" sx={customLabelTypography}>
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
                        ?.length;
                      i++
                    ) {
                      if (
                        locationCodeDetailMaster.allLocationCodeDetailListing[i]
                          .name_code === newValue
                      ) {
                        setToLocation(
                          locationCodeDetailMaster.allLocationCodeDetailListing[
                            i
                          ].code,
                        );
                        gateOutEdit.selectedContainer.gate_out_data.gate_pass_no
                          ? dispatch({
                              type: "EDIT_GATE_OUT_TO_LOCATION_CODE",
                              payload:
                                locationCodeDetailMaster
                                  .allLocationCodeDetailListing[i].code,
                            })
                          : dispatch({
                              type: "GATE_OUT_TO_LOCATION",
                              payload:
                                locationCodeDetailMaster
                                  .allLocationCodeDetailListing[i].code,
                            });
                      }
                    }
                  }}
                  style={{ padding: 0 }}
                  sx={{
                    "& .MuiAutocomplete-inputRoot[class*='MuiOutlinedInput-root']":
                      {
                        padding: 0,
                      },
                  }}
                  options={
                    (locationCodeDetailMaster.allLocationCodeDetailListing &&
                      locationCodeDetailMaster.allLocationCodeDetailListing.map(
                        (option) => option.name_code,
                      )) ||
                    []
                  }
                  disabled={
                    gateOutEdit.selectedContainer.container_data.shipping_line
                      ? departed === "Factory" ||
                        departed === "Road/Rail" ||
                        departed === "FS RETURN" ||
                        departed === ""
                      : gateOutDetails.departed === "Factory" ||
                        gateOutDetails.departed === "Road/Rail" ||
                        gateOutDetails.departed === "FS RETURN" ||
                        gateOutDetails.departed === ""
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      variant="outlined"
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          "& fieldset": {
                            borderColor: "#243545",
                          },
                        },
                      }}
                      fullWidth
                    />
                  )}
                />
              </Grid>
              <Grid item size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                <Typography variant="subtitle1" sx={customLabelTypography}>
                  To Location Code
                </Typography>
                <CustomTextfield
                  id="gate-out-to-location-code"
                  handleChange={(e) => setToLocation(e.target.value)}
                  value={toLocation}
                  readOnlyP={true}
                  dispatchType={
                    gateOutEdit.selectedContainer.gate_out_data.gate_pass_no
                      ? "EDIT_GATE_OUT_TO_LOCATION_CODE"
                      : "GATE_OUT_TO_LOCATION"
                  }
                />
              </Grid>
              <Grid item size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                <Typography variant="subtitle1" sx={customLabelTypography}>
                  Road Rail to Location Code
                </Typography>
                <CustomTextfield
                  id="gate-out-road-rail-to-location"
                  handleChange={(e) =>
                    setRoadRailToLocationCode(e.target.value)
                  }
                  value={roadRailToLocationCode}
                  dispatchType={
                    gateOutEdit.selectedContainer.gate_out_data.gate_pass_no
                      ? EDIT_GATE_OUT_ROAD_RAIL_TO_LOCATION_CODE
                      : GATE_OUT_ROAD_RAIL_TO_LOCATION_CODE
                  }
                  readOnlyP={
                    gateOutDetails.departed !== "Road/Rail" &&
                    gateOutEdit.selectedContainer.gate_out_data.departed !==
                      "Road/Rail"
                  }
                />
              </Grid>
              <Grid item size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                <Typography variant="subtitle1" sx={customLabelTypography}>
                  To Depot Code
                </Typography>
                <CustomTextfield
                  id="gate-out-to-port-code"
                  handleChange={(e) => setToDepotCode(e.target.value)}
                  value={toDepotCode}
                  dispatchType={
                    gateOutEdit.selectedContainer.gate_out_data.gate_pass_no
                      ? EDIT_GATE_OUT_TO_DEPOT_CODE
                      : GATE_OUT_TO_DEPOT_CODE
                  }
                />
              </Grid>
              <Grid item size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                <Typography variant="subtitle1" sx={customLabelTypography}>
                  To Port Code
                </Typography>
                <CustomTextfield
                  id="gate-out-to-port-code"
                  handleChange={(e) => setToPort(e.target.value)}
                  value={toPort}
                  dispatchType={
                    gateOutEdit.selectedContainer.gate_out_data.gate_pass_no
                      ? "EDIT_TO_PORT_CODE"
                      : "GATE_OUT_TO_PORT"
                  }
                />
              </Grid>
              <Grid item size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                <Typography variant="subtitle1" sx={customLabelTypography}>
                  Carrier Code
                </Typography>
                <Autocomplete
                  value={carrierCode}
                  onChange={(event, newValue) => {
                    setCarrierCode(newValue);
                  }}
                  style={{ padding: 0 }}
                  sx={{
                    "& .MuiAutocomplete-inputRoot[class*='MuiOutlinedInput-root']":
                      {
                        padding: 0,
                      },
                  }}
                  options={
                    (gateIn.allDropDown &&
                      gateIn.allDropDown.carrier_code &&
                      gateIn.allDropDown.carrier_code.map(
                        (option) => option.name,
                      )) ||
                    []
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      variant="outlined"
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          "& fieldset": {
                            borderColor: "#243545",
                          },
                        },
                      }}
                      onBlur={(e) => {
                        setCarrierCode(e.target.value);
                        dispatch({
                          type: gateOutEdit.selectedContainer.gate_out_data
                            .gate_pass_no
                            ? "EDIT_GATE_OUT_CARRIER_CODE"
                            : "GATE_OUT_CARRIER_CODE",
                          payload: e.target.value,
                        });
                      }}
                      fullWidth
                    />
                  )}
                />
              </Grid>
              <Grid item size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                <Typography variant="subtitle1" sx={customLabelTypography}>
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
                        ?.length;
                      i++
                    ) {
                      if (
                        vesselVoyageDetailMaster.allVesselVoyageDetailListing[i]
                          .vessel_voyage_name === newValue
                      ) {
                        setVesselName(
                          vesselVoyageDetailMaster.allVesselVoyageDetailListing[
                            i
                          ].vessel_name,
                        );
                        gateOutEdit.selectedContainer.gate_out_data.gate_pass_no
                          ? dispatch({
                              type: "EDIT_GATE_OUT_VESSEL_NAME",
                              payload:
                                vesselVoyageDetailMaster
                                  .allVesselVoyageDetailListing[i].vessel_name,
                            })
                          : dispatch({
                              type: "GATE_OUT_VESSEL_NAME",
                              payload:
                                vesselVoyageDetailMaster
                                  .allVesselVoyageDetailListing[i].vessel_name,
                            });
                        setVoyageNumber(
                          vesselVoyageDetailMaster.allVesselVoyageDetailListing[
                            i
                          ].voyage_no,
                        );
                        gateOutEdit.selectedContainer.gate_out_data.gate_pass_no
                          ? dispatch({
                              type: "EDIT_GATE_OUT_VOYAGE_NUMBER",
                              payload:
                                vesselVoyageDetailMaster
                                  .allVesselVoyageDetailListing[i].voyage_no,
                            })
                          : dispatch({
                              type: "GATE_OUT_VOYAGE_NUMBER",
                              payload:
                                vesselVoyageDetailMaster
                                  .allVesselVoyageDetailListing[i].voyage_no,
                            });
                        setRoRef(
                          vesselVoyageDetailMaster.allVesselVoyageDetailListing[
                            i
                          ].booking_no,
                        );
                        gateOutEdit.selectedContainer.gate_out_data.gate_pass_no
                          ? dispatch({
                              type: "EDIT_GATE_OUT_RO_REF",
                              payload:
                                vesselVoyageDetailMaster
                                  .allVesselVoyageDetailListing[i].booking_no,
                            })
                          : dispatch({
                              type: "GATE_OUT_RO_REF",
                              payload:
                                vesselVoyageDetailMaster
                                  .allVesselVoyageDetailListing[i].booking_no,
                            });
                      }
                    }
                  }}
                  style={{ padding: 0 }}
                  sx={{
                    "& .MuiAutocomplete-inputRoot[class*='MuiOutlinedInput-root']":
                      {
                        padding: 0,
                      },
                  }}
                  options={
                    (vesselVoyageDetailMaster.allVesselVoyageDetailListing &&
                      vesselVoyageDetailMaster.allVesselVoyageDetailListing.map(
                        (option) => option.vessel_voyage_name,
                      )) ||
                    []
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      variant="outlined"
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          "& fieldset": {
                            borderColor: "#243545",
                          },
                        },
                      }}
                      fullWidth
                    />
                  )}
                />
              </Grid>
              <Grid item size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                <Typography variant="subtitle1" sx={customLabelTypography}>
                  Vessel name
                </Typography>
                <CustomTextfield
                  id="gate-out-vessel-name"
                  handleChange={(e) => setVesselName(e.target.value)}
                  value={vesselName}
                  dispatchType={
                    gateOutEdit.selectedContainer.gate_out_data.gate_pass_no
                      ? "EDIT_GATE_OUT_VESSEL_NAME"
                      : "GATE_OUT_VESSEL_NAME"
                  }
                  readOnlyP={true}
                />
              </Grid>
              <Grid item size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                <Typography variant="subtitle1" sx={customLabelTypography}>
                  Voyage Number
                </Typography>
                <CustomTextfield
                  id="gate-out-voyage-number"
                  handleChange={(e) => setVoyageNumber(e.target.value)}
                  value={voyageNumber}
                  dispatchType={
                    gateOutEdit.selectedContainer.gate_out_data.gate_pass_no
                      ? "EDIT_GATE_OUT_VOYAGE_NUMBER"
                      : "GATE_OUT_VOYAGE_NUMBER"
                  }
                  readOnlyP={true}
                />
              </Grid>
              <Grid item size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                <Typography variant="subtitle1" sx={customLabelTypography}>
                  RO Ref/Vessel Bkg No.
                </Typography>
                <CustomTextfield
                  id="gate-out-Ro-ref"
                  handleChange={(e) => setRoRef(e.target.value)}
                  value={roRef}
                  dispatchType={
                    gateOutEdit.selectedContainer.gate_out_data.gate_pass_no
                      ? "EDIT_GATE_OUT_RO_REF"
                      : "GATE_OUT_RO_REF"
                  }
                  readOnlyP={true}
                />
              </Grid>
              <Grid item size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                <Typography variant="subtitle1" sx={customLabelTypography}>
                  Export Cargo
                </Typography>
                <CustomTextfield
                  id="gate-out-export-cargo"
                  handleChange={(e) => setExportCargo(e.target.value)}
                  value={exportCargo}
                  readOnlyP={
                    preGateOutFetch?.payment_type === "Advance" ||
                    gateOutEdit.selectedContainer.lolo_data?.payment_type ===
                      "Advance"
                  }
                  dispatchType={
                    gateOutEdit.selectedContainer.gate_out_data.gate_pass_no
                      ? "EDIT_GATE_OUT_EXPORT_CARGO"
                      : "GATE_OUT_EXPORT_CARGO"
                  }
                />
              </Grid>

              <Grid item size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                <Typography variant="subtitle1" sx={customLabelTypography}>
                  Driver Mobile
                </Typography>
                <CustomTextfield
                  id="gate-out-driver-mobile"
                  handleChange={(e) => setDriverMobile(e.target.value)}
                  value={driverMobile}
                  dispatchType={
                    gateOutEdit.selectedContainer.gate_out_data.gate_pass_no
                      ? "EDIT_GATE_OUT_DRIVER_MOBILE"
                      : "GATE_OUT_DRIVER_MOBILE"
                  }
                />
              </Grid>

              <Grid item size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                <Typography variant="subtitle1" sx={customLabelTypography}>
                  Location
                </Typography>
                <TextField
                  id="gate-out-location"
                  select
                  value={location}
                  variant="outlined"
                  fullWidth
                  size="small"
                  onChange={(e) => {
                    setLocation(e.target.value);
                    dispatch({
                      type: gateOutEdit.selectedContainer.gate_out_data
                        .gate_pass_no
                        ? "EDIT_GATE_OUT_LOCATION"
                        : "GATE_OUT_LOCATION",
                      payload: e.target.value,
                    });
                  }}
                >
                  {gateIn.allDropDown &&
                    gateIn.allDropDown.location &&
                    gateIn.allDropDown.location.map((option) => (
                      <MenuItem key={option} value={option}>
                        {option}
                      </MenuItem>
                    ))}
                </TextField>
              </Grid>
              <Grid item size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                <Typography variant="subtitle1" sx={customLabelTypography}>
                  Port Of Loading
                </Typography>
                <CustomTextfield
                  id="gate-out-port-of-loading"
                  handleChange={(e) => setPortOfLoading(e.target.value)}
                  value={portOfLoading}
                  dispatchType={
                    gateOutEdit.selectedContainer.gate_out_data.gate_pass_no
                      ? "EDIT_GATE_OUT_PORT_OF_LOADING"
                      : "GATE_OUT_PORT_OF_LOADING"
                  }
                />
              </Grid>
              <Grid item size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                <Typography variant="subtitle1" sx={customLabelTypography}>
                  Port Of Discharge
                </Typography>
                <CustomTextfield
                  id="gate-out-port-of-discharge"
                  handleChange={(e) => setPortOfDischarge(e.target.value)}
                  value={portOfDischarge}
                  dispatchType={
                    gateOutEdit.selectedContainer.gate_out_data.gate_pass_no
                      ? "EDIT_GATE_OUT_PORT_OF_DISCHARGE"
                      : "GATE_OUT_PORT_OF_DISCHARGE"
                  }
                />
              </Grid>
              <Grid item size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                <Typography variant="subtitle1" sx={customLabelTypography}>
                  Booking number
                </Typography>
                <CustomTextfield
                  id="gate-out-booking-number"
                  handleChange={(e) => setBookingNumber(e.target.value)}
                  value={bookingNumber}
                  dispatchType="GATE_OUT_BOOKING_NUMBER"
                  readOnlyP={true}
                />
              </Grid>
              <Grid item size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                <Typography variant="subtitle1" sx={customLabelTypography}>
                  Booking date
                </Typography>
                <CustomTextfield
                  id="gate-out-booking-date"
                  value={bookingDate}
                  type="text"
                  readOnlyP={true}
                />
              </Grid>
              <Grid item size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                <Typography variant="subtitle1" sx={customLabelTypography}>
                  Booking party
                </Typography>
                <CustomTextfield
                  id="gate-out-booking-party"
                  handleChange={(e) => setBookingParty(e.target.value)}
                  value={bookingParty}
                  dispatchType="GATE_OUT_BOOKING_PARTY"
                  readOnlyP={true}
                />
              </Grid>

              <Grid item size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                <Typography variant="subtitle1" sx={customLabelTypography}>
                  Seal Number
                </Typography>
                <CustomTextfield
                  id="gate-out-seal-number"
                  handleChange={(e) => setSealNumber(e.target.value)}
                  value={sealNumber}
                  dispatchType={
                    gateOutEdit.selectedContainer.gate_out_data.gate_pass_no
                      ? "EDIT_GATE_OUT_SEAL_NUMBER"
                      : "GATE_OUT_SEAL_NUMBER"
                  }
                  readOnlyP={true}
                />
              </Grid>

              <Grid item size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                <Typography variant="subtitle1" sx={customLabelTypography}>
                  Select Seal Number
                </Typography>
                {bookingNumber === "" || bookingNumber === null ? (
                  <CustomTextfield
                    value={selectSealNumberList}
                    readOnlyP={true}
                  />
                ) : (
                  <Autocomplete
                    value={selectSealNumberList}
                    onChange={(event, newValue) => {
                      setSealNumber(newValue);
                      gateOutEdit.selectedContainer.gate_out_data.gate_pass_no
                        ? dispatch({
                            type: "EDIT_GATE_OUT_SEAL_NUMBER",
                            payload: newValue,
                          })
                        : dispatch({
                            type: "GATE_OUT_SEAL_NUMBER",
                            payload: newValue,
                          });
                    }}
                    style={{ padding: 0 }}
                    sx={{
                      "& .MuiAutocomplete-inputRoot[class*='MuiOutlinedInput-root']":
                        {
                          padding: 0,
                        },
                    }}
                    options={
                      (gateOutDetails &&
                        gateOutDetails.seal_number_listing?.map(
                          (option) => option,
                        )) ||
                      []
                    }
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        variant="outlined"
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            "& fieldset": {
                              borderColor: "#243545",
                            },
                          },
                        }}
                        onBlur={(e) => {
                          setSelectSealNumberList(e.target.value);
                        }}
                        dispatchType={
                          gateOutDetails.seal_number_listing
                            ? "EDIT_GATE_OUT_SEAL_NUMBER"
                            : "GATE_OUT_SEAL_NUMBER"
                        }
                        fullWidth
                      />
                    )}
                  />
                )}
              </Grid>

              <Grid item size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                <Typography variant="subtitle1" sx={customLabelTypography}>
                  Remarks
                </Typography>
                <CustomTextfield
                  id="gate-out-remarks"
                  handleChange={(e) => setRemarks(e.target.value)}
                  value={remarks}
                  isRemark={true}
                  readOnlyP={
                    preGateOutFetch?.payment_type === "Advance" ||
                    gateOutEdit.selectedContainer.lolo_data?.payment_type ===
                      "Advance"
                  }
                  dispatchType={
                    gateOutEdit.selectedContainer.gate_out_data.gate_pass_no
                      ? "EDIT_GATE_OUT_REMARK"
                      : "GATE_OUT_REMARKS"
                  }
                />
              </Grid>
            </>
          )}
        </Grid>
      </Paper>
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
    </div>
  );
};

export default GateOutDetails;
