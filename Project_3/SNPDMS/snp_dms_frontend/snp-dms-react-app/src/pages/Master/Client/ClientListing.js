import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  getClientListing,
  deleteClientListings,
} from "../../../actions/Master/ClientMasterActions";
import MasterListings from "../../../components/reusableComponents/MasterListings";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSort } from "@fortawesome/free-solid-svg-icons";
import Checkbox from "../../../components/reusableComponents/Checkbox";
import { useSnackbar } from "notistack";
const ClientListing = () => {
  const dispatch = useDispatch();
  const store = useSelector((state) => state);
  const { clientMaster, user } = store;
  const history = useHistory();
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
          Client Code
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
                (user.role !== "Admin" && !Buttons.includes("Client"))) &&
              history.push({
                pathname: "/master/client-form",
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
          Client Name <FontAwesomeIcon icon={faSort} />
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
                (user.role !== "Admin" && !Buttons.includes("Client"))) &&
              history.push({
                pathname: "/master/client-form",
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
      Header: (
        <b style={{ color: "#2A5FA5" }}>
          Contact Person <FontAwesomeIcon icon={faSort} />
        </b>
      ),

      accessor: "contact_person",
      style: {
        textAlign: "center",
      },
      Cell: (row) => {
        return (
          <div
            style={{ cursor: "pointer" }}
            onClick={() =>
              (user.role === "Admin" ||
                (user.role !== "Admin" && !Buttons.includes("Client"))) &&
              history.push({
                pathname: "/master/client-form",
                state: { pk: row.original.pk, allDetails: row.original },
              })
            }
          >
            <span title={row.original.remarks}>
              {row.original.contact_person}
            </span>
          </div>
        );
      },
    },
    {
      Header: <b style={{ color: "#2A5FA5" }}>Mobile</b>,
      sortable: false,
      accessor: "mobile_no",
      style: {
        textAlign: "center",
      },
      Cell: (row) => {
        return (
          <div
            style={{ cursor: "pointer" }}
            onClick={() =>
              (user.role === "Admin" ||
                (user.role !== "Admin" && !Buttons.includes("Client"))) &&
              history.push({
                pathname: "/master/client-form",
                state: { pk: row.original.pk, allDetails: row.original },
              })
            }
          >
            <span title={row.original.remarks}>{row.original.mobile_no}</span>
          </div>
        );
      },
    },
    {
      Header: (
        <b style={{ color: "#2A5FA5" }}>
          Email ID <FontAwesomeIcon icon={faSort} />
        </b>
      ),
      accessor: "email_id",
      style: {
        textAlign: "center",
      },
      Cell: (row) => {
        return (
          <div
            style={{ cursor: "pointer" }}
            onClick={() =>
              (user.role === "Admin" ||
                (user.role !== "Admin" && !Buttons.includes("Client"))) &&
              history.push({
                pathname: "/master/client-form",
                state: { pk: row.original.pk, allDetails: row.original },
              })
            }
          >
            <span title={row.original.remarks}>{row.original.email_id}</span>
          </div>
        );
      },
    },
    {
      Header: <b style={{ color: "#2A5FA5" }}>Type</b>,
      sortable: false,
      accessor: "type",
      style: {
        textAlign: "center",
      },
      Cell: (row) => {
        return (
          <div
            style={{ cursor: "pointer" }}
            onClick={() =>
              (user.role === "Admin" ||
                (user.role !== "Admin" && !Buttons.includes("Client"))) &&
              history.push({
                pathname: "/master/client-form",
                state: { pk: row.original.pk, allDetails: row.original },
              })
            }
          >
            <span title={row.original.remarks}>{row.original.type}</span>
          </div>
        );
      },
    },
    {
      Header: <b style={{ color: "#2A5FA5" }}>Location</b>,
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
                (user.role !== "Admin" && !Buttons.includes("Client"))) &&
              history.push({
                pathname: "/master/client-form",
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
      Header: <b style={{ color: "#2A5FA5" }}>Site</b>,
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
                (user.role !== "Admin" && !Buttons.includes("Client"))) &&
              history.push({
                pathname: "/master/client-form",
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
      client_name: clientMaster.client_name,
      ref_code: clientMaster.ref_code,
      location: localStorage.getItem("location")
        ? localStorage.getItem("location")
        : null,
      site: localStorage.getItem("site") ? localStorage.getItem("site") : null,
      type: clientMaster.type,
      pg_no: disable === 1 ? 1 : store.stocksAndAllotmentSearch.pg_no,
      on_page_data: store.stocksAndAllotmentSearch.on_page_data,
    };
    dispatch(getClientListing(data,notify));
  }, [
    store.stocksAndAllotmentSearch.pg_no,
    store.stocksAndAllotmentSearch.on_page_data,
  ]);

  const handleButtonClick = () => {
    history.push("/master/client-form");
  };

  const deleteSelected = () => {
    let data = {
      client_name: clientMaster.client_name,
      ref_code: clientMaster.ref_code,
      location: localStorage.getItem("location")
        ? localStorage.getItem("location")
        : null,
      site: localStorage.getItem("site") ? localStorage.getItem("site") : null,
      type: clientMaster.type,
      pg_no: disable === 1 ? 1 : store.stocksAndAllotmentSearch.pg_no,
      on_page_data: store.stocksAndAllotmentSearch.on_page_data,
    };
    dispatch(deleteClientListings(clientMaster.check, notify, data));
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

  return (
    <MasterListings
      rowArray={Columns}
      masterArray={clientMaster.allClientListing}
      buttonName={"Client"}
      buttonClick={handleButtonClick}
      deleteSelected={deleteSelected}
      currentPage={currentPage}
      handleOnRowsChange={handleOnRowsChange}
      prevPage={prevStockPage}
      nextPage={nextStockPage}
      prevStockPage={setPrevStockPage}
      nextStockPage={setNextStockPage}
      changePageCount={changePageCount}
      disable={disable}
    />
  );
};

export default ClientListing;