import {
  addHandlingPaymentAction,
  addSTPaymentAction,
  deleteHandlingPayment,
  deleteStPayment,
  updateHandlingPaymentAction,
  updateSTPaymentAction,
} from "@/actions/HandlingAndSTPaymentAction";
import { customLabelTypography } from "@/utils/CustomClasses";
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Grid,
  Modal,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { Formik } from "formik";
import { useSnackbar } from "notistack";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import * as Yup from "yup";
const PaymentLoloComponent = ({
  openPaymentModal,
  handleModalClose,
  ...props
}) => {
  const notify = useSnackbar().enqueueSnackbar;
  const { handling_payment_get, st_payment_get } = useSelector(
    (state) => state.HandlingAndSTPaymentReducer
  );
  const [paymentType, setPaymentType] = useState(
    props.paymentType ? props.paymentType : "Cheque"
  );
  const dispatch = useDispatch();
  const [paymentData, setPaymentData] = useState({
    date: "",
    bank_name: "",
    account_name: "",
    account_no: "",
    cheque_no: "",
    utr_no: "",
    quantity: "",
    amount: "",
    original_amount: "",
  });

  useEffect(() => {
    if (handling_payment_get.pk !== "") {
      setPaymentData((prev) => ({ ...prev, ...handling_payment_get }));
      setPaymentType(handling_payment_get?.payment_type || "Cheque");
    } else if (st_payment_get.pk !== "") {
      setPaymentData((prev) => ({ ...prev, ...st_payment_get }));
      setPaymentType(st_payment_get?.payment_type || "Cheque");
    } else {
      setPaymentData({
        date: "",
        bank_name: "",
        account_name: "",
        account_no: "",
        cheque_no: "",
        utr_no: "",
        quantity: "",
        amount: "",
      });
    }
  }, [handling_payment_get.pk, st_payment_get.pk]);

  function getModalStyle() {
    const top = 50;
    const left = 50;

    return {
      top: `${top}%`,
      left: `${left}%`,
      transform: `translate(-${top}%, -${left}%)`,
    };
  }

  return (
    <Modal open={openPaymentModal} onClose={handleModalClose}>
      <Box
        style={getModalStyle()}
        sx={(theme) => ({
          position: "absolute",
          width: "70%",
          backgroundColor: "white",
          boxShadow: 5,
          paddingY: 2,
          paddingX: 4,
          outline: "none",
          borderRadius: 2,
          [theme.breakpoints.down("sm")]: {
            width: "90%",
            padding: 2,
          },
        })}
      >
        <Card elevation={0}>
          <CardHeader
            title={
              <Stack
                direction={"row"}
                alignItems={"center"}
                justifyContent={"center"}
                flexDirection={"row"}
                spacing={2}
              >
                <Button
                  variant={paymentType === "Cheque" ? "contained" : "text"}
                  color={paymentType === "Cheque" ? "primary" : "default"}
                  onClick={() => setPaymentType("Cheque")}
                  disabled={paymentData?.pk && paymentType !== "Cheque"}
                >
                  Cheque
                </Button>
                <Button
                  variant={paymentType === "NEFT" ? "contained" : "text"}
                  color={paymentType === "NEFT" ? "primary" : "default"}
                  onClick={() => setPaymentType("NEFT")}
                  disabled={paymentData?.pk && paymentType !== "NEFT"}
                >
                  NEFT
                </Button>
                <Button
                  variant={paymentType === "RTGS" ? "contained" : "text"}
                  color={paymentType === "RTGS" ? "primary" : "default"}
                  onClick={() => setPaymentType("RTGS")}
                  disabled={paymentData?.pk && paymentType !== "RTGS"}
                >
                  RTGS
                </Button>
              </Stack>
            }
          />
          <Divider sx={{ width: "98%", margin: "auto", mb: 1 }} />
          <CardContent>
            <Formik
              initialValues={paymentData}
              enableReinitialize={true}
              validationSchema={Yup.object().shape({
                date: Yup.string().required("Date is Required"),
                bank_name: Yup.string().required("Bank name is Required"),
                account_name: Yup.string().required("Account Name is Required"),
                account_no: Yup.string().required("Account No is Required"),
                cheque_no:
                  paymentType === "Cheque"
                    ? Yup.string().required("Cheque No is Required")
                    : Yup.string().nullable(),
                utr_no:
                  paymentType === "NEFT" || paymentType === "RTGS"
                    ? Yup.string().nullable().required("UTR No is Required")
                    : Yup.string().nullable(),
                quantity: Yup.string().required("Quantity is Required"),
                amount: paymentData?.pk
                  ? Yup.string().nullable()
                  : Yup.string().required("Amount is Required"),
              })}
              onSubmit={async (values) => {
                if (paymentType === "Cheque") {
                  values.utr_no = "";
                  values.payment_type = "Cheque";
                } else {
                  values.cheque_no = "";
                  if (paymentType === "NEFT") {
                    values.payment_type = "NEFT";
                  } else {
                    values.payment_type = "RTGS";
                  }
                }
                if (paymentData?.pk) {
                  values.container = undefined;
                  values.remaining = undefined;
                  values.amount = undefined;
                  if (props.self_transportation) {
                    dispatch(
                      updateSTPaymentAction(
                        paymentData?.pk,
                        values,
                        handleModalClose,
                        notify
                      )
                    );
                  } else {
                    dispatch(
                      updateHandlingPaymentAction(
                        paymentData?.pk,
                        values,
                        handleModalClose,
                        notify
                      )
                    );
                  }
                } else {
                  values.original_amount = values.amount;
                  if (props.self_transportation) {
                    dispatch(
                      addSTPaymentAction(values, handleModalClose, notify)
                    );
                  } else {
                    dispatch(
                      addHandlingPaymentAction(values, handleModalClose, notify)
                    );
                  }
                }
              }}
            >
              {({
                errors,
                handleSubmit,
                isSubmitting,
                touched,
                values,
                handleBlur,
                handleChange,
                setFieldValue,
              }) => (
                <form onSubmit={handleSubmit}>
                  <Typography variant="subtitle2" sx={{ mb: 2 }}>
                    <span style={{ fontWeight: "bold" }}>Step 1</span> : Add{" "}
                    {`${paymentType === "Cheque" ? "Cheque" : "UTR"} `}
                    No & Date
                  </Typography>
                  <Grid container spacing={2} sx={{ marginLeft: 6 }}>
                    {(paymentType === "NEFT" || paymentType === "RTGS") && (
                      <Grid item size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                        <Typography
                          variant="subtitle2"
                          sx={customLabelTypography}
                        >
                          Utr No<span style={{ color: "red" }}>*</span>
                        </Typography>
                        <TextField
                          error={Boolean(touched.utr_no && errors.utr_no)}
                          helperText={touched.utr_no && errors.utr_no}
                          margin="none"
                          autoComplete="off"
                          name="utr_no"
                          fullWidth
                          onChange={handleChange}
                          onBlur={handleBlur}
                          type="text"
                          size="small"
                          value={values.utr_no}
                          variant="outlined"
                        />
                      </Grid>
                    )}
                    {paymentType === "Cheque" && (
                      <Grid item size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                        <Typography
                          variant="subtitle2"
                          sx={customLabelTypography}
                        >
                          Cheque No<span style={{ color: "red" }}>*</span>
                        </Typography>
                        <TextField
                          error={Boolean(touched.cheque_no && errors.cheque_no)}
                          helperText={touched.cheque_no && errors.cheque_no}
                          margin="none"
                          autoComplete="off"
                          name="cheque_no"
                          fullWidth
                          onChange={handleChange}
                          onBlur={handleBlur}
                          type="text"
                          size="small"
                          value={values.cheque_no}
                          variant="outlined"
                        />
                      </Grid>
                    )}
                    <Grid item size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                      <Typography
                        variant="subtitle2"
                        sx={customLabelTypography}
                      >
                        Date<span style={{ color: "red" }}>*</span>
                      </Typography>
                      <TextField
                        error={Boolean(touched.date && errors.date)}
                        helperText={touched.date && errors.date}
                        margin="none"
                        autoComplete="off"
                        name="date"
                        fullWidth
                        onChange={handleChange}
                        onBlur={handleBlur}
                        type="date"
                        size="small"
                        value={values.date}
                        variant="outlined"
                      />
                    </Grid>
                  </Grid>

                  <Typography variant="subtitle2" sx={{ mb: 2, mt: 4 }}>
                    <span style={{ fontWeight: "bold" }}>Step 2</span> : Add
                    Bank Name ,Account Name & Account No
                  </Typography>
                  <Grid container spacing={2} sx={{ marginLeft: 6 }}>
                    <Grid item size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                      <Typography
                        variant="subtitle2"
                        sx={customLabelTypography}
                      >
                        Bank Name<span style={{ color: "red" }}>*</span>
                      </Typography>
                      <TextField
                        error={Boolean(touched.bank_name && errors.bank_name)}
                        helperText={touched.bank_name && errors.bank_name}
                        margin="none"
                        autoComplete="off"
                        name="bank_name"
                        fullWidth
                        onChange={handleChange}
                        onBlur={handleBlur}
                        type="text"
                        size="small"
                        value={values.bank_name}
                        variant="outlined"
                      />
                    </Grid>
                    <Grid item size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                      <Typography
                        variant="subtitle2"
                        sx={customLabelTypography}
                      >
                        Account Name<span style={{ color: "red" }}>*</span>
                      </Typography>
                      <TextField
                        error={Boolean(
                          touched.account_name && errors.account_name
                        )}
                        helperText={touched.account_name && errors.account_name}
                        margin="none"
                        autoComplete="off"
                        name="account_name"
                        fullWidth
                        onChange={handleChange}
                        onBlur={handleBlur}
                        type="text"
                        size="small"
                        value={values.account_name}
                        variant="outlined"
                      />
                    </Grid>
                    <Grid item size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                      <Typography
                        variant="subtitle2"
                        sx={customLabelTypography}
                      >
                        Account No<span style={{ color: "red" }}>*</span>
                      </Typography>
                      <TextField
                        error={Boolean(touched.account_no && errors.account_no)}
                        helperText={touched.account_no && errors.account_no}
                        margin="none"
                        autoComplete="off"
                        name="account_no"
                        fullWidth
                        onChange={handleChange}
                        onBlur={handleBlur}
                        type="text"
                        size="small"
                        value={values.account_no}
                        variant="outlined"
                      />
                    </Grid>
                  </Grid>

                  <Typography variant="subtitle2" sx={{ mb: 2, mt: 4 }}>
                    <span style={{ fontWeight: "bold" }}>Step 3</span> : Add
                    Quantity & Amount
                  </Typography>
                  <Grid container spacing={2} sx={{ marginLeft: 6 }}>
                    <Grid item size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                      <Typography
                        variant="subtitle2"
                        sx={customLabelTypography}
                      >
                        Quantity<span style={{ color: "red" }}>*</span>
                      </Typography>
                      <TextField
                        error={Boolean(touched.quantity && errors.quantity)}
                        helperText={touched.quantity && errors.quantity}
                        margin="none"
                        autoComplete="off"
                        name="quantity"
                        fullWidth
                        onChange={handleChange}
                        onBlur={handleBlur}
                        type="number"
                        size="small"
                        value={values.quantity}
                        variant="outlined"
                      />
                    </Grid>
                    {paymentData?.pk ? (
                      <Grid item size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                        <Typography
                          variant="subtitle2"
                          sx={customLabelTypography}
                        >
                          Original Amount<span style={{ color: "red" }}>*</span>
                        </Typography>
                        <TextField
                          error={Boolean(
                            touched.original_amount && errors.original_amount
                          )}
                          helperText={
                            touched.original_amount && errors.original_amount
                          }
                          margin="none"
                          autoComplete="off"
                          name="original_amount"
                          fullWidth
                          onChange={handleChange}
                          onBlur={handleBlur}
                          type="number"
                          size="small"
                          value={values.original_amount}
                          variant="outlined"
                        />
                      </Grid>
                    ) : (
                      <Grid item size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                        <Typography
                          variant="subtitle2"
                          sx={customLabelTypography}
                        >
                          Amount<span style={{ color: "red" }}>*</span>
                        </Typography>
                        <TextField
                          error={Boolean(touched.amount && errors.amount)}
                          helperText={touched.amount && errors.amount}
                          margin="none"
                          autoComplete="off"
                          name="amount"
                          fullWidth
                          onChange={handleChange}
                          onBlur={handleBlur}
                          type="number"
                          size="small"
                          value={values.amount}
                          variant="outlined"
                        />
                      </Grid>
                    )}
                  </Grid>
                  <Box style={{ textAlign: "end" }} ml={1} mt={6}>
                    {paymentData?.pk ? (
                      <Button
                        color="primary"
                        disabled={isSubmitting}
                        size="medium"
                        type="submit"
                        variant="contained"
                        style={{
                          marginRight: "10px",
                          width: 240,
                        }}
                      >
                        Update Payment
                      </Button>
                    ) : (
                      <Button
                        color="primary"
                        disabled={isSubmitting}
                        size="medium"
                        type="submit"
                        variant="contained"
                        style={{
                          marginRight: "10px",
                          width: 240,
                        }}
                      >
                        Add Payment
                      </Button>
                    )}
                    {paymentData?.pk && (
                      <Button
                        sx={{ marginRight: "10px" }}
                        color="error"
                        variant="outlined"
                        onClick={() => {
                          if (props.self_transportation) {
                            dispatch(deleteStPayment(paymentData?.pk,notify,handleModalClose))
                          } else {
                            dispatch(
                              deleteHandlingPayment(paymentData?.pk, notify,handleModalClose)
                            );
                          }
                        }}
                      >
                        Delete
                      </Button>
                    )}
                    <Button
                      color="secondary"
                      size="medium"
                      type="button"
                      variant="outlined"
                      onClick={handleModalClose}
                    >
                      Cancel
                    </Button>
                  </Box>
                </form>
              )}
            </Formik>
          </CardContent>
        </Card>
      </Box>
    </Modal>
  );
};

export default PaymentLoloComponent;
