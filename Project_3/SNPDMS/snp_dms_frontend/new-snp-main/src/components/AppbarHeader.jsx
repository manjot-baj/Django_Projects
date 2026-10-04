import React, { useState, useEffect, useRef } from "react";

import { IconButton, Modal } from "@mui/material";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import NotificationModal from "./NotificationModal";
import { useDispatch, useSelector } from "react-redux";
import { webNotificationGetMessageAction } from "../actions/WebSocketNotificationAction";
import {
  AppBar,
  Stack,
  Toolbar,
  Typography,
  Badge,
  Popover,
  Box,
  Divider,
  Button,
} from "@mui/material";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import ExploreOutlinedIcon from "@mui/icons-material/ExploreOutlined";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import Left from "@mui/icons-material/ChevronLeft";
import MenuIcon from "@mui/icons-material/Menu";
import { dropDownLocationandSiteIDDispatch } from "../actions/GateInActions";
import { useSnackbar } from "notistack";
import Logo from "../assets/images/snp-logo-new.png";
import { Link } from "react-router-dom";
import VpnKeyOutlinedIcon from "@mui/icons-material/VpnKeyOutlined";
import AppBarHeaderFtpComp from "./AppBarHeaderFtpComp";

const phone = window.innerWidth <= 380 || "orientation" in window;

const drawerWidth = 220;

const AppbarHeader = (props) => {
  const notify = useSnackbar().enqueueSnackbar;
  const { handleDrawerOpen, handleDrawerClose, open } = props;
  const { user } = useSelector((state) => state);
  const [socketCount, setSocketCount] = useState(0);
  const dispatch = useDispatch();
  const [anchorEl, setAnchorEl] = React.useState(null);
  const socketRef = useRef(null);
  const domain = window.location.host;

  const openPop = Boolean(anchorEl);
  const idPop = openPop ? "simple-popover" : undefined;
  const [openLogout, setOpenLogout] = React.useState(false);
  const [anchorElLogout, setAnchorElLogout] = React.useState(null);

  const [openFTPLogin, setOpenFTPLogin] = React.useState(false);
  const handleOpenFTPLogin = () => setOpenFTPLogin(true);
  const handleCloseFTPLogin = () => setOpenFTPLogin(false);

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
      }/`,
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
      color="primary"
      variant="elevation"
      sx={(theme) => ({
        transition: theme.transitions.create(["margin", "width"], {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.leavingScreen,
        }),

        zIndex: 100,
      })}
      style={{ backgroundColor: "transparent" }}
      elevation={0}
    >
      <Toolbar
        sx={{
          backgroundColor: "rgb(255,255,255)",
          display: "flex",
          width: "100%",
          maxHeight: 24,
        }}
      >
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
          width={400}
          flexDirection={"row"}
          direction={"row"}
          alignItems={"center"}
          justifyContent={"flex-end"}
          spacing={4}
          marginTop={"-12px"}
        >
          {user.role === "Surveyor" || user.role === "Repair" ? (
            ""
          ) : (
            <Stack
              direction={"row"}
              alignItems={"center"}
              justifyContent={"flex-end"}
              spacing={2}
            >
            { user?.role ==='Admin' &&  <Button
                variant="outlined"
                color="success"
                startIcon={<VpnKeyOutlinedIcon fontSize="small" />}
                onClick={handleOpenFTPLogin}
                size="small"
                sx={(theme) => ({
                  [theme.breakpoints.down("sm")]: {
                    display: "none",
                  },
                })}
              >
                FTP login
              </Button>}
              <Badge
                badgeContent={socketCount}
                color="primary"
                aria-describedby={idPop}
                onClick={openModal}
                sx={(theme) => ({
                  cursor: "pointer",
                  "& .MuiBadge-badge": {
                    backgroundColor: theme.palette.primary.main,
                    color: "white",
                  },
                })}
              >
                <NotificationsNoneIcon color="action" />
              </Badge>
            </Stack>
          )}
          <Stack
            spacing={1}
            direction={"row"}
            alignItems={"center"}
            justifyContent={"flex-end"}
          >
            <Box
              sx={{
                color: "rgb(206,206,206)",
              }}
            >
              <Typography variant="subtitle2">
                {user?.site?.slice(0, 5)}
              </Typography>
            </Box>
            <Box
              onMouseEnter={handleOpenLogout}
              sx={(theme) => ({
                width: 32,
                height: 32,
                borderRadius: 50,
                backgroundColor: theme.palette.primary.main,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginRight: "-12px",
                cursor: "pointer",
              })}
            >
              <Typography variant="subtitle1">{user?.role?.[0]}</Typography>
            </Box>
            <IconButton
              sx={{
                marginRight: "12px",
                paddingY: 4,
              }}
              // onTouchMove={handleOpenLogout}
              onMouseEnter={handleOpenLogout}
              onClick={handleOpenLogout}
            >
              <ArrowDropDownIcon />
            </IconButton>
            <Popover
              sx={{
                "& .MuiPopover-paper": {
                  backgroundColor: "transparent",
                  boxShadow: "rgba(0, 0, 0, 0.16) 0px 1px 4px",
                  borderRadius: "8px",
                  marginTop: 1,
                  width: "250px",
                },
              }}
              id={idLogout}
              open={openLogout}
              anchorEl={anchorElLogout}
              onClose={handleCloseLogout}
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "left",
              }}
            >
              <Stack
                spacing={2}
                sx={{
                  backgroundColor: "rgb(255,255,255)",
                  padding: "8px 16px",
                }}
              >
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
                  <Link to="/login" replace>
                    <Button
                      fullWidth
                      variant="contained"
                      color="primary"
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
                sx={(theme) => ({
                  marginRight: theme.spacing(2),
                })}
              >
                {open ? <Left fontSize="large" /> : <MenuIcon />}
              </IconButton>
            )}
          </Stack>
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
      <Modal
        open={openFTPLogin}
        onClose={handleCloseFTPLogin}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box
          sx={(theme) => ({
            top: "10%",
            position: "absolute",
            background: "#FFF",
            width: "85%",
            height: "calc(100vh - 100px)",
            maxHeight: "calc(100vh - 100px)",
            margin: "auto",
            left: "10%",
            padding: "15px 25px",
            pointerEvents: "painted",
            borderRadius: 2,
            [theme.breakpoints.down("sm")]: {
              top: "10%",
              overflowY: "scroll",
              height: "calc(100vh - 100px)",
            },
          })}
        >
          <AppBarHeaderFtpComp handleCloseFTPLogin={handleCloseFTPLogin} />
        </Box>
      </Modal>
    </AppBar>
  );
};
export default AppbarHeader;
