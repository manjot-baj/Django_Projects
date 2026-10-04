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
import LayoutContainer from "../../../components/reusableComponents/LayoutContainer";
import { Formik } from "formik";
import { getTransportationReports } from "../../../actions/transportation/TransportationReportsAction";
import { useSnackbar } from "notistack";
import { dropDownDispatch } from "../../../actions/GateInActions";
import * as Yup from "yup";
import { getFormDependencyListing } from "../../../actions/transportation/MasterActions";

const report_typeList = [
  "Daily Creditor Report",
  "Creditor Ledger Bill Wise",
  "Creditor Balance Ledger",
  "Customer Ledger Bill Wise",
  "Customer Balance Ledger",
  "Daily Booking Report",
  "Customer Ledger",
  "Creditor Ledger",
  "Account Ledger",
];

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
  backImage: {
    height: 40,
    width: 40,
    marginBottom: 15,
    cursor: "pointer",
  },
}));

export default function TransportationReports(props) {
  const dispatch = useDispatch();
  const classes = useStyles();
  const store = useSelector((state) => state);
  const { gateIn } = store;
  const accountDetails = useSelector(
    (state) => state.accountMaster.accountDetails
  );
  const transpoterList = useSelector(
    (state) => state.masterReducer?.masterData?.transporter
  );
  const billPartyList = useSelector(
    (state) => state.masterReducer?.masterData?.bill_party
  );
  const accountList = useSelector(
    (state) => state.masterReducer?.masterData?.account
  );
  // eslint-disable-next-line no-unused-vars
  const [transpoterData, setTranspoterData] = useState(null);
  // eslint-disable-next-line no-unused-vars
  const [billParty, setBillParty] = useState(null);
  // eslint-disable-next-line no-unused-vars
  const [accountLists, setAccountList] = useState(null);
  // eslint-disable-next-line no-unused-vars
  const [loader, setLoader] = useState(false);
  const notify = useSnackbar().enqueueSnackbar;
  const [accountData, setAccountData] = useState({
    from_date: "",
    to_date: "",
    creditor: "",
    report_type: "",
    account: "",
    customer: "",
    location: localStorage.getItem("location")
      ? localStorage.getItem("location")
      : "",
    site: localStorage.getItem("site") ? localStorage.getItem("site") : "",
  });

  useEffect(() => {
    let reqArray = [
      "location_site_dashboard_list",
      "client_ref_codes",
    ];
    let reqBody = {
      field_list: ["transporter", "bill_party", "account"],
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
    if (accountDetails) {
      setAccountData(accountDetails);
    }
  }, [accountDetails]);

  useEffect(() => {
    if (transpoterList) {
      setTranspoterData(transpoterList);
    }
  }, [transpoterList]);

  useEffect(() => {
    if (billPartyList) {
      setBillParty(billPartyList);
    }
  }, [billPartyList]);

  useEffect(() => {
    if (accountList) {
      setAccountList(accountList);
    }
  }, [accountList]);


  return (
    <LayoutContainer footer={false}>
      <div
        className="payroll-policy-details"
        style={{ margin: "30px 10px 10px 10px" }}
      >
        <Card>
          <CardHeader title={`Download Reports`} />
          <CardContent>
            <Formik
              initialValues={accountData}
              enableReinitialize={true}
              validationSchema={Yup.object().shape({
                from_date: Yup.string().required("From Date is Required"),
                location: Yup.string().required("Location is Required"),
                to_date: Yup.string().required("To Date is Required"),
                report_type: Yup.string().required("Report type is Required"),
                site: Yup.string().required("Site is Required"),
                creditor: Yup.string().when("report_type", {
                  is: (report_type) =>
                    report_type === "Daily Creditor Report" ||
                    report_type === "Creditor Ledger Bill Wise" ||
                    report_type === "Creditor Balance Ledger" ||
                    report_type === "Creditor Ledger",
                  then: Yup.string().required("Creditor is required"),
                  otherwise: Yup.string(),
                }),
                customer: Yup.string().when("report_type", {
                  is: (report_type) =>
                    report_type === "Customer Ledger" ||
                    report_type === "Customer Ledger Bill Wise" ||
                    report_type === "Customer Balance Ledger" ||
                    report_type === "Customer Balance Ledger",
                  then: Yup.string().required("Customer is required"),
                  otherwise: Yup.string(),
                }),
                account: Yup.string().when("report_type", {
                  is: (report_type) => report_type === "Account Ledger",
                  then: Yup.string().required("Account is required"),
                  otherwise: Yup.string(),
                }),
              })}
              onSubmit={async (values) => {
                try {
                  await dispatch(
                    getTransportationReports(values, setLoader, notify)
                  );
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
                      <Typography variant="subtitle1">
                        From Date <span style={{ color: "red" }}>*</span>
                      </Typography>
                      <TextField
                        error={Boolean(touched?.from_date && errors?.from_date)}
                        helperText={touched?.from_date && errors?.from_date}
                        margin="none"
                        name="from_date"
                        fullWidth
                        onBlur={handleBlur}
                        onChange={handleChange}
                        type="date"
                        size="small"
                        value={values?.from_date}
                        variant="outlined"
                      />
                    </Grid>
                    <Grid item xs={12} lg={6}>
                      <Typography variant="subtitle1">
                        To Date <span style={{ color: "red" }}>*</span>
                      </Typography>
                      <TextField
                        error={Boolean(touched?.to_date && errors?.to_date)}
                        helperText={touched?.to_date && errors?.to_date}
                        margin="none"
                        name="to_date"
                        fullWidth
                        onBlur={handleBlur}
                        onChange={handleChange}
                        type="date"
                        size="small"
                        value={values?.to_date}
                        variant="outlined"
                      />
                    </Grid>

                    <Grid item xs={12} lg={6}>
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
                    <Grid item xs={12} lg={6}>
                      <Typography variant="subtitle1">
                        Site <span style={{ color: "red" }}>*</span>
                      </Typography>
                      <TextField
                        error={Boolean(touched.site && errors.site)}
                        helperText={touched.site && errors.site}
                        select
                        placeholder="Site"
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
                          ].map((option) => (
                            <MenuItem key={option} value={option}>
                              {option}
                            </MenuItem>
                          ))}
                      </TextField>
                    </Grid>
                    <Grid item xs={12} lg={6}>
                      <Typography variant="subtitle1">
                        Report Type <span style={{ color: "red" }}>*</span>
                      </Typography>
                      <TextField
                        error={Boolean(
                          touched.report_type && errors.report_type
                        )}
                        helperText={touched.report_type && errors.report_type}
                        select
                        placeholder="report_type"
                        margin="none"
                        autoComplete="off"
                        name="report_type"
                        fullWidth
                        onBlur={handleBlur}
                        onChange={(e) => {
                          handleChange("report_type")(e);
                          handleChange("customer")("");
                          handleChange("creditor")("");
                        }}
                        type="text"
                        size="small"
                        value={values.report_type}
                        variant="outlined"
                      >
                        {report_typeList.map((option) => (
                          <MenuItem key={option} value={option}>
                            {option}
                          </MenuItem>
                        ))}
                      </TextField>
                    </Grid>

                    <Grid item xs={12} lg={6}>
                      <Typography variant="subtitle1">
                        Creditor
                        {values.report_type === "Daily Creditor Report" ||
                          values.report_type === "Creditor Ledger Bill Wise" ||
                          values.report_type === "Creditor Balance Ledger" ||
                          values.report_type === "Creditor Ledger" ? (
                          <span style={{ color: "red" }}>* </span>
                        ) : (
                          ""
                        )}
                      </Typography>
                      <TextField
                        error={Boolean(touched.creditor && errors.creditor)}
                        helperText={touched.creditor && errors.creditor}
                        select
                        placeholder="creditor"
                        margin="none"
                        autoComplete="off"
                        name="creditor"
                        fullWidth
                        onBlur={handleBlur}
                        onChange={(e) => {
                          handleChange("creditor")(e);
                        }}
                        type="text"
                        size="small"
                        value={values.creditor}
                        variant="outlined"
                        disabled={
                          values.report_type === "Customer Ledger" ||
                          values.report_type === "Customer Ledger Bill Wise" ||
                          values.report_type === "Customer Balance Ledger" ||
                          values.report_type === "Customer Balance Ledger" ||
                          values.report_type === "Daily Booking Report" ||
                          values.report_type === "Account Ledger"
                        }
                      >
                        {transpoterList &&
                          (transpoterList).map((option) => (
                            <MenuItem value={option}>
                              {option}
                            </MenuItem>
                          ))}
                      </TextField>
                    </Grid>

                    <Grid item xs={12} lg={6}>
                      <Typography variant="subtitle1">
                        Customer
                        {values.report_type === "Customer Ledger" ||
                          values.report_type === "Customer Ledger Bill Wise" ||
                          values.report_type === "Customer Balance Ledger" ||
                          values.report_type === "Customer Balance Ledger" ? (
                          <span style={{ color: "red" }}>* </span>
                        ) : (
                          ""
                        )}
                      </Typography>
                      <TextField
                        error={Boolean(touched.customer && errors.customer)}
                        helperText={touched.customer && errors.customer}
                        select
                        placeholder="customer"
                        margin="none"
                        autoComplete="off"
                        name="customer"
                        fullWidth
                        onBlur={handleBlur}
                        onChange={(e) => {
                          handleChange("customer")(e);
                        }}
                        type="text"
                        size="small"
                        value={values.customer}
                        variant="outlined"
                        disabled={
                          values.report_type === "Daily Creditor Report" ||
                          values.report_type === "Creditor Ledger Bill Wise" ||
                          values.report_type === "Creditor Balance Ledger" ||
                          values.report_type === "Creditor Ledger" ||
                          values.report_type === "Daily Booking Report" ||
                          values.report_type === "Account Ledger"
                        }
                      >
                        {billPartyList &&
                          (billPartyList).map((option) => (
                            <MenuItem value={option}>
                              {option}
                            </MenuItem>
                          ))}
                      </TextField>
                    </Grid>
                    <Grid item xs={12} lg={6}>
                      <Typography variant="subtitle1">
                        Account
                        {values.report_type === "Account Ledger" ? (
                          <span style={{ color: "red" }}>* </span>
                        ) : (
                          ""
                        )}
                      </Typography>
                      <TextField
                        error={Boolean(touched.account && errors.account)}
                        helperText={touched.account && errors.account}
                        select
                        placeholder="account"
                        margin="none"
                        autoComplete="off"
                        name="account"
                        fullWidth
                        onBlur={handleBlur}
                        onChange={(e) => {
                          handleChange("account")(e);
                        }}
                        type="text"
                        size="small"
                        value={values.account}
                        variant="outlined"
                        disabled={values.report_type !== "Account Ledger"}
                      >
                        {accountList &&
                          (accountList).map((option) => (
                            <MenuItem value={option}>
                              {option}
                            </MenuItem>
                          ))}
                      </TextField>
                    </Grid>
                  </Grid>

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
                      Download Report
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
