import React, { useState, useEffect } from "react";
import {
  Typography,
  TextField,
  MenuItem,
  Button,
  Grid,
  Autocomplete,
  Box,
  Stack,
  Alert,
} from "@mui/material";
import { useDispatch, useSelector } from "react-redux";

import CustomTextfield from "@components/reusablecomponents/GateInTextField";
import DatePickerField from "@components/reusablecomponents/DatePickerField";

import ChequeSearch from "@components/reusablecomponents/ChequeSearch";
import { selfTransportSearchHandlingAction } from "../../actions/GateInActions";
import { customLabelTypography } from "../../utils/CustomClasses";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import PaymentLoloComponent from "../PaymentLoloComponent";
import { deletestPaymentAction } from "@/actions/HandlingAndSTPaymentAction";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import { useSnackbar } from "notistack";

const GateOutSelfTransportPayment = (props) => {
  const dispatch = useDispatch();
  const notify = useSnackbar().enqueueSnackbar;
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

  const [openPaymentModal, setOpenPaymentModal] = useState(false);

  const handleModalClose = () => setOpenPaymentModal(false);

  const handleModalOpen = () => setOpenPaymentModal(true);

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
          gateOutEdit.selectedContainer.self_transportation_data.customer_name,
      );
      // Transporter
      setTransporter(
        gateOutEdit.selectedContainer.self_transportation_data.transporter &&
          gateOutEdit.selectedContainer.self_transportation_data.transporter,
      );
      // Receipt date
      setgateOutSelfTransportReceiptDate(
        gateOutEdit.selectedContainer.self_transportation_data.receipt_date &&
          gateOutEdit.selectedContainer.self_transportation_data.receipt_date,
      );
      // Origin
      setOrigin(
        gateOutEdit.selectedContainer.self_transportation_data.origin &&
          gateOutEdit.selectedContainer.self_transportation_data.origin,
      );
      setgateOutSelfTransportRemark(
        gateOutEdit.selectedContainer.self_transportation_data.remark &&
          gateOutEdit.selectedContainer.self_transportation_data.remark,
      );
      // Payment Type
      setgateOutSelfTransportPaymentType(
        gateOutEdit.selectedContainer.self_transportation_data.payment_type &&
          gateOutEdit.selectedContainer.self_transportation_data.payment_type,
      );
      // Price
      setgateOutSelfTransportPrice(
        gateOutEdit.selectedContainer.self_transportation_data.price &&
          gateOutEdit.selectedContainer.self_transportation_data.price,
      );
      // cHEQUE DETAILS
      // LOLO CHEQUE NUMBER
      setgateOutSelfTransportCheque(
        gateOutEdit.selectedContainer.self_transportation_data
          .self_transportation_payment &&
          gateOutEdit.selectedContainer.self_transportation_data
            .self_transportation_payment?.cheque_no,
      );

      setgateOutSelfTransportUTRNumber(
        gateOutEdit.selectedContainer.self_transportation_data
          .self_transportation_payment &&
          gateOutEdit.selectedContainer.self_transportation_data
            .self_transportation_payment.utr_no,
      );

      // CHEQUE QUANTITY
      if (gateOutEdit.selectedContainer.self_transportation_data !== "") {
        if (
          gateOutEdit.selectedContainer.self_transportation_data
            .self_transportation_payment
        ) {
          if (
            gateOutEdit.selectedContainer.self_transportation_data
              .self_transportation_payment?.pk
          ) {
            setgateOutSelfTransportQty(
              gateOutEdit.selectedContainer.self_transportation_data
                .self_transportation_payment.remaining,
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
              .self_transportation_payment.amount,
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
              .self_transportation_payment.original_amount,
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
              .self_transportation_payment.quantity,
        );

      // cHEQUE BANK NAME
      setgateOutSelfTransportBankName(
        gateOutEdit.selectedContainer.self_transportation_data
          .self_transportation_payment &&
          gateOutEdit.selectedContainer.self_transportation_data
            .self_transportation_payment.bank_name,
      );
      // CHEQUE DATE
      setgateOutSelfTransportChequeDate(
        gateOutEdit.selectedContainer.self_transportation_data
          .self_transportation_payment &&
          gateOutEdit.selectedContainer.self_transportation_data
            .self_transportation_payment.date,
      );
      // ACCOUNT NAME
      setgateOutSelfTransportAccountName(
        gateOutEdit.selectedContainer.self_transportation_data
          .self_transportation_payment &&
          gateOutEdit.selectedContainer.self_transportation_data
            .self_transportation_payment.account_name,
      );
      setgateOutSelfTransportAccountNumber(
        gateOutEdit.selectedContainer.self_transportation_data
          .self_transportation_payment &&
          gateOutEdit.selectedContainer.self_transportation_data
            .self_transportation_payment.account_no,
      );

      // List OF containers
      setgateOutSelfTransportListOfContainers(
        gateOutEdit.selectedContainer.self_transportation_data
          .self_transportation_payment &&
          gateOutEdit.selectedContainer.self_transportation_data
            .self_transportation_payment.container,
      );
      // RECEIPT NUMBER
      setgateOutSelfTransportReceiptNumber(
        gateOutEdit.selectedContainer.self_transportation_data &&
          gateOutEdit.selectedContainer.self_transportation_data.receipt_no,
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
        search.selfTransportPaymentSelectedCheque.cheque_no,
      );
      setgateOutSelfTransportUTRNumber(
        search.selfTransportPaymentSelectedCheque.utr_no,
      );
      setgateOutSelfTransportQty(
        search.selfTransportPaymentSelectedCheque.remaining,
      );
      if (search.selfTransportPaymentSelectedCheque.amount === 0)
        setgateOutSelfTransportPaymentChequeAmount("0");
      else
        setgateOutSelfTransportPaymentChequeAmount(
          search.selfTransportPaymentSelectedCheque.amount,
        );
      if (search.selfTransportPaymentSelectedCheque.quantity === 0)
        setgateOutSelfTransportChequeOriginalQty("0");
      else
        setgateOutSelfTransportChequeOriginalQty(
          search.selfTransportPaymentSelectedCheque.quantity,
        );
      setgateOutSelfTransportBankName(
        search.selfTransportPaymentSelectedCheque.bank_name,
      );
      setgateOutSelfTransportChequeDate(
        search.selfTransportPaymentSelectedCheque.date,
      );
      setgateOutSelfTransportAccountName(
        search.selfTransportPaymentSelectedCheque.account_name,
      );
      setgateOutSelfTransportAccountNumber(
        search.selfTransportPaymentSelectedCheque.account_no,
      );
      setgateOutSelfTransportListOfContainers(
        search.selfTransportPaymentSelectedCheque.container,
      );
      // CHEQUE ORIGINAL AMOUNT
      if (search.selfTransportPaymentSelectedCheque.original_amount === 0) {
        setgateOutSelfTransportChequeOriginalAmount("0");
      } else {
        setgateOutSelfTransportChequeOriginalAmount(
          search.selfTransportPaymentSelectedCheque.original_amount,
        );
      }
    }
  }, [search.selfTransportPaymentSelectedCheque]);

  const handleChoiceSelect = () => {
    setSelectedChoice((choice) => !choice);
  };

  const handleRemoveCurrentData = () => {
    dispatch({
      type: "GATE_OUT_SELF_TRANSPORTATION_PAYMENT_INIT",
    });
    setgateOutSelfTransportCheque("");
    setgateOutSelfTransportUTRNumber("");
    setgateOutSelfTransportQty("");
    setgateOutSelfTransportPaymentChequeAmount("");
    setgateOutSelfTransportBankName("");
    setgateOutSelfTransportChequeDate("");
    setgateOutSelfTransportAccountName("");
    setgateOutSelfTransportAccountNumber("");
    setgateOutSelfTransportChequeOriginalQty("");
    setgateOutSelfTransportListOfContainers([]);
    setgateOutSelfTransportPaymentChequeAmount("");
  };

  const handleRemovePayment = () => {
    dispatch({
      type: "EDIT_SELF_TRANSPORTATION_LOLO_PAYMENT_OUT_INIT_DATA",
    });
    setgateOutSelfTransportPaymentType("Cash");
    dispatch({
      type: "EDIT_GATE_OUT_SELF_TRANSPORT_PAYMENT_TYPE",
      payload: "Cash",
    });
    setgateOutSelfTransportCheque("");
    setgateOutSelfTransportUTRNumber("");
    setgateOutSelfTransportQty("");
    setgateOutSelfTransportPaymentChequeAmount("");
    setgateOutSelfTransportBankName("");
    setgateOutSelfTransportChequeDate("");
    setgateOutSelfTransportAccountName("");
    setgateOutSelfTransportAccountNumber("");
    setgateOutSelfTransportChequeOriginalQty("");
    setgateOutSelfTransportListOfContainers([]);
    setgateOutSelfTransportPaymentChequeAmount("");
  };

  return (
    <div>
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
                borderRadius: 6,
              }}
            >
              <Grid item size={{ xs: 6 }}>
                <Button
                  sx={(theme) => ({
                    backgroundColor: !selectedChoice
                      ? theme.palette.primary.main
                      : "#fff",
                    color: !selectedChoice ? "#fff" : "#000",
                    width: "100%",
                    padding: 1,
                    borderRadius: 5,
                    "&:hover": {
                      backgroundColor: !selectedChoice
                        ? theme.palette.primary.main
                        : "#fff",
                    },
                  })}
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
              <Grid item size={{ xs: 6 }}>
                <Button
                  sx={(theme) => ({
                    backgroundColor: selectedChoice
                      ? theme.palette.primary.main
                      : "#fff",
                    color: selectedChoice ? "#fff" : "#000",
                    width: "100%",
                    padding: 1,
                    borderRadius: 5,
                    "&:hover": {
                      backgroundColor: selectedChoice
                        ? theme.palette.primary.main
                        : "#fff",
                    },
                  })}
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
            <Grid item size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
              <Typography variant="subtitle1" sx={customLabelTypography}>
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
                  (option) => option.name,
                )}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    variant="outlined"
                    onBlur={(e) => {
                      if (
                        gateOutSelfTransportPayment.apply_charges === "Party" ||
                        gateOutEdit.selectedContainer.self_transportation_data
                          .apply_charges === "Party"
                      ) {
                        if (
                          gateIn?.allDropDown?.party_client_data
                            ?.map((option) => option.name)
                            ?.includes(e.target.value)
                        ) {
                          setgateOutSelfTransportCustomerName(e.target.value);
                          dispatch({
                            type: gateOutEdit.selectedContainer.goh_pk
                              ? "EDIT_GATE_OUT_SELF_TRANSPORT_CUSTOMER_NAME"
                              : "GATE_OUT_SELF_TRANSPORT_CUSTOMER_NAME",
                            payload: e.target.value,
                          });
                        } else {
                          setgateOutSelfTransportCustomerName("");
                          dispatch({
                            type: gateOutEdit.selectedContainer.goh_pk
                              ? "EDIT_GATE_OUT_SELF_TRANSPORT_CUSTOMER_NAME"
                              : "GATE_OUT_SELF_TRANSPORT_CUSTOMER_NAME",
                            payload: "",
                          });
                        }
                      } else {
                        setgateOutSelfTransportCustomerName(e.target.value);
                        dispatch({
                          type: gateOutEdit.selectedContainer.goh_pk
                            ? "EDIT_GATE_OUT_SELF_TRANSPORT_CUSTOMER_NAME"
                            : "GATE_OUT_SELF_TRANSPORT_CUSTOMER_NAME",
                          payload: e.target.value,
                        });
                      }
                    }}
                    fullWidth
                  />
                )}
              />
            </Grid>
          )}

          <Grid item size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
            <Typography variant="subtitle1" sx={customLabelTypography}>
              Receipt Number
            </Typography>
            <CustomTextfield
              id="self-transport-receipt-number"
              readOnlyP={true}
              value={gateOutSelfTransportreceiptNumber}
            />
          </Grid>

          {gateIn.allDropDown && gateIn.allDropDown.transporter && (
            <Grid item size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
              <Typography variant="subtitle1" sx={customLabelTypography}>
                Transporter
              </Typography>
              <Autocomplete
                value={transporter}
                onChange={(event, newValue) => {
                  setTransporter(newValue);
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
                options={gateIn.allDropDown.transporter.map(
                  (option) => option.name,
                )}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    id="gate-out-self-transportation-transporter"
                    variant="outlined"
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

          <Grid item size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
            <Typography variant="subtitle1" sx={customLabelTypography}>
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
          <Grid item size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
            <Typography variant="subtitle1" sx={customLabelTypography}>
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

          <Grid item size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
            <Typography variant="subtitle1" sx={customLabelTypography}>
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
                  ?.self_transportation_payment?.pk
              }
              size="small"
              onChange={(e, newValue) => {
                if (
                  (gateOutSelfTransportPayment?.cheque_no !== "" ||
                    gateOutSelfTransportPayment?.utr_no !== "") &&
                  newValue !== gateOutSelfTransportPayment.payment_type
                ) {
                  handleRemoveCurrentData();
                }
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
              gateOutEdit.selectedContainer.self_transportation_data.pk &&
              (gateOutEdit.selectedContainer.self_transportation_data
                ?.payment_type === "NEFT" ||
                gateOutEdit.selectedContainer.self_transportation_data
                  ?.payment_type === "RTGS") &&
              gateOutEdit.selectedContainer.self_transportation_data
                ?.self_transportation_payment?.pk
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
          </Grid>
          <Grid item size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
            <Typography variant="subtitle1" sx={customLabelTypography}>
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
              disabled={
                gateOutEdit.selectedContainer.lolo_data.is_amt_editable ===
                false
              }
              readOnlyP={
                gateOutEdit.selectedContainer.lolo_data.is_amt_editable ===
                  false ||
                gateOutEdit.selectedContainer?.self_transportation_data
                  ?.self_transportation_payment?.pk
              }
            />
          </Grid>
          <Grid item size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
            <Typography variant="subtitle1" sx={customLabelTypography}>
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
      </Box>
      {gateOutSelfTransportpaymentType === "Cheque" ||
      gateOutSelfTransportpaymentType === "NEFT" ||
      gateOutSelfTransportpaymentType === "RTGS" ? (
        <Box
          sx={(theme) => ({
            backgroundColor: "#EAF0F5",
            borderRadius: 2,
            padding: theme.spacing(1.5, 1.5),
            margin: theme.spacing(0.5, 1),
          })}
        >
          {gateOutEdit.selectedContainer.goh_pk &&
          gateOutEdit.selectedContainer.self_transportation_data
            .self_transportation_payment?.pk ? null : (
            <ChequeSearch
              paymentSearchResult={search.selfTransportPaymentSearchResult}
              getSearchResultType="GET_SELF_TRANSPORT_SEARCH_RESULT"
              setSelectedPaymentType="SET_SELECTED_SELF_TRANSPORT_SEARCH"
              updatePaymentType={
                gateOutEdit.selectedContainer.goh_pk
                  ? "UPDATE_GATE_OUT_EDIT_CHEQUE_DETAILS_SELF_TRANSPORTATION"
                  : "UPDATE_GATE_OUT_SELF_TRANSPORT_PAYMENT_CHEQUE_UTR_SEARCH_RESULT"
              }
              enableCloseButton={
                gateOutSelfTransportCheque !== "" ||
                gateOutSelfTransportUTRNumber !== ""
              }
              searchAction={selfTransportSearchHandlingAction}
              handleRemoveCurrentData={handleRemoveCurrentData}
              paymentType={
                gateOutEdit.selectedContainer.goh_pk
                  ? gateOutEdit.selectedContainer.self_transportation_data
                      .payment_type
                  : gateOutSelfTransportPayment.payment_type
              }
            />
          )}
          {(gateOutSelfTransportCheque === "" &&
            gateOutSelfTransportUTRNumber === "") ||
          (gateOutSelfTransportCheque === undefined &&
            gateOutSelfTransportUTRNumber === undefined) ? (
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
          ) : (
            <Grid container spacing={1} mt={4}>
              {gateOutEdit.selectedContainer.goh_pk &&
                gateOutEdit.selectedContainer.self_transportation_data
                  .self_transportation_payment?.pk && (
                  <Grid item size={{ xs: 12 }} textAlign={"end"}>
                    <Button
                      variant="text"
                      color="error"
                      startIcon={<DeleteOutlineOutlinedIcon />}
                      onClick={() =>
                        dispatch(
                          deletestPaymentAction(
                            gateOutEdit.selectedContainer
                              .self_transportation_data
                              .self_transportation_payment?.pk,
                            handleRemovePayment,
                            gateOutEdit.selectedContainer.container_data
                              ?.container_no,
                            gateOutEdit.selectedContainer
                              .self_transportation_data?.price,
                            gateOutEdit.selectedContainer
                              .self_transportation_data?.pk,
                            notify,
                          ),
                        )
                      }
                    >
                      Remove Payment
                    </Button>
                  </Grid>
                )}
              {gateOutEdit.selectedContainer.goh_pk ? (
                gateOutEdit.selectedContainer.self_transportation_data
                  .payment_type === "NEFT" ||
                gateOutEdit.selectedContainer.self_transportation_data
                  .payment_type === "RTGS" ? (
                  <Grid item size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                    <Typography sx={customLabelTypography}>UTR No</Typography>
                    <CustomTextfield
                      value={gateOutSelfTransportUTRNumber}
                      readOnlyP={true}
                    />
                  </Grid>
                ) : null
              ) : gateOutSelfTransportpaymentType === "RTGS" ||
                gateOutSelfTransportpaymentType === "NEFT" ? (
                <Grid item size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                  <Typography sx={customLabelTypography}>UTR No</Typography>
                  <CustomTextfield
                    value={gateOutSelfTransportUTRNumber}
                    readOnlyP={true}
                  />
                </Grid>
              ) : null}

              {((gateOutEdit.selectedContainer.goh_pk &&
                gateOutEdit.selectedContainer.self_transportation_data
                  .payment_type === "Cheque") ||
                gateOutSelfTransportpaymentType === "Cheque") && (
                <Grid item size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                  <Typography sx={customLabelTypography}>Cheque No</Typography>
                  <CustomTextfield
                    value={gateOutSelfTransportCheque}
                    readOnlyP={true}
                  />
                </Grid>
              )}
              <Grid item size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                <Typography sx={customLabelTypography}>
                  {gateOutEdit.selectedContainer.container_data.pk &&
                  (gateOutEdit.selectedContainer.self_transportation_data
                    .payment_type === "Cheque" ||
                    gateOutEdit.selectedContainer.self_transportation_data
                      .payment_type === "NEFT" ||
                    gateOutEdit.selectedContainer.self_transportation_data
                      .payment_type === "RTGS") &&
                  gateOutEdit.selectedContainer.self_transportation_data
                    .self_transportation_payment?.pk &&
                  gateOutEdit.selectedContainer.self_transportation_data
                    .self_transportation_payment?.quantity !== "0"
                    ? "Remaining Quantity"
                    : "Quantity"}
                </Typography>
                <CustomTextfield
                  value={gateOutSelfTransportQty}
                  readOnlyP={true}
                />
              </Grid>

              {gateOutEdit.selectedContainer.container_data.pk &&
              (gateOutEdit.selectedContainer.self_transportation_data
                .payment_type === "Cheque" ||
                gateOutEdit.selectedContainer.self_transportation_data
                  .payment_type === "NEFT" ||
                gateOutEdit.selectedContainer.self_transportation_data
                  .payment_type === "RTGS") &&
              gateOutEdit.selectedContainer.self_transportation_data
                .self_transportation_payment?.pk &&
              gateOutEdit.selectedContainer.self_transportation_data
                .self_transportation_payment?.quantity !== "0" ? (
                <Grid item size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                  <Typography sx={customLabelTypography}>
                    Original Quantity
                  </Typography>
                  <CustomTextfield
                    value={gateOutSelfTransportchequeOriginalQty}
                    readOnlyP={true}
                  />
                </Grid>
              ) : null}
              <Grid item size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                <Typography variant="subtitle1" sx={customLabelTypography}>
                  {
                    // search.loloSelectedCheque ||
                    gateOutEdit.selectedContainer.container_data.pk &&
                    (gateOutEdit.selectedContainer.self_transportation_data
                      .payment_type === "Cheque" ||
                      gateOutEdit.selectedContainer.self_transportation_data
                        .payment_type === "NEFT" ||
                      gateOutEdit.selectedContainer.self_transportation_data
                        .payment_type === "RTGS") &&
                    gateOutEdit.selectedContainer.self_transportation_data
                      .self_transportation_payment?.pk &&
                    gateOutEdit.selectedContainer.self_transportation_data
                      .self_transportation_payment?.original_amount !== "0.00"
                      ? "Remaining Amount"
                      : "Amount"
                  }{" "}
                </Typography>
                <CustomTextfield
                  value={gateOutSelfTransportPaymentChequeAmount}
                  readOnlyP={true}
                />
              </Grid>
              {
                // search.loloSelectedCheque ||
                gateOutEdit.selectedContainer.container_data.pk &&
                (gateOutEdit.selectedContainer.self_transportation_data
                  .payment_type === "Cheque" ||
                  gateOutEdit.selectedContainer.self_transportation_data
                    .payment_type === "NEFT" ||
                  gateOutEdit.selectedContainer.self_transportation_data
                    .payment_type === "RTGS") &&
                gateOutEdit.selectedContainer.self_transportation_data
                  .self_transportation_payment?.pk &&
                gateOutEdit.selectedContainer.self_transportation_data
                  .self_transportation_payment?.original_amount !== "0.00" ? (
                  <Grid item size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                    <Typography variant="subtitle1" sx={customLabelTypography}>
                      Original Amount
                    </Typography>
                    <CustomTextfield
                      id="lolo-original-amount"
                      value={gateOutSelfTransportchequeOriginalAmount}
                      readOnlyP={true}
                    />
                  </Grid>
                ) : null
              }
              <Grid item size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                <Typography variant="subtitle1" sx={customLabelTypography}>
                  Bank Name{" "}
                  {gateOutSelfTransportpaymentType === "NEFT" ||
                  gateOutSelfTransportpaymentType === "RTGS" ? (
                    " "
                  ) : (
                    <span style={{ color: "red" }}>*</span>
                  )}
                </Typography>
                <CustomTextfield
                  value={gateOutSelfTransportBankName}
                  readOnlyP={true}
                />
              </Grid>
              <Grid item size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                <Typography variant="subtitle1" sx={customLabelTypography}>
                  Date
                </Typography>

                <CustomTextfield
                  value={gateOutSelfTransportChequeDate}
                  readOnlyP={true}
                />
              </Grid>
              <Grid item size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                <Typography variant="subtitle1" sx={customLabelTypography}>
                  Account Name{" "}
                  {gateOutSelfTransportpaymentType === "NEFT" ||
                  gateOutSelfTransportpaymentType === "RTGS" ? (
                    " "
                  ) : (
                    <span style={{ color: "red" }}>*</span>
                  )}
                </Typography>
                <CustomTextfield
                  id="lolo-acc-name"
                  value={gateOutSelfTransportAccountName}
                  readOnlyP={true}
                />
              </Grid>
              <Grid item size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                <Typography variant="subtitle1" sx={customLabelTypography}>
                  Account Number{" "}
                  {gateOutSelfTransportpaymentType === "NEFT" ||
                  gateOutSelfTransportpaymentType === "RTGS" ? (
                    " "
                  ) : (
                    <span style={{ color: "red" }}>*</span>
                  )}
                </Typography>
                <CustomTextfield
                  readOnlyP={true}
                  value={gateOutSelfTransportAccountNumber}
                />
              </Grid>
              {gateOutSelfTransportchequeListOfContainers &&
                gateOutSelfTransportchequeListOfContainers.length > 0 && (
                  <Grid item size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                    <Typography variant="subtitle1" sx={customLabelTypography}>
                      List of containers
                    </Typography>

                    <TextField
                      id="lolo-list-of-containers"
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
          )}

          <PaymentLoloComponent
            openPaymentModal={openPaymentModal}
            handleModalClose={handleModalClose}
            handleModalOpen={handleModalOpen}
            self_transportation={true}
            paymentType={
              gateOutEdit.selectedContainer.goh_pk
                ? gateOutEdit.selectedContainer.self_transportation_data
                    ?.payment_type
                : gateOutSelfTransportPayment.payment_type
            }
          />
        </Box>
      ) : null}
    </div>
  );
};

export default GateOutSelfTransportPayment;
