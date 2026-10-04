import React, { useCallback, useEffect, useRef, useState } from "react";
import LayoutContainer from "@components/reusablecomponents/LayoutContainer";
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
  MenuItem,
  Box,
  Radio,
  IconButton,
  TextField,
  Divider,
  Switch,
  styled,
  useMediaQuery,
  Tooltip,
  Checkbox,
  Chip,
  alpha,
  Badge,
  FormControlLabel,
  Backdrop,
  CircularProgress,
} from "@mui/material";
import { useSnackbar } from "notistack";
import { useHistory } from "react-router-dom";
import AddIcon from "@mui/icons-material/Add";
import { Pagination, Stack } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { ADVANCE_FINANCE_CONSTANT } from "../../reducers/AdvanceFinance/AdvanceFinanceReducer";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import LOLOFinanceUpdateModal from "../../components/advanceFinance/LOLOFinanceUpdateModal";
import { dropDownDispatch } from "../../actions/GateInActions";
import {
  deleteAdvancePaymentAction,
  getAdvanceFinanceTableAction,
  getPreGateOutPkBalanceAdjustmentINAction,
  getSingleAdvanceFinanceAction,
} from "../../actions/AdvanceFinance/AdvanceFinanceAction";
import SearchIcon from "@mui/icons-material/Search";
import RefreshIcon from "@mui/icons-material/Refresh";
import { handleDateChangeUTILSDispatch } from "../../utils/WeekNumbre";
import { Link } from "react-router-dom";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DriveFolderUploadOutlinedIcon from "@mui/icons-material/DriveFolderUploadOutlined";
import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import AddCircleOutlineOutlinedIcon from "@mui/icons-material/AddCircleOutlineOutlined";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers";
import dayjs from "dayjs";
import {
  TableAdvanceSearchWithModal,
  TableCustomSearchBar,
  TableFilterComponent,
  TableFootercontainer,
  TablePageTitle,
  TableRefreshIcon,
} from "@/components/TableComponent/TableComponent";
import PaymentOutlinedIcon from "@mui/icons-material/PaymentOutlined";
import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";
import { custombackDropStyle } from "@/utils/CustomClasses";
import TableViewIcon from "@mui/icons-material/TableView";
import LoloFinancereportDownloadModal from "@/components/advanceFinance/LoloFinancereportDownloadModal";

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
  "action",
  "payment_type",
  "payment_details",
  "with_gst",
  "is_adjusted",

  "created_at",
  "updated_at",
];

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

const StyledTableDataCell = styled(TableCell)(({ theme }) => ({
  fontWeight: 600,
  color: "#243545",
  fontSize: 12.5,
  borderBottom: "none",
  padding: "10px",
  borderColor: "transparent",
  textTransform: "uppercase",
}));

const MNRLoloFinance = () => {
  const notify = useSnackbar().enqueueSnackbar;
  const dispatch = useDispatch();
  const [open, setOpen] = React.useState(false);
  const [selectedPayment, setSelectedPayment] = React.useState([]);
  const [openUpdate, setOpenUpdate] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [process, setProcess] = useState("client");
  const [loading, setLoading] = useState(false);
  const { AdvanceFinanceReducer, user } = useSelector((state) => state);
  const { isloading } = useSelector((state) => state.ui);
  const { financeTable } = AdvanceFinanceReducer;
  const [currentPage, setCurrentPage] = useState(1);
  const [openLoloFinanceReportModal, setOpenLoloFinanceReportModal] =
    useState(false);
  const history = useHistory();
  const [anchorElAdvance, setAnchorElAdvance] = React.useState(null);
  const matchesIphone = useMediaQuery("(max-width:500px)");

  const openAdvance = Boolean(anchorElAdvance);
  const idAdvance = openAdvance ? "simple-popover-Advance" : undefined;
  const fromDateRef = useRef();

  useEffect(() => {
    let reqArray = ["lf_advance_payment_client_list", "lf_pregatein_list"];
    dispatch(dropDownDispatch(reqArray, notify));
    dispatch({
      type: ADVANCE_FINANCE_CONSTANT.GET_ADVANCE_TABLE,
      payload: {
        client: "",
        bl_no: "",
        bk_no: "",
      },
    });
    dispatch(getAdvanceFinanceTableAction(notify));
  }, []);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const handleOpenUpdate = () => setOpenUpdate(true);
  const handleClickAdvance = (event) => {
    setAnchorElAdvance(event.currentTarget);
  };

  const handleCloseAdvance = () => {
    setAnchorElAdvance(null);
  };

  const handleOpenLoloFinanceReportModal = () => {
    setOpenLoloFinanceReportModal(true);
  };

  const handleCloseLoloFinanceReportModal = () => {
    setOpenLoloFinanceReportModal(false);
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
    [searchText],
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

  const handleDeleteDateChip = () => {
    dispatch({
      type: ADVANCE_FINANCE_CONSTANT.GET_ADVANCE_TABLE,
      payload: {
        from_date: "",
        to_date: "",
      },
    });
    dispatch(getAdvanceFinanceTableAction(notify));
  };

  const handleDeletePaymentType = () => {
    dispatch({
      type: ADVANCE_FINANCE_CONSTANT.GET_ADVANCE_TABLE,
      payload: {
        payment_type: "",
      },
    });
    dispatch(getAdvanceFinanceTableAction(notify));
  };

  const handleUpdateBalanceAdjusted = () => {
    dispatch({
      type: ADVANCE_FINANCE_CONSTANT.GET_ADVANCE_TABLE,
      payload: {
        is_balance_pymt_adjusted: !financeTable.is_balance_pymt_adjusted,
      },
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
      <Box padding={matchesIphone ? 1 : 2} sx={{ paddingBottom: 24 }}>
        <Stack
          direction={"row"}
          alignItems={"center"}
          justifyContent={"space-between"}
        >
          <Stack
            direction={"row"}
            alignItems={"center"}
            justifyContent={"flex-start"}
            mb={6}
            spacing={2}
          >
            <PaymentOutlinedIcon fontSize="small" />
            <TablePageTitle>Advance LOLO Payment</TablePageTitle>
          </Stack>
        </Stack>

        <Grid container spacing={2}>
          <Grid
            item
            size={{ xs: 10, sm: 6, md: 8, lg: 8, xl: 8 }}
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-start",
              gap: 2,
            }}
          >
            <TableCustomSearchBar
              selectName={
                process === "client" ? "customer" : process.split("_").join(" ")
              }
              updateSelectname={handleSetProcess}
              searchText={searchText}
              setSearchText={handleSearchChange}
              closeClick={handleCloseClick}
              searchClick={handleSearchButton}
              maxWidthSearch={"60%"}
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
            </TableCustomSearchBar>
            <TableFilterComponent
              activeFilter={true}
              style={{ width: "fit-content" }}
              title={` ${financeTable.entry_type}`}
            >
              <Grid item size={{ xs: 12 }}>
                <Typography variant="subtitle2">Entry Type</Typography>
              </Grid>
              <Grid item size={{ xs: 12 }}>
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
              </Grid>
            </TableFilterComponent>
            <TableFilterComponent
              activeFilter={true}
              title={`${financeTable.with_gst === true ? "GST " : "No GST"}`}
              style={{
                width: 100,
              }}
            >
              <Grid item size={{ xs: 12 }}>
                <Typography variant="subtitle2">GST Type</Typography>
              </Grid>
              <Grid item size={{ xs: 12 }}>
                <FormControlLabel
                  value="yes"
                  control={
                    <Radio
                      size="small"
                      sx={(theme) => ({ color: theme.palette.primary.main })}
                      checked={financeTable.with_gst === true}
                      onClick={() => {
                        dispatch({
                          type: ADVANCE_FINANCE_CONSTANT.GET_ADVANCE_TABLE,
                          payload: {
                            with_gst: true,
                            pg_no: 1,
                          },
                        });
                        dispatch(getAdvanceFinanceTableAction(notify));
                      }}
                    />
                  }
                  label="GST"
                />
              </Grid>
              <Grid item size={{ xs: 12 }}>
                <FormControlLabel
                  value="no"
                  control={
                    <Radio
                      size="small"
                      sx={(theme) => ({ color: theme.palette.primary.main })}
                      checked={financeTable.with_gst === false}
                      onClick={() => {
                        dispatch({
                          type: ADVANCE_FINANCE_CONSTANT.GET_ADVANCE_TABLE,
                          payload: {
                            with_gst: false,
                            pg_no: 1,
                          },
                        });
                        dispatch(getAdvanceFinanceTableAction(notify));
                      }}
                    />
                  }
                  label="No GST"
                />
              </Grid>
            </TableFilterComponent>
            <TableAdvanceSearchWithModal
              open={open}
              handleClose={handleClose}
              handleOpen={handleOpen}
              style={{ width: "fit-content" }}
              activeFilter={
                financeTable.payment_type !== "" ||
                (financeTable.from_date !== "" && financeTable.to_date !== "")
              }
            >
              <Box>
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
                      onClick={() => {
                        handleAdvanceSearch();
                        handleClose();
                      }}
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
                  Date
                </Typography>

                <Stack
                  direction={"row"}
                  spacing={matchesIphone ? 0 : 2}
                  flexDirection={matchesIphone ? "column" : "row"}
                >
                  <Typography variant="caption">from </Typography>
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                      slotProps={{ textField: { size: "small" } }}
                      format="YYYY/MM/DD"
                      id={`-date-picker-inline`}
                      value={
                        financeTable.from_date
                          ? dayjs(financeTable.from_date)
                          : null
                      }
                      name="from_date"
                      onChange={(date) => {
                        handleDateChangeUTILSDispatch(
                          date,
                          dispatch,
                          ADVANCE_FINANCE_CONSTANT.GET_ADVANCE_TABLE,
                          "from_date",
                        );
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
                        financeTable.to_date
                          ? dayjs(financeTable.to_date)
                          : null
                      }
                      name="to_date"
                      onChange={(date) => {
                        handleDateChangeUTILSDispatch(
                          date,
                          dispatch,
                          ADVANCE_FINANCE_CONSTANT.GET_ADVANCE_TABLE,
                          "to_date",
                        );
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
                  Select Payment Type
                </Typography>
                <Stack
                  direction={"row"}
                  alignItems={"center"}
                  flexWrap={"wrap"}
                >
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
              </Box>
            </TableAdvanceSearchWithModal>
          </Grid>

          <Grid
            item
            size={{ xs: 12, sm: 12, md: 4, lg: 4, xl: 4 }}
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
              gap: 1,
            }}
          >
            {financeTable?.from_date !== "" && financeTable?.to_date !== "" && (
              <Chip
                size="small"
                label={`${financeTable?.from_date} / ${financeTable?.to_date}`}
                variant="outlined"
                color="primary"
                onDelete={handleDeleteDateChip}
              />
            )}
            {financeTable?.payment_type !== "" && (
              <Chip
                size="small"
                label={financeTable?.payment_type}
                variant="outlined"
                color="primary"
                onDelete={handleDeletePaymentType}
              />
            )}
            <Chip
              size="small"
              label="Balance Adjusted"
              variant="filled"
              sx={{ cursor: "pointer" }}
              color={
                financeTable?.is_balance_pymt_adjusted ? "primary" : "default"
              }
              onClick={handleUpdateBalanceAdjusted}
            />

            <TableRefreshIcon onClick={handleRefreshTable} />
          </Grid>
          <Grid item size={{ xs: 12 }}>
            <TableContainer
              style={{ minHeight: 325 }}
              sx={(theme) => ({
                overflowX: "scroll",
                "&::-webkit-scrollbar": {
                  height: "5px",
                },
                "&::-webkit-scrollbar-thumb": {
                  background: alpha(theme.palette.primary.dark, 1),
                },
                [theme.breakpoints.down("sm")]: {
                  maxWidth: "95vw",
                  overflowX: "scroll",
                  marginBottom: "24px",
                },
              })}
            >
              <Table
                stickyHeader
                sx={(theme) => ({
                  borderCollapse: "separate",
                  borderSpacing: "0px 10px",
                  borderColor: "transparent",
                  backgroundColor: "transparent",
                  [theme.breakpoints.down("sm")]: {
                    minWidth: "auto",
                    overflow: "hidden",
                  },
                })}
                aria-label="simple table"
              >
                <TableHead>
                  <TableRow>
                    {TABLE_CONST.map((val) =>
                      val === "check" ? (
                        <StyledTableCell
                          sx={(theme) => ({
                            backgroundColor: theme.palette.secondary.main,
                          })}
                        >
                          <Checkbox
                            checked={financeTable.data?.every((val) => {
                              return selectedPayment.includes(val.pk);
                            })}
                            onClick={handleAllCheck}
                            color="error"
                            inputProps={{ "aria-label": "Checkbox A" }}
                            aria-sort="none"
                          />
                        </StyledTableCell>
                      ) : (
                        <StyledTableCell
                          sx={(theme) => ({
                            backgroundColor: theme.palette.secondary.main,
                          })}
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
                      ),
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
                            {row["bk_no"] === null
                              ? row["bl_no"]
                              : row["bk_no"]}
                          </StyledTableDataCell>
                        ) : val === "with_gst" ? (
                          <StyledTableDataCell
                            component="th"
                            scope="row"
                            style={{
                              textAlign: "center",
                              minWidth: "20px",
                              color: "#292b4d",
                            }}
                          >
                            {row["with_gst"] === true ? "With GST" : "No GST"}
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
                                (payment) => row["pk"] === payment,
                              )}
                              onChange={() => handleRowClick(row["pk"])}
                              color="error"
                              sx={{
                                color: "black",
                              }}
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
                              justifyContent: "center",
                            }}
                          >
                            <Tooltip
                              title={
                                AdvanceFinanceReducer.financeTable
                                  .entry_type === "IN"
                                  ? "Pre Gate IN"
                                  : "Pre Gate OUT"
                              }
                            >
                              <Link
                                to={`/lolo-payment/advance-lolo-payment/advance-payment-process/${
                                  row["pk"]
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
                          >
                            {row["date"]}
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
                            {row["created_at"]}
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
                            {row["updated_at"]}
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
                            {row["balance_amount"]}
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
                            {row["is_balance_pymt_adjusted"] ? "Yes" : "No"}
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
                            <Chip
                              variant="filled"
                              color="info"
                              label={row["payment_type"]}
                            />
                          </StyledTableDataCell>
                        ) : val === "is_adjusted" ? (
                          <StyledTableDataCell component="th" scope="row">
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
                              to={`/lolo-payment/advance-lolo-payment/advance-payment-process/${
                                row["pk"]
                              }`}
                              onClick={(e) => e.stopPropagation()}
                              style={{
                                backgroundColor: "#2ac08f",
                                color: "#fff",
                                padding: "10px 20px",
                                borderRadius: 5,
                                fontWeight: 600,
                                fontSize: "12px",
                              }}
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
                              style={{
                                backgroundColor: "#2ac08f",
                                color: "#fff",
                                padding: "10px 20px",
                                borderRadius: 5,
                                fontWeight: 600,
                                fontSize: "12px",
                              }}
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
                                <span style={{ fontWeight: "bold" }}>
                                  Utr no
                                </span>{" "}
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
                              textAlign: "center",
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
                        ),
                      )}
                    </StyledTableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>
          <Grid item size={{ xs: 12, sm: 6 }}></Grid>
          <Grid item size={{ xs: 12, sm: 3 }} style={{ textAlign: "center" }}>
            {" "}
            <TextField
              id="client-master-code"
              select
              value={financeTable.on_page_data_client}
              variant="outlined"
              size="small"
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
          <Grid item size={{ xs: 12, sm: 3 }} style={{ textAlign: "center" }}>
            <Pagination
              size="small"
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
        <TableFootercontainer>
          {selectedPayment.length > 0 && (
            <Button
              variant="outlined"
              color="secondary"
              onClick={() =>
                dispatch(
                  deleteAdvancePaymentAction(
                    selectedPayment,
                    notify,
                    setSelectedPayment,
                  ),
                )
              }
              sx={{
                mx: 1,
                textTransform: "none",
                fontWeight: 600,
                borderRadius: 2,
                px: 2,
                py: 0.9,
                color: "secondary.main",
                borderColor: "secondary.main",
                backgroundColor: "rgba(46, 125, 50, 0.04)",
                "&:hover": {
                  backgroundColor: "rgba(46, 125, 50, 0.08)",
                  borderColor: "secondary.main",
                },
              }}
              startIcon={
                <Badge
                  badgeContent={selectedPayment?.length}
                  color="error"
                  sx={{
                    "& .MuiBadge-badge": {
                      right: 22,
                      top: 6,
                      padding: 0,
                    },
                  }}
                >
                  <DeleteOutlineOutlinedIcon color="secondary" />
                </Badge>
              }
            >
              Delete
            </Button>
          )}
          {(user.lolo_finance === true || user.lolo_finance === "True") &&
            selectedPayment.length === 0 && (
              <Button
                startIcon={<AddIcon />}
                variant="outlined"
                color="primary"
                sx={{
                  mx: 1,
                  textTransform: "none",
                  fontWeight: 600,
                  borderRadius: 2,
                  px: 2,
                  py: 0.9,
                  color: "primary.main",
                  borderColor: "primary.main",
                  backgroundColor: "rgba(46, 125, 50, 0.04)",
                  "&:hover": {
                    backgroundColor: "rgba(46, 125, 50, 0.08)",
                    borderColor: "primary.main",
                  },
                }}
                onClick={handleOpenUpdate}
              >
                Add Advance Payment
              </Button>
            )}
          {selectedPayment.length === 0 && (
            <Button
              startIcon={<CloudUploadOutlinedIcon fontSize="small" />}
              sx={{
                mx: 1,
                textTransform: "none",
                fontWeight: 600,
                borderRadius: 2,
                px: 2,
                py: 0.9,
                color: "success.main",
                borderColor: "success.main",
                backgroundColor: "rgba(46, 125, 50, 0.04)",
                "&:hover": {
                  backgroundColor: "rgba(46, 125, 50, 0.08)",
                  borderColor: "success.main",
                },
              }}
              variant="outlined"
              color="success"
              onClick={() =>
                history.push("/lolo-payment/advance-lolo-payment/bulk-upload")
              }
            >
              Bulk Upload
            </Button>
          )}
          {selectedPayment.length === 0 && (
            <Button
              variant="outlined"
              startIcon={<TableViewIcon />}
              onClick={handleOpenLoloFinanceReportModal}
              sx={{
                mx: 1,
                textTransform: "none",
                fontWeight: 600,
                borderRadius: 2,
                px: 2,
                py: 0.9,
                color: "success.main",
                borderColor: "success.light",
                backgroundColor: "rgba(46, 125, 50, 0.04)",
                "&:hover": {
                  backgroundColor: "rgba(46, 125, 50, 0.08)",
                  borderColor: "success.main",
                },
              }}
            >
              Download Report
            </Button>
          )}
        </TableFootercontainer>
      </Box>
      <LoloFinancereportDownloadModal
        openLoloFinanceReportModal={openLoloFinanceReportModal}
        handleCloseLoloFinanceReportModal={handleCloseLoloFinanceReportModal}
      />
      <LOLOFinanceUpdateModal
        openUpdate={openUpdate}
        handleCloseUpdate={handleCloseUpdate}
      />
      <Backdrop sx={custombackDropStyle} open={isloading}>
        <CircularProgress color="inherit" />
      </Backdrop>
    </LayoutContainer>
  );
};

export default MNRLoloFinance;
