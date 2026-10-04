import React from "react";
import { makeStyles, Typography, Paper, Grid, Hidden } from "@material-ui/core";
import { Image } from "semantic-ui-react";
import LoginForm from "../forms/LoginForm";
import { useHistory } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

const useStyles = makeStyles((theme) => ({
  rootDiv: {
    margin: "0 auto",
    backgroundColor: "#EAF0F5",
    minHeight: "100vh",
    paddingLeft: "5%",
    paddingRight: "10%",
    display: "flex",

    [theme.breakpoints.down("sm")]: {
      paddingRight: "0%",
      paddingLeft: "0%",
      minHeight: "unset",
    },
    [theme.breakpoints.down("md")]: {
      paddingRight: "0%",
      paddingLeft: "0%",
    },
  },
  loginPaperWrapper: {
    width: "100%",
    margin: "0 auto",
    display: "flex",
    justifyContent: "space-between",
    [theme.breakpoints.down("sm")]: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
    },
    [theme.breakpoints.down("md")]: {
      display: "flex",
      flexDirection: "row",
    },
  },

  LoginGridContainer: {
    [theme.breakpoints.down("sm")]: {},
    [theme.breakpoints.down("md")]: {},
  },
  Paper: {
    marginTop: "3rem",
    padding: theme.spacing(4.5, 2),
    [theme.breakpoints.down("sm")]: {
      marginTop: "unset",
    },
    [theme.breakpoints.down("md")]: {},
  },
  ContainerImage: {
    height: 600,
    [theme.breakpoints.down("md")]: { height: 500, marginLeft: "-140px" },
  },
}));

const Login = () => {
  const classes = useStyles();
  let history = useHistory();
  const dispatch = useDispatch();
  const store = useSelector((state) => state);

  
  React.useEffect(() => {
    localStorage.clear();
    dispatch({ type: "LOGIN_FAILED_RESET" });
  
// eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  React.useEffect(() => {
    if (store.ui.loginFailed) {
      history.push({
        pathname: "/Unathorized",
      });
    }
   
// eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store.ui.loginFailed]);
  return (
    <div className={classes.rootDiv}>
      <div className={classes.loginPaperWrapper}>
        <Grid
          item
          xs={12}
          sm={12}
          md={5}
          lg={4}
          className={classes.LoginGridContainer}
        >
          <Paper className={classes.Paper} elevation={0}>
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                flexDirection: "column",
              }}
            >
              <img
                src={require("../assets/images/snp-logo.jpeg")}
                style={{ width: "30%" }}
                alt="logo"
                width={""} 
                height={""}
              />
              <Typography variant="h6">
                Sun & Pearls IT Solutions Pvt. Ltd.
              </Typography>
            </div>
            <LoginForm history={history} />
          </Paper>
        </Grid>
        <Hidden smDown>
          <Grid item xs={false} sm={false} md={4} lg={6}>
            <Image
              src={require("../assets/images/login-containers.svg")}
              className={classes.ContainerImage}
              width={""} height={""}
              alt="side image"
            />
          </Grid>
        </Hidden>
      </div>
    </div>
  );
};

export default Login;
