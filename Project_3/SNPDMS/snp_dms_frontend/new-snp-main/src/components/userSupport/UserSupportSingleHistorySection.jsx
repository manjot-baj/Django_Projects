import {
  alpha,
  Avatar,
  Chip,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Paper,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import React from "react";
import PersonIcon from "@mui/icons-material/Person";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import ArrowRightOutlinedIcon from "@mui/icons-material/ArrowRightOutlined";

const UserSupportSingleHistorySection = ({ ticket }) => {
  return (
    <Paper
      sx={{
        pt: 2,
        height: 300,
        overflowY: "scroll",
        pb: 22,
        mt: 1,
        "&::-webkit-scrollbar": {
          width: 0,
        },
      }}
      elevation={0}
    >
      <List
        sx={(theme) => ({
          width: "100%",
        })}
      >
        {ticket?.activity?.map((val, index) => (
          <ListItem
            sx={(theme) => ({
              bgcolor: alpha(theme.palette.secondary.main, 0.05),
              borderRadius: 4,
              mt: 1,
            })}
          >
            <ListItemAvatar>
              <Avatar>
                <PersonIcon fontSize="medium" />
              </Avatar>
            </ListItemAvatar>
            <ListItemText
              primary={
                <Stack spacing={1}>
                  <Typography
                    sx={{ fontWeight: 500 }}
                    variant="body2"
                    lineHeight={2}
                  >
                    {val?.description}
                  </Typography>
                  <Stack direction="row" spacing={4} alignItems="center">
                    <Stack direction="row" spacing={1} alignItems="center">
                      <PersonIcon fontSize="small" />
                      <Typography variant="caption">
                        {val?.activity_by}
                      </Typography>
                    </Stack>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <AccessTimeIcon fontSize="small" />
                      <Typography variant="caption">
                        {val?.created_at}
                      </Typography>
                    </Stack>
                  </Stack>
                  <Stack direction={"row"} spacing={0} alignItems={"center"}>
                    <Tooltip title="Action">
                      <Chip
                        variant="outlined"
                        size="small"
                        color="info"
                        sx={{ border: "none" }}
                        label={val?.action?.split("_")?.join(" ")}
                      />
                    </Tooltip>
                    {val?.status && <ArrowRightOutlinedIcon />}
                    {val?.status && (
                      <Tooltip title="Status">
                        <Chip
                          variant="outlined"
                          color="success"
                          size="small"
                          sx={{
                            border: "none",
                          }}
                          label={val?.status}
                        />
                      </Tooltip>
                    )}
                  </Stack>
                </Stack>
              }
            />
          </ListItem>
        ))}
      </List>
    </Paper>
  );
};

export default UserSupportSingleHistorySection;
