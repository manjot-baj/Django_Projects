import React from 'react'
import LayoutContainer from '../../components/reusableComponents/LayoutContainer'
import { useState, useEffect } from "react";
import {
  makeStyles,
  Typography,
  Grid,
  Button,
  TextField,
  Paper,
  MenuItem,
  InputBase,
  Select,
  Box,
  Modal,
  Backdrop,
  CircularProgress,
  useMediaQuery
} from "@material-ui/core";
import ReactTable from "react-table-v6";
import "react-table-v6/react-table.css";
import jwt_decode from "jwt-decode";
import { useDispatch, useSelector } from "react-redux";
import SearchIcon from "@material-ui/icons/Search";
import IconButton from "@material-ui/core/IconButton";
import { useSnackbar } from "notistack";
import { getAllMNRHistoryAction } from "../../actions/NewBillingActions";
import { useHistory } from "react-router-dom";
import PreviousIcon from "@material-ui/icons/ArrowBack";
import NextIcon from "@material-ui/icons/ArrowForward";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSort } from "@fortawesome/free-solid-svg-icons";
import ClearIcon from "@material-ui/icons/Clear";
import RefreshIcon from "@material-ui/icons/Refresh";
import { NEWBILLING_REDUCER } from '../../reducers/NewBillingReducer';
import MNRInvoiceSearch from './MNRInvoiceSearch';
import {Link} from 'react-router-dom'


const NewMnrHistory = () => {
    const store = useSelector((state) => state);
    const { ui, newBilling } = store;
    console.log(newBilling.mnr_history, "NewBilling")
    const matchesIphone = useMediaQuery("(max-width:500px)");
    const matchesIpad = useMediaQuery("(max-width:1024px)");
  
    const useStyles = makeStyles((theme) => ({
      creditNoteLink: {
        backgroundColor: "rgb(42,95,165)",
        color: "white",
        padding: "8px 12px",
        borderRadius: "8px",
        textDecoration: "none",
        marginTop: "12px",
      },
      button: {
        marginLeft: 10,
        "&:hover": {
          cursor: "pointer",
        },
      },
      input: {
        padding: 7,
        borderColor: "black",
        "& .MuiInputBase-input": {
          width: "400px",
        },
        [theme.breakpoints.down("xs")]: {
          "& .MuiInputBase-input": {
            width: "200px",
            fontSize: "0.8rem",
            padding: 1,
          },
        },
      },
      backdrop: {
        zIndex: theme.zIndex.drawer + 1,
        color: "#fff",
      },
      paperContainer: {
        padding: theme.spacing(2, 3),
      },
      fab: {
        marginRight: theme.spacing(1),
  
        color: "#fff",
        cursor: "pointer",
        backgroundColor: "#2A5FA5",
        margin: 10,
      },
      bottom: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      },
      iconButton: {
        marginLeft:"-35%",
        [theme.breakpoints.down("md")]: {
          marginLeft:"-35%"
        },
        [theme.breakpoints.down("xs")]: {
          marginLeft:"-5%"
        },
      },
      searchPaperMenu: {
        padding: "1px 4px",
        margin: 5,
        display: "flex",
        alignItems: "center",
        height: 45,
        borderRadius: "40px",
        width: "400px",
        "& .MuiPaper-root.MuiMenu-paper.MuiPopover-paper.MuiPaper-elevation8.MuiPaper-rounded":
          {
            marginTop: "123px !important",
          },
        [theme.breakpoints.down("xs")]: {
          height: 35,
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
        padding: "15px 25px",
        pointerEvents: "painted",
      },
      clearIcon: {
        float: "right",
        cursor: "pointer",
      },
      searchPaper: {
        padding: "1px 4px",
        margin: 5,
        display: "flex",
        alignItems: "center",
        height: 45,
        borderRadius: "40px",
        width: "42%",
        "& .MuiPaper-root.MuiMenu-paper.MuiPopover-paper.MuiPaper-elevation8.MuiPaper-rounded":
          {
            marginTop: "123px !important",
          },
        [theme.breakpoints.down("xs")]: {
          height: 35,
        },
      },
      searchButton: {
        backgroundColor: "#FDBD2E",
        color: "#fff",
        borderRadius: "0.5rem",
        padding: "1px 4px",
        height: 40,
        fontSize: 16,
        marginLeft: "auto",
        marginRight: "auto",
        width: "350px",
        marginTop: "8px",
        boxShadow: "0px 3px 6px #9199A14D",
        "&:hover": {
          backgroundColor: "#FDBD2E",
          color: "#fff",
        },
      },
    }));
  
    const history = useHistory();
    const dispatch = useDispatch();
    const classes = useStyles();
    const [currentPage, setCurrentPage] = useState(1);
    const [disable, setDisable] = useState(1);
    const notify = useSnackbar().enqueueSnackbar;
    const [name, setName] = useState("Client");
    const [filterType, setFilterType] = useState("");
    const [open, setOpen] = React.useState(false);

    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(!open);
    // const [stocksAvailableList, setStocksAvailableList] = useState([]);


    useEffect(()=>{
     dispatch(getAllMNRHistoryAction("",notify))
    },[])
  

    const nextStockPage = () => {
      setCurrentPage(Number(currentPage) + 1);
      setDisable(disable + 1);
      dispatch({
        type: NEWBILLING_REDUCER.GET_ALL_MNR_HISTORY,
        payload:{pg_no: Number(store.newBilling.mnr_history.pg_no) + 1},
      });
      dispatch(getAllMNRHistoryAction("",notify))
    };
  
    const prevStockPage = () => {
      setCurrentPage(Number(currentPage) - 1);
      setDisable(disable - 1);
      dispatch({
        type: NEWBILLING_REDUCER.GET_ALL_MNR_HISTORY,
        payload:{pg_no: Number(store.newBilling.mnr_history.pg_no) - 1},
      });
      dispatch(getAllMNRHistoryAction("",notify))
    };

    const handleRefresh=()=>{
      dispatch({
        type: NEWBILLING_REDUCER.GET_ALL_MNR_HISTORY,
        payload:{
          pg_no: 1,
          on_page_data_edit:5,
          no_of_data: 0,
          total_pages: 1,
          prev_page: "",
          next_page: "",
          client: "",
          container_no: "",
          invoice_date: {
              from: "",
              to: ""
          },
          invoice_no: "",
        }
      });
      dispatch(getAllMNRHistoryAction("",notify))
    }
  
    const Columns = [
      {
        Header: (
          <b style={{ color: "#2A5FA5" }}>
            Container Number
            <FontAwesomeIcon icon={faSort} />
          </b>
        ),
        accessor: "container_no",
        style: {
          textAlign: "center",
          cursor: "pointer",
        },
        Cell: (row) => {
          return (
            <div
              onClick={() =>
                history.push({
                  pathname: "/collect-invoice-new",
                  state: { pk: row.original.pk, allDetails:{pk: row.original.pk},mnr:true },
                })
              }
            >
              <span title={row.original}>{row.original.container_no}</span>
            </div>
          );
        },
      },
      {
        Header: (
          <b style={{ color: "#2A5FA5" }}>
            Invoice Number
            <FontAwesomeIcon icon={faSort} />
          </b>
        ),
        accessor: "invoice_no",
        style: {
          textAlign: "center",
          cursor: "pointer",
        },
        Cell: (row) => {
          return (
            <div
              onClick={() =>
                history.push({
                  pathname: "/collect-invoice-new",
                  state: { pk: row.original.pk, allDetails: row.original,mnr:true },
                })
              }
            >
              <span title={row.original}>{row.original.invoice_no}</span>
            </div>
          );
        },
      },
      {
        Header: (
          <b style={{ color: "#2A5FA5" }}>
            Invoice Date <FontAwesomeIcon icon={faSort} />
          </b>
        ),
        accessor: "invoice_date",
        style: {
          textAlign: "center",
          cursor: "pointer",
        },
        Cell: (row) => {
          return (
            <div
              onClick={() =>
                history.push({
                  pathname: "/collect-invoice-new",
                  state: { pk: row.original.pk, allDetails: row.original,mnr:true },
                })
              }
            >
              <span title={row.original.remarks}>
                {row.original.invoice_date}
              </span>
            </div>
          );
        },
      },
      {
        Header: (
          <b style={{ color: "#2A5FA5" }}>
            Bill Type <FontAwesomeIcon icon={faSort} />
          </b>
        ),
        accessor: "bill_type",
        style: {
          textAlign: "center",
          cursor: "pointer",
        },
        Cell: (row) => {
          return (
            <div
              onClick={() =>
                history.push({
                  pathname: "/collect-invoice-new",
                  state: { pk: row.original.pk, allDetails: row.original,mnr:true },
                })
              }
            >
              <span title={row.original.remarks}>{row.original.bill_type}</span>
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
          cursor: "pointer",
        },
        Cell: (row) => {
          return (
            <div
              onClick={() =>
                history.push({
                  pathname: "/collect-invoice-new",
                  state: { pk: row.original.pk, allDetails: row.original,mnr:true },
                })
              }
            >
              <span title={row.original.remarks}>{row.original.client}</span>
            </div>
          );
        },
      },
      {
        Header: (
          <b style={{ color: "#2A5FA5" }}>
            Total Amount <FontAwesomeIcon icon={faSort} />
          </b>
        ),
        accessor: "total_amount",
        style: {
          textAlign: "center",
          cursor: "pointer",
        },
        Cell: (row) => {
          return (
            <div
              onClick={() =>
                history.push({
                  pathname: "/collect-invoice-new",
                  state: { pk: row.original.pk, allDetails: row.original,mnr:true },
                })
              }
            >
              <span title={row.original.remarks}>
                {row.original.total_amount}
              </span>
            </div>
          );
        },
      },
      {
        Header: (
          <b style={{ color: "#2A5FA5" }}>
            Credit Note <FontAwesomeIcon icon={faSort} />
          </b>
        ),
        style: {
          textAlign: "center",
          cursor: "pointer",
        },
        Cell: (row) => {
          return (
            <div style={{ paddingTop: "8px" }}>
              {" "}
           {  row.original?.credit_note ===false && <Link
                to={{
                  pathname:"/billing/credit-notes",
                  state :{
                    invoice_no :row.original.invoice_no,
                    bill_type:"Repair/Washing"
                  }
                }}
             
                onClick={(e) => e.stopPropagation()}
                className={classes.creditNoteLink}
              >
                Credit Note
              </Link>}
            </div>
          );
        },
      }
    ];
  
    // Check if the token is expired if yes then push to login
    useEffect(() => {
      var token = localStorage.getItem("accessToken");
      if (token) {
        var decode = jwt_decode(token);
  
        if (decode.exp < new Date().getTime() / 1000) {
          history.push("/login");
        }
      } else {
        history.push("/login");
      }
    }, []);
  
    const updateName = (event) => {
      setFilterType("");
      dispatch({ type:NEWBILLING_REDUCER.GET_ALL_MNR_HISTORY, payload: {
        client: "",
        container_no: "",
        invoice_no: "",
      } });
      setName(event.target.value);
    };
  
    const getData = () => {
      dispatch({ type:NEWBILLING_REDUCER.GET_ALL_MNR_HISTORY, payload: {
       pg_no:1
      } });
      setCurrentPage(1)
      dispatch(getAllMNRHistoryAction("",notify));
    };
  
    const setDispatchType = (e) => {
      setFilterType(e.target.value);
      if (name === "Container Number") {
        dispatch({ type:NEWBILLING_REDUCER.GET_ALL_MNR_HISTORY, payload: {
          client: "",
          container_no: e.target.value,
          invoice_no: "",
        } });
      } else if (name === "Client") {
        dispatch({ type:NEWBILLING_REDUCER.GET_ALL_MNR_HISTORY, payload: {
          client: e.target.value,
          container_no:"",
          invoice_no: "",
        } });
      
      } else {
        dispatch({ type:NEWBILLING_REDUCER.GET_ALL_MNR_HISTORY, payload: {
          client: "",
          container_no:"",
          invoice_no:  e.target.value,
        } });
      
      }
    };
  
  return (
    <LayoutContainer footer={false}>
          <div>
        <Grid container>
          <Grid item xs={12}>
            <Grid
              style={{
                display: matchesIphone ? "block" : "flex",
                width:matchesIpad?"100%": "80%",
                justifyContent: "space-between",
                marginTop:"60px"
              }}
            >
              <Grid className={classes.searchPaperWrapper}>
                <Paper
                  component="form"
                  className={classes.searchPaperMenu}
                  elevation={0}
                  style={{width: matchesIphone ? "340px" :"400px"}}
                >
                  <Select
                    id="name"
                    value={name}
                    fullWidth
                    className={classes.searchMenuItemPaper}
                    onChange={updateName}
                  >
                    <MenuItem value={"Client"}>
                      &nbsp; &nbsp;&nbsp;Client
                    </MenuItem>
                    <MenuItem value={"Invoice Number"}>
                      &nbsp; &nbsp;&nbsp;Invoice Number
                    </MenuItem>
                    <MenuItem value={"Container Number"}>
                      &nbsp; &nbsp;&nbsp;Container Number
                    </MenuItem>
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
              <Grid>
                <Button className={classes.searchButton} onClick={handleOpen}>
                  <SearchIcon />
                  &nbsp; &nbsp; Advanced Search
                </Button>
              </Grid>
              <Grid>
                <Button style={{marginTop:"10px"}} onClick={handleRefresh}>
                  <RefreshIcon />
                
                </Button>
              </Grid>
            </Grid>
            <Modal open={open} onClose={handleClose}>
              <Box className={classes.modalPopUp}>
                <Grid className={classes.clearIcon}>
                  {" "}
                  <ClearIcon onClick={handleClose} />
                </Grid>
                <MNRInvoiceSearch handleClose={handleClose} setCurrentPage={setCurrentPage} />
              </Box>
            </Modal>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                paddingTop: 20,
              }}
            >
              <Grid
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: 10,
                  width: "100%",
                }}
              >
                <Typography>MNR Invoice</Typography>
              </Grid>
            </div>
            <Paper className={classes.paperContainer} elevation={0}>
              <ReactTable
                data={newBilling.mnr_history.data && newBilling.mnr_history.data}
                columns={[...Columns]}
                minRows={newBilling.mnr_history.on_page_data}
                collapseOnDataChange={false}
                style={{
                  height: "300px", // This will force the table body to overflow and scroll, since there is not enough room
                }}
                showPagination={false}
                defaultPageSize={100}
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
                    store.newBilling.pg_no === 1 ||
                    store.newBilling.pg_no === "1"
                      ? true
                      : false
                  }
                >
                  <PreviousIcon
                    style={{
                      fill:
                        store.newBilling.pg_no === 1 ||
                        store.newBilling.pg_no === "1"
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
                  store.newBilling.mnr_history.pg_no === 1 ||
                  store.newBilling.mnr_history.pg_no === "1"
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
                    style={{ width: "50px", padding: "3px" }}
                    value={currentPage}
                    onChange={(e) => {
                      if (e.target.value > newBilling.mnr_history.total_pages) {
                        notify("Invalid value entered", {
                          variant: "warning",
                        });
                      } else {
                        setCurrentPage(e.target.value);
                      }
                    }}
                    onBlur={(e) => {
                      if (
                        e.target.value === "" ||
                        e.target.value === "0" ||
                        e.target.value > newBilling.mnr_history.total_pages
                      ) {
                        notify("Invalid value entered", {
                          variant: "warning",
                        });
                        setCurrentPage(1);
                        dispatch({
                          type:NEWBILLING_REDUCER.GET_ALL_MNR_HISTORY,
                          payload:{
                            pg_no:1,
                          }
                        })
                        dispatch(getAllMNRHistoryAction("",notify))
                      
                      } else {
                        setCurrentPage(e.target.value);
                        dispatch({
                          type:NEWBILLING_REDUCER.GET_ALL_MNR_HISTORY,
                          payload:{
                            pg_no:e.target.value,
                          }
                        })
                        dispatch(getAllMNRHistoryAction("",notify))
                     
                      }
                    }}
                  />
                   {!matchesIphone && (
                  <Typography variant="subtitle2" style={{ padding: "3px" }}>
                    of
                  </Typography>
                )}
                  <Typography variant="subtitle2"   style={{
                    padding: matchesIphone ? "10px 0 10px 0" : "3px",
                    fontSize: matchesIphone ? "12px" : "14px",
                  }}>
                    {newBilling.mnr_history.total_pages}
                  </Typography>
                </Grid>
                <TextField
                  id="client-master-code"
                  select
                  value={store.newBilling.mnr_history.on_page_data_edit}
                  variant="outlined"
                  inputProps={{ className: classes.input }}
                  onChange={(e) => {
                    setCurrentPage(1);
                    dispatch({
                      type:NEWBILLING_REDUCER.GET_ALL_MNR_HISTORY,
                      payload:{
                        pg_no:1,
                        on_page_data_edit:e.target.value
                      }
                    })
                    dispatch(getAllMNRHistoryAction("",notify))
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
                </TextField>
                {matchesIphone ? (
                <IconButton
                  onClick={nextStockPage}
                  disabled={newBilling.next_page === "" ? true : false}
                >
                  <NextIcon
                    style={{
                      fill: newBilling.nextPage === "" ? "gray" : "#243545",
                    }}
                  />
                </IconButton>
              ) : (
                <Button
                variant="contained"
                endIcon={<NextIcon />}
                color="secondary"
                onClick={nextStockPage}
                disabled={newBilling.mnr_history.next_page === "" ? true : false}
              >
                Next
              </Button>
              )}
              </Grid>
            </Paper>
          </Grid>
        </Grid>
      </div>
      <Backdrop className={classes.backdrop} open={ui.isloading}>
        <CircularProgress color="inherit" />
      </Backdrop>
    </LayoutContainer>
  )
}

export default NewMnrHistory