import { ClickAwayListener, IconButton, InputBase, Paper, Select, useMediaQuery } from "@mui/material";
import { useState } from "react";
import SearchIcon from "@mui/icons-material/Search";
import InfoIcon from "@mui/icons-material/Info";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
const  HandlingTableCustomSearchBar = ({
  selectName,
  updateSelectname,
  searchText,
  setSearchText,
  searchClick,
  closeClick,
  noSelect,
  infoIcon,
  ...props
}) => {
  const matchesIphone = useMediaQuery((theme) => theme.breakpoints.down("sm"));
  const [searchOpen, setSearchOpen] = useState(false);
  const [selectOpen, setSelectOpen] = useState(false);
  return (
    <ClickAwayListener
      onClickAway={(e) => {
        if ((searchText === "" || searchText === null) && !selectOpen) {
          setSearchOpen(false);
        }
      }}
    >
      {searchOpen ? (
        <Paper
          component="form"
          sx={(theme) => ({
            backgroundColor: "#fff",
            padding: "0px 12px",
            position: "relative",
            display: "flex",
            alignItems: "center",
            borderRadius: 2,

            width: "10%",
            "@keyframes slideInFromRight": {
              "0%": {
                opacity: 0,
                transform: "translateX(10px)",
                width: "30%",
                bgcolor: `${theme.palette.primary.light}`,
              },
              "50%": {
                opacity: 0.5,
                transform: "translateX(50px)",
                width: "50%",
              },
              "100%": {
                opacity: 1,
                width: props.maxWidthSearch ? props.maxWidthSearch : "100%",
                transform: "translateX(0)",
                bgcolor: `#fff`,
              },
            },
            animation: "slideInFromRight 0.5s ease-out forwards",
            "& .MuiPaper-root.MuiMenu-paper.MuiPopover-paper.MuiPaper-elevation8.MuiPaper-rounded":
              {
                marginTop: "123px !important",
              },
            [theme.breakpoints.down("xs")]: {
              height: 35,
            },
          })}
          elevation={0}
        >
          {!noSelect && (
            <Select
              id="selectInputId"
              value={selectName}
              onOpen={() => setSelectOpen(true)}
              MenuProps={{
                TransitionProps: {
                  onExited: () => setSelectOpen(false),
                },
              }}
              fullWidth
              variant="standard"
              className="selectClassses"
              sx={(theme) => ({
                width: "20px",
                marginRight: "20px",
                marginLeft: "20px",
                border: "none",
                paddingRight: "12px",

                "& .MuiPaper-root.MuiMenu-paper.MuiPopover-paper.MuiPaper-elevation8.MuiPaper-rounded":
                  {
                    marginTop: "123px !important",
                  },
                "&:before": {
                  borderBottom: "none",
                },
                "&:focus": {
                  borderBottom: "none",
                },
                "&:hover": {
                  borderBottom: "none",
                },
                "&:.MuiSelect-selectMenu": {
                  textOverflow: "0px !important",
                },
                [theme.breakpoints.down("sm")]: {
                  marginLeft: 0,
                  marginRight: 0,
                },
              })}
              onChange={updateSelectname}
              color="primary"
            >
              {props.children}
            </Select>
          )}
          <InputBase
            sx={(theme) => ({
              padding: 0.5,
              borderColor: "black",
              "& .MuiInputBase-input": {
                width: "400px",
              },
              [theme.breakpoints.down("sm")]: {
                "& .MuiInputBase-input": {
                  width: "200px",
                  fontSize: 10,
                  padding: 1,
                },
              },
            })}
            placeholder={`Search ${selectName}`}
            inputProps={{ "aria-label": "search" }}
            value={searchText}
            onChange={setSearchText}
            autoComplete="off"
          />
          <IconButton
            sx={{
              position: "absolute",
              right: matchesIphone ? 28 : 48,
              top: 0,
              bottom: 0,
            }}
            type="button"
            color="secondary"
            aria-label="search"
            onClick={(e) => {
              setSearchOpen(true);
              searchClick(e);
            }}
          >
            <SearchIcon
              sx={(theme) => ({
                fill: theme.palette.secondary.main,
                "&:hover": {
                  fill: theme.palette.secondary.dark,
                },
              })}
              fontSize="small"
            />
          </IconButton>
          {infoIcon && (
            <InfoIcon
              color="primary"
              sx={{
                position: "absolute",
                right: 88,
                top: 6,
                bottom: 0,
              }}
              onClick={props?.handleOpenInfo}
            />
          )}
          <IconButton
            sx={{
              position: "absolute",
              right: 4,
              top: 0,
              bottom: 0,
            }}
            color="secondary"
            type="button"
            aria-label="search"
            onClick={() => {
              closeClick();
              setSearchOpen(false);
            }}
          >
            <CloseOutlinedIcon
              sx={(theme) => ({
                fill: theme.palette.secondary.main,
                "&:hover": {
                  fill: theme.palette.secondary.dark,
                },
              })}
              fontSize="small"
            />
          </IconButton>
        </Paper>
      ) : (
        <IconButton
          color="secondary"
          aria-label="search"
          onClick={(e) => {
            setSearchOpen(true);
          }}
        >
          <SearchIcon fontSize="small" />
        </IconButton>
      )}
    </ClickAwayListener>
  );
};


export default HandlingTableCustomSearchBar;