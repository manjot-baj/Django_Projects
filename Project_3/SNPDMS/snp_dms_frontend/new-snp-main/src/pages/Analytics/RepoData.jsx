import React, { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import {
  Typography,
  Box,
  Grid,
  useTheme,
  useMediaQuery,
  CircularProgress,
  Button,
  Menu,
  MenuItem,
  Divider,
  Popover,
  Select,
  IconButton,
  Tooltip,
} from "@mui/material";
import { useHistory } from "react-router-dom";
import LayoutContainer from "@components/reusablecomponents/LayoutContainer";
// movement
import { Stack } from "@mui/material";
import MovementCard from "../../components/analytics/HandlingMovementCard";
import { useDispatch, useSelector } from "react-redux";
import Loader from "../../components/analytics/Loader";
import RenderOnViewportEntry from "../../utils/RenderOnViewPort";
import { getRepoClientData } from "../../actions/AnalyticsActions";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import SearchIcon from "@mui/icons-material/Search";
import RefreshIcon from "@mui/icons-material/Refresh";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import { dropDownDispatch } from "../../actions/GateInActions";
import { useSnackbar } from "notistack";
import CleaningServicesIcon from "@mui/icons-material/CleaningServices";
import { cacheCleanService } from "../../utils/WeekNumbre";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers";
import dayjs from "dayjs";

const CardContainer = React.lazy(() =>
  import("../../components/analytics/RepoCardContainer")
);

const drawerWidth = 220;

function loaded(obj) {
  for (let i in obj) {
    if (obj[i] == null) {
      return false;
    }
  }
  return true;
}

const RepoData = (props) => {
  const array = [
    "Today",
    "Yesterday",
    "This Week",
    "Previous Week",
    "This Month",
    "Previous Month",
    "Last Three Month",
    "Last Six Month",
    "Last Nine Month",
    "This Year",
    "Previous Year",
  ];

  const store = useSelector((state) => state);
  const { analytics, gateIn } = store;
  const history = useHistory();
  const theme = useTheme();
  const notify = useSnackbar().enqueueSnackbar;
  const dispatch = useDispatch();
  const [anchorEl, setAnchorEl] = React.useState(null);
  const matches = useMediaQuery(theme.breakpoints.down("xs"));
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [lineType, setLineType] = useState("");
  const [cacheLoader, setCacheLoader] = useState(false);
  const matchesIphone = useMediaQuery("(max-width:500px)");
  const [timeDropdownSelect, setTimeDropdownSelect] =
    React.useState("This Month");

  const [anchorElSearch, setAnchorElSearch] = React.useState(null);

  const handleClickSearch = (event) => {
    setAnchorElSearch(event.currentTarget);
  };

  const handleCloseSearch = () => {
    setAnchorElSearch(null);
  };

  const openSearch = Boolean(anchorElSearch);
  const idSearch = openSearch ? "simple-popover-search" : undefined;

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const selectMenuItem = (item) => {
    setTimeDropdownSelect(item);
    setAnchorEl(null);
  };
  const handleArrivedClick = () => {
    dispatch({ type: "SET_ANALYTICS_REPO_MOVEMENT", payload: "Arrived" });
    dispatch(getRepoClientData(timeDropdownSelect, fromDate, toDate, lineType));
  };

  const handleDateChange = (date, setValue) => {
    var selectedDate = new Date(date);
    var dd = String(selectedDate.getDate()).padStart(2, "0");
    var mm = String(selectedDate.getMonth() + 1).padStart(2, "0"); //
    var yyyy = selectedDate.getFullYear();
    var selectedDateFormat = yyyy + "-" + mm + "-" + dd;
    setValue(selectedDateFormat);
  };

  const handleDepartClick = () => {
    dispatch({ type: "SET_ANALYTICS_REPO_MOVEMENT", payload: "Departed" });
    dispatch(getRepoClientData(timeDropdownSelect, fromDate, toDate, lineType));
  };

  const handleCleanCache = () => {
    cacheCleanService(setCacheLoader, notify, dispatch);
  };

  useEffect(() => {
    var token = localStorage.getItem("accessToken");
    if (token) {
      var decode = jwtDecode(token);
      if (decode.exp < new Date().getTime() / 1000) {
        history.push("/login");
      } else {
        // Error
      }
    } else {
      history.push("/login");
    }
  }, []);

  useEffect(() => {
    let reqArray = [
      "location_site_dashboard_list",
      "location_site_type_dashboard_list",
    ];
    dispatch(dropDownDispatch(reqArray, notify, true));
    dispatch(getRepoClientData(timeDropdownSelect, fromDate, toDate, lineType));
  }, []);

  return !(
    analytics.allRepoDataListing && loaded(analytics.allRepoDataListing)
  ) ? (
    <Loader />
  ) : (
    <LayoutContainer footer={false}>
      <Box
        sx={(theme) => ({
          marginLeft: 3,
          marginRight: 3,
          [theme.breakpoints.down("sm")]: {
            marginLeft: 0,
            marginRight: 0,
          },
        })}
      >
        <Grid
          container
          spacing={2}
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Grid
            item
            size={{ sm: matchesIphone ? 12 : 4, lg: 4 }}
            sx={(theme) => ({
              [theme.breakpoints.down("sm")]: {
                marginTop: "12px",
              },
            })}
          >
            <Typography variant="h5">Repo Movement</Typography>
          </Grid>
          <Grid
            item
            size={{ sm: matchesIphone ? 12 : 8, lg: 8 }}
            lg={8}
            spacing={2}
            style={{
              justifyContent: "flex-end",
              alignItems: "center",
              display: "flex",
            }}
          >
            {analytics.allRepoDataListing?.cache && !matchesIphone && (
              <Tooltip
                title={
                  analytics.allRepoDataListing?.cache
                    ? "Clean Analytics  Data "
                    : "Cleaned Analytics Data"
                }
                placement="bottom"
              >
                <Button
                  disabled={!analytics.allRepoDataListing?.cache}
                  onClick={handleCleanCache}
                  variant="text"
                  color="primary"
              
                
                  startIcon={<CleaningServicesIcon fontSize="small" />}
                >
                  {analytics.allRepoDataListing?.cache
                    ? "Clean Cache"
                    : "Cleaned"}{" "}
                </Button>
              </Tooltip>
            )}
            <Button
              sx={(theme) => ({
                backgroundColor:
                  analytics.repoMovement === "Arrived" ? theme.palette.primary.main : "white",
                color:
                  analytics.repoMovement === "Arrived"
                    ? "white"
                    : theme.palette.text.primary,

                margin: "0 3px",
                width: "100px",
              })}
              variant="contained"
              onClick={handleArrivedClick}
            >
              Arrived
            </Button>
            <Button
              sx={{
                backgroundColor:
                  analytics.repoMovement === "Departed" ? theme.palette.primary.main : "white",
                color:
                  analytics.repoMovement === "Departed"
                    ? "white"
                    : theme.palette.text.primary,

                margin: "0 3px",
                width: "100px",
              }}
              variant="contained"
              onClick={handleDepartClick}
            >
              Departed
            </Button>
            <Box
              sx={{
                backgroundColor: "white",
                color: "black",
                margin: "0 3px",
                width: "180px",
                height: "37px",
              }}
              variant="contained"
            >
              <Button
                sx={{
                  backgroundColor: "transparent",
             
                  fontWeight: 600,
                }}
                startIcon={<CalendarTodayIcon fontSize="small" />}
                endIcon={<KeyboardArrowDownIcon fontSize="large" />}
                onClick={handleClick}
              >
                {timeDropdownSelect}
              </Button>
              <Menu
                id="month-menu"
                anchorEl={anchorEl}
                keepMounted
                open={Boolean(anchorEl)}
                onClose={handleClose}
              >
                {array.map((item, index) => {
                  return (
                    <MenuItem
                      onClick={() => {
                        selectMenuItem(item);
                        setFromDate("");
                        setToDate("");
                        dispatch(getRepoClientData(item, "", "", lineType));
                      }}
                      index={`${index}-time-dpdwn`}
                    >
                      {item}
                    </MenuItem>
                  );
                })}
              </Menu>
            </Box>
            {!matchesIphone && (
              <IconButton
                sx={(theme)=>({
                  backgroundColor: theme.palette.primary.main,
                  borderRadius: "5px",
                  height: "37px",
                  width: "50px",
                  marginLeft: "2px",
                })}
                onClick={handleClickSearch}
              >
                <FilterAltIcon style={{ fill: "white" }} fontSize="small" />
              </IconButton>
            )}
          </Grid>
        </Grid>
        <Popover
          id={idSearch}
          open={openSearch}
          anchorEl={anchorElSearch}
          onClose={handleCloseSearch}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "left",
          }}
          style={{
            marginTop: "-30px",
            marginLeft: "-60px",
            borderRadius: "20px",
          }}
        >
          <Box
            sx={{
              padding: "10px 10px 20px",
            }}
          >
            <Stack
              direction={"row"}
              flexDirection={"row"}
              alignItems={"center"}
              justifyContent={"space-between"}
            >
              <Typography variant="body1">Filter</Typography>
              <Stack
                direction={"row"}
                flexDirection={"row"}
                alignItems={"center"}
                justifyContent={"flex-end"}
              >
                <IconButton
                  onClick={() => {
                    dispatch(
                      getRepoClientData(
                        timeDropdownSelect,
                        fromDate,
                        toDate,
                        lineType
                      )
                    );
                    handleCloseSearch();
                  }}
                >
                  {" "}
                  <SearchIcon style={{ fill: "black" }} />
                </IconButton>
                <IconButton
                  onClick={() => {
                    setLineType("");
                    setFromDate("");
                    setToDate("");
                    dispatch(getRepoClientData(timeDropdownSelect, "", "", ""));
                    handleCloseSearch();
                  }}
                >
                  <RefreshIcon />
                </IconButton>
              </Stack>
            </Stack>

            <Divider />
            <Stack
              direction={"column"}
              flexDirection={"column"}
              alignItems={"flex-start"}
              spacing={1}
              marginTop={2}
            >
              <Typography variant="caption">From date</Typography>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  slotProps={{ textField: { size: "small" } }}
                  format="YYYY/MM/DD"
                  id={`-date-picker-inline`}
                  value={fromDate ? dayjs(fromDate) : null}
                  name="from_date"
                  onChange={(date) => {
                    handleDateChange(date, setFromDate);
                  }}
                />
              </LocalizationProvider>
              <Typography variant="caption">To date</Typography>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  slotProps={{ textField: { size: "small" } }}
                  format="YYYY/MM/DD"
                  id={`-date-picker-inline`}
                  value={toDate ? dayjs(toDate) : null}
                  name="from_date"
                  onChange={(date) => {
                    handleDateChange(date, setToDate);
                  }}
                />
              </LocalizationProvider>
              <Typography variant="caption">Line</Typography>
              <Select
                id="Line Name"
                value={lineType}
                name="size"
                variant="outlined"
                fullWidth
                sx={(theme) => ({
                  marginLeft: theme.spacing(1),
                  flex: 1,
                  maxHeight: "32px",
                  borderRadius: "5px",
                  fontSize: "12px",
                  [theme.breakpoints.down("xs")]: {
                    padding: 1,
                    fontSize: "0.8rem",
                  },
                })}
                inputProps={{
                  style: {
                    padding: "0px",
                  },
                }}
              >
                {gateIn?.allDropDown?.client_ref_codes?.map((val, index) => (
                  <MenuItem
                    key={val}
                    value={val}
                    onClick={() => {
                      setLineType(val);
                    }}
                  >
                    {val}
                  </MenuItem>
                ))}
              </Select>
            </Stack>
          </Box>
        </Popover>
        {/* LOLO IN */}
        {/* OVERALL */}
        {matchesIphone && (
          <Stack
            direction={"row"}
            justifyContent={"flex-end"}
            flexDirection={"row"}
            mt={4}
          >
            <IconButton
              sx={(theme)=>({
                backgroundColor: theme.palette.primary.main,
                borderRadius: "5px",
                height: "37px",
                width: "50px",
                marginLeft: "2px",
              })}
              onClick={handleClickSearch}
            >
              <FilterAltIcon style={{ fill: "white" }} fontSize="small" />
            </IconButton>
          </Stack>
        )}
        <RenderOnViewportEntry
          threshold={0.25}
          style={{ height: "fit-content", minHeight: "240px" }}
        >
          <CardContainer
            title={"Factory"}
            timeDispatchAction={getRepoClientData}
            process={"lolo"}
            movement={"IN"}
            phase={"Overall"}
            cache={analytics.allRepoDataListing?.cache}
          >
            {analytics.allRepoDataListing ? (
              <Grid container spacing={matches ? 0 : 2}>
                <Grid item size={{ xs: 12, sm: 12, lg: 12 }}>
                  <MovementCard
                    repo={true}
                    title={""}
                    data={{
                      "Size 20":
                        analytics.allRepoDataListing.data?.volume_data
                          .repo_20_factory,
                      "Size 40":
                        analytics.allRepoDataListing.data?.volume_data
                          .repo_40_factory,
                    }}
                    fromDate={analytics.allRepoDataListing.data?.from_date}
                    toDate={analytics.allRepoDataListing.data?.to_date}
                  />
                </Grid>
              </Grid>
            ) : (
              <Box
                sx={{
                  alignSelf: "center",
                  marginTop: window.innerHeight / 3,
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <CircularProgress color="inherit" />
              </Box>
            )}
          </CardContainer>
        </RenderOnViewportEntry>

        <RenderOnViewportEntry
          threshold={0.25}
          style={{ height: "fit-content", minHeight: "240px" }}
        >
          <CardContainer
            title={"Road / Rail"}
            timeDispatchAction={getRepoClientData}
            process={"lolo"}
            movement={"IN"}
            phase={"Overall"}
            cache={analytics.allRepoDataListing?.cache}
          >
            {analytics.allRepoDataListing ? (
              <Grid container spacing={matches ? 0 : 2}>
                <Grid item size={{ xs: 12, sm: 12, lg: 12 }}>
                  <MovementCard
                    title={""}
                    repo={true}
                    data={{
                      "Size 20":
                        analytics.allRepoDataListing.data?.volume_data
                          .repo_20_by_road_rail,
                      "Size 40":
                        analytics.allRepoDataListing.data?.volume_data
                          .repo_40_by_road_rail,
                    }}
                    fromDate={analytics.allRepoDataListing.data?.from_date}
                    toDate={analytics.allRepoDataListing.data?.to_date}
                  />
                </Grid>
              </Grid>
            ) : (
              <Box
                sx={{
                  alignSelf: "center",
                  marginTop: window.innerHeight / 3,
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <CircularProgress color="inherit" />
              </Box>
            )}
          </CardContainer>
        </RenderOnViewportEntry>

        <RenderOnViewportEntry
          threshold={0.25}
          style={{ height: "fit-content", minHeight: "240px" }}
        >
          <CardContainer
            title={"FS Return "}
            timeDispatchAction={getRepoClientData}
            process={"lolo"}
            movement={"IN"}
            phase={"Overall"}
            cache={analytics.allRepoDataListing?.cache}
          >
            {analytics.allRepoDataListing ? (
              <Grid container spacing={matches ? 0 : 2}>
                <Grid item size={{ xs: 12, sm: 12, lg: 12 }}>
                  <MovementCard
                    title={""}
                    repo={true}
                    data={{
                      "Size 20":
                        analytics.allRepoDataListing.data?.volume_data
                          .repo_20_fs_return,
                      "Size 40":
                        analytics.allRepoDataListing.data?.volume_data
                          .repo_40_fs_return,
                    }}
                    fromDate={analytics.allRepoDataListing.data?.from_date}
                    toDate={analytics.allRepoDataListing.data?.to_date}
                  />
                </Grid>
              </Grid>
            ) : (
              <Box
                sx={{
                  alignSelf: "center",
                  marginTop: window.innerHeight / 3,
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <CircularProgress color="inherit" />
              </Box>
            )}
          </CardContainer>
        </RenderOnViewportEntry>
        <RenderOnViewportEntry
          threshold={0.25}
          style={{ height: "fit-content", minHeight: "240px" }}
        >
          <CardContainer
            title={"CFS ICD "}
            timeDispatchAction={getRepoClientData}
            process={"lolo"}
            movement={"IN"}
            phase={"Overall"}
            cache={analytics.allRepoDataListing?.cache}
          >
            {analytics.allRepoDataListing ? (
              <Grid container spacing={matches ? 0 : 2}>
                <Grid item size={{ xs: 12, sm: 12, lg: 12 }}>
                  <MovementCard
                    title={""}
                    repo={true}
                    data={{
                      "Size 20":
                        analytics.allRepoDataListing.data?.volume_data
                          .repo_20_by_cfs_icd,
                      "Size 40":
                        analytics.allRepoDataListing.data?.volume_data
                          .repo_40_by_cfs_icd,
                    }}
                    fromDate={analytics.allRepoDataListing.data?.from_date}
                    toDate={analytics.allRepoDataListing.data?.to_date}
                  />
                </Grid>
              </Grid>
            ) : (
              <Box
                sx={{
                  alignSelf: "center",
                  marginTop: window.innerHeight / 3,
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <CircularProgress color="inherit" />
              </Box>
            )}
          </CardContainer>
        </RenderOnViewportEntry>
        <RenderOnViewportEntry
          threshold={0.25}
          style={{ height: "fit-content", minHeight: "240px" }}
        >
          <CardContainer
            title={"Port Vessel "}
            timeDispatchAction={getRepoClientData}
            process={"lolo"}
            movement={"IN"}
            phase={"Overall"}
            cache={analytics.allRepoDataListing?.cache}
          >
            {analytics.allRepoDataListing ? (
              <Grid container spacing={matches ? 0 : 2}>
                <Grid item size={{ xs: 12, sm: 12, lg: 12 }}>
                  <MovementCard
                    title={""}
                    repo={true}
                    data={{
                      "Size 20":
                        analytics.allRepoDataListing.data?.volume_data
                          .repo_20_port_vessel,
                      "Size 40":
                        analytics.allRepoDataListing.data?.volume_data
                          .repo_40_port_vessel,
                    }}
                    fromDate={analytics.allRepoDataListing.data?.from_date}
                    toDate={analytics.allRepoDataListing.data?.to_date}
                  />
                </Grid>
              </Grid>
            ) : (
              <Box
                sx={{
                  alignSelf: "center",
                  marginTop: window.innerHeight / 3,
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <CircularProgress color="inherit" />
              </Box>
            )}
          </CardContainer>
        </RenderOnViewportEntry>
      </Box>
    </LayoutContainer>
  );
};

export default RepoData;
