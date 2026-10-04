import React, { useEffect, useState } from "react";
import LayoutContainer from "../../components/reusableComponents/LayoutContainer";
import {
  Backdrop,
  Box,
  Button,
  CircularProgress,
  FormControlLabel,
  Grid,
  makeStyles,
  Paper,
  Radio,
  Typography,
  useMediaQuery,
} from "@material-ui/core";
import { useParams, useHistory } from "react-router-dom";
import jwt_decode from "jwt-decode";
import { useDispatch, useSelector } from "react-redux";
import { Image } from "semantic-ui-react";
import { theme } from "../../App";

import CustomTextfield from "../../components/reusableComponents/GateInTextField";
import ReactTable from "react-table-v6";
import "react-table-v6/react-table.css";
import { Stack } from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";

import { handleDateChangeUTILSCreditNoteDispatch } from "../../utils/WeekNumbre";
import { BILLING_CREDIT_NOTE_REDUCER } from "../../reducers/BillingCreditNoteReducer";
import {
  KeyboardDatePicker,
  MuiPickersUtilsProvider,
} from "@material-ui/pickers";
import DateFnsUtils from "@date-io/date-fns";
import { useSnackbar } from "notistack";
import {
  fetchCreditNoteByPKAction,
  printCreditNotesInvoice,
  saveCreditNoteByInvoiceAction,
} from "../../actions/BillingCreditNoteAction";

const useStyles = makeStyles((theme) => ({
  mainContainer: {
    position: "relative",
    marginBottom: 100,
    [theme.breakpoints.down("md")]:{
      paddingTop:12,
      paddingBottom:240
    }
  },
  backdrop: {
    zIndex: theme.zIndex.drawer + 1,
    color: "#fff",
  },
  backImage: {
    height: 40,
    width: 40,
    marginBottom: 15,
    cursor: "pointer",
  },
  heading: {
    fontWeight: 700,
    paddingTop: 20,
    paddingBottom: 20,
    backgroundColor: "#243545",
    color: "#FFF",
    paddingLeft: 14,
    borderRadius: 8,
    [theme.breakpoints.down('md')]:{
      paddingTop:4,
      paddingBottom:4,
      width:"100%"
    }
  },
  input: {
    padding: 7,
  },
  LabelTypography: {
    fontSize: 14,
    fontWeight: 600,
    color: "#243545",
    paddingBottom: 4,
    [theme.breakpoints.down("sm")]: {
      paddingBottom: 1,
    },
  },
  container: {
    padding: "24px 12px",
  },
}));

const Columns = [
  {
    Header: <b style={{ color: "#2A5FA5" }}>Container No</b>,
    accessor: "container_no",
    style: {
      textAlign: "center",
    },
  },
  {
    Header: <b style={{ color: "#2A5FA5" }}>Bill Type</b>,
    accessor: "bill_type",
    style: {
      textAlign: "center",
    },
  },
  {
    Header: <b style={{ color: "#2A5FA5" }}>Amount</b>,
    accessor: "amount",
    style: {
      textAlign: "center",
    },
  },
];

const BillingCreditNotesInvoice = (props) => {
  const { pk } = useParams();
  const history = useHistory();
  const classes = useStyles();
  const dispatch = useDispatch();
  const notify = useSnackbar().enqueueSnackbar;
  const [isEditing, setIsEditing] = useState(true);
  const { ui, BillingCreditNoteReducer } = useSelector((state) => state);
  const { creditNoteInvoice } = BillingCreditNoteReducer;
  const matchesIphone = useMediaQuery("(max-width:500px)");

  useEffect(() => {
    var token = localStorage.getItem("accessToken");
    if (token) {
      var decode = jwt_decode(token);
      if (decode.exp < new Date().getTime() / 1000) {
        history.push("/login");
      }
      if (!pk) {
        history.replace("/billing/credit-notes");
      } else {
        if (pk !== "create") {
          dispatch(fetchCreditNoteByPKAction(pk, notify));
        }
      }
    } else {
      history.push("/login");
    }
  }, []);

  useEffect(() => {
    if (pk === "create") {
      setIsEditing(true);
    } else {
      setIsEditing(false);
    }
  }, [pk]);

  const handleGoBack = () => {
    history.goBack();
  };

  const handleSaveCreditInvoice = () => {
    if (
      creditNoteInvoice.data.credit_note_date === "" ||
      creditNoteInvoice.data.credit_note_date === null
    ) {
      notify("Please select a credit note date", { variant: "warning" });
    } else if (
      creditNoteInvoice.data.credit_note_no === "" ||
      creditNoteInvoice.data.credit_note_no === "00000"
    ) {
      notify("Please select a credit note number", { variant: "warning" });
    } else {
      dispatch(saveCreditNoteByInvoiceAction(history, notify));
    }
  };

  const handlePrintInvoice =()=>{
    dispatch(printCreditNotesInvoice(pk,notify))
  }

  return (
    <LayoutContainer>
      <Grid container spacing={2} className={classes.mainContainer}>
        <Grid item sm={12} >
          <Image
            src={require("../../assets/images/back-arrow.png")}
            className={classes.backImage}
            onClick={handleGoBack}
          />
        </Grid>
        <Grid item sm={12} className={classes.heading}>
          <Typography variant="body1">Credit Note Details</Typography>
        </Grid>
        <Grid item sm={12} component={Paper} elevation={0}>
          <Grid container spacing={2} className={classes.container}>
            <Grid
              item
              xs={12}
              sm={3}
              lg={3}
              style={theme.breakpoints.down("sm") && { padding: 7 }}
            >
              <Typography
                variant="subtitle1"
                className={classes.LabelTypography}
              >
                Reference Booking No.
              </Typography>
            </Grid>

            <Grid
              item
              xs={12}
              sm={3}
              lg={3}
              style={theme.breakpoints.down("sm") && { padding: 7 }}
            >
              <CustomTextfield
                value={creditNoteInvoice.data.ref_booking_no}
                readOnlyP={true}
              />
            </Grid>

            <Grid
              item
              xs={12}
              sm={3}
              lg={3}
              style={theme.breakpoints.down("sm") && { padding: 7 }}
            >
              <Typography
                variant="subtitle1"
                className={classes.LabelTypography}
              >
                Reference BL No.
              </Typography>
            </Grid>

            <Grid
              item
              xs={12}
              sm={3}
              lg={3}
              style={theme.breakpoints.down("sm") && { padding: 7 }}
            >
              <CustomTextfield
                value={creditNoteInvoice.data.ref_bl_no}
                readOnlyP={true}
              />
            </Grid>

            <Grid
              item
              xs={12}
              sm={3}
              lg={3}
              style={theme.breakpoints.down("sm") && { padding: 7 }}
            >
              <Typography
                variant="subtitle1"
                className={classes.LabelTypography}
              >
                HSN code
              </Typography>
            </Grid>

            <Grid
              item
              xs={12}
              sm={3}
              lg={3}
              style={theme.breakpoints.down("sm") && { padding: 7 }}
            >
              <CustomTextfield
                value={creditNoteInvoice.data.hsn_code}
                readOnlyP={true}
              />
            </Grid>

            <Grid
              item
              xs={12}
              sm={3}
              lg={3}
              style={theme.breakpoints.down("sm") && { padding: 7 }}
            >
              <Typography
                variant="subtitle1"
                className={classes.LabelTypography}
              >
                Client Name
              </Typography>
            </Grid>

            <Grid
              item
              xs={12}
              sm={3}
              lg={3}
              style={theme.breakpoints.down("sm") && { padding: 7 }}
            >
              <CustomTextfield
                value={creditNoteInvoice.data.main_client}
                readOnlyP={true}
              />
            </Grid>

            <Grid
              item
              xs={12}
              sm={3}
              lg={3}
              style={theme.breakpoints.down("sm") && { padding: 7 }}
            >
              <Typography
                variant="subtitle1"
                className={classes.LabelTypography}
              >
                Credit Note Date <span style={{ color: "red" }}>*</span>
              </Typography>
            </Grid>
            <Grid
              item
              xs={12}
              sm={3}
              lg={3}
              style={theme.breakpoints.down("sm") && { padding: 7 }}
            >
              {isEditing ? (
                <MuiPickersUtilsProvider utils={DateFnsUtils}>
                  <KeyboardDatePicker
                    variant="inline"
                    format="dd/mm/yyyy"
                    autoOk={true}
                    inputVariant="outlined"
                    value={
                      creditNoteInvoice.data?.credit_note_date
                        ? creditNoteInvoice.data?.credit_note_date
                            ?.split("/")
                            .reverse()
                            .join("-")
                        : null
                    }
                    emptyLabel=""
                    onChange={(date) =>
                      handleDateChangeUTILSCreditNoteDispatch(
                        date,
                        dispatch,
                        BILLING_CREDIT_NOTE_REDUCER.CREDIT_NOTE_INVOICE_EDIT_DATE
                      )
                    }
                    KeyboardButtonProps={{
                      "aria-label": "change date",
                    }}
                    className={classes.textField}
                    inputProps={{ className: classes.input }}
                  />
                </MuiPickersUtilsProvider>
              ) : (
                <CustomTextfield
                  value={creditNoteInvoice.data.credit_note_date}
                  readOnlyP={true}
                />
              )}
            </Grid>
            <Grid
              item
              xs={12}
              sm={3}
              lg={3}
              style={theme.breakpoints.down("sm") && { padding: 7 }}
            >
              <Typography
                variant="subtitle1"
                className={classes.LabelTypography}
              >
                Credit Note Number <span style={{ color: "red" }}>*</span>
              </Typography>
            </Grid>
            <Grid item xs={12} sm={3} lg={3} style={{ display: "flex" }}>
              <CustomTextfield
                id="client-invoice-number-label"
                value={creditNoteInvoice.data.credit_note_label}
                readOnlyP={true}
              />
              <CustomTextfield
                id="client-invoice-number"
                handleChange={(e) =>
                  dispatch({
                    type: BILLING_CREDIT_NOTE_REDUCER.CREDIT_NOTE_INVOICE_EDIT_NUMBER,
                    payload: e.target.value,
                  })
                }
                value={creditNoteInvoice.data.credit_note_no}
                readOnlyP={!isEditing}
              />
            </Grid>
            <Grid
              item
              xs={12}
              sm={3}
              lg={3}
              style={theme.breakpoints.down("sm") && { padding: 7 }}
            >
              <Typography
                variant="subtitle1"
                className={classes.LabelTypography}
              >
                Bill Type
              </Typography>
            </Grid>
            <Grid
              item
              xs={12}
              sm={3}
              lg={3}
              style={theme.breakpoints.down("sm") && { padding: 7 }}
            >
              <CustomTextfield
                value={creditNoteInvoice.data.bill_type}
                readOnlyP={true}
              />
            </Grid>
            <Grid
              item
              xs={12}
              sm={3}
              lg={3}
              style={theme.breakpoints.down("sm") && { padding: 7 }}
            >
              <Typography
                variant="subtitle1"
                className={classes.LabelTypography}
              >
                Location
              </Typography>
            </Grid>

            <Grid
              item
              xs={12}
              sm={3}
              lg={3}
              style={theme.breakpoints.down("sm") && { padding: 7 }}
            >
              <CustomTextfield
                value={creditNoteInvoice.data.location}
                readOnlyP={true}
              />
            </Grid>

            <Grid
              item
              xs={12}
              sm={3}
              lg={3}
              style={theme.breakpoints.down("sm") && { padding: 7 }}
            >
              <Typography
                variant="subtitle1"
                className={classes.LabelTypography}
              >
                Site
              </Typography>
            </Grid>

            <Grid
              item
              xs={12}
              sm={3}
              lg={3}
              style={theme.breakpoints.down("sm") && { padding: 7 }}
            >
              <CustomTextfield
                value={creditNoteInvoice.data.site}
                readOnlyP={true}
              />
            </Grid>
            <Grid
              item
              xs={12}
              sm={3}
              lg={3}
              style={theme.breakpoints.down("sm") && { padding: 7 }}
            >
              <Typography
                variant="subtitle1"
                className={classes.LabelTypography}
              >
                Place of Supply
              </Typography>
            </Grid>
            <Grid
              item
              xs={12}
              sm={3}
              lg={3}
              style={theme.breakpoints.down("sm") && { padding: 7 }}
            >
              <CustomTextfield
                value={creditNoteInvoice.data.place_of_supply}
                readOnlyP={true}
              />
            </Grid>
            <Grid
              item
              xs={12}
              sm={3}
              lg={3}
              style={theme.breakpoints.down("sm") && { padding: 7 }}
            >
              <Typography
                variant="subtitle1"
                className={classes.LabelTypography}
              >
                Supply Date
              </Typography>
            </Grid>
            <Grid
              item
              xs={12}
              sm={3}
              lg={3}
              style={theme.breakpoints.down("sm") && { padding: 7 }}
            >
              <CustomTextfield
                value={creditNoteInvoice.data.supply_date}
                readOnlyP={true}
              />
            </Grid>
            <Grid
              item
              xs={12}
              sm={6}
              lg={4}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Typography variant="subtitle2">
                Apply IGST <span style={{ color: "red" }}>*</span>{" "}
              </Typography>
              <FormControlLabel
                value={"yes"}
                control={
                  <Radio
                    style={{ color: "#2A5FA5" }}
                    checked={creditNoteInvoice.data.apply_igst === true}
                    disabled
                  />
                }
                label="Yes"
              />
              <FormControlLabel
                value="no"
                control={
                  <Radio
                    style={{ color: "#2A5FA5" }}
                    checked={creditNoteInvoice.data.apply_igst === false}
                    disabled
                  />
                }
                label="No"
              />
            </Grid>

            <Grid
              item
              xs={12}
              sm={3}
              lg={3}
              style={theme.breakpoints.down("sm") && { padding: 7 }}
            >
              <Typography
                variant="subtitle1"
                className={classes.LabelTypography}
              >
                Bill Client
              </Typography>
            </Grid>

            <Grid
              item
              xs={12}
              sm={3}
              lg={3}
              style={theme.breakpoints.down("sm") && { padding: 7 }}
            >
              <CustomTextfield
                value={creditNoteInvoice.data.bill_to_party_client}
                readOnlyP={true}
              />
            </Grid>

            <Grid
              item
              xs={12}
              sm={3}
              lg={3}
              style={theme.breakpoints.down("sm") && { padding: 7 }}
            >
              <Typography
                variant="subtitle1"
                className={classes.LabelTypography}
              >
                Shipping Client
              </Typography>
            </Grid>

            <Grid
              item
              xs={12}
              sm={3}
              lg={3}
              style={theme.breakpoints.down("sm") && { padding: 7 }}
            >
              <CustomTextfield
                value={creditNoteInvoice.data.ship_to_party_client}
                readOnlyP={true}
              />
            </Grid>
            <Grid sm={12} style={{ marginTop: 24, marginBottom: 24 }}>
              <ReactTable
                data={creditNoteInvoice.data.credit_note_lines || []}
                showPagination={false}
                defaultPageSize={
                  creditNoteInvoice.data.credit_note_lines?.length || 1
                }
                pageSize={creditNoteInvoice.data.credit_note_lines?.length || 1}
                columns={[...Columns]}
                collapseOnDataChange={false}
                style={{
                  minHeight: "150px",
                  paddingBottom: 30,
                }}
              />
            </Grid>
            <Grid
              item
              xs={12}
              sm={1}
              lg={1}
              style={theme.breakpoints.down("sm") && { padding: 7 }}
            >
              <Typography
                variant="subtitle1"
                className={classes.LabelTypography}
              >
                Discount %
              </Typography>
            </Grid>
            <Grid
              item
              xs={12}
              sm={2}
              lg={2}
              style={theme.breakpoints.down("sm") && { padding: 7 }}
            >
              <CustomTextfield
                value={creditNoteInvoice.data.discount}
                readOnlyP={true}
              />
            </Grid>
            <Grid
              item
              xs={12}
              sm={2}
              lg={2}
              style={theme.breakpoints.down("sm") && { padding: 7 }}
            >
              <Typography
                variant="subtitle1"
                className={classes.LabelTypography}
              >
                Total Amount <span style={{ color: "red" }}>*</span>
              </Typography>
            </Grid>
            <Grid
              item
              xs={12}
              sm={3}
              lg={3}
              style={theme.breakpoints.down("sm") && { padding: 7 }}
            >
              <CustomTextfield
                value={creditNoteInvoice.data.total_amount}
                readOnlyP={true}
              />
            </Grid>
            <Grid
              item
              xs={12}
              sm={1}
              lg={1}
              style={theme.breakpoints.down("sm") && { padding: 7 }}
            >
              <Typography
                variant="subtitle1"
                className={classes.LabelTypography}
              >
                Remarks
              </Typography>
            </Grid>
            <Grid
              item
              xs={12}
              sm={3}
              lg={3}
              style={theme.breakpoints.down("sm") && { padding: 7 }}
            >
              <CustomTextfield
                id="client-handling-remark"
                value={creditNoteInvoice.data.remark}
                isRemark={true}
                handleChange={(e)=>dispatch({type:BILLING_CREDIT_NOTE_REDUCER.CREDIT_NOTE_INVOICE_EDIT_REMARK,payload:e.target.value})}
              />
            </Grid>
          </Grid>
        </Grid>
        <Box
          zIndex={10}
          position={"fixed"}
          width={ui.drawerOpen ? "76.5%" :( matchesIphone ?"100%": "92.5%")}
          bottom={5}
          borderRadius={8}
          component={Paper}
          paddingY={2}
          paddingX={matchesIphone ?10: 40}
          elevation={0}
          boxShadow={
            " rgba(9, 30, 66, 0.25) 0px 1px 1px, rgba(9, 30, 66, 0.13) 0px 0px 1px 1px"
          }
        >
          <Stack
            spacing={4}
            direction={"row"}
            alignItems={"center"}
            justifyContent={"center"}
          >
            {isEditing && (
              <Button
                startIcon={<SaveIcon />}
                variant="contained"
                color="primary"
                style={{ width: "200px" }}
                onClick={handleSaveCreditInvoice}
              >
                Save
              </Button>
            )}
            {!isEditing && (
              <Button
                startIcon={<PictureAsPdfIcon />}
                variant="contained"
                color="primary"
                style={{ width: "200px" }}
                onClick={handlePrintInvoice}
              >
                Print
              </Button>
            )}
          </Stack>
        </Box>
      </Grid>
      <Backdrop className={classes.backdrop} open={creditNoteInvoice.loading}>
        <CircularProgress color="inherit" />
      </Backdrop>
    </LayoutContainer>
  );
};

export default BillingCreditNotesInvoice;
