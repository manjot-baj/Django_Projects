import React, { useEffect } from "react";
import {
  makeStyles,
  Typography,
  Paper,
  Grid,
  Button,
  useMediaQuery,
  useTheme,
  Menu,
  MenuItem,
} from "@material-ui/core";
import { useDispatch, useSelector } from "react-redux";
import LayoutContainer from "../../components/reusableComponents/LayoutContainer";
import KeyboardArrowDownIcon from "@material-ui/icons/KeyboardArrowDown";
import jwt_decode from "jwt-decode";
import { newAutomationBookingNumber } from "../../actions/AutomationActions";
import { useHistory } from "react-router-dom";
import { useSnackbar } from "notistack";
import { getMainDashboardDetailsDispatch } from "../../actions/DashboardActions";
import { dropDownDispatch } from "../../actions/GateInActions";
import AutomationNonDepotContainer from "./AutomationNonDepotContainer";
const NonDepotContainer = () => {
  const history = useHistory();
  const store = useSelector((state) => state);
  const { user, gateIn } = store;
  const dispatch = useDispatch();
  const notify = useSnackbar().enqueueSnackbar;
  const theme = useTheme();
  const useStyles = makeStyles((theme) => ({
    blueBGContainer: {
      backgroundColor: "#EAF0F5",
      borderRadius: 10,
      padding: theme.spacing(1.5, 1.5),
      margin: theme.spacing(0.5, 1),
      // marginTop: 12,
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
  }));
  const classes = useStyles();
  const [anchorLocation, setAnchorLocation] = React.useState(null);
  const [anchorSite, setAnchorSite] = React.useState(null);
  // eslint-disable-next-line no-unused-vars
  const [loading, setLoading] = React.useState(false);
  const handleLocationClick = (event) => {
    setAnchorLocation(event.currentTarget);
  };
  const handleLocationClose = () => {
    setAnchorLocation(null);
  };
  const handleSiteClick = (event) => {
    setAnchorSite(event.currentTarget);
  };
  const handleSiteClose = () => {
    setAnchorSite(null);
  };
  const matches = useMediaQuery(theme.breakpoints.down("xs"));
  // Check if the token is expired if yes then push to login
  useEffect(() => {
    var token = localStorage.getItem("accessToken");
    if (token) {
      var decode = jwt_decode(token);
      if (decode.exp < new Date().getTime() / 1000) {
        history.push("/login");
      } else {
        let reqArray = [
          "location_site_dashboard_list",
          "location_site_type_dashboard_list",
        ];

        dispatch(getMainDashboardDetailsDispatch());
        dispatch(dropDownDispatch(reqArray, notify));
      }
    } else {
      history.push("/login");
    }

// eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (
      localStorage.getItem("location") === "" ||
      localStorage.getItem("site") === ""
    ) {
      notify("Enter Location and Site in Dashboard", {
        variant: "warning",
      });
    } else {
      let data = {
        container_list: "",
        location: localStorage.getItem("location")
          ? localStorage.getItem("location")
          : "ALL",
        site: localStorage.getItem("site")
          ? localStorage.getItem("site")
          : "ALL",
      };
      dispatch(newAutomationBookingNumber(data));
      setLoading(true);
    }
   
// eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <LayoutContainer footer={false}>
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
          <Typography variant="h5"> NonDepotContainer Details</Typography>
        </Grid>
        <Grid
          item
          xs={12}
          lg={5}
          style={{
            display: "flex",
            alignItems: "center",
          }}
        >
          <Grid container spacing={2}>
            <Grid
              item
              xs={12}
              lg={6}
              style={{ display: "flex", alignItems: "center" }}
            >
              <Typography
                variant="subtitle1"
                style={{ opacity: 0.7, width: matches && "30%" }}
              >
                Location
              </Typography>
              <Paper
                component={Button}
                disabled={
                  (user.role === "Location Admin" ||
                    user.role === "Site Admin" ||
                    user.role === "Depot User") &&
                  true
                }
                onClick={handleLocationClick}
                className={classes.dropdownPaper}
              >
                <Typography>{user?.location}</Typography>
                <KeyboardArrowDownIcon />
              </Paper>
              {anchorLocation && (
                <Menu
                  id="simple-menu"
                  anchorEl={anchorLocation}
                  keepMounted
                  open={Boolean(anchorLocation)}
                  onClose={handleLocationClose}
                >
                  {gateIn.allDropDown &&
                    gateIn.allDropDown.location_site_dashboard_list &&
                    Object.keys(
                      gateIn?.allDropDown.location_site_dashboard_list
                    ).map((loc, index) => (
                      <MenuItem
                        style={{ padding: "0px 25px" }}
                        key={index}
                        onClick={() => {
                          dispatch({ type: "SET_LOCATION", payload: loc });
                          dispatch({ type: "SET_SITE", payload: "" });
                          dispatch({
                            type: "SET_STOCK_ALLOT_SEARCH_LOCATION",
                            payload: loc,
                          });
                          dispatch({
                            type: "SET_MNR_SEARCH_LOCATION",
                            payload: loc,
                          });
                          localStorage.setItem("location", loc);
                          handleLocationClose();
                        }}
                      >
                        {loc}
                      </MenuItem>
                    ))}
                </Menu>
              )}
            </Grid>
            <Grid
              item
              xs={12}
              lg={6}
              style={{ display: "flex", alignItems: "center" }}
            >
              <Typography
                variant="subtitle1"
                style={{ opacity: 0.7, width: matches && "30%" }}
              >
                Site
              </Typography>
              <Paper
                component={Button}
                onClick={handleSiteClick}
                disabled={
                  (user.role === "Site Admin" || user.role === "Depot User") &&
                  true
                }
                className={classes.dropdownPaper}
              >
                <Typography>{user.site}</Typography>
                <KeyboardArrowDownIcon />
              </Paper>
              <Menu
                id="simple-menu"
                anchorEl={anchorSite}
                keepMounted
                open={Boolean(anchorSite)}
                onClose={handleSiteClose}
              >
                {user.location !== null &&
                  gateIn.allDropDown &&
                  gateIn.allDropDown.location_site_type_dashboard_list &&
                  gateIn.allDropDown.location_site_type_dashboard_list[
                    user.location
                  ].map((item, index) => (
                    <MenuItem
                      style={{ padding: "5px 70px 5px 70px" }}
                      key={index}
                      onClick={() => {
                        dispatch({ type: "SET_SITE", payload: item.site });
                        dispatch({ type: "SET_TYPE", payload: item.type });
                        dispatch({
                          type: "SET_MNR_MODULE",
                          payload: item.mnr_module,
                        });
                        dispatch({
                          type: "SET_TRANPORTATION_MODULE",
                          payload: item.transportation_module,
                        });
                        dispatch({
                          type: "SET_NEW_BILLING_MODULE",
                          payload: item.new_billing_module,
                        });
                        dispatch({
                          type: "SET_AUTO_STATUS_CHANGE",
                          payload: item.automatic_mnr_status_change,
                        });
                        dispatch({
                          type: "SET_STOCK_ALLOT_SEARCH_SITE",
                          payload: item.site,
                        });
                        dispatch({
                          type: "SET_MNR_SEARCH_SITE",
                          payload: item.site,
                        });
                        localStorage.setItem("site", item.site);
                        localStorage.setItem("type", item.type);
                        localStorage.setItem("mnr_module", item.mnr_module);
                        if (
                          item.transportation_module === "" ||
                          item.transportation_module === false
                        ) {
                          dispatch({
                            type: "SET_TRANSPORTATION_MODULE",
                            payload: false,
                          });
                          localStorage.setItem("transportation_module", false);
                        } else {
                          dispatch({
                            type: "SET_TRANSPORTATION_MODULE",
                            payload: true,
                          });
                          localStorage.setItem("transportation_module", true);
                        }
                        if (
                          item.new_billing_module === "" ||
                          item.new_billing_module === false
                        ) {
                          dispatch({
                            type: "SET_NEW_BILLING_MODULE",
                            payload: false,
                          });
                          localStorage.setItem("new_billing_module", false);
                        } else {
                          dispatch({
                            type: "SET_NEW_BILLING_MODULE",
                            payload: true,
                          });
                          localStorage.setItem("new_billing_module", true);
                        }
                        localStorage.setItem(
                          "automatic_mnr_status_change",
                          item.automatic_mnr_status_change
                        );
                        handleSiteClose();
                      }}
                    >
                      {item.site}
                    </MenuItem>
                  ))}
              </Menu>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
      <AutomationNonDepotContainer />
    </LayoutContainer>
  );
};

export default NonDepotContainer;
