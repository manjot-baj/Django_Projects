import React, { useEffect, useState } from "react";

import {
  Typography,
  Grid,
  Button,
  Checkbox,
  Chip,
  FormControlLabel,
  Radio,
  Box,
  Modal,
  useMediaQuery,
  Stack,
  IconButton,
  MenuItem,
  Badge,
} from "@mui/material";
import { useSnackbar } from "notistack";
import { useDispatch, useSelector } from "react-redux";
import {
  searchLoadedYardDispatch,
  downloadEdi,
} from "../../actions/LoadedYardActions";
import "react-step-progress-bar/styles.css";
import DoneIcon from "@mui/icons-material/Done";
import CrossIcon from "@mui/icons-material/Cancel";
import StockYardSearchModal from "./StockYardSearchModal";
import ClearIcon from "@mui/icons-material/Clear";
import {
  TableCellText,
  TableCustomAdvanceReactTable,
  TableCustomPaginationReactTable,
  TableCustomSearchBar,
  TableFilterComponent,
  TableFootercontainer,
  TableHeading,
  TableRefreshIcon,
} from "@/components/TableComponent/TableComponent";
import { theme } from "@/App";
import { useHistory } from "react-router-dom";
import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";
import BackupOutlinedIcon from "@mui/icons-material/BackupOutlined";

const StockYard = (props) => {
  const [stocksAvailableList, setStocksAvailableList] = useState([]);
  const [selectedStockList, setSelectedStockList] = useState([]);
  const dispatch = useDispatch();
  const store = useSelector((state) => state);
  const [open, setOpen] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);
  // eslint-disable-next-line no-unused-vars
  const [checkAll, setCheckAll] = useState(false);
  // eslint-disable-next-line no-unused-vars
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const [name, setName] = useState("Container Number");
  const [filterType, setFilterType] = useState("");
  const { loadedYard, loadedYardSearch, user } = store;
  const matchesIphone = useMediaQuery("(max-width:500px)");
  const notify = useSnackbar().enqueueSnackbar;
  const history = useHistory();

  const [openModal, setOpenModal] = useState(false);

  const handleModalClose = () => {
    setOpenModal(false);
    dispatch({
      type: "LOADED_CHIP_RESET_SELECTION",
    });
  };

  useEffect(() => {
    dispatch(searchLoadedYardDispatch());

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    return () => {
      setSelectedRows([]);
    };
  }, []);

  useEffect(() => {
    dispatch({ type: "LOADED_CLEAR_CONTAINER_LIST" });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    let tempArray = [];
    loadedYard?.yardListing?.length > 0 &&
      loadedYard.yardListing.map((row) => {
        let tempObj = {
          isCheck: false,
          enabled: false,
          pk: row?.pk,
          sr_no: row?.sr_no,
          container_no: row?.container_no,
          booking_no: row?.booking_no,
          port: row?.port,
          process_type: row?.process_type,
          size: row?.size,
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

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadedYard?.yardListing]);

  useEffect(() => {
    const selectedArray = stocksAvailableList.filter((item) => item.isCheck);
    setSelectedStockList(selectedArray);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stocksAvailableList]);

  const totalSelectedContainers = () => {
    let counts = selectedRows.filter((item) => item.enabled).length;
    return counts;
  };

  const handleDownloadEDI = () => {
    let demoVal = false;
    for (let i = 1; i <= selectedRows?.length; i++) {
      demoVal = selectedRows?.every((val) => val.enabled === false);
    }
    if (demoVal === true) {
      notify("Atleast one container should be enabled", {
        variant: "error",
      });
    } else {
      selectedRows.forEach((e) => {
        if (e["enabled"] === true) {
          selectedStockList.push(e["pk"]);
        }
      });
      let req = {
        stock_id: selectedRows
          .filter((item) => item.enabled)
          .map((item) => item.id),
        location: localStorage.getItem("location")
          ? localStorage.getItem("location")
          : null,
        site: localStorage.getItem("site")
          ? localStorage.getItem("site")
          : null,
      };
      dispatch(downloadEdi(req));
      setOpenModal(false);
      // const newData = stocksAvailableList.map((item) => ({
      //   ...item,
      //   isCheck: false,
      //   enabled: false,
      // }));
      // setCheckAll(false);
      // setStocksAvailableList(newData);
    }
  };

  const handleCheck = (id, val) => {
    if (!selectedRows.some((value) => value.id === id)) {
      setSelectedRows([
        ...selectedRows,
        {
          id,
          container_no: val,
          enabled: true,
        },
      ]);
    } else {
      const updatedVal = selectedRows.filter((item) => item.id !== id);
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
      let allData = loadedYardSearch?.yardListing?.map((val) => ({
        id: val.pk,
        container_no: val.container_no,
        enabled: true,
      }));
      setSelectedRows(allData);
    }
  };

  const Columns = [
    {
      Header: (
        <div>
          <Checkbox
            checked={
              selectedRows.length === loadedYardSearch.yardListing.length
            }
            onClick={(e) => {
              checkAllRows(!e.target.checked);
            }}
         color="primary"
            inputProps={{ "aria-label": "Checkbox A" }}
          />
        </div>
      ),
      width: 50,
      show: user.role !== "Loaded Yard",
      style: {
        textAlign: "center",
      },
      Cell: (row) => {
        return (
          <div>
            <Checkbox
              checked={selectedRows.some((item) => item.id === row.original.pk)}
              key={row.original.pk}
              onClick={(e) => {
                handleCheck(row.original.pk, row.original.container_no);
              }}
              color="primary"
                sx={(theme) => ({
                  color: "black",
                })}
              inputProps={{ "aria-label": "Checkbox A" }}
            />
          </div>
        );
      },
    },
    {
      Header: <TableHeading filter>No</TableHeading>,
      accessor: "sr_no",
      style: {
        textAlign: "center",
      },
      Cell: (row) => {
        return (
          <TableCellText title={row.original.sr_no}>
            {row.original.sr_no}
          </TableCellText>
        );
      },
    },
    {
      Header: <TableHeading filter>Container No.</TableHeading>,
      sortable: false,
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
            color={
              row.original.container_no_is_valid === false ? "error" : "default"
            }
          />
        );
      },
    },
    {
      Header: <TableHeading filter>Booking No.</TableHeading>,
      accessor: "booking_no",
      style: {
        textAlign: "center",
      },
      Cell: (row) => {
        return (
          <TableCellText title={row.original.booking_no}>
            {row.original.booking_no}
          </TableCellText>
        );
      },
    },
    {
      Header: <TableHeading filter>Port</TableHeading>,
      accessor: "port",
      style: {
        textAlign: "center",
      },
      Cell: (row) => {
        return (
          <TableCellText title={row.original.port}>
            {row.original.port}
          </TableCellText>
        );
      },
    },
    {
      Header: <TableHeading filter>Process Type</TableHeading>,
      accessor: "process_type",
      style: {
        textAlign: "center",
      },
      Cell: (row) => {
        return (
          <TableCellText title={row.original?.process_type}>
            {row.original?.process_type}
          </TableCellText>
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
          <TableCellText title={row.original.size}>
            {row.original.size}
          </TableCellText>
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

  const updateName = (event) => {
    setFilterType("");

    setName(event.target.value);
  };
  const getData = () => {
    dispatch(searchLoadedYardDispatch());
  };

  const setDispatchType = (e) => {
    setFilterType(e.target.value);
    dispatch({
      type: "LOADEDYARD_PAGE_CHANGE",
      payload: {
        container_no: "",
        booking_no: "",
        port: "",
        size: "",
      },
    });
    if (name === "Container Number") {
      dispatch({
        type: "LOADEDYARD_PAGE_CHANGE",
        payload: {
          container_no: e.target.value,
          pg_no: 1,
        },
      });
    } else if (name === "Booking Number") {
      dispatch({
        type: "LOADEDYARD_PAGE_CHANGE",
        payload: {
          booking_no: e.target.value,
          pg_no: 1,
        },
      });
    } else if (name === "Port") {
      dispatch({
        type: "LOADEDYARD_PAGE_CHANGE",
        payload: {
          port: e.target.value,
          pg_no: 1,
        },
      });
    } else {
      dispatch({
        type: "LOADEDYARD_PAGE_CHANGE",
        payload: {
          size: e.target.value,
          pg_no: 1,
        },
      });
    }
  };

  const handleChip = (pkToUpdate) => {
    const updatedData = selectedRows.map((item) => {
      if (item.id === pkToUpdate) {
        return {
          ...item,
          enabled: !item.enabled,
        };
      }
      return item;
    });

    setSelectedRows(updatedData);
  };

  const handleInitialPage = () => {
    dispatch({
      type: "LOADEDYARD_PAGE_CHANGE",
      payload: {
        pg_no: 1,
      },
    });
    dispatch(searchLoadedYardDispatch());
  };

  const handleOnPageDataChange = (value) => {
    dispatch({
      type: "LOADEDYARD_PAGE_CHANGE",
      payload: {
        pg_no: 1,
        on_page_data_change: value,
      },
    });
    dispatch(searchLoadedYardDispatch());
  };

  const handlePaginationOnChange = (e, val) => {
    setCheckAll(false);

    dispatch({
      type: "LOADEDYARD_PAGE_CHANGE",
      payload: {
        pg_no: val,
      },
    });
    dispatch(searchLoadedYardDispatch());
  };

  const handleSearchClick = () => {
    getData();
  };

  const handleCloseClick = () => {
    setFilterType("");
  };

  const openStockUpload = () => {
    history.push("/loaded-yard/stock-upload");
  };

  return (
    <Box padding={matchesIphone ? 1 : 2}>
      <TableFootercontainer>
        {selectedRows.length > 0 ? (
          <Button
            sx={(theme) => ({
              mx: 1,
              borderRadius:12,
              [theme.breakpoints.down("sm")]: {
                minWidth: 180,
              },
            })}
            variant="contained"
            color="secondary"
            size="small"
            startIcon={
              <Badge
                badgeContent={selectedRows?.length}
                color="primary"
                sx={{
                  "& .MuiBadge-badge": {
                    right: 22,
                    top: 6,
                    padding: 0,
                  },
                }}
              >
                <BackupOutlinedIcon fontSize="small"/>
              </Badge>
            }
            onClick={() => {
              setOpenModal(true);
            }}
          >
            Generate Loaded Stock EDI
          </Button>
        ) : (
          <></>
        )}
        {matchesIphone ? (
          <IconButton size="medium" color="primary" onClick={openStockUpload}>
            <CloudUploadOutlinedIcon />
          </IconButton>
        ) : (
          <Button
            onClick={openStockUpload}
            sx={(theme) => ({
              mx: 1,
                  borderRadius:12,
              [theme.breakpoints.down("sm")]: {
                minWidth: "fit-content",
              },
            })}
            variant="contained"
            color="primary"
            size="small"
            startIcon={<CloudUploadOutlinedIcon fontSize="small" />}
          >
            Loaded Yard Stock Upload
          </Button>
        )}
      </TableFootercontainer>
      <Stack
        direction={"row"}
        alignItems={"center"}
        justifyContent={"space-between"}
      >
        <Stack
          direction={"row"}
          alignItems={"center"}
          justifyContent={"flex-start"}
          spacing={2}
        >
          <TableCustomSearchBar
            selectName={name}
            searchText={filterType}
            updateSelectname={updateName}
            closeClick={handleCloseClick}
            setSearchText={setDispatchType}
            searchClick={handleSearchClick}
          >
            <MenuItem value={"Container Number"}>
              &nbsp; &nbsp;&nbsp;Container Number
            </MenuItem>
            <MenuItem value={"Booking Number"}>
              &nbsp; &nbsp;&nbsp;Booking Number
            </MenuItem>
            <MenuItem value={"Port"}>&nbsp; &nbsp;&nbsp;Port</MenuItem>
            <MenuItem value={"Size"}>&nbsp; &nbsp;&nbsp;Size</MenuItem>
          </TableCustomSearchBar>
          <TableFilterComponent
            activeFilter={
              loadedYardSearch.history === "True" ||
              loadedYardSearch.history === "False"
            }
            title={`${loadedYardSearch.history === "True" ? "OUT" : "IN"}`}
          >
            <Grid item size={{ xs: 12 }}>
              <Typography variant="subtitle2">Process Type</Typography>
            </Grid>
            <Grid item size={{ xs: 12 }}>
              <FormControlLabel
                value="yes"
                control={
                  <Radio
                    size="small"
                    style={{ color: theme.palette.primary.main }}
                    checked={loadedYardSearch.history === "True"}
                    onClick={() => {
                      if (loadedYardSearch.history === "False") {
                        setSelectedRows([]);
                      }
                      dispatch({
                        type: "LOADEDYARD_PAGE_CHANGE",
                        payload: {
                          history: "True",
                          pg_no: 1,
                        },
                      });
                      dispatch(searchLoadedYardDispatch());
                    }}
                  />
                }
                label="OUT"
              />
            </Grid>
            <Grid item size={{ xs: 12 }}>
              <FormControlLabel
                value="no"
                control={
                  <Radio
                    size="small"
                    style={{ color: theme.palette.primary.main }}
                    checked={loadedYardSearch.history === "False"}
                    onClick={() => {
                      if (loadedYardSearch.history === "True") {
                        setSelectedRows([]);
                      }
                      dispatch({
                        type: "LOADEDYARD_PAGE_CHANGE",
                        payload: {
                          history: "False",
                          pg_no: 1,
                        },
                      });

                      dispatch(searchLoadedYardDispatch());
                    }}
                  />
                }
                label="IN"
              />
            </Grid>
          </TableFilterComponent>
        </Stack>
        <TableRefreshIcon
          onClick={() => {
            dispatch({
              type: "LOADEDYARD_PAGE_CHANGE",
              payload: {
                container_no: "",
                booking_no: "",
                port: "",
                size: "",
                pg_no: 1,
              },
            });
            setSelectedRows([]);
            setFilterType("");
            dispatch(searchLoadedYardDispatch());
          }}
        />
      </Stack>

      <Grid container marginTop={2}>
        <Grid item size={{ xs: 12 }}>
          <TableCustomAdvanceReactTable
            data={loadedYardSearch.yardListing && loadedYardSearch.yardListing}
            columns={[...Columns]}
            minRows={Number(loadedYardSearch.yardListing.length)}
            pageSize={Number(loadedYardSearch.yardListing.length)}
            defaultPageSize={Number(loadedYardSearch.yardListing.length)}
          />
          <TableCustomPaginationReactTable
            total_pages={store.loadedYardSearch.total_pages}
            pg_no={store.loadedYardSearch.pg_no}
            handlePaginationOnChange={handlePaginationOnChange}
            next_page={store.loadedYardSearch.next_page}
            on_page_data={store.loadedYardSearch.on_page_data}
            handleInitialPage={handleInitialPage}
            handleOnPageDataChange={handleOnPageDataChange}
          />
        </Grid>
      </Grid>

      <Modal open={openModal} onClose={handleModalClose}>
        <Box
          style={getModalStyle()}
          sx={{
            position: "absolute",
            width: "70%",
            backgroundColor: "white",
            boxShadow: 5,
            padding: 2,
            outline: "none",
            borderRadius: 2,
          }}
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
                    margin: 2,
                  }}
                  onClick={() => {
                    handleChip(option.id);
                  }}
                  onDelete={() => {
                    handleChip(option.id);
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

          <Grid
            sx={{
              display: "flex",
              justifyContent: "center",
              flexWrap: "wrap",
              paddingTop: 4,
            }}
          >
            <Button
              onClick={handleDownloadEDI}
              variant="contained"
              color="secondary"
              sx={{ width: 240 }}
            >
              Generate EDI
            </Button>
          </Grid>
        </Box>
      </Modal>
      <Modal open={open} onClose={handleClose}>
        <Box
          sx={{
            top: "20%",
            position: "absolute",
            background: "#FFF",
            width: "85%",
            height: "60%",
            margin: "auto",
            left: "10%",
            padding: "15px 0px",
            pointerEvents: "painted",
          }}
        >
          <Grid
            sx={{
              float: "right",
              cursor: "pointer",
              padding: "0px 20px",
            }}
          >
            {" "}
            <ClearIcon onClick={handleClose} />
          </Grid>
          <StockYardSearchModal handleClose={handleClose} />
        </Box>
      </Modal>
    </Box>
  );
};

export default StockYard;
