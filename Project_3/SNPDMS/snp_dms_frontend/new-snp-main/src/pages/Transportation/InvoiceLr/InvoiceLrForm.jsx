import React, { useEffect, useState } from "react";
import {
  Grid,
  Button,
  Box,
  TextField,
  Card,
  CardContent,
  FormControlLabel,
  Tooltip,
  CardHeader,
  Fab,
  Typography,
  MenuItem,
  CircularProgress,
  useMediaQuery,
  Accordion,
  AccordionDetails,
  AccordionSummary
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { createTheme, ThemeProvider } from "@mui/material";
import { Image } from "semantic-ui-react";
import MUIDataTable from "mui-datatables";
import { useDispatch, useSelector } from "react-redux";
import LayoutContainer from "@components/reusablecomponents/LayoutContainer";
import { Formik } from "formik";
import * as Yup from "yup";
import {
  getInvoiceLrDetailsById,
  addInvoiceLr,
  updateInvoiceLr,
  clearInvoiceLrData,
  getBillLineDataByCutomerName,
  cancleInvoiceEffect,
  deleteInvoiceLrData,
  getInvoiceLrListing,
  deleteInvoiceLRDataReset,
} from "../../../actions/transportation/InvoiceLrActions";
import { useHistory } from "react-router-dom";
import { useSnackbar } from "notistack";
import { dropDownDispatch } from "../../../actions/GateInActions";
import {
  getFormDependencyListing,
  getEntryNumberDependencyListing,
} from "../../../actions/transportation/MasterActions";
import moment from "moment";
import ConfirmModal from "../../../commomComponents/modal/confirmationModal";
import "./invoice.css";
// eslint-disable-next-line no-unused-vars
import { values } from "lodash";
import BACKIMAGE from '../../../assets/images/back-arrow.png'
// eslint-disable-next-line no-unused-vars
var a = [
  "",
  "one ",
  "two ",
  "three ",
  "four ",
  "five ",
  "six ",
  "seven ",
  "eight ",
  "nine ",
  "ten ",
  "eleven ",
  "twelve ",
  "thirteen ",
  "fourteen ",
  "fifteen ",
  "sixteen ",
  "seventeen ",
  "eighteen ",
  "nineteen ",
];
// eslint-disable-next-line no-unused-vars
var b = [
  "",
  "",
  "twenty",
  "thirty",
  "forty",
  "fifty",
  "sixty",
  "seventy",
  "eighty",
  "ninety",
];


var DialogMessage = "";
export default function InvoiceLrForm(props) {
   const getMuiTheme = () =>
     createTheme({
       components: {
         MUIDataTableHeadCell: {
           styleOverrides: {
             data: {
               textAlign: "center",
               fontWeight: "bold",
             },
             fixedHeader: {
               textAlign: "center",
               fontWeight: "bold",
             },
           },
         },
         MUIDataTable:{
           styleOverrides: {
             responsiveBase: {
               zIndex: "0",
             },
             tableRoot: {
               border: "0px",
               xs: 0,
               sm: 600,
               md: 960,
               lg: 1280,
               xl: 1920,
             },
           },
         },
         MUIDataTableBodyRow: {
           styleOverrides: {
             root: {
               "&:nth-child(odd)": {
                 backgroundColor: "#f7f7f7",
               },
               "&:hover": {
                 backgroundColor: "#f1f0fb !important",
               },
             },
           },
         },
         MuiTableCell: {
           styleOverrides: {
             head: {
               backgroundColor: "#f1f0fb !important",
               padding: "5px 10px !important",
             },
             root: {
               border: "1px solid rgba(0,0,0,.125)",
               padding: "5px 10px !important",
             },
           },
         },
       },
     
     });
  const dispatch = useDispatch();

  const store = useSelector((state) => state);
  const invoiceLrDetails = useSelector(
    (state) => state.invoiceLrMaster?.invoiceLrDetails
  );
  const billLineDetails = useSelector(
    (state) => state.invoiceLrMaster?.billLineDetails
  );
  const stateList = useSelector(
    (state) => state.masterReducer?.masterData?.state
  );
  const masterList = useSelector((state) => state.masterReducer?.masterData);
  const entryNumberData = useSelector(
    (state) => state.masterReducer?.entryNumberList
  );
  const [invoicePk, setInvoicePk] = useState("");
  const [isOpenConfirmModal, setIsOpenConfirmModal] = useState(false);
  // eslint-disable-next-line no-unused-vars
  const [show, setShow] = useState(false);
  // eslint-disable-next-line no-unused-vars
  const [loading, setLoading] = useState(false);
  const [billingData, setBillingData] = useState(null);
  const [actionType, setActionType] = useState("");
  const [totalAmount, setTotalAmount] = useState("");
  // eslint-disable-next-line no-unused-vars
  const [dueAmount, setDueAmount] = useState("");
  const [totalAmountInWords, setTotalAmountInWords] = useState("");
  // eslint-disable-next-line no-unused-vars
  const [stateData, setStateData] = useState(null);
  const { gateIn } = store;
  const history = useHistory();
  const notify = useSnackbar().enqueueSnackbar;
  // eslint-disable-next-line no-unused-vars
  const [Location, setLocation] = useState(
    localStorage.getItem("location") ? localStorage.getItem("location") : ""
  );
  // eslint-disable-next-line no-unused-vars
  const [site, setSite] = useState(
    localStorage.getItem("site") ? localStorage.getItem("site") : ""
  );
  const deleteInvoiceLr = useSelector(
    (state) => state.invoiceLrMaster.deleteInvoiceLr
  );
  const [expanded, setExpanded] = useState(false);
  const handleAccordianChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };
  const getBillNumber = () => {
    let url = window.location.pathname?.split("/");
    if (url[url?.length - 1] === "invoice-lr-form") {
      return entryNumberData?.invoice_bill_data?.bill_no;
    }
  };
  const matchesIphone = useMediaQuery("(max-width:400px)");
 
  const [invoiceLrData, setInvoiceLrData] = useState({
    pk: "",
    booking_type: "Booking",
    bill_no: getBillNumber(),
    bill_type: "Freight",
    bill_date: moment(new Date()).format("YYYY-MM-DD"),
    customer: "",
    address: "",
    state: "",
    state_code: "",
    gst_no: "",
    pan_no: "",
    company_account: "",
    total_amount_without_tax: "0",
    due_total_amount: "0",
    location: localStorage.getItem("location")
      ? localStorage.getItem("location")
      : "",
    site: localStorage.getItem("site") ? localStorage.getItem("site") : "",
    invoice_line: [],
  });
  const getBillLineData = (customerName) => {
    let reqData = {
      customer: customerName,
      location: localStorage.getItem("location")
        ? localStorage.getItem("location")
        : "",
      site: localStorage.getItem("site") ? localStorage.getItem("site") : "",
    };
    dispatch(getBillLineDataByCutomerName(reqData));
    dispatch(deleteInvoiceLRDataReset());
  };

  function containsOnlyNumbers(str) {
    return /^\d+$/.test(str);
  }
  useEffect(() => {
    let url = window.location.pathname?.split("/");
    const propsUrl = url[url?.length - 1];
    if (!containsOnlyNumbers(propsUrl)) {
      invoiceLrData["bill_no"] =
        entryNumberData?.invoice_bill_data &&
        entryNumberData?.invoice_bill_data?.bill_no
          ? entryNumberData?.invoice_bill_data?.bill_no
          : "";
      let tempInvoiceData = { ...invoiceLrData };
      setInvoiceLrData(tempInvoiceData);
    }
   
// eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entryNumberData]);

  useEffect(() => {
    if (billLineDetails) {
      let url = window.location.pathname?.split("/");
      if (url[url?.length - 1] === "invoice-lr-form") {
        inWords(billLineDetails.total_amount);
        delete billLineDetails["total_amount"];
        delete billLineDetails["total_freight_amount"];
        setBillingData(billLineDetails);
      } else {
        let tempObj = { ...billLineDetails };
        delete tempObj["total_amount"];
        delete tempObj["total_freight_amount"];
        const mergedObject = {
          ...billingData,
          ...tempObj,
        };
        const sum = Object.keys(mergedObject).reduce((accumulator, value) => {
          return accumulator + +mergedObject[value]?.total_amount;
        }, 0);
        inWords(sum.toString());

        setBillingData(mergedObject);
      }
    }
   
// eslint-disable-next-line react-hooks/exhaustive-deps
  }, [billLineDetails]);
  const inWords = (numberInput) => {
    let numberVal = numberInput?.split(".");
    let oneToTwenty = [
      "",
      "one ",
      "two ",
      "three ",
      "four ",
      "five ",
      "six ",
      "seven ",
      "eight ",
      "nine ",
      "ten ",
      "eleven ",
      "twelve ",
      "thirteen ",
      "fourteen ",
      "fifteen ",
      "sixteen ",
      "seventeen ",
      "eighteen ",
      "nineteen ",
    ];
    let tenth = [
      "",
      "",
      "twenty",
      "thirty",
      "forty",
      "fifty",
      "sixty",
      "seventy",
      "eighty",
      "ninety",
    ];

    let num =
      numberVal?.length > 0 &&
      ("0000000" + numberVal[0])
        .slice(-7)
        .match(/^(\d{1})(\d{1})(\d{2})(\d{1})(\d{2})$/);
    if (!num) return;

    let outputText =
      num[1] !== 0
        ? (oneToTwenty[Number(num[1])] ||
            `${tenth[num[1][0]]} ${oneToTwenty[num[1][1]]}`) + " million "
        : "";

    outputText +=
      num[2] !== 0
        ? (oneToTwenty[Number(num[2])] ||
            `${tenth[num[2][0]]} ${oneToTwenty[num[2][1]]}`) + "hundred "
        : "";
    outputText +=
      num[3] !== 0
        ? (oneToTwenty[Number(num[3])] ||
            `${tenth[num[3][0]]} ${oneToTwenty[num[3][1]]}`) + " thousand "
        : "";
    outputText +=
      num[4] !== 0
        ? (oneToTwenty[Number(num[4])] ||
            `${tenth[num[4][0]]} ${oneToTwenty[num[4][1]]}`) + "hundred "
        : "";
    outputText +=
      num[5] !== 0
        ? oneToTwenty[Number(num[5])] ||
          `${tenth[num[5][0]]} ${oneToTwenty[num[5][1]]} `
        : "";
    setTotalAmount(numberInput);
    setDueAmount(numberInput);
    setTotalAmountInWords(outputText);
  };
  const openResponseModal = (type, pk) => {
    setInvoicePk(pk);
    setActionType(type);
    setIsOpenConfirmModal(true);
    DialogMessage = "Are you sure you want to delete this Invoice?";
  };

  const removeClick = (key, values, setFieldValue) => {
    if (Object.keys(billingData).length < 2) {
      notify("atleast one bill required for invoice", {
        variant: "error",
      });
    } else {
      if (values.pk) {
        let tempArray = [...values.delete_invoice_list];
        tempArray.push(key);
        setFieldValue("delete_invoice_list", tempArray);
      }
      delete billingData[key];
      let tempData = { ...billingData };
      const sum = Object.keys(tempData).reduce((accumulator, value) => {
        return accumulator + +tempData[value]?.total_amount;
      }, 0);
      inWords(sum.toString());
      setBillingData(tempData);
    }
  };
  const columns = [
    {
      label: "Particular",
      name: "particular",
      options: {
        sort: false,
        filter: false,
        options: {
          setCellProps: () => ({
            style: {
              display: "flex",
              justifyContent: "center",
            },
          }),
        },
        customBodyRender: (value, tableMeta, updateValue) => {
          return (
            <FormControlLabel
              style={{ width: "100%" }}
              control={
                <div style={{ display: "flex", margin: "auto" }}>
                  {tableMeta.tableData[tableMeta.rowIndex]["particular"]}
                </div>
              }
            />
          );
        },
      },
    },
    {
      label: "Services",
      name: "services",
      options: {
        sort: false,
        filter: false,
        options: {
          setCellProps: () => ({
            style: {
              display: "flex",
              justifyContent: "center",
            },
          }),
        },
        customBodyRender: (value, tableMeta, updateValue) => {
          return (
            <FormControlLabel
              style={{ width: "100%" }}
              control={
                <div style={{ display: "flex", margin: "auto" }}>
                  {tableMeta.tableData[tableMeta.rowIndex]["services"]}
                </div>
              }
            />
          );
        },
      },
    },
    {
      label: "Sac Code",
      name: "sac_code",
      options: {
        sort: false,
        filter: false,
        options: {
          setCellProps: () => ({
            style: {
              display: "flex",
              justifyContent: "center",
            },
          }),
        },
        customBodyRender: (value, tableMeta, updateValue) => {
          return (
            <FormControlLabel
              style={{ width: "100%" }}
              control={
                <div style={{ display: "flex", margin: "auto" }}>
                  {tableMeta.tableData[tableMeta.rowIndex]["sac_code"]}
                </div>
              }
            />
          );
        },
      },
    },
    {
      label: "Under rcm",
      name: "under_rcm",
      options: {
        sort: false,
        filter: false,
        options: {
          setCellProps: () => ({
            style: {
              display: "flex",
              justifyContent: "center",
            },
          }),
        },
        customBodyRender: (value, tableMeta, updateValue) => {
          return (
            <FormControlLabel
              style={{ width: "100%" }}
              control={
                <div style={{ display: "flex", margin: "auto" }}>
                  {tableMeta.tableData[tableMeta.rowIndex]["under_rcm"]}
                </div>
              }
            />
          );
        },
      },
    },
    {
      label: "Freight Amount",
      name: "freight_amount",
      options: {
        sort: false,
        filter: false,
        options: {
          setCellProps: () => ({
            style: {
              display: "flex",
              justifyContent: "center",
            },
          }),
        },
        customBodyRender: (value, tableMeta, updateValue) => {
          return (
            <FormControlLabel
              style={{ width: "100%" }}
              control={
                <div style={{ display: "flex", margin: "auto" }}>
                  {tableMeta.tableData[tableMeta.rowIndex]["freight_amount"]}
                </div>
              }
            />
          );
        },
      },
    },

    {
      label: "Gst Rate",
      name: "gst_rate",
      options: {
        sort: false,
        filter: false,
        options: {
          setCellProps: () => ({
            style: {
              display: "flex",
              justifyContent: "center",
            },
          }),
        },
        customBodyRender: (value, tableMeta, updateValue) => {
          return (
            <FormControlLabel
              style={{ width: "100%" }}
              control={
                <div style={{ display: "flex", margin: "auto" }}>
                  {tableMeta.tableData[tableMeta.rowIndex]["gst_rate"]}
                </div>
              }
            />
          );
        },
      },
    },
    {
      label: "Total Amount",
      name: "total_amount",
      options: {
        sort: false,
        filter: false,
        options: {
          setCellProps: () => ({
            style: {
              display: "flex",
              justifyContent: "center",
            },
          }),
        },
        customBodyRender: (value, tableMeta, updateValue) => {
          return (
            <FormControlLabel
              style={{ width: "100%" }}
              control={
                <div style={{ display: "flex", margin: "auto" }}>
                  {tableMeta.tableData[tableMeta.rowIndex]["total_amount"]}
                </div>
              }
            />
          );
        },
      },
    },
  ];
  useEffect(() => {
    let url = window.location.pathname?.split("/");
    if (url[url?.length - 1] !== "invoice-lr-form") {
      dispatch(getInvoiceLrDetailsById(url[url.length - 1]));
    }
    let reqArray = [
      "indian_states",
      "client_ref_codes",
      "location_site_dashboard_list",
    ];
    let reqBody = {
      field_list: ["state", "customer", "invoice_bill_data"],
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
    let paymentData = {
      pk: "",
      booking_type: "Booking",
      bill_no: getBillNumber(),
      bill_type: "Freight",
      bill_date: moment(new Date()).format("YYYY-MM-DD"),
      customer: "",
      address: "",
      state: "",
      state_code: "",
      gst_no: "",
      pan_no: "",
      company_account: "",
      total_amount_without_tax: "0",
      location: localStorage.getItem("location")
        ? localStorage.getItem("location")
        : "",
      site: localStorage.getItem("site") ? localStorage.getItem("site") : "",
      invoice_line: [],
    };
    dispatch(getInvoiceLrListing(paymentData));
    closeConfirmModal();
   
// eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deleteInvoiceLr]);

  useEffect(() => {
    if (invoiceLrDetails) {
      setBillingData(invoiceLrDetails.invoice_line);
      inWords(invoiceLrDetails?.total_amount);
      setInvoiceLrData(invoiceLrDetails);
    }
  }, [invoiceLrDetails]);

  useEffect(() => {
    if (stateList) {
      setStateData(stateList);
    }
  }, [stateList]);

  const handleGoBack = () => {
    dispatch(clearInvoiceLrData());
    history.goBack();
  };
  const redirectToIncoicePrint = () => {
    let url = window.location.pathname?.split("/");
    history.push(`/transport/invoice-lr-print/${url[url?.length - 1]}`);
  };
  const actionProcess = () => {
    // let tempBillingData = invoiceLrData.invoice_line.filter(
    //   (item) => item.pk !== invoicePk
    // );
    let deleteArray = [];
    if (actionType === "delete") {
      deleteArray.push(invoicePk);
      dispatch(deleteInvoiceLrData(deleteArray, history, notify));
      dispatch(deleteInvoiceLRDataReset());
    }
    // const tempInvoiceData = { ...invoiceLrData, invoice_line: tempBillingData };
  };
  const closeConfirmModal = () => {
    setIsOpenConfirmModal(false);
  };
  const formatedData = (values) => {
    delete billingData["total_amount"];
    delete billingData["total_freight_amount"];
    let tempBillData = { ...billingData };
    let tempObj = {
      pk: values?.pk ? values.pk : "",
      booking_type: values.booking_type,
      bill_no: values.bill_no,
      bill_type: values.bill_type,
      bill_date: values.bill_date,
      customer: values.customer,
      delete_invoice_list:
        values?.delete_invoice_list?.length > 0
          ? values?.delete_invoice_list
          : [],
      address: values.address,
      state: values.state,
      state_code: values.state_code,
      gst_no: values.gst_no,
      pan_no: values.pan_no,
      company_account: values.company_account,
      total_amount_without_tax: "0",
      total_amount: totalAmount,
      due_total_amount: values.pk ? values?.due_total_amount : totalAmount,
      location: values.location,
      site: values.site,
      invoice_line: tempBillData,
    };
    return tempObj;
  };
  const handleTransactionEffect = (pk) => {
    dispatch(cancleInvoiceEffect(pk));
    // setLoading(!loading);
    // setTimeout(() => {
    //   setLoading(!loading);
    //   setShow(!show);
    // }, 2000);
  };
  const gstRegExp = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
  const panRegExp = /([A-Z]){5}([0-9]){4}([A-Z]){1}$/;
  if (loading)
    return (
      <div style={{ marginLeft: "46%", marginTop: "25%" }}>
        <CircularProgress />;
      </div>
    );
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
            title={`${invoiceLrData.pk ? "Update" : "Create"} Invoice LR`}
          />
          <CardContent>
            <Formik
              initialValues={invoiceLrData}
              enableReinitialize={true}
              validationSchema={Yup.object().shape({
                bill_date: Yup.string().required("Bill Date is Required"),
                state: Yup.string().required("state is Required"),
                state_code: Yup.string().required("state Code is Required"),
                location: Yup.string().required("Location is Required"),
                site: Yup.string().required("Site is Required"),
                gst_no: Yup.string().matches(
                  gstRegExp,
                  "GST Number is not valid"
                ),
                pan_no: Yup.string().matches(
                  panRegExp,
                  "PAN Number is not valid"
                ),
              })}
              onSubmit={async (values) => {
                try {
                  let requestBody = formatedData(values);
                  if (values.pk) {
                    await dispatch(
                      updateInvoiceLr(requestBody, history, notify)
                    );
                  } else {
                    await dispatch(addInvoiceLr(requestBody, history, notify));
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
                    <Grid item size={{xs:12,lg:4}} >
                      <Typography variant="subtitle1">Booking Type</Typography>
                      <TextField
                        placeholder="Booking Type"
                        margin="none"
                        name="booking_type"
                        fullWidth
                        onBlur={handleBlur}
                        onChange={handleChange}
                        type="text"
                        size="small"
                        value={values.booking_type}
                        variant="outlined"
                        disabled
                      />
                    </Grid>
                    <Grid item size={{xs:12,lg:4}}>
                      <Typography variant="subtitle1">Bill Number</Typography>
                      <TextField
                        placeholder="Bill Number"
                        margin="none"
                        name="bill_no"
                        fullWidth
                        onBlur={handleBlur}
                        onChange={handleChange}
                        type="text"
                        size="small"
                        value={values.bill_no}
                        variant="outlined"
                        disabled
                      />
                    </Grid>
                    <Grid item size={{xs:12,lg:4}}>
                      <Typography variant="subtitle1">Bill Type</Typography>
                      <TextField
                        placeholder="Bill Type"
                        margin="none"
                        name="bill_type"
                        fullWidth
                        onBlur={handleBlur}
                        onChange={handleChange}
                        type="text"
                        size="small"
                        value={values.bill_type}
                        variant="outlined"
                        disabled
                      />
                    </Grid>
                    <Grid item size={{xs:12,lg:4}}>
                      <Typography variant="subtitle1">
                        Bill Date <span style={{ color: "red" }}>*</span>
                      </Typography>
                      <TextField
                        error={Boolean(touched.bill_date && errors.bill_date)}
                        helperText={touched.bill_date && errors.bill_date}
                        placeholder="Bill Date"
                        margin="none"
                        name="bill_date"
                        fullWidth
                        onBlur={handleBlur}
                        onChange={handleChange}
                        type="date"
                        size="small"
                        value={values.bill_date}
                        variant="outlined"
                      />
                    </Grid>
                    <Grid item size={{xs:12,lg:4}}>
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
                    <Grid item size={{xs:12,lg:4}}>
                      <Typography variant="subtitle1">
                        Site<span style={{ color: "red" }}>*</span>
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
                          ]?.map((option) => (
                            <MenuItem key={option} value={option}>
                              {option}
                            </MenuItem>
                          ))}
                      </TextField>
                    </Grid>
                    <Grid item size={{xs:12,lg:6}} >
                      <Typography variant="subtitle1">
                        Customer
                        <span style={{ color: "red" }}>*</span>
                      </Typography>
                      <TextField
                        error={Boolean(touched?.customer && errors?.customer)}
                        helperText={touched?.customer && errors?.customer}
                        select
                        margin="none"
                        autoComplete="off"
                        name="customer"
                        fullWidth
                        onBlur={handleBlur}
                        onChange={(e) => {
                          handleChange("customer")(e);
                          setTotalAmount("");
                          setTotalAmountInWords("");
                          dispatch(deleteInvoiceLRDataReset());
                          setTotalAmount("")
                          setTotalAmountInWords("");
                        }}
                        type="text"
                        size="small"
                        value={values?.customer}
                        variant="outlined"
                        disabled={values.pk}
                      >
                        {masterList?.customer?.map((option) => (
                          <MenuItem key={option} value={option}>
                            {option}
                          </MenuItem>
                        ))}
                      </TextField>
                    </Grid>
                    <Grid item size={{xs:12,lg:6}} >
                      <Typography variant="subtitle1">
                        Company Account
                      </Typography>
                      <TextField
                        error={Boolean(
                          touched.company_account && errors.company_account
                        )}
                        helperText={
                          touched.company_account && errors.company_account
                        }
                        placeholder="Company Account"
                        margin="none"
                        name="company_account"
                        inputProps={{ maxLength: 10 }}
                        fullWidth
                        onBlur={handleBlur}
                        onChange={handleChange}
                        type="text"
                        size="small"
                        value={values.company_account}
                        variant="outlined"
                      />
                    </Grid>
                    <Grid item size={{xs:12,lg:6}} >
                      <Typography variant="subtitle1">GST Number</Typography>
                      <TextField
                        error={Boolean(touched.gst_no && errors.gst_no)}
                        helperText={touched.gst_no && errors.gst_no}
                        placeholder="GST In"
                        margin="none"
                        name="gst_no"
                        fullWidth
                        onBlur={handleBlur}
                        onChange={handleChange}
                        type="text"
                        size="small"
                        value={values.gst_no}
                        variant="outlined"
                      />
                    </Grid>
                    <Grid item size={{xs:12,lg:6}} >
                      <Typography variant="subtitle1">Pan Number</Typography>
                      <TextField
                        error={Boolean(touched.pan_no && errors.pan_no)}
                        helperText={touched.pan_no && errors.pan_no}
                        placeholder="Pan Number"
                        margin="none"
                        name="pan_no"
                        fullWidth
                        onBlur={handleBlur}
                        onChange={handleChange}
                        type="text"
                        size="small"
                        value={values.pan_no}
                        variant="outlined"
                      />
                    </Grid>

                    <Grid item size={{xs:12,lg:6}}>
                      <Typography variant="subtitle1">
                        State<span style={{ color: "red" }}>*</span>{" "}
                      </Typography>
                      <TextField
                        error={Boolean(touched.state && errors.state)}
                        helperText={touched.state && errors.state}
                        select
                        placeholder="State"
                        margin="none"
                        autoComplete="off"
                        name="state"
                        fullWidth
                        onBlur={handleBlur}
                        onChange={(e) => {
                          handleChange("state")(e);
                          setFieldValue(
                            "state_code",
                            stateList[e.target.value]
                          );
                        }}
                        type="text"
                        size="small"
                        value={values.state}
                        variant="outlined"
                      >
                        {stateList &&
                          Object.keys(stateList).map((option) => (
                            <MenuItem key={option} value={option}>
                              {option}
                            </MenuItem>
                          ))}
                      </TextField>
                    </Grid>
                    <Grid item size={{xs:12,lg:6}}>
                      <Typography variant="subtitle1">
                        State Code <span style={{ color: "red" }}>*</span>
                      </Typography>
                      <TextField
                        error={Boolean(touched.state_code && errors.state_code)}
                        helperText={touched.state_code && errors.state_code}
                        select
                        placeholder="State Code"
                        margin="none"
                        autoComplete="off"
                        name="state_code"
                        fullWidth
                        onBlur={handleBlur}
                        onChange={handleChange}
                        type="text"
                        size="small"
                        value={values.state_code}
                        variant="outlined"
                        disabled
                      >
                        {stateList && (
                          <MenuItem
                            key={stateList[values?.state]}
                            value={stateList[values?.state]}
                          >
                            {stateList[values?.state]}
                          </MenuItem>
                        )}
                      </TextField>
                    </Grid>
                    <Grid item size={{xs:12,lg:6}}>
                      <Typography variant="subtitle1">Address</Typography>
                      <TextField
                        error={Boolean(touched.address && errors.address)}
                        helperText={touched.address && errors.address}
                        placeholder="Address"
                        margin="none"
                        autoComplete="off"
                        className="address-field"
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

                    {values?.customer && (
                      <Grid container size={{xs:12,lg:6}}>
                        {values.pk ? (
                          ""
                        ) : (
                          <Grid
                            item
                            xs={4}
                            lg={4}
                            style={{
                              position: "relative",
                              marginTop: "8px",
                            }}
                          >
                            <Typography
                              variant="subtitle1"
                              style={{ visibility: "hidden" }}
                            >
                              collect btn
                            </Typography>
                            <Button
                              color="primary"
                              size="medium"
                              type="button"
                              variant="outlined"
                         
                              onClick={() => {
                                getBillLineData(values?.customer);
                              }}
                              style={{ width: "100%" }}
                            >
                              Collect
                            </Button>
                          </Grid>
                        )}
                        <Grid
                          item
                          xs={6}
                          lg={6}
                          style={{ marginTop: "44px", marginLeft: "20px" }}
                        >
                          {values.pk ? (
                            " "
                          ) : (
                            <strong style={{ color: "red" }}>
                              Please Click on Collect Button to display the
                              data.
                            </strong>
                          )}
                        </Grid>
                      </Grid>
                    )}

                    <br />
                    <br />
                    <br />
                    <Card className="invoice-bill">
                      {billingData &&
                        Object.keys(billingData).map((option, index) => (
                          <Grid
                            container
                            xs={12}
                            spacing={2}
                            className="invoice-flex"
                          >
                            <Grid
                              item
                              xs={12}
                              lg={11}
                              style={{ marginTop: "15px" }}
                            >
                              <>
                                <Accordion
                                  expanded={expanded === index}
                                  onChange={handleAccordianChange(index)}
                                  style={{
                                    marginBottom: 20,
                                    borderRadius: 5,
                                    boxShadow: 3,
                                  }}
                                >
                                  <AccordionSummary
                                    expandIcon={<ExpandMoreIcon />}
                                    aria-controls="panel1bh-content"
                                    id="panel1bh-header"
                                  >
                                    <Typography
                                      sx={{ width: "33%", flexShrink: 0 }}
                                    >
                                      LR Number - {billingData[option].lr_no}
                                    </Typography>
                                  </AccordionSummary>
                                  <AccordionDetails
                                    style={{
                                      background: "#e5f2ff",
                                      display: "block",
                                    }}
                                  >
                                    <ThemeProvider theme={getMuiTheme()}>
                                      <MUIDataTable
                                        data={billingData[option].lines}
                                        columns={columns}
                                        options={{
                                          selectableRows: "single",
                                          responsive: "scroll",
                                          textLabels: {
                                            body: {
                                              noMatch: loading ? (
                                                <CircularProgress />
                                              ) : (
                                                "Sorry, there is no matching data to display"
                                              ),
                                            },
                                          },
                                          toolbar: {
                                            downloadCsv: "Export Excel",
                                          },
                                          downloadOptions: {
                                            filename:
                                              "invoiceLr-list-" +
                                              new Date().getTime() +
                                              ".csv",
                                            filterOptions: {
                                              useDisplayedColumnsOnly: true,
                                              useDisplayedRowsOnly: true,
                                            },
                                          },
                                          filter: false,
                                          fixedHeaderOptions: false,
                                          viewColumns: false,
                                          print: false,
                                          download: false,
                                          search: false,
                                          pagination: false,
                                        }}
                                      />
                                    </ThemeProvider>
                                  </AccordionDetails>
                                </Accordion>
                              </>
                            </Grid>
                            <Grid
                              item
                              xs={12}
                              lg={1}
                              style={{ padding: "10px 0px 0px 40px" }}
                            >
                              <Fab
                                aria-label="Delete"
                                style={{
                                  height: "40px",
                                  width: "40px",
                                  background: "#bc2929",
                                  color: "white",
                                  marginTop: "12px",
                                }}
                                onClick={(e) => {
                                  removeClick(option, values, setFieldValue);
                                }}
                              >
                                <Tooltip title={"Delete Option"}>
                                  <DeleteIcon />
                                </Tooltip>
                              </Fab>
                            </Grid>
                          </Grid>
                        ))}
                    </Card>
                    <br />
                    <br />
                  </Grid>
                  {totalAmount && (
                    <Grid
                      className="invoice-flex"
                      container
                      xs={12}
                      lg={12}
                      spacing={2}
                    >
                      <Grid item xs={4} lg={4} sx={{
                            "& h6":{
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis"
                            }
                      }}>
                        <Typography variant="subtitle1">
                          Total Amount
                        </Typography>
                        <TextField
                          placeholder="Total Amount"
                          margin="none"
                          name="total_amount"
                          fullWidth
                          onBlur={handleBlur}
                          onChange={handleChange}
                          type="text"
                          size="small"
                          value={totalAmount}
                          variant="outlined"
                          disabled
                        />
                      </Grid>
                      <Grid item xs={4} lg={4} sx={{
                            "& h6":{
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis"
                            }
                      }}>
                        <Typography variant="subtitle1">
                          Total Due Amount
                        </Typography>
                        <TextField
                          placeholder="Total Due Amount"
                          margin="none"
                          name="due_total_amount"
                          fullWidth
                          onBlur={handleBlur}
                          onChange={handleChange}
                          type="text"
                          size="small"
                          value={
                            values.pk ? values?.due_total_amount : totalAmount
                          }
                          variant="outlined"
                          disabled
                        />
                      </Grid>
                      <Grid item xs={4} lg={4} sx={{
                            "& h6":{
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis"
                            }
                      }}> 
                        <Typography variant="subtitle1">
                          Total Amount in words
                        </Typography>
                        <TextField
                          placeholder="Total Amount in words"
                          margin="none"
                          name="total_amount_in_words"
                          fullWidth
                          onBlur={handleBlur}
                          onChange={handleChange}
                          type="text"
                          size="small"
                          value={totalAmountInWords}
                          variant="outlined"
                          disabled
                        />
                      </Grid>
                    </Grid>
                  )}
                  <br />
                  <br />
                  <Box
                    style={{ textAlign: matchesIphone ? "center" : "right", display:matchesIphone ? "block":"flex" }}
                    ml={1}
                    mt={2}
                  >
                    {!show && (
                      <strong
                        style={{
                          color: "red",
                          margin: "10px 10px",
                        }}
                      >
                        {values.is_transaction_effected === true
                          ? "Please clear the transaction effect before updating the Purchase Lists !!!"
                          : ""}
                      </strong>
                    )}
                    {show && ""}
                    {values.pk && (
                      <Button
                        color="secondary"
                        size="medium"
                        type="button"
                        variant="outlined"
                        onClick={redirectToIncoicePrint}
                        style={{ marginRight: "10px" }}
                      >
                        Print Invoice
                      </Button>
                    )}
                    <Button
                      color="primary"
                      disabled={
                        !billingData === true ? true : false
                        // ||
                        // values.is_transaction_effected === true
                      }
                      size="medium"
                      type="submit"
                      variant="outlined"
                  
                      style={{ marginRight: "10px" }}
                    >
                      {values?.pk ? "Update" : "Submit"}
                    </Button>
                    {values.pk ? (
                      <Box style={{marginTop : matchesIphone ? "10px" : "0px"}}>
                        <Button
                          color="secondary"
                          size={matchesIphone ? "large" : "medium" }  
                          type="button"
                          variant="outlined"
                          style={{ marginRight: "10px" }}
                          // disabled={values.is_transaction_effected === true}
                          onClick={() => {
                            openResponseModal("delete", values.pk);
                          }}
                        >
                          Delete
                        </Button>
                        {!show && (
                          <Button
                            color="secondary"
                            size="medium"
                            type="button"
                            variant="outlined"
                            disabled={values.is_transaction_effected === false}
                            onClick={() => {
                              handleTransactionEffect(values?.pk);
                            }}
                          >
                            Cancel Effect
                          </Button>
                        )}
                        {show &&
                          "Cancel Transaction effect is done you can update the form!"}
                      </Box>
                    ) : (
                      ""
                    )}
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
      </div>
    </LayoutContainer>
  );
}
