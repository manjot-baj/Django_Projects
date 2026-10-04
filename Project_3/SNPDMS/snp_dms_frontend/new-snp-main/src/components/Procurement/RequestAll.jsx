import React, { useEffect, useRef, useState } from "react";
import "./Table.css";
import {
  Button,
  Grid,
  IconButton,
  Typography,
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
  styled,
} from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { Stack } from "@mui/material";
import ReplayIcon from "@mui/icons-material/Replay";
import SearchIcon from "@mui/icons-material/Search";
import {
  downloadBillByPKAction,
  downloadPDF,
  getAllRequistion,
  getAllRequistionByBill,
} from "../../actions/Procurement/requestAction";
import { useSnackbar } from "notistack";
import { Link } from "react-router-dom";
import AddShoppingCartIcon from "@mui/icons-material/AddShoppingCart";
import RequestSearch from "./RequestSearch";
import ClearIcon from "@mui/icons-material/Clear";
import { useHistory } from "react-router-dom";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import DownloadIcon from "@mui/icons-material/Download";
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";
import FilterListIcon from "@mui/icons-material/FilterList";
import RefreshIcon from "@mui/icons-material/Refresh";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { REQ_REDUCER } from "../../reducers/procurement/requesitionReducer";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";

import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers";
import dayjs from "dayjs";
import {
  TableCustomPaginationReactTable,
  TableFootercontainer,
  TablePageTitle,
} from "../TableComponent/TableComponent";

const StyledTableDataCell = styled(TableCell)(({ theme }) => ({
  fontWeight: 600,
  color: theme.palette.secondary.main,
  fontSize: 12.5,
  borderBottom: "none",
  padding: "10px",
  borderColor: "transparent",
  textTransform: "uppercase",
  border: "1px solid rgba(0,0,0,0.05)",
}));

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  // Styles for header cells
  "&.MuiTableCell-head": {
    fontWeight: 600,
    backgroundColor: theme.palette.secondary.main,
    color: "white",
    fontSize: "12px",
    textTransform: "uppercase",
  },

  // Styles for all cells
  "&.MuiTableCell-root": {
    borderBottom: "none",
    borderColor: "transparent",
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  backgroundColor: "white",
  borderRadius: 20,
  transition: "box-shadow 0.2s ease-in-out",

  "&:hover": {
    boxShadow: "0px 3px 6px #9199A14D",
    // cursor: 'pointer', // uncomment if needed
  },
}));

const RequestAll = () => {
  const dispatch = useDispatch();
  const history = useHistory();
  const { user } = useSelector((state) => state);
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
  const [topBill, setTopBill] = useState(false);

  const handleClickAdvanceBill = (event) => {
    setAnchorElAdvanceBill(event.currentTarget);
  };

  const handleCloseAdvanceBill = () => {
    if (billData === null) {
      setIsBillSearch(false);
      setTopBill(false);
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
      setTopBill(true);
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
        is_automate: "",
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
          is_automate: "",
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
          pathname: "/procurement/requesition/add",
          state: { original: rowInfo.original },
        });
      },
      style: {
        cursor: "pointer",
      },
    };
  };

  useEffect(() => {
    if (user.procurement_admin === false) {
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
        : getAllRequistion.is_automate
        ? "is_automate"
        : "ALL"
    );
    dispatch(getAllRequistion(notify));

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleOnPageDataChange = (value) => {
    setCurrentPage(1);
    dispatch({
      type: "GET_ALL_REQUEST",
      payload: {
        edit_on_page_data: value,
      },
    });
    dispatch(getAllRequistion(notify));
  };

  const handleInitialPage = () => {
    setCurrentPage(1);
    dispatch({
      type: "GET_ALL_REQUEST",
      payload: {
        pg_no: 1,
      },
    });
    dispatch(getAllRequistion(notify));
  };

  const handlePaginationOnChange = (e, val) => {
    setCurrentPage(val);
    dispatch({
      type: "GET_ALL_REQUEST",
      payload: {
        pg_no: val,
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
          <Stack
            spacing={2}
            justifyContent={"flex-start"}
            direction={"row"}
            flexWrap={"wrap"}
          >
            {(billData !== null || isBillSearch || topBill) && (
              <Button
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
              </Button>
            )}
            <Popover
              id={idAdvanceBill}
              open={openAdvanceBill}
              anchorEl={anchorElAdvanceBill}
              onClose={handleCloseAdvanceBill}
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "left",
              }}
              sx={(theme) => ({
                marginTop: "24px",
                marginLeft: "-120px",
                borderRadius: "20px",
                [theme.breakpoints.down("sm")]: {
                  marginLeft: "2px",
                },
              })}
            >
              <Box
                sx={(theme) => ({
                  padding: "20px 20px 20px",
                  [theme.breakpoints.down("sm")]: {
                    padding: "10px",
                  },
                })}
              >
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
                    sx={{
                      borderColor: "#2a5fa5",

                      "& .MuiOutlinedInput-root": {
                        borderColor: "red",
                        borderRadius: "6px",

                        "& fieldset": {
                          borderColor: "red",
                        },
                      },
                      "& .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline":
                        {
                          padding: "0 !important",
                          border: "2px solid rgba(0,0,0,0.2)",
                          borderRadius: "6px",
                        },
                    }}
                    size="small"
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
                  <LocalizationProvider
                    dateAdapter={AdapterDayjs}
                    ref={fromDateRef}
                  >
                    <DatePicker
                      slotProps={{ textField: { size: "small" } }}
                      format="YYYY/MM/DD"
                      id={`-date-picker-inline`}
                      value={
                        getRequisition.from_received_date
                          ? dayjs(getRequisition.from_received_date)
                          : null
                      }
                      name="from_received_date"
                      defaultValue={
                        getRequisition.from_received_date
                          ? dayjs(getRequisition.from_received_date)
                          : null
                      }
                      onChange={(date) => {
                        handleDateChange(date, "from_received_date");
                      }}
                    />
                  </LocalizationProvider>

                  <Typography variant="caption">to</Typography>
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                      slotProps={{ textField: { size: "small" } }}
                      format="YYYY/MM/DD"
                      id={`-date-picker-inline`}
                      value={
                        getRequisition.to_received_date
                          ? dayjs(getRequisition.to_received_date)
                          : null
                      }
                      name="to_received_date"
                      onChange={(date) => {
                        handleDateChange(date, "to_received_date");
                      }}
                    />
                  </LocalizationProvider>
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
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                      slotProps={{ textField: { size: "small" } }}
                      format="YYYY/MM/DD"
                      id={`-date-picker-inline`}
                      value={
                        getRequisition.from_bill_date
                          ? dayjs(getRequisition.from_bill_date)
                          : null
                      }
                      name="from_bill_date"
                      helperText={``}
                      defaultValue={
                        getRequisition.from_bill_date
                          ? dayjs(getRequisition.from_bill_date)
                          : null
                      }
                      onChange={(date) => {
                        handleDateChange(date, "from_bill_date");
                      }}
                    />
                  </LocalizationProvider>
                  <Typography variant="caption">to</Typography>
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                      slotProps={{ textField: { size: "small" } }}
                      format="YYYY/MM/DD"
                      id={`-date-picker-inline`}
                      value={
                        getRequisition.to_bill_date
                          ? dayjs(getRequisition.to_bill_date)
                          : null
                      }
                      name="to_bill_date"
                      helperText={``}
                      defaultValue={
                        getRequisition.to_bill_date
                          ? dayjs(getRequisition.to_bill_date)
                          : null
                      }
                      onChange={(date) => {
                        handleDateChange(date, "to_bill_date");
                      }}
                    />
                  </LocalizationProvider>
                </Stack>
              </Box>
            </Popover>
          </Stack>
        </Stack>
      </Box>
      {(billData !== null || isBillSearch) && (
        <Accordion
          style={{
            marginBottom: 20,
            borderRadius: 5,
            boxShadow: 3,
            marginTop: "16px",
          }}
          expanded={billData !== null && isBillSearch}
          onChange={() => setIsBillSearch(!isBillSearch)}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel1a-content"
            id="panel1a-header"
          >
            <Typography
              sx={(theme) => ({
                fontSize: "12px",
                fontWeight: "bold",
                [theme.breakpoints.down("md")]: {
                  marginBottom: "24px",
                },
              })}
            >
              Bill Details
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <TableContainer component={Paper}>
              <Table
                sx={{ maxWidth: "100%", overflowY: "scroll" }}
                aria-label="simple table"
              >
                <TableHead>
                  <TableRow>
                    <TableCell style={{ fontWeight: "bold" }}>
                      Order No
                    </TableCell>
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
                        {row?.bill_uploaded && (
                          <IconButton onClick={() => handleDownloadBill(row)}>
                            <PictureAsPdfIcon style={{ fill: "#e62c31" }} />
                          </IconButton>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </AccordionDetails>
        </Accordion>
      )}
      <Stack
        direction={"row"}
        justifyContent={"space-between"}
        alignItems={"center"}
        flexWrap={"wrap"}
      >
        <TablePageTitle>Requesition Details</TablePageTitle>
        <Stack
          direction={"row"}
          justifyContent={"flex-end"}
          spacing={2}
          alignItems={"center"}
          flexWrap={"wrap"}
          marginTop={matchesIphone ? "24px" : "0"}
        >
          {billData === null && !isBillSearch && (
            <Button
              endIcon={<SearchIcon />}
              variant="text"
              color="primary"
              style={{
                fontSize: "12px",
                padding: "4px 16px",
              }}
              onClick={handleClickAdvanceBill}
            >
              Bill Search
            </Button>
          )}
          <FormControl>
            <Select
              labelId="demo-simple-select-label"
              id="demo-simple-select"
              value={value}
              inputProps={{ "aria-label": "Without label" }}
              onChange={handleChangeStatus}
              sx={(theme)=>({
                height: "32px",
                padding: "8px 16px",
                "& .MuiOutlinedInput-notchedOutline": {
                  border: "none !important",
                },
                "& .MuiSelect-select": {
                  backgroundColor: "transparent !important",
                  color: theme.palette.primary.main,
                  fontSize: "12px",
                },
                "& .MuiSvgIcon-root ": {
                  fill: `${theme.palette.primary.main} !important`,
                },
              })}
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
            onClick={() => setOpenAdvance(true)}
            endIcon={<FilterListIcon  />}
          >
            Filter
          </Button>

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
                  is_automate: "",
                },
              });
              dispatch(getAllRequistion(notify));
              setCurrentPage(1);
              setValue("ALL");
              handleClearAdvance();
            }}
          >
            <ReplayIcon color="#FDBD2Eed" />
          </IconButton>
        </Stack>
      </Stack>
      <Box mt={2}></Box>
      <TableContainer component={Paper}>
        <Table
          sx={{ maxWidth: "100%", overflowY: "scroll" }}
          aria-label="simple table"
        >
          <TableHead>
            <StyledTableRow>
              <StyledTableCell style={{ fontWeight: "bold" }} align="center">
                Order No
              </StyledTableCell>
              <StyledTableCell style={{ fontWeight: "bold" }} align="center">
                Date
              </StyledTableCell>
              <StyledTableCell style={{ fontWeight: "bold" }} align="center">
                Status
              </StyledTableCell>
              <StyledTableCell style={{ fontWeight: "bold" }} align="center">
                Download (PDF)
              </StyledTableCell>
            </StyledTableRow>
          </TableHead>
          <TableBody>
            {getRequisition.data?.map((tabledata) => (
              <StyledTableRow
                key={tabledata.order_no}
                sx={{ border: "none" }}
                style={{ cursor: "pointer" }}
                onClick={() =>
                  history.push({
                    pathname: "/procurement/requesition/add",
                    state: { original: tabledata },
                  })
                }
              >
                <StyledTableDataCell
                  component="th"
                  scope="tabledata"
                  align="center"
                >
                  {tabledata.order_no}
                </StyledTableDataCell>
                <StyledTableDataCell align="center">
                  {tabledata.date}
                </StyledTableDataCell>
                <StyledTableDataCell align="center">
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
                    {tabledata.status === "PARTIAL CLOSED"
                      ? "PARTIALLY CLOSED"
                      : tabledata.status}
                  </Button>
                </StyledTableDataCell>
                <StyledTableDataCell align="center">
                  {(tabledata.status === "CLOSED" ||
                    tabledata.status === "PARTIAL CLOSED" ||
                    tabledata.status === "APPROVED") && (
                    <IconButton
                      sx={{
                        backgroundColor: "transparent",
                        color: "black",
                      }}
                      variant="contained"
                      color="white"
                      onClick={(e) => handleDownloadPDF(e, tabledata)}
                    >
                      <DownloadIcon style={{ fill: "#74a74b" }} />
                    </IconButton>
                  )}
                </StyledTableDataCell>
              </StyledTableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TableCustomPaginationReactTable
        total_pages={getRequisition.total_pages}
        pg_no={getRequisition.pg_no}
        handlePaginationOnChange={handlePaginationOnChange}
        next_page={getRequisition.next_page}
        on_page_data={getRequisition.edit_on_page_data}
        setCurrentPage={setCurrentPage}
        handleInitialPage={handleInitialPage}
        handleOnPageDataChange={handleOnPageDataChange}
      />
      <Box mt={12}/>
      <TableFootercontainer>
        <Link to="/procurement/requesition/add">
          <Button
            variant="contained"
            color="primary"
            endIcon={<AddShoppingCartIcon />}
          >
            Request
          </Button>
        </Link>
      </TableFootercontainer>

      <Modal open={openAdvance} onClose={() => setOpenAdvance((prev) => !prev)}>
        <Box
          sx={(theme) => ({
            top: "20%",
            position: "absolute",
            background: "#FFF",
            width: "85%",
            height: "60%",
            margin: "auto",
            left: "10%",
            padding: "15px 25px",
            pointerEvents: "painted",
            [theme.breakpoints.down("sm")]: {
              overflowY: "scroll",
              width: "85%",
              padding: "20px",
              height: "70%",
            },
          })}
        >
          <Grid
            sx={{
              float: "right",
              cursor: "pointer",
            }}
          >
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
