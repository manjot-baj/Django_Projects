import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  getClientListing,
  deleteClientListings,
} from "@/actions/master/ClientMasterActions";
import MasterListings from "@components/reusablecomponents/MasterListings";
import Checkbox from "@components/reusablecomponents/ReusableCheckbox";
import { useSnackbar } from "notistack";
import {
  TableCellText,
  TableCustomPaginationReactTable,
  TableHeading,
} from "@/components/TableComponent/TableComponent";
const ClientListing = () => {
  const dispatch = useDispatch();
  const store = useSelector((state) => state);
  const { clientMaster, user } = store;
  const history = useHistory();
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
      Header: <TableHeading filter>Sr no</TableHeading>,
      accessor: "sr_no",
      style: {
        textAlign: "center",
        cursor: "pointer",
      },
      Cell: (row) => {
        return (
          <TableCellText title={row.original.sr_no}>
            {row.original.sr_no}
          </TableCellText>
        );
      },
    },
    {
      Header: <TableHeading filter>Client Code</TableHeading>,
      accessor: "code",
      style: {
        textAlign: "center",
        cursor: "pointer",
      },
      Cell: (row) => {
        return (
          <div>
            <TableCellText title={row.original}>
              {row.original.code}
            </TableCellText>
          </div>
        );
      },
    },
    {
      Header: <TableHeading>Client Name</TableHeading>,
      accessor: "name",
      style: {
        textAlign: "left",
        cursor: "pointer",
      },
      Cell: (row) => {
        return (
          <div>
            <TableCellText title={row.original.remarks}>
              {row.original.name}
            </TableCellText>
          </div>
        );
      },
    },
    {
      Header: <TableHeading filter>Client Person</TableHeading>,

      accessor: "contact_person",
      style: {
        textAlign: "center",
        cursor: "pointer",
      },
      Cell: (row) => {
        return (
          <div>
            <TableCellText title={row.original.remarks}>
              {row.original.contact_person}
            </TableCellText>
          </div>
        );
      },
    },
    {
      Header: <TableHeading>Mobile</TableHeading>,
      sortable: false,
      accessor: "mobile_no",
      style: {
        textAlign: "center",
        cursor: "pointer",
      },
      Cell: (row) => {
        return (
          <div>
            <TableCellText title={row.original.remarks}>
              {row.original.mobile_no}
            </TableCellText>
          </div>
        );
      },
    },
    {
      Header: <TableHeading filter>Email Id</TableHeading>,
      accessor: "email_id",
      style: {
        textAlign: "center",
        cursor: "pointer",
      },
      Cell: (row) => {
        return (
          <div>
            <TableCellText title={row.original.remarks}>
              {row.original.email_id}
            </TableCellText>
          </div>
        );
      },
    },
    {
      Header: <TableHeading>Type</TableHeading>,
      sortable: false,
      accessor: "type",
      style: {
        textAlign: "center",
        cursor: "pointer",
      },
      Cell: (row) => {
        return (
          <div>
            <TableCellText title={row.original.remarks}>
              {row.original.type}
            </TableCellText>
          </div>
        );
      },
    },
    {
      Header: <TableHeading>SEZ</TableHeading>,
      sortable: false,
      accessor: "type",
      style: {
        textAlign: "center",
        cursor: "pointer",
      },
      Cell: (row) => {
        return (
          <div>
            <TableCellText title={row.original.is_sez}>
              {row.original.is_sez ? "Yes" : "No"}
            </TableCellText>
          </div>
        );
      },
    },
    {
      Header: <TableHeading>Location</TableHeading>,
      sortable: false,
      accessor: "location",
      style: {
        textAlign: "center",
        cursor: "pointer",
      },
      Cell: (row) => {
        return (
          <div>
            <TableCellText title={row.original.remarks}>
              {row.original.location}
            </TableCellText>
          </div>
        );
      },
    },
    {
      Header: <TableHeading>Site</TableHeading>,
      sortable: false,
      accessor: "site",

      style: {
        textAlign: "center",
        cursor: "pointer",
      },
      Cell: (row) => {
        return (
          <div>
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
      (user.role !== "Admin" && !Buttons.includes("Client"))) &&
      history.push({
        pathname: "/master/client/form",
        state: { pk: rowInfo.original.pk, allDetails: rowInfo.original },
      });
  };

  useEffect(() => {
    dispatch({
      type: "SET_CLIENT_NAME",
      payload: "",
    });
    dispatch({
      type: "SET_CLIENT_REF_CODE",
      payload: "",
    });
    dispatch({
      type: "SET_CLIENT_TYPE",
      payload: "",
    });
  }, []);

  useEffect(() => {
    dispatch(getClientListing(notify));
  }, [clientMaster.pg_no, clientMaster.on_page_data]);

  const handleButtonClick = () => {
    history.push("/master/client/form");
  };

  const deleteSelected = () => {
    dispatch(deleteClientListings(clientMaster.check, notify));
  };

  const handleOnRowsChange = (e) => {
    setCurrentPage(1);
    dispatch({
      type: "CLIENT_MASTER_SET_PG_NO",
      payload: 1,
    });
    dispatch({
      type: "CLIENT_MASTER_SET_ON_PAGE_VALUE",
      payload: e.target.value,
    });
  };

  const handleOnPageDataChange = (value) => {
    setCurrentPage(1);
    dispatch({
      type: "CLIENT_MASTER_SET_PG_NO",
      payload: 1,
    });
    dispatch({
      type: "CLIENT_MASTER_SET_ON_PAGE_VALUE",
      payload: value,
    });
  };

  const handleInitialPage = () => {
    dispatch({
      type: "CLIENT_MASTER_SET_PG_NO",
      payload: 1,
    });
    setCurrentPage(1);
  };

  const handlePaginationOnChange = (e, val) => {
    dispatch({
      type: "CLIENT_MASTER_SET_PG_NO",
      payload: val,
    });
    setCurrentPage(val);
  };

  return (
    <MasterListings
      rowArray={Columns}
      masterArray={clientMaster.allClientListing}
      buttonName={"Client"}
      buttonClick={handleButtonClick}
      deleteSelected={deleteSelected}
      currentPage={currentPage}
      handleOnRowsChange={handleOnRowsChange}
      handleInitialPage={handleInitialPage}
      handleOnPageDataChange={handleOnPageDataChange}
      handlePaginationOnChange={handlePaginationOnChange}
      handleCellClick={handleClickGoToClient}
      handleCustomPagination={
        <TableCustomPaginationReactTable
          total_pages={clientMaster.total_pages}
          pg_no={clientMaster.pg_no}
          handleInitialPage={handleInitialPage}
          handleOnPageDataChange={handleOnPageDataChange}
          handlePaginationOnChange={handlePaginationOnChange}
          next_page={clientMaster.nextPage}
          on_page_data={clientMaster.on_page_data}
        />
      }
    />
  );
};

export default ClientListing;
