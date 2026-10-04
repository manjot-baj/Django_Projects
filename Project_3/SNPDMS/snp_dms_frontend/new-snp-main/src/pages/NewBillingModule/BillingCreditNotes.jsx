import React, { useEffect, useState } from "react";
import LayoutContainer from "@components/reusablecomponents/LayoutContainer";
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
  MenuItem,
  Paper,
  Select,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useSnackbar } from "notistack";
import { useDispatch, useSelector } from "react-redux";
import { Stack } from "@mui/material";


import {
  getCreditNoteByInvoiceAction,
  getCreditNotePrefillByContainerAction,
  getCreditNotePrefillByContainerMNRAction,
} from "../../actions/BillingCreditNoteAction";
import { BILLING_CREDIT_NOTE_REDUCER } from "../../reducers/BillingCreditNoteReducer";
import { useHistory } from "react-router-dom";
import { custombackDropStyle } from "../../utils/CustomClasses";
import { theme } from "../../App";
import {
  TableCustomAdvanceReactTable,
  TableHeading,
  TableRefreshIcon,
} from "@/components/TableComponent/TableComponent";

const BillingCreditNotes = (props) => {
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
      Header: <TableHeading filter>Container No</TableHeading>,
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
      Header: <TableHeading filter>Client</TableHeading>,
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
      Header: <TableHeading filter>Bill Type</TableHeading>,
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
      Header: <TableHeading filter>Amount</TableHeading>,
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
      <Box mt={2}></Box>
      <Paper
        component="form"
        sx={{
          padding: "20px 0px",
          backgroundColor: "transparent",
          borderRadius: 10,
          color: theme.palette.text.primary,
          position: "relative",
          width: "80%",
        }}
        elevation={0}
      >
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
              sx={(theme) => ({
                marginLeft: theme.spacing(1),
                flex: 1,
                padding: "0 10px",
                [theme.breakpoints.down("xs")]: {
                  padding: 1,
                  fontSize: "0.8rem",
                },
              })}
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
            sx={(theme) => ({
              marginLeft: theme.spacing(1),
              flex: 1,
              padding: 1,
              [theme.breakpoints.down("xs")]: {
                padding: 1,
                fontSize: "0.8rem",
              },
            })}
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

          <Button
            variant="contained"
            color="warning"
            sx={{ width: 240, mr: 2 }}
            onClick={handleSearchButton}
          >
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
            color="success"
            onClick={handleCreditNoteCollect}
          >
            Collect Credit Note
          </Button>
        )}
        <TableRefreshIcon
          onClick={() => {
            setSelectedRows([]);
            dispatch({
              type: BILLING_CREDIT_NOTE_REDUCER.CREDIT_NOTE_SEARCH_INIT,
            });
          }}
        />
      </Stack>
      <Box component={Paper} elevation={0} mt={1}>
        <TableCustomAdvanceReactTable
          data={creditNoteSearch.data || []}
          columns={[...Columns]}
          minRows={5}
        />
      </Box>
      <Backdrop sx={custombackDropStyle} open={creditNoteSearch.loading}>
        <CircularProgress color="inherit" />
      </Backdrop>
    </LayoutContainer>
  );
};

export default BillingCreditNotes;
