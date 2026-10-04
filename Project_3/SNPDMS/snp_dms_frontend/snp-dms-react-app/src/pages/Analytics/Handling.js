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
  Tabs,
  Tab,
  Tooltip,
  Button,
} from "@material-ui/core";
import PropTypes from "prop-types";
import { useHistory } from "react-router-dom";
import LayoutContainer from "../../components/reusableComponents/LayoutContainer";
// movement
import MovementCard from "../../components/analytics/HandlingMovementCard";
import { useDispatch, useSelector } from "react-redux";
import {
  getHandlingTop5CargoData,
  getHandlingTop5ConsigneeData,
  getHandlingTop5TransporteeData,
  handlingVolumeRevenueListings,
} from "../../actions/AnalyticsActions";
import Loader from "../../components/analytics/Loader";
import { useSnackbar } from "notistack";
import CleaningServicesIcon from "@mui/icons-material/CleaningServices";
import {
  getHandlingWeeklyVolumeRevenueData,
  getHandlingQuarterlyVolumeRevenueData,
  getHandlingTop5VolumeRevenueData,
} from "../../actions/AnalyticsActions";
import RenderOnViewportEntry from "../../utils/RenderOnViewPort";
import { dropDownDispatch } from "../../actions/GateInActions";
import { Stack } from "@mui/material";
import { cacheCleanService } from "../../utils/WeekNumbre";

const CardContainer = React.lazy(() =>
  import("../../components/analytics/CardContainer")
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
    [theme.breakpoints.down("sm")]:{
      marginTop:"12px",
      marginLeft: 1,
      marginRight: 4,
    }
  },
  componentLoader: {
    alignSelf: "center",
    marginTop: window.innerHeight / 3,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  cacheButtonContainer:{
    [theme.breakpoints.down("md")]:{
      marginTop:"12px"
    }
  },
  tabsStyle: {
    "& .MuiTabs-flexContainer":{
    display:"flex",
    alignItems:"center",
    justifyContent:"space-between", 
    flexDirection:"row ",
    },
    [theme.breakpoints.down("sm")]:{
      "& .MuiTabs-flexContainer":{ 
        flexDirection:"column ",
        },
    "& .MuiTabs-indicator": {
      display: "none !important",
    },
  }
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
    [theme.breakpoints.down("sm")]:{
      marginTop:"8px",
      width:"200px"
    }
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

const HandlingVolumeRevenue = () => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const store = useSelector((state) => state);
  const { analytics } = store;
  const history = useHistory();
  const theme = useTheme();
  const matches = useMediaQuery(theme.breakpoints.down("xs"));
  const notify = useSnackbar().enqueueSnackbar;
  const [tabValue, setTabValue] = React.useState(0);
  const [cacheLoader, setCacheLoader] = useState(false);

  // Check if the token is expired if yes then push to login
  useEffect(() => {
    var token = localStorage.getItem("accessToken");
    if (token) {
      var decode = jwt_decode(token);
      if (decode.exp < new Date().getTime() / 1000) {
        history.push("/login");
      } else {
        // Error
      }
    } else {
      history.push("/login");
    }

    let reqArray = [];
    dispatch(dropDownDispatch(reqArray, notify));
  }, []);

  const handleChange = (event, newValue) => {
    setTabValue(newValue);
  };
  const handleCleanCache = () => {
    cacheCleanService(setCacheLoader, notify, dispatch);
  };
  return !(
    analytics.allHandlingVolumeRevenueListing &&
    loaded(analytics.allHandlingVolumeRevenueListing)
  ) ? (
    <Loader />
  ) : (
    <LayoutContainer footer={false}>
      <Box marginLeft={0} marginRight={0}>
        <Grid
          container
          spacing={2}
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Grid item xs={2} lg={2}>
            <Typography
              variant="h5"
              style={{ fontWeight: "bold", marginLeft: "20px" }}
            >
              Movement
            </Typography>
          </Grid>
          <Grid item xs={10} lg={10} justifyContent="flex-end" className={classes.cacheButtonContainer}>
            <Tooltip title={"Clean Analytics  Data "} placement="bottom">
              <Button
                onClick={handleCleanCache}
                style={{
                  border: "2px solid #2a5fa5",
                  margin: "auto",
                  marginRight: "1px",
                  display: "flex",
                }}
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

          <Grid item xs={12} lg={12}>
            <Stack
            display={"flex"}
              flexDirection={"row"}
              alignItems={"center"}
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
                <Tab
                  className={classes.tabNew}
                  label="LOLO"
                  {...a11yProps(0)}
                />
                <Tab
                  className={classes.tabNew}
                  label="CONSIGNEE SHIPPER"
                  {...a11yProps(1)}
                />
                <Tab
                  className={classes.tabNew}
                  label="TRANSPORTER"
                  {...a11yProps(2)}
                />
                <Tab
                  className={classes.tabNew}
                  label="CARGO"
                  {...a11yProps(2)}
                />
              </Tabs>
            </Stack>
          </Grid>
        </Grid>
        {/* LOLO IN */}
        {/* OVERALL */}
        <CustomTabPanel value={tabValue} index={0}>
          <RenderOnViewportEntry
            threshold={0.25}
            style={{ height: "fit-content", minHeight: "240px" }}
          >
            <CardContainer
              title={"Lolo Overall"}
              timeDispatchAction={getHandlingQuarterlyVolumeRevenueData}
              process={"lolo"}
              movement={"IN"}
              phase={"Overall"}
              handling={true}
              cache={
                analytics.allHandlingVolumeRevenueListing
                  .lolo_in_volume_revenue_data?.cache
              }
            >
              {analytics.allHandlingVolumeRevenueListing &&
              analytics.allHandlingVolumeRevenueListing
                .lolo_in_volume_revenue_data != null ? (
                <Grid container spacing={matches ? 0 : 2}>
                  <Grid item xs={12} sm={12} lg={12}>
                    <MovementCard
                      title={"Overall"}
                      data={
                        analytics.allHandlingVolumeRevenueListing
                          .lolo_in_volume_revenue_data.data
                      }
                      fromDate={
                        analytics.allHandlingVolumeRevenueListing
                          .lolo_in_volume_revenue_data.from_date
                      }
                      toDate={
                        analytics.allHandlingVolumeRevenueListing
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
            </CardContainer>
          </RenderOnViewportEntry>
          <RenderOnViewportEntry
            threshold={0.25}
            style={{ height: "fit-content", minHeight: "240px" }}
          >
            <CardContainer
              title={"Lolo Overall"}
              timeDispatchAction={getHandlingQuarterlyVolumeRevenueData}
              process={"lolo"}
              movement={"OUT"}
              phase={"Overall"}
              handling={true}
              cache={
                analytics.allHandlingVolumeRevenueListing
                  .lolo_in_volume_revenue_data_out?.cache
              }
            >
              {analytics.allHandlingVolumeRevenueListing &&
              analytics.allHandlingVolumeRevenueListing
                .lolo_in_volume_revenue_data_out != null ? (
                <Grid container spacing={matches ? 0 : 2}>
                  <Grid item xs={12} sm={12} lg={12}>
                    <MovementCard
                      title={"Overall"}
                      data={
                        analytics.allHandlingVolumeRevenueListing
                          .lolo_in_volume_revenue_data_out.data
                      }
                      fromDate={
                        analytics.allHandlingVolumeRevenueListing
                          .lolo_in_volume_revenue_data_out.from_date
                      }
                      toDate={
                        analytics.allHandlingVolumeRevenueListing
                          .lolo_in_volume_revenue_data_out.to_date
                      }
                    />
                  </Grid>
                </Grid>
              ) : (
                <div className={classes.componentLoader}>
                  <CircularProgress color="inherit" />
                </div>
              )}
            </CardContainer>
          </RenderOnViewportEntry>

          {/* WEEKLY */}
          <RenderOnViewportEntry
            threshold={0.25}
            style={{ minHeight: "240px" }}
          >
            <CardContainer
              title={"Lolo Weekly"}
              timeDispatchAction={getHandlingWeeklyVolumeRevenueData}
              process={"lolo"}
              phase={"Weekly"}
              screen={"Handling"}
              handling={true}
              movement={"IN"}
              cache={
                analytics.allHandlingVolumeRevenueListing
                  .lolo_in_weekly_volume_revenue_data?.cache
              }
            >
              {analytics.allHandlingVolumeRevenueListing &&
              analytics.allHandlingVolumeRevenueListing
                .lolo_in_weekly_volume_revenue_data != null ? (
                <Grid container spacing={matches ? 0 : 2}>
                  <Grid item xs={12} sm={12} lg={6}>
                    <MovementCard
                      title={"Weekly Volume"}
                      data={
                        analytics.allHandlingVolumeRevenueListing
                          .lolo_in_weekly_volume_revenue_data
                      }
                    />
                  </Grid>

                  <Grid item xs={12} sm={12} lg={6}>
                    <MovementCard
                      title={"Weekly Revenue"}
                      data={
                        analytics.allHandlingVolumeRevenueListing
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
            </CardContainer>
          </RenderOnViewportEntry>
          <RenderOnViewportEntry
            threshold={0.25}
            style={{ minHeight: "240px" }}
          >
            <CardContainer
              title={"Lolo Weekly"}
              timeDispatchAction={getHandlingWeeklyVolumeRevenueData}
              process={"lolo"}
              phase={"Weekly"}
              screen={"Handling"}
              handling={true}
              movement={"OUT"}
              cache={
                analytics.allHandlingVolumeRevenueListing
                  .lolo_in_weekly_volume_revenue_data_out?.cache
              }
            >
              {analytics.allHandlingVolumeRevenueListing &&
              analytics.allHandlingVolumeRevenueListing
                .lolo_in_weekly_volume_revenue_data_out != null ? (
                <Grid container spacing={matches ? 0 : 2}>
                  <Grid item xs={12} sm={12} lg={6}>
                    <MovementCard
                      title={"Weekly Volume"}
                      data={
                        analytics.allHandlingVolumeRevenueListing
                          .lolo_in_weekly_volume_revenue_data_out
                      }
                    />
                  </Grid>

                  <Grid item xs={12} sm={12} lg={6}>
                    <MovementCard
                      title={"Weekly Revenue"}
                      data={
                        analytics.allHandlingVolumeRevenueListing
                          .lolo_in_weekly_volume_revenue_data_out
                      }
                    />
                  </Grid>
                </Grid>
              ) : (
                <div className={classes.componentLoader}>
                  <CircularProgress color="inherit" />
                </div>
              )}
            </CardContainer>
          </RenderOnViewportEntry>

          {/* Top 5 */}
          <RenderOnViewportEntry
            threshold={0.25}
            style={{ minHeight: "240px" }}
          >
            <CardContainer
              title={"Lolo Top Clients"}
              timeDispatchAction={getHandlingTop5VolumeRevenueData}
              process={"lolo"}
              phase={"Top 5"}
              movement={"IN"}
              handling={true}
              cache={
                analytics.allHandlingVolumeRevenueListing
                  .lolo_in_top_client_volume_revenue_data?.cache
              }
            >
              {analytics.allHandlingVolumeRevenueListing &&
              analytics.allHandlingVolumeRevenueListing
                .lolo_in_top_client_volume_revenue_data != null ? (
                <Grid container spacing={matches ? 0 : 2}>
                  <Grid item xs={12} sm={12}>
                    <MovementCard
                      title={"Top 5 Volume"}
                      secondColor={true}
                      data={
                        analytics.allHandlingVolumeRevenueListing
                          .lolo_in_top_client_volume_revenue_data.volume_data
                      }
                      fromDate={
                        analytics.allHandlingVolumeRevenueListing
                          .lolo_in_top_client_volume_revenue_data.from_date
                      }
                      toDate={
                        analytics.allHandlingVolumeRevenueListing
                          .lolo_in_top_client_volume_revenue_data.to_date
                      }
                    />
                  </Grid>

                  <Grid item xs={12} sm={12}>
                    <MovementCard
                      title={"Top 5 Revenue"}
                      data={
                        analytics.allHandlingVolumeRevenueListing
                          .lolo_in_top_client_volume_revenue_data.revenue_data
                      }
                      fromDate={
                        analytics.allHandlingVolumeRevenueListing
                          .lolo_in_top_client_volume_revenue_data.from_date
                      }
                      toDate={
                        analytics.allHandlingVolumeRevenueListing
                          .lolo_in_top_client_volume_revenue_data.to_date
                      }
                    />
                  </Grid>
                </Grid>
              ) : (
                <div className={classes.componentLoader}>
                  <CircularProgress color="inherit" />
                </div>
              )}
            </CardContainer>
          </RenderOnViewportEntry>
          <RenderOnViewportEntry
            threshold={0.25}
            style={{ minHeight: "240px" }}
          >
            <CardContainer
              title={"Lolo Top Clients"}
              timeDispatchAction={getHandlingTop5VolumeRevenueData}
              process={"lolo"}
              phase={"Top 5"}
              movement={"OUT"}
              handling={true}
              cache={
                analytics.allHandlingVolumeRevenueListing
                  .lolo_in_top_client_volume_revenue_data_out?.cache
              }
            >
              {analytics.allHandlingVolumeRevenueListing &&
              analytics.allHandlingVolumeRevenueListing
                .lolo_in_top_client_volume_revenue_data_out != null ? (
                <Grid container spacing={matches ? 0 : 2}>
                  <Grid item xs={12} sm={12}>
                    <MovementCard
                      title={"Top 5 Volume"}
                      secondColor={true}
                      data={
                        analytics.allHandlingVolumeRevenueListing
                          .lolo_in_top_client_volume_revenue_data_out
                          .volume_data
                      }
                      fromDate={
                        analytics.allHandlingVolumeRevenueListing
                          .lolo_in_top_client_volume_revenue_data_out.from_date
                      }
                      toDate={
                        analytics.allHandlingVolumeRevenueListing
                          .lolo_in_top_client_volume_revenue_data_out.to_date
                      }
                    />
                  </Grid>

                  <Grid item xs={12} sm={12}>
                    <MovementCard
                      title={"Top 5 Revenue"}
                      data={
                        analytics.allHandlingVolumeRevenueListing
                          .lolo_in_top_client_volume_revenue_data_out
                          .revenue_data
                      }
                      fromDate={
                        analytics.allHandlingVolumeRevenueListing
                          .lolo_in_top_client_volume_revenue_data_out.from_date
                      }
                      toDate={
                        analytics.allHandlingVolumeRevenueListing
                          .lolo_in_top_client_volume_revenue_data_out.to_date
                      }
                    />
                  </Grid>
                </Grid>
              ) : (
                <div className={classes.componentLoader}>
                  <CircularProgress color="inherit" />
                </div>
              )}
            </CardContainer>
          </RenderOnViewportEntry>
        </CustomTabPanel>
        <CustomTabPanel value={tabValue} index={1}>
          <RenderOnViewportEntry
            threshold={0.25}
            style={{ minHeight: "240px" }}
          >
            <CardContainer
              title={"Consignee Shipper Data"}
              timeDispatchAction={getHandlingTop5ConsigneeData}
              process={"lolo"}
              phase={"Top 5"}
              // movement={"OUT"}
              handling={true}
              cache={
                analytics.allHandlingVolumeRevenueListing.top_5_Consignee_Data
                  ?.cache
              }
            >
              {analytics.allHandlingVolumeRevenueListing &&
              analytics.allHandlingVolumeRevenueListing.top_5_Consignee_Data !=
                null ? (
                <Grid container spacing={matches ? 0 : 2}>
                  <Grid item xs={12} sm={12}>
                    <MovementCard
                      consignee={true}
                      title={"Top 5 Revenue"}
                      secondColor={true}
                      data={
                        analytics.allHandlingVolumeRevenueListing
                          .top_5_Consignee_Data.revenue_data
                      }
                      fromDate={
                        analytics.allHandlingVolumeRevenueListing
                          .top_5_Consignee_Data.from_date
                      }
                      toDate={
                        analytics.allHandlingVolumeRevenueListing
                          .top_5_Consignee_Data.to_date
                      }
                    />
                  </Grid>
                </Grid>
              ) : (
                <div className={classes.componentLoader}>
                  <CircularProgress color="inherit" />
                </div>
              )}
            </CardContainer>
          </RenderOnViewportEntry>
        </CustomTabPanel>
        <CustomTabPanel value={tabValue} index={2}>
          <RenderOnViewportEntry
            threshold={0.25}
            style={{ minHeight: "240px" }}
          >
            <CardContainer
              title={"Transporter Data"}
              timeDispatchAction={getHandlingTop5TransporteeData}
              process={"lolo"}
              phase={"Top 5"}
              movement={"IN"}
              handling={true}
              cache={
                analytics.allHandlingVolumeRevenueListing.top_5_Transporter_Data
                  ?.cache
              }
            >
              {analytics.allHandlingVolumeRevenueListing &&
              analytics.allHandlingVolumeRevenueListing
                .top_5_Transporter_Data != null ? (
                <Grid container spacing={matches ? 0 : 2}>
                  <Grid item xs={12} sm={12}>
                    <MovementCard
                      title={"Top 5 Volume"}
                      transporter={true}
                      secondColor={true}
                      data={
                        analytics.allHandlingVolumeRevenueListing
                          .top_5_Transporter_Data.volume_data
                      }
                      fromDate={
                        analytics.allHandlingVolumeRevenueListing
                          .top_5_Transporter_Data.from_date
                      }
                      toDate={
                        analytics.allHandlingVolumeRevenueListing
                          .top_5_Transporter_Data.to_date
                      }
                    />
                  </Grid>
                </Grid>
              ) : (
                <div className={classes.componentLoader}>
                  <CircularProgress color="inherit" />
                </div>
              )}
            </CardContainer>
          </RenderOnViewportEntry>
          <RenderOnViewportEntry
            threshold={0.25}
            style={{ minHeight: "240px" }}
          >
            <CardContainer
              title={"Transporter Data"}
              timeDispatchAction={getHandlingTop5TransporteeData}
              process={"lolo"}
              phase={"Top 5"}
              movement={"OUT"}
              handling={true}
              cache={
                analytics.allHandlingVolumeRevenueListing
                  .top_5_Transporter_Data_Out?.cache
              }
            >
              {analytics.allHandlingVolumeRevenueListing &&
              analytics.allHandlingVolumeRevenueListing
                .top_5_Transporter_Data_Out != null ? (
                <Grid container spacing={matches ? 0 : 2}>
                  <Grid item xs={12} sm={12}>
                    <MovementCard
                      title={"Top 5 Volume"}
                      transporter={true}
                      data={
                        analytics.allHandlingVolumeRevenueListing
                          .top_5_Transporter_Data_Out.volume_data
                      }
                      fromDate={
                        analytics.allHandlingVolumeRevenueListing
                          .top_5_Transporter_Data_Out.from_date
                      }
                      toDate={
                        analytics.allHandlingVolumeRevenueListing
                          .top_5_Transporter_Data_Out.to_date
                      }
                    />
                  </Grid>
                </Grid>
              ) : (
                <div className={classes.componentLoader}>
                  <CircularProgress color="inherit" />
                </div>
              )}
            </CardContainer>
          </RenderOnViewportEntry>
        </CustomTabPanel>
        <CustomTabPanel value={tabValue} index={3}>
          <RenderOnViewportEntry
            threshold={0.25}
            style={{ minHeight: "240px" }}
          >
            <CardContainer
              title={"Cargo Data"}
              timeDispatchAction={getHandlingTop5CargoData}
              process={"lolo"}
              phase={"Top 5"}
              // movement={"OUT"}
              handling={true}
              cache={
                analytics.allHandlingVolumeRevenueListing.top_5_Cargo_Data_Out
                  ?.cache
              }
            >
              {analytics.allHandlingVolumeRevenueListing &&
              analytics.allHandlingVolumeRevenueListing.top_5_Cargo_Data_Out !=
                null ? (
                <Grid container spacing={matches ? 0 : 2}>
                  <Grid item xs={12} sm={12}>
                    <MovementCard
                      title={"Top 5 Volume"}
                      secondColor={true}
                      transporter={true}
                      data={
                        analytics.allHandlingVolumeRevenueListing
                          .top_5_Cargo_Data_Out.volume_data
                      }
                      fromDate={
                        analytics.allHandlingVolumeRevenueListing
                          .top_5_Cargo_Data_Out.from_date
                      }
                      toDate={
                        analytics.allHandlingVolumeRevenueListing
                          .top_5_Cargo_Data_Out.to_date
                      }
                    />
                  </Grid>
                </Grid>
              ) : (
                <div className={classes.componentLoader}>
                  <CircularProgress color="inherit" />
                </div>
              )}
            </CardContainer>
          </RenderOnViewportEntry>
        </CustomTabPanel>
      </Box>
    </LayoutContainer>
  );
};

export default HandlingVolumeRevenue;
