import React, { useEffect, useState } from "react";

import {
  TextField,
  MenuItem,
  Checkbox,
  useMediaQuery,
  Chip,
  alpha,
  Modal,
  Box,
  Typography,
  Grid,
  Button,
} from "@mui/material";
import { useSnackbar } from "notistack";
import { useDispatch, useSelector } from "react-redux";
import {
  searchStocksDispatch,
  editStocksRowValues,
} from "../actions/StocksAndAllotmentActions";
import InfoIcon from "@mui/icons-material/Info";
import { theme } from "../App";
import { Stack } from "@mui/material";
import {
  TableCellText,
  TableCustomAdvanceReactTable,
  TableCustomPaginationReactTable,
  TableHeading,
} from "./TableComponent/TableComponent";
import ClearIcon from "@mui/icons-material/Clear";
import { customLabelTypography } from "@/utils/CustomClasses";
import GateInTextField from "./reusablecomponents/GateInTextField";

const DropDownTextField = (props) => {
  const dispatch = useDispatch();
  const storeState = useSelector((state) => state.stocksAndAllotmentSearch);
  const notify = useSnackbar().enqueueSnackbar;
  const [openSealNumberChangeModal, setOpenSealNumberChangeModal] =
    React.useState(false);
  const [changeRemark, setChangeRemark] = useState("");
  const [newSelectedSealNumber, setNewSelectedSealNumber] = useState("");

  const handleSealNumberChangeModalOpen = () =>
    setOpenSealNumberChangeModal(true);
  const handleSealNumberChangeCloseModal = () =>
    setOpenSealNumberChangeModal(false);

  const {
    dropdownList,
    dropDId,
    row,
    dropKey,
    dropDownColumnName,
    isDisabled,
  } = props;

  // useEffect(() => {

  //   if (row?.value) setFieldValue(row?.value);
  // }, [row?.value]);

  const handleUpdateSealNumberChange = () => {
    if (changeRemark === "") {
      notify("Please add Remarks to change Seal Number", {
        variant: "warning",
      });
      return;
    }
    row.original[dropDownColumnName] = newSelectedSealNumber;
    row.original.seal_no_remarks = changeRemark;

    dispatch(
      editStocksRowValues(
        row.original.pk,
        row.original,
        storeState,
        notify,
        handleSealNumberChangeCloseModal,
      ),
    );
  };

  return (
    <>
      <TextField
        id={dropDId}
        key={dropKey}
        select
        value={row?.original[dropDownColumnName]}
        defaultValue={row?.original[dropDownColumnName]}
        variant="outlined"
        fullWidth
        disabled={isDisabled}
        size="small"
        onChange={(e) => {
          if (dropDownColumnName === "seal_no" && props.isSealNumberEmpty) {
            handleSealNumberChangeModalOpen();
            setNewSelectedSealNumber(e.target.value);
            return;
          }
          row.original[dropDownColumnName] = e.target.value;

          dispatch(
            editStocksRowValues(
              row.original.pk,
              row.original,
              storeState,
              notify,
            ),
          );
        }}
      >
        {dropdownList &&
          dropdownList.map((option) => (
            <MenuItem key={option} value={option} style={{ height: "18px" }}>
              {option}
            </MenuItem>
          ))}
      </TextField>
      <Modal
        open={openSealNumberChangeModal}
        onClose={handleSealNumberChangeCloseModal}
      >
        <Box
          sx={(theme) => ({
            top: "20%",
            position: "absolute",
            background: "#FFF",
            width: "85%",
            height: "max-content",
            margin: "auto",
            left: "10%",
            borderRadius: 2,
            padding: "15px 25px",
            pointerEvents: "painted",
            [theme.breakpoints.down("sm")]: {
              height: "90vh",
              overflowY: "scroll",
              width: "95%",
              left: "2%",
              top: "2%",
            },
          })}
        >
          <Stack
            direction={"row"}
            alignItems={"center"}
            justifyContent={"space-between"}
          >
            <Typography variant="subtitle1">Change Seal Number </Typography>
            <ClearIcon onClick={handleSealNumberChangeCloseModal} />
          </Stack>

          <Grid container spacing={2} mt={8} sx={{ mx: 12 }}>
            <Grid item size={{ xs: 6 }}>
              <Typography variant="subtitle2" sx={customLabelTypography}>
                Current Seal Number{" "}
              </Typography>
              <GateInTextField
                fullWidth
                value={row?.original?.seal_no}
                readOnlyP={true}
              />
            </Grid>
            <Grid item size={{ xs: 6 }}>
              <Typography variant="subtitle2" sx={customLabelTypography}>
                New Seal Number <span style={{ color: "red" }}>*</span>
              </Typography>

              <GateInTextField
                value={newSelectedSealNumber}
                fullWidth
                readOnlyP={true}
              />
            </Grid>
            <Grid item size={{ xs: 12 }}>
              <Typography variant="subtitle2" sx={customLabelTypography}>
                Add Remark <span style={{ color: "red" }}>*</span>
              </Typography>

              <TextField
                id="seal-number-change-remark"
                select
                value={changeRemark}
                variant="outlined"
                fullWidth
                size="small"
                onChange={(e) => {
                  setChangeRemark(e.target.value);
                }}
              >
                {["Damaged", "Cut", "Wrong Allotment"].map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
          </Grid>
          <Button
            variant="contained"
            color="secondary"
            sx={{ mt: 12, display: "block", mx: "auto" }}
            onClick={handleUpdateSealNumberChange}
          >
            {" "}
            Update Seal Number
          </Button>
        </Box>
      </Modal>
    </>
  );
};
const EditableTextField = (props) => {
  const dispatch = useDispatch();
  const storeState = useSelector((state) => state.stocksAndAllotmentSearch);
  const notify = useSnackbar().enqueueSnackbar;

  const { dropDId, row, dropKey, editableColumnName, isDisabled } = props;

  const [fieldValue, setFieldValue] = useState("");

  useEffect(() => {
    if (row.value) setFieldValue(row.value);
  }, [row.value]);

  return (
    <TextField
      id={dropDId}
      key={dropKey}
      value={fieldValue}
      variant="outlined"
      disabled={isDisabled}
      fullWidth
      size="small"
      onChange={(e) => {
        setFieldValue(e.target.value);
      }}
      onBlur={(e) => {
        row.original[editableColumnName] = e.target.value;
        dispatch(
          editStocksRowValues(
            row.original.pk,
            row.original,
            storeState,
            notify,
          ),
        );
      }}
    />
  );
};

const StocksAndAllotmentListing = (props) => {
  const [stocksAvailableList, setStocksAvailableList] = useState([]);
  const matchesIphone = useMediaQuery("(max-width:500px)");

  const store = useSelector((state) => state);
  const { gateIn, stocksAndAllotment, stocksAndAllotmentSearch, ui } = store;
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRows, setSelectedRows] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [selectedStockList, setSelectedStockList] = useState([]);
  const [checkAll, setCheckAll] = useState(false);
  const notify = useSnackbar().enqueueSnackbar;
  const dispatch = useDispatch();
  const matchesIpad = useMediaQuery(theme.breakpoints.down("md"));
  const filtered =
    gateIn.allDropDown &&
    gateIn.allDropDown.stock_stage &&
    gateIn.allDropDown.stock_stage.filter((value) => value !== "Alloted");

  useEffect(() => {
    if (ui.depotGateType === "STOCKS") {
      dispatch(searchStocksDispatch(stocksAndAllotmentSearch));
    }
  }, [
    store.stocksAndAllotmentSearch.out_history,
    store.stocksAndAllotmentSearch.do_not_lift_queue,
    store.stocksAndAllotmentSearch.booking_no,
    store.stocksAndAllotmentSearch.pg_no,
    store.stocksAndAllotmentSearch.on_page_data,
    store.stocksAndAllotmentSearch.sealno_list,
    store.stocksAndAllotmentSearch.queued_recently,
  ]);

  useEffect(() => {
    return () => {
      dispatch({ type: "RESET_STOCK_ALLOTMENT_DATA" });
    };
  }, []);

  useEffect(() => {
    if (ui.depotGateType === "STOCKS") {
      let tempArray = [];
      stocksAndAllotment?.itemListing.length > 0 &&
        stocksAndAllotment.itemListing.map((row) => {
          let tempObj = {
            isShowCheck:
              (stocksAndAllotmentSearch.out_history === "True" &&
                row.status === "Alloted") ||
              (stocksAndAllotmentSearch.out_history === "False" &&
                (row.status === "Available" ||
                  row.status === "Without_Repair_Available")) ||
              row.status === "Alloted" ||
              stocksAndAllotmentSearch.do_not_lift_queue === "True",
            isCheck: false,
            enabled: false,
            pk: row.pk,
            queued_recently: row.queued_recently,
            allotment_date: row.allotment_date,
            approval_date: row.approval_date,
            approval_time: row.approval_time,
            automatic_mnr_status_change: row.automatic_mnr_status_change,
            available_date: row.available_date,
            available_time: row.available_time,
            booking_no: row.booking_no,
            do_not_lift_remarks: row.do_not_lift_remarks,
            aging: row.aging,
            client: row.client,
            container_no: row.container_no,
            container_no_is_valid: row.container_no_is_valid,
            container_status: row.container_status,
            empty_allotment_date: row.empty_allotment_date,
            estimate_date: row.estimate_date,
            estimate_time: row.estimate_time,
            gate_in: row.gate_in,
            gate_out: row.gate_out,
            grade: row.grade,
            in_do_not_lift_queue: row.in_do_not_lift_queue,
            is_alloted: row.is_alloted,
            is_estimate_westim_sent: row.is_estimate_westim_sent,
            is_repair_destim_sent: row.is_repair_destim_sent,
            line: row.line,
            remarks: row.remarks,
            repair_date: row.repair_date,
            repair_time: row.repair_time,
            seal_no: row.seal_no,
            sealno_list: row.sealno_list,
            size: row.size,
            sr_no: row.sr_no,
            status: row.status,
            survey_date: row.survey_date,
            survey_time: row.survey_time,
            type: row.type,
            usa_approval_container: row.usa_approval_container,
          };
          tempArray.push(tempObj);
        });
      tempArray.map((item, i) => {
        if (selectedRows?.includes(item.pk)) {
          item.isCheck = true;
          item.enabled = true;
        }
        return item;
      });
      const allChecked = tempArray.every((item) => item.isCheck);
      setCheckAll(allChecked);
      setStocksAvailableList(tempArray);
    }
  }, [stocksAndAllotment.itemListing]);

  useEffect(() => {
    if (ui.depotGateType === "STOCKS") {
      const newData = stocksAvailableList.map((item) => ({
        ...item,
        isCheck: false,
        enabled: false,
      }));
      setCheckAll(false);
      setStocksAvailableList(newData);
      setSelectedItems([]);
    }
  }, [stocksAndAllotment.container_status]);

  const checkAllRows = (val) => {
    let array2 = [...selectedRows];
    let tempArrayOfStage = [...selectedItems];
    const bookingNos = stocksAvailableList.filter(
      (item) => item.booking_no !== "",
    );
    let isShowError = false;
    if (stocksAvailableList.every((item) => item.booking_no === "")) {
      isShowError = true;
    } else if (
      bookingNos.every((item) => item.booking_no === bookingNos[0].booking_no)
    ) {
      isShowError = true;
    }
    if (isShowError) {
      const updatedArray = stocksAvailableList.map((item) => ({
        ...item,
        isCheck: val,
        enabled: true,
      }));
      updatedArray.forEach((item) => {
        if (!array2.includes(item.pk)) {
          array2.push(item.pk);
        }
        if (item.isCheck) {
          tempArrayOfStage.push({
            pk: item.pk,
            status: item.status,
            booking_no: item.booking_no,
          });
        } else {
          tempArrayOfStage = [];
        }
      });
      setSelectedItems(tempArrayOfStage);
      setSelectedRows(array2);
      setStocksAvailableList(updatedArray);
      setCheckAll(val);
    } else {
      notify("Selection of containers must have same booking number", {
        variant: "warning",
      });
    }
  };
  useEffect(() => {
    if (ui.depotGateType === "STOCKS") {
      const selectedArray = stocksAvailableList.filter((item) => item.isCheck);
      setSelectedStockList(selectedArray);
      dispatch({
        type: "SET_CHECK_ROW",
        payload: selectedArray,
      });
    }
  }, [stocksAvailableList]);

  const handleCheck = (index, id, val, bookingNo) => {
    let isApplicableCheck = false;
    if (
      selectedStockList.every(
        (item) => item.booking_no.toUpperCase() === bookingNo.toUpperCase(),
      )
    ) {
      isApplicableCheck = true;
    }
    if (isApplicableCheck) {
      if (!selectedRows.includes(id) && val) {
        setSelectedRows([...selectedRows, id]);
      } else {
        const updatedVal = selectedRows.filter((item) => item !== id);
        setSelectedRows(updatedVal);
      }
      const updatedData = [...stocksAvailableList];
      updatedData[index].isCheck = !updatedData[index].isCheck;
      updatedData[index].enabled = true;
      setStocksAvailableList(updatedData);
    } else {
      notify("Selection of containers must have same booking number", {
        variant: "warning",
      });
    }
  };

  const handlePaginationOnChange = (e, val) => {
    dispatch({
      type: "TOGGLE_PAGE_NO_SEARCH_VALUE",
      payload: val,
    });
  };

  const handleInitialPage = () => {
    dispatch({
      type: "TOGGLE_PAGE_NO_SEARCH_VALUE",
      payload: 1,
    });
  };

  const handleOnPageDataChange = (value) => {
    dispatch({
      type: "TOGGLE_PAGE_NO_SEARCH_VALUE",
      payload: 1,
    });
    dispatch({
      type: "TOGGLE_ON_PAGE_DATA_SEARCH_VALUE",
      payload: value,
    });
  };

  const Columns = [
    {
      Header: (
        <div>
          {stocksAvailableList?.length > 0 &&
            stocksAvailableList.every((item) => item.status !== "Alloted") &&
            stocksAvailableList[0].isShowCheck && (
              <Checkbox
                checked={checkAll}
                onClick={(e) => {
                  checkAllRows(e.target.checked);
                }}
                color="primary"
                inputProps={{ "aria-label": "Checkbox A" }}
                aria-sort="none"
              />
            )}
        </div>
      ),
      width: 50,
      style: {
        textAlign: "center",
      },
      Cell: (row) => {
        if (row.original.isShowCheck) {
          return (
            <div>
              <Checkbox
                checked={row.original.isCheck}
                key={row.original.pk}
                onClick={(e) => {
                  handleCheck(
                    row.index,
                    row.original.pk,
                    e.target.checked,
                    row.original.booking_no,
                  );
                }}
                color="primary"
                sx={{ color: "black" }}
                inputProps={{ "aria-label": "Checkbox A" }}
              />
            </div>
          );
        }
      },
    },
    {
      Header: <TableHeading filter>No</TableHeading>,
      width: 50,
      accessor: "sno",
      style: {
        textAlign: "center",
      },
      Cell: (row) => {
        return (
          <TableCellText title={row.original}>
            {row.original.sr_no}
          </TableCellText>
        );
      },
    },
    {
      Header: <TableHeading filter>Client</TableHeading>,
      accessor: "client",
      style: {
        textAlign: "left",
      },
      Cell: (row) => {
        return (
          <TableCellText title={row.original.remarks}>
            {row.original.client}
          </TableCellText>
        );
      },
    },
    {
      Header: <TableHeading filter>Ref Code</TableHeading>,
      accessor: "line",
      style: {
        textAlign: "center",
      },
      Cell: (row) => {
        return (
          <TableCellText title={row.original.remarks}>
            {row.original.line}
          </TableCellText>
        );
      },
    },
    {
      Header: <TableHeading filter>Gate In Date</TableHeading>,

      accessor: "gate_in",
      style: {
        textAlign: "center",
      },
      Cell: (row) => {
        return (
          <TableCellText title={row.original.remarks}>
            {row.original.gate_in}
          </TableCellText>
        );
      },
    },
    {
      Header: <TableHeading filter>Gate Out Date</TableHeading>,
      show:
        store.stocksAndAllotmentSearch.out_history === "True" ? true : false,
      accessor: "gate_out",
      style: {
        textAlign: "center",
      },
      Cell: (row) => {
        return (
          <TableCellText title={row.original.remarks}>
            {row.original.gate_out}
          </TableCellText>
        );
      },
    },
    {
      width: 150,
      Header: <TableHeading filter>Container No.</TableHeading>,
      sortable: false,
      accessor: "container_no",
      style: {
        textAlign: "center",
      },
      Cell: (row) => {
        return (
          <Stack
            direction={"row"}
            flexDirection={"row"}
            alignItems={"center"}
            justifyContent={"center"}
          >
            <Chip
              label={row.original.container_no}
              variant="filled"
              size="medium"
              color="info"
              sx={(theme) => ({
                bgcolor: alpha(theme.palette.info.light, 0.1),
                color:
                  row.original.container_no_is_valid === false
                    ? "#FF0000"
                    : "#000",
              })}
            />

            {row.original.remarks && (
              <span title="Click to View Container Remark">
                <InfoIcon
                  color="primary"
                  onClick={() =>
                    notify(row.original.remarks, {
                      variant: "info",
                    })
                  }
                />
              </span>
            )}
            {/* </span> */}
          </Stack>
        );
      },
    },
    {
      Header: <TableHeading filter>Size</TableHeading>,
      sortable: false,
      width: 50,
      accessor: "size",
      style: {
        textAlign: "center",
      },
      Cell: (row) => {
        return (
          <TableCellText title={row.original.remarks}>
            {row.original.size}
          </TableCellText>
        );
      },
    },
    {
      Header: <TableHeading filter>Type</TableHeading>,
      width: 50,
      sortable: false,
      accessor: "type",
      style: {
        textAlign: "center",
      },
      Cell: (row) => {
        return (
          <TableCellText title={row.original.remarks}>
            {row.original.type}
          </TableCellText>
        );
      },
    },
    {
      Header: <TableHeading filter>Grade</TableHeading>,
      width: 50,
      sortable: false,
      accessor: "grade",
      Cell: (row) => (
        <DropDownTextField
          dropdownList={gateIn.allDropDown && gateIn.allDropDown.grade}
          dropDownColumnName="grade"
          dropDId={`stock-grade-drop-${row.index}`}
          dropKey={`stock-grade-key-${row.index}`}
          row={row}
          isDisabled={false}
        />
      ),
      style: {
        textAlign: "center",
      },
    },
    {
      Header: <TableHeading filter>Status</TableHeading>,
      accessor: "status",
      Cell: (row) => (
        <DropDownTextField
          dropdownList={
            row.original.in_do_not_lift_queue === "True" ||
            (row.original.is_alloted === "True" &&
              row.original.status === "Alloted")
              ? gateIn.allDropDown && gateIn.allDropDown.stock_stage
              : filtered
          }
          dropDownColumnName="status"
          dropDId={`stock-status-drop-${row.index}`}
          dropKey={`stock-status-key-${row.index}`}
          row={row}
          isDisabled={
            row.original.automatic_mnr_status_change === "True" ||
            row.original.in_do_not_lift_queue === "True" ||
            (row.original.is_alloted === "True" &&
              row.original.status === "Alloted")
              ? true
              : false
          }
        />
      ),
      style: {
        textAlign: "center",
      },
    },
    {
      Header: <TableHeading filter>Available Date</TableHeading>,
      accessor: "available_date",
      style: {
        textAlign: "center",
      },
      Cell: (row) => {
        return row.original.status === "Available" ||
          row.original.status === "Alloted" ? (
          <EditableTextField
            dropDId={`stock-seal-edit-${row.index}`}
            dropKey={`stock-seal-key-${row.index}`}
            editableColumnName="available_date"
            row={row}
          />
        ) : (
          <TableCellText title={row.original.remarks}>
            {row.original.available_date}
          </TableCellText>
        );
      },
    },
    {
      Header: <TableHeading>Ageing</TableHeading>,
      width: 50,
      sortable: false,
      accessor: "aging",
      style: {
        textAlign: "center",
      },
      Cell: (row) => {
        return (
          <TableCellText title={row.original.remarks}>
            {row.original.aging}
          </TableCellText>
        );
      },
    },

    {
      Header: <TableHeading filter>Allotment Date</TableHeading>,
      accessor: "allotment_date",
      style: {
        textAlign: "center",
      },
      Cell: (row) => {
        return (
          <TableCellText title={row.original.remarks}>
            {row.original.allotment_date}
          </TableCellText>
        );
      },
    },

    {
      Header: <TableHeading>Booking Number</TableHeading>,
      sortable: false,
      width: 50,
      accessor: "booking_no",
      style: {
        textAlign: "center",
      },
      Cell: (row) => {
        return (
          <TableCellText title={row.original.remarks}>
            {row.original.booking_no}
          </TableCellText>
        );
      },
    },
    {
      Header: <TableHeading>Seal Number</TableHeading>,
      sortable: false,
      accessor: "seal_no",
      Cell: (row) =>
        row.original.seal_no && (
          <EditableTextField
            dropDId={`stock-seal-edit-${row.index}`}
            dropKey={`stock-seal-key-${row.index}`}
            editableColumnName="seal_no"
            row={row}
            disabled
            variant="filled"
            readOnlyP={true}
            isDisabled={true}
          />
        ),
      style: {
        textAlign: "center",
      },
    },
    {
      Header: <TableHeading>Select Seal Number</TableHeading>,
      sortable: false,
      accessor: "sealno_list",
      Cell: (row) =>
        row.original.booking_no && (
          <DropDownTextField
            style={{ height: "150px", overflowY: "scroll" }}
            dropdownList={row && row.value}
            dropDownColumnName="seal_no"
            isSealNumberEmpty={row.original.seal_no}
            dropDId={`stock-seal-drop-${row.index}`}
            dropKey={`stock-seal-key-${row.index}`}
            row={row}
            isDisabled={false}
          />
        ),
      style: {
        textAlign: "center",
      },
    },
    {
      Header: <TableHeading>Queued Recently</TableHeading>,
      sortable: false,
      width: 150,
      accessor: "queued_recently",
      Cell: (row) => (
        <TableCellText title={row.original.queued_recently}>
          {row.original.queued_recently ? "Yes" : "No"}
        </TableCellText>
      ),
      style: {
        textAlign: "center",
      },
    },
    {
      Header: <TableHeading>USA Approved </TableHeading>,
      sortable: false,
      width: 150,
      accessor: "usa_approval_container",
      Cell: (row) => (
        <TableCellText title={row.original.usa_approval_container}>
          {row.original.usa_approval_container ? "Yes" : "No"}
        </TableCellText>
      ),
      style: {
        textAlign: "center",
      },
    },
    {
      Header: <TableHeading>Do Not Lift Remarks </TableHeading>,
      sortable: false,
      width: 200,
      accessor: "do_not_lift_remarks",
      Cell: (row) => (
        <TableCellText title={row.original.remarks}>
          {row.original.do_not_lift_remarks}
        </TableCellText>
      ),
      style: {
        textAlign: "center",
      },
    },
  ];

  return (
    <div
      style={{
        width: matchesIpad ? (matchesIphone ? "100%" : "100%") : "100%",
      }}
    >
      <TableCustomAdvanceReactTable
        data={stocksAvailableList && stocksAvailableList}
        columns={[...Columns]}
        minRows={Number(store.stocksAndAllotmentSearch.on_page_data)}
        defaultPageSize={Number(store.stocksAndAllotmentSearch.on_page_data)}
        pageSize={Number(store.stocksAndAllotmentSearch.on_page_data)}
      />
      <TableCustomPaginationReactTable
        total_pages={stocksAndAllotment.totalPages}
        pg_no={store.stocksAndAllotmentSearch.pg_no}
        handlePaginationOnChange={handlePaginationOnChange}
        next_page={store.stocksAndAllotmentSearch.next_page}
        on_page_data={store.stocksAndAllotmentSearch.on_page_data}
        setCurrentPage={setCurrentPage}
        handleInitialPage={handleInitialPage}
        handleOnPageDataChange={handleOnPageDataChange}
      />
    </div>
  );
};

export default StocksAndAllotmentListing;
