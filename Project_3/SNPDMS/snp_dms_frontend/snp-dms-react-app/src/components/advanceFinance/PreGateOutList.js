import {
  FormControl,
  Grid,
  InputLabel,
  makeStyles,
  Typography,
  Select,
  MenuItem,
  IconButton,
  Popover,
  Box,
  Divider,
  FormControlLabel,
  Switch,
  Button,
  Paper,
  TextField,
  Checkbox,
  Modal,
  Chip,
  useMediaQuery,
  Tooltip
} from "@material-ui/core";
import React, { useCallback, useEffect, useState } from "react";
import AutomationSearch from "../reusableComponents/AutomationSearch";
import { useSnackbar } from "notistack";
import { useDispatch, useSelector } from "react-redux";
import { ADVANCE_FINANCE_CONSTANT } from "../../reducers/AdvanceFinance/AdvanceFinanceReducer";
import PreviousIcon from "@material-ui/icons/ArrowBack";
import NextIcon from "@material-ui/icons/ArrowForward";
import ReactTable from "react-table-v6";
import "react-table-v6/react-table.css";
import TuneIcon from "@mui/icons-material/Tune";
import DateFnsUtils from "@date-io/date-fns";
import {
  KeyboardDatePicker,
  MuiPickersUtilsProvider,
} from "@material-ui/pickers";
import SearchIcon from "@mui/icons-material/Search";
import RefreshIcon from "@mui/icons-material/Refresh";
import { Stack } from "@mui/material";
import { handleDateChangeUTILSDispatch, handleDateChangeUTILSFlex } from "../../utils/WeekNumbre";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSort } from "@fortawesome/free-solid-svg-icons";
import { downloadPreGateOutFoemSixAction, getPreGateOutDataTableAction, getPreGateOutPkAction, getSingleAdvanceFinanceProcessAction, handlePreGateOutDeleteAction, handlePreGateOutValidityUpdateAction } from "../../actions/AdvanceFinance/AdvanceFinanceAction";
import DoneIcon from "@material-ui/icons/Done";
import CrossIcon from "@material-ui/icons/Cancel";
import DatePickerField from "../reusableComponents/DatePickerField";
import PictureAsPdfOutlinedIcon from "@mui/icons-material/PictureAsPdfOutlined";

const useStyles = makeStyles((theme) => ({
  button: {
    background: "rgba(42,192,143,0.7)",
    border: "1px solid rgb(42,192,143)",
    color: "white",
    height: "36px",
    fontSize: "0.7rem",
    fontWeight: "bold",
    "&:hover": {
      cursor: "pointer",
      background: "rgb(42,192,143)",
      border: "1px solid rgb(42,192,143)",
    },
  },
  deleteButton: {
    background: "rgba(243,37,37,0.7)",
    border: "1px solid rgb(243,37,37)",
    height: "36px",
    color: "white",
    fontSize: "0.7rem",
    fontWeight: "bold",
    "&:hover": {
      cursor: "pointer",
      background: "rgba(243,37,37,0.9)",
      color: "white",
    },
  },
  tableListing: {
    "& ::-webkit-scrollbar": {
      height: "5px",
    },
  },
  inputProcess: {
    marginLeft: theme.spacing(1),
    flex: 1,
    fontSize: "0.8rem",
    "&.MuiInput-underline:before": {
      borderBottom: "none",
    },
    "&.MuiInput-underline:after": {
      borderBottom: "none",
    },
    padding: "0 10px",
    [theme.breakpoints.down("xs")]: {
      padding: 1,
      fontSize: "0.8rem",
    },
  },
  advanceSearch: {
    backgroundColor: "#fdbd2e",
    borderRadius: "8px",
  },
  searchBox: {
    padding: "20px 20px 20px",
  },
  containerDetailsTable: {
    borderRadius: 4,
    backgroundColor: theme.palette.background.paper,
    margin: "auto",
    marginTop: "24px",
    padding: 20,
  },
  textField: {
    "& .MuiOutlinedInput-root": {
      "& fieldset": {
        borderColor: "#243545",
      },
    },
  },
  choiceSelectContainer: {
    border: "1px solid #243545",
    marginTop: "0rem",
    display: "flex",
    borderRadius: 6,
  },
  input: {
    padding: 7,
  },
  textField: {
    "& .MuiOutlinedInput-root": {
      "& fieldset": {
        borderColor: "#243545",
      },
    },
  },
  input: {
    padding: 7,
  },
  chipRoot: {
    display: "flex",
    justifyContent: "center",

    flexWrap: "wrap",
    paddingTop: 20,
  },
  modalPaper: {
    position: "absolute",
    width: "70%",
    backgroundColor: "white",
    boxShadow: 5,
    padding: 20,
    outline: "none",
    borderRadius: 10,
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
  switchables: {
    "--Switch-trackHeight": "1px",
  },
}));

const PreGateOutList = (props) => {
  const classes = useStyles();
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

  const  handleSelectedValidityUpdate =()=>{
    if(validity.validity ===""){
      notify("Please select a validity for selected containers", {variant:'error'});
      return;
    } 
    if (validity.time ===""){
      notify("Please select a time for selected containers",{variant:'error'});
      return;
    }
    let selectedValue = selectedRows.map((item) => {
      if (item.enabled) {
        return item.pk;
      } else {
        return null;
      }
    });
    let selected_containers = selectedValue.filter((item) => item !== null) 
    dispatch(handlePreGateOutValidityUpdateAction(selected_containers,validity.validity,validity.time,handleModalClose,notify))
  }

  const handleDeleteSelectedContainers = () => {
    let selectedValue = selectedRows.map((item) => {
      if (item.enabled) {
        return item.pk;
      } else {
        return null;
      }
    });
    let selected_containers_delete = selectedValue.filter((item) => item !== null) 
    dispatch(handlePreGateOutDeleteAction(props.bk_no,props.paymentID,selected_containers_delete,handleModalCloseDelete,props?.process,setSelectedRows,notify))
   
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
    [searchText]
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
    setSelectedRows([])
    if(props?.process){
      dispatch(getSingleAdvanceFinanceProcessAction(props?.paymentID, notify));
    }else {
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
      if(!props.process){
        let allData = preGateOutTable?.data?.map((val) => ({
          pk: val.pk,
          container_no: val.container_no,
          enabled: true,
        }));
        setSelectedRows(allData);
      }else {
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
    if(!props.process){

      dispatch(getPreGateOutDataTableAction(notify));
    }
  }, [
    preGateOutTable.on_hold,
    preGateOutTable.validity_expired,
    preGateOutTable.is_gateout_done,
  ]);



  const handlePreGateOutFormDownload =(preGateOut_pk)=>{
    dispatch(downloadPreGateOutFoemSixAction(preGateOut_pk,notify))
  }


  const Columns = [
    {
      Header: (
        <div>
          <Checkbox
            checked={selectedRows?.length === (!props.process ?preGateOutTable?.data?.length : advanceProcess?.pregate_out_list?.length)}
            onClick={(e) => {
              checkAllRows(!e.target.checked);
            }}
            style={{ color: "#243545" }}
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
          Created At <FontAwesomeIcon icon={faSort} />
        </b>
      ),
      accessor: "created_at",
      style: {
        textAlign: "center",
      },
      Cell: (row) => {
        return (
          <div>
            <span title={row.original.created_at}>
              {row.original.created_at}
            </span>
          </div>
        );
      },
    },
    {
      Header: (
        <b style={{ color: "#2A5FA5" }}>
          Client <FontAwesomeIcon icon={faSort} />
        </b>
      ),
      accessor: "client",
      style: {
        textAlign: "center",
      },
      Cell: (row) => {
        return (
          <div>
            <span style={{textAlign:"center"}} title={row.original.client}>{row.original.client}</span>
          </div>
        );
      },
    },
    {
      Header: (
        <b style={{ color: "#2A5FA5" }}>
          Container No
          <FontAwesomeIcon icon={faSort} />
        </b>
      ),
      width: 150,
      accessor: "container_no",
      style: {
        textAlign: "center",
      },
      Cell: (row) => {
        return (
          <div>
            <span style={{textAlign:"center",color:row.original?.validity_expired ?"rgb(255,44,77)":"rgb(89,95,102)"}} title={row.original.container_no}>
              {row.original.container_no}
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
            <span style={{textAlign:"center"}} title={row.original.size}>{row.original.size}</span>
          </div>
        );
      },
    },
    {
      Header: (
        <b style={{ color: "#2A5FA5" }}>
          Type <FontAwesomeIcon icon={faSort} />
        </b>
      ),
      accessor: "type",
      style: {
        textAlign: "center",
      },
      Cell: (row) => {
        return (
          <div>
            <span style={{textAlign:"center"}} title={row.original.type}>{row.original.type}</span>
          </div>
        );
      },
    },
   
    {
      Header: (
        <b style={{ color: "#2A5FA5" }}>
          Shipping Line <FontAwesomeIcon icon={faSort} />
        </b>
      ),
      accessor: "shipping_line",
      style: {
        textAlign: "center",
      },
      Cell: (row) => {
        return (
          <div>
            <span style={{textAlign:"center"}} title={row.original.shipping_line}>
              {row.original.shipping_line}
            </span>
          </div>
        );
      },
    },
    {
      Header: (
        <b style={{ color: "#2A5FA5" }}>
          Departed <FontAwesomeIcon icon={faSort} />
        </b>
      ),
      accessor: "departed",
      style: {
        textAlign: "center",
      },
      Cell: (row) => {
        return (
          <div>
            <span style={{textAlign:"center"}} title={row.original.departed}>
              {row.original.departed}
            </span>
          </div>
        );
      },
    },
    {
      Header: (
        <b style={{ color: "#2A5FA5" }}>
          Validity Out Date <FontAwesomeIcon icon={faSort} />
        </b>
      ),
      accessor: "do_validity_out_date",
      style: {
        textAlign: "center",
      },
      Cell: (row) => {
        return (
          <div>
            <span style={{color:row.original?.validity_expired ?"rgb(255,44,77)":"rgb(22,139,82)" ,textAlign:"center"}} title={row.original.do_validity_out_date}>
              {row.original.do_validity_out_date}
            </span>
          </div>
        );
      },
    },
    {
      Header: (
        <b style={{ color: "#2A5FA5" }}>
          Validity Out Time <FontAwesomeIcon icon={faSort} />
        </b>
      ),
      accessor: "do_validity_out_time",
      style: {
        textAlign: "center",
      },
      Cell: (row) => {
        return (
          <div>
            <span style={{color:row.original?.validity_expired ?"rgb(255,44,77)":"rgb(22,139,82)" ,textAlign:"center"}} title={row.original.do_validity_out_time}>
              {row.original.do_validity_out_time}
            </span>
          </div>
        );
      },
    },
  
   
    {
      Header: (
        <b style={{ color: "#2A5FA5" }}>
          Booking  no <FontAwesomeIcon icon={faSort} />
        </b>
      ),
      accessor: "bk_no",
      style: {
        textAlign: "center",
      },
      Cell: (row) => {
        return (
          <div>
            <span title={row.original.bk_no}>{row.original.bk_no}</span>
          </div>
        );
      },
    },
  
    {
      Header: <b style={{ color: "#2A5FA5" }}>Is Gate Out Done</b>,
      accessor: "is_gateout_done",
      style: {
        textAlign: "center",
      },
      Cell: (row) => {
        return (
          <div>
            <span title={row.original.is_gateout_done}>
              {row.original.is_gateout_done === true ? "Yes " : "No"}
            </span>
          </div>
        );
      },
    },
   
    {
      Header: <b style={{ color: "#2A5FA5" }}>Edit</b>,
      show:false,
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
      Header: <b style={{ color: "#2A5FA5" }}>Form Download</b>,
      style: {
        textAlign: "center",
      },
      Cell: ({ original }) => {
        return (
          <Tooltip title="Download Form 6">
          <IconButton onClick={()=>handlePreGateOutFormDownload(original.pk)}>
            <PictureAsPdfOutlinedIcon
              style={{ fill: "black" }}
            />
          </IconButton>
        </Tooltip>
        );
      },
    },
  ];

    

  return (
    <div>
     {!props.process && <Typography variant="subtitle2" style={{ marginTop: "24px"  ,marginLeft:matchesIphone?"12px":0}}>
        All Pre Gate Out{" "}
      </Typography>}
     { !props.process &&<Grid container spacing={2} style={{ marginTop: "32px" }}>
        <Grid xs={10} sm={8} item md={6}>
          <AutomationSearch
            searchText={searchText}
            handleSetProcess={handleSetProcess}
            handleCloseClick={handleCloseClick}
            handleSearchChange={handleSearchChange}
            procurement
            handleSearchButton={handleSearchButton}
            process={process}
          >
            <FormControl
              variant="standard"
              style={{ marginTop: "-15px", marginLeft: "10px" }}
            >
              <InputLabel
                id="container_list_select_label"
                style={{
                  color: "grey",
                  zIndex: 10,
                  fontSize: "15px",
                  textAlign: "center",
                  padding: "0 10px",
                  marginTop: "-10px",
                  display: "none",
                }}
              >
                Process
              </InputLabel>
              <Select
                id="=container_list_select"
                value={process}
                labelId="container_list_select_label"
                name="client"
                defaultValue={process}
                label="Process"
                variant="standard"
                onChange={handleSetProcess}
                className={classes.inputProcess}
                inputProps={{
                  style: {
                    padding: "0px 10px",
                    marginTop: "-10px",
                    outline: "none",
                    fontSize: "12px",
                  },
                }}
                style={{
                  width: "100px",
                  backgroundColor: "transparent",
                  border: "0.5px solid rgba(0,0,0,0.2)",
                  borderRadius: "32px",
                  outline: "none",
                }}
              >
                <MenuItem key={"client"} value="client">
                  Client
                </MenuItem>
                <MenuItem key={"shipping_line"} value="shipping_line">
                  Shipping Line
                </MenuItem>
                <MenuItem key={"container_no"} value="container_no">
                  Container No
                </MenuItem>
              </Select>
            </FormControl>
          </AutomationSearch>
        </Grid>
        <Grid item xs={2} sm={4} md={1} alignContent="center">
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
                Date
              </Typography>

              <Stack direction={"row"} spacing={matchesIphone?0: 2} flexDirection={matchesIphone?"column":"row"}>
                <Typography variant="caption">from </Typography>
                <MuiPickersUtilsProvider utils={DateFnsUtils}>
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
                    value={
                      preGateOutTable.do_validity_date.from_date
                        ? preGateOutTable.do_validity_date.from_date
                        : null
                    }
                    error={false}
                    defaultValue={""}
                    emptyLabel=""
                    name="from_date"
                    helperText={``}
                    onChange={(date) => {
                      handleDateChangeUTILSDispatch(
                        date,
                        dispatch,
                        ADVANCE_FINANCE_CONSTANT.PRE_GATE_OUT_TABLE,
                        "from_date"
                      );
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
                    value={
                      preGateOutTable.do_validity_date.to_date
                        ? preGateOutTable.do_validity_date.to_date
                        : null
                    }
                    error={false}
                    emptyLabel=""
                    name="to_date"
                    helperText={``}
                    onChange={(date) => {
                      handleDateChangeUTILSDispatch(
                        date,
                        dispatch,
                        ADVANCE_FINANCE_CONSTANT.PRE_GATE_OUT_TABLE,
                        "to_date"
                      );
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
      </Grid>}

      <Grid container spacing={2} style={{ marginTop: "16px" ,marginLeft:matchesIphone?"12px":0}}>
        {!props.process ? <Grid
          item
      
          sm={2}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Typography variant="caption" style={{ fontWeight: "500" }}>
            Validity Expired
          </Typography>
          <FormControlLabel 
            style={{marginRight:"-4px"}}
            control={
              <Switch
                size="small"
                checked={preGateOutTable.validity_expired === true}
                onChange={() => {
                  const newValue =
                  preGateOutTable.validity_expired === true ? false : true;
                  dispatch({
                    type: ADVANCE_FINANCE_CONSTANT.PRE_GATE_OUT_TABLE,
                    payload: {
                      validity_expired: newValue,
                    },
                  });
                 
                }}
                color="primary"
              />
            }
            label={preGateOutTable.validity_expired === true ? "Yes" : "No"}
          />
        </Grid>:<Grid item sm={2}></Grid>}

       { !props.process ?<Grid
          item
          sm={2}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Typography variant="caption" style={{ fontWeight: "500" }}>
            Gate Out Done{" "}
          </Typography>
          <FormControlLabel
            control={
              <Switch
                size="small"
                checked={preGateOutTable.is_gateout_done === true}
                onChange={() => {
                  const newValue =
                  preGateOutTable.is_gateout_done === true ? false : true;
                  dispatch({
                    type: ADVANCE_FINANCE_CONSTANT.PRE_GATE_OUT_TABLE,
                    payload: {
                        is_gateout_done: newValue,
                    },
                  });
                }}
                color="primary"
              />
            }
            label={preGateOutTable.is_gateout_done === true ? "Yes" : "No"}
          />
        </Grid>:<Grid item sm={2}></Grid>}

       
        <Grid
          item
          sm={4}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-start",
          }}
        >
        </Grid>
        {(selectedRows.length !== 0 ) ? (
          <Grid item sm={2}>
            <Button
              style={{
                margin: "auto",
                display: "flex",
                alignItems: "center",
              }}
              fullWidth
              className={classes.button}
              onClick={() => {
                setOpenModal(true);
              }}
            >
              Update Validity
            </Button>
          </Grid>
        ) : (
          <Grid item sm={2}></Grid>
        )}
        {(selectedRows.length !== 0  ) ? (
          <Grid item sm={1}>
            <Button
              style={{
                margin: "auto",
                display: "flex",
                alignItems: "center",
              }}
              fullWidth
              className={classes.deleteButton}
              onClick={() => {
                setOpenDeleteModal(true);
              }}
            >
              Delete
            </Button>
          </Grid>
        ) : (
          <Grid item sm={1}></Grid>
        )}
        <Grid item sm={1}>
          <Button
            variant="contained"
            color="primary"
            fullWidth
            onClick={handleClickRefreshTable}
          >
            Refresh
          </Button>
        </Grid>
      </Grid>
      <Paper className={classes.containerDetailsTable} elevation={0}>
        <ReactTable
          data={!props.process ?(preGateOutTable.data && preGateOutTable.data) || []:advanceProcess?.pregate_out_list}
          columns={[...Columns]}
          minRows={5}
          collapseOnDataChange={false}
          className={classes.tableListing}
          style={{
            alignItems: "center",
            textAlign: "center",
            display: "flex",
            justifyContent: "center",
            width: "100%", 
          }}
          showPagination={false}
          defaultPageSize={!props.process ? Number(preGateOutTable.on_page_data_client): advanceProcess?.pregate_out_list?.length}
          pageSize={!props.process ?Number(preGateOutTable.on_page_data_client):advanceProcess?.pregate_out_list?.length}
        />
      { !props.process && <Grid
          item
          sm={12}
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "8px 16px",
            margin: "0px 24px",
            backgroundColor: "#fafafa",
          }}
        >
          <Button
            variant="contained"
            startIcon={<PreviousIcon />}
            color="secondary"
            onClick={prevStockPage}
            disabled={
                preGateOutTable.pg_no === 1 || preGateOutTable.pg_no === "1"
                ? true
                : false
            }
          >
            {!matchesIphone && "Previous"}
          </Button>

          <Grid style={{ display: "flex", alignItems: "flex-end" }}>
            <Typography variant="subtitle2" style={{ padding: "3px" }}>
              Page
            </Typography>

            <TextField
              id="basic"
              variant="outlined"
              size="small"
              inputProps={{
                className: classes.input,
                style: { width: "32px" },
              }}
              value={preGateOutTable.pg_no}
              onChange={(e) => {
                if (e.target.value > preGateOutTable.total_pages) {
                  notify("Invalid value entered", {
                    variant: "warning",
                  });
                } else {
                  dispatch({
                    type: ADVANCE_FINANCE_CONSTANT.PRE_GATE_OUT_TABLE,
                    payload: {
                      pg_no: e.target.value,
                    },
                  });
                }
              }}
              onBlur={(e) => {
                if (
                  e.target.value === "" ||
                  e.target.value === "0" ||
                  e.target.value > preGateOutTable.total_pages
                ) {
                  notify("Invalid value entered", {
                    variant: "warning",
                  });

                  dispatch({
                    type: ADVANCE_FINANCE_CONSTANT.PRE_GATE_OUT_TABLE,
                    payload: {
                      pg_no: 1,
                    },
                  });
                  dispatch(getPreGateOutDataTableAction(notify))
                } else {
                  setCurrentPage(e.target.value);
                  dispatch({
                    type: ADVANCE_FINANCE_CONSTANT.PRE_GATE_OUT_TABLE,
                    payload: {
                      pg_no: e.target.value,
                    },
                  });
                  dispatch(getPreGateOutDataTableAction(notify))
                }
              }}
            />

            <Typography variant="subtitle2" style={{ padding: "3px" }}>
              of
            </Typography>

            <Typography
              variant="subtitle2"
              style={{
                padding: "3px",
                fontSize: "14px",
              }}
            >
              {preGateOutTable.total_pages}
            </Typography>
          </Grid>
         {!matchesIphone && <TextField
            id="client-master-code"
            select
            value={preGateOutTable.on_page_data_client}
            variant="outlined"
            inputProps={{ className: classes.input }}
            onChange={(e) => {
              setCurrentPage(1);
              dispatch({
                type: ADVANCE_FINANCE_CONSTANT.PRE_GATE_OUT_TABLE,
                payload: {
                  pg_no: 1,
                  on_page_data_client: e.target.value,
                },
              });
              dispatch(getPreGateOutDataTableAction(notify))
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
          <Button
            variant="contained"
            endIcon={<NextIcon />}
            color="secondary"
            onClick={nextStockPage}
            disabled={preGateOutTable.next_page === "" ? true : false}
          >
            {!matchesIphone && "Next"}
          </Button>
        </Grid>}
      </Paper>
      <Modal open={openModal} onClose={handleModalClose}>
        <div style={getModalStyle()} className={classes.modalPaper}>
          <Typography className={classes.chipRoot}>
            Total Containers Selected: {totalSelectedContainers()}
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
            />
            <Typography>Time</Typography>
            <TextField
              id="validity-time"
              type="time"
              name="do_validity_in_time"
              value={validity.time}
              variant="outlined"
              defaultValue={"23:59"}
              className={classes.textField}
              inputProps={{
                className: classes.input,
                style: { width: "200px" },
              }}
              autoComplete="off"
            />
            <Button
              onClick={handleSelectedValidityUpdate}
              style={{
                width: "160px",
                backgroundColor: "#2A5FA5",
                color: "white",
                borderRadius: 7,
              }}
            >
              Update Validity
            </Button>
          </Stack>
        </div>
      </Modal>
      <Modal open={openDeleteModal} onClose={handleModalCloseDelete}>
        <div style={getModalStyle()} className={classes.modalPaper}>
          <Typography className={classes.chipRoot}>
            Total Containers Selected: {totalSelectedContainers()}
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
              style={{
                width: "160px",
                backgroundColor: "rgb(243,37,37)",
                color: "white",
                borderRadius: 7,
              }}
            >
              Delete Selected
            </Button>
          </Stack>
        </div>
      </Modal>
    </div>
  );
};

export default PreGateOutList;
