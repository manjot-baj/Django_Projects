import React from "react";
import {
  makeStyles,
  Typography,
  Paper,
  Button,
  Grid,
  Box,
} from "@material-ui/core";

import { useDispatch, useSelector } from "react-redux";
import { downloadSealSampleData } from "../../actions/SealUploadActions";
import { useSnackbar } from "notistack";
import { theme } from "../../App";

const useStyles = makeStyles((theme) => ({
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
}));

export default function DownloadSealSampleData() {
  const classes = useStyles();
  const dispatch = useDispatch();
  const store = useSelector((state) => state);
  // eslint-disable-next-line no-unused-vars
  const { user } = store;
  const notify = useSnackbar().enqueueSnackbar;

  const handleOnClick = () => {
    dispatch(downloadSealSampleData(notify));
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
          marginTop: 10,
          borderTopLeftRadius: 5,
          borderTopRightRadius: 5,
        }}
      >
        <Box fontWeight="fontWeightBold" m={1}>
          Download Sample File
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
  );
}
