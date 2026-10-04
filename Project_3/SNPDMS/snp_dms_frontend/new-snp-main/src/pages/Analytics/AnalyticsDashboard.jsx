import React, { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import {
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
} from "@mui/material";
import { useHistory } from "react-router-dom";
import PropTypes from "prop-types";
import LayoutContainer from "@components/reusablecomponents/LayoutContainer";

// movement
import MovementCard from "../../components/analytics/MovementCard";
import { useDispatch, useSelector } from "react-redux";
import { useSnackbar } from "notistack";
import { dropDownDispatch } from "../../actions/GateInActions";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";

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
import DashboardCardContainer from "../../components/analytics/DashboardCardContainer";
import { TableStyledTab } from "@/components/TableComponent/TableComponent";
import Skeleton from '@mui/material/Skeleton';

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
        <Box
          sx={(theme) => ({
            p: 3,
            [theme.breakpoints.down("sm")]: {
              p: 0,
            },
          })}
        >
          {children}
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

const componentLoaderStyle = (theme) => ({
  alignSelf: "center",
  marginTop: window.innerHeight / 3,
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
});

const AnalyticsDashboard = () => {
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

  const LoadingContainer = ({ height = 240 }) => (
  <Box
    sx={{
      minHeight: height,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#f0f0f0',
      borderRadius: 2,
    }}
  >
    <CircularProgress color="inherit" size={32} />
  </Box>
);
  // Check if the token is expired if yes then push to login
  useEffect(() => {
    var token = localStorage.getItem("accessToken");
    if (token) {
      var decode = jwtDecode(token);
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
      <Box
        paddingTop={4}
        sx={(theme) => ({
          marginLeft: 3,
          marginRight: 3,
          [theme.breakpoints.down("sm")]: {
            marginLeft: 0,
            marginRight: 0,
          },
        })}
      >
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
          <Grid item size={{ xs: 12, lg: 4 }}>
            <Typography variant="h5">Analytics Dashboard</Typography>
          </Grid>

          <Grid
            item
            size={{ xs: 12, lg: 6 }}
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
                size={{ xs: 12, lg: 6 }}
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
                  sx={(theme) => ({
                    marginLeft: 4,
                    width: "240px",
                    padding: theme.spacing(0.75, 1),
                    borderRadius: 2,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    backgroundColor: "#fff",
                    [theme.breakpoints.down("sm")]: {
                      maxWidth: "320px",
                    },
                  })}
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
                size={{ xs: 12, lg: 6 }}
                sx={(theme) => ({
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "flex-end",
                  [theme.breakpoints.down("sm")]: {
                    justifyContent: "space-between",
                  },
                })}
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
                  sx={(theme) => ({
                    marginLeft: 4,
                    width: "240px",
                    padding: theme.spacing(0.75, 1),
                    borderRadius: 2,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    backgroundColor: "#fff",
                    [theme.breakpoints.down("md")]: {
                      maxWidth: "320px",
                    },
                  })}
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
                            type: USER_INFO.LOLO_FINANCE_MODULE,
                            payload: item.lolo_finance,
                          });
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
          <Grid item size={{ xs: 12, lg: 2 }}>
            <Tooltip title={"Clean Analytics  Data "} placement="bottom">
              <Button
                onClick={handleCleanCache}
                startIcon={<CleaningServicesIcon fontSize="small" />}
                variant="text"
                color="primary"
              >
                Clean Cache
              </Button>
            </Tooltip>
          </Grid>
          <Stack
            flexDirection={"row"}
            alignItems={"center"}
            marginTop={5}
            justifyContent={"center"}
            alignContent={"center"}
            padding={1}
            borderRadius={5}
            width={"100%"}
          >
            <Tabs
              value={tabValue}
              onChange={handleChange}
              aria-label="basic tabs example"
              variant="fullWidth"
              sx={{
                "& .MuiTabs-indicator": {
                  display: "none !important",
                },
              }}
            >
              <TableStyledTab
                currentValue={0}
                tabValue={tabValue}
                label="Lolo"
                {...a11yProps(0)}
              />
              <TableStyledTab
                currentValue={1}
                tabValue={tabValue}
                label="MNR"
                {...a11yProps(1)}
              />
              <TableStyledTab
                currentValue={2}
                tabValue={tabValue}
                label="ST"
                {...a11yProps(2)}
              />
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
              sx={{ minHeight: 230 }}
            >
              {analytics.allAnalyticsListing &&
              analytics.allAnalyticsListing.lolo_in_volume_revenue_data !=
                null ? (
                <Grid container spacing={matches ? 0 : 2}>
                  <Grid item size={{ xs: 12, sm: 12, lg: 12 }}>
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
                 
              <Box
              sx={{
                minHeight: 400,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#f9f9f9', 
                borderRadius: 2,             
              }}
            >
              <CircularProgress color="inherit" size={32} />
            </Box>
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
                  <Grid item size={{ xs: 12, sm: 12, lg: 6 }}>
                    <MovementCard
                      title={"Weekly Volume"}
                      data={
                        analytics.allAnalyticsListing
                          .lolo_in_weekly_volume_revenue_data
                      }
                    />
                  </Grid>

                  <Grid item size={{ xs: 12, sm: 12, lg: 6 }}>
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
                 
                <Box
              sx={{
                minHeight: 400,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#f9f9f9', 
                borderRadius: 2,             
              }}
            >
              <CircularProgress color="inherit" size={32} />
            </Box>
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
                  <Grid item size={{ xs: 12, am: 12, lg: 12 }}>
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
                 
                <Box
                  sx={{
                    minHeight: 400,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#f9f9f9', 
                    borderRadius: 2,             
                  }}
                >
                  <CircularProgress color="inherit" size={32} />
              </Box>
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
                  <Grid item size={{ xs: 12, am: 12, lg: 6 }}>
                    <MovementCard
                      title={"Weekly Volume"}
                      data={
                        analytics.allAnalyticsListing
                          .lolo_out_weekly_volume_revenue_data
                      }
                    />
                  </Grid>

                  <Grid item size={{ xs: 12, sm: 12, lg: 6 }}>
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
                
              <Box
              sx={{
                minHeight: 400,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#f9f9f9', 
                borderRadius: 2,             
              }}
              >
              <CircularProgress color="inherit" size={32} />
              </Box>
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
                  <Grid item size={{ xs: 12, am: 12, lg: 12 }}>
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
                 
              <Box
              sx={{
                minHeight: 400,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#f9f9f9', 
                borderRadius: 2,             
              }}
            >
              <CircularProgress color="inherit" size={32} />
            </Box>
              )}
            </DashboardCardContainer>
          </RenderOnViewportEntry>

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
                  <Grid item size={{ xs: 12, am: 12, lg: 6 }}>
                    <MovementCard
                      title={"Weekly Volume"}
                      data={
                        analytics.allAnalyticsListing
                          .mnr_weekly_volume_revenue_data
                      }
                    />
                  </Grid>

                  <Grid item size={{ xs: 12, am: 12, lg: 6 }}>
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
                 
                <Box
              sx={{
                minHeight: 400,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#f9f9f9', 
                borderRadius: 2,             
              }}
            >
              <CircularProgress color="inherit" size={32} />
            </Box>
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
                  <Grid item size={{ xs: 12, am: 12, lg: 12 }}>
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
                 
                <Box
              sx={{
                minHeight: 400,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#f9f9f9', 
                borderRadius: 2,             
              }}
            >
              <CircularProgress color="inherit" size={32} />
            </Box>
              )}
            </DashboardCardContainer>
          </RenderOnViewportEntry>

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
                  <Grid item size={{ xs: 12, am: 12, lg: 6 }}>
                    <MovementCard
                      title={"Weekly Volume"}
                      data={
                        analytics.allAnalyticsListing
                          .st_in_weekly_volume_revenue_data
                      }
                    />
                  </Grid>

                  <Grid item size={{ xs: 12, am: 12, lg: 6 }}>
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
                 
                <Box
              sx={{
                minHeight: 400,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#f9f9f9', 
                borderRadius: 2,             
              }}
            >
              <CircularProgress color="inherit" size={32} />
            </Box>
              )}
            </DashboardCardContainer>
          </RenderOnViewportEntry>

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
                  <Grid item size={{ xs: 12, am: 12, lg: 12 }}>
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
                 
                <Box
              sx={{
                minHeight: 400,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#f9f9f9', 
                borderRadius: 2,             
              }}
            >
              <CircularProgress color="inherit" size={32} />
            </Box>
              )}
            </DashboardCardContainer>
          </RenderOnViewportEntry>

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
                  <Grid item size={{ xs: 12, am: 12, lg: 6 }}>
                    <MovementCard
                      title={"Weekly Volume"}
                      data={
                        analytics.allAnalyticsListing
                          .st_out_weekly_volume_revenue_data
                      }
                    />
                  </Grid>

                  <Grid item size={{ xs: 12, am: 12, lg: 6 }}>
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
                 
                <Box
              sx={{
                minHeight: 400,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#f9f9f9', 
                borderRadius: 2,             
              }}
            >
              <CircularProgress color="inherit" size={32} />
            </Box>
              )}
            </DashboardCardContainer>
          </RenderOnViewportEntry>
        </CustomTabPanel>
      </Box>
    </LayoutContainer>
  );
};

export default AnalyticsDashboard;
