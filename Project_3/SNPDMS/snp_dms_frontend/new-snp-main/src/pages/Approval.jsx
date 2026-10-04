import React, { useEffect, useState } from "react";
import {
  TextField,
  MenuItem,
  FormControlLabel,
  Radio,
  Grid,
  Button,
  Typography,
  Paper
} from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { useSnackbar } from "notistack";
import CustomTextfield from "@components/reusablecomponents/GateInTextField";
import DatePickerField from "@components/reusablecomponents/DatePickerField";
import { createApproval } from "../actions/MNRProcessActions";
import { customLabelTypography } from "../utils/CustomClasses";



export const Approval = () => {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [updated_by, setUpdatedBy] = useState("");
  const [created_by, setCreatedBy] = useState("");
  const dispatch = useDispatch();
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
      <Paper sx={(theme)=>({
          padding: theme.spacing(4, 3),
       
      })} elevation={0}>
        <Grid container spacing={3} style={{ paddingTop: 20 }}>
          <Grid
            item
            size={{xs:12,sm:3}}
           
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
            size={{xs:12,sm:3}}
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

          <Grid item size={{xs:6,sm:3}} >
            <Typography variant="subtitle1" sx={customLabelTypography}>
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

          <Grid item size={{xs:6,sm:3}}  style={{ alignSelf: "flex-end" }}>
            <Typography variant="subtitle1" sx={customLabelTypography}>
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
         
            size={{xs:12,sm:3}}
          
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
          <Grid item size={{xs:6,sm:3}} >
            <Typography variant="subtitle1" sx={customLabelTypography}>
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
          <Grid item size={{xs:6,sm:3}}  style={{ alignSelf: "flex-end" }}>
            <Typography variant="subtitle1" sx={customLabelTypography}>
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

          <Grid item size={{xs:3,sm:3}} />

          <Grid
            item
            size={{xs:6,sm:3}} 
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

          <Grid item size={{xs:6,sm:3}} >
            <Typography variant="subtitle1" sx={customLabelTypography}>
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
              size="small"
              sx={{
                "& .MuiOutlinedInput-root": {
                  "& fieldset": {
                    borderColor: "#243545",
                  },
                },
              }}
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

          <Grid item size={{xs:6,sm:3}} >
            <Typography variant="subtitle1" sx={customLabelTypography}>
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

          <Grid item size={{xs:6,sm:3}} >
            <Typography variant="subtitle1" sx={customLabelTypography}>
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

          <Grid item size={{xs:6,sm:3}} >
            <Typography variant="subtitle1" sx={customLabelTypography}>
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

          <Grid item size={{xs:6,sm:3}} >
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

          <Grid item size={{xs:6,sm:3}} >
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
            variant="contained"
            color="primary"
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
