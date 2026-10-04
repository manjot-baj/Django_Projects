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
import MovementCard from "../../components/analytics/MNRMovementCard";
import { useDispatch, useSelector } from "react-redux";
import Loader from "../../components/analytics/Loader";
import { useSnackbar } from "notistack";

import {
  getMNRDataListings,
  getMNRWeeklyVolumeRevenueData,
  getMNRQuarterlyVolumeRevenueData,
  getMNRTop5VolumeRevenueData,
  getMNRTotalData,
  getMNRPartiallyApproved,
} from "../../actions/AnalyticsActions";
import { dropDownDispatch } from "../../actions/GateInActions";
import RenderOnViewportEntry from "../../utils/RenderOnViewPort";
import { cacheCleanService } from "../../utils/WeekNumbre";
import CleaningServicesIcon from "@mui/icons-material/CleaningServices";

const BarContainer = React.lazy(() =>
  import("../../components/analytics/MNRBarContainer")
);
const CardContainer = React.lazy(() =>
  import("../../components/analytics/MNRCardContainer")
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
  mnrBox: {},
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
  LabelTypography: {
    fontSize: 14,
    fontWeight: 600,
    color: "#243545",
    paddingBottom: 4,
  },
  input: {
    padding: 7,
    borderColor: "black",
  },
  selectTextField: {
    "& .MuiOutlinedInput-root": {
      "& fieldset": {
        borderColor: "#243545",
      },
    },
    "& .MuiPaper-rounded": {
      "& ul": {
        position: "relative",
        top: "300px",
      },
    },
  },
}));

const MNRAnalytics = () => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const store = useSelector((state) => state);
  const [refCode, setRefCode] = useState("");

  const { analytics, gateIn } = store;
  const history = useHistory();
  const notify = useSnackbar().enqueueSnackbar;
  const theme = useTheme();
  const matches = useMediaQuery(theme.breakpoints.down("xs"));
  const [cacheLoader, setCacheLoader] = useState(false);
  const [loader, setLoader] = useState({
    top_clients: false,
    mnr_overall: false,
    mnr_weekly: false,
    total_mnr_data: false,
    mnr_data: false,
    partial_approved: false,
  });

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
        let reqArray = ["client_ref_codes"];
        dispatch(dropDownDispatch(reqArray, notify));
      }
    } else {
      history.push("/login");
    }
  }, []);

  useEffect(() => {
    if (refCode === "") {
    } else {
      dispatch(getMNRDataListings(refCode));
    }
  }, [refCode]);

  return !(
    analytics.allMNRDataListings && loaded(analytics.allMNRDataListings)
  ) ? (
    <Loader />
  ) : (
    <LayoutContainer footer={false}>
      <Box marginLeft={3} marginRight={3} className={classes.mnrBox}>
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
            <Typography variant="h5">MNR</Typography>
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
        {/* OVERALL  Done*/}
        <RenderOnViewportEntry
          threshold={0.25}
          style={{ height: "fit-content", minHeight: "240px" }}
        >
          <CardContainer
            title={"MNR Overall"}
            timeDispatchAction={getMNRQuarterlyVolumeRevenueData}
            phase={"Overall"}
            refCode={refCode}
            setLoader={setLoader}
            loaderKey={"mnr_overall"}
            cache={
              analytics.allMNRDataListings.quaterly_mnr_volume_revenue?.cache
            }
          >
            {loader.mnr_overall === false &&
            analytics.allMNRDataListings.quaterly_mnr_volume_revenue != null ? (
              <Grid container spacing={matches ? 0 : 2}>
                <Grid item xs={12} sm={12} lg={12}>
                  <MovementCard
                    title={"Overall"}
                    data={
                      analytics.allMNRDataListings.quaterly_mnr_volume_revenue
                        .data
                    }
                    fromDate={
                      analytics.allMNRDataListings.quaterly_mnr_volume_revenue
                        .from_date
                    }
                    toDate={
                      analytics.allMNRDataListings.quaterly_mnr_volume_revenue
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
          </CardContainer>
        </RenderOnViewportEntry>

        {/* WEEKLY */}
        <RenderOnViewportEntry threshold={0.25} style={{ minHeight: "240px" }}>
          {" "}
          <CardContainer
            title={"MNR Weekly"}
            setLoader={setLoader}
            loaderKey="mnr_weekly"
            timeDispatchAction={getMNRWeeklyVolumeRevenueData}
            phase={"Weekly"}
            refCode={refCode}
            cache={
              analytics.allMNRDataListings.weekly_mnr_volume_revenue?.cache
            }
          >
            {loader.mnr_weekly === false &&
            analytics.allMNRDataListings.weekly_mnr_volume_revenue != null ? (
              <Grid container spacing={matches ? 0 : 2}>
                <Grid item xs={12} sm={12} lg={6}>
                  <MovementCard
                    title={"Weekly Volume"}
                    data={
                      analytics.allMNRDataListings.weekly_mnr_volume_revenue
                    }
                  />
                </Grid>

                <Grid item xs={12} sm={12} lg={6}>
                  <MovementCard
                    title={"Weekly Revenue"}
                    data={
                      analytics.allMNRDataListings.weekly_mnr_volume_revenue
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

        {/* Total MNR  Done */}
        <RenderOnViewportEntry threshold={0.25} style={{ minHeight: "240px" }}>
          <BarContainer
            title={"Total MNR Data"}
            timeDispatchAction={getMNRTotalData}
            from_date={analytics.allMNRData.from_date}
            to_date={analytics.allMNRData.to_date}
            setLoader={setLoader}
            loaderKey="total_mnr_data"
            cache={analytics.allMNRData?.cache}
          >
            {loader.total_mnr_data === false && analytics.allMNRData ? (
              <Grid container spacing={matches ? 0 : 2}>
                <Grid item xs={12} sm={3}>
                  <MovementCard
                    title={"Approval Pending"}
                    displayTitle={false}
                    data={analytics.allMNRData.approval_pending}
                  />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <MovementCard
                    title={"Under Repairing"}
                    displayTitle={false}
                    data={analytics.allMNRData.under_repairing}
                  />
                </Grid>

                <Grid item xs={12} sm={3}>
                  <MovementCard
                    title={"Available"}
                    displayTitle={false}
                    data={analytics.allMNRData.available}
                  />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <MovementCard
                    title={"Estimation Cost"}
                    displayTitle={false}
                    data={analytics.allMNRData.estimation_cost}
                  />
                </Grid>
              </Grid>
            ) : (
              <div className={classes.componentLoader}>
                <CircularProgress color="inherit" />
              </div>
            )}
          </BarContainer>
        </RenderOnViewportEntry>

        {/* MNR Done*/}
        <RenderOnViewportEntry threshold={0.25} style={{ minHeight: "240px" }}>
          <BarContainer
            title={"MNR Data"}
            timeDispatchAction={getMNRDataListings}
            from_date={analytics.allMNRTotalData?.mnr_stage_data?.from_date}
            to_date={analytics.allMNRTotalData?.mnr_stage_data?.to_date}
            phase={"Weekly"}
            loaderKey={"mnr_data"}
            setLoader={setLoader}
            cache={analytics.allMNRTotalData?.cache}
          >
            {loader.mnr_data === false &&
            analytics.allMNRTotalData.mnr_stage_data != null ? (
              <Grid container spacing={matches ? 0 : 2}>
                <Grid item xs={12} sm={12}>
                  <MovementCard
                    title={"Stock"}
                    data={
                      analytics.allMNRTotalData.mnr_stage_data.type_wise_data
                    }
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <MovementCard
                    title={"20 Stock"}
                    data={
                      analytics.allMNRTotalData.mnr_stage_data[
                        "20_type_wise_data"
                      ]
                    }
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <MovementCard
                    title={"40 Stock"}
                    data={
                      analytics.allMNRTotalData.mnr_stage_data[
                        "40_type_wise_data"
                      ]
                    }
                  />
                </Grid>
              </Grid>
            ) : (
              <div className={classes.componentLoader}>
                <CircularProgress color="inherit" />
              </div>
            )}
          </BarContainer>
        </RenderOnViewportEntry>

        {/* Top Client Done*/}
        <RenderOnViewportEntry threshold={0.25} style={{ minHeight: "240px" }}>
          <CardContainer
            title={"MNR Top Clients"}
            timeDispatchAction={getMNRTop5VolumeRevenueData}
            phase={"Top 5"}
            refCode={refCode}
            loaderKey={"top_clients"}
            setLoader={setLoader}
            cache={
              analytics.allMNRDataListings.mnr_top_client_volume_revenue_data
                ?.cache
            }
            totalRevenue={
              analytics.allMNRDataListings?.mnr_top_client_volume_revenue_data
                ?.total_revenue
            }
            totalVolume={
              analytics.allMNRDataListings?.mnr_top_client_volume_revenue_data
                ?.total_volume
            }
          >
            {loader.top_clients === false &&
            analytics.allMNRDataListings?.mnr_top_client_volume_revenue_data !=
              null ? (
              <Grid container spacing={matches ? 0 : 2}>
                <Grid item xs={12} sm={12}>
                  <MovementCard
                    title={"Top Client Volume"}
                    data={
                      analytics.allMNRDataListings
                        .mnr_top_client_volume_revenue_data.volume_data
                    }
                    fromDate={
                      analytics.allMNRDataListings
                        .mnr_top_client_volume_revenue_data.from_date
                    }
                    toDate={
                      analytics.allMNRDataListings
                        .mnr_top_client_volume_revenue_data.to_date
                    }
                  />
                </Grid>

                <Grid item xs={12} sm={12}>
                  <MovementCard
                    title={"Top Client Revenue"}
                    data={
                      analytics.allMNRDataListings
                        .mnr_top_client_volume_revenue_data.revenue_data
                    }
                    fromDate={
                      analytics.allMNRDataListings
                        .mnr_top_client_volume_revenue_data.from_date
                    }
                    toDate={
                      analytics.allMNRDataListings
                        .mnr_top_client_volume_revenue_data.to_date
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

        {/* Partially Approved Top Client */}
        <RenderOnViewportEntry threshold={0.25} style={{ minHeight: "240px" }}>
          <CardContainer
            title={"Partially Approved Top Clients"}
            timeDispatchAction={getMNRPartiallyApproved}
            phase={"Top 5"}
            refCode={refCode}
            setLoader={setLoader}
            loaderKey={"partial_approved"}
            cache={
              analytics.allMNRDataListings.mnr_partially_approved_client?.cache
            }
          >
            {loader.partial_approved === false &&
            analytics.allMNRDataListings.mnr_partially_approved_client !=
              null ? (
              <Grid container spacing={matches ? 0 : 2}>
                <Grid item xs={12} sm={12}>
                  <MovementCard
                    title={"Top Client Volume"}
                    data={
                      analytics.allMNRDataListings.mnr_partially_approved_client
                        .volume_data
                    }
                    fromDate={
                      analytics.allMNRDataListings.mnr_partially_approved_client
                        .from_date
                    }
                    toDate={
                      analytics.allMNRDataListings.mnr_partially_approved_client
                        .to_date
                    }
                  />
                </Grid>

                <Grid item xs={12} sm={12}>
                  <MovementCard
                    title={"Top Client Revenue"}
                    data={
                      analytics.allMNRDataListings.mnr_partially_approved_client
                        .revenue_data
                    }
                    fromDate={
                      analytics.allMNRDataListings.mnr_partially_approved_client
                        .from_date
                    }
                    toDate={
                      analytics.allMNRDataListings.mnr_partially_approved_client
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
          </CardContainer>
        </RenderOnViewportEntry>
      </Box>
    </LayoutContainer>
  );
};

export default MNRAnalytics;
