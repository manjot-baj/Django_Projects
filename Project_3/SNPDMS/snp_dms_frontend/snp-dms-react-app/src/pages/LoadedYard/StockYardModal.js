import React, { useState } from "react";
import {
  makeStyles,
  Typography,
  Paper,
  TextField,
  Grid,
  Box,
  Button,
} from "@material-ui/core";

import { useDispatch, useSelector } from "react-redux";
import DatePickerField from "../../components/reusableComponents/DatePickerField";
import { theme } from "../../App";
import { searchLoadedYardDispatch } from "../../actions/LoadedYardActions";

const useStyles = makeStyles((theme) => ({
  paperContainer: {
    padding: theme.spacing(4, 3),
  },
  input: {
    padding: 7,
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
    border: "1.5px solid #FDBD2E",
    boxShadow: "0px 3px 6px #9199A14D",
    backgroundColor: "#FDBD2E",
    color: "#fff",
    "&:hover": {
      backgroundColor: "#FDBD2E",
    },
  },
}));

export default function StockYardModal(props) {
  const classes = useStyles();
  const dispatch = useDispatch();
  const store = useSelector((state) => state);
  const [size, setSize] = useState("");
  const [inFromDate, setInFromDate] = useState("");
  const [inToDate, setInToDate] = useState("");
  const [outFromDate, setOutFromDate] = useState("");
  const [outToDate, setOutToDate] = useState("");
  const [containerNo, setContainerNo] = useState("");

  const handleSearch = () => {
    let data = {
      in_date: { from: inFromDate, to: inToDate },
      out_date: { from: outFromDate, to: outToDate },
      size: size,
      container_no: containerNo,
      location: localStorage.getItem("location")
        ? localStorage.getItem("location")
        : null,
      site: localStorage.getItem("site") ? localStorage.getItem("site") : null,
      history: false,
      pg_no: 1,
      on_page_data: store.stocksAndAllotmentSearch.on_page_data,
    };
    dispatch(searchLoadedYardDispatch(data));
    props.handleClose();
  };

  const handleInFromDateChange = (date) => {
    var selectedDate = new Date(date);
    var dd = String(selectedDate.getDate()).padStart(2, "0");
    var mm = String(selectedDate.getMonth() + 1).padStart(2, "0"); //
    var yyyy = selectedDate.getFullYear();
    var selectedDateFormat = yyyy + "-" + mm + "-" + dd;
    dispatch({
      type: "LOADEDYARD_IN_FROM_DATE_SEARCH",
      payload: selectedDateFormat,
    });
    setInFromDate(selectedDateFormat);
  };

  const handleInToDateChange = (date) => {
    var selectedDate = new Date(date);
    var dd = String(selectedDate.getDate()).padStart(2, "0");
    var mm = String(selectedDate.getMonth() + 1).padStart(2, "0"); //
    var yyyy = selectedDate.getFullYear();
    var selectedDateFormat = yyyy + "-" + mm + "-" + dd;
    dispatch({
      type: "LOADEDYARD_IN_TO_DATE_SEARCH",
      payload: selectedDateFormat,
    });
    setInToDate(selectedDateFormat);
  };

  const handleOutFromDateChange = (date) => {
    var selectedDate = new Date(date);
    var dd = String(selectedDate.getDate()).padStart(2, "0");
    var mm = String(selectedDate.getMonth() + 1).padStart(2, "0"); //
    var yyyy = selectedDate.getFullYear();
    var selectedDateFormat = yyyy + "-" + mm + "-" + dd;
    dispatch({
      type: "LOADEDYARD_OUT_FROM_DATE_SEARCH",
      payload: selectedDateFormat,
    });
    setOutFromDate(selectedDateFormat);
  };

  const handleOutToDateChange = (date) => {
    var selectedDate = new Date(date);
    var dd = String(selectedDate.getDate()).padStart(2, "0");
    var mm = String(selectedDate.getMonth() + 1).padStart(2, "0"); //
    var yyyy = selectedDate.getFullYear();
    var selectedDateFormat = yyyy + "-" + mm + "-" + dd;
    dispatch({
      type: "LOADEDYARD_OUT_TO_DATE_SEARCH",
      payload: selectedDateFormat,
    });
    setOutToDate(selectedDateFormat);
  };

  return (
    <div>
      <Typography variant="subtitle2">
        <Box fontWeight="fontWeightBold" m={1}>
          Loaded Yard Advance Search Modal
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
                  type: "LOADEDYARD_CONTAINER_NUMBER",
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
              Size
            </Typography>
            <TextField
              id="container-size"
              value={size}
              variant="outlined"
              fullWidth
              inputProps={{ className: classes.input }}
              onChange={(e) => {
                setSize(e.target.value);
              }}
              dispatchType={"LOADEDYARD_SIZE"}
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
              From In Date
            </Typography>

            <DatePickerField
              dateId="from-date"
              dateValue={inFromDate}
              dateChange={handleInFromDateChange}
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
              To In Date
            </Typography>

            <DatePickerField
              dateId="from-date"
              dateValue={inToDate}
              dateChange={handleInToDateChange}
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
              From Out Date
            </Typography>

            <DatePickerField
              dateId="from-date"
              dateValue={outFromDate}
              dateChange={handleOutFromDateChange}
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
              To Out Date
            </Typography>

            <DatePickerField
              dateId="from-date"
              dateValue={outToDate}
              dateChange={handleOutToDateChange}
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
                marginTop: "10%",
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
