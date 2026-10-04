import React, { useEffect } from "react";

import { Backdrop, CircularProgress, Grid } from "@mui/material";
import LayoutContainer from "@components/reusablecomponents/LayoutContainer";
import DownloadSampleData from "./StockUpload/DownloadSampleData";
import ExtractStockData from "./StockUpload/ExtractStockData";
import { useHistory } from "react-router-dom";
import { useSelector } from "react-redux";
import CustomBackButton from "@components/reusablecomponents/CustomBackButton";
import { custombackDropStyle } from "@/utils/CustomClasses";


export default function StockUploadForm(props) {
  const history = useHistory();
  const { user ,ui} = useSelector((state) => state);

  const handleGoBack = () => {
    history.goBack();
  };

  useEffect(() => {
    if (user.location === "Ludhiana" && user.site === "PGL Depot") {
      history.goBack()
    }
  }, []);

  return (
    <LayoutContainer footer={false}>
      <Grid container>
        <Grid item size={{xs:12}}>
          <CustomBackButton handleGoBack={handleGoBack}
          />
          <DownloadSampleData />
          <ExtractStockData />
        </Grid>
      </Grid>
        <Backdrop sx={custombackDropStyle} open={ui.isloading}>
        <CircularProgress color="inherit" />
      </Backdrop>
    </LayoutContainer>
  );
}
