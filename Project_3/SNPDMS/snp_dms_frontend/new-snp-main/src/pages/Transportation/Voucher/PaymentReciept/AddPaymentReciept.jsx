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
  FormControlLabel,
  Tooltip,
  CircularProgress,
} from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { Formik } from "formik";
import * as Yup from "yup";
import {
  getPaymentDetailsById,
  addPayment,
  updatePayment,
  clearPaymentData,
  getPaymentLine,
  getPaymentListing,
  deletePaymentReset,
} from "../../../../actions/transportation/PaymentAction";
import { useHistory } from "react-router-dom";
import { useSnackbar } from "notistack";
import { dropDownDispatch } from "../../../../actions/GateInActions";
import { getFormDependencyListing, getEntryNumberDependencyListing } from "../../../../actions/transportation/MasterActions";
import MUIDataTable from "mui-datatables";
import { createTheme, ThemeProvider } from "@mui/material";
import ConfirmModal from "../../../../commomComponents/modal/confirmationModal";
import moment from "moment";


export default function AddPayment(props) {
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
  const { gateIn } = store;
  const history = useHistory();
  const notify = useSnackbar().enqueueSnackbar;

  const [stateData, setStateData] = useState(null);
  const [billData, setBillData] = useState(null);
  const [transactionData, setTransactionData] = useState(null);
  const [loading, setLoading] = useState(false);
  const paymentDetails = useSelector(
    (state) => state.paymentMaster.paymentDetails
  );
  const transporterList = useSelector(
    (state) => state.masterReducer?.masterData?.transporter
  );
  const billPartyList = useSelector(
    (state) => state.masterReducer?.masterData?.bill_party
  );
  const transactionList = useSelector(
    (state) => state.masterReducer?.masterData?.bank_list
  );
  const masterList = useSelector((state) => state.masterReducer?.masterData);

  const entryNumberData = useSelector(
    (state) => state.masterReducer?.entryNumberList
  );

  const paymentList = useSelector(
    (state) => state.paymentMaster.getPaymentLine
  );
  const deletePayment = useSelector(
    (state) => state.paymentMaster.deletePurchase
  );

  const getEntryNumber = () => {
    return entryNumberData?.payment_receipt_data?.entry_no;
  };

  const [paymentListData, setPaymentListData] = useState([]);
  const [totalAmount, setTotalAmount] = useState("");
  const [receiptAmount, setReceiptAmount] = useState("");
  const [normalReceiptAmt, setNormalReceiptAmt] = useState("");
  const [normalKasarAmt, setNormalKasarAmt] = useState("");
  const [normalTdsAmt, setNormalTdsAmt] = useState("");
  const [normalTotalAmt, setNormalTotalAmt] = useState("");
  const [kasar, setKasar] = useState("");
  const [transactionEffect, setTransactionEffect] = useState("");
  const [paymentPk, setPaymentPk] = useState("");
  const [actionType, setActionType] = useState("");
  const [isOpenConfirmModal, setIsOpenConfirmModal] = useState(false);
  const [tds, setTds] = useState("");
  const payment_receipt_typeList = ["Cash", "Cheque"];
  const entry_type = ["Normal", "Billwise"];
  const transaction_typeList = ["Payment", "Receipt"];
  const [paymentData, setPaymentData] = useState({
    payment_receipt_type: "",
    entry_type: "",
    transaction: "",
    entry_no: getEntryNumber(),
    entry_date: moment(new Date()).format("YYYY-MM-DD"),
    creditor: "",
    is_transaction_effected: "",
    customer: "",
    truck_no: "",
    extra_charges: "",
    narration: "",
    pay_remarks: "",
    receipt_amount: "",
    kasar: "",
    tds: "",
    total_amount: "",
    transaction_from: "",
    location: localStorage.getItem("location")
      ? localStorage.getItem("location")
      : "",
    site: localStorage.getItem("site") ? localStorage.getItem("site") : "",
    line: [],
  });

  useEffect(() => {
    let url = window.location.pathname.split("/");
    if (url[url?.length - 1] !== "paymentreciept-form") {
      dispatch(getPaymentDetailsById(url[url.length - 1]));
    }

    let reqArray = [
      "payment_receipt_data",
      "transporter",
      "location_site_dashboard_list",
      "bill_party",
      "bank_list",
    ];

    let reqBody = {
      field_list: [
        "payment_receipt_data",
        "transporter",
        "bill_party",
        "bank_list",
      ],
      location: localStorage.getItem("location")
        ? localStorage.getItem("location")
        : null,
      site: localStorage.getItem("site") ? localStorage.getItem("site") : null,
    };
    dispatch(dropDownDispatch(reqArray, notify));
    dispatch(getFormDependencyListing(reqBody));
    dispatch(getEntryNumberDependencyListing(reqBody));
  }, []);

  useEffect(() => {
    if (paymentDetails) {
      setPaymentListData(paymentDetails?.line);
      setTotalAmount(paymentDetails?.total_amount);
      setReceiptAmount(paymentDetails?.receipt_amount);
      setKasar(paymentDetails?.kasar);
      setTds(paymentDetails?.tds);
      setPaymentData(paymentDetails);
      setNormalReceiptAmt(paymentDetails?.receipt_amount);
      setNormalKasarAmt(paymentDetails?.kasar);
      setNormalTdsAmt(paymentDetails?.tds);
      setNormalTotalAmt(paymentDetails?.total_amount);
      setTransactionEffect(paymentDetails?.is_transaction_effected);
    }
  }, [paymentDetails]);

  useEffect(() => {
    if (transporterList) {
      setStateData(transporterList);
    }
  }, [transporterList]);

  useEffect(() => {
    if (billPartyList) {
      setBillData(billPartyList);
    }
  }, [billPartyList]);

  useEffect(() => {
    if (transactionList) {
      setTransactionData(transactionList);
    }
  }, [transactionList]);

  function containsOnlyNumbers(str) {
    return /^\d+$/.test(str);
  }
  useEffect(() => {
    let url = window.location.pathname?.split("/");
    const propsUrl = url[url?.length - 1]
    if(!containsOnlyNumbers(propsUrl)){
      paymentData["entry_no"] = entryNumberData?.payment_receipt_data?.entry_no;
    }
  }, [entryNumberData]);

  const handleGoBack = () => {
    dispatch(clearPaymentData());
    history.goBack();
  };
  const handleCollect = (creditor, customer) => {
    let data = {
      location: localStorage.getItem("location")
        ? localStorage.getItem("location")
        : "",
      site: localStorage.getItem("site") ? localStorage.getItem("site") : "",
      transporter: paymentData?.transaction === "Receipt" ? " " : creditor,
      customer: paymentList.transaction === "Payment" ? " " : customer,
    };
    dispatch(getPaymentLine(data));
    dispatch(clearPaymentData());
  };

  const onDelete = (pk) => {
    let tempArray = [...paymentListData];
    if (tempArray.length > 1) {
      var index = tempArray
        .map((x) => {
          return x.pk;
        })
        .indexOf(pk);
      tempArray.splice(index, 1);
      let receiptAmount = tempArray.reduce((accumulator, object) => {
        return accumulator + +object.receipt_amount;
      }, 0);
      let kasarAmount = tempArray.reduce((accumulator, object) => {
        return accumulator + +object.kasar;
      }, 0);
      let tdsAmount = tempArray.reduce((accumulator, object) => {
        return accumulator + +object.tds;
      }, 0);
      let tds = getTdsAmount();
      let kasar = getKasarAmount();
      let totalAmount = receiptAmount + +tds + +kasar;
      setTotalAmount(totalAmount.toString());
      setReceiptAmount(receiptAmount);
      setTds(tdsAmount);
      setKasar(kasarAmount);
      setPaymentListData(tempArray);
      dispatch(clearPaymentData());
    } else {
      notify("Atleast one lisitng is required", {
        variant: "error",
      });
    }
  };

  const getReceiptAmount = () => {
    let tempArray = [...paymentListData];
    let receiptAmount = tempArray.reduce((accumulator, object) => {
      return accumulator + +object.receipt_amount;
    }, 0);
    return receiptAmount.toString();
  };

  const getKasarAmount = () => {
    let tempArray = [...paymentListData];
    let kasarAmount = tempArray.reduce((accumulator, object) => {
      return accumulator + +object.kasar;
    }, 0);
    return kasarAmount.toString();
  };
  const getTdsAmount = () => {
    let tempArray = [...paymentListData];
    let tdsAmount = tempArray.reduce((accumulator, object) => {
      return accumulator + +object.tds;
    }, 0);
    return tdsAmount.toString();
  };

  const getTotalAmt = () => {
    let totalKasar = getKasarAmount();
    let totalTds = getTdsAmount();
    let totalReceipt = getReceiptAmount();
    let totalAmt = +totalKasar + +totalTds + +totalReceipt;
    return totalAmt.toString();
  };

  const getNormalTotalAmount = (
    normalReceiptAmt,
    normalKasarAmt,
    normalTdsAmt
  ) => {
    let tempNormalTotalAmt =
      +normalReceiptAmt + +normalKasarAmt + +normalTdsAmt;
    setNormalTotalAmt(tempNormalTotalAmt.toString());
  };

  useEffect(() => {
    if (paymentList?.length > 0) {
      let url = window.location.pathname.split("/");
      if (url[url?.length - 1] !== "paymentreciept-form") {
        let tempArray = [...paymentListData];
        paymentList.map((item, index) => {
          tempArray.push(item);
        });
        let totalAmt = 0;
        for (const value in tempArray) {
          totalAmt =
            totalAmt +
            Number(tempArray[value].receipt_amount) +
            Number(tempArray[value].kasar) +
            Number(tempArray[value].tds);
        }
        setPaymentListData(tempArray);
        setTotalAmount(totalAmt.toString());
        setReceiptAmount(receiptAmount.toString());
        dispatch(clearPaymentData());
      } else {
        const totalAmt = getTotalAmt();
        const totalReceiptAmt = getReceiptAmount();
        const totalTdsAmt = getTdsAmount();
        const totalKasar = getKasarAmount();
        setTotalAmount(totalAmt);
        setReceiptAmount(totalReceiptAmt);
        setKasar(totalKasar);
        setTds(totalTdsAmt);
        setPaymentListData(paymentList);
        dispatch(clearPaymentData());
      }
    }
  }, [paymentList]);

  const handleReceiptChange = (e, id) => {
    let customerIndex = paymentListData.findIndex((x) => x.pk === id);
    setPaymentListData([]);
    const data = [...paymentListData];
    data[customerIndex]["receipt_amount"] = e.target.value;
    setPaymentListData(data);
    let finalReceiptAmt = getReceiptAmount();
    setReceiptAmount(finalReceiptAmt);
    let finalTotalAmt = getTotalAmt();
    setTotalAmount(finalTotalAmt);
    dispatch(clearPaymentData());
  };
  const handleKasarChange = (e, id) => {
    let customerIndex = paymentListData.findIndex((x) => x.pk === id);
    setPaymentListData([]);
    const data = [...paymentListData];
    data[customerIndex]["kasar"] = e.target.value;
    setPaymentListData(data);
    let finalKasarAmt = getKasarAmount();
    setKasar(finalKasarAmt);
    let finalTotalAmt = getTotalAmt();
    setTotalAmount(finalTotalAmt);
  };
  const handleTdsChange = (e, id) => {
    let customerIndex = paymentListData.findIndex((x) => x.pk === id);
    setPaymentListData([]);
    const data = [...paymentListData];
    data[customerIndex]["tds"] = e.target.value;
    setPaymentListData(data);
    let finalTdsAmt = getTdsAmount();
    setTds(finalTdsAmt);
    let finalTotalAmt = getTotalAmt();
    setTotalAmount(finalTotalAmt);
  };

  const columns = [
    {
      label: "SR Number",
      name: "sr_no",
      setCellProps: () => ({
        style: {
          display: "flex",
          justifyContent: "center",
        },
      }),

      options: {
        filter: false,
      },
    },
    {
      label: "Against Bill",
      name: "against_bill",
      options: {
        filter: false,
      },
    },
    {
      label: "Ref Date",
      name: "ref_date",
      options: {
        filter: false,
      },
    },
    {
      label: "Original Bill Amount",
      name: "original_bill_amount",
      options: {
        filter: false,
      },
    },
    {
      label: "Due Bill Amount",
      name: "due_bill_amount",
      options: {
        filter: false,
      },
    },
    {
      label: "Receipt Amount",
      name: "receipt_amount",
      options: {
        filter: false,
        setCellProps: () => ({
          style: {
            display: "flex",
            justifyContent: "center",
          },
        }),
        customBodyRender: (value, tableMeta, updateValue) => {
          return (
            <div style={{ width: "100%", textAlign: "center" }}>
              <TextField
                placeholder="Receipt Amount"
                margin="none"
                name="receipt_amount"
                fullWidth
                onChange={(e) => {
                  handleReceiptChange(
                    e,
                    tableMeta.tableData[tableMeta.rowIndex]["pk"]
                  );
                }}
                value={
                  tableMeta.tableData[tableMeta.rowIndex]["receipt_amount"]
                }
                type="number"
                size="small"
                variant="outlined"
              />
            </div>
          );
        },
      },
    },
    {
      label: "Kasar",
      name: "kasar",
      options: {
        filter: false,
        setCellProps: () => ({
          style: {
            justifyContent: "center",
          },
        }),
        customBodyRender: (value, tableMeta, updateValue) => {
          return (
            <div style={{ width: "100%", textAlign: "center" }}>
              <TextField
                placeholder="Kasar"
                margin="none"
                name="kasar"
                fullWidth
                onChange={(e) => {
                  handleKasarChange(
                    e,
                    tableMeta.tableData[tableMeta.rowIndex]["pk"]
                  );
                }}
                value={tableMeta.tableData[tableMeta.rowIndex]["kasar"]}
                type="number"
                size="small"
                variant="outlined"
              />
            </div>
          );
        },
      },
    },
    {
      label: "Tds",
      name: "tds",
      options: {
        filter: false,
        setCellProps: () => ({
          style: {
            justifyContent: "center",
          },
        }),
        customBodyRender: (value, tableMeta, updateValue) => {
          return (
            <div style={{ width: "100%", textAlign: "center" }}>
              <TextField
                placeholder="Tds"
                margin="none"
                name="tds"
                fullWidth
                onChange={(e) => {
                  handleTdsChange(
                    e,
                    tableMeta.tableData[tableMeta.rowIndex]["pk"]
                  );
                }}
                value={tableMeta.tableData[tableMeta.rowIndex]["tds"]}
                type="number"
                size="small"
                variant="outlined"
              />
            </div>
          );
        },
      },
    },
    {
      name: "Actions",
      options: {
        filter: false,
        sort: false,
        download: false,

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
                  <div
                    onClick={() =>
                      onDelete(tableMeta.tableData[tableMeta.rowIndex]["pk"])
                    }
                  >
                    <Tooltip title="Delete">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#e60000"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        className="feather feather-trash-2"
                      >
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        <line x1="10" y1="11" x2="10" y2="17"></line>
                        <line x1="14" y1="11" x2="14" y2="17"></line>
                      </svg>
                    </Tooltip>
                  </div>
                </div>
              }
            />
          );
        },
      },
    },
  ];
  let newData = [];
  paymentListData.map((item, index) => {
    newData.push({ sr_no: index + 1, ...item });
  });
  const redirectToPaymentPrint = () => {
    let url = window.location.pathname?.split("/");
    history.push(`/transport/payment-receipt-print/${url[url?.length - 1]}`);
  };
  const formatedData = (values) => {
    let tempPaymentData = [...paymentListData];
    let tempObj = {
      pk: values?.pk ? values.pk : "",
      payment_receipt_type: values.payment_receipt_type,
      entry_type: values.entry_type,
      entry_no: values.entry_no,
      entry_date: values.entry_date,
      transaction: values.transaction,
      creditor: values.creditor,
      narration: values.narration,
      customer: values.customer,
      truck_no: values.truck_no,
      extra_charges: values.extra_charges,
      is_transaction_effected: values.transactionEffect,
      pay_remarks: values.pay_remarks,
      receipt_amount:
        values.entry_type === "Billwise" ? receiptAmount : normalReceiptAmt,
      kasar: values.entry_type === "Billwise" ? kasar : normalKasarAmt,
      tds: values.entry_type === "Billwise" ? tds : normalTdsAmt,
      transaction_from: values.transaction_from,
      total_amount:
        values.entry_type === "Billwise" ? totalAmount : normalTotalAmt,
      line: tempPaymentData,
      location: localStorage.getItem("location")
        ? localStorage.getItem("location")
        : "",
      site: localStorage.getItem("site") ? localStorage.getItem("site") : "",
    };
    return tempObj;
  };

  var DialogMessage = "Are you sure you want to delete this Payment Receipt?";
  useEffect(() => {
    if (deletePayment) {
      let paymentData = {
        payment_receipt_type: "",
        entry_type: "",
        transaction: "",
        entry_no: getEntryNumber(),
        entry_date: moment(new Date()).format("YYYY-MM-DD"),
        creditor: "",
        is_transaction_effected: "",
        customer: "",
        truck_no: "",
        extra_charges: "",
        narration: "",
        pay_remarks: "",
        receipt_amount: "",
        kasar: "",
        tds: "",
        total_amount: "",
        transaction_from: "",
        location: localStorage.getItem("location")
          ? localStorage.getItem("location")
          : "",
        site: localStorage.getItem("site") ? localStorage.getItem("site") : "",
        line: [],
      };
      dispatch(getPaymentListing(paymentData));
      closeConfirmModal();
    }
  }, [deletePayment]);

  const openResponseModal = (type, pk) => {
    setPaymentPk(pk);
    setActionType(type);
    setIsOpenConfirmModal(true);
    DialogMessage = "Are you sure you want to delete this Payment Receipt?";
  };

  const actionProcess = () => {
    let deleteArray = [];
    if (actionType === "delete") {
      deleteArray.push(paymentPk);
      dispatch(updatePayment(deleteArray, notify));
      dispatch(deletePaymentReset());
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
        <CardHeader
          title={`${paymentData.pk ? " " : "Create"}  Payment Receipt`}
        />
        <CardContent>
          <Formik
            initialValues={paymentData}
            enableReinitialize={true}
            validationSchema={Yup.object().shape({
              payment_receipt_type: Yup.string().required(
                "Payment Receipt Type is required"
              ),
              entry_type: Yup.string().required("Entry Type is required"),
              transaction: Yup.string().required(
                "Transaction Type is required"
              ),
              creditor: Yup.string().when("transaction", {
                is: (transaction) => transaction !== "Receipt",
                then: Yup.string().required("Creditor is required"),
                otherwise: Yup.string(),
              }),
              customer: Yup.string().when("transaction", {
                is: (transaction) => transaction !== "Payment",
                then: Yup.string().required("Customer is required"),
                otherwise: Yup.string(),
              }),
              transaction_from: Yup.string().when("payment_receipt_type", {
                is: (payment_receipt_type) => payment_receipt_type !== "Cash",
                then: Yup.string().required("Transaction from is required"),
                otherwise: Yup.string(),
              }),
              receipt_amount: Yup.string().when("entry_type", {
                is: (entry_type) => entry_type === "Normal",
                then: Yup.string().required("Receipt Amount is required"),
                otherwise: Yup.string(),
              }),
              tds: Yup.string().when("entry_type", {
                is: (entry_type) => entry_type === "Normal",
                then: Yup.string().required("Tds is required"),
                otherwise: Yup.string(),
              }),
              kasar: Yup.string().when("entry_type", {
                is: (entry_type) => entry_type === "Normal",
                then: Yup.string().required("Kasar is required"),
                otherwise: Yup.string(),
              }),
            })}
            onSubmit={async (values) => {
              try {
                let requestBody = formatedData(values);
                if (values.pk) {
                  await dispatch(updatePayment(requestBody, history, notify));
                } else {
                  await dispatch(addPayment(requestBody, history, notify));
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
              <Grid>
                <form onSubmit={handleSubmit}>
                  <Grid container spacing={2}>
                    <Grid item size={{xs:12,lg:4}} >
                      <Typography variant="subtitle1">
                        Payment Receipt Type{" "}
                        <span style={{ color: "red" }}>*</span>
                      </Typography>
                      <TextField
                        error={Boolean(
                          touched.payment_receipt_type &&
                            errors.payment_receipt_type
                        )}
                        helperText={
                          touched.payment_receipt_type &&
                          errors.payment_receipt_type
                        }
                        select
                        placeholder="payment_receipt_type"
                        margin="none"
                        autoComplete="off"
                        name="payment_receipt_type"
                        fullWidth
                        onBlur={handleBlur}
                        onChange={handleChange}
                        type="text"
                        size="small"
                        value={values.payment_receipt_type}
                        variant="outlined"
                      >
                        {payment_receipt_typeList.map((option) => (
                          <MenuItem key={option} value={option}>
                            {option}
                          </MenuItem>
                        ))}
                      </TextField>
                    </Grid>
                    <Grid item size={{xs:12,lg:4}}>
                      <Typography variant="subtitle1">
                        Entry Type <span style={{ color: "red" }}>*</span>
                      </Typography>
                      <TextField
                        error={Boolean(touched.entry_type && errors.entry_type)}
                        helperText={touched.entry_type && errors.entry_type}
                        select
                        placeholder="entry_type"
                        margin="none"
                        autoComplete="off"
                        name="entry_type"
                        fullWidth
                        onBlur={handleBlur}
                        onChange={handleChange}
                        type="text"
                        size="small"
                        value={values.entry_type}
                        variant="outlined"
                      >
                        {entry_type.map((option) => (
                          <MenuItem key={option} value={option}>
                            {option}
                          </MenuItem>
                        ))}
                      </TextField>
                    </Grid>
                  
                    <Grid item size={{xs:12,lg:4}}>
                      <Typography variant="subtitle1">
                        Transaction Type <span style={{ color: "red" }}>*</span>
                      </Typography>
                      <TextField
                        error={Boolean(
                          touched.transaction && errors.transaction
                        )}
                        helperText={touched.transaction && errors.transaction}
                        select
                        placeholder="transaction"
                        margin="none"
                        autoComplete="off"
                        name="transaction"
                        fullWidth
                        onBlur={handleBlur}
                        onChange={(e) => {
                          handleChange("transaction")(e);
                          handleChange("customer")("");
                          handleChange("creditor")("");
                        }}
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
                    <Grid item size={{xs:12,lg:4}}>
                      <Typography variant="subtitle1"> Entry Number</Typography>
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
                    <Grid item size={{xs:12,lg:4}}>
                      <Typography variant="subtitle1">Entry Date</Typography>
                      <TextField
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
                    <Grid item size={{xs:12,lg:4}}>
                      <Typography variant="subtitle1">Extra Charges</Typography>
                      <TextField
                        placeholder="Extra Charges"
                        margin="none"
                        name="extra_charges"
                        fullWidth
                        onBlur={handleBlur}
                        onChange={handleChange}
                        type="text"
                        size="small"
                        value={values.extra_charges}
                        variant="outlined"
                      />
                    </Grid>
                    <Grid item size={{xs:12,lg:4}}>
                      <Typography variant="subtitle1">
                        Creditor
                        {values.transaction === "Payment" ? (
                          <span style={{ color: "red" }}>* </span>
                        ) : (
                          ""
                        )}
                      </Typography>
              
                      <TextField
                        error={Boolean(touched.creditor && errors.creditor)}
                        helperText={touched.creditor && errors.creditor}
                        select
                        placeholder="creditor"
                        margin="none"
                        autoComplete="off"
                        name="creditor"
                        fullWidth
                        onBlur={handleBlur}
                        onChange={(e) => {
                          handleChange("creditor")(e);
                          setPaymentListData([]);
                        }}
                        type="text"
                        size="small"
                        value={values.creditor}
                        variant="outlined"
                        disabled={values.transaction === "Receipt"}
                      >
                        {transporterList &&
                          transporterList.map((option) => (
                            <MenuItem key={option} value={option}>
                              {option}
                            </MenuItem>
                          ))}
                      </TextField>
                    </Grid>

                    <Grid item size={{xs:12,lg:4}}>
                      <Typography variant="subtitle1">
                        Customer
                        {values.transaction === "Receipt" ? (
                          <span style={{ color: "red" }}>* </span>
                        ) : (
                          ""
                        )}
                      </Typography>
                      <TextField
                        error={Boolean(touched.customer && errors.customer)}
                        helperText={touched.customer && errors.customer}
                        select
                        placeholder="customer"
                        margin="none"
                        autoComplete="off"
                        name="customer"
                        fullWidth
                        onBlur={handleBlur}
                        onChange={(e) => {
                          handleChange("customer")(e);
                          setPaymentListData([]);
                        }}
                        type="text"
                        size="small"
                        value={values.customer}
                        variant="outlined"
                        disabled={values.transaction === "Payment"}
                      >
                        {billPartyList &&
                          billPartyList.map((option) => (
                            <MenuItem key={option} value={option}>
                              {option}
                            </MenuItem>
                          ))}
                      </TextField>
                    </Grid>
                    <Grid item size={{xs:12,lg:4}}>
                      <Typography variant="subtitle1">Truck Number</Typography>
                      <TextField
                        placeholder="Truck Number"
                        margin="none"
                        name="truck_no"
                        inputProps={{ maxLength: 10 }}
                        fullWidth
                        onBlur={handleBlur}
                        onChange={handleChange}
                        type="text"
                        size="small"
                        value={values.truck_no}
                        variant="outlined"
                      />
                    </Grid>

                    {values.entry_type === "Billwise"
                      ? (values?.creditor || values?.customer) && (
                          <Grid container xs={12}>
                            {values.pk ? (
                              ""
                            ) : (
                              <Grid
                                item
                                xs={2}
                                lg={2}
                                style={{
                                  position: "relative",
                                  marginLeft: "20px",
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
                                    handleCollect(
                                      values?.creditor,
                                      values?.customer
                                    );
                                  }}
                                  style={{ width: "100%" }}
                                >
                                  Collect
                                </Button>
                              </Grid>
                            )}

                            <Grid
                              item
                              xs={4}
                              lg={4}
                              style={{ marginTop: "36px", marginLeft: "10px" }}
                            >
                              {values.pk ? (
                                " "
                              ) : (
                                <strong style={{ color: "red" }}>
                                  Please Click on Collect Button to display the
                                  data
                                </strong>
                              )}
                            </Grid>
                          </Grid>
                        )
                      : null}
                  </Grid>
                  <br />
                  <br />
                  {values.entry_type === "Billwise" &&
                    (values?.creditor || values.customer) && (
                      <ThemeProvider theme={getMuiTheme()}>
                        <MUIDataTable
                          data={newData}
                          columns={columns}
                          options={{
                            selectableRows: "none",
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
                            filter: false,
                            fixedHeaderOptions: false,
                            viewColumns: false,
                            print: false,
                            search: false,
                            download: false,
                            pagination: false,
                          }}
                        />
                      </ThemeProvider>
                    )}
                  <br />
                  <br />
                  <Grid container spacing={2}>
                    <Grid item size={{xs:12,lg:6}}>
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
                    <Grid item size={{xs:12,lg:6}}>
                      <Typography variant="subtitle1">
                        Payment Remarks
                      </Typography>
                      <TextField
                        placeholder="Payment Remarks"
                        margin="none"
                        name="pay_remarks"
                        fullWidth
                        onBlur={handleBlur}
                        onChange={handleChange}
                        type="text"
                        size="small"
                        value={values.pay_remarks}
                        variant="outlined"
                      />
                    </Grid>
                    <Grid item size={{xs:12,lg:3}}>
                      <Typography variant="subtitle1">
                        Receipt Amount
                        {values.entry_type === "Normal" ? (
                          <span style={{ color: "red" }}>* </span>
                        ) : (
                          ""
                        )}
                      </Typography>
                      <TextField
                        error={Boolean(
                          touched.receipt_amount && errors.receipt_amount
                        )}
                        helperText={
                          touched.receipt_amount && errors.receipt_amount
                        }
                        placeholder="Receipt Amount"
                        margin="none"
                        name="receipt_amount"
                        fullWidth
                        type="text"
                        size="small"
                        onChange={(e) => {
                          if (/^[0-9]*$/.test(e.target.value)) {
                            handleChange("receipt_amount")(e);
                            setNormalReceiptAmt(e.target.value);
                            getNormalTotalAmount(
                              e.target.value,
                              normalKasarAmt,
                              normalTdsAmt
                            );
                          }
                        }}
                        value={
                          values.entry_type === "Billwise"
                            ? receiptAmount
                            : normalReceiptAmt
                        }
                        variant="outlined"
                        disabled={values.entry_type === "Billwise"}
                      />
                    </Grid>
                    <Grid item size={{xs:12,lg:3}}>
                      <Typography variant="subtitle1">
                        Kasar
                        {values.entry_type === "Normal" ? (
                          <span style={{ color: "red" }}>* </span>
                        ) : (
                          ""
                        )}
                      </Typography>
                      <TextField
                        error={Boolean(touched.kasar && errors.kasar)}
                        helperText={touched.kasar && errors.kasar}
                        placeholder="Kasar"
                        margin="none"
                        name="kasar"
                        fullWidth
                        type="text"
                        onChange={(e) => {
                          if (/^[0-9]*$/.test(e.target.value)) {
                            handleChange("kasar")(e);
                            setNormalKasarAmt(e.target.value);
                            getNormalTotalAmount(
                              normalReceiptAmt,
                              e.target.value,
                              normalTdsAmt
                            );
                          }
                        }}
                        size="small"
                        value={
                          values.entry_type === "Billwise" ? kasar : normalKasarAmt
                        }
                        variant="outlined"
                        disabled={values.entry_type === "Billwise"}
                      />
                    </Grid>
                    <Grid item size={{xs:12,lg:3}}>
                      <Typography variant="subtitle1">
                        Tds
                        {values.entry_type === "Normal" ? (
                          <span style={{ color: "red" }}>* </span>
                        ) : (
                          ""
                        )}
                      </Typography>
                      <TextField
                        error={Boolean(touched.tds && errors.tds)}
                        helperText={touched.tds && errors.tds}
                        placeholder="Tds"
                        margin="none"
                        name="tds"
                        onChange={(e) => {
                          if (/^[0-9]*$/.test(e.target.value)) {
                            handleChange("tds")(e);
                            setNormalTdsAmt(e.target.value);
                            getNormalTotalAmount(
                              normalReceiptAmt,
                              normalKasarAmt,
                              e.target.value
                            );
                          }
                        }}
                        fullWidth
                        type="text"
                        size="small"
                        value={
                          values.entry_type === "Billwise" ? tds : normalTdsAmt
                        }
                        variant="outlined"
                        disabled={values.entry_type === "Billwise"}
                      />
                    </Grid>
                    <Grid item size={{xs:12,lg:3}}>
                      <Typography variant="subtitle1">Total Amount</Typography>
                      <TextField
                        placeholder="Total Amount"
                        margin="none"
                        name="total_amount"
                        fullWidth
                        type="text"
                        size="small"
                        value={
                          values.entry_type === "Billwise"
                            ? totalAmount
                            : normalTotalAmt
                        }
                        variant="outlined"
                        disabled
                      />
                    </Grid>
                    <Grid item size={{xs:12,lg:4}}>
                      <Typography variant="subtitle1">
                        Transaction From
                        {values.payment_receipt_type === "Cheque" ? (
                          <span style={{ color: "red" }}>* </span>
                        ) : (
                          ""
                        )}
                      </Typography>
                      <TextField
                        error={Boolean(
                          touched.transaction_from && errors.transaction_from
                        )}
                        helperText={
                          touched.transaction_from && errors.transaction_from
                        }
                        select
                        placeholder="transaction_from"
                        margin="none"
                        autoComplete="off"
                        name="transaction_from"
                        fullWidth
                        onBlur={handleBlur}
                        onChange={handleChange}
                        type="text"
                        size="small"
                        value={values.transaction_from}
                        variant="outlined"
                        disabled={values.payment_receipt_type === "Cash"}
                      >
                        {transactionList &&
                          transactionList.map((option) => (
                            <MenuItem key={option} value={option}>
                              {option}
                            </MenuItem>
                          ))}
                      </TextField>
                    </Grid>
                    <Grid item size={{xs:12,lg:4}}>
                      <Typography variant="subtitle1">
                        Location
                        <span style={{ color: "red" }}>*</span>
                      </Typography>
                      <TextField
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
                        Site <span style={{ color: "red" }}>*</span>
                      </Typography>
                      <TextField
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
                  <br /> <br />
                  <Box style={{ textAlign: "center", display: "flex" }} mt={2}>
                    {values.pk && (
                      <Box>
                        <Button
                          color="secondary"
                          size="medium"
                          type="button"
                          variant="outlined"
                          onClick={redirectToPaymentPrint}
                          style={{ marginRight: "10px" }}
                        >
                          Print Payment Receipt
                        </Button>
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
                      </Box>
                    )}
                    {values?.pk ? (
                      " "
                    ) : (
                      <Button
                        color="primary"
                        disabled={isSubmitting}
                        size="medium"
                        type="submit"
                        variant="outlined"
                  
                        style={{ marginRight: "10px" }}
                      >
                        save Details
                      </Button>
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
                <br />
                <br />
              </Grid>
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
