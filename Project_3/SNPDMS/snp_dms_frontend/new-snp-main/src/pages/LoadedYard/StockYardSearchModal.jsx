import React, { useState } from "react";
import {
  Typography,
  Paper,
  TextField,
  MenuItem,
  Grid,
  Button,
  Box
} from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { searchLoadedYardDispatch } from "../../actions/LoadedYardActions";
import CustomTextfield from "@components/reusablecomponents/GateInTextField";
import { theme } from "../../App";



const StockYardSearchModal = (props) => {

  const dispatch = useDispatch();
  const store = useSelector((state) => state);
  const { loadedYardSearch } = store;
  const [bookingNo, setBookingNo] = useState("");
  const [containerNumber, setContainerNumber] = useState("");
  const [size, setSize] = useState("");
  const [port, setPort] = useState("");
  const [processType, setProcessType] = useState("");

  return (
    <Box sx={{
      "& MuiGrid-root": {
        float: "right",
      },
    }}>
      <Typography
        variant="subtitle2"
        style={{ paddingTop: 14, paddingBottom: 14 }}
      >
        Loaded Yard Search
      </Typography>
      <Paper sx={(theme)=>({
          padding: theme.spacing(2, 3),
          marginBottom: 20,
      })} elevation={0}>
        <Grid container spacing={3}>
          <Grid item xs={3} sm={3} lg={3}>
            <Typography variant="subtitle1" sx={customLabelTypography}>
              Container Number
            </Typography>

            <CustomTextfield
              id="stocks-allot-container-number"
              value={containerNumber}
              handleChange={(e) => setContainerNumber(e.target.value)}
              dispatchType={"LOADEDYARD_CONTAINER_NUMBER_SEARCH"}
            />
          </Grid>
          <Grid
            item
            xs={3}
            sm={3}
            lg={3}
            style={theme.breakpoints.down("sm") && { padding: 7 }}
          >
            <Typography variant="subtitle1" sx={customLabelTypography}>
              Booking Number
            </Typography>
            <CustomTextfield
              id="tare-weight"
              handleChange={(e) => setBookingNo(e.target.value)}
              value={bookingNo}
              dispatchType={"LOADEDYARD_BOOKING_NUMBER_SEARCH"}
            />
          </Grid>
          <Grid
            item
            xs={3}
            sm={3}
            lg={3}
            style={theme.breakpoints.down("sm") && { padding: 7 }}
          >
            <Typography variant="subtitle1" sx={customLabelTypography}>
              Size
            </Typography>
            <CustomTextfield
              id="container-size"
              value={size}
              handleChange={(e) => {
                setSize(e.target.value);
              }}
              dispatchType={"LOADEDYARD_SIZE_SEARCH"}
            />
          </Grid>
          <Grid
            item
            xs={3}
            sm={3}
            lg={3}
            style={theme.breakpoints.down("sm") && { padding: 7 }}
          >
            <Typography variant="subtitle1" sx={customLabelTypography}>
              Port
            </Typography>
            <CustomTextfield
              id="port"
              value={port}
              handleChange={(e) => {
                setPort(e.target.value);
              }}
              dispatchType={"LOADEDYARD_PORT_SEARCH"}
            />
          </Grid>
          <Grid item xs={3} sm={3} lg={3}>
            <Typography variant="subtitle1" sx={customLabelTypography}>
              Processs Type
            </Typography>
            <TextField
              id="stocks-allot-status"
              select
              value={processType}
              variant="outlined"
              fullWidth
              size="small"
              sx={{
                "& .MuiOutlinedInput-root": {
                  "& fieldset": {
                    borderColor: "#243545",
                  },
                },
              }}
              onChange={(e) => {
                setProcessType(e.target.value);
                dispatch({
                  type: "LOADEDYARD_PROCESSTYPE_SEARCH",
                  payload: e.target.value,
                });
              }}
            >
              <MenuItem key={"IN"} value={"IN"}>
                {"IN"}
              </MenuItem>
              <MenuItem key={"OUT"} value={"OUT"}>
                {"OUT"}
              </MenuItem>
            </TextField>
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
              sx={(theme)=>({
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
              })}
              onClick={() => {
                dispatch(searchLoadedYardDispatch(loadedYardSearch));
                props.handleClose();
              }}
            >
              Search
            </Button>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default StockYardSearchModal;
