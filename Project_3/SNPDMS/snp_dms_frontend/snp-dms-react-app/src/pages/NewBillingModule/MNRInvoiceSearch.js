import React, { useEffect, useState } from "react";
import {
  makeStyles,
  Typography,
  Paper,
  TextField,
  Grid,
  Box,
  Button,
} from "@material-ui/core";

import { useDispatch, useSelector } from "react-redux";
import DatePickerField from "../../components/reusableComponents/DatePickerField";
import { dropDownDispatch } from "../../actions/GateInActions";
import Autocomplete from "@material-ui/lab/Autocomplete";
import { theme } from "../../App";
import { getAllMNRHistoryAction } from "../../actions/NewBillingActions";
import { useSnackbar } from "notistack";
import { NEWBILLING_REDUCER } from "../../reducers/NewBillingReducer";

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

export default function MNRInvoiceSearch(props) {
  const classes = useStyles();
  const dispatch = useDispatch();
  const notify = useSnackbar().enqueueSnackbar;
  const store = useSelector((state) => state);
  const { gateIn } = store;
  const [containerNumber, setContainerNumber] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [invoiceFromDate, setInvoiceFromDate] = useState("");
  const [invoiceToDate, setInvoiceToDate] = useState("");
  // eslint-disable-next-line no-unused-vars
  const [chargeType, setChargeType] = useState("");
  const [clientName, setClientName] = useState("");

  useEffect(() => {
    let reqArray = ["location_site_dashboard_list", "client_data"];
    dispatch(dropDownDispatch(reqArray, notify));

// eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = () => {
    dispatch({
      type:NEWBILLING_REDUCER.GET_ALL_MNR_HISTORY,
      payload:{
          pg_no: 1,
      }
  })
  props.setCurrentPage(1)
    dispatch(getAllMNRHistoryAction("",notify));
    props.handleClose();
  };

  const handleInvoiceFromChange = (date) => {
    var selectedDate = new Date(date);
    var dd = String(selectedDate.getDate()).padStart(2, "0");
    var mm = String(selectedDate.getMonth() + 1).padStart(2, "0"); //
    var yyyy = selectedDate.getFullYear();
    var selectedDateFormat = yyyy + "-" + mm + "-" + dd;
    dispatch({
        type:NEWBILLING_REDUCER.GET_ALL_MNR_HISTORY,
        payload:{
            invoice_date: {
                from: selectedDateFormat,
                to: invoiceToDate
            },
        }
    })
    setInvoiceFromDate(selectedDateFormat);
  };

  const handleInvoiceToChange = (date) => {
    var selectedDate = new Date(date);
    var dd = String(selectedDate.getDate()).padStart(2, "0");
    var mm = String(selectedDate.getMonth() + 1).padStart(2, "0"); //
    var yyyy = selectedDate.getFullYear();
    var selectedDateFormat = yyyy + "-" + mm + "-" + dd;
    dispatch({
        type:NEWBILLING_REDUCER.GET_ALL_MNR_HISTORY,
        payload:{
            invoice_date: {
                from:invoiceFromDate,
                to: selectedDateFormat
            },
        }
    })
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
          MNR Invoice Search
        </Box>
      </Typography>
      <Paper className={classes.paperContainer} elevation={0}>
        <Grid container spacing={3}>
          {gateIn.allDropDown && filtered && (
            <Grid item xs={6} sm={3} lg={3}>
              <Typography
                variant="subtitle1"
                className={classes.LabelTypography}
                style={{ marginTop: "-8px" }}
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
                      dispatch({
                        type:NEWBILLING_REDUCER.GET_ALL_MNR_HISTORY,
                        payload:{
                            client:e.target.value
                        }
                    })
                   
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
                dispatch({
                    type:NEWBILLING_REDUCER.GET_ALL_MNR_HISTORY,
                    payload:{
                        container_no:e.target.value
                    }
                })
                // dispatch({
                //   type: "GET_BILLING_CONTAINER_NO_NEW",
                //   payload: e.target.value,
                // });
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
                dispatch({
                    type:NEWBILLING_REDUCER.GET_ALL_MNR_HISTORY,
                    payload:{
                        invoice_no:e.target.value
                    }
                })
           
              }}
            />
          </Grid>
          {/* <Grid
            item
            xs={12}
            sm={6}
            lg={3}
            style={theme.breakpoints.down("sm") && { padding: 7 }}
          >
            <Typography variant="subtitle1" className={classes.LabelTypography}>
              Bill Type
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
                  type: "GET_BILLING_BILL_TYPE_NEW",
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
              <MenuItem key={"Night Charge"} value={"Night Charge"}>
                Night Charge
              </MenuItem>
            </TextField>
          </Grid> */}
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
