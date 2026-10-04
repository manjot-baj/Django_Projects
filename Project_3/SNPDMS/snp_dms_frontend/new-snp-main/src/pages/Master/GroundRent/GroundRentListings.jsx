import React, { useEffect, useState } from "react";
import { useSnackbar } from "notistack";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import {
  getGroundRentChargesListings,
  deleteContainerGroundRentChargeListings,
} from "../../../actions/master/GroundRentChargesMasterActions";
import MasterListings from "@components/reusablecomponents/MasterListings";

const GroundRentlistings = () => {
  const dispatch = useDispatch();
  const history = useHistory();
  const store = useSelector((state) => state);
  const { groundRentChargesMaster, clientMaster } = store;
  const [currentPage, setCurrentPage] = useState(1);

  const notify = useSnackbar().enqueueSnackbar;
  var tableRow = [
    {
      id: 1,
      name: "",
    },
    {
      id: 2,
      name: "Client Ref Code",
    },
    {
      id: 3,
      name: "1-30 days",
    },
    {
      id: 4,
      name: "31-60 days",
    },
    {
      id: 5,
      name: "61-90 days",
    },
    {
      id: 6,
      name: "91-120 days",
    },
    {
      id: 7,
      name: "over 120 days",
    },
    {
      id: 8,
      name: "Size",
    },
    {
      id: 9,
      name: "Location",
    },
    {
      id: 10,
      name: "Site",
    },
  ];

  useEffect(() => {

    let data = {
      client_ref_code: "",
      location: localStorage.getItem("location")
        ? localStorage.getItem("location")
        : null,
      site: localStorage.getItem("site") ? localStorage.getItem("site") : null,
      pg_no: currentPage === 1 ? 1 : store.stocksAndAllotmentSearch.pg_no,
      on_page_data: 3,
    };
    dispatch(getGroundRentChargesListings(data,notify));
// eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store.stocksAndAllotmentSearch.pg_no]);

  const handleButtonClick = () => {
    dispatch({ type: "CLEAN_CONTAINER_GROUND_RENT_CHARGE_MASTER" });
    history.push("/master/containerGroundRentCharges/form");
  };

  const deleteSelected = () => {
    let data = {
      client_ref_code: "",
      location: localStorage.getItem("location")
        ? localStorage.getItem("location")
        : null,
      site: localStorage.getItem("site") ? localStorage.getItem("site") : null,
      pg_no: currentPage === 1 ? 1 : store.stocksAndAllotmentSearch.pg_no,
      on_page_data: 3,
    };
    dispatch(deleteContainerGroundRentChargeListings(clientMaster.check, notify, data));
  };

  const handleOnPageDataChange = (value) => {
    setCurrentPage(1);
    dispatch({
      type: "TOGGLE_PAGE_NO_SEARCH_VALUE",
      payload: 1,
    });
    dispatch({
      type: "TOGGLE_ON_PAGE_DATA_SEARCH_VALUE",
      payload: value,
    });
  };

  const handleInitialPage = () => {
    dispatch({
      type: "TOGGLE_PAGE_NO_SEARCH_VALUE",
      payload: 1,
    });
    setCurrentPage(1);
  };

  const handlePaginationOnChange = (e, val) => {
    dispatch({
      type: "TOGGLE_PAGE_NO_SEARCH_VALUE",
      payload: val,
    });
    setCurrentPage(val);
  };

  return (
    <MasterListings
      rowArray={tableRow}
      masterArray={groundRentChargesMaster.allGroundRentChargesListing}
      buttonName={"Ground Rent Charges"}
      buttonClick={handleButtonClick}
      deleteSelected={deleteSelected}
      currentPage={currentPage}
     handleInitialPage={handleInitialPage}
        handleOnPageDataChange={handleOnPageDataChange}
        handlePaginationOnChange={handlePaginationOnChange}
    />
  );
};

export default GroundRentlistings;
