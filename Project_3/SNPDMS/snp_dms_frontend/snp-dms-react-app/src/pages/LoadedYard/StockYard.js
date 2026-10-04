import React, { useEffect, useState } from "react";
import ReactTable from "react-table-v6";
import "react-table-v6/react-table.css";
import {
  makeStyles,
  Typography,
  Paper,
  TextField,
  MenuItem,
  Grid,
  Button,
  Checkbox,
  Chip,
  FormControlLabel,
  Radio,
  Select,
  Box,
  Modal,
  InputBase,
  useMediaQuery,
} from "@material-ui/core";
import { useSnackbar } from "notistack";
import { useDispatch, useSelector } from "react-redux";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSort } from "@fortawesome/free-solid-svg-icons";
import RefreshIcon from "@material-ui/icons/Refresh";
import PreviousIcon from "@material-ui/icons/ArrowBack";
import NextIcon from "@material-ui/icons/ArrowForward";
import {
  searchLoadedYardDispatch,
  downloadEdi,
} from "../../actions/LoadedYardActions";
import "react-step-progress-bar/styles.css";
import DoneIcon from "@material-ui/icons/Done";
import CrossIcon from "@material-ui/icons/Cancel";
import StockFooter from "./StockFooter";
import StockYardSearchModal from "./StockYardSearchModal";
import IconButton from "@material-ui/core/IconButton";
import SearchIcon from "@material-ui/icons/Search";
import ClearIcon from "@material-ui/icons/Clear";


const useStyles = makeStyles((theme) => ({
  paperContainer: {
    padding: theme.spacing(2, 3),
  },
  input: {
    padding: 7,
    borderColor: "black",
    width: "300px",
    [theme.breakpoints.down("xs")]: {
      width: "180px",
    },
  },
  searchButton: {
    backgroundColor: "#FDBD2E",
    color: "#fff",
    borderRadius: "0.5rem",
    padding: "1px 10px",
    height: 40,
    fontSize: 14,
    marginLeft: "20px",
    boxShadow: "0px 3px 6px #9199A14D",
    "&:hover": {
      backgroundColor: "#FDBD2E",
      color: "#fff",
    },
    [theme.breakpoints.down("xs")]: {
      marginLeft: "10px",
    },
  },
  reactTable: {
    "& ::-webkit-scrollbar": {
      height: "5px",
    },
  },
  button: {
    background: "lightgreen",
    border: "1px solid green",
    color: "green",
    fontSize: "0.7rem",
    fontWeight: "bold",
    "&:hover": {
      cursor: "pointer",
      background: "lightgreen",
      border: "1px solid green",
      color: "green",
    },
  },
  paginationWrapper: {
    "& .MuiOutlinedInput-input": {
      padding: "10px 10px !important",
      textAlign: "center !important",
    },
    "& .PrivateNotchedOutline-root-56": {
      top: "0px !important",
    },
    "& .MuiOutlinedInput-root": {
      height: "35px",
    },
    width: "50px",
    padding: "3px",
    "& .MuiOutlinedInput-inputMarginDense": {
      paddingLeft: "18px",
      paddingTop: "5px",
    },
  },
  searchMenuItemPaper: {
    width: "20px",
    marginRight: "20px",
    marginLeft: "20px",
    border: "none",
    paddingRight: "12px",
    "& .MuiPaper-root.MuiMenu-paper.MuiPopover-paper.MuiPaper-elevation8.MuiPaper-rounded":
      {
        marginTop: "123px !important",
      },
    "&:before": {
      borderBottom: "none",
    },
    "&:focus": {
      borderBottom: "none",
    },
    "&:hover": {
      borderBottom: "none",
    },
    "&:.MuiSelect-selectMenu": {
      textOverflow: "0px !important",
    },
  },
  selectDropdown: {
    backgroundColor: "none",
    width: "100%",
  },
  modalPopUp: {
    top: "20%",
    position: "absolute",
    background: "#FFF",
    width: "85%",
    height: "60%",
    margin: "auto",
    left: "10%",
    padding: "15px 0px",
    pointerEvents: "painted",
  },
  modalPaper: {
    position: "absolute",
    width: "70%",
    backgroundColor: "white",
    boxShadow: 5,
    padding: 10,
    outline: "none",
    borderRadius: 10,
  },
  chipRoot: {
    display: "flex",
    justifyContent: "center",
    flexWrap: "wrap",
    paddingTop: 20,
  },
  selectedBtn: {
    background: "lightgreen",
    border: "1px solid green",
    color: "green",
    "&:hover": {
      cursor: "pointer",
      background: "lightgreen",
      border: "1px solid green",
      color: "green",
    },
    margin: 5,
  },
  searchPaperMenu: {
    padding: "1px 4px",
    margin: 5,
    display: "flex",
    alignItems: "center",
    height: 45,
    borderRadius: "40px",
    width: "370px",
    "& .MuiPaper-root.MuiMenu-paper.MuiPopover-paper.MuiPaper-elevation8.MuiPaper-rounded":
      {
        marginTop: "123px !important",
      },
    [theme.breakpoints.down("xs")]: {
      height: 35,
    },
  },
  notSelectedBtn: {
    background: "#FFCCCB",
    border: "1px solid red",
    color: "red",
    "&:hover": {
      cursor: "pointer",
      background: "#FFCCCB",
      border: "1px solid red",
      color: "red",
    },
    margin: 5,
  },
  clearIcon: {
    float: "right",
    cursor: "pointer",
    padding: "0px 20px",
  },
}));

const StockYard = (props) => {
  const classes = useStyles();
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
  const { loadedYard, loadedYardSearch,user } = store;
  const matchesIphone = useMediaQuery("(max-width:500px)");
  const notify = useSnackbar().enqueueSnackbar;

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
  const nextStockPage = () => {
    setCheckAll(false);
    dispatch({
      type: "LOADEDYARD_PAGE_CHANGE",
      payload: { pg_no: Number(loadedYardSearch.pg_no) + 1 },
    });
    dispatch(searchLoadedYardDispatch());
  };

  const prevStockPage = () => {
    setCheckAll(false);
    dispatch({
      type: "LOADEDYARD_PAGE_CHANGE",
      payload: { pg_no: Number(loadedYardSearch.pg_no) - 1 },
    });
    dispatch(searchLoadedYardDispatch());
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
            style={{ color: "#243545" }}
            inputProps={{ "aria-label": "Checkbox A" }}
          />
        </div>
      ),
      width: 50,
      show:user.role!=="Loaded Yard",
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
              style={{ color: "#243545" }}
              inputProps={{ "aria-label": "Checkbox A" }}
            />
          </div>
        );
      },
    },
    {
      Header: (
        <b style={{ color: "#2A5FA5" }}>
          No
          <FontAwesomeIcon icon={faSort} />
        </b>
      ),
      accessor: "sr_no",
      style: {
        textAlign: "center",
      },
      Cell: (row) => {
        return (
          <div>
            <span title={row.original.sr_no}>{row.original.sr_no}</span>
          </div>
        );
      },
    },
    {
      Header: <b style={{ color: "#2A5FA5" }}>Container No.</b>,
      sortable: false,
      accessor: "container_no",
      style: {
        textAlign: "center",
      },
      Cell: (row) => {
        return (
          <div>
            <Typography
              onClick={() => console.log(row.original)}
              style={{
                color:
                  row.original.container_no_is_valid === false && "#FF0000",
              }}
            >
              {row.original.container_no}
            </Typography>
          </div>
        );
      },
    },
    {
      Header: (
        <b style={{ color: "#2A5FA5" }}>
          Booking No. <FontAwesomeIcon icon={faSort} />
        </b>
      ),
      accessor: "booking_no",
      style: {
        textAlign: "center",
      },
      Cell: (row) => {
        return (
          <div>
            <span title={row.original.remarks}>{row.original.booking_no}</span>
          </div>
        );
      },
    },
    {
      Header: (
        <b style={{ color: "#2A5FA5" }}>
          Port <FontAwesomeIcon icon={faSort} />
        </b>
      ),
      accessor: "port",
      style: {
        textAlign: "center",
      },
      Cell: (row) => {
        return (
          <div>
            <span title={row.original.remarks}>{row.original.port}</span>
          </div>
        );
      },
    },
    {
      Header: <b style={{ color: "#2A5FA5" }}>Process Type</b>,
      accessor: "process_type",
      style: {
        textAlign: "center",
      },
      Cell: (row) => {
        return (
          <div>
            <span title={row.original.remarks}>
              {row.original.process_type}
            </span>
          </div>
        );
      },
    },
    {
      Header: (
        <b style={{ color: "#2A5FA5" }}>
          Size <FontAwesomeIcon icon={faSort} />
        </b>
      ),

      accessor: "size",
      style: {
        textAlign: "center",
      },
      Cell: (row) => {
        return (
          <div>
            <span title={row.original.remarks}>{row.original.size}</span>
          </div>
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

  return (
    <>
      <div style={{ width: "100%" }}>
        <div
          style={{
            display: matchesIphone ? "block" : "flex",
            alignItems: "center",
            justifyContent: "space-between",
            paddingLeft: 15,
            paddingRight: 15,
            marginBottom: 30,
            marginTop: 30,
          }}
        >
          <Grid
            container
            style={{ alignItems: "center", width: "100%" }}
            justifyContent="space-between"
          >
            <Grid
              xs={12}
              sm={6}
              md={6}
              lg={4}
              className={classes.searchPaperWrapper}
              spacing={4}
            >
              <Paper
                component="form"
                className={classes.searchPaperMenu}
                elevation={0}
              >
                <Select
                  id="client-name"
                  value={name}
                  fullWidth
                  className={classes.searchMenuItemPaper}
                  onChange={updateName}
                >
                  <MenuItem value={"Container Number"}>
                    &nbsp; &nbsp;&nbsp;Container Number
                  </MenuItem>
                  <MenuItem value={"Booking Number"}>
                    &nbsp; &nbsp;&nbsp;Booking Number
                  </MenuItem>
                  <MenuItem value={"Port"}>&nbsp; &nbsp;&nbsp;Port</MenuItem>
                  <MenuItem value={"Size"}>&nbsp; &nbsp;&nbsp;Size</MenuItem>
                </Select>
                <InputBase
                  className={classes.input}
                  placeholder={`Search ${name}`}
                  inputProps={{ "aria-label": "search" }}
                  value={filterType}
                  onChange={setDispatchType}
                  autoComplete="off"
                />
                <IconButton
                  type="button"
                  className={classes.iconButton}
                  aria-label="search"
                  onClick={() => {
                    getData();
                  }}
                >
                  <SearchIcon />
                </IconButton>
              </Paper>
            </Grid>
            {/* <Grid xs={6} sm={6} md={3}   lg={4}>
              <Button
                className={classes.searchButton}
                onClick={handleOpen}
                endIcon={<SearchIcon />}
              >
                Advance Search
              </Button>
            </Grid> */}
            <Grid item xs={6} sm={6} md={3} lg={2}>
              <FormControlLabel
                value="yes"
                control={
                  <Radio
                    style={{ color: "#2A5FA5" }}
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
              <FormControlLabel
                value="no"
                control={
                  <Radio
                    style={{ color: "#2A5FA5" }}
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
            {selectedRows.length > 0 ? (
              <Grid xs={6} sm={6} md={10} lg={2}>
                <Button
                  style={{
                    margin: "auto",
                    marginRight: "3px",
                    display: "flex",
                    alignItems: "center",
                  }}
                  className={classes.button}
                  onClick={() => {
                    setOpenModal(true);
                  }}
                >
                  Generate Loaded Stock EDI
                </Button>
              </Grid>
            ) : (
              <Grid xs={6} sm={6} md={10} lg={2}></Grid>
            )}

            <Grid xs={12} sm={12} lg={12}>
              <Button
                style={{
                  backgroundColor: "#2A5FA5",
                  color: "white",
                  margin: "auto",
                  marginRight: "3px",
                  display: "flex",
                  alignItems: "center",
                }}
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
                startIcon={<RefreshIcon />}
              >
                Refresh
              </Button>
            </Grid>
          </Grid>
        </div>

        <Paper className={classes.paperContainer} elevation={0}>
          <ReactTable
            data={loadedYardSearch.yardListing && loadedYardSearch.yardListing}
            columns={[...Columns]}
            className={classes.reactTable}
            collapseOnDataChange={false}
            minRows={Number(loadedYardSearch.yardListing.length)}
            defaultPageSize={loadedYardSearch.on_page_data_change}
            pageSize={Number(loadedYardSearch.on_page_data_change)}
            resizable={true}
            style={{
              height: matchesIphone ? "350px" : "300px", // This will force the table body to overflow and scroll, since there is not enough room
            }}
            showPagination={false}
          />
          <Grid
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              padding: 10,
              border: "1px solid #0000000d",
              marginBottom: 20,
            }}
          >
            {matchesIphone ? (
              <IconButton
                onClick={prevStockPage}
                disabled={
                  store.loadedYardSearch.pg_no === 1 ||
                  store.loadedYardSearch.pg_no === "1"
                    ? true
                    : false
                }
              >
                <PreviousIcon
                  style={{
                    fill:
                      store.loadedYardSearch.pg_no === 1 ||
                      store.loadedYardSearch.pg_no === "1"
                        ? "grey"
                        : "#243545",
                  }}
                />
              </IconButton>
            ) : (
              <Button
                variant="contained"
                startIcon={<PreviousIcon />}
                color="secondary"
                onClick={prevStockPage}
                disabled={
                  loadedYardSearch.pg_no === 1 || loadedYardSearch.pg_no === "1"
                    ? true
                    : false
                }
              >
                Previous
              </Button>
            )}

            <Grid style={{ display: "flex", alignItems: "flex-end" }}>
              {!matchesIphone && (
                <Typography variant="subtitle2" style={{ padding: "3px" }}>
                  Page
                </Typography>
              )}
              <TextField
                id="basic"
                variant="outlined"
                size="small"
                className={classes.paginationWrapper}
                value={loadedYardSearch.pg_no}
                onChange={(e) => {
                  if (e.target.value > loadedYardSearch.total_pages) {
                    notify("Invalid value entered", {
                      variant: "warning",
                    });
                  } else {
                    dispatch({
                      type: "LOADEDYARD_PAGE_CHANGE",
                      payload: {
                        pg_no: e.target.value,
                      },
                    });
                    dispatch(searchLoadedYardDispatch());
                  }
                }}
                onBlur={(e) => {
                  if (e.target.value > loadedYardSearch.total_pages) {
                    notify("Invalid value entered", {
                      variant: "warning",
                    });
                  } else {
                    dispatch({
                      type: "LOADEDYARD_PAGE_CHANGE",
                      payload: {
                        pg_no: e.target.value,
                      },
                    });
                    dispatch(searchLoadedYardDispatch());
                  }
                }}
              />
              {!matchesIphone && (
                <Typography variant="subtitle2" style={{ padding: "3px" }}>
                  of
                </Typography>
              )}

              <Typography
                variant="subtitle2"
                style={{
                  padding: matchesIphone ? "10px 0 10px 0" : "3px",
                  fontSize: matchesIphone ? "12px" : "14px",
                }}
              >
                {loadedYardSearch.total_pages}
              </Typography>
            </Grid>
        {  !matchesIphone &&  <TextField
              id="client-master-code"
              select
              value={loadedYardSearch.on_page_data_change}
              variant="outlined"
              inputProps={{ className: classes.input }}
              onChange={(e) => {
                dispatch({
                  type: "LOADEDYARD_PAGE_CHANGE",
                  payload: {
                    pg_no: 1,
                    on_page_data_change: e.target.value,
                  },
                });
                dispatch(searchLoadedYardDispatch());
              }}
            >
              <MenuItem key={"5 rows"} value={"5"}>
                {"5 rows"}
              </MenuItem>
              <MenuItem key={"10 rows"} value={"10"}>
                {"10 rows"}
              </MenuItem>
              <MenuItem key={"20 rows"} value={"20"}>
                {"20 rows"}
              </MenuItem>
              <MenuItem key={"25 rows"} value={"25"}>
                {"25 rows"}
              </MenuItem>
              <MenuItem key={"50 rows"} value={"50"}>
                {"50 rows"}
              </MenuItem>
              <MenuItem key={"100 rows"} value={"100"}>
                {"100 rows"}
              </MenuItem>
            </TextField>}
            {matchesIphone ? (
              <IconButton
                onClick={nextStockPage}
                disabled={loadedYardSearch.next_page === "" ? true : false}
              >
                <NextIcon
                  style={{
                    fill: loadedYardSearch.nextPage === "" ? "gray" : "#243545",
                  }}
                />
              </IconButton>
            ) : (
              <Button
                variant="contained"
                endIcon={<NextIcon />}
                color="secondary"
                onClick={nextStockPage}
                disabled={loadedYardSearch.next_page === "" ? true : false}
              >
                Next
              </Button>
            )}
          </Grid>
        </Paper>
       
        <StockFooter />

        <Modal open={openModal} onClose={handleModalClose}>
          <div style={getModalStyle()} className={classes.modalPaper}>
            <Typography variant="h6" id="modal-title">
              List of selected containers available for dispatch
            </Typography>
            <Grid className={classes.chipRoot} style={{ paddingBottom: 50 }}>
              {selectedRows.length !== 0 &&
                selectedRows.map((option) => (
                  <Chip
                    label={option.container_no}
                    clickable
                    className={
                      option.enabled === true
                        ? classes.selectedBtn
                        : classes.notSelectedBtn
                    }
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

            <Typography className={classes.chipRoot}>
              Total Containers Selected: {totalSelectedContainers()}
            </Typography>

            <Grid className={classes.chipRoot}>
              <Button
                onClick={handleDownloadEDI}
                style={{
                  backgroundColor: "#2A5FA5",
                  color: "white",
                  borderRadius: 7,
                }}
              >
                Generate EDI
              </Button>
            </Grid>
          </div>
        </Modal>
        <Modal open={open} onClose={handleClose}>
          <Box className={classes.modalPopUp}>
            <Grid className={classes.clearIcon}>
              {" "}
              <ClearIcon onClick={handleClose} />
            </Grid>
            <StockYardSearchModal handleClose={handleClose} />
          </Box>
        </Modal>
      </div>
    </>
  );
};

export default StockYard;
