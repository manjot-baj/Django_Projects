import React, { useState, useEffect } from "react";
import {
  Typography,
  Paper,
  Grid,
  Box,
  Button,
  TextField,
  MenuItem,
  Backdrop,
  CircularProgress,
} from "@mui/material";

import { useHistory } from "react-router-dom";
import LayoutContainer from "@components/reusablecomponents/LayoutContainer";
import { useDispatch, useSelector } from "react-redux";
import {
  getSingleCarrierCode,
  addMasterCarrierCode,
  updateMasterCarrierCode,
} from "@/actions/master/CarrierCodeMasterActions";
import { useSnackbar } from "notistack";

import { theme } from "../../../App";
import { custombackDropStyle, customLabelTypography } from "../../../utils/CustomClasses";
import CustomBackButton from "@components/reusablecomponents/CustomBackButton";

export default function AddUpdateLocation(props) {
  const dispatch = useDispatch();
  const history = useHistory();
  const store = useSelector((state) => state);
  const { isloading } = useSelector((state) => state.ui);
  const { carrierCodeMaster, user, gateIn } = store;
  const [location, setLocation] = useState(
    localStorage.getItem("location") ? localStorage.getItem("location") : "",
  );
  const [site, setSite] = useState(
    localStorage.getItem("site") ? localStorage.getItem("site") : "",
  );
  const [code, setCode] = useState("");
  const notify = useSnackbar().enqueueSnackbar;

  useEffect(() => {
    if (props.history.location.state) {
      dispatch(
        getSingleCarrierCode(
          props.history.location.state.allDetails.pk,
          notify,
        ),
      );
    }
  }, []);

  useEffect(() => {
    if (carrierCodeMaster.carrierCodeDetails.pk) {
      setLocation(carrierCodeMaster.carrierCodeDetails.location);
      setSite(carrierCodeMaster.carrierCodeDetails.site);
      setCode(carrierCodeMaster.carrierCodeDetails.code);
    }
  }, [carrierCodeMaster.carrierCodeDetails]);

  const createCarrierCode = () => {
    if (location === "")
      notify("Please Enter Location Name", { variant: "warning" });
    else if (site === "") notify("Please Enter Site", { variant: "warning" });
    else if (code === "") notify("Please Enter Code", { variant: "warning" });
    else {
      let req = {
        location: location,
        site: site,
        code: code,
      };
      dispatch(addMasterCarrierCode(req, history, notify));
    }
  };

  const updateCarrierCode = () => {
    if (location === "")
      notify("Please Enter Location Name", { variant: "warning" });
    else if (site === "") notify("Please Enter Site", { variant: "warning" });
    else if (code === "") notify("Please Enter Code", { variant: "warning" });
    else {
      let req = {
        location: location,
        site: site,
        code: code,
      };
      dispatch(
        updateMasterCarrierCode(
          carrierCodeMaster.carrierCodeDetails.pk,
          req,
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
            {carrierCodeMaster.carrierCodeDetails.pk
              ? "Update Carrier Code"
              : "Add Carrier Code"}
          </Box>
        </Typography>
        <Paper
          sx={(theme) => ({
            padding: theme.spacing(2, 2),
          })}
          elevation={0}
        >
          <Grid container spacing={1}>
            <Grid
              item
              size={{ xs: 12, sm: 6, lg: 3 }}
              style={theme.breakpoints.down("sm") && { padding: 7 }}
            >
              <Typography variant="subtitle1" sx={customLabelTypography}>
                Location <span style={{ color: "red" }}>*</span>
              </Typography>

              <TextField
                id="carrier-code-master-location"
                select
                value={location}
                variant="outlined"
                fullWidth
                size="small"
                onChange={(e) => {
                  setLocation(e.target.value);
                }}
                disabled={
                  (user.role === "Location Admin" ||
                    user.role === "Site Admin" ||
                    user.role === "Depot User") &&
                  true
                }
              >
                {gateIn.allDropDown &&
                  gateIn.allDropDown.location_site_dashboard_list &&
                  Object.keys(
                    gateIn.allDropDown.location_site_dashboard_list,
                  ).map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
              </TextField>
            </Grid>
            <Grid
              item
              size={{ xs: 12, sm: 6, lg: 3 }}
              style={theme.breakpoints.down("sm") && { padding: 7 }}
            >
              <Typography variant="subtitle1" sx={customLabelTypography}>
                Site <span style={{ color: "red" }}>*</span>
              </Typography>

              <TextField
                id="client-master-site"
                select
                value={site}
                variant="outlined"
                fullWidth
                size="small"
                onChange={(e) => {
                  setSite(e.target.value);
                }}
                disabled={
                  (user.role === "Site Admin" || user.role === "Depot User") &&
                  true
                }
              >
                {location !== "" &&
                  gateIn.allDropDown &&
                  gateIn.allDropDown.location_site_dashboard_list &&
                  gateIn.allDropDown.location_site_dashboard_list[location].map(
                    (option) => (
                      <MenuItem key={option} value={option}>
                        {option}
                      </MenuItem>
                    ),
                  )}
              </TextField>
            </Grid>
            <Grid
              item
              size={{ xs: 12, sm: 6, lg: 4 }}
              style={theme.breakpoints.down("sm") && { padding: 7 }}
            >
              <Typography variant="subtitle1" sx={customLabelTypography}>
                Code <span style={{ color: "red" }}>*</span>
              </Typography>

              <TextField
                id="carrier-code-master-code"
                type={"text"}
                value={code}
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
                onChange={(e) => setCode(e.target.value)}
              />
            </Grid>

            {carrierCodeMaster.carrierCodeDetails.pk ? (
              <Button
                variant="contained"
                color="primary"
                sx={{
                  fontSize: 12.5,
                  borderRadius: 2,
                  marginLeft: "auto",
                  marginRight: "auto",
                  marginTop: 4,
                  width: "35%",
                }}
                onClick={updateCarrierCode}
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
                  width: "35%",
                }}
                onClick={createCarrierCode}
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
