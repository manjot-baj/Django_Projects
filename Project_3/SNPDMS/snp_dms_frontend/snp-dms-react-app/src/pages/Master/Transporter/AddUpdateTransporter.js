import React, { useState, useEffect } from "react";
import {
  makeStyles,
  Typography,
  Paper,
  Grid,
  Box,
  Button,
  TextField,
  MenuItem,
  FormControlLabel,
  Radio,
} from "@material-ui/core";

import { useHistory } from "react-router-dom";
import LayoutContainer from "../../../components/reusableComponents/LayoutContainer";
import { useDispatch, useSelector } from "react-redux";
import {
  addMasterTransporter,
  getSingleTransporter,
  updateMasterTransporter,
} from "../../../actions/Master/TransporterMasterActions";
import { dropDownDispatch } from "../../../actions/GateInActions";
import { useSnackbar } from "notistack";
import { theme } from "../../../App";
import { Image } from "semantic-ui-react";

const useStyles = makeStyles((theme) => ({
  paperContainer: {
    padding: theme.spacing(4, 3),
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
  button: {
    fontSize: 12.5,
    borderRadius: 6,
    marginLeft: "auto",
    marginRight: "auto",
    marginTop: 20,
    width: "35%",
    border: "1.5px solid #2A5FA5",
    boxShadow: "0px 3px 6px #9199A14D",
    backgroundColor: "#2A5FA5",
    color: "#fff",
    "&:hover": {
      backgroundColor: "#2A5FA5",
    },
  },
  input: {
    // padding: 6,
    padding: 8,
  },
  textField: {
    "& .MuiOutlinedInput-root": {
      "& fieldset": {
        borderColor: "#243545",
      },
    },
  },
  uploadButton: {
    fontSize: 12.5,
    borderRadius: 6,
    // border: "1.5px solid #2A5FA5",
    boxShadow: "0px 3px 6px #9199A14D",
    backgroundColor: "#495057",
    color: "#fff",
    "&:hover": {
      backgroundColor: "#495057",
    },
  },
  backImage: {
    height: 40,
    width: 40,
    marginBottom: 15,
    cursor: "pointer",
  },
}));

export default function AddUpdateTransporter(props) {
  const classes = useStyles();
  const dispatch = useDispatch();
  const history = useHistory();
  const store = useSelector((state) => state);
  const { transporterMaster, gateIn, user } = store;
  const [transporterCode, setTransporterCode] = useState("");
  const [transporterName, setTransporterName] = useState("");
  const [enBlockTransporter, setEnBlockTransporter] = useState(false);
  const [transporterLocation, setTransporterLocation] = useState(
    localStorage.getItem("location") ? localStorage.getItem("location") : ""
  );
  const [transporterSite, setTransporterSite] = useState(
    localStorage.getItem("site") ? localStorage.getItem("site") : ""
  );
  const notify = useSnackbar().enqueueSnackbar;

  useEffect(() => {
    if (props.history.location.state) {
      dispatch(
        getSingleTransporter(props.history.location.state.allDetails.pk, notify)
      );
    }
  }, []);

  useEffect(() => {
    if (transporterMaster.transporterDetails.pk) {
      setTransporterCode(transporterMaster.transporterDetails.code);
      setTransporterName(transporterMaster.transporterDetails.name);
      setTransporterLocation(transporterMaster.transporterDetails.location);
      setTransporterSite(transporterMaster.transporterDetails.site);
      setEnBlockTransporter(
        transporterMaster.transporterDetails.enblock_transporter
      );
    }
  }, [transporterMaster.transporterDetails]);

  useEffect(() => {
    let reqArray = ["location_site_dashboard_list"];

    dispatch(dropDownDispatch(reqArray, notify));
  }, []);

  const createTransporter = () => {
    if (transporterCode === "") {
      notify("Please Enter Transporter Code", { variant: "warning" });
    } else if (transporterName === "") {
      notify("Please Enter Transporter Name", { variant: "warning" });
    } else {
      let data = {
        name: transporterName,
        code: transporterCode,
        location: transporterLocation,
        site: transporterSite,
        enblock_transporter: enBlockTransporter,
      };
      dispatch(addMasterTransporter(data, history, notify));
    }
  };

  const updateTransporter = () => {
    if (transporterCode === "") {
      notify("Please Enter Transporter Code", { variant: "warning" });
    } else if (transporterName === "") {
      notify("Please Enter Transporter Name", { variant: "warning" });
    } else {
      let data = {
        pk: transporterMaster.transporterDetails.pk,
        name: transporterName,
        code: transporterCode,
        location: transporterLocation,
        site: transporterSite,
        enblock_transporter: enBlockTransporter,
      };
      dispatch(
        updateMasterTransporter(
          transporterMaster.transporterDetails.pk,
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

  const handleTransporterNameChange = (e) => {
    const regex = /^[a-zA-Z .]*$/;
    if (e.target.value == "" || regex.test(e.target.value)) {
      setTransporterName(e.target.value);
    }
  };

  return (
    <LayoutContainer footer={false}>
      <div>
        <Image
          src={require("../../../assets/images/back-arrow.png")}
          className={classes.backImage}
          onClick={handleGoBack}
        />
        <Typography variant="subtitle2">
          <Box fontWeight="fontWeightBold" m={1}>
            {transporterMaster.transporterDetails.pk
              ? "Update Transporter"
              : "Add Transporter"}
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
              <Typography
                variant="subtitle1"
                className={classes.LabelTypography}
              >
                Code <span style={{ color: "red" }}>*</span>
              </Typography>

              <TextField
                id="transporter-master-code"
                type={"text"}
                value={transporterCode}
                variant="outlined"
                fullWidth
                className={classes.textField}
                inputProps={{ className: classes.input }}
                onChange={(e) => setTransporterCode(e.target.value)}
              />
            </Grid>

            <Grid
              item
              xs={12}
              sm={6}
              lg={3}
              style={theme.breakpoints.down("sm") && { padding: 7 }}
            >
              <Typography
                variant="subtitle1"
                className={classes.LabelTypography}
              >
                Name <span style={{ color: "red" }}>*</span>
              </Typography>

              <TextField
                id="transporter-master-name"
                type={"text"}
                value={transporterName}
                variant="outlined"
                fullWidth
                className={classes.textField}
                inputProps={{ className: classes.input }}
                onChange={(e) => handleTransporterNameChange(e)}
              />
            </Grid>

            <Grid
              item
              xs={12}
              sm={6}
              lg={3}
              style={theme.breakpoints.down("sm") && { padding: 7 }}
            >
              <Typography
                variant="subtitle1"
                className={classes.LabelTypography}
              >
                Location <span style={{ color: "red" }}>*</span>
              </Typography>

              <TextField
                id="transporter-master-location"
                select
                value={transporterLocation}
                variant="outlined"
                fullWidth
                inputProps={{ className: classes.input }}
                onChange={(e) => {
                  setTransporterLocation(e.target.value);
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
                    gateIn.allDropDown.location_site_dashboard_list
                  ).map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
              </TextField>
            </Grid>
            <Grid
              item
              xs={12}
              sm={6}
              lg={3}
              style={theme.breakpoints.down("sm") && { padding: 7 }}
            >
              <Typography
                variant="subtitle1"
                className={classes.LabelTypography}
              >
                Site <span style={{ color: "red" }}>*</span>
              </Typography>

              <TextField
                id="transporter-master-site"
                select
                value={transporterSite}
                variant="outlined"
                fullWidth
                inputProps={{ className: classes.input }}
                onChange={(e) => {
                  setTransporterSite(e.target.value);
                }}
                disabled={
                  (user.role === "Site Admin" || user.role === "Depot User") &&
                  true
                }
              >
                {transporterLocation !== "" &&
                  gateIn.allDropDown &&
                  gateIn.allDropDown.location_site_dashboard_list &&
                  gateIn.allDropDown.location_site_dashboard_list[
                    transporterLocation
                  ].map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
              </TextField>
            </Grid>
            <Grid
              item
              xs={12}
              sm={12}
              lg={12}
              style={theme.breakpoints.down("sm") && { padding: 7 ,textAlign:'center',margin:"24px 0"}}
            >
              <Typography variant="subtitle2" style={{ paddingRight: 10 }}>
                En Block Transporter
              </Typography>
              <FormControlLabel
                value="yes"
                control={
                  <Radio
                    style={{ color: "#2A5FA5" }}
                    checked={
                      enBlockTransporter === true ||
                      enBlockTransporter === "True"
                    }
                    onClick={() => setEnBlockTransporter(true)}
                   
                  />
                }
                label="Yes"
              />
              <FormControlLabel
                value="no"
                control={
                  <Radio
                    style={{ color: "#2A5FA5" }}
                    checked={
                      enBlockTransporter === false ||
                      enBlockTransporter === "False"
                    }
                  
                    onClick={() =>setEnBlockTransporter(false)
                    }
                  />
                }
                label="No"
              />
            </Grid>

            {transporterMaster.transporterDetails.pk ? (
              <Button className={classes.button} onClick={updateTransporter}>
                Update
              </Button>
            ) : (
              <Button className={classes.button} onClick={createTransporter}>
                Save
              </Button>
            )}
          </Grid>
        </Paper>
      </div>
    </LayoutContainer>
  );
}
