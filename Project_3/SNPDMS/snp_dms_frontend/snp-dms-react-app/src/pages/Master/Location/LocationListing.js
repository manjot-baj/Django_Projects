import React, { useEffect, useState } from "react";
import { useSnackbar } from "notistack";
import { useHistory } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  getLocationListings,
  deleteLocationListings,
} from "../../../actions/Master/LocationMasterActions";
import MasterListings from "../../../components/reusableComponents/MasterListings";
import {
  makeStyles,
  Paper,
  Grid,
  InputBase,
  useMediaQuery,
  IconButton,
} from "@material-ui/core";
import SearchIcon from "@material-ui/icons/Search";

const useStyles = makeStyles((theme) => ({

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
  searchPaperMenu: {
    padding: "1px 4px",
    margin: 5,
    display: "flex",
    alignItems: "center",
    height: 45,
    borderRadius: "40px",
    width: "400px",
    top: '76px',
    right: '0px',
    left: '300px',
    marginRight: '295px',
    position: 'relative',
    zIndex: '0',
    "& .MuiPaper-root.MuiMenu-paper.MuiPopover-paper.MuiPaper-elevation8.MuiPaper-rounded":
    {
      marginTop: "123px !important",
    },
    [theme.breakpoints.down("sm")]: {
      height: 35,
      left:"0px",
      right:"auto",
      width: "350px",
      margin:4
    },
  },
  iconButton: {
    float: "left",
    position: "absolute",
    left: "645px",
    [theme.breakpoints.down("sm")]: {
      left: "600px",
    },
  },
}));

const LocationListing = () => {
  const classes = useStyles();
  const [filterType, setFilterType] = useState("");
  const dispatch = useDispatch();
  const history = useHistory();
  const store = useSelector((state) => state);
  const { locationMaster, clientMaster } = store;
  const notify = useSnackbar().enqueueSnackbar;
  const matchesIphone = useMediaQuery("(max-width:400px)");
  const tableRow = [
    { id: 1, name: "" },
    { id: 2, name: "Location Code" },
    { id: 3, name: "Location Name" },
    { id: 4, name: "Target" },
    { id: 5, name: "Company Name" },
    { id: 6, name: "Company Address" },
    { id: 7, name: "State Code" },
    { id: 8, name: "Country" },
    { id: 9, name: "GST No." },
  ];
  useEffect(() => {
    dispatch(getLocationListings({},notify));
  }, [dispatch]);

  const getData = () => {
    const filter = {};
    if (filterType) {
      filter.name = filterType;
    }
    dispatch(getLocationListings(filter));
  };

  const setDispatchType = (e) => {
    setFilterType(e.target.value);
  };


  const handleButtonClick = () => {
    dispatch({ type: "CLEAN_LOCATION_MASTER" });
    history.push("/master/location-form");
  };

  const deleteSelected = () => {
    dispatch(deleteLocationListings(clientMaster.check, notify));
  };


  return (
    <Grid >
      <Grid className={classes.searchPaperWrapper}>
        <Paper component="form" className={classes.searchPaperMenu} elevation={0}>
          <InputBase
            className={classes.input}
            placeholder="Search Location Name"
            inputProps={{ "aria-label": "search" }}
            value={filterType}
            onChange={setDispatchType}
            autoComplete="off"
            style={{ marginLeft: '40px' }}
          />
          <IconButton
            type="button"
            className={classes.iconButton}
            style={{ left: matchesIphone ? "295px" : "300px" }}
            aria-label="search"
            onClick={getData}
          >
            <SearchIcon />
          </IconButton>
        </Paper>

      </Grid>
      <MasterListings
        rowArray={tableRow}
        masterArray={locationMaster.allLocationListing}
        buttonName="Location"
        buttonClick={handleButtonClick}
        deleteSelected={deleteSelected}
      />
    </Grid>
  );
};

export default LocationListing;