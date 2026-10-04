import React, { useEffect, useState } from "react";
import { useSnackbar } from "notistack";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import {
  getUserListings,
  deleteUserListings,
} from "../../../actions/Admin/AccountUserMasterActions";
import MasterListings from "../../../components/reusableComponents/MasterListings";
import {
  makeStyles,
  Paper,
  InputBase,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  useMediaQuery,
  Grid,
} from "@material-ui/core";
import SearchIcon from "@material-ui/icons/Search";

const useStyles = makeStyles((theme) => ({
  searchPaperMenu: {
    padding: "1px 4px",
    margin: 5,
    display: "flex",
    alignItems: "center",
    height: 45,
    borderRadius: "40px",
    width: "500px",
    top: '76px',
    right: '0px',
    left: '300px',
    marginRight: '295px',
    position: 'relative',
    zIndex: '0',
    "& .MuiPaper-root.MuiMenu-paper.MuiPopover-paper.MuiPaper-elevation8.MuiPaper-rounded": {
      marginTop: "123px !important",
    },
    [theme.breakpoints.down("xs")]: {
      height: 35,
      left:"12px",
      right:"auto",
      width:"320px"
    },
  },
  iconButton: {
    float: "left",
    position: "absolute",
    left: "360px",
    [theme.breakpoints.down("sm")]: {
     left:"250px"
    },
  },
  formControl: {
    minWidth: 120,
    marginLeft: theme.spacing(4),
    [theme.breakpoints.down("sm")]:{
      minWidth:24,
      width:24
    }
  },
  inputBase: {
    marginLeft: theme.spacing(2),
    flex: 1,
  },
}));

const AccountUserListing = () => {
  const classes = useStyles();
  const [searchType, setSearchType] = useState("Username");
  const [searchValue, setSearchValue] = useState("");
  const dispatch = useDispatch();
  const history = useHistory();
  const store = useSelector((state) => state);
  const { accountUserMaster, clientMaster } = store;
  const notify = useSnackbar().enqueueSnackbar;
  const matchesIphone = useMediaQuery("(max-width:400px)");

  const tableRow = [
    { id: 1, name: "" },
    { id: 2, name: "ID" },
    { id: 3, name: "Username" },
    { id: 4, name: "First Name" },
    { id: 5, name: "Last Name" },
    { id: 6, name: "Mobile No." },
    { id: 7, name: "Email ID" },
    { id: 8, name: "Location" },
    { id: 9, name: "Site" },
    { id: 10, name: "Role" },
  ];

  useEffect(() => {
    dispatch(getUserListings());
  }, [dispatch]);

  const handleButtonClick = () => {
    dispatch({ type: "CLEAN_ACCOUNT_USER_MASTER" });
    history.push("/account/user-form");
  };

  const deleteSelected = () => {
    dispatch(deleteUserListings(clientMaster.check, notify));
  };

  const getData = () => {
    const filter = {};
    if (searchType === "Username" && searchValue) {
      filter.username = searchValue;
    } else if (searchType === "Role" && searchValue) {
      filter.role = searchValue;
    }
    dispatch(getUserListings(filter));
  };

  const handleSearchTypeChange = (event) => {
    setSearchType(event.target.value);
  };

  const handleSearchValueChange = (event) => {
    setSearchValue(event.target.value);
  };

  return (
    <Grid>
      <Grid className={classes.searchPaperWrapper}>
        <Paper component="form" className={classes.searchPaperMenu} elevation={0}>
          <FormControl className={classes.formControl}>
            <Select
              labelId="search-type-label"
              value={searchType}
              onChange={handleSearchTypeChange}
            >
              <MenuItem value="Username">Username</MenuItem>
              <MenuItem value="Role">Role</MenuItem>
            </Select>
          </FormControl>
          <InputBase
            className={classes.inputBase}
            placeholder={`Search ${searchType}`}
            inputProps={{ "aria-label": `search ${searchType}` }}
            value={searchValue}
            onChange={handleSearchValueChange}
            autoComplete="off"
          />
          <IconButton
            type="button"
            className={classes.iconButton}
            style={{ left: matchesIphone ? "235px" : "360px" }}
            aria-label="search"
            onClick={getData}
          >
            <SearchIcon />
          </IconButton>
        </Paper>
      </Grid>
      <MasterListings
        rowArray={tableRow}
        masterArray={accountUserMaster.allAccountUserListing}
        buttonName={"User"}
        buttonClick={handleButtonClick}
        deleteSelected={deleteSelected}
      />
    </Grid>
  );
};

export default AccountUserListing;