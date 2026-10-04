import React, { useEffect, useState } from "react";
import jwt_decode from "jwt-decode";
import {
  makeStyles,
  Typography,
  Box,
  Grid,
  useTheme,
  useMediaQuery,
  CircularProgress,
  Paper,
  Button,
  Menu,
  MenuItem,
  Tabs,
  Tab,
  Tooltip,
} from "@material-ui/core";
import { useHistory } from "react-router-dom";
import PropTypes from "prop-types";
import LayoutContainer from "../../components/reusableComponents/LayoutContainer";

// movement
import MovementCard from "../../components/analytics/MovementCard";
import { useDispatch, useSelector } from "react-redux";
import { useSnackbar } from "notistack";
import { dropDownDispatch } from "../../actions/GateInActions";
import KeyboardArrowDownIcon from "@material-ui/icons/KeyboardArrowDown";

import {
  getQuarterlyLoLoSTVolumeRevenueData,
  getQuarterlyMNRVolumeRevenueData,
  getWeeklyLoLoSTVolumeRevenueData,
  getWeeklyMNRVolumeRevenueData,
} from "../../actions/AnalyticsActions";
import { USER_INFO } from "../../reducers/UserReducer";
import RenderOnViewportEntry from "../../utils/RenderOnViewPort";
import { Stack } from "@mui/material";
import { cacheCleanService } from "../../utils/WeekNumbre";
import CleaningServicesIcon from "@mui/icons-material/CleaningServices";

const DashboardCardContainer = React.lazy(() =>
  import("../../components/analytics/DashboardCardContainer")
);

const drawerWidth = 220;

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
  tabsStyle: {
    "& .MuiTabs-indicator": {
      display: "none !important",
    },
  },
  tabNew: {
    border: "2px solid #2a5fa5 ",
    color: "black",
    fontWeight: "bold",
    borderRadius: "5px",
    marginRight: "20px",
    "&.Mui-selected": {
      backgroundColor: "#2a5fa5",
      border: "none",
      color: "white",
      fontWeight: "bold",
    },
  },
  componentLoader: {
    alignSelf: "center",
    marginTop: window.innerHeight / 3,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
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
}));

const AnalyticsDashboard = () => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const store = useSelector((state) => state);
  const [tabValue, setTabValue] = React.useState(0);
  const { analytics, ui, user, gateIn } = store;
  const history = useHistory();
  const notify = useSnackbar().enqueueSnackbar;
  const theme = useTheme();
  const matches = useMediaQuery(theme.breakpoints.down("xs"));
  const [cacheLoader, setCacheLoader] = useState(false);
  const [anchorLocation, setAnchorLocation] = React.useState(null);
  const [anchorSite, setAnchorSite] = React.useState(null);
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
        // dispatch(getAnalyticsListings());
        dispatch(dropDownDispatch(reqArray, notify, true));
      }
    } else {
      history.push("/login");
    }
  }, []);

  const handleChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleCleanCache = () => {
    cacheCleanService(setCacheLoader, notify, dispatch);
  };

  return (
    <LayoutContainer footer={false}>
      <Box marginLeft={3} marginRight={3} paddingTop={4}>
        <Grid
          container
          spacing={2}
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            width: "100%", // added full width for proper display of location and site selectbox
          }}
        >
          <Grid item xs={12} lg={4}>
            <Typography variant="h5">Analytics Dashboard</Typography>
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
            <Grid
              container
              spacing={2}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-end",
              }}
            >
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
                            type: "SET_TRANPORTATION_MODULE",
                            payload: item.transportation_module,
                          });
                          dispatch({
                            type: "SET_NEW_BILLING_MODULE",
                            payload: item.new_billing_module,
                          });
                          dispatch({
                            type: "SET_LOADED_EMPTY_YARD_MODULE",
                            payload: item.loaded_yard_module,
                          });
                          dispatch({
                            type:USER_INFO.LOLO_FINANCE_MODULE,
                            payload:item.lolo_finance
                          })
                          dispatch({
                            type: USER_INFO.PROCUREMENT_MODULE,
                            payload: item.procurement_module,
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
                          localStorage.setItem("site", item.site);
                          localStorage.setItem("type", item.type);
                          localStorage.setItem("mnr_module", item.mnr_module);
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
          <Grid item xs={12} lg={2}>
            <Tooltip title={"Clean Analytics  Data "} placement="bottom">
              <Button
                onClick={handleCleanCache}
                style={{ border: "2px solid #2a5fa5" }}
              >
                <CleaningServicesIcon
                  style={{ fill: "#2a5fa5" }}
                  fontSize="small"
                />
                <Typography
                  variant="subtitle2"
                  style={{
                    color: "#2a5fa5",
                    fontWeight: "bold",
                    marginRight: "8px",
                  }}
                >
                  Clean Cache
                </Typography>
              </Button>
            </Tooltip>
          </Grid>
          <Stack
            flexDirection={"row"}
            alignItems={"center"}
            marginTop={5}
            justifyContent={"center"}
            alignContent={"center"}
            padding={2}
            borderRadius={5}
            width={"100%"}
          >
            <Tabs
              value={tabValue}
              onChange={handleChange}
              aria-label="basic tabs example"
              className={classes.tabsStyle}
            >
              <Tab className={classes.tabNew} label="Lolo" {...a11yProps(0)} />
              <Tab className={classes.tabNew} label="MNR" {...a11yProps(1)} />
              <Tab className={classes.tabNew} label="ST" {...a11yProps(2)} />
            </Tabs>
          </Stack>
        </Grid>
        {/* LOLO IN */}
        {/* OVERALL */}
        <CustomTabPanel value={tabValue} index={0}>
          <RenderOnViewportEntry
            threshold={0.25}
            style={{ minHeight: "240px" }}
          >
            <DashboardCardContainer
              title={"Lolo IN"}
              timeDispatchAction={getQuarterlyLoLoSTVolumeRevenueData}
              process={"lolo"}
              movement={"IN"}
              phase={"Overall"}
              dashboard={true}
              cache={
                analytics.allAnalyticsListing.lolo_in_volume_revenue_data?.cache
              }
            >
              {analytics.allAnalyticsListing &&
              analytics.allAnalyticsListing.lolo_in_volume_revenue_data !=
                null ? (
                <Grid container spacing={matches ? 0 : 2}>
                  <Grid item xs={12} sm={12} lg={12}>
                    <MovementCard
                      title={"Overall"}
                      data={
                        analytics.allAnalyticsListing
                          .lolo_in_volume_revenue_data.data
                      }
                      fromDate={
                        analytics.allAnalyticsListing
                          .lolo_in_volume_revenue_data.from_date
                      }
                      toDate={
                        analytics.allAnalyticsListing
                          .lolo_in_volume_revenue_data.to_date
                      }
                    />
                  </Grid>
                </Grid>
              ) : (
                <div className={classes.componentLoader}>
                  <CircularProgress color="inherit" />
                </div>
              )}
            </DashboardCardContainer>
          </RenderOnViewportEntry>

          {/* WEEKLY */}

          <RenderOnViewportEntry
            threshold={0.25}
            style={{ minHeight: "240px" }}
          >
            <DashboardCardContainer
              title={"Lolo IN"}
              timeDispatchAction={getWeeklyLoLoSTVolumeRevenueData}
              process={"lolo"}
              movement={"IN"}
              phase={"Weekly"}
              cache={
                analytics.allAnalyticsListing.lolo_in_weekly_volume_revenue_data
                  ?.cache
              }
            >
              {analytics.allAnalyticsListing &&
              analytics.allAnalyticsListing
                .lolo_in_weekly_volume_revenue_data != null ? (
                <Grid container spacing={matches ? 0 : 2}>
                  <Grid item xs={12} sm={12} lg={6}>
                    <MovementCard
                      title={"Weekly Volume"}
                      data={
                        analytics.allAnalyticsListing
                          .lolo_in_weekly_volume_revenue_data
                      }
                    />
                  </Grid>

                  <Grid item xs={12} sm={12} lg={6}>
                    <MovementCard
                      title={"Weekly Revenue"}
                      data={
                        analytics.allAnalyticsListing
                          .lolo_in_weekly_volume_revenue_data
                      }
                    />
                  </Grid>
                </Grid>
              ) : (
                <div className={classes.componentLoader}>
                  <CircularProgress color="inherit" />
                </div>
              )}
            </DashboardCardContainer>
          </RenderOnViewportEntry>

          {/* LOLO OUT */}
          {/* OVERALL */}

          <RenderOnViewportEntry
            threshold={0.25}
            style={{ minHeight: "240px" }}
          >
            <DashboardCardContainer
              title={"Lolo OUT"}
              timeDispatchAction={getQuarterlyLoLoSTVolumeRevenueData}
              process={"lolo"}
              movement={"OUT"}
              phase={"Overall"}
              cache={
                analytics.allAnalyticsListing.lolo_out_volume_revenue_data
                  ?.cache
              }
            >
              {analytics.allAnalyticsListing &&
              analytics.allAnalyticsListing.lolo_out_volume_revenue_data !=
                null ? (
                <Grid container spacing={matches ? 0 : 2}>
                  <Grid item xs={12} sm={12} lg={12}>
                    <MovementCard
                      title={"Overall"}
                      data={
                        analytics.allAnalyticsListing
                          .lolo_out_volume_revenue_data.data
                      }
                      fromDate={
                        analytics.allAnalyticsListing
                          .lolo_out_volume_revenue_data.from_date
                      }
                      toDate={
                        analytics.allAnalyticsListing
                          .lolo_out_volume_revenue_data.to_date
                      }
                    />
                  </Grid>
                </Grid>
              ) : (
                <div className={classes.componentLoader}>
                  <CircularProgress color="inherit" />
                </div>
              )}
            </DashboardCardContainer>
          </RenderOnViewportEntry>

          {/* WEEKLY */}

          <RenderOnViewportEntry
            threshold={0.25}
            style={{ minHeight: "240px" }}
          >
            <DashboardCardContainer
              title={"Lolo OUT"}
              timeDispatchAction={getWeeklyLoLoSTVolumeRevenueData}
              process={"lolo"}
              movement={"OUT"}
              phase={"Weekly"}
              cache={
                analytics.allAnalyticsListing
                  .lolo_out_weekly_volume_revenue_data?.cache
              }
            >
              {analytics.allAnalyticsListing &&
              analytics.allAnalyticsListing
                .lolo_out_weekly_volume_revenue_data != null ? (
                <Grid container spacing={matches ? 0 : 2}>
                  <Grid item xs={12} sm={12} lg={6}>
                    <MovementCard
                      title={"Weekly Volume"}
                      data={
                        analytics.allAnalyticsListing
                          .lolo_out_weekly_volume_revenue_data
                      }
                    />
                  </Grid>

                  <Grid item xs={12} sm={12} lg={6}>
                    <MovementCard
                      title={"Weekly Revenue"}
                      data={
                        analytics.allAnalyticsListing
                          .lolo_out_weekly_volume_revenue_data
                      }
                    />
                  </Grid>
                </Grid>
              ) : (
                <div className={classes.componentLoader}>
                  <CircularProgress color="inherit" />
                </div>
              )}
            </DashboardCardContainer>
          </RenderOnViewportEntry>
        </CustomTabPanel>
        <CustomTabPanel value={tabValue} index={1}>
          <RenderOnViewportEntry
            threshold={0.25}
            style={{ minHeight: "240px" }}
          >
            <DashboardCardContainer
              title={"MNR"}
              timeDispatchAction={getQuarterlyMNRVolumeRevenueData}
              phase={"Overall"}
              dashboard={true}
              cache={
                analytics.allAnalyticsListing.mnr_volume_revenue_data?.cache
              }
            >
              {analytics.allAnalyticsListing &&
              analytics.allAnalyticsListing.mnr_volume_revenue_data != null ? (
                <Grid container spacing={matches ? 0 : 2}>
                  <Grid item xs={12} sm={12} lg={12}>
                    <MovementCard
                      title={"Overall"}
                      data={
                        analytics.allAnalyticsListing.mnr_volume_revenue_data
                          .data
                      }
                      fromDate={
                        analytics.allAnalyticsListing.mnr_volume_revenue_data
                          .from_date
                      }
                      toDate={
                        analytics.allAnalyticsListing.mnr_volume_revenue_data
                          .to_date
                      }
                    />
                  </Grid>
                </Grid>
              ) : (
                <div className={classes.componentLoader}>
                  <CircularProgress color="inherit" />
                </div>
              )}
            </DashboardCardContainer>
          </RenderOnViewportEntry>

          {/* WEEKLY */}

          <RenderOnViewportEntry
            threshold={0.25}
            style={{ minHeight: "240px" }}
          >
            <DashboardCardContainer
              title={"MNR"}
              timeDispatchAction={getWeeklyMNRVolumeRevenueData}
              phase={"Weekly"}
              cache={
                analytics.allAnalyticsListing.mnr_weekly_volume_revenue_data
                  ?.cache
              }
            >
              {analytics.allAnalyticsListing &&
              analytics.allAnalyticsListing.mnr_weekly_volume_revenue_data !=
                null ? (
                <Grid container spacing={matches ? 0 : 2}>
                  <Grid item xs={12} sm={12} lg={6}>
                    <MovementCard
                      title={"Weekly Volume"}
                      data={
                        analytics.allAnalyticsListing
                          .mnr_weekly_volume_revenue_data
                      }
                    />
                  </Grid>

                  <Grid item xs={12} sm={12} lg={6}>
                    <MovementCard
                      title={"Weekly Revenue"}
                      data={
                        analytics.allAnalyticsListing
                          .mnr_weekly_volume_revenue_data
                      }
                    />
                  </Grid>
                </Grid>
              ) : (
                <div className={classes.componentLoader}>
                  <CircularProgress color="inherit" />
                </div>
              )}
            </DashboardCardContainer>
          </RenderOnViewportEntry>
        </CustomTabPanel>
        <CustomTabPanel value={tabValue} index={2}>
          <RenderOnViewportEntry
            threshold={0.25}
            style={{ minHeight: "240px" }}
          >
            <DashboardCardContainer
              title={"Self Transportation IN"}
              timeDispatchAction={getQuarterlyLoLoSTVolumeRevenueData}
              process={"st"}
              movement={"IN"}
              phase={"Overall"}
              dashboard={true}
              cache={
                analytics.allAnalyticsListing.st_in_volume_revenue_data?.cache
              }
            >
              {analytics.allAnalyticsListing &&
              analytics.allAnalyticsListing.st_in_volume_revenue_data !=
                null ? (
                <Grid container spacing={matches ? 0 : 2}>
                  <Grid item xs={12} sm={12} lg={12}>
                    <MovementCard
                      title={"Overall"}
                      data={
                        analytics.allAnalyticsListing.st_in_volume_revenue_data
                          .data
                      }
                      fromDate={
                        analytics.allAnalyticsListing.st_in_volume_revenue_data
                          .from_date
                      }
                      toDate={
                        analytics.allAnalyticsListing.st_in_volume_revenue_data
                          .to_date
                      }
                    />
                  </Grid>
                </Grid>
              ) : (
                <div className={classes.componentLoader}>
                  <CircularProgress color="inherit" />
                </div>
              )}
            </DashboardCardContainer>
          </RenderOnViewportEntry>

          {/* WEEKLY */}
          <RenderOnViewportEntry
            threshold={0.25}
            style={{ minHeight: "240px" }}
          >
            <DashboardCardContainer
              title={"Self Transportation IN"}
              timeDispatchAction={getWeeklyLoLoSTVolumeRevenueData}
              process={"st"}
              movement={"IN"}
              phase={"Weekly"}
              cache={
                analytics.allAnalyticsListing.st_in_weekly_volume_revenue_data
                  ?.cache
              }
            >
              {analytics.allAnalyticsListing &&
              analytics.allAnalyticsListing.st_in_weekly_volume_revenue_data !=
                null ? (
                <Grid container spacing={matches ? 0 : 2}>
                  <Grid item xs={12} sm={12} lg={6}>
                    <MovementCard
                      title={"Weekly Volume"}
                      data={
                        analytics.allAnalyticsListing
                          .st_in_weekly_volume_revenue_data
                      }
                    />
                  </Grid>

                  <Grid item xs={12} sm={12} lg={6}>
                    <MovementCard
                      title={"Weekly Revenue"}
                      data={
                        analytics.allAnalyticsListing
                          .st_in_weekly_volume_revenue_data
                      }
                    />
                  </Grid>
                </Grid>
              ) : (
                <div className={classes.componentLoader}>
                  <CircularProgress color="inherit" />
                </div>
              )}
            </DashboardCardContainer>
          </RenderOnViewportEntry>

          {/* ST OUT */}
          {/* OVERALL */}
          <RenderOnViewportEntry
            threshold={0.25}
            style={{ minHeight: "240px" }}
          >
            <DashboardCardContainer
              title={"Self Transportation OUT"}
              timeDispatchAction={getQuarterlyLoLoSTVolumeRevenueData}
              process={"st"}
              movement={"OUT"}
              phase={"Overall"}
              cache={
                analytics.allAnalyticsListing.st_out_volume_revenue_data?.cache
              }
            >
              {analytics.allAnalyticsListing &&
              analytics.allAnalyticsListing.st_out_volume_revenue_data !=
                null ? (
                <Grid container spacing={matches ? 0 : 2}>
                  <Grid item xs={12} sm={12} lg={12}>
                    <MovementCard
                      title={"Overall"}
                      data={
                        analytics.allAnalyticsListing.st_out_volume_revenue_data
                          .data
                      }
                      fromDate={
                        analytics.allAnalyticsListing.st_out_volume_revenue_data
                          .from_date
                      }
                      toDate={
                        analytics.allAnalyticsListing.st_out_volume_revenue_data
                          .to_date
                      }
                    />
                  </Grid>
                </Grid>
              ) : (
                <div className={classes.componentLoader}>
                  <CircularProgress color="inherit" />
                </div>
              )}
            </DashboardCardContainer>
          </RenderOnViewportEntry>

          {/* WEEKLY */}
          <RenderOnViewportEntry
            threshold={0.25}
            style={{ minHeight: "240px" }}
          >
            <DashboardCardContainer
              title={"Self Transportation OUT"}
              timeDispatchAction={getWeeklyLoLoSTVolumeRevenueData}
              process={"st"}
              movement={"OUT"}
              phase={"Weekly"}
              cache={
                analytics.allAnalyticsListing.st_out_weekly_volume_revenue_data
                  ?.cache
              }
            >
              {analytics.allAnalyticsListing &&
              analytics.allAnalyticsListing.st_out_weekly_volume_revenue_data !=
                null ? (
                <Grid container spacing={matches ? 0 : 2}>
                  <Grid item xs={12} sm={12} lg={6}>
                    <MovementCard
                      title={"Weekly Volume"}
                      data={
                        analytics.allAnalyticsListing
                          .st_out_weekly_volume_revenue_data
                      }
                    />
                  </Grid>

                  <Grid item xs={12} sm={12} lg={6}>
                    <MovementCard
                      title={"Weekly Revenue"}
                      data={
                        analytics.allAnalyticsListing
                          .st_out_weekly_volume_revenue_data
                      }
                    />
                  </Grid>
                </Grid>
              ) : (
                <div className={classes.componentLoader}>
                  <CircularProgress color="inherit" />
                </div>
              )}
            </DashboardCardContainer>
          </RenderOnViewportEntry>
        </CustomTabPanel>

        {/* MNR */}
        {/* OVERALL */}

        {/* ST IN */}
        {/* OVERALL */}
      </Box>
    </LayoutContainer>
  );
};

export default AnalyticsDashboard;
