import React, { useState } from "react";
import {
  Typography,
  Paper,
  TextField,
  MenuItem,
  Grid,
  Button,
  Autocomplete,
} from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { searchStocksDispatch } from "../actions/StocksAndAllotmentActions";
import CustomTextfield from "@components/reusablecomponents/GateInTextField";
import DatePickerField from "@components/reusablecomponents/DatePickerField";
import { customLabelTypography } from "../utils/CustomClasses";

const StocksAndAllotmentSearchModal = (props) => {
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

  const filtered =
    mapped && mapped.filter((type, index) => mapped.indexOf(type) === index);

  return (
    <div >
     
      <Paper
        sx={(theme) => ({
          padding: theme.spacing(1, 1),
          [theme.breakpoints.down('sm')]:{
            overflowY:"scroll",
            height:"calc(100vh - 200px)"
          }
        })}
        elevation={0}
      >
        <Grid container spacing={1}>
           <Grid item size={{ xs: 12, md: 4, lg: 2 }}>
            <Typography variant="subtitle1" sx={customLabelTypography}>
              From gate in date
            </Typography>

            <DatePickerField
              dateId="stocks-allot-from-getin-date"
              dateValue={fromGateInDate}
              dateChange={(date) => setFromGateInDate(date)}
              dispatchType={"SET_STOCK_ALLOT_SEARCH_FROM_GATE_IN_DATE"}
            />
          </Grid>
          <Grid item size={{ xs: 12, md: 4, lg: 2 }}>
            <Typography variant="subtitle1" sx={customLabelTypography}>
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
              <Grid item size={{ xs: 12, md: 4, lg: 2 }}>
                <Typography variant="subtitle1" sx={customLabelTypography}>
                  From Gate Out Date
                </Typography>
                <TextField
                  disabled={true}
                  fullWidth
                  size="small"
                  id="time"
                  //  label="Alarm clock"
                  type="time"
                  //  defaultValue="07:30"

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
              <Grid item size={{ xs: 12, md: 4, lg: 2 }}>
                <Typography variant="subtitle1" sx={customLabelTypography}>
                  To Gate Out Date
                </Typography>
                <TextField
                   fullWidth
                  size="small"
                  disabled={true}
                  id="time"
                  //  label="Alarm clock"
                  type="time"
                  //  defaultValue="07:30"

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
              <Grid item size={{ xs: 12, md: 4, lg: 2 }}>
                <Typography variant="subtitle1" sx={customLabelTypography}>
                  From gate Out date
                </Typography>

                <DatePickerField
                  dateId="stocks-allot-to-gatein-date"
                  dateValue={fromGateOutDate}
                  dateChange={(date) => setFromGateOutDate(date)}
                  dispatchType={"SET_STOCK_ALLOT_SEARCH_FROM_GATE_OUT_DATE"}
                />
              </Grid>
              <Grid item size={{ xs: 12, md: 4, lg: 2 }}>
                <Typography variant="subtitle1" sx={customLabelTypography}>
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
            <Grid item size={{ xs: 12, md: 4, lg: 2 }}>
            <Typography variant="subtitle1" sx={customLabelTypography}>
              From available date
            </Typography>

            <DatePickerField
              dateId="stocks-allot-from-available-date"
              dateValue={fromAvailableDate}
              dateChange={(date) => setFromAvailableDate(date)}
              dispatchType={"SET_STOCK_ALLOT_SEARCH_FROM_AVAILABLE_DATE"}
            />
          </Grid>
          <Grid item size={{ xs: 12, md: 4, lg: 2 }}>
            <Typography variant="subtitle1" sx={customLabelTypography}>
              To available date
            </Typography>

            <DatePickerField
              dateId="stocks-allot-to-availabe-date"
              dateValue={toAvailableDate}
              dateChange={(date) => setToAvailableDate(date)}
              dispatchType={"SET_STOCK_ALLOT_SEARCH_TO_AVAILABLE_DATE"}
            />
          </Grid>

          <Grid item size={{ xs: 12, md: 4, lg: 2 }}>
            <Typography variant="subtitle1" sx={customLabelTypography}>
              From allotment date
            </Typography>

            <DatePickerField
              dateId="stocks-allot-from-allotment-date"
              dateValue={fromAllotmentDate}
              dateChange={(date) => setFromAllotmentDate(date)}
              dispatchType={"SET_STOCK_ALLOT_SEARCH_FROM_ALLOTMENT_DATE"}
            />
          </Grid>
          <Grid item size={{ xs: 12, md: 4, lg: 2 }}>
            <Typography variant="subtitle1" sx={customLabelTypography}>
              To allotment date
            </Typography>

            <DatePickerField
              dateId="stocks-allot-to-allotment-date"
              dateValue={toAllotmentDate}
              dateChange={(date) => setToAllotmentDate(date)}
              dispatchType={"SET_STOCK_ALLOT_SEARCH_TO_ALLOTMENT_DATE"}
            />
          </Grid>
          <Grid item size={{ xs: 12, md: 4, lg: 2 }}>
            <Typography variant="subtitle1" sx={customLabelTypography}>
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
            <Grid item size={{ xs: 12, md: 4, lg: 2 }}>
              <Typography variant="subtitle1" sx={customLabelTypography}>
                Client Name
              </Typography>

              <Autocomplete
                value={clientName}
                onChange={(event, newValue) => {
                  setClientName(newValue);
                }}
                style={{ padding: 0 }}
                sx={{
                  "& .MuiAutocomplete-inputRoot[class*='MuiOutlinedInput-root']":
                    {
                      padding: 0,
                    },
                }}
                options={filtered.map((option) => option)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    variant="outlined"
                    onBlur={(e) => {
                      setClientName(e.target.value);
                      dispatch({
                        type: "SET_STOCK_ALLOT_SEARCH_CLIENT_NAME",
                        payload: e.target.value,
                      });
                    }}
                    fullWidth
                  />
                )}
              />
            </Grid>
          )}

         


          <Grid item size={{ xs: 12, md: 4, lg: 2 }}>
            <Typography variant="subtitle1" sx={customLabelTypography}>
              Booking Number
            </Typography>

            <CustomTextfield
              id="stocks-allot-booking-number"
              handleChange={(e) => setBookingNumber(e.target.value)}
              value={bookingNumber}
              dispatchType={"SET_STOCK_ALLOT_SEARCH_BOOKING_NUMBER"}
            />
          </Grid>
          <Grid item size={{ xs: 12, md: 4, lg: 2 }}>
            <Typography variant="subtitle1" sx={customLabelTypography}>
              Status
            </Typography>
            <Autocomplete
              value={status}
              onChange={(event, newValue) => {
                setStatus(newValue);
              }}
              style={{ padding: 0 }}
              sx={{
                "& .MuiAutocomplete-inputRoot[class*='MuiOutlinedInput-root']":
                  {
                    padding: 0,
                  },
              }}
              options={gateIn?.allDropDown?.stock_stage.map((option) => option)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  variant="outlined"
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
          <Grid item size={{ xs: 12, md: 4, lg: 2 }}>
            <Typography variant="subtitle1" sx={customLabelTypography}>
              Ref Code
            </Typography>
            <Autocomplete
              value={refCode}
              onChange={(event, newValue) => {
                setRefCode(newValue);
              }}
              style={{ padding: 0 }}
              sx={{
                "& .MuiAutocomplete-inputRoot[class*='MuiOutlinedInput-root']":
                  {
                    padding: 0,
                  },
              }}
              options={gateIn.allDropDown.client_ref_codes.map(
                (option) => option
              )}
              renderInput={(params) => (
                <TextField
                  {...params}
                  variant="outlined"
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
              marginTop:12
            }}
          >
            <Button
              variant="contained"
              color="warning"
              sx={{
                borderRadius: "0.5rem",
                padding: "1px 4px",
                height: 40,
                fontSize: 12.5,
                marginLeft: "auto",
                marginRight: "auto",
                width: "35%",
              }}
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
