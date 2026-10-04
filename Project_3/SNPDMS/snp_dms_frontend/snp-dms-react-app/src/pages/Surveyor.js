import React, { useCallback, useEffect, useRef, useState } from "react";
import { Autocomplete } from "@mui/material";
import LayoutContainer from "../components/reusableComponents/LayoutContainer";
import {
  Box,
  Button,
  Card,
  CardActionArea,
  CardMedia,
  Divider,
  Grid,
  IconButton,
  InputBase,
  MenuItem,
  Modal,
  Paper,
  Select,
  TextField,
  Typography,
  makeStyles,
  useMediaQuery,
} from "@material-ui/core";
import { theme } from "../App";
import PropTypes from "prop-types";
import { useDispatch, useSelector } from "react-redux";
import { SERVEY_REDUCER } from "../reducers/ServeyorReducer";
import DateFnsUtils from "@date-io/date-fns";
import {
  KeyboardDatePicker,
  MuiPickersUtilsProvider,
} from "@material-ui/pickers";
import AddBoxIcon from "@material-ui/icons/AddBox";
import DeleteForeverIcon from "@material-ui/icons/DeleteForever";
import { useSnackbar } from "notistack";
import {
  ContainerPreGateInGetSurveyorAction,
  getContainerListAction,
  getServeyContainerValidation,
  getTariffServeyAction,
  getTariffServeyInformAction,
  searchContainerAction,
  uploadServeyAction,
  uploadSurveyImageAction,
} from "../actions/ServeyorActions";
import Camera, { FACING_MODES, IMAGE_TYPES } from "react-html5-camera-photo";
import "react-html5-camera-photo/build/css/index.css";
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import { Stack } from "@mui/material";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import HighlightOffIcon from "@mui/icons-material/HighlightOff";
import UploadIcon from "@mui/icons-material/Upload";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import CircularProgress from "@mui/material/CircularProgress";
import { useHistory } from "react-router-dom";
import {
  dropDownDispatch,
  dropDownPreGateInDispatch,
} from "../actions/GateInActions";
import { USER_INFO } from "../reducers/UserReducer";
import GateInTextField from "../components/reusableComponents/GateInTextField";

const floorData = [
  "Roof Side Location",
  "Interior Location",
  "Under Structure",
  "Exterior Location",
  "Right Side Location",
  "Floor",
  "Left side Location",
  "Interior & Exterior Side Location",
  "Door",
  "Front Side Location",
];

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

const useStyle = makeStyles((theme) => ({
  paperContainer: {
    padding: theme.spacing(2, 3),
  },
  autocomplete: {
    "& .MuiAutocomplete-inputRoot[class*='MuiOutlinedInput-root']": {
      padding: 0,
    },
  },
  mobileClose: {
    position: "absolute",
    right: "5%",
    top: "10%",
    fontSize: "15px",
    zIndex: 100,
  },
  mobileSave: {
    position: "absolute",
    right: "18%",
    top: "10%",
    fontSize: "15px",
    zIndex: 100,
    width: "200px",
  },
  mobileAddRemove: {
    position: "absolute",
    left: "10px",
    margin: "auto",
    bottom: "30px",
    display: "flex",
    zIndex: 100,
    "&::-webkit-scrollbar": {
      height: 1,
      width: "none",
    },
  },
  textField: {
    "& .MuiOutlinedInput-root": {
      "& fieldset": {
        borderColor: "#243545",
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
  searchPaper: {
    padding: "1px 4px",
    display: "flex",
    alignItems: "center",
    height: 50,
    backgroundColor: "#DFE6EC",
    borderRadius: "0.5rem",
    [theme.breakpoints.down("xs")]: {
      // padding: "1px 4px",
      height: 35,
    },
  },
  input: {
    marginLeft: theme.spacing(1),
    flex: 1,
    padding: 7,

    [theme.breakpoints.down("xs")]: {
      padding: 1,
      fontSize: "0.8rem",
    },
  },
  iconButton: {
    padding: 6,
  },
  searchButton: {
    backgroundColor: "#FDBD2E",
    color: "#fff",
    borderRadius: "0.5rem",
    padding: "1px 4px",
    height: 40,
    width: "200px",
    "&:hover": {
      backgroundColor: "#FDBD2E",
      color: "#fff",
    },
    [theme.breakpoints.down("xs")]: {
      // padding: "1px 4px",
      paddingRight: 3,
      height: 35,
    },
  },
  default_tabStyle: {
    margin: 5,
    color: "#000",
    fontSize: 13,
    fontWeight: 600,
    [theme.breakpoints.down("sm")]: {
      // width: "100%",
      margin: 2,
      fontSize: 9,
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
      // width: "100%",
      margin: 2,
      fontSize: 9,
    },
  },
  flex: {
    display: "flex",
    flexDirection: "row",
  },
  backdrop: {
    zIndex: theme.zIndex.drawer + 1,
    color: "#fff",
  },

  boxPadding: {
    paddingTop: 24,
    paddingBottom: 24,
    // paddingLeft: 24,
    [theme.breakpoints.down("sm")]: {
      paddingLeft: 0,
    },
  },
  autocompleteTwo: {
    width: "170px",
    marginRight: "8px",
    "& .MuiAutocomplete-inputRoot[class*='MuiOutlinedInput-root']": {
      padding: 0,
      paddingTop: "-32px",
    },
  },
  textFieldTwo: {
    backgroundColor: "white",
    "& .MuiFormLabel-root": {
      color: "rgb(150,161,170)",
      fontSize: "14px",
      marginTop: "-10px",
    },
    "& .MuiOutlinedInput-root": {
      "& fieldset": {
        borderColor: "rgb(150,161,170)",
      },
    },
  },
}));

function TabPanel(props) {
  const { children, value, index, ...other } = props;
  const useStyle = makeStyles((theme) => ({
    boxPadding: {
      paddingTop: 24,
      paddingBottom: 24,
      // paddingLeft: 24,
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
      {/* {value === index && children} */}
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

const Surveyor = () => {
  const user = useSelector((state) => state.user);
  const matchesIpad = useMediaQuery("(max-width:1050px)");
  const dispatch = useDispatch();
  const notify = useSnackbar().enqueueSnackbar;
  const { gateIn } = useSelector((state) => state);

  useEffect(() => {
    let reqArray = [
      "location_site_type_dashboard_list",
    ];
    dispatch(dropDownDispatch(reqArray, notify));
    dispatch(
      dropDownPreGateInDispatch([
        "lf_advance_payment_client_list",
        "lf_pregatein_list",
        notify,
      ])
    );
  }, [user.site]);

  useEffect(() => {
    if (
      gateIn.allDropDown?.location_site_type_dashboard_list?.[
        user.location
      ]?.some((val, index) => {
        if (val.site === user.site && val.lolo_finance === true) {
          return true;
        } else {
          return false;
        }
      })
    ) {
      dispatch({
        type: USER_INFO.LOLO_FINANCE_MODULE,
        payload: true,
      });
      localStorage.setItem("lolo_finance", true);
    } else {
      dispatch({
        type: USER_INFO.LOLO_FINANCE_MODULE,
        payload: false,
      });
      localStorage.setItem("lolo_finance", false);
    }
  }, [gateIn.allDropDown?.location_site_type_dashboard_list]);

  return (
    <LayoutContainer footer={false}>
      <div
        style={{
          padding: "0 20px",
          paddingBottom: "100px",
          backgroundColor: "#eaf0f5",
        }}
      >
        <Grid
          container
          spacing={4}
          justifyContent="space-between"
          alignItems="center"
          style={{
            marginTop: matchesIpad ? "2px" : "-20px",
            marginBottom: "15px",
          }}
        >
          <Grid item lg={1} sm={2}>
            <Typography variant="h4" style={{ fontWeight: "bold" }}>
              Survey
            </Typography>
          </Grid>
          <Grid
            item
            lg={4}
            sm={6}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-around",
            }}
          >
            <Typography variant="subtitle1" style={{ fontWeight: "600" }}>
              Location
            </Typography>
            <Paper elevation={1} style={{ padding: "5px 20px" }}>
              <Typography variant="subtitle2" align="center" color="grey">
                {user.location}{" "}
              </Typography>
            </Paper>
            <Typography variant="subtitle1" style={{ fontWeight: "600" }}>
              Site
            </Typography>
            <Paper elevation={1} style={{ padding: "5px 20px" }}>
              <Typography variant="subtitle2" align="center" color="grey">
                {user.site}{" "}
              </Typography>
            </Paper>
          </Grid>
        </Grid>

        <ServeyorServey />
      </div>
    </LayoutContainer>
  );
};

export default Surveyor;

const ServeyorServey = () => {
  const classes = useStyle();
  const notify = useSnackbar().enqueueSnackbar;
  const [searchContainer, setSearchContainer] = useState("");
  const { ServeyorReducer, user, AdvanceFinanceReducer, gateIn } = useSelector(
    (state) => state
  );
  const dispatch = useDispatch();
  const [tariff_error, setTariffError] = useState(false);
  const [openMobile, setOpenMobile] = useState(false);
  const [mobileUpload, setMobileUpload] = useState([]);
  const [container_error, setContainerError] = useState(false);
  const matchesIpad = useMediaQuery("(max-width:1050px)");
  const [picture, setPicture] = useState([]);
  const fileRef = useRef();
  const [imgData, setImgData] = useState([]);
  const fileObj = [];
  const fileArray = [];
  const [imageUploading, setIsImageUploading] = useState(false);
  const [file, setFile] = useState([]);
  const imageRef = useRef();
  const history = useHistory();
  const [surveySearch, setSurveySearch] = useState(false);
  const handleCloseMobile = () => setOpenMobile((prev) => !prev);
  const handleMobileClick = () => setOpenMobile(true);
  const [open, setOpen] = React.useState(false);
  const [isPreGateIn,setIsPreGateIn] = useState(false)

  const handleOpen = () => {
    setOpen(true);
  };
  const MenuProps = {
    PaperProps: {
      style: {
        maxHeight: "300px",
        marginTop: 50,
      },
    },
  };

  useEffect(() => {
    dispatch(getTariffServeyInformAction(notify));
    handleContainersList();
  }, []);

  useEffect(() => {
    if (ServeyorReducer?.data?.pk) {
      let client_name = ServeyorReducer.inform?.staff_data.find(
        (val, index) => val.pk === ServeyorReducer.data?.survey_by
      );
      dispatch({
        type: SERVEY_REDUCER.DATA_CHANGE,
        payload: {
          survey_name: client_name?.name,
        },
      });
    }
  }, [ServeyorReducer?.data?.pk]);

  const onChangeSearchContainer = (e) => {
    const { name, value } = e.target;
    if (user.lolo_finance) {
      return;
    }
    setSearchContainer(value);
  };

  const uploadMultipleFiles = (e) => {
    fileObj.push(e.target.files);
    // let fileDataUrl = URL.createObjectURL(e.target.files[0]);
    for (let i = 0; i < fileObj[0].length; i++) {
      fileArray.push(fileObj[0][i]);
    }
    setFile(fileArray);
  };

  const onChangeData = (e, date) => {
    if (date) {
      var selectedDate = new Date(e);
      var dd = String(selectedDate.getDate()).padStart(2, "0");
      var mm = String(selectedDate.getMonth() + 1).padStart(2, "0"); //
      var yyyy = selectedDate.getFullYear();
      var selectedDateFormat = yyyy + "-" + mm + "-" + dd;
      dispatch({
        type: SERVEY_REDUCER.DATA_CHANGE,
        payload: {
          [date]: selectedDateFormat,
        },
      });
    } else {
      const { name, value } = e.target;
      if (name === "container_no") {
        dispatch({
          type: SERVEY_REDUCER.DATA_CHANGE,
          payload: {
            [`${name}`]: value.toUpperCase(),
          },
        });
      } else {
        dispatch({
          type: SERVEY_REDUCER.DATA_CHANGE,
          payload: {
            [`${name}`]: value,
          },
        });
      }
    }
  };

  const onChangeTariff = (e) => {
    const { name, value } = e.target;
    dispatch({
      type: SERVEY_REDUCER.TARIFF_CHANGE,
      payload: {
        [`${name}`]: value,
      },
    });
  };

  const onChangePicture = (e) => {
    uploadMultipleFiles(e);
    setPicture(e.target.files[0]);
    const reader = new FileReader();
    reader.addEventListener("load", () => {
      setImgData(reader.result);
    });
    reader.readAsDataURL(e.target.files[0]);
  };

  const onClickAdd = () => {
    if (
      ServeyorReducer.tariff.main_component === "" ||
      ServeyorReducer.tariff.component_description === "" ||
      ServeyorReducer.tariff.location_description === "" ||
      ServeyorReducer.tariff.specific_location_description === "" ||
      ServeyorReducer.tariff.damage_description === "" ||
      ServeyorReducer.tariff.material_description === "" ||
      ServeyorReducer.tariff.repair_description === "" ||
      ServeyorReducer.tariff.unit === "" ||
      ServeyorReducer.tariff.measurement === "" ||
      ServeyorReducer.tariff.length_and_width === "" ||
      ServeyorReducer.tariff.quantity === "" ||
      ServeyorReducer.tariff.remarks === ""
    ) {
      setTariffError(true);
      notify("Please fill all the required fields", { variant: "warning" });
    } else {
      setTariffError(false);
      dispatch({
        type: SERVEY_REDUCER.ADD_SERVEY_LINE,
        payload: ServeyorReducer.tariff,
      });
      dispatch({
        type: SERVEY_REDUCER.TARIFF_CHANGE,
        payload: {
          main_component: "",
          component_code: "",
          component_description: "",
          location_code: "",
          location_description: "",
          specific_location_code: "",
          specific_location_description: "",
          damage_code: "",
          damage_description: "",
          material_code: "",
          material_description: "",
          repair_code: "",
          repair_description: "",
          unit: "",
          measurement: "",
          length_and_width: "",
          quantity: "",
          remarks: "",
          tariff_code: "",
        },
      });
    }
  };

  function handleTakePhoto(dataUri) {
    if (mobileUpload.length >= 10) {
      notify("Upload Limit Extended ", { variant: "error" });
    }
    setMobileUpload((prev) => [...prev, dataUri]);
    // setOpenMobile(false);
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

  const handleValidateContainer = (event) => {
    let first = event.target.value?.slice(0, 4);
    let second = event.target.value?.slice(4, 11);
    if (/^[A-Z]+$/.test(first) === false || /^\d+$/.test(second) === false) {
      notify(
        "Please Enter 4 Uppercase letters and 7 digit combination for Container Number.",
        {
          variant: "warning",
        }
      );
      dispatch({
        type: SERVEY_REDUCER.DATA_CHANGE,
        payload: {
          [`container_no`]: "",
        },
      });
      return;
    }

    dispatch(
      getServeyContainerValidation(event.target.value, notify, imageRef)
    );
  };

  function dataURLtoFile(dataurl, filename) {
    var arr = dataurl.split(","),
      mime = arr[0].match(/:(.*?);/)[1],
      bstr = atob(arr[arr.length - 1]),
      n = bstr.length,
      u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  }

  const handleSurveyImageUpload = () => {
    setIsImageUploading(true);
    dispatch({ type: "START_LOADING" });
    if (ServeyorReducer.data.pk) {
      let formData = new FormData();
      let files = [
        ...file,
        ...mobileUpload.map((val) => dataURLtoFile(val, "mobile_servey.jpg")),
      ];
      files.map((fileItem) => {
        return formData.append("file_list", fileItem);
      });
      dispatch(
        uploadSurveyImageAction(
          formData,
          ServeyorReducer.data.pk,
          notify,
          setMobileUpload,
          setFile,
          setIsImageUploading
        )
      );
    } else {
      notify("Please update survey before uploading images", {
        variant: "error",
      });
      setIsImageUploading(false);
    }
  };

  const handleUploadServey = () => {

    if (
      ServeyorReducer.data.client === "" ||
      ServeyorReducer.data.line === "" ||
      ServeyorReducer.data.gate_in_time === "" ||
      ServeyorReducer.data.survey_time === "" ||
      ServeyorReducer.data.type === "" ||
      ServeyorReducer.data.size === "" ||
      ServeyorReducer.data.gross_wt === "" ||
      ServeyorReducer.data.tare_wt === "" ||
      ServeyorReducer.data.manufacturing_date === "" ||
      ServeyorReducer.data.arrived === ""
    ) {
      setContainerError(true);
      notify("Please Fill all the required fields", { variant: "warning" });
    } else if (ServeyorReducer.data.survey_name.length === 0) {
      setContainerError(true);
      notify("Please add Survey By detail ", { variant: "warning" });
    } else if (ServeyorReducer.data.survey_line.length === 0) {
      if (
        ServeyorReducer.tariff.main_component.length > 0 &&
        ServeyorReducer.tariff.component_description.length > 0 &&
        ServeyorReducer.tariff.location_description.length > 0 &&
        ServeyorReducer.tariff.specific_location_description.length > 0 &&
        ServeyorReducer.tariff.damage_description.length > 0 &&
        ServeyorReducer.tariff.material_description.length > 0 &&
        ServeyorReducer.tariff.repair_description.length > 0 &&
        ServeyorReducer.tariff.unit.length > 0 &&
        ServeyorReducer.tariff.measurement.length > 0 &&
        ServeyorReducer.tariff.length_and_width.length > 0 &&
        ServeyorReducer.tariff.quantity.length > 0 &&
        ServeyorReducer.tariff.remarks.length > 0
      ) {
        dispatch({
          type: SERVEY_REDUCER.ADD_SERVEY_LINE,
          payload: ServeyorReducer.tariff,
        });
        dispatch({
          type: SERVEY_REDUCER.TARIFF_CHANGE,
          payload: {
            main_component: "",
            component_code: "",
            component_description: "",
            location_code: "",
            location_description: "",
            specific_location_code: "",
            specific_location_description: "",
            damage_code: "",
            damage_description: "",
            material_code: "",
            material_description: "",
            repair_code: "",
            repair_description: "",
            unit: "",
            measurement: "",
            length_and_width: "",
            quantity: "",
            remarks: "",
            tariff_code: "",
            grade: "",
          },
        });
        setContainerError(false);
        setIsPreGateIn(false)
        dispatch(uploadServeyAction(notify));
      } else {
        notify("Please add Survey line ", { variant: "warning" });
      }
    } else {
      setContainerError(false);
      if (
        ServeyorReducer.tariff.main_component.length > 0 &&
        ServeyorReducer.tariff.component_description.length > 0 &&
        ServeyorReducer.tariff.location_description.length > 0 &&
        ServeyorReducer.tariff.specific_location_description.length > 0 &&
        ServeyorReducer.tariff.damage_description.length > 0 &&
        ServeyorReducer.tariff.material_description.length > 0 &&
        ServeyorReducer.tariff.repair_description.length > 0 &&
        ServeyorReducer.tariff.unit.length > 0 &&
        ServeyorReducer.tariff.measurement.length > 0 &&
        ServeyorReducer.tariff.length_and_width.length > 0 &&
        ServeyorReducer.tariff.quantity.length > 0 &&
        ServeyorReducer.tariff.remarks.length > 0
      ) {
        dispatch({
          type: SERVEY_REDUCER.ADD_SERVEY_LINE,
          payload: ServeyorReducer.tariff,
        });
      }
      setIsPreGateIn(false)
      dispatch(uploadServeyAction(notify));
    }
  };

  const handleContainersList = useCallback(() => {
    dispatch(getContainerListAction());
  }, []);

  const onTariffBlur = (e) => {
    const { name, value } = e.target;

    if (name === "component_description") {
      dispatch(
        getTariffServeyAction(
          {
            main_component: ServeyorReducer.tariff.main_component,
            component_description: ServeyorReducer.tariff.component_description,
            component_code: ServeyorReducer.tariff.component_code,
          },
          "location_description",
          notify
        )
      );
    } else if (name === "location_description") {
      dispatch(
        getTariffServeyAction(
          {
            main_component: ServeyorReducer.tariff.main_component,
            component_description: ServeyorReducer.tariff.component_description,
            component_code: ServeyorReducer.tariff.component_code,
            location_description: ServeyorReducer.tariff.location_description,
            location_code: ServeyorReducer.tariff.location_code,
          },
          "specific_location_description",
          notify
        )
      );
    } else if (name === "specific_location_description") {
      dispatch(
        getTariffServeyAction(
          {
            main_component: ServeyorReducer.tariff.main_component,
            component_description: ServeyorReducer.tariff.component_description,
            component_code: ServeyorReducer.tariff.component_code,
            location_description: ServeyorReducer.tariff.location_description,
            location_code: ServeyorReducer.tariff.location_code,
            specific_location_description:
              ServeyorReducer.tariff.specific_location_description,
            specific_location_code:
              ServeyorReducer.tariff.specific_location_code,
          },
          "damage_description",
          notify
        )
      );
    } else if (name === "damage_description") {
      dispatch(
        getTariffServeyAction(
          {
            main_component: ServeyorReducer.tariff.main_component,
            component_description: ServeyorReducer.tariff.component_description,
            component_code: ServeyorReducer.tariff.component_code,
            location_description: ServeyorReducer.tariff.location_description,
            location_code: ServeyorReducer.tariff.location_code,
            specific_location_description:
              ServeyorReducer.tariff.specific_location_description,
            specific_location_code:
              ServeyorReducer.tariff.specific_location_code,
            damage_description: ServeyorReducer.tariff.damage_description,
            damage_code: ServeyorReducer.tariff.damage_code,
          },
          "material_description",
          notify
        )
      );
    } else if (name === "material_description") {
      dispatch(
        getTariffServeyAction(
          {
            main_component: ServeyorReducer.tariff.main_component,
            component_description: ServeyorReducer.tariff.component_description,
            component_code: ServeyorReducer.tariff.component_code,
            location_description: ServeyorReducer.tariff.location_description,
            location_code: ServeyorReducer.tariff.location_code,
            specific_location_description:
              ServeyorReducer.tariff.specific_location_description,
            specific_location_code:
              ServeyorReducer.tariff.specific_location_code,
            damage_description: ServeyorReducer.tariff.damage_description,
            damage_code: ServeyorReducer.tariff.damage_code,
            material_code: ServeyorReducer.tariff.material_code,
            material_description: ServeyorReducer.tariff.material_description,
          },
          "repair_description",
          notify
        )
      );
    } else if (name === "repair_description") {
      dispatch(
        getTariffServeyAction(
          {
            main_component: ServeyorReducer.tariff.main_component,
            component_description: ServeyorReducer.tariff.component_description,
            component_code: ServeyorReducer.tariff.component_code,
            location_description: ServeyorReducer.tariff.location_description,
            location_code: ServeyorReducer.tariff.location_code,
            specific_location_description:
              ServeyorReducer.tariff.specific_location_description,
            specific_location_code:
              ServeyorReducer.tariff.specific_location_code,
            damage_description: ServeyorReducer.tariff.damage_description,
            damage_code: ServeyorReducer.tariff.damage_code,
            material_code: ServeyorReducer.tariff.material_code,
            material_description: ServeyorReducer.tariff.material_description,
            repair_description: ServeyorReducer.tariff.repair_description,
            repair_code: ServeyorReducer.tariff.repair_code,
          },
          "unit",
          notify
        )
      );
    } else if (name === "unit") {
      dispatch(
        getTariffServeyAction(
          {
            main_component: ServeyorReducer.tariff.main_component,
            component_description: ServeyorReducer.tariff.component_description,
            component_code: ServeyorReducer.tariff.component_code,
            location_description: ServeyorReducer.tariff.location_description,
            location_code: ServeyorReducer.tariff.location_code,
            specific_location_description:
              ServeyorReducer.tariff.specific_location_description,
            specific_location_code:
              ServeyorReducer.tariff.specific_location_code,
            damage_description: ServeyorReducer.tariff.damage_description,
            damage_code: ServeyorReducer.tariff.damage_code,
            material_code: ServeyorReducer.tariff.material_code,
            material_description: ServeyorReducer.tariff.material_description,
            repair_description: ServeyorReducer.tariff.repair_description,
            repair_code: ServeyorReducer.tariff.repair_code,
            unit: ServeyorReducer.tariff.unit,
          },
          "measurement",
          notify
        )
      );
    } else if (name === "measurement") {
      dispatch(
        getTariffServeyAction(
          {
            main_component: ServeyorReducer.tariff.main_component,
            component_description: ServeyorReducer.tariff.component_description,
            component_code: ServeyorReducer.tariff.component_code,
            location_description: ServeyorReducer.tariff.location_description,
            location_code: ServeyorReducer.tariff.location_code,
            specific_location_description:
              ServeyorReducer.tariff.specific_location_description,
            specific_location_code:
              ServeyorReducer.tariff.specific_location_code,
            damage_description: ServeyorReducer.tariff.damage_description,
            damage_code: ServeyorReducer.tariff.damage_code,
            material_code: ServeyorReducer.tariff.material_code,
            material_description: ServeyorReducer.tariff.material_description,
            repair_description: ServeyorReducer.tariff.repair_description,
            repair_code: ServeyorReducer.tariff.repair_code,
            unit: ServeyorReducer.tariff.unit,
            measurement: ServeyorReducer.tariff.measurement,
          },
          "length_and_width",
          notify
        )
      );
    } else if (name === "main_component") {
      dispatch(
        getTariffServeyAction(
          {
            main_component: ServeyorReducer.tariff.main_component,
          },
          "component_description",
          notify
        )
      );
    } else {
    }
  };

  return (
    <>
      <Paper
        component="form"
        className={classes.searchPaper}
        elevation={0}
        style={{ position: "relative", alignItems: "center" }}
      >
        <Autocomplete
          style={{ padding: 0 }}
          className={classes.autocompleteTwo}
          options={
            ServeyorReducer.containers_list &&
            ServeyorReducer.containers_list?.map((option) => option)
          }
          renderInput={(params) => (
            <TextField
              {...params}
              variant="outlined"
              label="Containers List"
              className={classes.textFieldTwo}
              onBlur={(e) => {
                setSearchContainer(e.target.value);
                setIsPreGateIn(false)
              }}
              fullWidth
            />
          )}
        />

        {(user.lolo_finance === "True" || user.lolo_finance === true) && (
          <Autocomplete
            style={{ padding: 0 }}
            className={classes.autocompleteTwo}
            options={AdvanceFinanceReducer.preGateIntable?.preGateInDropdown?.lf_pregatein_list?.map(
              (option) => option
            )}
            renderInput={(params) => (
              <TextField
                {...params}
                variant="outlined"
                label="Pre Gate In"
                className={classes.textFieldTwo}
                onBlur={(e) => {
                  setSearchContainer(e.target.value);
                  setIsPreGateIn(true)
                  // if(e.target.value.length > 0){
                  //   dispatch(ContainerPreGateInGetSurveyorAction(e.target.value,notify,setSurveySearch))
                  // }else {
                  //   return 
                  // }
                 
                }}
                fullWidth
              />
            )}
          />
        )}

        <InputBase
          id="container-search"
          name="searchText"
          className={classes.input}
          // style={{backgroundColor:"whitesmoke"}}
          placeholder={
            user.lolo_finance
              ? "Select a Container from List "
              : "Search for a Container"
          }
          inputProps={{ "aria-label": "search" }}
          value={searchContainer}
          onChange={onChangeSearchContainer}
          autoComplete="off"
        />
        <Button
          onClick={() =>{
            if(isPreGateIn){
               dispatch(ContainerPreGateInGetSurveyorAction(searchContainer , notify , setSurveySearch))
            }else {
              dispatch(
                searchContainerAction(searchContainer, notify, setSurveySearch)
              )}
            }
          
          }
          className={classes.searchButton}
        >
          Search
        </Button>
      </Paper>
      <Stack
        justifyContent={"flex-end"}
        flexDirection={"row"}
        direction={"row"}
        marginTop={2}
      >
        <Button
          onClick={() => {
            setSurveySearch(false);
            setIsPreGateIn(false)
            dispatch({ type: SERVEY_REDUCER.INITIAL_SURVEY });
            history.go(0);
          }}
          variant="contained"
          style={{ backgroundColor: "#2a5fa5", width: "150px", color: "white" }}
          endIcon={<AddCircleOutlineIcon style={{ fill: "white" }} />}
        >
          New
        </Button>
      </Stack>
      <Paper
        className={classes.paperContainer}
        elevation={0}
        style={{ marginTop: "20px" }}
      >
        <Grid container spacing={3} style={{ marginTop: "20px" }}>
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

            <Autocomplete
              value={ServeyorReducer.data.client}
              error={container_error && ServeyorReducer.data.client === ""}
              name="client"
              componentName="client"
              size="small"
              className={classes.autocomplete}
              options={
                ServeyorReducer.inform?.client_data?.map((val) => val.name) ||
                []
              }
              style={{
                backgroundColor:
                  ServeyorReducer.data.pk || surveySearch ? "#e8e8e8" : "white",
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  style={{ padding: 0 }}
                  variant="outlined"
                  name="client"
                  className={classes.textField}
                  onBlur={(e) => {
                    const { value } = e.target;
                    if (ServeyorReducer.data.pk || surveySearch) {
                      return;
                    }
                    if (
                      ServeyorReducer.inform?.client_data?.find(
                        (val) => val.name === value
                      )
                    ) {
                      dispatch({
                        type: SERVEY_REDUCER.DATA_CHANGE,
                        payload: {
                          [`client`]: value,
                          line: ServeyorReducer.inform?.client_data?.find(
                            (val) => val.name === value
                          )?.line,
                          tariff_id: ServeyorReducer.inform?.client_data?.find(
                            (val) => val.name === value
                          )?.tariff_id,
                        },
                      });
                    } else {
                      dispatch({
                        type: SERVEY_REDUCER.DATA_CHANGE,
                        payload: {
                          [`client`]: "",
                          line: "",
                          tariff_id: "",
                        },
                      });
                    }
                  }}
                  size="small"
                />
              )}
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
              Container Number <span style={{ color: "red" }}>*</span>
            </Typography>
            <TextField
              id="container_no"
              name="container_no"
              value={ServeyorReducer.data.container_no}
              variant="outlined"
              error={
                container_error && ServeyorReducer.data.container_no === ""
              }
              fullWidth
              className={classes.textField}
              inputProps={{ className: classes.input }}
              onChange={surveySearch === false && onChangeData}
              autoComplete="off"
              style={{
                backgroundColor:
                  ServeyorReducer.data.pk || surveySearch ? "#e8e8e8" : "white",
              }}
              contentEditable={
                ServeyorReducer.data.pk || surveySearch ? false : true
              }
              onBlur={surveySearch === false && handleValidateContainer}
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
              Size <span style={{ color: "red" }}>*</span>
            </Typography>

            <Select
              id="client-name"
              value={ServeyorReducer.data.size}
              fullWidth
              name="size"
              error={container_error && ServeyorReducer.data.size === ""}
              inputProps={{
                style: {
                  padding: "0px",
                },
              }}
              style={{
                backgroundColor:
                  ServeyorReducer.data.pk || surveySearch ? "#e8e8e8" : "white",
              }}
              contentEditable={
                ServeyorReducer.data.pk || surveySearch ? false : true
              }
            >
              {ServeyorReducer.inform?.size_data?.map((val, index) => (
                <MenuItem
                  key={val}
                  value={val}
                  onClick={() => {
                    if (ServeyorReducer.data.pk || surveySearch) {
                      return;
                    }
                    dispatch({
                      type: SERVEY_REDUCER.DATA_CHANGE,
                      payload: {
                        [`size`]: val,
                      },
                    });
                  }}
                >
                  {val}
                </MenuItem>
              ))}
            </Select>
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
            <Select
              id="client-name"
              value={ServeyorReducer.data.type}
              fullWidth
              name="type"
              error={container_error && ServeyorReducer.data.type === ""}
              inputProps={{
                style: {
                  padding: "0px",
                },
              }}
              style={{
                backgroundColor:
                  ServeyorReducer.data.pk || surveySearch ? "#e8e8e8" : "white",
              }}
              contentEditable={
                ServeyorReducer.data.pk || surveySearch ? false : true
              }
            >
              {ServeyorReducer.inform?.type_data?.map((val, index) => (
                <MenuItem
                  key={val}
                  value={val}
                  onClick={() => {
                    if (ServeyorReducer.data.pk || surveySearch) {
                      return;
                    }
                    dispatch({
                      type: SERVEY_REDUCER.DATA_CHANGE,
                      payload: {
                        [`type`]: val,
                      },
                    });
                  }}
                >
                  {val}
                </MenuItem>
              ))}
            </Select>
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
            <TextField
              id="container_gross_weight"
              name="gross_wt"
              value={ServeyorReducer.data.gross_wt}
              error={container_error && ServeyorReducer.data.gross_wt === ""}
              variant="outlined"
              fullWidth
              className={classes.textField}
              inputProps={{ className: classes.input }}
              style={{
                backgroundColor:
                  ServeyorReducer.data.pk || surveySearch ? "#e8e8e8" : "white",
              }}
              contentEditable={
                ServeyorReducer.data.pk || surveySearch ? false : true
              }
              onChange={surveySearch === false && onChangeData}
              // onBlur={handleContainerNumberOnBlur}
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
            <Typography variant="subtitle1" className={classes.LabelTypography}>
              Tare Weight
              {/* <span style={{ color: "red" }}>*</span> */}
            </Typography>
            <TextField
              id="container_tare_wtt"
              name="tare_wt"
              value={ServeyorReducer.data.tare_wt}
              error={container_error && ServeyorReducer.data.tare_wt === ""}
              variant="outlined"
              fullWidth
              className={classes.textField}
              inputProps={{ className: classes.input }}
              onChange={surveySearch === false && onChangeData}
              style={{
                backgroundColor:
                  ServeyorReducer.data.pk || surveySearch ? "#e8e8e8" : "white",
              }}
              contentEditable={
                ServeyorReducer.data.pk || surveySearch ? false : true
              }
              // onBlur={handleContainerNumberOnBlur}
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
            <Typography variant="subtitle1" className={classes.LabelTypography}>
              Shipping Line <span style={{ color: "red" }}>*</span>
            </Typography>

            <TextField
              name="line"
              id="shipping-line-disable"
              value={ServeyorReducer.data.line}
              error={container_error && ServeyorReducer.data.line === ""}
              style={{
                backgroundColor:
                  ServeyorReducer.data.pk || surveySearch ? "#e8e8e8" : "white",
              }}
              contentEditable={
                ServeyorReducer.data.pk || surveySearch ? false : true
              }
              // disabled
              inputProps={{ className: classes.input }}
              variant="outlined"
              fullWidth
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

            <MuiPickersUtilsProvider utils={DateFnsUtils}>
              <KeyboardDatePicker
                variant="inline"
                format="yyyy/MM/dd"
                autoOk={true}
                views={["year", "month", "date"]}
                inputVariant="outlined"
                id={`-date-picker-inline`}
                value={ServeyorReducer.data.manufacturing_date}
                emptyLabel=""
                name="manufacturing_date"
                error={
                  container_error &&
                  ServeyorReducer.data.manufacturing_date === ""
                }
                onKeyDown={(e) => {
                  e.preventDefault();
                }}
                helperText={``}
                onChange={(date) =>
                  (surveySearch === false|| isPreGateIn) &&
                  onChangeData(date, "manufacturing_date")
                }
                style={{
                  backgroundColor:
                    ((ServeyorReducer.data.pk || surveySearch) && !isPreGateIn)
                      ? "#e8e8e8"
                      : "white",
                }}
                KeyboardButtonProps={{
                  "aria-label": "change date",
                }}
                className={classes.textField}
                inputProps={{ className: classes.input }}
              />
            </MuiPickersUtilsProvider>
          </Grid>
          <Grid
            item
            xs={12}
            sm={6}
            lg={3}
            style={theme.breakpoints.down("sm") && { padding: 7 }}
          >
            <Typography variant="subtitle1" className={classes.LabelTypography}>
              Gate IN Date<span style={{ color: "red" }}>*</span>
            </Typography>

            <MuiPickersUtilsProvider utils={DateFnsUtils}>
              <KeyboardDatePicker
                variant="inline"
                format="yyyy/MM/dd"
                autoOk={true}
                views={["year", "month", "date"]}
                inputVariant="outlined"
                id={`-date-picker-inline`}
                value={ServeyorReducer.data.gate_in_date}
                emptyLabel=""
                name="gate_in_date"
                onChange={(date) =>
                  surveySearch === false && onChangeData(date, "gate_in_date")
                }
                onKeyDown={(e) => {
                  e.preventDefault();
                }}
                style={{
                  backgroundColor:
                    ServeyorReducer.data.pk || surveySearch
                      ? "#e8e8e8"
                      : "white",
                }}
                KeyboardButtonProps={{
                  "aria-label": "change date",
                }}
                className={classes.textField}
                inputProps={{ className: classes.input }}
              />
            </MuiPickersUtilsProvider>
          </Grid>
          <Grid item xs={12} sm={6} md={4} lg={3}>
            <Typography variant="subtitle1" className={classes.LabelTypography}>
              Gate IN Time <span style={{ color: "red" }}>*</span>
            </Typography>
            <TextField
              id={"gate_in_time"}
              type={"time"}
              onKeyDown={(e) => {
                e.preventDefault();
              }}
              error={
                container_error && ServeyorReducer.data.gate_in_time === ""
              }
              value={ServeyorReducer.data.gate_in_time}
              variant="outlined"
              name="gate_in_time"
              fullWidth
              className={classes.textField}
              style={{
                backgroundColor:
                  ServeyorReducer.data.pk || surveySearch ? "#e8e8e8" : "white",
              }}
              inputProps={{ className: classes.input }}
              onChange={surveySearch === false && onChangeData}
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
            <Typography variant="subtitle1" className={classes.LabelTypography}>
              Survey Date<span style={{ color: "red" }}>*</span>
            </Typography>

            <MuiPickersUtilsProvider utils={DateFnsUtils}>
              <KeyboardDatePicker
                variant="inline"
                onKeyDown={(e) => {
                  e.preventDefault();
                }}
                format="yyyy/MM/dd"
                views={["year", "month", "date"]}
                autoOk={true}
                inputVariant="outlined"
                id={`-date-picker-inline`}
                value={ServeyorReducer.data.survey_date}
                emptyLabel=""
                name="survey_date"
                onChange={(date) => onChangeData(date, "survey_date")}
                KeyboardButtonProps={{
                  "aria-label": "change date",
                }}
                className={classes.textField}
                style={{
                  backgroundColor: ServeyorReducer.data.pk
                    ? "#e8e8e8"
                    : "white",
                }}
                inputProps={{ className: classes.input }}
              />
            </MuiPickersUtilsProvider>
          </Grid>
          <Grid item xs={12} sm={6} md={4} lg={3}>
            <Typography variant="subtitle1" className={classes.LabelTypography}>
              Survey Time <span style={{ color: "red" }}>*</span>
            </Typography>
            <TextField
              id={"survey_time"}
              type={"time"}
              onKeyDown={(e) => {
                e.preventDefault();
              }}
              value={ServeyorReducer.data.survey_time}
              variant="outlined"
              name="survey_time"
              fullWidth
              error={container_error && ServeyorReducer.data.survey_time === ""}
              className={classes.textField}
              inputProps={{ className: classes.input }}
              onChange={onChangeData}
              style={{
                backgroundColor: ServeyorReducer.data.pk ? "#e8e8e8" : "white",
              }}
              autoComplete="off"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4} lg={3}>
            <Typography variant="subtitle1" className={classes.LabelTypography}>
              Arrived <span style={{ color: "red" }}>*</span>
            </Typography>
          { ((user.lolo_finance === true|| user.lolo_finance ==="True") && (ServeyorReducer.data.pk || surveySearch) ) ?<GateInTextField readOnlyP={true} value={ServeyorReducer.data.arrived}/> : <Select
              id="arrived"
              value={ServeyorReducer.data.arrived}
              defaultValue={ServeyorReducer.data.arrived}
              fullWidth
              name="arrived"
              inputProps={{
                style: {
                  padding: "0 5px",
                  color: "black",
                },
              }}
              disabled={ServeyorReducer.data.pk || surveySearch ? true : false}
              style={{
                backgroundColor:
                  ServeyorReducer.data.pk || surveySearch ? "#e8e8e8" : "white",
                color: "black",
                marginLeft: "2px",
              }}
              contentEditable={
                ServeyorReducer.data.pk || surveySearch ? false : true
              }
            >
              {user.lolo_finance === true || user.lolo_finance === "True"
                ? ["Road/Rail", "Port/Vessel"].map((val) => (
                    <MenuItem
                      key={val}
                      value={val}
                      onClick={() => {
                        if (ServeyorReducer.data.pk || surveySearch) {
                          return;
                        }
                        dispatch({
                          type: SERVEY_REDUCER.DATA_CHANGE,
                          payload: {
                            [`arrived`]: val,
                          },
                        });
                      }}
                    >
                      {val}
                    </MenuItem>
                  ))
                : [
                    "Factory",
                    "Road/Rail",
                    "CFS/ICD",
                    "Port/Vessel",
                    "FS RETURN",
                  ].map((val) => (
                    <MenuItem
                      key={val}
                      value={val}
                      onClick={() => {
                        if (ServeyorReducer.data.pk || surveySearch) {
                          return;
                        }
                        dispatch({
                          type: SERVEY_REDUCER.DATA_CHANGE,
                          payload: {
                            [`arrived`]: val,
                          },
                        });
                      }}
                    >
                      {val}
                    </MenuItem>
                  ))}
            </Select>}
          </Grid>
          <Grid
            item
            xs={12}
            sm={6}
            lg={3}
            style={theme.breakpoints.down("sm") && { padding: 7 }}
          >
            <Typography variant="subtitle1" className={classes.LabelTypography}>
              Grade
            </Typography>
            <Select
              id="grade"
              value={String(ServeyorReducer.data.grade)}
              fullWidth
              name="grade"
              inputProps={{
                style: {
                  padding: "0 5px",
                  color: "black",
                },
              }}
              disabled={ ((ServeyorReducer.data.pk || surveySearch) && !isPreGateIn) ? true : false}
              style={{
                backgroundColor:
                  ((ServeyorReducer.data.pk || surveySearch) && !isPreGateIn) ? "#e8e8e8" : "white",
                color: "black",
                marginLeft: "2px",
              }}
              contentEditable={
                ((ServeyorReducer.data.pk || surveySearch) && !isPreGateIn) ? false : true
              }
            >
              {["A", "B", "C", "D", "E", "F"].map((val) => (
                <MenuItem
                  key={val}
                  value={val}
                  onClick={() => {
                    if ((ServeyorReducer.data.pk || surveySearch) && !isPreGateIn) {
                      return;
                    }
                    dispatch({
                      type: SERVEY_REDUCER.DATA_CHANGE,
                      payload: {
                        [`grade`]: val,
                      },
                    });
                  }}
                >
                  {val}
                </MenuItem>
              ))}
            </Select>
          </Grid>
          <Grid
            item
            xs={12}
            sm={6}
            lg={3}
            style={theme.breakpoints.down("sm") && { padding: 7 }}
          >
            <Typography variant="subtitle1" className={classes.LabelTypography}>
              Survey By <span style={{ color: "red" }}>*</span>
            </Typography>

            <Select
              id="client-name"
              value={ServeyorReducer.data.survey_name}
              error={container_error && ServeyorReducer.data.survey_by === ""}
              fullWidth
              name="client"
              style={{
                backgroundColor: ServeyorReducer.data.pk ? "#e8e8e8" : "white",
              }}
              contentEditable={ServeyorReducer.data.pk ? false : true}
              inputProps={{
                style: {
                  padding: "0px",
                },
              }}
              MenuProps={MenuProps}
              // onChange={onChangeData}
            >
              {ServeyorReducer.inform?.staff_data?.map((val, index) => (
                <MenuItem
                  key={val.name}
                  value={val.name}
                  onClick={() => {
                    if (ServeyorReducer.data.pk) {
                      return;
                    }
                    dispatch({
                      type: SERVEY_REDUCER.DATA_CHANGE,
                      payload: {
                        [`survey_by`]: val.pk,
                        [`survey_name`]: val.name,
                      },
                    });
                  }}
                >
                  {val.name}
                </MenuItem>
              ))}
            </Select>
          </Grid>
          {ServeyorReducer.data?.total_amount && (
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
                Total Amount
              </Typography>

              <TextField
                id="client-name"
                value={ServeyorReducer.data.total_amount}
                fullWidth
                name="client"
                style={{
                  backgroundColor: ServeyorReducer.data.pk
                    ? "#e8e8e8"
                    : "white",
                }}
                contentEditable={ServeyorReducer.data.pk ? false : true}
                className={classes.textField}
                MenuProps={MenuProps}
                // onChange={onChangeData}
              ></TextField>
            </Grid>
          )}
        </Grid>
      </Paper>

      {ServeyorReducer.data.survey_line.length > 0 &&
        ServeyorReducer.data.survey_line.map((val, index) => (
          <Paper
            className={classes.paperContainer}
            elevation={0}
            style={{ marginTop: "10px", backgroundColor: "whitesmoke" }}
          >
            <Grid container spacing={1}>
              <Grid
                container
                sm={4}
                spacing={1}
                style={{ alignSelf: "flex-end", alignItems: "flex-end" }}
              >
                <Grid item sm={2}>
                  <Typography
                    style={{
                      fontSize: "10px",
                      marginBottom: "6px",
                      fontWeight: "bold",
                    }}
                  >
                    {`Main component`}
                  </Typography>
                  <TextField
                    id="servey_main_component"
                    name={"main_component"}
                    variant="outlined"
                    fullWidth
                    type={"text"}
                    value={val["main_component"]}
                    inputProps={{ className: classes.input }}
                  ></TextField>
                </Grid>
                <Grid item sm={2}>
                  <Typography
                    style={{
                      fontSize: "10px",
                      marginBottom: "6px",
                      fontWeight: "bold",
                    }}
                  >
                    {`Component`}
                  </Typography>
                  <TextField
                    id="servey_main_component"
                    name={"component_description"}
                    variant="outlined"
                    fullWidth
                    type={"text"}
                    value={val["component_description"]}
                    inputProps={{ className: classes.input }}
                  ></TextField>
                </Grid>
                <Grid item sm={2}>
                  <Typography
                    style={{
                      fontSize: "10px",
                      marginBottom: "6px",
                      fontWeight: "bold",
                    }}
                  >
                    {`Location`}
                  </Typography>
                  <TextField
                    id="servey_main_component"
                    name={"location_description"}
                    variant="outlined"
                    fullWidth
                    type={"text"}
                    value={val["location_description"]}
                    inputProps={{ className: classes.input }}
                  ></TextField>
                </Grid>
                <Grid item sm={2}>
                  <Typography
                    style={{
                      fontSize: "10px",
                      marginBottom: "6px",
                      fontWeight: "bold",
                    }}
                  >
                    {`Specific Location`}
                  </Typography>
                  <TextField
                    id="servey_main_component"
                    name={"specific_location_description"}
                    variant="outlined"
                    fullWidth
                    type={"text"}
                    value={val["specific_location_description"]}
                    inputProps={{ className: classes.input }}
                  ></TextField>
                </Grid>
                <Grid item sm={2}>
                  <Typography
                    style={{
                      fontSize: "10px",
                      marginBottom: "6px",
                      fontWeight: "bold",
                    }}
                  >
                    {`Damage`}
                  </Typography>
                  <TextField
                    id="servey_main_component"
                    name={"damage_description"}
                    variant="outlined"
                    fullWidth
                    type={"text"}
                    value={val["damage_description"]}
                    inputProps={{ className: classes.input }}
                  ></TextField>
                </Grid>
                <Grid item sm={2}>
                  <Typography
                    style={{
                      fontSize: "10px",
                      marginBottom: "6px",
                      fontWeight: "bold",
                    }}
                  >
                    {`Material`}
                  </Typography>
                  <TextField
                    id="servey_main_component"
                    name={"material_description"}
                    variant="outlined"
                    fullWidth
                    type={"text"}
                    value={val["material_description"]}
                    inputProps={{ className: classes.input }}
                  ></TextField>
                </Grid>
              </Grid>
              <Grid
                container
                sm={6}
                spacing={1}
                style={{ alignSelf: "flex-end", alignItems: "flex-end" }}
              >
                <Grid item sm={2}>
                  <Typography
                    style={{
                      fontSize: "10px",
                      marginBottom: "6px",
                      fontWeight: "bold",
                    }}
                  >
                    {`Repair`}
                  </Typography>
                  <TextField
                    id="servey_main_component"
                    name={"repair_description"}
                    variant="outlined"
                    fullWidth
                    type={"text"}
                    value={val["repair_description"]}
                    inputProps={{ className: classes.input }}
                  ></TextField>
                </Grid>
                <Grid item sm={2}>
                  <Typography
                    style={{
                      fontSize: "10px",
                      marginBottom: "6px",
                      fontWeight: "bold",
                    }}
                  >
                    {`Unit`}
                  </Typography>
                  <TextField
                    id="servey_main_component"
                    name={"unit"}
                    variant="outlined"
                    fullWidth
                    type={"text"}
                    value={val["unit"]}
                    inputProps={{ className: classes.input }}
                  ></TextField>
                </Grid>
                <Grid item sm={2}>
                  <Typography
                    style={{
                      fontSize: "10px",
                      marginBottom: "6px",
                      fontWeight: "bold",
                    }}
                  >
                    {`Measurement`}
                  </Typography>
                  <TextField
                    id="servey_main_component"
                    name={"measurement"}
                    variant="outlined"
                    fullWidth
                    type={"text"}
                    value={val["measurement"]}
                    inputProps={{ className: classes.input }}
                  ></TextField>
                </Grid>
                <Grid item sm={2}>
                  <Typography
                    style={{
                      fontSize: "10px",
                      marginBottom: "6px",
                      fontWeight: "bold",
                    }}
                  >
                    {`L/W`}
                  </Typography>
                  <TextField
                    id="servey_main_component"
                    name={"length_and_width"}
                    variant="outlined"
                    fullWidth
                    type={"text"}
                    value={val["length_and_width"]}
                    inputProps={{ className: classes.input }}
                  ></TextField>
                </Grid>
                <Grid item sm={2}>
                  <Typography
                    style={{
                      fontSize: "10px",
                      marginBottom: "6px",
                      fontWeight: "bold",
                    }}
                  >
                    {`Quantity`}
                  </Typography>
                  <TextField
                    id="servey_main_component"
                    name={"quantity"}
                    variant="outlined"
                    fullWidth
                    type={"number"}
                    value={val["quantity"]}
                    inputProps={{ className: classes.input }}
                  ></TextField>
                </Grid>
                <Grid item sm={2}>
                  <Typography
                    style={{
                      fontSize: "10px",
                      marginBottom: "6px",
                      fontWeight: "bold",
                    }}
                  >
                    {`Remarks`}
                  </Typography>
                  <TextField
                    id="servey_main_component"
                    name={"remarks"}
                    variant="outlined"
                    fullWidth
                    type={"text"}
                    value={val["remarks"]}
                    inputProps={{ className: classes.input }}
                  ></TextField>
                </Grid>
              </Grid>
              <Grid
                container
                sm={2}
                spacing={1}
                style={{ alignSelf: "flex-end", alignItems: "flex-end" }}
              >
                <Grid item sm={6}>
                  <Typography
                    style={{
                      fontSize: "10px",
                      marginBottom: "6px",
                      fontWeight: "bold",
                    }}
                  >
                    {`Tariff Code`}
                  </Typography>
                  <TextField
                    id="servey_main_component"
                    name={"tariff_code"}
                    variant="outlined"
                    fullWidth
                    type={"text"}
                    value={val["tariff_code"]}
                    inputProps={{ className: classes.input }}
                  ></TextField>
                </Grid>
                {!ServeyorReducer.data.pk && (
                  <Grid item sm={6}>
                    <Stack flexDirection={"row"}>
                      <IconButton
                        onClick={() =>
                          dispatch({
                            type: SERVEY_REDUCER.REMOVE_SERVEY_LINE,
                            payload: index,
                          })
                        }
                      >
                        <DeleteForeverIcon style={{ fill: "red" }} />
                      </IconButton>
                    </Stack>
                  </Grid>
                )}
              </Grid>
            </Grid>
          </Paper>
        ))}
      <Paper
        className={classes.paperContainer}
        elevation={0}
        style={{
          marginTop: "10px",
          marginBottom: ServeyorReducer.data.pk ? "0" : "100px",
          display: ServeyorReducer.data.pk ? "none" : "block",
          position: "relative",
        }}
      >
        <Stack
          flexDirection={"row"}
          position={"absolute"}
          style={{
            right: "0px",
            top: "0px",
            // backgroundColor: "whitesmoke",
            borderRadius: "5px",
            boxShadow: "1px 1px 1px whitesmoke",
            display: "flex",
          }}
          direction={"row"}
          spacing={2}
          alignItems={"center"}
          justifyContent={"center"}
        >
          <IconButton onClick={onClickAdd} size="small">
            <AddBoxIcon style={{ fill: "green" }} fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            onClick={() =>
              dispatch({
                type: SERVEY_REDUCER.TARIFF_CHANGE,
                payload: {
                  main_component: "",
                  component_code: "",
                  component_description: "",
                  location_code: "",
                  location_description: "",
                  specific_location_code: "",
                  specific_location_description: "",
                  damage_code: "",
                  damage_description: "",
                  material_code: "",
                  material_description: "",
                  repair_code: "",
                  repair_description: "",
                  unit: "",
                  measurement: "",
                  length_and_width: "",
                  quantity: "",
                  remarks: "",
                  tariff_code: "",
                },
              })
            }
          >
            <DeleteForeverIcon style={{ fill: "red" }} fontSize="small" />
          </IconButton>
        </Stack>

        <Grid container spacing={1}>
          <Grid
            container
            sm={6}
            spacing={1}
            style={{ alignSelf: "flex-end", alignItems: "flex-end" }}
          >
            <Grid item sm={2}>
              <Typography
                style={{
                  fontSize: "10px",
                  marginBottom: "6px",
                  fontWeight: "bold",
                }}
              >
                {`Main component`}
              </Typography>
              <TextField
                id="servey_main_component"
                name={"main_component"}
                select
                variant="outlined"
                fullWidth
                type={"text"}
                value={ServeyorReducer.tariff["main_component"]}
                inputProps={{ className: classes.input }}
                onChange={onChangeTariff}
                onBlur={onTariffBlur}
                error={
                  tariff_error &&
                  ServeyorReducer.tariff["main_component"] === ""
                }
              >
                {ServeyorReducer?.inform?.tariff_data?.main_component.map(
                  (option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  )
                )}
              </TextField>
            </Grid>
            <Grid item sm={2}>
              <Typography
                style={{
                  fontSize: "10px",
                  marginBottom: "6px",
                  fontWeight: "bold",
                }}
              >
                {`Component`}
              </Typography>
              <TextField
                id="servey_main_component"
                name={"component_description"}
                select
                variant="outlined"
                fullWidth
                type={"text"}
                value={ServeyorReducer.tariff["component_description"]}
                inputProps={{ className: classes.input }}
                onChange={onChangeTariff}
                onBlur={onTariffBlur}
                error={
                  tariff_error &&
                  ServeyorReducer.tariff["component_description"] === ""
                }
              >
                {ServeyorReducer.tariff_data?.component_description?.map(
                  (option) => (
                    <MenuItem
                      key={option.component_description}
                      value={option.component_description}
                      onClick={() =>
                        dispatch({
                          type: SERVEY_REDUCER.TARIFF_CHANGE,
                          payload: {
                            component_code: option.component_code,
                          },
                        })
                      }
                    >
                      {option.component_description}
                    </MenuItem>
                  )
                )}
              </TextField>
            </Grid>
            <Grid item sm={2}>
              <Typography
                style={{
                  fontSize: "10px",
                  marginBottom: "6px",
                  fontWeight: "bold",
                }}
              >
                {`Location`}
              </Typography>
              <TextField
                id="servey_main_component"
                name={"location_description"}
                select
                variant="outlined"
                fullWidth
                type={"text"}
                value={ServeyorReducer.tariff["location_description"]}
                inputProps={{ className: classes.input }}
                onChange={onChangeTariff}
                onBlur={onTariffBlur}
                error={
                  tariff_error &&
                  ServeyorReducer.tariff["location_description"] === ""
                }
              >
                {ServeyorReducer.tariff_data?.location_description?.map(
                  (option) => (
                    <MenuItem
                      key={option.location_description}
                      value={option.location_description}
                      onClick={() =>
                        dispatch({
                          type: SERVEY_REDUCER.TARIFF_CHANGE,
                          payload: {
                            location_code: option.location_code,
                          },
                        })
                      }
                    >
                      {option.location_description}
                    </MenuItem>
                  )
                )}
              </TextField>
            </Grid>
            <Grid item sm={2}>
              <Typography
                style={{
                  fontSize: "10px",
                  marginBottom: "6px",
                  fontWeight: "bold",
                }}
              >
                {`Specific Location`}
              </Typography>
              <TextField
                id="servey_main_component"
                name={"specific_location_description"}
                select
                variant="outlined"
                fullWidth
                type={"text"}
                value={ServeyorReducer.tariff["specific_location_description"]}
                inputProps={{ className: classes.input }}
                onChange={onChangeTariff}
                onBlur={onTariffBlur}
                error={
                  tariff_error &&
                  ServeyorReducer.tariff["specific_location_description"] === ""
                }
              >
                {ServeyorReducer.tariff_data?.specific_location_description?.map(
                  (option) => (
                    <MenuItem
                      key={option.specific_location_description}
                      value={option.specific_location_description}
                      onClick={() =>
                        dispatch({
                          type: SERVEY_REDUCER.TARIFF_CHANGE,
                          payload: {
                            specific_location_code:
                              option.specific_location_code,
                          },
                        })
                      }
                    >
                      {option.specific_location_description}
                    </MenuItem>
                  )
                )}
              </TextField>
            </Grid>
            <Grid item sm={2}>
              <Typography
                style={{
                  fontSize: "10px",
                  marginBottom: "6px",
                  fontWeight: "bold",
                }}
              >
                {`Damage`}
              </Typography>
              <TextField
                id="servey_main_component"
                name={"damage_description"}
                select
                variant="outlined"
                fullWidth
                type={"text"}
                value={ServeyorReducer.tariff["damage_description"]}
                inputProps={{ className: classes.input }}
                onChange={onChangeTariff}
                onBlur={onTariffBlur}
                error={
                  tariff_error &&
                  ServeyorReducer.tariff["damage_description"] === ""
                }
              >
                {ServeyorReducer.tariff_data?.damage_description?.map(
                  (option) => (
                    <MenuItem
                      key={option.damage_description}
                      value={option.damage_description}
                      onClick={() =>
                        dispatch({
                          type: SERVEY_REDUCER.TARIFF_CHANGE,
                          payload: {
                            damage_code: option.damage_code,
                          },
                        })
                      }
                    >
                      {option.damage_description}
                    </MenuItem>
                  )
                )}
              </TextField>
            </Grid>
            <Grid item sm={2}>
              <Typography
                style={{
                  fontSize: "10px",
                  marginBottom: "6px",
                  fontWeight: "bold",
                }}
              >
                {`Material`}
              </Typography>
              <TextField
                id="servey_main_component"
                name={"material_description"}
                select
                variant="outlined"
                fullWidth
                type={"text"}
                value={ServeyorReducer.tariff["material_description"]}
                inputProps={{ className: classes.input }}
                onChange={onChangeTariff}
                onBlur={onTariffBlur}
                error={
                  tariff_error &&
                  ServeyorReducer.tariff["material_description"] === ""
                }
              >
                {ServeyorReducer.tariff_data?.material_description?.map(
                  (option) => (
                    <MenuItem
                      key={option.material_description}
                      value={option.material_description}
                      onClick={() =>
                        dispatch({
                          type: SERVEY_REDUCER.TARIFF_CHANGE,
                          payload: {
                            material_code: option.material_code,
                          },
                        })
                      }
                    >
                      {option.material_description}
                    </MenuItem>
                  )
                )}
              </TextField>
            </Grid>
          </Grid>
          <Grid
            container
            sm={5}
            spacing={1}
            style={{ alignSelf: "flex-end", alignItems: "flex-end" }}
          >
            <Grid item sm={2}>
              <Typography
                style={{
                  fontSize: "10px",
                  marginBottom: "6px",
                  fontWeight: "bold",
                }}
              >
                {`Repair`}
              </Typography>
              <TextField
                id="servey_main_component"
                name={"repair_description"}
                select
                variant="outlined"
                fullWidth
                type={"text"}
                value={ServeyorReducer.tariff["repair_description"]}
                inputProps={{ className: classes.input }}
                onChange={onChangeTariff}
                onBlur={onTariffBlur}
                error={
                  tariff_error &&
                  ServeyorReducer.tariff["repair_description"] === ""
                }
              >
                {ServeyorReducer.tariff_data?.repair_description?.map(
                  (option) => (
                    <MenuItem
                      key={option.repair_description}
                      value={option.repair_description}
                      onClick={() =>
                        dispatch({
                          type: SERVEY_REDUCER.TARIFF_CHANGE,
                          payload: {
                            repair_code: option.repair_code,
                          },
                        })
                      }
                    >
                      {option.repair_description}
                    </MenuItem>
                  )
                )}
              </TextField>
            </Grid>
            <Grid item sm={2}>
              <Typography
                style={{
                  fontSize: "10px",
                  marginBottom: "6px",
                  fontWeight: "bold",
                }}
              >
                {`Unit`}
              </Typography>
              <TextField
                id="servey_main_component"
                name={"unit"}
                select
                variant="outlined"
                fullWidth
                type={"text"}
                value={ServeyorReducer.tariff["unit"]}
                inputProps={{ className: classes.input }}
                onChange={onChangeTariff}
                onBlur={onTariffBlur}
                error={tariff_error && ServeyorReducer.tariff["unit"] === ""}
              >
                {ServeyorReducer.tariff_data?.unit?.map((option) => (
                  <MenuItem key={option.unit} value={option.unit}>
                    {option.unit}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item sm={2}>
              <Typography
                style={{
                  fontSize: "10px",
                  marginBottom: "6px",
                  fontWeight: "bold",
                }}
              >
                {`Measurement`}
              </Typography>
              <TextField
                id="servey_main_component"
                name={"measurement"}
                select
                variant="outlined"
                fullWidth
                type={"text"}
                value={ServeyorReducer.tariff["measurement"]}
                inputProps={{ className: classes.input }}
                onChange={onChangeTariff}
                onBlur={onTariffBlur}
                error={
                  tariff_error && ServeyorReducer.tariff["measurement"] === ""
                }
              >
                {ServeyorReducer.tariff_data?.measurement?.map((option) => (
                  <MenuItem key={option.measurement} value={option.measurement}>
                    {option.measurement}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item sm={2}>
              <Typography
                style={{
                  fontSize: "10px",
                  marginBottom: "6px",
                  fontWeight: "bold",
                }}
              >
                {`L/W`}
              </Typography>
              <TextField
                id="servey_main_component"
                name={"length_and_width"}
                select
                variant="outlined"
                fullWidth
                type={"text"}
                value={ServeyorReducer.tariff["length_and_width"]}
                inputProps={{ className: classes.input }}
                onChange={onChangeTariff}
                onBlur={onTariffBlur}
                error={
                  tariff_error &&
                  ServeyorReducer.tariff["length_and_width"] === ""
                }
              >
                {ServeyorReducer.tariff_data?.length_and_width?.map(
                  (option) => (
                    <MenuItem
                      key={option.measurement}
                      value={option.length_and_width}
                    >
                      {option.length_and_width}
                    </MenuItem>
                  )
                )}
              </TextField>
            </Grid>
            <Grid item sm={2}>
              <Typography
                style={{
                  fontSize: "10px",
                  marginBottom: "6px",
                  fontWeight: "bold",
                }}
              >
                {`Quantity`}
              </Typography>
              <TextField
                id="servey_main_component"
                name={"quantity"}
                variant="outlined"
                fullWidth
                type={"number"}
                value={ServeyorReducer.tariff["quantity"]}
                inputProps={{ className: classes.input }}
                onChange={onChangeTariff}
                onBlur={onTariffBlur}
                error={
                  tariff_error && ServeyorReducer.tariff["quantity"] === ""
                }
              ></TextField>
            </Grid>
            <Grid item sm={2}>
              <Typography
                style={{
                  fontSize: "10px",
                  marginBottom: "6px",
                  fontWeight: "bold",
                }}
              >
                {`Remarks`}
              </Typography>
              <TextField
                id="servey_main_component"
                name={"remarks"}
                variant="outlined"
                fullWidth
                type={"text"}
                value={ServeyorReducer.tariff["remarks"]}
                inputProps={{ className: classes.input }}
                onChange={onChangeTariff}
                onBlur={onTariffBlur}
                error={tariff_error && ServeyorReducer.tariff["remarks"] === ""}
              ></TextField>
            </Grid>
          </Grid>

          {/* <Grid item sm={6}>
              <Stack flexDirection={"row"}>
                <IconButton onClick={onClickAdd}>
                  <AddBoxIcon style={{ fill: "green" }} />
                </IconButton>
                <IconButton>
                  <DeleteForeverIcon style={{ fill: "red" }} />
                </IconButton>
              </Stack>
            </Grid> */}
        </Grid>
      </Paper>
      <Paper
        className={classes.paperContainer}
        elevation={0}
        ref={imageRef}
        style={{
          marginTop: "10px",
          marginBottom: "100px",
          display: ServeyorReducer.data.pk ? "block" : "none",
        }}
      >
        <Typography
          variant="subtitle2"
          style={{ fontWeight: "bold" }}
          onClick={handleOpen}
        >
          Upload before Survey Image
        </Typography>

        <Stack
          direction={"row"}
          alignItems={"flex-start"}
          justifyContent={"space-between"}
          spacing={matchesIpad ? 2 : 5}
          marginTop={2}
        >
          <Stack
            spacing={3}
            bgcolor={"#dfe6ec"}
            padding={2}
            borderRadius={1}
            boxShadow={"0px 1px 1px gray"}
          >
            <input
              type="file"
              className="form-control"
              onChange={onChangePicture}
              multiple
              ref={fileRef}
              style={{ width: "300px" }}
            />
            <Typography
              variant="subtitle2"
              style={{ fontWeight: "bold", textAlign: "center" }}
            >
              Or
            </Typography>

            <Button
              variant="contained"
              color="secondary"
              startIcon={<CameraAltIcon />}
              endIcon={
                <Typography
                  variant="subtitle1"
                  className={classes.LabelTypographycamera}
                >
                  {`${
                    mobileUpload.length ? mobileUpload.length + " File" : ""
                  }`}{" "}
                </Typography>
              }
              style={{ backgroundColor: "#fdbd2e" }}
              onClick={handleMobileClick}
            >
              Camera Upload
            </Button>
            <Divider style={{ backgroundColor: "black" }} />
            <Button
              id="upload_images_no"
              variant="contained"
              color="secondary"
              startIcon={
                imageUploading ? (
                  <CircularProgress size={20} color="success" />
                ) : (
                  <UploadIcon />
                )
              }
              style={{ backgroundColor: "#66bb6a" }}
              disabled={
                (file.length === 0 && mobileUpload.length === 0) ||
                imageUploading === true
              }
              onClick={handleSurveyImageUpload}
            >
              Upload Images
            </Button>
          </Stack>
          <Grid
            container
            spacing={matchesIpad ? 1 : 2}
            style={{ overflowY: "scroll", height: "350px" }}
          >
            {ServeyorReducer.data?.image_data?.length > 0 &&
              ServeyorReducer.data.image_data.map((val, index) => (
                <Grid item lg={3} sm={4}>
                  <Card lg={{ maxWidth: 345 }}>
                    <CardActionArea>
                      <CardMedia
                        component="img"
                        height="140"
                        image={val.s3_image_link}
                        alt={val.s3_file_name}
                      />
                    </CardActionArea>
                  </Card>
                </Grid>
              ))}
          </Grid>
        </Stack>
      </Paper>
      <Paper
        elevation={0.3}
        style={{
          position: "fixed",
          bottom: "0",
          width: "100%",
          margin: "auto",
          left: "0",
          right: "0",
          padding: "20px",
          display: ServeyorReducer.data.pk ? "none" : "block",
        }}
      >
        <Stack
          justifyContent={"center"}
          spacing={4}
          alignItems={"center"}
          direction={"row"}
        >
          <Button
            variant="contained"
            style={{
              backgroundColor: "#2a5fa5",
              width: "250px",
              fontSize: "15px",
              fontWeight: "bold",
              color: "white",
            }}
            onClick={handleUploadServey}
          >
            Save Survey
          </Button>
        </Stack>
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
            <Paper
              elevation={0.0}
              style={{
                backgroundColor: "rgba(69, 72, 90,0.2)",
                overflowX: "scroll",
                width: "calc(100% - 20px)",
                height: "170px",
                borderRadius: "10px",
                overflowY: "hidden",
              }}
              className={classes.mobileAddRemove}
            >
              {mobileUpload.map((value, index) => (
                <div
                  style={{
                    position: "relative",
                    height: "150px",
                    width: "150px",
                    minWidth: "150px",
                    margin: "0 10px",
                  }}
                >
                  <IconButton
                    size="small"
                    style={{
                      backgroundColor: "#45485a",
                      position: "absolute",
                      zIndex: "100",
                      right: "5px",
                      top: "20px",
                    }}
                    onClick={() => {
                      setMobileUpload((prev) =>
                        prev.filter((item) => item !== value)
                      );
                    }}
                  >
                    <DeleteOutlineIcon style={{ fill: "white" }} />
                  </IconButton>
                  <img
                    src={value}
                    style={{
                      height: "100%",
                      width: "100%",
                      objectFit: "cover",
                      borderRadius: "10px",
                      margin: "10px",
                    }}
                    key={index}
                    alt="mobile captured "
                  />
                </div>
              ))}
            </Paper>
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
    </>
  );
};
