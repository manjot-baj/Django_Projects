import React from "react";

import LayoutContainer from "../components/reusableComponents/LayoutContainer";
import DownloadMnrSampleData from "./MnrUpload/DownloadMnrSampleData";
import ExtractMnrData from "./MnrUpload/ExtractMnrData";
import { useHistory } from "react-router-dom";
import { Image } from "semantic-ui-react";
import Imported from "@material-ui/icons/CloudUpload";
import Rejected from "@material-ui/icons/GetApp";
import {
  makeStyles,
  Typography,
  Paper,
  Button,
  Grid,
  Box,
  TextField,
} from "@material-ui/core";
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

const useStyles = makeStyles((theme) => ({
  backImage: {
    height: 40,
    width: 40,
    marginBottom: 15,
    cursor: "pointer",
  },
  paperContainer: {
    padding: theme.spacing(4, 3),
  },
  button: {
    fontSize: 12.5,
    borderRadius: 6,
    width: "100%",
    border: "1.5px solid #2A5FA5",
    boxShadow: "0px 3px 6px #9199A14D",
    backgroundColor: "#2A5FA5",
    color: "#fff",
    "&:hover": {
      backgroundColor: "#2A5FA5",
    },
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
    marginTop:"20px",
    color: "#fff",
    "&:hover": {
      backgroundColor: "#2A5FA5",
    },
  },
}));

export default function MnrUploadWashingForm(props) {
  const history = useHistory();
  const formData = new FormData();
  const [file, setFile] = React.useState("");
  const classes = useStyles();
  const dispatch = useDispatch();
  const store = useSelector((state) => state);
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
        site: localStorage.getItem("site")
          ? localStorage.getItem("site")
          : null,
       
      };
      dispatch(importMnrWashingData(importData, notify));
 
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
        <Grid item xs={12}>
          <Image
            src={require("../assets/images/back-arrow.png")}
            className={classes.backImage}
            onClick={handleGoBack}
          />
          <div>
            <Typography
              variant="subtitle2"
              style={{
                paddingTop: 14,
                paddingBottom: 14,
                backgroundColor: "#243545",
                color: "#FFF",
                marginTop: 10,
                borderTopLeftRadius: 5,
                borderTopRightRadius: 5,
              }}
            >
              <Box fontWeight="fontWeightBold" m={1}>
                Download Survey Washing Sample Data
              </Box>
            </Typography>
            <Paper className={classes.paperContainer} elevation={0}>
              <Grid container spacing={3}>
                <Grid
                  item
                  xs={12}
                  sm={6}
                  lg={3}
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
                    <Button className={classes.button} onClick={handleOnClick} style={{backgroundColor:"#2A5FA5",color:"white"}}>
                      Download Sample File
                    </Button>
                  </Grid>
                </Grid>
                <Grid
                  item
                  xs={12}
                  sm={6}
                  lg={3}
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
                      className={classes.button}
                      onClick={handleOnClickTarrif}
                      style={{ backgroundColor: "green",color:"white" }}
                    >
                      Download Washing Tariff
                    </Button>
                  </Grid>
                </Grid>
                <Grid
                  item
                  xs={12}
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
                Upload Washing Survey Data
              </Box>
            </Typography>
            <Paper className={classes.paperContainer} elevation={0}>
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
                {/* <Grid
                  item
                  xs={4}
                  sm={6}
                  lg={3}
                  style={theme.breakpoints.down("sm") && { padding: 7 }}
                >
                  <Typography
                    variant="subtitle1"
                    className={classes.LabelTypography}
                  >
                    Option <span style={{ color: "red" }}>*</span>
                  </Typography>

                  <TextField
                    id="option"
                    select
                    value={option}
                    variant="outlined"
                    fullWidth
                    inputProps={{ className: classes.input }}
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
                </Grid> */}

                <Grid item xs={2} sm={2}>
                  <Button
                    className={classes.uploadButton}
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
                              : null
                          );
                          formData.append(
                            "site",
                            localStorage.getItem("site")
                              ? localStorage.getItem("site")
                              : null
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
                              className={classes.button}
                              startIcon={<Imported />}
                              onClick={handleApproved}
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
                              className={classes.button2}
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
    </LayoutContainer>
  );
}
