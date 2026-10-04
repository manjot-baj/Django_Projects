import React, { useState, useEffect } from "react";
import {

  Typography,
  Paper,
  TextField,
  Grid,
  Button,
  MenuItem,
  useMediaQuery,
  Autocomplete,
  Box
} from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import DatePickerField from "@components/reusablecomponents/DatePickerField";
import { automationContainerDetails } from "../../actions/AutomationActions";
import { useSnackbar } from "notistack";

import CustomTextfield from "@components/reusablecomponents/GateInTextField";
import { customLabelTypography } from "../../utils/CustomClasses";



const AutomationOperation = (props) => {

  const store = useSelector((state) => state);
  const dispatch = useDispatch();
  const [containers, setContainers] = useState("");
  const [method, setMethod] = useState("");
  const [movement, setMovement] = useState("");
  const [date, setDate] = useState("")
  const notify = useSnackbar().enqueueSnackbar;
    const matchesIphone = useMediaQuery("(max-width:500px)");

  const methodName = [
    "Corrupted Container",
    "Regular Container"
  ]

  useEffect(() => {
    setContainers(store?.AutomationAllotment?.container_no);
    setMethod(store?.AutomationAllotment?.method);
    setMovement(store?.AutomationAllotment?.movement);
    setDate(store?.AutomationAllotment?.date);
  
// eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store?.AutomationAllotment]);

  return (
    <Box sx={{
      paddingBottom:12,
      paddingX:1
    }}>
      <Paper  >
        <Grid container spacing={6} style={{ marginTop: '30px', padding:matchesIphone?"12px" :"30px 30px" }}>
          <Grid item size={{xs:12,sm:6,md:3}} >
            <Typography variant="subtitle1" sx={customLabelTypography}>
              Container Number <span style={{ color: "red" }}>*</span>
            </Typography>
            <CustomTextfield
              id="allotment-container-number"
              value={containers}
              variant="outlined"
              handleChange={(e) => {
                setContainers(e.target.value);
              }}
              dispatchType={"SET_AUTOMATION_CONTAINER"}
            />
          </Grid>
          <Grid item size={{xs:12}}>
            <Grid container spacing={2}>
              <Grid item size={{xs:12,sm:6,md:4}} >
                <Typography
                  variant="subtitle1"
                  sx={customLabelTypography}
                >
                  Method <span style={{ color: "red" }}>*</span>
                </Typography>

                <Autocomplete
                value={method}
                onChange={(event, newValue) => {
                  setMethod(newValue);
                }}
                style={{ padding: 0 }}
                sx={{
                  "& .MuiAutocomplete-inputRoot[class*='MuiOutlinedInput-root']": {
                    padding: 0,
                  },
                }}
                options={methodName.map((option) => option)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    variant="outlined"
                    
                    onBlur={(e) => {
                      setMethod(e.target.value);
                      dispatch({
                        type: "SET_AUTOMATION_METHOD",
                        payload: e.target.value,
                      });
                    }}
                    fullWidth
                  />
                )}
              />
              </Grid>
              <Grid item size={{xs:12,sm:6,md:4}}>
                <Typography
                  variant="subtitle1"
                  sx={customLabelTypography}
                >
                 Movement <span style={{ color: "red" }}>*</span>
                </Typography>

                <TextField
                    id="moment-type"
                    select
                    value={movement}
                    variant="outlined"
                    fullWidth
                   size="small"
                    onChange={(e) => {
                      setMovement(e.target.value);
                      dispatch({
                        type: "SET_AUTOMATION_MOVEMENT",
                        payload: e.target.value,
                      });
                    }}
                  >
                    <MenuItem key={"IN"} value={"IN"}>
                      IN
                    </MenuItem>
                    <MenuItem key={"OUT"} value={"OUT"}>
                      OUT
                    </MenuItem>
                  </TextField>
              </Grid>
            

              <Grid item size={{xs:12,sm:6,md:4}}  >
                <Typography
                  variant="subtitle1"
                  sx={customLabelTypography}
                >
                Date <span style={{ color: "red" }}>*</span>
                </Typography>
                <DatePickerField
                  fullWidth={true}
                  dateId="allotment-validity-date"
                  dateValue={date}
                  dateChange={(date) => setDate(date)}
                  dispatchType={"SET_AUTOMATION_DATE"}
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
            padding: "5%",
          }}
        >
          <Button
              variant="contained"
            color="error"
            sx={{ width: 240, borderRadius: 2 }}
            style={{ marginRight: 16 }}
            onClick={() => {
              if(containers === ""){
                notify("Please Enter Container Number", {
                  variant: "warning",
                });
                setContainers(store?.AutomationAllotment?.containers)
              }else if (method === "") {
                notify("Please Enter Method", {
                  variant: "warning",
                });
                setMethod(store?.AutomationAllotment?.method);
              }else if(movement === "") {
                notify("Please Enter Movement", {
                  variant: "warning",
                });
              setMovement(store?.AutomationAllotment?.movement);
              }else if(date === "") {
                notify("Please Enter Date", {
                  variant: "warning",
                });
                setDate(store?.AutomationAllotment?.date);
              }else {
                let data = {
                  method: method,
                  movement: movement,
                  container_no: containers,
                  date: date,
                  location: localStorage.getItem("location")
                    ? localStorage.getItem("location")
                    : null,
                  site: localStorage.getItem("site")
                    ? localStorage.getItem("site")
                    : null,
                };
                dispatch(automationContainerDetails(data, notify));
              }
            }}
          >
            Delete
          </Button>
        </div>
      </Paper>
    </Box>
  );
};

export default AutomationOperation;
