import React from "react";
import { Grid } from "@mui/material";
import LayoutContainer from "@components/reusablecomponents/LayoutContainer";
import { useHistory } from "react-router-dom";
import DownloadToolSampleData from "./DownloadToolSampleData";
import ExtractToolData from "./ExtractToolData";
import CustomBackButton from "@components/reusablecomponents/CustomBackButton";



const Bulkupload = () => {
    const history = useHistory();

    const handleGoBack = () => {
        history.goBack();
      };
    
  return (
    <LayoutContainer footer={false}>
      <Grid container>
        <Grid item size={{xs:12}}>
          <CustomBackButton handleGoBack={handleGoBack}
          />
          <DownloadToolSampleData />
          <ExtractToolData />
        </Grid>
      </Grid>
    </LayoutContainer>
  );
};

export default Bulkupload;
