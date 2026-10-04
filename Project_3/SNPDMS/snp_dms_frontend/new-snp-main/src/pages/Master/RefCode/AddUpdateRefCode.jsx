import React, { useState, useEffect } from "react";

import { Typography, Paper, Grid, Box, Button, TextField, Backdrop, CircularProgress } from "@mui/material";

import { useHistory } from "react-router-dom";
import LayoutContainer from "@components/reusablecomponents/LayoutContainer";
import { useDispatch, useSelector } from "react-redux";
import {
  addAccountRefCode,
  getSingleRefCode,
  updateAccountRefCode,
} from "../../../actions/master/RefCodeAction";
import { useSnackbar } from "notistack";
import { theme } from "../../../App";
import { Image } from "semantic-ui-react";
import { custombackDropStyle, customLabelTypography } from "../../../utils/CustomClasses";
import BACKIMAGE from "../../../assets/images/back-arrow.png";

export default function AddUpdateRefCode(props) {
  const dispatch = useDispatch();
  const history = useHistory();
  const store = useSelector((state) => state);
  const { refCode } = store;
  const { isloading } = useSelector((state) => state.ui);
  const [refCodeNum, setrefCodeNum] = useState("");
  const notify = useSnackbar().enqueueSnackbar;

  useEffect(() => {
    if (props.history.location.state) {
      dispatch(
        getSingleRefCode(props.history.location.state.allDetails.pk, notify),
      );
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (refCode.refcodeDetails.pk) {
      setrefCodeNum(refCode.refcodeDetails.ref_code);
    }
  }, [refCode.refcodeDetails]);

  const createRole = () => {
    if (refCodeNum === "")
      notify("Please Enter Role Name", {
        variant: "warning",
      });
    else {
      let data = {
        ref_code: refCodeNum,
      };
      dispatch(addAccountRefCode(data, history, notify));
    }
  };

  const updateRole = () => {
    if (refCodeNum === "")
      notify("Please Enter Role Name", {
        variant: "warning",
      });
    else {
      let data = {
        pk: refCode.refcodeDetails.pk,
        ref_code: refCodeNum,
      };
      dispatch(
        updateAccountRefCode(refCode.refcodeDetails.pk, data, history, notify),
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
            {refCode.refcodeDetails.pk ? "Check Ref Code" : "Add Ref Code "}
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
                Ref Code <span style={{ color: "red" }}>*</span>
              </Typography>

              <TextField
                id="container-size-master-name"
                type={"text"}
                value={refCodeNum}
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
                onChange={(e) => setrefCodeNum(e.target.value)}
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
            {refCode.refcodeDetails.pk ? (
              ""
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
