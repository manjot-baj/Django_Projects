import {
  Button,
  FormControl,
  IconButton,
  makeStyles,
  MenuItem,
  Paper,
  Select,
  Tab,
  Tabs,
  Typography,
  useMediaQuery,
} from "@material-ui/core";
import { Stack } from "@mui/material";
import React, { memo } from "react";
import { useSelector } from "react-redux";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import { monthArray } from "../utils/Utils";
import DownloadIcon from "@mui/icons-material/Download";
import RefreshIcon from "@mui/icons-material/Refresh";

const useStyles = makeStyles((theme) => ({
  refershButton: {
    color: "white",
    borderRadius: "4px",
  },
  searchFilter: {
    backgroundColor: "white",
    padding: "2px 4px ",
    borderRadius: "4px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-around",
    width: "100px",

    marginRight: "16px",
  },
  reportDownload: {
    backgroundColor: "#64b865",
    padding: "2px 8px ",
    borderRadius: "4px",
    color: "white ",
    marginRight: "16px",
    fontSize: "12px",
    height: "30px",
    boxShadow: "0px 1px 2px gray",
    "&:hover": {
      backgroundColor: "#64b865",
    },
  },
  menuPaper: {
    maxHeight: "300px",
    marginTop: "100px",
  },

  monthSelect: {
    border: "none",
    outline: "none",
    fontSize: "12px",
    color: "black",
    "&.MuiOutlinedInput-notchedOutline": { border: 0 },
  },
  filterBorder: {
    borderBottom: "2px solid rgb(238,243,244)",
  },
  tabNew: {
    border: "none",
    color: "rgba(23,43,77,0.5)",
    fontWeight: "bold",
    fontSize:"12px",
    marginRight: "20px",
    "&.Mui-selected": {
      borderBottom: "2px solid rgb(23,43,77) ",
      color: "rgb(23,43,77)",
      fontWeight: "bold",
    },
  },
  tabsStyle: {
    
    "& .MuiTabs-indicator": {
      display: "none !important",
    },
  },
}));

const WISTIMAnalysisSearch = ({
  handleMonthChange,
  handleLineChange,
  selectedLine,
  selectedMonth,
  heading,
  handleRefresh,
  handleDownloadReport,
  tabValue,
  handleChange,
  a11yProps,
  reportFileName
}) => {
  const { gateIn } = useSelector((state) => state);
  const classes = useStyles();
    const matchesIphone = useMediaQuery("(max-width:500px)");
  return (
    <Stack
      direction={"row"}
      flexDirection={"row"}
      alignItems={"center"}
      justifyContent={"space-between"}
      flexWrap={ matchesIphone ? "wrap":"nowrap"}
      spacing={4}
      // className={classes.filterBorder}
    >
      <Tabs
        value={tabValue}
        onChange={handleChange}
        aria-label="basic tabs example"
        className={classes.tabsStyle}
      >
        <Tab
          className={classes.tabNew}
          label="Estimate Westim & Repair Destim"
          {...a11yProps(0)}
        />
        <Tab
          className={classes.tabNew}
          label="Westim And Destim hr EDI Report"
          {...a11yProps(1)}
        />
      </Tabs>
      <Stack
        direction={"row"}
        flexDirection={"row"}
        alignItems={"center"}
        flexGrow={matchesIphone ? 1:0}
        justifyContent={"flex-end"}
        flexWrap={matchesIphone ?"wrap":"nowrap"}
        style={{marginTop:matchesIphone? "20px":0}}
      >
        <Typography variant="button" style={{ marginRight: "8px" }}>
          Line
        </Typography>

        <Paper className={classes.searchFilter}>
          <FormControl sx={{ m: 1, minWidth: 120 }}>
            <Select
              disableUnderline={true}
              className={classes.monthSelect}
              variant="standard"
              value={selectedLine}
              onChange={handleLineChange}
              inputProps={{ "aria-label": "Without label" }}
            >
              {gateIn.allDropDown?.edi_shipping_lines?.map((item) => {
                if (item === "All") {
                  return;
                }
                return (
                  <MenuItem value={item} key={item}>
                    {item}
                  </MenuItem>
                );
              })}
            </Select>
          </FormControl>
        </Paper>

        <Paper className={classes.searchFilter}>
          <CalendarTodayIcon style={{ fill: "gray" }} fontSize="small" />
          <FormControl sx={{ m: 1, minWidth: 120 }}>
            <Select
              disableUnderline={true}
              className={classes.monthSelect}
              variant="standard"
              value={selectedMonth}
              onChange={handleMonthChange}
              displayEmpty
              inputProps={{ "aria-label": "Without label" }}
              MenuProps={{ classes: { paper: classes.menuPaper } }}
            >
              {monthArray.map((item) => (
                <MenuItem value={item} key={item}>
                  {item}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Paper>

        <Button
          endIcon={<DownloadIcon style={{ fill: "white" }} />}
          onClick={handleDownloadReport}
          className={classes.reportDownload}
        >
          {reportFileName}
        </Button>

        <IconButton
          variant="contained"
          className={classes.refershButton}
          onClick={handleRefresh}
        >
          <RefreshIcon style={{ fill: "#243545" }} />
        </IconButton>
      </Stack>
    </Stack>
  );
};

export default memo(WISTIMAnalysisSearch);
