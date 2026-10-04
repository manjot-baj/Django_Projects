
import {
  Typography,
  Paper,
  Grid,
  Box,
} from "@mui/material";
import { Image } from "semantic-ui-react";
import ForgotPasswordForm from "../forms/ForgotPasswordForm";
import { useHistory } from "react-router-dom";
import CONTAINERIMAGE from '../assets/images/login-containers.svg'
import LOGO from '../assets/images/snp-logo.jpeg'

const ForgotPassword = () => {

  let history = useHistory();
  return (
    <Box
      sx={(theme) => ({
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
            // alignItems: "center",
          },
        })}
      >
        <Grid item size={{xs:12,sm:12,md:5,lg:4}} >
          <Paper
            sx={(theme) => ({
              marginTop: "3rem",

              padding: theme.spacing(4.5, 2),

              [theme.breakpoints.down("sm")]: {
                marginTop: "unset",
                // marginLeft: 0,
              },
              [theme.breakpoints.down("md")]: {
                // marginLeft: 20,
              },
            })}
            elevation={0}
          >
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
                src={LOGO}
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
       
          <Grid item xs={false} sm={false} size={{md:4,lg:6}} >
            <Image
              src={CONTAINERIMAGE}
              style={{
                height: 600,
                // [theme.breakpoints.down("md")]: {
                //   height: 500,
                //   marginLeft: "-140px",
                // },
              }}
            />
          </Grid>
       
      </Box>
    </Box>
  );
};

export default ForgotPassword;
