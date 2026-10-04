import {
  Button,
  FormControl,
  IconButton,
  MenuItem,
  Paper,
  Select,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { Stack } from "@mui/material";
import React from "react";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import FileCopyIcon from "@mui/icons-material/FileCopy";
import RefreshIcon from "@mui/icons-material/Refresh";
import { useSelector } from "react-redux";
import { monthArray } from "../utils/Utils";
import DownloadIcon from "@mui/icons-material/Download";
import FilterListOutlinedIcon from "@mui/icons-material/FilterListOutlined";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import DialogTitle from "@mui/material/DialogTitle";
import Dialog from "@mui/material/Dialog";

const EDIAnalysisSearch = ({
  handleTypeChange,
  handleMonthChange,
  handleLineChange,
  selectedLine,
  selectedMonth,
  selectedEDIType,
  heading,
  handleRefresh,
  moveCode = false,
  selectedProcess,
  handleProcessChange,
  selectedMoveType,
  handleMoveTypeChange,
  edi,
  handleDownloadReport,
}) => {
  const { gateIn } = useSelector((state) => state);
  const matchesIphone = useMediaQuery("(max-width:500px)");

  const [open, setOpen] = React.useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <Stack
      flexDirection={matchesIphone ? "column" : "row"}
      direction={matchesIphone ? "column" : "row"}
      alignItems={matchesIphone ? "flex-start" : "center"}
      justifyContent={"space-between"}
    >
      <Typography variant="subtitle1">{heading}</Typography>
      <Stack
        direction={"row"}
        flexDirection={"row"}
        alignItems={"center"}
        justifyContent={matchesIphone ? "flex-start" : "flex-end"}
        flexWrap={"wrap"}
        spacing={matchesIphone ? 1 : 0}
        mt={matchesIphone ? 4 : 0}
      >
        <>
          {moveCode && !matchesIphone && (
            <Typography variant="button" style={{ marginRight: "8px" }}>
              Type
            </Typography>
          )}
          {moveCode && !matchesIphone && (
            <Paper
              sx={{
                backgroundColor: "white",
                padding: "2px 4px ",
                borderRadius: "4px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-around",
                width: "100px",
                height: "32px",
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
                  value={selectedMoveType}
                  onChange={handleMoveTypeChange}
                  inputProps={{ "aria-label": "Without label" }}
                >
                  {["Arrived", "Departed"].map((item) => (
                    <MenuItem value={item} key={item}>
                      {item}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Paper>
          )}
        </>

        <>
          {moveCode && !matchesIphone && (
            <Typography variant="button" style={{ marginRight: "8px" }}>
              Process
            </Typography>
          )}
          {moveCode && !matchesIphone && (
            <Paper
              sx={{
                backgroundColor: "white",
                padding: "2px 4px ",
                borderRadius: "4px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-around",
                width: "100px",
                height: "32px",
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
                  value={selectedProcess}
                  onChange={handleProcessChange}
                  inputProps={{ "aria-label": "Without label" }}
                >
                  {[
                    "Factory",
                    "Road/Rail",
                    "CFS/ICD",
                    "Port/Vessel",
                    "FS RETURN",
                  ].map((item) => (
                    <MenuItem value={item} key={item}>
                      {item}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Paper>
          )}
        </>

        <>
          {!moveCode && !matchesIphone && (
            <Typography variant="button" style={{ marginRight: "8px" }}>
              Line
            </Typography>
          )}
          {!moveCode && !matchesIphone && (
            <Paper
              sx={{
                backgroundColor: "white",
                padding: "2px 4px ",
                borderRadius: "4px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-around",
                width: "100px",
                height: "32px",
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
          )}
        </>
        <>
          {!matchesIphone && (
            <Typography
              variant="button"
              style={{
                marginRight: "8px",
                marginTop: matchesIphone ? "8px" : "0",
              }}
            >
              EDI Type
            </Typography>
          )}
          {!matchesIphone && (
            <Paper
              sx={{
                backgroundColor: "white",
                padding: "2px 4px ",
                borderRadius: "4px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-around",
                width: "100px",
                height: "32px",
                marginRight: "16px",
              }}
            >
              <FileCopyIcon style={{ fill: "gray" }} fontSize="small" />
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
                  value={selectedEDIType}
                  onChange={handleTypeChange}
                  displayEmpty
                  inputProps={{ "aria-label": "Without label" }}
                >
                  {["text", "excel"].map((item) => (
                    <MenuItem value={item} key={item}>
                      {item}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Paper>
          )}
        </>

        {!matchesIphone && (
          <Paper
            sx={{
              backgroundColor: "white",
              padding: "2px 4px ",
              borderRadius: "4px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-around",
              width: "100px",
              height: "32px",
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
        )}
        {matchesIphone && (
          <IconButton
            style={{
              backgroundColor: "#fe5e37",
              borderRadius: "4px",
              padding: 3,
            }}
            onClick={handleClickOpen}
          >
            <FilterListOutlinedIcon style={{ fill: "#fff" }} />
          </IconButton>
        )}
        {edi && (
          <Button
            endIcon={<DownloadIcon style={{ fill: "white" }} />}
            onClick={handleDownloadReport}
            variant="contained"
            color="success"
            sx={{
            
              padding: "2px 4px ",
              borderRadius: "4px",
              width: "150px",
              color: "white ",
              marginRight: "16px",
              fontSize: "12px",
              height: "30px",
              boxShadow: "0px 1px 2px gray",
          
            }}
          >
            Download Report
          </Button>
        )}

        <IconButton
          variant="contained"
          sx={{
            color: "white",
            borderRadius: "4px",
          }}
          onClick={handleRefresh}
        >
          <RefreshIcon style={{ fill: "#243545" }} />
        </IconButton>
      </Stack>
      <Dialog onClose={handleClose} open={open}>
        <DialogTitle>Set Filter</DialogTitle>
        <List sx={{ pt: 0 }}>
          {moveCode && (
            <ListItem disablePadding>
              <ListItemButton>
                <ListItemAvatar>
                  <Paper
                    sx={(theme) => ({
                      backgroundColor: "white",
                      padding: "2px 4px ",
                      borderRadius: "4px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-around",
                      width: "100px",
                    
                      marginRight: "16px",
                         [theme.breakpoints.down("sm")]: {
                        minWidth:"150px"
                      },
                    
                    })}
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
                        value={selectedMoveType}
                        onChange={handleMoveTypeChange}
                        inputProps={{ "aria-label": "Without label" }}
                      >
                        {["Arrived", "Departed"].map((item) => (
                          <MenuItem value={item} key={item}>
                            {item}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Paper>
                </ListItemAvatar>
                <ListItemText primary="Type" />
              </ListItemButton>
            </ListItem>
          )}

          {moveCode && (
            <ListItem disablePadding>
              <ListItemButton>
                <ListItemAvatar>
                  <Paper
                    sx={(theme)=>({
                      backgroundColor: "white",
                      padding: "2px 4px ",
                      borderRadius: "4px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-around",
                      width: "100px",

                      marginRight: "16px",
                         [theme.breakpoints.down("sm")]: {
                        minWidth:"150px"
                      },
                    })}
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
                        value={selectedProcess}
                        onChange={handleProcessChange}
                        inputProps={{ "aria-label": "Without label" }}
                      >
                        {[
                          "Factory",
                          "Road/Rail",
                          "CFS/ICD",
                          "Port/Vessel",
                          "FS RETURN",
                        ].map((item) => (
                          <MenuItem value={item} key={item}>
                            {item}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Paper>
                </ListItemAvatar>
                <ListItemText primary="Process" />
              </ListItemButton>
            </ListItem>
          )}

          {!moveCode && (
            <ListItem disablePadding>
              <ListItemButton>
                <ListItemAvatar>
                  <Paper
                    sx={(theme)=>({
                      backgroundColor: "white",
                      padding: "2px 4px ",
                      borderRadius: "4px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-around",
                      width: "100px",

                      marginRight: "16px",
                        [theme.breakpoints.down("sm")]: {
                        minWidth:"150px"
                      },
                    })}
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
                </ListItemAvatar>
                <ListItemText primary="Line" />
              </ListItemButton>
            </ListItem>
          )}

          <ListItem disablePadding>
            <ListItemButton>
              <ListItemAvatar>
                <Paper
                  sx={(theme)=>({
                    backgroundColor: "white",
                    padding: "2px 4px ",
                    borderRadius: "4px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-around",
                    width: "100px",

                    marginRight: "16px",
                       [theme.breakpoints.down("sm")]: {
                        minWidth:"150px"
                      },
                  })}
                >
                  <FileCopyIcon style={{ fill: "gray" }} fontSize="small" />
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
                      value={selectedEDIType}
                      onChange={handleTypeChange}
                      displayEmpty
                      inputProps={{ "aria-label": "Without label" }}
                    >
                      {["text", "excel"].map((item) => (
                        <MenuItem value={item} key={item}>
                          {item}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Paper>
              </ListItemAvatar>
              <ListItemText primary="EDI Type" />
            </ListItemButton>
          </ListItem>

          <ListItem disablePadding>
            <ListItemButton>
              <ListItemAvatar>
                <Paper
                  sx={(theme)=>({
                    backgroundColor: "white",
                    padding: "2px 4px ",
                    borderRadius: "4px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-around",
                    width: "100px",

                    marginRight: "16px",
                       [theme.breakpoints.down("sm")]: {
                        minWidth:"150px"
                      },
                  })}
                >
                  <CalendarTodayIcon
                    style={{ fill: "gray" }}
                    fontSize="small"
                  />
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
              </ListItemAvatar>
              <ListItemText />
            </ListItemButton>
          </ListItem>
        </List>
      </Dialog>
    </Stack>
  );
};

export default EDIAnalysisSearch;
