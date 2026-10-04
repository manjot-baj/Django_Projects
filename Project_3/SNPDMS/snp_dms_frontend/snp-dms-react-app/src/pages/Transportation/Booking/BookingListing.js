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
  Grid,
  Typography,
  Radio,
} from "@material-ui/core";
import { useDispatch, useSelector } from "react-redux";
import { createMuiTheme, MuiThemeProvider } from "@material-ui/core/styles";
import { Link } from "react-router-dom";
import MUIDataTable from "mui-datatables";
import { useSnackbar } from "notistack";
import {
  getBookingListing,
  deleteDraftBooking,
  clearBookingData,
  deleteDraftReset,
} from "../../../actions/transportation/BookingActions";
import LayoutContainer from "../../../components/reusableComponents/LayoutContainer";
import ConfirmModal from "../../../commomComponents/modal/confirmationModal";

var DialogMessage = "";
const BookingListing = () => {
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
  const bookingList = useSelector(
    (state) => state.bookingMaster.allBookingListing
  );
  const deleteBooking = useSelector(
    (state) => state.bookingMaster.deleteBooking
  );
  const notify = useSnackbar().enqueueSnackbar;
  const history = useHistory();
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
                textTransform: "uppercase",
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
          // }
        },
      },
    },
    {
      label: "Entry Number",
      name: "entryNo",
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
                  {tableMeta.tableData[tableMeta.rowIndex]["entryNo"]}
                </div>
              }
            />
          );
        },
      },
    },
    {
      label: "LR Number",
      name: "lrNO",
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
                  {tableMeta.tableData[tableMeta.rowIndex]["lrNO"]}
                </div>
              }
            />
          );
        },
      },
    },
    {
      label: "Booking Date",
      name: "bookingDate",
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
                  {tableMeta.tableData[tableMeta.rowIndex]["bookingDate"]}
                </div>
              }
            />
          );
        },
      },
    },
    {
      label: "Transporter",
      name: "transporter",
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
                  {tableMeta.tableData[tableMeta.rowIndex]["transporter"]}
                </div>
              }
            />
          );
        },
      },
    },
    {
      label: "Bill Party",
      name: "billParty",
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
                  {tableMeta.tableData[tableMeta.rowIndex]["billParty"]}
                </div>
              }
            />
          );
        },
      },
    },
    {
      label: "From Destination",
      name: "fromDestination",
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
                  {tableMeta.tableData[tableMeta.rowIndex]["fromDestination"]}
                </div>
              }
            />
          );
        },
      },
    },
    {
      label: "To Destination",
      name: "toDestination",
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
                  {tableMeta.tableData[tableMeta.rowIndex]["toDestination"]}
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
                      history.push(
                        `/transport/booking-form/${
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
  const checkBoxColumns = [
    {
      label: "Entry Number",
      name: "entryNo",
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
                  {tableMeta.tableData[tableMeta.rowIndex]["entryNo"]}
                </div>
              }
            />
          );
        },
      },
    },
    {
      label: "LR Number",
      name: "lrNO",
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
                  {tableMeta.tableData[tableMeta.rowIndex]["lrNO"]}
                </div>
              }
            />
          );
        },
      },
    },
    {
      label: "Booking Date",
      name: "bookingDate",
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
                  {tableMeta.tableData[tableMeta.rowIndex]["bookingDate"]}
                </div>
              }
            />
          );
        },
      },
    },
    {
      label: "Transporter",
      name: "transporter",
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
                  {tableMeta.tableData[tableMeta.rowIndex]["transporter"]}
                </div>
              }
            />
          );
        },
      },
    },
    {
      label: "Bill Party",
      name: "billParty",
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
                  {tableMeta.tableData[tableMeta.rowIndex]["billParty"]}
                </div>
              }
            />
          );
        },
      },
    },
    {
      label: "From Destination",
      name: "fromDestination",
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
                  {tableMeta.tableData[tableMeta.rowIndex]["fromDestination"]}
                </div>
              }
            />
          );
        },
      },
    },
    {
      label: "To Destination",
      name: "toDestination",
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
                  {tableMeta.tableData[tableMeta.rowIndex]["toDestination"]}
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
                      history.push({ 
                        pathname:  `/transport/booking-form/${
                          tableMeta.tableData[tableMeta.rowIndex]["id"]
                        }`,
                        state: { detail: "update" }
                       });
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
  const [bookingData, setBookingData] = useState([]);
  const [isOpenConfirmModal, setIsOpenConfirmModal] = useState(false);
  const [bookingId, setBookingId] = useState("");
  const [actionType, setActionType] = useState("");
  const [allChecked, setAllChecked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [draft, setDraft] = useState(true);

  useEffect(() => {
    dispatch(clearBookingData());
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
        lr_no: "",
        transporter: "",
        bill_party: "",
        consignor: "",
        consignee: "",
        container_no: "",
        truck_no: "",
        destination: "",
        from_date: "",
        to_date: "",
        is_draft: draft,
        is_proceed: !draft,
      };
      dispatch(getBookingListing(data));
      setLoading(true);
    }
  }, []);

  useEffect(() => {
    let data = {
      location: localStorage.getItem("location")
        ? localStorage.getItem("location")
        : "ALL",
      site: localStorage.getItem("site") ? localStorage.getItem("site") : "ALL",
      lr_no: "",
      entry_no: "",
      transporter: "",
      bill_party: "",
      consignor: "",
      consignee: "",
      container_no: "",
      truck_no: "",
      destination: "",
      from_date: "",
      to_date: "",
      is_draft: draft,
      is_proceed: !draft,
    };
    dispatch(getBookingListing(data));
    closeConfirmModal();
  }, [deleteBooking]);

  useEffect(() => {
    let bookingArray = [];
    if (bookingList?.length > 0) {
      bookingList.map((rows) => {
        let bookingObj = {
          id: rows.pk,
          entryNo: rows.entry_no,
          lrNO: rows.lr_no,
          bookingDate:rows.l_date,
          transporter: rows.transporter,
          location: rows.location,
          billParty: rows.bill_party,
          fromDestination: getFromDetinationVal(rows.destination),
          toDestination: getToDetinationVal(rows.destination),
          site: rows.site,
          checked: false,
        };
        bookingArray.push(bookingObj);
      });
      setBookingData(bookingArray);
      setLoading(false);
    } else {
      setBookingData([]);
      setLoading(false);
    }
  }, [bookingList]);

  useEffect(() => {
    let data = {
      location: localStorage.getItem("location")
        ? localStorage.getItem("location")
        : "ALL",
      site: localStorage.getItem("site") ? localStorage.getItem("site") : "ALL",
      lr_no: "",
      entry_no: "",
      transporter: "",
      bill_party: "",
      consignor: "",
      consignee: "",
      container_no: "",
      truck_no: "",
      destination: "",
      from_date: "",
      to_date: "",
      is_draft: draft,
      is_proceed: !draft,
    };
    dispatch(getBookingListing(data));
  }, [draft]);

  const getFromDetinationVal = (destination) => {
    let destinationVal = destination?.split("-");
    return destinationVal[0];
  };

  const actionProcess = () => {
    let deleteArray = [];
    if (actionType === "delete") {
      const data = [...bookingData];
      deleteArray.push(bookingId);
      dispatch(deleteDraftBooking(deleteArray, notify));
      dispatch(deleteDraftReset());
      dispatch(getBookingListing(data));
      window.location.reload();
    } else {
      deleteCustomers();
    }
    setIsOpenConfirmModal(false);
  };
  const closeConfirmModal = () => {
    setIsOpenConfirmModal(false);
  };
  const deleteCustomers = () => {
    let bookingIdArray = [];
    const data = [...bookingData];
    bookingData.filter((dataItem) => {
      if (dataItem.checked) {
        bookingIdArray.push(`${dataItem.id}`);
      }
    });
    dispatch(deleteDraftBooking(bookingIdArray, notify));
    dispatch(deleteDraftReset());
    dispatch(getBookingListing(data));
    window.location.reload();
  };

  const getToDetinationVal = (destination) => {
    let destinationVal = destination?.split("-");
    return destinationVal[1];
  };
  const checkBoxAllHandler = () => {
    const data = bookingData;
    data.map((v, r) => {
      v.checked = !allChecked;
    });
    setBookingData(data);
    setAllChecked(!allChecked);
  };
  const checkBoxChangeHandler = (customerRequestId) => {
    let customerIndex = bookingData.findIndex(
      (x) => x.id === customerRequestId
    );
    setBookingData([]);
    const data = [...bookingData];
    data[customerIndex]["checked"] = !data[customerIndex]["checked"];
    setBookingData(data);
  };
  const openMultipleDelete = () => {
    setActionType("multipleDelete");
    setIsOpenConfirmModal(true);
    DialogMessage = "Are you sure you want to delete selected Bookings?";
  };

  return (
    <LayoutContainer footer={false}>
      <div
        className="payroll-policy-details"
        style={{ margin: "30px 10px 10px 10px" }}
      >
        <Card>
          <CardContent>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <h4>Booking List</h4>

              <Box style={{ textAlign: "right" }}>
                {bookingData.some((arrVal) => arrVal.checked === true) && (
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
                  to={`/transport/booking-form`}
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
              <Grid
                item
                xs={4}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Typography variant="subtitle3">Draft Booking </Typography>
                <FormControlLabel
                  value="yes"
                  control={
                    <Radio
                      style={{ color: "#2A5FA5" }}
                      checked={draft}
                      onClick={() => {
                        setDraft(true);
                      }}
                    />
                  }
                  label="Yes"
                />
                <FormControlLabel
                  value="no"
                  control={
                    <Radio
                      style={{ color: "#2A5FA5" }}
                      checked={!draft}
                      onClick={() => {
                        setDraft(false);
                      }}
                    />
                  }
                  label="No"
                />
              </Grid>
              <MUIDataTable
                data={bookingData}
                columns={draft ? columns : checkBoxColumns}
                options={{
                  selectableRows: false,
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
                    filename: "booking-list-" + new Date().getTime() + ".csv",
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

export default BookingListing;