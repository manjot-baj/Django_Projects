import {
  Button,
  FormControl,
  IconButton,
  MenuItem,
  Paper,
  Select,
  Tab,
  Tabs,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { Stack } from "@mui/material";
import React, { memo } from "react";
import { useSelector } from "react-redux";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import { monthArray } from "../utils/Utils";
import DownloadIcon from "@mui/icons-material/Download";
import RefreshIcon from "@mui/icons-material/Refresh";



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
  reportFileName,
}) => {
  const { gateIn } = useSelector((state) => state);
  const matchesIphone = useMediaQuery("(max-width:500px)");
  return (
    <Stack
      direction={"row"}
      flexDirection={"row"}
      alignItems={"center"}
      justifyContent={"space-between"}
      flexWrap={matchesIphone ? "wrap" : "nowrap"}
      spacing={2}
      // className={classes.filterBorder}
    >
      <Tabs
        value={tabValue}
        onChange={handleChange}
        aria-label="basic tabs example"
       sx={{
        "& .MuiTabs-indicator": {
          display: "none !important",
        },
       }}
      >
        <Tab
          sx={(theme) => ({
            border: "none",
            color: "rgba(23,43,77,0.5)",
            fontWeight: "bold",
            fontSize: "12px",
            marginRight: "20px",
            "&.Mui-selected": {
              borderBottom: "2px solid rgb(23,43,77) ",
              color: "rgb(23,43,77)",
              fontWeight: "bold",
            },
          })}
          label="Estimate Westim & Repair Destim"
          {...a11yProps(0)}
        />
        <Tab
          sx={(theme) => ({
            border: "none",
            color: "rgba(23,43,77,0.5)",
            fontWeight: "bold",
            fontSize: "12px",
            marginRight: "20px",
            "&.Mui-selected": {
              borderBottom: "2px solid rgb(23,43,77) ",
              color: "rgb(23,43,77)",
              fontWeight: "bold",
            },
          })}
          label="Westim And Destim hr EDI Report"
          {...a11yProps(1)}
        />
      </Tabs>
      <Stack
        direction={"row"}
        flexDirection={"row"}
        alignItems={"center"}
        flexGrow={matchesIphone ? 1 : 0}
        justifyContent={"flex-end"}
        flexWrap={matchesIphone ? "wrap" : "nowrap"}
        style={{ marginTop: matchesIphone ? "20px" : 0 }}
      >
        <Typography variant="button" style={{ marginRight: "8px" }}>
          Line
        </Typography>

        <Paper
          sx={{
            backgroundColor: "white",
            padding: "2px 0px ",
            borderRadius: "4px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-around",
          
            height:"32px",
            marginRight: "16px",
          }}
        >
          <FormControl sx={{ m: 1, minWidth: 120 }}>
            <Select
              disableUnderline={true}
              sx={{
                border: "none",
                outline: "none",
                fontSize: "12px",
                color: "black",
                "&.MuiOutlinedInput-notchedOutline": { border: 0 },
              }}
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

        <Paper
          sx={{
            backgroundColor: "white",
            padding: "2px 4px ",
            borderRadius: "4px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-around",
            width: "100px",
            height:"32px",
            marginRight: "16px",
          }}
        >
          <CalendarTodayIcon style={{ fill: "gray" }} fontSize="small" />
          <FormControl sx={{ m: 1, minWidth: 120 }}>
            <Select
              disableUnderline={true}
              sx={{
                border: "none",
                outline: "none",
                fontSize: "12px",
                color: "black",
                "&.MuiOutlinedInput-notchedOutline": { border: 0 },
              }}
              variant="standard"
              value={selectedMonth}
              onChange={handleMonthChange}
              displayEmpty
              inputProps={{ "aria-label": "Without label" }}
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
          variant="contained"
          color="success"
          sx={{
         
       
            borderRadius: "4px",
            color: "white ",
            marginRight: "16px",
            fontSize: "10px",
            height: "30px",
        
          }}
        >
          {reportFileName}
        </Button>

        <IconButton
          variant="contained"
          sx={{
            color: "white",
            borderRadius: "4px",
          }}
          onClick={handleRefresh}
        >
          <RefreshIcon sx={(theme)=>({ fill: theme.palette.secondary.main })} />
        </IconButton>
      </Stack>
    </Stack>
  );
};

export default memo(WISTIMAnalysisSearch);
