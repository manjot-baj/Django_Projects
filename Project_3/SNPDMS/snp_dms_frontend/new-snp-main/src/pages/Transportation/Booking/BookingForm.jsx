/* eslint-disable consistent-return */
import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Grid,

  Button,
  Typography,
  Card,
  MenuItem,
  CardContent,
  CardHeader,
  Box,
  Divider,
  TextField,
  Fab,
  Menu,
  Tooltip,
  useMediaQuery,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Autocomplete
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";

import DeleteIcon from "@mui/icons-material/Delete";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import LayoutContainer from "@components/reusablecomponents/LayoutContainer";
import { useHistory } from "react-router-dom";
import { Image } from "semantic-ui-react";
import { useSnackbar } from "notistack";
import moment from "moment";
import { Formik } from "formik";
import * as Yup from "yup";
import {
  getFormDependencyListing,
  getEntryNumberDependencyListing,
} from "../../../actions/transportation/MasterActions";
import {
  addBooking,
  getBookingDetailsById,
  saveAsDraftBooking,
  cancleBookingEffect,
  deleteBookingData,
  deleteBookingReset,
} from "../../../actions/transportation/BookingActions";
import ConfirmModal from "../../../commomComponents/modal/confirmationModal";
import BACKIMAGE from '../../../assets/images/back-arrow.png'

let actionType = "";
let DialogMessage = "Are you sure you want to Submit Booking form?";


var tomorrow = new Date();
tomorrow.setDate(tomorrow.getDate() + 1);
const bookingTypeList = ["BOOKING", "RENT"];
const containerTypeList = ["EXPORT", "IMPORT", "BY ROAD", "LOOSE"];
const rcmList = ["YES", "NO"];
const containerSizeList = [20, 40];

export default function BookingForm(props) {
  const dispatch = useDispatch();
// eslint-disable-next-line no-unused-vars
  const store = useSelector((state) => state);
  const matchesIphone = useMediaQuery("(max-width:400px)");
  const history = useHistory();
  const bookingDetails = useSelector(
    (state) => state.bookingMaster.bookingDetails
  );
  const [show, setShow] = useState(false);
  const notify = useSnackbar().enqueueSnackbar;
  const [driverList, setDriverList] = useState([]);
  const [isFormTouch, setIsFormTouch] = useState(false);
  const [expanded, setExpanded] = useState("General Details");
  const masterList = useSelector((state) => state.masterReducer?.masterData);
  const entryNumberData = useSelector(
    (state) => state.masterReducer?.entryNumberList
  );
  const handleChangeEvent = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };
  const [isOpenConfirmModal, setIsOpenConfirmModal] = useState(false);
  const selectedDriverRef = useRef(-1);
  const formRef = useRef();
  const actionProcess = () => {
    let tempBookingData = { ...bookingData };
    if (actionType === "proceed") {
      setIsOpenConfirmModal(false);
      dispatch(addBooking(tempBookingData, history, notify));
    } else if (actionType === "delete") {
      dispatch(deleteBookingData(tempBookingData, history, notify));
      dispatch(deleteBookingReset());
    } else {
      deleteBookingForm();
      dispatch(addBooking(tempBookingData, history, notify));
    }
  };
  const deleteBookingForm = () => {
    let bookingIdArray = [];

    bookingData.filter((dataItem) => {
      if (dataItem.checked) {
        bookingIdArray.push(`${dataItem.id}`);
      }
      
    });
    dispatch(deleteBookingData(bookingIdArray, history, notify));
    dispatch(deleteBookingReset());
  };

  const getMobileAndLicenceNumber = (list, newValue, setFieldValue) => {
    list.map((rows, index) => {
      if (rows.name === newValue) {
        setFieldValue("transportation_data.license_no", rows.license_no);
        setFieldValue("transportation_data.mobile_no", rows.mobile_no);
      }
    });
  };
  const openResponseModal = (values) => {
    setBookingData(values);
    setIsOpenConfirmModal(true);
  };
  const closeConfirmModal = () => {
    setIsFormTouch(true);
    setIsOpenConfirmModal(false);
  };

  useEffect(() => {
    let reqBody = {
      field_list: [
        "source_destination",
        "consignor",
        "consignee",
        "particulars",
        "shipping_line",
        "status",
        "state",
        "port",
        "pod",
        "handling_company",
        "transporter",
        "transporter_driver_truck_data",
        "fuel_pump",
        "bill_party",
        "service_tax",
        "booking_data",
        "customer",
        "creditor",
      ],
      location: localStorage.getItem("location")
        ? localStorage.getItem("location")
        : null,
      site: localStorage.getItem("site") ? localStorage.getItem("site") : null,
    };
    let reqBodyEntryNumber = {
      field_list: ["booking_data"],
      location: localStorage.getItem("location")
      ? localStorage.getItem("location")
      : null,
    site: localStorage.getItem("site") ? localStorage.getItem("site") : null,
    };
    dispatch(getFormDependencyListing(reqBody));
    dispatch(getEntryNumberDependencyListing(reqBodyEntryNumber));
    setLoading(true);
   
// eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function containsOnlyNumbers(str) {
    return /^\d+$/.test(str);
  }
  const url = window.location.pathname.split("/");
  useEffect(() => {
    const propsUrl = url[url?.length - 1];
    if (propsUrl !== "booking-form") {
      dispatch(getBookingDetailsById(propsUrl));
    }
    setLoading(true);
    
// eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const propsUrl = url[url?.length - 1];
    if (!containsOnlyNumbers(propsUrl)) {
      bookingData.general_data["entry_no"] =
        entryNumberData?.booking_data && entryNumberData?.booking_data?.entry_no
          ? entryNumberData?.booking_data?.entry_no
          : "";
      bookingData.general_data["lr_no"] =
        entryNumberData?.booking_data && entryNumberData?.booking_data?.lr_no
          ? entryNumberData?.booking_data?.lr_no
          : "";
      let tempBookingData = { ...bookingData };
      setBookingData(tempBookingData);
    }

// eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entryNumberData]);

  useEffect(() => {
    if (bookingDetails) {
      setBookingData({ ...bookingDetails });
      setLoading(false);
    }
  }, [bookingDetails]);

  const [bookingData, setBookingData] = useState({
    general_data: {
      entry_no: "",
      lr_no: "",
      booking_no: "",
      booking_type: "BOOKING",
      l_date: moment(new Date()).format("YYYY-MM-DD"),
      s_date: moment(tomorrow).format("YYYY-MM-DD"),
      from_dest: "",
      to_dest: "",
      destination: "",
      consignor: "",
      consignee: "",
      no_of_pallets: "",
      actual_weight: "",
      charge_weight: "",
      particulars: "",
    },
    transportation_data: {
      transporter: "",
      truck_no: "",
      driver_name: "",
      license_no: "",
      mobile_no: "",
      container_type: "",
      container_size: "",
      container_no: "",
      shipping_line: "",
      seal_no: "",
      status: "",
      port: "",
      pod: "",
    },
    charges: {
      tr_freight: "",
      advance: "0",
      diesel_quantity: "0",
      diesel_rate: "0",
      diesel_cost: "0",
      fuel_pump: "",
      detention_charges: "0",
      extra_charges: "0",
      balance: "0",
      loading_unloading: "0",
      handling_charges: "0",
      handling_company: "",
      washing_charges: "0",
      repair_charges: "0",
      weighment_charges: "0",
    },
    bill: {
      bill_party: "",
      company_acc_name: "",
      bill_line: [
        {
          type_of_charge: "",
          bill_amount: "",
          rcm: "NO",
        },
      ],
    },
    transaction_effected: "",
    location: localStorage.getItem("location")
      ? localStorage.getItem("location")
      : "",
    site: localStorage.getItem("site") ? localStorage.getItem("site") : "",
  });

  const handleGoBack = () => {
    history.goBack();
  };
  const [anchorEl, setAnchorEl] = useState(null);
  const [loading, setLoading] = useState(false);
  const open = Boolean(anchorEl);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = (key) => {
    const url = window.location.pathname.split("/");
    if (url[url?.length - 1] !== "booking-form") {
      history.push(`/transport/lr-print/${url[url?.length - 1]}`);
      localStorage.setItem("code", key);
      setAnchorEl(null);
    }
  };

  const getDriverTruckData = (value) => {
    const index = masterList.transporter_driver_truck_data.findIndex(
      (item) => item[value]
    );
    selectedDriverRef.current =
      masterList.transporter_driver_truck_data[index][value];

    let tempData = [];
    masterList.transporter_driver_truck_data[index][value].driver_list.map(
      (item) => {
        tempData.push(item.name);
      }
    );
    setDriverList(tempData);
  };

  const updateBalanceAmount = (charges, key, value, setFieldValue) => {
    let sum = 0;
    let finalObj = { ...charges, [key]: value };
    const {
      advance,
      tr_freight,
      diesel_cost,
      detention_charges,
      extra_charges,
    } = finalObj;
    let positiveVal = +detention_charges + +extra_charges + +tr_freight;
    let negativeVal = +diesel_cost + +advance;
    sum = positiveVal - negativeVal;
    setFieldValue("charges.balance", sum);
  };
  const saveAsDraft = (values) => {
    dispatch(saveAsDraftBooking(values, history, notify));
  };
  const isDisabled = (generalData) => {
    if (
      generalData?.from_dest &&
      generalData?.to_dest &&
      generalData?.consignor &&
      generalData?.consignee &&
      generalData?.particulars
    ) {
      return false;
    } else {
      return true;
    }
  };
  const addClick = (values, setFieldValue) => {
    let tempObj = {
      type_of_charge: "",
      bill_amount: "",
      rcm: "NO",
      pk: "",
    };
    let tempBookingData = [...values?.bill?.bill_line];
    // eslint-disable-next-line no-unused-vars
    let newArray = tempBookingData?.push(tempObj);
    setFieldValue("bill.bill_line", tempBookingData);
  };
  const removeClick = (values, setFieldValue, index) => {
    let tempBookingData = [...values?.bill?.bill_line];
    // eslint-disable-next-line no-unused-vars
    let newArray = tempBookingData?.splice(index, 1);
    setFieldValue("bill.bill_line", tempBookingData);
  };

  const handleTransactionEffect = (pk) => {
    dispatch(cancleBookingEffect(pk));
    setLoading(!loading);
    setTimeout(() => {
      setLoading(!loading);
      setShow(!show);
    }, 2000);
  };

  const containerRegex = /^(([a-zA-Z]{4}[0-9]{7}))/;
  const consignorNameRegxp = /^[a-zA-Z .]*$/;
  const phoneRegExp = /^[0-9]{10}$/;
  const nameRegxp = /^[a-zA-Z .]*$/;
  const actualWeightRegExp = /^\d*\.?\d+$|^\d+$/;
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
            title={`${bookingData?.pk ? "Update" : "Add"} Booking Details`}
          />
          <Divider />
          <CardContent>
            <Grid container>
              <Grid item size={{xs:12}}>
                <Formik
                  innerRef={formRef}
                  initialValues={bookingData}
                  enableReinitialize={true}
                  validationSchema={Yup.object().shape({
                    general_data: Yup.object()
                      .shape({
                        entry_no: Yup.string().required(
                          "Entry Number is required"
                        ),
                        booking_type: Yup.string().required(
                          "Booking Type is required"
                        ),
                        l_date: Yup.string().required("L Date is required"),
                        s_date: Yup.string().required("S Date is required"),
                        from_dest: Yup.string()
                          .required("From Destination is required")
                          .matches(
                            consignorNameRegxp,
                            "From Destination Name is not valid"
                          ),
                        to_dest: Yup.string()
                          .required("To Destination is required")
                          .matches(
                            consignorNameRegxp,
                            "To destination Name is not valid"
                          ),
                        destination: Yup.string().required(
                          "Destination is required"
                        ),
                        consignor: Yup.string()
                          .required("Consignor is required")
                          .matches(
                            consignorNameRegxp,
                            "Consignor Name is not valid"
                          ),
                        consignee: Yup.string()
                          .required("Consignee is required")
                          .matches(
                            consignorNameRegxp,
                            "Consignee is not valid"
                          ),
                        particulars: Yup.string()
                          .required("Particulars is required")
                          .matches(
                            consignorNameRegxp,
                            "Particulars is not valid"
                          ),
                        actual_weight: Yup.string().matches(
                          actualWeightRegExp,
                          "Actual Weight is not valid"
                        ),
                        charge_weight: Yup.string().matches(
                          actualWeightRegExp,
                          "Charge Weight should be only in number format"
                        ),
                      })
                      .required("General Data Required"),
                    transportation_data: Yup.object().shape({
                      transporter: Yup.string().required(
                        "Transporter is required"
                      ),
                      mobile_no: Yup.string().matches(
                        phoneRegExp,
                        "Mobile Number is not valid"
                      ),
                      truck_no: Yup.string().required(
                        "Truck Number is required"
                      ),
                      status: Yup.string().matches(
                        consignorNameRegxp,
                        "Status Name is not valid"
                      ),
                      port: Yup.string().matches(
                        consignorNameRegxp,
                        "Port Name is not valid"
                      ),
                      pod: Yup.string().matches(
                        consignorNameRegxp,
                        "Pod Name is not valid"
                      ),
                      driver_name: Yup.string()
                        .required("Driver Name is required")
                        .matches(nameRegxp, "Driver Name is not valid"),
                      container_type: Yup.string().required(
                        "Container Type is required"
                      ),
                      container_size: Yup.string().required(
                        "Container Size is required"
                      ),
                      container_no: Yup.string()
                        .required("Container Number is required")
                        .matches(
                          containerRegex,
                          "Container Number is not valid"
                        ),
                      shipping_line: Yup.string()
                        .required("Shipping Line is required")
                        .matches(nameRegxp, "Shipping Line is not valid"),
                    }),
                    charges: Yup.object().shape({
                      diesel_rate: Yup.string().when("diesel_quantity", {
                        is: (val) => (val && val !== "0") || val !== "",
                        then: Yup.string().required("Diesel Rate required"),
                      }),
                      balance: Yup.string().matches(
                        actualWeightRegExp,
                        "Balance Name is not valid"
                      ),
                      tr_freight: Yup.string()
                        .required("TR freight Name is not valid")
                        .matches(
                          actualWeightRegExp,
                          "TR freight Name is not valid"
                        ),
                      fuel_pump: Yup.string().when("diesel_cost", {
                        is: (val) => +val > 0,
                        then: Yup.string().required("Fuel pump is required"),
                        otherwise: Yup.string(),
                      }),
                      handling_company: Yup.string().when("handling_charges", {
                        is: (val) => val !== "0",
                        then: Yup.string().required(
                          "Handling Charges is required"
                        ),
                        otherwise: Yup.string(),
                      }),
                    }),
                    bill: Yup.object().shape({
                      bill_party: Yup.string().required(
                        "Bill Party is required"
                      ),
                      bill_line: Yup.array().of(
                        Yup.object().shape({
                          type_of_charge: Yup.string().required(
                            "Type of Charges is required"
                          ),
                          bill_amount: Yup.string()
                            .required("Bill Amount is required")
                            .matches(
                              actualWeightRegExp,
                              "Bill Amount only accpet Numbers"
                            ),
                          rcm: Yup.string().required("RCM is required"),
                        })
                      ),
                    }),
                  })}
                  onSubmit={async (values) => {
                    try {
                      if (values.pk) {
                        DialogMessage =
                          "Are you sure you want to Submit Booking form?";
                        openResponseModal(values);
                        actionType = "proceed";
                        // await dispatch(updateBooking(values, history, notify));
                      } else {
                        await dispatch(addBooking(values, history, notify));
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
                    dirty,
                    
                 
                  } ) => (
                    
                    <form onSubmit={handleSubmit}>
                      <div>
                        <Grid container spacing={3}>
                          <Grid item size={{xs:12}}>
                            <div>
                              <Accordion
                                expanded={expanded === "General Details"}
                                onChange={handleChangeEvent("General Details")}
                                style={{
                                  marginBottom: 20,
                                  borderRadius: 5,
                                  boxShadow: 3,
                                }}
                              >
                                <AccordionSummary
                                  expandIcon={<ExpandMoreIcon />}
                                  aria-controls="panel1a-content"
                                  id="panel1a-header"
                                >
                                  <Typography>General Details</Typography>
                                </AccordionSummary>
                                <AccordionDetails
                                  style={{
                                    background: "#e5f2ff",
                                    display: "block",
                                  }}
                                >
                                  <Card>
                                    <CardContent>
                                      <Grid container spacing={2}>
                                        <Grid item size={{xs:12,lg:4}}>
                                          <Typography variant="subtitle1">
                                            Entry Number
                                          </Typography>
                                          {console.log("rs errors", errors)}
                                          <TextField
                                            error={Boolean(
                                              touched.general_data?.entry_no &&
                                                errors.general_data?.entry_no
                                            )}
                                            helperText={
                                              touched.general_data?.entry_no &&
                                              errors.general_data?.entry_no
                                            }
                                            placeholder="Entry Number"
                                            margin="none"
                                            name="general_data.entry_no"
                                            fullWidth
                                            onBlur={handleBlur}
                                            onChange={(e) => {
                                              handleChange(
                                                "general_data.entry_no"
                                              )(e);
                                            }}
                                            type="text"
                                            size="small"
                                            value={
                                              values.general_data?.entry_no
                                            }
                                            variant="outlined"
                                            disabled
                                          />
                                        </Grid>
                                        <Grid item size={{xs:12,lg:4}}>
                                          <Typography variant="subtitle1">
                                            LR Number
                                          </Typography>
                                          <TextField
                                            error={Boolean(
                                              touched.general_data?.lr_no &&
                                                errors.general_data?.lr_no
                                            )}
                                            helperText={
                                              touched.general_data?.lr_no &&
                                              errors.general_data?.lr_no
                                            }
                                            placeholder="LR Number"
                                            margin="none"
                                            name="general_data.lr_no"
                                            fullWidth
                                            onBlur={handleBlur}
                                            onChange={(e) => {
                                              handleChange(
                                                "general_data.lr_no"
                                              )(e);
                                            }}
                                            type="text"
                                            size="small"
                                            value={values.general_data?.lr_no}
                                            variant="outlined"
                                            disabled
                                          />
                                        </Grid>
                                        <Grid item size={{xs:12,lg:4}}>
                                          <Typography variant="subtitle1">
                                            Booking Number
                                          </Typography>
                                          <TextField
                                            error={Boolean(
                                              touched.general_data
                                                ?.booking_no &&
                                                errors.general_data?.booking_no
                                            )}
                                            helperText={
                                              touched.general_data
                                                ?.booking_no &&
                                              errors.general_data?.booking_no
                                            }
                                            placeholder="Booking Number"
                                            margin="none"
                                            name="general_data.booking_no"
                                            fullWidth
                                            onBlur={handleBlur}
                                            onChange={(e) => {
                                              handleChange(
                                                "general_data.booking_no"
                                              )(e);
                                            }}
                                            type="text"
                                            size="small"
                                            value={
                                              values.general_data?.booking_no
                                            }
                                            variant="outlined"
                                          />
                                        </Grid>
                                        <Grid item size={{xs:12,lg:4}}>
                                          <Typography variant="subtitle1">
                                            Booking Type
                                            <span style={{ color: "red" }}>
                                              *
                                            </span>
                                          </Typography>
                                          <Autocomplete
                                            value={
                                              values.general_data?.booking_type
                                            }
                                            sx={{
                                              "& .MuiAutocomplete-inputRoot[class*='MuiOutlinedInput-root']": {
                                                padding: 0,
                                              },
                                            }}
                                            style={{ padding: 0 }}
                                            onChange={(e, newValue) => {
                                              handleChange(
                                                "general_data.booking_type"
                                              )(newValue);
                                            }}
                                            options={
                                              bookingTypeList?.length > 0
                                                ? bookingTypeList?.map(
                                                    (option) => option
                                                  )
                                                : []
                                            }
                                            renderInput={(params) => (
                                              <TextField
                                                error={Boolean(
                                                  touched.general_data
                                                    ?.booking_type &&
                                                    errors.general_data
                                                      ?.booking_type
                                                )}
                                                helperText={
                                                  touched.general_data
                                                    ?.booking_type &&
                                                  errors.general_data
                                                    ?.booking_type
                                                }
                                                style={{ padding: "0px" }}
                                                variant="outlined"
                                                {...params}
                                                onBlur={(e) => {
                                                  handleChange(
                                                    "general_data.booking_type"
                                                  )(e);
                                                }}
                                                fullWidth
                                              />
                                            )}
                                          />
                                        </Grid>
                                        <Grid item size={{xs:12,lg:4}}>
                                          <Typography variant="subtitle1">
                                            S Date
                                          </Typography>
                                          <TextField
                                            error={Boolean(
                                              touched.general_data?.s_date &&
                                                errors.general_data?.s_date
                                            )}
                                            helperText={
                                              touched.general_data?.s_date &&
                                              errors.general_data?.s_date
                                            }
                                            margin="none"
                                            name="general_data.s_date"
                                            fullWidth
                                            onBlur={handleBlur}
                                            onChange={(e) => {
                                              handleChange(
                                                "general_data.s_date"
                                              )(e);
                                            }}
                                            type="date"
                                            size="small"
                                            value={values.general_data?.s_date}
                                            variant="outlined"
                                          />
                                        </Grid>
                                        <Grid item size={{xs:12,lg:4}}>
                                          <Typography variant="subtitle1">
                                            L Date
                                          </Typography>
                                          <TextField
                                            error={Boolean(
                                              touched.general_data?.l_date &&
                                                errors.general_data?.l_date
                                            )}
                                            helperText={
                                              touched.general_data?.l_date &&
                                              errors.general_data?.l_date
                                            }
                                            margin="none"
                                            name="general_data.l_date"
                                            fullWidth
                                            onBlur={handleBlur}
                                            onChange={(e) => {
                                              handleChange(
                                                "general_data.l_date"
                                              )(e);
                                            }}
                                            type="date"
                                            size="small"
                                            value={values.general_data?.l_date}
                                            variant="outlined"
                                          />
                                        </Grid>

                                        <Grid item size={{xs:12,lg:4}}>
                                          <Typography variant="subtitle1">
                                            From Destination
                                            <span style={{ color: "red" }}>
                                              *
                                            </span>
                                          </Typography>
                                          <Autocomplete
                                            value={
                                              values.general_data?.from_dest
                                            }
                                            sx={{
                                              "& .MuiAutocomplete-inputRoot[class*='MuiOutlinedInput-root']": {
                                                padding: 0,
                                              },
                                            }}
                                            style={{ padding: 0 }}
                                            onChange={(e, newValue) => {
                                              if (newValue) {
                                                handleChange(
                                                  "general_data.from_dest"
                                                )(newValue);
                                                let destinationValue = `${newValue} - ${values.general_data.to_dest}`;
                                                setFieldValue(
                                                  "general_data.destination",
                                                  destinationValue
                                                );
                                              }
                                            }}
                                            options={
                                              masterList?.source_destination
                                                ?.length > 0
                                                ? masterList?.source_destination?.map(
                                                    (option) => option
                                                  )
                                                : []
                                            }
                                            renderInput={(params) => (
                                              <TextField
                                                error={Boolean(
                                                  touched.general_data
                                                    ?.from_dest &&
                                                    errors.general_data
                                                      ?.from_dest
                                                )}
                                                helperText={
                                                  touched.general_data
                                                    ?.from_dest &&
                                                  errors.general_data?.from_dest
                                                }
                                                style={{ padding: "0px" }}
                                                variant="outlined"
                                                {...params}
                                                onBlur={(e) => {
                                                  handleChange(
                                                    "general_data.from_dest"
                                                  )(e);
                                                }}
                                                fullWidth
                                              />
                                            )}
                                          />
                                        </Grid>
                                        <Grid item size={{xs:12,lg:4}}>
                                          <Typography variant="subtitle1">
                                            To Destination
                                            <span style={{ color: "red" }}>
                                              *
                                            </span>
                                          </Typography>
                                          <Autocomplete
                                            value={values.general_data?.to_dest}
                                            sx={{
                                              "& .MuiAutocomplete-inputRoot[class*='MuiOutlinedInput-root']": {
                                                padding: 0,
                                              },
                                            }}
                                            style={{ padding: 0 }}
                                            onChange={(e, newValue) => {
                                              if (newValue) {
                                                handleChange(
                                                  "general_data.to_dest"
                                                )(newValue);

                                                let destinationVal = `${values.general_data.from_dest} - ${newValue}`;

                                                setFieldValue(
                                                  "general_data.destination",
                                                  destinationVal
                                                );
                                              }
                                            }}
                                            options={
                                              masterList?.source_destination
                                                ?.length > 0
                                                ? masterList?.source_destination?.map(
                                                    (option) => option
                                                  )
                                                : []
                                            }
                                            renderInput={(params) => (
                                              <TextField
                                                error={Boolean(
                                                  touched.general_data
                                                    ?.to_dest &&
                                                    errors.general_data?.to_dest
                                                )}
                                                helperText={
                                                  touched.general_data
                                                    ?.to_dest &&
                                                  errors.general_data?.to_dest
                                                }
                                                style={{ padding: "0px" }}
                                                variant="outlined"
                                                {...params}
                                                onBlur={(e) => {
                                                  handleChange(
                                                    "general_data.to_dest"
                                                  )(e);
                                                }}
                                                onChange={(e) => {
                                                  let destinationVal = `${values.general_data.from_dest} - ${e.target.value}`;
                                                  setFieldValue(
                                                    "general_data.destination",
                                                    destinationVal
                                                  );
                                                }}
                                                fullWidth
                                              />
                                            )}
                                          />
                                        </Grid>
                                        <Grid item size={{xs:12,lg:4}}>
                                          <Typography variant="subtitle1">
                                            Destination
                                            <span style={{ color: "red" }}>
                                              *
                                            </span>
                                          </Typography>
                                          <TextField
                                            error={Boolean(
                                              touched.general_data
                                                ?.destination &&
                                                errors.general_data?.destination
                                            )}
                                            helperText={
                                              touched.general_data
                                                ?.destination &&
                                              errors.general_data?.destination
                                            }
                                            margin="none"
                                            name="general_data.destination"
                                            fullWidth
                                            placeholder="Destination"
                                            onBlur={handleBlur}
                                            onChange={(e) => {
                                              handleChange(
                                                "general_data.destination"
                                              )(e);
                                            }}
                                            type="text"
                                            size="small"
                                            value={
                                              values.general_data?.destination
                                            }
                                            variant="outlined"
                                            disabled
                                          />
                                        </Grid>
                                        <Grid item size={{xs:12,lg:4}}>
                                          <Typography variant="subtitle1">
                                            Consignor
                                            <span style={{ color: "red" }}>
                                              *
                                            </span>
                                          </Typography>
                                          <Autocomplete
                                            value={
                                              values.general_data?.consignor
                                            }
                                            sx={{
                                              "& .MuiAutocomplete-inputRoot[class*='MuiOutlinedInput-root']": {
                                                padding: 0,
                                              },
                                            }}
                                            style={{ padding: 0 }}
                                            onChange={(e, newValue) => {
                                              if (newValue) {
                                                handleChange(
                                                  "general_data.consignor"
                                                )(newValue);
                                              }
                                            }}
                                            options={
                                              masterList?.consignor?.length > 0
                                                ? masterList?.consignor?.map(
                                                    (option) => option
                                                  )
                                                : []
                                            }
                                            renderInput={(params) => (
                                              <TextField
                                                error={Boolean(
                                                  touched.general_data
                                                    ?.consignor &&
                                                    errors.general_data
                                                      ?.consignor
                                                )}
                                                helperText={
                                                  touched.general_data
                                                    ?.consignor &&
                                                  errors.general_data?.consignor
                                                }
                                                style={{ padding: "0px" }}
                                                variant="outlined"
                                                {...params}
                                                onBlur={(e) => {
                                                  handleChange(
                                                    "general_data.consignor"
                                                  )(e);
                                                }}
                                                fullWidth
                                              />
                                            )}
                                          />
                                        </Grid>
                                        <Grid item size={{xs:12,lg:4}}>
                                          <Typography variant="subtitle1">
                                            Consignee
                                            <span style={{ color: "red" }}>
                                              *
                                            </span>
                                          </Typography>
                                          <Autocomplete
                                            value={
                                              values.general_data?.consignee
                                            }
                                            sx={{
                                              "& .MuiAutocomplete-inputRoot[class*='MuiOutlinedInput-root']": {
                                                padding: 0,
                                              },
                                            }}
                                            style={{ padding: 0 }}
                                            onChange={(e, newValue) => {
                                              if (newValue) {
                                                handleChange(
                                                  "general_data.consignee"
                                                )(newValue);
                                              }
                                            }}
                                            options={
                                              masterList?.consignee?.length > 0
                                                ? masterList?.consignee?.map(
                                                    (option) => option
                                                  )
                                                : []
                                            }
                                            renderInput={(params) => (
                                              <TextField
                                                error={Boolean(
                                                  touched.general_data
                                                    ?.consignee &&
                                                    errors.general_data
                                                      ?.consignee
                                                )}
                                                helperText={
                                                  touched.general_data
                                                    ?.consignee &&
                                                  errors.general_data?.consignee
                                                }
                                                style={{ padding: "0px" }}
                                                variant="outlined"
                                                {...params}
                                                onBlur={(e) => {
                                                  handleChange(
                                                    "general_data.consignee"
                                                  )(e);
                                                }}
                                                fullWidth
                                              />
                                            )}
                                          />
                                        </Grid>
                                        <Grid item size={{xs:12,lg:4}}>
                                          <Typography variant="subtitle1">
                                            Number of pallets
                                          </Typography>
                                          <TextField
                                            error={Boolean(
                                              touched.general_data
                                                ?.no_of_pallets &&
                                                errors.general_data
                                                  ?.no_of_pallets
                                            )}
                                            helperText={
                                              touched.general_data
                                                ?.no_of_pallets &&
                                              errors.general_data?.no_of_pallets
                                            }
                                            placeholder="Number of pallets"
                                            margin="none"
                                            name="general_data.no_of_pallets"
                                            fullWidth
                                            onBlur={handleBlur}
                                            onChange={(e) => {
                                              handleChange(
                                                "general_data.no_of_pallets"
                                              )(e);
                                            }}
                                            type="text"
                                            size="small"
                                            value={
                                              values?.general_data
                                                ?.no_of_pallets
                                            }
                                            variant="outlined"
                                          />
                                        </Grid>
                                        <Grid item size={{xs:12,lg:4}}>
                                          <Typography variant="subtitle1">
                                            Actual Weight
                                          </Typography>
                                          <TextField
                                            error={Boolean(
                                              touched.general_data
                                                ?.actual_weight &&
                                                errors.general_data
                                                  ?.actual_weight
                                            )}
                                            helperText={
                                              touched.general_data
                                                ?.actual_weight &&
                                              errors.general_data?.actual_weight
                                            }
                                            placeholder="Actual Weight"
                                            margin="none"
                                            name="general_data.actual_weight"
                                            fullWidth
                                            onBlur={handleBlur}
                                            onChange={(e) => {
                                              handleChange(
                                                "general_data.actual_weight"
                                              )(e);
                                            }}
                                            type="text"
                                            size="small"
                                            value={
                                              values?.general_data
                                                ?.actual_weight
                                            }
                                            variant="outlined"
                                          />
                                        </Grid>
                                        <Grid item size={{xs:12,lg:4}}>
                                          <Typography variant="subtitle1">
                                            Charge Weight
                                          </Typography>
                                          <TextField
                                            error={Boolean(
                                              touched.general_data
                                                ?.charge_weight &&
                                                errors.general_data
                                                  ?.charge_weight
                                            )}
                                            helperText={
                                              touched.general_data
                                                ?.charge_weight &&
                                              errors.general_data?.charge_weight
                                            }
                                            placeholder="Charge Weight"
                                            margin="none"
                                            name="general_data.charge_weight"
                                            fullWidth
                                            onBlur={handleBlur}
                                            onChange={(e) => {
                                              handleChange(
                                                "general_data.charge_weight"
                                              )(e);
                                            }}
                                            type="text"
                                            size="small"
                                            value={
                                              values.general_data?.charge_weight
                                            }
                                            variant="outlined"
                                          />
                                        </Grid>
                                        <Grid item size={{xs:12,lg:4}}>
                                          <Typography variant="subtitle1">
                                            Particulars
                                            <span style={{ color: "red" }}>
                                              *
                                            </span>
                                          </Typography>
                                          <Autocomplete
                                            value={
                                              values.general_data?.particulars
                                            }
                                            sx={{
                                              "& .MuiAutocomplete-inputRoot[class*='MuiOutlinedInput-root']": {
                                                padding: 0,
                                              },
                                            }}
                                            style={{ padding: 0 }}
                                            onChange={(e, newValue) => {
                                              if (newValue) {
                                                handleChange(
                                                  "general_data.particulars"
                                                )(newValue);
                                              }
                                            }}
                                            options={
                                              masterList?.particulars?.length >
                                              0
                                                ? masterList?.particulars?.map(
                                                    (option) => option
                                                  )
                                                : []
                                            }
                                            renderInput={(params) => (
                                              <TextField
                                                error={Boolean(
                                                  touched.general_data
                                                    ?.particulars &&
                                                    errors.general_data
                                                      ?.particulars
                                                )}
                                                helperText={
                                                  touched.general_data
                                                    ?.particulars &&
                                                  errors.general_data
                                                    ?.particulars
                                                }
                                                style={{ padding: "0px" }}
                                                variant="outlined"
                                                {...params}
                                                onBlur={(e) => {
                                                  handleChange(
                                                    "general_data.particulars"
                                                  )(e);
                                                }}
                                                fullWidth
                                              />
                                            )}
                                          />
                                        </Grid>
                                      </Grid>
                                    </CardContent>
                                  </Card>
                                </AccordionDetails>
                              </Accordion>
                              <Accordion
                                expanded={
                                  expanded === "Transportation Details" &&
                                  (dirty || isFormTouch || values.pk) &&
                                  !errors.general_data
                                }
                                onChange={handleChangeEvent(
                                  "Transportation Details"
                                )}
                                style={{
                                  marginBottom: 20,
                                  borderRadius: 5,
                                  boxShadow: 3,
                                }}
                              >
                                <AccordionSummary
                                  expandIcon={<ExpandMoreIcon />}
                                  aria-controls="panel1a-content"
                                  id="panel1a-header"
                                >
                                  <Typography>
                                    Transportation Details
                                  </Typography>
                                </AccordionSummary>
                                <AccordionDetails
                                  style={{
                                    background: "#e5f2ff",
                                    display: "block",
                                  }}
                                >
                                  <Card>
                                    <CardContent>
                                      <Grid container spacing={2}>
                                        <Grid item size={{xs:12,lg:4}}>
                                          <Typography variant="subtitle1">
                                            Transporter
                                            <span style={{ color: "red" }}>
                                              *
                                            </span>
                                          </Typography>
                                          <TextField
                                            error={Boolean(
                                              touched.transportation_data
                                                ?.transporter &&
                                                errors.transportation_data
                                                  ?.transporter
                                            )}
                                            helperText={
                                              touched.transportation_data
                                                ?.transporter &&
                                              errors.transportation_data
                                                ?.transporter
                                            }
                                            select
                                            placeholder="Booking Type"
                                            margin="none"
                                            autoComplete="off"
                                            name="transportation_data.transporter"
                                            fullWidth
                                            onBlur={handleBlur}
                                            onChange={(e) => {
                                              // if (newValue) {
                                              getDriverTruckData(
                                                e.target.value
                                              );
                                              handleChange(
                                                "transportation_data.transporter"
                                              )(e);
                                            }}
                                            type="text"
                                            size="small"
                                            value={
                                              values.transportation_data
                                                ?.transporter
                                            }
                                            variant="outlined"
                                          >
                                            {masterList?.transporter?.map(
                                              (option) => (
                                                <MenuItem
                                                  key={option}
                                                  value={option}
                                                >
                                                  {option}
                                                </MenuItem>
                                              )
                                            )}
                                          </TextField>
                                        </Grid>
                                        <Grid item size={{xs:12,lg:4}}>
                                          <Typography variant="subtitle1">
                                            Truck Number
                                            <span style={{ color: "red" }}>
                                              *
                                            </span>
                                          </Typography>
                                          <Autocomplete
                                            value={
                                              values.transportation_data
                                                ?.truck_no
                                            }
                                            sx={{
                                              "& .MuiAutocomplete-inputRoot[class*='MuiOutlinedInput-root']": {
                                                padding: 0,
                                              },
                                            }}
                                            style={{ padding: 0 }}
                                            onChange={(e, newValue) => {
                                              if (newValue) {
                                                handleChange(
                                                  "transportation_data.truck_no"
                                                )(newValue);
                                              }
                                            }}
                                            options={
                                              selectedDriverRef?.current
                                                ?.truck_list?.length > 0
                                                ? selectedDriverRef.current
                                                    .truck_list
                                                : []
                                            }
                                            renderInput={(params) => (
                                              <TextField
                                                style={{ padding: "0px" }}
                                                variant="outlined"
                                                error={Boolean(
                                                  touched.transportation_data
                                                    ?.truck_no &&
                                                    errors.transportation_data
                                                      ?.truck_no
                                                )}
                                                helperText={
                                                  touched.transportation_data
                                                    ?.truck_no &&
                                                  errors.transportation_data
                                                    ?.truck_no
                                                }
                                                {...params}
                                                onBlur={(e) => {
                                                  handleChange(
                                                    "transportation_data.truck_no"
                                                  )(e);
                                                }}
                                                fullWidth
                                              />
                                            )}
                                          />
                                        </Grid>
                                        <Grid item size={{xs:12,lg:4}}>
                                          <Typography variant="subtitle1">
                                            Driver Name
                                            <span style={{ color: "red" }}>
                                              *
                                            </span>
                                          </Typography>

                                          <Autocomplete
                                            value={
                                              values.transportation_data
                                                ?.driver_name
                                            }
                                            sx={{
                                              "& .MuiAutocomplete-inputRoot[class*='MuiOutlinedInput-root']": {
                                                padding: 0,
                                              },
                                            }}
                                            style={{ padding: 0 }}
                                            onChange={(e, newValue) => {
                                              if (newValue) {
                                                handleChange(
                                                  "transportation_data.driver_name"
                                                )(newValue);
                                                getMobileAndLicenceNumber(
                                                  selectedDriverRef?.current
                                                    ?.driver_list,
                                                  newValue,
                                                  setFieldValue
                                                );
                                              }
                                            }}
                                            options={
                                              driverList?.length > 0
                                                ? driverList
                                                : []
                                            }
                                            renderInput={(params) => (
                                              <TextField
                                                style={{ padding: "0px" }}
                                                variant="outlined"
                                                error={Boolean(
                                                  touched.transportation_data
                                                    ?.driver_name &&
                                                    errors.transportation_data
                                                      ?.driver_name
                                                )}
                                                helperText={
                                                  touched.transportation_data
                                                    ?.driver_name &&
                                                  errors.transportation_data
                                                    ?.driver_name
                                                }
                                                {...params}
                                                onBlur={(e) => {
                                                  handleChange(
                                                    "transportation_data.driver_name"
                                                  )(e);
                                                }}
                                                fullWidth
                                              />
                                            )}
                                          />
                                        </Grid>
                                        <Grid item size={{xs:12,lg:4}}>
                                          <Typography variant="subtitle1">
                                            License Number
                                          </Typography>
                                          <TextField
                                            error={Boolean(
                                              touched.transportation_data
                                                ?.license_no &&
                                                errors.transportation_data
                                                  ?.license_no
                                            )}
                                            helperText={
                                              touched.transportation_data
                                                ?.license_no &&
                                              errors.transportation_data
                                                ?.license_no
                                            }
                                            placeholder="License Number"
                                            margin="none"
                                            name="transportation_data.license_no"
                                            fullWidth
                                            onBlur={handleBlur}
                                            onChange={(e) => {
                                              handleChange(
                                                "transportation_data.license_no"
                                              )(e);
                                            }}
                                            type="text"
                                            size="small"
                                            value={
                                              values.transportation_data
                                                ?.license_no
                                            }
                                            variant="outlined"
                                          />
                                        </Grid>
                                        <Grid item size={{xs:12,lg:4}}>
                                          <Typography variant="subtitle1">
                                            Mobile Number
                                          </Typography>
                                          <TextField
                                            error={Boolean(
                                              touched.transportation_data
                                                ?.mobile_no &&
                                                errors.transportation_data
                                                  ?.mobile_no
                                            )}
                                            helperText={
                                              touched.transportation_data
                                                ?.mobile_no &&
                                              errors.transportation_data
                                                ?.mobile_no
                                            }
                                            placeholder="Mobile Number"
                                            margin="none"
                                            name="transportation_data.mobile_no"
                                            fullWidth
                                            onBlur={handleBlur}
                                            onChange={(e) => {
                                              handleChange(
                                                "transportation_data.mobile_no"
                                              )(e);
                                            }}
                                            type="text"
                                            size="small"
                                            value={
                                              values.transportation_data
                                                ?.mobile_no
                                            }
                                            variant="outlined"
                                          />
                                        </Grid>

                                        <Grid item size={{xs:12,lg:4}}>
                                          <Typography variant="subtitle1">
                                            Container Type
                                            <span style={{ color: "red" }}>
                                              *
                                            </span>
                                          </Typography>
                                          <TextField
                                            error={Boolean(
                                              touched.transportation_data
                                                ?.container_type &&
                                                errors.transportation_data
                                                  ?.container_type
                                            )}
                                            helperText={
                                              touched.transportation_data
                                                ?.container_type &&
                                              errors.transportation_data
                                                ?.container_type
                                            }
                                            select
                                            placeholder="Booking Type"
                                            margin="none"
                                            autoComplete="off"
                                            name="transportation_data.container_type"
                                            fullWidth
                                            onBlur={handleBlur}
                                            onChange={(e) => {
                                              handleChange(
                                                "transportation_data.container_type"
                                              )(e);
                                            }}
                                            type="text"
                                            size="small"
                                            value={
                                              values.transportation_data
                                                ?.container_type
                                            }
                                            variant="outlined"
                                          >
                                            {containerTypeList.map((option) => (
                                              <MenuItem
                                                key={option}
                                                value={option}
                                              >
                                                {option}
                                              </MenuItem>
                                            ))}
                                          </TextField>
                                        </Grid>
                                        <Grid item size={{xs:12,lg:4}}>
                                          <Typography variant="subtitle1">
                                            Container Size
                                            <span style={{ color: "red" }}>
                                              *
                                            </span>
                                          </Typography>
                                          <TextField
                                            error={Boolean(
                                              touched.transportation_data
                                                ?.container_size &&
                                                errors.transportation_data
                                                  ?.container_size
                                            )}
                                            helperText={
                                              touched.transportation_data
                                                ?.container_size &&
                                              errors.transportation_data
                                                ?.container_size
                                            }
                                            select
                                            margin="none"
                                            autoComplete="off"
                                            name="transportation_data.container_size"
                                            fullWidth
                                            onBlur={handleBlur}
                                            onChange={(e) => {
                                              handleChange(
                                                "transportation_data.container_size"
                                              )(e);
                                            }}
                                            type="text"
                                            size="small"
                                            value={
                                              values.transportation_data
                                                ?.container_size
                                            }
                                            variant="outlined"
                                          >
                                            {containerSizeList.map((option) => (
                                              <MenuItem
                                                key={option}
                                                value={option}
                                              >
                                                {option}
                                              </MenuItem>
                                            ))}
                                          </TextField>
                                        </Grid>

                                        <Grid item size={{xs:12,lg:4}}>
                                          <Typography variant="subtitle1">
                                            Container Number
                                            <span style={{ color: "red" }}>
                                              *
                                            </span>
                                          </Typography>
                                          <TextField
                                            inputProps={{ maxLength: 11 }}
                                            error={Boolean(
                                              touched.transportation_data
                                                ?.container_no &&
                                                errors.transportation_data
                                                  ?.container_no
                                            )}
                                            helperText={
                                              touched.transportation_data
                                                ?.container_no &&
                                              errors.transportation_data
                                                ?.container_no
                                            }
                                            margin="none"
                                            name="transportation_data.container_no"
                                            fullWidth
                                            onBlur={handleBlur}
                                            onChange={(e) => {
                                              handleChange(
                                                "transportation_data.container_no"
                                              )(e);
                                            }}
                                            placeholder="Container Number"
                                            type="text"
                                            size="small"
                                            value={
                                              values.transportation_data
                                                ?.container_no
                                            }
                                            variant="outlined"
                                          />
                                        </Grid>
                                        <Grid item size={{xs:12,lg:4}}>
                                          <Typography variant="subtitle1">
                                            Shipping Line
                                            <span style={{ color: "red" }}>
                                              *
                                            </span>
                                          </Typography>

                                          <Autocomplete
                                            value={
                                              values.transportation_data
                                                ?.shipping_line
                                            }
                                            sx={{
                                              "& .MuiAutocomplete-inputRoot[class*='MuiOutlinedInput-root']": {
                                                padding: 0,
                                              },
                                            }}
                                            style={{ padding: 0 }}
                                            onChange={(e, newValue) => {
                                              if (newValue) {
                                                handleChange(
                                                  "transportation_data.shipping_line"
                                                )(newValue);
                                              }
                                            }}
                                            options={
                                              masterList?.shipping_line
                                                ?.length > 0
                                                ? masterList?.shipping_line?.map(
                                                    (option) => option
                                                  )
                                                : []
                                            }
                                            renderInput={(params) => (
                                              <TextField
                                                error={Boolean(
                                                  touched.transportation_data
                                                    ?.shipping_line &&
                                                    errors.transportation_data
                                                      ?.shipping_line
                                                )}
                                                helperText={
                                                  touched.transportation_data
                                                    ?.shipping_line &&
                                                  errors.transportation_data
                                                    ?.shipping_line
                                                }
                                                style={{ padding: "0px" }}
                                                variant="outlined"
                                                {...params}
                                                onBlur={(e) => {
                                                  handleChange(
                                                    "transportation_data.shipping_line"
                                                  )(e);
                                                }}
                                                fullWidth
                                              />
                                            )}
                                          />
                                        </Grid>
                                        <Grid item size={{xs:12,lg:4}}>
                                          <Typography variant="subtitle1">
                                            Seal Number
                                          </Typography>
                                          <TextField
                                            error={Boolean(
                                              touched.transportation_data
                                                ?.seal_no &&
                                                errors.transportation_data
                                                  ?.seal_no
                                            )}
                                            helperText={
                                              touched.transportation_data
                                                ?.seal_no &&
                                              errors.transportation_data
                                                ?.seal_no
                                            }
                                            placeholder="Seal Number"
                                            margin="none"
                                            name="transportation_data.seal_no"
                                            fullWidth
                                            onBlur={handleBlur}
                                            onChange={(e) => {
                                              handleChange(
                                                "transportation_data.seal_no"
                                              )(e);
                                            }}
                                            type="text"
                                            size="small"
                                            value={
                                              values.transportation_data
                                                ?.seal_no
                                            }
                                            variant="outlined"
                                          />
                                        </Grid>
                                        <Grid item size={{xs:12,lg:4}}>
                                          <Typography variant="subtitle1">
                                            Status
                                          </Typography>

                                          <Autocomplete
                                            value={
                                              values.transportation_data?.status
                                            }
                                            sx={{
                                              "& .MuiAutocomplete-inputRoot[class*='MuiOutlinedInput-root']": {
                                                padding: 0,
                                              },
                                            }}
                                            style={{ padding: 0 }}
                                            onChange={(e, newValue) => {
                                              if (newValue) {
                                                handleChange(
                                                  "transportation_data.status"
                                                )(newValue);
                                              }
                                            }}
                                            options={
                                              masterList?.status?.lenth > 0
                                                ? masterList?.status?.map(
                                                    (option) => option
                                                  )
                                                : []
                                            }
                                            renderInput={(params) => (
                                              <TextField
                                                error={Boolean(
                                                  touched.transportation_data
                                                    ?.status &&
                                                    errors.transportation_data
                                                      ?.status
                                                )}
                                                helperText={
                                                  touched.transportation_data
                                                    ?.status &&
                                                  errors.transportation_data
                                                    ?.status
                                                }
                                                style={{ padding: "0px" }}
                                                variant="outlined"
                                                {...params}
                                                onBlur={(e) => {
                                                  handleChange(
                                                    "transportation_data.status"
                                                  )(e);
                                                }}
                                                fullWidth
                                              />
                                            )}
                                          />
                                        </Grid>
                                        <Grid item size={{xs:12,lg:4}}>
                                          <Typography variant="subtitle1">
                                            Port
                                          </Typography>
                                          <Autocomplete
                                            value={
                                              values.transportation_data?.port
                                            }
                                            sx={{
                                              "& .MuiAutocomplete-inputRoot[class*='MuiOutlinedInput-root']": {
                                                padding: 0,
                                              },
                                            }}
                                            style={{ padding: 0 }}
                                            onChange={(e, newValue) => {
                                              if (newValue) {
                                                handleChange(
                                                  "transportation_data.port"
                                                )(newValue);
                                              }
                                            }}
                                            options={
                                              masterList?.port?.lenth > 0
                                                ? masterList?.port?.map(
                                                    (option) => option
                                                  )
                                                : []
                                            }
                                            renderInput={(params) => (
                                              <TextField
                                                error={Boolean(
                                                  touched.transportation_data
                                                    ?.port &&
                                                    errors.transportation_data
                                                      ?.port
                                                )}
                                                helperText={
                                                  touched.transportation_data
                                                    ?.port &&
                                                  errors.transportation_data
                                                    ?.port
                                                }
                                                style={{ padding: "0px" }}
                                                variant="outlined"
                                                {...params}
                                                onBlur={(e) => {
                                                  handleChange(
                                                    "transportation_data.port"
                                                  )(e);
                                                }}
                                                fullWidth
                                              />
                                            )}
                                          />
                                        </Grid>
                                        <Grid item size={{xs:12,lg:4}}>
                                          <Typography variant="subtitle1">
                                            Pod
                                          </Typography>
                                          <Autocomplete
                                            value={
                                              values.transportation_data?.pod
                                            }
                                            sx={{
                                              "& .MuiAutocomplete-inputRoot[class*='MuiOutlinedInput-root']": {
                                                padding: 0,
                                              },
                                            }}
                                            style={{ padding: 0 }}
                                            onChange={(e, newValue) => {
                                              if (newValue) {
                                                handleChange(
                                                  "transportation_data.pod"
                                                )(newValue);
                                              }
                                            }}
                                            options={
                                              masterList?.pod?.lenth > 0
                                                ? masterList?.pod?.map(
                                                    (option) => option
                                                  )
                                                : []
                                            }
                                            renderInput={(params) => (
                                              <TextField
                                                error={Boolean(
                                                  touched.transportation_data
                                                    ?.pod &&
                                                    errors.transportation_data
                                                      ?.pod
                                                )}
                                                helperText={
                                                  touched.transportation_data
                                                    ?.pod &&
                                                  errors.transportation_data
                                                    ?.pod
                                                }
                                                style={{ padding: "0px" }}
                                                variant="outlined"
                                                {...params}
                                                onBlur={(e) => {
                                                  handleChange(
                                                    "transportation_data.pod"
                                                  )(e);
                                                }}
                                                fullWidth
                                              />
                                            )}
                                          />
                                        </Grid>
                                      </Grid>
                                    </CardContent>
                                  </Card>
                                </AccordionDetails>
                              </Accordion>

                              <Accordion
                                expanded={
                                  expanded === "Charges" &&
                                  (dirty || isFormTouch || values.pk) &&
                                  !errors.general_data &&
                                  !errors.transportation_data
                                }
                                onChange={handleChangeEvent("Charges")}
                                style={{
                                  marginBottom: 20,
                                  borderRadius: 5,
                                  boxShadow: 3,
                                }}
                              >
                                <AccordionSummary
                                  expandIcon={<ExpandMoreIcon />}
                                  aria-controls="panel1a-content"
                                  id="panel1a-header"
                                >
                                  <Typography>Charges</Typography>
                                </AccordionSummary>
                                <AccordionDetails
                                  style={{
                                    background: "#e5f2ff",
                                    display: "block",
                                  }}
                                >
                                  <Card>
                                    <CardContent>
                                      <Grid container spacing={2}>
                                        <Grid item size={{xs:12,lg:4}}>
                                          <Typography variant="subtitle1">
                                            Tr Freight
                                            <span style={{ color: "red" }}>
                                              *
                                            </span>
                                          </Typography>
                                          <TextField
                                            error={Boolean(
                                              touched.charges?.tr_freight &&
                                                errors.charges?.tr_freight
                                            )}
                                            helperText={
                                              touched.charges?.tr_freight &&
                                              errors.charges?.tr_freight
                                            }
                                            placeholder=" Tr Freight"
                                            margin="none"
                                            name="charges.tr_freight"
                                            fullWidth
                                            onBlur={handleBlur}
                                            onChange={(e) => {
                                              if (
                                                /^[0-9]*$/.test(e.target.value)
                                              ) {
                                                handleChange(
                                                  "charges.tr_freight"
                                                )(e);
                                                updateBalanceAmount(
                                                  values.charges,
                                                  "tr_freight",
                                                  e.target.value,
                                                  setFieldValue
                                                );
                                              }
                                            }}
                                            type="text"
                                            size="small"
                                            value={values.charges?.tr_freight}
                                            variant="outlined"
                                          />
                                        </Grid>
                                        <Grid item size={{xs:12,lg:4}}>
                                          <Typography variant="subtitle1">
                                            Advance
                                          </Typography>
                                          <TextField
                                            error={Boolean(
                                              touched.charges?.advance &&
                                                errors.charges?.advance
                                            )}
                                            helperText={
                                              touched.charges?.advance &&
                                              errors.charges?.advance
                                            }
                                            placeholder="Advance"
                                            margin="none"
                                            name="charges.advance"
                                            fullWidth
                                            onBlur={handleBlur}
                                            onChange={(e) => {
                                              if (
                                                /^[0-9]*$/.test(e.target.value)
                                              ) {
                                                handleChange("charges.advance")(
                                                  e
                                                );
                                                updateBalanceAmount(
                                                  values.charges,
                                                  "advance",
                                                  e.target.value,
                                                  setFieldValue
                                                );
                                              }
                                            }}
                                            type="text"
                                            size="small"
                                            value={values.charges?.advance}
                                            variant="outlined"
                                          />
                                        </Grid>
                                        <Grid item size={{xs:12,lg:4}}>
                                          <Typography variant="subtitle1">
                                            Diesel Quantity
                                          </Typography>
                                          <TextField
                                            error={Boolean(
                                              touched.charges
                                                ?.diesel_quantity &&
                                                errors.charges?.diesel_quantity
                                            )}
                                            helperText={
                                              touched.charges
                                                ?.diesel_quantity &&
                                              errors.charges?.diesel_quantity
                                            }
                                            placeholder="Diesel Quantity"
                                            margin="none"
                                            name="charges.diesel_quantity"
                                            fullWidth
                                            onBlur={handleBlur}
                                            onChange={(e) => {
                                              if (
                                                /^[0-9]*$/.test(e.target.value)
                                              ) {
                                                handleChange(
                                                  "charges.diesel_quantity"
                                                )(e);
                                                let dieselCostVal =
                                                  +values.charges?.diesel_rate *
                                                  e.target.value;
                                                setFieldValue(
                                                  "charges.diesel_cost",
                                                  dieselCostVal
                                                );
                                                updateBalanceAmount(
                                                  values.charges,
                                                  "diesel_cost",
                                                  dieselCostVal,
                                                  setFieldValue
                                                );
                                              }
                                            }}
                                            type="text"
                                            size="small"
                                            value={
                                              values.charges?.diesel_quantity
                                            }
                                            variant="outlined"
                                          />
                                        </Grid>
                                        <Grid item size={{xs:12,lg:4}}>
                                          <Typography variant="subtitle1">
                                            Diesel Rate
                                            {values.charges?.diesel_quantity !==
                                              "0" &&
                                              values.charges
                                                ?.diesel_quantity !== "" && (
                                                <span style={{ color: "red" }}>
                                                  *
                                                </span>
                                              )}
                                          </Typography>
                                          <TextField
                                            error={Boolean(
                                              touched.charges?.diesel_rate &&
                                                errors.charges?.diesel_rate
                                            )}
                                            helperText={
                                              touched.charges?.diesel_rate &&
                                              errors.charges?.diesel_rate
                                            }
                                            placeholder="Diesel Rate"
                                            margin="none"
                                            name="charges.diesel_rate"
                                            fullWidth
                                            onBlur={handleBlur}
                                            onChange={(e) => {
                                              if (
                                                /^[0-9]*$/.test(e.target.value)
                                              ) {
                                                handleChange(
                                                  "charges.diesel_rate"
                                                )(e);
                                                let dieselCostVal =
                                                  values?.charges
                                                    ?.diesel_quantity *
                                                  e.target.value;
                                                setFieldValue(
                                                  "charges.diesel_cost",
                                                  dieselCostVal
                                                );
                                                updateBalanceAmount(
                                                  values.charges,
                                                  "diesel_cost",
                                                  dieselCostVal,
                                                  setFieldValue
                                                );
                                              }
                                            }}
                                            type="text"
                                            size="small"
                                            value={values.charges?.diesel_rate}
                                            variant="outlined"
                                          />
                                        </Grid>

                                        <Grid item size={{xs:12,lg:4}}>
                                          <Typography variant="subtitle1">
                                            Diesel Cost
                                          </Typography>
                                          <TextField
                                            error={Boolean(
                                              touched.charges?.diesel_cost &&
                                                errors.charges?.diesel_cost
                                            )}
                                            helperText={
                                              touched.charges?.diesel_cost &&
                                              errors.charges?.diesel_cost
                                            }
                                            placeholder="Diesel Cost"
                                            margin="none"
                                            name="charges.diesel_cost"
                                            fullWidth
                                            onBlur={handleBlur}
                                            onChange={(e) => {
                                              if (
                                                /^[0-9]*$/.test(e.target.value)
                                              ) {
                                                handleChange(
                                                  "charges.diesel_cost"
                                                )(e);
                                                updateBalanceAmount(
                                                  values.charges,
                                                  "diesel_cost",
                                                  e.target.value,
                                                  setFieldValue
                                                );
                                              }
                                            }}
                                            type="text"
                                            size="small"
                                            value={values.charges?.diesel_cost}
                                            variant="outlined"
                                            disabled
                                          />
                                        </Grid>
                                        <Grid item size={{xs:12,lg:4}}>
                                          <Typography variant="subtitle1">
                                            Fuel Pump{" "}
                                            {values?.charges?.diesel_cost !==
                                              "0" && (
                                              <span style={{ color: "red" }}>
                                                *
                                              </span>
                                            )}
                                          </Typography>
                                          <Autocomplete
                                            value={values?.charges?.fuel_pump}
                                            sx={{
                                              "& .MuiAutocomplete-inputRoot[class*='MuiOutlinedInput-root']": {
                                                padding: 0,
                                              },
                                            }}
                                            style={{ padding: 0 }}
                                            onChange={(e, newValue) => {
                                              if (newValue) {
                                                handleChange(
                                                  "charges.fuel_pump"
                                                )(newValue);
                                              }
                                            }}
                                            options={
                                              masterList?.fuel_pump?.length > 0
                                                ? masterList.fuel_pump.map(
                                                    (option) => option
                                                  )
                                                : []
                                            }
                                            renderInput={(params) => (
                                              <TextField
                                                error={Boolean(
                                                  touched.charges?.fuel_pump &&
                                                    errors.charges?.fuel_pump
                                                )}
                                                helperText={
                                                  touched.charges?.fuel_pump &&
                                                  errors.charges?.fuel_pump
                                                }
                                                style={{ padding: "0px" }}
                                                variant="outlined"
                                                {...params}
                                                onBlur={(e) => {
                                                  handleChange(
                                                    "charges.fuel_pump"
                                                  )(e);
                                                }}
                                                fullWidth
                                              />
                                            )}
                                          />
                                        </Grid>
                                        <Grid item size={{xs:12,lg:4}}>
                                          <Typography variant="subtitle1">
                                            Detention Charges
                                          </Typography>
                                          <TextField
                                            error={Boolean(
                                              touched.charges
                                                ?.detention_charges &&
                                                errors.charges
                                                  ?.detention_charges
                                            )}
                                            helperText={
                                              touched.charges
                                                ?.detention_charges &&
                                              errors.charges?.detention_charges
                                            }
                                            placeholder="Detention Charges"
                                            margin="none"
                                            name="charges.detention_charges"
                                            fullWidth
                                            onBlur={handleBlur}
                                            onChange={(e) => {
                                              if (
                                                /^[0-9]*$/.test(e.target.value)
                                              ) {
                                                handleChange(
                                                  "charges.detention_charges"
                                                )(e);
                                                updateBalanceAmount(
                                                  values.charges,
                                                  "detention_charges",
                                                  e.target.value,
                                                  setFieldValue
                                                );
                                              }
                                            }}
                                            type="text"
                                            size="small"
                                            value={
                                              values.charges?.detention_charges
                                            }
                                            variant="outlined"
                                          />
                                        </Grid>
                                        <Grid item size={{xs:12,lg:4}}>
                                          <Typography variant="subtitle1">
                                            Extra Charges
                                          </Typography>
                                          <TextField
                                            error={Boolean(
                                              touched.charges?.extra_charges &&
                                                errors.charges?.extra_charges
                                            )}
                                            helperText={
                                              touched.charges?.extra_charges &&
                                              errors.charges?.extra_charges
                                            }
                                            placeholder="Extra Charges"
                                            margin="none"
                                            name="charges.extra_charges"
                                            fullWidth
                                            onBlur={handleBlur}
                                            onChange={(e) => {
                                              if (
                                                /^[0-9]*$/.test(e.target.value)
                                              ) {
                                                handleChange(
                                                  "charges.extra_charges"
                                                )(e);
                                                updateBalanceAmount(
                                                  values.charges,
                                                  "extra_charges",
                                                  e.target.value,
                                                  setFieldValue
                                                );
                                              }
                                            }}
                                            type="text"
                                            size="small"
                                            value={
                                              values.charges?.extra_charges
                                            }
                                            variant="outlined"
                                          />
                                        </Grid>
                                        <Grid item size={{xs:12,lg:4}}>
                                          <Typography variant="subtitle1">
                                            Balance
                                          </Typography>
                                          <TextField
                                            error={Boolean(
                                              touched.charges?.balance &&
                                                errors.charges?.balance
                                            )}
                                            helperText={
                                              touched.charges?.balance &&
                                              errors.charges?.balance
                                            }
                                            disabled
                                            placeholder="Balance"
                                            margin="none"
                                            name="charges.balance"
                                            fullWidth
                                            onBlur={handleBlur}
                                            onChange={(e) => {
                                              if (
                                                /^[0-9]*$/.test(e.target.value)
                                              ) {
                                                handleChange("charges.balance")(
                                                  e
                                                );
                                              }
                                            }}
                                            type="text"
                                            size="small"
                                            value={values.charges?.balance}
                                            variant="outlined"
                                          />
                                        </Grid>
                                        <Grid item size={{xs:12,lg:4}}>
                                          <Typography variant="subtitle1">
                                            Loading Unloading Charges
                                          </Typography>
                                          <TextField
                                            error={Boolean(
                                              touched.charges
                                                ?.loading_unloading &&
                                                errors.charges
                                                  ?.loading_unloading
                                            )}
                                            helperText={
                                              touched.charges
                                                ?.loading_unloading &&
                                              errors.charges?.loading_unloading
                                            }
                                            placeholder="Loading Unloading"
                                            margin="none"
                                            name="charges.loading_unloading"
                                            fullWidth
                                            onBlur={handleBlur}
                                            onChange={(e) => {
                                              if (
                                                /^[0-9]*$/.test(e.target.value)
                                              ) {
                                                handleChange(
                                                  "charges.loading_unloading"
                                                )(e);
                                              }
                                            }}
                                            type="text"
                                            size="small"
                                            value={
                                              values.charges?.loading_unloading
                                            }
                                            variant="outlined"
                                          />
                                        </Grid>
                                        <Grid item size={{xs:12,lg:4}}>
                                          <Typography variant="subtitle1">
                                            Handling Charges
                                          </Typography>
                                          <TextField
                                            error={Boolean(
                                              touched.charges
                                                ?.handling_charges &&
                                                errors.charges?.handling_charges
                                            )}
                                            helperText={
                                              touched.charges
                                                ?.handling_charges &&
                                              errors.charges?.handling_charges
                                            }
                                            placeholder="Handling Charges"
                                            margin="none"
                                            name="charges.handling_charges"
                                            fullWidth
                                            onBlur={handleBlur}
                                            onChange={(e) => {
                                              if (
                                                /^[0-9]*$/.test(e.target.value)
                                              ) {
                                                handleChange(
                                                  "charges.handling_charges"
                                                )(e);
                                              }
                                            }}
                                            type="text"
                                            size="small"
                                            value={
                                              values.charges?.handling_charges
                                            }
                                            variant="outlined"
                                          />
                                        </Grid>
                                        <Grid item size={{xs:12,lg:4}}>
                                          <Typography variant="subtitle1">
                                            Handling Company{" "}
                                            {values.charges
                                              ?.handling_charges !== "0" && (
                                              <span style={{ color: "red" }}>
                                                *
                                              </span>
                                            )}
                                          </Typography>

                                          <Autocomplete
                                            value={
                                              values?.charges?.handling_company
                                            }
                                            sx={{
                                              "& .MuiAutocomplete-inputRoot[class*='MuiOutlinedInput-root']": {
                                                padding: 0,
                                              },
                                            }}
                                            style={{ padding: 0 }}
                                            onChange={(e, newValue) => {
                                              if (newValue) {
                                                handleChange(
                                                  "charges.handling_company"
                                                )(newValue);
                                              }
                                            }}
                                            options={
                                              masterList?.handling_company
                                                ?.length > 0
                                                ? masterList.handling_company.map(
                                                    (option) => option
                                                  )
                                                : []
                                            }
                                            renderInput={(params) => (
                                              <TextField
                                                error={Boolean(
                                                  touched.charges
                                                    ?.handling_company &&
                                                    errors.charges
                                                      ?.handling_company
                                                )}
                                                helperText={
                                                  touched.charges
                                                    ?.handling_company &&
                                                  errors.charges
                                                    ?.handling_company
                                                }
                                                style={{ padding: "0px" }}
                                                variant="outlined"
                                                {...params}
                                                onBlur={(e) => {
                                                  handleChange(
                                                    "charges.handling_company"
                                                  )(e);
                                                }}
                                                fullWidth
                                              />
                                            )}
                                          />
                                        </Grid>
                                        <Grid item size={{xs:12,lg:4}}>
                                          <Typography variant="subtitle1">
                                            Washing Charges
                                          </Typography>
                                          <TextField
                                            error={Boolean(
                                              touched.charges
                                                ?.washing_charges &&
                                                errors.charges?.washing_charges
                                            )}
                                            helperText={
                                              touched.charges
                                                ?.washing_charges &&
                                              errors.charges?.washing_charges
                                            }
                                            placeholder="Washing Charges"
                                            margin="none"
                                            name="charges.washing_charges"
                                            fullWidth
                                            onBlur={handleBlur}
                                            onChange={(e) => {
                                              if (
                                                /^[0-9]*$/.test(e.target.value)
                                              ) {
                                                handleChange(
                                                  "charges.washing_charges"
                                                )(e);
                                              }
                                            }}
                                            type="text"
                                            size="small"
                                            value={
                                              values.charges?.washing_charges
                                            }
                                            variant="outlined"
                                          />
                                        </Grid>
                                        <Grid item size={{xs:12,lg:4}}>
                                          <Typography variant="subtitle1">
                                            Repair Charges
                                          </Typography>
                                          <TextField
                                            error={Boolean(
                                              touched.charges?.repair_charges &&
                                                errors.charges?.repair_charges
                                            )}
                                            helperText={
                                              touched.charges?.repair_charges &&
                                              errors.charges?.repair_charges
                                            }
                                            placeholder="Repair Charges"
                                            margin="none"
                                            name="charges.repair_charges"
                                            fullWidth
                                            onBlur={handleBlur}
                                            onChange={(e) => {
                                              if (
                                                /^[0-9]*$/.test(e.target.value)
                                              ) {
                                                handleChange(
                                                  "charges.repair_charges"
                                                )(e);
                                              }
                                            }}
                                            type="text"
                                            size="small"
                                            value={
                                              values.charges?.repair_charges
                                            }
                                            variant="outlined"
                                          />
                                        </Grid>
                                        <Grid item size={{xs:12,lg:4}}>
                                          <Typography variant="subtitle1">
                                            Weighment Charges
                                          </Typography>
                                          <TextField
                                            error={Boolean(
                                              touched.charges
                                                ?.weighment_charges &&
                                                errors.charges
                                                  ?.weighment_charges
                                            )}
                                            helperText={
                                              touched.charges
                                                ?.weighment_charges &&
                                              errors.charges?.weighment_charges
                                            }
                                            placeholder="Weighment Charges"
                                            margin="none"
                                            name="charges.weighment_charges"
                                            fullWidth
                                            onBlur={handleBlur}
                                            onChange={(e) => {
                                              if (
                                                /^[0-9]*$/.test(e.target.value)
                                              ) {
                                                handleChange(
                                                  "charges.weighment_charges"
                                                )(e);
                                              }
                                            }}
                                            type="text"
                                            size="small"
                                            value={
                                              values.charges?.weighment_charges
                                            }
                                            variant="outlined"
                                          />
                                        </Grid>
                                      </Grid>
                                    </CardContent>
                                  </Card>
                                </AccordionDetails>
                              </Accordion>

                              <Accordion
                                expanded={
                                  expanded === "Billing" &&
                                  (dirty || isFormTouch || values.pk) &&
                                  !errors.general_data &&
                                  !errors.transportation_data &&
                                  !errors.charges
                                }
                                onChange={handleChangeEvent("Billing")}
                                style={{
                                  marginBottom: 20,
                                  borderRadius: 5,
                                  boxShadow: 3,
                                }}
                              >
                                <AccordionSummary
                                  expandIcon={<ExpandMoreIcon />}
                                  aria-controls="panel1a-content"
                                  id="panel1a-header"
                                >
                                  <Typography>Billing</Typography>
                                </AccordionSummary>
                                <AccordionDetails
                                  style={{
                                    background: "#e5f2ff",
                                    display: "block",
                                  }}
                                >
                                  <Card>
                                    <CardContent>
                                      <Grid container spacing={2}>
                                        <Grid item size={{xs:12,lg:6}}>
                                          <Typography variant="subtitle1">
                                            Bill Party
                                            <span style={{ color: "red" }}>
                                              *
                                            </span>
                                          </Typography>
                                          <TextField
                                            error={Boolean(
                                              touched?.bill?.bill_party &&
                                                errors?.bill?.bill_party
                                            )}
                                            helperText={
                                              touched?.bill?.bill_party &&
                                              errors?.bill?.bill_party
                                            }
                                            select
                                            margin="none"
                                            autoComplete="off"
                                            name="bill.bill_party"
                                            fullWidth
                                            onBlur={handleBlur}
                                            onChange={(e) => {
                                              handleChange("bill.bill_party")(
                                                e
                                              );
                                            }}
                                            type="text"
                                            size="small"
                                            value={values?.bill?.bill_party}
                                            variant="outlined"
                                          >
                                            {masterList?.customer?.map(
                                              (option) => (
                                                <MenuItem
                                                  key={option}
                                                  value={option}
                                                >
                                                  {option}
                                                </MenuItem>
                                              )
                                            )}
                                          </TextField>
                                        </Grid>
                                        <Grid item size={{xs:12,lg:6}}>
                                          <Typography variant="subtitle1">
                                            Comapany Account Name
                                          </Typography>
                                          <TextField
                                            error={Boolean(
                                              touched?.bill?.company_acc_name &&
                                                errors?.bill?.company_acc_name
                                            )}
                                            helperText={
                                              touched?.bill?.company_acc_name &&
                                              errors?.bill?.company_acc_name
                                            }
                                            placeholder="Comapany Account Name"
                                            margin="none"
                                            name="bill.company_acc_name"
                                            fullWidth
                                            onBlur={handleBlur}
                                            onChange={(e) => {
                                              handleChange(
                                                "bill.company_acc_name"
                                              )(e);
                                            }}
                                            type="text"
                                            size="small"
                                            value={
                                              values?.bill?.company_acc_name
                                            }
                                            variant="outlined"
                                          />
                                        </Grid>
                                        <Grid item size={{xs:12,lg:12}}>
                                          <div
                                            style={{
                                              margin: "20px 0px",
                                              display: "flex",
                                              alignItems: "center",
                                            }}
                                          >
                                            <Fab
                                              onClick={(e) => {
                                                addClick(values, setFieldValue);
                                              }}
                                              color="primary"
                                              aria-label="Add"
                                              style={{
                                                height: "40px",
                                                width: "40px",
                                              }}
                                            >
                                              <Tooltip title={"Add Bill Line"}>
                                                <AddIcon />
                                              </Tooltip>
                                            </Fab>
                                            <Typography
                                              variant="subtitle1"
                                              style={{ marginLeft: "10px" }}
                                            >
                                              Add Bill Line
                                            </Typography>
                                          </div>
                                          {values?.bill?.bill_line.length > 0 &&
                                            values?.bill?.bill_line.map(
                                              (el, i) => {
                                                return (
                                                  <Grid
                                                    key={i}
                                                    container
                                                    spacing={3}
                                                    alignItems="flex-end"
                                                  >
                                                    <Grid item size={{xs:12,md:4}}>
                                                      <Typography variant="subtitle1">
                                                        Type of Charge
                                                        <span
                                                          style={{
                                                            marginLeft: "5px",
                                                            color: "red",
                                                          }}
                                                        >
                                                          *
                                                        </span>
                                                      </Typography>
                                                      <TextField
                                                        error={Boolean(
                                                          touched?.bill
                                                            ?.bill_line
                                                            ?.length > 0 &&
                                                            touched?.bill
                                                              ?.bill_line[i]
                                                              ?.type_of_charge &&
                                                            errors?.bill
                                                              ?.bill_line[i]
                                                              ?.type_of_charge
                                                        )}
                                                        helperText={
                                                          touched?.bill
                                                            ?.bill_line
                                                            ?.length > 0 &&
                                                          touched?.bill
                                                            ?.bill_line[i]
                                                            ?.type_of_charge &&
                                                          errors?.bill
                                                            ?.bill_line[i]
                                                            ?.type_of_charge
                                                        }
                                                        select
                                                        margin="none"
                                                        autoComplete="off"
                                                        name="bill.type_of_charge"
                                                        fullWidth
                                                        onBlur={handleBlur}
                                                        type="text"
                                                        size="small"
                                                        value={
                                                          el.type_of_charge
                                                        }
                                                        onChange={(e) => {
                                                          handleChange(
                                                            `bill.bill_line.${[
                                                              i,
                                                            ]}.type_of_charge`
                                                          )(e);
                                                        }}
                                                        variant="outlined"
                                                      >
                                                        {masterList?.service_tax?.map(
                                                          (option) => (
                                                            <MenuItem
                                                              key={option}
                                                              value={option}
                                                            >
                                                              {option}
                                                            </MenuItem>
                                                          )
                                                        )}
                                                      </TextField>
                                                    </Grid>

                                                    <Grid item size={{xs:12,md:3}}>
                                                      <Typography variant="subtitle1">
                                                        Bill Amount
                                                        <span
                                                          style={{
                                                            marginLeft: "5px",
                                                            color: "red",
                                                          }}
                                                        >
                                                          *
                                                        </span>
                                                      </Typography>
                                                      <TextField
                                                        error={Boolean(
                                                          touched?.bill
                                                            ?.bill_line &&
                                                            touched?.bill
                                                              ?.bill_line[i]
                                                              ?.bill_amount &&
                                                            errors?.bill
                                                              ?.bill_line[i]
                                                              ?.bill_amount
                                                        )}
                                                        helperText={
                                                          touched?.bill
                                                            ?.bill_line &&
                                                          touched?.bill
                                                            ?.bill_line[i]
                                                            ?.bill_amount &&
                                                          errors?.bill
                                                            ?.bill_line[i]
                                                            ?.bill_amount
                                                        }
                                                        fullWidth
                                                        name="bill_amount"
                                                        size="small"
                                                        placeholder="Enter Bill Amount"
                                                        InputLabelProps={{
                                                          shrink: true,
                                                          required: true,
                                                        }}
                                                        value={el?.bill_amount}
                                                        onChange={(e) => {
                                                          handleChange(
                                                            `bill.bill_line.${[
                                                              i,
                                                            ]}.bill_amount`
                                                          )(e);
                                                        }}
                                                        variant="outlined"
                                                        type="text"
                                                      />
                                                    </Grid>
                                                    <Grid item size={{xs:12,md:3}}>
                                                      <Typography variant="subtitle1">
                                                        RCM
                                                        <span
                                                          style={{
                                                            marginLeft: "5px",
                                                            color: "red",
                                                          }}
                                                        >
                                                          *
                                                        </span>
                                                      </Typography>
                                                      <TextField
                                                        error={Boolean(
                                                          touched?.bill
                                                            ?.bill_line &&
                                                            touched?.bill
                                                              ?.bill_line[i]
                                                              ?.rcm &&
                                                            errors?.bill
                                                              ?.bill_line[i]
                                                              ?.rcm
                                                        )}
                                                        helperText={
                                                          touched?.bill
                                                            ?.bill_line &&
                                                          touched?.bill
                                                            ?.bill_line[i]
                                                            ?.rcm &&
                                                          errors?.bill
                                                            ?.bill_line[i]?.rcm
                                                        }
                                                        select
                                                        margin="none"
                                                        autoComplete="off"
                                                        name="bill.rcm"
                                                        fullWidth
                                                        onBlur={handleBlur}
                                                        type="text"
                                                        size="small"
                                                        value={el?.rcm}
                                                        onChange={(e) => {
                                                          handleChange(
                                                            `bill.bill_line.${[
                                                              i,
                                                            ]}.rcm`
                                                          )(e);
                                                        }}
                                                        variant="outlined"
                                                      >
                                                        {rcmList.map(
                                                          (option) => (
                                                            <MenuItem
                                                              key={option}
                                                              value={option}
                                                            >
                                                              {option}
                                                            </MenuItem>
                                                          )
                                                        )}
                                                      </TextField>
                                                    </Grid>

                                                    <Grid item size={{xs:12,lg:2}}>
                                                      {i > 0 && (
                                                        <Fab
                                                          aria-label="Delete"
                                                          style={{
                                                            height: "40px",
                                                            width: "40px",
                                                            background:
                                                              "#bc2929",
                                                            color: "white",
                                                            marginTop: "36px",
                                                          }}
                                                          onClick={(e) => {
                                                            removeClick(
                                                              values,
                                                              setFieldValue,
                                                              i
                                                            );
                                                          }}
                                                        >
                                                          <Tooltip
                                                            title={
                                                              "Delete Option"
                                                            }
                                                          >
                                                            <DeleteIcon />
                                                          </Tooltip>
                                                        </Fab>
                                                      )}
                                                    </Grid>
                                                  </Grid>
                                                );
                                              }
                                            )}
                                        </Grid>
                                      </Grid>
                                    </CardContent>
                                  </Card>
                                </AccordionDetails>
                              </Accordion>
                            </div>
                          </Grid>
                        </Grid>
                        <Box
                          style={{ textAlign: matchesIphone ? "center" : "right", display:matchesIphone ? "block":"flex" }}
                          ml={1}
                          mt={2}
                        >
                          {!show && (
                            <p
                              style={{
                                color: "red",
                                margin: "10px 10px",
                              }}
                            >
                              {values.transaction_effected === true
                                ? "Please clear the transaction effect before updating the Booking!!!"
                                : ""}
                            </p>
                          )}
                          {show && ""}
                          {values?.pk && values.is_draft === false ? (
                            <Button
                              color="primary"
                              size="medium"
                              type="button"
                              variant="outlined"
                              id="demo-positioned-button"
                              aria-controls={
                                open ? "demo-positioned-menu" : undefined
                              }
                              aria-haspopup="true"
                              aria-expanded={open ? "true" : undefined}
                              onClick={handleClick}
                              style={{ marginRight: "10px" }}
                            >
                              Print LR
                            </Button>
                          ) : (
                            ""
                          )}
                          {values.is_draft === false && values.pk ? (
                            ""
                          ) : (
                            <Button
                              color="primary"
                              size="medium"
                              variant="outlined"
                        
                              onClick={() => {
                                saveAsDraft(values);
                              }}
                              style={{ marginRight: "10px" }}
                              disabled={isDisabled(values?.general_data)}
                            >
                              Save as a draft
                            </Button>
                          )}
                          {values.is_proceed === true ? (
                            ""
                          ) : (
                            <Button
                              color="primary"
                              disabled= {
                                values.pk ?  
                                (((isSubmitting) ||
                                (Object.keys(errors).length > 0)) && !dirty
                                  ? true
                                  : false
                                )
                                 :
                                (((isSubmitting) ||
                                (Object.keys(errors).length > 0)) || !dirty
                                  ? true
                                  : false
                                )
                              }
                              size="medium"
                              type="submit"
                              variant="outlined"
                        
                              style={{ marginRight: "10px" }}
                            >
                              Proceed
                            </Button>
                          )}
                          {values.pk && values.is_draft === false ? (
                            <Button
                              color="primary"
                              size="medium"
                              type="submit"
                              variant="outlined"
                            
                              style={{ marginRight: "10px" }}
                              // disabled={values.transaction_effected === true}
                            >
                              Update Details
                            </Button>
                          ) : (
                            ""
                          )}
                          {values.pk ? (
                            <Box style={{marginTop : matchesIphone ? "10px" : "0px"}}>
                              {values.is_proceed === true ? (
                                <Button
                                  color="secondary"
                                  size="medium"
                                  type="button"
                                  variant="outlined"
                                  style={{ marginRight: "10px" }}
                                  // disabled={values.transaction_effected === true}
                                  onClick={() => {
                                    actionType = "delete";
                                    DialogMessage =
                                      "Are you sure you want to delete this booking?";
                                    openResponseModal(values);
                                  }}
                                >
                                  Delete
                                </Button>
                              ) : (
                                ""
                              )}
                              {!show && (
                                <>
                                  {values.is_proceed === true ? (
                                    <Button
                                      color="secondary"
                                      size="medium"
                                      type="button"
                                      variant="outlined"
                                      disabled={
                                        values.transaction_effected === false
                                      }
                                      onClick={() => {
                                        handleTransactionEffect(values?.pk);
                                      }}
                                    >
                                      Cancel Effect
                                    </Button>
                                  ) : (
                                    ""
                                  )}
                                </>
                              )}
                              {show &&
                                "Cancel Transaction effect is done you can update the form!"}
                            </Box>
                          ) : (
                            ""
                          )}
                        </Box>
                      </div>
                    </form>
                  )}
                </Formik>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
        <Menu
          id="demo-positioned-menu"
          aria-labelledby="demo-positioned-button"
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
          anchorOrigin={{
            vertical: "top",
            horizontal: "left",
          }}
          transformOrigin={{
            vertical: "top",
            horizontal: "left",
          }}
        >
          <MenuItem
            onClick={(e) => {
              handleClose("CONSIGNOR COPY");
            }}
          >
            CONSIGNOR COPY
          </MenuItem>
          <MenuItem
            onClick={(e) => {
              handleClose("CONSIGNEE COPY");
            }}
          >
            CONSIGNEE COPY
          </MenuItem>
          <MenuItem
            onClick={(e) => {
              handleClose("DRIVER COPY");
            }}
          >
            DRIVER COPY
          </MenuItem>
        </Menu>
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
