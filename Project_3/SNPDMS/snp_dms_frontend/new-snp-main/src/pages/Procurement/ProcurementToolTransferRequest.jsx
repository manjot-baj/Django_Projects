import React, { useEffect, useState } from "react";
import LayoutContainer from "@components/reusablecomponents/LayoutContainer";
import {
  Backdrop,
  Box,
  Button,
  CircularProgress,
  Divider,
  Grid,
  IconButton,
  MenuItem,
  Paper,
  Select,
  TextField,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { useSnackbar } from "notistack";
import { useHistory, useLocation } from "react-router-dom";
import GateInTextField from "@components/reusablecomponents/GateInTextField";
import { useDispatch, useSelector } from "react-redux";
import { TOOL_TRANSFER_CONSTANT } from "../../reducers/procurement/toolTransferReducer";
import { handleDateChangeUTILSDispatch } from "../../utils/WeekNumbre";
import DatePickerField from "@components/reusablecomponents/DatePickerField";
import { Alert, Stack } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddBoxIcon from "@mui/icons-material/AddBox";
import { toolGetNameByCategoryAdminAction } from "../../actions/Procurement/requestAction";
import { toolGetAllCategoryByAdminAction } from "../../actions/Procurement/procurementAction";
import {
  getToolTransferNoAction,
  getToolTransferPerIDAction,
  handleToolStatusApproveAction,
  handleToolStatusPartiallAction,
  requestToolTransferAction,
} from "../../actions/Procurement/toolTransferAction";
import CustomBackButton from "@components/reusablecomponents/CustomBackButton";
import {
  TableCustomAdvanceReactTable,
  TableFootercontainer,
  TableHeading,
} from "@/components/TableComponent/TableComponent";
import { custombackDropStyle } from "@/utils/CustomClasses";

const ProcurementToolTransferRequest = () => {
  const notify = useSnackbar().enqueueSnackbar;
  const history = useHistory();
  const dispatch = useDispatch();
  const { state } = useLocation();
  const { mode, data: toolRequestData } = state || { mode: "create", data: {} };
  const { toolTransferReducer, Procurement, ProcurementRequest, user } =
    useSelector((state) => state);
  const { isloading } = useSelector((state) => state.ui);
  const { toolRequest } = toolTransferReducer;
  const [toolLine, setToolLine] = useState(null);
  const matchesIphone = useMediaQuery("(max-width:500px)");
  const [tool, setTool] = useState({
    admin: "",
    admin_pk: "",
    category: "",
    name: "",
    quantity: "",
    category_id: "",
    tool_id: "",
  });

  useEffect(() => {
    if (mode === "update" && toolRequestData.pk) {
      dispatch(
        getToolTransferPerIDAction(toolRequestData.pk, notify, setToolLine),
      );
    } else {
      dispatch(getToolTransferNoAction(notify));
    }
  }, []);

  useEffect(() => {
    dispatch(toolGetAllCategoryByAdminAction(tool.admin_pk));
  }, [tool.admin_pk]);

  useEffect(() => {
    dispatch(toolGetNameByCategoryAdminAction(tool.category_id, tool.admin_pk));

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tool.category, tool.name, tool.admin]);

  useEffect(() => {
    return () =>
      dispatch({
        type: TOOL_TRANSFER_CONSTANT.TOOL_TRANSFER_REQUEST_FORM_INIT,
      });
  }, []);

  const handleGoBack = () => {
    window.history.back();
  };

  const handlePartiallyPending = () => {
    if (
      toolRequest?.tool_request_line?.every(
        (val, index) => val?.received_quantity === 0,
      )
    ) {
      notify(
        "Please update tool Transffered Quantity to move to Partial Pending ",
        { variant: "info" },
      );
      return;
    } else if (
      toolLine &&
      toolLine.every(
        (val, toolIndex) =>
          val.received_quantity ===
          toolRequest?.tool_request_line[toolIndex].received_quantity,
      )
    ) {
      notify(
        "Please update tool Transffered Quantity to move to Partiall Pending ",
        { variant: "info" },
      );
      return;
    } else {
      dispatch(
        handleToolStatusPartiallAction(
          toolRequest.pk,
          notify,
          history,
          setToolLine,
        ),
      );
    }
  };

  const handleApprove = () => {
    dispatch(handleToolStatusApproveAction(toolRequest.pk, notify, history));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    dispatch({
      type: TOOL_TRANSFER_CONSTANT.TOOL_TRANSFER_REQUEST_FORM,
      payload: { [name]: value },
    });
  };

  const handleChangeEdit = (e) => {
    const { name, value } = e.target;
    if (name === "admin") {
      if (toolRequest.tool_request_line.length > 0) {
        notify("Only One Admin can be Selected ", { variant: "info" });
        return;
      }
    }
    setTool((prev) => ({
      ...prev,
      [name]: name === "quantity" ? Number(value) : value,
    }));
  };

  const handleRecievedChange = (e, index) => {
    const { name, value } = e.target;

    dispatch({
      type: TOOL_TRANSFER_CONSTANT.TOOL_TRANSFER_REQUEST_LINE,
      payload: { received_quantity: value, index: index },
    });
  };

  const handleToolAdd = () => {
    if (tool.category !== "" && tool.name !== "" && tool.quantity !== "") {
      dispatch({
        type: TOOL_TRANSFER_CONSTANT.TOOL_TRANSFER_REQUEST_FORM_LINE_ADD,
        payload: {
          category: tool.category,
          name: tool.name,
          quantity: tool.quantity,
          category_id: tool.category_id,
          tool_id: tool.tool_id,
        },
      });
      setTool({
        admin: tool.admin,
        admin_pk: tool.admin_pk,
        category: "",
        name: "",
        quantity: 0,
      });
    } else {
      notify("Please fill all fields", { variant: "warning" });
    }
  };

  const handleDeleteRow = (row, index) => {
    dispatch({
      type: TOOL_TRANSFER_CONSTANT.TOOL_TRANSFER_REQUEST_FORM_LINE_REMOVE,
      payload: index,
    });
  };

  const handleCreateToolRequest = () => {
    if (toolRequest.date === "") {
      notify("Please select a date", { variant: "warning" });
    } else if (toolRequest.tool_transfer_no === "") {
      notify("Please enter Tool Transfer No ", { variant: "warning" });
    } else if (toolRequest.tool_request_line.length === 0) {
      notify("Please add tool to request ", { variant: "warning" });
    } else {
      dispatch(requestToolTransferAction(tool.admin_pk, notify, history));
    }
  };

  const Columns = [
    {
      Header: <TableHeading>Category</TableHeading>,
      accessor: "category",
      style: {
        textAlign: "center",
      },
    },
    {
      Header: <TableHeading>Name</TableHeading>,
      sortable: false,

      accessor: "name",
      style: {
        textAlign: "center",
      },
    },

    {
      Header: <TableHeading> Quantity</TableHeading>,
      sortable: false,
      show: mode !== "update",
      accessor: "quantity",
      style: {
        textAlign: "center",
      },
    },
    {
      Header: (
        <TableHeading>
          {user.procurement_admin === true || user.procurement_admin === "True"
            ? "Transferred Quantity"
            : "Received Quantity"}
        </TableHeading>
      ),
      sortable: false,
      show: mode === "update",
      style: {
        textAlign: "center",
      },
      Cell: ({ original, index }) => {
        return toolRequest.status === "Approved" ? (
          <Typography variant="subtitle2">
            {original.received_quantity}
          </Typography>
        ) : (
          <TextField
            name={"received_quantity"}
            variant="outlined"
            type="number"
            onChange={(e) => handleRecievedChange(e, index)}
            value={original.received_quantity}
            sx={{
              "& .MuiOutlinedInput-root": {
                "& fieldset": {
                  borderColor: "#243545",
                },
              },
            }}
            disabled={!user.procurement_admin}
            size="small"
          />
        );
      },
    },
    {
      Header: <TableHeading>Required Quantity</TableHeading>,
      sortable: false,
      show: mode === "update",
      accessor: "required_quantity",
      style: {
        textAlign: "center",
      },
    },
    {
      Header: <TableHeading>Action</TableHeading>,
      show: mode === "update" ? false : true,
      sortable: false,
      Cell: ({ original, index }) => {
        return (
          <IconButton onClick={() => handleDeleteRow(original, index)}>
            <DeleteIcon fontSize="small" style={{ fill: "red" }} />
          </IconButton>
        );
      },
      style: {
        textAlign: "center",
      },
    },
  ];

  return (
    <LayoutContainer>
      <CustomBackButton handleGoBack={handleGoBack} />
      <Typography
        variant="subtitle2"
        sx={(theme) => ({
          paddingTop: 2,
          paddingBottom: 2,
          backgroundColor: theme.palette.secondary.main,
          color: "#FFF",
          marginTop: 2,
          borderTopLeftRadius: 5,
          borderTopRightRadius: 5,
        })}
      >
        <Box fontWeight="fontWeightBold" m={1}>
          Tool Transfer Request
        </Box>
      </Typography>
      <Paper
        sx={(theme) => ({
          padding: theme.spacing(4, 3),
          [theme.breakpoints.down("sm")]: {
            padding: theme.spacing(4, 1),
          },
        })}
        elevation={0}
      >
        <Grid container spacing={matchesIphone ? 2 : 4}>
          <Grid item size={{ sm: 6, md: 3 }}>
            <Typography
              variant="caption"
              sx={{
                fontWeight: "600",
                color: "#172b4d",
              }}
            >
              Tool Transfer No
            </Typography>
          </Grid>
          <Grid item size={{ sm: 6, md: 3 }}>
            <GateInTextField
              name="tool_transfer_no"
              readOnlyP={toolRequest.pk && mode === "update"}
              value={toolRequest.tool_transfer_no}
              handleChange={handleChange}
            />
          </Grid>

          <Grid item size={{ sm: 6, md: 3 }}>
            <Typography
              variant="caption"
              sx={{
                fontWeight: "600",
                color: "#172b4d",
              }}
            >
              Tool Transfer Date
            </Typography>
          </Grid>

          <Grid item size={{ sm: 6, md: 3 }}>
            <DatePickerField
              dateId="date"
              name="date"
              dateValue={toolRequest.date}
              dateChange={(date) =>
                handleDateChangeUTILSDispatch(
                  date,
                  dispatch,
                  TOOL_TRANSFER_CONSTANT.TOOL_TRANSFER_REQUEST_FORM,
                  "date",
                )
              }
            />
          </Grid>
          <Grid item size={{ sm: 6, md: 3 }}>
            <Typography
              variant="caption"
              sx={{
                fontWeight: "600",
                color: "#172b4d",
              }}
            >
              {toolRequest.pk && mode === "update"
                ? "Requested From"
                : "Select Admin"}
            </Typography>
          </Grid>
          <Grid item size={{ sm: 6, md: 3 }}>
            {mode === "update" && toolRequest.pk ? (
              <GateInTextField
                name="requested_from"
                readOnlyP={toolRequest.pk && mode === "update"}
                value={toolRequest.requested_from}
              />
            ) : (
              <Select
                fullWidth
                variant="outlined"
                value={tool.admin}
                name="admin"
                sx={{
                  height: "32px",
                  backgroundColor: "#f8fafb",
                }}
                onChange={handleChangeEdit}
              >
                {toolRequest?.admin_sites?.map((val) => (
                  <MenuItem
                    key={val.name}
                    value={val.name}
                    onClick={(e) =>
                      setTool((prev) => ({
                        ...prev,
                        admin_pk: val.pk,
                      }))
                    }
                  >
                    {val.name}
                  </MenuItem>
                ))}
              </Select>
            )}
          </Grid>
          <Grid item size={{ sm: 6, md: 3 }}>
            <Typography
              variant="caption"
              sx={{
                fontWeight: "600",
                color: "#172b4d",
              }}
            >
              Status
            </Typography>
          </Grid>
          <Grid item size={{ sm: 6, md: 3 }}>
            {" "}
            {mode === "update" && toolRequest.pk && (
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
                    backgroundColor:
                      toolRequest.status === "Partial Approved"
                        ? "#505050"
                        : toolRequest.status === "Approved"
                          ? "#10b981"
                          : "#f97215",
                    border:
                      toolRequest.status === "Partial Approved"
                        ? "2px solid rgba(80,80,80,0.5)"
                        : toolRequest.status === "Approved"
                          ? "2px solid rgba(16,185,129,0.5)"
                          : "2px solid rgba(249, 114, 21, 0.5)",
                  }}
                ></Box>{" "}
                <Typography
                  variant="subtitle2"
                  style={{
                    fontWeight: "600",
                    color:
                      toolRequest.status === "Partial Approved"
                        ? "#505050"
                        : toolRequest.status === "Approved"
                          ? "#10b981"
                          : "#f97215",
                  }}
                >
                  {" "}
                  {user.procurement_admin === true ||
                  user.procurement_admin === "True"
                    ? toolRequest.status === "Partial Approved"
                      ? "Partially Transferred"
                      : toolRequest.status === "Approved"
                        ? "Transferred"
                        : "Pending "
                    : toolRequest.status === "Partial Approved"
                      ? "Partially Received"
                      : toolRequest.status === "Approved"
                        ? "Received"
                        : "No Action "}
                </Typography>
              </Stack>
            )}{" "}
          </Grid>
          <Grid item size={{ sm: 12, md: 12 }} style={{ marginTop: "16px" }}>
            <Divider />
          </Grid>
          {toolRequest.tool_request_line.length > 0 && (
            <Grid item size={{ sm: 12, md: 12 }}>
              <Typography variant="caption">Tool Details</Typography>
            </Grid>
          )}
          {toolRequest.tool_request_line.length > 0 && (
            <Grid item size={{ sm: 12, md: 12 }}>
              <TableCustomAdvanceReactTable
                data={
                  (toolRequest.tool_request_line &&
                    toolRequest.tool_request_line) ||
                  []
                }
                defaultPageSize={5}
                columns={[...Columns]}
                NoDataComponent={() => (
                  <Stack direction={"row"} justifyContent={"center"}>
                    <Typography>No Data Found</Typography>
                  </Stack>
                )}
                pageSize={toolRequest.tool_request_line.length + 1}
                style={{
                  marginBottom: 20,
                }}
              />
            </Grid>
          )}
          {mode !== "update" && (
            <Grid item size={{ sm: 12, md: 12 }}>
              <Typography variant="caption">Add Tool</Typography>
            </Grid>
          )}
          {mode !== "update" && (
            <Grid item size={{ sm: 12, md: 12 }}>
              <Grid
                container
                spacing={2}
                sx={{
                  boxShadow: "0px 0px 2px #243545",
                  margin: "0 2px",
                  padding: 2,
                  borderRadius: "4px",
                }}
              >
                <Grid item size={{ sm: 4 }}>
                  <Typography
                    variant="caption"
                    sx={{
                      fontWeight: "600",
                      color: "#172b4d",
                    }}
                  >
                    Category
                  </Typography>
                  <Select
                    fullWidth
                    variant="outlined"
                    value={tool.category}
                    name="category"
                    size="small"
                    onChange={handleChangeEdit}
                  >
                    {Procurement?.getAllToolsCategory?.category_list?.map(
                      (val) => (
                        <MenuItem
                          key={val.name}
                          value={val.name}
                          onClick={() =>
                            setTool((prev) => ({
                              ...prev,
                              category_id: val.pk,
                            }))
                          }
                        >
                          {val.name}
                        </MenuItem>
                      ),
                    )}
                  </Select>
                </Grid>
                <Grid item size={{ sm: 4 }}>
                  <Typography
                    variant="caption"
                    sx={{
                      fontWeight: "600",
                      color: "#172b4d",
                    }}
                  >
                    Item name
                  </Typography>
                  <Select
                    fullWidth
                    variant="outlined"
                    value={tool.name}
                    name="name"
                    size="small"
                    onChange={handleChangeEdit}
                  >
                    {ProcurementRequest?.toolByCategory?.map((val) => (
                      <MenuItem
                        key={val.name}
                        value={val.name}
                        onClick={() =>
                          setTool((prev) => ({
                            ...prev,
                            tool_id: val.pk,
                          }))
                        }
                      >
                        {val.name}
                      </MenuItem>
                    ))}
                  </Select>
                </Grid>
                <Grid item size={{ sm: 3 }}>
                  <Typography
                    variant="caption"
                    sx={{
                      fontWeight: "600",
                      color: "#172b4d",
                    }}
                  >
                    Quantity
                  </Typography>
                  <TextField
                    fullWidth
                    variant="outlined"
                    value={tool.quantity}
                    name="quantity"
                    type="number"
                    slotProps={{
                      htmlInput: {
                        min: 1,
                        onKeyDown: (e) => {
                          if (["-", "+", "e", "E"].includes(e.key)) {
                            e.preventDefault();
                          }
                        },
                        // Disable copy
                        onCopy: (e) => e.preventDefault(),

                        // Disable paste
                        onPaste: (e) => e.preventDefault(),

                        // Disable cut
                        onCut: (e) => e.preventDefault(),

                        // Optional: disable drag/drop text
                        onDrop: (e) => e.preventDefault(),
                      },
                    }}
                    size="small"
                    onChange={(e) => {
                      let value = e.target.value;

                      // If empty after backspace, restore to 1
                      if (value === "") {
                        value = 1;
                      }
                      value = Math.max(1, Number(e.target.value));
                      handleChangeEdit({
                        target: {
                          name: e.target.name,
                          value,
                        },
                      });
                    }}
                  />
                </Grid>
                <Grid item size={{ sm: 1 }} style={{ alignSelf: "flex-end" }}>
                  <IconButton
                    type="submit"
                    onClick={handleToolAdd}
                    //   disabled={editFieldConsume.in_stock === 0}
                  >
                    <AddBoxIcon
                      style={{ fill: "#08ff08", marginBottom: "-10px" }}
                    />
                  </IconButton>
                </Grid>
              </Grid>
            </Grid>
          )}
        </Grid>
      </Paper>
      {(user.procurement_admin === false ||
        user.procurement_admin === "False") && (
        <Alert style={{ marginTop: "24px" }} severity="info">
          Only Amin Site can Approve the Tool Request .
        </Alert>
      )}
      <Box mt={24}></Box>
      <TableFootercontainer>
        {mode !== "update" && (
          <Button
            variant="contained"
            color="primary"
            onClick={handleCreateToolRequest}
          >
            Create Tool Request
          </Button>
        )}
        {mode === "update" &&
          toolRequest.tool_request_line?.some(
            (val) => val?.required_quantity !== val?.received_quantity,
          ) && (
            <Button
              variant="contained"
              color="primary"
              disabled={
                user.procurement_admin === false ||
                user.procurement_admin === "False"
              }
              sx={{
                backgroundColor: "#505050",
                color: "white",
                width: "200px",
                "&:hover": {
                  backgroundColor: "#505050",
                },
              }}
              onClick={handlePartiallyPending}
            >
              Transfer Partially
            </Button>
          )}
        {mode === "update" &&
          toolRequest.tool_request_line?.every(
            (val) => val?.required_quantity === val?.received_quantity,
          ) &&
          toolRequest.status !== "Approved" && (
            <Button
              disabled={
                user.procurement_admin === false ||
                user.procurement_admin === "False"
              }
              variant="contained"
              color="primary"
              sx={{
                backgroundColor: "#10b981",
                color: "white",
                width: "200px",
                "&:hover": {
                  backgroundColor: "#10b981",
                },
              }}
              onClick={handleApprove}
            >
              Transfer All
            </Button>
          )}
      </TableFootercontainer>
      <Backdrop sx={custombackDropStyle} open={isloading}>
        <CircularProgress color="inherit" />
      </Backdrop>
    </LayoutContainer>
  );
};

export default ProcurementToolTransferRequest;
