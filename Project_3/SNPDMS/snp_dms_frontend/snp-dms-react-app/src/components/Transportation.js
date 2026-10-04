import React, { useState, useEffect } from "react";
import {
  makeStyles,
  Typography,
  Grid,
  Button,
  TextField,
  MenuItem,
  Paper,
  InputBase,
  Select,
  Box,
  Modal,
} from "@material-ui/core";

import { useDispatch, useSelector } from "react-redux";
import TransportationSearch from "./TransportationSearch";

import Checkbox from "./reusableComponents/Checkbox";
import { useSnackbar } from "notistack";
import {
  getTransportationBilling,
  collectInvoice,
  rejectInvoice,
} from "../actions/BillingActions";
import { useHistory } from "react-router-dom";

import PreviousIcon from "@material-ui/icons/ArrowBack";
import NextIcon from "@material-ui/icons/ArrowForward";
import ReactTable from "react-table-v6";
import "react-table-v6/react-table.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSort } from "@fortawesome/free-solid-svg-icons";
import SearchIcon from "@material-ui/icons/Search";
import IconButton from "@material-ui/core/IconButton";
import ClearIcon from "@material-ui/icons/Clear";
import RefreshIcon from "@material-ui/icons/Refresh";

const Transportation = (props) => {
  const dispatch = useDispatch();
  const store = useSelector((state) => state);
  const { billing, ui, clientMaster, stocksAndAllotment } = store;
  const history = useHistory();
  const [currentPage, setCurrentPage] = useState(1);
  const [disable, setDisable] = useState(1);
  const [stocksAvailableList, setStocksAvailableList] = useState([]);
  const notify = useSnackbar().enqueueSnackbar;
  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const [name, setName] = useState("Client");
  const [filterType, setFilterType] = useState();

  useEffect(() => {
    setStocksAvailableList(billing && billing.allTransportationBills);
   
// eslint-disable-next-line react-hooks/exhaustive-deps
  }, [billing.allTransportationBills]);

  useEffect(() => {
    let data;
    if (disable === 1) {
      dispatch({ type: "TOGGLE_PAGE_NO_SEARCH_VALUE", payload: 1 });
    }
    data = {
      from: billing.from,
      to: billing.to,
      client: name === "Client Name" ? filterType : billing.client,
      location: localStorage.getItem("location")
        ? localStorage.getItem("location")
        : null,
      site: localStorage.getItem("site") ? localStorage.getItem("site") : null,
      bl_no: "",
      do_no: "",
      container_no: billing.container_no,
      is_rejected: "False",
      pg_no: disable === 1 ? 1 : store.stocksAndAllotmentSearch.pg_no,
      on_page_data: store.stocksAndAllotmentSearch.on_page_data,
    };
    dispatch(getTransportationBilling(data));
  
// eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    store.stocksAndAllotmentSearch.pg_no,
    store.stocksAndAllotmentSearch.on_page_data,
  ]);

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

  const useStyles = makeStyles((theme) => ({
    pdHorizontal: {
      paddingLeft: ui.drawerOpen ? 0 : "160px",
      paddingRight: ui.drawerOpen ? 0 : 160,
      [theme.breakpoints.down("sm")]: {
        paddingLeft: 0,
        paddingRight: 0,
      },
    },
    paperContainer: {
      padding: theme.spacing(2, 3),
    },
    input: {
      padding: 7,
      borderColor: "black",
      "& .MuiInputBase-input": {
        width: "400px",
      },
    },
    button: {
      background: "lightgreen",
      border: "1px solid green",
      color: "green",
      "&:hover": {
        cursor: "pointer",
        background: "lightgreen",
        border: "1px solid green",
        color: "green",
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
      width: "45%",
      "& .MuiPaper-root.MuiMenu-paper.MuiPopover-paper.MuiPaper-elevation8.MuiPaper-rounded":
        {
          marginTop: "123px !important",
        },
      [theme.breakpoints.down("xs")]: {
        height: 35,
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
      width: "80%",
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

  const classes = useStyles();

  const handleInvoice = () => {
    let req = {
      pk_list: clientMaster.check,
      bl_no: "",
      do_no: "",
      location: localStorage.getItem("location")
        ? localStorage.getItem("location")
        : null,
      site: localStorage.getItem("site") ? localStorage.getItem("site") : null,
    };
    dispatch(collectInvoice(req, history));
  };

  const rejectInvoiceBill = () => {
    let request = {
      pk_list: clientMaster.check,
    };
    dispatch(rejectInvoice(request, notify));
    dispatch({ type: "CLEAR_CHECKBOX" });
  };

  const Columns = [
    {
      width: 50,
      style: {
        textAlign: "center",
      },
      Cell: (row) => {
        return (
          <div>
            <Checkbox id={row.original.pk} value={row.original.pk} />
          </div>
        );
      },
    },
    {
      Header: (
        <b style={{ color: "#2A5FA5" }}>
          Client Name
          <FontAwesomeIcon icon={faSort} />
        </b>
      ),
      accessor: "client",
      style: {
        textAlign: "center",
      },
      Cell: (row) => {
        return (
          <div>
            <span title={row.original}>{row.original.client}</span>
          </div>
        );
      },
    },
    {
      Header: (
        <b style={{ color: "#2A5FA5" }}>
          Party Name <FontAwesomeIcon icon={faSort} />
        </b>
      ),
      accessor: "party",
      style: {
        textAlign: "left",
      },
      Cell: (row) => {
        return (
          <div>
            <span title={row.original.remarks}>{row.original.party}</span>
          </div>
        );
      },
    },
    {
      Header: (
        <b style={{ color: "#2A5FA5" }}>
          Container Number <FontAwesomeIcon icon={faSort} />
        </b>
      ),
      accessor: "container_no",
      style: {
        textAlign: "left",
      },
      Cell: (row) => {
        return (
          <div>
            <span title={row.original.remarks}>
              {row.original.container_no}
            </span>
          </div>
        );
      },
    },
    {
      Header: (
        <b style={{ color: "#2A5FA5" }}>
          Size Type <FontAwesomeIcon icon={faSort} />
        </b>
      ),
      accessor: "size_type",
      style: {
        textAlign: "left",
      },
      Cell: (row) => {
        return (
          <div>
            <span title={row.original.remarks}>{row.original.size_type}</span>
          </div>
        );
      },
    },
    {
      Header: (
        <b style={{ color: "#2A5FA5" }}>
          Line-In Charges <FontAwesomeIcon icon={faSort} />
        </b>
      ),
      accessor: "line_in_charges",
      style: {
        textAlign: "left",
      },
      Cell: (row) => {
        return (
          <div>
            <span title={row.original.remarks}>
              {row.original.line_in_charges}
            </span>
          </div>
        );
      },
    },
    {
      Header: (
        <b style={{ color: "#2A5FA5" }}>
          Line-Out Charges <FontAwesomeIcon icon={faSort} />
        </b>
      ),
      accessor: "line_out_charges",
      style: {
        textAlign: "left",
      },
      Cell: (row) => {
        return (
          <div>
            <span title={row.original.remarks}>
              {row.original.line_out_charges}
            </span>
          </div>
        );
      },
    },
    {
      Header: (
        <b style={{ color: "#2A5FA5" }}>
          Party-In Charges <FontAwesomeIcon icon={faSort} />
        </b>
      ),
      accessor: "party_in_charges",
      style: {
        textAlign: "left",
      },
      Cell: (row) => {
        return (
          <div>
            <span title={row.original.remarks}>
              {row.original.party_in_charges}
            </span>
          </div>
        );
      },
    },
    {
      Header: (
        <b style={{ color: "#2A5FA5" }}>
          Party-Out Charges <FontAwesomeIcon icon={faSort} />
        </b>
      ),
      accessor: "party_out_charges",
      style: {
        textAlign: "left",
      },
      Cell: (row) => {
        return (
          <div>
            <span title={row.original.remarks}>
              {row.original.party_out_charges}
            </span>
          </div>
        );
      },
    },
  ];
  const updateName = (event) => {
    setFilterType("");
    dispatch({ type: "SET_BILLING_CLIENT", payload: "" });
    dispatch({ type: "SET_BILLING_CONTAINER", payload: "" });
    dispatch({ type: "RESET_STOCK_ALLOTMENT_DATA" });
    setName(event.target.value);
  };
  const getData = () => {
    let data = {
      from: billing.from,
      to:billing.to,
      client: billing?.client,
      location: localStorage.getItem("location")
        ? localStorage.getItem("location")
        : null,
      site: localStorage.getItem("site") ? localStorage.getItem("site") : null,
      container_no:billing?.container_no,
      bl_no: "",
      do_no: "",
      is_rejected: "False",
      pg_no: 1,
      on_page_data: store.stocksAndAllotmentSearch.on_page_data,
    };
    dispatch(getTransportationBilling(data));
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
        from: billing.from,
        to: billing.to,
        client: billing?.client,
        location: localStorage.getItem("location")
          ? localStorage.getItem("location")
          : null,
        site: localStorage.getItem("site")
          ? localStorage.getItem("site")
          : null,
        container_no: billing?.container_no,
        bl_no: "",
        do_no: "",
        is_rejected: "False",
        pg_no: 1,
        on_page_data: store.stocksAndAllotmentSearch.on_page_data,
      };
      dispatch(getTransportationBilling(data));
    }
  };

  return (
    <div className={classes.pdHorizontal}>
      <Grid container>
        <Grid item xs={12}>
          <Grid
            style={{
              display: "flex",
              width: "50%",
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
                  <MenuItem value={"Container Number"}>
                    &nbsp; &nbsp;&nbsp;Container Number
                  </MenuItem>
                  <MenuItem value={"Client"}>
                    &nbsp; &nbsp;&nbsp;Client
                  </MenuItem>
                </Select>
                <InputBase
                  className={classes.input}
                  placeholder={`Search ${name}`}
                  inputProps={{ "aria-label": "search" }}
                  value={filterType}
                  onChange={setDispatchType}
                  autoComplete="off"
                  onKeyDown={handleKeyDown}
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
                Advanced Search&nbsp; &nbsp;&nbsp; &nbsp;
                <SearchIcon />
              </Button>
            </Grid>
          </Grid>

          <Modal open={open} onClose={handleClose}>
            <Box className={classes.modalPopUp}>
              <Grid className={classes.clearIcon}>
                {" "}
                <ClearIcon onClick={handleClose} />
              </Grid>
              <TransportationSearch handleClose={handleClose} />
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
              <Typography>Transportation</Typography>
              {clientMaster.check.length !== 0 &&
                (billing.is_rejected === "False" ? (
                  <>
                    <Button className={classes.button} onClick={handleInvoice}>
                      Collect Invoice Bills
                    </Button>
                    <Button
                      className={classes.button2}
                      onClick={rejectInvoiceBill}
                    >
                      Reject Invoice Bills
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      className={classes.button3}
                      onClick={rejectInvoiceBill}
                    >
                      Accept Invoice Bills
                    </Button>
                  </>
                ))}
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
                  className={classes.pagination}
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
  );
};

export default Transportation;