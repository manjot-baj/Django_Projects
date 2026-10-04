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
  Stack,
  useMediaQuery,
  tabsClasses,
  alpha,
} from "@mui/material";
import PropTypes from "prop-types";
import Box from "@mui/material/Box";
import LayoutContainer from "@components/reusablecomponents/LayoutContainer";
import { useHistory } from "react-router-dom";
import RenderOnViewportEntry from "../../utils/RenderOnViewPort";
import { custombackDropStyle } from "../../utils/CustomClasses";

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
            paddingBottom: 12,
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

const NewBillingModule = () => {
  const dispatch = useDispatch();
  const store = useSelector((state) => state);
  const history = useHistory();
  const { ui } = store;
  const [value, setValue] = React.useState(0);
  const matchesIphone = useMediaQuery((theme) => theme.breakpoints.down("sm"));

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
      var decode = jwtDecode(token);

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
        <Grid item size={{ xs: 12 }}>
          <Paper
            elevation={0}
            sx={(theme) => ({
              flexGrow: 1,
              backgroundColor: "#fff",
              borderRadius: 12,
              width: "80%",
              margin: "auto",
              [theme.breakpoints.down("sm")]: {
                bgcolor: "transparent",
              },
            })}
          >
            <Tabs
              value={value}
              onChange={handleChange}
              indicatorColor="white"
              onClick={() => window.location.reload()}
              variant={matchesIphone ? "scrollable" : "fullWidth"}
              scrollButtons
              aria-label="visible arrows tabs example"
              sx={{
                [`& .${tabsClasses.scrollButtons}`]: {
                  "&.Mui-disabled": { opacity: 0.3 },
                },
              }}
            >
              <Tab
                sx={(theme) => ({
                  fontSize: 13,
                  borderRadius: value === 0 ? 12 : 12,
                  fontWeight: 600,
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
                  <Stack
                    direction={"row"}
                    alignItems={"center"}
                    justifyContent={"center"}
                    spacing={2}
                  >
                    <Typography
                      sx={(theme) => ({
                        fontWeight: value === 0 ? 600 : 400,
                        [theme.breakpoints.down("sm")]: {
                          fontSize: 12,
                        },
                      })}
                    >
                      Handling
                    </Typography>
                  </Stack>
                }
                {...a11yProps(0)}
                onClick={() => window.location.reload()}
              />
              <Tab
                sx={(theme) => ({
                  fontSize: 13,
                  borderRadius: value === 1 ? 12 : 12,
                  fontWeight: 600,
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
                  <Stack
                    direction={"row"}
                    alignItems={"center"}
                    justifyContent={"center"}
                    spacing={2}
                  >
                    <Typography
                      sx={(theme) => ({
                        fontWeight: value === 1 ? 600 : 400,
                        [theme.breakpoints.down("sm")]: {
                          fontSize: 12,
                        },
                      })}
                    >
                      Night Charges
                    </Typography>
                  </Stack>
                }
                onClick={() => window.location.reload()}
                {...a11yProps(2)}
              />
              <Tab
                sx={(theme) => ({
                  fontSize: 13,
                  borderRadius: value === 2 ? 12 : 12,
                  fontWeight: 600,
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
                  <Stack
                    direction={"row"}
                    alignItems={"center"}
                    justifyContent={"center"}
                    spacing={2}
                  >
                    <Typography
                      sx={(theme) => ({
                        fontWeight: value === 2 ? 600 : 400,
                        [theme.breakpoints.down("sm")]: {
                          fontSize: 12,
                        },
                      })}
                    >
                      Transportation
                    </Typography>
                  </Stack>
                }
                onClick={() => window.location.reload()}
                {...a11yProps(1)}
              />
              <Tab
                sx={(theme) => ({
                  fontSize: 13,
                  borderRadius: value === 3 ? 12 : 12,
                  fontWeight: 600,
                  color:
                    value === 3
                      ? theme.palette.primary.main
                      : alpha(theme.palette.secondary.main, 0.5),
                  [theme.breakpoints.down("sm")]: {
                    marginX: 0,
                    marginY: 1,
                  },
                })}
                label={
                  <Stack
                    direction={"row"}
                    alignItems={"center"}
                    justifyContent={"center"}
                    spacing={2}
                  >
                    <Typography
                      sx={(theme) => ({
                        fontWeight: value === 3 ? 600 : 400,
                        [theme.breakpoints.down("sm")]: {
                          fontSize: 12,
                        },
                      })}
                    >
                      Repair
                    </Typography>
                  </Stack>
                }
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

      <Backdrop sx={custombackDropStyle} open={ui.isloading}>
        <CircularProgress color="inherit" />
      </Backdrop>
    </LayoutContainer>
  );
};
export default NewBillingModule;
