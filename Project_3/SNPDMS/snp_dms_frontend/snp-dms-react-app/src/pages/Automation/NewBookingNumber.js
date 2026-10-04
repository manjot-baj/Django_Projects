import React, { useState, useEffect } from "react";
import {
  makeStyles,
  Typography,
  Paper,
  TextField,
  Grid,
  Button,
} from "@material-ui/core";
import { useDispatch, useSelector } from "react-redux";
import CustomTextfield from "../../components/reusableComponents/GateInTextField";
import DatePickerField from "../../components/reusableComponents/DatePickerField";
import { newAutomationBookingNumber } from "../../actions/AutomationActions";
import { useSnackbar } from "notistack";

const useStyles = makeStyles((theme) => ({
  LabelTypography: {
    fontSize: 14,
    fontWeight: 600,
    color: "#243545",
    paddingBottom: 4,
  },
  searchButton: {
    backgroundColor: "#2A5FA5",
    color: "#fff",
    borderRadius: "0.5rem",
    padding: "1px 4px",
    height: 40,
    width: "100%",

    "&:hover": {
      backgroundColor: "#2A5FA5",
      color: "#fff",
    },
  },
}));

const NewBookingNumber = (props) => {
  const classes = useStyles();
  const store = useSelector((state) => state);
  const dispatch = useDispatch();
  const [containers, setContainers] = useState();
  const [bookingNumber, setBookingNumber] = useState("");
  const [bookingdate, setBookingdate] = useState("");
  const [bookingParty, setBookingParty] = useState("");
  const [allotQuantity, setAllotQuantity] = useState("");
  const [validityDate, setValidityDate] = useState("");
  const [remarks, setRemarks] = useState("");
  const notify = useSnackbar().enqueueSnackbar;

  useEffect(() => {
    if (store.AutomationAllotment.container_list.length > 0)
      setContainers(store.AutomationAllotment.container_list);
  }, [store.AutomationAllotment.container_list]);
  
  useEffect(() => {
    setBookingNumber(store?.AutomationAllotment?.booking_no);
    setBookingdate(store?.AutomationAllotment?.booking_date);
    setBookingParty(store?.AutomationAllotment?.booking_party);
    setAllotQuantity(store?.AutomationAllotment?.quantity);
    setValidityDate(store?.AutomationAllotment?.validity_date);
    setRemarks(store?.AutomationAllotment?.remarks);
   
// eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store?.AutomationAllotment]);



  return (
    <div>
      <Paper className={classes.blueBGContainer} elevation={0}>
        <Grid container spacing={6} style={{ marginTop: 16 }}>
          <Grid item xs={11} sm={6} md={3} >
            <Typography variant="subtitle1" className={classes.LabelTypography}>
              Container Number <span style={{ color: "red" }}>*</span>
            </Typography>
            <TextField
              id="allotment-container-number"
              multiline
              defaultValue={containers}
              variant="outlined"
              rows={5}
              onChange={(e) => {
                setContainers(e.target.value);
              }}
              dispatchType={"ADD_AUTOMATION_BOOKING_CONTAINERS"}
            />
          </Grid>
          <Grid item xs={9}>
            <Grid container spacing={2}>
              <Grid item xs={11} sm={6} md={3}>
                <Typography
                  variant="subtitle1"
                  className={classes.LabelTypography}
                >
                  Booking Number <span style={{ color: "red" }}>*</span>
                </Typography>

                <CustomTextfield
                  id="allotment-booking-number"
                  value={bookingNumber}
                  handleChange={(e) => setBookingNumber(e.target.value)}
                  dispatchType={"SET_AUTOMATION_BOOKING_NUMBER"}
                />
              </Grid>
              <Grid item xs={11} sm={6} md={3}>
                <Typography
                  variant="subtitle1"
                  className={classes.LabelTypography}
                >
                  Booking Date <span style={{ color: "red" }}>*</span>
                </Typography>

                <DatePickerField
                  dateId="allotment-booking-date"
                  dateValue={bookingdate}
                  dateChange={(date) => setBookingdate(date)}
                  dispatchType={"SET_AUTOMATION_BOOKING_DATE"}
                />
              </Grid>
              <Grid item xs={11} sm={6} md={3}>
                <Typography
                  variant="subtitle1"
                  className={classes.LabelTypography}
                >
                  Booking Party <span style={{ color: "red" }}>*</span>
                </Typography>

                <CustomTextfield
                  id="allotment-booking-party"
                  value={bookingParty}
                  handleChange={(e) => setBookingParty(e.target.value)}
                  dispatchType={"SET_AUTOMATION_BOOKING_PARTY"}
                />
              </Grid>
              <Grid item xs={11} sm={6} md={3}>
                <Typography
                  variant="subtitle1"
                  className={classes.LabelTypography}
                >
                  Allot Quantity <span style={{ color: "red" }}>*</span>
                </Typography>

                <CustomTextfield
                  id="allotment-allot-qty"
                  value={allotQuantity}
                  handleChange={(e) => setAllotQuantity(e.target.value)}
                  dispatchType={"SET_AUTOMATION_QUANTITY"}
                  type="number"
                />
              </Grid>

              <Grid item xs={11} sm={6} md={3}>
                <Typography
                  variant="subtitle1"
                  className={classes.LabelTypography}
                >
                  Validity Date 
                </Typography>
                <DatePickerField
                  dateId="allotment-validity-date"
                  dateValue={validityDate}
                  dateChange={(date) => setValidityDate(date)}
                  dispatchType={"SET_AUTOMATION_VALIDITY_DATE"}
                />
              </Grid>

              <Grid item xs={11} sm={6} md={3}>
                <Typography
                  variant="subtitle1"
                  className={classes.LabelTypography}
                >
                  Remarks
                </Typography>

                <CustomTextfield
                  id="allotment-remarks"
                  value={remarks}
                  handleChange={(e) => setRemarks(e.target.value)}
                  dispatchType={"SET_AUTOMATION_REMARKS"}
                />
              </Grid>
            </Grid>
          </Grid>
        </Grid>

        <div
          style={{
            margin: "24px auto",
            width: "350px",
            display: "flex",
            justifyContent: "space-between",
            paddingTop: "5%",
          }}
        >
          <Button
            className={classes.searchButton}
            style={{ marginRight: 16 }}
            onClick={() => {
              if(containers === ""){
                notify("Please Enter Container Number", {
                  variant: "warning",
                });
                setContainers(store?.AutomationAllotment?.container_list)
              }else if (bookingNumber === "") {
                notify("Please Enter Booking Number", {
                  variant: "warning",
                });
                setBookingNumber(store?.AutomationAllotment?.booking_no);
              }else if(bookingdate === "") {
                notify("Please Enter Booking Date", {
                  variant: "warning",
                });
                setBookingdate(store?.AutomationAllotment?.booking_date);
              }else if(bookingParty === "") {
                notify("Please Enter Booking Party", {
                  variant: "warning",
                });
                setValidityDate(store?.AutomationAllotment?.validity_date);
              }else if(allotQuantity === "") {
                notify("Please Enter Allot Quantity", {
                  variant: "warning",
                });
                setAllotQuantity(store?.AutomationAllotment?.allotQuantity);
              }else {
                let splitArray = containers.replace(/\s/g, "").split(",", 20);
                let data = {
                  booking_date: bookingdate,
                  validity_date: validityDate,
                  booking_no: bookingNumber,
                  booking_party: bookingParty,
                  quantity: allotQuantity,
                  container_list: splitArray,
                  remarks: remarks,
                  location: localStorage.getItem("location")
                    ? localStorage.getItem("location")
                    : null,
                  site: localStorage.getItem("site")
                    ? localStorage.getItem("site")
                    : null,
                };
                dispatch(newAutomationBookingNumber(data, notify));
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

export default NewBookingNumber;
