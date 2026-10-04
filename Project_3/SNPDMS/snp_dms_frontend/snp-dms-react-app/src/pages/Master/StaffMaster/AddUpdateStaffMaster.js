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
} from "@material-ui/core";

import { useHistory } from "react-router-dom";
import LayoutContainer from "../../../components/reusableComponents/LayoutContainer";
import { useDispatch, useSelector } from "react-redux";
import {
  addStaffMaster,
  updateStaffMaster,
  getSingleStaffMaster,
} from "../../../actions/Master/StaffMasterAction";
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

export default function AddUpdateLocation(props) {
  const classes = useStyles();
  const dispatch = useDispatch();
  const history = useHistory();
  const store = useSelector((state) => state);
  const { staffMaster, gateIn, user } = store;
  const [staffFname, setStaffFname] = useState("");
  const [staffLname, setStaffLname] = useState("");
  const [qualification, setQualification] = useState("");

  const [location, setLocation] = useState(
    localStorage.getItem("userInfo")
      ? JSON.parse(localStorage.getItem("userInfo")).location
      : ""
  );
  const [staffSite, setStaffSite] = useState(
    localStorage.getItem("userInfo")
      ? JSON.parse(localStorage.getItem("userInfo")).site
      : ""
  );
  const [staffRole, setStaffRole] = useState("");
  const [staffEmail, setStaffEmail] = useState("");
  const [staffMobile, setStaffMobile] = useState("");
  const notify = useSnackbar().enqueueSnackbar;

  useEffect(() => {
    if (props.history.location.state) {
      dispatch(
        getSingleStaffMaster(props.history.location.state.allDetails.pk, notify)
      );
    }
  }, []);

  useEffect(() => {
    let reqArray = ["location_site_dashboard_list"];

    dispatch(dropDownDispatch(reqArray, notify));
  }, []);

  useEffect(() => {
    if (staffMaster.staffMasterDetails.pk) {
      setStaffFname(staffMaster.staffMasterDetails.firstName);
      setStaffLname(staffMaster.staffMasterDetails.lastName);
      setQualification(staffMaster.staffMasterDetails.qualification);
      setLocation(staffMaster.staffMasterDetails.location);
      setStaffSite(staffMaster.staffMasterDetails.site);
      setStaffRole(staffMaster.staffMasterDetails.role);
      setStaffEmail(staffMaster.staffMasterDetails.emailId);
      setStaffMobile(staffMaster.staffMasterDetails.mobileNo);
    }
  }, [staffMaster.staffMasterDetails]);

  const handleCreateStaff = () => {
    if (staffFname === "")
      notify("Please Enter First Name", {
        variant: "warning",
      });
    else if (location === "")
      notify("Please Enter Location", {
        variant: "warning",
      });
    else if (staffSite === "")
      notify("Please Enter Site", {
        variant: "warning",
      });
    else if (staffRole === "")
      notify("Please Enter Role", {
        variant: "warning",
      });
    else if (staffEmail !== "" && !validateEmail(staffEmail)) {
      notify("Email ID is incorrect", {
        variant: "warning",
      });
    } else if (staffMobile !== "" && !isMobileNoValid(staffMobile)) {
      notify("Please Enter Valid Mobile No", {
        variant: "warning",
      });
    } else {
      let data = {
        firstName: staffFname,
        lastName: staffLname,
        qualification: qualification,
        location: location,
        site: staffSite,
        role: staffRole,
        emailId: staffEmail,
        mobileNo: staffMobile,
      };
      dispatch(addStaffMaster(data, history, notify));
    }
  };

  const handleUpdateStaff = () => {
    if (staffFname === "")
      notify("Please Enter First Name", {
        variant: "warning",
      });
    else if (location === "")
      notify("Please Enter Location", {
        variant: "warning",
      });
    else if (staffSite === "")
      notify("Please Enter Site", {
        variant: "warning",
      });
    else if (staffRole === "")
      notify("Please Enter Role", {
        variant: "warning",
      });
    else if (staffEmail !== "" && !validateEmail(staffEmail)) {
      notify("Email ID is incorrect", {
        variant: "warning",
      });
    } else if (staffMobile !== "" && !isMobileNoValid(staffMobile)) {
      notify("Please Enter Valid Mobile No", {
        variant: "warning",
      });
    } else {
      let data = {
        pk: staffMaster.staffMasterDetails.pk,
        firstName: staffFname,
        lastName: staffLname,
        qualification: qualification,
        location: location,
        site: staffSite,
        role: staffRole,
        emailId: staffEmail,
        mobileNo: staffMobile,
      };
      dispatch(
        updateStaffMaster(
          staffMaster.staffMasterDetails.pk,
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

  const handleStaffNameChange = (e) => {
    const regex = /^[a-zA-Z]*$/;
    if (e.target.value === "" || regex.test(e.target.value)) {
      setStaffFname(e.target.value);
    }
  };

  const handleStaffLNameChange = (e) => {
    const regex = /^[a-zA-Z]*$/;
    if (e.target.value === "" || regex.test(e.target.value)) {
      setStaffLname(e.target.value);
    }
  };

  function isMobileNoValid(str) {
    const mobileValidation = /^[0-9]{10}$/;
    return mobileValidation.test(str);
  }

  function validateEmail(email) {
    var re = /\S+@\S+\.\S+/;
    return re.test(email);
  }

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
            {staffMaster.staffMasterDetails.pk
              ? "Update Staff Master"
              : "Add Staff Master"}
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
                First Name <span style={{ color: "red" }}>*</span>
              </Typography>

              <TextField
                id="staff-master-staff-first-name"
                type={"text"}
                value={staffFname}
                variant="outlined"
                fullWidth
                className={classes.textField}
                inputProps={{ className: classes.input }}
                onChange={(e) => handleStaffNameChange(e)}
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
                Last Name
              </Typography>

              <TextField
                id="account-user-admin-last-name"
                type={"text"}
                value={staffLname}
                variant="outlined"
                fullWidth
                className={classes.textField}
                inputProps={{ className: classes.input }}
                onChange={(e) => handleStaffLNameChange(e)}
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
                id="account-user-admin-location"
                select
                value={location}
                variant="outlined"
                fullWidth
                inputProps={{ className: classes.input }}
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
                id="account-user-admin-site"
                select
                value={staffSite}
                variant="outlined"
                fullWidth
                inputProps={{ className: classes.input }}
                onChange={(e) => {
                  setStaffSite(e.target.value);
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
                    )
                  )}
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
                Role <span style={{ color: "red" }}>*</span>
              </Typography>

              <TextField
                id="account-user-admin-role"
                select
                value={staffRole}
                variant="outlined"
                fullWidth
                inputProps={{ className: classes.input }}
                onChange={(e) => {
                  setStaffRole(e.target.value);
                }}
              >
                <MenuItem key="Surveyor" value="Surveyor">
                  Surveyor
                </MenuItem>
                <MenuItem key="Edp" value="Edp">
                  Edp
                </MenuItem>
                <MenuItem key="Worker" value="Worker">
                  Worker
                </MenuItem>
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
                Qualification
              </Typography>

              <TextField
                id="account-user-admin-user-name"
                type={"text"}
                value={qualification}
                variant="outlined"
                fullWidth
                className={classes.textField}
                inputProps={{ className: classes.input }}
                onChange={(e) => setQualification(e.target.value)}
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
                Email ID
              </Typography>

              <TextField
                id="account-user-admin-email-id"
                type={"text"}
                value={staffEmail}
                variant="outlined"
                fullWidth
                className={classes.textField}
                inputProps={{ className: classes.input }}
                onChange={(e) => setStaffEmail(e.target.value)}
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
                Mobile No <span style={{ color: "red" }}>*</span>
              </Typography>

              <TextField
                id="account-user-admin-mobile-no"
                type={"text"}
                value={staffMobile}
                variant="outlined"
                fullWidth
                className={classes.textField}
                inputProps={{ className: classes.input }}
                onChange={(e) => setStaffMobile(e.target.value)}
              />
            </Grid>
          </Grid>

          <Grid
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              marginTop: 20,
            }}
          >
            {staffMaster.staffMasterDetails.pk ? (
              <Button className={classes.button} onClick={handleUpdateStaff}>
                Update
              </Button>
            ) : (
              <Button className={classes.button} onClick={handleCreateStaff}>
                Save
              </Button>
            )}
          </Grid>
        </Paper>
      </div>
    </LayoutContainer>
  );
}
