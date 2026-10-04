import React, { useState, useEffect } from "react";
import {
  makeStyles,
  Typography,
  Paper,
  TextField,
  MenuItem,
  Grid,
  Button,
  FormControlLabel,
  Radio,
  InputBase,
  ClickAwayListener,
  List,
  ListItem,
  ListItemText,
  Select,
  Box,
  Modal,
  useMediaQuery,
  FormControl,
  InputLabel,
  Switch,
  Divider,
  Tooltip,
  Chip,
} from "@material-ui/core";
import { useDispatch, useSelector } from "react-redux";
import {
  getMNRGrid,
  addNonDepotContainer,
  addNonDepotContainerUpdate,
  nonDepotContainerValidatorDispatch,
  nonDepotContainerSearchDispatch,
  getNonDepotContainerByDateDispatch,
} from "../actions/MNRGridActions";
import CustomTextfield from "./reusableComponents/GateInTextField";
import DatePickerField from "./reusableComponents/DatePickerField";
import IconButton from "@material-ui/core/IconButton";
import SearchIcon from "@material-ui/icons/Search";
import { useSnackbar } from "notistack";
import {
  ContainerSurveyGetNONDEPOTAction,
  dropDownContainerAction,
  dropDownDispatch,
} from "../actions/GateInActions";
import {
  uploadEstimateDestim,
  downloadRejectedEstimateDestim,
} from "../actions/MNRWestimDestimActions";
import { getMNRStatementExcel } from "../actions/StocksAndAllotmentActions";
import Rejected from "@material-ui/icons/GetApp";
import MNRSearchModal from "./MNRSearchModal";
import ClearIcon from "@material-ui/icons/Clear";
import InfoIcon from "@material-ui/icons/Info";
import ContainerListModal from "../components/ContainerListModal";
import { Autocomplete, Stack } from "@mui/material";
import ImportExportIcon from "@material-ui/icons/ImportExport";
import AddCircleOutlineIcon from "@material-ui/icons/AddCircleOutline";
import { useHistory } from "react-router-dom";
import { theme } from "../App";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "60%",
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
};

const useStyles = makeStyles((theme) => ({
  paperContainer: {
    padding: theme.spacing(2, 3),
    marginBottom: 20,
  },
  paperContainerMNR: {
    padding: theme.spacing(2.5),
    borderRadius: 10,
    marginBottom: "40px",
    [theme.breakpoints.down("md")]: {
      padding: theme.spacing(2.5),
      width: "98%",
      marginLeft: "auto",
      marginRight: "auto",
    },
    [theme.breakpoints.down("sm")]: {
      padding: theme.spacing(2.5),
      width: "98%",
      marginLeft: "auto",
      marginRight: "auto",
    },
  },
  input: {
    padding: 7,
    borderColor: "black",
    "& .MuiInputBase-input": {
      width: "300px",
    },
    [theme.breakpoints.down("xs")]: {
      "& .MuiInputBase-input": {
        width: "100%",
        fontSize: "0.8rem",
        padding: 1,
      },
    },
  },
  selectTextField: {
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
  },
  searchButton: {
    backgroundColor: "#FE5E37",
    color: "#fff",
    borderRadius: "0.5rem",
    padding: "1px 2px",
    height: 40,
    fontSize: 16,
    marginLeft: "20px",
    marginRight: "auto",
    width: "250px",
    marginTop: "8px",
    boxShadow: "0px 3px 6px #9199A14D",
    "&:hover": {
      backgroundColor: "#FE5E37",
      color: "#fff",
    },
    [theme.breakpoints.down("md")]: {
      height: 40,
      fontSize: "1rem",
      width: "250px",
    },
    [theme.breakpoints.down("xs")]: {
      height: 30,
      fontSize: "0.8rem",
      width: "200px",
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
    width: "35%",
    border: "1.5px solid #FDBD2E",
    boxShadow: "0px 3px 6px #9199A14D",
    "&:hover": {
      backgroundColor: "#2A5FA5",
      color: "#fff",
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
  searchPaperMenu: {
    padding: "1px 4px",
    margin: 5,
    display: "flex",
    alignItems: "center",
    height: 45,
    borderRadius: "40px",
    width: "100%",
    "& .MuiPaper-root.MuiMenu-paper.MuiPopover-paper.MuiPaper-elevation8.MuiPaper-rounded":
      {
        marginTop: "123px !important",
      },
    [theme.breakpoints.down("md")]: {
      width: "100%",
    },
    [theme.breakpoints.down("xs")]: {
      height: 35,
      width: "100%",
      marginTop: "2rem",
    },
  },

  addButton: {
    backgroundColor: "#FDBD2E",
    color: "#fff",
    borderRadius: "0.5rem",
    padding: "1px 4px",
    height: 40,
    width: "100%",
    border: "1.5px solid #2A5FA5",
    boxShadow: "0px 3px 6px #9199A14D",
    "&:hover": {
      backgroundColor: "#FDBD2E",
      color: "#fff",
    },
    [theme.breakpoints.down("xs")]: {
      paddingRight: 3,
      height: 35,
    },
  },
  searchResultContainer: {
    position: "absolute",
    top: 50,
    left: 0,
    width: "100%",
    zIndex: 10,
    borderTopRightRadius: 0,
    borderTopLeftRadius: 0,
  },
  noResultText: {
    padding: theme.spacing(1.5),
    textAlign: "center",
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
  searchMNR: {
    padding: theme.spacing(2.5),
    borderRadius: 10,
    [theme.breakpoints.down("sm")]: {
      padding: theme.spacing(1),
      width: "98%",
      marginLeft: "auto",
      marginRight: "auto",
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
  autocomplete: {
    "& .MuiAutocomplete-inputRoot[class*='MuiOutlinedInput-root']": {
      padding: 0,
    },
  },
  searchMNRButton: {
    margin: 5,
    backgroundColor: "#FDBD2E",
    color: "#fff",
    borderRadius: "0.5rem",
    padding: "1px 4px",
    height: 40,
    width: "100%",
    "&:hover": {
      backgroundColor: "#FDBD2E",
      color: "#fff",
    },
    [theme.breakpoints.down("xs")]: {
      paddingRight: 3,
      height: 35,
    },
  },
  button: {
    background: "lightgreen",
    margin: 10,
  },
  button2: {
    background: "#FFCCCB",
    margin: 10,
  },
  destimErrorMsg: {
    paddingTop: 15,
    color: "red",
  },
  searchMenuItemPaper: {
    width: "20px",
    marginRight: "20px",
    marginLeft: "20px",
    border: "none",
    paddingRight: "12px",
    "& .MuiPaper-root.MuiMenu-paper.MuiPopover-paper.MuiPaper-elevation8.MuiPaper-rounded":
      {
        marginTop: "123px !important",
      },
    "&:before": {
      borderBottom: "none",
    },
    "&:focus": {
      borderBottom: "none",
    },
    "&:hover": {
      borderBottom: "none",
    },
    "&:.MuiSelect-selectMenu": {
      textOverflow: "0px !important",
    },
  },
  selectDropdown: {
    backgroundColor: "none",
    width: "100%",
  },
  modalPopUp: {
    top: "20%",
    position: "absolute",
    background: "#FFF",
    width: "85%",
    height: "60%",
    margin: "auto",
    left: "10%",
    padding: "15px 25px",
    pointerEvents: "painted",
    [theme.breakpoints.down("xs")]: {
      overflowY: "scroll",
      borderRadius: "10px",
      top: "10%",
      width: "85%",
      height: "80%",
    },
  },
  clearIcon: {
    float: "right",
    cursor: "pointer",
  },
  searchPaperList: {
    padding: "1px 4px",
    margin: 5,
    display: "flex",
    alignItems: "center",
    height: 45,
    width: "400px",
    borderRadius: "40px",
    "& .MuiPaper-root.MuiMenu-paper.MuiPopover-paper.MuiPaper-elevation8.MuiPaper-rounded":
      {
        marginTop: "123px !important",
      },
    [theme.breakpoints.down("xs")]: {
      height: 35,
    },
  },
  // iconButton: {
  //   float: "left",
  //   position: "absolute",
  //   left: "645px",
  //   [theme.breakpoints.down("xs")]: {
  //     left: "auto",
  //     right:"50px"
  //   },
  // },
}));

const numberExpression = /^\d+$/;

const MNRGridFilter = (props) => {
  const classes = useStyles();

  const dispatch = useDispatch();
  const store = useSelector((state) => state);
  const notify = useSnackbar().enqueueSnackbar;
  const history = useHistory();

  const { gateIn, MNREdit, user, MNRGridSearch, MNR } = store;

  const [searchText, setSearch] = React.useState("");
  const [showDropdown, setDropdown] = React.useState(false);
  const [type, setType] = useState("");
  const [size, setSize] = useState("");
  // eslint-disable-next-line no-unused-vars
  const [Location, setLocation] = useState(user.location ? user.location : "");
  // eslint-disable-next-line no-unused-vars
  const [site, setSite] = useState(user.site ? user.site : "");
  const [nonDepotClientName, setNonDepotClientName] = useState("");
  const [nonDepotContainerNumber, setNonDepotContainerNumber] = useState("");
  const [grossWeight, setGrossWeight] = useState("0");
  const [tareWeight, setTareWeight] = useState("0");
  const [manufacturingDate, setManufacturingDate] = useState("");
  const [shippingLine, setShippingLine] = useState("");
  const [dockDestuff, setDockDeStuff] = useState("");
  const [leasedBox, setLeasedBox] = useState("False");
  const [autoMNRStatusChange, setAutoMNRStatusChange] = useState(
    user.automatic_mnr_status_change === "True" ? "True" : "False"
  );
  const [mode, setMode] = useState("");
  const [condition, setCondition] = useState("");
  const [grade, setGrade] = useState("");
  const [inDate, setInDate] = useState("");
  const [inTime, setInTime] = useState("");
  const [outDate, setOutDate] = useState("");
  const [outTime, setOutTime] = useState("");
  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const [name, setName] = useState("Container Number");
  const [filterType, setFilterType] = useState("");
  // eslint-disable-next-line no-unused-vars
  const [file, setFile] = useState([]);
  // eslint-disable-next-line no-unused-vars
  const [picture, setPicture] = useState([]);
  // eslint-disable-next-line no-unused-vars
  const [imgData, setImgData] = useState([]);
  const fileObj = [];
  const fileArray = [];
  const [nonDepotLocation, setNonDepotLocation] = useState(
    user.location ? user.location : ""
  );
  const [nonDepotSite, setNonDepotSite] = useState(user.site ? user.site : "");
  const [show, setShow] = useState(false);
  // eslint-disable-next-line no-unused-vars
  const [icon, setIcon] = useState("");
  const [refCode, setRefCode] = useState("");
  const matchesIphone = useMediaQuery("(max-width:500px)");
  const [openMnr, setOpenMnr] = React.useState(false);
  const [openChip, setOpenChip] = React.useState(false);
  const [searchData, setSearchData] = useState("");
  // eslint-disable-next-line no-unused-vars
  const handleOpenMnr = () => setOpenMnr(true);
  const handleCloseMnr = () => setOpenMnr(!openMnr);
  const handleOpenChip = () => setOpenChip(true);

  useEffect(() => {
    if (history?.location?.state?.isDepotActive) {
      setShow(true);
    }
    let reqArray = [
      "client_data",
      "type_data",
      "arrived",
      "damage_code_n_condition",
      "grade",
      "client_ref_codes",
      "location_site_dashboard_list",
      "stock_stage",
    ];

    dispatch(dropDownDispatch(reqArray, notify));
    dispatch({ type: "CLEAR_UPLOAD_ESTIMATE_DESTIM" });
    dispatch(dropDownContainerAction());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (MNREdit.container_data.container_no) {
      setNonDepotClientName(MNREdit.container_data.client);
      setType(MNREdit.container_data.type);
      setSize(MNREdit.container_data.size);
      setNonDepotContainerNumber(MNREdit.container_data.container_no);
      setGrossWeight(MNREdit.container_data.gross_wt);
      setTareWeight(MNREdit.container_data.tare_wt);
      setManufacturingDate(MNREdit.container_data.manufacturing_date);
      setShippingLine(MNREdit.container_data.shipping_line);
      setDockDeStuff(MNREdit.container_data.dock_destuff || "");
      setLeasedBox(MNREdit.container_data.leased_box || "False");
      setAutoMNRStatusChange(
        MNREdit.container_data.automatic_mnr_status_change || "True"
      );
      setMode(MNREdit.container_data.mode);
      setCondition(MNREdit.container_data.condition);
      setGrade(MNREdit.container_data.grade);
      setInDate(MNREdit.container_data.in_date);
      setInTime(MNREdit.container_data.in_time);
      setOutDate(MNREdit.container_data.out_date);
      setOutTime(MNREdit.container_data.out_time);
    }
  }, [MNREdit.container_data]);

  const handleGrossWeightChange = (event) => {
    setGrossWeight(event.target.value);
  };
  const handleTareWeightChange = (event) => {
    setTareWeight(event.target.value);
  };

  const handleDateChange = (date) => {
    setManufacturingDate(date);
  };

  const handleInDateChange = (date) => {
    setInDate(date);
  };

  const handleNonDepot = () => {
    if (nonDepotClientName === "")
      notify("Please Enter Client Name", {
        variant: "warning",
      });
    else if (type === "")
      notify("Please Enter Container Type", {
        variant: "warning",
      });
    else if (size === "")
      notify("Please Enter Container Size", {
        variant: "warning",
      });
    else if (nonDepotContainerNumber === "")
      notify("Please Enter Container Number", {
        variant: "warning",
      });
    else if (grossWeight === "")
      notify("Please Enter Gross Weight", {
        variant: "warning",
      });
    else if (tareWeight === "")
      notify("Please Enter Tare Weight", {
        variant: "warning",
      });
    else if (manufacturingDate === "")
      notify("Please Enter Manufacturing Date", {
        variant: "warning",
      });
    else if (inDate === "")
      notify("Please Enter In Date", {
        variant: "warning",
      });
    else if (inTime === "")
      notify("Please Enter In Time", {
        variant: "warning",
      });
    else if (nonDepotLocation === "")
      notify("Please Enter Location", {
        variant: "warning",
      });
    else if (nonDepotSite === "")
      notify("Please Enter Site", {
        variant: "warning",
      });
    else if (shippingLine === "")
      notify("Please Enter Shipping Line", {
        variant: "warning",
      });
    else if (mode === "")
      notify("Please Enter Mode", {
        variant: "warning",
      });
    else if (condition === "")
      notify("Please Enter Condition", {
        variant: "warning",
      });
    else {
      var selectedDate = new Date(manufacturingDate);
      var dd = String(selectedDate.getDate()).padStart(2, "0");
      var mm = String(selectedDate.getMonth() + 1).padStart(2, "0"); //
      var yyyy = selectedDate.getFullYear();
      var selectedDateFormat = yyyy + "-" + mm + "-" + dd;

      var selectedInDate = new Date(inDate);
      var ddIn = String(selectedInDate.getDate()).padStart(2, "0");
      var mmIn = String(selectedInDate.getMonth() + 1).padStart(2, "0"); //
      var yyyyIn = selectedInDate.getFullYear();
      var selectedInDateFormat = yyyyIn + "-" + mmIn + "-" + ddIn;
      let req = {
        client: nonDepotClientName,
        type: type,
        size: size,
        container_no: nonDepotContainerNumber,
        payload: String(parseFloat(grossWeight) - parseFloat(tareWeight)),
        gross_wt: grossWeight,
        tare_wt: tareWeight,
        manufacturing_date: selectedDateFormat,
        shipping_line: shippingLine,
        dock_destuff: dockDestuff,
        leased_box: leasedBox,
        automatic_mnr_status_change: autoMNRStatusChange,
        condition: condition,
        grade: grade,
        in_date: selectedInDateFormat,
        in_time: inTime,
        out_date: "",
        out_time: "",
        location: nonDepotLocation,
        site: nonDepotSite,
        mode: mode,
      };
      dispatch(addNonDepotContainer(req, notify));
    }
  };

  const handleNonDepotUpdate = () => {
    if (nonDepotClientName === "")
      notify("Please Enter Client Name", {
        variant: "warning",
      });
    else if (type === "")
      notify("Please Enter Container Type", {
        variant: "warning",
      });
    else if (size === "")
      notify("Please Enter Container Size", {
        variant: "warning",
      });
    else if (nonDepotContainerNumber === "")
      notify("Please Enter Container Number", {
        variant: "warning",
      });
    else if (grossWeight === "")
      notify("Please Enter Gross Weight", {
        variant: "warning",
      });
    else if (tareWeight === "")
      notify("Please Enter Tare Weight", {
        variant: "warning",
      });
    else if (manufacturingDate === "")
      notify("Please Enter Manufacturing Date", {
        variant: "warning",
      });
    else if (inDate === "")
      notify("Please Enter In Date", {
        variant: "warning",
      });
    else if (inTime === "")
      notify("Please Enter In Time", {
        variant: "warning",
      });
    else if (nonDepotLocation === "")
      notify("Please Enter Location", {
        variant: "warning",
      });
    else if (nonDepotSite === "")
      notify("Please Enter Site", {
        variant: "warning",
      });
    else if (shippingLine === "")
      notify("Please Enter Shipping Line", {
        variant: "warning",
      });
    else if (mode === "")
      notify("Please Enter Mode", {
        variant: "warning",
      });
    else if (condition === "")
      notify("Please Enter Condition", {
        variant: "warning",
      });
    else {
      var selectedDate = new Date(manufacturingDate);
      var dd = String(selectedDate.getDate()).padStart(2, "0");
      var mm = String(selectedDate.getMonth() + 1).padStart(2, "0"); //
      var yyyy = selectedDate.getFullYear();
      var selectedDateFormat = yyyy + "-" + mm + "-" + dd;

      var selectedInDate = new Date(inDate);
      var ddIn = String(selectedInDate.getDate()).padStart(2, "0");
      var mmIn = String(selectedInDate.getMonth() + 1).padStart(2, "0"); //
      var yyyyIn = selectedInDate.getFullYear();
      var selectedInDateFormat = yyyyIn + "-" + mmIn + "-" + ddIn;
      let req = {
        container_pk: MNREdit.container_data.container_pk,
        client: nonDepotClientName,
        type: type,
        size: size,
        container_no: nonDepotContainerNumber,
        payload: String(parseFloat(grossWeight) - parseFloat(tareWeight)),
        gross_wt: grossWeight,
        tare_wt: tareWeight,
        manufacturing_date: selectedDateFormat,
        shipping_line: shippingLine,
        dock_destuff: dockDestuff,
        leased_box: leasedBox,
        automatic_mnr_status_change: autoMNRStatusChange,
        condition: condition,
        grade: grade,
        gate_in_pk: MNREdit.container_data.gate_in_pk,
        in_date: selectedInDateFormat,
        in_time: inTime,
        gate_out_pk: MNREdit.container_data.gate_out_pk,
        out_date: outDate,
        out_time: outTime,
        location: nonDepotLocation,
        site: nonDepotSite,
        mode: mode,
      };

      dispatch(addNonDepotContainerUpdate(req, notify));
    }
  };

  const handleContainerNumberOnBlur = (event) => {
    let first = event.target.value.slice(0, 4);
    let second = event.target.value.slice(4, 11);
    if (/^[A-Z]+$/.test(first) === false) {
      notify("First 4 alphabets should be uppercase.", {
        variant: "warning",
      });
      setNonDepotContainerNumber("");
      return;
    }
    if (/^\d+$/.test(second) === false) {
      notify("Select 7 combination of digits.", {
        variant: "warning",
      });
      setNonDepotContainerNumber("");
      return;
    }
    dispatch(
      nonDepotContainerValidatorDispatch(
        { location: nonDepotLocation, container_no: event.target.value },
        notify
      )
    );
  };

  const handleChange = (event) => {
    if (event.target.value === "") {
      setDropdown(false);
    }
    setSearch(event.target.value);
  };

  const handleClickAway = () => {
    setDropdown(false);
  };

  const handleContainerDateSelect = (body) => {
    dispatch(getNonDepotContainerByDateDispatch(body, setDropdown));
  };

  useEffect(() => {
    if (MNREdit.container_data && !MNREdit.container_data.container_no) {
      var today = new Date();
      var dd = String(today.getDate()).padStart(2, "0");
      var mm = String(today.getMonth() + 1).padStart(2, "0"); //
      var yyyy = today.getFullYear();

      var curr_hour = today.getHours();
      var curr_min = today.getMinutes();
      var todayDate = yyyy + "-" + mm + "-" + dd;
      var todayTime = curr_hour + ":" + curr_min;

      setManufacturingDate(todayDate);
      setInDate(todayDate);
      setInTime(todayTime);
    }
  }, [MNREdit.container_data]);

  const updateName = (event) => {
    setFilterType("");
    dispatch({ type: "RESET_MNR_SEARCH_DATA" });
    setName(event.target.value);
  };
  const getData = () => {
    dispatch(getMNRGrid(MNRGridSearch));
  };
  const setDispatchType = (e) => {
    setFilterType(e.target.value);
    if (name === "Container Number") {
      dispatch({
        type: "SET_MNR_SEARCH_CONTAINER_NUMBER",
        payload: e.target.value,
      });
      var removeSpace = e.target.value.replace(/ /g, "");
      var array = removeSpace.split(",");
      setSearchData(array);
    } else {
      dispatch({ type: "SET_MNR_SEARCH_CLIENT_NAME", payload: e.target.value });
    }
  };
  const uploadMultipleFiles = (e) => {
    fileObj.push(e.target.files);
    for (let i = 0; i < fileObj[0].length; i++) {
      fileArray.push(fileObj[0][i]);
    }
    setFile(fileArray);
  };

  const onChangePicture = (e) => {
    uploadMultipleFiles(e);
    var file = e.target.files[0];
    if (file.type === "text/plain" || file.type === "") {
      setIcon(file);
      let bodyFormData = new FormData();
      if (fileArray.length > 0) {
        fileArray.map((fileItem) => {
          return bodyFormData.append("file", fileItem);
        });
      }
      bodyFormData.append("location", Location);
      bodyFormData.append("site", site);
      bodyFormData.append("ref_code", MNRGridSearch.ref_code);
      dispatch(uploadEstimateDestim(bodyFormData));
    } else {
      notify("Only EDI can be uploaded", {
        variant: "warning",
      });
    }
    setPicture(e.target.files[0]);
    const reader = new FileReader();
    reader.addEventListener("load", () => {
      setImgData(reader.result);
    });
    reader.readAsDataURL(e.target.files[0]);
  };
  const handleImportStock = () => {
    dispatch(getMNRStatementExcel(MNRGridSearch, notify));
  };

  function validateContainerNumber(containerNumber) {
    var re = /^[A-Z]{4}\d{7}$/;
    return re.test(containerNumber);
  }

  const handleContainerNumberChange = (event) => {
    if (
      nonDepotContainerNumber === "" &&
      !validateContainerNumber(nonDepotContainerNumber)
    )
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
      setNonDepotContainerNumber(event?.target?.value);
    } else {
      if (event?.target?.value?.length < 5) {
        setNonDepotContainerNumber(event?.target?.value);
      } else {
        notify(
          "Please enter the valid 11 digit combination(4 Uppercase & 7 Number)",
          { variant: "warning" }
        );
      }
    }
  };

  return (
    <div>
      {user.type === "NON DEPOT" && (
        <>
          <Grid
            item
            xs={6}
            style={{
              display: "flex",
              alignItems: "center",
            }}
          >
            <Typography variant="subtitle2" style={{ paddingRight: 10 }}>
              Add/Search Non-Depot?
            </Typography>
            <FormControlLabel
              value="yes"
              control={
                <Radio
                  style={{ color: "#2A5FA5" }}
                  checked={show === true}
                  onClick={() => setShow(true)}
                />
              }
              label="Yes"
            />
            <FormControlLabel
              value="no"
              control={
                <Radio
                  style={{ color: "#2A5FA5" }}
                  checked={show === false}
                  onClick={() => setShow(false)}
                />
              }
              label="No"
            />
          </Grid>
          {show && (
            <>
              <Paper className={classes.searchMNR} elevation={0}>
                {user.type === "NON DEPOT" && matchesIphone && (
                  <Stack direction={"row"} justifyContent={"center"}>
                    <FormControl
                      variant="standard"
                      style={{
                        margin: "auto",
                        marginTop: "16px",
                        marginBottom: "16px",
                      }}
                    >
                      <InputLabel
                        id="container_list_select_label"
                        style={{
                          color: "grey",
                          zIndex: 10,
                          fontSize: "15px",
                          textAlign: "center",
                          padding: "0 10px",
                        }}
                      >
                        Survey Containers
                      </InputLabel>
                      <Select
                        // value={ServeyorReducer.data.client}
                        id="=container_list_select"
                        labelId="container_list_select_label"
                        name="client"
                        label="Survey Containers"
                        variant="standard"
                        inputProps={{
                          style: {
                            padding: "0px",
                            marginTop: "-10px",
                          },
                        }}
                        // MenuProps={MenuProps}
                        style={{
                          width: "200px",
                          backgroundColor: "white",
                          borderRadius: "5px",
                        }}
                        // contentEditable={ServeyorReducer.data.pk ? false : true}

                        // onChange={onChangeData}
                      >
                        {gateIn.container_list?.map((val) => (
                          <MenuItem
                            key={val.container_no}
                            value={val.container_no}
                            onClick={() =>
                              dispatch(
                                ContainerSurveyGetNONDEPOTAction(val.pk, notify)
                              )
                            }
                          >
                            {val.container_no}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Stack>
                )}
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={9} style={{ position: "relative" }}>
                    <Paper
                      component="form"
                      className={classes.searchPaper}
                      elevation={0}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        flexWrap: user.type === "NON DEPOT" ? "wrap" : "nowrap",
                      }}
                    >
                      {user.type === "DEPOT" && (
                        <IconButton
                          type="submit"
                          className={classes.iconButton}
                          aria-label="search"
                        >
                          <SearchIcon />
                        </IconButton>
                      )}
                      {matchesIphone && user.type === "NON DEPOT" ? null : (
                        <FormControl
                          variant="standard"
                          style={{ marginTop: "-15px" }}
                        >
                          <InputLabel
                            id="container_list_select_label"
                            style={{
                              color: "grey",
                              zIndex: 10,
                              fontSize: "15px",
                              textAlign: "center",
                              padding: "0 10px",
                            }}
                          >
                            Survey Containers
                          </InputLabel>
                          <Select
                            // value={ServeyorReducer.data.client}
                            id="=container_list_select"
                            labelId="container_list_select_label"
                            name="client"
                            label="Survey Containers"
                            variant="standard"
                            inputProps={{
                              style: {
                                padding: "0px",
                                marginTop: "-10px",
                              },
                            }}
                            // MenuProps={MenuProps}
                            style={{
                              width: "200px",
                              backgroundColor: "white",
                              borderRadius: "5px",
                            }}
                            // contentEditable={ServeyorReducer.data.pk ? false : true}

                            // onChange={onChangeData}
                          >
                            {gateIn.container_list?.map((val) => (
                              <MenuItem
                                key={val.container_no}
                                value={val.container_no}
                                onClick={() =>
                                  dispatch(
                                    ContainerSurveyGetNONDEPOTAction(
                                      val.pk,
                                      notify
                                    )
                                  )
                                }
                              >
                                {val.container_no}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      )}

                      <InputBase
                        id="container-search"
                        name="searchText"
                        className={classes.input}
                        placeholder="Search for a Non-Depot Container"
                        inputProps={{ "aria-label": "search" }}
                        value={searchText}
                        onChange={(e) => handleChange(e)}
                        autoComplete="off"
                      />
                    </Paper>
                    <ClickAwayListener onClickAway={handleClickAway}>
                      <Paper
                        className={classes.searchResultContainer}
                        elevation={1}
                      >
                        {showDropdown ? (
                          gateIn.nonDepotContainerSearchResult.container_no ? (
                            <List aria-label="search results">
                              {gateIn.nonDepotContainerSearchResult.dates.map(
                                (containerDate, index) => {
                                  return (
                                    <ListItem
                                      button
                                      key={index}
                                      style={
                                        gateIn.nonDepotContainerSearchResult
                                          .dates.length > 1 && index === 0
                                          ? {
                                              backgroundColor: "#FDBD2E",
                                            }
                                          : {
                                              backgroundColor: null,
                                            }
                                      }
                                      onClick={() =>
                                        handleContainerDateSelect({
                                          container_no:
                                            gateIn.nonDepotContainerSearchResult
                                              .container_no,
                                          date: containerDate,
                                        })
                                      }
                                    >
                                      <ListItemText
                                        primary={`${containerDate}    |    ${gateIn.nonDepotContainerSearchResult.container_no}`}
                                      />
                                    </ListItem>
                                  );
                                }
                              )}
                            </List>
                          ) : (
                            <Typography className={classes.noResultText}>
                              No result found for {`"${searchText}"`}
                            </Typography>
                          )
                        ) : null}
                      </Paper>
                    </ClickAwayListener>
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <Button
                      className={classes.searchMNRButton}
                      onClick={() => {
                        dispatch(
                          nonDepotContainerSearchDispatch(
                            { container_no: searchText },
                            setDropdown
                          )
                        );
                      }}
                    >
                      Search
                    </Button>
                  </Grid>
                </Grid>
              </Paper>
              <Stack
                direction={"row"}
                alignItems={"center"}
                justifyContent={"space-between"}
                flexDirection={"row"}
              >
                <Typography
                  variant="subtitle2"
                  style={{ paddingTop: 14, paddingBottom: 14 }}
                >
                  Add Non-Depot Container
                </Typography>
                <Button
                  onClick={() => {
                    history.replace({
                      pathname: "/mnr",
                      state: { isDepotActive: true },
                    });
                    history.go(0);
                  }}
                  variant="contained"
                  style={{
                    color: "white",
                    backgroundColor: "#2A5FA5",
                    width: "150px",
                  }}
                  startIcon={<AddCircleOutlineIcon fill="white" />}
                >
                  New
                </Button>
              </Stack>

              <Paper className={classes.paperContainerMNR} elevation={0}>
                <Grid container spacing={3}>
                  <Grid
                    item
                    xs={12}
                    sm={6}
                    md={2}
                    lg={2}
                    style={{ alignSelf: "flex-end" }}
                  >
                    <Typography
                      variant="subtitle1"
                      className={classes.LabelTypography}
                    >
                      Client <span style={{ color: "red" }}>*</span>
                    </Typography>

                    <TextField
                      id="stocks-allot-client-name"
                      select
                      value={nonDepotClientName}
                      variant="outlined"
                      fullWidth
                      inputProps={{ className: classes.input }}
                      className={classes.selectTextField}
                      onChange={(e) => {
                        setNonDepotClientName(e.target.value);
                      }}
                    >
                      {gateIn.allDropDown &&
                        gateIn.allDropDown.client_data &&
                        gateIn.allDropDown.client_data.map((option) => (
                          <MenuItem key={option.name} value={option.name}>
                            {option.name}
                          </MenuItem>
                        ))}
                    </TextField>
                  </Grid>

                  <Grid
                    item
                    xs={12}
                    sm={6}
                    md={2}
                    lg={2}
                    style={{ alignSelf: "flex-end" }}
                  >
                    <Typography
                      variant="subtitle1"
                      className={classes.LabelTypography}
                    >
                      Type <span style={{ color: "red" }}>*</span>
                    </Typography>

                    <TextField
                      id="client-master-code"
                      select
                      value={type}
                      variant="outlined"
                      fullWidth
                      inputProps={{ className: classes.input }}
                      onChange={(e) => {
                        setType(e.target.value);
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
                  </Grid>

                  <Grid
                    item
                    xs={12}
                    sm={6}
                    md={2}
                    lg={2}
                    style={{ alignSelf: "flex-end" }}
                  >
                    <Typography
                      variant="subtitle1"
                      className={classes.LabelTypography}
                    >
                      Size <span style={{ color: "red" }}>*</span>
                    </Typography>

                    <TextField
                      id="client-master-code"
                      select
                      value={size}
                      variant="outlined"
                      fullWidth
                      inputProps={{ className: classes.input }}
                      onChange={(e) => {
                        setSize(e.target.value);
                      }}
                    >
                      <MenuItem key="20" value="20">
                        20
                      </MenuItem>
                      <MenuItem key="40" value="40">
                        40
                      </MenuItem>
                    </TextField>
                  </Grid>

                  <Grid
                    item
                    xs={12}
                    sm={6}
                    md={2}
                    lg={2}
                    style={{ alignSelf: "flex-end" }}
                  >
                    <Typography
                      variant="subtitle1"
                      className={classes.LabelTypography}
                    >
                      Container Number <span style={{ color: "red" }}>*</span>
                    </Typography>
                    <TextField
                      id="container-number"
                      // type={'text'}
                      value={nonDepotContainerNumber}
                      variant="outlined"
                      fullWidth
                      className={classes.textField}
                      inputProps={{ className: classes.input }}
                      onChange={handleContainerNumberChange}
                      onBlur={handleContainerNumberOnBlur}
                      autoComplete="off"
                    />
                  </Grid>

                  <Grid
                    item
                    xs={12}
                    sm={6}
                    md={2}
                    lg={2}
                    style={{ alignSelf: "flex-end" }}
                  >
                    <Typography
                      variant="subtitle1"
                      className={classes.LabelTypography}
                    >
                      Gross weight <span style={{ color: "red" }}>*</span>
                    </Typography>
                    <CustomTextfield
                      id="gross-weight"
                      value={grossWeight}
                      handleChange={handleGrossWeightChange}
                      dispatchType={"SET_GROSS_WEIGHT_MNR"}
                    />
                  </Grid>

                  <Grid
                    item
                    xs={12}
                    sm={6}
                    md={2}
                    lg={2}
                    style={{ alignSelf: "flex-end" }}
                  >
                    <Typography
                      variant="subtitle1"
                      className={classes.LabelTypography}
                    >
                      Tare Weight <span style={{ color: "red" }}>*</span>
                    </Typography>
                    <CustomTextfield
                      id="tare-weight"
                      handleChange={handleTareWeightChange}
                      value={tareWeight}
                      dispatchType={"SET_TARE_WEIGHT_MNR"}
                    />
                  </Grid>

                  <Grid
                    item
                    xs={12}
                    sm={6}
                    md={2}
                    lg={2}
                    style={{ alignSelf: "flex-end" }}
                  >
                    <Typography
                      variant="subtitle1"
                      className={classes.LabelTypography}
                    >
                      Manufacturing Date <span style={{ color: "red" }}>*</span>
                    </Typography>

                    <DatePickerField
                      dateId="manufacturing-date"
                      dateValue={manufacturingDate}
                      dateChange={handleDateChange}
                      dispatchType={"SET_MANUFACTURING_DATE_MNR"}
                    />
                  </Grid>

                  <Grid
                    item
                    xs={12}
                    sm={6}
                    md={2}
                    lg={2}
                    style={{ alignSelf: "flex-end" }}
                  >
                    <Typography
                      variant="subtitle1"
                      className={classes.LabelTypography}
                    >
                      Shipping Line <span style={{ color: "red" }}>*</span>
                    </Typography>

                    <CustomTextfield
                      id="client-master-shipping-line"
                      handleChange={(e) => setShippingLine(e.target.value)}
                      value={shippingLine}
                      dispatchType={"SET_MASTER_SHIPPING_LINE"}
                    />
                  </Grid>

                  <Grid
                    item
                    xs={12}
                    sm={6}
                    md={2}
                    lg={2}
                    style={{ alignSelf: "flex-end" }}
                  >
                    <Typography
                      variant="subtitle1"
                      className={classes.LabelTypography}
                    >
                      Dock DeStuff
                    </Typography>

                    <CustomTextfield
                      id="client-master-dock-de-stuff"
                      handleChange={(e) => setDockDeStuff(e.target.value)}
                      value={dockDestuff}
                      dispatchType={"SET_MASTER_DOCK_DE_STUFF"}
                    />
                  </Grid>

                  <Grid
                    item
                    xs={12}
                    sm={6}
                    md={2}
                    lg={2}
                    style={{ alignSelf: "flex-end" }}
                  >
                    <Typography
                      variant="subtitle1"
                      className={classes.LabelTypography}
                    >
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
                            leasedBox === "False"
                              ? classes.selectedChoice
                              : classes.choice
                          }
                          onClick={() => {
                            setLeasedBox("False");
                          }}
                        >
                          No
                        </Button>
                      </Grid>
                      <Grid item xs={6}>
                        <Button
                          className={
                            leasedBox === "True"
                              ? classes.selectedChoice
                              : classes.choice
                          }
                          onClick={() => {
                            setLeasedBox("True");
                          }}
                        >
                          Yes
                        </Button>
                      </Grid>
                    </Grid>
                  </Grid>

                  <Grid item xs={12} sm={6} md={2} lg={2}>
                    <Typography
                      variant="subtitle2"
                      style={{ paddingRight: 10 }}
                    >
                      Automatic MNR Status Change?
                    </Typography>
                    <FormControlLabel
                      value="yes"
                      control={
                        <Radio
                          style={{ color: "#2A5FA5" }}
                          checked={autoMNRStatusChange === "True"}
                          onClick={() => setAutoMNRStatusChange("True")}
                          disabled={
                            user.mnr_module === "False" &&
                            user.automatic_mnr_status_change === "False"
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
                          checked={autoMNRStatusChange === "False"}
                          disabled={
                            user.mnr_module === "False" &&
                            user.automatic_mnr_status_change === "False"
                          }
                          onClick={() => setAutoMNRStatusChange("False")}
                        />
                      }
                      label="No"
                    />
                  </Grid>

                  <Grid
                    item
                    xs={12}
                    sm={6}
                    md={2}
                    lg={2}
                    style={{ alignSelf: "flex-end" }}
                  >
                    <Typography
                      variant="subtitle1"
                      className={classes.LabelTypography}
                    >
                      Mode <span style={{ color: "red" }}>*</span>
                    </Typography>

                    <TextField
                      id="mode"
                      select
                      value={mode}
                      variant="outlined"
                      fullWidth
                      inputProps={{ className: classes.input }}
                      onChange={(e) => {
                        setMode(e.target.value);
                      }}
                    >
                      {gateIn.allDropDown &&
                        gateIn.allDropDown.arrived &&
                        gateIn.allDropDown.arrived.map((option) => (
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
                    md={2}
                    lg={2}
                    style={{ alignSelf: "flex-end" }}
                  >
                    <Typography
                      variant="subtitle1"
                      className={classes.LabelTypography}
                    >
                      Condition <span style={{ color: "red" }}>*</span>
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
                      }}
                    >
                      {gateIn.allDropDown &&
                        gateIn.allDropDown.damage_code_n_condition &&
                        gateIn.allDropDown.damage_code_n_condition.map(
                          (option) => (
                            <MenuItem key={option} value={option}>
                              {option}
                            </MenuItem>
                          )
                        )}
                    </TextField>
                  </Grid>

                  <Grid
                    item
                    xs={12}
                    sm={6}
                    md={2}
                    lg={2}
                    style={{ alignSelf: "flex-end" }}
                  >
                    <Typography
                      variant="subtitle1"
                      className={classes.LabelTypography}
                    >
                      Grade
                    </Typography>

                    <TextField
                      id="client-master-code"
                      select
                      value={grade}
                      variant="outlined"
                      fullWidth
                      inputProps={{ className: classes.input }}
                      onChange={(e) => {
                        setGrade(e.target.value);
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

                  <Grid
                    item
                    xs={12}
                    sm={6}
                    md={2}
                    lg={2}
                    style={{ alignSelf: "flex-end" }}
                  >
                    <Typography
                      variant="subtitle1"
                      className={classes.LabelTypography}
                    >
                      IN Date <span style={{ color: "red" }}>*</span>
                    </Typography>

                    <DatePickerField
                      dateId="in-date"
                      dateValue={inDate}
                      dateChange={handleInDateChange}
                      dispatchType={"SET_IN_DATE_MNR"}
                    />
                  </Grid>

                  <Grid
                    item
                    xs={12}
                    sm={6}
                    md={2}
                    lg={2}
                    style={{ alignSelf: "flex-end" }}
                  >
                    <Typography
                      variant="subtitle1"
                      className={classes.LabelTypography}
                    >
                      IN Time <span style={{ color: "red" }}>*</span>
                    </Typography>
                    <CustomTextfield
                      id="in-time"
                      type="time"
                      handleChange={(e) => setInTime(e.target.value)}
                      value={inTime}
                      dispatchType={"SET_IN_TIME_MNR"}
                    />
                  </Grid>

                  {MNREdit.container_data.container_pk && (
                    <>
                      <Grid
                        item
                        xs={6}
                        sm={2}
                        style={{ alignSelf: "flex-end" }}
                      >
                        <Typography
                          variant="subtitle1"
                          className={classes.LabelTypography}
                        >
                          Out Date
                        </Typography>

                        <DatePickerField
                          dateId="out-date"
                          dateValue={outDate}
                          dateChange={(date) => setOutDate(date)}
                          dispatchType={"SET_OUT_DATE_MNR"}
                        />
                      </Grid>

                      <Grid
                        item
                        xs={6}
                        sm={2}
                        style={{ alignSelf: "flex-end" }}
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
                          dispatchType={"SET_IN_TIME_MNR"}
                        />
                      </Grid>
                    </>
                  )}

                  <Grid
                    item
                    xs={12}
                    sm={6}
                    md={2}
                    lg={2}
                    style={{ alignSelf: "flex-end" }}
                  >
                    <Typography
                      variant="subtitle1"
                      className={classes.LabelTypography}
                    >
                      Location <span style={{ color: "red" }}>*</span>
                    </Typography>

                    <TextField
                      id="stock-and-allotment-location"
                      select
                      value={nonDepotLocation}
                      variant="outlined"
                      fullWidth
                      inputProps={{ className: classes.input }}
                      onChange={(e) => {
                        setNonDepotLocation(e.target.value);
                        dispatch({
                          type: "SET_STOCK_ALLOT_SEARCH_LOCATION",
                          payload: e.target.value,
                        });
                      }}
                      disabled={
                        (user.role === "Location Admin" ||
                          user.role === "Site Admin") &&
                        true
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
                    md={2}
                    lg={2}
                    style={{ alignSelf: "flex-end" }}
                  >
                    <Typography
                      variant="subtitle1"
                      className={classes.LabelTypography}
                    >
                      Site <span style={{ color: "red" }}>*</span>
                    </Typography>

                    <TextField
                      id="client-master-code"
                      select
                      value={nonDepotSite}
                      variant="outlined"
                      fullWidth
                      inputProps={{ className: classes.input }}
                      onChange={(e) => {
                        setNonDepotSite(e.target.value);
                        dispatch({
                          type: "SET_STOCK_ALLOT_SEARCH_SITE",
                          payload: e.target.value,
                        });
                      }}
                      disabled={user.role === "Site Admin" && true}
                    >
                      {Location !== "" &&
                        gateIn.allDropDown &&
                        gateIn.allDropDown.location_site_dashboard_list &&
                        gateIn.allDropDown.location_site_dashboard_list[
                          Location
                        ].map((option) => (
                          <MenuItem key={option} value={option}>
                            {option}
                          </MenuItem>
                        ))}
                    </TextField>
                  </Grid>

                  <Grid
                    container
                    spacing={3}
                    style={{
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {MNREdit.container_data.container_pk ? (
                      <Grid
                        item
                        xs={12}
                        sm={6}
                        md={3}
                        style={{
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          width: "100%",
                        }}
                      >
                        <Button
                          className={classes.addButton}
                          onClick={handleNonDepotUpdate}
                        >
                          Update
                        </Button>
                      </Grid>
                    ) : (
                      <Grid
                        item
                        xs={3}
                        style={{
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          width: "100%",
                        }}
                      >
                        <Button
                          className={classes.addButton}
                          onClick={handleNonDepot}
                        >
                          Add
                        </Button>
                      </Grid>
                    )}
                  </Grid>
                </Grid>
              </Paper>
            </>
          )}
        </>
      )}
      <Box mt={4}></Box>
      <Grid
        style={{
          display: "flex",
          flexDirection: matchesIphone ? "column" : "row",
          width: matchesIphone ? "100%" : "100%",
          justifyContent: "flex-start",
          alignItems: "center",
          textAlign: "center",
        }}
      >
        <Grid className={classes.searchPaperWrapper}>
          <Paper
            component="form"
            className={classes.searchPaperMenu}
            elevation={0}
          >
            <Select
              id="client-name"
              value={name}
              fullWidth
              className={classes.searchMenuItemPaper}
              onChange={updateName}
            >
              <MenuItem value={"Container Number"}>
                &nbsp; &nbsp;&nbsp;Container Number
              </MenuItem>
              <MenuItem value={"Client"}>&nbsp; &nbsp;&nbsp;Client</MenuItem>
            </Select>

            <InputBase
              className={classes.input}
              placeholder={`Search ${name}`}
              inputProps={{ "aria-label": "search" }}
              value={filterType}
              onChange={setDispatchType}
              autoComplete="off"
            />

            <Grid container xs={12} sm={12} style={{ display: "block" }}>
              <InfoIcon onClick={handleOpenChip} style={{ color: "#2A5FA5" }} />
            </Grid>

            <IconButton
              type="button"
              className={classes.iconButton}
              aria-label="search"
              onClick={() => {
                getData();
              }}
            >
              <SearchIcon />
            </IconButton>
          </Paper>
        </Grid>
        <Grid>
          <Tooltip title="Click to find more search results">
            <Button className={classes.searchButton} onClick={handleOpen}>
              Advanced Search &nbsp; &nbsp;&nbsp; &nbsp;
              <SearchIcon />
            </Button>
          </Tooltip>
        </Grid>
      </Grid>

      <Modal open={open} onClose={handleClose}>
        <Box className={classes.modalPopUp}>
          <Grid className={classes.clearIcon}>
            {" "}
            <ClearIcon onClick={handleClose} />
          </Grid>
          <MNRSearchModal handleClose={handleClose} />
        </Box>
      </Modal>

      {MNRGridSearch.ref_code !== "" &&
        MNRGridSearch.ref_code !== undefined &&
        MNRGridSearch.ref_code !== null && (
          <>
            <Typography
              variant="subtitle2"
              style={{ paddingTop: 14, paddingBottom: 14 }}
            >
              Upload Response Destim
            </Typography>

            <Paper
              className={classes.paperContainer}
              elevation={0}
              style={{ width: "100%" }}
            >
              <Grid
                container
                spacing={3}
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Grid
                  item
                  xs={12}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Typography
                    variant="subtitle1"
                    className={classes.LabelTypography}
                  >
                    Upload Document
                  </Typography>
                  <Grid>
                    <Button
                      className={classes.uploadButton}
                      id="mnr-edi-upload"
                      component="label"
                    >
                      Choose File
                      <input
                        type="file"
                        style={{ display: "none" }}
                        id="mnr-edi-upload"
                        multiple
                        onChange={onChangePicture}
                      />
                    </Button>
                  </Grid>
                  {MNR.uploadEstimateDestim.length !== 0 &&
                    !MNR.uploadEstimateDestim.errorMsg && (
                      <Stack
                        direction={"row"}
                        alignItems={"center"}
                        justifyContent={"space-between"}
                        spacing={4}
                        mt={4}
                        mb={4}
                      >
                        {" "}
                        <Chip
                          variant="default"
                          color="primary"
                          size="medium"
                          label={`Total Files - ${MNR.uploadEstimateDestim?.total_file_count}`}
                          style={{ borderRadius: 4 }}
                        />
                        <Chip
                          variant="default"
                          color={"secondary"}
                          size="medium"
                          label={`Wrong Files - ${MNR.uploadEstimateDestim?.wrong_file_count}`}
                          style={{ borderRadius: 4 }}
                        />
                      </Stack>
                    )}
                  {MNR.uploadEstimateDestim.length !== 0 ? (
                    MNR.uploadEstimateDestim.errorMsg ? (
                      <Grid>
                        <Typography className={classes.destimErrorMsg}>
                          {MNR.uploadEstimateDestim.errorMsg}
                        </Typography>
                      </Grid>
                    ) : (
                      <Grid container spacing={6}>
                        <Grid item lg={1} />
                        <Grid
                          item
                          xs={8}
                          style={{ padding: 20, paddingTop: 35 }}
                        >
                          <Grid
                            style={{
                              display: "flex",
                              justifyContent: "space-around",
                              alignItems: "center",
                            }}
                          >
                            <Grid
                              style={{
                                display: "flex",
                                flexDirection: "column",
                                justifyContent: "space-between",
                                alignItems: "center",
                              }}
                            >
                              <Typography>
                                {
                                  MNR.uploadEstimateDestim
                                    .no_of_approved_containers
                                }{" "}
                                Approved Entries
                              </Typography>
                              {MNR.uploadEstimateDestim &&
                                MNR.uploadEstimateDestim
                                  .no_of_approved_containers !== 0 && (
                                  <Button
                                    variant="contained"
                                    className={classes.button}
                                    startIcon={<Rejected />}
                                    onClick={() => {
                                      dispatch(
                                        downloadRejectedEstimateDestim(
                                          MNR.uploadEstimateDestim
                                            .approved_container_data,
                                          notify,
                                          "Approved"
                                        )
                                      );
                                    }}
                                  >
                                    Download Approved Data
                                  </Button>
                                )}
                            </Grid>
                            <Grid
                              style={{
                                display: "flex",
                                flexDirection: "column",
                                justifyContent: "space-between",
                                alignItems: "center",
                              }}
                            >
                              <Typography>
                                {
                                  MNR.uploadEstimateDestim
                                    .no_of_rejected_containers
                                }{" "}
                                Rejected Entries
                              </Typography>
                              {MNR.uploadEstimateDestim &&
                                MNR.uploadEstimateDestim
                                  .no_of_rejected_containers !== 0 && (
                                  <Button
                                    variant="contained"
                                    className={classes.button2}
                                    startIcon={<Rejected />}
                                    onClick={() => {
                                      dispatch(
                                        downloadRejectedEstimateDestim(
                                          MNR.uploadEstimateDestim
                                            .rejected_container_data,
                                          notify,
                                          "Rejected"
                                        )
                                      );
                                    }}
                                  >
                                    Download Rejected Data
                                  </Button>
                                )}
                            </Grid>
                          </Grid>
                        </Grid>
                      </Grid>
                    )
                  ) : null}
                </Grid>
              </Grid>
            </Paper>
          </>
        )}
      <Modal openMnr={openMnr} onClose={handleCloseMnr}>
        <Box className={classes.modalPopUp}>
          <div className={classes.clearIcon}>
            <ClearIcon onClick={handleCloseMnr} />
          </div>
          <ContainerListModal handleCloseMnr={handleCloseMnr} />
        </Box>
      </Modal>
      <Modal open={openChip} onClose={() => setOpenChip(false)}>
        <Box sx={style}>
          <ContainerListModal
            handleClose={() => setOpenChip(false)}
            searchData={searchData}
            mnr={true}
          />
        </Box>
      </Modal>
    </div>
  );
};

export default MNRGridFilter;
