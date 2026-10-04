import React from "react";
import Logo from "../../assets/images/snp-logo.jpeg";
import {Box, LinearProgress} from "@mui/material";




export default function Loader() {

  return (
    <center>
      <Box sx={{
          alignItems: "center",
          justifyContent: "center",
          // textAlign: "center",
          alignSelf: "center",
          marginTop: window.innerHeight / 3,
      }}>
        <Box component={'img'} sx={(theme)=>({
             width: 200,
             [theme.breakpoints.down("xs")]: { width: 150 },
        })} src={Logo} height={"fit-content"} width={"fit-content"} alt="Main Page Loader" />
        <p>Please wait while we make everything done for you</p>
        <LinearProgress sx={()=>({
            width: "30%",
            [theme.breakpoints.down("xs")]: { width: "70%" },
        })} />
      </Box>
    </center>
  );
}
