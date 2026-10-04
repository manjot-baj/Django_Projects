import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import { useSnackbar } from "notistack";
import {
  getCountryListings,
  deleteCountryListings,
} from "../../../actions/Master/CountryMasterActions";
import MasterListings from "../../../components/reusableComponents/MasterListings";

const CountryListing = () => {
  const dispatch = useDispatch();
  const history = useHistory();
  const store = useSelector((state) => state);
  const { countryMaster, clientMaster } = store;
  const notify = useSnackbar().enqueueSnackbar;

  var tableRow = [
    {
      id: 1,
      name: "",
    },
    {
      id: 2,
      name: "Country Id",
    },
    {
      id: 3,
      name: "Country Name",
    },
    {
      id: 4,
      name: "Country Currency",
    },
  ];

  useEffect(() => {
    dispatch(getCountryListings(notify));
// eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleButtonClick = () => {
    dispatch({ type: "CLEAN_COUNTRY_MASTER" });
    history.push("/master/country-form");
  };

  const deleteSelected = () => {
    dispatch(deleteCountryListings(clientMaster.check, notify));
  };

  return (
    <MasterListings
      rowArray={tableRow}
      masterArray={countryMaster.allCountryListing}
      buttonName={"Country"}
      buttonClick={handleButtonClick}
      deleteSelected={deleteSelected}
    />
  );
};

export default CountryListing;
