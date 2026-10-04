import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  FormControlLabel,
  Tooltip,
} from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { createTheme, ThemeProvider } from "@mui/material";
import { Link } from "react-router-dom";
import MUIDataTable from "mui-datatables";
import { useSnackbar } from "notistack";
import {
  getInvoiceLrListing,
  deleteInvoiceLrData,
  clearInvoiceLrData,
  deleteInvoiceLRDataReset,
} from "../../../actions/transportation/InvoiceLrActions";
import LayoutContainer from "@components/reusablecomponents/LayoutContainer";
import ConfirmModal from "../../../commomComponents/modal/confirmationModal";

var DialogMessage = "";
const InvoiceLrListing = () => {
 const getMuiTheme = () =>
    createTheme({
      components: {
        MUIDataTableHeadCell: {
          styleOverrides: {
            data: {
              textAlign: "center",
              fontWeight: "bold",
            },
            fixedHeader: {
              textAlign: "center",
              fontWeight: "bold",
            },
          },
        },
        MUIDataTable:{
          styleOverrides: {
            responsiveBase: {
              zIndex: "0",
            },
            tableRoot: {
              border: "0px",
              xs: 0,
              sm: 600,
              md: 960,
              lg: 1280,
              xl: 1920,
            },
          },
        },
        MUIDataTableBodyRow: {
          styleOverrides: {
            root: {
              "&:nth-child(odd)": {
                backgroundColor: "#f7f7f7",
              },
              "&:hover": {
                backgroundColor: "#f1f0fb !important",
              },
            },
          },
        },
        MuiTableCell: {
          styleOverrides: {
            head: {
              backgroundColor: "#f1f0fb !important",
              padding: "5px 10px !important",
            },
            root: {
              border: "1px solid rgba(0,0,0,.125)",
              padding: "5px 10px !important",
            },
          },
        },
      },
    
    });
  const dispatch = useDispatch();
  // eslint-disable-next-line no-unused-vars
  const store = useSelector((state) => state);
  const invoiceLrList = useSelector(
    (state) => state.invoiceLrMaster.allInvoiceLrListing
  );
  const deleteInvoiceLr = useSelector(
    (state) => state.invoiceLrMaster.deleteInvoiceLr
  );
  const notify = useSnackbar().enqueueSnackbar;
  const history = useHistory();
  const [invoiceLrData, setInvoiceLrData] = useState([]);
  const [isOpenConfirmModal, setIsOpenConfirmModal] = useState(false);
  // eslint-disable-next-line no-unused-vars
  const [invoiceLrId, setInvoiceLrId] = useState("");
  const [actionType, setActionType] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (
      localStorage.getItem("location") === "" ||
      localStorage.getItem("site") === ""
    ) {
      notify("Enter Location and Site in Dashboard", {
        variant: "warning",
      });
      history.push("dashboard");
    } else {
      let data = {
        location: localStorage.getItem("location"),
        site: localStorage.getItem("site"),
        bill_no: "",
        customer: "",
        from_date: "",
        to_date: "",
      };
      dispatch(getInvoiceLrListing(data));
      dispatch(clearInvoiceLrData());
    }
  
// eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    let data = {
      location: localStorage.getItem("location"),
      site: localStorage.getItem("site"),
      bill_no: "",
      customer: "",
      from_date: "",
      to_date: "",
    };
    dispatch(getInvoiceLrListing(data));
    closeConfirmModal();

// eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deleteInvoiceLr]);

  useEffect(() => {
    let invoiceLrArray = [];
    if (invoiceLrList?.length > 0) {
      invoiceLrList.map((rows) => {
        let invoiceLrObj = {
          id: rows.pk,
          billNo: rows.bill_no,
          billDate: rows.bill_date,
          billType: rows.bill_type,
          invoiceFlag: rows.is_invoice_completed,
          customerName: rows.customer,
          totalAmount: rows.total_amount,
          totalAmountWithoutTax: rows.due_total_amount,
          location: rows.location,
          site: rows.site,
          checked: false,
        };
        invoiceLrArray.push(invoiceLrObj);
      });
      setInvoiceLrData(invoiceLrArray);
      setLoading(true);
    } else {
      setInvoiceLrData([]);
      setLoading(false);
    }
  }, [invoiceLrList]);

  const actionProcess = () => {
    let deleteArray = [];
    if (actionType === "delete") {
      deleteArray.push(invoiceLrId);
      dispatch(deleteInvoiceLrData(deleteArray, history, notify));
      dispatch(deleteInvoiceLRDataReset());
    } else {
      deleteCustomers();
    }
  };
  const closeConfirmModal = () => {
    setIsOpenConfirmModal(false);
  };
  const deleteCustomers = () => {
    let invoiceLrIdArray = [];
    invoiceLrData.filter((dataItem) => {
      if (dataItem.checked) {
        invoiceLrIdArray.push(`${dataItem.id}`);
      }
    });
    dispatch(deleteInvoiceLrData(invoiceLrIdArray, history, notify));
    dispatch(deleteInvoiceLRDataReset());
  };


  const openMultipleDelete = () => {
    setActionType("multipleDelete");
    setIsOpenConfirmModal(true);
    DialogMessage = "Are you sure you want to delete selected InvoiceLrs?";
  };

  const columns = [
    {
      label: "Bill Number",
      name: "billNo",
      options: {
        sort: false,
        filter: false,
        options: {
          setCellProps: () => ({
            style: {
              display: "flex",
              justifyContent: "center",
            },
          }),
        },
        customBodyRender: (value, tableMeta, updateValue) => {
          return (
            <FormControlLabel
              style={{ width: "100%" }}
              control={
                <div style={{ display: "flex", margin: "auto" }}>
                  {tableMeta.tableData[tableMeta.rowIndex]["billNo"]}
                </div>
              }
            />
          );
        },
      },
    },
    {
      label: "Bill Type",
      name: "billType",
      options: {
        sort: false,
        filter: false,
        options: {
          setCellProps: () => ({
            style: {
              display: "flex",
              justifyContent: "center",
            },
          }),
        },
        customBodyRender: (value, tableMeta, updateValue) => {
          return (
            <FormControlLabel
              style={{ width: "100%" }}
              control={
                <div style={{ display: "flex", margin: "auto" }}>
                  {tableMeta.tableData[tableMeta.rowIndex]["billType"]}
                </div>
              }
            />
          );
        },
      },
    },
    {
      label: "Customer Name",
      name: "customerName",
      options: {
        sort: false,
        filter: false,
        options: {
          setCellProps: () => ({
            style: {
              display: "flex",
              justifyContent: "center",
            },
          }),
        },
        customBodyRender: (value, tableMeta, updateValue) => {
          return (
            <FormControlLabel
              style={{ width: "100%" }}
              control={
                <div style={{ display: "flex", margin: "auto" }}>
                  {tableMeta.tableData[tableMeta.rowIndex]["customerName"]}
                </div>
              }
            />
          );
        },
      },
    },
    {
      label: "Location",
      name: "location",
      options: {
        sort: false,
        filter: false,
        options: {
          setCellProps: () => ({
            style: {
              display: "flex",
              justifyContent: "center",
            },
          }),
        },
        customBodyRender: (value, tableMeta, updateValue) => {
          return (
            <FormControlLabel
              style={{ width: "100%" }}
              control={
                <div style={{ display: "flex", margin: "auto" }}>
                  {tableMeta.tableData[tableMeta.rowIndex]["location"]}
                </div>
              }
            />
          );
        },
      },
    },
    {
      label: "Site",
      name: "site",
      options: {
        sort: false,
        filter: false,
        options: {
          setCellProps: () => ({
            style: {
              display: "flex",
              justifyContent: "center",
            },
          }),
        },
        customBodyRender: (value, tableMeta, updateValue) => {
          return (
            <FormControlLabel
              style={{ width: "100%" }}
              control={
                <div style={{ display: "flex", margin: "auto" }}>
                  {tableMeta.tableData[tableMeta.rowIndex]["site"]}
                </div>
              }
            />
          );
        },
      },
    },
    {
      label: "TOTAL AMOUNT",
      name: "totalAmount",
      options: {
        sort: false,
        filter: false,
        options: {
          setCellProps: () => ({
            style: {
              display: "flex",
              justifyContent: "center",
            },
          }),
        },
        customBodyRender: (value, tableMeta, updateValue) => {
          return (
            <FormControlLabel
              style={{ width: "100%" }}
              control={
                <div style={{ display: "flex", margin: "auto" }}>
                  {tableMeta.tableData[tableMeta.rowIndex]["totalAmount"]}
                </div>
              }
            />
          );
        },
      },
    },
    {
      label: "TOTAL DUE AMOUNT",
      name: "totalAmountWithoutTax",
      options: {
        sort: false,
        filter: false,
        options: {
          setCellProps: () => ({
            style: {
              display: "flex",
              justifyContent: "center",
            },
          }),
        },
        customBodyRender: (value, tableMeta, updateValue) => {
          return (
            <FormControlLabel
              style={{ width: "100%" }}
              control={
                <div style={{ display: "flex", margin: "auto" }}>
                  {
                    tableMeta.tableData[tableMeta.rowIndex][
                    "totalAmountWithoutTax"
                    ]
                  }
                </div>
              }
            />
          );
        },
      },
    },
    {
      label: "PAYMENT COMPLETE",
      name: "invoiceFlag",
      options: {
        filter: false,
        sort: false,
        download: false,
        options: {
          setCellProps: () => ({
            style: {
              display: "flex",
              justifyContent: "center",
            },
          }),
        },
        customBodyRender: (value, tableMeta, updateValue) => {
          return (
            <FormControlLabel
              style={{ width: "100%" }}
              control={
                <div style={{ display: "flex", margin: "auto" }}>
                  {value === true ? (
                    <div>
                      <Tooltip title="payment Completed">
                        <svg width="28" height="28" viewBox="0 0 24 24" style={{ color: "#6261de" }} fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path opacity="0.1" d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" fill="#323232" />
                          <path d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="#323232" stroke-width="2" />
                          <path d="M9 12L10.6828 13.6828V13.6828C10.858 13.858 11.142 13.858 11.3172 13.6828V13.6828L15 10" stroke="#323232" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                        </svg>
                      </Tooltip>
                    </div>
                  ) : (
                    <div style={{ marginLeft: "10px" }}>
                      <Tooltip title="payment Incompleted">
                        <svg
                          style={{ color: "#6261de" }}
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          stroke="#000000"
                          stroke-width="1"
                          stroke-linecap="round"
                          stroke-linejoin="miter"
                        >
                          <circle cx="12" cy="12" r="10"></circle>
                          <circle
                            cx="12"
                            cy="12"
                            r="10"
                            fill="#059cf7"
                            opacity="0.1"
                          ></circle>
                          <line x1="15" y1="9" x2="9" y2="15"></line>
                          <line x1="15" y1="15" x2="9" y2="9"></line>
                        </svg>
                      </Tooltip>
                    </div>
                  )}
                </div>
              }
            />
          );
        },
      },
    },
    {
      name: "Actions",
      options: {
        filter: false,
        sort: false,
        download: false,
        options: {
          setCellProps: () => ({
            style: {
              display: "flex",
              justifyContent: "center",
            },
          }),
        },
        customBodyRender: (value, tableMeta, updateValue) => {
          return (
            <FormControlLabel
              style={{ width: "100%" }}
              control={
                <div style={{ display: "flex", margin: "auto" }}>
                  <div
                    onClick={() => {
                      history.push(
                        `/transport/invoice-lr-form/${tableMeta.tableData[tableMeta.rowIndex]["id"]
                        }`
                      );
                    }}
                    style={{ marginLeft: "10px" }}
                  >
                    <Tooltip title="Edit">
                      <svg
                        style={{ color: "#6261de" }}
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        className="feather feather-edit"
                      >
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                      </svg>
                    </Tooltip>
                  </div>
                </div>
              }
            />
          );
        },
      },
    },
  ];

  return (
    <LayoutContainer footer={false}>
      <div
        className="payroll-policy-details"
        style={{ margin: "30px 10px 10px 10px" }}
      >
        <Card>
          <CardContent>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <h4>Invoice LR List</h4>
              <Box style={{ textAlign: "right" }}>
                {invoiceLrData.some((arrVal) => arrVal.checked === true) && (
                  <Button
                    className="add_btn btn btn-danger"
                    variant="contained"
                    style={{ marginBottom: "20px", marginRight: "10px" }}
                    onClick={openMultipleDelete}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#ffff"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      className="feather feather-trash-2"
                    >
                      <polyline points="3 6 5 6 21 6"></polyline>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                      <line x1="10" y1="11" x2="10" y2="17"></line>
                      <line x1="14" y1="11" x2="14" y2="17"></line>
                    </svg>
                    &nbsp; Delete
                  </Button>
                )}
                <Button
                  className="add_btn btn btn-primary"
                  variant="contained"
                  style={{ marginBottom: "20px", backgroundColor:"#2A5FA5", color:"#FFF" }}
                  component={Link}
                  to={`/transport/invoice-lr-form`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    className="feather feather-plus"
                  >
                    <line x1="12" y1="2" x2="12" y2="18"></line>
                    <line x1="5" y1="10" x2="19" y2="10"></line>
                  </svg>
                  &nbsp; Add New
                </Button>
              </Box>
            </div>

            <Divider />
            <ThemeProvider theme={getMuiTheme()}>
              <MUIDataTable
                data={invoiceLrData}
                columns={columns}
                options={{
                  selectableRows: false,
                  responsive: "scroll",
                  textLabels: {
                    body: {
                      noMatch: loading ? (
                        <CircularProgress />
                      ) : (
                        "Sorry, there is no matching data to display"
                      ),
                    },
                  },
                  toolbar: {
                    downloadCsv: "Export Excel",
                  },
                  downloadOptions: {
                    filename: "invoiceLr-list-" + new Date().getTime() + ".csv",
                    filterOptions: {
                      useDisplayedColumnsOnly: true,
                      useDisplayedRowsOnly: true,
                    },
                  },
                  filter: false,
                  fixedHeaderOptions: false,
                  viewColumns: false,
                  print: false,
                  pagination: true,
                }}
              />
            </ThemeProvider>
          </CardContent>
        </Card>
        {isOpenConfirmModal ? (
          <ConfirmModal
            isOpenConfirmModal={isOpenConfirmModal}
            message={DialogMessage}
            actionProcess={actionProcess}
            closeModal={closeConfirmModal}
          />
        ) : (
          ""
        )}
      </div>
    </LayoutContainer>
  );
};

export default InvoiceLrListing;
