import React, { useState } from "react";
import {
  Typography,
  Paper,
  Box,
  Grid,
  Button,
} from "@mui/material";
import Imported from "@mui/icons-material/CloudUpload";
import Rejected from "@mui/icons-material/GetApp";
import { useSnackbar } from "notistack";

import { useDispatch, useSelector } from "react-redux";
import {
  extractSealData,
  importSealData,
  downloadRejectedData,
} from "../../actions/SealUploadActions";
import { theme } from "../../App";



const ExtractSealData = () => {
  const formData = new FormData();

  const dispatch = useDispatch();
  const store = useSelector((state) => state);
  const { sealManagementMaster } = store;

  const [file, setFile] = React.useState("");
  const notify = useSnackbar().enqueueSnackbar;
  const [disableImport,setDisableImport]= useState(false)


  const handleApproved = () => {
    var importData = {
      importable_data: sealManagementMaster.extractSealData.importable_data,
      location: localStorage.getItem("location")
        ? localStorage.getItem("location")
        : null,
      site: localStorage.getItem("site") ? localStorage.getItem("site") : null,
    };
    dispatch(importSealData(importData, notify,setDisableImport));
  };

  const handleRejected = () => {
    var rejectData = {
      rejected_data: sealManagementMaster.extractSealData.rejected_data,
      faults: sealManagementMaster.extractSealData.faults,
    };
    dispatch(downloadRejectedData(rejectData, notify));
  };

  return (
    <div>
      <Typography
        variant="subtitle2"
        sx={(theme)=>({
          paddingTop: 2,
          paddingBottom: 2,
          backgroundColor: theme.palette.secondary.main,
          color: "#FFF",
          marginTop: 1,
          borderTopLeftRadius: 5,
          borderTopRightRadius: 5,
        })}
      >
        <Box fontWeight="fontWeightBold" m={1}>
          Upload Seal Data
        </Box>
      </Typography>
      <Paper sx={(theme)=>({
        padding: theme.spacing(4, 3),
      })} elevation={0}>
        <Grid container spacing={6}>
          <Grid
            item
            size={{xs:12,sm:2}}
         
            // lg={5}
            style={theme.breakpoints.down("sm") && { padding: 7 }}
          >
            <Button
            variant="contained"
              sx={(theme)=>({
                fontSize: 12.5,
                borderRadius: 6,
              })}
              id="upload-seal-data"
              component="label"
            >
              Choose File
              <input
                type="file"
                style={{ display: "none" }}
                id="upload-seal-data"
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
                
                  dispatch(extractSealData(formData,  notify));
                }}
                name="uploadSealData"
              />
            </Button>
          </Grid>
          <Grid
            item
            size={{xs:12,sm:2}}
       
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
          size={{xs:12}}
        
          style={theme.breakpoints.down("sm") && { padding: 7 }}
        >
           <Typography style={{ paddingTop: 30 }}>
            Maximum File Size: <strong>5 MB</strong> | File Format:{" "}
            <strong>CSV or TSV or XLS</strong>
          </Typography>
        </Grid>

        {sealManagementMaster.extractSealData.length !== 0 && file && (
          <Grid container spacing={6}>
            <Grid item size={{lg:1}}  />
            <Grid item size={{xs:8}}  style={{ padding: 20, paddingTop: 35 }}>
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
                    {sealManagementMaster.extractSealData.importable_data_count}{" "}
                    Approved Entries
                  </Typography>
                  {sealManagementMaster.extractSealData.importable_data &&
                    sealManagementMaster.extractSealData.importable_data.length !==
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
                        Import Seal Data
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
                    {sealManagementMaster.extractSealData.rejected_data_count}{" "}
                    Rejected Entries
                  </Typography>
                  {sealManagementMaster.extractSealData.rejected_data &&
                    sealManagementMaster.extractSealData.rejected_data.length !==
                      0 && (
                      <Button
                        variant="contained"
                        sx={{
                          background: "lightgreen",
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

export default ExtractSealData;
