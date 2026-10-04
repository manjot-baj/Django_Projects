import React, { useEffect, useRef, useState } from "react";
import ReactTable from "react-table-v6";
import "react-table-v6/react-table.css";
import "./Table.css";
import {
  Button,
  Grid,
  IconButton,
  Typography,
  makeStyles,
  TextField,
  Box,
  Modal,
  useMediaQuery,
  Popover,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  TableContainer,
  Table,
  Paper,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
} from "@material-ui/core";
import { useDispatch, useSelector } from "react-redux";
import { Stack } from "@mui/material";
import ReplayIcon from "@mui/icons-material/Replay";
import SearchIcon from "@material-ui/icons/Search";
import {
  downloadBillByPKAction,
  downloadPDF,
  getAllRequistion,
  getAllRequistionByBill,
} from "../../actions/Procurement/requestAction";
import { useSnackbar } from "notistack";
import { Link } from "react-router-dom";
import PreviousIcon from "@material-ui/icons/ArrowBack";
import NextIcon from "@material-ui/icons/ArrowForward";
import AddShoppingCartIcon from "@mui/icons-material/AddShoppingCart";
import RequestSearch from "./RequestSearch";
import ClearIcon from "@material-ui/icons/Clear";
import { useHistory } from "react-router-dom";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import DownloadIcon from "@mui/icons-material/Download";
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";
import FilterListIcon from "@mui/icons-material/FilterList";
import {
  KeyboardDatePicker,
  MuiPickersUtilsProvider,
} from "@material-ui/pickers";
import DateFnsUtils from "@date-io/date-fns";
import RefreshIcon from "@mui/icons-material/Refresh";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import { REQ_REDUCER } from "../../reducers/procurement/requesitionReducer";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import CustomHeading from "../CustomHeading";

const customHeaderStyle = {
  background: "white",
  height: "40px",
  color: "#2a5fa5",
  fontSize: "1rem",
  fontWeight: "bold",
  border: "0.3px solid white",
  borderRadius: "5px",
};

const useStyles = makeStyles((theme) => ({
  button: {
    marginLeft: 10,
    "&:hover": {
      cursor: "pointer",
    },
  },
  searchBox: {
    padding: "20px 20px 20px",
  },
  input: {
    padding: 7,
    borderColor: "black",
    "& .MuiInputBase-input": {
      width: "400px",
    },
  },
  textField: {
    borderColor: "#2a5fa5",

    "& .MuiOutlinedInput-root": {
      borderColor: "red",
      borderRadius: "6px",

      "& fieldset": {
        borderColor: "red",
      },
    },
    "& .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline": {
      padding: "0 !important",
      border: "2px solid rgba(0,0,0,0.2)",
      borderRadius: "6px",
    },
  },
  input: {
    marginLeft: theme.spacing(1),
    flex: 1,
    padding: 7,
    width: "70px",
    borderRadius: "0px",
    borderColor: "#2a5fa5",
    fontSize: "12px",
    [theme.breakpoints.down("xs")]: {
      padding: 5,
      fontSize: "0.8rem",
    },
  },

  backdrop: {
    zIndex: theme.zIndex.drawer + 1,
    color: "#fff",
  },
  paperContainer: {
    padding: theme.spacing(2, 3),
  },
  fab: {
    marginRight: theme.spacing(1),

    color: "#fff",
    cursor: "pointer",
    backgroundColor: "#2A5FA5",
    margin: 10,
  },
  bottom: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },

  iconButton: {
    float: "left",
    position: "absolute",
    left: "645px",
  },
  searchPaperMenu: {
    padding: "1px 4px",
    margin: 5,
    display: "flex",
    alignItems: "center",
    height: 45,
    borderRadius: "40px",
    width: "400px",
    "& .MuiPaper-root.MuiMenu-paper.MuiPopover-paper.MuiPaper-elevation8.MuiPaper-rounded":
      {
        marginTop: "123px !important",
      },
    [theme.breakpoints.down("xs")]: {
      height: 35,
    },
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
      width: "85%",
      padding: "20px",
      height: "70%",
    },
  },
  clearIcon: {
    float: "right",
    cursor: "pointer",
  },
  searchPaper: {
    padding: "1px 4px",
    margin: 5,
    display: "flex",
    alignItems: "center",
    height: 45,
    borderRadius: "40px",
    width: "42%",
    "& .MuiPaper-root.MuiMenu-paper.MuiPopover-paper.MuiPaper-elevation8.MuiPaper-rounded":
      {
        marginTop: "123px !important",
      },
    [theme.breakpoints.down("xs")]: {
      height: 35,
    },
  },
  searchButton: {
    backgroundColor: "#FDBD2E",
    color: "#fff",
    borderRadius: "0.5rem",
    padding: "1px 4px",
    height: 40,
    fontSize: 16,
    marginLeft: "auto",
    marginRight: "auto",
    width: "350px",
    marginTop: "8px",
    boxShadow: "0px 3px 6px #9199A14D",
    "&:hover": {
      backgroundColor: "#FDBD2E",
      color: "#fff",
    },
  },
  pdfDownload: {
    backgroundColor: "transparent",
    color: "black",
  },
  selectStatus: {
    height: "32px",
    padding: "8px 16px",
    border: "2px solid #2a5fa5",
    "& .MuiOutlinedInput-notchedOutline": {
      border: "none !important",
    },
    "& .MuiSelect-select": {
      backgroundColor: "transparent !important",
      color: "#2a5fa5",
      fontSize: "12px",
    },
    "& .MuiSvgIcon-root ": {
      fill: "#2a5fa5 !important",
    },
  },
  accordion: {
    boxShadow: "0px 0px 1px 0.1px rgba(0, 0, 0, 0.5)",
    "&::before": {
      top: 0,
      height: 1,
      content: "",
      opacity: 1,
      position: "absolute",
      right: "initial",
    },
  },
  heading:{
    fontSize:"12px",
    fontWeight:"bold",
    [theme.breakpoints.down("md")]:{
      marginBottom:"24px"
    }
  }
}));

const RequestAll = () => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const history = useHistory();
  const {user} =useSelector(state=>state)
  const { getRequisition, billData } = useSelector(
    (state) => state.ProcurementRequest
  );
  const [openAdvance, setOpenAdvance] = useState(false);
  const notify = useSnackbar().enqueueSnackbar;
  // eslint-disable-next-line no-unused-vars
  const [alignment, setAlignment] = React.useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [disable, setDisable] = useState(1);
  const matchesIphone = useMediaQuery("(max-width:500px)");
  const [value, setValue] = React.useState("ALL");
  const [anchorElAdvanceBill, setAnchorElAdvanceBill] = React.useState(null);
  const fromDateRef = useRef();
  const [isBillSearch, setIsBillSearch] = useState(false);
  const [topBill,setTopBill]=useState(false)
   
  

  const handleClickAdvanceBill = (event) => {
    setAnchorElAdvanceBill(event.currentTarget);
  };

  const handleCloseAdvanceBill = () => {
    if(billData ===null ){
      setIsBillSearch(false)
      setTopBill(false)
    }
    setAnchorElAdvanceBill(null);
  };

  const openAdvanceBill = Boolean(anchorElAdvanceBill);
  const idAdvanceBill = openAdvanceBill ? "simple-popover-Advance" : undefined;

  const handleAdvanceSearchBill = () => {
    const {
      bill_no,
      from_received_date,
      to_received_date,
      from_bill_date,
      to_bill_date,
    } = getRequisition;
    if (
      bill_no === "" &&
      from_bill_date === "" &&
      from_received_date === "" &&
      to_received_date === "" &&
      to_bill_date === ""
    ) {
      notify("Please select Bill Search from any one ", { variant: "warning" });
    } else if (from_bill_date && to_bill_date === "") {
      notify("Please select to Bill date", { variant: "warning" });
    } else if (from_received_date && to_received_date === "") {
      notify("Please select To Recieved Date", { variant: "warning" });
    } else if (bill_no && from_bill_date !== "") {
      notify("Please select only one search type ", { variant: "warning" });
    } else if (bill_no && from_received_date !== "") {
      notify("Please select only one search type ", { variant: "warning" });
    } else if (bill_no && from_received_date !== "") {
      notify("Please select only one search type ", { variant: "warning" });
    } else {
      dispatch(getAllRequistionByBill(notify));
      setIsBillSearch(true);
      setAnchorElAdvanceBill(null);
      setTopBill(true)
    }
  };

  const handleClearAdvance = () => {
    dispatch({
      type: "GET_ALL_REQUEST",
      payload: {
        from_received_date: "",
        to_received_date: "",
        from_bill_date: "",
        to_bill_date: "",
        bill_no: "",
      },
    });
    dispatch({ type: REQ_REDUCER.REQ_REDUCER_GET_ALL_BILL, payload: null });
  };

  const handleDateChange = (date, setValue) => {
    var selectedDate = new Date(date);
    var dd = String(selectedDate.getDate()).padStart(2, "0");
    var mm = String(selectedDate.getMonth() + 1).padStart(2, "0"); //
    var yyyy = selectedDate.getFullYear();
    var selectedDateFormat = yyyy + "-" + mm + "-" + dd;
    dispatch({
      type: "GET_ALL_REQUEST",
      payload: {
        [setValue]: selectedDateFormat,
      },
    });
  };

  const handleBillChange = (e) => {
    const { name, value } = e.target;
    dispatch({
      type: "GET_ALL_REQUEST",
      payload: {
        [name]: value,
      },
    });
  };

  const handleChangeStatus = (event) => {
    setValue(event.target.value);
    dispatch({
      type: "GET_ALL_REQUEST",
      payload: {
        pg_no: "1",
        is_approved: "",
        is_pending: "",
        is_partial_closed: "",
        is_closed: "",
        is_automate:"",
      },
    });
    if (event.target.value === "ALL") {
      dispatch({
        type: "GET_ALL_REQUEST",
        payload: {
          pg_no: "1",
          is_approved: "",
          is_pending: "",
          is_partial_closed: "",
          is_closed: "",
          is_automate:""
        },
      });
      dispatch(getAllRequistion(notify));
      setCurrentPage(1);
      return;
    }
    dispatch({
      type: "GET_ALL_REQUEST",
      payload: {
        [event.target.value]: true,
      },
    });
    dispatch(getAllRequistion(notify));
  };

  const onRowClick = (state, rowInfo, column, instance) => {
    return {
      onClick: (e) => {
        history.push({
          pathname: "/procurement/addrequesition",
          state: { original: rowInfo.original },
        });
      },
      style: {
        cursor: "pointer",
      },
    };
  };

  useEffect(() => {
    if(user.procurement_admin ===false){
      history.push("/dashboard");
    }
    setValue(
      getRequisition.is_approved
        ? "is_approved"
        : getRequisition.is_closed
        ? "is_closed"
        : getRequisition.is_partial_closed
        ? "is_partial_closed"
        : getRequisition.is_pending
        ? "is_pending"
        : getAllRequistion.is_automate ?"is_automate": "ALL"
    );
    dispatch(getAllRequistion(notify));

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const nextStockPage = () => {
    setCurrentPage(Number(currentPage) + 1);
    setDisable(disable + 1);
    dispatch({
      type: "GET_ALL_REQUEST",
      payload: {
        pg_no: Number(getRequisition.pg_no) + 1,
      },
    });
    dispatch(getAllRequistion(notify));
  };

  const prevStockPage = () => {
    setCurrentPage(Number(currentPage) - 1);
    setDisable(disable - 1);
    dispatch({
      type: "GET_ALL_REQUEST",
      payload: {
        pg_no: Number(getRequisition.pg_no) - 1,
      },
    });
    dispatch(getAllRequistion(notify));
  };

  const handleDownloadPDF = (e, original) => {
    e.stopPropagation();
    dispatch(downloadPDF(original.pk, notify));
  };

  const handleDownloadBill = (row) => {
    dispatch(downloadBillByPKAction(row.pk, notify));
  };

  return (
    <>
      <Box>
        <Stack
          direction={"row"}
          alignItems={"center"}
          justifyContent={"space-between"}
        >
          <Stack spacing={2} justifyContent={"flex-start"} direction={"row"} flexWrap={"wrap"}>
           { (billData !== null || isBillSearch ||topBill) && <Button
              endIcon={<SearchIcon />}
              variant="text"
              color="primary"
              style={{
                borderRadius: "4px",
                border: "2px solid #2a5fa5",
                fontSize: "12px",
                padding: "4px 16px",
              }}
              onClick={handleClickAdvanceBill}
            >
              Bill Search
            </Button>}
            <Popover
              id={idAdvanceBill}
              open={openAdvanceBill}
              anchorEl={anchorElAdvanceBill}
              onClose={handleCloseAdvanceBill}
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "left",
              }}
              style={{
                marginTop: "-50px",
                marginLeft: "20px",
                borderRadius: "20px",
              }}
            >
              <Box className={classes.searchBox}>
                <Stack
                  direction={"row"}
                  alignItems={"center"}
                  justifyContent={"space-between"}
                >
                  <Typography variant="h6" style={{ fontWeight: "bolder" }}>
                    Search Bill
                  </Typography>
                  <Stack
                    direction={"row"}
                    alignItems={"center"}
                    justifyContent={"space-between"}
                  >
                    <IconButton
                      variant="contained"
                      color="black"
                      onClick={handleAdvanceSearchBill}
                    >
                      <SearchIcon style={{ fill: "black" }} />
                    </IconButton>
                    <IconButton
                      color="rgba(0,0,0,0.09)"
                      onClick={handleClearAdvance}
                    >
                      <RefreshIcon />
                    </IconButton>
                  </Stack>
                </Stack>

                <Divider style={{ backgroundColor: "rgba(0,0,0,0.09)" }} />
                <Typography
                  variant="subtitle2"
                  style={{
                    fontWeight: "600",
                    marginTop: "32px",
                    marginBottom: "8px",
                  }}
                >
                  {" "}
                  Select by Bill No
                </Typography>
                <Stack direction={"row"} alignItems={"center"}>
                  <TextField
                    value={getRequisition.bill_no}
                    onChange={handleBillChange}
                    name="bill_no"
                    variant="outlined"
                    className={classes.textField}
                    inputProps={{
                      className: classes.input,
                      style: { width: "150px" },
                    }}
                  />
                </Stack>
                <Typography
                  variant="subtitle2"
                  style={{
                    fontWeight: "600",
                    marginTop: "32px",
                    marginBottom: "8px",
                  }}
                >
                  {" "}
                  Search by Recieved Date
                </Typography>
                <Stack direction={"row"} spacing={2}>
                  <Typography variant="caption">from </Typography>
                  <MuiPickersUtilsProvider
                    ref={fromDateRef}
                    utils={DateFnsUtils}
                  >
                    <KeyboardDatePicker
                      clearable
                      variant="inline"
                      onKeyDown={(e) => {
                        e.preventDefault();
                      }}
                      format="yyyy/MM/dd"
                      autoOk={true}
                      inputVariant="outlined"
                      id={`-date-picker-inline`}
                      value={
                        getRequisition.from_received_date
                          ? getRequisition.from_received_date
                          : null
                      }
                      error={false}
                      defaultValue={getRequisition.from_received_date}
                      emptyLabel=""
                      name="from_received_date"
                      helperText={``}
                      onChange={(date) => {
                        handleDateChange(date, "from_received_date");
                      }}
                      KeyboardButtonProps={{
                        "aria-label": "change date",
                      }}
                      className={classes.textField}
                      inputProps={{ className: classes.input }}
                    />
                  </MuiPickersUtilsProvider>
                  <Typography variant="caption">to</Typography>
                  <MuiPickersUtilsProvider utils={DateFnsUtils}>
                    <KeyboardDatePicker
                      variant="inline"
                      onKeyDown={(e) => {
                        e.preventDefault();
                      }}
                      format="yyyy/MM/dd"
                      autoOk={true}
                      inputVariant="outlined"
                      id={`-date-picker-inline`}
                      value={
                        getRequisition.to_received_date
                          ? getRequisition.to_received_date
                          : null
                      }
                      error={false}
                      emptyLabel=""
                      name="to_received_date"
                      helperText={``}
                      onChange={(date) => {
                        handleDateChange(date, "to_received_date");
                      }}
                      KeyboardButtonProps={{
                        "aria-label": "change date",
                      }}
                      className={classes.textField}
                      inputProps={{ className: classes.input }}
                    />
                  </MuiPickersUtilsProvider>
                </Stack>
                <Typography
                  variant="subtitle2"
                  style={{
                    fontWeight: "600",
                    marginTop: "32px",
                    marginBottom: "8px",
                  }}
                >
                  {" "}
                  Search by Bill Date
                </Typography>

                <Stack direction={"row"} spacing={2}>
                  <Typography variant="caption">from </Typography>
                  <MuiPickersUtilsProvider
                    ref={fromDateRef}
                    utils={DateFnsUtils}
                  >
                    <KeyboardDatePicker
                      clearable
                      variant="inline"
                      onKeyDown={(e) => {
                        e.preventDefault();
                      }}
                      format="yyyy/MM/dd"
                      autoOk={true}
                      inputVariant="outlined"
                      id={`-date-picker-inline`}
                      value={
                        getRequisition.from_bill_date
                          ? getRequisition.from_bill_date
                          : null
                      }
                      error={false}
                      defaultValue={getRequisition.from_bill_date}
                      emptyLabel=""
                      name="from_bill_date"
                      helperText={``}
                      onChange={(date) => {
                        handleDateChange(date, "from_bill_date");
                      }}
                      KeyboardButtonProps={{
                        "aria-label": "change date",
                      }}
                      className={classes.textField}
                      inputProps={{ className: classes.input }}
                    />
                  </MuiPickersUtilsProvider>
                  <Typography variant="caption">to</Typography>
                  <MuiPickersUtilsProvider utils={DateFnsUtils}>
                    <KeyboardDatePicker
                      variant="inline"
                      onKeyDown={(e) => {
                        e.preventDefault();
                      }}
                      format="yyyy/MM/dd"
                      autoOk={true}
                      inputVariant="outlined"
                      id={`-date-picker-inline`}
                      value={
                        getRequisition.to_bill_date
                          ? getRequisition.to_bill_date
                          : null
                      }
                      error={false}
                      emptyLabel=""
                      name="to_bill_date"
                      helperText={``}
                      onChange={(date) => {
                        handleDateChange(date, "to_bill_date");
                      }}
                      KeyboardButtonProps={{
                        "aria-label": "change date",
                      }}
                      className={classes.textField}
                      inputProps={{ className: classes.input }}
                    />
                  </MuiPickersUtilsProvider>
                </Stack>
              </Box>
            </Popover>
          </Stack>

        
        </Stack>
      </Box>
     { (billData !== null || isBillSearch) &&<Accordion
        style={{
          marginBottom: 20,
          borderRadius: 5,
          boxShadow: 3,
          marginTop: "16px",
        }}
        className={classes.accordion}
        expanded={billData !== null && isBillSearch}
        onChange={() => setIsBillSearch(!isBillSearch)}
      >
        <AccordionSummary
          expandIcon={<ExpandMoreIcon className={classes.iconbtn} />}
          aria-controls="panel1a-content"
          id="panel1a-header"
        >
          <Typography className={classes.heading}>Bill Details</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <TableContainer component={Paper}>
            <Table
              sx={{ maxWidth: 230, overflowY: "scroll" }}
              aria-label="simple table"
            >
              <TableHead>
                <TableRow>
                  <TableCell style={{ fontWeight: "bold" }}>Order No</TableCell>
                  <TableCell style={{ fontWeight: "bold" }} align="right">
                    Bill No
                  </TableCell>
                  <TableCell style={{ fontWeight: "bold" }} align="right">
                    Date
                  </TableCell>
                  <TableCell style={{ fontWeight: "bold" }} align="right">
                    Bill date
                  </TableCell>
                  <TableCell style={{ fontWeight: "bold" }} align="right">
                    Received date
                  </TableCell>
                  <TableCell style={{ fontWeight: "bold" }} align="right">
                    Total Amount
                  </TableCell>
                  <TableCell style={{ fontWeight: "bold" }} align="right">
                    Bill Download
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {billData?.map((row) => (
                  <TableRow
                    key={row.order_no}
                    sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                  >
                    <TableCell component="th" scope="row">
                      {row.order_no}
                    </TableCell>
                    <TableCell align="right">{row.bill_no}</TableCell>
                    <TableCell align="right">{row.date}</TableCell>
                    <TableCell align="right">{row.bill_date}</TableCell>
                    <TableCell align="right">{row.received_date}</TableCell>
                    <TableCell align="right">{row.total_amount}</TableCell>
                    <TableCell align="right">
                     { row?.bill_uploaded &&<IconButton onClick={() => handleDownloadBill(row)}>
                        <PictureAsPdfIcon style={{ fill: "#e62c31" }} />
                      </IconButton>}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </AccordionDetails>
      </Accordion>}
      <Stack
        direction={"row"}
        justifyContent={"space-between"}
        alignItems={"center"}
        flexWrap={"wrap"}
        
      >
        <CustomHeading variant="body1" className={classes.heading}>Requesition Details</CustomHeading>
        <Stack direction={"row"} justifyContent={"flex-end"} spacing={2} alignItems={"center"} flexWrap={"wrap"} marginTop={matchesIphone?"24px":"0"}>
        { billData === null && !isBillSearch && <Button
              endIcon={<SearchIcon />}
              variant="text"
              color="primary"
              style={{
                borderRadius: "4px",
                border: "2px solid #2a5fa5",
                fontSize: "12px",
                padding: "4px 16px",
              }}
              onClick={handleClickAdvanceBill}
            >
              Bill Search
            </Button>}
          <FormControl>
            <Select
              labelId="demo-simple-select-label"
              id="demo-simple-select"
              value={value}
              inputProps={{ "aria-label": "Without label" }}
              onChange={handleChangeStatus}
              className={classes.selectStatus}
            >
              <MenuItem value={"ALL"}>All</MenuItem>
              <MenuItem value={"is_pending"}>Pending</MenuItem>
              <MenuItem value={"is_approved"}>Approved</MenuItem>
              <MenuItem value={"is_automate"}> Automate</MenuItem>
              <MenuItem value={"is_partial_closed"}>Partially Closed</MenuItem>

              <MenuItem value={"is_closed"}> Closed</MenuItem>
            </Select>
          </FormControl>

          <Button
            variant="text"
            color="primary"
            style={{
              borderRadius: "4px",
              border: "2px solid #2a5fa5",
              fontSize: "12px",
              padding: "4px 16px",
              height:"32px"
            }}
            onClick={() => setOpenAdvance(true)}
            endIcon={<FilterListIcon style={{ fill: "#2a5fa5" }} />}
          >
            Filter
          </Button>
          <Link to="/procurement/addrequesition">
              <Button
                variant="outlined"
                color="secondary"
                endIcon={<AddShoppingCartIcon />}
                style={{
                  backgroundColor: "#2a5fa5",
                  borderRadius: "4px",
                  color: "white",
                  boxShadow: "2px 2px 2px white",
                  border: "none",
                  fontSize: "12px",
                  padding: "5px 16px",
                }}
              >
                Request
              </Button>
            </Link>
            <IconButton
              variant="contained"
              color="secondary"
              style={{ borderRadius: "40px" }}
              onClick={() => {
                dispatch({
                  type: "GET_ALL_REQUEST",
                  payload: {
                    pg_no: "1",
                    edit_on_page_data: 5,
                    from_date: "",
                    to_date: "",
                    is_approved: "",
                    name: "",
                    is_pending: "",
                    is_partial_closed: "",
                    is_closed: "",
                    order_no: "",
                    is_automate:""
                  },
                });
                dispatch(getAllRequistion(notify));
                setCurrentPage(1);
                setValue("ALL");
                handleClearAdvance()
              }}
            >
              <ReplayIcon color="#FDBD2Eed" />
            </IconButton>
        </Stack>
      </Stack>
      <Box mt={2}></Box>
      <TableContainer component={Paper}   className={classes.accordion}>
        <Table
          sx={{ maxWidth: 230, overflowY: "scroll" }}
          aria-label="simple table"
        >
          <TableHead>
            <TableRow>
              <TableCell style={{ fontWeight: "bold" }} align="center">Order No</TableCell>
              <TableCell style={{ fontWeight: "bold" }} align="center">
                Date
              </TableCell>
              <TableCell style={{ fontWeight: "bold" }} align="center">
                Status
              </TableCell>
              <TableCell style={{ fontWeight: "bold" }} align="center">
                Download (PDF)
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {getRequisition.data?.map((tabledata) => (
              <TableRow
                key={tabledata.order_no}
                sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                style={{cursor:'pointer'}}
                onClick={()=> history.push({
                  pathname: "/procurement/addrequesition",
                  state: { original: tabledata },
                })}
              >
                <TableCell component="th" scope="tabledata" align="center">
                  {tabledata.order_no}
                </TableCell>
                <TableCell align="center">{tabledata.date}</TableCell>
                <TableCell align="center">
                  <Button
                    startIcon={
                      <FiberManualRecordIcon
                        fontSize="small"
                        style={{
                          fill:
                            tabledata.status === "PENDING"
                              ? "#dfb77c"
                              : tabledata.status === "APPROVED"
                              ? "#74a74b"
                              : tabledata.status === "PARTIAL CLOSED"
                              ? "#505050"
                              : "#b9401b",
                          transform: "scale(0.5)",
                        }}
                      />
                    }
                    style={{
                      color:
                        tabledata.status === "PENDING"
                          ? "#dfb77c"
                          : tabledata.status === "APPROVED"
                          ? "#74a74b"
                          : tabledata.status === "PARTIAL CLOSED"
                          ? "#505050"
                          : "#b9401b",
                      backgroundColor:
                        tabledata.status === "PENDING"
                          ? "rgba(223, 183, 124, 0.07)"
                          : tabledata.status === "APPROVED"
                          ? "rgba(116, 167, 75, 0.07)"
                          : tabledata.status === "PARTIAL CLOSED"
                          ? "rgba(80, 80, 80, 0.07)"
                          : "rgba(185, 64, 27, 0.07)",
                      fontSize: "12px",
                      borderRadius: "32px",
                      fontWeight: "bold",
                      padding: "4px 16px",
                    }}
                  >
                    {tabledata.status ==="PARTIAL CLOSED"?"PARTIALLY CLOSED":tabledata.status}
                  </Button>
                </TableCell>
                <TableCell align="center">
                  {(tabledata.status === "CLOSED" ||
                    tabledata.status === "PARTIAL CLOSED" ||
                    tabledata.status === "APPROVED") && (
                    <IconButton
                      className={classes.pdfDownload}
                      variant="contained"
                      color="white"
                      onClick={(e) => handleDownloadPDF(e, tabledata)}
                    >
                      <DownloadIcon style={{ fill: "#74a74b" }} />
                    </IconButton>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Grid
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          padding: 10,
          marginBottom: 20,
          backgroundColor:"white"
        }}
      >
        {matchesIphone ? (
          <IconButton
            onClick={prevStockPage}
            disabled={
              getRequisition.pg_no === 1 || getRequisition.pg_no === "1"
                ? true
                : false
            }
          >
            <PreviousIcon
              style={{
                fill:
                  getRequisition.pg_no === 1 || getRequisition.pg_no === "1"
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
              getRequisition.pg_no === 1 || getRequisition.pg_no === "1"
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
            style={{ width: "50px", padding: "3px" }}
            value={getRequisition.pg_no}
            onChange={(e) => {
              if (e.target.value > getRequisition.total_pages) {
                notify("Invalid value entered", {
                  variant: "warning",
                });
              } else {
                dispatch({
                  type: "GET_ALL_REQUEST",
                  payload: {
                    pg_no: e.target.value,
                  },
                });
              }
            }}
            onBlur={(e) => {
              if (
                e.target.value === "" ||
                e.target.value === "0" ||
                e.target.value > getRequisition.total_pages
              ) {
                notify("Invalid value entered", {
                  variant: "warning",
                });

                dispatch({
                  type: "GET_ALL_REQUEST",
                  payload: {
                    pg_no: 1,
                  },
                });
                dispatch(getAllRequistion(notify));
              } else {
                setCurrentPage(e.target.value);
                dispatch({
                  type: "GET_ALL_REQUEST",
                  payload: {
                    pg_no: e.target.value,
                  },
                });
                dispatch(getAllRequistion(notify));
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
            {getRequisition.total_pages}
          </Typography>
        </Grid>
        <TextField
          id="client-master-code"
          select
          value={getRequisition.edit_on_page_data}
          variant="outlined"
          inputProps={{ className: classes.input }}
          onChange={(e) => {
            setCurrentPage(1);
            dispatch({
              type: "GET_ALL_REQUEST",
              payload: {
                pg_no: 1,
                edit_on_page_data: e.target.value,
              },
            });
            dispatch(getAllRequistion(notify));
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
            disabled={getRequisition.next_page === "" ? true : false}
          >
            <NextIcon
              style={{
                fill: getRequisition.next_page === "" ? "gray" : "#243545",
              }}
            />
          </IconButton>
        ) : (
          <Button
            variant="contained"
            endIcon={<NextIcon />}
            color="secondary"
            onClick={nextStockPage}
            disabled={getRequisition.next_page === "" ? true : false}
          >
            Next
          </Button>
        )}
      </Grid>

      <Modal open={openAdvance} onClose={() => setOpenAdvance((prev) => !prev)}>
        <Box className={classes.modalPopUp}>
          <Grid className={classes.clearIcon}>
            {" "}
            <ClearIcon onClick={() => setOpenAdvance((prev) => !prev)} />
          </Grid>
          <RequestSearch
            handleClose={() => setOpenAdvance((prev) => !prev)}
            handlePage={() => setCurrentPage(1)}
          />
        </Box>
      </Modal>
    </>
  );
};

export default RequestAll;
