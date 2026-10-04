import React, { useEffect, useState } from "react";
import {
  makeStyles,
  Typography,
  Paper,
  Grid,
  Button,
} from "@material-ui/core";

import { useDispatch, useSelector } from "react-redux";
import CustomTextfield from "../reusableComponents/GateInTextField";
import DatePickerField from "../reusableComponents/DatePickerField";
import { useSnackbar } from "notistack";

import {
  getGateOutLoloReceiptData,
  makeGateOutLoloReceiptData,
  downloadGateOutloloReceiptData,
} from "../../actions/LoloReceiptActions";
import {
  getGateOutTransportReceiptData,
  makeGateOutTransportReceiptData,
  downloadGateOutTransportReceiptData,
} from "../../actions/TransportReceiptActions";

const useStyles = makeStyles((theme) => ({
  paperContainer: {
    padding: theme.spacing(2, 3),
  },
  input: {
    padding: 7,
  },

  LabelTypography: {
    fontSize: 14,
    fontWeight: 600,
    color: "#243545",
    paddingBottom: 4,
  },
  blueBGContainer: {
    backgroundColor: "#EAF0F5",
    borderRadius: 10,
    padding: theme.spacing(1.5, 1.5),
    margin: theme.spacing(0.5, 1),
    // marginTop: 12,
  },
  whiteBGContainer: {
    padding: "2px 18px 8px 18px",
  },
}));

const PaymentHandlingReceipt = (props) => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const store = useSelector((state) => state);
  const { gateOutPaymentReceipt, gateOut } = store;
  const [proformaInvoiceNumber, setProformaInvoiceNumber] = useState("");
  const [proformaInvoiceDate, setProformaInvoiceDate] = useState("");
  // eslint-disable-next-line no-unused-vars
  const [invoiceNumber, setInvoiceNumber] = useState("");
  // eslint-disable-next-line no-unused-vars
  const [invoiceDate, setInvoiceDate] = useState("");
  const [containerNumber, setContainerNumber] = useState("");
  const [clientName, setClientName] = useState("");
  const [truckNumber, setTruckNumber] = useState("");
  const [currency, setCurrency] = useState("");
  const [deliveryDate, setDeliveryDate] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [shipper, setShipper] = useState("");
  const [consignor, setConsignor] = useState("");
  const [chargeType, setChargeType] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [nightAmount, setNightAmount] = useState("");
  const [gst, setGst] = useState("");
   // eslint-disable-next-line no-unused-vars
  const [cgst, setCgst] = useState("");
   // eslint-disable-next-line no-unused-vars
  const [sgst, setSgst] = useState("");
   // eslint-disable-next-line no-unused-vars
  const [igst, setIgst] = useState("");
   // eslint-disable-next-line no-unused-vars
  const [cgstAmount, setCgstAmount] = useState("");
   // eslint-disable-next-line no-unused-vars
  const [sgstAmount, setSgstAmount] = useState("");
   // eslint-disable-next-line no-unused-vars
  const [igstAmount, setIgstAmount] = useState("");
   // eslint-disable-next-line no-unused-vars
  const [netAmount, setNetAmount] = useState("");
   // eslint-disable-next-line no-unused-vars
  const [texableAmount, setTaxableAmount] = useState("");
   // eslint-disable-next-line no-unused-vars
  const [grossAmount, setGrossAmount] = useState("");
  const [remarks, setRemarks] = useState("");
  const notify = useSnackbar().enqueueSnackbar;

  useEffect(() => {
    let req = {
      location: localStorage.getItem("location")
        ? localStorage.getItem("location")
        : null,
      site: localStorage.getItem("site") ? localStorage.getItem("site") : null,
    };
    if (gateOut.gihPKOfContainer) {
      if (props.receiptType === "loloReceipt") {
        dispatch(getGateOutLoloReceiptData(gateOut.gihPKOfContainer, req));
      } else {
        dispatch(getGateOutTransportReceiptData(gateOut.gihPKOfContainer, req));
      }
    }
  }, [props.receiptType, gateOut.gihPKOfContainer]);

  useEffect(() => {
    setProformaInvoiceNumber(gateOutPaymentReceipt.proforma_invoice_no);
    setProformaInvoiceDate(gateOutPaymentReceipt.proforma_invoice_date);
    setInvoiceNumber(gateOutPaymentReceipt.invoice_no);
    setInvoiceDate(gateOutPaymentReceipt.invoice_date);
    setContainerNumber(gateOutPaymentReceipt.container_no);
    setClientName(gateOutPaymentReceipt.client_name);
    setTruckNumber(gateOutPaymentReceipt.truck_no);
    setCurrency(gateOutPaymentReceipt.currency);
    setDeliveryDate(gateOutPaymentReceipt.delivery_date);
    setDueDate(gateOutPaymentReceipt.due_date);
    setShipper(gateOutPaymentReceipt.shipper);
    setConsignor(gateOutPaymentReceipt.consignor);
    setChargeType(gateOutPaymentReceipt.charge_type);
    setDescription(gateOutPaymentReceipt.description);
    setAmount(gateOutPaymentReceipt.amount);
    setNightAmount(gateOutPaymentReceipt.night_charges);
    setGst(gateOutPaymentReceipt.gst);
    setCgst(gateOutPaymentReceipt.cgst);
    setSgst(gateOutPaymentReceipt.sgst);
    setIgst(gateOutPaymentReceipt.igst);
    setCgstAmount(gateOutPaymentReceipt.cgst_amount);
    setSgstAmount(gateOutPaymentReceipt.sgst_amount);
    setIgstAmount(gateOutPaymentReceipt.igst_amount);
    setNetAmount(gateOutPaymentReceipt.net_amount);
    setTaxableAmount(gateOutPaymentReceipt.taxable_amount);
    setGrossAmount(gateOutPaymentReceipt.gross_amount);
    setRemarks(gateOutPaymentReceipt.remarks);
  }, [gateOutPaymentReceipt]);



  return (
    <div>
      <Typography
        variant="subtitle2"
        style={{ paddingTop: 14, paddingBottom: 14 }}
      >
        {props.receiptType === "loloReceipt"
          ? "Lolo Receipt Details"
          : "Transport Receipt Details"}
      </Typography>
      <Paper className={classes.paperContainer} elevation={0}>
        <div className={classes.whiteBGContainer}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={4} lg={3}>
              <Typography
                variant="subtitle1"
                className={classes.LabelTypography}
              >
                Proforma Invoice No.
              </Typography>
              <CustomTextfield
                id="proforma-invoice-no"
                value={proformaInvoiceNumber}
                readOnlyP={true}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4} lg={3}>
              <Typography
                variant="subtitle1"
                className={classes.LabelTypography}
              >
                Proforma Invoice date
              </Typography>
            
              <DatePickerField
                dateId="proforma-invoice-date"
                dateValue={proformaInvoiceDate}
                dateChange={(date) => setProformaInvoiceDate(date)}
                dispatchType={"GATE_OUT_LOLO_RECEIPT_PERFORMA_RECEIPT_DATE"}
              />
            </Grid>
           
            <Grid item xs={12} sm={6} md={4} lg={3}>
              <Typography
                variant="subtitle1"
                className={classes.LabelTypography}
              >
                Container No.
              </Typography>
              <CustomTextfield
                id="lolo-receipt-container-no"
                handleChange={(e) => setContainerNumber(e.target.value)}
                value={containerNumber}
                dispatchType={"GATE_OUT_LOLO_RECEIPT_CONTAINER_NUMBER"}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4} lg={3}>
              <Typography
                variant="subtitle1"
                className={classes.LabelTypography}
              >
                Client Name
              </Typography>
              <CustomTextfield
                id="lolo-receipt-client-name"
                handleChange={(e) => setClientName(e.target.value)}
                value={clientName}
                dispatchType={"GATE_OUT_LOLO_RECEIPT_CLIENT_NAME"}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4} lg={3}>
              <Typography
                variant="subtitle1"
                className={classes.LabelTypography}
              >
                Truck Number
              </Typography>
              <CustomTextfield
                id="lolo-receipt-truck-number"
                handleChange={(e) => setTruckNumber(e.target.value)}
                value={truckNumber}
                dispatchType={"GATE_OUT_LOLO_RECEIPT_TRUCK_NUMBER"}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4} lg={3}>
              <Typography
                variant="subtitle1"
                className={classes.LabelTypography}
              >
                Currency
              </Typography>
              <CustomTextfield
                id="lolo-receipt-currency"
                handleChange={(e) => setCurrency(e.target.value)}
                value={currency}
                dispatchType={"GATE_OUT_LOLO_RECEIPT_CURRENCY"}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4} lg={3}>
              <Typography
                variant="subtitle1"
                className={classes.LabelTypography}
              >
                Delivery date
              </Typography>
              
              <DatePickerField
                dateId="lolo-receipt-delivery-date"
                dateValue={deliveryDate}
                dateChange={(date) => setDeliveryDate(date)}
                dispatchType={"GATE_OUT_LOLO_RECEIPT_DELIVERY_DATE"}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4} lg={3}>
              <Typography
                variant="subtitle1"
                className={classes.LabelTypography}
              >
                Due date
              </Typography>
            
              <DatePickerField
                dateId="lolo-receipt-due-date"
                dateValue={dueDate}
                dateChange={(date) => setDueDate(date)}
                dispatchType={"GATE_OUT_LOLO_RECEIPT_DUE_DATE"}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4} lg={3}>
              <Typography
                variant="subtitle1"
                className={classes.LabelTypography}
              >
                Shipper
              </Typography>
              <CustomTextfield
                id="lolo-receipt-shipper"
                handleChange={(e) => setShipper(e.target.value)}
                value={shipper}
                //   validation
                dispatchType={"GATE_OUT_LOLO_RECEIPT_SHIPPER"}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4} lg={3}>
              <Typography
                variant="subtitle1"
                className={classes.LabelTypography}
              >
                Consignor
              </Typography>
              <CustomTextfield
                id="lolo-receipt-consignor"
                handleChange={(e) => setConsignor(e.target.value)}
                value={consignor}
                //   validation
                dispatchType={"GATE_OUT_LOLO_RECEIPT_CONSIGNOR"}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4} lg={3}>
              <Typography
                variant="subtitle1"
                className={classes.LabelTypography}
              >
                Charge type
              </Typography>
              <CustomTextfield
                id="lolo-receipt-charge-type"
                handleChange={(e) => setChargeType(e.target.value)}
                value={chargeType}
                //   validation
                dispatchType={"GATE_OUT_LOLO_RECEIPT_CHARGE_TYPE"}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4} lg={3}>
              <Typography
                variant="subtitle1"
                className={classes.LabelTypography}
              >
                Description
              </Typography>
              <CustomTextfield
                id="lolo-receipt-description"
                handleChange={(e) => setDescription(e.target.value)}
                value={description}
                //   validation
                dispatchType={"GATE_OUT_LOLO_RECEIPT_DESCRIPTION"}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4} lg={3}>
              <Typography
                variant="subtitle1"
                className={classes.LabelTypography}
              >
                Amount
              </Typography>
              <CustomTextfield
                id="lolo-receipt-amount"
                handleChange={(e) => setAmount(e.target.value)}
                value={amount}
                //   validation
                dispatchType={"GATE_OUT_LOLO_RECEIPT_AMOUNT"}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4} lg={3}>
              <Typography
                variant="subtitle1"
                className={classes.LabelTypography}
              >
                Remarks
              </Typography>

              <CustomTextfield
                id="lolo-receipt-remarks"
                handleChange={(e) => setRemarks(e.target.value)}
                value={remarks}
                //   validation
                dispatchType={"GATE_OUT_LOLO_RECEIPT_REMARKS"}
              />
            </Grid>
          </Grid>
        </div>
        <div className={classes.blueBGContainer}>
          <Grid container spacing={3}>
          
            <Grid item xs={12} sm={6} md={4} lg={3}>
              <Typography
                variant="subtitle1"
                className={classes.LabelTypography}
              >
                Gross Amount
              </Typography>
              <CustomTextfield
                id="lolo-receipt-gross-amount"
                value={parseInt(amount) + parseInt(amount) * gst}
                readOnlyP={true}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4} lg={3}>
              <Typography
                variant="subtitle1"
                className={classes.LabelTypography}
              >
                Night Charge Amount
              </Typography>
              <CustomTextfield
                id="lolo-receipt-gross-amount"
                value={parseInt(nightAmount)}
                handleChange={(e) => setNightAmount(e.target.value)}
                readOnlyP={true}
                dispatchType={"GATE_OUT_LOLO_RECEIPT_NIGHT_CHARGES"}
              />
            </Grid>
          </Grid>
        </div>
        <div style={{ display: "flex", justifyContent: "center", margin: 20 }}>
          <Button
            style={{
              width: "30%",

              borderRadius: 6,
              backgroundColor: "#2A5FA5",
              color: "#fff",
              border: "none",
              marginRight: 20,
            }}
            onClick={() => {
              if (props.receiptType === "loloReceipt") {
                if (gateOutPaymentReceipt.amount === "") {
                  notify("Please Enter Amount", { variant: "warning" });
                } 
             
                else {
                  setTimeout(() => {
                    dispatch(
                      makeGateOutLoloReceiptData(
                        gateOut.gihPKOfContainer,
                        gateOutPaymentReceipt,
                        notify
                      )
                    );
                  }, 500);
                }
              } else {
                if (gateOutPaymentReceipt.amount === "") {
                  notify("Please Enter Amount", { variant: "warning" });
                }
               
                else {
                  setTimeout(() => {
                    dispatch(
                      makeGateOutTransportReceiptData(
                        gateOut.gihPKOfContainer,
                        gateOutPaymentReceipt,
                        notify
                      )
                    );
                  }, 500);
                }
              }
            }}
          >
            Save
          </Button>
          {gateOut.gihPKOfContainer && (
            <Button
              style={{
                width: "30%",

                borderRadius: 6,
                backgroundColor: "#FDBD2E",
                color: "#fff",
                border: "none",
                marginLeft: 20,
              }}
              onClick={() => {
                let req = {
                  location: localStorage.getItem("location")
                    ? localStorage.getItem("location")
                    : null,
                  site: localStorage.getItem("site")
                    ? localStorage.getItem("site")
                    : null,
                };
                if (props.receiptType === "loloReceipt") {
                  setTimeout(() => {
                    dispatch(
                      downloadGateOutloloReceiptData(
                        gateOut.gihPKOfContainer,
                        req
                      )
                    );
                  }, 500);
                } else {
                  setTimeout(() => {
                    dispatch(
                      downloadGateOutTransportReceiptData(
                        gateOut.gihPKOfContainer,
                        req
                      )
                    );
                  }, 500);
                }
              }}
            >
              Print
            </Button>
          )}
        </div>
      </Paper>
    </div>
  );
};

export default PaymentHandlingReceipt;
