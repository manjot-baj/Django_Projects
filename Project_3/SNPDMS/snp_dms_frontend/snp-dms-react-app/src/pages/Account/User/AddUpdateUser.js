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
  addUser,
  updateUser,
  getSingleUser,
} from "../../../actions/Admin/AccountUserMasterActions";
import { dropDownDispatch } from "../../../actions/GateInActions";
import { useSnackbar } from "notistack";
import { theme } from "../../../App";
import { Image } from "semantic-ui-react";
import Autocomplete from "@material-ui/lab/Autocomplete";

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
  autocomplete: {
    "& .MuiAutocomplete-inputRoot[class*='MuiOutlinedInput-root']": {
      padding: 0,
    },
  },
}));

export default function AddUpdateUser(props) {
  const classes = useStyles();
  const dispatch = useDispatch();
  const history = useHistory();
  const store = useSelector((state) => state);
  const { accountUserMaster, gateIn, user } = store;
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
          src={require("../../../assets/images/back-arrow.png")}
          className={classes.backImage}
          onClick={handleGoBack}
        />
        <Typography variant="subtitle2">
          <Box fontWeight="fontWeightBold" m={1}>
            {accountUserMaster.accountUserDetails.pk
              ? "Update User"
              : "Add User"}
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
                First Name
              </Typography>

              <TextField
                id="account-user-admin-first-name"
                type={"text"}
                value={accountFName}
                variant="outlined"
                fullWidth
                className={classes.textField}
                inputProps={{ className: classes.input }}
                onChange={(e) =>
                  setAccountFName(e.target.value.replace(/[^a-z]/gi, ""))
                }
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
                value={accountLName}
                variant="outlined"
                fullWidth
                className={classes.textField}
                inputProps={{ className: classes.input }}
                onChange={(e) =>
                  setAccountLName(e.target.value.replace(/[^a-z]/gi, ""))
                }
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
                Username <span style={{ color: "red" }}>*</span>
              </Typography>

              <TextField
                id="account-user-admin-user-name"
                type={"text"}
                value={accountUserName}
                variant="outlined"
                fullWidth
                className={classes.textField}
                inputProps={{ className: classes.input }}
                onChange={(e) => setAccountUserName(e.target.value)}
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
                Password <span style={{ color: "red" }}>*</span>
              </Typography>

              <TextField
                id="account-user-admin-password"
                type={"password"}
                value={accountPassword}
                variant="outlined"
                fullWidth
                className={classes.textField}
                inputProps={{ className: classes.input }}
                onChange={(e) => setAccountPassword(e.target.value)}
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
                value={accountLocation}
                variant="outlined"
                fullWidth
                inputProps={{ className: classes.input }}
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
                value={accountSite}
                variant="outlined"
                fullWidth
                inputProps={{ className: classes.input }}
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
                <Autocomplete
                  value={accountRole}
                  onChange={(event, newValue) => {
                    setAccountRole(newValue);
                  }}
                  style={{ padding: 0 }}
                  className={classes.autocomplete}
                  options={gateIn.allDropDown.roles.map((option) => option)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      variant="outlined"
                      className={classes.textField}
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
              xs={12}
              sm={6}
              lg={3}
              style={theme.breakpoints.down("sm") && { padding: 7 }}
            >
              <Typography
                variant="subtitle1"
                className={classes.LabelTypography}
              >
                Email ID <span style={{ color: "red" }}>*</span>
              </Typography>

              <TextField
                id="account-user-admin-email-id"
                type={"text"}
                value={accountEmail}
                variant="outlined"
                fullWidth
                className={classes.textField}
                inputProps={{ className: classes.input }}
                onChange={(e) => setAccountEmail(e.target.value)}
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
                value={accountMobile}
                variant="outlined"
                fullWidth
                className={classes.textField}
                inputProps={{ className: classes.input }}
                onChange={(e) =>
                  setAccountMobile(e.target.value.replace(/[^0-9]/gi, ""))
                }
              />
            </Grid>

            <Grid
              item
              xs={12}
              sm={6}
              lg={4}
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
                    style={{ color: "#2A5FA5" }}
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
                    style={{ color: "#2A5FA5" }}
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
              marginTop: 20,
            }}
          >
            {accountUserMaster.accountUserDetails.pk ? (
              <Button className={classes.button} onClick={updateUserFunc}>
                Update
              </Button>
            ) : (
              <Button className={classes.button} onClick={createUser}>
                Save
              </Button>
            )}
          </Grid>
        </Paper>
      </div>
    </LayoutContainer>
  );
}