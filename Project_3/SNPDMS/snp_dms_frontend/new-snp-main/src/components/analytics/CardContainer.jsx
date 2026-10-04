import React, { useEffect,useState } from "react";
import {
 
  Typography,
  Button,
  Menu,
  MenuItem,
  IconButton,
Popover,
Box,
Divider,
Select,
Tooltip,

} from "@mui/material";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import { useDispatch, useSelector } from "react-redux";
import { Stack } from "@mui/material";

import SearchIcon from "@mui/icons-material/Search";
import RefreshIcon from "@mui/icons-material/Refresh";
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import { cacheCleanService, getDateWeek } from "../../utils/WeekNumbre";
import CleaningServicesIcon from "@mui/icons-material/CleaningServices";
import { useSnackbar } from "notistack";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers";
import dayjs from "dayjs";
import { theme } from "@/App";



export default function CardContainer(props) {

  const dispatch = useDispatch();
  const notify = useSnackbar().enqueueSnackbar;
  const { title, timeDispatchAction, phase,movement,cache } = props;
  const {gateIn} =useSelector(store=>store)
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [anchorElWeek, setAnchorElWeek] = React.useState(null);
  const [anchorElProcess, setAnchorElProcess] = React.useState(null);
  const [timeDropdownSelect, setTimeDropdownSelect] = React.useState(
    phase === "Weekly" ? "This Year" : "This Month"
  );
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [lineType, setLineType] = useState("");
  const [cacheLoader, setCacheLoader] = useState(false);
  const [weekDropdownSelect, setWeekDropdownSelect] = React.useState(
    getDateWeek()
  );
  const [processDropdownSelect, setProcessDropdownSelect] =
    React.useState("IN");

    const [anchorElSearch, setAnchorElSearch] = React.useState(null);

    const handleClickSearch = (event) => {
      setAnchorElSearch(event.currentTarget);
    };
  
    const handleCloseSearch = () => {
      setAnchorElSearch(null);
    };

    const handleCleanCache = () => {
      cacheCleanService(setCacheLoader,notify,dispatch)
    };
  
    const openSearch = Boolean(anchorElSearch);
    const idSearch = openSearch ? "simple-popover-search" : undefined;
  

  const array =
    phase === "Weekly"
      ? ["This Year", "Previous Year"]
      : [
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

  let WeekArray = [
    "1",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "10",
    "11",
    "12",
    "13",
    "14",
    "15",
    "16",
    "17",
    "18",
    "19",
    "20",
    "21",
    "22",
    "23",
    "24",
    "25",
    "26",
    "27",
    "28",
    "29",
    "30",
    "31",
    "32",
    "33",
    "34",
    "35",
    "36",
    "37",
    "38",
    "39",
    "40",
    "41",
    "42",
    "43",
    "44",
    "45",
    "46",
    "47",
    "48",
    "49",
    "50",
    "51",
    "52",
  ];

  let processArray = ["IN", "OUT"];

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

  const handleClickWeek = (event) => {
    setAnchorElWeek(event.currentTarget);
  };

  const handleCloseWeek = () => {
    setAnchorElWeek(null);
  };

  const handleClickProcess = (event) => {
    setAnchorElProcess(event.currentTarget);
  };

  const handleCloseProcess = () => {
    setAnchorElProcess(null);
  };

  const selectWeekMenuItem = (item) => {
    setWeekDropdownSelect(item);
    setAnchorElWeek(null);
  };

  const selectProcessMenuItem = (item) => {
    setProcessDropdownSelect(item);
    setAnchorElProcess(null);
  };

  const handleDateChange = (date, setValue) => {
    var selectedDate = new Date(date);
    var dd = String(selectedDate.getDate()).padStart(2, "0");
    var mm = String(selectedDate.getMonth() + 1).padStart(2, "0"); //
    var yyyy = selectedDate.getFullYear();
    var selectedDateFormat = yyyy + "-" + mm + "-" + dd;
    setValue(selectedDateFormat);
  };

  useEffect(() => {
    if (props.handling) {
      setProcessDropdownSelect(props.movement);
    }

    !phase === "Weekly"
      ? dispatch(
          timeDispatchAction(
            phase === "Weekly" ? "This Year" : "This Month",
            weekDropdownSelect,
            props.handling ? props.movement : processDropdownSelect,
            fromDate,
            toDate,
            lineType
          )
        )
      : dispatch(
          timeDispatchAction(
            timeDropdownSelect,
            weekDropdownSelect,
            props.handling ? props.movement : processDropdownSelect,
            fromDate,
            toDate,
            lineType
          )
        );

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Box sx={(theme)=>({
      borderRadius: 4,
      backgroundColor: "#DAE2E8",
      padding: theme.spacing(2),
      width: "100%",
      marginTop: 8,
      [theme.breakpoints.down("xs")]: {
        backgroundColor: "unset",
        padding: 0,
      },
    })}>
      <Box sx={{
           display: "flex",
           justifyContent: "space-between",
           alignItems: "center",
      }}>
        <Typography variant="subtitle2" sx={{
            color: "#9199A1",
            fontWeight: 600,
        }}>
          {title}
        </Typography>
        <Box sx={{
          display: "flex",
          alignItems: "center",
        }}>
       
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
            {array?.map((item, index) => {
              return (
                <MenuItem
                  onClick={() => {
                    setFromDate("")
                    setToDate("")
                    selectMenuItem(item);
                    dispatch(
                      timeDispatchAction(
                        item,
                        weekDropdownSelect,
                        processDropdownSelect,
                        "",
                        "",
                        lineType
                      )
                    );
                  }}
                  index={`${index}-${title}-time-dpdwn`}
                >
                  {item}
                </MenuItem>
              );
            })}
          </Menu>
          {phase === "Weekly" && (
            <div>
              <Button
              sx={{
                backgroundColor: "transparent",
               
                fontWeight: 600,
              }}
                startIcon={<CalendarTodayIcon fontSize="small" />}
                endIcon={<KeyboardArrowDownIcon fontSize="large" />}
                onClick={handleClickWeek}
              >
                {weekDropdownSelect}
              </Button>
              <Menu
                id="month-menu"
                anchorEl={anchorElWeek}
                keepMounted
                open={Boolean(anchorElWeek)}
                onClose={handleCloseWeek}
              >
                {WeekArray.map((item, index) => {
                  return (
                    <MenuItem
                      onClick={() => {
                        setFromDate("")
                        setToDate("")
                        selectWeekMenuItem(item);
                        dispatch(
                          timeDispatchAction(
                            timeDropdownSelect,
                            item,
                            processDropdownSelect,
                            "",
                            "",
                            lineType
                          )
                        );
                      }}
                      index={`${index}-${title}-time-dpdwn`}
                    >
                      {item}
                    </MenuItem>
                  );
                })}
              </Menu>
            </div>
          )}
          <div>
            {props.handling  ? (
              <span
              style={{
                display: props.handling || props.movement ? "inline-block" : "none",
                color: "white",
                fontWeight: "bold",
                marginRight: "20px",
                backgroundColor: props.movement? theme.palette.primary.main:"transparent",
                padding: "3px 20px",
                borderRadius: "5px",
              }}
            >
              {processDropdownSelect}
            </span>
            ) : (
              <Button
                
                startIcon={<CalendarTodayIcon fontSize="small" />}
                endIcon={<KeyboardArrowDownIcon fontSize="large" />}
                onClick={handleClickProcess}
              >
                {processDropdownSelect}
              </Button>
            )}
            <Menu
              id="month-menu"
              anchorEl={anchorElProcess}
              keepMounted
              open={Boolean(anchorElProcess)}
              onClose={handleCloseProcess}
            >
              {processArray.map((item, index) => {
                return (
                  <MenuItem
                    onClick={() => {
                      selectProcessMenuItem(item);
                      setFromDate("")
                      setToDate("")
                      dispatch(
                        timeDispatchAction(
                          timeDropdownSelect,
                          weekDropdownSelect,
                          item,
                          "",
                          "",
                          lineType
                        )
                      );
                    }}
                    index={`${index}-${title}-process-dpdwn`}
                  >
                    {item}
                  </MenuItem>
                );
              })}
            </Menu>
          </div>
          <IconButton
            sx={(theme)=>({
              backgroundColor: theme.palette.primary.main,
              borderRadius: "5px",
              height: "30px",
              width: "50px", 
            })}
            onClick={handleClickSearch}
          >
            <FilterAltIcon style={{ fill: "white" }} fontSize="small"/>
          </IconButton>
        </Box>
       
      </Box>
      <div>{props.children}</div>
      {cache && <Stack direction={"row"} justifyContent={"flex-end"} marginTop={1} >
        <Tooltip
          title={cache ? "Clean Analytics  Data " : "Cleaned Analytics Data"}
          placement="bottom"
        >
          <Button
            disabled={true}
            onClick={handleCleanCache}
          
          >
            <CleaningServicesIcon
              style={{ fill: "#a4a2a7" }}
              fontSize="small"
            />
            <Typography
              variant="subtitle2"
              style={{
                color: "#a4a2a7",
                fontWeight: "bold",
                marginRight: "8px",
              }}
            >
              {cache ? "Cache Data" : "Cleaned"}{" "}
            </Typography>
          </Button>
        </Tooltip>
      </Stack>}
      <Popover
        id={idSearch}
        open={openSearch}
        anchorEl={anchorElSearch}
        onClose={handleCloseSearch}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
        style={{marginTop:"-30px",marginLeft:"-60px",borderRadius:"20px"}}
      >
        <Box sx={{
           padding: "10px 10px 20px",
        }}>
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
              <IconButton onClick={()=>{
                
                  dispatch(
                    timeDispatchAction(
                      timeDropdownSelect,
                      weekDropdownSelect,
                      props.in_out?processDropdownSelect: movement,
                      fromDate,
                      toDate,
                      lineType
                    )
                  );
                  handleCloseSearch()
              }}>
                {" "}
                <SearchIcon style={{ fill: "black" }} />
              </IconButton>
              <IconButton onClick={()=>{
                setLineType("")
                setFromDate("")
                setToDate("")
                dispatch(
                  timeDispatchAction(
                    timeDropdownSelect,
                    weekDropdownSelect,
                    props.in_out?processDropdownSelect: movement,
                    "",
                    "",
                    ""
                  )
                );
                handleCloseSearch()
              }}>
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
          {props.phase !== "Weekly" && (
              <Typography variant="caption">From date</Typography>
            )}
            {props.phase !== "Weekly" && (
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                slotProps={{ textField: { size: 'small' } }}
                  format="YYYY/MM/DD"
                  id={`-date-picker-inline`}
                  value={fromDate ? dayjs(fromDate) : null}
                  name="from_date"
                  onChange={(date) => {
                    handleDateChange(date, setFromDate);
                  }}
                  
                />
              </LocalizationProvider>
            )}

            {props.phase !== "Weekly" && (
              <Typography variant="caption">To date</Typography>
            )}
            {props.phase !== "Weekly" && (
              <LocalizationProvider dateAdapter={AdapterDayjs} >
                <DatePicker
                     slotProps={{ textField: { size: 'small' } }}
                  format="YYYY/MM/DD"
                  id={`-date-picker-inline`}
                  value={toDate ?dayjs(toDate):null}
                  name="from_date"
                  onChange={(date) => {
                    handleDateChange(date, setToDate);
                  }}
                />
              </LocalizationProvider>
            )}
            <Typography variant="caption">
              Line
            </Typography>

            <Select
              id="Line Name"
              value={lineType}
              name="size"
              variant="outlined"
              fullWidth
              sx={(theme)=>({ marginLeft: theme.spacing(1),
                flex: 1,
                maxHeight: "32px",
                borderRadius: "5px",
                fontSize: "12px",
                [theme.breakpoints.down("xs")]: {
                  padding: 1,
                  fontSize: "0.8rem",
                },})}
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
    </Box>
  );
}
