import React, { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import {
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
  styled,
} from "@mui/material";
import PropTypes from "prop-types";
import { useHistory } from "react-router-dom";
import LayoutContainer from "@components/reusablecomponents/LayoutContainer";
// movement
import MovementCard from "../../components/analytics/HandlingMovementCard";
import { useDispatch, useSelector } from "react-redux";
import {
  getHandlingTop5CargoData,
  getHandlingTop5ConsigneeData,
  getHandlingTop5TransporteeData,
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

const StyledTab = styled(Tab)(({ currentValue, tabValue, theme }) => ({
  margin: 1,
  fontSize: 13,
  borderRadius: 12,
  fontWeight:  tabValue === currentValue ?600: 500,
  color: tabValue === currentValue ? "#fff !important" : theme.palette.text.primary,
  backgroundColor: tabValue === currentValue ? theme.palette.primary.main : "transparent",
  "&:hover": {
    backgroundColor: theme.palette.primary.light,
    color: "white",
  },
  [theme.breakpoints.down("sm")]: {
    marginX: 0,
    marginY: 1,
  },
}));

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

const componentLoaderStyle = (theme) => ({
  alignSelf: "center",
  marginTop: window.innerHeight / 3,
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
});

const HandlingVolumeRevenue = () => {
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
      var decode = jwtDecode(token);
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
          <Grid item size={{ xs: 2, lg: 2 }}>
             <Typography variant="h5">Movement</Typography>
          </Grid>
          <Grid
            item
            size={{ xs: 10, lg: 10 }}
            justifyContent="flex-end"
            sx={(theme) => ({
              [theme.breakpoints.down("md")]: {
                marginTop: "12px",
              },
            })}
          >
            <Tooltip title={"Clean Analytics  Data "} placement="bottom">
              <Button
                onClick={handleCleanCache}
                style={{
                  margin: "auto",
                  marginRight: "1px",
                  display: "flex",
                }}
                variant="text"
                color="primary"
                startIcon={<CleaningServicesIcon fontSize="small" />}
              >
                Clean Cache
              </Button>
            </Tooltip>
          </Grid>

          <Grid item size={{ xs: 12, lg: 12 }}>
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
             
                
                sx={(theme) => ({
                  "& .MuiTabs-flexContainer": {
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    flexDirection: "row ",
                  },
                  [theme.breakpoints.down("sm")]: {
                    "& .MuiTabs-flexContainer": {
                      flexDirection: "column ",
                    },
                    "& .MuiTabs-indicator": {
                      display: "none !important",
                    },
                  },
                })}
              >
                <StyledTab
                  currentValue={0}
                  tabValue={tabValue}
                  label="LOLO"
                  {...a11yProps(0)}
                />
                <StyledTab
                  currentValue={1}
                  tabValue={tabValue}
                  label="CONSIGNEE SHIPPER"
                  {...a11yProps(1)}
                />
                <StyledTab
                  currentValue={2}
                  tabValue={tabValue}
                  label="TRANSPORTER"
                  {...a11yProps(2)}
                />
                <StyledTab
                  currentValue={3}
                  tabValue={tabValue}
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
                  <Grid item size={{ xs: 12, sm: 12, lg: 12 }}>
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
                  <Grid item size={{ xs: 12, sm: 12, lg: 12 }}>
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
                  <Grid item size={{ xs: 12, sm: 12, lg: 6 }}>
                    <MovementCard
                      title={"Weekly Volume"}
                      data={
                        analytics.allHandlingVolumeRevenueListing
                          .lolo_in_weekly_volume_revenue_data
                      }
                    />
                  </Grid>

                  <Grid item size={{ xs: 12, sm: 12, lg: 6 }}>
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
                  <Grid item size={{ xs: 12, sm: 12, lg: 6 }}>
                    <MovementCard
                      title={"Weekly Volume"}
                      data={
                        analytics.allHandlingVolumeRevenueListing
                          .lolo_in_weekly_volume_revenue_data_out
                      }
                    />
                  </Grid>

                  <Grid item size={{ xs: 12, sm: 12, lg: 6 }}>
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
                  <Grid item size={{ xs: 12, sm: 12, lg: 12 }}>
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

                  <Grid item size={{ xs: 12, sm: 12, lg: 12 }}>
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
                  <Grid item size={{ xs: 12, sm: 12, lg: 12 }}>
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

                  <Grid item size={{ xs: 12, sm: 12, lg: 12 }}>
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
                  <Grid item size={{ xs: 12, sm: 12, lg: 12 }}>
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
                  <Grid item size={{ xs: 12, sm: 12, lg: 12 }}>
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
                  <Grid item size={{ xs: 12, sm: 12, lg: 12 }}>
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
                  <Grid item size={{ xs: 12, sm: 12, lg: 12 }}>
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
            </CardContainer>
          </RenderOnViewportEntry>
        </CustomTabPanel>
      </Box>
    </LayoutContainer>
  );
};

export default HandlingVolumeRevenue;
