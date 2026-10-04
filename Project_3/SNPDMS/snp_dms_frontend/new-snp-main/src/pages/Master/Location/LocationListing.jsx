import React, { useEffect, useState } from "react";
import { useSnackbar } from "notistack";
import { useHistory } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  getLocationListings,
  deleteLocationListings,
} from "../../../actions/master/LocationMasterActions";
import MasterListings from "@components/reusablecomponents/MasterListings";
import {
  Grid,
} from "@mui/material";
import { TableCustomSearchBar } from "@/components/TableComponent/TableComponent";

const LocationListing = () => {
  const [filterType, setFilterType] = useState("");
  const dispatch = useDispatch();
  const history = useHistory();
  const store = useSelector((state) => state);
  const { locationMaster, clientMaster } = store;
  const notify = useSnackbar().enqueueSnackbar;

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
    {id:10,name:"LUT No."}
  ];
  useEffect(() => {
    dispatch(getLocationListings({}, notify));
  }, [dispatch]);

  const getData = () => {
    const filter = {};
    if (filterType) {
      filter.name = filterType;
    }
    dispatch(getLocationListings(filter));
  };

  const handleCloseClick =()=>{
    setFilterType("")
     dispatch(getLocationListings({}, notify));
  }

  const setDispatchType = (e) => {
    setFilterType(e.target.value);
  };

  const handleButtonClick = () => {
    dispatch({ type: "CLEAN_LOCATION_MASTER" });
    history.push("/master/location/form");
  };

  const deleteSelected = () => {
    dispatch(deleteLocationListings(clientMaster.check, notify));
  };

  return (
    <Grid>
      <MasterListings
        rowArray={tableRow}
        masterArray={locationMaster.allLocationListing}
        buttonName="Location"
        buttonClick={handleButtonClick}
        deleteSelected={deleteSelected}
        searchComp={
          <TableCustomSearchBar
            searchText={filterType}
            setSearchText={setDispatchType}
            noSelect={true}
            searchClick={getData}
            selectName={"Location Name"}
            closeClick={handleCloseClick}
            maxWidthSearch={"50%"}
          />
        }
      />
    </Grid>
  );
};

export default LocationListing;
