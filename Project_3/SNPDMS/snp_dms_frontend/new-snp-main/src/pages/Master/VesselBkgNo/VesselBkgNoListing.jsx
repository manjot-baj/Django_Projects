import React, { useEffect, useState } from "react";
import { useSnackbar } from "notistack";
import { useHistory } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  getVesselBkgNoListings,
  deleteVesselBkgNoListings,
} from "../../../actions/master/VesselBkgNoMasterActions";
import MasterListings from "@components/reusablecomponents/MasterListings";

const VesselBkgNoListing = () => {
  const dispatch = useDispatch();
  const history = useHistory();
  const store = useSelector((state) => state);
  const { vesselBkgNoMaster, clientMaster } = store;
  const notify = useSnackbar().enqueueSnackbar;
  const [currentPage, setCurrentPage] = useState(1);
  const [disable, setDisable] = useState(1);

  var tableRow = [
    {
      id: 1,
      name: "",
    },
    {
      id: 2,
      name: "Vessel Bkg No Date",
    },
    {
      id: 3,
      name: "Vessel Bkg Number",
    },
    {
      id: 4,
      name: "Vessel Bkg No Location",
    },
    {
      id: 5,
      name: "Vessel Bkg No Site",
    },
  ];

  useEffect(() => {
    let data;

    data = {
      from_date: "",
      to_date: "",
      number: "",
      location: localStorage.getItem("location")
        ? localStorage.getItem("location")
        : null,
      site: localStorage.getItem("site") ? localStorage.getItem("site") : null,
      pg_no: currentPage === 1 ? 1 : store.stocksAndAllotmentSearch.pg_no,
      on_page_data:store.stocksAndAllotmentSearch.on_page_data,
    };
    dispatch(getVesselBkgNoListings(data,notify));
// eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store.stocksAndAllotmentSearch.pg_no,store.stocksAndAllotmentSearch.on_page_data]);

  const handleButtonClick = () => {
    dispatch({ type: "CLEAN_VESSEL_BKG_NO_MASTER" });
    history.push("/master/vesselBkgNo/form");
  };

  const deleteSelected = () => {
    let  data = {
      from_date: "",
      to_date: "",
      number: "",
      location: localStorage.getItem("location")
        ? localStorage.getItem("location")
        : null,
      site: localStorage.getItem("site") ? localStorage.getItem("site") : null,
      pg_no: currentPage === 1 ? 1 : store.stocksAndAllotmentSearch.pg_no,
      on_page_data:store.stocksAndAllotmentSearch.on_page_data,
    };
    dispatch(deleteVesselBkgNoListings(clientMaster.check, notify, data));
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
      masterArray={vesselBkgNoMaster.allVesselBkgNoListing}
      buttonName={"Vessel Bkg No"}
      buttonClick={handleButtonClick}
      deleteSelected={deleteSelected}
      currentPage={currentPage}

        handleInitialPage={handleInitialPage}
        handleOnPageDataChange={handleOnPageDataChange}
        handlePaginationOnChange={handlePaginationOnChange}
    />
  );
};

export default VesselBkgNoListing;
