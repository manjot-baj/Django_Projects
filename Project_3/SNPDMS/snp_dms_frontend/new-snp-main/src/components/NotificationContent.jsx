import React from "react";
import {
  Typography,
  IconButton,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import { useDispatch, useSelector } from "react-redux";

import { Stack } from "@mui/material";
import { Image } from "semantic-ui-react";
import { makeStyles } from "@mui/styles";
import VIEWICON from "@/assets/images/view.png";
import HIDDENICON from "@/assets/images/hidden.png";

const useStyles = makeStyles((theme) => ({
  memberNameWrapper: {
    borderRadius: "50%",
    width: "50px",
    height: "50px",
    background: "#7569ee",
    color: "#FFF",
    alignItems: "center",
    textAlign: "center",
    display: "flex",
    justifyContent: "center",
    fontSize: "24px",
    fontWeight: "bold",
    margin: "0px 30px 0px 0px",
  },
  detailsSectionWrapper: {
    display: "flex",
    justifyContent: "flex-start",
    alignItems: "center",
    textAlign: "left",
    width: "100%",
  },
  statusWrapper: {
    display: "flex",
    justifyContent: "flex-start",
  },
  backImage: {
    height: 15,
    width: 15,
    cursor: "pointer",
    opacity: 0.5,
  },
  modaldetails: {
    height: "auto",
    border: "none",
    padding: "10px 10px",
    borderRadius: "10px",
    width: "100%",
    margin: "10px 0px 10px 10px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    "&:hover": {
      backgroundColor: "rgba(0,0,0,0.05)",
      boxShadow: "1px 1px 8px 0px #b1b1b14f",
    },
  },
}));

const NotificationContent = ({ sendMessage }) => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const store = useSelector((state) => state);
  const { user } = useSelector((state) => state);
  const { role } = user;
  const { WebSocketNotification } = store;


  return (
    <List sx={{ width: "100%", bgcolor: "background.paper" }}>
      {WebSocketNotification?.data?.map((value) => {
        if (value?.category === "USER_SUPPORT" && role !== "Admin") {
          return null;
        }
        return (
          <ListItem
            key={value.pk}
            alignItems="flex-start"
            onClick={() => {
              if (value.is_seen) {
                return;
              } else {
                sendMessage({
                  action: "mark_as_read",
                  pk: value.pk,
                  location: user.location,
                  site: user.site,
                });
              }
            }}
            style={{
              boxShadow:
                value.notification_type === "SUCCESS"
                  ? "1px 1px 1px 1px  rgba(0, 200,81, 0.6)"
                  : value.notification_type === "FAILURE"
                  ? "1px 1px 1px 1px  rgba(255, 68,68, 0.6)"
                  : value.notification_type === "WARNING"
                  ? "rgb(200 162 0 / 60%) 1px 1px 1px 1px"
                  : "rgb(0 41 200 / 60%) 1px 1px 1px 1px",
              marginBottom: "20px",
              backgroundColor: !value.is_seen ? "rgba(0,0,0,0.1)" : "inherit",
              opacity: !value.is_seen ? 0.6 : 1,
              cursor: !value.is_seen && "pointer",
            }}
          >
            <ListItemText
              primary={value.text}
              secondary={
                <Stack
                  flexDirection={"row"}
                  alignItems={"center"}
                  justifyContent={"space-between"}
                  direction={"row"}
                >
                  <Stack
                    flexDirection={"row"}
                    alignItems={"center"}
                    justifyContent={"space-between"}
                    direction={"row"}
                    spacing={2}
                  >
                    <Typography
                      style={{
                        backgroundColor: "#7569ee",
                        color: "white",
                        padding: "4px",
                        borderRadius: 2,
                        fontSize: "8px",
                      }}
                    >
                      {value.category}
                    </Typography>
                    <Typography
                      style={{
                        backgroundColor: "#f7a844",
                        color: "white",
                        padding: "4px",
                        borderRadius: 2,
                        fontSize: "8px",
                      }}
                    >
                      {value.site}
                    </Typography>
                    <Typography
                      sx={{ display: "inline" }}
                      component="span"
                      variant="body2"
                      style={{ color: "rgba(0,0,0,0.4)" }}
                    >
                      {value.created_at}
                    </Typography>
                  </Stack>

                  <IconButton
                    edge="end"
                    aria-label="comments"
                    onClick={() => {
                      if (value.is_seen) {
                        return;
                      } else {
                        sendMessage({
                          action: "mark_as_read",
                          pk: value.pk,
                          location: user.location,
                          site: user.site,
                        });
                      }
                    }}
                  >
                    <Image
                      src={value.is_seen ? VIEWICON : HIDDENICON}
                      className={classes.backImage}
                      // onClick={handleGoBack}
                    />
                  </IconButton>
                </Stack>
              }
            />
          </ListItem>
        );
      })}
    </List>
  );
};

export default NotificationContent;
