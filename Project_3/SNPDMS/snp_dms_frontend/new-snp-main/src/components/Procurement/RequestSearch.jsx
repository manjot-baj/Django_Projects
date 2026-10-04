import React, { useState } from "react";
import { Typography, Paper, TextField, Grid, Box, Button } from "@mui/material";

import { useDispatch } from "react-redux";
import DatePickerField from "@components/reusablecomponents/DatePickerField";
import { theme } from "../../App";
import { useSnackbar } from "notistack";
import { getAllRequistion } from "../../actions/Procurement/requestAction";
import { customLabelTypography } from "../../utils/CustomClasses";

const RequestSearch = (props) => {
  const dispatch = useDispatch();
  const notify = useSnackbar().enqueueSnackbar;
  const [itemName, setItemName] = useState("");
  const [requestFromDate, setRequestFromDate] = useState("");
  const [requestToDate, setRequestToDate] = useState("");
  const [orderName, setOrderName] = useState("");

  const handleSearch = () => {
    dispatch({
      type: "GET_ALL_REQUEST",
      payload: {
        pg_no: "1",
        from_date: requestFromDate,
        to_date: requestToDate,
        name: itemName,
        order_no: orderName,
      },
    });
    dispatch(getAllRequistion(notify));
    props.handlePage();
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
      <Paper
        sx={(theme) => ({
          padding: theme.spacing(4, 3),
        })}
        elevation={0}
      >
        <Grid container spacing={3}>
          <Grid
            item
            size={{ xs: 12, sm: 6, lg: 3 }}
            style={theme.breakpoints.down("sm") && { padding: 7 }}
          >
            <Typography variant="subtitle1" sx={customLabelTypography}>
              Item Name
            </Typography>

            <TextField
              id="container-number"
              value={itemName}
              variant="outlined"
              fullWidth
              size="small"
              onChange={(e) => {
                setItemName(e.target.value);
              }}
            />
          </Grid>
          <Grid
            item
            size={{ xs: 12, sm: 6, lg: 3 }}
            style={theme.breakpoints.down("sm") && { padding: 7 }}
          >
            <Typography variant="subtitle1" sx={customLabelTypography}>
              Order Number
            </Typography>

            <TextField
              id="container-number"
              value={orderName}
              variant="outlined"
              fullWidth
              size="small"
              onChange={(e) => {
                setOrderName(e.target.value);
              }}
            />
          </Grid>

          <Grid
            item
            size={{ xs: 12, sm: 6, lg: 3 }}
            style={theme.breakpoints.down("sm") && { padding: 7 }}
          >
            <Typography variant="subtitle1" sx={customLabelTypography}>
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
            size={{ xs: 12, sm: 6, lg: 3 }}
            style={theme.breakpoints.down("sm") && { padding: 7 }}
          >
            <Typography variant="subtitle1" sx={customLabelTypography}>
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
              width:"100%"
            }}
          >
            <Grid
              item
              size={{ xs: 12 }}
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                width: "100%",
                marginTop: "20px",
              
              }}
            >
              <Button
                sx={{
                  fontSize: 12.5,
                  borderRadius: 2,
                  marginLeft: "auto",
                  marginRight: "auto",
                  marginTop: 8,
                  width: 340,
                  border: "1.5px solid #FDBD2E",
                  boxShadow: "0px 3px 6px #9199A14D",
                  backgroundColor: "#FDBD2E",
                  color: "#fff",
                  "&:hover": {
                    backgroundColor: "#FDBD2E",
                  },
                }}
                onClick={handleSearch}
              >
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
