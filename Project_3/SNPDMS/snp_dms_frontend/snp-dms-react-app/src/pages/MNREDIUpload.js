import React, { useState } from "react";

import {
  Grid,
  Button,
  makeStyles,
  Typography,
  Box,
  Paper,
} from "@material-ui/core";
import { useDispatch } from "react-redux";
import LayoutContainer from "../components/reusableComponents/LayoutContainer";
import { uploadDownloadMNREDI } from "../actions/MNREDIActions";
import { useSnackbar } from "notistack";

const useStyles = makeStyles((theme) => ({
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
  backImage: {
    height: 40,
    width: 40,
    marginBottom: 15,
    cursor: "pointer",
  },
  paperContainer: {
    padding: theme.spacing(4, 3),
  },
  input: {
    padding: 7,
  },

  LabelTypography: {
    fontSize: 14,
    fontWeight: 600,
    color: "#243545",
    paddingBottom: 4,
    [theme.breakpoints.down("sm")]: {
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
  downloadButton: {
    fontSize: 12.5,
    borderRadius: 6,
    border: "1.5px solid #2A5FA5",
    boxShadow: "0px 3px 6px #9199A14D",
    backgroundColor: "#FFF",
    color: "#2A5FA5",
    "&:hover": {
      backgroundColor: "#FFF",
    },
    marginLeft: 15,
  },
}));

export default function MNREDIUpload(props) {
  const dispatch = useDispatch();
  const classes = useStyles();
  // eslint-disable-next-line no-unused-vars
  const [icon, setIcon] = useState("");
  const notify = useSnackbar().enqueueSnackbar;

  return (
    <LayoutContainer footer={false}>
      <Grid container>
        <Grid item xs={12}>
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
                Upload MNR EDI
              </Box>
            </Typography>
            <Paper className={classes.paperContainer} elevation={0}>
              <Grid
                container
                spacing={3}
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Grid
                  item
                  xs={12}
                  sm={6}
                  // style={theme.breakpoints.down("sm") && { padding: 7 }}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Typography
                    variant="subtitle1"
                    className={classes.LabelTypography}
                  >
                    Upload Document
                  </Typography>
                  <Grid>
                    <Button
                      className={classes.uploadButton}
                      id="mnr-edi-upload"
                      component="label"
                    >
                      Choose File
                      <input
                        type="file"
                        style={{ display: "none" }}
                        id="mnr-edi-upload"
                        onChange={(e) => {
                          var file = e.target.files[0];

                          if (
                            file.type ===
                              "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
                            file.type === "text/plain" ||
                            file.type === ""
                          ) {
                            setIcon(file);
                            let bodyFormData = new FormData();
                            bodyFormData.append("file", file);
                            dispatch(
                              uploadDownloadMNREDI(
                                bodyFormData,
                                file.type,
                                notify
                              )
                            );
                          } else {
                            notify("Only Excel or EDI can be uploaded", {
                              variant: "warning",
                            });
                          }
                        }}
                      />
                    </Button>
                  </Grid>
                </Grid>
              </Grid>
            </Paper>
          </div>
        </Grid>
      </Grid>
    </LayoutContainer>
  );
}
