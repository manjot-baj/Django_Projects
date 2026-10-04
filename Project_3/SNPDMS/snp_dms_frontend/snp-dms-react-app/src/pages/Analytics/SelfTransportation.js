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
  Tooltip,
  Button,
} from "@material-ui/core";
import { useHistory } from "react-router-dom";
import LayoutContainer from "../../components/reusableComponents/LayoutContainer";

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

const SelfTransportationVolumeRevenue = () => {
  const classes = useStyles();
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
      var decode = jwt_decode(token);
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
          <Grid item xs={12} lg={4}>
            <Typography variant="h5">Self Transportation</Typography>
          </Grid>
          <Grid item xs={10} lg={8} justifyContent="flex-end">
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
            cache={  analytics.allSTVolumeRevenueListing
              .st_in_volume_revenue_data?.cache}
          >
            {analytics.allSTVolumeRevenueListing &&
            analytics.allSTVolumeRevenueListing.st_in_volume_revenue_data !=
              null ? (
              <Grid container spacing={matches ? 0 : 2}>
                <Grid item xs={12} sm={12} lg={12}>
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
              <div className={classes.componentLoader}>
                <CircularProgress color="inherit" />
              </div>
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
            cache={     analytics.allSTVolumeRevenueListing
              .st_in_weekly_volume_revenue_data?.cache}
          >
            {analytics.allSTVolumeRevenueListing &&
            analytics.allSTVolumeRevenueListing
              .st_in_weekly_volume_revenue_data != null ? (
              <Grid container spacing={matches ? 0 : 2}>
                <Grid item xs={12} sm={12} lg={6}>
                  <MovementCard
                    title={"Weekly Volume"}
                    data={
                      analytics.allSTVolumeRevenueListing
                        .st_in_weekly_volume_revenue_data
                    }
                  />
                </Grid>

                <Grid item xs={12} sm={12} lg={6}>
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
              <div className={classes.componentLoader}>
                <CircularProgress color="inherit" />
              </div>
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
            cache={analytics.allSTVolumeRevenueListing
              .st_in_top_client_volume_revenue_data?.cache}
          >
            {analytics.allSTVolumeRevenueListing &&
            analytics.allSTVolumeRevenueListing
              .st_in_top_client_volume_revenue_data != null ? (
              <Grid container spacing={matches ? 0 : 2}>
                <Grid item xs={12} sm={12}>
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

                <Grid item xs={12} sm={12}>
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
              <div className={classes.componentLoader}>
                <CircularProgress color="inherit" />
              </div>
            )}
          </CardContainer>
        </RenderOnViewportEntry>
      </Box>
    </LayoutContainer>
  );
};

export default SelfTransportationVolumeRevenue;
