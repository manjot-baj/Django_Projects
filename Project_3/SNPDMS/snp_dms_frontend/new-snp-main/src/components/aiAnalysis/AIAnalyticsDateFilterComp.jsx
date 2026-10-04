import { useSnackbar } from "notistack";
import React, { useState } from "react";
import { useDispatch } from "react-redux";
import * as Yup from "yup";
import { Formik } from "formik";
import { TableAdvanceSearchWithModal } from "../TableComponent/TableComponent";
import { AI_ANALYTICS_CONST } from "@/reducers/AIAnalyticsReducer";
import { getAiAnalyticsListingAction } from "@/actions/AIAnalyticsAction";
import { Button, Grid, TextField, Typography } from "@mui/material";
import { customLabelTypography } from "@/utils/CustomClasses";

const validationSchema = Yup.object({
  from_date: Yup.date().required("From date is required"),

  to_date: Yup.date()
    .required("To date is required")
    .min(Yup.ref("from_date"), "To date must be after From date"),
});

const AIAnalyticsDateFilterComp = () => {
  const dispatch = useDispatch();
  const notify = useSnackbar().enqueueSnackbar;
  const [advanceSearchData, setAdvanceSearchData] = useState({
    from_date: "",
    to_date: "",
  });
  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  return (
    <TableAdvanceSearchWithModal
      open={open}
      handleClose={handleClose}
      handleOpen={handleOpen}
      onlyIcon={true}
    >
      <Formik
        initialValues={advanceSearchData}
        enableReinitialize={true}
        validationSchema={validationSchema}
        onSubmit={async (values) => {
          dispatch({
            type: AI_ANALYTICS_CONST.AI_ANALYTICS_SET_FILTER,
            payload: {
              from_date: values.from_date,
              to_date: values.to_date,
            },
          });
          dispatch(getAiAnalyticsListingAction(notify));
          handleClose();
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
            <Grid
              container
              spacing={2}
              sx={{
                mt: 4,
              }}
            >
              <Grid item size={{ xs: 12 }}>
                <Typography>Search by Date </Typography>
              </Grid>
              <Grid item size={{ xs: 6, sm: 4, md: 3 }} sx={{ ml: 4 }}>
                <Typography variant="subtitle1" sx={customLabelTypography}>
                  From Date
                </Typography>
                <TextField
                  error={Boolean(touched.from_date && errors.from_date)}
                  helperText={touched.from_date && errors.from_date}
                  id="stocks-allot-status"
                  variant="outlined"
                  value={values.from_date}
                  defaultValue={values.from_date}
                  fullWidth
                  size="small"
                  name="from_date"
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      "& fieldset": {
                        borderColor: "#243545",
                      },
                    },
                  }}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  type="date"
                />
              </Grid>
              <Grid item size={{ xs: 6, sm: 4, md: 3 }}>
                <Typography variant="subtitle1" sx={customLabelTypography}>
                  To Date
                </Typography>
                <TextField
                  error={Boolean(touched.to_date && errors.to_date)}
                  helperText={touched.to_date && errors.to_date}
                  id="stocks-allot-status"
                  variant="outlined"
                  value={values.to_date}
                  defaultValue={values.to_date}
                  fullWidth
                  size="small"
                  name="to_date"
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      "& fieldset": {
                        borderColor: "#243545",
                      },
                    },
                  }}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  type="date"
                />
              </Grid>
              <Grid item size={{ xs: 12 }} textAlign={"center"} sx={{ mt: 6 }}>
                <Button
                  variant="contained"
                  color="warning"
                  size="large"
                  sx={{
                    width: 300,
                  }}
                  type="submit"
                  disabled={isSubmitting}
                >
                  Advance Search
                </Button>
              </Grid>
            </Grid>
          </form>
        )}
      </Formik>
    </TableAdvanceSearchWithModal>
  );
};

export default AIAnalyticsDateFilterComp;
