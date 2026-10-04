import LayoutContainer from "@/components/reusablecomponents/LayoutContainer";
import {
  Box,
  CircularProgress,
  Paper,
  Tabs,
  Tab,
  alpha,
  Typography,
  Pagination,
  Stack,
  Backdrop,
  Fab,
  IconButton,
  MenuItem,
  TableCell,
  TableRow,
  styled,
  TableContainer,
  Table,
  TableHead,
  TableBody,
} from "@mui/material";
import React, { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import PropTypes from "prop-types";
import { LOLOFooterComponent } from "@/components/LOLOFooterComponent";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import PaymentLoloComponent from "@/components/PaymentLoloComponent";
import {
  getHandlingPayment,
  getHandlingPaymentListing,
  getStPayment,
  getSTPaymentListing,
} from "@/actions/HandlingAndSTPaymentAction";
import { useSnackbar } from "notistack";
import { HANDLING_ST_PAYMENT } from "@/reducers/HandlingAndSTPaymentReducer";
import { custombackDropStyle } from "@/utils/CustomClasses";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import HandlingTableCustomSearchBar from "@/components/HandlingTableCustomSearchBar";

const rowArray = [
  "cheque_no",
  "utr_no",
  "date",
  "payment_type",
  "bank_name",
  "account_name",
  "account_no",
  "container",
  "quantity",
  "remaining",
  "original_amount",
  "amount",
  "action",
];

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  // Styles for header cells
  "&.MuiTableCell-head": {
    fontWeight: 600,
    backgroundColor: theme.palette.secondary.main,
    color: "white",
    fontSize: "12px",
    textTransform: "uppercase",
    textAlign: "center",
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
  padding: "16px",
  borderColor: "transparent",
  textAlign: "center",
  textTransform: "uppercase",
}));

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`scrollable-force-tabpanel-${index}`}
      aria-labelledby={`scrollable-force-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box
          sx={(theme) => ({
            paddingTop: 4,

            [theme.breakpoints.down("sm")]: {
              paddingLeft: 0,
            },
          })}
        >
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

const PaymentLOLOGateInOut = () => {
  const { payment_handling_list, payment_st_list } = useSelector(
    (state) => state.HandlingAndSTPaymentReducer
  );
  const ui = useSelector((state) => state.ui);
  const dispatch = useDispatch();
  const [process, setProcess] = useState("container_no");
  const notify = useSnackbar().enqueueSnackbar;
  const [value, setValue] = React.useState(0);
  const [openPaymentModal, setOpenPaymentModal] = useState(false);
  const [searchText, setSearchText] = useState("");

  const handleModalClose = () => {
    dispatch({ type: HANDLING_ST_PAYMENT.HANDLING_SINGLE_PAYMENT_INIT });
    dispatch({ type: HANDLING_ST_PAYMENT.ST_SINGLE_PAYMENT_INIT });
    setOpenPaymentModal(false);
  };

  const handleModalOpen = () => setOpenPaymentModal(true);

  const handleChange = (event, newValue) => {
    dispatch({
      type: HANDLING_ST_PAYMENT.HANDLING_LIST,
      payload: {
        pg_no: 1,
        container_no: "",
        utr_no: "",
        cheque_no: "",
      },
    });
    dispatch({
      type: HANDLING_ST_PAYMENT.ST_LIST,
      payload: {
        pg_no: 1,
        container_no: "",
        utr_no: "",
        cheque_no: "",
      },
    });

    setValue(newValue);
    setSearchText("");
  };

  const handleSetProcess = useCallback(
    (e) => setProcess(e.target.value),
    [process]
  );

  const handleSearchChange = useCallback(
    (e) => {
      setSearchText(e.target.value);
    },
    [searchText]
  );
  const handleCloseClick = useCallback(() => {
    if (value === 0) {
      dispatch({
        type: HANDLING_ST_PAYMENT.HANDLING_LIST,
        payload: {
          pg_no: 1,
          container_no: "",
          utr_no: "",
          cheque_no: "",
        },
      });
      dispatch(getHandlingPaymentListing(notify));
    } else {
      dispatch({
        type: HANDLING_ST_PAYMENT.ST_LIST,
        payload: {
          pg_no: 1,
          container_no: "",
          utr_no: "",
          cheque_no: "",
        },
      });
      dispatch(getSTPaymentListing(notify));
    }

    setSearchText("");
  }, [searchText]);

  const handleSearchButton = useCallback(() => {
    if (value === 0) {
      dispatch({
        type: HANDLING_ST_PAYMENT.HANDLING_LIST,
        payload: {
          pg_no: 1,
          container_no: process === "container_no" ? searchText : "",
          utr_no: process === "utr_no" ? searchText : "",
          cheque_no: process === "cheque_no" ? searchText : "",
        },
      });
      dispatch(getHandlingPaymentListing(notify));
    } else {
      dispatch({
        type: HANDLING_ST_PAYMENT.ST_LIST,
        payload: {
          pg_no: 1,
          container_no: process === "container_no" ? searchText : "",
          utr_no: process === "utr_no" ? searchText : "",
          cheque_no: process === "cheque_no" ? searchText : "",
        },
      });
      dispatch(getSTPaymentListing(notify));
    }
  }, [searchText, notify, process]);

  useEffect(() => {
    if (value === 0) {
      dispatch(getHandlingPaymentListing(notify));
    } else {
      dispatch(getSTPaymentListing(notify));
    }
  }, [value, payment_handling_list.pg_no, payment_st_list.pg_no]);

  const handlePaginationOnChange = (e, val) => {
    dispatch({
      type: HANDLING_ST_PAYMENT.HANDLING_LIST,
      payload: {
        pg_no: val,
      },
    });
  };

  const handlePaginationSTOnChange = (e, val) => {
    dispatch({
      type: HANDLING_ST_PAYMENT.ST_LIST,
      payload: {
        pg_no: val,
      },
    });
  };
  return (
    <LayoutContainer>
      <Paper
        elevation={0}
        sx={(theme) => ({
          flexGrow: 1,
          backgroundColor: "#fff",
          borderRadius: 20,
          width: 440,
          margin: "auto",
          [theme.breakpoints.down("lg")]: {
            marginX: "auto",
          },
          [theme.breakpoints.down("sm")]: {
            width: "100%",
            bgcolor: "transparent",
          },
        })}
      >
        <Tabs
          value={value}
          onChange={handleChange}
          variant="fullWidth"
          indicatorColor="white"
        >
          <Tab
            onload={() => window.location.reload()}
            sx={(theme) => ({
              fontSize: 13,
              borderRadius: value === 0 ? 12 : 12,
              color:
                value === 0
                  ? theme.palette.primary.main
                  : alpha(theme.palette.secondary.main, 0.5),
              [theme.breakpoints.down("sm")]: {
                marginX: 0,
                marginY: 1,
              },
            })}
            label={
              <Typography sx={{ fontWeight: value === 0 ? 600 : 400 }}>
                LOLO Payment
              </Typography>
            }
            {...a11yProps(0)}
          />
          <Tab
            sx={(theme) => ({
              fontSize: 13,
              borderRadius: value === 1 ? 12 : 12,
              color:
                value === 1
                  ? theme.palette.primary.main
                  : alpha(theme.palette.secondary.main, 0.5),
              [theme.breakpoints.down("sm")]: {
                marginX: 0,
                marginY: 1,
              },
            })}
            label={
              <Typography sx={{ fontWeight: value === 1 ? 600 : 400 }}>
                ST Payment
              </Typography>
            }
            {...a11yProps(1)}
          />
        </Tabs>
      </Paper>
      <TabPanel value={value} index={0}>
        <Stack
          direction={"row"}
          alignItems={"center"}
          justifyContent={"flex-start"}
          flexDirection={"row"}
          spacing={4}
          mb={2}
        >
          {" "}
          <Typography
            variant="h6"
            sx={(theme) => ({
              [theme.breakpoints.down("sm")]: {
                display: "none",
              },
            })}
          >
            Handling payment
          </Typography>
          <HandlingTableCustomSearchBar
            selectName={process?.split("_")?.join(" ")}
            updateSelectname={handleSetProcess}
            searchText={searchText}
            setSearchText={handleSearchChange}
            closeClick={handleCloseClick}
            searchClick={handleSearchButton}
            maxWidthSearch={"50%"}
          >
            <MenuItem key={"container_no"} value="container_no">
              Container No
            </MenuItem>
            <MenuItem key={"cheque_no"} value="cheque_no">
              Cheque No
            </MenuItem>
            <MenuItem key={"utr_no"} value="utr_no">
              UTR No
            </MenuItem>
          </HandlingTableCustomSearchBar>
        </Stack>
        <TableContainer style={{ minHeight: 325 }}>
          <Table
            sx={{
              minWidth: 650,
              borderCollapse: "separate",
              borderSpacing: "0px 10px",
              borderColor: "transparent",
              backgroundColor: "#EAF0F5",
            }}
            aria-label="simple table"
          >
            <TableHead>
              <TableRow>
                {rowArray.length > 0 &&
                  rowArray.map((row) => (
                    <StyledTableCell key={row.id}>
                      {row?.split("_")?.join(" ")}
                    </StyledTableCell>
                  ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {payment_handling_list.data.map((row) => (
                <StyledTableRow key={row.pk}>
                  {" "}
                  {rowArray.map((rowHead) => (
                    <StyledTableDataCell scope="row">
                      {rowHead === "action" ? (
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => {
                            handleModalOpen();
                            dispatch(getHandlingPayment(row.pk, notify));
                          }}
                        >
                          <EditOutlinedIcon />
                        </IconButton>
                      ) : (
                        <Typography
                          variant="body2"
                          sx={(theme) => ({
                            color:
                              rowHead === "quantity" ||
                              rowHead === "original_amount"
                                ? theme.palette.info.main
                                : rowHead === "remaining" ||
                                  rowHead === "amount"
                                ? theme.palette.error.main
                                : theme.palette.text.primary,
                          })}
                        >
                          {rowHead === "container"
                            ? row?.[rowHead]?.join("-")
                            : row?.[rowHead]}
                        </Typography>
                      )}
                    </StyledTableDataCell>
                  ))}{" "}
                </StyledTableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>
      <TabPanel value={value} index={1}>
        <Stack
          direction={"row"}
          alignItems={"center"}
          justifyContent={"flex-start"}
          flexDirection={"row"}
          spacing={4}
          mb={2}
        >
          {" "}
          <Typography
            variant="h6"
            sx={(theme) => ({
              [theme.breakpoints.down("sm")]: {
                display: "none",
              },
            })}
          >
            ST payment
          </Typography>
          <HandlingTableCustomSearchBar
            selectName={process?.split("_")?.join(" ")}
            updateSelectname={handleSetProcess}
            searchText={searchText}
            setSearchText={handleSearchChange}
            closeClick={handleCloseClick}
            searchClick={handleSearchButton}
            maxWidthSearch={"50%"}
          >
            <MenuItem key={"container_no"} value="container_no">
              Container No
            </MenuItem>
            <MenuItem key={"cheque_no"} value="cheque_no">
              Cheque No
            </MenuItem>
            <MenuItem key={"utr_no"} value="utr_no">
              UTR No
            </MenuItem>
          </HandlingTableCustomSearchBar>
        </Stack>
        <TableContainer style={{ minHeight: 325 }}>
          <Table
            sx={{
              minWidth: 650,
              borderCollapse: "separate",
              borderSpacing: "0px 10px",
              borderColor: "transparent",
              backgroundColor: "#EAF0F5",
            }}
            aria-label="simple table"
          >
            <TableHead>
              <TableRow>
                {rowArray.length > 0 &&
                  rowArray.map((row) => (
                    <StyledTableCell key={row.id}>
                      {row?.split("_")?.join(" ")}
                    </StyledTableCell>
                  ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {payment_st_list.data.map((row) => (
                <StyledTableRow key={row.pk}>
                  {" "}
                  {rowArray.map((rowHead) => (
                    <StyledTableDataCell scope="row">
                      {rowHead === "action" ? (
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => {
                            handleModalOpen();
                            dispatch(getStPayment(row.pk, notify));
                          }}
                        >
                          <EditOutlinedIcon />
                        </IconButton>
                      ) : (
                        <Typography
                          variant="body2"
                          sx={(theme) => ({
                            color:
                              rowHead === "quantity" ||
                              rowHead === "original_amount"
                                ? theme.palette.info.main
                                : rowHead === "remaining" ||
                                  rowHead === "amount"
                                ? theme.palette.error.main
                                : theme.palette.text.primary,
                          })}
                        >
                          {rowHead === "container"
                            ? row?.[rowHead]?.join("-")
                            : row?.[rowHead]}
                        </Typography>
                      )}
                    </StyledTableDataCell>
                  ))}{" "}
                </StyledTableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>
      <Stack
        direction={"row"}
        alignItems={"center"}
        justifyContent={"flex-end"}
        sx={{ pr: 2, mt: 2 }}
      >
        {value === 0 ? (
          <Pagination
            onChange={handlePaginationOnChange}
            count={payment_handling_list.total_pages}
            page={Number(payment_handling_list.pg_no)}
            variant="outlined"
            size="small"
          />
        ) : (
          <Pagination
            onChange={handlePaginationSTOnChange}
            count={payment_st_list.total_pages}
            page={Number(payment_st_list.pg_no)}
            variant="outlined"
            size="small"
          />
        )}
      </Stack>
      <Box sx={{ marginTop: 12 }}></Box>
      <LOLOFooterComponent>
        <Fab
          variant="extended"
          size="small"
          color="primary"
          sx={{ borderRadius: 12 }}
          onClick={handleModalOpen}
        >
          <AddOutlinedIcon /> {`Add ${value === 0 ? "Handling" : "ST"} Payment`}
        </Fab>
      </LOLOFooterComponent>
      <PaymentLoloComponent
        openPaymentModal={openPaymentModal}
        handleModalClose={handleModalClose}
        handleModalOpen={handleModalOpen}
        self_transportation={value === 0 ? false : true}
      />
      <Backdrop sx={custombackDropStyle} open={ui.isloading}>
        <CircularProgress color="inherit" />
      </Backdrop>
    </LayoutContainer>
  );
};

export default PaymentLOLOGateInOut;
