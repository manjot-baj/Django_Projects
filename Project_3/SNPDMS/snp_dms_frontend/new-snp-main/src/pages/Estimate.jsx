import React, { useEffect, useState } from "react";

import {
  Grid,
  Button,
  Typography,
  Paper,
  useMediaQuery,
  AppBar,
  Tabs,
  TextField,
  MenuItem,
  Box,
} from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { useSnackbar } from "notistack";
import CustomTextfield from "@components/reusablecomponents/GateInTextField";
import DatePickerField from "@components/reusablecomponents/DatePickerField";
import {
  createEstimate,
  updateEstimate,
  calculateEstimate,
  ediFtpUploadEstimate,
  imgFtpUploadEstimate,
} from "../actions/MNRProcessActions";
import { customLabelTypography } from "../utils/CustomClasses";

export const EstimateDemo = () => {
  const [org_date, setOrgDate] = useState("");
  const [org_time, setOrgTime] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [current_date, setCurrentDate] = useState("");
  const [current_time, setCurrentTime] = useState("");
  const [updated_by, setUpdatedBy] = useState("");
  const [created_by, setCreatedBy] = useState("");

  const [masterDamageComponent, setMasterDamageComponent] = useState([
    {
      main_component: "",
      component_code: "",
      component_description: "",
      location_code: "",
      location_description: "",
      damage_code: "",
      damage_description: "",
      material_code: "",
      material_description: "",
      repair_code: "",
      repair_description: "",
      unit: "",
      measurement: "",
      length_and_width: "",
      quantity: "",
      labour_cost: "",
      labour_hrs_tariff: "",
      material_tariff: "",
      wash_clean_tariff: "",
      total_cost: "",
      remarks: "",
    },
  ]);

  const [masterCleaningComponent, setMasterCleaningComponent] = useState([
    {
      main_component: "",
      component_code: "",
      component_description: "",
      location_code: "",
      location_description: "",
      damage_code: "",
      damage_description: "",
      material_code: "",
      material_description: "",
      repair_code: "",
      repair_description: "",
      unit: "",
      measurement: "",
      length_and_width: "",
      quantity: "",
      labour_cost: "",
      labour_hrs_tariff: "",
      material_tariff: "",
      wash_clean_tariff: "",
      total_cost: "",
      remarks: "",
    },
  ]);

  // (Estimate State)
  const [estimate_no, setEstimateNumber] = useState("");
  const [estimate_by, setEstimateBy] = useState("");
  const [estimate_amount, setEstimateAmount] = useState("");
  const [original_amount, setOriginalAmount] = useState("");
  const [current_amount, setCurrentAmount] = useState("");
  const [showEst, setShowEst] = useState(false);

  const dispatch = useDispatch();
  const store = useSelector((state) => state);
  const { MNRProcess, MNRGridSearch } = store;
  console.log(MNRProcess, MNRGridSearch, "log---111");
  const notify = useSnackbar().enqueueSnackbar;
  const matchesIphone = useMediaQuery("(max-width:400px)");

  useEffect(() => {
    if (MNRProcess.mnrProcessData.estimate) {
      setEstimateNumber(MNRProcess.mnrProcessData.estimate.number);
      setOrgDate(MNRProcess.mnrProcessData.estimate.original_date);
      setOrgTime(MNRProcess.mnrProcessData.estimate.original_time);
      setDate(MNRProcess.mnrProcessData.estimate.date);
      setTime(MNRProcess.mnrProcessData.estimate.time);
      setCurrentDate(MNRProcess.mnrProcessData.estimate.current_date);
      setCurrentTime(MNRProcess.mnrProcessData.estimate.current_time);
      setEstimateBy(MNRProcess.mnrProcessData.estimate.estimate_by);
      setUpdatedBy(MNRProcess.mnrProcessData.estimate.updated_by);
      setCreatedBy(MNRProcess.mnrProcessData.estimate.created_by);
      setEstimateAmount(MNRProcess.mnrProcessData.estimate.amount);
      setOriginalAmount(MNRProcess.mnrProcessData.estimate.original_amount);
      setCurrentAmount(MNRProcess.mnrProcessData.estimate.current_amount);
      MNRProcess.mnrProcessData.estimate.survey_lines.damage_lines !== 0 &&
        setMasterDamageComponent(
          MNRProcess.mnrProcessData.estimate.survey_lines.damage_lines
        );
      MNRProcess.mnrProcessData.estimate.survey_lines.cleaning_lines !== 0 &&
        setMasterCleaningComponent(
          MNRProcess.mnrProcessData.estimate.survey_lines.cleaning_lines
        );
    }
  }, [MNRProcess.mnrProcessData]);

  useEffect(() => {
    if (
      MNRProcess.mnrProcessData.estimate &&
      MNRProcess.mnrProcessData.estimate.survey_lines
    ) {
      if (
        MNRProcess.mnrProcessData.estimate.survey_lines.damage_lines.length > 0
      ) {
        for (
          let i = 0;
          i <
          MNRProcess.mnrProcessData.estimate.survey_lines.damage_lines.length;
          i++
        ) {
          if (
            MNRProcess.mnrProcessData.estimate.survey_lines.damage_lines[i]
              .tariff_field_enabled === "True"
          ) {
            setShowEst(true);
          }
        }
      } else if (
        MNRProcess.mnrProcessData.estimate &&
        MNRProcess.mnrProcessData.estimate.survey_lines &&
        MNRProcess.mnrProcessData.estimate.survey_lines.cleaning_lines.length >
          0
      ) {
        for (
          let i = 0;
          i <
          MNRProcess.mnrProcessData.estimate.survey_lines.cleaning_lines.length;
          i++
        ) {
          if (
            MNRProcess.mnrProcessData.estimate.survey_lines.cleaning_lines[i]
              .tariff_field_enabled === "True"
          ) {
            setShowEst(true);
          }
        }
      }
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [MNRProcess.mnrProcessData && MNRProcess.mnrProcessData.estimate]);

  const handleDateChange = (date) => {
    var selectedDate = new Date(date);
    var dd = String(selectedDate.getDate()).padStart(2, "0");
    var mm = String(selectedDate.getMonth() + 1).padStart(2, "0");
    var yyyy = selectedDate.getFullYear();
    var selectedDateFormat = yyyy + "-" + mm + "-" + dd;
    setDate(selectedDateFormat);
  };

  const handleChangeTextField = (index, event, keyVal) => {
    const values = [...masterDamageComponent];
    values[index][keyVal] = event.target.value;
    setMasterDamageComponent(values);
  };

  const handleChangeInput = (index, event, keyVal) => {
    const values = [...masterDamageComponent];

    values[index][keyVal] = event.target.value;
    values[index]["component_code"] = "";
    values[index]["component_description"] = "";
    values[index]["location_code"] = "";
    values[index]["location_description"] = "";
    values[index]["damage_code"] = "";
    values[index]["damage_description"] = "";
    values[index]["material_code"] = "";
    values[index]["material_description"] = "";
    values[index]["repair_code"] = "";
    values[index]["repair_description"] = "";
    values[index]["unit"] = "";
    values[index]["measurement"] = "";
    values[index]["length_and_width"] = "";
    values[index]["quantity"] = "";
    values[index]["remarks"] = "";

    setMasterDamageComponent(values);
  };

  const handleCalculateEstimate = () => {
    let req = {
      damage_lines:
        MNRProcess.mnrProcessData.estimate.survey_lines.damage_lines,
      cleaning_lines:
        MNRProcess.mnrProcessData.estimate.survey_lines.cleaning_lines,
      reload_container_no:
        MNRProcess.mnrProcessData.container_data &&
        MNRProcess.mnrProcessData.container_data.container_no,
      reload_container_date:
        MNRProcess.mnrProcessData.container_data &&
        MNRProcess.mnrProcessData.container_data.in_date,
    };
    dispatch(calculateEstimate(req, notify));
  };

  return (
    <>
      <Paper
        sx={(theme) => ({
          padding: 1,

          width: matchesIphone ? "300px" : undefined,
        })}
        elevation={0}
      >
        <Paper
          sx={(theme) => ({
            padding: matchesIphone ? theme.spacing(1, 2) : theme.spacing(2, 3),
            marginBottom: 8,
            marginLeft: matchesIphone ? "-10px" : undefined,
            width: matchesIphone ? "300px" : undefined,
          })}
          elevation={2}
        >
          <Grid container spacing={3}>
            <Grid item size={{ xs: 12, sm: 3 }}>
              <Typography variant="subtitle1" sx={customLabelTypography}>
                Estimate Number
              </Typography>
              <CustomTextfield
                id="stocks-allot-container-number"
                value={estimate_no}
                handleChange={(e) => setEstimateNumber(e.target.value)}
                dispatchType={"SET_MNR_SEARCH_CONTAINER_NUMBER"}
                readOnlyP
              />
            </Grid>

            <Grid item size={{ xs: 12, sm: 3 }}>
              <Typography variant="subtitle1" sx={customLabelTypography}>
                Original Date
              </Typography>
              <CustomTextfield
                id="stocks-allot-container-number"
                value={org_date}
                handleChange={(e) => setOrgDate(e.target.value)}
                dispatchType={"SET_MNR_SEARCH_CONTAINER_NUMBER"}
                readOnlyP
              />
            </Grid>

            <Grid
              item
              size={{ xs: 6, sm: 3 }}
              style={{ alignSelf: "flex-end" }}
            >
              <Typography variant="subtitle1" sx={customLabelTypography}>
                Original Time
              </Typography>
              <CustomTextfield
                id="stocks-allot-container-number"
                value={org_time}
                handleChange={(e) => setOrgTime(e.target.value)}
                dispatchType={"SET_MNR_SEARCH_CONTAINER_NUMBER"}
                readOnlyP
              />
            </Grid>

            {MNRProcess.mnrProcessData.estimate &&
            MNRProcess.mnrProcessData.estimate.is_locked === "True" ? (
              <Grid item size={{ xs: 6, sm: 3 }}>
                <Typography variant="subtitle1" sx={customLabelTypography}>
                  Date <span style={{ color: "red" }}>*</span>
                </Typography>
                <CustomTextfield
                  id="in-date"
                  handleChange={handleDateChange}
                  value={date}
                  dispatchType={"SET_IN_DATE_MNR"}
                  readOnlyP
                />
              </Grid>
            ) : (
              <Grid
                item
                size={{ xs: 6, sm: 3 }}
                style={{ alignSelf: "flex-end" }}
              >
                <Typography variant="subtitle1" sx={customLabelTypography}>
                  Date
                </Typography>
                <DatePickerField
                  dateId="stocks-allot-from-getin-date"
                  dateValue={date}
                  dateChange={handleDateChange}
                />
              </Grid>
            )}

            {MNRProcess.mnrProcessData.estimate &&
            MNRProcess.mnrProcessData.estimate.is_locked === "True" ? (
              <Grid
                item
                size={{ xs: 6, sm: 3 }}
                style={{ alignSelf: "flex-end" }}
              >
                <Typography variant="subtitle1" sx={customLabelTypography}>
                  Time <span style={{ color: "red" }}>*</span>
                </Typography>
                <CustomTextfield
                  id="in-time"
                  type="time"
                  handleChange={(e) => setTime(e.target.value)}
                  value={time}
                  dispatchType={"SET_IN_TIME_MNR"}
                  readOnlyP
                />
              </Grid>
            ) : (
              <Grid
                item
                size={{ xs: 6, sm: 3 }}
                style={{ alignSelf: "flex-end" }}
              >
                <Typography variant="subtitle1" sx={customLabelTypography}>
                  Time <span style={{ color: "red" }}>*</span>
                </Typography>
                <CustomTextfield
                  id="in-time"
                  type="time"
                  handleChange={(e) => setTime(e.target.value)}
                  value={time}
                  dispatchType={"SET_IN_TIME_MNR"}
                />
              </Grid>
            )}

            <Grid item size={{ xs: 6, sm: 3 }}>
              <Typography variant="subtitle1" sx={customLabelTypography}>
                Current Date
              </Typography>
              <CustomTextfield
                id="stocks-allot-container-number"
                value={current_date}
                handleChange={(e) => setCurrentDate(e.target.value)}
                dispatchType={"SET_MNR_SEARCH_CONTAINER_NUMBER"}
                readOnlyP
              />
            </Grid>

            <Grid
              Grid
              item
              size={{ xs: 6, sm: 3 }}
              style={{ alignSelf: "flex-end" }}
            >
              <Typography variant="subtitle1" sx={customLabelTypography}>
                Current Time
              </Typography>
              <CustomTextfield
                id="stocks-allot-container-number"
                value={current_time}
                handleChange={(e) => setCurrentTime(e.target.value)}
                dispatchType={"SET_MNR_SEARCH_CONTAINER_NUMBER"}
                readOnlyP
              />
            </Grid>

            <Grid
              item
              size={{ xs: 6, sm: 3 }}
              style={{ alignSelf: "flex-end" }}
            >
              <Typography variant="subtitle1" sx={customLabelTypography}>
                Estimate By <span style={{ color: "red" }}>*</span>
              </Typography>

              <TextField
                id="stock-and-allotment-location"
                select
                value={estimate_by}
                variant="outlined"
                fullWidth
                size="small"
                onChange={(e) => {
                  setEstimateBy(e.target.value);
                }}
                disabled={
                  MNRProcess.mnrProcessData.estimate &&
                  MNRProcess.mnrProcessData.estimate.is_locked === "True"
                }
              >
                {MNRProcess.mnrProcessData &&
                  MNRProcess.mnrProcessData.staff_data &&
                  MNRProcess.mnrProcessData.staff_data.edp_list &&
                  MNRProcess.mnrProcessData.staff_data.edp_list.map(
                    (option) => (
                      <MenuItem key={option.pk} value={option.pk}>
                        {option.firstName} {option.lastName}
                      </MenuItem>
                    )
                  )}
              </TextField>
            </Grid>

            <Grid item size={{ xs: 6, sm: 3 }}>
              <Typography variant="subtitle1" sx={customLabelTypography}>
                Updated By
              </Typography>

              <CustomTextfield
                id="stocks-allot-container-number"
                value={updated_by}
                handleChange={(e) => setUpdatedBy(e.target.value)}
                dispatchType={"SET_MNR_SEARCH_CONTAINER_NUMBER"}
                readOnlyP
              />
            </Grid>

            <Grid item size={{ xs: 6, sm: 3 }}>
              <Typography variant="subtitle1" sx={customLabelTypography}>
                Created By
              </Typography>

              <CustomTextfield
                id="stocks-allot-container-number"
                value={created_by}
                handleChange={(e) => setCreatedBy(e.target.value)}
                dispatchType={"SET_MNR_SEARCH_CONTAINER_NUMBER"}
                readOnlyP
              />
            </Grid>

            <Grid item size={{ xs: 6, sm: 3 }}>
              <Typography variant="subtitle1" sx={customLabelTypography}>
                Amount
              </Typography>
              <CustomTextfield
                id="stocks-allot-container-number"
                value={estimate_amount}
                handleChange={(e) => setEstimateAmount(e.target.value)}
                dispatchType={"SET_MNR_SEARCH_CONTAINER_NUMBER"}
                readOnlyP
              />
            </Grid>

            <Grid item size={{ xs: 6, sm: 3 }}>
              <Typography variant="subtitle1" sx={customLabelTypography}>
                Original Amount
              </Typography>
              <CustomTextfield
                id="stocks-allot-container-number"
                value={original_amount}
                handleChange={(e) => setOriginalAmount(e.target.value)}
                dispatchType={"SET_MNR_SEARCH_CONTAINER_NUMBER"}
                readOnlyP
              />
            </Grid>

            <Grid item size={{ xs: 6, sm: 3 }}>
              <Typography variant="subtitle1" sx={customLabelTypography}>
                Current Amount
              </Typography>
              <CustomTextfield
                id="stocks-allot-container-number"
                value={current_amount}
                handleChange={(e) => setCurrentAmount(e.target.value)}
                dispatchType={"SET_MNR_SEARCH_CONTAINER_NUMBER"}
                readOnlyP
              />
            </Grid>
          </Grid>
        </Paper>
        <Paper
          sx={(theme) => ({
            padding: 1,
            marginBottom: 12,
            maxHeight: "500px",
            overflowX: "hidden",
            marginLeft: matchesIphone ? "-10px" : undefined,
            width: matchesIphone ? "300px" : undefined,
          })}
          elevation={2}
        >
          <Typography variant="subtitle1" sx={customLabelTypography}>
            Damage Lines
          </Typography>
          {masterDamageComponent.map((masterState, index) => (
            <Box
              key={index}
              style={{ display: "flex", overflowX: "scroll" }}
              sx={(theme) => ({
                "&::-webkit-scrollbar": {
                  height: "5px",
                  display: "none",
                },
                [theme.breakpoints.down("lg")]: {
                  "&::-webkit-scrollbar": {
                    display: "block !important",
                    height: "5px",
                  },
                },
              })}
            >
              <AppBar
                position="static"
                color="#FFFFFF"
                sx={(theme) => ({
                  minWidth: 1200,
                  padding: "10px",
                  marginBottom: "10px",
                  paddingBottom: "15px",
                  borderRadius: 1,
                  [theme.breakpoints.down("xs")]: {
                    marginLeft: "-10px",
                    width: "110%",
                  },
                })}
              >
                <Tabs
                  indicatorColor="primary"
                  textColor="primary"
                  variant="scrollable"
                  scrollButtons="auto"
                  aria-label="scrollable auto tabs example"
                  style={{ minHeight: "70px" }}
                >
                  <Grid
                    item
                    size={{ md: 4, lg: 3 }}
                    style={{ alignSelf: "flex-end", paddingRight: "10px" }}
                  >
                    <Typography
                      variant="subtitle1"
                      sx={customLabelTypography}
                      style={{ fontSize: 8 }}
                    >
                      Main Component
                    </Typography>
                    <CustomTextfield
                      id="stocks-allot-container-number"
                      value={masterState && masterState.main_component}
                      dispatchType={"SET_MNR_ESTIMATE_MAIN_COMPONENT"}
                      readOnlyP
                    />
                  </Grid>

                  <Grid
                    item
                    size={{ md: 4, lg: 2 }}
                    style={{ alignSelf: "flex-end", paddingRight: "10px" }}
                  >
                    <Typography
                      variant="subtitle1"
                      sx={customLabelTypography}
                      style={{ fontSize: 8 }}
                    >
                      Component
                    </Typography>
                    <CustomTextfield
                      id="stocks-allot-container-number"
                      value={masterState && masterState.component_code}
                      dispatchType={"SET_MNR_ESTIMATE_COMPONENT"}
                      readOnlyP
                    />
                  </Grid>

                  <Grid
                    item
                    size={{ md: 4, lg: 2 }}
                    style={{ alignSelf: "flex-end", paddingRight: "10px" }}
                  >
                    <Typography
                      variant="subtitle1"
                      sx={customLabelTypography}
                      style={{ fontSize: 8 }}
                    >
                      Location
                    </Typography>
                    <CustomTextfield
                      id="stocks-allot-container-number"
                      value={masterState && masterState.location_code}
                      dispatchType={"SET_MNR_ESTIMATE_LOCATION"}
                      readOnlyP
                    />
                  </Grid>

                  <Grid
                    item
                    size={{ md: 4, lg: 2 }}
                    style={{ alignSelf: "flex-end", paddingRight: "10px" }}
                  >
                    <Typography
                      variant="subtitle1"
                      sx={customLabelTypography}
                      style={{ fontSize: 8 }}
                    >
                      Specific Location
                    </Typography>
                    <CustomTextfield
                      id="stocks-allot-container-number"
                      value={masterState && masterState.specific_location_code}
                      dispatchType={"SET_MNR_ESTIMATE_SPECIFIC_LOCATION"}
                      readOnlyP
                    />
                  </Grid>

                  <Grid
                    item
                    size={{ md: 4, lg: 2 }}
                    style={{ alignSelf: "flex-end", paddingRight: "10px" }}
                  >
                    <Typography
                      variant="subtitle1"
                      sx={customLabelTypography}
                      style={{ fontSize: 8, marginLeft: 6 }}
                    >
                      Damage
                    </Typography>
                    <CustomTextfield
                      id="stocks-allot-container-number"
                      value={masterState && masterState.damage_code}
                      dispatchType={"SET_MNR_ESTIMATE_DAMAGE"}
                      readOnlyP
                    />
                  </Grid>

                  <Grid
                    item
                    size={{ md: 4, lg: 2 }}
                    style={{ alignSelf: "flex-end", paddingRight: "10px" }}
                  >
                    <Typography
                      variant="subtitle1"
                      sx={customLabelTypography}
                      style={{ fontSize: 8 }}
                    >
                      Material
                    </Typography>
                    <CustomTextfield
                      id="stocks-allot-container-number"
                      value={masterState && masterState.material_code}
                      dispatchType={"SET_MNR_ESTIMATE_MATERIAL"}
                      readOnlyP
                    />
                  </Grid>

                  <Grid
                    item
                    size={{ md: 4, lg: 2 }}
                    style={{ alignSelf: "flex-end", paddingRight: "10px" }}
                  >
                    <Typography
                      variant="subtitle1"
                      sx={customLabelTypography}
                      style={{ fontSize: 8 }}
                    >
                      Repair
                    </Typography>
                    <CustomTextfield
                      id="stocks-allot-container-number"
                      value={masterState && masterState.repair_code}
                      dispatchType={"SET_MNR_ESTIMATE_REPAIR"}
                      readOnlyP
                    />
                  </Grid>
                  <Grid
                    item
                    size={{ md: 4, lg: 2 }}
                    style={{ alignSelf: "flex-end", paddingRight: "10px" }}
                  >
                    <Typography
                      variant="subtitle1"
                      sx={customLabelTypography}
                      style={{ fontSize: 8 }}
                    >
                      Measurement
                    </Typography>
                    <CustomTextfield
                      id="stocks-allot-container-number"
                      value={masterState && masterState.measurement}
                      dispatchType={"SET_MNR_ESTIMATE_MEASUREMENT"}
                      readOnlyP
                    />
                  </Grid>

                  <Grid
                    item
                    size={{ md: 4, lg: 2 }}
                    style={{ alignSelf: "flex-end", paddingRight: "10px" }}
                  >
                    <Typography
                      variant="subtitle1"
                      sx={customLabelTypography}
                      style={{ fontSize: 8 }}
                    >
                      L/W
                    </Typography>
                    <CustomTextfield
                      id="stocks-allot-container-number"
                      value={masterState && masterState.length_and_width}
                      dispatchType={"SET_MNR_ESTIMATE_LW"}
                      readOnlyP
                    />
                  </Grid>
                  <Grid
                    item
                    size={{ md: 4, lg: 2 }}
                    style={{ alignSelf: "flex-end", paddingRight: "10px" }}
                  >
                    <Typography
                      variant="subtitle1"
                      sx={customLabelTypography}
                      style={{ fontSize: 8 }}
                    >
                      Qty
                    </Typography>
                    <CustomTextfield
                      id="stocks-allot-container-number"
                      value={masterState && masterState.quantity}
                      dispatchType={"SET_MNR_ESTIMATE_QUANTITY"}
                      readOnlyP
                    />
                  </Grid>

                  <Grid
                    item
                    size={{ md: 4, lg: 3 }}
                    style={{ alignSelf: "flex-end", paddingRight: "10px" }}
                  >
                    <Typography
                      variant="subtitle1"
                      sx={customLabelTypography}
                      style={{ fontSize: 8 }}
                    >
                      Labour Hrs Tariff
                    </Typography>
                    {masterState.tariff_field_enabled === "True" ? (
                      <CustomTextfield
                        id="stocks-allot-container-number"
                        value={masterState && masterState.labour_hrs_tariff}
                        handleChange={(event) =>
                          handleChangeTextField(
                            index,
                            event,
                            "labour_hrs_tariff"
                          )
                        }
                        onBlur={(event) =>
                          handleChangeInput(index, event, "labour_hrs_tariff")
                        }
                        dispatchType={"SET_MNR_ESTIMATE_LABOUR_RATE"}
                      />
                    ) : (
                      <CustomTextfield
                        id="stocks-allot-container-number"
                        value={masterState && masterState.labour_hrs_tariff}
                        dispatchType={"SET_MNR_ESTIMATE_LABOUR_RATE"}
                        readOnlyP
                      />
                    )}
                  </Grid>

                  <Grid
                    item
                    size={{ md: 4, lg: 2 }}
                    style={{ alignSelf: "flex-end", paddingRight: "10px" }}
                  >
                    <Typography
                      variant="subtitle1"
                      sx={customLabelTypography}
                      style={{ fontSize: 8 }}
                    >
                      Material Tariff
                    </Typography>
                    {masterState.tariff_field_enabled === "True" ? (
                      <CustomTextfield
                        id="stocks-allot-container-number"
                        value={masterState && masterState.material_tariff}
                        handleChange={(event) =>
                          handleChangeTextField(index, event, "material_tariff")
                        }
                        onBlur={(event) =>
                          handleChangeInput(index, event, "material_tariff")
                        }
                        dispatchType={"SET_MNR_ESTIMATE_LABOUR_RATE"}
                      />
                    ) : (
                      <CustomTextfield
                        id="stocks-allot-container-number"
                        value={masterState && masterState.material_tariff}
                        dispatchType={"SET_MNR_ESTIMATE_LABOUR_RATE"}
                        readOnlyP
                      />
                    )}
                  </Grid>

                  <Grid
                    item
                    size={{ md: 4, lg: 2 }}
                    style={{ alignSelf: "flex-end", paddingRight: "10px" }}
                  >
                    <Typography
                      variant="subtitle1"
                      sx={customLabelTypography}
                      style={{ fontSize: 8 }}
                    >
                      Labour Cost
                    </Typography>

                    <CustomTextfield
                      id="stocks-allot-container-number"
                      value={masterState && masterState.labour_cost}
                      dispatchType={"SET_MNR_ESTIMATE_LABOUR_RATE"}
                      readOnlyP
                    />
                  </Grid>

                  <Grid
                    item
                    size={{ md: 4, lg: 2 }}
                    style={{ alignSelf: "flex-end", paddingRight: "10px" }}
                  >
                    <Typography
                      variant="subtitle1"
                      sx={customLabelTypography}
                      style={{ fontSize: 8 }}
                    >
                      Total Cost
                    </Typography>
                    <CustomTextfield
                      id="stocks-allot-container-number"
                      value={masterState && masterState.total_cost}
                      dispatchType={"SET_MNR_ESTIMATE_TOTAL_COST"}
                      readOnlyP
                    />
                  </Grid>

                  <Grid
                    item
                    size={{ md: 4, lg: 2 }}
                    style={{ alignSelf: "flex-end", paddingRight: "10px" }}
                  >
                    <Typography
                      variant="subtitle1"
                      sx={customLabelTypography}
                      style={{ fontSize: 8 }}
                    >
                      Remarks
                    </Typography>

                    <CustomTextfield
                      id="mnr-estimate-remarks"
                      value={masterState && masterState.remarks}
                      dispatchType={"SET_MNR_ESTIMATE_REMARKS"}
                      readOnlyP
                    />
                  </Grid>
                </Tabs>
              </AppBar>
            </Box>
          ))}
          <Typography variant="subtitle1" sx={customLabelTypography}>
            Cleaning Lines
          </Typography>
          {masterCleaningComponent.map((masterState, index) => (
            <Box
              key={index}
              style={{ display: "flex", overflowX: "scroll" }}
              sx={(theme) => ({
                "&::-webkit-scrollbar": {
                  height: "5px",
                  display: "none",
                },
                [theme.breakpoints.down("lg")]: {
                  "&::-webkit-scrollbar": {
                    display: "block !important",
                    height: "5px",
                  },
                },
              })}
            >
              <AppBar
                position="static"
                color="#FFFFFF"
                sx={(theme) => ({
                  minWidth: 1200,
                  padding: "10px",
                  marginBottom: "10px",
                  paddingBottom: "15px",
                  borderRadius: 1,
                  [theme.breakpoints.down("xs")]: {
                    marginLeft: "-10px",
                    width: "110%",
                  },
                })}
              >
                <Tabs
                  indicatorColor="primary"
                  textColor="primary"
                  variant="scrollable"
                  scrollButtons="auto"
                  aria-label="scrollable auto tabs example"
                  style={{ minHeight: "70px" }}
                >
                  <Grid
                    item
                    size={{ xs: 4, sm: 2 }}
                    style={{ alignSelf: "flex-end", paddingRight: "10px" }}
                  >
                    <Typography
                      variant="subtitle1"
                      sx={customLabelTypography}
                      style={{ fontSize: 8 }}
                    >
                      Main Component
                    </Typography>
                    <CustomTextfield
                      id="stocks-allot-container-number"
                      value={masterState && masterState.main_component}
                      dispatchType={"SET_MNR_ESTIMATE_MAIN_COMPONENT"}
                      readOnlyP
                    />
                  </Grid>

                  <Grid
                    item
                    size={{ xs: 4, sm: 2 }}
                    style={{ alignSelf: "flex-end", paddingRight: "10px" }}
                  >
                    <Typography
                      variant="subtitle1"
                      sx={customLabelTypography}
                      style={{ fontSize: 8 }}
                    >
                      Component
                    </Typography>
                    <CustomTextfield
                      id="stocks-allot-container-number"
                      value={masterState && masterState.component_code}
                      dispatchType={"SET_MNR_ESTIMATE_COMPONENT"}
                      readOnlyP
                    />
                  </Grid>

                  <Grid
                    item
                    size={{ xs: 4, sm: 2 }}
                    style={{ alignSelf: "flex-end", paddingRight: "10px" }}
                  >
                    <Typography
                      variant="subtitle1"
                      sx={customLabelTypography}
                      style={{ fontSize: 8 }}
                    >
                      Location
                    </Typography>
                    <CustomTextfield
                      id="stocks-allot-container-number"
                      value={masterState && masterState.location_code}
                      dispatchType={"SET_MNR_ESTIMATE_LOCATION"}
                      readOnlyP
                    />
                  </Grid>

                  <Grid
                    item
                    size={{ xs: 4, sm: 2 }}
                    style={{ alignSelf: "flex-end", paddingRight: "10px" }}
                  >
                    <Typography
                      variant="subtitle1"
                      sx={customLabelTypography}
                      style={{ fontSize: 8 }}
                    >
                      Specific Location
                    </Typography>
                    <CustomTextfield
                      id="stocks-allot-container-number"
                      value={masterState && masterState.specific_location_code}
                      dispatchType={"SET_MNR_ESTIMATE_SPECIFIC_LOCATION"}
                      readOnlyP
                    />
                  </Grid>

                  <Grid
                    item
                    size={{ xs: 4, sm: 2 }}
                    style={{ alignSelf: "flex-end", paddingRight: "10px" }}
                  >
                    <Typography
                      variant="subtitle1"
                      sx={customLabelTypography}
                      style={{ fontSize: 8, marginLeft: 6 }}
                    >
                      Damage
                    </Typography>
                    <CustomTextfield
                      id="stocks-allot-container-number"
                      value={masterState && masterState.damage_code}
                      dispatchType={"SET_MNR_ESTIMATE_DAMAGE"}
                      readOnlyP
                    />
                  </Grid>

                  <Grid
                    item
                    size={{ xs: 4, sm: 2 }}
                    style={{ alignSelf: "flex-end", paddingRight: "10px" }}
                  >
                    <Typography
                      variant="subtitle1"
                      sx={customLabelTypography}
                      style={{ fontSize: 8 }}
                    >
                      Material
                    </Typography>
                    <CustomTextfield
                      id="stocks-allot-container-number"
                      value={masterState && masterState.material_code}
                      dispatchType={"SET_MNR_ESTIMATE_MATERIAL"}
                      readOnlyP
                    />
                  </Grid>

                  <Grid
                    item
                    size={{ xs: 4, sm: 2 }}
                    style={{ alignSelf: "flex-end", paddingRight: "10px" }}
                  >
                    <Typography
                      variant="subtitle1"
                      sx={customLabelTypography}
                      style={{ fontSize: 8 }}
                    >
                      Repair
                    </Typography>
                    <CustomTextfield
                      id="stocks-allot-container-number"
                      value={masterState && masterState.repair_code}
                      dispatchType={"SET_MNR_ESTIMATE_REPAIR"}
                      readOnlyP
                    />
                  </Grid>
                  <Grid
                    item
                    size={{ xs: 4, sm: 2 }}
                    style={{ alignSelf: "flex-end", paddingRight: "10px" }}
                  >
                    <Typography
                      variant="subtitle1"
                      sx={customLabelTypography}
                      style={{ fontSize: 8 }}
                    >
                      Measurement
                    </Typography>
                    <CustomTextfield
                      id="stocks-allot-container-number"
                      value={masterState && masterState.measurement}
                      dispatchType={"SET_MNR_ESTIMATE_MEASUREMENT"}
                      readOnlyP
                    />
                  </Grid>

                  <Grid
                    item
                    size={{ xs: 4, sm: 2 }}
                    style={{ alignSelf: "flex-end", paddingRight: "10px" }}
                  >
                    <Typography
                      variant="subtitle1"
                      sx={customLabelTypography}
                      style={{ fontSize: 8 }}
                    >
                      L/W
                    </Typography>
                    <CustomTextfield
                      id="stocks-allot-container-number"
                      value={masterState && masterState.length_and_width}
                      dispatchType={"SET_MNR_ESTIMATE_LW"}
                      readOnlyP
                    />
                  </Grid>
                  <Grid
                    item
                    size={{ xs: 4, sm: 2 }}
                    style={{ alignSelf: "flex-end", paddingRight: "10px" }}
                  >
                    <Typography
                      variant="subtitle1"
                      sx={customLabelTypography}
                      style={{ fontSize: 8 }}
                    >
                      Qty
                    </Typography>
                    <CustomTextfield
                      id="stocks-allot-container-number"
                      value={masterState && masterState.quantity}
                      dispatchType={"SET_MNR_ESTIMATE_QUANTITY"}
                      readOnlyP
                    />
                  </Grid>

                  <Grid
                    item
                    size={{ xs: 4, sm: 2 }}
                    style={{ alignSelf: "flex-end", paddingRight: "10px" }}
                  >
                    <Typography
                      variant="subtitle1"
                      sx={customLabelTypography}
                      style={{ fontSize: 8 }}
                    >
                      Labour Hrs Tariff
                    </Typography>

                    <CustomTextfield
                      id="stocks-allot-container-number"
                      value={masterState && masterState.labour_hrs_tariff}
                      dispatchType={"SET_MNR_ESTIMATE_LABOUR_RATE"}
                      readOnlyP
                    />
                  </Grid>
                  <Grid
                    item
                    size={{ xs: 4, sm: 3 }}
                    style={{ alignSelf: "flex-end", paddingRight: "10px" }}
                  >
                    <Typography
                      variant="subtitle1"
                      sx={customLabelTypography}
                      style={{ fontSize: 8 }}
                    >
                      Wash Clean Tariff
                    </Typography>
                    {masterState.tariff_field_enabled === "True" ? (
                      <CustomTextfield
                        id="stocks-allot-container-number"
                        value={masterState && masterState.wash_clean_tariff}
                        handleChange={(event) =>
                          handleChangeTextField(
                            index,
                            event,
                            "wash_clean_tariff"
                          )
                        }
                        onBlur={(event) =>
                          handleChangeInput(index, event, "wash_clean_tariff")
                        }
                        dispatchType={"SET_MNR_ESTIMATE_LABOUR_RATE"}
                      />
                    ) : (
                      <CustomTextfield
                        id="stocks-allot-container-number"
                        value={masterState && masterState.wash_clean_tariff}
                        dispatchType={"SET_MNR_ESTIMATE_LABOUR_RATE"}
                        readOnlyP
                      />
                    )}
                  </Grid>

                  <Grid
                    item
                    size={{ xs: 4, sm: 2 }}
                    style={{ alignSelf: "flex-end", paddingRight: "10px" }}
                  >
                    <Typography
                      variant="subtitle1"
                      sx={customLabelTypography}
                      style={{ fontSize: 8 }}
                    >
                      Labour Cost
                    </Typography>
                    {masterState.tariff_field_enabled === "True" ? (
                      <CustomTextfield
                        id="stocks-allot-container-number"
                        value={masterState && masterState.labour_cost}
                        handleChange={(event) =>
                          handleChangeTextField(index, event, "labour_cost")
                        }
                        onBlur={(event) =>
                          handleChangeInput(index, event, "labour_cost")
                        }
                        dispatchType={"SET_MNR_ESTIMATE_LABOUR_RATE"}
                      />
                    ) : (
                      <CustomTextfield
                        id="stocks-allot-container-number"
                        value={masterState && masterState.labour_cost}
                        dispatchType={"SET_MNR_ESTIMATE_LABOUR_RATE"}
                        readOnlyP
                      />
                    )}
                  </Grid>

                  <Grid
                    item
                    size={{ xs: 4, sm: 2 }}
                    style={{ alignSelf: "flex-end", paddingRight: "10px" }}
                  >
                    <Typography
                      variant="subtitle1"
                      sx={customLabelTypography}
                      style={{ fontSize: 8 }}
                    >
                      Total Cost
                    </Typography>
                    <CustomTextfield
                      id="stocks-allot-container-number"
                      value={masterState && masterState.total_cost}
                      dispatchType={"SET_MNR_ESTIMATE_TOTAL_COST"}
                      readOnlyP
                    />
                  </Grid>
                  <Grid
                    item
                    size={{ xs: 4, sm: 1 }}
                    style={{ alignSelf: "flex-end", paddingRight: "10px" }}
                  >
                    <Typography
                      variant="subtitle1"
                      sx={customLabelTypography}
                      style={{ fontSize: 8 }}
                    >
                      Remarks
                    </Typography>

                    <CustomTextfield
                      id="mnr-estimate-remarks"
                      value={masterState && masterState.remarks}
                      handleChange={(event) =>
                        handleChangeTextField(index, event, "remarks")
                      }
                      onBlur={(event) =>
                        handleChangeInput(index, event, "remarks")
                      }
                      dispatchType={"SET_MNR_ESTIMATE_REMARKS"}
                      readOnlyP
                    />
                  </Grid>
                </Tabs>
              </AppBar>
            </Box>
          ))}
          {MNRProcess.mnrProcessData.estimate &&
            MNRProcess.mnrProcessData.estimate.is_locked === "False" &&
            showEst && (
              <Grid
                item
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  width: "100%",
                }}
              >
                <Button
                  sx={{
                    marginTop: 30,
                    backgroundColor: "green",
                    color: "#fff",
                    borderRadius: "0.5rem",
                    padding: "1px 4px",
                    height: 40,
                    fontSize: 12.5,
                    marginLeft: "auto",
                    marginRight: "auto",
                    width: "35%",
                    border: "1.5px solid #006400",
                    boxShadow: "0px 3px 6px #006400",
                    "&:hover": {
                      backgroundColor: "green",
                      color: "#fff",
                    },
                  }}
                  onClick={handleCalculateEstimate}
                >
                  Calculate Estimate
                </Button>
              </Grid>
            )}
        </Paper>
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
            sx={(theme) => ({
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              width: "100%",
              [theme.breakpoints.down("sm")]: {
                flexWrap: "wrap",
                gap: 2,
              },
            })}
          >
            {MNRProcess.mnrProcessData.estimate &&
            MNRProcess.mnrProcessData.estimate.is_proceed === "True" ? (
              <>
                <Button
                variant="contained"
                color="primary"
                  sx={{
                    borderRadius: "0.5rem",
                    height: 40,
                    fontSize: 12.5,
                    marginLeft: "auto",
                    marginRight: "auto",
                    padding: "20px 100px",
                  }}
                  onClick={() => {
                    let estLines = {
                      damage_lines: masterDamageComponent,
                      cleaning_lines: masterCleaningComponent,
                    };
                    let req = {
                      pk:
                        MNRProcess.mnrProcessData.survey &&
                        MNRProcess.mnrProcessData.estimate.pk,
                      estimate_id:
                        MNRProcess.mnrProcessData.survey &&
                        MNRProcess.mnrProcessData.estimate.estimate_id,
                      is_draft: "False",
                      is_proceed: "True",
                      survey_id:
                        MNRProcess.mnrProcessData &&
                        MNRProcess.mnrProcessData.estimate &&
                        MNRProcess.mnrProcessData.estimate.survey_id,
                      location: localStorage.getItem("location")
                        ? localStorage.getItem("location")
                        : null,
                      site: localStorage.getItem("site")
                        ? localStorage.getItem("site")
                        : null,
                      number: estimate_no,
                      original_date: org_date,
                      original_time: org_time,
                      date: date,
                      current_date: current_date,
                      time: time,
                      current_time: current_time,
                      estimate_by: estimate_by,
                      created_by: created_by,
                      updated_by: updated_by,
                      amount:
                        MNRProcess.mnrProcessData &&
                        MNRProcess.mnrProcessData.estimate &&
                        MNRProcess.mnrProcessData.estimate.amount,
                      original_amount: original_amount,
                      current_amount: current_amount,
                      reload_container_no:
                        MNRProcess.mnrProcessData.container_data &&
                        MNRProcess.mnrProcessData.container_data.container_no,
                      reload_container_date:
                        MNRProcess.mnrProcessData.container_data &&
                        MNRProcess.mnrProcessData.container_data.in_date,
                      survey_lines: estLines,
                    };
                    dispatch(updateEstimate(req, notify));
                  }}
                  disabled={
                    MNRProcess.mnrProcessData.estimate &&
                    MNRProcess.mnrProcessData.estimate.is_locked === "True"
                  }
                >
                  Update
                </Button>

                {MNRProcess?.mnrProcessData?.container_data?.mnr_ftp_upload ===
                  true ||
                MNRGridSearch?.stage === "Approval" ||
                MNRGridSearch?.stage === "Available" ||
                MNRGridSearch?.stage === "Repair" ? (
                  <>
                    <Button
                      variant="contained"
                      color="primary"
                      sx={(theme) => ({
                        borderRadius: "0.5rem",
                        height: 40,
                        fontSize: 12.5,
                        marginLeft: "auto",
                        marginRight: "auto",
                        padding: "20px 100px",
                        [theme.breakpoints.down("sm")]: {
                          padding: 2,
                          width: 244,
                        },
                      })}
                      onClick={() => {
                        dispatch(
                          ediFtpUploadEstimate(
                            MNRProcess?.mnrProcessData.estimate?.pk,
                            notify
                          )
                        );
                      }}
                      disabled={
                        MNRProcess?.mnrProcessData?.estimate
                          ?.ftp_upload_successful === "True" ||
                        MNRProcess?.mnrProcessData?.estimate?.pk === 0
                      }
                    >
                      EDI FTP Upload
                    </Button>
                    <Button
                      variant="contained"
                      color="primary"
                      sx={(theme) => ({
                        borderRadius: "0.5rem",
                        height: 40,
                        fontSize: 12.5,
                        marginLeft: "auto",
                        marginRight: "auto",
                        padding: "20px 100px",

                        [theme.breakpoints.down("sm")]: {
                          padding: 2,
                          width: 244,
                        },
                      })}
                      onClick={() => {
                        dispatch(
                          imgFtpUploadEstimate(
                            MNRProcess?.mnrProcessData.estimate?.pk,
                            notify
                          )
                        );
                      }}
                      disabled={
                        MNRProcess?.mnrProcessData?.estimate
                          ?.ftp_upload_successful === "True" ||
                        MNRProcess?.mnrProcessData?.estimate?.pk === 0
                      }
                    >
                      Image FTP Upload
                    </Button>
                  </>
                ) : (
                  ""
                )}
              </>
            ) : (
              <>
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
                    if (date === "")
                      notify("Please Enter Estimate Date", {
                        variant: "warning",
                      });
                    else if (time === "")
                      notify("Please Enter Estimate Time", {
                        variant: "warning",
                      });
                    else if (estimate_by === "") {
                      notify("Select Enter Estimate By", {
                        variant: "warning",
                      });
                    } else {
                      let estLines = {
                        damage_lines: masterDamageComponent,
                        cleaning_lines: masterCleaningComponent,
                      };
                      let req = {
                        estimate_id: "",
                        is_draft: "True",
                        is_proceed: "False",
                        survey_id:
                          MNRProcess.mnrProcessData &&
                          MNRProcess.mnrProcessData.estimate &&
                          MNRProcess.mnrProcessData.estimate.survey_id,
                        location: localStorage.getItem("location")
                          ? localStorage.getItem("location")
                          : null,
                        site: localStorage.getItem("site")
                          ? localStorage.getItem("site")
                          : null,
                        number: estimate_no,
                        original_date: org_date,
                        original_time: org_time,
                        date: date,
                        current_date: current_date,
                        time: time,
                        current_time: current_time,
                        estimate_by: estimate_by,
                        created_by: created_by,
                        updated_by: updated_by,
                        amount:
                          MNRProcess.mnrProcessData &&
                          MNRProcess.mnrProcessData.estimate &&
                          MNRProcess.mnrProcessData.estimate.amount,
                        original_amount: original_amount,
                        current_amount: current_amount,
                        reload_container_no:
                          MNRProcess.mnrProcessData.container_data &&
                          MNRProcess.mnrProcessData.container_data.container_no,
                        reload_container_date:
                          MNRProcess.mnrProcessData.container_data &&
                          MNRProcess.mnrProcessData.container_data.in_date,
                        survey_lines: estLines,
                      };
                      console.log(req);
                      dispatch(createEstimate(req, notify));
                    }
                  }}
                >
                  Save As Draft
                </Button>
                <Button
                variant="contained"
                color="primary"
                  sx={{
                    borderRadius: "0.5rem",
                    height: 40,
                    fontSize: 12.5,
                    marginLeft: "auto",
                    marginRight: "auto",
                    padding: "20px 100px",
                  }}
                  style={{ marginLeft: "20px", border: "none" }}
                  onClick={() => {
                    if (date === "")
                      notify("Please Enter Estimate Date", {
                        variant: "warning",
                      });
                    else if (time === "")
                      notify("Please Enter Estimate Time", {
                        variant: "warning",
                      });
                    else if (estimate_by === "") {
                      notify("Select Enter Estimate By", {
                        variant: "warning",
                      });
                    } else {
                      let estLines = {
                        damage_lines: masterDamageComponent,
                        cleaning_lines: masterCleaningComponent,
                      };
                      let req = {
                        estimate_id: "",
                        is_draft: "False",
                        is_proceed: "True",
                        survey_id:
                          MNRProcess.mnrProcessData &&
                          MNRProcess.mnrProcessData.estimate &&
                          MNRProcess.mnrProcessData.estimate.survey_id,
                        location: localStorage.getItem("location")
                          ? localStorage.getItem("location")
                          : null,
                        site: localStorage.getItem("site")
                          ? localStorage.getItem("site")
                          : null,
                        number: estimate_no,
                        original_date: org_date,
                        original_time: org_time,
                        date: date,
                        current_date: current_date,
                        time: time,
                        current_time: current_time,
                        estimate_by: estimate_by,
                        created_by: created_by,
                        updated_by: updated_by,
                        amount:
                          MNRProcess.mnrProcessData &&
                          MNRProcess.mnrProcessData.estimate &&
                          MNRProcess.mnrProcessData.estimate.amount,
                        original_amount: original_amount,
                        current_amount: current_amount,
                        reload_container_no:
                          MNRProcess.mnrProcessData.container_data &&
                          MNRProcess.mnrProcessData.container_data.container_no,
                        reload_container_date:
                          MNRProcess.mnrProcessData.container_data &&
                          MNRProcess.mnrProcessData.container_data.in_date,
                        survey_lines: estLines,
                      };
                      dispatch(createEstimate(req, notify));
                    }
                  }}
                >
                  Proceed
                </Button>
              </>
            )}
          </Grid>
        </Grid>
      </Paper>
    </>
  );
};
