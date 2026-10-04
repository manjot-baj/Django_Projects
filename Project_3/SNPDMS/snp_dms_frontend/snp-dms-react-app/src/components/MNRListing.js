import React, { useEffect, useState } from "react";
import ReactTable from "react-table-v6";
import "react-table-v6/react-table.css";
import {
  makeStyles,
  Typography,
  Paper,
  TextField,
  MenuItem,
  Grid,
  Button,
  Checkbox,
  FormControlLabel,
  Radio,
  Chip,
  useMediaQuery,
  IconButton,
  Switch,
  Tooltip,
} from "@material-ui/core";
import Modal from "@material-ui/core/Modal";
import Backdrop from "@material-ui/core/Backdrop";
import { useSnackbar } from "notistack";
import { green } from "@material-ui/core/colors";
import { useDispatch, useSelector } from "react-redux";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSort } from "@fortawesome/free-solid-svg-icons";
import RefreshIcon from "@material-ui/icons/Refresh";
import InfoIcon from "@material-ui/icons/Info";
import TourTwoToneIcon from "@mui/icons-material/TourTwoTone";
import { useHistory } from "react-router-dom";
import {
  getMNRProcessByEdit,
  getMNRProcessByEditImportAction,
} from "../actions/MNRProcessActions";
import { sendStageWistim } from "../actions/MNRWestimDestimActions";
import PreviousIcon from "@material-ui/icons/ArrowBack";
import NextIcon from "@material-ui/icons/ArrowForward";
import { getMNRGrid, makeContainersAvailable } from "../actions/MNRGridActions";
import "react-step-progress-bar/styles.css";
import { ProgressBar, Step } from "react-step-progress-bar";
import DoneIcon from "@material-ui/icons/Done";
import CrossIcon from "@material-ui/icons/Cancel";
import MnrFooter from "../components/MnrFooter";
import { Stack } from "@mui/material";
import { Autocomplete } from "@mui/material";

const useStyles = makeStyles((theme) => ({
  paperContainer: {
    padding: theme.spacing(2, 3),
    [theme.breakpoints.down("md")]: {
      width: "100%",
    },
    [theme.breakpoints.down("xs")]: {
      width: "100%",
      marginBottom: "100px",
    },
  },
  input: {
    padding: 7,
    borderColor: "black",
  },
  selectTextField: {
    "& .MuiOutlinedInput-root": {
      "& fieldset": {
        borderColor: "red",
      },
    },
  },

  LabelTypography: {
    fontSize: 12,
    fontWeight: 600,
    color: "#243545",
    paddingBottom: 4,
    marginRight: "5px",
    marginLeft: "5px",
  },
  button: {
    background: "rgba(85, 177, 85, 0.9)",
    border: "1px solid gray",
    color: "white",
    boxShadow: "1px 1px 1px gray",
    marginRight: "2px",
    "&:hover": {
      cursor: "pointer",
      background: "rgba(85, 177, 85, 1)",
      color: "white",
    },
    [theme.breakpoints.down("xs")]: {
      fontSize: "0.7rem",
      padding: "2px",
      width: "100px",
    },
  },
  autocomplete: {
    width: "150px",
    "& .MuiAutocomplete-inputRoot[class*='MuiOutlinedInput-root']": {
      padding: 0,
    },
  },
  button2: {
    background: "#FFCCCB",
    border: "1px solid red",
    color: "red",
    "&:hover": {
      cursor: "pointer",
      background: "#FFCCCB",
      border: "1px solid red",
      color: "red",
    },
  },
  button3: {
    background: "#ADD8E6",
    border: "1px solid #243545",
    color: "#243545",
    "&:hover": {
      cursor: "pointer",
      background: "#ADD8E6",
      border: "1px solid #243545",
      color: "#243545",
    },
  },
  progressTextColor: {
    color: "white",
    backgroundColor: theme.palette.secondary.main,
    fontWeight: "bold",
  },
  paginationWrapper: {
    "& .MuiOutlinedInput-input": {
      padding: "10px 10px !important",
      textAlign: "center !important",
    },
    "& .PrivateNotchedOutline-root-56": {
      top: "0px !important",
    },
    "& .MuiOutlinedInput-root": {
      height: "35px",
    },
    width: "50px",
    padding: "3px",
    "& .MuiOutlinedInput-inputMarginDense": {
      paddingLeft: "18px",
      paddingTop: "5px",
    },
  },
  modalPaper: {
    position: "absolute",
    width: "70%",
    backgroundColor: "white",
    boxShadow: 5,
    padding: 10,
    outline: "none",
    borderRadius: 10,
    [theme.breakpoints.down("xs")]: {
      overflowY: "scroll",
      width: "85%",
      padding: "20px",
    },
  },
  chipRoot: {
    display: "flex",
    justifyContent: "center",
    flexWrap: "wrap",
    paddingTop: 20,
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
  [theme.breakpoints.down("xs")]: {
    marginLeft: "-10px",
    width: "110%",
  },
}));

const MNRListing = (props) => {
  const classes = useStyles();
  const history = useHistory();
  const [stocksAvailableList, setStocksAvailableList] = useState([]);
  const dispatch = useDispatch();
  const store = useSelector((state) => state);
  const { stocksAndAllotment, MNRGridSearch, MNR, gateIn ,user} = store;
  const notify = useSnackbar().enqueueSnackbar;
  const [open, setOpen] = React.useState(false);
  const [selectedStockList, setSelectedStockList] = useState([]);
  const [stage, setStage] = useState("");
  const [status, setStatus] = useState("");
  const [condition, setCondition] = useState("");
  const [surveyDate, setSurveyDate] = useState("");
  const [estimateDate, setEstimateDate] = useState("");
  const [approvalDate, setApprovalDate] = useState("");
  const [repairDate, setRepairDate] = useState("");
  const [availableDate, setAvailableDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [openModal, setOpenModal] = useState(false);
  const [selectedContainerStage, setSelectedContainerStage] = useState("");
  const [selectedRows, setSelectedRows] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [checkAll, setCheckAll] = useState(false);
  const matchesIphone = useMediaQuery("(max-width:500px)");
  const matchesIpad = useMediaQuery("(max-width:1050px)");
  const [refCode, setRefCode] = useState("");

  const handleOpen = (dataInfo) => {
    setOpen(true);
    setStage(dataInfo.stage);
    setStatus(dataInfo.status);
    setCondition(dataInfo.condition);
    setSurveyDate(dataInfo.survey_date);
    setEstimateDate(dataInfo.estimate_date);
    setApprovalDate(dataInfo.approval_date);
    setRepairDate(dataInfo.repair_date);
    setAvailableDate(dataInfo.available_date);
  };
  const handleClose = () => {
    setOpen(false);
  };

  const handleModalClose = () => {
    setOpenModal(false);
    dispatch({
      type: "MNR_CHIP_RESET_SELECTION",
    });
  };

  useEffect(() => {
    dispatch(getMNRGrid(MNRGridSearch));
  }, [
    MNRGridSearch.out_history,
    MNRGridSearch.pg_no,
    MNRGridSearch.on_page_data,
  ]);

  useEffect(() => {
    return () => {
      dispatch({ type: "RESET_MNR_SEARCH_DATA" });
    };
  }, []);

  useEffect(() => {
    let tempArray = [];
    MNR?.mnrListing?.length > 0 &&
      MNR.mnrListing.map((row) => {
        let tempObj = {
          isShowCheck:
            MNR.make_available === true ||
            (MNR.make_available === false &&
              (row.stage === "Approval" ||
                row.stage === "Repair" ||
                row.stage === "Available"))
              ? true
              : false,
          isCheck: false,
          enabled: false,
          pk: row.pk,
          client: row.client,
          line: row.line,
          gate_in: row.gate_in,
          container_no: row.container_no,
          type: row.type,
          size: row.size,
          condition: row.condition,
          is_estimate_westim_sent: row.is_estimate_westim_sent,
          is_repair_destim_sent: row.is_repair_destim_sent,
          is_repair_data_available_for_import:
            row.is_repair_data_available_for_import,
          aging: row.aging,
          is_survey_import_available: row.is_survey_import_available,
          is_mnr_data_imported: row.is_mnr_data_imported,
          estimate_status: row.estimate_status,
          gate_out: row.gate_out,
          mode: row.mode,
          status: row.status,
          stage: row.stage,
          survey_date: row.survey_date,
          survey_time: row.survey_time,
          estimate_date: row.estimate_date,
          estimate_time: row.estimate_time,
          approval_date: row.approval_date,
          approval_time: row.approval_time,
          pre_mnr_img_uploaded: row.pre_mnr_img_uploaded,
          post_mnr_img_uploaded: row.post_mnr_img_uploaded,
          repair_date: row.repair_date,
          repair_time: row.repair_time,
          repair_status: row.repair_status,
          available_date: row.available_date,
          available_time: row.available_time,
          automatic_mnr_status_change: row.automatic_mnr_status_change,
          sr_no: row.sr_no,
        };
        tempArray.push(tempObj);
      });
    tempArray.map((item, i) => {
      if (selectedRows?.includes(item.pk)) {
        item.isCheck = true;
        item.enabled = true;
      }
      return item;
    });
    const allChecked = tempArray.every((item) => item.isCheck);
    setCheckAll(allChecked);
    setStocksAvailableList(tempArray);
    setSelectedItems([]);
  }, [MNR.mnrListing, MNR.make_available]);

  useEffect(() => {
    dispatch({ type: "MNR_CLEAR_CONTAINER_LIST" });
  }, []);
  useEffect(() => {
    const newData = stocksAvailableList.map((item) => ({
      ...item,
      isCheck: false,
      enabled: false,
    }));
    setCheckAll(false);
    setStocksAvailableList(newData);
    setSelectedItems([]);
  }, [MNR.make_available]);

  const handleEstimateWistim = () => {
    let containerListArray = [];
    let demoVal = false;

    for (let i = 1; i <= selectedStockList.length; i++) {
      demoVal = selectedStockList.every((val) => val.enabled === false);
    }

    if (demoVal === true) {
      notify("Atleast one container should be enabled", {
        variant: "error",
      });
    } else {
      selectedStockList.forEach((e) => {
        if (e["enabled"] === true) {
          containerListArray.push(e["pk"]);
        }
      });

      let req = {
        stock_id: selectedStockList
          .filter((item) => item.enabled)
          .map((item) => item.pk),
        location: localStorage.getItem("location")
          ? localStorage.getItem("location")
          : null,
        site: localStorage.getItem("site")
          ? localStorage.getItem("site")
          : null,
      };
      dispatch(sendStageWistim(req, "Estimate"));

      setOpenModal(false);
    }
  };

  const handleRepairDistim = () => {
    let containerListArray = [];
    let demoVal = false;

    for (let i = 1; i <= selectedStockList.length; i++) {
      demoVal = selectedStockList.every((val) => val.enabled === false);
    }

    if (demoVal === true) {
      notify("Atleast one container should be enabled", {
        variant: "error",
      });
    } else {
      selectedStockList.forEach((e) => {
        if (e["enabled"] === true) {
          containerListArray.push(e["pk"]);
        }
      });

      let req = {
        stock_id: selectedStockList
          .filter((item) => item.enabled)
          .map((item) => item.pk),
        location: localStorage.getItem("location")
          ? localStorage.getItem("location")
          : null,
        site: localStorage.getItem("site")
          ? localStorage.getItem("site")
          : null,
      };
      dispatch(sendStageWistim(req, "Repair"));
      setOpenModal(false);
    }
  };

  const totalSelectedContainers = () => {
    let counts = selectedStockList.filter((item) => item.enabled).length;
    return counts;
  };

  const handleMakeAvailable = () => {
    let req = {
      stock_id: selectedRows,
      location: localStorage.getItem("location")
        ? localStorage.getItem("location")
        : null,
      site: localStorage.getItem("site") ? localStorage.getItem("site") : null,
    };
    dispatch(makeContainersAvailable(req, notify));
  };

  const nextStockPage = () => {
    setCurrentPage(Number(currentPage) + 1);
    dispatch({
      type: "TOGGLE_MNR_PAGE_NO_SEARCH_VALUE",
      payload: Number(store.MNRGridSearch.pg_no) + 1,
    });
  };

  const prevStockPage = () => {
    setCurrentPage(currentPage - 1);
    dispatch({
      type: "TOGGLE_MNR_PAGE_NO_SEARCH_VALUE",
      payload: store.MNRGridSearch.pg_no - 1,
    });
  };
  const handleChip = (pkToUpdate) => {
    var chipContainer = [...selectedStockList];
    const updatedData = chipContainer.map((item) => {
      if (item.pk === pkToUpdate) {
        return {
          ...item,
          enabled: !item.enabled,
        };
      }
      return item;
    });

    setSelectedStockList(updatedData);
  };
  useEffect(() => {
    const selectedArray = stocksAvailableList.filter((item) => item.isCheck);
    setSelectedStockList(selectedArray);
  }, [stocksAvailableList]);
  const handleCheck = (index, pk, val, stage) => {
    const updatedData = [...stocksAvailableList];
    var selectedTempArray = [...selectedItems];
    const isSelected = selectedItems?.some((item) => item.pk === pk);
    const isSameStage = selectedItems?.every((item) => item.stage === stage);
    let selectedTempObj = {
      pk: pk,
      stage: stage,
    };
    if (MNR?.make_available === false) {
      if (selectedTempArray?.length > 0) {
        if (isSelected) {
          let updatedArray = selectedTempArray.filter((rows) => rows.pk !== pk);
          selectedTempArray = [...updatedArray];
          updatedData[index].isCheck = !updatedData[index].isCheck;
          updatedData[index].enabled = true;
          setStocksAvailableList(updatedData);
        } else {
          if (isSameStage) {
            selectedTempArray.push(selectedTempObj);
            updatedData[index].isCheck = !updatedData[index].isCheck;
            updatedData[index].enabled = true;
            setStocksAvailableList(updatedData);
          } else {
            notify("Selection of containers must have same stage", {
              variant: "warning",
            });
          }
        }
      } else {
        selectedTempArray.push(selectedTempObj);
        updatedData[index].isCheck = !updatedData[index].isCheck;
        updatedData[index].enabled = true;
        setStocksAvailableList(updatedData);
      }
      setSelectedItems(selectedTempArray);
    } else {
      if (!selectedRows.includes(pk) && val) {
        setSelectedRows([...selectedRows, pk]);
      } else {
        const updatedVal = selectedRows.filter((item) => item !== pk);
        setSelectedRows(updatedVal);
      }
      updatedData[index].isCheck = !updatedData[index].isCheck;
      updatedData[index].enabled = true;
      setStocksAvailableList(updatedData);
    }
  };

  const checkAllRows = (val) => {
    let array2 = [...selectedRows];
    let tempArrayOfStage = [...selectedItems];
    const updatedArray = stocksAvailableList.map((item) => ({
      ...item,
      isCheck: val,
      enabled: true,
    }));
    updatedArray.forEach((item) => {
      if (!array2.includes(item.pk)) {
        array2.push(item.pk);
      }
      if (item.isCheck) {
        tempArrayOfStage.push({ pk: item.pk, stage: item.stage });
      } else {
        tempArrayOfStage = [];
      }
    });
    setSelectedItems(tempArrayOfStage);
    setSelectedRows(array2);
    setStocksAvailableList(updatedArray);
    setCheckAll(val);
  };

  const Columns = [
    {
      Header: (
        <div>
          {(MNR.make_available === true ||
            stocksAvailableList.every(
              (item) => item.stage === stocksAvailableList[0].stage
            )) && (
            <Checkbox
              checked={checkAll}
              onClick={(e) => {
                checkAllRows(e.target.checked);
              }}
              style={{ color: "#243545" }}
              inputProps={{ "aria-label": "Checkbox A" }}
            />
          )}
        </div>
      ),
      width: 50,
      style: { alignItems: "center" },
      Cell: (row) => {
        if (MNR.make_available === true || row.original.isShowCheck) {
          return (
            <div>
              <Checkbox
                checked={row.original.isCheck}
                key={row.original.pk}
                onClick={(e) => {
                  handleCheck(
                    row.index,
                    row.original.pk,
                    e.target.checked,
                    row.original.stage
                  );
                }}
                style={{
                  color: "#243545",
                  alignItems: "center",
                  marginTop: "-8px",
                }}
                inputProps={{ "aria-label": "Checkbox A" }}
              />
            </div>
          );
        }
      },
    },
    {
      Header: (
        <b style={{ color: "#2A5FA5" }}>
          No
          <FontAwesomeIcon icon={faSort} />
        </b>
      ),
      width: 50,
      accessor: "sno",
      style: {
        textAlign: "center",
      },
      Cell: (row) => {
        return (
          <div>
            <span title={row.original}>{row.original.sr_no}</span>
          </div>
        );
      },
    },
    {
      Header: (
        <b style={{ color: "#2A5FA5" }}>
          Client <FontAwesomeIcon icon={faSort} />
        </b>
      ),
      width: 75,
      accessor: "client",
      style: {
        textAlign: "left",
      },
      Cell: (row) => {
        return (
          <div>
            <span title={row.original.remarks}>{row.original.client}</span>
          </div>
        );
      },
    },
    {
      Header: <b style={{ color: "#2A5FA5" }}>Ref Code</b>,
      accessor: "line",
      style: {
        textAlign: "center",
      },
      Cell: (row) => {
        return (
          <div>
            <span title={row.original.remarks}>{row.original.line}</span>
          </div>
        );
      },
    },
    {
      Header: (
        <b style={{ color: "#2A5FA5" }}>
          Gate In Date <FontAwesomeIcon icon={faSort} />
        </b>
      ),

      accessor: "gate_in",
      style: {
        textAlign: "center",
      },
      Cell: (row) => {
        return (
          <div>
            <span title={row.original.remarks}>{row.original.gate_in}</span>
          </div>
        );
      },
    },
    {
      width: 150,
      Header: <b style={{ color: "#2A5FA5" }}>Container No.</b>,
      sortable: false,
      accessor: "container_no",
      style: {
        textAlign: "center",
      },
      Cell: (row) => {
        return (
          <div>
            {row.original.remarks && (
              <span title="Click to View Container Remark">
                <InfoIcon
                  style={{ color: "#2A5FA5" }}
                  onClick={() =>
                    notify(row.original.remarks, {
                      variant: "info",
                    })
                  }
                />
              </span>
            )}
            <Typography
              style={{
                color:
                  row.original.container_no_is_valid === false && "#FF0000",
              }}
            >
              {row.original.container_no}
            </Typography>
          </div>
        );
      },
    },
    {
      Header: <b style={{ color: "#2A5FA5" }}>Size</b>,
      sortable: false,
      width: 50,
      accessor: "size",
      style: {
        textAlign: "center",
      },
      Cell: (row) => {
        return (
          <div>
            <span title={row.original.remarks}>{row.original.size}</span>
          </div>
        );
      },
    },
    {
      Header: <b style={{ color: "#2A5FA5" }}>Type</b>,
      width: 50,
      sortable: false,
      accessor: "type",
      style: {
        textAlign: "center",
      },
      Cell: (row) => {
        return (
          <div>
            <span title={row.original.remarks}>{row.original.type}</span>
          </div>
        );
      },
    },
    {
      Header: (
        <b style={{ color: "#2A5FA5" }}>
          Stages <FontAwesomeIcon icon={faSort} />
        </b>
      ),
      width: 100,
      accessor: "status",
      Cell: (row) => {
        if (
          MNRGridSearch.out_history === "True" &&
          row?.original?.stage !== "Available"
        ) {
          return (
            <div>
              <span>{row.original.stage}</span>
              <TourTwoToneIcon
                style={{ color: "#FF0000", height: 20, width: 20 }}
                onClick={() => handleOpen(row.original)}
              />
            </div>
          );
        } else if (
          MNRGridSearch.out_history === "True" &&
          row?.original?.is_estimate_westim_sent === false &&
          row?.original?.is_repair_destim_sent === false
        ) {
          return (
            <div>
              <span>{row.original.stage}</span>
              <TourTwoToneIcon
                style={{ color: "#FF0000", height: 20, width: 20 }}
                onClick={() => handleOpen(row.original)}
              />
            </div>
          );
        } else if (
          MNRGridSearch.out_history === "True" &&
          row?.original?.stage === "Available" &&
          row?.original?.is_estimate_westim_sent === true &&
          row?.original?.is_repair_destim_sent === false
        ) {
          return (
            <div>
              <span>{row.original.stage}</span>
              <TourTwoToneIcon
                style={{ color: "#FF0000", height: 20, width: 20 }}
                onClick={() => handleOpen(row.original)}
              />
            </div>
          );
        } else {
          return (
            <div>
              <span>{row.original.stage}</span>
              <InfoIcon
                style={{ color: "#2A5FA5", height: 20, width: 20 }}
                onClick={() => handleOpen(row.original)}
              />
            </div>
          );
        }
      },

      style: {
        textAlign: "center",
      },
    },
    {
      Header: (
        <b style={{ color: "#2A5FA5" }}>
          Estimate Status? <FontAwesomeIcon icon={faSort} />
        </b>
      ),
      accessor: "status",
      Cell: (row) => (
        <div>
          <span>{row.original.estimate_status}</span>
        </div>
      ),
      style: {
        textAlign: "center",
      },
    },
    {
      Header: (
        <b style={{ color: "#2A5FA5" }}>
          Status <FontAwesomeIcon icon={faSort} />
        </b>
      ),
      accessor: "status",
      Cell: (row) => (
        <div>
          <span>{row.original.status}</span>
        </div>
      ),
      style: {
        textAlign: "center",
      },
    },
    {
      Header: (
        <b style={{ color: "#2A5FA5" }}>
          Condition <FontAwesomeIcon icon={faSort} />
        </b>
      ),
      accessor: "condition",
      Cell: (row) => (
        <div>
          <span>{row.original.condition}</span>
        </div>
      ),
      style: {
        textAlign: "center",
      },
    },
    {
      Header: (
        <b style={{ color: "#2A5FA5" }}>
          Estimate Westim Upload <br />
          Manual | Ftp <FontAwesomeIcon icon={faSort} />
        </b>
      ),
      Cell: (row) => (
        <div>
          <span>{row.original.is_estimate_westim_sent}</span>
        </div>
      ),
      style: {
        textAlign: "center",
      },
    },
    {
      Header: (
        <b style={{ color: "#2A5FA5" }}>
          Repair Destim Upload <br /> Download | Ftp{" "}
          <FontAwesomeIcon icon={faSort} />
        </b>
      ),
      accessor: "status",
      Cell: (row) => (
        <div>
          <span>{row.original.is_repair_destim_sent}</span>
        </div>
      ),
      style: {
        textAlign: "center",
      },
    },
    {
      sortable: false,
      style: {
        textAlign: "center",
      },
      Header: <b style={{ color: "#2A5FA5" }}>Survey Import </b>,
      width: 160,

      Cell: (row) => {
        if (row.original.is_survey_import_available === true) {
          return (
            <span>
              {row.original.is_mnr_data_imported
                ? "Imported"
                : "Import Available"}
            </span>
          );
        } else {
          return <div></div>;
        }
      },
    },

    {
      sortable: false,
      style: {
        textAlign: "center",
      },
      Header: (
        <b style={{ color: "#2A5FA5" }}>
          Pre Image <br />
          Uploaded | Sent to Ftp
        </b>
      ),
      width: 120,
      accessor: "status",
      Cell: (row) => (
        <div>
          <span>{row.original.pre_mnr_img_uploaded}</span>
        </div>
      ),
    },
    {
      sortable: false,
      style: {
        textAlign: "center",
      },
      Header: (
        <b style={{ color: "#2A5FA5" }}>
          Post Image
          <br />
          Uploaded | Sent to Ftp
        </b>
      ),
      width: 120,
      accessor: "status",
      Cell: (row) => (
        <div>
          <span>{row.original.post_mnr_img_uploaded}</span>
        </div>
      ),
    },
    {
      sortable: false,
      show:((user?.mnr_team === true || user?.mnr_team === "True") &&
        user.role !== "Admin") ?false :true,
      style: {
        textAlign: "center",
      },
      width: 120,
      Cell: (row) => {
        return (
          <Button
            style={{ backgroundColor: green[400], color: "white" }}
            onClick={() => {
              let req = {
                stock_id: row.original.pk,
              };
              if (
                row.original.is_gate_in_data_imported === true &&
                row.original.is_mnr_data_imported === false
              ) {
                dispatch(getMNRProcessByEditImportAction(req, history));
              } else {
                dispatch(getMNRProcessByEdit(req, history));
              }
            }}
          >
            Edit
          </Button>
        );
      },
    },
  ];

  function getModalStyle() {
    const top = 50;
    const left = 50;

    return {
      top: `${top}%`,
      left: `${left}%`,
      transform: `translate(-${top}%, -${left}%)`,
    };
  }
  return (
    <>
      <div style={{ width: "100%" }}>
        {stocksAvailableList &&
          stocksAvailableList.length &&
          matchesIphone > 0 && (
            <Tooltip>
              <Button
                style={{
                  backgroundColor: "#2A5FA5",
                  color: "white",
                  margin: "auto 10px auto auto",
                  display: "flex",
                  width: "100px",
                  fontSize: "0.8rem",
                  position: "relative",
                  top:matchesIphone ?"4px":"-75px",
                }}
                onClick={() => window.location.reload()}
                startIcon={<RefreshIcon />}
              >
                Refresh
              </Button>
            </Tooltip>
          )}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            paddingLeft: 15,
            paddingRight: 15,
            marginTop: "30px",
            width: matchesIpad ? (matchesIphone ? "100%" : "90%") : "100%",
          }}
        >
          <Grid
            item
            xs={7}
            sm={6}
            style={{
              display: "flex",
              justifyContent: "flex-start",
              alignItems: "center",
              flexWrap:matchesIphone ? "wrap":"nowrap",
              marginTop: matchesIphone ? "10px" : "0",
            }}
          >
            <Typography variant="subtitle1" className={classes.LabelTypography}>
              Line Code
            </Typography>
            <Autocomplete
              value={refCode}
              onChange={(e, newValue) => {
                setRefCode(newValue);
                dispatch({
                  type: "SET_MNR_REF_CODE",
                  payload: newValue,
                });
              }}
              size="small"
              style={{ padding: 0 }}
              className={classes.autocomplete}
              options={
                (gateIn.allDropDown &&
                  gateIn.allDropDown.client_ref_codes &&
                  gateIn.allDropDown.client_ref_codes.map(
                    (option) => option
                  )) ||
                []
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  style={{ padding: 0 }}
                  variant="outlined"
                  className={classes.textField}
                  onBlur={(e) => {
                    const { value } = e.target;

                    setRefCode(value);
                    dispatch({
                      type: "SET_MNR_REF_CODE",
                      payload: value,
                    });
                  }}
                  size="small"
                />
              )}
            />
            <Typography variant="subtitle2" className={classes.LabelTypography}>
              Make Available?
            </Typography>
            <Switch
              color="primary"
              checked={MNR.make_available === true}
              inputProps={{ "aria-label": "controlled" }}
              onChange={(event) => {
                dispatch({
                  type: "SET_MAKE_AVAILABLE",
                  payload: event.target.checked,
                });
                dispatch({ type: "MNR_CLEAR_CONTAINER_LIST" });
              }}
            />
            <Typography variant="subtitle2" className={classes.LabelTypography}>
              History?
            </Typography>
            <Switch
              color="primary"
              checked={MNRGridSearch.out_history === "True"}
              inputProps={{ "aria-label": "controlled" }}
              onChange={(event) => {
                dispatch({
                  type: "SET_MNR_SEARCH_OUT_HISTORY",
                  payload: event.target.checked ? "True" : "False",
                });
              }}
            />
          </Grid>
          {MNR.make_available === false &&
            selectedStockList?.length > 0 &&
            selectedItems.some((item) => item.stage === "Available") && (
              <Stack
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexDirection: matchesIphone ? "column" : "row",
                }}
              >
                <Button
                  className={classes.button}
                  onClick={() => {
                    setOpenModal(true);
                    setSelectedContainerStage("estimate");
                  }}
                >
                  Send Estimate Westim
                </Button>
                <Button
                  className={classes.button}
                  onClick={() => {
                    setOpenModal(true);
                    setSelectedContainerStage("repair");
                  }}
                >
                  Send Repair Destim
                </Button>
              </Stack>
            )}
          {MNR.make_available === false &&
            selectedStockList?.length > 0 &&
            selectedItems.some((item) => item.stage === "Repair") && (
              <Button
                className={classes.button}
                onClick={() => {
                  setOpenModal(true);
                  setSelectedContainerStage("estimate");
                }}
              >
                Send Estimate Westim
              </Button>
            )}
          {MNR.make_available === false &&
            selectedStockList?.length > 0 &&
            selectedItems.some((item) => item.stage === "Approval") && (
              <Button
                className={classes.button}
                onClick={() => {
                  setOpenModal(true);
                  setSelectedContainerStage("estimate");
                }}
              >
                Send Estimate Westim
              </Button>
            )}
          {MNR.make_available === true &&
            stocksAvailableList.some((item) => item.isCheck) && (
              <Button className={classes.button} onClick={handleMakeAvailable}>
                Make Containers Available
              </Button>
            )}
          {!matchesIphone && (
            <Tooltip title="Refresh the page ">
              <Button
                style={{
                  backgroundColor: "#2A5FA5",
                  color: "white",
                }}
                onClick={() => window.location.reload()}
                startIcon={<RefreshIcon />}
              >
                Refresh
              </Button>
            </Tooltip>
          )}
        </div>
        <Paper
          className={classes.paperContainer}
          elevation={0}
          style={{ marginBottom: "100px",marginTop:"10px" }}
        >
          <ReactTable
            data={stocksAvailableList && stocksAvailableList}
            columns={[...Columns]}
            minRows={store.MNRGridSearch.on_page_data}
            collapseOnDataChange={false}
            style={{
              alignItems: "center",
              textAlign: "center",
              display: "flex",
              // height: matchesIpad ? "500px" : "300px",
              justifyContent: "center", // This will force the table body to overflow and scroll, since there is not enough room
            }}
            showPagination={false}
            defaultPageSize={100}
          />
          <Grid
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              padding: 10,
              border: "1px solid #0000000d",
              marginBottom: 20,
            }}
          >
            {matchesIphone ? (
              <IconButton
                onClick={prevStockPage}
                disabled={
                  store.MNRGridSearch.pg_no === 1 ||
                  store.MNRGridSearch.pg_no === "1"
                    ? true
                    : false
                }
              >
                <PreviousIcon
                  style={{
                    fill:
                      store.MNRGridSearch.pg_no === 1 ||
                      store.MNRGridSearch.pg_no === "1"
                        ? "grey"
                        : "#243545",
                  }}
                />
              </IconButton>
            ) : (
              <Button
                variant="contained"
                startIcon={<PreviousIcon />}
                color="secondary"
                onClick={prevStockPage}
                disabled={
                  store.MNRGridSearch.pg_no === 1 ||
                  store.MNRGridSearch.pg_no === "1"
                    ? true
                    : false
                }
              >
                Previous
              </Button>
            )}

            <Grid style={{ display: "flex", alignItems: "flex-end" }}>
              {!matchesIphone && (
                <Typography variant="subtitle2" style={{ padding: "3px" }}>
                  Page
                </Typography>
              )}
              <TextField
                id="basic"
                variant="outlined"
                size="small"
                className={classes.paginationWrapper}
                value={currentPage}
                onChange={(e) => {
                  if (e.target.value > stocksAndAllotment.totalPages) {
                    notify("Invalid value entered", {
                      variant: "warning",
                    });
                  } else {
                    setCurrentPage(e.target.value);
                  }
                }}
                onBlur={(e) => {
                  if (e.target.value > stocksAndAllotment.totalPages) {
                    notify("Invalid value entered", {
                      variant: "warning",
                    });
                  } else {
                    setCurrentPage(e.target.value);
                    dispatch({
                      type: "TOGGLE_MNR_PAGE_NO_SEARCH_VALUE",
                      payload: e.target.value,
                    });
                  }
                }}
              />
              {!matchesIphone && (
                <Typography variant="subtitle2" style={{ padding: "3px" }}>
                  of
                </Typography>
              )}
              <Typography
                variant="subtitle2"
                style={{
                  padding: matchesIphone ? "10px 0 10px 0" : "3px",
                  fontSize: matchesIphone ? "12px" : "14px",
                }}
              >
                {stocksAndAllotment.totalPages}
              </Typography>
            </Grid>
            <TextField
              id="client-master-code"
              select
              value={store.MNRGridSearch.on_page_data}
              variant="outlined"
              inputProps={{ className: classes.input }}
              onChange={(e) => {
                setCurrentPage(1);
                dispatch({
                  type: "TOGGLE_MNR_PAGE_NO_SEARCH_VALUE",
                  payload: 1,
                });
                dispatch({
                  type: "TOGGLE_MNR_ON_PAGE_DATA_SEARCH_VALUE",
                  payload: e.target.value,
                });
              }}
            >
              <MenuItem key={"5 rows"} value={"5"}>
                {"5 rows"}
              </MenuItem>
              <MenuItem key={"10 rows"} value={"10"}>
                {"10 rows"}
              </MenuItem>
              <MenuItem key={"20 rows"} value={"20"}>
                {"20 rows"}
              </MenuItem>
              <MenuItem key={"25 rows"} value={"25"}>
                {"25 rows"}
              </MenuItem>
              <MenuItem key={"50 rows"} value={"50"}>
                {"50 rows"}
              </MenuItem>
              <MenuItem key={"100 rows"} value={"100"}>
                {"100 rows"}
              </MenuItem>
            </TextField>
            {matchesIphone ? (
              <IconButton
                onClick={nextStockPage}
                disabled={stocksAndAllotment.nextPage === "" ? true : false}
              >
                <NextIcon
                  style={{
                    fill:
                      stocksAndAllotment.nextPage === "" ? "gray" : "#243545",
                  }}
                />
              </IconButton>
            ) : (
              <Button
                variant="contained"
                endIcon={<NextIcon />}
                color="secondary"
                onClick={nextStockPage}
                disabled={stocksAndAllotment.nextPage === "" ? true : false}
              >
                Next
              </Button>
            )}
          </Grid>
        </Paper>

        <Modal
          aria-labelledby="transition-modal-title"
          aria-describedby="transition-modal-description"
          className={classes.modal}
          open={open}
          onClose={handleClose}
          closeAfterTransition
          BackdropComponent={Backdrop}
          BackdropProps={{
            timeout: 500,
          }}
          style={{
            position: "absolute",
            top: "50%",
            left: 240,
            width: "75%",
            border: "none",
          }}
        >
          <ProgressBar
            percent={
              stage === "Available"
                ? 99.9
                : stage === "Repair"
                ? 80
                : stage === "Approval"
                ? 60
                : stage === "Estimate"
                ? 40
                : 20
            }
            filledBackground="linear-gradient(to right, #fefb72, #f0bb31)"
            height={15}
            hasStepZero={false}
          >
            <Step transition="scale" transitionDuration={500}>
              {({ accomplished }) => (
                <>
                  <div
                    className={`indexedStep ${
                      accomplished ? "accomplished" : ""
                    }`}
                    style={{
                      paddingBottom: 50,
                      filter: `grayscale(${accomplished ? 0 : 80}%)`,
                    }}
                  >
                    <Typography className={classes.progressTextColor}>
                      Survey
                    </Typography>
                  </div>
                  <div
                    className={`indexedStep ${
                      accomplished ? "accomplished" : ""
                    }`}
                    style={{
                      paddingTop: 50,
                      filter: `grayscale(${accomplished ? 0 : 80}%)`,
                    }}
                  >
                    <Typography className={classes.progressTextColor}>
                      {surveyDate}
                    </Typography>
                  </div>
                </>
              )}
            </Step>
            <Step transition="scale" transitionDuration={500}>
              {({ accomplished }) => (
                <>
                  <div
                    className={`indexedStep ${
                      accomplished ? "accomplished" : ""
                    }`}
                    style={{
                      paddingBottom: 50,
                      filter: `grayscale(${accomplished ? 0 : 80}%)`,
                    }}
                  >
                    <Typography className={classes.progressTextColor}>
                      Estimate
                    </Typography>
                  </div>
                  <div
                    className={`indexedStep ${
                      accomplished ? "accomplished" : ""
                    }`}
                    style={{
                      paddingTop: 50,
                      filter: `grayscale(${accomplished ? 0 : 80}%)`,
                    }}
                  >
                    <Typography className={classes.progressTextColor}>
                      {estimateDate}
                    </Typography>
                  </div>
                </>
              )}
            </Step>
            <Step transition="scale" transitionDuration={500}>
              {({ accomplished }) => (
                <>
                  <div
                    className={`indexedStep ${
                      accomplished ? "accomplished" : ""
                    }`}
                    style={{
                      paddingBottom: 50,
                      filter: `grayscale(${accomplished ? 0 : 80}%)`,
                    }}
                  >
                    <Typography className={classes.progressTextColor}>
                      Approval
                    </Typography>
                  </div>
                  <div
                    className={`indexedStep ${
                      accomplished ? "accomplished" : ""
                    }`}
                    style={{
                      paddingTop: 50,
                      filter: `grayscale(${accomplished ? 0 : 80}%)`,
                    }}
                  >
                    <Typography className={classes.progressTextColor}>
                      {approvalDate}
                    </Typography>
                  </div>
                </>
              )}
            </Step>
            <Step transition="scale" transitionDuration={500}>
              {({ accomplished }) => (
                <>
                  <div
                    className={`indexedStep ${
                      accomplished ? "accomplished" : ""
                    }`}
                    style={{
                      paddingBottom: 50,
                      filter: `grayscale(${accomplished ? 0 : 80}%)`,
                    }}
                  >
                    <Typography className={classes.progressTextColor}>
                      Repair
                    </Typography>
                  </div>
                  <div
                    className={`indexedStep ${
                      accomplished ? "accomplished" : ""
                    }`}
                    style={{
                      paddingTop: 50,
                      filter: `grayscale(${accomplished ? 0 : 80}%)`,
                    }}
                  >
                    <Typography className={classes.progressTextColor}>
                      {repairDate}
                    </Typography>
                  </div>
                </>
              )}
            </Step>
            <Step transition="scale" transitionDuration={500}>
              {({ accomplished }) => (
                <>
                  <div
                    className={`indexedStep ${
                      accomplished ? "accomplished" : ""
                    }`}
                    style={{
                      paddingBottom: 50,
                      filter: `grayscale(${accomplished ? 0 : 80}%)`,
                    }}
                  >
                    <Typography className={classes.progressTextColor}>
                      Available
                    </Typography>
                  </div>
                  <div
                    className={`indexedStep ${
                      accomplished ? "accomplished" : ""
                    }`}
                    style={{
                      paddingTop: 50,
                      filter: `grayscale(${accomplished ? 0 : 80}%)`,
                    }}
                  >
                    <Typography className={classes.progressTextColor}>
                      {availableDate}
                    </Typography>
                  </div>
                </>
              )}
            </Step>
          </ProgressBar>
        </Modal>

        <Modal open={openModal} onClose={handleModalClose}>
          <div style={getModalStyle()} className={classes.modalPaper}>
            <Typography variant="h6" id="modal-title">
              List of selected containers available for dispatch
            </Typography>
            <Grid className={classes.chipRoot} style={{ paddingBottom: 50 }}>
              {selectedStockList.length !== 0 &&
                selectedStockList.map((option) => (
                  <Chip
                    label={option.container_no}
                    clickable
                    className={
                      option.enabled === true
                        ? classes.selectedBtn
                        : classes.notSelectedBtn
                    }
                    onClick={() => {
                      handleChip(option?.pk);
                    }}
                    onDelete={() => {
                      handleChip();
                    }}
                    deleteIcon={
                      option.enabled === true ? <DoneIcon /> : <CrossIcon />
                    }
                  />
                ))}
            </Grid>
            <Typography className={classes.chipRoot}>
              Total Containers Selected: {totalSelectedContainers()}
            </Typography>
            {selectedContainerStage === "estimate" ? (
              <Grid className={classes.chipRoot}>
                <Button
                  onClick={handleEstimateWistim}
                  style={{
                    backgroundColor: "#2A5FA5",
                    color: "white",
                    borderRadius: 7,
                  }}
                >
                  Generate Wistim
                </Button>
              </Grid>
            ) : (
              <Grid className={classes.chipRoot}>
                <Button
                  onClick={handleRepairDistim}
                  style={{
                    backgroundColor: "#2A5FA5",
                    color: "white",
                    borderRadius: 7,
                  }}
                >
                  Generate Destim
                </Button>
              </Grid>
            )}
          </div>
        </Modal>
      </div>
      <MnrFooter />
    </>
  );
};

export default MNRListing;
