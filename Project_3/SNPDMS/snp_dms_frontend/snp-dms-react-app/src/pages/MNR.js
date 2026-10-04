import React, { useEffect } from "react";
import jwt_decode from "jwt-decode";
import LayoutContainer from "../components/reusableComponents/LayoutContainer";
import MNRGrid from "../components/MNRGrid";
import { useHistory } from "react-router-dom";

const MNR = () => {
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
    <LayoutContainer footer={false}>
      <MNRGrid />
    </LayoutContainer>
  );
};
export default MNR;
