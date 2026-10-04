import React, { useState } from "react";
import {
  makeStyles,
  Typography,
  Paper,
  Grid,
  Box,
  Button,
  TextField,
  Backdrop,
  CircularProgress,
} from "@material-ui/core";
import LayoutContainer from "../../components/reusableComponents/LayoutContainer";
import { useDispatch, useSelector } from "react-redux";
import { useSnackbar } from "notistack";
import { theme } from "../../App";
import DatePickerField from "../../components/reusableComponents/DatePickerField";
import { Autocomplete } from "@mui/material";
import { downloadProcurementReports } from "../../actions/Procurement/procurementAction";


const useStyles = makeStyles((theme) => ({
    paperContainer: {
      padding: theme.spacing(4, 3),
    },
    LabelTypography: {
      fontSize: 14,
      fontWeight: 600,
      color: "#243545",
      paddingBottom: 4,
      [theme.breakpoints.down("sm")]: {
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
      [theme.breakpoints.down("sm")]:{
        width:"50%"
      }
    },
    input: {
      padding: 8,
    },
    textField: {
      "& .MuiOutlinedInput-root": {
        "& fieldset": {
          borderColor: "#243545",
        },
      },
    },
    autocomplete: {
      [theme.breakpoints.down("sm")]:{
        width:"235px",
      },
      "& .MuiAutocomplete-inputRoot[class*='MuiOutlinedInput-root']": {
        padding: 0,
      },
    },
    backdrop: {
      zIndex: theme.zIndex.drawer + 1,
      color: "#fff",
    },
  }));
  

const ProcurementReport = () => {
    const classes = useStyles();
    const dispatch = useDispatch();
    const store = useSelector((state) => state);
    const {  user, ui } = store;
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");
    const [line, setLine] = useState("");
    const [location] = useState(user.location ? user.location : "");
    const [site] = useState(user.site ? user.site : "");
    const [location_id] = useState(user.location_id ? user.location_id : "");
    const [site_id] = useState(user.site_id ? user.site_id : "");
    const [loader, setLoader] = useState(false);
    const notify = useSnackbar().enqueueSnackbar;
  

  
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
  
    const downloadReport = () => {
      if (fromDate === "" || toDate === "")
        notify("Please Enter From Date and To Date ", {
          variant: "warning",
        });
      else if (line === "")
        notify("Please Select  Procurement Report Type ", {
          variant: "warning",
        });
      else {
        let data = {
          from_date: fromDate,
          to_date: toDate,
          report: line,
          location:location_id,
          site:site_id,
          item:"",
          category:""
        };
        dispatch(downloadProcurementReports(data, setLoader, notify));
      }
    };
  
  
  
  return (
    <LayoutContainer footer={false}>
    <div>
      <Typography variant="subtitle2">
        <Box fontWeight="fontWeightBold" m={1} >
          Download Reports
        </Box>
      </Typography>
      <Paper className={classes.paperContainer} elevation={0}>
        <Grid container spacing={4}>
          <Grid
            item
            xs={12}
            sm={3}
            style={theme.breakpoints.down("sm") && { padding: 7 }}
          >
            <Typography
              variant="subtitle1"
              className={classes.LabelTypography}
            >
              From Date
            </Typography>

            <DatePickerField
              dateId="manufacturing-date"
              dateValue={fromDate}
              dateChange={handleFromDateChange}
            />
          </Grid>
          <Grid
            item
            xs={12}
            sm={3}
            style={theme.breakpoints.down("sm") && { padding: 7 }}
          >
            <Typography
              variant="subtitle1"
              className={classes.LabelTypography}
            >
              To Date
            </Typography>

            <DatePickerField
              dateId="manufacturing-date"
              dateValue={toDate}
              dateChange={handleToDateChange}
            />
          </Grid>
        
          <Grid
            item
            xs={12}
            sm={6}
            style={theme.breakpoints.down("sm") && { padding: 7 }}
          >
            <Typography
              variant="subtitle1"
              className={classes.LabelTypography}
            >
              Procurement Report Type
            </Typography>

            <Autocomplete
              id="report-line"
              freeSolo={true}
              noOptionsText="No Reports Available"
              options={
                [
                    "REQUISITION REPORT",
                    "CONSUMPTION REPORT",
                    "INVENTORY REPORT",
                    "STOCK REPORT"
                   ]
              }
              getOptionLabel={(option) => option}
              style={{ padding: 0 }}
              className={classes.autocomplete}
            
              renderInput={(params) => (
                <TextField
                  {...params}
                  autoComplete="off"
                  value={line}
                  className={classes.textField}
                  onBlur={(e) => {
                    setLine(e.target.value);
                  }}
                  fullWidth
                  variant="outlined"
                />
              )}
            />
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
          <Button
            className={classes.button}
            onClick={downloadReport}
            disabled={loader}
          >
            Download Reports
          </Button>
        </Grid>
      </Paper>
    </div>
    <Backdrop className={classes.backdrop} open={ui.isloading}>
      <CircularProgress color="inherit" />
    </Backdrop>
  </LayoutContainer>
  )
}

export default ProcurementReport