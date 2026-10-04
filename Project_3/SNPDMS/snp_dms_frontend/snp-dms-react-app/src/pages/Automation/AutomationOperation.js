import React, { useState, useEffect } from "react";
import {
  makeStyles,
  Typography,
  Paper,
  TextField,
  Grid,
  Button,
  MenuItem,
  useMediaQuery
} from "@material-ui/core";
import { useDispatch, useSelector } from "react-redux";
import DatePickerField from "../../components/reusableComponents/DatePickerField";
import { automationContainerDetails } from "../../actions/AutomationActions";
import { useSnackbar } from "notistack";
import Autocomplete from "@material-ui/lab/Autocomplete";
import CustomTextfield from "../../components/reusableComponents/GateInTextField";

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
  autocomplete: {
   
    "& .MuiAutocomplete-inputRoot[class*='MuiOutlinedInput-root']": {
      padding: 0,
    },
  },
  input: {
    padding: 7,
  },
}));

const AutomationOperation = (props) => {
  const classes = useStyles();
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
    <div>
      <Paper className={classes.blueBGContainer} elevation={0}>
        <Grid container spacing={6} style={{ marginTop: '30px', padding:matchesIphone?"12px" :"30px 30px" }}>
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="subtitle1" className={classes.LabelTypography}>
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
          <Grid item xs={12}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={4}>
                <Typography
                  variant="subtitle1"
                  className={classes.LabelTypography}
                >
                  Method <span style={{ color: "red" }}>*</span>
                </Typography>

                <Autocomplete
                value={method}
                onChange={(event, newValue) => {
                  setMethod(newValue);
                }}
                style={{ padding: 0 }}
                className={classes.autocomplete}
                options={methodName.map((option) => option)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    variant="outlined"
                    className={classes.textField}
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
              <Grid item xs={12} sm={6} md={4}>
                <Typography
                  variant="subtitle1"
                  className={classes.LabelTypography}
                >
                 Movement <span style={{ color: "red" }}>*</span>
                </Typography>

                <TextField
                    id="moment-type"
                    select
                    value={movement}
                    variant="outlined"
                    fullWidth
                    inputProps={{ className: classes.input }}
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
            

              <Grid item xs={12} sm={6} md={4}>
                <Typography
                  variant="subtitle1"
                  className={classes.LabelTypography}
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
            className={classes.searchButton}
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
    </div>
  );
};

export default AutomationOperation;
