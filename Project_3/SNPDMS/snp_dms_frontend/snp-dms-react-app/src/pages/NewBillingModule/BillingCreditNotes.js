import React, { useEffect, useState } from "react";
import LayoutContainer from "../../components/reusableComponents/LayoutContainer";
import {
  Backdrop,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  FormControl,
  IconButton,
  InputBase,
  InputLabel,
  makeStyles,
  MenuItem,
  Paper,
  Select,
  Typography,
} from "@material-ui/core";
import CloseIcon from "@mui/icons-material/Close";
import { useSnackbar } from "notistack";
import { useDispatch, useSelector } from "react-redux";
import { Stack } from "@mui/material";
import ReactTable from "react-table-v6";
import "react-table-v6/react-table.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSort } from "@fortawesome/free-solid-svg-icons";
import {
  getCreditNoteByInvoiceAction,
  getCreditNotePrefillByContainerAction,
  getCreditNotePrefillByContainerMNRAction,
} from "../../actions/BillingCreditNoteAction";
import { BILLING_CREDIT_NOTE_REDUCER } from "../../reducers/BillingCreditNoteReducer";
import { useHistory } from "react-router-dom";

const useStyles = makeStyles((theme) => ({
  backdrop: {
    zIndex: theme.zIndex.drawer + 1,
    color: "#fff",
  },
  searchPaper: {
    padding: "40px 0px",
    backgroundColor: "transparent",
    borderRadius: 10,
    color: theme.palette.text.primary,
    position: "relative",
    width: "80%",
  },
  input: {
    marginLeft: theme.spacing(1),
    flex: 1,
    padding: 7,
    [theme.breakpoints.down("xs")]: {
      padding: 1,
      fontSize: "0.8rem",
    },
  },
  inputProcess: {
    marginLeft: theme.spacing(1),
    flex: 1,
    padding: "0 10px",
    [theme.breakpoints.down("xs")]: {
      padding: 1,
      fontSize: "0.8rem",
    },
  },
  iconButton: {
    padding: 6,
  },
  searchResultContainer: {
    position: "absolute",
    top: 90,
    left: 0,
    width: "80%",
    marginLeft: "30px",
    zIndex: 10,
    borderTopRightRadius: 0,
    borderTopLeftRadius: 0,
  },
  downloadButton: {
    backgroundColor: "green",
    color: "white",
    "&:hover": {
      backgroundColor: "green",
    },
  },
  creditNoteButton: {
    backgroundColor: "rgb(42,192,143)",
    "&:hover": {
      backgroundColor: "rgb(42,192,143)",
    },
  },
  searchButton: {
    backgroundColor: "#FDBD2E",
    color: "#fff",
    borderRadius: "0.5rem",
    padding: "1px 4px",
    height: 40,
    width: "200px",
    "&:hover": {
      backgroundColor: "#FDBD2E",
      color: "#fff",
    },
    [theme.breakpoints.down("xs")]: {
      // padding: "1px 4px",
      paddingRight: 3,
      height: 35,
    },
  },
}));

const BillingCreditNotes = (props) => {
  const classes = useStyles();
  const notify = useSnackbar().enqueueSnackbar;
  const dispatch = useDispatch();
  const history = useHistory();
  const [showDropdown, setDropdown] = React.useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);
  const [checkAll, setCheckAll] = useState(false);
  const { BillingCreditNoteReducer } = useSelector((state) => state);
  const { creditNoteSearch } = BillingCreditNoteReducer;

  useEffect(() => {
    if (
      props.location.state?.invoice_no &&
      props.location.state?.bill_type === "Other"
    ) {
      dispatch({
        type: BILLING_CREDIT_NOTE_REDUCER.CREDIT_NOTE_SEARCH,
        payload: {
          bill_type: "Other",
          invoice_number: props.location.state?.invoice_no,
        },
      });
      dispatch(getCreditNoteByInvoiceAction(notify));
    }

    if (
      props.location.state?.invoice_no &&
      props.location.state?.bill_type === "Repair/Washing"
    ) {
      dispatch({
        type: BILLING_CREDIT_NOTE_REDUCER.CREDIT_NOTE_SEARCH,
        payload: {
          bill_type: "Repair/Washing",
          invoice_number: props.location.state?.invoice_no,
        },
      });
      dispatch(getCreditNoteByInvoiceAction(notify));
    }
  }, []);

  const handleClickAway = () => {
    setDropdown(false);
  };

  const handleSearchButton = () => {
    dispatch(getCreditNoteByInvoiceAction(notify));
  };

  const checkAllRows = (val) => {
    if (val) {
      setSelectedRows([]);
    } else {
      let allData = creditNoteSearch?.data?.map((val) => ({
        pk: val.pk,
        container_no: val.container_no,
        enabled: true,
      }));
      setSelectedRows(allData);
    }
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
  };

  const handleCreditNoteCollect = () => {
    let containers_list = selectedRows.map((item) => item.pk);
    if (creditNoteSearch.bill_type === "Repair/Washing") {
      dispatch(
        getCreditNotePrefillByContainerMNRAction(
          containers_list,
          history,
          notify
        )
      );
    } else {
      dispatch(
        getCreditNotePrefillByContainerAction(containers_list, history, notify)
      );
    }
  };

  const Columns = [
    {
      Header: (
        <div>
          <Checkbox
            checked={selectedRows?.length === creditNoteSearch?.data?.length}
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
                handleCheck(
                  row.original.pk,
                  row.original.container_no,
                  row.original.is_gatein_done
                );
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
          Container No <FontAwesomeIcon icon={faSort} />
        </b>
      ),
      accessor: "container_no",
      style: {
        textAlign: "center",
      },
      Cell: (row) => {
        return (
          <div>
            <span
              title={row.original.container_no}
              style={{ textAlign: "center" }}
            >
              {row.original.container_no}
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
            <span title={row.original.client} style={{ textAlign: "center" }}>
              {row.original.client}
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
      },
      Cell: (row) => {
        return (
          <div>
            <span
              title={row.original.bill_type}
              style={{ textAlign: "center" }}
            >
              {row.original.bill_type}
            </span>
          </div>
        );
      },
    },
    {
      Header: (
        <b style={{ color: "#2A5FA5" }}>
          Amount <FontAwesomeIcon icon={faSort} />
        </b>
      ),
      accessor: "original_amount",
      style: {
        textAlign: "center",
      },
      Cell: (row) => {
        return (
          <div>
            <span
              title={row.original.original_amount}
              style={{ textAlign: "center" }}
            >
              {row.original.original_amount}
            </span>
          </div>
        );
      },
    },
  ];

  return (
    <LayoutContainer>
      <Typography variant="h6">Credit Notes</Typography>
      <Box mt={4}></Box>
      <Paper component="form" className={classes.searchPaper} elevation={0}>
        <Stack
          direction={"row"}
          alignItems={"center"}
          justifyContent={"center"}
          style={{ backgroundColor: "#dfe6ec", borderRadius: "5px" }}
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
              }}
            ></InputLabel>
            <Select
              id="=container_list_select"
              value={creditNoteSearch.bill_type}
              defaultValue={creditNoteSearch.bill_type}
              labelId="container_list_select_label"
              name="client"
              label="  Reciept Type"
              variant="standard"
              onChange={(e) =>
                dispatch({
                  type: BILLING_CREDIT_NOTE_REDUCER.CREDIT_NOTE_SEARCH,
                  payload: { bill_type: e.target.value },
                })
              }
              className={classes.inputProcess}
              inputProps={{
                style: {
                  padding: "0px 10px",
                  marginTop: "-10px",
                },
              }}
              style={{
                width: "200px",
                backgroundColor: "white",
                borderRadius: "5px",
              }}
            >
              <MenuItem key={"Repair/Washing"} value="Repair/Washing">
                Repair/Washing
              </MenuItem>
              <MenuItem key={"Other"} value="Other">
                Other
              </MenuItem>
            </Select>
          </FormControl>

          <InputBase
            id="container-search"
            name="searchText"
            className={classes.input}
            placeholder="Search for a Invoice Number"
            inputProps={{ "aria-label": "search" }}
            value={creditNoteSearch.invoice_number}
            onChange={(e) =>
              dispatch({
                type: BILLING_CREDIT_NOTE_REDUCER.CREDIT_NOTE_SEARCH,
                payload: { invoice_number: e.target.value },
              })
            }
            autoComplete="off"
          />
          {loading ? (
            <CircularProgress
              size={30}
              style={{ marginRight: "10px" }}
            ></CircularProgress>
          ) : (
            <IconButton
              onClick={() =>
                dispatch({
                  type: BILLING_CREDIT_NOTE_REDUCER.CREDIT_NOTE_SEARCH,
                  payload: { invoice_number: "" },
                })
              }
            >
              <CloseIcon />
            </IconButton>
          )}

          <Button className={classes.searchButton} onClick={handleSearchButton}>
            Search
          </Button>
        </Stack>
      </Paper>
      <Stack
        direction={"row"}
        alignItems={"center"}
        justifyContent={"flex-end"}
        spacing={2}
      >
        {selectedRows.length > 0 && (
          <Button
            variant="contained"
            color="primary"
            className={classes.creditNoteButton}
            onClick={handleCreditNoteCollect}
          >
            Collect Credit Note
          </Button>
        )}

        <Button
          variant="contained"
          color="primary"
          onClick={() => {
            setSelectedRows([]);
            dispatch({
              type: BILLING_CREDIT_NOTE_REDUCER.CREDIT_NOTE_SEARCH_INIT,
            });
          }}
        >
          Refresh
        </Button>
      </Stack>
      <Box component={Paper} elevation={0} mt={1}>
        <ReactTable
          data={creditNoteSearch.data || []}
          columns={[...Columns]}
          minRows={5}
          collapseOnDataChange={false}
          className={classes.tableListing}
          style={{
            alignItems: "center",
            textAlign: "center",
            display: "flex",
            justifyContent: "center",
            width: "100%", // This will force the table body to overflow and scroll, since there is not enough room
          }}
          showPagination={false}
          defaultPageSize={creditNoteSearch?.data?.length}
          pageSize={creditNoteSearch?.data?.length}
        />
      </Box>
      <Backdrop className={classes.backdrop} open={creditNoteSearch.loading}>
        <CircularProgress color="inherit" />
      </Backdrop>
    </LayoutContainer>
  );
};

export default BillingCreditNotes;
