import React, { useCallback, useEffect, useState } from "react";
import LayoutContainer from "../../components/reusableComponents/LayoutContainer";
import CustomHeading from "../../components/CustomHeading";
import CustomReactTable from "../../components/CustomReactTable";
import { useSnackbar } from "notistack";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSort } from "@fortawesome/free-solid-svg-icons";
import { useDispatch, useSelector } from "react-redux";
import { ENBLOCK_REDUCER_CONST } from "../../reducers/EnBlockReducer";
import ListIcon from "@mui/icons-material/List";
import {
  Backdrop,
  Box,
  Button,
  Checkbox,
  Chip,
  CircularProgress,
  FormControl,
  FormControlLabel,
  Grid,
  IconButton,
  InputLabel,
  makeStyles,
  MenuItem,
  Modal,
  Popover,
  Radio,
  Select,
  Typography,
} from "@material-ui/core";
import AutomationSearch from "../../components/reusableComponents/AutomationSearch";

import { Link } from "react-router-dom";
import RefreshOutlinedIcon from "@mui/icons-material/RefreshOutlined";
import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";

import {
  discardEnBLockPreGateInContainerAction,
  downloadEnBlockPreGateInReportFile,
  getEnBLockListingPreGateInAction,
} from "../../actions/EnBlockMovementAction";
import { theme } from "../../App";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import GateInTextField from "../../components/reusableComponents/GateInTextField";
import { Stack } from "@mui/material";
import DoneIcon from "@material-ui/icons/Done";
import CrossIcon from "@material-ui/icons/Cancel";
import DeleteSweepOutlinedIcon from "@mui/icons-material/DeleteSweepOutlined";

const useStyles = makeStyles((theme) => ({
  bulkUploadColor: {
    backgroundColor: theme.palette.text.secondary,
    color: theme.palette.success.dark,
  },
  modalPaper: {
    position: "absolute",
    width: "70%",
    backgroundColor: "white",
    boxShadow: 5,
    padding: 20,
    outline: "none",
    borderRadius: 10,
  },
  selectedBtn: {
    background: "lightgreen",
    border: "1px solid green",
    color: "green",
    "&:hover": {
      cursor: "pointer",
      background: "lightgreen",
      border: "1px solid green",
      color: "green",
    },
    margin: 5,
  },
  notSelectedBtn: {
    background: "#FFCCCB",
    border: "1px solid red",
    color: "red",
    "&:hover": {
      cursor: "pointer",
      background: "#FFCCCB",
      border: "1px solid red",
      color: "red",
    },
    margin: 5,
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
  LabelTypography: {
    fontSize: 14,
    fontWeight: 600,
    color: "#243545",
    paddingBottom: 4,
    [theme.breakpoints.down("sm")]: {
      paddingBottom: 1,
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
  popOverContainer: {
    "& .MuiPopover-paper": {
      overflowY: "hidden",
      padding: "12px 12px",
    },
  },
}));

const ENBlockMovementPreGateIn = () => {
  const notify = useSnackbar().enqueueSnackbar;
  const dispatch = useDispatch();
  const classes = useStyles();

  const [process, setProcess] = useState("job_order_no");

  const { ui, user } = useSelector((state) => state);
  const { enBlockPreGateInListing } = useSelector(
    (store) => store.EnBlockReducer
  );
  const [searchText, setSearchText] = useState("");
  const [jobOrder, setJobOrder] = useState("");
  const [openDiscardModal, setOpenDiscardModal] = useState(false);
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [selectedRows, setSelectedRows] = useState([]);
  const [discardRemark, setDiscardRemark] = useState("");
  const handleOpen = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);
  const open = Boolean(anchorEl);
  const id = open ? "simple-popover" : undefined;

  useEffect(() => {
    dispatch(getEnBLockListingPreGateInAction(notify));
  }, []);

  const handleJobOrderChange = (e) => {
    setJobOrder(e.target.value);
  };

  const handleDiscardRemarkChange = (e) => {
    setDiscardRemark(e.target.value);
  };

  const checkAllRows = (val) => {
    if (val) {
      enBlockPreGateInListing.data.forEach((val) =>
        setSelectedRows((prev) => prev.filter((data) => data.pk !== val.pk))
      );
    } else {
      if (selectedRows.length === 0) {
        let allData = enBlockPreGateInListing.data
          .filter(
            (data) =>
              data.job_order_no ===
              enBlockPreGateInListing.data?.[0]?.job_order_no
          )
          .map((val, index) => ({
            pk: val.pk,
            container_no: val.container_no,
            job_order_no: val.job_order_no,
            enabled: true,
          }));
        setSelectedRows(allData);
      } else {
        let allData = enBlockPreGateInListing.data
          .filter(
            (data) => data.job_order_no === selectedRows?.[0]?.job_order_no
          )
          .map((val, index) => ({
            pk: val.pk,
            container_no: val.container_no,
            job_order_no: val.job_order_no,
            enabled: true,
          }));
        setSelectedRows((prev) => [...prev, ...allData]);
      }
    }
  };

  const handleCheck = (pk, val, job_order_no) => {
    if (
      selectedRows.length > 0 &&
      selectedRows[0].job_order_no !== job_order_no
    ) {
      notify("Please select Containers with same Job Order No", {
        variant: "warning",
      });
      return;
    }
    if (!selectedRows.some((value) => value.pk === pk)) {
      setSelectedRows([
        ...selectedRows,
        {
          pk,
          container_no: val,
          enabled: true,
          job_order_no: job_order_no,
        },
      ]);
    } else {
      const updatedVal = selectedRows.filter((item) => item.pk !== pk);
      setSelectedRows(updatedVal);
    }
  };

  const totalSelectedContainers = () => {
    let counts = selectedRows?.filter((item) => item.enabled).length;
    return counts;
  };

  const handleChip = (pkToUpdate) => {
    const updatedData = selectedRows.map((item) => {
      if (item.pk === pkToUpdate) {
        return {
          ...item,
          enabled: !item.enabled,
        };
      }
      return item;
    });

    setSelectedRows(updatedData);
  };

  function getModalStyle() {
    const top = 50;
    const left = 50;

    return {
      top: `${top}%`,
      left: `${left}%`,
      transform: `translate(-${top}%, -${left}%)`,
    };
  }

  const Columns = [
    {
      Header: (
        <div>
          <Checkbox
            checked={enBlockPreGateInListing.data?.every((item) =>
              selectedRows.some((data) => data.pk === item.pk)
            )}
            onClick={(e) => {
              checkAllRows(!e.target.checked);
            }}
            style={{ color: "#243545" }}
            inputProps={{ "aria-label": "Checkbox A" }}
          />
        </div>
      ),

      width: 50,
      style: {
        textAlign: "center",
      },
      show: enBlockPreGateInListing.status === "Pending",
      Cell: (row) => {
        return (
          <div>
            <Checkbox
              checked={selectedRows.some((item) => item.pk === row.original.pk)}
              key={row.original.pk}
              onClick={(e) => {
                handleCheck(
                  row.original.pk,
                  row.original.container_no,
                  row.original.job_order_no
                );
              }}
              style={{ color: "#243545" }}
              inputProps={{ "aria-label": "Checkbox A" }}
            />
          </div>
        );
      },
    },
    {
      Header: (
        <b style={{ color: "#2A5FA5" }}>
          Container No
          <FontAwesomeIcon icon={faSort} />
        </b>
      ),
      accessor: "container_no",
      style: {
        textAlign: "center",
        cursor: "pointer",
      },
      Cell: (row) => {
        return (
          <div>
            <span title={row.original}>{row.original.container_no}</span>
          </div>
        );
      },
    },
    {
      Header: (
        <b style={{ color: "#2A5FA5" }}>
          Size
          <FontAwesomeIcon icon={faSort} />
        </b>
      ),
      accessor: "size",
      style: {
        textAlign: "center",
        cursor: "pointer",
      },
      Cell: (row) => {
        return (
          <div>
            <span title={row.original}>{row.original.size}</span>
          </div>
        );
      },
    },
    {
      Header: (
        <b style={{ color: "#2A5FA5" }}>
          Type
          <FontAwesomeIcon icon={faSort} />
        </b>
      ),
      accessor: "type",
      style: {
        textAlign: "center",
        cursor: "pointer",
      },
      Cell: (row) => {
        return (
          <div>
            <span title={row.original}>{row.original.type}</span>
          </div>
        );
      },
    },
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
          Vessel Name <FontAwesomeIcon icon={faSort} />
        </b>
      ),
      accessor: "vessel_name",
      style: {
        textAlign: "center",
        cursor: "pointer",
      },
      Cell: (row) => {
        return (
          <div>
            <span title={row.original.vessel_name}>
              {row.original.vessel_name}
            </span>
          </div>
        );
      },
    },
    {
      Header: (
        <b style={{ color: "#2A5FA5" }}>
          Voyage Number <FontAwesomeIcon icon={faSort} />
        </b>
      ),
      accessor: "voyage_no",
      style: {
        textAlign: "center",
        cursor: "pointer",
      },
      Cell: (row) => {
        return (
          <div>
            <span title={row.original.voyage_no}>{row.original.voyage_no}</span>
          </div>
        );
      },
    },
    {
      Header: (
        <b style={{ color: "#2A5FA5" }}>
          Status <FontAwesomeIcon icon={faSort} />
        </b>
      ),
      accessor: "is_processed",
      style: {
        textAlign: "center",
        cursor: "pointer",
      },
      Cell: (row) => {
        return (
          <div>
            <span
              style={{
                color: row.original?.is_processed
                  ? theme.palette.success.dark
                  : row.original?.is_discarded
                  ? theme.palette.error.main
                  : theme.palette.info.main,
              }}
              title={row.original.is_processed}
            >
              {row.original?.is_processed
                ? "Processed"
                : row.original?.is_discarded
                ? "Discarded"
                : "Pending"}
            </span>
          </div>
        );
      },
    },
    {
      Header: <b style={{ color: "#2A5FA5" }}>Remark</b>,
      accessor: "remark",
      style: {
        textAlign: "center",
        cursor: "pointer",
      },
      show: enBlockPreGateInListing.status === "Discarded",
      Cell: (row) => {
        return (
          <div>
            <span title={row.original.remark}>{row.original.remark}</span>
          </div>
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
    dispatch({ type: ENBLOCK_REDUCER_CONST.EN_BLOCK_PRE_GATE_IN_LISTING });
    dispatch({
      type: ENBLOCK_REDUCER_CONST.EN_BLOCK_PRE_GATE_IN_LISTING,
      payload: {
        vessel_name: process === "vessel_name" ? searchText : "",
        voyage_no: process === "voyage_no" ? searchText : "",
        job_order_no: process === "job_order_no" ? searchText : "",
        container_no: process === "container_no" ? searchText : "",
      },
    });
    dispatch(getEnBLockListingPreGateInAction(notify));
  }, [searchText, notify, process]);

  const handleCloseClick = useCallback(() => setSearchText(""), [searchText]);

  const handleSetProcess = useCallback(
    (e) => setProcess(e.target.value),
    [process]
  );

  const prevEnBlockPage = () => {
    dispatch({
      type: ENBLOCK_REDUCER_CONST.EN_BLOCK_PRE_GATE_IN_LISTING,
      payload: { page_no: Number(enBlockPreGateInListing.page_no) - 1 },
    });
    dispatch(getEnBLockListingPreGateInAction(notify));
  };

  const handleEnblockChange = () => {
    dispatch({
      type: ENBLOCK_REDUCER_CONST.EN_BLOCK_PRE_GATE_IN_LISTING,
      payload: { page_no: Number(enBlockPreGateInListing.page_no) + 1 },
    });
    dispatch(getEnBLockListingPreGateInAction(notify));
  };

  const handleInitialPage = () => {
    dispatch({
      type: ENBLOCK_REDUCER_CONST.EN_BLOCK_PRE_GATE_IN_LISTING,
      payload: { page_no: 1 },
    });
    dispatch(getEnBLockListingPreGateInAction(notify));
  };

  const handleFetchData = () => {
    dispatch(getEnBLockListingPreGateInAction(notify));
  };
  const handleEnBlockOnPageDataClientChange = (value) => {
    dispatch({
      type: ENBLOCK_REDUCER_CONST.EN_BLOCK_PRE_GATE_IN_LISTING,
      payload: { on_page_data_client: value, page_no: 1 },
    });
    dispatch(getEnBLockListingPreGateInAction(notify));
  };

  const handleNextEnBlockPage = () => {
    dispatch({
      type: ENBLOCK_REDUCER_CONST.EN_BLOCK_PRE_GATE_IN_LISTING,
      payload: { page_no: Number(enBlockPreGateInListing.page_no) + 1 },
    });
    dispatch(getEnBLockListingPreGateInAction(notify));
  };

  const handleRefresh = () => {
    dispatch({ type: ENBLOCK_REDUCER_CONST.EN_BLOCK_PRE_GATE_IN_LISTING_INIT });
    dispatch(getEnBLockListingPreGateInAction(notify));
  };

  const handleDownloadReport = () => {
    dispatch(downloadEnBlockPreGateInReportFile(jobOrder, notify, handleClose));
  };

  const handleModalCloseDiscard = () => {
    setOpenDiscardModal(false);
  };

  const handleDiscardSelectedContiner = () => {
    if (discardRemark === "") {
      notify("Please enter remark to discard the containers", {
        variant: "error",
      });
      return;
    }

    let job_no;

    let selectedValue = selectedRows.map((item) => {
      if (item.enabled) {
        job_no = item.job_order_no;
        return item.pk;
      } else {
        return null;
      }
    });
    let selected_containers_delete = selectedValue.filter(
      (item) => item !== null
    );

    dispatch(
      discardEnBLockPreGateInContainerAction(
        selected_containers_delete,
        discardRemark,
        job_no,
        notify,
        setSelectedRows,
        handleModalCloseDiscard
      )
    );
  };

  return (
    <LayoutContainer>
      <CustomHeading variant="body1" customClass="pageTitle">
        En Block Movement Pre Gate In
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
                <MenuItem key={"job_order_no"} value="job_order_no">
                  Job Order No
                </MenuItem>
                <MenuItem key={"vessel_name"} value="vessel_name">
                  Vessel Name
                </MenuItem>
                <MenuItem key={"voyage_no"} value="voyage_no">
                  Voyage No
                </MenuItem>
                <MenuItem key={"container_no"} value="container_no">
                  Container No
                </MenuItem>
              </Select>
            </FormControl>
          </AutomationSearch>
        </Grid>
      </Grid>
      <Grid container spacing={2} style={{ marginTop: "24px" }}>
        <Grid item sm={6} md={4} lg={4}>
          <FormControlLabel
            value="Pending"
            control={
              <Radio
                size="small"
                style={{ color: theme.palette.info.dark }}
                checked={enBlockPreGateInListing.status === "Pending"}
                onClick={() => {
                  dispatch({
                    type: ENBLOCK_REDUCER_CONST.EN_BLOCK_PRE_GATE_IN_LISTING,
                    payload: {
                      pg_no: 1,
                      status: "Pending",
                    },
                  });
                  dispatch(getEnBLockListingPreGateInAction(notify));
                }}
              />
            }
            label="Pending"
          />
          <FormControlLabel
            value="Processed"
            control={
              <Radio
                size="small"
                style={{ color: theme.palette.success.dark }}
                checked={enBlockPreGateInListing.status === "Processed"}
                onClick={() => {
                  setSelectedRows([]);
                  dispatch({
                    type: ENBLOCK_REDUCER_CONST.EN_BLOCK_PRE_GATE_IN_LISTING,
                    payload: {
                      pg_no: 1,
                      status: "Processed",
                    },
                  });
                  dispatch(getEnBLockListingPreGateInAction(notify));
                }}
              />
            }
            label="Processed"
          />
          <FormControlLabel
            value="Discarded"
            control={
              <Radio
                size="small"
                style={{ color: theme.palette.error.dark }}
                checked={enBlockPreGateInListing.status === "Discarded"}
                onClick={() => {
                  setSelectedRows([]);
                  dispatch({
                    type: ENBLOCK_REDUCER_CONST.EN_BLOCK_PRE_GATE_IN_LISTING,
                    payload: {
                      pg_no: 1,
                      status: "Discarded",
                    },
                  });
                  dispatch(getEnBLockListingPreGateInAction(notify));
                }}
              />
            }
            label="Discarded"
          />
        </Grid>
        <Grid item sm={8} md={8} lg={8} style={{ textAlign: "end" }}>
          <Link
            to="/enBlock-Pre-Gate-IN/bulk-upload"
            style={{ marginRight: "8px", marginLeft: 12 }}
          >
            <Button
              startIcon={
                <CloudUploadOutlinedIcon
                  fontSize="small"
                  style={{ fill: theme.palette.success.dark }}
                />
              }
              variant="text"
              color="primary"
              className={classes.bulkUploadColor}
            >
              Bulk Upload
            </Button>
          </Link>
          <Button
            aria-describedby={id}
            onClick={handleOpen}
            startIcon={
              <FileDownloadOutlinedIcon
                fontSize="small"
                style={{ fill: theme.palette.success.dark }}
              />
            }
            variant="text"
            color="primary"
            className={classes.bulkUploadColor}
            style={{ marginRight: "8px", marginLeft: 12 }}
            // onClick={handleDownloadReport}
          >
            Download Report
          </Button>

          <Popover
            id={id}
            open={open}
            anchorEl={anchorEl}
            onClose={handleClose}
            anchorOrigin={{
              vertical: "top",
              horizontal: "left",
            }}
            transformOrigin={{
              vertical: "top",
              horizontal: "right",
            }}
            elevation={1}
            style={{ marginTop: 20, overflow: "hidden", borderRadius: 12 }}
            className={classes.popOverContainer}
          >
            <Box
              style={{
                overflow: "hidden",
                maxWidth: 220,
                padding: "24px 12px",
              }}
              component={Grid}
              container
              spacing={2}
            >
              <Stack
                direction={"column"}
                alignItems={"flex-start"}
                justifyContent={"space-between"}
                spacing={5}
              >
                <Box
                  direction={"column"}
                  alignItems={"flex-start"}
                  justifyContent={"space-between"}
                  spacing={1}
                >
                  <Typography variant="caption">Type Job Order No</Typography>
                  <GateInTextField
                    value={jobOrder}
                    handleChange={(e) => handleJobOrderChange(e)}
                  />
                </Box>
                <Button
                  aria-describedby={id}
                  startIcon={
                    <FileDownloadOutlinedIcon
                      fontSize="small"
                      style={{ fill: theme.palette.success.dark }}
                    />
                  }
                  variant="text"
                  color="primary"
                  fullWidth
                  style={{ color: theme.palette.success.dark }}
                  disabled={jobOrder === ""}
                  onClick={handleDownloadReport}
                >
                  Download Report
                </Button>
              </Stack>
            </Box>
          </Popover>

          <Link to="/enBlock" style={{ marginRight: "8px", marginLeft: 12 }}>
            <Button
              startIcon={<ListIcon fontSize="small" />}
              variant="text"
              color="primary"
              style={{ color: theme.palette.success.dark }}
            >
              En Block List
            </Button>
          </Link>
          {selectedRows.length > 0 && (
            <Button
              color="primary"
              variant="text"
              startIcon={<DeleteSweepOutlinedIcon fontSize="small" />}
              onClick={() => setOpenDiscardModal(true)}
              style={{ color: theme.palette.error.dark }}
            >
              Discard Containers
            </Button>
          )}
          <IconButton onClick={handleRefresh}>
            <RefreshOutlinedIcon style={{ fill: "#3265a8" }} fontSize="small" />
          </IconButton>
        </Grid>
      </Grid>
      <Box mt={4}></Box>
      <CustomReactTable
        data={enBlockPreGateInListing.data || []}
        columns={[...Columns]}
        minRows={enBlockPreGateInListing.on_page_data_client}
        enableFooter
        prevReactPage={prevEnBlockPage}
        React_pg_no={enBlockPreGateInListing.page_no}
        notify={notify}
        React_total_pages={enBlockPreGateInListing.total_pages}
        handleReact_change_page={handleEnblockChange}
        handleReact_initial_page={handleInitialPage}
        fetchReact_page={handleFetchData}
        on_page_data_client={enBlockPreGateInListing.on_page_data_client}
        handleReact_change_page_data_client={
          handleEnBlockOnPageDataClientChange
        }
        nextReactPage={handleNextEnBlockPage}
        next_React_page={enBlockPreGateInListing.next_page}
      />
      <Modal open={openDiscardModal} onClose={handleModalCloseDiscard}>
        <div style={getModalStyle()} className={classes.modalPaper}>
          <Typography className={classes.chipRoot}>
            Total Containers Selected: {totalSelectedContainers()}
          </Typography>

          <Grid
            className={classes.chipRoot}
            style={{ paddingBottom: 50, marginTop: 12 }}
          >
            {selectedRows.length !== 0 &&
              selectedRows.map((option) => (
                <Chip
                  label={option.container_no}
                  clickable
                  className={
                    option.enabled === true
                      ? classes.selectedBtn
                      : classes.notSelectedBtn
                  }
                  onClick={() => {
                    handleChip(option.pk);
                  }}
                  onDelete={() => {
                    handleChip(option.pk);
                  }}
                  deleteIcon={
                    option.enabled === true ? <DoneIcon /> : <CrossIcon />
                  }
                />
              ))}
          </Grid>

          <Grid container spacing={2}>
            <Grid item sm={4}>
              <Typography
                variant="subtitle1"
                className={classes.LabelTypography}
              >
                Add Remark <span style={{ color: "red" }}>*</span>
              </Typography>

              <GateInTextField
                value={discardRemark}
                handleChange={handleDiscardRemarkChange}
              />
            </Grid>
            <Grid item sm={8}></Grid>
          </Grid>

          <Stack
            direction={"row"}
            alignItems={"center"}
            justifyContent={"flex-end"}
            spacing={2}
            mt={2}
            mb={2}
          >
            <Button
              onClick={handleModalCloseDiscard}
              variant="text"
              color="primary"
            >
              Cancel
            </Button>

            <Button
              onClick={handleDiscardSelectedContiner}
              style={{
                width: "160px",
                backgroundColor: "rgb(243,37,37)",
                color: "white",
                borderRadius: 7,
              }}
            >
              Discard Selected
            </Button>
          </Stack>
        </div>
      </Modal>
      <Backdrop className={classes.backdrop} open={ui.isloading}>
        <CircularProgress color="inherit" />
      </Backdrop>
    </LayoutContainer>
  );
};

export default ENBlockMovementPreGateIn;
