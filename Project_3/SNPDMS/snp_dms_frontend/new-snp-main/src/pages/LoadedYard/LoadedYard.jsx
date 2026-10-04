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
import { useHistory } from "react-router-dom";
import RenderOnViewportEntry from "../../utils/RenderOnViewPort";
import { custombackDropStyle } from "../../utils/CustomClasses";

// GateInYard component section
const GateInYard = React.lazy(() => import("./GateInYard"));

// GateOutYard component section
const GateOutYard = React.lazy(() => import("./GateOutYard"));

// StockYard component section
const StockYard = React.lazy(() => import("./StockYard"));

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
      {value === index && (
        <Box
          sx={(theme) => ({
            paddingTop: 4,
            paddingBottom: 24,
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

const LoadedYard = () => {
  const store = useSelector((state) => state);
  const history = useHistory();
  const { ui } = store;
  const [value, setValue] = React.useState("");
  const dispatch = useDispatch();

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
      var decode = jwtDecode(token);

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
        <Grid item size={{ xs: 12 }}>
          <Paper
            elevation={0}
            sx={(theme) => ({
              flexGrow: 1,
              backgroundColor: "#fff",
              borderRadius: 20,
              width: 440,
              margin: "auto",
              [theme.breakpoints.down("lg")]: {
                marginX: "auto",
              },
              [theme.breakpoints.down("sm")]: {
                width: "100%",
                bgcolor: "transparent",
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
                onload={() => window.location.reload()}
                sx={(theme) => ({
                  fontSize: 13,
                  borderRadius: value === 0 ? 12 : 12,
                  color:
                    value === 0
                      ? theme.palette.primary.main
                      : alpha(theme.palette.secondary.main, 0.5),
                  [theme.breakpoints.down("sm")]: {
                    marginX: 0,
                    marginY: 1,
                  },
                })}
                label={
                  <Typography sx={{ fontWeight: value === 0 ? 600 : 400 }}>
                    {" "}
                    In{" "}
                  </Typography>
                }
                {...a11yProps(0)}
                onClick={() => window.location.reload()}
              />
              <Tab
                sx={(theme) => ({
                  fontSize: 13,
                  borderRadius: value === 1 ? 12 : 12,
                  color:
                    value === 1
                      ? theme.palette.primary.main
                      : alpha(theme.palette.secondary.main, 0.5),
                  [theme.breakpoints.down("sm")]: {
                    marginX: 0,
                    marginY: 1,
                  },
                })}
                label={
                  <Typography sx={{ fontWeight: value === 1 ? 600 : 400 }}>
                    Stock
                  </Typography>
                }
                {...a11yProps(1)}
                onClick={() => window.location.reload()}
              />
              <Tab
                sx={(theme) => ({
                  fontSize: 13,
                  borderRadius: value === 2 ? 12 : 12,
                  color:
                    value === 2
                      ? theme.palette.primary.main
                      : alpha(theme.palette.secondary.main, 0.5),
                  [theme.breakpoints.down("sm")]: {
                    marginX: 0,
                    marginY: 1,
                  },
                })}
                label={
                  <Typography sx={{ fontWeight: value === 2 ? 600 : 400 }}>
                    {" "}
                    Out{" "}
                  </Typography>
                }
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
      <Backdrop sx={custombackDropStyle} open={ui.isloading}>
        <CircularProgress color="inherit" />
      </Backdrop>
    </LayoutContainer>
  );
};
export default LoadedYard;
