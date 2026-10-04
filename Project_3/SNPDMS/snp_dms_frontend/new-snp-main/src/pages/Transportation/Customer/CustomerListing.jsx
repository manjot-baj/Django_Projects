import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import {
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  CircularProgress,
  Divider,
  FormControlLabel,
  Tooltip,
  createTheme,
  ThemeProvider
} from "@mui/material";
import { useDispatch, useSelector } from "react-redux";

import { Link } from "react-router-dom";
import MUIDataTable from "mui-datatables";
import {
  getCustomerListing,
  deleteCustomerData,
  clearCutomerData,
  deleteCustomerReset,
} from "../../../actions/transportation/CustomerActions";
import LayoutContainer from "@components/reusablecomponents/LayoutContainer";
import ConfirmModal from "../../../commomComponents/modal/confirmationModal";
import { useSnackbar } from "notistack";

var DialogMessage = "";
const CustomerListing = () => {
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
  const customerList = useSelector(
    (state) => state.customerMaster.allCustomerListing
  );
  const deleteCutomer = useSelector(
    (state) => state.customerMaster.deleteCutomer
  );
  const history = useHistory();
  const notify = useSnackbar().enqueueSnackbar;
  const [customerData, setCustomerData] = useState([]);
  const [customerId, setCustomerId] = useState("");
  const [actionType, setActionType] = useState("");
  const [isOpenConfirmModal, setIsOpenConfirmModal] = useState(false);
  const [allChecked, setAllChecked] = useState(false);
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
    }else{

    let data = {
      name: "",
      location: localStorage.getItem("location")
        ? localStorage.getItem("location")
        : "ALL",
      site: localStorage.getItem("site") ? localStorage.getItem("site") : "ALL",
    };
    dispatch(getCustomerListing(data));
    dispatch(clearCutomerData());}
  }, []);
  useEffect(() => {
    if (deleteCutomer) {
      let customerData = {
        name: "",
        location: localStorage.getItem("location")
        ? localStorage.getItem("location")
        : "ALL",
      site: localStorage.getItem("site") ? localStorage.getItem("site") : "ALL",
      };
      dispatch(getCustomerListing(customerData));
      closeConfirmModal();
    }
  }, [deleteCutomer]);
  useEffect(() => {
    let customerArray = [];
    if (customerList?.length > 0) {
      customerList.map((rows) => {
        let customerObj = {
          id: rows.pk,
          name: rows.name,
          contactNo: rows.contact_no,
          emailId: rows.email_id,
          location: rows.location,
          site: rows.site,
          checked: false,
        };
        customerArray.push(customerObj);
      });
      setCustomerData(customerArray);
      setLoading(true);
    }
    else{
      setCustomerData([]);
      setLoading(false);
    }
  }, [customerList]);

  const openResponseModal = (type, id) => {
    setCustomerId(id);
    setActionType(type);
    setIsOpenConfirmModal(true);
    DialogMessage = "Are you sure you want to delete this customer?";
  };
  const actionProcess = () => {
    let deleteArray = [];
    if (actionType === "delete") {
      deleteArray.push(customerId);
      dispatch(deleteCustomerData(deleteArray, notify));
      dispatch(deleteCustomerReset());
    } else {
      deleteCustomers();
    }
  };

  const closeConfirmModal = () => {
    setIsOpenConfirmModal(false);
  };
  const checkBoxAllHandler = () => {
    const data = customerData;
    data.map((v, r) => {
      v.checked = !allChecked;
    });
    setCustomerData(data);
    setAllChecked(!allChecked);
  };
  const openMultipleDelete = () => {
    setActionType("multipleDelete");
    setIsOpenConfirmModal(true);
    DialogMessage = "Are you sure you want to delete selected customers?";
  };
  const checkBoxChangeHandler = (customerRequestId) => {
    let customerIndex = customerData.findIndex(
      (x) => x.id === customerRequestId
    );
    setCustomerData([]);
    const data = [...customerData];
    data[customerIndex]["checked"] = !data[customerIndex]["checked"];
    setCustomerData(data);
  };
  const deleteCustomers = () => {
    let customerIdArray = [];
    customerData.filter((dataItem) => {
      if (dataItem.checked) {
        customerIdArray.push(`${dataItem.id}`);
      }
    });
    dispatch(deleteCustomerData(customerIdArray, notify));
    dispatch(deleteCustomerReset());
  };
  const columns = [
    {
      name: "checkBox",
      options: {
        filter: false,
        sort: false,
        download: false,
        customHeadRender: ({ index, ...column }) => {
          return (
            <div
              style={{
                width: "100%",
                borderTop: "1px solid lightgrey",
                borderRadius: "0px",
                textAlign: "center",
                textTransform:"uppercase"
              }}
            >
              <Checkbox
                className="checkbox_all"
                onClick={checkBoxAllHandler}
                color="primary"
              />
            </div>
          );
        },

        customBodyRender: (value, tableMeta, updateValue) => {
          return (
            <div style={{ width: "100%", textAlign: "center" }}>
              <Checkbox
                className="check_value"
                onClick={() =>
                  checkBoxChangeHandler(
                    tableMeta.tableData[tableMeta.rowIndex]["id"]
                  )
                }
                checked={tableMeta.tableData[tableMeta.rowIndex]["checked"]}
                color="primary"
              />
            </div>
          );
        },
      },
    },
    {
      label: "NAME",
      name: "name",
      options: {
        filter: false,
      },
    },
    {
      label: "Mobile Number",
      name: "contactNo",
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
                  {tableMeta.tableData[tableMeta.rowIndex]["contactNo"]}
                </div>
              }
            />
          );
        },
      },
    },
    {
      label: "Email Id",
      name: "emailId",
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
                  {tableMeta.tableData[tableMeta.rowIndex]["emailId"]}
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
                      openResponseModal(
                        "delete",
                        tableMeta.tableData[tableMeta.rowIndex]["id"]
                      );
                    }}
                  >
                    <Tooltip title="Delete">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#e60000"
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
                    </Tooltip>
                  </div>
                  <div
                    onClick={() => {
                      history.push(
                        `/transport/customer-form/${
                          tableMeta.tableData[tableMeta.rowIndex]["id"]
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
              <h4>Customer List</h4>
              <Box style={{ textAlign: "right" }}>
                {customerData.some((arrVal) => arrVal.checked === true) && (
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
                {/* {renderDeleteBtn} */}
                <Button
                  className="add_btn btn btn-primary"
                  variant="contained"
                  style={{ marginBottom: "20px", backgroundColor:"#2A5FA5", color:"#FFF" }}
                  component={Link}
                  to={`/transport/customer-form`}
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
                data={customerData}
                columns={columns}
                options={{
                  selectableRows: "none",
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
                    filename: "customer-list-" + new Date().getTime() + ".csv",
                    filterOptions: {
                      useDisplayedColumnsOnly: true,
                      useDisplayedRowsOnly: true,
                    },
                  },
                  filter: false,
                  fixedHeaderOptions: false,
                  viewColumns: false,
                  print: false,
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

export default CustomerListing;
