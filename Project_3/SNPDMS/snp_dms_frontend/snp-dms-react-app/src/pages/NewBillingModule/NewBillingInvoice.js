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
  FormControlLabel,
  Radio,
} from "@material-ui/core";
import { useDispatch, useSelector } from "react-redux";
import LayoutContainer from "../../components/reusableComponents/LayoutContainer";
import {
  saveInvoice,
  printInvoice,
  getStatement,
  editInvoiceData,
  getInvoiceHistoryByID,
  deleteBillingHistoryData,
  saveInvoiceRepair,
  getStatementExcel,
} from "../../actions/NewBillingActions";
import { useHistory } from "react-router-dom";
import { Image } from "semantic-ui-react";
import { useSnackbar } from "notistack";
import { dropDownDispatch } from "../../actions/GateInActions";
import { theme } from "../../App";
import CustomTextfield from "../../components/reusableComponents/GateInTextField";
import DatePickerField from "../../components/reusableComponents/DatePickerField";
import BillingInvoiceTabularData from "./NewBillingInvoiceTabularData";
import Add from "@material-ui/icons/AddCircle";
import Remove from "@material-ui/icons/Remove";
import Edit from "@material-ui/icons/Create";
import { NEWBILLING_REDUCER } from "../../reducers/NewBillingReducer";

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
    [theme.breakpoints.down('sm')]:{
      width: "240px",
    }
  },
  deletebutton: {
    fontSize: 12.5,
    borderRadius: 6,
    width: "15%",
    margin: 15,
    border: "1.5px solid #bd1313",
    boxShadow: "0px 3px 6px #9199A14D",
    backgroundColor: "#bd1313",
    color: "#fff",
    "&:hover": {
      backgroundColor: "#e11b1b",
    },
    [theme.breakpoints.down('sm')]:{
      width: "240px",
    }
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
  LabelTypography: {
    fontSize: 14,
    fontWeight: 600,
    color: "#243545",
    paddingBottom: 4,
    [theme.breakpoints.down("sm")]: {
      paddingBottom: 1,
    },
  },

  fab: {
    cursor: "pointer",
    margin: 5,
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

export default function NewBillingInvoice(props) {
  const dispatch = useDispatch();
  const classes = useStyles();
  const store = useSelector((state) => state);
  const history = useHistory();
  const notify = useSnackbar().enqueueSnackbar;
  const { gateIn, newBilling } = store;
  const { bill_type: mnr_bill_type } = newBilling.invoiceHistoryByIDNew;
  const { bill_type } = newBilling.allCollectedInvoiceNew;

  const [invoiceHSNCode, setInvoiceHSNCode] = useState("");
  const [isRej, setIsRej] = useState("False");
  const [invoiceHandlingCharges, setInvoiceHandlingCharges] = useState("");
  const [invoiceDate, setInvoiceDate] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [invoiceNumberLable, setInvoiceNumberLable] = useState("");
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
  const [invoiceState, setInvoiceState] = useState(null);
  const [stateValue, setStateValue] = useState("");
  const [shipperStateValue, setShipperStateValue] = useState("");
  const [invoiceStateCode, setInvoiceStateCode] = useState("");
  const [invoiceZipCode, setInvoiceZipCode] = useState("");
  const [invoiceShipperClient, setInvoiceShipperClient] = useState("");
  const [invoiceShipperAddress, setInvoiceShipperAddress] = useState("");
  const [invoiceShipperGSTNo, setInvoiceShipperGSTNo] = useState("");
  const [invoiceShipperState, setInvoiceShipperState] = useState(null);
  const [invoiceShipperStateCode, setInvoiceShipperStateCode] = useState("");
  const [invoiceShipperZipCode, setInvoiceShipperZipCode] = useState("");
  const [invoiceRemarks, setInvoiceRemarks] = useState("");
  const [invoiceLines, setInvoiceLines] = useState([]);
  const [sameAsBill, setSameAsBill] = useState(false);
  const [childClient, setChildClient] = useState([]);
  const [placeOfSupplyDD, setPlaceOfSupplyDD] = useState([]);
  const [addChild, setAddChild] = useState(false);
  const [addChildParty, setAddChildParty] = useState(false);
  const [fromSupplyDate, setFromSupplyDate] = useState("");
  const [toSupplydate, setToSupplyDate] = useState("");
  const [invoiceTotalAmt, setInvoiceTotalAmt] = useState("");
  const [invoiceDiscount, setInvoiceDiscount] = useState(0);
  const phone = window.innerWidth <= 380 || "orientation" in window;

  const selectCount = newBilling?.allCollectedInvoiceNew?.invoice_lines?.length;
  useEffect(() => {
    if (newBilling.allCollectedInvoiceNew?.length !== 0) {
      setInvoiceClient(
        newBilling?.allCollectedInvoiceNew?.bill_to_party_client
      );
      setIsRej(newBilling?.allCollectedInvoiceNew?.apply_igst);
      setInvoicePlaceOfSupply(
        newBilling.allCollectedInvoiceNew.place_of_supply
      );
      setInvoiceHSNCode(newBilling?.allCollectedInvoiceNew?.hsn_code);
      setInvoiceMainClient(newBilling?.allCollectedInvoiceNew?.main_client);
      setInvoiceTotalAmt(newBilling?.allCollectedInvoiceNew?.total_amount);
      setInvoiceHandlingCharges(newBilling?.allCollectedInvoiceNew?.bill_type);
      setInvoiceDate(
        newBilling?.allCollectedInvoiceNew?.invoice_date &&
          newBilling?.allCollectedInvoiceNew?.invoice_date
            .split("/")
            .reverse()
            .join("-")
      );
      setFromSupplyDate(
        newBilling?.allCollectedInvoiceNew?.from_supply_date &&
          newBilling?.allCollectedInvoiceNew?.from_supply_date
            .split("/")
            .reverse()
            .join("-")
      );
      setToSupplyDate(
        newBilling?.allCollectedInvoiceNew?.to_supply_date &&
          newBilling?.allCollectedInvoiceNew?.to_supply_date
            .split("/")
            .reverse()
            .join("-")
      );
      setInvoiceNumber(newBilling?.allCollectedInvoiceNew?.invoice_no);
      setInvoiceNumberLable(newBilling?.allCollectedInvoiceNew?.invoice_label);
      setInvoiceLocation(newBilling?.allCollectedInvoiceNew?.location);
      setInvoiceSite(newBilling?.allCollectedInvoiceNew?.site);
      setInvoiceAddress(
        newBilling?.allCollectedInvoiceNew?.bill_to_party_address
      );
      setInvoiceRefBookingNo(
        newBilling?.allCollectedInvoiceNew?.ref_booking_no
      );
      setInvoiceRefBLNo(newBilling?.allCollectedInvoiceNew?.ref_bl_no);
      setInvoiceSupplyDate(
        newBilling?.allCollectedInvoiceNew?.supply_date &&
          newBilling?.allCollectedInvoiceNew?.supply_date
            .split("/")
            .reverse()
            .join("-")
      );
      setInvoiceGSTNo(newBilling?.allCollectedInvoiceNew?.bill_to_party_gst_no);
      setInvoiceState(newBilling?.allCollectedInvoiceNew?.state_codes);
      setInvoiceZipCode(
        newBilling?.allCollectedInvoiceNew?.bill_to_party_zip_code
      );
      setInvoiceShipperClient(
        newBilling?.allCollectedInvoiceNew?.ship_to_party_client
      );
      setInvoiceShipperAddress(
        newBilling?.allCollectedInvoiceNew?.ship_to_party_address
      );
      setInvoiceShipperGSTNo(
        newBilling?.allCollectedInvoiceNew?.ship_to_party_gst_no
          ? newBilling?.allCollectedInvoiceNew?.ship_to_party_gst_no
          : ""
      );
      setInvoiceShipperState(newBilling?.allCollectedInvoiceNew?.state_codes);

      setInvoiceShipperZipCode(
        newBilling?.allCollectedInvoiceNew?.ship_to_party_zip_code
      );
      setInvoiceRemarks(newBilling?.allCollectedInvoiceNew?.remark);
      setInvoiceLines(newBilling?.allCollectedInvoiceNew?.invoice_lines);
      setChildClient(
        newBilling?.allCollectedInvoiceNew?.client_child_company_list
      );
      setPlaceOfSupplyDD(newBilling?.allCollectedInvoiceNew?.indian_state_list);
      dispatch({
        type: "SET_CHILD_CLIENT_PK",
        payload: newBilling?.allCollectedInvoiceNew?.bill_to_party_client_pk,
      });
      dispatch({
        type: "SET_SHIPPER_CHILD_CLIENT_PK",
        payload: newBilling?.allCollectedInvoiceNew?.ship_to_party_client_pk,
      });
      const initialTotal =
        newBilling?.allCollectedInvoiceNew?.invoice_lines?.reduce(
          (sum, entry) => sum + parseFloat(entry.rec_amount),
          0
        );
      setInvoiceTotalAmt(initialTotal);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [newBilling?.allCollectedInvoiceNew]);

  useEffect(() => {
    if (newBilling.invoiceHistoryByIDNew?.length !== 0) {
      setInvoiceClient(newBilling?.invoiceHistoryByIDNew?.bill_to_party_client);
      setIsRej(newBilling?.invoiceHistoryByIDNew?.apply_igst);
      setInvoicePlaceOfSupply(newBilling.invoiceHistoryByIDNew.place_of_supply);
      setInvoiceHSNCode(newBilling?.invoiceHistoryByIDNew?.hsn_code);
      setInvoiceMainClient(newBilling?.invoiceHistoryByIDNew?.main_client);
      setInvoiceTotalAmt(newBilling?.invoiceHistoryByIDNew?.total_amount);
      setInvoiceHandlingCharges(newBilling?.invoiceHistoryByIDNew?.bill_type);
      setInvoiceDiscount(newBilling.invoiceHistoryByIDNew?.discount);
      setShipperStateValue(
        newBilling?.invoiceHistoryByIDNew?.ship_to_party_state
      );
      setInvoiceDate(
        newBilling?.invoiceHistoryByIDNew?.invoice_date &&
          newBilling?.invoiceHistoryByIDNew?.invoice_date
            .split("/")
            .reverse()
            .join("-")
      );
      setFromSupplyDate(
        newBilling?.invoiceHistoryByIDNew?.from_supply_date &&
          newBilling?.invoiceHistoryByIDNew?.from_supply_date
            .split("/")
            .reverse()
            .join("-")
      );
      setToSupplyDate(
        newBilling?.invoiceHistoryByIDNew?.to_supply_date &&
          newBilling?.invoiceHistoryByIDNew?.to_supply_date
            .split("/")
            .reverse()
            .join("-")
      );
      setInvoiceNumber(newBilling?.invoiceHistoryByIDNew?.invoice_no);
      setInvoiceNumberLable(newBilling?.invoiceHistoryByIDNew?.invoice_label);
      setInvoiceLocation(newBilling?.invoiceHistoryByIDNew?.location);
      setInvoiceSite(newBilling?.invoiceHistoryByIDNew?.site);
      setInvoiceAddress(
        newBilling?.invoiceHistoryByIDNew?.bill_to_party_address
      );
      setInvoiceRefBookingNo(newBilling?.invoiceHistoryByIDNew?.ref_booking_no);
      setInvoiceRefBLNo(newBilling?.invoiceHistoryByIDNew?.ref_bl_no);
      setInvoiceSupplyDate(
        newBilling?.invoiceHistoryByIDNew?.supply_date &&
          newBilling?.invoiceHistoryByIDNew?.supply_date
            .split("/")
            .reverse()
            .join("-")
      );
      setStateValue(newBilling?.invoiceHistoryByIDNew?.bill_to_party_state);
      setInvoiceStateCode(
        newBilling?.invoiceHistoryByIDNew?.bill_to_party_state_code
      );
      setInvoiceGSTNo(newBilling?.invoiceHistoryByIDNew?.bill_to_party_gst_no);
      setInvoiceState(newBilling?.invoiceHistoryByIDNew?.state_codes);
      setInvoiceZipCode(
        newBilling?.invoiceHistoryByIDNew?.bill_to_party_zip_code
      );
      setInvoiceShipperClient(
        newBilling?.invoiceHistoryByIDNew?.ship_to_party_client
      );
      setInvoiceShipperAddress(
        newBilling?.invoiceHistoryByIDNew?.ship_to_party_address
      );
      setInvoiceShipperGSTNo(
        newBilling?.invoiceHistoryByIDNew?.ship_to_party_gst_no
          ? newBilling?.invoiceHistoryByIDNew?.ship_to_party_gst_no
          : ""
      );
      setInvoiceShipperState(newBilling?.invoiceHistoryByIDNew?.state_codes);
      setInvoiceShipperStateCode(
        newBilling?.invoiceHistoryByIDNew?.ship_to_party_state_code
      );
      setInvoiceShipperZipCode(
        newBilling?.invoiceHistoryByIDNew?.ship_to_party_zip_code
      );
      setInvoiceRemarks(newBilling?.invoiceHistoryByIDNew?.remark);
      setInvoiceLines(newBilling?.invoiceHistoryByIDNew?.invoice_lines);
      setChildClient(
        newBilling?.invoiceHistoryByIDNew?.client_child_company_list
      );
      setPlaceOfSupplyDD(newBilling?.invoiceHistoryByIDNew?.indian_state_list);
      dispatch({
        type: "SET_CHILD_CLIENT_PK",
        payload: newBilling?.invoiceHistoryByIDNew?.bill_to_party_client_pk,
      });
      dispatch({
        type: "SET_SHIPPER_CHILD_CLIENT_PK",
        payload: newBilling?.invoiceHistoryByIDNew?.ship_to_party_client_pk,
      });
      if (mnr_bill_type === "Repair" || mnr_bill_type === "Washing/Cleaning") {
        const initialTotal =
        newBilling?.invoiceHistoryByIDNew?.invoice_lines?.reduce(
          (sum, entry) => sum + parseFloat(entry.total_amount_after_discount),
          0
        );
         
      setInvoiceTotalAmt(initialTotal);
      }else {
        const initialTotal =
        newBilling?.invoiceHistoryByIDNew?.invoice_lines?.reduce(
          (sum, entry) => sum + parseFloat(entry.rec_amount),
          0
        );
        setInvoiceTotalAmt(initialTotal);
      }
      
     
     
    
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [newBilling?.invoiceHistoryByIDNew]);

  useEffect(() => {
    let reqArray = ["location_site_dashboard_list"];
    dispatch(dropDownDispatch(reqArray, notify));

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (bill_type === "Repair" || bill_type === "Washing/Cleaning") {
    } else {
      if (newBilling?.total_amount) {
        setInvoiceTotalAmt(newBilling?.total_amount);
      } else {
        setInvoiceTotalAmt("");
      }
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [newBilling?.total_amount]);

  useEffect(() => {
    if (props?.history?.location?.state?.allDetails) {
      if (props?.history?.location?.state?.mnr) {
        dispatch(
          getInvoiceHistoryByID(
            props?.history?.location?.state?.allDetails?.pk,
            notify,
            true
          )
        );
      } else {
        dispatch(
          getInvoiceHistoryByID(
            props?.history?.location?.state?.allDetails?.pk,
            notify
          )
        );
      }
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    return () => {
      dispatch({
        type: "CLEAR_INVOICE_HISTORY_BY_ID_NEW",
        payload: newBilling.invoiceHistoryByIDNew,
      });
      dispatch({
        type: "CLEAR_BILLING_AMOUNT",
        payload: newBilling.total_amount,
      });
      dispatch({
        type: "CLEAR_HANDLING_INVOICE_NEW",
        payload: newBilling.allCollectedInvoiceNew,
      });
      dispatch({
        type: "CLEAR_CHILD_CLIENT_PK",
        payload: newBilling.child_pk,
      });
      dispatch({
        type: "RESET_BILLING_NEW_DATA",
        payload: newBilling,
      });
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  function validateInvoiceHSNCode(hsn_code) {
    var re = /^\d{6}|\d{8}|\d{10}$/;
    return re.test(hsn_code);
  }

  function validateInvoiceIGSTNo(bill_to_party_gst_no) {
    var re = /^(\d{2}[A-Z]{5}\d{4}[A-Z]{1}[1-9A-Z]{1}Z{1}[1-9A-Z]{1})$/;
    return re.test(bill_to_party_gst_no);
  }

  function validateInvoiceIGSTNoShipping(ship_to_party_gst_no) {
    var re = /^(\d{2}[A-Z]{5}\d{4}[A-Z]{1}[1-9A-Z]{1}Z{1}[1-9A-Z]{1})$/;
    return re.test(ship_to_party_gst_no);
  }

  function validateInvoiceZIPCode(bill_to_party_zip_code) {
    var re = /(^\d{6}$)|(^\d{9}$)|(^\d{6}-\d{4}$)/;
    return re.test(bill_to_party_zip_code);
  }

  function validateInvoiceZIPCodeShipping(bill_to_party_zip_code) {
    var re = /(^\d{6}$)|(^\d{9}$)|(^\d{6}-\d{4}$)/;
    return re.test(bill_to_party_zip_code);
  }

  const handleInvoiceSave = () => {
    if (invoiceDate === "") {
      notify("Please Enter Invoice Date", {
        variant: "warning",
      });
    } else if (invoiceNumber === "00000") {
      notify("Please Enter Invoice Number", {
        variant: "warning",
      });
    } else if (invoiceHSNCode && !validateInvoiceHSNCode(invoiceHSNCode)) {
      notify("Please Enter Valid 6 Digit HSN Code", {
        variant: "warning",
      });
    } else if (
      invoiceShipperGSTNo &&
      !validateInvoiceIGSTNoShipping(invoiceShipperGSTNo)
    ) {
      notify("Please Enter Valid 16 Digit GST Number for Shipping Party", {
        variant: "warning",
      });
    } else if (invoiceZipCode && !validateInvoiceZIPCode(invoiceZipCode)) {
      notify("Please Enter Valid ZIP Code for Billing Party", {
        variant: "warning",
      });
    } else if (
      invoiceShipperZipCode &&
      !validateInvoiceZIPCodeShipping(invoiceShipperZipCode)
    ) {
      notify("Please Enter Valid ZIP Code Shipping Party", {
        variant: "warning",
      });
    } else {
      if (bill_type === "Repair" || bill_type === "Washing/Cleaning") {
        if (invoiceTotalAmt === "") {
          notify("Please Enter Receive Amount", {
            variant: "warning",
          });
          return;
        }
      } else {
        if (
          newBilling?.allCollectedInvoiceNew?.invoice_lines?.reduce(
            (a, c) => a + Number(c.rec_amount),
            0
          ) === ""
        ) {
          notify("Please Enter Receive Amount", {
            variant: "warning",
          });
          return;
        }
      }

      let req = {
        invoice_no: invoiceNumber,
        invoice_label: invoiceNumberLable,
        invoice_date: invoiceDate?.split("-")?.reverse()?.join("/"),
        apply_igst: isRej,
        place_of_supply: invoicePlaceOfSupply,
        location: invoiceLocation,
        site: invoiceSite,
        bill_type: invoiceHandlingCharges,
        hsn_code: invoiceHSNCode,
        ref_booking_no: invoiceRefBookingNo,
        ref_bl_no: invoiceRefBLNo,
        supply_date: invoiceSupplyDate?.split("-")?.reverse()?.join("/"),
        main_client: invoiceMainClient,
        bill_to_party_client_pk: newBilling.child_pk,
        bill_to_party_client: invoiceClient,
        bill_to_party_address: invoiceAddress,
        bill_to_party_gst_no: invoiceGSTNo,
        bill_to_party_state: stateValue,
        bill_to_party_state_code: invoiceStateCode,
        bill_to_party_zip_code: invoiceZipCode,
        ship_to_party_client_pk: newBilling.shipper_child_pk,
        ship_to_party_client: invoiceShipperClient,
        ship_to_party_address: invoiceShipperAddress,
        ship_to_party_gst_no: invoiceShipperGSTNo,
        ship_to_party_state: shipperStateValue,
        ship_to_party_state_code: invoiceShipperStateCode,
        ship_to_party_zip_code: invoiceShipperZipCode,
        remark: invoiceRemarks,
        invoice_lines: invoiceLines,
        total_amount:
          bill_type === "Repair" || bill_type === "Washing/Cleaning"
            ? newBilling.allCollectedInvoiceNew.total_amount
            : newBilling?.allCollectedInvoiceNew?.invoice_lines?.reduce(
                (a, c) => a + Number(c.rec_amount),
                0
              ),
        from_supply_date: fromSupplyDate,
        to_supply_date: toSupplydate,
      };

      if (bill_type === "Repair" || bill_type === "Washing/Cleaning") {
        dispatch(saveInvoiceRepair(req, notify, history));
        return;
      }
      req.discount = invoiceDiscount;
      dispatch(saveInvoice(req, notify));
    }
  };

  const handleInvoiceUpdate = () => {
    let req = {
      pk: newBilling.invoiceHistoryByIDNew.pk,
      invoice_no: invoiceNumber,
      invoice_label: invoiceNumberLable,
      invoice_date: invoiceDate?.split("-")?.reverse()?.join("/"),
      apply_igst: isRej,
      place_of_supply: invoicePlaceOfSupply,
      location: invoiceLocation,
      site: invoiceSite,
      bill_type: invoiceHandlingCharges,
      hsn_code: invoiceHSNCode,
      ref_booking_no: invoiceRefBookingNo,
      ref_bl_no: invoiceRefBLNo,
      supply_date: invoiceSupplyDate?.split("-")?.reverse()?.join("/"),
      main_client: invoiceMainClient,
      bill_to_party_client_pk: newBilling.child_pk,
      bill_to_party_client: invoiceClient,
      bill_to_party_address: invoiceAddress,
      bill_to_party_gst_no: invoiceGSTNo,
      bill_to_party_state: stateValue,
      bill_to_party_state_code: invoiceStateCode,
      bill_to_party_zip_code: invoiceZipCode,
      ship_to_party_client_pk: newBilling.shipper_child_pk,
      ship_to_party_client: invoiceShipperClient,
      ship_to_party_address: invoiceShipperAddress,
      ship_to_party_gst_no: invoiceShipperGSTNo,
      ship_to_party_state: shipperStateValue,
      ship_to_party_state_code: invoiceShipperStateCode,
      ship_to_party_zip_code: invoiceShipperZipCode,
      remark: invoiceRemarks,
      invoice_lines: invoiceLines,
      total_amount: invoiceTotalAmt,
    };
    if (mnr_bill_type === "Repair" || mnr_bill_type === "Washing/Cleaning") {
      dispatch(
        editInvoiceData(newBilling.invoiceHistoryByIDNew.pk, req, notify, true)
      );
    } else {
      req.discount = invoiceDiscount;
      dispatch(
        editInvoiceData(newBilling.invoiceHistoryByIDNew.pk, req, notify)
      );
    }
  };

  const printInvoiceDataUpdate = () => {
    dispatch(printInvoice(newBilling.invoiceHistoryByIDNew.pk, notify));
  };

  const getStatementDataUpdate = () => {
    dispatch(getStatement(newBilling?.invoiceHistoryByIDNew.pk, notify));
  };

  const getStatementDataUpdateExcel = () => {
    dispatch(getStatementExcel(newBilling?.invoiceHistoryByIDNew.pk, notify));
  };

  const getStatementDataSaveExcel = () => {
    dispatch(getStatementExcel(newBilling.billing_pk, notify));
  };

  const getStatementDataSave = () => {
    dispatch(getStatement(newBilling.billing_pk, notify));
  };

  const printInvoiceDataSave = () => {
    dispatch(printInvoice(newBilling.billing_pk, notify));
  };

  const handleInvoiceDelete = () => {
    if (mnr_bill_type === "Repair" || mnr_bill_type === "Washing/Cleaning") {
      dispatch(
        deleteBillingHistoryData(
          newBilling?.invoiceHistoryByIDNew?.pk,
          notify,
          history,
          true
        )
      );
    }
    dispatch(
      deleteBillingHistoryData(
        newBilling?.invoiceHistoryByIDNew?.pk,
        notify,
        history
      )
    );
  };
  const handleGoBack = () => {
    history.goBack();
    dispatch({ type: "CLEAR_INVOICE_HISTORY_BY_ID_new" });
    dispatch({
      type: "CLEAR_CHECKBOX_NEW",
    });
  };

  const handleCheck = () => {
    setSameAsBill(!sameAsBill);
    setInvoiceShipperClient(invoiceClient);
    setInvoiceShipperAddress(invoiceAddress);
    setInvoiceShipperGSTNo(invoiceGSTNo);
    setInvoiceShipperState(invoiceState);
    setInvoiceShipperStateCode(invoiceShipperStateCode);
    setInvoiceShipperZipCode(invoiceZipCode);
    setInvoiceShipperZipCode(invoiceZipCode);
    dispatch({
      type: "SET_SHIPPER_CHILD_CLIENT_PK",
      payload: newBilling.child_pk,
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
    setInvoiceShipperStateCode("");
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
            src={require("../../assets/images/back-arrow.png")}
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
              <Grid
                container
                xs={12}
                spacing={4}
                style={{ display: "flex", justifyContent: "space-between" }}
              >
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
                    type="text"
                    inputProps={{ className: classes.input }}
                    onChange={(e) => {
                      setInvoiceRefBookingNo(e.target.value);
                      if (
                        bill_type === "Repair" ||
                        bill_type === "Washing/Cleaning"
                      ) {
                        dispatch({
                          type: NEWBILLING_REDUCER.EDIT_REPAIR_NEW_BILLING_INVOICE_NO,
                          payload: { ref_booking_no: e.target.value },
                        });
                      }
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
                    type="text"
                    fullWidth
                    inputProps={{ className: classes.input }}
                    onChange={(e) => {
                      setInvoiceRefBLNo(e.target.value);
                      if (
                        bill_type === "Repair" ||
                        bill_type === "Washing/Cleaning"
                      ) {
                        dispatch({
                          type: NEWBILLING_REDUCER.EDIT_REPAIR_NEW_BILLING_INVOICE_NO,
                          payload: { ref_bl_no: e.target.value },
                        });
                      }
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
                    type="number"
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
                    Invoice Date <span style={{ color: "red" }}>*</span>
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
                    Invoice Number <span style={{ color: "red" }}>*</span>
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={3} lg={3} style={{ display: "flex" }}>
                  <CustomTextfield
                    id="client-invoice-number-label"
                    handleChange={(e) => {
                      setInvoiceNumberLable(e.target.value);
                    }}
                    value={invoiceNumberLable}
                    dispatchType="GET_BILLING_INVOICE_NO_LABEL"
                    readOnlyP={true}
                  />
                  <CustomTextfield
                    id="client-invoice-number"
                    handleChange={(e) => setInvoiceNumber(e.target.value)}
                    value={invoiceNumber}
                    readOnlyP={props?.history?.location?.state?.allDetails?.pk}
                    dispatchType={
                      bill_type === "Repair" || bill_type === "Washing/Cleaning"
                        ? NEWBILLING_REDUCER.EDIT_REPAIR_NEW_BILLING_INVOICE_NO
                        : "GET_BILLING_INVOICE_NO_NEW"
                    }
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
                    {gateIn?.allDropDown &&
                      gateIn?.allDropDown?.location_site_dashboard_list &&
                      Object.keys(
                        gateIn?.allDropDown?.location_site_dashboard_list
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
                      ]?.map((option) => (
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
                      if (
                        bill_type === "Repair" ||
                        bill_type === "Washing/Cleaning"
                      ) {
                        dispatch({
                          type: NEWBILLING_REDUCER.EDIT_REPAIR_NEW_BILLING_INVOICE_NO,
                          payload: { place_of_supply: e.target.value },
                        });
                      }
                    }}
                  >
                    {placeOfSupplyDD?.length !== 0 &&
                      placeOfSupplyDD?.map((option) => (
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
                        checked={isRej === "True"}
                        onClick={() => {
                          setIsRej("True");
                          dispatch({
                            type: "INVOICE_APPLY_IGST",
                            payload: newBilling.apply_igst,
                          });
                          if (
                            bill_type === "Repair" ||
                            bill_type === "Washing/Cleaning"
                          ) {
                            dispatch({
                              type: NEWBILLING_REDUCER.EDIT_REPAIR_NEW_BILLING_INVOICE_NO,
                              payload: { apply_igst: "True" },
                            });
                          }
                        }}
                      />
                    }
                    label="Yes"
                  />
                  <FormControlLabel
                    value="no"
                    control={
                      <Radio
                        style={{ color: "#2A5FA5" }}
                        checked={isRej === "False"}
                        onClick={() => {
                          setIsRej("False");
                          dispatch({
                            type: "INVOICE_APPLY_IGST",
                            payload: newBilling.apply_igst,
                          });
                          if (
                            bill_type === "Repair" ||
                            bill_type === "Washing/Cleaning"
                          ) {
                            dispatch({
                              type: NEWBILLING_REDUCER.EDIT_REPAIR_NEW_BILLING_INVOICE_NO,
                              payload: { apply_igst: "False" },
                            });
                          }
                        }}
                      />
                    }
                    label="No"
                  />
                </Grid>
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
                        if (
                          bill_type === "Repair" ||
                          bill_type === "Washing/Cleaning"
                        ) {
                          dispatch({
                            type: NEWBILLING_REDUCER.EDIT_REPAIR_NEW_BILLING_INVOICE_NO,
                            payload: { bill_to_party_client: e.target.value },
                          });
                        }
                      }}
                    >
                      {childClient?.length !== 0 &&
                        childClient?.map((option) => (
                          <MenuItem
                            key={option.name}
                            value={option.name}
                            onClick={() => {
                              setInvoiceAddress(option.address);
                              setInvoiceGSTNo(option.gst_no);
                              setInvoiceState(option.state_codes);
                              setInvoiceZipCode(option.zip_code);
                              dispatch({
                                type: "SET_CHILD_CLIENT_PK",
                                payload: option.pk,
                              });
                              if (
                                bill_type === "Repair" ||
                                bill_type === "Washing/Cleaning"
                              ) {
                                dispatch({
                                  type: NEWBILLING_REDUCER.EDIT_REPAIR_NEW_BILLING_INVOICE_NO,
                                  payload: {
                                    bill_to_party_address: option.address,
                                    bill_to_party_gst_no: option.gst_no,
                                    bill_to_party_state: option.state,
                                    bill_to_party_state_code: option.state_code,
                                  },
                                });
                              }
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
                      // dispatchType="CLEAR_CHILD_CLIENT"
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
                        if (
                          bill_type === "Repair" ||
                          bill_type === "Washing/Cleaning"
                        ) {
                          dispatch({
                            type: NEWBILLING_REDUCER.EDIT_REPAIR_NEW_BILLING_INVOICE_NO,
                            payload: {
                              ship_to_party_client: e.target.value,
                            },
                          });
                        }
                      }}
                      disabled={sameAsBill === true}
                    >
                      {childClient?.length !== 0 &&
                        childClient?.map((option) => (
                          <MenuItem
                            key={option.name}
                            value={option.name}
                            onClick={() => {
                              setInvoiceShipperAddress(option.address);
                              setInvoiceShipperGSTNo(option.gst_no);
                              setShipperStateValue(option.state);
                              setInvoiceShipperStateCode(option.state_code);
                              setInvoiceShipperZipCode(option.zip_code);
                              dispatch({
                                type: "SET_SHIPPER_CHILD_CLIENT_PK",
                                payload: option.pk,
                              });
                              if (
                                bill_type === "Repair" ||
                                bill_type === "Washing/Cleaning"
                              ) {
                                dispatch({
                                  type: NEWBILLING_REDUCER.EDIT_REPAIR_NEW_BILLING_INVOICE_NO,
                                  payload: {
                                    ship_to_party_address: option.address,
                                    ship_to_party_gst_no: option.gst_no,
                                    ship_to_party_state: option.state,
                                    ship_to_party_state_code: option.state_code,
                                    ship_to_party_zip_code: option.zip_code,
                                  },
                                });
                              }
                            }}
                          >
                            {option.name}
                          </MenuItem>
                        ))}
                    </TextField>
                  ) : (
                    <CustomTextfield
                      id="client-shipper-handling-name"
                      handleChange={(e) =>{
                        setInvoiceShipperClient(e.target.value)
                        if (
                          bill_type === "Repair" ||
                          bill_type === "Washing/Cleaning"
                        ) {
                          dispatch({
                            type: NEWBILLING_REDUCER.EDIT_REPAIR_NEW_BILLING_INVOICE_NO,
                            payload: {
                              ship_to_party_client: e.target.value,
                            },
                          });
                        }
                        }
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
                    handleChange={(e) => {
                      setInvoiceShipperAddress(e.target.value);
                      if (
                        bill_type === "Repair" ||
                        bill_type === "Washing/Cleaning"
                      ) {
                        dispatch({
                          type: NEWBILLING_REDUCER.EDIT_REPAIR_NEW_BILLING_INVOICE_NO,
                          payload: {
                            ship_to_party_address: e.target.value,
                          },
                        });
                      }
                    }}
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
                    handleChange={(e) => {
                      setInvoiceGSTNo(e.target.value);
                      if (
                        bill_type === "Repair" ||
                        bill_type === "Washing/Cleaning"
                      ) {
                        dispatch({
                          type: NEWBILLING_REDUCER.EDIT_REPAIR_NEW_BILLING_INVOICE_NO,
                          payload: {
                            bill_to_party_gst_no: e.target.value,
                          },
                        });
                      }
                    }}
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
                    handleChange={(e) => {
                      setInvoiceShipperGSTNo(e.target.value);
                      if (
                        bill_type === "Repair" ||
                        bill_type === "Washing/Cleaning"
                      ) {
                        dispatch({
                          type: NEWBILLING_REDUCER.EDIT_REPAIR_NEW_BILLING_INVOICE_NO,
                          payload: {
                            ship_to_party_gst_no: e.target.value,
                          },
                        });
                      }
                    }}
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
                    value={stateValue}
                    variant="outlined"
                    fullWidth
                    inputProps={{ className: classes.input }}
                    onChange={(e) => {
                      setStateValue(e.target.value);
                      setInvoiceStateCode(invoiceState[e.target.value]);
                      if (
                        bill_type === "Repair" ||
                        bill_type === "Washing/Cleaning"
                      ) {
                        dispatch({
                          type: NEWBILLING_REDUCER.EDIT_REPAIR_NEW_BILLING_INVOICE_NO,
                          payload: {
                            bill_to_party_state: e.target.value,
                            bill_to_party_state_code:invoiceState[e.target.value]
                          },
                        });
                      }
                    }}
                  >
                    {invoiceState &&
                      Object.keys(invoiceState).map((option) => (
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
                    value={shipperStateValue}
                    variant="outlined"
                    fullWidth
                    inputProps={{ className: classes.input }}
                    onChange={(e) => {
                      setShipperStateValue(e.target.value);
                      setInvoiceShipperStateCode(
                        invoiceShipperState[e.target.value]
                      );
                      if (
                        bill_type === "Repair" ||
                        bill_type === "Washing/Cleaning"
                      ) {
                        dispatch({
                          type: NEWBILLING_REDUCER.EDIT_REPAIR_NEW_BILLING_INVOICE_NO,
                          payload: {
                            ship_to_party_state: e.target.value,
                            ship_to_party_state_code:
                              invoiceShipperState[e.target.value],
                          },
                        });
                      }
                    }}
                    disabled={sameAsBill && true}
                  >
                    {invoiceShipperState &&
                      Object.keys(invoiceShipperState).map((option) => (
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
                    readOnlyP
                    disabled
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
                    value={invoiceStateCode}
                    dispatchType="CLIENT_HANDLING_STATE_CODE"
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
                    readOnlyP
                    disabled
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
                    value={invoiceShipperStateCode}
                    dispatchType="CLIENT_HANDLING_STATE_CODE"
                    readOnlyP={sameAsBill && true}
                    disabled
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
                    handleChange={(e) => {
                      setInvoiceZipCode(e.target.value);
                      if (
                        bill_type === "Repair" ||
                        bill_type === "Washing/Cleaning"
                      ) {
                        dispatch({
                          type: NEWBILLING_REDUCER.EDIT_REPAIR_NEW_BILLING_INVOICE_NO,
                          payload: {
                            bill_to_party_zip_code: e.target.value,
                          },
                        });
                      }
                    }}
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
                    handleChange={(e) => {
                      setInvoiceShipperZipCode(e.target.value);
                      if (
                        bill_type === "Repair" ||
                        bill_type === "Washing/Cleaning"
                      ) {
                        dispatch({
                          type: NEWBILLING_REDUCER.EDIT_REPAIR_NEW_BILLING_INVOICE_NO,
                          payload: {
                            ship_to_party_zip_code: e.target.value,
                          },
                        });
                      }
                    }}
                    value={invoiceShipperZipCode}
                    dispatchType="CLIENT_HANDLING_STATE_CODE"
                    readOnlyP={sameAsBill && true}
                  />
                </Grid>
                <Grid container xs={12}>
                  <Grid
                    item
                    xs={3}
                    sm={3}
                    lg={3}
                    style={theme.breakpoints.down("sm") && { padding: 7 }}
                  >
                    <Typography
                      variant="subtitle1"
                      className={classes.LabelTypography}
                    >
                      Selected Bill Count
                    </Typography>
                  </Grid>

                  <Grid
                    item
                    xs={3}
                    sm={3}
                    lg={3}
                    style={theme.breakpoints.down("sm") && { padding: 7 }}
                  >
                    <TextField
                      id="client-handling-state-code"
                      value={selectCount}
                      variant="outlined"
                      disabled
                      size="small"
                      style={{ width: "50px", padding: "3px" }}
                    />
                  </Grid>
                  {!(
                    bill_type === "Repair" || bill_type === "Washing/Cleaning"
                  ) && (
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
                        Discount %
                      </Typography>
                    </Grid>
                  )}
                  {!(
                    bill_type === "Repair" || bill_type === "Washing/Cleaning"
                  ) && (
                    <Grid
                      item
                      xs={12}
                      sm={3}
                      lg={3}
                      style={theme.breakpoints.down("sm") && { padding: 7 }}
                    >
                      <TextField
                        variant="outlined"
                        id="client-handling-state-code"
                        onChange={(e) => {
                          setInvoiceDiscount(e.target.value);
                        }}
                        disabled={
                          !(
                            bill_type === "Handling" ||
                            mnr_bill_type === "Handling"
                          )
                        }
                        fullWidth
                        size="small"
                        type="number"
                        InputProps={{ inputProps: { min: 0, max: 100 } }}
                        value={invoiceDiscount}
                        // dispatchType="CLIENT_HANDLING_STATE_CODE"
                      />
                    </Grid>
                  )}
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
                  {bill_type === "Repair" ||
                  bill_type === "Washing/Cleaning" ? (
                    <TextField
                      variant="outlined"
                      value={newBilling.allCollectedInvoiceNew.total_amount}
                      fullWidth
                    />
                  ) : (
                    // <Typography variant="h5">{newBilling.allCollectedInvoiceNew.total_amount}</Typography>
                    <CustomTextfield
                      id="client-handling-state-code"
                      handleChange={(e) => {
                        if (
                          mnr_bill_type === "Repair" ||
                          mnr_bill_type === "Washing/Cleaning"
                        ) {
                          return;
                        }
                        setInvoiceTotalAmt(
                          newBilling?.allCollectedInvoiceNew?.invoice_lines?.reduce(
                            (a, c) => a + Number(c.rec_amount),
                            0
                          )
                        );
                      }}
                      value={
                        mnr_bill_type === "Repair" ||
                        mnr_bill_type === "Washing/Cleaning"
                          ? newBilling.invoiceHistoryByIDNew.total_amount !==
                              "" ||
                            newBilling.invoiceHistoryByIDNew.total_amount !==
                              "None"
                            ? invoiceTotalAmt
                            : newBilling.invoiceHistoryByIDNew.total_amount
                          : newBilling.invoiceHistoryByIDNew.total_amount
                          ? invoiceTotalAmt
                          : newBilling?.allCollectedInvoiceNew?.invoice_lines?.reduce(
                              (a, c) => a + Number(c.rec_amount),
                              0
                            )
                      }
                      // dispatchType="GET_BILLING_TOTAL_AMT_NEW"
                    />
                  )}
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
              flexWrap:"wrap"
            }}
          >
            {newBilling?.invoiceHistoryByIDNew?.pk ? (
              <Button className={classes.button} onClick={handleInvoiceUpdate}>
                Update
              </Button>
            ) : (
              <Button className={classes.button} onClick={handleInvoiceSave}>
                Save
              </Button>
            )}
            {newBilling?.invoiceHistoryByIDNew?.pk ? (
              <Button
                className={classes.button}
                onClick={printInvoiceDataUpdate}
              >
                Print
              </Button>
            ) : (
              <Button
                className={classes.button}
                onClick={printInvoiceDataSave}
                disabled={!newBilling.billing_pk}
              >
                Print
              </Button>
            )}

            {newBilling?.invoiceHistoryByIDNew?.pk ? (
              <>
                <Button
                  className={classes.button}
                  onClick={getStatementDataUpdate}
                >
                  Get Statement (PDF)
                </Button>
                <Button
                  className={classes.button}
                  onClick={getStatementDataUpdateExcel}
                >
                  Get Statement (EXCEL)
                </Button>
              </>
            ) : (
              <>
                <Button
                  className={classes.button}
                  disabled={!newBilling.billing_pk}
                  onClick={getStatementDataSave}
                >
                  Get Statement (PDF)
                </Button>
                <Button
                  disabled={!newBilling.billing_pk}
                  className={classes.button}
                  onClick={getStatementDataSaveExcel}
                >
                  Get Statement (EXCEL)
                </Button>
              </>
            )}

            {newBilling?.invoiceHistoryByIDNew?.pk ? (
              <Button
                className={classes.deletebutton}
                onClick={handleInvoiceDelete}
              >
                Delete
              </Button>
            ) : (
              ""
            )}
          </Grid>
        </Grid>
      </Grid>
    </LayoutContainer>
  );
}
