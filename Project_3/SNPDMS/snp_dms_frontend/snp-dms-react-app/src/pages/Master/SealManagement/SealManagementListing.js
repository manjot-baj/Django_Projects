import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  getSealManagementListings,
  deleteSealManagementListings,
} from "../../../actions/Master/SealManagementMasterActions";
import MasterListings from "../../../components/reusableComponents/MasterListings";
import { useSnackbar } from "notistack";

const SealManagementListing = () => {
  const dispatch = useDispatch();
  const history = useHistory();
  const store = useSelector((state) => state);
  const { sealManagementMaster, clientMaster, sealManagementSearch } = store;
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
      name: "Number",
    },
    {
      id: 3,
      name: "Container Number",
    },
    {
      id: 4,
      name: "Location",
    },
    {
      id: 5,
      name: "Site",
    },
    {
      id: 6,
      name: "Line",
    },
    {
      id: 7,
      name: "In Date",
    },
    {
      id: 8,
      name: "In Time",
    },
  ];

  useEffect(() => {
    let data;
    if (disable === 1) {
      dispatch({ type: "TOGGLE_PAGE_NO_SEARCH_VALUE", payload: 1 });
    }
    data = {
      location: localStorage.getItem("location")
        ? localStorage.getItem("location")
        : null,
      site: localStorage.getItem("site") ? localStorage.getItem("site") : null,
      pg_no: disable === 1 ? 1 : store.stocksAndAllotmentSearch.pg_no,
      on_page_data: store.stocksAndAllotmentSearch.on_page_data,
      line: sealManagementSearch.line,
      number: sealManagementSearch.number,
      container_no: sealManagementSearch.container_no,
      is_available: true,
      is_damaged: false,
      is_cut: false,
      is_first_allotment: true,
      is_history: false,
      in_date: { from: sealManagementSearch.in_date.from, to: sealManagementSearch.in_date.to },
      out_date:{ from: sealManagementSearch.out_date.from, to: sealManagementSearch.out_date.to },
      in_use_date:{from: sealManagementSearch.in_use_date.from, to: sealManagementSearch.in_use_date.to },
    };
    dispatch(getSealManagementListings(data,notify));
     // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    store.stocksAndAllotmentSearch.pg_no,
    store.stocksAndAllotmentSearch.on_page_data,
  ]);

  const handleButtonClick = () => {
    dispatch({ type: "CLEAN_SEALMANAGEMENT_MASTER" });
    history.push("/master/sealManagement-form");
  };

  const nextStockPage = () => {
    setCurrentPage(currentPage + 1);
  };

  const prevStockPage = () => {
    setCurrentPage(currentPage - 1);
  };
  
  const handleOnRowsChange = (e) => {
    setCurrentPage(1);
    dispatch({
      type: "TOGGLE_PAGE_NO_SEARCH_VALUE",
      payload: 1,
    });
    dispatch({
      type: "TOGGLE_ON_PAGE_DATA_SEARCH_VALUE",
      payload: e.target.value,
    });
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

  const changePageCount = (e) => {
    if (
      e.target.value === "" ||
      e.target.value === "0" ||
      e.target.value > store.stocksAndAllotment.totalPages
    ) {
      notify("Invalid value entered", {
        variant: "warning",
      });
      setCurrentPage(1);
      dispatch({
        type: "TOGGLE_PAGE_NO_SEARCH_VALUE",
        payload: 1,
      });
    } else {
      setCurrentPage(e.target.value);
      dispatch({
        type: "TOGGLE_PAGE_NO_SEARCH_VALUE",
        payload: e.target.value,
      });
    }
  }


  const deleteSelected = () => {
    dispatch(deleteSealManagementListings(clientMaster.check, notify));
  };

  return (
    <>
      {/* <Backdrop className={classes.backdrop} open={ui.isloading}> */}
      <MasterListings
        rowArray={tableRow}
        masterArray={sealManagementMaster.allSealManangementListing}
        buttonName={"Seal Management"}
        buttonClick={handleButtonClick}
        currentPage={currentPage}
        prevPage={prevStockPage}
        nextPage={nextStockPage}
        prevStockPage={setPrevStockPage}
        nextStockPage={setNextStockPage}
        handleOnRowsChange={handleOnRowsChange}
        disable={disable}
        deleteSelected={deleteSelected}
        changePageCount={changePageCount}
      />
      {/* </Backdrop> */}
    </>
  );
};

export default SealManagementListing;