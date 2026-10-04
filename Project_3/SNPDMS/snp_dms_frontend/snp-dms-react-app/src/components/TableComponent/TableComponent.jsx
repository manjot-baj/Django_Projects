import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { theme } from "../../App";
import { faSort } from "@fortawesome/free-solid-svg-icons";
import clsx from "clsx";
import {
  Box,
  Button,
  ClickAwayListener,
  Grid,
  IconButton,
  InputBase,
  makeStyles,
  MenuItem,
  Modal,
  Paper,
  Popover,
  Select,
  TextField,
  Typography,
  useMediaQuery,
} from "@material-ui/core";
import ManageSearchOutlinedIcon from "@mui/icons-material/ManageSearchOutlined";
import RefreshIcon from "@material-ui/icons/Refresh";
import ReactTable from "react-table-v6";
import "react-table-v6/react-table.css";
import PreviousIcon from "@material-ui/icons/ArrowBack";
import NextIcon from "@material-ui/icons/ArrowForward";
import { useSnackbar } from "notistack";
import SearchIcon from "@material-ui/icons/Search";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import TuneIcon from "@mui/icons-material/Tune";
import ClearIcon from "@material-ui/icons/Clear";
import { Image } from "semantic-ui-react";
import { Stack } from "@mui/material";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";

const useStyles = makeStyles((theme) => ({
  tableCellText: {
    fontSize: 14,
    letterSpacing: 0.3,
  },
  iconContainerClose: {
    position: "absolute",
    right: 4,
    top: 0,
    bottom: 0,
  },
  searchMenuItemPaper: {
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
  },
  pageTitle:{
    textTransform:"capitalize"
  },
  searchPaperMenuNew: {
    backgroundColor: theme.palette.secondary.light,
    padding: "0px 12px",
    position: "relative",
    display: "flex",
    alignItems: "center",

    borderRadius: "4px",
    width: "100%",
    "& .MuiPaper-root.MuiMenu-paper.MuiPopover-paper.MuiPaper-elevation8.MuiPaper-rounded":
      {
        marginTop: "123px !important",
      },
    [theme.breakpoints.down("xs")]: {
      height: 35,
    },
  },
  input: {
    padding: 9,
    borderColor: "black",
    "& .MuiInputBase-input": {
      width: "400px",
    },
    [theme.breakpoints.down("xs")]: {
      "& .MuiInputBase-input": {
        width: "200px",
        fontSize: "0.8rem",
        padding: 1,
      },
    },
  },
  tableFilter: {
    padding: "24px 20px",
  },
  inputPagination: {
    padding: 9,
    fontSize: 12,
    borderColor: "black",
    "& .MuiInputBase-input": {
      width: "400px",
    },
    [theme.breakpoints.down("xs")]: {
      "& .MuiInputBase-input": {
        width: "200px",
        fontSize: "0.8rem",
        padding: 1,
      },
    },
  },
  inputRowsPerPage: {
    [`& fieldset`]: {
      border: "none",
    },
  },
  reactTableContainer: {
    border: "none !important",

    "&.ReactTable .rt-thead.-header": {
      boxShadow: "none !important",
      borderBottom: "1px solid rgba(0,0,0,0.1)",
      padding: "12px 0",
    },
    "&.ReactTable .rt-tbody .rt-tr-group": {
      borderBottom: "1px solid rgba(0,0,0,0.1)",
      padding: "12px 0",
    },
  },

  advanceSearchContainer: {
    backgroundColor: theme.palette.secondary.light,
    borderRadius: 4,
  },
  tableTitle: {
    letterSpacing: 0.5,
    fontWeight: 800,
  },
  reactTableContainer: {
    border: "none !important",
    "& ::-webkit-scrollbar": {
      height: "5px",
    },
    "&.ReactTable .rt-thead.-header": {
      boxShadow: "none !important",
      borderBottom: "1px solid rgba(0,0,0,0.1)",
      padding: "8px 0",
    },
    "&.ReactTable .rt-th, &.ReactTable .rt-td": {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },
    "&.ReactTable .rt-tbody .rt-tr-group": {
      borderBottom: `1px solid rgba(0,0,0,0.1)`,
      padding: "8px 0",
      transitionProperty: "background",
      transitionDelay: "0.1s",
    },
    "&.ReactTable .rt-tbody .rt-tr-group:nth-child(odd)": {
      backgroundColor: theme.palette.secondary.light,
      borderRadius: 4,
    },
  },
  iconContainer: {
    position: "absolute",
    right: 48,
    top: 0,
    bottom: 0,
  },
  iconColor: {
    fill: theme.palette.secondary.main,
    "&:hover": {
      fill: theme.palette.secondary.dark,
    },
  },
  filterOption: {
    backgroundColor: "transparent",
    borderRadius: 4,
    color: theme.palette.secondary.dark,
    "&:hover": {
      backgroundColor: theme.palette.secondary.light,
      color: theme.palette.secondary.dark,
    },
  },
  popOverContainer: {
    "& .MuiPopover-paper": {
      overflowY: "hidden",
    },
  },
  modalPopUp: {
    top: "20%",
    position: "absolute",
    background: "#FFF",
    width: "85%",
    height: "60%",
    margin: "auto",
    left: "10%",
    padding: "15px 25px",
    pointerEvents: "painted",
    borderRadius: "12px",
  },
  backImage: {
    height: 40,
    width: 40,
    marginBottom: 15,
    cursor: "pointer",
  },
  tableFooter: {
    position: "fixed",
    bottom: 0,
    width: "100vw",
    padding: "14px 16px",
    display: "flex",
    alignItems: "center",
    gap: 10,
    justifyContent: "center",
  },
  tableFooterOpen: {
    transition: theme.transitions.create("left", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
    left: 160,
  },
  tableFooterClose: {
    transition: theme.transitions.create("left", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
    left: 64,
  },
}));

export const TableFooterSection = (props) => {
  const classes = useStyles();
  const { drawerOpen } = useSelector((state) => state.ui);
  return (
    <Paper
      {...props}
      elevation={0}
      className={clsx(classes.tableFooter, {
        [classes.tableFooterOpen]: drawerOpen,
        [classes.tableFooterClose]: !drawerOpen,
      })}
    >
      {props.children}
    </Paper>
  );
};

export const TablePageBreadCrumbs = (props) => {
  const location = useLocation();
  const classes = useStyles();
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
        className={classes.pageTitle}
      >
        {` ${location?.pathname?.split("/")[1]} ${
          location?.pathname?.split("/")[2] ? ">" : ""
        } `}
      </Typography>
      <Typography
        variant="body2"
        color="inherit"
        noWrap
        className={classes.pageTitle}
      >
        {`${location?.pathname?.split("/")[2]?.split("-")?.join(" ")}`}
      </Typography>
    </Box>
  );
};

export const TableFilterComponent = ({ ...props }) => {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const handleOpen = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);
  const open = Boolean(anchorEl);
  const id = open ? "simple-popover" : undefined;
  const classes = useStyles();
  return (
    <>
      <IconButton
        color="secondary"
        aria-describedby={id}
        onClick={handleOpen}
        className={classes.filterOption}
      >
        <TuneIcon />
      </IconButton>
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
        style={{ marginTop: 20, overflow: "hidden", borderRadius: 12 }}
        className={classes.popOverContainer}
      >
        <Box
          style={{ overflow: "hidden", maxWidth: 280 }}
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
  const classes = useStyles();
  return (
    <Grid container {...props} spacing={2} className={classes.tableFilter}>
      {props.children}
    </Grid>
  );
};

export const TableBackButton = ({ ...props }) => {
  const classes = useStyles();
  return (
    <Image
      src={require("../../assets/images/back-arrow.png")}
      className={classes.backImage}
      {...props}
    />
  );
};

export const TableHeading = (props) => {
  return (
    <b
      style={{
        color: theme.palette.secondary.dark,
        fontSize: 14,
        letterSpacing: 0.8,
        fontWeight: 900,
      }}
      {...props}
    >
      {props.children}
      {props?.filter && (
        <FontAwesomeIcon
          icon={faSort}
          style={{
            fill: theme.palette.secondary.main,
            color: theme.palette.secondary.main,
            marginLeft: 4,
            opacity: 0.5,
          }}
        />
      )}
    </b>
  );
};

export const TableCellText = (props) => {
  const classes = useStyles();
  return (
    <span className={classes.tableCellText} {...props}>
      {props.children}
    </span>
  );
};

export const TablePageTitle = (props) => {
  const classes = useStyles();
  return (
    <Typography
      variant={"body1"}
      component={"h4"}
      {...props}
      color="textPrimary"
      className={props.default && classes.tableTitle}
    >
      {props.children}
    </Typography>
  );
};

export const TableAdvanceSearch = (props) => {
  const classes = useStyles();
  return (
    <IconButton
      color="primary"
      {...props}
      className={classes.advanceSearchContainer}
    >
      <ManageSearchOutlinedIcon />
    </IconButton>
  );
};

export const TableAdvanceSearchWithModal = ({
  open,
  handleClose,
  handleOpen,
  ...props
}) => {
  const classes = useStyles();

  return (
    <>
      <Modal open={open} onClose={handleClose}>
        <Box className={classes.modalPopUp}>
          <Grid className={classes.clearIcon}>
            {" "}
            <ClearIcon onClick={handleClose} />
          </Grid>
          <Box mt={4}></Box>
          {props.children}
        </Box>
      </Modal>
      <IconButton
        color="primary"
        onClick={handleOpen}
        {...props}
        className={classes.advanceSearchContainer}
      >
        <ManageSearchOutlinedIcon />
      </IconButton>
    </>
  );
};

export const TableRefreshIcon = (props) => {
  const classes = useStyles();
  return (
    <IconButton color="secondary" {...props}>
      <RefreshIcon fontSize="small" />
    </IconButton>
  );
};

export const TableCustomAdvanceReactTable = (props) => {
  const classes = useStyles();
  return (
    <ReactTable
      {...props}
      collapseOnDataChange={false}
      className={classes.reactTableContainer}
      showPagination={false}
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
  ...props
}) => {
  const classes = useStyles();
  return (
    <Paper
      component="form"
      className={classes.searchPaperMenuNew}
      elevation={0}
    >
      {!noSelect && (
        <Select
          id="name"
          value={selectName}
          fullWidth
          className={classes.searchMenuItemPaper}
          onChange={updateSelectname}
          color="primary"
        >
          {props.children}
        </Select>
      )}
      <InputBase
        className={classes.input}
        placeholder={`Search ${selectName}`}
        inputProps={{ "aria-label": "search" }}
        value={searchText}
        onChange={setSearchText}
        autoComplete="off"
      />
      <IconButton
        className={classes.iconContainer}
        type="button"
        color="secondary"
        aria-label="search"
        onClick={searchClick}
      >
        <SearchIcon className={classes.iconColor} fontSize="small" />
      </IconButton>
      <IconButton
        className={classes.iconContainerClose}
        color="secondary"
        type="button"
        aria-label="search"
        onClick={closeClick}
      >
        <CloseOutlinedIcon className={classes.iconColor} fontSize="small" />
      </IconButton>
    </Paper>
  );
};

export const TableCustomPaginationReactTable = ({
  total_pages,
  handleCurrentPage,
  handleInitialPage,
  pg_no,
  setCurrentPage,
  prevStockPage,
  on_page_data,
  next_page,
  handleOnPageDataChange,
  nextStockPage,
  ...props
}) => {
  const classes = useStyles();
  const matchesIphone = useMediaQuery("(max-width:500px)");
  const notify = useSnackbar().enqueueSnackbar;
  return (
    <Grid
      style={{
        display: "flex",
        flexDirection: "row",
        justifyContent: "flex-end",
        alignItems: "center",
        gap: 40,
        padding: 10,
        marginBottom: 20,
        marginTop: 24,
      }}
      {...props}
    >
      <Stack
        direction={"row"}
        spacing={2}
        alignItems={"center"}
        justifyContent={"center"}
      >
        <Typography variant="caption">Rows per page:</Typography>
        <TextField
          id="client-master-code"
          select
          value={on_page_data}
          variant="outlined"
          inputProps={{ className: classes.inputPagination }}
          className={classes.inputRowsPerPage}
          onChange={(e) => {
            setCurrentPage(1);
            handleInitialPage();
            handleOnPageDataChange(e.target.value);
          }}
        >
          <MenuItem key={"5 rows"} value={"5"}>
            {"5 rows"}
          </MenuItem>
          <MenuItem key={"10 rows"} value={"10"}>
            {"10 rows"}
          </MenuItem>
          <MenuItem key={"20 rows"} value={"20"}>
            {"20 rows"}
          </MenuItem>
          <MenuItem key={"25 rows"} value={"25"}>
            {"25 rows"}
          </MenuItem>
          <MenuItem key={"50 rows"} value={"50"}>
            {"50 rows"}
          </MenuItem>
          <MenuItem key={"100 rows"} value={"100"}>
            {"100 rows"}
          </MenuItem>
        </TextField>
      </Stack>

      <Grid style={{ display: "flex", alignItems: "flex-end" }}>
        <TextField
          id="basic"
          variant="outlined"
          size="small"
          inputProps={{ className: classes.inputPagination }}
          style={{ width: "32px", textAlign: "center" }}
          value={pg_no}
          className={classes.inputRowsPerPage}
          onChange={(e) => {
            if (e.target.value > total_pages) {
              notify("Invalid value entered", {
                variant: "warning",
              });
            } else {
              setCurrentPage(e.target.value);
            }
          }}
          onBlur={(e) => {
            if (
              e.target.value === "" ||
              e.target.value === "0" ||
              e.target.value > total_pages
            ) {
              notify("Invalid value entered", {
                variant: "warning",
              });
              setCurrentPage(1);
              handleInitialPage();
            } else {
              setCurrentPage(e.target.value);
              handleCurrentPage(e.target.value);
            }
          }}
        />
        {!matchesIphone && (
          <Typography
            variant="subtitle2"
            style={{ padding: "3px", fontSize: 12 }}
          >
            of
          </Typography>
        )}
        <Typography
          variant="subtitle2"
          style={{
            padding: matchesIphone ? "10px 0 10px 0" : "3px",
            fontSize: 12,
          }}
        >
          {total_pages}
        </Typography>
      </Grid>
      <IconButton
        size="small"
        disabled={pg_no === 1 || pg_no === "1" ? true : false}
        color="secondary"
        onClick={prevStockPage}
      >
        <PreviousIcon fontSize="small" />
      </IconButton>
      <IconButton
        size="small"
        disabled={next_page === "" ? true : false}
        color="secondary"
        onClick={nextStockPage}
      >
        <NextIcon fontSize="small" />
      </IconButton>
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
  const classes = useStyles();
  return (
    <ClickAwayListener onClickAway={handleClickAway}>
      <Paper
        component="form"
        className={classes.searchPaperMenuNew}
        elevation={0}
      >
        {!noSelect && (
          <Select
            id="name"
            value={selectName}
            fullWidth
            className={classes.searchMenuItemPaper}
            onChange={updateSelectname}
            color="primary"
          >
            {props.children}
          </Select>
        )}
        <InputBase
          className={classes.input}
          placeholder={`Search ${selectName}`}
          inputProps={{ "aria-label": "search" }}
          value={searchText}
          onChange={setSearchText}
          autoComplete="off"
        />
        <IconButton
          className={classes.iconContainer}
          type="button"
          color="secondary"
          aria-label="search"
          onClick={searchClick}
        >
          <SearchIcon className={classes.iconColor} fontSize="small" />
        </IconButton>
        <IconButton
          className={classes.iconContainerClose}
          color="secondary"
          type="button"
          aria-label="search"
          onClick={closeClick}
        >
          <CloseOutlinedIcon className={classes.iconColor} fontSize="small" />
        </IconButton>
        {dropDown && showDropDown && dropDown}
      </Paper>
    </ClickAwayListener>
  );
};
