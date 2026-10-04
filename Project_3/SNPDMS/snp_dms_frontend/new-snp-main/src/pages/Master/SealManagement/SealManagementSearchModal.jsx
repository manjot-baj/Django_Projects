
import React, { useEffect, useState } from "react";
import {
  Typography,
  Paper,
  TextField,
  Grid,
  Box,
  Button,
  FormControlLabel,
  Radio,
  Switch,
  Autocomplete
} from "@mui/material";

import { useDispatch, useSelector } from "react-redux";
import { dropDownDispatch } from "../../../actions/GateInActions";
import { getSealManagementListings } from "../../../actions/master/SealManagementMasterActions";
import { useSnackbar } from "notistack";
import { theme } from "../../../App";
import CustomTextfield from "@components/reusablecomponents/GateInTextField";
import DatePickerField from "@components/reusablecomponents/DatePickerField";
import { customLabelTypography } from "../../../utils/CustomClasses";



export default function SealManagementSearchModal(props) {
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

      <Paper sx={(theme)=>({
        padding: theme.spacing(4, 3),
         
      })} elevation={0}>
        <Grid container spacing={0}>
          <Grid item  size={{xs:12,sm:6,lg:3}}>
            <Typography variant="subtitle1" sx={customLabelTypography}>
              From in date
            </Typography>

            <DatePickerField
              dateId="seal-from-in-date"
              dateValue={fromInDate}
              dispatchType={"SET_SEAL_MANAGEMENT_SEARCH_FROM_IN_DATE"}
              dateChange={handleFromInDateChange}
                 sx={{width:"100%"}}
            />
          </Grid>
          <Grid item  size={{xs:12,sm:6,lg:3}}>
            <Typography variant="subtitle1" sx={customLabelTypography}>
              To in date
            </Typography>

            <DatePickerField
              dateId="seal-to-in-date"
              dateValue={toInDate}
              dispatchType={"SET_SEAL_MANAGEMENT_SEARCH_TO_IN_DATE"}
              dateChange={handleToInDateChange}
            />
          </Grid>

          <Grid item   size={{xs:12,sm:6,lg:3}}>
            <Typography variant="subtitle1" sx={customLabelTypography}>
              From out date
            </Typography>

            <DatePickerField
              dateId="seal-from-out-date"
              dateValue={fromOutDate}
              dateChange={handleFromOutDateChange}
              dispatchType={"SET_SEAL_MANAGEMENT_SEARCH_FROM_OUT_DATE"}
            />
          </Grid>
          <Grid item   size={{xs:12,sm:6,lg:3}}>
            <Typography variant="subtitle1" sx={customLabelTypography}>
              To out date
            </Typography>
            <DatePickerField
              dateId="seal-to-out-date"
              dateValue={toOutDate}
              dateChange={handleToOutDateChange}
              dispatchType={"SET_SEAL_MANAGEMENT_SEARCH_TO_OUT_DATE"}
            />
          </Grid>

          <Grid item   size={{xs:12,sm:6,lg:3}}>
            <Typography variant="subtitle1" sx={customLabelTypography}>
              From In Use Date
            </Typography>
            <DatePickerField
              dateId="seal-from-inuse-date"
              dateValue={fromInUseDate}
              dateChange={handleInUseDateChange}
              dispatchType={"SET_SEAL_MANAGEMENT_SEARCH_FROM_INUSE_DATE"}
            />
          </Grid>

          <Grid item   size={{xs:12,sm:6,lg:3}}>
            <Typography variant="subtitle1" sx={customLabelTypography}>
              To In Use Date
            </Typography>
            <DatePickerField
              dateId="seal-to-inuse-date"
              dateValue={toInUseOutDate}
              dateChange={handleToUseDateChange}
              dispatchType={"SET_SEAL_MANAGEMENT_SEARCH_TO_INUSE_DATE"}
            />
          </Grid>
          <Grid
            item
            size={{xs:12,sm:6,lg:3}}
         
         
          >
            <Typography variant="subtitle1" sx={customLabelTypography}>
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
            size={{xs:12,sm:6,lg:3}}
          
          >
            <Typography variant="subtitle1" sx={customLabelTypography}>
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
              size={{xs:12,sm:6,lg:3}}
          
            >
              <Typography
                variant="subtitle1"
                sx={customLabelTypography}
              >
                Line
              </Typography>
              <Autocomplete
                value={sealLine}
                onChange={(event, newValue) => {
                  setSealLine(newValue);
                }}
                style={{ padding: 0 }}
               sx={{
                "& .MuiAutocomplete-inputRoot[class*='MuiOutlinedInput-root']": {
                  padding: 0,
                 height:"32px"
                },
               }}
                options={gateIn.allDropDown.client_ref_codes.map(
                  (option) => option
                )}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    variant="outlined"
                    sx={{width:"100%"}}
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

          
        </Grid>
        <Grid container style={{ marginTop: "20px" }}>
          <Grid item  size={{xs:12,sm:6}}>
            <Grid
              item
              size={{xs:4}}
          
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "2px 18px 8px 0px",
              }}
            >
              <Typography variant="subtitle2">Seal history?</Typography>
            </Grid>
            <Grid container  size={{xs:4}}>
              <Grid item  size={{xs:10}}>
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
              <Grid item  size={{xs:2}}>
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
          <Grid item  size={{xs:12,sm:6}}>
            <Grid
              item
              size={{xs:6}}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "2px 18px 8px 0px",
              }}
            >
              <Typography variant="subtitle2">Available Seal</Typography>
            </Grid>
            <Grid container  size={{xs:4}}>
              <Grid item  size={{xs:10}}>
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
              <Grid item  size={{xs:2}}>
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

          <Grid container  size={{xs:12,md:5}} style={{ marginTop: "40PX" }}>
            <Grid item  size={{xs:5}}>
              <span>First Allotment</span>
              <Switch
                value={isFirstAllotment}
                defaultChecked
                onChange={(e) => setIsFirstAllotment(e.target.value)}
                inputProps={{ "aria-label": "controlled" }}
              />
            </Grid>
            <Grid item  size={{xs:3}}>
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
            <Grid item  size={{xs:4}}>
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
            marginTop: 4,
          }}
        >
          <Button sx={(theme)=>({
                fontSize: 12.5,
                borderRadius: 2,
                marginLeft: "auto",
                marginRight: "auto",
                marginTop: 4,
                width: "35%",
                border: "1.5px solid #2A5FA5",
                boxShadow: "0px 3px 6px #9199A14D",
                backgroundColor: "#2A5FA5",
                color: "#fff",
                "&:hover": {
                  backgroundColor: "#2A5FA5",
                },
          })} onClick={handleSearch}>
            Search
          </Button>
          <Button sx={(theme)=>({
                fontSize: 12.5,
                borderRadius: 2,
                marginLeft: "auto",
                marginRight: "auto",
                marginTop: 4,
                width: "35%",
                border: "1.5px solid #2A5FA5",
                boxShadow: "0px 3px 6px #9199A14D",
                backgroundColor: "#fff",
                color: "#2A5FA5",
                "&:hover": {
                  backgroundColor: "#fff",
                },
          })} onClick={() => window.location.reload()}>
            Reset
          </Button>
        </Grid>
      </Paper>
    </div>
  );
}