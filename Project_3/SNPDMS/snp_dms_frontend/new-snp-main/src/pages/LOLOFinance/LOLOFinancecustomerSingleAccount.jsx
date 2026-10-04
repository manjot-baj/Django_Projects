import {
  deleteSingleAccountLOLOFinanceCustomerAccountPaymentAction,
  downloadLOLOFinanceCustomerAccountLedgePdfFile,
  getSingleLOLOFinanceCustomerAccountPaymentAction,
} from "@/actions/LOLOFinance/LOLOFinanceCustomerAction";
import LayoutContainer from "@/components/reusablecomponents/LayoutContainer";
import {
  Accordion,
  AccordionActions,
  AccordionDetails,
  AccordionSummary,
  Alert,
  alpha,
  Backdrop,
  Box,
  Button,
  Chip,
  CircularProgress,
  Grid,
  Paper,
  Stack,
  styled,
  Table,
  TableBody,
  TableCell,
  tableCellClasses,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
} from "@mui/material";
import { useSnackbar } from "notistack";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory, useParams } from "react-router-dom";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import CustomBackButton from "@/components/reusablecomponents/CustomBackButton";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { custombackDropStyle } from "@/utils/CustomClasses";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import LOLOFinanceCustomerAccountBulkUpload from "./LOLOFinanceCustomerAccountBulkUpload";
import { TableFootercontainer } from "@/components/TableComponent/TableComponent";
import CloseIcon from "@mui/icons-material/Close";

import { Formik } from "formik";
import * as Yup from "yup";

import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

import dayjs from "dayjs";

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: alpha(theme.palette.secondary.main, 0.1),
    color: theme.palette.secondary.main,
    border: "none",
    fontSize: 12,
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  "&:nth-of-type(odd)": {
    backgroundColor: theme.palette.action.hover,
  },
  // hide last border
  "&:last-child td, &:last-child th": {
    border: 0,
  },
}));

const ledgerValidationSchema = Yup.object({
  from_date: Yup.date().required("From date is required"),

  to_date: Yup.date()
    .required("To date is required")
    .min(Yup.ref("from_date"), "To date cannot be before From date"),
});

const LOLOFinancecustomerSingleAccount = () => {
  const { pk } = useParams();
  const notify = useSnackbar().enqueueSnackbar;
  const dispatch = useDispatch();
  const history = useHistory();
  const { LoloFinanceCustomerReducer } = useSelector((state) => state);
  const { isloading } = useSelector((state) => state.ui);
  const { get_single_customer_finance } = LoloFinanceCustomerReducer;
  const [ledgerModalOpen, setLedgerModalOpen] = useState(false);

  const handleGoBack = () => {
    history.goBack();
  };

  useEffect(() => {
    if (pk) {
      dispatch(getSingleLOLOFinanceCustomerAccountPaymentAction(pk, notify));
    }
  }, []);

  if (pk === "bulk-upload") {
    return <LOLOFinanceCustomerAccountBulkUpload />;
  }

  const handleOpenLedgerModal = () => {
    setLedgerModalOpen(true);
  };

  const handleCloseLedgerModal = () => {
    setLedgerModalOpen(false);
  };

  return (
    <LayoutContainer>
      <Box padding={4}>
        <Stack
          direction={"row"}
          flexDirection={"row"}
          alignItems={"center"}
          justifyContent={"flex-start"}
          spacing={4}
        >
          <Box style={{ marginBottom: "-20px" }}>
            <CustomBackButton handleGoBack={handleGoBack} />
          </Box>

          <Typography variant="h4">
            {get_single_customer_finance?.client}
          </Typography>
          <Box></Box>
        </Stack>

        <Grid container spacing={1} sx={{ mt: 4 }}>
          <Grid
            item
            size={{ xs: 12, xl: 12 }}
            sx={(theme) => ({
              [theme.breakpoints.down("xl")]: {
                marginTop: 4,
              },
            })}
          >
            <Stack
              direction={"row"}
              alignItems={"center"}
              justifyContent={"space-between"}
            >
              <Typography
                variant="subtitle1"
                sx={(theme) => ({
                  mb: 2,
                  color: alpha(theme.palette.secondary.main, 0.7),
                })}
              >
                Transactions
              </Typography>
              <Stack
                direction={"row"}
                alignItems={"center"}
                justifyContent={"flex-end"}
                spacing={2}
              >
                {" "}
                <Chip
                  label={`Balance : ${get_single_customer_finance?.balance}`}
                  color="success"
                  variant="filled"
                />
                <Chip
                  label={`Created At : ${get_single_customer_finance?.created_at}`}
                  color="default"
                  variant="outlined"
                />
                <Chip
                  label={`Updated At : ${get_single_customer_finance?.updated_at}`}
                  color="default"
                  variant="outlined"
                />
              </Stack>
            </Stack>

            <Grid
              container
              spacing={1}
              component={Paper}
              sx={(theme) => ({
                paddingX: 2.5,
                paddingY: 1,
                bgcolor: theme.palette.secondary.main,
                color: "white",
              })}
            >
              <Grid item size={{ xs: 4 }}>
                <Typography variant="subtitle2">Account</Typography>
              </Grid>
              <Grid item size={{ xs: 2 }}>
                <Typography variant="subtitle2">Amount</Typography>
              </Grid>
              <Grid item size={{ xs: 2 }}>
                <Typography variant="subtitle2">Transaction Type</Typography>
              </Grid>
              <Grid item size={{ xs: 2 }}>
                <Typography variant="subtitle2">Payment Type</Typography>
              </Grid>
              <Grid item size={{ xs: 2 }}>
                <Typography variant="subtitle2">Date</Typography>
              </Grid>
            </Grid>
            {get_single_customer_finance?.transactions &&
              get_single_customer_finance?.transactions.map((val, index) => (
                <Accordion>
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="panel3-content"
                    id="panel3-header"
                  >
                    <Grid container spacing={4} sx={{ width: "100%" }}>
                      <Grid item size={{ xs: 4 }}>
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                          {val?.account}
                        </Typography>
                      </Grid>
                      <Grid item size={{ xs: 2 }}>
                        <Typography
                          variant="body1"
                          sx={(theme) => ({
                            color: theme.palette.success.main,
                          })}
                        >
                          {val?.amount}
                        </Typography>
                      </Grid>
                      <Grid item size={{ xs: 2 }}>
                        <Typography variant="body1">
                          {val?.transaction_type}
                        </Typography>
                      </Grid>
                      <Grid item size={{ xs: 2 }}>
                        <Typography
                          variant="body1"
                          sx={(theme) => ({
                            color: alpha(theme.palette.info.main, 1),
                            fontWeight: 600,
                          })}
                        >
                          {val?.payment_type}
                        </Typography>
                      </Grid>
                      <Grid item size={{ xs: 2 }}>
                        <Typography variant="body1">{val?.date}</Typography>
                      </Grid>
                    </Grid>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Grid container spacing={1} sx={{ my: 2 }}>
                      <Grid item size={{ xs: 2 }}></Grid>
                      <Grid item size={{ xs: 10 }}>
                        <TableContainer component={Paper}>
                          <Table
                            sx={{ minWidth: 700, border: "none" }}
                            aria-label="customized table"
                          >
                            {val?.linked_payment &&
                            val?.transaction_type === "Debit" ? (
                              <TableHead>
                                <TableRow>
                                  <StyledTableCell>
                                    {val?.linked_payment.bl_no
                                      ? "Billing No."
                                      : "Booking No."}
                                  </StyledTableCell>
                                  <StyledTableCell align="right">
                                    Client
                                  </StyledTableCell>
                                  <StyledTableCell align="right">
                                    Entry type
                                  </StyledTableCell>
                                  <StyledTableCell align="right">
                                    Quantity
                                  </StyledTableCell>
                                  <StyledTableCell align="right">
                                    TDS
                                  </StyledTableCell>
                                  <StyledTableCell align="right">
                                    Original amount
                                  </StyledTableCell>
                                  <StyledTableCell align="right">
                                    Date
                                  </StyledTableCell>
                                  <StyledTableCell align="right">
                                    Created At
                                  </StyledTableCell>
                                </TableRow>
                              </TableHead>
                            ) : (
                              <TableHead>
                                <TableRow>
                                  <StyledTableCell>
                                    {val?.utr_no ? "Utr No." : "Cheque No."}
                                  </StyledTableCell>
                                  <StyledTableCell align="right">
                                    Bank Name
                                  </StyledTableCell>
                                  <StyledTableCell align="right">
                                    Account Name
                                  </StyledTableCell>
                                  <StyledTableCell align="right">
                                    Account No
                                  </StyledTableCell>
                                  <StyledTableCell align="right">
                                    Created At
                                  </StyledTableCell>
                                  <StyledTableCell align="right">
                                    Updated At
                                  </StyledTableCell>
                                </TableRow>
                              </TableHead>
                            )}
                            <TableBody>
                              {val?.linked_payment &&
                              val?.transaction_type === "Debit" ? (
                                <StyledTableRow key={val.linked_payment.pk}>
                                  <StyledTableCell component="th" scope="row">
                                    {val?.linked_payment.bl_no
                                      ? val?.linked_payment.bl_no
                                      : val?.linked_payment.bk_no}
                                  </StyledTableCell>

                                  <StyledTableCell align="right">
                                    {val.linked_payment.client}
                                  </StyledTableCell>
                                  <StyledTableCell align="right">
                                    {val.linked_payment.entry_type}
                                  </StyledTableCell>
                                  <StyledTableCell align="right">
                                    {val.linked_payment.quantity}
                                  </StyledTableCell>
                                  <StyledTableCell align="right">
                                    {val.linked_payment.tds}
                                  </StyledTableCell>
                                  <StyledTableCell align="right">
                                    {val.linked_payment.original_amount}
                                  </StyledTableCell>
                                  <StyledTableCell align="right">
                                    {val.linked_payment.date}
                                  </StyledTableCell>
                                  <StyledTableCell align="right">
                                    {val.linked_payment.created_at}
                                  </StyledTableCell>
                                </StyledTableRow>
                              ) : (
                                <StyledTableRow key={val.cheque_no}>
                                  <StyledTableCell component="th" scope="row">
                                    {val.utr_no ? val.utr_no : val.cheque_no}
                                  </StyledTableCell>
                                  <StyledTableCell align="right">
                                    {val.bank_name}
                                  </StyledTableCell>
                                  <StyledTableCell align="right">
                                    {val.account_name}
                                  </StyledTableCell>
                                  <StyledTableCell align="right">
                                    {val.account_no}
                                  </StyledTableCell>
                                  <StyledTableCell align="right">
                                    {val.created_at}
                                  </StyledTableCell>

                                  <StyledTableCell align="right">
                                    {val.updated_at}
                                  </StyledTableCell>
                                </StyledTableRow>
                              )}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      </Grid>
                    </Grid>
                  </AccordionDetails>
                  <AccordionActions>
                    <Alert
                      sx={{ padding: 0, paddingX: 2 }}
                      severity={val.is_balance_adjust ? "success" : "error"}
                      icon={false}
                    >
                      {val.is_balance_adjust
                        ? "Balance is Adjusted "
                        : "Balance is not Adjusted "}
                    </Alert>
                    {val.transaction_type === "Credit" && (
                      <Button
                        onClick={() =>
                          dispatch(
                            deleteSingleAccountLOLOFinanceCustomerAccountPaymentAction(
                              val?.pk,
                              pk,
                              notify,
                            ),
                          )
                        }
                        startIcon={<DeleteOutlineOutlinedIcon />}
                        variant="text"
                        color="error"
                      >
                        Delete Transaction{" "}
                      </Button>
                    )}
                  </AccordionActions>
                </Accordion>
              ))}
          </Grid>
        </Grid>
      </Box>
      <TableFootercontainer>
        <Button
          variant="outlined"
          startIcon={<PictureAsPdfIcon />}
          onClick={handleOpenLedgerModal}
          sx={{
            textTransform: "none",
            fontWeight: 600,
            borderRadius: 2,
            px: 2,
            py: 0.9,
            color: "error.main",
            borderColor: "error.light",
            backgroundColor: "rgba(211, 47, 47, 0.04)",
            "&:hover": {
              backgroundColor: "rgba(211, 47, 47, 0.08)",
              borderColor: "error.main",
            },
          }}
        >
          Download Ledger Report
        </Button>
      </TableFootercontainer>
      <Dialog
        open={ledgerModalOpen}
        onClose={handleCloseLedgerModal}
        fullWidth
        maxWidth="sm"
        slotProps={{
          paper: {
            sx: {
              transform: "translateY(-80px)",
            },
          },
        }}
      >
        <DialogTitle
          sx={{
            fontWeight: 700,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          Download Ledger Report
          <IconButton onClick={handleCloseLedgerModal}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <Formik
          initialValues={{
            from_date: null,
            to_date: null,
          }}
          validationSchema={ledgerValidationSchema}
          onSubmit={(values, { setSubmitting }) => {
            dispatch(
              downloadLOLOFinanceCustomerAccountLedgePdfFile(
                {
                  from_date: values.from_date?dayjs(values.from_date).format("YYYY-MM-DD"):null,
                  to_date: values.to_date?dayjs(values.to_date).format("YYYY-MM-DD"):null  ,
                  client: get_single_customer_finance?.client,
                },
                notify,
              ),
            );
            setSubmitting(false);
            setLedgerModalOpen(false);
          }}
        >
          {({
            values,
            errors,
            touched,
            setFieldValue,
            handleSubmit,
            isSubmitting,
          }) => (
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <form onSubmit={handleSubmit}>
                <DialogContent>
                  <Typography
                    variant="body2"
                    color="textDisabled"
                    sx={{ mb: 3 }}
                  >
                    Select the date range for the ledger report.
                  </Typography>

                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Typography
                        variant="body2"
                        fontWeight={600}
                        sx={{ mb: 0.8 }}
                      >
                        From Date
                      </Typography>

                      <DatePicker
                        format="DD/MM/YYYY"
                        value={values.from_date}
                        onChange={(value) => {
                          setFieldValue("from_date", value);
                        }}
                        slotProps={{
                          textField: {
                            fullWidth: true,
                            placeholder: "DD/MM/YYYY",
                            size: "small",
                            error:
                              touched.from_date && Boolean(errors.from_date),
                            helperText: touched.from_date && errors.from_date,
                          },
                        }}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <Typography
                        variant="body2"
                        fontWeight={600}
                        sx={{ mb: 0.8 }}
                      >
                        To Date
                      </Typography>

                      <DatePicker
                        format="DD/MM/YYYY"
                        value={values.to_date}
                        minDate={values.from_date || undefined}
                        onChange={(value) => {
                          setFieldValue("to_date", value);
                        }}
                        slotProps={{
                          textField: {
                            size: "small",
                            fullWidth: true,
                            placeholder: "DD/MM/YYYY",
                            error: touched.to_date && Boolean(errors.to_date),
                            helperText: touched.to_date && errors.to_date,
                          },
                        }}
                      />
                    </Grid>
                  </Grid>
                </DialogContent>

                <DialogActions sx={{ px: 3, pb: 3, pt: 4 }}>
                  <Button
                    onClick={handleCloseLedgerModal}
                    variant="outlined"
                    color="inherit"
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>

                  <Button
                    type="submit"
                    variant="contained"
                    color="error"
                    startIcon={<PictureAsPdfIcon />}
                    disabled={isSubmitting}
                    sx={{
                      textTransform: "none",
                      fontWeight: 600,
                      borderRadius: 2,
                      px: 2.5,
                    }}
                  >
                    Download PDF
                  </Button>
                </DialogActions>
              </form>
            </LocalizationProvider>
          )}
        </Formik>
      </Dialog>
      <Backdrop sx={custombackDropStyle} open={isloading}>
        <CircularProgress color="inherit" />
      </Backdrop>
    </LayoutContainer>
  );
};

export default LOLOFinancecustomerSingleAccount;
