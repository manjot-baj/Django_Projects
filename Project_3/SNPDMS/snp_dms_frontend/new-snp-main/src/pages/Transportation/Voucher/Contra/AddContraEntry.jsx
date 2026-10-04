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
import { Formik } from "formik";
import * as Yup from "yup";
import {
  getContraDetailsById,
  addContra,
  updateContra,
  clearContraData,
  deleteContraData,
  getContraListing,
} from "../../../../actions/transportation/ContraAction";
import { useHistory } from "react-router-dom";
import { useSnackbar } from "notistack";
import { dropDownDispatch } from "../../../../actions/GateInActions";
import { getFormDependencyListing, getEntryNumberDependencyListing } from "../../../../actions/transportation/MasterActions";
import ConfirmModal from "../../../../commomComponents/modal/confirmationModal";
import moment from "moment";


export default function AddContraEntry(props) {
  const dispatch = useDispatch();
  const store = useSelector((state) => state);
  const { gateIn } = store;
  const history = useHistory();
  const notify = useSnackbar().enqueueSnackbar;
  const [paymentPk, setPaymentPk] = useState("");
  const [actionType, setActionType] = useState("");
  const [isOpenConfirmModal, setIsOpenConfirmModal] = useState(false);
  const masterList = useSelector((state) => state.masterReducer?.masterData);
  const entryNumberData = useSelector(
    (state) => state.masterReducer?.entryNumberList
  );
  const contraDetails = useSelector(
    (state) => state.contraMaster.contraDetails
  );
  const deleteContra = useSelector((state) => state.contraMaster.deleteContra);
  const [contraData, setContraData] = useState({
    entry_no: "",
    entry_date: moment(new Date()).format("YYYY-MM-DD"),
    account_debit: "",
    account_credit: "",
    narration: "",
    amount: "",
    location: localStorage.getItem("location")
      ? localStorage.getItem("location")
      : "",
    site: localStorage.getItem("site") ? localStorage.getItem("site") : "",
  });

  useEffect(() => {
    let url = window.location.pathname.split("/");
    if (url[url?.length - 1] !== "contraentry-form") {
      dispatch(getContraDetailsById(url[url.length - 1]));
    }
    let reqArray = [
      "account",
      "contra_entry_data",
      "client_ref_codes",
      "location_site_dashboard_list",
    ];
    let reqBody = {
      field_list: ["account" , "contra_entry_data"],
      location: localStorage.getItem("location")
        ? localStorage.getItem("location")
        : null,
      site: localStorage.getItem("site") ? localStorage.getItem("site") : null,
    };
    dispatch(dropDownDispatch(reqArray, notify));
    dispatch(getFormDependencyListing(reqBody));
    dispatch(getEntryNumberDependencyListing(reqBody));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (contraDetails) {
      setContraData(contraDetails);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contraDetails]);

  function containsOnlyNumbers(str) {
    return /^\d+$/.test(str);
  }
  useEffect(() => {
    let url = window.location.pathname?.split("/");
    const propsUrl = url[url?.length - 1]
    if(!containsOnlyNumbers(propsUrl)){
      contraData["entry_no"] = entryNumberData?.contra_entry_data?.entry_no;
    }

  }, [entryNumberData]);

  const handleGoBack = () => {
    dispatch(clearContraData());
    history.goBack();
  };
  var DialogMessage = "Are you sure you want to delete this Contra List?";
  useEffect(() => {
    if (deleteContra) {
      let contraData = {
        entry_no: "",
        entry_date: moment(new Date()).format("YYYY-MM-DD"),
        account_debit: "",
        account_credit: "",
        narration: "",
        amount: "",
        location: localStorage.getItem("location")
          ? localStorage.getItem("location")
          : "",
        site: localStorage.getItem("site") ? localStorage.getItem("site") : "",
      };
      dispatch(getContraListing(contraData));
      closeConfirmModal();
    }
    
 // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deleteContra]);

  const openResponseModal = (type, pk) => {
    setPaymentPk(pk);
    setActionType(type);
    setIsOpenConfirmModal(true);
    DialogMessage = "Are you sure you want to delete this Contra List?";
  };
  const actionProcess = () => {
    let deleteArray = [];
    if (actionType === "delete") {
      deleteArray.push(paymentPk);
      dispatch(deleteContraData(deleteArray, notify));
      closeConfirmModal();
      handleGoBack();
    }
  };
  const closeConfirmModal = () => {
    setIsOpenConfirmModal(false);
  };
  return (
    <Grid>
      <Card>
        <CardHeader title={`${contraData.pk ? "" : "Create"} Contra List`} />
        <CardContent>
          <Formik
            initialValues={contraData}
            enableReinitialize={true}
            validationSchema={Yup.object().shape({
              amount: Yup.string().required("Amount is required"),
              entry_date: Yup.string().required("Entry Date is required"),
              account_debit: Yup.string().required("Account Debit is required"),
              account_credit: Yup.string().required(
                "Account Credit is required"
              ),
              location: Yup.string().required("Location is Required"),
              site: Yup.string().required("Site is Required"),
            })}
            onSubmit={async (values) => {
              try {
                if (values.pk) {
                  await dispatch(updateContra(values, history, notify));
                } else {
                  await dispatch(addContra(values, history, notify));
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
                  <Grid item size={{xs:12,lg:3}} >
                    <Typography variant="subtitle1"> Entry Number</Typography>
               
                    <TextField
                      error={Boolean(touched.entry_no && errors.entry_no)}
                      helperText={touched.entry_no && errors.entry_no}
                      placeholder="Entry Number"
                      margin="none"
                      name="entry_no"
                      fullWidth
                      onBlur={handleBlur}
                      onChange={(e) => {
                        handleChange("entry_no")(e);
                      }}
                      type="text"
                      size="small"
                      value={values.entry_no}
                      variant="outlined"
                      disabled
                    />
                  </Grid>
                  <Grid item size={{xs:12,lg:3}}>
                    <Typography variant="subtitle1">
                      Entry Date <span style={{ color: "red" }}>*</span>
                    </Typography>
                    <TextField
                      error={Boolean(touched.entry_date && errors.entry_date)}
                      helperText={touched.entry_date && errors.entry_date}
                      placeholder="Entry Date"
                      margin="none"
                      name="entry_date"
                      fullWidth
                      onBlur={handleBlur}
                      onChange={handleChange}
                      type="date"
                      size="small"
                      value={values.entry_date}
                      variant="outlined"
                      date
                    />
                  </Grid>
                  <Grid item size={{xs:12,lg:3}}>
                    <Typography variant="subtitle1">
                      Account Debit <span style={{ color: "red" }}>*</span>
                    </Typography>
                    <TextField
                      error={Boolean(
                        touched?.account_debit && errors?.account_debit
                      )}
                      helperText={
                        touched?.account_debit && errors?.account_debit
                      }
                      placeholder="Account Debit"
                      select
                      margin="none"
                      name="account_debit"
                      inputProps={{ maxLength: 10 }}
                      fullWidth
                      onBlur={handleBlur}
                      onChange={(e) => {
                        handleChange("account_debit")(e);
                      }}
                      type="text"
                      size="small"
                      value={values?.account_debit}
                      variant="outlined"
                    >
                      {masterList?.account?.map((option) => (
                        <MenuItem key={option} value={option}>
                          {option}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>

                  <Grid item size={{xs:12,lg:3}}>
                    <Typography variant="subtitle1">
                      Account Credit <span style={{ color: "red" }}>*</span>
                    </Typography>
                    <TextField
                      error={Boolean(
                        touched.account_credit && errors.account_credit
                      )}
                      helperText={
                        touched.account_credit && errors.account_credit
                      }
                      placeholder="Account Credit"
                      select
                      margin="none"
                      name="account_credit"
                      fullWidth
                      onBlur={handleBlur}
                      onChange={(e) => {
                        handleChange("account_credit")(e);
                      }}
                      type="text"
                      size="small"
                      value={values.account_credit}
                      variant="outlined"
                    >
                      {masterList?.account?.map((option) => (
                        <MenuItem key={option} value={option}>
                          {option}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                  <Grid item size={{xs:12,lg:3}}>
                    <Typography variant="subtitle1">
                      Amount <span style={{ color: "red" }}>*</span>
                    </Typography>
                    <TextField
                      error={Boolean(touched.amount && errors.amount)}
                      helperText={touched.amount && errors.amount}
                      placeholder="Amount"
                      margin="none"
                      name="amount"
                      fullWidth
                      onBlur={handleBlur}
                      onChange={handleChange}
                      type="text"
                      size="small"
                      value={values.amount}
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item xs={12} lg={9}>
                    <Typography variant="subtitle1">Narration</Typography>
                    <TextField
                      error={Boolean(touched.narration && errors.narration)}
                      helperText={touched.narration && errors.narration}
                      placeholder="Narration"
                      margin="none"
                      name="narration"
                      fullWidth
                      onBlur={handleBlur}
                      onChange={handleChange}
                      type="text"
                      size="small"
                      value={values.narration}
                      variant="outlined"
                    />
                  </Grid>

                  <Grid item size={{xs:12,lg:3}}>
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
                  <Grid item size={{xs:12,lg:3}}>
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
                  {values.pk ? (
                    ""
                  ) : (
                    <Button
                      color="primary"
                      disabled={isSubmitting}
                      size="medium"
                      type="submit"
                      variant="outlined"
                      style={{ marginRight: "10px" }}
                    >
                      Save Details
                    </Button>
                  )}
                  {values.pk ? (
                    <Button
                      color="secondary"
                      size="medium"
                      type="button"
                      variant="outlined"
                      style={{ marginRight: "10px" }}
                      disabled={values.is_transaction_effected === true}
                      onClick={() => {
                        openResponseModal("delete", values?.pk);
                      }}
                    >
                      Delete
                    </Button>
                  ) : (
                    ""
                  )}
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
      {isOpenConfirmModal ? (
        <ConfirmModal
          isOpenConfirmModal={isOpenConfirmModal}
          message={DialogMessage}
          actionProcess={actionProcess}
          closeModal={closeConfirmModal}
        />
      ) : (
        ""
      )}
    </Grid>
  );
}
