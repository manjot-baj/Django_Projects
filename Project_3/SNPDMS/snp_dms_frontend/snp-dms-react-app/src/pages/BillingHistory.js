import jwt_decode from "jwt-decode";
import LayoutContainer from "../components/reusableComponents/LayoutContainer";
import React, { useState, useEffect } from "react";
import {
  makeStyles,
  Typography,
  Grid,
  Button,
  TextField,
  Paper,
  MenuItem,
  InputBase,
  Select,
  Box,
  Modal,
  Backdrop,
  CircularProgress,
} from "@material-ui/core";
import ReactTable from "react-table-v6";
import "react-table-v6/react-table.css";
import { useDispatch, useSelector } from "react-redux";
import BillingHistorySearch from "../components/BillingHistorySearch";
import SearchIcon from "@material-ui/icons/Search";
import IconButton from "@material-ui/core/IconButton";
import { useSnackbar } from "notistack";
import { getInvoiceHistory } from "../actions/BillingActions";
import { useHistory } from "react-router-dom";
import PreviousIcon from "@material-ui/icons/ArrowBack";
import NextIcon from "@material-ui/icons/ArrowForward";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSort } from "@fortawesome/free-solid-svg-icons";
import ClearIcon from "@material-ui/icons/Clear";
import RefreshIcon from "@material-ui/icons/Refresh";

const BillingHistory = () => {
  const store = useSelector((state) => state);
  const { billing, ui, stocksAndAllotment } = store;

  const useStyles = makeStyles((theme) => ({
    button: {
      marginLeft: 10,
      "&:hover": {
        cursor: "pointer",
      },
    },
    input: {
      padding: 7,
      borderColor: "black",
      "& .MuiInputBase-input": {
        width: "400px",
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
    pdHorizontal: {
      paddingLeft: ui.drawerOpen ? 0 : "160px",
      paddingRight: ui.drawerOpen ? 0 : 160,
      [theme.breakpoints.down("sm")]: {
        paddingLeft: 0,
        paddingRight: 0,
      },
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
  }));

  const history = useHistory();
  const dispatch = useDispatch();
  const classes = useStyles();
  const [currentPage, setCurrentPage] = useState(1);
  const [disable, setDisable] = useState(1);
  const [stocksAvailableList, setStocksAvailableList] = useState([]);
  const notify = useSnackbar().enqueueSnackbar;
  const [name, setName] = useState("Client");
  const [filterType, setFilterType] = useState("");
  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(!open);
  useEffect(() => {
    setStocksAvailableList(billing && billing.allInvoiceHistory);
  }, [billing.allInvoiceHistory]);

  useEffect(() => {
    let data = {
      from: store.stocksAndAllotmentSearch.from,
      to: store.stocksAndAllotmentSearch.to,
      client: billing.client,
      container_no: "",
      charge_type: store.stocksAndAllotmentSearch.charge_type,
      invoice_date: store.stocksAndAllotmentSearch.invoice_date,
      invoice_no: "",
      location: localStorage.getItem("location")
        ? localStorage.getItem("location")
        : null,
      site: localStorage.getItem("site") ? localStorage.getItem("site") : null,
      pg_no: store.stocksAndAllotmentSearch.pg_no,
      on_page_data: store.stocksAndAllotmentSearch.on_page_data,
    };
    dispatch(getInvoiceHistory(data));
  }, [
    store.stocksAndAllotmentSearch.pg_no,
    store.stocksAndAllotmentSearch.on_page_data,
  ]);

  useEffect (()=>{
    dispatch({ type: "RESET_STOCK_ALLOTMENT_DATA" });
  },[])

  const nextStockPage = () => {
    setCurrentPage(Number(currentPage) + 1);
    setDisable(disable + 1);
    dispatch({
      type: "TOGGLE_PAGE_NO_SEARCH_VALUE",
      payload: Number(store.stocksAndAllotmentSearch.pg_no) + 1,
    });
  };

  const prevStockPage = () => {
    setCurrentPage(Number(currentPage) - 1);
    setDisable(disable - 1);
    dispatch({
      type: "TOGGLE_PAGE_NO_SEARCH_VALUE",
      payload: Number(store.stocksAndAllotmentSearch.pg_no) - 1,
    });
  };

  const Columns = [
    {
      Header: (
        <b style={{ color: "#2A5FA5" }}>
          Invoice Number
          <FontAwesomeIcon icon={faSort} />
        </b>
      ),
      accessor: "invoice_no",
      style: {
        textAlign: "center",
        cursor: "pointer",
      },
      Cell: (row) => {
        return (
          <div
            onClick={() =>
              history.push({
                pathname: "/collect-invoice",
                state: { pk: row.original.pk, allDetails: row.original },
              })
            }
          >
            <span title={row.original}>{row.original.invoice_no}</span>
          </div>
        );
      },
    },
    {
      Header: (
        <b style={{ color: "#2A5FA5" }}>
          Invoice Date <FontAwesomeIcon icon={faSort} />
        </b>
      ),
      accessor: "invoice_date",
      style: {
        textAlign: "center",
        cursor: "pointer",
      },
      Cell: (row) => {
        return (
          <div
            onClick={() =>
              history.push({
                pathname: "/collect-invoice",
                state: { pk: row.original.pk, allDetails: row.original },
              })
            }
          >
            <span title={row.original.remarks}>
              {row.original.invoice_date}
            </span>
          </div>
        );
      },
    },
    {
      Header: (
        <b style={{ color: "#2A5FA5" }}>
          Charge Type <FontAwesomeIcon icon={faSort} />
        </b>
      ),
      accessor: "charge_type",
      style: {
        textAlign: "center",
        cursor: "pointer",
      },
      Cell: (row) => {
        return (
          <div
            onClick={() =>
              history.push({
                pathname: "/collect-invoice",
                state: { pk: row.original.pk, allDetails: row.original },
              })
            }
          >
            <span title={row.original.remarks}>{row.original.charge_type}</span>
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
        textAlign: "center",
        cursor: "pointer",
      },
      Cell: (row) => {
        return (
          <div
            onClick={() =>
              history.push({
                pathname: "/collect-invoice",
                state: { pk: row.original.pk, allDetails: row.original },
              })
            }
          >
            <span title={row.original.remarks}>{row.original.client}</span>
          </div>
        );
      },
    },
    {
      Header: (
        <b style={{ color: "#2A5FA5" }}>
          Location <FontAwesomeIcon icon={faSort} />
        </b>
      ),
      accessor: "location",
      style: {
        textAlign: "center",
        cursor: "pointer",
      },
      Cell: (row) => {
        return (
          <div
            onClick={() =>
              history.push({
                pathname: "/collect-invoice",
                state: { pk: row.original.pk, allDetails: row.original },
              })
            }
          >
            <span title={row.original.remarks}>{row.original.location}</span>
          </div>
        );
      },
    },
  ];

  // Check if the token is expired if yes then push to login
  useEffect(() => {
    var token = localStorage.getItem("accessToken");
    if (token) {
      var decode = jwt_decode(token);

      if (decode.exp < new Date().getTime() / 1000) {
        history.push("/login");
      }
    } else {
      history.push("/login");
    }
  }, []);
  const updateName = (event) => {
    setFilterType("");
    dispatch({ type: "SET_BILLING_CLIENT", payload: "" });
    dispatch({ type: "SET_BILLING_CONTAINER", payload: "" });
    dispatch({ type: "RESET_STOCK_ALLOTMENT_DATA" });
    setName(event.target.value);
  };
  const getData = () => {
    let data = {
      client: billing?.client,
      container_no:billing?.container_no,
      from: "",
      to: "",
      charge_type: "",
      invoice_date: { from: "", to: "" },
      invoice_no: "",
      location: localStorage.getItem("location")
        ? localStorage.getItem("location")
        : null,
      site: localStorage.getItem("site") ? localStorage.getItem("site") : null,
      pg_no: store.stocksAndAllotmentSearch.pg_no,
      on_page_data: store.stocksAndAllotmentSearch.on_page_data,
    };
    dispatch(getInvoiceHistory(data));
  };
  const setDispatchType = (e) => {
    if (name === "Client") {
      dispatch({ type: "SET_BILLING_CLIENT", payload: e.target.value });
    } else {
      dispatch({ type: "SET_BILLING_CONTAINER", payload: e.target.value });
    }
    setFilterType(e.target.value);
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      let data = {
        client: billing.client,
        container_no: name === "Container Number" ? filterType : "",
        from: "",
        to: "",
        charge_type: store.stocksAndAllotmentSearch.charge_type,
        invoice_date: { from: "", to: "" },
        invoice_no: "",
        location: localStorage.getItem("location")
          ? localStorage.getItem("location")
          : null,
        site: localStorage.getItem("site")
          ? localStorage.getItem("site")
          : null,
        pg_no: store.stocksAndAllotmentSearch.pg_no,
        on_page_data: store.stocksAndAllotmentSearch.on_page_data,
      };
      dispatch(getInvoiceHistory(data));
    }
  };

  return (
    <LayoutContainer>
      <div className={classes.pdHorizontal}>
        <Grid container>
          <Grid item xs={12}>
            <Grid
              style={{
                display: "flex",
                width: "80%",
                justifyContent: "space-between",
              }}
            >
              <Grid className={classes.searchPaperWrapper}>
                <Paper
                  component="form"
                  className={classes.searchPaperMenu}
                  elevation={0}
                >
                  <Select
                    id="client-name"
                    value={name}
                    fullWidth
                    className={classes.searchMenuItemPaper}
                    onChange={updateName}
                  >
                    <MenuItem value={"Client Name"}>
                      &nbsp; &nbsp;&nbsp;Client Name
                    </MenuItem>
                    <MenuItem value={"Container Number"}>
                      &nbsp; &nbsp;&nbsp;Container Number
                    </MenuItem>
                  </Select>
                  <InputBase
                    className={classes.input}
                    placeholder={`Search ${name}`}
                    inputProps={{ "aria-label": "search" }}
                    value={filterType}
                    onChange={setDispatchType}
                    onKeyDown={handleKeyDown}
                    autoComplete="off"
                  />
                  <IconButton
                    type="button"
                    className={classes.iconButton}
                    aria-label="search"
                    onClick={() => {
                      getData();
                    }}
                  >
                    <SearchIcon />
                  </IconButton>
                </Paper>
              </Grid>
              <Grid>
                <Button className={classes.searchButton} onClick={handleOpen}>
                  <SearchIcon />
                  &nbsp; &nbsp; Advanced Search
                </Button>
              </Grid>
            </Grid>
            <Modal open={open} onClose={handleClose}>
              <Box className={classes.modalPopUp}>
                <Grid className={classes.clearIcon}>
                  {" "}
                  <ClearIcon onClick={handleClose} />
                </Grid>
                <BillingHistorySearch handleClose={handleClose} />
              </Box>
            </Modal>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                paddingTop: 20,
              }}
            >
              <Grid
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: 10,
                  width: "100%",
                }}
              >
                <Typography>Billing History</Typography>
                {stocksAvailableList && stocksAvailableList.length > 0 && (
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
                )}
              </Grid>
            </div>
            <Paper className={classes.paperContainer} elevation={0}>
              <ReactTable
                data={stocksAvailableList && stocksAvailableList}
                columns={[...Columns]}
                minRows={store.stocksAndAllotmentSearch.on_page_data}
                collapseOnDataChange={false}
                style={{
                  height: "300px", // This will force the table body to overflow and scroll, since there is not enough room
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
                <Grid style={{ display: "flex", alignItems: "flex-end" }}>
                  <Typography variant="subtitle2" style={{ padding: "3px" }}>
                    Page
                  </Typography>
                  <TextField
                    id="basic"
                    variant="outlined"
                    size="small"
                    style={{ width: "50px", padding: "3px" }}
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
                  <Typography variant="subtitle2" style={{ padding: "3px" }}>
                    of
                  </Typography>
                  <Typography variant="subtitle2" style={{ padding: "3px" }}>
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
                <Button
                  variant="contained"
                  endIcon={<NextIcon />}
                  color="secondary"
                  onClick={nextStockPage}
                  disabled={stocksAndAllotment.nextPage === "" ? true : false}
                >
                  Next
                </Button>
              </Grid>
            </Paper>
          </Grid>
        </Grid>
      </div>
      <Backdrop className={classes.backdrop} open={ui.isloading}>
        <CircularProgress color="inherit" />
      </Backdrop>
    </LayoutContainer>
  );
};
export default BillingHistory;