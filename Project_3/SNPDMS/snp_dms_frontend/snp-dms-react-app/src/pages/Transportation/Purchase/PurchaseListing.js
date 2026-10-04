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
} from "@material-ui/core";
import { useDispatch, useSelector } from "react-redux";
import { createMuiTheme, MuiThemeProvider } from "@material-ui/core/styles";
import { Link } from "react-router-dom";
import MUIDataTable from "mui-datatables";
import {
  getPurchaseListing,
  clearPurchaseData,
  deletePurchaseReset,
} from "../../../actions/transportation/PurchaseAction";
import LayoutContainer from "../../../components/reusableComponents/LayoutContainer";
import { useSnackbar } from "notistack";

const PurchaseListing = () => {
  const getMuiTheme = () =>
    createMuiTheme({
      overrides: {
        MuiTableCell: {
          head: {
            backgroundColor: "#f1f0fb !important",
            padding: "5px 10px !important",
          },
          root: {
            border: "1px solid rgba(0,0,0,.125)",
            padding: "5px 10px !important",
          },
        },
        MUIDataTableHeadCell: {
          data: {
            textAlign: "center",
            fontWeight: "bold",
          },
          fixedHeader: {
            textAlign: "center",
            fontWeight: "bold",
          },
        },
        MUIDataTableBodyRow: {
          root: {
            "&:nth-child(odd)": {
              backgroundColor: "#f7f7f7",
            },
            "&:hover": {
              backgroundColor: "#f1f0fb !important",
            },
          },
        },
        MUIDataTable: {
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
          }
        },
      },
    });
  const dispatch = useDispatch();
  const store = useSelector((state) => state);
  const purchaseList = useSelector(
    (state) => state.purchaseMaster.allPurchaseListing
  );
// eslint-disable-next-line no-unused-vars
  const { clientMaster } = store;
  const history = useHistory();
  const [purchaseData, setPurchaseData] = useState([]);

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
        transporter: "",
        from_date: "",
        to_date: "",
        location: localStorage.getItem("location")
          ? localStorage.getItem("location")
          : "ALL",
        site: localStorage.getItem("site")
          ? localStorage.getItem("site")
          : "ALL",
      };
      dispatch(clearPurchaseData());
      dispatch(getPurchaseListing(data));
      setLoading(true);
      dispatch(deletePurchaseReset());
    }

// eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    let purchaseArray = [];
    if (purchaseList?.length > 0) {
      purchaseList.map((rows) => {
        let purchaseObj = {
          id: rows.pk,
          entryNo: rows.entry_no,
          entryDate: rows.entry_date,
          billAmt: rows.bill_amount,
          dueBillAmt: rows.due_bill_amount,
          transporter: rows.transporter,
          location: rows.location,
          site: rows.site,
          purchaseFlag: rows.is_purchase_completed,
          checked: false,
        };
        purchaseArray.push(purchaseObj);
      });
      setPurchaseData(purchaseArray);
      setLoading(true);
    } else {
      setPurchaseData([]);
      setLoading(false);
    }
  }, [purchaseList]);

  const columns = [
    {
      label: "ENTRY NUMBER",
      name: "entryNo",
      options: {
        filter: false,
      },
    },
    {
      label: "ENTRY DATE",
      name: "entryDate",
      options: {
        filter: false,
      },
    },
    {
      label: "TRANSPOTER",
      name: "transporter",
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
      label: "BILL AMOUNT",
      name: "billAmt",
      options: {
        filter: false,
      },
    },
    {
      label: "DUE BILL AMOUNT",
      name: "dueBillAmt",
      options: {
        filter: false,
      },
    },
    {
      label: "PAYMENT COMPLETE",
      name: "purchaseFlag",
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
                  {value === true 
                  ?    <div style={{ marginLeft: "10px" }}>
                       <Tooltip title="payment Completed">
                        <svg width="28" height="28" viewBox="0 0 24 24" style={{ color: "#6261de" }} fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path opacity="0.1" d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" fill="#323232" />
                          <path d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="#323232" stroke-width="2" />
                          <path d="M9 12L10.6828 13.6828V13.6828C10.858 13.858 11.142 13.858 11.3172 13.6828V13.6828L15 10" stroke="#323232" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                        </svg>
                      </Tooltip>
                      </div>
                   : 
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
                    </div>}
                  
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
                        `/transport/purchase-form/${
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
              <h4>Purchase LR List</h4>
              <Box style={{ textAlign: "right" }}>
                <Button
                  className="add_btn btn btn-primary"
                  variant="contained"
                  style={{ marginBottom: "20px", backgroundColor:"#2A5FA5", color:"#FFF" }}
                  component={Link}
                  to={`/transport/purchase-form`}
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
            <MuiThemeProvider theme={getMuiTheme()}>
              <MUIDataTable
                data={purchaseData}
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
                    filename: "purchase-list-" + new Date().getTime() + ".csv",
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
            </MuiThemeProvider>
          </CardContent>
        </Card>
      </div>
    </LayoutContainer>
  );
};

export default PurchaseListing;
