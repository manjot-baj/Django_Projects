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

//Handling component section
const Handling = React.lazy(() =>
  import("../../pages/NewBillingModule/Handling")
);

//Transportation component section
const Transportation = React.lazy(() =>
  import("../../pages/NewBillingModule/Transportation")
);

//Repair component section
const Repair = React.lazy(() => import("../../pages/NewBillingModule/Repair"));

//NightCharges component section
const NightCharges = React.lazy(() => import("./NightCharges"));

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

const NewBillingModule = () => {
  const dispatch = useDispatch();
  const store = useSelector((state) => state);
  const history = useHistory();
  const { ui } = store;
  const [value, setValue] = React.useState(0);

  const useStyle = makeStyles((theme) => ({
    root: {
      flexGrow: 1,
      backgroundColor: "#fff",
      borderRadius: 8,
      marginLeft: ui.drawerOpen ? 0 : "",
      marginRight: ui.drawerOpen ? 0 : "",
      [theme.breakpoints.down("md")]: {
        maxWidth: "unset",
        marginLeft: "2%",
        marginTop:"12px",
        marginRight: "2%",
      },
      [theme.breakpoints.down("xs")]: {
        "& .MuiTab-wrapper": {
          "& p": {
            fontSize: "10px",
          },
        },
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
        [theme.breakpoints.down("xs")]: {
          display: "block",
        },
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
      dispatch({ type: "SET_NEW_BILLING_TYPE", payload: "Handling" });
    } else if (newValue === 1) {
      dispatch({ type: "SET_NEW_BILLING_TYPE", payload: "Night Charges" });
    } else if (newValue === 2) {
      dispatch({ type: "SET_NEW_BILLING_TYPE", payload: "Transportation" });
    } else {
      dispatch({ type: "SET_NEW_BILLING_TYPE", payload: "Repair" });
    }
  };

  useEffect(() => {
    if (ui.newBillingType === "Handling") {
      setValue(0);
    } else if (ui.newBillingType === "Night Charges") {
      setValue(1);
    } else if (ui.newBillingType === "Transportation") {
      setValue(2);
    } else {
      setValue(3);
    }
  }, [ui.newBillingType]);

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
    <LayoutContainer>
      <Grid container>
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
                className={
                  value === 0
                    ? classes.active_tabStyle
                    : classes.default_tabStyle
                }
                label={<Typography>Handling</Typography>}
                {...a11yProps(0)}
                onClick={() => window.location.reload()}
              />
              <Tab
                className={
                  value === 1
                    ? classes.active_tabStyle
                    : classes.default_tabStyle
                }
                label={<Typography>Night Charges</Typography>}
                onClick={() => window.location.reload()}
                {...a11yProps(2)}
              />
              <Tab
                className={
                  value === 2
                    ? classes.active_tabStyle
                    : classes.default_tabStyle
                }
                label={<Typography>Transportation</Typography>}
                onClick={() => window.location.reload()}
                {...a11yProps(1)}
              />
              <Tab
                className={
                  value === 3
                    ? classes.active_tabStyle
                    : classes.default_tabStyle
                }
                label={<Typography>Repair</Typography>}
                onClick={() => window.location.reload()}
                {...a11yProps(2)}
              />
            </Tabs>
          </Paper>
        </Grid>
      </Grid>

      <TabPanel value={value} index={0}>
        <RenderOnViewportEntry threshold={0.25}>
          <Handling />
        </RenderOnViewportEntry>
      </TabPanel>
      <TabPanel value={value} index={1}>
        <RenderOnViewportEntry threshold={0.25}>
          <NightCharges />
        </RenderOnViewportEntry>
      </TabPanel>
      <TabPanel value={value} index={2}>
        <RenderOnViewportEntry threshold={0.25}>
          <Transportation />
        </RenderOnViewportEntry>
      </TabPanel>
      <TabPanel value={value} index={3}>
        <RenderOnViewportEntry threshold={0.25}>
          <Repair />
        </RenderOnViewportEntry>
      </TabPanel>

      <Backdrop className={classes.backdrop} open={ui.isloading}>
        <CircularProgress color="inherit" />
      </Backdrop>
    </LayoutContainer>
  );
};
export default NewBillingModule;
