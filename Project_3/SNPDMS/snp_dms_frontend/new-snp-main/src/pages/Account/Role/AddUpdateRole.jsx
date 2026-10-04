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
  addAccountRole,
  getSingleRole,
  updateAccountRole,
} from "../../../actions/Admin/RoleMasterActions";
import { useSnackbar } from "notistack";
import { theme } from "../../../App";
import { Image } from "semantic-ui-react";
import {
  custombackDropStyle,
  customLabelTypography,
} from "../../../utils/CustomClasses";
import BACKIMAGE from "../../../assets/images/back-arrow.png";

export default function AddUpdateRole(props) {
  const dispatch = useDispatch();
  const history = useHistory();
  const store = useSelector((state) => state);
  const { roleMaster } = store;
  const [roleName, setRoleName] = useState("");
  const notify = useSnackbar().enqueueSnackbar;
  const { isloading } = useSelector((state) => state.ui);

  useEffect(() => {
    if (props.history.location.state) {
      dispatch(
        getSingleRole(props.history.location.state.allDetails.pk, notify),
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (roleMaster.roleDetails.pk) {
      setRoleName(roleMaster.roleDetails.name);
    }
  }, [roleMaster.roleDetails]);

  const createRole = () => {
    if (roleName === "")
      notify("Please Enter Role Name", {
        variant: "warning",
      });
    else {
      let data = {
        name: roleName,
      };
      dispatch(addAccountRole(data, history, notify));
    }
  };

  const updateRole = () => {
    if (roleName === "")
      notify("Please Enter Role Name", {
        variant: "warning",
      });
    else {
      let data = {
        pk: roleMaster.roleDetails.pk,
        name: roleName,
      };
      dispatch(
        updateAccountRole(roleMaster.roleDetails.pk, data, history, notify),
      );
    }
  };

  const handleGoBack = () => {
    history.goBack();
  };

  return (
    <LayoutContainer footer={false}>
      <div>
        <Image
          src={BACKIMAGE}
          style={{ height: 40, width: 40, cursor: "pointer" }}
          onClick={handleGoBack}
        />
        <Typography variant="subtitle2">
          <Box fontWeight="fontWeightBold" m={1}>
            {roleMaster.roleDetails.pk ? "Update Role" : "Add Role"}
          </Box>
        </Typography>
        <Paper
          sx={(theme) => ({
            padding: theme.spacing(4, 3),
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
                Role Name <span style={{ color: "red" }}>*</span>
              </Typography>

              <TextField
                id="container-size-master-name"
                type={"text"}
                value={roleName}
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
                onChange={(e) => setRoleName(e.target.value)}
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
            {roleMaster.roleDetails.pk ? (
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
                onClick={updateRole}
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
                onClick={createRole}
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
