import React, { useEffect, useState } from "react";
import {
  Grid,
  Button,
  Box,
  TextField,
  Card,
  CardContent,
  CardHeader,
  Typography,
  MenuItem,
} from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import LayoutContainer from "@components/reusablecomponents/LayoutContainer";
import { Formik } from "formik";
import * as Yup from "yup";
import {
  getCustomerDetailsById,
  addCustomer,
  updateCustomer,
  clearCutomerData,
} from "../../../actions/transportation/CustomerActions";
import { useHistory } from "react-router-dom";
import { useSnackbar } from "notistack";
import { dropDownDispatch } from "../../../actions/GateInActions";
import { getFormDependencyListing } from "../../../actions/transportation/MasterActions";
import { Image } from "semantic-ui-react";
import BACKIMAGE from '../../../assets/images/back-arrow.png'



export default function CustomerForm(props) {
  const dispatch = useDispatch();

  const store = useSelector((state) => state);
  const customerDetails = useSelector(
    (state) => state.customerMaster.customerDetails
  );
  const stateList = useSelector(
    (state) => state.masterReducer?.masterData?.state
  );

  const { gateIn } = store;
  const history = useHistory();
  const notify = useSnackbar().enqueueSnackbar;
 
  const [customerData, setCustomerData] = useState({
    pk: "",
    name: "",
    code: "",
    address: "",
    contact_no: "",
    gstin: "",
    pan_no: "",
    state: "",
    state_code: "",
    email_id: "",
    tds: "",
    opening_balance_credit: "",
    opening_balance_debit: "",
    location: localStorage.getItem("location")
      ? localStorage.getItem("location")
      : "",
    site: localStorage.getItem("site") ? localStorage.getItem("site") : "",
    remarks: "",
  });
  // eslint-disable-next-line no-unused-vars
  const [stateData, setStateData] = useState(null);
  useEffect(() => {
    let url = window.location.pathname.split("/");
    if (url[url?.length - 1] !== "customer-form") {
      dispatch(getCustomerDetailsById(url[url.length - 1]));
    }
    let reqArray = [
      "indian_states",
      "client_ref_codes",
      "location_site_dashboard_list",
    ];
    let reqBody = {
      field_list: ["state"],
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
    if (customerDetails) {
      setCustomerData(customerDetails);
    }
  }, [customerDetails]);
  useEffect(() => {
    if (stateList) {
      setStateData(stateList);
    }
  }, [stateList]);

  const handleGoBack = () => {
    dispatch(clearCutomerData());
    history.goBack();
  };

  const phoneRegExp = /^[0-9]{10}$/;
  const panRegExp = /([A-Z]){5}([0-9]){4}([A-Z]){1}$/;
  const gstRegExp = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
  const customerNameRegxp = /^[a-zA-Z ]*$/;
  const actualWeightRegExp = /^[+]?([0-9]+(?:[\.][0-9]*)?|\.[0-9]+)$/;
  return (
    <LayoutContainer footer={false}>
      <div
        className="payroll-policy-details"
        style={{ margin: "30px 10px 10px 10px" }}
      >
         <Image
            src={BACKIMAGE}
            style={{ height: 40, width: 40, marginBottom: 15, cursor: "pointer" }}

            onClick={handleGoBack}
          />
        <Card>
          <CardHeader
            title={`${customerData.pk ? "Update" : "Create"} Customer`}
          />
          <CardContent>
            <Formik
              initialValues={customerData}
              enableReinitialize={true}
              validationSchema={Yup.object().shape({
                name: Yup.string().required("Customer Name is Required")
                .matches(customerNameRegxp, "Customer Name is not valid"),
                location: Yup.string().required("Location is Required"),
                site: Yup.string().required("Site is Required"),
                contact_no: Yup.string()
                  .matches(phoneRegExp, "Contact number is not valid"),
                email_id: Yup.string()
                  .email("Email is invalid"),
                pan_no: Yup.string()
                  .matches(panRegExp, "PAN Number is not valid"),
                gstin: Yup.string()
                  .matches(gstRegExp, "GST Number is not valid"),
                tds: Yup.string()
                .matches(
                  actualWeightRegExp,
                  "TDS Number is not valid"
                  ),
              })}
              onSubmit={async (values) => {
                try {
                  if (values.pk) {
                    await dispatch(updateCustomer(values, history, notify));
                  } else {
                    await dispatch(addCustomer(values, history, notify));
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
                    <Grid item size={{xs:12,lg:4}} >
                      <Typography variant="subtitle1">
                      Customer Name <span style={{ color: "red" }}>*</span>
                      </Typography>
                      <TextField
                        error={Boolean(touched.name && errors.name)}
                        helperText={touched.name && errors.name}
                        placeholder="Customer Name"
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
                    <Grid item size={{xs:12,lg:4}}>
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
                    <Grid item size={{xs:12,lg:4}}>
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
                    <Grid item size={{xs:12,lg:4}}>
                      <Typography variant="subtitle1">Address</Typography>
                      <TextField
                        error={Boolean(touched.address && errors.address)}
                        helperText={touched.address && errors.address}
                        multiline
                        placeholder="Address"
                        margin="none"
                        autoComplete="off"
                        rows="3"
                        name="address"
                        fullWidth
                        onBlur={handleBlur}
                        onChange={handleChange}
                        type="text"
                        size="small"
                        value={values.address}
                        variant="outlined"
                      />
                    </Grid>
                    <Grid item size={{xs:12,lg:4}}>
                      <Typography variant="subtitle1">State</Typography>
                      <TextField
                        error={Boolean(touched.state && errors.state)}
                        helperText={touched.state && errors.state}
                        select
                        placeholder="Notes"
                        margin="none"
                        autoComplete="off"
                        name="state"
                        fullWidth
                        onBlur={handleBlur}
                        onChange={handleChange}
                        type="text"
                        size="small"
                        value={values.state}
                        variant="outlined"
                      >
                        {stateList &&
                          Object.keys(stateList).map((option) => (
                            <MenuItem key={option} value={option}>
                              {option}
                            </MenuItem>
                          ))}
                      </TextField>
                    </Grid>
                    <Grid item size={{xs:12,lg:4}}>
                      <Typography variant="subtitle1">State Code</Typography>
                      <TextField
                        error={Boolean(touched.state_code && errors.state_code)}
                        helperText={touched.state_code && errors.state_code}
                        select
                        placeholder="State Code"
                        margin="none"
                        autoComplete="off"
                        name="state_code"
                        fullWidth
                        onBlur={handleBlur}
                        onChange={handleChange}
                        type="text"
                        size="small"
                        value={values.state_code}
                        variant="outlined"
                      >
                        {stateList && (
                          <MenuItem
                            key={stateList[values?.state]}
                            value={stateList[values?.state]}
                          >
                            {stateList[values?.state]}
                          </MenuItem>
                        )}
                      </TextField>
                    </Grid>
                    <Grid item size={{xs:12,lg:4}}>
                      <Typography variant="subtitle1">GST In</Typography>
                      <TextField
                        error={Boolean(touched.gstin && errors.gstin)}
                        helperText={touched.gstin && errors.gstin}
                        placeholder="GST In"
                        margin="none"
                        name="gstin"
                        fullWidth
                        onBlur={handleBlur}
                        onChange={handleChange}
                        inputProps={{ maxLength: 15 }}
                        type="text"
                        size="small"
                        value={values.gstin}
                        variant="outlined"
                      />
                    </Grid>
                    <Grid item size={{xs:12,lg:4}}>
                      <Typography variant="subtitle1">Pan Number</Typography>
                      <TextField
                        error={Boolean(touched.pan_no && errors.pan_no)}
                        helperText={touched.pan_no && errors.pan_no}
                        placeholder="Pan Number"
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
                  
                    <Grid item size={{xs:12,lg:4}}>
                      <Typography variant="subtitle1">
                        Contact Number
                      </Typography>
                      <TextField
                        error={Boolean(touched.contact_no && errors.contact_no)}
                        helperText={touched.contact_no && errors.contact_no}
                        placeholder="Contact Number"
                        margin="none"
                        name="contact_no"
                        inputProps={{ maxLength: 10 }}
                        fullWidth
                        onBlur={handleBlur}
                        onChange={handleChange}
                        type="text"
                        size="small"
                        value={values.contact_no}
                        variant="outlined"
                      />
                    </Grid>

                    <Grid item size={{xs:12,lg:4}}>
                      <Typography variant="subtitle1">Email Address </Typography>
                      <TextField
                        error={Boolean(touched.email_id && errors.email_id)}
                        helperText={touched.email_id && errors.email_id}
                        placeholder="Email Address"
                        margin="none"
                        name="email_id"
                        fullWidth
                        onBlur={handleBlur}
                        onChange={handleChange}
                        type="text"
                        size="small"
                        value={values.email_id}
                        variant="outlined"
                      />
                    </Grid>
                    <Grid item size={{xs:12,lg:4}}>
                      <Typography variant="subtitle1">Remarks</Typography>
                      <TextField
                        error={Boolean(touched.remarks && errors.remarks)}
                        helperText={touched.remarks && errors.remarks}
                        placeholder="Notes"
                        margin="none"
                        autoComplete="off"
                        name="remarks"
                        fullWidth
                        onBlur={handleBlur}
                        onChange={handleChange}
                        type="text"
                        size="small"
                        value={values.remarks}
                        variant="outlined"
                      />
                    </Grid>
                    <Grid item size={{xs:12,lg:4}}>
                      <Typography variant="subtitle1">TDS</Typography>
                      <TextField
                        error={Boolean(touched.tds && errors.tds)}
                        helperText={touched.tds && errors.tds}
                        placeholder="TDS"
                        margin="none"
                        name="tds"
                        fullWidth
                        onBlur={handleBlur}
                        onChange={handleChange}
                        type="text"
                        size="small"
                        value={values.tds}
                        variant="outlined"
                      />
                    </Grid>
                  </Grid>
                  <Box style={{ textAlign: "center" }} ml={1} mt={2}>
                    <Button
                      color="primary"
                      disabled={isSubmitting}
                      size="medium"
                      type="submit"
                      variant="outlined"
                   
                      style={{ marginRight: "10px" }}
                    >
                      {values?.pk ? "Update" : "Submit"}
                   
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
      </div>
    </LayoutContainer>
  );
}
