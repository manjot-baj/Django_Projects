import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Tooltip,
  Typography,
} from "@mui/material";

import { useDispatch } from "react-redux";
import { cacheCleanService, getDateWeek } from "../../utils/WeekNumbre";
import { Stack } from "@mui/material";
import CleaningServicesIcon from "@mui/icons-material/CleaningServices";
import { useSnackbar } from "notistack";





const RepoCardContainer = (props) => {
    const dispatch = useDispatch();

    const notify=useSnackbar().enqueueSnackbar
    const { title, timeDispatchAction, phase,cache } = props;
    const [anchorEl, setAnchorEl] = React.useState(null);
    const [anchorElWeek, setAnchorElWeek] = React.useState(null);
    const [anchorElProcess, setAnchorElProcess] = React.useState(null);
    const [cacheLoader, setCacheLoader] = useState(false);
    const [timeDropdownSelect, setTimeDropdownSelect] = React.useState(
      phase === "Weekly" ? "This Year" : "This Month"
    );
    const [weekDropdownSelect, setWeekDropdownSelect] = React.useState(
      getDateWeek()
    );
    const [processDropdownSelect, setProcessDropdownSelect] =
      React.useState("IN");
  
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

    const handleCleanCache = () => {
      cacheCleanService(setCacheLoader,notify,dispatch)
    };
  
 
  
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
        {/* <div className={classes.weekSelectButton}>
          <Button
            className={classes.monthSelectButton}
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
                    dispatch(
                      timeDispatchAction(
                        item,
                        weekDropdownSelect,
                        processDropdownSelect
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
                className={classes.monthSelectButton}
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
                        selectWeekMenuItem(item);
                        dispatch(
                          timeDispatchAction(
                            timeDropdownSelect,
                            item,
                            processDropdownSelect
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
          )} */}
          {/* <div>
            <Button
              className={classes.monthSelectButton}
              startIcon={<CalendarTodayIcon fontSize="small" />}
              endIcon={<KeyboardArrowDownIcon fontSize="large" />}
              onClick={handleClickProcess}
            >
              {processDropdownSelect}
            </Button>
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
                      dispatch(
                        timeDispatchAction(
                          timeDropdownSelect,
                          weekDropdownSelect,
                          item
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
          </div> */}
        {/* </div> */}
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
    </Box>
  )
}

export default RepoCardContainer