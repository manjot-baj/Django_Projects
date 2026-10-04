import { theme } from "@/App";
import CustomBackButton from "@/components/reusablecomponents/CustomBackButton";
import LayoutContainer from "@/components/reusablecomponents/LayoutContainer";
import { custombackDropStyle } from "@/utils/CustomClasses";
import {
  Backdrop,
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
import Person2OutlinedIcon from "@mui/icons-material/Person2Outlined";
import {
  downloadLOLOFinanceCustomerAccountBulkUploadSampleFile,
  downloadLOLOFinanceCustomerAccountRejectedData,
  extractLOLOFinanceCustomerAccountBulkUploadDataAction,
  importLOLOFinanceCustomerAccountBulkUploadDataAction,
} from "@/actions/LOLOFinance/LOLOFinanceCustomerAction";

const LOLOFinanceCustomerAccountBulkUpload = () => {
  const formData = new FormData();
  const dispatch = useDispatch();
  const store = useSelector((state) => state);
  const { ui, LoloFinanceCustomerReducer } = store;
  const [file, setFile] = React.useState("");
  const notify = useSnackbar().enqueueSnackbar;
  const [disableImport,setDisableImport] = useState(false)
  const history = useHistory();

  const handleGoBack = () => {
    history.goBack();
  };

  const handleApproved = () => {
    var importData = {
      importable_data:
        LoloFinanceCustomerReducer.lolo_finance_customer_account_extract_data
          .importable_data,

      location: localStorage.getItem("location")
        ? localStorage.getItem("location")
        : null,
      site: localStorage.getItem("site") ? localStorage.getItem("site") : null,
    };
    dispatch(
      importLOLOFinanceCustomerAccountBulkUploadDataAction(importData, notify,setDisableImport)
    );
  };

  const handleOnClick = () => {
    dispatch(downloadLOLOFinanceCustomerAccountBulkUploadSampleFile(notify));
  };

  const handleRejected = () => {
    var rejectData = {
      rejected_data:
        LoloFinanceCustomerReducer.lolo_finance_customer_account_extract_data
          .rejected_data,
      faults:
        LoloFinanceCustomerReducer.lolo_finance_customer_account_extract_data
          .faults,
    };
    dispatch(
      downloadLOLOFinanceCustomerAccountRejectedData(rejectData, notify)
    );
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
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-start",
                paddingLeft: 4,
                gap: 2,
                borderTopLeftRadius: 5,
                borderTopRightRadius: 5,
              })}
            >
              <Person2OutlinedIcon />
              Download LOLO Customer Account Bulk Upload sample File
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
                      startIcon={<Person2OutlinedIcon />}
                      sx={{
                        fontSize: 12.5,
                        borderRadius: 6,
                        width: "100%",
                      }}
                      color="success"
                      onClick={handleOnClick}
                    >
                      Download Sample File
                    </Button>
                  </Grid>
                </Grid>
                <Grid item size={{ xs: 12 }}>
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
                marginTop: 4,
                paddingTop: 2,
                paddingBottom: 2,
                backgroundColor: theme.palette.secondary.main,
                color: "#FFF",
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-start",
                paddingLeft: 4,
                gap: 2,
                borderTopLeftRadius: 5,
                borderTopRightRadius: 5,
              })}
            >
              <Person2OutlinedIcon />
              Upload LOLO Customer Account Bulk Upload data
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
                          extractLOLOFinanceCustomerAccountBulkUploadDataAction(
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
              {LoloFinanceCustomerReducer
                .lolo_finance_customer_account_extract_data.length !== 0 &&
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
                              LoloFinanceCustomerReducer
                                .lolo_finance_customer_account_extract_data
                                .importable_data_count
                            }{" "}
                            Approved Entries
                          </Typography>
                          {LoloFinanceCustomerReducer
                            .lolo_finance_customer_account_extract_data
                            .importable_data &&
                            LoloFinanceCustomerReducer
                              .lolo_finance_customer_account_extract_data
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
                                Import LOLO Finance Customer Account data
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
                              LoloFinanceCustomerReducer
                                .lolo_finance_customer_account_extract_data
                                .rejected_data_count
                            }{" "}
                            Rejected Entries
                          </Typography>
                          {LoloFinanceCustomerReducer
                            .lolo_finance_customer_account_extract_data
                            .rejected_data &&
                            LoloFinanceCustomerReducer
                              .lolo_finance_customer_account_extract_data
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
                                Download rejected LOLO Finance Customer Account
                                data
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

export default LOLOFinanceCustomerAccountBulkUpload;
