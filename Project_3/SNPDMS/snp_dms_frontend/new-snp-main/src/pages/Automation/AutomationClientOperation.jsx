import LayoutContainer from "@/components/reusablecomponents/LayoutContainer";
import {
  Backdrop,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  Paper,
  Stack,
  Tab,
  Tabs,
  Tooltip,
  Typography,
} from "@mui/material";
import React, { useMemo, useState } from "react";
import RoomPreferencesOutlinedIcon from "@mui/icons-material/RoomPreferencesOutlined";
import { custombackDropStyle } from "@/utils/CustomClasses";
import { useDispatch, useSelector } from "react-redux";
import { downloadReports } from "@/actions/ReportActions";
import { useSnackbar } from "notistack";
import UploadFileRoundedIcon from "@mui/icons-material/UploadFileRounded";
import DescriptionRoundedIcon from "@mui/icons-material/DescriptionRounded";
import AutorenewIcon from "@mui/icons-material/Autorenew";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import DownloadRoundedIcon from "@mui/icons-material/DownloadRounded";
import {
  clientGstBulkNoneUpdateAction,
  clientGstNoUpdateExtractAction,
  clientUniqueGstUploadExtractAction,
  processClientGstUpdateAction,
  processClientUniqueGSTAction,
  rejectedDownloadUniqueClientGSTAction,
} from "@/actions/Automation/AutomationClientOperationAction";
import { AUTOMATION_CLIENT_GST_REMOVE_REDUCER } from "@/reducers/AutomationClientOperationReducer";
import CloudDownloadOutlinedIcon from "@mui/icons-material/CloudDownloadOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import { useHistory } from "react-router-dom/cjs/react-router-dom.min";
import EditIcon from "@mui/icons-material/Edit";

const AutomationClientOperation = () => {
  const formData = new FormData();
  const dispatch = useDispatch();
  const history = useHistory();
  const store = useSelector((state) => state);
  const { ui, user, AutomationClientOperationReducer } = store;
  const { client_gst_extract_data, client_gst_update_extract_data } =
    AutomationClientOperationReducer;
  const notify = useSnackbar().enqueueSnackbar;
  const [openWarning, setOpenWarning] = useState(false);
  const [loader, setLoader] = useState(false);
  const [file, setFile] = React.useState("");
  const [activeTab, setActiveTab] = useState(0);
  const fileInputRef = React.useRef(null);

  const handleOpenWarning = () => {
    setOpenWarning(true);
  };

  const handleCloseWarning = () => {
    setOpenWarning(false);
  };

  const handleConfirm = () => {
    dispatch(clientGstBulkNoneUpdateAction(handleCloseWarning, notify));
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    handleRemoveFile();
  };

  const handleRemoveFile = () => {
    dispatch({
      type: AUTOMATION_CLIENT_GST_REMOVE_REDUCER.AUTOMATION_CLIENT_GST_REMOVE_EXTRACT_DATA_INIT,
    });
    dispatch({
      type: AUTOMATION_CLIENT_GST_REMOVE_REDUCER.AUTOMATION_CLIENT_GST_NO_UPDATE_EXTRACT_DATA_INIT,
    });
    setFile("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const downloadClientReport = () => {
    let client_data = {
      from_date: "",
      to_date: "",
      from_time: "",
      to_time: "",
      line: "",
      report: "CLIENT REPORT",
      location: user?.location,
      site: user?.site,
      download_and_upload_to_ftp: null,
      container_no: [],
    };

    dispatch(downloadReports(client_data, setLoader, notify));
  };

  const handleRejectedDownloadFile = () => {
    if (activeTab === 2) {
      dispatch(
        rejectedDownloadUniqueClientGSTAction(
          client_gst_extract_data?.faults,
          notify,
        ),
      );
    } else if (activeTab === 1) {
      dispatch(
        rejectedDownloadUniqueClientGSTAction(
          client_gst_update_extract_data?.faults,
          notify,
        ),
      );
    } else {
    }
  };
  const handleProcessClientData = () => {
    if (activeTab === 2) {
      dispatch(
        processClientUniqueGSTAction(
          client_gst_extract_data?.correct_data,
          handleRemoveFile,
          notify,
        ),
      );
    } else if (activeTab === 1) {
      if (
        Object.keys(client_gst_update_extract_data?.correct_data || {}).length <=
        0
      ) {
        notify("No Data found to Update the GST No.", { variant: "error" });
      } else {
        dispatch(
          processClientGstUpdateAction(
            client_gst_update_extract_data?.correct_data,
            handleRemoveFile,
            notify,
          ),
        );
      }
    } else {
    }
  };

  const handleClientGstToNoneUpdate = () => {
    handleOpenWarning();
  };

  const clientDataToUpdate = useMemo(
    () =>
      Object.values(client_gst_update_extract_data?.correct_data || {})?.map(
        (client) => client?.name,
      ),
    [client_gst_update_extract_data],
  );
  return (
    <LayoutContainer>
      {" "}
      <Box
        sx={(theme) => ({
          px: 2,
          [theme.breakpoints.down("sm")]: {
            p: 2,
          },
        })}
      >
        {" "}
        <Stack
          direction={"row"}
          alignItems={"center"}
          justifyContent={"flex-start"}
          spacing={2}
          sx={{ mb: 2 }}
        >
          {" "}
          <RoomPreferencesOutlinedIcon
            fontSize="large"
            sx={(theme) => ({
              fill: "white",
              bgcolor: theme.palette.primary.main,
              padding: 0.6,
              borderRadius: 2,
            })}
          />
          <Stack
            direction={"column"}
            alignItems={"flex-start"}
            justifyContent={"center"}
          >
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              Client GST Operation
            </Typography>
            <Typography variant="caption">
              Manage Duplicate Clients , Download the Client Report or Update
              GST No in Bulk
            </Typography>
          </Stack>
        </Stack>{" "}
        <Divider />
        <Box sx={{ mt: 2 }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              minHeight: 48,

              "& .MuiTab-root": {
                textTransform: "none",
                fontWeight: 600,
                fontSize: "15px",
                minHeight: 48,
                color: "#6B7280", // inactive tab
                opacity: 1,
              },

              "& .MuiTab-root.Mui-selected": {
                color: "primary.main", // active tab
                fontWeight: 700,
              },

              "& .MuiTabs-indicator": {
                height: 3,
                borderRadius: "3px 3px 0 0",
              },
            }}
          >
            <Tab label="Update All Party Clients GST to None" />

            <Tab label="Update All Ideal Party Clients GST" />
            <Tab label="Delete Duplicate Party Clients" />
          </Tabs>
        </Box>
        {user?.role === "Admin" ? (
          activeTab === 2 ? (
            <Box
              sx={(theme) => ({
                minHeight: "100vh",
                bgcolor: "#f4f6f8",
                py: 4,
                [theme.breakpoints.up("xl")]: {
                  mt: 5,
                },
              })}
            >
              <Container>
                <Paper
                  elevation={0}
                  sx={{
                    borderRadius: 6,
                    p: { xs: 1, md: 5 },
                    border: "1px solid",
                    borderColor: "divider",
                    bgcolor: "background.paper",
                  }}
                >
                  {/* Header */}
                  <Stack
                    direction={{ xs: "column", md: "row" }}
                    alignItems={{ md: "center" }}
                    justifyContent="space-between"
                    spacing={3}
                    mb={5}
                  >
                    <Box>
                      <Typography variant="h5" fontWeight={700} gutterBottom>
                        Bulk Upload Clients
                      </Typography>

                      <Typography
                        variant="body2"
                        color="textDisabled"
                        sx={{ maxWidth: 500 }}
                      >
                        Upload Your Client Data to remove Duplicate Client
                        through xls file.
                      </Typography>
                    </Box>
                    <Tooltip title="View All Client Details by Downloading the Report">
                      <Button
                        variant="outlined"
                        startIcon={<DownloadRoundedIcon />}
                        onClick={downloadClientReport}
                        sx={{
                          borderRadius: 3,
                          px: 3,
                          py: 1.2,
                          textTransform: "none",
                          fontWeight: 600,
                        }}
                      >
                        Download Client Report
                      </Button>
                    </Tooltip>
                  </Stack>

                  {/* Upload Area */}
                  <Paper
                    variant="outlined"
                    sx={{
                      borderRadius: 6,
                      p: { xs: 2, md: 8 },
                      textAlign: "center",
                      borderStyle: "dashed",
                      borderWidth: 2,
                      bgcolor: "grey.50",
                      cursor: "pointer",
                      transition: "0.2s ease",
                      "&:hover": {
                        borderColor: "primary.main",
                        bgcolor: "primary.50",
                      },
                    }}
                  >
                    <Typography variant="h5" fontWeight={700} mb={1}>
                      Drag & Drop File Here
                    </Typography>

                    <Typography variant="body2" color="textDisabled" mb={2}>
                      Supported formats: .xlsx
                    </Typography>

                    <Button
                      component="label"
                      variant="contained"
                      startIcon={<UploadFileRoundedIcon />}
                      sx={{
                        borderRadius: 3,
                        px: 4,
                        py: 1.4,
                        textTransform: "none",
                        fontWeight: 600,
                      }}
                    >
                      Browse File
                      <input
                        hidden
                        ref={fileInputRef}
                        type="file"
                        onChange={(e) => {
                          const do_file = e.target.files?.[0];
                          formData.append("file", do_file);
                          formData.append(
                            "location",
                            localStorage.getItem("location")
                              ? localStorage.getItem("location")
                              : null,
                          );
                          formData.append(
                            "site",
                            localStorage.getItem("site")
                              ? localStorage.getItem("site")
                              : null,
                          );
                          setFile(do_file);
                          dispatch(
                            clientUniqueGstUploadExtractAction(
                              formData,
                              notify,
                            ),
                          );
                        }}
                      />
                    </Button>
                  </Paper>

                  {/* File Preview */}
                  {client_gst_extract_data && (
                    <Card
                      elevation={0}
                      sx={{
                        mt: 5,
                        borderRadius: 5,
                        border: "1px solid",
                        borderColor: "divider",
                      }}
                    >
                      <CardContent>
                        <Stack
                          direction={{ xs: "column", md: "row" }}
                          spacing={3}
                          justifyContent="space-between"
                          alignItems={{ md: "center" }}
                        >
                          <Stack
                            direction="row"
                            spacing={2}
                            alignItems="center"
                          >
                            <Box
                              sx={{
                                width: 60,
                                height: 60,
                                borderRadius: 4,
                                bgcolor: "success.light",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              <DescriptionRoundedIcon
                                sx={{ color: "success.dark", fontSize: 32 }}
                              />
                            </Box>

                            <Stack
                              direction={"column"}
                              alignItems={"flex-start"}
                              justifyContent={"flex-start"}
                              spacing={0.5}
                            >
                              <Typography fontWeight={700}>
                                {file?.name}
                              </Typography>
                              <Stack
                                direction={"row"}
                                alignItems={"center"}
                                justifyContent={"flex-start"}
                                spacing={2}
                              >
                                <Typography
                                  variant="body2"
                                  color="textDisabled"
                                >
                                  {file
                                    ? `${(file.size / (1024 * 1024)).toFixed(2)} MB`
                                    : ""}
                                </Typography>
                                <Typography variant="caption" color="error">
                                  {`There are ${Object.keys(client_gst_extract_data?.faults).length} faults in your File `}
                                </Typography>
                              </Stack>
                            </Stack>
                          </Stack>

                          <Stack direction="row" spacing={2}>
                            <Tooltip title="Remove This File and Upload a Different File">
                              <Button
                                variant="outlined"
                                color="error"
                                startIcon={<DeleteOutlineRoundedIcon />}
                                onClick={handleRemoveFile}
                                sx={{
                                  borderRadius: 3,
                                  textTransform: "none",
                                }}
                              >
                                Remove File
                              </Button>
                            </Tooltip>

                            {client_gst_extract_data?.faults_exists === true ? (
                              <Tooltip title="Download the File to Review and Process Rejected Clients">
                                <Button
                                  variant="contained"
                                  color="error"
                                  startIcon={<CloudDownloadOutlinedIcon />}
                                  sx={{
                                    borderRadius: 3,
                                    textTransform: "none",
                                    px: 3,
                                  }}
                                  onClick={handleRejectedDownloadFile}
                                >
                                  Rejected Client Data
                                </Button>
                              </Tooltip>
                            ) : (
                              <Tooltip title="Process Your Selected Clients to Remove Duplicate Records">
                                <Button
                                  variant="contained"
                                  color="success"
                                  startIcon={<AutorenewIcon />}
                                  onClick={handleProcessClientData}
                                  sx={{
                                    borderRadius: 3,
                                    textTransform: "none",
                                    px: 3,
                                  }}
                                >
                                  Process File
                                </Button>
                              </Tooltip>
                            )}
                          </Stack>
                        </Stack>
                      </CardContent>
                    </Card>
                  )}
                </Paper>
              </Container>
            </Box>
          ) : activeTab === 1 ? (
            <Box
              sx={(theme) => ({
                minHeight: "100vh",
                bgcolor: "#f4f6f8",
                py: 4,
                [theme.breakpoints.up("xl")]: {
                  mt: 5,
                },
              })}
            >
              <Container>
                <Paper
                  elevation={0}
                  sx={{
                    borderRadius: 6,
                    p: { xs: 2, md: 5 },
                    border: "1px solid",
                    borderColor: "divider",
                    bgcolor: "background.paper",
                  }}
                >
                  <Stack
                    direction={{ xs: "column", md: "row" }}
                    alignItems={{ md: "center" }}
                    justifyContent="space-between"
                    spacing={3}
                    mb={5}
                  >
                    <Box>
                      <Typography variant="h5" fontWeight={700} gutterBottom>
                        Bulk Client GST No Update
                      </Typography>

                      <Typography variant="body2" color="textDisabled">
                        Upload your client data to update GST numbers in bulk.
                      </Typography>
                    </Box>
                    <Tooltip title="View All Client Details by Downloading the Report">
                      <Button
                        variant="outlined"
                        color="success"
                        startIcon={<DownloadRoundedIcon />}
                        onClick={downloadClientReport}
                        sx={{
                          borderRadius: 3,
                          px: 3,
                          py: 1.2,
                          textTransform: "none",
                          fontWeight: 600,
                        }}
                      >
                        Download Client Report
                      </Button>
                    </Tooltip>
                  </Stack>
                  <Paper
                    variant="outlined"
                    sx={{
                      borderRadius: 6,
                      p: { xs: 2, md: 8 },
                      textAlign: "center",
                      borderStyle: "dashed",
                      borderWidth: 2,
                      bgcolor: "grey.50",
                      cursor: "pointer",
                      transition: "0.2s ease",
                      "&:hover": {
                        borderColor: "success.main",
                        bgcolor: "primary.50",
                      },
                    }}
                  >
                    <Typography variant="h5" fontWeight={700} mb={1}>
                      Drag & Drop File Here
                    </Typography>

                    <Typography variant="body2" color="textDisabled" mb={2}>
                      Supported formats: .xlsx
                    </Typography>

                    <Button
                      component="label"
                      variant="contained"
                      color="success"
                      startIcon={<UploadFileRoundedIcon />}
                      sx={{
                        borderRadius: 3,
                        px: 4,
                        py: 1.4,
                        textTransform: "none",
                        fontWeight: 600,
                      }}
                    >
                      Browse File
                      <input
                        hidden
                        ref={fileInputRef}
                        type="file"
                        onChange={(e) => {
                          const do_file = e.target.files?.[0];
                          formData.append("file", do_file);
                          formData.append(
                            "location",
                            localStorage.getItem("location")
                              ? localStorage.getItem("location")
                              : null,
                          );
                          formData.append(
                            "site",
                            localStorage.getItem("site")
                              ? localStorage.getItem("site")
                              : null,
                          );
                          setFile(do_file);
                          dispatch(
                            clientGstNoUpdateExtractAction(formData, notify),
                          );
                        }}
                      />
                    </Button>
                  </Paper>
                  {client_gst_update_extract_data && (
                    <Card
                      elevation={0}
                      sx={{
                        mt: 5,
                        borderRadius: 5,
                        border: "1px solid",
                        borderColor: "divider",
                      }}
                    >
                      <CardContent>
                        <Stack
                          direction={{ xs: "column", md: "row" }}
                          spacing={3}
                          justifyContent="space-between"
                          alignItems={{ md: "center" }}
                        >
                          <Stack
                            direction="row"
                            spacing={2}
                            alignItems="center"
                          >
                            <Box
                              sx={{
                                width: 60,
                                height: 60,
                                borderRadius: 4,
                                bgcolor: "success.light",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              <DescriptionRoundedIcon
                                sx={{ color: "success.dark", fontSize: 32 }}
                              />
                            </Box>

                            <Stack
                              direction={"column"}
                              alignItems={"flex-start"}
                              justifyContent={"flex-start"}
                              spacing={0.5}
                            >
                              <Typography fontWeight={700}>
                                {file?.name}
                              </Typography>
                              <Stack
                                direction={"row"}
                                alignItems={"center"}
                                justifyContent={"flex-start"}
                                spacing={2}
                              >
                                <Typography
                                  variant="body2"
                                  color="textDisabled"
                                >
                                  {file
                                    ? `${(file.size / (1024 * 1024)).toFixed(2)} MB`
                                    : ""}
                                </Typography>
                                <Typography variant="caption" color="error">
                                  {`There are ${Object.keys(client_gst_update_extract_data?.faults).length} faults in your File `}
                                </Typography>
                              </Stack>
                            </Stack>
                          </Stack>

                          <Stack direction="row" spacing={2}>
                            {client_gst_update_extract_data?.faults_exists ===
                              true && (
                              <Tooltip
                                title={`Update Client Gst No for the clients ${clientDataToUpdate?.join(",")}`}
                              >
                                <Button
                                  variant="contained"
                                  color="success"
                                  startIcon={<EditIcon />}
                                  onClick={handleRemoveFile}
                                  sx={{
                                    borderRadius: 3,
                                    textTransform: "none",
                                  }}
                                >
                                  Update Client Gst No
                                </Button>
                              </Tooltip>
                            )}
                            <Tooltip title="Remove This File and Upload a Different File">
                              <Button
                                variant="outlined"
                                color="error"
                                startIcon={<DeleteOutlineRoundedIcon />}
                                onClick={handleRemoveFile}
                                sx={{
                                  borderRadius: 3,
                                  textTransform: "none",
                                }}
                              >
                                Remove File
                              </Button>
                            </Tooltip>

                            {client_gst_update_extract_data?.faults_exists ===
                            true ? (
                              <Tooltip title="Download the File to Review and Process Rejected Clients">
                                <Button
                                  variant="contained"
                                  color="error"
                                  startIcon={<CloudDownloadOutlinedIcon />}
                                  sx={{
                                    borderRadius: 3,
                                    textTransform: "none",
                                    px: 3,
                                  }}
                                  onClick={handleRejectedDownloadFile}
                                >
                                  Rejected Data
                                </Button>
                              </Tooltip>
                            ) : (
                              <Tooltip title="Process Your Selected Clients to Update GST Numbers in Bulk">
                                <Button
                                  variant="contained"
                                  color="success"
                                  startIcon={<AutorenewIcon />}
                                  onClick={handleProcessClientData}
                                  sx={{
                                    borderRadius: 3,
                                    textTransform: "none",
                                    px: 3,
                                  }}
                                >
                                  Process File
                                </Button>
                              </Tooltip>
                            )}
                          </Stack>
                        </Stack>
                      </CardContent>
                    </Card>
                  )}
                </Paper>
              </Container>
            </Box>
          ) : (
            <Box
              sx={(theme) => ({
                minHeight: "100vh",
                bgcolor: "#f4f6f8",
                py: 4,
                [theme.breakpoints.up("xl")]: {
                  mt: 5,
                },
              })}
            >
              <Container>
                <Paper
                  elevation={0}
                  sx={{
                    borderRadius: 6,
                    p: { xs: 2, md: 5 },
                    border: "1px solid",
                    borderColor: "divider",
                    bgcolor: "background.paper",
                  }}
                >
                  <Stack
                    direction={{ xs: "column", md: "row" }}
                    alignItems={{ md: "center" }}
                    justifyContent="space-between"
                    spacing={3}
                    mb={5}
                  >
                    <Box>
                      <Typography variant="h5" fontWeight={700} gutterBottom>
                        Update All Party Clients GST to None
                      </Typography>

                      <Typography
                        variant="body2"
                        color="textDisabled"
                        sx={{ maxWidth: 500 }}
                      >
                        This action will update the GST Number for all Party
                        Clients and set it to None. Please review the selected
                        clients carefully before proceeding, as this change will
                        apply to all affected Party Client records.
                      </Typography>
                    </Box>
                    <Tooltip title="View All Client Details by Downloading the Report">
                      <Button
                        variant="outlined"
                        color="error"
                        startIcon={<DownloadRoundedIcon />}
                        onClick={downloadClientReport}
                        sx={{
                          borderRadius: 3,
                          px: 3,
                          py: 1.2,
                          textTransform: "none",
                          fontWeight: 600,
                        }}
                      >
                        Download Client Report
                      </Button>
                    </Tooltip>
                  </Stack>
                  <Paper
                    variant="outlined"
                    sx={{
                      borderRadius: 6,
                      p: { xs: 2, md: 8 },
                      textAlign: "center",

                      borderWidth: 2,
                      bgcolor: "grey.50",
                      cursor: "pointer",
                      transition: "0.2s ease",
                    }}
                  >
                    <Button
                      component="label"
                      variant="contained"
                      color="error"
                      onClick={handleClientGstToNoneUpdate}
                      startIcon={<EditIcon />}
                      sx={{
                        borderRadius: 3,
                        px: 4,
                        py: 1.4,
                        textTransform: "none",
                        fontWeight: 600,
                      }}
                    >
                      Update All Party Clients GST to None
                    </Button>
                  </Paper>
                </Paper>
              </Container>
            </Box>
          )
        ) : (
          <Box
            sx={{
              minHeight: "70vh",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",

              p: 2,
            }}
          >
            <Paper
              elevation={0}
              sx={{
                maxWidth: 420,
                width: "100%",
                borderRadius: 5,
                p: 5,
                textAlign: "center",
                backdropFilter: "blur(10px)",
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.1)",
                color: "#fff",
              }}
            >
              <Box
                sx={{
                  width: 80,
                  height: 80,
                  mx: "auto",
                  mb: 3,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background:
                    "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
                  boxShadow: "0 10px 30px rgba(239,68,68,0.4)",
                }}
              >
                <LockOutlinedIcon sx={{ fontSize: 45, color: "#fff" }} />
              </Box>

              <Typography
                color="secondary"
                variant="h4"
                fontWeight="bold"
                gutterBottom
              >
                Access Denied
              </Typography>

              <Typography
                variant="body1"
                sx={{
                  color: "GrayText",
                  mb: 4,
                  lineHeight: 1.8,
                }}
              >
                This page is restricted. <br />
                Only administrators can access this section.
              </Typography>

              <Button
                variant="contained"
                size="large"
                onClick={() => history.replace("/dashboard")}
                sx={{
                  px: 4,
                  py: 1.2,
                  borderRadius: 3,
                  textTransform: "none",
                  fontWeight: "bold",
                  fontSize: "16px",
                  background:
                    "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
                  boxShadow: "0 8px 20px rgba(59,130,246,0.4)",
                  "&:hover": {
                    background:
                      "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
                  },
                }}
              >
                Back to Home
              </Button>
            </Paper>
          </Box>
        )}
      </Box>
      <Dialog
        open={openWarning}
        onClose={handleCloseWarning}
        aria-labelledby="gst-warning-dialog-title"
      >
        <DialogTitle id="gst-warning-dialog-title">⚠️ Warning</DialogTitle>

        <DialogContent>
          <DialogContentText color="textDisabled">
            This action will update all Party client GST No to None.
            <br />
            <strong>Are you sure you want to continue?</strong>
          </DialogContentText>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleCloseWarning} color="inherit">
            Cancel
          </Button>

          <Button
            onClick={handleConfirm}
            variant="contained"
            color="error"
            autoFocus
          >
            Continue
          </Button>
        </DialogActions>
      </Dialog>
      <Backdrop sx={custombackDropStyle} open={ui.isloading}>
        <CircularProgress color="inherit" />
      </Backdrop>
    </LayoutContainer>
  );
};

export default AutomationClientOperation;
