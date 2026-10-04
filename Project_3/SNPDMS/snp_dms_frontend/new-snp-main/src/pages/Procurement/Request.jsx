import React from "react";
import LayoutContainer from "@components/reusablecomponents/LayoutContainer";
import {  Backdrop, Box, CircularProgress } from "@mui/material";
import RequestAll from "../../components/Procurement/RequestAll";
import { custombackDropStyle } from "@/utils/CustomClasses";
import { useSelector } from "react-redux";

const Request = () => {
    const { isloading } = useSelector((state) => state.ui);
  return (
    <LayoutContainer footer={false}>
      <Box sx={{ width: "100%", margin: "20px 0",padding:"12px" }}>
        <RequestAll />
      </Box>
       <Backdrop sx={custombackDropStyle} open={isloading}>
        <CircularProgress color="inherit" />
      </Backdrop>
    </LayoutContainer>
  );
};

export default Request;
