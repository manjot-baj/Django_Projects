import React, { useState, useEffect } from "react";
import {
  Typography,
  Paper,
  Grid,
  Button,
  Box,
} from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import CustomTextfield from "@components/reusablecomponents/GateInTextField";
import DatePickerField from "@components/reusablecomponents/DatePickerField";

import {
  allotStocksDispatch,
  allotStocksUpdateDispatch,
  bookingNumberFetchDispatch,
  bookingNumberSearchDispatch,
  editStocksBookingDetailsDispatch,
} from "../actions/StocksAndAllotmentActions";
import { useHistory } from "react-router-dom";
import StocksAndAllotmentBookingSearch from "./StocksAndAllotmentBookingSearch";
import { useSnackbar } from "notistack";
import { Alert } from "@mui/material";
import { customLabelTypography } from "../utils/CustomClasses";



const StockAllotmentSection = (props) => {
  const history = useHistory();
  const store = useSelector((state) => state);
  const dispatch = useDispatch();
  const [isEdit, setEditButton] = useState(true);
  const [enableEdit, setEnableEdit] = useState(false);
  // eslint-disable-next-line no-unused-vars
  const [updatePk, setUpdatePk] = useState("");
  
  const [balance, setBalance] = useState("");
  const [disableSave,setDisableSave]= useState(false)
  const [containers, setContainers] = useState([]);
  const [bookingNumber, setBookingNumber] = useState("");
  const [bookingdate, setBookingdate] = useState("");
  const [bookingParty, setBookingParty] = useState("");
  const [allotQuantity, setAllotQuantity] = useState("");
  const [validityDate, setValidityDate] = useState("");
  const [remarks, setRemarks] = useState("");
  const [tempContainer, setTempContainer] = useState([]);
  const [isEditAllot, setIsEditAllot] = useState(false);
  const [pk, setPk] = useState("");
  const notify = useSnackbar().enqueueSnackbar;

  useEffect(() => {
    return () => {
      dispatch({ type: "CLEANUP_STOCKS_ALLOTMENT_BOOKING_DETAILS" });
      dispatch({ type: "RESET_SEARCHED_CHEQUE" });
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (store.stocksAndAllotment?.checkedRow?.length > 0) {
      if (!store.stocksAndAllotment?.checkedRow[0].booking_no) {
        setTempContainer(
          store.stocksAndAllotment?.checkedRow.map((item) => item.container_no)
        );
      } else {
        setContainers(
          store.stocksAndAllotment?.checkedRow.map((item) => item.container_no)
        );
      }

      setBookingNumber(store.stocksAndAllotment?.checkedRow[0].booking_no);
      setBookingdate(
        store.stocksAndAllotment?.checkedRow[0].allotment_date
          ?.split("/")
          ?.reverse()
          ?.join("-")
      );
      if (store.stocksAndAllotment?.checkedRow[0].booking_no) {
        dispatch(
          bookingNumberFetchDispatch(
            { booking_no: store.stocksAndAllotment?.checkedRow[0].booking_no },
            notify,
            setBookingParty,
            setAllotQuantity,
            setValidityDate,
            setRemarks,
            setContainers,
            setBalance,
            setPk
          )
        );
        setIsEditAllot(true);
      }
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store.stocksAndAllotment?.checkedRow]);

  useEffect(() => {
    if (store.search.stocksAndAllotmentBookingSelectedNumber) {
      setUpdatePk(store.search.stocksAndAllotmentBookingSelectedNumber.pk);
      setPk(store.search.stocksAndAllotmentBookingSelectedNumber.pk);
      setContainers(
        store.search.stocksAndAllotmentBookingSelectedNumber.container_list
      );

      setBookingNumber(
        store.search.stocksAndAllotmentBookingSelectedNumber.booking_no
      );
      setBookingdate(
        store.search.stocksAndAllotmentBookingSelectedNumber.booking_date
      );
      setBookingParty(
        store.search.stocksAndAllotmentBookingSelectedNumber.booking_party
      );
      setAllotQuantity(
        store.search.stocksAndAllotmentBookingSelectedNumber.quantity
      );
      setValidityDate(
        store.search.stocksAndAllotmentBookingSelectedNumber.validity_date
      );
      setRemarks(store.search.stocksAndAllotmentBookingSelectedNumber.remarks);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store.search.stocksAndAllotmentBookingSelectedNumber]);

  useEffect(() => {
    if (store.ui.stocksSelectedbookingNumber) {
      dispatch(
        bookingNumberSearchDispatch(
          {
            booking_no: store.ui.stocksSelectedbookingNumber,
          },
          store.ui.stocksSelectedbookingNumber
        )
      );
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store.ui.stocksSelectedbookingNumber]);

  const handlePickerDateChange = (date) => {
    var selectedDate = new Date(date);
    var dd = String(selectedDate.getDate()).padStart(2, "0");
    var mm = String(selectedDate.getMonth() + 1).padStart(2, "0"); //
    var yyyy = selectedDate.getFullYear();
    var selectedDateFormat = yyyy + "-" + mm + "-" + dd;
    setBookingdate(selectedDateFormat);
  };

  const handlePickerDateValidityChange = (date) => {
    var selectedDate = new Date(date);
    var dd = String(selectedDate.getDate()).padStart(2, "0");
    var mm = String(selectedDate.getMonth() + 1).padStart(2, "0"); //
    var yyyy = selectedDate.getFullYear();
    var selectedDateFormat = yyyy + "-" + mm + "-" + dd;
    setValidityDate(selectedDateFormat);
  };

  return (
    <div>
      <Typography
        variant="h5"
        style={{ paddingTop: 14, paddingBottom: 14, textAlign: "center" }}
      >
        Allotment
      </Typography>
      <Paper
        sx={(theme) => ({
          backgroundColor: "#EAF0F5",
          borderRadius: 2,
          padding: theme.spacing(4,2),
          margin: theme.spacing(0.5, 1),
        })}
        elevation={0}
      >
        <div style={{ display: "flex", justifyContent: "space-between" ,width:"100%"}}>
          <StocksAndAllotmentBookingSearch
            paymentSearchResult={
              store.search.stocksAndAllotmentBookingSearchResult
            }
            getSearchResultType="GET_STOCKS_ALLOTMENT_BOOKING_NUMBER"
            setSelectedPaymentType="SET_SELECTED_BOOKING_NUMBER"
            updatePaymentType="UPDATE_ALLOTMENT_BOOKING_DETAILS"
            searchAction={bookingNumberSearchDispatch}
            setEdit={setEditButton}
            setBookingNumber={setBookingNumber}
          />
        </div>
        {isEdit && !isEditAllot && (
          <Alert severity="info" style={{ backgroundColor: "transparent" }}>
            First Search Booking number to add Container or create new Booking
            number
          </Alert>
        )}
        <Grid container spacing={6} style={{ marginTop: 16 }}>
          <Grid item size={{xs:11,sm:6,md:3}} >
            <Typography variant="subtitle1" sx={customLabelTypography}>
              Container Number
            </Typography>

            <Box
              sx={{
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "flex-start",
                flexDirection: "column",
                padding: "4px",
                width: "200px",
                height: "200px",
                overflowY: "scroll",
                "&::-webkit-scrollbar": {
                  display: "none",
                },
                border: "1px solid gray",
                borderRadius: "8px",
              }}
            >
              {containers.map((cont, index) => (
                <Typography variant="button" key={index}>
                  {cont}
                </Typography>
              ))}
              {tempContainer.map((cont, index) => (
                <Typography
                  variant="button"
                  style={{ color: "#13bf13" }}
                  key={index}
                >
                  {cont}
                </Typography>
              ))}
            </Box>
          </Grid>
          <Grid item size={{xs:9}}>
            <Grid container spacing={2}>
              <Grid item size={{xs:11,sm:6,md:3}} >
                <Typography variant="subtitle1" sx={customLabelTypography}>
                  Booking Number <span style={{ color: "red" }}>*</span>
                </Typography>

                <CustomTextfield
                  id="allotment-booking-number"
                  value={bookingNumber}
                  handleChange={(e) =>
                    setBookingNumber(e.target.value.toUpperCase())
                  }
                  dispatchType={"SET_ALLOTMENT_BOOKING_NUMBER"}
                  readOnlyP={isEdit ? true : false}
                />
              </Grid>
              <Grid item size={{xs:11,sm:6,md:3}} >
                <Typography variant="subtitle1" sx={customLabelTypography}>
                  Booking Date
                </Typography>

                {isEdit ? (
                  <CustomTextfield
                    id="allotment-booking-party"
                    value={bookingdate}
                    readOnlyP={isEdit ? true : false}
                  />
                ) : (
                  <DatePickerField
                    dateId="allotment-booking-date"
                    dateValue={bookingdate}
                    dateChange={(date) => handlePickerDateChange(date)}
                    dispatchType={"SET_ALLOTMENT_BOOKING_DATE"}
                  />
                )}
              </Grid>
              <Grid item size={{xs:11,sm:6,md:3}} >
                <Typography variant="subtitle1" sx={customLabelTypography}>
                  Booking Party
                </Typography>

                <CustomTextfield
                  id="allotment-booking-party"
                  value={bookingParty}
                  handleChange={(e) => setBookingParty(e.target.value)}
                  dispatchType={"SET_ALLOTMENT_BOOKING_PARTY"}
                  readOnlyP={isEdit ? true : false}
                />
              </Grid>
              <Grid item size={{xs:11,sm:6,md:3}} >
                <Typography variant="subtitle1" sx={customLabelTypography}>
                  Allot Quantity
                </Typography>

                {isEdit && !isEditAllot ? (
                  <CustomTextfield
                    id="allotment-allot-qty"
                    value={allotQuantity}
                    readOnlyP={isEdit ? true : false}
                  />
                ) : (
                  <CustomTextfield
                    id="allotment-allot-qty"
                    value={allotQuantity}
                    handleChange={(e) => setAllotQuantity(e.target.value)}
                    dispatchType={"SET_ALLOTMENT_QUANTITY"}
                    readOnlyP={
                      store.stocksAndAllotmentSearch.status === "Alloted" &&
                      store.stocksAndAllotmentSearch.out_history === "True" &&
                      isEdit === true &&
                      store.stocksAndAllotmentSearch.status === "Available" &&
                      store.stocksAndAllotmentSearch.out_history === "False" &&
                      isEdit === false
                    }
                  />
                )}
              </Grid>
              {balance && (
                <Grid item size={{xs:11,sm:6,md:3}} >
                  <Typography variant="subtitle1" sx={customLabelTypography}>
                    Balance Quantity
                  </Typography>

                  <CustomTextfield
                    id="balance-allot-qty"
                    value={balance}
                    readOnlyP={true}
                  />
                </Grid>
              )}
              {store.search.stocksAndAllotmentBookingSelectedNumber &&
                store.search.stocksAndAllotmentBookingSelectedNumber
                  .remaining && (
                  <Grid item size={{xs:11,sm:6,md:3}} >
                    <Typography variant="subtitle1" sx={customLabelTypography}>
                      Balance Quantity
                    </Typography>

                    <CustomTextfield
                      id="balance-allot-qty"
                      value={
                        store.search.stocksAndAllotmentBookingSelectedNumber
                          .remaining
                      }
                      readOnlyP={isEdit ? true : false}
                    />
                  </Grid>
                )}

              <Grid item size={{xs:11,sm:6,md:3}} >
                <Typography variant="subtitle1" sx={customLabelTypography}>
                  Validity Date
                </Typography>

                {isEdit ? (
                  <CustomTextfield
                    id="allotment-validity-date"
                    value={validityDate}
                    readOnlyP={isEdit ? true : false}
                  />
                ) : (
                  <DatePickerField
                    dateId="allotment-validity-date"
                    dateValue={validityDate}
                    dateChange={(date) => handlePickerDateValidityChange(date)}
                    dispatchType={"SET_ALLOTMENT_VALIDITY_DATE"}
                  />
                )}
              </Grid>

              <Grid item size={{xs:11,sm:6,md:3}} >
                <Typography variant="subtitle1" sx={customLabelTypography}>
                  Remarks
                </Typography>

                <CustomTextfield
                  id="allotment-remarks"
                  value={remarks}
                  handleChange={(e) => setRemarks(e.target.value)}
                  dispatchType={"SET_ALLOTMENT_REMARKS"}
                  readOnlyP={isEdit ? true : false}
                />
              </Grid>
            </Grid>
          </Grid>
        </Grid>

        <div
          style={{
            margin: "24px auto",
            width: "50%",
            display: "flex",
            justifyContent: "space-between",
       
          }}
        >
          <Button
            fullWidth
            variant="contained"
            color="warning"
            style={{ marginRight: 16 }}
            disabled={disableSave}
            onClick={() => {
              if (enableEdit) {
                let data;
                data = {
                  booking_date: bookingdate,
                  validity_date: validityDate,
                  booking_no: bookingNumber,
                  booking_party: bookingParty,
                  quantity: allotQuantity,
                  container_list: containers,
                  extractStockData: [],
                  remarks: remarks,
                  location: localStorage.getItem("location")
                    ? localStorage.getItem("location")
                    : null,
                  site: localStorage.getItem("site")
                    ? localStorage.getItem("site")
                    : null,
                };
                dispatch(
                  editStocksBookingDetailsDispatch(
                    store.stocksAllotment.pk,
                    data,
                    notify,
                    history,
                    setDisableSave
                  )
                );
              } else {
                let data;
                data = {
                  booking_date: bookingdate,
                  validity_date: validityDate,
                  booking_no: bookingNumber,
                  booking_party: bookingParty,
                  quantity: allotQuantity,
                  container_list: containers,
                  extractStockData: [],
                  remarks: remarks,
                  location: localStorage.getItem("location")
                    ? localStorage.getItem("location")
                    : null,
                  site: localStorage.getItem("site")
                    ? localStorage.getItem("site")
                    : null,
                };
                if (isEditAllot && pk) {
                  dispatch(
                    allotStocksUpdateDispatch(pk, data, notify, history,setDisableSave)
                  );
                } else {
                  if (tempContainer.length > 0) {
                    data.container_list = [...containers, ...tempContainer];
                  }
                  dispatch(allotStocksDispatch(data, notify, history,setDisableSave));
                }
              }
            }}
          >
            Save
          </Button>
        </div>
      </Paper>
    </div>
  );
};

export default StockAllotmentSection;
