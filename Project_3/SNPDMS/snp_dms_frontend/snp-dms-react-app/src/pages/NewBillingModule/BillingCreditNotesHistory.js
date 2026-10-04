import React, { useEffect, useState } from "react";
import LayoutContainer from "../../components/reusableComponents/LayoutContainer";
import {
  Backdrop,
  Box,
  Button,
  CircularProgress,
  FormControlLabel,
  Grid,
  IconButton,
  InputBase,
  makeStyles,
  Modal,
  Paper,
  Radio,
  Select,
  MenuItem
} from "@material-ui/core";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import { useSnackbar } from "notistack";
import { getInvoiceNewBilling } from "../../actions/NewBillingActions";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSort } from "@fortawesome/free-solid-svg-icons";
import jwt_decode from "jwt-decode";
import SearchIcon from "@material-ui/icons/Search";
import ClearIcon from "@material-ui/icons/Clear";
import RefreshIcon from "@material-ui/icons/Refresh";
import BillingInvoiceSearch from "./BillingInvoiceSearch";
import { fetchCreditNotesHistoryAction } from "../../actions/BillingCreditNoteAction";
import { BILLING_CREDIT_NOTE_REDUCER } from "../../reducers/BillingCreditNoteReducer";
import CloseIcon from "@mui/icons-material/Close";
import CustomHeading from "../../components/CustomHeading";
import CustomReactTable from "../../components/CustomReactTable";

const BillingCreditNotesHistory = () => {
  const store = useSelector((state) => state);
  const { ui, newBilling } = store;
  const useStyles = makeStyles((theme) => ({
    button: {
      marginLeft: 10,
      "&:hover": {
        cursor: "pointer",
      },
    },
    pageTitle: {
      [theme.breakpoints.down("md")]: {
        marginTop: "24px",
        marginLeft: "12px",
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
      marginLeft: "-35%",
      [theme.breakpoints.down("md")]: {
        marginLeft: "-35%",
      },
      [theme.breakpoints.down("xs")]: {
        marginLeft: "-5%",
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
      [theme.breakpoints.down("sm")]: {
        width: "380px",

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
    refreshButton:{
     [theme.breakpoints.down('md')]:{
      display:"none"
     }
    },
    refreshButtonMobile:{
      display:"flex",
      margin:"auto",
      marginRight:"12px",
      marginBottom:"12px",
      [theme.breakpoints.up('md')]:{
       display:"none"
      }
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
  const [open, setOpen] = React.useState(false);
  const [name, setName] = useState("credit_note_no");
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(!open);
  const { BillingCreditNoteReducer } = useSelector((state) => state);
  const { creditNoteHistoryList } = BillingCreditNoteReducer;

  useEffect(() => {
    dispatch(fetchCreditNotesHistoryAction(notify));
  }, []);

  const nextStockPage = () => {
    setCurrentPage(Number(currentPage) + 1);
    setDisable(disable + 1);
    dispatch({
      type: BILLING_CREDIT_NOTE_REDUCER.CREDIT_NOTE_HISTORY,
      payload: { pg_no: Number(creditNoteHistoryList.pg_no) + 1 },
    });
    dispatch(fetchCreditNotesHistoryAction(notify));
  };

  const prevStockPage = () => {
    setCurrentPage(Number(currentPage) - 1);
    setDisable(disable - 1);
    dispatch({
      type: BILLING_CREDIT_NOTE_REDUCER.CREDIT_NOTE_HISTORY,
      payload: { pg_no: Number(creditNoteHistoryList.pg_no) - 1 },
    });
    dispatch(fetchCreditNotesHistoryAction(notify));
  };

  const handleInitialPage = () => {
    dispatch({
      type: BILLING_CREDIT_NOTE_REDUCER.CREDIT_NOTE_HISTORY,
      payload: { pg_no: 1 },
    });
  };

  const handleFetchCreditNote = () => {
    dispatch(fetchCreditNotesHistoryAction(notify));
  };

  const handleCreditNoteChangeRows = (value) => {
    dispatch({
      type: BILLING_CREDIT_NOTE_REDUCER.CREDIT_NOTE_HISTORY,
      payload: { pg_no: 1, on_page_data_client: value },
    });
  };

  const handleCreditNotePageChange = (value) => {
    dispatch({
      type: BILLING_CREDIT_NOTE_REDUCER.CREDIT_NOTE_HISTORY,
      payload: { pg_no: value },
    });
  };

  const Columns = [
    {
      Header: (
        <b style={{ color: "#2A5FA5" }}>
          Credit Note Date
          <FontAwesomeIcon icon={faSort} />
        </b>
      ),
      accessor: "credit_note_date",
      style: {
        textAlign: "center",
        cursor: "pointer",
      },
      Cell: (row) => {
        return (
          <div
            onClick={() =>
              history.push(`/billing/credit-notes/${row.original.pk}`)
            }
          >
            <span title={row.original}>{row.original.credit_note_date}</span>
          </div>
        );
      },
    },
    {
      Header: (
        <b style={{ color: "#2A5FA5" }}>
          Credit Note No
          <FontAwesomeIcon icon={faSort} />
        </b>
      ),
      accessor: "credit_note_no",
      style: {
        textAlign: "center",
        cursor: "pointer",
      },
      Cell: (row) => {
        return (
          <div
            onClick={() =>
              history.push(`/billing/credit-notes/${row.original.pk}`)
            }
          >
            <span title={row.original}>{row.original.credit_note_no}</span>
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
              history.push(`/billing/credit-notes/${row.original.pk}`)
            }
          >
            <span title={row.original.bill_type}>{row.original.bill_type}</span>
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
              history.push(`/billing/credit-notes/${row.original.pk}`)
            }
          >
            <span title={row.original.total_amount}>
              {row.original.total_amount}
            </span>
          </div>
        );
      },
    },
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
    setName(event.target.value);
    dispatch({
      type: BILLING_CREDIT_NOTE_REDUCER.CREDIT_NOTE_HISTORY,
      payload: {
        credit_note_no: "",
        invoice_no: "",
      },
    });
  };

  return (
    <LayoutContainer>
      <CustomHeading variant="body1" customClass="pageTitle">
        Credit Note History
      </CustomHeading>
      <div>
        <Grid container>
          <Grid item xs={12}>
            <Grid
              style={{
                display: "flex",
                width: "80%",
                justifyContent: "space-between",
                marginTop: "60px",
              }}
            >
              <Grid className={classes.searchPaperWrapper}>
                <Paper
                  component="form"
                  className={classes.searchPaperMenu}
                  elevation={0}
                 
                >
                  <Select
                    id="name"
                    value={name}
                    fullWidth
                    className={classes.searchMenuItemPaper}
                    onChange={updateName}
                  >
                    <MenuItem value={"credit_note_no"}>
                      &nbsp; &nbsp;&nbsp;Credit Note No
                    </MenuItem>
                    <MenuItem value={"invoice_no"}>
                      &nbsp; &nbsp;&nbsp;Invoice Number
                    </MenuItem>
                  </Select>
                  <InputBase
                    className={classes.input}
                    placeholder={`Search by ${ name==="credit_note_no"?"Credit Note No":"Invoice No"}`}
                    inputProps={{ "aria-label": "search" }}
                    value={creditNoteHistoryList?.[name==="credit_note_no"?"credit_note_no":"invoice_no"]}
                    onChange={(e) => {
                      if (name === "credit_note_no") {
                        dispatch({
                          type: BILLING_CREDIT_NOTE_REDUCER.CREDIT_NOTE_HISTORY,
                          payload: { credit_note_no: e.target.value },
                        });
                      } else {
                        dispatch({
                          type: BILLING_CREDIT_NOTE_REDUCER.CREDIT_NOTE_HISTORY,
                          payload: { invoice_no: e.target.value },
                        });
                      }
                    }}
                    autoComplete="off"
                  />
                  <IconButton
                    type="button"
                    className={classes.iconButton}
                    aria-label="search"
                    onClick={() => {
                      dispatch({
                        type: BILLING_CREDIT_NOTE_REDUCER.CREDIT_NOTE_HISTORY,
                        payload: { pg_no: 1 },
                      });
                      dispatch(fetchCreditNotesHistoryAction(notify));
                    }}
                  >
                    <SearchIcon />
                  </IconButton>
                  <IconButton
                    type="button"
                    aria-label="search"
                    onClick={() => {
                      dispatch({
                        type: BILLING_CREDIT_NOTE_REDUCER.CREDIT_NOTE_HISTORY,
                        payload: { credit_note_no: "" ,invoice_no:""},
                      });
                      dispatch(fetchCreditNotesHistoryAction(notify));
                    }}
                  >
                    <CloseIcon />
                  </IconButton>
                </Paper>
              </Grid>
            </Grid>
            <Modal open={open} onClose={handleClose}>
              <Box className={classes.modalPopUp}>
                <Grid className={classes.clearIcon}>
                  {" "}
                  <ClearIcon onClick={handleClose} />
                </Grid>
                <BillingInvoiceSearch handleClose={handleClose} />
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
                <Box
                  display={"flex"}
                  flexDirection={"row"}
                  justifyContent={"flex-start"}
                  alignItems={"center"}
                  flexWrap={"wrap"}
                >
                  <FormControlLabel
                    value="yes"
                    control={
                      <Radio
                        style={{ color: "#2A5FA5" }}
                        checked={creditNoteHistoryList.bill_type === ""}
                        onClick={() => {
                          dispatch({
                            type: BILLING_CREDIT_NOTE_REDUCER.CREDIT_NOTE_HISTORY,
                            payload: { bill_type: "", pg_no: 1 },
                          });
                          dispatch(fetchCreditNotesHistoryAction(notify));
                        }}
                      />
                    }
                    label="All"
                  />
                  <FormControlLabel
                    value="yes"
                    control={
                      <Radio
                        style={{ color: "#2A5FA5" }}
                        checked={creditNoteHistoryList.bill_type === "Handling"}
                        onClick={() => {
                          dispatch({
                            type: BILLING_CREDIT_NOTE_REDUCER.CREDIT_NOTE_HISTORY,
                            payload: { bill_type: "Handling", pg_no: 1 },
                          });
                          dispatch(fetchCreditNotesHistoryAction(notify));
                        }}
                      />
                    }
                    label="Handling"
                  />
                  <FormControlLabel
                    value="no"
                    control={
                      <Radio
                        style={{ color: "#2A5FA5" }}
                        checked={
                          creditNoteHistoryList.bill_type === "Transportation"
                        }
                        onClick={() => {
                          dispatch({
                            type: BILLING_CREDIT_NOTE_REDUCER.CREDIT_NOTE_HISTORY,
                            payload: { bill_type: "Transportation", pg_no: 1 },
                          });
                          dispatch(fetchCreditNotesHistoryAction(notify));
                        }}
                      />
                    }
                    label="Transportation"
                  />
                  <FormControlLabel
                    value="no"
                    control={
                      <Radio
                        style={{ color: "#2A5FA5" }}
                        checked={creditNoteHistoryList.bill_type === "MNR"}
                        onClick={() => {
                          dispatch({
                            type: BILLING_CREDIT_NOTE_REDUCER.CREDIT_NOTE_HISTORY,
                            payload: { bill_type: "MNR", pg_no: 1 },
                          });
                          dispatch(fetchCreditNotesHistoryAction(notify));
                        }}
                      />
                    }
                    label="MNR"
                  />
                  <FormControlLabel
                    value="no"
                    control={
                      <Radio
                        style={{ color: "#2A5FA5" }}
                        checked={
                          creditNoteHistoryList.bill_type === "Night Charge"
                        }
                        onClick={() => {
                          dispatch({
                            type: BILLING_CREDIT_NOTE_REDUCER.CREDIT_NOTE_HISTORY,
                            payload: { bill_type: "Night Charge", pg_no: 1 },
                          });
                          dispatch(fetchCreditNotesHistoryAction(notify));
                        }}
                      />
                    }
                    label="Night Charge"
                  />
                </Box>

                <Button
                  style={{
                    backgroundColor: "#2A5FA5",
                    color: "white",
                  }}
                  className={classes.refreshButton}
                  onClick={() => {
                    dispatch({
                      type: BILLING_CREDIT_NOTE_REDUCER.CREDIT_NOTE_HISTORY_INIT,
                    });
                    dispatch(fetchCreditNotesHistoryAction(notify));
                  }}
                  startIcon={<RefreshIcon />}
                >
                  Refresh
                </Button>
              </Grid>
            </div>
            <Button
              style={{
                backgroundColor: "#2A5FA5",
                color: "white",
              }}
              className={classes.refreshButtonMobile}
              onClick={() => {
                dispatch({
                  type: BILLING_CREDIT_NOTE_REDUCER.CREDIT_NOTE_HISTORY_INIT,
                });
                dispatch(fetchCreditNotesHistoryAction(notify));
              }}
              startIcon={<RefreshIcon />}
            >
              Refresh
            </Button>
            <CustomReactTable
              enableFooter={true}
              data={creditNoteHistoryList.data || []}
              columns={[...Columns]}
              minRows={creditNoteHistoryList.on_page_data_client}
              prevReactPage={prevStockPage}
              React_pg_no={creditNoteHistoryList.pg_no}
              notify={notify}
              React_total_pages={creditNoteHistoryList.total_pages}
              handleReact_initial_page={handleInitialPage}
              fetchReact_page={handleFetchCreditNote}
              handleReact_change_page={handleCreditNotePageChange}
              handleReact_change_page_data_client={handleCreditNoteChangeRows}
              nextReactPage={nextStockPage}
              next_React_page={creditNoteHistoryList.next_page}
              on_page_data_client={creditNoteHistoryList.on_page_data_client}
            />
          </Grid>
        </Grid>
      </div>
      <Backdrop
        className={classes.backdrop}
        open={creditNoteHistoryList.loading}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
    </LayoutContainer>
  );
};

export default BillingCreditNotesHistory;
