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
  getPurchaseDetailsById,
  addPurchase,
  updatePurchase,
  getPurchaseLR,
  canclePurchaseEffect,
  deletePurchaseData,
  getPurchaseListing,
  deletePurchaseReset,
} from "../../../actions/transportation/PurchaseAction";
import { useHistory } from "react-router-dom";
import { useSnackbar } from "notistack";
import { dropDownDispatch } from "../../../actions/GateInActions";
import { getFormDependencyListing, getEntryNumberDependencyListing } from "../../../actions/transportation/MasterActions";
import MUIDataTable from "mui-datatables";
import { createTheme, ThemeProvider } from "@mui/material";
import ConfirmModal from "../../../commomComponents/modal/confirmationModal";
import moment from "moment";



export default function AddPurchase(props) {
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
  const [deletePurchaseList, setDeletePurchaseList] = useState([]);
  const purchaseDetails = useSelector(
    (state) => state.purchaseMaster.purchaseDetails
  );
  const transporterList = useSelector(
    (state) => state.masterReducer?.masterData?.transporter
  );
  const masterList = useSelector((state) => state.masterReducer?.masterData);
  const entryNumberData = useSelector(
    (state) => state.masterReducer?.entryNumberList
  );
  const purchaseList = useSelector(
    (state) => state.purchaseMaster.purchaseLRData
  );
  const deleterPurchase = useSelector(
    (state) => state.purchaseMaster.deletePurchase
  );
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [purchaseListData, setPurchaseListData] = useState([]);
  const [totalAmount, setTotalAmount] = useState("");
  const [dueBillAmount, setDueBillAmount] = useState("");
  const [transactionEffect, setTransactionEffect] = useState("");
  const [purchasePk, setPurchasePk] = useState("");
  const [actionType, setActionType] = useState("");
  const [isOpenConfirmModal, setIsOpenConfirmModal] = useState(false);
  const [purchaseData, setPurchaseData] = useState({
    transporter: "",
    bill_type: "LR Wise",
    entry_no: "",
    entry_date: moment(new Date()).format("YYYY-MM-DD"),
    sup_bill_no: "",
    sup_bill_date: "",
    narration: "",
    bill_amount: "",
    is_transaction_effected: "",
    due_bill_amount: "",
    purchase_line: [],
    location: localStorage.getItem("location")
      ? localStorage.getItem("location")
      : "",
    site: localStorage.getItem("site") ? localStorage.getItem("site") : "",
  });

  useEffect(() => {
    if (loading) {
      setTimeout(() => {
        setLoading(false);
      }, 2000);
    }
  }, [loading]);

  useEffect(() => {
    let url = window.location.pathname.split("/");
    if (url[url?.length - 1] !== "purchase-form") {
      dispatch(getPurchaseDetailsById(url[url.length - 1]));
    }

    let reqArray = [
      "purchase_lr_data",
      "transporter",
      "location_site_dashboard_list",
    ];
    let reqBody = {
      field_list: ["purchase_lr_data", "transporter"],
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
    if (purchaseDetails) {
      setPurchaseListData(purchaseDetails?.purchase_line);
      setTotalAmount(purchaseDetails?.bill_amount);
      setDueBillAmount(purchaseDetails?.due_bill_amount);
      setTransactionEffect(purchaseDetails?.is_transaction_effected);
      setPurchaseData(purchaseDetails);
    }
  }, [purchaseDetails]);

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
      purchaseData["entry_no"] =
      entryNumberData?.purchase_lr_data && entryNumberData?.purchase_lr_data?.entry_no
        ? entryNumberData?.purchase_lr_data?.entry_no
        : "";
    }
  }, [entryNumberData]);

  const handleCollect = (values) => {
    let data = {
      location: localStorage.getItem("location")
        ? localStorage.getItem("location")
        : "",
      site: localStorage.getItem("site") ? localStorage.getItem("site") : "",
      transporter: values,
    };
    dispatch(getPurchaseLR(data));
    // dispatch(deletePurchaseReset());
  };

  const onDelete = (index, id) => {
    let tempArray = [...purchaseListData];
    let tempDelete = [...deletePurchaseList];
    if (tempArray.length > 1) {
      let url = window.location.pathname.split("/");
      if (url[url?.length - 1] !== "purchase-form") {
        tempDelete.push(id);
        setDeletePurchaseList(tempDelete);
      }
      tempArray.splice(index, 1);
      let dueBillAmount = tempArray.reduce((accumulator, object) => {
        return accumulator + +object.due_amount;
      }, 0);
      let totalAmount = 2 * dueBillAmount;
      setTotalAmount(totalAmount.toString());
      setDueBillAmount(dueBillAmount.toString());
      setPurchaseListData(tempArray);
    } else {
      notify("Atleast one lisitng is required for transpoter", {
        variant: "error",
      });
    }
  };
  const getBillAmount = () => {
    let totalAmt = 0;
    for (const value in purchaseList) {
      totalAmt = totalAmt + Number(purchaseList[value].due_amount);
    }
    return totalAmt.toString();
  };

  const getTotalAmt = () => {
    let totalAmt = getBillAmount();
    let dueAmt = getBillAmount();
    let totalBillAmt = +totalAmt + +dueAmt;
    return totalBillAmt.toString();
  };

  useEffect(() => {
    if (purchaseList?.length > 0) {
      let url = window.location.pathname.split("/");
      if (url[url?.length - 1] !== "purchase-form") {
        let tempArray = [...purchaseListData];
        purchaseList.map((item, index) => {
          let isDuplicate = tempArray.some(
            (row) => row.booking_pk === item.booking_pk
          );
          if (!isDuplicate) {
            tempArray.push(item);
          }
        });
        let totalAmt = 0;
        for (const value in tempArray) {
          totalAmt = totalAmt + Number(tempArray[value].due_amount);
        }
        let tempDueBillAmount = 2 * totalAmt;
        setPurchaseListData(tempArray);
        setTotalAmount(tempDueBillAmount.toString());
        setDueBillAmount(totalAmt.toString());
      } else {
        const totalAmt = getBillAmount();
        const totalBillAmt = getTotalAmt();
        setTotalAmount(totalBillAmt);
        setDueBillAmount(totalAmt);
        setPurchaseListData(purchaseList);
      }
    } else {
      setPurchaseListData([]);
    }
  }, [purchaseList]);

  let newData = [];
  purchaseListData.map((item, index) => {
    newData.push({ sr_no: index + 1, ...item });
  });

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
      label: "LR Number",
      name: "lr_no",
      options: {
        filter: false,
      },
    },
    {
      label: "LR Date",
      name: "l_date",
      options: {
        filter: false,
      },
    },
    {
      label: "Due Amount",
      name: "due_amount",
      options: {
        filter: false,
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
          let columnIndex =
            tableMeta.tableData[tableMeta.rowIndex]["sr_no"] - 1;
          return (
            <FormControlLabel
              style={{ width: "100%" }}
              control={
                <div style={{ display: "flex", margin: "auto" }}>
                  <div
                    onClick={() =>
                      onDelete(
                        columnIndex,
                        tableMeta.tableData[tableMeta.rowIndex]["pk"]
                      )
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

  const formatedData = (values) => {
    let tempPurchaseData = [...purchaseListData];
    let tempObj = {
      pk: values?.pk ? values.pk : "",
      transporter: values.transporter,
      bill_type: values.bill_type,
      entry_no: values.entry_no,
      entry_date: values.entry_date,
      sup_bill_no: values.sup_bill_no,
      sup_bill_date: values.sup_bill_date,
      is_transaction_effected: values.transactionEffect,
      narration: values.narration,
      bill_amount: values.pk ?  values.bill_amount : dueBillAmount,
      due_bill_amount: dueBillAmount,
      delete_purchase_list: deletePurchaseList ? deletePurchaseList : [],
      purchase_line: tempPurchaseData,
      location: localStorage.getItem("location")
        ? localStorage.getItem("location")
        : "",
      site: localStorage.getItem("site") ? localStorage.getItem("site") : "",
    };
    return tempObj;
  };
  var DialogMessage = "Are you sure you want to delete this Purchase LR?";
  useEffect(() => {
    if (deleterPurchase) {
      let purchaseData = {
        transporter: "",
        bill_type: "LR Wise",
        entry_no:"",
        entry_date: moment(new Date()).format("YYYY-MM-DD"),
        sup_bill_no: "",
        sup_bill_date: "",
        narration: "",
        bill_amount: "",
        is_transaction_effected: "",
        due_bill_amount: "",
        purchase_line: [],
        location: localStorage.getItem("location")
          ? localStorage.getItem("location")
          : "",
        site: localStorage.getItem("site") ? localStorage.getItem("site") : "",
      };
      dispatch(getPurchaseListing(purchaseData));
      closeConfirmModal();
    }
  }, [deleterPurchase]);

  const handleGoBack = () => {
    history.goBack();
  };
  const handleTransactionEffect = (pk) => {
    dispatch(canclePurchaseEffect(pk));
    setLoading(!loading);
    setTimeout(() => {
      setLoading(!loading);
      setShow(!show);
    }, 2000);
  };
  const openResponseModal = (type, pk) => {
    setPurchasePk(pk);
    setActionType(type);
    setIsOpenConfirmModal(true);
    DialogMessage = "Are you sure you want to delete this Purchase LR?";
  };
  const actionProcess = () => {
    let deleteArray = [];
    if (actionType === "delete") {
      deleteArray.push(purchasePk);
      dispatch(deletePurchaseData(deleteArray, notify, history));
      dispatch(deletePurchaseReset());
      closeConfirmModal();
      handleGoBack();
    }
  };
  const closeConfirmModal = () => {
    setIsOpenConfirmModal(false);
  };
  if (loading)
    return (
      <div style={{ marginLeft: "46%", marginTop: "25%" }}>
        <CircularProgress />;
      </div>
    );
  return (
    <Grid>
      <Card>
        <CardHeader title={`${purchaseData.pk ? "" : "Create"} Purchase LR`} />
        <CardContent>
          <Formik
            initialValues={purchaseData}
            enableReinitialize={true}
            validationSchema={Yup.object().shape({
              transporter: Yup.string().required(
                "Transporter Name is Required"
              ),
            })}
            onSubmit={async (values) => {
              try {
                let requestBody = formatedData(values);
                if (values.pk) {
                  await dispatch(updatePurchase(requestBody, history, notify));
                } else {
                  await dispatch(addPurchase(requestBody, history, notify));
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
                    <Grid item size={{xs:12,lg:4}}>
                      <Typography variant="subtitle1">Bill Type</Typography>
                      <TextField
                        error={Boolean(touched.bill_type && errors.bill_type)}
                        helperText={touched.bill_type && errors.bill_type}
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
                    <Grid item size={{xs:12,lg:4}}>
                      <Typography variant="subtitle1">Entry Date</Typography>
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
                    <Grid item size={{xs:12,lg:4}}>
                      <Typography variant="subtitle1">
                        Transporter <span style={{ color: "red" }}>*</span>
                      </Typography>
                      <TextField
                        error={Boolean(
                          touched.transporter && errors.transporter
                        )}
                        helperText={touched.transporter && errors.transporter}
                        select
                        placeholder="Transporter"
                        margin="none"
                        autoComplete="off"
                        name="transporter"
                        fullWidth
                        onBlur={handleBlur}
                        onChange={(e) => {
                          handleChange("transporter")(e);
                          dispatch(deletePurchaseReset());
                        }}
                        type="text"
                        size="small"
                        value={values.transporter}
                        variant="outlined"
                        disabled={values.pk}
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
                        Supply Bill No
                      </Typography>
                      <TextField
                        error={Boolean(
                          touched.sup_bill_no && errors.sup_bill_no
                        )}
                        helperText={touched.sup_bill_no && errors.sup_bill_no}
                        placeholder="Supply Bill No"
                        margin="none"
                        name="sup_bill_no"
                        inputProps={{ maxLength: 10 }}
                        fullWidth
                        onBlur={handleBlur}
                        onChange={handleChange}
                        type="text"
                        size="small"
                        value={values.sup_bill_no}
                        variant="outlined"
                      />
                    </Grid>
                    <Grid item size={{xs:12,lg:4}}>
                      <Typography variant="subtitle1">
                        Supply Bill Date
                      </Typography>
                      <TextField
                        error={Boolean(
                          touched.sup_bill_date && errors.sup_bill_date
                        )}
                        helperText={
                          touched.sup_bill_date && errors.sup_bill_date
                        }
                        placeholder="Supply Bill Date"
                        margin="none"
                        name="sup_bill_date"
                        fullWidth
                        onBlur={handleBlur}
                        onChange={handleChange}
                        type="date"
                        size="small"
                        value={values.sup_bill_date}
                        variant="outlined"
                        date
                      />
                    </Grid>
                    <Grid item size={{xs:12,lg:4}}>
                      <Typography variant="subtitle1">
                        Location
                        <span style={{ color: "red" }}>*</span>
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
                    {values?.transporter && (
                      <Grid item xs={12} lg={2}>
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
                            handleCollect(values?.transporter);
                          }}
                          style={{ width: "100%" }}
                        >
                          Collect
                        </Button>
                      </Grid>
                    )}
                  </Grid>
                  <br />
                  <br />
                  <ThemeProvider theme={getMuiTheme()}>
                    <MUIDataTable
                      title={"Collect Transpoter Data"}
                      data={newData}
                      columns={columns}
                      options={{
                        selectableRows: "none",
                        responsive: "scroll",
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
                  <br />
                  <br />
                  <Grid container spacing={2}>
                    <Grid item size={{xs:12,lg:12}}>
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
                    <Grid item size={{xs:12,lg:4}}>
                      <Typography variant="subtitle1">Bill Amount</Typography>
                      <TextField
                        placeholder="Bill Amount"
                        margin="none"
                        name="bill_amount"
                        fullWidth
                        type="text"
                        size="small"
                        value={ values.pk ?  values.bill_amount : dueBillAmount}
                        variant="outlined"
                        disabled
                      />
                    </Grid>
                    <Grid item size={{xs:12,lg:4}}>
                      <Typography variant="subtitle1">
                        Due Bill Amount
                      </Typography>
                      <TextField
                        placeholder="Due Bill Amount"
                        margin="none"
                        name="due_bill_amount"
                        fullWidth
                        type="text"
                        size="small"
                        value={dueBillAmount}
                        variant="outlined"
                        disabled
                      />
                    </Grid>
                  </Grid>
                  <br /> <br />
                  <Box style={{ textAlign: "right", display: "flex" }} mt={2}>
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
                    <Button
                      color="primary"
                      disabled={
                        newData.length < 1 ? true : false
                        // || values.is_transaction_effected === true
                      }
                      size="medium"
                      type="submit"
                      variant="outlined"
                   
                      style={{ marginRight: "10px" }}
                    >
                      {values?.pk ? "Update Details" : "Save Details"}
                    </Button>
                    {values.pk ? (
                      <Box>
                        <Button
                          color="secondary"
                          size="medium"
                          type="button"
                          variant="outlined"
                          style={{ marginRight: "10px" }}
                          // disabled={values.is_transaction_effected === true}
                          onClick={() => {
                            openResponseModal("delete", values?.pk);
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
