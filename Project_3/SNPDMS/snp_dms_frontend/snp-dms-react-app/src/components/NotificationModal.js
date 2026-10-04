import React, { useState } from "react";
import {
  makeStyles,
  Paper,
  Grid,
  Box,
  Typography,
  Button,
} from "@material-ui/core";
import { Switch, Tabs, Tab } from "@mui/material";
import { styled } from "@mui/material/styles";
import PropTypes from "prop-types";
import NotificationContent from "./NotificationContent";
import { useHistory } from "react-router-dom";
import { useSnackbar } from "notistack";
import { useSelector,useDispatch } from "react-redux";
import TourTwoToneIcon from "@mui/icons-material/TourTwoTone";
import { webNotificationGetMessageAction } from "../actions/WebSocketNotificationAction";

const Android12Switch = styled(Switch)(({ theme }) => ({
  padding: 8,
  "& .MuiSwitch-track": {
    borderRadius: 22 / 2,
    "&::before, &::after": {
      content: '""',
      position: "absolute",
      top: "50%",
      transform: "translateY(-50%)",
      width: 16,
      height: 16,
    },
    "&::before": {
      backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" height="16" width="16" viewBox="0 0 24 24"><path fill="${encodeURIComponent(
        theme.palette.getContrastText(theme.palette.primary.main)
      )}" d="M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z"/></svg>')`,
      left: 12,
    },
    "&::after": {
      backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" height="16" width="16" viewBox="0 0 24 24"><path fill="${encodeURIComponent(
        theme.palette.getContrastText(theme.palette.primary.main)
      )}" d="M19,13H5V11H19V13Z" /></svg>')`,
      right: 12,
    },
  },
  "& .MuiSwitch-thumb": {
    boxShadow: "none",
    width: 16,
    height: 16,
    margin: 2,
  },
}));

const useStyles = makeStyles((theme) => ({
  paperContainer: {
    width: "500px",
    padding: "10px",
    borderRadius: "12px",
    border: "none",
    borderRadius: "12px",
    backgroundColor: "#fff ",
  },
  iconWrapper: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  scrollNotification: {
    '&::-webkit-scrollbar': {
      display: 'none'
    },
  }
}));

const NotificationModal = (props) => {
  const classes = useStyles();
  const [value, setValue] = useState(0);
  const { user } = useSelector((state) => state);
  const history = useHistory();
  const dispatch = useDispatch();
  const notify = useSnackbar().enqueueSnackbar;
  const store = useSelector((state) => state);
  const { WebSocketNotification } = store;
  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  function CustomTabPanel(props) {
    const { children, value, index, ...other } = props;

    return (
      <div
        role="tabpanel"
        hidden={value !== index}
        id={`simple-tabpanel-${index}`}
        aria-labelledby={`simple-tab-${index}`}
        {...other}
      >
        {value === index && (
          <Box sx={{ p: 3 }}>
            <Typography>{children}</Typography>
          </Box>
        )}
      </div>
    );
  }

  CustomTabPanel.propTypes = {
    children: PropTypes.node,
    index: PropTypes.number.isRequired,
    value: PropTypes.number.isRequired,
  };
  function a11yProps(index) {
    return {
      id: `simple-tab-${index}`,
      "aria-controls": `simple-tabpanel-${index}`,
    };
  }

  return (
    <Grid>
      <Paper className={classes.paperContainer} elevation={0}>
        <Grid container xs={12}>
          <Grid item xs={6}>
            <h2>Notifications</h2>
          </Grid>
          <Grid item xs={4}
            justifyContent="flex-end"
            style={{ display: "flex" }}
            className={classes.iconWrapper}
          >
            <Button
              variant="text"
              onClick={() => {
                for (let index = 0; index < WebSocketNotification?.data.length; index++) {
                  const element = WebSocketNotification?.data[index];
                  if(element.is_seen === false){
                    props.allReadMessage({
                      action: "mark_as_read",
                      pk: element.pk,
                      location: user.location,
                      site: user.site,
                    });
                  }
                }
                setTimeout(() => {
                  dispatch(webNotificationGetMessageAction());
                }, 1000);
              }}
            >
              <span> <TourTwoToneIcon style={{ color: "#1a781a", height: 15, width: 15, transform: 'scaleX(-1)' }} /></span> <a href="#">Mark all as read</a>
            </Button>
          </Grid>
          <Grid item xs={2}
            justifyContent="flex-end"
            style={{ display: "flex" }}
            className={classes.iconWrapper}
          >
            <Button
              variant="text"
              onClick={() => {
                if (user.site !== "") {
                  history.push("/notification-history")
                } else {
                  notify("Please select Location and Site", { variant: "warning" })
                }

              }}
            >
              See All
            </Button>
          </Grid>

        </Grid>
        <Grid
          style={{
            overflowY: "scroll",
            height: "450px",
            paddingBottom: "100px",
          }}

          className={classes.scrollNotification}
        >
          <NotificationContent sendMessage={props.sendMessage} />
        </Grid>
      </Paper>
    </Grid>
  );
};

export default NotificationModal;
