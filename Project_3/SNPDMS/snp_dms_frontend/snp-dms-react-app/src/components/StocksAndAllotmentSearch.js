import React, { useState } from "react";
import {
  makeStyles,
  Typography,
  Paper,
  Grid,
  FormControlLabel,
  InputBase,
  Select,
  MenuItem,
  Modal,
  Box,
  Switch,
  Button,
  useMediaQuery,
} from "@material-ui/core";
import { useDispatch, useSelector } from "react-redux";
import SearchIcon from "@material-ui/icons/Search";
import IconButton from "@material-ui/core/IconButton";
import { searchStocksDispatch } from "../actions/StocksAndAllotmentActions";
import InfoIcon from "@material-ui/icons/Info";
import ContainerListModal from "../components/ContainerListModal";
import Tooltip from "@mui/material/Tooltip";
import RefreshIcon from "@material-ui/icons/Refresh";
import StocksAndAllotmentSearchModal from "./StockAndAllotmentSearchModal";
import ClearIcon from "@material-ui/icons/Clear";
const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "60%",
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
};

const useStyles = makeStyles((theme) => ({
  paperContainer: {
    padding: theme.spacing(2, 3),
    [theme.breakpoints.down("md")]: {
      width: "70%",
    },
    [theme.breakpoints.down("sm")]: {
      width: "100%",
      marginTop: "20px",
    },
  },
  searchButton: {
    backgroundColor: "#FE5E37",
    color: "#fff",
    borderRadius: "0.5rem",
    padding: "1px 4px",
    height: 40,
    fontSize: 16,
    width: "320px",
    boxShadow: "0px 3px 6px #9199A14D",
    marginLeft:'30px',
    "&:hover": {
      backgroundColor: "#FE5E37",
      color: "#fff",
    },
    [theme.breakpoints.down("md")]: {
      height: 40,
      width: "250px",
      top: "0px",
      marginLeft: "100px",
    },
    [theme.breakpoints.down("xs")]: {
      height: "40px",
      width: "320px",
      fontSize: "12px",
      right: "80px",
      top:"0px"
    },
  },
  input: {
    padding: 7,
    borderColor: "black",
    "& input": {
      width: "auto",
      maxWidth: "400px",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap",
      overflow: "hidden",
    },
    [theme.breakpoints.down("md")]: {
      width: "100%",
      fontSize: "15px",
      padding: 4,
    },
    [theme.breakpoints.down("xs")]: {
      width: "100%",
      fontSize: "14px",
      padding: 4,
    },
  },

  autocomplete: {
    "& .MuiAutocomplete-inputRoot[class*='MuiOutlinedInput-root']": {
      padding: 0,
    },
  },
  clearIcon: {
    float: "right",
    cursor: "pointer",
  },
  modalPopUp: {
    top: "10%",
    position: "absolute",
    background: "#FFF",
    width: "85%",
    height: "80%",
    margin: "auto",
    left: "10%",
    padding: "15px 25px",
    pointerEvents: "painted",
    [theme.breakpoints.down("md")]: {
      overflowY: "scroll",
      top: "10%",
      width: "95%",
      height: "80%",
      left: 10,
    },
  },
  searchMenuItemPaper: {
    width: "20px",
    marginRight: "20px",
    border: "none",
    paddingRight: "12px",
    marginLeft: "20px",
    "& .MuiInputBase-root": {
      "& MuiSelect-select:focus": {
        borderColor: "#243545",
      },
    },
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
  searchPaperWrapper: {
    [theme.breakpoints.down("xs")]: {
      marginTop: "20px",
      marginBottom: "40px",
      width: "90%",
    },
  },
  searchPaper: {
    padding: "1px 4px",
    margin: 5,
    display: "flex",
    alignItems: "center",
    height: 45,
    borderRadius: "40px",
    width: "375px",
    "& .MuiPaper-root.MuiMenu-paper.MuiPopover-paper.MuiPaper-elevation8.MuiPaper-rounded":
      {
        marginTop: "123px !important",
      },
    [theme.breakpoints.down("xs")]: {
      height: 35,
      width: "350px",
      margin: 1,
    },
  },
  parentContainer:{
    [theme.breakpoints.down("xs")]: {
      display:'block !important'
    },
  }
}));

const StocksAndAllotmentSearch = () => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const store = useSelector((state) => state);
  const { stocksAndAllotmentSearch } = store;
  const [name, setName] = useState("Container Number");
  const [filterType, setFilterType] = useState("");
  const [open, setOpen] = React.useState(false);
  const [searchData, setSearchData] = useState("");
  const [openSearch, setOpenSearch] = React.useState(false);
  const handleOpenSearch = () => setOpenSearch(true);
  const handleCloseSearch = () => setOpenSearch(!openSearch);
  const matchesIphone = useMediaQuery("(max-width:500px)");
  const matchesIpad = useMediaQuery("(max-width:1050px)");

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(!open);

  const updateName = (event) => {
    setFilterType("");
    setName(event.target.value);
  };

  const getData = () => {
    dispatch(searchStocksDispatch(stocksAndAllotmentSearch));
  };

  const setDispatchType = (e) => {
    setFilterType(e.target.value);
    if (name === "Container Number") {
      dispatch({
        type: "SET_STOCK_ALLOT_SEARCH_CONTAINER_NUMBER",
        payload: e.target.value,
      });
      var removeSpace = e.target.value.replace(/ /g, "");
      var array = removeSpace.split(",");

      setSearchData(array);
    } else if (name === "Booking Number") {
      dispatch({
        type: "SET_STOCK_ALLOT_SEARCH_BOOKING_NUMBER",
        payload: e.target.value,
      });
    } else if (name === "Client") {
      dispatch({
        type: "SET_STOCK_ALLOT_SEARCH_CLIENT_NAME",
        payload: e.target.value,
      });
    } else {
      dispatch({
        type: "SET_STOCK_ALLOT_SEARCH_STATUS",
        payload: e.target.value,
      });
    }
  };

  return (
    <div>
    <Grid
      style={{
        display: "flex",
        width: "100%",
        justifyContent: "space-between",
      }}
      className={classes.parentContainer}
    >
      <Grid className={classes.searchPaperWrapper}>
        <Paper component="form" className={classes.searchPaper} elevation={0}>
          <Select
            id="client-name"
            value={name}
            fullWidth
            className={classes.searchMenuItemPaper}
            onChange={updateName}
          >
            <MenuItem value={"Container Number"}>
              &nbsp; &nbsp;&nbsp; Container Number
            </MenuItem>
            <MenuItem value={"Booking Number"}>
              &nbsp; &nbsp;&nbsp; Booking Number
            </MenuItem>
            <MenuItem value={"Client"}>&nbsp; &nbsp;&nbsp; Client</MenuItem>
            <MenuItem value={"Status"}>&nbsp; &nbsp;&nbsp; Status</MenuItem>
          </Select>
          <InputBase
            className={classes.input}
            placeholder={`Search ${name}`}
            inputProps={{ "aria-label": "search" }}
            value={filterType}
            onChange={setDispatchType}
            autoComplete="off"
          />
          <IconButton
            type="button"
            className={classes.iconButton}
            aria-label="search"
            onClick={() => {
              getData();
            }}
          >
            <SearchIcon />
          </IconButton>
          <Grid
            container
            xs={12}
            sm={12}
            style={{ display: "block", marginTop: "7px" }}
          >
            <InfoIcon onClick={handleOpen} style={{ color: "#2A5FA5" }} />
          </Grid>
        </Paper>
      </Grid>
      <Grid
        container
        lg={12}
        sm={12}
        md={12}
        xs={12}
        style={{
          alignItems: "center",
          justifyContent: "space-between",
        
        }}
      >
        <Grid item lg={3} md={3} xs={3}>
          <Tooltip title="Click to find more search results" arrow>
            <Button
              className={classes.searchButton}
              onClick={handleOpenSearch}
            >
              Advance Search&nbsp; &nbsp;&nbsp; &nbsp;
              <SearchIcon />
            </Button>
          </Tooltip>
        </Grid>
      </Grid>
    </Grid>
    <Grid container spacing={2} style={{margin:"20px 0 4px 0"}}>
      <Grid
        item
        lg={2}
        md={2}
        xs={6}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-start",
        }}
      >
        <Typography variant="body2" style={{marginRight:"10px"}}>History?</Typography>
        <FormControlLabel
          control={
            <Switch
              checked={stocksAndAllotmentSearch.out_history === "True"}
              size="small"
              onChange={() => {
                const newValue =
                  stocksAndAllotmentSearch.out_history === "True"
                    ? "False"
                    : "True";
                dispatch({
                  type: "TOGGLE_SELF_STOCKS_SEARCH_VALUE",
                  payload: newValue,
                });
                dispatch({
                  type: "SET_CHECK_ROW",
                  payload: [],
                });
              }}
              color="primary"
            />
          }
          label={stocksAndAllotmentSearch.out_history === 'True' ? 'Yes' : 'No'}
        />
      </Grid>
      <Grid
        item
        lg={2}
        md={2}
        xs={6}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-start",
        }}
      >
        <Typography variant="body2" style={{marginRight:"10px"}}>Do not Lift?</Typography>
        <FormControlLabel
          control={
            <Switch
              size="small"
              checked={stocksAndAllotmentSearch.do_not_lift_queue === "True"}
              onChange={() => {
                const newValue =
                  stocksAndAllotmentSearch.do_not_lift_queue === "True"
                    ? "False"
                    : "True";
                dispatch({
                  type: "TOGGLE_DO_NOT_LIFT_VALUE",
                  payload: newValue,
                });
                dispatch({
                  type: "SET_CHECK_ROW",
                  payload: [],
                });
              }}
              color="primary"
            />
          }
          label={stocksAndAllotmentSearch.do_not_lift_queue === 'True' ? 'Yes' : 'No'}
        />
      </Grid>
      <Grid
        item
        lg={4}
        md={4}
        xs={6}
     
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-start",
        }}
      >
        <Typography variant="body2" style={{marginRight:"10px"}}>Queued Recently</Typography>
        <FormControlLabel
          control={
            <Switch
              size="small"
              checked={stocksAndAllotmentSearch.queued_recently}
              onChange={(e) => {
               
                 
                dispatch({
                  type: "TOGGLE_QUEUED_RECENTLY",
                  payload: e.target.checked,
                });
                dispatch({
                  type: "SET_CHECK_ROW",
                  payload: [],
                });
              }}
              color="primary"
            />
          }
          label={stocksAndAllotmentSearch.queued_recently ? 'Yes' : 'No'}
        />
      </Grid>

      <Grid item xs={4} lg={4} style={{justifyContent:"flex-end",display:"flex", paddingRight:"20px"}}>
        <Tooltip title="Refresh the page" arrow>
          <Button
            style={{
              backgroundColor: "#2A5FA5",
              color: "white",
            }}
            onClick={() => window.location.reload()}
            startIcon={<RefreshIcon />}
          >
            Refresh
          </Button>
        </Tooltip>
      </Grid>
    
    </Grid>

    <Modal open={open} onClose={handleClose}>
      <Box sx={style}>
        <ContainerListModal
          handleClose={handleClose}
          searchData={searchData}
        />
      </Box>
    </Modal>
    <Modal open={openSearch} onClose={handleCloseSearch}>
      <Box className={classes.modalPopUp}>
        <Grid className={classes.clearIcon}>
          {" "}
          <ClearIcon onClick={handleCloseSearch} />
        </Grid>
        <StocksAndAllotmentSearchModal handleClose={handleCloseSearch} />
      </Box>
    </Modal>
  </div>
  );
};

export default StocksAndAllotmentSearch;