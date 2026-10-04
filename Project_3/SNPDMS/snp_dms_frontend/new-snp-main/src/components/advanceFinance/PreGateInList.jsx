import React, { useCallback, useEffect, useState } from "react";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers";
import dayjs from "dayjs";
import SearchIcon from "@mui/icons-material/Search";
import RefreshIcon from "@mui/icons-material/Refresh";
import {
  Box,
  Divider,
  Grid,
  IconButton,
  MenuItem,
  Typography,
  Button,
  TextField,
  Checkbox,
  Modal,
  Chip,
  useMediaQuery,
} from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { useSnackbar } from "notistack";
import { Alert, Stack } from "@mui/material";
import { ADVANCE_FINANCE_CONSTANT } from "../../reducers/AdvanceFinance/AdvanceFinanceReducer";
import {
  getPreGateInDataTableAction,
  getPreGateInPkAction,
  getSingleAdvanceFinanceProcessAction,
  handlePreGateInDeleteAction,
  handlePreGateInValidityUpdateAction,
} from "../../actions/AdvanceFinance/AdvanceFinanceAction";
import {
  handleDateChangeUTILSDispatch,
  handleDateChangeUTILSFlex,
} from "../../utils/WeekNumbre";
import DoneIcon from "@mui/icons-material/Done";
import CrossIcon from "@mui/icons-material/Cancel";
import DatePickerField from "@components/reusablecomponents/DatePickerField";
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

const PreGateInList = (props) => {
  const dispatch = useDispatch();
  const notify = useSnackbar().enqueueSnackbar;
  const { AdvanceFinanceReducer, user } = useSelector((state) => state);
  const { preGateIntable } = AdvanceFinanceReducer;
  const { advanceProcess } = AdvanceFinanceReducer;
  const [selectedRows, setSelectedRows] = useState([]);
  // eslint-disable-next-line no-unused-vars
  const [checkAll, setCheckAll] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [disable, setDisable] = useState(1);
  const [process, setProcess] = useState("client");
  const [searchText, setSearchText] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [validity, setValidity] = useState({
    validity: "",
    time: "23:59",
  });
  const [anchorElAdvance, setAnchorElAdvance] = React.useState(null);
  const openAdvance = Boolean(anchorElAdvance);
  const matchesIphone = useMediaQuery("(max-width:500px)");
  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const idAdvance = openAdvance ? "simple-popover-Advance" : undefined;

  const handleAdvanceSearch = () => {
    dispatch(getPreGateInDataTableAction(notify));
    handleCloseAdvance();
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
    dispatch({ type: ADVANCE_FINANCE_CONSTANT.PRE_GATE_IN_TABLE_INIT });

    dispatch(getPreGateInDataTableAction(notify));
    // handleCloseAdvance()
  };

  const handleClickAdvance = (event) => {
    setAnchorElAdvance(event.currentTarget);
  };

  const handleCloseAdvance = () => {
    setAnchorElAdvance(null);
  };

  const handleSetProcess = (event) => {
    setSearchText("");
    setProcess(event.target.value);
  };

  const handleEditButtonClicked = (row) => {
    dispatch(getPreGateInPkAction(row.pk, notify));
  };

  const checkAllRows = (val) => {
    if (val) {
      setSelectedRows([]);
    } else {
      if (!props.process) {
        let allData = preGateIntable?.data?.map((val) => ({
          pk: val.pk,
          container_no: val.container_no,
          enabled: true,
          is_gatein_done: val.is_gatein_done,
        }));
        setSelectedRows(allData);
      } else {
        let allData = advanceProcess?.pregate_in_list?.map((val) => ({
          pk: val.pk,
          container_no: val.container_no,
          enabled: true,
          is_gatein_done: val.is_gatein_done,
        }));
        setSelectedRows(allData);
      }
    }
  };

  const handleCheck = (pk, val, is_gatein_done) => {
    if (!selectedRows.some((value) => value.pk === pk)) {
      setSelectedRows([
        ...selectedRows,
        {
          pk,
          container_no: val,
          is_gatein_done: is_gatein_done,
          enabled: true,
        },
      ]);
    } else {
      const updatedVal = selectedRows.filter((item) => item.pk !== pk);
      setSelectedRows(updatedVal);
    }
  };

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
    let counts = selectedRows?.filter((item) => item.enabled).length;
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
    if (user.role !== "Admin") {
      notify("Only Admin user are  authorized to perform this action", {
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
      handlePreGateInValidityUpdateAction(
        selected_containers,
        validity.validity,
        validity.time,
        handleModalClose,
        notify,
      ),
    );
  };

  const handleDeleteSelectedContainers = () => {
    if (user.role !== "Admin") {
      notify("Only Admin user are  authorized to perform this action", {
        variant: "error",
      });
      return;
    }
    let selectedValue = selectedRows.map((item) => {
      if (item.enabled && !item.is_gatein_done) {
        return item.pk;
      } else {
        return null;
      }
    });
    let selected_containers_delete = selectedValue.filter(
      (item) => item !== null,
    );

    dispatch(
      handlePreGateInDeleteAction(
        props.paymentID,
        selected_containers_delete,
        handleModalCloseDelete,
        props?.process,
        setSelectedRows,
        notify,
      ),
    );
  };

  const handleClickRefreshTable = () => {
    dispatch({ type: ADVANCE_FINANCE_CONSTANT.PRE_GATE_IN_TABLE_INIT });
    setSelectedRows([]);
    if (props?.process) {
      dispatch(getSingleAdvanceFinanceProcessAction(props?.paymentID, notify));
    } else {
      dispatch(getPreGateInDataTableAction(notify));
    }
  };

  const handleSearchChange = useCallback(
    (e) => setSearchText(e.target.value),
    [searchText],
  );

  const handleSearchButton = useCallback(() => {
    dispatch({
      type: ADVANCE_FINANCE_CONSTANT.PRE_GATE_IN_TABLE_EDIT,
      payload: {
        client: "",
        shipping_line: "",
        container_no: "",
      },
    });
    dispatch({
      type: ADVANCE_FINANCE_CONSTANT.PRE_GATE_IN_TABLE_EDIT,
      payload: {
        pg_no: 1,
        [process]:
          process === "container_no" ? searchText.split(",") : searchText,
      },
    });
    dispatch(getPreGateInDataTableAction(notify));
  }, [searchText, notify, process]);

  const handleCloseClick = useCallback(() => setSearchText(""), [searchText]);

  useEffect(() => {
    dispatch({
      type: ADVANCE_FINANCE_CONSTANT.PRE_GATE_IN_TABLE_EDIT,
      payload: {
        client: "",
        shipping_line: "",
        container_no: "",
      },
    });
  }, []);

  useEffect(() => {
    if (!props.process) {
      dispatch(getPreGateInDataTableAction(notify));
    }
  }, [
    preGateIntable.on_hold,
    preGateIntable.validity_expired,
    preGateIntable.is_gatein_done,
    preGateIntable.is_survey_done,
  ]);

  const Columns = [
    {
      Header: (
        <div>
          <Checkbox
            checked={
              selectedRows?.length ===
              (!props.process
                ? preGateIntable?.data?.length
                : advanceProcess?.pregate_in_list.length)
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
                handleCheck(
                  row.original.pk,
                  row.original.container_no,
                  row.original.is_gatein_done,
                );
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
          <TableCellText
            title={row.original.created_at}
            style={{ textAlign: "center" }}
          >
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
      Header: <TableHeading filter>Arrived</TableHeading>,
      accessor: "arrived",
      style: {
        textAlign: "center",
      },
      Cell: (row) => {
        return (
          <TableCellText
            style={{ textAlign: "center" }}
            title={row.original.arrived}
          >
            {row.original.arrived}
          </TableCellText>
        );
      },
    },
    {
      Header: <TableHeading filter>Validity In Date</TableHeading>,
      accessor: "do_validity_in_date",
      style: {
        textAlign: "center",
      },
      Cell: (row) => {
        return (
          <TableCellText
            title={row.original.do_validity_in_date}
            style={{
              color: row.original?.validity_expired
                ? "rgb(255,44,77)"
                : "rgb(22,139,82)",
              textAlign: "center",
            }}
          >
            {row.original.do_validity_in_date}
          </TableCellText>
        );
      },
    },
    {
      Header: <TableHeading filter>Validity In Time</TableHeading>,
      accessor: "do_validity_in_time",
      style: {
        textAlign: "center",
      },
      Cell: (row) => {
        return (
          <TableCellText
            title={row.original.do_validity_in_time}
            style={{
              color: row.original?.validity_expired
                ? "rgb(255,44,77)"
                : "rgb(22,139,82)",
              textAlign: "center",
            }}
          >
            {row.original.do_validity_in_time}
          </TableCellText>
        );
      },
    },

    {
      Header: <TableHeading filter>Billing no</TableHeading>,
      accessor: "bl_no",
      style: {
        textAlign: "center",
      },
      Cell: (row) => {
        return (
          <TableCellText
            style={{ textAlign: "center" }}
            title={row.original.bl_no}
          >
            {row.original.bl_no}
          </TableCellText>
        );
      },
    },

    {
      Header: <TableHeading filter> Survey Done</TableHeading>,
      accessor: "is_survey_done",
      style: {
        textAlign: "center",
      },
      Cell: (row) => {
        return (
          <TableCellText
            style={{ textAlign: "center" }}
            title={row.original.is_survey_done}
          >
            {row.original.is_survey_done === true ? "Yes " : "No"}
          </TableCellText>
        );
      },
    },
    {
      Header: <TableHeading filter> Gate In Done</TableHeading>,
      accessor: "is_gatein_done",
      style: {
        textAlign: "center",
      },
      Cell: (row) => {
        return (
          <TableCellText
            style={{ textAlign: "center" }}
            title={row.original.is_gatein_done}
          >
            {row.original.is_gatein_done === true ? "Yes " : "No"}
          </TableCellText>
        );
      },
    },
    {
      Header: <TableHeading filter>Edit</TableHeading>,
      style: {
        textAlign: "center",
      },
      show: props.process === undefined || props.process === "" ? false : true,
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
  ];

  const handlePaginationOnChange = (e, val) => {
    dispatch({
      type: ADVANCE_FINANCE_CONSTANT.PRE_GATE_IN_TABLE_EDIT,
      payload: {
        pg_no: val,
      },
    });
    dispatch(getPreGateInDataTableAction(notify));
  };

  const handleInitialPage = () => {
    dispatch({
      type: ADVANCE_FINANCE_CONSTANT.PRE_GATE_IN_TABLE_EDIT,
      payload: {
        pg_no: 1,
      },
    });
    dispatch(getPreGateInDataTableAction(notify));
  };

  const handleOnPageDataChange = (value) => {
    dispatch({
      type: ADVANCE_FINANCE_CONSTANT.PRE_GATE_IN_TABLE_EDIT,
      payload: {
        pg_no: 1,
        on_page_data_client: value,
      },
    });
    dispatch(getPreGateInDataTableAction(notify));
  };

  const handleDeleteDOValidityDate = () => {
    dispatch({
      type: ADVANCE_FINANCE_CONSTANT.PRE_GATE_IN_TABLE_EDIT,
      payload: {
        pg_no: 1,
        do_validity_date: {
          from_date: null,
          to_date: null,
        },
      },
    });
    dispatch(getPreGateInDataTableAction(notify));
  };
  return (
    <div>
      {!props.process && (
        <Stack
          direction={"row"}
          alignItems={"center"}
          justifyContent={"flex-start"}
          mb={6}
          spacing={2}
        >
          <TablePageTitle>All Pre Gate In</TablePageTitle>
        </Stack>
      )}
      {!props.process && (
        <Grid container spacing={2} style={{ marginTop: "32px" }}>
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
              maxWidthSearch={"60%"}
              selectName={process}
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
                preGateIntable.do_validity_date.from_date !== null &&
                preGateIntable.do_validity_date.to_date !== null
              }
            >
              <Box>
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
                        preGateIntable.do_validity_date.from_date
                          ? dayjs(preGateIntable.do_validity_date.from_date)
                          : null
                      }
                      name="from_date"
                      onChange={(date) => {
                        handleDateChangeUTILSDispatch(
                          date,
                          dispatch,
                          ADVANCE_FINANCE_CONSTANT.PRE_GATE_IN_TABLE_ADVANCE_SEARCH,
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
                        preGateIntable.do_validity_date.to_date
                          ? dayjs(preGateIntable.do_validity_date.to_date)
                          : null
                      }
                      name="to_date"
                      onChange={(date) => {
                        handleDateChangeUTILSDispatch(
                          date,
                          dispatch,
                          ADVANCE_FINANCE_CONSTANT.PRE_GATE_IN_TABLE_ADVANCE_SEARCH,
                          "to_date",
                        );
                      }}
                    />
                  </LocalizationProvider>
                </Stack>
              </Box>
            </TableAdvanceSearchWithModal>
          </Grid>
        </Grid>
      )}
      <Grid
        container
        spacing={2}
        style={{ marginTop: "16px", marginLeft: matchesIphone ? "12px" : 0 }}
      >
        <Grid item size={{ xs: 12, sm: 6 }}>
          {!props.process && (
            <Stack
              direction={"row"}
              alignItems={"center"}
              justifyContent={"flex-start"}
              spacing={2}
              flexWrap={"wrap"}
            >
              <Chip
                variant="filled"
                size="small"
                color={
                  preGateIntable.validity_expired === true
                    ? "primary"
                    : "default"
                }
                onClick={() => {
                  const newValue =
                    preGateIntable.validity_expired === true ? false : true;
                  dispatch({
                    type: ADVANCE_FINANCE_CONSTANT.PRE_GATE_IN_TABLE_EDIT,
                    payload: {
                      validity_expired: newValue,
                    },
                  });
                }}
                label="Validity Expired"
              />
              <Chip
                variant="filled"
                size="small"
                color={
                  preGateIntable.is_gatein_done === true ? "primary" : "default"
                }
                onClick={() => {
                  const newValue =
                    preGateIntable.is_gatein_done === true ? false : true;
                  dispatch({
                    type: ADVANCE_FINANCE_CONSTANT.PRE_GATE_IN_TABLE_EDIT,
                    payload: {
                      is_gatein_done: newValue,
                    },
                  });
                }}
                label="Gate In Done"
              />
              <Chip
                variant="filled"
                size="small"
                color={
                  preGateIntable.is_survey_done === true ? "primary" : "default"
                }
                onClick={() => {
                  const newValue =
                    preGateIntable.is_survey_done === true ? false : true;
                  dispatch({
                    type: ADVANCE_FINANCE_CONSTANT.PRE_GATE_IN_TABLE_EDIT,
                    payload: {
                      is_survey_done: newValue,
                    },
                  });
                }}
                label="Survey Done"
              />
            </Stack>
          )}
        </Grid>

        {selectedRows?.length !== 0 ? (
          <Grid item size={{ xs: 12, sm: 2 }}>
            <Button
              style={{
                margin: "auto",
                display: "flex",
                alignItems: "center",
              }}
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
          <Grid item size={{ xs: 12, sm: 2 }}></Grid>
        )}
        {selectedRows?.length !== 0 ? (
          <Grid item size={{ sm: 1 }}>
            <Button
              style={{
                margin: "auto",
                display: "flex",
                alignItems: "center",
              }}
              fullWidth
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
          size={{ sm: 3 }}
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
          }}
        >
          {preGateIntable.do_validity_date.from_date !== null &&
            preGateIntable.do_validity_date.to_date !== null && (
              <Chip
                label={`${preGateIntable.do_validity_date.from_date} / ${preGateIntable.do_validity_date.to_date}`}
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
            ? (preGateIntable.data && preGateIntable.data) || []
            : advanceProcess?.pregate_in_list
        }
        columns={[...Columns]}
        minRows={Number(preGateIntable.on_page_data_client)}
        style={{
          alignItems: "center",
          textAlign: "center",
          display: "flex",
          justifyContent: "center",
          width: "100%", // This will force the table body to overflow and scroll, since there is not enough room
        }}
        defaultPageSize={
          !props.process
            ? Number(preGateIntable.on_page_data_client)
            : Number(advanceProcess?.pregate_in_list?.length)
        }
        pageSize={
          !props.process
            ? Number(preGateIntable.on_page_data_client)
            : Number(advanceProcess?.pregate_in_list?.length)
        }
      />
      {!props.process && (
        <TableCustomPaginationReactTable
          total_pages={preGateIntable.total_pages}
          pg_no={preGateIntable.pg_no}
          handlePaginationOnChange={handlePaginationOnChange}
          next_page={preGateIntable.next_page}
          on_page_data={preGateIntable.on_page_data_client}
          setCurrentPage={setCurrentPage}
          handleInitialPage={handleInitialPage}
          handleOnPageDataChange={handleOnPageDataChange}
          removeInitialPage={true}
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
            {selectedRows?.length !== 0 &&
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
              fullWidth
              defaultValue={"23:59"}
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
              variant="contained"
              color="primary"
              fullWidth
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
          <Alert severity="info">Gate In Containers cannot be deleted.</Alert>
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
              color="primary"
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

export default PreGateInList;
