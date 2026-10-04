import {
  Box,
  Grid,
  MenuItem,
  Modal,
  TextField,
  Typography,
  Button,
  useMediaQuery,
  Alert,
  Tooltip,
  Divider,
  InputAdornment,
  IconButton,
} from "@mui/material";
import { Stack } from "@mui/material";
import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ADVANCE_FINANCE_CONSTANT } from "../../reducers/AdvanceFinance/AdvanceFinanceReducer";
import {
  addAdvanceFinanceAction,
  getLOLOFinanceSizeRateAction,
  updateAdvanceFinanceAction,
  updateAdvanceFinanceRemarksAction,
} from "../../actions/AdvanceFinance/AdvanceFinanceAction";
import { useSnackbar } from "notistack";
import { getLOLOFinanceCustomerAccountBalanceLeftAction } from "@/actions/LOLOFinance/LOLOFinanceCustomerAction";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import EditNoteIcon from "@mui/icons-material/EditNote";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  bgcolor: "background.paper",
  width: "1200px",
  outline: "none",
  border: "none",
  borderRadius: "4px",
  p: 4,
};

const mobileStyle = {
  position: "absolute",
  top: "48%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  bgcolor: "background.paper",
  width: "100%",
  outline: "none",
  border: "none",
  borderRadius: "4px",
  p: 4,
};

const label = {
  color: "black",
  fontSize: "12px",
  marginTop: "-10px",
};

const LOLOFinanceUpdateModal = ({ openUpdate, handleCloseUpdate }) => {
  const dispatch = useDispatch();
  const notify = useSnackbar().enqueueSnackbar;
  const { gateIn } = useSelector((state) => state);
  const { requestData, lolo_finance_size_rate_data } = useSelector(
    (state) => state.AdvanceFinanceReducer,
  );
  const [clientAmount, setClientAmount] = useState("");
  const matchesIphone = useMediaQuery("(max-width:500px)");
  const [clientDetails, setClientDetails] = useState("");

  useEffect(() => {
    dispatch(getLOLOFinanceSizeRateAction(notify));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "tds" && (value < 0 || value > 100)) {
      notify("Tds % should be from 0 to 100 ", { variant: "warning" });
      return;
    }

    if (name === "client") {
      dispatch(
        getLOLOFinanceCustomerAccountBalanceLeftAction(
          value,
          setClientAmount,
          setClientDetails,
          notify,
        ),
      );
    }
    if (name === "original_amount") {
      if (
        requestData.payment_type === "Finance_Account" &&
        requestData.client !== ""
      ) {
        if (value > clientAmount) {
          notify("Please select a Amount lower than balance.", {
            variant: "warning",
          });
          return;
        }
      }
    }
    dispatch({
      type: ADVANCE_FINANCE_CONSTANT.GET_ADVANCE_UPDATE,
      payload: {
        [name]: value,
      },
    });
  };

  useEffect(() => {
    if (!requestData.pk) {
      dispatch({
        type: ADVANCE_FINANCE_CONSTANT.GET_ADVANCE_UPDATE,
        payload: {
          original_amount: 0,
        },
      });
    }
  }, [requestData?.payment_type]);

  const handleFinancePayment = () => {
    if (requestData.entry_type === "IN" && requestData.bl_no === "") {
      notify("Please Fill Billing Number", { variant: "warning" });
    } else if (requestData.entry_type === "OUT" && requestData.bk_no === "") {
      notify("Please Fill Booking Number", { variant: "warning" });
    } else if (
      requestData.original_amount === "" ||
      requestData.original_amount <= 0
    ) {
      notify("Please Fill Amount ", { variant: "warning" });
    } else if (
      (requestData.size_20_quantity === "" ||
        requestData.size_20_quantity <= 0) &&
      (requestData.size_40_quantity === "" || requestData.size_40_quantity <= 0)
    ) {
      notify("Please Fill Size 20 or Size 40  Quantity ", {
        variant: "warning",
      });
    } else if (
      requestData.payment_type === "UPI" &&
      requestData.transaction_id === ""
    ) {
      notify("Please Fill Transaction ID ", { variant: "warning" });
    } else if (
      requestData.payment_type === "Cheque" &&
      (requestData.cheque_no === "" ||
        requestData.account_no === "" ||
        requestData.bank_name === "" ||
        requestData.account_name === "")
    ) {
      notify("Please Fill Cheque No and Bank Details ", { variant: "warning" });
    } else if (
      (requestData.payment_type === "NEFT" ||
        requestData.payment_type === "RTGS") &&
      (requestData.utr_no === "" ||
        requestData.account_no === "" ||
        requestData.bank_name === "" ||
        requestData.account_name === "")
    ) {
      notify("Please Fill Bank Details ", { variant: "warning" });
    } else if (
      (calculateSize20Amount || calculateSize40Amount) &&
      requestData.original_amount < calculateTotalAmount
    ) {
      notify(
        `Original amount is insufficient with respect to the quantity and current rate. Please select a amount greater or equal to  ${calculateTotalAmount} . Verify the amount calculation on hovering Amount field icon.`,
        { variant: "error" },
      );
    } else {
      dispatch(addAdvanceFinanceAction(notify, handleCloseUpdate));
    }
  };
  const handleFinancePaymentUpdate = () => {
    if (requestData.entry_type === "IN" && requestData.bl_no === "") {
      notify("Please Fill Billing Number", { variant: "warning" });
    } else if (requestData.entry_type === "OUT" && requestData.bk_no === "") {
      notify("Please Fill Booking Number", { variant: "warning" });
    } else if (
      requestData.original_amount === "" ||
      requestData.original_amount <= 0
    ) {
      notify("Please Fill Amount ", { variant: "warning" });
    } else if (
      (requestData.size_20_quantity === "" ||
        requestData.size_20_quantity <= 0) &&
      (requestData.size_40_quantity === "" || requestData.size_40_quantity <= 0)
    ) {
      notify("Please Fill Size 20 or Size 40  Quantity ", {
        variant: "warning",
      });
    } else if (
      requestData.payment_type === "UPI" &&
      requestData.transaction_id === ""
    ) {
      notify("Please Fill Transaction ID ", { variant: "warning" });
    } else if (
      requestData.payment_type === "Cheque" &&
      (requestData.cheque_no === "" ||
        requestData.account_no === "" ||
        requestData.bank_name === "" ||
        requestData.account_name === "")
    ) {
      notify("Please Fill Cheque No and Bank Details ", { variant: "warning" });
    } else if (
      (requestData.payment_type === "NEFT" ||
        requestData.payment_type === "RTGS") &&
      (requestData.utr_no === "" ||
        requestData.account_no === "" ||
        requestData.bank_name === "" ||
        requestData.account_name === "")
    ) {
      notify("Please Fill Bank Details ", { variant: "warning" });
    } else if (
      (calculateSize20Amount || calculateSize40Amount) &&
      requestData.original_amount < calculateTotalAmount
    ) {
      notify(
        `Original amount is insufficient with respect to the quantity and current rate. Please select a amount greater or equal to  ${calculateTotalAmount} . Verify the amount calculation on hovering Amount field icon.`,
        { variant: "error" },
      );
    } else {
      dispatch(updateAdvanceFinanceAction(notify, handleCloseUpdate));
    }
  };

  const calculateSize20Amount = useMemo(() => {
    const size20Rate = Number(
      lolo_finance_size_rate_data?.site_lolo_rates?.size_20,
    );

    if (!size20Rate) return 0;

    const quantity = Number(requestData?.size_20_quantity);

    if (!quantity) return 0;

    const gst = 0.18;
    const tds = Number(requestData?.tds || 0) / 100;

    // Total with GST
    let totalWithTax;
    if (
      requestData?.payment_type === "Finance_Account" &&
      (clientDetails?.with_gst === false ||
        (requestData?.pk && requestData?.with_gst === false))
    ) {
      totalWithTax = Math.round(size20Rate) * quantity;
    } else {
      totalWithTax = Math.round(size20Rate + size20Rate * gst) * quantity;
    }

    // TDS Amount
    const tdsAmount = Math.round(size20Rate * tds * quantity);

    // Original Amount
    return totalWithTax - tdsAmount;
    // return totalWithTax - tdsAmount;
  }, [
    lolo_finance_size_rate_data?.site_lolo_rates?.size_20,
    requestData?.size_20_quantity,
    requestData?.tds,
    requestData?.payment_type,
    clientDetails?.with_gst,
  ]);

  const calculateSize40Amount = useMemo(() => {
    const size40Rate = Number(
      lolo_finance_size_rate_data?.site_lolo_rates?.size_40,
    );

    if (!size40Rate) return 0;

    const quantity = Number(requestData?.size_40_quantity);

    if (!quantity) return 0;

    const gst = 0.18;
    const tds = Number(requestData?.tds || 0) / 100;

    // Total with GST
    let totalWithTax;
    if (
      requestData?.payment_type === "Finance_Account" &&
      (clientDetails?.with_gst === false ||
        (requestData?.pk && requestData?.with_gst === false))
    ) {
      totalWithTax = Math.round(size40Rate) * quantity;
    } else {
      totalWithTax = Math.round(size40Rate + size40Rate * gst) * quantity;
    }

    // TDS Amount
    const tdsAmount = Math.round(size40Rate * tds * quantity);

    // Original Amount
    return totalWithTax - tdsAmount;
  }, [
    lolo_finance_size_rate_data?.site_lolo_rates?.size_40,
    requestData?.size_40_quantity,
    requestData?.tds,
    requestData?.payment_type,
    clientDetails?.with_gst,
  ]);

  const calculateTotalAmount = useMemo(() => {
    return (
      calculateSize20Amount +
      calculateSize40Amount +
      (Number(requestData?.size_20_quantity) > 1 ||
        Number(requestData?.size_40_quantity) > 1
        ? 1
        : 0)
    );
  }, [
    calculateSize20Amount,
    calculateSize40Amount,
    requestData?.size_20_quantity,
    requestData?.size_40_quantity,
  ]);

  const ifPlusOneAdded = useMemo(() => {
    return (
      Number(requestData?.size_20_quantity) > 1 ||
      Number(requestData?.size_40_quantity) > 1
    );
  }, [requestData?.size_20_quantity, requestData?.size_40_quantity]);

  return (
    <Modal
      open={openUpdate}
      onClose={handleCloseUpdate}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <Box sx={matchesIphone ? mobileStyle : style}>
        <Stack spacing={2}>
          <Typography
            variant="caption"
            sx={{
              color: "gray",
            }}
          >
            1. Select Bill Details
          </Typography>
          <Grid container spacing={2} sx={{ pl: 3 }}>
            <Grid item size={{ xs: 6, sm: 6, md: 4 }}>
              <Typography
                variant="subtitle2"
                sx={{
                  fontSize: "12px",
                  color: "rgb(23,43,77)",
                  marginBottom: "4px",
                }}
              >
                Select Type <span style={{ color: "red" }}>*</span>
              </Typography>
              <TextField
                variant="outlined"
                color="primary"
                select
                value={requestData.entry_type}
                defaultValue={requestData.entry_type}
                name="entry_type"
                onChange={handleChange}
                fullWidth
                sx={{
                  height: "32px",
                }}
                size="small"
                InputLabelProps={{ style: label }}
              >
                {["IN", "OUT"].map((val, ind) => (
                  <MenuItem key={val} value={val}>
                    {val}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            {requestData.entry_type === "IN" ? (
              <Grid item size={{ xs: 6, sm: 6, md: 4 }}>
                <Typography
                  variant="subtitle2"
                  sx={{
                    fontSize: "12px",
                    color: "rgb(23,43,77)",
                    marginBottom: "4px",
                  }}
                >
                  BL No <span style={{ color: "red" }}>*</span>
                </Typography>
                <TextField
                  variant="outlined"
                  value={requestData.bl_no}
                  name="bl_no"
                  color="primary"
                  onChange={handleChange}
                  fullWidth
                  sx={{
                    height: "32px",
                  }}
                  size="small"
                  InputLabelProps={{ style: label }}
                />
              </Grid>
            ) : (
              <Grid item size={{ xs: 6, sm: 6, md: 4 }}>
                <Typography
                  variant="subtitle2"
                  sx={{
                    fontSize: "12px",
                    color: "rgb(23,43,77)",
                    marginBottom: "4px",
                  }}
                >
                  Booking No <span style={{ color: "red" }}>*</span>
                </Typography>
                <TextField
                  variant="outlined"
                  value={requestData.bk_no}
                  name="bk_no"
                  color="primary"
                  onChange={handleChange}
                  fullWidth
                  sx={{
                    height: "32px",
                  }}
                  size="small"
                  InputLabelProps={{ style: label }}
                />
              </Grid>
            )}
            <Grid item size={{ xs: 6, sm: 6, md: 4 }}>
              <Typography
                variant="subtitle2"
                sx={{
                  fontSize: "12px",
                  color: "rgb(23,43,77)",
                  marginBottom: "4px",
                }}
              >
                Customer <span style={{ color: "red" }}>*</span>
              </Typography>
              <TextField
                variant="outlined"
                color="primary"
                select
                fullWidth
                value={requestData.client}
                name="client"
                onChange={handleChange}
                sx={{
                  height: "32px",
                }}
                size="small"
                InputLabelProps={{ style: label }}
              >
                {gateIn.allDropDown?.lf_advance_payment_client_list?.map(
                  (val, ind) => (
                    <MenuItem key={val} value={val}>
                      {val}
                    </MenuItem>
                  ),
                )}
              </TextField>
            </Grid>
          </Grid>
          <Typography
            variant="caption"
            sx={{
              color: "gray",
              pt: 2,
            }}
          >
            2. Select Payment Type
          </Typography>
          <Grid container spacing={2} sx={{ pl: 3 }}>
            <Grid size={{ sm: 2 }}>
              <Button
                variant="contained"
                color={
                  requestData.payment_type === "Cash" ? "primary" : "inherit"
                }
                fullWidth
                onClick={(e) =>
                  dispatch({
                    type: ADVANCE_FINANCE_CONSTANT.GET_ADVANCE_UPDATE,
                    payload: {
                      payment_type: "Cash",
                      cheque_no: null,
                      utr_no: null,
                      bank_name: null,
                      account_name: null,
                      account_no: null,
                      transaction_id: null,
                    },
                  })
                }
              >
                Cash
              </Button>
            </Grid>
            <Grid size={{ sm: 2 }}>
              <Button
                variant="contained"
                color={
                  requestData.payment_type === "Finance_Account"
                    ? "primary"
                    : "inherit"
                }
                fullWidth
                onClick={(e) => {
                  requestData.client !== "" &&
                    dispatch(
                      getLOLOFinanceCustomerAccountBalanceLeftAction(
                        requestData.client,
                        setClientAmount,
                        setClientDetails,
                        notify,
                      ),
                    );

                  dispatch({
                    type: ADVANCE_FINANCE_CONSTANT.GET_ADVANCE_UPDATE,
                    payload: {
                      payment_type: "Finance_Account",
                      cheque_no: null,
                      utr_no: null,
                      bank_name: null,
                      account_name: null,
                      account_no: null,
                      transaction_id: null,
                    },
                  });
                }}
              >
                Finance Account
              </Button>
            </Grid>
            <Grid item size={{ sm: 2 }}>
              <Button
                variant="contained"
                color={
                  requestData.payment_type === "UPI" ? "primary" : "inherit"
                }
                fullWidth
                onClick={(e) =>
                  dispatch({
                    type: ADVANCE_FINANCE_CONSTANT.GET_ADVANCE_UPDATE,
                    payload: {
                      payment_type: "UPI",
                      cheque_no: null,
                      utr_no: null,
                      bank_name: null,
                      account_name: null,
                      account_no: null,
                    },
                  })
                }
              >
                UPI
              </Button>
            </Grid>
            <Grid item size={{ sm: 2 }}>
              <Button
                variant="contained"
                fullWidth
                color={
                  requestData.payment_type === "Cheque" ? "primary" : "inherit"
                }
                onClick={(e) =>
                  dispatch({
                    type: ADVANCE_FINANCE_CONSTANT.GET_ADVANCE_UPDATE,
                    payload: {
                      payment_type: "Cheque",
                      utr_no: null,
                      transaction_id: null,
                    },
                  })
                }
              >
                Cheque
              </Button>
            </Grid>
            <Grid item size={{ sm: 2 }}>
              <Button
                variant="contained"
                fullWidth
                color={
                  requestData.payment_type === "NEFT" ? "primary" : "inherit"
                }
                onClick={(e) =>
                  dispatch({
                    type: ADVANCE_FINANCE_CONSTANT.GET_ADVANCE_UPDATE,
                    payload: {
                      payment_type: "NEFT",
                      cheque_no: null,
                      transaction_id: null,
                    },
                  })
                }
              >
                NEFT
              </Button>
            </Grid>
            <Grid item size={{ sm: 2 }}>
              <Button
                variant="contained"
                color={
                  requestData.payment_type === "RTGS" ? "primary" : "inherit"
                }
                fullWidth
                onClick={(e) =>
                  dispatch({
                    type: ADVANCE_FINANCE_CONSTANT.GET_ADVANCE_UPDATE,
                    payload: {
                      payment_type: "RTGS",
                      cheque_no: null,
                      transaction_id: null,
                    },
                  })
                }
              >
                RTGS
              </Button>
            </Grid>
          </Grid>
          {requestData.payment_type !== "Cash" &&
            requestData.payment_type !== "Finance_Account" && (
              <Typography
                variant="caption"
                sx={{
                  color: "gray",
                }}
              >
                3. Add Payment Deatils
              </Typography>
            )}
          <Grid container spacing={2} sx={{ pl: 3 }}>
            {requestData.payment_type === "Cheque" ? (
              <Grid item size={{ xs: 6, sm: 6, md: 3 }}>
                <Typography
                  variant="subtitle2"
                  sx={{
                    fontSize: "12px",
                    color: "rgb(23,43,77)",
                    marginBottom: "4px",
                  }}
                >
                  Cheque No <span style={{ color: "red" }}>*</span>
                </Typography>
                <TextField
                  variant="outlined"
                  color="primary"
                  type="text"
                  value={requestData.cheque_no}
                  name="cheque_no"
                  onChange={handleChange}
                  fullWidth
                  sx={{
                    height: "32px",
                  }}
                  size="small"
                  InputLabelProps={{ style: label }}
                />
              </Grid>
            ) : requestData.payment_type === "NEFT" ||
              requestData.payment_type === "RTGS" ? (
              <Grid item size={{ xs: 6, sm: 6, md: 3 }}>
                <Typography
                  variant="subtitle2"
                  sx={{
                    fontSize: "12px",
                    color: "rgb(23,43,77)",
                    marginBottom: "4px",
                  }}
                >
                  Utr no <span style={{ color: "red" }}>*</span>
                </Typography>
                <TextField
                  variant="outlined"
                  color="primary"
                  type="text"
                  value={requestData.utr_no}
                  name="utr_no"
                  onChange={handleChange}
                  fullWidth
                  sx={{
                    height: "32px",
                  }}
                  size="small"
                  InputLabelProps={{ style: label }}
                />
              </Grid>
            ) : requestData.payment_type === "UPI" ? (
              <Grid item size={{ xs: 6, sm: 6, md: 3 }}>
                <Typography
                  variant="subtitle2"
                  sx={{
                    fontSize: "12px",
                    color: "rgb(23,43,77)",
                    marginBottom: "4px",
                  }}
                >
                  Transaction No <span style={{ color: "red" }}>*</span>
                </Typography>
                <TextField
                  variant="outlined"
                  color="primary"
                  type="text"
                  value={requestData.transaction_id}
                  name="transaction_id"
                  onChange={handleChange}
                  fullWidth
                  sx={{
                    height: "32px",
                  }}
                  size="small"
                  InputLabelProps={{ style: label }}
                />
              </Grid>
            ) : null}
            {(requestData.payment_type === "Cheque" ||
              requestData.payment_type === "NEFT" ||
              requestData.payment_type === "RTGS") && (
                <Grid item size={{ xs: 6, sm: 6, md: 3 }}>
                  <Typography
                    variant="subtitle2"
                    sx={{
                      fontSize: "12px",
                      color: "rgb(23,43,77)",
                      marginBottom: "4px",
                    }}
                  >
                    Account No <span style={{ color: "red" }}>*</span>
                  </Typography>
                  <TextField
                    variant="outlined"
                    color="primary"
                    type="text"
                    value={requestData.account_no}
                    name="account_no"
                    onChange={handleChange}
                    fullWidth
                    sx={{
                      height: "32px",
                    }}
                    size="small"
                    InputLabelProps={{ style: label }}
                  />
                </Grid>
              )}
            {(requestData.payment_type === "Cheque" ||
              requestData.payment_type === "NEFT" ||
              requestData.payment_type === "RTGS") && (
                <Grid item size={{ xs: 6, sm: 6, md: 3 }}>
                  <Typography
                    variant="subtitle2"
                    sx={{
                      fontSize: "12px",
                      color: "rgb(23,43,77)",
                      marginBottom: "4px",
                    }}
                  >
                    Bank Name <span style={{ color: "red" }}>*</span>
                  </Typography>
                  <TextField
                    variant="outlined"
                    color="primary"
                    type="text"
                    fullWidth
                    value={requestData.bank_name}
                    name="bank_name"
                    onChange={handleChange}
                    sx={{
                      height: "32px",
                    }}
                    size="small"
                    InputLabelProps={{ style: label }}
                  />
                </Grid>
              )}
            {(requestData.payment_type === "Cheque" ||
              requestData.payment_type === "NEFT" ||
              requestData.payment_type === "RTGS") && (
                <Grid item size={{ xs: 6, sm: 6, md: 3 }}>
                  <Typography
                    variant="subtitle2"
                    sx={{
                      fontSize: "12px",
                      color: "rgb(23,43,77)",
                      marginBottom: "4px",
                    }}
                  >
                    Account Name <span style={{ color: "red" }}>*</span>
                  </Typography>
                  <TextField
                    variant="outlined"
                    color="primary"
                    type="text"
                    fullWidth
                    value={requestData.account_name}
                    name="account_name"
                    onChange={handleChange}
                    sx={{
                      height: "32px",
                    }}
                    size="small"
                    InputLabelProps={{ style: label }}
                  />
                </Grid>
              )}
          </Grid>
          {requestData.payment_type === "Finance_Account" &&
            requestData.client !== "" && (
              <Alert>{`Your Balance Amount For ${requestData.client} is ${clientAmount} `}</Alert>
            )}
          <Typography
            variant="caption"
            sx={{
              color: "gray",
            }}
          >
            {requestData.payment_type === "Cash" ||
              requestData.payment_type === "Finance_Account"
              ? "3"
              : "4"}
            . Select Amount, Quantity & TDS
          </Typography>
          <Grid container spacing={2} sx={{ pl: 3 }}>
            <Grid item size={{ xs: 2 }}>
              <Typography
                variant="subtitle2"
                sx={{
                  fontSize: "12px",
                  color: "rgb(23,43,77)",
                  marginBottom: "4px",
                }}
              >
                Size 20 Quantity <span style={{ color: "red" }}>*</span>
              </Typography>
              <TextField
                variant="outlined"
                color="primary"
                type="number"
                fullWidth
                value={requestData.size_20_quantity}
                name="size_20_quantity"
                onBlur={(e) => {
                  dispatch(getLOLOFinanceSizeRateAction(notify));
                }}
                onChange={(e) => {
                  let updated_size_20_quantity = Number(e.target.value);
                  if (updated_size_20_quantity === "") {
                    updated_size_20_quantity = 0;
                  }

                  handleChange({
                    target: {
                      name: e.target.name,
                      value: updated_size_20_quantity,
                    },
                  });
                }}
                sx={{
                  height: "32px",
                }}
                size="small"
                slotProps={{
                  htmlInput: {
                    min: 0,
                    onKeyDown: (e) => {
                      if (["-", "+", "e", "E"].includes(e.key)) {
                        e.preventDefault();
                      }
                    },
                    // Disable copy
                    onCopy: (e) => e.preventDefault(),

                    // Disable paste
                    onPaste: (e) => e.preventDefault(),

                    // Disable cut
                    onCut: (e) => e.preventDefault(),

                    // Optional: disable drag/drop text
                    onDrop: (e) => e.preventDefault(),
                  },
                }}
              />
            </Grid>
            <Grid item size={{ xs: 2 }}>
              <Typography
                variant="subtitle2"
                sx={{
                  fontSize: "12px",
                  color: "rgb(23,43,77)",
                  marginBottom: "4px",
                }}
              >
                Size 40 Quantity <span style={{ color: "red" }}>*</span>
              </Typography>
              <TextField
                variant="outlined"
                color="primary"
                type="number"
                fullWidth
                value={requestData.size_40_quantity}
                onBlur={(e) => {
                  dispatch(getLOLOFinanceSizeRateAction(notify));
                }}
                name="size_40_quantity"
                onChange={(e) => {
                  let updated_size_40_quantity = Number(e.target.value);
                  if (updated_size_40_quantity === "") {
                    updated_size_40_quantity = 0;
                  }

                  handleChange({
                    target: {
                      name: e.target.name,
                      value: updated_size_40_quantity,
                    },
                  });
                }}
                sx={{
                  height: "32px",
                }}
                size="small"
                slotProps={{
                  htmlInput: {
                    min: 0,
                    onKeyDown: (e) => {
                      if (["-", "+", "e", "E"].includes(e.key)) {
                        e.preventDefault();
                      }
                    },
                    // Disable copy
                    onCopy: (e) => e.preventDefault(),

                    // Disable paste
                    onPaste: (e) => e.preventDefault(),

                    // Disable cut
                    onCut: (e) => e.preventDefault(),

                    // Optional: disable drag/drop text
                    onDrop: (e) => e.preventDefault(),
                  },
                }}
              />
            </Grid>

            <Grid item size={{ xs: 2 }}>
              <Typography
                variant="subtitle2"
                sx={{
                  fontSize: "12px",
                  color: "rgb(23,43,77)",
                  marginBottom: "4px",
                }}
              >
                TDS %
              </Typography>
              <TextField
                variant="outlined"
                color="primary"
                type="number"
                fullWidth
                size="small"
                value={requestData.tds}
                name="tds"
                onChange={handleChange}
                sx={{
                  height: "32px",
                }}
                slotProps={{
                  htmlInput: {
                    min: 0,
                    max: 100,
                  },
                }}
                InputLabelProps={{ style: label }}
              />
            </Grid>
            <Grid item size={{ xs: 3 }}>
              <Typography
                variant="subtitle2"
                sx={{
                  fontSize: "12px",
                  color: "rgb(23,43,77)",
                  marginBottom: "4px",
                }}
              >
                Amount <span style={{ color: "red" }}>*</span>
              </Typography>
              <TextField
                variant="outlined"
                color="primary"
                type="number"
                name="original_amount"
                value={requestData.original_amount}
                helperText={
                  requestData?.size_20_quantity || requestData?.size_40_quantity
                    ? requestData?.original_amount < calculateTotalAmount
                      ? `Amount cannot be less than ${calculateTotalAmount} .`
                      : `Amount cannot be less than ${calculateTotalAmount} .`
                    : " "
                }
                fullWidth
                size="small"
                disabled={
                  Number(requestData?.size_20_quantity) === 0 &&
                  Number(requestData?.size_40_quantity) === 0
                }
                slotProps={{
                  formHelperText: {
                    sx: {
                      color: "info.main", // MUI theme error color
                      fontWeight: 500, // optional
                    },
                  },
                  htmlInput: {
                    min: calculateTotalAmount,
                    max:
                      requestData.payment_type === "Finance_Account" &&
                        requestData.client !== ""
                        ? Number(clientAmount)
                        : undefined,
                    onKeyDown: (e) => {
                      if (["-", "+", "e", "E"].includes(e.key)) {
                        e.preventDefault();
                      }
                    },
                    onCopy: (e) => e.preventDefault(),
                    onPaste: (e) => e.preventDefault(),
                    onCut: (e) => e.preventDefault(),
                    onDrop: (e) => e.preventDefault(),
                  },
                  input: {
                    endAdornment: (
                      <InputAdornment position="end">
                        <Tooltip
                          arrow
                          placement="top-start"
                          enterDelay={300}
                          slotProps={{
                            tooltip: {
                              sx: {
                                bgcolor: "#1e293b",
                                color: "#fff",
                                maxWidth: 650,
                                p: 2,
                                borderRadius: 2,
                                boxShadow: 4,
                              },
                            },
                            arrow: {
                              sx: {
                                color: "#1e293b",
                              },
                            },
                          }}
                          title={
                            <Box>
                              <Typography variant="body2">
                                <strong>
                                  Formula For Calculating Size 20/40 Amount:
                                </strong>
                              </Typography>

                              <Box
                                sx={{
                                  bgcolor: "rgba(255,255,255,0.08)",
                                  p: 1,
                                  borderRadius: 1,
                                  fontFamily: "monospace",
                                  my: 1,
                                }}
                              >
                                size totalAmtWithTax = Round (sizeRate +
                                (sizeRate x GST%)) x sizeQty <br />
                                sizedTdsAmt = Round((sizeRate x tds%) x sizeQty){" "}
                                <br />
                                sizeOriginal_amt = size totalAmtWithTax -
                                sizedTdsAmt
                              </Box>
                              <Stack
                                direction={"row"}
                                alignItems={"center"}
                                justifyContent={"space-between"}
                              >
                                <Box>
                                  <Typography variant="body2">
                                    <strong>Size 20 Rate:</strong>
                                  </Typography>

                                  <Typography variant="body2">
                                    Rate:{" "}
                                    {
                                      lolo_finance_size_rate_data
                                        ?.site_lolo_rates?.size_20
                                    }
                                  </Typography>
                                  <Typography variant="body2">
                                    Quantity: {requestData.size_20_quantity}
                                  </Typography>
                                  <Typography variant="body2">
                                    GST:{" "}
                                    {(clientDetails?.with_gst === false ||
                                      (requestData?.pk &&
                                        requestData?.with_gst === false)) &&
                                      requestData?.payment_type ===
                                      "Finance_Account"
                                      ? "0%"
                                      : "18%"}
                                  </Typography>
                                  <Typography variant="body2">
                                    TDS: {requestData?.tds}%
                                  </Typography>
                                  <Typography variant="body1" color="success">
                                    Total = {calculateSize20Amount}
                                  </Typography>
                                </Box>
                                <Stack
                                  direction={"column"}
                                  alignItems={"flex-end"}
                                  justifyContent={"flex-end"}
                                >
                                  <Typography variant="body2">
                                    <strong>Size 40 Rate:</strong>
                                  </Typography>

                                  <Typography variant="body2">
                                    Rate:{" "}
                                    {
                                      lolo_finance_size_rate_data
                                        ?.site_lolo_rates?.size_40
                                    }
                                  </Typography>
                                  <Typography variant="body2">
                                    Quantity: {requestData.size_40_quantity}
                                  </Typography>
                                  <Typography variant="body2">
                                    GST:{" "}
                                    {(clientDetails?.with_gst === false ||
                                      (requestData?.pk &&
                                        requestData?.with_gst === false)) &&
                                      requestData?.payment_type ===
                                      "Finance_Account"
                                      ? "0%"
                                      : "18%"}
                                  </Typography>
                                  <Typography variant="body2">
                                    TDS: {requestData?.tds}%
                                  </Typography>
                                  <Typography variant="body1" color="success">
                                    Total = {calculateSize40Amount}
                                  </Typography>
                                </Stack>
                              </Stack>

                              <Divider
                                sx={{ bgcolor: "rgba(255,255,255,0.2)", my: 1 }}
                              />

                              <Typography
                                variant="body2"
                                fontWeight={700}
                                color="#4ade80"
                              >
                                Total Amount = {calculateSize20Amount} +{" "}
                                {calculateSize40Amount} ={" "}
                                {calculateSize20Amount + calculateSize40Amount}
                              </Typography>
                              <Typography variant="caption">
                                {Number(requestData?.size_20_quantity) > 1 ||
                                  Number(requestData?.size_40_quantity) > 1
                                  ? "+1 is added as a buffer to prevent rounding differences and ensure the calculated amount is sufficient."
                                  : ""}
                              </Typography>
                              <Typography
                                variant="body2"
                                fontWeight={700}
                                color="#4ade80"
                              >
                                {Number(requestData?.size_20_quantity) > 1 ||
                                  Number(requestData?.size_40_quantity) > 1
                                  ? `Total Amount =  ${calculateSize20Amount + calculateSize40Amount} + 1 = ${calculateTotalAmount}`
                                  : ""}
                              </Typography>
                            </Box>
                          }
                        >
                          <IconButton
                            size="small"
                            edge="end"
                            tabIndex={-1}
                            sx={{ p: 0.5 }}
                          >
                            <InfoOutlinedIcon
                              fontSize="small"
                              color="primary"
                            />
                          </IconButton>
                        </Tooltip>
                      </InputAdornment>
                    ),
                  },
                }}
                onChange={handleChange}
              />
            </Grid>
            <Grid item size={{ xs: 3 }}>
               <Typography
                variant="subtitle2"
                sx={{
                  fontSize: "12px",
                  color: "rgb(23,43,77)",
                  marginBottom: "4px",
                }}
              >
                Remarks
              </Typography>
              <TextField
                variant="outlined"
                color="primary"
                type="text"
                multiline
                fullWidth
                value={requestData.remarks}
                name="remarks"
                minRows={1}
                onChange={handleChange}
                size="small"
              />
            </Grid>
          </Grid>
        </Stack>
        <Stack
          sx={{ mt: 4 }}
          direction="row"
          justifyContent="flex-end"
          spacing={2}
        >
          <Button
            variant="outlined"
            startIcon={<CloseRoundedIcon />}
            onClick={handleCloseUpdate}
            sx={{
              width: 160,
              height: 46,
              borderRadius: "12px",
              textTransform: "none",
              fontSize: "15px",
              fontWeight: 700,
              color: "#667eea",
              background: "#fff",
              transition: "all 0.3s ease",
              "&:hover": {
                transform: "translateY(-2px)",
              },
            }}
          >
            Close
          </Button>

          {requestData?.is_locked === true ? (
            <Button
              startIcon={<EditNoteIcon />}
              onClick={() =>
                dispatch(
                  updateAdvanceFinanceRemarksAction(
                    requestData.pk,
                    requestData.remarks,
                    notify,
                  ),
                )
              }
              sx={{
                height: 46,
                borderRadius: "12px",
                textTransform: "none",
                fontSize: "15px",
                fontWeight: 700,
                px: 4,
                letterSpacing: "0.4px",
                color: "#fff",

                background: "linear-gradient(135deg, #43a047 0%, #2e7d32 100%)",

                boxShadow: "0 8px 20px rgba(46, 125, 50, 0.35)",
                transition: "all 0.3s ease",

                "&:hover": {
                  background:
                    "linear-gradient(135deg, #388e3c 0%, #1b5e20 100%)",
                  transform: "translateY(-2px)",
                  boxShadow: "0 12px 24px rgba(46, 125, 50, 0.45)",
                },

                "&:active": {
                  transform: "scale(0.98)",
                },
              }}
            >
              Update Remarks
            </Button>
          ) : (
            <Button
              variant="contained"
              onClick={
                requestData.pk
                  ? handleFinancePaymentUpdate
                  : handleFinancePayment
              }
              sx={{
                height: 46,

                borderRadius: "12px",
                textTransform: "none",
                fontSize: "15px",
                fontWeight: 700,
                letterSpacing: "0.4px",
                color: "#fff",
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                boxShadow: "0 8px 20px rgba(102, 126, 234, 0.35)",
                transition: "all 0.3s ease",
                "&:hover": {
                  background:
                    "linear-gradient(135deg, #5a6fe8 0%, #6a3ea1 100%)",
                  transform: "translateY(-2px)",
                  boxShadow: "0 12px 24px rgba(102, 126, 234, 0.45)",
                },
                "&:active": {
                  transform: "scale(0.98)",
                },
              }}
            >
              {requestData.pk
                ? "Update LOLO Payment Request"
                : "Create LOLO Payment Request"}
            </Button>
          )}
        </Stack>
      </Box>
    </Modal>
  );
};

export default LOLOFinanceUpdateModal;
