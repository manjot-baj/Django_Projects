import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";

import { useDispatch, useSelector } from "react-redux";
import {
  getClientDocListing,
  deleteClientDoc,
} from "../../../actions/master/ClientDocumentMasterActions";
import MasterListings from "@components/reusablecomponents/MasterListings";
import { useSnackbar } from "notistack";

const ClientDocumentListing = () => {
  const dispatch = useDispatch();
  const notify = useSnackbar().enqueueSnackbar;
  const store = useSelector((state) => state);
  const { clientMaster, clientDocMaster } = store;
  const history = useHistory();

  const [currentPage, setCurrentPage] = useState(1);

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

    data = {
      client_name: "",
      location: localStorage.getItem("location")
        ? localStorage.getItem("location")
        : null,
      site: localStorage.getItem("site") ? localStorage.getItem("site") : null,
      pg_no: currentPage === 1 ? 1 : store.stocksAndAllotmentSearch.pg_no,
      on_page_data: store.stocksAndAllotmentSearch.on_page_data,
    };
    setCurrentPage(currentPage + 1);
    dispatch(getClientDocListing(data, notify));

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    store.stocksAndAllotmentSearch.pg_no,
    store.stocksAndAllotmentSearch.on_page_data,
  ]);

  const handleButtonClick = () => {
    history.push("/master/clientDocument/form");
  };

  const deleteSelected = () => {
    dispatch(deleteClientDoc(clientMaster.check));
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
      masterArray={clientDocMaster.allClientDocListing}
      buttonName={"Client Document"}
      buttonClick={handleButtonClick}
      deleteSelected={deleteSelected}
      currentPage={store.stocksAndAllotmentSearch.pg_no}
      handleInitialPage={handleInitialPage}
      handleOnPageDataChange={handleOnPageDataChange}
      handlePaginationOnChange={handlePaginationOnChange}
    />
  );
};

export default ClientDocumentListing;
