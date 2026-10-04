import React, { useState } from "react";
import {
  makeStyles,
  Typography,
  Paper,
  TextField,
  MenuItem,
  Grid,
  Button,
} from "@material-ui/core";
import { useDispatch, useSelector } from "react-redux";
import { searchStocksDispatch } from "../actions/StocksAndAllotmentActions";
import CustomTextfield from "./reusableComponents/GateInTextField";
import DatePickerField from "./reusableComponents/DatePickerField";
import Autocomplete from "@material-ui/lab/Autocomplete";

const useStyles = makeStyles((theme) => ({
  paperContainer: {
    padding: theme.spacing(2, 3),
  },
  input: {
    padding: 7,
    borderColor: "black",
    
  },
  selectTextField: {
    "& .MuiOutlinedInput-root": {
      "& fieldset": {
        borderColor: "#243545",
      },
    },
    "& .MuiPaper-rounded":{
      "& ul":{
        position:'relative',
        top:'300px',
      }
      
    }
  },
 

  LabelTypography: {
    fontSize: 14,
    fontWeight: 600,
    color: "#243545",
    paddingBottom: 4,
  },
  searchButton: {
    backgroundColor: "#FDBD2E",
    color: "#fff",
    borderRadius: "0.5rem",
    padding: "1px 4px",
    height: 40,
    fontSize: 12.5,
    marginLeft: "auto",
    marginRight: "auto",
    width: "35%",
    border: "1.5px solid #2A5FA5",
    boxShadow: "0px 3px 6px #9199A14D",
    "&:hover": {
      backgroundColor: "#FDBD2E",
      color: "#fff",
    },
  },
  searchButtonwrapper: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    marginTop: "40px",
    marginLeft: "280px",
  },
  autocomplete: {
    "& .MuiAutocomplete-inputRoot[class*='MuiOutlinedInput-root']": {
      padding: 0,
    },
  },
  searchButton2: {
    backgroundColor: "#2A5FA5",
    color: "#fff",
    borderRadius: "0.5rem",
    padding: "1px 4px",
    height: 40,
    fontSize: 12.5,
    marginLeft: "auto",
    marginRight: "auto",
    width: "35%",
    border: "1.5px solid #FDBD2E",
    boxShadow: "0px 3px 6px #9199A14D",
    "&:hover": {
      backgroundColor: "#2A5FA5",
      color: "#fff",
    },
  },
}));

const StocksAndAllotmentSearchModal = (props) => {
  const classes = useStyles();

  const dispatch = useDispatch();
  const store = useSelector((state) => state);

  const { gateIn, stocksAndAllotmentSearch } = store;
  const [containerNumber, setContainerNumber] = useState("");
  const [clientName, setClientName] = useState("");
  const [fromGateInDate, setFromGateInDate] = useState("");
  const [toGateInDate, setToGateInDate] = useState("");
  const [fromGateOutDate, setFromGateOutDate] = useState("");
  const [toGateOutDate, setToGateOutDate] = useState("");
  const [bookingNumber, setBookingNumber] = useState("");
  const [fromAvailableDate, setFromAvailableDate] = useState("");
  const [toAvailableDate, setToAvailableDate] = useState("");
  const [status, setStatus] = useState("");
  const [refCode, setRefCode] = useState("");
  const [fromAllotmentDate, setFromAllotmentDate] = useState("");
  const [toAllotmentDate, setToAllotmentDate] = useState("");
  const mapped =
    gateIn.allDropDown &&
    gateIn.allDropDown.client_data &&
    gateIn.allDropDown.client_data.map((obj) => obj.name);

  const filtered = mapped && mapped.filter((type, index) => mapped.indexOf(type) === index);

  return (
    <div>
      <Typography
        variant="subtitle2"
        style={{ paddingTop: 14, paddingBottom: 14 }}
      >
        Search
      </Typography>
      <Paper className={classes.paperContainer} elevation={0}>
        <Grid container spacing={3}>
          <Grid item xs={6} md={4} lg={2}>
            <Typography variant="subtitle1" className={classes.LabelTypography}>
              Container Number
            </Typography>

            <CustomTextfield
              id="stocks-allot-container-number"
              value={containerNumber}
              handleChange={(e) => setContainerNumber(e.target.value)}
              dispatchType={"SET_STOCK_ALLOT_SEARCH_CONTAINER_NUMBER"}
            />
          </Grid>

          {gateIn.allDropDown && filtered && (
            <Grid item xs={6} md={4} lg={2}>
              <Typography
                variant="subtitle1"
                className={classes.LabelTypography}
              >
                Client Name
              </Typography>

              <Autocomplete
                value={clientName}
                onChange={(event, newValue) => {
                  setClientName(newValue);
                }}
                style={{ padding: 0 }}
                className={classes.autocomplete}
                options={filtered.map((option) => option)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    variant="outlined"
                    className={classes.textField}
                    onBlur={(e) => {
                      setClientName(e.target.value);
                      dispatch({ type: "SET_STOCK_ALLOT_SEARCH_CLIENT_NAME", payload: e.target.value });
                    }}
                    fullWidth
                  />
                )}
              />
            </Grid>
          )}

          <Grid item xs={9} md={4} lg={2}>
            <Typography variant="subtitle1" className={classes.LabelTypography}>
              From gate in date
            </Typography>

            <DatePickerField
              dateId="stocks-allot-from-getin-date"
              dateValue={fromGateInDate}
              dateChange={(date) => setFromGateInDate(date)}
              dispatchType={"SET_STOCK_ALLOT_SEARCH_FROM_GATE_IN_DATE"}
            />
          </Grid>
          <Grid item xs={6} md={4} lg={2}>
            <Typography variant="subtitle1" className={classes.LabelTypography}>
              To gate in date
            </Typography>

            <DatePickerField
              dateId="stocks-allot-to-gatein-date"
              dateValue={toGateInDate}
              dateChange={(date) => setToGateInDate(date)}
              dispatchType={"SET_STOCK_ALLOT_SEARCH_TO_GATE_IN_DATE"}
            />
          </Grid>

          {stocksAndAllotmentSearch.out_history === "False" ? (
            <>
              <Grid item xs={6} md={4} lg={2}>
                <Typography
                  variant="subtitle1"
                  className={classes.LabelTypography}
                >
                  From Gate Out Date
                </Typography>
                <TextField
                  disabled={true}
                  id="time"
                  //  label="Alarm clock"
                  type="time"
                  //  defaultValue="07:30"
                  className={classes.textField}
                  InputLabelProps={{
                    shrink: true,
                  }}
                  inputProps={{
                    step: 300, // 5 min
                  }}
                >
                  {gateIn.allDropDown &&
                    gateIn.allDropDown.client_data.map((option) => (
                      <MenuItem key={option.name} value={option.name}>
                        {option.name}
                      </MenuItem>
                    ))}
                </TextField>
              </Grid>
              <Grid item xs={6} md={4} lg={2}>
                <Typography
                  variant="subtitle1"
                  className={classes.LabelTypography}
                >
                  To Gate Out Date
                </Typography>
                <TextField
                  disabled={true}
                  id="time"
                  //  label="Alarm clock"
                  type="time"
                  //  defaultValue="07:30"
                  className={classes.textField}
                  InputLabelProps={{
                    shrink: true,
                  }}
                  inputProps={{
                    step: 300, // 5 min
                  }}
                >
                  {gateIn.allDropDown &&
                    gateIn.allDropDown.client_data.map((option) => (
                      <MenuItem key={option.name} value={option.name}>
                        {option.name}
                      </MenuItem>
                    ))}
                </TextField>
              </Grid>
            </>
          ) : (
            <>
              <Grid item xs={6} md={4} lg={2}>
                <Typography
                  variant="subtitle1"
                  className={classes.LabelTypography}
                >
                  From gate Out date
                </Typography>

                <DatePickerField
                  dateId="stocks-allot-to-gatein-date"
                  dateValue={fromGateOutDate}
                  dateChange={(date) => setFromGateOutDate(date)}
                  dispatchType={"SET_STOCK_ALLOT_SEARCH_FROM_GATE_OUT_DATE"}
                />
              </Grid>
              <Grid item xs={6} md={4} lg={2}>
                <Typography
                  variant="subtitle1"
                  className={classes.LabelTypography}
                >
                  To gate Out date
                </Typography>

                <DatePickerField
                  dateId="stocks-allot-to-gatein-date"
                  dateValue={toGateOutDate}
                  dateChange={(date) => setToGateOutDate(date)}
                  dispatchType={"SET_STOCK_ALLOT_SEARCH_TO_GATE_OUT_DATE"}
                />
              </Grid>
            </>
          )}

          <Grid item xs={6} md={4} lg={2}>
            <Typography variant="subtitle1" className={classes.LabelTypography}>
              Booking Number
            </Typography>

            <CustomTextfield
              id="stocks-allot-booking-number"
              handleChange={(e) => setBookingNumber(e.target.value)}
              value={bookingNumber}
              dispatchType={"SET_STOCK_ALLOT_SEARCH_BOOKING_NUMBER"}
            />
          </Grid>
            <Grid item xs={6} md={4} lg={2}>
              <Typography
                variant="subtitle1"
                className={classes.LabelTypography}
              >
                Status
              </Typography>
              <Autocomplete
                value={status}
                onChange={(event, newValue) => {
                  setStatus(newValue);
                }}
                style={{ padding: 0 }}
                className={classes.autocomplete}
                options={ gateIn?.allDropDown?.stock_stage.map((option) => option)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    variant="outlined"
                    className={classes.textField}
                    onBlur={(e) => {
                      setStatus(e.target.value);
                      dispatch({
                        type: "SET_STOCK_ALLOT_SEARCH_STATUS",
                        payload: e.target.value,
                      });
                    }}
                    fullWidth
                  />
                )}
              />
            </Grid>
            <Grid item xs={6} md={4} lg={2}>
              <Typography
                variant="subtitle1"
                className={classes.LabelTypography}
              >
                Ref Code
              </Typography>
              <Autocomplete
                value={refCode}
                onChange={(event, newValue) => {
                  setRefCode(newValue);
                }}
                style={{ padding: 0 }}
                className={classes.autocomplete}
                options={ gateIn.allDropDown.client_ref_codes.map((option) => option)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    variant="outlined"
                    className={classes.textField}
                    onBlur={(e) => {
                      setRefCode(e.target.value);
                      dispatch({
                        type: "SET_STOCK_ALLOT_SEARCH_REF_CODE",
                        payload: e.target.value,
                      });
                    }}
                    fullWidth
                  />
                )}
              />
            </Grid>
          <Grid item xs={6} md={4} lg={2}>
            <Typography variant="subtitle1" className={classes.LabelTypography}>
              From available date
            </Typography>

            <DatePickerField
              dateId="stocks-allot-from-available-date"
              dateValue={fromAvailableDate}
              dateChange={(date) => setFromAvailableDate(date)}
              dispatchType={"SET_STOCK_ALLOT_SEARCH_FROM_AVAILABLE_DATE"}
            />
          </Grid>
          <Grid item xs={6} md={4} lg={2}>
            <Typography variant="subtitle1" className={classes.LabelTypography}>
              To available date
            </Typography>

            <DatePickerField
              dateId="stocks-allot-to-availabe-date"
              dateValue={toAvailableDate}
              dateChange={(date) => setToAvailableDate(date)}
              dispatchType={"SET_STOCK_ALLOT_SEARCH_TO_AVAILABLE_DATE"}
            />
          </Grid>

          <Grid item xs={6} md={4} lg={2}>
            <Typography variant="subtitle1" className={classes.LabelTypography}>
              From allotment date
            </Typography>

            <DatePickerField
              dateId="stocks-allot-from-allotment-date"
              dateValue={fromAllotmentDate}
              dateChange={(date) => setFromAllotmentDate(date)}
              dispatchType={"SET_STOCK_ALLOT_SEARCH_FROM_ALLOTMENT_DATE"}
            />
            </Grid>
          <Grid item xs={6} md={4} lg={2}>
            <Typography variant="subtitle1" className={classes.LabelTypography}>
              To allotment date
            </Typography>

            <DatePickerField
              dateId="stocks-allot-to-allotment-date"
              dateValue={toAllotmentDate}
              dateChange={(date) => setToAllotmentDate(date)}
              dispatchType={"SET_STOCK_ALLOT_SEARCH_TO_ALLOTMENT_DATE"}
            />
          </Grid>
        </Grid>
        <Grid
          container
          spacing={3}
          style={{
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Grid
            item
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              width: "100%",
              marginTop: "80px",
            }}
          >
            <Button
              className={classes.searchButton}
              onClick={() => {
                dispatch(searchStocksDispatch(stocksAndAllotmentSearch));
                props.handleClose();
              }}
            >
              Search
            </Button>
          </Grid>
        </Grid>
      </Paper>
    </div>
  );
};

export default StocksAndAllotmentSearchModal;
