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
} from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { createTheme,ThemeProvider } from "@mui/material";
import { Link } from "react-router-dom";
import MUIDataTable from "mui-datatables";
import {
  getServiceListing,
  deleteServiceData,
  clearServiceData,
  deleteServiceReset
} from "../../../actions/transportation/ServiceAction";
import LayoutContainer from "@components/reusablecomponents/LayoutContainer";
import ConfirmModal from "../../../commomComponents/modal/confirmationModal";
import { useSnackbar } from "notistack";

var DialogMessage = "";
const ServiceListing = () => {
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
  const serviceList = useSelector(
    (state) => state.serviceMaster.allServiceListing
  );
  const deleteService = useSelector(
    (state) => state.serviceMaster.deleteService
  );
  const history = useHistory();
  const [serviceData, setServiceData] = useState([]);
  const [serviceId, setServiceId] = useState("");
  const [actionType, setActionType] = useState("");
  const [isOpenConfirmModal, setIsOpenConfirmModal] = useState(false);
  const [allChecked, setAllChecked] = useState(false);
  const [loading, setLoading] = useState(false);
  const notify = useSnackbar().enqueueSnackbar;

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
        description: "",
        location: localStorage.getItem("location")
          ? localStorage.getItem("location")
          : "ALL",
        site: localStorage.getItem("site")
          ? localStorage.getItem("site")
          : "ALL",
      };
      dispatch(getServiceListing(data));
      dispatch(clearServiceData());
    }
     // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (deleteService) {
      let serviceData = {
        description: "",
        location: localStorage.getItem("location")
        ? localStorage.getItem("location")
        : "ALL",
      site: localStorage.getItem("site")
        ? localStorage.getItem("site")
        : "ALL",
      };
      dispatch(getServiceListing(serviceData));
      closeConfirmModal();
    }
     // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deleteService]);

  console.log(serviceData, "serviceData");

  useEffect(() => {
    let serviceArray = [];
    if (serviceList?.length > 0) {
      serviceList.map((rows) => {
        let serviceObj = {
          id: rows.pk,
          description: rows.description,
          location: rows.location,
          sacCode: rows.sac_code,
          underRcm: rows.under_rcm,
          totalTax: rows.total_tax,
          cgst: rows.cgst,
          sgst: rows.sgst,
          igst: rows.igst,
          site: rows.site,
          checked: false,
        };
        serviceArray.push(serviceObj);
      });
      setServiceData(serviceArray);
      setLoading(true);
    }else{
      setServiceData([]);
      setLoading(false);
    }
  }, [serviceList]);


  const openResponseModal = (type, id) => {
    setServiceId(id);
    setActionType(type);
    setIsOpenConfirmModal(true);
    DialogMessage = "Are you sure you want to delete this customer?";
  };
  const actionProcess = () => {
    let deleteArray = [];
    if (actionType === "delete") {
      deleteArray.push(serviceId);
      dispatch(deleteServiceData(deleteArray, notify));
      dispatch(deleteServiceReset());
    } else {
      deleteServices();
    }
  };

  const closeConfirmModal = () => {
    setIsOpenConfirmModal(false);
  };
  const checkBoxAllHandler = () => {
    const data = serviceData;
    data.map((v, r) => {
      v.checked = !allChecked;
    });
    setServiceData(data);
    setAllChecked(!allChecked);
  };
  const openMultipleDelete = () => {
    setActionType("multipleDelete");
    setIsOpenConfirmModal(true);
    DialogMessage = "Are you sure you want to delete selected services?";
  };
  const checkBoxChangeHandler = (serviceRequestId) => {
    let serviceIndex = serviceData.findIndex((x) => x.id === serviceRequestId);
    setServiceData([]);
    const data = [...serviceData];
    data[serviceIndex]["checked"] = !data[serviceIndex]["checked"];
    setServiceData(data);
  };
  const deleteServices = () => {
    let serviceIdArray = [];
    serviceData.filter((dataItem) => {
      if (dataItem.checked) {
        serviceIdArray.push(`${dataItem.id}`);
      }
    });
    dispatch(deleteServiceData(serviceIdArray, notify));
    dispatch(deleteServiceReset());
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
      label: "DESCRIPTION",
      name: "description",
      options: {
        filter: false,
      },
    },
    {
      label: "SAC CODE",
      name: "sacCode",
      options: {
        filter: false,
      },
    },
    {
      label: "UNDER RCM",
      name: "underRcm",
      options: {
        filter: false,
      },
    },
    {
      label: "TOTAL TAX",
      name: "totalTax",
      options: {
        filter: false,
      },
    },
    {
      label: "CGST",
      name: "cgst",
      options: {
        filter: false,
      },
    },
    {
      label: "SGST",
      name: "sgst",
      options: {
        filter: false,
      },
    },
    {
      label: "IGST",
      name: "igst",
      options: {
        filter: false,
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
                        `/transport/service-form/${
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
              <h4>service tax List</h4>
              <Box style={{ textAlign: "right" }}>
                {serviceData.some((arrVal) => arrVal.checked === true) && (
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
                  to={`/transport/service-form`}
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
                data={serviceData}
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
                    filename: "service-list-" + new Date().getTime() + ".csv",
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

export default ServiceListing;
