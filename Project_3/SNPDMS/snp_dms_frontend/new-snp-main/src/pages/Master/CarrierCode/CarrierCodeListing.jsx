import React, { useEffect, useState } from "react";
import { useSnackbar } from "notistack";
import { useHistory } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  getCarrierCodeListings,
  deleteCarrierCodeListings,
} from "../../../actions/master/CarrierCodeMasterActions";
import MasterListings from "@components/reusablecomponents/MasterListings";

const CarrierCodeListing = () => {
  const dispatch = useDispatch();
  const history = useHistory();
  const store = useSelector((state) => state);
  const { carrierCodeMaster, clientMaster } = store;
  const notify = useSnackbar().enqueueSnackbar;
  const [currentPage, setCurrentPage] = useState(1);


  var tableRow = [
    {
      id: 1,
      name: "",
    },
    {
      id: 2,
      name: "Location",
    },
    {
      id: 3,
      name: "Site",
    },
    {
      id: 4,
      name: "Code",
    },
  ];

  useEffect(() => {
    let data;
    data = {
      code: "",
      location: localStorage.getItem("location")
        ? localStorage.getItem("location")
        : null,
      site: localStorage.getItem("site") ? localStorage.getItem("site") : null,
      pg_no:  store.stocksAndAllotmentSearch.pg_no,
      on_page_data: 3,
    };
    dispatch(getCarrierCodeListings(data,notify));
   
// eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store.stocksAndAllotmentSearch.pg_no]);

  const handleButtonClick = () => {
    dispatch({ type: "CLEAN_CARRIER_CODE_DETAIL_MASTER" });
    history.push("/master/carrier-code/form");
  };

  const deleteSelected = () => {
    dispatch(deleteCarrierCodeListings(clientMaster.check, notify));
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
      masterArray={carrierCodeMaster.allCarrierCodeDetailListing}
      buttonName={"Carrier Code"}
      buttonClick={handleButtonClick}
      deleteSelected={deleteSelected}
      currentPage={currentPage}
      handleInitialPage={handleInitialPage}
        handleOnPageDataChange={handleOnPageDataChange}
        handlePaginationOnChange={handlePaginationOnChange}
    />
  );
};

export default CarrierCodeListing;
