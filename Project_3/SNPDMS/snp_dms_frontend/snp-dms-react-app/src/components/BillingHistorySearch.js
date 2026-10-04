import React, { useEffect, useState } from "react";
import {
  makeStyles,
  Typography,
  Paper,
  TextField,
  MenuItem,
  Grid,
  Box,
  Button,
} from "@material-ui/core";

import { useDispatch, useSelector } from "react-redux";
import DatePickerField from "./reusableComponents/DatePickerField";
import { dropDownDispatch } from "../actions/GateInActions";
import Autocomplete from "@material-ui/lab/Autocomplete";
import { theme } from "../App";
import { getInvoiceHistory } from "../actions/BillingActions";
import { useSnackbar } from "notistack";

const useStyles = makeStyles((theme) => ({
  paperContainer: {
    padding: theme.spacing(4, 3),
  },
  input: {
    padding: 7,
  },
  choiceSelectContainer: {
    border: "1px solid #243545",
    marginTop: "0rem",
    display: "flex",
    borderRadius: 6,
  },
  choice: {
    backgroundColor: "#fff",
    width: "100%",
    padding: 1,
  },
  selectedChoice: {
    borderRadius: 5,
    color: "#fff",
    backgroundColor: "#2F6FB7",
    width: "100%",
    padding: 1,
    "&:hover": {
      backgroundColor: "#2F6FB7",
    },
  },
  LabelTypography: {
    fontSize: 14,
    fontWeight: 600,
    color: "#243545",
    paddingBottom: 4,
    [theme.breakpoints.down("sm")]: {
      // padding: "1px 4px",
      paddingBottom: 1,
    },
  },
  button: {
    fontSize: 12.5,
    borderRadius: 6,
    marginLeft: "auto",
    marginRight: "auto",
    marginTop: 20,
    width: "35%",
    border: "1.5px solid #FDBD2E",
    boxShadow: "0px 3px 6px #9199A14D",
    backgroundColor: "#FDBD2E",
    color: "#fff",
    "&:hover": {
      backgroundColor: "#FDBD2E",
    },
  },
  button2: {
    fontSize: 12.5,
    borderRadius: 6,
    marginLeft: "auto",
    marginRight: "auto",
    marginTop: 20,
    width: "35%",
    border: "1.5px solid #2A5FA5",
    boxShadow: "0px 3px 6px #9199A14D",
    backgroundColor: "#fff",
    color: "#2A5FA5",
    "&:hover": {
      backgroundColor: "#fff",
    },
  },
  autocomplete: {
    "& .MuiAutocomplete-inputRoot[class*='MuiOutlinedInput-root']": {
      padding: 0,
    },
  },
}));

export default function BillingHistorySearch(props) {
  const classes = useStyles();
  const dispatch = useDispatch();
  const notify = useSnackbar().enqueueSnackbar;
  const store = useSelector((state) => state);
  const { gateIn } = store;
  const [containerNumber, setContainerNumber] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [invoiceFromDate, setInvoiceFromDate] = useState("");
  const [invoiceToDate, setInvoiceToDate] = useState("");
  const [chargeType, setChargeType] = useState("");
  const [clientName, setClientName] = useState("");

  useEffect(() => {
    let reqArray = ["location_site_dashboard_list", "client_data"];
    dispatch(dropDownDispatch(reqArray, notify));
  }, []);

  const handleSearch = () => {
    let data = {
      client: clientName,
      charge_type: chargeType,
      invoice_date: { from: invoiceFromDate, to: invoiceToDate },
      container_no: containerNumber,
      invoice_no: invoiceNumber,
      location: localStorage.getItem("location") ? localStorage.getItem("location") : null,
      site: localStorage.getItem("site") ? localStorage.getItem("site") : null,
      pg_no: 1,
      on_page_data: store.stocksAndAllotmentSearch.on_page_data,
    };
    dispatch(getInvoiceHistory(data));
    props.handleClose();
  };

  const handleInvoiceFromChange = (date) => {
    var selectedDate = new Date(date);
    var dd = String(selectedDate.getDate()).padStart(2, "0");
    var mm = String(selectedDate.getMonth() + 1).padStart(2, "0"); //
    var yyyy = selectedDate.getFullYear();
    var selectedDateFormat = yyyy + "-" + mm + "-" + dd;
    setInvoiceFromDate(selectedDateFormat);
  };

  const handleInvoiceToChange = (date) => {
    var selectedDate = new Date(date);
    var dd = String(selectedDate.getDate()).padStart(2, "0");
    var mm = String(selectedDate.getMonth() + 1).padStart(2, "0"); //
    var yyyy = selectedDate.getFullYear();
    var selectedDateFormat = yyyy + "-" + mm + "-" + dd;
    setInvoiceToDate(selectedDateFormat);
  };


  const mapped =
    gateIn.allDropDown &&
    gateIn.allDropDown.client_data &&
    gateIn.allDropDown.client_data.map((obj) => obj.name);
  const filtered =
    mapped && mapped.filter((type, index) => mapped.indexOf(type) === index);

  return (
    <div>
      <Typography variant="subtitle2">
        <Box fontWeight="fontWeightBold" m={1}>
          Billing History Search
        </Box>
      </Typography>
      <Paper className={classes.paperContainer} elevation={0}>
        <Grid container spacing={3}>
        {gateIn.allDropDown && filtered && (
            <Grid item xs={6} sm={4}>
              <Typography
                variant="subtitle1"
                className={classes.LabelTypography}
              >
                Client Name
              </Typography>

              <Autocomplete
                value={clientName}
                onChange={(event, newValue) => {
                  setClientName(newValue);
                }}
                style={{ padding: 0 }}
                className={classes.autocomplete}
                options={filtered.map((option) => option)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    variant="outlined"
                    className={classes.textField}
                    onBlur={(e) => {
                      setClientName(e.target.value);
                      dispatch({ type: "SET_BILLING_CLIENT", payload: e.target.value });
                    }}
                    fullWidth
                  />
                )}
              />
            </Grid>
          )}
          <Grid
            item
            xs={12}
            sm={6}
            lg={3}
            style={theme.breakpoints.down("sm") && { padding: 7 }}
          >
            <Typography variant="subtitle1" className={classes.LabelTypography}>
              Container Number
            </Typography>

            <TextField
              id="container-number"
              value={containerNumber}
              variant="outlined"
              fullWidth
              inputProps={{ className: classes.input }}
              onChange={(e) => {
                setContainerNumber(e.target.value);
              }}
            />
          </Grid>
          <Grid
            item
            xs={12}
            sm={6}
            lg={3}
            style={theme.breakpoints.down("sm") && { padding: 7 }}
          >
            <Typography variant="subtitle1" className={classes.LabelTypography}>
              Invoice Number
            </Typography>

            <TextField
              id="invoice-number"
              value={invoiceNumber}
              variant="outlined"
              fullWidth
              inputProps={{ className: classes.input }}
              onChange={(e) => {
                setInvoiceNumber(e.target.value);
              }}
            />
          </Grid>
          <Grid
            item
            xs={12}
            sm={6}
            lg={3}
            style={theme.breakpoints.down("sm") && { padding: 7 }}
          >
            <Typography variant="subtitle1" className={classes.LabelTypography}>
              Charge Type
            </Typography>

            <TextField
              id="charge-type"
              select
              value={chargeType}
              variant="outlined"
              fullWidth
              inputProps={{ className: classes.input }}
              onChange={(e) => {
                setChargeType(e.target.value);
                dispatch({
                  type: "SET_BILLING_HISTORY_CHARGE_TYPE",
                  payload: e.target.value,
                });
              }}
            >
              <MenuItem key={"Handling"} value={"Handling"}>
                Handling
              </MenuItem>
              <MenuItem key={"Transportation"} value={"Transportation"}>
                Transportation
              </MenuItem>
              <MenuItem key={"Repair"} value={"Repair"}>
                Repair
              </MenuItem>
            </TextField>
          </Grid>
          <Grid
            item
            xs={12}
            sm={6}
            lg={3}
            style={theme.breakpoints.down("sm") && { padding: 7 }}
          >
            <Typography variant="subtitle1" className={classes.LabelTypography}>
              Invoice From Date
            </Typography>
            <DatePickerField
              dateId="invoice-from-date"
              dateValue={invoiceFromDate}
              dateChange={handleInvoiceFromChange}
              dispatchType={"SET_STOCK_ALLOT_SEARCH_INVOICEFROM_DATE"}
            />
          </Grid>
          <Grid
            item
            xs={12}
            sm={6}
            lg={3}
            style={theme.breakpoints.down("sm") && { padding: 7 }}
          >
            <Typography variant="subtitle1" className={classes.LabelTypography}>
              Invoice To Date
            </Typography>

            <DatePickerField
              dateId="invoice-to-date"
              dateValue={invoiceToDate}
              dateChange={handleInvoiceToChange}
              dispatchType={"SET_STOCK_ALLOT_SEARCH_INVOICETO_DATE"}
            />
          </Grid>
          <Grid
            container
            spacing={3}
            style={{
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Grid
              item
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                width: "100%",
                marginTop: "20px",
              }}
            >
              <Button className={classes.button} onClick={handleSearch}>
                Search
              </Button>
            </Grid>
          </Grid>
        </Grid>
      </Paper>
    </div>
  );
}
