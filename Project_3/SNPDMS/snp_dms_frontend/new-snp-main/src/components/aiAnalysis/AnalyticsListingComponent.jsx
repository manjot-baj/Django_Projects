import {
  Box,
  Button,
  Divider,
  FormControl,
  IconButton,
  MenuItem,
  OutlinedInput,
  Select,
  Stack,
  Typography,
} from "@mui/material";
import React, { useEffect } from "react";
import AIAnalyticsDateFilterComp from "./AIAnalyticsDateFilterComp";
import { getAiAnalyticsListingAction } from "@/actions/AIAnalyticsAction";
import { AI_ANALYTICS_CONST } from "@/reducers/AIAnalyticsReducer";
import { useDispatch, useSelector } from "react-redux";
import { useSnackbar } from "notistack";
import { useHistory } from "react-router-dom";
import RefreshOutlinedIcon from "@mui/icons-material/RefreshOutlined";
import AISingleListingCardComp from "./AISingleListingCardComp";

import { Image } from "semantic-ui-react";
import NO_USER_SUPPORT_IMAGE from "@/assets/images/empty-box.png";

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;

const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

const AnalyticsListingComponent = () => {
  const dispatch = useDispatch();
  const notify = useSnackbar().enqueueSnackbar;
  const history = useHistory();
  const { ai_analytics_listing, ai_analytics_filter } = useSelector(
    (state) => state.AIAnalyticsReducer,
  );

  const handleRefreshFilter = () => {
    dispatch({
      type: AI_ANALYTICS_CONST.AI_ANALYTICS_SET_FILTER,
      payload: {
        status: "",
        processed: null,
        from_date: "",
        to_date: "",
      },
    });
    dispatch(getAiAnalyticsListingAction(notify));
  };

  const handleChangeProcessed = (event) => {
    dispatch({
      type: AI_ANALYTICS_CONST.AI_ANALYTICS_SET_FILTER,
      payload: {
        processed: event.target.value
          ? event.target.value
          : event.target.value === false
            ? false
            : null,
      },
    });
    dispatch(getAiAnalyticsListingAction(notify));
  };

  const handleChangeStatus = (event) => {
    dispatch({
      type: AI_ANALYTICS_CONST.AI_ANALYTICS_SET_FILTER,
      payload: {
        status: event.target.value === "All" ? "" : event.target.value,
      },
    });
    dispatch(getAiAnalyticsListingAction(notify));
  };

  useEffect(() => {
    dispatch(getAiAnalyticsListingAction(notify));
  }, []);
  return (
    <Box>
      <Stack
        direction={"row"}
        alignItems={"center"}
        justifyContent={"center"}
        spacing={2}
      >
        <FormControl variant="standard" fullWidth size="small">
          <Select
            variant="standard"
            displayEmpty
            value={ai_analytics_filter.status || "All"}
            onChange={handleChangeStatus}
            label="Status"
            input={<OutlinedInput />}
            MenuProps={MenuProps}
            defaultValue={"All"}
            inputProps={{ "aria-label": "Without label" }}
          >
            {["All", "Pending", "Processing", "Completed", "Failed"].map(
              (name) => (
                <MenuItem key={name} value={name}>
                  {name}
                </MenuItem>
              ),
            )}
          </Select>
        </FormControl>

        <AIAnalyticsDateFilterComp />

        <IconButton onClick={handleRefreshFilter} color="secondary">
          <RefreshOutlinedIcon fontSize="small" />
        </IconButton>
      </Stack>

      <Divider
        sx={{
          my: 4,
        }}
      />
      {ai_analytics_listing?.length > 0 ? (
        <Box
          sx={{
            minHeight: "calc(100vh - 250px)",
            maxHeight: "calc(100vh - 250px)",
            paddingBottom: 2,
            overflowY: "scroll",
            "&::-webkit-scrollbar": {
              width: 0,
            },
          }}
        >
          {ai_analytics_listing?.map((ai_prompt) => (
            <AISingleListingCardComp ai_prompt={ai_prompt} />
          ))}
        </Box>
      ) : (
        <Stack
          direction={"column"}
          flexDirection={"column"}
          alignItems={"center"}
          justifyContent={"center"}
          spacing={2}
          sx={{
            minHeight: 300,
          }}
        >
          <Image src={NO_USER_SUPPORT_IMAGE} height={80} width={80} />
          <Typography variant="subtitle1">No data Found</Typography>
        </Stack>
      )}
    </Box>
  );
};

export default AnalyticsListingComponent;
