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
  useMediaQuery
} from "@material-ui/core";
import { useDispatch, useSelector } from "react-redux";
import { createMuiTheme, MuiThemeProvider } from "@material-ui/core/styles";
import { Link } from "react-router-dom";
import MUIDataTable from "mui-datatables";
import {
  getJournalListing,
  clearJournalData,
} from "../../../../actions/transportation/JournalAction";
import LayoutContainer from "../../../../components/reusableComponents/LayoutContainer";
import { useSnackbar } from "notistack";

const JournalVoucher = () => {
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
  const journalList = useSelector(
    (state) => state.journalMaster.allJournalListing
  );
  // eslint-disable-next-line no-unused-vars
  const { clientMaster } = store;
  const history = useHistory();
  const [journalData, setJournalData] = useState([]);

  const [loading, setLoading] = useState(false);
  const notify = useSnackbar().enqueueSnackbar;
  const matchesIphone = useMediaQuery("(max-width:400px)");


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
        account_name: "",
      transaction: "",
      from_date: "",
      to_date: "",
        location: localStorage.getItem("location")
          ? localStorage.getItem("location")
          : "ALL",
        site: localStorage.getItem("site")
          ? localStorage.getItem("site")
          : "ALL",
      };
      dispatch(getJournalListing(data));
      dispatch(clearJournalData());
    }

// eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    let journalArray = [];
    if (journalList?.length > 0) {
      journalList.map((rows) => {
        let journalObj = {
          id: rows.pk,
          accountName: rows.account_name,
          transaction: rows.transaction,
          underAccountName: rows.under_account_name,
          entryNo: rows.entry_no,
          entryDate: rows.entry_date,
          amount: rows.amount,
          location: rows.location,
          site: rows.site,
          checked: false,
        };
        journalArray.push(journalObj);
      });
      setJournalData(journalArray);
      setLoading(true);
    }else{
      setJournalData([]);
      setLoading(false);
    }
  }, [journalList]);

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
      label: "ACCOUNT NAME",
      name: "accountName",
      options: {
        filter: false,
      },
    },
    {
      label: "UNDER ACCOUNT NAME",
      name: "underAccountName",
      options: {
        filter: false,
      },
    },    
    {
      label: "TRANSACTION",
      name: "transaction",
      options: {
        filter: false,
      },
    },    
    {
      label: "AMOUNT",
      name: "amount",
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
                        `/voucher/journalvoucher-form/${
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
            <div style={{ display: matchesIphone? "block" : "flex", justifyContent: "space-between" }}>
              <h4> Journal Voucher List</h4>
              <Box style={{ textAlign: "right" }}>
              
                {/* {renderDeleteBtn} */}
                <Button
                  className="add_btn btn btn-primary"
                  variant="contained"
                  style={{ marginBottom: "20px", backgroundColor:"#2A5FA5", color:"#FFF" }}
                  component={Link}
                  to={`/voucher/journalvoucher-form`}
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
                data={journalData}
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
                    filename: "journal-list-" + new Date().getTime() + ".csv",
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

export default JournalVoucher;
