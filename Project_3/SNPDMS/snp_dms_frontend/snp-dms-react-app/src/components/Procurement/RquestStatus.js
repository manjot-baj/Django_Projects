import React, { useState, useEffect, useRef } from "react";

import {
  Grid,
  Button,
  makeStyles,
  Typography,
  Paper,
  Box,
  TextField,
  IconButton,
  Popover,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Tooltip,
  Divider,
  Backdrop,
  CircularProgress,
} from "@material-ui/core";
import { useDispatch, useSelector } from "react-redux";
import LayoutContainer from ".././reusableComponents/LayoutContainer";
import { useHistory } from "react-router-dom";
import { Icon, Image } from "semantic-ui-react";
import { useSnackbar } from "notistack";
import { theme } from "../../App";
import CustomTextfield from ".././reusableComponents/GateInTextField";
import DatePickerField from ".././reusableComponents/DatePickerField";
import { REQ_REDUCER } from "../../reducers/procurement/requesitionReducer";
import ReactTable from "react-table-v6";
import "react-table-v6/react-table.css";
import AddBoxIcon from "@mui/icons-material/AddBox";
import {
  createRequisition,
  deleteRequesition,
  downloadBillByPKAction,
  downloadPDF,
  handleChangeEdit,
  updateHistoryAmount,
  updateRequesition,
  uploadBillByPK,
} from "../../actions/Procurement/requestAction";
import { Autocomplete, Stack } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import DoneIcon from "@mui/icons-material/Done";
import EditIcon from "@mui/icons-material/Edit";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";
import CloseIcon from "@mui/icons-material/Close";
import CheckIcon from "@mui/icons-material/Check";

const useStyles = makeStyles((theme) => ({
  button: {
    fontSize: 12.5,
    borderRadius: 6,
    width: "15%",
    margin: 15,
    border: "1.5px solid #2A5FA5",
    boxShadow: "0px 3px 6px #9199A14D",
    backgroundColor: "#2A5FA5",
    color: "#fff",
    "&:hover": {
      backgroundColor: "#2A5FA5",
    },
    [theme.breakpoints.down("xs")]: {
      width: "50%",
    },
  },
  backdrop: {
    zIndex: theme.zIndex.drawer + 1,
    color: "#fff",
  },
  discountTextField: {
    "&.MuiTextField-root": {
      color: "red",
    },
    "& .MuiInputBase-input": {
      padding: "4px 2px",
      height: "20px",
    },
    "& .MuiAutocomplete-inputRoot": {
      padding: "0px !important",
      height: "30.5px",
    },
  },
  discountTextFieldQty: {
    "&.MuiTextField-root": {
      color: "red",
    },
    "& .MuiInputBase-input": {
      padding: "4px 2px",
      height: "23px",
    },
    "& .MuiAutocomplete-inputRoot": {
      padding: "0px !important",
      height: "30.5px",
    },
  },
  backImage: {
    height: 40,
    width: 40,
    marginBottom: 15,
    cursor: "pointer",
  },
  tableStyle: {
    "&  ::-webkit-scrollbar": {
      height: "5px",
    },
  },
  paperContainer: {
    padding: theme.spacing(4, 3),
  },
  input: {
    padding: 7,
  },
  paperContainer1: {
    padding: "10px",
    marginBottom: 20,
    overflow: "hidden",
    width: "100%",
  },
  choiceSelectContainer: {
    border: "1px solid #243545",
    marginTop: "0rem",
    display: "flex",
    borderRadius: 6,
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
  LabelTypography1: {
    fontSize: 10,
    fontWeight: 400,
    color: "#243545",
    paddingBottom: 4,
    [theme.breakpoints.down("sm")]: {
      paddingBottom: 1,
    },
  },
  autocomplete: {
    "& .MuiAutocomplete-inputRoot[class*='MuiOutlinedInput-root']": {
      padding: 0,
    },
  },
  fab: {
    // color: "#fff",
    cursor: "pointer",
    margin: 5,
    // backgroundColor: "#2A5FA5",
  },
  fabFlex: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  mainFlexButton: {
    display: "flex",
    justifyContent: "space-around",
    alignItems: "center",
  },
  billUpload: {
    padding: "8px",
    boxShadow: "0 0 2px gray",
  },
  billDetails: {
    margin: "40px 0 16px 0",
  },
  inputFile: {
    outline: "none",
  },
  pdfPopover: {
    padding: "8px",
    backgroundColor: "white",
    marginLeft: "-40px",
    zIndex: 400,
  },
  dialogContainer: {
    "& .MuiBackdrop-root": {
      backgroundColor: "rgba(0,0,0,0.1",
    },
  },
  toolRateContainer: {
    padding: "8px",
    backgroundColor: "white",
  },
}));

const RquestStatus = ({ lineOriginal, setLineOriginal }) => {
  const dispatch = useDispatch();
  const classes = useStyles();
  const {ui} = useSelector((state) => state);
  const { editField, getRequesition_by_pk, toolByCategory, requestOrderNo } =
    useSelector((state) => state.ProcurementRequest);
  const proState = useSelector((state) => state.Procurement);
  const history = useHistory();
  const notify = useSnackbar().enqueueSnackbar;
  const [customTotal, setCustomTotal] = useState("");
  const [editAmount, setEditAmount] = useState({
    selected: null,
    amount: null,
  });
  const [billDates, setBillDates] = useState({
    bill_date: "",
    received_date: "",
    bill_no: "",
  });
  const [errorField, setErrorField] = useState(false);
  const [editRate, setEditRate] = useState(false);
  const fileRef = useRef();
  const [file, setFile] = useState([]);
  const [openPDF, setOpenPDF] = React.useState(false);
  const [billUploadNo, setBillUploadNo] = useState(null);

  const handleClickOpenPDF = (original) => {
    setBillUploadNo(original);
    setOpenPDF(true);
  };

  const handleClosePDF = () => {
    setBillUploadNo(null);
    setOpenPDF(false);
  };

  const [editRateTool, setEditRateTool] = useState("");
  const [anchorElToolRate, setAnchorElToolRate] = React.useState(null);
  const [toolRateIndex, setToolRateIndex] = useState(null);
  const [showCancelApproval, setShowCancelApproval] = React.useState(true);

  const handleClickToolRate = (event) => {
    setAnchorElToolRate(event.currentTarget);
  };

  const handleCloseToolRate = () => {
    setAnchorElToolRate(null);
    setEditRateTool("");
    setToolRateIndex(null);
  };

  const openToolRate = Boolean(anchorElToolRate);
  const idToolRate = openToolRate ? `simple-popover-ToolRate` : undefined;
  const handleGoBack = () => {
    history.goBack();
  };

  const handleUploadBill = () => {
    if (file) {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("pk", billUploadNo.pk);
      const config = {
        headers: {
          "content-type": "multipart/form-data",
        },
      };
      dispatch(uploadBillByPK(formData, config, notify));
      handleClosePDF();
    } else {
      notify("Please select a file", { variant: "error" });
    }
  };

  useEffect(() => {
    return () =>
      dispatch({
        type: "REQ_CREATE_ADD_EDIT",
        payload: {
          category: "",
          name: "",
          rate: "",
          remarks: "",
          sku_code: "",
          required_qty: "",
          in_stock: "",
        },
      });
  }, []);

  const handleRequestDateChange = (date) => {
    var selectedDate = new Date(date);
    var dd = String(selectedDate.getDate()).padStart(2, "0");
    var mm = String(selectedDate.getMonth() + 1).padStart(2, "0"); //
    var yyyy = selectedDate.getFullYear();
    var selectedDateFormat = yyyy + "-" + mm + "-" + dd;
    dispatch({
      type: REQ_REDUCER.REQ_GET_REQUEST_BY_PK,
      payload: {
        date: selectedDateFormat,
      },
    });
  };

  const handleRequestBillDateChange = (date, type) => {
    var selectedDate = new Date(date);
    var dd = String(selectedDate.getDate()).padStart(2, "0");
    var mm = String(selectedDate.getMonth() + 1).padStart(2, "0"); //
    var yyyy = selectedDate.getFullYear();
    var selectedDateFormat = yyyy + "-" + mm + "-" + dd;
    setBillDates((prev) => ({
      ...prev,
      [type]: selectedDateFormat,
    }));
  };

  const handleApprove = () => {
    dispatch({
      type: REQ_REDUCER.REQ_GET_REQUEST_BY_PK,
      payload: {
        status: "APPROVED",
      },
    });
    dispatch(updateRequesition(notify, history, false, setLineOriginal));
  };

  const handlePartialyClosed = () => {
    let jointCount = 0;
    for (let index = 0; index < lineOriginal.length; index++) {
      let elementOriginal = lineOriginal[index];
      let element = getRequesition_by_pk.requisition_line[index];
      if (element.received_qty !== elementOriginal.received_qty) {
        break;
      } else {
        jointCount++;
      }
    }
    if (jointCount === lineOriginal.length) {
      notify("Please update Requesition Line to Partial Close ", {
        variant: "warning",
      });
      return;
    }

    if (
      billDates.bill_date.length > 0 &&
      billDates.bill_no.length > 0 &&
      billDates.received_date.length > 0 &&
      (customTotal > 0 || customTotal !== "")
    ) {
      dispatch({
        type: REQ_REDUCER.REQ_GET_REQUEST_BY_PK,
        payload: {
          status: "PARTIAL CLOSED",
          total_amount: customTotal,
        },
      });
      dispatch({
        type: REQ_REDUCER.REQ_REDUCER_ADD_REQUEST_BILL_LINES,
        payload: {
          order_no: getRequesition_by_pk.order_no,
          date: getRequesition_by_pk.date,
          bill_date: billDates.bill_date,
          received_date: billDates.received_date,
          bill_no: billDates.bill_no,
          total_amount: customTotal,
        },
      });
      dispatch(updateRequesition(notify, history, true,setLineOriginal));

      return;
    } else if (billDates.bill_date.length === 0) {
      notify("Please Enter Bill date  ", {
        variant: "warning",
      });
    } else if (billDates.bill_no.length === 0) {
      notify("Please Enter Bill No  ", {
        variant: "warning",
      });
    } else if (billDates.received_date.length === 0) {
      notify("Please Enter Received date  ", {
        variant: "warning",
      });
    } else if (customTotal === "" || customTotal === 0) {
      notify("Please Enter Total Amount ", {
        variant: "warning",
      });
    } else {
      notify(
        "Please Enter Bill date,recieved date,total amount and Bill no  ",
        {
          variant: "warning",
        }
      );
    }
  };

  const handleCreate = () => {
    if (
      editField.category !== "" &&
      editField.name !== "" &&
      editField.sku_code !== "" &&
      editField.required_qty !== "" &&
      editField.required_qty !== 0 &&
      editField.required_qty !== "0" &&
      editField.remarks
    ) {
      handleAddTool();
    }
    if (
      getRequesition_by_pk.order_no.length > 0 &&
      (getRequesition_by_pk.total_amount > 0 ||
        (editField.category !== "" &&
          editField.name !== "" &&
          editField.sku_code !== "" &&
          editField.required_qty !== "" &&
          editField.required_qty !== 0 &&
          editField.required_qty !== "0" &&
          editField.remarks))
    ) {
      setErrorField(false);
      dispatch({
        type: REQ_REDUCER.REQ_GET_REQUEST_BY_PK,
        payload: {
          status: "PENDING",
        },
      });
      dispatch(createRequisition("", notify, history));
    } else if (
      getRequesition_by_pk.order_no.length === 0 ||
      getRequesition_by_pk.order_no === ""
    ) {
      setErrorField(true);
      notify("Please fill Order no  ", { variant: "warning" });
    } else if (
      getRequesition_by_pk.date.length === 0 ||
      getRequesition_by_pk.date === ""
    ) {
      setErrorField(true);
      notify("Please fill Date  ", { variant: "warning" });
    } else {
      setErrorField(true);
      notify("Please add Tool for Requesition  ", { variant: "warning" });
    }
  };

  const handleClose = () => {
    if (
      billDates.bill_date.length > 0 &&
      billDates.bill_no.length > 0 &&
      billDates.received_date.length > 0 &&
      (customTotal > 0 || customTotal !== "")
    ) {
      dispatch({
        type: REQ_REDUCER.REQ_GET_REQUEST_BY_PK,
        payload: {
          status: "CLOSED",
        },
      });
      dispatch({
        type: REQ_REDUCER.REQ_GET_REQUEST_BY_PK_TOTAL_AMOUNT,
      });
      dispatch({
        type: REQ_REDUCER.REQ_REDUCER_ADD_REQUEST_BILL_LINES,
        payload: {
          order_no: getRequesition_by_pk.order_no,
          date: getRequesition_by_pk.date,
          bill_date: billDates.bill_date,
          received_date: billDates.received_date,
          bill_no: billDates.bill_no,
          total_amount: customTotal,
        },
      });
      dispatch(updateRequesition(notify, history, true,setLineOriginal));

      return;
    }
    notify("Please Enter Bill date,recieved date and Bill no  ", {
      variant: "warning",
    });
  };

  const handleDownloadPDF = () => {
    dispatch(downloadPDF(getRequesition_by_pk.pk, notify));
  };

  const handleAddTool = () => {
    dispatch({
      type: REQ_REDUCER.REQ_REDUCER_ADD_TOOL_TO_PK,
      payload: {
        category: editField.category,
        name: editField.name,
        rate: editField.rate,
        sku_code: editField.sku_code,
        required_qty: editField.required_qty,
        received_qty: 0,
        remaining_qty: editField.required_qty,
        amount: editField.required_qty * editField.rate,
        remarks: editField.remarks,
        category_id: editField.category_pk,
        tool_id: editField.tool_pk,
      },
    });
    dispatch({
      type: "REQ_CREATE_ADD_EDIT",
      payload: {
        category: "",
        name: "",
        rate: "",
        remarks: "",
        sku_code: "",
        required_qty: "",
        in_stock: "",
        category_id: "",
        tool_id: "",
      },
    });
    dispatch({
      type: REQ_REDUCER.REQ_GET_REQUEST_BY_PK_TOTAL_AMOUNT,
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    dispatch(handleChangeEdit({ [name]: value }));
  };

  const handleBillChange = (e) => {
    const { value } = e.target;
    setBillDates((prev) => ({ ...prev, bill_no: value }));
  };

  const handleUpdate = () => {
    if (getRequesition_by_pk.status === "APPROVED") {
      dispatch({
        type: REQ_REDUCER.REQ_GET_REQUEST_BY_PK,
        payload: {
          status: "PENDING",
        },
      });
    }
    dispatch(updateRequesition(notify,history,false,setLineOriginal));
  };

  const handleDelete = () => {
    dispatch(deleteRequesition(notify, history));
  };

  const onChangeBillFile = (e) => {
    setFile(e.target.files[0]);
  };

  const handleDownloadBill = (original) => {
    dispatch(downloadBillByPKAction(original.pk, notify));
  };

  const handleToolRateChange = (index) => {
    if (editRateTool === 0) {
      notify("Please enter rate to change", { variant: "warning" });
      return;
    }
    setShowCancelApproval(false);

    dispatch({
      type: REQ_REDUCER.REQ_EDIT_REQUEST_BY_PK_RATE,
      payload: {
        index: index,
        rate: editRateTool,
      },
    });
    if (
      getRequesition_by_pk.status === "APPROVED" ||
      getRequesition_by_pk.status === "PARTIAL CLOSED"
    ) {
      notify("Partially close the Requesition to change the rate", {
        variant: "warning",
      });
    } else {
      dispatch(updateRequesition(notify, history));
    }

    handleCloseToolRate();
  };

  const Columns = [
    {
      Header: <b style={{ color: "#2A5FA5" }}>Category</b>,

      accessor: "category",
      style: {
        textAlign: "center",
      },
    },
    {
      Header: <b style={{ color: "#2A5FA5" }}>Item</b>,
      sortable: false,

      accessor: "name",
      style: {
        textAlign: "center",
      },
    },
    {
      Header: <b style={{ color: "#2A5FA5" }}>Rate</b>,
      sortable: false,

      accessor: "rate",
      style: {
        textAlign: "center",
      },
      Cell: ({ original, index }) => {
        return (
          <Stack
            direction={"row"}
            alignItems={"flex-start"}
            justifyContent={"flex-end"}
            spacing={2}
          >
            <Typography
              variant="subtitle2"
              style={{ color: "#62caa3", fontWeight: "bold" }}
            >
              {original.rate}
            </Typography>
            {(getRequesition_by_pk.status === "APPROVED" ||
              getRequesition_by_pk.status === "PARTIAL CLOSED") && (
              <Tooltip title="Edit Rate">
                <IconButton
                  style={{ marginTop: "-10px" }}
                  onClick={(e) => {
                    setToolRateIndex(index);
                    handleClickToolRate(e);
                  }}
                >
                  <EditIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
            <Popover
              id={idToolRate}
              open={openToolRate}
              anchorEl={anchorElToolRate}
              onClose={handleCloseToolRate}
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "left",
              }}
            >
              <Paper className={classes.toolRateContainer}>
                <Stack
                  direction={"row"}
                  alignItems={"center"}
                  justifyContent={"space-between"}
                >
                  <Typography variant="body2" style={{ fontWeight: "bold" }}>
                    Edit Rate
                  </Typography>
                  <Stack
                    direction={"row"}
                    alignItems={"center"}
                    justifyContent={"space-between"}
                  >
                    <Tooltip title="save Rate">
                      <IconButton
                        variant="contained"
                        color="primary"
                        onClick={() => handleToolRateChange(toolRateIndex)}
                      >
                        <CheckIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Edit Rate">
                      <IconButton
                        onClick={() => {
                          handleCloseToolRate();
                        }}
                      >
                        <CloseIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                </Stack>

                <Divider />
                <Stack
                  marginTop={"8px"}
                  direction={"row"}
                  alignItems={"center"}
                  justifyContent={"center"}
                  spacing={2}
                >
                  <Typography variant="caption" style={{ fontWeight: "bold" }}>
                    From
                  </Typography>
                  <Typography
                    variant="subtitle2"
                    style={{
                      color: "#62caa3",
                      fontWeight: "bold",
                      border: "1px solid rgba(0,0,0,0.09)",
                      padding: "8px 16px",
                    }}
                  >
                    {
                      getRequesition_by_pk?.requisition_line[toolRateIndex]
                        ?.rate
                    }
                  </Typography>
                  <Typography variant="caption" style={{ fontWeight: "bold" }}>
                    To
                  </Typography>
                  <TextField
                    value={editRateTool}
                    variant="outlined"
                    size="small"
                    type="number"
                    step="any"
                    InputProps={{
                      inputProps: { min: 0, max: 1000 },
                    }}
                    inputProps={{ className: classes.input }}
                    onChange={(e) => setEditRateTool(e.target.value)}
                  />
                </Stack>
              </Paper>
            </Popover>
          </Stack>
        );
      },
    },
    {
      Header: <b style={{ color: "#2A5FA5" }}>Sku code</b>,

      sortable: false,
      accessor: "sku_code",
      style: {
        textAlign: "center",
      },
    },
    {
      Header: <b style={{ color: "#2A5FA5" }}>Required Qty</b>,

      sortable: false,
      accessor: "required_qty",
      style: {
        textAlign: "center",
      },
      Cell: ({ original, index }) => {
        if (
          getRequesition_by_pk.mode === "CREATE" ||
          getRequesition_by_pk.status === "PENDING"
        ) {
          return (
            <TextField
              value={original.required_qty}
              variant="outlined"
              size="small"
              type="number"
              step="any"
              InputProps={{
                inputProps: { min: 0, max: 100 },
              }}
              inputProps={{ className: classes.input }}
              onChange={(e) => {
                dispatch({
                  type: REQ_REDUCER.REQ_EDIT_REQUEST_BY_PK_QTY,
                  payload: {
                    index,
                    required_qty: e.target.value,
                  },
                });
                dispatch({
                  type: REQ_REDUCER.REQ_GET_REQUEST_BY_PK_TOTAL_AMOUNT,
                });
              }}
            />
          );
        } else {
          return (
            <Typography variant="subtitle2">{original.required_qty}</Typography>
          );
        }
      },
    },

    {
      Header: <b style={{ color: "#2A5FA5" }}>Recieved Qty</b>,

      sortable: false,
      accessor: "received_qty",
      Cell: ({ original, index }) => {
        return (
          <TextField
            value={original.received_qty}
            variant="outlined"
            size="small"
            step="any"
            type="number"
            contentEditabl={
              getRequesition_by_pk.mode === "CREATE" ||
              getRequesition_by_pk.status === "PENDING"
                ? false
                : true
            }
            InputProps={{ inputProps: { min: 0, max: original.required_qty } }}
            inputProps={{ className: classes.input }}
            error={
              original.received_qty > original.required_qty ||
              original.received_qty < 0
            }
            contentEditable={false}
            onChange={(e) => {
              if (
                e.target.value > original.required_qty ||
                e.target.value < 0
              ) {
                notify(
                  `Please enter value between 0 and ${original.required_qty}`,
                  { variant: "warning" }
                );

                return;
              }
              if (
                getRequesition_by_pk.mode === "CREATE" ||
                getRequesition_by_pk.status === "PENDING" ||
                getRequesition_by_pk.status === "CLOSED"
              ) {
                return;
              }
              dispatch({
                type: REQ_REDUCER.REQ_EDIT_REQUEST_BY_PK_QTY,
                payload: {
                  index,
                  received_qty: e.target.value,
                },
              });
              dispatch({
                type: REQ_REDUCER.REQ_GET_REQUEST_BY_PK_TOTAL_AMOUNT,
              });
            }}
          />
        );
      },
      style: {
        textAlign: "center",
      },
    },
    {
      Header: <b style={{ color: "#2A5FA5" }}>Remaining Qty</b>,

      sortable: false,
      accessor: "remaining_qty",
      style: {
        textAlign: "center",
      },
    },

    {
      Header: <b style={{ color: "#2A5FA5" }}>Amount</b>,

      sortable: false,
      Cell: ({ original }) => {
        return <Typography variant="subtitle2">{original.amount}</Typography>;
      },
      style: {
        textAlign: "center",
      },
    },
    {
      Header: <b style={{ color: "#2A5FA5" }}>Action</b>,

      sortable: false,
      show: getRequesition_by_pk?.status === "PENDING" ? true : false,
      Cell: ({ original, index }) => {
        return (
          <IconButton
            onClick={(e) => {
              dispatch({
                type: REQ_REDUCER.REQ_REDUCER_DELETE_TOOL_TO_PK,
                payload: index,
              });
              dispatch({
                type: REQ_REDUCER.REQ_GET_REQUEST_BY_PK_TOTAL_AMOUNT,
              });
            }}
          >
            <DeleteIcon fontSize="small" style={{ fill: "red" }} />
          </IconButton>
        );
      },
      style: {
        textAlign: "center",
      },
    },
  ];

  const ColumnsHistory = [
    {
      Header: <b style={{ color: "#2A5FA5" }}>Order no </b>,

      accessor: "order_no",
      style: {
        textAlign: "center",
      },
    },
    {
      Header: <b style={{ color: "#2A5FA5" }}>Date</b>,
      sortable: false,

      accessor: "date",
      style: {
        textAlign: "center",
      },
    },
    {
      Header: <b style={{ color: "#2A5FA5" }}>Bill Date</b>,
      sortable: false,

      accessor: "bill_date",
      style: {
        textAlign: "center",
      },
    },
    {
      Header: <b style={{ color: "#2A5FA5" }}>Recieved Date</b>,

      sortable: false,
      accessor: "received_date",
      style: {
        textAlign: "center",
      },
    },
    {
      Header: <b style={{ color: "#2A5FA5" }}>Bill no</b>,

      sortable: false,
      accessor: "bill_no",
      style: {
        textAlign: "center",
      },
    },
    {
      Header: <b style={{ color: "#2A5FA5" }}>Total Amount</b>,
      sortable: false,
      accessor: "total_amount",
      style: {
        textAlign: "center",
      },
    },
    {
      Header: <b style={{ color: "#2A5FA5" }}>Edit Amount</b>,
      sortable: false,
      accessor: "total_amount",
      style: {
        textAlign: "center",
      },
      show: getRequesition_by_pk?.status === "PARTIAL CLOSED" ? true : false,
      Cell: ({ original, index }) => {
        return editAmount.selected === index ? (
          <TextField
            variant="outlined"
            type="number"
            value={editAmount.amount}
            size="small"
            onChange={(e) => {
              const { value } = e.target;
              setEditAmount((prev) => ({ ...prev, amount: value }));
            }}
          />
        ) : (
          <IconButton
            onClick={() =>
              setEditAmount((prev) => ({
                ...prev,
                selected: index,
                amount: null,
              }))
            }
          >
            <EditIcon fontSize="small" />
          </IconButton>
        );
      },
    },
    {
      Header: <b style={{ color: "#2A5FA5" }}>Action </b>,
      sortable: false,
      show: getRequesition_by_pk?.status === "PARTIAL CLOSED" ? true : false,
      accessor: "total_amount",
      style: {
        textAlign: "center",
      },
      Cell: ({ original, index }) => {
        return (
          <IconButton
            onClick={() => {
              if (editAmount.amount >= 0 && editAmount.selected === index) {
                updateHistoryAmount(original.pk, editAmount.amount, notify);
              }

              setEditAmount({
                amount: null,
                selected: null,
              });
            }}
          >
            <DoneIcon style={{ fill: "green" }} />
          </IconButton>
        );
      },
    },
    {
      Header: <b style={{ color: "#2A5FA5" }}>Bill Upload </b>,
      sortable: false,
      show: true,
      style: {
        textAlign: "center",
      },
      Cell: ({ original, index }) => {
        return (
          <>
            <Button
              variant="outlined"
              onClick={() => handleClickOpenPDF(original)}
            >
              Upload
            </Button>
            <Dialog
              open={openPDF}
              onClose={handleClosePDF}
              aria-labelledby="alert-dialog-title"
              aria-describedby="alert-dialog-description"
              className={classes.dialogContainer}
            >
              <DialogTitle id="alert-dialog-title">
                <Typography variant="body2" style={{ fontWeight: "normal" }}>
                  {`Bill Upload - ${billUploadNo?.bill_no}`}
                </Typography>
              </DialogTitle>
              <DialogContent>
                <DialogContentText id="alert-dialog-description">
                  <input
                    type="file"
                    accept="image/png, image/gif, image/jpeg,application/pdf"
                    className={classes.inputFile}
                    onChange={onChangeBillFile}
                    ref={fileRef}
                    style={{
                      width: "500px",
                      marginTop: "16px",
                      fontSize: "14px",
                      color: "gray",
                    }}
                  />
                </DialogContentText>
              </DialogContent>
              <DialogActions>
                <Button onClick={handleClosePDF}>Cancel</Button>
                <Button
                  onClick={handleUploadBill}
                  autoFocus
                  variant="contained"
                  color="primary"
                >
                  Upload
                </Button>
              </DialogActions>
            </Dialog>
          </>
        );
      },
    },
    {
      Header: <b style={{ color: "#2A5FA5" }}>Bill Download</b>,
      sortable: false,
      style: {
        textAlign: "center",
      },
      Cell: ({ original, index }) => {
        return original?.bill_uploaded ? (
          <IconButton onClick={() => handleDownloadBill(original)}>
            <PictureAsPdfIcon style={{ fill: "#e62c31" }} />
          </IconButton>
        ) : null;
      },
    },
  ];

  return (
    <LayoutContainer footer={false}>
      <Grid container>
        <Grid item xs={12}>
          <Image
            src={require("../../assets/images/back-arrow.png")}
            className={classes.backImage}
            onClick={handleGoBack}
          />

          <div>
            <Typography
              variant="subtitle2"
              style={{
                paddingTop: 14,
                paddingBottom: 14,
                backgroundColor: "#243545",
                color: "#FFF",
                marginTop: 10,
                borderTopLeftRadius: 5,
                borderTopRightRadius: 5,
              }}
            >
              <Box fontWeight="fontWeightBold" m={1}>
                Requesition Details
              </Box>
            </Typography>
            <Paper className={classes.paperContainer} elevation={0}>
              <Grid container spacing={3}>
                <Grid
                  item
                  xs={12}
                  sm={3}
                  lg={3}
                  style={theme.breakpoints.down("sm") && { padding: 7 }}
                >
                  <Typography
                    variant="subtitle1"
                    className={classes.LabelTypography}
                  >
                    Order No.
                  </Typography>
                </Grid>

                <Grid
                  item
                  xs={12}
                  sm={3}
                  lg={3}
                  style={theme.breakpoints.down("sm") && { padding: 7 }}
                >
                  {getRequesition_by_pk?.mode === "CREATE" ? (
                    <Autocomplete
                      value={getRequesition_by_pk?.order_no}
                      onChange={handleChange}
                      options={[requestOrderNo] || []}
                      style={{
                        maxWidth: "300px",
                      }}
                      InputProps={classes.inputText}
                      renderInput={(params) => (
                        <TextField
                          className={classes.discountTextField}
                          id="select_category"
                          {...params}
                          error={
                            (getRequesition_by_pk?.order_no === "" ||
                              getRequesition_by_pk.order_no.length === 0) &&
                            errorField
                          }
                          variant="outlined"
                          name="category"
                          onBlur={(e) => {
                            const { value } = e.target;
                            dispatch({
                              type: REQ_REDUCER.REQ_GET_REQUEST_BY_PK,
                              payload: {
                                order_no: value,
                              },
                            });
                          }}
                          size="small"
                          fullWidth
                        />
                      )}
                    />
                  ) : (
                    <TextField
                      id="client-ref-booking-no"
                      value={getRequesition_by_pk?.order_no}
                      variant="outlined"
                      fullWidth
                      disabled
                      inputProps={{ className: classes.input }}
                      readOnlyP
                    />
                  )}
                </Grid>
                <Grid
                  item
                  xs={12}
                  sm={3}
                  lg={3}
                  style={theme.breakpoints.down("sm") && { padding: 7 }}
                >
                  <Typography
                    variant="subtitle1"
                    className={classes.LabelTypography}
                  >
                    Order Date
                  </Typography>
                </Grid>
                <Grid
                  item
                  xs={12}
                  sm={3}
                  lg={3}
                  style={theme.breakpoints.down("sm") && { padding: 7 }}
                >
                  <DatePickerField
                    dateId="to-date"
                    dateValue={getRequesition_by_pk?.date}
                    dateChange={handleRequestDateChange}
                  />
                </Grid>

                {getRequesition_by_pk?.mode !== "CREATE" && (
                  <Grid
                    item
                    xs={12}
                    sm={3}
                    lg={3}
                    style={theme.breakpoints.down("sm") && { padding: 7 }}
                  >
                    <Typography
                      variant="subtitle1"
                      className={classes.LabelTypography}
                    >
                      Current Status
                    </Typography>
                  </Grid>
                )}
                {getRequesition_by_pk?.mode !== "CREATE" && (
                  <Grid
                    item
                    xs={12}
                    sm={3}
                    lg={3}
                    style={theme.breakpoints.down("sm") && { padding: 7 }}
                  >
                    <Button
                      fullWidth
                      startIcon={
                        <FiberManualRecordIcon
                          fontSize="small"
                          style={{
                            fill:
                              getRequesition_by_pk?.status === "PENDING"
                                ? "#d98f23"
                                : getRequesition_by_pk?.status === "APPROVED"
                                ? "#74a74b"
                                : getRequesition_by_pk?.status ===
                                  "PARTIAL CLOSED"
                                ? "#505050"
                                : "#b9401b",
                            transform: "scale(0.5)",
                          }}
                        />
                      }
                      style={{
                        color:
                          getRequesition_by_pk?.status === "PENDING"
                            ? "#d98f23"
                            : getRequesition_by_pk?.status === "APPROVED"
                            ? "#74a74b"
                            : getRequesition_by_pk?.status === "PARTIAL CLOSED"
                            ? "#505050"
                            : "#b9401b",
                        backgroundColor:
                          getRequesition_by_pk?.status === "PENDING"
                            ? "rgba(223, 183, 124, 0.05)"
                            : getRequesition_by_pk?.status === "APPROVED"
                            ? "rgba(116, 167, 75, 0.05)"
                            : getRequesition_by_pk?.status === "PARTIAL CLOSED"
                            ? "rgba(80, 80, 80, 0.05)"
                            : "rgba(185, 64, 27, 0.05)",
                        fontSize: "14px",
                        borderRadius: "8px",
                        fontWeight: "bold",
                        padding: "4px 16px",
                      }}
                    >
                      {getRequesition_by_pk?.status}
                    </Button>
                  </Grid>
                )}

                {(getRequesition_by_pk?.status === "APPROVED" ||
                  getRequesition_by_pk?.status === "PENDING" ||
                  getRequesition_by_pk?.status === "PARTIAL CLOSED" ||
                  getRequesition_by_pk?.status === "CLOSED") && (
                  <>
                    <Grid
                      item
                      xs={12}
                      sm={3}
                      lg={3}
                      style={theme.breakpoints.down("sm") && { padding: 7 }}
                    >
                      <Typography
                        variant="subtitle1"
                        className={classes.LabelTypography}
                      >
                        Original Amount
                      </Typography>
                    </Grid>
                    <Grid
                      item
                      xs={12}
                      sm={3}
                      lg={3}
                      style={theme.breakpoints.down("sm") && { padding: 7 }}
                    >
                      <TextField
                        id="client-ref-booking-no"
                        value={getRequesition_by_pk?.requisition_line.reduce(
                          (a, c) => a + c.rate * c.required_qty,
                          0
                        )}
                        variant="outlined"
                        fullWidth
                        disabled={true}
                        inputProps={{ className: classes.input }}
                        readOnlyP
                      />
                    </Grid>
                  </>
                )}

                <Grid
                  item
                  xs={12}
                  sm={6}
                  lg={6}
                  style={theme.breakpoints.down("sm") && { padding: 7 }}
                />

                <div style={{ width: "100%" }}>
                  <Paper elevation={0}>
                    <ReactTable
                      data={
                        (getRequesition_by_pk &&
                          getRequesition_by_pk?.requisition_line) ||
                        []
                      }
                      showPagination={false}
                      defaultPageSize={5}
                      pageSize={
                        getRequesition_by_pk?.requisition_line
                          ? getRequesition_by_pk.requisition_line.length + 3
                          : 5
                      }
                      columns={[...Columns]}
                      collapseOnDataChange={false}
                      style={{
                        marginTop: 50,
                        marginBottom: 20,
                      }}
                      className={classes.tableStyle}
                    />
                  </Paper>
                </div>

                {getRequesition_by_pk?.status === "PENDING" ? (
                  <Paper className={classes.paperContainer1} elevation={2}>
                    <form
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <Grid container spacing={1}>
                        <Grid
                          item
                          xs={6}
                          sm={2}
                          style={{ alignSelf: "flex-end" }}
                        >
                          <Typography className={classes.LabelTypography1}>
                            Category
                          </Typography>

                          <Autocomplete
                            value={editField?.category}
                            // onChange={handleChange}
                            options={
                              proState?.getAllToolsCategory?.category_list?.map(
                                (val) => ({
                                  label: val.name,
                                  name: val.name,
                                  pk: val.pk,
                                })
                              ) || []
                            }
                            style={{
                              maxWidth: "300px",
                            }}
                            onChange={(prev, newvalue) =>{
                              
                              dispatch(
                                handleChangeEdit({ category_pk: newvalue.pk })
                              )}
                            }
                            InputProps={classes.inputText}
                            renderInput={(params) => (
                              <TextField
                                className={classes.discountTextField}
                                id="select_category"
                                {...params}
                                variant="outlined"
                                name="category"
                                error={
                                  errorField &&
                                  (editField.category === "" ||
                                    editField.category.length === 0)
                                }
                                onBlur={handleChange}
                                size="small"
                                required
                                fullWidth
                              />
                            )}
                          />
                        </Grid>
                        <Grid
                          item
                          xs={6}
                          sm={2}
                          style={{ alignSelf: "flex-end" }}
                        >
                          <Typography className={classes.LabelTypography1}>
                            Item
                          </Typography>

                          <Autocomplete
                            value={editField?.name}
                            onChange={(prev, newvalue) =>
                              dispatch(
                                handleChangeEdit({ tool_pk: newvalue.pk })
                              )
                            }
                            style={{
                              maxWidth: "300px",
                            }}
                            options={
                              toolByCategory?.map((val) => ({
                                label: val.name,
                                ...val,
                              })) || []
                            }
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                className={classes.discountTextField}
                                variant="outlined"
                                label=""
                                id="select_name"
                                error={
                                  errorField &&
                                  (editField.name === "" ||
                                    editField.name.length === 0)
                                }
                                name="name"
                                onBlur={handleChange}
                                required
                                size="small"
                                fullWidth
                              />
                            )}
                          />
                        </Grid>
                        <Grid
                          item
                          xs={4}
                          sm={2}
                          style={{ alignSelf: "flex-end" }}
                        >
                          <Typography className={classes.LabelTypography1}>
                            Rate
                          </Typography>

                          <TextField
                            value={editField.rate}
                            variant="outlined"
                            defaultValue={0}
                            size="medium"
                            type="number"
                            name="rate"
                            fullWidth
                            className={classes.discountTextFieldQty}
                            InputProps={{
                              inputProps: { min: 0, max: 100 },
                            }}
                            inputProps={{ className: classes.input }}
                            onChange={handleChange}
                            disabled={!editRate}
                          />
                        </Grid>
                        <Grid
                          item
                          xs={2}
                          sm={1}
                          style={{ alignSelf: "flex-end" }}
                        >
                          <Typography className={classes.LabelTypography1}>
                            Sku code
                          </Typography>

                          <CustomTextfield
                            id="stocks-allot-container-number"
                            value={editField.sku_code}
                            readOnlyP
                          />
                        </Grid>

                        <Grid
                          item
                          xs={2}
                          sm={1}
                          style={{ alignSelf: "flex-end" }}
                        >
                          <Typography className={classes.LabelTypography1}>
                            In Stock
                          </Typography>

                          <CustomTextfield
                            value={
                              editField.in_stock === 0
                                ? "0"
                                : editField.in_stock
                            }
                            readOnlyP
                          />
                        </Grid>
                        <Grid
                          item
                          xs={4}
                          sm={1}
                          style={{ alignSelf: "flex-end" }}
                        >
                          <Typography className={classes.LabelTypography1}>
                            Amount
                          </Typography>

                          <CustomTextfield
                            id="stocks-allot-container-number"
                            value={editField.required_qty * editField.rate}
                            dispatchType={"SET_MNR_SURVEY_MAIN_COMPONENT"}
                            readOnlyP
                          />
                        </Grid>
                        <Grid
                          item
                          xs={4}
                          sm={1}
                          style={{ alignSelf: "flex-end" }}
                        >
                          <Typography className={classes.LabelTypography1}>
                            Required Qty
                          </Typography>

                          <TextField
                            value={editField.required_qty}
                            variant="outlined"
                            defaultValue={0}
                            size="small"
                            type="number"
                            name="required_qty"
                            error={
                              errorField &&
                              (editField.required_qty === "" ||
                                editField.required_qty === 0 ||
                                editField.required_qty === "0")
                            }
                            className={classes.discountTextFieldQty}
                            InputProps={{
                              inputProps: { min: 0, max: 100 },
                            }}
                            inputProps={{ className: classes.input }}
                            onChange={handleChange}
                          />
                        </Grid>
                        <Grid item xs={4} sm={1}>
                          <Typography className={classes.LabelTypography1}>
                            Remarks
                          </Typography>

                          <TextField
                            value={editField.remarks}
                            variant="outlined"
                            size="small"
                            name="remarks"
                            error={
                              errorField &&
                              (editField.remarks === "" ||
                                editField.remarks.length === 0)
                            }
                            className={classes.discountTextFieldQty}
                            inputProps={{ className: classes.input }}
                            onChange={handleChange}
                          />
                        </Grid>

                        <Grid
                          item
                          xs={4}
                          sm={1}
                          style={{ alignSelf: "flex-end" }}
                        >
                          <IconButton
                            type="submit"
                            onClick={handleAddTool}
                            disabled={
                              editField.category === "" ||
                              editField.name === "" ||
                              editField.remarks === "" ||
                              editField.required_qty === "" ||
                              editField.sku_code === ""
                            }
                          >
                            <AddBoxIcon style={{ fill: "#08ff08" }} />
                          </IconButton>
                        </Grid>
                      </Grid>
                    </form>
                  </Paper>
                ) : (
                  <Stack
                    width={"100%"}
                    direction={"row"}
                    justifyContent={"flex-end"}
                    alignItems={"center"}
                  >
                    <Grid
                      item
                      xs={12}
                      sm={2}
                      lg={2}
                      style={theme.breakpoints.down("sm") && { padding: 7 }}
                    >
                      <Typography
                        variant="subtitle1"
                        className={classes.LabelTypography}
                      >
                        Remaining Amount
                      </Typography>
                    </Grid>
                    <Grid
                      item
                      xs={12}
                      sm={3}
                      lg={3}
                      style={theme.breakpoints.down("sm") && { padding: 7 }}
                    >
                      <CustomTextfield
                        id="client-handling-state-code"
                        value={getRequesition_by_pk?.requisition_line?.reduce(
                          (a, c) => a + c.rate * c.remaining_qty,
                          0
                        )}
                        readOnlyP
                      />
                    </Grid>
                  </Stack>
                )}
              </Grid>

              {getRequesition_by_pk?.status !== "PENDING" &&
                getRequesition_by_pk?.status !== "APPROVED" && (
                  <div
                    style={{ width: "100%", margin: "30px 10px auto auto " }}
                  >
                    <Paper elevation={0}>
                      <Typography
                        variant="subtitle2"
                        style={{
                          paddingTop: 14,
                          paddingBottom: 14,
                          backgroundColor: "#243545",
                          color: "#FFF",
                          marginTop: 10,
                          borderTopLeftRadius: 5,
                          borderTopRightRadius: 5,
                        }}
                      >
                        <Box fontWeight="fontWeightBold" m={1}>
                          Requesition History
                        </Box>
                      </Typography>
                      <ReactTable
                        data={
                          (getRequesition_by_pk &&
                            getRequesition_by_pk?.requisition_history_line) ||
                          []
                        }
                        showPagination={false}
                        defaultPageSize={5}
                        pageSize={
                          getRequesition_by_pk?.requisition_history_line
                            ? getRequesition_by_pk.requisition_history_line
                                .length + 3
                            : 5
                        }
                        columns={[...ColumnsHistory]}
                        collapseOnDataChange={false}
                        className={classes.tableStyle}
                        style={{
                          marginBottom: 20,
                        }}
                      />
                    </Paper>
                  </div>
                )}
              {getRequesition_by_pk?.status !== "PENDING" &&
                getRequesition_by_pk?.status !== "CLOSED" && getRequesition_by_pk?.status !== "AUTOMATE" && (
                  <Typography variant="body2" className={classes.billDetails}>
                    Bill Details
                  </Typography>
                )}
              {getRequesition_by_pk?.status !== "PENDING" &&
                getRequesition_by_pk?.status !== "CLOSED" && getRequesition_by_pk?.status !== "AUTOMATE" && (
                  <Grid container className={classes.billUpload}>
                    <Grid item xs={6} sm={6} lg={3}>
                      <Grid
                        item
                        xs={12}
                        sm={12}
                        lg={12}
                        style={theme.breakpoints.down("sm") && { padding: 7 }}
                      >
                        <Typography
                          variant="subtitle1"
                          className={classes.LabelTypography}
                        >
                          Bill Date <span style={{ color: "red" }}>*</span>
                        </Typography>
                      </Grid>
                      <Grid
                        item
                        xs={12}
                        sm={12}
                        lg={12}
                        style={theme.breakpoints.down("sm") && { padding: 7 }}
                      >
                        <DatePickerField
                          dateId="to-date"
                          dateValue={billDates.bill_date}
                          dateChange={(e) =>
                            handleRequestBillDateChange(e, "bill_date")
                          }
                        />
                      </Grid>
                    </Grid>
                    <Grid item xs={6} sm={6} lg={3}>
                      <Grid
                        item
                        xs={12}
                        sm={12}
                        lg={12}
                        style={theme.breakpoints.down("sm") && { padding: 7 }}
                      >
                        <Typography
                          variant="subtitle1"
                          className={classes.LabelTypography}
                        >
                          Recieved Date <span style={{ color: "red" }}>*</span>
                        </Typography>
                      </Grid>

                      <Grid
                        item
                        xs={12}
                        sm={12}
                        lg={12}
                        style={theme.breakpoints.down("sm") && { padding: 7 }}
                      >
                        <DatePickerField
                          dateId="to-date"
                          dateValue={billDates.received_date}
                          dateChange={(e) =>
                            handleRequestBillDateChange(e, "received_date")
                          }
                        />
                      </Grid>
                    </Grid>

                    <Grid item xs={6} sm={6} lg={3}>
                      <Grid
                        item
                        xs={12}
                        sm={12}
                        lg={12}
                        style={theme.breakpoints.down("sm") && { padding: 7 }}
                      >
                        <Typography
                          variant="subtitle1"
                          className={classes.LabelTypography}
                        >
                          Bill No <span style={{ color: "red" }}>*</span>
                        </Typography>
                      </Grid>

                      <Grid
                        xs={12}
                        sm={12}
                        lg={12}
                        style={theme.breakpoints.down("sm") && { padding: 7 }}
                      >
                        <TextField
                          value={billDates.bill_no}
                          variant="outlined"
                          fullWidth
                          inputProps={{ className: classes.input }}
                          onChange={handleBillChange}
                        />
                      </Grid>
                    </Grid>

                    <Grid item xs={6} sm={6} lg={3}>
                      <Grid
                        item
                        xs={12}
                        sm={12}
                        lg={12}
                        style={theme.breakpoints.down("sm") && { padding: 7 }}
                      >
                        <Typography
                          variant="subtitle1"
                          className={classes.LabelTypography}
                        >
                          Total Amount <span style={{ color: "red" }}>*</span>
                        </Typography>
                      </Grid>
                      <Grid
                        item
                        xs={12}
                        sm={12}
                        lg={12}
                        style={theme.breakpoints.down("sm") && { padding: 7 }}
                      >
                        {getRequesition_by_pk?.status === "PARTIAL CLOSED" ||
                        getRequesition_by_pk?.status === "APPROVED" ? (
                          <TextField
                            variant="outlined"
                            fullWidth
                            size="small"
                            value={customTotal}
                            type="number"
                            step="any"
                            inputProps={{ className: classes.input }}
                            onChange={(e) => setCustomTotal(e.target.value)}
                          />
                        ) : (
                          <CustomTextfield
                            id="client-handling-state-code"
                            value={getRequesition_by_pk?.total_amount}
                            readOnlyP
                          />
                        )}
                      </Grid>
                    </Grid>
                  </Grid>
                )}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "flex-end",
                  marginTop: "60px",
                }}
              ></div>
            </Paper>
          </div>
          {getRequesition_by_pk?.mode !== "CREATE" ? (
            <Grid
              style={{
                marginLeft: "auto",
                marginRight: "auto",
                width: "100%",
                marginTop: 16,
                marginBottom: 16,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              {(getRequesition_by_pk?.status_list?.includes("PENDING") ||
                getRequesition_by_pk?.status === "APPROVED") && (
                <>
                  {getRequesition_by_pk.status === "PENDING" && (
                    <Button
                      className={classes.button}
                      onClick={handleDelete}
                      style={{ backgroundColor: "#ff0000" }}
                    >
                      Delete
                    </Button>
                  )}
                  <Button
                    className={classes.button}
                    onClick={handleUpdate}
                    disabled={!showCancelApproval}
                    // disabled={!billing.billing_pk}
                  >
                    {getRequesition_by_pk?.status === "APPROVED"
                      ? "Cancel Approval"
                      : "Update"}
                  </Button>
                </>
              )}
              {getRequesition_by_pk?.status_list?.includes("APPROVED") && (
                <Button
                  style={{ backgroundColor: "#77af25", color: "white" }}
                  className={classes.button}
                  onClick={handleApprove}
                >
                  Approve
                </Button>
              )}
              {(getRequesition_by_pk?.status_list?.includes("PARTIAL CLOSED") ||
                getRequesition_by_pk?.status === "PARTIAL CLOSED") &&
              getRequesition_by_pk?.requisition_line.reduce(
                (a, c) => a + c.rate * c.remaining_qty,
                0
              ) !== 0 ? (
                <Button
                  className={classes.button}
                  onClick={handlePartialyClosed}
                  style={{ backgroundColor: "#505050", color: "white" }}
                >
                  Partialy Close
                </Button>
              ) : (
                ""
              )}
              {getRequesition_by_pk?.status === "APPROVED" && (
                <Button
                  className={classes.button}
                  onClick={handleDownloadPDF}
                  style={{
                    border: "2px solid #f60000",
                    backgroundColor: "#f60000",
                    color: "white",
                  }}
                >
                  Download (PDF)
                </Button>
              )}
              {getRequesition_by_pk?.status_list?.includes("CLOSED") &&
              getRequesition_by_pk?.requisition_line.reduce(
                (a, c) => a + c.rate * c.remaining_qty,
                0
              ) === 0 &&
              getRequesition_by_pk.status !== "CLOSED" && getRequesition_by_pk?.status !== "AUTOMATE" ? (
                <Button
                  style={{ backgroundColor: "#b9401b", color: "white" }}
                  className={classes.button}
                  onClick={handleClose}
                >
                  Close
                </Button>
              ) : (
                ""
              )}
            </Grid>
          ) : (
            <Grid
              style={{
                marginLeft: "auto",
                marginRight: "auto",
                width: "100%",
                marginTop: 16,
                marginBottom: 16,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Button
                className={classes.button}
                onClick={handleCreate}
                // disabled={!billing.billing_pk}
                style={{ backgroundColor: "#2a5fa5", color: "white" }}
              >
                Create Requesition
              </Button>
            </Grid>
          )}
        </Grid>
      </Grid>
      <Backdrop className={classes.backdrop} open={ui.loading}>
        <CircularProgress color="inherit" />
      </Backdrop>
    </LayoutContainer>
  );
};

export default RquestStatus;
