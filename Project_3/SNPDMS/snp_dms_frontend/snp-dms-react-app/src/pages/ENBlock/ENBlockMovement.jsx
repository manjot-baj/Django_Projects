import React, { useCallback, useEffect, useState } from "react";
import LayoutContainer from "../../components/reusableComponents/LayoutContainer";
import CustomHeading from "../../components/CustomHeading";
import CustomReactTable from "../../components/CustomReactTable";
import { useSnackbar } from "notistack";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSort } from "@fortawesome/free-solid-svg-icons";
import { useDispatch, useSelector } from "react-redux";
import {
  addEnBLockDataAction,
  downloadEnBlockReportFileAction,
  getEnBLockDataByPkAction,
  getEnBLockListingAction,
  getEnBLockVesselVoyageNameDataAction,
  updateEnBlockAction,
} from "../../actions/EnBlockMovementAction";
import { ENBLOCK_REDUCER_CONST } from "../../reducers/EnBlockReducer";
import {
  Backdrop,
  Box,
  Button,
  CircularProgress,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  makeStyles,
  MenuItem,
  Modal,
  Select,
  TextField,
  Typography,
} from "@material-ui/core";
import AutomationSearch from "../../components/reusableComponents/AutomationSearch";
import { theme } from "../../App";
import GateInTextField from "../../components/reusableComponents/GateInTextField";
import { Link } from "react-router-dom";
import RefreshOutlinedIcon from "@mui/icons-material/RefreshOutlined";
import AddCircleOutlineOutlinedIcon from "@mui/icons-material/AddCircleOutlineOutlined";
import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import { Autocomplete } from "@mui/material";
import { dropDownDispatch } from "../../actions/GateInActions";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 700,
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 4,
  borderRadius: "8px",
};

const useStyles = makeStyles((theme) => ({
  bulkUploadColor: {
    backgroundColor: theme.palette.text.secondary,
  },
  searchPaper: {
    borderRadius: 0,
    backgroundColor: "transparent",
    color: theme.palette.text.primary,
    position: "relative",
    width: "calc(100% - 50%)",
    margin: "auto",
    marginLeft: "0px",
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
  searchPaperProcurement: {
    borderRadius: 0,
    backgroundColor: "transparent",
    color: theme.palette.text.primary,
    position: "relative",
    width: "100%",
    margin: "auto",
    marginLeft: "0px",
  },
  backdrop: {
    zIndex: theme.zIndex.drawer + 1,
    color: "#fff",
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
  inputProcess: {
    marginLeft: theme.spacing(1),
    flex: 1,
    "&.MuiInput-underline:before": {
      borderBottom: "none",
    },
    "&.MuiInput-underline:after": {
      borderBottom: "none",
    },
    padding: "0 10px",
    [theme.breakpoints.down("xs")]: {
      padding: 1,
      fontSize: "0.8rem",
    },
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
  autocomplete: {
    "& .MuiAutocomplete-inputRoot[class*='MuiOutlinedInput-root']": {
      padding: 0,
    },
  },
}));

const ENBlockMovement = () => {
  const notify = useSnackbar().enqueueSnackbar;
  const dispatch = useDispatch();
  const classes = useStyles();
  const [open, setOpen] = React.useState(false);
  const [process, setProcess] = useState("vessel_no");

  const { ui, gateIn ,user} = useSelector((state) => state);
  const { enBlockListing, enBlock_data ,enBlock_Vessel_Voyage_Name} = useSelector(
    (store) => store.EnBlockReducer
  );
  const [searchText, setSearchText] = useState("");
  const [enBlockEdit, setEnBlockEdit] = useState({
    line: "",
    job_order_no: "",
    vessel_no: "",
    quantity: 0,
    voyage_no: "",
    gate_ins: 0,
    pendency: 0,
  });
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    let reqArray = ["client_ref_codes"];
    dispatch(dropDownDispatch(reqArray, notify));
    dispatch(getEnBLockListingAction(notify));
    dispatch(getEnBLockVesselVoyageNameDataAction(notify))
  }, []);

  useEffect(() => {
    if (enBlock_data.vessel_no !== "") {
      setEnBlockEdit((prev) => ({ ...prev, ...enBlock_data }));
    }
  }, [enBlock_data]);

  const handleOpen = (original) => {
    dispatch(
      getEnBLockDataByPkAction(original.pk, notify, setOpen, setEnBlockEdit)
    );
  };
  const handleClose = () => {
    setIsEditing(false);
    setOpen(false);
    setEnBlockEdit({
      line: "",
      job_order_no: "",
      vessel_no: "",
      quantity: 0,
      voyage_no: "",
      gate_ins: 0,
      pendency: 0,
    });
    dispatch({ type: ENBLOCK_REDUCER_CONST.EN_BLOCK_EDIT_INIT });
  };

  const handleAddEnBlock = () => {
    setOpen(true);
    setIsEditing(true);
  };

  const Columns = [
    {
      Header: (
        <b style={{ color: "#2A5FA5" }}>
          Line
          <FontAwesomeIcon icon={faSort} />
        </b>
      ),
      accessor: "line",
      style: {
        textAlign: "center",
        cursor: "pointer",
      },
      Cell: (row) => {
        return (
          <div>
            <span title={row.original}>{row.original.line}</span>
          </div>
        );
      },
    },
    {
      Header: (
        <b style={{ color: "#2A5FA5" }}>
          Job Order No
          <FontAwesomeIcon icon={faSort} />
        </b>
      ),
      accessor: "job_order_no",
      style: {
        textAlign: "center",
        cursor: "pointer",
      },
      Cell: (row) => {
        return (
          <div>
            <span title={row.original}>{row.original.job_order_no}</span>
          </div>
        );
      },
    },
    {
      Header: (
        <b style={{ color: "#2A5FA5" }}>
          Vessel Voyage No <FontAwesomeIcon icon={faSort} />
        </b>
      ),
      accessor: "vessel_voyage_no",
      style: {
        textAlign: "center",
        cursor: "pointer",
      },
      Cell: (row) => {
        return (
          <div>
            <span title={row.original.vessel_voyage_no}>
              {row.original.vessel_voyage_no}
            </span>
          </div>
        );
      },
    },
    {
      Header: (
        <b style={{ color: "#2A5FA5" }}>
          Quantity <FontAwesomeIcon icon={faSort} />
        </b>
      ),
      accessor: "quantity",
      style: {
        textAlign: "center",
        cursor: "pointer",
      },
      Cell: (row) => {
        return (
          <div>
            <span title={row.original.quantity}>{row.original.quantity}</span>
          </div>
        );
      },
    },
    {
      Header: (
        <b style={{ color: "#2A5FA5" }}>
          Gate Ins <FontAwesomeIcon icon={faSort} />
        </b>
      ),
      accessor: "gate_ins",
      style: {
        textAlign: "center",
        cursor: "pointer",
      },
      Cell: (row) => {
        return (
          <div>
            <span title={row.original.gate_ins}>{row.original.gate_ins}</span>
          </div>
        );
      },
    },
    {
      Header: (
        <b style={{ color: "#2A5FA5" }}>
          Pendency <FontAwesomeIcon icon={faSort} />
        </b>
      ),
      accessor: "pendency",
      style: {
        textAlign: "center",
        cursor: "pointer",
      },
      Cell: (row) => {
        return (
          <div>
            <span title={row.original.pendency}>{row.original.pendency}</span>
          </div>
        );
      },
    },
    
    {
      Header: (
        <b style={{ color: "#2A5FA5" }}>
          Discarded <FontAwesomeIcon icon={faSort} />
        </b>
      ),
      show:user.en_block_movement_v2 ==="True" || user.en_block_movement_v2 ==="true"||user.en_block_movement_v2 === true,
      accessor: "discarded",
      style: {
        textAlign: "center",
        cursor: "pointer",
      },
      Cell: (row) => {
        return (
          <div>
            <span title={row.original.discarded}>{row.original.discarded}</span>
          </div>
        );
      },
    },
    {
      Header: (
        <b style={{ color: "#2A5FA5" }}>
          Report <FontAwesomeIcon icon={faSort} />
        </b>
      ),
      accessor: "pendency",
      style: {
        textAlign: "center",
        cursor: "pointer",
      },
      Cell: (row) => {
        return (
          <Button
            startIcon={<FileDownloadOutlinedIcon />}
            variant="text"
            color="primary"
            onClick={() => handleDownloadReport(row.original.job_order_no)}
          >
            En Block Report
          </Button>
        );
      },
    },
    {
      Header: (
        <b style={{ color: "#2A5FA5" }}>
          Action <FontAwesomeIcon icon={faSort} />
        </b>
      ),
      show:(user.en_block_movement ==="True"||user.en_block_movement ==='true' ||user.en_block_movement ===true),
      style: {
        textAlign: "center",
        cursor: "pointer",
      },
      Cell: (row) => {
        return (
          <Button
            startIcon={<EditOutlinedIcon />}
            variant="text"
            color="primary"
            onClick={() => handleOpen(row.original)}
          >
            Update
          </Button>
        );
      },
    },
  ];

  const handleSearchChange = useCallback(
    (e) => {
      setSearchText(e.target.value);
    },
    [searchText]
  );

  const handleSearchButton = useCallback(() => {
    dispatch({ type: ENBLOCK_REDUCER_CONST.EN_BLOCK_REDUCER_LISTING_INIT });
    dispatch({
      type: ENBLOCK_REDUCER_CONST.EN_BLOCK_REDUCER_LISTING,
      payload: {
        vessel_no: process === "vessel_no" ? searchText : "",
        voyage_no: process === "voyage_no" ? searchText : "",
        job_order_no: process === "job_order_no" ? searchText : "",
      },
    });
    dispatch(getEnBLockListingAction(notify));
  }, [searchText, notify, process]);

  const handleCloseClick = useCallback(() => setSearchText(""), [searchText]);

  const handleSetProcess = useCallback(
    (e) => setProcess(e.target.value),
    [process]
  );

  const prevEnBlockPage = () => {
    dispatch({
      type: ENBLOCK_REDUCER_CONST.EN_BLOCK_REDUCER_LISTING,
      payload: { page_no: Number(enBlockListing.page_no) - 1 },
    });
    dispatch(getEnBLockListingAction(notify));
  };

  const handleEnblockChange = () => {
    dispatch({
      type: ENBLOCK_REDUCER_CONST.EN_BLOCK_REDUCER_LISTING,
      payload: { page_no: Number(enBlockListing.page_no) + 1 },
    });
    dispatch(getEnBLockListingAction(notify));
  };

  const handleInitialPage = () => {
    dispatch({
      type: ENBLOCK_REDUCER_CONST.EN_BLOCK_REDUCER_LISTING,
      payload: { page_no: 1 },
    });
    dispatch(getEnBLockListingAction(notify));
  };

  const handleFetchData = () => {
    dispatch(getEnBLockListingAction(notify));
  };
  const handleEnBlockOnPageDataClientChange = (value) => {
    dispatch({
      type: ENBLOCK_REDUCER_CONST.EN_BLOCK_REDUCER_LISTING,
      payload: { on_page_data_client: value, page_no: 1 },
    });
    dispatch(getEnBLockListingAction(notify));
  };

  const handleNextEnBlockPage = () => {
    dispatch({
      type: ENBLOCK_REDUCER_CONST.EN_BLOCK_REDUCER_LISTING,
      payload: { page_no: Number(enBlockListing.page_no) + 1 },
    });
    dispatch(getEnBLockListingAction(notify));
  };

  const handleChange = (e) => {
    const { value, name } = e.target;
    setEnBlockEdit((prev) => ({ ...prev, [name]: value }));
  };
  const handleRefresh = () => {
    dispatch({ type: ENBLOCK_REDUCER_CONST.EN_BLOCK_REDUCER_LISTING_INIT });
    dispatch(getEnBLockListingAction(notify));
  };

  const handleDownloadReport = (job_order_no) => {
    dispatch(downloadEnBlockReportFileAction(job_order_no, notify));
  };

  const handleUpdateEnBlock = () => {
    dispatch(updateEnBlockAction(enBlockEdit, notify, setOpen));
  };

  const handleAddEnBlockData = () => {
    if (enBlockEdit.line === "") {
      notify("Line is required", { variant: "warning" });
    } else if (enBlockEdit.job_order_no === "") {
      notify("Job Order No is required ", { variant: "warning" });
    } else if (enBlockEdit.vessel_no === "") {
      notify("Vessel No is required", { variant: "warning" });
    } else if (enBlockEdit.voyage_no === "") {
      notify("Voyage No is reqiuired", { variant: "warning" });
    } else if (enBlockEdit.quantity === "" || enBlockEdit.quantity <= 0) {
      notify("Quantity is required", { variant: "warning" });
    } else {
      let addData = {
        line: enBlockEdit.line,
        job_order_no: enBlockEdit.job_order_no,
        vessel_name: enBlockEdit.vessel_no,
        voyage_no: enBlockEdit.voyage_no,
        quantity: Number(enBlockEdit.quantity),
        gate_ins: 0,
        pendency: Number(enBlockEdit.quantity),
      };

      dispatch(addEnBLockDataAction(addData, notify, handleClose));
    }
  };

  return (
    <LayoutContainer>
      <CustomHeading variant="body1" customClass="pageTitle">
        En Block Movement
      </CustomHeading>
      <Box mt={8}></Box>
      <Grid container spacing={2}>
        <Grid item md={6}>
          <AutomationSearch
            searchText={searchText}
            handleSearchChange={handleSearchChange}
            handleSearchButton={handleSearchButton}
            handleCloseClick={handleCloseClick}
            // handleSetProcess={handleSetProcess}
            procurement={true}
            process={process?.split("_")?.join(" ")}
          >
            <FormControl
              variant="standard"
              style={{ marginTop: "-15px", marginLeft: "10px" }}
            >
              <InputLabel
                id="container_list_select_label"
                style={{
                  color: "grey",
                  zIndex: 10,
                  fontSize: "15px",
                  textAlign: "center",
                  padding: "0 10px",
                  marginTop: "-10px",
                  display: "none",
                }}
              >
                Process
              </InputLabel>
              <Select
                id="container_list_select"
                value={process}
                labelId="container_list_select_label"
                name="client"
                defaultValue={process}
                label="Process"
                variant="standard"
                onChange={handleSetProcess}
                className={classes.inputProcess}
                inputProps={{
                  style: {
                    padding: "0px 10px",
                    marginTop: "-10px",
                    outline: "none",
                  },
                }}
                style={{
                  width: "100px",
                  backgroundColor: "transparent",
                  border: "0.5px solid rgba(0,0,0,0.2)",

                  borderRadius: "32px",
                  outline: "none",
                }}
              >
                <MenuItem key={"vessel_no"} value="vessel_no">
                  Vessel No
                </MenuItem>
                <MenuItem key={"voyage_no"} value="voyage_no">
                  Voyage No
                </MenuItem>
                <MenuItem key={"job_order_no"} value="job_order_no">
                  Job Order No
                </MenuItem>
              </Select>
            </FormControl>
          </AutomationSearch>
        </Grid>
        <Grid item md={6} style={{ textAlign: "end", alignItems: "center" }}>
         { (user.en_block_movement ==="True"||user.en_block_movement ==='true' ||user.en_block_movement ===true) && <Link to="/enBlock/bulk-upload" style={{ marginRight: "8px" }}>
            <Button
              startIcon={<CloudUploadOutlinedIcon fontSize="small" />}
              variant="text"
              color="primary"
              className={classes.bulkUploadColor}
            >
              Bulk Upload
            </Button>
          </Link>}
          {/* <Button
            startIcon={<AddCircleOutlineOutlinedIcon fontSize="small" />}
            variant="text"
            color="primary"
            className={classes.bulkUploadColor}
            onClick={handleAddEnBlock}
          >
            Add En Block
          </Button> */}

          <IconButton onClick={handleRefresh}>
            <RefreshOutlinedIcon style={{ fill: "#3265a8" }} fontSize="small" />
          </IconButton>
        </Grid>
      </Grid>
      <Box mt={4}></Box>
      <CustomReactTable
        data={enBlockListing.data || []}
        columns={[...Columns]}
        enableFooter
        minRows={enBlockListing.on_page_data_client}
        
        prevReactPage={prevEnBlockPage}
        React_pg_no={enBlockListing.page_no}
        notify={notify}
        React_total_pages={enBlockListing.total_pages}
        handleReact_change_page={handleEnblockChange}
        handleReact_initial_page={handleInitialPage}
        fetchReact_page={handleFetchData}
        on_page_data_client={enBlockListing.on_page_data_client}
        handleReact_change_page_data_client={
          handleEnBlockOnPageDataClientChange
        }
        nextReactPage={handleNextEnBlockPage}
        next_React_page={enBlockListing.next_page}
      />
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style} style={{ outline: "none" }}>
          <Typography id="modal-modal-title" variant="body2" component="h2">
            En Block Data
          </Typography>
          <Box mt={4}></Box>
          <Grid container spacing={2}>
            <Grid
              item
              xs={12}
              sm={6}
              lg={4}
              style={theme.breakpoints.down("sm") && { padding: 7 }}
            >
              <Typography
                variant="subtitle1"
                className={classes.LabelTypography}
              >
                Line <span style={{ color: "red" }}>*</span>
              </Typography>
              {isEditing ? (
                <Autocomplete
                  id="report-line"
                  freeSolo={true}
                  value={enBlockEdit.line}
                  noOptionsText="No Reports Available"
                  options={
                    gateIn?.allDropDown &&
                    gateIn?.allDropDown?.report_shipping_lines &&
                    gateIn?.allDropDown?.report_shipping_lines
                  }
                  getOptionLabel={(option) => option}
                  style={{ padding: 0 }}
                  className={classes.autocomplete}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      autoComplete="off"
                      value={enBlockEdit.line}
                      className={classes.textField}
                      onBlur={(e) => {
                        setEnBlockEdit((prev) => ({
                          ...prev,
                          line: e.target.value,
                        }));
                      }}
                      fullWidth
                      variant="outlined"
                    />
                  )}
                />
              ) : (
                <GateInTextField
                  name={"line"}
                  readOnlyP={isEditing ? false : true}
                  value={enBlockEdit.line}
                  handleChange={handleChange}
                />
              )}
            </Grid>
            <Grid
              item
              xs={12}
              sm={6}
              lg={4}
              style={theme.breakpoints.down("sm") && { padding: 7 }}
            >
              <Typography
                variant="subtitle1"
                className={classes.LabelTypography}
              >
                Job Order No <span style={{ color: "red" }}>*</span>
              </Typography>
              <GateInTextField
                readOnlyP={isEditing ? false : true}
                value={enBlockEdit.job_order_no}
                name={"job_order_no"}
                handleChange={handleChange}
              />
            </Grid>
            <Grid
              item
              xs={12}
              sm={6}
              lg={4}
              style={theme.breakpoints.down("sm") && { padding: 7 }}
            >
              <Typography
                variant="subtitle1"
                className={classes.LabelTypography}
              >
                Vessel Name <span style={{ color: "red" }}>*</span>
              </Typography>
            { isEditing ?
             <Autocomplete
             id="report-line"
             freeSolo={true}
             value={enBlockEdit.vessel_no}
             noOptionsText="No Reports Available"
             options={
               enBlock_Vessel_Voyage_Name?.data?.vessel_name &&
               enBlock_Vessel_Voyage_Name?.data?.vessel_name 
              
             }
             getOptionLabel={(option) => option}
             style={{ padding: 0 }}
             className={classes.autocomplete}
             renderInput={(params) => (
               <TextField
                 {...params}
                 autoComplete="off"
                 value={enBlockEdit.vessel_no}
                 className={classes.textField}
                 onBlur={(e) => {
                   setEnBlockEdit((prev) => ({
                     ...prev,
                     vessel_no: e.target.value,
                   }));
                 }}
                 fullWidth
                 variant="outlined"
               />
             )}
           />
            : <GateInTextField
                readOnlyP={isEditing ? false : true}
                value={enBlockEdit.vessel_no}
                name={"vessel_no"}
                handleChange={handleChange}
              />}
            </Grid>
            <Grid
              item
              xs={12}
              sm={6}
              lg={4}
              style={theme.breakpoints.down("sm") && { padding: 7 }}
            >
              <Typography
                variant="subtitle1"
                className={classes.LabelTypography}
              >
                Voyage No <span style={{ color: "red" }}>*</span>
              </Typography>
            { isEditing ?
                <Autocomplete
                id="report-line"
                freeSolo={true}
                value={enBlockEdit.voyage_no}
                noOptionsText="No Reports Available"
                options={
                  enBlock_Vessel_Voyage_Name?.data?.voyage_no &&
                  enBlock_Vessel_Voyage_Name?.data?.voyage_no ||[] 
                 
                }
                getOptionLabel={(option) => option}
                style={{ padding: 0 }}
                className={classes.autocomplete}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    autoComplete="off"
                    value={enBlockEdit.voyage_no}
                    className={classes.textField}
                    onBlur={(e) => {
                      setEnBlockEdit((prev) => ({
                        ...prev,
                        voyage_no: e.target.value,
                      }));
                    }}
                    fullWidth
                    variant="outlined"
                  />
                )}
              />
            : <GateInTextField
                readOnlyP={isEditing ? false : true}
                value={enBlockEdit.voyage_no}
                name={"voyage_no"}
                handleChange={handleChange}
              />}
            </Grid>
            <Grid
              item
              xs={12}
              sm={6}
              lg={4}
              style={theme.breakpoints.down("sm") && { padding: 7 }}
            >
              <Typography
                variant="subtitle1"
                className={classes.LabelTypography}
              >
                Quantity <span style={{ color: "red" }}>*</span>
              </Typography>
              <GateInTextField
                value={enBlockEdit.quantity}
                name={"quantity"}
                handleChange={handleChange}
              />
            </Grid>
            {!isEditing && (
              <Grid
                item
                xs={12}
                sm={6}
                lg={4}
                style={theme.breakpoints.down("sm") && { padding: 7 }}
              >
                <Typography
                  variant="subtitle1"
                  className={classes.LabelTypography}
                >
                  Gate Ins <span style={{ color: "red" }}>*</span>
                </Typography>
                <GateInTextField
                  readOnlyP={isEditing ? false : true}
                  value={enBlockEdit.gate_ins?.toString()}
                  name={"gate_ins"}
                  handleChange={handleChange}
                />
              </Grid>
            )}
            {!isEditing && (
              <Grid
                item
                xs={12}
                sm={6}
                lg={4}
                style={theme.breakpoints.down("sm") && { padding: 7 }}
              >
                <Typography
                  variant="subtitle1"
                  className={classes.LabelTypography}
                >
                  Pendency <span style={{ color: "red" }}>*</span>
                </Typography>
                <GateInTextField
                  readOnlyP={isEditing ? false : true}
                  value={enBlockEdit.pendency}
                  name="pendency"
                  handleChange={handleChange}
                />
              </Grid>
            )}
            <Grid
              item
              xs={12}
              sm={12}
              lg={12}
              style={
                theme.breakpoints.down("sm") && { padding: 7, textAlign: "end" }
              }
            >
              <Button variant="text" color="primary" onClick={handleClose}>
                Cancel
              </Button>
              {isEditing ? (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleAddEnBlockData}
                >
                  Add
                </Button>
              ) : (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleUpdateEnBlock}
                >
                  Update
                </Button>
              )}
            </Grid>
          </Grid>
        </Box>
      </Modal>
      <Backdrop className={classes.backdrop} open={ui.isloading}>
        <CircularProgress color="inherit" />
      </Backdrop>
    </LayoutContainer>
  );
};

export default ENBlockMovement;
