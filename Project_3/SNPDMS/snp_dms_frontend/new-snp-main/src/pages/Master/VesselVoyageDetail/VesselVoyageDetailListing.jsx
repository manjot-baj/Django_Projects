import React, { useEffect, useState } from "react";

import { useHistory } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  getVesselVoyageDetailListings,
  deleteVesselVoyageDetailListings,
} from "../../../actions/master/VesselVoyageDetailMasterActions";
import MasterListings from "@components/reusablecomponents/MasterListings";
import { useSnackbar } from "notistack";

const VesselVoyageDetailListing = () => {
  const dispatch = useDispatch();
  const history = useHistory();
  const store = useSelector((state) => state);
  const { vesselVoyageDetailMaster, clientMaster } = store;
  const [currentPage, setCurrentPage] = useState(1);
  const notify = useSnackbar().enqueueSnackbar;
  var tableRow = [
    {
      id: 1,
      name: "",
    },
    {
      id: 2,
      name: "Vessel Voyage Location",
    },
    {
      id: 3,
      name: "Vessel Voyage Site",
    },
    {
      id: 4,
      name: "Vessel Voyage Booking No",
    },
    {
      id: 5,
      name: "Vessel Name - Voyage No",
    },
    {
      id: 6,
      name: "Vessel Name",
    },
    {
      id: 7,
      name: "Voyage No",
    },
  ];

  useEffect(() => {
    let data;

    data = {
      vessel_voyage: "",
      vessel_name: "",
      voyage_no: "",
      booking_no: "",
      location: localStorage.getItem("location")
        ? localStorage.getItem("location")
        : null,
      site: localStorage.getItem("site") ? localStorage.getItem("site") : null,
      pg_no: currentPage === 1 ? 1 : store.stocksAndAllotmentSearch.pg_no,
      on_page_data: store.stocksAndAllotmentSearch.on_page_data,
    };
    dispatch(getVesselVoyageDetailListings(data, notify));

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    store.stocksAndAllotmentSearch.pg_no,
    store.stocksAndAllotmentSearch.on_page_data,
  ]);

  const handleButtonClick = () => {
    dispatch({ type: "CLEAN_VESSEL_VOYAGE_DETAIL_MASTER" });
    history.push("/master/vesselVoyageDetail/form");
  };

  const deleteSelected = () => {
    let data = {
      vessel_voyage: "",
      vessel_name: "",
      voyage_no: "",
      booking_no: "",
      location: localStorage.getItem("location")
        ? localStorage.getItem("location")
        : null,
      site: localStorage.getItem("site") ? localStorage.getItem("site") : null,
      pg_no: currentPage === 1 ? 1 : store.stocksAndAllotmentSearch.pg_no,
      on_page_data: store.stocksAndAllotmentSearch.on_page_data,
    };
    dispatch(
      deleteVesselVoyageDetailListings(clientMaster.check, notify, data)
    );
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
      masterArray={vesselVoyageDetailMaster.allVesselVoyageDetailListing}
      buttonName={"Vessel Voyage Detail"}
      buttonClick={handleButtonClick}
      deleteSelected={deleteSelected}
      currentPage={currentPage}
      handleInitialPage={handleInitialPage}
      handleOnPageDataChange={handleOnPageDataChange}
      handlePaginationOnChange={handlePaginationOnChange}
    />
  );
};

export default VesselVoyageDetailListing;
