import React, { useState, useRef } from "react";
import { Formik, Form, Field } from "formik";
import { TextField } from "formik-material-ui";
import { Redirect } from "react-router-dom";
import SwipeableViews from "react-swipeable-views";
import useTheme from "@material-ui/core/styles/useTheme";
import { useSnackbar } from "notistack";

import {
  makeStyles,
  Typography,
  Box,
  // InputAdornment,
  // IconButton,
  // FormControlLabel,
  // Checkbox,
  Button,
  LinearProgress,
  TextField as Input,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@material-ui/core";
// import Visibility from "@material-ui/icons/Visibility";
// import VisibilityOff from "@material-ui/icons/VisibilityOff";
import { useDispatch, useSelector } from "react-redux";
import { Link, useHistory } from "react-router-dom";
import { resetPasswordDispatch } from "../actions/AuthActions";

const useStyles = makeStyles((theme) => ({
  formContainer: {
    marginTop: "1rem",
  },
  fieldLabel: {
    color: "#243545",
    size: 14,
    paddingBottom: 6,
    paddingTop: "0.75rem",
    fontWeight: 600,
  },
  inputField: {
    padding: 10,
  },
  submitButton: {
    backgroundColor: "#2A5FA5",
    color: "#fff",
    borderRadius: 6,
    width: "100%",
    textAlign: "center",
    marginTop: 30,
    "&:hover": {
      backgroundColor: "#2A5FA5",
    },
  },
}));

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`full-width-tabpanel-${index}`}
      aria-labelledby={`full-width-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box p={3}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

const ForgotPasswordForm = () => {
  // Hooks_______________________________________________________

  const classes = useStyles();
  //   const history = useHistory();
  const dispatch = useDispatch();
  const uiReducer = useSelector((state) => state.ui);
  const history = useHistory();
  const theme = useTheme();

  const otp = useRef();
  const email = useRef();
  const newpass = useRef();
  const confirmpass = useRef();

  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(0);
  const [toLogin, redirectToLogin] = useState(false);

  const pushNotif = useSnackbar().enqueueSnackbar;
  // Handlers________________________________________________________:

  const handleSubmit = (data, actions) => {
    dispatch(resetPasswordDispatch(data, actions, history, pushNotif));
  };

  const handleClickOpen = () => {
    let emaL = email.current.value; // {"successMsg":"Otp Sent"}

    fetch("https://staging-api.decomans.com/account/get_otp/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({ email_id: emaL }),
    })
      .then((resp) => resp.json())
      .then((data) => {
        try {
          if (data.successMsg.startsWith("Otp Sent")) {
            setOpen(true);
            setValue(0);
            pushNotif("OTP sent to " + emaL + "!", { variant: "success" });
          }
        } catch (e) {
          pushNotif(data.errorMsg, { variant: "error" });
        }
      });
  };

  const handleVerify = () => {
    let info = { email_id: email.current.value, otp: otp.current.value }; // {"successMsg":"Otp Verified"}
    fetch("https://staging-api.decomans.com/account/verify_otp/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify(info),
    })
      .then((resp) => resp.json())
      .then((data) => {
        if (data.successMsg === "Otp Verified") {
          setValue(1);
          pushNotif("OTP verified successfully!", { variant: "success" });
        } else pushNotif(data.errorMsg, { variant: "error" });
      })
      .catch((err) => pushNotif(err.errorMsg, { variant: "error" }));
  };

  const reset = () => {
    let newP = newpass.current.value;
    let confirmP = confirmpass.current.value;
    if (newP !== confirmP)
      return pushNotif("Passwords do not match", {
        variant: "error",
      });
    let info = {
      email_id: email.current.value,
      password: newP,
    }; // {"successMsg":"Otp Verified"}
    fetch("https://staging-api.decomans.com/account/reset_password/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify(info),
    })
      .then((resp) => resp.json())
      .then((data) => {
        if (data.successMsg === "Password Reset is Completed") {
          pushNotif(data.successMsg, { variant: "success" });
          redirectToLogin(true);
        } else
          pushNotif(JSON.stringify(data), {
            variant: "error",
          });
      })
      .catch((err) => pushNotif(err.errorMsg, { variant: "error" }));
    // setOpen(false);
  };

  const handleClose = () => setOpen(false);

  // View__________________________________________________________:

  if (toLogin) return <Redirect to="/login" />;

  return (
    <>
      <Formik
        // enableReinitialize={true}
        initialValues={{
          username: "",
          password: "",
          confirmPassword: "",
        }}
        validate={(values) => {
          const errors = {};
          if (!values.username) {
            errors.username = "Required";
          }
          if (!values.password) {
            errors.password = "Required";
          }

          if (!values.confirmPassword) {
            errors.confirmPassword = "Required";
          }
          if (values.confirmPassword !== values.password) {
            errors.confirmPassword = "Password Doesnt match";
          }
          return errors;
        }}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting, values, submitForm }) => (
          <Form className={classes.formContainer}>
            <Typography className={classes.fieldLabel} variant="subtitle2">
              Enter email
            </Typography>
            <Field
              component={TextField}
              name="username"
              value={values.username}
              fullWidth
              type="text"
              variant="outlined"
              autoComplete="username"
              autoFocus
              inputProps={{ className: classes.inputField, ref: email }}
              placeholder="user@example.com"
            />

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center ",
              }}
            >
              <Link to="/login">
                <Typography variant="caption">Back</Typography>
              </Link>
            </div>
            {uiReducer.errorMessage && (
              <>
                <br />
                <Typography
                  variant="subtitle2"
                  style={{ textAlign: "center", color: "red" }}
                >
                  {uiReducer.errorMessage}
                </Typography>
              </>
            )}
            {isSubmitting && <LinearProgress style={{ marginTop: 12 }} />}
            <br />
            {/* <Button className={classes.submitButton} onClick={submitForm}> */}
            <Button className={classes.submitButton} onClick={handleClickOpen}>
              Get OTP
            </Button>

            <SwipeableViews
              axis={theme.direction === "rtl" ? "x-reverse" : "x"}
              index={value}
              onChangeIndex={setValue}
            >
              <TabPanel value={value} index={0} dir={theme.direction}>
                <Dialog
                  open={open}
                  onClose={handleClose}
                  aria-labelledby="form-dialog-title"
                >
                  <DialogTitle id="form-dialog-title">
                    Verify it's you
                  </DialogTitle>
                  <DialogContent>
                    <DialogContentText color="grey">
                      We have sent the OTP to your mails. Please check the mails
                      and verify OTP.
                    </DialogContentText>
                    <Input
                      autoFocus
                      margin="dense"
                      id="otp"
                      label="Enter OTP"
                      type="text"
                      fullWidth
                      inputProps={{ ref: otp }}
                    />
                  </DialogContent>
                  <DialogActions>
                    <Button onClick={handleClose} color="primary">
                      Cancel
                    </Button>
                    <Button onClick={handleVerify} color="primary">
                      Verify
                    </Button>
                  </DialogActions>
                </Dialog>
              </TabPanel>

              <TabPanel value={value} index={1} dir={theme.direction}>
                <Dialog
                  open={open}
                  onClose={handleClose}
                  aria-labelledby="form-dialog-title"
                >
                  <DialogTitle id="form-dialog-title">
                    Reset Password
                  </DialogTitle>

                  <DialogContent>
                    <DialogContentText color="grey">
                      Enter a new password.
                    </DialogContentText>
                    <Input
                      autoFocus
                      margin="dense"
                      id="otp"
                      label="New Password"
                      type="text"
                      fullWidth
                      inputProps={{ ref: newpass }}
                    />
                    <Input
                      autoFocus
                      margin="dense"
                      id="otp"
                      label="Confirm New Password"
                      type="text"
                      fullWidth
                      inputProps={{ ref: confirmpass }}
                    />
                  </DialogContent>

                  <DialogActions>
                    <Button className={classes.submitButton} onClick={reset}>
                      Reset Password
                    </Button>
                  </DialogActions>
                </Dialog>
              </TabPanel>
            </SwipeableViews>
          </Form>
        )}
      </Formik>
    </>
  );
};

export default ForgotPasswordForm;
