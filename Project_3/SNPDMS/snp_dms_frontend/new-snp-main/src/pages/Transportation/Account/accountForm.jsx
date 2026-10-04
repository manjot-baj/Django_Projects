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
  getAccountDetailsById,
  addAccount,
  updateAccount,
  clearAccountData,
} from "../../../actions/transportation/AccountActions";
import { useHistory } from "react-router-dom";
import { useSnackbar } from "notistack";
import { dropDownDispatch } from "../../../actions/GateInActions";
import { Image } from "semantic-ui-react";
import BACKIMAGE from '../../../assets/images/back-arrow.png'
const account_typeList = ["BANK", "CASH_ON_HAND"];


export default function AccountForm(props) {
  const dispatch = useDispatch();

  const store = useSelector((state) => state);
  const { gateIn } = store;
  const accountDetails = useSelector(
    (state) => state.accountMaster.accountDetails
  );
  const history = useHistory();
  const notify = useSnackbar().enqueueSnackbar;

  const [accountData, setAccountData] = useState({
    pk: "",
    name: "",
    address: "",
    contact_no: "",
    account_type: "",
    email_id: "",
    total_balance: "",
    opening_balance_credit: "",
    opening_balance_debit: "",
    location: localStorage.getItem("location")
      ? localStorage.getItem("location")
      : "",
    remarks: "",
    site: localStorage.getItem("site") ? localStorage.getItem("site") : "",
  });
  useEffect(() => {
    let url = window.location.pathname.split("/");
    if (url[url?.length - 1] !== "account-form") {
      dispatch(getAccountDetailsById(url[url.length - 1]));
    }
    let reqArray = [
      "indian_states",
      "client_ref_codes",
      "location_site_dashboard_list",
    ];

    dispatch(dropDownDispatch(reqArray, notify));

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (accountDetails) {
      setAccountData(accountDetails);
    }
  }, [accountDetails]);

  const handleGoBack = () => {
    dispatch(clearAccountData());
    history.goBack();
  };
  const phoneRegExp = /^[0-9]{10}$/;
  // const accountNameRegxp = /^[a-zA-Z ]*$/;
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
            title={`${accountData.pk ? "Update" : "Create"} Account`}
          />
          <CardContent>
            <Formik
              initialValues={accountData}
              enableReinitialize={true}
              validationSchema={Yup.object().shape({
                name: Yup.string().required("Account Name is Required"),
                // .matches(accountNameRegxp, "Account Name is not valid"),
                location: Yup.string().required("Location is Required"),
                account_type: Yup.string().required("Account Type is Required"),
                total_balance: Yup.string().required(
                  "Total Balance is Required"
                ),
                site: Yup.string().required("Site is Required"),
                contact_no: Yup.string().matches(
                  phoneRegExp,
                  "Contact number is not valid"
                ),
                email_id: Yup.string().email("Email is invalid"),
              })}
              onSubmit={async (values) => {
                try {
                  if (values.pk) {
                    await dispatch(updateAccount(values, history, notify));
                  } else if (values.pk) {
                    await dispatch(addAccount(values, history, notify));
                  } else {
                    await dispatch(addAccount(values, history, notify));
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
                    <Grid item size={{xs:12,lg:6}} >
                      <Typography variant="subtitle1">
                        Account Type<span style={{ color: "red" }}>*</span>
                      </Typography>
                      <TextField
                        error={Boolean(
                          touched.account_type && errors.account_type
                        )}
                        helperText={touched.account_type && errors.account_type}
                        select
                        placeholder="account_type"
                        margin="none"
                        autoComplete="off"
                        name="account_type"
                        fullWidth
                        onBlur={handleBlur}
                        onChange={(e) => {
                          handleChange("account_type")(e);
                          if (e.target.value === "CASH_ON_HAND") {
                            setFieldValue("name", e.target.value);
                          } else {
                            setFieldValue("name", "");
                          }
                        }}
                        type="text"
                        size="small"
                        value={values.account_type}
                        variant="outlined"
                      >
                        {account_typeList.map((option) => (
                          <MenuItem key={option} value={option}>
                            {option}
                          </MenuItem>
                        ))}
                      </TextField>
                    </Grid>
                    <Grid item size={{xs:12,lg:6}}>
                      <Typography variant="subtitle1">
                        Account Name <span style={{ color: "red" }}>*</span>
                      </Typography>
                      <TextField
                        error={Boolean(touched.name && errors.name)}
                        helperText={touched.name && errors.name}
                        placeholder="Account Name"
                        margin="none"
                        name="name"
                        fullWidth
                        onBlur={handleBlur}
                        onChange={handleChange}
                        type="text"
                        size="small"
                        value={values.name}
                        variant="outlined"
                        disabled={
                          values.account_type === "CASH_ON_HAND" ? true : false
                        }
                      />
                    </Grid>

                    <Grid item size={{xs:12,lg:6}}>
                      <Typography variant="subtitle1">
                        Contact Number
                      </Typography>
                      <TextField
                        error={Boolean(touched.contact_no && errors.contact_no)}
                        helperText={touched.contact_no && errors.contact_no}
                        placeholder="Contact Number"
                        margin="none"
                        name="contact_no"
                        fullWidth
                        onBlur={handleBlur}
                        onChange={handleChange}
                        type="text"
                        size="small"
                        inputProps={{ maxLength: 10 }}
                        value={values.contact_no}
                        variant="outlined"
                      />
                    </Grid>
                    <Grid item size={{xs:12,lg:6}}>
                      <Typography variant="subtitle1">Email Address</Typography>
                      <TextField
                        error={Boolean(touched.email_id && errors.email_id)}
                        helperText={touched.email_id && errors.email_id}
                        placeholder="Email Address"
                        margin="none"
                        name="email_id"
                        fullWidth
                        onBlur={handleBlur}
                        onChange={handleChange}
                        type="email"
                        size="small"
                        value={values.email_id}
                        variant="outlined"
                      />
                    </Grid>
                    <Grid item size={{xs:12,lg:6}}>
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
                    <Grid item size={{xs:12,lg:6}}>
                      <Typography variant="subtitle1">Remarks</Typography>
                      <TextField
                        error={Boolean(touched.remarks && errors.remarks)}
                        helperText={touched.remarks && errors.remarks}
                        multiline
                        placeholder="Remarks"
                        margin="none"
                        autoComplete="off"
                        rows="3"
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
                    <Grid item size={{xs:12,lg:6}}>
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
                    <Grid item size={{xs:12,lg:6}}>
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
                    <Grid item size={{xs:12,lg:6}}>
                      <Typography variant="subtitle1">
                        Total Balance <span style={{ color: "red" }}>*</span>
                      </Typography>
                      <TextField
                        error={Boolean(
                          touched.total_balance && errors.total_balance
                        )}
                        helperText={
                          touched.total_balance && errors.total_balance
                        }
                        placeholder="Total Balance"
                        margin="none"
                        name="total_balance"
                        fullWidth
                        onBlur={handleBlur}
                        onChange={handleChange}
                        type="text"
                        size="small"
                        value={values.total_balance}
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
