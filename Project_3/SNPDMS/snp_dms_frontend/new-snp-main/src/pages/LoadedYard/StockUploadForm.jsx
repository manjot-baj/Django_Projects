import React from "react";
import { Backdrop, CircularProgress, Grid } from "@mui/material";
import LayoutContainer from "@components/reusablecomponents/LayoutContainer";
import DownloadStockSampleData from "../LoadedStock/DownloadStockSampleData";
import ExtractStockData from "../LoadedStock/ExtractStockData";
import { useHistory } from "react-router-dom";
import CustomBackButton from "@components/reusablecomponents/CustomBackButton";
import { useSelector } from "react-redux";
import { custombackDropStyle } from "@/utils/CustomClasses";

export default function MnrUploadForm(props) {
  const history = useHistory();
  const { isloading } = useSelector((state) => state.ui);

  const handleGoBack = () => {
    history.goBack();
  };

  return (
    <LayoutContainer footer={false}>
      <Grid container>
        <Grid item size={{ xs: 12 }}>
          <CustomBackButton handleGoBack={handleGoBack} />
          <DownloadStockSampleData />
          <ExtractStockData />
        </Grid>
      </Grid>
      <Backdrop sx={custombackDropStyle} open={isloading}>
        <CircularProgress color="inherit" />
      </Backdrop>
    </LayoutContainer>
  );
}
