import React, { useState } from "react";
import {
  Typography,
  Paper,
  Box,
  Grid,
  Button,
  TextField,
  MenuItem,
} from "@mui/material";
import Imported from "@mui/icons-material/CloudUpload";
import Rejected from "@mui/icons-material/GetApp";
import { useSnackbar } from "notistack";

import { useDispatch, useSelector } from "react-redux";
import {
  extractMnrData,
  importMnrStockData,
  downloadMnrRejectedData,
} from "../../actions/MnrUploadAction";
import { theme } from "../../App";
import { customLabelTypography } from "../../utils/CustomClasses";

const ExtractMnrData = () => {
  const formData = new FormData();
  const dispatch = useDispatch();
  const store = useSelector((state) => state);
  const { MNRGridSearch } = store;
  const [file, setFile] = React.useState("");
  const [option, setOption] = React.useState([]);
  const [disableImport, setDisableimport] = useState(false);
  const notify = useSnackbar().enqueueSnackbar;
  const value = "repair";

  const handleApproved = () => {
    if (MNRGridSearch.option === "")
      notify("Please Select Option", { variant: "warning" });
    else {
      var importData = {
        importable_data: MNRGridSearch.extractMnrData.importable_data,
        location: localStorage.getItem("location")
          ? localStorage.getItem("location")
          : null,
        site: localStorage.getItem("site")
          ? localStorage.getItem("site")
          : null,
        option: MNRGridSearch.option,
      };
      dispatch(importMnrStockData(importData, value, notify, setDisableimport));
    }
  };

  const handleRejected = () => {
    var rejectData = {
      rejected_data: MNRGridSearch.extractMnrData.rejected_data,
      faults: MNRGridSearch.extractMnrData.faults,
    };
    dispatch(downloadMnrRejectedData(rejectData, value, notify));
  };
  const option_typeList = ["Complete and Placement", "Placement"];

  return (
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
          Upload MNR Stock Data
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
            {file ? (
              <Typography>{file}</Typography>
            ) : (
              <Typography>Please choose the file and option type</Typography>
            )}
          </Grid>
          <Grid
            item
            size={{ xs: 4, sm: 6, lg: 3 }}
            style={theme.breakpoints.down("sm") && { padding: 7 }}
          >
            <Typography variant="subtitle1" sx={customLabelTypography}>
              Option <span style={{ color: "red" }}>*</span>
            </Typography>

            <TextField
              id="option"
              select
              value={option}
              variant="outlined"
              fullWidth
              size="small"
              onChange={(e) => {
                setOption(e.target.value);
                dispatch({
                  type: "SET_MNR_OPTION",
                  payload: e.target.value,
                });
              }}
            >
              {option_typeList?.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item size={{ xs: 2, sm: 2 }}>
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
                  if (option === "")
                    notify("Please Select Option", { variant: "warning" });
                  else {
                    const do_file = e.target.files[0];
                    formData.append("file", do_file);
                    formData.append("option", option);
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
                    const value = "repair";
                    dispatch(extractMnrData(formData, value, notify));
                  }
                }}
                name="uploadMnrData"
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
        {MNRGridSearch.extractMnrData.length !== 0 && file && (
          <Grid container spacing={6}>
            <Grid
              item
              size={{ xs: 10 }}
              style={{ padding: 20, paddingTop: 35 }}
            >
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
                    {MNRGridSearch.extractMnrData.importable_data_count}{" "}
                    Approved Entries
                  </Typography>
                  {MNRGridSearch.extractMnrData.importable_data &&
                    MNRGridSearch.extractMnrData.importable_data.length !==
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
                        Import MNR Data
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
                    {MNRGridSearch.extractMnrData.rejected_data_count} Rejected
                    Entries
                  </Typography>
                  {MNRGridSearch.extractMnrData.rejected_data &&
                    MNRGridSearch.extractMnrData.rejected_data.length !== 0 && (
                      <Button
                        variant="contained"
                        sx={{
                          background: "#FFCCCB",
                          margin: 10,
                        }}
                        startIcon={<Rejected />}
                        onClick={handleRejected}
                      >
                        Download Rejected MNR Data
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

export default ExtractMnrData;
