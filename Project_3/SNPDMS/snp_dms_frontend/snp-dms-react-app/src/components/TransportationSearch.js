import React, { useEffect, useState } from "react";
import {
  makeStyles,
  Typography,
  Paper,
  TextField,
  Grid,
  Box,
  Button,
  FormControlLabel,
  Radio,
} from "@material-ui/core";

import { useDispatch, useSelector } from "react-redux";
import DatePickerField from "./reusableComponents/DatePickerField";
import { dropDownDispatch } from "../actions/GateInActions";
import Autocomplete from "@material-ui/lab/Autocomplete";
import { theme } from "../App";
import { getTransportationBilling } from "../actions/BillingActions";
import { useSnackbar } from "notistack";

const useStyles = makeStyles((theme) => ({
  paperContainer: {
    padding: theme.spacing(4, 3),
  },
  input: {
    padding: 7,
  },
  choiceSelectContainer: {
    border: "1px solid #243545",
    marginTop: "0rem",
    display: "flex",
    borderRadius: 6,
  },
  choice: {
    backgroundColor: "#fff",
    width: "100%",
    padding: 1,
  },
  selectedChoice: {
    borderRadius: 5,
    color: "#fff",
    backgroundColor: "#2F6FB7",
    width: "100%",
    padding: 1,
    "&:hover": {
      backgroundColor: "#2F6FB7",
    },
  },
  LabelTypography: {
    fontSize: 14,
    fontWeight: 600,
    color: "#243545",
    paddingBottom: 4,
    [theme.breakpoints.down("sm")]: {
      // padding: "1px 4px",
      paddingBottom: 1,
    },
  },
  button: {
    fontSize: 12.5,
    borderRadius: 6,
    marginLeft: "auto",
    marginRight: "auto",
    marginTop: 20,
    width: "35%",
    border: "1.5px solid #FDBD2E",
    boxShadow: "0px 3px 6px #9199A14D",
    backgroundColor: "#FDBD2E",
    color: "#fff",
    "&:hover": {
      backgroundColor: "#FDBD2E",
    },
  },
  button2: {
    fontSize: 12.5,
    borderRadius: 6,
    marginLeft: "auto",
    marginRight: "auto",
    marginTop: 20,
    width: "35%",
    border: "1.5px solid #2A5FA5",
    boxShadow: "0px 3px 6px #9199A14D",
    backgroundColor: "#fff",
    color: "#2A5FA5",
    "&:hover": {
      backgroundColor: "#fff",
    },
  },
  autocomplete: {
    "& .MuiAutocomplete-inputRoot[class*='MuiOutlinedInput-root']": {
      padding: 0,
    },
  },
}));

export default function TransportationSearchModal(props) {
  const classes = useStyles();
  const dispatch = useDispatch();
  const notify = useSnackbar().enqueueSnackbar;
  const store = useSelector((state) => state);
  const { gateIn, billing } = store;
  const [clientName, setClientName] = useState("");
  const [refCode, setRefCode] = useState("");
  const [containerNo, setContainerNo] = useState("");
  const [blNumber, setBLNumber] = useState("");
  const [doNumber, setDONumber] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [isRej, setIsRej] = useState("False");
  const [stocksAvailableList, setStocksAvailableList] = useState([]);
  useEffect(() => {
    let reqArray = ["client_data", "location_site_dashboard_list", "client_ref_codes"];
    dispatch(dropDownDispatch(reqArray, notify));
  }, []);

  useEffect(() => {
    setStocksAvailableList(billing && billing.allHandlingBills);
  }, [billing.allHandlingBills]);

  const handleSearch = () => {
    let data = {
      from: fromDate,
      to: toDate,
      client: clientName,
      ref_code: refCode,
      container_no: containerNo,
      location: localStorage.getItem("location")
      ? JSON.parse(localStorage.getItem("location")).location
      : null,
      site: localStorage.getItem("site")
      ? JSON.parse(localStorage.getItem("site")).site
      : null,
      bl_no: blNumber,
      do_no: doNumber,
      is_rejected: isRej,
      pg_no: 1,
      on_page_data: store.stocksAndAllotmentSearch.on_page_data,
    };
    if (isRej === "False")
      dispatch({ type: "SET_IS_REJECTED", payload: "False" });
    else dispatch({ type: "SET_IS_REJECTED", payload: "True" });
    dispatch(getTransportationBilling(data));
    props.handleClose();
  };

  const handleFromDateChange = (date) => {
    var selectedDate = new Date(date);
    var dd = String(selectedDate.getDate()).padStart(2, "0");
    var mm = String(selectedDate.getMonth() + 1).padStart(2, "0"); //
    var yyyy = selectedDate.getFullYear();
    var selectedDateFormat = yyyy + "-" + mm + "-" + dd;
    setFromDate(selectedDateFormat);
  };

  const handleToDateChange = (date) => {
    var selectedDate = new Date(date);
    var dd = String(selectedDate.getDate()).padStart(2, "0");
    var mm = String(selectedDate.getMonth() + 1).padStart(2, "0"); //
    var yyyy = selectedDate.getFullYear();
    var selectedDateFormat = yyyy + "-" + mm + "-" + dd;
    setToDate(selectedDateFormat);
  };

  const mapped =
    gateIn.allDropDown &&
    gateIn.allDropDown.client_data &&
    gateIn.allDropDown.client_data.map((obj) => obj.name);
  const filtered =
    mapped && mapped.filter((type, index) => mapped.indexOf(type) === index);

  return (
    <div>
      <Typography variant="subtitle2">
        <Box fontWeight="fontWeightBold" m={1}>
          Transportation Search
        </Box>
      </Typography>
      <Paper className={classes.paperContainer} elevation={0}>
        <Grid container spacing={3}>
          {gateIn.allDropDown && filtered && (
            <Grid
              item
              xs={12}
              sm={6}
              lg={3}
              style={theme.breakpoints.down("sm") && { padding: 7 }}
            >
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
                    onChange={(e) => {
                      setClientName(e.target.value);
                      dispatch({
                        type: "SET_BILLING_CLIENT",
                        payload: e.target.value,
                      });
                    }}
                    fullWidth
                  />
                )}
              />
            </Grid>
          )}

{gateIn.allDropDown && gateIn.allDropDown.client_ref_codes && (
            <Grid
              item
              xs={12}
              sm={6}
              lg={3}
              style={theme.breakpoints.down("sm") && { padding: 7 }}
            >
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
                options={gateIn.allDropDown.client_ref_codes.map(
                  (option) => option
                )}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    variant="outlined"
                    className={classes.textField}
                    onBlur={(e) => {
                      setRefCode(e.target.value);
                      dispatch({
                        type: "SET_MNR_REF_CODE",
                        payload: e.target.value,
                      });
                    }}
                    fullWidth
                  />
                )}
              />
            </Grid>
          )}
          <Grid
            item
            xs={12}
            sm={6}
            lg={3}
            style={theme.breakpoints.down("sm") && { padding: 7 }}
          >
            <Typography variant="subtitle1" className={classes.LabelTypography}>
              Container Number
            </Typography>

            <TextField
              id="container-number"
              value={containerNo}
              variant="outlined"
              fullWidth
              inputProps={{ className: classes.input }}
              onChange={(e) => {
                setContainerNo(e.target.value);
                dispatch({
                  type: "SET_BILLING_CONTAINER",
                  payload: e.target.value,
                });
              }}
            />
          </Grid>
          <Grid
            item
            xs={12}
            sm={6}
            lg={3}
            style={theme.breakpoints.down("sm") && { padding: 7 }}
          >
            <Typography variant="subtitle1" className={classes.LabelTypography}>
              BL Number
            </Typography>

            <TextField
              id="bl-number"
              value={blNumber}
              variant="outlined"
              fullWidth
              inputProps={{ className: classes.input }}
              onChange={(e) => {
                setBLNumber(e.target.value);
              }}
            />
          </Grid>
          <Grid
            item
            xs={12}
            sm={6}
            lg={3}
            style={theme.breakpoints.down("sm") && { padding: 7 }}
          >
            <Typography variant="subtitle1" className={classes.LabelTypography}>
              DO Number
            </Typography>

            <TextField
              id="do-number"
              value={doNumber}
              variant="outlined"
              fullWidth
              inputProps={{ className: classes.input }}
              onChange={(e) => {
                setDONumber(e.target.value);
              }}
            />
          </Grid>
          <Grid
            item
            xs={12}
            sm={6}
            lg={4}
            style={theme.breakpoints.down("sm") && { padding: 7 }}
          >
            <Typography variant="subtitle1" className={classes.LabelTypography}>
              From Date
            </Typography>

            <DatePickerField
              dateId="from-date"
              dateValue={fromDate}
              dateChange={handleFromDateChange}
            />
          </Grid>
          <Grid
            item
            xs={12}
            sm={6}
            lg={4}
            style={theme.breakpoints.down("sm") && { padding: 7 }}
          >
            <Typography variant="subtitle1" className={classes.LabelTypography}>
              To Date
            </Typography>

            <DatePickerField
              dateId="to-date"
              dateValue={toDate}
              dateChange={handleToDateChange}
            />
          </Grid>
          <Grid
            item
            xs={12}
            sm={6}
            lg={4}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Typography variant="subtitle2">Is Rejected?</Typography>
            <FormControlLabel
              value={"yes"}
              control={
                <Radio
                  style={{ color: "#2A5FA5" }}
                  checked={isRej === "True"}
                  onClick={() => setIsRej("True")}
                />
              }
              label="Yes"
            />
            <FormControlLabel
              value="no"
              control={
                <Radio
                  style={{ color: "#2A5FA5" }}
                  checked={isRej === "False"}
                  onClick={() => setIsRej("False")}
                />
              }
              label="No"
            />
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
                marginTop: "60px",
              }}
            >
              <Button className={classes.button} onClick={handleSearch}>
                Search
              </Button>
            </Grid>
          </Grid>
        </Grid>
      </Paper>
    </div>
  );
}
