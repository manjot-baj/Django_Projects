import React, { useCallback, useEffect, useRef, useState } from "react";
import LayoutContainer from "../components/reusableComponents/LayoutContainer";
import {
  Box,
  Button,
  Card,
  CardActionArea,
  CardMedia,
  Divider,
  FormControl,
  FormControlLabel,
  Grid,
  IconButton,
  InputBase,
  InputLabel,
  MenuItem,
  Modal,
  Paper,
  Radio,
  Select,
  TextField,
  Typography,
  makeStyles,
  useMediaQuery,
} from "@material-ui/core";
import PropTypes from "prop-types";
import { useDispatch, useSelector } from "react-redux";
import { useSnackbar } from "notistack";
import {
  getContainerListAction,
  saveRepairAction,
  searchContainerAction,
  uploadRepairImageAction,
} from "../actions/RepairTabAction";
import Camera, { FACING_MODES, IMAGE_TYPES } from "react-html5-camera-photo";
import "react-html5-camera-photo/build/css/index.css";
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import { Stack } from "@mui/material";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import HighlightOffIcon from "@mui/icons-material/HighlightOff";
import UploadIcon from "@mui/icons-material/Upload";
import Multiselect from "multiselect-react-dropdown";
import CustomTextfield from "../components/reusableComponents/GateInTextField";
import DatePickerField from "../components/reusableComponents/DatePickerField";

import CircularProgress from "@mui/material/CircularProgress";
import { downloadJobSheet } from "../actions/MNRProcessActions";

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
  downloadButton: {
    fontSize: 12.5,
    width: "300px",
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
    [theme.breakpoints.down("md")]: {
      // padding: "1px 4px",
      width: "100px",
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

const RepairLogin = () => {
  const user = useSelector((state) => state.user);
  const matchesIpad = useMediaQuery("(max-width:1050px)");
  const matchesIphone = useMediaQuery("(max-width:570px)");

  return (
    <LayoutContainer footer={false}>
      <div style={{ padding: "0 20px" }}>
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
          <Grid item lg={1} m={1}>
            <Typography variant="h4" style={{ fontWeight: "bold" }}>
              Repair
            </Typography>
          </Grid>
          <Grid
            item
            lg={4}
            md={11}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: matchesIphone ? "space-between" : "space-around",
            }}
          >
            {!matchesIphone && (
              <Typography variant="subtitle1" style={{ fontWeight: "600" }}>
                Location
              </Typography>
            )}
            <Paper
              elevation={1}
              style={{
                padding: "5px 20px",
                margin: matchesIphone ? "0 10px 0 0 " : "9",
              }}
            >
              <Typography variant="subtitle2" align="center" color="grey">
                {user.location}{" "}
              </Typography>
            </Paper>
            {!matchesIphone && (
              <Typography variant="subtitle1" style={{ fontWeight: "600" }}>
                Site
              </Typography>
            )}
            <Paper elevation={1} style={{ padding: "5px 20px" }}>
              <Typography variant="subtitle2" align="center" color="grey">
                {user.site}{" "}
              </Typography>
            </Paper>
          </Grid>
        </Grid>

        <RepairServey />
      </div>
    </LayoutContainer>
  );
};

export default RepairLogin;

const RepairServey = () => {
  const classes = useStyle();
  const notify = useSnackbar().enqueueSnackbar;
  const [placement, setPlacement] = useState("False");
  const [damageCategory, setDamageCategory] = useState("");
  const [manPower, setManPower] = useState([]);
  const [searchContainer, setSearchContainer] = useState("");
  const [isImageUploading, setIsImageUploading] = useState(false);
  const { RepairTabReducer, user } = useSelector((state) => state);
  const dispatch = useDispatch();
  const [openMobile, setOpenMobile] = useState(false);
  const [mobileUpload, setMobileUpload] = useState([]);
  const matchesIpad = useMediaQuery("(max-width:1050px)");
  const [picture, setPicture] = useState([]);
  const [options, setOptions] = useState([]);
  const [preSelected, setPreSelected] = useState([]);
  const [placementDate, setPlacementDate] = useState("");
  const [placementTime, setPlacementTime] = useState("");
  const [currentDate, setCurrentDate] = useState("");
  const [currentTime, setCurrentTime] = useState("");
  const [createdBy, setCreatedBy] = useState("");
  const [updatedBy, setUpdatedBy] = useState("");
  const [repairDate, setRepairDate] = useState("");
  const [repairTime, setRepairTime] = useState("");
  const [isComplete, setIsComplete] = useState("False");
  const [grade, setGrade] = useState("");
  const [remarks, setRemarks] = useState("");
  const fileRef = useRef();
  const [imgData, setImgData] = useState([]);
  const fileObj = [];
  const fileArray = [];
  const [file, setFile] = useState([]);
  const imageRef = useRef();
  const handleCloseMobile = () => setOpenMobile((prev) => !prev);
  const handleMobileClick = () => setOpenMobile(true);
  const matchesIphone = useMediaQuery("(max-width:570px)");
  const MenuProps = {
    PaperProps: {
      style: {
        maxHeight: "300px",
        marginTop: 50,
      },
    },
  };

  useEffect(() => {
    handleContainersList();
  }, []);

  const handleUploadRepair = () => {
    dispatch(
      saveRepairAction(
        placement,
        isComplete,
        damageCategory,
        grade,
        remarks,
        manPower,
        RepairTabReducer.mnrProcessData.estimate_id,
        notify
      )
    );
  };

  const onChangeSearchContainer = (e) => {
    const { name, value } = e.target;
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

  const onChangePicture = (e) => {
    uploadMultipleFiles(e);
    setPicture(e.target.files[0]);
    const reader = new FileReader();
    reader.addEventListener("load", () => {
      setImgData(reader.result);
    });
    reader.readAsDataURL(e.target.files[0]);
  };

  const handleSelectedVal = (value) => {
    let obj = [];
    for (let i = 0; i < value.length; i++) {
      obj.push(value[i].pk);
    }
    setManPower(obj);
  };

  const handleRemovedVal = (val) => {
    if (val.length > 0) {
      var array = manPower.filter((item) => item === val[0].pk);
      setManPower(array);
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
    if (RepairTabReducer.mnrProcessData.pk) {
      let formData = new FormData();
      let files = [
        ...file,
        ...mobileUpload.map((val) => dataURLtoFile(val, "mobile_servey.jpg")),
      ];
      files.map((fileItem) => {
        return formData.append("file_list", fileItem);
      });
      formData.append("location", user.location);
      formData.append("site", user.site);
      if (RepairTabReducer.mnrProcessData?.image_data?.length > 0) {
        formData.append("add", "True");
      } else {
        formData.append("add", "False");
      }

      dispatch(
        uploadRepairImageAction(
          formData,
          RepairTabReducer.mnrProcessData.pk,
          notify,
          setIsImageUploading
        )
      );
      setFile([]);
      setMobileUpload([]);
      fileRef.current.value = "";
    } else {
      notify("Please update survey before uploading images", {
        variant: "error",
      });
      setIsImageUploading(false);
    }
  };

  const handleDownloadPrintJob = () => {
    let obj = {
      pk:
      RepairTabReducer &&
      RepairTabReducer.mnrProcessData.pk 
    };
    dispatch(downloadJobSheet(obj, notify));
  };

  const handleCurrentDateChange = (date) => {
    var selectedDate = new Date(date);
    var dd = String(selectedDate.getDate()).padStart(2, "0");
    var mm = String(selectedDate.getMonth() + 1).padStart(2, "0");
    var yyyy = selectedDate.getFullYear();
    var selectedDateFormat = yyyy + "-" + mm + "-" + dd;
    setCurrentDate(selectedDateFormat);
  };

  useEffect(() => {
    if (RepairTabReducer.mnrProcessData.pk) {
      setPlacement(
        RepairTabReducer.mnrProcessData.placement ? "True" : "False"
      );
      setDamageCategory(RepairTabReducer.mnrProcessData.damage_category);
      setManPower(RepairTabReducer.mnrProcessData.man_power);
      setIsComplete(
        RepairTabReducer.mnrProcessData.complete ? "True" : "False"
      );
      setGrade(RepairTabReducer.mnrProcessData.grade);
      setRemarks(RepairTabReducer.mnrProcessData.remarks);
      setPlacementDate(RepairTabReducer.mnrProcessData.placement_date);
      setPlacementTime(RepairTabReducer.mnrProcessData.placement_time);
      setCreatedBy(RepairTabReducer.mnrProcessData.created_by);
      setUpdatedBy(RepairTabReducer.mnrProcessData.updated_by);
      setRepairDate(RepairTabReducer.mnrProcessData?.repair_date);
      setRepairTime(RepairTabReducer.mnrProcessData?.repair_time);
      setCurrentDate(RepairTabReducer.mnrProcessData.current_repair_date);
      setCurrentTime(RepairTabReducer.mnrProcessData.current_repair_time);

      let samp = [];
      for (
        let i = 0;
        i < RepairTabReducer.mnrProcessData.man_power.length;
        i++
      ) {
        if (RepairTabReducer.mnrProcessData.staff_data) {
          for (
            let j = 0;
            j < RepairTabReducer.mnrProcessData.staff_data.length;
            j++
          ) {
            if (
              RepairTabReducer.mnrProcessData.man_power[i] ===
              RepairTabReducer.mnrProcessData.staff_data[j].pk
            ) {
              samp.push({
                pk: RepairTabReducer.mnrProcessData.staff_data[j].pk,
                name: RepairTabReducer.mnrProcessData.staff_data[j].name,
              });
            }
          }
        }
      }
      setPreSelected(samp);
    }
  }, [RepairTabReducer.mnrProcessData.container_no]);

  const handleContainersList = useCallback(() => {
    dispatch(getContainerListAction());
  }, []);

  return (
    <>
      <Paper
        component="form"
        className={classes.searchPaper}
        elevation={0}
        style={{ position: "relative", alignItems: "center" }}
      >
        {!matchesIpad && (
          <FormControl
            variant="filled"
            style={{ marginTop: "-15px" }}
            size="medium"
          >
            <InputLabel
              id="container_list_select_label"
              shrink={false}
              style={{
                color: "white",
                zIndex: 10,
                fontSize: "15px",
                textAlign: "center",
                padding: "4px 10px 0",
              }}
            >
              Placement Pending
            </InputLabel>
            <Select
              value=""
              id="=container_list_select"
              labelId="container_list_select_label"
              name="client"
              label="Container List"
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
                backgroundColor: "red",
                borderRadius: "5px",
              }}
            >
              {RepairTabReducer.containers_list?.placement_pending_containers.map(
                (val, index) => (
                  <MenuItem
                    key={val}
                    value={val}
                    onClick={() => setSearchContainer(val)}
                  >
                    {val}
                  </MenuItem>
                )
              )}
            </Select>
          </FormControl>
        )}
        {!matchesIpad && (
          <FormControl
            variant="filled"
            size="medium"
            style={{ marginTop: "-15px", marginLeft: "4px" }}
          >
            <InputLabel
              id="container_list_select_label_complete"
              shrink={false}
              style={{
                color: "white",
                zIndex: 10,
                fontSize: "15px",
                textAlign: "center",
                padding: "4px 10px 0",
              }}
            >
              Complete Pending
            </InputLabel>
            <Select
              // value={RepairTabReducer.data.client}
              value=""
              id="=container_list_select_label_complete"
              labelId="container_list_select_label_complete"
              name="client"
              label="Container List"
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
                backgroundColor: "#2a5fa5",
                borderRadius: "5px",
              }}
            >
              {RepairTabReducer.containers_list?.complete_pending_containers.map(
                (val) => (
                  <MenuItem
                    key={val}
                    value={val}
                    onClick={() => setSearchContainer(val)}
                  >
                    {val}
                  </MenuItem>
                )
              )}
            </Select>
          </FormControl>
        )}
        {/* <IconButton
          type="submit"
          className={classes.iconButton}
          aria-label="search"
        >
          <SearchIcon />
        </IconButton> */}
        <InputBase
          id="container-search"
          name="searchText"
          className={classes.input}
          // style={{backgroundColor:"whitesmoke"}}
          placeholder="Search for a Container"
          inputProps={{ "aria-label": "search" }}
          value={searchContainer}
          onChange={onChangeSearchContainer}
          autoComplete="off"
        />
        <Button
          onClick={() =>
            dispatch(
              searchContainerAction(searchContainer, notify, searchContainer)
            )
          }
          className={classes.searchButton}
        >
          Search
        </Button>
      </Paper>
      {matchesIphone && (
        <Stack
          flexDirection={"row"}
          direction={"row"}
          alignItems={"center"}
          justifyContent={"space-between"}
        >
          <FormControl variant="filled" size="medium">
            <InputLabel
              id="container_list_select_label"
              shrink={false}
              style={{
                color: "white",
                zIndex: 10,
                fontSize: "12px",
                textAlign: "center",
                padding: "4px 2px 0",
              }}
            >
              Placement Pending
            </InputLabel>
            <Select
              // value={RepairTabReducer.data.client}
              value=""
              id="=container_list_select"
              labelId="container_list_select_label"
              name="client"
              label="Container List"
              variant="standard"
              inputProps={{
                style: {
                  padding: "0px",
                  marginTop: "-10px",
                },
              }}
              // MenuProps={MenuProps}
              style={{
                width: "150px",
                backgroundColor: "red",
                borderRadius: "5px",
              }}
            >
              {RepairTabReducer.containers_list?.placement_pending_containers.map(
                (val, index) => (
                  <MenuItem
                    key={val}
                    value={val}
                    onClick={() => setSearchContainer(val)}
                  >
                    {val}
                  </MenuItem>
                )
              )}
            </Select>
          </FormControl>
          <FormControl
            variant="filled"
            size="medium"
            style={{ marginLeft: "15px" }}
          >
            <InputLabel
              id="container_list_select_label"
              shrink={false}
              style={{
                color: "white",
                zIndex: 10,
                fontSize: "12px",
                textAlign: "center",
                padding: "4px 2px 0",
              }}
            >
              Complete Pending
            </InputLabel>
            <Select
              // value={RepairTabReducer.data.client}
              value=""
              id="=container_list_select"
              labelId="container_list_select_label"
              name="client"
              label="Container List"
              variant="standard"
              inputProps={{
                style: {
                  padding: "0px",
                  marginTop: "-10px",
                },
              }}
              // MenuProps={MenuProps}
              style={{
                width: "150px",
                backgroundColor: "#2a5fa5",
                borderRadius: "5px",
              }}
            >
              {RepairTabReducer.containers_list?.complete_pending_containers.map(
                (val) => (
                  <MenuItem
                    key={val}
                    value={val}
                    onClick={() => setSearchContainer(val)}
                  >
                    {val}
                  </MenuItem>
                )
              )}
            </Select>
          </FormControl>{" "}
        </Stack>
      )}
      <Paper
        className={classes.paperContainer}
        elevation={0}
        style={{ marginTop: "20px" }}
      >
        <Typography variant="subtitle2" style={{ fontWeight: "bold" }}>
          Container details
        </Typography>
        <Divider style={{ backgroundColor: "black", marginTop: "4px" }} />
        <Grid container spacing={3} style={{ marginTop: "20px" }}>
          <Grid item xs={6} sm={4}>
            <Typography variant="subtitle2">Container</Typography>
            <CustomTextfield
              id="stocks-allot-container-number"
              value={RepairTabReducer.mnrProcessData.container_no}
              // handleChange={(e) => setPlacementDate(e.target.value)}
              // dispatchType={"SET_MNR_ESTIMATE_PLACEMENT_DATE"}
              readOnlyP
            />
          </Grid>
          <Grid item xs={6} sm={4}>
            <Typography variant="subtitle2">Line</Typography>
            <CustomTextfield
              id="stocks-allot-container-number"
              value={RepairTabReducer.mnrProcessData.line}
              // handleChange={(e) => setPlacementDate(e.target.value)}
              // dispatchType={"SET_MNR_ESTIMATE_PLACEMENT_DATE"}
              readOnlyP
            />
          </Grid>
          <Grid item xs={6} sm={4}>
            <Typography variant="subtitle2">Size/Type</Typography>
            <CustomTextfield
              id="stocks-allot-container-number"
              value={RepairTabReducer.mnrProcessData.size_type}
              // handleChange={(e) => setPlacementDate(e.target.value)}
              // dispatchType={"SET_MNR_ESTIMATE_PLACEMENT_DATE"}
              readOnlyP
            />
          </Grid>
          <Grid item xs={6} sm={4}>
            <Typography variant="subtitle2">In Date</Typography>
            <CustomTextfield
              id="stocks-allot-container-number"
              value={RepairTabReducer.mnrProcessData.in_date}
              // handleChange={(e) => setPlacementDate(e.target.value)}
              // dispatchType={"SET_MNR_ESTIMATE_PLACEMENT_DATE"}
              readOnlyP
            />
          </Grid>
          <Grid item xs={6} sm={4}>
            <Typography variant="subtitle2">Condition</Typography>
            <CustomTextfield
              id="stocks-allot-container-number"
              value={RepairTabReducer.mnrProcessData.condition}
              // handleChange={(e) => setPlacementDate(e.target.value)}
              // dispatchType={"SET_MNR_ESTIMATE_PLACEMENT_DATE"}
              readOnlyP
            />
          </Grid>
          <Grid item xs={6} sm={4}>
            <Typography variant="subtitle2">Grade</Typography>
            <CustomTextfield
              id="stocks-allot-container-number"
              value={RepairTabReducer.mnrProcessData.grade}
              // handleChange={(e) => setPlacementDate(e.target.value)}
              // dispatchType={"SET_MNR_ESTIMATE_PLACEMENT_DATE"}
              readOnlyP
            />
          </Grid>
        </Grid>
      </Paper>
      <Paper
        className={classes.paperContainer}
        elevation={0}
        style={{
          marginTop: "20px",
          marginBottom:
            RepairTabReducer.mnrProcessData?.pk &&
            RepairTabReducer.mnrProcessData.complete
              ? "40px"
              : "102px",
          paddingBottom: matchesIphone ? "100px" : "10px",
        }}
      >
        {/* <Typography variant="subtitle2" style={{ fontWeight: "bold" }}>
          Container details
        </Typography>
        <Divider style={{ backgroundColor: "black", marginTop: "4px" }} /> */}
        <Grid container spacing={3} style={{ marginTop: "20px" }}>
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
              Placement?
            </Typography>
            <FormControlLabel
              value="yes"
              control={
                <Radio
                  style={{ color: "#2A5FA5" }}
                  checked={placement === "True"}
                  onClick={() => {
                    setPlacement("True");
                  }}
                />
              }
              label="Yes"
            />
            <FormControlLabel
              value="no"
              control={
                <Radio
                  style={{ color: "#2A5FA5" }}
                  checked={placement === "False"}
                  onClick={() => {
                    setPlacement("False");
                    setDamageCategory("");
                    setManPower([]);
                  }}
                />
              }
              label="No"
            />
          </Grid>
          <Grid item xs={6} sm={3}>
            <Typography variant="subtitle1" className={classes.LabelTypography}>
              Damage Category{" "}
              {placement === "True" && <span style={{ color: "red" }}>*</span>}
            </Typography>
            <TextField
              id="stocks-allot-client-name"
              disabled={placement === "True" ? false : true}
              select
              value={damageCategory}
              variant="outlined"
              fullWidth
              inputProps={{ className: classes.input }}
              className={classes.selectTextField}
              onChange={(e) => {
                setDamageCategory(e.target.value);
              }}
            >
              <MenuItem key={"OK"} value={"OK"}>
                OK
              </MenuItem>
              <MenuItem key={"CLEANING"} value={"CLEANING"}>
                CLEANING
              </MenuItem>
              <MenuItem key={"LD"} value={"LD"}>
                LD
              </MenuItem>
              <MenuItem key={"MD"} value={"MD"}>
                MD
              </MenuItem>
              <MenuItem key={"HD"} value={"HD"}>
                HD
              </MenuItem>
              <MenuItem key={"AV"} value={"AV"}>
                AV
              </MenuItem>
              <MenuItem key={"AR"} value={"AR"}>
                AR
              </MenuItem>
              <MenuItem key={"DM"} value={"DM"}>
                DM
              </MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Typography
              variant="subtitle1"
              className={classes.LabelTypography}
              onClick={() => console.log(manPower)}
            >
              Man Power{" "}
              {placement === "True" && <span style={{ color: "red" }}>*</span>}
            </Typography>
            <Multiselect
              options={RepairTabReducer.mnrProcessData?.staff_data} // Options to display in the dropdown
              selectedValues={preSelected} // Preselected value to persist in dropdown
              onSelect={handleSelectedVal} // Function will trigger on select event
              onRemove={handleRemovedVal} // Function will trigger on remove event
              displayValue="name" // Property name to display in the dropdown options
              disable={placement === "False"}
            />
          </Grid>
          <Grid item xs={6} sm={3}>
            <Typography variant="subtitle1" className={classes.LabelTypography}>
              Man hours
            </Typography>
            <CustomTextfield
              id="stocks-allot-container-number"
              value={RepairTabReducer.mnrProcessData?.man_hours?.toString()}
            
              // dispatchType={"SET_MNR_ESTIMATE_PLACEMENT_DATE"}
              readOnlyP
            />
          </Grid>
          <Grid item xs={6} sm={3}>
            <Typography variant="subtitle1" className={classes.LabelTypography}>
              Placement Date
            </Typography>
            <CustomTextfield
              id="stocks-allot-container-number"
              value={placementDate}
              handleChange={(e) => setPlacementDate(e.target.value)}
              // dispatchType={"SET_MNR_ESTIMATE_PLACEMENT_DATE"}
              readOnlyP
            />
          </Grid>

          <Grid Grid item xs={6} sm={3} style={{ alignSelf: "flex-end" }}>
            <Typography variant="subtitle1" className={classes.LabelTypography}>
              Placement Time
            </Typography>
            <CustomTextfield
              id="stocks-allot-container-number"
              value={placementTime}
              handleChange={(e) => setPlacementTime(e.target.value)}
              // dispatchType={"SET_MNR_ESTIMATE_PLACEMENT_TIME"}
              readOnlyP
            />
          </Grid>
          <Grid item xs={6} sm={3}>
            <Typography variant="subtitle1" className={classes.LabelTypography}>
              Created By
            </Typography>

            <CustomTextfield
              id="stocks-allot-container-number"
              value={createdBy}
              handleChange={(e) => setCreatedBy(e.target.value)}
              readOnlyP
            />
          </Grid>

          <Grid item xs={6} sm={3}>
            <Typography variant="subtitle1" className={classes.LabelTypography}>
              Updated By
            </Typography>

            <CustomTextfield
              id="stocks-allot-container-number"
              value={updatedBy}
              handleChange={(e) => setUpdatedBy(e.target.value)}
              readOnlyP
            />
          </Grid>

          <Grid item xs={6} sm={3}>
            <Typography variant="subtitle1" className={classes.LabelTypography}>
              Repair Date
            </Typography>
            <CustomTextfield
              id="stocks-allot-container-number"
              value={repairDate}
              handleChange={(e) => setRepairDate(e.target.value)}
              readOnlyP
            />
          </Grid>

          <Grid Grid item xs={6} sm={3} style={{ alignSelf: "flex-end" }}>
            <Typography variant="subtitle1" className={classes.LabelTypography}>
              Repair Time
            </Typography>
            <CustomTextfield
              id="stocks-allot-container-number"
              value={repairTime}
              handleChange={(e) => setRepairTime(e.target.value)}
              readOnlyP
            />
          </Grid>
          {RepairTabReducer.mnrProcessData &&
          RepairTabReducer.mnrProcessData.complete === true ? (
            <Grid item xs={6} sm={3} style={{ alignSelf: "flex-end" }}>
              <Typography
                variant="subtitle1"
                className={classes.LabelTypography}
              >
                Current Date
              </Typography>
              <DatePickerField
                dateId="invoice-from-date"
                dateValue={currentDate}
                dateChange={handleCurrentDateChange}
              />
            </Grid>
          ) : (
            <Grid item xs={6} sm={3}>
              <Typography
                variant="subtitle1"
                className={classes.LabelTypography}
              >
                Current Date
              </Typography>

              <CustomTextfield
                id="in-date"
                handleChange={handleCurrentDateChange}
                value={currentDate}
                dispatchType={"SET_MNR_REPAIR_CURRENT_DATE"}
                readOnlyP
              />
            </Grid>
          )}
          {RepairTabReducer.mnrProcessData &&
          RepairTabReducer.mnrProcessData.complete === true ? (
            <Grid item xs={6} sm={3} style={{ alignSelf: "flex-end" }}>
              <Typography
                variant="subtitle1"
                className={classes.LabelTypography}
              >
                Current Time
              </Typography>
              <CustomTextfield
                id="current-time"
                type="time"
                handleChange={(e) => setCurrentTime(e.target.value)}
                value={currentTime}
                dispatchType={"SET_MNR_REPAIR_CURRENT_TIME"}
              />
            </Grid>
          ) : (
            <Grid item xs={6} sm={3} style={{ alignSelf: "flex-end" }}>
              <Typography
                variant="subtitle1"
                className={classes.LabelTypography}
              >
                Current Time
              </Typography>
              <CustomTextfield
                id="current-time"
                type="time"
                handleChange={(e) => setCurrentTime(e.target.value)}
                value={currentTime}
                dispatchType={"SET_MNR_REPAIR_CURRENT_TIME"}
                readOnlyP
              />
            </Grid>
          )}

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
              Is Complete?
            </Typography>
            <FormControlLabel
              value="yes"
              control={
                <Radio
                  style={{ color: "#2A5FA5" }}
                  checked={isComplete === "True"}
                  onClick={() => {
                    setIsComplete("True");
                  }}
                />
              }
              label="Yes"
            />
            <FormControlLabel
              value="no"
              control={
                <Radio
                  style={{ color: "#2A5FA5" }}
                  checked={isComplete === "False"}
                  onClick={() => {
                    setIsComplete("False");
                    setGrade("");
                    setRemarks("");
                  }}
                />
              }
              label="No"
            />
          </Grid>
          <Grid item xs={6} sm={3}>
            <Typography variant="subtitle1" className={classes.LabelTypography}>
              Grade{" "}
              {isComplete === "True" && <span style={{ color: "red" }}>*</span>}
            </Typography>
            <TextField
              id="stocks-allot-client-name"
              disabled={isComplete === "True" ? false : true}
              select
              value={grade}
              variant="outlined"
              fullWidth
              inputProps={{ className: classes.input }}
              className={classes.selectTextField}
              onChange={(e) => {
                setGrade(e.target.value);
              }}
            >
              <MenuItem key={"A"} value={"A"}>
                A
              </MenuItem>
              <MenuItem key={"B"} value={"B"}>
                B
              </MenuItem>
              <MenuItem key={"C"} value={"C"}>
                C
              </MenuItem>
              <MenuItem key={"D"} value={"D"}>
                D
              </MenuItem>
              <MenuItem key={"E"} value={"E"}>
                E
              </MenuItem>
              <MenuItem key={"F"} value={"F"}>
                F
              </MenuItem>
            </TextField>
          </Grid>

          <Grid item xs={6} sm={3}>
            <Typography variant="subtitle1" className={classes.LabelTypography}>
              Remarks
            </Typography>
            {isComplete === "True" ? (
              <CustomTextfield
                id="stocks-allot-container-number"
                value={remarks}
                handleChange={(e) => setRemarks(e.target.value)}
                dispatchType={"SET_MNR_REPAIR_REMARKS"}
              />
            ) : (
              <CustomTextfield
                id="stocks-allot-container-number"
                value={remarks}
                handleChange={(e) => setRemarks(e.target.value)}
                dispatchType={"SET_MNR_REPAIR_REMARKS"}
                readOnlyP
              />
            )}
          </Grid>
         {  (RepairTabReducer?.mnrProcessData?.pk &&
            RepairTabReducer.mnrProcessData.placement ===true) && <Grid item xs={6} sm={3}>
            <Button
              className={classes.downloadButton}
              onClick={handleDownloadPrintJob}
            >
              Download Print Job
            </Button>
          </Grid>}
        </Grid>
      </Paper>

      <Paper
        className={classes.paperContainer}
        elevation={0}
        ref={imageRef}
        style={{
          marginTop: "10px",
          marginBottom: "100px",
          display:
            RepairTabReducer?.mnrProcessData?.pk &&
            RepairTabReducer.mnrProcessData.complete
              ? "block"
              : "none",
        }}
      >
        <Typography variant="subtitle2" style={{ fontWeight: "bold" }}>
          Upload After Repair Image
        </Typography>

        <Stack
          direction={matchesIphone ? "column" : "row"}
          alignItems={"flex-start"}
          flexDirection={matchesIphone ? "column" : "row"}
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
                isImageUploading ? (
                  <CircularProgress size={20} color="success" />
                ) : (
                  <UploadIcon />
                )
              }
              style={{ backgroundColor: "#66bb6a" }}
              disabled={
                (file.length === 0 && mobileUpload.length === 0) ||
                isImageUploading === true
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
            {RepairTabReducer.mnrProcessData?.image_data?.length > 0 &&
              RepairTabReducer.mnrProcessData.image_data?.map((val, index) => (
                <Grid item lg={3} sm={4} key={index}>
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
          display: RepairTabReducer.mnrProcessData.complete ? "none" : "block",
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
            onClick={handleUploadRepair}
          >
            Save Repair
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
