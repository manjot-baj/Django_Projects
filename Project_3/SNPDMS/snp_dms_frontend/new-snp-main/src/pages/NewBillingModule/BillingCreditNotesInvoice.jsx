import React, { useEffect, useState } from "react";
import LayoutContainer from "@components/reusablecomponents/LayoutContainer";
import {
  Backdrop,
  Button,
  CircularProgress,
  FormControlLabel,
  Grid,
  Paper,
  Radio,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { useParams, useHistory } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { useDispatch, useSelector } from "react-redux";
import { theme } from "../../App";

import CustomTextfield from "@components/reusablecomponents/GateInTextField";
import ReactTable from "react-table-v6";
import "react-table-v6/react-table.css";
import SaveIcon from "@mui/icons-material/Save";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";

import { handleDateChangeUTILSCreditNoteDispatch } from "../../utils/WeekNumbre";
import { BILLING_CREDIT_NOTE_REDUCER } from "../../reducers/BillingCreditNoteReducer";

import { useSnackbar } from "notistack";
import {
  fetchCreditNoteByPKAction,
  printCreditNotesInvoice,
  saveCreditNoteByInvoiceAction,
} from "../../actions/BillingCreditNoteAction";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers";
import dayjs from "dayjs";
import {
  custombackDropStyle,
  customLabelTypography,
} from "../../utils/CustomClasses";
import CustomBackButton from "@components/reusablecomponents/CustomBackButton";
import { TableFootercontainer } from "@/components/TableComponent/TableComponent";

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
  const dispatch = useDispatch();
  const notify = useSnackbar().enqueueSnackbar;
  const [isEditing, setIsEditing] = useState(true);
  const { BillingCreditNoteReducer, user } = useSelector((state) => state);
  const { creditNoteInvoice } = BillingCreditNoteReducer;

  useEffect(() => {
    var token = localStorage.getItem("accessToken");
    if (token) {
      var decode = jwtDecode(token);
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
      creditNoteInvoice.data.credit_note_no === "0000" || creditNoteInvoice.data.credit_note_no?.length < 4
    ) {
      notify("Please Enter a 4 digit Credit Note Number", { variant: "warning" });
    } else {
      dispatch(saveCreditNoteByInvoiceAction(history, notify));
    }
  };

  const handlePrintInvoice = () => {
    dispatch(printCreditNotesInvoice(pk, notify));
  };

  return (
    <LayoutContainer>
      <Grid
        container
        spacing={2}
        sx={(theme) => ({
          position: "relative",
          marginBottom: 12,
          [theme.breakpoints.down("md")]: {
            paddingTop: 2,
            paddingBottom: 12,
          },
        })}
      >
        <Grid item sm={12}>
          <CustomBackButton handleGoBack={handleGoBack} />
        </Grid>
        <Grid
          item
          sm={12}
          sx={(theme) => ({
            fontWeight: 700,
            paddingTop: 2,
            paddingBottom: 2,
            backgroundColor: theme.palette.secondary.main,
            color: "#FFF",
            width: "100%",
            paddingLeft: 14,
            borderRadius: 2,
            [theme.breakpoints.down("md")]: {
              paddingTop: 2,
              paddingBottom: 2,
              width: "100%",
            },
          })}
        >
          <Typography variant="body1">Credit Note Details</Typography>
        </Grid>
        <Grid item size={{ sm: 12 }} component={Paper} elevation={0}>
          <Grid
            container
            sx={{
              padding: "24px 12px",
            }}
          >
            <Grid
              item
              size={{ xs: 12, sm: 3, lg: 3 }}
              style={theme.breakpoints.down("sm") && { padding: 7 }}
            >
              <Typography variant="subtitle1" sx={customLabelTypography}>
                Reference Booking No.
              </Typography>
            </Grid>

            <Grid
              item
              size={{ xs: 12, sm: 3, lg: 3 }}
              style={theme.breakpoints.down("sm") && { padding: 7 }}
            >
              <CustomTextfield
                value={creditNoteInvoice.data.ref_booking_no}
                readOnlyP={true}
              />
            </Grid>

            <Grid
              item
              size={{ xs: 12, sm: 3, lg: 3 }}
              style={theme.breakpoints.down("sm") && { padding: 7 }}
            >
              <Typography variant="subtitle1" sx={customLabelTypography}>
                Reference BL No.
              </Typography>
            </Grid>

            <Grid
              item
              size={{ xs: 12, sm: 3, lg: 3 }}
              style={theme.breakpoints.down("sm") && { padding: 7 }}
            >
              <CustomTextfield
                value={creditNoteInvoice.data.ref_bl_no}
                readOnlyP={true}
              />
            </Grid>

            <Grid
              item
              size={{ xs: 12, sm: 3, lg: 3 }}
              style={theme.breakpoints.down("sm") && { padding: 7 }}
            >
              <Typography variant="subtitle1" sx={customLabelTypography}>
                HSN code
              </Typography>
            </Grid>

            <Grid
              item
              size={{ xs: 12, sm: 3, lg: 3 }}
              style={theme.breakpoints.down("sm") && { padding: 7 }}
            >
              <CustomTextfield
                value={creditNoteInvoice.data.hsn_code}
                readOnlyP={true}
              />
            </Grid>

            <Grid
              item
              size={{ xs: 12, sm: 3, lg: 3 }}
              style={theme.breakpoints.down("sm") && { padding: 7 }}
            >
              <Typography variant="subtitle1" sx={customLabelTypography}>
                Client Name
              </Typography>
            </Grid>

            <Grid
              item
              size={{ xs: 12, sm: 3, lg: 3 }}
              style={theme.breakpoints.down("sm") && { padding: 7 }}
            >
              <CustomTextfield
                value={creditNoteInvoice.data.main_client}
                readOnlyP={true}
              />
            </Grid>

            <Grid
              item
              size={{ xs: 12, sm: 3, lg: 3 }}
              style={theme.breakpoints.down("sm") && { padding: 7 }}
            >
              <Typography variant="subtitle1" sx={customLabelTypography}>
                Credit Note Date <span style={{ color: "red" }}>*</span>
              </Typography>
            </Grid>
            <Grid
              item
              size={{ xs: 12, sm: 3, lg: 3 }}
              style={theme.breakpoints.down("sm") && { padding: 7 }}
            >
              {isEditing ? (
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    slotProps={{ textField: { size: "small" } }}
                    format="YYYY/MM/DD"
                    id={`-date-picker-inline`}
                    value={
                      creditNoteInvoice.data?.credit_note_date
                        ? dayjs(
                            creditNoteInvoice.data?.credit_note_date
                              ?.split("/")
                              .reverse()
                              .join("-"),
                          )
                        : null
                    }
                    name="from_date"
                    onChange={(date) =>
                      handleDateChangeUTILSCreditNoteDispatch(
                        date,
                        dispatch,
                        BILLING_CREDIT_NOTE_REDUCER.CREDIT_NOTE_INVOICE_EDIT_DATE,
                      )
                    }
                  />
                </LocalizationProvider>
              ) : (
                <CustomTextfield
                  value={creditNoteInvoice.data.credit_note_date}
                  readOnlyP={true}
                />
              )}
            </Grid>
            <Grid
              item
              size={{ xs: 12, sm: 3, lg: 3 }}
              style={theme.breakpoints.down("sm") && { padding: 7 }}
            >
              <Typography variant="subtitle1" sx={customLabelTypography}>
                Credit Note Number <span style={{ color: "red" }}>*</span>
              </Typography>
            </Grid>
            <Grid
              item
              size={{ xs: 12, sm: 3, lg: 3 }}
              style={{ display: "flex" }}
            >
              <CustomTextfield
                id="client-invoice-number-label"
                value={creditNoteInvoice.data.credit_note_label}
                readOnlyP={true}
              />
              <CustomTextfield
                type={"number"}
                id="client-invoice-number"
                handleChange={(e) => {
                  if (e.target.value?.trim()?.length > 4) {
                    notify("Please Enter Only 4 digit Credit Note Number ",{variant:"warning"})
                    return
                  }
                  dispatch({
                    type: BILLING_CREDIT_NOTE_REDUCER.CREDIT_NOTE_INVOICE_EDIT_NUMBER,
                    payload: e.target.value,
                  });
                }}
              
                value={creditNoteInvoice.data.credit_note_no}
                readOnlyP={!isEditing}
              />
            </Grid>
            <Grid
              item
              size={{ xs: 12, sm: 3, lg: 3 }}
              style={theme.breakpoints.down("sm") && { padding: 7 }}
            >
              <Typography variant="subtitle1" sx={customLabelTypography}>
                Bill Type
              </Typography>
            </Grid>
            <Grid
              item
              size={{ xs: 12, sm: 3, lg: 3 }}
              style={theme.breakpoints.down("sm") && { padding: 7 }}
            >
              <CustomTextfield
                value={creditNoteInvoice.data.bill_type}
                readOnlyP={true}
              />
            </Grid>
            <Grid
              item
              size={{ xs: 12, sm: 3, lg: 3 }}
              style={theme.breakpoints.down("sm") && { padding: 7 }}
            >
              <Typography variant="subtitle1" sx={customLabelTypography}>
                Location
              </Typography>
            </Grid>

            <Grid
              item
              size={{ xs: 12, sm: 3, lg: 3 }}
              style={theme.breakpoints.down("sm") && { padding: 7 }}
            >
              <CustomTextfield
                value={creditNoteInvoice.data.location}
                readOnlyP={true}
              />
            </Grid>

            <Grid
              item
              size={{ xs: 12, sm: 3, lg: 3 }}
              style={theme.breakpoints.down("sm") && { padding: 7 }}
            >
              <Typography variant="subtitle1" sx={customLabelTypography}>
                Site
              </Typography>
            </Grid>

            <Grid
              item
              size={{ xs: 12, sm: 3, lg: 3 }}
              style={theme.breakpoints.down("sm") && { padding: 7 }}
            >
              <CustomTextfield
                value={creditNoteInvoice.data.site}
                readOnlyP={true}
              />
            </Grid>
            <Grid
              item
              size={{ xs: 12, sm: 3, lg: 3 }}
              style={theme.breakpoints.down("sm") && { padding: 7 }}
            >
              <Typography variant="subtitle1" sx={customLabelTypography}>
                Place of Supply
              </Typography>
            </Grid>
            <Grid
              item
              size={{ xs: 12, sm: 3, lg: 3 }}
              style={theme.breakpoints.down("sm") && { padding: 7 }}
            >
              <CustomTextfield
                value={creditNoteInvoice.data.place_of_supply}
                readOnlyP={true}
              />
            </Grid>
            <Grid
              item
              size={{ xs: 12, sm: 3, lg: 3 }}
              style={theme.breakpoints.down("sm") && { padding: 7 }}
            >
              <Typography variant="subtitle1" sx={customLabelTypography}>
                Supply Date
              </Typography>
            </Grid>
            <Grid
              item
              size={{ xs: 12, sm: 3, lg: 3 }}
              style={theme.breakpoints.down("sm") && { padding: 7 }}
            >
              <CustomTextfield
                value={creditNoteInvoice.data.supply_date}
                readOnlyP={true}
              />
            </Grid>
            <Grid
              item
              size={{ xs: 12, sm: 6, lg: 4 }}
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
              size={{ xs: 12, sm: 3, lg: 3 }}
              style={theme.breakpoints.down("sm") && { padding: 7 }}
            >
              <Typography variant="subtitle1" sx={customLabelTypography}>
                Bill Client
              </Typography>
            </Grid>

            <Grid
              item
              size={{ xs: 12, sm: 3, lg: 3 }}
              style={theme.breakpoints.down("sm") && { padding: 7 }}
            >
              <CustomTextfield
                value={creditNoteInvoice.data.bill_to_party_client}
                readOnlyP={true}
              />
            </Grid>

            <Grid
              item
              size={{ xs: 12, sm: 3, lg: 3 }}
              style={theme.breakpoints.down("sm") && { padding: 7 }}
            >
              <Typography variant="subtitle1" sx={customLabelTypography}>
                Shipping Client
              </Typography>
            </Grid>

            <Grid
              item
              size={{ xs: 12, sm: 3, lg: 3 }}
              style={theme.breakpoints.down("sm") && { padding: 7 }}
            >
              <CustomTextfield
                value={creditNoteInvoice.data.ship_to_party_client}
                readOnlyP={true}
              />
            </Grid>
            <Grid size={{ sm: 12 }} style={{ marginTop: 24, marginBottom: 24 }}>
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
              size={{ xs: 12, sm: 1, lg: 1 }}
              style={theme.breakpoints.down("sm") && { padding: 7 }}
            >
              <Typography variant="subtitle1" sx={customLabelTypography}>
                Discount %
              </Typography>
            </Grid>
            <Grid
              item
              size={{ xs: 12, sm: 2, lg: 2 }}
              style={theme.breakpoints.down("sm") && { padding: 7 }}
            >
              <CustomTextfield
                value={creditNoteInvoice.data.discount}
                readOnlyP={true}
              />
            </Grid>
            <Grid
              item
              size={{ xs: 12, sm: 2, lg: 2 }}
              style={theme.breakpoints.down("sm") && { padding: 7 }}
            >
              <Typography variant="subtitle1" sx={customLabelTypography}>
                Total Amount <span style={{ color: "red" }}>*</span>
              </Typography>
            </Grid>
            <Grid
              item
              size={{ xs: 12, sm: 3, lg: 3 }}
              style={theme.breakpoints.down("sm") && { padding: 7 }}
            >
              <CustomTextfield
                value={creditNoteInvoice.data.total_amount}
                readOnlyP={true}
              />
            </Grid>
            <Grid
              item
              size={{ xs: 12, sm: 1, lg: 1 }}
              style={theme.breakpoints.down("sm") && { padding: 7 }}
            >
              <Typography variant="subtitle1" sx={customLabelTypography}>
                Remarks
              </Typography>
            </Grid>
            <Grid
              item
              size={{ xs: 12, sm: 3, lg: 3 }}
              style={theme.breakpoints.down("sm") && { padding: 7 }}
            >
              <CustomTextfield
                id="client-handling-remark"
                value={creditNoteInvoice.data.remark}
                isRemark={true}
                handleChange={(e) =>
                  dispatch({
                    type: BILLING_CREDIT_NOTE_REDUCER.CREDIT_NOTE_INVOICE_EDIT_REMARK,
                    payload: e.target.value,
                  })
                }
              />
            </Grid>
          </Grid>
        </Grid>
        <TableFootercontainer>
          {isEditing && (
            <Button
              startIcon={<SaveIcon />}
              variant="contained"
              color="primary"
              size="small"
              style={{ width: "200px", borderRadius: 24 }}
              onClick={handleSaveCreditInvoice}
            >
              Save
            </Button>
          )}
          {!isEditing && (
            <Button
              size="small"
              startIcon={<PictureAsPdfIcon />}
              variant="contained"
              color="primary"
              style={{ width: "200px", borderRadius: 24 }}
              onClick={handlePrintInvoice}
            >
              Print
            </Button>
          )}
        </TableFootercontainer>
      </Grid>
      <Backdrop sx={custombackDropStyle} open={creditNoteInvoice.loading}>
        <CircularProgress color="inherit" />
      </Backdrop>
    </LayoutContainer>
  );
};

export default BillingCreditNotesInvoice;
