import React, { useEffect } from "react";
import jwt_decode from "jwt-decode";
import Fade from "react-reveal/Fade";
import Flip from "react-reveal/Flip";
import {
  makeStyles,
  Typography,
  Box,
  Grid,
  Paper,
  useTheme,
  useMediaQuery,
  Button,
  Menu,
  MenuItem,
  Backdrop,
  CircularProgress,
  Snackbar,
  Divider,
} from "@material-ui/core";
import { useHistory } from "react-router-dom";
import KeyboardArrowDownIcon from "@material-ui/icons/KeyboardArrowDown";
import LayoutContainer from "../components/reusableComponents/LayoutContainer";
import RenderOnViewportEntry from "../utils/RenderOnViewPort";
import { useDispatch, useSelector } from "react-redux";
import {
  getMainDashboardDetailsDispatch,
  getMovementSummaryByTimeDispatch,
  getInventoryByTimeDispatch,
  getRevenueByTimeDispatch,
  getTopClientRevenueByTimeDispatch,
  getVolumeAndRevenueByTimeDispatch,
} from "../actions/DashboardActions";
import { dropDownDispatch } from "../actions/GateInActions";
import Loader from "../components/dashboard/Loader";
import { useSnackbar } from "notistack";
import { USER_INFO } from "../reducers/UserReducer";
import { Stack } from "@mui/material";
import AccessAlarmIcon from "@mui/icons-material/AccessAlarm";

const drawerWidth = 220;

//Card Container
const CardContainer = React.lazy(() =>
  import("../components/dashboard/CardContainer")
);

// movement
const MovementCard = React.lazy(() =>
  import("../components/dashboard/MovementCard")
);

// inventory
const AvailableCard = React.lazy(() =>
  import("../components/dashboard/AvailableCard")
);

//Allotment Card
const AllotmentCard = React.lazy(() =>
  import("../components/dashboard/AllotmentCard")
);

// revenue
const RevenueCard = React.lazy(() =>
  import("../components/dashboard/RevenueCard")
);

//Volumne Card
const VolumeRevenueCard = React.lazy(() =>
  import("../components/dashboard/VolumeRevenueCard")
);

// ClIENT CARD
const ClientCard = React.lazy(() =>
  import("../components/dashboard/ClientCard")
);

function loaded(obj) {
  for (let i in obj) {
    if (obj[i] == null) {
      return false;
    }
  }
  return true;
}

const useStyles = makeStyles((theme) => ({
  root: {
    marginLeft: 80,
    marginRight: 80,
  },
  boxContainer: {
    [theme.breakpoints.up("xs")]: {},
    position: "relative",
  },
  dropdownPaper: {
    marginLeft: 10,
    width: "100%",
    padding: theme.spacing(0.75, 1),
    borderRadius: 6,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    [theme.breakpoints.down("md")]: {
      width: "320px",
    },
  },
  CardContainer: {
    borderRadius: 10,
    backgroundColor: "#DAE2E8",
    padding: theme.spacing(1),
    width: "100%",
    height: 80,
    marginTop: 20,
  },
  appBar: {
    transition: theme.transitions.create(["margin", "width"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
  },
  appBarShift: {
    width: `calc(100% - ${drawerWidth}px)`,
    marginLeft: drawerWidth,
    transition: theme.transitions.create(["margin", "width"], {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  backdrop: {
    zIndex: theme.zIndex.drawer + 1,
    color: "#fff",
  },
}));

const style = {
  width: 600,
  bgcolor: "#cd3301",
  borderRadius: "8px",
  outline: "none",
  boxShadow: 24,
  p: 2,
  // border:"3px solid #cd3301",
};

// const phone = window.innerWidth <= 380 || "orientation" in window;

const Dashboard = () => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const store = useSelector((state) => state);
  const { dashboard, user, gateIn, ui } = store;
  const history = useHistory();
  const notify = useSnackbar().enqueueSnackbar;
  const theme = useTheme();
  const matches = useMediaQuery(theme.breakpoints.down("xs"));
  const [anchorLocation, setAnchorLocation] = React.useState(null);
  const [anchorSite, setAnchorSite] = React.useState(null);
  const [openPaymentModal, setOpenPaymentModal] = React.useState(false);
  const handleOpenPayment = () => setOpenPaymentModal(true);
  const handleClosePament = () => setOpenPaymentModal(false);

  const handleLocationClick = (event) => {
    setAnchorLocation(event.currentTarget);
  };
  const handleLocationClose = () => {
    setAnchorLocation(null);
  };
  const handleSiteClick = (event) => {
    setAnchorSite(event.currentTarget);
  };
  const handleSiteClose = () => {
    setAnchorSite(null);
  };
  // Check if the token is expired if yes then push to login
  useEffect(() => {
    var token = localStorage.getItem("accessToken");
    if (token) {
      var decode = jwt_decode(token);
      if (decode.exp < new Date().getTime() / 1000) {
        history.push("/login");
      } else {
        let reqArray = [
          "location_site_dashboard_list",
          "location_site_type_dashboard_list",
        ];

        dispatch(getMainDashboardDetailsDispatch());
        dispatch(dropDownDispatch(reqArray, notify));
      }
    } else {
      history.push("/login");
    }
  }, [user.site]);

  useEffect(() => {
    if (user?.role === "MNR Team") {
      history.push("/mnr");
    }
    if (user?.role === "Repair") {
      history.push("/repair-tab");
    }
    if (user?.role === "Surveyor") {
      history.push("/serveyor");
    }

    if (user?.role === "Loaded Yard" && user?.site !== "") {
      const locationData =
        gateIn.allDropDown?.location_site_type_dashboard_list?.[
          user.location
        ]?.find((val) => val?.site === user?.site);

      dispatch({ type: "SET_LOCATION", payload: user.location });
      dispatch({
        type: "SET_STOCK_ALLOT_SEARCH_LOCATION",
        payload: user.location,
      });
      dispatch({
        type: "SET_MNR_SEARCH_LOCATION",
        payload: user.location,
      });
      localStorage.setItem("location", user.location);
      dispatch({ type: "SET_SITE", payload: user.site });
      dispatch({ type: "SET_TYPE", payload: locationData?.type });

      dispatch({
        type: "SET_LOADED_EMPTY_YARD_MODULE",
        payload: locationData?.loaded_yard_module,
      });

      localStorage.setItem("site", user.site);
      localStorage.setItem("type", locationData?.type);

      if (
        locationData?.loaded_yard_module === "" ||
        locationData?.loaded_yard_module === false
      ) {
        localStorage.setItem("loaded_yard_module", false);
        dispatch({
          type: "SET_LOADED_EMPTY_YARD_MODULE",
          payload: false,
        });
        localStorage.setItem("loaded_yard_module", false);
      } else {
        localStorage.setItem("loaded_yard_module", true);
        dispatch({
          type: "SET_LOADED_EMPTY_YARD_MODULE",
          payload: true,
        });
        localStorage.setItem("loaded_yard_module", true);
      }
    }
  }, [user.site, gateIn.allDropDown]);

  useEffect(() => {
    if (
      user?.payment_due_date?.length > 2 
    ) {
      setOpenPaymentModal(true);
    }
    if (user?.role === "Site Admin" || user.role === "Depot User") {
      const locationData =
        gateIn.allDropDown?.location_site_type_dashboard_list?.[
          user.location
        ]?.find((val) => val?.site === user?.site);

      dispatch({ type: "SET_LOCATION", payload: user.location });
      dispatch({
        type: "SET_STOCK_ALLOT_SEARCH_LOCATION",
        payload: user.location,
      });
      dispatch({
        type: "SET_MNR_SEARCH_LOCATION",
        payload: user.location,
      });
      localStorage.setItem("location", user.location);
      dispatch({ type: "SET_SITE", payload: user.site });
      dispatch({ type: "SET_TYPE", payload: locationData?.type });
      dispatch({
        type: "SET_LOADED_EMPTY_YARD_MODULE",
        payload: locationData?.loaded_yard_module,
      });
      dispatch({
        type: USER_INFO.LOLO_FINANCE_MODULE,
        payload: locationData?.lolo_finance,
      });
      dispatch({
        type: USER_INFO.TRUCK_TRACKING,
        payload: locationData?.truck_tracking,
      });
      dispatch({
        type: "SET_PROCUREMENT_ADMIN",
        payload: locationData?.procurement_admin,
      });
      dispatch({
        type: "SET_TRANPORTATION_MODULE",
        payload: locationData?.transportation_module,
      });
      dispatch({
        type: USER_INFO.PROCUREMENT_MODULE,
        payload: locationData?.procurement_module,
      });
      dispatch({
        type: "SET_NEW_BILLING_MODULE",
        payload: locationData?.new_billing_module,
      });

      localStorage.setItem("site", user.site);
      localStorage.setItem("type", locationData?.type);

      if (
        locationData?.transportation_module === "" ||
        locationData?.transportation_module === false
      ) {
        dispatch({
          type: "SET_TRANSPORTATION_MODULE",
          payload: false,
        });
        localStorage.setItem("transportation_module", false);
      } else {
        dispatch({
          type: "SET_TRANSPORTATION_MODULE",
          payload: true,
        });
        localStorage.setItem("transportation_module", true);
      }
      if (
        locationData?.new_billing_module === "" ||
        locationData?.new_billing_module === false
      ) {
        dispatch({
          type: "SET_NEW_BILLING_MODULE",
          payload: false,
        });
        localStorage.setItem("new_billing_module", false);
      } else {
        dispatch({
          type: "SET_NEW_BILLING_MODULE",
          payload: true,
        });
        localStorage.setItem("new_billing_module", true);
      }

      if (
        locationData?.loaded_yard_module === "" ||
        locationData?.loaded_yard_module === false
      ) {
        dispatch({
          type: "SET_LOADED_EMPTY_YARD_MODULE",
          payload: false,
        });
        localStorage.setItem("loaded_yard_module", false);
      } else {
        dispatch({
          type: "SET_LOADED_EMPTY_YARD_MODULE",
          payload: true,
        });
        localStorage.setItem("loaded_yard_module", true);
      }

      if (
        locationData?.lolo_finance === "" ||
        locationData?.lolo_finance === false
      ) {
        dispatch({
          type: USER_INFO.LOLO_FINANCE_MODULE,
          payload: false,
        });
        localStorage.setItem("lolo_finance", false);
      } else {
        dispatch({
          type: USER_INFO.LOLO_FINANCE_MODULE,
          payload: true,
        });
        localStorage.setItem("lolo_finance", true);
      }

      if (
        locationData?.en_block_movement === "" ||
        locationData?.en_block_movement === false ||
        locationData?.en_block_movement === "false" ||
        locationData?.en_block_movement === "False"
      ) {
        dispatch({
          type: USER_INFO.EN_BLOCK_MOVEMENT_MODULE,
          payload: false,
        });
        localStorage.setItem("en_block_movement", false);
      } else {
        dispatch({
          type: USER_INFO.EN_BLOCK_MOVEMENT_MODULE,
          payload: true,
        });
        localStorage.setItem("en_block_movement", true);
      }

      if (
        locationData?.en_block_movement_v2 === "" ||
        locationData?.en_block_movement_v2 === false ||
        locationData?.en_block_movement_v2 === "false" ||
        locationData?.en_block_movement_v2 === "False"
      ) {
        dispatch({
          type: USER_INFO.EN_BLOCK_MOVEMENT_VERSION_2,
          payload: false,
        });
        localStorage.setItem("en_block_movement_v2", false);
      } else {
        dispatch({
          type: USER_INFO.EN_BLOCK_MOVEMENT_VERSION_2,
          payload: true,
        });
        localStorage.setItem("en_block_movement_v2", true);
      }

      if (
        locationData?.procurement_module === "" ||
        locationData?.procurement_module === false
      ) {
        dispatch({
          type: USER_INFO.PROCUREMENT_MODULE,
          payload: false,
        });
        localStorage.setItem("procurement_module", false);
      } else {
        dispatch({
          type: USER_INFO.PROCUREMENT_MODULE,
          payload: true,
        });
        localStorage.setItem("procurement_module", true);
      }

      if (
        locationData?.procurement_admin === "" ||
        locationData?.procurement_admin === false
      ) {
        dispatch({
          type: "SET_PROCUREMENT_ADMIN",
          payload: false,
        });
        localStorage.setItem("procurement_admin", false);
      } else {
        dispatch({
          type: "SET_PROCUREMENT_ADMIN",
          payload: true,
        });
        localStorage.setItem("procurement_admin", true);
      }

      if (
        locationData?.mnr_team === "" ||
        locationData?.mnr_team === false ||
        locationData?.mnr_team === "false" ||
        locationData?.mnr_team === "False"
      ) {
        dispatch({
          type: USER_INFO.MNR_TEAM,
          payload: false,
        });
        localStorage.setItem("mnr_team", false);
      } else {
        dispatch({
          type: USER_INFO.MNR_TEAM,
          payload: true,
        });
        localStorage.setItem("mnr_team", true);
      }

      if (
        locationData?.truck_tracking === "" ||
        locationData?.truck_tracking === false ||
        locationData?.truck_tracking === "false" ||
        locationData?.truck_tracking === "False"
      ) {
        dispatch({
          type: USER_INFO.TRUCK_TRACKING,
          payload: false,
        });
        localStorage.setItem("truck_tracking", false);
      } else {
        dispatch({
          type: USER_INFO.TRUCK_TRACKING,
          payload: true,
        });
        localStorage.setItem("truck_tracking", true);
      }

      dispatch({
        type: USER_INFO.IS_PAID,
        payload: locationData?.payment_due_date,
      });
      localStorage.setItem("payment_due_date", locationData?.payment_due_date);

      localStorage.setItem(
        "automatic_mnr_status_change",
        locationData?.automatic_mnr_status_change
      );
    }
  }, [user?.site, gateIn?.allDropDown]);

  return !(dashboard.dashboardDetails && loaded(dashboard.dashboardDetails)) ? (
    <Loader />
  ) : (
    <LayoutContainer footer={false}>
      <Box marginLeft={3} marginRight={3} className={classes.boxContainer}>
        {/* top Section */}
        <Grid
          container
          spacing={2}
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Grid item xs={12} lg={7}>
            <Typography variant="h5">Dashboard</Typography>
          </Grid>
          <Grid
            item
            xs={12}
            lg={5}
            style={{
              display: "flex",
              alignItems: "center",
            }}
          >
            <Grid container spacing={2}>
              <Grid
                item
                xs={12}
                lg={6}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "flex-end",
                }}
              >
                <Typography
                  variant="subtitle1"
                  style={{ opacity: 0.7, width: matches && "30%" }}
                >
                  Location
                </Typography>
                <Paper
                  component={Button}
                  disabled={
                    (user.role === "Location Admin" ||
                      user.role === "Site Admin" ||
                      user.role === "Depot User" ||
                      user.role === "Loaded Yard") &&
                    true
                  }
                  onClick={handleLocationClick}
                  className={classes.dropdownPaper}
                >
                  <Typography>{user?.location}</Typography>
                  <KeyboardArrowDownIcon />
                </Paper>
                {anchorLocation && (
                  <Menu
                    id="simple-menu"
                    anchorEl={anchorLocation}
                    keepMounted
                    open={Boolean(anchorLocation)}
                    onClose={handleLocationClose}
                  >
                    {gateIn.allDropDown &&
                      gateIn.allDropDown.location_site_dashboard_list &&
                      Object.keys(
                        gateIn?.allDropDown.location_site_dashboard_list
                      ).map((loc, index) => (
                        <MenuItem
                          style={{ padding: "0px 25px" }}
                          key={index}
                          onClick={() => {
                            dispatch({ type: "SET_LOCATION", payload: loc });
                            dispatch({ type: "SET_SITE", payload: "" });
                            dispatch({
                              type: "SET_STOCK_ALLOT_SEARCH_LOCATION",
                              payload: loc,
                            });
                            dispatch({
                              type: "SET_MNR_SEARCH_LOCATION",
                              payload: loc,
                            });
                            localStorage.setItem("location", loc);
                            handleLocationClose();
                          }}
                        >
                          {loc}
                        </MenuItem>
                      ))}
                  </Menu>
                )}
              </Grid>
              <Grid
                item
                xs={12}
                lg={6}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "flex-end",
                }}
              >
                <Typography
                  variant="subtitle1"
                  style={{ opacity: 0.7, width: matches && "30%" }}
                >
                  Site
                </Typography>
                <Paper
                  component={Button}
                  onClick={handleSiteClick}
                  disabled={
                    (user.role === "Site Admin" ||
                      user.role === "Depot User" ||
                      (user.role === "Loaded Yard" && user.site !== "")) &&
                    true
                  }
                  className={classes.dropdownPaper}
                >
                  <Typography>{user.site}</Typography>
                  <KeyboardArrowDownIcon />
                </Paper>
                <Menu
                  id="simple-menu"
                  anchorEl={anchorSite}
                  keepMounted
                  open={Boolean(anchorSite)}
                  onClose={handleSiteClose}
                >
                  {user.location !== null &&
                    gateIn.allDropDown &&
                    gateIn.allDropDown.location_site_type_dashboard_list &&
                    gateIn.allDropDown.location_site_type_dashboard_list[
                      user.location
                    ].map((item, index) => (
                      <MenuItem
                        style={{ padding: "5px 70px 5px 70px" }}
                        key={index}
                        onClick={() => {
                          dispatch({ type: "SET_SITE", payload: item.site });
                          dispatch({ type: "SET_TYPE", payload: item.type });
                          dispatch({
                            type: "SET_MNR_MODULE",
                            payload: item.mnr_module,
                          });
                          dispatch({
                            type: "SET_PROCUREMENT_ADMIN",
                            payload: item.procurement_admin,
                          });
                          dispatch({
                            type: "SET_TRANPORTATION_MODULE",
                            payload: item.transportation_module,
                          });
                          dispatch({
                            type: "SET_LOADED_EMPTY_YARD_MODULE",
                            payload: item.loaded_yard_module,
                          });

                          dispatch({
                            type: "SET_PROCUREMENT_ADMIN",
                            payload: item.procurement_admin,
                          });

                          dispatch({
                            type: USER_INFO.PROCUREMENT_MODULE,
                            payload: item.procurement_module,
                          });
                          dispatch({
                            type: USER_INFO.LOLO_FINANCE_MODULE,
                            payload: item.lolo_finance,
                          });
                          dispatch({
                            type: USER_INFO.EN_BLOCK_MOVEMENT_MODULE,
                            payload: item.en_block_movement,
                          });
                          dispatch({
                            type:USER_INFO.EN_BLOCK_MOVEMENT_VERSION_2,
                            payload:item?.en_block_movement_v2
                          })
                          dispatch({
                            type: "SET_NEW_BILLING_MODULE",
                            payload: item.new_billing_module,
                          });
                          dispatch({
                            type: USER_INFO.MNR_TEAM,
                            payload: item.mnr_team,
                          });
                          dispatch({
                            type:USER_INFO.TRUCK_TRACKING,
                            payload :item.truck_tracking
                          })
                          dispatch({
                            type: USER_INFO.IS_PAID,
                            payload: item?.payment_due_date,
                          });
                          dispatch({
                            type: "SET_AUTO_STATUS_CHANGE",
                            payload: item.automatic_mnr_status_change,
                          });
                          dispatch({
                            type: "SET_STOCK_ALLOT_SEARCH_SITE",
                            payload: item.site,
                          });
                          dispatch({
                            type: "SET_MNR_SEARCH_SITE",
                            payload: item.site,
                          });
                          dispatch({
                            type: "SET_MNR_FTP_UPLOAD",
                            payload: item?.mnr_ftp_upload,
                          });
                          localStorage.setItem("site", item.site);
                          localStorage.setItem("type", item.type);
                          localStorage.setItem("mnr_module", item.mnr_module);
                          localStorage.setItem(
                            "mnr_ftp_upload",
                            item.mnr_ftp_upload
                          );
                          if (
                            item.transportation_module === "" ||
                            item.transportation_module === false
                          ) {
                            dispatch({
                              type: "SET_TRANSPORTATION_MODULE",
                              payload: false,
                            });
                            localStorage.setItem(
                              "transportation_module",
                              false
                            );
                          } else {
                            dispatch({
                              type: "SET_TRANSPORTATION_MODULE",
                              payload: true,
                            });
                            localStorage.setItem("transportation_module", true);
                          }
                          if (
                            item.new_billing_module === "" ||
                            item.new_billing_module === false
                          ) {
                            dispatch({
                              type: "SET_NEW_BILLING_MODULE",
                              payload: false,
                            });
                            localStorage.setItem("new_billing_module", false);
                          } else {
                            dispatch({
                              type: "SET_NEW_BILLING_MODULE",
                              payload: true,
                            });
                            localStorage.setItem("new_billing_module", true);
                          }

                          if (
                            item.loaded_yard_module === "" ||
                            item.loaded_yard_module === false
                          ) {
                            dispatch({
                              type: "SET_LOADED_EMPTY_YARD_MODULE",
                              payload: false,
                            });
                            localStorage.setItem("loaded_yard_module", false);
                          } else {
                            dispatch({
                              type: "SET_LOADED_EMPTY_YARD_MODULE",
                              payload: true,
                            });
                            localStorage.setItem("loaded_yard_module", true);
                          }

                          if (
                            item.lolo_finance === "" ||
                            item.lolo_finance === false
                          ) {
                            dispatch({
                              type: USER_INFO.LOLO_FINANCE_MODULE,
                              payload: false,
                            });
                            localStorage.setItem("lolo_finance", false);
                          } else {
                            dispatch({
                              type: USER_INFO.LOLO_FINANCE_MODULE,
                              payload: true,
                            });
                            localStorage.setItem("lolo_finance", true);
                          }

                          if (
                            item?.en_block_movement === "" ||
                            item?.en_block_movement === false ||
                            item?.en_block_movement === "false" ||
                            item?.en_block_movement === "False"
                          ) {
                            dispatch({
                              type: USER_INFO.EN_BLOCK_MOVEMENT_MODULE,
                              payload: false,
                            });
                            localStorage.setItem("en_block_movement", false);
                          } else {
                            dispatch({
                              type: USER_INFO.EN_BLOCK_MOVEMENT_MODULE,
                              payload: true,
                            });
                            localStorage.setItem("en_block_movement", true);
                          }

                          if (
                            item?.en_block_movement_v2 === "" ||
                            item?.en_block_movement_v2 === false ||
                            item?.en_block_movement_v2 === "false" ||
                            item?.en_block_movement_v2 === "False"
                          ) {
                            dispatch({
                              type: USER_INFO.EN_BLOCK_MOVEMENT_VERSION_2,
                              payload: false,
                            });
                            localStorage.setItem("en_block_movement_v2", false);
                          } else {
                            dispatch({
                              type: USER_INFO.EN_BLOCK_MOVEMENT_VERSION_2,
                              payload: true,
                            });
                            localStorage.setItem("en_block_movement_v2", true);
                          }

                          if (
                            item?.mnr_team === "" ||
                            item?.mnr_team === false ||
                            item?.mnr_team === "false" ||
                            item?.mnr_team === "False"
                          ) {
                            dispatch({
                              type: USER_INFO.MNR_TEAM,
                              payload: false,
                            });
                            localStorage.setItem("mnr_team", false);
                          } else {
                            dispatch({
                              type: USER_INFO.MNR_TEAM,
                              payload: true,
                            });
                            localStorage.setItem("mnr_team", true);
                          }
                          if (
                            item?.truck_tracking === "" ||
                            item?.truck_tracking === false ||
                            item?.truck_tracking === "false" ||
                            item?.truck_tracking === "False"
                          ) {
                            dispatch({
                              type: USER_INFO.TRUCK_TRACKING,
                              payload: false,
                            });
                            localStorage.setItem("truck_tracking", false);
                          } else {
                            dispatch({
                              type: USER_INFO.TRUCK_TRACKING,
                              payload: true,
                            });
                            localStorage.setItem("truck_tracking", true);
                          }

                          dispatch({
                            type: USER_INFO.IS_PAID,
                            payload: item?.payment_due_date,
                          });
                          localStorage.setItem("payment_due_date", item?.payment_due_date);

                          if (
                            item.procurement_module === "" ||
                            item.procurement_module === false
                          ) {
                            dispatch({
                              type: USER_INFO.PROCUREMENT_MODULE,
                              payload: false,
                            });
                            localStorage.setItem("procurement_module", false);
                          } else {
                            dispatch({
                              type: USER_INFO.PROCUREMENT_MODULE,
                              payload: true,
                            });
                            localStorage.setItem("procurement_module", true);
                          }

                          if (
                            item?.procurement_admin === "" ||
                            item?.procurement_admin === false
                          ) {
                            dispatch({
                              type: "SET_PROCUREMENT_ADMIN",
                              payload: false,
                            });
                            localStorage.setItem("procurement_admin", false);
                          } else {
                            dispatch({
                              type: "SET_PROCUREMENT_ADMIN",
                              payload: true,
                            });
                            localStorage.setItem("procurement_admin", true);
                          }

                          localStorage.setItem(
                            "automatic_mnr_status_change",
                            item.automatic_mnr_status_change
                          );
                          handleSiteClose();
                        }}
                      >
                        {item.site}
                      </MenuItem>
                    ))}
                </Menu>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
        <Snackbar
          open={openPaymentModal}
          autoHideDuration={6000}
          onClose={handleClosePament}
          anchorOrigin={{ horizontal: "left", vertical: "bottom" }}
        >
          <Box sx={style}>
            <Stack
              spacing={2}
              direction={"row"}
              alignItems={"center"}
              justifyContent={"flex-start"}
              flexDirection={"row"}
            >
              <Typography
                id="modal-modal-title-1"
                variant="subtitle1"
                component="h2"
                style={{ fontWeight: "bolder", color: "white" }}
              >
                Payment Reminder
              </Typography>
              <AccessAlarmIcon style={{ fill: "white" }} />
            </Stack>
            <Divider style={{ marginTop: "8px", backgroundColor: "white" }} />

            <Typography
              id="modal-modal-description-2"
              style={{ marginTop: "16px", color: "white" }}
              sx={{ mt: 4 }}
              variant="subtitle2"
            >
              Hi this is a reminder that your payment is due , your license will
              expire on {user?.payment_due_date} and account will be suspended , Please
              make payment urgently.
            </Typography>
          </Box>
        </Snackbar>

        {/* Movement summary section */}
        <RenderOnViewportEntry
          threshold={0.25}
          style={{ minHeight: user?.role !== "Loaded Yard" ? "300px" : "0" }}
        >
          {user?.role !== "Loaded Yard" ? (
            <CardContainer
              title={"Movement Summary"}
              timeDispatchAction={getMovementSummaryByTimeDispatch}
              isDispatch
            >
              {dashboard.dashboardDetails &&
              dashboard.dashboardDetails.movement_summary != null ? (
                <Grid container spacing={matches ? 0 : 2}>
                  <Grid item xs={12} sm={12} lg={6}>
                    <RenderOnViewportEntry threshold={0.25}>
                      <MovementCard
                        title={dashboard.ediSummary ? "EDI Inward" : "Inward"}
                        party={
                          dashboard.dashboardDetails &&
                          dashboard.dashboardDetails.movement_summary.inward
                            .party.count
                        }
                        line={
                          dashboard.dashboardDetails &&
                          dashboard.dashboardDetails.movement_summary.inward
                            .line.count
                        }
                        party_20={
                          dashboard.dashboardDetails &&
                          dashboard.dashboardDetails.movement_summary.inward
                            .party["20"]
                        }
                        party_40={
                          dashboard.dashboardDetails &&
                          dashboard.dashboardDetails.movement_summary.inward
                            .party["40"]
                        }
                        line_20={
                          dashboard.dashboardDetails &&
                          dashboard.dashboardDetails.movement_summary.inward
                            .line["20"]
                        }
                        line_40={
                          dashboard.dashboardDetails &&
                          dashboard.dashboardDetails.movement_summary.inward
                            .line["40"]
                        }
                      />
                    </RenderOnViewportEntry>
                  </Grid>

                  <Grid item xs={12} sm={12} lg={6}>
                    <RenderOnViewportEntry threshold={0.25}>
                      <MovementCard
                        title={dashboard.ediSummary ? "EDI Outward" : "Outward"}
                        party={
                          dashboard.dashboardDetails &&
                          dashboard.dashboardDetails.movement_summary.outward
                            .party.count
                        }
                        line={
                          dashboard.dashboardDetails &&
                          dashboard.dashboardDetails.movement_summary.outward
                            .line.count
                        }
                        party_20={
                          dashboard.dashboardDetails &&
                          dashboard.dashboardDetails.movement_summary.outward
                            .party["20"]
                        }
                        party_40={
                          dashboard.dashboardDetails &&
                          dashboard.dashboardDetails.movement_summary.outward
                            .party["40"]
                        }
                        line_20={
                          dashboard.dashboardDetails &&
                          dashboard.dashboardDetails.movement_summary.outward
                            .line["20"]
                        }
                        line_40={
                          dashboard.dashboardDetails &&
                          dashboard.dashboardDetails.movement_summary.outward
                            .line["40"]
                        }
                      />
                    </RenderOnViewportEntry>
                  </Grid>
                </Grid>
              ) : (
                <Loader type="Audio" color="#00BFFF" height={100} width={100} />
              )}
            </CardContainer>
          ) : (
            <Stack direction={"column"} flexDirection={"column"}>
              <img
                src="/static/media/login-containers.ac449d23.svg"
                alt="logo"
                style={{
                  width: "300px",
                  height: "400px",

                  margin: "auto",
                  marginTop: "48px",
                  marginBottom: "100px",
                  display: "block",
                }}
              />
            </Stack>
          )}
        </RenderOnViewportEntry>
        {/* Inventory section */}
        <RenderOnViewportEntry
          threshold={0.25}
          style={{ minHeight: user?.role !== "Loaded Yard" ? "300px" : "0" }}
        >
          {user?.role !== "Loaded Yard" && (
            <CardContainer
              title={"Inventory"}
              timeDispatchAction={getInventoryByTimeDispatch}
              isDispatch
            >
              <Grid container spacing={2}>
                <Grid item xs={12} sm={12} lg={6}>
                  <Fade left>
                    <AvailableCard title={"Available"} />
                  </Fade>
                </Grid>
                <Grid item xs={12} sm={12} lg={6}>
                  <Fade right>
                    <AllotmentCard title={"Allotment"} />
                  </Fade>
                </Grid>
              </Grid>
            </CardContainer>
          )}
        </RenderOnViewportEntry>

        <RenderOnViewportEntry
          threshold={0.25}
          style={{ minHeight: user?.role !== "Loaded Yard" ? "300px" : "0" }}
        >
          {user?.role !== "Loaded Yard" && (
            <CardContainer
              title={"Volume & Revenue"}
              timeDispatchAction={getVolumeAndRevenueByTimeDispatch}
              isDispatch
            >
              <Grid container style={{ marginTop: 20 }} spacing={2}>
                <Grid item xs={12} sm={12} lg={6}>
                  <Fade left>
                    <VolumeRevenueCard
                      title={"Volume"}
                      labels={
                        dashboard.dashboardDetails
                          ? dashboard.dashboardDetails?.volume_revenue_data
                              ?.label
                          : []
                      }
                      seriesData={[
                        {
                          name: "20",
                          data: dashboard?.dashboardDetails
                            ? dashboard.dashboardDetails?.volume_revenue_data
                                ?.volume["1"]?.data
                            : [],
                        },
                        {
                          name: "40",
                          data: dashboard.dashboardDetails
                            ? dashboard?.dashboardDetails.volume_revenue_data
                                ?.volume["2"]?.data
                            : [],
                        },
                        {
                          name: "Other",
                          data: dashboard.dashboardDetails
                            ? dashboard.dashboardDetails?.volume_revenue_data
                                ?.volume["3"]?.data
                            : [],
                        },
                      ]}
                    />
                  </Fade>
                </Grid>
                <Grid item xs={12} sm={12} lg={6}>
                  <Fade right>
                    <VolumeRevenueCard
                      title={"Revenue"}
                      labels={
                        dashboard.dashboardDetails
                          ? dashboard.dashboardDetails.volume_revenue_data.label
                          : []
                      }
                      seriesData={[
                        {
                          name: "20",
                          data: dashboard.dashboardDetails
                            ? dashboard.dashboardDetails.volume_revenue_data
                                .revenue["1"].data
                            : [],
                        },
                        {
                          name: "40",
                          data: dashboard.dashboardDetails
                            ? dashboard.dashboardDetails.volume_revenue_data
                                .revenue["2"].data
                            : [],
                        },
                        {
                          name: "Other",
                          data: dashboard.dashboardDetails
                            ? dashboard.dashboardDetails.volume_revenue_data
                                .revenue["3"].data
                            : [],
                        },
                      ]}
                    />
                  </Fade>
                </Grid>
              </Grid>
            </CardContainer>
          )}
        </RenderOnViewportEntry>

        {/* Revenue section */}

        <RenderOnViewportEntry
          threshold={0.25}
          style={{ minHeight: user?.role !== "Loaded Yard" ? "300px" : "0" }}
        >
          {user?.role !== "Loaded Yard" && (
            <CardContainer
              title={"Revenue"}
              timeDispatchAction={getRevenueByTimeDispatch}
            >
              <Grid container spacing={matches ? 1 : 2}>
                <Grid item xs={6} sm={6} lg={3}>
                  <Flip top>
                    <RevenueCard
                      total={
                        dashboard.dashboardDetails &&
                        dashboard.dashboardDetails.revenue_data.handling_in
                      }
                      title={"Handling In"}
                    />
                  </Flip>
                </Grid>
                <Grid item xs={6} sm={6} lg={3}>
                  <Flip top>
                    <RevenueCard
                      total={
                        dashboard.dashboardDetails &&
                        dashboard.dashboardDetails.revenue_data.handling_out
                      }
                      title={"Handling Out"}
                    />
                  </Flip>
                </Grid>
                <Grid item xs={6} sm={6} lg={3}>
                  <Flip top>
                    <RevenueCard
                      total={
                        dashboard.dashboardDetails &&
                        dashboard.dashboardDetails.revenue_data.transportation
                      }
                      title={"Transportation"}
                    />
                  </Flip>
                </Grid>

                <Grid item xs={6} sm={6} lg={3}>
                  <Flip top>
                    <RevenueCard total={675} title={"Ground Rent"} />
                  </Flip>
                </Grid>
              </Grid>
            </CardContainer>
          )}
        </RenderOnViewportEntry>

        <RenderOnViewportEntry
          threshold={0.25}
          style={{ minHeight: user?.role !== "Loaded Yard" ? "300px" : "0" }}
        >
          {user?.role !== "Loaded Yard" && (
            <CardContainer
              title={"Client"}
              timeDispatchAction={getTopClientRevenueByTimeDispatch}
            >
              <Grid container spacing={3}>
                <Grid item xs={12} md={12}>
                  {/* <Fade top> */}
                  <ClientCard
                    labels={
                      dashboard.dashboardDetails &&
                      dashboard.dashboardDetails.top_client_revenue_data.label
                        .length > 0
                        ? dashboard.dashboardDetails.top_client_revenue_data
                            .label
                        : [
                            "Client-1",
                            "Client-2",
                            "Client-3",
                            "Client-4",
                            "Client-5",
                          ]
                    }
                  />
                  {/* </Fade> */}
                </Grid>
              </Grid>
            </CardContainer>
          )}
        </RenderOnViewportEntry>
      </Box>
      <Backdrop className={classes.backdrop} open={ui.isloading}>
        <CircularProgress color="inherit" />
      </Backdrop>
    </LayoutContainer>
  );
};

export default Dashboard;
