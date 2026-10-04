import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogActions,
  Typography,
  Box,
  Grid,
  IconButton,
  Radio,
  Divider,
  List,
  ListItem,
  ListItemText,
  useMediaQuery,
  MenuItem,
  Backdrop,
  CircularProgress,
} from "@mui/material";
import LayoutContainer from "@components/reusablecomponents/LayoutContainer";
import { useDispatch, useSelector } from "react-redux";
import { useSnackbar } from "notistack";
import { downloadStockSampleData } from "../../actions/LoadedYardUploadAction";
import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";
import {
  addTools,
  deleteProAllTools,
  deleteSingleData,
  downloadProcurementReports,
  editTools,
  editToolsEmpty,
  getProAllTools,
} from "../../actions/Procurement/procurementAction";
import Add from "@mui/icons-material/Add";
import Table from "../../components/Procurement/Table";
import FormModel from "../../components/Procurement/FormModel";
import {
  changeModeAction,
  createRequestFromToolRoom,
} from "../../actions/Procurement/requestAction";
import {
  changeModeConsumeAction,
  createConsumeFromToolRoom,
} from "../../actions/Procurement/consumptionAction";
import { REQ_REDUCER } from "../../reducers/procurement/requesitionReducer";
import { Stack } from "@mui/material";
import { Link, useHistory } from "react-router-dom";
import SearchIcon from "@mui/icons-material/Search";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers";
import dayjs from "dayjs";
import RefreshIcon from "@mui/icons-material/Refresh";
import ImportExportIcon from "@mui/icons-material/ImportExport";
import BuildCircleOutlinedIcon from "@mui/icons-material/BuildCircleOutlined";
import {
  TableAdvanceSearchWithModal,
  TableCustomSearchBarWithDropDown,
  TableFootercontainer,
  TablePageTitle,
  TableRefreshIcon,
} from "@/components/TableComponent/TableComponent";
import ClearIcon from "@mui/icons-material/Clear";
import { custombackDropStyle } from "@/utils/CustomClasses";

const ToolRoom = () => {
  const dispatch = useDispatch();
  const history = useHistory();
  const matchesIphone = useMediaQuery("(max-width:500px)");
    const { isloading } = useSelector((state) => state.ui);
  const proState = useSelector((state) => state.Procurement);
  const [selectedData, setSelectedData] = useState([]);
  const [inputText, setInputText] = useState("");
  const [modal, setModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [singleData, setSingleData] = useState(null);
  const [process, setProcess] = useState("Item");
  const [editMode, setEditMode] = useState(false);
  const [onPageData, setOnPageData] = useState(5);
  const [searchSelect, setSearchSelect] = useState("category");
  const [searchText, setSearchText] = useState("");
  const [searchCategoryId, setSearchCategoryId] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const { user } = useSelector((state) => state);
  // const matchesIphone = useMediaQuery("(max-width:400px)");
  const notify = useSnackbar().enqueueSnackbar;
  const [radioType, setRadioType] = useState("");

  const [anchorElAdvance, setAnchorElAdvance] = React.useState(null);
  const [selectedRadioType, setSelectedRadioType] = useState("");
  const [loader, setLoader] = useState(false);
  const fromDateRef = useRef();
  const [showDropdown, setDropdown] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const handleClickAdvance = (event) => {
    setAnchorElAdvance(event.currentTarget);
  };

  const handleCloseAdvance = () => {
    setAnchorElAdvance(null);
  };

  const openAdvance = Boolean(anchorElAdvance);
  const idAdvance = openAdvance ? "simple-popover-Advance" : undefined;

  useEffect(() => {
    dispatch({
      type: "GET_ALL_TOOLS",
      payload: {
        pg_no: 1,
        set_on_page_data: 5,
        category: "",
        sku_code: "",
        name: "",
        from_date: "",
        to_date: "",
        process: "",
      },
    });
    dispatch(getProAllTools(notify));

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleEditModel = (original) => {
    setEditMode(true);
    dispatch(editTools(original, notify));
    setModal((prev) => !prev);
  };
  const handleDeleteModel = () => {
    setDeleteModal((prev) => !prev);
  };

  const handleDownload = () => {
    dispatch(downloadStockSampleData(notify));
  };

  const handleAdd = (value) => {
    setEditMode(false);
    dispatch(addTools(value, notify));
    setModal(false);
  };

  const handleSingleDelete = (singleData) => {
    setSingleData(singleData);
    setDeleteModal((prev) => !prev);
  };

  const handleDateChange = (date, setValue) => {
    var selectedDate = new Date(date);
    var dd = String(selectedDate.getDate()).padStart(2, "0");
    var mm = String(selectedDate.getMonth() + 1).padStart(2, "0"); //
    var yyyy = selectedDate.getFullYear();
    var selectedDateFormat = yyyy + "-" + mm + "-" + dd;
    setValue(selectedDateFormat);
  };

  const onClickSearch = () => {
    dispatch({
      type: "GET_ALL_TOOLS",
      payload: {
        category: "",
        sku_code: "",
        name: "",
      },
    });
    dispatch({
      type: "GET_ALL_TOOLS",
      payload: {
        pg_no: 1,
        [searchSelect]: inputText,
      },
    });
    dispatch(getProAllTools(notify));
  };

  const handleIITDateChange = (date) => {
    var selectedDate = new Date(date);
    var dd = String(selectedDate.getDate()).padStart(2, "0");
    var mm = String(selectedDate.getMonth() + 1).padStart(2, "0"); //
    var yyyy = selectedDate.getFullYear();
    var selectedDateFormat = yyyy + "-" + mm + "-" + dd;

    return selectedDateFormat;
  };

  const handleAllRequest = () => {
    const currentDate = new Date();
    let current = handleIITDateChange(currentDate);
    dispatch({
      type: REQ_REDUCER.REQ_GET_REQUEST_BY_PK,
      payload: {
        mode: "CREATE",
        order_no: "",
        date: current,
        status: "PENDING",
        total_amount: selectedData.reduce((a, c) => a + c.rate, 0),
        location: user.location,
        site: user.site,
        requisition_line: selectedData.map((val) => ({
          category_id: val.category_id,
          tool_id: val.pk,
          category: val.category,
          name: val.name,
          rate: val.rate,
          sku_code: val.sku_code,
          amount: val.rate,
          required_qty: 1,
          received_qty: 0,
          remaining_qty: 1,
          remarks: "",
        })),
      },
    });
    dispatch(createRequestFromToolRoom(selectedData));
    dispatch(
      changeModeAction({
        edit: false,
        create: true,
        approve: false,
        cancel: false,
        delete: false,
      })
    );
  };

  const handleAllConsume = () => {
    dispatch(createConsumeFromToolRoom(selectedData));
    dispatch(
      changeModeConsumeAction({
        edit: false,
        create: true,
        approve: false,
      })
    );
  };

  const addToolModelHandle = () => setModal((prev) => !prev);

  const findSelected = () => {
    let result = false;

    for (let index = 0; index < proState.allTools.data.length; index++) {
      const element = proState.allTools.data[index];
      let select = selectedData.some((val, ind) => element.pk === val.pk);
      if (select) {
        result = true;
      } else {
        result = false;
        break;
      }
    }
    return result;
  };

  const handleAllChecked = () => {
    if (selectedData.length === 0) {
      setSelectedData(proState.allTools.data);
      var checkedData = document.getElementsByClassName("checkbox_pro");
      for (let index = 0; index < checkedData.length; index++) {
        checkedData[index].checked = true;
      }
    } else if (!findSelected()) {
      setSelectedData((prev) => [...prev, ...proState.allTools.data]);
      var checkedData = document.getElementsByClassName("checkbox_pro");
      for (let index = 0; index < checkedData.length; index++) {
        checkedData[index].checked = true;
      }
    } else {
      proState.allTools.data.forEach((element, index) => {
        if (selectedData.some((val, ind) => element.pk === val.pk)) {
          setSelectedData((prev) =>
            prev.filter((item) => item.pk !== element.pk)
          );
        }
      });

      var checkedDatas = document.getElementsByClassName("checkbox_pro");
      for (let index = 0; index < checkedDatas.length; index++) {
        checkedDatas[index].checked = false;
      }
    }
  };

  const setModalClose = () => {
    setEditMode(false);
    dispatch(editToolsEmpty());
    setModal(false);
    dispatch(getProAllTools(notify));
  };

  const nextStockPage = () => {
    dispatch({
      type: "GET_ALL_TOOLS",
      payload: {
        pg_no: Number(proState.allTools.pg_no) + 1,
      },
    });
    dispatch(getProAllTools(notify));
  };

  const prevStockPage = () => {
    dispatch({
      type: "GET_ALL_TOOLS",
      payload: {
        pg_no: Number(proState.allTools.pg_no) - 1,
      },
    });
    dispatch(getProAllTools(notify));
  };

  const handleOnPageDataChange = (e) => {
    setOnPageData(e.target.value);
    dispatch(getProAllTools(1, e.target.value));
  };

  const handleRefreshAction = () => {
    setSelectedRadioType("");
    setFromDate("");
    setToDate("");
    setRadioType("");
    dispatch({
      type: "GET_ALL_TOOLS",
      payload: {
        pg_no: 1,
        set_on_page_data: 5,
        no_of_data: "",
        category: "",
        sku_code: "",
        name: "",
        from_date: "",
        to_date: "",
        process: "",
      },
    });
    dispatch(getProAllTools(notify));
  };

  const handleSetProcess = useCallback(
    (e) => setProcess(e.target.value),
    [process]
  );

  const handleSearchChange = useCallback(
    (e) => {
      setSearchText(e.target.value);
      if (e.target.value.length > 0) {
        setDropdown(true);
      } else {
        setDropdown(false);
      }
    },
    [searchText]
  );
  const handleCloseClick = useCallback(() => setSearchText(""), [searchText]);

  const handleSearchButton = useCallback(() => {
    handleClickAway();
    dispatch({
      type: "GET_ALL_TOOLS",
      payload: {
        category: "",
        sku_code: "",
        name: "",
      },
    });
    dispatch({
      type: "GET_ALL_TOOLS",
      payload: {
        pg_no: 1,
        [process === "Item"
          ? "name"
          : process === "Category"
          ? "category"
          : process === "SKU code"
          ? "sku_code"
          : "name"]: process === "Category" ? searchCategoryId : searchText,
      },
    });
    dispatch(getProAllTools(notify));
  }, [searchText, notify, process]);

  const handleAdvanceSearch = () => {
    if (fromDate === "") {
      notify("Please select from date", { variant: "warning" });
    } else if (toDate === "") {
      notify("Please select to date", { variant: "warning" });
    } else if (radioType === "") {
      notify("Please select Type", { variant: "warning" });
    } else {
      dispatch({
        type: "GET_ALL_TOOLS",
        payload: {
          pg_no: 1,
          process: radioType === "Req" ? "Requisition" : "Consumption",
          from_date: fromDate,
          to_date: toDate,
        },
      });
      setSelectedRadioType(radioType);
      dispatch(getProAllTools(notify));
      handleCloseAdvance();
      handleClose()
    }
  };

  const handleClearAdvance = () => {
    setFromDate("");
    setToDate("");
    setRadioType("");
    setSelectedRadioType("");
    dispatch({
      type: "GET_ALL_TOOLS",
      payload: {
        pg_no: 1,
        process: "",
        from_date: "",
        to_date: "",
      },
    });
    dispatch(getProAllTools(notify));
    // handleCloseAdvance()
  };

  const handleDownloadReport = () => {
    let data = {
      from_date: fromDate,
      to_date: toDate,
      report:
        selectedRadioType === "Req"
          ? "REQUISITION REPORT"
          : "CONSUMPTION REPORT",
      location: user.location_id,
      site: user.site_id,
      item: process === "Item" ? searchText : "",
      category: process === "Category" ? searchText : "",
    };
    dispatch(downloadProcurementReports(data, setLoader, notify));
  };

  const handleClickAway = () => {
    setDropdown(false);
  };

  const procurementDropDown = (
    <Paper
      sx={{
        position: "absolute",
        top: 52,
        left: 0,
        width: "80%",
        maxHeight:400,
        overflowY:"scroll",
        marginLeft: "30px",
        borderTopRightRadius: 0,
        borderTopLeftRadius: 0,
      }}
      elevation={1}
    >
      {showDropdown ? (
        <List aria-label="search results">
          {process === "Item" ? (
            proState.getAllToolsCategory?.tools_list
              ?.filter((val) =>
                val.name.toLowerCase().includes(searchText.toLowerCase())
              )
              .map((toolData, index) => {
                return (
                  <ListItem
                    button
                    key={index}
                    onClick={() => {
                      setSearchText((prev) => (prev = toolData.name));
                      handleClickAway();
                    }}
                  >
                    <ListItemText primary={`${toolData.name} `} />
                  </ListItem>
                );
              })
          ) : process === "Category" ? (
            proState.getAllToolsCategory?.category_list
              ?.filter((val) =>
                val.name.toLowerCase().includes(searchText.toLowerCase())
              )
              .map((toolData, index) => {
                return (
                  <ListItem
                    button
                    key={index}
                    onClick={() => {
                      setSearchText((prev) => (prev = toolData.name));
                      setSearchCategoryId(toolData.pk);
                      handleClickAway();
                    }}
                  >
                    <ListItemText primary={`${toolData.name} `} />
                  </ListItem>
                );
              })
          ) : process === "SKU code" ? (
            proState.getAllToolsCategory?.sku_codes
              ?.filter((val) => val.includes(searchText))
              .map((skuData, index) => {
                return (
                  <ListItem
                    button
                    key={index}
                    onClick={() => {
                      setSearchText((prev) => (prev = skuData));
                      handleClickAway();
                    }}
                  >
                    <ListItemText primary={`${skuData} `} />
                  </ListItem>
                );
              })
          ) : (
            <Typography>No result found for {`"${searchText}"`}</Typography>
          )}
        </List>
      ) : (
        <Typography>No result found for {`"${searchText}"`}</Typography>
      )}
    </Paper>
  );

  return (
    <LayoutContainer footer={false} style={{ paddingBottom: "100px" }}>
      <Box padding={matchesIphone ? 1 : 2}>
        <Stack
          direction={"row"}
          alignItems={"center"}
          justifyContent={"flex-start"}
          mb={6}
          spacing={2}
        >
          <BuildCircleOutlinedIcon fontSize="small" />
          <TablePageTitle>Tool Room</TablePageTitle>
        </Stack>
        <Grid container spacing={2}>
          <Grid
            item
            size={{ xs: 10, sm: 8, md: 8, lg: 8, xl: 8 }}
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-start",
              gap: 2,
            }}
          >
            <TableCustomSearchBarWithDropDown
              selectName={process}
              updateSelectname={handleSetProcess}
              searchText={searchText}
              setSearchText={handleSearchChange}
              closeClick={handleCloseClick}
              searchClick={handleSearchButton}
              dropDown={procurementDropDown}
              showDropDown={showDropdown}
              handleClickAway={handleClickAway}
              maxWidthSearch={matchesIphone?"90%": "60%"}
            >
              <MenuItem key={"Item"} value="Item">
                Item
              </MenuItem>
              <MenuItem key={"Category"} value="Category">
                Category
              </MenuItem>
              {(user.procurement_admin === true ||
                user.procurement_admin === "True") && (
                <MenuItem key={"SKU code"} value="SKU code">
                  SKU code
                </MenuItem>
              )}
            </TableCustomSearchBarWithDropDown>
            <TableAdvanceSearchWithModal
              open={open}
              handleClose={handleClose}
              handleOpen={handleOpen}
              style={{ width: "fit-content" }}
              activeFilter={
                radioType === "Req" ||
                radioType === "Con" ||
                (fromDate !== "" && toDate !== "")
              }
              moveToTop={true}
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
                    <IconButton color="warning" onClick={handleAdvanceSearch}>
                      <SearchIcon />
                    </IconButton>
                    <IconButton color="default" onClick={handleClearAdvance}>
                      <RefreshIcon />
                    </IconButton>
                    <ClearIcon onClick={handleClose} />
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

                <Stack direction={"row"} spacing={2}>
                  <Typography variant="caption">from </Typography>
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                      slotProps={{ textField: { size: "small" } }}
                      format="YYYY/MM/DD"
                      id={`-date-picker-inline`}
                      value={fromDate ? dayjs(fromDate) : null}
                      name="from_date"
                      sx={{ width: 180 }}
                      onChange={(date) => {
                        handleDateChange(date, setFromDate);
                      }}
                    />
                  </LocalizationProvider>

                  <Typography variant="caption">to</Typography>
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                      slotProps={{ textField: { size: "small" } }}
                      format="YYYY/MM/DD"
                      id={`-date-picker-inline`}
                      value={toDate ? dayjs(toDate) : null}
                      name="from_date"
                      sx={{ width: 180 }}
                      onChange={(date) => {
                        handleDateChange(date, setToDate);
                      }}
                    />
                  </LocalizationProvider>
                </Stack>
                <Typography
                  variant="subtitle2"
                  style={{
                    fontWeight: "600",
                    marginTop: "32px",
                    marginBottom: "8px",
                  }}
                >
                  {" "}
                  Select Type
                </Typography>
                <Stack direction={"row"} alignItems={"center"}>
                  <Typography variant="caption">Requesition</Typography>
                  <Radio
                    checked={radioType === "Req"}
                    onClick={() => setRadioType("Req")}
                  />
                  <Typography variant="caption">Consumption</Typography>
                  <Radio
                    checked={radioType === "Con"}
                    onClick={() => setRadioType("Con")}
                  />
                </Stack>
              
              </Box>
            </TableAdvanceSearchWithModal>
          </Grid>

          <Grid
            item
            size={{ xs: 12, sm: 12, md: 12, lg: 12, xl: 12 }}
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
              gap: 1,
            }}
          >
            <TableRefreshIcon onClick={handleRefreshAction} />
          </Grid>
        </Grid>
        <TableFootercontainer>
          {selectedData.length !== 0 && (
            <Stack
              alignItems={"center"}
              flexDirection={"row"}
              direction={"row"}
              justifyContent={"flex-end"}
              spacing={2}
              mr={2}
           
            >
              {user.procurement_admin && (
                <Link to="/procurement/requesition/add">
                  <Button
                    onClick={handleAllRequest}
                    variant="contained"
                    color="secondary"
                    aria-label="request"
                    sx={{
                      width: 160,
                      borderRadius: 12,
                    }}
                  >
                    Request
                  </Button>
                </Link>
              )}
              <Link to="/procurement/consumption/add">
                <Button
                  variant="contained"
                  color="secondary"
                  aria-label="consume"
                  onClick={handleAllConsume}
                  sx={{
                    width: 160,
                    borderRadius: 12,
                  }}
                >
                  Consume
                </Button>
              </Link>
            </Stack>
          )}

          {(user.procurement_admin === "True" ||
            user.procurement_admin === true) && selectedData.length === 0 && (
            <Button
              variant="contained"
              color="primary"
              sx={(theme) => ({
                display: "flex",
                width: 160,

                cursor: "pointer",
                textDecoration: "none",
                color: "white",
                fontSize: "12px",
                mr: 2,
                borderRadius: 12,
                [theme.breakpoints.down("sm")]: {
                  minWidth: 120,
                },
              })}
              onClick={addToolModelHandle}
              startIcon={<Add />}
            >
              Add Tool
            </Button>
          )}
          {(user.procurement_admin === "True" ||
            user.procurement_admin === true) && selectedData.length === 0 && (
            <Button
              onClick={() => history.push("/procurement/tools/upload")}
              variant="contained"
              color="success"
              sx={(theme)=>({
                display: "flex",

                width: 160,
                cursor: "pointer",
                textDecoration: "none",
                color: "white",
                fontSize: "12px",
                mr: 2,
                   borderRadius: 12,
                [theme.breakpoints.down("sm")]: {
                  minWidth: 120,
                },
              })}
              startIcon={<CloudUploadOutlinedIcon fontSize="small" />}
            >
              Bulk Upload
            </Button>
          )}
          {selectedRadioType !== "" && (
            <Button
              variant="contained"
              color="success"
              sx={(theme)=>({
                display: "flex",

                width: 160,
                cursor: "pointer",
                textDecoration: "none",
                color: "white",
                fontSize: "12px",
                   borderRadius: 12,
                [theme.breakpoints.down("sm")]: {
                  minWidth: 120,
                },
              })}
              onClick={handleDownloadReport}
              startIcon={<ImportExportIcon />}
            >
              Download
            </Button>
          )}
        </TableFootercontainer>
      </Box>

      <Stack
        direction={"row"}
        justifyContent={"space-between"}
        alignItems={"center"}
        spacing={2}
      >
        {fromDate !== "" && toDate !== "" && process !== "" ? (
          <Typography
            variant="caption"
            style={{
              marginBottom: "-50px",
              color: "rgba(0,0,0,0.5)",
              marginLeft: "20px",
            }}
          >
            {" "}
            {fromDate && fromDate.split("-").join("/")} -{" "}
            {toDate && toDate.split("-").join("/")}
          </Typography>
        ) : (
          <Typography></Typography>
        )}
      </Stack>

      <Table
        loading={proState.toolTableLoading === "TRUE" ? true : false}
        data={proState.allTools.data || []}
        handleDeleteModel={handleDeleteModel}
        handleEditModel={handleEditModel}
        selectedData={selectedData}
        setSelectedData={setSelectedData}
        handleSingleDelete={handleSingleDelete}
        handleAllRequest={handleAllRequest}
        handleAllChecked={handleAllChecked}
        handleAllConsume={handleAllConsume}
        onPageData={onPageData}
        handleOnPageDataChange={handleOnPageDataChange}
        prevStockPage={prevStockPage}
        nextStockPage={nextStockPage}
        radioType={selectedRadioType}
      />

      <FormModel
        modalOpen={modal}
        setModalClose={setModalClose}
        handleDownload={handleDownload}
        handleAdd={handleAdd}
        editMode={editMode}
      />

      <Dialog
        open={deleteModal}
        onClose={handleDeleteModel}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <div style={{ width: "400px" }}>
          <DialogTitle id="alert-dialog-title">{"Delete Tools"}</DialogTitle>
          <DialogActions>
            <Button onClick={handleDeleteModel}>Disagree</Button>
            <Button
              style={{ backgroundColor: "red", color: "white" }}
              variant="contained"
              onClick={() => {
                if (selectedData.length === 0) {
                  dispatch(deleteSingleData(singleData, notify));
                  setSelectedData([]);
                  handleDeleteModel();
                  return;
                }

                dispatch(deleteProAllTools(selectedData, notify));
                setSelectedData([]);
                handleDeleteModel();

                var checkedData =
                  document.getElementsByClassName("checkbox_pro");
                for (let index = 0; index < checkedData.length; index++) {
                  checkedData[index].checked = false;
                }
              }}
              autoFocus
            >
              Agree
            </Button>
          </DialogActions>
        </div>
      </Dialog>
        <Backdrop sx={custombackDropStyle} open={isloading}>
        <CircularProgress color="inherit" />
      </Backdrop>
    </LayoutContainer>
  );
};

export default ToolRoom;
