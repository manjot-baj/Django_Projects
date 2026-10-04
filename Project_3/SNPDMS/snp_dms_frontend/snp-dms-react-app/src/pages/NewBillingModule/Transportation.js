import React, { useState, useEffect } from "react";
import {
  makeStyles,
  Typography,
  Grid,
  Button,
  TextField,
  MenuItem,
  Paper,
  Checkbox,
  FormControlLabel,
  Radio,
  useMediaQuery,
} from "@material-ui/core";

import { useDispatch, useSelector } from "react-redux";
import { useSnackbar } from "notistack";
import {
  getNewBilling,
  collectInvoiceNew,
} from "../../actions/NewBillingActions";
import { useHistory } from "react-router-dom";
import PreviousIcon from "@material-ui/icons/ArrowBack";
import NextIcon from "@material-ui/icons/ArrowForward";
import ReactTable from "react-table-v6";
import "react-table-v6/react-table.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSort } from "@fortawesome/free-solid-svg-icons";
import RefreshIcon from "@material-ui/icons/Refresh";
import DatePickerField from "../../components/reusableComponents/DatePickerField";
import Autocomplete from "@material-ui/lab/Autocomplete";
import { dropDownDispatch } from "../../actions/GateInActions";
import { theme } from "../../App";
import IconButton from "@material-ui/core/IconButton";

const Transportation = (props) => {
  const dispatch = useDispatch();
  const store = useSelector((state) => state);
  const {  newBilling, gateIn } = store;
  const history = useHistory();
  const [currentPage, setCurrentPage] = useState(1);
  const [disable, setDisable] = useState(1);
  const [stocksAvailableList, setStocksAvailableList] = useState([]);
  const notify = useSnackbar().enqueueSnackbar;
  const [checkAll, setCheckAll] = useState(false);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [customer, setCustomer] = useState("");
  const [selectedRows, setSelectedRows] = useState([]);
  const [containerNo, setContainerNo] = useState("");
  const [clientName, setClientName] = useState("");
  const [refCode, setRefCode] = useState("");
  const [applyCharges, setApplyCharges] = useState(true);
  const matchesIphone = useMediaQuery("(max-width:400px)");
  const matchesIpad = useMediaQuery("(max-width:1024px)");
  const [appendCheckBox, setAppendCheckBox] = useState(false);

  useEffect(() => {
    let reqArray = ["billing_client_customer", "client_ref_codes"];
    dispatch(dropDownDispatch(reqArray, notify));
  
// eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    let tempArray = [];
    newBilling?.allHandlingBillsNew?.length > 0 &&
      newBilling.allHandlingBillsNew.map((row) => {
        let tempObj = {
          isCheck: false,
          pk: row?.pk,
          bill_type: row?.bill_type,
          bill_date: row?.bill_date,
          apply_charge: row?.apply_charge,
          container_no: row?.container_no,
          client: row?.client,
          customer: row?.customer,
          original_amount: row?.original_amount,
          remaining_amount: row?.remaining_amount,
        };
        tempArray.push(tempObj);
      });
    tempArray.map((item, i) => {
      if (selectedRows?.includes(item.pk)) {
        item.isCheck = true;
      }
      return item;
    });
    const allChecked = tempArray.every((item) => item.isCheck);
    setCheckAll(allChecked);
    setStocksAvailableList(tempArray);
 
// eslint-disable-next-line react-hooks/exhaustive-deps
  }, [newBilling?.allHandlingBillsNew]);

  useEffect(() => {
    let data;
    if (disable === 1) {
      dispatch({ type: "GET_NEW_BILLING_PAGE_NO", payload: 1 });
    }
    data = {
      client: newBilling.client,
      container_no: newBilling.container_no,
      customer: newBilling.customer,
      bill_type: "Transportation",
      pg_no: disable === 1 ? 1 : store.newBilling.pg_no,
      on_page_data: store.newBilling.on_page_data,
      location: localStorage.getItem("location")
        ? localStorage.getItem("location")
        : null,
      site: localStorage.getItem("site") ? localStorage.getItem("site") : null,
      ref_code: newBilling.ref_code,
      from_date: newBilling.from_date,
      to_date: newBilling.to_date,
      bill_for_in: newBilling.bill_for_in,
    };
    dispatch(getNewBilling(data,setCurrentPage));
 
// eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    store.newBilling.pg_no,
    store.newBilling.on_page_data,
    newBilling.bill_for_in,
  ]);

  const nextStockPage = () => {
    setCheckAll(false);
    setCurrentPage(Number(currentPage) + 1);
    setDisable(disable + 1);
    dispatch({
      type: "GET_NEW_BILLING_PAGE_NO",
      payload: Number(store.newBilling.pg_no) + 1,
    });
  };

  const prevStockPage = () => {
    setCheckAll(false);
    setCurrentPage(Number(currentPage) - 1);
    setDisable(disable - 1);
    dispatch({
      type: "GET_NEW_BILLING_PAGE_NO",
      payload: Number(store.newBilling.pg_no) - 1,
    });
  };

  const handleCheck = (index, id, val) => {
    if (!selectedRows.includes(id) && val) {
      setSelectedRows([...selectedRows, id]);
    } else {
      const updatedVal = selectedRows.filter((item) => item !== id);
      setSelectedRows(updatedVal);
    }
    const updatedData = [...stocksAvailableList];
    updatedData[index].isCheck = !updatedData[index].isCheck;
    setStocksAvailableList(updatedData);
  };
  const checkAllRows = (val) => {
    const updatedArray = stocksAvailableList.map((item) => ({
      ...item,
      isCheck: val,
    }));
    let array2 = [...selectedRows];
    updatedArray.forEach((item) => {
      if (val === true &&!array2.includes(item.pk)) {
        array2.push(item.pk);
      }else if (val === false && array2.includes(item.pk)) {
        var indexDelete = array2.indexOf(item.pk);
        if (indexDelete > -1) {
          array2.splice(indexDelete, 1);
        }
      }
    });
    setSelectedRows(array2);
    setStocksAvailableList(updatedArray);
    setCheckAll(val);
  };

  const useStyles = makeStyles((theme) => ({
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
    bottom: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
    },

    showModal: {
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
    autocomplete: {
      "& .MuiAutocomplete-inputRoot[class*='MuiOutlinedInput-root']": {
        padding: 0,
      },
    },
    buttonSearch: {
      fontSize: 12.5,
      borderRadius: 6,
      marginLeft: 40,
      marginRight: "auto",
      marginTop: 20,
      width: "15%",
      border: "1.5px solid #FDBD2E",
      boxShadow: "0px 3px 6px #9199A14D",
      backgroundColor: "#FDBD2E",
      color: "#fff",
      "&:hover": {
        backgroundColor: "#FDBD2E",
      },
    },
  }));

  const classes = useStyles();

  const handleInvoice = () => {
    let req = {
      pk_list: selectedRows,
      from_date: newBilling.from_date,
      to_date: newBilling.to_date,
      location: localStorage.getItem("location")
        ? localStorage.getItem("location")
        : null,
      site: localStorage.getItem("site") ? localStorage.getItem("site") : null,
    };
    dispatch({ type: "GET_HANDLING_TRANS_NEW", payload: "Transportation" });
    dispatch(collectInvoiceNew(req, history, notify));
  };

  const Columns = [
    {
      Header: (
        <div>
          {appendCheckBox === false ? (
            ""
          ) : (
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
      style: {
        textAlign: "center",
      },
      Cell: (row) => {
        return (
          <div>
            {appendCheckBox === false ? (
              ""
            ) : (
              <Checkbox
                checked={row.original.isCheck}
                key={row.original.pk}
                onClick={(e) => {
                  handleCheck(row.index, row.original.pk, e.target.checked);
                }}
                style={{ color: "#243545" }}
                inputProps={{ "aria-label": "Checkbox A" }}
              />
            )}
          </div>
        );
      },
    },
    {
      Header: (
        <b style={{ color: "#2A5FA5" }}>
          Bill Date
          <FontAwesomeIcon icon={faSort} />
        </b>
      ),
      accessor: "bill_date",
      style: {
        textAlign: "center",
      },
      Cell: (row) => {
        return (
          <div>
            <span title={row.original}>{row.original.bill_date}</span>
          </div>
        );
      },
    },
    {
      Header: (
        <b style={{ color: "#2A5FA5" }}>
          Container No. <FontAwesomeIcon icon={faSort} />
        </b>
      ),
      accessor: "container_no",
      style: {
        textAlign: "center",
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
          Apply Charge <FontAwesomeIcon icon={faSort} />
        </b>
      ),
      accessor: "apply_charge",
      style: {
        textAlign: "center",
      },
      Cell: (row) => {
        return (
          <div>
            <span title={row.original.remarks}>
              {row.original.apply_charge}
            </span>
          </div>
        );
      },
    },
    {
      Header: (
        <b style={{ color: "#2A5FA5" }}>
          Customers <FontAwesomeIcon icon={faSort} />
        </b>
      ),
      accessor: "customer",
      style: {
        textAlign: "center",
      },
      Cell: (row) => {
        return (
          <div>
            <span title={row.original.remarks}>{row.original.customer}</span>
          </div>
        );
      },
    },
    {
      Header: (
        <b style={{ color: "#2A5FA5" }}>
          Original Amount
          <FontAwesomeIcon icon={faSort} />
        </b>
      ),
      accessor: "original_amount",
      style: {
        textAlign: "center",
      },
      Cell: (row) => {
        return (
          <div>
            <span title={row.original}>{row.original.original_amount}</span>
          </div>
        );
      },
    },
    {
      Header: (
        <b style={{ color: "#2A5FA5" }}>
          Remaining Amount
          <FontAwesomeIcon icon={faSort} />
        </b>
      ),
      accessor: "remaining_amount",
      style: {
        textAlign: "center",
      },
      Cell: (row) => {
        return (
          <div>
            <span title={row.original}>{row.original.remaining_amount}</span>
          </div>
        );
      },
    },
  ];

  const handleFromDateChange = (date) => {
    var selectedDate = new Date(date);
    var dd = String(selectedDate.getDate()).padStart(2, "0");
    var mm = String(selectedDate.getMonth() + 1).padStart(2, "0"); //
    var yyyy = selectedDate.getFullYear();
    var selectedDateFormat = yyyy + "-" + mm + "-" + dd;
    dispatch({
      type: "GET_BILLING_FROM_DATE_NEW",
      payload: selectedDateFormat,
    });
    setFromDate(selectedDateFormat);
  };

  const handleToDateChange = (date) => {
    var selectedDate = new Date(date);
    var dd = String(selectedDate.getDate()).padStart(2, "0");
    var mm = String(selectedDate.getMonth() + 1).padStart(2, "0"); //
    var yyyy = selectedDate.getFullYear();
    var selectedDateFormat = yyyy + "-" + mm + "-" + dd;
    dispatch({ type: "GET_BILLING_TO_DATE_NEW", payload: selectedDateFormat });
    setToDate(selectedDateFormat);
  };

  const handleSearch = () => {
    let data = {
      client: newBilling.client,
      container_no: newBilling.container_no,
      customer: newBilling.customer,
      bill_type: "Transportation",
      pg_no: disable === 1 ? 1 : store.newBilling.pg_no,
      on_page_data: store.newBilling.on_page_data,
      location: localStorage.getItem("location")
        ? localStorage.getItem("location")
        : null,
      site: localStorage.getItem("site") ? localStorage.getItem("site") : null,
      ref_code: newBilling.ref_code,
      from_date: newBilling.from_date,
      to_date: newBilling.to_date,
      bill_for_in: newBilling.bill_for_in,
    };
    dispatch(getNewBilling(data, setCurrentPage));
    dispatch({
      type: "GET_NEW_BILLING_PAGE_NO",
      payload: 1,
    });
    setSelectedRows([]);
    setAppendCheckBox(true);
  };

  const selectCount = selectedRows?.length;
  return (
    <div>
      <Grid container>
        <Grid item xs={12}>
          <Grid
            style={{
              display: matchesIphone  ? "grid" : "flex",
              gridTemplateColumns:"auto",
              width: matchesIphone ? "100%" : "",
              padding: matchesIphone ? "0px 40px" : "0px 40px",
              alignItems: "center",
            }}
          >
            <Grid
              item
            xs={12}
              md={6}
              sm={2}
              lg={2}
              style={
                theme.breakpoints.down("sm") && {
                  marrgin: 7,
                  marginTop: "20px",
                }
              }
            >
              <Typography
                variant="subtitle1"
                className={classes.LabelTypography}
               style={{fontSize:'14px'}}
              >
                Selected Count
              </Typography>
            </Grid>
            <Grid
              item
            xs={12}
              md={6}
              sm={1}
              lg={1}
              style={
                theme.breakpoints.down("sm") && {
                  padding: 7,
                  marginTop: "20px",
                }
              }
            >
              <TextField
                id="client-handling-state-code"
                value={selectCount}
                variant="outlined"
                disabled
                size="small"
                style={{ width: "50px", padding: "0px" }}
              />
            </Grid>
            <Grid
              item
            xs={12}
              md={6}
              sm={3}
              lg={3}
              style={theme.breakpoints.down("sm") && { padding: 7 }}
            >
              <Typography
                variant="subtitle1"
                className={classes.LabelTypography}
               style={{fontSize:'14px'}}
              >
                From Date
              </Typography>

              <DatePickerField
                dateId="from-date"
                dateValue={fromDate}
                dateChange={handleFromDateChange}
              />
            </Grid>
            <Grid
              item
            xs={12}
              md={6}
              sm={3}
              lg={3}
              style={theme.breakpoints.down("sm") && { padding: 7 }}
            >
              <Typography
                variant="subtitle1"
                className={classes.LabelTypography}
               style={{fontSize:'14px'}}
              >
                To Date
              </Typography>

              <DatePickerField
                dateId="to-date"
                dateValue={toDate}
                dateChange={handleToDateChange}
              />
            </Grid>
            <Grid
              item
            xs={12}
              md={6}
              sm={6}
              lg={3}
              style={theme.breakpoints.down("sm") && { padding: 7 }}
            >
              <Typography
                variant="subtitle1"
                className={classes.LabelTypography}
               style={{fontSize:'14px'}}
              >
                Customer
              </Typography>
              <Autocomplete
                value={customer}
                onChange={(event, newValue) => {
                  setCustomer(newValue);
                }}
                style={{ padding: 0 }}
                className={classes.autocomplete}
                options={
                  (gateIn.allDropDown &&
                    gateIn.allDropDown.customer &&
                    gateIn.allDropDown.customer.map((option) => option)) ||
                  []
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    variant="outlined"
                    className={classes.textField}
                    onBlur={(e) => {
                      setCustomer(e.target.value);
                      dispatch({
                        type: "GET_BILLING_CUSTOMER_NO_NEW",
                        payload: e.target.value,
                      });
                    }}
                    fullWidth
                  />
                )}
              />
            </Grid>
            <Grid
              item
              xs={12}
              sm={6}
              lg={3}
              style={theme.breakpoints.down("sm") && { padding: 7 }}
            >
              <Typography
                variant="subtitle1"
                className={classes.LabelTypography}
               style={{fontSize:'14px'}}
              >
                Container No
              </Typography>

              <TextField
                id="container-number"
                value={containerNo}
                variant="outlined"
                fullWidth
                inputProps={{ className: classes.input }}
                onChange={(e) => {
                  setContainerNo(e.target.value);
                  dispatch({
                    type: "GET_BILLING_CONTAINER_NO_NEW",
                    payload: e.target.value,
                  });
                }}
              />
            </Grid>
            {gateIn.allDropDown && gateIn.allDropDown.client && (
              <Grid
                item
              xs={12}
                md={6}
                sm={6}
                lg={3}
                style={theme.breakpoints.down("sm") && { padding: 7 }}
              >
                <Typography
                  variant="subtitle1"
                  className={classes.LabelTypography}
                 style={{fontSize:'14px'}}
                >
                  Client
                </Typography>
                <Autocomplete
                  value={clientName}
                  onChange={(event, newValue) => {
                    setClientName(newValue);
                  }}
                  style={{ padding: 0 }}
                  className={classes.autocomplete}
                  options={gateIn.allDropDown.client.map((option) => option)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      variant="outlined"
                      className={classes.textField}
                      onBlur={(e) => {
                        setClientName(e.target.value);
                        dispatch({
                          type: "GET_BILLING_CLIENT_NEW",
                          payload: e.target.value,
                        });
                      }}
                      fullWidth
                    />
                  )}
                />
              </Grid>
            )}
            {gateIn.allDropDown && gateIn.allDropDown.client_ref_codes && (
              <Grid
                item
              xs={12}
                md={6}
                sm={6}
                lg={3}
                style={theme.breakpoints.down("sm") && { padding: 7 }}
              >
                <Typography
                  variant="subtitle1"
                  className={classes.LabelTypography}
                 style={{fontSize:'14px'}}
                >
                  Ref Code
                </Typography>
                <Autocomplete
                  value={refCode}
                  onChange={(event, newValue) => {
                    setRefCode(newValue);
                  }}
                  style={{ padding: 0 }}
                  className={classes.autocomplete}
                  options={gateIn.allDropDown.client_ref_codes.map(
                    (option) => option
                  )}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      variant="outlined"
                      className={classes.textField}
                      onBlur={(e) => {
                        setRefCode(e.target.value);
                        dispatch({
                          type: "GET_BILLING_REF_CODE_NEW",
                          payload: e.target.value,
                        });
                      }}
                      fullWidth
                    />
                  )}
                />
              </Grid>
            )}
            <Button
              className={classes.buttonSearch}
              onClick={handleSearch}
              style={{
                width: "matchesIpad" ? "250px" : "250px",
                marginLeft: matchesIpad ? "10px" : "0px",
              }}
            >
              Search
            </Button>
          </Grid>

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
                justifyContent:
                  matchesIpad || matchesIphone ? "" : "space-between",
                alignItems: "center",
                padding: "20px 30px",
                width: "100%",
              }}
            >
             
              <Grid
                item
                sm={12}
                md={6}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-around",
                  padding: "2px 10px 8px 0px",
                }}
              >
                <Typography variant="subtitle2">Bill For</Typography>
              
                <FormControlLabel
                  value="yes"
                  control={
                    <Radio
                      style={{ color: "#2A5FA5" }}
                      checked={applyCharges === true}
                      onClick={() => {
                        setApplyCharges(true);
                        dispatch({
                          type: "GET_BILLING_BILL_FOR_NEW",
                          payload: true,
                        });
                      }}
                    />
                  }
                  label="IN"
                />
                <FormControlLabel
                  value="no"
                  control={
                    <Radio
                      style={{ color: "#2A5FA5" }}
                      checked={applyCharges === false}
                      onClick={() => {
                        setApplyCharges(false);
                        dispatch({
                          type: "GET_BILLING_BILL_FOR_NEW",
                          payload: false,
                        });
                      }}
                    />
                  }
                  label="OUT"
                />
                  <FormControlLabel
                  value=""
                  control={
                    <Radio
                      style={{ color: "#2A5FA5" }}
                      checked={applyCharges === ""}
                      onClick={() => {
                        setApplyCharges("");
                        dispatch({
                          type: "GET_BILLING_BILL_FOR_NEW",
                          payload: "",
                        });
                      }}
                    />
                  }
                  label="Both"
                />
              </Grid>
              {stocksAvailableList.some((item) => item.isCheck) && (
                <div>
                  <>
                    <Button className={classes.button} onClick={handleInvoice}>
                      Collect Invoice Bills
                    </Button>
                  </>
                </div>
              )}
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
              minRows={store.newBilling.on_page_data}
              collapseOnDataChange={false}
              style={{
                height: matchesIphone ? "" : "300px", // This will force the table body to overflow and scroll, since there is not enough room
              }}
              showPagination={false}
              defaultPageSize={100}
            />

            {/****************************Pagination********************************/}
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
                    store.newBilling.pg_no === 1 ||
                    store.newBilling.pg_no === "1"
                      ? true
                      : false
                  }
                >
                  <PreviousIcon
                    style={{
                      fill:
                        store.newBilling.pg_no === 1 ||
                        store.newBilling.pg_no === "1"
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
                    store.newBilling.pg_no === 1 ||
                    store.newBilling.pg_no === "1"
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
                  value={currentPage}
                  onChange={(e) => {
                    if (e.target.value > newBilling.total_pages) {
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
                      e.target.value > newBilling.total_pages
                    ) {
                      notify("Invalid value entered", {
                        variant: "warning",
                      });
                      setCurrentPage(1);
                      dispatch({
                        type: "GET_NEW_BILLING_PAGE_NO",
                        payload: 1,
                      });
                    } else {
                      setCurrentPage(e.target.value);
                      dispatch({
                        type: "GET_NEW_BILLING_PAGE_NO",
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
                  {newBilling.total_pages}
                </Typography>
              </Grid>
              <TextField
                id="client-master-code"
                select
                value={store.newBilling.on_page_data}
                variant="outlined"
                inputProps={{ className: classes.input }}
                onChange={(e) => {
                  setCurrentPage(1);
                  dispatch({
                    type: "GET_NEW_BILLING_PAGE_NO",
                    payload: 1,
                  });
                  dispatch({
                    type: "GET_NEW_BILLING_ON_PAGE_DATA",
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
                  disabled={newBilling.next_page === "" ? true : false}
                >
                  <NextIcon
                    style={{
                      fill: newBilling.nextPage === "" ? "gray" : "#243545",
                    }}
                  />
                </IconButton>
              ) : (
                <Button
                  variant="contained"
                  endIcon={<NextIcon />}
                  color="secondary"
                  onClick={nextStockPage}
                  disabled={newBilling.next_page === "" ? true : false}
                >
                  Next
                </Button>
              )}
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </div>
  );
};

export default Transportation;
