import React from "react";
import { Typography, Paper, Grid, Box } from "@mui/material";
import { Image } from "semantic-ui-react";
import LoginForm from "../forms/LoginForm";
import { useHistory } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import ContainerImage from '../assets/images/login-containers.svg'
import LogoImage from '../assets/images/snp-logo.jpeg'

const Login = () => {

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
    <Box
      sx={(theme) => ({
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
      })}
    >
      <Box
        sx={(theme) => ({
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
        })}
        component={Grid}
        container
      >
        <Grid item size={{xs:12,sm:12,md:5,lg:4}}  >
          <Paper
            sx={(theme) => ({
              marginTop: "3rem",
              padding: theme.spacing(4.5, 2),
              [theme.breakpoints.down("sm")]: {
                marginTop: "unset",
              },
              [theme.breakpoints.down("md")]: {},
            })}
            elevation={0}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                flexDirection: "column",
              }}
            >
              <img
                src={LogoImage}
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

        <Grid item size={{xs:12,sm:12,md:6,lg:6}}  >
          <Image
            src={ContainerImage}
            alt="side image"
            style={{width:"70%"}}
          />
        </Grid>
      </Box>
    </Box>
  );
};

export default Login;
