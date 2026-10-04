import React, { useEffect, useState } from "react";
import {
  Typography,
  Grid,
  Button,
  Checkbox,
  Chip,
  useMediaQuery,
  Tooltip,
  Modal,
  Backdrop,
  alpha,
} from "@mui/material";
import { useSnackbar } from "notistack";
import { useDispatch, useSelector } from "react-redux";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSort } from "@fortawesome/free-solid-svg-icons";
import RefreshIcon from "@mui/icons-material/Refresh";
import InfoIcon from "@mui/icons-material/Info";
import TourTwoToneIcon from "@mui/icons-material/TourTwoTone";
import { useHistory } from "react-router-dom";
import {
  getMNRProcessByEdit,
  getMNRProcessByEditImportAction,
} from "../actions/MNRProcessActions";
import { sendStageWistim } from "../actions/MNRWestimDestimActions";
import { getMNRGrid, makeContainersAvailable } from "../actions/MNRGridActions";
import "react-step-progress-bar/styles.css";
import { ProgressBar, Step } from "react-step-progress-bar";
import DoneIcon from "@mui/icons-material/Done";
import CrossIcon from "@mui/icons-material/Cancel";
import MnrFooter from "../components/MnrFooter";
import { Stack } from "@mui/material";
import { Box } from "@mui/material";
import {
  TableCellText,
  TableCustomAdvanceReactTable,
  TableCustomPaginationReactTable,
  TableHeading,
  TableRefreshIcon,
} from "./TableComponent/TableComponent";

const MNRListing = (props) => {
  const history = useHistory();
  const [stocksAvailableList, setStocksAvailableList] = useState([]);
  const dispatch = useDispatch();
  const store = useSelector((state) => state);
  const { stocksAndAllotment, MNRGridSearch, MNR, gateIn, user } = store;
  const notify = useSnackbar().enqueueSnackbar;
  const [open, setOpen] = React.useState(false);
  const [selectedStockList, setSelectedStockList] = useState([]);
  const [stage, setStage] = useState("");
  const [status, setStatus] = useState("");
  const [condition, setCondition] = useState("");
  const [surveyDate, setSurveyDate] = useState("");
  const [estimateDate, setEstimateDate] = useState("");
  const [approvalDate, setApprovalDate] = useState("");
  const [repairDate, setRepairDate] = useState("");
  const [availableDate, setAvailableDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [openModal, setOpenModal] = useState(false);
  const [selectedContainerStage, setSelectedContainerStage] = useState("");
  const [selectedRows, setSelectedRows] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [checkAll, setCheckAll] = useState(false);
  const matchesIphone = useMediaQuery("(max-width:500px)");
  const matchesIpad = useMediaQuery("(max-width:1050px)");
  const [refCode, setRefCode] = useState("");

  const handleOpen = (dataInfo) => {
    setOpen(true);
    setStage(dataInfo.stage);
    setStatus(dataInfo.status);
    setCondition(dataInfo.condition);
    setSurveyDate(dataInfo.survey_date);
    setEstimateDate(dataInfo.estimate_date);
    setApprovalDate(dataInfo.approval_date);
    setRepairDate(dataInfo.repair_date);
    setAvailableDate(dataInfo.available_date);
  };
  const handleClose = () => {
    setOpen(false);
  };

  const handleModalClose = () => {
    setOpenModal(false);
    dispatch({
      type: "MNR_CHIP_RESET_SELECTION",
    });
  };

  useEffect(() => {
    dispatch(getMNRGrid(MNRGridSearch));
  }, [
    MNRGridSearch.out_history,
    MNRGridSearch.pg_no,
    MNRGridSearch.on_page_data,
  ]);

  useEffect(() => {
    return () => {
      dispatch({ type: "RESET_MNR_SEARCH_DATA" });
    };
  }, []);

  useEffect(() => {
    let tempArray = [];
    MNR?.mnrListing?.length > 0 &&
      MNR.mnrListing.map((row) => {
        let tempObj = {
          isShowCheck:
            MNR.make_available === true ||
            (MNR.make_available === false &&
              (row.stage === "Approval" ||
                row.stage === "Repair" ||
                row.stage === "Available"))
              ? true
              : false,
          isCheck: false,
          enabled: false,
          pk: row.pk,
          client: row.client,
          line: row.line,
          gate_in: row.gate_in,
          container_no: row.container_no,
          type: row.type,
          size: row.size,
          condition: row.condition,
          is_estimate_westim_sent: row.is_estimate_westim_sent,
          is_repair_destim_sent: row.is_repair_destim_sent,
          is_repair_data_available_for_import:
            row.is_repair_data_available_for_import,
          aging: row.aging,
          is_survey_import_available: row.is_survey_import_available,
          is_mnr_data_imported: row.is_mnr_data_imported,
          estimate_status: row.estimate_status,
          gate_out: row.gate_out,
          mode: row.mode,
          status: row.status,
          stage: row.stage,
          survey_date: row.survey_date,
          survey_time: row.survey_time,
          estimate_date: row.estimate_date,
          estimate_time: row.estimate_time,
          approval_date: row.approval_date,
          approval_time: row.approval_time,
          pre_mnr_img_uploaded: row.pre_mnr_img_uploaded,
          post_mnr_img_uploaded: row.post_mnr_img_uploaded,
          repair_date: row.repair_date,
          repair_time: row.repair_time,
          repair_status: row.repair_status,
          available_date: row.available_date,
          available_time: row.available_time,
          automatic_mnr_status_change: row.automatic_mnr_status_change,
          sr_no: row.sr_no,
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
    setSelectedItems([]);
  }, [MNR.mnrListing, MNR.make_available]);

  useEffect(() => {
    dispatch({ type: "MNR_CLEAR_CONTAINER_LIST" });
  }, []);
  useEffect(() => {
    const newData = stocksAvailableList.map((item) => ({
      ...item,
      isCheck: false,
      enabled: false,
    }));
    setCheckAll(false);
    setStocksAvailableList(newData);
    setSelectedItems([]);
  }, [MNR.make_available]);

  const handleEstimateWistim = () => {
    let containerListArray = [];
    let demoVal = false;

    for (let i = 1; i <= selectedStockList.length; i++) {
      demoVal = selectedStockList.every((val) => val.enabled === false);
    }

    if (demoVal === true) {
      notify("Atleast one container should be enabled", {
        variant: "error",
      });
    } else {
      selectedStockList.forEach((e) => {
        if (e["enabled"] === true) {
          containerListArray.push(e["pk"]);
        }
      });

      let req = {
        stock_id: selectedStockList
          .filter((item) => item.enabled)
          .map((item) => item.pk),
        location: localStorage.getItem("location")
          ? localStorage.getItem("location")
          : null,
        site: localStorage.getItem("site")
          ? localStorage.getItem("site")
          : null,
      };
      dispatch(sendStageWistim(req, "Estimate"));

      setOpenModal(false);
    }
  };

  const handleRepairDistim = () => {
    let containerListArray = [];
    let demoVal = false;

    for (let i = 1; i <= selectedStockList.length; i++) {
      demoVal = selectedStockList.every((val) => val.enabled === false);
    }

    if (demoVal === true) {
      notify("Atleast one container should be enabled", {
        variant: "error",
      });
    } else {
      selectedStockList.forEach((e) => {
        if (e["enabled"] === true) {
          containerListArray.push(e["pk"]);
        }
      });

      let req = {
        stock_id: selectedStockList
          .filter((item) => item.enabled)
          .map((item) => item.pk),
        location: localStorage.getItem("location")
          ? localStorage.getItem("location")
          : null,
        site: localStorage.getItem("site")
          ? localStorage.getItem("site")
          : null,
      };
      dispatch(sendStageWistim(req, "Repair"));
      setOpenModal(false);
    }
  };

  const totalSelectedContainers = () => {
    let counts = selectedStockList.filter((item) => item.enabled).length;
    return counts;
  };

  const handleMakeAvailable = () => {
    let req = {
      stock_id: selectedRows,
      location: localStorage.getItem("location")
        ? localStorage.getItem("location")
        : null,
      site: localStorage.getItem("site") ? localStorage.getItem("site") : null,
    };
    dispatch(makeContainersAvailable(req, notify));
  };

  const handlePaginationOnChange = (e, val) => {
    setCurrentPage(val);
    dispatch({
      type: "TOGGLE_MNR_PAGE_NO_SEARCH_VALUE",
      payload: val,
    });
  };

  const handleInitialPage = () => {
    setCurrentPage(1);
    dispatch({
      type: "TOGGLE_MNR_PAGE_NO_SEARCH_VALUE",
      payload: 1,
    });
  };

  const handleOnPageDataChange = (value) => {
    setCurrentPage(1);
    dispatch({
      type: "TOGGLE_MNR_PAGE_NO_SEARCH_VALUE",
      payload: 1,
    });
    dispatch({
      type: "TOGGLE_MNR_ON_PAGE_DATA_SEARCH_VALUE",
      payload: value,
    });
  };

  const handleChip = (pkToUpdate) => {
    var chipContainer = [...selectedStockList];
    const updatedData = chipContainer.map((item) => {
      if (item.pk === pkToUpdate) {
        return {
          ...item,
          enabled: !item.enabled,
        };
      }
      return item;
    });

    setSelectedStockList(updatedData);
  };
  useEffect(() => {
    const selectedArray = stocksAvailableList.filter((item) => item.isCheck);
    setSelectedStockList(selectedArray);
  }, [stocksAvailableList]);
  const handleCheck = (index, pk, val, stage) => {
    const updatedData = [...stocksAvailableList];
    var selectedTempArray = [...selectedItems];
    const isSelected = selectedItems?.some((item) => item.pk === pk);
    const isSameStage = selectedItems?.every((item) => item.stage === stage);
    let selectedTempObj = {
      pk: pk,
      stage: stage,
    };
    if (MNR?.make_available === false) {
      if (selectedTempArray?.length > 0) {
        if (isSelected) {
          let updatedArray = selectedTempArray.filter((rows) => rows.pk !== pk);
          selectedTempArray = [...updatedArray];
          updatedData[index].isCheck = !updatedData[index].isCheck;
          updatedData[index].enabled = true;
          setStocksAvailableList(updatedData);
        } else {
          if (isSameStage) {
            selectedTempArray.push(selectedTempObj);
            updatedData[index].isCheck = !updatedData[index].isCheck;
            updatedData[index].enabled = true;
            setStocksAvailableList(updatedData);
          } else {
            notify("Selection of containers must have same stage", {
              variant: "warning",
            });
          }
        }
      } else {
        selectedTempArray.push(selectedTempObj);
        updatedData[index].isCheck = !updatedData[index].isCheck;
        updatedData[index].enabled = true;
        setStocksAvailableList(updatedData);
      }
      setSelectedItems(selectedTempArray);
    } else {
      if (!selectedRows.includes(pk) && val) {
        setSelectedRows([...selectedRows, pk]);
      } else {
        const updatedVal = selectedRows.filter((item) => item !== pk);
        setSelectedRows(updatedVal);
      }
      updatedData[index].isCheck = !updatedData[index].isCheck;
      updatedData[index].enabled = true;
      setStocksAvailableList(updatedData);
    }
  };

  const checkAllRows = (val) => {
    let array2 = [...selectedRows];
    let tempArrayOfStage = [...selectedItems];
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
        tempArrayOfStage.push({ pk: item.pk, stage: item.stage });
      } else {
        tempArrayOfStage = [];
      }
    });
    setSelectedItems(tempArrayOfStage);
    setSelectedRows(array2);
    setStocksAvailableList(updatedArray);
    setCheckAll(val);
  };

  const Columns = [
    {
      Header: (
        <div>
          {(MNR.make_available === true ||
            stocksAvailableList.every(
              (item) => item.stage === stocksAvailableList[0].stage
            )) && (
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
      style: { alignItems: "center" },
      Cell: (row) => {
        if (MNR.make_available === true || row.original.isShowCheck) {
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
                    row.original.stage
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
      width: 75,
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
      Header: (
        <TableHeading filter>
          Gate In Date <FontAwesomeIcon icon={faSort} />
        </TableHeading>
      ),

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
      width: 150,
      Header: <TableHeading filter>Container No.</TableHeading>,
      sortable: false,
      accessor: "container_no",
      style: {
        textAlign: "center",
      },
      Cell: (row) => {
        return (
          <div>
            {row.original.remarks && (
              <span title="Click to View Container Remark">
                <InfoIcon
                  style={{ color: "#2A5FA5" }}
                  onClick={() =>
                    notify(row.original.remarks, {
                      variant: "info",
                    })
                  }
                />
              </span>
            )}
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
                    : theme.palette.text.primary,
              })}
            />
          </div>
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
      Header: <TableHeading filter>Stages</TableHeading>,
      width: 100,
      accessor: "status",
      Cell: (row) => {
        if (
          MNRGridSearch.out_history === "True" &&
          row?.original?.stage !== "Available"
        ) {
          return (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 1,
              }}
            >
              <TableCellText>{row.original.stage}</TableCellText>
              <TourTwoToneIcon
                style={{ color: "#FF0000", height: 20, width: 20 }}
                onClick={() => handleOpen(row.original)}
              />
            </div>
          );
        } else if (
          MNRGridSearch.out_history === "True" &&
          row?.original?.is_estimate_westim_sent === false &&
          row?.original?.is_repair_destim_sent === false
        ) {
          return (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 1,
              }}
            >
              <TableCellText>{row.original.stage}</TableCellText>
              <TourTwoToneIcon
                style={{ color: "#FF0000", height: 20, width: 20 }}
                onClick={() => handleOpen(row.original)}
              />
            </div>
          );
        } else if (
          MNRGridSearch.out_history === "True" &&
          row?.original?.stage === "Available" &&
          row?.original?.is_estimate_westim_sent === true &&
          row?.original?.is_repair_destim_sent === false
        ) {
          return (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 1,
              }}
            >
              <TableCellText>{row.original.stage}</TableCellText>
              <TourTwoToneIcon
                style={{ color: "#FF0000", height: 20, width: 20 }}
                onClick={() => handleOpen(row.original)}
              />
            </div>
          );
        } else {
          return (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 1,
              }}
            >
              <TableCellText>{row.original.stage}</TableCellText>
              <InfoIcon
                style={{ color: "#2A5FA5", height: 20, width: 20 }}
                onClick={() => handleOpen(row.original)}
              />
            </div>
          );
        }
      },

      style: {
        textAlign: "center",
      },
    },
    {
      Header: <TableHeading filter>Estimate Status?</TableHeading>,
      accessor: "status",
      Cell: (row) => (
        <TableCellText>{row.original.estimate_status}</TableCellText>
      ),
      style: {
        textAlign: "center",
      },
    },
    {
      Header: <TableHeading filter>Status</TableHeading>,
      accessor: "status",
      minWidth: 180,
      Cell: (row) => <TableCellText>{row.original.status}</TableCellText>,
      style: {
        textAlign: "center",
      },
    },
    {
      Header: <TableHeading filter>Condition</TableHeading>,
      accessor: "condition",
      Cell: (row) => <TableCellText>{row.original.condition}</TableCellText>,
      style: {
        textAlign: "center",
      },
    },
    {
      Header: (
        <TableHeading filter>
          Estimate Westim Upload <br />
          Manual | Ftp
        </TableHeading>
      ),
      Cell: (row) => (
        <TableCellText>{row.original.is_estimate_westim_sent}</TableCellText>
      ),
      style: {
        textAlign: "center",
      },
    },
    {
      Header: (
        <TableHeading filter>
          Repair Destim Upload <br /> Download | Ftp{" "}
        </TableHeading>
      ),
      accessor: "status",
      Cell: (row) => (
        <TableCellText>{row.original.is_repair_destim_sent}</TableCellText>
      ),
      style: {
        textAlign: "center",
      },
    },
    {
      sortable: false,
      style: {
        textAlign: "center",
      },
      Header: <TableHeading filter>Survey Import </TableHeading>,
      width: 160,

      Cell: (row) => {
        if (row.original.is_survey_import_available === true) {
          return (
            <TableCellText>
              {row.original.is_mnr_data_imported
                ? "Imported"
                : "Import Available"}
            </TableCellText>
          );
        } else {
          return <div></div>;
        }
      },
    },

    {
      sortable: false,
      style: {
        textAlign: "center",
      },
      Header: (
        <TableHeading filter>
          Pre Image <br />
          Uploaded | Sent to Ftp
        </TableHeading>
      ),
      width: 120,
      accessor: "status",
      Cell: (row) => (
        <TableCellText>{row.original.pre_mnr_img_uploaded}</TableCellText>
      ),
    },
    {
      sortable: false,
      style: {
        textAlign: "center",
      },
      Header: (
        <TableHeading filter>
          Post Image
          <br />
          Uploaded | Sent to Ftp
        </TableHeading>
      ),
      width: 120,
      accessor: "status",
      Cell: (row) => (
        <TableCellText>{row.original.post_mnr_img_uploaded}</TableCellText>
      ),
    },
    {
      sortable: false,
      show:
        (user?.mnr_team === true || user?.mnr_team === "True") &&
        user.role !== "Admin"
          ? false
          : true,
      style: {
        textAlign: "center",
      },
      width: 120,
      Cell: (row) => {
        return (
          <Button
            variant="contained"
            color="success"
            onClick={() => {
              let req = {
                stock_id: row.original.pk,
              };
              if (
                row.original.is_gate_in_data_imported === true &&
                row.original.is_mnr_data_imported === false
              ) {
                dispatch(getMNRProcessByEditImportAction(req, history));
              } else {
                dispatch(getMNRProcessByEdit(req, history));
              }
            }}
          >
            Edit
          </Button>
        );
      },
    },
  ];

  function getModalStyle() {
    const top = 50;
    const left = 50;

    return {
      top: `${top}%`,
      left: `${left}%`,
      transform: `translate(-${top}%, -${left}%)`,
    };
  }

  const handleDeleteRangeChip = () => {
    dispatch({
      type: "SET_MNR_SEARCH_FROM_DATE",
      payload: "",
    });
    dispatch({
      type: "SET_MNR_SEARCH_TO_DATE",
      payload: "",
    });
    dispatch(getMNRGrid());
  };

  const handleDeleterefCodeChip = () => {
    dispatch({
      type: "SET_MNR_REF_CODE",
      payload: "",
    });
    dispatch(getMNRGrid());
  };

  const handleDeleteStatusChip = () => {
    dispatch({
      type: "SET_MNR_SEARCH_STATUS",
      payload: "",
    });
    dispatch(getMNRGrid());
  };

  const handleDeleteClientChip = () => {
    dispatch({
      type: "SET_MNR_SEARCH_CLIENT_NAME",
      payload: "",
    });
    dispatch(getMNRGrid());
  };

  const handleDeleteStageChip = () => {
    dispatch({
      type: "SET_MNR_SEARCH_STAGE",
      payload: "",
    });
    dispatch(getMNRGrid());
  };
  return (
    <>
      <div style={{ width: "100%" }}>
        {stocksAvailableList &&
          stocksAvailableList.length &&
          matchesIphone > 0 && (
            <Tooltip>
              <Button
                style={{
                  backgroundColor: "#2A5FA5",
                  color: "white",
                  margin: "auto 10px auto auto",
                  display: "flex",
                  width: "100px",
                  fontSize: "0.8rem",
                  position: "relative",
                  top: matchesIphone ? "4px" : "-75px",
                }}
                onClick={() => window.location.reload()}
                startIcon={<RefreshIcon />}
              >
                Refresh
              </Button>
            </Tooltip>
          )}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",

            marginBottom: 8,
            width: matchesIpad ? (matchesIphone ? "100%" : "90%") : "100%",
          }}
        >
          <Grid
            item
            size={{ xs: 12, sm: 6 }}
            style={{
              display: "flex",
              justifyContent: "flex-start",
              alignItems: "center",
              flexWrap: matchesIphone ? "wrap" : "nowrap",
              marginTop: matchesIphone ? "10px" : "0",
            }}
          ></Grid>
          {MNR.make_available === false &&
            selectedStockList?.length > 0 &&
            selectedItems.some((item) => item.stage === "Available") && (
              <Stack
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexDirection: matchesIphone ? "column" : "row",
                }}
              >
                <Button
                  variant="contained"
                  color="success"
                  sx={(theme) => ({
                    mx: 1,
                  })}
                  onClick={() => {
                    setOpenModal(true);
                    setSelectedContainerStage("estimate");
                  }}
                >
                  Send Estimate Westim
                </Button>
                <Button
                  variant="contained"
                  color="success"
                  sx={(theme) => ({
                    mx: 1,
                  })}
                  onClick={() => {
                    setOpenModal(true);
                    setSelectedContainerStage("repair");
                  }}
                >
                  Send Repair Destim
                </Button>
              </Stack>
            )}
          {MNR.make_available === false &&
            selectedStockList?.length > 0 &&
            selectedItems.some((item) => item.stage === "Repair") && (
              <Button
                variant="contained"
                color="success"
                onClick={() => {
                  setOpenModal(true);
                  setSelectedContainerStage("estimate");
                }}
              >
                Send Estimate Westim
              </Button>
            )}
          {MNR.make_available === false &&
            selectedStockList?.length > 0 &&
            selectedItems.some((item) => item.stage === "Approval") && (
              <Button
                variant="contained"
                color="success"
                onClick={() => {
                  setOpenModal(true);
                  setSelectedContainerStage("estimate");
                }}
              >
                Send Estimate Westim
              </Button>
            )}
          {MNR.make_available === true &&
            stocksAvailableList.some((item) => item.isCheck) && (
              <Button
                variant="contained"
                color="success"
                sx={(theme) => ({
                  [theme.breakpoints.down("xs")]: {
                    fontSize: "0.7rem",
                    padding: "2px",
                    width: "100px",
                  },
                })}
                onClick={handleMakeAvailable}
              >
                Make Containers Available
              </Button>
            )}
          <Stack
            direction={"row"}
            alignItems={"center"}
            justifyContent={"flex-end"}
            spacing={1}
          >
            {MNRGridSearch?.from_date !== "" &&
              MNRGridSearch.to_date !== "" && (
                <Chip
                  variant="outlined"
                  color="primary"
                  size="small"
                  label={`${MNRGridSearch.from_date} / ${MNRGridSearch?.to_date}`}
                  onDelete={handleDeleteRangeChip}
                />
              )}
            {MNRGridSearch?.status !== "" && (
              <Chip
                variant="outlined"
                color="primary"
                size="small"
                label={`Status - ${MNRGridSearch?.status}`}
                onDelete={handleDeleteStatusChip}
              />
            )}
            {MNRGridSearch?.ref_code !== "" && (
              <Chip
                variant="outlined"
                color="primary"
                size="small"
                label={`Ref Code - ${MNRGridSearch?.ref_code}`}
                onDelete={handleDeleterefCodeChip}
              />
            )}
            {MNRGridSearch?.client !== "" && (
              <Chip
                variant="outlined"
                color="primary"
                size="small"
                label={`Client - ${MNRGridSearch?.client}`}
                onDelete={handleDeleteClientChip}
              />
            )}
            {MNRGridSearch?.stage !== "" && (
              <Chip
                variant="outlined"
                color="primary"
                size="small"
                label={`Stage - ${MNRGridSearch?.stage}`}
                onDelete={handleDeleteStageChip}
              />
            )}
            <Chip
              size="small"
              onClick={() => {
                dispatch({
                  type: "SET_MAKE_AVAILABLE",
                  payload: !MNR.make_available,
                });
                dispatch({ type: "MNR_CLEAR_CONTAINER_LIST" });
              }}
              label={` Make Available`}
              variant="filled"
              color={MNR.make_available === true ? "primary" : "default"}
              sx={{ cursor: "pointer" }}
            />
            <Chip
              size="small"
              onClick={() => {
                dispatch({
                  type: "SET_MNR_SEARCH_OUT_HISTORY",
                  payload:
                    MNRGridSearch.out_history === "True" ? "False" : "True",
                });
                dispatch({ type: "MNR_CLEAR_CONTAINER_LIST" });
              }}
              label={`History`}
              variant="filled"
              color={
                MNRGridSearch.out_history === "True" ? "primary" : "default"
              }
              sx={{ cursor: "pointer" }}
            />
            {!matchesIphone && (
              <Tooltip title="Refresh the page ">
                <TableRefreshIcon onClick={() => window.location.reload()} />
              </Tooltip>
            )}
          </Stack>
        </div>

        <TableCustomAdvanceReactTable
          data={stocksAvailableList && stocksAvailableList}
          columns={[...Columns]}
          minRows={Number(store.MNRGridSearch.on_page_data)}
          pageSize={Number(store.MNRGridSearch.on_page_data)}
          defaultPageSize={Number(store.MNRGridSearch.on_page_data)}
        />
        <TableCustomPaginationReactTable
          total_pages={stocksAndAllotment.totalPages}
          pg_no={store.MNRGridSearch.pg_no}
          handlePaginationOnChange={handlePaginationOnChange}
          next_page={store.MNRGridSearch.next_page}
          on_page_data={store.MNRGridSearch.on_page_data}
          setCurrentPage={setCurrentPage}
          handleInitialPage={handleInitialPage}
          handleOnPageDataChange={handleOnPageDataChange}
        />

        <Modal
          aria-labelledby="transition-modal-title"
          aria-describedby="transition-modal-description"
          open={open}
          onClose={handleClose}
          closeAfterTransition
          BackdropComponent={Backdrop}
          BackdropProps={{
            timeout: 500,
          }}
        >
          <Box
            style={getModalStyle()}
            sx={(theme) => ({
              position: "absolute",
              width: "70%",
              backgroundColor: "white",
              boxShadow: 5,
              padding: 12,
              outline: "none",
              borderRadius: 2,
              [theme.breakpoints.down("xs")]: {
                overflowY: "scroll",
                width: "85%",
                padding: "20px",
              },
            })}
          >
            <ProgressBar
              percent={
                stage === "Available"
                  ? 99.9
                  : stage === "Repair"
                  ? 80
                  : stage === "Approval"
                  ? 60
                  : stage === "Estimate"
                  ? 40
                  : 20
              }
              filledBackground="linear-gradient(to right, #fefb72, #f0bb31)"
              height={15}
              hasStepZero={false}
            >
              <Step transition="scale" transitionDuration={500}>
                {({ accomplished }) => (
                  <>
                    <div
                      className={`indexedStep ${
                        accomplished ? "accomplished" : ""
                      }`}
                      style={{
                        paddingBottom: 50,
                        filter: `grayscale(${accomplished ? 0 : 80}%)`,
                      }}
                    >
                      <Typography
                        sx={(theme) => ({
                          color: "white",
                          backgroundColor: theme.palette.secondary.main,
                          fontWeight: "bold",
                        })}
                      >
                        Survey
                      </Typography>
                    </div>
                    <div
                      className={`indexedStep ${
                        accomplished ? "accomplished" : ""
                      }`}
                      style={{
                        paddingTop: 50,
                        filter: `grayscale(${accomplished ? 0 : 80}%)`,
                      }}
                    >
                      <Typography
                        sx={(theme) => ({
                          color: "white",
                          backgroundColor: theme.palette.secondary.main,
                          fontWeight: "bold",
                        })}
                      >
                        {surveyDate}
                      </Typography>
                    </div>
                  </>
                )}
              </Step>
              <Step transition="scale" transitionDuration={500}>
                {({ accomplished }) => (
                  <>
                    <div
                      className={`indexedStep ${
                        accomplished ? "accomplished" : ""
                      }`}
                      style={{
                        paddingBottom: 50,
                        filter: `grayscale(${accomplished ? 0 : 80}%)`,
                      }}
                    >
                      <Typography
                        sx={(theme) => ({
                          color: "white",
                          backgroundColor: theme.palette.secondary.main,
                          fontWeight: "bold",
                        })}
                      >
                        Estimate
                      </Typography>
                    </div>
                    <div
                      className={`indexedStep ${
                        accomplished ? "accomplished" : ""
                      }`}
                      style={{
                        paddingTop: 50,
                        filter: `grayscale(${accomplished ? 0 : 80}%)`,
                      }}
                    >
                      <Typography
                        sx={(theme) => ({
                          color: "white",
                          backgroundColor: theme.palette.secondary.main,
                          fontWeight: "bold",
                        })}
                      >
                        {estimateDate}
                      </Typography>
                    </div>
                  </>
                )}
              </Step>
              <Step transition="scale" transitionDuration={500}>
                {({ accomplished }) => (
                  <>
                    <div
                      className={`indexedStep ${
                        accomplished ? "accomplished" : ""
                      }`}
                      style={{
                        paddingBottom: 50,
                        filter: `grayscale(${accomplished ? 0 : 80}%)`,
                      }}
                    >
                      <Typography
                        sx={(theme) => ({
                          color: "white",
                          backgroundColor: theme.palette.secondary.main,
                          fontWeight: "bold",
                        })}
                      >
                        Approval
                      </Typography>
                    </div>
                    <div
                      className={`indexedStep ${
                        accomplished ? "accomplished" : ""
                      }`}
                      style={{
                        paddingTop: 50,
                        filter: `grayscale(${accomplished ? 0 : 80}%)`,
                      }}
                    >
                      <Typography
                        sx={(theme) => ({
                          color: "white",
                          backgroundColor: theme.palette.secondary.main,
                          fontWeight: "bold",
                        })}
                      >
                        {approvalDate}
                      </Typography>
                    </div>
                  </>
                )}
              </Step>
              <Step transition="scale" transitionDuration={500}>
                {({ accomplished }) => (
                  <>
                    <div
                      className={`indexedStep ${
                        accomplished ? "accomplished" : ""
                      }`}
                      style={{
                        paddingBottom: 50,
                        filter: `grayscale(${accomplished ? 0 : 80}%)`,
                      }}
                    >
                      <Typography
                        sx={(theme) => ({
                          color: "white",
                          backgroundColor: theme.palette.secondary.main,
                          fontWeight: "bold",
                        })}
                      >
                        Repair
                      </Typography>
                    </div>
                    <div
                      className={`indexedStep ${
                        accomplished ? "accomplished" : ""
                      }`}
                      style={{
                        paddingTop: 50,
                        filter: `grayscale(${accomplished ? 0 : 80}%)`,
                      }}
                    >
                      <Typography
                        sx={(theme) => ({
                          color: "white",
                          backgroundColor: theme.palette.secondary.main,
                          fontWeight: "bold",
                        })}
                      >
                        {repairDate}
                      </Typography>
                    </div>
                  </>
                )}
              </Step>
              <Step transition="scale" transitionDuration={500}>
                {({ accomplished }) => (
                  <>
                    <div
                      className={`indexedStep ${
                        accomplished ? "accomplished" : ""
                      }`}
                      style={{
                        paddingBottom: 50,
                        filter: `grayscale(${accomplished ? 0 : 80}%)`,
                      }}
                    >
                      <Typography
                        sx={(theme) => ({
                          color: "white",
                          backgroundColor: theme.palette.secondary.main,
                          fontWeight: "bold",
                        })}
                      >
                        Available
                      </Typography>
                    </div>
                    <div
                      className={`indexedStep ${
                        accomplished ? "accomplished" : ""
                      }`}
                      style={{
                        paddingTop: 50,
                        filter: `grayscale(${accomplished ? 0 : 80}%)`,
                      }}
                    >
                      <Typography
                        sx={(theme) => ({
                          color: "white",
                          backgroundColor: theme.palette.secondary.main,
                          fontWeight: "bold",
                        })}
                      >
                        {availableDate}
                      </Typography>
                    </div>
                  </>
                )}
              </Step>
            </ProgressBar>
          </Box>
        </Modal>

        <Modal open={openModal} onClose={handleModalClose}>
          <Box
            style={getModalStyle()}
            sx={(theme) => ({
              position: "absolute",
              width: "70%",
              backgroundColor: "white",
              boxShadow: 5,
              padding: 4,
              outline: "none",
              borderRadius: 2,
              [theme.breakpoints.down("xs")]: {
                overflowY: "scroll",
                width: "85%",
                padding: "20px",
              },
            })}
          >
            <Typography variant="h6" id="modal-title">
              List of selected containers available for dispatch
            </Typography>
            <Grid
              sx={{
                display: "flex",
                justifyContent: "center",
                flexWrap: "wrap",
                paddingTop: 4,
              }}
            >
              {selectedStockList.length !== 0 &&
                selectedStockList.map((option) => (
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
                      margin: 2,
                    }}
                    onClick={() => {
                      handleChip(option?.pk);
                    }}
                    onDelete={() => {
                      handleChip();
                    }}
                    deleteIcon={
                      option.enabled === true ? <DoneIcon /> : <CrossIcon />
                    }
                  />
                ))}
            </Grid>
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
            {selectedContainerStage === "estimate" ? (
              <Grid
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  flexWrap: "wrap",
                  paddingTop: 4,
                }}
              >
                <Button
                  onClick={handleEstimateWistim}
                  style={{
                    backgroundColor: "#2A5FA5",
                    color: "white",
                    borderRadius: 7,
                  }}
                >
                  Generate Wistim
                </Button>
              </Grid>
            ) : (
              <Grid
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  flexWrap: "wrap",
                  paddingTop: 4,
                }}
              >
                <Button
                  onClick={handleRepairDistim}
                  style={{
                    backgroundColor: "#2A5FA5",
                    color: "white",
                    borderRadius: 7,
                  }}
                >
                  Generate Destim
                </Button>
              </Grid>
            )}
          </Box>
        </Modal>
      </div>
      <MnrFooter />
    </>
  );
};

export default MNRListing;
