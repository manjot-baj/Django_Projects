import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";

import { useDispatch, useSelector } from "react-redux";
import {
  getClientDocListing,
  deleteClientDoc,
} from "../../../actions/Master/ClientDocumentMasterActions";
import MasterListings from "../../../components/reusableComponents/MasterListings";
import { useSnackbar } from "notistack";

const ClientDocumentListing = () => {
  const dispatch = useDispatch();
  const notify = useSnackbar().enqueueSnackbar;
  const store = useSelector((state) => state);
  const { clientMaster, clientDocMaster } = store;
  const history = useHistory();

  const [currentPage, setCurrentPage] = useState(1);
  const [disable, setDisable] = useState(1);

  var tableRow = [
    {
      id: 1,
      name: "",
    },
    {
      id: 2,
      name: "Client Name",
    },
    {
      id: 3,
      name: "Document Name",
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
    setCurrentPage(currentPage + 1);
    dispatch(getClientDocListing(data,notify));
  
// eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store.stocksAndAllotmentSearch.pg_no]);

  const handleButtonClick = () => {
    history.push("/master/client-document-form");
  };

  const deleteSelected = () => {
    dispatch(deleteClientDoc(clientMaster.check));
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
      masterArray={clientDocMaster.allClientDocListing}
      buttonName={"Client Document"}
      buttonClick={handleButtonClick}
      deleteSelected={deleteSelected}
      currentPage={store.stocksAndAllotmentSearch.pg_no}
      prevPage={prevStockPage}
      nextPage={nextStockPage}
      prevStockPage={setPrevStockPage}
      nextStockPage={setNextStockPage}
      disable={disable}
    />
  );
};

export default ClientDocumentListing;
