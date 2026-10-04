import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { jwtDecode } from "jwt-decode";
import {
  Typography,
  Paper,
  Tabs,
  Tab,
  Grid,
  Backdrop,
  CircularProgress,
  Box,
  alpha,
} from "@mui/material";

import PropTypes from "prop-types";
import LayoutContainer from "@components/reusablecomponents/LayoutContainer";
import GateIn from "../components/GateIn";
import { useHistory } from "react-router-dom";
import { TRUCK_TRACKING_CONST } from "../reducers/TruckTurnAroundReducer";
import { ENBLOCK_REDUCER_CONST } from "../reducers/EnBlockReducer";
import { custombackDropStyle } from "../utils/CustomClasses";

//StocksAndAllotment
const StocksAndAllotment = React.lazy(() => import("./StocksAndAllotment"));
const GateOut = React.lazy(() => import("../components/GateOut"));

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`scrollable-force-tabpanel-${index}`}
      aria-labelledby={`scrollable-force-tab-${index}`}
      {...other}
    >
      {/* {value === index && children} */}
      {value === index && (
        <Box
          sx={(theme) => ({
            paddingTop: 4,
            paddingBottom: 4,
            // paddingLeft: 24,
            [theme.breakpoints.down("sm")]: {
              paddingLeft: 0,
            },
          })}
        >
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.any.isRequired,
  value: PropTypes.any.isRequired,
};

function a11yProps(index) {
  return {
    id: `scrollable-force-tab-${index}`,
    "aria-controls": `scrollable-force-tabpanel-${index}`,
  };
}

const Depot = () => {
  const dispatch = useDispatch();
  const store = useSelector((state) => state);
  const history = useHistory();
  const { ui, user } = store;
  const [value, setValue] = React.useState(1);

  const handleChange = (event, newValue) => {
    setValue(newValue);
    if (newValue === 0) {
      dispatch({ type: "CLEAR_GATE_OUT_REDUCER" });
      dispatch({ type: "SET_DEPOT_GATE_TYPE", payload: "IN" });
      dispatch({ type: "RESET_STOCK_ALLOTMENT_DATA" });
      dispatch({ type: "RESET_GATE_OUT_CONTAINER_DETAILS" });
      dispatch({ type: "RESET_GATE_OUT_UPDATE_FORM" });
      dispatch({ type: "SET_ENABLE_TRANSPORTATION" });
      dispatch({ type: "SET_ENABLE_OUT_TRANSPORTATION" });
    } else if (newValue === 1) {
      dispatch({ type: "SET_DEPOT_GATE_TYPE", payload: "STOCKS" });
      dispatch({ type: "RESET_GATE_IN_UPDATE_FORM" });
      dispatch({ type: "RESET_GATE_OUT_CONTAINER_DETAILS" });
      dispatch({ type: "RESET_GATE_OUT_UPDATE_FORM" });
      dispatch({ type: "SET_ENABLE_TRANSPORTATION" });
      dispatch({ type: "SET_ENABLE_OUT_TRANSPORTATION" });
    } else {
      dispatch({ type: "CLEAR_GATE_IN_REDUCER" });
      dispatch({ type: "RESET_GATE_IN_UPDATE_FORM" });
      dispatch({ type: "RESET_STOCK_ALLOTMENT_DATA" });
      dispatch({ type: "SET_DEPOT_GATE_TYPE", payload: "OUT" });
      dispatch({ type: "SET_ENABLE_TRANSPORTATION" });
      dispatch({ type: "SET_ENABLE_OUT_TRANSPORTATION" });
    }
  };

  useEffect(() => {
    return () => {
      dispatch({ type: "RESET_GATE_IN_UPDATE_FORM" });
    };
  }, []);

  useEffect(() => {
    return () => {
      dispatch({ type: "RESET_GATE_OUT_CONTAINER_DETAILS" });
      dispatch({ type: "RESET_GATE_OUT_UPDATE_FORM" });
    };
  }, []);

  useEffect(() => {
    if (ui.depotGateType === "IN") {
      setValue(0);
    } else if (ui.depotGateType === "STOCKS") {
      setValue(1);
    } else if (ui.depotGateType === "OUT") {
      setValue(2);
    } else {
      setValue(1);
    }
  }, [ui.depotGateType]);

  // Check if the token is expired if yes then push to login
  useEffect(() => {
    var token = localStorage.getItem("accessToken");
    dispatch({ type: TRUCK_TRACKING_CONST.TRUCK_TRACKING_GATE_IN_DATA_INIT });
    dispatch({
      type: ENBLOCK_REDUCER_CONST.EN_BLOCK_VESSEL_VOYAGE_NAME_INIT,
    });
    if (token) {
      var decode = jwtDecode(token);

      if (decode.exp < new Date().getTime() / 1000) {
        history.push("/login");
      }
    } else {
      history.push("/login");
    }
  }, []);

  return (
    <LayoutContainer footer={true}>
      <Grid item size={{ xs: 12 }}>
        <Paper
          elevation={0}
          sx={(theme) => ({
            flexGrow: 1,
            backgroundColor: "#fff",
            borderRadius: 12,
            width: 650,
            margin: "auto",
            [theme.breakpoints.down("md")]: {
              // width: "100%",
              marginTop: "24px",

              width: "100%",
              marginLeft: 4,
              marginRight: 4,
            },
            [theme.breakpoints.down("sm")]: {
              // width: "100%",
              marginTop: "24px",
              width: "100%",
              marginLeft: 0,
              marginRight: 0,
            },
          })}
        >
          <Tabs
            value={value}
            onChange={handleChange}
            variant="fullWidth"
            indicatorColor="white"
          >
            <Tab
              sx={(theme) => ({
                borderRadius: value === 0 ? 8 : undefined,

                color:
                  value === 0
                    ? theme.palette.primary.main
                    : alpha(theme.palette.secondary.main, 0.5),
                "& .MuiTab-root": {
                  padding: 0,
                },
                [theme.breakpoints.down("sm")]: {
                  // width: "100%",
                  margin: 0,
                  borderRadius: value === 0 ? 2 : undefined,
                  fontSize: 6,
                },
              })}
              label={
                <Typography sx={{ fontWeight: value === 0 ? 600 : 500 }}>
                  In
                </Typography>
              }
              {...a11yProps(0)}
            />
            <Tab
              sx={(theme) => ({
                borderRadius: value === 1 ? 8 : undefined,
                fontWeight: 600,
                color:
                  value === 1
                    ? theme.palette.primary.main
                    : alpha(theme.palette.secondary.main, 0.5),
                "& .MuiTab-root": {
                  padding: 0,
                },
                [theme.breakpoints.down("sm")]: {
                  // width: "100%",
                  borderRadius: value === 1 ? 2 : undefined,

                  margin: 0,
                  fontSize: 9,
                },
              })}
              label={
                <Typography sx={{ fontWeight: value === 1 ? 600 : 500 }}>
                  {" "}
                  {"Stocks & Allotment"}
                </Typography>
              }
              {...a11yProps(1)}
            />
            <Tab
              sx={(theme) => ({
                borderRadius: value === 2 ? 8 : undefined,
                fontWeight: 600,
                color:
                  value === 2
                    ? theme.palette.primary.main
                    : alpha(theme.palette.secondary.main, 0.5),
                "& .MuiTab-root": {
                  padding: 0,
                },
                [theme.breakpoints.down("sm")]: {
                  // width: "100%",
                  borderRadius: value === 2 ? 2 : undefined,

                  margin: 0,
                  fontSize: 9,
                },
              })}
              label={
                <Typography sx={{ fontWeight: value === 2 ? 600 : 500 }}>
                  Out
                </Typography>
              }
              {...a11yProps(2)}
            />
          </Tabs>
        </Paper>
      </Grid>

      <TabPanel value={value} index={0}>
        <GateIn  />
      </TabPanel>
      <TabPanel value={value} index={1}>
        <StocksAndAllotment  />
      </TabPanel>

      <TabPanel value={value} index={2}>
        <GateOut  />
      </TabPanel>
      <Backdrop sx={custombackDropStyle} open={ui.isloading}>
        <CircularProgress color="inherit" />
      </Backdrop>
    </LayoutContainer>
  );
};
export default Depot;
