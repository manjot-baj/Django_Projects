import React, { useEffect, useState } from "react";
import LayoutContainer from "@components/reusablecomponents/LayoutContainer";
import { useHistory, useParams } from "react-router-dom";
import {
  Box,
  Button,
  styled,
  Typography,
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
} from "@mui/material";
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
import DatePickerField from "@components/reusablecomponents/DatePickerField";
import { handleDateChangeUTILSDispatch } from "../../utils/WeekNumbre";
import PreGateInList from "../../components/advanceFinance/PreGateInList";
import PreGateOutList from "../../components/advanceFinance/PreGateOutList";
import {
  dropDownDispatch,
  dropDownPreGateOUTContainerActionDispatch,
} from "../../actions/GateInActions";
import GateInTextField from "@components/reusablecomponents/GateInTextField";
import {
  custombackDropStyle,
  customLabelTypography,
} from "../../utils/CustomClasses";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import PaymentsOutlinedIcon from "@mui/icons-material/PaymentsOutlined";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";

const Accordion = styled((props) => (
  <MuiAccordion disableGutters elevation={0} square {...props} />
))(({ theme }) => ({
  border: "none",
  borderRadius: 16,
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
  backgroundColor: "white",
  width: "100%",
  borderRadius: 16,
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

const DetailItem = ({ label, value }) => (
  <Grid item size={{ xs: 12, md: 6 }}>
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        py: 0.2,
        borderBottom: "1px dashed",
        borderColor: "divider",
      }}
    >
      <Typography
        sx={{
          color: "Highlight",
          fontWeight: 500,
          flexShrink: 0,
        }}
        variant="subtitle2"
      >
        {label}
      </Typography>

      <Typography
        sx={{
          mx: 2,
          color: "text.disabled",
        }}
      >
        :
      </Typography>

      <Typography
        sx={{
          fontWeight: 600,
          color: "text.primary",
        }}
        variant="subtitle2"
      >
        {value || "-"}
      </Typography>
    </Box>
  </Grid>
);

const AdvanceFinanceProcess = () => {
  const history = useHistory();
  const notify = useSnackbar().enqueueSnackbar;
  const dispatch = useDispatch();
  const { pk } = useParams();
  const formData = new FormData();
  const { AdvanceFinanceReducer, gateIn, ui } = useSelector((state) => state);
  const { preGateInEdit, preGateOutEdit, preGateOutTable, doScanEdit } =
    AdvanceFinanceReducer;
  const { advanceProcess } = AdvanceFinanceReducer;
  const paymentID = pk;
  const [paymentType, setPaymentType] = useState(null);
  const [paymentBillingNo, setPaymentBillingNo] = useState(null);
  const [paymentBookingNo, setPaymentBookingNo] = useState(null);
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
    }
  }, []);

  useEffect(() => {
    if (advanceProcess?.adv_payment_data) {
      setPaymentBillingNo(advanceProcess.adv_payment_data?.bl_no);
      setPaymentBookingNo(advanceProcess.adv_payment_data?.bk_no);
      setPaymentType(advanceProcess.adv_payment_data?.entry_type);
      if (paymentType === "IN") {
        dispatch({
          type: ADVANCE_FINANCE_CONSTANT.PRE_GATE_IN_EDIT,
          payload: { bl_no: advanceProcess.adv_payment_data?.bl_no },
        });
      } else {
        dispatch({
          type: ADVANCE_FINANCE_CONSTANT.PRE_GATE_OUT_EDIT,
          payload: { bk_no: advanceProcess.adv_payment_data?.bk_no },
        });
        if (paymentBookingNo) {
          dispatch(
            dropDownPreGateOUTContainerActionDispatch(paymentBookingNo, notify),
          );
        }
      }
    }
  }, [
    advanceProcess,
    preGateInEdit.bl_no,
    preGateOutEdit.bk_no,
    paymentBookingNo,
  ]);

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
        dropDownPreGateOUTContainerActionDispatch(paymentBookingNo, notify),
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
        importPreGateInData(
          importData,
          notify,
          history,
          paymentID,
          setExpanded,
        ),
      );
      // dispatch(addPreGateInDoScanDataAction(paymentID,do_scan_data,notify,setExpanded))
    }
  };

  return (
    <LayoutContainer footer={false}>
      <Typography
        variant="body2"
        sx={(theme) => ({
          [theme.breakpoints.down("sm")]: {
            marginTop: "24px",
            marginLeft: "12px",
          },
        })}
      >
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
            <Box ml={2}>
              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                {advanceProcess?.adv_payment_data?.client} -{" "}
                {
                  advanceProcess?.adv_payment_data?.[
                    paymentType === "IN" ? "bl_no" : "bk_no"
                  ]
                }
              </Typography>
            </Box>

            <Box
              sx={{
                backgroundColor: "rgb(233,244,239)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "rgb(61,154,106)",
                elevation: 0,
                borderRadius: 8,
                boxShadow: 0,
                padding: "4px 8px",
              }}
            >
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                {advanceProcess?.adv_payment_data?.payment_type} -{" "}
                {advanceProcess?.adv_payment_data?.original_amount}
              </Typography>
              <Divider
                orientation="vertical"
                flexItem
                style={{ marginLeft: "12px", marginRight: "12px" }}
              />
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                {" "}
                {"Remaining Amount"} - {""}
                {advanceProcess?.adv_payment_data?.remaining_amount}
              </Typography>
            </Box>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "rgb(231,231,253)",
                color: "rgb(106, 143, 246)",
                elevation: 0,
                borderRadius: 8,
                boxShadow: 0,
                padding: "4px 8px",
              }}
            >
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                {" "}
                Size 20 Quantity -{" "}
                {advanceProcess?.adv_payment_data?.size_20_quantity}
              </Typography>

              <Divider
                orientation="vertical"
                flexItem
                style={{ marginLeft: "12px", marginRight: "12px" }}
              />
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                {" "}
                {"Size 40 Quantity"} - {""}
                {advanceProcess?.adv_payment_data?.size_40_quantity}
              </Typography>
            </Box>
            {!matchesIphone && (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: "rgb(253, 231, 234)",
                  color: "rgb(246, 106, 125)",
                  elevation: 0,
                  borderRadius: 8,
                  boxShadow: 0,
                  padding: "4px 8px",
                }}
              >
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {" "}
                  Quantity - {advanceProcess?.adv_payment_data?.quantity}
                </Typography>

                <Divider
                  orientation="vertical"
                  flexItem
                  style={{ marginLeft: "12px", marginRight: "12px" }}
                />
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {" "}
                  {"Remaining"} - {""}
                  {advanceProcess?.adv_payment_data?.remaining}
                </Typography>
              </Box>
            )}
          </Stack>
        </AccordionSummary>
        <AccordionDetails sx={{ bgcolor: "#fafafa" }}>
          <Grid container spacing={2} sx={{ px: 6 }}>
            <Grid item size={{ xs: 12 }}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  mb: 1,
                  mt: 1,
                }}
              >
                <InfoOutlinedIcon color="primary" />
                <Typography variant="subtitle2" fontWeight={700}>
                  General Information
                </Typography>
              </Box>
            </Grid>

            <DetailItem
              label="Client"
              value={advanceProcess?.adv_payment_data?.client}
            />

            <DetailItem
              label={`${paymentType === "IN" ? "Billing" : "Booking"} No`}
              value={
                advanceProcess?.adv_payment_data?.[
                  paymentType === "IN" ? "bl_no" : "bk_no"
                ]
              }
            />

            <DetailItem
              label="Date"
              value={advanceProcess?.adv_payment_data?.created_at}
            />

            <DetailItem
              label="Entry Type"
              value={advanceProcess?.adv_payment_data?.entry_type}
            />

            <DetailItem
              label="Payment Type"
              value={advanceProcess?.adv_payment_data?.payment_type}
            />

            <DetailItem
              label="Original Amount"
              value={advanceProcess?.adv_payment_data?.original_amount}
            />
            <Grid item size={{ xs: 12 }}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  mb: 1,
                  mt: 2,
                }}
              >
                <Inventory2OutlinedIcon color="warning" />
                <Typography variant="subtitle2" fontWeight={700}>
                  Container Details
                </Typography>
              </Box>
            </Grid>
            <DetailItem
              label="20 ft Qty"
              value={advanceProcess?.adv_payment_data?.size_20_quantity}
            />

            <DetailItem
              label="20 ft Rate"
              value={advanceProcess?.adv_payment_data?.size_20_rate}
            />

            <DetailItem
              label="40 ft Qty"
              value={advanceProcess?.adv_payment_data?.size_40_quantity}
            />

            <DetailItem
              label="40 ft Rate"
              value={advanceProcess?.adv_payment_data?.size_40_rate}
            />
            <DetailItem
              label="Quantity"
              value={advanceProcess?.adv_payment_data?.quantity}
            />

            <DetailItem
              label="Remaining Qty"
              value={advanceProcess?.adv_payment_data?.remaining}
            />
            <Grid item size={{ xs: 12 }}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  mb: 1,
                  mt: 2,
                }}
              >
                <PaymentsOutlinedIcon color="success" />
                <Typography variant="subtitle2" fontWeight={700}>
                  Financial Details{" "}
                  {advanceProcess?.adv_payment_data?.with_gst === false && (
                    <span>(GST not Applied)</span>
                  )}
                </Typography>
              </Box>
            </Grid>
            <DetailItem
              label="Original Amount"
              value={advanceProcess?.adv_payment_data?.original_amount}
            />

            <DetailItem
              label="TDS %"
              value={advanceProcess?.adv_payment_data?.tds}
            />
            <DetailItem
              label={"Size 20 TDS Amount"}
              value={advanceProcess?.adv_payment_data?.size_20_tds_amount}
            />
            <DetailItem
              label={"Size 40 TDS Amount"}
              value={advanceProcess?.adv_payment_data?.size_40_tds_amount}
            />

            <DetailItem
              label="Total TDS"
              value={advanceProcess?.adv_payment_data?.total_tds}
            />
            <DetailItem
              label="Total Amount Without Tax"
              value={advanceProcess?.adv_payment_data?.total_amount_without_tax}
            />

            <DetailItem
              label="Total Tax"
              value={advanceProcess?.adv_payment_data?.total_tax}
            />

            <DetailItem
              label="Amount with GST & TDS"
              value={
                advanceProcess?.adv_payment_data?.total_amount_with_gst_tds
              }
            />

            <DetailItem
              label="Remaining Amount"
              value={advanceProcess?.adv_payment_data?.remaining_amount}
            />

            <DetailItem
              label="Balance"
              value={advanceProcess?.adv_payment_data?.balance_amount}
            />
          </Grid>

          {advanceProcess?.adv_payment_data?.balance_amount !== 0 && (
            <Alert
              severity="info"
              variant="filled"
              sx={{
                mt: 3,
                borderRadius: 2,
              }}
            >
              Remaining balance needs to be adjusted with the client.
            </Alert>
          )}
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
                      paymentID ? paymentID : null,
                    );
                    dispatch(
                      getPreGateDOScanDataAction(formData, notify, setExpanded),
                    );
                  }}
                  name="sample_tool_upload"
                />
              </Button>
            </Stack>
          </AccordionSummary>
          <AccordionDetails>
            <Paper
              sx={{
                width: "100%",
                margin: "auto",
                marginTop: "20px",
                marginRight: 0,
              }}
              elevation={0}
            >
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
                    size={{ xs: 12, sm: 6, lg: 4 }}
                    style={theme.breakpoints.down("sm") && { padding: 7 }}
                  >
                    <Typography variant="subtitle1" sx={customLabelTypography}>
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
                      size="small"
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
                    size={{ xs: 12, sm: 6, lg: 4 }}
                    style={theme.breakpoints.down("sm") && { padding: 7 }}
                  >
                    <Typography variant="subtitle1" sx={customLabelTypography}>
                      Shipping Line <span style={{ color: "red" }}>*</span>
                    </Typography>
                    <TextField
                      id="container-type"
                      select
                      value={doScanEdit.shipping_line}
                      variant="outlined"
                      fullWidth
                      size="small"
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
                    size={{ xs: 12, sm: 6, lg: 4 }}
                    style={{ marginTop: "4px" }}
                  >
                    <Typography variant="subtitle1" sx={customLabelTypography}>
                      Arrived <span style={{ color: "red" }}>*</span>
                    </Typography>
                    <TextField
                      id="arrived"
                      name="arrived"
                      select
                      value={doScanEdit.arrived}
                      variant="outlined"
                      fullWidth
                      size="small"
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
                    sx={customLabelTypography}
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
                    size={{ xs: 12 }}
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
        <Typography
          variant="body2"
          sx={(theme) => ({
            [theme.breakpoints.down("sm")]: {
              marginTop: "24px",
              marginLeft: "12px",
            },
          })}
        >
          Add Pre Gate {paymentType}
        </Typography>
      </Stack>

      <Box mt={2}></Box>
      {paymentType === "OUT" && (
        <Grid
          container
          spacing={4}
          component={Paper}
          sx={(theme) => ({
            padding: theme.spacing(2),
            borderRadius: 2,
            elevation: "none",
            backgroundColor: theme.palette.background.paper,
            margin: "12px 12px 12px 0",
            width: "100%",
          })}
          elevation={0}
        >
          <Grid item size={{ xs: 3 }}>
            <FormControl
              variant="standard"
              style={{ margin: "-12px 8px 0 8px", width: "100%" }}
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
                  width: "100%",
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
                  ),
                )}
              </Select>
            </FormControl>
          </Grid>
          <Grid item size={{ sm: 6 }}>
            <Box
              sx={{
                backgroundColor: "rgb(223,230,236)",
                borderRadius: 2,
                padding: 2,
                width: "100%",
              }}
              ml={2}
            >
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
          <Grid item size={{ sm: 3 }} sx={{ placeContent: "center" }}>
            <Button
              variant="contained"
              color="warning"
              onClick={handleSearchContainer}
              fullWidth
            >
              Search
            </Button>
          </Grid>
        </Grid>
      )}
      {paymentType === "IN" ? (
        <Paper
          sx={(theme) => ({
            padding: theme.spacing(2),
            borderRadius: 4,
            backgroundColor: theme.palette.background.paper,
            margin: "auto",
            marginTop: "8px",
          })}
          elevation={0}
        >
          <Grid container spacing={1}>
            <Grid item size={{ xs: 12, sm: 6, lg: 3 }}>
              <Typography variant="subtitle1" sx={customLabelTypography}>
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
                  size="small"
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
            <Grid item size={{ xs: 12, sm: 6, lg: 3 }}>
              <Typography variant="subtitle1" sx={customLabelTypography}>
                Container Number <span style={{ color: "red" }}>*</span>
              </Typography>
              <TextField
                id="container-number"
                value={preGateInEdit?.container_no}
                variant="outlined"
                fullWidth
                name="container_no"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    "& fieldset": {
                      borderColor: "#243545",
                    },
                  },
                }}
                size="small"
                onChange={(e) =>
                  handleContainerNumberChangeUtils(
                    e,
                    preGateInEdit.container_no,
                    dispatch,
                    ADVANCE_FINANCE_CONSTANT.PRE_GATE_IN_EDIT,
                    "container_no",
                    notify,
                  )
                }
                onBlur={(e) =>
                  handleContainerNumberOnBlurUtils(
                    e,
                    notify,
                    dispatch,
                    ADVANCE_FINANCE_CONSTANT.PRE_GATE_IN_EDIT,
                    "container_no",
                  )
                }
                autoComplete="off"
              />
            </Grid>
            <Grid item size={{ xs: 12, sm: 6, lg: 3 }}>
              <Typography variant="subtitle1" sx={customLabelTypography}>
                Size <span style={{ color: "red" }}>*</span>
              </Typography>

              <TextField
                id="container-size"
                select
                value={preGateInEdit.size}
                variant="outlined"
                fullWidth
                name="size"
                size="small"
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
            <Grid item size={{ xs: 12, sm: 6, lg: 3 }}>
              <Typography variant="subtitle1" sx={customLabelTypography}>
                Type <span style={{ color: "red" }}>*</span>
              </Typography>
              <TextField
                id="container-type"
                select
                value={preGateInEdit.type}
                variant="outlined"
                fullWidth
                size="small"
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
            <Grid item size={{ xs: 12, sm: 6, lg: 3 }}>
              <Typography variant="subtitle1" sx={customLabelTypography}>
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
                  size="small"
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

            <Grid item size={{ xs: 12, sm: 6, lg: 3 }}>
              <Typography variant="subtitle1" sx={customLabelTypography}>
                Bl no <span style={{ color: "red" }}>*</span>
              </Typography>
              <GateInTextField value={preGateInEdit?.bl_no} readOnlyP={true} />
            </Grid>

            <Grid
              item
              size={{ xs: 12, sm: 6, md: 4, lg: 3 }}
              sx={{ placeContent: "center" }}
            >
              <Typography variant="subtitle1" sx={customLabelTypography}>
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
                  size="small"
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

            <Grid
              item
              size={{ xs: 12, sm: 6, md: 4, lg: 3 }}
              sx={{ placeContent: "center" }}
            >
              <Typography variant="subtitle1" sx={customLabelTypography}>
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
                  fullWidth
                  dateValue={preGateInEdit.do_validity_in_date}
                  dateChange={(date) =>
                    handleDateChangeUTILSDispatch(
                      date,
                      dispatch,
                      ADVANCE_FINANCE_CONSTANT.PRE_GATE_IN_EDIT,
                      "do_validity_in_date",
                    )
                  }
                />
              )}
            </Grid>

            <Grid item size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
              <Typography variant="subtitle1" sx={customLabelTypography}>
                Validity Time <span style={{ color: "red" }}>*</span>
              </Typography>
              <GateInTextField
                value={preGateInEdit?.do_validity_in_time}
                readOnlyP={true}
              />
            </Grid>
            <Grid item size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
              <Typography variant="subtitle1" sx={customLabelTypography}>
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
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      "& fieldset": {
                        borderColor: "#243545",
                      },
                    },
                  }}
                  size="small"
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
            <Grid item size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
              <Typography variant="subtitle1" sx={customLabelTypography}>
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
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      "& fieldset": {
                        borderColor: "#243545",
                      },
                    },
                  }}
                  size="small"
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

            <Grid item size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
              <Typography variant="subtitle1" sx={customLabelTypography}>
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
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      "& fieldset": {
                        borderColor: "#243545",
                      },
                    },
                  }}
                  size="small"
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

            <Grid item size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
              <Typography variant="subtitle1" sx={customLabelTypography}>
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
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      "& fieldset": {
                        borderColor: "#243545",
                      },
                    },
                  }}
                  size="small"
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
            <Grid item size={{ sm: 12 }}>
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
        <Paper
          sx={(theme) => ({
            padding: theme.spacing(2),
            borderRadius: 4,
            backgroundColor: theme.palette.background.paper,
            margin: "auto",
            marginTop: "8px",
          })}
          elevation={0}
        >
          <Grid container spacing={1}>
            <Grid item size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
              <Typography variant="subtitle1" sx={customLabelTypography}>
                Client Name <span style={{ color: "red" }}>*</span>
              </Typography>
              <GateInTextField readOnlyP={true} value={preGateOutEdit.client} />
            </Grid>
            <Grid item size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
              <Typography variant="subtitle1" sx={customLabelTypography}>
                Container Number <span style={{ color: "red" }}>*</span>
              </Typography>
              <GateInTextField
                readOnlyP={true}
                value={preGateOutEdit.container_no}
              />
            </Grid>
            <Grid item size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
              <Typography variant="subtitle1" sx={customLabelTypography}>
                Size <span style={{ color: "red" }}>*</span>
              </Typography>
              <GateInTextField readOnlyP={true} value={preGateOutEdit.size} />
            </Grid>
            <Grid item size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
              <Typography variant="subtitle1" sx={customLabelTypography}>
                Type <span style={{ color: "red" }}>*</span>
              </Typography>
              <GateInTextField readOnlyP={true} value={preGateOutEdit.type} />
            </Grid>
            <Grid item size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
              <Typography variant="subtitle1" sx={customLabelTypography}>
                Shipping Line <span style={{ color: "red" }}>*</span>
              </Typography>
              <GateInTextField
                readOnlyP={true}
                value={preGateOutEdit.shipping_line}
              />
            </Grid>

            <Grid item size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
              <Typography variant="subtitle1" sx={customLabelTypography}>
                Manufacturing Date <span style={{ color: "red" }}>*</span>
              </Typography>
              <GateInTextField
                readOnlyP={true}
                value={preGateOutEdit.manufacturing_date}
              />
            </Grid>
            <Grid item size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
              <Typography variant="subtitle1" sx={customLabelTypography}>
                Booking no <span style={{ color: "red" }}>*</span>
              </Typography>
              <GateInTextField readOnlyP={true} value={preGateOutEdit.bk_no} />
            </Grid>
            <Grid item size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
              <Typography variant="subtitle1" sx={customLabelTypography}>
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
                  size="small"
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
            <Grid item size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
              <Typography variant="subtitle1" sx={customLabelTypography}>
                Validity <span style={{ color: "red" }}>*</span>
              </Typography>

              {preGateOutEdit?.newAdd === true ? (
                <GateInTextField
                  fullWidth
                  value={preGateOutEdit?.do_validity_out_date}
                  readOnlyP={true}
                />
              ) : (
                <DatePickerField
                  dateId="in-date"
                  fullWidth
                  dateValue={preGateOutEdit.do_validity_out_date}
                  dateChange={(date) =>
                    handleDateChangeUTILSDispatch(
                      date,
                      dispatch,
                      ADVANCE_FINANCE_CONSTANT.PRE_GATE_OUT_EDIT,
                      "do_validity_out_date",
                    )
                  }
                />
              )}
            </Grid>

            <Grid item size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
              <Typography variant="subtitle1" sx={customLabelTypography}>
                Validity Time <span style={{ color: "red" }}>*</span>
              </Typography>
              <GateInTextField
                value={preGateOutEdit?.do_validity_out_time}
                readOnlyP={true}
              />
            </Grid>
            <Grid item size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
              <Typography variant="subtitle1" sx={customLabelTypography}>
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
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      "& fieldset": {
                        borderColor: "#243545",
                      },
                    },
                  }}
                  size="small"
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
            <Grid item size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
              <Typography variant="subtitle1" sx={customLabelTypography}>
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
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      "& fieldset": {
                        borderColor: "#243545",
                      },
                    },
                  }}
                  size="small"
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

            <Grid item size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
              <Typography variant="subtitle1" sx={customLabelTypography}>
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
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      "& fieldset": {
                        borderColor: "#243545",
                      },
                    },
                  }}
                  size="small"
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
            <Grid item size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
              <Typography variant="subtitle1" sx={customLabelTypography}>
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
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      "& fieldset": {
                        borderColor: "#243545",
                      },
                    },
                  }}
                  size="small"
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
            <Grid item size={{ sm: 12 }}>
              {preGateOutEdit.pk ? (
                <Button
                  variant="contained"
                  color="primary"
                  sx={(theme) => ({
                    width: "200px",
                    margin: "auto",
                    display: "block",
                  })}
                  onClick={handleUpdatePreGateOut}
                >
                  Update Pre Gate Out
                </Button>
              ) : (
                <Button
                  variant="contained"
                  color="primary"
                  sx={(theme) => ({
                    width: "200px",
                    margin: "auto",
                    display: "block",
                  })}
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
      <Typography
        variant="body2"
        sx={(theme) => ({
          [theme.breakpoints.down("sm")]: {
            marginTop: "24px",
            marginLeft: "12px",
          },
        })}
      >
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
      <Backdrop sx={custombackDropStyle} open={ui.isloading}>
        <CircularProgress color="inherit" />
      </Backdrop>
    </LayoutContainer>
  );
};

export default AdvanceFinanceProcess;
