import React, { useEffect, useState } from "react";
import {
  Typography,
  Paper,
  TextField,
  Grid,
  Box,
  Button,
  Autocomplete,
} from "@mui/material";

import { useDispatch, useSelector } from "react-redux";
import DatePickerField from "@components/reusablecomponents/DatePickerField";
import { dropDownDispatch } from "../../actions/GateInActions";
import { theme } from "../../App";
import { getAllMNRHistoryAction } from "../../actions/NewBillingActions";
import { useSnackbar } from "notistack";
import { NEWBILLING_REDUCER } from "../../reducers/NewBillingReducer";
import { customLabelTypography } from "../../utils/CustomClasses";

export default function MNRInvoiceSearch(props) {
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
      type: NEWBILLING_REDUCER.GET_ALL_MNR_HISTORY,
      payload: {
        pg_no: 1,
      },
    });
    props.setCurrentPage(1);
    dispatch(getAllMNRHistoryAction("", notify));
    props.handleClose();
  };

  const handleInvoiceFromChange = (date) => {
    var selectedDate = new Date(date);
    var dd = String(selectedDate.getDate()).padStart(2, "0");
    var mm = String(selectedDate.getMonth() + 1).padStart(2, "0"); //
    var yyyy = selectedDate.getFullYear();
    var selectedDateFormat = yyyy + "-" + mm + "-" + dd;
    dispatch({
      type: NEWBILLING_REDUCER.GET_ALL_MNR_HISTORY,
      payload: {
        invoice_date: {
          from: selectedDateFormat,
          to: invoiceToDate,
        },
      },
    });
    setInvoiceFromDate(selectedDateFormat);
  };

  const handleInvoiceToChange = (date) => {
    var selectedDate = new Date(date);
    var dd = String(selectedDate.getDate()).padStart(2, "0");
    var mm = String(selectedDate.getMonth() + 1).padStart(2, "0"); //
    var yyyy = selectedDate.getFullYear();
    var selectedDateFormat = yyyy + "-" + mm + "-" + dd;
    dispatch({
      type: NEWBILLING_REDUCER.GET_ALL_MNR_HISTORY,
      payload: {
        invoice_date: {
          from: invoiceFromDate,
          to: selectedDateFormat,
        },
      },
    });
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
      <Paper
        sx={(theme) => ({
          padding: theme.spacing(4, 3),
        })}
        elevation={0}
      >
        <Grid container spacing={1}>
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
                      dispatch({
                        type: NEWBILLING_REDUCER.GET_ALL_MNR_HISTORY,
                        payload: {
                          client: e.target.value,
                        },
                      });
                    }}
                    fullWidth
                  />
                )}
              />
            </Grid>
          )}
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
                dispatch({
                  type: NEWBILLING_REDUCER.GET_ALL_MNR_HISTORY,
                  payload: {
                    container_no: e.target.value,
                  },
                });
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
                dispatch({
                  type: NEWBILLING_REDUCER.GET_ALL_MNR_HISTORY,
                  payload: {
                    invoice_no: e.target.value,
                  },
                });
              }}
            />
          </Grid>

      
        </Grid>
        <Button
          variant="contained"
          color="primary"
          sx={{
            marginX: "auto",
            display: "block",
            width: 320,
          }}
          onClick={handleSearch}
        >
          Search
        </Button>
      </Paper>
    </div>
  );
}
