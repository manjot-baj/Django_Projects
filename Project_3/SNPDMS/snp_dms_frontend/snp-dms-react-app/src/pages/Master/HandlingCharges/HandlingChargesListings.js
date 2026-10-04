import React, { useEffect, useState } from "react";
import { useSnackbar } from "notistack";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import {
  getHandlingChargesListings,
  deleteContainerHandlingChargeListings,
} from "../../../actions/Master/HandlingChargesMasterActions";
import MasterListings from "../../../components/reusableComponents/MasterListings";

const HandlingChargesListing = () => {
  const dispatch = useDispatch();
  const history = useHistory();
  const store = useSelector((state) => state);
  const { handlingChargesMaster, clientMaster } = store;
  const [currentPage, setCurrentPage] = useState(1);
  const [disable, setDisable] = useState(1);
  const notify = useSnackbar().enqueueSnackbar;
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
      name: "Handler Client",
    },
    {
      id: 4,
      name: "Type",
    },
    {
      id: 5,
      name: "Rate Of",
    },
    {
      id: 6,
      name: "Amount",
    },
    {
      id: 7,
      name: "Size",
    },
    {
      id: 8,
      name: "Location",
    },
    {
      id: 9,
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
    dispatch(getHandlingChargesListings(data,notify));
// eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store.stocksAndAllotmentSearch.pg_no]);

  const handleButtonClick = () => {
    dispatch({ type: "CLEAN_CONTAINER_HANDLING_CHARGE_MASTER" });
    history.push("/master/container-handling-charge-form");
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
    }
    dispatch(deleteContainerHandlingChargeListings(clientMaster.check, notify, data));
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
      payload: Number(store.stocksAndAllotmentSearch.pg_no) - 1,
    });
    setCurrentPage(Number(currentPage) - 1);
    setDisable(disable - 1);
  };

  const setNextStockPage = () => {
    dispatch({
      type: "TOGGLE_PAGE_NO_SEARCH_VALUE",
      payload: Number(store.stocksAndAllotmentSearch.pg_no) + 1,
    });
    setCurrentPage(Number(currentPage) + 1);
    setDisable(disable + 1);
  };

  return (
    <MasterListings
      rowArray={tableRow}
      masterArray={handlingChargesMaster.allHandlingChargesListing}
      buttonName={"Handling Charges"}
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

export default HandlingChargesListing;