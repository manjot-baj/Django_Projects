import React, { useEffect } from "react";
import {jwtDecode} from "jwt-decode";
import {

  Typography,
  Box,
  Grid,
  useTheme,
  useMediaQuery,
  Backdrop,
  CircularProgress,
} from "@mui/material";
import { useHistory } from "react-router-dom";
import LayoutContainer from "@components/reusablecomponents/LayoutContainer";
import CardContainer from "../../components/analytics/MNRCardContainer";
// movement
import MovementCard from "../../components/analytics/MNRMovementCard";
import { useDispatch, useSelector } from "react-redux";
import Loader from "../../components/analytics/Loader";
import {getMNRMaterial} from "../../actions/AnalyticsActions";
import { custombackDropStyle } from "../../utils/CustomClasses";

const drawerWidth = 220;

function loaded(obj) {
  for (let i in obj) {
    if (obj[i] == null) {
      return false;
    }
  }
  return true;
}


const MNRMaterial = () => {
 
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
      var decode = jwtDecode(token);
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
      <Box   sx={(theme) => ({
          marginLeft: 3,
          marginRight: 3,
          [theme.breakpoints.down("sm")]: {
            marginLeft: 0,
            marginRight: 0,
          },
        })}>
        <Grid
          container
          spacing={2}
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Grid size={{xs:12,lg:7}} item >
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
              <Grid item size={{xs:12,lg:12,sm:12}}>
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
            <Box sx={{
              alignSelf: "center",
              marginTop: window.innerHeight / 3,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}>
              <CircularProgress color="inherit" />
            </Box>
          )}

          {/* OVERALL AREA */}
          {analytics.allMNRMaterialListings &&
          analytics.allMNRMaterialListings != null ? (
            <Grid container spacing={matches ? 0 : 2}>
              <Grid item size={{xs:12,lg:12,sm:12}}>
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
            <Box sx={{
              alignSelf: "center",
              marginTop: window.innerHeight / 3,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}>
              <CircularProgress color="inherit" />
            </Box>
          )}
        </CardContainer>
      </Box>
      <Backdrop sx={custombackDropStyle} open={ui.isloading}>
        <CircularProgress color="inherit" />
      </Backdrop>
    </LayoutContainer>
  );
};

export default MNRMaterial;
