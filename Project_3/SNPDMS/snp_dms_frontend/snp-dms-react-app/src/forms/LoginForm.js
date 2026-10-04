import React from "react";
import { Formik, Form, Field } from "formik";
import { TextField } from "formik-material-ui";
import {
  makeStyles,
  Typography,
  InputAdornment,
  IconButton,
  FormControlLabel,
  Checkbox,
  Button,
  LinearProgress,
} from "@material-ui/core";
import Visibility from "@material-ui/icons/Visibility";
import VisibilityOff from "@material-ui/icons/VisibilityOff";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { loginUserDispatch } from "../actions/AuthActions";
import CheckBoxIcon from "@material-ui/icons/CheckBox";
import { useSnackbar } from "notistack";
var CryptoJS = require("crypto-js");

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

const LoginForm = (props) => {
  const { history } = props;
  const classes = useStyles();
  //   const history = useHistory();
  const dispatch = useDispatch();
  const uiReducer = useSelector((state) => state.ui);
  const [showPassword, setShowPassword] = React.useState(false);
  const [rememberMe, setRememberMe] = React.useState(false);
  const [password, setPassword] = React.useState("");
  const notify = useSnackbar().enqueueSnackbar;
  const handleClickShowPassword = () => setShowPassword((prev) => !prev);
  const handleSubmit = (data, actions) => {
    dispatch(loginUserDispatch(data, actions, history, rememberMe, notify));
  };

  // checking if remember me was checked
  React.useEffect(() => {
    if (localStorage.getItem("isRemember") === null) {
      localStorage.setItem("isRemember", false);
    } else {
      setRememberMe(JSON.parse(localStorage.getItem("isRemember")));
    }
  }, []);

  // if remember me wasa checked then prefil the values else dont
  React.useEffect(() => {
    if (JSON.parse(localStorage.getItem("isRemember")) === true) {
      var bytes = CryptoJS.AES.decrypt(
        localStorage.getItem("pwd"),
        "secret key 123"
      );
      var originalText = bytes.toString(CryptoJS.enc.Utf8);

      setPassword(originalText);
    } else {
      localStorage.removeItem("pwd");
    }
  }, []);

  return (
    <Formik
      enableReinitialize={true}
      initialValues={{
        username: JSON.parse(localStorage.getItem("isRemember"))
          ? localStorage.getItem("userName")
          : "",
        password: password,
      }}
      validate={(values) => {
        const errors = {};
        if (!values.username) {
          errors.username = "Required";
        }

        if (!values.password) {
          errors.password = "Required";
        }
        return errors;
      }}
      onSubmit={handleSubmit}
    >
      {({ isSubmitting, values, submitForm }) => (
        <Form className={classes.formContainer}>
          <Typography className={classes.fieldLabel} variant="subtitle2">
            Username
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
            inputProps={{ className: classes.inputField }}
          />
          <Typography className={classes.fieldLabel} variant="subtitle2">
            Password
          </Typography>
          <Field
            component={TextField}
            name="password"
            value={values.password}
            fullWidth
            type={showPassword ? "text" : "password"}
            variant="outlined"
            autoComplete="password"
            inputProps={{ className: classes.inputField }}
            InputProps={{
              // <-- This is where the toggle button is added.
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={handleClickShowPassword}
                    //   onMouseDown={handleMouseDownPassword}
                  >
                    {showPassword ? <Visibility /> : <VisibilityOff />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center ",
            }}
          >
            <FormControlLabel
              control={
                <Checkbox
                  checked={rememberMe}
                  name="rememberMe"
                  inputProps={{ "aria-label": "secondary checkbox" }}
                  onChange={() => setRememberMe((prev) => !prev)}
                  color="primary"
                  style={{ color: "#2A5FA5" }}
                  checkedIcon={<CheckBoxIcon color="primary" />}
                />
              }
              label="Remember Me"
              // style={{ width: "100%" }}
            />

            <Link to="/forgot-password">
              <Typography variant="caption">Forgot password</Typography>
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
          <Button className={classes.submitButton} onClick={submitForm}>
            Login
          </Button>
        </Form>
      )}
    </Formik>
  );
};

export default LoginForm;
