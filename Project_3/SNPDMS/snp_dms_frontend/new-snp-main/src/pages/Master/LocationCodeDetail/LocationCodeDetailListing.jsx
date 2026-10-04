import React, { useEffect, useState } from "react";
import { useSnackbar } from "notistack";
import { useHistory } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  getLocationCodeDetailListings,
  deleteLocationCodeDetailListings,
} from "../../../actions/master/LocationCodeDetailMasterActions";
import MasterListings from "@components/reusablecomponents/MasterListings";

const LocationCodeDetailListing = () => {
  const dispatch = useDispatch();
  const history = useHistory();
  const store = useSelector((state) => state);
  const { locationCodeDetailMaster, clientMaster } = store;
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
      name: "Name Code",
    },
    {
      id: 3,
      name: "Name",
    },
    {
      id: 4,
      name: "Code",
    },
    {
      id: 5,
      name: "Type",
    },
    {
      id: 6,
      name: "Location",
    },
    {
      id: 7,
      name: "Site",
    },
  ];

  useEffect(() => {
    let data;
    data = {
      name_code: "",
      name: "",
      code: "",
      type: "",
      location: localStorage.getItem("location")
        ? localStorage.getItem("location")
        : null,
      site: localStorage.getItem("site") ? localStorage.getItem("site") : null,
      pg_no: store.stocksAndAllotmentSearch.pg_no,
      on_page_data: store.stocksAndAllotmentSearch.on_page_data,
    };
    dispatch(getLocationCodeDetailListings(data, notify));

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    store.stocksAndAllotmentSearch.pg_no,
    store.stocksAndAllotmentSearch.on_page_data,
  ]);

  const handleButtonClick = () => {
    dispatch({ type: "CLEAN_LOCATION_CODE_DETAIL_MASTER" });
    history.push("/master/locationCodeDetail/form");
  };

  const deleteSelected = () => {
    let data = {
      name_code: "",
      name: "",
      code: "",
      type: "",
      location: localStorage.getItem("location")
        ? localStorage.getItem("location")
        : null,
      site: localStorage.getItem("site") ? localStorage.getItem("site") : null,
      pg_no: store.stocksAndAllotmentSearch.pg_no,
      on_page_data: store.stocksAndAllotmentSearch.on_page_data,
    };
    dispatch(
      deleteLocationCodeDetailListings(clientMaster.check, notify, data)
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
      masterArray={locationCodeDetailMaster.allLocationCodeDetailListing}
      buttonName={"Location Code Detail"}
      buttonClick={handleButtonClick}
      deleteSelected={deleteSelected}
      currentPage={currentPage}
      handleInitialPage={handleInitialPage}
      handleOnPageDataChange={handleOnPageDataChange}
      handlePaginationOnChange={handlePaginationOnChange}
    />
  );
};

export default LocationCodeDetailListing;
