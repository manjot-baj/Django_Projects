import React, { useState, useEffect } from "react";
import {
  Typography,
  Paper,
  TextField,
  MenuItem,
  Button,
  Grid,
  FormControlLabel,
  Radio,
  Autocomplete,
  styled,
  Box,
  Alert,
  Stack,
} from "@mui/material";
import CustomTextfield from "@components/reusablecomponents/GateInTextField";
import DatePickerField from "@components/reusablecomponents/DatePickerField";
import ChequeSearch from "@components/reusablecomponents/ChequeSearch";
import TransporterPayment from "./TransporterPayment";
import { useDispatch, useSelector } from "react-redux";
import {
  loloPaymentSearchHandlingSeperateAction,
  setCustomerNameVal,
} from "../actions/GateInActions";
import { useSnackbar } from "notistack";
import { customLabelTypography } from "../utils/CustomClasses";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import PaymentLoloComponent from "./PaymentLoloComponent";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import { deleteHandlingPaymentAction } from "@/actions/HandlingAndSTPaymentAction";

const ChoiceButton = styled(Button)(({ theme }) => ({
  backgroundColor: "transparent",
  width: "100%",
  padding: 4,
  borderRadius: 2,
}));

const SelectedChoiceButton = styled(Button)(({ theme }) => ({
  borderRadius: 6,
  color: "#fff",
  backgroundColor: theme.palette.primary.main,
  width: "100%",
  padding: 4,
  "&:hover": {
    backgroundColor: theme.palette.primary.main,
  },
}));

const PaymentDetails = (props) => {
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
    gateInDetails,
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
  const [openPaymentModal, setOpenPaymentModal] = useState(false);

  const handleModalClose = () => setOpenPaymentModal(false);

  const handleModalOpen = () => setOpenPaymentModal(true);

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
        gateInEdit?.selectedContainer?.lolo_data?.is_night_charges_applied,
      );

      // CUSTOMER NAME

      if (gateInEdit.selectedContainer.lolo_data.customer_name !== "") {
        dispatch(
          setCustomerNameVal(
            gateInEdit.selectedContainer.lolo_data.customer_name,
            setCustomerName,
          ),
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
          gateInEdit.selectedContainer.lolo_data.lolo_payment.cheque_no,
        );
        // LOLO UTR NUMBER
        setLoloUTRNumber(
          gateInEdit.selectedContainer.lolo_data.lolo_payment.utr_no,
        );
        // CHEQUE QUANTITY
        setLoloQty(
          gateInEdit.selectedContainer.lolo_data.lolo_payment.remaining,
        );

        // CHEQUE AMOUNT
        if (gateInEdit.selectedContainer.lolo_data.lolo_payment.amount === 0)
          setLoloPaymentChequeAmount("0");
        else
          setLoloPaymentChequeAmount(
            gateInEdit.selectedContainer.lolo_data.lolo_payment.amount,
          );
        // cHEQUE BANK NAME
        setLoloBankName(
          gateInEdit.selectedContainer.lolo_data.lolo_payment.bank_name,
        );
        // CHEQUE DATE
        setLoloChequeDate(
          gateInEdit.selectedContainer.lolo_data.lolo_payment.date,
        );
        // ACCOUNT NAME
        setLoloAccountName(
          gateInEdit.selectedContainer.lolo_data.lolo_payment.account_name,
        );
        // ACCOUNT NUMBER
        setLoloAccountNumber(
          gateInEdit.selectedContainer.lolo_data.lolo_payment.account_no,
        );
        // REMAINING QTY
        if (gateInEdit.selectedContainer.lolo_data.lolo_payment.quantity === 0)
          setChequeOriginalQty("0");
        else
          setChequeOriginalQty(
            gateInEdit.selectedContainer.lolo_data.lolo_payment.quantity,
          );
        // List OF containers
        setListOfContainers(
          gateInEdit.selectedContainer.lolo_data.lolo_payment.container,
        );
        // CHEQUE ORIGINAL AMOUNT
        if (
          gateInEdit.selectedContainer.lolo_data.lolo_payment
            .original_amount === 0
        ) {
          setChequeOriginalAmount("0");
        } else {
          setChequeOriginalAmount(
            gateInEdit.selectedContainer.lolo_data.lolo_payment.original_amount,
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
    if (preGateInFetch?.payment_type === "Advance") {
      return;
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

  const handleRemoveCurrentData = () => {
    dispatch({
      type: "LOLO_PAYMENT_INIT_DATA",
    });
    setLoloCheque("");
    setLoloUTRNumber("");
    setLoloQty("");
    setLoloPaymentChequeAmount("");
    setLoloBankName("");
    setLoloChequeDate("");
    setLoloAccountName("");
    setLoloAccountNumber("");
    setChequeOriginalQty("");
    setListOfContainers([]);
    setChequeOriginalAmount("");
  };

  const handleRemovePayment = () => {
    dispatch({
      type: "EDIT_LOLO_PAYMENT_INIT_DATA",
    });
    setPaymentType("Cash");
    dispatch({
      type: "EDIT_LOLO_PAYMENT_TYPE",
      payload: "Cash",
    });
    setLoloCheque("");
    setLoloUTRNumber("");
    setLoloQty("");
    setLoloPaymentChequeAmount("");
    setLoloBankName("");
    setLoloChequeDate("");
    setLoloAccountName("");
    setLoloAccountNumber("");
    setChequeOriginalQty("");
    setListOfContainers([]);
    setChequeOriginalAmount("");
  };

  return (
    <div>
      <Typography
        variant="subtitle2"
        style={{ paddingTop: 14, paddingBottom: 14 }}
      >
        Payment details
      </Typography>
      <Paper
        sx={{
          paddingTop: 4,
          paddingBottom: 4,
        }}
        elevation={0}
      >
        <Typography
          variant="subtitle2"
          sx={(theme) => ({
            paddingLeft: 2,
            paddingBottom: 1,
            opacity: 1,
            color: theme.palette.primary.main,
            fontWeight: "bold",
            width: "max-content",
          })}
        >
          LOLO
        </Typography>
        <Box sx={{ padding: "2px 18px 8px 18px" }}>
          <Grid container spacing={3}>
            <Grid item size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
              <Typography variant="subtitle1" sx={customLabelTypography}>
                Apply Charges
              </Typography>
              <Grid
                container
                spacing={1}
                sx={{
                  border: "1px solid #243545",
                  marginTop: "0rem",
                  display: "flex",
                  borderRadius: 2,
                }}
              >
                <Grid item size={{ xs: 6 }}>
                  {(loloPayment.apply_charges === "Line" &&
                    gateInEdit.selectedContainer.lolo_data.apply_charges ===
                    "") ||
                    gateInEdit.selectedContainer.lolo_data.apply_charges ===
                    "Line" ? (
                    <SelectedChoiceButton
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
                                { variant: "info" },
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
                            { variant: "info" },
                          );
                        }
                      }}
                    >
                      Line
                    </SelectedChoiceButton>
                  ) : (
                    <ChoiceButton
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
                                { variant: "info" },
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
                            { variant: "info" },
                          );
                        }
                      }}
                    >
                      Line
                    </ChoiceButton>
                  )}
                </Grid>
                <Grid item size={{ xs: 6 }}>
                  {(loloPayment.apply_charges === "Party" &&
                    gateInEdit.selectedContainer.lolo_data.apply_charges ===
                    "") ||
                    gateInEdit.selectedContainer.lolo_data.apply_charges ===
                    "Party" ? (
                    <SelectedChoiceButton
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
                                { variant: "info" },
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
                            { variant: "info" },
                          );
                        }
                      }}
                    >
                      Party
                    </SelectedChoiceButton>
                  ) : (
                    <ChoiceButton
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
                                { variant: "info" },
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
                            { variant: "info" },
                          );
                        }
                      }}
                    >
                      Party
                    </ChoiceButton>
                  )}
                </Grid>
              </Grid>
            </Grid>

            {gateIn.allDropDown && gateIn.allDropDown.party_client_data && (
              <Grid item size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                <Typography variant="subtitle1" sx={customLabelTypography}>
                  Customer Name
                  {(loloPayment.apply_charges === "Party" ||
                    gateInEdit.selectedContainer.lolo_data.apply_charges ===
                    "Party") && <span style={{ color: "red" }}>*</span>}
                </Typography>
                {preGateInFetch !== null ||
                  gateInEdit.selectedContainer.lolo_data.payment_type ===
                  "Advance" ? (
                  <CustomTextfield value={customerName} readOnlyP={true} />
                ) : (
                  <Autocomplete
                    value={customerName}
                    onChange={(event, newValue) => {
                      setCustomerName(newValue);
                    }}
                    style={{ padding: 0 }}
                    sx={{
                      "& .MuiAutocomplete-inputRoot[class*='MuiOutlinedInput-root']":
                      {
                        padding: 0,
                      },
                      "& input": {
                        textTransform: "uppercase",
                      },
                    }}
                    options={
                      gateIn.allDropDown &&
                      gateIn.allDropDown.party_client_data &&
                      gateIn.allDropDown.party_client_data.map(
                        (option) => option.name,
                      )
                    }
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        variant="outlined"
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            "& fieldset": {
                              borderColor: "#243545",
                            },
                          },
                        }}
                        onBlur={(e) => {
                          if (
                            loloPayment.apply_charges === "Party" ||
                            gateInEdit.selectedContainer.lolo_data
                              .apply_charges === "Party"
                          ) {
                            if (
                              gateIn?.allDropDown?.party_client_data
                                ?.map((option) => option.name)
                                ?.includes(e.target.value)
                            ) {
                              setCustomerName(e.target.value);
                              dispatch({
                                type: gateInEdit.selectedContainer.gih_pk
                                  ? "EDIT_LOLO_CUSTOMER_NAME"
                                  : "LOLO_CUSTOMER_NAME",
                                payload: e.target.value,
                              });
                            } else {
                              setCustomerName("");
                              dispatch({
                                type: gateInEdit.selectedContainer.gih_pk
                                  ? "EDIT_LOLO_CUSTOMER_NAME"
                                  : "LOLO_CUSTOMER_NAME",
                                payload: "",
                              });
                            }
                          } else {
                            setCustomerName(e.target.value);
                            dispatch({
                              type: gateInEdit.selectedContainer.gih_pk
                                ? "EDIT_LOLO_CUSTOMER_NAME"
                                : "LOLO_CUSTOMER_NAME",
                              payload: e.target.value,
                            });
                          }
                        }}
                        fullWidth
                      />
                    )}
                  />
                )}
              </Grid>
            )}
            <Grid item size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
              <Typography variant="subtitle1" sx={customLabelTypography}>
                Receipt Number
              </Typography>
              <CustomTextfield
                id="lolo-receipt-number"
                readOnlyP={true}
                value={receiptNumber}
              />
            </Grid>

            <Grid item size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
              <Typography variant="subtitle1" sx={customLabelTypography}>
                Receipt Date
              </Typography>

              <DatePickerField
                dateId="lolo-receipt-date"
                dateValue={receiptDate}
                dateChange={(date) => setReceiptDate(date)}
                fullWidth
                dispatchType={
                  gateInEdit.selectedContainer.lolo_data.receipt_date
                    ? "EDIT_LOLO_RECEIPT_DATE"
                    : "LOLO_RECEIPT_DATE"
                }
              />
            </Grid>
            <Grid item size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
              <Typography variant="subtitle1" sx={customLabelTypography}>
                LOLO Type
              </Typography>

              <TextField
                id="lolo-type"
                select
                value={loloType}
                variant="outlined"
                fullWidth
                sx={{
                  "& .MuiOutlinedInput-root": {
                    "& fieldset": {
                      borderColor: "#243545",
                    },
                  },
                }}
                size="small"
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
              <Grid item size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                <Typography variant="subtitle1" sx={customLabelTypography}>
                  Payment Type
                </Typography>
                {preGateInFetch !== null ||
                  gateInEdit.selectedContainer.lolo_data.payment_type ===
                  "Advance" ? (
                  <CustomTextfield value={paymentType} readOnlyP={true} />
                ) : (
                  <Autocomplete
                    value={paymentType}
                    onChange={(event, newValue) => {
                      if (
                        (loloPayment?.cheque_no !== "" ||
                          loloPayment?.utr_no !== "") &&
                        newValue !== loloPayment.payment_type
                      ) {
                        handleRemoveCurrentData();
                      }
                      setPaymentType(newValue);
                    }}
                    style={{ padding: 0 }}
                    sx={{
                      "& .MuiAutocomplete-inputRoot[class*='MuiOutlinedInput-root']":
                      {
                        padding: 0,
                      },
                      "& input": {
                        textTransform: "uppercase",
                      },
                    }}
                    options={
                      gateIn.allDropDown &&
                        gateIn.allDropDown.payment_type &&
                        gateInEdit.selectedContainer.gih_pk &&
                        (gateInEdit.selectedContainer.lolo_data?.payment_type ===
                          "NEFT" ||
                          gateInEdit.selectedContainer.lolo_data?.payment_type ===
                          "RTGS") &&
                        gateInEdit.selectedContainer.lolo_data?.lolo_payment?.pk
                        ? gateIn.allDropDown.payment_type.filter(
                          (val) => val === "NEFT" || val === "RTGS",
                        )
                        : gateIn.allDropDown?.payment_type?.map(
                          (option) => option,
                        ) || []
                    }
                    disabled={
                      gateInEdit.selectedContainer.lolo_data.is_amt_editable ===
                      false ||
                      (gateInEdit.selectedContainer.gih_pk &&
                        gateInEdit.selectedContainer.lolo_data?.lolo_payment
                          ?.pk)
                    }
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        variant="outlined"
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            "& fieldset": {
                              borderColor: "#243545",
                            },
                          },
                        }}
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

            <Grid item size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
              <Typography variant="subtitle1" sx={customLabelTypography}>
                LOLO Amount <span style={{ color: "red" }}>*</span>
              </Typography>

              {preGateInFetch !== null ||
                gateInEdit.selectedContainer.lolo_data.payment_type ===
                "Advance" ? (
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
                    (gateInEdit.selectedContainer.lolo_data.is_amt_editable &&
                      gateInEdit.selectedContainer.self_transportation_data
                        .is_amt_editable === false) ||
                    gateInEdit.selectedContainer.lolo_data?.lolo_payment?.pk !==
                    ""
                  }
                  readOnlyP={
                    (gateInEdit.selectedContainer.lolo_data.is_amt_editable &&
                      gateInEdit.selectedContainer.self_transportation_data
                        .is_amt_editable === false) ||
                    gateInEdit.selectedContainer.lolo_data?.lolo_payment?.pk
                  }
                />
              )}
            </Grid>
        
            <Grid item size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
              <Typography variant="subtitle1" sx={customLabelTypography}>
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
        </Box>
        {paymentType === "Cheque" ||
          paymentType === "NEFT" ||
          paymentType === "RTGS" ? (
          <Box
            sx={(theme) => ({
              backgroundColor: "#EAF0F5",
              borderRadius: 2,
              padding: theme.spacing(1.5, 1.5),
              margin: theme.spacing(0.5, 1),
            })}
          >
            {gateInEdit.selectedContainer.gih_pk &&
              gateInEdit.selectedContainer.lolo_data.lolo_payment.pk ? null : (
              <ChequeSearch
                paymentSearchResult={search.loloPaymentSearchResult}
                getSearchResultType="GET_LOLO_PAYMENT_SEARCH_RESULT"
                setSelectedPaymentType="SET_SELECTED_LOLO_PAYMENT_SEARCH"
                updatePaymentType={
                  gateInEdit.selectedContainer.gih_pk
                    ? "UPDATE_EDIT_CHEQUE_DETAILS"
                    : "UPDATE_LOLO_PAYMENT_CHEQUE_UTR_SEARCH_RESULT"
                }
                searchAction={loloPaymentSearchHandlingSeperateAction}
                handleRemoveCurrentData={handleRemoveCurrentData}
                enableCloseButton={loloCheque !== "" || loloUTRNumber !== ""}
                paymentType={
                  gateInEdit.selectedContainer.gih_pk
                    ? gateInEdit.selectedContainer.lolo_data?.payment_type
                    : loloPayment.payment_type
                }
              />
            )}
            {loloCheque === "" && loloUTRNumber === "" && (
              <Stack
                sx={{ mt: 6, mb: 2 }}
                direction={"column"}
                alignItems={"center"}
                justifyContent={"center"}
                flexDirection={"column"}
                spacing={2}
              >
                {" "}
                <Button
                  startIcon={<AddOutlinedIcon />}
                  variant="contained"
                  color="primary"
                  onClick={handleModalOpen}
                >
                  Add Payment{" "}
                </Button>
                <Alert variant="standard" color="info">
                  Add Payment and then Search the Payment Cheque or Utr No.
                </Alert>
              </Stack>
            )}
            {(loloCheque !== "" || loloUTRNumber !== "") && (
              <Grid container spacing={1} mt={1}>
                {gateInEdit.selectedContainer.gih_pk &&
                  gateInEdit.selectedContainer.lolo_data.lolo_payment.pk && (
                    <Grid item size={{ xs: 12 }} textAlign={"end"}>
                      <Button
                        startIcon={<DeleteOutlineOutlinedIcon />}
                        color="error"
                        onClick={() =>
                          dispatch(
                            deleteHandlingPaymentAction(
                              gateInEdit.selectedContainer.lolo_data
                                .lolo_payment.pk,
                              handleRemovePayment,
                              gateInEdit.selectedContainer.container_data
                                ?.container_no,
                              gateInEdit.selectedContainer.lolo_data
                                ?.lolo_amount,
                              gateInEdit.selectedContainer.lolo_data?.pk,
                              notify,
                            ),
                          )
                        }
                      >
                        Remove Payment
                      </Button>
                    </Grid>
                  )}
                {gateInEdit.selectedContainer.gih_pk ? (
                  gateInEdit.selectedContainer.lolo_data.payment_type ===
                    "NEFT" ||
                    gateInEdit.selectedContainer.lolo_data.payment_type ===
                    "RTGS" ? (
                    <Grid item size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                      <Typography sx={customLabelTypography}>UTR No</Typography>
                      <CustomTextfield value={loloUTRNumber} readOnlyP={true} />
                    </Grid>
                  ) : null
                ) : paymentType === "RTGS" || paymentType === "NEFT" ? (
                  <Grid item size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                    <Typography sx={customLabelTypography}>UTR No</Typography>
                    <CustomTextfield value={loloUTRNumber} readOnlyP={true} />
                  </Grid>
                ) : null}

                {((gateInEdit.selectedContainer.gih_pk &&
                  gateInEdit.selectedContainer.lolo_data.payment_type ===
                  "Cheque") ||
                  paymentType === "Cheque") && (
                    <Grid item size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                      <Typography sx={customLabelTypography}>
                        Cheque No
                      </Typography>
                      <CustomTextfield value={loloCheque} readOnlyP={true} />
                    </Grid>
                  )}
                <Grid item size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                  <Typography sx={customLabelTypography}>
                    {gateInEdit.selectedContainer.container_data.pk &&
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
                      : "Quantity"}
                  </Typography>
                  <CustomTextfield value={loloQty} readOnlyP={true} />
                </Grid>
                {gateInEdit.selectedContainer.container_data.pk &&
                  (gateInEdit.selectedContainer.lolo_data.payment_type ===
                    "Cheque" ||
                    gateInEdit.selectedContainer.lolo_data.payment_type ===
                    "NEFT" ||
                    gateInEdit.selectedContainer.lolo_data.payment_type ===
                    "RTGS") &&
                  gateInEdit.selectedContainer.lolo_data.lolo_payment.pk &&
                  gateInEdit.selectedContainer.lolo_data.lolo_payment.quantity !==
                  "0" ? (
                  <Grid item size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                    <Typography sx={customLabelTypography}>
                      Original Quantity
                    </Typography>
                    <CustomTextfield
                      value={chequeOriginalQty}
                      readOnlyP={true}
                    />
                  </Grid>
                ) : null}
                <Grid item size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                  <Typography variant="subtitle1" sx={customLabelTypography}>
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
                  </Typography>
                  <CustomTextfield
                    value={loloPaymentChequeAmount}
                    readOnlyP={true}
                  />
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
                    <Grid item size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                      <Typography
                        variant="subtitle1"
                        sx={customLabelTypography}
                      >
                        Original Amount
                      </Typography>
                      <CustomTextfield
                        id="lolo-original-amount"
                        value={chequeOriginalAmount}
                        readOnlyP={true}
                      />
                    </Grid>
                  ) : null
                }
                <Grid item size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                  <Typography variant="subtitle1" sx={customLabelTypography}>
                    Bank Name{" "}
                    {paymentType === "NEFT" || paymentType === "RTGS" ? (
                      " "
                    ) : (
                      <span style={{ color: "red" }}>*</span>
                    )}
                  </Typography>
                  <CustomTextfield value={loloBankName} readOnlyP={true} />
                </Grid>
                <Grid item size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                  <Typography variant="subtitle1" sx={customLabelTypography}>
                    Date
                  </Typography>

                  <CustomTextfield value={loloChequeDate} readOnlyP={true} />
                </Grid>
                <Grid item size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                  <Typography variant="subtitle1" sx={customLabelTypography}>
                    Account Name{" "}
                    {paymentType === "NEFT" || paymentType === "RTGS" ? (
                      " "
                    ) : (
                      <span style={{ color: "red" }}>*</span>
                    )}
                  </Typography>
                  <CustomTextfield
                    id="lolo-acc-name"
                    value={loloAccountName}
                    readOnlyP={true}
                  />
                </Grid>
                <Grid item size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                  <Typography variant="subtitle1" sx={customLabelTypography}>
                    Account Number{" "}
                    {paymentType === "NEFT" || paymentType === "RTGS" ? (
                      " "
                    ) : (
                      <span style={{ color: "red" }}>*</span>
                    )}
                  </Typography>
                  <CustomTextfield readOnlyP={true} value={loloAccountNumber} />
                </Grid>
                {chequeListOfContainers &&
                  chequeListOfContainers.length > 0 && (
                    <Grid item size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                      <Typography
                        variant="subtitle1"
                        sx={customLabelTypography}
                      >
                        List of containers
                      </Typography>

                      <TextField
                        id="lolo-list-of-containers"
                        multiline
                        rows={
                          chequeListOfContainers &&
                          chequeListOfContainers.length
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
            )}
            <PaymentLoloComponent
              openPaymentModal={openPaymentModal}
              handleModalClose={handleModalClose}
              handleModalOpen={handleModalOpen}
              paymentType={
                gateInEdit.selectedContainer.gih_pk
                  ? gateInEdit.selectedContainer.lolo_payment?.payment_type
                  : loloPayment.payment_type
              }
            />
          </Box>
        ) : null}
        <Grid container size={{ xs: 12 }}>
          <Grid
            item
            size={{ xs: 12, md: 5 }}
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
            size={{ xs: 12, md: 5 }}
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
                  ?.is_night_charge_bill_invoiced ||
                preGateInFetch?.payment_type === "Advance"
              }
            />
            <FormControlLabel
              value="no"
              control={
                <Radio
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
