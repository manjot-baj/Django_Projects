import React, { useState, useEffect } from "react";
import {
  Typography,
  Paper,
  TextField,
  MenuItem,
  Grid,
  Button,
  useTheme,
  useMediaQuery,
  Tab,
} from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import CustomTextfield from "@components/reusablecomponents/GateInTextField";
import DatePickerField from "@components/reusablecomponents/DatePickerField";
import LoadedYardSearch from "./LoadedYardSearch";
import {
  updateLoadedYardDetails,
  containerValidatorDispatch,
} from "../../actions/LoadedYardActions";
import { useSnackbar } from "notistack";
import { customLabelTypography } from "../../utils/CustomClasses";
import { TableFootercontainer } from "@/components/TableComponent/TableComponent";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";

const GateInYard = (props) => {
  const dispatch = useDispatch();
  const store = useSelector((state) => state);
  const { loadedYard, loadedYardSearch, user } = store;
  const [containerNumber, setContainerNumber] = useState("");
  const [size, setSize] = useState("");
  const [processType, setProcessType] = useState("");
  const [liner, setLiner] = useState("");
  const [inwardRake, setInwardRake] = useState("");
  const [outwardRake, setOutwardRake] = useState("");
  const [inDate, setInDate] = useState("");
  const [IITDate, setIITDate] = useState("");
  const [IITTime, setIITTime] = useState("");
  const [IITMoveCode, setIITMoveCode] = useState("");
  const [mtinDate, setMtinDate] = useState("");
  const [mtinTime, setMtinTime] = useState("");
  const [mtinMoveCode, setMtinMoveCode] = useState("");
  const [mirDate, setMirdate] = useState("");
  const [mirTime, setMirTime] = useState("");
  const [mirMoveCode, setMirMoveCode] = useState("");
  const [mitDate, setMitDate] = useState("");
  const [mitTime, setMitTime] = useState("");
  const [mitMoveCode, setMitMoveCode] = useState("");
  const [id, setId] = useState("");
  const [expinDate, setExpinDate] = useState("");
  const [expinTime, setExpinTime] = useState("");
  const [expinMoveCode, setExpinMoveCode] = useState("");
  const [bookingNo, setBookingNo] = useState("");
  const [sealNo, setSealNo] = useState("");
  const [report, setReport] = useState("");
  const [remark, setRemark] = useState("");
  const [port, setPort] = useState("");
  const [MITCurrentLocation, setMITCurrentLocation] = useState("");
  const notify = useSnackbar().enqueueSnackbar;
  const matchesIphone = useMediaQuery("(max-width:400px)");

  const theme = useTheme();
  useEffect(() => {
    setContainerNumber(loadedYard?.container_no);
    setId(loadedYard?.pk);
    setSize(loadedYard?.size);
    setProcessType(loadedYard?.process_type);
    setLiner(loadedYard?.liner);
    setInwardRake(loadedYard?.inward_rake);
    setOutwardRake(loadedYard?.outward_rake);
    setInDate(loadedYard?.in_date);
    setIITDate(loadedYard?.iit_date);
    setIITTime(loadedYard?.iit_time);
    setIITMoveCode(loadedYard?.iit_move_code);
    setMtinDate(loadedYard?.mtin_date);
    setMtinTime(loadedYard?.mtin_time);
    setMtinMoveCode(loadedYard?.mtin_move_code);
    setMirdate(loadedYard?.mir_date);
    setMirTime(loadedYard?.mir_time);
    setMirMoveCode(loadedYard?.mir_move_code);
    setMitDate(loadedYard?.mit_date);
    setMitTime(loadedYard?.mit_time);
    setMitMoveCode(loadedYard?.mit_move_code);
    setExpinDate(loadedYard?.expin_date);
    setExpinTime(loadedYard?.expin_time);
    setExpinMoveCode(loadedYard?.expin_move_code);
    setBookingNo(loadedYard?.booking_no);
    setSealNo(loadedYard?.seal_no);
    setReport(loadedYard?.report);
    setRemark(loadedYard?.remarks);
    setPort(loadedYard?.port);
    setMITCurrentLocation(loadedYard?.mit_current_location);
  }, [loadedYard, loadedYardSearch]);

  const handleContainerNumberChange = (event) => {
    setContainerNumber(event.target.value);
  };

  const handleContainerNumberOnBlur = (event) => {
    dispatch(
      containerValidatorDispatch(
        {
          container_no: event.target.value,
          location: localStorage.getItem("location")
            ? localStorage.getItem("location")
            : "",
          site: localStorage.getItem("site")
            ? localStorage.getItem("site")
            : null,
        },
        store.loadedYard.container_no,
        notify
      )
    );
    dispatch({ type: "LOADEDYARD_CONTAINER_NUMBER" });
  };

  const handleInDateChange = (date) => {
    var selectedDate = new Date(date);
    var dd = String(selectedDate.getDate()).padStart(2, "0");
    var mm = String(selectedDate.getMonth() + 1).padStart(2, "0"); //
    var yyyy = selectedDate.getFullYear();
    var selectedDateFormat = yyyy + "-" + mm + "-" + dd;
    setInDate(selectedDateFormat);
  };

  const handleIITDateChange = (date) => {
    var selectedDate = new Date(date);
    var dd = String(selectedDate.getDate()).padStart(2, "0");
    var mm = String(selectedDate.getMonth() + 1).padStart(2, "0"); //
    var yyyy = selectedDate.getFullYear();
    var selectedDateFormat = yyyy + "-" + mm + "-" + dd;
    setIITDate(selectedDateFormat);
  };

  const handleMtinDateChange = (date) => {
    var selectedDate = new Date(date);
    var dd = String(selectedDate.getDate()).padStart(2, "0");
    var mm = String(selectedDate.getMonth() + 1).padStart(2, "0"); //
    var yyyy = selectedDate.getFullYear();
    var selectedDateFormat = yyyy + "-" + mm + "-" + dd;
    setMtinDate(selectedDateFormat);
  };

  const handleMirDateChange = (date) => {
    var selectedDate = new Date(date);
    var dd = String(selectedDate.getDate()).padStart(2, "0");
    var mm = String(selectedDate.getMonth() + 1).padStart(2, "0"); //
    var yyyy = selectedDate.getFullYear();
    var selectedDateFormat = yyyy + "-" + mm + "-" + dd;
    setMirdate(selectedDateFormat);
  };

  const handleMitDateChange = (date) => {
    var selectedDate = new Date(date);
    var dd = String(selectedDate.getDate()).padStart(2, "0");
    var mm = String(selectedDate.getMonth() + 1).padStart(2, "0"); //
    var yyyy = selectedDate.getFullYear();
    var selectedDateFormat = yyyy + "-" + mm + "-" + dd;
    setMitDate(selectedDateFormat);
  };

  const handleExplainDateChange = (date) => {
    var selectedDate = new Date(date);
    var dd = String(selectedDate.getDate()).padStart(2, "0");
    var mm = String(selectedDate.getMonth() + 1).padStart(2, "0"); //
    var yyyy = selectedDate.getFullYear();
    var selectedDateFormat = yyyy + "-" + mm + "-" + dd;
    setExpinDate(selectedDateFormat);
  };

  let processArray = ["IN", "OUT"];

  return (
    <div>
      <LoadedYardSearch searchType="GateInYard" />
      {!matchesIphone && (
        <div
          style={{
            display: "flex",
            alignItems: "left",
            justifyContent: "space-around",
          }}
        >
          <Typography
            variant="subtitle2"
            style={{ paddingTop: 14, paddingBottom: 14 }}
          >
            Gate In Loaded Yard Container Details
          </Typography>
        </div>
      )}

      <Paper
        sx={(theme) => ({
          padding: theme.spacing(2, 3),
          [theme.breakpoints.down("md")]: {
            marginTop: 2,
          },
        })}
        elevation={0}
      >
        <Grid container spacing={1}>
          <Grid item size={{ xs: 12, sm: 6, lg: 3 }}>
            <Typography variant="subtitle1" sx={customLabelTypography}>
              Container Number <span style={{ color: "red" }}>*</span>
            </Typography>
            <TextField
              id="container-number"
              value={containerNumber}
              variant="filled"
              fullWidth
              sx={{
                "& .MuiOutlinedInput-root": {
                  "& fieldset": {
                    borderColor: "#243545",
                  },
                },
              }}
              size="small"
              onChange={handleContainerNumberChange}
              onBlur={handleContainerNumberOnBlur}
              dispatchType={""}
              InputProps={{
                readOnly: true,
              }}
              disabled
            />
          </Grid>
          <Grid item size={{ xs: 12, sm: 6, lg: 3 }}>
            <Typography variant="subtitle1" sx={customLabelTypography}>
              Size <span style={{ color: "red" }}>*</span>
            </Typography>
            <TextField
              id="container-size"
              value={size}
              variant="filled"
              fullWidth
              size="small"
              onChange={(e) => {
                setSize(e.target.value);
              }}
              dispatchType={"LOADEDYARD_SIZE"}
              readOnlyP
            />
          </Grid>
          <Grid item size={{ xs: 12, sm: 6, lg: 3 }}>
            <Typography variant="subtitle1" sx={customLabelTypography}>
              Process Type <span style={{ color: "red" }}>*</span>
            </Typography>
            <TextField
              id="container-type"
              select
              value={processType}
              variant="filled"
              fullWidth
              size="small"
              onChange={(e) => {
                setProcessType(e.target.value);
              }}
              dispatchType={"LOADEDYARD_PROCESSTYPE"}
              readOnlyP
              disabled
            >
              {processArray.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item size={{ xs: 12, sm: 6, lg: 3 }}>
            <Typography variant="subtitle1" sx={customLabelTypography}>
              Port <span style={{ color: "red" }}>*</span>
            </Typography>
            <CustomTextfield
              id="port"
              value={port}
              handleChange={(e) => {
                setPort(e.target.value);
              }}
              dispatchType={"LOADEDYARD_PORT"}
              readOnlyP
            />
          </Grid>
          <Grid item size={{ xs: 12, sm: 6, lg: 3 }}>
            <Typography variant="subtitle1" sx={customLabelTypography}>
              Liner
            </Typography>
            <CustomTextfield
              id="liner"
              value={liner}
              handleChange={(e) => {
                setLiner(e.target.value);
              }}
              dispatchType={"LOADEDYARD_LINER"}
              readOnlyP
            />
          </Grid>
          <Grid item size={{ xs: 12, sm: 6, lg: 3 }}>
            <Typography variant="subtitle1" sx={customLabelTypography}>
              Inward Rake
            </Typography>
            <CustomTextfield
              id="inward-rake"
              handleChange={(e) => {
                setInwardRake(e.target.value);
              }}
              value={inwardRake}
              dispatchType={"LOADEDYARD_INWARD_RAKE"}
              readOnlyP
            />
          </Grid>
          <Grid item size={{ xs: 12, sm: 6, lg: 3 }}>
            <Typography variant="subtitle1" sx={customLabelTypography}>
              Outward Rake
            </Typography>
            <CustomTextfield
              id="outward-rake"
              handleChange={(e) => {
                setOutwardRake(e.target.value);
              }}
              value={outwardRake}
              dispatchType={"LOADEDYARD_OUTWARD_RAKE"}
              readOnlyP
            />
          </Grid>

          <Grid item size={{ xs: 12, sm: 6, lg: 3 }}>
            <Typography variant="subtitle1" sx={customLabelTypography}>
              IN Date
            </Typography>

            <DatePickerField
              dateId="in-date"
              fullWidth
              dateValue={inDate}
              dateChange={handleInDateChange}
              dispatchType={"LOADEDYARD_IN_DATE"}
            />
          </Grid>

          <Grid item size={{ xs: 12, sm: 6, lg: 3 }}>
            <Typography variant="subtitle1" sx={customLabelTypography}>
              IIT Date <span style={{ color: "red" }}>*</span>
            </Typography>

            <DatePickerField
              fullWidth
              dateId="iit-date"
              dateValue={IITDate}
              dateChange={handleIITDateChange}
              dispatchType={"LOADEDYARD_IIT_DATE"}
            />
          </Grid>
          <Grid item size={{ xs: 12, sm: 6, lg: 3 }}>
            <Typography variant="subtitle1" sx={customLabelTypography}>
              IIT Time
            </Typography>
            <CustomTextfield
              id="iit-time"
              type="time"
              handleChange={(e) => setIITTime(e.target.value)}
              value={IITTime}
              dispatchType={"LOADEDYARD_IIT_TIME"}
            />
          </Grid>
          <Grid item size={{ xs: 12, sm: 6, lg: 3 }}>
            <Typography variant="subtitle1" sx={customLabelTypography}>
              IIT Move Code
            </Typography>
            <CustomTextfield
              id="iit-move-code"
              handleChange={(e) => setIITMoveCode(e.target.value)}
              value={IITMoveCode}
              dispatchType={"LOADEDYARD_IIT_MOVE_CODE"}
              readOnlyP
            />
          </Grid>

          <Grid item size={{ xs: 12, sm: 6, lg: 3 }}>
            <Typography variant="subtitle1" sx={customLabelTypography}>
              MTIN Date
            </Typography>

            <DatePickerField
              fullWidth
              dateId="mtin-date"
              dateValue={mtinDate}
              dateChange={handleMtinDateChange}
              dispatchType={"LOADEDYARD_MTIN_DATE"}
            />
          </Grid>
          <Grid item size={{ xs: 12, sm: 6, lg: 3 }}>
            <Typography variant="subtitle1" sx={customLabelTypography}>
              MTIN Time
            </Typography>
            <CustomTextfield
              id="mtin-time"
              type="time"
              handleChange={(e) => setMtinTime(e.target.value)}
              value={mtinTime}
              dispatchType={"LOADEDYARD_MTIN_TIME"}
            />
          </Grid>
          <Grid item size={{ xs: 12, sm: 6, lg: 3 }}>
            <Typography variant="subtitle1" sx={customLabelTypography}>
              MTIN Move Code
            </Typography>
            <CustomTextfield
              id="mtin-move-code"
              handleChange={(e) => setMtinMoveCode(e.target.value)}
              value={mtinMoveCode}
              dispatchType={"LOADEDYARD_MTIN_MOVE_CODE"}
              readOnlyP
            />
          </Grid>

          <Grid item size={{ xs: 12, sm: 6, lg: 3 }}>
            <Typography variant="subtitle1" sx={customLabelTypography}>
              MIR Date
            </Typography>

            <DatePickerField
              fullWidth
              dateId="mir-date"
              dateValue={mirDate}
              dateChange={handleMirDateChange}
              dispatchType={"LOADEDYARD_MIR_DATE"}
            />
          </Grid>
          <Grid item size={{ xs: 12, sm: 6, lg: 3 }}>
            <Typography variant="subtitle1" sx={customLabelTypography}>
              MIR Time
            </Typography>
            <CustomTextfield
              id="in-time"
              type="time"
              handleChange={(e) => setMirTime(e.target.value)}
              value={mirTime}
              dispatchType={"LOADEDYARD_MIR_TIME"}
            />
          </Grid>
          <Grid item size={{ xs: 12, sm: 6, lg: 3 }}>
            <Typography variant="subtitle1" sx={customLabelTypography}>
              MIR Move Code
            </Typography>
            <CustomTextfield
              id="mir-move-code"
              handleChange={(e) => setMirMoveCode(e.target.value)}
              value={mirMoveCode}
              dispatchType={"LOADEDYARD_MIR_MOVE_CODE"}
              readOnlyP
            />
          </Grid>

          <Grid item size={{ xs: 12, sm: 6, lg: 3 }}>
            <Typography variant="subtitle1" sx={customLabelTypography}>
              MIT Date
            </Typography>
            <DatePickerField
              fullWidth
              dateId="mit-date"
              dateValue={mitDate}
              dateChange={handleMitDateChange}
              dispatchType={"LOADEDYARD_MIT_DATE"}
            />
          </Grid>
          <Grid item size={{ xs: 12, sm: 6, lg: 3 }}>
            <Typography variant="subtitle1" sx={customLabelTypography}>
              MIT Time
            </Typography>
            <CustomTextfield
              id="in-time"
              type="time"
              handleChange={(e) => setMitTime(e.target.value)}
              value={mitTime}
              dispatchType={"LOADEDYARD_MIT_TIME"}
            />
          </Grid>
          <Grid item size={{ xs: 12, sm: 6, lg: 3 }}>
            <Typography variant="subtitle1" sx={customLabelTypography}>
              MIT Current Location
            </Typography>
            <CustomTextfield
              id="in-time"
              type="text"
              handleChange={(e) => setMITCurrentLocation(e.target.value)}
              value={MITCurrentLocation}
              dispatchType={"LOADEDYARD_MIT_CURRENT_LOCATION"}
            />
          </Grid>
          <Grid item size={{ xs: 12, sm: 6, lg: 3 }}>
            <Typography variant="subtitle1" sx={customLabelTypography}>
              MIT Move Code
            </Typography>
            <CustomTextfield
              id="tare-weight"
              handleChange={(e) => setMitMoveCode(e.target.value)}
              value={mitMoveCode}
              dispatchType={"LOADEDYARD_MIT_MOVE_CODE"}
              readOnlyP
            />
          </Grid>

          <Grid item size={{ xs: 12, sm: 6, lg: 3 }}>
            <Typography variant="subtitle1" sx={customLabelTypography}>
              Expin Date
            </Typography>
            <DatePickerField
            fullWidth
              dateId="explin-date"
              dateValue={expinDate}
              dateChange={handleExplainDateChange}
              dispatchType={"LOADEDYARD_EXPIN_DATE"}
            />
          </Grid>
          <Grid item size={{ xs: 12, sm: 6, lg: 3 }}>
            <Typography variant="subtitle1" sx={customLabelTypography}>
              Expin Time
            </Typography>
            <CustomTextfield
              id="in-time"
              type="time"
              handleChange={(e) => setExpinTime(e.target.value)}
              value={expinTime}
              dispatchType={"LOADEDYARD_EXPIN_TIME"}
            />
          </Grid>
          <Grid
            item
            size={{ xs: 12, sm: 6, lg: 3 }}
         
          >
            <Typography variant="subtitle1" sx={customLabelTypography}>
              Expin Move Code
            </Typography>
            <CustomTextfield
              id="tare-weight"
              handleChange={(e) => setExpinMoveCode(e.target.value)}
              value={expinMoveCode}
              dispatchType={"LOADEDYARD_EXPIN_MOVE_CODE"}
              readOnlyP
            />
          </Grid>

          <Grid
            item
            size={{ xs: 12, sm: 6, lg: 3 }}
          
          >
            <Typography variant="subtitle1" sx={customLabelTypography}>
              Booking Number
            </Typography>
            <CustomTextfield
              id="tare-weight"
              handleChange={(e) => setBookingNo(e.target.value)}
              value={bookingNo}
              dispatchType={"LOADEDYARD_BOOKING_NUMBER"}
              readOnlyP
            />
          </Grid>
          <Grid
            item
            size={{ xs: 12, sm: 6, lg: 3 }}
          
          >
            <Typography variant="subtitle1" sx={customLabelTypography}>
              Seal Number
            </Typography>
            <CustomTextfield
              id="tare-weight"
              handleChange={(e) => setSealNo(e.target.value)}
              value={sealNo}
              dispatchType={"LOADEDYARD_SEAL_NUMBER"}
              readOnlyP
            />
          </Grid>
          <Grid
            item
            size={{ xs: 12, sm: 6, lg: 3 }}
    
          >
            <Typography variant="subtitle1" sx={customLabelTypography}>
              Report
            </Typography>
            <CustomTextfield
              id="tare-weight"
              handleChange={(e) => setReport(e.target.value)}
              value={report}
              dispatchType={"LOADEDYARD_REPORT"}
              readOnlyP
            />
          </Grid>
          <Grid
            item
            size={{ xs: 12, sm: 6, lg: 3 }}
         
          >
            <Typography variant="subtitle1" sx={customLabelTypography}>
              Remark
            </Typography>
            <CustomTextfield
              id="tare-weight"
              handleChange={(e) => setRemark(e.target.value)}
              value={remark}
              dispatchType={"LOADEDYARD_REMARKS"}
              readOnlyP
            />
          </Grid>
        </Grid>
      </Paper>
      <TableFootercontainer>
        <Button
          variant="contained"
          color="primary"
          sx={{ width: 240 ,borderRadius:12}}
          size="small"
          style={{ marginRight: 16 }}
          onClick={() => {
            let data = {
              pk: id,
              container_no: containerNumber,
              size: size,
              in_date: inDate,
              port: port,
              process_type: processType,
              liner: liner,
              inward_rake: inwardRake,
              outward_rake: outwardRake,
              iit_date: IITDate,
              iit_time: IITTime,
              iit_move_code: IITMoveCode,
              mtin_date: mtinDate,
              mtin_time: mtinTime,
              mtin_move_code: mtinMoveCode,
              mir_date: mirDate,
              mir_time: mirTime,
              mir_move_code: mirMoveCode,
              mit_date: mitDate,
              mit_time: mitTime,
              mit_move_code: mitMoveCode,
              expin_date: expinDate,
              expin_time: expinTime,
              expin_move_code: expinMoveCode,
              booking_no: bookingNo,
              seal_no: sealNo,
              report: report,
              remarks: remark,
              mit_current_location: MITCurrentLocation,
              location: localStorage.getItem("location")
                ? localStorage.getItem("location")
                : null,
              site: localStorage.getItem("site")
                ? localStorage.getItem("site")
                : null,
            };
            dispatch(updateLoadedYardDetails(data, notify));
          }}
          startIcon={<EditOutlinedIcon fontSize="small" />}
        >
          Update Details
        </Button>
      </TableFootercontainer>
    </div>
  );
};
export default GateInYard;
