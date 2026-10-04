import React, { useEffect, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { faSort } from "@fortawesome/free-solid-svg-icons";
import FilterAltOutlinedIcon from "@mui/icons-material/FilterAltOutlined";
import {
  alpha,
  Box,
  Button,
  ClickAwayListener,
  Grid,
  IconButton,
  InputBase,
  MenuItem,
  Modal,
  Pagination,
  Paper,
  Popover,
  Select,
  Step,
  styled,
  Tab,
  TextField,
  Typography,
  useMediaQuery,
} from "@mui/material";
import InfoIcon from "@mui/icons-material/Info";

import RefreshIcon from "@mui/icons-material/Refresh";
import ReactTable from "react-table-v6";
import "react-table-v6/react-table.css";

import SearchIcon from "@mui/icons-material/Search";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import TuneIcon from "@mui/icons-material/Tune";
import { Stack } from "@mui/material";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import CustomBackButton from "../reusablecomponents/CustomBackButton";
import ArrowLeftOutlinedIcon from "@mui/icons-material/ArrowLeftOutlined";
import ArrowRightOutlinedIcon from "@mui/icons-material/ArrowRightOutlined";

const StyledReactTable = styled(ReactTable)(({ theme }) => ({
  border: "none",
  "& ::-webkit-scrollbar": {
    height: "6px",
  },
  "& ::-webkit-scrollbar-thumb": {
    background: alpha(theme.palette.primary.dark, 1),
  },
  "&.ReactTable .rt-thead.-header": {
    boxShadow: "none !important",
    backgroundColor: alpha(theme.palette.secondary.dark, 1),

    // borderBottom: `1px solid rgba(0,0,0,0.1)`,
  },
  "&.ReactTable .rt-thead .rt-th": {
    borderRight: "1px solid rgba(255,255,255,0.2)",
  },
  "&.ReactTable .rt-th, &.ReactTable .rt-td": {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  "&.ReactTable .rt-tbody .rt-tr-group": {
    // borderBottom: `1px solid rgba(0,0,0,0.1)`,
    padding: "6px 0",
    transitionProperty: "background",
    transitionDelay: "0.1s",
    backgroundColor: "#fff",
    marginTop: 4,
    marginBottom: 4,
    borderRadius: 2,
    "&:hover": {
      // backgroundColor:alpha(theme.palette.primary.main,0.01),
      boxShadow: `0px 0px 20px -15px ${theme.palette.secondary.main}`,
    },
  },
}));

export const TableFooterSection = (props) => {
  const { drawerOpen } = useSelector((state) => state.ui);
  return (
    <Paper {...props} elevation={0}>
      {props.children}
    </Paper>
  );
};

export const TablePageBreadCrumbs = (props) => {
  const location = useLocation();

  return (
    <Box
      display={"flex"}
      alignItems={"center"}
      justifyContent={"flex-start"}
      gridGap={4}
    >
      <Typography
        variant="body2"
        color="inherit"
        noWrap
        sx={{
          textTransform: "capitalize",
        }}
      >
        {` ${location?.pathname?.split("/")[1]} ${
          location?.pathname?.split("/")[2] ? ">" : ""
        } `}
      </Typography>
      <Typography
        variant="body2"
        color="inherit"
        noWrap
        sx={{
          textTransform: "capitalize",
        }}
      >
        {`${location?.pathname?.split("/")[2]?.split("-")?.join(" ")}`}
      </Typography>
    </Box>
  );
};

export const TableFilterComponent = ({ title, ...props }) => {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const handleOpen = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);
  const open = Boolean(anchorEl);
  const id = open ? "simple-popover" : undefined;
  const matchesIphone = useMediaQuery((theme) => theme.breakpoints.down("sm"));

  return (
    <>
      {matchesIphone ? (
        <IconButton aria-describedby={id} onClick={handleOpen}>
          <TuneIcon
            fontSize="small"
            sx={(theme) => ({
              fill: props.activeFilter ? theme.palette.primary.main : "#8e9298",
            })}
          />
        </IconButton>
      ) : (
        <Button
          variant="text"
          color={props.activeFilter ? "primary" : "secondary"}
          size="medium"
          fullWidth
          aria-describedby={id}
          onClick={handleOpen}
          {...props}
          sx={(theme) => ({
            fontWeight: 400,
            "&:hover": {
              backgroundColor: `${
                props.activeFilter
                  ? alpha(theme.palette.primary.light, 0.1)
                  : "#dedede"
              }`,
            },
          })}
          startIcon={
            <TuneIcon
              fontSize="small"
              sx={(theme) => ({
                fill: props.activeFilter
                  ? theme.palette.primary.light
                  : theme.palette.secondary.main,
              })}
            />
          }
        >
          {matchesIphone ? "" : title}
        </Button>
      )}

      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        elevation={1}
        style={{
          marginTop: 4,
          overflow: "hidden",
          borderRadius: 12,
          marginLeft: 120,
        }}
        sx={{
          "& .MuiPopover-paper": {
            overflowY: "hidden",
          },
        }}
      >
        <Box
          style={{ overflow: "hidden", maxWidth: 450 }}
          padding={2}
          component={Grid}
          container
          spacing={2}
        >
          {props.children}
        </Box>
      </Popover>
    </>
  );
};

export const TableFilterGridSection = (props) => {
  return (
    <Grid
      container
      {...props}
      spacing={2}
      sx={{
        padding: "24px 20px",
      }}
    >
      {props.children}
    </Grid>
  );
};

export const TableBackButton = ({ ...props }) => {
  return <CustomBackButton {...props} />;
};

export const TableHeading = (props) => {
  return (
    <b
      style={{
        color: "#fff",
        fontSize: 12,
        lineHeight: 1.75,
        fontWeight: 600,
      }}
      {...props}
    >
      {props.children}
      {props?.filter && (
        <FontAwesomeIcon
          icon={faSort}
          style={{
            fill: "#b7bbc0",
            color: "#b7bbc0",
            marginLeft: 4,
            opacity: 0.5,
          }}
        />
      )}
    </b>
  );
};

export const TableCellText = (props) => {
  return (
    <Typography
      sx={{
        fontSize: 13,
        fontWeight: 500,
        letterSpacing: 0.3,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 2,
      }}
      {...props}
    >
      {props.children}
    </Typography>
  );
};

export const TablePageTitle = (props) => {
  return (
    <Typography
      variant={"h6"}
      component={"h6"}
      {...props}
      sx={(theme) => ({
        ...props.default,
        letterSpacing: 1,
        lineHeight: 1,
        fontFamily: `"Raleway", sans-serif`,
        color: theme.palette.text.primary,
      })}
    >
      {props.children}
    </Typography>
  );
};

export const TableAdvanceSearch = (props) => {
  return (
    <Button
      variant="text"
      color={props.activeFilter ? "primary" : "secondary"}
      size="small"
      fullWidth
      {...props}
      startIcon={<TuneIcon fontSize="small" />}
      sx={{ fontWeight: 400 }}
    >
      Advance Search
    </Button>
  );
};

export const TableAdvanceSearchWithModal = ({
  open,
  handleClose,
  handleOpen,
  ...props
}) => {
  const matchesIphone = useMediaQuery((theme) => theme.breakpoints.down("sm"));

  return (
    <>
      <Modal open={open} onClose={handleClose}>
        <Box
          sx={(theme) => ({
            top: props.moveToTop ? "6%" : "10%",
            position: "absolute",
            background: "#FFF",
            width: "85%",
            height: "fit-content",
            margin: "auto",
            left: "10%",
            padding: "25px 25px",
            pointerEvents: "painted",
            borderRadius: "12px",
            [theme.breakpoints.down("sm")]: {
              top: "10%",
              overflowY: "scroll",
              height: "calc(100vh - 150px)",
            },
          })}
        >
          {props.children}
        </Box>
      </Modal>
      {matchesIphone || props?.onlyIcon ? (
        <IconButton onClick={handleOpen}>
          {" "}
          <FilterAltOutlinedIcon
            fontSize="small"
            sx={(theme) => ({
              fill: props.activeFilter
                ? theme.palette.primary.main
                : theme.palette.secondary.main,
            })}
          />
        </IconButton>
      ) : (
        <Button
          {...props}
          variant="text"
          color={props.activeFilter ? "primary" : "secondary"}
          size="medium"
          fullWidth
          sx={(theme) => ({
            fontWeight: 400,
            "&:hover": {
              backgroundColor: `${
                props.activeFilter
                  ? alpha(theme.palette.primary.light, 0.1)
                  : "#dedede"
              }`,
            },
          })}
          startIcon={
            <FilterAltOutlinedIcon
              fontSize="small"
              sx={(theme) => ({
                fill: props.activeFilter
                  ? theme.palette.primary.light
                  : theme.palette.secondary.main,
              })}
            />
          }
          onClick={handleOpen}
        >
          Advance Filter
        </Button>
      )}
    </>
  );
};

export const TableRefreshIcon = (props) => {
  return (
    <IconButton color="secondary" {...props}>
      <RefreshIcon fontSize="small" />
    </IconButton>
  );
};

export const TableCustomAdvanceReactTable = (props) => {
  return (
    <StyledReactTable
      {...props}
      collapseOnDataChange={false}
      showPagination={false}
      style={{ width: "100%" }}
    />
  );
};

export const TableCustomSearchBar = ({
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
            padding: props?.multipleContainer
              ? "0px 120px 0px 12px"
              : "0px 12px",
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
                width: "60%",
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
                [theme.breakpoints.down("lg")]: {
                  marginLeft: 0,
                  marginRight: 0,
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
                width: props?.inputWidth ? props?.inputWidth : "400px",
              },
              [theme.breakpoints.down("lg")]: {
                "& .MuiInputBase-input": {
                  width: props?.inputWidth ? props?.inputWidth : "200px",
                  fontSize: 12,
                  py: 0.5,
                },
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

export const TableCustomPaginationReactTable = ({
  total_pages,
  handleInitialPage,
  pg_no,

  on_page_data,
  next_page,
  handleOnPageDataChange,
  handlePaginationOnChange,
  ...props
}) => {
  const matchesIphone = useMediaQuery("(max-width:500px)");

  return (
    <Grid
      style={{
        display: "flex",
        flexDirection: "row",
        justifyContent: "flex-end",
        alignItems: "center",
        gap: 40,
        padding:props?.tablePaginationheightNone?0: 10,
        marginBottom:props?.tablePaginationheightNone?1: 20,
        marginTop:props?.tablePaginationheightNone?1: 24,
      }}
      {...props}
    >
      {!matchesIphone && !props?.disableOnPage && (
        <Stack
          direction={"row"}
          spacing={2}
          alignItems={"flex-end"}
          justifyContent={"center"}
        >
          <Typography variant="body2">Rows per page:</Typography>
          <TextField
            id="client-master-code"
            select
            size="small"
            value={on_page_data}
            variant="outlined"
            sx={{
              "& .MuiInputBase-input": {
                fontSize: 14,

                marginBottom: "-8px",
              },
              [`& fieldset`]: {
                border: "none",
              },
            }}
            onChange={(e) => {
              if (props?.removeInitialPage) {
                handleOnPageDataChange(e.target.value);
              } else {
                handleInitialPage();
                handleOnPageDataChange(e.target.value);
              }
            }}
          >
            <MenuItem key={"5 rows"} value={5}>
              {"5 rows"}
            </MenuItem>
            <MenuItem key={"10 rows"} value={10}>
              {"10 rows"}
            </MenuItem>
            <MenuItem key={"20 rows"} value={20}>
              {"20 rows"}
            </MenuItem>
            <MenuItem key={"25 rows"} value={25}>
              {"25 rows"}
            </MenuItem>
            <MenuItem key={"50 rows"} value={50}>
              {"50 rows"}
            </MenuItem>
            <MenuItem key={"100 rows"} value={100}>
              {"100 rows"}
            </MenuItem>
          </TextField>
        </Stack>
      )}

      <Pagination
        onChange={handlePaginationOnChange}
        count={total_pages}
        page={Number(pg_no)}
        variant="outlined"
        size="small"
      />
    </Grid>
  );
};

export const TableCustomSearchBarWithDropDown = ({
  selectName,
  updateSelectname,
  searchText,
  setSearchText,
  searchClick,
  closeClick,
  noSelect,
  handleClickAway,
  dropDown,
  showDropDown,
  ...props
}) => {
  const [searchOpen, setSearchOpen] = useState(false);
  const [selectOpen, setSelectOpen] = useState(false);
  return (
    <ClickAwayListener
      onClickAway={(e) => {
        if ((searchText === "" || searchText === null) && !selectOpen) {
          setSearchOpen(false);
        } else {
          handleClickAway(e);
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
            zIndex:100,
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
                width: "60%",
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
              variant="standard"
              id="name"
              displayEmpty
              renderValue={() => null}
              value={selectName}
              fullWidth
              onOpen={() => setSelectOpen(true)}
              MenuProps={{
                TransitionProps: {
                  onExited: () => setSelectOpen(false),
                },
              }}
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
                  fontSize: "0.8rem",
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
              right: 48,
              top: 0,
              bottom: 0,
            }}
            type="button"
            color="secondary"
            aria-label="search"
            onClick={searchClick}
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
          {dropDown && showDropDown && dropDown}
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

export const TableFootercontainer = ({ ...props }) => {
  const matchesIphone = useMediaQuery("(max-width:500px)");
  const { ui } = useSelector((state) => state);
  const scrollContainerRef = useRef(null);
  const [isScrolledToLeftEnd, setIsScrolledToLeftEnd] = useState(true);
  const [isScrolledToEndRight, setIsScrolledToEndRight] = useState(false);

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollLeft -= 200; // Adjust scroll distance as needed
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollLeft += 200; // Adjust scroll distance as needed
    }
  };

  const checkScroll = () => {
    const el = scrollContainerRef.current;
    if (!el) return;
    setIsScrolledToEndRight(el.scrollWidth > el.clientWidth + el.scrollLeft);
  };

  useEffect(() => {
    const element = scrollContainerRef.current;
    checkScroll();
    if (element) {
      const handleScroll = () => {
        setIsScrolledToLeftEnd(element.scrollLeft === 0);
        window.requestAnimationFrame(checkScroll);
      };

      element.addEventListener("scroll", handleScroll);
      window.addEventListener("resize", () =>
        window.requestAnimationFrame(checkScroll),
      );
      // Cleanup the event listener when the component unmounts
      return () => {
        window.removeEventListener("resize", () =>
          window.requestAnimationFrame(checkScroll),
        );
        element.removeEventListener("scroll", handleScroll);
      };
    }
  }, []);

  return (
    <Box
      sx={(theme) => ({
        width: "100%",
        padding: theme.spacing(1.5),
        display: props.children ? "flex" : "none",
        justifyContent: props?.footerContentRight ? "flex-end" : "space-evenly",
        alignItems: "center",
        position: "fixed",
        bottom: 0,
        left: 0,
        backgroundColor: "#fff",
        zIndex: 99,

        ...(ui.drawerOpen && {
          width: "100%",
          marginLeft: 10,
          transition: theme.transitions.create("margin", {
            easing: theme.transitions.easing.easeOut,
            duration: theme.transitions.duration.enteringScreen,
          }),
        }),
        [theme.breakpoints.down("sm")]: {
          marginLeft: 1,
          width: "100%",
        },
      })}
    >
      <IconButton
        sx={{ visibility: isScrolledToLeftEnd ? "hidden" : "visible" }}
        disabled={isScrolledToLeftEnd}
        onClick={scrollLeft}
      >
        <ArrowLeftOutlinedIcon />
      </IconButton>

      <Box
        sx={{
          display: "flex",
          overflowX: "auto",
          whiteSpace: "nowrap",
          scrollBehavior: "smooth",
          "&::-webkit-scrollbar": {
            display: "none",
          },
        }}
        ref={scrollContainerRef}
      >
        {props.children}
      </Box>
      <IconButton
        sx={{ visibility: isScrolledToEndRight ? "visible" : "hidden" }}
        disabled={!isScrolledToEndRight}
        onClick={scrollRight}
      >
        <ArrowRightOutlinedIcon />
      </IconButton>
    </Box>
  );
};

export const TableStyledTab = styled(Tab)(
  ({ currentValue, tabValue, theme }) => ({
    margin: 1,
    fontSize: 13,
    borderRadius: 12,
    fontWeight: tabValue === currentValue ? 600 : 500,
    color:
      tabValue === currentValue
        ? "#fff !important"
        : theme.palette.text.primary,
    backgroundColor:
      tabValue === currentValue ? theme.palette.primary.main : "transparent",
    "&:hover": {
      backgroundColor: theme.palette.primary.light,
      color: "white",
    },
    [theme.breakpoints.down("sm")]: {
      marginX: 0,
      marginY: 1,
    },
  }),
);
