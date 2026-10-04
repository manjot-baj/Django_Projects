import React, { useState, useEffect } from "react";
import {
  Typography,
  TextField,
  Button,
  Grid,
  Autocomplete,
  Box,
  Stack,
  Alert,
} from "@mui/material";

import CustomTextfield from "@components/reusablecomponents/GateInTextField";
import DatePickerField from "@components/reusablecomponents/DatePickerField";
import ChequeSearch from "@components/reusablecomponents/ChequeSearch";
import { useDispatch, useSelector } from "react-redux";
import {
  selfTransportSearchHandlingAction,
  setCustomerNameVal,
} from "../actions/GateInActions";
import { customLabelTypography } from "../utils/CustomClasses";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import PaymentLoloComponent from "./PaymentLoloComponent";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import { deletestPaymentAction } from "@/actions/HandlingAndSTPaymentAction";
import { useSnackbar } from "notistack";

const TransporterPayment = (props) => {
  const dispatch = useDispatch();
  const store = useSelector((state) => state);
  const notify = useSnackbar().enqueueSnackbar;
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
  const [openPaymentModal, setOpenPaymentModal] = useState(false);

  const handleModalClose = () => setOpenPaymentModal(false);

  const handleModalOpen = () => setOpenPaymentModal(true);

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
          gateInEdit.selectedContainer.self_transportation_data.customer_name,
      );

      if (
        gateInEdit.selectedContainer.self_transportation_data.customer_name !==
        ""
      ) {
        dispatch(
          setCustomerNameVal(
            gateInEdit.selectedContainer.self_transportation_data.customer_name,
            setCustomerName,
          ),
        );
      }

      // Transporter
      setTransporter(
        gateInEdit.selectedContainer.self_transportation_data.transporter &&
          gateInEdit.selectedContainer.self_transportation_data.transporter,
      );
      // Receipt date
      setReceiptDate(
        gateInEdit.selectedContainer.self_transportation_data.receipt_date &&
          gateInEdit.selectedContainer.self_transportation_data.receipt_date,
      );
      // Origin
      setOrigin(
        gateInEdit.selectedContainer.self_transportation_data.origin &&
          gateInEdit.selectedContainer.self_transportation_data.origin,
      );
      setTransportationRemark(
        gateInEdit.selectedContainer.self_transportation_data.remark &&
          gateInEdit.selectedContainer.self_transportation_data.remark,
      );
      // Payment Type
      setPaymentType(
        gateInEdit.selectedContainer.self_transportation_data.payment_type &&
          gateInEdit.selectedContainer.self_transportation_data.payment_type,
      );
      // Price
      setPrice(
        gateInEdit.selectedContainer.self_transportation_data.price &&
          gateInEdit.selectedContainer.self_transportation_data.price,
      );
      // cHEQUE DETAILS
      // LOLO CHEQUE NUMBER
      settransportationCheque(
        gateInEdit.selectedContainer.self_transportation_data
          .self_transportation_payment &&
          gateInEdit.selectedContainer.self_transportation_data
            .self_transportation_payment.cheque_no,
      );
      // UTR NUMBER
      settransportationUTRNumber(
        gateInEdit.selectedContainer.self_transportation_data
          .self_transportation_payment &&
          gateInEdit.selectedContainer.self_transportation_data
            .self_transportation_payment.utr_no,
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
                .self_transportation_payment.remaining,
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
              .self_transportation_payment.amount,
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
              .self_transportation_payment.original_amount,
        );
      }
      // cHEQUE BANK NAME
      settransportationBankName(
        gateInEdit.selectedContainer.self_transportation_data
          .self_transportation_payment &&
          gateInEdit.selectedContainer.self_transportation_data
            .self_transportation_payment.bank_name,
      );
      // CHEQUE DATE
      settransportationChequeDate(
        gateInEdit.selectedContainer.self_transportation_data
          .self_transportation_payment &&
          gateInEdit.selectedContainer.self_transportation_data
            .self_transportation_payment.date,
      );
      // ACCOUNT Number
      settransportationAccountNumber(
        gateInEdit.selectedContainer.self_transportation_data
          .self_transportation_payment &&
          gateInEdit.selectedContainer.self_transportation_data
            .self_transportation_payment.account_no,
      );
      settransportationAccountName(
        gateInEdit.selectedContainer.self_transportation_data
          .self_transportation_payment &&
          gateInEdit.selectedContainer.self_transportation_data
            .self_transportation_payment.account_name,
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
              .self_transportation_payment.quantity,
        );
      // List OF containers
      setListOfContainers(
        gateInEdit.selectedContainer.self_transportation_data
          .self_transportation_payment &&
          gateInEdit.selectedContainer.self_transportation_data
            .self_transportation_payment.container,
      );
      // RECEIPT NUMBER
      setReceiptNumber(
        gateInEdit.selectedContainer.self_transportation_data &&
          gateInEdit.selectedContainer.self_transportation_data.receipt_no,
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
        search.selfTransportPaymentSelectedCheque.cheque_no,
      );
      settransportationUTRNumber(
        search.selfTransportPaymentSelectedCheque.utr_no,
      );
      settransportationQty(search.selfTransportPaymentSelectedCheque.remaining);
      if (search.selfTransportPaymentSelectedCheque.amount === 0)
        settransportationChequeAmount("0");
      else
        settransportationChequeAmount(
          search.selfTransportPaymentSelectedCheque.amount,
        );
      settransportationBankName(
        search.selfTransportPaymentSelectedCheque.bank_name,
      );
      settransportationChequeDate(
        search.selfTransportPaymentSelectedCheque.date,
      );
      settransportationAccountName(
        search.selfTransportPaymentSelectedCheque.account_name,
      );
      settransportationAccountNumber(
        search.selfTransportPaymentSelectedCheque.account_no,
      );
      if (search.selfTransportPaymentSelectedCheque.quantity === 0)
        setChequeRemainingQty("0");
      else
        setChequeRemainingQty(
          search.selfTransportPaymentSelectedCheque.quantity,
        );
      setListOfContainers(search.selfTransportPaymentSelectedCheque.container);
      // CHEQUE ORIGINAL AMOUNT
      if (search.selfTransportPaymentSelectedCheque.original_amount === 0) {
        setChequeOriginalAmount("0");
      } else {
        setChequeOriginalAmount(
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
      type: "TRANSPORTATION_PAYMENT_INIT",
    });
    settransportationCheque("");
    settransportationUTRNumber("");
    settransportationQty("");
    settransportationChequeAmount("");
    settransportationBankName("");
    settransportationChequeDate("");
    settransportationAccountName("");
    settransportationAccountNumber("");
    setChequeRemainingQty("");
    setListOfContainers([]);
    setChequeOriginalAmount("");
  };
  const handleRemovePayment = () => {
    dispatch({
      type: "EDIT_SELF_TRANSPORTATION_LOLO_PAYMENT_INIT_DATA",
    });
    setPaymentType("Cash");
    dispatch({
      type: "EDIT_SELF_TRANSPORT_PAYMENT_TYPE",
      payload: "Cash",
    });
    settransportationCheque("");
    settransportationUTRNumber("");
    settransportationQty("");
    settransportationChequeAmount("");
    settransportationBankName("");
    settransportationChequeDate("");
    settransportationAccountName("");
    settransportationAccountNumber("");
    setChequeRemainingQty("");
    setListOfContainers([]);
    setChequeOriginalAmount("");
  };
  // eslint-disable-next-line no-unused-vars
  const handlePriceCharges = (e) => {
    const regex = /^[0-9]+$/;
    if (e === "" || regex.test(e)) {
      setPrice(e);
    }
  };

  return (
    <div>
      <Box
        sx={{
          padding: "2px 18px 8px 18px",
        }}
      >
        <Grid container spacing={3}>
          <Grid item size={{ xs: 12, sm: 9, md: 6, lg: 3 }}>
            <Typography variant="subtitle1" sx={customLabelTypography}>
              Apply Charges
            </Typography>
            <Grid
              container
              spacing={1}
              sx={(theme) => ({
                border: "1px solid #243545",
                marginTop: "0rem",
                display: "flex",
                borderRadius: 2,
              })}
            >
              <Grid item size={{ xs: 6 }}>
                <Button
                  sx={(theme) => ({
                    borderRadius: selectedChoice ? undefined : 2,
                    color: selectedChoice ? undefined : "#fff",
                    backgroundColor: selectedChoice
                      ? "#fff"
                      : theme.palette.primary.main,
                    width: "100%",
                    padding: 1,
                    "&:hover": {
                      backgroundColor: selectedChoice
                        ? undefined
                        : theme.palette.primary.main,
                    },
                  })}
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
              <Grid item size={{ xs: 6 }}>
                <Button
                  sx={(theme) => ({
                    borderRadius: !selectedChoice ? undefined : 2,
                    color: !selectedChoice ? undefined : "#fff",
                    backgroundColor: !selectedChoice
                      ? "#fff"
                      : theme.palette.primary.main,
                    width: "100%",
                    padding: 1,
                    "&:hover": {
                      backgroundColor: !selectedChoice
                        ? undefined
                        : theme.palette.primary.main,
                    },
                  })}
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
            <Grid item size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
              <Typography variant="subtitle1" sx={customLabelTypography}>
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
                        "& input": {
                          padding: "8px !important",
                        },
                        "& fieldset": {
                          borderColor: "#243545",
                        },
                      },
                    }}
                    onBlur={(e) => {
                      if (
                        selfTransportPayment.apply_charges === "Party" ||
                        gateInEdit.selectedContainer.self_transportation_data
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
                              ? "EDIT_SELF_TRANSPORT_CUSTOMER_NAME"
                              : "TRANSPORTATION_CUSTOMER_NAME",
                            payload: e.target.value,
                          });
                        } else {
                          setCustomerName("");
                          dispatch({
                            type: gateInEdit.selectedContainer.gih_pk
                              ? "EDIT_SELF_TRANSPORT_CUSTOMER_NAME"
                              : "TRANSPORTATION_CUSTOMER_NAME",
                            payload: "",
                          });
                        }
                      } else {
                        setCustomerName(e.target.value);
                        dispatch({
                          type: gateInEdit.selectedContainer.gih_pk
                            ? "EDIT_SELF_TRANSPORT_CUSTOMER_NAME"
                            : "TRANSPORTATION_CUSTOMER_NAME",
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
          <Grid item size={{ xs: 12, sm: 9, md: 6, lg: 3 }}>
            <Typography variant="subtitle1" sx={customLabelTypography}>
              Receipt Number
            </Typography>
            <CustomTextfield
              id="lolo-receipt-number"
              readOnlyP={true}
              value={receiptNumber}
            />
          </Grid>

          <Grid item size={{ xs: 12, sm: 9, md: 6, lg: 3 }}>
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
              options={
                gateIn.allDropDown &&
                gateIn.allDropDown.transporter &&
                gateIn.allDropDown.transporter.map((option) => option.name)
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  variant="outlined"
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      "& input": {
                        padding: "8px !important",
                      },
                      "& fieldset": {
                        borderColor: "#243545",
                      },
                    },
                  }}
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

          <Grid item size={{ xs: 12, sm: 9, md: 6, lg: 3 }}>
            <Typography variant="subtitle1" sx={customLabelTypography}>
              Receipt Date
            </Typography>

            <DatePickerField
              fullWidth
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

          <Grid item size={{ xs: 12, sm: 9, md: 6, lg: 3 }}>
            <Typography variant="subtitle1" sx={customLabelTypography}>
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
            <Grid item size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
              <Typography variant="subtitle1" sx={customLabelTypography}>
                Payment Type
              </Typography>
              <Autocomplete
                value={paymentType}
                onChange={(event, newValue) => {
                  if (
                    (selfTransportPayment?.cheque_no !== "" ||
                      selfTransportPayment?.utr_no !== "") &&
                    newValue !== selfTransportPayment.payment_type
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
                disabled={
                  (gateInEdit.selectedContainer.gih_pk &&
                    gateInEdit.selectedContainer.self_transportation_data.pk &&
                    gateInEdit.selectedContainer.self_transportation_data
                      .payment_type !== "None" &&
                    gateInEdit.selectedContainer.self_transportation_data
                      .is_amt_editable === false) ||
                  (gateInEdit.selectedContainer.gih_pk &&
                    gateInEdit.selectedContainer.self_transportation_data.pk &&
                    gateInEdit.selectedContainer.self_transportation_data
                      ?.self_transportation_payment?.pk)
                }
                options={
                  gateIn.allDropDown &&
                  gateIn.allDropDown.payment_type &&
                  gateInEdit.selectedContainer.gih_pk &&
                  (gateInEdit.selectedContainer.self_transportation_data
                    ?.payment_type === "NEFT" ||
                    gateInEdit.selectedContainer.self_transportation_data
                      ?.payment_type === "RTGS") &&
                  gateInEdit.selectedContainer.self_transportation_data
                    ?.self_transportation_payment?.pk
                    ? gateIn.allDropDown.payment_type.filter(
                        (val) => val === "NEFT" || val === "RTGS",
                      )
                    : gateIn.allDropDown?.payment_type?.map(
                        (option) => option,
                      ) || []
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    variant="outlined"
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        "& input": {
                          padding: "8px !important",
                        },
                        "& fieldset": {
                          borderColor: "#243545",
                        },
                      },
                    }}
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
                    readOnlyP={
                      gateInEdit.selectedContainer.lolo_data.is_amt_editable ===
                        false ||
                      (gateInEdit.selectedContainer.gih_pk &&
                        gateInEdit.selectedContainer.self_transportation_data
                          .pk &&
                        gateInEdit.selectedContainer.self_transportation_data
                          ?.payment_type === "Cheque")
                    }
                  />
                )}
              />
            </Grid>
          )}

          <Grid item size={{ xs: 12, sm: 9, md: 6, lg: 3 }}>
            <Typography variant="subtitle1" sx={customLabelTypography}>
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
              disabled={
                gateInEdit.selectedContainer.lolo_data.is_amt_editable === false
              }
              readOnlyP={
                gateInEdit.selectedContainer.lolo_data.is_amt_editable ===
                  false ||
                gateInEdit.selectedContainer?.self_transportation_data
                  ?.self_transportation_payment?.pk
              }
            />
          </Grid>

          <Grid item size={{ xs: 12, sm: 9, md: 6, lg: 3 }}>
            <Typography variant="subtitle1" sx={customLabelTypography}>
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
          gateInEdit.selectedContainer.self_transportation_data
            .self_transportation_payment?.pk ? null : (
            <ChequeSearch
              paymentSearchResult={search.selfTransportPaymentSearchResult}
              getSearchResultType="GET_SELF_TRANSPORT_SEARCH_RESULT"
              setSelectedPaymentType="SET_SELECTED_SELF_TRANSPORT_SEARCH"
              updatePaymentType={
                gateInEdit.selectedContainer.gih_pk
                  ? "UPDATE_EDIT_CHEQUE_DETAILS_SELF_TRANSPORTATION"
                  : "UPDATE_SELF_TRANSPORT_PAYMENT_CHEQUE_UTR_SEARCH_RESULT"
              }
              searchAction={selfTransportSearchHandlingAction}
              handleRemoveCurrentData={handleRemoveCurrentData}
              enableCloseButton={
                transportationCheque !== "" || transportationUTRNumber !== ""
              }
              paymentType={
                gateInEdit.selectedContainer.gih_pk
                  ? gateInEdit.selectedContainer.self_transportation_data
                      .payment_type
                  : selfTransportPayment.payment_type
              }
            />
          )}

          {(transportationCheque === "" && transportationUTRNumber === "") ||
          (transportationCheque === undefined &&
            transportationUTRNumber === undefined) ? (
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
              {gateInEdit.selectedContainer.gih_pk &&
                gateInEdit.selectedContainer.self_transportation_data
                  .self_transportation_payment?.pk && (
                  <Grid item size={{ xs: 12 }} textAlign={"end"}>
                    <Button
                      variant="text"
                      color="error"
                      startIcon={<DeleteOutlineOutlinedIcon />}
                      onClick={() =>
                        dispatch(
                          deletestPaymentAction(
                            gateInEdit.selectedContainer
                              .self_transportation_data
                              .self_transportation_payment?.pk,
                            handleRemovePayment,
                            gateInEdit.selectedContainer.container_data
                              ?.container_no,
                            gateInEdit.selectedContainer
                              .self_transportation_data?.price,
                            gateInEdit.selectedContainer
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
              {gateInEdit.selectedContainer.gih_pk ? (
                gateInEdit.selectedContainer.self_transportation_data
                  .payment_type === "NEFT" ||
                gateInEdit.selectedContainer.self_transportation_data
                  .payment_type === "RTGS" ? (
                  <Grid item size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                    <Typography sx={customLabelTypography}>UTR No</Typography>
                    <CustomTextfield
                      value={transportationUTRNumber}
                      readOnlyP={true}
                    />
                  </Grid>
                ) : null
              ) : paymentType === "RTGS" || paymentType === "NEFT" ? (
                <Grid item size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                  <Typography sx={customLabelTypography}>UTR No</Typography>
                  <CustomTextfield
                    value={transportationUTRNumber}
                    readOnlyP={true}
                  />
                </Grid>
              ) : null}

              {((gateInEdit.selectedContainer.gih_pk &&
                gateInEdit.selectedContainer.self_transportation_data
                  .payment_type === "Cheque") ||
                paymentType === "Cheque") && (
                <Grid item size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                  <Typography sx={customLabelTypography}>Cheque No</Typography>
                  <CustomTextfield
                    value={transportationCheque}
                    readOnlyP={true}
                  />
                </Grid>
              )}
              <Grid item size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                <Typography sx={customLabelTypography}>
                  {gateInEdit.selectedContainer.container_data.pk &&
                  (gateInEdit.selectedContainer.self_transportation_data
                    .payment_type === "Cheque" ||
                    gateInEdit.selectedContainer.self_transportation_data
                      .payment_type === "NEFT" ||
                    gateInEdit.selectedContainer.self_transportation_data
                      .payment_type === "RTGS") &&
                  gateInEdit.selectedContainer.self_transportation_data
                    .self_transportation_payment?.pk &&
                  gateInEdit.selectedContainer.self_transportation_data
                    .self_transportation_payment.quantity !== "0"
                    ? "Remaining Quantity"
                    : "Quantity"}
                </Typography>
                <CustomTextfield value={transportationQty} readOnlyP={true} />
              </Grid>
              {gateInEdit.selectedContainer.container_data.pk &&
              (gateInEdit.selectedContainer.self_transportation_data
                .payment_type === "Cheque" ||
                gateInEdit.selectedContainer.self_transportation_data
                  .payment_type === "NEFT" ||
                gateInEdit.selectedContainer.self_transportation_data
                  .payment_type === "RTGS") &&
              gateInEdit.selectedContainer.self_transportation_data
                .self_transportation_payment?.pk &&
              gateInEdit.selectedContainer.self_transportation_data
                .self_transportation_payment.quantity !== "0" ? (
                <Grid item size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                  <Typography sx={customLabelTypography}>
                    Original Quantity
                  </Typography>
                  <CustomTextfield
                    value={chequeRemainingQty}
                    readOnlyP={true}
                  />
                </Grid>
              ) : null}
              <Grid item size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                <Typography variant="subtitle1" sx={customLabelTypography}>
                  {
                    // search.loloSelectedCheque ||
                    gateInEdit.selectedContainer.container_data.pk &&
                    (gateInEdit.selectedContainer.self_transportation_data
                      .payment_type === "Cheque" ||
                      gateInEdit.selectedContainer.self_transportation_data
                        .payment_type === "NEFT" ||
                      gateInEdit.selectedContainer.self_transportation_data
                        .payment_type === "RTGS") &&
                    gateInEdit.selectedContainer.self_transportation_data
                      .self_transportation_payment?.pk &&
                    gateInEdit.selectedContainer.self_transportation_data
                      .self_transportation_payment.original_amount !== "0.00"
                      ? "Remaining Amount"
                      : "Amount"
                  }{" "}
                </Typography>
                <CustomTextfield
                  value={transportationChequeAmount}
                  readOnlyP={true}
                />
              </Grid>
              {
                // search.loloSelectedCheque ||
                gateInEdit.selectedContainer.container_data.pk &&
                (gateInEdit.selectedContainer.self_transportation_data
                  .payment_type === "Cheque" ||
                  gateInEdit.selectedContainer.self_transportation_data
                    .payment_type === "NEFT" ||
                  gateInEdit.selectedContainer.self_transportation_data
                    .payment_type === "RTGS") &&
                gateInEdit.selectedContainer.self_transportation_data
                  .self_transportation_payment?.pk &&
                gateInEdit.selectedContainer.self_transportation_data
                  .self_transportation_payment.original_amount !== "0.00" ? (
                  <Grid item size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                    <Typography variant="subtitle1" sx={customLabelTypography}>
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
                <CustomTextfield
                  value={transportationBankName}
                  readOnlyP={true}
                />
              </Grid>
              <Grid item size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                <Typography variant="subtitle1" sx={customLabelTypography}>
                  Date
                </Typography>

                <CustomTextfield
                  value={transportationChequeDate}
                  readOnlyP={true}
                />
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
                  value={transportationAccountName}
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
                <CustomTextfield
                  readOnlyP={true}
                  value={transportationAccountNumber}
                />
              </Grid>
              {chequeListOfContainers && chequeListOfContainers.length > 0 && (
                <Grid item size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                  <Typography variant="subtitle1" sx={customLabelTypography}>
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
          )}

          <PaymentLoloComponent
            openPaymentModal={openPaymentModal}
            handleModalClose={handleModalClose}
            handleModalOpen={handleModalOpen}
            self_transportation={true}
            paymentType={
              gateInEdit.selectedContainer.gih_pk
                ? gateInEdit.selectedContainer.self_transportation_data
                    ?.payment_type
                : selfTransportPayment.payment_type
            }
          />
        </Box>
      ) : null}
    </div>
  );
};

export default TransporterPayment;
