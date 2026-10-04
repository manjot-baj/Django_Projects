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
import { getMNRGrid } from "../actions/MNRGridActions";
import CustomTextfield from "./reusableComponents/GateInTextField";
import DatePickerField from "./reusableComponents/DatePickerField";
import Autocomplete from "@material-ui/lab/Autocomplete";

const useStyles = makeStyles((theme) => ({
  paperContainer: {
    padding: theme.spacing(2, 3),
    marginBottom: 20,
  
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
  choice: {
    backgroundColor: "#fff",
    width: "100%",
    padding: 1,
  },
  searchMNR: {
    padding: theme.spacing(2.5),
    borderRadius: 10,
    [theme.breakpoints.down("sm")]: {
      padding: theme.spacing(1),
      width: "98%",
      marginLeft: "auto",
      marginRight: "auto",
    },
  },
  button2: {
    background: "#FFCCCB",
    margin: 10,
  },
  autocomplete: {
    "& .MuiAutocomplete-inputRoot[class*='MuiOutlinedInput-root']": {
      padding: 0,
    },
  },
}));

const MNRSearchModal = (props) => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const store = useSelector((state) => state);
  const { gateIn, user, MNRGridSearch } = store;
  const [clientName, setClientName] = useState("");
  const [containerNumber, setContainerNumber] = useState("");
  const [fromGateInDate, setFromGateInDate] = useState("");
  const [toGateInDate, setToGateInDate] = useState("");
  const [status, setStatus] = useState("");
  const [refCode, setRefCode] = useState("");
  const [stage, setStage] = useState("");

  useState(user.automatic_mnr_status_change === "True" ? "True" : "False");
  const mapped =
    gateIn.allDropDown &&
    gateIn.allDropDown.client_data &&
    gateIn.allDropDown.client_data.map((obj) => obj.name);
  const filtered =
    mapped && mapped.filter((type, index) => mapped.indexOf(type) === index);

  return (
    <div>
      <Typography
        variant="subtitle2"
        style={{ paddingTop: 14, paddingBottom: 14 }}
      >
        MNR Search
      </Typography>
      <Paper className={classes.paperContainer} elevation={0}>
        <Grid container spacing={3}>
          {gateIn.allDropDown && filtered && (
            <Grid item xs={6} sm={4}>
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
                      dispatch({
                        type: "SET_MNR_SEARCH_CLIENT_NAME",
                        payload: e.target.value,
                      });
                    }}
                    fullWidth
                  />
                )}
              />
            </Grid>
          )}

          <Grid item xs={6} sm={4}>
            <Typography variant="subtitle1" className={classes.LabelTypography}>
              Container Number
            </Typography>

            <CustomTextfield
              id="stocks-allot-container-number"
              value={containerNumber}
              handleChange={(e) => setContainerNumber(e.target.value)}
              dispatchType={"SET_MNR_SEARCH_CONTAINER_NUMBER"}
            />
          </Grid>

          <Grid item xs={6} sm={4}>
            <Typography variant="subtitle1" className={classes.LabelTypography}>
              Stage
            </Typography>
            <TextField
              id="stocks-allot-status"
              select
              value={status}
              variant="outlined"
              fullWidth
              inputProps={{ className: classes.input }}
              className={classes.selectTextField}
              onChange={(e) => {
                setStatus(e.target.value);
                dispatch({
                  type: "SET_MNR_SEARCH_STAGE",
                  payload: e.target.value,
                });
              }}
            >
              <MenuItem key={"Survey"} value={"Survey"}>
                {"Survey"}
              </MenuItem>
              <MenuItem key={"Estimate"} value={"Estimate"}>
                {"Estimate"}
              </MenuItem>
              <MenuItem key={"Approval"} value={"Approval"}>
                {"Approval"}
              </MenuItem>
              <MenuItem key={"Repair"} value={"Repair"}>
                {"Repair"}
              </MenuItem>
              <MenuItem key={"Available"} value={"Available"}>
                {"Available"}
              </MenuItem>
            </TextField>
          </Grid>

          {gateIn.allDropDown && gateIn.allDropDown.client_ref_codes && (
            <Grid item xs={12} sm={6} lg={4}>
              <Typography
                variant="subtitle1"
                className={classes.LabelTypography}
              >
                Line Code
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

          {gateIn.allDropDown && gateIn.allDropDown.stock_stage && (
            <Grid item xs={12} sm={6} lg={4}>
              <Typography
                variant="subtitle1"
                className={classes.LabelTypography}
              >
                Status
              </Typography>
              <Autocomplete
                value={stage}
                onChange={(event, newValue) => {
                  setStage(newValue);
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
                      setStage(e.target.value);
                      dispatch({
                        type: "SET_MNR_SEARCH_STATUS",
                        payload: e.target.value,
                      });
                    }}
                    fullWidth
                  />
                )}
              />
            </Grid>
          )}

          <Grid item xs={6} sm={2}>
            <Typography variant="subtitle1" className={classes.LabelTypography}>
              From Date
            </Typography>
            <DatePickerField
              dateId="stocks-allot-from-date"
              dateValue={fromGateInDate}
              dateChange={(date) => setFromGateInDate(date)}
              dispatchType={"SET_MNR_SEARCH_FROM_DATE"}
            />
          </Grid>

          <Grid item xs={6} sm={2}>
            <Typography variant="subtitle1" className={classes.LabelTypography}>
              To Date
            </Typography>
            <DatePickerField
              dateId="stocks-allot-to-gatein-date"
              dateValue={toGateInDate}
              dateChange={(date) => setToGateInDate(date)}
              dispatchType={"SET_MNR_SEARCH_TO_DATE"}
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
                dispatch(getMNRGrid(MNRGridSearch));
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

export default MNRSearchModal;
