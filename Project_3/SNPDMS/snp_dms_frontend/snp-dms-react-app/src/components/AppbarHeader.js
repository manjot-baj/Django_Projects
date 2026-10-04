import React, { useState, useEffect, useRef } from "react";
import {
  makeStyles,
  AppBar,
  Toolbar,
  Typography,
  Badge,
  Popover,
  Box,
  Divider,
  Button,
} from "@material-ui/core";

import IconButton from "@material-ui/core/IconButton";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import NotificationModal from "./NotificationModal";
import { useDispatch, useSelector } from "react-redux";
import { webNotificationGetMessageAction } from "../actions/WebSocketNotificationAction";
import { Stack } from "@mui/material";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import ExploreOutlinedIcon from "@mui/icons-material/ExploreOutlined";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import Left from "@material-ui/icons/ChevronLeft";
import MenuIcon from "@material-ui/icons/Menu";
import { dropDownLocationandSiteIDDispatch } from "../actions/GateInActions";
import { useSnackbar } from "notistack";
import Logo from "../assets/images/snp-logo-new.png";
import { Link } from "react-router-dom";

const phone = window.innerWidth <= 380 || "orientation" in window;

const drawerWidth = 220;

const useStyles = makeStyles((theme) => ({
  appBar: {
    transition: theme.transitions.create(["margin", "width"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    zIndex: 100,
  },
  appBarShift: {
    width: `calc(100% - ${drawerWidth}px)`,
    marginLeft: drawerWidth,
    transition: theme.transitions.create(["margin", "width"], {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  menuButton: {
    marginRight: theme.spacing(2),
  },
  notifictionButton: {
    cursor: "pointer",
  },
  hide: {
    display: "none",
  },
  header: {
    fontWeight: 600,
    letterSpacing: 3,
    color: "#243545",
  },
  closeIcon: {
    float: "right",
  },
  toolbar: {
    backgroundColor: "rgb(255,255,255)",
    display: "flex",
    width: "100%",
  },
  customBadge: {
    backgroundColor: "rgb(254,93,54)",
    color: "white",
  },
  roleUser: {
    width: 32,
    height: 32,
    borderRadius: 50,
    backgroundColor: "rgb(254,93,54)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginRight: "-12px",
    cursor: "pointer",
  },
  locationHeading: {
    color: "rgb(206,206,206)",
  },
  appBarDropdown: {
    marginRight: "12px",
    padding: 4,
  },
  logoutPopper: {
    backgroundColor: "rgb(255,255,255)",
    padding: "8px 16px",
  },
  logoutPopperContainer: {
    "& .MuiPopover-paper": {
      backgroundColor: "transparent",
      boxShadow: "rgba(0, 0, 0, 0.16) 0px 1px 4px",
      borderRadius: "8px",
      marginTop: 12,
      width: "250px",
    },
  },
}));

const AppbarHeader = (props) => {
  const classes = useStyles();
  const notify = useSnackbar().enqueueSnackbar;
  const { handleDrawerOpen, handleDrawerClose, open } = props;
  const { user, gateIn } = useSelector((state) => state);
  const [socketCount, setSocketCount] = useState(0);
  const dispatch = useDispatch();
  const [anchorEl, setAnchorEl] = React.useState(null);
  const socketRef = useRef(null);
  const domain = window.location.host;

  const openPop = Boolean(anchorEl);
  const idPop = openPop ? "simple-popover" : undefined;
  const [openLogout, setOpenLogout] = React.useState(false);
  const [anchorElLogout, setAnchorElLogout] = React.useState(null);

  let wsBaseURL;

  domain === "localhost:3000"
    ? (wsBaseURL = "wss://newstag-api.decomans.com/ws/notifications")
    : domain === "decomans.com" || domain === "www.decomans.com"
    ? (wsBaseURL = "wss://api.decomans.com/ws/notifications")
    : (wsBaseURL = `wss://${
        domain.split(".")[0]
      }-api.decomans.com/ws/notifications`);

  useEffect(() => {
    const newSocket = new WebSocket(
      `${wsBaseURL}/${user.location ? user.location : "all"}/${
        user.site ? user.site : "all"
      }/`
    );
    socketRef.current = newSocket;

    newSocket.onopen = () => {
      console.log("WebSocket connected");
    };

    newSocket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setSocketCount(data.count);
    };

    newSocket.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    newSocket.onclose = () => {
      console.log("WebSocket disconnected");
    };

    return () => {
      if (socketRef.current) {
        console.log("Closing WebSocket connection.");
        socketRef.current.close();
      }
    };
  }, [user.location, user.site]);

  const sendMessage = (data) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify(data));
      dispatch(webNotificationGetMessageAction());
    }
  };

  const allReadMessage = (data) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify(data));
    }
  };

  const openModal = (event) => {
    dispatch(webNotificationGetMessageAction());
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleOpenLogout = (event) => {
    setAnchorElLogout(event.currentTarget);
    setOpenLogout((previousOpen) => !previousOpen);
  };

  const handleCloseLogout = () => {
    setAnchorElLogout(null);
    setOpenLogout(false);
  };

  const canBeOpenLogout = openLogout && Boolean(anchorElLogout);
  const idLogout = canBeOpenLogout ? "simple-popover" : undefined;

  useEffect(() => {
    let reqArray = ["location_site_id_name"];

    dispatch(dropDownLocationandSiteIDDispatch(reqArray, notify));
  }, [user.site, user.location]);

  return (
    <AppBar
      position="fixed"
      className={classes.appBar}
      style={{ backgroundColor: "transparent" }}
      elevation={0}
    >
      <Toolbar className={classes.toolbar}>
        {user.role === "MNR Team" && (
          <img
            src={Logo}
            alt=""
            height="30"
            width="fit-content"
            style={{ float: "left" }}
          />
        )}
        <Stack
          margin={"auto"}
          marginRight={2}
          width={300}
          flexDirection={"row"}
          direction={"row"}
          alignItems={"center"}
          justifyContent={"flex-end"}
          spacing={4}
        >
          {user.role === "Surveyor" || user.role === "Repair" ? (
            ""
          ) : (
            <Badge
              badgeContent={socketCount}
              color="primary"
              aria-describedby={idPop}
              onClick={openModal}
              classes={{ badge: classes.customBadge }}
              className={classes.notifictionButton}
            >
              <NotificationsNoneIcon color="action" />
            </Badge>
          )}
          <Stack
            spacing={1}
            direction={"row"}
            alignItems={"center"}
            justifyContent={"flex-end"}
          >
            <Box className={classes.locationHeading}>
              <Typography variant="subtitle2">
                {user?.site?.slice(0, 5)}
              </Typography>
            </Box>
            <Box onMouseEnter={handleOpenLogout} className={classes.roleUser}>
              <Typography variant="subtitle1">{user?.role[0]}</Typography>
            </Box>
            <IconButton
              className={classes.appBarDropdown}
              // onTouchMove={handleOpenLogout}
              onMouseEnter={handleOpenLogout}
              onClick={handleOpenLogout}
            >
              <ArrowDropDownIcon />
            </IconButton>
            <Popover
              className={classes.logoutPopperContainer}
              id={idLogout}
              open={openLogout}
              anchorEl={anchorElLogout}
              onClose={handleCloseLogout}
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "left",
              }}
            >
              <Stack spacing={2} className={classes.logoutPopper}>
                <Stack
                  spacing={2}
                  direction={"row"}
                  alignItems={"center"}
                  justifyContent={"flex-start"}
                >
                  <PersonOutlineOutlinedIcon
                    style={{ fill: "rgb(38,43,51)" }}
                  />
                  <Typography
                    variant="subtitle2"
                    style={{ color: "rgb(38,43,51)" }}
                  >
                    {user.role}
                  </Typography>
                </Stack>
                <Stack
                  spacing={2}
                  direction={"row"}
                  alignItems={"center"}
                  justifyContent={"flex-start"}
                >
                  <LocationOnOutlinedIcon style={{ fill: "rgb(38,43,51)" }} />
                  <Typography
                    variant="subtitle2"
                    style={{ color: "rgb(38,43,51)" }}
                  >
                    {user.location}
                  </Typography>
                </Stack>
                <Stack
                  spacing={2}
                  direction={"row"}
                  alignItems={"center"}
                  justifyContent={"flex-start"}
                >
                  <ExploreOutlinedIcon style={{ fill: "rgb(38,43,51)" }} />
                  <Typography
                    variant="subtitle2"
                    style={{ color: "rgb(38,43,51)" }}
                  >
                    {user.site}
                  </Typography>
                </Stack>
                <Divider />
                <Stack>
                  <Link to='/login' replace >
                    <Button
                     
                      fullWidth
                      style={{ backgroundColor: "rgb(254,93,54)" }}
                      startIcon={
                        <LogoutOutlinedIcon style={{ fill: "white" }} />
                      }
                    >
                      <Typography
                        variant="subtitle2"
                        style={{ color: "white" }}
                      >
                        Logout
                      </Typography>
                    </Button>
                  </Link>
                </Stack>
              </Stack>
            </Popover>
            {phone && (
              <IconButton
                color="black"
                aria-label="open drawer"
                onClick={open ? handleDrawerClose : handleDrawerOpen}
                edge="start"
                className={classes.menuButton}
              >
                {open ? <Left fontSize="large" /> : <MenuIcon />}
              </IconButton>
            )}
          </Stack>

          {/* <Button
            style={{
              display: "flex",
              margin: "auto",
              color: "white",

              backgroundColor: "rgb(254,93,54)",
              zIndex: 10,
              padding: "4px 12px",
            }}
            onClick={() => (window.location.href = "login")}
            startIcon={<LogoutIcon style={{ fill: "white" }} />}
            variant="text"
          >
            Logout
          </Button> */}
        </Stack>
      </Toolbar>
      <Popover
        id={idPop}
        open={openPop}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
        style={{ zIndex: 3000, minWidth: "600px" }}
      >
        <NotificationModal
          sendMessage={sendMessage}
          allReadMessage={allReadMessage}
        />
      </Popover>
    </AppBar>
  );
};
export default AppbarHeader;
