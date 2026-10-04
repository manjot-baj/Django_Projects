import { getSingleAiAnalyticsDataAction } from "@/actions/AIAnalyticsAction";
import {
  Box,
  Button,
  Chip,
  Paper,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import { useSnackbar } from "notistack";
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { Image } from "semantic-ui-react";
import AI_UNSON_IMAGE from "@/assets/images/ai_union.png";
import AISinglePromptMarkDownResponseComp from "./AISinglePromptMarkDownResponseComp";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import CreateOutlinedIcon from "@mui/icons-material/CreateOutlined";
import SyncOutlinedIcon from "@mui/icons-material/SyncOutlined";
import NO_USER_SUPPORT_IMAGE from "@/assets/images/empty-box.png";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import { useHistory } from "react-router-dom";

const Ai_status_color = {
  Pending: "info",
  Processing: "warning",
  Completed: "success",
  Failed: "error",
};

const AiAnalyticsSinglePromptComp = () => {
  const { pk } = useParams();
  const dispatch = useDispatch();
  const history = useHistory();
  const notify = useSnackbar().enqueueSnackbar;
  const { ai_analytics_data } = useSelector(
    (state) => state.AIAnalyticsReducer
  );
  useEffect(() => {
    dispatch(getSingleAiAnalyticsDataAction(pk, notify));
  }, [pk]);

  return (
    <Box>
      <Stack
        direction={"row"}
        alignItems={"center"}
        justifyContent={"space-between"}
      >
        <Stack
          direction={"row"}
          alignItems={"center"}
          justifyContent={"flex-start"}
          spacing={2}
        >
          <Image
            src={AI_UNSON_IMAGE}
            style={{
              height: 30,
              width: 30,
              cursor: "pointer",
            }}
          />
          <Typography variant="h6">{ai_analytics_data?.prompt}</Typography>
        </Stack>
        <Button
          startIcon={<AddOutlinedIcon />}
          variant="contained"
          color="secondary"
          onClick={() => history.push("/ai-analysis")}
        >
          New Chat
        </Button>
      </Stack>

      <Stack
        direction={"row"}
        alignItems={"center"}
        justifyContent={"flex-start"}
        spacing={2}
        sx={{ my: 2 }}
      >
        <Tooltip title="Created At">
          <Chip
            icon={
              <AccessTimeIcon
                fontSize="small"
                sx={(theme) => ({
                  fill: theme.palette.primary.main,
                })}
              />
            }
            sx={{
              border: "none",
            }}
            size="small"
            variant="outlined"
            color="default"
            label={ai_analytics_data?.created_at}
          />
        </Tooltip>
        <Tooltip title="Updated  At">
          <Chip
            icon={
              <CreateOutlinedIcon
                fontSize="small"
                sx={(theme) => ({
                  fill: theme.palette.info.main,
                })}
              />
            }
            sx={{
              border: "none",
            }}
            size="small"
            variant="outlined"
            color="default"
            label={ai_analytics_data?.updated_at}
          />
        </Tooltip>
        <Chip
          icon={<SyncOutlinedIcon fontSize="medium" sx={{ fill: "green" }} />}
          sx={{
            border: "none",
          }}
          size="small"
          variant="outlined"
          color="default"
          label={ai_analytics_data?.processed ? "Processed" : "Not Processed "}
        />
        <Chip
          size="small"
          color={Ai_status_color?.[ai_analytics_data?.status]}
          label={ai_analytics_data?.status}
        />
      </Stack>

      <Box>
        {ai_analytics_data?.processed === false &&
        ai_analytics_data?.response === null ? (
          <Box
            sx={{
              minHeight: "calc(100vh - 200px)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 2,
            }}
          >
            <Image src={NO_USER_SUPPORT_IMAGE} height={100} width={100} />
            <Typography variant="subtitle1">
              Status is{" "}
              <span style={{ fontWeight: "bold" }}>
                {ai_analytics_data?.status}
              </span>{" "}
              . Please wait or try again with other Prompt
            </Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={() => history.go()}
            >
              Refresh
            </Button>
          </Box>
        ) : (
          <AISinglePromptMarkDownResponseComp
            content={ai_analytics_data?.response}
          />
        )}
      </Box>
    </Box>
  );
};

export default AiAnalyticsSinglePromptComp;
