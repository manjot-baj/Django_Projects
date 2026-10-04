import React from "react";
import {
  Typography,
  Paper,
  Button,
  Grid,
  Box,
} from "@mui/material";

import { useDispatch, useSelector } from "react-redux";
import { downloadStockSampleData } from "../../actions/LoadedYardUploadAction";
import { useSnackbar } from "notistack";

import { theme } from "../../App";



export default function DownloadMnrSampleData() {

  const dispatch = useDispatch();
  const store = useSelector((state) => state);
  // eslint-disable-next-line no-unused-vars
  const { user } = store;
  const notify = useSnackbar().enqueueSnackbar;

  const handleOnClick = () => {
    dispatch(downloadStockSampleData(notify));
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
          marginTop: 2,
          borderTopLeftRadius: 5,
          borderTopRightRadius: 5,
        })}
      >
        <Box fontWeight="fontWeightBold" m={1}>
          Download Loaded Yard Stock Sample Data
        </Box>
      </Typography>
      <Paper sx={(theme)=>({
        padding: theme.spacing(4, 3),
      })} elevation={0}>
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
              <Button variant="contained" sx={{
                    fontSize: 12.5,
                    borderRadius: 6,
                    width: "100%",
              }} onClick={handleOnClick}>
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
