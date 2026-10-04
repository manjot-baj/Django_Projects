import React, { useEffect, useState } from "react";
import { useSnackbar } from "notistack";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import {
  getTransportationChargesListings,
  deleteContainerTransportationChargeListings,
} from "../../../actions/Master/TransportationChargesMasterAction";
import MasterListings from "../../../components/reusableComponents/MasterListings";

const TransportationChargesListing = () => {
  const dispatch = useDispatch();
  const history = useHistory();
  const store = useSelector((state) => state);
  const { transportationChargesMaster, clientMaster } = store;
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
      name: "ID",
    },
    {
      id: 3,
      name: "Transportation Client",
    },
    {
      id: 4,
      name: "Type",
    },
    {
      id: 5,
      name: "Amount",
    },
    {
      id: 6,
      name: "Size",
    },
    {
      id: 7,
      name: "Location",
    },
    {
      id: 8,
      name: "Site",
    },
  ];

  useEffect(() => {
    let data;
    if (disable === 1) {
      dispatch({ type: "TOGGLE_PAGE_NO_SEARCH_VALUE", payload: 1 });
    }
    data = {
      client_name: "",
      location: localStorage.getItem("location")
        ? localStorage.getItem("location")
        : null,
      site: localStorage.getItem("site") ? localStorage.getItem("site") : null,
      pg_no: currentPage === 1 ? 1 : store.stocksAndAllotmentSearch.pg_no,
      on_page_data: 3,
    };
    dispatch(getTransportationChargesListings(data,notify));
   
// eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store.stocksAndAllotmentSearch.pg_no]);

  const handleButtonClick = () => {
    dispatch({ type: "CLEAN_CONTAINER_TRANSPORTATION_CHARGE_MASTER" });
    history.push("/master/container-transportation-charge-form");
  };

  const deleteSelected = () => {
    let data = {
      client_name: "",
      location: localStorage.getItem("location")
        ? localStorage.getItem("location")
        : null,
      site: localStorage.getItem("site") ? localStorage.getItem("site") : null,
      pg_no: currentPage === 1 ? 1 : store.stocksAndAllotmentSearch.pg_no,
      on_page_data: 3,
    };
    dispatch(deleteContainerTransportationChargeListings(clientMaster.check, notify, data));
  };

  const nextStockPage = () => {
    setCurrentPage(currentPage + 1);
  };

  const prevStockPage = () => {
    setCurrentPage(currentPage - 1);
  };

  const setPrevStockPage = () => {
    dispatch({
      type: "TOGGLE_PAGE_NO_SEARCH_VALUE",
      payload: store.stocksAndAllotmentSearch.pg_no - 1,
    });
    setCurrentPage(currentPage - 1);
    setDisable(disable - 1);
  };

  const setNextStockPage = () => {
    dispatch({
      type: "TOGGLE_PAGE_NO_SEARCH_VALUE",
      payload: store.stocksAndAllotmentSearch.pg_no + 1,
    });
    setCurrentPage(currentPage + 1);
    setDisable(disable + 1);
  };

  return (
    <MasterListings
      rowArray={tableRow}
      masterArray={transportationChargesMaster.allTransportationChargesListing}
      buttonName={"Transportation Charges"}
      buttonClick={handleButtonClick}
      deleteSelected={deleteSelected}
      currentPage={currentPage}
      prevPage={prevStockPage}
      nextPage={nextStockPage}
      prevStockPage={setPrevStockPage}
      nextStockPage={setNextStockPage}
      disable={disable}
    />
  );
};

export default TransportationChargesListing;
