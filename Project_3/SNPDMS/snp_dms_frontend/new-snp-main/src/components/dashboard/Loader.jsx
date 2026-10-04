import React from "react";
import Logo from "../../assets/images/snp-logo.jpeg";
import { Box, LinearProgress, Typography } from "@mui/material";

export default function Loader() {
  return (
    <center>
      <Box
        sx={{
          alignItems: "center",
          justifyContent: "center",
          // textAlign: "center",
          height: "100vh",
          width: "100%",
          backgroundColor: "white",
          display: "flex",
        }}
      >
        <div>
          <Box
            component={"img"}
            sx={(theme) => ({
              width: 200,
              [theme.breakpoints.down("sm")]: { width: 150, marginBottom: 4 },
            })}
            src={Logo}
            alt="Main Page Loader"
          />
          <Typography sx={(theme)=>({
            [theme.breakpoints.down('sm')]:{
              width:"90%"
            }
          })}>Please wait while we make everything done for you</Typography>
          <LinearProgress
            sx={(theme) => ({
              width: "90%",
              marginTop:2,
              [theme.breakpoints.down("sm")]: { width: "70%", marginTop: 2 },
            })}
          />
        </div>
      </Box>
    </center>
  );
}
