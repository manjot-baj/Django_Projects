import React, { useState, useRef, useEffect } from "react";
import {
  Grid,
  Button,
  makeStyles,
  Typography,
  TextField,
  MenuItem,
  FormControlLabel,
  Radio,
  Paper,
  Box,
  Modal,
  useMediaQuery,
  // Tooltip,
} from "@material-ui/core";
import { useDispatch, useSelector } from "react-redux";
import { useSnackbar } from "notistack";
import AddBoxIcon from "@material-ui/icons/AddBox";
import DeleteForeverIcon from "@material-ui/icons/DeleteForever";
import CustomTextfield from "../components/reusableComponents/GateInTextField";
import DatePickerField from "../components/reusableComponents/DatePickerField";
import { Image } from "semantic-ui-react";
import Checkbox from "../components/reusableComponents/Checkbox";
import InfoIcon from "@material-ui/icons/Info";
import { IconButton, Tooltip } from "@mui/material";
import { getTariffRowData } from "../actions/Master/TariffTypeMasterAction";
import {
  createSurvey,
  updateSurvey,
  uploadSurveyImage,
  downloadSurveyImage,
  makeAvailableReverse,
  deleteSurveyImage,
  getMNRProcessByImportAction,
} from "../actions/MNRProcessActions";

import Camera, { FACING_MODES, IMAGE_TYPES } from "react-html5-camera-photo";
import "react-html5-camera-photo/build/css/index.css";
import { Stack } from "@mui/material";
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import HighlightOffIcon from "@mui/icons-material/HighlightOff";
import { useLocation, useHistory } from "react-router-dom";

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
  backImage: {
    height: 200,
    width: 200,
    marginBottom: 15,
    cursor: "pointer",
    position: "relative",
    borderRadius: "4px",
    marginLeft: "12px",
    "& first-child": {
      marginRight: "0px",
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
  containerWrapper: {
    display: "flex",
    justifyContent: "space-around",
    alignItems: "center",
    padding: "25px",
  },
  containerWrapperImage: {
    display: "grid",
    gridTemplateColumns: "repeat(5, 1fr)",
    gridGap: "10px",
  },
  paperContainer: {
    padding: theme.spacing(0.5, 1),
    marginBottom: 20,
  },
  paperContainerMobileInner: {
    padding: theme.spacing(1, 2),
    marginBottom: 20,
    marginLeft: "-10px",
  },
  paperContainerMobile: {
    padding: 0,
    marginBottom: 20,
  },
  paperContainerMNR: {
    padding: theme.spacing(1),
    borderRadius: 10,
    [theme.breakpoints.down("sm")]: {
      padding: theme.spacing(1),
      width: "98%",
      marginLeft: "auto",
      marginRight: "auto",
    },
  },
  input: {
    padding: 7,
    borderColor: "black",
  },
  selectTextField: {
    "& .MuiOutlinedInput-root": {
      "& fieldset": {
        borderColor: "#243545",
      },
    },
  },
  accordion: {
    boxShadow: "0px 0px 5px 0.1px rgba(0, 0, 0, 0.5)",

    "&::before": {
      top: 0,
      height: 1,
      content: "",
      opacity: 1,
      position: "absolute",
      right: "initial",
    },
  },

  searchButton: {
    backgroundColor: "#FDBD2E",
    color: "#fff",
    borderRadius: "0.5rem",
    padding: "1px 4px",
    height: 40,
    fontSize: 12.5,
    marginLeft: "auto",
    marginRight: "auto",
    marginTop: "15px",
    width: "300px",
    border: "1.5px solid #2A5FA5",
    boxShadow: "0px 3px 6px #9199A14D",
    "&:hover": {
      backgroundColor: "#FDBD2E",
      color: "#fff",
    },
  },
  searchButton2: {
    backgroundColor: "#2A5FA5",
    color: "#fff",
    borderRadius: "0.5rem",
    padding: "1px 4px",
    height: 40,
    fontSize: 12.5,
    marginLeft: "auto",
    marginRight: "auto",
    width: "300px",
    border: "1.5px solid #FDBD2E",
    boxShadow: "0px 3px 6px #9199A14D",
    "&:hover": {
      backgroundColor: "#2A5FA5",
      color: "#fff",
    },
    [theme.breakpoints.down("xs")]: {
      marginLeft: "-10px",
    },
  },
  searchPaper: {
    padding: "1px 4px",
    margin: 5,
    display: "flex",
    alignItems: "center",
    height: 40,
    backgroundColor: "#DFE6EC",
    borderRadius: "0.5rem",
    [theme.breakpoints.down("xs")]: {
      height: 35,
    },
  },
  iconbtn: {
    fontSize: 35,
    fontWeight: 900,
    color: "#000000",
  },
  button: {
    fontSize: 12.5,
    borderRadius: 6,
    width: "300px",
    border: "1.5px solid #2A5FA5",
    boxShadow: "0px 3px 6px #9199A14D",
    backgroundColor: "#2A5FA5",
    color: "#fff",
    "&:hover": {
      backgroundColor: "#2A5FA5",
    },
  },
  heading: {
    fontSize: 17,
    fontWeight: 900,
    color: "#000000",
  },
  paperContainer1: {
    padding: theme.spacing(2, 1),
    marginBottom: 20,
    maxHeight: "500px",
    overflow: "hidden",
    overflowY: "scroll",
  },
  inputfile: {
    display: "none",
  },
  LabelTypographycamera: {
    fontSize: "10px !important",
    fontWeight: 600,
    color: "white",
    [theme.breakpoints.down("sm")]: {
      paddingBottom: 1,
    },
  },
  LabelTypography: {
    fontSize: 10,
    fontWeight: 600,
    color: "#243545",
    paddingBottom: 4,
    [theme.breakpoints.down("sm")]: {
      paddingBottom: 1,
    },
  },

  uploadButton: {
    fontSize: 12.5,
    borderRadius: 6,
    border: "1.5px solid #2A5FA5",
    boxShadow: "0px 3px 6px #9199A14D",
    backgroundColor: "#2A5FA5",
    color: "#fff",
    "&:hover": {
      backgroundColor: "#2A5FA5",
    },
  },
  downloadButton: {
    fontSize: 12.5,
    borderRadius: 6,
    border: "1.5px solid #2A5FA5",
    boxShadow: "0px 3px 6px #9199A14D",
    backgroundColor: "#FFF",
    color: "#2A5FA5",
    "&:hover": {
      backgroundColor: "#FFF",
    },
    marginLeft: 15,
  },
  infoImages: {},
}));

const SurveyDemo = (props) => {
  const location = useLocation();
  const [survey_no, setSurveyNo] = useState("");
  const [updateCount, setUpdateCount] = useState("");
  const [org_date, setOrgDate] = useState("");
  const [org_time, setOrgTime] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [current_date, setCurrentDate] = useState("");
  const [current_time, setCurrentTime] = useState("");
  const [picture, setPicture] = useState([]);
  const [imgData, setImgData] = useState([]);
  const [survey_by, setSurveyBy] = useState("");
  const [updated_by, setUpdatedBy] = useState("");
  const [created_by, setCreatedBy] = useState("");
  const fileRef = useRef();
  const dispatch = useDispatch();
  const classes = useStyles();
  const store = useSelector((state) => state);
  const { MNRProcess, clientMaster } = store;
  const history = useHistory();
  const notify = useSnackbar().enqueueSnackbar;
  const [makeAvailable, setMakeAvailable] = useState(
    MNRProcess.mnrProcessData.survey &&
      MNRProcess.mnrProcessData.survey.is_damage === "True"
      ? "True"
      : "False"
  );
  const [tariffRow, setTariffRow] = useState([]);
  const [isHovered, setIsHovered] = useState(false);

  const [masterComponent, setMasterState] = useState([
    {
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
  ]);
  const [deletedLines, setDeletedLines] = useState([]);
  const [rejectedLines, setRejectedLines] = useState([]);
  const [file, setFile] = useState([]);

  const fileObj = [];
  const fileArray = [];
  const [openMobile, setOpenMobile] = useState(false);
  const matchesIphone = useMediaQuery("(max-width:400px)");

  const handleCloseMobile = () => setOpenMobile((prev) => !prev);
  const handleMobileClick = () => setOpenMobile(true);

  const handleChangeTextField = (index, event, keyVal) => {
    const values = [...masterComponent];
    values[index][keyVal] = event.target.value;
    if (keyVal === "measurement") {
      values[index]["unit"] = event.target.value;
    }
    setMasterState(values);
  };

  const handleChangeInput = (index, event, keyVal) => {
    const values = [...masterComponent];

    let obj = {};
    if (keyVal === "main_component") {
      values[index][keyVal] = event.target.value;
      values[index]["component_code"] = "";
      values[index]["location_code"] = "";
      values[index]["specific_location_code"] = "";
      values[index]["damage_code"] = "";
      values[index]["material_code"] = "";
      values[index]["repair_code"] = "";
      values[index]["measurement"] = "";
      values[index]["unit"] = "";
      values[index]["length_and_width"] = "";
      values[index]["quantity"] = "";
      values[index]["remarks"] = "";
      values[index]["tariff_code"] = "";
      obj = {
        parent_id:
          MNRProcess.mnrProcessData.tariff_data &&
          MNRProcess.mnrProcessData.tariff_data.parent_id,
        main_component: event.target.value,
      };

      setTariffRow(obj);
    } else if (keyVal === "component_code") {
      values[index][keyVal] = event.target.value.component_code;
      values[index]["component_description"] =
        event.target.value.component_description;
      values[index]["location_code"] = "";
      values[index]["location_description"] = "";
      values[index]["specific_location_code"] = "";
      values[index]["specific_location_description"] = "";
      values[index]["damage_code"] = "";
      values[index]["damage_description"] = "";
      values[index]["material_code"] = "";
      values[index]["material_description"] = "";
      values[index]["repair_code"] = "";
      values[index]["repair_description"] = "";
      values[index]["unit"] = "";
      values[index]["measurement"] = "";
      values[index]["length_and_width"] = "";
      values[index]["quantity"] = "";
      values[index]["remarks"] = "";
      values[index]["tariff_code"] = "";
      obj = {
        ...tariffRow,
        component_code: event.target.value.component_code,
        component_description: event.target.value.component_description,
      };
      setTariffRow(obj);
    } else if (keyVal === "location_code") {
      values[index][keyVal] = event.target.value.location_code;
      values[index]["location_description"] =
        event.target.value.location_description;
      values[index]["specific_location_code"] = "";
      values[index]["specific_location_description"] = "";
      values[index]["damage_code"] = "";
      values[index]["damage_description"] = "";
      values[index]["material_code"] = "";
      values[index]["material_description"] = "";
      values[index]["repair_code"] = "";
      values[index]["repair_description"] = "";
      values[index]["unit"] = "";
      values[index]["measurement"] = "";
      values[index]["length_and_width"] = "";
      values[index]["quantity"] = "";
      values[index]["remarks"] = "";
      values[index]["tariff_code"] = "";

      obj = {
        ...tariffRow,
        location_code: event.target.value.location_code,
        location_description: event.target.value.location_description,
      };
      setTariffRow(obj);
    } else if (keyVal === "specific_location_code") {
      values[index][keyVal] = event.target.value.specific_location_code;
      values[index]["specific_location_description"] =
        event.target.value.specific_location_description;
      values[index]["damage_code"] = "";
      values[index]["damage_description"] = "";
      values[index]["material_code"] = "";
      values[index]["material_description"] = "";
      values[index]["repair_code"] = "";
      values[index]["repair_description"] = "";
      values[index]["unit"] = "";
      values[index]["measurement"] = "";
      values[index]["length_and_width"] = "";
      values[index]["quantity"] = "";
      values[index]["remarks"] = "";
      values[index]["tariff_code"] = "";

      obj = {
        ...tariffRow,
        specific_location_code: event.target.value.specific_location_code,
        specific_location_description:
          event.target.value.specific_location_description,
      };
      setTariffRow(obj);
    } else if (keyVal === "damage_code") {
      values[index][keyVal] = event.target.value.damage_code;
      values[index]["damage_description"] =
        event.target.value.damage_description;
      values[index]["material_code"] = "";
      values[index]["material_description"] = "";
      values[index]["repair_code"] = "";
      values[index]["repair_description"] = "";
      values[index]["unit"] = "";
      values[index]["measurement"] = "";
      values[index]["length_and_width"] = "";
      values[index]["quantity"] = "";
      values[index]["remarks"] = "";
      values[index]["tariff_code"] = "";

      obj = {
        ...tariffRow,
        damage_code: event.target.value.damage_code,
        damage_description: event.target.value.damage_description,
      };

      setTariffRow(obj);
    } else if (keyVal === "material_code") {
      values[index][keyVal] = event.target.value.material_code;
      values[index]["material_description"] =
        event.target.value.material_description;
      values[index]["repair_code"] = "";
      values[index]["repair_description"] = "";
      values[index]["unit"] = "";
      values[index]["measurement"] = "";
      values[index]["length_and_width"] = "";
      values[index]["quantity"] = "";
      values[index]["remarks"] = "";
      values[index]["tariff_code"] = "";

      obj = {
        ...tariffRow,
        material_code: event.target.value.material_code,
        material_description: event.target.value.material_description,
      };

      setTariffRow(obj);
    } else if (keyVal === "repair_code") {
      values[index][keyVal] = event.target.value.repair_code;
      values[index]["repair_description"] =
        event.target.value.repair_description;
      values[index]["unit"] = "";
      values[index]["measurement"] = "";
      values[index]["length_and_width"] = "";
      values[index]["quantity"] = "";
      values[index]["remarks"] = "";
      values[index]["tariff_code"] = "";

      obj = {
        ...tariffRow,
        repair_code: event.target.value.repair_code,
        repair_description: event.target.value.repair_description,
      };

      setTariffRow(obj);
    } else if (keyVal === "measurement") {
      values[index][keyVal] = event.target.value.measurement;
      values[index]["unit"] =
        event.target.value.unit !== ""
          ? event.target.value.unit
          : event.target.value.measurement;
      values[index]["length_and_width"] = "";
      values[index]["quantity"] = "";
      values[index]["remarks"] = "";
      values[index]["tariff_code"] = "";

      obj = {
        ...tariffRow,
        unit: event.target.value.unit,
        measurement: event.target.value.measurement,
      };
      setTariffRow(obj);
    } else if (keyVal === "length_and_width") {
      values[index][keyVal] = event.target.value;
      values[index]["quantity"] = "";
      values[index]["remarks"] = "";
      values[index]["tariff_code"] = "";

      obj = {
        ...tariffRow,
        length_and_width: event.target.value,
      };

      setTariffRow(obj);
    } else if (keyVal === "quantity" || keyVal === "remarks") {
      values[index][keyVal] = event.target.value;
    }
    setMasterState(values);
    if (keyVal !== "length_and_width") {
      dispatch(getTariffRowData(obj, keyVal, index));
    }
  };

  const handleAdd = () => {
    let count = 0;
    for (var i = 0; i < masterComponent.length; i++) {
      if (
        masterComponent[i].main_component === "" ||
        masterComponent[i].component_code === "" ||
        masterComponent[i].location_code === "" ||
        masterComponent[i].specific_location_code === "" ||
        masterComponent[i].damage_code === "" ||
        masterComponent[i].material_code === "" ||
        masterComponent[i].repair_code === "" ||
        masterComponent[i].measurement === "" ||
        masterComponent[i].unit === "" ||
        masterComponent[i].length_and_width === "" ||
        masterComponent[i].quantity === "" ||
        masterComponent[i].remarks === ""
      ) {
        notify("Please fill all the fields before proceeding to the next row", {
          variant: "warning",
        });
        count = count + 1;
      }
    }
    if (count === 0) {
      setMasterState([
        ...masterComponent,
        {
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
      ]);
    }
  };
  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      handleAdd();
    }
  };
  const handleRemove = (index, pk, deleteDisabled) => {
    const values = [...masterComponent];
    let sampleArray =
      deleteDisabled === "True" ? [...rejectedLines] : [...deletedLines];
    if (values.length > 1) {
      values.splice(index, 1);
      setMasterState(values);
      dispatch({ type: "HANDLE_SURVEY_LINE_INDEX", payload: index });
      sampleArray.push(pk);
      if (deleteDisabled === "True") {
        setRejectedLines(sampleArray);
      } else {
        setDeletedLines(sampleArray);
      }
    } else {
      setMasterState([
        {
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
      ]);
      sampleArray.push(pk);
      if (deleteDisabled === "True") {
        setRejectedLines(sampleArray);
      } else {
        setDeletedLines(sampleArray);
      }
      dispatch({ type: "RESET_MNR_PROCESS_DATA" });
    }
  };

  useEffect(() => {
    if (MNRProcess.mnrProcessData.survey) {
      setSurveyNo(MNRProcess.mnrProcessData.survey.number);
      setUpdateCount(MNRProcess.mnrProcessData.survey.update_count);
      setOrgDate(MNRProcess.mnrProcessData.survey.original_date);
      setOrgTime(MNRProcess.mnrProcessData.survey.original_time);
      setDate(MNRProcess.mnrProcessData.survey.date);
      setTime(MNRProcess.mnrProcessData.survey.time);
      setCurrentDate(MNRProcess.mnrProcessData.survey.current_date);
      setCurrentTime(MNRProcess.mnrProcessData.survey.current_time);
      setSurveyBy(MNRProcess.mnrProcessData.survey.survey_by);
      setUpdatedBy(MNRProcess.mnrProcessData.survey.updated_by);
      setCreatedBy(MNRProcess.mnrProcessData.survey.created_by);
      setSurveyBy(MNRProcess.mnrProcessData.survey.survey_by);
      setMakeAvailable(MNRProcess.mnrProcessData.survey.make_available);
      MNRProcess.mnrProcessData.survey.survey_lines.length !== 0
        ? setMasterState(MNRProcess.mnrProcessData.survey.survey_lines)
        : setMasterState([
            {
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
          ]);
      MNRProcess.mnrProcessData.survey.survey_lines.length === 0 &&
        dispatch({ type: "RESET_MNR_PROCESS_DATA" });
      for (
        var i = 0;
        i < MNRProcess.mnrProcessData.survey.survey_lines.length;
        i++
      ) {
        dispatch({
          type: "MNR_COMPONENT",
          payload: { index: i, data: "filled" },
        });
      }
    }
  }, [MNRProcess.mnrProcessData]);

  const handleDateChange = (date) => {
    var selectedDate = new Date(date);
    var dd = String(selectedDate.getDate()).padStart(2, "0");
    var mm = String(selectedDate.getMonth() + 1).padStart(2, "0");
    var yyyy = selectedDate.getFullYear();
    var selectedDateFormat = yyyy + "-" + mm + "-" + dd;
    setDate(selectedDateFormat);
  };

  const isEmpty = () => {
    let demoVal = true;
    for (let i = 1; i <= masterComponent.length; i++) {
      if (
        masterComponent[i - 1].remarks !== ""
        // masterComponent[i - 1].tariff_code === ""
      ) {
        demoVal = false;
      } else {
        demoVal = true;
        break;
      }
    }
    return demoVal;
  };

  const handleSaveDraft = () => {
    if (
      MNRProcess.mnrProcessData.container_data.is_survey_import_available &&
      !MNRProcess.mnrProcessData.container_data.is_mnr_data_imported
    )
      notify("Please Import Data From Above", {
        variant: "warning",
      });
    else if (date === "")
      notify("Please Enter Survey Date", {
        variant: "warning",
      });
    else if (time === "")
      notify("Please Enter Survey Time", {
        variant: "warning",
      });
    else if (survey_by === "") {
      notify("Select Enter Survey By", {
        variant: "warning",
      });
    } else if (location.state?.import) {
      notify("Please Import data from above . ", {
        variant: "error",
      });
    } else if (
      masterComponent[0].component_code === "" ||
      (masterComponent[1] && masterComponent[1].component_code === "") ||
      (masterComponent[2] && masterComponent[2].component_code === "") ||
      (masterComponent[3] && masterComponent[3].component_code === "")
    ) {
      notify("Please fill all the fields before proceeding to the next row", {
        variant: "warning",
      });
    } else if (isEmpty()) {
      notify("Please fill all the fields before proceeding to the next row", {
        variant: "warning",
      });
    } else if (
      Object.values(masterComponent[0]).some(
        (el, index) => index !== 18 && el.tariff_code === ""
      ) ||
      (masterComponent[1] &&
        Object.values(masterComponent[1]).some(
          (el, index) => index !== 18 && el.tariff_code === ""
        )) ||
      (masterComponent[2] &&
        Object.values(masterComponent[2]).some(
          (el, index) => index !== 18 && el.tariff_code === ""
        )) ||
      (masterComponent[3] &&
        Object.values(masterComponent[3]).some(
          (el, index) => index !== 18 && el.tariff_code === ""
        ))
    ) {
      notify(
        "Please fill all the fields before clicking the Save As Draft Button",
        {
          variant: "warning",
        }
      );
    } else {
      let req = {
        stock_id:
          MNRProcess.mnrProcessData.survey &&
          MNRProcess.mnrProcessData.survey.stock_id,
        parent_id:
          MNRProcess.mnrProcessData.tariff_data &&
          MNRProcess.mnrProcessData.tariff_data.parent_id,
        make_available: makeAvailable,
        is_draft: "True",
        is_proceed: "False",
        date: date,
        time: time,
        survey_by: survey_by,
        location: localStorage.getItem("location")
          ? localStorage.getItem("location")
          : null,
        site: localStorage.getItem("site")
          ? localStorage.getItem("site")
          : null,
        survey_lines_deleted: deletedLines,
        survey_lines: masterComponent,
        labour_rate:
          MNRProcess.mnrProcessData.tariff_data &&
          MNRProcess.mnrProcessData.tariff_data.labour_rate,
        reload_container_no:
          MNRProcess.mnrProcessData.container_data &&
          MNRProcess.mnrProcessData.container_data.container_no,
        reload_container_date:
          MNRProcess.mnrProcessData.container_data &&
          MNRProcess.mnrProcessData.container_data.in_date,
      };
      dispatch(createSurvey(req, notify));
    }
  };

  const handleCreateSurvey = () => {
    if (
      MNRProcess.mnrProcessData.container_data.is_survey_import_available &&
      !MNRProcess.mnrProcessData.container_data.is_mnr_data_imported
    )
      notify("Please Import Data From Above", {
        variant: "warning",
      });
    else if (date === "")
      notify("Please Enter Survey Date", {
        variant: "warning",
      });
    else if (time === "")
      notify("Please Enter Survey Time", {
        variant: "warning",
      });
    else if (survey_by === "") {
      notify("Select Enter Survey By", {
        variant: "warning",
      });
    } else if (
      makeAvailable === "False" &&
      (masterComponent[0].component_code === "" ||
        (masterComponent[1] && masterComponent[1].component_code === "") ||
        (masterComponent[2] && masterComponent[2].component_code === "") ||
        (masterComponent[3] && masterComponent[3].component_code === ""))
    ) {
      notify("Please fill all the fields before proceeding to the next row", {
        variant: "warning",
      });
    } else if (makeAvailable === "False" && isEmpty()) {
      notify("Please fill all the fields before proceeding to the next row", {
        variant: "warning",
      });
    } else if (
      Object.values(masterComponent[0]).some(
        (el, index) => index !== 18 && el.tariff_code === ""
      ) ||
      (masterComponent[1] &&
        Object.values(masterComponent[1]).some(
          (el, index) => index !== 18 && el.tariff_code === ""
        )) ||
      (masterComponent[2] &&
        Object.values(masterComponent[2]).some(
          (el, index) => index !== 18 && el.tariff_code === ""
        )) ||
      (masterComponent[3] &&
        Object.values(masterComponent[3]).some(
          (el, index) => index !== 18 && el.tariff_code === ""
        ))
    ) {
      notify("Please fill all the fields before clicking the Proceed Button", {
        variant: "warning",
      });
    } else {
      let req = {
        stock_id:
          MNRProcess.mnrProcessData.survey &&
          MNRProcess.mnrProcessData.survey.stock_id,
        parent_id:
          MNRProcess.mnrProcessData.tariff_data &&
          MNRProcess.mnrProcessData.tariff_data.parent_id,
        make_available: makeAvailable,
        is_draft: "False",
        is_proceed: "True",
        date: date,
        time: time,
        survey_by: survey_by,
        location: localStorage.getItem("location")
          ? localStorage.getItem("location")
          : null,
        site: localStorage.getItem("site")
          ? localStorage.getItem("site")
          : null,
        survey_lines_deleted: deletedLines,
        survey_lines:
          masterComponent[0].component_code !== "" ? masterComponent : [],
        labour_rate:
          MNRProcess.mnrProcessData.tariff_data &&
          MNRProcess.mnrProcessData.tariff_data.labour_rate,
        reload_container_no:
          MNRProcess.mnrProcessData.container_data &&
          MNRProcess.mnrProcessData.container_data.container_no,
        reload_container_date:
          MNRProcess.mnrProcessData.container_data &&
          MNRProcess.mnrProcessData.container_data.in_date,
      };
      dispatch(createSurvey(req, notify));
    }
  };

  const handleUpdateSurvey = () => {
    if (date === "")
      notify("Please Enter Survey Date", {
        variant: "warning",
      });
    else if (time === "")
      notify("Please Enter Survey Time", {
        variant: "warning",
      });
    else if (survey_by === "") {
      notify("Select Enter Survey By", {
        variant: "warning",
      });
    } else if (
      makeAvailable === "False" &&
      (masterComponent[0].component_code === "" ||
        (masterComponent[1] && masterComponent[1].component_code === "") ||
        (masterComponent[2] && masterComponent[2].component_code === "") ||
        (masterComponent[3] && masterComponent[3].component_code === ""))
    ) {
      notify("Please fill all the fields before proceeding to the next row", {
        variant: "warning",
      });
    } else if (makeAvailable === "False" && isEmpty()) {
      notify("Please fill all the fields before proceeding to the next row", {
        variant: "warning",
      });
    } else if (
      Object.values(masterComponent[0]).some(
        (el, index) => index !== 18 && el.tariff_code === ""
      ) ||
      (masterComponent[1] &&
        Object.values(masterComponent[1]).some(
          (el, index) => index !== 18 && el.tariff_code === ""
        )) ||
      (masterComponent[2] &&
        Object.values(masterComponent[2]).some(
          (el, index) => index !== 18 && el.tariff_code === ""
        )) ||
      (masterComponent[3] &&
        Object.values(masterComponent[3]).some(
          (el, index) => index !== 18 && el.tariff_code === ""
        ))
    ) {
      notify("Please fill all the fields before clicking the Proceed Button", {
        variant: "warning",
      });
    } else {
      let req = {
        pk:
          MNRProcess.mnrProcessData.survey &&
          MNRProcess.mnrProcessData.survey.pk,
        stock_id:
          MNRProcess.mnrProcessData.survey &&
          MNRProcess.mnrProcessData.survey.stock_id,
        parent_id:
          MNRProcess.mnrProcessData.tariff_data &&
          MNRProcess.mnrProcessData.tariff_data.parent_id,
        make_available: makeAvailable,
        is_draft: "False",
        is_proceed: "True",
        is_uploaded: "False",
        date: date,
        time: time,
        survey_by: survey_by,
        location: localStorage.getItem("location")
          ? localStorage.getItem("location")
          : null,
        site: localStorage.getItem("site")
          ? localStorage.getItem("site")
          : null,
        survey_lines_deleted: deletedLines,
        survey_lines_rejected: rejectedLines,
        survey_lines:
          masterComponent[0].component_code !== "" ? masterComponent : [],
        labour_rate:
          MNRProcess.mnrProcessData.tariff_data &&
          MNRProcess.mnrProcessData.tariff_data.labour_rate,
        update_count: updateCount,
        reload_container_no:
          MNRProcess.mnrProcessData.container_data &&
          MNRProcess.mnrProcessData.container_data.container_no,
        reload_container_date:
          MNRProcess.mnrProcessData.container_data &&
          MNRProcess.mnrProcessData.container_data.in_date,
      };
      dispatch(updateSurvey(req, notify));
    }
  };

  const uploadMultipleFiles = (e) => {
    fileObj.push(e.target.files);
    // let fileDataUrl = URL.createObjectURL(e.target.files[0]);
    for (let i = 0; i < fileObj[0].length; i++) {
      fileArray.push(fileObj[0][i]);
    }
    setFile(fileArray);
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

  const uploadFiles = (e, type) => {
    let formData = new FormData();
    if (file.length >= 11 || mobileUpload.length >= 11) {
      notify("More then 10 Images are not acceptable", {
        variant: "warning",
      });
    } else {
      let files = [
        ...file,
        ...mobileUpload.map((val) => dataURLtoFile(val, "mobile_servey.jpg")),
      ];
      files.map((fileItem) => {
        return formData.append("file_list", fileItem);
      });
    }
    formData.append(
      "location",
      localStorage.getItem("location") ? localStorage.getItem("location") : null
    );
    formData.append(
      "site",
      localStorage.getItem("site") ? localStorage.getItem("site") : null
    );
    let addType = type === "add" ? "True" : "False";
    formData.append("add", addType);

    let reqBody = {
      pk:
        MNRProcess.mnrProcessData &&
        MNRProcess.mnrProcessData.survey &&
        MNRProcess.mnrProcessData.survey.pk,
      reload_container_no:
        MNRProcess.mnrProcessData.container_data &&
        MNRProcess.mnrProcessData.container_data.container_no,
      reload_container_date:
        MNRProcess.mnrProcessData.container_data &&
        MNRProcess.mnrProcessData.container_data.in_date,
    };
    dispatch(uploadSurveyImage(formData, reqBody, notify));
    let tempFileArray = [];
    setFile(tempFileArray);
    setMobileUpload([]);
    fileRef.current.value = "";
  };

  const handleDownloadImage = () => {
    let req = {
      image_id_list: clientMaster.check,
    };
    dispatch(
      downloadSurveyImage(
        req,
        MNRProcess.mnrProcessData &&
          MNRProcess.mnrProcessData.survey &&
          MNRProcess.mnrProcessData.survey.pk,
        notify
      )
    );
  };

  const handleDeleteImage = () => {
    let req = {
      image_id_list: clientMaster.check,
    };
    let reqBody = {
      pk:
        MNRProcess.mnrProcessData &&
        MNRProcess.mnrProcessData.survey &&
        MNRProcess.mnrProcessData.survey.pk,
      reload_container_no:
        MNRProcess.mnrProcessData.container_data &&
        MNRProcess.mnrProcessData.container_data.container_no,
      reload_container_date:
        MNRProcess.mnrProcessData.container_data &&
        MNRProcess.mnrProcessData.container_data.in_date,
    };

    dispatch(
      deleteSurveyImage(
        req,
        MNRProcess.mnrProcessData &&
          MNRProcess.mnrProcessData.survey &&
          MNRProcess.mnrProcessData.survey.pk,
        reqBody,
        notify
      )
    );
    let tempFileArray = [];
    setFile(tempFileArray);
    setMobileUpload([]);
    fileRef.current.value = "";
  };

  const [mobileUpload, setMobileUpload] = useState([]);

  function handleTakePhoto(dataUri) {
    if (mobileUpload.length >= 10) {
      notify("Upload Limit Extended ", { variant: "error" });
    }
    setMobileUpload((prev) => [...prev, dataUri]);
    // setOpenMobile(false);
  }

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

  const onChange = (imageList, addUpdateIndex) => {
    // data for submit
    console.log(imageList, addUpdateIndex);
    // setImages(imageList);
  };

  return (
    <>
      <Paper
        className={
          matchesIphone ? classes.paperContainerMobile : classes.paperContainer
        }
        elevation={0}
      >
        <Paper
          className={
            matchesIphone
              ? classes.paperContainerMobileInner
              : classes.paperContainer
          }
          elevation={2}
        >
          {MNRProcess.mnrProcessData?.container_data
            ?.is_survey_import_available === true && (
            <Stack
              flexDirection={"row"}
              direction={"row"}
              alignItems={"center"}
              justifyContent={"flex-end"}
            >
              <Tooltip title="Survey data available to Import from Surveyor . Make sure images are uploaded on the surveyor side before uploading .">
                <Button
                  variant="contained"
                  
                  style={{ backgroundColor: "#2a5fa5", color: "white"}}
                  onClick={() =>
                    dispatch(
                      getMNRProcessByImportAction(
                        MNRProcess.mnrProcessData.container_data.container_no,
                        notify,
                        history        
                      )
                    )
                  }
                >
                  Import
                </Button>
              </Tooltip>
            </Stack>
          )}
          <Grid container spacing={3}>
            <Grid item xs={6} sm={3}>
              <Typography
                variant="subtitle1"
                className={classes.LabelTypography}
              >
                Survey No
              </Typography>
              <CustomTextfield
                value={survey_no}
                handleChange={(e) => setSurveyNo(e.target.value)}
                dispatchType={"SET_MNR_SEARCH_CONTAINER_NUMBER"}
                readOnlyP
              />
            </Grid>

            <Grid item xs={6} sm={3}>
              <Typography
                variant="subtitle1"
                className={classes.LabelTypography}
              >
                Update Count
              </Typography>
              <CustomTextfield
                id="stocks-allot-container-number"
                value={updateCount}
                handleChange={(e) => setUpdateCount(e.target.value)}
                dispatchType={"SET_MNR_SEARCH_CONTAINER_NUMBER"}
                readOnlyP
              />
            </Grid>

            <Grid item xs={6} sm={3}>
              <Typography
                variant="subtitle1"
                className={classes.LabelTypography}
              >
                Original Date
              </Typography>
              <CustomTextfield
                id="stocks-allot-container-number"
                value={org_date}
                handleChange={(e) => setOrgDate(e.target.value)}
                dispatchType={"SET_MNR_SEARCH_CONTAINER_NUMBER"}
                readOnlyP
              />
            </Grid>

            <Grid item xs={6} sm={3} style={{ alignSelf: "flex-end" }}>
              <Typography
                variant="subtitle1"
                className={classes.LabelTypography}
              >
                Original Time
              </Typography>
              <CustomTextfield
                id="stocks-allot-container-number"
                value={org_time}
                handleChange={(e) => setOrgTime(e.target.value)}
                dispatchType={"SET_MNR_SEARCH_CONTAINER_NUMBER"}
                readOnlyP
              />
            </Grid>

            {MNRProcess.mnrProcessData.survey &&
            MNRProcess.mnrProcessData.survey.is_locked === "True" ? (
              <Grid item xs={6} sm={3} style={{ alignSelf: "flex-end" }}>
                <Typography
                  variant="subtitle1"
                  className={classes.LabelTypography}
                >
                  Date
                </Typography>
                <CustomTextfield
                  id="in-date"
                  handleChange={handleDateChange}
                  value={date}
                  dispatchType={"SET_IN_DATE_MNR"}
                  readOnlyP
                />
              </Grid>
            ) : (
              <Grid item xs={6} sm={3}>
                <Typography
                  variant="subtitle1"
                  className={classes.LabelTypography}
                >
                  Date <span style={{ color: "red" }}>*</span>
                </Typography>
                <DatePickerField
                  dateId="invoice-from-date"
                  dateValue={date}
                  dateChange={handleDateChange}
                />
              </Grid>
            )}

            {MNRProcess.mnrProcessData.survey &&
            MNRProcess.mnrProcessData.survey.is_locked === "True" ? (
              <Grid item xs={6} sm={3} style={{ alignSelf: "flex-end" }}>
                <Typography
                  variant="subtitle1"
                  className={classes.LabelTypography}
                >
                  Time <span style={{ color: "red" }}>*</span>
                </Typography>
                <CustomTextfield
                  id="in-time"
                  type="time"
                  handleChange={(e) => setTime(e.target.value)}
                  value={time}
                  dispatchType={"SET_IN_TIME_MNR"}
                  readOnlyP
                />
              </Grid>
            ) : (
              <Grid item xs={6} sm={3} style={{ alignSelf: "flex-end" }}>
                <Typography
                  variant="subtitle1"
                  className={classes.LabelTypography}
                >
                  Time <span style={{ color: "red" }}>*</span>
                </Typography>
                <CustomTextfield
                  id="in-time"
                  type="time"
                  handleChange={(e) => setTime(e.target.value)}
                  value={time}
                  dispatchType={"SET_IN_TIME_MNR"}
                />
              </Grid>
            )}

            <Grid item xs={6} sm={3}>
              <Typography
                variant="subtitle1"
                className={classes.LabelTypography}
              >
                Current Date
              </Typography>
              <CustomTextfield
                id="stocks-allot-container-number"
                value={current_date}
                handleChange={(e) => setCurrentDate(e.target.value)}
                dispatchType={"SET_MNR_SEARCH_CONTAINER_NUMBER"}
                readOnlyP
              />
            </Grid>

            <Grid item xs={6} sm={3} style={{ alignSelf: "flex-end" }}>
              <Typography
                variant="subtitle1"
                className={classes.LabelTypography}
              >
                Current Time
              </Typography>
              <CustomTextfield
                id="stocks-allot-container-number"
                value={current_time}
                handleChange={(e) => setCurrentTime(e.target.value)}
                dispatchType={"SET_MNR_SEARCH_CONTAINER_NUMBER"}
                readOnlyP
              />
            </Grid>

            <Grid item xs={6} sm={3} style={{ alignSelf: "flex-end" }}>
              <Typography
                variant="subtitle1"
                className={classes.LabelTypography}
              >
                Survey By <span style={{ color: "red" }}>*</span>
              </Typography>

              <TextField
                id="stock-and-allotment-location"
                select
                value={survey_by}
                variant="outlined"
                fullWidth
                inputProps={{ className: classes.input }}
                onChange={(e) => {
                  setSurveyBy(e.target.value);
                }}
                disabled={
                  MNRProcess.mnrProcessData.survey &&
                  MNRProcess.mnrProcessData.survey.is_locked === "True"
                }
              >
                {MNRProcess.mnrProcessData &&
                  MNRProcess.mnrProcessData.staff_data &&
                  MNRProcess.mnrProcessData.staff_data.surveyor_list &&
                  MNRProcess.mnrProcessData.staff_data.surveyor_list.map(
                    (option) => (
                      <MenuItem key={option.pk} value={option.pk}>
                        {option.firstName} {option.lastName}
                      </MenuItem>
                    )
                  )}
              </TextField>
            </Grid>

            <Grid item xs={6} sm={3}>
              <Typography
                variant="subtitle1"
                className={classes.LabelTypography}
              >
                Updated By
              </Typography>

              <CustomTextfield
                id="stocks-allot-container-number"
                value={updated_by}
                handleChange={(e) => setUpdatedBy(e.target.value)}
                dispatchType={"SET_MNR_SEARCH_CONTAINER_NUMBER"}
                readOnlyP
              />
            </Grid>

            <Grid item xs={6} sm={3}>
              <Typography
                variant="subtitle1"
                className={classes.LabelTypography}
              >
                Created By
              </Typography>

              <CustomTextfield
                id="stocks-allot-container-number"
                value={created_by}
                handleChange={(e) => setCreatedBy(e.target.value)}
                dispatchType={"SET_MNR_SEARCH_CONTAINER_NUMBER"}
                readOnlyP
              />
            </Grid>

            <Grid
              item
              xs={12}
              sm={3}
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Typography variant="subtitle2" style={{ paddingRight: 10 }}>
                Make Available?
              </Typography>
              <FormControlLabel
                value="yes"
                control={
                  <Radio
                    style={{ color: "#2A5FA5" }}
                    checked={makeAvailable === "True"}
                    disabled={
                      MNRProcess.mnrProcessData &&
                      MNRProcess.mnrProcessData.survey &&
                      MNRProcess.mnrProcessData.survey.pk &&
                      makeAvailable === "False"
                    }
                    onClick={() => setMakeAvailable("True")}
                  />
                }
                label="Yes"
              />
              <FormControlLabel
                value="no"
                control={
                  <Radio
                    style={{ color: "#2A5FA5" }}
                    checked={makeAvailable === "False"}
                    onClick={() => {
                      setMakeAvailable("False");
                      if (
                        MNRProcess.mnrProcessData &&
                        MNRProcess.mnrProcessData.survey &&
                        MNRProcess.mnrProcessData.survey.pk
                      ) {
                        let req = {
                          reload_container_no:
                            MNRProcess.mnrProcessData.container_data
                              .container_no,
                          reload_container_date:
                            MNRProcess.mnrProcessData.container_data.in_date,
                        };
                        dispatch(
                          makeAvailableReverse(
                            MNRProcess.mnrProcessData.survey.pk,
                            notify,
                            req
                          )
                        );
                      }
                    }}
                  />
                }
                label="No"
              />
            </Grid>
          </Grid>
        </Paper>
        <Paper
          className={
            matchesIphone
              ? classes.paperContainerMobileInner
              : classes.paperContainer1
          }
          elevation={2}
        >
          {masterComponent.map((masterState, index) => (
            <div
              key={index}
              style={{
                display: "flex",
              }}
            >
              <Grid container spacing={1}>
                <Grid item xs={4} sm={1} style={{ alignSelf: "flex-end" }}>
                  <Typography className={classes.LabelTypography}>
                    Main Component
                  </Typography>
                  {(MNRProcess.mnrProcessData &&
                    MNRProcess.mnrProcessData.survey &&
                    MNRProcess.mnrProcessData.survey.pk === "") ||
                  !masterState.pk ? (
                    <TextField
                      id="stock-and-allotment-location"
                      select
                      variant="outlined"
                      fullWidth
                      inputProps={{ className: classes.input }}
                      onChange={(event) =>
                        handleChangeInput(index, event, "main_component")
                      }
                    >
                      {MNRProcess.mnrProcessData.tariff_data &&
                        MNRProcess.mnrProcessData.tariff_data.main_component.map(
                          (option) => (
                            <MenuItem key={option} value={option}>
                              {option}
                            </MenuItem>
                          )
                        )}
                    </TextField>
                  ) : (
                    <CustomTextfield
                      id="stocks-allot-container-number"
                      value={masterState && masterState.main_component}
                      handleChange={(event) =>
                        handleChangeTextField(index, event, "main_component")
                      }
                      onBlur={(event) =>
                        handleChangeInput(index, event, "main_component")
                      }
                      dispatchType={"SET_MNR_SURVEY_MAIN_COMPONENT"}
                      readOnlyP
                    />
                  )}
                </Grid>

                <Grid item xs={4} sm={1} style={{ alignSelf: "flex-end" }}>
                  <Typography
                    variant="subtitle1"
                    className={classes.LabelTypography}
                  >
                    Component
                  </Typography>
                  {(MNRProcess.mnrProcessData &&
                    MNRProcess.mnrProcessData.survey &&
                    MNRProcess.mnrProcessData.survey.pk === "") ||
                  !masterState.pk ? (
                    <TextField
                      id="survey-comp"
                      select
                      variant="outlined"
                      fullWidth
                      inputProps={{ className: classes.input }}
                      onChange={(event) =>
                        handleChangeInput(index, event, "component_code")
                      }
                    >
                      {MNRProcess.totalSurvey[index] &&
                        MNRProcess.totalSurvey[index].componentCodes &&
                        MNRProcess.totalSurvey[index].componentCodes.map(
                          (option) => (
                            <MenuItem
                              key={option.component_description}
                              value={option}
                            >
                              {option.component_description}
                            </MenuItem>
                          )
                        )}
                    </TextField>
                  ) : (
                    <CustomTextfield
                      id="stocks-allot-container-number"
                      value={masterState && masterState.component_code}
                      handleChange={(event) =>
                        handleChangeTextField(index, event, "component_code")
                      }
                      onBlur={(event) =>
                        handleChangeInput(index, event, "component_code")
                      }
                      dispatchType={"SET_MNR_SURVEY_COMPONENT"}
                      readOnlyP
                    />
                  )}
                </Grid>

                <Grid item xs={4} sm={1} style={{ alignSelf: "flex-end" }}>
                  <Typography
                    variant="subtitle1"
                    className={classes.LabelTypography}
                  >
                    Location
                  </Typography>
                  {(MNRProcess.mnrProcessData &&
                    MNRProcess.mnrProcessData.survey &&
                    MNRProcess.mnrProcessData.survey.pk === "") ||
                  !masterState.pk ? (
                    <TextField
                      id="survey-loc"
                      select
                      variant="outlined"
                      fullWidth
                      inputProps={{ className: classes.input }}
                      onChange={(event) =>
                        handleChangeInput(index, event, "location_code")
                      }
                    >
                      {MNRProcess.totalSurvey[index] &&
                        MNRProcess.totalSurvey[index].locationCodes &&
                        MNRProcess.totalSurvey[index].locationCodes.map(
                          (option) => (
                            <MenuItem
                              key={option.location_description}
                              value={option}
                            >
                              {option.location_description}
                            </MenuItem>
                          )
                        )}
                    </TextField>
                  ) : (
                    <CustomTextfield
                      id="stocks-allot-container-number"
                      value={masterState && masterState.location_code}
                      handleChange={(event) =>
                        handleChangeTextField(
                          index,
                          event,
                          "location_description"
                        )
                      }
                      onBlur={(event) =>
                        handleChangeInput(index, event, "location_code")
                      }
                      dispatchType={"SET_MNR_SURVEY_LOCATION"}
                      readOnlyP
                    />
                  )}
                </Grid>

                <Grid item xs={4} sm={1} style={{ alignSelf: "flex-end" }}>
                  <Typography
                    variant="subtitle1"
                    className={classes.LabelTypography}
                  >
                    Specific Location
                  </Typography>
                  {(MNRProcess.mnrProcessData &&
                    MNRProcess.mnrProcessData.survey &&
                    MNRProcess.mnrProcessData.survey.pk === "") ||
                  !masterState.pk ? (
                    <TextField
                      id="survey-specific-loc"
                      select
                      variant="outlined"
                      fullWidth
                      inputProps={{ className: classes.input }}
                      onChange={(event) =>
                        handleChangeInput(
                          index,
                          event,
                          "specific_location_code"
                        )
                      }
                    >
                      {MNRProcess.totalSurvey[index] &&
                        MNRProcess.totalSurvey[index].specificLocationCodes &&
                        MNRProcess.totalSurvey[index].specificLocationCodes.map(
                          (option) => (
                            <MenuItem
                              key={option.specific_location_description}
                              value={option}
                            >
                              {option.specific_location_description}
                            </MenuItem>
                          )
                        )}
                    </TextField>
                  ) : (
                    <CustomTextfield
                      id="stocks-allot-container-number"
                      value={masterState && masterState.specific_location_code}
                      handleChange={(event) =>
                        handleChangeTextField(
                          index,
                          event,
                          "specific_location_description"
                        )
                      }
                      onBlur={(event) =>
                        handleChangeInput(
                          index,
                          event,
                          "specific_location_code"
                        )
                      }
                      dispatchType={"SET_MNR_SURVEY_SPECIFIC_LOCATION"}
                      readOnlyP
                    />
                  )}
                </Grid>

                <Grid item xs={4} sm={1} style={{ alignSelf: "flex-end" }}>
                  <Typography
                    variant="subtitle1"
                    className={classes.LabelTypography}
                  >
                    Damage
                  </Typography>
                  {(MNRProcess.mnrProcessData &&
                    MNRProcess.mnrProcessData.survey &&
                    MNRProcess.mnrProcessData.survey.pk === "") ||
                  !masterState.pk ? (
                    <TextField
                      id="stock-and-allotment-location"
                      select
                      variant="outlined"
                      fullWidth
                      inputProps={{ className: classes.input }}
                      onChange={(event) =>
                        handleChangeInput(index, event, "damage_code")
                      }
                    >
                      {MNRProcess.totalSurvey[index] &&
                        MNRProcess.totalSurvey[index].damageCodes &&
                        MNRProcess.totalSurvey[index].damageCodes.map(
                          (option) => (
                            <MenuItem
                              key={option.damage_description}
                              value={option}
                            >
                              {option.damage_description}
                            </MenuItem>
                          )
                        )}
                    </TextField>
                  ) : (
                    <CustomTextfield
                      id="stocks-allot-container-number"
                      value={masterState && masterState.damage_code}
                      handleChange={(event) =>
                        handleChangeTextField(index, event, "damage_code")
                      }
                      onBlur={(event) =>
                        handleChangeInput(index, event, "damage_code")
                      }
                      dispatchType={"SET_MNR_SURVEY_DAMAGE"}
                      readOnlyP
                    />
                  )}
                </Grid>

                <Grid item xs={4} sm={1} style={{ alignSelf: "flex-end" }}>
                  <Typography
                    variant="subtitle1"
                    className={classes.LabelTypography}
                  >
                    Material
                  </Typography>
                  {(MNRProcess.mnrProcessData &&
                    MNRProcess.mnrProcessData.survey &&
                    MNRProcess.mnrProcessData.survey.pk === "") ||
                  !masterState.pk ? (
                    <TextField
                      id="stock-and-allotment-location"
                      select
                      variant="outlined"
                      fullWidth
                      inputProps={{ className: classes.input }}
                      onChange={(event) =>
                        handleChangeInput(index, event, "material_code")
                      }
                    >
                      {MNRProcess.totalSurvey[index] &&
                        MNRProcess.totalSurvey[index].materialCodes &&
                        MNRProcess.totalSurvey[index].materialCodes.map(
                          (option) => (
                            <MenuItem
                              key={option.material_description}
                              value={option}
                            >
                              {option.material_description}
                            </MenuItem>
                          )
                        )}
                    </TextField>
                  ) : (
                    <CustomTextfield
                      id="stocks-allot-container-number"
                      value={masterState && masterState.material_code}
                      handleChange={(event) =>
                        handleChangeTextField(index, event, "material_code")
                      }
                      onBlur={(event) =>
                        handleChangeInput(index, event, "material_code")
                      }
                      dispatchType={"SET_MNR_SURVEY_MATERIAL"}
                      readOnlyP
                    />
                  )}
                </Grid>

                <Grid item xs={4} sm={1} style={{ alignSelf: "flex-end" }}>
                  <Typography
                    variant="subtitle1"
                    className={classes.LabelTypography}
                  >
                    Repair
                  </Typography>

                  {(MNRProcess.mnrProcessData &&
                    MNRProcess.mnrProcessData.survey &&
                    MNRProcess.mnrProcessData.survey.pk === "") ||
                  !masterState.pk ? (
                    <TextField
                      id="stock-and-allotment-location"
                      select
                      variant="outlined"
                      fullWidth
                      inputProps={{ className: classes.input }}
                      onChange={(event) =>
                        handleChangeInput(index, event, "repair_code")
                      }
                    >
                      {MNRProcess.totalSurvey[index] &&
                        MNRProcess.totalSurvey[index].repairCodes &&
                        MNRProcess.totalSurvey[index].repairCodes.map(
                          (option) => (
                            <MenuItem
                              key={option.repair_description}
                              value={option}
                            >
                              {option.repair_description}
                            </MenuItem>
                          )
                        )}
                    </TextField>
                  ) : (
                    <CustomTextfield
                      id="stocks-allot-container-number"
                      value={masterState && masterState.repair_code}
                      handleChange={(event) =>
                        handleChangeTextField(index, event, "repair_code")
                      }
                      onBlur={(event) =>
                        handleChangeInput(index, event, "repair_code")
                      }
                      dispatchType={"SET_MNR_SURVEY_REPAIR"}
                      readOnlyP
                    />
                  )}
                </Grid>

                <Grid item xs={4} sm={1} style={{ alignSelf: "flex-end" }}>
                  <Typography
                    variant="subtitle1"
                    className={classes.LabelTypography}
                  >
                    Measurement
                  </Typography>
                  {(MNRProcess.mnrProcessData &&
                    MNRProcess.mnrProcessData.survey &&
                    MNRProcess.mnrProcessData.survey.pk === "") ||
                  !masterState.pk ? (
                    MNRProcess.totalSurvey[index] &&
                    MNRProcess.totalSurvey[index].measurementCodes &&
                    MNRProcess.totalSurvey[index].measurementCodes[0] &&
                    // MNRProcess.totalSurvey[index].measurementCodes[0]
                    // .measurement !== "" ||
                    MNRProcess.totalSurvey[index].measurementCodes[0]
                      .measurement !== null ? (
                      <TextField
                        id="stock-and-allotment-measurement"
                        select
                        // value={masterState.measurement}
                        variant="outlined"
                        fullWidth
                        inputProps={{ className: classes.input }}
                        onChange={(event) =>
                          handleChangeInput(index, event, "measurement")
                        }
                      >
                        {MNRProcess.totalSurvey[index] &&
                          MNRProcess.totalSurvey[index].measurementCodes &&
                          MNRProcess.totalSurvey[index].measurementCodes.map(
                            (option) => (
                              <MenuItem key={option.measurement} value={option}>
                                {option.measurement}
                              </MenuItem>
                            )
                          )}
                      </TextField>
                    ) : (
                      <CustomTextfield
                        id="stocks-allot-container-number"
                        value={masterState && masterState.measurement}
                        handleChange={(event) =>
                          handleChangeTextField(index, event, "measurement")
                        }
                        onBlur={(event) =>
                          handleChangeInput(index, event, "measurement")
                        }
                        dispatchType={"SET_MNR_SURVEY_MEASUREMENT"}
                      />
                    )
                  ) : (
                    <CustomTextfield
                      id="stocks-allot-container-number"
                      value={masterState.unit}
                      handleChange={(event) => {
                        handleChangeTextField(index, event, "measurement");
                        handleChangeTextField(index, event, "unit");
                      }}
                      onBlur={(event) => {
                        handleChangeInput(index, event, "measurement");
                      }}
                      dispatchType={"SET_MNR_SURVEY_MEASUREMENT"}
                      readOnlyP
                    />
                  )}
                </Grid>
                <Grid item xs={4} sm={1} style={{ alignSelf: "flex-end" }}>
                  <Typography
                    variant="subtitle1"
                    className={classes.LabelTypography}
                  >
                    L/W
                  </Typography>

                  {(MNRProcess.mnrProcessData &&
                    MNRProcess.mnrProcessData.survey &&
                    MNRProcess.mnrProcessData.survey.pk === "") ||
                  !masterState.pk ? (
                    MNRProcess.totalSurvey[index] &&
                    MNRProcess.totalSurvey[index].lengthWidthCodes &&
                    MNRProcess.totalSurvey[index].lengthWidthCodes[0] &&
                    MNRProcess.totalSurvey[index].lengthWidthCodes[0]
                      .length_and_width !== "" ? (
                      <TextField
                        id="stock-and-allotment-location"
                        select
                        value={masterState.length_and_width}
                        variant="outlined"
                        fullWidth
                        inputProps={{ className: classes.input }}
                        onChange={(event) =>
                          handleChangeInput(index, event, "length_and_width")
                        }
                      >
                        {MNRProcess.totalSurvey[index] &&
                          MNRProcess.totalSurvey[index].lengthWidthCodes &&
                          MNRProcess.totalSurvey[index].lengthWidthCodes.map(
                            (option) => (
                              <MenuItem
                                key={option.length_and_width}
                                value={option.length_and_width}
                              >
                                {option.length_and_width}
                              </MenuItem>
                            )
                          )}
                      </TextField>
                    ) : (
                      <CustomTextfield
                        id="stocks-allot-container-number"
                        value={masterState.length_and_width}
                        onBlur={(event) =>
                          handleChangeInput(index, event, "length_and_width")
                        }
                        handleChange={(event) =>
                          handleChangeTextField(
                            index,
                            event,
                            "length_and_width"
                          )
                        }
                        dispatchType={"SET_MNR_SURVEY_LW"}
                      />
                    )
                  ) : (
                    <CustomTextfield
                      id="stocks-allot-container-number"
                      value={masterState.length_and_width}
                      onBlur={(event) =>
                        handleChangeInput(index, event, "length_and_width")
                      }
                      handleChange={(event) =>
                        handleChangeTextField(index, event, "length_and_width")
                      }
                      dispatchType={"SET_MNR_SURVEY_LW"}
                      readOnlyP
                    />
                  )}
                </Grid>

                <Grid
                  item
                  xs={4}
                  sm={2}
                  style={{
                    alignSelf: "flex-end",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "flex-end",
                  }}
                  spacing={3}
                >
                  <Tooltip title={masterState.quantity}>
                    <Grid style={{ paddingRight: "1px" }} sm={5}>
                      <Typography
                        variant="subtitle1"
                        className={classes.LabelTypography}
                      >
                        Qty
                      </Typography>
                      {(MNRProcess.mnrProcessData &&
                        MNRProcess.mnrProcessData.survey &&
                        MNRProcess.mnrProcessData.survey.pk === "") ||
                      !masterState.pk ? (
                        <CustomTextfield
                          id="stocks-allot-container-number"
                          value={masterState.quantity}
                          type={"number"}
                          handleChange={(event) =>
                            handleChangeTextField(index, event, "quantity")
                          }
                          onBlur={(event) =>
                            handleChangeInput(index, event, "quantity")
                          }
                          dispatchType={"SET_MNR_SURVEY_QUANTITY"}
                        />
                      ) : (
                        <CustomTextfield
                          id="stocks-allot-container-number"
                          value={masterState.quantity}
                          type={"number"}
                          handleChange={(event) =>
                            handleChangeTextField(index, event, "quantity")
                          }
                          onBlur={(event) =>
                            handleChangeInput(index, event, "quantity")
                          }
                          dispatchType={"SET_MNR_SURVEY_QUANTITY"}
                          readOnlyP
                        />
                      )}
                    </Grid>
                  </Tooltip>

                  <Grid sm={3}>
                    <Typography
                      variant="subtitle1"
                      className={classes.LabelTypography}
                    >
                      Remark
                    </Typography>
                    {(MNRProcess.mnrProcessData &&
                      MNRProcess.mnrProcessData.survey &&
                      MNRProcess.mnrProcessData.survey.pk === "") ||
                    !masterState.pk ? (
                      <CustomTextfield
                        id="stocks-allot-container-number"
                        value={masterState.remarks}
                        handleChange={(event) =>
                          handleChangeTextField(index, event, "remarks")
                        }
                        onBlur={(event) =>
                          handleChangeInput(index, event, "remarks")
                        }
                        dispatchType={"SET_MNR_SURVEY_REMARK"}
                      />
                    ) : (
                      <CustomTextfield
                        id="stocks-allot-container-number"
                        value={masterState.remarks}
                        handleChange={(event) =>
                          handleChangeTextField(index, event, "remarks")
                        }
                        onBlur={(event) =>
                          handleChangeInput(index, event, "remarks")
                        }
                        dispatchType={"SET_MNR_SURVEY_REMARK"}
                        readOnlyP
                      />
                    )}
                  </Grid>
                  <Grid
                    item
                    xs={4}
                    sm={4}
                    style={{
                      alignSelf: "flex-end",
                    }}
                  >
                    <Grid>
                      <Typography
                        variant="subtitle1"
                        className={classes.LabelTypography}
                      >
                        Tariff Code
                      </Typography>
                      <CustomTextfield
                        id="mnr-tariff-code"
                        value={masterState.tariff_code}
                        handleChange={(event) =>
                          handleChangeTextField(index, event, "tariff_code")
                        }
                        onBlur={(event) =>
                          handleChangeInput(index, event, "tariff_code")
                        }
                        dispatchType={"SET_MNR_SURVEY_TARIFF_CODE"}
                        readOnlyP
                      />
                    </Grid>
                  </Grid>
                </Grid>

                {MNRProcess.mnrProcessData.survey &&
                MNRProcess.mnrProcessData.survey.is_locked === "True" ? null : (
                  <Grid item xs={4} sm={1} style={{ alignSelf: "flex-end" }}>
                    <Typography
                      variant="subtitle1"
                      className={classes.LabelTypography}
                    >
                      Action
                    </Typography>
                    <div style={{ display: "flex" }}>
                      <IconButton onKeyPress={handleKeyPress}>
                        <AddBoxIcon
                          onClick={() => handleAdd()}
                          style={{ color: "green" }}
                        />
                      </IconButton>
                      {masterState.isRejected !== "True" && (
                        <IconButton>
                          <DeleteForeverIcon
                            onClick={() =>
                              handleRemove(
                                index,
                                masterState.pk,
                                masterState.delete_disabled
                              )
                            }
                            style={{ color: "red" }}
                          />
                        </IconButton>
                      )}
                    </div>
                  </Grid>
                )}
              </Grid>
            </div>
          ))}
        </Paper>
        {MNRProcess.mnrProcessData &&
          MNRProcess.mnrProcessData.survey &&
          MNRProcess.mnrProcessData.survey.all_rejected_survey_lines &&
          MNRProcess.mnrProcessData.survey.all_rejected_survey_lines.length >
            0 && (
            <>
              <Typography
                variant="subtitle1"
                className={classes.LabelTypography}
              >
                Rejected Lines
              </Typography>
              <Paper className={classes.paperContainer1} elevation={2}>
                {MNRProcess.mnrProcessData &&
                  MNRProcess.mnrProcessData.survey.all_rejected_survey_lines.map(
                    (masterState, index) => (
                      <div
                        key={index}
                        style={{
                          display: "flex",
                        }}
                      >
                        <Grid container spacing={1}>
                          <Grid
                            item
                            xs={4}
                            sm={2}
                            style={{ alignSelf: "flex-end" }}
                          >
                            <Typography className={classes.LabelTypography}>
                              Main Component
                            </Typography>

                            <CustomTextfield
                              id="stocks-allot-container-number"
                              value={masterState && masterState.main_component}
                              handleChange={(event) =>
                                handleChangeTextField(
                                  index,
                                  event,
                                  "main_component"
                                )
                              }
                              onBlur={(event) =>
                                handleChangeInput(
                                  index,
                                  event,
                                  "main_component"
                                )
                              }
                              dispatchType={"SET_MNR_SURVEY_MAIN_COMPONENT"}
                              readOnlyP
                            />
                          </Grid>

                          <Grid
                            item
                            xs={4}
                            sm={1}
                            style={{ alignSelf: "flex-end" }}
                          >
                            <Typography
                              variant="subtitle1"
                              className={classes.LabelTypography}
                            >
                              Component
                            </Typography>

                            <CustomTextfield
                              id="stocks-allot-container-number"
                              value={masterState && masterState.component_code}
                              handleChange={(event) =>
                                handleChangeTextField(
                                  index,
                                  event,
                                  "component_code"
                                )
                              }
                              onBlur={(event) =>
                                handleChangeInput(
                                  index,
                                  event,
                                  "component_code"
                                )
                              }
                              dispatchType={"SET_MNR_SURVEY_COMPONENT"}
                              readOnlyP
                            />
                          </Grid>

                          <Grid
                            item
                            xs={4}
                            sm={1}
                            style={{ alignSelf: "flex-end" }}
                          >
                            <Typography
                              variant="subtitle1"
                              className={classes.LabelTypography}
                            >
                              Location
                            </Typography>

                            <CustomTextfield
                              id="stocks-allot-container-number"
                              value={masterState && masterState.location_code}
                              handleChange={(event) =>
                                handleChangeTextField(
                                  index,
                                  event,
                                  "location_description"
                                )
                              }
                              onBlur={(event) =>
                                handleChangeInput(index, event, "location_code")
                              }
                              dispatchType={"SET_MNR_SURVEY_LOCATION"}
                              readOnlyP
                            />
                          </Grid>

                          <Grid
                            item
                            xs={4}
                            sm={1}
                            style={{ alignSelf: "flex-end" }}
                          >
                            <Typography
                              variant="subtitle1"
                              className={classes.LabelTypography}
                            >
                              Specific Location
                            </Typography>

                            <CustomTextfield
                              id="stocks-allot-container-number"
                              value={
                                masterState &&
                                masterState.specific_location_code
                              }
                              handleChange={(event) =>
                                handleChangeTextField(
                                  index,
                                  event,
                                  "specific_location_description"
                                )
                              }
                              onBlur={(event) =>
                                handleChangeInput(
                                  index,
                                  event,
                                  "specific_location_code"
                                )
                              }
                              dispatchType={"SET_MNR_SURVEY_SPECIFIC_LOCATION"}
                              readOnlyP
                            />
                          </Grid>

                          <Grid
                            item
                            xs={4}
                            sm={1}
                            style={{ alignSelf: "flex-end" }}
                          >
                            <Typography
                              variant="subtitle1"
                              className={classes.LabelTypography}
                            >
                              Damage
                            </Typography>

                            <CustomTextfield
                              id="stocks-allot-container-number"
                              value={masterState && masterState.damage_code}
                              handleChange={(event) =>
                                handleChangeTextField(
                                  index,
                                  event,
                                  "damage_code"
                                )
                              }
                              onBlur={(event) =>
                                handleChangeInput(index, event, "damage_code")
                              }
                              dispatchType={"SET_MNR_SURVEY_DAMAGE"}
                              readOnlyP
                            />
                          </Grid>

                          <Grid
                            item
                            xs={4}
                            sm={1}
                            style={{ alignSelf: "flex-end" }}
                          >
                            <Typography
                              variant="subtitle1"
                              className={classes.LabelTypography}
                            >
                              Material
                            </Typography>

                            <CustomTextfield
                              id="stocks-allot-container-number"
                              value={masterState && masterState.material_code}
                              handleChange={(event) =>
                                handleChangeTextField(
                                  index,
                                  event,
                                  "material_code"
                                )
                              }
                              onBlur={(event) =>
                                handleChangeInput(index, event, "material_code")
                              }
                              dispatchType={"SET_MNR_SURVEY_MATERIAL"}
                              readOnlyP
                            />
                          </Grid>

                          <Grid
                            item
                            xs={4}
                            sm={1}
                            style={{ alignSelf: "flex-end" }}
                          >
                            <Typography
                              variant="subtitle1"
                              className={classes.LabelTypography}
                            >
                              Repair
                            </Typography>

                            <CustomTextfield
                              id="stocks-allot-container-number"
                              value={masterState && masterState.repair_code}
                              handleChange={(event) =>
                                handleChangeTextField(
                                  index,
                                  event,
                                  "repair_code"
                                )
                              }
                              onBlur={(event) =>
                                handleChangeInput(index, event, "repair_code")
                              }
                              dispatchType={"SET_MNR_SURVEY_REPAIR"}
                              readOnlyP
                            />
                          </Grid>

                          <Grid
                            item
                            xs={4}
                            sm={1}
                            style={{ alignSelf: "flex-end" }}
                          >
                            <Typography
                              variant="subtitle1"
                              className={classes.LabelTypography}
                            >
                              Measurement
                            </Typography>

                            <CustomTextfield
                              id="stocks-allot-container-number"
                              value={masterState.unit}
                              handleChange={(event) => {
                                handleChangeTextField(
                                  index,
                                  event,
                                  "measurement"
                                );
                                handleChangeTextField(index, event, "unit");
                              }}
                              onBlur={(event) => {
                                handleChangeInput(index, event, "measurement");
                              }}
                              dispatchType={"SET_MNR_SURVEY_MEASUREMENT"}
                              readOnlyP
                            />
                          </Grid>

                          <Grid
                            item
                            xs={4}
                            sm={1}
                            style={{ alignSelf: "flex-end" }}
                          >
                            <Typography
                              variant="subtitle1"
                              className={classes.LabelTypography}
                            >
                              L/W
                            </Typography>

                            <CustomTextfield
                              id="stocks-allot-container-number"
                              value={masterState.length_and_width}
                              onBlur={(event) =>
                                handleChangeInput(
                                  index,
                                  event,
                                  "length_and_width"
                                )
                              }
                              handleChange={(event) =>
                                handleChangeTextField(
                                  index,
                                  event,
                                  "length_and_width"
                                )
                              }
                              dispatchType={"SET_MNR_SURVEY_LW"}
                              readOnlyP
                            />
                          </Grid>

                          <Grid
                            item
                            xs={4}
                            sm={1}
                            style={{
                              alignSelf: "flex-end",
                              display: "flex",
                              justifyContent: "center",
                              alignItems: "flex-end",
                            }}
                          >
                            <Grid style={{ paddingRight: "3px" }}>
                              <Typography
                                variant="subtitle1"
                                className={classes.LabelTypography}
                              >
                                Qty
                              </Typography>

                              <CustomTextfield
                                id="stocks-allot-container-number"
                                value={masterState.quantity}
                                type={"number"}
                                handleChange={(event) =>
                                  handleChangeTextField(
                                    index,
                                    event,
                                    "quantity"
                                  )
                                }
                                onBlur={(event) =>
                                  handleChangeInput(index, event, "quantity")
                                }
                                dispatchType={"SET_MNR_SURVEY_QUANTITY"}
                                readOnlyP
                              />
                            </Grid>
                            <Grid>
                              <Typography
                                variant="subtitle1"
                                className={classes.LabelTypography}
                              >
                                Remark
                              </Typography>

                              <CustomTextfield
                                id="stocks-allot-container-number"
                                value={masterState.remarks}
                                handleChange={(event) =>
                                  handleChangeTextField(index, event, "remarks")
                                }
                                onBlur={(event) =>
                                  handleChangeInput(index, event, "remarks")
                                }
                                dispatchType={"SET_MNR_SURVEY_REMARK"}
                                readOnlyP
                              />
                            </Grid>
                          </Grid>

                          <Grid
                            item
                            xs={4}
                            sm={1}
                            style={{ alignSelf: "flex-end" }}
                          >
                            <Typography
                              variant="subtitle1"
                              className={classes.LabelTypography}
                            >
                              Tariff Code
                            </Typography>

                            <CustomTextfield
                              id="stocks-allot-container-number"
                              value={masterState.tariff_code}
                              handleChange={(event) =>
                                handleChangeTextField(
                                  index,
                                  event,
                                  "tariff_code"
                                )
                              }
                              onBlur={(event) =>
                                handleChangeInput(index, event, "tariff_code")
                              }
                              dispatchType={"SET_MNR_SURVEY_TARIFF_CODE"}
                              readOnlyP
                            />
                          </Grid>
                        </Grid>
                      </div>
                    )
                  )}
              </Paper>
            </>
          )}
        <Grid
          container
          spacing={3}
          style={{
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Grid
            item
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              width: "100%",
            }}
          >
            {MNRProcess.mnrProcessData.survey &&
              MNRProcess.mnrProcessData.survey.is_proceed === "False" && (
                <Button
                  className={classes.searchButton}
                  onClick={handleSaveDraft}
                  disabled={makeAvailable === "True" ? true : false}
                >
                  Save As Draft
                </Button>
              )}
            {MNRProcess.mnrProcessData.survey &&
            MNRProcess.mnrProcessData.survey.is_proceed === "True" ? (
              <Button
                className={classes.searchButton2}
                onClick={handleUpdateSurvey}
                disabled={
                  MNRProcess.mnrProcessData.survey &&
                  MNRProcess.mnrProcessData.survey.is_locked === "True"
                }
              >
                Update
              </Button>
            ) : (
              <Button
                className={classes.searchButton2}
                onClick={handleCreateSurvey}
              >
                Proceed
              </Button>
            )}
          </Grid>
        </Grid>
        {MNRProcess.mnrProcessData.survey?.is_proceed === "True" && (
          <>
            {/* {MNRProcess.mnrProcessData.survey?.survey_images.length === 0 && (
              <Typography
                variant="h6"
                style={{ color: "red", marginBottom: "10px" }}
              >
                Upload Images to Proceed to next Stage
              </Typography>
            )} */}
            <Paper className={classes.paperContainer1} elevation={2}>
              <Typography
                variant="subtitle1"
                className={classes.LabelTypography}
              >
                Upload before Survey Image
              </Typography>
              <form>
                <Stack
                  spacing={5}
                  className="form-group"
                  direction={"row"}
                  alignItems={"center"}
                  justifyContent={"flex-start"}
                >
                  <input
                    type="file"
                    className="form-control"
                    onChange={onChangePicture}
                    multiple
                    ref={fileRef}
                    style={{ width: "300px" }}
                  />
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
                          mobileUpload.length
                            ? mobileUpload.length + " File"
                            : ""
                        }`}{" "}
                      </Typography>
                    }
                    style={{ backgroundColor: "#fdbd2e" }}
                    onClick={handleMobileClick}
                  >
                    Camera Upload
                  </Button>

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
                          endIcon={
                            <CheckCircleOutlineIcon style={{ fill: "green" }} />
                          }
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
                        {/* <Button
                            variant="contained"
                            color="secondary"
                            className={classes.mobileSave}
                            onClick={handleCloseMobile}
                          >
                            Save
                          </Button> */}
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
                </Stack>
                {MNRProcess.mnrProcessData.survey &&
                MNRProcess?.mnrProcessData?.survey?.is_img_uploaded ===
                  "False" ? (
                  <Button
                    className={classes.searchButton}
                    onClick={(e) => {
                      uploadFiles(e, "upload");
                    }}
                  >
                    Upload
                  </Button>
                ) : (
                  ""
                )}
                {MNRProcess.mnrProcessData.survey &&
                MNRProcess?.mnrProcessData?.survey?.is_img_uploaded ===
                  "True" ? (
                  <div>
                    <Button
                      className={classes.searchButton}
                      style={{ marginLeft: 25, backgroundColor: "#2A5FA5" }}
                      onClick={(e) => {
                        uploadFiles(e, "add");
                      }}
                    >
                      Add
                    </Button>
                    <Button
                      className={classes.searchButton}
                      style={{ marginLeft: 25, backgroundColor: "#2A5FA5" }}
                      onClick={(e) => {
                        uploadFiles(e, "replace");
                      }}
                    >
                      Replace
                    </Button>

                    <Tooltip title="Check the Add andd Replace button logic">
                      <IconButton
                        onMouseEnter={() => setIsHovered(true)}
                        onMouseLeave={() => setIsHovered(false)}
                      >
                        <InfoIcon
                          style={{ color: "#2A5FA5", height: 20, width: 20 }}
                        />
                      </IconButton>
                    </Tooltip>
                    {isHovered && (
                      <p style={{ color: "red", marginTop: "10px" }}>
                        Add - Click this when you want images to merge into the
                        existing set of already uploaded images and this is also
                        used while while uploading images for the first time
                      </p>
                    )}
                    {isHovered && (
                      <p style={{ color: "red" }}>
                        Replace - Click this when you want to images to replace
                        the existing set of uploaded images and this always
                        appears after upload the first set of images.
                      </p>
                    )}
                  </div>
                ) : (
                  ""
                )}
              </form>
            </Paper>
            <Paper>
              <Grid className={classes.containerWrapperImage}>
                {MNRProcess.mnrProcessData.survey &&
                  MNRProcess.mnrProcessData.survey.survey_images?.map(
                    (item, key) => {
                      return (
                        <div>
                          {item?.pk && (
                            <Grid index={key}>
                              <Checkbox id={item.pk} value={item.pk} />
                              <Image
                                src={item.s3_image_link}
                                className={classes.backImage}
                                style={{
                                  background:
                                    "linear-gradient(rgba(0, 0, 0, 0.5),rgba(0, 0, 0, 0.5))",
                                }}
                              />
                            </Grid>
                          )}
                        </div>
                      );
                    }
                  )}
              </Grid>
              {MNRProcess.mnrProcessData.survey && (
                <Grid className={classes.containerWrapper}>
                  <Button
                    className={classes.searchButton2}
                    onClick={handleDownloadImage}
                  >
                    Download
                  </Button>
                  <Button
                    className={classes.searchButton2}
                    style={{ backgroundColor: "#a52a2a" }}
                    onClick={handleDeleteImage}
                  >
                    Delete
                  </Button>
                </Grid>
              )}
            </Paper>
          </>
        )}
      </Paper>
    </>
  );
};

export default SurveyDemo;
