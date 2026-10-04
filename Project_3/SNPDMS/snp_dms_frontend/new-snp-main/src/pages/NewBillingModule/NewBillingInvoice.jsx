import React, { useEffect, useState } from "react";

import {
  Grid,
  Button,
  Typography,
  Paper,
  Box,
  TextField,
  MenuItem,
  Checkbox,
  Fab,
  FormControlLabel,
  Radio,
  Backdrop,
  CircularProgress,
  Stack,
} from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import LayoutContainer from "@components/reusablecomponents/LayoutContainer";
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
import { useSnackbar } from "notistack";
import { dropDownDispatch } from "../../actions/GateInActions";
import { theme } from "../../App";
import CustomTextfield from "@components/reusablecomponents/GateInTextField";
import DatePickerField from "@components/reusablecomponents/DatePickerField";
import BillingInvoiceTabularData from "./NewBillingInvoiceTabularData";
import Add from "@mui/icons-material/AddCircle";
import Remove from "@mui/icons-material/Remove";
import Edit from "@mui/icons-material/Create";
import { NEWBILLING_REDUCER } from "../../reducers/NewBillingReducer";
import CustomBackButton from "@components/reusablecomponents/CustomBackButton";
import {
  custombackDropStyle,
  customLabelTypography,
} from "../../utils/CustomClasses";
import { TableFootercontainer } from "@/components/TableComponent/TableComponent";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import LocalPrintshopOutlinedIcon from "@mui/icons-material/LocalPrintshopOutlined";
import PictureAsPdfOutlinedIcon from "@mui/icons-material/PictureAsPdfOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";

export default function NewBillingInvoice(props) {
  const dispatch = useDispatch();
  const store = useSelector((state) => state);
  const { isloading } = useSelector((state) => state.ui);
  const history = useHistory();
  const notify = useSnackbar().enqueueSnackbar;
  const { gateIn, newBilling } = store;
  const { bill_type: mnr_bill_type } = newBilling.invoiceHistoryByIDNew;
  const { bill_type } = newBilling.allCollectedInvoiceNew;

  const [invoiceHSNCode, setInvoiceHSNCode] = useState("");
  const [isRej, setIsRej] = useState("False");
  const [invoiceOnOldLoloRate, setInvoiceOnOldLoloRate] = useState(false);
  const [apply_gst, set_apply_gst] = useState(true);
  const [invoiceHandlingCharges, setInvoiceHandlingCharges] = useState("");
  const [invoiceDate, setInvoiceDate] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [invoiceNumberLable, setInvoiceNumberLable] = useState("");
  const [invoiceLocation, setInvoiceLocation] = useState(
    localStorage.getItem("location") ? localStorage.getItem("location") : "",
  );
  const [invoiceSite, setInvoiceSite] = useState(
    localStorage.getItem("site") ? localStorage.getItem("site") : "",
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
  const [clientDiscount, setClientDiscount] = useState(0);
  const phone = window.innerWidth <= 380 || "orientation" in window;

  const selectCount = newBilling?.allCollectedInvoiceNew?.invoice_lines?.length;
  useEffect(() => {
    if (newBilling.allCollectedInvoiceNew?.length !== 0) {
      setInvoiceClient(
        newBilling?.allCollectedInvoiceNew?.bill_to_party_client,
      );
      setIsRej(newBilling?.allCollectedInvoiceNew?.apply_igst);
      setInvoicePlaceOfSupply(
        newBilling.allCollectedInvoiceNew.place_of_supply,
      );
      setInvoiceHSNCode(newBilling?.allCollectedInvoiceNew?.hsn_code);
      setInvoiceMainClient(newBilling?.allCollectedInvoiceNew?.main_client);
      setInvoiceTotalAmt(newBilling?.allCollectedInvoiceNew?.total_amount);
      setInvoiceHandlingCharges(newBilling?.allCollectedInvoiceNew?.bill_type);
      set_apply_gst(
        newBilling?.allCollectedInvoiceNew?.apply_gst === "True" ||
          (newBilling?.allCollectedInvoiceNew?.apply_gst === true &&
            newBilling?.allCollectedInvoiceNew?.apply_gst !== "False")
          ? true
          : false,
      );
      setInvoiceDate(
        newBilling?.allCollectedInvoiceNew?.invoice_date &&
          newBilling?.allCollectedInvoiceNew?.invoice_date
            .split("/")
            .reverse()
            .join("-"),
      );
      setFromSupplyDate(
        newBilling?.allCollectedInvoiceNew?.from_supply_date &&
          newBilling?.allCollectedInvoiceNew?.from_supply_date
            .split("/")
            .reverse()
            .join("-"),
      );
      setToSupplyDate(
        newBilling?.allCollectedInvoiceNew?.to_supply_date &&
          newBilling?.allCollectedInvoiceNew?.to_supply_date
            .split("/")
            .reverse()
            .join("-"),
      );
      setInvoiceNumber(newBilling?.allCollectedInvoiceNew?.invoice_no);
      setInvoiceNumberLable(newBilling?.allCollectedInvoiceNew?.invoice_label);
      setInvoiceLocation(newBilling?.allCollectedInvoiceNew?.location);
      setInvoiceSite(newBilling?.allCollectedInvoiceNew?.site);
      setInvoiceAddress(
        newBilling?.allCollectedInvoiceNew?.bill_to_party_address,
      );
      setInvoiceRefBookingNo(
        newBilling?.allCollectedInvoiceNew?.ref_booking_no,
      );
      setInvoiceRefBLNo(newBilling?.allCollectedInvoiceNew?.ref_bl_no);
      setInvoiceSupplyDate(
        newBilling?.allCollectedInvoiceNew?.supply_date &&
          newBilling?.allCollectedInvoiceNew?.supply_date
            .split("/")
            .reverse()
            .join("-"),
      );
      setInvoiceGSTNo(newBilling?.allCollectedInvoiceNew?.bill_to_party_gst_no);
      setInvoiceState(newBilling?.allCollectedInvoiceNew?.state_codes);
      setInvoiceZipCode(
        newBilling?.allCollectedInvoiceNew?.bill_to_party_zip_code,
      );
      setInvoiceShipperClient(
        newBilling?.allCollectedInvoiceNew?.ship_to_party_client,
      );
      setInvoiceShipperAddress(
        newBilling?.allCollectedInvoiceNew?.ship_to_party_address,
      );
      setInvoiceShipperGSTNo(
        newBilling?.allCollectedInvoiceNew?.ship_to_party_gst_no
          ? newBilling?.allCollectedInvoiceNew?.ship_to_party_gst_no
          : "",
      );
      setInvoiceShipperState(newBilling?.allCollectedInvoiceNew?.state_codes);

      setInvoiceShipperZipCode(
        newBilling?.allCollectedInvoiceNew?.ship_to_party_zip_code,
      );
      setInvoiceRemarks(newBilling?.allCollectedInvoiceNew?.remark);
      setInvoiceLines(newBilling?.allCollectedInvoiceNew?.invoice_lines);
      setChildClient(
        newBilling?.allCollectedInvoiceNew?.client_child_company_list,
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
          0,
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
      setClientDiscount(newBilling?.invoiceHistoryByIDNew?.client_discount);
      setShipperStateValue(
        newBilling?.invoiceHistoryByIDNew?.ship_to_party_state,
      );
      setInvoiceDate(
        newBilling?.invoiceHistoryByIDNew?.invoice_date &&
          newBilling?.invoiceHistoryByIDNew?.invoice_date
            .split("/")
            .reverse()
            .join("-"),
      );
      setFromSupplyDate(
        newBilling?.invoiceHistoryByIDNew?.from_supply_date &&
          newBilling?.invoiceHistoryByIDNew?.from_supply_date
            .split("/")
            .reverse()
            .join("-"),
      );
      setToSupplyDate(
        newBilling?.invoiceHistoryByIDNew?.to_supply_date &&
          newBilling?.invoiceHistoryByIDNew?.to_supply_date
            .split("/")
            .reverse()
            .join("-"),
      );
      setInvoiceNumber(newBilling?.invoiceHistoryByIDNew?.invoice_no);
      setInvoiceNumberLable(newBilling?.invoiceHistoryByIDNew?.invoice_label);
      setInvoiceLocation(newBilling?.invoiceHistoryByIDNew?.location);
      setInvoiceSite(newBilling?.invoiceHistoryByIDNew?.site);
      setInvoiceAddress(
        newBilling?.invoiceHistoryByIDNew?.bill_to_party_address,
      );
      setInvoiceRefBookingNo(newBilling?.invoiceHistoryByIDNew?.ref_booking_no);
      setInvoiceRefBLNo(newBilling?.invoiceHistoryByIDNew?.ref_bl_no);
      setInvoiceSupplyDate(
        newBilling?.invoiceHistoryByIDNew?.supply_date &&
          newBilling?.invoiceHistoryByIDNew?.supply_date
            .split("/")
            .reverse()
            .join("-"),
      );
      setStateValue(newBilling?.invoiceHistoryByIDNew?.bill_to_party_state);
      setInvoiceStateCode(
        newBilling?.invoiceHistoryByIDNew?.bill_to_party_state_code,
      );
      setInvoiceGSTNo(newBilling?.invoiceHistoryByIDNew?.bill_to_party_gst_no);
      setInvoiceState(newBilling?.invoiceHistoryByIDNew?.state_codes);
      setInvoiceZipCode(
        newBilling?.invoiceHistoryByIDNew?.bill_to_party_zip_code,
      );
      setInvoiceShipperClient(
        newBilling?.invoiceHistoryByIDNew?.ship_to_party_client,
      );
      setInvoiceShipperAddress(
        newBilling?.invoiceHistoryByIDNew?.ship_to_party_address,
      );
      setInvoiceShipperGSTNo(
        newBilling?.invoiceHistoryByIDNew?.ship_to_party_gst_no
          ? newBilling?.invoiceHistoryByIDNew?.ship_to_party_gst_no
          : "",
      );
      setInvoiceShipperState(newBilling?.invoiceHistoryByIDNew?.state_codes);
      setInvoiceShipperStateCode(
        newBilling?.invoiceHistoryByIDNew?.ship_to_party_state_code,
      );
      setInvoiceShipperZipCode(
        newBilling?.invoiceHistoryByIDNew?.ship_to_party_zip_code,
      );
      setInvoiceRemarks(newBilling?.invoiceHistoryByIDNew?.remark);
      setInvoiceLines(newBilling?.invoiceHistoryByIDNew?.invoice_lines);
      setChildClient(
        newBilling?.invoiceHistoryByIDNew?.client_child_company_list,
      );
      setPlaceOfSupplyDD(newBilling?.invoiceHistoryByIDNew?.indian_state_list);
      setInvoiceOnOldLoloRate(
        newBilling?.invoiceHistoryByIDNew?.invoice_on_old_lolo_rate || false,
      );
      set_apply_gst(newBilling?.invoiceHistoryByIDNew?.apply_gst || true);
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
            0,
          );

        setInvoiceTotalAmt(initialTotal);
      } else {
        const initialTotal =
          newBilling?.invoiceHistoryByIDNew?.invoice_lines?.reduce(
            (sum, entry) => sum + parseFloat(entry.rec_amount),
            0,
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
            true,
          ),
        );
      } else {
        dispatch(
          getInvoiceHistoryByID(
            props?.history?.location?.state?.allDetails?.pk,
            notify,
          ),
        );
      }
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props?.history?.location?.state?.pk]);

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
    if (bill_to_party_gst_no.length !== 15) return false;
    return true;
  }

  function validateInvoiceIGSTNoShipping(ship_to_party_gst_no) {
    if (ship_to_party_gst_no.length !== 15) return false;
    return true;
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
    } else if (invoiceGSTNo && !validateInvoiceIGSTNo(invoiceGSTNo)) {
      notify("Please Enter Valid 15 Digit GST Number for Billing Party", {
        variant: "warning",
      });
    } else if (
      invoiceShipperGSTNo &&
      !validateInvoiceIGSTNoShipping(invoiceShipperGSTNo)
    ) {
      notify("Please Enter Valid 15 Digit GST Number for Shipping Party", {
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
            0,
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
                0,
              ),
        from_supply_date: fromSupplyDate,
        to_supply_date: toSupplydate,
      };

      if (bill_type === "Repair" || bill_type === "Washing/Cleaning") {
        dispatch(saveInvoiceRepair(req, notify, history));
        return;
      }
      req.discount = invoiceDiscount;
      req.client_discount = clientDiscount;
      req.invoice_on_old_lolo_rate = false;
      if (bill_type === "Handling" || bill_type === "Night Charge") {
        req.apply_gst = apply_gst;
      }

      dispatch(saveInvoice(req, notify, history));
    }
  };

  const handleInvoiceUpdate = () => {
    if (invoiceGSTNo && !validateInvoiceIGSTNo(invoiceGSTNo)) {
      notify("Please Enter Valid 15 Digit GST Number for Billing Party", {
        variant: "warning",
      });
      return;
    }
    if (invoiceShipperGSTNo && !validateInvoiceIGSTNo(invoiceShipperGSTNo)) {
      notify("Please Enter Valid 15 Digit GST Number for Shipping Party", {
        variant: "warning",
      });
      return;
    }
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
      supply_date: invoiceSupplyDate?.split("-")?.reverse()?.join("/") || "",
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
        editInvoiceData(newBilling.invoiceHistoryByIDNew.pk, req, notify, true),
      );
    } else {
      req.discount = invoiceDiscount;
      req.client_discount = clientDiscount;
      req.invoice_on_old_lolo_rate = invoiceOnOldLoloRate;
      if (mnr_bill_type === "Handling" || mnr_bill_type === "Night Charge") {
        req.apply_gst = apply_gst;
      }
      dispatch(
        editInvoiceData(newBilling.invoiceHistoryByIDNew.pk, req, notify),
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
          true,
        ),
      );
    }
    dispatch(
      deleteBillingHistoryData(
        newBilling?.invoiceHistoryByIDNew?.pk,
        notify,
        history,
      ),
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
        <Grid
          sx={{
            display: "flex",
            justifyContent: "space-around",
            alignItems: "center",
          }}
        >
          <Fab
            onClick={buttonClickEdit}
            color="primary"
            aria-label="edit"
            size="small"
          >
            <Edit />
          </Fab>
          <Fab
            onClick={buttonClick}
            color="primary"
            aria-label="add"
            size="small"
          >
            <Add />
          </Fab>
        </Grid>
      ) : (
        <Grid
          sx={{
            display: "flex",
            justifyContent: "space-around",
            alignItems: "center",
          }}
        >
          <Fab
            onClick={buttonClickEdit}
            color="primary"
            aria-label="edit"
            size="small"
          >
            <Edit />
          </Fab>
          <Fab
            onClick={buttonClick}
            color="primary"
            aria-label="remove"
            size="small"
          >
            <Remove />
          </Fab>
        </Grid>
      );
    return !addChild ? (
      <Grid
        sx={{
          display: "flex",
          justifyContent: "space-around",
          alignItems: "flex-start",
          gap: 2,
        }}
      >
        <Fab
          onClick={buttonClickEdit}
          color="primary"
          aria-label="edit"
          size="small"
        >
          <Edit />
        </Fab>
        <Fab
          onClick={buttonClick}
          color="primary"
          aria-label="add"
          size="small"
        >
          <Add />
        </Fab>
      </Grid>
    ) : (
      <Grid
        sx={{
          display: "flex",
          justifyContent: "space-around",
          alignItems: "center",
        }}
      >
        <Fab
          onClick={buttonClickEdit}
          color="primary"
          aria-label="edit"
          size="small"
        >
          <Edit />
        </Fab>
        <Fab
          onClick={buttonClick}
          color="primary"
          aria-label="remove"
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
        <Grid
          sx={{
            display: "flex",
            justifyContent: "space-around",
            alignItems: "center",
          }}
        >
          <Fab
            onClick={buttonClickPartyEdit}
            color="primary"
            aria-label="edit"
            size="small"
            disabled={sameAsBill === true}
          >
            <Edit />
          </Fab>
          <Fab
            onClick={buttonClickParty}
            color="primary"
            aria-label="add"
            size="small"
            disabled={sameAsBill === true}
          >
            <Add />
          </Fab>
        </Grid>
      ) : (
        <Grid
          sx={{
            display: "flex",
            justifyContent: "space-around",
            alignItems: "center",
          }}
        >
          <Fab
            onClick={buttonClickPartyEdit}
            color="primary"
            aria-label="edit"
            size="small"
            disabled={sameAsBill === true}
          >
            <Edit />
          </Fab>
          <Fab
            onClick={buttonClickParty}
            color="primary"
            aria-label="remove"
            size="small"
            disabled={sameAsBill === true}
          >
            <Remove />
          </Fab>
        </Grid>
      );
    return !addChildParty ? (
      <Grid
        sx={{
          display: "flex",
          justifyContent: "space-around",
          alignItems: "center",
          gap: 2,
        }}
      >
        <Fab
          onClick={buttonClickPartyEdit}
          color="primary"
          aria-label="edit"
          size="small"
          disabled={sameAsBill === true}
        >
          <Edit />
        </Fab>
        <Fab
          onClick={buttonClickParty}
          color="primary"
          aria-label="add"
          size="small"
          disabled={sameAsBill === true}
        >
          <Add />
        </Fab>
      </Grid>
    ) : (
      <Grid
        sx={{
          display: "flex",
          justifyContent: "space-around",
          alignItems: "center",
        }}
      >
        <Fab
          onClick={buttonClickPartyEdit}
          color="primary"
          aria-label="edit"
          size="small"
          disabled={sameAsBill === true}
        >
          <Edit />
        </Fab>
        <Fab
          onClick={buttonClickParty}
          color="primary"
          aria-label="remove"
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
      <Grid container sx={{ marginBottom: 24 }}>
        <Grid item size={{ xs: 12 }}>
          <CustomBackButton handleGoBack={handleGoBack} />
          <div>
            <Typography
              variant="subtitle2"
              sx={(theme) => ({
                paddingTop: 2,
                paddingBottom: 2,
                backgroundColor: theme.palette.secondary.main,
                color: "#FFF",
                borderTopLeftRadius: 5,
                borderTopRightRadius: 5,
              })}
            >
              <Box fontWeight="fontWeightBold" m={1}>
                Billing Details
              </Box>
            </Typography>
            <Paper
              sx={(theme) => ({
                padding: theme.spacing(4, 3),
              })}
              elevation={0}
            >
              <Grid
                container
                size={{ xs: 12 }}
                style={{ display: "flex", justifyContent: "space-between" }}
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
                  <TextField
                    id="client-ref-booking-no"
                    value={invoiceRefBookingNo}
                    variant="outlined"
                    fullWidth
                    type="text"
                    size="small"
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
                  <TextField
                    id="client-hsn-code"
                    value={invoiceRefBLNo}
                    variant="outlined"
                    type="text"
                    fullWidth
                    size="small"
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
                  size={{ xs: 12, sm: 3, lg: 3 }}
                  style={theme.breakpoints.down("sm") && { padding: 7 }}
                >
                  <Typography variant="subtitle1" sx={customLabelTypography}>
                    HSN Code
                  </Typography>
                </Grid>

                <Grid
                  item
                  size={{ xs: 12, sm: 3, lg: 3 }}
                  style={theme.breakpoints.down("sm") && { padding: 7 }}
                >
                  <TextField
                    id="client-hsn-code"
                    value={invoiceHSNCode}
                    type="number"
                    variant="outlined"
                    fullWidth
                    size="small"
                    onChange={(e) => {
                      setInvoiceHSNCode(e.target.value);
                    }}
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
                    id="client-name"
                    handleChange={(e) => setInvoiceMainClient(e.target.value)}
                    value={invoiceMainClient}
                    dispatchType="INVOICE_CLIENT_NAME"
                    readOnlyP
                  />
                </Grid>

                <Grid
                  item
                  size={{ xs: 12, sm: 3, lg: 3 }}
                  style={theme.breakpoints.down("sm") && { padding: 7 }}
                >
                  <Typography variant="subtitle1" sx={customLabelTypography}>
                    Invoice Date <span style={{ color: "red" }}>*</span>
                  </Typography>
                </Grid>
                <Grid
                  item
                  size={{ xs: 12, sm: 3, lg: 3 }}
                  style={theme.breakpoints.down("sm") && { padding: 7 }}
                >
                  <DatePickerField
                    fullWidth
                    dateId="to-date"
                    dateValue={invoiceDate}
                    dateChange={handleInvoiceDateChange}
                  />
                </Grid>
                <Grid
                  item
                  size={{ xs: 12, sm: 3, lg: 3 }}
                  style={theme.breakpoints.down("sm") && { padding: 7 }}
                >
                  <Typography variant="subtitle1" sx={customLabelTypography}>
                    Invoice Number <span style={{ color: "red" }}>*</span>
                  </Typography>
                </Grid>
                <Grid
                  item
                  size={{ xs: 12, sm: 3, lg: 3 }}
                  style={{ display: "flex" }}
                >
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
                    type={"number"}
                    handleChange={(e) => setInvoiceNumber(e.target.value)}
                    value={invoiceNumber}
                    readOnlyP={
                      props?.history?.location?.state?.allDetails?.pk &&
                      store.user.role !== "Admin"
                    }
                    dispatchType={
                      bill_type === "Repair" || bill_type === "Washing/Cleaning"
                        ? NEWBILLING_REDUCER.EDIT_REPAIR_NEW_BILLING_INVOICE_NO
                        : "GET_BILLING_INVOICE_NO_NEW"
                    }
                  />
                </Grid>
                <Grid
                  item
                  size={{ xs: 12, sm: 3, lg: 3 }}
                  style={theme.breakpoints.down("sm") && { padding: 7 }}
                >
                  <Typography variant="subtitle1" sx={customLabelTypography}>
                    Charge Type
                  </Typography>
                </Grid>
                <Grid
                  item
                  size={{ xs: 12, sm: 3, lg: 3 }}
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
                  <TextField
                    id="client-handling-location"
                    select
                    value={invoiceLocation}
                    variant="outlined"
                    fullWidth
                    size="small"
                    onChange={(e) => {
                      setInvoiceLocation(e.target.value);
                    }}
                    disabled={true}
                  >
                    {gateIn?.allDropDown &&
                      gateIn?.allDropDown?.location_site_dashboard_list &&
                      Object.keys(
                        gateIn?.allDropDown?.location_site_dashboard_list,
                      ).map((option) => (
                        <MenuItem key={option} value={option}>
                          {option}
                        </MenuItem>
                      ))}
                  </TextField>
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
                  <TextField
                    id="handling-site"
                    select
                    value={invoiceSite}
                    variant="outlined"
                    fullWidth
                    size="small"
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
                  <TextField
                    id="client-place-of-supply"
                    select
                    value={invoicePlaceOfSupply}
                    variant="outlined"
                    fullWidth
                    size="small"
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
                  <DatePickerField
                    fullWidth
                    dateId="supply-date"
                    dateValue={invoiceSupplyDate}
                    dateChange={handleInvoiceSupplyDateChange}
                  />
                </Grid>

                <Grid
                  item
                  size={{ xs: 12, sm: 6, lg: 6 }}
                  style={theme.breakpoints.down("sm") && { padding: 7 }}
                  sx={(theme) => ({
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  })}
                >
                  <Typography variant="subtitle2" sx={customLabelTypography}>
                    Apply IGST <span style={{ color: "red" }}>*</span>{" "}
                  </Typography>
                  <Stack
                    direction={"row"}
                    alignItems={"center"}
                    justifyContent={"space-between"}
                    sx={{
                      border: `1px solid ${theme.palette.divider}`,
                      px: 1,
                      borderRadius: 2,
                    }}
                  >
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
                  </Stack>
                </Grid>
                <Grid
                  item
                  style={theme.breakpoints.down("sm") && { padding: 7 }}
                  size={{ xs: 12, sm: 6, lg: 6 }}
                  sx={(theme) => ({
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 4,
                  })}
                >
                  {bill_type === "Handling" ||
                  bill_type === "Night Charge" ||
                  mnr_bill_type === "Handling" ||
                  mnr_bill_type === "Night Charge" ? (
                    <Typography variant="subtitle2" sx={customLabelTypography}>
                      Apply GST
                    </Typography>
                  ) : null}
                  {bill_type === "Handling" ||
                  bill_type === "Night Charge" ||
                  mnr_bill_type === "Handling" ||
                  mnr_bill_type === "Night Charge" ? (
                    <Stack
                      direction={"row"}
                      alignItems={"center"}
                      justifyContent={"space-between"}
                      sx={{
                        border: `1px solid ${theme.palette.divider}`,
                        px: 1,
                        borderRadius: 2,
                      }}
                    >
                      <FormControlLabel
                        value={"yes"}
                        control={
                          <Radio
                            style={{ color: "#2A5FA5" }}
                            checked={apply_gst === true}
                            onClick={() => {
                              set_apply_gst(true);
                              dispatch({
                                type: "INVOICE_APPLY_GST",
                                payload: true,
                              });
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
                            checked={apply_gst === false}
                            onClick={() => {
                              set_apply_gst(false);
                              dispatch({
                                type: "INVOICE_APPLY_GST",
                                payload: false,
                              });
                            }}
                          />
                        }
                        label="No"
                      />
                    </Stack>
                  ) : null}
                </Grid>
                {newBilling?.invoiceHistoryByIDNew?.bill_type === "Handling" ||
                newBilling.invoiceHistoryByIDNew?.bill_type ===
                  "Night Charge" ? (
                  <Grid
                    item
                    size={{ xs: 12, sm: 6, lg: 6 }}
                    style={theme.breakpoints.down("sm") && { padding: 7 }}
                    sx={(theme) => ({
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 4,
                    })}
                  >
                    <Typography variant="subtitle2">
                      Invoice on Old LOLO Rates{" "}
                    </Typography>
                    <Stack
                      direction={"row"}
                      alignItems={"center"}
                      justifyContent={"space-between"}
                      sx={{
                        border: `1px solid ${theme.palette.divider}`,
                        px: 1,
                        borderRadius: 2,
                      }}
                    >
                      <FormControlLabel
                        value={"yes"}
                        disabled={
                          newBilling.invoiceHistoryByIDNew?.pk === false ||
                          (newBilling.invoiceHistoryByIDNew?.bill_type !==
                            "Handling" &&
                            newBilling.invoiceHistoryByIDNew?.bill_type !==
                              "Night Charge")
                        }
                        control={
                          <Radio
                            style={{ color: "#2A5FA5" }}
                            checked={invoiceOnOldLoloRate === true}
                            onClick={() => {
                              if (
                                newBilling.invoiceHistoryByIDNew?.pk &&
                                (newBilling?.invoiceHistoryByIDNew
                                  ?.bill_type === "Handling" ||
                                  newBilling.invoiceHistoryByIDNew
                                    ?.bill_type === "Night Charge")
                              ) {
                                setInvoiceOnOldLoloRate(true);
                                dispatch({
                                  type: "INVOICE_ON_OLD_LOLO_RATES",
                                  payload: true,
                                });
                              }
                            }}
                          />
                        }
                        label="Yes"
                      />
                      <FormControlLabel
                        value="no"
                        disabled={
                          newBilling.invoiceHistoryByIDNew?.pk === false ||
                          (newBilling.invoiceHistoryByIDNew?.bill_type !==
                            "Handling" &&
                            newBilling.invoiceHistoryByIDNew?.bill_type !==
                              "Night Charge")
                        }
                        control={
                          <Radio
                            style={{ color: "#2A5FA5" }}
                            checked={invoiceOnOldLoloRate === false}
                            onClick={() => {
                              if (
                                newBilling.invoiceHistoryByIDNew?.pk &&
                                (newBilling?.invoiceHistoryByIDNew
                                  ?.bill_type === "Handling" ||
                                  newBilling.invoiceHistoryByIDNew
                                    ?.bill_type === "Night Charge")
                              ) {
                                setInvoiceOnOldLoloRate(false);
                                dispatch({
                                  type: "INVOICE_ON_OLD_LOLO_RATES",
                                  payload: false,
                                });
                              }
                            }}
                          />
                        }
                        label="No"
                      />
                    </Stack>
                  </Grid>
                ) : null}
                <Grid item size={{ xs: 12 }} sx={{ mt: 6 }}></Grid>
                <Grid
                  item
                  size={{ xs: 12, sm: 6 }}
                  style={theme.breakpoints.down("sm") && { padding: 7 }}
                >
                  <Typography variant="h6" style={{ textAlign: "center" }}>
                    Bill to Party Details
                  </Typography>
                </Grid>

                <Grid
                  item
                  size={{ xs: 12, sm: 6 }}
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
                  size={{ xs: 12, sm: 3, lg: 3 }}
                  style={theme.breakpoints.down("sm") && { padding: 7 }}
                >
                  <Typography variant="subtitle1" sx={customLabelTypography}>
                    Billing Client
                  </Typography>
                </Grid>
                <Grid
                  item
                  size={{ xs: 12, sm: 2, lg: 2 }}
                  style={theme.breakpoints.down("sm") && { padding: 7 }}
                >
                  {!addChild ? (
                    <TextField
                      id="client-handling-name"
                      select
                      value={invoiceClient}
                      variant="outlined"
                      fullWidth
                      size="small"
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
                  size={{ xs: 12, sm: 1, lg: 1 }}
                  style={theme.breakpoints.down("sm") && { padding: 7 }}
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <FAB />
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
                  size={{ xs: 12, sm: 2, lg: 2 }}
                  style={theme.breakpoints.down("sm") && { padding: 7 }}
                >
                  {!addChildParty ? (
                    <TextField
                      id="client-shipper-handling-name"
                      select
                      value={invoiceShipperClient}
                      variant="outlined"
                      fullWidth
                      size="small"
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
                      handleChange={(e) => {
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
                      value={invoiceShipperClient}
                      dispatchType="CLEAR_SHIPPER_CHILD_CLIENT"
                      readOnlyP={sameAsBill && true}
                    />
                  )}
                </Grid>

                <Grid
                  item
                  size={{ xs: 12, sm: 1, lg: 1 }}
                  style={theme.breakpoints.down("sm") && { padding: 7 }}
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <FABParty />
                </Grid>

                <Grid
                  item
                  size={{ xs: 12, sm: 3, lg: 3 }}
                  style={theme.breakpoints.down("sm") && { padding: 7 }}
                >
                  <Typography variant="subtitle1" sx={customLabelTypography}>
                    Address
                  </Typography>
                </Grid>
                <Grid
                  item
                  size={{ xs: 12, sm: 3, lg: 3 }}
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
                  size={{ xs: 12, sm: 3, lg: 3 }}
                  style={theme.breakpoints.down("sm") && { padding: 7 }}
                >
                  <Typography variant="subtitle1" sx={customLabelTypography}>
                    Shipping Address
                  </Typography>
                </Grid>
                <Grid
                  item
                  size={{ xs: 12, sm: 3, lg: 3 }}
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
                  size={{ xs: 12, sm: 3, lg: 3 }}
                  style={theme.breakpoints.down("sm") && { padding: 7 }}
                >
                  <Typography variant="subtitle1" sx={customLabelTypography}>
                    GST No
                  </Typography>
                </Grid>
                <Grid
                  item
                  size={{ xs: 12, sm: 3, lg: 3 }}
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
                  size={{ xs: 12, sm: 3, lg: 3 }}
                  style={theme.breakpoints.down("sm") && { padding: 7 }}
                >
                  <Typography variant="subtitle1" sx={customLabelTypography}>
                    Shipping GST No
                  </Typography>
                </Grid>
                <Grid
                  item
                  size={{ xs: 12, sm: 3, lg: 3 }}
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
                  size={{ xs: 12, sm: 3, lg: 3 }}
                  style={theme.breakpoints.down("sm") && { padding: 7 }}
                >
                  <Typography variant="subtitle1" sx={customLabelTypography}>
                    State
                  </Typography>
                </Grid>

                <Grid
                  item
                  size={{ xs: 12, sm: 3, lg: 3 }}
                  style={theme.breakpoints.down("sm") && { padding: 7 }}
                >
                  <TextField
                    id="client-handling-state"
                    select
                    value={stateValue}
                    variant="outlined"
                    fullWidth
                    size="small"
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
                            bill_to_party_state_code:
                              invoiceState[e.target.value],
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
                  size={{ xs: 12, sm: 3, lg: 3 }}
                  style={theme.breakpoints.down("sm") && { padding: 7 }}
                >
                  <Typography variant="subtitle1" sx={customLabelTypography}>
                    Shipper State
                  </Typography>
                </Grid>
                <Grid
                  item
                  size={{ xs: 12, sm: 3, lg: 3 }}
                  style={theme.breakpoints.down("sm") && { padding: 7 }}
                >
                  <TextField
                    id="shipping-client-handling-state"
                    select
                    value={shipperStateValue}
                    variant="outlined"
                    fullWidth
                    size="small"
                    onChange={(e) => {
                      setShipperStateValue(e.target.value);
                      setInvoiceShipperStateCode(
                        invoiceShipperState[e.target.value],
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
                  size={{ xs: 12, sm: 3, lg: 3 }}
                  style={theme.breakpoints.down("sm") && { padding: 7 }}
                >
                  <Typography
                    variant="subtitle1"
                    sx={customLabelTypography}
                    readOnlyP
                    disabled
                  >
                    State Code
                  </Typography>
                </Grid>
                <Grid
                  item
                  size={{ xs: 12, sm: 3, lg: 3 }}
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
                  size={{ xs: 12, sm: 3, lg: 3 }}
                  style={theme.breakpoints.down("sm") && { padding: 7 }}
                >
                  <Typography
                    variant="subtitle1"
                    sx={customLabelTypography}
                    readOnlyP
                    disabled
                  >
                    Shipper State Code
                  </Typography>
                </Grid>
                <Grid
                  item
                  size={{ xs: 12, sm: 3, lg: 3 }}
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
                  size={{ xs: 12, sm: 3, lg: 3 }}
                  style={theme.breakpoints.down("sm") && { padding: 7 }}
                >
                  <Typography variant="subtitle1" sx={customLabelTypography}>
                    Zip Code
                  </Typography>
                </Grid>
                <Grid
                  item
                  size={{ xs: 12, sm: 3, lg: 3 }}
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
                  size={{ xs: 12, sm: 3, lg: 3 }}
                  style={theme.breakpoints.down("sm") && { padding: 7 }}
                >
                  <Typography variant="subtitle1" sx={customLabelTypography}>
                    Shipper Zip Code
                  </Typography>
                </Grid>
                <Grid
                  item
                  size={{ xs: 12, sm: 3, lg: 3 }}
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
                <Grid container sx={{ width: "50%", my: 3 }}>
                  <Grid
                    item
                    size={{ xs: 12, sm: 2, lg: 2 }}
                    style={theme.breakpoints.down("sm") && { padding: 7 }}
                  >
                    <Typography variant="subtitle1" sx={customLabelTypography}>
                      Selected Bill Count
                    </Typography>
                  </Grid>

                  <Grid
                    item
                    size={{ xs: 12, sm: 2, lg: 2 }}
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
                      size={{ xs: 12, sm: 2, lg: 2 }}
                      style={theme.breakpoints.down("sm") && { padding: 7 }}
                    >
                      <Typography
                        variant="subtitle1"
                        sx={customLabelTypography}
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
                      size={{ xs: 12, sm: 2, lg: 2 }}
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

                  {!(
                    bill_type === "Repair" || bill_type === "Washing/Cleaning"
                  ) && (
                    <Grid
                      item
                      size={{ xs: 12, sm: 2, lg: 2 }}
                      style={theme.breakpoints.down("sm") && { padding: 7 }}
                    >
                      <Typography
                        variant="subtitle1"
                        sx={customLabelTypography}
                      >
                        Client Discount
                      </Typography>
                    </Grid>
                  )}
                  {!(
                    bill_type === "Repair" || bill_type === "Washing/Cleaning"
                  ) && (
                    <Grid
                      item
                      size={{ xs: 12, sm: 2, lg: 2 }}
                      style={theme.breakpoints.down("sm") && { padding: 7 }}
                    >
                      <TextField
                        variant="outlined"
                        id="client-"
                        onChange={(e) => {
                          setClientDiscount(parseFloat(e.target.value));
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
                        slotProps={{
                          input: {
                            inputProps: {
                              step: "0.1",
                            },
                          },
                        }}
                        value={clientDiscount}
                        // dispatchType="CLIENT_HANDLING_STATE_CODE"
                      />
                    </Grid>
                  )}
                </Grid>

                <BillingInvoiceTabularData mapper={invoiceLines} />
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
                            0,
                          ),
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
                                0,
                              )
                      }
                      // dispatchType="GET_BILLING_TOTAL_AMT_NEW"
                    />
                  )}
                </Grid>
                <Grid
                  item
                  size={{ xs: 12, sm: 2, lg: 2 }}
                  style={theme.breakpoints.down("sm") && { padding: 7 }}
                >
                  <Typography variant="subtitle1" sx={customLabelTypography}>
                    Remarks
                  </Typography>
                </Grid>
                <Grid
                  item
                  size={{ xs: 12, sm: 4, lg: 4 }}
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
          <TableFootercontainer>
            {newBilling?.invoiceHistoryByIDNew?.pk ? (
              <Button
                variant="contained"
                color="primary"
                onClick={handleInvoiceUpdate}
                sx={(theme) => ({
                  mx: 1,
                  borderRadius: 12,
                  [theme.breakpoints.down("sm")]: {
                    minWidth: 120,
                  },
                })}
                startIcon={<EditOutlinedIcon />}
              >
                Update
              </Button>
            ) : (
              <Button
                variant="contained"
                color="primary"
                onClick={handleInvoiceSave}
                disabled={isloading}
                sx={(theme) => ({
                  mx: 1,
                  borderRadius: 12,
                  [theme.breakpoints.down("sm")]: {
                    minWidth: 120,
                  },
                })}
                startIcon={<AddOutlinedIcon />}
              >
                Save
              </Button>
            )}
            {newBilling?.invoiceHistoryByIDNew?.pk ? (
              <Button
                variant="contained"
                color="error"
                onClick={printInvoiceDataUpdate}
                sx={(theme) => ({
                  mx: 1,
                  borderRadius: 12,
                  [theme.breakpoints.down("sm")]: {
                    minWidth: 120,
                  },
                })}
                startIcon={<LocalPrintshopOutlinedIcon />}
              >
                Print
              </Button>
            ) : (
              <Button
                variant="contained"
                color="error"
                onClick={printInvoiceDataSave}
                disabled={!newBilling.billing_pk}
                sx={(theme) => ({
                  mx: 1,
                  borderRadius: 12,
                  [theme.breakpoints.down("sm")]: {
                    minWidth: 120,
                  },
                })}
                startIcon={<LocalPrintshopOutlinedIcon />}
              >
                Print
              </Button>
            )}
            {newBilling?.invoiceHistoryByIDNew?.pk ? (
              <>
                <Button
                  variant="contained"
                  color="success"
                  onClick={getStatementDataUpdate}
                  sx={(theme) => ({
                    mx: 1,
                    borderRadius: 12,
                    [theme.breakpoints.down("sm")]: {
                      minWidth: 180,
                    },
                  })}
                  startIcon={<PictureAsPdfOutlinedIcon />}
                >
                  Get Statement (PDF)
                </Button>
                <Button
                  variant="contained"
                  color="success"
                  onClick={getStatementDataUpdateExcel}
                  sx={(theme) => ({
                    mx: 1,
                    borderRadius: 12,
                    [theme.breakpoints.down("sm")]: {
                      minWidth: 180,
                    },
                  })}
                >
                  Get Statement (EXCEL)
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="contained"
                  color="secondary"
                  disabled={!newBilling.billing_pk}
                  onClick={getStatementDataSave}
                  sx={(theme) => ({
                    mx: 1,
                    borderRadius: 12,
                    [theme.breakpoints.down("sm")]: {
                      minWidth: 180,
                    },
                  })}
                  startIcon={<PictureAsPdfOutlinedIcon color="success" />}
                >
                  Get Statement (PDF)
                </Button>
                <Button
                  disabled={!newBilling.billing_pk}
                  variant="contained"
                  color="secondary"
                  onClick={getStatementDataSaveExcel}
                  sx={(theme) => ({
                    mx: 1,
                    borderRadius: 12,
                    [theme.breakpoints.down("sm")]: {
                      minWidth: 180,
                    },
                  })}
                >
                  Get Statement (EXCEL)
                </Button>
              </>
            )}
            {newBilling?.invoiceHistoryByIDNew?.pk ? (
              <Button
                variant="contained"
                color="secondary"
                onClick={handleInvoiceDelete}
                sx={(theme) => ({
                  mx: 1,
                  borderRadius: 12,
                  [theme.breakpoints.down("sm")]: {
                    minWidth: 180,
                  },
                })}
                startIcon={<DeleteOutlineOutlinedIcon color="error" />}
              >
                Delete
              </Button>
            ) : (
              ""
            )}
          </TableFootercontainer>
        </Grid>
      </Grid>
      <Backdrop sx={custombackDropStyle} open={isloading}>
        <CircularProgress color="inherit" />
      </Backdrop>
    </LayoutContainer>
  );
}
