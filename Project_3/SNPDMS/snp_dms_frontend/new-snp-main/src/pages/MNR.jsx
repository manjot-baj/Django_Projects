import React, { useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import LayoutContainer from "@components/reusablecomponents/LayoutContainer";
import MNRGrid from "../components/MNRGrid";
import { useHistory } from "react-router-dom";
import { custombackDropStyle } from "@/utils/CustomClasses";
import { Backdrop, CircularProgress } from "@mui/material";
import { useSelector } from "react-redux";

const MNR = () => {
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
    <LayoutContainer footer={false}>
      <MNRGrid />
      <Backdrop sx={custombackDropStyle} open={isloading}>
        <CircularProgress color="inherit" />
      </Backdrop>
    </LayoutContainer>
  );
};
export default MNR;
