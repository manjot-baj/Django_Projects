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
import LayoutContainer from "../../components/reusableComponents/LayoutContainer";
import { useHistory } from "react-router-dom";
import RenderOnViewportEntry from "../../../src/utils/RenderOnViewPort";

// GateInYard component section
const GateInYard = React.lazy(() => import("./GateInYard"));

// GateOutYard component section
const GateOutYard = React.lazy(() => import("./GateOutYard"));

// StockYard component section
const StockYard = React.lazy(() => import("./StockYard"));

function TabPanel(props) {
  const { children, value, index, ...other } = props;
  const useStyle = makeStyles((theme) => ({
    boxPadding: {
      paddingTop: 24,
      paddingBottom: 24,
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

const LoadedYard = () => {
  const store = useSelector((state) => state);
  const history = useHistory();
  const { ui } = store;
  const [value, setValue] = React.useState("");
  const dispatch = useDispatch();

  const useStyle = makeStyles((theme) => ({
    root: {
      flexGrow: 1,
      backgroundColor: "#fff",
      borderRadius: 8,
      marginLeft: ui.drawerOpen ? 0 : "160px",
      marginRight: ui.drawerOpen ? 0 : "160px",
      [theme.breakpoints.down("md")]: {
        maxWidth: "unset",
        marginLeft: "2%",
        marginRight: "2%",
        marginTop:"12px"
      },
    },
    default_tabStyle: {
      margin: 5,
      color: "#000",
      fontSize: 13,
      fontWeight: 600,
      [theme.breakpoints.down("sm")]: {
        margin: 2,
        fontSize: 9,
      },
    },
    active_tabStyle: {
      backgroundColor: "#2A5FA5",
      margin: 5,
      borderRadius: 8,
      color: "#fff",
      "& .MuiTab-root": {
        padding: 0,
      },
      [theme.breakpoints.down("sm")]: {
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
      [theme.breakpoints.down("sm")]: {
        paddingLeft: 0,
      },
    },
  }));
  const classes = useStyle();

  const handleChange = (event, newValue) => {
    setValue(newValue);
    if (newValue === 0) {
      dispatch({ type: "CLEAR_GATE_IN_REDUCER_YARD" });
      dispatch({ type: "SET_LOADED_YARD_TYPE", payload: "IN" });
      dispatch({ type: "RESET_YARD_SEARCH_DATA_SEARCH" });
    } else if (newValue === 1) {
      dispatch({ type: "SET_LOADED_YARD_TYPE", payload: "STOCKS" });
    } else {
      dispatch({ type: "CLEAR_GATE_IN_REDUCER_YARD" });
      dispatch({ type: "RESET_YARD_SEARCH_DATA_SEARCH" });
      dispatch({ type: "SET_LOADED_YARD_TYPE", payload: "OUT" });
    }
  };

  useEffect(() => {
    if (ui.loadedYardType === "IN") {
      setValue(0);
    } else if (ui.loadedYardType === "STOCKS") {
      setValue(1);
    } else {
      setValue(2);
    }
  }, [ui.loadedYardType]);

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

  return (
    <LayoutContainer footer={false}>
      <Grid container>
        <Grid item xs={12}>
          <Paper elevation={0} className={classes.root}>
            <Tabs
              value={value}
              onChange={handleChange}
              variant="fullWidth"
              indicatorColor="white"
            >
              <Tab
                onload={() => window.location.reload()}
                className={
                  value === 0
                    ? classes.active_tabStyle
                    : classes.default_tabStyle
                }
                label={<Typography> In </Typography>}
                {...a11yProps(0)}
                onClick={() => window.location.reload()}
              />
              <Tab
                className={
                  value === 1
                    ? classes.active_tabStyle
                    : classes.default_tabStyle
                }
                label={<Typography>Stock</Typography>}
                {...a11yProps(1)}
                onClick={() => window.location.reload()}
              />
              <Tab
                className={
                  value === 2
                    ? classes.active_tabStyle
                    : classes.default_tabStyle
                }
                label={<Typography> Out </Typography>}
                {...a11yProps(2)}
                onClick={() => window.location.reload()}
              />
            </Tabs>
          </Paper>
        </Grid>
      </Grid>
      <RenderOnViewportEntry threshold={0.25}>
        <TabPanel value={value} index={0}>
          <GateInYard />
        </TabPanel>
        <TabPanel value={value} index={1}>
          <StockYard />
        </TabPanel>
        <TabPanel value={value} index={2}>
          <GateOutYard />
        </TabPanel>
      </RenderOnViewportEntry>
      <Backdrop className={classes.backdrop} open={ui.isloading}>
        <CircularProgress color="inherit" />
      </Backdrop>
    </LayoutContainer>
  );
};
export default LoadedYard;
