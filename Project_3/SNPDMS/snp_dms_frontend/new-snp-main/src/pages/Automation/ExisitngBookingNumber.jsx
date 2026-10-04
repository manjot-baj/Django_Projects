import React, { useState, useEffect } from "react";
import {

  Typography,
  Paper,
  TextField,
  Grid,
  Button
} from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import CustomTextfield from "@components/reusablecomponents/GateInTextField";
import {
  existingAutomationBookingNumber,
} from "../../actions/AutomationActions";
import { useSnackbar } from "notistack";
import { customLabelTypography } from "../../utils/CustomClasses";



const ExisitngBookingNumber = (props) => {

  const store = useSelector((state) => state);
  const dispatch = useDispatch();
  const [containers, setContainers] = useState();
  const [bookingNumber, setBookingNumber] = useState("");
  const notify = useSnackbar().enqueueSnackbar;

  useEffect(() => {
    if (store.AutomationAllotment.container_list.length > 0)
      setContainers(store.AutomationAllotment.container_list);
  }, [store.AutomationAllotment.container_list]);

  return (
      <Paper elevation={0} style={{width:"100%"}}>
        <Grid container xs={10} style={{padding:'0px 0px 0px 30px'}}>
          <Grid item size={{xs:6}}  >
            <Typography variant="subtitle1" sx={customLabelTypography}>
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
          <Grid item size={{xs:6}} >
            <Typography variant="subtitle1" sx={customLabelTypography}>
              Booking Number <span style={{ color: "red" }}>*</span>
            </Typography>

            <CustomTextfield
              id="allotment-booking-number"
              value={bookingNumber}
              handleChange={(e) => setBookingNumber(e.target.value)}
              dispatchType={"SET_AUTOMATION_BOOKING_NUMBER"}
            />
          </Grid>
        </Grid>

        <div
          style={{
            margin: "24px auto",
            width: "350px",
            // display: "flex",
            justifyContent: "space-between",
            paddingTop: "5%",
          }}
        >
          <Button
             variant="contained"
            color="primary"
            sx={{ width: 240, borderRadius: 2 }}
            style={{ marginRight: 16 }}
            onClick={() => {
              if(containers === ""){
                notify("Please Enter Container Number", {
                  variant: "warning",
                });
                setContainers(store?.AutomationAllotment?.container)
              }else if (bookingNumber === "") {
                notify("Please Enter Booking Number", {
                  variant: "warning",
                });
                setBookingNumber(store?.AutomationAllotment?.booking_no);
              }else{
                let splitArray = containers.replace(/\s/g, "").split(",", 20);
                let data = {
                  booking_no: bookingNumber,
                  container_list:splitArray,
                  location: localStorage.getItem("location")
                    ? localStorage.getItem("location")
                    : null,
                  site: localStorage.getItem("site")
                    ? localStorage.getItem("site")
                    : null,
                };
                dispatch(existingAutomationBookingNumber(data, notify));
              }
            }}
          >
           Save
          </Button>
        </div>
      </Paper>
  );
};

export default ExisitngBookingNumber;
