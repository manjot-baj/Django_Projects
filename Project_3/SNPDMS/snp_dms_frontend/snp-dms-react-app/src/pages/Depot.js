import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import jwt_decode from "jwt-decode";
import {
  makeStyles,
  Typography,
  Paper,
  Tabs,
  Tab,
  Grid,
  Backdrop,
  CircularProgress,
} from "@material-ui/core";

import PropTypes from "prop-types";
import Box from "@material-ui/core/Box";
import LayoutContainer from "../components/reusableComponents/LayoutContainer";
import GateIn from "../components/GateIn";
import GateOut from "../components/GateOut";
import { useHistory } from "react-router-dom";
import { TRUCK_TRACKING_CONST } from "../reducers/TruckTurnAroundReducer";
import { ENBLOCK_REDUCER_CONST } from "../reducers/EnBlockReducer";


//StocksAndAllotment
const StocksAndAllotment = React.lazy(() => import("./StocksAndAllotment"));

function TabPanel(props) {
  const { children, value, index, ...other } = props;
  const useStyle = makeStyles((theme) => ({
    boxPadding: {
      paddingTop: 24,
      paddingBottom: 24,
      // paddingLeft: 24,
      [theme.breakpoints.down("sm")]: {
        paddingLeft: 0,
      },
    },
  }));
  const classes = useStyle();

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
        <Box className={classes.boxPadding}>
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

  const useStyle = makeStyles((theme) => ({
    root: {
      flexGrow: 1,
      backgroundColor: "#fff",
      borderRadius: 8,

      marginLeft: ui.drawerOpen ? 0 : "160px",
      marginRight: ui.drawerOpen ? 0 : "160px",
      [theme.breakpoints.down("md")]: {
        // width: "100%",
        marginTop:"24px",

        width: "100%",
        marginLeft: 4,
        marginRight: 4,
      },
      [theme.breakpoints.down("sm")]: {
        // width: "100%",
        marginTop:"24px",
        width: "100%",
        marginLeft: 0,
        marginRight: 0,
      },
    },

    default_tabStyle: {
      // fontSize: 13,
      margin: 5,
      color: "#000",
      fontSize: 13,
      fontWeight: 600,
      [theme.breakpoints.down("sm")]: {
        // width: "100%",
        margin: 2,
        fontSize: 9,
      },
    },

    active_tabStyle: {
      // fontSize: 13,
      // fontWeight: 500,
      backgroundColor: "#2A5FA5",
      margin: 5,
      borderRadius: 8,
      color: "#fff",
      "& .MuiTab-root": {
        padding: 0,
      },
      [theme.breakpoints.down("sm")]: {
        // width: "100%",
        margin: 2,
        fontSize: 9,
      },
    },
    flex: {
      display: "flex",
      flexDirection: "row",
    },
    backdrop: {
      zIndex: theme.zIndex.drawer + 1,
      color: "#fff",
    },

    boxPadding: {
      paddingTop: 24,
      paddingBottom: 24,
      // paddingLeft: 24,
      [theme.breakpoints.down("sm")]: {
        paddingLeft: 0,
      },
    },
  }));
  const classes = useStyle();
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
    dispatch({type:TRUCK_TRACKING_CONST.TRUCK_TRACKING_GATE_IN_DATA_INIT})
    dispatch({
      type:ENBLOCK_REDUCER_CONST.EN_BLOCK_VESSEL_VOYAGE_NAME_INIT
    })
    if (token) {
      var decode = jwt_decode(token);

      if (decode.exp < new Date().getTime() / 1000) {
        history.push("/login");
      }
    } else {
      history.push("/login");
    }
  }, []);

  return (
    <LayoutContainer
      footer={true}
    >
      <Grid item xs={12}>
        <Paper elevation={0} className={classes.root}>
          <Tabs
            value={value}
            onChange={handleChange}
            variant="fullWidth"
            indicatorColor="white"
            onClick={() => window.location.reload()}
          >
            <Tab
              onload={() => window.location.reload()}
              className={
                value === 0 ? classes.active_tabStyle : classes.default_tabStyle
              }
              label={<Typography>In</Typography>}
              {...a11yProps(0)}
              onClick={() => window.location.reload()}
            />
            <Tab
              className={
                value === 1 ? classes.active_tabStyle : classes.default_tabStyle
              }
              label={<Typography>{"Stocks & Allotment"}</Typography>}
              {...a11yProps(1)}
              onClick={() => window.location.reload()}
            />
            <Tab
              className={
                value === 2 ? classes.active_tabStyle : classes.default_tabStyle
              }
              label={<Typography>Out</Typography>}
              {...a11yProps(2)}
              onClick={() => window.location.reload()}
            />
          </Tabs>
        </Paper>
      </Grid>

      <TabPanel value={value} index={0}>
        <GateIn />
      </TabPanel>
      <TabPanel value={value} index={1}>
        <StocksAndAllotment />
      </TabPanel>

      <TabPanel value={value} index={2}>
        <GateOut />
      </TabPanel>
      <Backdrop className={classes.backdrop} open={ui.isloading}>
        <CircularProgress color="inherit" />
      </Backdrop>
    </LayoutContainer>
  );
};
export default Depot;
