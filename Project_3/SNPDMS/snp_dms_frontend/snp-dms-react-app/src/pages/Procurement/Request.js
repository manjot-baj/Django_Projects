import React from "react";
import LayoutContainer from "../../components/reusableComponents/LayoutContainer";
import {  Box } from "@material-ui/core";
import RequestAll from "../../components/Procurement/RequestAll";

const Request = () => {
  return (
    <LayoutContainer footer={false}>
      <Box sx={{ width: "100%", margin: "20px 0",padding:"12px" }}>
        <RequestAll />
      </Box>
    </LayoutContainer>
  );
};

export default Request;
