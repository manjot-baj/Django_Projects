import React, { memo } from "react";
import {
  CircularProgress,
  ClickAwayListener,
  FormControl,
  IconButton,
  InputBase,
  InputLabel,
  MenuItem,
  Paper,
  Select,
} from "@mui/material";
import { Stack } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import SearchIcon from "@mui/icons-material/Search";
import { useSelector } from "react-redux";



const AutomationSearch = ({
  process,
  handleSetProcess,
  searchText,
  handleSearchChange,
  loading,
  setLoading,
  handleSearchButton,
  handleCloseClick,
  procurement,
  procurementDropDown,
  showDropDown,
  handleClickAway,
  children,
  fullWidth
}) => {
 
  const {user} = useSelector(state=>state)

  return (
    <ClickAwayListener onClickAway={handleClickAway}>
      <Paper
        component="form"
        
        sx={(theme)=>({
          borderRadius: 4,
          backgroundColor: "transparent",
          color: theme.palette.text.primary,
          position: "relative",
          width:(procurement || fullWidth)?"100%": "calc(100% - 50%)",
          margin: "auto",
          marginLeft: "0px",
        })}
        elevation={0}
      >
         <Stack
          direction={"row"}
          alignItems={"center"}
          justifyContent={"center"}
          style={{
            backgroundColor: "white",
            padding: 1,
            borderRadius: "24px",
          }}
        >
        {children && children}
       { !children && <FormControl
          variant="standard"
          style={{ marginTop: "-15px", marginLeft: "10px" }}
        >
        
            <InputLabel
              id="container_list_select_label"
              style={{
                color: "grey",
                zIndex: 10,
                fontSize: "15px",
                textAlign: "center",
                padding: "0 10px",
                marginTop: "-10px",
                display: "none",
              }}
            >
              Process
            </InputLabel>
            <Select
              id="=container_list_select"
              value={procurement ? "" : process}
              labelId="container_list_select_label"
              name="client"
              defaultValue={procurement ? "" : process}
              label="Process"
              variant="standard"
              onChange={handleSetProcess}
              sx={(theme)=>({
                marginLeft: theme.spacing(1),
                flex: 1,
                "&.MuiInput-underline:before": {
                  borderBottom: "none",
                },
                "&.MuiInput-underline:after": {
                  borderBottom: "none",
                },
                padding: "0 10px",
                [theme.breakpoints.down("xs")]: {
                  padding: 1,
                  fontSize: "0.8rem",
                },
              })}
              inputProps={{
                style: {
                  padding: "0px 10px",
                  marginTop: "-10px",
                  outline: "none",
                },
              }}
              style={{
                width: procurement ? "10px" : "100px",
                backgroundColor: "transparent",
                border: procurement ? "none" : "0.5px solid rgba(0,0,0,0.2)",

                borderRadius: "32px",
                outline: "none",
              }}
            >
              {procurement ? (
                <MenuItem key={"Item"} value="Item">
                  Item
                </MenuItem>
              ) : (
                <MenuItem key={"IN"} value="IN">
                  IN
                </MenuItem>
              )}
              {procurement ? (
                <MenuItem key={"Category"} value="Category">
                  Category
                </MenuItem>
              ) : (
                <MenuItem key={"OUT"} value="OUT">
                  OUT
                </MenuItem>
              )}
              {procurement  && (user.procurement_admin === true || user.procurement_admin === "True") &&(
                <MenuItem key={"SKU code"} value="SKU code">
                  SKU code
                </MenuItem>
              )}
            </Select>
          </FormControl>}

          <InputBase
            id="container-search"
            name="searchText"
            sx={(theme)=>({
              marginLeft: theme.spacing(1),
              flex: 1,
              padding: 1,
              [theme.breakpoints.down("xs")]: {
                padding: 1,
                fontSize: "0.8rem",
              },
            })}
          
            placeholder={(procurement || children)?`Search by ${process ==="name"?"Item":process}`:"Search for a Container"}
            inputProps={{ "aria-label": "search" }}
            value={searchText}
            onChange={handleSearchChange}
            autoComplete="off"
          />
          {loading ? (
            <CircularProgress
              size={30}
              style={{ marginRight: "10px" }}
            ></CircularProgress>
          ) : (
            <IconButton onClick={handleCloseClick}>
              <CloseIcon />
            </IconButton>
          )}

          <IconButton onClick={handleSearchButton}>
            <SearchIcon />
          </IconButton>
     
        {procurement && showDropDown && procurementDropDown}
        </Stack>
      </Paper>
    </ClickAwayListener>
  );
};

export default memo(AutomationSearch);
