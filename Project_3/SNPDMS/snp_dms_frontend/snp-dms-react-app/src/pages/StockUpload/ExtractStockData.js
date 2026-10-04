import React from "react";
import {
  makeStyles,
  Typography,
  Paper,
  Box,
  Grid,
  Button,
} from "@material-ui/core";
import Imported from "@material-ui/icons/CloudUpload";
import Rejected from "@material-ui/icons/GetApp";
import { useSnackbar } from "notistack";

import { useDispatch, useSelector } from "react-redux";
import {
  extractStockData,
  importStockData,
  downloadRejectedData,
} from "../../actions/StockUploadActions";
import { theme } from "../../App";

const useStyles = makeStyles((theme) => ({
  paperContainer: {
    padding: theme.spacing(4, 3),
  },
  input: {
    padding: 7,
  },
  button: {
    background: "lightgreen",
    margin: 10,
  },
  button2: {
    background: "#FFCCCB",
    margin: 10,
  },
  LabelTypography: {
    fontSize: 14,
    fontWeight: 600,
    color: "#243545",
    paddingBottom: 4,
    [theme.breakpoints.down("sm")]: {
      // padding: "1px 4px",
      paddingBottom: 1,
    },
  },
  uploadButton: {
    fontSize: 12.5,
    borderRadius: 6,
    border: "1.5px solid #2A5FA5",
    boxShadow: "0px 3px 6px #9199A14D",
    backgroundColor: "#2A5FA5",
    color: "#fff",
    "&:hover": {
      backgroundColor: "#2A5FA5",
    },
  },
}));

const ExtractStockData = () => {
  const classes = useStyles();
  const formData = new FormData();

  const dispatch = useDispatch();
  const store = useSelector((state) => state);
  const { stocksAllotment, user } = store;

  const [file, setFile] = React.useState("");
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
    dispatch(importStockData(importData, value, notify));
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
        style={{
          paddingTop: 14,
          paddingBottom: 14,
          backgroundColor: "#243545",
          color: "#FFF",
          marginTop: 20,
          borderTopLeftRadius: 5,
          borderTopRightRadius: 5,
        }}
      >
        <Box fontWeight="fontWeightBold" m={1}>
          Upload Stock Data
        </Box>
      </Typography>
      <Paper className={classes.paperContainer} elevation={0}>
        <Grid container spacing={6}>
          <Grid
            item
            xs={12}
            sm={2}
            style={theme.breakpoints.down("sm") && { padding: 7 }}
          >
            <Button
              className={classes.uploadButton}
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
                      : null
                  );
                  formData.append(
                    "site",
                    localStorage.getItem("site")
                      ? localStorage.getItem("site")
                      : null
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
            xs={12}
            sm={2}
            // lg={5}
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
          xs={12}
          style={theme.breakpoints.down("sm") && { padding: 7 }}
        >
          <Typography style={{ paddingTop: 30 }}>
            Maximum File Size: <strong>5 MB</strong> | File Format:{" "}
            <strong>CSV or TSV or XLS</strong>
          </Typography>
        </Grid>
        {stocksAllotment.extractStockData.length !== 0 && file && (
          <Grid container spacing={6}>
            <Grid item lg={1} />
            <Grid item xs={8} style={{ padding: 20, paddingTop: 35 }}>
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
                        className={classes.button}
                        startIcon={<Imported />}
                        onClick={handleApproved}
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
                        className={classes.button2}
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
