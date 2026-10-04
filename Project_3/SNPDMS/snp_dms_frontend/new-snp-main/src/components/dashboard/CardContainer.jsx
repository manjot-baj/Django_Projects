import React from "react";
import {
  Typography,
  Button,
  Menu,
  MenuItem,
  Switch,
  Box,
} from "@mui/material";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import { useDispatch } from "react-redux";
import { useSnackbar } from "notistack";
import { customMonthSelectButton, titleTypography } from "../../utils/CustomClasses";


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

export default function CardContainer(props) {
  
  const { title, timeDispatchAction } = props;
  const dispatch = useDispatch();
  const notify = useSnackbar().enqueueSnackbar;
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [anchorElWeek, setAnchorElWeek] = React.useState(null);
  const [anchorElProcess, setAnchorElProcess] = React.useState(null);
  const [editrack, setEditrack] = React.useState(false);
  const [timeDropdownSelect, setTimeDropdownSelect] = React.useState(
    props.title === "Volume & Revenue" ? "This Year" : "Today"
  );
  const [weekDropdownSelect, setWeekDropdownSelect] = React.useState("1");
  const [processDropdownSelect, setProcessDropdownSelect] =
    React.useState("IN");

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

  const array =
    props.title === "Volume & Revenue"
      ? ["This Year", "Previous Year"]
      : [
          "Today",
          "Yesterday",
          "This Week",
          "Previous Week",
          "This Month",
          "Previous Month",
          "This Year",
          "Previous Year",
        ];
  return (
    <Box
      sx={(theme) => ({
        borderRadius: 4,
        backgroundColor: "#DAE2E8",
        padding: theme.spacing(2),
        width: "100%",
        marginTop: 4,
        [theme.breakpoints.down("xs")]: {
          backgroundColor: "unset",
          padding: 0,
        },
      })}
    >
      <Box sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
      }}>
        <Typography variant="subtitle2" sx={titleTypography}>
          {title}
        </Typography>
        {props.title === "Movement Summary" && (
          <div>
            <span>Track EDI</span>
            <Switch
              checked={editrack}
              onChange={(e) => {
                setEditrack(e.target.checked);
                dispatch(
                  timeDispatchAction(
                    timeDropdownSelect,
                    e.target.checked,
                    weekDropdownSelect,
                    processDropdownSelect
                  )
                );
              }}
              inputProps={{ "aria-label": "controlled" }}
            />
          </div>
        )}
        <Box
          sx={{
            display: "flex",
            alignItems: "flex-end",
          }}
        >
          <Button
            sx={customMonthSelectButton}
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
                        editrack,
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
          {props.title === "Volume & Revenue" && (
            <>
              <div>
                <Typography>Week No.</Typography>
                <Button
                  sx={customMonthSelectButton}
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
                              editrack,
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

              <div>
                <Typography>Process.</Typography>
                <Button
                  sx={customMonthSelectButton}
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
                              item,
                              editrack
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
            </>
          )}
        </Box>
      </Box>
      <div>{props.children}</div>
    </Box>
  );
}
