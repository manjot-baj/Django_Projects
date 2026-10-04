import React from "react";
import LayoutContainer from "@components/reusablecomponents/LayoutContainer";
import PreGateOutList from "../../components/advanceFinance/PreGateOutList";
import { Backdrop, CircularProgress } from "@mui/material";
import { custombackDropStyle } from "@/utils/CustomClasses";
import { useSelector } from "react-redux";

const PreGateOutListing = () => {
    const { isloading } = useSelector((state) => state.ui);
  return (
    <LayoutContainer footer={false}>
      <PreGateOutList />
      <Backdrop sx={custombackDropStyle} open={isloading}>
        <CircularProgress color="inherit" />
      </Backdrop>
    </LayoutContainer>
  );
};

export default PreGateOutListing;
