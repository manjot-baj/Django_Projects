import React, { useState, useEffect } from "react";
import {
  makeStyles,
  Typography,
  Paper,
  TextField,
  MenuItem,
  Button,
  Grid,
  FormControlLabel,
  Radio,
} from "@material-ui/core";
import CustomTextfield from "./reusableComponents/GateInTextField";
import DatePickerField from "./reusableComponents/DatePickerField";
import ChequeSearch from "./reusableComponents/ChequeSearch";
import TransporterPayment from "./TransporterPayment";
import { useDispatch, useSelector } from "react-redux";
import {
  loloPaymentSearch,
  setCustomerNameVal,
} from "../actions/GateInActions";
import Autocomplete from "@material-ui/lab/Autocomplete";
import { useSnackbar } from "notistack";

const useStyles = makeStyles((theme) => ({
  paperContainer: {
    paddingTop: 18,
    paddingBottom: 20,
  },
  textField: {
    "& .MuiOutlinedInput-root": {
      "& fieldset": {
        borderColor: "#243545",
      },
    },
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
    "& input": {
      textTransform: "uppercase",
    },
  },
}));

const PaymentDetails = (props) => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const notify = useSnackbar().enqueueSnackbar;
  const store = useSelector((state) => state);
  const {
    gateIn,
    gateInEdit,
    search,
    loloPayment,
    AdvanceFinanceReducer,
    user,
    gateInDetails
  } = store;
  const { preGateInFetch } = AdvanceFinanceReducer;
  const { todayDate } = props;
  // LINE PARTY SELECT
  const [selectedChoice, setSelectedChoice] = React.useState(false);
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [receiptNumber, setReceiptNumber] = useState("");
  const [receiptDate, setReceiptDate] = useState("");
  const [loloType, setLoloType] = useState("");
  const [paymentType, setPaymentType] = useState("");
  const [loloAmount, setLoloAmount] = useState("");
  const [loloRemark, setLoloRemark] = useState("");
  const [loloCheque, setLoloCheque] = useState("");
  const [loloQty, setLoloQty] = useState("");
  const [loloUTRNumber, setLoloUTRNumber] = useState("");
  const [loloPaymentChequeAmount, setLoloPaymentChequeAmount] = useState("");
  const [loloBankName, setLoloBankName] = useState("");
  const [loloChequeDate, setLoloChequeDate] = useState("");
  const [loloAccountNumber, setLoloAccountNumber] = useState("");
  const [loloAccountName, setLoloAccountName] = useState("");
  const [loloNightCharges, setLoloNightCharges] = useState(false);
  const [chequeOriginalQty, setChequeOriginalQty] = useState(null);
  const [chequeListOfContainers, setListOfContainers] = useState([]);
  const [chequeOriginalAmount, setChequeOriginalAmount] = useState(null);

  useEffect(() => {
    if (gateInEdit.selectedContainer.container_data.container_no) {
      // APPLY CHARGES

      if (gateInEdit.selectedContainer.lolo_data.apply_charges === "Party") {
        setSelectedChoice(true);
      }

      if (search.loloSelectedCheque) {
        if (gateInEdit.selectedContainer.self_transportation_data !== "") {
          dispatch({
            type: "TOGGLE_SELF_TRANSPORT",
            payload: true,
          });
        } else {
          dispatch({
            type: "TOGGLE_SELF_TRANSPORT",
            payload: false,
          });
        }
      }

      // RECEIPT DATE

      setReceiptDate(gateInEdit.selectedContainer.lolo_data.receipt_date);
      setLoloNightCharges(
        gateInEdit?.selectedContainer?.lolo_data?.is_night_charges_applied
      );

      // CUSTOMER NAME

      if (gateInEdit.selectedContainer.lolo_data.customer_name !== "") {
        dispatch(
          setCustomerNameVal(
            gateInEdit.selectedContainer.lolo_data.customer_name,
            setCustomerName
          )
        );
      }

      // Payment Type
      setPaymentType(gateInEdit.selectedContainer.lolo_data.payment_type);
      // LOLO TYPE
      setLoloType(gateInEdit.selectedContainer.lolo_data.lolo_type);
      // LOLO AMOUNT
      setLoloAmount(gateInEdit.selectedContainer.lolo_data.lolo_amount);
      // LOLO REMARK
      setLoloRemark(gateInEdit.selectedContainer.lolo_data.remark);

      if (gateInEdit.selectedContainer.lolo_data.lolo_payment.pk) {
        // LOLO CHEQUE NUMBER
        setLoloCheque(
          gateInEdit.selectedContainer.lolo_data.lolo_payment.cheque_no
        );
        // LOLO UTR NUMBER
        setLoloUTRNumber(
          gateInEdit.selectedContainer.lolo_data.lolo_payment.utr_no
        );
        // CHEQUE QUANTITY
        setLoloQty(
          gateInEdit.selectedContainer.lolo_data.lolo_payment.remaining
        );

        // CHEQUE AMOUNT
        if (gateInEdit.selectedContainer.lolo_data.lolo_payment.amount === 0)
          setLoloPaymentChequeAmount("0");
        else
          setLoloPaymentChequeAmount(
            gateInEdit.selectedContainer.lolo_data.lolo_payment.amount
          );
        // cHEQUE BANK NAME
        setLoloBankName(
          gateInEdit.selectedContainer.lolo_data.lolo_payment.bank_name
        );
        // CHEQUE DATE
        setLoloChequeDate(
          gateInEdit.selectedContainer.lolo_data.lolo_payment.date
        );
        // ACCOUNT NAME
        setLoloAccountName(
          gateInEdit.selectedContainer.lolo_data.lolo_payment.account_name
        );
        // ACCOUNT NUMBER
        setLoloAccountNumber(
          gateInEdit.selectedContainer.lolo_data.lolo_payment.account_no
        );
        // REMAINING QTY
        if (gateInEdit.selectedContainer.lolo_data.lolo_payment.quantity === 0)
          setChequeOriginalQty("0");
        else
          setChequeOriginalQty(
            gateInEdit.selectedContainer.lolo_data.lolo_payment.quantity
          );
        // List OF containers
        setListOfContainers(
          gateInEdit.selectedContainer.lolo_data.lolo_payment.container
        );
        // CHEQUE ORIGINAL AMOUNT
        if (
          gateInEdit.selectedContainer.lolo_data.lolo_payment
            .original_amount === 0
        ) {
          setChequeOriginalAmount("0");
        } else {
          setChequeOriginalAmount(
            gateInEdit.selectedContainer.lolo_data.lolo_payment.original_amount
          );
        }
      }

      // RECEIPT NUMBER
      setReceiptNumber(gateInEdit.selectedContainer.lolo_data.receipt_no);
      // INVOICE NUMBER
      setInvoiceNumber(gateInEdit.selectedContainer.lolo_data.invoice_no); //gateInEdit.selectedContainer.gih_pk //
    } else {
      // set normal
      // setReceiptDate(todayDate);
      // setLoloChequeDate(todayDate);
    }
  }, [gateInEdit.selectedContainer]);

  useEffect(() => {
    // CHEQUE SEARCH
    if (search.loloSelectedCheque) {
      setLoloCheque(search.loloSelectedCheque.cheque_no);
      setLoloUTRNumber(search.loloSelectedCheque.utr_no);
      setLoloQty(search.loloSelectedCheque.remaining);

      if (search.loloSelectedCheque.amount === 0)
        setLoloPaymentChequeAmount("0");
      else setLoloPaymentChequeAmount(search.loloSelectedCheque.amount);
      setLoloBankName(search.loloSelectedCheque.bank_name);
      setLoloChequeDate(search.loloSelectedCheque.date);
      setLoloAccountName(search.loloSelectedCheque.account_name);
      setLoloAccountNumber(search.loloSelectedCheque.account_no);
      if (search.loloSelectedCheque.quantity === 0) setChequeOriginalQty("0");
      else setChequeOriginalQty(search.loloSelectedCheque.quantity);
      setListOfContainers(search.loloSelectedCheque.container);
      // CHEQUE ORIGINAL AMOUNT
      if (search.loloSelectedCheque.original_amount === 0) {
        setChequeOriginalAmount("0");
      } else {
        setChequeOriginalAmount(search.loloSelectedCheque.original_amount);
      }
    }
  }, [search.loloSelectedCheque]);

  useEffect(() => {
    if (gateInEdit.selectedContainer.container_data.pk) {
      if (gateInEdit.selectedContainer.self_transportation_data !== "") {
        dispatch({
          type: "TOGGLE_SELF_TRANSPORT",
          payload: true,
        });
      } else {
        dispatch({
          type: "TOGGLE_SELF_TRANSPORT",
          payload: false,
        });
      }
    }
  }, [gateInEdit.selectedContainer.self_transportation_data]);

  const handleChoiceSelect = () => {
    setSelectedChoice((choice) => !choice);
  };

  const handleLineSelect = () => {
    if (preGateInFetch?.payment_type ==="Advance") {
      return
    }
    handleChoiceSelect();
    dispatch({
      type: gateInEdit.selectedContainer.gih_pk
        ? "EDIT_LOLO_APPLY_CHARGES"
        : "LOLO_APPLY_CHARGES",
      payload: "Line",
    });
  };

  const handlePartySelect = () => {
    handleChoiceSelect();

    dispatch({
      type: gateInEdit.selectedContainer.gih_pk
        ? "EDIT_LOLO_APPLY_CHARGES"
        : "LOLO_APPLY_CHARGES",
      payload: "Party",
    });
  };

  useEffect(() => {
    if (preGateInFetch !== null) {
      if (preGateInFetch === "Party") {
        handlePartySelect();
      } else {
        handleLineSelect();
      }
      setCustomerName(preGateInFetch.customer_name);
      setPaymentType(preGateInFetch.payment_type);
      setLoloAmount(preGateInFetch.lolo_amount);
    }
  }, [preGateInFetch]);


  useEffect(() => {
    if (!gateInEdit.selectedContainer.gih_pk) {
      if (
        gateInDetails.arrived === "Road/Rail" ||
        gateInDetails.arrived === "Port/Vessel"
      ) {
        handleLineSelect();
      } else if (
        gateInDetails.arrived === "Factory" ||
        gateInDetails.arrived === "CFS/ICD"
      ) {
        handlePartySelect();
      } else {
        handleLineSelect();
      }
    }
  }, [gateInDetails.arrived]);
  
  return (
    <div>
      <Typography
        variant="subtitle2"
        style={{ paddingTop: 14, paddingBottom: 14 }}
      >
        Payment details
      </Typography>
      <Paper className={classes.paperContainer} elevation={0}>
        <Typography
          variant="subtitle2"
          style={{
            paddingTop: 4,
            paddingBottom: 4,
            paddingLeft: 18,
            paddingRight: 18,
            opacity: 1,
            color: "#2F6FB7",
            fontWeight: "bold",
            width: "max-content",
          }}
        >
          LOLO
        </Typography>
        <div className={classes.whiteBGContainer}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={4} lg={3}>
              <Typography
                variant="subtitle1"
                className={classes.LabelTypography}
              >
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
                      (loloPayment.apply_charges === "Line" &&
                        gateInEdit.selectedContainer.lolo_data.apply_charges ===
                          "") ||
                      gateInEdit.selectedContainer.lolo_data.apply_charges ===
                        "Line"
                        ? classes.selectedChoice
                        : classes.choice
                    }
                    onClick={() => {
                      if (
                        gateInDetails.arrived === "FS RETURN" ||
                        gateInEdit.selectedContainer.gih_pk
                      ) {
                        if (gateInEdit.selectedContainer.gih_pk) {
                          if (
                            gateInEdit.selectedContainer.gate_in_data
                              .arrived === "Factory" ||
                            gateInEdit.selectedContainer.gate_in_data
                              .arrived === "CFS/ICD"
                          ) {
                            notify(
                              "Apply Charges can only be changed in case of FS RETURN",
                              { variant: "info" }
                            );
                          } else {
                            handleLineSelect();
                          }
                        } else {
                          handleLineSelect();
                        }
                      } else {
                        notify(
                          "Apply Charges can only be changed in case of FS RETURN",
                          { variant: "info" }
                        );
                      }
                    }}
                  >
                    Line
                  </Button>
                </Grid>
                <Grid item xs={6}>
                  <Button
                    className={
                      (loloPayment.apply_charges === "Party" &&
                        gateInEdit.selectedContainer.lolo_data.apply_charges ===
                          "") ||
                      gateInEdit.selectedContainer.lolo_data.apply_charges ===
                        "Party"
                        ? classes.selectedChoice
                        : classes.choice
                    }
                    onClick={() => {
                      if (
                        gateInDetails.arrived === "FS RETURN" ||
                        gateInEdit.selectedContainer.gih_pk
                      ) {
                        if (gateInEdit.selectedContainer.gih_pk) {
                          if (
                            gateInEdit.selectedContainer.gate_in_data
                              .arrived === "Road/Rail" ||
                            gateInEdit.selectedContainer.gate_in_data
                              .arrived === "Port/Vessel"
                          ) {
                            notify(
                              "Apply Charges can only be changed in case of FS RETURN",
                              { variant: "info" }
                            );
                          } else {
                            handlePartySelect();
                          }
                        } else {
                          handlePartySelect();
                        }
                      } else {
                        notify(
                          "Apply Charges can only be changed in case of FS RETURN",
                          { variant: "info" }
                        );
                      }
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
                  {(loloPayment.apply_charges === "Party" ||
                    gateInEdit.selectedContainer.lolo_data.apply_charges ===
                      "Party") && <span style={{ color: "red" }}>*</span>}
                </Typography>
                {(preGateInFetch !== null ||gateInEdit.selectedContainer.lolo_data.payment_type ==="Advance")? (
                  <CustomTextfield value={customerName} readOnlyP={true} />
                ) : (
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
                              ? "EDIT_LOLO_CUSTOMER_NAME"
                              : "LOLO_CUSTOMER_NAME",
                            payload: e.target.value,
                          });
                        }}
                        fullWidth
                      />
                    )}
                  />
                )}
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
                id="lolo-receipt-number"
                readOnlyP={true}
                value={receiptNumber}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={4} lg={3}>
              <Typography
                variant="subtitle1"
                className={classes.LabelTypography}
              >
                Receipt Date
              </Typography>

              <DatePickerField
                dateId="lolo-receipt-date"
                dateValue={receiptDate}
                dateChange={(date) => setReceiptDate(date)}
                dispatchType={
                  gateInEdit.selectedContainer.lolo_data.receipt_date
                    ? "EDIT_LOLO_RECEIPT_DATE"
                    : "LOLO_RECEIPT_DATE"
                }
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4} lg={3}>
              <Typography
                variant="subtitle1"
                className={classes.LabelTypography}
              >
                LOLO Type
              </Typography>

              <TextField
                id="lolo-type"
                select
                value={loloType}
                variant="outlined"
                fullWidth
                className={classes.textField}
                inputProps={{ className: classes.input }}
                onChange={(e) => {
                  setLoloType(e.target.value);
                  dispatch({
                    type: gateInEdit.selectedContainer.gih_pk
                      ? "EDIT_LOLO_TYPE"
                      : "LOLO_TYPE",
                    payload: e.target.value,
                  });
                }}
              >
                {gateIn.allDropDown &&
                  gateIn.allDropDown.lolo_type &&
                  gateIn.allDropDown.lolo_type.map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
              </TextField>
            </Grid>

            {gateIn.allDropDown && gateIn.allDropDown.payment_type && (
              <Grid item xs={12} sm={6} md={4} lg={3}>
                <Typography
                  variant="subtitle1"
                  className={classes.LabelTypography}
                >
                  Payment Type
                </Typography>
                {(preGateInFetch !== null ||gateInEdit.selectedContainer.lolo_data.payment_type ==="Advance") ? (
                  <CustomTextfield value={paymentType} readOnlyP={true} />
                ) : (
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
                    disabled={
                      gateInEdit.selectedContainer.lolo_data.is_amt_editable ===
                      false
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
                              ? "EDIT_LOLO_PAYMENT_TYPE"
                              : "LOLO_PAYMENT_TYPE",
                            payload: e.target.value,
                          });
                        }}
                        fullWidth
                        disabled={
                          gateInEdit.selectedContainer.gih_pk &&
                          gateInEdit.selectedContainer.lolo_data
                            .payment_type !== "None" &&
                          gateInEdit.selectedContainer.lolo_data
                            .is_amt_editable === false
                        }
                        readOnlyP={
                          gateInEdit.selectedContainer.lolo_data
                            .is_amt_editable === false
                        }
                      />
                    )}
                  />
                )}
              </Grid>
            )}

            <Grid item xs={12} sm={6} md={4} lg={3}>
              <Typography
                variant="subtitle1"
                className={classes.LabelTypography}
              >
                LOLO Amount <span style={{ color: "red" }}>*</span>
              </Typography>

              {(preGateInFetch !== null ||gateInEdit.selectedContainer.lolo_data.payment_type ==="Advance") ? (
                <CustomTextfield value={loloAmount} readOnlyP={true} />
              ) : (
                <CustomTextfield
                  id="lolo-amount"
                  handleChange={(e) => setLoloAmount(e.target.value)}
                  value={loloAmount}
                  dispatchType={
                    gateInEdit.selectedContainer.gih_pk
                      ? "EDIT_LOLO_AMOUNT"
                      : "LOLO_AMOUNT"
                  }
                  disabled={
                    gateInEdit.selectedContainer.lolo_data.is_amt_editable &&
                    gateInEdit.selectedContainer.self_transportation_data
                      .is_amt_editable === false
                  }
                  readOnlyP={
                    gateInEdit.selectedContainer.lolo_data.is_amt_editable &&
                    gateInEdit.selectedContainer.self_transportation_data
                      .is_amt_editable === false
                  }
                />
              )}
            </Grid>
            <Grid item xs={12} sm={6} md={4} lg={3}>
              <Typography
                variant="subtitle1"
                className={classes.LabelTypography}
              >
                Remark
              </Typography>
              <CustomTextfield
                id="lolo-remark"
                handleChange={(e) => setLoloRemark(e.target.value)}
                isRemark={true}
                value={loloRemark}
                dispatchType={
                  gateInEdit.selectedContainer.lolo_data.remark
                    ? "EDIT_LOLO_REMARK"
                    : "LOLO_REMARK"
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
              paymentSearchResult={search.loloPaymentSearchResult}
              getSearchResultType="GET_LOLO_PAYMENT_SEARCH_RESULT"
              setSelectedPaymentType="SET_SELECTED_LOLO_PAYMENT_SEARCH"
              updatePaymentType={
                gateInEdit.selectedContainer.gih_pk
                  ? "UPDATE_EDIT_CHEQUE_DETAILS"
                  : "UPDATE_LOLO_PAYMENT_CHEQUE_UTR_SEARCH_RESULT"
              }
              searchAction={loloPaymentSearch}
            />
            <Grid container spacing={3} style={{ marginTop: 12 }}>
              {paymentType === "Cheque" && (
                <Grid item xs={12} sm={6} md={4} lg={3}>
                  <Typography
                    variant="subtitle1"
                    className={classes.LabelTypography}
                  >
                    Cheque Number <span style={{ color: "red" }}>*</span>
                  </Typography>
                  <CustomTextfield
                    id="lolo-cheque-number"
                    handleChange={(e) => setLoloCheque(e.target.value)}
                    value={loloCheque}
                    readOnlyP={search.loloSelectedCheque ? true : false}
                    dispatchType={
                      // search.loloSelectedCheque
                      //   ? "LOLO_PAYMENT_CHEQUE_NUMBER"
                      //   :
                      gateInEdit.selectedContainer.gih_pk
                        ? "EDIT_LOLO_CHEQUE_NUMBER"
                        : "LOLO_PAYMENT_CHEQUE_NUMBER"
                    }
                  />
                </Grid>
              )}
              {(paymentType === "NEFT" || paymentType === "RTGS") && (
                <Grid item xs={12} sm={6} md={4} lg={3}>
                  <Typography
                    variant="subtitle1"
                    className={classes.LabelTypography}
                  >
                    UTR Number <span style={{ color: "red" }}>*</span>
                  </Typography>
                  <CustomTextfield
                    id="lolo-utr-number"
                    handleChange={(e) => setLoloUTRNumber(e.target.value)}
                    value={loloUTRNumber}
                    readOnlyP={search.loloSelectedCheque ? true : false}
                    dispatchType={
                      // search.loloSelectedCheque
                      //   ? "LOLO_PAYMENT_UTR_NO"
                      //   :
                      gateInEdit.selectedContainer.gih_pk
                        ? "EDIT_LOLO_UTR_NUMBER"
                        : "LOLO_PAYMENT_UTR_NO"
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
                    // search.loloSelectedCheque ||
                    gateInEdit.selectedContainer.container_data.pk &&
                    (gateInEdit.selectedContainer.lolo_data.payment_type ===
                      "Cheque" ||
                      gateInEdit.selectedContainer.lolo_data.payment_type ===
                        "NEFT" ||
                      gateInEdit.selectedContainer.lolo_data.payment_type ===
                        "RTGS") &&
                    gateInEdit.selectedContainer.lolo_data.lolo_payment.pk &&
                    gateInEdit.selectedContainer.lolo_data.lolo_payment
                      .quantity !== "0"
                      ? "Remaining Quantity"
                      : "Quantity"
                  }
                  <span style={{ color: "red" }}>*</span>
                </Typography>
                {
                  // search.loloSelectedCheque ||
                  gateInEdit.selectedContainer.container_data.pk &&
                  (gateInEdit.selectedContainer.lolo_data.payment_type ===
                    "Cheque" ||
                    gateInEdit.selectedContainer.lolo_data.payment_type ===
                      "NEFT" ||
                    gateInEdit.selectedContainer.lolo_data.payment_type ===
                      "RTGS") &&
                  gateInEdit.selectedContainer.lolo_data.lolo_payment.pk &&
                  gateInEdit.selectedContainer.lolo_data.lolo_payment
                    .quantity !== "0" ? (
                    <CustomTextfield
                      id="lolo-quantity"
                      handleChange={(e) => setLoloQty(e.target.value)}
                      value={loloQty}
                      readOnlyP
                      dispatchType={
                        // search.loloSelectedCheque
                        //   ? "LOLO_PAYMENT_QUANTITY"
                        //   :
                        gateInEdit.selectedContainer.lolo_data.lolo_payment
                          .remaining
                          ? "EDIT_LOLO_ORIGINAL_QUANTITY"
                          : "LOLO_PAYMENT_QUANTITY"
                      }
                    />
                  ) : (
                    <CustomTextfield
                      id="lolo-quantity"
                      handleChange={(e) => setLoloQty(e.target.value)}
                      value={loloQty}
                      dispatchType={
                        // search.loloSelectedCheque
                        //   ? "LOLO_PAYMENT_QUANTITY"
                        //   :
                        gateInEdit.selectedContainer.gih_pk
                          ? "EDIT_LOLO_QUANTITY"
                          : "LOLO_PAYMENT_QUANTITY"
                      }
                    />
                  )
                }
              </Grid>
              {
                // search.loloSelectedCheque ||
                gateInEdit.selectedContainer.container_data.pk &&
                (gateInEdit.selectedContainer.lolo_data.payment_type ===
                  "Cheque" ||
                  gateInEdit.selectedContainer.lolo_data.payment_type ===
                    "NEFT" ||
                  gateInEdit.selectedContainer.lolo_data.payment_type ===
                    "RTGS") &&
                gateInEdit.selectedContainer.lolo_data.lolo_payment.pk &&
                gateInEdit.selectedContainer.lolo_data.lolo_payment.quantity !==
                  "0" ? (
                  <Grid item xs={12} sm={6} md={4} lg={3}>
                    <Typography
                      variant="subtitle1"
                      className={classes.LabelTypography}
                    >
                      Original Quantity
                    </Typography>
                    <CustomTextfield
                      id="lolo-remaining-qty"
                      handleChange={(e) => setChequeOriginalQty(e.target.value)}
                      value={chequeOriginalQty}
                      dispatchType={
                        // search.loloSelectedCheque
                        //   ? "LOLO_PAYMENT_ORIGINAL_QUANTITY"
                        //   :
                        gateInEdit.selectedContainer.gih_pk
                          ? "EDIT_LOLO_QUANTITY"
                          : "LOLO_PAYMENT_ORIGINAL_QUANTITY"
                      }
                    />
                  </Grid>
                ) : null
              }

              {/* AMOUNT  */}
              <Grid item xs={12} sm={6} md={4} lg={3}>
                <Typography
                  variant="subtitle1"
                  className={classes.LabelTypography}
                >
                  {
                    // search.loloSelectedCheque ||
                    gateInEdit.selectedContainer.container_data.pk &&
                    (gateInEdit.selectedContainer.lolo_data.payment_type ===
                      "Cheque" ||
                      gateInEdit.selectedContainer.lolo_data.payment_type ===
                        "NEFT" ||
                      gateInEdit.selectedContainer.lolo_data.payment_type ===
                        "RTGS") &&
                    gateInEdit.selectedContainer.lolo_data.lolo_payment.pk &&
                    gateInEdit.selectedContainer.lolo_data.lolo_payment
                      .original_amount !== "0.00"
                      ? "Remaining Amount"
                      : "Amount"
                  }{" "}
                  <span style={{ color: "red" }}>*</span>
                </Typography>
                {
                  // search.loloSelectedCheque ||
                  gateInEdit.selectedContainer.container_data.pk &&
                  (gateInEdit.selectedContainer.lolo_data.payment_type ===
                    "Cheque" ||
                    gateInEdit.selectedContainer.lolo_data.payment_type ===
                      "NEFT" ||
                    gateInEdit.selectedContainer.lolo_data.payment_type ===
                      "RTGS") &&
                  gateInEdit.selectedContainer.lolo_data.lolo_payment.pk &&
                  gateInEdit.selectedContainer.lolo_data.lolo_payment
                    .original_amount !== "0.00" ? (
                    <CustomTextfield
                      id="lolo-payment-cheque-amount"
                      handleChange={(e) =>
                        setLoloPaymentChequeAmount(e.target.value)
                      }
                      readOnlyP
                      value={loloPaymentChequeAmount}
                      dispatchType={
                        // search.loloSelectedCheque
                        //   ? "LOLO_PAYMENT_CHEQUE_AMOUNT"
                        //   :
                        gateInEdit.selectedContainer.gih_pk
                          ? "EDIT_LOLO_CHEQUE_AMOUNT"
                          : "LOLO_PAYMENT_CHEQUE_AMOUNT"
                      }
                    />
                  ) : (
                    <CustomTextfield
                      id="lolo-payment-cheque-amount"
                      handleChange={(e) =>
                        setLoloPaymentChequeAmount(e.target.value)
                      }
                      value={loloPaymentChequeAmount}
                      dispatchType={
                        // search.loloSelectedCheque
                        //   ? "LOLO_PAYMENT_CHEQUE_AMOUNT"
                        //   :
                        gateInEdit.selectedContainer.gih_pk
                          ? "EDIT_LOLO_CHEQUE_AMOUNT"
                          : "LOLO_PAYMENT_CHEQUE_AMOUNT"
                      }
                    />
                  )
                }
              </Grid>
              {
                // search.loloSelectedCheque ||
                gateInEdit.selectedContainer.container_data.pk &&
                (gateInEdit.selectedContainer.lolo_data.payment_type ===
                  "Cheque" ||
                  gateInEdit.selectedContainer.lolo_data.payment_type ===
                    "NEFT" ||
                  gateInEdit.selectedContainer.lolo_data.payment_type ===
                    "RTGS") &&
                gateInEdit.selectedContainer.lolo_data.lolo_payment.pk &&
                gateInEdit.selectedContainer.lolo_data.lolo_payment
                  .original_amount !== "0.00" ? (
                  <Grid item xs={12} sm={6} md={4} lg={3}>
                    <Typography
                      variant="subtitle1"
                      className={classes.LabelTypography}
                    >
                      Original Amount
                      <span style={{ color: "red" }}>*</span>
                    </Typography>
                    <CustomTextfield
                      id="lolo-original-amount"
                      handleChange={(e) =>
                        setChequeOriginalAmount(e.target.value)
                      }
                      value={chequeOriginalAmount}
                      dispatchType={
                        // search.loloSelectedCheque
                        //   ? "LOLO_PAYMENT_CHEQUE_ORIGNAL_AMOUNT"
                        //   :
                        gateInEdit.selectedContainer.gih_pk
                          ? "EDIT_LOLO_ORIGINAL_AMOUNT"
                          : "LOLO_PAYMENT_CHEQUE_ORIGNAL_AMOUNT"
                      }
                      // readOnlyP={true}
                    />
                  </Grid>
                ) : null
              }
              <Grid item xs={12} sm={6} md={4} lg={3}>
                <Typography
                  variant="subtitle1"
                  className={classes.LabelTypography}
                >
                  Bank Name{" "}
                  {paymentType === "NEFT" || paymentType === "RTGS" ? (
                    " "
                  ) : (
                    <span style={{ color: "red" }}>*</span>
                  )}
                </Typography>
                <CustomTextfield
                  id="lolo-bank-name"
                  handleChange={(e) => setLoloBankName(e.target.value)}
                  value={loloBankName}
                  readOnlyP={search.loloSelectedCheque ? true : false}
                  dispatchType={
                    // search.loloSelectedCheque
                    //   ? "LOLO_PAYMENT_BANK_NAME"
                    //   :
                    gateInEdit.selectedContainer.gih_pk
                      ? "EDIT_LOLO_BANK_NAME"
                      : "LOLO_PAYMENT_BANK_NAME"
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
                  dateId="lolo-cheque-date"
                  dateValue={loloChequeDate}
                  dateChange={(date) => setLoloChequeDate(date)}
                  dispatchType={
                    // search.loloSelectedCheque
                    //   ? "LOLO_PAYMENT_DATE"
                    //   :
                    gateInEdit.selectedContainer.gih_pk
                      ? "EDIT_LOLO_CHEQUE_DATE"
                      : "LOLO_PAYMENT_DATE"
                  }
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4} lg={3}>
                <Typography
                  variant="subtitle1"
                  className={classes.LabelTypography}
                >
                  Account Name{" "}
                  {paymentType === "NEFT" || paymentType === "RTGS" ? (
                    " "
                  ) : (
                    <span style={{ color: "red" }}>*</span>
                  )}
                </Typography>
                <CustomTextfield
                  id="lolo-acc-name"
                  handleChange={(e) => {
                    setLoloAccountName(e.target.value);
                  }}
                  value={loloAccountName}
                  readOnlyP={search.loloSelectedCheque ? true : false}
                  dispatchType={
                    // search.loloSelectedCheque
                    //   ? "LOLO_PAYMENT_ACCOUNT_NAME"
                    //   :
                    gateInEdit.selectedContainer.gih_pk
                      ? "EDIT_LOLO_ACCOUNT_NAME"
                      : "LOLO_PAYMENT_ACCOUNT_NAME"
                  }
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4} lg={3}>
                <Typography
                  variant="subtitle1"
                  className={classes.LabelTypography}
                >
                  Account Number{" "}
                  {paymentType === "NEFT" || paymentType === "RTGS" ? (
                    " "
                  ) : (
                    <span style={{ color: "red" }}>*</span>
                  )}
                </Typography>
                <CustomTextfield
                  id="lolo-acc-number"
                  handleChange={(e) => {
                    setLoloAccountNumber(e.target.value);
                  }}
                  readOnlyP={search.loloSelectedCheque ? true : false}
                  value={loloAccountNumber}
                  dispatchType={
                    // search.loloSelectedCheque
                    //   ? "LOLO_PAYMENT_ACCOUNT_NUMBER"
                    //   :
                    gateInEdit.selectedContainer.gih_pk
                      ? "EDIT_LOLO_ACCOUNT_NUMBER"
                      : "LOLO_PAYMENT_ACCOUNT_NUMBER"
                  }
                />
              </Grid>
              {chequeListOfContainers && chequeListOfContainers.length > 0 && (
                <Grid item xs={12} sm={6} md={4} lg={3}>
                  <Typography
                    variant="subtitle1"
                    className={classes.LabelTypography}
                  >
                    List of containers
                  </Typography>

                  <TextField
                    id="lolo-list-of-containers"
                    multiline
                    rows={
                      chequeListOfContainers && chequeListOfContainers.length
                    }
                    defaultValue={
                      chequeListOfContainers &&
                      chequeListOfContainers.join("\n")
                    }
                    variant="outlined"
                    disabled={true}
                  />
                </Grid>
              )}
            </Grid>
          </div>
        ) : null}
        <Grid container xs={12}>
          <Grid
            item
            xs={12}
            md={5}
            style={{
              display: "flex",
              alignItems: "center",
              // justifyContent: "space-between",
              padding: "2px 2px 8px 18px",
            }}
          >
            <Typography variant="subtitle2">Self Transportation?</Typography>
            <FormControlLabel
              value="yes"
              style={{ marginLeft: 10 }}
              control={
                <Radio
                  style={{ color: "#2F6FB7" }}
                  checked={gateIn.isSelfTransport}
                  onClick={() =>
                    dispatch({
                      type: "TOGGLE_SELF_TRANSPORT",
                      payload: true,
                    })
                  }
                />
              }
              label="Yes"
            />
            <FormControlLabel
              value="no"
              control={
                <Radio
                  style={{ color: "#2F6FB7" }}
                  checked={!gateIn.isSelfTransport}
                  onClick={() =>
                    dispatch({
                      type: "TOGGLE_SELF_TRANSPORT",
                      payload: false,
                    })
                  }
                />
              }
              label="No"
            />
          </Grid>
          <Grid
            item
            md={5}
            xs={12}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-around",
              padding: "2px 10px 8px 0px",
            }}
          >
            <Typography variant="subtitle2">Apply Night Charges</Typography>
            <FormControlLabel
              value="yes"
              control={
                <Radio
                  style={{ color: "#2A5FA5" }}
                  checked={loloNightCharges === true}
                  onClick={() => {
                    setLoloNightCharges(true);
                    dispatch({
                      type: gateInEdit?.selectedContainer?.gih_pk
                        ? "EDIT_IS_NIGHT_CHARGE_APPLY"
                        : "LOLO_NIGHT_CHARGES",
                      payload: true,
                    });
                  }}
                />
              }
              label="Yes"
              disabled={
                gateInEdit?.selectedContainer?.lolo_data
                  ?.is_night_charge_bill_invoiced  || preGateInFetch?.payment_type ==="Advance"
              }
            />
            <FormControlLabel
              value="no"
              control={
                <Radio
                  style={{ color: "#2A5FA5" }}
                  checked={loloNightCharges === false}
                  onClick={() => {
                    setLoloNightCharges(false);
                    dispatch({
                      type: gateInEdit?.selectedContainer?.gih_pk
                        ? "EDIT_IS_NIGHT_CHARGE_APPLY"
                        : "LOLO_NIGHT_CHARGES",
                      payload: false,
                    });
                  }}
                />
              }
              label="No"
              disabled={
                gateInEdit?.selectedContainer?.lolo_data
                  ?.is_night_charge_bill_invoiced
              }
            />
          </Grid>
        </Grid>

        {gateIn.isSelfTransport && <TransporterPayment todayDate={todayDate} />}
      </Paper>
    </div>
  );
};
export default PaymentDetails;
