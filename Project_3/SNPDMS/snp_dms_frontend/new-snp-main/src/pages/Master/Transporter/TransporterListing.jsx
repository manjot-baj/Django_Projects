import React, { useEffect, useState } from "react";
import { useSnackbar } from "notistack";
import { useHistory } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  getTransporterListings,
  deleteTransporterListings,
} from "../../../actions/master/TransporterMasterActions";
import MasterListings from "@components/reusablecomponents/MasterListings";
import Checkbox from "@components/reusablecomponents/ReusableCheckbox";
import {
  TableCellText,
  TableHeading,
} from "@/components/TableComponent/TableComponent";

const TransporterListing = () => {
  const dispatch = useDispatch();
  const history = useHistory();
  const store = useSelector((state) => state);
  const { transporterMaster, clientMaster, user } = store;
  const notify = useSnackbar().enqueueSnackbar;
  const [currentPage, setCurrentPage] = useState(1);

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
      Header: <TableHeading filter>Sr No</TableHeading>,
      accessor: "sr_no",
      style: {
        textAlign: "center",
        cursor: "pointer"
      },
      Cell: (row) => {
        return (
          <div >
            <TableCellText title={row.original.sr_no}>
              {row.original.sr_no}
            </TableCellText>
          </div>
        );
      },
    },
    {
      Header: <TableHeading filter>Transporter code</TableHeading>,
      accessor: "code",
      style: {
        textAlign: "center",
        cursor: "pointer"
      },
      Cell: (row) => {
        return (
          <div
        
          >
            <TableCellText title={row.original}>
              {row.original.code}
            </TableCellText>
          </div>
        );
      },
    },
    {
      Header: <TableHeading filter>Transporter Name</TableHeading>,
      accessor: "name",
      style: {
        textAlign: "left",
        cursor: "pointer"
      },
      Cell: (row) => {
        return (
          <div
            style={{ cursor: "pointer" }}
           
          >
            <TableCellText title={row.original.remarks}>
              {row.original.name}
            </TableCellText>
          </div>
        );
      },
    },
    {
      Header: <TableHeading filter>Transporter Location</TableHeading>,
      sortable: false,
      accessor: "location",
      style: {
        textAlign: "center",
        cursor: "pointer"
      },
      Cell: (row) => {
        return (
          <div
         
          >
            <TableCellText title={row.original.remarks}>
              {row.original.location}
            </TableCellText>
          </div>
        );
      },
    },
    {
      Header: <TableHeading filter>Transporter Site</TableHeading>,
      sortable: false,
      accessor: "site",
      style: {
        textAlign: "center",
        cursor: "pointer"
      },
      Cell: (row) => {
        return (
          <div
         
          >
            <TableCellText title={row.original.remarks}>
              {row.original.site}
            </TableCellText>
          </div>
        );
      },
    },
  ];

  const handleClickGoToClient = (rowInfo, column) => {
    (user.role === "Admin" ||
      (user.role !== "Admin" && !Buttons.includes("Transporter"))) &&
      history.push({
        pathname: "/master/transporter/form",
        state: { pk: rowInfo.original.pk, allDetails: rowInfo.original },
      });
  };

  useEffect(() => {
    let data;

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
    dispatch(getTransporterListings(data, notify));
  }, [
    store.stocksAndAllotmentSearch.pg_no,
    store.stocksAndAllotmentSearch.on_page_data,
  ]);

  const handleButtonClick = () => {
    dispatch({ type: "CLEAN_TRANSPORTER_MASTER" });
    history.push("/master/transporter/form");
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
      rowArray={Columns}
      masterArray={transporterMaster.allTransporterListing}
      buttonName={"Transporter"}
      buttonClick={handleButtonClick}
      deleteSelected={deleteSelected}
      currentPage={currentPage}
      handleInitialPage={handleInitialPage}
      handleOnPageDataChange={handleOnPageDataChange}
      handlePaginationOnChange={handlePaginationOnChange}
      handleCellClick={handleClickGoToClient}
    />
  );
};

export default TransporterListing;
