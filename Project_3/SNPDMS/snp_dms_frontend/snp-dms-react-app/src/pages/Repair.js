import React, { useEffect, useRef, useState } from "react";
import { Grid, Button, makeStyles, Typography, Paper } from "@material-ui/core";
import {
  TextField,
  MenuItem,
  FormControlLabel,
  Radio,
  Box,
  Modal,
} from "@material-ui/core";
import { useDispatch, useSelector } from "react-redux";
import { useSnackbar } from "notistack";
import CustomTextfield from "../components/reusableComponents/GateInTextField";
import Checkbox from "../components/reusableComponents/Checkbox";
import {
  createRepair,
  updateRepair,
  downloadJobSheet,
  downloadRepairImage,
  uploadRepairImage,
  deleteRepairImage,
  getMNRProcessByImportRepairAction,
  ediFtpUploadRepair,
  imgFtpUploadRepair
} from "../actions/MNRProcessActions";
import Multiselect from "multiselect-react-dropdown";
import { Image } from "semantic-ui-react";
import DatePickerField from "../components/reusableComponents/DatePickerField";
import { Stack } from "@mui/material";
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import Camera, { FACING_MODES, IMAGE_TYPES } from "react-html5-camera-photo";
import "react-html5-camera-photo/build/css/index.css";
import InfoIcon from "@material-ui/icons/Info";
import { IconButton, Tooltip } from "@mui/material";

const style = {
  position: "absolute",
  top: "52%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "calc(100% - 100px)",
  height: "calc(100% - 20px)",
  bgcolor: "transparent",
  border: "none",
  boxShadow: 24,
  pt: 2,
  px: 4,
  pb: 3,
};

const useStyles = makeStyles((theme) => ({
  paperContainerMNR: {
    padding: theme.spacing(2.5),
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
  LabelTypographycamera: {
    fontSize: "10px !important",
    fontWeight: 600,
    color: "white",
    [theme.breakpoints.down("sm")]: {
      paddingBottom: 1,
    },
  },
  mobileClose: {
    position: "absolute",
    right: "5%",
    top: "10%",
    display: "block",
    zIndex: 100,
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
  paperContainer1: {
    padding: theme.spacing(4, 3),
    marginBottom: 20,
    maxHeight: "500px",
    overflow: "hidden",
    overflowY: "scroll",
  },
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
    padding:"20px 100px",
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
  iconbtn: {
    fontSize: 35,
    fontWeight: 900,
    color: "#000000",
  },
  button: {
    fontSize: 12.5,
    borderRadius: 6,
    width: "100%",
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

  paperContainer: {
    padding: theme.spacing(4, 3),
    marginBottom: 20,
    [theme.breakpoints.down("xs")]: {
      padding: theme.spacing(2, 1),
      marginLeft: "-10px",
    },
  },
  inputfile: {
    display: "none",
  },

  LabelTypography: {
    fontSize: 12,
    fontWeight: 600,
    color: "#243545",
    paddingBottom: 4,
    [theme.breakpoints.down("sm")]: {
      paddingBottom: 1,
    },
  },

  uploadButton: {
    fontSize: 12.5,
    width: "300px",
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
}));

export const Repair = () => {
  const dispatch = useDispatch();
  const classes = useStyles();
  const fileRef = useRef();
  const store = useSelector((state) => state);
  const { MNRProcess, clientMaster, user, MNRGridSearch } = store;
  const notify = useSnackbar().enqueueSnackbar;
  const [placement, setPlacement] = useState("False");
  const [damageCategory, setDamageCategory] = useState("");
  const [manPower, setManPower] = useState([]);
  const [isComplete, setIsComplete] = useState("False");
  const [grade, setGrade] = useState("");
  const [remarks, setRemarks] = useState("");
  const [placementDate, setPlacementDate] = useState("");
  const [placementTime, setPlacementTime] = useState("");
  const [currentDate, setCurrentDate] = useState("");
  const [currentTime, setCurrentTime] = useState("");
  const [createdBy, setCreatedBy] = useState("");
  const [updatedBy, setUpdatedBy] = useState("");
  const [repairDate, setRepairDate] = useState("");
  const [repairTime, setRepairTime] = useState("");
  const [options, setOptions] = useState([]);
  const [preSelected, setPreSelected] = useState([]);
  const [file, setFile] = useState([]);
  const [picture, setPicture] = useState([]);
  const [imgData, setImgData] = useState([]);
  const [isHovered, setIsHovered] = useState(false);

  const fileObj = [];
  const fileArray = [];
  const [openMobile, setOpenMobile] = useState(false);

  const handleCloseMobile = () => setOpenMobile((prev) => !prev);
  const handleMobileClick = () => setOpenMobile(true);

  useEffect(() => {
    if (MNRProcess.mnrProcessData.repair) {
      setPlacement(MNRProcess.mnrProcessData.repair.placement);
      setDamageCategory(MNRProcess.mnrProcessData.repair.damage_category);
      setManPower(MNRProcess.mnrProcessData.repair.man_power);
      setIsComplete(MNRProcess.mnrProcessData.repair.complete);
      setGrade(MNRProcess.mnrProcessData.repair.grade);
      setRemarks(MNRProcess.mnrProcessData.repair.remarks);
      setPlacementDate(MNRProcess.mnrProcessData.repair.placement_date);
      setPlacementTime(MNRProcess.mnrProcessData.repair.placement_time);
      setCreatedBy(MNRProcess.mnrProcessData.repair.created_by);
      setUpdatedBy(MNRProcess.mnrProcessData.repair.updated_by);
      setRepairDate(MNRProcess.mnrProcessData.repair.repair_date);
      setRepairTime(MNRProcess.mnrProcessData.repair.repair_time);
      setCurrentDate(MNRProcess.mnrProcessData.repair.current_repair_date);
      setCurrentTime(MNRProcess.mnrProcessData.repair.current_repair_time);

      let samp = [];
      for (
        let i = 0;
        i < MNRProcess.mnrProcessData.repair.man_power.length;
        i++
      ) {
        if (MNRProcess.mnrProcessData.staff_data.worker_list) {
          for (
            let j = 0;
            j < MNRProcess.mnrProcessData.staff_data.worker_list.length;
            j++
          ) {
            if (
              MNRProcess.mnrProcessData.repair.man_power[i] ===
              MNRProcess.mnrProcessData.staff_data.worker_list[j].pk
            ) {
              samp.push({
                id: MNRProcess.mnrProcessData.staff_data.worker_list[j].pk,
                name:
                  MNRProcess.mnrProcessData.staff_data.worker_list[j]
                    .firstName +
                  " " +
                  MNRProcess.mnrProcessData.staff_data.worker_list[j].lastName,
              });
            }
          }
        }
      }
      setPreSelected(samp);
    }
  }, [MNRProcess.mnrProcessData]);

  useEffect(() => {
    if (MNRProcess?.mnrProcessData?.staff_data?.worker_list) {
      let obj = [];
      for (
        let i = 0;
        i < MNRProcess?.mnrProcessData?.staff_data?.worker_list?.length;
        i++
      ) {
        let sampleObj = {
          name:
            MNRProcess?.mnrProcessData?.staff_data?.worker_list[i]?.firstName +
            " " +
            MNRProcess?.mnrProcessData?.staff_data?.worker_list[i]?.lastName,
          id: MNRProcess?.mnrProcessData?.staff_data?.worker_list[i]?.pk,
        };

        obj.push(sampleObj);
      }
      setOptions(obj);
    }
  }, [MNRProcess?.mnrProcessData]);

  const handleDownloadPrintJob = () => {
    let obj = {
      pk:
        MNRProcess.mnrProcessData &&
        MNRProcess.mnrProcessData.repair &&
        MNRProcess.mnrProcessData.repair.pk,
    };
    dispatch(downloadJobSheet(obj, notify));
  };

  const handleSelectedVal = (value) => {
    let obj = [];
    for (let i = 0; i < value.length; i++) {
      obj.push(value[i].id);
    }
    setManPower(obj);
  };

  const handleRemovedVal = (val) => {
    if (val.length > 0) {
      var array = manPower.filter((item) => item === val[0].id);
      setManPower(array);
    }
  };

  const handleDownloadImage = () => {
    let req = {
      image_id_list: clientMaster.check,
    };
    dispatch(
      downloadRepairImage(
        req,
        MNRProcess.mnrProcessData &&
          MNRProcess.mnrProcessData.repair &&
          MNRProcess.mnrProcessData.repair.pk,
        notify
      )
    );
  };

  const handleDeleteImageRepair = () => {
    let req = {
      image_id_list: clientMaster.check,
    };
    let reqBody = {
      pk:
        MNRProcess.mnrProcessData &&
        MNRProcess.mnrProcessData.repair &&
        MNRProcess.mnrProcessData.repair.pk,
      reload_container_no:
        MNRProcess.mnrProcessData.container_data &&
        MNRProcess.mnrProcessData.container_data.container_no,
      reload_container_date:
        MNRProcess.mnrProcessData.container_data &&
        MNRProcess.mnrProcessData.container_data.in_date,
    };

    dispatch(
      deleteRepairImage(
        req,
        MNRProcess.mnrProcessData &&
          MNRProcess.mnrProcessData.repair &&
          MNRProcess.mnrProcessData.repair.pk,
        reqBody,
        notify
      )
    );
    let tempFileArray = [];
    setFile(tempFileArray);
    setMobileUpload([]);
    fileRef.current.value = "";
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
    setPicture(e.target.files[0]);
    const reader = new FileReader();
    reader.addEventListener("load", () => {
      setImgData(reader.result);
    });
    reader.readAsDataURL(e.target.files[0]);
  };

  const [mobileUpload, setMobileUpload] = useState([]);
  function handleTakePhoto(dataUri) {
    if (mobileUpload.length >= 10) {
      notify("Upload Limit Extended ", { variant: "error" });
    }
    setMobileUpload((prev) => [...prev, dataUri]);
    setOpenMobile(false);
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
        MNRProcess.mnrProcessData.repair &&
        MNRProcess.mnrProcessData.repair.pk,
      reload_container_no:
        MNRProcess.mnrProcessData.container_data &&
        MNRProcess.mnrProcessData.container_data.container_no,
      reload_container_date:
        MNRProcess.mnrProcessData.container_data &&
        MNRProcess.mnrProcessData.container_data.in_date,
    };
    dispatch(uploadRepairImage(formData, reqBody, notify));
    let tempFileArray = [];
    setFile(tempFileArray);
    fileRef.current.value = "";
  };

  const handleCurrentDateChange = (date) => {
    var selectedDate = new Date(date);
    var dd = String(selectedDate.getDate()).padStart(2, "0");
    var mm = String(selectedDate.getMonth() + 1).padStart(2, "0");
    var yyyy = selectedDate.getFullYear();
    var selectedDateFormat = yyyy + "-" + mm + "-" + dd;
    setCurrentDate(selectedDateFormat);
  };

  return (
    <>
      <Paper className={classes.paperContainer} elevation={0}>
        {/* {location.state?.import_repair && (
          <Stack
            flexDirection={"row"}
            direction={"row"}
            alignItems={"center"}
            justifyContent={"flex-end"}
            display={location.state.import ? "flex" : "none"}
          >
            <Button
              variant="contained"
              style={{ backgroundColor: "#2a5fa5", color: "white" }}
              onClick={() =>
                dispatch(
                  getMNRProcessByImportRepairAction(
                    MNRProcess.mnrProcessData.container_data.container_no,
                    notify,
                    history
                  )
                )
              }
            >
              Import
            </Button>
          </Stack>
        )} */}
        <Grid container spacing={3} style={{ paddingTop: 20 }}>
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
            <Typography variant="subtitle1" className={classes.LabelTypography}>
              Man Power{" "}
              {placement === "True" && <span style={{ color: "red" }}>*</span>}
            </Typography>
            <Multiselect
              options={options} // Options to display in the dropdown
              selectedValues={preSelected} // Preselected value to persist in dropdown
              onSelect={handleSelectedVal} // Function will trigger on select event
              onRemove={handleRemovedVal} // Function will trigger on remove event
              displayValue="name" // Property name to display in the dropdown options
              disable={placement === "False"}
            />
          </Grid>

          <Grid item xs={6} sm={3}>
            <Typography variant="subtitle1" className={classes.LabelTypography}>
              Man Hours
            </Typography>
            <CustomTextfield
              id="stocks-allot-container-number"
              value={MNRProcess.mnrProcessData?.repair?.man_hours?.toString()}
              readOnlyP
              handleChange={(e) => console.log("")}
              dispatchType={""}
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
              dispatchType={"SET_MNR_ESTIMATE_PLACEMENT_DATE"}
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
              dispatchType={"SET_MNR_ESTIMATE_PLACEMENT_TIME"}
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
              dispatchType={"SET_MNR_ESTIMATE_CREATED_BY"}
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
              dispatchType={"SET_MNR_ESTIMATE_UPDATED_BY"}
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
              dispatchType={"SET_MNR_ESTIMATE_REPAIR_DATE"}
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
              dispatchType={"SET_MNR_ESTIMATE_REPAIR_TIME"}
              readOnlyP
            />
          </Grid>

          {MNRProcess.mnrProcessData.repair &&
          MNRProcess.mnrProcessData.repair.complete === "True" ? (
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

          {MNRProcess.mnrProcessData.repair &&
          MNRProcess.mnrProcessData.repair.complete === "True" ? (
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
          {MNRProcess.mnrProcessData &&
            MNRProcess.mnrProcessData.repair &&
            MNRProcess.mnrProcessData.repair.placement === "True" && (
              <Grid item xs={6} sm={3}>
                <Button
                  className={classes.downloadButton}
                  onClick={handleDownloadPrintJob}
                >
                  Download Print Job
                </Button>
              </Grid>
            )}
        </Grid>

        <Grid
          container
          spacing={3}
          style={{
            alignItems: "center",
            justifyContent: "center",
            paddingTop: 20,
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
            {MNRProcess.mnrProcessData.repair &&
            MNRProcess.mnrProcessData.repair.is_proceed === "True" ? (
              <>
                <Button
                  className={classes.searchButton2}
                  onClick={() => {
                    let req = {};
                    if (placement === "True" && damageCategory === "")
                      notify("Please Enter Damage Category", {
                        variant: "warning",
                      });
                    else if (placement === "True" && manPower.length === 0)
                      notify("Please Enter Man Power", {
                        variant: "warning",
                      });
                    else if (isComplete === "True" && grade === "")
                      notify("Please Enter Grade", {
                        variant: "warning",
                      });
                    else {
                      req = {
                        pk:
                          MNRProcess.mnrProcessData.repair &&
                          MNRProcess.mnrProcessData.repair.pk,
                        estimate_id:
                          MNRProcess.mnrProcessData.repair &&
                          MNRProcess.mnrProcessData.repair.estimate_id,
                        location: localStorage.getItem("location")
                          ? localStorage.getItem("location")
                          : null,
                        site: localStorage.getItem("site")
                          ? localStorage.getItem("site")
                          : null,
                        placement: placement,
                        damage_category: damageCategory,
                        man_power: manPower,
                        current_repair_date: currentDate,
                        current_repair_time: currentTime,
                        complete: isComplete,
                        grade: grade,
                        remarks: remarks,
                        is_draft:
                          MNRProcess.mnrProcessData.repair &&
                          MNRProcess.mnrProcessData.repair.is_draft,
                        is_proceed:
                          MNRProcess.mnrProcessData.repair &&
                          MNRProcess.mnrProcessData.repair.is_proceed,
                      };
                      let reloadObj = {
                        reload_container_no:
                          MNRProcess.mnrProcessData.container_data &&
                          MNRProcess.mnrProcessData.container_data.container_no,
                        reload_container_date:
                          MNRProcess.mnrProcessData.container_data &&
                          MNRProcess.mnrProcessData.container_data.in_date,
                      };
                      console.log(req);
                      dispatch(updateRepair(req, reloadObj, notify));
                    }
                  }}
                >
                  Update
                </Button>
               
                 {(MNRProcess?.mnrProcessData?.container_data?.mnr_ftp_upload === true) || (MNRGridSearch?.stage === "Available" ) ? (
                  <>
                    <Button
                      className={classes.searchButton2}
                      onClick={() => {
                        dispatch(
                          ediFtpUploadRepair(
                            MNRProcess?.mnrProcessData?.repair?.pk,
                            notify
                          )
                        );
                      }}
                      disabled={
                        MNRProcess?.mnrProcessData?.repair?.ftp_upload_successful === "True" || 
                        MNRProcess?.mnrProcessData?.repair?.pk===0
                      }
                    >
                      EDI FTP Upload
                    </Button>
                    <Button
                      className={classes.searchButton2}
                      onClick={() => {
                        dispatch(
                          imgFtpUploadRepair(
                            MNRProcess?.mnrProcessData.repair?.pk,
                            notify
                          )
                        );
                      }}
                      disabled={
                        MNRProcess?.mnrProcessData.repair?.ftp_upload_successful === "True" || 
                        MNRProcess?.mnrProcessData?.repair?.pk===0
                      }
                    >
                      Image FTP Upload
                    </Button>
                  </>
                ) : (
                  ""
                )}
              </>
            ) : (
              <Button
                className={classes.searchButton2}
                onClick={() => {
                  let req = {};
                  if (placement === "True" && damageCategory === "")
                    notify("Please Enter Damage Category", {
                      variant: "warning",
                    });
                  else if (placement === "True" && manPower.length === 0)
                    notify("Please Enter Man Power", {
                      variant: "warning",
                    });
                  else if (isComplete === "True" && grade === "")
                    notify("Please Enter Grade", {
                      variant: "warning",
                    });
                  else {
                    req = {
                      estimate_id:
                        MNRProcess.mnrProcessData.repair &&
                        MNRProcess.mnrProcessData.repair.estimate_id,
                      location: localStorage.getItem("location")
                        ? localStorage.getItem("location")
                        : null,
                      site: localStorage.getItem("site")
                        ? localStorage.getItem("site")
                        : null,
                      placement: placement,
                      damage_category: damageCategory,
                      man_power: manPower,
                      complete: isComplete,
                      grade: grade,
                      remarks: remarks,
                      is_draft: "True",
                      is_proceed: "False",
                      reload_container_no:
                        MNRProcess.mnrProcessData.container_data &&
                        MNRProcess.mnrProcessData.container_data.container_no,
                      reload_container_date:
                        MNRProcess.mnrProcessData.container_data &&
                        MNRProcess.mnrProcessData.container_data.in_date,
                    };
                    console.log(req);
                    dispatch(createRepair(req, notify));
                  }
                }}
              >
                Save
              </Button>
            )}
          </Grid>
        </Grid>

        {MNRProcess.mnrProcessData.repair &&
          MNRProcess.mnrProcessData.repair.is_proceed === "True" && (
            <>
              {/* {MNRProcess.mnrProcessData?.repair?.repair_images.length ===
                0 && (
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
                  Upload after survey images
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
                      <Box sx={style}>
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
                            className={classes.mobileClose}
                            onClick={handleCloseMobile}
                          >
                            Close
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
                  </Stack>

                  {MNRProcess.mnrProcessData.repair &&
                  MNRProcess?.mnrProcessData?.repair?.is_img_uploaded ===
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
                  {MNRProcess.mnrProcessData.repair &&
                  MNRProcess?.mnrProcessData?.repair?.is_img_uploaded ===
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
                          Add - Click this when you want images to merge into
                          the existing set of already uploaded images and this
                          is also used while while uploading images for the
                          first time
                        </p>
                      )}
                      {isHovered && (
                        <p style={{ color: "red" }}>
                          Replace - Click this when you want to images to
                          replace the existing set of uploaded images and this
                          always appears after upload the first set of images.
                        </p>
                      )}
                    </div>
                  ) : (
                    ""
                  )}
                </form>
              </Paper>

              {/* ** Mapping container Images  */}
              <Paper>
                <Grid className={classes.containerWrapperImage}>
                  {MNRProcess.mnrProcessData.repair &&
                    MNRProcess.mnrProcessData.repair.repair_images?.map(
                      (item, key) => {
                        return (
                          <>
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
                          </>
                        );
                      }
                    )}
                </Grid>
                {MNRProcess.mnrProcessData.repair && (
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
                      onClick={handleDeleteImageRepair}
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
