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
  getPaymentListing,
  clearPaymentData,
} from "../../../../actions/transportation/PaymentAction";
import LayoutContainer from "../../../../components/reusableComponents/LayoutContainer";
import { useSnackbar } from "notistack";

const PaymentLisitng = () => {
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
  // eslint-disable-next-line no-unused-vars
  const store = useSelector((state) => state);
  const paymentList = useSelector(
    (state) => state.paymentMaster.allPaymentListing
  );
  const history = useHistory();
  const [paymentData, setPaymentData] = useState([]);
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
        creditor: "",
        customer: "",
        transaction_type: "",
        from_date: "",
        to_date: "",
        location: localStorage.getItem("location")
          ? localStorage.getItem("location")
          : "ALL",
        site: localStorage.getItem("site")
          ? localStorage.getItem("site")
          : "ALL",
      };
      dispatch(getPaymentListing(data));
      dispatch(clearPaymentData());
      setLoading(true);
    }
// eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    let paymentArray = [];
    if (paymentList?.length > 0) {
      paymentList.map((rows) => {
        let paymentObj = {
          id: rows.pk,
          entryNo: rows.entry_no,
          entryDate: rows.entry_date,
          paymentType: rows.payment_receipt_type,
          entryType: rows.entry_type,
          transactionType: rows.transaction,
          creditor: rows.creditor,
          customer: rows.customer,
          location: rows.location,
          site: rows.site,
          checked: false,
        };
        paymentArray.push(paymentObj);
      });
      setPaymentData(paymentArray);
      setLoading(true);
    } else {
      setPaymentData([]);
      setLoading(false);
    }
  }, [paymentList]);

  const columns = [
    {
      label: "ENTRY No",
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
      label: "PAYMENT RECEIPT TYPE",
      name: "paymentType",
      options: {
        filter: false,
      },
    },
    {
      label: "ENTRY TYPE",
      name: "entryType",
      options: {
        filter: false,
      },
    },
    {
      label: "TRANSACTION TYPE",
      name: "transactionType",
      options: {
        filter: false,
      },
    },
    {
      label: "CREDITOR",
      name: "creditor",
      options: {
        filter: false,
      },
    },
    {
      label: "CUSTOMER",
      name: "customer",
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
                      history.push(
                        `/voucher/paymentreciept-form/${
                          tableMeta.tableData[tableMeta.rowIndex]["id"]
                        }`
                      );
                    }}
                    style={{ marginLeft: "10px" }}
                  >
                    <Tooltip title="Details">
                      <svg width="24" height="24"
                        viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"
                        aria-hidden="true" role="img" className="iconify iconify--emojione" preserveAspectRatio="xMidYMid meet">
                        <path d="M55.6 41.7c4-4.4 6.4-8.9 6.4-11.5C62 24.3 48.6 7 32 7S2 24.3 2 30.2s13.4 23.2 30 23.2c4.6 0 9-1.3 12.9-3.4l10.7 7V41.7z"
                          fill="#4fd1d9"></path>
                        <circle cx="32" cy="30.2" r="15" fill="#ffffff">
                        </circle>
                        <path d="M32 21.2c-1 0-1.9.2-2.8.4c1.1.9 1.8 2.3 1.8 3.8c0 2.8-2.2 5-5 5c-1.1 0-2.1-.4-3-1v.7c0 5 4 9 9 9s9-4 9-9s-4-8.9-9-8.9"
                          fill="#4fd1d9"></path>
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
              <h4>Payment List</h4>
              <Box style={{ textAlign: "right" }}>
               
                <Button
                  className="add_btn btn btn-primary"
                  variant="contained"
                  style={{ marginBottom: "20px", backgroundColor:"#2A5FA5", color:"#FFF" }}
                  component={Link}
                  to={`/voucher/paymentreciept-form`}
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
                data={paymentData}
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
                    filename: "payment-list-" + new Date().getTime() + ".csv",
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

export default PaymentLisitng;
