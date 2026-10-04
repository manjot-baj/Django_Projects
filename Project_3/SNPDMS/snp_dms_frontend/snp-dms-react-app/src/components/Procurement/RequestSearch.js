import React, {  useState } from "react";
import {
  makeStyles,
  Typography,
  Paper,
  TextField,
  Grid,
  Box,
  Button
} from "@material-ui/core";

import { useDispatch } from "react-redux";
import DatePickerField from "../reusableComponents/DatePickerField";
import { theme } from "../../App";
import { useSnackbar } from "notistack";
import { getAllRequistion } from "../../actions/Procurement/requestAction";

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

const RequestSearch = (props) => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const notify = useSnackbar().enqueueSnackbar;
  const [itemName, setItemName] = useState("");
  const [requestFromDate, setRequestFromDate] = useState("");
  const [requestToDate, setRequestToDate] = useState("");
  const [orderName,setOrderName]=useState("")


 

  const handleSearch = () => {
    dispatch({
      type: "GET_ALL_REQUEST",
      payload: {
        pg_no: "1",
        from_date: requestFromDate,
        to_date: requestToDate,
        name: itemName,
        order_no:orderName
      },
    });
    dispatch(getAllRequistion(notify));
    props.handlePage()
    props.handleClose();
  };

  const handleRequestFromChange = (date) => {
    var selectedDate = new Date(date);
    var dd = String(selectedDate.getDate()).padStart(2, "0");
    var mm = String(selectedDate.getMonth() + 1).padStart(2, "0"); //
    var yyyy = selectedDate.getFullYear();
    var selectedDateFormat = yyyy + "-" + mm + "-" + dd;
    setRequestFromDate(selectedDateFormat);
  };

  const handleRequestToChange = (date) => {
    var selectedDate = new Date(date);
    var dd = String(selectedDate.getDate()).padStart(2, "0");
    var mm = String(selectedDate.getMonth() + 1).padStart(2, "0"); //
    var yyyy = selectedDate.getFullYear();
    var selectedDateFormat = yyyy + "-" + mm + "-" + dd;
    setRequestToDate(selectedDateFormat);
  };

  return (
    <div>
      <Typography variant="subtitle2">
        <Box fontWeight="fontWeightBold" m={1}>
          Requesition Search
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
              Item Name
            </Typography>

            <TextField
              id="container-number"
              value={itemName}
              variant="outlined"
              fullWidth
              inputProps={{ className: classes.input }}
              onChange={(e) => {
                setItemName(e.target.value);
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
            Order Number 
            </Typography>

            <TextField
              id="container-number"
              value={orderName}
              variant="outlined"
              fullWidth
              inputProps={{ className: classes.input }}
              onChange={(e) => {
                setOrderName(e.target.value);
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
              Requesition From Date
            </Typography>
            <DatePickerField
              dateId="invoice-from-date"
              dateValue={requestFromDate}
              dateChange={handleRequestFromChange}
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
              Requesition To Date
            </Typography>

            <DatePickerField
              dateId="invoice-to-date"
              dateValue={requestToDate}
              dateChange={handleRequestToChange}
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
                marginTop: "20px",
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
};

export default RequestSearch;
