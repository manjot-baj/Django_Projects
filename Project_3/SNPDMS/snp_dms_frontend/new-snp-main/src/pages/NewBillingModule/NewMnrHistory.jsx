import React from "react";
import LayoutContainer from "@components/reusablecomponents/LayoutContainer";
import { useState, useEffect } from "react";
import {
  Grid,
  Button,
  MenuItem,
  Box,
  Modal,
  Backdrop,
  CircularProgress,
  Chip,
} from "@mui/material";
import {
  TableAdvanceSearch,
  TableCellText,
  TableCustomAdvanceReactTable,
  TableCustomPaginationReactTable,
  TableCustomSearchBar,
  TableHeading,
  TablePageTitle,
  TableRefreshIcon,
} from "../../components/TableComponent/TableComponent";
import { jwtDecode } from "jwt-decode";
import { useDispatch, useSelector } from "react-redux";
import { useSnackbar } from "notistack";
import { getAllMNRHistoryAction } from "../../actions/NewBillingActions";
import { useHistory } from "react-router-dom";
import ClearIcon from "@mui/icons-material/Clear";
import { NEWBILLING_REDUCER } from "../../reducers/NewBillingReducer";
import MNRInvoiceSearch from "./MNRInvoiceSearch";
import { Link } from "react-router-dom";
import { custombackDropStyle } from "../../utils/CustomClasses";
import { theme } from "@/App";

const NewMnrHistory = () => {
  const store = useSelector((state) => state);
  const { ui, newBilling } = store;

  const history = useHistory();
  const dispatch = useDispatch();
  const [currentPage, setCurrentPage] = useState(1);
  const notify = useSnackbar().enqueueSnackbar;
  const [name, setName] = useState("Client");
  const [filterType, setFilterType] = useState("");
  const [open, setOpen] = React.useState(false);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(!open);
  // const [stocksAvailableList, setStocksAvailableList] = useState([]);

  useEffect(() => {
    dispatch({
      type: NEWBILLING_REDUCER.GET_ALL_MNR_HISTORY,
      payload: {
        pg_no: 1,
        on_page_data_edit: 5,
        no_of_data: 0,
        total_pages: 1,
        prev_page: "",
        next_page: "",
        client: "",
        container_no: "",
        invoice_date: {
          from: "",
          to: "",
        },
        invoice_no: "",
      },
    });
    dispatch(getAllMNRHistoryAction("", notify));
  }, []);

  const handleRefresh = () => {
    dispatch({
      type: NEWBILLING_REDUCER.GET_ALL_MNR_HISTORY,
      payload: {
        pg_no: 1,
        on_page_data_edit: 5,
        no_of_data: 0,
        total_pages: 1,
        prev_page: "",
        next_page: "",
        client: "",
        container_no: "",
        invoice_date: {
          from: "",
          to: "",
        },
        invoice_no: "",
      },
    });
    dispatch(getAllMNRHistoryAction("", notify));
  };

  const handleInitialPage = () => {
    dispatch({
      type: NEWBILLING_REDUCER.GET_ALL_MNR_HISTORY,
      payload: {
        pg_no: 1,
      },
    });
    dispatch(getAllMNRHistoryAction("", notify));
  };

  const handlePaginationOnChange = (e, val) => {
    dispatch({
      type: NEWBILLING_REDUCER.GET_ALL_MNR_HISTORY,
      payload: {
        pg_no: val,
      },
    });
    dispatch(getAllMNRHistoryAction("", notify));
  };

  const handleOnPageDataChange = (value) => {
    dispatch({
      type: NEWBILLING_REDUCER.GET_ALL_MNR_HISTORY,
      payload: {
        on_page_data_edit: value,
      },
    });
    dispatch(getAllMNRHistoryAction("", notify));
  };

  const handleCloseClick = () => {
    setFilterType("");
  };

  const handleSearchClick = () => {
    getData();
  };

  const Columns = [
    {
      Header: <TableHeading filter>Container No</TableHeading>,
      accessor: "container_no",
      style: {
        textAlign: "center",
        cursor: "pointer",
      },
      Cell: (row) => {
        return (
          <div
            onClick={() =>
              history.push({
                pathname: "/billing/new-billing/collect-invoice-new",
                state: {
                  pk: row.original.pk,
                  allDetails: { pk: row.original.pk },
                  mnr: true,
                },
              })
            }
          >
            <Chip
              label={row.original.container_no}
              variant="filled"
              size="medium"
              color="default"
            />
          </div>
        );
      },
    },
    {
      Header: <TableHeading filter> Invoice Number</TableHeading>,
      accessor: "invoice_no",
      minWidth: 240,
      style: {
        textAlign: "center",
        cursor: "pointer",
      },

      Cell: (row) => {
        return (
          <TableCellText
            onClick={() =>
              history.push({
                pathname: "/billing/new-billing/collect-invoice-new",
                state: {
                  pk: row.original.pk,
                  allDetails: row.original,
                  mnr: true,
                },
              })
            }
            title={row.original}
          >
            {row.original.invoice_no}
          </TableCellText>
        );
      },
    },
    {
      Header: <TableHeading filter> Invoice Date</TableHeading>,
      accessor: "invoice_date",
      style: {
        textAlign: "center",
        cursor: "pointer",
      },
      Cell: (row) => {
        return (
          <TableCellText
            title={row.original.remarks}
            onClick={() =>
              history.push({
                pathname: "/billing/new-billing/collect-invoice-new",
                state: {
                  pk: row.original.pk,
                  allDetails: row.original,
                  mnr: true,
                },
              })
            }
          >
            {row.original.invoice_date}
          </TableCellText>
        );
      },
    },
    {
      Header: <TableHeading filter> Bill Type</TableHeading>,
      accessor: "bill_type",
      style: {
        textAlign: "center",
        cursor: "pointer",
      },
      Cell: (row) => {
        return (
          <TableCellText
            onClick={() =>
              history.push({
                pathname: "/billing/new-billing/collect-invoice-new",
                state: {
                  pk: row.original.pk,
                  allDetails: row.original,
                  mnr: true,
                },
              })
            }
            title={row.original.remarks}
          >
            {row.original.bill_type}
          </TableCellText>
        );
      },
    },
    {
      Header: <TableHeading filter> Client</TableHeading>,
      accessor: "client",
      style: {
        textAlign: "center",
        cursor: "pointer",
      },
      Cell: (row) => {
        return (
          <TableCellText
            onClick={() =>
              history.push({
                pathname: "/billing/new-billing/collect-invoice-new",
                state: {
                  pk: row.original.pk,
                  allDetails: row.original,
                  mnr: true,
                },
              })
            }
            title={row.original.remarks}
          >
            {row.original.client}
          </TableCellText>
        );
      },
    },
    {
      Header: <TableHeading filter> Total Amount</TableHeading>,
      accessor: "total_amount",
      style: {
        textAlign: "center",
        cursor: "pointer",
      },
      Cell: (row) => {
        return (
          <TableCellText
            onClick={() =>
              history.push({
                pathname: "/billing/new-billing/collect-invoice-new",
                state: {
                  pk: row.original.pk,
                  allDetails: row.original,
                  mnr: true,
                },
              })
            }
            title={row.original.remarks}
            style={{ color: theme.palette.success.main }}
          >
            {row.original.total_amount}
          </TableCellText>
        );
      },
    },
    {
      Header: <TableHeading filter> Credit Note</TableHeading>,
      style: {
        textAlign: "center",
        cursor: "pointer",
      },
      Cell: (row) => {
        return (
          row.original?.credit_note === false && (
            <Link
              to={{
                pathname: "/billing/credit-notes",
                state: {
                  invoice_no: row.original.invoice_no,
                  bill_type: "Repair/Washing",
                },
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <Button size="small" variant="outlined" color="secondary">
                Credit Note
              </Button>
            </Link>
          )
        );
      },
    },
    {
      Header: <TableHeading>View</TableHeading>,
      Cell: (row) => (
        <Button
          onClick={() =>
            history.push({
              pathname: "/billing/new-billing/collect-invoice-new",
              state: {
                pk: row.original.pk,
                allDetails: row.original,
                mnr: true,
              },
            })
          }
          size="small"
          variant="contained"
          color="primary"
        >
          View Bill
        </Button>
      ),
    },
  ];

  // Check if the token is expired if yes then push to login
  useEffect(() => {
    var token = localStorage.getItem("accessToken");
    if (token) {
      var decode = jwtDecode(token);

      if (decode.exp < new Date().getTime() / 1000) {
        history.push("/login");
      }
    } else {
      history.push("/login");
    }
  }, []);

  const updateName = (event) => {
    setFilterType("");
    dispatch({
      type: NEWBILLING_REDUCER.GET_ALL_MNR_HISTORY,
      payload: {
        client: "",
        container_no: "",
        invoice_no: "",
      },
    });
    setName(event.target.value);
  };

  const getData = () => {
    dispatch({
      type: NEWBILLING_REDUCER.GET_ALL_MNR_HISTORY,
      payload: {
        pg_no: 1,
      },
    });
    setCurrentPage(1);
    dispatch(getAllMNRHistoryAction("", notify));
  };

  const setDispatchType = (e) => {
    setFilterType(e.target.value);
    if (name === "Container Number") {
      dispatch({
        type: NEWBILLING_REDUCER.GET_ALL_MNR_HISTORY,
        payload: {
          client: "",
          container_no: e.target.value,
          invoice_no: "",
        },
      });
    } else if (name === "Client") {
      dispatch({
        type: NEWBILLING_REDUCER.GET_ALL_MNR_HISTORY,
        payload: {
          client: e.target.value,
          container_no: "",
          invoice_no: "",
        },
      });
    } else {
      dispatch({
        type: NEWBILLING_REDUCER.GET_ALL_MNR_HISTORY,
        payload: {
          client: "",
          container_no: "",
          invoice_no: e.target.value,
        },
      });
    }
  };

  const handleChipDeleteClient = () => {
    dispatch({
      type: NEWBILLING_REDUCER.GET_ALL_MNR_HISTORY,
      payload: {
        client: "",
        pg_no: 1,
      },
    });
    dispatch(getAllMNRHistoryAction("", notify));
  };
  const handleChipDeleteContainer = () => {
    dispatch({
      type: NEWBILLING_REDUCER.GET_ALL_MNR_HISTORY,
      payload: {
        container_no: "",
        pg_no: 1,
      },
    });
    dispatch(getAllMNRHistoryAction("", notify));
  };
  const handleChipDeleteInvoiceNo = () => {
    dispatch({
      type: NEWBILLING_REDUCER.GET_ALL_MNR_HISTORY,
      payload: {
        invoice_no: "",
        pg_no: 1,
      },
    });
    dispatch(getAllMNRHistoryAction("", notify));
  };
  const handleChipDeleteDate = () => {
    dispatch({
      type: NEWBILLING_REDUCER.GET_ALL_MNR_HISTORY,
      payload: {
        invoice_date: {
          from: "",
          to: "",
        },
        pg_no: 1,
      },
    });
    dispatch(getAllMNRHistoryAction("", notify));
  };

  return (
    <LayoutContainer footer={false}>
      <Box
        sx={(theme) => ({
          paddingX: 2,
          [theme.breakpoints.down("sm")]: {
            paddingX: 1,
          },
        })}
      >
        <div>
          <Grid container>
            <Grid item size={{ xs: 12 }}>
              <Modal open={open} onClose={handleClose}>
                <Box
                  sx={{
                    top: "20%",
                    position: "absolute",
                    background: "#FFF",
                    width: "85%",
                    height: "60%",
                    margin: "auto",
                    left: "10%",
                    padding: "15px 25px",
                    pointerEvents: "painted",
                  }}
                >
                  <Grid
                    sx={{
                      float: "right",
                      cursor: "pointer",
                    }}
                  >
                    {" "}
                    <ClearIcon onClick={handleClose} />
                  </Grid>
                  <MNRInvoiceSearch
                    handleClose={handleClose}
                    setCurrentPage={setCurrentPage}
                  />
                </Box>
              </Modal>

              <Grid container spacing={4} style={{ marginBottom: 24 }}>
                <Grid
                  item
                  size={{ xs: 12 }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "flex-start",
                  }}
                >
                  <TablePageTitle default>MNR History</TablePageTitle>
                </Grid>
                <Grid
                  item
                  size={{ xs: 12, sm: 6, md: 6, lg: 6 }}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "flex-start",
                    gap: 2,
                  }}
                >
                  <TableCustomSearchBar
                    selectName={name}
                    updateSelectname={updateName}
                    searchText={filterType}
                    setSearchText={setDispatchType}
                    closeClick={handleCloseClick}
                    searchClick={handleSearchClick}
                    maxWidthSearch={"70%"}
                  >
                    <MenuItem value={"Client"}>
                      &nbsp; &nbsp;&nbsp;Client
                    </MenuItem>
                    <MenuItem value={"Invoice Number"}>
                      &nbsp; &nbsp;&nbsp;Invoice Number
                    </MenuItem>
                    <MenuItem value={"Container Number"}>
                      &nbsp; &nbsp;&nbsp;Container Number
                    </MenuItem>
                  </TableCustomSearchBar>
                  <TableAdvanceSearch
                    onClick={handleOpen}
                    style={{ width: "fit-content" }}
                  />
                </Grid>
                <Grid
                  item
                  size={{ xs: 12, sm: 6, md: 6, lg: 6 }}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "flex-end",
                    gap: 1,
                  }}
                >
                  {newBilling.mnr_history.invoice_date.from !== "" &&
                    newBilling.mnr_history.invoice_date.to !== "" && (
                      <Chip
                        size="small"
                        variant="outlined"
                        color="primary"
                        label={`${newBilling.mnr_history.invoice_date.from} / ${newBilling.mnr_history.invoice_date.to} `}
                        onDelete={handleChipDeleteDate}
                      />
                    )}
                  {newBilling.mnr_history.invoice_no !== "" && (
                    <Chip
                      size="small"
                      variant="outlined"
                      color="primary"
                      label={` ${newBilling.mnr_history.invoice_no}`}
                      onDelete={handleChipDeleteInvoiceNo}
                    />
                  )}
                  {newBilling.mnr_history.container_no !== "" && (
                    <Chip
                      size="small"
                      variant="outlined"
                      color="primary"
                      label={` ${newBilling.mnr_history.container_no}`}
                      onDelete={handleChipDeleteContainer}
                    />
                  )}
                  {newBilling.mnr_history.client !== "" && (
                    <Chip
                      size="small"
                      variant="outlined"
                      color="primary"
                      label={`Client - ${newBilling.mnr_history.client}`}
                      onDelete={handleChipDeleteClient}
                    />
                  )}
                  <TableRefreshIcon onClick={handleRefresh} />
                </Grid>
              </Grid>
              <TableCustomAdvanceReactTable
                data={
                  newBilling.mnr_history.data && newBilling.mnr_history.data
                }
                columns={[...Columns]}
                minRows={Number(newBilling.mnr_history.on_page_data)}
                pageSize={Number(newBilling.mnr_history.on_page_data)}
                defaultPageSize={Number(newBilling.mnr_history.on_page_data)}
              />

              <TableCustomPaginationReactTable
                pg_no={newBilling.mnr_history.pg_no}
                total_pages={newBilling.mnr_history.total_pages}
                handleInitialPage={handleInitialPage}
                setCurrentPage={setCurrentPage}
                on_page_data={newBilling.mnr_history.on_page_data}
                next_page={newBilling.mnr_history.next_page}
                handleOnPageDataChange={handleOnPageDataChange}
                handlePaginationOnChange={handlePaginationOnChange}
              />
            </Grid>
          </Grid>
        </div>
      </Box>
      <Backdrop sx={custombackDropStyle} open={ui.isloading}>
        <CircularProgress color="inherit" />
      </Backdrop>
    </LayoutContainer>
  );
};

export default NewMnrHistory;
