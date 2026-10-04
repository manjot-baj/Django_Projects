import React, { useState } from "react";

import LayoutContainer from "@components/reusablecomponents/LayoutContainer";
import { useHistory } from "react-router-dom";
import Imported from "@mui/icons-material/CloudUpload";
import Rejected from "@mui/icons-material/GetApp";
import {
  Typography,
  Paper,
  Button,
  Grid,
  Box,
  Backdrop,
  CircularProgress,
} from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { useSnackbar } from "notistack";
import { theme } from "../App";
import {
  downloadMnrRejectedWashingData,
  downloadMnrSampleWashingData,
  downloadMnrWashingTariff,
  extractMnrWashingData,
  importMnrWashingData,
} from "../actions/MnrUploadAction";
import CustomBackButton from "@components/reusablecomponents/CustomBackButton";
import { custombackDropStyle } from "@/utils/CustomClasses";

export default function MnrUploadWashingForm(props) {
  const history = useHistory();
  const formData = new FormData();
  const [file, setFile] = React.useState("");
  const [disableImport, setDisableImport] = useState(false);
  const dispatch = useDispatch();
  const store = useSelector((state) => state);
  const { isloading } = useSelector((state) => state.ui);
  const { MNRGridSearch } = store;
  // eslint-disable-next-line no-unused-vars
  const { user } = store;
  const notify = useSnackbar().enqueueSnackbar;

  const handleOnClick = () => {
    dispatch(downloadMnrSampleWashingData(notify));
  };

  const handleOnClickTarrif = () => {
    dispatch(downloadMnrWashingTariff(notify));
  };

  const handleApproved = () => {
    var importData = {
      importable_data: MNRGridSearch.extractMnrData.importable_data,
      location: localStorage.getItem("location")
        ? localStorage.getItem("location")
        : null,
      site: localStorage.getItem("site") ? localStorage.getItem("site") : null,
    };
    dispatch(importMnrWashingData(importData, notify, setDisableImport));
  };

  const handleRejected = () => {
    var rejectData = {
      rejected_data: MNRGridSearch.extractMnrData.rejected_data,
      faults: MNRGridSearch.extractMnrData.faults,
    };
    dispatch(downloadMnrRejectedWashingData(rejectData, notify));
  };

  const handleGoBack = () => {
    history.goBack();
  };

  return (
    <LayoutContainer footer={false}>
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
                Download Survey Washing Sample Data
              </Box>
            </Typography>
            <Paper
              sx={(theme) => ({
                padding: theme.spacing(4, 3),
              })}
              elevation={0}
            >
              <Grid container spacing={1}>
                <Grid
                  item
                  size={{ xs: 12, sm: 6, lg: 6 }}
                  style={theme.breakpoints.down("sm") && { padding: 7 }}
                >
                  <Grid
                    style={{
                      marginLeft: "auto",
                      marginRight: "auto",
                    }}
                  >
                    <Button variant="contained" onClick={handleOnClick}>
                      Download Sample File
                    </Button>
                  </Grid>
                </Grid>
                <Grid
                  item
                  size={{ xs: 12, sm: 6, lg: 6 }}
                  style={theme.breakpoints.down("sm") && { padding: 7 }}
                >
                  <Grid
                    style={{
                      marginLeft: "auto",
                      marginRight: "auto",
                    }}
                  >
                    <Button variant="contained" color="success" onClick={handleOnClickTarrif}>
                      Download Washing Tariff
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
                Upload Washing Survey Data
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
                xs={12}
                spacing={2}
                style={{ display: "flex", alignItems: "center" }}
              >
                <Grid item xs={3} sm={3}>
                  {file ? (
                    <Typography>{file}</Typography>
                  ) : (
                    <Typography>
                      Please choose the file and option type
                    </Typography>
                  )}
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
                      id="upload-mnr-data"
                      onChange={(e) => {
                        const do_file = e.target.files[0];
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
                        setFile(do_file.name);

                        dispatch(extractMnrWashingData(formData, notify));
                      }}
                    />
                  </Button>
                </Grid>
              </Grid>
              <Grid
                item
                xs={12}
                style={theme.breakpoints.down("sm") && { padding: 7 }}
              >
                <Typography style={{ paddingTop: 30 }}>
                  Maximum File Size: <strong>5 MB</strong> | File Format:{" "}
                  <strong>CSV or TSV or XLS</strong>
                </Typography>
              </Grid>
              {MNRGridSearch.extractMnrData.length !== 0 && file && (
                <Grid container spacing={6}>
                  <Grid item xs={10} style={{ padding: 20, paddingTop: 35 }}>
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
                          {MNRGridSearch.extractMnrData.importable_data_count}{" "}
                          Approved Entries
                        </Typography>
                        {MNRGridSearch.extractMnrData.importable_data &&
                          MNRGridSearch.extractMnrData.importable_data
                            .length !== 0 && (
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
                              Import Survey Data
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
                          {MNRGridSearch.extractMnrData.rejected_data_count}{" "}
                          Rejected Entries
                        </Typography>
                        {MNRGridSearch.extractMnrData.rejected_data &&
                          MNRGridSearch.extractMnrData.rejected_data.length !==
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
                              Download Rejected Survey Data
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
      <Backdrop sx={custombackDropStyle} open={isloading}>
        <CircularProgress color="inherit" />
      </Backdrop>
    </LayoutContainer>
  );
}
