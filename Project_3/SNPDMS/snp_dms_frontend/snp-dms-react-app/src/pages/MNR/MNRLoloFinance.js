import React, { useCallback, useEffect, useRef, useState } from "react";
import LayoutContainer from "../../components/reusableComponents/LayoutContainer";
import {
  Button,
  Typography,
  Grid,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  makeStyles,
  Radio,
  IconButton,
  TextField,
  Popover,
  Divider,
  withStyles,
  Switch,
  useMediaQuery,
  Tooltip,
  Checkbox,
} from "@material-ui/core";
import { useSnackbar } from "notistack";
import AddIcon from "@mui/icons-material/Add";
import LOLOFinanceModal from "../../components/advanceFinance/LOLOFinanceModal";
import AutomationSearch from "../../components/reusableComponents/AutomationSearch";
import { Pagination, Stack } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { ADVANCE_FINANCE_CONSTANT } from "../../reducers/AdvanceFinance/AdvanceFinanceReducer";
import ReplayIcon from "@mui/icons-material/Replay";
import LOLOFinanceUpdateModal from "../../components/advanceFinance/LOLOFinanceUpdateModal";
import { dropDownDispatch } from "../../actions/GateInActions";
import {
  deleteAdvancePaymentAction,
  getAdvanceFinanceTableAction,
  getPreGateOutPkBalanceAdjustmentINAction,
  getSingleAdvanceFinanceAction,
} from "../../actions/AdvanceFinance/AdvanceFinanceAction";
import TuneIcon from "@mui/icons-material/Tune";
import DateFnsUtils from "@date-io/date-fns";
import {
  KeyboardDatePicker,
  MuiPickersUtilsProvider,
} from "@material-ui/pickers";
import SearchIcon from "@mui/icons-material/Search";
import RefreshIcon from "@mui/icons-material/Refresh";
import { handleDateChangeUTILSDispatch } from "../../utils/WeekNumbre";
import { Link } from "react-router-dom";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DriveFolderUploadOutlinedIcon from "@mui/icons-material/DriveFolderUploadOutlined";
import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import AddCircleOutlineOutlinedIcon from "@mui/icons-material/AddCircleOutlineOutlined";
import DeleteForeverOutlinedIcon from "@mui/icons-material/DeleteForeverOutlined";

const TABLE_CONST = [
  "check",
  "bk_no",
  "client",
  "entry_type",
  "quantity",
  "remaining",
  "original_amount",
  "remaining_amount",
  "balance_amount",
  "balance_adjusted",
  "payment_type",
  "payment_details",
  "is_adjusted",
  "created_at",
  "updated_at",
  "action",
];

const useStyles = makeStyles((theme) => ({
  tableContainer: {
    marginTop: "32px",
    padding: "4px",
    paddingTop: "0px",
    borderRadius: "4px",
    "&::-webkit-scrollbar": {
      height: "8px",
    },
    [theme.breakpoints.down("sm")]: {
      minWidth: 250,
      width: "250px",
      overflowX: "scroll",
    },
  },
  table: {
    borderCollapse: "separate",
    borderSpacing: "0px 10px",
    borderColor: "transparent",
    backgroundColor: "transparent",
    [theme.breakpoints.down("sm")]: {
      minWidth: "auto",
      overflow: "hidden",
    },
  },
  tableContainer: {
    overflowX: "scroll",
    "&::-webkit-scrollbar": {
      height: "5px",
    },
    [theme.breakpoints.down("sm")]: {
      maxWidth: "95vw",
      overflowX: "scroll",
      marginBottom: "24px",
    },
  },
  inputProcess: {
    marginLeft: theme.spacing(1),
    flex: 1,
    width: "32px",
    fontSize: "0.8rem",
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

  textField: {
    "& .MuiOutlinedInput-root": {
      "& fieldset": {
        borderColor: "#243545",
      },
    },
  },
  bulkUploadButton: {
    backgroundColor: "#2ac08f",
    color: "#fff",
    padding: "10px 20px",
    borderRadius: 5,
    fontWeight: 600,
    fontSize: "12px",
  },
  input: {
    padding: 7,
  },
  advanceSearch: {
    backgroundColor: "rgb(254,93,54)",
    borderRadius: "8px",
  },
  searchBox: {
    padding: "20px 20px 20px",
    width: "620px",
    [theme.breakpoints.down("sm")]: {
      width: "320px",
    },
  },
}));

const StyledTableCell = withStyles(() => ({
  head: {
    fontWeight: 600,
    color: "white",
    fontSize: "12px",
    textTransform: "uppercase",
    whiteSpace: "nowrap",
    backgroundColor: "#172b4d",
  },
  root: {
    borderBottom: "none",
    borderColor: "transparent",
  },
}))(TableCell);

const StyledTableRow = withStyles(() => ({
  root: {
    backgroundColor: "white",
    borderRadius: 20,
    "&:hover": {
      boxShadow: "0px 3px 6px #9199A14D",
      // cursor: "pointer",
    },
  },
}))(TableRow);

const StyledTableDataCell = withStyles(() => ({
  root: {
    fontWeight: 600,
    color: "#172b4d",
    fontSize: 12.5,
    paddingLeft: "20px",
    borderBottom: "none",
    borderColor: "transparent",
    textTransform: "uppercase",
  },
}))(TableCell);

const MNRLoloFinance = () => {
  const notify = useSnackbar().enqueueSnackbar;
  const classes = useStyles();
  const dispatch = useDispatch();
  const [open, setOpen] = React.useState(false);
  const [selectedPayment, setSelectedPayment] = React.useState([]);
  const [openUpdate, setOpenUpdate] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [process, setProcess] = useState("client");
  const [loading, setLoading] = useState(false);
  const { AdvanceFinanceReducer, user } = useSelector((state) => state);
  const { financeTable } = AdvanceFinanceReducer;
  const [currentPage, setCurrentPage] = useState(1);
  const [disable, setDisable] = useState(1);
  const [anchorElAdvance, setAnchorElAdvance] = React.useState(null);
  const matchesIphone = useMediaQuery("(max-width:500px)");

  const openAdvance = Boolean(anchorElAdvance);
  const idAdvance = openAdvance ? "simple-popover-Advance" : undefined;
  const fromDateRef = useRef();

  useEffect(() => {
    let reqArray = ["lf_advance_payment_client_list", "lf_pregatein_list"];
    dispatch(dropDownDispatch(reqArray, notify));
    dispatch(getAdvanceFinanceTableAction(notify));
  }, []);

  const handleSubmitLoloFinance = () => {};

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const handleOpenUpdate = () => setOpenUpdate(true);
  const handleClickAdvance = (event) => {
    setAnchorElAdvance(event.currentTarget);
  };

  const handleCloseAdvance = () => {
    setAnchorElAdvance(null);
  };

  const handleOpenPaymentUpdate = (pk) => {
    dispatch(getSingleAdvanceFinanceAction(pk, setOpenUpdate, notify));
  };
  const handleCloseUpdate = () => {
    dispatch({ type: ADVANCE_FINANCE_CONSTANT.GET_ADVANCE_UPDATE_INIT });
    setOpenUpdate(false);
  };

  const handleSetProcess = (event) => {
    setSearchText("");
    setProcess(event.target.value);
  };
  const handleSearchChange = useCallback(
    (e) => {
      setSearchText(e.target.value);
    },
    [searchText]
  );
  const handleCloseClick = useCallback(() => setSearchText(""), [searchText]);
  const handleSearchButton = useCallback(() => {
    dispatch({
      type: ADVANCE_FINANCE_CONSTANT.GET_ADVANCE_TABLE,
      payload:
        process === "client"
          ? { client: searchText }
          : process === "bl_no"
          ? { bl_no: searchText }
          : {
              bk_no: searchText,
            },
    });
    dispatch(getAdvanceFinanceTableAction(notify));
  }, [searchText, loading, notify, process]);

  const handleRefreshTable = () => {
    dispatch({
      type: ADVANCE_FINANCE_CONSTANT.GET_ADVANCE_TABLE_INIT,
    });
    dispatch(getAdvanceFinanceTableAction(notify));
  };

  const handleAdvanceSearch = () => {
    dispatch(getAdvanceFinanceTableAction(notify));
    handleCloseAdvance();
  };

  const handleClearAdvance = () => {
    dispatch({ type: ADVANCE_FINANCE_CONSTANT.GET_ADVANCE_TABLE_INIT });

    dispatch(getAdvanceFinanceTableAction(notify));
    // handleCloseAdvance()
  };

  const handleAdjustBalance = (pk) => {
    if (user.role === "Admin" || user.role === "Location Admin") {
      dispatch(getPreGateOutPkBalanceAdjustmentINAction(pk, notify));
    } else {
      notify("You are not authorized to adjust balance.");
    }
  };

  const handleAllCheck = () => {
    if (
      financeTable.data?.every((val) => {
        return selectedPayment.includes(val.pk);
      })
    ) {
      financeTable.data.forEach((val) => {
        setSelectedPayment((prev) => prev.filter((row) => row !== val.pk));
      });
    } else {
      const rows = financeTable.data;
      setSelectedPayment(rows.map((row) => row.pk));
    }
  };

  const handleRowClick = (pk_selected) => {
    setSelectedPayment((prev) => {
      if (prev.includes(pk_selected)) {
        return prev.filter((row) => row !== pk_selected);
      } else {
        return [...prev, pk_selected];
      }
    });
  };

  return (
    <LayoutContainer footer={false}>
      <Grid container spacing={5} style={{ padding: "16px" }}>
        <Grid item sm={12} md={9}>
          {" "}
          <Typography variant="h6">Advance LOLO Payment</Typography>
        </Grid>
        <Grid item sm={12} md={3} style={{ width: "100%" }}>
          {(user.lolo_finance === true || user.lolo_finance === "True") && (
            <Button
              endIcon={<AddIcon />}
              variant="contained"
              color="primary"
              fullWidth={!matchesIphone}
              style={{ margin: "auto", display: "flex", marginRight: "0" }}
              onClick={handleOpenUpdate}
            >
              Add Advance Payment
            </Button>
          )}
        </Grid>
        <Grid item xs={8} sm={8} md={6}>
          <AutomationSearch
            searchText={searchText}
            process={
              process === "client" ? "customer" : process.split("_").join(" ")
            }
            handleSearchChange={handleSearchChange}
            handleSearchButton={handleSearchButton}
            handleCloseClick={handleCloseClick}
            loading={loading}
            setLoading={setLoading}
            procurement
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
                value={""}
                labelId="container_list_select_label"
                name="client"
                defaultValue={""}
                label="Process"
                variant="standard"
                onChange={handleSetProcess}
                className={classes.inputProcess}
                inputProps={{
                  style: {
                    padding: "0px 10px",
                    marginTop: "-10px",
                    outline: "none",
                    fontSize: "12px",
                  },
                }}
              >
                <MenuItem key={"client"} value="client">
                  Customer
                </MenuItem>
                <MenuItem key={"bl_no"} value="bl_no">
                  BL no
                </MenuItem>
                <MenuItem key={"bk_no"} value="bk_no">
                  BK no
                </MenuItem>
              </Select>
            </FormControl>
          </AutomationSearch>
        </Grid>
        <Grid item xs={4} sm={4} md={1} alignContent="center">
          <IconButton
            variant="contained"
            color="primary"
            className={classes.advanceSearch}
            onClick={handleClickAdvance}
          >
            <TuneIcon style={{ fill: "white" }} />
          </IconButton>
          <Popover
            id={idAdvance}
            open={openAdvance}
            anchorEl={anchorElAdvance}
            onClose={handleCloseAdvance}
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
                  Advance Search
                </Typography>
                <Stack
                  direction={"row"}
                  alignItems={"center"}
                  justifyContent={"space-between"}
                >
                  <IconButton
                    variant="contained"
                    color="black"
                    onClick={handleAdvanceSearch}
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
                Select Payment Type
              </Typography>
              <Stack direction={"row"} alignItems={"center"} flexWrap={"wrap"}>
                <Stack direction={"row"} alignItems={"center"}>
                  <Typography variant="caption">UPI</Typography>
                  <Radio
                    checked={financeTable.payment_type === "UPI"}
                    onClick={() =>
                      dispatch({
                        type: ADVANCE_FINANCE_CONSTANT.GET_ADVANCE_TABLE,
                        payload: { payment_type: "UPI" },
                      })
                    }
                    style={{
                      color:
                        financeTable.payment_type === "UPI"
                          ? "rgba(0,0,0,0.7)"
                          : "rgba(0,0,0,0.4)",
                    }}
                  />
                </Stack>
                <Stack direction={"row"} alignItems={"center"}>
                  <Typography variant="caption">Cash</Typography>
                  <Radio
                    checked={financeTable.payment_type === "Cash"}
                    onClick={() =>
                      dispatch({
                        type: ADVANCE_FINANCE_CONSTANT.GET_ADVANCE_TABLE,
                        payload: { payment_type: "Cash" },
                      })
                    }
                    style={{
                      color:
                        financeTable.payment_type === "Cash"
                          ? "rgba(0,0,0,0.7)"
                          : "rgba(0,0,0,0.4)",
                    }}
                  />
                </Stack>

                <Stack direction={"row"} alignItems={"center"}>
                  <Typography variant="caption">Cheque</Typography>
                  <Radio
                    checked={financeTable.payment_type === "Cheque"}
                    onClick={() =>
                      dispatch({
                        type: ADVANCE_FINANCE_CONSTANT.GET_ADVANCE_TABLE,
                        payload: { payment_type: "Cheque" },
                      })
                    }
                    style={{
                      color:
                        financeTable.payment_type === "Cheque"
                          ? "rgba(0,0,0,0.7)"
                          : "rgba(0,0,0,0.4)",
                    }}
                  />
                </Stack>

                <Stack direction={"row"} alignItems={"center"}>
                  <Typography variant="caption">NEFT</Typography>
                  <Radio
                    checked={financeTable.payment_type === "NEFT"}
                    onClick={() =>
                      dispatch({
                        type: ADVANCE_FINANCE_CONSTANT.GET_ADVANCE_TABLE,
                        payload: { payment_type: "NEFT" },
                      })
                    }
                    style={{
                      color:
                        financeTable.payment_type === "NEFT"
                          ? "rgba(0,0,0,0.7)"
                          : "rgba(0,0,0,0.4)",
                    }}
                  />
                </Stack>

                <Stack direction={"row"} alignItems={"center"}>
                  <Typography variant="caption">RTGS</Typography>
                  <Radio
                    checked={financeTable.payment_type === "RTGS"}
                    onClick={() =>
                      dispatch({
                        type: ADVANCE_FINANCE_CONSTANT.GET_ADVANCE_TABLE,
                        payload: { payment_type: "RTGS" },
                      })
                    }
                    style={{
                      color:
                        financeTable.payment_type === "RTGS"
                          ? "rgba(0,0,0,0.7)"
                          : "rgba(0,0,0,0.4)",
                    }}
                  />
                </Stack>
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
                Date
              </Typography>

              <Stack
                direction={"row"}
                spacing={matchesIphone ? 0 : 2}
                flexDirection={matchesIphone ? "column" : "row"}
              >
                <Typography variant="caption">from </Typography>
                <MuiPickersUtilsProvider ref={fromDateRef} utils={DateFnsUtils}>
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
                      financeTable.from_date ? financeTable.from_date : null
                    }
                    error={false}
                    defaultValue={""}
                    emptyLabel=""
                    name="from_date"
                    helperText={``}
                    onChange={(date) => {
                      handleDateChangeUTILSDispatch(
                        date,
                        dispatch,
                        ADVANCE_FINANCE_CONSTANT.GET_ADVANCE_TABLE,
                        "from_date"
                      );
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
                    value={financeTable.to_date ? financeTable.to_date : null}
                    error={false}
                    emptyLabel=""
                    name="to_date"
                    helperText={``}
                    onChange={(date) => {
                      handleDateChangeUTILSDispatch(
                        date,
                        dispatch,
                        ADVANCE_FINANCE_CONSTANT.GET_ADVANCE_TABLE,
                        "to_date"
                      );
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
        </Grid>
        <Grid item sm={5}></Grid>
        <Grid
          item
          md={4}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-start",
          }}
        >
          <Typography variant={"subtitle2"}>
            {financeTable.entry_type}
          </Typography>
          <Box mr={1}></Box>
          <Switch
            size={"small"}
            color="primary"
            checked={financeTable.entry_type === "IN"}
            onChange={(e) => {
              if (e.target.checked) {
                dispatch({
                  type: ADVANCE_FINANCE_CONSTANT.GET_ADVANCE_TABLE,
                  payload: {
                    entry_type: "IN",
                    pg_no: 1,
                  },
                });
                dispatch(getAdvanceFinanceTableAction(notify));
              } else {
                dispatch({
                  type: ADVANCE_FINANCE_CONSTANT.GET_ADVANCE_TABLE,
                  payload: {
                    entry_type: "OUT",
                    pg_no: 1,
                  },
                });
                dispatch(getAdvanceFinanceTableAction(notify));
              }
            }}
          />
          <Box mr={4}></Box>
          <Typography variant={"subtitle2"}>Balance Adjusted</Typography>
          <Box mr={1}></Box>
          <Switch
            size={"small"}
            color="primary"
            checked={financeTable.is_balance_pymt_adjusted === true}
            onChange={(e) => {
              if (e.target.checked) {
                dispatch({
                  type: ADVANCE_FINANCE_CONSTANT.GET_ADVANCE_TABLE,
                  payload: {
                    is_balance_pymt_adjusted: true,
                    pg_no: 1,
                  },
                });
                dispatch(getAdvanceFinanceTableAction(notify));
              } else {
                dispatch({
                  type: ADVANCE_FINANCE_CONSTANT.GET_ADVANCE_TABLE,
                  payload: {
                    is_balance_pymt_adjusted: false,
                    pg_no: 1,
                  },
                });
                dispatch(getAdvanceFinanceTableAction(notify));
              }
            }}
          />
        </Grid>

        <Grid item sm={7}></Grid>
        <Grid
          item
          sm={1}
          style={{ display: "flex", justifyContent: "flex-end", width: "100%" }}
        >
          {selectedPayment.length > 0 && (
            <IconButton
              onClick={() =>
                dispatch(
                  deleteAdvancePaymentAction(
                    selectedPayment,
                    notify,
                    setSelectedPayment
                  )
                )
              }
            >
              <DeleteForeverOutlinedIcon
                fontSize="large"
                style={{ fill: "red" }}
              />
            </IconButton>
          )}
          <IconButton onClick={handleRefreshTable}>
            <ReplayIcon style={{ fill: "black" }} />
          </IconButton>
        </Grid>
        <Grid item sm={12} style={{ marginTop: "-24px" }}>
          <TableContainer
            style={{ minHeight: 325 }}
            className={classes.tableContainer}
          >
            <Table
              stickyHeader
              className={classes.table}
              aria-label="simple table"
            >
              <TableHead>
                <TableRow>
                  {TABLE_CONST.map((val) =>
                    val === "check" ? (
                      <StyledTableCell
                        style={{ backgroundColor: "rgb(23,43,77)" }}
                      >
                        <Checkbox
                          checked={financeTable.data?.every((val) => {
                            return selectedPayment.includes(val.pk);
                          })}
                          onClick={handleAllCheck}
                          style={{ color: "white" }}
                          inputProps={{ "aria-label": "Checkbox A" }}
                          aria-sort="none"
                        />
                      </StyledTableCell>
                    ) : (
                      <StyledTableCell
                        style={{ backgroundColor: "rgb(23,43,77)" }}
                      >
                        <Typography
                          variant="subtitle2"
                          style={{
                            fontWeight: "600",
                            fontSize: "10px",
                            color: "white",
                            textAlign: "center",
                          }}
                        >
                          {val === "bk_no"
                            ? financeTable.entry_type === "IN"
                              ? "Bl No"
                              : "Bk No"
                            : val === "client"
                            ? "customer"
                            : val.split("_").join(" ").toUpperCase()}
                        </Typography>
                      </StyledTableCell>
                    )
                  )}
                </TableRow>
              </TableHead>
              <TableBody style={{ maxHeight: "100px" }}>
                {financeTable.data?.map((row) => (
                  <StyledTableRow
                    key={row.name}
                    sx={{
                      "&:last-child td, &:last-child th": {
                        border: 0,
                      },
                    }}
                  >
                    {TABLE_CONST?.map((val) =>
                      val === "bk_no" ? (
                        <StyledTableDataCell
                          component="th"
                          scope="row"
                          style={{
                            textAlign: "center",
                            minWidth: "20px",
                            color: "#292b4d",
                          }}
                        >
                          {row["bk_no"] === null ? row["bl_no"] : row["bk_no"]}
                        </StyledTableDataCell>
                      ) : val === "check" ? (
                        <StyledTableDataCell
                          component="th"
                          scope="row"
                          style={{
                            fontWeight: "bold",
                            textAlign: "center",
                            minWidth: "40px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "flex-start",
                          }}
                        >
                          <Checkbox
                            checked={selectedPayment.some(
                              (payment) => row["pk"] === payment
                            )}
                            onChange={() => handleRowClick(row["pk"])}
                            style={{ color: "rgb(60,62,93)" }}
                            inputProps={{ "aria-label": "Checkbox A" }}
                            aria-sort="none"
                          />
                        </StyledTableDataCell>
                      ) : val === "action" ? (
                        <StyledTableDataCell
                          component="th"
                          scope="row"
                          style={{
                            fontWeight: "bold",
                            textAlign: "center",
                            minWidth: "200px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "flex-start",
                          }}
                        >
                          <Tooltip
                            title={
                              AdvanceFinanceReducer.financeTable.entry_type ===
                              "IN"
                                ? "Pre Gate IN"
                                : "Pre Gate OUT"
                            }
                          >
                            <Link
                              to={`/lolo-payment/advance-payment-process/?id=${
                                row["pk"]
                              }&type=${
                                AdvanceFinanceReducer.financeTable.entry_type
                              }&billing_no=${row["bl_no"]}&booking_no=${
                                row["bk_no"] ?? ""
                              }`}
                              onClick={(e) => e.stopPropagation()}
                            >
                              <IconButton>
                                <AddCircleOutlineOutlinedIcon
                                  style={{ fill: "rgb(61,162,138)" }}
                                />
                              </IconButton>
                            </Link>
                          </Tooltip>

                          {AdvanceFinanceReducer.financeTable.entry_type ===
                            "IN" && (
                            <Tooltip title="Bulk upload Pre Gate IN">
                              <Link
                                to={`/lolo-payment/advance-finance-bulk-upload/${row["pk"]}`}
                                onClick={(e) => e.stopPropagation()}
                              >
                                <IconButton>
                                  <DriveFolderUploadOutlinedIcon
                                    style={{ fill: "black" }}
                                  />
                                </IconButton>
                              </Link>
                            </Tooltip>
                          )}
                          {row["is_adjusted"] === true &&
                            row["balance_amount"] > 0 &&
                            row["is_balance_pymt_adjusted"] === false && (
                              <Tooltip title="Adjust Balance">
                                <IconButton
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleAdjustBalance(row["pk"]);
                                  }}
                                >
                                  <AccountBalanceWalletOutlinedIcon
                                    style={{ fill: "rgb(222,79,79)" }}
                                  />
                                </IconButton>
                              </Tooltip>
                            )}
                          <Tooltip title="Edit Advance Payment ">
                            <IconButton
                              onClick={() => handleOpenPaymentUpdate(row.pk)}
                            >
                              <EditOutlinedIcon style={{ fill: "black" }} />
                            </IconButton>
                          </Tooltip>
                        </StyledTableDataCell>
                      ) : val === "date" ? (
                        <StyledTableDataCell
                          component="th"
                          scope="row"
                          width={"70%"}
                          style={{
                            fontWeight: "bold",
                            textAlign: "center",
                            minWidth: "100px",
                          }}
                        >
                          <Typography
                            variant="subtitle2"
                            style={{
                              fontSize: "12px",
                            }}
                          >
                            {row["date"]}
                          </Typography>
                        </StyledTableDataCell>
                      ) : val === "created_at" ? (
                        <StyledTableDataCell
                          component="th"
                          scope="row"
                          width={"70%"}
                          style={{
                            fontWeight: "bold",
                            textAlign: "center",
                            minWidth: "100px",
                          }}
                        >
                          <Typography
                            variant="subtitle2"
                            style={{
                              fontSize: "12px",
                            }}
                          >
                            {row["created_at"]}
                          </Typography>
                        </StyledTableDataCell>
                      ) : val === "updated_at" ? (
                        <StyledTableDataCell
                          component="th"
                          scope="row"
                          width={"70%"}
                          style={{
                            fontWeight: "bold",
                            textAlign: "center",
                            minWidth: "100px",
                          }}
                        >
                          <Typography
                            variant="subtitle2"
                            style={{
                              fontSize: "12px",
                            }}
                          >
                            {row["updated_at"]}
                          </Typography>
                        </StyledTableDataCell>
                      ) : val === "balance_amount" ? (
                        <StyledTableDataCell
                          component="th"
                          scope="row"
                          style={{
                            fontWeight: "bold",
                            textAlign: "center",
                            minWidth: "24px",
                          }}
                        >
                          <Typography
                            variant="subtitle2"
                            style={{
                              fontSize: "12px",
                              borderRadius: "8px",
                              padding: "8px 4px",
                              color: "rgb(220,67,67)",
                            }}
                          >
                            {row["balance_amount"]}
                          </Typography>
                        </StyledTableDataCell>
                      ) : val === "balance_adjusted" ? (
                        <StyledTableDataCell
                          component="th"
                          scope="row"
                          style={{
                            fontWeight: "bold",
                            textAlign: "center",
                            minWidth: "24px",
                          }}
                        >
                          <Typography
                            variant="subtitle2"
                            style={{
                              fontSize: "12px",
                              borderRadius: "8px",
                              padding: "8px 4px",
                            }}
                          >
                            {row["is_balance_pymt_adjusted"] ? "Yes" : "No"}
                          </Typography>
                        </StyledTableDataCell>
                      ) : val === "balance_adjustment" ? (
                        <StyledTableDataCell
                          component="th"
                          scope="row"
                          style={{
                            fontWeight: "bold",
                            textAlign: "center",
                            minWidth: "200px",
                          }}
                        >
                          {row["is_adjusted"] === true &&
                            row["balance_amount"] > 0 &&
                            row["is_balance_pymt_adjusted"] === false && (
                              <Button
                                variant="contained"
                                color="primary"
                                style={{
                                  backgroundColor: "rgb(241,98,99)",
                                  boxShadow: "none",
                                }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleAdjustBalance(row["pk"]);
                                }}
                              >
                                Adjust Balance
                              </Button>
                            )}
                        </StyledTableDataCell>
                      ) : val === "payment_type" ? (
                        <StyledTableDataCell
                          component="th"
                          scope="row"
                          style={{
                            fontWeight: "bold",
                            textAlign: "center",
                            minWidth: "24px",
                          }}
                        >
                          <Typography
                            variant="subtitle2"
                            style={{
                              fontSize: "12px",
                              backgroundColor: "#2a5fa5",
                              borderRadius: "4px",
                              padding: "8px 4px",
                              color: "white",
                            }}
                          >
                            {row["payment_type"]}
                          </Typography>
                        </StyledTableDataCell>
                      ) : val === "is_adjusted" ? (
                        <StyledTableDataCell
                          component="th"
                          scope="row"
                          style={{
                            fontWeight: "bold",
                            textAlign: "center",
                            fontSize: "12px",
                            minWidth: "24px",
                          }}
                        >
                          {row[val] ? "Yes" : "No"}
                        </StyledTableDataCell>
                      ) : val === "preGate" ? (
                        <StyledTableDataCell
                          component="th"
                          scope="row"
                          width={"70%"}
                          style={{
                            fontWeight: "bold",
                            textAlign: "center",
                            minWidth: "200px",
                          }}
                        >
                          {" "}
                          <Link
                            to={`/lolo-payment/advance-payment-process/?id=${
                              row["pk"]
                            }&type=${
                              AdvanceFinanceReducer.financeTable.entry_type
                            }&billing_no=${row["bl_no"]}&booking_no=${
                              row["bk_no"] ?? ""
                            }`}
                            onClick={(e) => e.stopPropagation()}
                            className={classes.bulkUploadButton}
                          >
                            {AdvanceFinanceReducer.financeTable.entry_type ===
                            "IN"
                              ? "Pre Gate In"
                              : "Pre Gate Out"}
                          </Link>
                        </StyledTableDataCell>
                      ) : val === "bulk_upload" ? (
                        <StyledTableDataCell
                          component="th"
                          scope="row"
                          width={"70%"}
                          style={{
                            fontWeight: "bold",
                            textAlign: "center",
                            minWidth: "200px",
                          }}
                        >
                          {" "}
                          <Link
                            to={`/lolo-payment/advance-finance-bulk-upload/${row["pk"]}`}
                            onClick={(e) => e.stopPropagation()}
                            className={classes.bulkUploadButton}
                          >
                            Bulk Upload
                          </Link>
                        </StyledTableDataCell>
                      ) : val === "payment_details" ? (
                        <StyledTableDataCell
                          component="th"
                          scope="row"
                          width={"70%"}
                          style={{
                            fontWeight: "bold",
                            textAlign: "center",
                            minWidth: "200px",
                          }}
                        >
                          {row["payment_type"] === "UPI" ? (
                            <Typography
                              variant="subtitle2"
                              style={{
                                fontSize: "12px",
                                textAlign: "left",
                              }}
                            >
                              <span style={{ fontWeight: "bold" }}>
                                Transaction ID
                              </span>{" "}
                              - {row["transaction_id"]}
                            </Typography>
                          ) : row["payment_type"] === "Cheque" ? (
                            <Typography
                              variant="subtitle2"
                              style={{
                                fontSize: "12px",
                                textAlign: "left",
                              }}
                            >
                              <span style={{ fontWeight: "bold" }}>
                                Cheque no
                              </span>{" "}
                              - {row["cheque_no"]}
                              <br />
                              <span style={{ fontWeight: "bold" }}>
                                {" "}
                                Account name
                              </span>{" "}
                              - {row["account_name"]}
                              <br />
                              <span style={{ fontWeight: "bold" }}>
                                Bank name
                              </span>{" "}
                              - {row["bank_name"]}
                              <br />
                              <span style={{ fontWeight: "bold" }}>
                                Account no
                              </span>{" "}
                              - {row["account_no"]}
                            </Typography>
                          ) : row["payment_type"] === "Cash" ? null : (
                            <Typography
                              variant="subtitle2"
                              style={{
                                fontSize: "12px",
                                textAlign: "left",
                              }}
                            >
                              <span style={{ fontWeight: "bold" }}>Utr no</span>{" "}
                              - {row["utr_no"]}
                              <br />
                              <span style={{ fontWeight: "bold" }}>
                                Account name
                              </span>{" "}
                              - {row["account_name"]}
                              <br />
                              <span style={{ fontWeight: "bold" }}>
                                Bank name
                              </span>{" "}
                              - {row["bank_name"]}
                              <br />
                              <span style={{ fontWeight: "bold" }}>
                                {" "}
                                Account no{" "}
                              </span>{" "}
                              - {row["account_no"]}
                            </Typography>
                          )}
                        </StyledTableDataCell>
                      ) : (
                        <StyledTableDataCell
                          component="th"
                          scope="row"
                          style={{
                            fontWeight: "bold",
                            textAlign: "center",
                            fontSize: "12px",
                            minWidth: "100px",
                            color:
                              val === "amount" || val === "original_amount"
                                ? "rgb(61,162,138)"
                                : val === "quantity"
                                ? "rgb(143,125,246)"
                                : "black",
                          }}
                        >
                          {row[val]}
                        </StyledTableDataCell>
                      )
                    )}
                  </StyledTableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>
        {!matchesIphone && <Grid item sm={6}></Grid>}
        <Grid item xs={12} style={{ textAlign: "center" }} sm={3}>
          {" "}
          <TextField
            id="client-master-code"
            select
            value={financeTable.on_page_data_client}
            variant="outlined"
            inputProps={{ className: classes.input }}
            onChange={(e) => {
              setCurrentPage(1);
              dispatch({
                type: ADVANCE_FINANCE_CONSTANT.GET_ADVANCE_TABLE,
                payload: {
                  pg_no: 1,
                  on_page_data_client: e.target.value,
                },
              });
              dispatch(getAdvanceFinanceTableAction(notify));
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
        </Grid>
        <Grid item xs={12} style={{ textAlign: "center" }} sm={3}>
          <Pagination
            onChange={(e, val) => {
              dispatch({
                type: ADVANCE_FINANCE_CONSTANT.GET_ADVANCE_TABLE,
                payload: { pg_no: val },
              });
              dispatch(getAdvanceFinanceTableAction(notify));
            }}
            count={financeTable.total_pages}
            page={financeTable.pg_no}
            variant="outlined"
          />
        </Grid>
      </Grid>
      <LOLOFinanceModal
        open={open}
        handleClose={handleClose}
        handleSubmitLoloFinance={handleSubmitLoloFinance}
      />
      <LOLOFinanceUpdateModal
        openUpdate={openUpdate}
        handleCloseUpdate={handleCloseUpdate}
      />
    </LayoutContainer>
  );
};

export default MNRLoloFinance;
