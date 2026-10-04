import React, { useEffect } from "react";
import {jwtDecode} from "jwt-decode";
import LayoutContainer from "@components/reusablecomponents/LayoutContainer";
import WistimDestimS3Listing from "../components/WistimDestimS3Listing";
import { useHistory } from "react-router-dom";
import { Backdrop, CircularProgress } from "@mui/material";
import { custombackDropStyle } from "@/utils/CustomClasses";
import { useSelector } from "react-redux";

const WistimDestimS3 = () => {
  const history = useHistory();
  const { isloading } = useSelector((state) => state.ui);
  // Check if the token is expired if yes then push to login
  useEffect(() => {
    var token = localStorage.getItem("accessToken");
    if (token) {
      var decode = jwtDecode(token);

      if (decode.exp < new Date().getTime() / 1000) {
        history.push("/login");
      }
    } else {
      history.push("/login");
    }
  }, []);

  return (
    <LayoutContainer>
      <WistimDestimS3Listing />
         <Backdrop sx={custombackDropStyle} open={isloading}>
        <CircularProgress color="inherit" />
      </Backdrop>
    </LayoutContainer>
  );
};
export default WistimDestimS3;
