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
  useMediaQuery,
  IconButton,
} from "@material-ui/core";
import { useSnackbar } from "notistack";
import { green } from "@material-ui/core/colors";
import { useDispatch, useSelector } from "react-redux";
import {
  searchStocksDispatch,
  editStocksRowValues,
} from "../actions/StocksAndAllotmentActions";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSort } from "@fortawesome/free-solid-svg-icons";
import InfoIcon from "@material-ui/icons/Info";
import PreviousIcon from "@material-ui/icons/ArrowBack";
import NextIcon from "@material-ui/icons/ArrowForward";
import { theme } from "../App";
import { Stack } from "@mui/material";

const useStyles = makeStyles((theme) => ({
  paperContainer: {
    padding: theme.spacing(2, 3),
    marginBottom: "100px",
    [theme.breakpoints.down("sm")]:{
      marginBottom:"240px"
    }
  },
  input: {
    padding: 7,
    borderColor: "black",
    "& .MuiList-root .MuiMenu-list .MuiList-padding": {
      height: "200px",
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
  pagination: {
    width: "50px",
    padding: "3px",
    "& .MuiOutlinedInput-inputMarginDense": {
      paddingLeft: "18px",
      paddingTop: "5px",
    },
    "& .MuiOutlinedInput-root": {
      height: "35px",
    },
  },
  clearIcon: {
    float: "right",
    cursor: "pointer",
  },
  tableListing: {
    "& ::-webkit-scrollbar": {
      height: "5px",
    },
   
  },
  modalPopUp: {
    top: "10%",
    position: "absolute",
    background: "#FFF",
    width: "85%",
    height: "80%",
    margin: "auto",
    left: "10%",
    padding: "15px 25px",
    pointerEvents: "painted",
    [theme.breakpoints.down("md")]: {
      overflowY: "scroll",
      top: "10%",
      width: "95%",
      height: "80%",
      left: 10,
    },
    [theme.breakpoints.down("xs")]: {
      overflowY: "scroll",
      top: "10%",
      width: "95%",
      height: "80%",
      left: 10,
    },
  },

  searchButton: {
    backgroundColor: "#FDBD2E",
    color: "#fff",
    borderRadius: "0.5rem",
    padding: "1px 4px",
    height: 40,
    fontSize: 16,
    width: "220px",
    boxShadow: "0px 3px 6px #9199A14D",
    position: "relative",
    top: "-50px",
    right: "30px",
    float: "right",
    "&:hover": {
      backgroundColor: "#FDBD2E",
      color: "#fff",
    },
    [theme.breakpoints.down("md")]: {
      height: 40,
      width: "250px",
      top: "168px",
      marginLeft: "100px",
    },
    [theme.breakpoints.down("xs")]: {
      height: 30,
      width: "150px",
      fontSize: 10,
      top: "220px",
      marginLeft: "-20px",
    },
  },
}));

const DropDownTextField = (props) => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const storeState = useSelector((state) => state.stocksAndAllotmentSearch);
  const notify = useSnackbar().enqueueSnackbar;

  const {
    dropdownList,
    dropDId,
    row,
    dropKey,
    dropDownColumnName,
    isDisabled,
  } = props;


  // useEffect(() => {
  
  //   if (row?.value) setFieldValue(row?.value);
  // }, [row?.value]);

  return (
    <TextField
      id={dropDId}
      key={dropKey}
      select
      value={row?.original[dropDownColumnName]}
      defaultValue={row?.original[dropDownColumnName]}
      variant="outlined"
      fullWidth
      disabled={isDisabled}
      inputProps={{ className: classes.input }}
      onChange={(e) => {
        // setFieldValue(e.target.value);
        row.original[dropDownColumnName] = e.target.value;
        dispatch(
          editStocksRowValues(row.original.pk, row.original, storeState, notify)
        );
      }}
    >
      {dropdownList &&
        dropdownList.map((option) => (
          <MenuItem key={option} value={option} style={{ height: "18px" }}>
            {option}
          </MenuItem>
        ))}
    </TextField>
  );
};
const EditableTextField = (props) => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const storeState = useSelector((state) => state.stocksAndAllotmentSearch);
  const notify = useSnackbar().enqueueSnackbar;

  const { dropDId, row, dropKey, editableColumnName, isDisabled } = props;

  const [fieldValue, setFieldValue] = useState("");

  useEffect(() => {
    if (row.value) setFieldValue(row.value);
  }, [row.value]);

  return (
    <TextField
      id={dropDId}
      key={dropKey}
      value={fieldValue}
      variant="outlined"
      disabled={isDisabled}
      fullWidth
      inputProps={{ className: classes.input }}
      onChange={(e) => {
        setFieldValue(e.target.value);
      }}
      onBlur={(e) => {
        row.original[editableColumnName] = e.target.value;
        dispatch(
          editStocksRowValues(row.original.pk, row.original, storeState, notify)
        );
      }}
    />
  );
};

const StocksAndAllotmentListing = (props) => {
  const classes = useStyles();
  const [stocksAvailableList, setStocksAvailableList] = useState([]);
  const matchesIphone = useMediaQuery("(max-width:500px)");

  const store = useSelector((state) => state);
  const { gateIn, stocksAndAllotment, stocksAndAllotmentSearch } = store;
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRows, setSelectedRows] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [selectedStockList, setSelectedStockList] = useState([]);
  const [checkAll, setCheckAll] = useState(false);
  const notify = useSnackbar().enqueueSnackbar;
  const dispatch = useDispatch();
  const matchesIpad = useMediaQuery(theme.breakpoints.down("md"));
  const filtered =
    gateIn.allDropDown &&
    gateIn.allDropDown.stock_stage &&
    gateIn.allDropDown.stock_stage.filter((value) => value !== "Alloted");

  useEffect(() => {
    dispatch(searchStocksDispatch(stocksAndAllotmentSearch));
  }, [
    store.stocksAndAllotmentSearch.out_history,
    store.stocksAndAllotmentSearch.do_not_lift_queue,
    store.stocksAndAllotmentSearch.booking_no,
    store.stocksAndAllotmentSearch.pg_no,
    store.stocksAndAllotmentSearch.on_page_data,
    store.stocksAndAllotmentSearch.sealno_list,
    store.stocksAndAllotmentSearch.queued_recently
  ]);

  useEffect(() => {
    return () => {
      dispatch({ type: "RESET_STOCK_ALLOTMENT_DATA" });
    };
  }, []);

  useEffect(() => {
    let tempArray = [];
    stocksAndAllotment?.itemListing.length > 0 &&
      stocksAndAllotment.itemListing.map((row) => {
        let tempObj = {
          isShowCheck:
            (stocksAndAllotmentSearch.out_history === "True" &&
              row.status === "Alloted") ||
            (stocksAndAllotmentSearch.out_history === "False" &&
             ( row.status === "Available"|| row.status === "Without_Repair_Available")) ||
            row.status === "Alloted"||stocksAndAllotmentSearch.do_not_lift_queue ==="True",
          isCheck: false,
          enabled: false,
          pk: row.pk,
          queued_recently:row.queued_recently,
          allotment_date: row.allotment_date,
          approval_date: row.approval_date,
          approval_time: row.approval_time,
          automatic_mnr_status_change: row.automatic_mnr_status_change,
          available_date: row.available_date,
          available_time: row.available_time,
          booking_no: row.booking_no,
          do_not_lift_remarks:row.do_not_lift_remarks,
          aging: row.aging,
          client: row.client,
          container_no: row.container_no,
          container_no_is_valid: row.container_no_is_valid,
          container_status: row.container_status,
          empty_allotment_date: row.empty_allotment_date,
          estimate_date: row.estimate_date,
          estimate_time: row.estimate_time,
          gate_in: row.gate_in,
          gate_out: row.gate_out,
          grade: row.grade,
          in_do_not_lift_queue: row.in_do_not_lift_queue,
          is_alloted: row.is_alloted,
          is_estimate_westim_sent: row.is_estimate_westim_sent,
          is_repair_destim_sent: row.is_repair_destim_sent,
          line: row.line,
          remarks: row.remarks,
          repair_date: row.repair_date,
          repair_time: row.repair_time,
          seal_no: row.seal_no,
          sealno_list: row.sealno_list,
          size: row.size,
          sr_no: row.sr_no,
          status: row.status,
          survey_date: row.survey_date,
          survey_time: row.survey_time,
          type: row.type,
          usa_approval_container:row.usa_approval_container
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
  }, [stocksAndAllotment.itemListing]);

  useEffect(() => {
    const newData = stocksAvailableList.map((item) => ({
      ...item,
      isCheck: false,
      enabled: false,
    }));
    setCheckAll(false);
    setStocksAvailableList(newData);
    setSelectedItems([]);
  }, [stocksAndAllotment.container_status]);

  const checkAllRows = (val) => {
    let array2 = [...selectedRows];
    let tempArrayOfStage = [...selectedItems];
    const bookingNos = stocksAvailableList.filter(
      (item) => item.booking_no !== ""
    );
    let isShowError = false;
    if (stocksAvailableList.every((item) => item.booking_no === "")) {
  
      isShowError = true;
    } else if (
      bookingNos.every((item) => item.booking_no === bookingNos[0].booking_no)
    ) {
    
      isShowError = true;
    }
    if (isShowError) {
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
          tempArrayOfStage.push({
            pk: item.pk,
            status: item.status,
            booking_no: item.booking_no,
          });
        } else {
          tempArrayOfStage = [];
        }
      });
      setSelectedItems(tempArrayOfStage);
      setSelectedRows(array2);
      setStocksAvailableList(updatedArray);
      setCheckAll(val);
    } else {
      notify("Selection of containers must have same booking number", {
        variant: "warning",
      });
    }
  };
  useEffect(() => {
    const selectedArray = stocksAvailableList.filter((item) => item.isCheck);
    setSelectedStockList(selectedArray);
    dispatch({
      type: "SET_CHECK_ROW",
      payload: selectedArray,
    });
  }, [stocksAvailableList]);

  
  const handleCheck = (index, id, val, bookingNo) => {
    let isApplicableCheck = false;
    if (selectedStockList.every((item) => item.booking_no.toUpperCase() === bookingNo.toUpperCase())) {
      isApplicableCheck = true;
    }
    if (isApplicableCheck) {
      if (!selectedRows.includes(id) && val) {
        setSelectedRows([...selectedRows, id]);
      } else {
        const updatedVal = selectedRows.filter((item) => item !== id);
        setSelectedRows(updatedVal);
      }
      const updatedData = [...stocksAvailableList];
      updatedData[index].isCheck = !updatedData[index].isCheck;
      updatedData[index].enabled = true;
      setStocksAvailableList(updatedData);
    } else {
      notify("Selection of containers must have same booking number", {
        variant: "warning",
      });
    }
  };

  const nextStockPage = () => {
    setCurrentPage(Number(currentPage) + 1);
    dispatch({
      type: "TOGGLE_PAGE_NO_SEARCH_VALUE",
      payload: Number(store.stocksAndAllotmentSearch.pg_no) + 1,
    });
  };

  const prevStockPage = () => {
    setCurrentPage(Number(currentPage) - 1);
    dispatch({
      type: "TOGGLE_PAGE_NO_SEARCH_VALUE",
      payload: Number(store.stocksAndAllotmentSearch.pg_no) - 1,
    });
  };


 
  const Columns = [
    {
      Header: (
        <div>
          {stocksAvailableList?.length > 0 &&
            stocksAvailableList.every((item) => item.status !== "Alloted") &&
            stocksAvailableList[0].isShowCheck && (
              <Checkbox
                checked={checkAll}
                onClick={(e) => {
                  checkAllRows(e.target.checked);
                }}
                style={{ color: "#243545" }}
                inputProps={{ "aria-label": "Checkbox A" }}
                aria-sort="none"
              />
            )}
        </div>
      ),
      width: 50,
      style: {
        textAlign: "center",
      },
      Cell: (row) => {
        if (row.original.isShowCheck) {
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
                    row.original.booking_no,
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
      Header: (
        <b style={{ color: "#2A5FA5" }}>
          Gate Out Date <FontAwesomeIcon icon={faSort} />
        </b>
      ),
      show:
        store.stocksAndAllotmentSearch.out_history === "True" ? true : false,
      accessor: "gate_out",
      style: {
        textAlign: "center",
      },
      Cell: (row) => {
        return (
          <div>
            <span title={row.original.remarks}>{row.original.gate_out}</span>
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
          <Stack
            direction={"row"}
            flexDirection={"row"}
            alignItems={"center"}
            justifyContent={"center"}
          >
            {/* <span title={row.original.remarks}> */}
            <Typography
              style={{
                color:
                  row.original.container_no_is_valid === false && "#FF0000",
              }}
            >
              {row.original.container_no}
            </Typography>
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
            {/* </span> */}
          </Stack>
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
      Header: <b style={{ color: "#2A5FA5" }}>Grade</b>,
      width: 50,
      sortable: false,
      accessor: "grade",
      Cell: (row) => (
        <DropDownTextField
          dropdownList={gateIn.allDropDown && gateIn.allDropDown.grade}
          dropDownColumnName="grade"
          dropDId={`stock-grade-drop-${row.index}`}
          dropKey={`stock-grade-key-${row.index}`}
          row={row}
          isDisabled={false}
        />
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
        <DropDownTextField
          dropdownList={
            row.original.in_do_not_lift_queue === "True" ||
            (row.original.is_alloted === "True" &&
              row.original.status === "Alloted")
              ? gateIn.allDropDown && gateIn.allDropDown.stock_stage
              : filtered
          }
          dropDownColumnName="status"
          dropDId={`stock-status-drop-${row.index}`}
          dropKey={`stock-status-key-${row.index}`}
          row={row}
          isDisabled={
            row.original.automatic_mnr_status_change === "True" ||
            row.original.in_do_not_lift_queue === "True" ||
            (row.original.is_alloted === "True" &&
              row.original.status === "Alloted")
              ? true
              : false
          }
        />
      ),
      style: {
        textAlign: "center",
      },
    },
    {
      Header: (
        <b style={{ color: "#2A5FA5" }}>
          Available Date <FontAwesomeIcon icon={faSort} />
        </b>
      ),
      accessor: "available_date",
      style: {
        textAlign: "center",
      },
      Cell: (row) => {
        return row.original.status === "Available" ||
          row.original.status === "Alloted" ? (
          <EditableTextField
            dropDId={`stock-seal-edit-${row.index}`}
            dropKey={`stock-seal-key-${row.index}`}
            editableColumnName="available_date"
            row={row}
          />
        ) : (
          <div>
            <span title={row.original.remarks}>
              {row.original.available_date}
            </span>
          </div>
        );
      },
    },
    {
      Header: <b style={{ color: "#2A5FA5" }}>Ageing</b>,
      width: 50,
      sortable: false,
      accessor: "aging",
      style: {
        textAlign: "center",
      },
      Cell: (row) => {
        return (
          <div>
            <span title={row.original.remarks}>{row.original.aging}</span>
          </div>
        );
      },
    },

    {
      Header: (
        <b style={{ color: "#2A5FA5" }}>
          Allotment Date <FontAwesomeIcon icon={faSort} />
        </b>
      ),
      accessor: "allotment_date",
      style: {
        textAlign: "center",
      },
      Cell: (row) => {
        return (
          <div>
            <span title={row.original.remarks}>
              {row.original.allotment_date}
            </span>
          </div>
        );
      },
    },

    {
      Header: <b style={{ color: "#2A5FA5" }}>Booking Number</b>,
      sortable: false,
      width: 50,
      accessor: "booking_no", 
      style: {
        textAlign: "center",
      },
      Cell: (row) => {
        return (
          <div>
            <span title={row.original.remarks}>{row.original.booking_no}</span>
          </div>
        );
      },
    },
    {
      Header: <b style={{ color: "#2A5FA5" }}>Seal Number</b>,
      sortable: false,
      accessor: "seal_no",
      Cell: (row) =>
        row.original.seal_no && (
          <EditableTextField
            dropDId={`stock-seal-edit-${row.index}`}
            dropKey={`stock-seal-key-${row.index}`}
            editableColumnName="seal_no"
            row={row}
            disabled
            variant="filled"
            readOnlyP={true}
            isDisabled={true}
          />
        ),
      style: {
        textAlign: "center",
      },
    },
    {
      Header: <b style={{ color: "#2A5FA5" }}>Select Seal Number</b>,
      sortable: false,
      accessor: "sealno_list",
      Cell: (row) =>
        row.original.booking_no && (
          <DropDownTextField
            style={{ height: "150px", overflowY: "scroll" }}
            dropdownList={row && row.value}
            dropDownColumnName="seal_no"
            dropDId={`stock-seal-drop-${row.index}`}
            dropKey={`stock-seal-key-${row.index}`}
            row={row}
            isDisabled={false}
          />
        ),
      style: {
        textAlign: "center",
      },
    },
    {
      Header: <b style={{ color: "#2A5FA5" }}>Queued Recently</b>,
      sortable: false,
      width: 150,
      accessor: "queued_recently",
      Cell: (row) => (
        <div>
          <span title={row.original.queued_recently}>{row.original.queued_recently ?"Yes":"No"}</span>
        </div>
      ),
      style: {
        textAlign: "center",
      },
    },
      {
      Header: <b style={{ color: "#2A5FA5" }}>USA Approved </b>,
      sortable: false,
      width: 150,
      accessor: "usa_approval_container",
      Cell: (row) => (
        <div>
          <span title={row.original.usa_approval_container}>{row.original.usa_approval_container ?"Yes":"No"}</span>
        </div>
      ),
      style: {
        textAlign: "center",
      },
    },

    {
      Header: <b style={{ color: "#2A5FA5" }}>Do Not Lift Remarks </b>,
      sortable: false,
      width: 200,
      accessor: "do_not_lift_remarks",
      Cell: (row) => (
        <div>
          <span title={row.original.remarks}>{row.original.do_not_lift_remarks }</span>
        </div>
      ),
      style: {
        textAlign: "center",
      },
    },
    
  ];

  return (
    <div style={{ width: matchesIpad ? (matchesIphone ? "100%" : "100%") : "100%"}}>
     
      <Paper className={classes.paperContainer} elevation={0}>
        <ReactTable
          data={stocksAvailableList && stocksAvailableList}
          columns={[...Columns]}
          minRows={store.stocksAndAllotmentSearch.on_page_data}
          collapseOnDataChange={false}
          className={classes.tableListing}
          style={{
            alignItems: "center",
            textAlign: "center",
            display: "flex",
            justifyContent: "center",
            width: "100%", // This will force the table body to overflow and scroll, since there is not enough room
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
                store.stocksAndAllotmentSearch.pg_no === 1 ||
                store.stocksAndAllotmentSearch.pg_no === "1"
                  ? true
                  : false
              }
            >
              <PreviousIcon
                style={{
                  fill:
                    store.stocksAndAllotmentSearch.pg_no === 1 ||
                    store.stocksAndAllotmentSearch.pg_no === "1"
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
                store.stocksAndAllotmentSearch.pg_no === 1 ||
                store.stocksAndAllotmentSearch.pg_no === "1"
                  ? true
                  : false
              }
            >
              Previous
            </Button>
          )}
          <Grid style={{ display: "flex", alignItems: "flex-end" }}>
            {!matchesIphone && (
              <Typography variant="subtitle2" style={{ padding: "10px" }}>
                Page
              </Typography>
            )}
            <TextField
              id="basic"
              variant="outlined"
              size="small"
              value={currentPage}
              className={classes.pagination}
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
                if (
                  e.target.value === "" ||
                  e.target.value === "0" ||
                  e.target.value > stocksAndAllotment.totalPages
                ) {
                  notify("Invalid value entered", {
                    variant: "warning",
                  });
                  setCurrentPage(1);
                  dispatch({
                    type: "TOGGLE_PAGE_NO_SEARCH_VALUE",
                    payload: 1,
                  });
                } else {
                  setCurrentPage(e.target.value);
                  dispatch({
                    type: "TOGGLE_PAGE_NO_SEARCH_VALUE",
                    payload: e.target.value,
                  });
                }
              }}
            />
            {!matchesIphone && (
              <Typography variant="subtitle2" style={{ padding: "10px" }}>
                of
              </Typography>
            )}
            <Typography
              variant="subtitle2"
              style={{
                padding: matchesIphone ? "10px 0 10px 0" : "10px",
                fontSize: matchesIphone ? "12px" : "14px",
              }}
            >
              {stocksAndAllotment.totalPages}
            </Typography>
          </Grid>
          <TextField
            id="client-master-code"
            select
            value={store.stocksAndAllotmentSearch.on_page_data}
            variant="outlined"
            inputProps={{ className: classes.input }}
            onChange={(e) => {
              setCurrentPage(1);
              dispatch({
                type: "TOGGLE_PAGE_NO_SEARCH_VALUE",
                payload: 1,
              });
              dispatch({
                type: "TOGGLE_ON_PAGE_DATA_SEARCH_VALUE",
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
                  fill: stocksAndAllotment.nextPage === "" ? "gray" : "#243545",
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
    </div>
  );
};

export default StocksAndAllotmentListing;