import {
  Grid,
  Typography,
  MenuItem,
  IconButton,
  Box,
  Divider,
  Button,
  TextField,
  Checkbox,
  Modal,
  Chip,
  useMediaQuery,
  Tooltip,
} from "@mui/material";
import React, { useCallback, useEffect, useState } from "react";
import { useSnackbar } from "notistack";
import { useDispatch, useSelector } from "react-redux";
import { ADVANCE_FINANCE_CONSTANT } from "../../reducers/AdvanceFinance/AdvanceFinanceReducer";

import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers";
import dayjs from "dayjs";
import SearchIcon from "@mui/icons-material/Search";
import RefreshIcon from "@mui/icons-material/Refresh";
import { Stack } from "@mui/material";
import {
  handleDateChangeUTILSDispatch,
  handleDateChangeUTILSFlex,
} from "../../utils/WeekNumbre";
import {
  downloadPreGateOutFoemSixAction,
  getPreGateOutDataTableAction,
  getPreGateOutPkAction,
  getSingleAdvanceFinanceProcessAction,
  handlePreGateOutDeleteAction,
  handlePreGateOutValidityUpdateAction,
} from "../../actions/AdvanceFinance/AdvanceFinanceAction";
import DoneIcon from "@mui/icons-material/Done";
import CrossIcon from "@mui/icons-material/Cancel";
import DatePickerField from "@components/reusablecomponents/DatePickerField";
import PictureAsPdfOutlinedIcon from "@mui/icons-material/PictureAsPdfOutlined";
import {
  TableAdvanceSearchWithModal,
  TableCellText,
  TableCustomAdvanceReactTable,
  TableCustomPaginationReactTable,
  TableCustomSearchBar,
  TableHeading,
  TablePageTitle,
  TableRefreshIcon,
} from "../TableComponent/TableComponent";

const PreGateOutList = (props) => {
  const dispatch = useDispatch();
  const notify = useSnackbar().enqueueSnackbar;
  const { AdvanceFinanceReducer } = useSelector((state) => state);
  const { preGateOutTable } = AdvanceFinanceReducer;
  const { advanceProcess } = AdvanceFinanceReducer;
  const [process, setProcess] = useState("client");
  const [searchText, setSearchText] = useState("");
  const [selectedRows, setSelectedRows] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [disable, setDisable] = useState(1);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [anchorElAdvance, setAnchorElAdvance] = React.useState(null);
  const [validity, setValidity] = useState({
    validity: "",
    time: "23:59",
  });
  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const openAdvance = Boolean(anchorElAdvance);
  const matchesIphone = useMediaQuery("(max-width:500px)");

  const idAdvance = openAdvance ? "simple-popover-Advance" : undefined;

  function getModalStyle() {
    const top = 50;
    const left = 50;

    return {
      top: `${top}%`,
      left: `${left}%`,
      transform: `translate(-${top}%, -${left}%)`,
    };
  }

  const handleChip = (pkToUpdate) => {
    const updatedData = selectedRows.map((item) => {
      if (item.pk === pkToUpdate) {
        return {
          ...item,
          enabled: !item.enabled,
        };
      }
      return item;
    });

    setSelectedRows(updatedData);
  };

  const totalSelectedContainers = () => {
    let counts = selectedRows.filter((item) => item.enabled).length;
    return counts;
  };

  const handleSelectedValidityUpdate = () => {
    if (validity.validity === "") {
      notify("Please select a validity for selected containers", {
        variant: "error",
      });
      return;
    }
    if (validity.time === "") {
      notify("Please select a time for selected containers", {
        variant: "error",
      });
      return;
    }
    let selectedValue = selectedRows.map((item) => {
      if (item.enabled) {
        return item.pk;
      } else {
        return null;
      }
    });
    let selected_containers = selectedValue.filter((item) => item !== null);
    dispatch(
      handlePreGateOutValidityUpdateAction(
        selected_containers,
        validity.validity,
        validity.time,
        handleModalClose,
        notify,
      ),
    );
  };

  const handleDeleteSelectedContainers = () => {
    let selectedValue = selectedRows.map((item) => {
      if (item.enabled) {
        return item.pk;
      } else {
        return null;
      }
    });
    let selected_containers_delete = selectedValue.filter(
      (item) => item !== null,
    );
    dispatch(
      handlePreGateOutDeleteAction(
        props.bk_no,
        props.paymentID,
        selected_containers_delete,
        handleModalCloseDelete,
        props?.process,
        setSelectedRows,
        notify,
      ),
    );
  };

  const handleModalClose = () => {
    setOpenModal(false);
    dispatch({
      type: "LOADED_CHIP_RESET_SELECTION",
    });
  };

  const handleModalCloseDelete = () => {
    setOpenDeleteModal(false);
  };

  const handleClearAdvance = () => {
    dispatch({ type: ADVANCE_FINANCE_CONSTANT.PRE_GATE_OUT_TABLE_INIT });

    dispatch(getPreGateOutDataTableAction(notify));
    // handleCloseAdvance()
  };

  const handleClickAdvance = (event) => {
    setAnchorElAdvance(event.currentTarget);
  };

  const handleCloseAdvance = () => {
    setAnchorElAdvance(null);
  };

  const handleSearchChange = useCallback(
    (e) => setSearchText(e.target.value),
    [searchText],
  );

  const handleSearchButton = useCallback(() => {
    dispatch({
      type: ADVANCE_FINANCE_CONSTANT.PRE_GATE_OUT_TABLE,
      payload: {
        client: "",
        shipping_line: "",
        container_no: "",
      },
    });
    dispatch({
      type: ADVANCE_FINANCE_CONSTANT.PRE_GATE_OUT_TABLE,
      payload: {
        pg_no: 1,
        [process]:
          process === "container_no" ? searchText.split(",") : searchText,
      },
    });
    dispatch(getPreGateOutDataTableAction(notify));
  }, [searchText, notify, process]);

  const handleSetProcess = (event) => {
    setSearchText("");
    setProcess(event.target.value);
  };

  const handleCloseClick = useCallback(() => setSearchText(""), [searchText]);

  const handleAdvanceSearch = () => {
    dispatch(getPreGateOutDataTableAction(notify));
    handleCloseAdvance();
  };

  const handleClickRefreshTable = () => {
    dispatch({ type: ADVANCE_FINANCE_CONSTANT.PRE_GATE_OUT_TABLE_INIT });
    setSelectedRows([]);
    if (props?.process) {
      dispatch(getSingleAdvanceFinanceProcessAction(props?.paymentID, notify));
    } else {
      dispatch(getPreGateOutDataTableAction(notify));
    }
  };

  const prevStockPage = () => {
    setCurrentPage(Number(currentPage) - 1);
    setDisable(disable - 1);
    dispatch({
      type: ADVANCE_FINANCE_CONSTANT.PRE_GATE_OUT_TABLE,
      payload: {
        pg_no: Number(preGateOutTable.pg_no) - 1,
      },
    });
    dispatch(getPreGateOutDataTableAction(notify));
  };

  const nextStockPage = () => {
    setCurrentPage(Number(currentPage) + 1);
    setDisable(disable + 1);
    dispatch({
      type: ADVANCE_FINANCE_CONSTANT.PRE_GATE_OUT_TABLE,
      payload: {
        pg_no: Number(preGateOutTable.pg_no) + 1,
      },
    });
    dispatch(getPreGateOutDataTableAction(notify));
  };

  const handlePaginationOnChange = (e, val) => {
    dispatch({
      type: ADVANCE_FINANCE_CONSTANT.PRE_GATE_OUT_TABLE,
      payload: {
        pg_no: val,
      },
    });
    dispatch(getPreGateOutDataTableAction(notify));
  };

  const handleInitialPage = () => {
    dispatch({
      type: ADVANCE_FINANCE_CONSTANT.PRE_GATE_OUT_TABLE,
      payload: {
        pg_no: 1,
      },
    });
    dispatch(getPreGateOutDataTableAction(notify));
  };

  const handleOnPageDataChange = (value) => {
    dispatch({
      type: ADVANCE_FINANCE_CONSTANT.PRE_GATE_OUT_TABLE,
      payload: {
        pg_no: 1,
        on_page_data_client: value,
      },
    });
    dispatch(getPreGateOutDataTableAction(notify));
  };
  const handleCheck = (pk, val) => {
    if (!selectedRows.some((value) => value.pk === pk)) {
      setSelectedRows([
        ...selectedRows,
        {
          pk,
          container_no: val,
          enabled: true,
        },
      ]);
    } else {
      const updatedVal = selectedRows.filter((item) => item.pk !== pk);
      setSelectedRows(updatedVal);
    }
    // const updatedData = [...stocksAvailableList];
    // updatedData[index].isCheck = !updatedData[index].isCheck;
    // updatedData[index].enabled = true;
    // setStocksAvailableList(updatedData);
  };
  const checkAllRows = (val) => {
    if (val) {
      setSelectedRows([]);
    } else {
      if (!props.process) {
        let allData = preGateOutTable?.data?.map((val) => ({
          pk: val.pk,
          container_no: val.container_no,
          enabled: true,
        }));
        setSelectedRows(allData);
      } else {
        let allData = advanceProcess?.pregate_out_list?.map((val) => ({
          pk: val.pk,
          container_no: val.container_no,
          enabled: true,
        }));
        setSelectedRows(allData);
      }
    }
  };

  const handleEditButtonClicked = (row) => {
    dispatch(getPreGateOutPkAction(row.pk, notify));
  };

  useEffect(() => {
    dispatch({
      type: ADVANCE_FINANCE_CONSTANT.PRE_GATE_OUT_TABLE,
      payload: {
        client: "",
        shipping_line: "",
        container_no: "",
      },
    });
  }, []);

  useEffect(() => {
    if (!props.process) {
      dispatch(getPreGateOutDataTableAction(notify));
    }
  }, [
    preGateOutTable.on_hold,
    preGateOutTable.validity_expired,
    preGateOutTable.is_gateout_done,
  ]);

  const handlePreGateOutFormDownload = (preGateOut_pk) => {
    dispatch(downloadPreGateOutFoemSixAction(preGateOut_pk, notify));
  };

  const Columns = [
    {
      Header: (
        <div>
          <Checkbox
            checked={
              selectedRows?.length ===
              (!props.process
                ? preGateOutTable?.data?.length
                : advanceProcess?.pregate_out_list?.length)
            }
            onClick={(e) => {
              checkAllRows(!e.target.checked);
            }}
            color="error"
            inputProps={{ "aria-label": "Checkbox A" }}
          />
        </div>
      ),
      width: 50,
      style: {
        textAlign: "center",
      },
      Cell: (row) => {
        return (
          <div>
            <Checkbox
              checked={selectedRows.some((item) => item.pk === row.original.pk)}
              key={row.original.pk}
              onClick={(e) => {
                handleCheck(row.original.pk, row.original.container_no);
              }}
              color="error"
              sx={{
                color: "black",
              }}
              inputProps={{ "aria-label": "Checkbox A" }}
            />
          </div>
        );
      },
    },
    {
      Header: <TableHeading filter>Created At</TableHeading>,
      accessor: "created_at",
      style: {
        textAlign: "center",
      },
      Cell: (row) => {
        return (
          <TableCellText title={row.original.created_at}>
            {row.original.created_at}
          </TableCellText>
        );
      },
    },
    {
      Header: <TableHeading filter>Client</TableHeading>,
      accessor: "client",
      style: {
        textAlign: "center",
      },
      Cell: (row) => {
        return (
          <TableCellText
            style={{ textAlign: "center" }}
            title={row.original.client}
          >
            {row.original.client}
          </TableCellText>
        );
      },
    },
    {
      Header: <TableHeading filter>Container No</TableHeading>,
      width: 150,
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
            color={row.original?.validity_expired ? "error" : "default"}
          />
        );
      },
    },
    {
      Header: <TableHeading filter>Size</TableHeading>,
      accessor: "size",
      style: {
        textAlign: "center",
      },
      Cell: (row) => {
        return (
          <TableCellText
            style={{ textAlign: "center" }}
            title={row.original.size}
          >
            {row.original.size}
          </TableCellText>
        );
      },
    },
    {
      Header: <TableHeading filter>Type</TableHeading>,
      accessor: "type",
      style: {
        textAlign: "center",
      },
      Cell: (row) => {
        return (
          <TableCellText
            style={{ textAlign: "center" }}
            title={row.original.type}
          >
            {row.original.type}
          </TableCellText>
        );
      },
    },

    {
      Header: <TableHeading filter>Shipping Line</TableHeading>,
      accessor: "shipping_line",
      style: {
        textAlign: "center",
      },
      Cell: (row) => {
        return (
          <TableCellText
            style={{ textAlign: "center" }}
            title={row.original.shipping_line}
          >
            {row.original.shipping_line}
          </TableCellText>
        );
      },
    },
    {
      Header: <TableHeading filter>Departed</TableHeading>,
      accessor: "departed",
      style: {
        textAlign: "center",
      },
      Cell: (row) => {
        return (
          <TableCellText
            style={{ textAlign: "center" }}
            title={row.original.departed}
          >
            {row.original.departed}
          </TableCellText>
        );
      },
    },
    {
      Header: <TableHeading filter>Validity Out Date</TableHeading>,
      accessor: "do_validity_out_date",
      style: {
        textAlign: "center",
      },
      Cell: (row) => {
        return (
          <TableCellText
            style={{
              color: row.original?.validity_expired
                ? "rgb(255,44,77)"
                : "rgb(22,139,82)",
              textAlign: "center",
            }}
            title={row.original.do_validity_out_date}
          >
            {row.original.do_validity_out_date}
          </TableCellText>
        );
      },
    },
    {
      Header: <TableHeading filter>Validity Out Time</TableHeading>,
      accessor: "do_validity_out_time",
      style: {
        textAlign: "center",
      },
      Cell: (row) => {
        return (
          <TableCellText
            style={{
              color: row.original?.validity_expired
                ? "rgb(255,44,77)"
                : "rgb(22,139,82)",
              textAlign: "center",
            }}
            title={row.original.do_validity_out_time}
          >
            {row.original.do_validity_out_time}
          </TableCellText>
        );
      },
    },

    {
      Header: <TableHeading filter>Booking no</TableHeading>,
      accessor: "bk_no",
      style: {
        textAlign: "center",
      },
      Cell: (row) => {
        return (
          <TableCellText title={row.original.bk_no}>
            {row.original.bk_no}
          </TableCellText>
        );
      },
    },

    {
      Header: <TableHeading filter>Is Gate Out Done</TableHeading>,
      accessor: "is_gateout_done",
      style: {
        textAlign: "center",
      },
      Cell: (row) => {
        return (
          <TableCellText title={row.original.is_gateout_done}>
            {row.original.is_gateout_done === true ? "Yes " : "No"}
          </TableCellText>
        );
      },
    },

    {
      Header: <TableHeading filter>Edit</TableHeading>,
      show: false,
      style: {
        textAlign: "center",
      },
      Cell: ({ original }) => {
        return (
          <Button
            variant="contained"
            color="primary"
            onClick={() => handleEditButtonClicked(original)}
          >
            Edit
          </Button>
        );
      },
    },
    {
      Header: <TableHeading filter>Form Download</TableHeading>,
      style: {
        textAlign: "center",
      },
      Cell: ({ original }) => {
        return (
          <Tooltip title="Download Form 6">
            <IconButton
              onClick={() => handlePreGateOutFormDownload(original.pk)}
            >
              <PictureAsPdfOutlinedIcon
                sx={(theme) => ({ fill: theme.palette.error.main })}
              />
            </IconButton>
          </Tooltip>
        );
      },
    },
  ];

  const handleDeleteDOValidityDate = () => {
    dispatch({
      type: ADVANCE_FINANCE_CONSTANT.PRE_GATE_OUT_TABLE,
      payload: {
        pg_no: 1,
        do_validity_date: {
          from_date: null,
          to_date: null,
        },
      },
    });
    dispatch(getPreGateOutDataTableAction(notify));
  };

  return (
    <div>
      {!props.process && <TablePageTitle>All Pre Gate Out</TablePageTitle>}
      {!props.process && (
        <Grid container spacing={2} style={{ marginTop: "32px" }}>
          <Grid
            size={{ xs: 10, sm: 10, md: 10, lg: 10, xl: 10 }}
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-start",
              gap: 2,
            }}
            item
          >
            <TableCustomSearchBar
              selectName={process}
              maxWidthSearch={"50%"}
              updateSelectname={handleSetProcess}
              searchText={searchText}
              setSearchText={handleSearchChange}
              closeClick={handleCloseClick}
              searchClick={handleSearchButton}
            >
              <MenuItem key={"client"} value="client">
                &nbsp; &nbsp;&nbsp;Client
              </MenuItem>
              <MenuItem key={"shipping_line"} value="shipping_line">
                &nbsp; &nbsp;&nbsp;Shipping Line
              </MenuItem>
              <MenuItem key={"container_no"} value="container_no">
                &nbsp; &nbsp;&nbsp;Container No
              </MenuItem>
            </TableCustomSearchBar>
            <TableAdvanceSearchWithModal
              open={open}
              handleClose={handleClose}
              handleOpen={handleOpen}
              style={{ width: "fit-content" }}
              activeFilter={
                preGateOutTable.do_validity_date.from_date !== null &&
                preGateOutTable.do_validity_date.to_date !== null
              }
            >
              <Box
                sx={{
                  padding: "20px 20px 20px",
                }}
              >
                <Stack
                  direction={"row"}
                  alignItems={"center"}
                  justifyContent={"space-between"}
                >
                  <Typography variant="h6" style={{ fontWeight: "bolder" }}>
                    Advance Search
                  </Typography>
                  <Stack
                    direction={"row"}
                    alignItems={"center"}
                    justifyContent={"space-between"}
                  >
                    <IconButton
                      variant="contained"
                      color="black"
                      onClick={() => {
                        handleAdvanceSearch();
                        handleClose();
                      }}
                    >
                      <SearchIcon style={{ fill: "black" }} />
                    </IconButton>
                    <IconButton
                      color="rgba(0,0,0,0.09)"
                      onClick={handleClearAdvance}
                    >
                      <RefreshIcon />
                    </IconButton>
                  </Stack>
                </Stack>

                <Divider style={{ backgroundColor: "rgba(0,0,0,0.09)" }} />

                <Typography
                  variant="subtitle2"
                  style={{
                    fontWeight: "600",
                    marginTop: "32px",
                    marginBottom: "8px",
                  }}
                >
                  {" "}
                  Date
                </Typography>

                <Stack
                  direction={"row"}
                  spacing={matchesIphone ? 0 : 2}
                  flexDirection={matchesIphone ? "column" : "row"}
                >
                  <Typography variant="caption">from </Typography>
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                      slotProps={{ textField: { size: "small" } }}
                      format="YYYY/MM/DD"
                      id={`-date-picker-inline`}
                      value={
                        preGateOutTable.do_validity_date.from_date
                          ? dayjs(preGateOutTable.do_validity_date.from_date)
                          : null
                      }
                      name="from_date"
                      onChange={(date) => {
                        handleDateChangeUTILSDispatch(
                          date,
                          dispatch,
                          ADVANCE_FINANCE_CONSTANT.PRE_GATE_OUT_TABLE,
                          "from_date",
                        );
                      }}
                    />
                  </LocalizationProvider>

                  <Typography variant="caption">to</Typography>
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                      slotProps={{ textField: { size: "small" } }}
                      format="YYYY/MM/DD"
                      id={`-date-picker-inline`}
                      value={
                        preGateOutTable.do_validity_date.to_date
                          ? dayjs(preGateOutTable.do_validity_date.to_date)
                          : null
                      }
                      name="from_date"
                      onChange={(date) => {
                        handleDateChangeUTILSDispatch(
                          date,
                          dispatch,
                          ADVANCE_FINANCE_CONSTANT.PRE_GATE_OUT_TABLE,
                          "to_date",
                        );
                      }}
                    />
                  </LocalizationProvider>
                </Stack>
              </Box>
            </TableAdvanceSearchWithModal>
            {!props.process && (
              <Chip
                label="Validity Expired"
                variant="filled"
                size="small"
                color={
                  preGateOutTable.validity_expired === true
                    ? "primary"
                    : "default"
                }
                sx={{ cursor: "pointer" }}
                onClick={() => {
                  const newValue =
                    preGateOutTable.validity_expired === true ? false : true;
                  dispatch({
                    type: ADVANCE_FINANCE_CONSTANT.PRE_GATE_OUT_TABLE,
                    payload: {
                      validity_expired: newValue,
                    },
                  });
                }}
              />
            )}
            {!props.process && (
              <Chip
                label="Gate Out Done"
                variant="filled"
                size="small"
                color={
                  preGateOutTable.is_gateout_done === true
                    ? "primary"
                    : "default"
                }
                sx={{ cursor: "pointer" }}
                onClick={() => {
                  const newValue =
                    preGateOutTable.is_gateout_done === true ? false : true;
                  dispatch({
                    type: ADVANCE_FINANCE_CONSTANT.PRE_GATE_OUT_TABLE,
                    payload: {
                      is_gateout_done: newValue,
                    },
                  });
                }}
              />
            )}
          </Grid>
        </Grid>
      )}

      <Grid
        container
        spacing={1}
        style={{ marginTop: "16px", marginLeft: matchesIphone ? "12px" : 0 }}
      >
        <Grid item size={{ xs: 6 }}></Grid>
        {selectedRows.length !== 0 ? (
          <Grid item size={{ xs: 2 }}>
            <Button
              style={{
                margin: "auto",
                display: "flex",
                alignItems: "center",
              }}
              size="medium"
              fullWidth
              variant="contained"
              color="success"
              onClick={() => {
                setOpenModal(true);
              }}
            >
              Update Validity
            </Button>
          </Grid>
        ) : (
          <Grid item size={{ xs: 2 }}></Grid>
        )}
        {selectedRows.length !== 0 ? (
          <Grid item size={{ sm: 1 }}>
            <Button
              style={{
                margin: "auto",
                display: "flex",
                alignItems: "center",
              }}
              fullWidth
              size="medium"
              variant="contained"
              color="error"
              onClick={() => {
                setOpenDeleteModal(true);
              }}
            >
              Delete
            </Button>
          </Grid>
        ) : (
          <Grid item size={{ sm: 1 }}></Grid>
        )}
        <Grid
          item
          size={{ xs: 3 }}
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            gap: 2,
          }}
        >
          {preGateOutTable.do_validity_date.from_date !== null &&
            preGateOutTable.do_validity_date.to_date !== null && (
              <Chip
                label={`${preGateOutTable.do_validity_date.from_date} / ${preGateOutTable.do_validity_date.to_date}`}
                variant="outlined"
                color="primary"
                size="small"
                onDelete={handleDeleteDOValidityDate}
              />
            )}
          <TableRefreshIcon onClick={handleClickRefreshTable} />
        </Grid>
      </Grid>
      <Box mt={1}></Box>
      <TableCustomAdvanceReactTable
        data={
          !props.process
            ? (preGateOutTable.data && preGateOutTable.data) || []
            : advanceProcess?.pregate_out_list
        }
        columns={[...Columns]}
        minRows={preGateOutTable.on_page_data_client}
        collapseOnDataChange={false}
        style={{
          alignItems: "center",
          textAlign: "center",
          display: "flex",
          justifyContent: "center",
          width: "100%",
        }}
        showPagination={false}
        defaultPageSize={
          !props.process
            ? Number(preGateOutTable.on_page_data_client)
            : advanceProcess?.pregate_out_list?.length
        }
        pageSize={
          !props.process
            ? Number(preGateOutTable.on_page_data_client)
            : advanceProcess?.pregate_out_list?.length
        }
      />
      {!props.process && (
        <TableCustomPaginationReactTable
          total_pages={preGateOutTable.total_pages}
          pg_no={preGateOutTable.pg_no}
          handlePaginationOnChange={handlePaginationOnChange}
          next_page={preGateOutTable.next_page}
          on_page_data={preGateOutTable.on_page_data_client}
          setCurrentPage={setCurrentPage}
          handleInitialPage={handleInitialPage}
          handleOnPageDataChange={handleOnPageDataChange}
        />
      )}

      <Modal open={openModal} onClose={handleModalClose}>
        <Box
          style={getModalStyle()}
          sx={{
            position: "absolute",
            width: "70%",
            backgroundColor: "white",
            boxShadow: 5,
            padding: 4,
            outline: "none",
            borderRadius: 2,
          }}
        >
          <Typography
            sx={{
              display: "flex",
              justifyContent: "center",

              flexWrap: "wrap",
              paddingTop: 4,
            }}
          >
            Total Containers Selected: {totalSelectedContainers()}
          </Typography>
          <Grid
            sx={{
              display: "flex",
              justifyContent: "center",

              flexWrap: "wrap",
              paddingTop: 4,
            }}
            style={{ paddingBottom: 4 }}
          >
            {selectedRows.length !== 0 &&
              selectedRows.map((option) => (
                <Chip
                  label={option.container_no}
                  clickable
                  sx={{
                    background:
                      option.enabled === true ? "lightgreen" : "#FFCCCB",
                    border:
                      option.enabled === true
                        ? "1px solid green"
                        : "1px solid red",
                    color: option.enabled === true ? "green" : "red",
                    "&:hover": {
                      cursor: "pointer",
                      background:
                        option.enabled === true ? "lightgreen" : "#FFCCCB",
                      border:
                        option.enabled === true
                          ? "1px solid green"
                          : "1px solid red",
                      color: option.enabled === true ? "green" : "red",
                    },
                    margin: 5,
                  }}
                  onClick={() => {
                    handleChip(option.pk);
                  }}
                  onDelete={() => {
                    handleChip(option.pk);
                  }}
                  deleteIcon={
                    option.enabled === true ? <DoneIcon /> : <CrossIcon />
                  }
                />
              ))}
          </Grid>

          <Stack
            direction={"row"}
            alignItems={"center"}
            justifyContent={"center"}
            spacing={2}
            mt={2}
            mb={2}
          >
            <Typography>Date</Typography>
            <DatePickerField
              dateId="validity-date"
              dateValue={validity.validity}
              dateChange={(date) =>
                handleDateChangeUTILSFlex(date, setValidity, "validity")
              }
              fullWidth
            />
            <Typography>Time</Typography>
            <TextField
              id="validity-time"
              type="time"
              name="do_validity_in_time"
              value={validity.time}
              variant="outlined"
              defaultValue={"23:59"}
              fullWidth
              sx={{
                "& .MuiOutlinedInput-root": {
                  "& fieldset": {
                    borderColor: "#243545",
                  },
                },
              }}
              size="small"
              autoComplete="off"
            />
            <Button
              onClick={handleSelectedValidityUpdate}
              fullWidth
              variant="contained"
              color="primary"
            >
              Update Validity
            </Button>
          </Stack>
        </Box>
      </Modal>
      <Modal open={openDeleteModal} onClose={handleModalCloseDelete}>
        <Box
          style={getModalStyle()}
          sx={{
            position: "absolute",
            width: "70%",
            backgroundColor: "white",
            boxShadow: 5,
            padding: 4,
            outline: "none",
            borderRadius: 2,
          }}
        >
          <Typography
            sx={{
              display: "flex",
              justifyContent: "center",

              flexWrap: "wrap",
              paddingTop: 4,
            }}
          >
            Total Containers Selected: {totalSelectedContainers()}
          </Typography>
          <Grid
            sx={{
              display: "flex",
              justifyContent: "center",

              flexWrap: "wrap",
              paddingTop: 4,
            }}
            style={{ paddingBottom: 4 }}
          >
            {selectedRows.length !== 0 &&
              selectedRows.map((option) => (
                <Chip
                  label={option.container_no}
                  clickable
                  sx={{
                    background:
                      option.enabled === true ? "lightgreen" : "#FFCCCB",
                    border:
                      option.enabled === true
                        ? "1px solid green"
                        : "1px solid red",
                    color: option.enabled === true ? "green" : "red",
                    "&:hover": {
                      cursor: "pointer",
                      background:
                        option.enabled === true ? "lightgreen" : "#FFCCCB",
                      border:
                        option.enabled === true
                          ? "1px solid green"
                          : "1px solid red",
                      color: option.enabled === true ? "green" : "red",
                    },
                    margin: 5,
                  }}
                  onClick={() => {
                    handleChip(option.pk);
                  }}
                  onDelete={() => {
                    handleChip(option.pk);
                  }}
                  deleteIcon={
                    option.enabled === true ? <DoneIcon /> : <CrossIcon />
                  }
                />
              ))}
          </Grid>

          <Stack
            direction={"row"}
            alignItems={"center"}
            justifyContent={"flex-end"}
            spacing={2}
            mt={2}
            mb={2}
          >
            <Button
              onClick={handleModalCloseDelete}
              variant="text"
              color="inherit"
            >
              Cancel
            </Button>

            <Button
              onClick={handleDeleteSelectedContainers}
              variant="contained"
              color="error"
            >
              Delete Selected
            </Button>
          </Stack>
        </Box>
      </Modal>
    </div>
  );
};

export default PreGateOutList;
