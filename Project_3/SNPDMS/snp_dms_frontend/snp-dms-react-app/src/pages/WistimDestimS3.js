import React, { useEffect } from "react";
import jwt_decode from "jwt-decode";
import LayoutContainer from "../components/reusableComponents/LayoutContainer";
import WistimDestimS3Listing from "../components/WistimDestimS3Listing";
import { useHistory } from "react-router-dom";

const WistimDestimS3 = () => {
  const history = useHistory();
  // Check if the token is expired if yes then push to login
  useEffect(() => {
    var token = localStorage.getItem("accessToken");
    if (token) {
      var decode = jwt_decode(token);

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
    </LayoutContainer>
  );
};
export default WistimDestimS3;
