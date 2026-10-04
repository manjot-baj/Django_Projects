import React, { useEffect, useState, useRef } from "react";
import LayoutContainer from "../components/reusableComponents/LayoutContainer";
import {
  Backdrop,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Checkbox,
  Chip,
  CircularProgress,
  createMuiTheme,
  Divider,
  FormControlLabel,
  Grid,
  IconButton,
  Link,
  makeStyles,
  MenuItem,
  Modal,
  MuiThemeProvider,
  Popover,
  Radio,
  TextField,
  Typography,
} from "@material-ui/core";
import { useDispatch, useSelector } from "react-redux";
import MUIDataTable from "mui-datatables";
import { useSnackbar } from "notistack";
import {
  adhocReportAddRequestAction,
  adhocReportdeleteRequestAction,
  adhocReportListingAction,
  downloadAdhocReportAction,
} from "../actions/AdhocReportAction";
import { Formik } from "formik";
import * as Yup from "yup";
import { dropDownDispatch } from "../actions/GateInActions";
import { theme } from "../App";
import { ADHOC_REPORT_CONST } from "../reducers/AdhocReportReducer";
import TuneOutlinedIcon from "@mui/icons-material/TuneOutlined";
import { Stack } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import RefreshIcon from "@mui/icons-material/Refresh";
import DateFnsUtils from "@date-io/date-fns";
import {
  KeyboardDatePicker,
  MuiPickersUtilsProvider,
} from "@material-ui/pickers";
import CloudDownloadOutlinedIcon from "@mui/icons-material/CloudDownloadOutlined";
import GateInTextField from "../components/reusableComponents/GateInTextField";
import { handleDateChangeUTILSBillingDispatch } from "../utils/WeekNumbre";

const useStyle = makeStyles((theme) => ({
  backdrop: {
    zIndex: theme.zIndex.drawer + 1,
    color: "#fff",
  },
  modalPaper: {
    position: "absolute",
    width: "70%",
    backgroundColor: "white",
    boxShadow: 5,
    padding: 20,
    outline: "none",
    borderRadius: 10,
  },
  chipRoot: {
    display: "flex",
    justifyContent: "center",

    flexWrap: "wrap",
    paddingTop: 20,
  },
  searchBox: {
    padding: "20px 20px 20px",
  },
  input: {
    padding: 8,
  },
  textField: {
    borderColor: "#2a5fa5",

    "& .MuiOutlinedInput-root": {
      borderColor: "red",
      borderRadius: "5px",

      "& fieldset": {
        borderColor: "red",
      },
    },
    "& .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline": {
      padding: "0 !important",
      border: "2px solid rgba(0,0,0,0.2)",
      borderRadius: "8px",
    },
  },
}));

const getMuiTheme = () =>
  createMuiTheme({
    overrides: {
      MuiTableCell: {
        head: {
          backgroundColor: "#f1f0fb !important",
          padding: "5px 10px !important",
        },
        root: {
          border: "1px solid rgba(0,0,0,.125)",
          padding: "5px 10px !important",
        },
      },
      MUIDataTableHeadCell: {
        data: {
          textAlign: "center",
          fontWeight: "bold",
        },
        fixedHeader: {
          textAlign: "center",
          fontWeight: "bold",
        },
      },
      MUIDataTableBodyRow: {
        root: {
          "&:nth-child(odd)": {
            backgroundColor: "#f7f7f7",
          },
          "&:hover": {
            backgroundColor: "#f1f0fb !important",
          },
        },
      },
      MUIDataTable: {
        responsiveBase: {
          zIndex: "0",
        },
        tableRoot: {
          border: "0px",
          xs: 0,
          sm: 600,
          md: 960,
          lg: 1280,
          xl: 1920,
        },
      },
    },
  });

function getModalStyle() {
  const top = 50;
  const left = 50;

  return {
    top: `${top}%`,
    left: `${left}%`,
    transform: `translate(-${top}%, -${left}%)`,
  };
}

const AdhocReportPage = () => {
  const { ui, gateIn } = useSelector((state) => state);

  const {
    listing,
    status,
    from_date,
    to_date,
    report_type,
    email_sent,
    location,
    site,
  } = useSelector((state) => state.AdhocReportReducer);
  const [adhocData, setAdhocData] = useState([]);
  const [allChecked, setAllChecked] = useState(false);
  const classes = useStyle();
  const notify = useSnackbar().enqueueSnackbar;
  const dispatch = useDispatch();
  const [openAdhocModal, setOpenAdhocModal] = useState(false);
  const [adhocFormData, setAdhocFormData] = useState({
    from_date: "",
    to_date: "",
    report_type: "MNR Material Usage Report",
    location: null,
    site: null,
  });
  const [anchorElAdvance, setAnchorElAdvance] = React.useState(null);
  const openAdvance = Boolean(anchorElAdvance);
  const fromDateRef = useRef();
  const idAdvance = openAdvance ? "simple-popover-Advance" : undefined;
  const handleClickAdvance = (event) => {
    setAnchorElAdvance(event.currentTarget);
  };

  const handleCloseAdvance = () => {
    setAnchorElAdvance(null);
  };

  useEffect(() => {
    let reqArray = ["location_site_dashboard_list", "adhoc_report_type"];

    dispatch(dropDownDispatch(reqArray, notify));
    dispatch(adhocReportListingAction(notify));
  }, []);

  useEffect(() => {
    let adhocDataArray = [];
    if (listing?.length > 0) {
      listing.map((rows) => {
        let adhocObj = {
          id: rows.id,
          from_date: rows.from_date,
          to_date: rows.to_date,
          report_type: rows.report_type,
          status: rows.status,
          email_sent: rows.email_sent,
          created_at: rows.created_at,
          location: rows.location,
          site: rows.site,
          s3_file_name:rows?.s3_file_name,
          s3_object_name:rows?.s3_object_name,
          checked: false,
        };
        adhocDataArray.push(adhocObj);
      });
      setAdhocData(adhocDataArray);
    } else {
      setAdhocData([]);
    }
  }, [listing]);

  const columns = [
    {
      name: "checkBox",
      options: {
        filter: false,
        sort: false,
        download: false,
        customHeadRender: ({ index, ...column }) => {
          return (
            <div
              style={{
                width: "100%",
                borderTop: "1px solid lightgrey",
                borderRadius: "0px",
                textAlign: "center",
                textTransform: "uppercase",
              }}
            >
              <Checkbox
                className="checkbox_all"
                onClick={checkBoxAllHandler}
                color="primary"
              />
            </div>
          );
        },

        customBodyRender: (value, tableMeta, updateValue) => {
          return (
            <div style={{ width: "100%", textAlign: "center" }}>
              <Checkbox
                className="check_value"
                onClick={() =>
                  checkBoxChangeHandler(
                    tableMeta.tableData[tableMeta.rowIndex]["id"]
                  )
                }
                checked={tableMeta.tableData[tableMeta.rowIndex]["checked"]}
                color="primary"
              />
            </div>
          );
        },
      },
    },
    {
      label: "From Date",
      name: "from_date",
      options: {
        filter: false,
      },
    },
    {
      label: "To Date",
      name: "to_date",
      style: {
        color: "red",
      },
      options: {
        sort: false,
        filter: false,
        options: {
          setCellProps: () => ({
            style: {
              display: "flex",
              justifyContent: "center",
            },
          }),
        },
        customBodyRender: (value, tableMeta, updateValue) => {
          return (
            <FormControlLabel
              style={{ width: "100%" }}
              control={
                <div style={{ display: "flex", margin: "auto" }}>
                  {tableMeta.tableData[tableMeta.rowIndex]["to_date"]}
                </div>
              }
            />
          );
        },
      },
    },
    {
      label: "Report Type",
      name: "report_type",
      options: {
        sort: false,
        filter: false,
        options: {
          setCellProps: () => ({
            style: {
              display: "flex",
              justifyContent: "center",
            },
          }),
        },
        customBodyRender: (value, tableMeta, updateValue) => {
          return (
            <FormControlLabel
              style={{ width: "100%" }}
              control={
                <div style={{ display: "flex", margin: "auto" }}>
                  {tableMeta.tableData[tableMeta.rowIndex]["report_type"]}
                </div>
              }
            />
          );
        },
      },
    },
    {
      label: "Status",
      name: "status",
      options: {
        sort: false,
        filter: false,
        options: {
          setCellProps: () => ({
            style: {
              display: "flex",
              justifyContent: "center",
            },
          }),
        },
        customBodyRender: (value, tableMeta, updateValue) => {
          return (
            <FormControlLabel
              style={{ width: "100%" }}
              control={
                <div
                  style={{
                    display: "flex",
                    margin: "auto",
                    color:
                      tableMeta.tableData[tableMeta.rowIndex]["status"] ===
                      "Pending"
                        ? theme.palette.primary.main
                        : tableMeta.tableData[tableMeta.rowIndex]["status"] ===
                          "Processing"
                        ? theme.palette.warning.main
                        : tableMeta.tableData[tableMeta.rowIndex]["status"] ===
                          "Completed"
                        ? theme.palette.success.main
                        : theme.palette.error.main,
                  }}
                >
                  {tableMeta.tableData[tableMeta.rowIndex]["status"]}
                </div>
              }
            />
          );
        },
      },
    },
    {
      label: "Email Sent",
      name: "email_sent",
      options: {
        sort: false,
        filter: false,
        options: {
          setCellProps: () => ({
            style: {
              display: "flex",
              justifyContent: "center",
            },
          }),
        },
        customBodyRender: (value, tableMeta, updateValue) => {
          return (
            <FormControlLabel
              style={{ width: "100%" }}
              control={
                <div style={{ display: "flex", margin: "auto" }}>
                  {tableMeta.tableData[tableMeta.rowIndex]["email_sent"]
                    ? "Yes"
                    : "No"}
                </div>
              }
            />
          );
        },
      },
    },
    {
      label: "Location",
      name: "location",
      options: {
        sort: false,
        filter: false,
        options: {
          setCellProps: () => ({
            style: {
              display: "flex",
              justifyContent: "center",
            },
          }),
        },
        customBodyRender: (value, tableMeta, updateValue) => {
          return (
            <FormControlLabel
              style={{ width: "100%" }}
              control={
                tableMeta.tableData[tableMeta.rowIndex]["location"] === null ||
                tableMeta.tableData[tableMeta.rowIndex]["location"] === "" ? (
                  <div style={{ display: "flex", margin: "auto" }}>{"All"}</div>
                ) : (
                  <div style={{ display: "flex", margin: "auto" }}>
                    {tableMeta.tableData[tableMeta.rowIndex]["location"]}
                  </div>
                )
              }
            />
          );
        },
      },
    },
    {
      label: "Site",
      name: "site",
      options: {
        sort: false,
        filter: false,
        options: {
          setCellProps: () => ({
            style: {
              display: "flex",
              justifyContent: "center",
            },
          }),
        },
        customBodyRender: (value, tableMeta, updateValue) => {
          return (
            <FormControlLabel
              style={{ width: "100%" }}
              control={
                tableMeta.tableData[tableMeta.rowIndex]["site"] === null ||
                tableMeta.tableData[tableMeta.rowIndex]["site"] === "" ? (
                  <div style={{ display: "flex", margin: "auto" }}>
                    {"All"}
                  </div>
                ) : (
                  <div style={{ display: "flex", margin: "auto" }}>
                    {tableMeta.tableData[tableMeta.rowIndex]["site"]}
                  </div>
                )
              }
            />
          );
        },
      },
    },
    {
      label: "Created At",
      name: "created_at",
      options: {
        sort: false,
        filter: false,
        options: {
          setCellProps: () => ({
            style: {
              display: "flex",
              justifyContent: "center",
            },
          }),
        },
        customBodyRender: (value, tableMeta, updateValue) => {
          return (
            <FormControlLabel
              style={{ width: "100%" }}
              control={
                <div style={{ display: "flex", margin: "auto" }}>
                  {tableMeta.tableData[tableMeta.rowIndex]["created_at"]}
                </div>
              }
            />
          );
        },
      },
    },
    {
      label: "Report",
      name: "report",
      options: {
        sort: false,
        filter: false,
        options: {
          setCellProps: () => ({
            style: {
              display: "flex",
              justifyContent: "center",
            },
          }),
        },
        customBodyRender: (value, tableMeta, updateValue) => {
          return (
          (  tableMeta.tableData[tableMeta.rowIndex]["status"] ==="Completed") ? (
              <IconButton
                color="primary"
                onClick={() =>
                  dispatch(
                    downloadAdhocReportAction(
                      tableMeta.tableData[tableMeta.rowIndex]["id"],
                      tableMeta.tableData[tableMeta.rowIndex]["s3_file_name"],
                      notify
                    )
                  )
                }
              >
                <CloudDownloadOutlinedIcon fontSize="small" />
              </IconButton>
            ) :<div></div>
          );
        },
      },
    },
  ];

  const openMultipleDelete = () => {
    let deleteData = adhocData.filter((val) => val.checked === true);
    dispatch(
      adhocReportdeleteRequestAction(
        deleteData.map((val) => val.id),
        notify
      )
    );
  };

  const checkBoxAllHandler = () => {
    const data = listing;
    data.map((v, r) => {
      v.checked = !allChecked;
    });
    setAdhocData(data);
    setAllChecked(!allChecked);
  };

  const checkBoxChangeHandler = (adhocRequestId) => {
    let adhocIndex = adhocData.findIndex((x) => x.id === adhocRequestId);
    setAdhocData([]);
    const data = [...adhocData];
    data[adhocIndex]["checked"] = !data[adhocIndex]["checked"];
    setAdhocData(data);
  };

  const handleModalClose = () => setOpenAdhocModal(false);

  const handleModalOpen = () => setOpenAdhocModal(true);

  const handleAdvanceSearch = () => {
    if (from_date !== "" && to_date === "") {
      notify("Please Fill To Date ", { variant: "warning" });
    } else if (to_date !== "" && to_date === "") {
      notify("Please Fill From Date", { variant: "warning" });
    } else {
      dispatch(adhocReportListingAction(notify));
      handleCloseAdvance();
    }
  };

  const handleClearAdvance = () => {
    dispatch({
      type: ADHOC_REPORT_CONST.CHANGE_EMAIL_SENT,
      payload: null,
    });
    dispatch({
      type: ADHOC_REPORT_CONST.CHANGE_FROM_DATE,
      payload: null,
    });

    dispatch({
      type: ADHOC_REPORT_CONST.CHANGE_TO_DATE,
      payload: null,
    });
    dispatch({
      type: ADHOC_REPORT_CONST.CHANGE_REPORT_TYPE,
      payload: null,
    });
    dispatch(adhocReportListingAction(notify));
  };

  const handleDeletedatechip = () => {
    dispatch({ type: ADHOC_REPORT_CONST.CHANGE_FROM_DATE, payload: null });
    dispatch({ type: ADHOC_REPORT_CONST.CHANGE_TO_DATE, payload: null });
    dispatch(adhocReportListingAction(notify));
  };

  const handleDeleteemailchip = () => {
    dispatch({ type: ADHOC_REPORT_CONST.CHANGE_EMAIL_SENT, payload: null });
    dispatch(adhocReportListingAction(notify));
  };

  const handleDeletereportchip = () => {
    dispatch({ type: ADHOC_REPORT_CONST.CHANGE_REPORT_TYPE, payload: null });
    dispatch(adhocReportListingAction(notify));
  };

  const handleDeletelocationchip = () => {
    dispatch({
      type: ADHOC_REPORT_CONST.CHANGE_LOCATION,
      payload: null,
    });
    dispatch({
      type: ADHOC_REPORT_CONST.CHANGE_SITE,
      payload: null,
    });
    dispatch(adhocReportListingAction(notify));
  };

  const handleDeletesitechip = () => {
    dispatch({
      type: ADHOC_REPORT_CONST.CHANGE_SITE,
      payload: null,
    });
    dispatch(adhocReportListingAction(notify));
  };

  return (
    <LayoutContainer>
      <Box
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 10,
        }}
      >
        <FormControlLabel
          value="All"
          control={
            <Radio
              size="small"
              style={{ color: theme.palette.secondary.main }}
              checked={status === null}
              onClick={() => {
                dispatch({
                  type: ADHOC_REPORT_CONST.CHANGE_STATUS,
                  payload: null,
                });
                dispatch(adhocReportListingAction(notify));
              }}
            />
          }
          label="All"
        />
        <FormControlLabel
          value="Pending"
          control={
            <Radio
              size="small"
              style={{ color: theme.palette.info.main }}
              checked={status === "Pending"}
              onClick={() => {
                dispatch({
                  type: ADHOC_REPORT_CONST.CHANGE_STATUS,
                  payload: "Pending",
                });
                dispatch(adhocReportListingAction(notify));
              }}
            />
          }
          label="Pending"
        />
        <FormControlLabel
          value="Processing"
          control={
            <Radio
              size="small"
              style={{ color: theme.palette.warning.main }}
              checked={status === "Processing"}
              onClick={() => {
                dispatch({
                  type: ADHOC_REPORT_CONST.CHANGE_STATUS,
                  payload: "Processing",
                });
                dispatch(adhocReportListingAction(notify));
              }}
            />
          }
          label="Processing"
        />
        <FormControlLabel
          value="Completed"
          control={
            <Radio
              size="small"
              style={{ color: theme.palette.success.main }}
              checked={status === "Completed"}
              onClick={() => {
                dispatch({
                  type: ADHOC_REPORT_CONST.CHANGE_STATUS,
                  payload: "Completed",
                });
                dispatch(adhocReportListingAction(notify));
              }}
            />
          }
          label="Completed"
        />
        <FormControlLabel
          value="Failed"
          control={
            <Radio
              size="small"
              style={{ color: theme.palette.error.main }}
              checked={status === "Failed"}
              onClick={() => {
                dispatch({
                  type: ADHOC_REPORT_CONST.CHANGE_STATUS,
                  payload: "Failed",
                });
                dispatch(adhocReportListingAction(notify));
              }}
            />
          }
          label="Failed"
        />
      </Box>

      <Card style={{ marginTop: 24 }}>
        <CardContent>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <h4>Adhoc Report</h4>

            <Box
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-end",
                gap: 10,
              }}
            >
              {location !== "" && location !== "ALL" && location !== null && (
                <Chip
                  color="primary"
                  variant="outlined"
                  label={`${"Location"} - ${location}`}
                  onDelete={handleDeletelocationchip}
                />
              )}
              {site !== "" && site !== "ALL" && site !== null && (
                <Chip
                  color="primary"
                  variant="outlined"
                  label={`${"Site"} - ${site}`}
                  onDelete={handleDeletesitechip}
                />
              )}

              {from_date !== "" && to_date !== "" && (
                <Chip
                  color="primary"
                  variant="outlined"
                  label={`${from_date} / ${to_date}`}
                  onDelete={handleDeletedatechip}
                />
              )}
              {email_sent === true && (
                <Chip
                  color="primary"
                  variant="outlined"
                  onDelete={handleDeleteemailchip}
                  label={`${
                    email_sent
                      ? "Email Sent"
                      : email_sent === false
                      ? "No Email Sent"
                      : ""
                  }`}
                />
              )}
              {!(report_type === null || report_type === "") && (
                <Chip
                  color="primary"
                  variant="outlined"
                  label={`${report_type}`}
                  onDelete={handleDeletereportchip}
                />
              )}
              <Button
                variant="outlined"
                color="primary"
                startIcon={<TuneOutlinedIcon fontSize="small" />}
                onClick={handleClickAdvance}
              >
                Filter
              </Button>
              <Popover
                id={idAdvance}
                open={openAdvance}
                anchorEl={anchorElAdvance}
                onClose={handleCloseAdvance}
                anchorOrigin={{
                  vertical: "bottom",
                  horizontal: "left",
                }}
                style={{
                  marginTop: "-50px",
                  marginLeft: "20px",
                  borderRadius: "20px",
                }}
              >
                <Box className={classes.searchBox}>
                  <Stack
                    direction={"row"}
                    alignItems={"center"}
                    justifyContent={"space-between"}
                  >
                    <Typography variant="h6" style={{ fontWeight: "bolder" }}>
                      Advance Search
                    </Typography>
                    <Stack
                      direction={"row"}
                      alignItems={"center"}
                      justifyContent={"space-between"}
                    >
                      <IconButton
                        color="rgba(0,0,0,0.09)"
                        onClick={handleClearAdvance}
                      >
                        <RefreshIcon />
                      </IconButton>
                    </Stack>
                  </Stack>

                  <Divider style={{ backgroundColor: "rgba(0,0,0,0.09)" }} />
                  <Typography
                    variant="subtitle2"
                    style={{
                      fontWeight: "600",
                      marginTop: "32px",
                      marginBottom: "8px",
                    }}
                  >
                    {" "}
                    Select Location and site
                  </Typography>

                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <Typography variant="subtitle1">Location</Typography>
                      <TextField
                        select
                        placeholder="Location"
                        margin="none"
                        autoComplete="off"
                        name="location"
                        fullWidth
                        type="text"
                        size="small"
                        onChange={(e) => {
                          dispatch({
                            type: ADHOC_REPORT_CONST.CHANGE_LOCATION,
                            payload: e.target.value,
                          });
                          dispatch(adhocReportListingAction(notify));
                        }}
                        value={location}
                        variant="outlined"
                      >
                        {gateIn.allDropDown &&
                          gateIn.allDropDown.location_site_dashboard_list &&
                          ["ALL"]
                            .concat(
                              Object.keys(
                                gateIn.allDropDown.location_site_dashboard_list
                              )
                            )
                            .map((option) => (
                              <MenuItem key={option} value={option}>
                                {option}
                              </MenuItem>
                            ))}
                      </TextField>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="subtitle1">Site</Typography>
                      <TextField
                        select
                        placeholder="Site"
                        margin="none"
                        autoComplete="off"
                        name="site"
                        fullWidth
                        type="text"
                        size="small"
                        value={site}
                        variant="outlined"
                        onChange={(e) => {
                          dispatch({
                            type: ADHOC_REPORT_CONST.CHANGE_SITE,
                            payload: e.target.value,
                          });
                          dispatch(adhocReportListingAction(notify));
                        }}
                      >
                        {location !== "" &&
                          gateIn.allDropDown &&
                          gateIn.allDropDown.location_site_dashboard_list &&
                          ["ALL"]
                            .concat(
                              gateIn.allDropDown.location_site_dashboard_list[
                                location
                              ]
                            )
                            ?.map((option) => (
                              <MenuItem key={option} value={option}>
                                {option}
                              </MenuItem>
                            ))}
                      </TextField>
                    </Grid>
                  </Grid>

                  <Typography
                    variant="subtitle2"
                    style={{
                      fontWeight: "600",
                      marginTop: "32px",
                      marginBottom: "8px",
                    }}
                  >
                    {" "}
                    Select Date
                  </Typography>

                  <Stack direction={"row"} spacing={2}>
                    <Typography variant="caption">from </Typography>
                    <MuiPickersUtilsProvider
                      ref={fromDateRef}
                      utils={DateFnsUtils}
                    >
                      <KeyboardDatePicker
                        clearable
                        variant="inline"
                        onKeyDown={(e) => {
                          e.preventDefault();
                        }}
                        format="yyyy/MM/dd"
                        autoOk={true}
                        inputVariant="outlined"
                        id={`-date-picker-inline`}
                        value={from_date ? from_date : null}
                        error={false}
                        defaultValue={""}
                        emptyLabel=""
                        name="from_date"
                        helperText={``}
                        onChange={(date) => {
                          handleDateChangeUTILSBillingDispatch(
                            date,
                            dispatch,
                            ADHOC_REPORT_CONST.CHANGE_FROM_DATE
                          );
                          dispatch(adhocReportListingAction(notify));
                        }}
                        KeyboardButtonProps={{
                          "aria-label": "change date",
                        }}
                        className={classes.textField}
                        inputProps={{ className: classes.input }}
                      />
                    </MuiPickersUtilsProvider>
                    <Typography variant="caption">to</Typography>
                    <MuiPickersUtilsProvider utils={DateFnsUtils}>
                      <KeyboardDatePicker
                        variant="inline"
                        onKeyDown={(e) => {
                          e.preventDefault();
                        }}
                        format="yyyy/MM/dd"
                        autoOk={true}
                        inputVariant="outlined"
                        id={`-date-picker-inline`}
                        value={to_date ? to_date : null}
                        error={false}
                        emptyLabel=""
                        name="from_date"
                        helperText={``}
                        onChange={(date) => {
                          handleDateChangeUTILSBillingDispatch(
                            date,
                            dispatch,
                            ADHOC_REPORT_CONST.CHANGE_TO_DATE
                          );
                          dispatch(adhocReportListingAction(notify));
                        }}
                        KeyboardButtonProps={{
                          "aria-label": "change date",
                        }}
                        className={classes.textField}
                        inputProps={{ className: classes.input }}
                      />
                    </MuiPickersUtilsProvider>
                  </Stack>
                  <Typography
                    variant="subtitle2"
                    style={{
                      fontWeight: "600",
                      marginTop: "32px",
                      marginBottom: "8px",
                    }}
                  >
                    {" "}
                    Email Sent
                  </Typography>
                  <Stack
                    direction={"row"}
                    alignItems={"center"}
                    justifyContent={"flex-start"}
                    spacing={4}
                  >
                    <FormControlLabel
                      value="All"
                      control={
                        <Radio
                          size="small"
                          style={{ color: theme.palette.primary.main }}
                          checked={email_sent === null}
                          onClick={() => {
                            dispatch({
                              type: ADHOC_REPORT_CONST.CHANGE_EMAIL_SENT,
                              payload: null,
                            });
                            dispatch(adhocReportListingAction(notify));
                          }}
                        />
                      }
                      label="All"
                    />
                    <FormControlLabel
                      value="Yes"
                      control={
                        <Radio
                          size="small"
                          style={{ color: theme.palette.primary.main }}
                          checked={email_sent === true}
                          onClick={() => {
                            dispatch({
                              type: ADHOC_REPORT_CONST.CHANGE_EMAIL_SENT,
                              payload: true,
                            });
                            dispatch(adhocReportListingAction(notify));
                          }}
                        />
                      }
                      label="Yes"
                    />
                    <FormControlLabel
                      value="No"
                      control={
                        <Radio
                          size="small"
                          style={{ color: theme.palette.primary.main }}
                          checked={email_sent === false}
                          onClick={() => {
                            dispatch({
                              type: ADHOC_REPORT_CONST.CHANGE_EMAIL_SENT,
                              payload: false,
                            });
                            dispatch(adhocReportListingAction(notify));
                          }}
                        />
                      }
                      label="No"
                    />
                  </Stack>
                  <Typography
                    variant="subtitle2"
                    style={{
                      fontWeight: "600",
                      marginTop: "32px",
                      marginBottom: "8px",
                    }}
                  >
                    {" "}
                    Report Type
                  </Typography>

                  <Stack
                    direction={"row"}
                    alignItems={"center"}
                    justifyContent={"flex-start"}
                    spacing={2}
                  >
                    <TextField
                      select
                      placeholder="Adhoc report"
                      margin="none"
                      autoComplete="off"
                      name="report_type"
                      fullWidth
                      type="text"
                      size="small"
                      onChange={(e) => {
                        dispatch({
                          type: ADHOC_REPORT_CONST.CHANGE_REPORT_TYPE,
                          payload: e.target.value,
                        });
                        dispatch(adhocReportListingAction(notify));
                      }}
                      value={report_type}
                      variant="outlined"
                    >
                      {gateIn.allDropDown &&
                        gateIn.allDropDown.adhoc_report_type &&
                        gateIn.allDropDown.adhoc_report_type.map((option) => (
                          <MenuItem key={option} value={option}>
                            {option}
                          </MenuItem>
                        ))}
                    </TextField>
                  </Stack>
                </Box>
              </Popover>
              {adhocData?.some((arrVal) => arrVal.checked === true) && (
                <Button
                  className="add_btn btn btn-danger"
                  variant="contained"
                  color="secondary"
                  onClick={openMultipleDelete}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke={theme.palette.error.main}
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    className="feather feather-trash-2"
                  >
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    <line x1="10" y1="11" x2="10" y2="17"></line>
                    <line x1="14" y1="11" x2="14" y2="17"></line>
                  </svg>
                  &nbsp; Delete
                </Button>
              )}
              <Button
                className="add_btn btn btn-primary"
                variant="contained"
                color="primary"
                onClick={handleModalOpen}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  className="feather feather-plus"
                >
                  <line x1="12" y1="2" x2="12" y2="18"></line>
                  <line x1="5" y1="10" x2="19" y2="10"></line>
                </svg>
                &nbsp; Add New
              </Button>
            </Box>
          </div>

          <Divider />
          <MuiThemeProvider theme={getMuiTheme()}>
            <MUIDataTable
              data={adhocData}
              columns={columns}
              options={{
                selectableRows: "none",
                responsive: "scroll",
                filterType: "dropdown",
                download: false,
                textLabels: {
                  body: {
                    noMatch: !adhocData ? (
                      <CircularProgress />
                    ) : (
                      "Sorry, there is no matching data to display"
                    ),
                  },
                },

                filter: false,
                fixedHeaderOptions: false,
                viewColumns: false,
                print: false,
              }}
            />
          </MuiThemeProvider>
        </CardContent>
      </Card>
      <Modal open={openAdhocModal} onClose={handleModalClose}>
        <div style={getModalStyle()} className={classes.modalPaper}>
          <Card elevation={0}>
            <CardHeader title={` Add Adhoc`} />
            <CardContent>
              <Formik
                initialValues={adhocFormData}
                enableReinitialize={true}
                validationSchema={Yup.object().shape({
                  from_date: Yup.string().required("From Date is Required"),
                  // .matches(accountNameRegxp, "Account Name is not valid"),
                  location: Yup.string()
                    .nullable()
                    .required("Location is Required"),
                  to_date: Yup.string().required("To Date is Required"),
                  report_type: Yup.string().required("Report Type is Required"),
                  site: Yup.string().nullable().required("Site is Required"),
                })}
                onSubmit={async (values) => {
                  try {
                    dispatch(
                      adhocReportAddRequestAction(
                        values,
                        notify,
                        handleModalClose
                      )
                    );
                  } catch (error) {
                    console.log("error", error);
                  }
                }}
              >
                {({
                  errors,
                  handleSubmit,
                  isSubmitting,
                  touched,
                  values,
                  handleBlur,
                  handleChange,
                  setFieldValue,
                }) => (
                  <form onSubmit={handleSubmit}>
                    <Grid container spacing={2}>
                      <Grid item xs={12} lg={6}>
                        <Typography variant="subtitle1">
                          From Date<span style={{ color: "red" }}>*</span>
                        </Typography>
                        <TextField
                          error={Boolean(
                            touched.account_type && errors.account_type
                          )}
                          helperText={
                            touched.account_type && errors.account_type
                          }
                          placeholder="from_date"
                          margin="none"
                          autoComplete="off"
                          name="from_date"
                          fullWidth
                          onBlur={handleBlur}
                          onChange={(e) => {
                            setAdhocFormData((val) => ({
                              ...val,
                              from_date: e.target.value,
                            }));
                          }}
                          type="date"
                          size="small"
                          value={adhocFormData.from_date}
                          variant="outlined"
                        />
                      </Grid>
                      <Grid item xs={12} lg={6}>
                        <Typography variant="subtitle1">
                          To Date <span style={{ color: "red" }}>*</span>
                        </Typography>
                        <TextField
                          error={Boolean(
                            touched.account_type && errors.account_type
                          )}
                          helperText={
                            touched.account_type && errors.account_type
                          }
                          placeholder="from_date"
                          margin="none"
                          autoComplete="off"
                          name="from_date"
                          fullWidth
                          onBlur={handleBlur}
                          onChange={(e) => {
                            setAdhocFormData((val) => ({
                              ...val,
                              to_date: e.target.value,
                            }));
                          }}
                          type="date"
                          size="small"
                          value={adhocFormData.to_date}
                          variant="outlined"
                        />
                      </Grid>

                      <Grid item xs={12} lg={6}>
                        <Typography variant="subtitle1">Report Type</Typography>
                        <TextField
                          error={Boolean(
                            touched.contact_no && errors.contact_no
                          )}
                          helperText={touched.contact_no && errors.contact_no}
                          select
                          placeholder="Report Type"
                          margin="none"
                          autoComplete="off"
                          name="report_type"
                          onBlur={handleBlur}
                          fullWidth
                          type="text"
                          size="small"
                          onChange={(e) =>
                            setAdhocFormData((val) => ({
                              ...val,
                              report_type: e.target.value,
                            }))
                          }
                          value={adhocFormData.report_type}
                          variant="outlined"
                        >
                          {gateIn.allDropDown &&
                            gateIn.allDropDown.adhoc_report_type &&
                            gateIn.allDropDown.adhoc_report_type.map(
                              (option) => (
                                <MenuItem key={option} value={option}>
                                  {option}
                                </MenuItem>
                              )
                            )}
                        </TextField>
                      </Grid>

                      <Grid item xs={12} lg={6}>
                        <Typography variant="subtitle1">
                          Location<span style={{ color: "red" }}>*</span>
                        </Typography>
                        <TextField
                          error={Boolean(touched.location && errors.location)}
                          helperText={touched.location && errors.location}
                          select
                          placeholder="Location"
                          margin="none"
                          autoComplete="off"
                          name="location"
                          fullWidth
                          onBlur={handleBlur}
                          onChange={(e) =>
                            setAdhocFormData((val) => ({
                              ...val,
                              location: e.target.value,
                            }))
                          }
                          type="text"
                          size="small"
                          value={adhocFormData.location}
                          variant="outlined"
                        >
                          {gateIn.allDropDown &&
                            gateIn.allDropDown.location_site_dashboard_list &&
                            ["ALL"]
                              .concat(
                                Object.keys(
                                  gateIn.allDropDown
                                    .location_site_dashboard_list
                                )
                              )
                              .map((option) => (
                                <MenuItem key={option} value={option}>
                                  {option}
                                </MenuItem>
                              ))}
                        </TextField>
                      </Grid>
                      <Grid item xs={12} lg={6}>
                        <Typography variant="subtitle1">
                          Site <span style={{ color: "red" }}>*</span>
                        </Typography>
                        <TextField
                          error={Boolean(touched.site && errors.site)}
                          helperText={touched.site && errors.site}
                          select
                          placeholder="Site"
                          margin="none"
                          autoComplete="off"
                          name="site"
                          fullWidth
                          onBlur={handleBlur}
                          onChange={(e) =>
                            setAdhocFormData((val) => ({
                              ...val,
                              site: e.target.value,
                            }))
                          }
                          type="text"
                          size="small"
                          value={adhocFormData.site}
                          variant="outlined"
                        >
                          {values.location !== "" &&
                            gateIn.allDropDown &&
                            gateIn.allDropDown.location_site_dashboard_list &&
                            ["ALL"]
                              .concat(
                                gateIn.allDropDown.location_site_dashboard_list[
                                  values.location
                                ]
                              )
                              ?.map((option) => (
                                <MenuItem key={option} value={option}>
                                  {option}
                                </MenuItem>
                              ))}
                        </TextField>
                      </Grid>
                    </Grid>

                    <Box style={{ textAlign: "end" }} ml={1} mt={6}>
                      <Button
                        color="primary"
                        disabled={isSubmitting}
                        size="medium"
                        type="submit"
                        variant="contained"
                        style={{ marginRight: "10px", width: 240 }}
                      >
                        Add Adhoc
                      </Button>
                      <Button
                        color="secondary"
                        size="medium"
                        type="button"
                        variant="outlined"
                        onClick={handleModalClose}
                      >
                        Cancel
                      </Button>
                    </Box>
                  </form>
                )}
              </Formik>
            </CardContent>
          </Card>
        </div>
      </Modal>
      <Backdrop className={classes.backdrop} open={ui.isloading}>
        <CircularProgress color="inherit" />
      </Backdrop>
    </LayoutContainer>
  );
};

export default AdhocReportPage;
