import React, { useState } from "react";
import {
  Typography,
  Paper,
  TextField,
  MenuItem,
  Grid,
  Button,
  Autocomplete
} from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { getMNRGrid } from "../actions/MNRGridActions";
import CustomTextfield from "@components/reusablecomponents/GateInTextField";
import DatePickerField from "@components/reusablecomponents/DatePickerField";
import { customLabelTypography } from "../utils/CustomClasses";



const MNRSearchModal = (props) => {
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

      >
        MNR Search
      </Typography>
      <Paper sx={(theme)=>({
         padding: theme.spacing(1, 1),
       
      })} elevation={0}>
        <Grid container spacing={1}>
          {gateIn.allDropDown && filtered && (
            <Grid item size={{xs:6,sm:4}}>
              <Typography
                variant="subtitle1"
                sx={customLabelTypography}
               
              >
                Client Name
              </Typography>

              <Autocomplete
                value={clientName}
                onChange={(event, newValue) => {
                  setClientName(newValue);
                }}
                style={{ padding: 0 }}
                sx={{
                  "& .MuiAutocomplete-inputRoot[class*='MuiOutlinedInput-root']": {
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

          <Grid item size={{xs:6,sm:4}}>
            <Typography variant="subtitle1" sx={customLabelTypography}>
              Container Number
            </Typography>

            <CustomTextfield
              id="stocks-allot-container-number"
              value={containerNumber}
              handleChange={(e) => setContainerNumber(e.target.value)}
              dispatchType={"SET_MNR_SEARCH_CONTAINER_NUMBER"}
            />
          </Grid>

          <Grid item size={{xs:6,sm:4}}>
            <Typography variant="subtitle1" sx={customLabelTypography}>
              Stage
            </Typography>
            <TextField
              id="stocks-allot-status"
              select
              value={status}
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
            <Grid item size={{xs:12,sm:6,lg:4}} >
              <Typography
                variant="subtitle1"
                sx={customLabelTypography}
              >
                Line Code
              </Typography>
              <Autocomplete
                value={refCode}
                onChange={(event, newValue) => {
                  setRefCode(newValue);
                }}
                style={{ padding: 0 }}
                sx={{
                  "& .MuiAutocomplete-inputRoot[class*='MuiOutlinedInput-root']": {
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
            <Grid item size={{xs:12,sm:6,lg:4}}>
              <Typography
                variant="subtitle1"
                sx={customLabelTypography}
              >
                Status
              </Typography>
              <Autocomplete
                value={stage}
                onChange={(event, newValue) => {
                  setStage(newValue);
                }}
                style={{ padding: 0 }}
                sx={{
                  "& .MuiAutocomplete-inputRoot[class*='MuiOutlinedInput-root']": {
                    padding: 0,
                  },
                }}
                options={ gateIn?.allDropDown?.stock_stage.map((option) => option)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    variant="outlined"
                 
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

          <Grid item size={{xs:6,sm:2}} >
            <Typography variant="subtitle1" sx={customLabelTypography}>
              From Date
            </Typography>
            <DatePickerField
              dateId="stocks-allot-from-date"
              dateValue={fromGateInDate}
              dateChange={(date) => setFromGateInDate(date)}
              dispatchType={"SET_MNR_SEARCH_FROM_DATE"}
            />
          </Grid>

          <Grid item size={{xs:6,sm:2}} >
            <Typography variant="subtitle1" sx={customLabelTypography}>
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
