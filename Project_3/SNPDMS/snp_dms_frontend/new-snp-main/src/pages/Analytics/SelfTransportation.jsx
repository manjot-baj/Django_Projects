import React, { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import {
  Typography,
  Box,
  Grid,
  useTheme,
  useMediaQuery,
  CircularProgress,
  Tooltip,
  Button,
} from "@mui/material";
import { useHistory } from "react-router-dom";
import LayoutContainer from "@components/reusablecomponents/LayoutContainer";

// movement
import MovementCard from "../../components/analytics/HandlingMovementCard";
import { useDispatch, useSelector } from "react-redux";
import Loader from "../../components/analytics/Loader";
import {
  getSTWeeklyVolumeRevenueData,
  getSTQuarterlyVolumeRevenueData,
  getSTTop5VolumeRevenueData,
} from "../../actions/AnalyticsActions";
import RenderOnViewportEntry from "../../utils/RenderOnViewPort";
import { useSnackbar } from "notistack";
import CleaningServicesIcon from "@mui/icons-material/CleaningServices";
import { cacheCleanService } from "../../utils/WeekNumbre";

const CardContainer = React.lazy(() =>
  import("../../components/analytics/CardContainer")
);

const drawerWidth = 220;

function loaded(obj) {
  for (let i in obj) {
    if (obj[i] == null) {
      return false;
    }
  }
  return true;
}

const SelfTransportationVolumeRevenue = () => {
  const store = useSelector((state) => state);
  const { analytics } = store;
  const history = useHistory();
  const theme = useTheme();
  const dispatch = useDispatch();
  const notify = useSnackbar().enqueueSnackbar;
  const matches = useMediaQuery(theme.breakpoints.down("xs"));
  const [cacheLoader, setCacheLoader] = useState(false);

  const handleCleanCache = () => {
    cacheCleanService(setCacheLoader, notify, dispatch);
  };

  // Check if the token is expired if yes then push to login
  useEffect(() => {
    var token = localStorage.getItem("accessToken");
    if (token) {
      var decode = jwtDecode(token);
      if (decode.exp < new Date().getTime() / 1000) {
        history.push("/login");
      } else {
        // Error;
      }
    } else {
      history.push("/login");
    }
  }, []);

  return !(
    analytics.allSTVolumeRevenueListing &&
    loaded(analytics.allSTVolumeRevenueListing)
  ) ? (
    <Loader />
  ) : (
    <LayoutContainer footer={false}>
      <Box
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
          }}
        >
          <Grid item size={{ xs: 12, lg: 4 }}>
            <Typography variant="h5">Self Transportation</Typography>
          </Grid>
          <Grid item size={{ xs: 10, lg: 8 }} justifyContent="flex-end">
            <Tooltip title={"Clean Analytics  Data "} placement="bottom">
              <Button
                onClick={handleCleanCache}
                style={{
                  margin: "auto",
                  marginRight: "1px",
                  display: "flex",
                }}
                startIcon={<CleaningServicesIcon fontSize="small" />}
              >
              
                Clean Cache
              </Button>
            </Tooltip>
          </Grid>
        </Grid>
        {/* ST IN */}
        {/* OVERALL */}
        <RenderOnViewportEntry threshold={0.25} style={{ minHeight: "240px" }}>
          <CardContainer
            title={"ST"}
            timeDispatchAction={getSTQuarterlyVolumeRevenueData}
            process={"st"}
            movement={"IN"}
            phase={"Overall"}
            in_out={true}
            cache={
              analytics.allSTVolumeRevenueListing.st_in_volume_revenue_data
                ?.cache
            }
          >
            {analytics.allSTVolumeRevenueListing &&
            analytics.allSTVolumeRevenueListing.st_in_volume_revenue_data !=
              null ? (
              <Grid container spacing={matches ? 0 : 2}>
                <Grid item size={{ xs: 12, sm: 12, lg: 12 }}>
                  <MovementCard
                    title={"Overall"}
                    data={
                      analytics.allSTVolumeRevenueListing
                        .st_in_volume_revenue_data.data
                    }
                    fromDate={
                      analytics.allSTVolumeRevenueListing
                        .st_in_volume_revenue_data.from_date
                    }
                    toDate={
                      analytics.allSTVolumeRevenueListing
                        .st_in_volume_revenue_data.to_date
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
        <RenderOnViewportEntry threshold={0.25} style={{ minHeight: "240px" }}>
          <CardContainer
            title={"St"}
            timeDispatchAction={getSTWeeklyVolumeRevenueData}
            process={"st"}
            phase={"Weekly"}
            screen={"Handling"}
            in_out={true}
            cache={
              analytics.allSTVolumeRevenueListing
                .st_in_weekly_volume_revenue_data?.cache
            }
          >
            {analytics.allSTVolumeRevenueListing &&
            analytics.allSTVolumeRevenueListing
              .st_in_weekly_volume_revenue_data != null ? (
              <Grid container spacing={matches ? 0 : 2}>
                <Grid item size={{ xs: 12, sm: 12, lg: 6 }}>
                  <MovementCard
                    title={"Weekly Volume"}
                    data={
                      analytics.allSTVolumeRevenueListing
                        .st_in_weekly_volume_revenue_data
                    }
                  />
                </Grid>

                <Grid item size={{ xs: 12, sm: 12, lg: 6 }}>
                  <MovementCard
                    title={"Weekly Revenue"}
                    data={
                      analytics.allSTVolumeRevenueListing
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
          </CardContainer>
        </RenderOnViewportEntry>

        {/* Top 5 */}
        <RenderOnViewportEntry threshold={0.25} style={{ minHeight: "240px" }}>
          <CardContainer
            title={"ST Top Clients"}
            timeDispatchAction={getSTTop5VolumeRevenueData}
            process={"st"}
            phase={"Top 5"}
            in_out={true}
            cache={
              analytics.allSTVolumeRevenueListing
                .st_in_top_client_volume_revenue_data?.cache
            }
          >
            {analytics.allSTVolumeRevenueListing &&
            analytics.allSTVolumeRevenueListing
              .st_in_top_client_volume_revenue_data != null ? (
              <Grid container spacing={matches ? 0 : 2}>
                <Grid item size={{ xs: 12, sm: 12 }}>
                  <MovementCard
                    title={"Top 5 Volume"}
                    data={
                      analytics.allSTVolumeRevenueListing
                        .st_in_top_client_volume_revenue_data.volume_data
                    }
                    fromDate={
                      analytics.allSTVolumeRevenueListing
                        .st_in_top_client_volume_revenue_data.from_date
                    }
                    toDate={
                      analytics.allSTVolumeRevenueListing
                        .st_in_top_client_volume_revenue_data.to_date
                    }
                  />
                </Grid>

                <Grid item size={{ xs: 12, sm: 12 }}>
                  <MovementCard
                    title={"Top 5 Revenue"}
                    data={
                      analytics.allSTVolumeRevenueListing
                        .st_in_top_client_volume_revenue_data.revenue_data
                    }
                    fromDate={
                      analytics.allSTVolumeRevenueListing
                        .st_in_top_client_volume_revenue_data.from_date
                    }
                    toDate={
                      analytics.allSTVolumeRevenueListing
                        .st_in_top_client_volume_revenue_data.to_date
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
      </Box>
    </LayoutContainer>
  );
};

export default SelfTransportationVolumeRevenue;
