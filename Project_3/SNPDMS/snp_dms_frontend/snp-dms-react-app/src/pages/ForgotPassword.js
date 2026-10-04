import React from "react";
import { makeStyles, Typography, Paper, Grid, Hidden } from "@material-ui/core";
import { Image } from "semantic-ui-react";
import ForgotPasswordForm from "../forms/ForgotPasswordForm";
import { useHistory } from "react-router-dom";

const useStyles = makeStyles((theme) => ({
  rootDiv: {
    margin: "0 auto",
    backgroundColor: "#EAF0F5",
    minHeight: "100vh",
    paddingLeft: "5%",
    paddingRight: "5%",
    display: "flex",

    [theme.breakpoints.down("sm")]: {
      paddingRight: "0%",
      paddingLeft: "0%",
      minHeight: "unset",
    },
    [theme.breakpoints.down("md")]: {
      paddingRight: "0%",
      paddingLeft: "0%",
      // minHeight: "100vh",
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
      // alignItems: "center",
    },
  },

  LoginGridContainer: {
    [theme.breakpoints.down("sm")]: {
      // display: "unset",
      // flexDirection: "column",
      // alignItems: "center",
      // justifyContent: "center",
    },
    [theme.breakpoints.down("md")]: {
      // display: "flex",
      // flexDirection: "column",
      // alignItems: "center",
      // justifyContent: "center",
    },
  },
  Paper: {
    marginTop: "3rem",

    padding: theme.spacing(4.5, 2),

    [theme.breakpoints.down("sm")]: {
      marginTop: "unset",
      // marginLeft: 0,
    },
    [theme.breakpoints.down("md")]: {
      // marginLeft: 20,
    },
  },
  ContainerImage: {
    height: 600,
    [theme.breakpoints.down("md")]: { height: 500, marginLeft: "-140px" },
  },
}));

const ForgotPassword = () => {
  const classes = useStyles();
  let history = useHistory();
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
                // backgroundColor: "#EAF0F5",
                // padding: "1rem",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                flexDirection: "column",
              }}
            >
              <img
                src={require("../assets/images/snp-logo.jpeg")}
                style={{ width: "30%" }}
                alt="Normal Logo"
              />
              <Typography variant="h6">
                {" "}
                Sun & Pearls IT Solutions Pvt. Ltd.
              </Typography>
            </div>
            {/* <Typography
                variant="h6"
                style={{ fontWeight: 600, paddingTop: "2rem", color: "#243545" }}
              >
                Welcome Back!
              </Typography>
              <Typography
                variant="subtitle2"
                style={{ fontWeight: 600, paddingTop: "0.25rem" }}
              >
                Login
              </Typography> */}
            <ForgotPasswordForm history={history} />
          </Paper>
        </Grid>
        <Hidden smDown>
          <Grid item xs={false} sm={false} md={4} lg={6}>
            <Image
              src={require("../assets/images/login-containers.svg")}
              className={classes.ContainerImage}
            />
          </Grid>
        </Hidden>
      </div>
    </div>
  );
};

export default ForgotPassword;
