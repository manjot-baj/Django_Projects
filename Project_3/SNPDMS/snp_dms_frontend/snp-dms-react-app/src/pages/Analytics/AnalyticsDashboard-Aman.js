import React, { useEffect } from "react";
import jwt_decode from "jwt-decode";
import {
  makeStyles,
  Typography,
  Box,
  Grid,
  useTheme,
  useMediaQuery,
  Backdrop,
  CircularProgress,
  Paper,
  Button,
  Menu,
  MenuItem,
} from "@material-ui/core";
import { useHistory } from "react-router-dom";

import LayoutContainer from "../../components/reusableComponents/LayoutContainer";
import DashboardCardContainer from "../../components/analytics/DashboardCardContainer";
// movement
import MovementCard from "../../components/analytics/MovementCard";
import { useDispatch, useSelector } from "react-redux";
import { getAnalyticsListings } from "../../actions/AnalyticsActions";
import Loader from "../../components/analytics/Loader";
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

const drawerWidth = 220;

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
  backdrop: {
    zIndex: theme.zIndex.drawer + 1,
    color: "#fff",
  },
}));

const AnalyticsDashboard = () => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const store = useSelector((state) => state);

  const { analytics, ui, user, gateIn } = store;
  const history = useHistory();
  const notify = useSnackbar().enqueueSnackbar;
  const theme = useTheme();
  const matches = useMediaQuery(theme.breakpoints.down("xs"));

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
        dispatch(getAnalyticsListings());
        dispatch(dropDownDispatch(reqArray, notify));
      }
    } else {
      history.push("/login");
    }
  }, []);

  return (
    <LayoutContainer footer={false}>
      <Box marginLeft={3} marginRight={3}>
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
            <Typography variant="h5">Analytics Dashboard</Typography>
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
                style={{ display: "flex", alignItems: "center" }}
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
                style={{ display: "flex", alignItems: "center" }}
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
                            localStorage.setItem(
                              "new_billing_module",
                              false
                            );
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
                            localStorage.setItem(
                              "loaded_yard_module",
                              false
                            );
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
                            localStorage.setItem(
                              "lolo_finance",
                              false
                            );
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
                            localStorage.setItem(
                              "procurement_module",
                              false
                            );
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
        </Grid>
        {/* LOLO IN */}
        {/* OVERALL */}
        <DashboardCardContainer
          title={"Lolo IN"}
          timeDispatchAction={getQuarterlyLoLoSTVolumeRevenueData}
          process={"lolo"}
          movement={"IN"}
          phase={"Overall"}
        >
          {analytics.allAnalyticsListing &&
          analytics.allAnalyticsListing.lolo_in_volume_revenue_data != null ? (
            <Grid container spacing={matches ? 0 : 2}>
              <Grid item xs={12} sm={12} lg={12}>
                <MovementCard
                  title={"Overall"}
                  data={
                    analytics.allAnalyticsListing.lolo_in_volume_revenue_data
                      .data
                  }
                  fromDate={
                    analytics.allAnalyticsListing.lolo_in_volume_revenue_data
                      .from_date
                  }
                  toDate={
                    analytics.allAnalyticsListing.lolo_in_volume_revenue_data
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
        {/* WEEKLY */}
        <DashboardCardContainer
          title={"Lolo IN"}
          timeDispatchAction={getWeeklyLoLoSTVolumeRevenueData}
          process={"lolo"}
          movement={"IN"}
          phase={"Weekly"}
        >
          {analytics.allAnalyticsListing &&
          analytics.allAnalyticsListing.lolo_in_weekly_volume_revenue_data !=
            null ? (
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
        {/* LOLO OUT */}
        {/* OVERALL */}
        <DashboardCardContainer
          title={"Lolo OUT"}
          timeDispatchAction={getQuarterlyLoLoSTVolumeRevenueData}
          process={"lolo"}
          movement={"OUT"}
          phase={"Overall"}
        >
          {analytics.allAnalyticsListing &&
          analytics.allAnalyticsListing.lolo_out_volume_revenue_data != null ? (
            <Grid container spacing={matches ? 0 : 2}>
              <Grid item xs={12} sm={12} lg={12}>
                <MovementCard
                  title={"Overall"}
                  data={
                    analytics.allAnalyticsListing.lolo_out_volume_revenue_data
                      .data
                  }
                  fromDate={
                    analytics.allAnalyticsListing.lolo_out_volume_revenue_data
                      .from_date
                  }
                  toDate={
                    analytics.allAnalyticsListing.lolo_out_volume_revenue_data
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
        {/* WEEKLY */}
        <DashboardCardContainer
          title={"Lolo OUT"}
          timeDispatchAction={getWeeklyLoLoSTVolumeRevenueData}
          process={"lolo"}
          movement={"OUT"}
          phase={"Weekly"}
        >
          {analytics.allAnalyticsListing &&
          analytics.allAnalyticsListing.lolo_out_weekly_volume_revenue_data !=
            null ? (
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
        {/* MNR */}
        {/* OVERALL */}
        <DashboardCardContainer
          title={"MNR"}
          timeDispatchAction={getQuarterlyMNRVolumeRevenueData}
          phase={"Overall"}
        >
          {analytics.allAnalyticsListing &&
          analytics.allAnalyticsListing.mnr_volume_revenue_data != null ? (
            <Grid container spacing={matches ? 0 : 2}>
              <Grid item xs={12} sm={12} lg={12}>
                <MovementCard
                  title={"Overall"}
                  data={
                    analytics.allAnalyticsListing.mnr_volume_revenue_data.data
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
        {/* WEEKLY */}
        <DashboardCardContainer
          title={"MNR"}
          timeDispatchAction={getWeeklyMNRVolumeRevenueData}
          phase={"Weekly"}
        >
          {analytics.allAnalyticsListing &&
          analytics.allAnalyticsListing.mnr_weekly_volume_revenue_data !=
            null ? (
            <Grid container spacing={matches ? 0 : 2}>
              <Grid item xs={12} sm={12} lg={6}>
                <MovementCard
                  title={"Weekly Volume"}
                  data={
                    analytics.allAnalyticsListing.mnr_weekly_volume_revenue_data
                  }
                />
              </Grid>

              <Grid item xs={12} sm={12} lg={6}>
                <MovementCard
                  title={"Weekly Revenue"}
                  data={
                    analytics.allAnalyticsListing.mnr_weekly_volume_revenue_data
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
        {/* ST IN */}
        {/* OVERALL */}
        <DashboardCardContainer
          title={"Self Transportation IN"}
          timeDispatchAction={getQuarterlyLoLoSTVolumeRevenueData}
          process={"st"}
          movement={"IN"}
          phase={"Overall"}
        >
          {analytics.allAnalyticsListing &&
          analytics.allAnalyticsListing.st_in_volume_revenue_data != null ? (
            <Grid container spacing={matches ? 0 : 2}>
              <Grid item xs={12} sm={12} lg={12}>
                <MovementCard
                  title={"Overall"}
                  data={
                    analytics.allAnalyticsListing.st_in_volume_revenue_data.data
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
        {/* WEEKLY */}
        <DashboardCardContainer
          title={"Self Transportation IN"}
          timeDispatchAction={getWeeklyLoLoSTVolumeRevenueData}
          process={"st"}
          movement={"IN"}
          phase={"Weekly"}
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
        {/* ST OUT */}
        {/* OVERALL */}
        <DashboardCardContainer
          title={"Self Transportation OUT"}
          timeDispatchAction={getQuarterlyLoLoSTVolumeRevenueData}
          process={"st"}
          movement={"OUT"}
          phase={"Overall"}
        >
          {analytics.allAnalyticsListing &&
          analytics.allAnalyticsListing.st_out_volume_revenue_data != null ? (
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
        {/* WEEKLY */}
        <DashboardCardContainer
          title={"Self Transportation OUT"}
          timeDispatchAction={getWeeklyLoLoSTVolumeRevenueData}
          process={"st"}
          movement={"OUT"}
          phase={"Weekly"}
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
      </Box>
      <Backdrop className={classes.backdrop} open={ui.isloading}>
        <CircularProgress color="inherit" />
      </Backdrop>
    </LayoutContainer>
  );
};

export default AnalyticsDashboard;
