import {
  getToolTransferPerIDAction,
  handleToolStatusApproveAction,
  handleToolStatusPartiallAction,
} from "@/actions/Procurement/toolTransferAction";
import {
  Alert,
  Box,
  Button,
  Divider,
  Grid,
  InputAdornment,
  List,
  ListItem,
  Paper,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  useHistory,
  useParams,
} from "react-router-dom/cjs/react-router-dom.min";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import { useSnackbar } from "notistack";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import GateInTextField from "@/components/reusablecomponents/GateInTextField";
import { customLabelTypography } from "@/utils/CustomClasses";
import AccessTimeRoundedIcon from "@mui/icons-material/AccessTimeRounded";
import AddCircleOutlineRoundedIcon from "@mui/icons-material/AddCircleOutlineRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import RuleRoundedIcon from "@mui/icons-material/RuleRounded";

const filterStatus = {
  Pending: "No Action",
  Approved: "Received",
  "Partial Approved": "Partial Received",
};

const fliterStatusLocation = {
  Pending: "Pending",
  Approved: "Transferred",
  "Partial Approved": "Partial Transferred",
};

const ToolTransferSingleTransferComp = () => {
  const { pk } = useParams();
  const dispatch = useDispatch();
  const history = useHistory();
  const notify = useSnackbar().enqueueSnackbar;
  const { toolTransferReducer, user } = useSelector((state) => state);
  const { toolRequest } = toolTransferReducer;
  const [toolRequestForm, setToolRequestForm] = useState(null);
  const site_Transfer_Non_Admin =
    toolRequestForm?.transfer_type === "Site Transfer" &&
    (user.procurement_admin === false || user.procurement_admin === "False");
  const site_Transfer_Admin =
    toolRequestForm?.transfer_type === "Site Transfer" &&
    ((user.procurement_admin === true && user.procurement_admin !== "False") ||
      user.procurement_admin === "True");

  const location_Transfer_Requesting_Site =
    toolRequestForm?.site === user.site &&
    toolRequestForm?.transfer_type === "Location Transfer";
  const location_Transfer_Request_From_Admin_Site =
    toolRequestForm?.site !== user.site &&
    toolRequestForm?.transfer_type === "Location Transfer";

  useEffect(() => {
    dispatch(getToolTransferPerIDAction(pk, notify, setToolRequestForm));
  }, [pk]);

  const handleGoBack = () => {
    history.replace("/procurement/tool-transfer");
  };

  const handlePartialApprove = () => {
    if (
      toolRequestForm?.tool_request_line?.every(
        (val, index) => val?.received_quantity === 0,
      )
    ) {
      notify(
        "Please update tool Transffered Quantity to move to Partial Transferred ",
        { variant: "info" },
      );
    } else if (
      toolRequestForm?.tool_request_line?.every(
        (val, toolIndex) =>
          val.received_quantity ===
          toolRequest?.tool_request_line[toolIndex].received_quantity,
      )
    ) {
      notify(
        "Please update tool Transffered Quantity to move to Partiall Transferred ",
        { variant: "warning" },
      );
    } else {
      dispatch(
        handleToolStatusPartiallAction(
          toolRequestForm.pk,
          toolRequestForm,
          notify,
          history,
        ),
      );
    }
  };

  const handleApproveAll = () => {
    dispatch(
      handleToolStatusApproveAction(
        toolRequest.pk,
        toolRequestForm,
        notify,
        history,
      ),
    );
  };

  if (!toolRequest?.pk) {
    return (
      <Paper
        elevation={0}
        sx={{
          p: 5,
          borderRadius: 2.5,
          height: "100%",
        }}
      >
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          textAlign="center"
          minHeight="100%"
          px={3}
        >
          <SwapHorizIcon
            sx={{
              fontSize: 72,

              mb: 2,
            }}
          />

          <Typography variant="h6" fontWeight={600} gutterBottom>
            No Tool Transfer Request Found
          </Typography>

          <Typography
            variant="body2"
            color="textDisabled"
            sx={{ maxWidth: 400, mb: 3 }}
          >
            There is no tool transfer data available at the moment. Please try
            again or create a new transfer.
          </Typography>

          <Button
            variant="contained"
            size="large"
            onClick={handleGoBack}
            startIcon={<AddRoundedIcon />}
            sx={{
              px: 4,
              py: 1.2,
              borderRadius: 3,
              textTransform: "none",
              fontWeight: 600,
              fontSize: "0.95rem",
              background: "linear-gradient(135deg, #2563EB 0%, #7C3AED 100%)",
              boxShadow: "0 8px 20px rgba(124, 58, 237, 0.25)",
              transition: "all 0.3s ease",
              "&:hover": {
                background: "linear-gradient(135deg, #1D4ED8 0%, #6D28D9 100%)",
                boxShadow: "0 12px 28px rgba(124, 58, 237, 0.35)",
                transform: "translateY(-2px)",
              },
            }}
          >
            Create New Transfer
          </Button>
        </Box>
      </Paper>
    );
  }
  return (
    <Paper
      elevation={0}
      sx={(theme)=>({
        p: 3,
        borderRadius: 2.5,
       minHeight: "calc(100vh - 250px)",
        display: "flex",
        flexDirection: "column",
      })}
    >
      <Box display="flex" justifyContent="space-between" alignItems="center">
        {/* Left Section */}
        <Stack
          justifyContent="space-between"
          alignItems="flex-start"
          flexDirection={"column"}
          spacing={0}
        >
          <Typography variant="h6" fontWeight={500}>
            {toolRequestForm?.tool_transfer_no}
          </Typography>
        </Stack>

        {/* Right Section */}
        <Stack direction="row" spacing={2} alignItems="center">
          <Box
            sx={{
              display: "inline-flex",
              alignItems: "center",
              gap: 1,
              px: 2,
              py: 1,
              borderRadius: 2,
              bgcolor:
                toolRequestForm?.status === "Partial Approved"
                  ? "#83a5d44f"
                  : toolRequestForm?.status === "Approved"
                    ? "#52b99727"
                    : "#FFF7ED",
              border: `1px solid ${toolRequestForm?.status === "Partial Approved"
                  ? "#586d8b"
                  : toolRequestForm?.status === "Approved"
                    ? "#10B981"
                    : "#FDBA74"
                }`,
            }}
          >
            {toolRequestForm?.status === "Partial Approved" ? (
              <RuleRoundedIcon sx={{ fontSize: 18, color: "#4c617e" }} />
            ) : toolRequestForm?.status === "Approved" ? (
              <CheckCircleRoundedIcon sx={{ fontSize: 18, color: "#10B981" }} />
            ) : (
              <AccessTimeRoundedIcon sx={{ color: "#EA580C", fontSize: 18 }} />
            )}

            <Typography
              variant="body2"
              fontWeight={700}
              color={
                toolRequestForm?.status === "Partial Approved"
                  ? "#334155"
                  : toolRequestForm?.status === "Approved"
                    ? "#10B981"
                    : "#EA580C"
              }
            >
              {site_Transfer_Non_Admin
                ? filterStatus?.[toolRequestForm?.status]
                : site_Transfer_Admin
                  ? fliterStatusLocation?.[toolRequestForm?.status]
                  : location_Transfer_Requesting_Site
                    ? filterStatus?.[toolRequestForm?.status]
                    : location_Transfer_Request_From_Admin_Site ? fliterStatusLocation?.[toolRequestForm?.status] : toolRequestForm?.status}
            </Typography>
          </Box>
        </Stack>
      </Box>
      <Divider sx={{ mt: 2,mb:4 }} />
      <Grid container spacing={2}>
        <Grid item size={{ xs: 12, md: 3 }}>
          <Typography sx={customLabelTypography} style={{ marginBottom: 4 }}>
            Tool Transfer Date <span style={{ color: "red" }}>*</span>
          </Typography>
          <GateInTextField readOnlyP={true} value={toolRequestForm?.date} />
        </Grid>
        <Grid item size={{ xs: 12, md: 3 }}>
          <Typography sx={customLabelTypography} style={{ marginBottom: 4 }}>
            Tool Transfer Type <span style={{ color: "red" }}>*</span>
          </Typography>
          <GateInTextField
            readOnlyP={true}
            value={toolRequestForm?.transfer_type}
          />
        </Grid>
        {toolRequestForm?.transfer_type === "Location Transfer" &&
          Number(user?.site_id) !== Number(toolRequestForm.requested_from) ? (
          <Grid item size={{ xs: 12, md: 3 }}>
            <Typography sx={customLabelTypography} style={{ marginBottom: 4 }}>
              Requested From Location<span style={{ color: "red" }}>*</span>
            </Typography>
            <GateInTextField
              readOnlyP={true}
              value={toolRequestForm?.requested_from_location}
            />
          </Grid>
        ) : site_Transfer_Non_Admin ? (
          <Grid item size={{ xs: 12, md: 3 }}>
            <Typography sx={customLabelTypography} style={{ marginBottom: 4 }}>
              Requested From Location<span style={{ color: "red" }}>*</span>
            </Typography>
            <GateInTextField
              readOnlyP={true}
              value={toolRequestForm?.requested_from_location}
            />
          </Grid>
        ) : (
          <Grid item size={{ xs: 12, md: 3 }}>
            <Typography sx={customLabelTypography} style={{ marginBottom: 4 }}>
              Requesting Location<span style={{ color: "red" }}>*</span>
            </Typography>
            <GateInTextField
              readOnlyP={true}
              value={toolRequestForm?.location}
            />
          </Grid>
        )}
        {toolRequestForm?.transfer_type === "Location Transfer" &&
          Number(user?.site_id) !== Number(toolRequestForm.requested_from) ? (
          <Grid item size={{ xs: 12, md: 3 }}>
            <Typography sx={customLabelTypography} style={{ marginBottom: 4 }}>
              Requested From Site<span style={{ color: "red" }}>*</span>
            </Typography>
            <GateInTextField
              readOnlyP={true}
              value={toolRequestForm?.requested_from_site}
            />
          </Grid>
        ) : site_Transfer_Non_Admin ? (
          <Grid item size={{ xs: 12, md: 3 }}>
            <Typography sx={customLabelTypography} style={{ marginBottom: 4 }}>
              Requested From Site<span style={{ color: "red" }}>*</span>
            </Typography>
            <GateInTextField
              readOnlyP={true}
              value={toolRequestForm?.requested_from_site}
            />
          </Grid>
        ) : (
          <Grid item size={{ xs: 12, md: 3 }}>
            <Typography sx={customLabelTypography} style={{ marginBottom: 4 }}>
              Requesting Site<span style={{ color: "red" }}>*</span>
            </Typography>
            <GateInTextField readOnlyP={true} value={toolRequestForm?.site} />
          </Grid>
        )}
      </Grid>
      <Paper
        elevation={0}
        sx={{
          my: 4,
          width: "100%",
          borderRadius: 3,
          border: "1px solid #e2e8f0",
          overflow: "hidden",
          flexGrow: 1,
        }}
      >
        {/* Header */}
        <Box
          sx={{
            px: 2,
            py: 1,
            display: "flex",
            justifyContent: "space-between",
            borderBottom: "1px solid #e2e8f0",
            bgcolor: "#f8fafc",
          }}
        >
          <Typography variant="body2" fontWeight={600}>
            Added Tools
          </Typography>

          <Typography color="textDisabled">
            {toolRequestForm?.tool_request_line?.length} Items
          </Typography>
        </Box>

        <List
          dense
          sx={(theme)=>({
            overflowY: "auto",
            p: 0,
            minHeight: 300,
            maxHeight: 300, // adjust as needed
            [theme.breakpoints.down("md")]: {
              minHeight: 200,
              maxHeight: 200,
            },
            "&::-webkit-scrollbar": {
              width: 6,
            },

            "&::-webkit-scrollbar-thumb": {
              backgroundColor: "#7769c2",
              borderRadius: 10,
            },

            "&::-webkit-scrollbar-track": {
              backgroundColor: "#f8fafc",
            },
          })}
        >
          {toolRequestForm?.tool_request_line?.map((tool, index) => (
            <ListItem
              key={index}
              divider
              sx={{
                py: 1,
                px: 1.5,
              }}
            >
              <Box
                sx={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 2,
                }}
              >
                {/* Left */}
                <Box sx={{ flex: 1 }}>
                  <Typography
                    sx={{
                      fontSize: "13px",
                      fontWeight: 600,
                    }}
                  >
                    {tool.name}
                  </Typography>

                  <Typography sx={{ fontSize: "11px" }} color="textDisabled">
                    {tool.category}
                  </Typography>
                </Box>

                {/* Center */}
                {(user.procurement_admin === true ||
                  user.procurement_admin === "True") && (
                    <Box
                      sx={{
                        width: 140,
                        height: "100%",
                        display:
                          (toolRequestForm?.transfer_type ===
                            "Location Transfer" &&
                            Number(toolRequestForm?.requested_from) ===
                            Number(user.site_id)) ||
                            toolRequestForm?.transfer_type === "Site Transfer"
                            ? "flex"
                            : "none",
                        flexDirection: "row",
                        alignItems: "flex-end",
                        justifyContent: "flex-start",
                      }}
                    >
                      <Tooltip title="Update Transferred Quantity" arrow>
                        <TextField
                          size="small"
                          type="number"
                          name="quantity"
                          slotProps={{
                            htmlInput: {
                              min: 0,
                              max: tool.required_quantity,
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
                            input: {
                              startAdornment: (
                                <InputAdornment position="start">
                                  <AddCircleOutlineRoundedIcon
                                    sx={{
                                      fontSize: 18,
                                      color: "#6366F1",
                                    }}
                                  />
                                </InputAdornment>
                              ),
                            },
                          }}
                          value={tool.received_quantity}
                          onChange={(e) => {
                            let updated_value = Number(e.target.value);
                            if (updated_value === "") {
                              updated_value = 0;
                            }

                            let new_tool_request_line =
                              toolRequestForm.tool_request_line;
                            let new_tool_request_line_item =
                              new_tool_request_line[index];
                            new_tool_request_line_item.received_quantity =
                              updated_value;

                            setToolRequestForm((prev) => ({
                              ...prev,
                              tool_request_line: new_tool_request_line,
                            }));
                          }}
                          placeholder="0"
                          sx={{
                            width: 110,

                            "& .MuiOutlinedInput-root": {
                              height: 32,
                              borderRadius: "12px",
                              bgcolor: "#FFFFFF",
                              transition: "all 0.2s ease",

                              "& fieldset": {
                                borderColor: "#E5E7EB",
                              },

                              "&:hover": {
                                "& fieldset": {
                                  borderColor: "#CBD5E1",
                                },
                                boxShadow: "0 2px 6px rgba(15, 23, 42, 0.04)",
                              },

                              "&.Mui-focused": {
                                boxShadow: "0 0 0 3px rgba(99, 102, 241, 0.08)",

                                "& fieldset": {
                                  borderColor: "#6366F1",
                                  borderWidth: "1px",
                                },
                              },
                            },

                            "& input": {
                              textAlign: "center",
                              fontSize: "14px",
                              fontWeight: 600,
                              padding: 0,
                            },
                          }}
                        />
                      </Tooltip>
                    </Box>
                  )}

                <Box
                  sx={{
                    minWidth: 120,
                    display: "flex",
                    justifyContent: "flex-end",
                    alignSelf: "flex-start",
                    alignItems: "flex-start",

                    gap: 3,
                  }}
                >
                  <Box textAlign="center">
                    <Typography variant="caption" color="textDisabled">
                      Rate
                    </Typography>

                    <Typography
                      sx={{
                        fontSize: "13px",
                        fontWeight: 700,
                        color: "success",
                      }}
                    >
                      {tool.rate}
                    </Typography>
                  </Box>
                  <Box textAlign="center">
                    <Typography variant="caption" color="textDisabled">
                      Required
                    </Typography>

                    <Typography
                      sx={{
                        fontSize: "13px",
                        fontWeight: 700,
                        color: "primary.main",
                      }}
                    >
                      {tool.required_quantity}
                    </Typography>
                  </Box>

                  <Box textAlign="center">
                    <Typography variant="caption" color="textDisabled">
                      {toolRequestForm?.requested_from_site === user.site &&
                        toolRequestForm?.transfer_type === "Location Transfer"
                        ? "Transferred"
                        : site_Transfer_Admin
                          ? "Transferred"
                          : "Received"}
                    </Typography>

                    <Typography
                      sx={{
                        fontSize: "13px",
                        fontWeight: 700,
                        color:
                          tool.received_quantity >= tool.required_quantity
                            ? "success.main"
                            : "warning.main",
                      }}
                    >
                      {tool.received_quantity ?? 0}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </ListItem>
          ))}
        </List>
      </Paper>
      {user.procurement_admin === false ||
        user.procurement_admin === "False" ? (
        <Alert color="info" variant="outlined">
          Only Procurement Admin Site ({toolRequestForm?.requested_from_site})
          can change the status of your Tool Transfer Request{" "}
        </Alert>
      ) : toolRequestForm?.transfer_type === "Location Transfer" &&
        Number(user?.site_id) !== Number(toolRequestForm.requested_from) ? (
        <Alert color="info" variant="outlined">
          {" "}
          This Request Can Only Be Approved by the Requested Procurement Admin (
          {toolRequestForm?.requested_from_site}) Site.
        </Alert>
      ) : (
        <Stack
          direction={"row"}
          alignItems={"center"}
          justifyContent={"center"}
          spacing={4}
        >
          {toolRequestForm?.tool_request_line?.some(
            (val) => val.required_quantity !== val.received_quantity,
          ) && (
              <Button
                variant="contained"
                startIcon={<RuleRoundedIcon />}
                onClick={handlePartialApprove}
                sx={{
                  width: 250,
                  height: 48,
                  borderRadius: 3.5,
                  textTransform: "none",
                  fontWeight: 700,

                  background: "linear-gradient(135deg, #475569 0%, #334155 100%)",

                  boxShadow: "0 4px 12px rgba(51,65,85,0.15)",

                  "&:hover": {
                    background:
                      "linear-gradient(135deg, #334155 0%, #1E293B 100%)",
                    boxShadow: "0 8px 18px rgba(51,65,85,0.22)",
                  },
                }}
              >
                Transfer Partially
              </Button>
            )}
          {toolRequestForm?.status !== "Approved" &&
            toolRequestForm?.tool_request_line?.every(
              (val) => val.required_quantity === val?.received_quantity,
            ) && (
              <Button
                startIcon={<CheckCircleRoundedIcon />}
                onClick={handleApproveAll}
                sx={{
                  width: 250,
                  height: 48,
                  borderRadius: "14px",
                  textTransform: "none",
                  fontWeight: 700,
                  fontSize: "0.95rem",

                  background:
                    "linear-gradient(135deg, #10B981 0%, #059669 100%)",

                  boxShadow: "0 4px 12px rgba(16,185,129,0.18)",

                  transition: "all 0.25s ease",

                  "&:hover": {
                    background:
                      "linear-gradient(135deg, #059669 0%, #606362 100%)",
                    boxShadow: "0 8px 20px rgba(16,185,129,0.25)",
                    transform: "translateY(-1px)",
                  },

                  "&:active": {
                    transform: "translateY(0px)",
                  },
                }}
                variant="contained"
                color="primary"
                size="large"
              >
                Transfer All
              </Button>
            )}
        </Stack>
      )}
    </Paper>
  );
};

export default ToolTransferSingleTransferComp;
