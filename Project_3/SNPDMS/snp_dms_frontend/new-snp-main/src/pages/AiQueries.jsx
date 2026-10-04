import LayoutContainer from "@/components/reusablecomponents/LayoutContainer";
import { Box, Stack, Grid, Card } from "@mui/material";
import React from "react";

import AnalyticsListingComponent from "@/components/aiAnalysis/AnalyticsListingComponent";
import AiAnalyticsNewPromptComp from "@/components/aiAnalysis/AiAnalyticsNewPromptComp";

const AiQueries = () => {
  return (
    <LayoutContainer >
      <Box
        sx={{
          display: "flex",
          alignItems: "column",
          justifyContent: "center",
          height: "calc(100vh - 100px)",
          overflowY:"hidden"
        }}
        component={Grid}
        container
        spacing={2}
      >
        <Grid
          item
          size={{ xs: 3 }}
          component={Card}
          elevation={1}
          sx={(theme) => ({
            borderRadius: 2,
            padding: 2,
            mt:0.1,
            height:"calc(100vh - 100px)"
          })}
        
        >
          <AnalyticsListingComponent />
        </Grid>
        <Grid
          item
          size={{ xs: 9 }}
          component={Stack}
          direction={"column"}
          alignItems={"center"}
          justifyContent={"center"}
          sx={{ mt: -20, position: "relative" }}
          spacing={1}
        >
          <AiAnalyticsNewPromptComp />
        </Grid>
      </Box>
    </LayoutContainer>
  );
};

export default AiQueries;
