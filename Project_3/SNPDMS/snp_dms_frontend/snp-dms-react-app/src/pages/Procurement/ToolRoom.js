import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogActions,
  Typography,
  Box,
  makeStyles,
  Grid,
  IconButton,
  Popover,
  Radio,
  Divider,
  List,
  ListItem,
  ListItemText,
} from "@material-ui/core";
import LayoutContainer from "../../components/reusableComponents/LayoutContainer";
import { useDispatch, useSelector } from "react-redux";
import { useSnackbar } from "notistack";
import { downloadStockSampleData } from "../../actions/LoadedYardUploadAction";
import UploadIcon from "@mui/icons-material/Upload";
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
import Search from "../../components/Procurement/Search";
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
import AutomationSearch from "../../components/reusableComponents/AutomationSearch";
import { Stack } from "@mui/material";
import ReplayIcon from "@mui/icons-material/Replay";
import { Link, useHistory } from "react-router-dom";
import SearchIcon from "@mui/icons-material/Search";
import TuneIcon from "@mui/icons-material/Tune";
import DateFnsUtils from "@date-io/date-fns";
import {
  KeyboardDatePicker,
  MuiPickersUtilsProvider,
} from "@material-ui/pickers";
import RefreshIcon from "@mui/icons-material/Refresh";
import ImportExportIcon from "@material-ui/icons/ImportExport";
import DatePickerField from "../../components/reusableComponents/DatePickerField";

const useStyles = makeStyles((theme) => ({
  paperContainer: {
    padding: theme.spacing(4, 3),
    backgroundColor: "transparent",
  },
  searchBox: {
    padding: "20px 20px 20px",
  },
  refreshIcon: {
    width: "24px",
    backgroundColor: "transparent",
  },
  LabelTypography: {
    fontSize: 14,
    fontWeight: 600,
    color: "#243545",
    paddingBottom: 4,
    [theme.breakpoints.down("sm")]: {
      paddingBottom: 1,
    },
  },
  button: {
    fontSize: 12.5,
    borderRadius: 6,
    marginLeft: "auto",
    marginRight: "auto",
    marginTop: 20,
    width: "35%",
    border: "1.5px solid #2A5FA5",
    boxShadow: "0px 3px 6px #9199A14D",
    backgroundColor: "#2A5FA5",
    color: "#fff",
    "&:hover": {
      backgroundColor: "#2A5FA5",
    },
  },
  bulkUpload: {
    display: "flex",
    border: "none",
    padding: "4px 8px ",
    backgroundColor: "#2a5fa5",
    borderRadius: "4px",
    cursor: "pointer",
    textDecoration: "none",
    color: "white",
    fontSize: "12px",
  },
  downloadReport: {
    padding: "4px 8px ",
    backgroundColor: "#64b865",
    borderRadius: "4px",
    cursor: "pointer",
    textDecoration: "none",
    color: "white",
    fontSize: "12px",
  },
  input: {
    padding: 8,
  },
  textField: {
    borderColor: "#2a5fa5",

    "& .MuiOutlinedInput-root": {
      borderColor: "red",
      borderRadius: "5px",

      "& fieldset": {
        borderColor: "red",
      },
    },
    "& .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline": {
      padding: "0 !important",
      border: "2px solid rgba(0,0,0,0.2)",
      borderRadius: "8px",
    },
  },
  input: {
    marginLeft: theme.spacing(1),
    flex: 1,
    padding: 7,
    width: "70px",
    borderRadius: "50px",
    borderColor: "#2a5fa5",
    fontSize: "12px",
    [theme.breakpoints.down("xs")]: {
      padding: 1,
      fontSize: "0.8rem",
    },
  },

  backImage: {
    height: 40,
    width: 40,
    marginBottom: 15,
    cursor: "pointer",
  },
  autocomplete: {
    "& .MuiAutocomplete-inputRoot[class*='MuiOutlinedInput-root']": {
      padding: 0,
    },
  },
  backdrop: {
    zIndex: theme.zIndex.drawer + 1,
    color: "#fff",
  },
  requestButton: {
    border: "1px solid green",
    padding: "4px 20px ",
    borderRadius: "4px",
    cursor: "pointer",
    textDecoration: "none !important",
    color: "green",
    fontWeight: "bold",
    "&.MuiButton-label": {
      textDecoration: "none !important",
    },
  },
  consumeButton: {
    border: "1px solid rgb(111, 47, 47) !important",
    color: " rgb(111, 47, 47)",
  },
  advanceSearch: {
    backgroundColor: "#fdbd2e",
    borderRadius: "8px",
  },
  searchResultContainer: {
    position: "absolute",
    top: 52,
    left: 0,
    width: "80%",
    marginLeft: "30px",
    zIndex: 10,
    borderTopRightRadius: 0,
    borderTopLeftRadius: 0,
  },
}));

const ToolRoom = () => {
  const dispatch = useDispatch();
  const classes = useStyles();
  const history = useHistory();
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
  const [searchCategoryId,setSearchCategoryId] = useState("")
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
          category_id:val.category_id,
          tool_id:val.pk,
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
    let result =false;
  
    for (let index = 0; index < proState.allTools.data.length; index++) {
     const element = proState.allTools.data[index];
      let select= selectedData.some((val,ind)=>element.pk===val.pk)
      if(select){
       result =true
      }else{
       result =false;
       break;
      }
    }
    return result
  };



  const handleAllChecked = () => {
    if (selectedData.length === 0) {
      setSelectedData(proState.allTools.data);
      var checkedData = document.getElementsByClassName("checkbox_pro");
      for (let index = 0; index < checkedData.length; index++) {
        checkedData[index].checked = true;
      }
    } else if(!findSelected()){
        setSelectedData(prev=>[...prev,...proState.allTools.data])
        var checkedData = document.getElementsByClassName("checkbox_pro");
        for (let index = 0; index < checkedData.length; index++) {
          checkedData[index].checked = true;
        }
    }
    else {
      proState.allTools.data.forEach((element,index)=>{
        if(selectedData.some((val,ind)=>element.pk===val.pk)){
          setSelectedData(prev=>prev.filter(item=>item.pk!==element.pk))
        }
      })
    
     
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
    handleClickAway()
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
          : "name"]: process === "Category"?searchCategoryId: searchText,
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
      item:process ==="Item" ? searchText:"",
      category: process ==="Category" ? searchText:"",
    };
    dispatch(downloadProcurementReports(data, setLoader, notify));
  };

  const handleClickAway = () => {
    setDropdown(false);
  };

  

  const procurementDropDown = (
    <Paper className={classes.searchResultContainer} elevation={1}>
      {showDropdown ? (
        <List aria-label="search results">
          {process === "Item"
            ? proState.getAllToolsCategory?.tools_list?.filter(val=>val.name.toLowerCase().includes(searchText.toLowerCase())).map(
                (toolData, index) => {
                  return (
                    <ListItem button key={index} onClick={()=>{
                      setSearchText(prev=>prev=toolData.name)
                      handleClickAway()
                      }}>
                      <ListItemText primary={`${toolData.name} `} />
                    </ListItem>
                  );
                }
              )
            : process === "Category"
            ? proState.getAllToolsCategory?.category_list?.filter(val=>val.name.toLowerCase().includes(searchText.toLowerCase())).map(
                (toolData, index) => {
                  return (
                    <ListItem button key={index}  onClick={()=>{
                      setSearchText(prev=>prev=toolData.name)
                      setSearchCategoryId(toolData.pk)
                      handleClickAway()
                      }}>
                      <ListItemText primary={`${toolData.name} `} />
                    </ListItem>
                  );
                }
              )
            : process ==="SKU code" ?proState.getAllToolsCategory?.sku_codes?.filter(val=>val.includes(searchText)).map(
              (skuData, index) => {
                return (
                  <ListItem button key={index}  onClick={()=>{
                    setSearchText(prev=>prev=skuData)
                    handleClickAway()
                    }}>
                    <ListItemText primary={`${skuData} `} />
                  </ListItem>
                );
              }
            ) :   <Typography className={classes.noResultText}>
            No result found for {`"${searchText}"`}
          </Typography>}
        </List>
      ) : (
        <Typography className={classes.noResultText}>
          No result found for {`"${searchText}"`}
        </Typography>
      )}
    </Paper>
  );

  return (
    <LayoutContainer footer={false} style={{ paddingBottom: "100px" }}>
      <Typography variant="h6">
        <Box fontWeight="fontWeightBold" m={1}>
          ToolRoom
        </Box>
      </Typography>
      <Paper className={classes.paperContainer} elevation={0}>
        <Grid container spacing={2}>
          <Grid item sm={6}>
            <AutomationSearch
              searchText={searchText}
              handleSearchChange={handleSearchChange}
              handleSearchButton={handleSearchButton}
              handleCloseClick={handleCloseClick}
              handleSetProcess={handleSetProcess}
              procurement={true}
              process={process}
              handleClickAway={handleClickAway}
              showDropDown={showDropdown}
              procurementDropDown={procurementDropDown}
            />
          </Grid>
          <Grid item sm={6} alignContent="center">
            <IconButton
              variant="contained"
              color="primary"
              className={classes.advanceSearch}
              onClick={handleClickAdvance}
            >
              <TuneIcon style={{ fill: "white" }} />
            </IconButton>
            <Popover
              id={idAdvance}
              open={openAdvance}
              anchorEl={anchorElAdvance}
              onClose={handleCloseAdvance}
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "left",
              }}
              style={{
                marginTop: "-50px",
                marginLeft: "20px",
                borderRadius: "20px",
              }}
            >
              <Box className={classes.searchBox}>
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
                      onClick={handleAdvanceSearch}
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
                  Select Type
                </Typography>
                <Stack direction={"row"} alignItems={"center"}>
                  <Typography variant="caption">Requesition</Typography>
                  <Radio
                    checked={radioType === "Req"}
                    onClick={() => setRadioType("Req")}
                    style={{
                      color:
                        radioType === "Req"
                          ? "rgba(0,0,0,0.7)"
                          : "rgba(0,0,0,0.4)",
                    }}
                  />
                  <Typography variant="caption">Consumption</Typography>
                  <Radio
                    checked={radioType === "Con"}
                    onClick={() => setRadioType("Con")}
                    style={{
                      color:
                        radioType === "Con"
                          ? "rgba(0,0,0,0.7)"
                          : "rgba(0,0,0,0.4)",
                    }}
                  />
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
                  Date
                </Typography>

                <Stack direction={"row"} spacing={2}>
                  <Typography variant="caption">from </Typography>
                  <MuiPickersUtilsProvider
                    ref={fromDateRef}
                    utils={DateFnsUtils}
                  >
                    <KeyboardDatePicker
                      clearable
                      variant="inline"
                      onKeyDown={(e) => {
                        e.preventDefault();
                      }}
                      format="yyyy/MM/dd"
                      autoOk={true}
                      inputVariant="outlined"
                      id={`-date-picker-inline`}
                      value={fromDate ? fromDate : null}
                      error={false}
                      defaultValue={""}
                      emptyLabel=""
                      name="from_date"
                      helperText={``}
                      onChange={(date) => {
                        handleDateChange(date, setFromDate);
                      }}
                      KeyboardButtonProps={{
                        "aria-label": "change date",
                      }}
                      className={classes.textField}
                      inputProps={{ className: classes.input }}
                    />
                  </MuiPickersUtilsProvider>
                  <Typography variant="caption">to</Typography>
                  <MuiPickersUtilsProvider utils={DateFnsUtils}>
                    <KeyboardDatePicker
                      variant="inline"
                      onKeyDown={(e) => {
                        e.preventDefault();
                      }}
                      format="yyyy/MM/dd"
                      autoOk={true}
                      inputVariant="outlined"
                      id={`-date-picker-inline`}
                      value={toDate ? toDate : null}
                      error={false}
                      emptyLabel=""
                      name="from_date"
                      helperText={``}
                      onChange={(date) => {
                        handleDateChange(date, setToDate);
                      }}
                      KeyboardButtonProps={{
                        "aria-label": "change date",
                      }}
                      className={classes.textField}
                      inputProps={{ className: classes.input }}
                    />
                  </MuiPickersUtilsProvider>
                </Stack>
              </Box>
            </Popover>
          </Grid>
        </Grid>
      </Paper>
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
        <Stack direction={"row"} justifyContent={"flex-end"} spacing={2}>
          {selectedData.length !== 0 && (
            <Stack direction={"row"} justifyContent={"flex-end"} spacing={2}>
             {user.procurement_admin && <Link to="/procurement/addrequesition">
                <Button
                  onClick={handleAllRequest}
                  variant="outlined"
                  color="secondary"
                  aria-label="request"
                  className={classes.requestButton}
                >
                  Request
                </Button>
              </Link>}
              <Link to="/procurement/addconsumption">
                <Button
                  variant="outlined"
                  color="secondary"
                  aria-label="consume"
                  className={`${classes.requestButton} ${classes.consumeButton}`}
                  onClick={handleAllConsume}
                >
                  Consume
                </Button>
              </Link>
            </Stack>
          )}
          {selectedRadioType !== "" && (
            <Button
              variant="contained"
              color="primary"
              className={classes.downloadReport}
              onClick={handleDownloadReport}
              startIcon={<ImportExportIcon />}
            >
              Download
            </Button>
          )}
         { (user.procurement_admin ==="True" || user.procurement_admin === true) && <Button
            variant="contained"
            color="primary"
            className={classes.bulkUpload}
            onClick={addToolModelHandle}
            startIcon={<Add />}
          >
            Add Tool
          </Button>}
         {(user.procurement_admin ==="True" || user.procurement_admin === true) &&  <Button
            onClick={() => history.push("/procurement/upload")}
            variant="contained"
            color="primary"
            className={classes.bulkUpload}
            startIcon={<UploadIcon fontSize="small" />}
          >
            Bulk Upload
          </Button>}
          <Button
            variant="text"
            color="primary"
            className={classes.refreshIcon}
            onClick={handleRefreshAction}
          >
            <ReplayIcon color="#FDBD2Eed" />
          </Button>
        </Stack>
      </Stack>

      <Paper elevation={0}>
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
      </Paper>
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
    </LayoutContainer>
  );
};

export default ToolRoom;
