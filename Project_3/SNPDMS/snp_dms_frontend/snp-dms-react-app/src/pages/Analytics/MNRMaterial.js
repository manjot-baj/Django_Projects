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
} from "@material-ui/core";
import { useHistory } from "react-router-dom";
import LayoutContainer from "../../components/reusableComponents/LayoutContainer";
import CardContainer from "../../components/analytics/MNRCardContainer";
// movement
import MovementCard from "../../components/analytics/MNRMovementCard";
import { useDispatch, useSelector } from "react-redux";
import Loader from "../../components/analytics/Loader";
import {getMNRMaterial} from "../../actions/AnalyticsActions";

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

const MNRMaterial = () => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const store = useSelector((state) => state);
  const { analytics, ui } = store;
  const history = useHistory();
  const theme = useTheme();
  const matches = useMediaQuery(theme.breakpoints.down("xs"));

  // Check if the token is expired if yes then push to login
  useEffect(() => {
    var token = localStorage.getItem("accessToken");
    if (token) {
      var decode = jwt_decode(token);
      if (decode.exp < new Date().getTime() / 1000) {
        history.push("/login");
      }
    } else {
      history.push("/login");
    }
  }, []);

  useEffect(() => {
    dispatch(getMNRMaterial("This Month"));
  }, []);

  return !(
    analytics.allMNRMaterialListings && loaded(analytics.allMNRMaterialListings)
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
          <Grid item xs={12} lg={7}>
            <Typography variant="h5">MNR Material</Typography>
          </Grid>
        </Grid>
        {/* OVERALL NUMBER */}
        <CardContainer
          title={"MNR Material"}
          timeDispatchAction={getMNRMaterial}
          phase={"Overall"}
        >
          {analytics.allMNRMaterialListings &&
          analytics.allMNRMaterialListings != null ? (
            <Grid container spacing={matches ? 0 : 2}>
              <Grid item xs={12} sm={12} lg={12}>
                <MovementCard
                  title={"Material Overall"}
                  data={analytics.allMNRMaterialListings}
                  value={"Number"}
                  fromDate={analytics.allMNRMaterialFromDate}
                  toDate={analytics.allMNRMaterialToDate}
                />
              </Grid>
            </Grid>
          ) : (
            <div className={classes.componentLoader}>
              <CircularProgress color="inherit" />
            </div>
          )}

          {/* OVERALL AREA */}
          {analytics.allMNRMaterialListings &&
          analytics.allMNRMaterialListings != null ? (
            <Grid container spacing={matches ? 0 : 2}>
              <Grid item xs={12} sm={12} lg={12}>
                <MovementCard
                  title={"Material Overall"}
                  data={analytics.allMNRMaterialListings}
                  value={"Area"}
                  fromDate={analytics.allMNRMaterialFromDate}
                  toDate={analytics.allMNRMaterialToDate}
                />
              </Grid>
            </Grid>
          ) : (
            <div className={classes.componentLoader}>
              <CircularProgress color="inherit" />
            </div>
          )}
        </CardContainer>
      </Box>
      <Backdrop className={classes.backdrop} open={ui.isloading}>
        <CircularProgress color="inherit" />
      </Backdrop>
    </LayoutContainer>
  );
};

export default MNRMaterial;
