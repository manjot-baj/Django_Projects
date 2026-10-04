import React, { useCallback, useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import LayoutContainer from "../../components/reusableComponents/LayoutContainer";
import {
  Grid,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  Select,
  TextField,
  makeStyles,
  MenuItem,
  Box,
  FormControl,
  InputLabel,
  FormControlLabel,
  Radio,
  IconButton,
  Divider,
  useMediaQuery,
} from "@material-ui/core";
import { useDispatch, useSelector } from "react-redux";
import { TOOL_TRANSFER_CONSTANT } from "../../reducers/procurement/toolTransferReducer";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";

import { toolGetNameByCategory } from "../../actions/Procurement/requestAction";
import { toolGetAllCategory } from "../../actions/Procurement/procurementAction";
import {
  getToolTransferPerIDAction,
  getToolTransferTableAction,
  requestToolTransferAction,
} from "../../actions/Procurement/toolTransferAction";
import ToolTransferModel from "./ToolTransferModel";
import { Stack } from "@mui/material";
import PreviousIcon from "@material-ui/icons/ArrowBack";
import NextIcon from "@material-ui/icons/ArrowForward";
import AutomationSearch from "../../components/reusableComponents/AutomationSearch";
import ReplayIcon from "@mui/icons-material/Replay";
import { useSnackbar } from "notistack";
import CloseIcon from "@mui/icons-material/Close";
import CustomHeading from "../../components/CustomHeading";

const useStyles = makeStyles((theme) => ({
  radioLabel: {
    "& .MuiFormControlLabel-label": {
      fontSize: "12px",
    },
  },
  procurementTable: {
    "&::-webkit-scrollbar": {
      display: "none",
    },
  },
  textField: {
    "& .MuiFormLabel-root": {
      fontSize: "12px",
    },
    "& .MuiFormLabel-root.Mui-focused": {
      fontSize: "14px",
    },
  },
  selectText: {
    height: "32px",
    backgroundColor: "#f8fafb",
  },
  headingColor: {
    color: "black",
    fontSize: "12px",
  },
  addIcon: {
    backgroundColor: "#2c036a",
    borderRadius: "4px",
    color: "white",
  },
  inputDate: {
    fontSize: 12,
    padding: 8,
    backgroundColor: "#fff",
  },
  textFieldDate: {
    backgroundColor: "#f8fafb",
    "& .MuiOutlinedInput-root": {
      backgroundColor: "#f8fafb",
      "& fieldset": {
        backgroundColor: "#f8fafb",
        borderColor: "#b3b4b8",
      },
    },
  },
  dialogContainer: {
    "& .MuiPaper-root": {
      backgroundColor: "white",
    },
  },
  inputProcess: {
    marginLeft: theme.spacing(1),
    flex: 1,
    fontSize: "0.8rem",
    "&.MuiInput-underline:before": {
      borderBottom: "none",
    },
    "&.MuiInput-underline:after": {
      borderBottom: "none",
    },
    padding: "0 10px",
    [theme.breakpoints.down("xs")]: {
      padding: 1,
      fontSize: "0.8rem",
    },
  },
  approveButton: {
    backgroundColor: "#10b981",
    color: "white",
    padding: "4px 20px",
    display: "block",
    margin: "auto",
  },
  closeIcon: {
    border: "2px solid gray",
    borderRadius: "4px",
    padding: "4px",
  },
  input: {
    marginLeft: theme.spacing(1),
    flex: 1,
    padding: 7,
    width: "70px",
    borderRadius: "0px",
    borderColor: "#2a5fa5",
    fontSize: "12px",
    [theme.breakpoints.down("xs")]: {
      padding: 1,
      fontSize: "0.8rem",
    },
  },
}));

const TABLE_CONST = [
  "date",
  "tool_transfer_no",
  "status",
  "requested_from",
  "location",
  "site",
  "approve",
];

const ProcurementToolTransfer = () => {
  const dispatch = useDispatch();
  const classes = useStyles();
  const notify = useSnackbar().enqueueSnackbar;
  const history = useHistory();
  const [open, setOpen] = React.useState(false);
  const [searchText, setSearchText] = useState("");
  const [process, setProcess] = useState("item");
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [disable, setDisable] = useState(1);
  const matchesIphone = useMediaQuery("(max-width:500px)");
  const { toolTransferReducer, Procurement, ProcurementRequest, user } =
    useSelector((state) => state);
  const { editField } = useSelector((state) => state.ProcurementRequest);
  const { toolRequest, toolTable } = toolTransferReducer;
  const [selectedRequest, setSelectedRequest] = useState({
    category: "",
    name: "",
    quantity: 0,
  });
  const [openModel, setOpenModel] = React.useState(false);
  const handleOpenModel = (row) => {
    dispatch(getToolTransferPerIDAction(row.pk, notify));
    setOpenModel(true);
  };
  const handleCloseModel = () => setOpenModel(false);

  useEffect(() => {
    dispatch(toolGetAllCategory());
    dispatch(getToolTransferTableAction(notify));
  }, []);

  useEffect(() => {
    dispatch(toolGetNameByCategory(selectedRequest.category,notify));

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedRequest.category, selectedRequest.name]);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };
  const handleChangeToolRequest = (event) => {
    const { name, value } = event.target;
    dispatch({
      type: TOOL_TRANSFER_CONSTANT.TOOL_TRANSFER_REQUEST_FORM,
      payload: { [name]: value },
    });
  };
  const handleRequestFormChangeTool = (event) => {
    const { name, value } = event.target;
    setSelectedRequest({ ...selectedRequest, [name]: value });
  };

  const handleToolAdd = () => {
    dispatch({
      type: TOOL_TRANSFER_CONSTANT.TOOL_TRANSFER_REQUEST_FORM_LINE_ADD,
      payload: {
        category: selectedRequest.category,
        name: selectedRequest.name,
        quantity: selectedRequest.quantity,
      },
    });
    setSelectedRequest({
      category: "",
      name: "",
      quantity: 0,
    });
  };

  const handleClickRequest = () => {
    if (toolRequest.date === "") {
      notify("Please select a date", { variant: "warning" });
    } else if (toolRequest.tool_transfer_no === "") {
      notify("Please enter Tool Transfer No ", { variant: "warning" });
    } else if (toolRequest.tool_request_line.length === 0) {
      notify("Please add tool to request ", { variant: "warning" });
    } else {
      dispatch(requestToolTransferAction(notify));
    }
  };

  const handleSearchChange = useCallback(
    (e) => {
      setSearchText(e.target.value);
    },
    [searchText]
  );
  const handleCloseClick = useCallback(() => setSearchText(""), [searchText]);
  const handleSearchButton = useCallback(() => {
    dispatch({
      type: TOOL_TRANSFER_CONSTANT.TOOL_TRANSFER_TABLE,
      payload:
        process === "item"
          ? { item: searchText }
          : process === "sku_code"
          ? { sku_code: searchText }
          : {
              tool_transfer_no: searchText,
            },
    });
    dispatch(getToolTransferTableAction(notify));
  }, [searchText, loading, notify, process]);

  const handleRefreshTable = () => {
    dispatch({
      type: TOOL_TRANSFER_CONSTANT.TOOL_TRANSFER_TABLE,
      payload: {
        item: "",
        sku_code: "",
        tool_transfer_no: "",
        pg_no:1
      },
    });
    dispatch(getToolTransferTableAction(notify));
  };

  const handleSetProcess = (event) => {
    setSearchText("");
    dispatch({
      type: TOOL_TRANSFER_CONSTANT.TOOL_TRANSFER_TABLE,
      payload: {
        item: "",
        sku_code: "",
        tool_transfer_no: "",
      },
    });
    setProcess(event.target.value);
  };

  const handleRequestDateChange = (date) => {
    var selectedDate = new Date(date.target.value);
    var dd = String(selectedDate.getDate()).padStart(2, "0");
    var mm = String(selectedDate.getMonth() + 1).padStart(2, "0"); //
    var yyyy = selectedDate.getFullYear();
    var selectedDateFormat = yyyy + "-" + mm + "-" + dd;
    dispatch({
      type: TOOL_TRANSFER_CONSTANT.TOOL_TRANSFER_REQUEST_FORM,
      payload: {
        date: selectedDateFormat,
      },
    });
  };

  const handleDeleteRow = (row, index) => {
    dispatch({
      type: TOOL_TRANSFER_CONSTANT.TOOL_TRANSFER_REQUEST_FORM_LINE_REMOVE,
      payload: index,
    });
  };

  const prevStockPage = () => {
    setCurrentPage(Number(currentPage) - 1);
    setDisable(disable - 1);
    dispatch({
      type: TOOL_TRANSFER_CONSTANT.TOOL_TRANSFER_TABLE,
      payload: {
        pg_no: Number(toolTable.pg_no) - 1,
      },
    });
    dispatch(getToolTransferTableAction(notify));
  };

  const nextStockPage = () => {
    setCurrentPage(Number(currentPage) + 1);
    setDisable(disable + 1);
    dispatch({
      type: TOOL_TRANSFER_CONSTANT.TOOL_TRANSFER_TABLE,
      payload: {
        pg_no: Number(toolTable.pg_no) + 1,
      },
    });
    dispatch(getToolTransferTableAction(notify));
  };

  return (
    <LayoutContainer footer={false}>
      <Grid container spacing={6} >
        <Grid item sm={9}>
          {" "}
          <CustomHeading variant="body1" customClass="pageTitle">
            Procurement Tool Transfer
          </CustomHeading>
        </Grid>
        {(user.procurement_admin ==="False"||user.procurement_admin ===false) && (
          <Grid item sm={3}>
            <Button
              variant="contained"
              color="primary"
              style={{
                margin: "auto",
                display: "block",
                marginRight: "0",
              }}
              onClick={() =>
                history.push({
                  pathname: "/procurement/tool-transfer-request",
                  state: {
                    mode: "create",
                    data: "",
                  },
                })
              }
            >
              Request Tool Transfer
            </Button>
            <Dialog
              open={open}
              onClose={handleClose}
              aria-labelledby="alert-dialog-title"
              aria-describedby="alert-dialog-description"
              style={{ overflowY: "hidden" }}
              fullWidth
              maxWidth={"sm"}
              className={classes.dialogContainer}
            >
              <DialogTitle
                id="alert-dialog-title"
                style={{ fontWeight: "bold" }}
              >
                <Stack direction={"row"} justifyContent={"space-between"}>
                  <Typography
                    variant="h6"
                    style={{ fontWeight: "bold", marginBottom: "4px" }}
                  >
                    Request Tool Transfer
                  </Typography>
                  <IconButton onClick={handleClose}>
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </Stack>
              </DialogTitle>

              <DialogContent style={{ overflowY: "hidden" }}>
                <Grid container spacing={2} style={{ marginBottom: "16px" }}>
                  <Grid item sm={12}>
                    <Grid container spacing={2}>
                      <Grid item sm={12}>
                        <TextField
                          fullWidth
                          label="Date"
                          variant="standard"
                          value={toolRequest.date ? toolRequest.date : null}
                          format="yyyy/MM/dd"
                          name={"date"}
                          type="date"
                          onChange={handleRequestDateChange}
                          // className={classes.selectText}
                          className={classes.textField}
                          style={{ width: "235px" }}
                          inputProps={{
                            style: { height: "32px", padding: "0 4px" },
                          }}
                        />
                      </Grid>
                      <Grid item sm={12}>
                        <TextField
                          fullWidth
                          label="Tool transfer No"
                          variant="standard"
                          value={toolRequest.tool_transfer_no}
                          name={"tool_transfer_no"}
                          type="text"
                          className={classes.textField}
                          style={{ width: "235px" }}
                          inputProps={{
                            style: { height: "32px", padding: "0 4px" },
                          }}
                          onChange={handleChangeToolRequest}
                        />
                      </Grid>
                    </Grid>
                  </Grid>

                  {toolRequest.tool_request_line?.length > 0 && (
                    <Grid
                      item
                      sm={12}
                      style={{
                        marginTop: "12px",
                        overflowX: "scroll",
                        padding: matchesIphone ? "0 12px" : "0 4px",
                      }}
                      className={classes.procurementTable}
                    >
                      <TableContainer
                        component={Paper}
                        style={{ borderRadius: "8px  8px 0 0" }}
                        className={classes.procurementTable}
                      >
                        <Table
                          stickyHeader
                          sx={{ maxWidth: 230 }}
                          aria-label="simple table"
                          className={classes.procurementTable}
                        >
                          <TableHead>
                            <TableRow>
                              <TableCell align="center">
                                <Typography
                                  variant="subtitle2"
                                  style={{ fontWeight: "bold" }}
                                >
                                  Category
                                </Typography>{" "}
                              </TableCell>
                              <TableCell align="center">
                                <Typography
                                  variant="subtitle2"
                                  style={{ fontWeight: "bold" }}
                                >
                                  Name
                                </Typography>
                              </TableCell>
                              <TableCell align="center">
                                <Typography
                                  variant="subtitle2"
                                  style={{ fontWeight: "bold" }}
                                >
                                  Quantity
                                </Typography>
                              </TableCell>
                              <TableCell align="center">
                                <Typography
                                  variant="subtitle2"
                                  style={{ fontWeight: "bold" }}
                                >
                                  Delete
                                </Typography>
                              </TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody style={{ maxHeight: "100px" }}>
                            {toolRequest.tool_request_line?.map(
                              (row, index) => (
                                <TableRow
                                  key={row.name}
                                  sx={{
                                    "&:last-child td, &:last-child th": {
                                      border: 0,
                                    },
                                  }}
                                >
                                  <TableCell
                                    component="th"
                                    scope="row"
                                    align="center"
                                  >
                                    {row.category}
                                  </TableCell>
                                  <TableCell align="center">
                                    {row.name}
                                  </TableCell>
                                  <TableCell align="center">
                                    {row.quantity}
                                  </TableCell>
                                  <TableCell align="center">
                                    <IconButton
                                      onClick={() =>
                                        handleDeleteRow(row, index)
                                      }
                                      aria-label="delete"
                                      size="small"
                                      color="secondary"
                                    >
                                      <DeleteIcon style={{ fill: "#dc2c38" }} />
                                    </IconButton>
                                  </TableCell>
                                </TableRow>
                              )
                            )}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Grid>
                  )}
                </Grid>

                <Grid
                  container
                  spacing={2}
                  alignItems="flex-end"
                  style={{
                    backgroundColor: "white",
                    marginTop: "4px",
                    borderRadius: "8px",
                    padding: "8px 4px",
                    border: "2px solid #0d0c22",
                    // boxShadow: "0px 0px 2px #2a5fa5",
                    marginBottom: "4px",
                  }}
                >
                  <Grid item sm={3}>
                    <Typography
                      variant="subtitle2"
                      className={classes.headingColor}
                    >
                      Category
                    </Typography>
                    <Select
                      fullWidth
                      variant="outlined"
                      value={selectedRequest.category}
                      name="category"
                      className={classes.selectText}
                      onChange={handleRequestFormChangeTool}
                    >
                      {Procurement?.getAllToolsCategory?.category_list?.map(
                        (val) => (
                          <MenuItem key={val} value={val}>
                            {val}
                          </MenuItem>
                        )
                      )}
                    </Select>
                  </Grid>
                  <Grid item sm={3}>
                    <Typography
                      variant="subtitle2"
                      className={classes.headingColor}
                    >
                      Item name
                    </Typography>
                    <Select
                      fullWidth
                      variant="outlined"
                      value={selectedRequest.name}
                      name="name"
                      className={classes.selectText}
                      onChange={handleRequestFormChangeTool}
                    >
                      {ProcurementRequest?.toolByCategory?.map((val) => (
                        <MenuItem key={val} value={val}>
                          {val}
                        </MenuItem>
                      ))}
                    </Select>
                  </Grid>
                  <Grid item sm={3}>
                    <Typography
                      variant="subtitle2"
                      className={classes.headingColor}
                    >
                      Quantity
                    </Typography>
                    <TextField
                      fullWidth
                      variant="outlined"
                      value={selectedRequest.quantity}
                      name="quantity"
                      type="number"
                      className={classes.selectText}
                      inputProps={{
                        style: { height: "32px", padding: "0 4px" },
                      }}
                      onChange={handleRequestFormChangeTool}
                    />
                  </Grid>
                  <Grid item sm={3}>
                    <Button
                      variant="contained"
                      color="primary"
                      endIcon={<AddIcon />}
                      onClick={handleToolAdd}
                      style={{
                        height: "32px",
                        width: "100px",
                        backgroundColor: "#0d0c22",
                      }}
                    >
                      Add
                    </Button>
                  </Grid>
                </Grid>
              </DialogContent>
              <DialogActions
                style={{
                  marginTop: "16px",
                  marginBottom: "12px",
                  marginRight: "12px",
                }}
              >
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleClickRequest}
                >
                  Request Tool
                </Button>
              </DialogActions>
            </Dialog>
          </Grid>
        )}
        <Grid
          item
          sm={6}
          style={{ padding: matchesIphone ? "0 32px" : "0 24px" }}
        >
          <AutomationSearch
            searchText={searchText}
            process={process}
            handleSearchChange={handleSearchChange}
            handleSearchButton={handleSearchButton}
            handleCloseClick={handleCloseClick}
            loading={loading}
            setLoading={setLoading}
            procurement
          >
            <FormControl
              variant="standard"
              style={{ marginTop: "-15px", marginLeft: "10px" }}
            >
              <InputLabel
                id="container_list_select_label"
                style={{
                  color: "grey",
                  zIndex: 10,
                  fontSize: "15px",
                  textAlign: "center",
                  padding: "0 10px",
                  marginTop: "-10px",
                  display: "none",
                }}
              >
                Process
              </InputLabel>
              <Select
                id="=container_list_select"
                value={process}
                labelId="container_list_select_label"
                name="client"
                defaultValue={process}
                label="Process"
                variant="standard"
                onChange={handleSetProcess}
                className={classes.inputProcess}
                inputProps={{
                  style: {
                    padding: "0px 10px",
                    marginTop: "-10px",
                    outline: "none",
                    fontSize: "12px",
                  },
                }}
                style={{
                  width: "100px",
                  backgroundColor: "transparent",
                  border: "0.5px solid rgba(0,0,0,0.2)",
                  borderRadius: "32px",
                  outline: "none",
                }}
              >
                <MenuItem key={"item"} value="item">
                  Item
                </MenuItem>
                <MenuItem key={"category"} value="category">
                  Category
                </MenuItem>
                <MenuItem key={"tool_transfer_no"} value="tool_transfer_no">
                  Tool Transfer No
                </MenuItem>
              </Select>
            </FormControl>
          </AutomationSearch>
        </Grid>
        <Grid
          item
          sm={5}
          style={{
            padding: matchesIphone ? "0 32px" : "0 4px",
            marginTop: matchesIphone ? 24 : 0,
          }}
        >
          <FormControlLabel
            value="yes"
            className={classes.radioLabel}
            control={
              <Radio
                style={{ color: "#10b981" }}
                size="small"
                checked={toolTable.status === "Approved"}
                onClick={() => {
                  dispatch({
                    type: TOOL_TRANSFER_CONSTANT.TOOL_TRANSFER_TABLE,
                    payload: {
                      status: "Approved",
                    },
                  });
                  dispatch(getToolTransferTableAction(notify));
                }}
              />
            }
            label={
              user.procurement_admin === true ||
              user.procurement_admin === "True"
                ? "Transferred"
                : "Received"
            }
          />
          <FormControlLabel
            value="no"
            className={classes.radioLabel}
            control={
              <Radio
                size="small"
                style={{ color: "#505050" }}
                checked={toolTable.status === "Partial Approved"}
                onClick={() => {
                  dispatch({
                    type: TOOL_TRANSFER_CONSTANT.TOOL_TRANSFER_TABLE,
                    payload: {
                      status: "Partial Approved",
                    },
                  });
                  dispatch(getToolTransferTableAction(notify));
                }}
              />
            }
            label={
              user.procurement_admin === true ||
              user.procurement_admin === "True"
                ? " Partially Transferred"
                : "Partially Received"
            }
          />
          <FormControlLabel
            value="no"
            className={classes.radioLabel}
            control={
              <Radio
                size="small"
                style={{ color: "#f97215" }}
                checked={toolTable.status === "Pending"}
                onClick={() => {
                  dispatch({
                    type: TOOL_TRANSFER_CONSTANT.TOOL_TRANSFER_TABLE,
                    payload: {
                      status: "Pending",
                    },
                  });
                  dispatch(getToolTransferTableAction(notify));
                }}
              />
            }
            label={
              user.procurement_admin === true ||
              user.procurement_admin === "True"
                ? " Pending"
                : "No Action"
            }
          />
        </Grid>
        {!matchesIphone && (
          <Grid
            item
            sm={1}
            style={{ display: "flex", justifyContent: "flex-end" }}
          >
            <IconButton onClick={handleRefreshTable}>
              <ReplayIcon style={{ fill: "black" }} />
            </IconButton>
          </Grid>
        )}

      { matchesIphone && <Grid item sm={12} style={{width:"95%",display:"flex" ,alignItems:"center",justifyContent:"flex-end"}}>
          <IconButton onClick={handleRefreshTable}>
            <ReplayIcon style={{ fill: "black" }} />
          </IconButton>
        </Grid>}
        <Grid
          item
          sm={12}
          style={{
            width:"97%",
            marginTop:matchesIphone?0: "12px",
            overflowX: "scroll",
            padding: matchesIphone ? "0 32px" : "0 24px",
          }}
          className={classes.procurementTable}
        >
          <TableContainer
            component={Paper}
            style={{
              marginTop: "12px",
              overflowX: "scroll",
            
            }}
            className={classes.procurementTable}
          >
            <Table
              stickyHeader
              sx={{ maxWidth: 230 }}
              aria-label="simple table"
              className={classes.procurementTable}
            >
              <TableHead>
                <TableRow>
                  {TABLE_CONST.map((val) => (
                    <TableCell>
                      <Typography
                        variant="subtitle2"
                        style={{
                          fontWeight: "700",
                          fontSize: "10px",
                          color: "gray",
                          textAlign: "center",
                        }}
                      >
                        {val.split("_").join(" ").toUpperCase()}
                      </Typography>
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody style={{ maxHeight: "100px" }}>
                {toolTable.data?.map((row) => (
                  <TableRow
                    key={row.name}
                    sx={{
                      "&:last-child td, &:last-child th": {
                        border: 0,
                      },
                    }}
                  >
                    {TABLE_CONST?.map((val) =>
                      val === "status" ? (
                        <TableCell
                          component="th"
                          scope="row"
                          style={{ fontWeight: "bold", textAlign: "center" }}
                        >
                          {row["status"] === "Approved" ? (
                            <Stack
                              direction={"row"}
                              alignItems={"center"}
                              spacing={1}
                              justifyContent={"center"}
                            >
                              {" "}
                              <Box
                                style={{
                                  width: "8px",
                                  height: "8px",
                                  borderRadius: "100%",
                                  backgroundColor: "#10b981",
                                  border: "2px solid rgba(16,185,129,0.5)",
                                }}
                              ></Box>{" "}
                              <Typography
                                variant="subtitle2"
                                style={{ fontWeight: "600", color: "#10b981" }}
                              >
                                {user.procurement_admin === true ||
                                user.procurement_admin === "True"
                                  ? "Transferred"
                                  : "Received"}
                              </Typography>
                            </Stack>
                          ) : row["status"] === "Partial Approved" ? (
                            <Stack
                              direction={"row"}
                              alignItems={"center"}
                              spacing={1}
                              justifyContent={"center"}
                            >
                              {" "}
                              <Box
                                style={{
                                  width: "8px",
                                  height: "8px",
                                  borderRadius: "100%",
                                  backgroundColor: "rgb(80,80,80)",
                                  border: "2px solid rgba(80,80,80,0.5)",
                                }}
                              ></Box>{" "}
                              <Typography
                                variant="subtitle2"
                                style={{
                                  fontWeight: "600",
                                  color: "rgb(80,80,80)",
                                }}
                              >
                                {user.procurement_admin === true ||
                                user.procurement_admin === "True"
                                  ? "Partially Transferred"
                                  : "Partially Received"}
                              </Typography>
                            </Stack>
                          ) : (
                            <Stack
                              direction={"row"}
                              alignItems={"center"}
                              spacing={1}
                              justifyContent={"center"}
                            >
                              {" "}
                              <Box
                                style={{
                                  width: "8px",
                                  height: "8px",
                                  borderRadius: "100%",
                                  backgroundColor: "#f97215",
                                  border: "2px solid rgba(249, 114, 21, 0.5)",
                                }}
                              ></Box>{" "}
                              <Typography
                                variant="subtitle2"
                                style={{ fontWeight: "600", color: "#f97215" }}
                              >
                                {user.procurement_admin === true ||
                                user.procurement_admin === "True"
                                  ? "Pending"
                                  : "No Action"}
                              </Typography>
                            </Stack>
                          )}
                        </TableCell>
                      ) : val === "approve" && !toolTable.approved ? (
                        <TableCell component="th" scope="row" align="center">
                          <Button
                            variant="contained"
                            onClick={(e) => {
                              e.stopPropagation();

                              history.push({
                                pathname: "/procurement/tool-transfer-request",
                                state: {
                                  mode: "update",
                                  data: row,
                                },
                              });
                            }}
                            className={classes.approveButton}
                          >
                            {(user.procurement_admin === "False"||user.procurement_admin ===false)
                              ? "View"
                              : row.status === "Approved"
                              ? "View"
                              : "Approve"}
                          </Button>
                        </TableCell>
                      ) : (
                        <TableCell
                          component="th"
                          scope="row"
                          style={{
                            fontWeight: "bold",
                            textAlign: "center",
                            fontSize: "12px",
                            color:
                              val === "amount"
                                ? "#24b983"
                                : val === "quantity"
                                ? "#00a1e5"
                                : "black",
                          }}
                        >
                          {row[val]}
                        </TableCell>
                      )
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>
        <Grid
          item
          sm={12}
          style={{
            display: "flex",
            flexDirection: "row",
            width:"85%",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "8px 16px",
            margin:matchesIphone?"0px 32px": "0px 24px",
            marginTop: "-4px",
            marginBottom: "40px",
            backgroundColor: "#fafafa",
          }}
        >
          <Button
            variant="contained"
            startIcon={<PreviousIcon />}
            color="secondary"
            onClick={prevStockPage}
            disabled={
              toolTable.pg_no === 1 || toolTable.pg_no === "1" ? true : false
            }
          >
         {!matchesIphone &&   "Previous"}
          </Button>

          <Grid style={{ display: "flex", alignItems: "flex-end" }}>
            <Typography variant="subtitle2" style={{ padding: "3px" }}>
              Page
            </Typography>

            <TextField
              id="basic"
              variant="outlined"
              size="small"
              inputProps={{
                className: classes.input,
                style: { width: "32px" },
              }}
              value={toolTable.pg_no}
              onChange={(e) => {
                if (e.target.value > toolTable.total_pages) {
                  notify("Invalid value entered", {
                    variant: "warning",
                  });
                } else {
                  dispatch({
                    type: TOOL_TRANSFER_CONSTANT.TOOL_TRANSFER_TABLE,
                    payload: {
                      pg_no: e.target.value,
                    },
                  });
                }
              }}
              onBlur={(e) => {
                if (
                  e.target.value === "" ||
                  e.target.value === "0" ||
                  e.target.value > toolTable.total_pages
                ) {
                  notify("Invalid value entered", {
                    variant: "warning",
                  });

                  dispatch({
                    type: TOOL_TRANSFER_CONSTANT.TOOL_TRANSFER_TABLE,
                    payload: {
                      pg_no: 1,
                    },
                  });
                  dispatch(getToolTransferTableAction(notify));
                } else {
                  setCurrentPage(e.target.value);
                  dispatch({
                    type: TOOL_TRANSFER_CONSTANT.TOOL_TRANSFER_TABLE,
                    payload: {
                      pg_no: e.target.value,
                    },
                  });
                  dispatch(getToolTransferTableAction(notify));
                }
              }}
            />

            <Typography variant="subtitle2" style={{ padding: "3px" }}>
              of
            </Typography>

            <Typography
              variant="subtitle2"
              style={{
                padding: "3px",
                fontSize: "14px",
              }}
            >
              {toolTable.total_pages}
            </Typography>
          </Grid>
       { !matchesIphone &&  <TextField
            id="client-master-code"
            select
            value={toolTable.on_page_data_client}
            variant="outlined"
            inputProps={{ className: classes.input }}
            onChange={(e) => {
              setCurrentPage(1);
              dispatch({
                type: TOOL_TRANSFER_CONSTANT.TOOL_TRANSFER_TABLE,
                payload: {
                  pg_no: 1,
                  on_page_data_client: e.target.value,
                },
              });
              dispatch(getToolTransferTableAction(notify));
            }}
          >
            <MenuItem key={"5 rows"} value={"5"}>
              {"5 rows"}
            </MenuItem>
            <MenuItem key={"10 rows"} value={"10"}>
              {"10 rows"}
            </MenuItem>
            <MenuItem key={"20 rows"} value={"20"}>
              {"20 rows"}
            </MenuItem>
            <MenuItem key={"25 rows"} value={"25"}>
              {"25 rows"}
            </MenuItem>
            <MenuItem key={"50 rows"} value={"50"}>
              {"50 rows"}
            </MenuItem>
            <MenuItem key={"100 rows"} value={"100"}>
              {"100 rows"}
            </MenuItem>
          </TextField>}
          <Button
            variant="contained"
            endIcon={<NextIcon />}
            color="secondary"
            onClick={nextStockPage}
            disabled={toolTable.next_page === "" ? true : false}
          >
        {!matchesIphone &&    "Next"}
          </Button>
        </Grid>
      </Grid>
      <ToolTransferModel open={openModel} handleClose={handleCloseModel} />
      {/* Add your component here */}
    </LayoutContainer>
  );
};

export default ProcurementToolTransfer;
