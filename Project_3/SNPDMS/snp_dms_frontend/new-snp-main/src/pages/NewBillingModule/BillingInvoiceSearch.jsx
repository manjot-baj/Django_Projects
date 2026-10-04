import React, { useEffect, useState } from "react";
import {
  Typography,
  Paper,
  TextField,
  MenuItem,
  Grid,
  Box,
  Button,
  Autocomplete,
  Stack,
} from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import DatePickerField from "@components/reusablecomponents/DatePickerField";
import { dropDownDispatch } from "../../actions/GateInActions";
import {
  downloadExcelInvoiceNewBilling,
  getInvoiceNewBilling,
} from "../../actions/NewBillingActions";
import { useSnackbar } from "notistack";
import { customLabelTypography } from "../../utils/CustomClasses";

export default function BillingInvoiceSearch(props) {
  const dispatch = useDispatch();
  const notify = useSnackbar().enqueueSnackbar;
  const store = useSelector((state) => state);
  const { gateIn, newBilling } = store;
  const [containerNumber, setContainerNumber] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [invoiceFromDate, setInvoiceFromDate] = useState("");
  const [invoiceToDate, setInvoiceToDate] = useState("");
  const [chargeType, setChargeType] = useState("");
  const [clientName, setClientName] = useState("");

  useEffect(() => {
    let reqArray = ["location_site_dashboard_list", "client_data"];
    dispatch(dropDownDispatch(reqArray, notify));
    setClientName(newBilling.client);
    setContainerNumber(newBilling.container_no);
    setInvoiceNumber(newBilling.invoice_no);
    setChargeType(newBilling.bill_type);
    setInvoiceFromDate(newBilling.invoice_date.from);
    setInvoiceToDate(newBilling.invoice_date.to);
  }, []);

  const handleDownloadExcel = () => {
    if (clientName !== "") {
      dispatch({
        type: "GET_BILLING_CLIENT_NEW",
        payload: clientName,
      });
    }
    if (containerNumber !== "") {
      dispatch({
        type: "GET_BILLING_CONTAINER_NO_NEW",
        payload: containerNumber,
      });
    }
    if (invoiceNumber !== "") {
      dispatch({
        type: "GET_BILLING_INVOICE_NO_NEW",
        payload: invoiceNumber,
      });
    }
    if (chargeType !== "") {
      dispatch({
        type: "GET_BILLING_BILL_TYPE_NEW",
        payload: chargeType,
      });
    }
    if (invoiceFromDate !== "" && invoiceToDate !== "") {
      dispatch({
        type: "GET_BILLING_NEW_INVOICE_DATE_FROM",
        payload: invoiceFromDate,
      });

      dispatch({
        type: "GET_BILLING_NEW_INVOICE_DATE_TO",
        payload: invoiceToDate,
      });
    }
    dispatch(downloadExcelInvoiceNewBilling(notify));
    dispatch({
      type: "GET_NEW_BILLING_PAGE_NO",
      payload: 1,
    });
     props.handleClose();
  };

  const handleSearch = () => {
    if (clientName !== "") {
      dispatch({
        type: "GET_BILLING_CLIENT_NEW",
        payload: clientName,
      });
    }
    if (containerNumber !== "") {
      dispatch({
        type: "GET_BILLING_CONTAINER_NO_NEW",
        payload: containerNumber,
      });
    }
    if (invoiceNumber !== "") {
      dispatch({
        type: "GET_BILLING_INVOICE_NO_NEW",
        payload: invoiceNumber,
      });
    }
    if (chargeType !== "") {
      dispatch({
        type: "GET_BILLING_BILL_TYPE_NEW",
        payload: chargeType,
      });
    }
    if (invoiceFromDate !== "" && invoiceToDate !== "") {
      dispatch({
        type: "GET_BILLING_NEW_INVOICE_DATE_FROM",
        payload: invoiceFromDate,
      });

      dispatch({
        type: "GET_BILLING_NEW_INVOICE_DATE_TO",
        payload: invoiceToDate,
      });
    }
    dispatch(getInvoiceNewBilling(notify));
    dispatch({
      type: "GET_NEW_BILLING_PAGE_NO",
      payload: 1,
    });
    props.handleClose();
  };

  const handleInvoiceFromChange = (date) => {
    let selectedDate = new Date(date);
    let dd = String(selectedDate.getDate()).padStart(2, "0");
    let mm = String(selectedDate.getMonth() + 1).padStart(2, "0"); //
    let yyyy = selectedDate.getFullYear();
    let selectedDateFormat = yyyy + "-" + mm + "-" + dd;
    setInvoiceFromDate(selectedDateFormat);
  };

  const handleInvoiceToChange = (date) => {
    let selectedDate = new Date(date);
    let dd = String(selectedDate.getDate()).padStart(2, "0");
    let mm = String(selectedDate.getMonth() + 1).padStart(2, "0"); //
    let yyyy = selectedDate.getFullYear();
    let selectedDateFormat = yyyy + "-" + mm + "-" + dd;
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
        <Box fontWeight="fontWeightBold">Billing Invoice Search</Box>
      </Typography>
      <Paper
        sx={(theme) => ({
          padding: theme.spacing(2, 0),
        })}
        elevation={0}
      >
        <Grid container spacing={1}>
          <Grid item size={{ xs: 12, sm: 6, lg: 3 }}>
            <Typography variant="subtitle1" sx={customLabelTypography}>
              Invoice From Date
            </Typography>
            <DatePickerField
              fullWidth
              dateId="invoice-from-date"
              dateValue={invoiceFromDate}
              dateChange={handleInvoiceFromChange}
            />
          </Grid>
          <Grid item size={{ xs: 12, sm: 6, lg: 3 }}>
            <Typography variant="subtitle1" sx={customLabelTypography}>
              Invoice To Date
            </Typography>

            <DatePickerField
              fullWidth
              dateId="invoice-to-date"
              dateValue={invoiceToDate}
              dateChange={handleInvoiceToChange}
            />
          </Grid>
          {gateIn.allDropDown && filtered && (
            <Grid item size={{ xs: 6, sm: 3, lg: 3 }}>
              <Typography variant="subtitle1" sx={customLabelTypography}>
                Client Name
              </Typography>

              <Autocomplete
                value={clientName}
                onChange={(event, newValue) => {
                  setClientName(newValue);
                }}
                style={{ padding: 0 }}
                sx={{
                  "& .MuiAutocomplete-inputRoot[class*='MuiOutlinedInput-root']":
                    {
                      padding: 0,
                    },
                }}
                options={filtered.map((option) => option)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    variant="outlined"
                    onBlur={(e) => {
                      setClientName(e.target.value);
                    }}
                    fullWidth
                  />
                )}
              />
            </Grid>
          )}
          <Grid item size={{ xs: 12, sm: 6, lg: 3 }}>
            <Typography variant="subtitle1" sx={customLabelTypography}>
              Container Number
            </Typography>

            <TextField
              id="container-number"
              value={containerNumber}
              variant="outlined"
              fullWidth
              size="small"
              onChange={(e) => {
                setContainerNumber(e.target.value);
              }}
            />
          </Grid>
          <Grid item size={{ xs: 12, sm: 6, lg: 3 }}>
            <Typography variant="subtitle1" sx={customLabelTypography}>
              Invoice Number
            </Typography>

            <TextField
              id="invoice-number"
              value={invoiceNumber}
              variant="outlined"
              fullWidth
              size="small"
              onChange={(e) => {
                setInvoiceNumber(e.target.value);
              }}
            />
          </Grid>
          <Grid item size={{ xs: 12, sm: 6, lg: 3 }}>
            <Typography variant="subtitle1" sx={customLabelTypography}>
              Bill Type
            </Typography>

            <TextField
              id="charge-type"
              select
              value={chargeType}
              variant="outlined"
              fullWidth
              size="small"
              onChange={(e) => {
                setChargeType(e.target.value);
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
          </Grid>

          <Grid
            container
            spacing={3}
            style={{
              alignItems: "center",
              justifyContent: "center",
            }}
          ></Grid>
        </Grid>
        <Stack
          sx={{ mt: 12 }}
          direction={"row"}
          alignItems={"center"}
          justifyContent={"center"}
          spacing={4}
        >
          <Button
            variant="contained"
            color="primary"
            sx={{
              width: 320,
              marginX: "auto",
              display: "block",
            }}
            onClick={handleSearch}
          >
            Search
          </Button>
          <Button
            variant="contained"
            color="success"
            sx={{
              width: 320,
              marginX: "auto",
              display: "block",
            }}
            onClick={handleDownloadExcel}
          >
           Search & Download Excel
          </Button>
        </Stack>
      </Paper>
    </div>
  );
}
