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
  addMasterContainerSize,
  getSingleContainerSize,
  updateMasterContainerSize,
} from "../../../actions/master/ContainerSizeMasterActions";
import { useSnackbar } from "notistack";
import { theme } from "../../../App";
import {
  custombackDropStyle,
  customLabelTypography,
} from "../../../utils/CustomClasses";
import CustomBackButton from "@components/reusablecomponents/CustomBackButton";

export default function AddUpdateContainerSize(props) {
  const dispatch = useDispatch();
  const history = useHistory();
  const store = useSelector((state) => state);
  const { isloading } = useSelector((state) => state.ui);
  const { containerSizeMaster } = store;
  const [containerSizeName, setContainerSizeName] = useState("");
  const notify = useSnackbar().enqueueSnackbar;

  useEffect(() => {
    if (props.history.location.state) {
      dispatch(
        getSingleContainerSize(
          props.history.location.state.allDetails.pk,
          notify,
        ),
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (containerSizeMaster.containerSizeDetails.pk) {
      setContainerSizeName(containerSizeMaster.containerSizeDetails.name);
    }
  }, [containerSizeMaster.containerSizeDetails]);

  const createContainerSize = () => {
    if (containerSizeName === "")
      notify("Please Enter Container Size Name", { variant: "warning" });
    else {
      let data = {
        name: containerSizeName,
      };
      dispatch(addMasterContainerSize(data, history, notify));
    }
  };

  const updateContainerSize = () => {
    if (containerSizeName === "")
      notify("Please Enter Container Size Name", { variant: "warning" });
    else {
      let data = {
        pk: containerSizeMaster.containerSizeDetails.pk,
        name: containerSizeName,
      };
      dispatch(
        updateMasterContainerSize(
          containerSizeMaster.containerSizeDetails.pk,
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

  const handleContainerSizeChange = (e) => {
    const regex = /^[0-9\b]+$/;
    if (e.target.value === "" || regex.test(e.target.value)) {
      setContainerSizeName(e.target.value);
    }
  };

  return (
    <LayoutContainer footer={false}>
      <div>
        <CustomBackButton handleGoBack={handleGoBack} />
        <Typography variant="subtitle2">
          <Box fontWeight="fontWeightBold" m={1}>
            {containerSizeMaster.containerSizeDetails.pk
              ? "Update Container Size"
              : "Add Container Size"}
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
                Container Size <span style={{ color: "red" }}>*</span>
              </Typography>

              <TextField
                id="container-size-master-name"
                type={"text"}
                value={containerSizeName}
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
                onChange={(e) => handleContainerSizeChange(e)}
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
            {containerSizeMaster.containerSizeDetails.pk ? (
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
                onClick={updateContainerSize}
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
                onClick={createContainerSize}
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
