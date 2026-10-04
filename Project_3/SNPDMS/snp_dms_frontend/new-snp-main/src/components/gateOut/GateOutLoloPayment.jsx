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
  Box,
  styled,
  Stack,
  Alert,
  IconButton,
} from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import {
  setCustomerNameVal,
  dropDownDispatch,
  loloPaymentSearchHandlingGateOutSeperateAction,
} from "../../actions/GateInActions";
import CustomTextfield from "@components/reusablecomponents/GateInTextField";
import ChequeSearch from "@components/reusablecomponents/ChequeSearch";
import DatePickerField from "@components/reusablecomponents/DatePickerField";
import GateOutSelfTransportPayment from "./GateOutSelfTransportPayment";
import { useSnackbar } from "notistack";
import { customLabelTypography } from "../../utils/CustomClasses";
import {
  EDIT_GATE_OUT_LOLO_ORIGINAL_QUANTITY,
  EDIT_GATE_OUT_LOLO_PAYMENT_TYPE,
} from "@/actions/types";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";

import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import PaymentLoloComponent from "../PaymentLoloComponent";
import { deleteHandlingPaymentAction } from "@/actions/HandlingAndSTPaymentAction";

const ChoiceStyledButton = styled(Button)(({ theme, selected }) => ({
  backgroundColor: selected ? theme.palette.primary.main : "#fff",
  color: selected ? "#fff" : "#000",
  width: "100%",
  padding: 3,
  borderRadius: 5,
  "&:hover": {
    backgroundColor: selected ? theme.palette.primary.main : "#fff",
  },
}));

const GateOutLoloPayment = (props) => {
  const dispatch = useDispatch();
  const store = useSelector((state) => state);
  const notify = useSnackbar().enqueueSnackbar;
  const {
    gateOut,
    gateIn,
    gateOutLoloPayment,
    search,
    gateOutEdit,
    AdvanceFinanceReducer,
    gateOutDetails,
  } = store;
  const { preGateOutFetch } = AdvanceFinanceReducer;
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
  const [openPaymentModal, setOpenPaymentModal] = useState(false);

  const handleModalClose = () => setOpenPaymentModal(false);

  const handleModalOpen = () => setOpenPaymentModal(true);

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
            setCustomerName,
          ),
        );
      }

      // RECEIOT DATE

      setReceiptDate(gateOutEdit.selectedContainer.lolo_data.receipt_date);

      // Payment Type
      setPaymentType(gateOutEdit.selectedContainer.lolo_data.payment_type);
      setLoloNightCharges(
        gateOutEdit.selectedContainer.lolo_data.is_night_charges_applied,
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
          gateOutEdit.selectedContainer.lolo_data.lolo_payment.cheque_no,
        );
        // LOLO UTR NUMBER
        setLoloUTRNumber(
          gateOutEdit.selectedContainer.lolo_data.lolo_payment.utr_no,
        );
        // CHEQUE QUANTITY
        setLoloQty(
          gateOutEdit.selectedContainer.lolo_data.lolo_payment.remaining,
        );

        // CHEQUE AMOUNT
        if (gateOutEdit.selectedContainer.lolo_data.lolo_payment.amount === 0)
          setLoloPaymentChequeAmount("0");
        else
          setLoloPaymentChequeAmount(
            gateOutEdit.selectedContainer.lolo_data.lolo_payment.amount,
          );
        // cHEQUE BANK NAME
        setLoloBankName(
          gateOutEdit.selectedContainer.lolo_data.lolo_payment.bank_name,
        );
        // CHEQUE DATE
        setLoloChequeDate(
          gateOutEdit.selectedContainer.lolo_data.lolo_payment.date,
        );
        // ACCOUNT NAME
        setInvoiceDate(gateOutEdit.selectedContainer.lolo_data.invoice_date);
        setLoloAccountName(
          gateOutEdit.selectedContainer.lolo_data.lolo_payment.account_name,
        );
        setLoloAccountNumber(
          gateOutEdit.selectedContainer.lolo_data.lolo_payment.account_no,
        );
        // REMAINING QTY
        if (gateOutEdit.selectedContainer.lolo_data.lolo_payment.quantity === 0)
          setChequeOriginalQty("0");
        else
          setChequeOriginalQty(
            gateOutEdit.selectedContainer.lolo_data.lolo_payment.quantity,
          );
        // List OF containers
        setListOfContainers(
          gateOutEdit.selectedContainer.lolo_data.lolo_payment.container,
        );
        // CHEQUE ORIGINAL AMOUNT
        if (
          gateOutEdit.selectedContainer.lolo_data.lolo_payment
            .original_amount === 0
        ) {
          setChequeOriginalAmount("0");
        } else {
          setChequeOriginalAmount(
            gateOutEdit.selectedContainer.lolo_data.lolo_payment
              .original_amount,
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

  useEffect(() => {
    if (preGateOutFetch !== null) {
      if (preGateOutFetch?.apply_charges === "Party") {
        handlePartySelect();
      } else {
        handleLineSelect();
      }
      setCustomerName(preGateOutFetch.customer_name);
      setPaymentType(preGateOutFetch.payment_type);
      setLoloAmount(preGateOutFetch.lolo_amount);
    }
  }, [preGateOutFetch]);
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

  const handleRemoveCurrentData = () => {
    dispatch({
      type: "GATE_OUT_LOLO_PAYMENT_INIT",
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
      type: "EDIT_GATE_OUT_LOLO_PAYMENT_INIT",
    });
    setPaymentType("Cash");
    dispatch({
      type: EDIT_GATE_OUT_LOLO_PAYMENT_TYPE,
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
            color: theme.palette.primary.main,
            fontWeight: "bold",
          })}
        >
          LOLO
        </Typography>
        <Box
          sx={{
            padding: "2px 18px 8px 18px",
          }}
        >
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
                  <ChoiceStyledButton
                    selected={
                      (gateOutLoloPayment.apply_charges === "Line" &&
                        gateOutEdit.selectedContainer.lolo_data
                          .apply_charges === "") ||
                      gateOutEdit.selectedContainer.lolo_data.apply_charges ===
                        "Line"
                    }
                    onClick={() => {
                      if (
                        gateOutDetails.departed === "FS RETURN" ||
                        gateOutEdit.selectedContainer.goh_pk ||
                        (gateOutDetails.departed === "Port/Vessel" &&
                          user.location === "West Bengal")
                      ) {
                        if (gateOutEdit.selectedContainer.goh_pk) {
                          if (
                            gateOutEdit.selectedContainer.gate_out_data
                              .departed === "Factory" ||
                            gateOutEdit.selectedContainer.gate_out_data
                              .departed === "CFS/ICD"
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
                  </ChoiceStyledButton>
                </Grid>
                <Grid item size={{ xs: 6 }}>
                  <ChoiceStyledButton
                    selected={
                      (gateOutLoloPayment.apply_charges === "Party" &&
                        gateOutEdit.selectedContainer.lolo_data
                          .apply_charges === "") ||
                      gateOutEdit.selectedContainer.lolo_data.apply_charges ===
                        "Party"
                    }
                    onClick={() => {
                      if (
                        gateOutDetails.departed === "FS RETURN" ||
                        gateOutEdit.selectedContainer.goh_pk ||
                        (gateOutDetails.departed === "Port/Vessel" &&
                          user.location === "West Bengal")
                      ) {
                        if (gateOutEdit.selectedContainer.goh_pk) {
                          if (
                            gateOutEdit.selectedContainer.gate_out_data
                              .departed === "Road/Rail" ||
                            (gateOutEdit.selectedContainer.gate_out_data
                              .departed === "Port/Vessel" &&
                              user.location !== "West Bengal")
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
                  </ChoiceStyledButton>
                </Grid>
              </Grid>
            </Grid>

            {gateIn.allDropDown && gateIn.allDropDown.party_client_data && (
              <Grid item size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                <Typography variant="subtitle1" sx={customLabelTypography}>
                  Customer Name{" "}
                  {(gateOutLoloPayment.apply_charges === "Party" ||
                    gateOutEdit.selectedContainer.lolo_data.apply_charges ===
                      "Party") && <span style={{ color: "red" }}>*</span>}
                </Typography>
                {preGateOutFetch?.payment_type === "Advance" ||
                gateOutEdit.selectedContainer?.lolo_data?.payment_type ===
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
                      (option) => option.name,
                    )}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        variant="outlined"
                        onBlur={(e) => {
                          if (
                            gateOutLoloPayment.apply_charges === "Party" ||
                            gateOutEdit.selectedContainer.lolo_data
                              .apply_charges === "Party"
                          ) {
                            if (
                              gateIn?.allDropDown?.party_client_data
                                ?.map((option) => option.name)
                                ?.includes(e.target.value)
                            ) {
                              setCustomerName(e.target.value);
                              dispatch({
                                type: gateOutEdit.selectedContainer.goh_pk
                                  ? "EDIT_GATE_OUT_LOLO_CUSTOMER_NAME"
                                  : "GATE_OUT_LOLO_CUSTOMER_NAME",
                                payload: e.target.value,
                              });
                            } else {
                              setCustomerName("");
                              dispatch({
                                type: gateOutEdit.selectedContainer.goh_pk
                                  ? "EDIT_GATE_OUT_LOLO_CUSTOMER_NAME"
                                  : "GATE_OUT_LOLO_CUSTOMER_NAME",
                                payload: "",
                              });
                            }
                          } else {
                            setCustomerName(e.target.value);
                            dispatch({
                              type: gateOutEdit.selectedContainer.goh_pk
                                ? "EDIT_GATE_OUT_LOLO_CUSTOMER_NAME"
                                : "GATE_OUT_LOLO_CUSTOMER_NAME",
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
                Invoice Date
              </Typography>

              <DatePickerField
                fullWidth
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
            <Grid item size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
              <Typography variant="subtitle1" sx={customLabelTypography}>
                Receipt Date
              </Typography>

              <DatePickerField
                fullWidth
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
            <Grid item size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
              <Typography variant="subtitle1" sx={customLabelTypography}>
                LOLO Type
              </Typography>

              <TextField
                id="gate-out-lolo-type"
                select
                value={loloType}
                variant="outlined"
                fullWidth
                size="small"
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
            <Grid item size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
              <Typography variant="subtitle1" sx={customLabelTypography}>
                Payment Type
              </Typography>

              {preGateOutFetch !== null ||
              gateOutEdit.selectedContainer?.lolo_data?.payment_type ===
                "Advance" ? (
                <CustomTextfield value={paymentType} readOnlyP={true} />
              ) : (
                <TextField
                  id="gate-out-lolo-payment-type"
                  select
                  value={paymentType}
                  variant="outlined"
                  disabled={
                    gateOutEdit.selectedContainer.goh_pk &&
                    gateOutEdit.selectedContainer.lolo_data.pk &&
                    gateOutEdit.selectedContainer.lolo_data?.lolo_payment?.pk
                  }
                  fullWidth
                  size="small"
                  onChange={(e) => {
                    if (
                      (gateOutLoloPayment?.cheque_no !== "" ||
                        gateOutLoloPayment?.utr_no !== "") &&
                      e.target.value !== gateOutLoloPayment.payment_type
                    ) {
                      handleRemoveCurrentData();
                    }
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
                  gateOutEdit.selectedContainer.goh_pk &&
                  (gateOutEdit.selectedContainer.lolo_data?.payment_type ===
                    "NEFT" ||
                    gateOutEdit.selectedContainer.lolo_data?.payment_type ===
                      "RTGS") &&
                  gateOutEdit.selectedContainer.lolo_data?.lolo_payment?.pk
                    ? gateIn.allDropDown.payment_type
                        .filter((val) => val === "NEFT" || val === "RTGS")
                        .map((option) => (
                          <MenuItem key={option} value={option}>
                            {option}
                          </MenuItem>
                        ))
                    : gateIn?.allDropDown?.payment_type?.map((option) => (
                        <MenuItem key={option} value={option}>
                          {option}
                        </MenuItem>
                      ))}
                </TextField>
              )}
            </Grid>
            <Grid item size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
              <Typography variant="subtitle1" sx={customLabelTypography}>
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
                    false ||
                  gateOutEdit.selectedContainer?.lolo_data?.payment_type ===
                    "Advance"
                }
                readOnlyP={
                  gateOutEdit.selectedContainer.lolo_data.is_amt_editable ===
                    false ||
                  preGateOutFetch?.payment_type === "Advance" ||
                  gateOutEdit.selectedContainer?.lolo_data?.payment_type ===
                    "Advance" ||
                  gateOutEdit.selectedContainer.lolo_data?.lolo_payment?.pk
                }
              />
            </Grid>
            <Grid item size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
              <Typography variant="subtitle1" sx={customLabelTypography}>
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
            {gateOutEdit.selectedContainer.goh_pk &&
            gateOutEdit.selectedContainer.lolo_data.lolo_payment.pk ? null : (
              <ChequeSearch
                paymentSearchResult={search.loloPaymentSearchResult}
                getSearchResultType="GET_LOLO_PAYMENT_SEARCH_RESULT"
                setSelectedPaymentType="SET_SELECTED_LOLO_PAYMENT_SEARCH"
                updatePaymentType={
                  gateOutEdit.selectedContainer.goh_pk
                    ? "UPDATE_OUT_EDIT_CHEQUE_DETAILS"
                    : "UPDATE_GATE_OUT_LOLO_PAYMENT_CHEQUE_UTR_SEARCH_RESULT"
                }
                searchAction={loloPaymentSearchHandlingGateOutSeperateAction}
                handleRemoveCurrentData={handleRemoveCurrentData}
                enableCloseButton={loloCheque !== "" || loloUTRNumber !== ""}
                paymentType={
                  gateOutEdit.selectedContainer.goh_pk
                    ? gateOutEdit.selectedContainer.lolo_data?.payment_type
                    : gateOutLoloPayment.payment_type
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
                {gateOutEdit.selectedContainer.goh_pk &&
                  gateOutEdit.selectedContainer.lolo_data.lolo_payment.pk && (
                    <Grid item size={{ xs: 12 }} textAlign={"end"}>
                      <Button
                        variant="text"
                        color="error"
                        onClick={() =>
                          dispatch(
                            deleteHandlingPaymentAction(
                              gateOutEdit.selectedContainer.lolo_data
                                .lolo_payment?.pk,
                              handleRemovePayment,
                              gateOutEdit.selectedContainer.container_data
                                ?.container_no,
                              gateOutEdit.selectedContainer.lolo_data
                                ?.lolo_amount,
                              gateOutEdit.selectedContainer.lolo_data?.pk,
                              notify,
                            ),
                          )
                        }
                        startIcon={<DeleteOutlineOutlinedIcon />}
                      >
                        Remove Payment
                      </Button>
                    </Grid>
                  )}
                {gateOutEdit.selectedContainer.goh_pk ? (
                  gateOutEdit.selectedContainer.lolo_data.payment_type ===
                    "NEFT" ||
                  gateOutEdit.selectedContainer.lolo_data.payment_type ===
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

                {((gateOutEdit.selectedContainer.goh_pk &&
                  gateOutEdit.selectedContainer.lolo_data.payment_type ===
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
                    {gateOutEdit.selectedContainer.container_data.pk &&
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
                      : "Quantity"}
                  </Typography>
                  <CustomTextfield value={loloQty} readOnlyP={true} />
                </Grid>
                {gateOutEdit.selectedContainer.container_data.pk &&
                (gateOutEdit.selectedContainer.lolo_data.payment_type ===
                  "Cheque" ||
                  gateOutEdit.selectedContainer.lolo_data.payment_type ===
                    "NEFT" ||
                  gateOutEdit.selectedContainer.lolo_data.payment_type ===
                    "RTGS") &&
                gateOutEdit.selectedContainer.lolo_data.lolo_payment.pk &&
                gateOutEdit.selectedContainer.lolo_data.lolo_payment
                  .quantity !== "0" ? (
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
                    }{" "}
                  </Typography>
                  <CustomTextfield
                    value={loloPaymentChequeAmount}
                    readOnlyP={true}
                  />
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
                gateOutEdit.selectedContainer.goh_pk
                  ? gateOutEdit.selectedContainer.lolo_payment?.payment_type
                  : gateOutLoloPayment.payment_type
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
                      type: gateOutEdit?.selectedContainer?.gih_pk
                        ? "EDIT_GATE_OUT_NIGHT_CHARGE"
                        : "GATE_OUT_NIGHT_CHARGE",
                      payload: true,
                    });
                  }}
                />
              }
              label="Yes"
              disabled={
                gateOutEdit?.selectedContainer?.lolo_data
                  ?.is_night_charge_bill_invoiced ||
                preGateOutFetch?.payment_type === "Advance" ||
                gateOutEdit.selectedContainer?.lolo_data?.payment_type ===
                  "Advance"
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
                      type: gateOutEdit?.selectedContainer?.gih_pk
                        ? "EDIT_GATE_OUT_NIGHT_CHARGE"
                        : "GATE_OUT_NIGHT_CHARGE",
                      payload: false,
                    });
                  }}
                />
              }
              label="No"
              disabled={
                gateOutEdit?.selectedContainer?.lolo_data
                  ?.is_night_charge_bill_invoiced
              }
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
