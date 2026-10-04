import React, { useState } from "react";
import { Typography, Paper, Box, Grid, Button } from "@mui/material";
import Imported from "@mui/icons-material/CloudUpload";
import Rejected from "@mui/icons-material/GetApp";
import { useSnackbar } from "notistack";

import { useDispatch, useSelector } from "react-redux";
import {
  extractStockData,
  importStockData,
  downloadRejectedData,
} from "../../actions/StockUploadActions";
import { theme } from "../../App";

const ExtractStockData = () => {
  const formData = new FormData();

  const dispatch = useDispatch();
  const store = useSelector((state) => state);
  const { stocksAllotment, user } = store;

  const [file, setFile] = React.useState("");
  const [disableImport, setDisableImport] = useState(false);
  const notify = useSnackbar().enqueueSnackbar;

  const value = user.type === "NON DEPOT" ? "non_depot" : "depot";

  const handleApproved = () => {
    var importData = {
      importable_data: stocksAllotment.extractStockData.importable_data,
      location: localStorage.getItem("location")
        ? localStorage.getItem("location")
        : null,
      site: localStorage.getItem("site") ? localStorage.getItem("site") : null,
    };
    dispatch(importStockData(importData, value, notify, setDisableImport));
  };

  const handleRejected = () => {
    var rejectData = {
      rejected_data: stocksAllotment.extractStockData.rejected_data,
      faults: stocksAllotment.extractStockData.faults,
    };
    dispatch(downloadRejectedData(rejectData, value, notify));
  };

  return (
    <div>
      <Typography
        variant="subtitle2"
        sx={(theme) => ({
          paddingTop: 1,
          paddingBottom: 1,
          backgroundColor: theme.palette.secondary.main,
          color: "#FFF",
          marginTop: 2,
          borderTopLeftRadius: 5,
          borderTopRightRadius: 5,
        })}
      >
        <Box fontWeight="fontWeightBold" m={1}>
          Upload Stock Data
        </Box>
      </Typography>
      <Paper
        sx={(theme) => ({
          padding: theme.spacing(4, 3),
        })}
        elevation={0}
      >
        <Grid container spacing={6}>
          <Grid
            size={{ xs: 12, sm: 2 }}
            item
            style={theme.breakpoints.down("sm") && { padding: 7 }}
          >
            <Button
              variant="contained"
              sx={{
                fontSize: 12.5,
                borderRadius: 6,
              }}
              id="upload-stock-data"
              component="label"
            >
              Choose File
              <input
                type="file"
                style={{ display: "none" }}
                id="upload-stock-data"
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
                  const value =
                    user.type === "NON DEPOT" ? "non_depot" : "depot";
                  dispatch(extractStockData(formData, value, notify));
                }}
                name="uploadStockData"
              />
            </Button>
          </Grid>
          <Grid
            item
            size={{ xs: 12, sm: 2 }}
            style={theme.breakpoints.down("sm") && { padding: 7 }}
          >
            {file ? (
              <Typography>{file}</Typography>
            ) : (
              <Typography>No File Selected</Typography>
            )}
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
        {stocksAllotment.extractStockData.length !== 0 && file && (
          <Grid container spacing={6}>
            <Grid item size={{ lg: 1 }} />
            <Grid item size={{ xs: 8 }} style={{ padding: 20, paddingTop: 35 }}>
              <Grid style={{ display: "flex", justifyContent: "space-around" }}>
                <Grid
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Typography>
                    {stocksAllotment.extractStockData.importable_data_count}{" "}
                    Approved Entries
                  </Typography>
                  {stocksAllotment.extractStockData.importable_data &&
                    stocksAllotment.extractStockData.importable_data.length !==
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
                        Import Stock Data
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
                    {stocksAllotment.extractStockData.rejected_data_count}{" "}
                    Rejected Entries
                  </Typography>
                  {stocksAllotment.extractStockData.rejected_data &&
                    stocksAllotment.extractStockData.rejected_data.length !==
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
                        Download Rejected Data
                      </Button>
                    )}
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        )}
      </Paper>
    </div>
  );
};

export default ExtractStockData;
