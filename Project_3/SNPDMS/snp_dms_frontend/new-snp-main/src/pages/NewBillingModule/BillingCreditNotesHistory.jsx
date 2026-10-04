import React, { useEffect, useState } from "react";
import LayoutContainer from "@components/reusablecomponents/LayoutContainer";
import {
  Backdrop,
  Box,
  CircularProgress,
  FormControlLabel,
  Grid,
  Radio,
  MenuItem,

} from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import { useSnackbar } from "notistack";
import { jwtDecode } from "jwt-decode";

import { fetchCreditNotesHistoryAction } from "../../actions/BillingCreditNoteAction";
import { BILLING_CREDIT_NOTE_REDUCER } from "../../reducers/BillingCreditNoteReducer";
import { custombackDropStyle } from "../../utils/CustomClasses";
import {
  TableCellText,
  TableCustomAdvanceReactTable,
  TableCustomPaginationReactTable,
  TableCustomSearchBar,
  TableFilterComponent,
  TableHeading,
  TablePageTitle,
  TableRefreshIcon,
} from "../../components/TableComponent/TableComponent";
import { theme } from "@/App";

const BillingCreditNotesHistory = () => {
  const store = useSelector((state) => state);
  const { ui, newBilling } = store;

  const history = useHistory();
  const dispatch = useDispatch();
  const notify = useSnackbar().enqueueSnackbar;
  const [name, setName] = useState("credit_note_no");
  const { BillingCreditNoteReducer } = useSelector((state) => state);
  const { creditNoteHistoryList } = BillingCreditNoteReducer;

  useEffect(() => {
    dispatch(fetchCreditNotesHistoryAction(notify));
  }, []);

  const handleInitialPage = () => {
    dispatch({
      type: BILLING_CREDIT_NOTE_REDUCER.CREDIT_NOTE_HISTORY,
      payload: { pg_no: 1 },
    });
  };

  const Columns = [
    {
      Header: <TableHeading filter>Credit Note No</TableHeading>,
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
            <TableCellText>{row.original.credit_note_no}</TableCellText>
          </div>
        );
      },
    },
    {
      Header: <TableHeading filter>Credit Note Date</TableHeading>,
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
            <TableCellText title={row.original}>
              {row.original.credit_note_date}
            </TableCellText>
          </div>
        );
      },
    },
    {
      Header: <TableHeading filter>Bill Type</TableHeading>,
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
            <TableCellText title={row.original.bill_type}>
              {row.original.bill_type}
            </TableCellText>
          </div>
        );
      },
    },
    {
      Header: <TableHeading filter>Total Amount</TableHeading>,
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
            <TableCellText
              title={row.original.total_amount}
              style={{ color: theme.palette.success.main }}
            >
              {row.original.total_amount}
            </TableCellText>
          </div>
        );
      },
    },
  ];
  // Check if the token is expired if yes then push to login
  useEffect(() => {
    dispatch({
      type: BILLING_CREDIT_NOTE_REDUCER.CREDIT_NOTE_HISTORY,
      payload: { credit_note_no: "", invoice_no: "" },
    });
    var token = localStorage.getItem("accessToken");
    if (token) {
      var decode = jwtDecode(token);

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

  const handleSearchTextChange = (e) => {
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
  };

  const handleCloseClick = () => {
    dispatch({
      type: BILLING_CREDIT_NOTE_REDUCER.CREDIT_NOTE_HISTORY,
      payload: { credit_note_no: "", invoice_no: "" },
    });
    dispatch(fetchCreditNotesHistoryAction(notify));
  };

  const handleSearchClick = () => {
    dispatch({
      type: BILLING_CREDIT_NOTE_REDUCER.CREDIT_NOTE_HISTORY,
      payload: { pg_no: 1 },
    });
    dispatch(fetchCreditNotesHistoryAction(notify));
  };

  const handlePaginationOnChange = (e, val) => {
    dispatch({
      type: BILLING_CREDIT_NOTE_REDUCER.CREDIT_NOTE_HISTORY,
      payload: { pg_no: val },
    });
    dispatch(fetchCreditNotesHistoryAction(notify));
  };

  const handleOnPageDataChange = (value) => {
    dispatch({
      type: BILLING_CREDIT_NOTE_REDUCER.CREDIT_NOTE_HISTORY,
      payload: { pg_no: 1, on_page_data_client: value },
    });
    dispatch(fetchCreditNotesHistoryAction(notify));
  };

  return (
    <LayoutContainer>
      <Box
        sx={(theme) => ({
          paddingX: 2,
          [theme.breakpoints.down("sm")]: {
            paddingX: 1,
          },
        })}
      >
        <Grid container>
          <Grid item size={{ xs: 12 }}>
            <Grid
              container
              spacing={4}
              style={{ marginBottom: 24, marginTop: 4 }}
            >
              <Grid
                item
                size={{ xs: 12, sm: 12, md: 12, lg: 12 }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "flex-start",
                }}
              >
                <TablePageTitle default>Credit Note History</TablePageTitle>
              </Grid>
              <Grid
                item
                size={{ xs: 11, sm: 11, md: 10, lg: 10 }}
                sx={(theme) => ({
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "flex-start",
                  gap: 2,
                  [theme.breakpoints.down("sm")]: {
                    gap: 0,
                  },
                })}
              >
                <TableCustomSearchBar
                  selectName={name.split("_").join(" ")}
                  updateSelectname={updateName}
                  searchText={
                    creditNoteHistoryList?.[
                      name === "credit_note_no"
                        ? "credit_note_no"
                        : "invoice_no"
                    ]
                  }
                  setSearchText={handleSearchTextChange}
                  closeClick={handleCloseClick}
                  searchClick={handleSearchClick}
                >
                  <MenuItem value={"credit_note_no"}>
                    &nbsp; &nbsp;&nbsp;Credit Note No
                  </MenuItem>
                  <MenuItem value={"invoice_no"}>
                    &nbsp; &nbsp;&nbsp;Invoice Number
                  </MenuItem>
                </TableCustomSearchBar>
                <TableFilterComponent
                  title={`${creditNoteHistoryList.bill_type || "ALL"}`}
                  style={{ width: "fit-content" }}
                  activeFilter={true}
                >
                  <Grid item size={{ xs: 12 }}>
                    <FormControlLabel
                      value="yes"
                      control={
                        <Radio
                          size="small"
                          style={{ color: theme.palette.primary.main }}
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
                  </Grid>

                  <Grid item size={{ xs: 12 }}>
                    <FormControlLabel
                      value="yes"
                      control={
                        <Radio
                          size="small"
                          style={{ color: theme.palette.primary.main }}
                          checked={
                            creditNoteHistoryList.bill_type === "Handling"
                          }
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
                  </Grid>
                  <Grid item size={{ xs: 12 }}>
                    <FormControlLabel
                      value="no"
                      control={
                        <Radio
                          size="small"
                          style={{ color: theme.palette.primary.main }}
                          checked={
                            creditNoteHistoryList.bill_type === "Transportation"
                          }
                          onClick={() => {
                            dispatch({
                              type: BILLING_CREDIT_NOTE_REDUCER.CREDIT_NOTE_HISTORY,
                              payload: {
                                bill_type: "Transportation",
                                pg_no: 1,
                              },
                            });
                            dispatch(fetchCreditNotesHistoryAction(notify));
                          }}
                        />
                      }
                      label="Transportation"
                    />
                  </Grid>
                  <Grid item size={{ xs: 12 }}>
                    <FormControlLabel
                      value="no"
                      control={
                        <Radio
                          size="small"
                          style={{ color: theme.palette.primary.main }}
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
                  </Grid>
                  <Grid item size={{ xs: 12 }}>
                    <FormControlLabel
                      value="no"
                      control={
                        <Radio
                          size="small"
                          style={{ color: theme.palette.primary.main }}
                          checked={
                            creditNoteHistoryList.bill_type === "Night Charge"
                          }
                          onClick={() => {
                            dispatch({
                              type: BILLING_CREDIT_NOTE_REDUCER.CREDIT_NOTE_HISTORY,
                              payload: {
                                bill_type: "Night Charge",
                                pg_no: 1,
                              },
                            });
                            dispatch(fetchCreditNotesHistoryAction(notify));
                          }}
                        />
                      }
                      label="Night Charge"
                    />
                  </Grid>
                </TableFilterComponent>
              </Grid>

              <Grid
                size={{ xs: 1, sm: 1, md: 2, lg: 2 }}
                item
                style={{ textAlign: "right" }}
              >
                <TableRefreshIcon
                  onClick={() => {
                    dispatch({
                      type: BILLING_CREDIT_NOTE_REDUCER.CREDIT_NOTE_HISTORY_INIT,
                    });
                    dispatch(fetchCreditNotesHistoryAction(notify));
                  }}
                />
              </Grid>
            </Grid>

            <TableCustomAdvanceReactTable
              data={creditNoteHistoryList.data || []}
              columns={[...Columns]}
              minRows={Number(creditNoteHistoryList.on_page_data_client)}
              pageSize={Number(creditNoteHistoryList.on_page_data_client)}
              defaultPageSize={Number(
                creditNoteHistoryList.on_page_data_client,
              )}
            />
            <TableCustomPaginationReactTable
              pg_no={creditNoteHistoryList.pg_no}
              total_pages={creditNoteHistoryList.total_pages}
              handleInitialPage={handleInitialPage}
              on_page_data={creditNoteHistoryList.on_page_data_client}
              next_page={creditNoteHistoryList.next_page}
              handleOnPageDataChange={handleOnPageDataChange}
              handlePaginationOnChange={handlePaginationOnChange}
            />
          </Grid>
        </Grid>
      </Box>
      <Backdrop sx={custombackDropStyle} open={creditNoteHistoryList.loading}>
        <CircularProgress color="inherit" />
      </Backdrop>
    </LayoutContainer>
  );
};

export default BillingCreditNotesHistory;
