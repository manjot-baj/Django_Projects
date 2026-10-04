import { getAiAnalyticsListingAction } from "@/actions/AIAnalyticsAction";
import {
  alpha,
  Card,
  CardHeader,
  Chip,
  Divider,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import { useSnackbar } from "notistack";
import React from "react";
import { useDispatch } from "react-redux";
import { useLocation, useHistory, useRouteMatch } from "react-router-dom";
import MoreVertOutlinedIcon from "@mui/icons-material/MoreVertOutlined";

const Ai_status_color = {
  Pending: "info",
  Processing: "warning",
  Completed: "success",
  Failed: "error",
};

const AISingleListingCardComp = ({ ai_prompt }) => {
  const locationRouter = useLocation();
  const history = useHistory();
  const { path, url } = useRouteMatch();
  const dispatch = useDispatch();
  const notify = useSnackbar().enqueueSnackbar;
  return (
    <Card
      variant="outlined"
      onClick={() => {
        dispatch(getAiAnalyticsListingAction(notify));
        history.push(`${path}/${ai_prompt?.id}`);
      }}
      sx={(theme) => ({
        mb: 1,
        borderRadius: 2,
        position: "relative",
        backgroundColor:
          Number(locationRouter?.pathname?.split("/")?.pop()) === ai_prompt?.id
            ? alpha(theme.palette.secondary.main, 0.1)
            : "white",
        cursor: "pointer",
        "&:hover": {
          backgroundColor: alpha(theme.palette.secondary.main, 0.1),
        },
      })}
    >
      <Divider
        sx={(theme) => ({
          visibility:
            Number(locationRouter?.pathname?.split("/")?.pop()) ===
            ai_prompt?.id
              ? "visible"
              : "hidden",
          position: "absolute",
          left: 0,
          width: 4,
          bgcolor: `${
            theme.palette?.[Ai_status_color?.[ai_prompt?.status]]?.main
          }`,
        })}
        orientation="vertical"
      />
      <CardHeader
        title={
          <Stack
            direction={"row"}
            alignItems={"center"}
            justifyContent={"space-between"}
          >
            {" "}
            <Typography variant="body2">{ai_prompt?.prompt}</Typography>
            <Stack
              direction={"row"}
              alignItems={"center"}
              justifyContent={"flex-end"}
              spacing={0}
            >
              <Chip
                size="small"
                color={Ai_status_color?.[ai_prompt?.status]}
                label={ai_prompt?.status}
              />
              <Tooltip
                title={`Created at : ${ai_prompt?.created_at} Updated at : ${ai_prompt?.updated_at}`}
              >
                <IconButton>
                  <MoreVertOutlinedIcon />
                </IconButton>
              </Tooltip>
            </Stack>
          </Stack>
        }
        subheader={
          <Typography variant="caption" sx={{ fontWeight: 600, fontSize: 10 }}>
            {ai_prompt?.processed ? "Processed" : "Not Processed"}
          </Typography>
        }
        slotProps={{
          title: {
            sx: { mb: -0.5 }, // reduce space below title
          },
          subheader: {
            sx: {
              mt: 0,
              lineHeight: 1.2,
            },
          },
        }}
      />
    </Card>
  );
};

export default AISingleListingCardComp;
