import React, { useState, useEffect } from "react";
import { Typography, Paper, Grid, Box, Button, TextField, Backdrop, CircularProgress } from "@mui/material";

import { useHistory } from "react-router-dom";
import LayoutContainer from "@components/reusablecomponents/LayoutContainer";
import { useDispatch, useSelector } from "react-redux";
import {
  addMasterExportCargoType,
  getSingleExportCargoType,
  updateMasterExportCargoType,
} from "../../../actions/master/ExportCargoTypeMasterActions";
import { useSnackbar } from "notistack";
import { theme } from "../../../App";
import { custombackDropStyle, customLabelTypography } from "../../../utils/CustomClasses";
import CustomBackButton from "@components/reusablecomponents/CustomBackButton";

export default function AddUpdateExportCargoType(props) {
  const dispatch = useDispatch();
  const history = useHistory();
  const store = useSelector((state) => state);
  const { isloading } = useSelector((state) => state.ui);
  const { exportCargoTypeMaster } = store;
  const [exportCargoTypeName, setExportCargoTypeName] = useState("");
  const notify = useSnackbar().enqueueSnackbar;

  useEffect(() => {
    if (props.history.location.state) {
      dispatch(
        getSingleExportCargoType(
          props.history.location.state.allDetails.pk,
          notify
        )
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (exportCargoTypeMaster.exportCargoTypeDetails.pk) {
      setExportCargoTypeName(exportCargoTypeMaster.exportCargoTypeDetails.name);
    }
  }, [exportCargoTypeMaster.exportCargoTypeDetails]);

  const createExportCargoType = () => {
    if (exportCargoTypeName === "")
      notify("Please Enter Export Cargo Type Name", { variant: "warning" });
    else {
      let data = {
        name: exportCargoTypeName,
      };
      dispatch(addMasterExportCargoType(data, history, notify));
    }
  };

  const updateExportCargoType = () => {
    if (exportCargoTypeName === "")
      notify("Please Enter Export Cargo Type Name", { variant: "warning" });
    else {
      let data = {
        pk: exportCargoTypeMaster.exportCargoTypeDetails.pk,
        name: exportCargoTypeName,
      };
      dispatch(
        updateMasterExportCargoType(
          exportCargoTypeMaster.exportCargoTypeDetails.pk,
          data,
          history,
          notify
        )
      );
    }
  };

  const handleGoBack = () => {
    history.goBack();
  };

  return (
    <LayoutContainer footer={false}>
      <div>
        <CustomBackButton handleGoBack={handleGoBack} />
        <Typography variant="subtitle2">
          <Box fontWeight="fontWeightBold" m={1}>
            {exportCargoTypeMaster.exportCargoTypeDetails.pk
              ? "Update Export Cargo Type"
              : "Add Export Cargo Type"}
          </Box>
        </Typography>
        <Paper
          sx={(theme) => ({
            padding: theme.spacing(2, 2),
          })}
          elevation={0}
        >
          <Grid container spacing={1} alignItems="center" justify="center">
            <Grid item size={{ xs: 3 }}></Grid>
            <Grid
              item
              size={{ xs: 6 }}
              style={theme.breakpoints.down("sm") && { padding: 7 }}
            >
              <Typography variant="subtitle1" sx={customLabelTypography}>
                Export Cargo Type Name <span style={{ color: "red" }}>*</span>
              </Typography>

              <TextField
                id="export-cargo-type-master-name"
                type={"text"}
                value={exportCargoTypeName}
                variant="outlined"
                fullWidth
                sx={{
                  "& .MuiOutlinedInput-root": {
                    "& fieldset": {
                      borderColor: "#243545",
                    },
                  },
                }}
                size="small"
                onChange={(e) => setExportCargoTypeName(e.target.value)}
              />
            </Grid>
            <Grid item size={{ xs: 3 }}></Grid>
          </Grid>

          <Grid
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              marginTop: 4,
            }}
          >
            {exportCargoTypeMaster.exportCargoTypeDetails.pk ? (
              <Button
                variant="contained"
                color="primary"
                sx={{
                  fontSize: 12.5,
                  borderRadius: 2,
                  marginLeft: "auto",
                  marginRight: "auto",
                  marginTop: 4,
                  width: "30%",
                }}
                onClick={updateExportCargoType}
              >
                Update
              </Button>
            ) : (
              <Button
                variant="contained"
                color="primary"
                sx={{
                  fontSize: 12.5,
                  borderRadius: 2,
                  marginLeft: "auto",
                  marginRight: "auto",
                  marginTop: 4,
                  width: "30%",
                }}
                onClick={createExportCargoType}
              >
                Save
              </Button>
            )}
          </Grid>
        </Paper>
      </div>
         <Backdrop sx={custombackDropStyle} open={isloading}>
        <CircularProgress color="inherit" />
      </Backdrop>
    </LayoutContainer>
  );
}
