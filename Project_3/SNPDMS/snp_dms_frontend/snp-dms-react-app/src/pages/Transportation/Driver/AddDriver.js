import React, { useEffect, useState } from "react";
import {
  Grid,
  Button,
  makeStyles,
  Box,
  TextField,
  Card,
  CardContent,
  CardHeader,
  Typography,
  MenuItem,
} from "@material-ui/core";
import { useDispatch, useSelector } from "react-redux";
import { Formik } from "formik";
import * as Yup from "yup";
import {
  getDriverDetailsById,
  addDriver,
  updateDriver,
  clearDriverData,
} from "../../../actions/transportation/DriverAction";
import { useHistory } from "react-router-dom";
import { useSnackbar } from "notistack";
import { dropDownDispatch } from "../../../actions/GateInActions";
import { getFormDependencyListing } from "../../../actions/transportation/MasterActions";

const useStyles = makeStyles((theme) => ({
  button: {
    fontSize: 12.5,
    borderRadius: 6,
    width: "100%",
    border: "1.5px solid #2A5FA5",
    boxShadow: "0px 3px 6px #9199A14D",
    backgroundColor: "#2A5FA5",
    color: "#fff",
    "&:hover": {
      backgroundColor: "#2A5FA5",
    },
  },
}));

export default function AddDriver(props) {
  const dispatch = useDispatch();
  const classes = useStyles();
  const store = useSelector((state) => state);
  const { gateIn } = store;
  const history = useHistory();
  const notify = useSnackbar().enqueueSnackbar;
  // eslint-disable-next-line no-unused-vars
  const [Location, setLocation] = useState(
    localStorage.getItem("location") ? localStorage.getItem("location") : ""
  );
  // eslint-disable-next-line no-unused-vars
  const [site, setSite] = useState(
    localStorage.getItem("site") ? localStorage.getItem("site") : ""
  );
  // eslint-disable-next-line no-unused-vars
  const [stateData, setStateData] = useState(null);
  const driverDetails = useSelector(
    (state) => state.driverMaster.driverDetails
  );
  const transporterList = useSelector(
    (state) => state.masterReducer?.masterData?.transporter
  );

  const [driverData, setDriverData] = useState({
    name: "",
    mobile_no: "",
    pan_no: "",
    license_no: "",
    transporter: "",
    location: localStorage.getItem("location")
    ? localStorage.getItem("location")
    : "",
  site: localStorage.getItem("site") ? localStorage.getItem("site") : "",
  });

  useEffect(() => {
    let url = window.location.pathname.split("/");
    if (url[url?.length - 1] !== "driver-form") {
      dispatch(getDriverDetailsById(url[url.length - 1]));
    }
    let reqArray = [
      "transporter",
      "client_ref_codes",
      "location_site_dashboard_list",
    ];

    let reqBody = {
      field_list: ["transporter"],
      location: localStorage.getItem("location")
        ? localStorage.getItem("location")
        : null,
      site: localStorage.getItem("site") ? localStorage.getItem("site") : null,
    };
    dispatch(dropDownDispatch(reqArray, notify));
    dispatch(getFormDependencyListing(reqBody));
   
// eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (driverDetails) {
      setDriverData(driverDetails);
    }
  }, [driverDetails]);
  useEffect(() => {
    if (transporterList) {
      setStateData(transporterList);
    }
  }, [transporterList]);

  const handleGoBack = () => {
    dispatch(clearDriverData());
    history.goBack();
  };
  const phoneRegExp = /^[0-9]{10}$/;
  const panRegExp = /([A-Z]){5}([0-9]){4}([A-Z]){1}$/;
  // const licenseRegExp  =  /^(([A-Z]{2}[0-9]{2})( )|([A-Z]{2}-[0-9]{2}))((19|20)[0-9][0-9])[0-9]{7}$/;
  const nameRegxp =  /^[a-zA-Z ]*$/;
  return (
    <Card>
      <CardHeader title={`${driverData.pk ? "Update" : "Create"} Driver`} />
      <CardContent>
        <Formik
          initialValues={driverData}
          enableReinitialize={true}
          validationSchema={Yup.object().shape({
            transporter: Yup.string().required("Transporter is Required"),
            name: Yup.string().required("Name is Required")
            .matches(nameRegxp, "Driver Name is not valid"),
            location: Yup.string().required("Location is Required"),
            site: Yup.string().required("Site is Required"),
            mobile_no: Yup.string()
            .matches(phoneRegExp, "Mobile Number is not valid"),
            pan_no: Yup.string()
            .matches(panRegExp, "PAN Number is not valid"),
            // license_no: Yup.string()
            // .matches(licenseRegExp, " License Number is not valid"),
          })}
          
          onSubmit={async (values) => {
            try {
              if (values.pk) {
                await dispatch(updateDriver(values, history, notify));
              } else {
                await dispatch(addDriver(values, history, notify));
              }
            } catch (error) {
              console.log("error", error);
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
          }) => (
            <form onSubmit={handleSubmit}>
              <Grid container spacing={2}>
                <Grid item xs={12} lg={3}>
                  <Typography variant="subtitle1">Transporter <span style={{ color: "red" }}>*</span> 
                  </Typography>
                  <TextField
                    error={Boolean(touched.transporter && errors.transporter)}
                    helperText={touched.transporter && errors.transporter}
                    select
                    placeholder="Transporter"
                    margin="none"
                    autoComplete="off"
                    name="transporter"
                    fullWidth
                    onBlur={handleBlur}
                    onChange={handleChange}
                    type="text"
                    size="small"
                    value={values.transporter}
                    variant="outlined"
                  >
                    {transporterList &&
                      transporterList.map((option) => (
                        <MenuItem key={option} value={option}>
                          {option}
                        </MenuItem>
                      ))}
                  </TextField>
                </Grid>
                <Grid item xs={12} lg={3}>
                  <Typography variant="subtitle1">
                    Name <span style={{ color: "red" }}>*</span>
                  </Typography>
                  <TextField
                    error={Boolean(touched.name && errors.name)}
                    helperText={touched.name && errors.name}
                    placeholder="Name"
                    margin="none"
                    name="name"
                    fullWidth
                    onBlur={handleBlur}
                    onChange={handleChange}
                    type="text"
                    size="small"
                    value={values.name}
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12} lg={3}>
                  <Typography variant="subtitle1">License Number</Typography>
                  <TextField
                    placeholder="License No"
                    margin="none"
                    name="license_no"
                    inputProps={{ maxLength: 16 }}
                    fullWidth
                    onBlur={handleBlur}
                    onChange={handleChange}
                    type="text"
                    size="small"
                    value={values.license_no}
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12} lg={3}>
                  <Typography variant="subtitle1">Mobile Number </Typography>
                  <TextField
                    error={Boolean(touched.mobile_no && errors.mobile_no)}
                    helperText={touched.mobile_no && errors.mobile_no}
                    placeholder="Mobile Number"
                    margin="none"
                    name="mobile_no"
                    inputProps={{ maxLength: 10 }}
                    fullWidth
                    onBlur={handleBlur}
                    onChange={handleChange}
                    type="text"
                    size="small"
                    value={values.mobile_no}
                    variant="outlined"
                  />
                </Grid>

                <Grid item xs={12} lg={3}>
                  <Typography variant="subtitle1">PAN Number</Typography>
                  <TextField
                    error={Boolean(touched.pan_no && errors.pan_no)}
                    helperText={touched.pan_no && errors.pan_no}
                    placeholder="PAN No"
                    margin="none"
                    name="pan_no"
                    fullWidth
                    onBlur={handleBlur}
                    onChange={handleChange}
                    inputProps={{ maxLength: 10 }}
                    type="text"
                    size="small"
                    value={values.pan_no}
                    variant="outlined"
                  />
                </Grid>

                <Grid item xs={12} lg={3}>
                  <Typography variant="subtitle1">
                    Location<span style={{ color: "red" }}>*</span>
                  </Typography>
                  <TextField
                    error={Boolean(touched.location && errors.location)}
                    helperText={touched.location && errors.location}
                    select
                    placeholder="Location"
                    margin="none"
                    autoComplete="off"
                    name="location"
                    fullWidth
                    onBlur={handleBlur}
                    onChange={handleChange}
                    type="text"
                    size="small"
                    value={values.location}
                    variant="outlined"
                    disabled
                  >
                    {gateIn.allDropDown &&
                      gateIn.allDropDown.location_site_dashboard_list &&
                      Object.keys(
                        gateIn.allDropDown.location_site_dashboard_list
                      ).map((option) => (
                        <MenuItem key={option} value={option}>
                          {option}
                        </MenuItem>
                      ))}
                  </TextField>
                </Grid>
                <Grid item xs={12} lg={3}>
                  <Typography variant="subtitle1">
                    Site<span style={{ color: "red" }}>*</span>
                  </Typography>
                  <TextField
                    error={Boolean(touched.site && errors.site)}
                    helperText={touched.site && errors.site}
                    select
                    placeholder="Notes"
                    margin="none"
                    autoComplete="off"
                    name="site"
                    fullWidth
                    onBlur={handleBlur}
                    onChange={handleChange}
                    type="text"
                    size="small"
                    value={values.site}
                    variant="outlined"
                    disabled
                  >
                    {values.location !== "" &&
                      gateIn.allDropDown &&
                      gateIn.allDropDown.location_site_dashboard_list &&
                      gateIn.allDropDown.location_site_dashboard_list[
                        values.location
                      ]?.map((option) => (
                        <MenuItem key={option} value={option}>
                          {option}
                        </MenuItem>
                      ))}
                  </TextField>
                </Grid>
              </Grid>
              <br />
              <hr />
              <br />
              <Box style={{ textAlign: "center" }} ml={1} mt={2}>
                <Button
                  color="primary"
                  disabled={isSubmitting}
                  size="medium"
                  type="submit"
                  variant="outlined"
                  className={classes.successBtn}
                  style={{ marginRight: "10px" }}
                >
                  {values?.pk ? "Update Details" : "Save Details"}
                </Button>
                <Button
                  color="secondary"
                  size="medium"
                  type="button"
                  variant="outlined"
                  onClick={handleGoBack}
                >
                  Cancel
                </Button>
              </Box>
            </form>
          )}
        </Formik>
      </CardContent>
    </Card>
  );
}
