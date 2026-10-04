import React, { useState, useEffect } from "react";
import {
  Typography,
  Paper,
  Grid,
  Box,
  Button,
  TextField,
  Backdrop,
  CircularProgress,
} from "@mui/material";

import { useHistory } from "react-router-dom";
import LayoutContainer from "@components/reusablecomponents/LayoutContainer";
import { useDispatch, useSelector } from "react-redux";
import {
  addMasterContainerType,
  getSingleContainerType,
  updateMasterContainerType,
} from "../../../actions/master/ContainerTypeMasterActions";
import { useSnackbar } from "notistack";

import { theme } from "../../../App";
import {
  custombackDropStyle,
  customLabelTypography,
} from "../../../utils/CustomClasses";
import CustomBackButton from "@components/reusablecomponents/CustomBackButton";

export default function AddUpdateContainerType(props) {
  const dispatch = useDispatch();
  const history = useHistory();
  const store = useSelector((state) => state);
  const { containerTypeMaster } = store;
  const { isloading } = useSelector((state) => state.ui);
  const [containerTypeName, setContainerTypeName] = useState("");
  const notify = useSnackbar().enqueueSnackbar;

  useEffect(() => {
    if (props.history.location.state) {
      dispatch(
        getSingleContainerType(
          props.history.location.state.allDetails.pk,
          notify,
        ),
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (containerTypeMaster.containerTypeDetails.pk) {
      setContainerTypeName(containerTypeMaster.containerTypeDetails.name);
    }
  }, [containerTypeMaster.containerTypeDetails]);

  const createContainerType = () => {
    if (containerTypeName === "")
      notify("Please Enter Container Type Name", { variant: "warning" });
    else {
      let data = {
        name: containerTypeName,
      };
      dispatch(addMasterContainerType(data, history, notify));
    }
  };

  const updateContainerType = () => {
    if (containerTypeName === "")
      notify("Please Enter Container Type Name", { variant: "warning" });
    else {
      let data = {
        pk: containerTypeMaster.containerTypeDetails.pk,
        name: containerTypeName,
      };
      dispatch(
        updateMasterContainerType(
          containerTypeMaster.containerTypeDetails.pk,
          data,
          history,
          notify,
        ),
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
            {containerTypeMaster.containerTypeDetails.pk
              ? "Update Container Type"
              : "Add Container Type"}
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
                Container Type <span style={{ color: "red" }}>*</span>
              </Typography>

              <TextField
                id="container-type-master-name"
                type={"text"}
                value={containerTypeName}
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
                onChange={(e) => setContainerTypeName(e.target.value)}
              />
            </Grid>
            <Grid item size={{ xs: 3 }}></Grid>
          </Grid>

          <Grid
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              marginTop: 20,
            }}
          >
            {containerTypeMaster.containerTypeDetails.pk ? (
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
                onClick={updateContainerType}
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
                onClick={createContainerType}
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
