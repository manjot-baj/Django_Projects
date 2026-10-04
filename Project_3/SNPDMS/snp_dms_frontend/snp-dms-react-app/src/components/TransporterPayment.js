import React, { useState, useEffect } from "react";
import {
  makeStyles,
  Typography,
  TextField,
  Button,
  Grid,
} from "@material-ui/core";

import CustomTextfield from "./reusableComponents/GateInTextField";
import DatePickerField from "./reusableComponents/DatePickerField";
import ChequeSearch from "./reusableComponents/ChequeSearch";
import { useDispatch, useSelector } from "react-redux";
import {
  selfTransportSearch,
  setCustomerNameVal,
} from "../actions/GateInActions";
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
  },
  LabelTypography: {
    fontSize: 14,
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
  autocomplete: {
    "& .MuiAutocomplete-inputRoot[class*='MuiOutlinedInput-root']": {
      padding: 0,
    },
    "& input":{
      textTransform:"uppercase"
    }
  },
  textField: {
    "& .MuiOutlinedInput-root": {
      "& input":{
        padding:'8px !important',
      },
      "& fieldset": {
        borderColor: "#243545",
      },
    },
  },
}));

const TransporterPayment = (props) => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const store = useSelector((state) => state);
  const { gateIn, gateInEdit, search, selfTransportPayment } = store;
  const { todayDate } = props;
  // LINE PARTY SELECT
  const [selectedChoice, setSelectedChoice] = React.useState(false);
  const [receiptNumber, setReceiptNumber] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [transporter, setTransporter] = useState("");
  const [receiptDate, setReceiptDate] = useState("");
  const [origin, setOrigin] = useState("");
  const [paymentType, setPaymentType] = useState("");
  const [price, setPrice] = useState("");
  const [transportationRemark, setTransportationRemark] = useState("");
  const [transportationCheque, settransportationCheque] = useState("");
  const [transportationQty, settransportationQty] = useState("");
  const [transportationUTRNumber, settransportationUTRNumber] = useState("");
  const [transportationChequeAmount, settransportationChequeAmount] =
    useState("");
  const [transportationBankName, settransportationBankName] = useState("");
  const [transportationChequeDate, settransportationChequeDate] = useState("");
  const [transportationAccountName, settransportationAccountName] =
    useState("");
  const [transportationAccountNumber, settransportationAccountNumber] =
    useState("");
  const [chequeRemainingQty, setChequeRemainingQty] = useState(null);
  const [chequeListOfContainers, setListOfContainers] = useState([]);
  const [chequeOriginalAmount, setChequeOriginalAmount] = useState(null);

  useEffect(() => {
    if (gateInEdit.selectedContainer.container_data.container_no) {
      if (
        gateInEdit.selectedContainer.self_transportation_data.apply_charges ===
        "Party"
      ) {
        setSelectedChoice(true);
      }
      // Customer date
      setCustomerName(
        gateInEdit.selectedContainer.self_transportation_data.customer_name &&
          gateInEdit.selectedContainer.self_transportation_data.customer_name
      );

      if (
        gateInEdit.selectedContainer.self_transportation_data.customer_name !==
        ""
      ) {
        dispatch(
          setCustomerNameVal(
            gateInEdit.selectedContainer.self_transportation_data.customer_name,
            setCustomerName
          )
        );
      }

      // Transporter
      setTransporter(
        gateInEdit.selectedContainer.self_transportation_data.transporter &&
          gateInEdit.selectedContainer.self_transportation_data.transporter
      );
      // Receipt date
      setReceiptDate(
        gateInEdit.selectedContainer.self_transportation_data.receipt_date &&
          gateInEdit.selectedContainer.self_transportation_data.receipt_date
      );
      // Origin
      setOrigin(
        gateInEdit.selectedContainer.self_transportation_data.origin &&
          gateInEdit.selectedContainer.self_transportation_data.origin
      );
      setTransportationRemark(
        gateInEdit.selectedContainer.self_transportation_data.remark &&
          gateInEdit.selectedContainer.self_transportation_data.remark
      )
      // Payment Type
      setPaymentType(
        gateInEdit.selectedContainer.self_transportation_data.payment_type &&
          gateInEdit.selectedContainer.self_transportation_data.payment_type
      );
      // Price
      setPrice(
        gateInEdit.selectedContainer.self_transportation_data.price &&
          gateInEdit.selectedContainer.self_transportation_data.price
      );
      // cHEQUE DETAILS
      // LOLO CHEQUE NUMBER
      settransportationCheque(
        gateInEdit.selectedContainer.self_transportation_data
          .self_transportation_payment &&
          gateInEdit.selectedContainer.self_transportation_data
            .self_transportation_payment.cheque_no
      );
      // UTR NUMBER
      settransportationUTRNumber(
        gateInEdit.selectedContainer.self_transportation_data
          .self_transportation_payment &&
          gateInEdit.selectedContainer.self_transportation_data
            .self_transportation_payment.utr_no
      );

      // CHEQUE QUANTITY
      if (gateInEdit.selectedContainer.self_transportation_data !== "") {
        if (
          gateInEdit.selectedContainer.self_transportation_data
            .self_transportation_payment
        ) {
          if (
            gateInEdit.selectedContainer.self_transportation_data
              .self_transportation_payment.pk
          ) {
            settransportationQty(
              gateInEdit.selectedContainer.self_transportation_data
                .self_transportation_payment.remaining
            );
          }
        }
      }
      // CHEQUE AMOUNT
      if (
        gateInEdit.selectedContainer.self_transportation_data
          .self_transportation_payment &&
        gateInEdit.selectedContainer.self_transportation_data
          .self_transportation_payment.amount === 0
      )
        settransportationChequeAmount("0");
      else
        settransportationChequeAmount(
          gateInEdit.selectedContainer.self_transportation_data
            .self_transportation_payment &&
            gateInEdit.selectedContainer.self_transportation_data
              .self_transportation_payment.amount
        );
      // CHEQUE ORIGINAL AMOUNT
      if (
        gateInEdit.selectedContainer.self_transportation_data
          .self_transportation_payment &&
        gateInEdit.selectedContainer.self_transportation_data
          .self_transportation_payment.original_amount === 0
      ) {
        setChequeOriginalAmount("0");
      } else {
        setChequeOriginalAmount(
          gateInEdit.selectedContainer.self_transportation_data
            .self_transportation_payment &&
            gateInEdit.selectedContainer.self_transportation_data
              .self_transportation_payment.original_amount
        );
      }
      // cHEQUE BANK NAME
      settransportationBankName(
        gateInEdit.selectedContainer.self_transportation_data
          .self_transportation_payment &&
          gateInEdit.selectedContainer.self_transportation_data
            .self_transportation_payment.bank_name
      );
      // CHEQUE DATE
      settransportationChequeDate(
        gateInEdit.selectedContainer.self_transportation_data
          .self_transportation_payment &&
          gateInEdit.selectedContainer.self_transportation_data
            .self_transportation_payment.date
      );
      // ACCOUNT Number
      settransportationAccountNumber(
        gateInEdit.selectedContainer.self_transportation_data
          .self_transportation_payment &&
          gateInEdit.selectedContainer.self_transportation_data
            .self_transportation_payment.account_no
      );
      settransportationAccountName(
        gateInEdit.selectedContainer.self_transportation_data
          .self_transportation_payment &&
          gateInEdit.selectedContainer.self_transportation_data
            .self_transportation_payment.account_name
      );
      // REMAINING QTY
      if (
        gateInEdit.selectedContainer.self_transportation_data
          .self_transportation_payment &&
        gateInEdit.selectedContainer.self_transportation_data
          .self_transportation_payment.quantity === 0
      )
        setChequeRemainingQty("0");
      else
        setChequeRemainingQty(
          gateInEdit.selectedContainer.self_transportation_data
            .self_transportation_payment &&
            gateInEdit.selectedContainer.self_transportation_data
              .self_transportation_payment.quantity
        );
      // List OF containers
      setListOfContainers(
        gateInEdit.selectedContainer.self_transportation_data
          .self_transportation_payment &&
          gateInEdit.selectedContainer.self_transportation_data
            .self_transportation_payment.container
      );
      // RECEIPT NUMBER
      setReceiptNumber(
        gateInEdit.selectedContainer.self_transportation_data &&
          gateInEdit.selectedContainer.self_transportation_data.receipt_no
      );
    } else {
      // setReceiptDate(todayDate);
      settransportationChequeDate(todayDate);
    }
// eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gateInEdit.selectedContainer]);

  useEffect(() => {
    // CHEQUE SEARCH
    if (search.selfTransportPaymentSelectedCheque) {
      settransportationCheque(
        search.selfTransportPaymentSelectedCheque.cheque_no
      );
      settransportationUTRNumber(
        search.selfTransportPaymentSelectedCheque.utr_no
      );
      settransportationQty(search.selfTransportPaymentSelectedCheque.remaining);
      if (search.selfTransportPaymentSelectedCheque.amount === 0)
        settransportationChequeAmount("0");
      else
        settransportationChequeAmount(
          search.selfTransportPaymentSelectedCheque.amount
        );
      settransportationBankName(
        search.selfTransportPaymentSelectedCheque.bank_name
      );
      settransportationChequeDate(
        search.selfTransportPaymentSelectedCheque.date
      );
      settransportationAccountName(
        search.selfTransportPaymentSelectedCheque.account_name
      );
      settransportationAccountNumber(
        search.selfTransportPaymentSelectedCheque.account_no
      );
      if (search.selfTransportPaymentSelectedCheque.quantity === 0)
        setChequeRemainingQty("0");
      else
        setChequeRemainingQty(
          search.selfTransportPaymentSelectedCheque.quantity
        );
      setListOfContainers(search.selfTransportPaymentSelectedCheque.container);
      // CHEQUE ORIGINAL AMOUNT
      if (search.selfTransportPaymentSelectedCheque.original_amount === 0) {
        setChequeOriginalAmount("0");
      } else {
        setChequeOriginalAmount(
          search.selfTransportPaymentSelectedCheque.original_amount
        );
      }
    }
  }, [search.selfTransportPaymentSelectedCheque]);

  const handleChoiceSelect = () => {
    setSelectedChoice((choice) => !choice);
  };

  
  // eslint-disable-next-line no-unused-vars
  const handlePriceCharges = (e) => {
    const regex =/^[0-9]+$/;
    if (e === "" || regex.test(e)) {
      setPrice(e);
    }
  };

  return (
    <div>
      <div className={classes.whiteBGContainer}>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={9} md={6} lg={3}>
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
                    selectedChoice ? classes.choice : classes.selectedChoice
                  }
                  onClick={() => {
                    handleChoiceSelect();
                    dispatch({
                      type: gateInEdit.selectedContainer.gih_pk
                        ? "EDIT_LOLO_TRANSPORTATION_CHARGES"
                        : "TRANSPORTATION_APPLY_CHARGES",
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
                    selectedChoice ? classes.selectedChoice : classes.choice
                  }
                  onClick={() => {
                    handleChoiceSelect();
                    dispatch({
                      type: gateInEdit.selectedContainer.gih_pk
                        ? "EDIT_LOLO_TRANSPORTATION_CHARGES"
                        : "TRANSPORTATION_APPLY_CHARGES",
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
                Customer Name
                {(selfTransportPayment.apply_charges === "Party" ||
                  gateInEdit.selectedContainer.self_transportation_data
                    .apply_charges === "Party") && (
                  <span style={{ color: "red" }}>*</span>
                )}
                {/* <span style={{ color: "red" }}>*</span> */}
              </Typography>
              <Autocomplete
                value={customerName}
                onChange={(event, newValue) => {
                  setCustomerName(newValue);
                }}
                style={{ padding: 0 }}
                className={classes.autocomplete}
                options={
                  gateIn.allDropDown &&
                  gateIn.allDropDown.party_client_data &&
                  gateIn.allDropDown.party_client_data.map(
                    (option) => option.name
                  )
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    variant="outlined"
                    className={classes.textField}
                    onBlur={(e) => {
                      setCustomerName(e.target.value);
                      dispatch({
                        type: gateInEdit.selectedContainer.gih_pk
                          ? "EDIT_SELF_TRANSPORT_CUSTOMER_NAME"
                          : "TRANSPORTATION_CUSTOMER_NAME",
                        payload: e.target.value,
                      });
                    }}
                    fullWidth
                  />
                )}
              />
            </Grid>
          )}
           <Grid item xs={12} sm={9} md={6} lg={3}>
              <Typography
                variant="subtitle1"
                className={classes.LabelTypography}
              >
                Receipt Number
              </Typography>
              <CustomTextfield
                id="lolo-receipt-number"
                readOnlyP={true}
                value={receiptNumber}
              />
            </Grid>
          
          <Grid item xs={12} sm={9} md={6} lg={3}>
            <Typography variant="subtitle1" className={classes.LabelTypography}>
              Transporter
            </Typography>

            <Autocomplete
              value={transporter}
              onChange={(event, newValue) => {
                setTransporter(newValue);
              }}
              style={{ padding: 0 }}
              className={classes.autocomplete}
              options={
                gateIn.allDropDown &&
                gateIn.allDropDown.transporter &&
                gateIn.allDropDown.transporter.map((option) => option.name)
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  variant="outlined"
                  className={classes.textField}
                  onBlur={(e) => {
                    setTransporter(e.target.value);
                    dispatch({
                      type: gateInEdit.selectedContainer.gih_pk
                        ? "EDIT_SELF_TRANSPORT_TRANSPORTER"
                        : "TRANSPORTATION_TRANSPORTER",
                      payload: e.target.value,
                    });
                  }}
                  fullWidth
                />
              )}
            />
          </Grid>

          <Grid item xs={12} sm={9} md={6} lg={3}>
            <Typography variant="subtitle1" className={classes.LabelTypography}>
              Receipt Date
            </Typography>

            <DatePickerField
              dateId="self-transportation-receipt-date"
              dateValue={receiptDate}
              dateChange={(date) => setReceiptDate(date)}
              dispatchType={
                gateInEdit.selectedContainer.gih_pk
                  ? "EDIT_SELF_TRANSPORT_RECEIPT_DATE"
                  : "TRANSPORTATION_RECEIPT_DATE"
              }
            />
          </Grid>

          <Grid item xs={12} sm={9} md={6} lg={3}>
            <Typography variant="subtitle1" className={classes.LabelTypography}>
              Origin
            </Typography>
            <CustomTextfield
              id="self-transportation-origin"
              handleChange={(e) => setOrigin(e.target.value)}
              value={origin}
              dispatchType={
                gateInEdit.selectedContainer.gih_pk
                  ? "EDIT_SELF_TRANSPORT_ORIGIN"
                  : "TRANSPORTATION_ORIGIN"
              }
            />
          </Grid>
      
          {gateIn.allDropDown && gateIn.allDropDown.payment_type && (
              <Grid item xs={12} sm={6} md={4} lg={3}>
                <Typography
                  variant="subtitle1"
                  className={classes.LabelTypography}
                >
                  Payment Type
                </Typography>
                <Autocomplete
                  value={paymentType}
                  onChange={(event, newValue) => {
                    setPaymentType(newValue);
                  }}
                  style={{ padding: 0 }}
                  className={classes.autocomplete}
                  options={
                    gateIn.allDropDown &&
                    gateIn.allDropDown.payment_type &&
                    gateIn.allDropDown.payment_type.map((option) => option)
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      variant="outlined"
                      className={classes.textField}
                      onBlur={(e) => {
                        setPaymentType(e.target.value);
                      
                        dispatch({
                          type: gateInEdit.selectedContainer.gih_pk
                            ? "EDIT_SELF_TRANSPORT_PAYMENT_TYPE"
                            : "TRANSPORTATION_PAYMENT_TYPE",
                          payload: e.target.value,
                        });
                      }}
                      fullWidth
                    
                      disabled={
                        (
                        gateInEdit.selectedContainer.gih_pk &&
                        gateInEdit.selectedContainer.self_transportation_data.pk &&
                        gateInEdit.selectedContainer.self_transportation_data.payment_type !== "None" ) &&
                       (gateInEdit.selectedContainer.self_transportation_data.is_amt_editable === false)
                      }
                      readOnlyP={gateInEdit.selectedContainer.lolo_data.is_amt_editable === false}
                   
                    />
                  )}
                />
              </Grid>
            )}
            
          <Grid item xs={12} sm={9} md={6} lg={3}>
            <Typography variant="subtitle1" className={classes.LabelTypography}>
            Transportation Amount
            </Typography>

            <CustomTextfield
              id="self-transportation-price"
              handleChange={(e) => setPrice(e.target.value)}
              value={price}
              type={"number"}
              dispatchType={
                gateInEdit.selectedContainer.gih_pk
                  ? "EDIT_SELF_TRANSPORT_PRICE"
                  : "TRANSPORTATION_PRICE"
              }
              disabled={gateInEdit.selectedContainer.lolo_data.is_amt_editable === false}
              readOnlyP={gateInEdit.selectedContainer.lolo_data.is_amt_editable === false}
            />
          </Grid>

          
  

          <Grid item xs={12} sm={9} md={6} lg={3}>
            <Typography variant="subtitle1" className={classes.LabelTypography}>
              Remark
            </Typography>
            <CustomTextfield
              id="self-transportation-remark"
              handleChange={(e) => setTransportationRemark(e.target.value)}
              value={transportationRemark}
              isRemark={true}
              dispatchType={
                gateInEdit.selectedContainer.gih_pk
                  ? "EDIT_SELF_TRANSPORT_REMARK"
                  : "TRANSPORTATION_REMARK"
              }
            />
          </Grid>
        </Grid>
      </div>
      {paymentType === "Cheque" ||
      paymentType === "NEFT" ||
      paymentType === "RTGS" ? (
        <div className={classes.blueBGContainer}>
          <ChequeSearch
            paymentSearchResult={search.selfTransportPaymentSearchResult}
            getSearchResultType="GET_SELF_TRANSPORT_SEARCH_RESULT"
            setSelectedPaymentType="SET_SELECTED_SELF_TRANSPORT_SEARCH"
            updatePaymentType={
              gateInEdit.selectedContainer.gih_pk
                ? "UPDATE_EDIT_CHEQUE_DETAILS_SELF_TRANSPORTATION"
                : "UPDATE_SELF_TRANSPORT_PAYMENT_CHEQUE_UTR_SEARCH_RESULT"
            }
            searchAction={selfTransportSearch}
          />
          <Grid container spacing={3} style={{ marginTop: 12 }}>
            {paymentType === "Cheque" && (
              <Grid item xs={12} sm={9} md={6} lg={3}>
                <Typography
                  variant="subtitle1"
                  className={classes.LabelTypography}
                >
                  Cheque Number <span style={{ color: "red" }}>*</span>
                </Typography>
                <CustomTextfield
                  id="self-transportation-cheque-number"
                  handleChange={(e) => settransportationCheque(e.target.value)}
                  value={transportationCheque}
                  readOnlyP={
                    search.selfTransportPaymentSelectedCheque ? true : false
                  }
                  dispatchType={
                    // search.selfTransportPaymentSelectedCheque
                    //   ? "TRANSPORTATION_PAYMENT_CHEQUE_NUMBER"
                    //   :
                    gateInEdit.selectedContainer.gih_pk
                      ? "EDIT_SELF_TRANSPORT_CHEQUE_NUMBER"
                      : "TRANSPORTATION_PAYMENT_CHEQUE_NUMBER"
                  }
                />
              </Grid>
            )}
            {(paymentType === "NEFT" || paymentType === "RTGS") && (
              <Grid item xs={12} sm={9} md={6} lg={3}>
                <Typography
                  variant="subtitle1"
                  className={classes.LabelTypography}
                >
                  UTR Number <span style={{ color: "red" }}>*</span>
                </Typography>
                <CustomTextfield
                  id="self-transportation-utr-number"
                  handleChange={(e) =>
                    settransportationUTRNumber(e.target.value)
                  }
                  value={transportationUTRNumber}
                  readOnlyP={
                    search.selfTransportPaymentSelectedCheque ? true : false
                  }
                  dispatchType={
                    // gateIn.loloSelectedCheque
                    //   ? "TRANSPORTATION_PAYMENT_UTR_NO"
                    gateInEdit.selectedContainer.gih_pk
                      ? "EDIT_SELF_TRANSPORT_UTR_NUMBER"
                      : "TRANSPORTATION_PAYMENT_UTR_NO"
                  }
                />
              </Grid>
            )}
            <Grid item xs={12} sm={9} md={6} lg={3}>
              <Typography
                variant="subtitle1"
                className={classes.LabelTypography}
              >
                {
                  // search.selfTransportPaymentSelectedCheque ||
                  gateInEdit.selectedContainer.container_data.pk &&
                  gateInEdit.selectedContainer.self_transportation_data
                    .self_transportation_payment &&
                  (gateInEdit.selectedContainer.self_transportation_data
                    .payment_type === "Cheque" ||
                    gateInEdit.selectedContainer.self_transportation_data
                      .payment_type === "NEFT" ||
                    gateInEdit.selectedContainer.self_transportation_data
                      .payment_type === "RTGS") &&
                  gateInEdit.selectedContainer.self_transportation_data
                    .self_transportation_payment.pk &&
                  gateInEdit.selectedContainer.self_transportation_data
                    .self_transportation_payment.quantity !== undefined
                    ? "Remaining Quantity"
                    : `Quantity` 
                }<span style={{ color: "red" }}>*</span>
              </Typography>
              {
                // search.selfTransportPaymentSelectedCheque ||
                gateInEdit.selectedContainer.container_data.pk &&
                gateInEdit.selectedContainer.self_transportation_data
                  .self_transportation_payment &&
                (gateInEdit.selectedContainer.self_transportation_data
                  .payment_type === "Cheque" ||
                  gateInEdit.selectedContainer.self_transportation_data
                    .payment_type === "NEFT" ||
                  gateInEdit.selectedContainer.self_transportation_data
                    .payment_type === "RTGS") &&
                gateInEdit.selectedContainer.self_transportation_data
                  .self_transportation_payment.pk &&
                gateInEdit.selectedContainer.self_transportation_data
                  .self_transportation_payment.quantity !== undefined ? (
                  <CustomTextfield
                    id="self-transportation-quantity"
                    handleChange={(e) => settransportationQty(e.target.value)}
                    value={transportationQty}
                    readOnlyP
                    dispatchType={
                      // search.selfTransportPaymentSelectedCheque
                      //   ? "TRANSPORTATION_PAYMENT_QUANTITY"
                      //   :
                      gateInEdit.selectedContainer.self_transportation_data
                        .self_transportation_payment.remaining
                        ? "EDIT_SELF_TRANSPORT_QUANTITY"
                        : "TRANSPORTATION_PAYMENT_QUANTITY"
                    }
                  />
                ) : (
                  <CustomTextfield
                    id="self-transportation-quantity"
                    handleChange={(e) => settransportationQty(e.target.value)}
                    value={transportationQty}
                    dispatchType={
                      // search.selfTransportPaymentSelectedCheque
                      //   ? "TRANSPORTATION_PAYMENT_QUANTITY"
                      //   :
                      gateInEdit.selectedContainer.gih_pk
                        ? "EDIT_SELF_TRANSPORT_ORIGINAL_QUANTITY"
                        : "TRANSPORTATION_PAYMENT_QUANTITY"
                    }
                  />
                )
              }
            </Grid>
            {
              // search.selfTransportPaymentSelectedCheque ||
              gateInEdit.selectedContainer.container_data.pk &&
              gateInEdit.selectedContainer.self_transportation_data
                .self_transportation_payment &&
              (gateInEdit.selectedContainer.self_transportation_data
                .payment_type === "Cheque" ||
                gateInEdit.selectedContainer.self_transportation_data
                  .payment_type === "NEFT" ||
                gateInEdit.selectedContainer.self_transportation_data
                  .payment_type === "RTGS") &&
              gateInEdit.selectedContainer.self_transportation_data
                .self_transportation_payment.pk &&
              gateInEdit.selectedContainer.self_transportation_data
                .self_transportation_payment.quantity !== undefined ? (
                <Grid item xs={12} sm={9} md={6} lg={3}>
                  <Typography
                    variant="subtitle1"
                    className={classes.LabelTypography}
                  >
                    Original Quantity
                  </Typography>
                  <CustomTextfield
                    id="lolo-original-qty"
                    value={chequeRemainingQty}
                    handleChange={(e) => setChequeRemainingQty(e.target.value)}
                    // readOnlyP={chequeRemainingQty ? true : false}
                    dispatchType={
                      // search.selfTransportPaymentSelectedCheque
                      //   ? "TRANSPORTATION_PAYMENT_ORIGINAL_QUANTITY"
                      //   :
                      gateInEdit.selectedContainer.gih_pk
                        ? "EDIT_SELF_TRANSPORT_ORIGINAL_QUANTITY"
                        : "TRANSPORTATION_PAYMENT_ORIGINAL_QUANTITY"
                    }
                  />
                </Grid>
              ) : null
            }

            {/* transportationChequeAmount */}
            <Grid item xs={12} sm={9} md={6} lg={3}>
              <Typography
                variant="subtitle1"
                className={classes.LabelTypography}
              >
                {
                  // search.selfTransportPaymentSelectedCheque ||
                  gateInEdit.selectedContainer.container_data.pk &&
                  gateInEdit.selectedContainer.self_transportation_data
                    .self_transportation_payment &&
                  (gateInEdit.selectedContainer.self_transportation_data
                    .payment_type === "Cheque" ||
                    gateInEdit.selectedContainer.self_transportation_data
                      .payment_type === "NEFT" ||
                    gateInEdit.selectedContainer.self_transportation_data
                      .payment_type === "RTGS") &&
                  gateInEdit.selectedContainer.self_transportation_data
                    .self_transportation_payment.pk &&
                  gateInEdit.selectedContainer.self_transportation_data
                    .self_transportation_payment.amount !== undefined
                    ? "Remaining Amount"
                    : "Amount"
                }{" "}
                <span style={{ color: "red" }}>*</span>
              </Typography>
              {
                // search.selfTransportPaymentSelectedCheque ||
                gateInEdit.selectedContainer.container_data.pk &&
                gateInEdit.selectedContainer.self_transportation_data
                  .self_transportation_payment &&
                (gateInEdit.selectedContainer.self_transportation_data
                  .payment_type === "Cheque" ||
                  gateInEdit.selectedContainer.self_transportation_data
                    .payment_type === "NEFT" ||
                  gateInEdit.selectedContainer.self_transportation_data
                    .payment_type === "RTGS") &&
                gateInEdit.selectedContainer.self_transportation_data
                  .self_transportation_payment.pk &&
                gateInEdit.selectedContainer.self_transportation_data
                  .self_transportation_payment.amount !== undefined ? (
                  <CustomTextfield
                    id="self-transportation-cheque-amount"
                    handleChange={(e) =>
                      settransportationChequeAmount(e.target.value)
                    }
                    value={transportationChequeAmount}
                    readOnlyP
                    dispatchType={
                      // search.selfTransportPaymentSelectedCheque
                      //   ? "TRANSPORTATION_PAYMENT_CHEQUE_AMOUNT"
                      //   :
                      gateInEdit.selectedContainer.gih_pk
                        ? "EDIT_SELF_TRANSPORT_CHEQUE_AMOUNT"
                        : "TRANSPORTATION_PAYMENT_CHEQUE_AMOUNT"
                    }
                  />
                ) : (
                  <CustomTextfield
                    id="self-transportation-cheque-amount"
                    handleChange={(e) =>
                      settransportationChequeAmount(e.target.value)
                    }
                    value={transportationChequeAmount}
                    dispatchType={
                      // search.selfTransportPaymentSelectedCheque
                      //   ? "TRANSPORTATION_PAYMENT_CHEQUE_AMOUNT"
                      //   :
                      gateInEdit.selectedContainer.gih_pk
                        ? "EDIT_SELF_TRANSPORT_CHEQUE_AMOUNT"
                        : "TRANSPORTATION_PAYMENT_CHEQUE_AMOUNT"
                    }
                  />
                )
              }
            </Grid>
            {
              // search.selfTransportPaymentSelectedCheque ||
              gateInEdit.selectedContainer.container_data.pk &&
              gateInEdit.selectedContainer.self_transportation_data
                .self_transportation_payment &&
              (gateInEdit.selectedContainer.self_transportation_data
                .payment_type === "Cheque" ||
                gateInEdit.selectedContainer.self_transportation_data
                  .payment_type === "NEFT" ||
                gateInEdit.selectedContainer.self_transportation_data
                  .payment_type === "RTGS") &&
              gateInEdit.selectedContainer.self_transportation_data
                .self_transportation_payment.pk &&
              gateInEdit.selectedContainer.self_transportation_data
                .self_transportation_payment.amount !== undefined ? (
                <Grid item xs={12} sm={9} md={6} lg={3}>
                  <Typography
                    variant="subtitle1"
                    className={classes.LabelTypography}
                  >
                    Original Amount
                  </Typography>
                  <CustomTextfield
                    id="lolo-original-amt"
                    value={chequeOriginalAmount}
                    // readOnlyP={true}
                    handleChange={(e) =>
                      setChequeOriginalAmount(e.target.value)
                    }
                    dispatchType={
                      // search.selfTransportPaymentSelectedCheque
                      //   ? "TRANSPORTATION_PAYMENT_CHEQUE_ORIGINAL_AMOUNT"
                      //   :
                      gateInEdit.selectedContainer.gih_pk
                        ? "EDIT_SELF_TRANSPORT_CHEQUE_ORIGINAL_AMOUNT"
                        : "TRANSPORTATION_PAYMENT_CHEQUE_ORIGINAL_AMOUNT"
                    }
                  />
                </Grid>
              ) : null
            }
            <Grid item xs={12} sm={9} md={6} lg={3}>
              <Typography
                variant="subtitle1"
                className={classes.LabelTypography}
              >
                Bank Name {paymentType === "NEFT" || paymentType ==="RTGS" ? " " : <span style={{ color: "red" }}>*</span> }
              
              </Typography>
              <CustomTextfield
                id="self-transportation-bank-name"
                handleChange={(e) => settransportationBankName(e.target.value)}
                value={transportationBankName}
                readOnlyP={
                  search.selfTransportPaymentSelectedCheque ? true : false
                }
                dispatchType={
                  // search.selfTransportPaymentSelectedCheque
                  //   ? "TRANSPORTATION_PAYMENT_BANK_NAME"
                  //   :
                  gateInEdit.selectedContainer.gih_pk
                    ? "EDIT_SELF_TRANSPORT_BANK_NAME"
                    : "TRANSPORTATION_PAYMENT_BANK_NAME"
                }
              />
            </Grid>
            <Grid item xs={12} sm={9} md={6} lg={3}>
              <Typography
                variant="subtitle1"
                className={classes.LabelTypography}
              >
                Date <span style={{ color: "red" }}>*</span>
              </Typography>

              <DatePickerField
                dateId="self-transportation-cheque-date"
                dateValue={transportationChequeDate}
                dateChange={(date) => settransportationChequeDate(date)}
                dispatchType={
                  // search.selfTransportPaymentSelectedCheque
                  //   ? "TRANSPORTATION_PAYMENT_DATE"
                  //   :
                  gateInEdit.selectedContainer.gih_pk
                    ? "EDIT_SELF_TRANSPORT_CHEQUE_DATE"
                    : "TRANSPORTATION_PAYMENT_DATE"
                }
              />
            </Grid>
            <Grid item xs={12} sm={9} md={6} lg={3}>
              <Typography
                variant="subtitle1"
                className={classes.LabelTypography}
              >
                Account Name {paymentType === "NEFT" || paymentType ==="RTGS" ? " " : <span style={{ color: "red" }}>*</span> }
              </Typography>
              <CustomTextfield
                id="self-transportation-acc-name"
                readOnlyP={
                  search.selfTransportPaymentSelectedCheque ? true : false
                }
                handleChange={(e) => {
                  settransportationAccountName(e.target.value);
                }}
                value={transportationAccountName}
                dispatchType={
                  // search.selfTransportPaymentSelectedCheque
                  //   ? "TRANSPORTATION_PAYMENT_ACCOUNT_NAME"
                  //   :
                  gateInEdit.selectedContainer.gih_pk
                    ? "EDIT_SELF_TRANSPORT_ACCOUNT_NAME"
                    : "TRANSPORTATION_PAYMENT_ACCOUNT_NAME"
                }
              />
            </Grid>
            <Grid item xs={12} sm={9} md={6} lg={3}>
              <Typography
                variant="subtitle1"
                className={classes.LabelTypography}
              >
                Account Number {paymentType === "NEFT" || paymentType ==="RTGS" ? " " : <span style={{ color: "red" }}>*</span> }
              </Typography>
              <CustomTextfield
                id="self-transportation-acc-number"
                readOnlyP={
                  search.selfTransportPaymentSelectedCheque ? true : false
                }
                handleChange={(e) => {
                  settransportationAccountNumber(e.target.value);
                }}
                value={transportationAccountNumber}
                dispatchType={
                  // search.selfTransportPaymentSelectedCheque
                  //   ? "TRANSPORTATION_PAYMENT_ACCOUNT_NUMBER"
                  //   :
                  gateInEdit.selectedContainer.gih_pk
                    ? "EDIT_SELF_TRANSPORT_ACCOUNT_NUMBER"
                    : "TRANSPORTATION_PAYMENT_ACCOUNT_NUMBER"
                }
              />
            </Grid>
            {chequeListOfContainers && chequeListOfContainers.length > 0 && (
              <Grid item xs={12} sm={9} md={6} lg={3}>
                <Typography
                  variant="subtitle1"
                  className={classes.LabelTypography}
                >
                  List of containers
                </Typography>

                <TextField
                  id="self transport-list-of-containers"
                  multiline
                  rows={chequeListOfContainers.length + 1}
                  defaultValue={chequeListOfContainers.join("\n")}
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

export default TransporterPayment;
