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
  getTruckDetailsById,
  addTruck,
  updateTruck,
  clearTruckData,
} from "../../../actions/transportation/TruckAction";
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
  // eslint-disable-next-line no-unused-vars
  const {  user } = store;
  const truckDetails = useSelector(
    (state) => state.truckMaster.truckDetails
  );
  const transporterList = useSelector(
    (state) => state.masterReducer?.masterData?.transporter
  );
  // eslint-disable-next-line no-unused-vars
  const [stateData, setStateData] = useState(null);
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

  const [truckData, setTruckData] = useState({
    truck_no: "",
    transporter: "",
    location: localStorage.getItem("location")
    ? localStorage.getItem("location")
    : "",
  site: localStorage.getItem("site") ? localStorage.getItem("site") : "",
  });

  useEffect(() => {
    let url = window.location.pathname.split("/");
    if (url[url?.length - 1] !== "truck-form") {
      dispatch(getTruckDetailsById(url[url.length - 1]));
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
    if (truckDetails) {
      setTruckData(truckDetails);
    }
  }, [truckDetails]);

  useEffect(() => {
    if (transporterList) {
      setStateData(transporterList);
    }
  }, [transporterList]);

  const handleGoBack = () => {
    dispatch(clearTruckData());
    history.goBack();
  };
  // const truckRegExp  = (/^[A-Z]{2}[ -][0-9]{1,2}(?: [A-Z])?(?: [A-Z]*)? [0-9]{4}$/);
  return (
    <Card>
      <CardHeader title={`${truckData.pk ? "Update" : "Create"} Truck`} />
      <CardContent>
        <Formik
          initialValues={truckData}
          enableReinitialize={true}
          validationSchema={Yup.object().shape({
            transporter: Yup.string().required("Transporter is Required"),
            truck_no: Yup.string().required("Truck Number is Required"),
            // .matches(truckRegExp, " Trruck Number is not valid"),
            
          })}
          onSubmit={async (values) => {
            try {
              if (values.pk) {
                await dispatch(updateTruck(values, history, notify));
              } else {
                await dispatch(addTruck(values, history, notify));
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
                <Grid item xs={12} lg={6}>
                  <Typography variant="subtitle1">Transporter <span style={{ color: "red" }}>*</span> </Typography>
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
                <Grid item xs={12} lg={6}>
                  <Typography variant="subtitle1">
                    Truck Number <span style={{ color: "red" }}>*</span>
                  </Typography>
                  <TextField
                    error={Boolean(touched.truck_no && errors.truck_no)}
                    helperText={touched.truck_no && errors.truck_no}
                    placeholder="Truck Number"
                    margin="none"
                    name="truck_no"
                    fullWidth
                    onBlur={handleBlur}
                    onChange={handleChange}
                    type="text"
                    size="small"
                    value={values.truck_no}
                    variant="outlined"
                  />
                </Grid>
                   
                <Grid item xs={12} lg={6}>
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
                      )?.map((option) => (
                        <MenuItem key={option} value={option}>
                          {option}
                        </MenuItem>
                      ))}
                  </TextField>
                </Grid>
                <Grid item xs={12} lg={6}>
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
              <br/>
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
