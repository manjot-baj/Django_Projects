import {
  downloadLOLOFinanceBulkUploadData,
  downloadLOLOFinanceBulkUploadSampleData,
  extractLOLOFinanceBulkUploadDataAction,
  importLOLOFinanceBulkUploadDataAction,
} from "@/actions/AdvanceFinance/AdvanceFinanceAction";
import { theme } from "@/App";
import CustomBackButton from "@/components/reusablecomponents/CustomBackButton";
import LayoutContainer from "@/components/reusablecomponents/LayoutContainer";
import { custombackDropStyle } from "@/utils/CustomClasses";
import {
  Backdrop,
  Box,
  Button,
  CircularProgress,
  Grid,
  Paper,
  Typography,
} from "@mui/material";
import { useSnackbar } from "notistack";
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import Imported from "@mui/icons-material/CloudUpload";
import Rejected from "@mui/icons-material/GetApp";

const LoloFinanceBulkUpload = () => {
  const formData = new FormData();
  const dispatch = useDispatch();
  const store = useSelector((state) => state);
  const { AdvanceFinanceReducer, ui } = store;
  const [file, setFile] = React.useState("");
  const notify = useSnackbar().enqueueSnackbar;
  const history = useHistory();
  const [disableImport,setDisableImport] = useState(false)
  

  const handleGoBack = () => {
    history.goBack();
  };

  const handleApproved = () => {
    var importData = {
      importable_data:
        AdvanceFinanceReducer.lolo_finance_extract_data.importable_data,

      location: localStorage.getItem("location")
        ? localStorage.getItem("location")
        : null,
      site: localStorage.getItem("site")
        ? localStorage.getItem("site")
        : null,
    };
    dispatch(importLOLOFinanceBulkUploadDataAction(importData, notify,setDisableImport));
  };

  const handleOnClick = () => {
    dispatch(downloadLOLOFinanceBulkUploadSampleData(notify));
  };

  const handleRejected = () => {
    var rejectData = {
      rejected_data:
        AdvanceFinanceReducer.lolo_finance_extract_data.rejected_data,
      faults: AdvanceFinanceReducer.lolo_finance_extract_data.faults,
    };
    dispatch(downloadLOLOFinanceBulkUploadData(rejectData, notify));
  };
  return (
    <LayoutContainer>
      <Grid container>
        <Grid item size={{ xs: 12 }}>
          <CustomBackButton handleGoBack={handleGoBack} />
          <div>
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
                Download LOLO Advance Bulk Upload sample File
              </Box>
            </Typography>
            <Paper
              sx={(theme) => ({
                padding: theme.spacing(4, 3),
              })}
              elevation={0}
            >
              <Grid container spacing={3}>
                <Grid
                  item
                  size={{ xs: 12, sm: 6, lg: 3 }}
                  style={theme.breakpoints.down("sm") && { padding: 7 }}
                >
                  <Grid
                    style={{
                      marginLeft: "auto",
                      marginRight: "auto",
                      marginTop: 16,
                      marginBottom: 16,
                    }}
                  >
                    <Button
                      variant="contained"
                      sx={{
                        fontSize: 12.5,
                        borderRadius: 6,
                        width: "100%",
                      }}
                      onClick={handleOnClick}
                    >
                      Download
                    </Button>
                  </Grid>
                </Grid>
                <Grid
                  item
                  size={{ xs: 12 }}
                  style={theme.breakpoints.down("sm") && { padding: 7 }}
                >
                  <Typography>
                    Download a sample file and compare it to your import file to
                    ensure you have the file perfect for the import.
                  </Typography>
                </Grid>
              </Grid>
            </Paper>
          </div>
          <div>
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
                Upload LOLO Finance Bulk Upload data
              </Box>
            </Typography>
            <Paper
              sx={(theme) => ({
                padding: theme.spacing(4, 3),
              })}
              elevation={0}
            >
              <Grid
                container
                size={{ xs: 12 }}
                spacing={2}
                style={{ display: "flex", alignItems: "center" }}
              >
                <Grid item size={{ xs: 3, sm: 3 }}>
                  {file ? <Typography>{file}</Typography> : ""}
                </Grid>

                <Grid item xs={2} sm={2}>
                  <Button
                    variant="contained"
                    sx={{
                      fontSize: 12.5,
                      borderRadius: 6,
                    }}
                    id="upload-mnr-data"
                    component="label"
                  >
                    Choose File
                    <input
                      type="file"
                      style={{ display: "none" }}
                      id="upload-tool-data"
                      onChange={(e) => {
                        const do_file = e.target.files[0];
                        formData.append("file", do_file);
                        formData.append(
                          "location",
                          localStorage.getItem("location")
                            ? localStorage.getItem("location")
                            : null
                        );
                        formData.append(
                          "site",
                          localStorage.getItem("site")
                            ? localStorage.getItem("site")
                            : null
                        );
                        setFile(do_file?.name);
                        dispatch(
                          extractLOLOFinanceBulkUploadDataAction(
                            formData,
                            notify
                          )
                        );
                      }}
                      name="sample_tool_upload"
                    />
                  </Button>
                </Grid>
              </Grid>
              <Grid
                item
                size={{ xs: 12 }}
                style={theme.breakpoints.down("sm") && { padding: 7 }}
              >
                <Typography style={{ paddingTop: 30 }}>
                  Maximum File Size: <strong>5 MB</strong> | File Format:{" "}
                  <strong>CSV or TSV or XLS</strong>
                </Typography>
              </Grid>
              {AdvanceFinanceReducer.lolo_finance_extract_data.length !== 0 &&
                file && (
                  <Grid container spacing={6}>
                    <Grid
                      item
                      size={{ xs: 10 }}
                      style={{ padding: 20, paddingTop: 35 }}
                    >
                      <Grid
                        style={{
                          display: "flex",
                          justifyContent: "space-around",
                        }}
                      >
                        <Grid
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                        >
                          <Typography>
                            {
                              AdvanceFinanceReducer.lolo_finance_extract_data
                                .importable_data_count
                            }{" "}
                            Approved Entries
                          </Typography>
                          {AdvanceFinanceReducer.lolo_finance_extract_data
                            .importable_data &&
                            AdvanceFinanceReducer.lolo_finance_extract_data
                              .importable_data.length !== 0 && (
                              <Button
                                variant="contained"
                                color="success"
                                sx={{
                                  margin: 10,
                                }}
                                startIcon={<Imported />}
                                onClick={handleApproved}
                                disabled={disableImport}
                              >
                                Import LOLO Finance data
                              </Button>
                            )}
                        </Grid>
                        <Grid
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                        >
                          <Typography>
                            {
                              AdvanceFinanceReducer.lolo_finance_extract_data
                                .rejected_data_count
                            }{" "}
                            Rejected Entries
                          </Typography>
                          {AdvanceFinanceReducer.lolo_finance_extract_data
                            .rejected_data &&
                            AdvanceFinanceReducer.lolo_finance_extract_data
                              .rejected_data.length !== 0 && (
                              <Button
                                variant="contained"
                                color="error"
                                sx={{
                                 
                                  margin: 10,
                                }}
                                startIcon={<Rejected />}
                                onClick={handleRejected}
                              >
                                Download rejected LOLO Finance data
                              </Button>
                            )}
                        </Grid>
                      </Grid>
                    </Grid>
                  </Grid>
                )}
            </Paper>
          </div>
        </Grid>
      </Grid>
      <Backdrop sx={custombackDropStyle} open={ui.isloading}>
        <CircularProgress color="inherit" />
      </Backdrop>
    </LayoutContainer>
  );
};

export default LoloFinanceBulkUpload;
