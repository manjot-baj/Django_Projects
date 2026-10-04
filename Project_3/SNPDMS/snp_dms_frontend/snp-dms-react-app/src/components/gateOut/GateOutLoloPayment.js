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
import { useDispatch, useSelector } from "react-redux";
import {
  loloPaymentSearch,
  setCustomerNameVal,
  dropDownDispatch,
} from "../../actions/GateInActions";
import CustomTextfield from "../reusableComponents/GateInTextField";
import ChequeSearch from "../reusableComponents/ChequeSearch";
import DatePickerField from "../reusableComponents/DatePickerField";
import GateOutSelfTransportPayment from "./GateOutSelfTransportPayment";
import Autocomplete from "@material-ui/lab/Autocomplete";
import { useSnackbar } from "notistack";

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
    "& input": {
      textTransform: "uppercase"
    }
  },
}));

const GateOutLoloPayment = (props) => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const store = useSelector((state) => state);
  const notify = useSnackbar().enqueueSnackbar;
  const { gateOut, gateIn, gateOutLoloPayment, search, gateOutEdit ,AdvanceFinanceReducer,gateOutDetails,user} = store;
  const {preGateOutFetch} =AdvanceFinanceReducer
  const { todayDate } = props;
  // LINE PARTY SELECT
  const [selectedChoice, setSelectedChoice] = React.useState(false);
  const [customerName, setCustomerName] = useState("");
  const [receiptNumber, setReceiptNumber] = useState("");
  const [invoiceDate, setInvoiceDate] = useState("");
  const [receiptDate, setReceiptDate] = useState("");
  const [loloType, setLoloType] = useState("");
  const [paymentType, setPaymentType] = useState("None");
  const [loloAmount, setLoloAmount] = useState("");
  const [loloRemark, setLoloRemark] = useState("");
  const [loloCheque, setLoloCheque] = useState("");
  const [loloQty, setLoloQty] = useState("");
  const [loloUTRNumber, setLoloUTRNumber] = useState("");
  const [loloPaymentChequeAmount, setLoloPaymentChequeAmount] = useState("");
  const [loloBankName, setLoloBankName] = useState("");
  const [loloChequeDate, setLoloChequeDate] = useState("");
  const [loloAccountName, setLoloAccountName] = useState("");
  const [loloAccountNumber, setLoloAccountNumber] = useState("");
  const [chequeOriginalQty, setChequeOriginalQty] = useState(null);
  const [chequeListOfContainers, setListOfContainers] = useState([]);
  const [chequeOriginalAmount, setChequeOriginalAmount] = useState(null);
  const [loloNightCharges, setLoloNightCharges] = useState(false);


  useEffect(() => {
    if (gateOutEdit.selectedContainer.container_data.container_no) {
      // APPLY CHARGES

      if (gateOutEdit.selectedContainer.lolo_data.apply_charges === "Party") {
        setSelectedChoice(true);
      }

      if (search.loloSelectedCheque) {
        if (gateOutEdit.selectedContainer.self_transportation_data !== "") {
          dispatch({
            type: "TOGGLE_GATE_OUT_SELF_TRANSPORT",
            payload: true,
          });
        } else {
          dispatch({
            type: "TOGGLE_GATE_OUT_SELF_TRANSPORT",
            payload: false,
          });
        }
      }

      // CUSTOMER NAME

      if (gateOutEdit.selectedContainer.lolo_data.customer_name) {
        dispatch(
          setCustomerNameVal(
            gateOutEdit.selectedContainer.lolo_data.customer_name,
            setCustomerName
          )
        );
      }

      // RECEIOT DATE

      setReceiptDate(gateOutEdit.selectedContainer.lolo_data.receipt_date);

      // Payment Type
      setPaymentType(gateOutEdit.selectedContainer.lolo_data.payment_type);
      setLoloNightCharges(
        gateOutEdit.selectedContainer.lolo_data.is_night_charges_applied
      );
      // LOLO TYPE
      setLoloType(gateOutEdit.selectedContainer.lolo_data.lolo_type);
      // LOLO AMOUNT
      setLoloAmount(gateOutEdit.selectedContainer.lolo_data.lolo_amount);
      // LOLO REMARK
      setLoloRemark(gateOutEdit.selectedContainer.lolo_data.remark);

      if (gateOutEdit.selectedContainer.lolo_data.lolo_payment?.pk) {
        // LOLO CHEQUE NUMBER
        setLoloCheque(
          gateOutEdit.selectedContainer.lolo_data.lolo_payment.cheque_no
        );
        // LOLO UTR NUMBER
        setLoloUTRNumber(
          gateOutEdit.selectedContainer.lolo_data.lolo_payment.utr_no
        );
        // CHEQUE QUANTITY
        setLoloQty(
          gateOutEdit.selectedContainer.lolo_data.lolo_payment.remaining
        );

        // CHEQUE AMOUNT
        if (gateOutEdit.selectedContainer.lolo_data.lolo_payment.amount === 0)
          setLoloPaymentChequeAmount("0");
        else
          setLoloPaymentChequeAmount(
            gateOutEdit.selectedContainer.lolo_data.lolo_payment.amount
          );
        // cHEQUE BANK NAME
        setLoloBankName(
          gateOutEdit.selectedContainer.lolo_data.lolo_payment.bank_name
        );
        // CHEQUE DATE
        setLoloChequeDate(
          gateOutEdit.selectedContainer.lolo_data.lolo_payment.date
        );
        // ACCOUNT NAME
        setInvoiceDate( gateOutEdit.selectedContainer.lolo_data.invoice_date)
        setLoloAccountName(
          gateOutEdit.selectedContainer.lolo_data.lolo_payment.account_name
        );
        setLoloAccountNumber(
          gateOutEdit.selectedContainer.lolo_data.lolo_payment.account_no
        );
        // REMAINING QTY
        if (gateOutEdit.selectedContainer.lolo_data.lolo_payment.quantity === 0)
          setChequeOriginalQty("0");
        else
          setChequeOriginalQty(
            gateOutEdit.selectedContainer.lolo_data.lolo_payment.quantity
          );
        // List OF containers
        setListOfContainers(
          gateOutEdit.selectedContainer.lolo_data.lolo_payment.container
        );
        // CHEQUE ORIGINAL AMOUNT
        if (
          gateOutEdit.selectedContainer.lolo_data.lolo_payment
            .original_amount === 0
        ) {
          setChequeOriginalAmount("0");
        } else {
          setChequeOriginalAmount(
            gateOutEdit.selectedContainer.lolo_data.lolo_payment.original_amount
          );
        }
      }
      // RECEIPT NUMBER
      setReceiptNumber(gateOutEdit.selectedContainer.lolo_data.receipt_no);
      
    }
  }, [gateOutEdit.selectedContainer]);

  useEffect(() => {
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
    if (gateOutEdit.selectedContainer.container_data.pk) {
      if (gateOutEdit.selectedContainer.self_transportation_data !== "") {
        dispatch({
          type: "TOGGLE_GATE_OUT_SELF_TRANSPORT",
          payload: true,
        });
      } else {
        dispatch({
          type: "TOGGLE_GATE_OUT_SELF_TRANSPORT",
          payload: false,
        });
      }
    }
  }, [gateOutEdit.selectedContainer.self_transportation_data]);

  useEffect(() => {
    let reqArray = ["party_client_data", "lolo_type", "payment_type"];
    dispatch(dropDownDispatch(reqArray, notify));
  }, []);

  const handleChoiceSelect = () => {
    setSelectedChoice((choice) => !choice);
  };

  const handleLineSelect = () => {
    handleChoiceSelect();
    dispatch({
      type: gateOutEdit.selectedContainer.goh_pk
        ? "EDIT_GATE_OUT_LOLO_APPLY_CHARGES"
        : "GATE_OUT_LOLO_APPLY_CHARGES",
      payload: "Line",
    });
  };

  const handlePartySelect = () => {
    handleChoiceSelect();

    dispatch({
      type: gateOutEdit.selectedContainer.goh_pk
        ? "EDIT_GATE_OUT_LOLO_APPLY_CHARGES"
        : "GATE_OUT_LOLO_APPLY_CHARGES",
      payload: "Party",
    });
  };

  useEffect(()=>{
    if(preGateOutFetch !==null){
      if (preGateOutFetch?.apply_charges ==="Party") {
        handlePartySelect()
      }else{
        handleLineSelect()
      }
      setCustomerName(preGateOutFetch.customer_name)
      setPaymentType(preGateOutFetch.payment_type)
      setLoloAmount(preGateOutFetch.lolo_amount)
    }
},[preGateOutFetch])
  useEffect(() => {
    if (!gateOutEdit.selectedContainer.goh_pk) {
      if (
        gateOutDetails.departed === "Road/Rail" ||
        gateOutDetails.departed === "Port/Vessel"
      ) {
        handleLineSelect();
      } else if (
        gateOutDetails.departed === "Factory" ||
        gateOutDetails.departed === "CFS/ICD"
      ) {
        handlePartySelect();
      } else {
        handleLineSelect();
      }
    }
  }, [gateOutDetails.departed]);

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
            color: "#2F6FB7",
            fontWeight: "bold",
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
                      (gateOutLoloPayment.apply_charges === "Line" &&
                        gateOutEdit.selectedContainer.lolo_data.apply_charges ===
                          "") ||
                      gateOutEdit.selectedContainer.lolo_data.apply_charges ===
                        "Line"
                        ? classes.selectedApplyCharges
                        : classes.choice
                    }
                    onClick={()=>{
                      if (
                        gateOutDetails.departed === "FS RETURN" ||
                         gateOutEdit.selectedContainer.goh_pk || (gateOutDetails.departed ==="Port/Vessel" && user.location ==="West Bengal")
                      ) {
                        if ( gateOutEdit.selectedContainer.goh_pk) {
                          if (
                             gateOutEdit.selectedContainer.gate_out_data
                              .departed === "Factory" ||
                             gateOutEdit.selectedContainer.gate_out_data
                              .departed === "CFS/ICD"
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
                      (gateOutLoloPayment.apply_charges === "Party" &&
                        gateOutEdit.selectedContainer.lolo_data.apply_charges ===
                          "") ||
                      gateOutEdit.selectedContainer.lolo_data.apply_charges ===
                        "Party"
                        ? classes.selectedApplyCharges
                        : classes.choice
                    }
                    onClick={()=>{
                      if (
                        gateOutDetails.departed === "FS RETURN" ||
                        gateOutEdit.selectedContainer.goh_pk ||(gateOutDetails.departed ==="Port/Vessel" && user.location ==="West Bengal")
                      ) {
                        if (gateOutEdit.selectedContainer.goh_pk) {
                          if (
                            gateOutEdit.selectedContainer.gate_out_data
                              .departed === "Road/Rail" ||
                          (  gateOutEdit.selectedContainer.gate_out_data
                              .departed === "Port/Vessel" && user.location !=="West Bengal")
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
                  Customer Name{" "}
                  {(gateOutLoloPayment.apply_charges === "Party" ||
                    gateOutEdit.selectedContainer.lolo_data.apply_charges ===
                    "Party") && <span style={{ color: "red" }}>*</span>}
                </Typography>
               {(preGateOutFetch?.payment_type ==="Advance" ||gateOutEdit.selectedContainer?.lolo_data?.payment_type ==="Advance")?<CustomTextfield value={customerName} readOnlyP={true}/>:<Autocomplete
                  value={customerName}
                  onChange={(event, newValue) => {
                    setCustomerName(newValue);
                  }}
                  style={{ padding: 0 }}
                  className={classes.autocomplete}
                  disabled={
                    gateOutEdit.selectedContainer.goh_pk
                      ? gateOutEdit.selectedContainer.lolo_data
                        .apply_charges === "Line" ||
                      gateOutEdit.selectedContainer.lolo_data
                        .apply_charges === ""
                      : gateOutLoloPayment.apply_charges === "Line" ||
                      gateOutLoloPayment.apply_charges === ""
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
                        setCustomerName(e.target.value);
                        dispatch({
                          type: gateOutEdit.selectedContainer.goh_pk
                            ? "EDIT_GATE_OUT_LOLO_CUSTOMER_NAME"
                            : "GATE_OUT_LOLO_CUSTOMER_NAME",
                          payload: e.target.value,
                        });
                      }}
                      fullWidth
                    />
                  )}
                />}
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
                Invoice Date
              </Typography>

              <DatePickerField
                dateId="gate-out-lolo-invoice-date"
                dateValue={invoiceDate}
                dateChange={(date) => setInvoiceDate(date)}
                dispatchType={
                  gateOutEdit.selectedContainer.goh_pk
                    ? "EDIT_GATE_OUT_LOLO_INVOICE_DATE"
                    : "GATE_OUT_LOLO_INVOICE_DATE"
                }
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
                dateId="gate-out-lolo-receipt-date"
                dateValue={receiptDate}
                dateChange={(date) => setReceiptDate(date)}
                dispatchType={
                  gateOutEdit.selectedContainer.goh_pk
                    ? "EDIT_GATE_OUT_LOLO_RECEIPT_DATE"
                    : "GATE_OUT_LOLO_RECEIPT_DATE"
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
                id="gate-out-lolo-type"
                select
                value={loloType}
                variant="outlined"
                fullWidth
                inputProps={{ className: classes.input }}
                onChange={(e) => {
                  setLoloType(e.target.value);

                  dispatch({
                    type: gateOutEdit.selectedContainer.goh_pk
                      ? "EDIT_GATE_OUT_LOLO_TYPE"
                      : "GATE_OUT_LOLO_TYPE",
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
            <Grid item xs={12} sm={6} md={4} lg={3}>
              <Typography
                variant="subtitle1"
                className={classes.LabelTypography}
              >
                Payment Type
              </Typography>

             {( preGateOutFetch !== null || gateOutEdit.selectedContainer?.lolo_data?.payment_type ==="Advance") ?<CustomTextfield value={paymentType} readOnlyP={true}/>: <TextField
                id="gate-out-lolo-payment-type"
                select
                value={paymentType}
                variant="outlined"
                disabled={
                  gateOutEdit.selectedContainer.goh_pk &&
                  gateOutEdit.selectedContainer.lolo_data.pk &&
                  gateOutEdit.selectedContainer.lolo_data.payment_type !==
                  "None"
                }
                fullWidth
                inputProps={{ className: classes.input }}
                onChange={(e) => {
                  setPaymentType(e.target.value);

                  dispatch({
                    type: gateOutEdit.selectedContainer.goh_pk
                      ? "EDIT_GATE_OUT_LOLO_PAYMENT_TYPE"
                      : "GATE_OUT_LOLO_PAYMENT_TYPE",
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
              </TextField>}
            </Grid>
            <Grid item xs={12} sm={6} md={4} lg={3}>
              <Typography
                variant="subtitle1"
                className={classes.LabelTypography}
              >
                LOLO Amount <span style={{ color: "red" }}>*</span>
              </Typography>

              <CustomTextfield
                id="gate-out-lolo-amount"
                handleChange={(e) => setLoloAmount(e.target.value)}
                value={loloAmount}
                dispatchType={
                  gateOutEdit.selectedContainer.goh_pk
                    ? "EDIT_GATE_OUT_LOLO_AMOUNT"
                    : "GATE_OUT_LOLO_AMOUNT"
                }
                disabled={
                  gateOutEdit.selectedContainer.lolo_data.is_amt_editable ===
                  false || gateOutEdit.selectedContainer?.lolo_data?.payment_type ==="Advance"
                }
                readOnlyP={
                  gateOutEdit.selectedContainer.lolo_data.is_amt_editable ===
                  false || preGateOutFetch?.payment_type ==="Advance" || gateOutEdit.selectedContainer?.lolo_data?.payment_type ==="Advance"
                }
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4} lg={3}>
              <Typography
                variant="subtitle1"
                className={classes.LabelTypography}
              >
                Remark
              </Typography>
              <CustomTextfield
                id="gate-out-lolo-remark"
                handleChange={(e) => setLoloRemark(e.target.value)}
                value={loloRemark}
                isRemark={true}
                dispatchType={
                  gateOutEdit.selectedContainer.goh_pk
                    ? "EDIT_GATE_OUT_LOLO_REMARK"
                    : "GATE_OUT_LOLO_REMARK"
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
                gateOutEdit.selectedContainer.goh_pk
                  ? "UPDATE_OUT_EDIT_CHEQUE_DETAILS"
                  : "UPDATE_GATE_OUT_LOLO_PAYMENT_CHEQUE_UTR_SEARCH_RESULT"
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
                    id="gate-out-lolo-cheque-number"
                    handleChange={(e) => setLoloCheque(e.target.value)}
                    value={loloCheque}
                    readOnlyP={search.loloSelectedCheque ? true : false}
                    dispatchType={
                      // search.loloSelectedCheque
                      //   ? "GATE_OUT_LOLO_PAYMENT_CHEQUE_NUMBER"
                      //   :
                      gateOutEdit.selectedContainer.goh_pk
                        ? "EDIT_GATE_OUT_LOLO_CHEQUE_NUMBER"
                        : "GATE_OUT_LOLO_PAYMENT_CHEQUE_NUMBER"
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
                    id="gate-out-lolo-utr-number"
                    handleChange={(e) => setLoloUTRNumber(e.target.value)}
                    value={loloUTRNumber}
                    readOnlyP={search.loloSelectedCheque ? true : false}
                    dispatchType={
                      // search.loloSelectedCheque
                      //   ? "GATE_OUT_LOLO_PAYMENT_UTR_NO"
                      //   :
                      gateOutEdit.selectedContainer.goh_pk
                        ? "EDIT_GATE_OUT_LOLO_UTR_NUMBER"
                        : "GATE_OUT_LOLO_PAYMENT_UTR_NO"
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
                    gateOutEdit.selectedContainer.container_data.pk &&
                      (gateOutEdit.selectedContainer.lolo_data.payment_type ===
                        "Cheque" ||
                        gateOutEdit.selectedContainer.lolo_data.payment_type ===
                        "NEFT" ||
                        gateOutEdit.selectedContainer.lolo_data.payment_type ===
                        "RTGS") &&
                      gateOutEdit.selectedContainer.lolo_data.lolo_payment.pk &&
                      gateOutEdit.selectedContainer.lolo_data.lolo_payment
                        .quantity !== "0"
                      ? "Remaining Quantity"
                      : `Quantity`
                  }
                  <span style={{ color: "red" }}>*</span>
                </Typography>
                {
                  // search.loloSelectedCheque ||
                  gateOutEdit.selectedContainer.container_data.pk &&
                    (gateOutEdit.selectedContainer.lolo_data.payment_type ===
                      "Cheque" ||
                      gateOutEdit.selectedContainer.lolo_data.payment_type ===
                      "NEFT" ||
                      gateOutEdit.selectedContainer.lolo_data.payment_type ===
                      "RTGS") &&
                    gateOutEdit.selectedContainer.lolo_data.lolo_payment.pk &&
                    gateOutEdit.selectedContainer.lolo_data.lolo_payment
                      .quantity !== "0" ? (
                    <CustomTextfield
                      id="gate-out-lolo-quantity"
                      handleChange={(e) => setLoloQty(e.target.value)}
                      value={loloQty}
                      readOnlyP
                      dispatchType={
                        // search.loloSelectedCheque
                        //   ? "GATE_OUT_LOLO_PAYMENT_QUANTITY"
                        //   :
                        gateOutEdit.selectedContainer.container_data
                          .container_no
                          ? "EDIT_GATE_OUT_LOLO_QUANTITY"
                          : "GATE_OUT_LOLO_PAYMENT_QUANTITY"
                      }
                    />
                  ) : (
                    <CustomTextfield
                      id="gate-out-lolo-quantity"
                      handleChange={(e) => setLoloQty(e.target.value)}
                      value={loloQty}
                      dispatchType={
                        // search.loloSelectedCheque
                        //   ? "GATE_OUT_LOLO_PAYMENT_QUANTITY"
                        //   :
                        gateOutEdit.selectedContainer.container_data
                          .container_no
                          ? "EDIT_GATE_OUT_LOLO_QUANTITY"
                          : "GATE_OUT_LOLO_PAYMENT_QUANTITY"
                      }
                    />
                  )
                }
              </Grid>
              {
                // search.loloSelectedCheque ||
                gateOutEdit.selectedContainer.container_data.pk &&
                  (gateOutEdit.selectedContainer.lolo_data.payment_type ===
                    "Cheque" ||
                    gateOutEdit.selectedContainer.lolo_data.payment_type ===
                    "NEFT" ||
                    gateOutEdit.selectedContainer.lolo_data.payment_type ===
                    "RTGS") &&
                  gateOutEdit.selectedContainer.lolo_data.lolo_payment.pk &&
                  gateOutEdit.selectedContainer.lolo_data.lolo_payment
                    .quantity !== "0" ? (
                  <Grid item xs={12} sm={6} md={4} lg={3}>
                    <Typography
                      variant="subtitle1"
                      className={classes.LabelTypography}
                    >
                      Original Quantity
                    </Typography>
                    <CustomTextfield
                      id="gate-out-lolo-remaining-qty"
                      handleChange={(e) => setChequeOriginalQty(e.target.value)}
                      value={chequeOriginalQty}
                      dispatchType={
                        // search.loloSelectedCheque
                        //   ? "LOLO_PAYMENT_ORIGINAL_QUANTITY"
                        //   :
                        gateOutEdit.selectedContainer.goh_pk
                          ? "EDIT_GATE_OUT_LOLO_ORIGINAL_QUANTITY"
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
                    gateOutEdit.selectedContainer.container_data.pk &&
                      (gateOutEdit.selectedContainer.lolo_data.payment_type ===
                        "Cheque" ||
                        gateOutEdit.selectedContainer.lolo_data.payment_type ===
                        "NEFT" ||
                        gateOutEdit.selectedContainer.lolo_data.payment_type ===
                        "RTGS") &&
                      gateOutEdit.selectedContainer.lolo_data.lolo_payment.pk &&
                      gateOutEdit.selectedContainer.lolo_data.lolo_payment
                        .original_amount !== "0.00"
                      ? "Remaining Amount"
                      : "Amount"
                  }
                  <span style={{ color: "red" }}>*</span>
                </Typography>
                {
                  // search.loloSelectedCheque ||
                  gateOutEdit.selectedContainer.container_data.pk &&
                    (gateOutEdit.selectedContainer.lolo_data.payment_type ===
                      "Cheque" ||
                      gateOutEdit.selectedContainer.lolo_data.payment_type ===
                      "NEFT" ||
                      gateOutEdit.selectedContainer.lolo_data.payment_type ===
                      "RTGS") &&
                    gateOutEdit.selectedContainer.lolo_data.lolo_payment.pk &&
                    gateOutEdit.selectedContainer.lolo_data.lolo_payment
                      .original_amount !== "0.00" ? (
                    <CustomTextfield
                      id="gate-out-lolo-payment-cheque-amount"
                      handleChange={(e) =>
                        setLoloPaymentChequeAmount(e.target.value)
                      }
                      value={loloPaymentChequeAmount}
                      // dispatchType="GATE_OUT_LOLO_PAYMENT_CHEQUE_AMOUNT"
                      readOnlyP
                      dispatchType={
                        // search.loloSelectedCheque
                        //   ? "GATE_OUT_LOLO_PAYMENT_CHEQUE_AMOUNT"
                        //   :
                        gateOutEdit.selectedContainer.goh_pk
                          ? "EDIT_GATE_OUT_LOLO_CHEQUE_AMOUNT"
                          : "GATE_OUT_LOLO_PAYMENT_CHEQUE_AMOUNT"
                      }
                    />
                  ) : (
                    <CustomTextfield
                      id="gate-out-lolo-payment-cheque-amount"
                      handleChange={(e) =>
                        setLoloPaymentChequeAmount(e.target.value)
                      }
                      value={loloPaymentChequeAmount}
                      // dispatchType="GATE_OUT_LOLO_PAYMENT_CHEQUE_AMOUNT"
                      dispatchType={
                        // search.loloSelectedCheque
                        //   ? "GATE_OUT_LOLO_PAYMENT_CHEQUE_AMOUNT"
                        //   :
                        gateOutEdit.selectedContainer.goh_pk
                          ? "EDIT_GATE_OUT_LOLO_CHEQUE_AMOUNT"
                          : "GATE_OUT_LOLO_PAYMENT_CHEQUE_AMOUNT"
                      }
                    />
                  )
                }
              </Grid>
              {
                // search.loloSelectedCheque ||
                gateOutEdit.selectedContainer.container_data.pk &&
                  (gateOutEdit.selectedContainer.lolo_data.payment_type ===
                    "Cheque" ||
                    gateOutEdit.selectedContainer.lolo_data.payment_type ===
                    "NEFT" ||
                    gateOutEdit.selectedContainer.lolo_data.payment_type ===
                    "RTGS") &&
                  gateOutEdit.selectedContainer.lolo_data.lolo_payment.pk &&
                  gateOutEdit.selectedContainer.lolo_data.lolo_payment
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
                      id="gate-out-lolo-original-amount"
                      handleChange={(e) =>
                        setChequeOriginalAmount(e.target.value)
                      }
                      value={chequeOriginalAmount}
                      dispatchType={
                        // search.loloSelectedCheque
                        //   ? "LOLO_PAYMENT_CHEQUE_ORIGNAL_AMOUNT"
                        //   :
                        gateOutEdit.selectedContainer.goh_pk
                          ? "EDIT_GATE_OUT_LOLO_ORIGINAL_AMOUNT"
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
                  Bank Name  {(paymentType === "NEFT" || paymentType === "RTGS") ? "" : <span style={{ color: "red" }}>*</span>}
                </Typography>
                <CustomTextfield
                  id="gate-out-lolo-bank-name"
                  handleChange={(e) => setLoloBankName(e.target.value)}
                  value={loloBankName}
                  readOnlyP={search.loloSelectedCheque ? true : false}
                  dispatchType={
                    // search.loloSelectedCheque
                    //   ? "GATE_OUT_LOLO_PAYMENT_BANK_NAME"
                    //   :
                    gateOutEdit.selectedContainer.goh_pk
                      ? "EDIT_GATE_OUT_LOLO_BANK_NAME"
                      : "GATE_OUT_LOLO_PAYMENT_BANK_NAME"
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
                  dateId="gate-out-lolo-cheque-date"
                  dateValue={loloChequeDate}
                  dateChange={(date) => setLoloChequeDate(date)}
                  dispatchType={
                    // search.loloSelectedCheque
                    //   ? "GATE_OUT_LOLO_PAYMENT_DATE"
                    //   :
                    gateOutEdit.selectedContainer.goh_pk
                      ? "EDIT_GATE_OUT_LOLO_CHEQUE_DATE"
                      : "GATE_OUT_LOLO_PAYMENT_DATE"
                  }
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4} lg={3}>
                <Typography
                  variant="subtitle1"
                  className={classes.LabelTypography}
                >
                  Account Name   {(paymentType === "NEFT" || paymentType === "RTGS") ? "" : <span style={{ color: "red" }}>*</span>}
                </Typography>
                <CustomTextfield
                  id="gate-out-lolo-acc-name"
                  handleChange={(e) => {
                    setLoloAccountName(e.target.value);
                  }}
                  value={loloAccountName}
                  readOnlyP={search.loloSelectedCheque ? true : false}
                  dispatchType={
                    // search.loloSelectedCheque
                    //   ? "GATE_OUT_LOLO_PAYMENT_ACCOUNT_NAME"
                    //   :
                    gateOutEdit.selectedContainer.goh_pk
                      ? "EDIT_GATE_OUT_LOLO_ACCOUNT_NAME"
                      : "GATE_OUT_LOLO_PAYMENT_ACCOUNT_NAME"
                  }
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4} lg={3}>
                <Typography
                  variant="subtitle1"
                  className={classes.LabelTypography}
                >
                  Account Number  {(paymentType === "NEFT" || paymentType === "RTGS") ? "" : <span style={{ color: "red" }}>*</span>}
                </Typography>
                <CustomTextfield
                  id="gate-out-lolo-acc-number"
                  handleChange={(e) => {
                    setLoloAccountNumber(e.target.value);
                  }}
                  readOnlyP={search.loloSelectedCheque ? true : false}
                  value={loloAccountNumber}
                  dispatchType={
                    // search.loloSelectedCheque
                    //   ? "GATE_OUT_LOLO_PAYMENT_ACCOUNT_NUMBER"
                    //   :
                    gateOutEdit.selectedContainer.goh_pk
                      ? "EDIT_GATE_OUT_LOLO_PAYMENT_ACCOUNT_NUMBER"
                      : "GATE_OUT_LOLO_PAYMENT_ACCOUNT_NUMBER"
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
                    id="gate-out-lolo-list-of-containers"
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
                  checked={gateOut.isSelfTransport}
                  onClick={() =>
                    dispatch({
                      type: "TOGGLE_GATE_OUT_SELF_TRANSPORT",
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
                  // color="primary"
                  style={{ color: "#2F6FB7" }}
                  checked={!gateOut.isSelfTransport}
                  onClick={() =>
                    dispatch({
                      type: "TOGGLE_GATE_OUT_SELF_TRANSPORT",
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
            xs={12}
            md={5}
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
                      type: gateOutEdit?.selectedContainer?.gih_pk
                        ? "EDIT_GATE_OUT_NIGHT_CHARGE"
                        : "GATE_OUT_NIGHT_CHARGE",
                      payload: true,
                    });
                  }}
                />
              }
              label="Yes"
              disabled={gateOutEdit?.selectedContainer?.lolo_data?.is_night_charge_bill_invoiced || preGateOutFetch?.payment_type ==="Advance" || gateOutEdit.selectedContainer?.lolo_data?.payment_type ==="Advance"}
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
                      type: gateOutEdit?.selectedContainer?.gih_pk
                        ? "EDIT_GATE_OUT_NIGHT_CHARGE"
                        : "GATE_OUT_NIGHT_CHARGE",
                      payload: false,
                    });
                  }}
                />
              }
              label="No"
              disabled={gateOutEdit?.selectedContainer?.lolo_data?.is_night_charge_bill_invoiced}
            />
          </Grid>

        </Grid>
        {gateOut.isSelfTransport && (
          <GateOutSelfTransportPayment todayDate={todayDate} />
        )}
      </Paper>
    </div>
  );
};
export default GateOutLoloPayment;
