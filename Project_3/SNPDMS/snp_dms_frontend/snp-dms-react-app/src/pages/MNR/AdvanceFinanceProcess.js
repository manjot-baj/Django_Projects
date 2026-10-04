import React, { useEffect, useState } from "react";
import LayoutContainer from "../../components/reusableComponents/LayoutContainer";
import { useLocation, useHistory } from "react-router-dom";
import {
  Box,
  Button,
  styled,
  Typography,
  makeStyles,
  Grid,
  Paper,
  Select,
  MenuItem,
  TextField,
  Divider,
  FormControl,
  InputLabel,
  useMediaQuery,
  TableCell,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableBody,
  Backdrop,
  CircularProgress,
} from "@material-ui/core";
import {
  addPreGateInDataAction,
  addPreGateInDoScanDataAction,
  addPreGateOutDataAction,
  getPreGateDOScanDataAction,
  getPreGateOutPreFillAction,
  getSingleAdvanceFinanceProcessAction,
  importPreGateInData,
  updatePreGateInDataAction,
  updatePreGateOutDataAction,
} from "../../actions/AdvanceFinance/AdvanceFinanceAction";
import { useSnackbar } from "notistack";
import { useDispatch, useSelector } from "react-redux";
import ArrowForwardIosSharpIcon from "@mui/icons-material/ArrowForwardIosSharp";
import MuiAccordion from "@mui/material/Accordion";
import MuiAccordionSummary, {
  accordionSummaryClasses,
} from "@mui/material/AccordionSummary";
import MuiAccordionDetails from "@mui/material/AccordionDetails";
import { Alert, Stack } from "@mui/material";
import { theme } from "../../App";
import { ADVANCE_FINANCE_CONSTANT } from "../../reducers/AdvanceFinance/AdvanceFinanceReducer";
import {
  handleContainerNumberChangeUtils,
  handleContainerNumberOnBlurUtils,
} from "../../utils/Utils";
import DatePickerField from "../../components/reusableComponents/DatePickerField";
import { handleDateChangeUTILSDispatch } from "../../utils/WeekNumbre";
import PreGateInList from "../../components/advanceFinance/PreGateInList";
import PreGateOutList from "../../components/advanceFinance/PreGateOutList";
import {
  dropDownDispatch,
  dropDownPreGateOUTContainerActionDispatch,
} from "../../actions/GateInActions";
import GateInTextField from "../../components/reusableComponents/GateInTextField";

const useStyles = makeStyles((theme) => ({
  cashButton: {
    backgroundColor: "rgb(233,244,239)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "rgb(61,154,106)",
    elevation: 0,
    borderRadius: 8,
    boxShadow: 0,
    padding: "4px 8px",
  },
  heading: {
    [theme.breakpoints.down("sm")]: {
      marginTop: "24px",
      marginLeft: "12px",
    },
  },
  addPreGateOut: {
    width: "200px",
    margin: "auto",
    display: "block",
  },
  remainingButton: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgb(231,231,253)",
    color: "rgb(106,108,246)",
    elevation: 0,
    borderRadius: 8,
    boxShadow: 0,
    padding: "4px 8px",
  },
  paymentContainer: {
    width: "100%",
    margin: "auto",
    marginTop: "20px",
    marginRight: 0,
  },
  backdrop: {
    zIndex: theme.zIndex.drawer + 1,
    color: "#fff",
  },
  containerDetails: {
    padding: theme.spacing(2),
    borderRadius: 10,
    backgroundColor: theme.palette.background.paper,
    margin: "auto",
    marginTop: "8px",
  },
  textField: {
    "& .MuiOutlinedInput-root": {
      "& fieldset": {
        borderColor: "#243545",
      },
    },
  },
  choiceSelectContainer: {
    border: "1px solid #243545",
    marginTop: "0rem",
    display: "flex",
    borderRadius: 6,
  },
  input: {
    padding: 7,
  },
  choice: {
    backgroundColor: "#fff",
    width: "100%",
    padding: 1,
  },
  selectedChoice: {
    borderRadius: 5,
    color: "#fff",
    backgroundColor: "#2F6FB7",
    width: "100%",
    padding: 1,
    "&:hover": {
      backgroundColor: "#2F6FB7",
    },
  },
  LabelTypography: {
    fontSize: 14,
    fontWeight: 600,
    color: "#243545",
    paddingBottom: 4,
    [theme.breakpoints.down("sm")]: {
      paddingBottom: 1,
    },
  },
  bulkUploadButton: {
    backgroundColor: "#2ac08f",
    color: "#fff",
    padding: "10px 20px",
    borderRadius: 5,
    fontWeight: 600,
    fontSize: "12px",
  },
  searchBox: {
    backgroundColor: "rgb(223,230,236)",
    borderRadius: 8,
    padding: 8,
    width: "100%",
  },
  searchContainerButton: {
    backgroundColor: "rgb(253,189,46)",
  },
  textField: {
    "& .MuiOutlinedInput-root": {
      "& fieldset": {
        borderColor: "#243545",
      },
    },
  },
  preGateOutSearch: {
    padding: theme.spacing(2),
    borderRadius: 8,
    elevation: "none",
    backgroundColor: theme.palette.background.paper,
    margin: "12px 12px 12px 0",
    width: "100%",
  },
  input: {
    padding: 7,
  },
}));

const Accordion = styled((props) => (
  <MuiAccordion disableGutters elevation={0} square {...props} />
))(({ theme }) => ({
  borderRadius: "8px",
  border: `1px solid ${theme.palette.divider}`,
  "&:not(:last-child)": {
    borderBottom: 0,
  },
  "&::before": {
    display: "none",
  },
}));

const AccordionSummary = styled((props) => (
  <MuiAccordionSummary
    expandIcon={<ArrowForwardIosSharpIcon sx={{ fontSize: "0.9rem" }} />}
    {...props}
  />
))(({ theme }) => ({
  backgroundColor: "rgba(0, 0, 0, .03)",
  width: "100%",
  flexDirection: "row-reverse",
  [`& .${accordionSummaryClasses.expandIconWrapper}.${accordionSummaryClasses.expanded}`]:
    {
      transform: "rotate(90deg)",
    },
  [`& .${accordionSummaryClasses.content}`]: {
    marginLeft: theme.spacing(1),
  },
}));

const AccordionDetails = styled(MuiAccordionDetails)(({ theme }) => ({
  padding: 10,
  borderTop: "1px solid rgba(0, 0, 0, .125)",
}));

const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: "300px",
      marginTop: 50,
    },
  },
};

const AdvanceFinanceProcess = () => {
  const { search } = useLocation();
  const history = useHistory();
  const notify = useSnackbar().enqueueSnackbar;
  const dispatch = useDispatch();
  const classes = useStyles();
  const searchParams = new URLSearchParams(search);
  const formData = new FormData();
  const { AdvanceFinanceReducer, gateIn, ui } = useSelector((state) => state);
  const { preGateInEdit, preGateOutEdit, preGateOutTable, doScanEdit } =
    AdvanceFinanceReducer;
  const { advanceProcess } = AdvanceFinanceReducer;
  const paymentID = searchParams.get("id");
  const paymentType = searchParams.get("type");
  const paymentBillingNo = searchParams.get("billing_no");
  const paymentBookingNo = searchParams.get("booking_no");
  const [expanded, setExpanded] = React.useState("");
  const [selectedContainer, setSelectedContainer] = useState("");
  const matchesIphone = useMediaQuery("(max-width:500px)");

  const handleChange = (panel) => (event, newExpanded) => {
    setExpanded(newExpanded ? panel : false);
  };

  useEffect(() => {
    if (paymentID === undefined || paymentID === "" || paymentID === null) {
      history.push("/lolo-payment/advance-lolo-payment");
    } else {
      dispatch({ type: ADVANCE_FINANCE_CONSTANT.PRE_GATE_IN_EDIT_INIT });

      dispatch(getSingleAdvanceFinanceProcessAction(paymentID, notify));
      let reqArray = [];
      dispatch(dropDownDispatch(reqArray, notify));
      if (paymentType === "OUT") {
        dispatch(
          dropDownPreGateOUTContainerActionDispatch(paymentBookingNo, notify)
        );
      }
    }
  }, []);

  useEffect(() => {
    if (paymentType === "IN") {
      dispatch({
        type: ADVANCE_FINANCE_CONSTANT.PRE_GATE_IN_EDIT,
        payload: { bl_no: paymentBillingNo },
      });
    } else {
      dispatch({
        type: ADVANCE_FINANCE_CONSTANT.PRE_GATE_OUT_EDIT,
        payload: { bk_no: paymentBookingNo },
      });
    }
  }, [preGateInEdit.bl_no, preGateOutEdit.bk_no]);

  const handleChangePreGateIn = (e) => {
    const { name, value } = e.target;

    dispatch({
      type: ADVANCE_FINANCE_CONSTANT.PRE_GATE_IN_EDIT,
      [name]: value,
    });
  };

  const handleChangeDoScanEdit = (e) => {
    const { name, value } = e.target;

    dispatch({
      type: ADVANCE_FINANCE_CONSTANT.DO_SCAN_EDIT,
      [name]: value,
    });
  };

  const handleDoScanCancel = () => {
    dispatch({ type: ADVANCE_FINANCE_CONSTANT.DO_SCAN_EDIT_INT });
    setExpanded("");
  };

  const handleAddPreGateIN = () => {
    if (preGateInEdit.client === "") {
      notify("Please Fill Client", { variant: "warning" });
    } else if (preGateInEdit.type === "") {
      notify("Please Fill Type", { variant: "warning" });
    } else if (preGateInEdit.size === "") {
      notify("Please Fill Size", { variant: "warning" });
    } else if (preGateInEdit.container_no === "") {
      notify("Please Fill Container No", { variant: "warning" });
    } else if (preGateInEdit.shipping_line === "") {
      notify("Please Fill Shipping Line", { variant: "warning" });
    } else if (preGateInEdit.bl_no === "") {
      notify("Please Fill BL No", { variant: "warning" });
    } else if (preGateInEdit.do_validity_in_date === "") {
      notify("Please Fill  Validity In Date", { variant: "warning" });
    } else if (preGateInEdit.do_validity_in_time === "") {
      notify("Please Fill  Validity In Time", { variant: "warning" });
    } else if (preGateInEdit.arrived === "") {
      notify("Please Choose Arrival Status", { variant: "warning" });
    } else {
      dispatch(addPreGateInDataAction(paymentID, notify));
    }
  };

  const handleUpdatePreGateIn = () => {
    if (preGateInEdit.on_hold === true) {
      notify("On hold Container cannot be updated", { variant: "info" });
    } else if (preGateInEdit.is_gatein_done === true) {
      notify("Gatein Container cannot be updated", { variant: "info" });
    } else if (preGateInEdit.validity_expired === true) {
      notify("Validity Expired Container cannot be updated", {
        variant: "info",
      });
    } else if (preGateInEdit.client === "") {
      notify("Please Fill Client", { variant: "warning" });
    } else if (preGateInEdit.type === "") {
      notify("Please Fill Type", { variant: "warning" });
    } else if (preGateInEdit.size === "") {
      notify("Please Fill Size", { variant: "warning" });
    } else if (preGateInEdit.container_no === "") {
      notify("Please Fill Container No", { variant: "warning" });
    } else if (preGateInEdit.shipping_line === "") {
      notify("Please Fill Shipping Line", { variant: "warning" });
    } else if (preGateInEdit.bl_no === "") {
      notify("Please Fill BL No", { variant: "warning" });
    } else if (preGateInEdit.do_validity_in_date === "") {
      notify("Please Fill  Validity In Date", { variant: "warning" });
    } else if (preGateInEdit.do_validity_in_time === "") {
      notify("Please Fill  Validity In Time", { variant: "warning" });
    } else if (preGateInEdit.arrived === "") {
      notify("Please Choose Arrival Status", { variant: "warning" });
    } else {
      dispatch(updatePreGateInDataAction(notify));
    }
  };

  const handleAddPreGateOut = () => {
    if (preGateOutEdit.do_validity_out_date === "") {
      notify("Please Enter Valisity Date", { variant: "warning" });
    } else if (preGateOutEdit.container_no === "") {
      notify("Please Enter Container No", { variant: "warning" });
    } else if (preGateOutEdit.do_validity_out_time === "") {
      notify("Please Enter Validity Time", { variant: "warning" });
    } else if (preGateOutEdit.bk_no === "") {
      notify("Please Enter BK No", { variant: "warning" });
    } else if (preGateOutEdit.departed === "") {
      notify("Please Choose Departed Status ", { variant: "warning" });
    } else {
      dispatch(addPreGateOutDataAction(paymentBookingNo, paymentID, notify));
    }
  };

  const handleUpdatePreGateOut = () => {
    if (preGateOutEdit.client === "") {
      notify("Please Fill Client", { variant: "warning" });
    } else if (preGateOutEdit.type === "") {
      notify("Please Fill Type", { variant: "warning" });
    } else if (preGateOutEdit.size === "") {
      notify("Please Fill Size", { variant: "warning" });
    } else if (preGateOutEdit.container_no === "") {
      notify("Please Fill Container No", { variant: "warning" });
    } else if (preGateOutEdit.shipping_line === "") {
      notify("Please Fill Shipping Line", { variant: "warning" });
    } else if (preGateOutEdit.bl_no === "") {
      notify("Please Fill BL No", { variant: "warning" });
    } else if (preGateOutEdit.do_validity_in_date === "") {
      notify("Please Fill  Validity In Date", { variant: "warning" });
    } else if (preGateOutEdit.do_validity_in_time === "") {
      notify("Please Fill  Validity In Time", { variant: "warning" });
    } else if (preGateOutEdit.departed === "") {
      notify("Please Choose Departed Status", { variant: "warning" });
    } else {
      dispatch(
        dropDownPreGateOUTContainerActionDispatch(paymentBookingNo, notify)
      );
      setSelectedContainer("");
      dispatch(updatePreGateOutDataAction(notify));
    }
  };

  const handleSearchContainer = () => {
    if (selectedContainer) {
      dispatch(getPreGateOutPreFillAction(selectedContainer, notify));
    } else {
      notify("Please select a container", { variant: "error" });
    }
  };

  const handleDoScanUpload = () => {
    if (doScanEdit.client === "") {
      notify("Please Fill Client", { variant: "warning" });
    } else if (doScanEdit.shipping_line === "") {
      notify("Please Fill Shipping Line", { variant: "warning" });
    } else if (doScanEdit.do_validity_in_time === "") {
      notify("Please Fill  Validity In Time", { variant: "warning" });
    } else if (doScanEdit.arrived === "") {
      notify("Please Choose Arrival Status", { variant: "warning" });
    } else {
      let do_scan_data = doScanEdit?.fileData?.importable_data.map((item) => {
        delete item.client;
        delete item.arrived;
        delete item.sr_no;
        item.do_validity_in_date = item?.do_validity_in_date;
        delete item.do_validity_in_time;
        delete item.remarks;
        delete item.cargo;
        delete item.consignee;
        delete item.shipper;
        return {
          client: doScanEdit.client,
          remarks: "",
          cargo: "",
          consignee: "",
          shipper: "",
          bl_no: paymentBillingNo,
          shipping_line: doScanEdit.shipping_line,
          do_validity_in_date: item.do_validity_in_date,
          do_validity_in_time: doScanEdit.do_validity_in_time
            ?.split(":")
            ?.join("_"),
          arrived: doScanEdit.arrived,
          ...item,
        };
      });
      let importData = {
        importable_data: do_scan_data,
        location: localStorage.getItem("location")
          ? localStorage.getItem("location")
          : null,
        site: localStorage.getItem("site")
          ? localStorage.getItem("site")
          : null,
        adv_payment_id: paymentID,
      };

      dispatch(
        importPreGateInData(importData, notify, history, paymentID, setExpanded)
      );
      // dispatch(addPreGateInDoScanDataAction(paymentID,do_scan_data,notify,setExpanded))
    }
  };

  return (
    <LayoutContainer footer={false}>
      <Typography variant="body2" className={classes.heading}>
        Payment Details
      </Typography>
      <Box mt={2}></Box>
      <Accordion
        expanded={expanded === "panel1"}
        onChange={handleChange("panel1")}
      >
        <AccordionSummary aria-controls="panel1d-content" id="panel1d-header">
          <Stack
            direction={"row"}
            justifyContent={"space-between"}
            alignItems={"center"}
            width={"100%"}
          >
            <Box className={classes.typeButton} ml={2}>
              <Typography variant="body1">
                {advanceProcess?.adv_payment_data?.client} -{" "}
                {
                  advanceProcess?.adv_payment_data?.[
                    paymentType === "IN" ? "bl_no" : "bk_no"
                  ]
                }
              </Typography>
            </Box>

            <Box className={classes.cashButton}>
              {advanceProcess?.adv_payment_data?.payment_type} -{" "}
              {advanceProcess?.adv_payment_data?.original_amount}
              <Divider
                orientation="vertical"
                flexItem
                style={{ marginLeft: "12px", marginRight: "12px" }}
              />
              {"Remaining Amount"} - {""}
              {advanceProcess?.adv_payment_data?.remaining_amount}
            </Box>
            {!matchesIphone && (
              <Box className={classes.remainingButton}>
                Quantity - {advanceProcess?.adv_payment_data?.quantity}
                <Divider
                  orientation="vertical"
                  flexItem
                  style={{ marginLeft: "12px", marginRight: "12px" }}
                />
                {"Remaining"} - {""}
                {advanceProcess?.adv_payment_data?.remaining}
              </Box>
            )}
          </Stack>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={2} className={classes.paymentContainer}>
            <Grid item xs={6} sm={6} md={3}>
              <Typography variant="caption">Client</Typography>
            </Grid>
            <Grid item xs={6} sm={6} md={3}>
              <Typography variant="body1">
                {advanceProcess?.adv_payment_data?.client}
              </Typography>
            </Grid>
            <Grid item xs={6} sm={6} md={3}>
              <Typography variant="caption">
                {paymentType === "IN" ? "Billing" : "Booking"} No
              </Typography>
            </Grid>
            <Grid item xs={6} sm={6} md={3}>
              <Typography variant="body1">
                {
                  advanceProcess?.adv_payment_data?.[
                    paymentType === "IN" ? "bl_no" : "bk_no"
                  ]
                }
              </Typography>
            </Grid>
            <Grid item xs={6} sm={6} md={3}>
              <Typography variant="caption">Date</Typography>
            </Grid>
            <Grid item xs={6} sm={6} md={3}>
              <Typography variant="body1">
                {advanceProcess?.adv_payment_data?.created_at}
              </Typography>
            </Grid>
            <Grid item xs={6} sm={6} md={3}>
              <Typography variant="caption">Entry Type</Typography>
            </Grid>
            <Grid item xs={6} sm={6} md={3}>
              <Typography variant="body1">
                {advanceProcess?.adv_payment_data?.entry_type}
              </Typography>
            </Grid>
            <Grid item xs={6} sm={6} md={3}>
              <Typography variant="caption">Payment Type</Typography>
            </Grid>
            <Grid item xs={6} sm={6} md={3}>
              <Typography variant="body1">
                {advanceProcess?.adv_payment_data?.payment_type}
              </Typography>
            </Grid>
            <Grid item xs={6} sm={6} md={3}>
              <Typography variant="caption">Original Amount</Typography>
            </Grid>
            <Grid item xs={6} sm={6} md={3}>
              <Typography variant="body1">
                {advanceProcess?.adv_payment_data?.original_amount}
              </Typography>
            </Grid>
            <Grid item xs={6} sm={6} md={3}>
              <Typography variant="caption">TDS %</Typography>
            </Grid>
            <Grid item xs={6} sm={6} md={3}>
              <Typography variant="body1">
                {advanceProcess?.adv_payment_data?.tds}
              </Typography>
            </Grid>
            <Grid item xs={6} sm={6} md={3}>
              <Typography variant="caption">Total Amount without Tax</Typography>
            </Grid>
            <Grid item xs={6} sm={6} md={3}>
              <Typography variant="body1">
                {advanceProcess?.adv_payment_data?.total_amount_without_tax}
              </Typography>
            </Grid>
            <Grid item xs={6} sm={6} md={3}>
              <Typography variant="caption">Total Tax</Typography>
            </Grid>
            <Grid item xs={6} sm={6} md={3}>
              <Typography variant="body1">
                {advanceProcess?.adv_payment_data?.total_tax}
              </Typography>
            </Grid>
            <Grid item xs={6} sm={6} md={3}>
              <Typography variant="caption">Total TDS</Typography>
            </Grid>
            <Grid item xs={6} sm={6} md={3}>
              <Typography variant="body1">
                {advanceProcess?.adv_payment_data?.total_tds}
              </Typography>
            </Grid>
            <Grid item xs={6} sm={6} md={3}>
              <Typography variant="caption">Total Amount with GST and TDS</Typography>
            </Grid>
            <Grid item xs={6} sm={6} md={3}>
              <Typography variant="body1">
                {advanceProcess?.adv_payment_data?.total_amount_with_gst_tds}
              </Typography>
            </Grid>
            <Grid item xs={6} sm={6} md={3}>
              <Typography variant="caption">Size 20 rate</Typography>
            </Grid>
            <Grid item xs={6} sm={6} md={3}>
              <Typography variant="body1">
                {advanceProcess?.adv_payment_data?.size_20_rate}
              </Typography>
            </Grid>
            <Grid item xs={6} sm={6} md={3}>
              <Typography variant="caption">Size 40 rate</Typography>
            </Grid>
            <Grid item xs={6} sm={6} md={3}>
              <Typography variant="body1">
                {advanceProcess?.adv_payment_data?.size_40_rate}
              </Typography>
            </Grid>
            <Grid item xs={6} sm={6} md={3}>
              <Typography variant="caption">Remaining Amount</Typography>
            </Grid>
            <Grid item xs={6} sm={6} md={3}>
              <Typography variant="body1">
                {advanceProcess?.adv_payment_data?.remaining_amount}
              </Typography>
            </Grid>
            <Grid item xs={6} sm={6} md={3}>
              <Typography variant="caption">Quantity</Typography>
            </Grid>
            <Grid item xs={6} sm={6} md={3}>
              <Typography variant="body1">
                {advanceProcess?.adv_payment_data?.quantity}
              </Typography>
            </Grid>
            <Grid item xs={6} sm={6} md={3}>
              <Typography variant="caption">Remaining Quantity</Typography>
            </Grid>
            <Grid item xs={6} sm={6} md={3}>
              <Typography variant="body1">
                {advanceProcess?.adv_payment_data?.remaining}
              </Typography>
            </Grid>
            <Grid item xs={6} sm={6} md={3}>
              <Typography variant="caption">Balance</Typography>
            </Grid>
            <Grid item xs={6} sm={6} md={3}>
              <Typography variant="body1">
                {advanceProcess?.adv_payment_data?.balance_amount}
              </Typography>
            </Grid>
            {advanceProcess?.adv_payment_data?.balance_amount !== 0 && (
              <Grid item md={12}>
                <Alert
                  style={{ border: "none" }}
                  severity="info"
                  variant="outlined"
                >
                  Remaining Balance need to be adjusted with the client.
                </Alert>
              </Grid>
            )}
          </Grid>
        </AccordionDetails>
      </Accordion>
      {paymentType === "IN" && <Box mt={4}></Box>}
      {paymentType === "IN" && (
        <Typography variant="body2">Pre Gate IN DO Scan</Typography>
      )}
      {paymentType === "IN" && <Box mt={2}></Box>}
      {paymentType === "IN" && (
        <Accordion expanded={expanded === "panel2"}>
          <AccordionSummary aria-controls="panel1d-content" id="panel1d-header">
            <Stack
              direction={"row"}
              flexDirection={"row"}
              alignItems={"center"}
              justifyContent={"space-between"}
              width={"100%"}
            >
              <Typography variant="body2">Upload DO file</Typography>
              <Button
                className={classes.uploadButton}
                id="upload-pre-gate-in-data"
                component="label"
                color="primary"
                variant="contained"
              >
                Choose File
                <input
                  type="file"
                  style={{ display: "none" }}
                  id="upload-pre-gate-in-do-scan"
                  accept="application/pdf,application/vnd.ms-excel"
                  onChange={(e) => {
                    const do_file = e.target.files[0];
                    formData.append("file", do_file);
                    formData.append(
                      "adv_payment_id",
                      paymentID ? paymentID : null
                    );
                    dispatch(
                      getPreGateDOScanDataAction(formData, notify, setExpanded)
                    );
                  }}
                  name="sample_tool_upload"
                />
              </Button>
            </Stack>
          </AccordionSummary>
          <AccordionDetails>
            <Paper className={classes.paymentContainer} elevation={0}>
              <Typography variant="body2">Do Scan Containers list </Typography>
              <Box mt={2}></Box>
              <TableContainer component={Paper}>
                <Table
                  sx={{ maxWidth: 230, overflowY: "scroll" }}
                  aria-label="simple table"
                >
                  {doScanEdit?.fileData?.importable_data?.length > 0 && (
                    <TableHead>
                      <TableRow>
                        <TableCell style={{ fontWeight: "bold" }}>
                          Container
                        </TableCell>
                        <TableCell style={{ fontWeight: "bold" }} align="right">
                          Size
                        </TableCell>
                        <TableCell style={{ fontWeight: "bold" }} align="right">
                          Type
                        </TableCell>
                        <TableCell style={{ fontWeight: "bold" }} align="right">
                          Validity Date
                        </TableCell>
                      </TableRow>
                    </TableHead>
                  )}
                  <TableBody>
                    {doScanEdit?.fileData?.importable_data.map((row) => (
                      <TableRow
                        key={row.container_no}
                        sx={{
                          "&:last-child td, &:last-child th": { border: 0 },
                        }}
                      >
                        <TableCell component="th" scope="row">
                          {row.container_no}
                        </TableCell>
                        <TableCell align="right">{row.type}</TableCell>
                        <TableCell align="right">{row.size}</TableCell>
                        <TableCell align="right">
                          {row.do_validity_in_date}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              {doScanEdit?.fileData?.remarks && (
                <Alert severity="info" style={{ marginTop: "16px" }}>
                  {doScanEdit?.fileData?.remarks}
                </Alert>
              )}
              <Paper
                style={{ padding: "12px", marginTop: "12px" }}
                elevation={0}
              >
                <Grid container spacing={1}>
                  <Grid
                    item
                    xs={12}
                    sm={6}
                    lg={4}
                    style={theme.breakpoints.down("sm") && { padding: 7 }}
                  >
                    <Typography
                      variant="subtitle1"
                      className={classes.LabelTypography}
                    >
                      Client Name <span style={{ color: "red" }}>*</span>
                    </Typography>
                    <TextField
                      id="client-name"
                      value={doScanEdit?.client}
                      select
                      name="client"
                      onChange={handleChangeDoScanEdit}
                      variant="outlined"
                      fullWidth
                      inputProps={{ className: classes.input }}
                    >
                      {gateIn.allDropDown &&
                        gateIn.allDropDown.line_client_data &&
                        gateIn.allDropDown.line_client_data.map((option) => (
                          <MenuItem
                            key={option.name}
                            value={option.name}
                            onClick={() => {
                              dispatch({
                                type: ADVANCE_FINANCE_CONSTANT.DO_SCAN_EDIT,
                                payload: {
                                  shipping_line_data: option.shipping_line,
                                  client: option.name,
                                },
                              });
                            }}
                          >
                            {option.name}
                          </MenuItem>
                        ))}
                    </TextField>
                  </Grid>
                  <Grid
                    item
                    xs={12}
                    sm={6}
                    lg={4}
                    style={theme.breakpoints.down("sm") && { padding: 7 }}
                  >
                    <Typography
                      variant="subtitle1"
                      className={classes.LabelTypography}
                    >
                      Shipping Line <span style={{ color: "red" }}>*</span>
                    </Typography>
                    <TextField
                      id="container-type"
                      select
                      value={doScanEdit.shipping_line}
                      variant="outlined"
                      fullWidth
                      inputProps={{ className: classes.input }}
                      onChange={handleChangeDoScanEdit}
                    >
                      {doScanEdit?.shipping_line_data &&
                        doScanEdit?.shipping_line_data?.map((option) => (
                          <MenuItem
                            key={option?.name}
                            value={option?.name}
                            onClick={() =>
                              dispatch({
                                type: ADVANCE_FINANCE_CONSTANT.DO_SCAN_EDIT,
                                payload: { shipping_line: option?.name },
                              })
                            }
                          >
                            {option?.name}
                          </MenuItem>
                        ))}
                    </TextField>
                  </Grid>
                  <Grid
                    item
                    xs={12}
                    sm={6}
                    md={4}
                    lg={4}
                    style={{ marginTop: "4px" }}
                  >
                    <Typography
                      variant="subtitle1"
                      className={classes.LabelTypography}
                    >
                      Arrived <span style={{ color: "red" }}>*</span>
                    </Typography>
                    <TextField
                      id="arrived"
                      name="arrived"
                      select
                      value={doScanEdit.arrived}
                      variant="outlined"
                      fullWidth
                      inputProps={{ className: classes.input }}
                      onChange={(e) =>
                        dispatch({
                          type: ADVANCE_FINANCE_CONSTANT.DO_SCAN_EDIT,
                          payload: { arrived: e.target.value },
                        })
                      }
                    >
                      {gateIn.allDropDown &&
                        gateIn.allDropDown.arrived &&
                        gateIn.allDropDown.arrived
                          .filter((val, index) => val !== "Road/Rail")
                          .filter((val, index) => val !== "Port/Vessel")
                          .map((option) => (
                            <MenuItem key={option} value={option}>
                              {option}
                            </MenuItem>
                          ))}
                    </TextField>
                  </Grid>
                  {/* <Grid
                  item
                  xs={12}
                  sm={6}
                  md={4}
                  lg={3}
                  style={{ marginTop: "4px" }}
                >
                  <Typography
                    variant="subtitle1"
                    className={classes.LabelTypography}
                  >
                    Validity Date<span style={{ color: "red" }}>*</span>
                  </Typography>
                  <DatePickerField
                    preGateIn
                    dateId="in-date"
                    dateValue={doScanEdit.do_validity_in_date}
                    dateChange={(date) =>
                      handleDateChangeUTILSDispatch(
                        date,
                        dispatch,
                        ADVANCE_FINANCE_CONSTANT.DO_SCAN_EDIT,
                        "do_validity_in_date"
                      )
                    }
                  />
                </Grid> */}
                  <Grid
                    item
                    sm={12}
                    alignContent="center"
                    style={{ textAlign: "center", marginTop: "12px" }}
                    spacing={2}
                  >
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handleDoScanUpload}
                      style={{ backgroundColor: "rgb(94,163,134)" }}
                    >
                      Do Scan Pre Gate In
                    </Button>
                    <Button
                      variant="outlined"
                      color="primary"
                      onClick={handleDoScanCancel}
                      style={{ width: "160px", marginLeft: "16px" }}
                    >
                      Cancel
                    </Button>
                  </Grid>
                </Grid>
              </Paper>
            </Paper>
          </AccordionDetails>
        </Accordion>
      )}
      <Box mt={4}></Box>
      <Stack
        direction={"row"}
        alignItems={"center"}
        justifyContent={"space-between"}
      >
        <Typography variant="body2" className={classes.heading}>
          Add Pre Gate {paymentType}
        </Typography>
      </Stack>

      <Box mt={2}></Box>
      {paymentType === "OUT" && (
        <Grid
          container
          spacing={4}
          component={Paper}
          className={classes.preGateOutSearch}
          elevation={0}
        >
          <Grid item sm={3}>
            <FormControl
              variant="standard"
              style={{ margin: "-12px 8px 0 8px" }}
            >
              <InputLabel
                id="container_list_select_label"
                style={{
                  color: "grey",
                  zIndex: 10,
                  fontSize: "15px",
                  textAlign: "center",
                  padding: "0 10px",
                }}
              >
                Available Containers
              </InputLabel>
              <Select
                // value={ServeyorReducer.data.client}
                id="=container_list_select"
                labelId="container_list_select_label"
                name="client"
                label="Available Containers"
                variant="standard"
                inputProps={{
                  style: {
                    padding: "0px",
                    marginTop: "-10px",
                  },
                }}
                style={{
                  width: "250px",
                  backgroundColor: "white",
                  borderRadius: "5px",
                }}
              >
                {preGateOutTable?.preGateOutDropdownContainersList?.map(
                  (val) => (
                    <MenuItem
                      key={val}
                      value={val}
                      onClick={() => setSelectedContainer(val)}
                      // onClick={() => dispatch(ContainerPreGateInGetAction(val,notify))}
                    >
                      {val}
                    </MenuItem>
                  )
                )}
              </Select>
            </FormControl>
          </Grid>
          <Grid item sm={6}>
            <Box className={classes.searchBox} ml={2}>
              {selectedContainer === "" ? (
                <Typography
                  variant="subtitle2"
                  style={{ color: "rgba(0,0,0,0.5)" }}
                >
                  Select from Available Container List{" "}
                </Typography>
              ) : (
                <Typography variant="subtitle2">{selectedContainer}</Typography>
              )}
            </Box>
          </Grid>
          <Grid item sm={3}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSearchContainer}
              fullWidth
              className={classes.searchContainerButton}
            >
              Search
            </Button>
          </Grid>
        </Grid>
      )}
      {paymentType === "IN" ? (
        <Paper className={classes.containerDetails} elevation={0}>
          <Grid container spacing={3}>
            <Grid
              item
              xs={12}
              sm={6}
              lg={3}
              style={theme.breakpoints.down("sm") && { padding: 7 }}
            >
              <Typography
                variant="subtitle1"
                className={classes.LabelTypography}
              >
                Client Name <span style={{ color: "red" }}>*</span>
              </Typography>

              {preGateInEdit?.newAdd === true || preGateInEdit?.pk ? (
                <GateInTextField
                  value={preGateInEdit?.client}
                  readOnlyP={true}
                />
              ) : (
                <Select
                  id="client-name"
                  value={preGateInEdit?.client}
                  fullWidth
                  name="client"
                  onChange={handleChangePreGateIn}
                  inputProps={{
                    style: {
                      padding: "0px",
                    },
                  }}
                  MenuProps={MenuProps}
                >
                  {gateIn.allDropDown &&
                    gateIn.allDropDown.line_client_data &&
                    gateIn.allDropDown.line_client_data.map((option) => (
                      <MenuItem
                        key={option.name}
                        value={option.name}
                        onClick={() => {
                          dispatch({
                            type: ADVANCE_FINANCE_CONSTANT.PRE_GATE_IN_EDIT,
                            payload: {
                              shipping_line_data: option.shipping_line,
                              client: option.name,
                            },
                          });
                        }}
                      >
                        {option.name}
                      </MenuItem>
                    ))}
                </Select>
              )}
            </Grid>
            <Grid
              item
              xs={12}
              sm={6}
              lg={3}
              style={theme.breakpoints.down("sm") && { padding: 7 }}
            >
              <Typography
                variant="subtitle1"
                className={classes.LabelTypography}
              >
                Container Number <span style={{ color: "red" }}>*</span>
              </Typography>
              <TextField
                id="container-number"
                value={preGateInEdit?.container_no}
                variant="outlined"
                fullWidth
                name="container_no"
                className={classes.textField}
                inputProps={{ className: classes.input }}
                onChange={(e) =>
                  handleContainerNumberChangeUtils(
                    e,
                    preGateInEdit.container_no,
                    dispatch,
                    ADVANCE_FINANCE_CONSTANT.PRE_GATE_IN_EDIT,
                    "container_no",
                    notify
                  )
                }
                onBlur={(e) =>
                  handleContainerNumberOnBlurUtils(
                    e,
                    notify,
                    dispatch,
                    ADVANCE_FINANCE_CONSTANT.PRE_GATE_IN_EDIT,
                    "container_no"
                  )
                }
                autoComplete="off"
              />
            </Grid>
            <Grid
              item
              xs={12}
              sm={6}
              lg={3}
              style={theme.breakpoints.down("sm") && { padding: 7 }}
            >
              <Typography
                variant="subtitle1"
                className={classes.LabelTypography}
              >
                Size <span style={{ color: "red" }}>*</span>
              </Typography>

              <TextField
                id="container-size"
                select
                value={preGateInEdit.size}
                variant="outlined"
                fullWidth
                name="size"
                inputProps={{ className: classes.input }}
                onChange={handleChangePreGateIn}
              >
                {gateIn.allDropDown &&
                  gateIn.allDropDown.size_data &&
                  gateIn.allDropDown.size_data.map((option) => (
                    <MenuItem
                      key={option.name}
                      value={option.name}
                      onClick={() =>
                        dispatch({
                          type: ADVANCE_FINANCE_CONSTANT.PRE_GATE_IN_EDIT,
                          payload: { size: option.name },
                        })
                      }
                    >
                      {option.name}
                    </MenuItem>
                  ))}
              </TextField>
            </Grid>
            <Grid
              item
              xs={12}
              sm={6}
              lg={3}
              style={theme.breakpoints.down("sm") && { padding: 7 }}
            >
              <Typography
                variant="subtitle1"
                className={classes.LabelTypography}
              >
                Type <span style={{ color: "red" }}>*</span>
              </Typography>
              <TextField
                id="container-type"
                select
                value={preGateInEdit.type}
                variant="outlined"
                fullWidth
                inputProps={{ className: classes.input }}
                onChange={handleChangePreGateIn}
              >
                {gateIn.allDropDown &&
                  gateIn.allDropDown.type_data &&
                  gateIn.allDropDown.type_data.map((option) => (
                    <MenuItem
                      key={option.name}
                      value={option.name}
                      onClick={() =>
                        dispatch({
                          type: ADVANCE_FINANCE_CONSTANT.PRE_GATE_IN_EDIT,
                          payload: { type: option.name },
                        })
                      }
                    >
                      {option.name}
                    </MenuItem>
                  ))}
              </TextField>
            </Grid>
            <Grid
              item
              xs={12}
              sm={6}
              lg={3}
              style={theme.breakpoints.down("sm") && { padding: 7 }}
            >
              <Typography
                variant="subtitle1"
                className={classes.LabelTypography}
              >
                Shipping Line <span style={{ color: "red" }}>*</span>
              </Typography>
              {preGateInEdit?.newAdd === true || preGateInEdit?.pk ? (
                <GateInTextField
                  value={preGateInEdit?.shipping_line}
                  readOnlyP={true}
                />
              ) : (
                <TextField
                  id="container-type"
                  select
                  value={preGateInEdit.shipping_line}
                  variant="outlined"
                  fullWidth
                  inputProps={{ className: classes.input }}
                  onChange={handleChangePreGateIn}
                >
                  {preGateInEdit?.shipping_line_data &&
                    preGateInEdit?.shipping_line_data?.map((option) => (
                      <MenuItem
                        key={option?.name}
                        value={option?.name}
                        onClick={() =>
                          dispatch({
                            type: ADVANCE_FINANCE_CONSTANT.PRE_GATE_IN_EDIT,
                            payload: { shipping_line: option?.name },
                          })
                        }
                      >
                        {option?.name}
                      </MenuItem>
                    ))}
                </TextField>
              )}
            </Grid>

            <Grid
              item
              xs={12}
              sm={6}
              lg={3}
              style={theme.breakpoints.down("sm") && { padding: 7 }}
            >
              <Typography
                variant="subtitle1"
                className={classes.LabelTypography}
              >
                Bl no <span style={{ color: "red" }}>*</span>
              </Typography>
              <GateInTextField value={preGateInEdit?.bl_no} readOnlyP={true} />
            </Grid>

            <Grid item xs={12} sm={6} md={4} lg={3}>
              <Typography
                variant="subtitle1"
                className={classes.LabelTypography}
              >
                Arrived <span style={{ color: "red" }}>*</span>
              </Typography>

              {preGateInEdit?.newAdd === true || preGateInEdit?.pk ? (
                <GateInTextField
                  value={preGateInEdit?.arrived}
                  readOnlyP={true}
                />
              ) : (
                <TextField
                  id="arrived"
                  name="arrived"
                  select
                  value={preGateInEdit.arrived}
                  variant="outlined"
                  fullWidth
                  inputProps={{ className: classes.input }}
                  onChange={(e) =>
                    dispatch({
                      type: ADVANCE_FINANCE_CONSTANT.PRE_GATE_IN_EDIT,
                      payload: { arrived: e.target.value },
                    })
                  }
                >
                  {gateIn.allDropDown &&
                    gateIn.allDropDown.arrived &&
                    gateIn.allDropDown.arrived
                      .filter((val, index) => val !== "Road/Rail")
                      .filter((val, index) => val !== "Port/Vessel")
                      .map((option) => (
                        <MenuItem key={option} value={option}>
                          {option}
                        </MenuItem>
                      ))}
                </TextField>
              )}
            </Grid>

            <Grid item xs={12} sm={6} md={4} lg={3}>
              <Typography
                variant="subtitle1"
                className={classes.LabelTypography}
                style={{ marginTop: "-2px" }}
              >
                Validity Date<span style={{ color: "red" }}>*</span>
              </Typography>

              {preGateInEdit?.newAdd === true || preGateInEdit?.pk ? (
                <GateInTextField
                  value={preGateInEdit?.do_validity_in_date}
                  readOnlyP={true}
                />
              ) : (
                <DatePickerField
                  preGateIn
                  dateId="in-date"
                  dateValue={preGateInEdit.do_validity_in_date}
                  dateChange={(date) =>
                    handleDateChangeUTILSDispatch(
                      date,
                      dispatch,
                      ADVANCE_FINANCE_CONSTANT.PRE_GATE_IN_EDIT,
                      "do_validity_in_date"
                    )
                  }
                />
              )}
            </Grid>

            <Grid item xs={12} sm={6} md={4} lg={3}>
              <Typography
                variant="subtitle1"
                className={classes.LabelTypography}
              >
                Validity Time <span style={{ color: "red" }}>*</span>
              </Typography>
              <GateInTextField
                value={preGateInEdit?.do_validity_in_time}
                readOnlyP={true}
              />
            </Grid>
            <Grid
              item
              xs={12}
              sm={6}
              lg={3}
              style={theme.breakpoints.down("sm") && { padding: 7 }}
            >
              <Typography
                variant="subtitle1"
                className={classes.LabelTypography}
              >
                Consignee
              </Typography>
              {preGateInEdit?.newAdd === true || preGateInEdit?.pk ? (
                <GateInTextField
                  value={preGateInEdit?.consignee}
                  readOnlyP={true}
                />
              ) : (
                <TextField
                  id="consignee"
                  value={preGateInEdit.consignee}
                  name="consignee"
                  variant="outlined"
                  fullWidth
                  className={classes.textField}
                  inputProps={{ className: classes.input }}
                  onChange={(e) =>
                    dispatch({
                      type: ADVANCE_FINANCE_CONSTANT.PRE_GATE_IN_EDIT,
                      payload: { consignee: e.target.value },
                    })
                  }
                  autoComplete="off"
                />
              )}
            </Grid>
            <Grid
              item
              xs={12}
              sm={6}
              lg={3}
              style={theme.breakpoints.down("sm") && { padding: 7 }}
            >
              <Typography
                variant="subtitle1"
                className={classes.LabelTypography}
              >
                Shipper
              </Typography>
              {preGateInEdit?.newAdd === true || preGateInEdit?.pk ? (
                <GateInTextField
                  value={preGateInEdit?.shipper}
                  readOnlyP={true}
                />
              ) : (
                <TextField
                  id="shipper"
                  name="shipper"
                  value={preGateInEdit.shipper}
                  variant="outlined"
                  fullWidth
                  className={classes.textField}
                  inputProps={{ className: classes.input }}
                  onChange={(e) =>
                    dispatch({
                      type: ADVANCE_FINANCE_CONSTANT.PRE_GATE_IN_EDIT,
                      payload: { shipper: e.target.value },
                    })
                  }
                  autoComplete="off"
                />
              )}
            </Grid>

            <Grid
              item
              xs={12}
              sm={6}
              lg={3}
              style={theme.breakpoints.down("sm") && { padding: 7 }}
            >
              <Typography
                variant="subtitle1"
                className={classes.LabelTypography}
              >
                Cargo
              </Typography>
              {preGateInEdit?.newAdd === true || preGateInEdit?.pk ? (
                <GateInTextField
                  value={preGateInEdit?.cargo}
                  readOnlyP={true}
                />
              ) : (
                <TextField
                  id="cargo"
                  value={preGateInEdit.cargo}
                  variant="outlined"
                  fullWidth
                  name="cargo"
                  className={classes.textField}
                  inputProps={{ className: classes.input }}
                  onChange={(e) =>
                    dispatch({
                      type: ADVANCE_FINANCE_CONSTANT.PRE_GATE_IN_EDIT,
                      payload: { cargo: e.target.value },
                    })
                  }
                  autoComplete="off"
                />
              )}
            </Grid>

            <Grid
              item
              xs={12}
              sm={6}
              lg={3}
              style={theme.breakpoints.down("sm") && { padding: 7 }}
            >
              <Typography
                variant="subtitle1"
                className={classes.LabelTypography}
              >
                Remarks
              </Typography>
              {preGateInEdit?.newAdd === true || preGateInEdit?.pk ? (
                <GateInTextField
                  value={preGateInEdit?.remarks}
                  readOnlyP={true}
                />
              ) : (
                <TextField
                  id="remarks"
                  name="remarks"
                  value={preGateInEdit.remarks}
                  variant="outlined"
                  fullWidth
                  className={classes.textField}
                  inputProps={{ className: classes.input }}
                  onChange={(e) =>
                    dispatch({
                      type: ADVANCE_FINANCE_CONSTANT.PRE_GATE_IN_EDIT,
                      payload: { remarks: e.target.value },
                    })
                  }
                  autoComplete="off"
                />
              )}
            </Grid>
            <Grid item sm={12}>
              {preGateInEdit.pk ? (
                <Button
                  fullWidth
                  style={{ width: "250px", margin: "auto", display: "block" }}
                  variant="contained"
                  color="primary"
                  onClick={handleUpdatePreGateIn}
                >
                  Update Pre Gate IN
                </Button>
              ) : (
                <Button
                  fullWidth
                  style={{ width: "250px", margin: "auto", display: "block" }}
                  variant="contained"
                  color="primary"
                  onClick={handleAddPreGateIN}
                >
                  Add Pre Gate IN
                </Button>
              )}
            </Grid>
          </Grid>
        </Paper>
      ) : (
        <Paper className={classes.containerDetails} elevation={0}>
          <Grid container spacing={3}>
            <Grid
              item
              xs={12}
              sm={6}
              lg={3}
              style={theme.breakpoints.down("sm") && { padding: 7 }}
            >
              <Typography
                variant="subtitle1"
                className={classes.LabelTypography}
              >
                Client Name <span style={{ color: "red" }}>*</span>
              </Typography>
              <GateInTextField readOnlyP={true} value={preGateOutEdit.client} />
            </Grid>
            <Grid
              item
              xs={12}
              sm={6}
              lg={3}
              style={theme.breakpoints.down("sm") && { padding: 7 }}
            >
              <Typography
                variant="subtitle1"
                className={classes.LabelTypography}
              >
                Container Number <span style={{ color: "red" }}>*</span>
              </Typography>
              <GateInTextField
                readOnlyP={true}
                value={preGateOutEdit.container_no}
              />
            </Grid>
            <Grid
              item
              xs={12}
              sm={6}
              lg={3}
              style={theme.breakpoints.down("sm") && { padding: 7 }}
            >
              <Typography
                variant="subtitle1"
                className={classes.LabelTypography}
              >
                Size <span style={{ color: "red" }}>*</span>
              </Typography>
              <GateInTextField readOnlyP={true} value={preGateOutEdit.size} />
            </Grid>
            <Grid
              item
              xs={12}
              sm={6}
              lg={3}
              style={theme.breakpoints.down("sm") && { padding: 7 }}
            >
              <Typography
                variant="subtitle1"
                className={classes.LabelTypography}
              >
                Type <span style={{ color: "red" }}>*</span>
              </Typography>
              <GateInTextField readOnlyP={true} value={preGateOutEdit.type} />
            </Grid>
            <Grid
              item
              xs={12}
              sm={6}
              lg={3}
              style={theme.breakpoints.down("sm") && { padding: 7 }}
            >
              <Typography
                variant="subtitle1"
                className={classes.LabelTypography}
              >
                Shipping Line <span style={{ color: "red" }}>*</span>
              </Typography>
              <GateInTextField
                readOnlyP={true}
                value={preGateOutEdit.shipping_line}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={4} lg={3}>
              <Typography
                variant="subtitle1"
                className={classes.LabelTypography}
              >
                Manufacturing Date <span style={{ color: "red" }}>*</span>
              </Typography>
              <GateInTextField
                readOnlyP={true}
                value={preGateOutEdit.manufacturing_date}
              />
            </Grid>
            <Grid
              item
              xs={12}
              sm={6}
              lg={3}
              style={theme.breakpoints.down("sm") && { padding: 7 }}
            >
              <Typography
                variant="subtitle1"
                className={classes.LabelTypography}
              >
                Booking no <span style={{ color: "red" }}>*</span>
              </Typography>
              <GateInTextField readOnlyP={true} value={preGateOutEdit.bk_no} />
            </Grid>
            <Grid item xs={12} sm={6} md={4} lg={3}>
              <Typography
                variant="subtitle1"
                className={classes.LabelTypography}
              >
                Departed <span style={{ color: "red" }}>*</span>
              </Typography>

              {preGateOutEdit?.newAdd === true ? (
                <GateInTextField
                  value={preGateOutEdit?.departed}
                  readOnlyP={true}
                />
              ) : (
                <TextField
                  id="departed"
                  name="departed"
                  select
                  value={preGateOutEdit.departed}
                  variant="outlined"
                  fullWidth
                  inputProps={{ className: classes.input }}
                  onChange={(e) =>
                    dispatch({
                      type: ADVANCE_FINANCE_CONSTANT.PRE_GATE_OUT_EDIT,
                      payload: { departed: e.target.value },
                    })
                  }
                >
                  {gateIn.allDropDown &&
                    gateIn.allDropDown.arrived &&
                    gateIn.allDropDown.arrived
                      .filter((val, index) => val !== "Road/Rail")
                      .filter((val, index) => val !== "Port/Vessel")
                      .map((option) => (
                        <MenuItem key={option} value={option}>
                          {option}
                        </MenuItem>
                      ))}
                </TextField>
              )}
            </Grid>
            <Grid item xs={12} sm={6} md={4} lg={3}>
              <Typography
                variant="subtitle1"
                className={classes.LabelTypography}
              >
                Validity <span style={{ color: "red" }}>*</span>
              </Typography>

              {preGateOutEdit?.newAdd === true ? (
                <GateInTextField
                  value={preGateOutEdit?.do_validity_out_date}
                  readOnlyP={true}
                />
              ) : (
                <DatePickerField
                  dateId="in-date"
                  dateValue={preGateOutEdit.do_validity_out_date}
                  dateChange={(date) =>
                    handleDateChangeUTILSDispatch(
                      date,
                      dispatch,
                      ADVANCE_FINANCE_CONSTANT.PRE_GATE_OUT_EDIT,
                      "do_validity_out_date"
                    )
                  }
                />
              )}
            </Grid>

            <Grid item xs={12} sm={6} md={4} lg={3}>
              <Typography
                variant="subtitle1"
                className={classes.LabelTypography}
              >
                Validity Time <span style={{ color: "red" }}>*</span>
              </Typography>
              <GateInTextField
                value={preGateOutEdit?.do_validity_out_time}
                readOnlyP={true}
              />
            </Grid>
            <Grid
              item
              xs={12}
              sm={6}
              lg={3}
              style={theme.breakpoints.down("sm") && { padding: 7 }}
            >
              <Typography
                variant="subtitle1"
                className={classes.LabelTypography}
              >
                Consignee
              </Typography>
              {preGateOutEdit?.newAdd === true ? (
                <GateInTextField
                  value={preGateOutEdit?.consignee}
                  readOnlyP={true}
                />
              ) : (
                <TextField
                  id="consignee"
                  value={preGateOutEdit.consignee}
                  name="consignee"
                  variant="outlined"
                  fullWidth
                  className={classes.textField}
                  inputProps={{ className: classes.input }}
                  onChange={(e) =>
                    dispatch({
                      type: ADVANCE_FINANCE_CONSTANT.PRE_GATE_OUT_EDIT,
                      payload: { consignee: e.target.value },
                    })
                  }
                  autoComplete="off"
                />
              )}
            </Grid>
            <Grid
              item
              xs={12}
              sm={6}
              lg={3}
              style={theme.breakpoints.down("sm") && { padding: 7 }}
            >
              <Typography
                variant="subtitle1"
                className={classes.LabelTypography}
              >
                Shipper
              </Typography>
              {preGateOutEdit?.newAdd === true ? (
                <GateInTextField
                  value={preGateOutEdit?.shipper}
                  readOnlyP={true}
                />
              ) : (
                <TextField
                  id="shipper"
                  name="shipper"
                  value={preGateOutEdit.shipper}
                  variant="outlined"
                  fullWidth
                  className={classes.textField}
                  inputProps={{ className: classes.input }}
                  onChange={(e) =>
                    dispatch({
                      type: ADVANCE_FINANCE_CONSTANT.PRE_GATE_OUT_EDIT,
                      payload: { shipper: e.target.value },
                    })
                  }
                  autoComplete="off"
                />
              )}
            </Grid>

            <Grid
              item
              xs={12}
              sm={6}
              lg={3}
              style={theme.breakpoints.down("sm") && { padding: 7 }}
            >
              <Typography
                variant="subtitle1"
                className={classes.LabelTypography}
              >
                Cargo
              </Typography>
              {preGateOutEdit?.newAdd === true ? (
                <GateInTextField
                  value={preGateOutEdit?.cargo}
                  readOnlyP={true}
                />
              ) : (
                <TextField
                  id="cargo"
                  value={preGateOutEdit.cargo}
                  variant="outlined"
                  fullWidth
                  name="cargo"
                  className={classes.textField}
                  inputProps={{ className: classes.input }}
                  onChange={(e) =>
                    dispatch({
                      type: ADVANCE_FINANCE_CONSTANT.PRE_GATE_OUT_EDIT,
                      payload: { cargo: e.target.value },
                    })
                  }
                  autoComplete="off"
                />
              )}
            </Grid>
            <Grid
              item
              xs={12}
              sm={6}
              lg={3}
              style={theme.breakpoints.down("sm") && { padding: 7 }}
            >
              <Typography
                variant="subtitle1"
                className={classes.LabelTypography}
              >
                Remarks
              </Typography>
              {preGateOutEdit?.newAdd === true ? (
                <GateInTextField
                  value={preGateOutEdit?.remarks}
                  readOnlyP={true}
                />
              ) : (
                <TextField
                  id="remarks"
                  value={preGateOutEdit.remarks}
                  variant="outlined"
                  fullWidth
                  name="remarks"
                  className={classes.textField}
                  inputProps={{ className: classes.input }}
                  onChange={(e) =>
                    dispatch({
                      type: ADVANCE_FINANCE_CONSTANT.PRE_GATE_OUT_EDIT,
                      payload: { remarks: e.target.value },
                    })
                  }
                  autoComplete="off"
                />
              )}
            </Grid>
            <Grid item sm={12}>
              {preGateOutEdit.pk ? (
                <Button
                  variant="contained"
                  color="primary"
                  className={classes.addPreGateOut}
                  onClick={handleUpdatePreGateOut}
                >
                  Update Pre Gate Out
                </Button>
              ) : (
                <Button
                  variant="contained"
                  color="primary"
                  className={classes.addPreGateOut}
                  onClick={handleAddPreGateOut}
                >
                  Add Pre Gate Out
                </Button>
              )}
            </Grid>
          </Grid>
        </Paper>
      )}
      <Box mt={4}></Box>
      <Typography variant="body2" className={classes.heading}>
        Pre Gate {paymentType} Containers
      </Typography>
      <Box mt={2}></Box>
      {paymentType === "IN" ? (
        <PreGateInList process={true} paymentID={paymentID} />
      ) : (
        <PreGateOutList
          process={true}
          paymentID={paymentID}
          bk_no={paymentBookingNo}
        />
      )}
      <Backdrop className={classes.backdrop} open={ui.isloading}>
        <CircularProgress color="inherit" />
      </Backdrop>
    </LayoutContainer>
  );
};

export default AdvanceFinanceProcess;
