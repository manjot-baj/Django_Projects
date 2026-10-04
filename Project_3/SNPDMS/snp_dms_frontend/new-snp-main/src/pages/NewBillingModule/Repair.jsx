import React, { useState, useEffect } from "react";
import {
  Typography,
  Grid,
  Button,
  TextField,
  Checkbox,
  useMediaQuery,
  Box,
  Autocomplete,
  Chip,
  Badge,
  Tooltip,
} from "@mui/material";

import { useDispatch, useSelector } from "react-redux";
import { useSnackbar } from "notistack";
import {
  collectInvoiceNew,
  collectPrestatement,
  getNewBillingRepair,
  getNewBillingRepairDownloadExcel,
} from "../../actions/NewBillingActions";
import { useHistory } from "react-router-dom";
import DatePickerField from "@components/reusablecomponents/DatePickerField";
import { dropDownDispatch } from "../../actions/GateInActions";
import { theme } from "../../App";
import { Stack } from "@mui/material";
import { handleDateChangeUTILSBillingDispatch } from "../../utils/WeekNumbre";
import { customLabelTypography } from "../../utils/CustomClasses";
import {
  TableAdvanceSearchWithModal,
  TableCellText,
  TableCustomAdvanceReactTable,
  TableCustomPaginationReactTable,
  TableCustomSearchBar,
  TableFootercontainer,
  TableHeading,
  TableRefreshIcon,
} from "@/components/TableComponent/TableComponent";
import DescriptionIcon from "@mui/icons-material/Description";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import ManageSearchOutlinedIcon from "@mui/icons-material/ManageSearchOutlined";

const Reapir = (props) => {
  const dispatch = useDispatch();
  const store = useSelector((state) => state);
  const { newBilling, gateIn } = store;
  const history = useHistory();
  const [stocksAvailableList, setStocksAvailableList] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const notify = useSnackbar().enqueueSnackbar;
  const [checkAll, setCheckAll] = useState(false);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [customer, setCustomer] = useState("");
  const [containerNo, setContainerNo] = useState("");
  const [clientName, setClientName] = useState("");
  const [refCode, setRefCode] = useState("");
  const matchesIphone = useMediaQuery("(max-width:400px)");
  const matchesIpad = useMediaQuery("(max-width:1024px)");
  const [appendCheckBox, setAppendCheckBox] = useState(false);
  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(!open);

  useEffect(() => {
    let reqArray = ["billing_client_customer", "client_ref_codes"];
    dispatch(dropDownDispatch(reqArray, notify));
    dispatch({
      type: "GET_BILLING_CONTAINER_NO_NEW",
      payload: "",
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    let tempArray = [];
    newBilling?.allHandlingBillsNew?.length > 0 &&
      newBilling.allHandlingBillsNew.map((row) => {
        let tempObj = {
          isCheck: false,
          pk: row?.pk,
          bill_type: row?.bill_type,
          bill_date: row?.bill_date,
          apply_charge: row?.apply_charge,
          container_no: row?.container_no,
          client: row?.client,
          customer: row?.customer,
          original_amount: row?.original_amount,
          remaining_amount: row?.remaining_amount,
        };
        tempArray.push(tempObj);
      });
    tempArray.map((item, i) => {
      if (selectedRows?.includes(item.pk)) {
        item.isCheck = true;
      }
      return item;
    });
    const allChecked = tempArray.every((item) => item.isCheck);
    setCheckAll(allChecked);
    setStocksAvailableList(tempArray);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [newBilling?.allHandlingBillsNew]);

  useEffect(() => {
    dispatch(getNewBillingRepair());

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store.newBilling.pg_no, store.newBilling.on_page_data]);

  const handleCheck = (index, id, val) => {
    if (!selectedRows.includes(id) && val) {
      setSelectedRows([...selectedRows, id]);
    } else {
      const updatedVal = selectedRows.filter((item) => item !== id);
      setSelectedRows(updatedVal);
    }
    const updatedData = [...stocksAvailableList];
    updatedData[index].isCheck = !updatedData[index].isCheck;
    setStocksAvailableList(updatedData);
  };
  const checkAllRows = (val) => {
    const updatedArray = stocksAvailableList.map((item) => ({
      ...item,
      isCheck: val,
    }));
    let array2 = [...selectedRows];
    updatedArray.forEach((item) => {
      if (val === true && !array2.includes(item.pk)) {
        array2.push(item.pk);
      } else if (val === false && array2.includes(item.pk)) {
        var indexDelete = array2.indexOf(item.pk);
        if (indexDelete > -1) {
          array2.splice(indexDelete, 1);
        }
      }
    });
    setSelectedRows(array2);
    setStocksAvailableList(updatedArray);
    setCheckAll(val);
  };

  const handleInvoice = () => {
    let req = {
      pk_list: selectedRows,
      from_date: newBilling.from_date,
      to_date: newBilling.to_date,
      location: localStorage.getItem("location")
        ? localStorage.getItem("location")
        : null,
      site: localStorage.getItem("site") ? localStorage.getItem("site") : null,
    };
    dispatch({ type: "GET_HANDLING_TRANS_NEW", payload: "Reapir" });
    dispatch(collectInvoiceNew(req, history, notify));
  };

  const handlePrestatement = () => {
    let data = {
      pk_list: selectedRows,
    };
    dispatch(collectPrestatement(data.pk_list, notify));
  };

  const Columns = [
    {
      Header: (
        <div>
          {appendCheckBox === false ? (
            ""
          ) : (
            <Checkbox
              checked={checkAll}
              onClick={(e) => {
                checkAllRows(e.target.checked);
              }}
              color="primary"
              inputProps={{ "aria-label": "Checkbox A" }}
            />
          )}
        </div>
      ),
      width: 50,
      style: {
        textAlign: "center",
      },
      Cell: (row) => {
        return (
          <div>
            {appendCheckBox === false ? (
              ""
            ) : (
              <Checkbox
                checked={row.original.isCheck}
                key={row.original.pk}
                onClick={(e) => {
                  handleCheck(row.index, row.original.pk, e.target.checked);
                }}
                color="primary"
                sx={(theme) => ({
                  color: "black",
                })}
                inputProps={{ "aria-label": "Checkbox A" }}
              />
            )}
          </div>
        );
      },
    },
    {
      Header: <TableHeading filter>Container Number</TableHeading>,
      accessor: "container_no",
      style: {
        textAlign: "center",
      },
      Cell: (row) => {
        return (
          <Chip
            label={row.original.container_no}
            variant="filled"
            size="medium"
            color="default"
          />
        );
      },
    },
    {
      Header: <TableHeading filter>Bill Date</TableHeading>,
      accessor: "bill_date",
      style: {
        textAlign: "center",
      },
      Cell: (row) => {
        return (
          <TableCellText title={row.original}>
            {row.original.bill_date}
          </TableCellText>
        );
      },
    },

    {
      Header: <TableHeading filter>Client Name</TableHeading>,
      accessor: "client",
      style: {
        textAlign: "center",
      },
      Cell: (row) => {
        return (
          <TableCellText title={row.original}>
            {row.original.client}
          </TableCellText>
        );
      },
    },

    {
      Header: <TableHeading filter>Apply Charge</TableHeading>,
      accessor: "apply_charge",
      style: {
        textAlign: "center",
      },
      Cell: (row) => {
        return (
          <TableCellText title={row.original.remarks}>
            {row.original.apply_charge}
          </TableCellText>
        );
      },
    },
    {
      Header: <TableHeading filter>Customers</TableHeading>,
      accessor: "customer",
      style: {
        textAlign: "center",
      },
      Cell: (row) => {
        return (
          <TableCellText title={row.original.remarks}>
            {row.original.customer}
          </TableCellText>
        );
      },
    },
    {
      Header: <TableHeading filter>Original Amount</TableHeading>,
      accessor: "original_amount",
      style: {
        textAlign: "center",
      },
      Cell: (row) => {
        return (
          <TableCellText
            title={row.original}
            style={{ color: theme.palette.success.main }}
          >
            {row.original.original_amount}
          </TableCellText>
        );
      },
    },
    {
      Header: <TableHeading filter>Remaining Amount</TableHeading>,
      accessor: "remaining_amount",
      style: {
        textAlign: "center",
      },
      Cell: (row) => {
        return (
          <TableCellText
            title={row.original}
            style={{ color: theme.palette.error.main }}
          >
            {row.original.remaining_amount}
          </TableCellText>
        );
      },
    },
  ];

  const handleFromDateChange = (date) => {
    var selectedDate = new Date(date);
    var dd = String(selectedDate.getDate()).padStart(2, "0");
    var mm = String(selectedDate.getMonth() + 1).padStart(2, "0"); //
    var yyyy = selectedDate.getFullYear();
    var selectedDateFormat = yyyy + "-" + mm + "-" + dd;
    dispatch({
      type: "GET_BILLING_FROM_DATE_NEW",
      payload: selectedDateFormat,
    });
    setFromDate(selectedDateFormat);
  };

  const handleToDateChange = (date) => {
    var selectedDate = new Date(date);
    var dd = String(selectedDate.getDate()).padStart(2, "0");
    var mm = String(selectedDate.getMonth() + 1).padStart(2, "0"); //
    var yyyy = selectedDate.getFullYear();
    var selectedDateFormat = yyyy + "-" + mm + "-" + dd;
    dispatch({ type: "GET_BILLING_TO_DATE_NEW", payload: selectedDateFormat });
    setToDate(selectedDateFormat);
  };

  const handleInitialPage = () => {
    dispatch({
      type: "GET_NEW_BILLING_PAGE_NO",
      payload: 1,
    });
  };

  const handlePaginationOnChange = (e, val) => {
    setCheckAll(false);

    dispatch({
      type: "GET_NEW_BILLING_PAGE_NO",
      payload: val,
    });
    dispatch(getNewBillingRepair());
  };

  const handleOnPageDataChange = (value) => {
    dispatch({
      type: "GET_NEW_BILLING_PAGE_NO",
      payload: 1,
    });
    dispatch({
      type: "GET_NEW_BILLING_ON_PAGE_DATA",
      payload: value,
    });
  };

  const handleCloseClick = () => {
    setContainerNo("");
    dispatch({
      type: "GET_BILLING_CONTAINER_NO_NEW",
      payload: "",
    });
    dispatch({
      type: "GET_NEW_BILLING_PAGE_NO",
      payload: 1,
    });
    dispatch(getNewBillingRepair());
  };

  const handleOnChangeContainerNo = (e) => {
    setContainerNo(e.target.value);
    dispatch({
      type: "GET_BILLING_CONTAINER_NO_NEW",
      payload: e.target.value,
    });
  };

  const handleSearch = () => {
    dispatch({
      type: "GET_NEW_BILLING_PAGE_NO",
      payload: 1,
    });
    dispatch(getNewBillingRepair());

    setSelectedRows([]);
    setAppendCheckBox(true);
  };

  const handleDeleteFromDate = () => {
    dispatch({
      type: "GET_BILLING_FROM_DATE_NEW",
      payload: "",
    });
    setFromDate("");
    dispatch({ type: "GET_BILLING_TO_DATE_NEW", payload: "" });
    setToDate("");
    dispatch({
      type: "GET_NEW_BILLING_PAGE_NO",
      payload: 1,
    });
    dispatch(getNewBillingRepair());
  };

  const handleDeleteCustomer = () => {
    setCustomer("");
    dispatch({
      type: "GET_BILLING_CUSTOMER_NO_NEW",
      payload: "",
    });
    dispatch({
      type: "GET_NEW_BILLING_PAGE_NO",
      payload: 1,
    });
    dispatch(getNewBillingRepair());
  };

  const handleDeleteRefCode = () => {
    setRefCode("");
    dispatch({
      type: "GET_BILLING_REF_CODE_NEW",
      payload: "",
    });
    dispatch({
      type: "GET_NEW_BILLING_PAGE_NO",
      payload: 1,
    });
    dispatch(getNewBillingRepair());
  };

  const handleDeleteClientName = () => {
    setClientName("");
    dispatch({
      type: "GET_BILLING_CLIENT_NEW",
      payload: "",
    });
    dispatch({
      type: "GET_NEW_BILLING_PAGE_NO",
      payload: 1,
    });
    dispatch(getNewBillingRepair());
  };

  const handleDeleteFromGateDate = () => {
    dispatch({
      type: "GET_BILLING_FROM_GATE_OUT_DATE",
      payload: "",
    });
    dispatch({
      type: "GET_BILLING_FROM_GATE_OUT_DATE",
      payload: "",
    });
    dispatch({
      type: "GET_NEW_BILLING_PAGE_NO",
      payload: 1,
    });
    dispatch(getNewBillingRepair());
  };

  const ClearAllFilters = () => {
    dispatch({
      type: "GET_BILLING_FROM_DATE_NEW",
      payload: "",
    });
    setFromDate("");
    dispatch({ type: "GET_BILLING_TO_DATE_NEW", payload: "" });
    setToDate("");
    setCustomer("");
    dispatch({
      type: "GET_BILLING_CUSTOMER_NO_NEW",
      payload: "",
    });
    setRefCode("");
    dispatch({
      type: "GET_BILLING_REF_CODE_NEW",
      payload: "",
    });
    setClientName("");
    dispatch({
      type: "GET_BILLING_CLIENT_NEW",
      payload: "",
    });
    dispatch({
      type: "GET_BILLING_FROM_GATE_OUT_DATE",
      payload: "",
    });
    dispatch({
      type: "GET_BILLING_FROM_GATE_OUT_DATE",
      payload: "",
    });
    dispatch({
      type: "GET_NEW_BILLING_PAGE_NO",
      payload: 1,
    });
    dispatch(getNewBillingRepair());
  };

  const handleSearchAndDownloadExcel = () => {
    if (newBilling.from_date !== "" && newBilling.to_date === "") {
      notify("Please Fill to date ", { variant: "warning" });
    } else if (newBilling.to_date !== "" && newBilling.from_date === "") {
      notify("Please Fill From Date", { variant: "warning" });
    } else if (
      newBilling.from_gate_out_date !== "" &&
      newBilling.to_gate_out_date === ""
    ) {
      notify("Please Fill to Gate Out date ", { variant: "warning" });
    } else if (
      newBilling.to_gate_out_date !== "" &&
      newBilling.from_gate_out_date === ""
    ) {
      notify("Please Fill From Gate Out Date", { variant: "warning" });
    } else if (
      newBilling.to_date === "" &&
      newBilling.from_date === "" &&
      newBilling.client === "" &&
      newBilling.customer === "" &&
      newBilling.ref_code === "" &&
      newBilling.from_gate_out_date === "" &&
      newBilling.to_gate_out_date === ""
    ) {
      notify("Please Apply at Least One Filter to Continue ", {
        variant: "warning",
      });
    } else {
      handleSearch();
      dispatch(getNewBillingRepairDownloadExcel(handleClose, notify));
    }
  };

  const selectCount = selectedRows?.length;
  return (
    <Box padding={matchesIphone ? 1 : 2}>
      <Grid container spacing={matchesIphone ? 0 : 2}>
        <Grid
          item
          size={{ xs: 10, sm: 6, md: 6, lg: 6, xl: 6 }}
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-start",
            gap: 2,
          }}
        >
          <TableCustomSearchBar
            noSelect
            selectName={"Container No"}
            searchText={containerNo}
            closeClick={handleCloseClick}
            setSearchText={handleOnChangeContainerNo}
            searchClick={handleSearch}
            maxWidthSearch={"70%"}
          ></TableCustomSearchBar>
          <TableAdvanceSearchWithModal
            open={open}
            handleClose={handleClose}
            handleOpen={handleOpen}
            style={{ width: "fit-content" }}
            activeFilter={
              customer !== "" || refCode !== "" || clientName !== ""
            }
          >
            <Grid container spacing={matchesIphone ? 1 : 2}>
              <Grid
                item
                size={{ xs: 12, md: 6, sm: 3, lg: 3 }}
                style={theme.breakpoints.down("sm") && { padding: 7 }}
              >
                <Typography variant="subtitle1" sx={customLabelTypography}>
                  From Date
                </Typography>

                <DatePickerField
                  dateId="from-date"
                  fullWidth
                  dateValue={fromDate}
                  dateChange={handleFromDateChange}
                />
              </Grid>
              <Grid
                item
                size={{ xs: 12, md: 6, sm: 3, lg: 3 }}
                style={theme.breakpoints.down("sm") && { padding: 7 }}
              >
                <Typography variant="subtitle1" sx={customLabelTypography}>
                  To Date
                </Typography>

                <DatePickerField
                  dateId="to-date"
                  dateValue={toDate}
                  fullWidth
                  dateChange={handleToDateChange}
                />
              </Grid>
              <Grid
                item
                size={{ xs: 12, md: 6, sm: 3, lg: 3 }}
                style={theme.breakpoints.down("sm") && { padding: 7 }}
              >
                <Typography variant="subtitle1" sx={customLabelTypography}>
                  From Gate Out
                </Typography>

                <DatePickerField
                  dateId="to-date"
                  fullWidth
                  dateValue={newBilling.from_gate_out_date}
                  dateChange={(date) =>
                    handleDateChangeUTILSBillingDispatch(
                      date,
                      dispatch,
                      "GET_BILLING_FROM_GATE_OUT_DATE",
                      "from_gate_out_date",
                    )
                  }
                />
              </Grid>
              <Grid
                item
                size={{ xs: 12, md: 6, sm: 3, lg: 3 }}
                style={theme.breakpoints.down("sm") && { padding: 7 }}
              >
                <Typography variant="subtitle1" sx={customLabelTypography}>
                  To Gate Out
                </Typography>

                <DatePickerField
                  dateId="to-date"
                  fullWidth
                  dateValue={newBilling.to_gate_out_date}
                  dateChange={(date) =>
                    handleDateChangeUTILSBillingDispatch(
                      date,
                      dispatch,
                      "GET_BILLING_TO_GATE_OUT_DATE",
                      "to_gate_out_date",
                    )
                  }
                />
              </Grid>
              <Grid
                item
                size={{ xs: 12, md: 6, sm: 3, lg: 3 }}
                style={theme.breakpoints.down("sm") && { padding: 7 }}
              >
                <Typography variant="subtitle1" sx={customLabelTypography}>
                  Customer
                </Typography>
                <Autocomplete
                  value={customer}
                  onChange={(event, newValue) => {
                    setCustomer(newValue);
                  }}
                  style={{ padding: 0 }}
                  sx={{
                    "& .MuiAutocomplete-inputRoot[class*='MuiOutlinedInput-root']":
                      {
                        padding: 0,
                      },
                  }}
                  options={
                    (gateIn.allDropDown &&
                      gateIn.allDropDown.customer &&
                      gateIn.allDropDown.customer.map((option) => option)) ||
                    []
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      variant="outlined"
                      onBlur={(e) => {
                        setCustomer(e.target.value);
                        dispatch({
                          type: "GET_BILLING_CUSTOMER_NO_NEW",
                          payload: e.target.value,
                        });
                      }}
                      fullWidth
                    />
                  )}
                />
              </Grid>
              {gateIn.allDropDown && gateIn.allDropDown.client && (
                <Grid
                  item
                  size={{ xs: 12, md: 6, sm: 3, lg: 3 }}
                  style={theme.breakpoints.down("sm") && { padding: 7 }}
                >
                  <Typography variant="subtitle1" sx={customLabelTypography}>
                    Client
                  </Typography>
                  <Autocomplete
                    value={clientName}
                    onChange={(event, newValue) => {
                      setClientName(newValue);
                    }}
                    style={{ padding: 0 }}
                    sx={{
                      "& .MuiAutocomplete-inputRoot[class*='MuiOutlinedInput-root']":
                        {
                          padding: 0,
                        },
                    }}
                    options={gateIn.allDropDown.client.map((option) => option)}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        variant="outlined"
                        onBlur={(e) => {
                          setClientName(e.target.value);
                          dispatch({
                            type: "GET_BILLING_CLIENT_NEW",
                            payload: e.target.value,
                          });
                        }}
                        fullWidth
                      />
                    )}
                  />
                </Grid>
              )}
              {gateIn.allDropDown && gateIn.allDropDown.client_ref_codes && (
                <Grid
                  item
                  size={{ xs: 12, md: 6, sm: 3, lg: 3 }}
                  style={theme.breakpoints.down("sm") && { padding: 7 }}
                >
                  <Typography variant="subtitle1" sx={customLabelTypography}>
                    Ref Code
                  </Typography>
                  <Autocomplete
                    value={refCode}
                    onChange={(event, newValue) => {
                      setRefCode(newValue);
                    }}
                    style={{ padding: 0 }}
                    sx={{
                      "& .MuiAutocomplete-inputRoot[class*='MuiOutlinedInput-root']":
                        {
                          padding: 0,
                        },
                    }}
                    options={gateIn.allDropDown.client_ref_codes.map(
                      (option) => option,
                    )}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        variant="outlined"
                        onBlur={(e) => {
                          setRefCode(e.target.value);
                          dispatch({
                            type: "GET_BILLING_REF_CODE_NEW",
                            payload: e.target.value,
                          });
                        }}
                        fullWidth
                      />
                    )}
                  />
                </Grid>
              )}
            </Grid>
            <Stack
              direction={"row"}
              alignItems={"center"}
              justifyContent={"center"}
              mt={4}
              spacing={4}
            >
              <Tooltip title="Dynamic Search with Multiple Filter Options">
                <Button
                  startIcon={<ManageSearchOutlinedIcon />}
                  variant="contained"
                  color="primary"
                  onClick={() => {
                    handleSearch();
                    handleClose();
                  }}
                  style={{ width: "250px" }}
                >
                  Advance Search
                </Button>
              </Tooltip>
              <Tooltip title="Advanced Search with Excel Data Export">
                <Button
                  startIcon={<FileDownloadOutlinedIcon />}
                  variant="contained"
                  color="success"
                  onClick={handleSearchAndDownloadExcel}
                >
                  Search and Download Excel
                </Button>
              </Tooltip>
            </Stack>
          </TableAdvanceSearchWithModal>
        </Grid>
        <Grid
          item
          size={{ xs: 12, sm: 12, md: 6, lg: 6, xl: 6 }}
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            gap: 1,
          }}
        >
          {clientName !== "" && (
            <Chip
              size="small"
              label={`client - ${clientName}`}
              variant="outlined"
              color="primary"
              onDelete={handleDeleteClientName}
            />
          )}
          {refCode !== "" && (
            <Chip
              size="small"
              label={`RefCode - ${refCode}`}
              variant="outlined"
              color="primary"
              onDelete={handleDeleteRefCode}
            />
          )}
          {customer !== "" && (
            <Chip
              size="small"
              label={`Customer - ${customer}`}
              variant="outlined"
              color="primary"
              onDelete={handleDeleteCustomer}
            />
          )}
          {fromDate !== "" && toDate !== "" && (
            <Chip
              size="small"
              label={`${fromDate} / ${toDate}`}
              variant="outlined"
              color="primary"
              onDelete={handleDeleteFromDate}
            />
          )}
          {newBilling.from_gate_out_date !== "" &&
            newBilling.to_gate_out_date !== "" && (
              <Chip
                size="small"
                label={`${newBilling.from_gate_out_date} / ${newBilling.to_gate_out_date}`}
                variant="outlined"
                color="primary"
                onDelete={handleDeleteFromGateDate}
              />
            )}
          <Chip
            label="Clear Filter"
            size="small"
            variant="filled"
            color="primary"
            onDelete={ClearAllFilters}
          />
          <TableRefreshIcon onClick={() => window.location.reload()} />
        </Grid>
      </Grid>

      <Grid container marginTop={2}>
        <Grid item size={{ xs: 12 }}>
          <TableCustomAdvanceReactTable
            data={stocksAvailableList && stocksAvailableList}
            columns={[...Columns]}
            minRows={Number(store.newBilling.on_page_data)}
            pageSize={Number(store.newBilling.on_page_data)}
            defaultPageSize={Number(store.newBilling.on_page_data)}
          />

          <TableCustomPaginationReactTable
            handlePaginationOnChange={handlePaginationOnChange}
            total_pages={newBilling.total_pages}
            pg_no={newBilling.pg_no}
            next_page={newBilling.next_page}
            on_page_data={newBilling.on_page_data}
            handleInitialPage={handleInitialPage}
            handleOnPageDataChange={handleOnPageDataChange}
          />
        </Grid>
      </Grid>
      <TableFootercontainer>
        {stocksAvailableList.some((item) => item.isCheck) && (
          <Button
            variant="contained"
            color="secondary"
            size="small"
            onClick={handleInvoice}
            sx={{ mx: 1, borderRadius: 12 }}
            startIcon={
              <Badge
                badgeContent={
                  stocksAvailableList?.filter((val) => val.isCheck)?.length
                }
                color="primary"
                sx={{
                  "& .MuiBadge-badge": {
                    right: 22,
                    top: 6,
                    padding: 0,
                  },
                }}
              >
                <DescriptionIcon />
              </Badge>
            }
          >
            Collect Invoice Bills
          </Button>
        )}
        {stocksAvailableList.some((item) => item.isCheck) && (
          <Button
            variant="contained"
            size="small"
            color="success"
            sx={{ mx: 1, borderRadius: 12 }}
            onClick={handlePrestatement}
            startIcon={
              <Badge
                badgeContent={
                  stocksAvailableList?.filter((val) => val.isCheck)?.length
                }
                color="primary"
                sx={{
                  "& .MuiBadge-badge": {
                    right: 22,
                    top: 6,
                    padding: 0,
                  },
                }}
              >
                <FileDownloadIcon />
              </Badge>
            }
          >
            Prestatement Download
          </Button>
        )}
      </TableFootercontainer>
    </Box>
  );
};

export default Reapir;
