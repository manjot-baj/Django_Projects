import React, { useEffect, useState } from "react";
import { TableAdvanceSearchWithModal } from "../TableComponent/TableComponent";
import {
  Button,
  Divider,
  Grid,
  MenuItem,
  TextField,
  Typography,
} from "@mui/material";
import { customLabelTypography } from "@/utils/CustomClasses";
import * as Yup from "yup";
import { Formik } from "formik";
import {
  informDropdownUserSupportAction,
  userSupportTicketListingAction,
} from "@/actions/UserSupportAction";
import { useDispatch, useSelector } from "react-redux";
import { useSnackbar } from "notistack";
import { USER_SUPPORT_CONST } from "@/reducers/UserSupportReducer";
import GateInTextField from "../reusablecomponents/GateInTextField";

const validationSchema = Yup.object()
  .shape({
    location: Yup.string().nullable(),
    site: Yup.string().nullable(),

    from_date: Yup.date()
      .nullable()
      .transform((_, originalValue) =>
        originalValue instanceof Date && !isNaN(originalValue)
          ? originalValue
          : null,
      ),

    to_date: Yup.date()
      .nullable()
      .transform((_, originalValue) =>
        originalValue instanceof Date && !isNaN(originalValue)
          ? originalValue
          : null,
      )
      .test(
        "to-after-from",
        "To date must be after From date",
        function (toDate) {
          const { from_date } = this.parent;

          if (!from_date || !toDate) return true;

          return toDate >= from_date;
        },
      ),
  })
  .test(
    "either-location-site-or-dates",
    "Select either Location & Site OR From Date & To Date",
    function (values) {
      const { location, site, from_date, to_date } = values;

      const hasLocationAndSite = Boolean(location && site);
      const hasFromAndToDate = Boolean(from_date && to_date);

      return hasLocationAndSite || hasFromAndToDate;
    },
  );

const UserSupportFilterComp = () => {
  const dispatch = useDispatch();
  const notify = useSnackbar().enqueueSnackbar;
  const { location_site } = useSelector((state) => state.UserSupportReducer);
  const { role, location } = useSelector((state) => state.user);
  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const [advanceSearchData, setAdvanceSearchData] = useState({
    from_date: "",
    to_date: "",
    location: "",
    site: "",
  });

  useEffect(() => {
    dispatch(informDropdownUserSupportAction(notify));
  }, []);

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
            type: USER_SUPPORT_CONST.GET_ALL_TICKETS,
            payload: {
              location: values.location,
              site: values.site,
              from_date: values.from_date,
              to_date: values.to_date,
            },
          });
          dispatch(userSupportTicketListingAction(notify,role==="Location Admin"));
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
              {role !== "Depot User" && role !== "Site Admin" && (
                <Grid item size={{ xs: 12 }}>
                  <Typography>Search by location & Site </Typography>
                </Grid>
              )}
              {role !== "Depot User" && role !== "Site Admin" && (
                <Grid
                  item
                  size={{ xs: 6, sm: 4, md: 3 }}
                  sx={(theme) => ({
                    ml: 4,
                    [theme.breakpoints.down("lg")]: {
                      ml: 0,
                    },
                  })}
                >
                  <Typography variant="subtitle1" sx={customLabelTypography}>
                    Location
                  </Typography>
                  {role === "Location Admin" ? (
                    <GateInTextField value={location} readOnlyP={true} />
                  ) : (
                    <TextField
                      error={Boolean(touched.location && errors.location)}
                      helperText={touched.location && errors.location}
                      id="location"
                      select
                      autoComplete="off"
                      variant="outlined"
                      fullWidth
                      onChange={handleChange}
                      onBlur={handleBlur}
                      name="location"
                      size="small"
                      value={values.location}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          "& fieldset": {
                            borderColor: "#243545",
                          },
                        },
                      }}
                    >
                      {Object.keys(location_site)?.map((val) => (
                        <MenuItem key={val} value={val}>
                          {val}
                        </MenuItem>
                      ))}
                    </TextField>
                  )}
                </Grid>
              )}
              {role !== "Depot User" && role !== "Site Admin" && (
                <Grid item size={{ xs: 6, sm: 4, md: 3 }}>
                  <Typography variant="subtitle1" sx={customLabelTypography}>
                    Site
                  </Typography>
                  <TextField
                    error={Boolean(touched.site && errors.site)}
                    helperText={touched.site && errors.site}
                    id="stocks-allot-status"
                    select
                    variant="outlined"
                    fullWidth
                    name="site"
                    size="small"
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        "& fieldset": {
                          borderColor: "#243545",
                        },
                      },
                    }}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  >
                    {role === "Location Admin"
                      ? location_site?.[location]?.map((val) => (
                          <MenuItem key={val} value={val}>
                            {val}
                          </MenuItem>
                        ))
                      : location_site?.[values.location]?.map((val) => (
                          <MenuItem key={val} value={val}>
                            {val}
                          </MenuItem>
                        ))}
                  </TextField>
                </Grid>
              )}
              {role !== "Depot User" && role !== "Site Admin" && (
                <Grid item size={{ xs: 12 }} sx={{ my: 2 }}>
                  <Divider />
                </Grid>
              )}
              <Grid item size={{ xs: 12 }}>
                <Typography>Search by Date </Typography>
              </Grid>
              <Grid
                item
                size={{ xs: 6, sm: 4, md: 3 }}
                sx={(theme) => ({
                  ml: 4,
                  [theme.breakpoints.down("lg")]: {
                    ml: 0,
                  },
                })}
              >
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

export default UserSupportFilterComp;
