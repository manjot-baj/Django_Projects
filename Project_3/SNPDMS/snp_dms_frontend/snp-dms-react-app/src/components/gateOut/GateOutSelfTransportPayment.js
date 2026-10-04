import React, { useState, useEffect } from "react";
import {
  makeStyles,
  Typography,
  TextField,
  MenuItem,
  Button,
  Grid,
} from "@material-ui/core";
import { useDispatch, useSelector } from "react-redux";

import CustomTextfield from "../reusableComponents/GateInTextField";
import DatePickerField from "../reusableComponents/DatePickerField";

import ChequeSearch from "../reusableComponents/ChequeSearch";
import { selfTransportSearch } from "../../actions/GateInActions";
import Autocomplete from "@material-ui/lab/Autocomplete";

const useStyles = makeStyles((theme) => ({
  paperContainer: {
    paddingTop: 18,
    paddingBottom: 20,
  },
  input: {
    padding: 7,
    backgroundColor: "#fff",
  },
  readOnlyField: {
    padding: 7,

    backgroundColor: "#E8EAEC",
  },

  whiteBGContainer: {
    padding: "2px 18px 8px 18px",
  },

  blueBGContainer: {
    backgroundColor: "#EAF0F5",
    borderRadius: 10,
    padding: theme.spacing(1.5, 1.5),
    margin: theme.spacing(0.5, 1),
    // marginTop: 12,
  },
  LabelTypography: {
    fontSize: 13,
    fontWeight: 600,
    color: "#243545",
    paddingBottom: 4,
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
  selectedApplyCharges: {
    borderRadius: 5,
    color: "#fff",
    backgroundColor: "#2F6FB7",
    width: "100%",
    padding: 1,
    "&:hover": {
      backgroundColor: "#2F6FB7",
    },
  },
  autocomplete: {
    "& .MuiAutocomplete-inputRoot[class*='MuiOutlinedInput-root']": {
      padding: 0,
    },
    "& input":{
      textTransform:"uppercase"
    }
  },
}));
const GateOutSelfTransportPayment = (props) => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const store = useSelector((state) => state);
  const { gateIn, gateOutSelfTransportPayment, search, gateOutEdit } = store;

  const { todayDate } = props;
  // LINE PARTY SELECT

  const [selectedChoice, setSelectedChoice] = React.useState(false);
// eslint-disable-next-line no-unused-vars
  const [gateOutSelfTransportinvoiceNumber] = useState("");
  const [
    gateOutSelfTransportcustomerName,
    setgateOutSelfTransportCustomerName,
  ] = useState("");
  const [
    gateOutSelfTransportreceiptNumber,
    setgateOutSelfTransportReceiptNumber,
  ] = useState("");
  const [gateOutSelfTransportreceiptDate, setgateOutSelfTransportReceiptDate] =
    useState("");
  const [transporter, setTransporter] = useState("");
  const [origin, setOrigin] = useState("");

  const [gateOutSelfTransportpaymentType, setgateOutSelfTransportPaymentType] =
    useState("");
  const [gateOutSelfTransportPrice, setgateOutSelfTransportPrice] =
    useState("");
  const [gateOutSelfTransportRemark, setgateOutSelfTransportRemark] =
    useState("");
  const [gateOutSelfTransportCheque, setgateOutSelfTransportCheque] =
    useState("");
  const [gateOutSelfTransportQty, setgateOutSelfTransportQty] = useState("");
  const [gateOutSelfTransportUTRNumber, setgateOutSelfTransportUTRNumber] =
    useState("");
  const [
    gateOutSelfTransportPaymentChequeAmount,
    setgateOutSelfTransportPaymentChequeAmount,
  ] = useState("");
  const [gateOutSelfTransportBankName, setgateOutSelfTransportBankName] =
    useState("");
  const [gateOutSelfTransportChequeDate, setgateOutSelfTransportChequeDate] =
    useState("");
  const [gateOutSelfTransportAccountName, setgateOutSelfTransportAccountName] =
    useState("");
  const [
    gateOutSelfTransportAccountNumber,
    setgateOutSelfTransportAccountNumber,
  ] = useState("");

  const [
    gateOutSelfTransportchequeOriginalQty,
    setgateOutSelfTransportChequeOriginalQty,
  ] = useState(null);
  const [
    gateOutSelfTransportchequeListOfContainers,
    setgateOutSelfTransportListOfContainers,
  ] = useState([]);
  const [
    gateOutSelfTransportchequeOriginalAmount,
    setgateOutSelfTransportChequeOriginalAmount,
  ] = useState(null);

  useEffect(() => {
    if (gateOutEdit.selectedContainer.container_data.container_no) {
      if (
        gateOutEdit.selectedContainer.self_transportation_data.apply_charges ===
        "Party"
      ) {
        setSelectedChoice(true);
      }

      // Customer date
      setgateOutSelfTransportCustomerName(
        gateOutEdit.selectedContainer.self_transportation_data.customer_name &&
          gateOutEdit.selectedContainer.self_transportation_data.customer_name
      );
      // Transporter
      setTransporter(
        gateOutEdit.selectedContainer.self_transportation_data.transporter &&
          gateOutEdit.selectedContainer.self_transportation_data.transporter
      );
      // Receipt date
      setgateOutSelfTransportReceiptDate(
        gateOutEdit.selectedContainer.self_transportation_data.receipt_date &&
          gateOutEdit.selectedContainer.self_transportation_data.receipt_date
      );
      // Origin
      setOrigin(
        gateOutEdit.selectedContainer.self_transportation_data.origin &&
          gateOutEdit.selectedContainer.self_transportation_data.origin
      );
      setgateOutSelfTransportRemark(
        gateOutEdit.selectedContainer.self_transportation_data.remark &&
        gateOutEdit.selectedContainer.self_transportation_data.remark
      )
      // Payment Type
      setgateOutSelfTransportPaymentType(
        gateOutEdit.selectedContainer.self_transportation_data.payment_type &&
          gateOutEdit.selectedContainer.self_transportation_data.payment_type
      );
      // Price
      setgateOutSelfTransportPrice(
        gateOutEdit.selectedContainer.self_transportation_data.price &&
          gateOutEdit.selectedContainer.self_transportation_data.price
      );
      // cHEQUE DETAILS
      // LOLO CHEQUE NUMBER
      setgateOutSelfTransportCheque(
        gateOutEdit.selectedContainer.self_transportation_data
          .self_transportation_payment &&
          gateOutEdit.selectedContainer.self_transportation_data
            .self_transportation_payment.cheque_no
      );

      setgateOutSelfTransportUTRNumber(
        gateOutEdit.selectedContainer.self_transportation_data
          .self_transportation_payment &&
          gateOutEdit.selectedContainer.self_transportation_data
            .self_transportation_payment.utr_no
      );

      // CHEQUE QUANTITY
      if (gateOutEdit.selectedContainer.self_transportation_data !== "") {
        if (
          gateOutEdit.selectedContainer.self_transportation_data
            .self_transportation_payment
        ) {
          if (
            gateOutEdit.selectedContainer.self_transportation_data
              .self_transportation_payment.pk
          ) {
            setgateOutSelfTransportQty(
              gateOutEdit.selectedContainer.self_transportation_data
                .self_transportation_payment.remaining
            );
          }
        }
      }

      // CHEQUE AMOUNT
      if (
        gateOutEdit.selectedContainer.self_transportation_data
          .self_transportation_payment &&
        gateOutEdit.selectedContainer.self_transportation_data
          .self_transportation_payment.amount === 0
      )
        setgateOutSelfTransportPaymentChequeAmount("0");
      else
        setgateOutSelfTransportPaymentChequeAmount(
          gateOutEdit.selectedContainer.self_transportation_data
            .self_transportation_payment &&
            gateOutEdit.selectedContainer.self_transportation_data
              .self_transportation_payment.amount
        );
      // CHEQUE ORIGINAL AMOUNT
      if (
        gateOutEdit.selectedContainer.self_transportation_data
          .self_transportation_payment &&
        gateOutEdit.selectedContainer.self_transportation_data
          .self_transportation_payment.original_amount === 0
      ) {
        setgateOutSelfTransportChequeOriginalAmount("0");
      } else {
        setgateOutSelfTransportChequeOriginalAmount(
          gateOutEdit.selectedContainer.self_transportation_data
            .self_transportation_payment &&
            gateOutEdit.selectedContainer.self_transportation_data
              .self_transportation_payment.original_amount
        );
      }

      // REMAINING QTY
      if (
        gateOutEdit.selectedContainer.self_transportation_data
          .self_transportation_payment &&
        gateOutEdit.selectedContainer.self_transportation_data
          .self_transportation_payment.quantity === 0
      )
        setgateOutSelfTransportChequeOriginalQty("0");
      else
        setgateOutSelfTransportChequeOriginalQty(
          gateOutEdit.selectedContainer.self_transportation_data
            .self_transportation_payment &&
            gateOutEdit.selectedContainer.self_transportation_data
              .self_transportation_payment.quantity
        );

      // cHEQUE BANK NAME
      setgateOutSelfTransportBankName(
        gateOutEdit.selectedContainer.self_transportation_data
          .self_transportation_payment &&
          gateOutEdit.selectedContainer.self_transportation_data
            .self_transportation_payment.bank_name
      );
      // CHEQUE DATE
      setgateOutSelfTransportChequeDate(
        gateOutEdit.selectedContainer.self_transportation_data
          .self_transportation_payment &&
          gateOutEdit.selectedContainer.self_transportation_data
            .self_transportation_payment.date
      );
      // ACCOUNT NAME
      setgateOutSelfTransportAccountName(
        gateOutEdit.selectedContainer.self_transportation_data
          .self_transportation_payment &&
          gateOutEdit.selectedContainer.self_transportation_data
            .self_transportation_payment.account_name
      );
      setgateOutSelfTransportAccountNumber(
        gateOutEdit.selectedContainer.self_transportation_data
          .self_transportation_payment &&
          gateOutEdit.selectedContainer.self_transportation_data
            .self_transportation_payment.account_no
      );

      // List OF containers
      setgateOutSelfTransportListOfContainers(
        gateOutEdit.selectedContainer.self_transportation_data
          .self_transportation_payment &&
          gateOutEdit.selectedContainer.self_transportation_data
            .self_transportation_payment.container
      );
      // RECEIPT NUMBER
      setgateOutSelfTransportReceiptNumber(
        gateOutEdit.selectedContainer.self_transportation_data &&
          gateOutEdit.selectedContainer.self_transportation_data.receipt_no
      );
    } else {
      setgateOutSelfTransportReceiptDate(todayDate);
      setgateOutSelfTransportChequeDate(todayDate);
    }
  
// eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gateOutEdit.selectedContainer]);

  useEffect(() => {
    if (search.selfTransportPaymentSelectedCheque) {
      setgateOutSelfTransportCheque(
        search.selfTransportPaymentSelectedCheque.cheque_no
      );
      setgateOutSelfTransportUTRNumber(
        search.selfTransportPaymentSelectedCheque.utr_no
      );
      setgateOutSelfTransportQty(
        search.selfTransportPaymentSelectedCheque.remaining
      );
      if (search.selfTransportPaymentSelectedCheque.amount === 0)
        setgateOutSelfTransportPaymentChequeAmount("0");
      else
        setgateOutSelfTransportPaymentChequeAmount(
          search.selfTransportPaymentSelectedCheque.amount
        );
      if (search.selfTransportPaymentSelectedCheque.quantity === 0)
        setgateOutSelfTransportChequeOriginalQty("0");
      else
        setgateOutSelfTransportChequeOriginalQty(
          search.selfTransportPaymentSelectedCheque.quantity
        );
      setgateOutSelfTransportBankName(
        search.selfTransportPaymentSelectedCheque.bank_name
      );
      setgateOutSelfTransportChequeDate(
        search.selfTransportPaymentSelectedCheque.date
      );
      setgateOutSelfTransportAccountName(
        search.selfTransportPaymentSelectedCheque.account_name
      );
      setgateOutSelfTransportAccountNumber(
        search.selfTransportPaymentSelectedCheque.account_no
      );
      setgateOutSelfTransportListOfContainers(
        search.selfTransportPaymentSelectedCheque.container
      );
      // CHEQUE ORIGINAL AMOUNT
      if (search.selfTransportPaymentSelectedCheque.original_amount === 0) {
        setgateOutSelfTransportChequeOriginalAmount("0");
      } else {
        setgateOutSelfTransportChequeOriginalAmount(
          search.selfTransportPaymentSelectedCheque.original_amount
        );
      }
    }
  }, [search.selfTransportPaymentSelectedCheque]);

  const handleChoiceSelect = () => {
    setSelectedChoice((choice) => !choice);
  };

  return (
    <div>
      <div className={classes.whiteBGContainer}>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={4} lg={3}>
            <Typography variant="subtitle1" className={classes.LabelTypography}>
              Apply Charges
            </Typography>
            <Grid
              container
              spacing={1}
              className={classes.choiceSelectContainer}
            >
              <Grid item xs={6}>
                <Button
                  className={
                    selectedChoice
                      ? classes.choice
                      : classes.selectedApplyCharges
                  }
                  onClick={() => {
                    handleChoiceSelect();
                    dispatch({
                      type: gateOutEdit.selectedContainer.goh_pk
                        ? "EDIT_GATE_OUT_SELF_TRANSPORT_APPLY_CHARGES"
                        : "GATE_OUT_SELF_TRANSPORT_APPLY_CHARGES",
                      payload: "Line",
                    });
                  }}
                >
                  Line
                </Button>
              </Grid>
              <Grid item xs={6}>
                <Button
                  className={
                    selectedChoice
                      ? classes.selectedApplyCharges
                      : classes.choice
                  }
                  onClick={() => {
                    handleChoiceSelect();
                    dispatch({
                      type: gateOutEdit.selectedContainer.goh_pk
                        ? "EDIT_GATE_OUT_SELF_TRANSPORT_APPLY_CHARGES"
                        : "GATE_OUT_SELF_TRANSPORT_APPLY_CHARGES",
                      payload: "Party",
                    });
                  }}
                >
                  Party
                </Button>
              </Grid>
            </Grid>
          </Grid>
         

          {gateIn.allDropDown && gateIn.allDropDown.party_client_data && (
            <Grid item xs={12} sm={6} md={4} lg={3}>
              <Typography
                variant="subtitle1"
                className={classes.LabelTypography}
              >
                Customer Name{" "}
                {(gateOutSelfTransportPayment.apply_charges === "Party" ||
                  gateOutEdit.selectedContainer.self_transportation_data
                    .apply_charges === "Party") && (
                  <span style={{ color: "red" }}>*</span>
                )}
              </Typography>
              <Autocomplete
                value={gateOutSelfTransportcustomerName}
                onChange={(event, newValue) => {
                  setgateOutSelfTransportCustomerName(newValue);
                }}
                style={{ padding: 0 }}
                className={classes.autocomplete}
                disabled={
                  gateOutEdit.selectedContainer.goh_pk &&
                  gateOutEdit.selectedContainer.self_transportation_data !== ""
                    ? gateOutEdit.selectedContainer.self_transportation_data
                        .apply_charges === "Line" ||
                      gateOutEdit.selectedContainer.self_transportation_data
                        .apply_charges === undefined
                    : gateOutSelfTransportPayment.apply_charges === "Line" ||
                      gateOutSelfTransportPayment.apply_charges === undefined
                }
                options={gateIn.allDropDown.party_client_data.map(
                  (option) => option.name
                )}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    variant="outlined"
                    className={classes.textField}
                    onBlur={(e) => {
                      setgateOutSelfTransportCustomerName(e.target.value);
                      dispatch({
                        type: gateOutEdit.selectedContainer.goh_pk
                          ? "EDIT_GATE_OUT_SELF_TRANSPORT_CUSTOMER_NAME"
                          : "GATE_OUT_SELF_TRANSPORT_CUSTOMER_NAME",
                        payload: e.target.value,
                      });
                    }}
                    fullWidth
                  />
                )}
              />
            </Grid>
          )}
          
            <Grid item xs={12} sm={6} md={4} lg={3}>
              <Typography
                variant="subtitle1"
                className={classes.LabelTypography}
              >
                Receipt Number
              </Typography>
              <CustomTextfield
                id="self-transport-receipt-number"
                readOnlyP={true}
                value={gateOutSelfTransportreceiptNumber}
              />
            </Grid>

          {gateIn.allDropDown && gateIn.allDropDown.transporter && (
            <Grid item xs={12} sm={6} md={4} lg={3}>
              <Typography
                variant="subtitle1"
                className={classes.LabelTypography}
              >
                Transporter
              </Typography>
              <Autocomplete
                value={transporter}
                onChange={(event, newValue) => {
                  setTransporter(newValue);
                }}
                style={{ padding: 0 }}
                className={classes.autocomplete}
                options={gateIn.allDropDown.transporter.map(
                  (option) => option.name
                )}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    id="gate-out-self-transportation-transporter"
                    variant="outlined"
                    className={classes.textField}
                    onBlur={(e) => {
                      setTransporter(e.target.value);
                      dispatch({
                        type: gateOutEdit.selectedContainer.gate_out_data
                          .gate_pass_no
                          ? "EDIT_GATE_OUT_SELF_TRANSPORT_TRANSPORTER"
                          : "GATE_OUT_SELF_TRANSPORT_TRANSPORTER",
                        payload: e.target.value,
                      });
                    }}
                    fullWidth
                  />
                )}
              />
            </Grid>
          )}

          <Grid item xs={12} sm={6} md={4} lg={3}>
            <Typography variant="subtitle1" className={classes.LabelTypography}>
              Receipt Date
            </Typography>
            <DatePickerField
              dateId="gate-out-self-transport-receipt-date"
              dateValue={gateOutSelfTransportreceiptDate}
              dateChange={(date) => setgateOutSelfTransportReceiptDate(date)}
              dispatchType={
                gateOutEdit.selectedContainer.goh_pk
                  ? "EDIT_GATE_OUT_SELF_TRANSPORT_RECEIPT_DATE"
                  : "GATE_OUT_SELF_TRANSPORT_RECEIPT_DATE"
              }
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4} lg={3}>
            <Typography variant="subtitle1" className={classes.LabelTypography}>
              Origin
            </Typography>
            <CustomTextfield
              id="gate-out-self-transportation-origin"
              handleChange={(e) => setOrigin(e.target.value)}
              value={origin}
              dispatchType={
                gateOutEdit.selectedContainer.goh_pk
                  ? "EDIT_GATE_OUT_SELF_TRANSPORT_ORIGIN"
                  : "GATE_OUT_SELF_TRANSPORT_ORIGIN"
              }
            />
          </Grid>

          <Grid item xs={12} sm={6} md={4} lg={3}>
            <Typography variant="subtitle1" className={classes.LabelTypography}>
              Payment Type
            </Typography>

            <TextField
              id="gate-out-self-transport-payment-type"
              select
              value={gateOutSelfTransportpaymentType}
              variant="outlined"
              fullWidth
              disabled={
                gateOutEdit.selectedContainer.goh_pk &&
                gateOutEdit.selectedContainer.self_transportation_data.pk &&
                gateOutEdit.selectedContainer.self_transportation_data
                  .payment_type !== "None"
              }
              inputProps={{ className: classes.input }}
              onChange={(e) => {
                setgateOutSelfTransportPaymentType(e.target.value);
                dispatch({
                  type: gateOutEdit.selectedContainer.goh_pk
                    ? "EDIT_GATE_OUT_SELF_TRANSPORT_PAYMENT_TYPE"
                    : "GATE_OUT_SELF_TRANSPORT_PAYMENT_TYPE",
                  payload: e.target.value,
                });
              }}
            >
              {gateIn.allDropDown &&
                gateIn.allDropDown.payment_type &&
                gateIn.allDropDown.payment_type.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6} md={4} lg={3}>
            <Typography variant="subtitle1" className={classes.LabelTypography}>
            Transportation Amount
            </Typography>

            <CustomTextfield
              id="gate-out-self-transport-amount"
              handleChange={(e) => setgateOutSelfTransportPrice(e.target.value)}
              value={gateOutSelfTransportPrice}
              type="number"
              dispatchType={
                gateOutEdit.selectedContainer.goh_pk
                  ? "EDIT_GATE_OUT_SELF_TRANSPORT_PRICE"
                  : "GATE_OUT_SELF_TRANSPORT_PRICE"
              }
              disabled={gateOutEdit.selectedContainer.lolo_data.is_amt_editable === false}
              readOnlyP={gateOutEdit.selectedContainer.lolo_data.is_amt_editable === false}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4} lg={3}>
            <Typography variant="subtitle1" className={classes.LabelTypography}>
              Remark
            </Typography>
            <CustomTextfield
              id="gate-out-self-transport-remark"
              handleChange={(e) =>
                setgateOutSelfTransportRemark(e.target.value)
              }
              value={gateOutSelfTransportRemark}
              isRemark={true}
              dispatchType={
                gateOutEdit.selectedContainer.goh_pk
                  ? "EDIT_GATE_OUT_SELF_TRANSPORT_REMARK"
                  : "GATE_OUT_SELF_TRANSPORT_REMARK"
              }
            />
          </Grid>
        </Grid>
      </div>
      {gateOutSelfTransportpaymentType === "Cheque" ||
      gateOutSelfTransportpaymentType === "NEFT" ||
      gateOutSelfTransportpaymentType === "RTGS" ? (
        <div className={classes.blueBGContainer}>
          <ChequeSearch
            paymentSearchResult={search.selfTransportPaymentSearchResult}
            getSearchResultType="GET_SELF_TRANSPORT_SEARCH_RESULT"
            setSelectedPaymentType="SET_SELECTED_SELF_TRANSPORT_SEARCH"
            updatePaymentType={
              gateOutEdit.selectedContainer.goh_pk
                ? "UPDATE_GATE_OUT_EDIT_CHEQUE_DETAILS_SELF_TRANSPORTATION"
                : "UPDATE_GATE_OUT_SELF_TRANSPORT_PAYMENT_CHEQUE_UTR_SEARCH_RESULT"
            }
            searchAction={selfTransportSearch}
          />
          <Grid container spacing={3} style={{ marginTop: 12 }}>
            {gateOutSelfTransportpaymentType === "Cheque" && (
              <Grid item xs={12} sm={6} md={4} lg={3}>
                <Typography
                  variant="subtitle1"
                  className={classes.LabelTypography}
                >
                  Cheque Number <span style={{ color: "red" }}>*</span>
                </Typography>
                <CustomTextfield
                  id="gate-out-self-transport-cheque-number"
                  handleChange={(e) =>
                    setgateOutSelfTransportCheque(e.target.value)
                  }
                  value={gateOutSelfTransportCheque}
                  readOnlyP={
                    search.selfTransportPaymentSelectedCheque ? true : false
                  }
                  dispatchType={
                    // search.selfTransportPaymentSelectedCheque
                    //   ? "GATE_OUT_SELF_TRANSPORT_PAYMENT_CHEQUE_NUMBER"
                    //   :
                    gateOutEdit.selectedContainer.goh_pk
                      ? "EDIT_GATE_OUT_SELF_TRANSPORT_CHEQUE_NUMBER"
                      : "GATE_OUT_SELF_TRANSPORT_PAYMENT_CHEQUE_NUMBER"
                  }
                />
              </Grid>
            )}
            {(gateOutSelfTransportpaymentType === "NEFT" ||
              gateOutSelfTransportpaymentType === "RTGS") && (
              <Grid item xs={12} sm={6} md={4} lg={3}>
                <Typography
                  variant="subtitle1"
                  className={classes.LabelTypography}
                >
                  UTR Number <span style={{ color: "red" }}>*</span>
                </Typography>
                <CustomTextfield
                  id="gate-out-self-transport-utr-number"
                  handleChange={(e) =>
                    setgateOutSelfTransportUTRNumber(e.target.value)
                  }
                  value={gateOutSelfTransportUTRNumber}
                  readOnlyP={
                    search.selfTransportPaymentSelectedCheque ? true : false
                  }
                  dispatchType={
                    // search.selfTransportPaymentSelectedCheque
                    //   ? "GATE_OUT_SELF_TRANSPORT_PAYMENT_UTR_NO"
                    //   :
                    gateOutEdit.selectedContainer.goh_pk
                      ? "EDIT_GATE_OUT_SELF_TRANSPORT_UTR_NO"
                      : "GATE_OUT_SELF_TRANSPORT_PAYMENT_UTR_NO"
                  }
                />
              </Grid>
            )}
            <Grid item xs={12} sm={6} md={4} lg={3}>
              <Typography
                variant="subtitle1"
                className={classes.LabelTypography}
              >
                {
                  // search.selfTransportPaymentSelectedCheque ||
                  gateOutEdit.selectedContainer.container_data.pk &&
                  gateOutEdit.selectedContainer.self_transportation_data
                    .self_transportation_payment &&
                  (gateOutEdit.selectedContainer.self_transportation_data
                    .payment_type === "Cheque" ||
                    gateOutEdit.selectedContainer.self_transportation_data
                      .payment_type === "NEFT" ||
                    gateOutEdit.selectedContainer.self_transportation_data
                      .payment_type === "RTGS") &&
                  gateOutEdit.selectedContainer.self_transportation_data
                    .self_transportation_payment.pk &&
                  gateOutEdit.selectedContainer.self_transportation_data
                    .self_transportation_payment.quantity !== undefined
                    ? "Remaining Quantity"
                    : `Quantity` 
                }<span style={{ color: "red" }}>*</span>
              </Typography>
              {
                // search.selfTransportPaymentSelectedCheque ||
                gateOutEdit.selectedContainer.container_data.pk &&
                gateOutEdit.selectedContainer.self_transportation_data
                  .self_transportation_payment &&
                (gateOutEdit.selectedContainer.self_transportation_data
                  .payment_type === "Cheque" ||
                  gateOutEdit.selectedContainer.self_transportation_data
                    .payment_type === "NEFT" ||
                  gateOutEdit.selectedContainer.self_transportation_data
                    .payment_type === "RTGS") &&
                gateOutEdit.selectedContainer.self_transportation_data
                  .self_transportation_payment.pk &&
                gateOutEdit.selectedContainer.self_transportation_data
                  .self_transportation_payment.quantity !== undefined ? (
                  <CustomTextfield
                    id="gate-out-self-transport-quantity"
                    handleChange={(e) =>
                      setgateOutSelfTransportQty(e.target.value)
                    }
                    value={gateOutSelfTransportQty}
                    readOnlyP
                    dispatchType={
                      // search.selfTransportPaymentSelectedCheque
                      //   ? "GATE_OUT_SELF_TRANSPORT_PAYMENT_QUANTITY"
                      //   :
                      gateOutEdit.selectedContainer.self_transportation_data
                        .self_transportation_payment.remaining
                        ? "EDIT_GATE_OUT_SELF_TRANSPORT_QUANTITY"
                        : "GATE_OUT_SELF_TRANSPORT_PAYMENT_QUANTITY"
                    }
                  />
                ) : (
                  <CustomTextfield
                    id="gate-out-self-transport-quantity"
                    handleChange={(e) =>
                      setgateOutSelfTransportQty(e.target.value)
                    }
                    value={gateOutSelfTransportQty}
                    dispatchType={
                      // search.selfTransportPaymentSelectedCheque
                      //   ? "GATE_OUT_SELF_TRANSPORT_PAYMENT_QUANTITY"
                      //   :
                      gateOutEdit.selectedContainer.goh_pk
                        ? "EDIT_GATE_OUT_SELF_TRANSPORT_QUANTITY"
                        : "GATE_OUT_SELF_TRANSPORT_PAYMENT_QUANTITY"
                    }
                  />
                )
              }
            </Grid>
            {gateOutEdit.selectedContainer.container_data.pk &&
            gateOutEdit.selectedContainer.self_transportation_data
              .self_transportation_payment &&
            (gateOutEdit.selectedContainer.self_transportation_data
              .payment_type === "Cheque" ||
              gateOutEdit.selectedContainer.self_transportation_data
                .payment_type === "NEFT" ||
              gateOutEdit.selectedContainer.self_transportation_data
                .payment_type === "RTGS") &&
            gateOutEdit.selectedContainer.self_transportation_data
              .self_transportation_payment.pk &&
            gateOutEdit.selectedContainer.self_transportation_data
              .self_transportation_payment.quantity !== undefined ? (
              <Grid item xs={12} sm={6} md={4} lg={3}>
                <Typography
                  variant="subtitle1"
                  className={classes.LabelTypography}
                >
                  Original Quantity
                </Typography>
                <CustomTextfield
                  id="gate-out-self-transport-remaining-qty"
                  handleChange={(e) =>
                    setgateOutSelfTransportChequeOriginalQty(e.target.value)
                  }
                  value={gateOutSelfTransportchequeOriginalQty}
                  dispatchType={
                    // search.selfTransportPaymentSelectedCheque
                    //   ? "self_transportation_payment_ORIGINAL_QUANTITY"
                    //   :
                    gateOutEdit.selectedContainer.goh_pk
                      ? "EDIT_GATE_OUT_SELF_TRANSPORT_ORIGINAL_QUANTITY"
                      : "self_transportation_payment_ORIGINAL_QUANTITY"
                  }
                />
              </Grid>
            ) : null}

            {/* AMOUNT  */}
            <Grid item xs={12} sm={6} md={4} lg={3}>
              <Typography
                variant="subtitle1"
                className={classes.LabelTypography}
              >
                {
                  // search.selfTransportPaymentSelectedCheque ||
                  gateOutEdit.selectedContainer.container_data.pk &&
                  gateOutEdit.selectedContainer.self_transportation_data
                    .self_transportation_payment &&
                  (gateOutEdit.selectedContainer.self_transportation_data
                    .payment_type === "Cheque" ||
                    gateOutEdit.selectedContainer.self_transportation_data
                      .payment_type === "NEFT" ||
                    gateOutEdit.selectedContainer.self_transportation_data
                      .payment_type === "RTGS") &&
                  gateOutEdit.selectedContainer.self_transportation_data
                    .self_transportation_payment.pk &&
                  gateOutEdit.selectedContainer.self_transportation_data
                    .self_transportation_payment.amount !== undefined
                    ? "Remaining Amount"
                    : "Amount"
                }{" "}
                <span style={{ color: "red" }}>*</span>
              </Typography>
              {
                // search.selfTransportPaymentSelectedCheque ||
                gateOutEdit.selectedContainer.container_data.pk &&
                gateOutEdit.selectedContainer.self_transportation_data
                  .self_transportation_payment &&
                (gateOutEdit.selectedContainer.self_transportation_data
                  .payment_type === "Cheque" ||
                  gateOutEdit.selectedContainer.self_transportation_data
                    .payment_type === "NEFT" ||
                  gateOutEdit.selectedContainer.self_transportation_data
                    .payment_type === "RTGS") &&
                gateOutEdit.selectedContainer.self_transportation_data
                  .self_transportation_payment.pk &&
                gateOutEdit.selectedContainer.self_transportation_data
                  .self_transportation_payment.amount !== undefined ? (
                  <CustomTextfield
                    id="gate-out-self-transport-payment-cheque-amount"
                    handleChange={(e) =>
                      setgateOutSelfTransportPaymentChequeAmount(e.target.value)
                    }
                    readOnlyP
                    value={gateOutSelfTransportPaymentChequeAmount}
                    dispatchType={
                      // search.selfTransportPaymentSelectedCheque
                      //   ? "GATE_OUT_SELF_TRANSPORT_PAYMENT_CHEQUE_AMOUNT"
                      //   :
                      gateOutEdit.selectedContainer.goh_pk
                        ? "EDIT_GATE_OUT_SELF_TRANSPORT_CHEQUE_AMOUNT"
                        : "GATE_OUT_SELF_TRANSPORT_PAYMENT_CHEQUE_AMOUNT"
                    }
                  />
                ) : (
                  <CustomTextfield
                    id="gate-out-self-transport-payment-cheque-amount"
                    handleChange={(e) =>
                      setgateOutSelfTransportPaymentChequeAmount(e.target.value)
                    }
                    value={gateOutSelfTransportPaymentChequeAmount}
                    dispatchType={
                      // search.selfTransportPaymentSelectedCheque
                      //   ? "GATE_OUT_SELF_TRANSPORT_PAYMENT_CHEQUE_AMOUNT"
                      //   :
                      gateOutEdit.selectedContainer.goh_pk
                        ? "EDIT_GATE_OUT_SELF_TRANSPORT_CHEQUE_AMOUNT"
                        : "GATE_OUT_SELF_TRANSPORT_PAYMENT_CHEQUE_AMOUNT"
                    }
                  />
                )
              }
            </Grid>
            {gateOutEdit.selectedContainer.container_data.pk &&
            gateOutEdit.selectedContainer.self_transportation_data
              .self_transportation_payment &&
            (gateOutEdit.selectedContainer.self_transportation_data
              .payment_type === "Cheque" ||
              gateOutEdit.selectedContainer.self_transportation_data
                .payment_type === "NEFT" ||
              gateOutEdit.selectedContainer.self_transportation_data
                .payment_type === "RTGS") &&
            gateOutEdit.selectedContainer.self_transportation_data
              .self_transportation_payment.pk &&
            gateOutEdit.selectedContainer.self_transportation_data
              .self_transportation_payment.amount !== undefined ? (
              <Grid item xs={12} sm={6} md={4} lg={3}>
                <Typography
                  variant="subtitle1"
                  className={classes.LabelTypography}
                >
                  Original Amount
                </Typography>
                <CustomTextfield
                  id="gate-out-self-transport-original-amount"
                  handleChange={(e) =>
                    setgateOutSelfTransportChequeOriginalAmount(e.target.value)
                  }
                  value={gateOutSelfTransportchequeOriginalAmount}
                  dispatchType={
                    gateOutEdit.selectedContainer.goh_pk
                      ? "EDIT_GATE_OUT_SELF_TRANSPORT_CHEQUE_ORIGINAL_AMOUNT"
                      : "self_transportation_payment_CHEQUE_ORIGNAL_AMOUNT"
                  }
                  // readOnlyP={true}
                />
              </Grid>
            ) : null}
            <Grid item xs={12} sm={6} md={4} lg={3}>
              <Typography
                variant="subtitle1"
                className={classes.LabelTypography}
              >
                Bank Name  {(gateOutSelfTransportpaymentType === "NEFT" || gateOutSelfTransportpaymentType === "RTGS")  ? "": <span style={{ color: "red" }}>*</span>  }
              </Typography>
              <CustomTextfield
                id="gate-out-self-transport-bank-name"
                readOnlyP={
                  search.selfTransportPaymentSelectedCheque ? true : false
                }
                handleChange={(e) =>
                  setgateOutSelfTransportBankName(e.target.value)
                }
                value={gateOutSelfTransportBankName}
                dispatchType={
                  // search.selfTransportPaymentSelectedCheque
                  //   ? "GATE_OUT_SELF_TRANSPORT_PAYMENT_BANK_NAME"
                  //   :
                  gateOutEdit.selectedContainer.goh_pk
                    ? "EDIT_GATE_OUT_SELF_TRANSPORT_BANK_NAME"
                    : "GATE_OUT_SELF_TRANSPORT_PAYMENT_BANK_NAME"
                }
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4} lg={3}>
              <Typography
                variant="subtitle1"
                className={classes.LabelTypography}
              >
                Date <span style={{ color: "red" }}>*</span>
              </Typography>

              <DatePickerField
                dateId="gate-out-self-transport-cheque-date"
                dateValue={gateOutSelfTransportChequeDate}
                dateChange={(date) => setgateOutSelfTransportChequeDate(date)}
                dispatchType={
                  // search.selfTransportPaymentSelectedCheque
                  //   ? "GATE_OUT_SELF_TRANSPORT_PAYMENT_DATE"
                  //   :
                  gateOutEdit.selectedContainer.goh_pk
                    ? "EDIT_GATE_OUT_SELF_TRANSPORT_CHEQUE_DATE"
                    : "GATE_OUT_SELF_TRANSPORT_PAYMENT_DATE"
                }
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4} lg={3}>
              <Typography
                variant="subtitle1"
                className={classes.LabelTypography}
              >
                Account Name  {(gateOutSelfTransportpaymentType === "NEFT" || gateOutSelfTransportpaymentType === "RTGS")  ? "": <span style={{ color: "red" }}>*</span>  }
              </Typography>
              <CustomTextfield
                id="gate-out-self-transport-acc-name"
                handleChange={(e) => {
                  setgateOutSelfTransportAccountName(e.target.value);
                }}
                readOnlyP={
                  search.selfTransportPaymentSelectedCheque ? true : false
                }
                value={gateOutSelfTransportAccountName}
                dispatchType={
                  // search.selfTransportPaymentSelectedCheque
                  //   ? "GATE_OUT_SELF_TRANSPORT_PAYMENT_ACCOUNT_NAME"
                  //   :
                  gateOutEdit.selectedContainer.goh_pk
                    ? "EDIT_GATE_OUT_SELF_TRANSPORT_ACCOUNT_NAME"
                    : "GATE_OUT_SELF_TRANSPORT_PAYMENT_ACCOUNT_NAME"
                }
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4} lg={3}>
              <Typography
                variant="subtitle1"
                className={classes.LabelTypography}
              >
                Account Number  {(gateOutSelfTransportpaymentType === "NEFT" || gateOutSelfTransportpaymentType === "RTGS")  ? "": <span style={{ color: "red" }}>*</span>  }
              </Typography>
              <CustomTextfield
                id="gate-out-self-transport-acc-number"
                handleChange={(e) => {
                  setgateOutSelfTransportAccountNumber(e.target.value);
                }}
                value={gateOutSelfTransportAccountNumber}
                readOnlyP={
                  search.selfTransportPaymentSelectedCheque ? true : false
                }
                dispatchType={
                  // search.selfTransportPaymentSelectedCheque
                  //   ? "GATE_OUT_SELF_TRANSPORT_PAYMENT_ACCOUNT_NUMBER"
                  //   :
                  gateOutEdit.selectedContainer.goh_pk
                    ? "EDIT_GATE_OUT_SELF_TRANSPORT_PAYMENT_ACCOUNT_NUMBER"
                    : "GATE_OUT_SELF_TRANSPORT_PAYMENT_ACCOUNT_NUMBER"
                }
              />
            </Grid>
            {gateOutSelfTransportchequeListOfContainers &&
              gateOutSelfTransportchequeListOfContainers.length > 0 && (
                <Grid item xs={12} sm={6} md={4} lg={3}>
                  <Typography
                    variant="subtitle1"
                    className={classes.LabelTypography}
                  >
                    List of containers
                  </Typography>
                  <TextField
                    id="gate-out-self-transport-list-of-containers"
                    multiline
                    rows={
                      gateOutSelfTransportchequeListOfContainers &&
                      gateOutSelfTransportchequeListOfContainers.length
                    }
                    defaultValue={
                      gateOutSelfTransportchequeListOfContainers &&
                      gateOutSelfTransportchequeListOfContainers.join("\n")
                    }
                    variant="outlined"
                    disabled={true}
                  />
                </Grid>
              )}
          </Grid>
        </div>
      ) : null}
    </div>
  );
};

export default GateOutSelfTransportPayment;
