import React, { useEffect, useState } from "react";
import {
  TextField,
  MenuItem,
  FormControlLabel,
  Radio,
  Grid,
  Button,
  makeStyles,
  Typography,
  Paper
} from "@material-ui/core";
import { useDispatch, useSelector } from "react-redux";
import { useSnackbar } from "notistack";
import CustomTextfield from "../components/reusableComponents/GateInTextField";
import DatePickerField from "../components/reusableComponents/DatePickerField";
import { createApproval } from "../actions/MNRProcessActions";

const useStyles = makeStyles((theme) => ({
  paperContainerMNR: {
    padding: theme.spacing(2.5),
    borderRadius: 10,
    [theme.breakpoints.down("sm")]: {
      padding: theme.spacing(1),
      width: "98%",
      marginLeft: "auto",
      marginRight: "auto",
    },
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

  accordion: {
    boxShadow: "0px 0px 5px 0.1px rgba(0, 0, 0, 0.5)",

    "&::before": {
      top: 0,
      height: 1,
      content: "",
      opacity: 1,
      position: "absolute",
      right: "initial",
    },
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
  searchPaper: {
    padding: "1px 4px",
    margin: 5,
    display: "flex",
    alignItems: "center",
    height: 40,
    backgroundColor: "#DFE6EC",
    borderRadius: "0.5rem",
    [theme.breakpoints.down("xs")]: {
      // padding: "1px 4px",
      height: 35,
    },
  },
  iconbtn: {
    fontSize: 35,
    fontWeight: 900,
    color: "#000000",
  },

  button: {
    fontSize: 12.5,
    borderRadius: 6,
    width: "100%",
    border: "1.5px solid #2A5FA5",
    boxShadow: "0px 3px 6px #9199A14D",
    backgroundColor: "#2A5FA5",
    color: "#fff",
    "&:hover": {
      backgroundColor: "#2A5FA5",
    },
  },
  heading: {
    fontSize: 17,
    fontWeight: 900,
    color: "#000000",
  },

  paperContainer: {
    padding: theme.spacing(4, 3),
    marginBottom: 20,
  },
  inputfile: {
    display: "none",
  },

  LabelTypography: {
    fontSize: 12,
    fontWeight: 600,
    color: "#243545",
    paddingBottom: 4,
    [theme.breakpoints.down("sm")]: {
      paddingBottom: 1,
    },
  },
}));

export const Approval = () => {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [updated_by, setUpdatedBy] = useState("");
  const [created_by, setCreatedBy] = useState("");
  const dispatch = useDispatch();
  const classes = useStyles();
  const store = useSelector((state) => state);
  const { MNRProcess } = store;
  const notify = useSnackbar().enqueueSnackbar;

  const [denialReason, setDenialReason] = useState("");
  const [approvalAmount, setApprovalAmount] = useState("");
  const [approvedAmount, setApprovedAmount] = useState("");
  const [deniedAmount, setDeniedAmount] = useState("");
  const [proceedWithoutApproval, setProceedWithoutApproval] = useState("False");
  const [sendToLine, setSendToLine] = useState("True");
  const [isApproved, setIsApproved] = useState("");
  const [approvedDate, setApprovedDate] = useState("");
  const [approvedTime, setApprovedTime] = useState("");
  const [isDenied, setIsDenied] = useState("");

  var today = new Date();
  var dd = String(today.getDate()).padStart(2, "0");
  var mm = String(today.getMonth() + 1).padStart(2, "0"); //
  var yyyy = today.getFullYear();

  var curr_hour = today.getHours();
  var curr_min = today.getMinutes();
  var todayTime = curr_hour + ":" + curr_min;

  var todayDate = yyyy + "-" + mm + "-" + dd;

  useEffect(() => {
    if (MNRProcess.mnrProcessData.approval) {
      setProceedWithoutApproval(
        MNRProcess.mnrProcessData.approval.proceed_without_approval
      );
      setSendToLine(MNRProcess.mnrProcessData.approval.sent_to_line);
      setIsApproved(
        MNRProcess.mnrProcessData.approval.is_approved === undefined
          ? ""
          : MNRProcess.mnrProcessData.approval.is_approved
      );
      setApprovedDate(MNRProcess.mnrProcessData.approval.approved_date);
      setApprovedTime(MNRProcess.mnrProcessData.approval.approved_time);
      setIsDenied(
        MNRProcess.mnrProcessData.approval.is_denied === undefined
          ? ""
          : MNRProcess.mnrProcessData.approval.is_denied
      );
      setDenialReason(MNRProcess.mnrProcessData.approval.denial_reason);
      setDate(MNRProcess.mnrProcessData.approval.date);
      setTime(MNRProcess.mnrProcessData.approval.time);
      setApprovalAmount(MNRProcess.mnrProcessData.approval.approval_amount);
      setApprovedAmount(MNRProcess.mnrProcessData.approval.approved_amount);
      setDeniedAmount(MNRProcess.mnrProcessData.approval.denied_amount);
      setCreatedBy(MNRProcess.mnrProcessData.approval.created_by);
      setUpdatedBy(MNRProcess.mnrProcessData.approval.updated_by);
    }
  }, [MNRProcess.mnrProcessData]);

  // useEffect(() => {
  //   if (
  //     MNRProcess.mnrProcessData.approval &&
  //     !MNRProcess.mnrProcessData.approval.pk
  //   ) {
  //     setDate(todayDate);
  //     setTime(todayTime);
  //   }
  // }, []);

  const handleDateChange = (date) => {
    var selectedDate = new Date(date);
    var dd = String(selectedDate.getDate()).padStart(2, "0");
    var mm = String(selectedDate.getMonth() + 1).padStart(2, "0");
    var yyyy = selectedDate.getFullYear();
    var selectedDateFormat = yyyy + "-" + mm + "-" + dd;
    setDate(selectedDateFormat);
  };

  const handleApprovalDateChange = (date) => {
    var selectedDate = new Date(date);
    var dd = String(selectedDate.getDate()).padStart(2, "0");
    var mm = String(selectedDate.getMonth() + 1).padStart(2, "0");
    var yyyy = selectedDate.getFullYear();
    var selectedDateFormat = yyyy + "-" + mm + "-" + dd;
    setApprovedDate(selectedDateFormat);
  };

  return (
    <>
      <Paper className={classes.paperContainer} elevation={0}>
        <Grid container spacing={3} style={{ paddingTop: 20 }}>
          <Grid
            item
            xs={12}
            sm={3}
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Typography variant="subtitle2" style={{ paddingRight: 10 }}>
              Proceed Without Approval?
            </Typography>
            <FormControlLabel
              value="yes"
              control={
                <Radio
                  style={{ color: "#2A5FA5" }}
                  disabled={
                    (MNRProcess.mnrProcessData.approval &&
                      MNRProcess.mnrProcessData.approval.is_locked ===
                        "True") ||
                    sendToLine === "True" ||
                    (MNRProcess.mnrProcessData.approval &&
                      MNRProcess.mnrProcessData.approval.pk &&
                      MNRProcess.mnrProcessData.approval.sent_to_line ===
                        "True")
                      ? true
                      : false
                  }
                  checked={proceedWithoutApproval === "True"}
                  onClick={() => {
                    setProceedWithoutApproval("True");
                    setSendToLine("False");
                    setIsApproved("");
                    setIsDenied("");
                  }}
                />
              }
              label="Yes"
            />
            <FormControlLabel
              value="no"
              control={
                <Radio
                  style={{ color: "#2A5FA5" }}
                  disabled={
                    (MNRProcess.mnrProcessData.approval &&
                      MNRProcess.mnrProcessData.approval.is_locked ===
                        "True") ||
                    sendToLine === "True" ||
                    (MNRProcess.mnrProcessData.approval &&
                      MNRProcess.mnrProcessData.approval.pk &&
                      MNRProcess.mnrProcessData.approval.sent_to_line ===
                        "True")
                      ? true
                      : false
                  }
                  checked={proceedWithoutApproval === "False"}
                  onClick={() => {
                    setProceedWithoutApproval("False");
                    setSendToLine("True");
                    setIsApproved("");
                    setIsDenied("");
                  }}
                />
              }
              label="No"
            />
          </Grid>
          <Grid
            item
            xs={12}
            sm={3}
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Typography variant="subtitle2" style={{ paddingRight: 10 }}>
              Send to Line?
            </Typography>
            <FormControlLabel
              value="yes"
              disabled={
                (MNRProcess.mnrProcessData.approval &&
                  MNRProcess.mnrProcessData.approval.is_locked === "True") ||
                proceedWithoutApproval === "True" ||
                (MNRProcess.mnrProcessData.approval &&
                  MNRProcess.mnrProcessData.approval.pk &&
                  MNRProcess.mnrProcessData.approval.sent_to_line === "True")
                  ? true
                  : false
              }
              control={
                <Radio
                  style={{ color: "#2A5FA5" }}
                  checked={sendToLine === "True"}
                  onClick={() => {
                    setSendToLine("True");
                    setProceedWithoutApproval("False");
                  }}
                />
              }
              label="Yes"
            />
            <FormControlLabel
              value="no"
              disabled={
                (MNRProcess.mnrProcessData.approval &&
                  MNRProcess.mnrProcessData.approval.is_locked === "True") ||
                proceedWithoutApproval === "True" ||
                (MNRProcess.mnrProcessData.approval &&
                  MNRProcess.mnrProcessData.approval.pk &&
                  MNRProcess.mnrProcessData.approval.sent_to_line === "True")
                  ? true
                  : false
              }
              control={
                <Radio
                  style={{ color: "#2A5FA5" }}
                  checked={sendToLine === "False"}
                  onClick={() => {
                    setSendToLine("False");
                    setProceedWithoutApproval("True");
                    setIsApproved("");
                    setIsDenied("");
                  }}
                />
              }
              label="No"
            />
          </Grid>

          <Grid item xs={6} sm={3}>
            <Typography variant="subtitle1" className={classes.LabelTypography}>
              Date <span style={{ color: "red" }}>*</span>
            </Typography>
            {(MNRProcess.mnrProcessData.approval &&
              MNRProcess.mnrProcessData.approval.is_locked === "True") ||
            proceedWithoutApproval === "True" ? (
              <CustomTextfield
                id="stocks-allot-container-number"
                value={date}
                handleChange={(e) => setDate(e.target.value)}
                dispatchType={"SET_MNR_SEARCH_CONTAINER_NUMBER"}
                readOnlyP
              />
            ) : (
              <DatePickerField
                dateId="invoice-from-date"
                dateValue={date}
                dateChange={handleDateChange}
              />
            )}
          </Grid>

          <Grid item xs={6} sm={3} style={{ alignSelf: "flex-end" }}>
            <Typography variant="subtitle1" className={classes.LabelTypography}>
              Time <span style={{ color: "red" }}>*</span>
            </Typography>
            {(MNRProcess.mnrProcessData.approval &&
              MNRProcess.mnrProcessData.approval.is_locked === "True") ||
            proceedWithoutApproval === "True" ? (
              <CustomTextfield
                id="stocks-allot-container-number"
                value={time}
                handleChange={(e) => setTime(e.target.value)}
                dispatchType={"SET_MNR_SEARCH_CONTAINER_NUMBER"}
                readOnlyP
              />
            ) : (
              <CustomTextfield
                id="in-time"
                type="time"
                handleChange={(e) => setTime(e.target.value)}
                value={time}
                dispatchType={"SET_IN_TIME_MNR"}
              />
            )}
          </Grid>
        </Grid>

        <Grid container spacing={3} style={{ paddingTop: 20 }}>
          <Grid
            item
            xs={12}
            sm={3}
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Typography variant="subtitle2" style={{ paddingRight: 10 }}>
              is Approved?
            </Typography>
            <FormControlLabel
              value="yes"
              disabled={
                (MNRProcess.mnrProcessData.approval &&
                  MNRProcess.mnrProcessData.approval.is_locked === "True") ||
                proceedWithoutApproval === "True"
                  ? true
                  : false
              }
              control={
                <Radio
                  style={{ color: "#2A5FA5" }}
                  checked={isApproved === "True"}
                  onClick={() => {
                    setIsApproved("True");
                    setIsDenied("False");
                    setDenialReason("");
                    setApprovedDate(todayDate);
                    // setApprovedTime(todayTime);
                    setApprovedTime(MNRProcess.mnrProcessData.approval.time);
                  }}
                />
              }
              label="Yes"
            />
            <FormControlLabel
              value="no"
              disabled={
                (MNRProcess.mnrProcessData.approval &&
                  MNRProcess.mnrProcessData.approval.is_locked === "True") ||
                proceedWithoutApproval === "True"
                  ? true
                  : false
              }
              control={
                <Radio
                  style={{ color: "#2A5FA5" }}
                  checked={isApproved === "False"}
                  onClick={() => {
                    setIsApproved("False");
                    setIsDenied("True");
                    setApprovedDate("");
                    setApprovedTime("");
                  }}
                />
              }
              label="No"
            />
          </Grid>
          <Grid item xs={6} sm={3}>
            <Typography variant="subtitle1" className={classes.LabelTypography}>
              Approved Date{" "}
              {isApproved === "True" && <span style={{ color: "red" }}>*</span>}
            </Typography>
            {(MNRProcess.mnrProcessData.approval &&
              MNRProcess.mnrProcessData.approval.is_locked === "True") ||
            proceedWithoutApproval === "True" ||
            isApproved !== "True" ? (
              <CustomTextfield
                id="stocks-allot-container-number"
                value={approvedDate}
                handleChange={(e) => setApprovedDate(e.target.value)}
                dispatchType={"SET_MNR_SEARCH_CONTAINER_NUMBER"}
                readOnlyP
              />
            ) : (
              <DatePickerField
                dateId="stocks-allot-from-getin-date"
                dateValue={approvedDate}
                dateChange={handleApprovalDateChange}
              />
            )}
          </Grid>
          <Grid item xs={6} sm={3} style={{ alignSelf: "flex-end" }}>
            <Typography variant="subtitle1" className={classes.LabelTypography}>
              Approved Time{" "}
              {isApproved === "True" && <span style={{ color: "red" }}>*</span>}
            </Typography>
            {(MNRProcess.mnrProcessData.approval &&
              MNRProcess.mnrProcessData.approval.is_locked === "True") ||
            proceedWithoutApproval === "True" ||
            isApproved !== "True" ? (
              <CustomTextfield
                id="in-time"
                type="time"
                handleChange={(e) => setApprovedTime(e.target.value)}
                value={approvedTime}
                dispatchType={"SET_IN_TIME_MNR"}
                readOnlyP
              />
            ) : (
              <CustomTextfield
                id="in-time"
                type="time"
                handleChange={(e) => setApprovedTime(e.target.value)}
                value={approvedTime}
                dispatchType={"SET_IN_TIME_MNR"}
              />
            )}
          </Grid>

          <Grid item xs={6} sm={3} />

          <Grid
            item
            xs={6}
            sm={3}
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Typography variant="subtitle2" style={{ paddingRight: 10 }}>
              is Rejected?
            </Typography>
            <FormControlLabel
              value="yes"
              disabled={
                (MNRProcess.mnrProcessData.approval &&
                  MNRProcess.mnrProcessData.approval.is_locked === "True") ||
                proceedWithoutApproval === "True"
                  ? true
                  : false
              }
              control={
                <Radio
                  style={{ color: "#2A5FA5" }}
                  checked={isDenied === "True"}
                  onClick={() => {
                    setIsDenied("True");
                    setIsApproved("False");
                    setApprovedDate("");
                    setApprovedTime("");
                  }}
                />
              }
              label="Yes"
            />
            <FormControlLabel
              value="no"
              disabled={
                (MNRProcess.mnrProcessData.approval &&
                  MNRProcess.mnrProcessData.approval.is_locked === "True") ||
                proceedWithoutApproval === "True"
                  ? true
                  : false
              }
              control={
                <Radio
                  style={{ color: "#2A5FA5" }}
                  checked={isDenied === "False"}
                  onClick={() => {
                    setIsDenied("False");
                    setIsApproved("True");
                    setApprovedDate(todayDate);
                    setApprovedTime(todayTime);
                    setDenialReason("");
                  }}
                />
              }
              label="No"
            />
          </Grid>

          <Grid item xs={6} sm={3}>
            <Typography variant="subtitle1" className={classes.LabelTypography}>
              Denial Reason{" "}
              {isDenied === "True" && <span style={{ color: "red" }}>*</span>}
            </Typography>
            <TextField
              id="stocks-allot-client-name"
              disabled={
                (MNRProcess.mnrProcessData.approval &&
                  MNRProcess.mnrProcessData.approval.is_locked === "True") ||
                isDenied !== "True"
                  ? true
                  : false
              }
              select
              value={denialReason}
              variant="outlined"
              fullWidth
              inputProps={{ className: classes.input }}
              className={classes.selectTextField}
              onChange={(e) => {
                setDenialReason(e.target.value);
              }}
            >
              <MenuItem key={"REJECTED"} value={"REJECTED"}>
                REJECTED
              </MenuItem>
              <MenuItem key={"CANCEL"} value={"CANCEL"}>
                CANCEL
              </MenuItem>
              <MenuItem key={"PARTIALLY"} value={"PARTIALLY"}>
                PARTIALLY
              </MenuItem>
            </TextField>
          </Grid>

          <Grid item xs={6} sm={3}>
            <Typography variant="subtitle1" className={classes.LabelTypography}>
              Approval Amount
            </Typography>
            <CustomTextfield
              id="stocks-allot-container-number"
              value={approvalAmount}
              handleChange={(e) => setApprovalAmount(e.target.value)}
              dispatchType={"SET_MNR_SEARCH_CONTAINER_NUMBER"}
              readOnlyP
            />
          </Grid>

          <Grid item xs={6} sm={3}>
            <Typography variant="subtitle1" className={classes.LabelTypography}>
              Approved Amount
            </Typography>
            <CustomTextfield
              id="stocks-allot-container-number"
              value={approvedAmount}
              handleChange={(e) => setApprovedAmount(e.target.value)}
              dispatchType={"SET_MNR_SEARCH_CONTAINER_NUMBER"}
              readOnlyP
            />
          </Grid>

          <Grid item xs={6} sm={3}>
            <Typography variant="subtitle1" className={classes.LabelTypography}>
              Denied Amount
            </Typography>
            <CustomTextfield
              id="stocks-allot-container-number"
              value={deniedAmount}
              handleChange={(e) => setDeniedAmount(e.target.value)}
              dispatchType={"SET_MNR_SEARCH_CONTAINER_NUMBER"}
              readOnlyP
            />
          </Grid>

          <Grid item xs={6} sm={3}>
            <Typography variant="subtitle1" className={classes.LabelTypography}>
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

          <Grid item xs={6} sm={3}>
            <Typography variant="subtitle1" className={classes.LabelTypography}>
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
        </Grid>

        <Grid
          container
          spacing={3}
          style={{
            alignItems: "center",
            justifyContent: "center",
            paddingTop: 20,
          }}
        >
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
              className={classes.searchButton2}
              onClick={() => {
                let req = {};
                if (proceedWithoutApproval === "False" && date === "")
                  notify("Please Enter Approval Date", {
                    variant: "warning",
                  });
                else if (proceedWithoutApproval === "False" && time === "")
                  notify("Please Enter Approval Time", {
                    variant: "warning",
                  });
                else if (isApproved === "True" && approvedDate === "")
                  notify("Please Enter Approved Date", {
                    variant: "warning",
                  });
                else if (isApproved === "True" && approvedTime === "")
                  notify("Please Enter Approved Time", {
                    variant: "warning",
                  });
                else if (isDenied === "True" && denialReason === "")
                  notify("Please Enter Denial Reason", {
                    variant: "warning",
                  });
                else {
                  if (
                    MNRProcess.mnrProcessData.approval &&
                    MNRProcess.mnrProcessData.approval.pk
                  ) {
                    req = {
                      pk:
                        MNRProcess.mnrProcessData.approval &&
                        MNRProcess.mnrProcessData.approval.pk === undefined
                          ? ""
                          : MNRProcess.mnrProcessData.approval.pk,
                      estimate_id:
                        MNRProcess.mnrProcessData.approval &&
                        MNRProcess.mnrProcessData.approval.estimate_id,
                      location: localStorage.getItem("location")
                        ? localStorage.getItem("location")
                        : null,
                      site: localStorage.getItem("site")
                        ? localStorage.getItem("site")
                        : null,
                      date: date,
                      time: time,
                      approved_date:
                        approvedDate === undefined ? "" : approvedDate,
                      approved_time:
                        approvedTime === undefined ? "" : approvedTime,
                      denial_reason: denialReason,
                      approval_amount: approvalAmount,
                      approved_amount:
                        isApproved === "True" ? approvalAmount : "0.0",
                      denied_amount: deniedAmount,
                      sent_to_line: sendToLine,
                      is_approved: isApproved,
                      is_denied: isDenied,
                      proceed_without_approval: proceedWithoutApproval,
                      is_draft: "True",
                      is_proceed: "False",
                      reload_container_no:
                        MNRProcess.mnrProcessData.container_data &&
                        MNRProcess.mnrProcessData.container_data.container_no,
                      reload_container_date:
                        MNRProcess.mnrProcessData.container_data &&
                        MNRProcess.mnrProcessData.container_data.in_date,
                    };
                  } else {
                    req = {
                      estimate_id:
                        MNRProcess.mnrProcessData.approval &&
                        MNRProcess.mnrProcessData.approval.estimate_id,
                      location: localStorage.getItem("location")
                        ? localStorage.getItem("location")
                        : null,
                      site: localStorage.getItem("site")
                        ? localStorage.getItem("site")
                        : null,
                      date: date,
                      time: time,
                      approved_date:
                        approvedDate === undefined ? "" : approvedDate,
                      approved_time:
                        approvedTime === undefined ? "" : approvedTime,
                      denial_reason: denialReason,
                      approval_amount: approvalAmount,
                      approved_amount:
                        isApproved === "True" ? approvalAmount : "0.0",
                      denied_amount: deniedAmount,
                      sent_to_line: sendToLine,
                      is_approved: isApproved,
                      is_denied: isDenied,
                      proceed_without_approval: proceedWithoutApproval,
                      is_draft: "True",
                      is_proceed: "False",
                      reload_container_no:
                        MNRProcess.mnrProcessData.container_data &&
                        MNRProcess.mnrProcessData.container_data.container_no,
                      reload_container_date:
                        MNRProcess.mnrProcessData.container_data &&
                        MNRProcess.mnrProcessData.container_data.in_date,
                    };
                  }

                  console.log(req);

                  dispatch(createApproval(req, notify));
                }
              }}
              disabled={
                MNRProcess.mnrProcessData.approval &&
                MNRProcess.mnrProcessData.approval.is_locked === "True"
              }
            >
              Save
            </Button>
          </Grid>
        </Grid>
      </Paper>
    </>
  );
};
