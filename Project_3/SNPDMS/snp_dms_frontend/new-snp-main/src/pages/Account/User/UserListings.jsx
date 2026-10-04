import React, { useEffect, useState } from "react";
import { useSnackbar } from "notistack";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import {
  getUserListings,
  deleteUserListings,
} from "../../../actions/Admin/AccountUserMasterActions";
import MasterListings from "@components/reusablecomponents/MasterListings";
import { MenuItem, useMediaQuery, Grid } from "@mui/material";
import { TableCustomSearchBar } from "@/components/TableComponent/TableComponent";

const AccountUserListing = () => {
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
    history.push("/account/user/form");
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

  const handleCloseClick = () => {
    setSearchValue("");
    dispatch(getUserListings({}));
  };

  const handleSearchValueChange = (event) => {
    setSearchValue(event.target.value);
  };

  return (
    <Grid>
      <MasterListings
        rowArray={tableRow}
        masterArray={accountUserMaster.allAccountUserListing}
        buttonName={"User"}
        buttonClick={handleButtonClick}
        deleteSelected={deleteSelected}
        searchComp={
          <TableCustomSearchBar
            searchText={searchValue}
            setSearchText={handleSearchValueChange}
            searchClick={getData}
            selectName={searchType}
            closeClick={handleCloseClick}
            maxWidthSearch={"50%"}
            updateSelectname={handleSearchTypeChange}
          >
            <MenuItem value="Username">&nbsp; &nbsp;&nbsp;Username</MenuItem>
            <MenuItem value="Role">&nbsp; &nbsp;&nbsp;Role</MenuItem>
          </TableCustomSearchBar>
        }
      />
    </Grid>
  );
};

export default AccountUserListing;
