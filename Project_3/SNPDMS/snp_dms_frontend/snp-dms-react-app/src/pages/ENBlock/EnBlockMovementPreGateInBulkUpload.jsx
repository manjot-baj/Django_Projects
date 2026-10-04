import React from 'react'
import LayoutContainer from '../../components/reusableComponents/LayoutContainer'
import { Box, Button, Grid, makeStyles, Paper, Typography,  CircularProgress, Backdrop} from '@material-ui/core'
import { useDispatch, useSelector } from 'react-redux';
import { useSnackbar } from 'notistack';
import {useHistory} from 'react-router-dom';
import { Image } from 'semantic-ui-react';
import { theme } from '../../App';
import Imported from "@material-ui/icons/CloudUpload";
import Rejected from "@material-ui/icons/GetApp";
import { downloadEnBlockPreGateInRejectedData, downloadEnBlockPreGateInSampleData, extractEnBlockPreGateInDataAction, importEnBlockPreGateInDataAction } from '../../actions/EnBlockMovementAction';

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
  backdrop: {
    zIndex: theme.zIndex.drawer + 1,
    color: "#fff",
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
  buttonImportToolData: {
    background: "lightgreen",
    margin: 10,
  },
  button2: {
    background: "#FFCCCB",
    margin: 10,
  },
  uploadButton: {
    fontSize: 12.5,
    borderRadius: 6,
    border: "1.5px solid #2A5FA5",
    boxShadow: "0px 3px 6px #9199A14D",
    backgroundColor: "#2A5FA5",
    marginTop: "20px",
    color: "#fff",
    "&:hover": {
      backgroundColor: "#2A5FA5",
    },
  },
}));

const EnBlockMovementPreGateInBulkUpload = () => {


  const classes = useStyles();
  const formData = new FormData();
  const dispatch = useDispatch();
  const store = useSelector((state) => state);
  const { EnBlockReducer,ui } = store;
  const [file, setFile] = React.useState("");
  const notify = useSnackbar().enqueueSnackbar;
  const history = useHistory();

  const handleGoBack = () => {
    history.goBack();
  };

  const handleApproved = () => {
    var importData = {
      importable_data: EnBlockReducer.extractEnBlockPreData.importable_data,

      location_id: localStorage.getItem("location_id")
        ? localStorage.getItem("location_id")
        : null,
      site_id: localStorage.getItem("site_id")
        ? localStorage.getItem("site_id")
        : null,
    };
    dispatch(importEnBlockPreGateInDataAction(importData, notify));
  };

  const handleOnClick = () => {
    dispatch(downloadEnBlockPreGateInSampleData(notify))
  };

  const handleRejected = () => {
    var rejectData = {
      rejected_data: EnBlockReducer.extractEnBlockPreData.rejected_data,
      faults: EnBlockReducer.extractEnBlockPreData.faults,
    };
    dispatch(downloadEnBlockPreGateInRejectedData(rejectData, notify));
  };

  return (
    <LayoutContainer>
        <Grid container>
        <Grid item xs={12}>
          <Image
            src={require("../../assets/images/back-arrow.png")}
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
                Download En Block Pre Gate In Sample File
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
                    <Button className={classes.button} onClick={handleOnClick}>
                      Download
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
                Upload En Block Pre Gate In Stock data
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
                  {file ? <Typography>{file}</Typography> : ""}
                </Grid>

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
                        dispatch(extractEnBlockPreGateInDataAction(formData,notify))
                      }}
                      name="sample_tool_upload"
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
              {EnBlockReducer.extractEnBlockPreData.length !== 0 && file && (
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
                          {EnBlockReducer.extractEnBlockPreData.importable_data_count}{" "}
                          Approved Entries
                        </Typography>
                        {EnBlockReducer.extractEnBlockPreData.importable_data &&
                          EnBlockReducer.extractEnBlockPreData.importable_data.length !==
                            0 && (
                            <Button
                              variant="contained"
                              className={classes.buttonImportToolData}
                              startIcon={<Imported />}
                              onClick={handleApproved}
                            >
                              Import En Block data
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
                          {EnBlockReducer.extractEnBlockPreData.rejected_data_count}{" "}
                          Rejected Entries
                        </Typography>
                        {EnBlockReducer.extractEnBlockPreData.rejected_data &&
                          EnBlockReducer.extractEnBlockPreData.rejected_data.length !==
                            0 && (
                            <Button
                              variant="contained"
                              className={classes.button2}
                              startIcon={<Rejected />}
                              onClick={handleRejected}
                            >
                              Download rejected En Block data
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
        <Backdrop className={classes.backdrop} open={ui.isloading}>
              <CircularProgress color="inherit" />
            </Backdrop>
    </LayoutContainer>
  )
}

export default EnBlockMovementPreGateInBulkUpload