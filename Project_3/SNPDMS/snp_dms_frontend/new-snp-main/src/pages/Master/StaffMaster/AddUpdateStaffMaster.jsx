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
  addStaffMaster,
  updateStaffMaster,
  getSingleStaffMaster,
} from "../../../actions/master/StaffMasterAction";
import { dropDownDispatch } from "../../../actions/GateInActions";
import { useSnackbar } from "notistack";
import { theme } from "../../../App";
import CustomBackButton from "@components/reusablecomponents/CustomBackButton";
import { custombackDropStyle, customLabelTypography } from "../../../utils/CustomClasses";

export default function AddUpdateLocation(props) {
  const dispatch = useDispatch();
  const history = useHistory();
  const store = useSelector((state) => state);
  const { staffMaster, gateIn, user } = store;
  const [staffFname, setStaffFname] = useState("");
  const [staffLname, setStaffLname] = useState("");
  const [qualification, setQualification] = useState("");
  const { isloading } = useSelector((state) => state.ui);

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
        <CustomBackButton handleGoBack={handleGoBack} />
        <Typography variant="subtitle2">
          <Box fontWeight="fontWeightBold" m={1}>
            {staffMaster.staffMasterDetails.pk
              ? "Update Staff Master"
              : "Add Staff Master"}
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
                First Name <span style={{ color: "red" }}>*</span>
              </Typography>

              <TextField
                id="staff-master-staff-first-name"
                type={"text"}
                value={staffFname}
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
                onChange={(e) => handleStaffNameChange(e)}
              />
            </Grid>
            <Grid
              item
              size={{ xs: 12, sm: 6, lg: 3 }}
              style={theme.breakpoints.down("sm") && { padding: 7 }}
            >
              <Typography variant="subtitle1" sx={customLabelTypography}>
                Last Name
              </Typography>

              <TextField
                id="account-user-admin-last-name"
                type={"text"}
                value={staffLname}
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
                onChange={(e) => handleStaffLNameChange(e)}
              />
            </Grid>

            <Grid
              item
              size={{ xs: 12, sm: 6, lg: 3 }}
              style={theme.breakpoints.down("sm") && { padding: 7 }}
            >
              <Typography variant="subtitle1" sx={customLabelTypography}>
                Location <span style={{ color: "red" }}>*</span>
              </Typography>

              <TextField
                id="account-user-admin-location"
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
              size={{ xs: 12, sm: 6, lg: 3 }}
              style={theme.breakpoints.down("sm") && { padding: 7 }}
            >
              <Typography variant="subtitle1" sx={customLabelTypography}>
                Site <span style={{ color: "red" }}>*</span>
              </Typography>

              <TextField
                id="account-user-admin-site"
                select
                value={staffSite}
                variant="outlined"
                fullWidth
                size="small"
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
              size={{ xs: 12, sm: 6, lg: 3 }}
              style={theme.breakpoints.down("sm") && { padding: 7 }}
            >
              <Typography variant="subtitle1" sx={customLabelTypography}>
                Role <span style={{ color: "red" }}>*</span>
              </Typography>

              <TextField
                id="account-user-admin-role"
                select
                value={staffRole}
                variant="outlined"
                fullWidth
                size="small"
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
              size={{ xs: 12, sm: 6, lg: 3 }}
              style={theme.breakpoints.down("sm") && { padding: 7 }}
            >
              <Typography variant="subtitle1" sx={customLabelTypography}>
                Qualification
              </Typography>

              <TextField
                id="account-user-admin-user-name"
                type={"text"}
                value={qualification}
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
                onChange={(e) => setQualification(e.target.value)}
              />
            </Grid>

            <Grid
              item
              size={{ xs: 12, sm: 6, lg: 3 }}
              style={theme.breakpoints.down("sm") && { padding: 7 }}
            >
              <Typography variant="subtitle1" sx={customLabelTypography}>
                Email ID
              </Typography>

              <TextField
                id="account-user-admin-email-id"
                type={"text"}
                value={staffEmail}
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
                onChange={(e) => setStaffEmail(e.target.value)}
              />
            </Grid>

            <Grid
              item
              size={{ xs: 12, sm: 6, lg: 3 }}
              style={theme.breakpoints.down("sm") && { padding: 7 }}
            >
              <Typography variant="subtitle1" sx={customLabelTypography}>
                Mobile No <span style={{ color: "red" }}>*</span>
              </Typography>

              <TextField
                id="account-user-admin-mobile-no"
                type={"text"}
                value={staffMobile}
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
                onChange={(e) => setStaffMobile(e.target.value)}
              />
            </Grid>
          </Grid>

          <Grid
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              marginTop: 4,
            }}
          >
            {staffMaster.staffMasterDetails.pk ? (
              <Button   variant="contained"
              color="primary"
                sx={{
                  fontSize: 12.5,
                  borderRadius: 2,
                  marginLeft: "auto",
                  marginRight: "auto",
                  marginTop: 4,
                  width: "35%",
              
                }}
                onClick={handleUpdateStaff}
              >
                Update
              </Button>
            ) : (
              <Button  variant="contained"
              color="primary"
                sx={{
                  fontSize: 12.5,
                  borderRadius: 2,
                  marginLeft: "auto",
                  marginRight: "auto",
                  marginTop: 4,
                  width: "35%",
                
                }}
                onClick={handleCreateStaff}
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
