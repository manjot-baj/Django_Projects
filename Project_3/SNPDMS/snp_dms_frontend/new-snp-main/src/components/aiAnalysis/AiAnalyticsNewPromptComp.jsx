import { Stack, Typography, Box } from "@mui/material";
import React, { useState } from "react";
import { Image } from "semantic-ui-react";

import AI_NOT_FOUND_IMAGE from "@/assets/images/ai_no_result.png";

import AiAnalyticsSinglePromptComp from "./AiAnalyticsSinglePromptComp";
import { Route, Switch, useRouteMatch } from "react-router-dom";
import AiAnalyticsNewPromptDefaultComp from "./AiAnalyticsNewPromptDefaultComp";

const AiAnalyticsNewPromptComp = () => {
  const { path, url } = useRouteMatch();

  const [isNotFoundData, setIsNotFoundData] = useState(false);

  return (
    <Box
      sx={{
        position: "relative",
        height: "100%",
        width: "100%",
        mt: 20,
        p: 2,
        borderRadius: 2,
      }}
    >
      {isNotFoundData && (
        <Stack
          direction={"column"}
          alignItems={"center"}
          justifyContent={"center"}
          spacing={2}
        >
          <Image
            src={AI_NOT_FOUND_IMAGE}
            style={{
              height: 200,
              width: 200,
            }}
          />
          <Typography color="error" variant="h5">
            No Data Found
          </Typography>
        </Stack>
      )}
      <Switch>
        <Route exact path={path} component={AiAnalyticsNewPromptDefaultComp} />
        <Route path={`${path}/:pk`} component={AiAnalyticsSinglePromptComp} />
      </Switch>
    </Box>
  );
};

export default AiAnalyticsNewPromptComp;
