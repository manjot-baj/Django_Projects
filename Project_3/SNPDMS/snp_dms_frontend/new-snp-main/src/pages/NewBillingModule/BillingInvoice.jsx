import { jwtDecode } from "jwt-decode";
import LayoutContainer from "@components/reusablecomponents/LayoutContainer";
import React, { useState, useEffect } from "react";
import {
  Grid,
  MenuItem,
  Box,
  Modal,
  Backdrop,
  CircularProgress,
  Button,
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
import { useDispatch, useSelector } from "react-redux";
import BillingInvoiceSearch from "./BillingInvoiceSearch";

import { useSnackbar } from "notistack";
import { getInvoiceNewBilling } from "../../actions/NewBillingActions";
import { useHistory } from "react-router-dom";
import ClearIcon from "@mui/icons-material/Clear";

import { Link } from "react-router-dom";
import { customLabelTypography } from "../../utils/CustomClasses";
import { theme } from "@/App";

const BillingInvoice = (props) => {
  const store = useSelector((state) => state);
  const { ui, newBilling } = store;

  const history = useHistory();
  const dispatch = useDispatch();
  const [currentPage, setCurrentPage] = useState(1);

  const notify = useSnackbar().enqueueSnackbar;
  const [name, setName] = useState("Bill Type");
  const [filterType, setFilterType] = useState("");
  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(!open);
  const [stocksAvailableList, setStocksAvailableList] = useState([]);

  useEffect(() => {
    dispatch({
      type: "GET_BILLING_CONTAINER_NO_NEW",
      payload: "",
    });
    dispatch({
      type: "GET_BILLING_BILL_TYPE_NEW",
      payload: "",
    });
    dispatch({
      type: "GET_BILLING_INVOICE_NO_NEW",
      payload: "",
    });
  }, []);

  useEffect(() => {
    setStocksAvailableList(newBilling && newBilling.allInvoiceHistoryNew);
  }, [
    newBilling.allInvoiceHistoryNew,
    newBilling.next_page,
    newBilling.prev_page,
    newBilling.getInvoiceNewBilling,
  ]);

  useEffect(() => {
    dispatch(getInvoiceNewBilling(notify));
  }, [
    store.newBilling.pg_no,
    store.newBilling.on_page_data,
    store.newBilling.client,
    store.newBilling.container_no,
    store.newBilling.invoice_no,
    store.newBilling.bill_type,
  ]);

  useEffect(() => {
    dispatch({ type: "RESET_STOCK_ALLOTMENT_DATA" });
  }, []);

  const Columns = [
    {
      Header: <TableHeading filter>Container No</TableHeading>,
      accessor: "container_no",
      minWidth: 120,
      style: {
        textAlign: "center",
        cursor: "pointer",
        border: "none",
      },
      Cell: (row) => {
        return (
          <div
            onClick={() =>
              history.push({
                pathname: "/billing/new-billing/collect-invoice-new",
                state: { pk: row.original.pk, allDetails: row.original },
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
      Header: <TableHeading filter>Invoice Number</TableHeading>,
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
                state: { pk: row.original.pk, allDetails: row.original },
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
      Header: <TableHeading filter>Invoice Date</TableHeading>,
      accessor: "invoice_date",
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
                state: { pk: row.original.pk, allDetails: row.original },
              })
            }
            title={row.original.remarks}
          >
            {row.original.invoice_date}
          </TableCellText>
        );
      },
    },
    {
      Header: <TableHeading filter>Bill Type</TableHeading>,
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
                state: { pk: row.original.pk, allDetails: row.original },
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
      Header: <TableHeading filter>Client</TableHeading>,
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
                state: { pk: row.original.pk, allDetails: row.original },
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
      Header: <TableHeading filter>Total Amount</TableHeading>,
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
                state: { pk: row.original.pk, allDetails: row.original },
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
      Header: <TableHeading filter>Credit Note</TableHeading>,
      style: {
        textAlign: "center",
        cursor: "pointer",
      },
      Cell: (row) => {
        return (
          <Box>
            {" "}
            {row.original?.credit_note === false && (
              <Link
                to={{
                  pathname: "/billing/credit-notes",
                  state: {
                    invoice_no: row.original.invoice_no,
                    bill_type: "Other",
                  },
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <Button size="small" variant="outlined" color="secondary">
                  Credit Note
                </Button>
              </Link>
            )}
          </Box>
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
              state: { pk: row.original.pk, allDetails: row.original },
            })
          }
          variant="contained"
          color="primary"
          size="small"
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
    dispatch({ type: "GET_BILLING_BILL_TYPE_NEW", payload: "" });
    dispatch({ type: "GET_BILLING_INVOICE_NO_NEW", payload: "" });
    dispatch({ type: "GET_BILLING_CONTAINER_NO_NEW", payload: "" });
    setName(event.target.value);
  };

  const getData = () => {
    dispatch(getInvoiceNewBilling(notify));
    dispatch({
      type: "GET_NEW_BILLING_PAGE_NO",
      payload: 1,
    });
  };

  const setDispatchType = (e) => {
    setFilterType(e.target.value);
    if (name === "Container Number") {
      dispatch({
        type: "GET_BILLING_CONTAINER_NO_NEW",
        payload: e.target.value,
      });
    } else if (name === "Bill Type") {
      dispatch({
        type: "GET_BILLING_BILL_TYPE_NEW",
        payload: e.target.value,
      });
    } else {
      dispatch({
        type: "GET_BILLING_INVOICE_NO_NEW",
        payload: e.target.value,
      });
    }
  };
  const handleCloseClick = () => {
    setFilterType("");
  };

  const handleSearchClick = () => {
    getData();
  };

  const handlePaginationOnChange = (e, val) => {
    dispatch({
      type: "GET_NEW_BILLING_PAGE_NO",
      payload: val,
    });
  };

  const handleInitialPage = () => {
    dispatch({
      type: "GET_NEW_BILLING_PAGE_NO",
      payload: 1,
    });
  };

  const handleOnPageDataChange = (value) => {
    dispatch({
      type: "GET_NEW_BILLING_ON_PAGE_DATA",
      payload: value,
    });
  };

  const handleChipDeleteClient = () => {
    dispatch({
      type: "GET_BILLING_CLIENT_NEW",
      payload: "",
    });
  };

  const handleChipDeleteContainer = () => {
    dispatch({
      type: "GET_BILLING_CONTAINER_NO_NEW",
      payload: "",
    });
  };

  const handleChipDeleteInvoiceNo = () => {
    dispatch({
      type: "GET_BILLING_INVOICE_NO_NEW",
      payload: "",
    });
  };

  const handleChipDeleteBillType = () => {
    dispatch({
      type: "GET_BILLING_BILL_TYPE_NEW",
      payload: "",
    });
  };

  return (
    <LayoutContainer>
      <Box
        sx={(theme) => ({
          paddingX: 2,
          [theme.breakpoints.down("sm")]: {
            paddingX: 1,
          },
        })}
      >
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
                <BillingInvoiceSearch handleClose={handleClose} />
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
                <TablePageTitle default>Invoice Billing</TablePageTitle>
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
                  maxWidthSearch={"60%"}
                >
                  <MenuItem value={"Bill Type"}>
                    &nbsp; &nbsp;&nbsp;Bill Type
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
                {newBilling.bill_type !== "" && (
                  <Chip
                    size="small"
                    variant="outlined"
                    color="primary"
                    label={` ${newBilling.bill_type}`}
                    onDelete={handleChipDeleteBillType}
                  />
                )}
                {newBilling.invoice_no !== "" && (
                  <Chip
                    size="small"
                    variant="outlined"
                    color="primary"
                    label={` ${newBilling.invoice_no}`}
                    onDelete={handleChipDeleteInvoiceNo}
                  />
                )}
                {newBilling.container_no !== "" && (
                  <Chip
                    size="small"
                    variant="outlined"
                    color="primary"
                    label={` ${newBilling.container_no}`}
                    onDelete={handleChipDeleteContainer}
                  />
                )}
                {newBilling.client !== "" && (
                  <Chip
                    size="small"
                    variant="outlined"
                    color="primary"
                    label={`Client - ${newBilling.client}`}
                    onDelete={handleChipDeleteClient}
                  />
                )}
                <TableRefreshIcon onClick={() => window.location.reload()} />
              </Grid>
            </Grid>

            <TableCustomAdvanceReactTable
              data={stocksAvailableList && stocksAvailableList}
              columns={[...Columns]}
              minRows={Number(store.newBilling.on_page_data)}
              pageSize={Number(store.newBilling.on_page_data)}
              defaultPageSize={Number(store.newBilling.on_page_data)}
            />
            <TableCustomPaginationReactTable
              pg_no={Number(newBilling.pg_no)}
              total_pages={Number(newBilling.total_pages)}
              handleInitialPage={handleInitialPage}
              setCurrentPage={setCurrentPage}
              on_page_data={newBilling.on_page_data}
              next_page={newBilling.next_page}
              handleOnPageDataChange={handleOnPageDataChange}
              handlePaginationOnChange={handlePaginationOnChange}
            />
          </Grid>
        </Grid>
      </Box>
      <Backdrop sx={customLabelTypography} open={ui.isloading}>
        <CircularProgress color="inherit" />
      </Backdrop>
    </LayoutContainer>
  );
};
export default BillingInvoice;
