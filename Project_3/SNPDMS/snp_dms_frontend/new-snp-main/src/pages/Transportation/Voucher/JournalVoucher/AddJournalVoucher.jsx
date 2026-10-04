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
  getJournalDetailsById,
  addJournal,
  updateJournal,
  clearJournalData,
  getJournalListing
} from "../../../../actions/transportation/JournalAction";
import { useHistory } from "react-router-dom";
import { useSnackbar } from "notistack";
import { dropDownDispatch } from "../../../../actions/GateInActions";
import ConfirmModal from "../../../../commomComponents/modal/confirmationModal";
import { getFormDependencyListing, getEntryNumberDependencyListing } from "../../../../actions/transportation/MasterActions";
import moment from "moment";



export default function AddJournalVoucher(props) {
  const dispatch = useDispatch();

  const store = useSelector((state) => state);
  const { gateIn } = store;
  const history = useHistory();
  const [paymentPk, setPaymentPk] = useState("");
  const [actionType, setActionType] = useState("");
  const [isOpenConfirmModal, setIsOpenConfirmModal] = useState(false);
  const notify = useSnackbar().enqueueSnackbar;
  // eslint-disable-next-line no-unused-vars
  const [stateData, setStateData] = useState(null);
  const masterList = useSelector((state) => state.masterReducer?.masterData);
  const entryNumberData = useSelector(
    (state) => state.masterReducer?.entryNumberList
  );
  const transaction_typeList = ["CREDIT", "DEBIT"];

  const journalDetails = useSelector(
    (state) => state.journalMaster.journalDetails
  );
  const transporterList = useSelector(
    (state) => state.masterReducer?.masterData?.transporter
  );
  const deleteJournal = useSelector((state) => state.journalMaster.deleteJournal);
  const [journalData, setJournalData] = useState({
    transaction: "",
    entry_no:"",
    entry_date: moment(new Date()).format("YYYY-MM-DD"),
    account_name: "",
    narration: "",
    amount: "0",
    under_account_name: "",
    location: localStorage.getItem("location")
      ? localStorage.getItem("location")
      : "",
    site: localStorage.getItem("site") ? localStorage.getItem("site") : "",
  });

  useEffect(() => {
    let url = window.location.pathname.split("/");
    if (url[url?.length - 1] !== "journalvoucher-form") {
      dispatch(getJournalDetailsById(url[url.length - 1]));
    }
    let reqArray = [
      "all_entity",
      "journal_voucher_data",
      "client_ref_codes",
      "location_site_dashboard_list",
    ];
    let reqBody = {
      field_list: ["journal_voucher_data", "all_entity"],
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
    if (journalDetails) {
      setJournalData(journalDetails);
    }
  }, [journalDetails]);

  useEffect(() => {
    if (transporterList) {
      setStateData(transporterList);
    }
  }, [transporterList]);

  function containsOnlyNumbers(str) {
    return /^\d+$/.test(str);
  }
  useEffect(() => {
    let url = window.location.pathname?.split("/");
    const propsUrl = url[url?.length - 1]
    if(!containsOnlyNumbers(propsUrl)){
      journalData["entry_no"] = entryNumberData?.journal_voucher_data?.entry_no;
    }
   
// eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entryNumberData]);

  const handleGoBack = () => {
    dispatch(clearJournalData());
    history.goBack();
  };
  var DialogMessage = "Are you sure you want to delete this Journal Voucher List?";
  useEffect(() => {
    if (deleteJournal) {
      let journalData = {
        transaction: "",
        entry_no:"",
        entry_date: moment(new Date()).format("YYYY-MM-DD"),
        account_name: "",
        narration: "",
        amount: "0",
        under_account_name: "",
        location: localStorage.getItem("location")
          ? localStorage.getItem("location")
          : "",
        site: localStorage.getItem("site") ? localStorage.getItem("site") : "",
      };
      dispatch(getJournalListing(journalData));
      closeConfirmModal();
    }
   
// eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deleteJournal]);

  const openResponseModal = (type, pk) => {
    setPaymentPk(pk);
    setActionType(type);
    setIsOpenConfirmModal(true);
    DialogMessage = "Are you sure you want to delete this Journal Voucher List?";
  };
  const actionProcess = () => {
    let deleteArray = [];
    if (actionType === "delete") {
      deleteArray.push(paymentPk);
      dispatch(updateJournal(deleteArray, notify));
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
      <CardHeader title={`${journalData.pk ? "" : "Create"} Journals Voucher`} />
      <CardContent>
      <Formik
          initialValues={journalData}
          enableReinitialize={true}
          validationSchema={Yup.object().shape({
            location: Yup.string().required("Location is Required"),
            site: Yup.string().required("Site is Required"),
            amount: Yup.string().required("Amount is Required"),
          })}
          onSubmit={async (values) => {
            try {
              if (values.pk) {
                await dispatch(updateJournal(values, history, notify));
              } else {
                await dispatch(addJournal(values, history, notify));
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
                <Grid item size={{xs:12,lg:3}}>
                  <Typography variant="subtitle1">
                    Entry Number
                  </Typography>
          
                  <TextField
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
                    Entry Date <span style={{ color: "red" }}>*</span>{" "}
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
                    Account Name <span style={{ color: "red" }}>*</span>
                  </Typography>
                  <TextField
                    error={Boolean(
                      touched?.account_name && errors?.account_name
                    )}
                    helperText={touched?.account_name && errors?.account_name}
                    placeholder="Account Name"
                    select
                    margin="none"
                    name="account_name"
                    inputProps={{ maxLength: 10 }}
                    fullWidth
                    onBlur={handleBlur}
                    onChange={(e) => {
                      handleChange("account_name")(e);
                    }}
                    type="text"
                    size="small"
                    value={values.account_name}
                    variant="outlined"
                  >
                    {masterList?.all_entity?.map((option) => (
                      <MenuItem key={option} value={option}>
                        {option}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>

                <Grid item size={{xs:12,lg:3}}>
                  <Typography variant="subtitle1">
                    Under Account Name
                  </Typography>
                  <TextField
                    error={Boolean(
                      touched?.under_account_name && errors?.under_account_name
                    )}
                    helperText={
                      touched?.under_account_name && errors?.under_account_name
                    }
                    placeholder="Under Account Name"
                    select
                    margin="none"
                    name="under_account_name"
                    fullWidth
                    onBlur={handleBlur}
                    onChange={(e) => {
                      handleChange("under_account_name")(e);
                    }}
                    type="text"
                    size="small"
                    value={values.under_account_name}
                    variant="outlined"
                  >
                    {masterList?.all_entity?.map((option) => (
                      <MenuItem key={option} value={option}>
                        {option}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={12} lg={9}>
                  <Typography variant="subtitle1">Narration</Typography>
                  <TextField
                 
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
                  <Typography variant="subtitle1">Amount <span style={{ color: "red" }}>*</span></Typography>
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
                <Grid item size={{xs:12,lg:3}}>
                  <Typography variant="subtitle1">
                    {" "}
                    Transaction <span style={{ color: "red" }}>*</span>{" "}
                  </Typography>
                  <TextField
                    error={Boolean(touched.transaction && errors.transaction)}
                    helperText={touched.transaction && errors.transaction}
                    select
                    placeholder="Transaction"
                    margin="none"
                    autoComplete="off"
                    name="transaction"
                    fullWidth
                    onBlur={handleBlur}
                    onChange={handleChange}
                    type="text"
                    size="small"
                    value={values.transaction}
                    variant="outlined"
                  >
                    {transaction_typeList.map((option) => (
                      <MenuItem key={option} value={option}>
                        {option}
                      </MenuItem>
                    ))}
                  </TextField>
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
