
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
  Switch,
} from "@material-ui/core";

import { useDispatch, useSelector } from "react-redux";
import { dropDownDispatch } from "../../../actions/GateInActions";
import { getSealManagementListings } from "../../../actions/Master/SealManagementMasterActions";
import { useSnackbar } from "notistack";
import { theme } from "../../../App";
import Autocomplete from "@material-ui/lab/Autocomplete";
import CustomTextfield from "../../../components/reusableComponents/GateInTextField";
import DatePickerField from "../../../components/reusableComponents/DatePickerField";

const useStyles = makeStyles((theme) => ({
  paperContainer: {
    padding: theme.spacing(4, 3),
  },
  input: {
    padding: 7,
  },
  textField:{
    width:"100%"
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
    border: "1.5px solid #2A5FA5",
    boxShadow: "0px 3px 6px #9199A14D",
    backgroundColor: "#2A5FA5",
    color: "#fff",
    "&:hover": {
      backgroundColor: "#2A5FA5",
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
  button3: {
    fontSize: 12.5,
    borderRadius: 6,
    marginLeft: "auto",
    marginRight: "auto",
    marginTop: 20,
    width: "15%",
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
     height:"32px"
    },
  },
}));

export default function SealManagementSearchModal(props) {
  const classes = useStyles();
  const dispatch = useDispatch();
  const store = useSelector((state) => state);
  const { gateIn, user } = store;
  const [sealLine, setSealLine] = useState("");
  const [sealNumber, setSealNumber] = useState("");
  const [containerNo, setContainerNo] = useState();
  // eslint-disable-next-line no-unused-vars
  const [Location, setLocation] = useState(user.location ? user.location : "");
  // eslint-disable-next-line no-unused-vars
  const [site, setSite] = useState(user.site ? user.site : "");
  const notify = useSnackbar().enqueueSnackbar;
  const [fromInDate, setFromInDate] = useState("");
  const [toInDate, setToInDate] = useState("");
  const [fromOutDate, setFromOutDate] = useState("");
  const [toOutDate, setToOutDate] = useState("");
  const [fromInUseDate, setFromInUseDate] = useState("");
  const [toInUseOutDate, setToInUseDate] = useState("");
  const [isHistory, setIsHistory] = useState(false);
  const [isAvailable, setIsAvailable] = useState(true);
  const [isCut, setIsCut] = useState(false);
  const [isDamage, setIsDamage] = useState(false);
  const [isFirstAllotment, setIsFirstAllotment] = useState(true);

  useEffect(() => {
    let reqArray = ["client_ref_codes", "location_site_dashboard_list"];
    dispatch(dropDownDispatch(reqArray, notify));
// eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = () => {
    let data = {
      number: sealNumber,
      container_no: containerNo,
      line: sealLine,
      location: Location,
      in_date: { from: fromInDate, to: toInDate },
      out_date: { from: fromOutDate, to: toOutDate },
      in_use_date: { from: fromInUseDate, to: toInUseOutDate },
      site: site,
      is_available: isAvailable,
      is_damaged: isDamage,
      is_cut: isCut,
      is_first_allotment: isFirstAllotment,
      is_history: isHistory,
      pg_no:store.stocksAndAllotmentSearch.pg_no,
      on_page_data:  store.stocksAndAllotmentSearch.on_page_data,
    };
    dispatch(getSealManagementListings(data));
    props.handleClose();
  };

  const handleFromInDateChange = (date) => {
    var selectedDate = new Date(date);
    var dd = String(selectedDate.getDate()).padStart(2, "0");
    var mm = String(selectedDate.getMonth() + 1).padStart(2, "0"); //
    var yyyy = selectedDate.getFullYear();
    var selectedDateFormat = yyyy + "-" + mm + "-" + dd;
    setFromInDate(selectedDateFormat);
  };

  const handleToInDateChange = (date) => {
    var selectedDate = new Date(date);
    var dd = String(selectedDate.getDate()).padStart(2, "0");
    var mm = String(selectedDate.getMonth() + 1).padStart(2, "0"); //
    var yyyy = selectedDate.getFullYear();
    var selectedDateFormat = yyyy + "-" + mm + "-" + dd;
    setToInDate(selectedDateFormat);
  };
  const handleFromOutDateChange = (date) => {
    var selectedDate = new Date(date);
    var dd = String(selectedDate.getDate()).padStart(2, "0");
    var mm = String(selectedDate.getMonth() + 1).padStart(2, "0"); //
    var yyyy = selectedDate.getFullYear();
    var selectedDateFormat = yyyy + "-" + mm + "-" + dd;
    setFromOutDate(selectedDateFormat);
  };
  const handleToOutDateChange = (date) => {
    var selectedDate = new Date(date);
    var dd = String(selectedDate.getDate()).padStart(2, "0");
    var mm = String(selectedDate.getMonth() + 1).padStart(2, "0"); //
    var yyyy = selectedDate.getFullYear();
    var selectedDateFormat = yyyy + "-" + mm + "-" + dd;
    setToOutDate(selectedDateFormat);
  };

  const handleInUseDateChange = (date) => {
    var selectedDate = new Date(date);
    var dd = String(selectedDate.getDate()).padStart(2, "0");
    var mm = String(selectedDate.getMonth() + 1).padStart(2, "0"); //
    var yyyy = selectedDate.getFullYear();
    var selectedDateFormat = yyyy + "-" + mm + "-" + dd;
    setFromInUseDate(selectedDateFormat);
  };

  const handleToUseDateChange = (date) => {
    var selectedDate = new Date(date);
    var dd = String(selectedDate.getDate()).padStart(2, "0");
    var mm = String(selectedDate.getMonth() + 1).padStart(2, "0"); //
    var yyyy = selectedDate.getFullYear();
    var selectedDateFormat = yyyy + "-" + mm + "-" + dd;
    setToInUseDate(selectedDateFormat);
  };

  return (
    <div>
      <Typography variant="subtitle2">
        <Box fontWeight="fontWeightBold" m={1}>
          Seal Search
        </Box>
      </Typography>

      <Paper className={classes.paperContainer} elevation={0}>
        <Grid container spacing={3}>
          <Grid
            item
            xs={12}
            sm={6}
            lg={3}
            style={theme.breakpoints.down("sm") && { padding: 7 }}
          >
            <Typography variant="subtitle1" className={classes.LabelTypography}>
              Seal Number
            </Typography>
            <CustomTextfield
              id="seal-no"
              value={sealNumber}
              handleChange={(e) => setSealNumber(e.target.value)}
              dispatchType={"SET_SEAL_MANAGEMENT_SEARCH_NUMBER"}
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
              Container Number
            </Typography>
            <CustomTextfield
              id="container-no"
              value={containerNo}
              handleChange={(e) => setContainerNo(e.target.value)}
              dispatchType={"SET_SEAL_MANAGEMENT_CONTAINER_NUMBER"}
            />
          </Grid>

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
                Line
              </Typography>
              <Autocomplete
                value={sealLine}
                onChange={(event, newValue) => {
                  setSealLine(newValue);
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
                      setSealLine(e.target.value);
                      dispatch({ type: "SET_SEAL_MANAGEMENT_SEARCH_LINE", payload: e.target.value });
                    }}
                    fullWidth
                  />
                )}
              />
            </Grid>
          )}

          <Grid item xs={12} sm={6} lg={3}>
            <Typography variant="subtitle1" className={classes.LabelTypography}>
              From in date
            </Typography>

            <DatePickerField
              dateId="seal-from-in-date"
              dateValue={fromInDate}
              dispatchType={"SET_SEAL_MANAGEMENT_SEARCH_FROM_IN_DATE"}
              dateChange={handleFromInDateChange}
              className={classes.textField}
            />
          </Grid>
          <Grid item xs={6} sm={6} lg={3}>
            <Typography variant="subtitle1" className={classes.LabelTypography}>
              To in date
            </Typography>

            <DatePickerField
              dateId="seal-to-in-date"
              dateValue={toInDate}
              dispatchType={"SET_SEAL_MANAGEMENT_SEARCH_TO_IN_DATE"}
              dateChange={handleToInDateChange}
            />
          </Grid>

          <Grid item  xs={6} sm={6} lg={3}>
            <Typography variant="subtitle1" className={classes.LabelTypography}>
              From out date
            </Typography>

            <DatePickerField
              dateId="seal-from-out-date"
              dateValue={fromOutDate}
              dateChange={handleFromOutDateChange}
              dispatchType={"SET_SEAL_MANAGEMENT_SEARCH_FROM_OUT_DATE"}
            />
          </Grid>
          <Grid item  xs={6} sm={6} lg={3}>
            <Typography variant="subtitle1" className={classes.LabelTypography}>
              To out date
            </Typography>
            <DatePickerField
              dateId="seal-to-out-date"
              dateValue={toOutDate}
              dateChange={handleToOutDateChange}
              dispatchType={"SET_SEAL_MANAGEMENT_SEARCH_TO_OUT_DATE"}
            />
          </Grid>

          <Grid item  xs={6} sm={6} lg={3}>
            <Typography variant="subtitle1" className={classes.LabelTypography}>
              From In Use Date
            </Typography>
            <DatePickerField
              dateId="seal-from-inuse-date"
              dateValue={fromInUseDate}
              dateChange={handleInUseDateChange}
              dispatchType={"SET_SEAL_MANAGEMENT_SEARCH_FROM_INUSE_DATE"}
            />
          </Grid>

          <Grid item  xs={6} sm={6} lg={3}>
            <Typography variant="subtitle1" className={classes.LabelTypography}>
              To In Use Date
            </Typography>
            <DatePickerField
              dateId="seal-to-inuse-date"
              dateValue={toInUseOutDate}
              dateChange={handleToUseDateChange}
              dispatchType={"SET_SEAL_MANAGEMENT_SEARCH_TO_INUSE_DATE"}
            />
          </Grid>
        </Grid>
        <Grid container style={{ marginTop: "20px" }}>
          <Grid item xs={4} sm={6}>
            <Grid
              item
              xs={4}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "2px 18px 8px 0px",
              }}
            >
              <Typography variant="subtitle2">Seal history?</Typography>
            </Grid>
            <Grid container xs={4}>
              <Grid item xs={10}>
                <FormControlLabel
                  value="yes"
                  control={
                    <Radio
                      style={{ color: "#2A5FA5" }}
                      checked={isHistory === true}
                      onClick={() => {
                        setIsHistory(true);
                        let data = {
                          location: "ALL",
                          site: "ALL",
                          line: "",
                          number: "",
                          is_available: false,
                          is_damaged: true,
                          is_cut: false,
                          is_first_allotment: false,
                          is_history: true,
                          in_date: { from: "", to: "" },
                          out_date: { from: "", to: "" },
                          in_use_date: { from: "", to: "" },
                          pg_no: 1,
                          on_page_data: 3,
                        };
                        dispatch(getSealManagementListings(data));
                      }}
                      disabled={isAvailable === false}
                    />
                  }
                  label="Yes"
                />
              </Grid>
              <Grid item xs={2}>
                <FormControlLabel
                  value="No"
                  control={
                    <Radio
                      style={{ color: "#2A5FA5" }}
                      checked={isHistory === false}
                      onClick={() => {
                        setIsHistory(false);
                        setIsAvailable(false);
                        let data = {
                          location: "ALL",
                          site: "ALL",
                          line: "",
                          number: "",
                          is_available: false,
                          is_damaged: false,
                          is_cut: false,
                          is_first_allotment: true,
                          is_history: false,
                          in_date: { from: "", to: "" },
                          out_date: { from: "", to: "" },
                          in_use_date: { from: "", to: "" },
                          pg_no: 1,
                          on_page_data: 3,
                        };
                        dispatch(getSealManagementListings(data));
                      }}
                      disabled={isAvailable === false}
                    />
                  }
                  label="No"
                />
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={4} sm={6}>
            <Grid
              item
              xs={6}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "2px 18px 8px 0px",
              }}
            >
              <Typography variant="subtitle2">Available Seal</Typography>
            </Grid>
            <Grid container xs={4}>
              <Grid item xs={10}>
                <FormControlLabel
                  value="yes"
                  disabled={isHistory === true}
                  control={
                    <Radio
                      style={{ color: "#2A5FA5" }}
                      checked={isAvailable === true && isHistory === false}
                      onClick={() => {
                        setIsAvailable(true);
                        let data = {
                          location: "ALL",
                          site: "ALL",
                          line: "",
                          number: "",
                          is_available: true,
                          is_damaged: false,
                          is_cut: false,
                          is_first_allotment: true,
                          is_history: false,
                          in_date: { from: "", to: "" },
                          out_date: { from: "", to: "" },
                          in_use_date: { from: "", to: "" },
                          pg_no: 1,
                          on_page_data: 3,
                        };
                        dispatch(getSealManagementListings(data));
                      }}
                    />
                  }
                  label="Yes"
                />
              </Grid>
              <Grid item xs={2}>
                <FormControlLabel
                  value="No"
                  control={
                    <Radio
                      style={{ color: "#2A5FA5" }}
                      checked={isAvailable === false || isHistory === true}
                      onClick={() => {
                        setIsAvailable(false);
                        let data = {
                          location: "ALL",
                          site: "ALL",
                          line: "",
                          number: "",
                          is_available: false,
                          is_damaged: true,
                          is_cut: true,
                          is_first_allotment: false,
                          is_history: false,
                          in_date: { from: "", to: "" },
                          out_date: { from: "", to: "" },
                          in_use_date: { from: "", to: "" },
                          pg_no: 1,
                          on_page_data: 3,
                        };
                        dispatch(getSealManagementListings(data));
                      }}
                      disabled={isHistory === true}
                    />
                  }
                  label="No"
                />
              </Grid>
            </Grid>
          </Grid>

          <Grid container xs={5} style={{ marginTop: "40PX" }}>
            <Grid item xs={5}>
              <span>First Allotment</span>
              <Switch
                value={isFirstAllotment}
                defaultChecked
                onChange={(e) => setIsFirstAllotment(e.target.value)}
                inputProps={{ "aria-label": "controlled" }}
              />
            </Grid>
            <Grid item xs={3}>
              <span>Cut</span>
              <Switch
                defaultChecked={
                  isAvailable === true && isHistory === false && isCut === false
                }
                value={isCut}
                checked={isCut}
                onChange={() => {
                  setIsCut(true);
                  setIsDamage(false);
                }}
                inputProps={{ "aria-label": "controlled" }}
                disabled={!isHistory && isAvailable}
              />
            </Grid>
            <Grid item xs={4}>
              <span>Damage</span>
              <Switch
                defaultChecked={
                  isAvailable === true &&
                  isHistory === false &&
                  isDamage === false
                }
                value={isDamage}
                checked={isDamage}
                onChange={() => {
                  setIsDamage(true);
                  setIsCut(false);
                }}
                inputProps={{ "aria-label": "controlled" }}
                disabled={!isHistory && isAvailable}
              />
            </Grid>
          </Grid>
        </Grid>

        <Grid
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            marginTop: 20,
          }}
        >
          <Button className={classes.button} onClick={handleSearch}>
            Search
          </Button>
          <Button className={classes.button2} onClick={() => window.location.reload()}>
            Reset
          </Button>
        </Grid>
      </Paper>
    </div>
  );
}