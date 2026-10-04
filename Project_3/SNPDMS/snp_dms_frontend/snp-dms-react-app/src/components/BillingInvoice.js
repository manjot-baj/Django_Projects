import React, { useEffect, useState } from "react";

import {
  Grid,
  Button,
  makeStyles,
  Typography,
  Paper,
  Box,
  TextField,
  MenuItem,
  Checkbox,
  Fab,
} from "@material-ui/core";
import { useDispatch, useSelector } from "react-redux";
import LayoutContainer from "./reusableComponents/LayoutContainer";
import {
  saveInvoice,
  printInvoice,
  getStatement,
  getInvoiceHistoryByID,
  editInvoiceData,
} from "../actions/BillingActions";
import { useHistory } from "react-router-dom";
import { Image } from "semantic-ui-react";
import { useSnackbar } from "notistack";
import { dropDownDispatch } from "../actions/GateInActions";
import { theme } from "../App";
import CustomTextfield from "./reusableComponents/GateInTextField";
import DatePickerField from "./reusableComponents/DatePickerField";
import BillingInvoiceTabularData from "./BillingInvoiceTabularData";
import Add from "@material-ui/icons/AddCircle";
import Remove from "@material-ui/icons/Remove";
import Edit from "@material-ui/icons/Create";

const useStyles = makeStyles((theme) => ({
  button: {
    fontSize: 12.5,
    borderRadius: 6,
    width: "15%",
    margin: 15,
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
  paperContainer: {
    padding: theme.spacing(4, 3),
  },
  input: {
    padding: 7,
  },
  choiceSelectContainer: {
    border: "1px solid #243545",
    marginTop: "0rem",
    display: "flex",
    borderRadius: 6,
  },
  choice: {
    backgroundColor: "#fff",
    width: "100%",
    padding: 1,
  },
  selectedChoice: {
    borderRadius: 5,
    color: "#fff",
    backgroundColor: "#2F6FB7",
    width: "100%",
    padding: 1,
    "&:hover": {
      backgroundColor: "#2F6FB7",
    },
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
  autocomplete: {
    "& .MuiAutocomplete-inputRoot[class*='MuiOutlinedInput-root']": {
      padding: 0,
    },
  },
  fab: {
    // color: "#fff",
    cursor: "pointer",
    margin: 5,
    // backgroundColor: "#2A5FA5",
  },
  fabFlex: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  mainFlexButton: {
    display: "flex",
    justifyContent: "space-around",
    alignItems: "center",
  },
}));

export default function BillingInvoice(props) {
  const dispatch = useDispatch();
  const classes = useStyles();
  const store = useSelector((state) => state);
  const history = useHistory();
  const notify = useSnackbar().enqueueSnackbar;
  const { clientMaster, gateIn, billing } = store;
  const [invoiceHSNCode, setInvoiceHSNCode] = useState("");
  const [invoiceHandlingCharges, setInvoiceHandlingCharges] = useState("");
  const [invoiceDate, setInvoiceDate] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState("");
  // const [invoiceReverseCharge, setInvoiceReverseCharge] = useState("");
  const [invoiceLocation, setInvoiceLocation] = useState(
    localStorage.getItem("location") ? localStorage.getItem("location") : ""
  );
  const [invoiceSite, setInvoiceSite] = useState(
    localStorage.getItem("site") ? localStorage.getItem("site") : ""
  );
  const [invoiceRefBookingNo, setInvoiceRefBookingNo] = useState("");
  const [invoiceRefBLNo, setInvoiceRefBLNo] = useState("");
  const [invoiceMainClient, setInvoiceMainClient] = useState("");
  const [invoicePlaceOfSupply, setInvoicePlaceOfSupply] = useState("");
  const [invoiceSupplyDate, setInvoiceSupplyDate] = useState("");
  const [invoiceClient, setInvoiceClient] = useState("");
  const [invoiceAddress, setInvoiceAddress] = useState("");
  const [invoiceGSTNo, setInvoiceGSTNo] = useState("");
  const [invoiceState, setInvoiceState] = useState(
    localStorage.getItem("location") ? localStorage.getItem("location") : ""
  );
  const [invoiceStateCode, setInvoiceStateCode] = useState("");
  const [invoiceZipCode, setInvoiceZipCode] = useState("");
  const [invoiceShipperClient, setInvoiceShipperClient] = useState("");
  const [invoiceShipperAddress, setInvoiceShipperAddress] = useState("");
  const [invoiceShipperGSTNo, setInvoiceShipperGSTNo] = useState("");
  const [invoiceShipperState, setInvoiceShipperState] = useState(
    localStorage.getItem("location") ? localStorage.getItem("location") : ""
  );
  const [invoiceShipperStateCode, setInvoiceShipperStateCode] = useState("");
  const [invoiceShipperZipCode, setInvoiceShipperZipCode] = useState("");
  const [invoiceRemarks, setInvoiceRemarks] = useState("");
  const [invoiceLines, setInvoiceLines] = useState([]);
  const [sameAsBill, setSameAsBill] = useState(false);
  const [childClient, setChildClient] = useState([]);
  const [placeOfSupplyDD, setPlaceOfSupplyDD] = useState([]);
  const [addChild, setAddChild] = useState(false);
  const [addChildParty, setAddChildParty] = useState(false);

  const phone = window.innerWidth <= 380 || "orientation" in window;

  useEffect(() => {
    if (props.history.location.state.allDetails) {
      dispatch(
        getInvoiceHistoryByID(
          props.history.location.state.allDetails.pk,
          notify
        )
      );
    }
  }, []);

  useEffect(() => {
    if (billing.invoiceHistoryByID.length !== 0) {
      setInvoiceHSNCode(billing.invoiceHistoryByID.hsn_code);
      setInvoiceMainClient(billing.invoiceHistoryByID.main_client);
      setInvoiceHandlingCharges(billing.invoiceHistoryByID.charge_type);
      setInvoiceDate(
        billing.invoiceHistoryByID.invoice_date &&
          billing.invoiceHistoryByID.invoice_date.split("/").reverse().join("-")
      );
      setInvoiceNumber(billing.invoiceHistoryByID.invoice_no);
      setInvoiceLocation(billing.invoiceHistoryByID.location);
      setInvoiceSite(billing.invoiceHistoryByID.site);
      setInvoiceRefBookingNo(billing.invoiceHistoryByID.ref_booking_no);
      setInvoiceRefBLNo(billing.invoiceHistoryByID.ref_bl_no);
      setInvoicePlaceOfSupply(billing.invoiceHistoryByID.place_of_supply);
      setInvoiceSupplyDate(
        billing.invoiceHistoryByID.supply_date &&
          billing.invoiceHistoryByID.supply_date.split("/").reverse().join("-")
      );
      setInvoiceClient(billing.invoiceHistoryByID.bill_to_party_client);
      setInvoiceAddress(billing.invoiceHistoryByID.bill_to_party_address);
      setInvoiceGSTNo(
        billing.invoiceHistoryByID.bill_to_party_gst_no
          ? billing.invoiceHistoryByID.bill_to_party_gst_no
          : ""
      );
      setInvoiceState(billing.invoiceHistoryByID.bill_to_party_state);
      setInvoiceStateCode(billing.invoiceHistoryByID.bill_to_party_state_code);
      setInvoiceZipCode(billing.invoiceHistoryByID.bill_to_party_zip_code);
      setInvoiceShipperClient(billing.invoiceHistoryByID.ship_to_party_client);
      setInvoiceShipperAddress(
        billing.invoiceHistoryByID.ship_to_party_address
      );
      setInvoiceShipperGSTNo(
        billing.invoiceHistoryByID.ship_to_party_gst_no
          ? billing.invoiceHistoryByID.ship_to_party_gst_no
          : ""
      );
      setInvoiceShipperState(billing.invoiceHistoryByID.ship_to_party_state);
      setInvoiceShipperStateCode(
        billing.invoiceHistoryByID.ship_to_party_state_code
      );
      setInvoiceShipperZipCode(
        billing.invoiceHistoryByID.ship_to_party_zip_code
      );
      setInvoiceRemarks(billing.invoiceHistoryByID.remark);
      setInvoiceLines(billing.invoiceHistoryByID.invoice_lines);
      setChildClient(billing.invoiceHistoryByID.client_child_company_list);
      setPlaceOfSupplyDD(billing.invoiceHistoryByID.indian_states_list);
      dispatch({
        type: "SET_CHILD_CLIENT_PK",
        payload: billing.invoiceHistoryByID.bill_to_party_client_pk,
      });
      dispatch({
        type: "SET_SHIPPER_CHILD_CLIENT_PK",
        payload: billing.invoiceHistoryByID.ship_to_party_client_pk,
      });
    }
  }, [billing.invoiceHistoryByID]);

  useEffect(() => {
    if (billing.allCollectedInvoice.length !== 0) {
      setInvoiceClient(billing.allCollectedInvoice.bill_to_party_client);
      setInvoiceHSNCode(billing.allCollectedInvoice.hsn_code);
      setInvoiceMainClient(billing.allCollectedInvoice.main_client);
      setInvoiceHandlingCharges(billing.allCollectedInvoice.charge_type);
      setInvoiceDate(
        billing.allCollectedInvoice.invoice_date &&
          billing.allCollectedInvoice.invoice_date
            .split("/")
            .reverse()
            .join("-")
      );
      setInvoiceNumber(billing.allCollectedInvoice.invoice_no);
      setInvoiceLocation(billing.allCollectedInvoice.location);
      setInvoiceSite(billing.allCollectedInvoice.site);
      setInvoiceAddress(billing.allCollectedInvoice.bill_to_party_address);
      setInvoiceRefBookingNo(billing.allCollectedInvoice.ref_booking_no);
      setInvoiceRefBLNo(billing.allCollectedInvoice.ref_bl_no);
      setInvoicePlaceOfSupply(billing.allCollectedInvoice.place_of_supply);
      setInvoiceSupplyDate(
        billing.allCollectedInvoice.supply_date &&
          billing.allCollectedInvoice.supply_date.split("/").reverse().join("-")
      );
      setInvoiceGSTNo(billing.allCollectedInvoice.bill_to_party_gst_no);
      setInvoiceState(billing.allCollectedInvoice.bill_to_party_state);
      setInvoiceStateCode(billing.allCollectedInvoice.bill_to_party_state_code);
      setInvoiceZipCode(billing.allCollectedInvoice.bill_to_party_zip_code);
      setInvoiceShipperClient(billing.allCollectedInvoice.ship_to_party_client);
      setInvoiceShipperAddress(
        billing.allCollectedInvoice.ship_to_party_address
      );
      setInvoiceShipperGSTNo(
        billing.allCollectedInvoice.ship_to_party_gst_no
          ? billing.allCollectedInvoice.ship_to_party_gst_no
          : ""
      );
      setInvoiceShipperState(billing.allCollectedInvoice.ship_to_party_state);
      setInvoiceShipperStateCode(
        billing.allCollectedInvoice.ship_to_party_state_code
      );
      setInvoiceShipperZipCode(
        billing.allCollectedInvoice.ship_to_party_zip_code
      );
      setInvoiceRemarks(billing.allCollectedInvoice.remark);
      setInvoiceLines(billing.allCollectedInvoice.invoice_lines);
      setChildClient(billing.allCollectedInvoice.client_child_company_list);
      setPlaceOfSupplyDD(billing.allCollectedInvoice.indian_state_list);
      dispatch({
        type: "SET_CHILD_CLIENT_PK",
        payload: billing.allCollectedInvoice.bill_to_party_client_pk,
      });
      dispatch({
        type: "SET_SHIPPER_CHILD_CLIENT_PK",
        payload: billing.allCollectedInvoice.ship_to_party_client_pk,
      });
    }
  }, [clientMaster.clientDetails]);

  useEffect(() => {
    let reqArray = ["location_site_dashboard_list"];

    dispatch(dropDownDispatch(reqArray, notify));
  }, []);

  const handleInvoiceDateChange = (date) => {
    var selectedDate = new Date(date);
    var dd = String(selectedDate.getDate()).padStart(2, "0");
    var mm = String(selectedDate.getMonth() + 1).padStart(2, "0"); //
    var yyyy = selectedDate.getFullYear();
    var selectedDateFormat = yyyy + "-" + mm + "-" + dd;
    setInvoiceDate(selectedDateFormat);
  };

  const handleInvoiceSupplyDateChange = (date) => {
    var selectedDate = new Date(date);
    var dd = String(selectedDate.getDate()).padStart(2, "0");
    var mm = String(selectedDate.getMonth() + 1).padStart(2, "0"); //
    var yyyy = selectedDate.getFullYear();
    var selectedDateFormat = yyyy + "-" + mm + "-" + dd;
    setInvoiceSupplyDate(selectedDateFormat);
  };

  const handleInvoiceSave = () => {
    let req = {
      invoice_no: invoiceNumber,
      invoice_date: invoiceDate.split("-").reverse().join("/"),
      location: invoiceLocation,
      site: invoiceSite,
      charge_type: invoiceHandlingCharges,
      hsn_code: invoiceHSNCode,
      ref_booking_no: invoiceRefBookingNo,
      ref_bl_no: invoiceRefBLNo,
      place_of_supply: invoicePlaceOfSupply,
      supply_date: invoiceSupplyDate.split("-").reverse().join("/"),
      main_client: invoiceMainClient,
      bill_to_party_client_pk: billing.child_pk,
      bill_to_party_client: invoiceClient,
      bill_to_party_address: invoiceAddress,
      bill_to_party_gst_no: invoiceGSTNo,
      bill_to_party_state: invoiceState,
      bill_to_party_state_code: invoiceStateCode,
      bill_to_party_zip_code: invoiceZipCode,
      ship_to_party_client_pk: billing.shipper_child_pk,
      ship_to_party_client: invoiceShipperClient,
      ship_to_party_address: invoiceShipperAddress,
      ship_to_party_gst_no: invoiceShipperGSTNo,
      ship_to_party_state: invoiceShipperState,
      ship_to_party_state_code: invoiceShipperStateCode,
      ship_to_party_zip_code: invoiceShipperZipCode,
      remark: invoiceRemarks,
      invoice_lines: invoiceLines,
    };

    dispatch(saveInvoice(req, notify));
  };

  const handleInvoiceUpdate = () => {
    let req = {
      pk: billing.invoiceHistoryByID.pk,
      invoice_no: invoiceNumber,
      invoice_date: invoiceDate.split("-").reverse().join("/"),
      location: invoiceLocation,
      site: invoiceSite,
      charge_type: invoiceHandlingCharges,
      hsn_code: invoiceHSNCode,
      ref_booking_no: invoiceRefBookingNo,
      ref_bl_no: invoiceRefBLNo,
      place_of_supply: invoicePlaceOfSupply,
      supply_date: invoiceSupplyDate.split("-").reverse().join("/"),
      main_client: invoiceMainClient,
      bill_to_party_client_pk: billing.child_pk,
      bill_to_party_client: invoiceClient,
      bill_to_party_address: invoiceAddress,
      bill_to_party_gst_no: invoiceGSTNo,
      bill_to_party_state: invoiceState,
      bill_to_party_state_code: invoiceStateCode,
      bill_to_party_zip_code: invoiceZipCode,
      ship_to_party_client_pk: billing.shipper_child_pk,
      ship_to_party_client: invoiceShipperClient,
      ship_to_party_address: invoiceShipperAddress,
      ship_to_party_gst_no: invoiceShipperGSTNo,
      ship_to_party_state: invoiceShipperState,
      ship_to_party_state_code: invoiceShipperStateCode,
      ship_to_party_zip_code: invoiceShipperZipCode,
      remark: invoiceRemarks,
      invoice_lines: invoiceLines,
    };

    dispatch(editInvoiceData(billing.invoiceHistoryByID.pk, req, notify));
  };

  const printInvoiceData = () => {
    dispatch(printInvoice(billing.billing_pk, notify));
  };

  const getStatementData = () => {
    dispatch(
      getStatement(
        billing.billing_pk,
        notify,
        props.history.location.state.value
      )
    );
  };

  const handleGoBack = () => {
    // let req = "";
    // if (billing.allCollectedInvoice.length !== 0) {
    //   req = {
    //     invoice_no: billing.allCollectedInvoice.invoice_no,
    //   };
    //   dispatch(deleteInvoiceNo(req, history));
    // } else {
    history.goBack();
    dispatch({ type: "CLEAR_INVOICE_HISTORY_BY_ID" });
    dispatch({
      type: "CLEAR_CHECKBOX",
    });
    // }
  };

  const handleCheck = () => {
    setSameAsBill(!sameAsBill);
    setInvoiceShipperClient(invoiceClient);
    setInvoiceShipperAddress(invoiceAddress);
    setInvoiceShipperGSTNo(invoiceGSTNo);
    setInvoiceShipperState(invoiceState);
    setInvoiceShipperStateCode(invoiceStateCode);
    setInvoiceShipperZipCode(invoiceZipCode);
    setInvoiceShipperZipCode(invoiceZipCode);
    dispatch({
      type: "SET_SHIPPER_CHILD_CLIENT_PK",
      payload: billing.child_pk,
    });
    setAddChildParty(true);
  };

  function FAB() {
    if (phone)
      return !addChild ? (
        <Grid className={classes.mainFlexButton}>
          <Fab
            onClick={buttonClickEdit}
            className={classes.fab}
            color="primary"
            size="small"
          >
            <Edit />
          </Fab>
          <Fab
            onClick={buttonClick}
            className={classes.fab}
            color="primary"
            size="small"
          >
            <Add />
          </Fab>
        </Grid>
      ) : (
        <Grid className={classes.mainFlexButton}>
          <Fab
            onClick={buttonClickEdit}
            className={classes.fab}
            color="primary"
            size="small"
          >
            <Edit />
          </Fab>
          <Fab
            onClick={buttonClick}
            className={classes.fab}
            color="secondary"
            size="small"
          >
            <Remove />
          </Fab>
        </Grid>
      );
    return !addChild ? (
      <Grid className={classes.mainFlexButton}>
        <Fab
          onClick={buttonClickEdit}
          className={classes.fab}
          color="primary"
          size="small"
        >
          <Edit />
        </Fab>
        <Fab
          onClick={buttonClick}
          className={classes.fab}
          color="primary"
          size="small"
        >
          <Add />
        </Fab>
      </Grid>
    ) : (
      <Grid className={classes.mainFlexButton}>
        <Fab
          onClick={buttonClickEdit}
          className={classes.fab}
          color="primary"
          size="small"
        >
          <Edit />
        </Fab>
        <Fab
          onClick={buttonClick}
          className={classes.fab}
          color="secondary"
          size="small"
        >
          <Remove />
        </Fab>
      </Grid>
    );
  }

  const buttonClick = () => {
    setAddChild(!addChild);
    setInvoiceClient("");
    setInvoiceAddress("");
    setInvoiceGSTNo("");
    setInvoiceState("");
    setInvoiceStateCode("");
    setInvoiceZipCode("");
    dispatch({ type: "CLEAR_CHILD_CLIENT_PK" });
  };

  const buttonClickEdit = () => {
    setAddChild(!addChild);
  };

  function FABParty() {
    if (phone)
      return !addChildParty ? (
        <Grid className={classes.mainFlexButton}>
          <Fab
            onClick={buttonClickPartyEdit}
            className={classes.fab}
            color="primary"
            size="small"
            disabled={sameAsBill === true}
          >
            <Edit />
          </Fab>
          <Fab
            onClick={buttonClickParty}
            className={classes.fab}
            color="primary"
            size="small"
            disabled={sameAsBill === true}
          >
            <Add />
          </Fab>
        </Grid>
      ) : (
        <Grid className={classes.mainFlexButton}>
          <Fab
            onClick={buttonClickPartyEdit}
            className={classes.fab}
            color="primary"
            size="small"
            disabled={sameAsBill === true}
          >
            <Edit />
          </Fab>
          <Fab
            onClick={buttonClickParty}
            className={classes.fab}
            color="secondary"
            size="small"
            disabled={sameAsBill === true}
          >
            <Remove />
          </Fab>
        </Grid>
      );
    return !addChildParty ? (
      <Grid className={classes.mainFlexButton}>
        <Fab
          onClick={buttonClickPartyEdit}
          className={classes.fab}
          color="primary"
          size="small"
          disabled={sameAsBill === true}
        >
          <Edit />
        </Fab>
        <Fab
          onClick={buttonClickParty}
          className={classes.fab}
          color="primary"
          size="small"
          disabled={sameAsBill === true}
        >
          <Add />
        </Fab>
      </Grid>
    ) : (
      <Grid className={classes.mainFlexButton}>
        <Fab
          onClick={buttonClickPartyEdit}
          className={classes.fab}
          color="primary"
          size="small"
          disabled={sameAsBill === true}
        >
          <Edit />
        </Fab>
        <Fab
          onClick={buttonClickParty}
          className={classes.fab}
          color="secondary"
          size="small"
          disabled={sameAsBill === true}
        >
          <Remove />
        </Fab>
      </Grid>
    );
  }

  const buttonClickParty = () => {
    setAddChildParty(!addChildParty);
    setInvoiceShipperClient("");
    setInvoiceShipperAddress("");
    setInvoiceShipperGSTNo("");
    setInvoiceShipperState("");
    setInvoiceShipperStateCode("");
    setInvoiceShipperZipCode("");
    dispatch({ type: "CLEAR_SHIPPER_CHILD_CLIENT_PK" });
  };

  const buttonClickPartyEdit = () => {
    setAddChildParty(!addChildParty);
  };

  return (
    <LayoutContainer footer={false}>
      <Grid container>
        <Grid item xs={12}>
          <Image
            src={require("../assets/images/back-arrow.png")}
            className={classes.backImage}
            onClick={handleGoBack}
          />
          <div>
            <Typography
              variant="subtitle2"
              style={{
                paddingTop: 14,
                paddingBottom: 14,
                backgroundColor: "#243545",
                color: "#FFF",
                marginTop: 10,
                borderTopLeftRadius: 5,
                borderTopRightRadius: 5,
              }}
            >
              <Box fontWeight="fontWeightBold" m={1}>
                Billing Details
              </Box>
            </Typography>
            <Paper className={classes.paperContainer} elevation={0}>
              <Grid container spacing={3}>
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
                  <TextField
                    id="client-ref-booking-no"
                    value={invoiceRefBookingNo}
                    variant="outlined"
                    fullWidth
                    inputProps={{ className: classes.input }}
                    onChange={(e) => {
                      setInvoiceRefBookingNo(e.target.value);
                    }}
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
                  <TextField
                    id="client-hsn-code"
                    value={invoiceRefBLNo}
                    variant="outlined"
                    fullWidth
                    inputProps={{ className: classes.input }}
                    onChange={(e) => {
                      setInvoiceRefBLNo(e.target.value);
                    }}
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
                    HSN Code
                  </Typography>
                </Grid>

                <Grid
                  item
                  xs={12}
                  sm={3}
                  lg={3}
                  style={theme.breakpoints.down("sm") && { padding: 7 }}
                >
                  <TextField
                    id="client-hsn-code"
                    value={invoiceHSNCode}
                    variant="outlined"
                    fullWidth
                    inputProps={{ className: classes.input }}
                    onChange={(e) => {
                      setInvoiceHSNCode(e.target.value);
                    }}
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
                    id="client-name"
                    handleChange={(e) => setInvoiceMainClient(e.target.value)}
                    value={invoiceMainClient}
                    dispatchType="INVOICE_CLIENT_NAME"
                    readOnlyP
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
                    Invoice Date
                  </Typography>
                </Grid>
                <Grid
                  item
                  xs={12}
                  sm={3}
                  lg={3}
                  style={theme.breakpoints.down("sm") && { padding: 7 }}
                >
                  <DatePickerField
                    dateId="to-date"
                    dateValue={invoiceDate}
                    dateChange={handleInvoiceDateChange}
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
                    Invoice Number
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
                    id="client-invoice-number"
                    handleChange={(e) => setInvoiceNumber(e.target.value)}
                    value={invoiceNumber}
                    dispatchType="CLIENT_HANDLING_INVOICE_NUMBER"
                    readOnlyP
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
                    Charge Type
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
                    id="client-handling-charges"
                    value={invoiceHandlingCharges}
                    dispatchType="CLIENT_HANDLING_INVOICE_NUMBER"
                    readOnlyP
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
                  <TextField
                    id="client-handling-location"
                    select
                    value={invoiceLocation}
                    variant="outlined"
                    fullWidth
                    inputProps={{ className: classes.input }}
                    onChange={(e) => {
                      setInvoiceLocation(e.target.value);
                    }}
                   
                    disabled={true}
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
                  <TextField
                    id="handling-site"
                    select
                    value={invoiceSite}
                    variant="outlined"
                    fullWidth
                    inputProps={{ className: classes.input }}
                    onChange={(e) => {
                      setInvoiceSite(e.target.value);
                    }}
                    
                    disabled={true}
                  >
                    {invoiceLocation !== "" &&
                      gateIn.allDropDown &&
                      gateIn.allDropDown.location_site_dashboard_list &&
                      gateIn.allDropDown.location_site_dashboard_list[
                        invoiceLocation
                      ].map((option) => (
                        <MenuItem key={option} value={option}>
                          {option}
                        </MenuItem>
                      ))}
                  </TextField>
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
                  <TextField
                    id="client-place-of-supply"
                    select
                    value={invoicePlaceOfSupply}
                    variant="outlined"
                    fullWidth
                    inputProps={{ className: classes.input }}
                    onChange={(e) => {
                      setInvoicePlaceOfSupply(e.target.value);
                    }}
                  >
                    {placeOfSupplyDD.length !== 0 &&
                      placeOfSupplyDD.map((option) => (
                        <MenuItem key={option} value={option}>
                          {option}
                        </MenuItem>
                      ))}
                  </TextField>
                
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
                  <DatePickerField
                    dateId="supply-date"
                    dateValue={invoiceSupplyDate}
                    dateChange={handleInvoiceSupplyDateChange}
                  />
                </Grid>

                <Grid
                  item
                  xs={12}
                  sm={6}
                  lg={6}
                  style={theme.breakpoints.down("sm") && { padding: 7 }}
                />

                <Grid
                  item
                  xs={12}
                  sm={6}
                  style={theme.breakpoints.down("sm") && { padding: 7 }}
                >
                  <Typography variant="h6" style={{ textAlign: "center" }}>
                    Bill to Party Details
                  </Typography>
                </Grid>

                <Grid
                  item
                  xs={12}
                  sm={6}
                  style={theme.breakpoints.down("sm") && { padding: 7 }}
                >
                  <Grid
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Typography variant="h6">Ship to Party Details</Typography>
                    <Grid
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Checkbox checked={sameAsBill} onChange={handleCheck} />
                      <Typography>same as Bill to Party?</Typography>
                    </Grid>
                  </Grid>
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
                    Billing Client
                  </Typography>
                </Grid>
                <Grid
                  item
                  xs={12}
                  sm={2}
                  lg={2}
                  style={theme.breakpoints.down("sm") && { padding: 7 }}
                >
                  {!addChild ? (
                    <TextField
                      id="client-handling-name"
                      select
                      value={invoiceClient}
                      variant="outlined"
                      fullWidth
                      inputProps={{ className: classes.input }}
                      onChange={(e) => {
                        setInvoiceClient(e.target.value);
                      }}
                    >
                      {childClient.length !== 0 &&
                        childClient.map((option) => (
                          <MenuItem
                            key={option.name}
                            value={option.name}
                            onClick={() => {
                              setInvoiceAddress(option.address);
                              setInvoiceGSTNo(option.gst_no);
                              setInvoiceState(option.state);
                              setInvoiceStateCode(option.state_code);
                              setInvoiceZipCode(option.zip_code);
                              dispatch({
                                type: "SET_CHILD_CLIENT_PK",
                                payload: option.pk,
                              });
                            }}
                          >
                            {option.name}
                          </MenuItem>
                        ))}
                    </TextField>
                  ) : (
                    <CustomTextfield
                      id="client-handling-name"
                      handleChange={(e) => setInvoiceClient(e.target.value)}
                      value={invoiceClient}
                      dispatchType="CLEAR_CHILD_CLIENT"
                    />
                  )}
                </Grid>

                <Grid
                  item
                  xs={12}
                  sm={1}
                  lg={1}
                  style={theme.breakpoints.down("sm") && { padding: 7 }}
                  className={classes.fabFlex}
                >
                  <FAB />
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
                  sm={2}
                  lg={2}
                  style={theme.breakpoints.down("sm") && { padding: 7 }}
                >
                  {!addChildParty ? (
                    <TextField
                      id="client-shipper-handling-name"
                      select
                      value={invoiceShipperClient}
                      variant="outlined"
                      fullWidth
                      inputProps={{ className: classes.input }}
                      onChange={(e) => {
                        setInvoiceShipperClient(e.target.value);
                      }}
                      disabled={sameAsBill === true}
                    >
                      {childClient.length !== 0 &&
                        childClient.map((option) => (
                          <MenuItem
                            key={option.name}
                            value={option.name}
                            onClick={() => {
                              setInvoiceShipperAddress(option.address);
                              setInvoiceShipperGSTNo(option.gst_no);
                              setInvoiceShipperState(option.state);
                              setInvoiceShipperStateCode(option.state_code);
                              setInvoiceShipperZipCode(option.zip_code);
                              dispatch({
                                type: "SET_SHIPPER_CHILD_CLIENT_PK",
                                payload: option.pk,
                              });
                            }}
                          >
                            {option.name}
                          </MenuItem>
                        ))}
                    </TextField>
                  ) : (
                    <CustomTextfield
                      id="client-shipper-handling-name"
                      handleChange={(e) =>
                        setInvoiceShipperClient(e.target.value)
                      }
                      value={invoiceShipperClient}
                      dispatchType="CLEAR_SHIPPER_CHILD_CLIENT"
                      readOnlyP={sameAsBill && true}
                    />
                  )}

                </Grid>

                <Grid
                  item
                  xs={12}
                  sm={1}
                  lg={1}
                  style={theme.breakpoints.down("sm") && { padding: 7 }}
                  className={classes.fabFlex}
                >
                  <FABParty />
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
                    Address
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
                    id="client-handling-address"
                    handleChange={(e) => setInvoiceAddress(e.target.value)}
                    value={invoiceAddress}
                    isRemark={true}
                    dispatchType="CLIENT_HANDLING_ADDRESS"
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
                    Shipping Address
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
                    id="shipping-client-handling-address"
                    handleChange={(e) =>
                      setInvoiceShipperAddress(e.target.value)
                    }
                    value={invoiceShipperAddress}
                    isRemark={true}
                    dispatchType="CLIENT_HANDLING_ADDRESS"
                    readOnlyP={sameAsBill && true}
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
                    GST No
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
                    id="client-handling-gst-number"
                    handleChange={(e) => setInvoiceGSTNo(e.target.value)}
                    value={invoiceGSTNo}
                    dispatchType="CLIENT_HANDLING_GST_NO"
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
                    Shipping GST No
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
                    id="shipping-client-handling-gst-number"
                    handleChange={(e) => setInvoiceShipperGSTNo(e.target.value)}
                    value={invoiceShipperGSTNo}
                    dispatchType="CLIENT_HANDLING_GST_NO"
                    readOnlyP={sameAsBill && true}
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
                    State
                  </Typography>
                </Grid>
                <Grid
                  item
                  xs={12}
                  sm={3}
                  lg={3}
                  style={theme.breakpoints.down("sm") && { padding: 7 }}
                >
                  <TextField
                    id="client-handling-state"
                    select
                    value={invoiceState}
                    variant="outlined"
                    fullWidth
                    inputProps={{ className: classes.input }}
                    onChange={(e) => {
                      setInvoiceState(e.target.value);
                    }}
                  >
                    {placeOfSupplyDD.length !== 0 &&
                      placeOfSupplyDD.map((option) => (
                        <MenuItem key={option} value={option}>
                          {option}
                        </MenuItem>
                      ))}
                  </TextField>
              
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
                    Shipper State
                  </Typography>
                </Grid>
                <Grid
                  item
                  xs={12}
                  sm={3}
                  lg={3}
                  style={theme.breakpoints.down("sm") && { padding: 7 }}
                >
                  <TextField
                    id="shipping-client-handling-state"
                    select
                    value={invoiceShipperState}
                    variant="outlined"
                    fullWidth
                    inputProps={{ className: classes.input }}
                    onChange={(e) => {
                      setInvoiceShipperState(e.target.value);
                    }}
                    disabled={sameAsBill && true}
                  >
                    {placeOfSupplyDD.length !== 0 &&
                      placeOfSupplyDD.map((option) => (
                        <MenuItem key={option} value={option}>
                          {option}
                        </MenuItem>
                      ))}
                  </TextField>
                
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
                    State Code
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
                    id="client-handling-state-code"
                    handleChange={(e) => setInvoiceStateCode(e.target.value)}
                    value={invoiceStateCode}
                    dispatchType="CLIENT_HANDLING_STATE_CODE"
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
                    Shipper State Code
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
                    id="shipper-client-handling-state-code"
                    handleChange={(e) =>
                      setInvoiceShipperStateCode(e.target.value)
                    }
                    value={invoiceShipperStateCode}
                    dispatchType="CLIENT_HANDLING_STATE_CODE"
                    readOnlyP={sameAsBill && true}
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
                    Zip Code
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
                    id="client-handling-state-code"
                    handleChange={(e) => setInvoiceZipCode(e.target.value)}
                    value={invoiceZipCode}
                    dispatchType="CLIENT_HANDLING_ZIP_CODE"
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
                    Shipper Zip Code
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
                    id="client-handling-state-code"
                    handleChange={(e) =>
                      setInvoiceShipperZipCode(e.target.value)
                    }
                    value={invoiceShipperZipCode}
                    dispatchType="CLIENT_HANDLING_STATE_CODE"
                    readOnlyP={sameAsBill && true}
                  />
                </Grid>

                <BillingInvoiceTabularData mapper={invoiceLines} />
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
                    Remarks
                  </Typography>
                </Grid>
                <Grid
                  item
                  xs={12}
                  sm={4}
                  lg={4}
                  style={theme.breakpoints.down("sm") && { padding: 7 }}
                >
                  <CustomTextfield
                    id="client-handling-remark"
                    handleChange={(e) => setInvoiceRemarks(e.target.value)}
                    value={invoiceRemarks}
                    isRemark={true}
                    dispatchType="CLIENT_HANDLING_REMARK"
                  />
                </Grid>
              </Grid>
            </Paper>
          </div>
          <Grid
            style={{
              marginLeft: "auto",
              marginRight: "auto",
              width: "100%",
              marginTop: 16,
              marginBottom: 16,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            {billing.invoiceHistoryByID.pk ? (
              <Button className={classes.button} onClick={handleInvoiceUpdate}>
                Update
              </Button>
            ) : (
              <Button className={classes.button} onClick={handleInvoiceSave}>
                Save
              </Button>
            )}
            <Button
              className={classes.button}
              onClick={printInvoiceData}
              disabled={!billing.billing_pk}
            >
              Print
            </Button>
            <Button
              className={classes.button}
              disabled={!billing.billing_pk}
              onClick={getStatementData}
            >
              Get Statement
            </Button>
          </Grid>
        </Grid>
      </Grid>
    </LayoutContainer>
  );
}
