import React from "react";
import { Formik } from "formik";
import * as Yup from "yup";
import TableViewIcon from "@mui/icons-material/TableView";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

import dayjs from "dayjs";
import CloseIcon from "@mui/icons-material/Close";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  Typography,
} from "@mui/material";
import { downloadLOLOFinanceReportExcelFile } from "@/actions/AdvanceFinance/AdvanceFinanceAction";
import { useDispatch } from "react-redux";
import { useSnackbar } from "notistack";

const loloFinancereportValidationSchema = Yup.object({
  from_date: Yup.date().required("From date is required"),

  to_date: Yup.date()
    .required("To date is required")
    .min(Yup.ref("from_date"), "To date cannot be before From date"),
});

const LoloFinancereportDownloadModal = ({
  openLoloFinanceReportModal,
  handleCloseLoloFinanceReportModal,
}) => {
  const dispatch = useDispatch();
  const notify = useSnackbar().enqueueSnackbar;
  return (
    <Dialog
      open={openLoloFinanceReportModal}
      onClose={handleCloseLoloFinanceReportModal}
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
        Download LOLO Finance Report
        <IconButton onClick={handleCloseLoloFinanceReportModal}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <Formik
        initialValues={{
          from_date: null,
          to_date: null,
        }}
        validationSchema={loloFinancereportValidationSchema}
        onSubmit={(values, { setSubmitting }) => {
          dispatch(
            downloadLOLOFinanceReportExcelFile(
              {
                from_date: values.from_date
                  ? dayjs(values.from_date).format("YYYY-MM-DD")
                  : null,

                to_date: values.to_date
                  ? dayjs(values.to_date).format("YYYY-MM-DD")
                  : null,
              },
              notify,
            ),
          );
          setSubmitting(false);
          handleCloseLoloFinanceReportModal();
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
                <Typography variant="body2" color="textDisabled" sx={{ mb: 3 }}>
                  Select the date range for the Lolo Finance report.
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
                      format="DD-MM-YYYY"
                      value={values.from_date}
                      onChange={(value) => {
                        setFieldValue("from_date", value);
                      }}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          placeholder: "DD-MM-YYYY",
                          size: "small",
                          error: touched.from_date && Boolean(errors.from_date),
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
                      format="DD-MM-YYYY"
                      value={values.to_date}
                      minDate={values.from_date || undefined}
                      onChange={(value) => {
                        setFieldValue("to_date", value);
                      }}
                      slotProps={{
                        textField: {
                          size: "small",
                          fullWidth: true,
                          placeholder: "DD-MM-YYYY",
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
                  onClick={handleCloseLoloFinanceReportModal}
                  variant="outlined"
                  color="inherit"
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>

                <Button
                  type="submit"
                  variant="contained"
                  color="success"
                  startIcon={<TableViewIcon />}
                  disabled={isSubmitting}
                  sx={{
                    textTransform: "none",
                    fontWeight: 600,
                    borderRadius: 2,
                    px: 2.5,
                  }}
                >
                  Download Report
                </Button>
              </DialogActions>
            </form>
          </LocalizationProvider>
        )}
      </Formik>
    </Dialog>
  );
};

export default LoloFinancereportDownloadModal;
