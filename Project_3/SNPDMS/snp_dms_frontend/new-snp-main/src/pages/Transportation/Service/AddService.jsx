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
} from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { Formik } from "formik";
import * as Yup from "yup";
import {
  getServiceDetailsById,
  addService,
  updateService,
  clearServiceData,
} from "../../../actions/transportation/ServiceAction";
import { useHistory } from "react-router-dom";
import { useSnackbar } from "notistack";
import { dropDownDispatch } from "../../../actions/GateInActions";
import { getFormDependencyListing } from "../../../actions/transportation/MasterActions";



export default function AddService(props) {
  const dispatch = useDispatch();

  const store = useSelector((state) => state);
  const service_typeList = ["Yes", "No"];
  const total_taxlist = ["0","5", "12", "18", "28"];
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
  const serviceDetails = useSelector(
    (state) => state.serviceMaster.serviceDetails
  );
  const [serviceData, setServiceData] = useState({
    description: "",
    sac_code: "",
    under_rcm: "No",
    total_tax: "",
    cgst: "",
    sgst: "",
    igst: "",
    location: localStorage.getItem("location")
    ? localStorage.getItem("location")
    : "",
  site: localStorage.getItem("site") ? localStorage.getItem("site") : "",
  });

  useEffect(() => {
    let url = window.location.pathname.split("/");
    if (url[url?.length - 1] !== "service-form") {
      dispatch(getServiceDetailsById(url[url.length - 1]));
    }
    let reqArray = [
      "service_tax",
      "client_ref_codes",
      "location_site_dashboard_list",
    ];

    let reqBody = {
      field_list: ["service_tax"],
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
    if (serviceDetails) {
      setServiceData(serviceDetails);
    }
  }, [serviceDetails]);

  const handleGoBack = () => {
    dispatch(clearServiceData());
    history.goBack();
  };
  const sacRegExp = /^[0-9]{6}(?:\s*,\s*[0-9]{6})*$/;
  return (
    <Card>
      <CardHeader title={`${serviceData.pk ? "Update" : "Create"} Service`} />
      <CardContent>
        <Formik
          initialValues={serviceData}
          enableReinitialize={true}
          validationSchema={Yup.object().shape({
            sac_code: Yup.string()
            .required("SAC Number is Required")
            .matches(sacRegExp, "SAC Number is not valid"),
            description: Yup.string().required("Description is Required"),
            location: Yup.string().required("Location is Required"),
            under_rcm: Yup.string().required("Under RCM is Required"),
            total_tax: Yup.string().required("Total Tax is Required"),
            site: Yup.string().required("Site is Required"),
          })}
          onSubmit={async (values) => {
            try {
              if (values.pk) {
                await dispatch(updateService(values, history, notify));
              } else {
                await dispatch(addService(values, history, notify));
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
            setFieldValue,
          }) => (
            <form onSubmit={handleSubmit}>
              <Grid container spacing={2}>
                <Grid item size={{xs:12,lg:3}}>
                  <Typography variant="subtitle1">Description <span style={{ color: "red" }}>*</span> </Typography>
                  <TextField
                    error={Boolean(touched.description && errors.description)}
                    helperText={touched.description && errors.description}
                    multiline
                    placeholder="Description"
                    margin="none"
                    autoComplete="off"
                    name="description"
                    fullWidth
                    onBlur={handleBlur}
                    onChange={handleChange}
                    type="text"
                    size="small"
                    value={values.description}
                    variant="outlined"
                  />
                </Grid>
                <Grid item size={{xs:12,lg:3}}>
                  <Typography variant="subtitle1">SAC Code <span style={{ color: "red" }}>*</span> </Typography>
                  <TextField
                    error={Boolean(touched.sac_code && errors.sac_code)}
                    helperText={touched.sac_code && errors.sac_code}
                    placeholder="SAC Code"
                    margin="none"
                    name="sac_code"
                    fullWidth
                    onBlur={handleBlur}
                    onChange={handleChange}
                    inputProps={{ maxLength: 6 }}
                    type="text"
                    size="small"
                    value={values.sac_code}
                    variant="outlined"
                  />
                </Grid>
                <Grid item size={{xs:12,lg:3}}>
                  <Typography variant="subtitle1">Under RCM <span style={{ color: "red" }}>*</span></Typography>
                  <TextField
                    error={Boolean(touched.under_rcm && errors.under_rcm)}
                    helperText={touched.under_rcm && errors.under_rcm}
                    select
                    placeholder="Under RCM"
                    margin="none"
                    autoComplete="off"
                    name="under_rcm"
                    fullWidth
                    onBlur={handleBlur}
                    onChange={handleChange}
                    type="text"
                    size="small"
                    value={values.under_rcm}
                    variant="outlined"
                  >
                    {service_typeList.map((option) => (
                      <MenuItem key={option} value={option}>
                        {option}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item size={{xs:12,lg:3}}>
                  <Typography variant="subtitle1">Total Tax <span style={{ color: "red" }}>*</span> </Typography>
                  <TextField
                    error={Boolean(touched.total_tax && errors.total_tax)}
                    helperText={touched.total_tax && errors.total_tax}
                    select
                    placeholder="Total Tax"
                    margin="none"
                    name="total_tax"
                    fullWidth
                    onBlur={handleBlur}
                    onChange={(e) => {
                      handleChange("total_tax")(e);
                      setFieldValue("cgst", e.target.value / 2);
                      setFieldValue("igst", e.target.value);
                      setFieldValue("sgst", e.target.value / 2);
                    }}
                    type="text"
                    size="small"
                    value={values.total_tax}
                    variant="outlined"
                  >
                    {total_taxlist.map((option) => (
                      <MenuItem key={option} value={option}>
                        {option}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>

                <Grid item size={{xs:12,lg:3}}>
                  <Typography variant="subtitle1">CGST</Typography>
                  <TextField
                    error={Boolean(touched.cgst && errors.cgst)}
                    helperText={touched.cgst && errors.cgst}
                    placeholder="CGST"
                    margin="none"
                    name="cgst"
                    fullWidth
                    onBlur={handleBlur}
                    onChange={handleChange}
                    type="text"
                    size="small"
                    value={values.cgst}
                    variant="outlined"
                    disabled
                  />
                </Grid>
                <Grid item size={{xs:12,lg:3}}>
                  <Typography variant="subtitle1">SGST </Typography>
                  <TextField
                    error={Boolean(touched.sgst && errors.sgst)}
                    helperText={touched.sgst && errors.sgst}
                    placeholder="SGST"
                    margin="none"
                    name="sgst"
                    fullWidth
                    onBlur={handleBlur}
                    onChange={handleChange}
                    type="text"
                    size="small"
                    value={values.sgst}
                    variant="outlined"
                    disabled
                  />
                </Grid>
                <Grid item size={{xs:12,lg:3}}>
                  <Typography variant="subtitle1">IGST</Typography>
                  <TextField
                    error={Boolean(touched.igst && errors.igst)}
                    helperText={touched.igst && errors.igst}
                    placeholder="IGST"
                    margin="none"
                    name="igst"
                    fullWidth
                    onBlur={handleBlur}
                    onChange={handleChange}
                    type="text"
                    size="small"
                    value={values.igst}
                    variant="outlined"
                    disabled
                  />
                </Grid>

                <Grid item size={{xs:12,lg:3}}>
                  <Typography variant="subtitle1">
                    Location <span style={{ color: "red" }}>*</span>
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
                <Grid item size={{xs:12,lg:3}} >
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
