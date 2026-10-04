import React, { useEffect, useState } from "react";
import { useSnackbar } from "notistack";
import { useHistory } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  getTransporterListings,
  deleteTransporterListings,
} from "../../../actions/Master/TransporterMasterActions";
import MasterListings from "../../../components/reusableComponents/MasterListings";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSort } from "@fortawesome/free-solid-svg-icons";
import Checkbox from "../../../components/reusableComponents/Checkbox";

const TransporterListing = () => {
  const dispatch = useDispatch();
  const history = useHistory();
  const store = useSelector((state) => state);
  const { transporterMaster, clientMaster, user } = store;
  const notify = useSnackbar().enqueueSnackbar;
  const [currentPage, setCurrentPage] = useState(1);
  const [disable, setDisable] = useState(1);
  const Buttons = ["Country", "Location", "Site", "Role", "User", "Ref Code"];

  const Columns = [
    {
      accessor: "",
      width: 50,

      Cell: (row) => {
        return (
          user.role === "Admin" && (
            <div>
              <Checkbox id={row.original.pk} value={row.original.pk} />
            </div>
          )
        );
      },
      style: {
        textAlign: "center",
      },
      sortable: false,
    },
    {
      Header: (
        <b style={{ color: "#2A5FA5" }}>
          Sr No<FontAwesomeIcon icon={faSort} />
        </b>
      ),
      accessor: "sr_no",
      style: {
        textAlign: "center",
      },
      Cell: (row) => {
        return (
          <div style={{ cursor: "pointer" }}>
            <span title={row.original.sr_no}>{row.original.sr_no}</span>
          </div>
        );
      },
    },
    {
      Header: (
        <b style={{ color: "#2A5FA5" }}>
          Transporter Code
          <FontAwesomeIcon icon={faSort} />
        </b>
      ),
      accessor: "code",
      style: {
        textAlign: "center",
      },
      Cell: (row) => {
        return (
          <div
            style={{ cursor: "pointer" }}
            onClick={() =>
              (user.role === "Admin" ||
                (user.role !== "Admin" && !Buttons.includes("Transporter"))) &&
              history.push({
                pathname: "/master/transporter-form",
                state: { pk: row.original.pk, allDetails: row.original },
              })
            }
          >
            <span title={row.original}>{row.original.code}</span>
          </div>
        );
      },
    },
    {
      Header: (
        <b style={{ color: "#2A5FA5" }}>
          Transporter Name <FontAwesomeIcon icon={faSort} />
        </b>
      ),
      accessor: "name",
      style: {
        textAlign: "left",
      },
      Cell: (row) => {
        return (
          <div
            style={{ cursor: "pointer" }}
            onClick={() =>
              (user.role === "Admin" ||
                (user.role !== "Admin" && !Buttons.includes("Transporter"))) &&
              history.push({
                pathname: "/master/transporter-form",
                state: { pk: row.original.pk, allDetails: row.original },
              })
            }
          >
            <span title={row.original.remarks}>{row.original.name}</span>
          </div>
        );
      },
    },
    {
      Header: <b style={{ color: "#2A5FA5" }}>Transporter Location</b>,
      sortable: false,
      accessor: "location",
      style: {
        textAlign: "center",
      },
      Cell: (row) => {
        return (
          <div
            style={{ cursor: "pointer" }}
            onClick={() =>
              (user.role === "Admin" ||
                (user.role !== "Admin" && !Buttons.includes("Transporter"))) &&
              history.push({
                pathname: "/master/transporter-form",
                state: { pk: row.original.pk, allDetails: row.original },
              })
            }
          >
            <span title={row.original.remarks}>{row.original.location}</span>
          </div>
        );
      },
    },
    {
      Header: <b style={{ color: "#2A5FA5" }}>Transporter Site</b>,
      sortable: false,
      accessor: "site",
      style: {
        textAlign: "center",
      },
      Cell: (row) => {
        return (
          <div
            style={{ cursor: "pointer" }}
            onClick={() =>
              (user.role === "Admin" ||
                (user.role !== "Admin" && !Buttons.includes("Transporter"))) &&
              history.push({
                pathname: "/master/transporter-form",
                state: { pk: row.original.pk, allDetails: row.original },
              })
            }
          >
            <span title={row.original.remarks}>{row.original.site}</span>
          </div>
        );
      },
    },
  ];

  useEffect(() => {
    let data;
    if (disable === 1) {
      dispatch({ type: "TOGGLE_PAGE_NO_SEARCH_VALUE", payload: 1 });
    }
    data = {
      transporter_code: "",
      transporter_name: "",
      location: localStorage.getItem("location")
        ? localStorage.getItem("location")
        : null,
      site: localStorage.getItem("site") ? localStorage.getItem("site") : null,
      pg_no: currentPage === 1 ? 1 : store.stocksAndAllotmentSearch.pg_no,
      on_page_data: store.stocksAndAllotmentSearch.on_page_data,
    };
    dispatch(getTransporterListings(data,notify));
  }, [
    store.stocksAndAllotmentSearch.pg_no,
    store.stocksAndAllotmentSearch.on_page_data,
  ]);

  const handleButtonClick = () => {
    dispatch({ type: "CLEAN_TRANSPORTER_MASTER" });
    history.push("/master/transporter-form");
  };

  const deleteSelected = () => {
   let data = {
      transporter_code: "",
      transporter_name: "",
      location: localStorage.getItem("location")
        ? localStorage.getItem("location")
        : null,
      site: localStorage.getItem("site") ? localStorage.getItem("site") : null,
      pg_no: currentPage === 1 ? 1 : store.stocksAndAllotmentSearch.pg_no,
      on_page_data: store.stocksAndAllotmentSearch.on_page_data,
    };
    dispatch(deleteTransporterListings(clientMaster.check, notify, data));
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
      rowArray={Columns}
      masterArray={transporterMaster.allTransporterListing}
      buttonName={"Transporter"}
      buttonClick={handleButtonClick}
      deleteSelected={deleteSelected}
      currentPage={currentPage}
      prevPage={prevStockPage}
      nextPage={nextStockPage}
      prevStockPage={setPrevStockPage}
      nextStockPage={setNextStockPage}
      handleOnRowsChange={handleOnRowsChange}
      disable={disable}
    />
  );
};

export default TransporterListing;
