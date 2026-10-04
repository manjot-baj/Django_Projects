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
  Autocomplete,
  Backdrop,
  CircularProgress,
} from "@mui/material";

import { useHistory } from "react-router-dom";
import LayoutContainer from "@components/reusablecomponents/LayoutContainer";
import { useDispatch, useSelector } from "react-redux";
import {
  addUser,
  updateUser,
  getSingleUser,
} from "../../../actions/Admin/AccountUserMasterActions";
import { dropDownDispatch } from "../../../actions/GateInActions";
import { useSnackbar } from "notistack";
import { theme } from "../../../App";
import { Image } from "semantic-ui-react";
import { custombackDropStyle, customLabelTypography } from "../../../utils/CustomClasses";
import BACKIMAGE from "../../../assets/images/back-arrow.png";

export default function AddUpdateUser(props) {
  const dispatch = useDispatch();
  const history = useHistory();
  const store = useSelector((state) => state);
  const { accountUserMaster, gateIn, user } = store;
  const { isloading } = useSelector((state) => state.ui);
  const [accountFName, setAccountFName] = useState("");
  const [accountLName, setAccountLName] = useState("");
  const [accountUserName, setAccountUserName] = useState("");
  const [accountPassword, setAccountPassword] = useState("");
  const [accountLocation, setAccountLocation] = useState(
    localStorage.getItem("userInfo")
      ? JSON.parse(localStorage.getItem("userInfo")).location
      : ""
  );
  const [accountSite, setAccountSite] = useState(
    localStorage.getItem("userInfo")
      ? JSON.parse(localStorage.getItem("userInfo")).site
      : ""
  );
  const [accountRole, setAccountRole] = useState("");
  const [accountEmail, setAccountEmail] = useState("");
  const [accountMobile, setAccountMobile] = useState("");
  const [ediTrackNotification, setEdiTrackNotification] = useState(false);
  const notify = useSnackbar().enqueueSnackbar;

  useEffect(() => {
    if (props.history.location.state) {
      dispatch(
        getSingleUser(props.history.location.state.allDetails.pk, notify)
      );
    }
  }, []);

  useEffect(() => {
    let reqArray = ["location_site_user_list_and_roles"];

    dispatch(dropDownDispatch(reqArray, notify));
  }, []);

  useEffect(() => {
    if (accountUserMaster.accountUserDetails.pk) {
      setAccountFName(accountUserMaster.accountUserDetails.firstname);
      setAccountLName(accountUserMaster.accountUserDetails.lastname);
      setAccountUserName(accountUserMaster.accountUserDetails.username);
      setAccountPassword(accountUserMaster.accountUserDetails.password);
      setAccountLocation(accountUserMaster.accountUserDetails.location);
      setAccountSite(accountUserMaster.accountUserDetails.site);
      setAccountRole(accountUserMaster.accountUserDetails.role);
      setAccountEmail(accountUserMaster.accountUserDetails.email_id);
      setAccountMobile(accountUserMaster.accountUserDetails.mobile_no);
      setEdiTrackNotification(
        accountUserMaster.accountUserDetails.edi_track_notification
      );
    }
  }, [accountUserMaster.accountUserDetails]);

  const createUser = () => {
    if (accountUserName === "")
      notify("Please Enter User Name", {
        variant: "warning",
      });
    else if (accountPassword === "")
      notify("Please Enter Password", {
        variant: "warning",
      });
    else if (accountLocation === "")
      notify("Please Enter Location", {
        variant: "warning",
      });
    else if (accountSite === "")
      notify("Please Enter Site", {
        variant: "warning",
      });
    else if (accountRole === "")
      notify("Please Enter Role", {
        variant: "warning",
      });
    else if (accountEmail === "")
      notify("Please Enter Email ID", {
        variant: "warning",
      });
    else if (!validateEmail(accountEmail))
      notify("Email ID is incorrect", {
        variant: "warning",
      });
    else if (accountMobile === "")
      notify("Please Enter Mobile No", {
        variant: "warning",
      });
    else if (!validatePhoneNumber(accountMobile)) {
      notify("Mobile Number is incorrect", {
        variant: "warning",
      });
    } else {
      let data = {
        firstname: accountFName,
        lastname: accountLName,
        username: accountUserName,
        password: accountPassword,
        location: accountLocation,
        site: accountSite,
        role: accountRole,
        email_id: accountEmail,
        mobile_no: accountMobile,
        edi_track_notification: ediTrackNotification,
      };
      dispatch(addUser(data, history, notify));
    }
  };

  const updateUserFunc = () => {
    if (accountUserName === "")
      notify("Please Enter User Name", {
        variant: "warning",
      });
    else if (accountPassword === "")
      notify("Please Enter Password", {
        variant: "warning",
      });
    else if (accountLocation === "")
      notify("Please Enter Location", {
        variant: "warning",
      });
    else if (accountSite === "")
      notify("Please Enter Site", {
        variant: "warning",
      });
    else if (accountRole === "")
      notify("Please Enter Role", {
        variant: "warning",
      });
    else if (accountEmail === "")
      notify("Please Enter Email ID", {
        variant: "warning",
      });
    else if (!validateEmail(accountEmail))
      notify("Email ID is incorrect", {
        variant: "warning",
      });
    else if (accountMobile === "")
      notify("Please Enter Mobile No", {
        variant: "warning",
      });
    else if (!validatePhoneNumber(accountMobile)) {
      notify("Mobile Number is incorrect", {
        variant: "warning",
      });
    } else {
      let data = {
        pk: accountUserMaster.accountUserDetails.pk,
        firstname: accountFName,
        lastname: accountLName,
        username: accountUserName,
        password: accountPassword,
        location: accountLocation,
        site: accountSite,
        role: accountRole,
        email_id: accountEmail,
        mobile_no: accountMobile,
        edi_track_notification: ediTrackNotification,
      };
      dispatch(
        updateUser(
          accountUserMaster.accountUserDetails.pk,
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

  function validateEmail(email) {
    var re = /\S+@\S+\.\S+/;
    return re.test(email);
  }

  function validatePhoneNumber(pNo) {
    var phoneNoValidator = /^\d{10}$/;
    if (pNo.match(phoneNoValidator)) {
      return true;
    } else {
      return false;
    }
  }

  return (
    <LayoutContainer footer={false}>
      <div>
        <Image
          src={BACKIMAGE}
          style={{
            height: 40,
            width: 40,
            cursor: "pointer",
          }}
          onClick={handleGoBack}
        />
        <Typography variant="subtitle2">
          <Box fontWeight="fontWeightBold" m={1}>
            {accountUserMaster.accountUserDetails.pk
              ? "Update User"
              : "Add User"}
          </Box>
        </Typography>
        <Paper
          sx={(theme) => ({
            padding: theme.spacing(4, 3),
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
                First Name
              </Typography>

              <TextField
                id="account-user-admin-first-name"
                type={"text"}
                value={accountFName}
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
                onChange={(e) =>
                  setAccountFName(e.target.value.replace(/[^a-z]/gi, ""))
                }
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
                value={accountLName}
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
                onChange={(e) =>
                  setAccountLName(e.target.value.replace(/[^a-z]/gi, ""))
                }
              />
            </Grid>

            <Grid
              item
              size={{ xs: 12, sm: 6, lg: 3 }}
              style={theme.breakpoints.down("sm") && { padding: 7 }}
            >
              <Typography variant="subtitle1" sx={customLabelTypography}>
                Username <span style={{ color: "red" }}>*</span>
              </Typography>

              <TextField
                id="account-user-admin-user-name"
                type={"text"}
                value={accountUserName}
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
                onChange={(e) => setAccountUserName(e.target.value)}
              />
            </Grid>

            <Grid
              item
              size={{ xs: 12, sm: 6, lg: 3 }}
              style={theme.breakpoints.down("sm") && { padding: 7 }}
            >
              <Typography variant="subtitle1" sx={customLabelTypography}>
                Password <span style={{ color: "red" }}>*</span>
              </Typography>

              <TextField
                id="account-user-admin-password"
                type={"password"}
                value={accountPassword}
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
                onChange={(e) => setAccountPassword(e.target.value)}
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
                value={accountLocation}
                variant="outlined"
                fullWidth
                size="small"
                onChange={(e) => {
                  setAccountLocation(e.target.value);
                }}
                disabled={
                  (user.role === "Location Admin" ||
                    user.role === "Site Admin" ||
                    user.role === "Depot User") &&
                  true
                }
              >
                {gateIn.allDropDown &&
                  gateIn.allDropDown.location_site_user_list &&
                  Object.keys(gateIn.allDropDown.location_site_user_list).map(
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
                Site <span style={{ color: "red" }}>*</span>
              </Typography>

              <TextField
                id="account-user-admin-site"
                select
                value={accountSite}
                variant="outlined"
                fullWidth
                size="small"
                onChange={(e) => {
                  setAccountSite(e.target.value);
                }}
                disabled={
                  (user.role === "Site Admin" || user.role === "Depot User") &&
                  true
                }
              >
                {accountLocation !== "" &&
                  gateIn.allDropDown &&
                  gateIn.allDropDown.location_site_user_list &&
                  gateIn.allDropDown.location_site_user_list[
                    accountLocation
                  ].map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
              </TextField>
            </Grid>

            {gateIn.allDropDown && gateIn.allDropDown.roles && (
              <Grid
                item
                size={{ xs: 12, sm: 6, lg: 3 }}
                style={theme.breakpoints.down("sm") && { padding: 7 }}
              >
                <Typography variant="subtitle1" sx={customLabelTypography}>
                  Role <span style={{ color: "red" }}>*</span>
                </Typography>
                <Autocomplete
                  value={accountRole}
                  onChange={(event, newValue) => {
                    setAccountRole(newValue);
                  }}
                  style={{ padding: 0 }}
                  sx={{
                    "& .MuiAutocomplete-inputRoot[class*='MuiOutlinedInput-root']":
                      {
                        padding: 0,
                      },
                  }}
                  options={gateIn.allDropDown.roles.map((option) => option)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      variant="outlined"
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          "& fieldset": {
                            borderColor: "#243545",
                          },
                        },
                      }}
                      onBlur={(e) => {
                        setAccountRole(e.target.value);
                        dispatch({
                          type: gateIn.allDropDown.roles.map((option) => (
                            <MenuItem key={option} value={option}>
                              {option}
                            </MenuItem>
                          )),
                        });
                      }}
                    />
                  )}
                />
              </Grid>
            )}

            <Grid
              item
              size={{ xs: 12, sm: 6, lg: 3 }}
              style={theme.breakpoints.down("sm") && { padding: 7 }}
            >
              <Typography variant="subtitle1" sx={customLabelTypography}>
                Email ID <span style={{ color: "red" }}>*</span>
              </Typography>

              <TextField
                id="account-user-admin-email-id"
                type={"text"}
                value={accountEmail}
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
                onChange={(e) => setAccountEmail(e.target.value)}
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
                value={accountMobile}
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
                onChange={(e) =>
                  setAccountMobile(e.target.value.replace(/[^0-9]/gi, ""))
                }
              />
            </Grid>

            <Grid
              item
              size={{ xs: 12, sm: 6, lg: 4 }}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "25px 18px 8px 10px",
              }}
            >
              <Typography variant="subtitle2">
                EDI Track Notifications?
              </Typography>
              <FormControlLabel
                value="yes"
                control={
                  <Radio
                  
                    checked={ediTrackNotification === true}
                  />
                }
                onClick={() => setEdiTrackNotification(true)}
                label="Yes"
              />
              <FormControlLabel
                value="no"
                control={
                  <Radio
                  
                    checked={ediTrackNotification === false}
                    onClick={() => setEdiTrackNotification(false)}
                  />
                }
                label="No"
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
            {accountUserMaster.accountUserDetails.pk ? (
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
                onClick={updateUserFunc}
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
                onClick={createUser}
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
