import React, { useState } from "react";
import LayoutContainer from "@components/reusablecomponents/LayoutContainer";
import {
  Backdrop,
  Box,
  Button,
  CircularProgress,
  Grid,
  Paper,
  Typography,
} from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { useSnackbar } from "notistack";
import { useHistory } from "react-router-dom";
import { theme } from "../../App";
import Imported from "@mui/icons-material/CloudUpload";
import Rejected from "@mui/icons-material/GetApp";
import {
  downloadEnBlockRejectedData,
  downloadEnBlockSampleData,
  extractEnBlockDataAction,
  importEnBlockDataAction,
} from "../../actions/EnBlockMovementAction";
import CustomBackButton from "@components/reusablecomponents/CustomBackButton";
import { custombackDropStyle } from "../../utils/CustomClasses";

const ENBlockMovementBulkUpload = () => {
  const formData = new FormData();
  const dispatch = useDispatch();
  const store = useSelector((state) => state);
  const { EnBlockReducer, ui } = store;
  const [disableImport,setDisableImport]= useState(false)
  const [file, setFile] = React.useState("");
  const notify = useSnackbar().enqueueSnackbar;
  const history = useHistory();

  const handleGoBack = () => {
    history.goBack();
  };

  const handleApproved = () => {
    var importData = {
      importable_data: EnBlockReducer.extractData.importable_data,

      location_id: localStorage.getItem("location_id")
        ? localStorage.getItem("location_id")
        : null,
      site_id: localStorage.getItem("site_id")
        ? localStorage.getItem("site_id")
        : null,
    };
    dispatch(importEnBlockDataAction(importData, notify,setDisableImport));
  };

  const handleOnClick = () => {
    dispatch(downloadEnBlockSampleData(notify));
  };

  const handleRejected = () => {
    var rejectData = {
      rejected_data: EnBlockReducer.extractData.rejected_data,
      faults: EnBlockReducer.extractData.faults,
    };
    dispatch(downloadEnBlockRejectedData(rejectData, notify));
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
                Download En Block Tool Stock Sample Data
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
                Upload En Block Stock data
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

                <Grid item size={{ xs: 2, sm: 2 }}>
                  <Button  variant="contained"
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
                          "location_id",
                          localStorage.getItem("location_id")
                            ? localStorage.getItem("location_id")
                            : null
                        );
                        formData.append(
                          "site_id",
                          localStorage.getItem("site_id")
                            ? localStorage.getItem("site_id")
                            : null
                        );
                        setFile(do_file?.name);
                        dispatch(extractEnBlockDataAction(formData, notify));
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
              {EnBlockReducer.extractData.length !== 0 && file && (
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
                          {EnBlockReducer.extractData.importable_data_count}{" "}
                          Approved Entries
                        </Typography>
                        {EnBlockReducer.extractData.importable_data &&
                          EnBlockReducer.extractData.importable_data.length !==
                            0 && (
                            <Button
                              variant="contained"
                              sx={{
                                background: "lightgreen",
                                margin: 10,
                              }}
                              startIcon={<Imported />}
                              onClick={handleApproved}
                              disabled={disableImport}
                            >
                              Import Tool Data
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
                          {EnBlockReducer.extractData.rejected_data_count}{" "}
                          Rejected Entries
                        </Typography>
                        {EnBlockReducer.extractData.rejected_data &&
                          EnBlockReducer.extractData.rejected_data.length !==
                            0 && (
                            <Button
                              variant="contained"
                              sx={{
                                background: "#FFCCCB",
                                margin: 10,
                              }}
                              startIcon={<Rejected />}
                              onClick={handleRejected}
                            >
                              Download Rejected Tool Data
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

export default ENBlockMovementBulkUpload;
