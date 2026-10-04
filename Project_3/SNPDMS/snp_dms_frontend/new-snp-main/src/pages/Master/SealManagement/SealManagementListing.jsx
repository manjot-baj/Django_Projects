import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  getSealManagementListings,
  deleteSealManagementListings,
} from "../../../actions/master/SealManagementMasterActions";
import MasterListings from "@components/reusablecomponents/MasterListings";
import { useSnackbar } from "notistack";

const SealManagementListing = () => {
  const dispatch = useDispatch();
  const history = useHistory();
  const store = useSelector((state) => state);
  const { sealManagementMaster, clientMaster, sealManagementSearch } = store;
  const notify = useSnackbar().enqueueSnackbar;
  const [currentPage, setCurrentPage] = useState(1);


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
      id:4,
      name:"Seal Box Number"
    },
    {
      id: 5,
      name: "Location",
    },
    {
      id: 6,
      name: "Site",
    },
    {
      id: 7,
      name: "Line",
    },
    {
      id: 8,
      name: "In Date",
    },
    {
      id: 9,
      name: "In Time",
    },
  ];

  useEffect(() => {
    let data;

    data = {
      location: localStorage.getItem("location")
        ? localStorage.getItem("location")
        : null,
      site: localStorage.getItem("site") ? localStorage.getItem("site") : null,
      pg_no: store.stocksAndAllotmentSearch.pg_no,
      on_page_data: store.stocksAndAllotmentSearch.on_page_data,
      line: sealManagementSearch.line,
      number: sealManagementSearch.number,
      container_no: sealManagementSearch.container_no,
      is_available: true,
      is_damaged: false,
      is_cut: false,
      is_first_allotment: true,
      is_history: false,
      seal_box_number :sealManagementSearch.seal_box_number,
      in_date: {
        from: sealManagementSearch.in_date.from,
        to: sealManagementSearch.in_date.to,
      },
      out_date: {
        from: sealManagementSearch.out_date.from,
        to: sealManagementSearch.out_date.to,
      },
      in_use_date: {
        from: sealManagementSearch.in_use_date.from,
        to: sealManagementSearch.in_use_date.to,
      },
    };
    dispatch(getSealManagementListings(data, notify));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    store.stocksAndAllotmentSearch.pg_no,
    store.stocksAndAllotmentSearch.on_page_data,
  ]);

  const handleButtonClick = () => {
    dispatch({ type: "CLEAN_SEALMANAGEMENT_MASTER" });
    history.push("/master/sealManagement/form");
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
        handleOnRowsChange={handleOnRowsChange}
        deleteSelected={deleteSelected}
        handleInitialPage={handleInitialPage}
        handleOnPageDataChange={handleOnPageDataChange}
        handlePaginationOnChange={handlePaginationOnChange}
      />
      {/* </Backdrop> */}
    </>
  );
};

export default SealManagementListing;
