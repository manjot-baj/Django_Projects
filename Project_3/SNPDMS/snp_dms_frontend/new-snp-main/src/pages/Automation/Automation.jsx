import React, { useEffect } from "react";
import {
  Typography,
  Paper,
  Grid,
  Button,
  useMediaQuery,
  useTheme,
  Menu,
  MenuItem,
  Box,
  Backdrop,
  CircularProgress,
} from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import LayoutContainer from "@components/reusablecomponents/LayoutContainer";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import { jwtDecode } from "jwt-decode";
import {
  newAutomationBookingNumber,
  bookingNumberSearchDispatchAutomation,
} from "../../actions/AutomationActions";
import { useHistory } from "react-router-dom";
import AutomationBookingSearch from "../../components/AutomationBookingSearch";
import { useSnackbar } from "notistack";
import { getMainDashboardDetailsDispatch } from "../../actions/DashboardActions";
import { dropDownDispatch } from "../../actions/GateInActions";
import BookingTabSection from "./BookingTabSections";
import { custombackDropStyle } from "@/utils/CustomClasses";

const Automation = () => {
  const history = useHistory();
  const store = useSelector((state) => state);
  const { user, gateIn } = store;
   const { isloading } = useSelector((state) => state.ui);
  const dispatch = useDispatch();
  const notify = useSnackbar().enqueueSnackbar;
  const theme = useTheme();

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
      var decode = jwtDecode(token);
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

  useEffect(() => {
    return () => {
      dispatch(
        bookingNumberSearchDispatchAutomation({
          booking_no: "",
        }),
      );
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <LayoutContainer footer={false}>
      <Grid
        container
        spacing={1}
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Grid item size={{ xs: 12, lg: 4, xl: 7 }}>
          <Typography variant="h5"> Allotment Dashboard</Typography>
        </Grid>
        <Grid
          item
          size={{ xs: 12, lg: 8, xl: 5 }}
          style={{
            display: "flex",
            alignItems: "center",
          }}
        >
          <Grid container spacing={1}>
            <Grid
              item
              size={{ xs: 12, md: 6 }}
              sx={(theme) => ({
                display: "flex",
                alignItems: "center",
                [theme.breakpoints.down("md")]: {
                  justifyContent: "space-between",
                },
              })}
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
                sx={(theme) => ({
                  marginLeft: 2,
                  width: 240,
                  padding: theme.spacing(0.75, 1),
                  borderRadius: 2,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  backgroundColor: "#fff",
                })}
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
                      gateIn?.allDropDown.location_site_dashboard_list,
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
              size={{ xs: 12, md: 6 }}
              sx={(theme) => ({
                display: "flex",
                alignItems: "center",
                [theme.breakpoints.down("md")]: {
                  justifyContent: "space-between",
                },
              })}
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
                sx={(theme) => ({
                  marginLeft: 2,
                  width: 240,
                  padding: theme.spacing(0.75, 1),
                  borderRadius: 2,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  backgroundColor: "#fff",
                })}
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
                          item.automatic_mnr_status_change,
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
      <Grid>
        <Paper
          sx={(theme) => ({
            backgroundColor: "#EAF0F5",
            borderRadius: 4,
            padding: theme.spacing(1.5, 1.5),
            margin: theme.spacing(0.5, 1),
          })}
          elevation={0}
          style={{ marginTop: "40px" }}
        >
          <Grid style={{ display: "flex", justifyContent: "space-between" }}>
            <AutomationBookingSearch
              paymentSearchResult={store.search.AutomationBookingSerachResult}
              getSearchResultType="GET_AUTOMATION_BOOKING_SEARCH_RESULTS"
              setSelectedPaymentType="SET_SELECTED_BOOKING_NUMBER"
              updatePaymentType="UPDATE_ALLOTMENT_BOOKING_DETAILS"
              searchAction={bookingNumberSearchDispatchAutomation}
            />
          </Grid>
        </Paper>
      </Grid>
      <BookingTabSection />
      <Box mt={24} />
      <Backdrop sx={custombackDropStyle} open={isloading}>
        <CircularProgress color="inherit" />
      </Backdrop>
    </LayoutContainer>
  );
};

export default Automation;
